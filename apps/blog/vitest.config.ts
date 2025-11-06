import react from '@vitejs/plugin-react'
import path from 'path'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    // 基础配置
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],

    // 性能优化配置
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
        isolate: true,
      },
    },

    // 超时配置
    testTimeout: 10000,
    hookTimeout: 10000,

    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        ...(configDefaults.coverage.exclude || []),
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '.next/',
        'dist/',
        'build/',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },

    // 测试执行配置
    maxConcurrency: 2,
    retry: 2,

    // 报告配置
    reporters: ['verbose', 'html', 'json'],
    outputFile: {
      html: './test-results/index.html',
      json: './test-results/results.json',
    },

    // 包含和排除规则
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'src/__tests__/**/*.{js,ts,jsx,tsx}',
    ],
    exclude: [
      ...configDefaults.exclude,
      'node_modules',
      '.next',
      'dist',
      'build',
      'coverage',
      '**/*.d.ts',
      'src/app/**/__tests__/**',
      'src/test/**'
    ],

    // 缓存配置
    cache: {
      dir: '.vitest',
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../../shared'),
      '@components': path.resolve(__dirname, './src/components'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@actions': path.resolve(__dirname, './src/actions'),
      '@models': path.resolve(__dirname, './src/models'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@corn12138/hooks': path.resolve(__dirname, '../../shared/hooks/src'),
    },
  },

  // 构建配置
  build: {
    target: 'esnext',
    minify: false,
    sourcemap: true,
  },

  // 环境变量
  define: {
    'process.env.NODE_ENV': '"test"',
  },

  // 依赖优化
  optimizeDeps: {
    exclude: ['@shared/hooks'],
    include: ['react', 'react-dom'],
  },
})