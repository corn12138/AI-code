# Vitest 测试框架完整指南

## 📋 概述

本项目采用 **Vitest** 作为统一的测试框架，实现了严格标准的测试体系，包括单元测试、集成测试、端到端测试和性能测试。

## 🏗️ 测试架构

### 测试类型分层

```
测试金字塔
    ┌─────────────┐
    │   E2E 测试   │  ← 少量，高价值
    ├─────────────┤
    │  集成测试    │  ← 适量，关键路径
    ├─────────────┤
    │  单元测试    │  ← 大量，快速反馈
    └─────────────┘
```

### 目录结构

```
apps/server/
├── src/                          # 源代码
│   ├── **/*.spec.ts             # 单元测试（与源码同目录）
│   ├── user/
│   │   ├── user.service.ts
│   │   ├── user.service.spec.ts  # 用户服务单元测试
│   │   ├── user.controller.ts
│   │   └── user.controller.spec.ts
│   └── mobile/
│       ├── mobile.service.ts
│       ├── mobile.service.spec.ts
│       ├── mobile.controller.ts
│       └── mobile.controller.spec.ts
├── test/                         # 测试配置和工具
│   ├── setup.ts                 # 全局测试设置
│   ├── test-config.ts           # 测试配置
│   ├── utils/
│   │   ├── test-helpers.ts      # 测试辅助工具
│   │   └── test-reporter.ts     # 测试报告生成器
│   ├── factories/
│   │   └── index.ts             # 测试数据工厂
│   ├── integration/             # 集成测试
│   │   └── *.integration.spec.ts
│   ├── e2e/                     # 端到端测试
│   │   └── *.e2e-spec.ts
│   └── performance/             # 性能测试
│       └── *.performance.spec.ts
├── vitest.config.ts             # Vitest 配置
└── scripts/
    └── run-comprehensive-tests.js  # 综合测试运行器
```

## 🚀 快速开始

### 安装依赖

```bash
# 项目依赖已包含所有必要的测试工具
pnpm install
```

### 运行测试

```bash
# 运行所有测试
npm test

# 运行特定类型的测试
npm run test:unit          # 单元测试
npm run test:integration   # 集成测试
npm run test:e2e          # 端到端测试
npm run test:performance  # 性能测试

# 运行特定模块的测试
npm run test:mobile       # 移动端模块测试
npm run test:user         # 用户模块测试
npm run test:auth         # 认证模块测试

# 生成覆盖率报告
npm run test:coverage
npm run test:coverage:report  # 生成并打开 HTML 报告

# 运行综合测试套件
npm run test:comprehensive
```

### 监听模式

```bash
# 监听文件变化，自动运行测试
npm run test:watch

# 使用 UI 界面
npm run test:ui
```

## 📝 编写测试

### 1. 单元测试示例

```typescript
// src/user/user.service.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { createMockRepository } from '../../test/utils/test-helpers';
import { factories } from '../../test/factories';

describe('UserService', () => {
  let service: UserService;
  let mockRepository: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    mockRepository = createMockRepository<User>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('应该成功创建用户', async () => {
      // Arrange
      const createUserDto = factories.user.create();
      const savedUser = { ...createUserDto, id: 'user-id-123' };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(savedUser);
      mockRepository.save.mockResolvedValue(savedUser);

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(mockRepository.save).toHaveBeenCalledWith(savedUser);
      expect(result).toEqual(savedUser);
    });

    it('应该在邮箱已存在时抛出异常', async () => {
      // Arrange
      const createUserDto = factories.user.create();
      const existingUser = factories.user.create({ email: createUserDto.email });

      mockRepository.findOne.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.create(createUserDto)).rejects.toThrow(
        'Email or username already exists'
      );
    });
  });
});
```

### 2. 集成测试示例

```typescript
// test/integration/mobile.integration.spec.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';

import { MobileModule } from '../../src/mobile/mobile.module';
import { testDatabaseConfig } from '../test-config';
import { ApiTestHelper, DatabaseTestHelper } from '../utils/test-helpers';

describe('Mobile Integration Tests', () => {
  let app: INestApplication;
  let apiHelper: ApiTestHelper;
  let dbHelper: DatabaseTestHelper;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDatabaseConfig),
        MobileModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    apiHelper = new ApiTestHelper(app);
    dbHelper = new DatabaseTestHelper(app.get('DataSource'));
  });

  beforeEach(async () => {
    await dbHelper.clearDatabase();
  });

  it('应该成功创建移动端文档', async () => {
    const createDto = {
      title: 'Test Document',
      content: 'Test content',
      author: 'Test Author',
      category: 'frontend',
    };

    const response = await apiHelper.publicRequest('post', '/mobile/docs')
      .send(createDto)
      .expect(201);

    expect(response.body).toMatchObject(createDto);
    expect(response.body).toHaveProperty('id');
  });
});
```

