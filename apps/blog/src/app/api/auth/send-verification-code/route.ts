import {
    createApiResponse,
    handleApiError,
    parseRequestBody,
    validateEmail,
    validateFields,
    validateMethod
} from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { VerificationCodeService } from '@/lib/verification';
import { VerificationCodeType } from '@prisma/client';
import { NextRequest } from 'next/server';

interface SendVerificationCodeRequest {
    email: string;
    type: 'email_login' | 'password_reset';
}

export async function POST(request: NextRequest) {
    try {
        // 验证请求方法
        validateMethod(request, ['POST']);

        // 解析请求体
        const body = await parseRequestBody<SendVerificationCodeRequest>(request);

        // 验证必填字段
        validateFields(body, ['email', 'type']);

        const { email, type } = body;

        // 验证邮箱格式
        if (!validateEmail(email)) {
            return createApiResponse(
                { error: 'Invalid email format' },
                400
            );
        }

        // 验证类型
        if (!['email_login', 'password_reset'].includes(type)) {
            return createApiResponse(
                { error: 'Invalid verification type' },
                400
            );
        }

        // 转换类型
        const codeType = type === 'email_login'
            ? VerificationCodeType.EMAIL_LOGIN
            : VerificationCodeType.PASSWORD_RESET;

        // 对于邮箱登录，检查用户是否存在
        if (type === 'email_login') {
            const user = await prisma.user.findUnique({
                where: { email: email.toLowerCase() }
            });

            if (!user) {
                return createApiResponse(
                    { error: 'Email not registered' },
                    404
                );
            }
        }

        // 检查是否可以发送验证码
        const canSend = await VerificationCodeService.canSendCode(email);
        if (!canSend.canSend) {
            return createApiResponse(
                { error: canSend.reason },
                429
            );
        }

        // 对于密码重置，需要找到用户ID
        let userId: string | undefined;
        if (type === 'password_reset') {
            const user = await prisma.user.findUnique({
                where: { email: email.toLowerCase() },
                select: { id: true }
            });
            userId = user?.id;
        }

        // 发送验证码
        const result = await VerificationCodeService.sendVerificationCode(
            email,
            codeType,
            userId
        );

        if (!result.success) {
            return createApiResponse(
                { error: result.message },
                400
            );
        }

        // 成功响应
        const response: any = {
            message: result.message,
            email: email
        };

        // 开发环境下返回验证码（方便测试）
        if (process.env.NODE_ENV === 'development' && result.code) {
            response.code = result.code;
        }

        return createApiResponse(response, 200);

    } catch (error) {
        return handleApiError(error);
    }
} 