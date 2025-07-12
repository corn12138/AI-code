# useClientSide

用于在客户端环境中安全执行代码的 React Hook。

## 基本用法

```tsx
import { useClientSide } from '@corn12138/hooks';

function MyComponent() {
  const isClient = useClientSide();
  
  return (
    <div>
      {isClient ? (
        <div>这是客户端内容</div>
      ) : (
        <div>这是服务端内容</div>
      )}
    </div>
  );
}
```

## 高级用法

```tsx
import { useClientSideEffect } from '@corn12138/hooks';

function BrowserOnlyComponent() {
  useClientSideEffect(() => {
    // 这个代码只在客户端运行
    console.log('客户端代码');
  }, []);
  
  return <div>Browser only content</div>;
}
```

## 状态管理

```tsx
import { useClientState } from '@corn12138/hooks';

function StatefulComponent() {
  const [count, setCount] = useClientState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
``` 