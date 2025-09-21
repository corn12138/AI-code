import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        css: true,
        // 添加测试超时配置
        testTimeout: 10000,
        // 添加钩子超时配置
        hookTimeout: 10000,
        // 添加测试文件匹配模式
        include: [
            'src/stores/__tests__/authStore.test.ts'
        ],
        // 添加排除文件模式
        exclude: [
            'node_modules/**',
            'dist/**',
            'coverage/**',
            '**/*.d.ts',
            '**/*.config.*',
            '**/.umi/**',
            '**/public/**',
            '**/cypress/**',
            '**/playwright/**'
        ],
        // 添加测试报告配置
        reporters: ['verbose', 'html'],
        // 添加输出文件配置
        outputFile: {
            html: './coverage/test-report.html',
            json: './coverage/test-results.json'
        },
        // 添加并行测试配置
        pool: 'forks',
        poolOptions: {
            forks: {
                singleFork: true
            }
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov', 'cobertura'],
            exclude: [
                'node_modules/',
                'src/test/',
                '**/*.d.ts',
                '**/*.config.*',
                '**/coverage/**',
                '**/dist/**',
                '**/.umi/**',
                '**/public/**',
                '**/*.stories.{js,jsx,ts,tsx}',
                '**/*.test.{js,jsx,ts,tsx}',
                '**/*.spec.{js,jsx,ts,tsx}',
                '**/__tests__/**',
                '**/__mocks__/**',
                '**/test-utils/**',
                '**/stories/**',
                '**/storybook/**'
            ],
            // 添加覆盖率输出目录
            reportsDirectory: './coverage',
            // 添加覆盖率阈值配置
            thresholds: {
                global: {
                    branches: 80,
                    functions: 80,
                    lines: 80,
                    statements: 80,
                },
                // 添加特定文件的覆盖率阈值
                './src/components/**/*.{ts,tsx}': {
                    branches: 85,
                    functions: 85,
                    lines: 85,
                    statements: 85,
                },
                './src/hooks/**/*.{ts,tsx}': {
                    branches: 90,
                    functions: 90,
                    lines: 90,
                    statements: 90,
                },
                './src/utils/**/*.{ts,tsx}': {
                    branches: 95,
                    functions: 95,
                    lines: 95,
                    statements: 95,
                }
            },
            // 添加覆盖率收集配置
            all: false,
            // 添加覆盖率水印配置
            watermarks: {
                statements: [50, 80],
                branches: [50, 80],
                functions: [50, 80],
                lines: [50, 80]
            }
        },
        // 添加环境变量配置
        env: {
            NODE_ENV: 'test',
            VITEST: 'true'
        },
        // 添加测试隔离配置
        isolate: true,
        // 添加测试重试配置
        retry: 1,
        // 添加测试并发配置
        maxConcurrency: 5,
        // 添加测试顺序配置
        sequence: {
            shuffle: false
        }
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            '@shared': resolve(__dirname, '../../shared'),
            '@components': resolve(__dirname, './src/components'),
            '@pages': resolve(__dirname, './src/pages'),
            '@hooks': resolve(__dirname, './src/hooks'),
            '@utils': resolve(__dirname, './src/utils'),
            '@services': resolve(__dirname, './src/services'),
            '@stores': resolve(__dirname, './src/stores'),
            '@types': resolve(__dirname, './src/types'),
            '@config': resolve(__dirname, './src/config'),
            '@api': resolve(__dirname, './src/api'),
            '@router': resolve(__dirname, './src/router'),
        },
        extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
    },
    // 添加构建配置
    build: {
        target: 'esnext',
        minify: false,
        sourcemap: true
    },
    // 添加优化配置
    optimizeDeps: {
        include: ['react', 'react-dom', 'antd-mobile']
    }
});
