import { randomBytes, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const CSRF_COOKIE_NAME = 'csrf_token';
export const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_BYTE_LENGTH = 32;
const CSRF_MAX_AGE = 60 * 60 * 24; // 24 hours

export function generateCsrfToken(): string {
    return randomBytes(CSRF_TOKEN_BYTE_LENGTH).toString('hex');
}

export function getCsrfCookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    return {
        httpOnly: false, // double submit cookie pattern requires client access
        sameSite: 'strict' as const,
        secure: isProd,
        path: '/',
        maxAge: CSRF_MAX_AGE,
    };
}

export function setCsrfCookie(response: NextResponse, token: string): void {
    response.cookies.set(CSRF_COOKIE_NAME, token, getCsrfCookieOptions());
}

function safeCompare(a: string | null, b: string | null): boolean {
    if (!a || !b) {
        return false;
    }

    try {
        const bufferA = Buffer.from(a);
        const bufferB = Buffer.from(b);

        if (bufferA.length !== bufferB.length) {
            return false;
        }

        return timingSafeEqual(bufferA, bufferB);
    } catch (error) {
        return false;
    }
}

export function validateCsrfToken(request: NextRequest): boolean {
    const headerToken = request.headers.get(CSRF_HEADER_NAME);
    const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value ?? null;
    return safeCompare(headerToken, cookieToken);
}

export function assertCsrfToken(request: NextRequest): void {
    if (!validateCsrfToken(request)) {
        const error = new Error('Invalid CSRF token');
        error.name = 'CsrfError';
        throw error;
    }
}

export function ensureCsrfToken(request: NextRequest, response?: NextResponse): string {
    const existing = request.cookies.get(CSRF_COOKIE_NAME)?.value;
    if (existing) {
        if (response) {
            // Refresh cookie to extend expiration while keeping token stable
            setCsrfCookie(response, existing);
        }
        return existing;
    }

    const token = generateCsrfToken();
    if (response) {
        setCsrfCookie(response, token);
    }
    return token;
}

export function clearCsrfCookie(response: NextResponse): void {
    response.cookies.set(CSRF_COOKIE_NAME, '', {
        ...getCsrfCookieOptions(),
        maxAge: 0,
    });
}
