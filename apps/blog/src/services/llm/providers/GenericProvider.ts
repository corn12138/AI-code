/**
 * 通用LLM Provider适配器
 * 可以适配用户现有的AI API端点
 * 支持自定义请求/响应格式转换
 */

import { LLMConfig, LLMMessage, LLMProvider, LLMResponse, StreamingLLMResponse } from '../LLMProvider';

interface GenericConfig extends LLMConfig {
    // API端点配置
    chatEndpoint: string;
    embeddingsEndpoint?: string;
    streamingSupported?: boolean;

    // 请求格式配置
    requestFormat: {
        messagesField: string; // 消息字段名，如 'messages', 'prompt', 'input'
        modelField?: string; // 模型字段名，如 'model', 'engine'
        maxTokensField?: string; // 最大token字段名
        temperatureField?: string; // 温度字段名
        streamField?: string; // 流式字段名
        additionalFields?: Record<string, any>; // 额外的固定字段
    };

    // 响应格式配置
    responseFormat: {
        contentPath: string; // 内容路径，如 'choices[0].message.content', 'response.text'
        usagePath?: string; // token使用量路径
        modelPath?: string; // 模型路径
        finishReasonPath?: string; // 完成原因路径
    };

    // 流式响应格式配置
    streamFormat?: {
        contentPath: string; // 流式内容路径
        donePath?: string; // 完成标识路径
        dataPrefix?: string; // 数据前缀，如 'data: '
        doneMarker?: string; // 完成标识，如 '[DONE]'
    };

    // 认证配置
    auth: {
        type: 'bearer' | 'apikey' | 'basic' | 'custom';
        headerName?: string; // 自定义头名称
        headerPrefix?: string; // 头值前缀，如 'Bearer '
        credentials?: string; // 认证凭据
    };

    // 自定义转换函数
    transforms?: {
        requestTransform?: (data: any) => any;
        responseTransform?: (data: any) => any;
        streamTransform?: (chunk: string) => any;
    };
}

export class GenericProvider extends LLMProvider {
    private readonly genericConfig: GenericConfig;

    constructor(config: GenericConfig) {
        super(config);
        this.genericConfig = config;
    }

    get providerName(): string {
        return this.genericConfig.baseURL || 'Generic';
    }

    get supportedModels(): string[] {
        return [this.config.model]; // 通用提供商通常只支持一个模型
    }

    get maxContextLength(): number {
        return 4096; // 默认值，可以通过配置覆盖
    }

    get costPer1KTokens(): { input: number; output: number } {
        return { input: 0.002, output: 0.002 }; // 默认成本
    }

