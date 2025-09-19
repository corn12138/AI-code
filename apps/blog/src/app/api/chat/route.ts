import { requireAuth } from '@/lib/api-auth';
import { NextRequest } from 'next/server';
import { createChatResponse } from '@/modules/chat/server/createChatResponse';

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request);
        const payload = await request.json();
        return await createChatResponse(user, payload);
    } catch (error) {
        console.error('Chat API Error:', error);

        if (error instanceof Error && error.message.includes('out of capacity')) {
            return new Response(JSON.stringify({
                error: 'AI 服务暂时不可用，请稍后再试',
            }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : '未知错误',
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function OPTIONS(request: NextRequest) {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
