import { ensureCsrfToken, getCsrfHeaderName } from '@/utils/csrf';
import type { ChatConversationSummary, ChatMessage, ChatSessionConfig } from '../types';

interface ConversationResponse {
    conversations: ChatConversationSummary[];
}

interface ConversationDetailResponse {
    conversation: {
        id: string;
        title: string;
        model: string;
        messages: Array<{
            id: string;
            role: 'user' | 'assistant';
            content: string;
            createdAt: string;
        }>;
        createdAt: string;
        updatedAt: string;
    };
}

export async function fetchConversations(
    config: ChatSessionConfig
): Promise<ChatConversationSummary[]> {
    const response = await fetch(config.conversationsEndpoint, {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error(`无法获取对话列表 (HTTP ${response.status})`);
    }

    const data = (await response.json()) as ConversationResponse;
    return data.conversations ?? [];
}

export async function fetchConversationById(
    config: ChatSessionConfig,
    conversationId: string
): Promise<{ messages: ChatMessage[]; summary: ChatConversationSummary } | null> {
    const response = await fetch(config.conversationDetailEndpoint(conversationId), {
        method: 'GET',
        credentials: 'include',
    });

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`无法获取对话详情 (HTTP ${response.status})`);
    }

    const data = (await response.json()) as ConversationDetailResponse;
    const { conversation } = data;

    return {
        summary: {
            id: conversation.id,
            title: conversation.title,
            model: conversation.model,
            messageCount: conversation.messages.length,
            lastMessage: conversation.messages.at(-1)?.content ?? null,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
        },
        messages: conversation.messages.map<ChatMessage>((message) => ({
            id: message.id,
            role: message.role,
            content: message.content,
            createdAt: message.createdAt,
            status: 'complete',
        })),
    };
}

export async function deleteConversation(
    config: ChatSessionConfig,
    conversationId: string
): Promise<void> {
    const csrfToken = await ensureCsrfToken();
    const headers: Record<string, string> = {};
    if (csrfToken) {
        headers[getCsrfHeaderName()] = csrfToken;
    }

    const response = await fetch(config.conversationDetailEndpoint(conversationId), {
        method: 'DELETE',
        credentials: 'include',
        headers,
    });

    if (response.status === 404) {
        return;
    }

    if (!response.ok) {
        throw new Error(`无法删除对话 (HTTP ${response.status})`);
    }
}
