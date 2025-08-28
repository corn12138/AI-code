'use client';

import { ToolRegistry } from '../../tools/ToolRegistry';
import {
    ImagePreprocessor,
    ModelProfiler,
    PRETRAINED_MODELS,
    TENSORFLOW_PRESETS,
    TensorFlowBuilder,
    TensorFlowModelManager,
    TextPreprocessor
} from '../index';

// Example usage of TensorFlow.js integration
export class TensorFlowExamples {
    private modelManager: TensorFlowModelManager;
    private toolRegistry: ToolRegistry;
    private profiler: ModelProfiler;

    constructor() {
        this.modelManager = TensorFlowBuilder.createModelManager({
            maxCacheSize: 5,
            backend: 'webgl',
            enableDebug: false
        });
        this.toolRegistry = new ToolRegistry();
        this.profiler = new ModelProfiler();
    }

    // Example 1: Basic Image Classification
    async imageClassificationExample(): Promise<void> {
        console.log('=== Image Classification Example ===');

        try {
            // Load MobileNet model
            const config = PRETRAINED_MODELS['mobilenet-v2'];
            await this.modelManager.loadModel(config);

            // Classify an image
            const imageUrl = 'https://example.com/sample-image.jpg';
            const image = await ImagePreprocessor.loadImageFromUrl(imageUrl);
            const input = await ImagePreprocessor.preprocessForMobileNet(image);

            const startTime = performance.now();
            const result = await this.modelManager.predict('mobilenet-v2', {
                data: input,
                preprocessed: true
            });
            const endTime = performance.now();

            this.profiler.profilePrediction('mobilenet-v2', endTime - startTime);

            console.log('Classification results:', result);
            console.log('Processing time:', result.processingTime, 'ms');

        } catch (error) {
            console.error('Image classification failed:', error);
        }
    }

    // Example 2: Text Sentiment Analysis
    async sentimentAnalysisExample(): Promise<void> {
        console.log('=== Sentiment Analysis Example ===');

        try {
            // Load sentiment analysis model
            const config = PRETRAINED_MODELS['sentiment-analysis'];
            await this.modelManager.loadModel(config);

            const textProcessor = new TextPreprocessor();
            const texts = [
                "I love this product! It's amazing.",
                "This is terrible. I hate it.",
                "It's okay, nothing special.",
                "Best purchase I've ever made!",
                "Worst experience ever."
            ];

            console.log('Analyzing sentiment for multiple texts...');

            for (const text of texts) {
                const encoded = textProcessor.encode(text);

                const startTime = performance.now();
                const result = await this.modelManager.predict('sentiment-analysis', {
                    data: encoded,
                    preprocessed: true
                });
                const endTime = performance.now();

                this.profiler.profilePrediction('sentiment-analysis', endTime - startTime);

                console.log(`Text: "${text}"`);
                console.log(`Sentiment: ${result.labels?.[0]} (${(result.confidence! * 100).toFixed(1)}%)`);
                console.log('---');
            }

        } catch (error) {
            console.error('Sentiment analysis failed:', error);
        }
    }

    // Example 3: Content Moderation Pipeline
    async contentModerationExample(): Promise<void> {
        console.log('=== Content Moderation Example ===');

        try {
            const moderationPipeline = await TENSORFLOW_PRESETS.CONTENT_MODERATION(this.modelManager);

            const comments = [
                "Great article! Thanks for sharing.",
                "You're an idiot and this is garbage!",
                "I disagree with your opinion, but respect your right to have it.",
                "Kill yourself, nobody likes you.",
                "This is helpful information, thank you."
            ];

            console.log('Moderating comments...');

            for (const comment of comments) {
                const result = await moderationPipeline.moderateText(comment);

                console.log(`Comment: "${comment}"`);
                console.log(`Sentiment: ${result.sentiment} (${(result.sentimentConfidence! * 100).toFixed(1)}%)`);
                console.log(`Toxic: ${result.toxicity.isToxic}`);

                if (result.toxicity.categories) {
                    const toxicCategories = result.toxicity.categories
                        .filter(cat => cat.probability > 0.5)
                        .map(cat => `${cat.category}: ${(cat.probability * 100).toFixed(1)}%`);

                    if (toxicCategories.length > 0) {
                        console.log(`Toxic categories: ${toxicCategories.join(', ')}`);
                    }
                }
                console.log('---');
            }

        } catch (error) {
            console.error('Content moderation failed:', error);
        }
    }