### 3. 端到端测试示例

```typescript
// test/e2e/mobile.e2e-spec.ts
describe('Mobile E2E Tests', () => {
  it('应该支持完整的 CRUD 操作流程', async () => {
    // 1. 创建文档
    const createResponse = await request(app.getHttpServer())
      .post('/mobile/docs')
      .send(createDto)
      .expect(201);

    const docId = createResponse.body.id;

    // 2. 读取文档
    await request(app.getHttpServer())
      .get(`/mobile/docs/${docId}`)
      .expect(200);

    // 3. 更新文档
    await request(app.getHttpServer())
      .put(`/mobile/docs/${docId}`)
      .send(updateDto)
      .expect(200);

    // 4. 删除文档
    await request(app.getHttpServer())
      .delete(`/mobile/docs/${docId}`)
      .expect(200);

    // 5. 验证删除
    await request(app.getHttpServer())
      .get(`/mobile/docs/${docId}`)
      .expect(404);
  });
});
```

### 4. 性能测试示例

```typescript
// test/performance/mobile.performance.spec.ts
describe('Mobile Performance Tests', () => {
  it('应该在合理时间内创建文档', async () => {
    const { duration } = await PerformanceTestHelper.measureExecutionTime(async () => {
      await request(app.getHttpServer())
        .post('/mobile/docs')
        .send(doc)
        .expect(201);
    });

    // 单个文档创建应该在500ms内完成
    expect(duration).toBeLessThan(500);
  });

  it('应该处理并发请求', async () => {
    const { results } = await PerformanceTestHelper.concurrentTest(
      async () => {
        const response = await request(app.getHttpServer())
          .post('/mobile/docs')
          .send(doc);
        return response.status;
      },
      20, // 并发数
      50  // 总请求数
    );

    // 所有请求都应该成功
    results.forEach(status => {
      expect(status).toBe(201);
    });
  });
});
```

## 🛠️ 测试工具和辅助函数

### 测试数据工厂

```typescript
import { factories } from '../../test/factories';

// 创建测试用户
const user = factories.user.create();
const admin = factories.user.createAdmin();
const users = factories.user.createMany(5);

// 创建测试文档
const doc = factories.mobileDoc.create();
const frontendDoc = factories.mobileDoc.createFrontendDoc();
const hotDoc = factories.mobileDoc.createHotDoc();
```

### Mock 工具

```typescript
import { createMockRepository, createMockDataSource } from '../../test/utils/test-helpers';

// 创建 Mock 仓库
const mockRepository = createMockRepository<User>();

// 创建 Mock 数据源
const mockDataSource = createMockDataSource();
```

### API 测试工具

```typescript
import { ApiTestHelper } from '../../test/utils/test-helpers';

const apiHelper = new ApiTestHelper(app);

// 发送认证请求
await apiHelper.authenticatedRequest('get', '/users/profile');

// 发送管理员请求
await apiHelper.adminRequest('post', '/admin/users');

// 发送公开请求
await apiHelper.publicRequest('get', '/health');
```

### 性能测试工具

```typescript
import { PerformanceTestHelper } from '../../test/utils/test-helpers';

// 测量执行时间
const { duration } = await PerformanceTestHelper.measureExecutionTime(async () => {
  // 执行操作
});

// 并发测试
const { results } = await PerformanceTestHelper.concurrentTest(
  async () => { /* 操作 */ },
  10, // 并发数
  100 // 总次数
);
```

## 📊 测试覆盖率

### 覆盖率目标

- **全局覆盖率**: ≥ 80%
- **服务层覆盖率**: ≥ 90%
- **控制器层覆盖率**: ≥ 85%

### 覆盖率配置

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        './src/services/**/*.ts': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
  },
});
```

### 查看覆盖率报告

```bash
# 生成覆盖率报告
npm run test:coverage

