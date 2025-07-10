# 贡献指南

感谢您对 `@ai-code/hooks` 的关注！我们欢迎所有形式的贡献。

## 🚀 快速开始

### 开发环境设置

1. **Fork 仓库**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-code-hooks.git
   cd ai-code-hooks
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发环境**
   ```bash
   npm run dev  # 启动文档站点
   ```

4. **运行测试**
   ```bash
   npm run test        # 运行测试
   npm run test:watch  # 监听模式
   npm run test:coverage # 覆盖率报告
   ```

## 🛠️ 开发流程

### 1. 创建分支
```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

### 2. 开发规范

#### 代码风格
- 使用 TypeScript
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码

```bash
npm run lint      # 检查代码风格
npm run lint:fix  # 自动修复
```

#### 提交信息规范
使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
feat: add useLocalStorage hook
fix: resolve memory leak in useDebounce
docs: update useAuth documentation
test: add tests for useAsync hook
```

### 3. 添加新Hook

如果您要添加新的 Hook：

1. **创建Hook文件**
   ```
   src/useYourHook/
   ├── index.ts       # Hook实现
   ├── index.md       # 文档和示例
   └── __tests__/     # 测试文件
       └── index.test.ts
   ```

2. **Hook实现要求**
   ```typescript
   // src/useYourHook/index.ts
   export interface UseYourHookOptions {
     // 选项类型定义
   }
   
   export interface UseYourHookReturn {
     // 返回值类型定义
   }
   
   /**
    * Your hook description
    * @param options - Hook options
    * @returns Hook return value
    */
   export function useYourHook(options?: UseYourHookOptions): UseYourHookReturn {
     // 实现逻辑
   }
   ```

3. **编写测试**
   ```typescript
   // src/useYourHook/__tests__/index.test.ts
   import { renderHook } from '@testing-library/react';
   import { useYourHook } from '../index';
   
   describe('useYourHook', () => {
     it('should work correctly', () => {
       const { result } = renderHook(() => useYourHook());
       expect(result.current).toBeDefined();
     });
   });
   ```

4. **编写文档**
   ```markdown
   # useYourHook
   
   Hook描述
   
   ## 基础用法
   
   \`\`\`tsx
   import { useYourHook } from '@ai-code/hooks';
   
   function MyComponent() {
     const result = useYourHook();
     return <div>{/* 使用示例 */}</div>;
   }
   \`\`\`
   
   ## API
   
   ### 参数
   ### 返回值
   ```

5. **导出Hook**
   ```typescript
   // src/index.ts
   export * from './useYourHook';
   ```

### 4. 测试要求

- 所有新代码必须有测试覆盖
- 测试覆盖率不能低于 90%
- 必须包含边界情况测试
- 测试必须能在所有支持的 Node.js 版本上通过

### 5. 文档要求

- 每个 Hook 必须有完整的文档
- 包含使用示例和 API 说明
- 如果可能，提供交互式示例
- 更新相关的 README 文档

## 📝 Pull Request 流程

### 1. 提交 PR 前检查
```bash
npm run lint        # 代码风格检查
npm run type-check  # 类型检查
npm run test        # 运行所有测试
npm run build       # 构建检查
```

### 2. PR 描述模板
```markdown
## 变更类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 重大变更
- [ ] 文档更新
- [ ] 性能优化
- [ ] 其他

## 变更描述
简要描述本次变更的内容和原因。

## 测试
- [ ] 添加了新的测试
- [ ] 所有测试通过
- [ ] 手动测试通过

## 相关 Issue
修复 #(issue编号)

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 自测通过
- [ ] 添加了必要的文档
- [ ] 更新了 CHANGELOG（如需要）
```

### 3. 代码审查

所有 PR 都需要经过代码审查：
- 至少一位维护者的批准
- 所有 CI 检查通过
- 解决所有审查意见

## 🐛 报告问题

### Bug 报告模板
使用 GitHub Issues 报告问题，请包含：

1. **环境信息**
   - React 版本
   - Node.js 版本
   - 浏览器信息
   - 操作系统

2. **重现步骤**
   - 详细的重现步骤
   - 最小重现示例
   - 期望行为 vs 实际行为

3. **相关代码**
   ```tsx
   // 提供相关的代码片段
   ```

### 功能请求
1. 描述功能需求
2. 解释使用场景
3. 提供可能的实现方案

## 🏷️ 版本发布

版本发布由维护者负责：

1. **版本号规范**
   - 主版本号：重大变更
   - 次版本号：新功能
   - 修订号：Bug 修复

2. **发布流程**
   ```bash
   npm version patch  # 或 minor, major
   git push origin main --tags
   # GitHub Actions 自动发布
   ```

## 📞 联系我们

- **GitHub Issues**: 报告问题和功能请求
- **GitHub Discussions**: 技术讨论和问答
- **Email**: maintainer@ai-code-hooks.com

## 📄 许可证

本项目使用 [MIT License](./LICENSE)。

---

再次感谢您的贡献！🎉 