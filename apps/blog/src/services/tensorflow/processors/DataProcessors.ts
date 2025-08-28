'use client';

import * as tf from '@tensorflow/tfjs';

// Text preprocessing utilities
export class TextPreprocessor {
    private vocabulary: Map<string, number> = new Map();
    private reverseVocabulary: Map<number, string> = new Map();
    private maxLength: number;

    constructor(vocabulary?: Map<string, number>, maxLength: number = 512) {
        if (vocabulary) {
            this.vocabulary = vocabulary;
            this.reverseVocabulary = new Map(
                Array.from(vocabulary.entries()).map(([word, id]) => [id, word])
            );
        }
        this.maxLength = maxLength;
    }

    // Tokenize text into words/subwords
    tokenize(text: string): string[] {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(token => token.length > 0);
    }

    // Convert tokens to IDs
    tokensToIds(tokens: string[]): number[] {
        return tokens.map(token => this.vocabulary.get(token) || 0); // 0 for UNK
    }

    // Convert IDs back to tokens
    idsToTokens(ids: number[]): string[] {
        return ids.map(id => this.reverseVocabulary.get(id) || '<UNK>');
    }

    // Encode text to sequence of IDs
    encode(text: string): number[] {
        const tokens = this.tokenize(text);
        const ids = this.tokensToIds(tokens);

        // Pad or truncate to max length
        if (ids.length > this.maxLength) {
            return ids.slice(0, this.maxLength);
        } else {
            return [...ids, ...Array(this.maxLength - ids.length).fill(0)];
        }
    }

    // Decode sequence of IDs to text
    decode(ids: number[]): string {
        const tokens = this.idsToTokens(ids.filter(id => id !== 0)); // Remove padding
        return tokens.join(' ');
    }

    // Build vocabulary from corpus
    buildVocabulary(texts: string[], maxVocabSize: number = 10000): void {
        const tokenCounts = new Map<string, number>();

        // Count token frequencies
        for (const text of texts) {
            const tokens = this.tokenize(text);
            for (const token of tokens) {
                tokenCounts.set(token, (tokenCounts.get(token) || 0) + 1);
            }
        }

        // Sort by frequency and take top tokens
        const sortedTokens = Array.from(tokenCounts.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, maxVocabSize - 2); // Reserve 2 slots for special tokens

        // Build vocabulary
        this.vocabulary.clear();
        this.reverseVocabulary.clear();

        this.vocabulary.set('<PAD>', 0);
        this.vocabulary.set('<UNK>', 1);
        this.reverseVocabulary.set(0, '<PAD>');
        this.reverseVocabulary.set(1, '<UNK>');

        sortedTokens.forEach(([token], index) => {
            const id = index + 2;
            this.vocabulary.set(token, id);
            this.reverseVocabulary.set(id, token);
        });
    }

    // Get vocabulary size
    getVocabularySize(): number {
        return this.vocabulary.size;
    }

    // Export vocabulary
    exportVocabulary(): Record<string, number> {
        return Object.fromEntries(this.vocabulary);
    }
}

// Image preprocessing utilities
export class ImagePreprocessor {
    static async loadImageFromUrl(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }

    static imageToTensor(
        image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
        targetSize?: [number, number],
        normalize: boolean = true
    ): tf.Tensor {
        let tensor = tf.browser.fromPixels(image);

        // Resize if target size specified
        if (targetSize) {
            tensor = tf.image.resizeBilinear(tensor as tf.Tensor3D, targetSize);
        }

        // Normalize to [0, 1] if requested
        if (normalize) {
            tensor = tensor.div(255.0);
        }

        // Add batch dimension
        tensor = tensor.expandDims(0);

        return tensor;
    }

    static tensorToImage(tensor: tf.Tensor): Promise<HTMLCanvasElement> {
        // Remove batch dimension if present
        if (tensor.shape.length === 4) {
            tensor = tensor.squeeze([0]);
        }

        // Ensure values are in [0, 255] range
        tensor = tensor.mul(255).clipByValue(0, 255);

        return tf.browser.toPixels(tensor as tf.Tensor3D);
    }

