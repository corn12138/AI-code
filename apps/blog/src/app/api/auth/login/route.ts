import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // 获取服务器 URL，更新默认端口为 3001
        const serverUrl = process.env.SERVER_URL || 'http://localhost:3001';

        console.log('尝试连接到服务器:', serverUrl);
        console.log('登录请求数据:', body);

        // 转发请求到服务器应用
        const response = await fetch(`${serverUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        console.log('服务器响应状态:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.log('服务器错误响应:', errorData);
            return NextResponse.json(
                { message: errorData.message || '登录失败' },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('服务器响应数据:', data);

        // 创建响应并转发cookies
        const nextResponse = NextResponse.json(data);

        // 转发服务器设置的cookies
        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader) {
            nextResponse.headers.set('set-cookie', setCookieHeader);
        }

        return nextResponse;
    } catch (error) {
        console.error('Login API error:', error);

        // 检查是否是连接错误
        if (error instanceof Error && error.message.includes('fetch failed')) {
            return NextResponse.json(
                { message: '无法连接到认证服务器，请确保服务器正在 http://localhost:3001 运行' },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { message: '服务器内部错误' },
            { status: 500 }
        );
    }
}
