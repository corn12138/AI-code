
import { EnterpriseAISystem } from '../EnterpriseAISystem';

/**
 * 企业级AI系统完整使用示例
 * 
 * 此示例展示了如何初始化和使用整个AI系统，包括：
 * - LLM API集成 (OpenAI, Claude)
 * - 工具调用协议系统 (28种工具)
 * - WebSocket/SSE实时通信
 * - TensorFlow.js前端模型部署
 * - 高性能前端架构优化
 * - LangChain集成框架
 * - 企业级监控和性能优化
 */

// 配置示例：开发环境
const developmentConfig = {
    llm: {
        providers: [
            {
                id: 'openai-dev',
                type: 'openai' as const,
                apiKey: process.env.OPENAI_API_KEY || '',
                baseURL: 'https://api.openai.com/v1',
                models: ['gpt-4', 'gpt-3.5-turbo'],
                priority: 1
            }
        ],
        routing: { strategy: 'priority' as const },
        fallback: { enabled: true, maxRetries: 2 },
        caching: { enabled: true, ttl: 300 }
    },
    realtime: {
        enabled: true,
        url: 'ws://localhost:3001/realtime',
        preset: 'DEVELOPMENT' as const
    },
    langchain: {
        enabled: true,
        preset: 'CONVERSATIONAL_AI' as const
    },
    monitoring: {
        enabled: true,
        preset: 'DEVELOPMENT' as const
    },
    tensorflow: {
        enabled: true,
        preset: 'NLP_BASIC' as const
    },
    environment: 'development' as const,
    features: {
        aiChat: true,
        toolExecution: true,
        realtimeUpdates: true,
        performanceMonitoring: true,
        aiModels: true,
        voiceInteraction: false,
        multimodalSupport: false
    },
    security: {
        enableRateLimit: false, // 开发环境关闭限流
        enableContentFilter: true,
        enableAuditLog: true,
        maxRequestsPerMinute: 1000
    }
};

// 配置示例：生产环境
const productionConfig = {
    llm: {
        providers: [
            {
                id: 'openai-prod',
                type: 'openai' as const,
                apiKey: process.env.OPENAI_API_KEY || '',
                baseURL: 'https://api.openai.com/v1',
                models: ['gpt-4', 'gpt-3.5-turbo'],
                priority: 1
            },
            {
                id: 'claude-fallback',
                type: 'claude' as const,
                apiKey: process.env.CLAUDE_API_KEY || '',
                baseURL: 'https://api.anthropic.com',
                models: ['claude-3-opus', 'claude-3-sonnet'],
                priority: 2
            }
        ],
        routing: { strategy: 'round_robin' as const },
        fallback: { enabled: true, maxRetries: 3 },
        caching: { enabled: true, ttl: 600 },
        costOptimization: {
            enabled: true,
            maxCostPerRequest: 0.10,
            dailyBudget: 100.00
        }
    },
    realtime: {
        enabled: true,
        url: 'wss://api.yourcompany.com/realtime',
        preset: 'CHAT_APP' as const
    },
    langchain: {
        enabled: true,
        preset: 'CONVERSATIONAL_TOOL_AGENT' as const
    },
    monitoring: {
        enabled: true,
        preset: 'PRODUCTION' as const
    },
    tensorflow: {
        enabled: true,
        preset: 'NLP_ADVANCED' as const
    },
    environment: 'production' as const,
    features: {
        aiChat: true,
        toolExecution: true,
        realtimeUpdates: true,
        performanceMonitoring: true,
        aiModels: true,
        voiceInteraction: true,
        multimodalSupport: true
    },
    security: {
        enableRateLimit: true,
        enableContentFilter: true,
        enableAuditLog: true,
        maxRequestsPerMinute: 100
    }
};

// 主要使用示例类
export class EnterpriseAISystemExample {
    private aiSystem: EnterpriseAISystem;

    constructor(environment: 'development' | 'production' = 'development') {
        const config = environment === 'production' ? productionConfig : developmentConfig;
        this.aiSystem = new EnterpriseAISystem(config);
    }

    // 示例1：基础系统初始化和健康检查
    async basicInitializationExample(): Promise<void> {
        console.log('=== 企业级AI系统初始化示例 ===');

        try {
            // 初始化系统
            await this.aiSystem.initialize();

            // 获取系统状态
            const status = this.aiSystem.getStatus();
            console.log('系统状态:', status);

            // 获取系统能力
            const capabilities = this.aiSystem.getCapabilities();
            console.log('系统能力:', capabilities);

            // 生成健康报告
            const healthReport = await this.aiSystem.getHealthReport();
            console.log('健康报告:', healthReport);

        } catch (error) {
            console.error('初始化失败:', error);
        }
    }