    // Example 4: Vision Pipeline
    async visionPipelineExample(): Promise<void> {
        console.log('=== Vision Pipeline Example ===');

        try {
            const visionPipeline = await TensorFlowBuilder.createVisionPipeline(this.modelManager);

            const imageUrl = 'https://example.com/person-image.jpg';

            console.log('Running complete vision analysis...');

            // Run all vision models in parallel
            const [classification, objects, face, pose] = await Promise.allSettled([
                visionPipeline.classifyImage(imageUrl),
                visionPipeline.detectObjects(imageUrl),
                visionPipeline.detectFace(imageUrl),
                visionPipeline.estimatePose(imageUrl)
            ]);

            console.log('Classification:', classification.status === 'fulfilled' ? classification.value : 'Failed');
            console.log('Object Detection:', objects.status === 'fulfilled' ? objects.value : 'Failed');
            console.log('Face Detection:', face.status === 'fulfilled' ? face.value : 'Failed');
            console.log('Pose Estimation:', pose.status === 'fulfilled' ? pose.value : 'Failed');

        } catch (error) {
            console.error('Vision pipeline failed:', error);
        }
    }

    // Example 5: AI Assistant Integration
    async aiAssistantIntegrationExample(): Promise<void> {
        console.log('=== AI Assistant Integration Example ===');

        try {
            const aiIntegration = await TENSORFLOW_PRESETS.AI_ASSISTANT(
                this.modelManager,
                this.toolRegistry
            );

            // Test various AI assistant tools
            console.log('Testing image classification tool...');
            const classificationResult = await this.toolRegistry.executeTool('image_classify', {
                imageUrl: 'https://example.com/cat-image.jpg',
                model: 'mobilenet-v2',
                topK: 3
            });
            console.log('Classification result:', classificationResult);

            console.log('Testing sentiment analysis tool...');
            const sentimentResult = await this.toolRegistry.executeTool('analyze_sentiment', {
                text: 'I absolutely love this new feature!'
            });
            console.log('Sentiment result:', sentimentResult);

            console.log('Testing toxicity detection tool...');
            const toxicityResult = await this.toolRegistry.executeTool('detect_toxicity', {
                text: 'You are such an amazing person!'
            });
            console.log('Toxicity result:', toxicityResult);

            console.log('Getting model information...');
            const modelInfo = await this.toolRegistry.executeTool('get_model_info', {
                category: 'vision'
            });
            console.log('Model info:', modelInfo);

        } catch (error) {
            console.error('AI assistant integration failed:', error);
        }
    }

    // Example 6: Performance Monitoring
    async performanceMonitoringExample(): Promise<void> {
        console.log('=== Performance Monitoring Example ===');

        try {
            const perfMonitor = TENSORFLOW_PRESETS.PERFORMANCE_MONITOR(this.modelManager);

            // Run some predictions to generate performance data
            await this.imageClassificationExample();
            await this.sentimentAnalysisExample();

            // Get performance statistics
            const stats = perfMonitor.getStats();
            console.log('System stats:', stats);

            const profileReport = this.profiler.getPerformanceReport();
            console.log('Performance report:', profileReport);

            const benchmarks = perfMonitor.getBenchmarks();
            console.log('Model benchmarks:', benchmarks);

            // Get recommendations for a use case
            const recommendations = perfMonitor.getRecommendations('image analysis');
            console.log('Recommendations for image analysis:', recommendations);

        } catch (error) {
            console.error('Performance monitoring failed:', error);
        }
    }

    // Example 7: Custom Preprocessing Pipeline
    async customPreprocessingExample(): Promise<void> {
        console.log('=== Custom Preprocessing Example ===');

        try {
            const { PreprocessingPipeline } = await import('../processors/DataProcessors');

            // Create a custom preprocessing pipeline
            const pipeline = new PreprocessingPipeline()
                .addResize([224, 224])
                .addNormalization('minmax')
                .addCustomStep((tensor) => {
                    // Add some noise for data augmentation
                    const noise = tf.randomNormal(tensor.shape, 0, 0.01);
                    return tensor.add(noise);
                });

            // Load and process an image
            const imageUrl = 'https://example.com/test-image.jpg';
            const image = await ImagePreprocessor.loadImageFromUrl(imageUrl);
            const tensor = ImagePreprocessor.imageToTensor(image, undefined, false);

            console.log('Original tensor shape:', tensor.shape);

            const processed = pipeline.process(tensor);
            console.log('Processed tensor shape:', processed.shape);

            // Use processed tensor for prediction
            const config = PRETRAINED_MODELS['mobilenet-v2'];
            if (!this.modelManager.listLoadedModels().includes(config.id)) {
                await this.modelManager.loadModel(config);
            }

            const result = await this.modelManager.predict('mobilenet-v2', {
                data: processed,
                preprocessed: true
            });

            console.log('Prediction with custom preprocessing:', result);

            // Clean up
            tensor.dispose();
            processed.dispose();

        } catch (error) {
            console.error('Custom preprocessing failed:', error);
        }
    }

