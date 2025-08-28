// Core exports
export {
    InMemoryMessageQueue, RealtimeManager, RealtimeMetrics
} from './core/RealtimeManager';
export type {
    ConnectionState, ConnectionType, MessageQueue, RealtimeConfig,
    RealtimeConnection,
    RealtimeEventHandlers, RealtimeMessage
} from './core/RealtimeManager';

// Connection exports
export {
    PollingConnection, SSEConnection
} from './connections/SSEConnection';
export {
    EnhancedWebSocketConnection, WebSocketConnection
} from './connections/WebSocketConnection';

// Client exports
export { RealtimeClient } from './client/RealtimeClient';
export type { RealtimeClientConfig } from './client/RealtimeClient';

// Integration exports
export {
    AIAssistantRealtimeIntegration,
    ConversationContext
} from './integrations/AIAssistantIntegration';

// Utility functions and presets
export class RealtimeBuilder {
    static createWebSocketClient(url: string, options: {
        clientId?: string;
        autoReconnect?: boolean;
        enableCompression?: boolean;
        enableBatching?: boolean;
        authentication?: {
            token?: string;
            headers?: Record<string, string>;
        };
    } = {}) {
        return new RealtimeClient({
            url,
            connectionType: 'websocket',
            fallbackTypes: ['sse', 'polling'],
            ...options
        });
    }

    static createSSEClient(url: string, options: {
        clientId?: string;
        autoReconnect?: boolean;
        authentication?: {
            token?: string;
            headers?: Record<string, string>;
        };
    } = {}) {
        return new RealtimeClient({
            url,
            connectionType: 'sse',
            fallbackTypes: ['polling'],
            enableCompression: false,
            enableBatching: false,
            ...options
        });
    }

    static createPollingClient(url: string, options: {
        clientId?: string;
        autoReconnect?: boolean;
        pollingInterval?: number;
        authentication?: {
            token?: string;
            headers?: Record<string, string>;
        };
    } = {}) {
        return new RealtimeClient({
            url,
            connectionType: 'polling',
            fallbackTypes: [],
            enableCompression: false,
            enableBatching: false,
            heartbeatInterval: options.pollingInterval || 1000,
            ...options
        });
    }

    static createUniversalClient(url: string, options: {
        clientId?: string;
        preferredTypes?: ConnectionType[];
        enableAllFeatures?: boolean;
        authentication?: {
            token?: string;
            headers?: Record<string, string>;
        };
    } = {}) {
        const preferredTypes = options.preferredTypes || ['websocket', 'sse', 'polling'];

        return new RealtimeClient({
            url,
            connectionType: preferredTypes[0],
            fallbackTypes: preferredTypes.slice(1),
            enableCompression: options.enableAllFeatures ?? true,
            enableBatching: options.enableAllFeatures ?? true,
            autoReconnect: true,
            maxReconnectAttempts: 5,
            heartbeatInterval: 30000,
            ...options
        });
    }
}

// Connection quality detector
export class ConnectionQualityDetector {
    private metrics: {
        latency: number[];
        bandwidth: number[];
        dropRate: number;
        stability: number;
    } = {
            latency: [],
            bandwidth: [],
            dropRate: 0,
            stability: 1.0
        };

    async measureConnectionQuality(client: RealtimeClient): Promise<{
        quality: 'excellent' | 'good' | 'fair' | 'poor';
        metrics: typeof this.metrics;
        recommendations: string[];
    }> {
        // Measure latency
        const latency = await this.measureLatency(client);
        this.metrics.latency.push(latency);

        // Keep only last 10 measurements
        if (this.metrics.latency.length > 10) {
            this.metrics.latency = this.metrics.latency.slice(-10);
        }

        // Calculate quality metrics
        const avgLatency = this.metrics.latency.reduce((a, b) => a + b, 0) / this.metrics.latency.length;
        const quality = this.determineQuality(avgLatency);
        const recommendations = this.generateRecommendations(quality, avgLatency);

        return {
            quality,
            metrics: { ...this.metrics },
            recommendations
        };
    }

    private async measureLatency(client: RealtimeClient): Promise<number> {
        const start = Date.now();

        return new Promise((resolve) => {
            const timeout = setTimeout(() => resolve(5000), 5000); // 5s timeout

            const messageId = `ping-${Date.now()}`;

            const handlePong = (message: any) => {
                if (message.payload?.pingId === messageId) {
                    clearTimeout(timeout);
                    client.unsubscribe('pong');
                    resolve(Date.now() - start);
                }
            };

            client.subscribe('pong', handlePong);

            client.send('ping', { messageId }).catch(() => {
                clearTimeout(timeout);
                resolve(5000);
            });
        });
    }

    private determineQuality(latency: number): 'excellent' | 'good' | 'fair' | 'poor' {
        if (latency < 50) return 'excellent';
        if (latency < 150) return 'good';
        if (latency < 300) return 'fair';
        return 'poor';
    }

