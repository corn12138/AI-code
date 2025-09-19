import { create } from 'zustand';
import type {
    ChatConnectionStatus,
    ChatConversationSummary,
    ChatHydrationState,
    ChatMessage
} from '../types';

interface ChatStoreState {
    messages: ChatMessage[];
    conversations: ChatConversationSummary[];
    activeConversationId: string | null;
    selectedModel: string | null;
    connectionStatus: ChatConnectionStatus;
    error: string | null;
    isBootstrapped: boolean;
    bootstrap: (data: Partial<ChatHydrationState>, model: string | null) => void;
    setConversations: (conversations: ChatConversationSummary[]) => void;
    upsertConversation: (conversation: ChatConversationSummary) => void;
    removeConversation: (conversationId: string) => void;
    setActiveConversation: (conversationId: string | null) => void;
    setMessages: (messages: ChatMessage[]) => void;
    pushUserMessage: (message: ChatMessage) => void;
    startAssistantMessage: (messageId: string) => void;
    appendAssistantChunk: (content: string) => void;
    finalizeAssistantMessage: () => void;
    markAssistantError: (error: string) => void;
    setConnectionStatus: (status: ChatConnectionStatus) => void;
    setSelectedModel: (model: string) => void;
    setError: (error: string | null) => void;
    resetMessages: () => void;
}

export const useChatStore = create<ChatStoreState>((set, get) => ({
    messages: [],
    conversations: [],
    activeConversationId: null,
    selectedModel: null,
    connectionStatus: 'disconnected',
    error: null,
    isBootstrapped: false,

    bootstrap: (data, model) =>
        set(() => ({
            messages: data.messages ?? [],
            conversations: data.conversations ?? [],
            activeConversationId: data.activeConversationId ?? null,
            selectedModel: model,
            isBootstrapped: true,
        })),

    setConversations: (conversations) =>
        set({ conversations }),

    upsertConversation: (conversation) =>
        set((state) => {
            const exists = state.conversations.some((item) => item.id === conversation.id);
            if (exists) {
                return {
                    conversations: state.conversations.map((item) =>
                        item.id === conversation.id ? conversation : item
                    ),
                };
            }
            return {
                conversations: [conversation, ...state.conversations],
            };
        }),

    removeConversation: (conversationId) =>
        set((state) => ({
            conversations: state.conversations.filter((item) => item.id !== conversationId),
            messages:
                state.activeConversationId === conversationId
                    ? []
                    : state.messages,
            activeConversationId:
                state.activeConversationId === conversationId ? null : state.activeConversationId,
        })),

    setActiveConversation: (conversationId) =>
        set({ activeConversationId: conversationId }),

    setMessages: (messages) => set({ messages }),

    pushUserMessage: (message) =>
        set((state) => ({
            messages: [...state.messages, message],
        })),

    startAssistantMessage: (messageId) =>
        set((state) => {
            const assistantMessage: ChatMessage = {
                id: messageId,
                role: 'assistant',
                content: '',
                createdAt: new Date().toISOString(),
                status: 'streaming',
            };
            return {
                messages: [...state.messages, assistantMessage],
            };
        }),

    appendAssistantChunk: (content) =>
        set((state) => {
            const messages = state.messages.slice();
            const lastIndex = [...messages]
                .reverse()
                .findIndex((message) => message.role === 'assistant');

            if (lastIndex === -1) {
                const assistantMessage: ChatMessage = {
                    id: `assistant-${Date.now()}`,
                    role: 'assistant',
                    content,
                    createdAt: new Date().toISOString(),
                    status: 'streaming',
                };
                return {
                    messages: [...messages, assistantMessage],
                };
            }

            const index = messages.length - 1 - lastIndex;
            const target = messages[index];

            if (!target) {
                return { messages };
            }

            messages[index] = {
                ...target,
                content: `${target.content}${content}`,
                status: 'streaming',
            };

            return { messages };
        }),

    finalizeAssistantMessage: () =>
        set((state) => ({
            messages: state.messages.map((message) =>
                message.role === 'assistant' && message.status === 'streaming'
                    ? { ...message, status: 'complete' }
                    : message
            ),
        })),

    markAssistantError: (error) =>
        set((state) => ({
            messages: state.messages.map((message) =>
                message.role === 'assistant' && message.status === 'streaming'
                    ? { ...message, status: 'error', error }
                    : message
            ),
            error,
        })),

    setConnectionStatus: (status) => set({ connectionStatus: status }),

    setSelectedModel: (model) => set({ selectedModel: model }),

    setError: (error) => set({ error }),

    resetMessages: () => set({ messages: [] }),
}));
