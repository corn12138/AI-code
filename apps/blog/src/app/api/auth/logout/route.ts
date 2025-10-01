import { handleApiError, validateMethod } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { assertCsrfToken, clearAuthCookies, clearCsrfCookie } from '@/lib/security';

export async function POST(request: NextRequest) {
    try {
        validateMethod(request, ['POST']);
        assertCsrfToken(request);

        const response = NextResponse.json({ message: 'Logout successful' });
        clearAuthCookies(response);
        clearCsrfCookie(response);

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
