# Vitest 测试框架配置

## 概述

本项目已成功配置了完整的 Vitest 测试框架，包括：

- **Vitest**: 快速单元测试框架
- **React Testing Library**: React 组件测试
- **MSW (Mock Service Worker)**: API 请求模拟
- **@testing-library/jest-dom**: 额外的 DOM 匹配器
- **@testing-library/user-event**: 用户交互模拟

## 测试状态

### 当前测试结果 (2025-08-29)

| 测试类型 | 通过 | 失败 | 通过率 |
|---------|------|------|--------|
| 组件测试 | 2 | 0 | 100% ✅ |
| Hook 测试 | 3 | 0 | 100% ✅ |
| API 测试 | 1 | 8 | 75% ⚠️ |
| 契约测试 | 0 | 1 | 0% |
| **总计** | **117** | **9** | **93%** |

### 测试覆盖范围

#### ✅ 已完成的测试
- **组件测试**: 渲染、交互、样式、边界情况、可访问性
- **Hook 测试**: 状态管理、异步操作、错误处理、边界情况
- **API 测试**: 用户管理、文章管理、认证、搜索、错误处理

#### 🔄 待修复的测试
- **API 错误处理**: MSW 处理器覆盖问题
- **文件上传**: 超时问题
- **契约测试**: Pact 配置问题

## 快速开始

### 安装依赖
```bash
pnpm install
```

### 运行测试
```bash
# 运行所有测试
pnpm test:run

# 运行测试并监听文件变化
pnpm test:watch

# 运行测试并显示 UI
pnpm test:ui

# 生成覆盖率报告
pnpm test:coverage

# 调试模式
pnpm test:debug
```

## 测试结构

```
src/test/
├── setup.ts                 # 全局测试设置
├── mocks/
│   ├── server.ts           # MSW 服务器配置
│   └── handlers.ts         # API 模拟处理器
├── utils/
│   └── test-utils.tsx      # 测试工具函数
├── examples/
│   ├── component.test.tsx  # 组件测试示例
│   ├── hook.test.ts        # Hook 测试示例
│   └── api.test.ts         # API 测试示例
└── README.md               # 本文档
```

## 配置详情

### Vitest 配置 (`vitest.config.ts`)
- 环境: `jsdom`
- 全局设置: `src/test/setup.ts`
- 路径别名: `@/` -> `src/`
- 覆盖率: V8 引擎
- 测试超时: 10秒

### 全局设置 (`src/test/setup.ts`)
- MSW 服务器启动/关闭
- Next.js 组件模拟
- 浏览器 API 模拟
- 全局错误处理

### MSW 配置
- 模拟 API 端点: `http://localhost:3001/api`
- 支持: GET, POST, PUT, DELETE
- 错误处理: 400, 401, 404, 500
- 数据持久化: 内存存储

## 测试最佳实践

### 组件测试
```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

describe('MyComponent', () => {
  it('应该正确渲染', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Hook 测试
```tsx
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

describe('useMyHook', () => {
  it('应该返回正确的初始状态', () => {
    const { result } = renderHook(() => useMyHook())
    expect(result.current.value).toBe(0)
  })
})
```

### API 测试
```tsx
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { server } from '@/test/mocks/server'

describe('API', () => {
  beforeAll(() => server.listen())
  afterAll(() => server.close())

  it('应该成功获取数据', async () => {
    const response = await fetch('/api/users')
    const data = await response.json()
    expect(data.success).toBe(true)
  })
})
```

## 常见问题

### 1. MSW 处理器不生效
- 确保在测试中正确启动 MSW 服务器
- 检查 API 路径是否匹配
- 验证处理器是否正确注册

### 2. 组件测试失败
- 检查是否需要模拟 Next.js 组件
- 确保所有依赖都已正确导入
- 验证测试环境是否正确设置

### 3. Hook 测试中的异步操作
- 使用 `act()` 包装异步操作
- 使用 `waitFor()` 等待状态更新
- 正确处理 Promise 和错误

## 下一步计划

1. **修复剩余测试**
   - 解决 API 错误处理测试
   - 修复文件上传超时问题
   - 配置契约测试

2. **扩展测试覆盖**
   - 添加更多组件测试
   - 增加集成测试
   - 添加端到端测试

3. **优化测试性能**
   - 并行测试执行
   - 测试缓存优化
   - 覆盖率报告优化

## 贡献指南

1. 为新功能编写测试
2. 确保测试覆盖率不低于 80%
3. 遵循测试命名规范
4. 使用描述性的测试用例
5. 保持测试代码的可维护性

---

**最后更新**: 2025-08-29
**测试框架版本**: Vitest 2.1.9
