'use client';

import * as tf from '@tensorflow/tfjs';

// Model configuration interface
export interface ModelConfig {
    id: string;
    name: string;
    version: string;
    type: 'classification' | 'regression' | 'nlp' | 'vision' | 'audio' | 'embedding';
    url: string;
    inputShape?: number[];
    outputShape?: number[];
    labels?: string[];
    preprocessor?: string;
    postprocessor?: string;
    metadata?: Record<string, any>;
    platform?: 'web' | 'node' | 'react-native';
    backend?: 'webgl' | 'cpu' | 'webgpu';
    warmup?: boolean;
    caching?: boolean;
}

// Model metadata
export interface ModelMetadata {
    id: string;
    config: ModelConfig;
    model?: tf.LayersModel | tf.GraphModel;
    loadedAt?: Date;
    lastUsed?: Date;
    usageCount: number;
    memoryUsage?: number;
    performance?: {
        averageInferenceTime: number;
        totalInferences: number;
    };
}

// Prediction input/output
export interface PredictionInput {
    data: tf.Tensor | number[] | number[][] | Float32Array;
    preprocessed?: boolean;
}

export interface PredictionOutput {
    predictions: tf.Tensor | number[] | number[][];
    probabilities?: number[];
    labels?: string[];
    confidence?: number;
    processingTime: number;
    metadata?: Record<string, any>;
}

// Model loading options
export interface LoadOptions {
    onProgress?: (fraction: number) => void;
    strict?: boolean;
    weightPathPrefix?: string;
    fetchFunc?: (url: string, init?: RequestInit) => Promise<Response>;
}

// TensorFlow.js Model Manager
export class TensorFlowModelManager {
    private models: Map<string, ModelMetadata> = new Map();
    private loadingPromises: Map<string, Promise<tf.LayersModel | tf.GraphModel>> = new Map();
    private maxCacheSize: number;
    private backend: string;

    constructor(options: {
        maxCacheSize?: number;
        backend?: 'webgl' | 'cpu' | 'webgpu';
        enableDebug?: boolean;
    } = {}) {
        this.maxCacheSize = options.maxCacheSize || 5;
        this.backend = options.backend || 'webgl';

        this.initializeTensorFlow(options.enableDebug);
        this.startCleanupInterval();
    }

    // Initialize TensorFlow.js
    private async initializeTensorFlow(enableDebug: boolean = false): Promise<void> {
        try {
            // Set backend
            await tf.setBackend(this.backend);

            // Enable debug mode if requested
            if (enableDebug) {
                tf.enableDebugMode();
            }

            // Log backend info
            console.log(`TensorFlow.js initialized with backend: ${tf.getBackend()}`);
            console.log(`Number of bytes in memory: ${tf.memory().numBytes}`);

        } catch (error) {
            console.error('Failed to initialize TensorFlow.js:', error);

            // Fallback to CPU backend
            try {
                await tf.setBackend('cpu');
                console.log('Fallback to CPU backend successful');
            } catch (fallbackError) {
                console.error('Failed to initialize CPU backend:', fallbackError);
                throw fallbackError;
            }
        }
    }

    // Load a model
    async loadModel(config: ModelConfig, options: LoadOptions = {}): Promise<void> {
        const { id, url, type, warmup = true } = config;

        // Check if model is already loading
        if (this.loadingPromises.has(id)) {
            await this.loadingPromises.get(id);
            return;
        }

        // Check if model is already loaded
        if (this.models.has(id)) {
            const metadata = this.models.get(id)!;
            metadata.lastUsed = new Date();
            return;
        }

        console.log(`Loading model: ${config.name} (${id})`);

        try {
            // Create loading promise
            const loadingPromise = this.loadModelFromUrl(url, type, options);
            this.loadingPromises.set(id, loadingPromise);

            const model = await loadingPromise;

            // Create metadata
            const metadata: ModelMetadata = {
                id,
                config,
                model,
                loadedAt: new Date(),
                lastUsed: new Date(),
                usageCount: 0,
                memoryUsage: this.calculateModelMemoryUsage(model),
                performance: {
                    averageInferenceTime: 0,
                    totalInferences: 0
                }
            };

            // Store model
            this.models.set(id, metadata);
            this.loadingPromises.delete(id);

            // Manage cache size
            await this.manageCacheSize();

            // Warmup model if requested
            if (warmup) {
                await this.warmupModel(id);
            }

            console.log(`Model loaded successfully: ${config.name}`);

        } catch (error) {
            this.loadingPromises.delete(id);
            console.error(`Failed to load model ${config.name}:`, error);
            throw error;
        }
    }

