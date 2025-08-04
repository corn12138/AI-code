import { requireAuth } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

// 获取对话详情和消息历史
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireAuth(request);
        const { id } = await params;

        const conversation = await db.conversation.findFirst({
            where: {
                id,
                userId: user.id
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!conversation) {
            return new Response('Conversation not found', { status: 404 });
        }

        return Response.json({ conversation });
    } catch (error) {
        console.error('Get conversation error:', error);
        return new Response('Unauthorized', { status: 401 });
    }
}

// 删除对话
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireAuth(request);
        const { id } = await params;

        // 检查对话是否存在且属于当前用户
        const conversation = await db.conversation.findFirst({
            where: {
                id,
                userId: user.id
            }
        });

        if (!conversation) {
            return new Response('Conversation not found', { status: 404 });
        }

        // 删除对话（会级联删除相关消息）
        await db.conversation.delete({
            where: { id }
        });

        return Response.json({ success: true });
    } catch (error) {
        console.error('Delete conversation error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

// 更新对话标题
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireAuth(request);
        const { id } = await params;
        const { title } = await request.json();

        if (!title) {
            return new Response('Title is required', { status: 400 });
        }

        // 检查对话是否存在且属于当前用户
        const conversation = await db.conversation.findFirst({
            where: {
                id,
                userId: user.id
            }
        });

        if (!conversation) {
            return new Response('Conversation not found', { status: 404 });
        }

        // 更新对话标题
        const updatedConversation = await db.conversation.update({
            where: { id },
            data: {
                title,
                updatedAt: new Date()
            }
        });

        return Response.json({ conversation: updatedConversation });
    } catch (error) {
        console.error('Update conversation error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
} 