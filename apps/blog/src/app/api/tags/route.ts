import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const serverUrl = process.env.SERVER_URL || 'http://localhost:3001';

        const response = await fetch(`${serverUrl}/api/tags`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { message: errorData.message || '获取标签失败' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Tags API error:', error);

        if (error instanceof Error && error.message.includes('fetch failed')) {
            return NextResponse.json(
                { message: '无法连接到服务器' },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { message: '服务器内部错误' },
            { status: 500 }
        );
    }
}
