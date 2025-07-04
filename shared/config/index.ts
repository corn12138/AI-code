const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const config = {
    api: {
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
        timeout: 30000
    },
    auth: {
        tokenKey: 'auth-token',
        refreshTokenKey: 'refresh-token',
        sessionTimeout: 24 * 60 * 60 * 1000, // 24小时
    },
    app: {
        name: 'AI-Code Platform',
        version: process.env.npm_package_version || '1.0.0',
        isDevelopment,
        isProduction,
    },
    blog: {
        postsPerPage: 10,
        maxTagsPerPost: 5,
    },
    lowcode: {
        maxComponentsPerPage: 50,
        autoSaveInterval: 30000, // 30秒
    }
}

export default config; 