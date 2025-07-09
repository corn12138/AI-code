# useAsync

异步操作管理 Hook，提供 loading、error、data 状态管理，支持取消操作和重试机制。

## 基础用法

```javascript
import { useAsync } from '@ai-code/hooks';

function UserProfile({ userId }) {
  const { data: user, loading, error, execute } = useAsync(
    async (id) => {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    }
  );

  // 手动触发请求
  const loadUser = () => {
    execute(userId);
  };

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;
  if (!user) return <button onClick={loadUser}>加载用户</button>;

  return (
    <div>
      <h2>用户信息</h2>
      <p>姓名: {user.name}</p>
      <p>邮箱: {user.email}</p>
      <button onClick={loadUser}>刷新</button>
    </div>
  );
}
```

## 高级用法

### 自动重试

```javascript
import { useAsync } from '@ai-code/hooks';

function DataList() {
  const { data, loading, error, execute, retry } = useAsync(
    async () => {
      // 可能失败的 API 调用
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('网络错误');
      return response.json();
    },
    {
      retryCount: 3,        // 失败后重试 3 次
      retryDelay: 2000,     // 每次重试间隔 2 秒
      onError: (error) => {
        console.error('请求失败:', error);
      },
      onSuccess: (data) => {
        console.log('请求成功:', data);
      }
    }
  );

  return (
    <div>
      {loading && <div>加载中...</div>}
      {error && (
        <div>
          <p>错误: {error}</p>
          <button onClick={retry}>重试</button>
        </div>
      )}
      {data && (
        <ul>
          {data.map(item => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      )}
      <button onClick={() => execute()}>刷新数据</button>
    </div>
  );
}
```

### 请求取消

```javascript
import { useAsync } from '@ai-code/hooks';

function SearchResults() {
  const { data, loading, execute, cancel } = useAsync(
    async (query) => {
      // 模拟慢速 API
      await new Promise(resolve => setTimeout(resolve, 2000));
      const response = await fetch(`/api/search?q=${query}`);
      return response.json();
    }
  );

  const handleSearch = (query) => {
    execute(query);
  };

  const handleCancel = () => {
    cancel(); // 取消当前请求
  };

  return (
    <div>
      <input 
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="搜索..."
      />
      {loading && (
        <div>
          <span>搜索中...</span>
          <button onClick={handleCancel}>取消</button>
        </div>
      )}
      {data && (
        <div>
          <h3>搜索结果</h3>
          {data.results.map(item => (
            <div key={item.id}>{item.title}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 与 useEffect 结合使用

```javascript
import { useAsync } from '@ai-code/hooks';
import { useEffect } from 'react';

function PostDetail({ postId }) {
  const { data: post, loading, error, execute } = useAsync(
    async (id) => {
      const response = await fetch(`/api/posts/${id}`);
      return response.json();
    }
  );

  // 当 postId 变化时自动加载
  useEffect(() => {
    if (postId) {
      execute(postId);
    }
  }, [postId, execute]);

  if (loading) return <div>加载文章...</div>;
  if (error) return <div>加载失败: {error}</div>;
  if (!post) return null;

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
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