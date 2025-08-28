'use client';

import { useCallback, useEffect, useState } from 'react';

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

interface UseAIModelsReturn {
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

export const useAIModels = (): UseAIModelsReturn => {
    const [availableModels, setAvailableModels] = useState<Record<string, ModelCapability>>({});
    const [modelCapabilities, setModelCapabilities] = useState<Record<string, ModelCapability>>({});
    const [currentModel, setCurrentModel] = useState('gpt-4');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modelUsage, setModelUsage] = useState<Record<string, ModelUsage>>({});

    // 初始化默认模型配置
    const initializeDefaultModels = useCallback(() => {
        const defaultModels: Record<string, ModelCapability> = {
            'gpt-4': {
                name: 'GPT-4',
                maxTokens: 8192,
                multimodal: false,
                tools: true,
                streaming: true,
                languages: ['en', 'zh', 'ja', 'ko', 'fr', 'de', 'es'],
                costPerToken: 0.03,
                speed: 'medium',
                provider: 'OpenAI',
                contextWindow: 8192,
                supportedFormats: ['text', 'json', 'markdown']
            },
            'gpt-4-turbo': {
                name: 'GPT-4 Turbo',
                maxTokens: 128000,
                multimodal: true,
                tools: true,
                streaming: true,
                languages: ['en', 'zh', 'ja', 'ko', 'fr', 'de', 'es'],
                costPerToken: 0.01,
                speed: 'fast',
                provider: 'OpenAI',
                contextWindow: 128000,
                supportedFormats: ['text', 'json', 'markdown', 'image']
            },
            'gpt-3.5-turbo': {
                name: 'GPT-3.5 Turbo',
                maxTokens: 16385,
                multimodal: false,
                tools: true,
                streaming: true,
                languages: ['en', 'zh', 'ja', 'ko', 'fr', 'de', 'es'],
                costPerToken: 0.001,
                speed: 'fast',
                provider: 'OpenAI',
                contextWindow: 16385,
                supportedFormats: ['text', 'json', 'markdown']
            },
            'claude-3-opus': {
                name: 'Claude 3 Opus',
                maxTokens: 200000,
                multimodal: true,
                tools: true,
                streaming: true,
                languages: ['en', 'zh', 'ja', 'ko', 'fr', 'de', 'es'],
                costPerToken: 0.015,
                speed: 'medium',
                provider: 'Anthropic',
                contextWindow: 200000,
                supportedFormats: ['text', 'json', 'markdown', 'image']
            },
            'claude-3-sonnet': {
                name: 'Claude 3 Sonnet',
                maxTokens: 200000,
                multimodal: true,
                tools: true,
                streaming: true,
                languages: ['en', 'zh', 'ja', 'ko', 'fr', 'de', 'es'],
                costPerToken: 0.003,
                speed: 'fast',
                provider: 'Anthropic',
                contextWindow: 200000,
                supportedFormats: ['text', 'json', 'markdown', 'image']
            },
            'claude-3-haiku': {
                name: 'Claude 3 Haiku',
                maxTokens: 200000,
                multimodal: true,
                tools: false,
                streaming: true,
                languages: ['en', 'zh', 'ja', 'ko', 'fr', 'de', 'es'],
                costPerToken: 0.00025,
                speed: 'fast',
                provider: 'Anthropic',
                contextWindow: 200000,
                supportedFormats: ['text', 'json', 'markdown', 'image']
            },
            'gemini-pro': {
                name: 'Gemini Pro',
                maxTokens: 32768,
                multimodal: true,
                tools: true,
                streaming: true,
                languages: ['en', 'zh', 'ja', 'ko', 'fr', 'de', 'es'],
                costPerToken: 0.001,
                speed: 'fast',
                provider: 'Google',
                contextWindow: 32768,
                supportedFormats: ['text', 'json', 'markdown', 'image', 'video', 'audio']
            },
            'llama-2-70b': {
                name: 'Llama 2 70B',
                maxTokens: 4096,
                multimodal: false,
                tools: false,
                streaming: true,
                languages: ['en', 'zh', 'fr', 'de', 'es'],
                costPerToken: 0.0007,
                speed: 'medium',
                provider: 'Meta',
                contextWindow: 4096,
                supportedFormats: ['text', 'json', 'markdown']
            },
            'mixtral-8x7b': {
                name: 'Mixtral 8x7B',
                maxTokens: 32768,
                multimodal: false,
                tools: true,
                streaming: true,
                languages: ['en', 'zh', 'fr', 'de', 'es'],
                costPerToken: 0.0006,
                speed: 'fast',
                provider: 'Mistral',
                contextWindow: 32768,
                supportedFormats: ['text', 'json', 'markdown']
            }
        };

        setAvailableModels(defaultModels);
        setModelCapabilities(defaultModels);
        setIsLoading(false);
    }, []);

    // 从API获取模型列表
    const fetchModels = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/models');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setAvailableModels(data.models || {});
            setModelCapabilities(data.capabilities || {});

            // 获取使用统计
            const usageResponse = await fetch('/api/models/usage');
            if (usageResponse.ok) {
                const usageData = await usageResponse.json();
                setModelUsage(usageData.usage || {});
            }
        } catch (err) {
            console.error('Failed to fetch models:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch models');
            // 回退到默认模型
            initializeDefaultModels();
        } finally {
            setIsLoading(false);
        }
    }, [initializeDefaultModels]);

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
    const refreshModels = useCallback(async () => {
        await fetchModels();
    }, [fetchModels]);

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

    // 智能模型推荐
    const getRecommendedModel = useCallback((
        requirements: {
            budget?: 'low' | 'medium' | 'high';
            speed?: 'fast' | 'medium' | 'slow';
            multimodal?: boolean;
            tools?: boolean;
            contextLength?: 'small' | 'medium' | 'large';
        }
    ): string => {
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
        try {
            const response = await fetch(`/api/models/${modelId}/health`);
            return response.ok;
        } catch {
            return false;
        }
    }, []);

    // 获取模型性能指标
    const getModelPerformance = useCallback(async (modelId: string) => {
        try {
            const response = await fetch(`/api/models/${modelId}/performance`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Failed to get model performance:', error);
        }
        return null;
    }, []);

    // 预加载模型
    const preloadModel = useCallback(async (modelId: string) => {
        try {
            await fetch(`/api/models/${modelId}/preload`, { method: 'POST' });
        } catch (error) {
            console.error('Failed to preload model:', error);
        }
    }, []);

    // 监控模型使用情况
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const response = await fetch('/api/models/usage');
                if (response.ok) {
                    const data = await response.json();
                    setModelUsage(data.usage || {});
                }
            } catch (error) {
                console.error('Failed to update model usage:', error);
            }
        }, 60000); // 每分钟更新一次

        return () => clearInterval(interval);
    }, []);

    // 初始化
    useEffect(() => {
        fetchModels();
    }, [fetchModels]);

    // 持久化当前模型选择
    useEffect(() => {
        localStorage.setItem('selected-model', currentModel);
    }, [currentModel]);

    // 恢复保存的模型选择
    useEffect(() => {
        const savedModel = localStorage.getItem('selected-model');
        if (savedModel && savedModel !== currentModel) {
            setCurrentModel(savedModel);
        }
    }, []);

    return {
        availableModels,
        modelCapabilities,
        currentModel,
        setCurrentModel,
        isLoading,
        error,
        getModelByProvider,
        getModelUsage,
        refreshModels,
        compareModels
    };
};
