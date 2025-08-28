'use client';

import { ModelConfig } from '../core/ModelManager';

// Pre-trained model configurations
export const PRETRAINED_MODELS: Record<string, ModelConfig> = {
    // Text/NLP Models
    'universal-sentence-encoder': {
        id: 'universal-sentence-encoder',
        name: 'Universal Sentence Encoder',
        version: '4.0.0',
        type: 'embedding',
        url: 'https://tfhub.dev/google/universal-sentence-encoder/4',
        inputShape: [512], // Variable length sentences
        outputShape: [512], // 512-dimensional embeddings
        preprocessor: 'text-tokenizer',
        metadata: {
            description: 'Encodes text into high-dimensional vectors for semantic similarity',
            languages: ['en'],
            maxInputLength: 512,
            useCase: 'semantic-search, text-similarity, clustering'
        },
        platform: 'web',
        backend: 'webgl',
        warmup: true,
        caching: true
    },

    'sentiment-analysis': {
        id: 'sentiment-analysis',
        name: 'Sentiment Analysis',
        version: '1.0.0',
        type: 'classification',
        url: 'https://storage.googleapis.com/tfjs-models/sentiment/model.json',
        inputShape: [100], // Max 100 tokens
        outputShape: [2], // Positive/Negative
        labels: ['negative', 'positive'],
        preprocessor: 'text-sequence',
        metadata: {
            description: 'Analyzes sentiment of text as positive or negative',
            accuracy: 0.85,
            dataset: 'IMDB Movie Reviews',
            useCase: 'content-moderation, feedback-analysis'
        }
    },

    'toxic-comment-detection': {
        id: 'toxic-comment-detection',
        name: 'Toxic Comment Detection',
        version: '1.0.0',
        type: 'classification',
        url: 'https://storage.googleapis.com/tfjs-models/toxic/model.json',
        inputShape: [200],
        outputShape: [6],
        labels: ['toxic', 'severe_toxic', 'obscene', 'threat', 'insult', 'identity_hate'],
        preprocessor: 'text-sequence',
        metadata: {
            description: 'Detects toxic comments across multiple categories',
            dataset: 'Jigsaw Toxic Comment Classification',
            useCase: 'content-moderation, community-safety'
        }
    },

    // Vision Models
    'mobilenet-v2': {
        id: 'mobilenet-v2',
        name: 'MobileNet v2',
        version: '2.0.0',
        type: 'classification',
        url: 'https://storage.googleapis.com/tfjs-models/mobilenet_v2_1.0_224/model.json',
        inputShape: [224, 224, 3],
        outputShape: [1000],
        labels: [], // ImageNet classes (would be loaded separately)
        preprocessor: 'image-resize-normalize',
        metadata: {
            description: 'Lightweight image classification model',
            dataset: 'ImageNet',
            topKAccuracy: 0.901,
            modelSize: '14MB',
            useCase: 'image-classification, feature-extraction'
        }
    },

    'coco-ssd': {
        id: 'coco-ssd',
        name: 'COCO-SSD Object Detection',
        version: '2.0.0',
        type: 'vision',
        url: 'https://storage.googleapis.com/tfjs-models/coco-ssd/model.json',
        inputShape: [640, 640, 3],
        outputShape: [100, 6], // Max 100 detections, [x, y, width, height, class, confidence]
        labels: [], // COCO classes
        preprocessor: 'image-resize',
        metadata: {
            description: 'Real-time object detection',
            dataset: 'COCO',
            classes: 80,
            useCase: 'object-detection, image-analysis'
        }
    },

    'face-landmarks': {
        id: 'face-landmarks',
        name: 'Face Landmarks Detection',
        version: '1.0.0',
        type: 'vision',
        url: 'https://storage.googleapis.com/tfjs-models/face-landmarks-detection/model.json',
        inputShape: [128, 128, 3],
        outputShape: [468, 3], // 468 landmarks with x, y, z coordinates
        preprocessor: 'face-crop-resize',
        metadata: {
            description: 'Detects 468 facial landmarks in 3D',
            useCase: 'ar-filters, face-analysis, emotion-detection'
        }
    },

    // Audio Models
    'speech-commands': {
        id: 'speech-commands',
        name: 'Speech Commands Recognition',
        version: '1.0.0',
        type: 'classification',
        url: 'https://storage.googleapis.com/tfjs-models/speech-commands/model.json',
        inputShape: [124, 129], // Spectrogram
        outputShape: [20],
        labels: [
            'silence', 'up', 'down', 'left', 'right', 'go', 'stop', 'yes', 'no',
            'on', 'off', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
            'eight', 'nine', 'zero'
        ],
        preprocessor: 'audio-spectrogram',
        metadata: {
            description: 'Recognizes simple voice commands',
            sampleRate: 16000,
            useCase: 'voice-control, smart-home, accessibility'
        }
    },

    // Embedding Models
    'word2vec-glove': {
        id: 'word2vec-glove',
        name: 'GloVe Word Embeddings',
        version: '1.0.0',
        type: 'embedding',
        url: 'https://storage.googleapis.com/tfjs-models/word2vec/glove.6B.50d.json',
        inputShape: [1], // Single word
        outputShape: [50], // 50-dimensional embeddings
        metadata: {
            description: 'Pre-trained word embeddings from GloVe',
            vocabulary: 400000,
            useCase: 'nlp, semantic-analysis, word-similarity'
        }
    },

    // Pose Estimation
    'posenet': {
        id: 'posenet',
        name: 'PoseNet',
        version: '2.0.0',
        type: 'vision',
        url: 'https://storage.googleapis.com/tfjs-models/posenet/model.json',
        inputShape: [513, 513, 3],
        outputShape: [17, 3], // 17 keypoints with x, y, confidence
        metadata: {
            description: 'Human pose estimation in real-time',
            keypoints: 17,
            useCase: 'fitness-tracking, motion-capture, ar-applications'
        }
    },

    // Hand Pose Detection
    'handpose': {
        id: 'handpose',
        name: 'MediaPipe HandPose',
        version: '1.0.0',
        type: 'vision',
        url: 'https://storage.googleapis.com/tfjs-models/handpose/model.json',
        inputShape: [256, 256, 3],
        outputShape: [21, 3], // 21 hand landmarks
        metadata: {
            description: 'Detects hand landmarks and gestures',
            landmarks: 21,
            useCase: 'gesture-recognition, sign-language, ar-interactions'
        }
    },

    // Style Transfer
    'style-transfer': {
        id: 'style-transfer',
        name: 'Arbitrary Style Transfer',
        version: '1.0.0',
        type: 'vision',
        url: 'https://storage.googleapis.com/tfjs-models/style-transfer/model.json',
        inputShape: [256, 256, 3],
        outputShape: [256, 256, 3],
        metadata: {
            description: 'Transfers artistic style between images',
            useCase: 'art-generation, image-editing, creative-tools'
        }
    },

    // Text Generation
    'gpt2-small': {
        id: 'gpt2-small',
        name: 'GPT-2 Small',
        version: '1.0.0',
        type: 'nlp',
        url: 'https://storage.googleapis.com/tfjs-models/gpt2/small/model.json',
        inputShape: [1024], // Max context length
        outputShape: [50257], // Vocabulary size
        metadata: {
            description: 'Small version of GPT-2 for text generation',
            parameters: '124M',
            contextLength: 1024,
            useCase: 'text-generation, creative-writing, chatbots'
        }
    }
};

