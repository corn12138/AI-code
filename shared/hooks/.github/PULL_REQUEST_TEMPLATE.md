## 📝 变更描述

### 变更类型
请选择适用的选项：

- [ ] 🐛 Bug 修复 (non-breaking change which fixes an issue)
- [ ] ✨ 新功能 (non-breaking change which adds functionality)
- [ ] 💥 重大变更 (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 文档更新 (changes to documentation)
- [ ] 🎨 代码风格 (formatting, missing semi colons, etc; no production code change)
- [ ] ♻️ 重构 (refactoring production code, eg. renaming a variable)
- [ ] ⚡ 性能优化 (changes that improve performance)
- [ ] ✅ 测试 (adding missing tests, refactoring tests; no production code change)
- [ ] 🔧 构建/工具 (changes to build process or auxiliary tools)

### 简要描述
简要说明本次变更的内容。

### 详细描述
详细描述您所做的更改以及为什么做出这些更改。

---

## 🔗 相关 Issue

修复 #(issue编号)

---

## 🧪 测试

### 测试策略
- [ ] 我已经添加了新的测试来覆盖我的更改
- [ ] 我已经更新了现有的测试
- [ ] 所有新的和现有的测试都通过了
- [ ] 我已经手动测试了更改

### 测试用例
描述您添加或修改的测试用例：

```typescript
// 示例测试用例
describe('useNewFeature', () => {
  it('should work correctly', () => {
    // 测试逻辑
  });
});
```

### 手动测试
描述您如何手动测试了这些更改：

1. 
2. 
3. 

---

## 📱 影响范围

### Breaking Changes
- [ ] 这个 PR 包含重大变更
- [ ] 我已经更新了 CHANGELOG.md
- [ ] 我已经更新了文档以反映这些变更

如果有重大变更，请详细描述：

### 影响的 Hooks
列出受影响的 hooks：

- [ ] `useAuth`
- [ ] `useDebounce`
- [ ] `useClientSide`
- [ ] `useAsync`
- [ ] `useNetworkStatus`
- [ ] `useForm`
- [ ] `useLocalStorage`
- [ ] `useWindowSize`
- [ ] `useApi`
- [ ] `useEditor`
- [ ] 其他: _______________

---

## 📋 检查清单

### 代码质量
- [ ] 我的代码遵循了这个项目的代码规范
- [ ] 我已经对我的代码进行了自我审查
- [ ] 我已经对复杂的代码添加了注释
- [ ] 我的更改不会产生新的警告

### 文档
- [ ] 我已经对我的更改进行了相应的文档更新
- [ ] 如果适用，我已经更新了 README.md
- [ ] 如果适用，我已经添加或更新了 hook 的文档
- [ ] 如果适用，我已经添加了使用示例

### 测试
- [ ] 我已经添加了能证明我的修复是有效的或者我的功能是可以工作的测试
- [ ] 新的和现有的单元测试在我的更改后都能通过
- [ ] 我已经检查了代码覆盖率没有下降

### 类型安全
- [ ] 我已经更新了 TypeScript 类型定义
- [ ] 类型检查通过 (`npm run type-check`)
- [ ] 如果添加了新的 hook，我已经导出了类型定义

### 构建
- [ ] 构建通过 (`npm run build`)
- [ ] ESLint 检查通过 (`npm run lint`)
- [ ] 所有测试通过 (`npm run test`)

---

## 📸 截图/演示

如果适用，请添加截图或 GIF 来演示您的更改：

---

## 🔄 迁移指南

如果这是一个重大变更，请提供迁移指南：

### 之前的用法
```typescript
// 旧的 API 用法
```

### 现在的用法
```typescript
// 新的 API 用法
```

### 迁移步骤
1. 
2. 
3. 

---

## 📝 附加信息

添加任何其他相关信息、上下文或截图。

### 性能影响
描述这些更改对性能的影响（如果有的话）：

### 依赖变更
列出任何新的依赖项或依赖项版本更改：

### 配置变更
描述任何新的配置选项或对现有配置的更改：

---

## 🙏 审查要点

请审查者特别关注以下方面：

- [ ] API 设计是否合理
- [ ] 错误处理是否完善
- [ ] 性能是否有影响
- [ ] 类型定义是否正确
- [ ] 文档是否清晰
- [ ] 测试覆盖是否充分

---

**审查清单**：我确认这个 PR 已经准备好接受审查，并且我已经完成了上述所有相关的检查项目。 