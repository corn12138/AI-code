/// <reference types="vitest" />
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 全局配置
    globals: true,
    environment: 'node',

    // 测试文件匹配模式
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: [
      'node_modules',
      'dist',
      'coverage',
      '**/*.d.ts',
      '**/migrations/**',
      '**/scripts/**',
    ],

    // 测试环境设置
    setupFiles: [
      './test/setup.ts',
    ],

    // 测试超时配置
    testTimeout: 30000,
    hookTimeout: 30000,

    // 并发配置
    threads: true,
    maxThreads: 4,
    minThreads: 1,

    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/main.ts',
        '**/migrations/**',
        '**/scripts/**',
        '**/*.entity.ts',
        '**/*.dto.ts',
        '**/*.interface.ts',
        '**/*.enum.ts',
        '**/*.constant.ts',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },

    // 报告器配置
    reporter: ['verbose', 'json', 'html'],
    outputFile: {
      json: './test-results/results.json',
      html: './test-results/results.html',
    },

    // 监听模式配置
    watch: false,
    watchExclude: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'test-results/**',
    ],

    // 环境变量
    env: {
      NODE_ENV: 'test',
      TYPEORM_LOGGING: 'false',
      TYPEORM_SYNCHRONIZE: 'false',
      DATABASE_URL: 'postgresql://test_user:test_password@localhost:5432/test_db',
    },
  },

  // 路径解析
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@test': resolve(__dirname, './test'),
      '@shared': resolve(__dirname, '../../shared'),
    },
  },

  // 依赖优化
  optimizeDeps: {
    exclude: [
      '@nestjs/typeorm',
      'typeorm',
      'pg',
      'bcrypt',
      'bcryptjs',
    ],
  },

  // 定义全局常量
  define: {
    'process.env.NODE_ENV': '"test"',
    'process.env.TYPEORM_LOGGING': '"false"',
    'process.env.TYPEORM_SYNCHRONIZE': '"false"',
    'process.env.JWT_SECRET': '"test-jwt-secret"',
    'process.env.JWT_ACCESS_EXPIRATION': '"15m"',
    'process.env.JWT_REFRESH_EXPIRATION': '"7d"',
  },

  // ESBuild 配置 - 关键配置来处理 CommonJS
  esbuild: {
    target: 'node18',
    format: 'esm', // 强制使用 ESM 格式
  },

  // 构建配置
  build: {
    target: 'node18',
    rollupOptions: {
      external: [
        'pg-native',
        'sqlite3',
        'mysql2',
        'mysql',
        'better-sqlite3',
      ],
    },
  },
});