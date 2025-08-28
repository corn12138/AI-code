'use client';

import { ConnectionState, ConnectionType, RealtimeConnection, RealtimeMessage } from '../core/RealtimeManager';

// Server-Sent Events connection implementation
export class SSEConnection implements RealtimeConnection {
    public readonly id: string;
    public readonly type: ConnectionType = 'sse';
    public state: ConnectionState;

    private eventSource?: EventSource;
    private reconnectTimer?: NodeJS.Timeout;
    private url: string;
    private withCredentials: boolean;

    constructor(
        id: string,
        url: string,
        maxReconnectAttempts: number = 5,
        withCredentials: boolean = false
    ) {
        this.id = id;
        this.url = url;
        this.withCredentials = withCredentials;

        this.state = {
            id,
            type: 'sse',
            status: 'connecting',
            reconnectAttempts: 0,
            maxReconnectAttempts
        };

        this.connect();
    }

    private connect(): void {
        try {
            // Add client ID to URL for server-side tracking
            const connectUrl = new URL(this.url);
            connectUrl.searchParams.set('clientId', this.id);

            this.eventSource = new EventSource(connectUrl.toString(), {
                withCredentials: this.withCredentials
            });

            this.setupEventHandlers();
            this.state.status = 'connecting';
        } catch (error) {
            this.handleError(error as Error);
        }
    }

    private setupEventHandlers(): void {
        if (!this.eventSource) return;

        this.eventSource.onopen = () => {
            this.state.status = 'connected';
            this.state.reconnectAttempts = 0;
            this.clearReconnectTimer();
            this.onConnect();
        };

        this.eventSource.onmessage = (event) => {
            try {
                const message: RealtimeMessage = JSON.parse(event.data);
                this.onMessage(message);
                this.state.lastMessage = new Date();
            } catch (error) {
                this.handleError(new Error(`Failed to parse SSE message: ${error}`));
            }
        };

        this.eventSource.onerror = (event) => {
            this.state.status = 'error';

            // EventSource automatically reconnects, but we want to control it
            if (this.eventSource?.readyState === EventSource.CLOSED) {
                this.onDisconnect('connection_closed');

                if (this.shouldReconnect()) {
                    this.scheduleReconnect();
                }
            } else {
                this.handleError(new Error(`SSE error: ${event}`));
            }
        };

        // Handle custom event types
        this.eventSource.addEventListener('ping', (event) => {
            this.handlePing(event as MessageEvent);
        });

        this.eventSource.addEventListener('disconnect', (event) => {
            this.onDisconnect((event as MessageEvent).data);
        });

        this.eventSource.addEventListener('error', (event) => {
            this.handleError(new Error((event as MessageEvent).data));
        });
    }

    async send(message: RealtimeMessage): Promise<void> {
        // SSE is unidirectional, so we need to send via HTTP POST
        // This simulates sending by making an HTTP request to a companion endpoint

        try {
            const sendUrl = this.url.replace('/events', '/send');

            const response = await fetch(sendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Client-ID': this.id
                },
                credentials: this.withCredentials ? 'include' : 'same-origin',
                body: JSON.stringify(message)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            this.state.lastMessage = new Date();
        } catch (error) {
            throw new Error(`Failed to send SSE message: ${error}`);
        }
    }

    close(): void {
        this.clearReconnectTimer();

        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = undefined;
        }

        this.state.status = 'disconnected';
    }

    isReady(): boolean {
        return this.eventSource !== undefined &&
            this.eventSource.readyState === EventSource.OPEN &&
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

        // Exponential backoff with jitter
        const baseDelay = 1000 * Math.pow(2, this.state.reconnectAttempts - 1);
        const jitter = Math.random() * 1000;
        const delay = Math.min(baseDelay + jitter, 30000);

        this.reconnectTimer = setTimeout(() => {
            this.close(); // Close existing connection
            this.connect(); // Create new connection
        }, delay);
    }

    private clearReconnectTimer(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = undefined;
        }
    }

    private handlePing(event: MessageEvent): void {
        // Respond to ping with pong via HTTP
        const pongMessage: RealtimeMessage = {
            id: `pong-${Date.now()}`,
            type: 'pong',
            payload: {
                pingId: event.data,
                timestamp: Date.now()
            },
            timestamp: new Date(),
            priority: 'low'
        };

        this.send(pongMessage).catch(error => {
            this.handleError(new Error(`Failed to send pong: ${error}`));
        });
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
        console.error(`SSE connection error:`, error);
    }

    // Get connection info
    getConnectionInfo() {
        return {
            id: this.id,
            type: this.type,
            state: this.state,
            url: this.url,
            readyState: this.eventSource?.readyState,
            withCredentials: this.withCredentials
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

// Polling fallback connection
export class PollingConnection implements RealtimeConnection {
    public readonly id: string;
    public readonly type: ConnectionType = 'polling';
    public state: ConnectionState;

    private pollingInterval?: NodeJS.Timeout;
    private url: string;
    private interval: number;
    private lastMessageId?: string;

    constructor(
        id: string,
        url: string,
        interval: number = 1000,
        maxReconnectAttempts: number = 5
    ) {
        this.id = id;
        this.url = url;
        this.interval = interval;

        this.state = {
            id,
            type: 'polling',
            status: 'connecting',
            reconnectAttempts: 0,
            maxReconnectAttempts
        };

        this.startPolling();
    }

    private startPolling(): void {
        this.state.status = 'connected';
        this.onConnect();

        this.pollingInterval = setInterval(async () => {
            try {
                await this.poll();
            } catch (error) {
                this.handleError(error as Error);
            }
        }, this.interval);
    }

    private async poll(): Promise<void> {
        const pollUrl = new URL(this.url);
        pollUrl.searchParams.set('clientId', this.id);

        if (this.lastMessageId) {
            pollUrl.searchParams.set('since', this.lastMessageId);
        }

        try {
            const response = await fetch(pollUrl.toString(), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.messages && Array.isArray(data.messages)) {
                for (const messageData of data.messages) {
                    const message: RealtimeMessage = messageData;
                    this.onMessage(message);
                    this.lastMessageId = message.id;
                }
            }

            this.state.lastMessage = new Date();
        } catch (error) {
            throw new Error(`Polling failed: ${error}`);
        }
    }

    async send(message: RealtimeMessage): Promise<void> {
        try {
            const sendUrl = this.url.replace('/poll', '/send');

            const response = await fetch(sendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Client-ID': this.id
                },
                body: JSON.stringify(message)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            this.state.lastMessage = new Date();
        } catch (error) {
            throw new Error(`Failed to send polling message: ${error}`);
        }
    }

    close(): void {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = undefined;
        }

        this.state.status = 'disconnected';
    }

    isReady(): boolean {
        return this.state.status === 'connected' && this.pollingInterval !== undefined;
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
        console.error(`Polling connection error:`, error);
    }

    // Get connection info
    getConnectionInfo() {
        return {
            id: this.id,
            type: this.type,
            state: this.state,
            url: this.url,
            interval: this.interval,
            lastMessageId: this.lastMessageId
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

    // Update polling interval
    setPollingInterval(interval: number): void {
        this.interval = interval;

        if (this.pollingInterval) {
            this.close();
            this.startPolling();
        }
    }
}
