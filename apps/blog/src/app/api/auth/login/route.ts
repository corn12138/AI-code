import {
    handleApiError,
    parseRequestBody,
    validateEmail,
    validateFields,
    validateMethod
} from '@/lib/api-auth';
import { AuthUser, JWTUtils, PasswordUtils } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
    assertCsrfToken,
    ensureCsrfToken,
    setAuthCookies
} from '@/lib/security';
import { NextRequest, NextResponse } from 'next/server';

interface LoginRequestBody {
    email: string; // 兼容邮箱或用户名
    password: string;
}

export async function POST(request: NextRequest) {
    try {
        validateMethod(request, ['POST']);
        assertCsrfToken(request);

        const body = await parseRequestBody<LoginRequestBody>(request);
        validateFields(body, ['email', 'password']);

        const { email: emailOrUsername, password } = body;
        const normalizedInput = emailOrUsername.toLowerCase();
        const isEmail = validateEmail(emailOrUsername);

        const user = await prisma.user.findFirst({
            where: isEmail
                ? { email: normalizedInput }
                : {
                    OR: [
                        { email: normalizedInput },
                        { username: normalizedInput }
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

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isValidPassword = await PasswordUtils.verifyPassword(password, user.password);
        if (!isValidPassword) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
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
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
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