    // Load model from URL
    private async loadModelFromUrl(
        url: string,
        type: string,
        options: LoadOptions
    ): Promise<tf.LayersModel | tf.GraphModel> {
        const loadOptions: tf.io.LoadOptions = {
            onProgress: options.onProgress,
            strict: options.strict,
            weightPathPrefix: options.weightPathPrefix,
            fetchFunc: options.fetchFunc
        };

        try {
            // Try loading as LayersModel first (Keras format)
            if (url.endsWith('.json') || type === 'nlp') {
                return await tf.loadLayersModel(url, loadOptions);
            }

            // Try loading as GraphModel (SavedModel format)
            return await tf.loadGraphModel(url, loadOptions);

        } catch (error) {
            // Fallback to the other format
            try {
                if (url.endsWith('.json')) {
                    return await tf.loadGraphModel(url, loadOptions);
                } else {
                    return await tf.loadLayersModel(url, loadOptions);
                }
            } catch (fallbackError) {
                throw new Error(`Failed to load model from ${url}: ${fallbackError}`);
            }
        }
    }

    // Make prediction
    async predict(modelId: string, input: PredictionInput): Promise<PredictionOutput> {
        const metadata = this.models.get(modelId);
        if (!metadata) {
            throw new Error(`Model ${modelId} not found. Please load it first.`);
        }

        const { model, config } = metadata;
        if (!model) {
            throw new Error(`Model ${modelId} is not loaded`);
        }

        const startTime = performance.now();

        try {
            // Preprocess input if needed
            const processedInput = input.preprocessed
                ? input.data
                : await this.preprocessInput(input.data, config);

            // Ensure input is a tensor
            const inputTensor = tf.tensor(processedInput as any);

            // Make prediction
            const predictionTensor = model.predict(inputTensor) as tf.Tensor;

            // Convert to array
            const predictions = await predictionTensor.data();

            // Postprocess output
            const output = await this.postprocessOutput(
                Array.from(predictions),
                config
            );

            // Update metrics
            const processingTime = performance.now() - startTime;
            this.updateModelMetrics(modelId, processingTime);

            // Clean up tensors
            inputTensor.dispose();
            predictionTensor.dispose();

            return {
                predictions: output.predictions,
                probabilities: output.probabilities,
                labels: output.labels,
                confidence: output.confidence,
                processingTime,
                metadata: output.metadata
            };

        } catch (error) {
            console.error(`Prediction failed for model ${modelId}:`, error);
            throw error;
        }
    }

    // Batch prediction
    async batchPredict(
        modelId: string,
        inputs: PredictionInput[]
    ): Promise<PredictionOutput[]> {
        const metadata = this.models.get(modelId);
        if (!metadata) {
            throw new Error(`Model ${modelId} not found`);
        }

        const startTime = performance.now();
        const results: PredictionOutput[] = [];

        try {
            // Process inputs in batches to avoid memory issues
            const batchSize = 32;

            for (let i = 0; i < inputs.length; i += batchSize) {
                const batch = inputs.slice(i, i + batchSize);

                const batchResults = await Promise.all(
                    batch.map(input => this.predict(modelId, input))
                );

                results.push(...batchResults);
            }

            const totalTime = performance.now() - startTime;
            console.log(`Batch prediction completed: ${inputs.length} samples in ${totalTime.toFixed(2)}ms`);

            return results;

        } catch (error) {
            console.error(`Batch prediction failed for model ${modelId}:`, error);
            throw error;
        }
    }

