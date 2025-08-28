'use client';

import { ToolRegistry } from '../../tools/ToolRegistry';
import { ModelConfig, PredictionOutput, TensorFlowModelManager } from '../core/ModelManager';
import { PRETRAINED_MODELS, getModelsByUseCase, getRecommendedModels } from '../models/PretrainedModels';
import { AudioPreprocessor, ImagePreprocessor, TextPreprocessor } from '../processors/DataProcessors';

// AI Assistant TensorFlow Integration
export class AIAssistantTensorFlowIntegration {
    private modelManager: TensorFlowModelManager;
    private toolRegistry: ToolRegistry;
    private textProcessor: TextPreprocessor;
    private loadedModels: Set<string> = new Set();

    constructor(
        modelManager: TensorFlowModelManager,
        toolRegistry: ToolRegistry
    ) {
        this.modelManager = modelManager;
        this.toolRegistry = toolRegistry;
        this.textProcessor = new TextPreprocessor();

        this.registerTensorFlowTools();
    }

    // Register TensorFlow tools with the tool registry
    private registerTensorFlowTools(): void {
        // Image classification tool
        this.toolRegistry.registerTool({
            name: 'image_classify',
            description: 'Classify objects in images using computer vision models',
            parameters: {
                imageUrl: {
                    type: 'string',
                    description: 'URL of the image to classify',
                    required: true
                },
                model: {
                    type: 'string',
                    description: 'Model to use for classification',
                    enum: ['mobilenet-v2'],
                    default: 'mobilenet-v2'
                },
                topK: {
                    type: 'number',
                    description: 'Number of top predictions to return',
                    default: 5
                }
            },
            execute: async (params) => {
                return await this.classifyImage(params.imageUrl, params.model, params.topK);
            }
        });

        // Object detection tool
        this.toolRegistry.registerTool({
            name: 'detect_objects',
            description: 'Detect and locate objects in images',
            parameters: {
                imageUrl: {
                    type: 'string',
                    description: 'URL of the image to analyze',
                    required: true
                },
                threshold: {
                    type: 'number',
                    description: 'Confidence threshold for detections',
                    default: 0.5
                }
            },
            execute: async (params) => {
                return await this.detectObjects(params.imageUrl, params.threshold);
            }
        });

        // Sentiment analysis tool
        this.toolRegistry.registerTool({
            name: 'analyze_sentiment',
            description: 'Analyze the sentiment of text as positive or negative',
            parameters: {
                text: {
                    type: 'string',
                    description: 'Text to analyze',
                    required: true
                }
            },
            execute: async (params) => {
                return await this.analyzeSentiment(params.text);
            }
        });

        // Text toxicity detection tool
        this.toolRegistry.registerTool({
            name: 'detect_toxicity',
            description: 'Detect toxic content in text',
            parameters: {
                text: {
                    type: 'string',
                    description: 'Text to analyze for toxicity',
                    required: true
                }
            },
            execute: async (params) => {
                return await this.detectToxicity(params.text);
            }
        });

        // Face landmarks detection tool
        this.toolRegistry.registerTool({
            name: 'detect_face_landmarks',
            description: 'Detect facial landmarks in images',
            parameters: {
                imageUrl: {
                    type: 'string',
                    description: 'URL of the image containing a face',
                    required: true
                }
            },
            execute: async (params) => {
                return await this.detectFaceLandmarks(params.imageUrl);
            }
        });

        // Pose estimation tool
        this.toolRegistry.registerTool({
            name: 'estimate_pose',
            description: 'Estimate human pose keypoints in images',
            parameters: {
                imageUrl: {
                    type: 'string',
                    description: 'URL of the image containing a person',
                    required: true
                }
            },
            execute: async (params) => {
                return await this.estimatePose(params.imageUrl);
            }
        });

        // Speech command recognition tool
        this.toolRegistry.registerTool({
            name: 'recognize_speech_command',
            description: 'Recognize simple voice commands from audio',
            parameters: {
                audioUrl: {
                    type: 'string',
                    description: 'URL of the audio file',
                    required: true
                }
            },
            execute: async (params) => {
                return await this.recognizeSpeechCommand(params.audioUrl);
            }
        });

        // Text embeddings tool
        this.toolRegistry.registerTool({
            name: 'get_text_embeddings',
            description: 'Generate semantic embeddings for text',
            parameters: {
                text: {
                    type: 'string',
                    description: 'Text to encode',
                    required: true
                }
            },
            execute: async (params) => {
                return await this.getTextEmbeddings(params.text);
            }
        });

        // Model information tool
        this.toolRegistry.registerTool({
            name: 'get_model_info',
            description: 'Get information about available TensorFlow models',
            parameters: {
                category: {
                    type: 'string',
                    description: 'Model category to filter by',
                    enum: ['nlp', 'vision', 'audio', 'embedding']
                }
            },
            execute: async (params) => {
                return await this.getModelInfo(params.category);
            }
        });
    }

