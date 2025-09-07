# Mobile应用测试覆盖率

## 测试文件清单

### 页面测试 (Pages)
- [x] `src/pages/__tests__/Home.test.tsx` - Home页面测试
- [x] `src/pages/__tests__/Auth.test.tsx` - Login页面测试
- [x] `src/pages/__tests__/Register.test.tsx` - Register页面测试
- [x] `src/pages/__tests__/Profile.test.tsx` - Profile页面测试
- [x] `src/pages/__tests__/Message.test.tsx` - Message页面测试

### 组件测试 (Components)
- [x] `src/components/__tests__/Layout.test.tsx` - Layout组件测试
- [ ] `src/components/__tests__/Header.test.tsx` - Header组件测试
- [ ] `src/components/__tests__/ErrorBoundary.test.tsx` - ErrorBoundary组件测试
- [ ] `src/components/__tests__/ToastContainer.test.tsx` - ToastContainer组件测试

### Hook测试 (Hooks)
- [x] `src/hooks/__tests__/useDeviceInfo.test.ts` - useDeviceInfo Hook测试
- [ ] `src/hooks/__tests__/useAuth.test.ts` - useAuth Hook测试 (需要实际实现)

### 工具函数测试 (Utils)
- [x] `src/utils/__tests__/nativeBridge.test.ts` - nativeBridge工具函数测试
- [x] `src/utils/__tests__/storage.test.ts` - storage工具函数测试
- [x] `src/utils/__tests__/validation.test.ts` - validation工具函数测试

### 服务测试 (Services)
- [ ] `src/services/__tests__/api.test.ts` - API服务测试 (需要修复)
- [ ] `src/api/__tests__/client.test.ts` - API客户端测试

### 状态管理测试 (Stores)
- [x] `src/store/__tests__/userStore.test.ts` - userStore测试
- [ ] `src/stores/__tests__/useAuthStore.test.ts` - useAuthStore测试
- [ ] `src/stores/__tests__/useAppStore.test.ts` - useAppStore测试
- [ ] `src/stores/__tests__/useUIStore.test.ts` - useUIStore测试
- [ ] `src/stores/__tests__/useNotificationStore.test.ts` - useNotificationStore测试

### 配置测试 (Config)
- [ ] `src/config/__tests__/env.test.ts` - 环境配置测试

### 类型测试 (Types)
- [ ] `src/types/__tests__/index.test.ts` - 类型定义测试

## 测试覆盖率目标

### 当前覆盖率
- **语句覆盖率**: 目标 80%
- **分支覆盖率**: 目标 80%
- **函数覆盖率**: 目标 80%
- **行覆盖率**: 目标 80%

### 测试优先级
1. **高优先级**: 核心业务逻辑、用户交互、数据流
2. **中优先级**: 工具函数、组件渲染、状态管理
3. **低优先级**: 配置、类型定义、辅助功能

## 测试最佳实践

### 1. 测试命名规范
- 使用中文描述测试用例
- 遵循 "应该..." 的命名模式
- 使用描述性的测试名称

### 2. 测试结构
- 使用 `describe` 分组相关测试
- 每个测试只测试一个功能点
- 使用 `beforeEach` 和 `afterEach` 设置和清理

### 3. Mock使用
- 使用 `vi.mock()` 模拟外部依赖
- 使用 `vi.fn()` 创建模拟函数
- 在 `beforeEach` 中清理模拟状态

### 4. 异步测试
- 使用 `async/await` 处理异步操作
- 使用 `waitFor` 等待异步状态变化
- 使用 `act` 包装状态更新

## 运行测试

### 运行所有测试
```bash
npm run test:run
```

### 运行特定测试文件
```bash
npm run test:run src/pages/__tests__/Home.test.tsx
```

### 运行测试并生成覆盖率报告
```bash
npm run test:coverage
```

### 监听模式运行测试
```bash
npm run test:watch
```

### 使用UI界面运行测试
```bash
npm run test:ui
```

## 测试环境配置

### 测试框架
- **Vitest**: 现代化的测试框架
- **@testing-library/react**: React组件测试库
- **@testing-library/jest-dom**: DOM测试工具
- **jsdom**: 浏览器环境模拟

### 测试配置
- **vitest.config.ts**: Vitest配置文件
- **src/test/setup.ts**: 测试环境设置
- **src/test/utils.tsx**: 测试工具函数

## 持续集成

### GitHub Actions
```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
```

### 预提交钩子
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:run && npm run lint"
    }
  }
}
```

## 测试报告

### 覆盖率报告
- 生成位置: `coverage/index.html`
- 包含详细的覆盖率信息
- 显示未覆盖的代码行

### 测试结果
- 控制台输出测试结果
- 显示测试通过/失败状态
- 显示测试执行时间

## 常见问题

### 1. 测试环境问题
- 检查 `src/test/setup.ts` 配置
- 确保所有必要的Mock都已设置

### 2. 路径别名问题
- 检查 `vitest.config.ts` 中的路径映射
- 确保 `@` 和 `@shared` 别名正确配置

### 3. 组件渲染问题
- 检查组件依赖是否正确Mock
- 确保样式文件和静态资源正确处理

### 4. 异步测试问题
- 使用 `waitFor` 等待异步操作完成
- 增加测试超时时间

## 总结

这个测试体系提供了：

1. **完整的测试覆盖**: 页面、组件、Hook、工具函数等
2. **现代化的测试工具**: Vitest + Testing Library
3. **详细的测试指南**: 最佳实践和常见问题
4. **自动化流程**: CI/CD 集成和预提交钩子
5. **覆盖率监控**: 确保代码质量

通过遵循这个测试体系，可以确保代码质量和应用的稳定性。
