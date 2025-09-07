import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    include: ['src/**/*.{test,spec}.ts', 'test/**/*.{test,spec}.ts'],
    exclude: ['node_modules', 'dist', 'coverage'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/main.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env.NODE_ENV': '"test"',
    'process.env.TYPEORM_LOGGING': '"false"',
    'process.env.TYPEORM_SYNCHRONIZE': '"false"',
  },
  optimizeDeps: {
    exclude: ['@nestjs/typeorm', 'typeorm'],
  },
  // 添加TypeORM实体模拟
  plugins: [
    {
      name: 'typeorm-entities-mock',
      configResolved(config) {
        // 模拟TypeORM实体，避免在测试中导入真实实体
        config.define = {
          ...config.define,
          'process.env.TYPEORM_ENTITIES': '[]',
        };
      },
    },
  ],
  // 添加模块解析规则，避免导入实体文件
  build: {
    rollupOptions: {
      external: [
        'src/**/*.entity.ts',
        'src/**/entities/*.ts',
        'src/**/entity.ts',
      ],
    },
  },
});