    // Load essential models for AI assistant
    async loadEssentialModels(): Promise<void> {
        const essentialModels = [
            'sentiment-analysis',
            'toxic-comment-detection',
            'mobilenet-v2',
            'universal-sentence-encoder'
        ];

        const loadPromises = essentialModels.map(async (modelId) => {
            try {
                const config = PRETRAINED_MODELS[modelId];
                if (config) {
                    await this.modelManager.loadModel(config);
                    this.loadedModels.add(modelId);
                    console.log(`Loaded essential model: ${config.name}`);
                }
            } catch (error) {
                console.warn(`Failed to load essential model ${modelId}:`, error);
            }
        });

        await Promise.allSettled(loadPromises);
    }

    // Image classification
    async classifyImage(imageUrl: string, modelId: string = 'mobilenet-v2', topK: number = 5): Promise<any> {
        try {
            // Ensure model is loaded
            await this.ensureModelLoaded(modelId);

            // Load and preprocess image
            const image = await ImagePreprocessor.loadImageFromUrl(imageUrl);
            const input = await ImagePreprocessor.preprocessForMobileNet(image);

            // Make prediction
            const result = await this.modelManager.predict(modelId, {
                data: input,
                preprocessed: true
            });

            // Get top K predictions with labels
            const predictions = this.getTopKPredictions(result, topK);

            return {
                success: true,
                predictions,
                processingTime: result.processingTime,
                model: modelId
            };

        } catch (error) {
            return {
                success: false,
                error: `Image classification failed: ${error}`
            };
        }
    }

    // Object detection
    async detectObjects(imageUrl: string, threshold: number = 0.5): Promise<any> {
        try {
            const modelId = 'coco-ssd';
            await this.ensureModelLoaded(modelId);

            const image = await ImagePreprocessor.loadImageFromUrl(imageUrl);
            const input = await ImagePreprocessor.preprocessForCocoSsd(image);

            const result = await this.modelManager.predict(modelId, {
                data: input,
                preprocessed: true
            });

            // Process detection results
            const detections = this.processDetectionResults(result, threshold);

            return {
                success: true,
                detections,
                count: detections.length,
                processingTime: result.processingTime
            };

        } catch (error) {
            return {
                success: false,
                error: `Object detection failed: ${error}`
            };
        }
    }

    // Sentiment analysis
    async analyzeSentiment(text: string): Promise<any> {
        try {
            const modelId = 'sentiment-analysis';
            await this.ensureModelLoaded(modelId);

            // Preprocess text
            const encoded = this.textProcessor.encode(text);

            const result = await this.modelManager.predict(modelId, {
                data: encoded,
                preprocessed: true
            });

            return {
                success: true,
                sentiment: result.labels?.[0] || 'unknown',
                confidence: result.confidence || 0,
                probabilities: result.probabilities,
                processingTime: result.processingTime
            };

        } catch (error) {
            return {
                success: false,
                error: `Sentiment analysis failed: ${error}`
            };
        }
    }

    // Toxicity detection
    async detectToxicity(text: string): Promise<any> {
        try {
            const modelId = 'toxic-comment-detection';
            await this.ensureModelLoaded(modelId);

            const encoded = this.textProcessor.encode(text);

            const result = await this.modelManager.predict(modelId, {
                data: encoded,
                preprocessed: true
            });

            const config = PRETRAINED_MODELS[modelId];
            const toxicityScores = this.processToxicityResults(result, config.labels || []);

            return {
                success: true,
                isToxic: toxicityScores.some(score => score.probability > 0.5),
                categories: toxicityScores,
                processingTime: result.processingTime
            };

        } catch (error) {
            return {
                success: false,
                error: `Toxicity detection failed: ${error}`
            };
        }
    }

    // Face landmarks detection
    async detectFaceLandmarks(imageUrl: string): Promise<any> {
        try {
            const modelId = 'face-landmarks';
            await this.ensureModelLoaded(modelId);

            const image = await ImagePreprocessor.loadImageFromUrl(imageUrl);
            const input = ImagePreprocessor.imageToTensor(image, [128, 128]);

            const result = await this.modelManager.predict(modelId, {
                data: input,
                preprocessed: true
            });

            const landmarks = this.processFaceLandmarks(result);

            return {
                success: true,
                landmarks,
                landmarkCount: landmarks.length,
                processingTime: result.processingTime
            };

        } catch (error) {
            return {
                success: false,
                error: `Face landmarks detection failed: ${error}`
            };
        }
    }

    // Pose estimation
    async estimatePose(imageUrl: string): Promise<any> {
        try {
            const modelId = 'posenet';
            await this.ensureModelLoaded(modelId);

            const image = await ImagePreprocessor.loadImageFromUrl(imageUrl);
            const input = ImagePreprocessor.imageToTensor(image, [513, 513]);

            const result = await this.modelManager.predict(modelId, {
                data: input,
                preprocessed: true
            });

            const keypoints = this.processPoseKeypoints(result);

            return {
                success: true,
                keypoints,
                keypointCount: keypoints.length,
                processingTime: result.processingTime
            };

        } catch (error) {
            return {
                success: false,
                error: `Pose estimation failed: ${error}`
            };
        }
    }

