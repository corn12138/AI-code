import {
    createApiResponse,
    handleApiError,
    parseRequestBody,
    validateEmail,
    validateFields,
    validateMethod,
    validatePassword
} from '@/lib/api-auth';
import { AuthUser, JWTUtils, PasswordUtils } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

interface RegisterRequestBody {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
}

export async function POST(request: NextRequest) {
    try {
        // 验证请求方法
        validateMethod(request, ['POST']);

        // 解析请求体
        const body = await parseRequestBody<RegisterRequestBody>(request);

        // 验证必填字段
        validateFields(body, ['email', 'username', 'password', 'confirmPassword']);

        const { email, username, password, confirmPassword } = body;

        // 验证邮箱格式
        if (!validateEmail(email)) {
            return createApiResponse(
                { error: 'Invalid email format' },
                400
            );
        }

        // 验证用户名
        if (username.length < 3) {
            return createApiResponse(
                { error: 'Username must be at least 3 characters long' },
                400
            );
        }

        if (username.length > 20) {
            return createApiResponse(
                { error: 'Username must be no more than 20 characters long' },
                400
            );
        }

        // 验证用户名格式（只能包含字母、数字、下划线）
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return createApiResponse(
                { error: 'Username can only contain letters, numbers, and underscores' },
                400
            );
        }

        // 验证密码强度
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return createApiResponse(
                { error: passwordValidation.message },
                400
            );
        }

        // 验证密码确认
        if (password !== confirmPassword) {
            return createApiResponse(
                { error: 'Passwords do not match' },
                400
            );
        }

        // 检查邮箱是否已存在
        const existingEmail = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (existingEmail) {
            return createApiResponse(
                { error: 'Email already exists' },
                409
            );
        }

        // 检查用户名是否已存在
        const existingUsername = await prisma.user.findUnique({
            where: { username: username.toLowerCase() }
        });

        if (existingUsername) {
            return createApiResponse(
                { error: 'Username already exists' },
                409
            );
        }

        // 加密密码
        const hashedPassword = await PasswordUtils.hashPassword(password);

        // 创建用户
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                username: username.toLowerCase(),
                password: hashedPassword,
                roles: ['user']
            },
            select: {
                id: true,
                email: true,
                username: true,
                roles: true
            }
        });

        // 创建用户信息对象
        const authUser: AuthUser = {
            id: user.id,
            email: user.email,
            username: user.username,
            roles: user.roles as string[]
        };

        // 生成 JWT tokens
        const tokens = JWTUtils.generateTokenPair(authUser);

        // 返回成功响应
        return createApiResponse({
            message: 'Registration successful',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                roles: user.roles
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        }, 201);

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