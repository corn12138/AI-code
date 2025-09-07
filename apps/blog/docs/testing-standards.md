# 测试标准文档

## 概述

本文档定义了@blog项目的测试标准，包括覆盖率要求、测试质量标准、代码审查流程等。

## 测试覆盖率标准

### 覆盖率阈值

| 指标 | 最低要求 | 目标要求 | 优秀要求 |
|------|----------|----------|----------|
| 语句覆盖率 | 70% | 80% | 90% |
| 分支覆盖率 | 70% | 80% | 85% |
| 函数覆盖率 | 70% | 80% | 90% |
| 行覆盖率 | 70% | 80% | 90% |

### 覆盖率监控

- **实时监控**: 每次提交代码时自动检查覆盖率
- **趋势分析**: 监控覆盖率变化趋势，防止覆盖率下降
- **报告生成**: 自动生成覆盖率报告并发送通知

## 测试质量标准

### 测试分类

#### 1. 单元测试 (Unit Tests)
- **范围**: 单个函数、组件或模块
- **目标**: 验证独立功能单元的正确性
- **覆盖率要求**: 90%+
- **执行时间**: < 100ms per test

#### 2. 集成测试 (Integration Tests)
- **范围**: 多个组件或模块的交互
- **目标**: 验证组件间协作的正确性
- **覆盖率要求**: 80%+
- **执行时间**: < 500ms per test

#### 3. 端到端测试 (E2E Tests)
- **范围**: 完整的用户流程
- **目标**: 验证用户体验的完整性
- **覆盖率要求**: 60%+
- **执行时间**: < 5s per test

### 测试编写标准

#### 命名规范
```typescript
// 好的命名
describe('UserProfile组件', () => {
  it('应该正确显示用户信息', () => {
    // 测试逻辑
  })
  
  it('应该在用户未登录时显示登录按钮', () => {
    // 测试逻辑
  })
})

// 不好的命名
describe('UserProfile', () => {
  it('test1', () => {
    // 测试逻辑
  })
})
```

#### 测试结构 (AAA模式)
```typescript
it('应该正确验证邮箱格式', () => {
  // Arrange (准备)
  const invalidEmail = 'invalid-email'
  const { getByLabelText, getByRole } = render(<EmailForm />)
  
  // Act (执行)
  const emailInput = getByLabelText('邮箱')
  const submitButton = getByRole('button', { name: /提交/i })
  
  fireEvent.change(emailInput, { target: { value: invalidEmail } })
  fireEvent.click(submitButton)
  
  // Assert (断言)
  expect(screen.getByText(/邮箱格式不正确/i)).toBeInTheDocument()
})
```

#### 断言标准
```typescript
// 好的断言
expect(element).toBeInTheDocument()
expect(element).toHaveClass('expected-class')
expect(element).toHaveAttribute('aria-label', 'expected-label')
expect(mockFunction).toHaveBeenCalledWith(expectedArgs)

// 避免的断言
expect(element).toBeTruthy() // 不够具体
expect(element).not.toBeNull() // 不够具体
```

### 测试数据管理

#### Mock数据标准
```typescript
// 使用工厂函数创建测试数据
const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  username: 'testuser',
  email: 'test@example.com',
  avatar: '/default-avatar.svg',
  ...overrides
})

// 在测试中使用
const mockUser = createMockUser({ username: 'customuser' })
```

#### 测试隔离
```typescript
beforeEach(() => {
  // 清理所有模拟
  vi.clearAllMocks()
  
  // 重置测试数据
  cleanup()
  
  // 设置默认模拟
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    isLoading: false,
    isAuthenticated: false
  })
})
```

## 代码审查流程

### 审查清单

#### 测试覆盖率检查
- [ ] 新代码的测试覆盖率是否达到要求
- [ ] 是否影响了现有测试的覆盖率
- [ ] 是否添加了必要的测试用例

#### 测试质量检查
- [ ] 测试是否遵循AAA模式
- [ ] 测试名称是否清晰描述测试目的
- [ ] 断言是否具体和有意义
- [ ] 是否避免了测试间的依赖

#### 测试性能检查
- [ ] 测试执行时间是否合理
- [ ] 是否避免了不必要的异步操作
- [ ] 是否使用了适当的模拟策略

### 审查流程

1. **提交前自检**
   - 运行所有测试确保通过
   - 检查覆盖率报告
   - 验证测试性能

2. **代码审查**
   - 至少一名团队成员审查
   - 重点关注测试质量和覆盖率
   - 提供具体的改进建议

3. **CI/CD检查**
   - 自动运行测试套件
   - 生成覆盖率报告
   - 检查覆盖率阈值

4. **合并前确认**
   - 所有测试通过
   - 覆盖率达到要求
   - 审查意见已处理

## 测试工具和配置

### 工具栈
- **测试框架**: Vitest
- **测试库**: React Testing Library
- **断言库**: Jest DOM
- **模拟工具**: MSW (API), vi (函数)
- **覆盖率**: @vitest/coverage-v8

### 配置文件
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    }
  }
})
```

## 最佳实践

### 测试编写最佳实践

1. **测试用户行为，而不是实现细节**
```typescript
// 好的测试
expect(screen.getByRole('button', { name: /保存/i })).toBeInTheDocument()

// 避免的测试
expect(component.state.isEditing).toBe(true)
```

2. **使用语义化的查询方法**
```typescript
// 优先级顺序
getByRole() // 最高优先级
getByLabelText()
getByPlaceholderText()
getByText()
getByTestId() // 最低优先级
```

3. **避免测试实现细节**
```typescript
// 好的测试
expect(screen.getByText('保存成功')).toBeInTheDocument()

// 避免的测试
expect(mockApiCall).toHaveBeenCalledWith(expectedData)
```

### 性能优化最佳实践

1. **使用适当的模拟策略**
```typescript
// 好的模拟
vi.mock('@shared/hooks', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    isLoading: false
  }))
}))

// 避免的模拟
vi.mock('react', () => ({
  ...vi.importActual('react'),
  useState: vi.fn()
}))
```

2. **优化测试执行时间**
```typescript
// 使用beforeAll进行一次性设置
beforeAll(() => {
  // 设置全局模拟
})

// 使用beforeEach进行测试隔离
beforeEach(() => {
  // 清理和重置
})
```

## 常见问题和解决方案

### 问题1: 测试不稳定
**原因**: 异步操作、时间依赖、状态污染
**解决方案**: 
- 使用`waitFor`处理异步操作
- 使用`vi.useFakeTimers()`控制时间
- 确保测试隔离

### 问题2: 测试执行缓慢
**原因**: 不必要的API调用、复杂的模拟
**解决方案**:
- 使用适当的模拟策略
- 避免不必要的异步操作
- 优化测试数据

### 问题3: 覆盖率不达标
**原因**: 缺少边界条件测试、错误处理测试
**解决方案**:
- 添加错误场景测试
- 测试边界条件
- 测试异常情况

## 持续改进

### 定期评估
- 每月评估测试覆盖率趋势
- 分析测试失败原因
- 优化测试策略

### 团队培训
- 定期进行测试培训
- 分享最佳实践
- 建立测试文化

### 工具更新
- 关注测试工具更新
- 评估新工具的价值
- 及时升级和优化

---

*最后更新: 2024年12月19日*
*版本: 1.0.0*
