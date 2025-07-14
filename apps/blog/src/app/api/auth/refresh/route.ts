import {
    createApiResponse,
    handleApiError,
    parseRequestBody,
    validateFields,
    validateMethod
} from '@/lib/api-auth';
import { AuthUser, JWTUtils } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

interface RefreshRequestBody {
    refreshToken: string;
}

export async function POST(request: NextRequest) {
    try {
        // 验证请求方法
        validateMethod(request, ['POST']);

        // 解析请求体
        const body = await parseRequestBody<RefreshRequestBody>(request);

        // 验证必填字段
        validateFields(body, ['refreshToken']);

        const { refreshToken } = body;

        // 验证刷新令牌
        const payload = JWTUtils.verifyToken(refreshToken);

        if (!payload) {
            return createApiResponse(
                { error: 'Invalid or expired refresh token' },
                401
            );
        }

        // 检查令牌类型
        if (payload.type !== 'refresh') {
            return createApiResponse(
                { error: 'Invalid token type' },
                401
            );
        }

        // 查找用户
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                username: true,
                roles: true
            }
        });

        // 检查用户是否存在
        if (!user) {
            return createApiResponse(
                { error: 'User not found' },
                404
            );
        }

        // 创建用户信息对象
        const authUser: AuthUser = {
            id: user.id,
            email: user.email,
            username: user.username,
            roles: user.roles as string[]
        };

        // 生成新的令牌对
        const tokens = JWTUtils.generateTokenPair(authUser);

        // 返回成功响应
        return createApiResponse({
            message: 'Token refreshed successfully',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                roles: user.roles
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });

    } catch (error) {
        return handleApiError(error);
    }
}

// 处理 OPTIONS 请求（CORS）
export async function OPTIONS(request: NextRequest) {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
} 