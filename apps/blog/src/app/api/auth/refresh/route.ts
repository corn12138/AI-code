import {
    handleApiError,
    validateMethod
} from '@/lib/api-auth';
import { AuthUser, JWTUtils } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
    assertCsrfToken,
    ensureCsrfToken,
    getRefreshTokenCookieName,
    setAuthCookies
} from '@/lib/security';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        validateMethod(request, ['POST']);
        assertCsrfToken(request);

        const refreshToken = request.cookies.get(getRefreshTokenCookieName())?.value;
        if (!refreshToken) {
            return NextResponse.json({ error: 'Missing refresh token' }, { status: 401 });
        }

        const payload = JWTUtils.verifyToken(refreshToken);
        if (!payload || payload.type !== 'refresh') {
            return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                username: true,
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

        const response = NextResponse.json({
            message: 'Token refreshed successfully',
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
