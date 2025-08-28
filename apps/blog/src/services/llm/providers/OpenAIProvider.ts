/**
 * OpenAI Provider实现
 * 支持GPT-4, GPT-3.5-turbo等模型
 */

import { LLMConfig, LLMMessage, LLMProvider, LLMResponse, StreamingLLMResponse } from '../LLMProvider';

interface OpenAIConfig extends LLMConfig {
    organization?: string;
    project?: string;
}

interface OpenAIMessage {
    role: 'system' | 'user' | 'assistant' | 'function';
    content: string | null;
    name?: string;
    function_call?: {
        name: string;
        arguments: string;
    };
    tool_calls?: Array<{
        id: string;
        type: 'function';
        function: {
            name: string;
            arguments: string;
        };
    }>;
}

interface OpenAIResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: {
            role: string;
            content: string | null;
            function_call?: {
                name: string;
                arguments: string;
            };
            tool_calls?: Array<{
                id: string;
                type: 'function';
                function: {
                    name: string;
                    arguments: string;
                };
            }>;
        };
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

interface OpenAIStreamResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        delta: {
            role?: string;
            content?: string;
            function_call?: {
                name?: string;
                arguments?: string;
            };
            tool_calls?: Array<{
                index: number;
                id?: string;
                type?: 'function';
                function?: {
                    name?: string;
                    arguments?: string;
                };
            }>;
        };
        finish_reason: string | null;
    }>;
}

export class OpenAIProvider extends LLMProvider {
    private readonly baseURL: string;
    private readonly organization?: string;
    private readonly project?: string;

    constructor(config: OpenAIConfig) {
        super(config);
        this.baseURL = config.baseURL || 'https://api.openai.com/v1';
        this.organization = config.organization;
        this.project = config.project;
    }

    get providerName(): string {
        return 'OpenAI';
    }

    get supportedModels(): string[] {
        return [
            'gpt-4',
            'gpt-4-turbo',
            'gpt-4-turbo-preview',
            'gpt-4-0125-preview',
            'gpt-4-1106-preview',
            'gpt-3.5-turbo',
            'gpt-3.5-turbo-16k',
            'gpt-3.5-turbo-0125',
            'gpt-3.5-turbo-1106'
        ];
    }

    get maxContextLength(): number {
        const model = this.config.model;
        if (model.includes('gpt-4-turbo') || model.includes('0125') || model.includes('1106')) {
            return 128000;
        }
        if (model.includes('gpt-4')) {
            return 8192;
        }
        if (model.includes('16k')) {
            return 16384;
        }
        return 4096;
    }

    get costPer1KTokens(): { input: number; output: number } {
        const model = this.config.model;

        // GPT-4 Turbo pricing
        if (model.includes('gpt-4-turbo') || model.includes('0125') || model.includes('1106')) {
            return { input: 0.01, output: 0.03 };
        }

        // GPT-4 pricing
        if (model.includes('gpt-4')) {
            return { input: 0.03, output: 0.06 };
        }

        // GPT-3.5 Turbo pricing
        return { input: 0.0015, output: 0.002 };
    }

    async chat(messages: LLMMessage[], options?: Partial<LLMConfig>): Promise<LLMResponse> {
        const startTime = Date.now();

        try {
            const response = await this.executeWithRetry(async () => {
                return await this.makeRequest('/chat/completions', {
                    model: options?.model || this.config.model,
                    messages: this.convertMessages(messages),
                    max_tokens: options?.maxTokens || this.config.maxTokens || 1000,
                    temperature: options?.temperature ?? this.config.temperature ?? 0.7,
                    top_p: options?.topP ?? this.config.topP ?? 1,
                    frequency_penalty: options?.frequencyPenalty ?? this.config.frequencyPenalty ?? 0,
                    presence_penalty: options?.presencePenalty ?? this.config.presencePenalty ?? 0,
                    stream: false
                });
            });

            const latency = Date.now() - startTime;
            const cost = this.calculateCost({
                input: response.usage.prompt_tokens,
                output: response.usage.completion_tokens
            });

            this.updateMetrics(true, latency, response.usage.total_tokens, cost);

            return {
                id: response.id,
                content: response.choices[0].message.content || '',
                model: response.model,
                usage: response.usage,
                finish_reason: response.choices[0].finish_reason as any,
                metadata: {
                    provider: this.providerName,
                    cost,
                    latency
                }
            };
        } catch (error) {
            const latency = Date.now() - startTime;
            this.updateMetrics(false, latency);
            throw error;
        }
    }

