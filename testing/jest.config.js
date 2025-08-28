/** @type {import('jest').Config} */
module.exports = {
    displayName: 'AI-Code Monorepo Tests',

    // 项目配置
    projects: [
        {
            displayName: 'Blog App',
            testMatch: ['<rootDir>/apps/blog/**/*.{test,spec}.{js,jsx,ts,tsx}'],
            setupFilesAfterEnv: ['<rootDir>/testing/setup/blog.setup.js'],
            testEnvironment: 'jsdom',
            moduleNameMapping: {
                '^@/(.*)$': '<rootDir>/apps/blog/src/$1',
                '^@shared/(.*)$': '<rootDir>/shared/$1',
            },
            collectCoverageFrom: [
                'apps/blog/src/**/*.{js,jsx,ts,tsx}',
                '!apps/blog/src/**/*.d.ts',
                '!apps/blog/src/**/*.stories.{js,jsx,ts,tsx}',
            ],
        },
        {
            displayName: 'Server App',
            testMatch: ['<rootDir>/apps/server/**/*.{test,spec}.{js,ts}'],
            setupFilesAfterEnv: ['<rootDir>/testing/setup/server.setup.js'],
            testEnvironment: 'node',
            moduleNameMapping: {
                '^@/(.*)$': '<rootDir>/apps/server/src/$1',
                '^@shared/(.*)$': '<rootDir>/shared/$1',
            },
            collectCoverageFrom: [
                'apps/server/src/**/*.{js,ts}',
                '!apps/server/src/**/*.d.ts',
                '!apps/server/src/**/*.spec.{js,ts}',
            ],
        },
        {
            displayName: 'Lowcode App',
            testMatch: ['<rootDir>/apps/lowcode/**/*.{test,spec}.{js,jsx,ts,tsx}'],
            setupFilesAfterEnv: ['<rootDir>/testing/setup/lowcode.setup.js'],
            testEnvironment: 'jsdom',
            moduleNameMapping: {
                '^@/(.*)$': '<rootDir>/apps/lowcode/src/$1',
                '^@shared/(.*)$': '<rootDir>/shared/$1',
            },
            collectCoverageFrom: [
                'apps/lowcode/src/**/*.{js,jsx,ts,tsx}',
                '!apps/lowcode/src/**/*.d.ts',
            ],
        },
        {
            displayName: 'Mobile App',
            testMatch: ['<rootDir>/apps/mobile/**/*.{test,spec}.{js,jsx,ts,tsx}'],
            setupFilesAfterEnv: ['<rootDir>/testing/setup/mobile.setup.js'],
            testEnvironment: 'jsdom',
            preset: '@umijs/max/jest',
            moduleNameMapping: {
                '^@/(.*)$': '<rootDir>/apps/mobile/src/$1',
                '^@shared/(.*)$': '<rootDir>/shared/$1',
            },
            collectCoverageFrom: [
                'apps/mobile/src/**/*.{js,jsx,ts,tsx}',
                '!apps/mobile/src/**/*.d.ts',
            ],
        },
        {
            displayName: 'Shared Libraries',
            testMatch: ['<rootDir>/shared/**/*.{test,spec}.{js,jsx,ts,tsx}'],
            setupFilesAfterEnv: ['<rootDir>/testing/setup/shared.setup.js'],
            testEnvironment: 'jsdom',
            moduleNameMapping: {
                '^@shared/(.*)$': '<rootDir>/shared/$1',
            },
            collectCoverageFrom: [
                'shared/**/*.{js,jsx,ts,tsx}',
                '!shared/**/*.d.ts',
                '!shared/**/dist/**',
                '!shared/**/docs/**',
            ],
        },
    ],

    // 全局配置
    coverageDirectory: '<rootDir>/testing/reports/coverage',
    coverageReporters: ['text', 'lcov', 'html', 'json'],
    collectCoverageFrom: [
        'apps/**/*.{js,jsx,ts,tsx}',
        'shared/**/*.{js,jsx,ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/dist/**',
        '!**/build/**',
        '!**/.next/**',
    ],

    // 覆盖率阈值
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 75,
            lines: 80,
            statements: 80,
        },
        'apps/blog/': {
            branches: 75,
            functions: 80,
            lines: 85,
            statements: 85,
        },
        'apps/server/': {
            branches: 80,
            functions: 85,
            lines: 90,
            statements: 90,
        },
    },

    // 测试超时
    testTimeout: 30000,

    // 忽略的模式
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/.next/',
        '<rootDir>/dist/',
        '<rootDir>/build/',
    ],

    // 模块文件扩展名
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],

    // 转换配置
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
            presets: [
                ['@babel/preset-env', { targets: { node: 'current' } }],
                ['@babel/preset-react', { runtime: 'automatic' }],
                '@babel/preset-typescript',
            ],
        }],
        '^.+\\.css$': 'jest-transform-css',
    },

    // 模块名映射（全局）
    moduleNameMapping: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/testing/__mocks__/fileMock.js',
    },

    // 全局设置文件
    setupFilesAfterEnv: ['<rootDir>/testing/setup/global.setup.js'],

    // 测试结果报告器
    reporters: [
        'default',
        ['jest-html-reporters', {
            publicPath: './testing/reports/html',
            filename: 'jest-report.html',
            expand: true,
        }],
        ['jest-junit', {
            outputDirectory: './testing/reports/junit',
            outputName: 'junit.xml',
        }],
    ],

    // 详细输出
    verbose: true,

    // 检测泄漏
    detectLeaks: true,

    // 强制退出
    forceExit: true,

    // 最大工作进程数
    maxWorkers: '50%',
};
