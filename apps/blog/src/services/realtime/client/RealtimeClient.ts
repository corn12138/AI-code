'use client';

import { EventEmitter } from 'events';
import { PollingConnection, SSEConnection } from '../connections/SSEConnection';
import { EnhancedWebSocketConnection, WebSocketConnection } from '../connections/WebSocketConnection';
import {
    ConnectionType,
    RealtimeConnection,
    RealtimeMessage
} from '../core/RealtimeManager';

// Client configuration
export interface RealtimeClientConfig {
    url: string;
    connectionType?: ConnectionType;
    fallbackTypes?: ConnectionType[];
    clientId?: string;
    autoReconnect?: boolean;
    maxReconnectAttempts?: number;
    heartbeatInterval?: number;
    enableCompression?: boolean;
    enableBatching?: boolean;
    authentication?: {
        token?: string;
        headers?: Record<string, string>;
    };
}

// Connection manager for client-side
export class RealtimeClient extends EventEmitter {
    private config: Required<RealtimeClientConfig>;
    private connection?: RealtimeConnection;
    private connectionAttempts: Map<ConnectionType, number> = new Map();
    private isConnecting = false;
    private messageHandlers: Map<string, (message: RealtimeMessage) => void> = new Map();
    private subscriptions: Set<string> = new Set();

    constructor(config: RealtimeClientConfig) {
        super();

        this.config = {
            url: config.url,
            connectionType: config.connectionType || 'websocket',
            fallbackTypes: config.fallbackTypes || ['sse', 'polling'],
            clientId: config.clientId || this.generateClientId(),
            autoReconnect: config.autoReconnect ?? true,
            maxReconnectAttempts: config.maxReconnectAttempts || 5,
            heartbeatInterval: config.heartbeatInterval || 30000,
            enableCompression: config.enableCompression ?? false,
            enableBatching: config.enableBatching ?? false,
            authentication: config.authentication || {}
        };

        this.initializeConnectionAttempts();
    }

    // Connect to the server
    async connect(): Promise<void> {
        if (this.isConnecting || this.isConnected()) {
            return;
        }

        this.isConnecting = true;

        try {
            await this.createConnection(this.config.connectionType);
        } catch (error) {
            await this.tryFallbackConnections();
        } finally {
            this.isConnecting = false;
        }
    }

    // Disconnect from the server
    disconnect(): void {
        if (this.connection) {
            this.connection.close();
            this.connection = undefined;
        }

        this.subscriptions.clear();
        this.emit('disconnect');
    }

    // Check if connected
    isConnected(): boolean {
        return this.connection?.isReady() ?? false;
    }

    // Send a message
    async send(type: string, payload: any, options?: {
        priority?: 'low' | 'normal' | 'high' | 'critical';
        roomId?: string;
        targetClientId?: string;
    }): Promise<void> {
        if (!this.isConnected()) {
            throw new Error('Not connected to server');
        }

        const message: RealtimeMessage = {
            id: this.generateMessageId(),
            type,
            payload,
            timestamp: new Date(),
            clientId: this.config.clientId,
            priority: options?.priority || 'normal',
            roomId: options?.roomId,
            metadata: {
                targetClientId: options?.targetClientId
            }
        };

        await this.connection!.send(message);
        this.emit('message:sent', message);
    }

    // Subscribe to message type
    subscribe(messageType: string, handler: (message: RealtimeMessage) => void): void {
        this.messageHandlers.set(messageType, handler);
        this.subscriptions.add(messageType);

        // Send subscription message to server
        if (this.isConnected()) {
            this.send('subscribe', { messageType }).catch(console.error);
        }
    }

    // Unsubscribe from message type
    unsubscribe(messageType: string): void {
        this.messageHandlers.delete(messageType);
        this.subscriptions.delete(messageType);

        // Send unsubscription message to server
        if (this.isConnected()) {
            this.send('unsubscribe', { messageType }).catch(console.error);
        }
    }

    // Join a room
    async joinRoom(roomId: string): Promise<void> {
        await this.send('room:join', { roomId });
    }

    // Leave a room
    async leaveRoom(roomId: string): Promise<void> {
        await this.send('room:leave', { roomId });
    }

    // Send message to room
    async sendToRoom(roomId: string, type: string, payload: any): Promise<void> {
        await this.send(type, payload, { roomId });
    }

    // Send direct message to client
    async sendToClient(targetClientId: string, type: string, payload: any): Promise<void> {
        await this.send(type, payload, { targetClientId });
    }

    // Get connection info
    getConnectionInfo() {
        return {
            clientId: this.config.clientId,
            isConnected: this.isConnected(),
            connectionType: this.connection?.type,
            connectionState: this.connection?.state,
            subscriptions: Array.from(this.subscriptions),
            config: this.config
        };
    }