    async* chatStream(
        messages: LLMMessage[],
        options?: Partial<LLMConfig>
    ): AsyncGenerator<StreamingLLMResponse, void, unknown> {
        const startTime = Date.now();
        let totalTokens = 0;

        try {
            const response = await this.executeWithRetry(async () => {
                return await this.makeStreamRequest('/chat/completions', {
                    model: options?.model || this.config.model,
                    messages: this.convertMessages(messages),
                    max_tokens: options?.maxTokens || this.config.maxTokens || 1000,
                    temperature: options?.temperature ?? this.config.temperature ?? 0.7,
                    top_p: options?.topP ?? this.config.topP ?? 1,
                    frequency_penalty: options?.frequencyPenalty ?? this.config.frequencyPenalty ?? 0,
                    presence_penalty: options?.presencePenalty ?? this.config.presencePenalty ?? 0,
                    stream: true
                });
            });

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No response body');
            }

            const decoder = new TextDecoder();
            let buffer = '';

            try {
                while (true) {
                    const { done, value } = await reader.read();

                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);

                            if (data === '[DONE]') {
                                const latency = Date.now() - startTime;
                                this.updateMetrics(true, latency, totalTokens);
                                return;
                            }

                            try {
                                const parsed: OpenAIStreamResponse = JSON.parse(data);
                                const choice = parsed.choices[0];

                                if (choice) {
                                    totalTokens++;

                                    yield {
                                        id: parsed.id,
                                        delta: {
                                            content: choice.delta.content,
                                            function_call: choice.delta.function_call,
                                            tool_calls: choice.delta.tool_calls
                                        },
                                        model: parsed.model,
                                        done: choice.finish_reason !== null,
                                        metadata: {
                                            provider: this.providerName,
                                            index: choice.index
                                        }
                                    };
                                }
                            } catch (parseError) {
                                console.warn('Failed to parse stream data:', parseError);
                            }
                        }
                    }
                }
            } finally {
                reader.releaseLock();
            }
        } catch (error) {
            const latency = Date.now() - startTime;
            this.updateMetrics(false, latency);
            throw error;
        }
    }

    async embeddings(texts: string[], model: string = 'text-embedding-ada-002'): Promise<number[][]> {
        const startTime = Date.now();

        try {
            const response = await this.executeWithRetry(async () => {
                return await this.makeRequest('/embeddings', {
                    model,
                    input: texts
                });
            });

            const latency = Date.now() - startTime;
            this.updateMetrics(true, latency);

            return response.data.map((item: any) => item.embedding);
        } catch (error) {
            const latency = Date.now() - startTime;
            this.updateMetrics(false, latency);
            throw error;
        }
    }

    private convertMessages(messages: LLMMessage[]): OpenAIMessage[] {
        return messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            name: msg.name,
            function_call: msg.function_call,
            tool_calls: msg.tool_calls
        }));
    }

    private async makeRequest(endpoint: string, data: any): Promise<any> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
        };

        if (this.organization) {
            headers['OpenAI-Organization'] = this.organization;
        }

        if (this.project) {
            headers['OpenAI-Project'] = this.project;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, this.config.timeout || 30000);

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
                signal: controller.signal
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
            }

            return await response.json();
        } finally {
            clearTimeout(timeoutId);
        }
    }

    private async makeStreamRequest(endpoint: string, data: any): Promise<Response> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Accept': 'text/event-stream'
        };

        if (this.organization) {
            headers['OpenAI-Organization'] = this.organization;
        }

        if (this.project) {
            headers['OpenAI-Project'] = this.project;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, this.config.timeout || 120000); // 更长的超时时间用于流式请求

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
                signal: controller.signal
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
            }

            return response;
        } finally {
            clearTimeout(timeoutId);
        }
    }
}
