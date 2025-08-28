/**
 * LLM管理器 - 企业级LLM统一管理中心
 * 支持多提供商、智能路由、负载均衡、故障转移、成本优化
 */

import { LLMConfig, LLMMessage, LLMProvider, LLMProviderMetrics, LLMResponse, StreamingLLMResponse } from './LLMProvider';
import { ClaudeProvider } from './providers/ClaudeProvider';
import { GenericProvider } from './providers/GenericProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';

export interface LLMManagerConfig {
    providers: Array<{
        name: string;
        type: 'openai' | 'claude' | 'generic';
        config: any;
        priority: number; // 优先级，数字越小优先级越高
        weight: number; // 负载均衡权重
        enabled: boolean;
        tags?: string[]; // 标签，用于特定场景路由
    }>;

    routing: {
        strategy: 'priority' | 'round_robin' | 'weighted' | 'cost_optimized' | 'latency_optimized';
        fallbackStrategy: 'next_priority' | 'any_available' | 'fail_fast';
        retryAttempts: number;
        timeoutMs: number;
    };

    costOptimization: {
        enabled: boolean;
        maxCostPerRequest: number; // 单次请求最大成本（美元）
        dailyBudget: number; // 每日预算（美元）
        preferCheaper: boolean; // 优先选择便宜的提供商
    };

    monitoring: {
        enableMetrics: boolean;
        enableHealthCheck: boolean;
        healthCheckInterval: number; // 健康检查间隔（毫秒）
        metricsRetentionDays: number;
    };

    cache: {
        enabled: boolean;
        ttlSeconds: number;
        maxSize: number;
    };
}

interface CachedResponse {
    response: LLMResponse;
    timestamp: number;
    cost: number;
}

interface RequestContext {
    userId?: string;
    sessionId?: string;
    priority: 'low' | 'normal' | 'high' | 'critical';
    tags?: string[];
    maxCost?: number;
    requireStream?: boolean;
    preferredProviders?: string[];
    excludeProviders?: string[];
}

export class LLMManager {
    private providers: Map<string, LLMProvider> = new Map();
    private config: LLMManagerConfig;
    private cache: Map<string, CachedResponse> = new Map();
    private dailySpent: number = 0;
    private dailyResetTime: number = 0;
    private healthCheckTimer?: NodeJS.Timeout;
    private requestQueue: Array<{
        resolve: Function;
        reject: Function;
        request: () => Promise<any>;
    }> = [];
    private isProcessingQueue = false;

    constructor(config: LLMManagerConfig) {
        this.config = config;
        this.initializeProviders();
        this.startMonitoring();
        this.resetDailyBudgetIfNeeded();
    }

    // 初始化提供商
    private initializeProviders(): void {
        for (const providerConfig of this.config.providers) {
            if (!providerConfig.enabled) continue;

            let provider: LLMProvider;

            switch (providerConfig.type) {
                case 'openai':
                    provider = new OpenAIProvider(providerConfig.config);
                    break;
                case 'claude':
                    provider = new ClaudeProvider(providerConfig.config);
                    break;
                case 'generic':
                    provider = new GenericProvider(providerConfig.config);
                    break;
                default:
                    console.warn(`Unknown provider type: ${providerConfig.type}`);
                    continue;
            }

            this.providers.set(providerConfig.name, provider);
        }

        console.log(`Initialized ${this.providers.size} LLM providers`);
    }

    // 主要聊天接口
    async chat(
        messages: LLMMessage[],
        context: RequestContext = { priority: 'normal' },
        options?: Partial<LLMConfig>
    ): Promise<LLMResponse> {
        // 检查缓存
        if (this.config.cache.enabled) {
            const cacheKey = this.generateCacheKey(messages, options);
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                return cached.response;
            }
        }

        // 检查预算
        if (this.config.costOptimization.enabled) {
            this.checkBudget(context.maxCost);
        }

        // 选择提供商
        const providers = this.selectProviders(context, false);

        let lastError: Error | null = null;

        for (const provider of providers) {
            try {
                const response = await this.executeWithProvider(
                    provider,
                    () => provider.chat(messages, options),
                    context
                );

                // 更新成本跟踪
                if (response.metadata?.cost) {
                    this.dailySpent += response.metadata.cost;
                }

                // 缓存响应
                if (this.config.cache.enabled) {
                    const cacheKey = this.generateCacheKey(messages, options);
                    this.setCache(cacheKey, response);
                }

                return response;
            } catch (error) {
                lastError = error as Error;
                console.warn(`Provider ${provider.providerName} failed:`, error);

                if (this.config.routing.fallbackStrategy === 'fail_fast') {
                    break;
                }
            }
        }

