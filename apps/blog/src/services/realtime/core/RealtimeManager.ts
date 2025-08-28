'use client';

import { EventEmitter } from 'events';

// Connection types
export type ConnectionType = 'websocket' | 'sse' | 'polling';

// Message interface
export interface RealtimeMessage {
    id: string;
    type: string;
    payload: any;
    timestamp: Date;
    clientId?: string;
    roomId?: string;
    priority?: 'low' | 'normal' | 'high' | 'critical';
    metadata?: Record<string, any>;
}

// Connection state
export interface ConnectionState {
    id: string;
    type: ConnectionType;
    status: 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting';
    lastPing?: Date;
    lastMessage?: Date;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
    heartbeatInterval?: NodeJS.Timeout;
    pingTimeout?: NodeJS.Timeout;
}

// Configuration
export interface RealtimeConfig {
    // Connection settings
    maxConnections?: number;
    heartbeatInterval?: number;
    pingTimeout?: number;
    maxReconnectAttempts?: number;
    reconnectDelay?: number;

    // Message settings
    messageBufferSize?: number;
    maxMessageSize?: number;
    rateLimitPerSecond?: number;

    // WebSocket settings
    wsPath?: string;
    wsProtocols?: string[];

    // SSE settings
    ssePath?: string;
    sseRetryTime?: number;

    // Security
    requireAuth?: boolean;
    corsOrigins?: string[];

    // Performance
    enableCompression?: boolean;
    enableBatching?: boolean;
    batchInterval?: number;
    batchSize?: number;
}

// Connection interface
export interface RealtimeConnection {
    id: string;
    type: ConnectionType;
    state: ConnectionState;
    send(message: RealtimeMessage): Promise<void>;
    close(): void;
    isReady(): boolean;
}

// Event handlers
export interface RealtimeEventHandlers {
    onConnect?: (connection: RealtimeConnection) => void;
    onDisconnect?: (connectionId: string, reason?: string) => void;
    onMessage?: (message: RealtimeMessage, connection: RealtimeConnection) => void;
    onError?: (error: Error, connection?: RealtimeConnection) => void;
    onReconnect?: (connection: RealtimeConnection, attempts: number) => void;
}

// Message queue interface
export interface MessageQueue {
    push(message: RealtimeMessage): Promise<void>;
    pop(): Promise<RealtimeMessage | null>;
    peek(): Promise<RealtimeMessage | null>;
    size(): Promise<number>;
    clear(): Promise<void>;
}

// Realtime Manager - Central coordinator for all realtime connections
export class RealtimeManager extends EventEmitter {
    private config: Required<RealtimeConfig>;
    private connections: Map<string, RealtimeConnection> = new Map();
    private rooms: Map<string, Set<string>> = new Map(); // roomId -> connectionIds
    private messageQueue: MessageQueue;
    private messageBuffer: Map<string, RealtimeMessage[]> = new Map();
    private rateLimiters: Map<string, { count: number; resetTime: number }> = new Map();
    private metrics: RealtimeMetrics;

    constructor(config: RealtimeConfig = {}, messageQueue?: MessageQueue) {
        super();

        this.config = {
            maxConnections: 1000,
            heartbeatInterval: 30000, // 30 seconds
            pingTimeout: 5000, // 5 seconds
            maxReconnectAttempts: 5,
            reconnectDelay: 1000,
            messageBufferSize: 100,
            maxMessageSize: 1024 * 1024, // 1MB
            rateLimitPerSecond: 10,
            wsPath: '/ws',
            wsProtocols: [],
            ssePath: '/events',
            sseRetryTime: 3000,
            requireAuth: false,
            corsOrigins: ['*'],
            enableCompression: true,
            enableBatching: false,
            batchInterval: 100,
            batchSize: 10,
            ...config
        };

        this.messageQueue = messageQueue || new InMemoryMessageQueue();
        this.metrics = new RealtimeMetrics();

        this.startCleanupInterval();
    }

    // Add connection
    addConnection(connection: RealtimeConnection): void {
        if (this.connections.size >= this.config.maxConnections) {
            throw new Error('Maximum connections reached');
        }

        this.connections.set(connection.id, connection);
        this.initializeConnection(connection);

        this.metrics.incrementConnectionCount();
        this.emit('connect', connection);
    }

