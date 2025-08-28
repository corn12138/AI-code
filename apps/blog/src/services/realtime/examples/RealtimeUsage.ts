'use client';

import { LLMManager } from '../../llm/LLMManager';
import { ToolRegistry } from '../../tools/ToolRegistry';
import {
    ConnectionQualityDetector,
    PriorityMessageQueue,
    REALTIME_PRESETS,
    RealtimeBuilder
} from '../index';

// Example usage of realtime communication system
export class RealtimeExamples {
    private llmManager: LLMManager;
    private toolRegistry: ToolRegistry;

    constructor(llmManager: LLMManager, toolRegistry: ToolRegistry) {
        this.llmManager = llmManager;
        this.toolRegistry = toolRegistry;
    }

    // Example 1: Basic WebSocket connection
    async basicWebSocketExample(): Promise<void> {
        console.log('=== Basic WebSocket Example ===');

        const client = RealtimeBuilder.createWebSocketClient('ws://localhost:3001/realtime', {
            clientId: 'example-client-1',
            autoReconnect: true
        });

        // Set up event handlers
        client.on('connect', (connection) => {
            console.log('Connected:', connection.getConnectionInfo());
        });

        client.on('disconnect', (reason) => {
            console.log('Disconnected:', reason);
        });

        client.on('message', (message) => {
            console.log('Received message:', message);
        });

        client.on('error', (error) => {
            console.error('Client error:', error);
        });

        // Connect and send a message
        await client.connect();

        await client.send('hello', {
            text: 'Hello from WebSocket client!'
        });

        // Subscribe to specific message types
        client.subscribe('chat:message', (message) => {
            console.log('Chat message received:', message.payload);
        });

        // Join a room
        await client.joinRoom('general');
        await client.sendToRoom('general', 'room:message', {
            text: 'Hello everyone in the room!'
        });

        // Cleanup
        setTimeout(() => {
            client.disconnect();
        }, 5000);
    }

    // Example 2: AI Chat Integration
    async aiChatIntegrationExample(): Promise<void> {
        console.log('=== AI Chat Integration Example ===');

        const { client, integration } = REALTIME_PRESETS.AI_CHAT(
            'http://localhost:3001',
            this.llmManager,
            this.toolRegistry
        );

        // Connect to the server
        await client.connect();

        // Start a conversation
        const conversationId = `conv-${Date.now()}`;

        await client.send('conversation:start', {
            conversationId,
            systemPrompt: 'You are a helpful AI assistant.'
        });

        // Send a chat message
        await client.send('chat:message', {
            conversationId,
            content: 'What is the weather like today?',
            model: 'gpt-4',
            stream: true
        });

        // Listen for streaming responses
        client.subscribe('stream:data', (message) => {
            if (message.payload.conversationId === conversationId) {
                console.log('Streaming:', message.payload.content);
            }
        });

        client.subscribe('stream:end', (message) => {
            if (message.payload.conversationId === conversationId) {
                console.log('Final response:', message.payload.finalContent);
                console.log('Metadata:', message.payload.metadata);
            }
        });

        // Execute a tool
        await client.send('tool:execute', {
            conversationId,
            toolName: 'calculator',
            input: { expression: '2 + 2' }
        });

        client.subscribe('tool:result', (message) => {
            console.log('Tool result:', message.payload);
        });

        // End conversation after 10 seconds
        setTimeout(async () => {
            await client.send('conversation:end', { conversationId });
            client.disconnect();
        }, 10000);
    }

    // Example 3: Connection Fallback
    async connectionFallbackExample(): Promise<void> {
        console.log('=== Connection Fallback Example ===');

        const client = RealtimeBuilder.createAdaptiveClient('http://localhost:3001/realtime', {
            clientId: 'fallback-client',
            autoReconnect: true,
            preferredTypes: ['websocket', 'sse', 'polling']
        });

        client.on('connect', (connection) => {
            console.log(`Connected using: ${connection.type}`);
        });

        client.on('disconnect', (reason) => {
            console.log('Disconnected, will try fallback:', reason);
        });

        await client.connect();

        // Send periodic messages to test connection
        const interval = setInterval(async () => {
            try {
                await client.send('ping', { timestamp: Date.now() });
                console.log('Ping sent');
            } catch (error) {
                console.error('Ping failed:', error);
            }
        }, 5000);

        // Stop after 30 seconds
        setTimeout(() => {
            clearInterval(interval);
            client.disconnect();
        }, 30000);
    }

