'use client';

import { LLMManager } from '../../llm/LLMManager';
import { ToolRegistry } from '../../tools/ToolRegistry';
import { ModelManager } from '../core/ModelManager';
import { PRETRAINED_MODELS } from '../models/PretrainedModels';
import { DataProcessor } from '../processors/DataProcessors';

// TensorFlow.js AI Assistant integration configuration
export interface TensorFlowAIConfig {
    enabled: boolean;
    autoLoadModels: string[]; // Model IDs to auto-load
    cacheModels: boolean;
    maxModelMemory: number; // Maximum memory for models in MB
    enableGPU: boolean;
    fallbackToCPU: boolean;
    performanceMonitoring: boolean;
}

// AI Assistant TensorFlow.js capabilities
export interface AICapability {
    id: string;
    name: string;
    description: string;
    modelId: string;
    inputType: 'text' | 'image' | 'audio' | 'numeric';
    outputType: 'classification' | 'regression' | 'embedding' | 'generation';
    enabled: boolean;
    examples?: string[];
}

// TensorFlow.js integration for AI Assistant
export class AIAssistantTensorFlowIntegration {
    private modelManager: ModelManager;
    private dataProcessor: DataProcessor;
    private toolRegistry: ToolRegistry;
    private llmManager: LLMManager;
    private config: TensorFlowAIConfig;
    private capabilities: Map<string, AICapability> = new Map();

    constructor(
        toolRegistry: ToolRegistry,
        llmManager: LLMManager,
        config: Partial<TensorFlowAIConfig> = {}
    ) {
        this.toolRegistry = toolRegistry;
        this.llmManager = llmManager;

        this.config = {
            enabled: true,
            autoLoadModels: ['sentiment-analysis', 'toxic-comment-detection'],
            cacheModels: true,
            maxModelMemory: 512, // 512 MB
            enableGPU: true,
            fallbackToCPU: true,
            performanceMonitoring: true,
            ...config
        };

        this.modelManager = new ModelManager({
            caching: this.config.cacheModels,
            maxMemoryUsage: this.config.maxModelMemory * 1024 * 1024, // Convert to bytes
            enableGPU: this.config.enableGPU,
            fallbackToCPU: this.config.fallbackToCPU,
            performanceMonitoring: this.config.performanceMonitoring
        });

        this.dataProcessor = new DataProcessor();

        this.setupCapabilities();
        this.registerTools();
    }

    async initialize(): Promise<void> {
        if (!this.config.enabled) return;

        try {
            // Set TensorFlow.js backend
            await this.modelManager.setBackend(this.config.enableGPU ? 'webgl' : 'cpu');

            // Auto-load specified models
            await this.loadAutoModels();

            console.log('TensorFlow.js AI integration initialized successfully');
        } catch (error) {
            console.error('Failed to initialize TensorFlow.js AI integration:', error);
            throw error;
        }
    }

    // Analyze text sentiment
    async analyzeSentiment(text: string): Promise<{
        sentiment: 'positive' | 'negative';
        confidence: number;
        scores: { positive: number; negative: number };
    }> {
        const model = await this.modelManager.loadModel(PRETRAINED_MODELS['sentiment-analysis']);
        const processed = await this.dataProcessor.preprocessText(text, { maxLength: 100 });

        const prediction = await this.modelManager.predict(model.id, {
            data: processed.tensor,
            preprocessed: true
        });

        const scores = prediction.predictions as number[];
        const positiveScore = scores[1];
        const negativeScore = scores[0];

        return {
            sentiment: positiveScore > negativeScore ? 'positive' : 'negative',
            confidence: Math.max(positiveScore, negativeScore),
            scores: {
                positive: positiveScore,
                negative: negativeScore
            }
        };
    }

