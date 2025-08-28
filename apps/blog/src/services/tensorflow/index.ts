'use client';

// Core TensorFlow.js exports
export {
    ModelManager
} from './core/ModelManager';
export type {
    ModelConfig,
    ModelMetadata,
    PredictionInput,
    PredictionOutput
} from './core/ModelManager';

// Pre-trained models
export {
    PRETRAINED_MODELS
} from './models/PretrainedModels';

// Data processors
export {
    DataProcessor
} from './processors/DataProcessors';

// AI Assistant integration
export {
    AIAssistantTensorFlowIntegration
} from './integrations/AIAssistantTensorFlowIntegration';
export type {
    AICapability,
    TensorFlowAIConfig
} from './integrations/AIAssistantTensorFlowIntegration';

// TensorFlow.js builder for easy setup
export class TensorFlowBuilder {
    static createModelManager(config?: {
        caching?: boolean;
        maxMemoryUsage?: number;
        enableGPU?: boolean;
        fallbackToCPU?: boolean;
    }) {
        return new ModelManager({
            caching: config?.caching ?? true,
            maxMemoryUsage: config?.maxMemoryUsage ?? 512 * 1024 * 1024, // 512MB
            enableGPU: config?.enableGPU ?? true,
            fallbackToCPU: config?.fallbackToCPU ?? true,
            performanceMonitoring: true
        });
    }

    static createAIIntegration(
        toolRegistry: any,
        llmManager: any,
        config?: Partial<TensorFlowAIConfig>
    ) {
        return new AIAssistantTensorFlowIntegration(toolRegistry, llmManager, config);
    }

    static createBasicSetup(toolRegistry: any, llmManager: any) {
        const integration = new AIAssistantTensorFlowIntegration(toolRegistry, llmManager, {
            enabled: true,
            autoLoadModels: ['sentiment-analysis'],
            cacheModels: true,
            enableGPU: true,
            fallbackToCPU: true
        });

        return integration;
    }

    static createAdvancedSetup(toolRegistry: any, llmManager: any) {
        const integration = new AIAssistantTensorFlowIntegration(toolRegistry, llmManager, {
            enabled: true,
            autoLoadModels: [
                'sentiment-analysis',
                'toxic-comment-detection',
                'universal-sentence-encoder'
            ],
            cacheModels: true,
            maxModelMemory: 1024, // 1GB
            enableGPU: true,
            fallbackToCPU: true,
            performanceMonitoring: true
        });

        return integration;
    }
}

// TensorFlow.js presets for different use cases
export const TENSORFLOW_PRESETS = {
    // Basic NLP capabilities
    NLP_BASIC: {
        enabled: true,
        autoLoadModels: ['sentiment-analysis'],
        cacheModels: true,
        maxModelMemory: 256,
        enableGPU: true,
        fallbackToCPU: true,
        performanceMonitoring: false
    },

    // Advanced NLP with embeddings
    NLP_ADVANCED: {
        enabled: true,
        autoLoadModels: [
            'sentiment-analysis',
            'toxic-comment-detection',
            'universal-sentence-encoder'
        ],
        cacheModels: true,
        maxModelMemory: 512,
        enableGPU: true,
        fallbackToCPU: true,
        performanceMonitoring: true
    },

    // Vision capabilities
    VISION: {
        enabled: true,
        autoLoadModels: [
            'mobilenet-v2',
            'coco-ssd',
            'facemesh'
        ],
        cacheModels: true,
        maxModelMemory: 1024,
        enableGPU: true,
        fallbackToCPU: true,
        performanceMonitoring: true
    },

    // Full AI suite
    FULL_AI: {
        enabled: true,
        autoLoadModels: [
            'sentiment-analysis',
            'toxic-comment-detection',
            'universal-sentence-encoder',
            'mobilenet-v2',
            'coco-ssd'
        ],
        cacheModels: true,
        maxModelMemory: 2048,
        enableGPU: true,
        fallbackToCPU: true,
        performanceMonitoring: true
    },

    // Development/testing
    DEVELOPMENT: {
        enabled: true,
        autoLoadModels: ['sentiment-analysis'],
        cacheModels: false, // Don't cache in development
        maxModelMemory: 256,
        enableGPU: false, // Use CPU for consistent testing
        fallbackToCPU: true,
        performanceMonitoring: true
    },

    // Minimal setup for low-resource environments
    MINIMAL: {
        enabled: true,
        autoLoadModels: [], // Load models on demand
        cacheModels: false,
        maxModelMemory: 128,
        enableGPU: false,
        fallbackToCPU: true,
        performanceMonitoring: false
    }
};

