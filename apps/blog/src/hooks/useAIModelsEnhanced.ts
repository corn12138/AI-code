'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { defaultLLMConfig, LLMManager, LLMManagerConfig, LLMMessage, LLMResponse, StreamingLLMResponse } from '../services/llm';

// 增强的AI模型管理Hook
interface ModelCapability {
    name: string;
    maxTokens: number;
    multimodal: boolean;
    tools: boolean;
    streaming: boolean;
    languages: string[];
    costPerToken: number;
    speed: 'fast' | 'medium' | 'slow';
    provider: string;
    contextWindow: number;
    supportedFormats: string[];
}

interface ModelUsage {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    averageLatency: number;
    errorRate: number;
    lastUsed: Date;
}

interface ModelComparison {
    models: string[];
    comparison: {
        cost: Record<string, number>;
        speed: Record<string, string>;
        features: Record<string, string[]>;
        maxTokens: Record<string, number>;
    };
    recommendation: string;
}

interface UseAIModelsEnhancedReturn {
    // 基础模型管理（兼容原接口）
    availableModels: Record<string, ModelCapability>;
    modelCapabilities: Record<string, ModelCapability>;
    currentModel: string;
    setCurrentModel: (model: string) => void;
    isLoading: boolean;
    error: string | null;
    getModelByProvider: (provider: string) => ModelCapability[];
    getModelUsage: (modelId: string) => ModelUsage | null;
    refreshModels: () => Promise<void>;
    compareModels: (modelIds: string[]) => ModelComparison;

    // 新增的企业级功能
    llmManager: LLMManager | null;
    chat: (messages: LLMMessage[], options?: { model?: string; maxTokens?: number; temperature?: number }) => Promise<LLMResponse>;
    chatStream: (messages: LLMMessage[], options?: { model?: string; maxTokens?: number; temperature?: number }) => AsyncGenerator<StreamingLLMResponse, void, unknown>;
    embeddings: (texts: string[], model?: string) => Promise<number[][]>;
    getSystemStatus: () => ReturnType<LLMManager['getStatus']> | null;
    updateConfig: (config: Partial<LLMManagerConfig>) => void;
    getRecommendedModel: (requirements: ModelRequirements) => string;
    preloadModel: (modelId: string) => Promise<void>;
    checkModelHealth: (modelId: string) => Promise<boolean>;
    getModelPerformance: (modelId: string) => Promise<any>;
}

interface ModelRequirements {
    budget?: 'low' | 'medium' | 'high';
    speed?: 'fast' | 'medium' | 'slow';
    multimodal?: boolean;
    tools?: boolean;
    contextLength?: 'small' | 'medium' | 'large';
}

// 从环境变量或配置中获取LLM配置
const getLLMConfig = (): LLMManagerConfig => {
    const config = { ...defaultLLMConfig };

    // 如果有环境变量配置，覆盖默认配置
    if (typeof window !== 'undefined') {
        const userConfig = localStorage.getItem('llm_config');
        if (userConfig) {
            try {
                const parsed = JSON.parse(userConfig);
                Object.assign(config, parsed);
            } catch (error) {
                console.warn('Failed to parse LLM config from localStorage:', error);
            }
        }
    }

    return config;
};

// 转换LLM提供商配置为ModelCapability格式
const convertProviderToModelCapability = (provider: any): ModelCapability => {
    const modelId = provider.config.model;

    return {
        name: getModelDisplayName(modelId),
        maxTokens: provider.config.maxTokens || 4096,
        multimodal: isMultimodal(modelId),
        tools: supportsTools(modelId),
        streaming: true,
        languages: getSupportedLanguages(modelId),
        costPerToken: getCostPerToken(modelId),
        speed: getModelSpeed(modelId),
        provider: getProviderDisplayName(provider.type),
        contextWindow: getContextWindow(modelId),
        supportedFormats: getSupportedFormats(modelId)
    };
};

