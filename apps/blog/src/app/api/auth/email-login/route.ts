import {
    handleApiError,
    parseRequestBody,
    validateEmail,
    validateFields,
    validateMethod
} from '@/lib/api-auth';
import { AuthUser, JWTUtils } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { VerificationCodeService } from '@/lib/verification';
import {
    assertCsrfToken,
    ensureCsrfToken,
    setAuthCookies
} from '@/lib/security';
import { VerificationCodeType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

interface EmailLoginRequest {
    email: string;
    code: string;
}

export async function POST(request: NextRequest) {
    try {
        validateMethod(request, ['POST']);
        assertCsrfToken(request);

        const body = await parseRequestBody<EmailLoginRequest>(request);
        validateFields(body, ['email', 'code']);

        const { email, code } = body;

        if (!validateEmail(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        if (!/^\d{6}$/.test(code)) {
            return NextResponse.json({ error: 'Invalid verification code format' }, { status: 400 });
        }

        const verificationResult = await VerificationCodeService.verifyCode(
            email,
            code,
            VerificationCodeType.EMAIL_LOGIN
        );

        if (!verificationResult.success) {
            return NextResponse.json({ error: verificationResult.message }, { status: 400 });
        }

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
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const authUser: AuthUser = {
            id: user.id,
            email: user.email,
            username: user.username,
            roles: user.roles as string[]
        };

        const tokens = JWTUtils.generateTokenPair(authUser);

        await prisma.user.update({
            where: { id: user.id },
            data: { updatedAt: new Date() }
        });

        const response = NextResponse.json({
            message: 'Email login successful',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                fullName: user.fullName,
                avatar: user.avatar,
                roles: user.roles
            }
        });

        setAuthCookies(response, tokens.accessToken, tokens.refreshToken);
        ensureCsrfToken(request, response);

        return response;
    } catch (error) {
        return handleApiError(error);
    }
}

export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_ORIGIN || '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
        },
    });
}