    // Create connection based on type
    private async createConnection(type: ConnectionType): Promise<void> {
        const attempts = this.connectionAttempts.get(type) || 0;

        if (attempts >= this.config.maxReconnectAttempts) {
            throw new Error(`Max connection attempts reached for ${type}`);
        }

        this.connectionAttempts.set(type, attempts + 1);

        let connection: RealtimeConnection;
        const url = this.buildUrl(type);

        switch (type) {
            case 'websocket':
                if (this.config.enableCompression || this.config.enableBatching) {
                    connection = new EnhancedWebSocketConnection(
                        this.config.clientId,
                        url,
                        ['realtime'],
                        this.config.maxReconnectAttempts,
                        {
                            enableCompression: this.config.enableCompression,
                            enableBatching: this.config.enableBatching
                        }
                    );
                } else {
                    connection = new WebSocketConnection(
                        this.config.clientId,
                        url,
                        ['realtime'],
                        this.config.maxReconnectAttempts
                    );
                }
                break;

            case 'sse':
                connection = new SSEConnection(
                    this.config.clientId,
                    url,
                    this.config.maxReconnectAttempts,
                    true // withCredentials
                );
                break;

            case 'polling':
                connection = new PollingConnection(
                    this.config.clientId,
                    url,
                    1000, // 1 second polling interval
                    this.config.maxReconnectAttempts
                );
                break;

            default:
                throw new Error(`Unsupported connection type: ${type}`);
        }

        // Set up event handlers
        connection.setEventHandlers({
            onConnect: () => this.handleConnect(connection),
            onDisconnect: (reason) => this.handleDisconnect(reason),
            onMessage: (message) => this.handleMessage(message),
            onError: (error) => this.handleError(error)
        });

        this.connection = connection;

        // Wait for connection to be established
        await this.waitForConnection();
    }

    // Try fallback connections
    private async tryFallbackConnections(): Promise<void> {
        for (const fallbackType of this.config.fallbackTypes) {
            try {
                await this.createConnection(fallbackType);
                return; // Success, break out of loop
            } catch (error) {
                console.warn(`Fallback connection ${fallbackType} failed:`, error);
            }
        }

        throw new Error('All connection attempts failed');
    }

    // Wait for connection to be established
    private async waitForConnection(): Promise<void> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Connection timeout'));
            }, 10000); // 10 second timeout

            const checkConnection = () => {
                if (this.connection?.isReady()) {
                    clearTimeout(timeout);
                    resolve();
                } else if (this.connection?.state.status === 'error') {
                    clearTimeout(timeout);
                    reject(new Error('Connection failed'));
                } else {
                    setTimeout(checkConnection, 100);
                }
            };

            checkConnection();
        });
    }

    // Build URL for connection type
    private buildUrl(type: ConnectionType): string {
        const url = new URL(this.config.url);

        // Add authentication parameters
        if (this.config.authentication.token) {
            url.searchParams.set('token', this.config.authentication.token);
        }

        url.searchParams.set('clientId', this.config.clientId);
        url.searchParams.set('type', type);

        switch (type) {
            case 'websocket':
                url.protocol = url.protocol.replace('http', 'ws');
                url.pathname = '/ws';
                break;
            case 'sse':
                url.pathname = '/events';
                break;
            case 'polling':
                url.pathname = '/poll';
                break;
        }

        return url.toString();
    }

    // Initialize connection attempts tracking
    private initializeConnectionAttempts(): void {
        this.connectionAttempts.set('websocket', 0);
        this.connectionAttempts.set('sse', 0);
        this.connectionAttempts.set('polling', 0);
    }

    // Handle successful connection
    private handleConnect(connection: RealtimeConnection): void {
        // Reset connection attempts for this type
        this.connectionAttempts.set(connection.type, 0);

        // Re-establish subscriptions
        for (const messageType of this.subscriptions) {
            this.send('subscribe', { messageType }).catch(console.error);
        }

        this.emit('connect', connection);
    }

    // Handle disconnection
    private handleDisconnect(reason?: string): void {
        this.emit('disconnect', reason);

        // Auto-reconnect if enabled
        if (this.config.autoReconnect && !this.isConnecting) {
            setTimeout(() => {
                this.connect().catch(error => {
                    this.emit('error', error);
                });
            }, 1000);
        }
    }

    // Handle incoming message
    private handleMessage(message: RealtimeMessage): void {
        // Handle system messages
        if (message.type === 'ping') {
            this.handlePing(message);
            return;
        }

        // Route to specific handler
        const handler = this.messageHandlers.get(message.type);
        if (handler) {
            handler(message);
        }

        // Emit general message event
        this.emit('message', message);
        this.emit(`message:${message.type}`, message);
    }

    // Handle ping message
    private handlePing(message: RealtimeMessage): void {
        const pongMessage: RealtimeMessage = {
            id: this.generateMessageId(),
            type: 'pong',
            payload: {
                pingId: message.id,
                timestamp: Date.now()
            },
            timestamp: new Date(),
            clientId: this.config.clientId,
            priority: 'low'
        };

        this.connection?.send(pongMessage).catch(console.error);
    }

    // Handle errors
    private handleError(error: Error): void {
        this.emit('error', error);
    }

    // Generate unique client ID
    private generateClientId(): string {
        return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Generate unique message ID
    private generateMessageId(): string {
        return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
