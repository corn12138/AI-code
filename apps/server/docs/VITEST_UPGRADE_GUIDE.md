# 🧪 Vitest 3.x 升级指南

## 概述

本项目已成功升级到 Vitest 3.x，集成了最新的测试特性和性能优化。

## 🚀 新增功能

### 1. 自定义测试插件

**文件**: `test/plugins/vitest-enhancements.ts`

- ✅ 性能监控
- ✅ 内存跟踪  
- ✅ 自定义匹配器
- ✅ 测试分组

**使用方法**:
```typescript
// vitest.config.ts 中已自动配置
expect(email).toBeValidEmail();
expect(uuid).toBeValidUUID();
expect(number).toBeWithinRange(1, 100);
```

### 2. 自定义测试报告器

**文件**: `test/reporters/custom-reporter.ts`

生成多格式报告：
- 📊 HTML 交互式报告
- 📝 Markdown 报告
- 📈 性能分析报告
- ⚡ JSON 详细数据

### 3. 增强的测试数据生成器

**文件**: `test/factories/test-data-generator.ts`

```typescript
import { generateUser, generateTestData } from '@test/factories/test-data-generator';

// 生成单个用户
const user = generateUser({ email: 'test@example.com' });

// 批量生成测试数据
const testData = generateTestData({
  users: 10,
  articles: 20,
  tags: 5
});
```

## 📊 测试脚本

### 基础测试
```bash
# 运行所有测试
pnpm test

# 监听模式
pnpm test:watch

# UI 模式
pnpm test:ui
```

### 增强测试
```bash
# 增强报告模式
pnpm test:enhanced

# 内存基准测试
pnpm test:benchmark:memory

# 压力测试
pnpm test:stress

# 测试矩阵（全面测试）
pnpm test:matrix

# 质量检查（覆盖率 + 性能 + 报告）
pnpm test:quality
```

### 分类测试
```bash
# 单元测试
pnpm test:unit

# 集成测试
pnpm test:integration

# E2E 测试
pnpm test:e2e

# API 测试
pnpm test:api

# 性能测试
pnpm test:performance
```

### 覆盖率测试
```bash
# 生成覆盖率报告
pnpm test:coverage

# 单元测试覆盖率
pnpm test:coverage:unit

# 集成测试覆盖率
pnpm test:coverage:integration

# CI 覆盖率
pnpm test:coverage:ci
```

### 报告生成
```bash
# 生成详细报告
pnpm test:report:generate

# 完整报告（测试 + 覆盖率 + 生成）
pnpm test:report:full

# 打开最新报告
pnpm test:report:open
```

## 🔧 配置优化

### 性能配置
- **线程池**: 自动配置为 CPU 核心数的 80%
- **内存优化**: V8 覆盖率提供者
- **缓存策略**: 智能依赖缓存
- **并发控制**: 最大并发 5 个测试

### 覆盖率阈值
- **全局**: 80% (分支、函数、行、语句)
- **认证模块**: 85% (高安全要求)
- **数据库模块**: 85% (关键基础设施)
- **移动端模块**: 80% (业务逻辑)

### 报告格式
- **控制台**: verbose 模式
- **JSON**: 机器可读数据
- **HTML**: 交互式查看
- **JUnit**: CI/CD 集成
- **自定义**: 增强分析报告

## 📈 性能监控

### 实时监控
- ⏱️ 测试执行时间跟踪
- 💾 内存使用监控
- 🔍 慢测试识别
- 📊 性能趋势分析

### 性能基线
- 单个测试: < 500ms
- 总执行时间: < 30s
- 内存使用: < 100MB
- 成功率: > 95%

## 🚨 故障排除

### 常见问题

1. **TypeScript 类型错误**
   ```bash
   # 清理缓存重新运行
   pnpm test:clean && pnpm test
   ```

2. **内存不足**
   ```bash
   # 使用内存监控模式
   pnpm test:benchmark:memory
   ```

3. **测试超时**
   ```typescript
   // 在测试中增加超时
   test('slow test', async () => {
     // ...
   }, 60000); // 60秒超时
   ```

4. **Mock 问题**
   ```typescript
   // 使用全局 mock 重置
   beforeEach(() => {
     vi.clearAllMocks();
     vi.resetAllMocks();
     vi.restoreAllMocks();
   });
   ```

### 调试命令
```bash
# 调试单元测试
pnpm test:debug:unit

# 调试集成测试
pnpm test:debug:integration

# 调试 E2E 测试
pnpm test:debug:e2e
```

## 🔄 CI/CD 集成

### GitHub Actions
```yaml
- name: Run Tests
  run: |
    pnpm test:ci
    pnpm test:coverage:ci
    pnpm test:report:generate

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/clover.xml,./coverage/lcov.info
```

### 本地 CI 模拟
```bash
# 模拟 CI 环境
pnpm test:ci
```

## 📚 最佳实践

### 1. 测试结构
```typescript
describe('UserService', () => {
  beforeEach(() => {
    // 设置测试环境
  });

  testGroup('用户创建', () => {
    it('should create user successfully', async () => {
      // 测试逻辑
    });
  });
});
```

### 2. Mock 策略
```typescript
// 使用工厂函数创建 mock
const mockRepository = createMockRepository<User>();

// 使用测试数据生成器
const user = generateUser({ email: 'test@example.com' });
```

### 3. 性能测试
```typescript
it('should perform within acceptable time', async () => {
  const { duration } = await PerformanceTestHelper.measureExecutionTime(async () => {
    await service.heavyOperation();
  });
  
  expect(duration).toBeLessThan(1000);
});
```

## 📊 报告查看

### HTML 报告
- 位置: `test-results/test-report.html`
- 特性: 交互式界面、实时过滤、性能图表

### 覆盖率报告
- 位置: `coverage/index.html`
- 格式: HTML, JSON, LCOV, Clover

### 性能报告
- 位置: `test-results/performance-report.json`
- 内容: 执行时间、内存使用、性能建议

## 🎯 升级收益

- ⚡ **性能提升**: 30-50% 更快的测试执行
- 📊 **更好的报告**: 多格式、交互式报告
- 🔍 **深度分析**: 性能监控和内存跟踪
- 🛠️ **开发体验**: 更好的 TypeScript 支持
- 🚀 **CI/CD 优化**: 更快的流水线执行

---

*文档更新时间: ${new Date().toLocaleString()}*
*Vitest 版本: 3.x*
*项目版本: 最新*