    // Speech command recognition
    async recognizeSpeechCommand(audioUrl: string): Promise<any> {
        try {
            const modelId = 'speech-commands';
            await this.ensureModelLoaded(modelId);

            const audioBuffer = await AudioPreprocessor.loadAudioFromUrl(audioUrl);
            const audioTensor = AudioPreprocessor.audioBufferToTensor(audioBuffer, 16000);
            const spectrogram = AudioPreprocessor.computeSpectrogram(audioTensor);

            const result = await this.modelManager.predict(modelId, {
                data: spectrogram,
                preprocessed: true
            });

            return {
                success: true,
                command: result.labels?.[0] || 'unknown',
                confidence: result.confidence || 0,
                allPredictions: result.probabilities,
                processingTime: result.processingTime
            };

        } catch (error) {
            return {
                success: false,
                error: `Speech command recognition failed: ${error}`
            };
        }
    }

    // Text embeddings
    async getTextEmbeddings(text: string): Promise<any> {
        try {
            const modelId = 'universal-sentence-encoder';
            await this.ensureModelLoaded(modelId);

            // USE expects raw text input
            const result = await this.modelManager.predict(modelId, {
                data: [text], // Array of sentences
                preprocessed: false
            });

            return {
                success: true,
                embeddings: Array.from(result.predictions as number[]),
                dimensions: (result.predictions as number[]).length,
                processingTime: result.processingTime
            };

        } catch (error) {
            return {
                success: false,
                error: `Text embeddings generation failed: ${error}`
            };
        }
    }

    // Model information
    async getModelInfo(category?: string): Promise<any> {
        try {
            let models;

            if (category) {
                models = getModelsByUseCase(category as any);
            } else {
                models = Object.values(PRETRAINED_MODELS);
            }

            const modelInfo = models.map(model => ({
                id: model.id,
                name: model.name,
                type: model.type,
                description: model.metadata?.description,
                loaded: this.loadedModels.has(model.id),
                memoryUsage: this.modelManager.getModelInfo(model.id)?.memoryUsage
            }));

            return {
                success: true,
                models: modelInfo,
                totalModels: modelInfo.length,
                loadedModels: this.loadedModels.size
            };

        } catch (error) {
            return {
                success: false,
                error: `Failed to get model info: ${error}`
            };
        }
    }

    // Helper: Ensure model is loaded
    private async ensureModelLoaded(modelId: string): Promise<void> {
        if (!this.loadedModels.has(modelId)) {
            const config = PRETRAINED_MODELS[modelId];
            if (!config) {
                throw new Error(`Model ${modelId} not found in registry`);
            }

            await this.modelManager.loadModel(config);
            this.loadedModels.add(modelId);
        }
    }

    // Helper: Process top K predictions
    private getTopKPredictions(result: PredictionOutput, topK: number): any[] {
        if (!result.probabilities) return [];

        const predictions = result.probabilities
            .map((prob, index) => ({ index, probability: prob }))
            .sort((a, b) => b.probability - a.probability)
            .slice(0, topK);

        return predictions.map(pred => ({
            class: pred.index,
            label: result.labels?.[pred.index] || `Class ${pred.index}`,
            probability: pred.probability
        }));
    }

    // Helper: Process detection results
    private processDetectionResults(result: PredictionOutput, threshold: number): any[] {
        // This would need to be implemented based on the actual COCO-SSD output format
        // For now, returning a placeholder
        return [];
    }

    // Helper: Process toxicity results
    private processToxicityResults(result: PredictionOutput, labels: string[]): any[] {
        if (!result.probabilities) return [];

        return labels.map((label, index) => ({
            category: label,
            probability: result.probabilities![index] || 0
        }));
    }

    // Helper: Process face landmarks
    private processFaceLandmarks(result: PredictionOutput): any[] {
        // This would need to be implemented based on the actual face landmarks output format
        return [];
    }

    // Helper: Process pose keypoints
    private processPoseKeypoints(result: PredictionOutput): any[] {
        // This would need to be implemented based on the actual PoseNet output format
        return [];
    }

    // Get loaded model IDs
    getLoadedModels(): string[] {
        return Array.from(this.loadedModels);
    }

    // Get memory usage
    getMemoryUsage(): any {
        return this.modelManager.getMemoryUsage();
    }

    // Recommend models for use case
    getRecommendedModels(useCase: string): ModelConfig[] {
        return getRecommendedModels(useCase);
    }

    // Shutdown integration
    async shutdown(): Promise<void> {
        await this.modelManager.shutdown();
        this.loadedModels.clear();
    }
}
