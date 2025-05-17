interface DatabaseConfig {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
    synchronize: boolean;
    logging: boolean;
    ssl: boolean | { rejectUnauthorized: boolean };
}

interface JwtConfig {
    secret: string;
    accessTokenExpiration: string;
    refreshTokenExpiration: string;
}

interface ThrottleConfig {
    ttl: number;
    limit: number;
}

interface SecurityConfig {
    bcryptSaltRounds: number;
    csrfEnabled: boolean;
}

interface AppConfig {
    port: number;
    database: DatabaseConfig;
    jwt: JwtConfig;
    throttle: ThrottleConfig;
    security: SecurityConfig;
}

export default (): AppConfig => ({
    port: parseInt(process.env.PORT ?? '3001', 10) || 3001,
    database: {
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT ?? '6543', 10) || 6543,
        username: process.env.DATABASE_USER || 'app_user',
        password: process.env.DATABASE_PASSWORD || 'HYm_7893_hyujs_m',
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
        ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10) || 60,
        limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10) || 100,
    },
    security: {
        bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '12', 10) || 12,
        csrfEnabled: process.env.CSRF_ENABLED === 'true',
    },
});
