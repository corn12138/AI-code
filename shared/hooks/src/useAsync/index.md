# useAsync

用于处理异步操作的 React Hook。

## 基本用法

```tsx
import { useAsync } from '@corn12138/hooks';

function MyComponent() {
  const { data, loading, error, execute } = useAsync(fetchData);
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && <p>Data: {JSON.stringify(data)}</p>}
      <button onClick={execute}>Fetch Data</button>
    </div>
  );
}
```

## 高级用法

```tsx
import { useAsync } from '@corn12138/hooks';

function DataComponent() {
  const { data, loading, error, execute } = useAsync(
    async () => {
      const response = await fetch('/api/data');
      return response.json();
    },
    { immediate: true }
  );
  
  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {data && <div>Data loaded: {data.length} items</div>}
    </div>
  );
}
```

## 与其他 Hook 结合

```tsx
import { useAsync } from '@corn12138/hooks';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const { data, loading, error } = useAsync(
    async () => {
      if (!query) return [];
      const response = await fetch(`/api/search?q=${query}`);
      return response.json();
    },
    { deps: [query] }
  );
  
  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {loading && <p>Searching...</p>}
      {data && <p>Found {data.length} results</p>}
    </div>
  );
}
```

## 实际应用示例

```tsx
import { useAsync } from '@corn12138/hooks';

interface User {
  id: number;
  name: string;
  email: string;
}

function UserProfile({ userId }: { userId: number }) {
  const { data: user, loading, error, execute } = useAsync<User>(
    async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('User not found');
      return response.json();
    },
    { immediate: true }
  );
  
  if (loading) return <div>Loading user...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>No user found</div>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <button onClick={execute}>Refresh</button>
    </div>
  );
}
```

## API

### 参数

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| asyncFunction | `(...args: any[]) => Promise<T>` | ✅ | 异步函数 |
| options | `UseAsyncOptions` | ❌ | 配置选项 |

### UseAsyncOptions

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| immediate | `boolean` | `false` | 是否立即执行 |
| retryCount | `number` | `0` | 重试次数 |
| retryDelay | `number` | `1000` | 重试延迟（毫秒） |
| onSuccess | `(data: T) => void` | - | 成功回调 |
| onError | `(error: Error) => void` | - | 错误回调 |

### 返回值

| 属性 | 类型 | 描述 |
|------|------|------|
| data | `T \| null` | 异步操作返回的数据 |
| loading | `boolean` | 是否正在加载 |
| error | `string \| null` | 错误信息 |
| execute | `(...args: any[]) => Promise<void>` | 执行异步函数 |
| reset | `() => void` | 重置所有状态 |
| cancel | `() => void` | 取消当前操作 |
| retry | `() => void` | 使用上次参数重试 |

## 最佳实践

### 1. 错误处理

```javascript
const { data, error, execute } = useAsync(
  async (userId) => {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      // 抛出具体的错误信息
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },
  {
    onError: (error) => {
      // 统一错误处理
      if (error.message.includes('404')) {
        console.error('用户不存在');
      } else {
        console.error('加载用户失败:', error.message);
      }
    }
  }
);
```

### 2. 防止内存泄漏

```javascript
function Component() {
  const { execute } = useAsync(
    async () => {
      // 长时间运行的异步操作
      const response = await fetch('/api/heavy-operation');
      return response.json();
    }
  );

  useEffect(() => {
    execute();
    
    // 组件卸载时会自动取消请求，无需手动处理
  }, [execute]);

  return <div>Component</div>;
}
```

### 3. 条件执行

```javascript
function UserPosts({ userId }) {
  const { data: posts, loading, execute } = useAsync(
    async (id) => {
      const response = await fetch(`/api/users/${id}/posts`);
      return response.json();
    }
  );

  useEffect(() => {
    // 只在有 userId 时才执行
    if (userId) {
      execute(userId);
    }
  }, [userId, execute]);

  if (!userId) return <div>请选择用户</div>;
  if (loading) return <div>加载中...</div>;
  
  return (
    <div>
      {posts?.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

## 注意事项

1. **组件卸载时自动清理**：Hook 会在组件卸载时自动取消正在进行的请求
2. **重试机制**：失败时会根据 `retryCount` 自动重试，每次重试间隔 `retryDelay` 毫秒
3. **参数缓存**：`retry()` 方法会使用上次 `execute()` 的参数
4. **错误类型**：错误信息统一转换为字符串类型
5. **并发控制**：新的 `execute()` 调用会取消之前的请求 