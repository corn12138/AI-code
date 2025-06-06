# NestJS 测试最佳实践

## 单元测试准则

1. **测试隔离**：每个测试应该独立并且不依赖于其他测试。

2. **模拟依赖**：使用 Jest 的 `jest.mock()` 和 `spyOn()` 来模拟依赖，避免实际调用外部服务。

3. **测试边界条件**：除了测试常规场景，还要测试边界条件和错误情况。

4. **可读性**：使用描述性的测试名称，如 "should return user when valid ID provided"。

5. **AAA模式**：遵循 Arrange-Act-Assert 模式组织测试代码。

## 单元测试与集成测试

- **单元测试**：测试独立组件（如Service、Controller）的行为，模拟所有依赖。
- **集成测试**：测试组件间的交互，可能使用真实依赖或测试数据库。
- **E2E测试**：测试整个应用，模拟真实用户行为，通常使用Supertest发送HTTP请求。

## 覆盖率目标

- 服务层（Services）：目标 80% 以上
- 控制器（Controllers）：目标 70% 以上
- 管道/拦截器/守卫：目标 60% 以上

## 测试优化技巧

1. **测试工厂函数**：创建可重用的工厂函数来生成测试数据。

```typescript
// 用户数据工厂
function createTestUser(override = {}) {
  return {
    id: 'test-id',
    username: 'testuser',
    email: 'test@example.com',
    roles: ['user'],
    ...override
  };
}
```

2. **全局模拟**：对于常用依赖，设置全局模拟：

```typescript
// 在 setupJest.ts 中
jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn().mockImplementation(() => ({
    signAsync: jest.fn().mockResolvedValue('test-token'),
    verifyAsync: jest.fn().mockResolvedValue({ sub: 'user-id' }),
  })),
}));
```

3. **测试钩子**：使用 beforeEach/afterEach 钩子保持测试状态干净。

## 常见问题解决方案

1. **异步代码测试**：确保正确处理 Promise 和异常。

```typescript
// 正确方法
it('should throw exception', async () => {
  await expect(service.doSomething()).rejects.toThrow(NotFoundException);
});
```

2. **数据库相关测试**：使用内存数据库或测试容器。

3. **模拟授权**：

```typescript
const mockRequest = {
  user: { userId: 'test-id', roles: ['admin'] }
};
```

## CI/CD 集成

将测试集成到CI工作流程中，在部署前自动运行测试。

```yaml
# 示例 GitHub Actions 工作流
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Run e2e tests
        run: npm run test:e2e
```
