'use client';

import { LLMManager } from '../../llm/LLMManager';
import { ToolRegistry } from '../../tools/ToolRegistry';
import { RealtimeClient } from '../client/RealtimeClient';
import { RealtimeMessage } from '../core/RealtimeManager';

// AI Assistant integration with realtime communication
export class AIAssistantRealtimeIntegration {
    private realtimeClient: RealtimeClient;
    private llmManager: LLMManager;
    private toolRegistry: ToolRegistry;
    private activeConversations: Map<string, ConversationContext> = new Map();

    constructor(
        realtimeClient: RealtimeClient,
        llmManager: LLMManager,
        toolRegistry: ToolRegistry
    ) {
        this.realtimeClient = realtimeClient;
        this.llmManager = llmManager;
        this.toolRegistry = toolRegistry;

        this.setupMessageHandlers();
    }

    private setupMessageHandlers(): void {
        // Handle chat messages
        this.realtimeClient.subscribe('chat:message', (message) => {
            this.handleChatMessage(message);
        });

        // Handle tool execution requests
        this.realtimeClient.subscribe('tool:execute', (message) => {
            this.handleToolExecution(message);
        });

        // Handle conversation state changes
        this.realtimeClient.subscribe('conversation:start', (message) => {
            this.handleConversationStart(message);
        });

        this.realtimeClient.subscribe('conversation:end', (message) => {
            this.handleConversationEnd(message);
        });

        // Handle streaming responses
        this.realtimeClient.subscribe('stream:start', (message) => {
            this.handleStreamStart(message);
        });

        this.realtimeClient.subscribe('stream:data', (message) => {
            this.handleStreamData(message);
        });

        this.realtimeClient.subscribe('stream:end', (message) => {
            this.handleStreamEnd(message);
        });
    }

    // Handle incoming chat message
    private async handleChatMessage(message: RealtimeMessage): Promise<void> {
        const { conversationId, content, model, stream = true } = message.payload;

        try {
            // Get or create conversation context
            let context = this.activeConversations.get(conversationId);
            if (!context) {
                context = new ConversationContext(conversationId);
                this.activeConversations.set(conversationId, context);
            }

            // Add user message to context
            context.addMessage('user', content);

            // Generate AI response
            if (stream) {
                await this.generateStreamingResponse(conversationId, context, model);
            } else {
                await this.generateResponse(conversationId, context, model);
            }

        } catch (error) {
            await this.sendError(message.clientId!, conversationId, error as Error);
        }
    }

    // Generate streaming response
    private async generateStreamingResponse(
        conversationId: string,
        context: ConversationContext,
        model?: string
    ): Promise<void> {
        // Send stream start event
        await this.realtimeClient.send('stream:start', {
            conversationId,
            messageId: this.generateMessageId()
        });

        try {
            const messages = context.getMessages().map(msg => ({
                role: msg.role as 'user' | 'assistant' | 'system',
                content: msg.content
            }));

            const response = await this.llmManager.complete({
                messages,
                model: model || 'gpt-4',
                stream: true,
                temperature: 0.7,
                maxTokens: 2048
            });

            // Stream the response
            if (response.stream) {
                for await (const chunk of response.stream) {
                    await this.realtimeClient.send('stream:data', {
                        conversationId,
                        content: chunk.content,
                        delta: chunk.delta
                    });
                }
            }

            // Add response to context
            context.addMessage('assistant', response.content);

            // Send stream end event
            await this.realtimeClient.send('stream:end', {
                conversationId,
                finalContent: response.content,
                metadata: {
                    model: response.model,
                    tokens: response.usage?.totalTokens,
                    cost: response.cost
                }
            });

        } catch (error) {
            await this.realtimeClient.send('stream:error', {
                conversationId,
                error: (error as Error).message
            });
        }
    }

    // Generate non-streaming response
    private async generateResponse(
        conversationId: string,
        context: ConversationContext,
        model?: string
    ): Promise<void> {
        try {
            const messages = context.getMessages().map(msg => ({
                role: msg.role as 'user' | 'assistant' | 'system',
                content: msg.content
            }));

            const response = await this.llmManager.complete({
                messages,
                model: model || 'gpt-4',
                stream: false,
                temperature: 0.7,
                maxTokens: 2048
            });

            // Add response to context
            context.addMessage('assistant', response.content);

            // Send response
            await this.realtimeClient.send('chat:response', {
                conversationId,
                content: response.content,
                metadata: {
                    model: response.model,
                    tokens: response.usage?.totalTokens,
                    cost: response.cost
                }
            });

        } catch (error) {
            await this.realtimeClient.send('chat:error', {
                conversationId,
                error: (error as Error).message
            });
        }
    }

