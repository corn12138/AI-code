# 📚 共享库文档

AI-Code 项目的共享库文档，包含所有共享组件、工具和逻辑的使用指南。基于现代化的 TypeScript 技术栈，提供企业级的共享组件和工具。

## 🛠️ 技术栈详情

### 核心框架
- **TypeScript**: 类型安全的开发语言
- **React**: 18+ (UI 组件库基础)
- **Rollup**: 模块打包工具
- **Jest**: 测试框架
- **ESLint**: 代码检查
- **Prettier**: 代码格式化

### Hooks 库技术栈
- **React Hooks**: 自定义 Hook 开发
- **TypeScript**: 完整的类型定义
- **Rollup**: ESM/UMD 双格式打包
- **Jest**: 单元测试
- **Testing Library**: React 组件测试
- **Dumi**: 文档生成和展示

### UI 组件库技术栈
- **React**: 组件开发框架
- **TypeScript**: 类型安全
- **Tailwind CSS**: 样式框架
- **Storybook**: 组件展示 (可选)

### 工具函数库技术栈
- **TypeScript**: 类型安全
- **Lodash**: 工具函数增强
- **Date-fns**: 日期处理
- **Jest**: 单元测试

### 认证库技术栈
- **React Context**: 状态管理
- **JWT**: 令牌处理
- **Axios**: HTTP 请求
- **TypeScript**: 类型安全

## 📋 共享库分类

### 🪝 Hooks 库
- [项目总结](./hooks/project-summary.md) - Hooks 项目整体介绍
- [独立化指南](./hooks/independence.md) - Hooks 独立化开发指南
- [实现详情](./hooks/implementation.md) - 独立化实现细节
- [迁移指南](./hooks/migration.md) - 迁移问题和解决方案
- [故障排除](./hooks/troubleshooting.md) - 常见问题和解决方案
- [工作流程](./hooks/workflow.md) - 开发工作流程

### 🎨 UI 组件库
- [组件文档](./ui/README.md) - UI 组件使用指南
- [设计规范](./ui/design-guidelines.md) - 设计规范和最佳实践
- [主题系统](./ui/theming.md) - 主题和样式系统

### 🔧 工具函数库
- [工具函数](./utils/README.md) - 工具函数使用指南
- [API 文档](./utils/api.md) - 工具函数 API 文档
- [最佳实践](./utils/best-practices.md) - 使用最佳实践

### 🔐 认证库
- [认证系统](./auth/README.md) - 认证系统使用指南
- [安全配置](./auth/security.md) - 安全配置和最佳实践
- [集成指南](./auth/integration.md) - 认证集成指南

## 🚀 快速开始

### 使用 Hooks
```typescript
import { useAuth, useApi } from '@corn12138/hooks';

function MyComponent() {
  const { user, login, logout } = useAuth();
  const { data, loading, error } = useApi('/api/users');
  
  return (
    <div>
      {user ? `欢迎, ${user.name}` : '请登录'}
    </div>
  );
}
```

### 使用 UI 组件
```typescript
import { Button, Card, Input } from '@corn12138/ui';

function MyPage() {
  return (
    <Card>
      <Input placeholder="请输入内容" />
      <Button>提交</Button>
    </Card>
  );
}
```

### 使用工具函数
```typescript
import { formatDate, debounce } from '@corn12138/utils';

const formattedDate = formatDate(new Date());
const debouncedSearch = debounce(searchFunction, 300);
```

## 📦 包管理

### 安装依赖
```bash
# 安装所有共享库
pnpm add @corn12138/hooks @corn12138/ui @corn12138/utils @corn12138/auth

# 或安装特定库
pnpm add @corn12138/hooks
```

### 版本管理
- 所有共享库使用统一的版本号
- 遵循语义化版本控制
- 支持独立发布和更新

## 🔗 相关链接

- [应用文档](../apps/) - 各应用中的共享库使用示例
- [技术指南](../guides/) - 开发指南和最佳实践
- [项目报告](../reports/) - 共享库开发报告

---

*最后更新: 2025-01-03*
*维护者: AI Assistant*