// 辅助函数
const getModelDisplayName = (model: string): string => {
    const names: Record<string, string> = {
        'gpt-4': 'GPT-4',
        'gpt-4-turbo': 'GPT-4 Turbo',
        'gpt-4-turbo-preview': 'GPT-4 Turbo Preview',
        'gpt-3.5-turbo': 'GPT-3.5 Turbo',
        'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
        'claude-3-opus-20240229': 'Claude 3 Opus',
        'claude-3-sonnet-20240229': 'Claude 3 Sonnet',
        'claude-3-haiku-20240307': 'Claude 3 Haiku',
        'claude-2.1': 'Claude 2.1',
        'claude-2.0': 'Claude 2.0'
    };
    return names[model] || model;
};

const getProviderDisplayName = (type: string): string => {
    const names: Record<string, string> = {
        'openai': 'OpenAI',
        'claude': 'Anthropic',
        'generic': 'Custom Provider'
    };
    return names[type] || type;
};

const isMultimodal = (model: string): boolean => {
    return model.includes('gpt-4') || model.includes('claude-3');
};

const supportsTools = (model: string): boolean => {
    return !model.includes('claude-3-haiku'); // Haiku通常不支持工具
};

const getSupportedLanguages = (model: string): string[] => {
    return ['en', 'zh', 'ja', 'ko', 'fr', 'de', 'es', 'pt', 'ru', 'ar'];
};

const getCostPerToken = (model: string): number => {
    const pricing: Record<string, number> = {
        'gpt-4': 0.03,
        'gpt-4-turbo': 0.01,
        'gpt-3.5-turbo': 0.0015,
        'claude-3-opus': 0.015,
        'claude-3-sonnet': 0.003,
        'claude-3-haiku': 0.00025,
        'claude-2.1': 0.008,
        'claude-2.0': 0.008
    };
    return pricing[model] || 0.002;
};

const getModelSpeed = (model: string): 'fast' | 'medium' | 'slow' => {
    if (model.includes('turbo') || model.includes('haiku')) return 'fast';
    if (model.includes('opus')) return 'slow';
    return 'medium';
};

const getContextWindow = (model: string): number => {
    if (model.includes('gpt-4-turbo') || model.includes('claude-3')) return 128000;
    if (model.includes('claude-2')) return 100000;
    if (model.includes('gpt-4')) return 8192;
    if (model.includes('gpt-3.5-turbo-16k')) return 16384;
    return 4096;
};

const getSupportedFormats = (model: string): string[] => {
    const formats = ['text', 'json', 'markdown'];
    if (isMultimodal(model)) {
        formats.push('image');
    }
    return formats;
};

