/**
 * 数据库默认配置
 * 统一管理所有数据库连接的默认值
 * 注意：敏感信息应通过环境变量提供，不要硬编码
 */
export const DATABASE_DEFAULTS = {
    HOST: 'localhost',
    PORT: 6543,
    USER: 'app_user',
    PASSWORD: '', // 密码必须通过环境变量 DATABASE_PASSWORD 提供
    NAME: 'blogdb',
    LOGGING: true,
    SSL: false,
} as const;

