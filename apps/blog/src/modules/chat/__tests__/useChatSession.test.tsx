import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, vi, it } from 'vitest';
import { useChatSession } from '../hooks/useChatSession';
import { useChatStore } from '../state/chatStore';
import type { ChatSessionConfig } from '../types';

const sendMessageMock = vi.fn();
const reconnectMock = vi.fn();
const fetchConversationMock = vi.fn();
const deleteConversationMock = vi.fn();

let listeners: any = {};

vi.mock('../lib/conversationService', () => ({
    fetchConversations: vi.fn(() => Promise.resolve([])),
    fetchConversationById: (...args: unknown[]) => fetchConversationMock(...args),
    deleteConversation: (...args: unknown[]) => deleteConversationMock(...args),
}));

vi.mock('@corn12138/hooks', async () => {
    return {
        useAuth: vi.fn(() => ({ token: 'test-token', isAuthenticated: true })),
        useChatSSE: vi.fn((options: any) => {
            listeners = options;
            return {
                sendMessage: sendMessageMock,
                reconnect: reconnectMock,
                connectionStatus: 'disconnected',
                reconnectAttempts: 0,
            };
        }),
    };
});

const config: ChatSessionConfig = {
    defaultModel: 'gpt-4',
    availableModels: ['gpt-4'],
    chatEndpoint: '/api/chat',
    conversationsEndpoint: '/api/chat/conversations',
    conversationDetailEndpoint: (id: string) => `/api/chat/conversations/${id}`,
    reconnect: {
        enabled: true,
        maxAttempts: 3,
        interval: 1000,
        backoffFactor: 2,
    },
};

function resetStore() {
    useChatStore.setState({
        messages: [],
        conversations: [],
        activeConversationId: null,
        selectedModel: null,
        connectionStatus: 'disconnected',
        error: null,
        isBootstrapped: false,
    });
}

beforeEach(() => {
    resetStore();
    sendMessageMock.mockReset();
    reconnectMock.mockReset();
    fetchConversationMock.mockReset();
    deleteConversationMock.mockReset();
    listeners = {};
});

describe('useChatSession', () => {
    it('streams assistant messages and finalises on completion', async () => {
        sendMessageMock.mockResolvedValue(undefined);

        const { result } = renderHook(() => useChatSession(config));

        await waitFor(() => {
            expect(useChatStore.getState().isBootstrapped).toBe(true);
        });

        await act(async () => {
            await result.current.sendChatMessage('Hello AI');
        });

        expect(useChatStore.getState().messages).toHaveLength(2);

        act(() => {
            listeners.onMessage('chunk', 'content', { conversationId: 'conv-1' });
        });

        let assistant = useChatStore.getState().messages.at(-1);
        expect(assistant?.status).toBe('streaming');
        expect(assistant?.content).toContain('chunk');

        act(() => {
            listeners.onMessage('', 'complete', { conversationId: 'conv-1', messageId: 'assistant-1' });
        });

        assistant = useChatStore.getState().messages.at(-1);
        expect(assistant?.status).toBe('complete');
        expect(useChatStore.getState().activeConversationId).toBe('conv-1');
    });

    it('marks assistant message as error when stream fails', async () => {
        sendMessageMock.mockResolvedValue(undefined);

        const { result } = renderHook(() => useChatSession(config));
        await waitFor(() => {
            expect(useChatStore.getState().isBootstrapped).toBe(true);
        });

        await act(async () => {
            await result.current.sendChatMessage('Hello AI');
        });

        act(() => {
            listeners.onError?.(new Error('Network down'));
        });

        const assistant = useChatStore.getState().messages.at(-1);
        expect(assistant?.status).toBe('error');
        expect(assistant?.error).toContain('Network down');
        expect(result.current.error).toContain('Network down');
    });

    it('selects conversation by fetching messages from API', async () => {
        sendMessageMock.mockResolvedValue(undefined);
        fetchConversationMock.mockResolvedValue({
            summary: {
                id: 'conv-1',
                title: 'Conv',
                model: 'gpt-4',
                messageCount: 2,
                lastMessage: 'last',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            messages: [
                {
                    id: 'msg-1',
                    role: 'user',
                    content: 'Hi',
                    createdAt: new Date().toISOString(),
                    status: 'complete',
                },
            ],
        });

        const { result } = renderHook(() => useChatSession(config));
        await waitFor(() => {
            expect(useChatStore.getState().isBootstrapped).toBe(true);
        });

        await act(async () => {
            await result.current.selectConversation('conv-1');
        });

        expect(fetchConversationMock).toHaveBeenCalled();
        expect(useChatStore.getState().messages).toHaveLength(1);
        expect(useChatStore.getState().activeConversationId).toBe('conv-1');
    });
});
