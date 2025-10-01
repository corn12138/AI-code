import { ensureCsrfToken, setCsrfCookie } from '@/lib/security';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const token = ensureCsrfToken(request);
    const response = NextResponse.json({ csrfToken: token });
    setCsrfCookie(response, token);
    return response;
}

export async function HEAD(request: NextRequest) {
    const token = ensureCsrfToken(request);
    const response = new NextResponse(null, { status: 204 });
    setCsrfCookie(response, token);
    return response;
}

export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_ORIGIN || '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
        },
    });
}
