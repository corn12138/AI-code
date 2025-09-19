export type ChatRole = 'user' | 'assistant' | 'system';

export type ChatConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting';

export type ChatMessageStatus = 'pending' | 'streaming' | 'complete' | 'error';

export interface ChatMessage {
    id: string;
    role: ChatRole;
    content: string;
    createdAt: string;
    status: ChatMessageStatus;
    error?: string;
    metadata?: Record<string, unknown>;
}

export interface ChatConversationSummary {
    id: string;
    title: string;
    model: string;
    messageCount: number;
    lastMessage: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ChatSessionConfig {
    defaultModel: string;
    availableModels: string[];
    chatEndpoint: string;
    conversationsEndpoint: string;
    conversationDetailEndpoint: (id: string) => string;
    reconnect:
        | {
              enabled: boolean;
              maxAttempts: number;
              interval: number;
              backoffFactor: number;
          }
        | undefined;
}

export interface SendMessagePayload {
    message: string;
    conversationId?: string | null;
    model?: string;
}

export interface ChatHydrationState {
    messages: ChatMessage[];
    conversations: ChatConversationSummary[];
    activeConversationId: string | null;
}
