/// <reference types="vitest" />
import { resolve } from 'path';
import { configDefaults, defineConfig } from 'vitest/config';
export default defineConfig({

  test: {
    // ===== 核心配置 =====
    globals: true,
    environment: 'node',

    // 测试池配置 - 使用最新的 Vitest 3.x 特性
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: Math.max(1, Math.floor(require('os').cpus().length * 0.8)),
        minThreads: 1,
        useAtomics: true,
        isolate: true,
      },
    },

    // 测试文件匹配 - 更精确的模式
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: [
      ...configDefaults.exclude,
      'node_modules',
      'dist',
      'coverage',
      'test-results',
      '**/*.d.ts',
      '**/migrations/**',
      '**/scripts/**',
      '**/*.config.*',
      '**/index.ts',
    ],

    // 测试环境设置
    setupFiles: ['./test/setup.ts', './test/mocks/global-mocks.ts'],
    globalSetup: ['./test/global-setup.ts'],

    // 超时配置
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 10000,

    // ===== 覆盖率配置 - 使用最新的 v8 提供者 =====
    coverage: {
      provider: 'v8',
      reporter: [
        'text',
        'text-summary',
        'json',
        'json-summary',
        'html',
        'lcov',
        'clover',
        'cobertura'
      ],
      reportsDirectory: './coverage',
      clean: true,
      cleanOnRerun: true,
      all: true, // 包含未测试的文件
      skipFull: false, // 显示完整覆盖率

      // 排除文件
      exclude: [
        ...(configDefaults.coverage.exclude || []),
        'node_modules/',
        'dist/',
        'coverage/',
        'test/',
        'test-results/',
        '.vitest-cache/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/main.ts',
        '**/index.ts',
        '**/migrations/**',
        '**/scripts/**',
        '**/*.entity.ts',
        '**/*.dto.ts',
        '**/*.interface.ts',
        '**/*.enum.ts',
        '**/*.constant.ts',
        '**/*.module.ts',
        '**/*.guard.ts',
        '**/*.decorator.ts',
        '**/*.strategy.ts',
        '**/*.filter.ts',
        '**/*.interceptor.ts',
        '**/*.pipe.ts',
        '**/*.middleware.ts',
      ],

      // 覆盖率阈值
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        // 关键模块更高要求
        'src/auth/**': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        'src/database/**': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        'src/mobile/**': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },

    // ===== 报告器配置 - 多格式输出 =====
    reporters: [
      'verbose',
      'json',
      'html',
      'junit',
    ],
    outputFile: {
      json: './test-results/results.json',
      html: './test-results/results.html',
      junit: './test-results/junit.xml',
    },

    // ===== 监听模式配置 =====
    watch: false,
    watchExclude: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'test-results/**',
      '.vitest-cache/**',
      '**/*.log',
      '**/*.tmp',
    ],

    // ===== 依赖配置 =====
    deps: {
      external: [
        '@nestjs/typeorm',
        'typeorm',
        'pg',
        'bcrypt',
        'bcryptjs',
        'reflect-metadata',
      ],
      inline: [
        'class-transformer',
        'class-validator',
      ],
    },

    // ===== 环境变量 =====
    env: {
      NODE_ENV: 'test',
      TYPEORM_LOGGING: 'false',
      TYPEORM_SYNCHRONIZE: 'false',
      DATABASE_URL: 'postgresql://test_user:test_password@localhost:5432/test_db',
      JWT_SECRET: 'test-jwt-secret-key-for-testing-only',
      JWT_ACCESS_EXPIRATION: '15m',
      JWT_REFRESH_EXPIRATION: '7d',
      LOG_LEVEL: 'error',
    },

    // ===== 性能监控配置 =====
    passWithNoTests: true,
    logHeapUsage: true,
    silent: false,
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,

    // 新增：测试重试配置
    retry: 2,

    // 新增：并发测试配置
    maxConcurrency: 5,

    // 新增：测试隔离
    isolate: true,
  },

  // ===== 路径解析 =====
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@test': resolve(__dirname, './test'),
      '@shared': resolve(__dirname, '../../shared'),
      '@config': resolve(__dirname, './src/config'),
      '@common': resolve(__dirname, './src/common'),
      '@database': resolve(__dirname, './src/database'),
      '@auth': resolve(__dirname, './src/auth'),
      '@mobile': resolve(__dirname, './src/mobile'),
      '@user': resolve(__dirname, './src/user'),
      '@article': resolve(__dirname, './src/article'),
      '@tag': resolve(__dirname, './src/tag'),
    },
  },

  // ===== 依赖优化 =====
  optimizeDeps: {
    include: [
      'reflect-metadata',
      'class-transformer',
      'class-validator',
      '@nestjs/common',
      '@nestjs/core',
    ],
    exclude: [
      '@nestjs/typeorm',
      'typeorm',
      'pg',
      'bcrypt',
      'bcryptjs',
      'pg-native',
      'sqlite3',
      'mysql2',
      'mysql',
      'better-sqlite3',
    ],
  },

  // ===== 全局常量 =====
  define: {
    'process.env.NODE_ENV': '"test"',
    'process.env.TYPEORM_LOGGING': '"false"',
    'process.env.TYPEORM_SYNCHRONIZE': '"false"',
    'process.env.JWT_SECRET': '"test-jwt-secret-key-for-testing-only"',
    'process.env.JWT_ACCESS_EXPIRATION': '"15m"',
    'process.env.JWT_REFRESH_EXPIRATION': '"7d"',
    'process.env.LOG_LEVEL': '"error"',
    '__TEST__': 'true',
    '__VITEST__': 'true',
  },

  // ===== ESBuild 配置 =====
  esbuild: {
    target: 'node18',
    format: 'esm',
    minify: false,
    sourcemap: 'inline',
    treeShaking: true,
  },

  // ===== 构建配置 =====
  build: {
    target: 'node18',
    minify: false,
    sourcemap: true,
    rollupOptions: {
      external: [
        'pg-native',
        'sqlite3',
        'mysql2',
        'mysql',
        'better-sqlite3',
        '@nestjs/typeorm',
        'typeorm',
        'pg',
        'bcrypt',
        'bcryptjs',
        'reflect-metadata',
      ],
      output: {
        format: 'esm',
        preserveModules: true,
      },
    },
  },

  // ===== 服务器配置 =====
  server: {
    fs: {
      allow: ['..', '../..'],
    },
    watch: {
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
        '**/test-results/**',
        '**/.vitest-cache/**',
      ],
    },
  },
});