        throw lastError || new Error('All providers failed');
    }

    // 流式聊天接口
    async* chatStream(
        messages: LLMMessage[],
        context: RequestContext = { priority: 'normal' },
        options?: Partial<LLMConfig>
    ): AsyncGenerator<StreamingLLMResponse, void, unknown> {
        // 检查预算
        if (this.config.costOptimization.enabled) {
            this.checkBudget(context.maxCost);
        }

        // 选择支持流式的提供商
        const providers = this.selectProviders({ ...context, requireStream: true }, true);

        let lastError: Error | null = null;

        for (const provider of providers) {
            try {
                const stream = provider.chatStream(messages, options);
                let totalCost = 0;

                for await (const chunk of stream) {
                    yield {
                        ...chunk,
                        metadata: {
                            ...chunk.metadata,
                            provider: provider.providerName
                        }
                    };

                    // 估算成本（基于token数）
                    if (chunk.delta.content) {
                        const estimatedCost = chunk.delta.content.length * 0.00001; // 粗略估算
                        totalCost += estimatedCost;
                    }
                }

                // 更新成本跟踪
                this.dailySpent += totalCost;
                return;
            } catch (error) {
                lastError = error as Error;
                console.warn(`Provider ${provider.providerName} stream failed:`, error);

                if (this.config.routing.fallbackStrategy === 'fail_fast') {
                    break;
                }
            }
        }

        throw lastError || new Error('All providers failed for streaming');
    }

    // 嵌入向量接口
    async embeddings(
        texts: string[],
        context: RequestContext = { priority: 'normal' },
        model?: string
    ): Promise<number[][]> {
        const providers = this.selectProviders(context, false);

        let lastError: Error | null = null;

        for (const provider of providers) {
            try {
                return await this.executeWithProvider(
                    provider,
                    () => provider.embeddings(texts, model),
                    context
                );
            } catch (error) {
                lastError = error as Error;
                console.warn(`Provider ${provider.providerName} embeddings failed:`, error);
            }
        }

        throw lastError || new Error('All providers failed for embeddings');
    }

    // 提供商选择逻辑
    private selectProviders(context: RequestContext, requireStream: boolean = false): LLMProvider[] {
        let candidates = Array.from(this.providers.entries())
            .map(([name, provider]) => ({
                name,
                provider,
                config: this.config.providers.find(p => p.name === name)!
            }))
            .filter(({ config }) => config.enabled);

        // 过滤流式支持
        if (requireStream) {
            candidates = candidates.filter(({ provider }) => {
                try {
                    return typeof provider.chatStream === 'function';
                } catch {
                    return false;
                }
            });
        }

        // 应用上下文过滤
        if (context.preferredProviders?.length) {
            const preferred = candidates.filter(({ name }) =>
                context.preferredProviders!.includes(name)
            );
            if (preferred.length > 0) {
                candidates = preferred;
            }
        }

        if (context.excludeProviders?.length) {
            candidates = candidates.filter(({ name }) =>
                !context.excludeProviders!.includes(name)
            );
        }

        // 标签匹配
        if (context.tags?.length) {
            candidates = candidates.filter(({ config }) =>
                config.tags?.some(tag => context.tags!.includes(tag))
            );
        }

        // 健康检查过滤
        candidates = candidates.filter(({ provider }) =>
            this.isProviderHealthy(provider)
        );

        if (candidates.length === 0) {
            throw new Error('No suitable providers available');
        }

        // 排序策略
        switch (this.config.routing.strategy) {
            case 'priority':
                candidates.sort((a, b) => a.config.priority - b.config.priority);
                break;

            case 'cost_optimized':
                if (this.config.costOptimization.enabled) {
                    candidates.sort((a, b) => {
                        const costA = a.provider.costPer1KTokens.input + a.provider.costPer1KTokens.output;
                        const costB = b.provider.costPer1KTokens.input + b.provider.costPer1KTokens.output;
                        return costA - costB;
                    });
                }
                break;

            case 'latency_optimized':
                candidates.sort((a, b) => {
                    const metricsA = a.provider.getMetrics();
                    const metricsB = b.provider.getMetrics();
                    return metricsA.averageLatency - metricsB.averageLatency;
                });
                break;

            case 'weighted':
                candidates = this.weightedShuffle(candidates);
                break;

            case 'round_robin':
                // 简单的轮询实现
                candidates = this.roundRobinSort(candidates);
                break;
        }

        return candidates.map(({ provider }) => provider);
    }

    // 加权随机排序
    private weightedShuffle(candidates: any[]): any[] {
        const totalWeight = candidates.reduce((sum, { config }) => sum + config.weight, 0);
        const random = Math.random() * totalWeight;

        let weightSum = 0;
        for (const candidate of candidates) {
            weightSum += candidate.config.weight;
            if (random <= weightSum) {
                return [candidate, ...candidates.filter(c => c !== candidate)];
            }
        }

        return candidates;
    }

    // 轮询排序
    private roundRobinSort(candidates: any[]): any[] {
        // 简单实现：基于时间戳轮询
        const index = Math.floor(Date.now() / 1000) % candidates.length;
        return [...candidates.slice(index), ...candidates.slice(0, index)];
    }

    // 执行带队列管理的请求
    private async executeWithProvider<T>(
        provider: LLMProvider,
        operation: () => Promise<T>,
        context: RequestContext
    ): Promise<T> {
        // 高优先级请求跳过队列
        if (context.priority === 'critical') {
            return await operation();
        }

        // 添加到队列
        return new Promise((resolve, reject) => {
            this.requestQueue.push({
                resolve,
                reject,
                request: operation
            });

            this.processQueue();
        });
    }

    // 处理请求队列
    private async processQueue(): Promise<void> {
        if (this.isProcessingQueue || this.requestQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        while (this.requestQueue.length > 0) {
            const { resolve, reject, request } = this.requestQueue.shift()!;

            try {
                const result = await request();
                resolve(result);
            } catch (error) {
                reject(error);
            }

            // 简单的速率限制
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        this.isProcessingQueue = false;
    }

    // 检查提供商健康状态
    private isProviderHealthy(provider: LLMProvider): boolean {
        const metrics = provider.getMetrics();
        return metrics.availability > 0.8 && metrics.errorRate < 0.2;
    }

    // 预算检查
    private checkBudget(maxCost?: number): void {
        this.resetDailyBudgetIfNeeded();

        if (maxCost && maxCost > this.config.costOptimization.maxCostPerRequest) {
            throw new Error(`Request cost exceeds maximum allowed cost`);
        }

        if (this.dailySpent >= this.config.costOptimization.dailyBudget) {
            throw new Error('Daily budget exceeded');
        }
    }

    // 重置每日预算
    private resetDailyBudgetIfNeeded(): void {
        const now = Date.now();
        const todayStart = new Date().setHours(0, 0, 0, 0);

        if (this.dailyResetTime < todayStart) {
            this.dailySpent = 0;
            this.dailyResetTime = todayStart;
        }
    }

    // 缓存相关方法
    private generateCacheKey(messages: LLMMessage[], options?: Partial<LLMConfig>): string {
        const data = { messages, options };
        return btoa(JSON.stringify(data)).replace(/[+/=]/g, '');
    }

    private getFromCache(key: string): CachedResponse | null {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const now = Date.now();
        const age = (now - cached.timestamp) / 1000;

        if (age > this.config.cache.ttlSeconds) {
            this.cache.delete(key);
            return null;
        }

        return cached;
    }

    private setCache(key: string, response: LLMResponse): void {
        if (this.cache.size >= this.config.cache.maxSize) {
            // 删除最旧的缓存项
            const oldestKey = Array.from(this.cache.keys())[0];
            this.cache.delete(oldestKey);
        }

        this.cache.set(key, {
            response,
            timestamp: Date.now(),
            cost: response.metadata?.cost || 0
        });
    }

    // 监控功能
    private startMonitoring(): void {
        if (!this.config.monitoring.enableHealthCheck) return;

        this.healthCheckTimer = setInterval(async () => {
            for (const [name, provider] of this.providers) {
                try {
                    const isHealthy = await provider.healthCheck();
                    console.log(`Provider ${name} health check: ${isHealthy ? 'OK' : 'FAILED'}`);
                } catch (error) {
                    console.error(`Health check failed for provider ${name}:`, error);
                }
            }
        }, this.config.monitoring.healthCheckInterval);
    }

    // 获取系统状态
    getStatus(): {
        providers: Record<string, LLMProviderMetrics>;
        dailySpent: number;
        cacheSize: number;
        queueLength: number;
    } {
        const providers: Record<string, LLMProviderMetrics> = {};

        for (const [name, provider] of this.providers) {
            providers[name] = provider.getMetrics();
        }

        return {
            providers,
            dailySpent: this.dailySpent,
            cacheSize: this.cache.size,
            queueLength: this.requestQueue.length
        };
    }

    // 清理资源
    destroy(): void {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
        }

        this.cache.clear();
        this.requestQueue.length = 0;
        this.providers.clear();
    }
}

