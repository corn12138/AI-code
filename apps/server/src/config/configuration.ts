export default () => ({
    port: parseInt(process.env.PORT, 10) || 3001,
    database: {
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
        username: process.env.DATABASE_USER || 'bloguser',
        password: process.env.DATABASE_PASSWORD || 'blogpassword',
        name: process.env.DATABASE_NAME || 'blogdb',
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.DATABASE_LOGGING === 'true',
        ssl: process.env.DATABASE_SSL === 'true',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'supersecret-dev-only-jwt',
        accessTokenExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
        refreshTokenExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
    },
    throttle: {
        ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
        limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
    },
    security: {
        bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
        csrfEnabled: process.env.CSRF_ENABLED === 'true',
    },
});
