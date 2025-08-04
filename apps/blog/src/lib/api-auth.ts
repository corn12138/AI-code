import { AUTH_ERRORS, AuthMiddleware, AuthUser, JWTUtils } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// ========== 通用 API 工具函数 ==========

/**
 * 验证HTTP请求方法
 */
export function validateMethod(request: NextRequest, allowedMethods: string[]): void {
    const method = request.method;
    if (!allowedMethods.includes(method)) {
        throw new Error(`Method ${method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`);
    }
}

/**
 * 创建标准化的API响应
 */
export function createApiResponse(data: any, status: number = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

/**
 * 处理API错误并返回标准化的错误响应
 */
export function handleApiError(error: unknown): Response {
    console.error('API Error:', error);

    // 认证错误
    if (error instanceof Error && error.name === 'AuthError') {
        const authError = error as any;
        return createApiResponse({
            error: authError.message,
            code: authError.code
        }, authError.status || 401);
    }

    // 验证错误
    if (error instanceof Error && error.message.includes('Method')) {
        return createApiResponse({
            error: error.message,
            code: 'METHOD_NOT_ALLOWED'
        }, 405);
    }

    // Prisma 错误
    if (error instanceof Error && error.name === 'PrismaClientKnownRequestError') {
        const prismaError = error as any;
        if (prismaError.code === 'P2002') {
            return createApiResponse({
                error: 'Resource already exists',
                code: 'DUPLICATE_RESOURCE'
            }, 409);
        }
        if (prismaError.code === 'P2025') {
            return createApiResponse({
                error: 'Resource not found',
                code: 'RESOURCE_NOT_FOUND'
            }, 404);
        }
    }

    // 其他已知错误
    if (error instanceof Error) {
        return createApiResponse({
            error: error.message,
            code: 'BAD_REQUEST'
        }, 400);
    }

    // 未知错误
    return createApiResponse({
        error: 'Internal Server Error',
        code: 'INTERNAL_ERROR'
    }, 500);
}

/**
 * 解析请求体
 */
export async function parseRequestBody<T = any>(request: NextRequest): Promise<T> {
    try {
        const contentType = request.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            const body = await request.json();
            return body as T;
        }

        if (contentType.includes('application/x-www-form-urlencoded')) {
            const formData = await request.formData();
            const body: any = {};
            formData.forEach((value, key) => {
                body[key] = value;
            });
            return body as T;
        }

        // 默认尝试解析为JSON
        const body = await request.json();
        return body as T;
    } catch (error) {
        throw new Error('Invalid request body format');
    }
}

/**
 * 验证必填字段
 */
export function validateFields(data: any, requiredFields: string[]): void {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid request data');
    }

    const missingFields = requiredFields.filter(field => {
        const value = data[field];
        return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
}

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * 验证密码强度
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
    if (!password || typeof password !== 'string') {
        return { valid: false, message: 'Password is required' };
    }

    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long' };
    }

    if (password.length > 128) {
        return { valid: false, message: 'Password must be no more than 128 characters long' };
    }

    // 至少包含一个大写字母、一个小写字母、一个数字
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
        return {
            valid: false,
            message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        };
    }

    return { valid: true };
}

// ========== 认证相关函数 ==========

/**
 * API路由认证中间件
 * 验证请求中的JWT token并返回用户信息
 */
export async function requireAuth(request: NextRequest): Promise<AuthUser> {
    try {
        // 从请求头提取Authorization token
        const authHeader = request.headers.get('Authorization');
        const token = AuthMiddleware.extractTokenFromHeader(authHeader);

        if (!token) {
            throw AUTH_ERRORS.MISSING_TOKEN;
        }

        // 验证JWT token
        const payload = JWTUtils.verifyToken(token);
        if (!payload || payload.type !== 'access') {
            throw AUTH_ERRORS.INVALID_TOKEN;
        }

        // 从数据库获取用户信息
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                username: true,
                roles: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            throw AUTH_ERRORS.USER_NOT_FOUND;
        }

        // 解析用户角色（假设roles字段存储为JSON数组）
        const roles = Array.isArray(user.roles) ? user.roles as string[] : ['user'];

        return {
            id: user.id,
            email: user.email,
            username: user.username,
            roles: roles
        };

    } catch (error) {
        // 如果是已知的认证错误，直接抛出
        if (error instanceof Error && error.name === 'AuthError') {
            throw error;
        }

        // JWT验证错误
        if (error instanceof Error && error.name === 'JsonWebTokenError') {
            throw AUTH_ERRORS.INVALID_TOKEN;
        }

        if (error instanceof Error && error.name === 'TokenExpiredError') {
            throw AUTH_ERRORS.EXPIRED_TOKEN;
        }

        // 其他未知错误
        console.error('Auth verification error:', error);
        throw AUTH_ERRORS.INVALID_TOKEN;
    }
}