// Utility functions for TensorFlow.js
export const TensorFlowUtils = {
    // Get model recommendations based on use case
    getModelRecommendations: (useCase: 'content-moderation' | 'search' | 'classification' | 'vision') => {
        switch (useCase) {
            case 'content-moderation':
                return [
                    PRETRAINED_MODELS['sentiment-analysis'],
                    PRETRAINED_MODELS['toxic-comment-detection']
                ];
            case 'search':
                return [
                    PRETRAINED_MODELS['universal-sentence-encoder']
                ];
            case 'classification':
                return [
                    PRETRAINED_MODELS['sentiment-analysis'],
                    PRETRAINED_MODELS['mobilenet-v2']
                ];
            case 'vision':
                return [
                    PRETRAINED_MODELS['mobilenet-v2'],
                    PRETRAINED_MODELS['coco-ssd'],
                    PRETRAINED_MODELS['facemesh']
                ];
            default:
                return [];
        }
    },

    // Check browser compatibility
    checkBrowserCompatibility: async (): Promise<{
        webgl: boolean;
        webgpu: boolean;
        simd: boolean;
        recommended: 'webgl' | 'cpu';
    }> => {
        let webgl = false;
        let webgpu = false;
        let simd = false;

        try {
            // Check WebGL support
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            webgl = !!gl;
        } catch (e) {
            webgl = false;
        }

        try {
            // Check WebGPU support
            webgpu = 'gpu' in navigator;
        } catch (e) {
            webgpu = false;
        }

        try {
            // Check SIMD support
            simd = typeof WebAssembly !== 'undefined' &&
                WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0]));
        } catch (e) {
            simd = false;
        }

        const recommended = webgl ? 'webgl' : 'cpu';

        return { webgl, webgpu, simd, recommended };
    },

    // Estimate memory usage for models
    estimateMemoryUsage: (modelConfigs: ModelConfig[]): number => {
        return modelConfigs.reduce((total, config) => {
            // Rough estimation based on model type
            let size = 10; // Base size in MB

            if (config.type === 'vision') size += 20;
            if (config.type === 'nlp') size += 15;
            if (config.type === 'embedding') size += 25;

            return total + size;
        }, 0);
    },

    // Performance benchmarking
    benchmarkModel: async (modelManager: ModelManager, modelId: string, iterations: number = 10): Promise<{
        averageTime: number;
        minTime: number;
        maxTime: number;
        throughput: number;
    }> => {
        const times: number[] = [];

        for (let i = 0; i < iterations; i++) {
            const start = performance.now();

            // Create dummy input based on model type
            const dummyInput = { data: [1, 2, 3, 4, 5], preprocessed: false };

            try {
                await modelManager.predict(modelId, dummyInput);
            } catch (e) {
                // Model might not be loaded or input might be wrong
                console.warn('Benchmark failed for model:', modelId);
            }

            const end = performance.now();
            times.push(end - start);
        }

        const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        const throughput = 1000 / averageTime; // Predictions per second

        return { averageTime, minTime, maxTime, throughput };
    }
};

// TensorFlow.js model registry for custom models
export class TensorFlowModelRegistry {
    private customModels: Map<string, ModelConfig> = new Map();

    registerModel(config: ModelConfig): void {
        this.customModels.set(config.id, config);
    }

    unregisterModel(modelId: string): void {
        this.customModels.delete(modelId);
    }

    getModel(modelId: string): ModelConfig | undefined {
        return this.customModels.get(modelId) || PRETRAINED_MODELS[modelId];
    }

    getAllModels(): ModelConfig[] {
        const pretrained = Object.values(PRETRAINED_MODELS);
        const custom = Array.from(this.customModels.values());
        return [...pretrained, ...custom];
    }

    getModelsByType(type: ModelConfig['type']): ModelConfig[] {
        return this.getAllModels().filter(model => model.type === type);
    }

    searchModels(query: string): ModelConfig[] {
        const lowerQuery = query.toLowerCase();
        return this.getAllModels().filter(model =>
            model.name.toLowerCase().includes(lowerQuery) ||
            model.id.toLowerCase().includes(lowerQuery) ||
            model.metadata?.description?.toLowerCase().includes(lowerQuery)
        );
    }
}