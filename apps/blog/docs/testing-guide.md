# 测试指南

## 快速开始

### 运行测试

```bash
# 运行所有测试
npm run test

# 运行测试并监听文件变化
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行快速测试（基本报告）
npm run test:fast

# 运行优化测试（详细报告）
npm run test:optimized

# 运行性能分析
npm run test:performance
```

### 测试文件结构

```
src/
├── components/
│   ├── ProfileClient.tsx
│   └── __tests__/
│       └── ProfileClient.test.tsx
├── lib/
│   ├── utils.ts
│   └── __tests__/
│       └── utils.test.ts
└── test/
    ├── setup.ts
    ├── utils/
    │   ├── test-performance.ts
    │   └── test-data-optimizer.ts
    └── integration/
        └── theme-integration.test.tsx
```

## 测试类型

### 1. 单元测试

测试单个函数或组件的独立功能。

```typescript
// src/lib/__tests__/utils.test.ts
import { describe, expect, it } from 'vitest'
import { formatDate, validateEmail } from '../utils'

describe('工具函数', () => {
  describe('formatDate', () => {
    it('应该正确格式化日期', () => {
      const date = new Date('2024-01-01')
      expect(formatDate(date)).toBe('2024-01-01')
    })
  })

  describe('validateEmail', () => {
    it('应该验证有效的邮箱地址', () => {
      expect(validateEmail('test@example.com')).toBe(true)
    })

    it('应该拒绝无效的邮箱地址', () => {
      expect(validateEmail('invalid-email')).toBe(false)
    })
  })
})
```

### 2. 组件测试

测试React组件的渲染和交互。

```typescript
// src/components/__tests__/ProfileClient.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ProfileClient from '../ProfileClient'

describe('ProfileClient组件', () => {
  it('应该正确渲染用户信息', () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com'
    }

    render(<ProfileClient initialUser={mockUser} />)

    expect(screen.getByText('testuser')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('应该允许编辑用户信息', async () => {
    const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' }
    render(<ProfileClient initialUser={mockUser} />)

    const editButton = screen.getByRole('button', { name: /编辑个人资料/i })
    fireEvent.click(editButton)

    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument()
    })
  })
})
```

### 3. 集成测试

测试多个组件或模块的交互。

```typescript
// src/test/integration/theme-integration.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AboutPage from '@/app/about/page'
import DashboardPage from '@/app/dashboard/page'

describe('主题集成测试', () => {
  it('所有页面都应该使用星空暗黑主题', () => {
    const { rerender } = render(<AboutPage />)
    
    // 检查About页面
    expect(screen.getByTestId('starry-background')).toBeInTheDocument()
    
    // 检查Dashboard页面
    rerender(<DashboardPage />)
    expect(screen.getByTestId('starry-background')).toBeInTheDocument()
  })
})
```

## 测试工具使用

### 1. 性能监控

```typescript
import { testPerformanceMonitor } from '@/test/utils/test-performance'

describe('性能测试', () => {
  it('组件渲染应该在100ms内完成', () => {
    testPerformanceMonitor.startMonitoring('组件渲染测试')
    
    render(<HeavyComponent />)
    
    testPerformanceMonitor.endMonitoring('组件渲染测试')
    
    const metrics = testPerformanceMonitor.getMetrics()
    const lastMetric = metrics[metrics.length - 1]
    
    expect(lastMetric.duration).toBeLessThan(100)
  })
})
```

### 2. 测试数据优化

```typescript
import { UserDataFactory } from '@/test/utils/test-data-optimizer'

describe('用户管理测试', () => {
  it('应该正确处理用户数据', () => {
    const mockUser = UserDataFactory.createBaseUser({
      username: 'customuser',
      email: 'custom@example.com'
    })

    render(<UserProfile user={mockUser} />)
    
    expect(screen.getByText('customuser')).toBeInTheDocument()
  })
})
```

## 模拟和Mock

### 1. 函数模拟

```typescript
import { vi } from 'vitest'

// 模拟模块
vi.mock('@shared/hooks', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    isLoading: false,
    isAuthenticated: false
  }))
}))

// 模拟函数调用
const mockUpdateUser = vi.fn()
vi.mocked(updateUser).mockImplementation(mockUpdateUser)
```

### 2. API模拟

