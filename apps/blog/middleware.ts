import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware, JWTUtils } from './src/lib/auth';
import {
    getAccessTokenCookieName,
    validateCsrfToken
} from './src/lib/security';

// 需要认证的路径
const protectedPaths = [
    '/api/auth/refresh',
    '/api/user',
    '/api/articles',
    '/api/comments',
    '/api/uploads',
    '/api/auth/session',
    '/api/auth/logout'
];

// 需要管理员权限的路径
const adminPaths = [
    '/api/admin'
];

// 公开的认证路径
const publicAuthPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/csrf'
];

// 不需要认证的路径
const publicPaths = [
    '/api/health',
    '/api/tags',
    '/api/articles/public'
];

const csrfExcludedPaths = [
    '/api/auth/csrf'
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const method = request.method;

    // 只处理 API 路径
    if (!pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // CSRF 校验：对所有非安全方法执行
    const requiresCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
        && !csrfExcludedPaths.some(path => pathname.startsWith(path));

    if (requiresCsrf && !validateCsrfToken(request)) {
        return new NextResponse(
            JSON.stringify({ error: 'Invalid CSRF token' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // 检查是否是公开路径
    if (publicPaths.some(path => pathname.startsWith(path)) ||
        publicAuthPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // 检查是否是需要认证的路径
    if (protectedPaths.some(path => pathname.startsWith(path)) ||
        adminPaths.some(path => pathname.startsWith(path))) {

        // 从请求头或Cookie中提取 token
        const authHeader = request.headers.get('authorization');
        const tokenFromHeader = AuthMiddleware.extractTokenFromHeader(authHeader);
        const tokenFromCookie = request.cookies.get(getAccessTokenCookieName())?.value ?? null;
        const token = tokenFromHeader || tokenFromCookie;

        if (!token) {
            return new NextResponse(
                JSON.stringify({ error: 'Missing authentication token' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 验证 token
        const payload = JWTUtils.verifyToken(token);

        if (!payload) {
            return new NextResponse(
                JSON.stringify({ error: 'Invalid or expired token' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 检查 token 类型
        if (payload.type !== 'access') {
            return new NextResponse(
                JSON.stringify({ error: 'Invalid token type' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 为请求添加用户信息
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', payload.userId);
        requestHeaders.set('x-user-email', payload.email);

        if (!tokenFromHeader && tokenFromCookie) {
            requestHeaders.set('authorization', `Bearer ${tokenFromCookie}`);
        }

        // 创建带有用户信息的新请求
        const response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });

        return response;
    }

    // 其他路径直接通过
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    ],
}; 
