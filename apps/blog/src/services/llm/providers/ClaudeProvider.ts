/**
 * Anthropic Claude Provider实现
 * 支持Claude-3 Haiku, Sonnet, Opus等模型
 */

import { LLMConfig, LLMMessage, LLMProvider, LLMResponse, StreamingLLMResponse } from '../LLMProvider';

interface ClaudeConfig extends LLMConfig {
    anthropicVersion?: string;
}

interface ClaudeMessage {
    role: 'user' | 'assistant';
    content: string | Array<{
        type: 'text' | 'image';
        text?: string;
        source?: {
            type: 'base64';
            media_type: string;
            data: string;
        };
    }>;
}

interface ClaudeResponse {
    id: string;
    type: 'message';
    role: 'assistant';
    content: Array<{
        type: 'text';
        text: string;
    }>;
    model: string;
    stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence';
    stop_sequence?: string;
    usage: {
        input_tokens: number;
        output_tokens: number;
    };
}

interface ClaudeStreamResponse {
    type: 'message_start' | 'content_block_start' | 'content_block_delta' | 'content_block_stop' | 'message_delta' | 'message_stop';
    message?: {
        id: string;
        type: 'message';
        role: 'assistant';
        content: any[];
        model: string;
        stop_reason?: string;
        stop_sequence?: string;
        usage: {
            input_tokens: number;
            output_tokens: number;
        };
    };
    index?: number;
    content_block?: {
        type: 'text';
        text: string;
    };
    delta?: {
        type: 'text_delta';
        text: string;
        stop_reason?: string;
        stop_sequence?: string;
    };
    usage?: {
        output_tokens: number;
    };
}

export class ClaudeProvider extends LLMProvider {
    private readonly baseURL: string;
    private readonly anthropicVersion: string;

    constructor(config: ClaudeConfig) {
        super(config);
        this.baseURL = config.baseURL || 'https://api.anthropic.com';
        this.anthropicVersion = config.anthropicVersion || '2023-06-01';
    }

    get providerName(): string {
        return 'Claude';
    }

    get supportedModels(): string[] {
        return [
            'claude-3-5-sonnet-20241022',
            'claude-3-5-sonnet-20240620',
            'claude-3-opus-20240229',
            'claude-3-sonnet-20240229',
            'claude-3-haiku-20240307',
            'claude-2.1',
            'claude-2.0',
            'claude-instant-1.2'
        ];
    }

    get maxContextLength(): number {
        const model = this.config.model;
        if (model.includes('claude-3') || model.includes('claude-2')) {
            return 200000; // 200k tokens
        }
        return 100000; // 100k tokens for claude-instant
    }

    get costPer1KTokens(): { input: number; output: number } {
        const model = this.config.model;

        // Claude-3.5 Sonnet pricing
        if (model.includes('claude-3-5-sonnet')) {
            return { input: 0.003, output: 0.015 };
        }

        // Claude-3 Opus pricing
        if (model.includes('claude-3-opus')) {
            return { input: 0.015, output: 0.075 };
        }

        // Claude-3 Sonnet pricing
        if (model.includes('claude-3-sonnet')) {
            return { input: 0.003, output: 0.015 };
        }

        // Claude-3 Haiku pricing
        if (model.includes('claude-3-haiku')) {
            return { input: 0.00025, output: 0.00125 };
        }

        // Claude-2 pricing
        if (model.includes('claude-2')) {
            return { input: 0.008, output: 0.024 };
        }

        // Claude Instant pricing
        return { input: 0.0008, output: 0.0024 };
    }