    static async preprocessForMobileNet(
        image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
    ): Promise<tf.Tensor> {
        const tensor = this.imageToTensor(image, [224, 224], false);

        // MobileNet expects values in [-1, 1]
        return tensor.div(127.5).sub(1);
    }

    static async preprocessForCocoSsd(
        image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
    ): Promise<tf.Tensor> {
        return this.imageToTensor(image, [640, 640], true);
    }

    static cropFaceRegion(
        image: tf.Tensor,
        faceBox: { x: number; y: number; width: number; height: number }
    ): tf.Tensor {
        // Crop face region from image
        const { x, y, width, height } = faceBox;
        return tf.image.cropAndResize(
            image.expandDims(0) as tf.Tensor4D,
            [[y, x, y + height, x + width]],
            [0],
            [128, 128]
        ).squeeze([0]);
    }
}

// Audio preprocessing utilities
export class AudioPreprocessor {
    static async loadAudioFromUrl(url: string): Promise<AudioBuffer> {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        return await audioContext.decodeAudioData(arrayBuffer);
    }

    static audioBufferToTensor(audioBuffer: AudioBuffer, sampleRate: number = 16000): tf.Tensor {
        // Get audio data
        const audioData = audioBuffer.getChannelData(0);

        // Resample if necessary
        let resampledData = audioData;
        if (audioBuffer.sampleRate !== sampleRate) {
            resampledData = this.resample(audioData, audioBuffer.sampleRate, sampleRate);
        }

        return tf.tensor1d(resampledData);
    }

    static resample(
        audioData: Float32Array,
        originalSampleRate: number,
        targetSampleRate: number
    ): Float32Array {
        if (originalSampleRate === targetSampleRate) {
            return audioData;
        }

        const resampleRatio = targetSampleRate / originalSampleRate;
        const targetLength = Math.round(audioData.length * resampleRatio);
        const resampled = new Float32Array(targetLength);

        for (let i = 0; i < targetLength; i++) {
            const sourceIndex = i / resampleRatio;
            const floorIndex = Math.floor(sourceIndex);
            const ceilIndex = Math.min(Math.ceil(sourceIndex), audioData.length - 1);
            const fraction = sourceIndex - floorIndex;

            resampled[i] = audioData[floorIndex] * (1 - fraction) + audioData[ceilIndex] * fraction;
        }

        return resampled;
    }

    static computeSpectrogram(
        audioTensor: tf.Tensor,
        frameLength: number = 1024,
        frameStep: number = 512,
        fftLength?: number
    ): tf.Tensor {
        // Compute Short-Time Fourier Transform (STFT)
        const stft = tf.signal.stft(
            audioTensor as tf.Tensor1D,
            frameLength,
            frameStep,
            fftLength
        );

        // Compute magnitude spectrogram
        const magnitude = tf.abs(stft);

        // Convert to log scale
        return tf.log(magnitude.add(1e-10));
    }

    static computeMelSpectrogram(
        audioTensor: tf.Tensor,
        sampleRate: number = 16000,
        nMels: number = 80,
        frameLength: number = 1024,
        frameStep: number = 512
    ): tf.Tensor {
        // Compute regular spectrogram first
        const spectrogram = this.computeSpectrogram(audioTensor, frameLength, frameStep);

        // Apply mel filterbank (simplified version)
        // In a full implementation, you'd create proper mel filters
        return spectrogram;
    }

    static normalizeAudio(audioTensor: tf.Tensor): tf.Tensor {
        // Normalize audio to zero mean and unit variance
        const mean = tf.mean(audioTensor);
        const variance = tf.mean(tf.square(audioTensor.sub(mean)));
        const std = tf.sqrt(variance);

        return audioTensor.sub(mean).div(std.add(1e-10));
    }

    static padOrTrimAudio(audioTensor: tf.Tensor, targetLength: number): tf.Tensor {
        const currentLength = audioTensor.shape[0];

        if (currentLength === targetLength) {
            return audioTensor;
        } else if (currentLength > targetLength) {
            // Trim
            return audioTensor.slice([0], [targetLength]);
        } else {
            // Pad with zeros
            const padding = tf.zeros([targetLength - currentLength]);
            return tf.concat([audioTensor as tf.Tensor1D, padding]);
        }
    }
}

