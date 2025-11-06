import { vi } from 'vitest';

// Mock @nestjs/config
vi.mock('@nestjs/config', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@nestjs/config')>();
    return {
        ...actual,
        ConfigModule: {
            forRoot: vi.fn(() => ({
                module: class MockConfigModule { },
                providers: [actual.ConfigService],
                exports: [actual.ConfigService],
            })),
        },
        ConfigService: vi.fn(() => ({
            get: vi.fn((key: string) => {
                switch (key) {
                    case 'JWT_SECRET':
                        return 'test-jwt-secret';
                    case 'JWT_ACCESS_EXPIRATION':
                        return '15m';
                    case 'JWT_REFRESH_EXPIRATION':
                        return '7d';
                    case 'DATABASE_URL':
                        return 'postgresql://test_user:test_password@localhost:5432/test_db';
                    default:
                        return undefined;
                }
            }),
        })),
    };
});

// Mock @nestjs/jwt
vi.mock('@nestjs/jwt', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@nestjs/jwt')>();
    return {
        ...actual,
        JwtModule: {
            registerAsync: vi.fn(() => ({
                module: class MockJwtModule { },
                providers: [actual.JwtService],
                exports: [actual.JwtService],
            })),
            register: vi.fn(() => ({
                module: class MockJwtModule { },
                providers: [actual.JwtService],
                exports: [actual.JwtService],
            })),
        },
        JwtService: vi.fn(() => ({
            sign: vi.fn((payload: any) => `mocked-jwt-token-${payload.userId}`),
            verify: vi.fn((token: string) => {
                if (token.includes('invalid')) throw new Error('Invalid token');
                if (token.includes('expired')) throw new Error('Token expired');
                return { userId: 'mock-user-id', email: 'mock@example.com' };
            }),
            signAsync: vi.fn((payload: any) => Promise.resolve(`mocked-jwt-token-${payload.userId}`)),
            verifyAsync: vi.fn((token: string) => {
                if (token.includes('invalid')) return Promise.reject(new Error('Invalid token'));
                if (token.includes('expired')) return Promise.reject(new Error('Token expired'));
                return Promise.resolve({ userId: 'mock-user-id', email: 'mock@example.com' });
            }),
        })),
    };
});