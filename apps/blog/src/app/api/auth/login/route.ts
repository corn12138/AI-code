import {
    createApiResponse,
    handleApiError,
    parseRequestBody,
    validateEmail,
    validateFields,
    validateMethod
} from '@/lib/api-auth';
import { AuthUser, JWTUtils, PasswordUtils } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

interface LoginRequestBody {
    email: string; // 可以是邮箱或用户名
    password: string;
}

export async function POST(request: NextRequest) {
    try {
        // 验证请求方法
        validateMethod(request, ['POST']);

        // 解析请求体
        const body = await parseRequestBody<LoginRequestBody>(request);

        // 验证必填字段
        validateFields(body, ['email', 'password']);

        const { email: emailOrUsername, password } = body;

        // 判断输入是邮箱还是用户名
        const isEmail = validateEmail(emailOrUsername);

        // 查找用户 - 支持邮箱或用户名登录
        const user = await prisma.user.findFirst({
            where: isEmail
                ? { email: emailOrUsername.toLowerCase() }
                : {
                    OR: [
                        { email: emailOrUsername.toLowerCase() },
                        { username: emailOrUsername.toLowerCase() }
                    ]
                },
            select: {
                id: true,
                email: true,
                username: true,
                password: true,
                roles: true
            }
        });

        // 检查用户是否存在
        if (!user) {
            return createApiResponse(
                { error: 'Invalid credentials' },
                401
            );
        }

        // 验证密码
        const isValidPassword = await PasswordUtils.verifyPassword(password, user.password);

        if (!isValidPassword) {
            return createApiResponse(
                { error: 'Invalid credentials' },
                401
            );
        }

        // 创建用户信息对象
        const authUser: AuthUser = {
            id: user.id,
            email: user.email,
            username: user.username,
            roles: user.roles as string[]
        };

        // 生成 JWT tokens
        const tokens = JWTUtils.generateTokenPair(authUser);

        // 更新用户最后登录时间
        await prisma.user.update({
            where: { id: user.id },
            data: { updatedAt: new Date() }
        });

        // 返回成功响应
        return createApiResponse({
            message: 'Login successful',
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