export const useAIModelsEnhanced = (): UseAIModelsEnhancedReturn => {
    const [llmManager, setLlmManager] = useState<LLMManager | null>(null);
    const [currentModel, setCurrentModel] = useState<string>('gpt-4-turbo');
    const [modelUsage, setModelUsage] = useState<Record<string, ModelUsage>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [config, setConfig] = useState<LLMManagerConfig>(getLLMConfig());

    // 初始化LLM管理器
    useEffect(() => {
        try {
            const manager = new LLMManager(config);
            setLlmManager(manager);
            setIsLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to initialize LLM manager');
            setIsLoading(false);
        }

        return () => {
            if (llmManager) {
                llmManager.destroy();
            }
        };
    }, [config]);

    // 获取可用模型列表
    const availableModels = useMemo((): Record<string, ModelCapability> => {
        if (!llmManager) return {};

        const models: Record<string, ModelCapability> = {};
        config.providers
            .filter(provider => provider.enabled)
            .forEach(provider => {
                const modelId = provider.config.model;
                models[modelId] = convertProviderToModelCapability(provider);
            });

        return models;
    }, [config, llmManager]);

    const modelCapabilities = availableModels;

    // 初始化模型使用统计
    useEffect(() => {
        const initialUsage: Record<string, ModelUsage> = {};
        Object.keys(availableModels).forEach(modelId => {
            initialUsage[modelId] = {
                totalRequests: 0,
                totalTokens: 0,
                totalCost: 0,
                averageLatency: 0,
                errorRate: 0,
                lastUsed: new Date()
            };
        });
        setModelUsage(initialUsage);
    }, [availableModels]);

    // 按提供商筛选模型
    const getModelByProvider = useCallback((provider: string): ModelCapability[] => {
        return Object.values(modelCapabilities).filter(
            model => model.provider.toLowerCase() === provider.toLowerCase()
        );
    }, [modelCapabilities]);

    // 获取模型使用统计
    const getModelUsage = useCallback((modelId: string): ModelUsage | null => {
        return modelUsage[modelId] || null;
    }, [modelUsage]);

    // 刷新模型列表
    const refreshModels = useCallback(async (): Promise<void> => {
        if (!llmManager) return;

        setIsLoading(true);
        setError(null);

        try {
            // 获取系统状态来更新指标
            const status = llmManager.getStatus();

            // 更新指标
            const updatedUsage: Record<string, ModelUsage> = {};
            Object.entries(status.providers).forEach(([providerName, providerMetrics]) => {
                const provider = config.providers.find(p => p.name === providerName);
                if (provider) {
                    const modelId = provider.config.model;
                    updatedUsage[modelId] = {
                        totalRequests: providerMetrics.totalRequests,
                        totalTokens: Math.round(providerMetrics.totalRequests * providerMetrics.averageTokensPerRequest),
                        totalCost: providerMetrics.totalCost,
                        averageLatency: providerMetrics.averageLatency,
                        errorRate: providerMetrics.errorRate,
                        lastUsed: providerMetrics.lastRequestTime
                    };
                }
            });

            setModelUsage(updatedUsage);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to refresh models');
        } finally {
            setIsLoading(false);
        }
    }, [llmManager, config]);

    // 模型比较
    const compareModels = useCallback((modelIds: string[]): ModelComparison => {
        const models = modelIds.filter(id => modelCapabilities[id]);

        const comparison = {
            cost: {} as Record<string, number>,
            speed: {} as Record<string, string>,
            features: {} as Record<string, string[]>,
            maxTokens: {} as Record<string, number>
        };

        models.forEach(modelId => {
            const model = modelCapabilities[modelId];
            comparison.cost[modelId] = model.costPerToken;
            comparison.speed[modelId] = model.speed;
            comparison.features[modelId] = [
                ...(model.multimodal ? ['Multimodal'] : []),
                ...(model.tools ? ['Tools'] : []),
                ...(model.streaming ? ['Streaming'] : [])
            ];
            comparison.maxTokens[modelId] = model.maxTokens;
        });

        // 生成推荐
        let recommendation = '';
        const sortedByCost = models.sort((a, b) =>
            modelCapabilities[a].costPerToken - modelCapabilities[b].costPerToken
        );
        const fastestModels = models.filter(id =>
            modelCapabilities[id].speed === 'fast'
        );

        if (models.length > 0) {
            if (fastestModels.length > 0) {
                recommendation = `For speed: ${fastestModels[0]}. `;
            }
            recommendation += `For cost: ${sortedByCost[0]}.`;
        }

        return {
            models,
            comparison,
            recommendation
        };
    }, [modelCapabilities]);

    // 聊天功能
    const chat = useCallback(async (
        messages: LLMMessage[],
        options?: { model?: string; maxTokens?: number; temperature?: number }
    ): Promise<LLMResponse> => {
        if (!llmManager) throw new Error('LLM Manager not initialized');

        return await llmManager.chat(messages, {
            priority: 'normal'
        }, {
            model: options?.model || currentModel,
            maxTokens: options?.maxTokens,
            temperature: options?.temperature
        });
    }, [llmManager, currentModel]);

    // 流式聊天功能
    const chatStream = useCallback(async function* (
        messages: LLMMessage[],
        options?: { model?: string; maxTokens?: number; temperature?: number }
    ): AsyncGenerator<StreamingLLMResponse, void, unknown> {
        if (!llmManager) throw new Error('LLM Manager not initialized');

        yield* llmManager.chatStream(messages, {
            priority: 'normal'
        }, {
            model: options?.model || currentModel,
            maxTokens: options?.maxTokens,
            temperature: options?.temperature
        });
    }, [llmManager, currentModel]);

    // 嵌入向量功能
    const embeddings = useCallback(async (
        texts: string[],
        model?: string
    ): Promise<number[][]> => {
        if (!llmManager) throw new Error('LLM Manager not initialized');

        return await llmManager.embeddings(texts, {
            priority: 'normal'
        }, model);
    }, [llmManager]);

    // 获取系统状态
    const getSystemStatus = useCallback(() => {
        return llmManager?.getStatus() || null;
    }, [llmManager]);

    // 更新配置
    const updateConfig = useCallback((newConfig: Partial<LLMManagerConfig>) => {
        const updatedConfig = { ...config, ...newConfig };
        setConfig(updatedConfig);

        // 保存到localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('llm_config', JSON.stringify(updatedConfig));
        }
    }, [config]);

    // 智能模型推荐
    const getRecommendedModel = useCallback((requirements: ModelRequirements): string => {
        const models = Object.entries(modelCapabilities);

        let filteredModels = models.filter(([_, model]) => {
            if (requirements.multimodal && !model.multimodal) return false;
            if (requirements.tools && !model.tools) return false;
            if (requirements.speed && model.speed !== requirements.speed) return false;

            if (requirements.contextLength) {
                const minTokens = {
                    small: 4096,
                    medium: 16384,
                    large: 65536
                }[requirements.contextLength];

                if (model.maxTokens < minTokens) return false;
            }

            return true;
        });

        if (filteredModels.length === 0) {
            return currentModel; // 返回当前模型作为后备
        }

        // 根据预算排序
        if (requirements.budget) {
            filteredModels.sort(([_, a], [__, b]) => {
                if (requirements.budget === 'low') {
                    return a.costPerToken - b.costPerToken;
                } else if (requirements.budget === 'high') {
                    return b.costPerToken - a.costPerToken;
                }
                return 0; // medium budget
            });
        }

        return filteredModels[0][0];
    }, [modelCapabilities, currentModel]);

    // 模型健康检查
    const checkModelHealth = useCallback(async (modelId: string): Promise<boolean> => {
        if (!llmManager) return false;

        // 使用LLM管理器的健康检查
        const status = llmManager.getStatus();
        const providerMetrics = Object.values(status.providers);

        // 检查可用性
        return providerMetrics.some(metrics => metrics.availability > 0.8);
    }, [llmManager]);

    // 获取模型性能指标
    const getModelPerformance = useCallback(async (modelId: string) => {
        if (!llmManager) return null;

        const status = llmManager.getStatus();
        const provider = config.providers.find(p => p.config.model === modelId);

        if (provider && status.providers[provider.name]) {
            return status.providers[provider.name];
        }

        return null;
    }, [llmManager, config]);

    // 预加载模型
    const preloadModel = useCallback(async (modelId: string): Promise<void> => {
        // 这里可以实现模型预加载逻辑
        // 对于云端API，通常是发送一个小的测试请求来"唤醒"模型
        try {
            if (llmManager) {
                await llmManager.chat([
                    { role: 'user', content: 'ping' }
                ], { priority: 'low' }, { model: modelId, maxTokens: 1 });
            }
        } catch (error) {
            console.warn(`Failed to preload model ${modelId}:`, error);
        }
    }, [llmManager]);

    // 自动刷新模型状态
    useEffect(() => {
        if (!llmManager) return;

        const interval = setInterval(() => {
            refreshModels();
        }, 5 * 60 * 1000); // 每5分钟刷新一次

        return () => clearInterval(interval);
    }, [refreshModels, llmManager]);

    // 持久化当前模型选择
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('selected-model', currentModel);
        }
    }, [currentModel]);

    // 恢复保存的模型选择
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedModel = localStorage.getItem('selected-model');
            if (savedModel && savedModel !== currentModel) {
                setCurrentModel(savedModel);
            }
        }
    }, []);

    return {
        // 基础接口（兼容原有代码）
        availableModels,
        modelCapabilities,
        currentModel,
        setCurrentModel,
        isLoading,
        error,
        getModelByProvider,
        getModelUsage,
        refreshModels,
        compareModels,

        // 新增的企业级功能
        llmManager,
        chat,
        chatStream,
        embeddings,
        getSystemStatus,
        updateConfig,
        getRecommendedModel,
        preloadModel,
        checkModelHealth,
        getModelPerformance
    };
};