    // Handle tool execution
    private async handleToolExecution(message: RealtimeMessage): Promise<void> {
        const { toolName, input, conversationId } = message.payload;

        try {
            const result = await this.toolRegistry.executeTool(toolName, input);

            await this.realtimeClient.send('tool:result', {
                conversationId,
                toolName,
                result,
                success: true
            }, { targetClientId: message.clientId });

        } catch (error) {
            await this.realtimeClient.send('tool:result', {
                conversationId,
                toolName,
                error: (error as Error).message,
                success: false
            }, { targetClientId: message.clientId });
        }
    }

    // Handle conversation start
    private async handleConversationStart(message: RealtimeMessage): Promise<void> {
        const { conversationId, systemPrompt } = message.payload;

        const context = new ConversationContext(conversationId);
        if (systemPrompt) {
            context.addMessage('system', systemPrompt);
        }

        this.activeConversations.set(conversationId, context);

        await this.realtimeClient.send('conversation:started', {
            conversationId,
            timestamp: new Date()
        }, { targetClientId: message.clientId });
    }

    // Handle conversation end
    private async handleConversationEnd(message: RealtimeMessage): Promise<void> {
        const { conversationId } = message.payload;

        this.activeConversations.delete(conversationId);

        await this.realtimeClient.send('conversation:ended', {
            conversationId,
            timestamp: new Date()
        }, { targetClientId: message.clientId });
    }

    // Handle stream start
    private handleStreamStart(message: RealtimeMessage): void {
        // Client-side handling of stream start
        console.log('Stream started:', message.payload);
    }

    // Handle stream data
    private handleStreamData(message: RealtimeMessage): void {
        // Client-side handling of streaming data
        console.log('Stream data:', message.payload);
    }

    // Handle stream end
    private handleStreamEnd(message: RealtimeMessage): void {
        // Client-side handling of stream end
        console.log('Stream ended:', message.payload);
    }

    // Send error message
    private async sendError(clientId: string, conversationId: string, error: Error): Promise<void> {
        await this.realtimeClient.send('error', {
            conversationId,
            message: error.message,
            stack: error.stack
        }, { targetClientId: clientId });
    }

    // Generate unique message ID
    private generateMessageId(): string {
        return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Get active conversations
    getActiveConversations(): string[] {
        return Array.from(this.activeConversations.keys());
    }

    // Get conversation context
    getConversationContext(conversationId: string): ConversationContext | undefined {
        return this.activeConversations.get(conversationId);
    }

    // Clear conversation
    clearConversation(conversationId: string): void {
        this.activeConversations.delete(conversationId);
    }

    // Shutdown integration
    shutdown(): void {
        this.activeConversations.clear();
        this.realtimeClient.disconnect();
    }
}

// Conversation context for managing chat state
export class ConversationContext {
    public readonly id: string;
    private messages: Array<{ role: string; content: string; timestamp: Date }> = [];
    private metadata: Record<string, any> = {};

    constructor(id: string) {
        this.id = id;
    }

    addMessage(role: string, content: string): void {
        this.messages.push({
            role,
            content,
            timestamp: new Date()
        });
    }

    getMessages(): Array<{ role: string; content: string; timestamp: Date }> {
        return [...this.messages];
    }

    getLastMessage(): { role: string; content: string; timestamp: Date } | undefined {
        return this.messages[this.messages.length - 1];
    }

    getMessageCount(): number {
        return this.messages.length;
    }

    setMetadata(key: string, value: any): void {
        this.metadata[key] = value;
    }

    getMetadata(key: string): any {
        return this.metadata[key];
    }

    getAllMetadata(): Record<string, any> {
        return { ...this.metadata };
    }

    clear(): void {
        this.messages = [];
        this.metadata = {};
    }

    // Export conversation data
    export(): {
        id: string;
        messages: Array<{ role: string; content: string; timestamp: Date }>;
        metadata: Record<string, any>;
    } {
        return {
            id: this.id,
            messages: this.getMessages(),
            metadata: this.getAllMetadata()
        };
    }

    // Import conversation data
    import(data: {
        messages: Array<{ role: string; content: string; timestamp: Date }>;
        metadata?: Record<string, any>;
    }): void {
        this.messages = data.messages;
        this.metadata = data.metadata || {};
    }
}