    // Remove connection
    removeConnection(connectionId: string, reason?: string): void {
        const connection = this.connections.get(connectionId);
        if (!connection) return;

        this.cleanupConnection(connection);
        this.connections.delete(connectionId);

        // Remove from all rooms
        for (const [roomId, connectionIds] of this.rooms.entries()) {
            connectionIds.delete(connectionId);
            if (connectionIds.size === 0) {
                this.rooms.delete(roomId);
            }
        }

        this.metrics.decrementConnectionCount();
        this.emit('disconnect', connectionId, reason);
    }

    // Send message to specific connection
    async sendToConnection(connectionId: string, message: RealtimeMessage): Promise<void> {
        const connection = this.connections.get(connectionId);
        if (!connection || !connection.isReady()) {
            // Buffer message for later delivery
            await this.bufferMessage(connectionId, message);
            return;
        }

        try {
            await connection.send(message);
            this.metrics.incrementMessagesSent();
        } catch (error) {
            this.emit('error', error, connection);
            await this.bufferMessage(connectionId, message);
        }
    }

    // Broadcast message to all connections
    async broadcast(message: RealtimeMessage, excludeConnectionId?: string): Promise<void> {
        const promises: Promise<void>[] = [];

        for (const [connectionId, connection] of this.connections) {
            if (excludeConnectionId && connectionId === excludeConnectionId) continue;

            promises.push(this.sendToConnection(connectionId, {
                ...message,
                clientId: connectionId
            }));
        }

        await Promise.allSettled(promises);
    }

    // Send message to room
    async sendToRoom(roomId: string, message: RealtimeMessage, excludeConnectionId?: string): Promise<void> {
        const connectionIds = this.rooms.get(roomId);
        if (!connectionIds) return;

        const promises: Promise<void>[] = [];

        for (const connectionId of connectionIds) {
            if (excludeConnectionId && connectionId === excludeConnectionId) continue;

            promises.push(this.sendToConnection(connectionId, {
                ...message,
                roomId,
                clientId: connectionId
            }));
        }

        await Promise.allSettled(promises);
    }

