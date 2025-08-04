import { requireAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { OpenAI } from 'openai';

// 配置 OpenAI (使用 Inference.net 平台)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.inference.net/v1',
});

// 获取可用模型列表
const getAvailableModels = () => {
    const modelsStr = process.env.CHAT_AVAILABLE_MODELS || 'qwen/qwen2.5-7b-instruct/bf-16,google/gemma-3-27b-instruct/bf-16';
    return modelsStr.split(',').map(model => model.trim());
};

// 获取默认模型
const getDefaultModel = () => {
    return process.env.CHAT_DEFAULT_MODEL || 'google/gemma-3-27b-instruct/bf-16';
};

// 生成唯一ID
const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export async function POST(request: NextRequest) {
    try {
        // 验证用户认证
        const user = await requireAuth(request);
        const { message, conversationId, model } = await request.json();

        if (!message) {
            return new Response('Message is required', { status: 400 });
        }

        // 验证模型是否在可用列表中
        const availableModels = getAvailableModels();
        const selectedModel = model && availableModels.includes(model) ? model : getDefaultModel();

        // 获取或创建对话历史
        let conversation = null;
        if (conversationId) {
            conversation = await prisma.conversation.findFirst({
                where: {
                    id: conversationId,
                    userId: user.id
                },
                include: {
                    messages: {
                        orderBy: { createdAt: 'asc' }
                    }
                }
            });
        }

        if (!conversation) {
            // 创建新对话
            conversation = await prisma.conversation.create({
                data: {
                    id: conversationId || generateId(),
                    userId: user.id,
                    title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
                    model: selectedModel
                }
            });

            // 查询创建的对话以包含messages关系
            conversation = await prisma.conversation.findUniqueOrThrow({
                where: { id: conversation.id },
                include: {
                    messages: {
                        orderBy: { createdAt: 'asc' }
                    }
                }
            });
        }

        // 保存用户消息
        const userMessage = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                role: 'user',
                content: message,
                userId: user.id,
                model: selectedModel
            }
        });

        // 构建对话历史（限制消息数量以控制token消耗）
        const recentMessages = conversation.messages?.slice(-10) || []; // 只保留最近10条消息
        const messages = [
            {
                role: 'system' as const,
                content: '你是一个专业的AI写作助手，能够帮助用户优化文本、检查语法、提供写作建议和创作灵感。请用中文回答，回复要简洁明了。'
            },
            ...recentMessages.map(msg => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content
            })),
            {
                role: 'user' as const,
                content: message
            }
        ];

        console.log('Chat API: 开始调用 OpenAI，模型:', selectedModel);

        // 调用 OpenAI API - 使用流式响应
        const startTime = Date.now();
        const completion = await openai.chat.completions.create({
            model: selectedModel,
            messages,
            max_tokens: parseInt(process.env.CHAT_MAX_TOKENS || '1000'),
            temperature: parseFloat(process.env.CHAT_TEMPERATURE || '0.7'),
            stream: true,
        });

        console.log('Chat API: OpenAI 流式响应开始');

        // 创建流式响应
        const encoder = new TextEncoder();
        let assistantMessage = '';
        let assistantMessageId = '';

        const readableStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of completion) {
                        const content = chunk.choices[0]?.delta?.content || '';
                        if (content) {
                            assistantMessage += content;

                            const data = {
                                type: 'content',
                                content: content,
                                conversationId: conversation.id
                            };

                            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                        }
                    }

                    const endTime = Date.now();
                    const responseTime = endTime - startTime;

                    // 保存助手回复到数据库
                    const savedAssistantMessage = await prisma.message.create({
                        data: {
                            conversationId: conversation.id,
                            role: 'assistant',
                            content: assistantMessage,
                            userId: user.id,
                            model: selectedModel,
                            responseTime: responseTime,
                            totalTokens: estimateTokens(assistantMessage),
                            outputTokens: estimateTokens(assistantMessage)
                        }
                    });

                    // 更新用户消息的token信息
                    await prisma.message.update({
                        where: { id: userMessage.id },
                        data: {
                            totalTokens: estimateTokens(message),
                            inputTokens: estimateTokens(message)
                        }
                    });

                    assistantMessageId = savedAssistantMessage.id;

                    // 计算对话统计数据
                    const totalInputTokens = estimateTokens(message);
                    const totalOutputTokens = estimateTokens(assistantMessage);
                    const totalTokens = totalInputTokens + totalOutputTokens;
                    const estimatedCost = calculateCost(selectedModel, totalInputTokens, totalOutputTokens);

                    // 更新对话统计信息
                    await prisma.conversation.update({
                        where: { id: conversation.id },
                        data: {
                            updatedAt: new Date(),
                            lastMessageAt: new Date(),
                            messageCount: { increment: 2 }, // 用户消息 + 助手消息
                            totalTokens: { increment: totalTokens },
                            inputTokens: { increment: totalInputTokens },
                            outputTokens: { increment: totalOutputTokens },
                            totalCost: { increment: estimatedCost },
                            modelProvider: getModelProvider(selectedModel),
                            modelVersion: selectedModel
                        }
                    });

                    // 异步收集和存储统计数据（不阻塞响应）
                    collectAnalyticsData(user.id, conversation.id, {
                        model: selectedModel,
                        inputTokens: totalInputTokens,
                        outputTokens: totalOutputTokens,
                        totalTokens: totalTokens,
                        cost: estimatedCost,
                        responseTime: responseTime
                    }).catch(error => {
                        console.error('Failed to collect analytics data:', error);
                        // 不抛出错误，避免影响用户体验
                    });

                    // 发送完成信号
                    const completeData = {
                        type: 'complete',
                        conversationId: conversation.id,
                        messageId: assistantMessageId,
                        responseTime: responseTime
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(completeData)}\n\n`));
                    controller.close();

                } catch (error) {
                    console.error('Chat API 流式处理错误:', error);

                    // 记录错误到数据库
                    if (conversation) {
                        await prisma.conversation.update({
                            where: { id: conversation.id },
                            data: {
                                updatedAt: new Date()
                            }
                        });
                    }

                    const errorData = {
                        type: 'error',
                        error: error instanceof Error ? error.message : '生成回复时出现错误',
                        conversationId: conversation?.id
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
                    controller.close();
                }
            }
        });

        return new Response(readableStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });

    } catch (error) {
        console.error('Chat API Error:', error);

        if (error instanceof Error && error.message.includes('out of capacity')) {
            return new Response(JSON.stringify({
                error: 'AI 服务暂时不可用，请稍后再试'
            }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : '未知错误'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function OPTIONS(request: NextRequest) {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

// Token估算函数（简化版本）
function estimateTokens(text: string): number {
    // 简化的token估算：大约4个字符 = 1个token
    return Math.ceil(text.length / 4);
}

// 成本计算函数
function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    // 基于不同模型的定价（示例定价）
    const pricing: { [key: string]: { input: number; output: number } } = {
        'qwen/qwen2.5-7b-instruct/bf-16': { input: 0.0001, output: 0.0001 },
        'google/gemma-3-27b-instruct/bf-16': { input: 0.0002, output: 0.0002 },
        'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
        'gpt-4': { input: 0.03, output: 0.06 }
    };

    const modelPricing = pricing[model] || pricing['qwen/qwen2.5-7b-instruct/bf-16'];

    return (inputTokens * modelPricing.input + outputTokens * modelPricing.output) / 1000;
}

// 获取模型提供商
function getModelProvider(model: string): string {
    if (model.includes('qwen')) return 'alibaba';
    if (model.includes('gemma') || model.includes('google')) return 'google';
    if (model.includes('gpt')) return 'openai';
    return 'unknown';
}

// 异步收集和存储统计数据
async function collectAnalyticsData(
    userId: string,
    conversationId: string,
    data: {
        model: string;
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
        cost: number;
        responseTime: number;
    }
) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 更新或创建用户每日统计
        await prisma.userStatistics.upsert({
            where: {
                userId_date: {
                    userId: userId,
                    date: today
                }
            },
            update: {
                messageCount: { increment: 2 }, // 用户消息 + AI消息
                totalTokens: { increment: data.totalTokens },
                totalCost: { increment: data.cost },
                totalDuration: { increment: Math.round(data.responseTime / 1000) }, // 转换为秒
                // 更新模型使用统计
                modelUsage: {
                    // 这里需要自定义逻辑来更新JSON字段
                }
            },
            create: {
                userId: userId,
                date: today,
                conversationCount: 1,
                messageCount: 2,
                totalTokens: data.totalTokens,
                totalCost: data.cost,
                totalDuration: Math.round(data.responseTime / 1000),
                modelUsage: {
                    [data.model]: 1
                }
            }
        });

        // 更新或创建模型每日统计
        const modelProvider = getModelProvider(data.model);

        await prisma.modelStatistics.upsert({
            where: {
                model_modelProvider_date: {
                    model: data.model,
                    modelProvider: modelProvider,
                    date: today
                }
            },
            update: {
                requestCount: { increment: 1 },
                totalTokens: { increment: data.totalTokens },
                totalCost: { increment: data.cost },
                // 更新响应时间统计
                avgResponseTime: data.responseTime // 这里可能需要更复杂的平均值计算
            },
            create: {
                model: data.model,
                modelProvider: modelProvider,
                date: today,
                requestCount: 1,
                userCount: 1, // 这里可能需要查询当天使用该模型的唯一用户数
                totalTokens: data.totalTokens,
                totalCost: data.cost,
                avgResponseTime: data.responseTime,
                maxResponseTime: data.responseTime,
                minResponseTime: data.responseTime,
                avgRating: null,
                errorRate: 0
            }
        });

        console.log('Analytics data collected successfully for user:', userId);

    } catch (error) {
        console.error('Error collecting analytics data:', error);
        // 可以选择记录到错误日志表
    }
} 