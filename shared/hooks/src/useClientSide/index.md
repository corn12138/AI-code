# useClientSide

客户端渲染相关的Hooks，主要用于解决SSR/SSG环境下的问题。

## useClientSide

检测当前是否在客户端环境。

```tsx
import { useClientSide } from '@ai-code/hooks';

function MyComponent() {
  const isClient = useClientSide();

  return (
    <div>
      {isClient ? (
        <ClientOnlyComponent />
      ) : (
        <div>服务端渲染占位符</div>
      )}
    </div>
  );
}
```

## useClientSideEffect

只在客户端执行副作用。

```tsx
import { useClientSideEffect } from '@ai-code/hooks';

function MyComponent() {
  useClientSideEffect(() => {
    // 只在客户端执行
    const timer = setInterval(() => {
      console.log('客户端定时器');
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <div>组件内容</div>;
}
```

## useClientState

客户端状态管理。

```tsx
import { useClientState } from '@ai-code/hooks';

function MyComponent() {
  const [count, setCount] = useClientState(0);

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        增加
      </button>
    </div>
  );
}
``` 