/**
 * 可选的认证中间件
 * 如果有token则验证，没有token则返回null
 */
export async function optionalAuth(request: NextRequest): Promise<AuthUser | null> {
    try {
        return await requireAuth(request);
    } catch (error) {
        // 如果认证失败，返回null而不是抛出错误
        return null;
    }
}

/**
 * 权限检查中间件
 * 需要特定角色才能访问
 */
export async function requireRole(request: NextRequest, requiredRole: string): Promise<AuthUser> {
    const user = await requireAuth(request);

    // 检查用户是否有足够的权限
    const hasPermission = user.roles.some(role =>
        AuthMiddleware.hasPermission(role, requiredRole)
    );

    if (!hasPermission) {
        throw AUTH_ERRORS.INSUFFICIENT_PERMISSION;
    }

    return user;
}

/**
 * 管理员权限检查
 */
export async function requireAdmin(request: NextRequest): Promise<AuthUser> {
    return requireRole(request, 'admin');
}

/**
 * 编辑者权限检查
 */
export async function requireEditor(request: NextRequest): Promise<AuthUser> {
    return requireRole(request, 'editor');
}

/**
 * 获取当前用户ID（仅需要用户ID的场景）
 */
export async function getCurrentUserId(request: NextRequest): Promise<string> {
    const user = await requireAuth(request);
    return user.id;
}

/**
 * 处理认证错误并返回标准化的响应
 */
export function handleAuthError(error: unknown): Response {
    if (error instanceof Error && error.name === 'AuthError') {
        const authError = error as any;
        return new Response(
            JSON.stringify({
                error: authError.message,
                code: authError.code
            }),
            {
                status: authError.status || 401,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    // 未知错误，返回通用错误响应
    return new Response(
        JSON.stringify({
            error: 'Internal Server Error',
            code: 'INTERNAL_ERROR'
        }),
        {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        }
    );
}

/**
 * API路由认证装饰器
 * 用于包装API处理函数，自动处理认证
 */
export function withAuth<T extends any[]>(
    handler: (request: NextRequest, user: AuthUser, ...args: T) => Promise<Response>
) {
    return async (request: NextRequest, ...args: T): Promise<Response> => {
        try {
            const user = await requireAuth(request);
            return handler(request, user, ...args);
        } catch (error) {
            return handleAuthError(error);
        }
    };
}

/**
 * 可选认证装饰器
 */
export function withOptionalAuth<T extends any[]>(
    handler: (request: NextRequest, user: AuthUser | null, ...args: T) => Promise<Response>
) {
    return async (request: NextRequest, ...args: T): Promise<Response> => {
        try {
            const user = await optionalAuth(request);
            return handler(request, user, ...args);
        } catch (error) {
            // 对于可选认证，如果认证失败则传递null
            return handler(request, null, ...args);
        }
    };
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(request: NextRequest): Promise<AuthUser> {
    return await requireAuth(request);
}

/**
 * 检查资源所有权
 */
export async function checkResourceOwnership(
    request: NextRequest,
    resourceOwnerId: string,
    allowedRoles: string[] = ['admin']
): Promise<AuthUser> {
    const user = await requireAuth(request);

    // 检查是否是资源所有者或具有管理员权限
    const hasRole = user.roles && user.roles.some(role => allowedRoles.includes(role));
    if (user.id === resourceOwnerId || hasRole) {
        return user;
    }

    throw AUTH_ERRORS.INSUFFICIENT_PERMISSION;
} 