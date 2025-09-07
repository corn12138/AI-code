import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getEnvConfig } from '../env';

// Mock process.env
const originalEnv = process.env;

describe('环境配置', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('getEnvConfig', () => {
        it('应该返回开发环境配置', () => {
            process.env.NODE_ENV = 'development';

            const config = getEnvConfig();

            expect(config.env).toBe('development');
            expect(config.isDev).toBe(true);
            expect(config.isProd).toBe(false);
            expect(config.isTest).toBe(false);
        });

        it('应该返回生产环境配置', () => {
            process.env.NODE_ENV = 'production';

            const config = getEnvConfig();

            expect(config.env).toBe('production');
            expect(config.isDev).toBe(false);
            expect(config.isProd).toBe(true);
            expect(config.isTest).toBe(false);
        });

        it('应该返回测试环境配置', () => {
            process.env.NODE_ENV = 'test';

            const config = getEnvConfig();

            expect(config.env).toBe('test');
            expect(config.isDev).toBe(false);
            expect(config.isProd).toBe(false);
            expect(config.isTest).toBe(true);
        });

        it('应该返回默认环境配置', () => {
            delete process.env.NODE_ENV;

            const config = getEnvConfig();

            expect(config.env).toBe('development');
            expect(config.isDev).toBe(true);
        });

        it('应该包含API配置', () => {
            process.env.NODE_ENV = 'development';
            process.env.VITE_API_BASE_URL = 'http://localhost:3000';

            const config = getEnvConfig();

            expect(config.api).toBeDefined();
            expect(config.api.baseURL).toBe('http://localhost:3000');
        });

        it('应该包含应用配置', () => {
            process.env.NODE_ENV = 'development';
            process.env.VITE_APP_NAME = 'Mobile App';
            process.env.VITE_APP_VERSION = '1.0.0';

            const config = getEnvConfig();

            expect(config.app).toBeDefined();
            expect(config.app.name).toBe('Mobile App');
            expect(config.app.version).toBe('1.0.0');
        });

        it('应该包含调试配置', () => {
            process.env.NODE_ENV = 'development';
            process.env.VITE_DEBUG = 'true';

            const config = getEnvConfig();

            expect(config.debug).toBe(true);
        });

        it('应该处理布尔值环境变量', () => {
            process.env.NODE_ENV = 'development';
            process.env.VITE_ENABLE_LOGGING = 'true';
            process.env.VITE_ENABLE_ANALYTICS = 'false';

            const config = getEnvConfig();

            expect(config.enableLogging).toBe(true);
            expect(config.enableAnalytics).toBe(false);
        });

        it('应该处理数字环境变量', () => {
            process.env.NODE_ENV = 'development';
            process.env.VITE_API_TIMEOUT = '5000';
            process.env.VITE_MAX_RETRIES = '3';

            const config = getEnvConfig();

            expect(config.apiTimeout).toBe(5000);
            expect(config.maxRetries).toBe(3);
        });

        it('应该处理数组环境变量', () => {
            process.env.NODE_ENV = 'development';
            process.env.VITE_ALLOWED_ORIGINS = 'http://localhost:3000,https://example.com';

            const config = getEnvConfig();

            expect(config.allowedOrigins).toEqual([
                'http://localhost:3000',
                'https://example.com'
            ]);
        });

        it('应该处理对象环境变量', () => {
            process.env.NODE_ENV = 'development';
            process.env.VITE_FEATURE_FLAGS = '{"darkMode":true,"notifications":false}';

            const config = getEnvConfig();

            expect(config.featureFlags).toEqual({
                darkMode: true,
                notifications: false
            });
        });

        it('应该处理无效的JSON环境变量', () => {
            process.env.NODE_ENV = 'development';
            process.env.VITE_FEATURE_FLAGS = 'invalid-json';

            const config = getEnvConfig();

            expect(config.featureFlags).toBe('invalid-json');
        });

        it('应该包含默认值', () => {
            process.env.NODE_ENV = 'development';

            const config = getEnvConfig();

            expect(config.api.baseURL).toBeDefined();
            expect(config.app.name).toBeDefined();
            expect(config.app.version).toBeDefined();
        });

        it('应该验证必需的环境变量', () => {
            process.env.NODE_ENV = 'production';
            delete process.env.VITE_API_BASE_URL;

            const config = getEnvConfig();

            // 应该使用默认值或抛出错误
            expect(config.api.baseURL).toBeDefined();
        });

        it('应该处理敏感信息', () => {
            process.env.NODE_ENV = 'development';
            process.env.VITE_API_KEY = 'secret-key';

            const config = getEnvConfig();

            expect(config.api.key).toBe('secret-key');
        });

        it('应该支持多环境配置', () => {
            const environments = ['development', 'production', 'test'];

            environments.forEach(env => {
                process.env.NODE_ENV = env;
                const config = getEnvConfig();

                expect(config.env).toBe(env);
                expect(config.isDev).toBe(env === 'development');
                expect(config.isProd).toBe(env === 'production');
                expect(config.isTest).toBe(env === 'test');
            });
        });
    });

    describe('环境变量验证', () => {
        it('应该验证API配置', () => {
            process.env.NODE_ENV = 'development';
            process.env.VITE_API_BASE_URL = 'http://localhost:3000';
            process.env.VITE_API_TIMEOUT = '5000';

            const config = getEnvConfig();

            expect(config.api.baseURL).toBe('http://localhost:3000');
            expect(config.api.timeout).toBe(5000);
        });

        it('应该验证应用配置', () => {
            process.env.NODE_ENV = 'development';
            process.env.VITE_APP_NAME = 'Test App';
            process.env.VITE_APP_VERSION = '2.0.0';

            const config = getEnvConfig();

            expect(config.app.name).toBe('Test App');
            expect(config.app.version).toBe('2.0.0');
        });

        it('应该验证功能开关', () => {
            process.env.NODE_ENV = 'development';
            process.env.VITE_ENABLE_DARK_MODE = 'true';
            process.env.VITE_ENABLE_NOTIFICATIONS = 'false';

            const config = getEnvConfig();

            expect(config.enableDarkMode).toBe(true);
            expect(config.enableNotifications).toBe(false);
        });
    });

    describe('配置合并', () => {
        it('应该正确合并默认配置和环境配置', () => {
            process.env.NODE_ENV = 'development';
            process.env.VITE_API_BASE_URL = 'http://custom-api.com';

            const config = getEnvConfig();

            expect(config.api.baseURL).toBe('http://custom-api.com');
            expect(config.env).toBe('development');
        });

        it('应该保持默认配置当环境变量未设置时', () => {
            process.env.NODE_ENV = 'development';
            delete process.env.VITE_API_BASE_URL;

            const config = getEnvConfig();

            expect(config.api.baseURL).toBeDefined();
            expect(config.app.name).toBeDefined();
        });
    });
});
