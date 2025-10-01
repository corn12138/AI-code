import {
    handleApiError,
    parseRequestBody,
    validateEmail,
    validateFields,
    validateMethod,
    validatePassword
} from '@/lib/api-auth';
import { AuthUser, JWTUtils, PasswordUtils } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
    assertCsrfToken,
    ensureCsrfToken,
    setAuthCookies
} from '@/lib/security';
import { NextRequest, NextResponse } from 'next/server';

interface RegisterRequestBody {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
}

export async function POST(request: NextRequest) {
    try {
        validateMethod(request, ['POST']);
        assertCsrfToken(request);

        const body = await parseRequestBody<RegisterRequestBody>(request);
        validateFields(body, ['email', 'username', 'password', 'confirmPassword']);

        const { email, username, password, confirmPassword } = body;
        const normalizedEmail = email.toLowerCase();
        const normalizedUsername = username.toLowerCase();

        if (!validateEmail(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        if (normalizedUsername.length < 3 || normalizedUsername.length > 20) {
            return NextResponse.json({ error: 'Username must be between 3 and 20 characters long' }, { status: 400 });
        }

        if (!/^[a-zA-Z0-9_]+$/.test(normalizedUsername)) {
            return NextResponse.json({ error: 'Username can only contain letters, numbers, and underscores' }, { status: 400 });
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return NextResponse.json({ error: passwordValidation.message }, { status: 400 });
        }

        if (password !== confirmPassword) {
            return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
        }

        const existingEmail = await prisma.user.findUnique({
            where: { email: normalizedEmail }
        });
        if (existingEmail) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
        }

        const existingUsername = await prisma.user.findUnique({
            where: { username: normalizedUsername }
        });
        if (existingUsername) {
            return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
        }

        const hashedPassword = await PasswordUtils.hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                username: normalizedUsername,
                password: hashedPassword,
                roles: ['user']
            },
            select: {
                id: true,
                email: true,
                username: true,
                roles: true
            }
        });

        const authUser: AuthUser = {
            id: user.id,
            email: user.email,
            username: user.username,
            roles: user.roles as string[]
        };

        const tokens = JWTUtils.generateTokenPair(authUser);

        const response = NextResponse.json({
            message: 'Registration successful',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                roles: user.roles
            }
        }, { status: 201 });

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
