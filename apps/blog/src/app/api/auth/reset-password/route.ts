import {
    createApiResponse,
    handleApiError,
    parseRequestBody,
    validateEmail,
    validateFields,
    validateMethod
} from '@/lib/api-auth';
import { assertCsrfToken } from '@/lib/security';
import { PasswordResetService } from '@/lib/verification';
import { NextRequest } from 'next/server';

interface SendResetLinkRequest {
    email: string;
}

interface ResetPasswordRequest {
    email: string;
    token: string;
    newPassword: string;
    confirmPassword: string;
}

// 发送重置密码链接
export async function POST(request: NextRequest) {
    try {
        // 验证请求方法
        validateMethod(request, ['POST']);
        assertCsrfToken(request);

        // 解析请求体
        const body = await parseRequestBody<SendResetLinkRequest>(request);

        // 验证必填字段
        validateFields(body, ['email']);

        const { email } = body;

        // 验证邮箱格式
        if (!validateEmail(email)) {
            return createApiResponse(
                { error: 'Invalid email format' },
                400
            );
        }

        // 发送重置链接
        const result = await PasswordResetService.sendResetLink(email);

        if (!result.success) {
            return createApiResponse(
                { error: result.message },
                400
            );
        }

        return createApiResponse({
            message: result.message,
            email: email
        }, 200);

    } catch (error) {
        return handleApiError(error);
    }
}

// 重置密码
export async function PUT(request: NextRequest) {
    try {
        // 验证请求方法
        validateMethod(request, ['PUT']);
        assertCsrfToken(request);

        // 解析请求体
        const body = await parseRequestBody<ResetPasswordRequest>(request);

        // 验证必填字段
        validateFields(body, ['email', 'token', 'newPassword', 'confirmPassword']);

        const { email, token, newPassword, confirmPassword } = body;

        // 验证邮箱格式
        if (!validateEmail(email)) {
            return createApiResponse(
                { error: 'Invalid email format' },
                400
            );
        }

        // 验证密码格式
        if (newPassword.length < 8) {
            return createApiResponse(
                { error: 'Password must be at least 8 characters long' },
                400
            );
        }

        // 验证密码确认
        if (newPassword !== confirmPassword) {
            return createApiResponse(
                { error: 'Password confirmation does not match' },
                400
            );
        }

        // 验证密码复杂度
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        if (!passwordRegex.test(newPassword)) {
            return createApiResponse(
                {
                    error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
                },
                400
            );
        }

        // 重置密码
        const result = await PasswordResetService.resetPassword(email, token, newPassword);

        if (!result.success) {
            return createApiResponse(
                { error: result.message },
                400
            );
        }

        return createApiResponse({
            message: result.message
        }, 200);

    } catch (error) {
        return handleApiError(error);
    }
} 