// 默认配置
export const defaultLLMConfig: LLMManagerConfig = {
    providers: [
        {
            name: 'openai-gpt4',
            type: 'openai',
            config: {
                apiKey: process.env.OPENAI_API_KEY || '',
                model: 'gpt-4-turbo',
                maxTokens: 2000,
                temperature: 0.7
            },
            priority: 1,
            weight: 50,
            enabled: true,
            tags: ['general', 'coding', 'reasoning']
        },
        {
            name: 'claude-sonnet',
            type: 'claude',
            config: {
                apiKey: process.env.ANTHROPIC_API_KEY || '',
                model: 'claude-3-5-sonnet-20241022',
                maxTokens: 2000,
                temperature: 0.7
            },
            priority: 2,
            weight: 30,
            enabled: true,
            tags: ['general', 'writing', 'analysis']
        }
    ],
    routing: {
        strategy: 'priority',
        fallbackStrategy: 'next_priority',
        retryAttempts: 3,
        timeoutMs: 30000
    },
    costOptimization: {
        enabled: true,
        maxCostPerRequest: 0.5,
        dailyBudget: 50.0,
        preferCheaper: false
    },
    monitoring: {
        enableMetrics: true,
        enableHealthCheck: true,
        healthCheckInterval: 60000,
        metricsRetentionDays: 7
    },
    cache: {
        enabled: true,
        ttlSeconds: 300,
        maxSize: 1000
    }
};
