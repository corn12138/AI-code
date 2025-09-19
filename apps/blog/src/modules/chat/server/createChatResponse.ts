import { OpenAI } from 'openai';
import type { AuthUser } from '@/lib/auth';
import { requireEnv } from '@/utils/env';
import { collectAnalyticsData } from './analytics';
import {
    prepareConversation,
    persistAssistantMessage,
    updateMessageTokenUsage,
    updateConversationStats,
} from './chatService';
import { estimateTokens } from './metrics';

interface ChatPayload {
    message: string;
    conversationId?: string;
    model?: string;
}

const encoder = new TextEncoder();

function resolveModel(requestedModel?: string) {
    const available = (process.env.CHAT_AVAILABLE_MODELS || '').split(',').map((item) => item.trim()).filter(Boolean);
    const defaultModel = process.env.CHAT_DEFAULT_MODEL?.trim() || 'google/gemma-3-27b-instruct/bf-16';

    if (requestedModel && available.includes(requestedModel)) {
        return requestedModel;
    }

    if (available.length > 0) {
        return available.includes(defaultModel) ? defaultModel : available[0];
    }

    return defaultModel;
}

function createOpenAIClient() {
    const apiKey = requireEnv('OPENAI_API_KEY', 'OpenAI API key is not configured');
    const baseURL = process.env.OPENAI_BASE_URL || 'https://api.inference.net/v1';
    return new OpenAI({ apiKey, baseURL });
}

export async function createChatResponse(user: AuthUser, payload: ChatPayload) {
    if (!payload.message || !payload.message.trim()) {
        return new Response(JSON.stringify({ error: 'Message is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const model = resolveModel(payload.model);
    const openai = createOpenAIClient();

    const startTime = Date.now();

    const { conversation, chatHistory, userMessage } = await prepareConversation({
        user,
        message: payload.message,
        conversationId: payload.conversationId,
        model,
    });

    const completion = await openai.chat.completions.create({
        model,
        messages: chatHistory,
        max_tokens: parseInt(process.env.CHAT_MAX_TOKENS || '1000'),
        temperature: parseFloat(process.env.CHAT_TEMPERATURE || '0.7'),
        stream: true,
    });

    let assistantContent = '';
    let resolvedConversationId = conversation.id;
    let assistantMessageId = '';

    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                        assistantContent += content;
                        controller.enqueue(encodeSse({
                            type: 'content',
                            content,
                            conversationId: resolvedConversationId,
                        }));
                    }
                }

                const endTime = Date.now();
                const responseTime = endTime - startTime;

                const assistantMessage = await persistAssistantMessage(
                    resolvedConversationId,
                    user.id,
                    model,
                    assistantContent,
                    responseTime,
                );

                assistantMessageId = assistantMessage.id;

                await updateMessageTokenUsage(userMessage.id, payload.message);

                const inputTokens = estimateTokens(payload.message);
                const outputTokens = estimateTokens(assistantContent);

                const { totalTokens, estimatedCost } = await updateConversationStats(
                    resolvedConversationId,
                    model,
                    inputTokens,
                    outputTokens,
                    responseTime,
                );

                collectAnalyticsData(user.id, resolvedConversationId, {
                    model,
                    inputTokens,
                    outputTokens,
                    totalTokens,
                    cost: estimatedCost,
                    responseTime,
                }).catch((error) => {
                    console.error('Failed to collect analytics data:', error);
                });

                controller.enqueue(encodeSse({
                    type: 'complete',
                    conversationId: resolvedConversationId,
                    messageId: assistantMessageId,
                    responseTime,
                }));
                controller.close();
            } catch (error) {
                console.error('Chat streaming error:', error);
                controller.enqueue(encodeSse({
                    type: 'error',
                    error: error instanceof Error ? error.message : '生成回复时出现错误',
                    conversationId: resolvedConversationId,
                }));
                controller.close();
            }
        },

        cancel(reason) {
            console.warn('Chat stream cancelled:', reason);
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

function encodeSse(event: Record<string, unknown>) {
    return encoder.encode(`data: ${JSON.stringify(event)}\n\n`);
}