    private generateRecommendations(quality: string, latency: number): string[] {
        const recommendations: string[] = [];

        if (quality === 'poor') {
            recommendations.push('Consider switching to polling connection');
            recommendations.push('Check network connectivity');
            recommendations.push('Reduce message frequency');
        } else if (quality === 'fair') {
            recommendations.push('Consider enabling compression');
            recommendations.push('Optimize message payloads');
        } else if (quality === 'good') {
            recommendations.push('Connection quality is good');
        } else {
            recommendations.push('Excellent connection quality');
            recommendations.push('Consider enabling advanced features');
        }

        return recommendations;
    }
}

// Priority message queue for client-side message handling
export class PriorityMessageQueue {
    private queues: {
        critical: RealtimeMessage[];
        high: RealtimeMessage[];
        normal: RealtimeMessage[];
        low: RealtimeMessage[];
    } = {
            critical: [],
            high: [],
            normal: [],
            low: []
        };

    private processing = false;
    private handlers: Map<string, (message: RealtimeMessage) => Promise<void>> = new Map();

    constructor() { }

    enqueue(message: RealtimeMessage): void {
        const priority = message.priority || 'normal';
        this.queues[priority].push(message);

        if (!this.processing) {
            this.process();
        }
    }

    addHandler(messageType: string, handler: (message: RealtimeMessage) => Promise<void>): void {
        this.handlers.set(messageType, handler);
    }

    removeHandler(messageType: string): void {
        this.handlers.delete(messageType);
    }

    private async process(): Promise<void> {
        this.processing = true;

        while (this.hasMessages()) {
            const message = this.dequeue();
            if (message) {
                await this.handleMessage(message);
            }
        }

        this.processing = false;
    }

    private dequeue(): RealtimeMessage | null {
        // Process in priority order
        if (this.queues.critical.length > 0) {
            return this.queues.critical.shift()!;
        }
        if (this.queues.high.length > 0) {
            return this.queues.high.shift()!;
        }
        if (this.queues.normal.length > 0) {
            return this.queues.normal.shift()!;
        }
        if (this.queues.low.length > 0) {
            return this.queues.low.shift()!;
        }
        return null;
    }

    private hasMessages(): boolean {
        return Object.values(this.queues).some(queue => queue.length > 0);
    }

    private async handleMessage(message: RealtimeMessage): Promise<void> {
        const handler = this.handlers.get(message.type);
        if (handler) {
            try {
                await handler(message);
            } catch (error) {
                console.error(`Error handling message ${message.type}:`, error);
            }
        }
    }

    getQueueStatus(): {
        critical: number;
        high: number;
        normal: number;
        low: number;
        total: number;
    } {
        return {
            critical: this.queues.critical.length,
            high: this.queues.high.length,
            normal: this.queues.normal.length,
            low: this.queues.low.length,
            total: Object.values(this.queues).reduce((sum, queue) => sum + queue.length, 0)
        };
    }

    clear(): void {
        Object.keys(this.queues).forEach(key => {
            this.queues[key as keyof typeof this.queues] = [];
        });
    }
}

// Realtime presets for common use cases
export const REALTIME_PRESETS = {
    // Chat application
    CHAT_APP: (url: string, options: { enableStreaming?: boolean } = {}) => {
        return RealtimeBuilder.createUniversalClient(url, {
            preferredTypes: ['websocket', 'sse'],
            enableAllFeatures: true,
            ...options
        });
    },

    // Live collaboration
    COLLABORATION: (url: string) => {
        return RealtimeBuilder.createWebSocketClient(url, {
            enableCompression: true,
            enableBatching: true,
            autoReconnect: true
        });
    },

    // Notifications only
    NOTIFICATIONS: (url: string) => {
        return RealtimeBuilder.createSSEClient(url, {
            autoReconnect: true
        });
    },

    // Low bandwidth environment
    LOW_BANDWIDTH: (url: string) => {
        return RealtimeBuilder.createPollingClient(url, {
            pollingInterval: 5000, // 5 seconds
            autoReconnect: true
        });
    },

    // Development/testing
    DEVELOPMENT: (url: string) => {
        return RealtimeBuilder.createUniversalClient(url, {
            preferredTypes: ['websocket', 'polling'],
            enableAllFeatures: false
        });
    },

    // AI Chat with integrated services
    AI_ASSISTANT: (url: string, llmManager: any, toolRegistry: any) => {
        const client = RealtimeBuilder.createUniversalClient(url, {
            preferredTypes: ['websocket', 'sse'],
            enableAllFeatures: true,
            autoReconnect: true
        });

        const integration = new AIAssistantRealtimeIntegration(
            client,
            llmManager,
            toolRegistry
        );

        return { client, integration };
    }
};