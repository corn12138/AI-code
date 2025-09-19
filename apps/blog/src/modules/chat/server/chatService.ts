import { prisma } from '@/lib/prisma';
import type { ChatCompletionMessageParam } from 'openai/resources';
import { calculateCost, estimateTokens, getModelProvider } from './metrics';
import type { AuthUser } from '@/lib/auth';

interface ConversationWithMessages {
    id: string;
    title: string;
    userId: string;
    model: string;
    messages: Array<{
        id: string;
        role: 'user' | 'assistant';
        content: string;
        createdAt: Date;
    }>;
}

interface ChatRequestOptions {
    user: AuthUser;
    message: string;
    conversationId?: string;
    model: string;
}

export async function prepareConversation({ user, message, conversationId, model }: ChatRequestOptions) {
    let conversation: ConversationWithMessages | null = null;

    if (conversationId) {
        conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userId: user.id,
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    take: 20,
                },
            },
        });
    }

    if (!conversation) {
        const created = await prisma.conversation.create({
            data: {
                id: conversationId || generateId(),
                userId: user.id,
                title: createConversationTitle(message),
                model,
            },
        });

        conversation = await prisma.conversation.findUniqueOrThrow({
            where: { id: created.id },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    take: 20,
                },
            },
        });
    }

    const chatHistory = buildChatHistory(conversation.messages, message);

    const userMessage = await prisma.message.create({
        data: {
            conversationId: conversation.id,
            role: 'user',
            content: message,
            userId: user.id,
            model,
        },
    });

    return {
        conversation,
        chatHistory,
        userMessage,
    };
}

export async function persistAssistantMessage(
    conversationId: string,
    userId: string,
    model: string,
    content: string,
    responseTime: number,
) {
    const savedMessage = await prisma.message.create({
        data: {
            conversationId,
            role: 'assistant',
            userId,
            model,
            content,
            responseTime,
            totalTokens: estimateTokens(content),
            outputTokens: estimateTokens(content),
        },
    });

    return savedMessage;
}

export async function updateMessageTokenUsage(messageId: string, content: string) {
    await prisma.message.update({
        where: { id: messageId },
        data: {
            totalTokens: estimateTokens(content),
            inputTokens: estimateTokens(content),
        },
    });
}

export async function updateConversationStats(
    conversationId: string,
    model: string,
    inputTokens: number,
    outputTokens: number,
    responseTime: number,
) {
    const totalTokens = inputTokens + outputTokens;
    const estimatedCost = calculateCost(model, inputTokens, outputTokens);

    await prisma.conversation.update({
        where: { id: conversationId },
        data: {
            updatedAt: new Date(),
            lastMessageAt: new Date(),
            messageCount: { increment: 2 },
            totalTokens: { increment: totalTokens },
            inputTokens: { increment: inputTokens },
            outputTokens: { increment: outputTokens },
            totalCost: { increment: estimatedCost },
            modelProvider: getModelProvider(model),
            modelVersion: model,
        },
    });

    return {
        totalTokens,
        estimatedCost,
    };
}

export function buildChatHistory(
    historicalMessages: ConversationWithMessages['messages'],
    currentMessage: string,
): ChatCompletionMessageParam[] {
    const recentMessages = historicalMessages.slice(-10).map((entry) => ({
        role: entry.role,
        content: entry.content,
    })) as ChatCompletionMessageParam[];

    return [
        {
            role: 'system',
            content:
                '你是一个专业的AI写作助手，能够帮助用户优化文本、检查语法、提供写作建议和创作灵感。请用中文回答，回复要简洁明了。',
        },
        ...recentMessages,
        { role: 'user', content: currentMessage } as ChatCompletionMessageParam,
    ];
}

export function createConversationTitle(message: string) {
    const trimmed = message.trim();
    if (!trimmed) return '新对话';
    return trimmed.length > 50 ? `${trimmed.slice(0, 50)}...` : trimmed;
}

export function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
