# Vitest 测试配置

## 概述

本项目使用 Vitest 作为测试框架，配合 React Testing Library 进行组件测试，MSW 进行 API 模拟。

## 测试状态

| 测试类型 | 通过 | 失败 | 通过率 |
|---------|------|------|--------|
| 组件测试 | 36 | 0 | 100% ✅ |
| Hook 测试 | 36 | 0 | 100% ✅ |
| API 测试 | 26 | 0 | 100% ✅ |
| 契约测试 | 1 | 0 | 100% ✅ |
| **总计** | **126** | **0** | **100%** |

### 测试覆盖范围

- ✅ 组件渲染和交互测试
- ✅ Hook 状态管理和副作用测试  
- ✅ API 服务测试（使用 MSW 模拟）
- ✅ 契约测试（API 接口规范）
- ✅ 错误处理和边界情况测试
- ✅ 可访问性测试
- ✅ 性能测试

## 快速开始

### 运行所有测试
```bash
pnpm test
```

### 运行特定测试
```bash
# 运行组件测试
pnpm test src/test/components/

# 运行 Hook 测试  
pnpm test src/test/hooks/

# 运行 API 测试
pnpm test src/test/examples/api.test.ts
```

### 生成覆盖率报告
```bash
pnpm test:coverage
```

### 监听模式
```bash
pnpm test:watch
```

## 测试文件结构

```
src/test/
├── setup.ts                 # 全局测试配置
├── mocks/                   # 模拟文件
│   ├── server.ts           # MSW 服务器配置
│   └── handlers.ts         # API 处理器
├── utils/                   # 测试工具
│   └── test-utils.tsx      # 通用测试工具
├── examples/               # 示例测试
│   ├── component.test.tsx  # 组件测试示例
│   ├── hook.test.ts        # Hook 测试示例
│   └── api.test.ts         # API 测试示例
├── components/             # 组件测试
│   ├── auth/              # 认证相关组件
│   └── blog/              # 博客相关组件
└── hooks/                 # Hook 测试
    ├── useAIModels.test.ts
    ├── useUserManagement.test.ts
    └── usePostManagement.test.ts
```

## 测试配置

### Vitest 配置 (vitest.config.ts)
- 环境：jsdom
- 全局变量：启用
- 设置文件：src/test/setup.ts
- 覆盖率：启用
- 路径别名：配置 @/ 指向 src/

### 全局设置 (src/test/setup.ts)
- Next.js 组件和 Hook 模拟
- MSW 服务器设置
- 全局浏览器 API 模拟
- 测试环境变量设置

## 测试工具

### 组件测试
使用 React Testing Library 进行用户行为测试：
```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Hook 测试
使用 renderHook 测试自定义 Hook：
```tsx
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

describe('useMyHook', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useMyHook())
    expect(result.current.value).toBe(0)
  })
})
```

### API 测试
使用 MSW 模拟 API 请求：
```tsx
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  http.get('/api/users', () => {
    return HttpResponse.json({ users: [] })
  })
)
```

## 最佳实践

1. **测试用户行为**：测试用户如何与组件交互，而不是实现细节
2. **使用语义化查询**：优先使用 `getByRole`、`getByLabelText` 等
3. **模拟外部依赖**：使用 MSW 模拟 API，避免真实网络请求
4. **测试错误情况**：确保错误处理和边界情况得到测试
5. **保持测试简单**：每个测试只测试一个功能点

## 常见问题

### 1. 测试环境问题
确保 `vitest.config.ts` 中正确配置了 jsdom 环境。

### 2. 路径别名问题
检查 `vitest.config.ts` 中的路径别名配置是否与 `tsconfig.json` 一致。

### 3. MSW 处理器问题
确保 MSW 处理器路径与 API 服务中的实际路径匹配。

### 4. 异步测试问题
使用 `waitFor` 和 `act` 处理异步操作和状态更新。

## 贡献指南

1. 为新功能编写测试
2. 确保测试覆盖率达到要求
3. 遵循测试命名规范
4. 使用描述性的测试名称
5. 保持测试代码的可读性