    // Preprocess input data
    private async preprocessInput(
        data: tf.Tensor | number[] | number[][] | Float32Array,
        config: ModelConfig
    ): Promise<tf.Tensor | number[] | number[][]> {
        // Custom preprocessing based on model type
        switch (config.type) {
            case 'vision':
                return this.preprocessImage(data, config);
            case 'nlp':
                return this.preprocessText(data, config);
            case 'audio':
                return this.preprocessAudio(data, config);
            default:
                return data;
        }
    }

    // Preprocess image data
    private preprocessImage(
        data: tf.Tensor | number[] | number[][] | Float32Array,
        config: ModelConfig
    ): tf.Tensor {
        let tensor = tf.tensor(data as any);

        // Resize if input shape is specified
        if (config.inputShape) {
            const [height, width, channels] = config.inputShape;
            tensor = tf.image.resizeBilinear(tensor as tf.Tensor4D, [height, width]);
        }

        // Normalize pixel values to [0, 1]
        tensor = tensor.div(255.0);

        // Add batch dimension if needed
        if (tensor.shape.length === 3) {
            tensor = tensor.expandDims(0);
        }

        return tensor;
    }

    // Preprocess text data
    private preprocessText(
        data: tf.Tensor | number[] | number[][] | Float32Array,
        config: ModelConfig
    ): number[] | number[][] {
        // Basic text preprocessing
        // In a real implementation, you'd tokenize and encode text
        return data as number[];
    }

    // Preprocess audio data
    private preprocessAudio(
        data: tf.Tensor | number[] | number[][] | Float32Array,
        config: ModelConfig
    ): tf.Tensor {
        let tensor = tf.tensor(data as any);

        // Normalize audio data
        const mean = tf.mean(tensor);
        const std = tf.sqrt(tf.mean(tf.square(tensor.sub(mean))));
        tensor = tensor.sub(mean).div(std);

        return tensor;
    }

    // Postprocess output data
    private async postprocessOutput(
        predictions: number[],
        config: ModelConfig
    ): Promise<{
        predictions: number[];
        probabilities?: number[];
        labels?: string[];
        confidence?: number;
        metadata?: Record<string, any>;
    }> {
        switch (config.type) {
            case 'classification':
                return this.postprocessClassification(predictions, config);
            case 'regression':
                return this.postprocessRegression(predictions, config);
            default:
                return { predictions };
        }
    }

    // Postprocess classification output
    private postprocessClassification(
        predictions: number[],
        config: ModelConfig
    ): {
        predictions: number[];
        probabilities: number[];
        labels?: string[];
        confidence: number;
    } {
        // Apply softmax to get probabilities
        const probabilities = this.softmax(predictions);

        // Get predicted class
        const predictedClass = probabilities.indexOf(Math.max(...probabilities));

        // Get confidence (max probability)
        const confidence = Math.max(...probabilities);

        // Get labels if available
        const labels = config.labels ? [config.labels[predictedClass]] : undefined;

        return {
            predictions: [predictedClass],
            probabilities,
            labels,
            confidence
        };
    }

    // Postprocess regression output
    private postprocessRegression(
        predictions: number[],
        config: ModelConfig
    ): { predictions: number[] } {
        return { predictions };
    }

    // Softmax function
    private softmax(values: number[]): number[] {
        const maxVal = Math.max(...values);
        const exps = values.map(v => Math.exp(v - maxVal));
        const sumExps = exps.reduce((a, b) => a + b, 0);
        return exps.map(exp => exp / sumExps);
    }