    // 示例2：AI对话交互
    async aiChatExample(): Promise<void> {
        console.log('=== AI对话交互示例 ===');

        try {
            // 简单对话
            const response1 = await this.aiSystem.processChatRequest({
                message: '你好，请介绍一下你的能力',
                conversationId: 'demo-conversation-1',
                userId: 'user-123'
            });
            console.log('AI回复:', response1);

            // 带上下文的对话
            const response2 = await this.aiSystem.processChatRequest({
                message: '我需要分析一段文本的情感',
                conversationId: 'demo-conversation-1',
                userId: 'user-123',
                context: {
                    previousTopic: '介绍能力',
                    userPreference: 'technical_details'
                }
            });
            console.log('上下文对话回复:', response2);

            // 多轮对话
            const response3 = await this.aiSystem.processChatRequest({
                message: '这段文本："我今天非常开心，因为项目终于完成了！"',
                conversationId: 'demo-conversation-1',
                userId: 'user-123'
            });
            console.log('多轮对话回复:', response3);

        } catch (error) {
            console.error('AI对话失败:', error);
        }
    }

    // 示例3：工具执行与AI指导
    async toolExecutionExample(): Promise<void> {
        console.log('=== 工具执行与AI指导示例 ===');

        try {
            // 使用AI指导执行情感分析工具
            const sentimentResult = await this.aiSystem.executeToolWithAI(
                'analyze_sentiment',
                { text: '这个产品真的太棒了！我非常喜欢它的设计。' },
                '请分析这段用户评论的情感倾向，并提供详细的分析报告'
            );
            console.log('情感分析结果:', sentimentResult);

            // 使用AI指导执行毒性检测工具
            const toxicityResult = await this.aiSystem.executeToolWithAI(
                'detect_toxicity',
                { text: '这个功能很好用，推荐给大家！' },
                '检测这段文本是否包含有害内容'
            );
            console.log('毒性检测结果:', toxicityResult);

            // 使用AI指导执行文本相似度计算
            const similarityResult = await this.aiSystem.executeToolWithAI(
                'text_similarity',
                {
                    text1: '我喜欢这个产品',
                    text2: '这个产品很棒'
                },
                '计算这两段文本的语义相似度'
            );
            console.log('文本相似度结果:', similarityResult);

        } catch (error) {
            console.error('工具执行失败:', error);
        }
    }