    // Join room
    joinRoom(connectionId: string, roomId: string): void {
        if (!this.connections.has(connectionId)) {
            throw new Error(`Connection ${connectionId} not found`);
        }

        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Set());
        }

        this.rooms.get(roomId)!.add(connectionId);
        this.emit('room:join', connectionId, roomId);
    }

    // Leave room
    leaveRoom(connectionId: string, roomId: string): void {
        const connectionIds = this.rooms.get(roomId);
        if (!connectionIds) return;

        connectionIds.delete(connectionId);

        if (connectionIds.size === 0) {
            this.rooms.delete(roomId);
        }

        this.emit('room:leave', connectionId, roomId);
    }

    // Get room members
    getRoomMembers(roomId: string): string[] {
        const connectionIds = this.rooms.get(roomId);
        return connectionIds ? Array.from(connectionIds) : [];
    }

    // Check rate limit
    private checkRateLimit(connectionId: string): boolean {
        const now = Date.now();
        const limiter = this.rateLimiters.get(connectionId);

        if (!limiter || now >= limiter.resetTime) {
            this.rateLimiters.set(connectionId, {
                count: 1,
                resetTime: now + 1000 // Reset every second
            });
            return true;
        }

        if (limiter.count >= this.config.rateLimitPerSecond) {
            return false;
        }

        limiter.count++;
        return true;
    }

    // Buffer message for offline/disconnected clients
    private async bufferMessage(connectionId: string, message: RealtimeMessage): Promise<void> {
        const buffer = this.messageBuffer.get(connectionId) || [];

        if (buffer.length >= this.config.messageBufferSize) {
            buffer.shift(); // Remove oldest message
        }

        buffer.push(message);
        this.messageBuffer.set(connectionId, buffer);
    }

    // Deliver buffered messages
    private async deliverBufferedMessages(connection: RealtimeConnection): Promise<void> {
        const buffer = this.messageBuffer.get(connection.id);
        if (!buffer || buffer.length === 0) return;

        for (const message of buffer) {
            try {
                await connection.send(message);
            } catch (error) {
                this.emit('error', error, connection);
                break; // Stop delivering if connection fails
            }
        }

        this.messageBuffer.delete(connection.id);
    }

    // Initialize connection
    private initializeConnection(connection: RealtimeConnection): void {
        // Set up heartbeat
        const heartbeatInterval = setInterval(() => {
            this.sendHeartbeat(connection);
        }, this.config.heartbeatInterval);

        connection.state.heartbeatInterval = heartbeatInterval;

        // Deliver any buffered messages
        this.deliverBufferedMessages(connection);
    }

    // Cleanup connection
    private cleanupConnection(connection: RealtimeConnection): void {
        if (connection.state.heartbeatInterval) {
            clearInterval(connection.state.heartbeatInterval);
        }

        if (connection.state.pingTimeout) {
            clearTimeout(connection.state.pingTimeout);
        }

        this.rateLimiters.delete(connection.id);
    }

    // Send heartbeat
    private async sendHeartbeat(connection: RealtimeConnection): Promise<void> {
        if (!connection.isReady()) return;

        const pingMessage: RealtimeMessage = {
            id: `ping-${Date.now()}`,
            type: 'ping',
            payload: { timestamp: Date.now() },
            timestamp: new Date(),
            priority: 'low'
        };

        try {
            await connection.send(pingMessage);
            connection.state.lastPing = new Date();

            // Set timeout for pong response
            connection.state.pingTimeout = setTimeout(() => {
                this.handlePingTimeout(connection);
            }, this.config.pingTimeout);

        } catch (error) {
            this.emit('error', error, connection);
        }
    }

    // Handle ping timeout
    private handlePingTimeout(connection: RealtimeConnection): void {
        this.emit('error', new Error('Ping timeout'), connection);
        this.removeConnection(connection.id, 'ping_timeout');
    }

    // Start cleanup interval
    private startCleanupInterval(): void {
        setInterval(() => {
            this.cleanup();
        }, 60000); // Clean up every minute
    }

    // Cleanup stale connections and data
    private cleanup(): void {
        const now = Date.now();

        // Clean up rate limiters
        for (const [connectionId, limiter] of this.rateLimiters.entries()) {
            if (now >= limiter.resetTime) {
                this.rateLimiters.delete(connectionId);
            }
        }

        // Clean up stale message buffers
        for (const [connectionId, buffer] of this.messageBuffer.entries()) {
            if (!this.connections.has(connectionId)) {
                this.messageBuffer.delete(connectionId);
            }
        }
    }

    // Get metrics
    getMetrics(): RealtimeMetrics {
        return this.metrics;
    }

    // Get connection count
    getConnectionCount(): number {
        return this.connections.size;
    }

    // Get room count
    getRoomCount(): number {
        return this.rooms.size;
    }

    // Shutdown
    async shutdown(): Promise<void> {
        // Close all connections
        for (const connection of this.connections.values()) {
            connection.close();
        }

        this.connections.clear();
        this.rooms.clear();
        this.messageBuffer.clear();
        this.rateLimiters.clear();

        this.removeAllListeners();
    }
}

// In-memory message queue implementation
export class InMemoryMessageQueue implements MessageQueue {
    private queue: RealtimeMessage[] = [];

    async push(message: RealtimeMessage): Promise<void> {
        this.queue.push(message);
    }

    async pop(): Promise<RealtimeMessage | null> {
        return this.queue.shift() || null;
    }

    async peek(): Promise<RealtimeMessage | null> {
        return this.queue[0] || null;
    }

    async size(): Promise<number> {
        return this.queue.length;
    }

    async clear(): Promise<void> {
        this.queue = [];
    }
}

// Metrics collection
export class RealtimeMetrics {
    private connectionCount = 0;
    private messagesSent = 0;
    private messagesReceived = 0;
    private errorsCount = 0;
    private startTime = Date.now();

    incrementConnectionCount(): void {
        this.connectionCount++;
    }

    decrementConnectionCount(): void {
        this.connectionCount = Math.max(0, this.connectionCount - 1);
    }

    incrementMessagesSent(): void {
        this.messagesSent++;
    }

    incrementMessagesReceived(): void {
        this.messagesReceived++;
    }

    incrementErrorsCount(): void {
        this.errorsCount++;
    }

    getMetrics() {
        const uptime = Date.now() - this.startTime;

        return {
            connectionCount: this.connectionCount,
            messagesSent: this.messagesSent,
            messagesReceived: this.messagesReceived,
            errorsCount: this.errorsCount,
            uptime,
            messagesPerSecond: this.messagesSent / (uptime / 1000),
            errorRate: this.errorsCount / Math.max(1, this.messagesSent + this.messagesReceived)
        };
    }

    reset(): void {
        this.connectionCount = 0;
        this.messagesSent = 0;
        this.messagesReceived = 0;
        this.errorsCount = 0;
        this.startTime = Date.now();
    }
}
