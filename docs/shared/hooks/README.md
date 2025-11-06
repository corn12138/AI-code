# 🪝 Hooks 库文档

AI-Code 项目的 React Hooks 共享库，提供可复用的状态管理和业务逻辑。

## 📋 文档导航

### 📊 项目概览
- [项目总结](./project-summary.md) - Hooks 项目整体介绍和功能概览
- [独立化指南](./independence.md) - Hooks 独立化开发指南
- [实现详情](./implementation.md) - 独立化实现的技术细节

### 🔧 开发指南
- [迁移指南](./migration.md) - 迁移过程中的问题和解决方案
- [故障排除](./troubleshooting.md) - 常见问题和解决方案
- [工作流程](./workflow.md) - 开发工作流程和最佳实践

## 🚀 快速开始

### 安装
```bash
pnpm add @corn12138/hooks
```

### 基础使用
```typescript
import { useAuth, useApi, useLocalStorage } from '@corn12138/hooks';

function MyComponent() {
  // 认证相关
  const { user, login, logout, isAuthenticated } = useAuth();
  
  // API 调用
  const { data, loading, error, refetch } = useApi('/api/users');
  
  // 本地存储
  const [value, setValue] = useLocalStorage('key', 'default');
  
  return (
    <div>
      {isAuthenticated ? `欢迎, ${user?.name}` : '请登录'}
      {loading ? '加载中...' : data?.map(item => <div key={item.id}>{item.name}</div>)}
    </div>
  );
}
```

## 📚 可用 Hooks

### 🔐 认证相关
- `useAuth` - 用户认证状态管理
- `usePermissions` - 权限管理
- `useSession` - 会话管理

### 🌐 网络请求
- `useApi` - API 请求封装
- `useQuery` - 数据查询
- `useMutation` - 数据变更

### 💾 状态管理
- `useLocalStorage` - 本地存储
- `useSessionStorage` - 会话存储
- `useDebounce` - 防抖处理
- `useThrottle` - 节流处理

### 🎨 UI 交互
- `useToggle` - 开关状态
- `useModal` - 模态框管理
- `useToast` - 消息提示
- `useLoading` - 加载状态

### 📱 设备相关
- `useMediaQuery` - 媒体查询
- `useDevice` - 设备检测
- `useGeolocation` - 地理位置
- `useOnline` - 网络状态

## 🛠️ 开发指南

### 创建自定义 Hook
```typescript
import { useState, useEffect } from 'react';

export function useCustomHook(initialValue: string) {
  const [value, setValue] = useState(initialValue);
  
  useEffect(() => {
    // 自定义逻辑
  }, [value]);
  
  return { value, setValue };
}
```

### 测试 Hooks
```typescript
import { renderHook, act } from '@testing-library/react';
import { useCustomHook } from './useCustomHook';

test('should update value', () => {
  const { result } = renderHook(() => useCustomHook('initial'));
  
  act(() => {
    result.current.setValue('updated');
  });
  
  expect(result.current.value).toBe('updated');
});
```

## 📦 发布流程

### 版本管理
- 遵循语义化版本控制
- 主版本号：不兼容的 API 修改
- 次版本号：向下兼容的功能性新增
- 修订号：向下兼容的问题修正

### 发布步骤
1. 更新版本号
2. 运行测试
3. 构建包
4. 发布到 NPM

## 🔗 相关链接

- [UI 组件库](../ui/) - 配套的 UI 组件
- [工具函数库](../utils/) - 工具函数支持
- [应用文档](../../apps/) - 各应用中的使用示例

---

*最后更新: 2025-01-03*
*维护者: AI Assistant*
