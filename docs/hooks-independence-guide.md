# Hooks独立化与Dumi文档化指南

本文档详细记录了AI-Code项目中自定义Hooks的独立化过程，以及使用Dumi进行文档化的完整流程。

## 目录

- [项目背景](#项目背景)
- [Hooks独立化架构设计](#hooks独立化架构设计)
- [实施步骤](#实施步骤)
- [Dumi配置与使用](#dumi配置与使用)
- [项目集成](#项目集成)
- [构建与发布](#构建与发布)
- [最佳实践](#最佳实践)
- [故障排除](#故障排除)

## 项目背景

### 问题分析

在AI-Code项目中，我们发现以下问题：

1. **重复代码**：Blog和LowCode项目中存在相似的Hooks实现
2. **维护困难**：Hooks分散在不同项目中，难以统一维护和升级
3. **复用性差**：无法在其他项目中轻松复用这些通用功能
4. **文档缺失**：缺乏统一的Hooks使用文档

### 解决方案

通过将所有自定义Hooks提取到独立的`@ai-code/hooks`包中，并使用Dumi生成文档，实现：

- ✅ 集中管理所有自定义Hooks
- ✅ 统一的版本控制和发布流程
- ✅ 完整的文档和示例
- ✅ 更好的TypeScript支持
- ✅ 便于测试和维护

## Hooks独立化架构设计

### 目录结构 
shared/hooks/
├── package.json # 包配置文件
├── .fatherrc.ts # Father构建配置
├── tsconfig.json # TypeScript配置
├── src/
│ ├── index.ts # 主入口文件
│ ├── useAuth/ # 认证相关Hooks
│ │ ├── index.tsx
│ │ └── index.md
│ ├── useDebounce/ # 防抖Hooks
│ │ ├── index.ts
│ │ └── index.md
│ ├── useClientSide/ # 客户端检测Hooks
│ │ ├── index.ts
│ │ └── index.md
│ └── useEditor/ # 编辑器状态管理Hooks
│ ├── index.ts
│ └── index.md
└── dist/ # 构建输出目录


### 技术栈选择

- **构建工具**: Father - 专为组件库设计的构建工具
- **文档工具**: Dumi - React组件库文档生成工具
- **包管理**: pnpm workspace - 支持monorepo的包管理
- **类型系统**: TypeScript - 提供完整的类型支持

## 实施步骤

### 第一步：创建Hooks包基础架构

#### 1.1 包配置文件

```json
// shared/hooks/package.json
{
  "name": "@ai-code/hooks",
  "version": "1.0.0",
  "description": "AI-Code项目通用Hooks库",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "father build",
    "dev": "dumi dev",
    "docs:build": "dumi build",
    "docs:preview": "dumi preview",
    "prepare": "father build"
  },
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "dumi": "^2.2.0",
    "father": "^4.1.0",
    "typescript": "^5.0.0"
  }
}
```

#### 1.2 构建配置

```typescript
// shared/hooks/.fatherrc.ts
import { defineConfig } from 'father';

export default defineConfig({
  esm: { output: 'dist' },
  cjs: { output: 'dist' },
  umd: {
    output: 'dist',
    name: 'AiCodeHooks',
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
  },
});
```

#### 1.3 TypeScript配置

```json
// shared/hooks/tsconfig.json
{
  "extends": "../../config/typescript/tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": "./src",
    "declaration": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "docs-dist"]
}
```

### 第二步：实现核心Hooks

#### 2.1 认证管理Hook (useAuth)

**特性**:
- 🔐 完整的用户认证流程
- 💾 自动本地存储管理
- 🔄 状态同步机制
- 🛡️ 类型安全

**核心实现**:

```typescript
// shared/hooks/src/useAuth/index.tsx
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = (): AuthContextType => {
  // 完整实现见实际文件
};
```

**使用示例**:

```tsx
import { useAuth, AuthProvider } from '@ai-code/hooks';

function App() {
  return (
    <AuthProvider>
      <LoginComponent />
    </AuthProvider>
  );
}

function LoginComponent() {
  const { login, user, isAuthenticated } = useAuth();
  
  return isAuthenticated ? (
    <div>欢迎, {user?.username}!</div>
  ) : (
    <button onClick={() => login(credentials)}>登录</button>
  );
}
```

#### 2.2 防抖Hook (useDebounce)

**特性**:
- ⏱️ 值防抖和回调防抖
- 🎯 精确的延迟控制
- 🧹 自动清理机制

**核心实现**:

```typescript
// shared/hooks/src/useDebounce/index.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
}
```

#### 2.3 客户端检测Hook (useClientSide)

**特性**:
- 🌐 SSR/SSG兼容性
- 🔍 客户端环境检测
- 🛡️ 水合(Hydration)问题解决

**使用场景**:
- Next.js SSR项目
- 需要客户端特定功能的组件
- 避免服务端和客户端渲染不一致

#### 2.4 编辑器状态管理Hook (useEditor)

**特性**:
- 🎨 可视化编辑器状态管理
- 📝 撤销/重做功能
- 🔧 组件增删改查
- 👁️ 设计/预览模式切换

**适用项目**:
- LowCode可视化编辑器
- 页面构建器
- 表单设计器

### 第三步：Dumi文档化配置

#### 3.1 Dumi配置文件

```typescript
// .dumirc.ts (项目根目录)
import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'AI-Code Hooks',
  description: 'AI-Code项目通用Hooks库',
  themeConfig: {
    name: 'ai-code-hooks',
    github: 'https://github.com/yourusername/AI-code',
    nav: [
      { title: '指南', link: '/guide' },
      { title: 'Hooks', link: '/hooks' },
      { title: 'API', link: '/api' },
    ],
  },
  resolve: {
    docDirs: ['shared/hooks/src'],
    atomDirs: [
      { type: 'hook', dir: 'shared/hooks/src' }
    ]
  },
  outputPath: 'docs-dist',
  exportStatic: {},
  styles: [
    `body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }`
  ],
});
```

#### 3.2 文档编写规范

每个Hook都包含完整的Markdown文档：

```markdown
# HookName

简短描述

## 基础用法

\`\`\`tsx
import { HookName } from '@ai-code/hooks';

function Example() {
  const result = HookName();
  return <div>{result}</div>;
}
\`\`\`

## API

| 参数 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| param1 | string | 参数描述 | - |

## 注意事项

- 使用注意点1
- 使用注意点2
```

### 第四步：项目集成

#### 4.1 更新workspace配置

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'shared/*'
```

#### 4.2 Blog项目集成

1. **添加依赖**:

```json
// apps/blog/package.json
{
  "dependencies": {
    "@ai-code/hooks": "workspace:*"
  }
}
```

2. **替换原有imports**:

```typescript
// 之前
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';

// 之后
import { useAuth, useDebounce } from '@ai-code/hooks';
```

3. **添加Provider包装**:

```tsx
// apps/blog/src/app/layout.tsx
import { AuthProvider } from '@ai-code/hooks';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

#### 4.3 LowCode项目集成

1. **状态管理替换**:

```typescript
// apps/lowcode/src/components/Editor/index.tsx
import { useEditor, useAuth } from '@ai-code/hooks';

const Editor = () => {
  const {
    components,
    addComponent,
    removeComponent,
    undo,
    redo,
    canUndo,
    canRedo
  } = useEditor();
  
  // 使用新的Hook API
};
```

2. **删除原有Hook文件**:
- `apps/blog/src/hooks/useAuth.tsx`
- `apps/blog/src/hooks/useDebounce.ts`
- `apps/blog/src/hooks/useClientSide.ts`

## 构建与发布

### 本地开发流程

```bash
# 1. 安装依赖
pnpm install

# 2. 构建hooks包
cd shared/hooks
pnpm build

# 3. 启动文档开发服务器
pnpm dev

# 4. 在新终端启动项目
cd ../../apps/blog
pnpm dev
```

### 文档构建

```bash
# 构建静态文档
cd shared/hooks
pnpm docs:build

# 预览文档
pnpm docs:preview
```

### NPM发布流程

```bash
# 1. 确保构建成功
cd shared/hooks
pnpm build

# 2. 登录npm (如果未登录)
npm login

# 3. 发布包
npm publish --access public

# 4. 更新项目依赖版本
cd ../../
pnpm update @ai-code/hooks
```

### 版本管理

```bash
# 更新版本
cd shared/hooks
npm version patch   # 1.0.0 -> 1.0.1
npm version minor   # 1.0.0 -> 1.1.0
npm version major   # 1.0.0 -> 2.0.0

# 发布新版本
npm publish
```

## 最佳实践

### 1. Hook设计原则

- **单一职责**: 每个Hook只负责一个特定功能
- **可组合性**: Hook之间可以相互组合使用
- **类型安全**: 提供完整的TypeScript类型定义
- **向后兼容**: 新版本保持API稳定性

### 2. 文档编写规范

- **完整示例**: 每个Hook都有可运行的示例代码
- **API文档**: 详细的参数和返回值说明
- **使用场景**: 说明适用的业务场景
- **注意事项**: 列出使用时的注意点

### 3. 版本控制策略

- **语义化版本**: 遵循semver规范
- **变更日志**: 维护详细的CHANGELOG.md
- **向后兼容**: 尽量避免破坏性变更

### 4. 测试策略

```typescript
// 示例测试文件结构
shared/hooks/
├── src/
├── test/
│   ├── useAuth.test.tsx
│   ├── useDebounce.test.ts
│   └── setupTests.ts
└── jest.config.js
```

## 故障排除

### 常见问题

#### 1. 构建失败

**问题**: `father build` 失败

**解决方案**:
```bash
# 清理缓存
rm -rf node_modules dist
pnpm install
pnpm build
```

#### 2. 类型定义问题

**问题**: TypeScript类型错误

**解决方案**:
```bash
# 检查tsconfig.json配置
# 确保路径映射正确
{
  "compilerOptions": {
    "paths": {
      "@ai-code/hooks": ["./shared/hooks/src"]
    }
  }
}
```

#### 3. Dumi文档不显示

**问题**: Hook文档不在Dumi中显示

**解决方案**:
- 检查`.dumirc.ts`中的`resolve.docDirs`配置
- 确保每个Hook目录都有`index.md`文件
- 重启Dumi开发服务器

#### 4. workspace依赖问题

**问题**: `@ai-code/hooks`包找不到

**解决方案**:
```bash
# 重新安装workspace依赖
pnpm install

# 确保package.json中的依赖正确
"@ai-code/hooks": "workspace:*"
```

### 调试技巧

#### 1. 查看构建输出

```bash
cd shared/hooks
pnpm build --verbose
```

#### 2. 检查包内容

```bash
npm pack --dry-run
```

#### 3. 本地测试

```bash
# 在其他项目中本地测试
npm link
cd /path/to/test-project
npm link @ai-code/hooks
```

## 下一步计划

### 短期目标 (1-2周)

- [ ] 完善所有Hook的单元测试
- [ ] 添加更多实用的Hook (useLocalStorage, useWindowSize等)
- [ ] 优化文档的交互示例

### 中期目标 (1-2月)

- [ ] 建立CI/CD自动发布流程
- [ ] 添加性能监控和分析
- [ ] 创建Hook使用情况统计

### 长期目标 (3-6月)

- [ ] 开源到GitHub并建立社区
- [ ] 支持更多框架 (Vue, Angular)
- [ ] 建立插件生态系统

## 总结

通过本次Hooks独立化改造，我们实现了：

1. **代码复用**: 所有项目都可以使用统一的Hook库
2. **维护性**: 集中管理，统一升级
3. **文档化**: 完整的使用文档和示例
4. **类型安全**: 完整的TypeScript支持
5. **可扩展性**: 为未来添加更多Hook提供了基础架构

这为AI-Code项目的长期维护和扩展奠定了坚实的基础。