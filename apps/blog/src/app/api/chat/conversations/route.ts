import { requireAuth } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

// 获取对话列表
export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth(request);

        const conversations = await db.conversation.findMany({
            where: { userId: user.id },
            include: {
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' }
                },
                _count: {
                    select: { messages: true }
                }
            },
            orderBy: { updatedAt: 'desc' },
            take: 50
        });

        // 格式化对话数据
        const formattedConversations = conversations.map(conv => ({
            id: conv.id,
            title: conv.title,
            model: conv.model,
            messageCount: conv._count.messages,
            lastMessage: conv.messages[0]?.content || null,
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt
        }));

        return Response.json({ conversations: formattedConversations });
    } catch (error) {
        console.error('Get conversations error:', error);
        return new Response('Unauthorized', { status: 401 });
    }
}

// 创建新对话
export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request);
        const { title, model = 'qwen/qwen2.5-7b-instruct/bf-16' } = await request.json();

        const conversation = await db.conversation.create({
            data: {
                title: title || 'New Conversation',
                userId: user.id,
                model
            }
        });

        return Response.json({ conversation });
    } catch (error) {
        console.error('Create conversation error:', error);
        return new Response('Unauthorized', { status: 401 });
    }
} 