    async chat(messages: LLMMessage[], options?: Partial<LLMConfig>): Promise<LLMResponse> {
        const startTime = Date.now();

        try {
            const requestData = this.buildRequest(messages, options, false);

            const response = await this.executeWithRetry(async () => {
                return await this.makeRequest(this.genericConfig.chatEndpoint, requestData);
            });

            const transformedResponse = this.genericConfig.transforms?.responseTransform
                ? this.genericConfig.transforms.responseTransform(response)
                : response;

            const latency = Date.now() - startTime;
            const llmResponse = this.parseResponse(transformedResponse);

            const cost = this.calculateCost({
                input: llmResponse.usage.prompt_tokens,
                output: llmResponse.usage.completion_tokens
            });

            this.updateMetrics(true, latency, llmResponse.usage.total_tokens, cost);

            return {
                ...llmResponse,
                metadata: {
                    ...llmResponse.metadata,
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
        if (!this.genericConfig.streamingSupported || !this.genericConfig.streamFormat) {
            throw new Error('Streaming not supported by this provider configuration');
        }

        const startTime = Date.now();
        let totalTokens = 0;

        try {
            const requestData = this.buildRequest(messages, options, true);

            const response = await this.executeWithRetry(async () => {
                return await this.makeStreamRequest(this.genericConfig.chatEndpoint, requestData);
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
                        const processedLine = this.processStreamLine(line);
                        if (processedLine) {
                            totalTokens++;

                            const transformedChunk = this.genericConfig.transforms?.streamTransform
                                ? this.genericConfig.transforms.streamTransform(processedLine)
                                : processedLine;

                            const streamResponse = this.parseStreamResponse(transformedChunk);

                            yield {
                                ...streamResponse,
                                metadata: {
                                    ...streamResponse.metadata,
                                    provider: this.providerName
                                }
                            };

                            if (streamResponse.done) {
                                const latency = Date.now() - startTime;
                                this.updateMetrics(true, latency, totalTokens);
                                return;
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
        if (!this.genericConfig.embeddingsEndpoint) {
            throw new Error('Embeddings not supported by this provider configuration');
        }

        const startTime = Date.now();

        try {
            const requestData = {
                input: texts,
                model: model || this.config.model
            };

            const response = await this.executeWithRetry(async () => {
                return await this.makeRequest(this.genericConfig.embeddingsEndpoint!, requestData);
            });

            const latency = Date.now() - startTime;
            this.updateMetrics(true, latency);

            // 默认假设响应格式为 { data: [{ embedding: number[] }] }
            return response.data?.map((item: any) => item.embedding) || [];
        } catch (error) {
            const latency = Date.now() - startTime;
            this.updateMetrics(false, latency);
            throw error;
        }
    }

    private buildRequest(
        messages: LLMMessage[],
        options?: Partial<LLMConfig>,
        streaming: boolean = false
    ): any {
        const format = this.genericConfig.requestFormat;
        const requestData: any = {};

        // 设置消息
        requestData[format.messagesField] = this.convertMessages(messages);

        // 设置模型
        if (format.modelField) {
            requestData[format.modelField] = options?.model || this.config.model;
        }

        // 设置最大token数
        if (format.maxTokensField) {
            requestData[format.maxTokensField] = options?.maxTokens || this.config.maxTokens || 1000;
        }

        // 设置温度
        if (format.temperatureField) {
            requestData[format.temperatureField] = options?.temperature ?? this.config.temperature ?? 0.7;
        }

        // 设置流式
        if (format.streamField) {
            requestData[format.streamField] = streaming;
        }

        // 添加额外字段
        if (format.additionalFields) {
            Object.assign(requestData, format.additionalFields);
        }

        // 应用自定义转换
        return this.genericConfig.transforms?.requestTransform
            ? this.genericConfig.transforms.requestTransform(requestData)
            : requestData;
    }

    private convertMessages(messages: LLMMessage[]): any {
        // 默认保持原格式，子类可以重写
        return messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
    }

    private parseResponse(response: any): LLMResponse {
        const format = this.genericConfig.responseFormat;

        const content = this.getNestedValue(response, format.contentPath) || '';
        const usage = this.getNestedValue(response, format.usagePath) || {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0
        };
        const model = this.getNestedValue(response, format.modelPath) || this.config.model;
        const finishReason = this.getNestedValue(response, format.finishReasonPath) || 'stop';

        return {
            id: response.id || Date.now().toString(),
            content,
            model,
            usage: {
                prompt_tokens: usage.prompt_tokens || usage.input_tokens || 0,
                completion_tokens: usage.completion_tokens || usage.output_tokens || 0,
                total_tokens: usage.total_tokens || (usage.prompt_tokens + usage.completion_tokens) || 0
            },
            finish_reason: finishReason as any
        };
    }

    private parseStreamResponse(chunk: any): StreamingLLMResponse {
        const format = this.genericConfig.streamFormat!;

        const content = this.getNestedValue(chunk, format.contentPath) || '';
        const done = format.donePath ? this.getNestedValue(chunk, format.donePath) : false;

        return {
            id: chunk.id || Date.now().toString(),
            delta: { content },
            model: this.config.model,
            done
        };
    }

    private processStreamLine(line: string): any | null {
        const format = this.genericConfig.streamFormat!;

        if (format.dataPrefix && line.startsWith(format.dataPrefix)) {
            const data = line.slice(format.dataPrefix.length);

            if (format.doneMarker && data === format.doneMarker) {
                return null;
            }

            try {
                return JSON.parse(data);
            } catch (error) {
                console.warn('Failed to parse stream data:', error);
                return null;
            }
        }

        return null;
    }

    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => {
            if (key.includes('[') && key.includes(']')) {
                const [arrayKey, indexStr] = key.split('[');
                const index = parseInt(indexStr.replace(']', ''));
                return current?.[arrayKey]?.[index];
            }
            return current?.[key];
        }, obj);
    }

    private async makeRequest(endpoint: string, data: any): Promise<any> {
        const headers = this.buildHeaders();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, this.config.timeout || 30000);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
                signal: controller.signal
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API error: ${response.status} ${errorText}`);
            }

            return await response.json();
        } finally {
            clearTimeout(timeoutId);
        }
    }

    private async makeStreamRequest(endpoint: string, data: any): Promise<Response> {
        const headers = {
            ...this.buildHeaders(),
            'Accept': 'text/event-stream'
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, this.config.timeout || 120000);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
                signal: controller.signal
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API error: ${response.status} ${errorText}`);
            }

            return response;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    private buildHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        const auth = this.genericConfig.auth;

        switch (auth.type) {
            case 'bearer':
                headers['Authorization'] = `Bearer ${auth.credentials || this.config.apiKey}`;
                break;
            case 'apikey':
                if (auth.headerName) {
                    headers[auth.headerName] = `${auth.headerPrefix || ''}${auth.credentials || this.config.apiKey}`;
                } else {
                    headers['X-API-Key'] = auth.credentials || this.config.apiKey;
                }
                break;
            case 'basic':
                headers['Authorization'] = `Basic ${btoa(auth.credentials || this.config.apiKey)}`;
                break;
            case 'custom':
                if (auth.headerName) {
                    headers[auth.headerName] = `${auth.headerPrefix || ''}${auth.credentials || this.config.apiKey}`;
                }
                break;
        }

        return headers;
    }
}

// 预定义的常见API格式配置
export const CommonProviderConfigs = {
    // OpenAI兼容格式
    OpenAICompatible: {
        requestFormat: {
            messagesField: 'messages',
            modelField: 'model',
            maxTokensField: 'max_tokens',
            temperatureField: 'temperature',
            streamField: 'stream'
        },
        responseFormat: {
            contentPath: 'choices[0].message.content',
            usagePath: 'usage',
            modelPath: 'model',
            finishReasonPath: 'choices[0].finish_reason'
        },
        streamFormat: {
            contentPath: 'choices[0].delta.content',
            donePath: 'choices[0].finish_reason',
            dataPrefix: 'data: ',
            doneMarker: '[DONE]'
        },
        auth: { type: 'bearer' as const }
    },

    // Hugging Face格式
    HuggingFace: {
        requestFormat: {
            messagesField: 'inputs',
            maxTokensField: 'parameters.max_new_tokens',
            temperatureField: 'parameters.temperature'
        },
        responseFormat: {
            contentPath: '[0].generated_text'
        },
        auth: { type: 'bearer' as const }
    },

    // 自定义简单格式
    Simple: {
        requestFormat: {
            messagesField: 'prompt',
            maxTokensField: 'max_length',
            temperatureField: 'temperature'
        },
        responseFormat: {
            contentPath: 'response'
        },
        auth: { type: 'apikey' as const, headerName: 'X-API-Key' }
    }
};
