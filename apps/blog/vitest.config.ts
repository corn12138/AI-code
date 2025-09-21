import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
        cache: {
        dir: ".vitest",
      },
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // 优化测试性能
    pool: 'forks', // 使用fork模式提高性能
    poolOptions: {
      forks: {
        singleFork: true, // 单进程模式减少开销
      },
    },
    // 减少测试超时时间
    testTimeout: 10000,
    hookTimeout: 10000,
    // 优化覆盖率收集
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
      ],
      // 设置覆盖率阈值
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
    // 优化测试执行
    maxConcurrency: 1, // 减少并发以避免资源竞争
    // 优化报告输出
    reporters: ['verbose', 'html'],
    outputFile: {
      html: './test-results/index.html',
    },
    // 添加包含和排除规则
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'src/__tests__/**/*.{js,ts,jsx,tsx}',
    ],
    exclude: [
      'node_modules',
      '.next',
      'dist',
      'build',
      'coverage',
      '**/*.d.ts',
      'src/app/**/__tests__/**',
      'src/test/**'
    ],
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
  // 优化构建性能
  build: {
    target: 'esnext',
    minify: false,
  },
  // 添加环境变量
  define: {
    'process.env.NODE_ENV': '"test"',
  },
  // 优化依赖处理
  optimizeDeps: {
    exclude: ['@shared/hooks'],
  },
})