    // 示例4：实时通信集成
    async realtimeCommunicationExample(): Promise<void> {
        console.log('=== 实时通信集成示例 ===');

        // 监听系统事件
        this.aiSystem.on('system:initialized', (data) => {
            console.log('系统初始化完成:', data);
        });

        this.aiSystem.on('system:error', (data) => {
            console.error('系统错误:', data);
        });

        // 模拟实时聊天场景
        const simulateRealtimeChat = async () => {
            const messages = [
                '你好，我想了解你的功能',
                '你能帮我分析文本情感吗？',
                '这段文本："今天天气真好！" 的情感如何？',
                '谢谢你的帮助！'
            ];

            for (let i = 0; i < messages.length; i++) {
                console.log(`用户消息 ${i + 1}: ${messages[i]}`);

                const response = await this.aiSystem.processChatRequest({
                    message: messages[i],
                    conversationId: 'realtime-demo',
                    userId: 'realtime-user'
                });

                console.log(`AI回复 ${i + 1}: ${response.response}`);
                console.log(`处理时间: ${response.metadata.processingTime}ms`);

                // 模拟实时延迟
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        };

        await simulateRealtimeChat();
    }

    // 示例5：性能监控和分析
    async performanceMonitoringExample(): Promise<void> {
        console.log('=== 性能监控和分析示例 ===');

        try {
            // 执行一系列操作来生成监控数据
            const operations = [
                () => this.aiSystem.processChatRequest({ message: '测试消息1' }),
                () => this.aiSystem.processChatRequest({ message: '测试消息2' }),
                () => this.aiSystem.processChatRequest({ message: '测试消息3' }),
            ];

            // 并发执行操作
            await Promise.all(operations.map(op => op()));

            // 获取系统状态和监控数据
            const status = this.aiSystem.getStatus();
            console.log('系统指标:', status.metrics);

            // 获取健康报告
            const healthReport = await this.aiSystem.getHealthReport();
            console.log('性能建议:', healthReport.recommendations);

        } catch (error) {
            console.error('性能监控失败:', error);
        }
    }

    // 示例6：完整的企业应用场景
    async enterpriseApplicationExample(): Promise<void> {
        console.log('=== 完整企业应用场景示例 ===');

        try {
            // 模拟客户服务场景
            const customerServiceScenario = async () => {
                console.log('客户服务场景开始...');

                // 1. 客户问题分类
                const classification = await this.aiSystem.processChatRequest({
                    message: '我的订单还没有收到，已经过了预计到达时间，请帮我查看一下',
                    conversationId: 'customer-service-001',
                    context: { scenario: 'customer_service', urgency: 'high' }
                });
                console.log('问题分类结果:', classification);

                // 2. 情感分析
                const sentiment = await this.aiSystem.executeToolWithAI(
                    'analyze_sentiment',
                    { text: classification.response },
                    '分析客户的情感状态，判断是否需要优先处理'
                );
                console.log('客户情感分析:', sentiment);

                // 3. 生成解决方案
                const solution = await this.aiSystem.processChatRequest({
                    message: '请提供订单查询和问题解决的标准流程',
                    conversationId: 'customer-service-001',
                    context: {
                        customer_sentiment: sentiment,
                        issue_type: 'shipping_delay'
                    }
                });
                console.log('解决方案:', solution);

                return { classification, sentiment, solution };
            };

            // 模拟内容审核场景
            const contentModerationScenario = async () => {
                console.log('内容审核场景开始...');

                const userComments = [
                    '这个产品真的很棒！强烈推荐！',
                    '垃圾产品，浪费钱！',
                    '你们的客服态度太差了，简直是垃圾！'
                ];

                const moderationResults = [];

                for (const comment of userComments) {
                    // 毒性检测
                    const toxicity = await this.aiSystem.executeToolWithAI(
                        'detect_toxicity',
                        { text: comment },
                        '检测这条评论是否包含有害内容，需要进行审核'
                    );

                    // 情感分析
                    const sentiment = await this.aiSystem.executeToolWithAI(
                        'analyze_sentiment',
                        { text: comment },
                        '分析这条评论的情感倾向'
                    );

                    moderationResults.push({
                        comment,
                        toxicity,
                        sentiment,
                        action: toxicity.isToxic ? 'block' : 'approve'
                    });
                }

                console.log('内容审核结果:', moderationResults);
                return moderationResults;
            };

            // 执行场景
            const customerService = await customerServiceScenario();
            const contentModeration = await contentModerationScenario();

            // 生成企业报告
            const enterpriseReport = {
                timestamp: new Date(),
                scenarios: {
                    customer_service: customerService,
                    content_moderation: contentModeration
                },
                system_health: await this.aiSystem.getHealthReport(),
                recommendations: [
                    '客户服务响应时间优秀',
                    '内容审核准确度高',
                    '建议增加更多语言支持',
                    '考虑添加语音交互功能'
                ]
            };

            console.log('企业应用报告:', enterpriseReport);

        } catch (error) {
            console.error('企业应用场景失败:', error);
        }
    }

    // 运行所有示例
    async runAllExamples(): Promise<void> {
        console.log('🚀 开始运行企业级AI系统完整示例...\n');

        try {
            await this.basicInitializationExample();
            console.log('\n');

            await this.aiChatExample();
            console.log('\n');

            await this.toolExecutionExample();
            console.log('\n');

            await this.realtimeCommunicationExample();
            console.log('\n');

            await this.performanceMonitoringExample();
            console.log('\n');

            await this.enterpriseApplicationExample();
            console.log('\n');

            console.log('✅ 所有示例运行完成！');

        } catch (error) {
            console.error('❌ 示例运行失败:', error);
        } finally {
            // 清理资源
            await this.aiSystem.shutdown();
            console.log('🔄 系统已安全关闭');
        }
    }
}

// 使用示例
export const runEnterpriseAIExample = async (environment: 'development' | 'production' = 'development') => {
    const example = new EnterpriseAISystemExample(environment);
    await example.runAllExamples();
};

// 简化的快速开始示例
export const quickStartExample = async () => {
    console.log('=== 快速开始示例 ===');

    const aiSystem = new EnterpriseAISystem({
        environment: 'development',
        features: {
            aiChat: true,
            toolExecution: true,
            realtimeUpdates: false,
            performanceMonitoring: false,
            aiModels: true,
            voiceInteraction: false,
            multimodalSupport: false
        }
    });

    try {
        // 初始化
        await aiSystem.initialize();
        console.log('✅ 系统初始化成功');

        // 简单对话
        const response = await aiSystem.processChatRequest({
            message: '你好，请介绍一下你自己'
        });
        console.log('AI回复:', response.response);

        // 工具使用
        const sentiment = await aiSystem.executeToolWithAI(
            'analyze_sentiment',
            { text: '今天心情很好！' }
        );
        console.log('情感分析:', sentiment);

    } catch (error) {
        console.error('快速开始失败:', error);
    } finally {
        await aiSystem.shutdown();
    }
};

// 导出配置示例供其他地方使用
export { developmentConfig, productionConfig };