    // Detect toxic content
    async detectToxicity(text: string): Promise<{
        isToxic: boolean;
        confidence: number;
        toxicityTypes: Array<{
            type: string;
            score: number;
        }>;
    }> {
        const model = await this.modelManager.loadModel(PRETRAINED_MODELS['toxic-comment-detection']);
        const processed = await this.dataProcessor.preprocessText(text, { maxLength: 200 });

        const prediction = await this.modelManager.predict(model.id, {
            data: processed.tensor,
            preprocessed: true
        });

        const scores = prediction.predictions as number[];
        const labels = ['toxic', 'severe_toxic', 'obscene', 'threat', 'insult', 'identity_hate'];

        const toxicityTypes = labels.map((label, index) => ({
            type: label,
            score: scores[index]
        })).filter(item => item.score > 0.5);

        const maxScore = Math.max(...scores);

        return {
            isToxic: maxScore > 0.5,
            confidence: maxScore,
            toxicityTypes
        };
    }

    // Generate text embeddings
    async generateTextEmbedding(text: string): Promise<{
        embedding: number[];
        dimensions: number;
    }> {
        const model = await this.modelManager.loadModel(PRETRAINED_MODELS['universal-sentence-encoder']);
        const processed = await this.dataProcessor.preprocessText(text);

        const prediction = await this.modelManager.predict(model.id, {
            data: processed.tensor,
            preprocessed: true
        });

        const embedding = prediction.predictions as number[];

        return {
            embedding,
            dimensions: embedding.length
        };
    }

    // Calculate text similarity
    async calculateTextSimilarity(text1: string, text2: string): Promise<{
        similarity: number;
        method: 'cosine';
    }> {
        const [embedding1, embedding2] = await Promise.all([
            this.generateTextEmbedding(text1),
            this.generateTextEmbedding(text2)
        ]);

        // Calculate cosine similarity
        const similarity = this.cosineSimilarity(embedding1.embedding, embedding2.embedding);

        return {
            similarity,
            method: 'cosine'
        };
    }

    // Classify image content
    async classifyImage(imageData: ImageData | HTMLImageElement | HTMLCanvasElement): Promise<{
        predictions: Array<{
            className: string;
            probability: number;
        }>;
        topPrediction: string;
        confidence: number;
    }> {
        const model = await this.modelManager.loadModel(PRETRAINED_MODELS['mobilenet-v2']);
        const processed = await this.dataProcessor.preprocessImage(imageData);

        const prediction = await this.modelManager.predict(model.id, {
            data: processed.tensor,
            preprocessed: true
        });

        const probabilities = prediction.predictions as number[];
        const labels = model.config.labels || [];

        const predictions = labels.map((label, index) => ({
            className: label,
            probability: probabilities[index]
        })).sort((a, b) => b.probability - a.probability);

        return {
            predictions: predictions.slice(0, 5), // Top 5 predictions
            topPrediction: predictions[0].className,
            confidence: predictions[0].probability
        };
    }

    // Get available AI capabilities
    getCapabilities(): AICapability[] {
        return Array.from(this.capabilities.values()).filter(cap => cap.enabled);
    }

    // Enable/disable specific capability
    toggleCapability(capabilityId: string, enabled: boolean): void {
        const capability = this.capabilities.get(capabilityId);
        if (capability) {
            capability.enabled = enabled;
        }
    }

    // Get model performance metrics
    async getModelMetrics(): Promise<Array<{
        modelId: string;
        loadTime: number;
        averageInferenceTime: number;
        totalInferences: number;
        memoryUsage: number;
        lastUsed: Date;
    }>> {
        const loadedModels = this.modelManager.getLoadedModels();

        return loadedModels.map(metadata => ({
            modelId: metadata.id,
            loadTime: metadata.loadedAt ? Date.now() - metadata.loadedAt.getTime() : 0,
            averageInferenceTime: metadata.performance?.averageInferenceTime || 0,
            totalInferences: metadata.performance?.totalInferences || 0,
            memoryUsage: metadata.memoryUsage || 0,
            lastUsed: metadata.lastUsed || new Date()
        }));
    }

