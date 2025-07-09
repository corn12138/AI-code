# Hooks迁移与集成问题总结

本文档详细记录了在AI-Code项目中将自定义Hooks从各个子项目迁移到独立包 `@ai-code/hooks` 过程中遇到的问题、挑战和解决方案。

## 📋 目录

- [迁移阶段问题](#迁移阶段问题)
- [集成阶段问题](#集成阶段问题)
- [文档化过程问题](#文档化过程问题)
- [构建和打包问题](#构建和打包问题)
- [项目间依赖问题](#项目间依赖问题)
- [解决方案总结](#解决方案总结)
- [经验教训](#经验教训)

---

## 🚀 迁移阶段问题

### 1. 重复代码识别和统一

#### 🔴 问题描述
在迁移过程中发现，相同功能的hooks在不同项目中有不同的实现方式：

**Blog项目的useClientSide实现：**
```typescript
// apps/blog/src/hooks/useClientSide.ts
export default function useClientSide() {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);
    return isClient;
}
```

**工具文件中的实现：**
```typescript
// apps/blog/src/utils/clientUtils.ts
export function useClientSide() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        return () => {
            setMounted(false);
        };
    }, []);
    return mounted;
}
```

#### ✅ 解决方案
1. **功能对比分析**：详细比较各版本的功能差异
2. **最佳实践提取**：选择最完整和健壮的实现
3. **接口统一**：设计统一的API接口
4. **渐进式迁移**：先保持向后兼容，再逐步统一

**最终统一实现：**
```typescript
// shared/hooks/src/useClientSide/index.ts
export interface UseClientSideReturn {
  isClient: boolean;
  hasMounted: boolean;
  isServer: boolean;
}

export function useClientSide(): UseClientSideReturn {
  const [isClient, setIsClient] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setHasMounted(true);
  }, []);

  return {
    isClient,
    hasMounted,
    isServer: !isClient
  };
}
```

### 2. 类型定义冲突

#### 🔴 问题描述
不同项目中相同概念的类型定义不一致：

```typescript
// Blog项目
interface User {
  id: number;
  name: string;
  email: string;
}

// LowCode项目
interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}
```

#### ✅ 解决方案
1. **创建通用类型库**：在hooks包中定义统一的类型
2. **泛型设计**：允许项目扩展基础类型
3. **渐进式类型迁移**：使用类型别名保持兼容性

```typescript
// shared/hooks/src/types/index.ts
export interface BaseUser {
  id: string | number;
  email: string;
}

export interface ExtendedUser extends BaseUser {
  username?: string;
  name?: string;
  avatar?: string;
}

// 允许项目自定义扩展
export type User<T = {}> = ExtendedUser & T;
```

### 3. 依赖关系梳理

#### 🔴 问题描述
原有hooks之间存在复杂的内部依赖关系，迁移时容易遗漏：

```typescript
// useAuth 依赖 useLocalStorage
// useForm 依赖 useDebounce
// useApi 依赖 useAsync
```

#### ✅ 解决方案
1. **依赖图绘制**：使用工具可视化依赖关系
2. **分层迁移**：先迁移基础hooks，再迁移复合hooks
3. **测试驱动**：为每个hook编写单元测试确保功能完整

---

## 🔗 集成阶段问题

### 1. 模块解析问题

#### 🔴 问题描述
在monorepo环境中，项目无法正确解析 `@ai-code/hooks` 包：

```bash
Error: Cannot resolve module '@ai-code/hooks'
Module not found: Can't resolve '@ai-code/hooks' in '/Users/.../apps/blog/src'
```

#### ✅ 解决方案
1. **workspace配置修正**：
```json
// pnpm-workspace.yaml
packages:
  - "apps/*"
  - "shared/*"  # 确保包含shared目录
```

2. **package.json依赖配置**：
```json
// apps/blog/package.json
{
  "dependencies": {
    "@ai-code/hooks": "workspace:^1.0.0"
  }
}
```

3. **TypeScript路径映射**：
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@ai-code/hooks": ["../shared/hooks/src"]
    }
  }
}
```

### 2. 构建顺序问题

#### 🔴 问题描述
在CI/CD流程中，子项目在hooks包构建完成前就开始构建，导致找不到模块：

```bash
Building blog...
Error: Cannot find module '@ai-code/hooks/dist/index.js'
```

#### ✅ 解决方案
1. **构建脚本优化**：
```json
// package.json (root)
{
  "scripts": {
    "build": "pnpm -r --filter '@ai-code/hooks' build && pnpm -r build",
    "dev": "pnpm -r --parallel dev"
  }
}
```

2. **pre-build钩子**：
```json
// apps/blog/package.json
{
  "scripts": {
    "prebuild": "cd ../../shared/hooks && pnpm build",
    "build": "next build"
  }
}
```

### 3. 热重载失效

#### 🔴 问题描述
开发环境中修改hooks代码后，使用该hooks的项目不会自动刷新：

#### ✅ 解决方案
1. **开发模式配置**：
```typescript
// next.config.js (blog项目)
const nextConfig = {
  transpilePackages: ['@ai-code/hooks'],
  experimental: {
    externalDir: true,
  },
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      followSymlinks: true,
    };
    return config;
  },
};
```

2. **Vite配置**（LowCode项目）：
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    watch: {
      usePolling: true,
      include: ['../../shared/hooks/src/**'],
    },
  },
});
```

---

## 📖 文档化过程问题

### 1. Dumi配置冲突

#### 🔴 问题描述
Dumi文档站点与项目现有的构建配置产生冲突：

```bash
Error: Multiple dumi configurations found
```

#### ✅ 解决方案
1. **独立配置**：为hooks包单独配置Dumi
2. **路径隔离**：避免与主项目的构建配置冲突

```typescript
// shared/hooks/.dumirc.ts
export default defineConfig({
  outputPath: 'docs-dist',
  resolve: {
    docDirs: ['docs', 'src'],
  },
  themeConfig: {
    name: 'AI-Code Hooks',
  },
});
```

### 2. 示例代码执行错误

#### 🔴 问题描述
Dumi渲染tsx代码块时出现运行时错误：

```bash
Error: Cannot use 'in' operator to search for 'default' in undefined
```

#### ✅ 解决方案
1. **代码块类型调整**：将 `tsx` 改为 `typescript` 避免自动执行
2. **独立示例组件**：创建专门的演示组件文件
3. **Mock数据处理**：确保示例代码的所有依赖都能正确解析

### 3. 交互式示例实现困难

#### 🔴 问题描述
需要创建能够真正交互的示例，而不仅仅是静态代码展示：

#### ✅ 解决方案
1. **组件化示例**：
```typescript
// docs/components/AuthDemo.tsx
export default function AuthDemo() {
  // 完整的可交互演示实现
}
```

2. **文档引用**：
```markdown
## 用户认证演示
<code src="./components/AuthDemo.tsx"></code>
```

---

## 🏗️ 构建和打包问题

### 1. Father构建配置优化

#### 🔴 问题描述
初始构建配置无法满足不同环境的需求：

#### ✅ 解决方案
```typescript
// .fatherrc.ts
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
  platform: 'browser',
  targets: { chrome: 58 },
});
```

### 2. 类型定义文件生成

#### 🔴 问题描述
TypeScript类型定义文件生成不完整或路径错误：

#### ✅ 解决方案
1. **tsconfig配置优化**：
```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "declarationDir": "./dist/types"
  }
}
```

2. **导出文件优化**：
```typescript
// src/index.ts
export type * from './types';
export * from './useAuth';
export * from './useDebounce';
// ...其他exports
```

---

## 🔄 项目间依赖问题

### 1. 循环依赖检测

#### 🔴 问题描述
在monorepo中可能出现意外的循环依赖：

```
@ai-code/hooks -> blog -> @ai-code/hooks
```

#### ✅ 解决方案
1. **依赖检查脚本**：
```bash
# 检查循环依赖
npx madge --circular --extensions ts,tsx shared/hooks/src
```

2. **架构重新设计**：确保依赖关系是单向的

### 2. 版本同步问题

#### 🔴 问题描述
不同项目中hooks包版本不一致导致的兼容性问题：

#### ✅ 解决方案
1. **workspace版本管理**：
```json
// 使用workspace协议确保版本一致
"@ai-code/hooks": "workspace:*"
```

2. **版本检查脚本**：
```bash
#!/bin/bash
# check-versions.sh
pnpm list @ai-code/hooks --depth=0 --json | jq '.[] | {name: .name, version: .version}'
```

---

## 🎯 解决方案总结

### 最佳实践

1. **渐进式迁移**：不要一次性迁移所有代码，分阶段进行
2. **完整测试覆盖**：每个hook都要有完整的单元测试
3. **文档先行**：先写好文档和示例，再开始迁移
4. **向后兼容**：保持API的向后兼容性，避免破坏性变更
5. **监控和回滚**：建立监控机制，出问题时能快速回滚

### 工具推荐

1. **madge**：检查循环依赖
2. **npm-check-updates**：检查依赖版本
3. **jest**：单元测试
4. **tsc**：类型检查
5. **eslint**：代码质量检查

---

## 📚 经验教训

### ✅ 成功经验

1. **早期规划**：在项目初期就考虑代码复用和模块化
2. **统一标准**：建立统一的代码规范和API设计标准
3. **充分测试**：迁移前后都要有充分的测试保证
4. **文档完善**：良好的文档能大大降低使用和维护成本
5. **团队协作**：让团队成员都参与到迁移过程中

### ❌ 避免的坑

1. **一次性大重构**：容易引入未知问题，难以定位
2. **忽略类型安全**：TypeScript类型定义不完整导致运行时错误
3. **构建顺序混乱**：没有正确处理项目间的构建依赖关系
4. **文档滞后**：代码改了但文档没有及时更新
5. **缺乏监控**：没有建立合适的监控机制来发现问题

---

## 🔧 故障排除检查清单

### 迁移前检查
- [ ] 识别所有需要迁移的hooks
- [ ] 分析hooks之间的依赖关系
- [ ] 设计统一的API接口
- [ ] 准备测试用例

### 迁移中检查
- [ ] 每个hook都有完整的TypeScript类型定义
- [ ] 所有导出都正确声明
- [ ] 构建配置正确
- [ ] 文档和示例完整

### 集成后检查
- [ ] 所有项目都能正确导入hooks
- [ ] 热重载功能正常
- [ ] 构建流程顺畅
- [ ] 类型检查通过
- [ ] 所有测试用例通过

### 部署前检查
- [ ] 生产环境构建成功
- [ ] 性能无明显退化
- [ ] 没有运行时错误
- [ ] 文档站点正常访问

---

## 📝 总结

通过这次Hooks独立化迁移，我们不仅解决了代码重复和维护困难的问题，还建立了一套完整的通用组件开发和维护流程。虽然过程中遇到了不少技术挑战，但通过系统性的分析和解决，最终达成了预期目标。

这个过程中积累的经验和解决方案，为后续类似的重构项目提供了宝贵的参考。最重要的是，我们建立了一个可持续维护和发展的hooks生态系统，为项目的长期发展奠定了良好的基础。

---

**文档维护**: 本文档会持续更新，记录新遇到的问题和解决方案。
**反馈**: 如果您在使用过程中遇到问题，请及时反馈给开发团队。 