    // Example 4: Connection Quality Monitoring
    async connectionQualityExample(): Promise<void> {
        console.log('=== Connection Quality Monitoring Example ===');

        const client = RealtimeBuilder.createWebSocketClient('ws://localhost:3001/realtime');
        const qualityDetector = new ConnectionQualityDetector();

        // Monitor connection quality
        let pingCount = 0;
        const pingInterval = setInterval(async () => {
            const startTime = Date.now();

            try {
                await client.send('ping', {
                    id: ++pingCount,
                    timestamp: startTime
                });

                qualityDetector.recordPacketSuccess();
            } catch (error) {
                qualityDetector.recordPacketLoss();
                console.error('Ping failed:', error);
            }
        }, 1000);

        // Handle pong responses
        client.subscribe('pong', (message) => {
            const latency = Date.now() - message.payload.timestamp;
            qualityDetector.recordLatency(latency);

            console.log(`Pong received - Latency: ${latency}ms`);
        });

        await client.connect();

        // Report quality every 10 seconds
        const qualityInterval = setInterval(() => {
            const quality = qualityDetector.getConnectionQuality();
            const avgLatency = qualityDetector.getAverageLatency();
            const packetLoss = qualityDetector.getPacketLossRate();
            const suggested = qualityDetector.getSuggestedConnectionType();

            console.log('Connection Quality Report:');
            console.log(`  Quality: ${quality}`);
            console.log(`  Average Latency: ${avgLatency.toFixed(2)}ms`);
            console.log(`  Packet Loss: ${(packetLoss * 100).toFixed(2)}%`);
            console.log(`  Suggested Type: ${suggested}`);
            console.log('---');
        }, 10000);

        // Cleanup after 60 seconds
        setTimeout(() => {
            clearInterval(pingInterval);
            clearInterval(qualityInterval);
            client.disconnect();
        }, 60000);
    }