// Model categories for easier browsing
export const MODEL_CATEGORIES = {
    nlp: {
        name: 'Natural Language Processing',
        models: [
            'universal-sentence-encoder',
            'sentiment-analysis',
            'toxic-comment-detection',
            'word2vec-glove',
            'gpt2-small'
        ]
    },
    vision: {
        name: 'Computer Vision',
        models: [
            'mobilenet-v2',
            'coco-ssd',
            'face-landmarks',
            'posenet',
            'handpose',
            'style-transfer'
        ]
    },
    audio: {
        name: 'Audio Processing',
        models: [
            'speech-commands'
        ]
    },
    embedding: {
        name: 'Embeddings',
        models: [
            'universal-sentence-encoder',
            'word2vec-glove'
        ]
    }
};

// Model use cases
export const USE_CASES = {
    'content-moderation': {
        name: 'Content Moderation',
        description: 'Automatically detect and filter inappropriate content',
        models: ['sentiment-analysis', 'toxic-comment-detection']
    },
    'image-analysis': {
        name: 'Image Analysis',
        description: 'Analyze and understand image content',
        models: ['mobilenet-v2', 'coco-ssd', 'face-landmarks']
    },
    'semantic-search': {
        name: 'Semantic Search',
        description: 'Find similar content based on meaning',
        models: ['universal-sentence-encoder', 'word2vec-glove']
    },
    'ar-applications': {
        name: 'Augmented Reality',
        description: 'Real-time body and face tracking for AR',
        models: ['face-landmarks', 'posenet', 'handpose']
    },
    'voice-control': {
        name: 'Voice Control',
        description: 'Voice-activated commands and interfaces',
        models: ['speech-commands']
    },
    'creative-tools': {
        name: 'Creative Tools',
        description: 'AI-powered creative and artistic applications',
        models: ['style-transfer', 'gpt2-small']
    }
};

