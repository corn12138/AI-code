import { NextRequest } from 'next/server';
import { AUTH_ERRORS, AuthError, AuthUser } from './auth';
import { prisma } from './prisma';

/**
 * 从请求头中获取当前用户信息
 */
export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
    const userId = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email');

    if (!userId || !userEmail) {
        return null;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                roles: true
            }
        });

        if (!user) {
            return null;
        }

        return {
            id: user.id,
            email: user.email,
            username: user.username,
            roles: user.roles as string[]
        };
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

/**
 * 要求用户认证的装饰器
 */
export async function requireAuth(request: NextRequest): Promise<AuthUser> {
    const user = await getCurrentUser(request);

    if (!user) {
        throw AUTH_ERRORS.INVALID_TOKEN;
    }

    return user;
}

/**
 * 要求特定角色的装饰器
 */
export async function requireRole(request: NextRequest, requiredRole: string): Promise<AuthUser> {
    const user = await requireAuth(request);

    const roleHierarchy = {
        'admin': 3,
        'editor': 2,
        'user': 1
    };

    // 检查用户是否拥有所需的角色
    const userRoles = user.roles;
    const userLevel = Math.max(...userRoles.map(role => roleHierarchy[role as keyof typeof roleHierarchy] || 0));
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

    if (userLevel < requiredLevel) {
        throw AUTH_ERRORS.INSUFFICIENT_PERMISSION;
    }

    return user;
}

/**
 * 要求管理员权限的装饰器
 */
export async function requireAdmin(request: NextRequest): Promise<AuthUser> {
    return requireRole(request, 'admin');
}

/**
 * 检查用户是否拥有资源权限
 */
export async function checkResourceOwnership(
    request: NextRequest,
    resourceUserId: string,
    allowedRoles: string[] = ['admin']
): Promise<AuthUser> {
    const user = await requireAuth(request);

    // 如果是资源拥有者，允许访问
    if (user.id === resourceUserId) {
        return user;
    }

    // 检查是否有足够的权限
    const roleHierarchy = {
        'admin': 3,
        'editor': 2,
        'user': 1
    };

    const userRoles = user.roles;
    const userLevel = Math.max(...userRoles.map(role => roleHierarchy[role as keyof typeof roleHierarchy] || 0));
    const requiredLevel = Math.max(...allowedRoles.map(role => roleHierarchy[role as keyof typeof roleHierarchy] || 0));

    if (userLevel < requiredLevel) {
        throw AUTH_ERRORS.INSUFFICIENT_PERMISSION;
    }

    return user;
}

/**
 * API 错误处理装饰器
 */
export function handleApiError(error: unknown): Response {
    console.error('API Error:', error);

    if (error instanceof AuthError) {
        return new Response(
            JSON.stringify({
                error: error.message,
                code: error.code
            }),
            {
                status: error.status,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    if (error instanceof Error) {
        return new Response(
            JSON.stringify({
                error: error.message,
                code: 'INTERNAL_ERROR'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    return new Response(
        JSON.stringify({
            error: 'Internal server error',
            code: 'UNKNOWN_ERROR'
        }),
        {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        }
    );
}

/**
 * 创建 API 响应
 */
export function createApiResponse(data: any, status: number = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    });
}

/**
 * 验证请求方法
 */
export function validateMethod(request: NextRequest, allowedMethods: string[]): void {
    if (!allowedMethods.includes(request.method)) {
        throw new AuthError(
            `Method ${request.method} not allowed`,
            'METHOD_NOT_ALLOWED',
            405
        );
    }
}

/**
 * 解析请求体
 */
export async function parseRequestBody<T>(request: NextRequest): Promise<T> {
    try {
        const body = await request.json();
        return body as T;
    } catch (error) {
        throw new AuthError(
            'Invalid JSON in request body',
            'INVALID_JSON',
            400
        );
    }
}

/**
 * 验证请求体字段
 */
export function validateFields(data: any, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
        throw new AuthError(
            `Missing required fields: ${missingFields.join(', ')}`,
            'MISSING_FIELDS',
            400
        );
    }
}

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * 验证密码强度
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long' };
    }

    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number' };
    }

    return { valid: true };
} 