// General data preprocessing utilities
export class DataPreprocessor {
    static normalizeData(data: tf.Tensor, method: 'minmax' | 'zscore' = 'minmax'): tf.Tensor {
        switch (method) {
            case 'minmax':
                const min = tf.min(data);
                const max = tf.max(data);
                return data.sub(min).div(max.sub(min));

            case 'zscore':
                const mean = tf.mean(data);
                const std = tf.sqrt(tf.mean(tf.square(data.sub(mean))));
                return data.sub(mean).div(std);

            default:
                return data;
        }
    }

    static oneHotEncode(labels: number[], numClasses: number): tf.Tensor {
        return tf.oneHot(labels, numClasses);
    }

    static shuffleData(
        features: tf.Tensor,
        labels?: tf.Tensor
    ): { features: tf.Tensor; labels?: tf.Tensor } {
        const indices = tf.util.createShuffledIndices(features.shape[0]);
        const shuffledFeatures = tf.gather(features, indices);
        const shuffledLabels = labels ? tf.gather(labels, indices) : undefined;

        return { features: shuffledFeatures, labels: shuffledLabels };
    }

    static splitData(
        features: tf.Tensor,
        labels: tf.Tensor,
        trainRatio: number = 0.8
    ): {
        trainFeatures: tf.Tensor;
        trainLabels: tf.Tensor;
        testFeatures: tf.Tensor;
        testLabels: tf.Tensor;
    } {
        const totalSamples = features.shape[0];
        const trainSamples = Math.floor(totalSamples * trainRatio);

        return {
            trainFeatures: features.slice([0], [trainSamples]),
            trainLabels: labels.slice([0], [trainSamples]),
            testFeatures: features.slice([trainSamples]),
            testLabels: labels.slice([trainSamples])
        };
    }

    static batchData(data: tf.Tensor, batchSize: number): tf.Tensor[] {
        const totalSamples = data.shape[0];
        const batches: tf.Tensor[] = [];

        for (let i = 0; i < totalSamples; i += batchSize) {
            const batchEnd = Math.min(i + batchSize, totalSamples);
            const batch = data.slice([i], [batchEnd - i]);
            batches.push(batch);
        }

        return batches;
    }

    static augmentData(
        images: tf.Tensor,
        options: {
            flipHorizontal?: boolean;
            rotation?: number;
            brightness?: number;
            contrast?: number;
        } = {}
    ): tf.Tensor {
        let augmented = images;

        if (options.flipHorizontal) {
            augmented = tf.image.flipLeftRight(augmented as tf.Tensor4D);
        }

        if (options.brightness) {
            augmented = tf.image.adjustBrightness(augmented as tf.Tensor4D, options.brightness);
        }

        if (options.contrast) {
            augmented = tf.image.adjustContrast(augmented as tf.Tensor4D, options.contrast);
        }

        return augmented;
    }
}

// Preprocessing pipeline builder
export class PreprocessingPipeline {
    private steps: Array<(data: tf.Tensor) => tf.Tensor> = [];

    addStep(step: (data: tf.Tensor) => tf.Tensor): this {
        this.steps.push(step);
        return this;
    }

    addNormalization(method: 'minmax' | 'zscore' = 'minmax'): this {
        this.steps.push((data) => DataPreprocessor.normalizeData(data, method));
        return this;
    }

    addResize(targetShape: number[]): this {
        this.steps.push((data) => {
            if (data.shape.length === 4) { // Batch of images
                return tf.image.resizeBilinear(data as tf.Tensor4D, [targetShape[0], targetShape[1]]);
            } else if (data.shape.length === 3) { // Single image
                return tf.image.resizeBilinear(data.expandDims(0) as tf.Tensor4D, [targetShape[0], targetShape[1]]).squeeze([0]);
            }
            return data;
        });
        return this;
    }

    addCustomStep(fn: (data: tf.Tensor) => tf.Tensor): this {
        this.steps.push(fn);
        return this;
    }

    process(data: tf.Tensor): tf.Tensor {
        return this.steps.reduce((currentData, step) => {
            const result = step(currentData);
            if (currentData !== data) {
                currentData.dispose(); // Clean up intermediate tensors
            }
            return result;
        }, data);
    }

    clear(): void {
        this.steps = [];
    }
}
