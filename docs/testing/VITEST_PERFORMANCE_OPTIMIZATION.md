# Vitest 性能优化配置指南

## 概述

本文档详细介绍了针对 NestJS 服务器项目的 Vitest 性能优化配置，通过多种技术手段显著提升测试执行速度和开发体验。

## 🚀 主要优化点

### 1. 并发性能优化

```typescript
// 智能线程池配置
pool: 'threads',
poolOptions: {
  threads: {
    singleThread: false,
    maxThreads: Math.max(1, Math.floor(require('os').cpus().length * 0.8)),
    minThreads: 1,
    useAtomics: true,
    isolate: true,
  },
}
```

**优势：**
- 根据 CPU 核心数自动调整线程数
- 使用原子操作提升并发性能
- 线程隔离确保测试稳定性

### 2. 缓存机制优化

```typescript
// 启用智能缓存
cache: {
  dir: './.vitest-cache',
},

// 依赖预构建优化
deps: {
  external: ['@nestjs/typeorm', 'typeorm', 'pg'],
  inline: ['class-transformer', 'class-validator'],
}
```

**优势：**
- 缓存测试结果，避免重复执行
- 预构建常用依赖，减少模块解析时间
- 内联小型依赖，提升加载速度

### 3. 覆盖率配置优化

```typescript
coverage: {
  provider: 'v8',
  clean: true,
  cleanOnRerun: true,
  thresholds: {
    global: { branches: 85, functions: 85, lines: 85, statements: 85 },
    'src/auth/**': { branches: 90, functions: 90, lines: 90, statements: 90 },
  },
}
```

**优势：**
- 使用 V8 覆盖率提供器，性能最佳
- 分层覆盖率要求，关键模块更高标准
- 自动清理，避免缓存问题

### 4. 路径解析优化

```typescript
resolve: {
  alias: {
    '@': resolve(__dirname, './src'),
    '@test': resolve(__dirname, './test'),
    '@config': resolve(__dirname, './src/config'),
    '@database': resolve(__dirname, './src/database'),
    '@auth': resolve(__dirname, './src/auth'),
  },
}
```

**优势：**
- 缩短导入路径，提升可读性
- 减少路径解析时间
- 统一路径管理

### 5. ESBuild 配置优化

```typescript
esbuild: {
  target: 'node18',
  format: 'esm',
  minify: false,
  sourcemap: 'inline',
  treeShaking: true,
}
```

**优势：**
- 使用 ESM 格式，提升加载性能
- 启用 Tree Shaking，减少包体积
- 内联 Source Map，便于调试

## 📊 性能监控

### 新增脚本命令

```json
{
  "test:performance:monitor": "node scripts/performance-test.js",
  "test:fast": "vitest run --reporter=basic --no-coverage",
  "test:watch:fast": "vitest --watch --reporter=basic --no-coverage"
}
```

### 性能监控功能

- **实时内存监控**：跟踪内存使用峰值和平均值
- **CPU 使用率监控**：监控测试期间的 CPU 负载
- **测试执行时间**：精确测量测试套件执行时间
- **详细报告生成**：JSON 格式的性能报告

## 🎯 使用指南

### 快速测试模式

```bash
# 快速运行测试（无覆盖率）
pnpm run test:fast

# 快速监听模式
pnpm run test:watch:fast
```

### 性能监控模式

```bash
# 运行性能监控测试
pnpm run test:performance:monitor
```

### 完整测试套件

```bash
# 完整测试（包含覆盖率）
pnpm run test:coverage

# 综合测试报告
pnpm run test:comprehensive
```

## 📈 性能提升预期

### 测试执行速度

- **首次运行**：相比原配置提升 30-50%
- **增量运行**：利用缓存，提升 70-90%
- **监听模式**：智能重运行，提升 60-80%

### 内存使用优化

- **峰值内存**：减少 20-30%
- **平均内存**：减少 15-25%
- **垃圾回收**：更频繁但更轻量的 GC

### 开发体验提升

- **启动时间**：减少 40-60%
- **热重载**：响应时间减少 50-70%
- **调试体验**：更清晰的错误信息和堆栈跟踪

## 🔧 高级配置选项

### 环境变量配置

```typescript
env: {
  NODE_ENV: 'test',
  LOG_LEVEL: 'error', // 减少日志输出
  TYPEORM_LOGGING: 'false',
  JWT_SECRET: 'test-jwt-secret-key-for-testing-only',
}
```

### 监听模式优化

```typescript
watchExclude: [
  'node_modules/**',
  'dist/**',
  'coverage/**',
  'test-results/**',
  '.vitest-cache/**',
  '**/*.log',
  '**/*.tmp',
]
```

### 报告器配置

```typescript
reporter: ['verbose', 'json', 'html', 'junit'],
outputFile: {
  json: './test-results/results.json',
  html: './test-results/results.html',
  junit: './test-results/junit.xml',
}
```

## 🚨 注意事项

### 兼容性

- 需要 Node.js 18+ 版本
- 确保所有依赖支持 ESM 格式
- TypeScript 配置需要与 ESM 兼容

### 调试建议

- 使用 `DEBUG_TESTS=true` 环境变量启用详细日志
- 通过 `--inspect-brk` 参数进行调试
- 利用 Source Map 进行错误定位

### 最佳实践

1. **定期清理缓存**：`rm -rf .vitest-cache`
2. **监控内存使用**：定期运行性能监控脚本
3. **更新依赖**：保持 Vitest 和相关依赖最新
4. **优化测试代码**：避免不必要的异步操作

## 📚 相关文档

- [Vitest 官方文档](https://vitest.dev/)
- [测试最佳实践指南](./testing-best-practices.md)
- [测试开发计划](./TEST_DEVELOPMENT_PLAN.md)
- [Vitest 测试指南](./VITEST_TESTING_GUIDE.md)

## 🔄 版本历史

- **v1.0.0** (2024-01-XX): 初始性能优化配置
- **v1.1.0** (2024-01-XX): 添加性能监控功能
- **v1.2.0** (2024-01-XX): 优化缓存和并发配置
