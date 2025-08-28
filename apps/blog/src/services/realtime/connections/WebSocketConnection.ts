'use client';

import { ConnectionState, ConnectionType, RealtimeConnection, RealtimeMessage } from '../core/RealtimeManager';

// WebSocket connection implementation
export class WebSocketConnection implements RealtimeConnection {
    public readonly id: string;
    public readonly type: ConnectionType = 'websocket';
    public state: ConnectionState;

    private ws: WebSocket;
    private reconnectTimer?: NodeJS.Timeout;
    private url: string;
    private protocols?: string[];

    constructor(
        id: string,
        url: string,
        protocols?: string[],
        maxReconnectAttempts: number = 5
    ) {
        this.id = id;
        this.url = url;
        this.protocols = protocols;

        this.state = {
            id,
            type: 'websocket',
            status: 'connecting',
            reconnectAttempts: 0,
            maxReconnectAttempts
        };

        this.connect();
    }

    private connect(): void {
        try {
            this.ws = new WebSocket(this.url, this.protocols);
            this.setupEventHandlers();
            this.state.status = 'connecting';
        } catch (error) {
            this.handleError(error as Error);
        }
    }

    private setupEventHandlers(): void {
        this.ws.onopen = () => {
            this.state.status = 'connected';
            this.state.reconnectAttempts = 0;
            this.clearReconnectTimer();
            this.onConnect();
        };

        this.ws.onmessage = (event) => {
            try {
                const message: RealtimeMessage = JSON.parse(event.data);
                this.onMessage(message);
            } catch (error) {
                this.handleError(new Error(`Failed to parse message: ${error}`));
            }
        };

        this.ws.onclose = (event) => {
            this.state.status = 'disconnected';
            this.onDisconnect(event.reason);

            // Attempt reconnection if not manually closed
            if (event.code !== 1000 && this.shouldReconnect()) {
                this.scheduleReconnect();
            }
        };

        this.ws.onerror = (event) => {
            this.state.status = 'error';
            this.handleError(new Error(`WebSocket error: ${event}`));
        };
    }

    async send(message: RealtimeMessage): Promise<void> {
        if (!this.isReady()) {
            throw new Error(`WebSocket not ready. Status: ${this.state.status}`);
        }

        try {
            const serialized = JSON.stringify(message);
            this.ws.send(serialized);
            this.state.lastMessage = new Date();
        } catch (error) {
            throw new Error(`Failed to send message: ${error}`);
        }
    }

    close(): void {
        this.clearReconnectTimer();

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.close(1000, 'Client disconnecting');
        }

        this.state.status = 'disconnected';
    }

    isReady(): boolean {
        return this.ws &&
            this.ws.readyState === WebSocket.OPEN &&
            this.state.status === 'connected';
    }

    private shouldReconnect(): boolean {
        return this.state.reconnectAttempts < this.state.maxReconnectAttempts;
    }

    private scheduleReconnect(): void {
        if (!this.shouldReconnect()) {
            this.state.status = 'error';
            return;
        }

        this.state.status = 'reconnecting';
        this.state.reconnectAttempts++;

        const delay = Math.min(1000 * Math.pow(2, this.state.reconnectAttempts - 1), 30000);

        this.reconnectTimer = setTimeout(() => {
            this.connect();
        }, delay);
    }

    private clearReconnectTimer(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = undefined;
        }
    }

    private onConnect(): void {
        // Override in subclass or use event emitter
    }

    private onDisconnect(reason?: string): void {
        // Override in subclass or use event emitter
    }

    private onMessage(message: RealtimeMessage): void {
        // Override in subclass or use event emitter
    }

    private handleError(error: Error): void {
        // Override in subclass or use event emitter
        console.error(`WebSocket connection error:`, error);
    }

    // Get connection info
    getConnectionInfo() {
        return {
            id: this.id,
            type: this.type,
            state: this.state,
            url: this.url,
            protocols: this.protocols,
            readyState: this.ws?.readyState,
            bufferedAmount: this.ws?.bufferedAmount
        };
    }

    // Set event handlers
    setEventHandlers(handlers: {
        onConnect?: () => void;
        onDisconnect?: (reason?: string) => void;
        onMessage?: (message: RealtimeMessage) => void;
        onError?: (error: Error) => void;
    }): void {
        if (handlers.onConnect) this.onConnect = handlers.onConnect;
        if (handlers.onDisconnect) this.onDisconnect = handlers.onDisconnect;
        if (handlers.onMessage) this.onMessage = handlers.onMessage;
        if (handlers.onError) this.handleError = handlers.onError;
    }
}