```typescript
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  rest.get('/api/user', (req, res, ctx) => {
    return res(
      ctx.json({
        id: '1',
        username: 'testuser',
        email: 'test@example.com'
      })
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### 3. 组件模拟

```typescript
// 模拟Next.js组件
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }) => {
    return <img src={src} alt={alt} {...props} />
  }
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }) => {
    return <a href={href} {...props}>{children}</a>
  }
}))
```

## 异步测试

### 1. 使用waitFor

```typescript
it('应该异步加载数据', async () => {
  render(<DataLoader />)

  // 等待加载完成
  await waitFor(() => {
    expect(screen.getByText('数据加载完成')).toBeInTheDocument()
  })
})
```

### 2. 使用userEvent

```typescript
import userEvent from '@testing-library/user-event'

it('应该处理用户输入', async () => {
  const user = userEvent.setup()
  render(<SearchForm />)

  const searchInput = screen.getByPlaceholderText('搜索...')
  await user.type(searchInput, '测试搜索')

  expect(searchInput).toHaveValue('测试搜索')
})
```

## 测试最佳实践

### 1. 测试用户行为

```typescript
// 好的测试 - 测试用户看到什么
it('应该显示错误消息', () => {
  render(<Form />)
  
  const submitButton = screen.getByRole('button', { name: /提交/i })
  fireEvent.click(submitButton)
  
  expect(screen.getByText('请填写必填字段')).toBeInTheDocument()
})

// 避免的测试 - 测试实现细节
it('应该调用validate函数', () => {
  const mockValidate = vi.fn()
  render(<Form validate={mockValidate} />)
  
  const submitButton = screen.getByRole('button', { name: /提交/i })
  fireEvent.click(submitButton)
  
  expect(mockValidate).toHaveBeenCalled()
})
```

### 2. 使用语义化查询

```typescript
// 优先级顺序
getByRole('button', { name: /保存/i }) // 最高优先级
getByLabelText('用户名')
getByPlaceholderText('请输入用户名')
getByText('保存')
getByTestId('save-button') // 最低优先级
```

### 3. 测试可访问性

```typescript
it('应该支持键盘导航', () => {
  render(<Navigation />)
  
  const menuButton = screen.getByRole('button', { name: /菜单/i })
  expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  
  fireEvent.click(menuButton)
  expect(menuButton).toHaveAttribute('aria-expanded', 'true')
})
```

## 常见问题解决

### 1. 测试不稳定

```typescript
// 问题：测试有时通过有时失败
it('应该异步更新状态', async () => {
  render(<AsyncComponent />)
  
  // 解决方案：使用waitFor等待异步操作
  await waitFor(() => {
    expect(screen.getByText('更新完成')).toBeInTheDocument()
  }, { timeout: 5000 })
})
```

### 2. 组件渲染问题

```typescript
// 问题：组件依赖外部状态
it('应该正确渲染', () => {
  // 解决方案：提供必要的上下文
  render(
    <AuthProvider>
      <ProfileComponent />
    </AuthProvider>
  )
})
```

### 3. 模拟问题

```typescript
// 问题：模拟不生效
// 解决方案：确保模拟在正确的位置
vi.mock('@shared/hooks', () => ({
  useAuth: vi.fn(() => ({
    user: { id: '1', username: 'testuser' },
    isLoading: false,
    isAuthenticated: true
  }))
}))
```

## 调试技巧

### 1. 使用screen.debug()

```typescript
it('调试测试', () => {
  render(<ComplexComponent />)
  
  // 打印当前DOM结构
  screen.debug()
  
  // 打印特定元素
  screen.debug(screen.getByRole('button'))
})
```

### 2. 使用screen.logTestingPlaygroundURL()

```typescript
it('生成测试代码', () => {
  render(<Component />)
  
  // 生成测试代码建议
  screen.logTestingPlaygroundURL()
})
```

### 3. 使用vitest --ui

```bash
# 启动测试UI界面
npm run test:ui
```

## 性能优化

### 1. 减少不必要的渲染

```typescript
// 使用React.memo优化组件
const OptimizedComponent = React.memo(({ data }) => {
  return <div>{data}</div>
})

// 在测试中验证优化
it('应该避免不必要的重新渲染', () => {
  const { rerender } = render(<OptimizedComponent data="test" />)
  
  // 使用相同props重新渲染
  rerender(<OptimizedComponent data="test" />)
  
  // 验证组件没有重新渲染
  expect(renderCount).toBe(1)
})
```

### 2. 优化测试执行时间

```typescript
// 使用beforeAll进行一次性设置
beforeAll(() => {
  // 设置全局模拟
  vi.mock('heavy-module')
})

// 使用beforeEach进行测试隔离
beforeEach(() => {
  // 清理和重置
  cleanup()
  vi.clearAllMocks()
})
```

---

*最后更新: 2024年12月19日*
*版本: 1.0.0*