    private setupCapabilities(): void {
        const capabilities: AICapability[] = [
            {
                id: 'sentiment-analysis',
                name: 'Sentiment Analysis',
                description: 'Analyze the emotional tone of text content',
                modelId: 'sentiment-analysis',
                inputType: 'text',
                outputType: 'classification',
                enabled: true,
                examples: [
                    'This movie is amazing!',
                    'I hate waiting in long lines.',
                    'The weather is perfect today.'
                ]
            },
            {
                id: 'toxicity-detection',
                name: 'Toxicity Detection',
                description: 'Detect harmful or toxic content in text',
                modelId: 'toxic-comment-detection',
                inputType: 'text',
                outputType: 'classification',
                enabled: true,
                examples: [
                    'You are such an idiot!',
                    'Great job on the project!',
                    'This is inappropriate content.'
                ]
            },
            {
                id: 'text-similarity',
                name: 'Text Similarity',
                description: 'Calculate semantic similarity between texts',
                modelId: 'universal-sentence-encoder',
                inputType: 'text',
                outputType: 'embedding',
                enabled: true,
                examples: [
                    'Compare: "I love dogs" vs "Dogs are amazing"',
                    'Compare: "Red car" vs "Blue bicycle"'
                ]
            },
            {
                id: 'image-classification',
                name: 'Image Classification',
                description: 'Identify objects and scenes in images',
                modelId: 'mobilenet-v2',
                inputType: 'image',
                outputType: 'classification',
                enabled: true,
                examples: [
                    'Upload an image to classify objects',
                    'Identify animals, vehicles, or everyday objects'
                ]
            }
        ];

        capabilities.forEach(cap => {
            this.capabilities.set(cap.id, cap);
        });
    }

    private registerTools(): void {
        // Register TensorFlow.js tools with the tool registry
        this.toolRegistry.registerTool('analyze_sentiment', {
            name: 'Sentiment Analysis',
            description: 'Analyze the sentiment of text using TensorFlow.js',
            parameters: {
                text: {
                    type: 'string',
                    description: 'Text to analyze for sentiment',
                    required: true
                }
            },
            execute: async (params: { text: string }) => {
                return await this.analyzeSentiment(params.text);
            }
        });

        this.toolRegistry.registerTool('detect_toxicity', {
            name: 'Toxicity Detection',
            description: 'Detect toxic content in text using TensorFlow.js',
            parameters: {
                text: {
                    type: 'string',
                    description: 'Text to check for toxicity',
                    required: true
                }
            },
            execute: async (params: { text: string }) => {
                return await this.detectToxicity(params.text);
            }
        });

        this.toolRegistry.registerTool('text_similarity', {
            name: 'Text Similarity',
            description: 'Calculate semantic similarity between two texts',
            parameters: {
                text1: {
                    type: 'string',
                    description: 'First text for comparison',
                    required: true
                },
                text2: {
                    type: 'string',
                    description: 'Second text for comparison',
                    required: true
                }
            },
            execute: async (params: { text1: string; text2: string }) => {
                return await this.calculateTextSimilarity(params.text1, params.text2);
            }
        });

        this.toolRegistry.registerTool('generate_embedding', {
            name: 'Text Embedding',
            description: 'Generate vector embeddings for text using TensorFlow.js',
            parameters: {
                text: {
                    type: 'string',
                    description: 'Text to convert to embedding',
                    required: true
                }
            },
            execute: async (params: { text: string }) => {
                return await this.generateTextEmbedding(params.text);
            }
        });

        console.log('TensorFlow.js tools registered successfully');
    }

    private async loadAutoModels(): Promise<void> {
        for (const modelId of this.config.autoLoadModels) {
            const modelConfig = PRETRAINED_MODELS[modelId];
            if (modelConfig) {
                try {
                    await this.modelManager.loadModel(modelConfig);
                    console.log(`Auto-loaded model: ${modelId}`);
                } catch (error) {
                    console.warn(`Failed to auto-load model ${modelId}:`, error);
                }
            }
        }
    }

    private cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) {
            throw new Error('Vectors must have the same length');
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        if (normA === 0 || normB === 0) {
            return 0;
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    // Cleanup resources
    async dispose(): Promise<void> {
        await this.modelManager.dispose();
        this.capabilities.clear();
        console.log('TensorFlow.js AI integration disposed');
    }
}