// Enhanced WebSocket connection with additional features
export class EnhancedWebSocketConnection extends WebSocketConnection {
    private compressionEnabled: boolean;
    private batchingEnabled: boolean;
    private messageQueue: RealtimeMessage[] = [];
    private batchTimer?: NodeJS.Timeout;
    private batchSize: number;
    private batchInterval: number;

    constructor(
        id: string,
        url: string,
        protocols?: string[],
        maxReconnectAttempts: number = 5,
        options: {
            enableCompression?: boolean;
            enableBatching?: boolean;
            batchSize?: number;
            batchInterval?: number;
        } = {}
    ) {
        super(id, url, protocols, maxReconnectAttempts);

        this.compressionEnabled = options.enableCompression ?? false;
        this.batchingEnabled = options.enableBatching ?? false;
        this.batchSize = options.batchSize ?? 10;
        this.batchInterval = options.batchInterval ?? 100;

        if (this.batchingEnabled) {
            this.startBatchTimer();
        }
    }

    async send(message: RealtimeMessage): Promise<void> {
        if (this.batchingEnabled && message.priority !== 'critical') {
            this.queueMessage(message);
            return;
        }

        await this.sendDirect(message);
    }

    private async sendDirect(message: RealtimeMessage): Promise<void> {
        let payload = JSON.stringify(message);

        // Apply compression if enabled
        if (this.compressionEnabled) {
            payload = await this.compress(payload);
        }

        if (!this.isReady()) {
            throw new Error(`WebSocket not ready. Status: ${this.state.status}`);
        }

        try {
            this.ws.send(payload);
            this.state.lastMessage = new Date();
        } catch (error) {
            throw new Error(`Failed to send message: ${error}`);
        }
    }

    private queueMessage(message: RealtimeMessage): void {
        this.messageQueue.push(message);

        if (this.messageQueue.length >= this.batchSize) {
            this.flushQueue();
        }
    }

    private startBatchTimer(): void {
        this.batchTimer = setInterval(() => {
            if (this.messageQueue.length > 0) {
                this.flushQueue();
            }
        }, this.batchInterval);
    }

    private async flushQueue(): Promise<void> {
        if (this.messageQueue.length === 0) return;

        const batch = this.messageQueue.splice(0, this.batchSize);

        const batchMessage: RealtimeMessage = {
            id: `batch-${Date.now()}`,
            type: 'batch',
            payload: { messages: batch },
            timestamp: new Date(),
            priority: 'normal'
        };

        try {
            await this.sendDirect(batchMessage);
        } catch (error) {
            // Re-queue messages on failure
            this.messageQueue.unshift(...batch);
            throw error;
        }
    }

    private async compress(data: string): Promise<string> {
        // Placeholder for compression implementation
        // In a real implementation, you might use libraries like pako or similar
        return data;
    }

    close(): void {
        if (this.batchTimer) {
            clearInterval(this.batchTimer);
        }

        // Flush any remaining messages
        if (this.messageQueue.length > 0) {
            this.flushQueue().catch(console.error);
        }

        super.close();
    }

    // Get queue status
    getQueueStatus() {
        return {
            queuedMessages: this.messageQueue.length,
            batchingEnabled: this.batchingEnabled,
            compressionEnabled: this.compressionEnabled
        };
    }
}
