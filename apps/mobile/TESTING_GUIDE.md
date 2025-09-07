# Mobile应用测试指南

## 概述

本文档介绍了Mobile应用的完整测试体系，包括单元测试、集成测试和端到端测试的配置和使用方法。

## 测试技术栈

- **测试框架**: Vitest
- **测试环境**: jsdom
- **测试库**: @testing-library/react
- **用户交互**: @testing-library/user-event
- **覆盖率**: @vitest/coverage-v8
- **UI界面**: @vitest/ui

## 项目结构

```
src/
├── __tests__/           # 测试文件目录
│   ├── components/      # 组件测试
│   ├── hooks/          # Hook测试
│   ├── pages/          # 页面测试
│   ├── services/       # 服务测试
│   ├── store/          # 状态管理测试
│   └── utils/          # 工具函数测试
├── test/               # 测试配置和工具
│   ├── setup.ts        # 测试环境设置
│   └── utils.tsx       # 测试工具函数
└── ...
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 运行测试

```bash
# 运行所有测试
npm run test

# 监听模式运行测试
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:coverage

# 使用UI界面运行测试
npm run test:ui

# 运行一次测试（CI环境）
npm run test:run
```

### 运行完整测试套件

```bash
# 使用测试脚本运行完整测试
chmod +x src/test/run-tests.sh
./src/test/run-tests.sh
```

## 测试编写指南

### 组件测试

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../Button';

describe('Button组件', () => {
  it('应该正确渲染按钮文本', () => {
    render(<Button>点击我</Button>);
    expect(screen.getByText('点击我')).toBeInTheDocument();
  });

  it('应该处理点击事件', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>点击</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Hook测试

```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAuth } from '../useAuth';

describe('useAuth Hook', () => {
  it('应该初始化未登录状态', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
```

### 工具函数测试

```typescript
import { describe, it, expect } from 'vitest';
import { validateEmail } from '../validation';

describe('validateEmail', () => {
  it('应该验证有效的邮箱地址', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('应该拒绝无效的邮箱地址', () => {
    expect(validateEmail('invalid-email')).toBe(false);
  });
});
```

## 测试最佳实践

### 1. 测试命名规范

- 使用描述性的测试名称
- 遵循 "应该..." 的命名模式
- 使用中文描述，便于理解

```typescript
it('应该正确渲染用户信息', () => {
  // 测试代码
});

it('应该在登录失败时显示错误信息', () => {
  // 测试代码
});
```

### 2. 测试结构

- 使用 `describe` 分组相关测试
- 每个测试只测试一个功能点
- 使用 `beforeEach` 和 `afterEach` 设置和清理

```typescript
describe('UserProfile组件', () => {
  beforeEach(() => {
    // 设置测试环境
  });

  afterEach(() => {
    // 清理测试环境
  });

  describe('用户信息显示', () => {
    it('应该显示用户名', () => {
      // 测试代码
    });

    it('应该显示用户头像', () => {
      // 测试代码
    });
  });
});
```

### 3. Mock使用

- 使用 `vi.mock()` 模拟外部依赖
- 使用 `vi.fn()` 创建模拟函数
- 在 `beforeEach` 中清理模拟状态

```typescript
vi.mock('@/services/api', () => ({
  fetchUser: vi.fn(),
  updateUser: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});
```

### 4. 异步测试

- 使用 `async/await` 处理异步操作
- 使用 `waitFor` 等待异步状态变化
- 使用 `act` 包装状态更新

```typescript
it('应该处理异步数据加载', async () => {
  const { result } = renderHook(() => useData());
  
  await act(async () => {
    await result.current.loadData();
  });
  
  expect(result.current.data).toBeDefined();
});
```

## 测试覆盖率

### 覆盖率目标

- **语句覆盖率**: 80%
- **分支覆盖率**: 80%
- **函数覆盖率**: 80%
- **行覆盖率**: 80%

### 查看覆盖率报告

```bash
npm run test:coverage
```

覆盖率报告将生成在 `coverage/` 目录下，打开 `coverage/index.html` 查看详细报告。

## 常见问题

### 1. 测试环境设置

如果遇到测试环境问题，检查 `src/test/setup.ts` 文件是否正确配置了所有必要的模拟。

### 2. 路径别名

确保 `vitest.config.ts` 中正确配置了路径别名：

```typescript
resolve: {
  alias: {
    '@': resolve(__dirname, './src'),
    '@shared': resolve(__dirname, '../../shared'),
  },
},
```

### 3. 组件渲染问题

如果组件渲染失败，检查是否正确导入了所有依赖，特别是样式文件和静态资源。

### 4. 异步测试超时

如果异步测试超时，可以增加超时时间：

```typescript
it('应该处理长时间操作', async () => {
  // 测试代码
}, 10000); // 10秒超时
```

## 持续集成

### GitHub Actions

在 `.github/workflows/test.yml` 中配置测试流程：

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

使用 husky 配置预提交钩子：

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:run && npm run lint"
    }
  }
}
```

## 扩展测试

### 端到端测试

考虑添加 Playwright 或 Cypress 进行端到端测试：

```bash
npm install -D @playwright/test
```

### 性能测试

使用 Lighthouse CI 进行性能测试：

```bash
npm install -D @lhci/cli
```

## 总结

这个测试体系提供了：

1. **完整的测试覆盖**: 组件、Hook、工具函数、服务等
2. **现代化的测试工具**: Vitest + Testing Library
3. **详细的测试指南**: 最佳实践和常见问题
4. **自动化流程**: CI/CD 集成和预提交钩子
5. **覆盖率监控**: 确保代码质量

通过遵循这个测试体系，可以确保代码质量和应用的稳定性。
