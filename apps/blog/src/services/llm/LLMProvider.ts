/**
 * LLM统一接入层 - 企业级LLM提供商抽象
 * 支持多种模型统一管理，智能负载均衡，故障转移
 */

export interface LLMConfig {
    apiKey: string;
    baseURL?: string;
    model: string;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    timeout?: number;
    retryAttempts?: number;
}

export interface LLMMessage {
    role: 'system' | 'user' | 'assistant' | 'function';
    content: string;
    name?: string;
    function_call?: {
        name: string;
        arguments: string;
    };
    tool_calls?: Array<{
        id: string;
        type: string;
        function: {
            name: string;
            arguments: string;
        };
    }>;
}

export interface LLMResponse {
    id: string;
    content: string;
    model: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    finish_reason: 'stop' | 'length' | 'function_call' | 'content_filter';
    metadata?: Record<string, any>;
}

export interface StreamingLLMResponse {
    id: string;
    delta: {
        content?: string;
        function_call?: {
            name?: string;
            arguments?: string;
        };
        tool_calls?: Array<{
            index: number;
            id?: string;
            type?: string;
            function?: {
                name?: string;
                arguments?: string;
            };
        }>;
    };
    model: string;
    done: boolean;
    metadata?: Record<string, any>;
}

export interface LLMProviderMetrics {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageLatency: number;
    averageTokensPerRequest: number;
    totalCost: number;
    lastRequestTime: Date;
    errorRate: number;
    availability: number;
}

export abstract class LLMProvider {
    protected config: LLMConfig;
    protected metrics: LLMProviderMetrics;
    protected circuitBreaker: CircuitBreaker;

    constructor(config: LLMConfig) {
        this.config = config;
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageLatency: 0,
            averageTokensPerRequest: 0,
            totalCost: 0,
            lastRequestTime: new Date(),
            errorRate: 0,
            availability: 1.0
        };
        this.circuitBreaker = new CircuitBreaker({
            failureThreshold: 5,
            resetTimeout: 30000,
            monitoringPeriod: 10000
        });
    }

    abstract get providerName(): string;
    abstract get supportedModels(): string[];
    abstract get maxContextLength(): number;
    abstract get costPer1KTokens(): { input: number; output: number };

    // 同步调用
    abstract chat(
        messages: LLMMessage[],
        options?: Partial<LLMConfig>
    ): Promise<LLMResponse>;

    // 流式调用
    abstract chatStream(
        messages: LLMMessage[],
        options?: Partial<LLMConfig>
    ): AsyncGenerator<StreamingLLMResponse, void, unknown>;

    // 嵌入向量
    abstract embeddings(
        texts: string[],
        model?: string
    ): Promise<number[][]>;

    // 健康检查
    async healthCheck(): Promise<boolean> {
        try {
            const response = await this.chat([
                { role: 'user', content: 'ping' }
            ], { maxTokens: 5 });
            return !!response.content;
        } catch (error) {
            console.error(`Health check failed for ${this.providerName}:`, error);
            return false;
        }
    }

    // 获取指标
    getMetrics(): LLMProviderMetrics {
        return { ...this.metrics };
    }

    // 重置指标
    resetMetrics(): void {
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageLatency: 0,
            averageTokensPerRequest: 0,
            totalCost: 0,
            lastRequestTime: new Date(),
            errorRate: 0,
            availability: 1.0
        };
    }

    // 更新指标
    protected updateMetrics(
        success: boolean,
        latency: number,
        tokens?: number,
        cost?: number
    ): void {
        this.metrics.totalRequests++;
        this.metrics.lastRequestTime = new Date();

        if (success) {
            this.metrics.successfulRequests++;
        } else {
            this.metrics.failedRequests++;
        }

        // 计算平均延迟
        this.metrics.averageLatency =
            (this.metrics.averageLatency * (this.metrics.totalRequests - 1) + latency) /
            this.metrics.totalRequests;

        // 计算平均token数
        if (tokens) {
            this.metrics.averageTokensPerRequest =
                (this.metrics.averageTokensPerRequest * (this.metrics.totalRequests - 1) + tokens) /
                this.metrics.totalRequests;
        }

        // 累计成本
        if (cost) {
            this.metrics.totalCost += cost;
        }

        // 计算错误率
        this.metrics.errorRate = this.metrics.failedRequests / this.metrics.totalRequests;

        // 计算可用性（基于最近的请求）
        const recentRequests = Math.min(100, this.metrics.totalRequests);
        const recentFailures = Math.min(this.metrics.failedRequests, recentRequests);
        this.metrics.availability = 1 - (recentFailures / recentRequests);
    }

    // 计算请求成本
    protected calculateCost(tokens: { input: number; output: number }): number {
        const costs = this.costPer1KTokens;
        return (tokens.input * costs.input + tokens.output * costs.output) / 1000;
    }

    // 执行带重试的请求
    protected async executeWithRetry<T>(
        operation: () => Promise<T>,
        maxRetries: number = this.config.retryAttempts || 3
    ): Promise<T> {
        let lastError: Error;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await this.circuitBreaker.execute(operation);
            } catch (error) {
                lastError = error as Error;

                if (attempt < maxRetries) {
                    const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw lastError!;
    }
}

// 断路器实现
class CircuitBreaker {
    private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
    private failureCount = 0;
    private lastFailureTime = 0;
    private nextAttemptTime = 0;

    constructor(
        private options: {
            failureThreshold: number;
            resetTimeout: number;
            monitoringPeriod: number;
        }
    ) { }

    async execute<T>(operation: () => Promise<T>): Promise<T> {
        if (this.state === 'OPEN') {
            if (Date.now() < this.nextAttemptTime) {
                throw new Error('Circuit breaker is OPEN');
            }
            this.state = 'HALF_OPEN';
        }

        try {
            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess(): void {
        this.failureCount = 0;
        this.state = 'CLOSED';
    }

    private onFailure(): void {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        if (this.failureCount >= this.options.failureThreshold) {
            this.state = 'OPEN';
            this.nextAttemptTime = Date.now() + this.options.resetTimeout;
        }
    }

    getState(): string {
        return this.state;
    }
}

export { CircuitBreaker };
