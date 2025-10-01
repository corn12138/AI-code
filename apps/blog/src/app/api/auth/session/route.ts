import { AUTH_ERRORS, JWTUtils } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
    ensureCsrfToken,
    getAccessTokenCookieName
} from '@/lib/security';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const accessToken = request.cookies.get(getAccessTokenCookieName())?.value;
        if (!accessToken) {
            return NextResponse.json({ error: AUTH_ERRORS.MISSING_TOKEN.message }, { status: 401 });
        }

        const payload = JWTUtils.verifyToken(accessToken);
        if (!payload || payload.type !== 'access') {
            return NextResponse.json({ error: AUTH_ERRORS.INVALID_TOKEN.message }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                username: true,
                roles: true,
                avatar: true,
                fullName: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: AUTH_ERRORS.USER_NOT_FOUND.message }, { status: 404 });
        }

        const response = NextResponse.json({
            user: {
                ...user,
                roles: Array.isArray(user.roles) ? user.roles : ['user'],
            },
        });

        ensureCsrfToken(request, response);

        return response;
    } catch (error) {
        return NextResponse.json({ error: 'Failed to resolve session' }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_ORIGIN || '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
        },
    });
}