    async chat(messages: LLMMessage[], options?: Partial<LLMConfig>): Promise<LLMResponse> {
        const startTime = Date.now();

        try {
            const response = await this.executeWithRetry(async () => {
                return await this.makeRequest('/v1/messages', {
                    model: options?.model || this.config.model,
                    max_tokens: options?.maxTokens || this.config.maxTokens || 1000,
                    temperature: options?.temperature ?? this.config.temperature ?? 0.7,
                    top_p: options?.topP ?? this.config.topP ?? 1,
                    messages: this.convertMessages(messages),
                    stream: false
                });
            });

            const latency = Date.now() - startTime;
            const cost = this.calculateCost({
                input: response.usage.input_tokens,
                output: response.usage.output_tokens
            });

            this.updateMetrics(true, latency, response.usage.input_tokens + response.usage.output_tokens, cost);

            return {
                id: response.id,
                content: response.content[0]?.text || '',
                model: response.model,
                usage: {
                    prompt_tokens: response.usage.input_tokens,
                    completion_tokens: response.usage.output_tokens,
                    total_tokens: response.usage.input_tokens + response.usage.output_tokens
                },
                finish_reason: this.mapStopReason(response.stop_reason),
                metadata: {
                    provider: this.providerName,
                    cost,
                    latency,
                    stop_reason: response.stop_reason,
                    stop_sequence: response.stop_sequence
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
        let messageId = '';

        try {
            const response = await this.executeWithRetry(async () => {
                return await this.makeStreamRequest('/v1/messages', {
                    model: options?.model || this.config.model,
                    max_tokens: options?.maxTokens || this.config.maxTokens || 1000,
                    temperature: options?.temperature ?? this.config.temperature ?? 0.7,
                    top_p: options?.topP ?? this.config.topP ?? 1,
                    messages: this.convertMessages(messages),
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
                                const parsed: ClaudeStreamResponse = JSON.parse(data);

                                if (parsed.type === 'message_start' && parsed.message) {
                                    messageId = parsed.message.id;
                                    totalTokens += parsed.message.usage.input_tokens;
                                }

                                if (parsed.type === 'content_block_delta' && parsed.delta) {
                                    totalTokens++;

                                    yield {
                                        id: messageId,
                                        delta: {
                                            content: parsed.delta.text
                                        },
                                        model: options?.model || this.config.model,
                                        done: false,
                                        metadata: {
                                            provider: this.providerName,
                                            type: parsed.type
                                        }
                                    };
                                }

                                if (parsed.type === 'message_stop') {
                                    yield {
                                        id: messageId,
                                        delta: {},
                                        model: options?.model || this.config.model,
                                        done: true,
                                        metadata: {
                                            provider: this.providerName,
                                            type: parsed.type
                                        }
                                    };

                                    const latency = Date.now() - startTime;
                                    this.updateMetrics(true, latency, totalTokens);
                                    return;
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

    async embeddings(texts: string[], model?: string): Promise<number[][]> {
        throw new Error('Claude does not support embeddings API. Use a different provider for embeddings.');
    }

    private convertMessages(messages: LLMMessage[]): ClaudeMessage[] {
        const claudeMessages: ClaudeMessage[] = [];
        let systemPrompt = '';

        for (const msg of messages) {
            if (msg.role === 'system') {
                systemPrompt += (systemPrompt ? '\n\n' : '') + msg.content;
            } else if (msg.role === 'user' || msg.role === 'assistant') {
                claudeMessages.push({
                    role: msg.role,
                    content: msg.content
                });
            }
        }

        // 如果有系统提示，将其添加到第一个用户消息前
        if (systemPrompt && claudeMessages.length > 0 && claudeMessages[0].role === 'user') {
            claudeMessages[0].content = systemPrompt + '\n\n' + claudeMessages[0].content;
        }

        return claudeMessages;
    }

    private mapStopReason(reason: string): 'stop' | 'length' | 'function_call' | 'content_filter' {
        switch (reason) {
            case 'end_turn':
                return 'stop';
            case 'max_tokens':
                return 'length';
            case 'stop_sequence':
                return 'stop';
            default:
                return 'stop';
        }
    }

    private async makeRequest(endpoint: string, data: any): Promise<any> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'x-api-key': this.config.apiKey,
            'anthropic-version': this.anthropicVersion
        };

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
                throw new Error(`Claude API error: ${response.status} ${errorText}`);
            }

            return await response.json();
        } finally {
            clearTimeout(timeoutId);
        }
    }

    private async makeStreamRequest(endpoint: string, data: any): Promise<Response> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'x-api-key': this.config.apiKey,
            'anthropic-version': this.anthropicVersion,
            'Accept': 'text/event-stream'
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, this.config.timeout || 120000);

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
                signal: controller.signal
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Claude API error: ${response.status} ${errorText}`);
            }

            return response;
        } finally {
            clearTimeout(timeoutId);
        }
    }
}
