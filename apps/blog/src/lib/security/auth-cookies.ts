import { NextResponse } from 'next/server';

const isProduction = process.env.NODE_ENV === 'production';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

const ACCESS_TOKEN_MAX_AGE = 60 * 15; // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string) {
    response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/',
        maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/api/auth',
        maxAge: REFRESH_TOKEN_MAX_AGE,
    });
}

export function clearAuthCookies(response: NextResponse) {
    response.cookies.set(ACCESS_TOKEN_COOKIE, '', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/',
        maxAge: 0,
    });

    response.cookies.set(REFRESH_TOKEN_COOKIE, '', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/api/auth',
        maxAge: 0,
    });
}

export function getAccessTokenCookieName() {
    return ACCESS_TOKEN_COOKIE;
}

export function getRefreshTokenCookieName() {
    return REFRESH_TOKEN_COOKIE;
}