// Model performance benchmarks (approximate)
export const MODEL_BENCHMARKS = {
    'universal-sentence-encoder': {
        inferenceTime: 50, // ms
        modelSize: 25, // MB
        accuracy: 0.92
    },
    'sentiment-analysis': {
        inferenceTime: 15,
        modelSize: 2,
        accuracy: 0.85
    },
    'toxic-comment-detection': {
        inferenceTime: 20,
        modelSize: 3,
        accuracy: 0.88
    },
    'mobilenet-v2': {
        inferenceTime: 30,
        modelSize: 14,
        accuracy: 0.713 // Top-1 ImageNet
    },
    'coco-ssd': {
        inferenceTime: 100,
        modelSize: 27,
        accuracy: 0.25 // mAP
    },
    'face-landmarks': {
        inferenceTime: 35,
        modelSize: 8,
        accuracy: 0.95
    },
    'speech-commands': {
        inferenceTime: 25,
        modelSize: 1,
        accuracy: 0.92
    },
    'posenet': {
        inferenceTime: 45,
        modelSize: 12,
        accuracy: 0.89
    },
    'handpose': {
        inferenceTime: 40,
        modelSize: 6,
        accuracy: 0.87
    },
    'style-transfer': {
        inferenceTime: 200,
        modelSize: 22,
        accuracy: null // Subjective
    },
    'gpt2-small': {
        inferenceTime: 150,
        modelSize: 500,
        accuracy: null // Perplexity-based
    }
};

// Helper function to get models by category
export function getModelsByCategory(category: keyof typeof MODEL_CATEGORIES): ModelConfig[] {
    const categoryInfo = MODEL_CATEGORIES[category];
    if (!categoryInfo) return [];

    return categoryInfo.models
        .map(modelId => PRETRAINED_MODELS[modelId])
        .filter(Boolean);
}

// Helper function to get models by use case
export function getModelsByUseCase(useCase: keyof typeof USE_CASES): ModelConfig[] {
    const useCaseInfo = USE_CASES[useCase];
    if (!useCaseInfo) return [];

    return useCaseInfo.models
        .map(modelId => PRETRAINED_MODELS[modelId])
        .filter(Boolean);
}

// Helper function to get model benchmark
export function getModelBenchmark(modelId: string): typeof MODEL_BENCHMARKS[string] | null {
    return MODEL_BENCHMARKS[modelId] || null;
}

// Helper function to search models
export function searchModels(query: string): ModelConfig[] {
    const lowerQuery = query.toLowerCase();

    return Object.values(PRETRAINED_MODELS).filter(model => {
        return (
            model.name.toLowerCase().includes(lowerQuery) ||
            model.type.toLowerCase().includes(lowerQuery) ||
            model.metadata?.description?.toLowerCase().includes(lowerQuery) ||
            model.metadata?.useCase?.toLowerCase().includes(lowerQuery)
        );
    });
}

// Helper function to get recommended models for a use case
export function getRecommendedModels(useCase: string): ModelConfig[] {
    // Simple recommendation based on use case keywords
    const keywords = useCase.toLowerCase().split(/[\s,]+/);

    const scored = Object.values(PRETRAINED_MODELS).map(model => {
        let score = 0;

        // Check model type
        if (keywords.some(k => model.type.includes(k))) score += 3;

        // Check name
        if (keywords.some(k => model.name.toLowerCase().includes(k))) score += 2;

        // Check description
        if (model.metadata?.description &&
            keywords.some(k => model.metadata.description.toLowerCase().includes(k))) {
            score += 2;
        }

        // Check use case
        if (model.metadata?.useCase &&
            keywords.some(k => model.metadata.useCase.toLowerCase().includes(k))) {
            score += 3;
        }

        return { model, score };
    });

    return scored
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5) // Top 5 recommendations
        .map(item => item.model);
}