    // Warmup model
    private async warmupModel(modelId: string): Promise<void> {
        const metadata = this.models.get(modelId);
        if (!metadata || !metadata.config.inputShape) return;

        try {
            // Create dummy input with correct shape
            const dummyInput = tf.randomNormal(metadata.config.inputShape);

            // Make a prediction to warmup the model
            await this.predict(modelId, {
                data: dummyInput,
                preprocessed: true
            });

            dummyInput.dispose();
            console.log(`Model ${modelId} warmed up successfully`);

        } catch (error) {
            console.warn(`Failed to warmup model ${modelId}:`, error);
        }
    }

    // Update model metrics
    private updateModelMetrics(modelId: string, processingTime: number): void {
        const metadata = this.models.get(modelId);
        if (!metadata) return;

        metadata.lastUsed = new Date();
        metadata.usageCount++;

        if (metadata.performance) {
            const { averageInferenceTime, totalInferences } = metadata.performance;
            metadata.performance.totalInferences = totalInferences + 1;
            metadata.performance.averageInferenceTime =
                (averageInferenceTime * totalInferences + processingTime) / metadata.performance.totalInferences;
        }
    }

    // Calculate model memory usage
    private calculateModelMemoryUsage(model: tf.LayersModel | tf.GraphModel): number {
        return model.getWeights().reduce((total, weight) => {
            return total + weight.size * 4; // 4 bytes per float32
        }, 0);
    }

    // Manage cache size
    private async manageCacheSize(): Promise<void> {
        if (this.models.size <= this.maxCacheSize) return;

        // Sort models by last used time (oldest first)
        const sortedModels = Array.from(this.models.entries())
            .sort(([, a], [, b]) => {
                const aTime = a.lastUsed?.getTime() || 0;
                const bTime = b.lastUsed?.getTime() || 0;
                return aTime - bTime;
            });

        // Remove oldest models
        const modelsToRemove = sortedModels.slice(0, this.models.size - this.maxCacheSize);

        for (const [modelId] of modelsToRemove) {
            await this.unloadModel(modelId);
        }
    }

    // Unload a model
    async unloadModel(modelId: string): Promise<void> {
        const metadata = this.models.get(modelId);
        if (!metadata) return;

        try {
            // Dispose model
            if (metadata.model) {
                metadata.model.dispose();
            }

            // Remove from cache
            this.models.delete(modelId);

            console.log(`Model ${modelId} unloaded successfully`);

        } catch (error) {
            console.error(`Failed to unload model ${modelId}:`, error);
        }
    }

    // Get model info
    getModelInfo(modelId: string): ModelMetadata | undefined {
        return this.models.get(modelId);
    }

    // List loaded models
    listLoadedModels(): string[] {
        return Array.from(this.models.keys());
    }

    // Get memory usage
    getMemoryUsage(): {
        totalBytes: number;
        modelBytes: number;
        tensorCount: number;
    } {
        const memory = tf.memory();
        const modelBytes = Array.from(this.models.values())
            .reduce((total, metadata) => total + (metadata.memoryUsage || 0), 0);

        return {
            totalBytes: memory.numBytes,
            modelBytes,
            tensorCount: memory.numTensors
        };
    }

    // Start cleanup interval
    private startCleanupInterval(): void {
        setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000); // Clean up every 5 minutes
    }

    // Cleanup unused resources
    private cleanup(): void {
        // Dispose any tensors that weren't properly cleaned up
        if (tf.memory().numTensors > 100) {
            console.warn(`High number of tensors in memory: ${tf.memory().numTensors}`);
        }

        // Force garbage collection if available
        if (global.gc) {
            global.gc();
        }
    }

    // Shutdown
    async shutdown(): Promise<void> {
        // Unload all models
        const modelIds = Array.from(this.models.keys());
        await Promise.all(modelIds.map(id => this.unloadModel(id)));

        // Dispose TensorFlow backend
        tf.disposeVariables();

        console.log('TensorFlow Model Manager shut down');
    }
}
