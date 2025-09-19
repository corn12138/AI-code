'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth, useChatSSE } from '@corn12138/hooks';
import { useChatStore } from '../state/chatStore';
import {
    deleteConversation as deleteConversationRequest,
    fetchConversationById,
    fetchConversations
} from '../lib/conversationService';
import type { ChatSessionConfig } from '../types';
import { type ChatConnectionStatus } from '../types';

function createId(prefix: string) {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Math.random().toString(36).slice(2, 11)}`;
}

export function useChatSession(config: ChatSessionConfig) {
    const { token, isAuthenticated } = useAuth();
    const [isLoadingConversations, setIsLoadingConversations] = useState(false);
    const [isFetchingConversation, setIsFetchingConversation] = useState(false);

    const streamingAssistantIdRef = useRef<string | null>(null);
    const pendingSendRef = useRef<string | null>(null);

    const {
        messages,
        conversations,
        activeConversationId,
        selectedModel,
        connectionStatus,
        error,
        isBootstrapped,
        bootstrap,
        setConversations,
        upsertConversation,
        removeConversation,
        setActiveConversation,
        setMessages,
        pushUserMessage,
        startAssistantMessage,
        appendAssistantChunk,
        finalizeAssistantMessage,
        markAssistantError,
        setConnectionStatus,
        setSelectedModel,
        setError,
        resetMessages,
    } = useChatStore((state) => ({
        messages: state.messages,
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
        selectedModel: state.selectedModel,
        connectionStatus: state.connectionStatus,
        error: state.error,
        isBootstrapped: state.isBootstrapped,
        bootstrap: state.bootstrap,
        setConversations: state.setConversations,
        upsertConversation: state.upsertConversation,
        removeConversation: state.removeConversation,
        setActiveConversation: state.setActiveConversation,
        setMessages: state.setMessages,
        pushUserMessage: state.pushUserMessage,
        startAssistantMessage: state.startAssistantMessage,
        appendAssistantChunk: state.appendAssistantChunk,
        finalizeAssistantMessage: state.finalizeAssistantMessage,
        markAssistantError: state.markAssistantError,
        setConnectionStatus: state.setConnectionStatus,
        setSelectedModel: state.setSelectedModel,
        setError: state.setError,
        resetMessages: state.resetMessages,
    }));

    // 确保初始模型同步
    useEffect(() => {
        if (!isBootstrapped) {
            bootstrap({ messages: [], conversations: [], activeConversationId: null }, config.defaultModel);
        } else if (!selectedModel) {
            setSelectedModel(config.defaultModel);
        }
    }, [isBootstrapped, bootstrap, config.defaultModel, selectedModel, setSelectedModel]);

    const availableModels = useMemo(() => {
        const unique = Array.from(new Set([config.defaultModel, ...config.availableModels]));
        return unique;
    }, [config.availableModels, config.defaultModel]);

    const refreshConversations = useCallback(async () => {
        if (!token) return;
        setIsLoadingConversations(true);
        try {
            const items = await fetchConversations(config, token);
            setConversations(items);
        } catch (refreshError) {
            console.error('刷新对话列表失败:', refreshError);
        } finally {
            setIsLoadingConversations(false);
        }
    }, [config, setConversations, token]);

    // 初次加载对话列表
    useEffect(() => {
        if (!token || !isAuthenticated) {
            setConversations([]);
            return;
        }
        void refreshConversations();
    }, [isAuthenticated, refreshConversations, setConversations, token]);

    const handleStreamMessage = useCallback(
        (content: string, type: string, data?: any) => {
            if (type === 'content') {
                if (!streamingAssistantIdRef.current) {
                    const assistantId = data?.messageId ?? createId('assistant');
                    streamingAssistantIdRef.current = assistantId;
                    startAssistantMessage(assistantId);
                }
                appendAssistantChunk(content);
                return;
            }

            if (type === 'complete' || type === 'finish') {
                finalizeAssistantMessage();
                const conversationId = data?.conversationId ?? activeConversationId ?? null;
                streamingAssistantIdRef.current = null;
                pendingSendRef.current = null;

                if (conversationId) {
                    setActiveConversation(conversationId);
                    void refreshConversations();
                }
                return;
            }

            if (type === 'error') {
                const message = data?.error || '生成回复时出现错误，请稍后再试';
                markAssistantError(message);
                streamingAssistantIdRef.current = null;
                pendingSendRef.current = null;
            }
        },
        [appendAssistantChunk, finalizeAssistantMessage, markAssistantError, refreshConversations, setActiveConversation, startAssistantMessage, activeConversationId]
    );

    const handleStreamError = useCallback(
        (streamError: Error) => {
            markAssistantError(streamError.message || '连接 AI 服务失败');
            streamingAssistantIdRef.current = null;
            pendingSendRef.current = null;
        },
        [markAssistantError]
    );

    const {
        sendMessage: sendStreamMessage,
        reconnect,
        connectionStatus: rawConnectionStatus,
        reconnectAttempts,
    } = useChatSSE({
        chatEndpoint: config.chatEndpoint,
        defaultModel: selectedModel ?? config.defaultModel,
        getAuthToken: () => token ?? null,
        authType: 'bearer',
        reconnect: config.reconnect ?? {
            enabled: true,
            maxAttempts: 3,
            interval: 1000,
            backoffFactor: 2,
        },
        onMessage: handleStreamMessage,
        onError: handleStreamError,
        onConnectionChange: setConnectionStatus,
        onReconnectAttempt: (attempt) => {
            console.info(`Chat SSE reconnect attempt: ${attempt}`);
        },
        debug: process.env.NODE_ENV !== 'production',
    });

    // 同步连接状态
    useEffect(() => {
        if (rawConnectionStatus) {
            setConnectionStatus(rawConnectionStatus as ChatConnectionStatus);
        }
    }, [rawConnectionStatus, setConnectionStatus]);

    const sendChatMessage = useCallback(
        async (content: string) => {
            const trimmed = content.trim();
            if (!trimmed) return;

            if (!token) {
                setError('请先登录后再使用 AI 对话功能');
                return;
            }

            const nowIso = new Date().toISOString();
            const userMessageId = createId('user');

            pushUserMessage({
                id: userMessageId,
                role: 'user',
                content: trimmed,
                createdAt: nowIso,
                status: 'complete',
            });

            streamingAssistantIdRef.current = createId('assistant');
            startAssistantMessage(streamingAssistantIdRef.current);
            pendingSendRef.current = trimmed;
            setError(null);

            try {
                await sendStreamMessage(trimmed, activeConversationId, selectedModel ?? config.defaultModel);
            } catch (sendError) {
                const message = sendError instanceof Error ? sendError.message : '发送消息失败';
                markAssistantError(message);
                streamingAssistantIdRef.current = null;
                pendingSendRef.current = null;
            }
        },
        [activeConversationId, config.defaultModel, markAssistantError, pushUserMessage, selectedModel, sendStreamMessage, setError, startAssistantMessage, token]
    );

    const retryLastMessage = useCallback(() => {
        if (!pendingSendRef.current) return;
        const cached = pendingSendRef.current;
        pendingSendRef.current = null;
        void sendChatMessage(cached);
    }, [sendChatMessage]);

    const selectConversation = useCallback(
        async (conversationId: string) => {
            if (!token) {
                setError('请先登录后再查看历史对话');
                return;
            }

            setIsFetchingConversation(true);
            setError(null);
            setActiveConversation(conversationId);

            try {
                const result = await fetchConversationById(config, token, conversationId);
                if (!result) {
                    removeConversation(conversationId);
                    resetMessages();
                    return;
                }

                setMessages(result.messages);
                upsertConversation(result.summary);
                setSelectedModel(result.summary.model || config.defaultModel);
            } catch (conversationError) {
                console.error(conversationError);
                setError('获取对话详情失败，请稍后再试');
            } finally {
                setIsFetchingConversation(false);
            }
        },
        [config, removeConversation, resetMessages, setActiveConversation, setError, setMessages, setSelectedModel, token, upsertConversation]
    );

    const deleteConversation = useCallback(
        async (conversationId: string) => {
            if (!token) {
                setError('请先登录后再删除对话');
                return;
            }

            try {
                await deleteConversationRequest(config, token, conversationId);
                removeConversation(conversationId);
                if (activeConversationId === conversationId) {
                    resetMessages();
                }
            } catch (deleteError) {
                console.error(deleteError);
                setError('删除对话失败，请稍后再试');
            }
        },
        [activeConversationId, config, removeConversation, resetMessages, setError, token]
    );

    const createDraftConversation = useCallback(() => {
        streamingAssistantIdRef.current = null;
        pendingSendRef.current = null;
        resetMessages();
        setActiveConversation(null);
        setError(null);
    }, [resetMessages, setActiveConversation, setError]);

    const clearError = useCallback(() => setError(null), [setError]);

    return {
        messages,
        conversations,
        availableModels,
        activeConversationId,
        selectedModel: selectedModel ?? config.defaultModel,
        connectionStatus,
        isConnected: connectionStatus === 'connected',
        reconnectAttempts,
        error,
        isLoadingConversations,
        isFetchingConversation,
        isAuthenticated,
        sendChatMessage,
        retryLastMessage,
        selectConversation,
        deleteConversation,
        createDraftConversation,
        setSelectedModel,
        refreshConversations,
        reconnect,
        clearError,
    };
}
