---
title: 简单示例
nav:
  title: 简单示例
  order: 3
---

# 🎯 简单示例演示

如果主示例页面有问题，这里提供了更简单的演示版本。

## 🔧 防抖演示

<code src="./components/SimpleDemo.tsx"></code>

## 📝 表单状态管理

<code src="./components/FormDemo.tsx"></code>

## 🌐 网络状态监控

<code src="./components/NetworkStatusDemo.tsx"></code>

## 🔐 用户认证管理

<code src="./components/AuthDemo.tsx"></code>

## 🌍 API请求封装

<code src="./components/ApiDemo.tsx"></code>

## 💻 客户端检测

<code src="./components/ClientSideDemo.tsx"></code>

## 🎨 低代码编辑器

<code src="./components/EditorDemo.tsx"></code>

---

## 💡 如何创建交互式示例

### 方法一：使用 `<code src="">` 标签

```markdown
<code src="./components/YourComponent.tsx"></code>
```

### 方法二：直接在 markdown 中写 tsx

```tsx
import React, { useState } from 'react';

export default function InlineDemo() {
  const [count, setCount] = useState(0);
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc' }}>
      <p>计数器: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        点击 +1
      </button>
    </div>
  );
}
```

### 方法三：使用本地 hooks 实现

如果导入外部包有问题，可以在组件内部实现简化版本的 hooks：

```typescript
// 简单的防抖实现
function useSimpleDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

## 🛠️ 实现要点

### ✅ 成功要素

1. **自包含组件** - 组件应该包含所有必需的依赖
2. **明确的导出** - 使用 `export default`
3. **内联样式** - 避免依赖外部CSS
4. **错误处理** - 提供友好的错误反馈
5. **清晰的说明** - 添加使用提示

### 🎯 最佳实践

- **避免复杂依赖** - 尽量使用原生 React hooks
- **提供 Mock 数据** - 不依赖真实 API
- **响应式设计** - 确保在不同设备上都能正常显示
- **性能优化** - 使用 useMemo, useCallback 等优化性能

### 📁 推荐文件结构

```
docs/
├── index.md              # 首页
├── examples.md           # 主要示例页面
├── simple-examples.md    # 简化示例页面
└── components/           # 示例组件目录
    ├── SimpleDemo.tsx    # 简单演示组件
    ├── AsyncDemo.tsx     # 异步操作演示
    └── FormDemo.tsx      # 表单演示
``` 