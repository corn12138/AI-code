import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// JWT Token 配置
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || '15m';
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';

// 密码加密配置
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');

// JWT Token 类型
export interface JWTPayload {
    userId: string;
    email: string;
    type: 'access' | 'refresh';
}

// 用户认证信息
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  roles: string[];
}

// 密码相关工具
export class PasswordUtils {
    /**
     * 加密密码
     */
    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    }

    /**
     * 验证密码
     */
    static async verifyPassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}

// JWT Token 相关工具
export class JWTUtils {
    /**
     * 生成访问令牌
     */
    static generateAccessToken(user: AuthUser): string {
        const payload: JWTPayload = {
            userId: user.id,
            email: user.email,
            type: 'access'
        };

        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_ACCESS_EXPIRATION,
            issuer: 'blog-app',
            subject: user.id
        });
    }

    /**
     * 生成刷新令牌
     */
    static generateRefreshToken(user: AuthUser): string {
        const payload: JWTPayload = {
            userId: user.id,
            email: user.email,
            type: 'refresh'
        };

        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_REFRESH_EXPIRATION,
            issuer: 'blog-app',
            subject: user.id
        });
    }

    /**
     * 验证令牌
     */
    static verifyToken(token: string): JWTPayload | null {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
            return decoded;
        } catch (error) {
            return null;
        }
    }

    /**
     * 解码令牌（不验证）
     */
    static decodeToken(token: string): JWTPayload | null {
        try {
            const decoded = jwt.decode(token) as JWTPayload;
            return decoded;
        } catch (error) {
            return null;
        }
    }

    /**
     * 生成令牌对（访问令牌和刷新令牌）
     */
    static generateTokenPair(user: AuthUser): { accessToken: string; refreshToken: string } {
        return {
            accessToken: this.generateAccessToken(user),
            refreshToken: this.generateRefreshToken(user)
        };
    }
}

// 认证中间件工具
export class AuthMiddleware {
    /**
     * 从请求头中提取 Bearer token
     */
    static extractTokenFromHeader(authHeader: string | null): string | null {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.substring(7);
    }

    /**
     * 验证用户权限
     */
    static hasPermission(userRole: string, requiredRole: string): boolean {
        const roleHierarchy = {
            'admin': 3,
            'editor': 2,
            'user': 1
        };

        const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
        const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

        return userLevel >= requiredLevel;
    }
}

// 认证错误类型
export class AuthError extends Error {
    constructor(message: string, public code: string, public status: number = 401) {
        super(message);
        this.name = 'AuthError';
    }
}

// 常用认证错误
export const AUTH_ERRORS = {
    INVALID_TOKEN: new AuthError('Invalid token', 'INVALID_TOKEN', 401),
    EXPIRED_TOKEN: new AuthError('Token expired', 'EXPIRED_TOKEN', 401),
    MISSING_TOKEN: new AuthError('Missing token', 'MISSING_TOKEN', 401),
    INSUFFICIENT_PERMISSION: new AuthError('Insufficient permission', 'INSUFFICIENT_PERMISSION', 403),
    INVALID_CREDENTIALS: new AuthError('Invalid credentials', 'INVALID_CREDENTIALS', 401),
    USER_NOT_FOUND: new AuthError('User not found', 'USER_NOT_FOUND', 404),
    EMAIL_EXISTS: new AuthError('Email already exists', 'EMAIL_EXISTS', 409),
    USERNAME_EXISTS: new AuthError('Username already exists', 'USERNAME_EXISTS', 409)
};

// 认证响应类型
export interface AuthResponse {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
}

// 登录请求类型
export interface LoginRequest {
    email: string;
    password: string;
}

// 注册请求类型
export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
}

// 刷新令牌请求类型
export interface RefreshTokenRequest {
    refreshToken: string;
} 