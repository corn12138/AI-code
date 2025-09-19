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
    config: ChatSessionConfig,
    token: string
): Promise<ChatConversationSummary[]> {
    const response = await fetch(config.conversationsEndpoint, {
        method: 'GET',
        headers: buildAuthHeader(token),
    });

    if (!response.ok) {
        throw new Error(`无法获取对话列表 (HTTP ${response.status})`);
    }

    const data = (await response.json()) as ConversationResponse;
    return data.conversations ?? [];
}

export async function fetchConversationById(
    config: ChatSessionConfig,
    token: string,
    conversationId: string
): Promise<{ messages: ChatMessage[]; summary: ChatConversationSummary } | null> {
    const response = await fetch(config.conversationDetailEndpoint(conversationId), {
        method: 'GET',
        headers: buildAuthHeader(token),
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
    token: string,
    conversationId: string
): Promise<void> {
    const response = await fetch(config.conversationDetailEndpoint(conversationId), {
        method: 'DELETE',
        headers: buildAuthHeader(token),
    });

    if (response.status === 404) {
        return;
    }

    if (!response.ok) {
        throw new Error(`无法删除对话 (HTTP ${response.status})`);
    }
}

function buildAuthHeader(token: string) {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}