    // Example 5: Message Priority Queue
    async messagePriorityExample(): Promise<void> {
        console.log('=== Message Priority Example ===');

        const client = RealtimeBuilder.createWebSocketClient('ws://localhost:3001/realtime');
        const priorityQueue = new PriorityMessageQueue();

        await client.connect();

        // Simulate different priority messages
        const messages = [
            { type: 'alert', priority: 'critical', payload: { message: 'Critical system alert!' } },
            { type: 'notification', priority: 'normal', payload: { message: 'Normal notification' } },
            { type: 'update', priority: 'low', payload: { message: 'Background update' } },
            { type: 'urgent', priority: 'high', payload: { message: 'High priority task' } },
            { type: 'info', priority: 'low', payload: { message: 'Informational message' } }
        ];

        // Add messages to priority queue
        messages.forEach(msg => {
            priorityQueue.enqueue({
                id: `msg-${Date.now()}-${Math.random()}`,
                type: msg.type,
                payload: msg.payload,
                timestamp: new Date(),
                priority: msg.priority as any
            });
        });

        console.log('Queue sizes:', priorityQueue.getQueueSizes());

        // Process messages in priority order
        while (priorityQueue.size() > 0) {
            const message = priorityQueue.dequeue();
            if (message) {
                console.log(`Processing ${message.priority} priority message:`, message.type);
                await client.send(message.type, message.payload, { priority: message.priority });

                // Small delay between messages
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        client.disconnect();
    }

    // Example 6: Room-based Communication
    async roomCommunicationExample(): Promise<void> {
        console.log('=== Room Communication Example ===');

        // Create multiple clients
        const clients = [
            RealtimeBuilder.createWebSocketClient('ws://localhost:3001/realtime', { clientId: 'user-1' }),
            RealtimeBuilder.createWebSocketClient('ws://localhost:3001/realtime', { clientId: 'user-2' }),
            RealtimeBuilder.createWebSocketClient('ws://localhost:3001/realtime', { clientId: 'user-3' })
        ];

        // Connect all clients
        await Promise.all(clients.map(client => client.connect()));

        // Set up message handlers
        clients.forEach((client, index) => {
            client.subscribe('room:message', (message) => {
                console.log(`Client ${index + 1} received room message:`, message.payload);
            });

            client.subscribe('user:joined', (message) => {
                console.log(`Client ${index + 1} saw user join:`, message.payload.userId);
            });

            client.subscribe('user:left', (message) => {
                console.log(`Client ${index + 1} saw user leave:`, message.payload.userId);
            });
        });

        // Join room
        const roomId = 'example-room';
        await Promise.all(clients.map(client => client.joinRoom(roomId)));

        // Send room messages
        await clients[0].sendToRoom(roomId, 'room:message', {
            userId: 'user-1',
            message: 'Hello everyone!'
        });

        await clients[1].sendToRoom(roomId, 'room:message', {
            userId: 'user-2',
            message: 'Hi there!'
        });

        // Leave room after 5 seconds
        setTimeout(async () => {
            await clients[2].leaveRoom(roomId);

            // Disconnect all after another 5 seconds
            setTimeout(() => {
                clients.forEach(client => client.disconnect());
            }, 5000);
        }, 5000);
    }

    // Example 7: Error Handling and Resilience
    async errorHandlingExample(): Promise<void> {
        console.log('=== Error Handling Example ===');

        const client = RealtimeBuilder.createAdaptiveClient('ws://localhost:3001/realtime', {
            autoReconnect: true,
            maxReconnectAttempts: 5
        });

        // Track connection attempts
        let connectAttempts = 0;
        let reconnectAttempts = 0;

        client.on('connect', () => {
            connectAttempts++;
            console.log(`Connected (attempt ${connectAttempts})`);
        });

        client.on('disconnect', (reason) => {
            console.log(`Disconnected: ${reason}`);
        });

        client.on('error', (error) => {
            console.error(`Client error: ${error.message}`);
        });

        // Custom reconnection logic
        client.on('disconnect', () => {
            reconnectAttempts++;
            console.log(`Reconnection attempt ${reconnectAttempts}`);

            if (reconnectAttempts >= 3) {
                console.log('Max reconnection attempts reached, switching to polling');
                // Could switch to polling fallback here
            }
        });

        try {
            await client.connect();

            // Simulate connection issues
            setTimeout(() => {
                console.log('Simulating network issue...');
                // Force disconnect to test reconnection
                client.disconnect();
            }, 3000);

        } catch (error) {
            console.error('Failed to connect:', error);
        }

        // Cleanup after 30 seconds
        setTimeout(() => {
            client.disconnect();
        }, 30000);
    }

    // Run all examples
    async runAllExamples(): Promise<void> {
        console.log('=== Running Realtime Communication Examples ===\n');

        try {
            await this.basicWebSocketExample();
            await new Promise(resolve => setTimeout(resolve, 2000));

            await this.aiChatIntegrationExample();
            await new Promise(resolve => setTimeout(resolve, 2000));

            await this.connectionFallbackExample();
            await new Promise(resolve => setTimeout(resolve, 2000));

            await this.connectionQualityExample();
            await new Promise(resolve => setTimeout(resolve, 2000));

            await this.messagePriorityExample();
            await new Promise(resolve => setTimeout(resolve, 2000));

            await this.roomCommunicationExample();
            await new Promise(resolve => setTimeout(resolve, 2000));

            await this.errorHandlingExample();

            console.log('\n=== All realtime examples completed! ===');
        } catch (error) {
            console.error('Example execution failed:', error);
        }
    }
}
