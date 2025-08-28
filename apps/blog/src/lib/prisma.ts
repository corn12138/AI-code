import { PrismaClient } from '@prisma/client';

// Ensure DATABASE_URL can be derived from server-style env pieces
function ensureDatabaseUrl(): void {
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0) {
        return;
    }

    const host = process.env.DATABASE_HOST;
    const port = process.env.DATABASE_PORT || '6543';
    const name = process.env.DATABASE_NAME;
    const user = process.env.DATABASE_USER;
    const password = process.env.DATABASE_PASSWORD;
    const ssl = process.env.DATABASE_SSL === 'true';

    if (host && name && user && typeof password === 'string') {
        const auth = encodeURIComponent(user) + ':' + encodeURIComponent(password);
        const params = new URLSearchParams({ schema: 'public' });
        if (ssl) {
            params.append('sslmode', 'require');
        }
        process.env.DATABASE_URL = `postgresql://${auth}@${host}:${port}/${name}?${params.toString()}`;
    }
}

ensureDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
} 