# 生成并打开 HTML 报告
npm run test:coverage:report
```

## 🎯 测试最佳实践

### 1. 测试命名规范

```typescript
describe('UserService', () => {
  describe('create', () => {
    it('应该成功创建用户', () => {});
    it('应该在邮箱已存在时抛出异常', () => {});
    it('应该在密码格式错误时抛出异常', () => {});
  });
});
```

### 2. AAA 模式 (Arrange-Act-Assert)

```typescript
it('应该成功创建用户', async () => {
  // Arrange - 准备测试数据
  const createUserDto = { email: 'test@example.com' };
  mockRepository.save.mockResolvedValue(savedUser);

  // Act - 执行被测试的操作
  const result = await service.create(createUserDto);

  // Assert - 验证结果
  expect(result).toEqual(savedUser);
  expect(mockRepository.save).toHaveBeenCalledWith(createUserDto);
});
```

### 3. Mock 策略

```typescript
// ✅ 好的做法：Mock 外部依赖
vi.mock('bcryptjs', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

// ✅ 好的做法：使用工厂创建 Mock
const mockRepository = createMockRepository<User>();

// ❌ 避免：过度 Mock 内部逻辑
// 不要 Mock 被测试类的内部方法
```

### 4. 测试数据管理

```typescript
// ✅ 好的做法：使用工厂创建测试数据
const user = factories.user.create({
  email: 'specific@example.com'
});

// ✅ 好的做法：每个测试独立的数据
beforeEach(async () => {
  await dbHelper.clearDatabase();
});

// ❌ 避免：测试间共享可变数据
```

### 5. 异步测试

```typescript
// ✅ 好的做法：正确处理异步操作
it('应该异步创建用户', async () => {
  const result = await service.create(createUserDto);
  expect(result).toBeDefined();
});

// ✅ 好的做法：测试异步错误
it('应该在数据库错误时抛出异常', async () => {
  mockRepository.save.mockRejectedValue(new Error('Database error'));
  
  await expect(service.create(createUserDto)).rejects.toThrow('Database error');
});
```

## 🔧 配置和环境

### 环境变量

```bash
# .env.test
NODE_ENV=test
DATABASE_URL=postgresql://test_user:test_password@localhost:5432/test_db
JWT_SECRET=test-jwt-secret
```

### 测试数据库

```typescript
// test/test-config.ts
export const testDatabaseConfig = {
  type: 'postgres' as const,
  host: 'localhost',
  port: 5432,
  username: 'test_user',
  password: 'test_password',
  database: 'test_db',
  synchronize: true,
  dropSchema: true,
  logging: false,
};
```

## 📈 CI/CD 集成

### GitHub Actions 示例

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: test_password
          POSTGRES_USER: test_user
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Run comprehensive tests
        run: npm run test:comprehensive
        
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
```

## 🚨 故障排除

### 常见问题

1. **测试超时**
   ```typescript
   // 增加测试超时时间
   it('长时间运行的测试', async () => {
     // 测试逻辑
   }, 30000); // 30秒超时
   ```

2. **数据库连接问题**
   ```bash
   # 检查数据库连接
   npm run test:db
   ```

3. **Mock 不生效**
   ```typescript
   // 确保在 beforeEach 中清理 Mock
   beforeEach(() => {
     vi.clearAllMocks();
   });
   ```

4. **内存泄漏**
   ```typescript
   // 在测试后清理资源
   afterAll(async () => {
     await app.close();
   });
   ```

### 调试测试

```bash
# 使用调试模式运行测试
npm run test:debug

# 使用 UI 界面调试
npm run test:ui
```

## 📚 参考资源

- [Vitest 官方文档](https://vitest.dev/)
- [NestJS 测试文档](https://docs.nestjs.com/fundamentals/testing)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## 🎉 总结

本测试框架提供了：

- ✅ **完整的测试类型覆盖**：单元、集成、E2E、性能测试
- ✅ **严格的质量标准**：高覆盖率要求和最佳实践
- ✅ **丰富的测试工具**：数据工厂、Mock 工具、性能测试工具
- ✅ **详细的测试报告**：HTML 和 JSON 格式的综合报告
- ✅ **CI/CD 就绪**：支持自动化测试流程

通过遵循本指南，您可以编写高质量、可维护的测试代码，确保应用程序的稳定性和可靠性。
