import {
    createApiResponse,
    handleApiError,
    validateEmail,
    validateMethod
} from '@/lib/api-auth';
import { PasswordResetService } from '@/lib/verification';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // 验证请求方法
        validateMethod(request, ['GET']);

        // 从查询参数获取 email 和 token
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        const token = searchParams.get('token');

        // 验证必填参数
        if (!email || !token) {
            return createApiResponse(
                { error: 'Missing email or token parameter' },
                400
            );
        }

        // 验证邮箱格式
        if (!validateEmail(email)) {
            return createApiResponse(
                { error: 'Invalid email format' },
                400
            );
        }

        // 验证令牌
        const result = await PasswordResetService.verifyResetToken(email, token);

        if (!result.success) {
            return createApiResponse(
                {
                    valid: false,
                    error: result.message
                },
                400
            );
        }

        return createApiResponse({
            valid: true,
            message: result.message,
            email: email
        }, 200);

    } catch (error) {
        return handleApiError(error);
    }
} 