    // Example 8: Batch Processing
    async batchProcessingExample(): Promise<void> {
        console.log('=== Batch Processing Example ===');

        try {
            const config = PRETRAINED_MODELS['sentiment-analysis'];
            if (!this.modelManager.listLoadedModels().includes(config.id)) {
                await this.modelManager.loadModel(config);
            }

            const textProcessor = new TextPreprocessor();
            const texts = [
                "This is fantastic!",
                "I'm not sure about this.",
                "Terrible experience.",
                "Pretty good overall.",
                "Outstanding quality!",
                "Could be better.",
                "Absolutely perfect!",
                "Not what I expected.",
                "Exceeded my expectations!",
                "Disappointing results."
            ];

            console.log(`Processing ${texts.length} texts in batch...`);

            // Prepare batch inputs
            const batchInputs = texts.map(text => ({
                data: textProcessor.encode(text),
                preprocessed: true
            }));

            const startTime = performance.now();
            const results = await this.modelManager.batchPredict('sentiment-analysis', batchInputs);
            const endTime = performance.now();

            console.log(`Batch processing completed in ${endTime - startTime}ms`);
            console.log(`Average time per prediction: ${(endTime - startTime) / texts.length}ms`);

            // Display results
            results.forEach((result, index) => {
                console.log(`"${texts[index]}" -> ${result.labels?.[0]} (${(result.confidence! * 100).toFixed(1)}%)`);
            });

        } catch (error) {
            console.error('Batch processing failed:', error);
        }
    }

    // Example 9: Memory Management
    async memoryManagementExample(): Promise<void> {
        console.log('=== Memory Management Example ===');

        try {
            console.log('Initial memory usage:', this.modelManager.getMemoryUsage());

            // Load multiple models
            const modelsToLoad = ['mobilenet-v2', 'sentiment-analysis', 'toxic-comment-detection'];

            for (const modelId of modelsToLoad) {
                const config = PRETRAINED_MODELS[modelId];
                await this.modelManager.loadModel(config);
                console.log(`Loaded ${modelId}, memory usage:`, this.modelManager.getMemoryUsage());
            }

            console.log('All models loaded:', this.modelManager.listLoadedModels());

            // Unload a model
            await this.modelManager.unloadModel('toxic-comment-detection');
            console.log('After unloading toxic-comment-detection:', this.modelManager.getMemoryUsage());

            // Load another model to test cache management
            const newConfig = PRETRAINED_MODELS['universal-sentence-encoder'];
            await this.modelManager.loadModel(newConfig);
            console.log('After loading new model:', this.modelManager.getMemoryUsage());

        } catch (error) {
            console.error('Memory management example failed:', error);
        }
    }

    // Example 10: Error Handling
    async errorHandlingExample(): Promise<void> {
        console.log('=== Error Handling Example ===');

        // Test invalid model loading
        try {
            await this.modelManager.loadModel({
                id: 'invalid-model',
                name: 'Invalid Model',
                version: '1.0.0',
                type: 'classification',
                url: 'https://invalid-url.com/model.json'
            });
        } catch (error) {
            console.log('Expected error for invalid model:', error.message);
        }

        // Test prediction with invalid input
        try {
            const config = PRETRAINED_MODELS['sentiment-analysis'];
            if (!this.modelManager.listLoadedModels().includes(config.id)) {
                await this.modelManager.loadModel(config);
            }

            await this.modelManager.predict('sentiment-analysis', {
                data: 'invalid-input-format' as any,
                preprocessed: true
            });
        } catch (error) {
            console.log('Expected error for invalid input:', error.message);
        }

        // Test prediction with unloaded model
        try {
            await this.modelManager.predict('non-existent-model', {
                data: [1, 2, 3],
                preprocessed: true
            });
        } catch (error) {
            console.log('Expected error for unloaded model:', error.message);
        }
    }

    // Run all examples
    async runAllExamples(): Promise<void> {
        console.log('=== Running TensorFlow.js Examples ===\n');

        try {
            await this.imageClassificationExample();
            console.log('\n');

            await this.sentimentAnalysisExample();
            console.log('\n');

            await this.contentModerationExample();
            console.log('\n');

            await this.visionPipelineExample();
            console.log('\n');

            await this.aiAssistantIntegrationExample();
            console.log('\n');

            await this.performanceMonitoringExample();
            console.log('\n');

            await this.customPreprocessingExample();
            console.log('\n');

            await this.batchProcessingExample();
            console.log('\n');

            await this.memoryManagementExample();
            console.log('\n');

            await this.errorHandlingExample();
            console.log('\n');

            console.log('=== All TensorFlow.js examples completed successfully! ===');

        } catch (error) {
            console.error('Example execution failed:', error);
        } finally {
            // Cleanup
            await this.modelManager.shutdown();
        }
    }
}
