import {
    createApiResponse,
    handleApiError,
    parseRequestBody,
    validateEmail,
    validateFields,
    validateMethod
} from '@/lib/api-auth';
import { AuthUser, JWTUtils } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { VerificationCodeService } from '@/lib/verification';
import { VerificationCodeType } from '@prisma/client';
import { NextRequest } from 'next/server';

interface EmailLoginRequest {
    email: string;
    code: string;
}

export async function POST(request: NextRequest) {
    try {
        // 验证请求方法
        validateMethod(request, ['POST']);

        // 解析请求体
        const body = await parseRequestBody<EmailLoginRequest>(request);

        // 验证必填字段
        validateFields(body, ['email', 'code']);

        const { email, code } = body;

        // 验证邮箱格式
        if (!validateEmail(email)) {
            return createApiResponse(
                { error: 'Invalid email format' },
                400
            );
        }

        // 验证验证码格式（6位数字）
        if (!/^\d{6}$/.test(code)) {
            return createApiResponse(
                { error: 'Invalid verification code format' },
                400
            );
        }

        // 验证验证码
        const verificationResult = await VerificationCodeService.verifyCode(
            email,
            code,
            VerificationCodeType.EMAIL_LOGIN
        );

        if (!verificationResult.success) {
            return createApiResponse(
                { error: verificationResult.message },
                400
            );
        }

        // 查找用户
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: {
                id: true,
                email: true,
                username: true,
                fullName: true,
                avatar: true,
                roles: true
            }
        });

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

        // 生成 JWT tokens
        const tokens = JWTUtils.generateTokenPair(authUser);

        // 更新用户最后登录时间
        await prisma.user.update({
            where: { id: user.id },
            data: { updatedAt: new Date() }
        });

        // 返回成功响应
        return createApiResponse({
            message: 'Email login successful',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                fullName: user.fullName,
                avatar: user.avatar,
                roles: user.roles
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        }, 200);

    } catch (error) {
        return handleApiError(error);
    }
} 