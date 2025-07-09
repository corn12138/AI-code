# useApi

API 请求管理 Hook，基于 useAsync 构建，提供简洁的 RESTful API 调用接口，支持请求取消、错误处理和数据转换。

## 基础用法

```javascript
import { useApi } from '@ai-code/hooks';

function UserList() {
  const { data: users, loading, error, get } = useApi({
    baseURL: 'https://api.example.com'
  });

  const loadUsers = () => {
    get('/users');
  };

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div>
      <h2>用户列表</h2>
      <button onClick={loadUsers}>加载用户</button>
      
      {users && (
        <ul>
          {users.map(user => (
            <li key={user.id}>{user.name} - {user.email}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## 高级用法

### CRUD 操作

```javascript
import { useApi } from '@ai-code/hooks';
import { useState } from 'react';

function UserManager() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '' });

  const { 
    data: users, 
    loading, 
    error, 
    get, 
    post, 
    put, 
    delete: deleteUser 
  } = useApi({
    baseURL: '/api',
    onSuccess: (data) => {
      console.log('请求成功:', data);
      // 成功后重新加载用户列表
      if (data && !Array.isArray(data)) {
        loadUsers();
      }
    },
    onError: (error) => {
      console.error('请求失败:', error);
      alert('操作失败: ' + error.message);
    }
  });

  const loadUsers = () => get('/users');

  const createUser = async () => {
    await post('/users', formData);
    setFormData({ name: '', email: '' });
  };

  const updateUser = async () => {
    if (!selectedUser) return;
    await put(`/users/${selectedUser.id}`, formData);
    setSelectedUser(null);
    setFormData({ name: '', email: '' });
  };

  const removeUser = async (userId) => {
    if (confirm('确定要删除这个用户吗？')) {
      await deleteUser(`/users/${userId}`);
    }
  };

  const selectUserForEdit = (user) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <div>
        <h3>用户列表</h3>
        <button onClick={loadUsers} disabled={loading}>
          {loading ? '加载中...' : '刷新用户'}
        </button>
        
        {error && <div style={{ color: 'red' }}>错误: {error}</div>}
        
        {users && (
          <div style={{ marginTop: '16px' }}>
            {users.map(user => (
              <div key={user.id} style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '8px'
              }}>
                <div><strong>{user.name}</strong></div>
                <div style={{ color: '#666' }}>{user.email}</div>
                <div style={{ marginTop: '8px' }}>
                  <button onClick={() => selectUserForEdit(user)}>编辑</button>
                  <button 
                    onClick={() => removeUser(user.id)}
                    style={{ marginLeft: '8px', color: 'red' }}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3>{selectedUser ? '编辑用户' : '创建用户'}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            placeholder="姓名"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
          
          <input
            type="email"
            placeholder="邮箱"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
          
          <div>
            <button 
              onClick={selectedUser ? updateUser : createUser}
              disabled={loading || !formData.name || !formData.email}
            >
              {loading ? '提交中...' : (selectedUser ? '更新' : '创建')}
            </button>
            
            {selectedUser && (
              <button 
                onClick={() => {
                  setSelectedUser(null);
                  setFormData({ name: '', email: '' });
                }}
                style={{ marginLeft: '8px' }}
              >
                取消
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 数据转换和验证

```javascript
import { useApi } from '@ai-code/hooks';
import { useState } from 'react';

// 数据转换函数
const transformUserData = (data) => {
  if (Array.isArray(data)) {
    return data.map(user => ({
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      displayEmail: user.email.toLowerCase(),
      createdAt: new Date(user.createdAt)
    }));
  }
  
  return {
    ...data,
    fullName: `${data.firstName} ${data.lastName}`,
    displayEmail: data.email.toLowerCase(),
    createdAt: new Date(data.createdAt)
  };
};

function TransformedApiData() {
  const [userId, setUserId] = useState('');
  
  const { data, loading, error, get } = useApi({
    baseURL: 'https://jsonplaceholder.typicode.com',
    headers: {
      'Authorization': 'Bearer your-token',
      'X-Custom-Header': 'custom-value'
    },
    transform: transformUserData,
    onSuccess: (data) => {
      console.log('转换后的数据:', data);
    },
    onError: (error) => {
      console.error('API错误:', error);
      // 可以在这里添加错误上报
    }
  });

  const fetchUser = () => {
    if (userId) {
      get(`/users/${userId}`);
    }
  };

  const fetchAllUsers = () => {
    get('/users');
  };

  return (
    <div>
      <h2>数据转换示例</h2>
      
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="输入用户ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{ marginRight: '8px' }}
        />
        <button onClick={fetchUser} disabled={loading || !userId}>
          获取单个用户
        </button>
        <button onClick={fetchAllUsers} disabled={loading} style={{ marginLeft: '8px' }}>
          获取所有用户
        </button>
      </div>

      {loading && <div>加载中...</div>}
      {error && <div style={{ color: 'red' }}>错误: {error}</div>}
      
      {data && (
        <div>
          <h3>转换后的数据</h3>
          <pre style={{
            backgroundColor: '#f5f5f5',
            padding: '16px',
            borderRadius: '4px',
            overflow: 'auto'
          }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
```

### 并发请求管理

```javascript
import { useApi } from '@ai-code/hooks';
import { useState, useEffect } from 'react';

function ConcurrentRequests() {
  const [activeRequests, setActiveRequests] = useState(0);
  
  // 用户数据API
  const userApi = useApi({
    baseURL: '/api',
    onSuccess: () => {
      setActiveRequests(prev => prev - 1);
    },
    onError: () => {
      setActiveRequests(prev => prev - 1);
    }
  });

  // 文章数据API
  const postApi = useApi({
    baseURL: '/api',
    onSuccess: () => {
      setActiveRequests(prev => prev - 1);
    },
    onError: () => {
      setActiveRequests(prev => prev - 1);
    }
  });

  // 评论数据API
  const commentApi = useApi({
    baseURL: '/api',
    onSuccess: () => {
      setActiveRequests(prev => prev - 1);
    },
    onError: () => {
      setActiveRequests(prev => prev - 1);
    }
  });

  const loadAllData = () => {
    setActiveRequests(3);
    userApi.get('/users');
    postApi.get('/posts');
    commentApi.get('/comments');
  };

  const cancelAllRequests = () => {
    userApi.reset();
    postApi.reset();
    commentApi.reset();
    setActiveRequests(0);
  };

  const isAnyLoading = userApi.loading || postApi.loading || commentApi.loading;
  const hasAnyError = userApi.error || postApi.error || commentApi.error;

  return (
    <div>
      <h2>并发请求管理</h2>
      
      <div style={{ marginBottom: '16px' }}>
        <button onClick={loadAllData} disabled={isAnyLoading}>
          加载所有数据
        </button>
        <button 
          onClick={cancelAllRequests} 
          disabled={!isAnyLoading}
          style={{ marginLeft: '8px', color: 'red' }}
        >
          取消所有请求
        </button>
        
        <div style={{ marginTop: '8px' }}>
          活跃请求数: {activeRequests}
          {isAnyLoading && <span style={{ color: 'blue', marginLeft: '8px' }}>请求进行中...</span>}
        </div>
      </div>

      {hasAnyError && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffeaea', 
          padding: '12px', 
          borderRadius: '4px',
          marginBottom: '16px' 
        }}>
          <h4>错误信息:</h4>
          {userApi.error && <div>用户数据: {userApi.error}</div>}
          {postApi.error && <div>文章数据: {postApi.error}</div>}
          {commentApi.error && <div>评论数据: {commentApi.error}</div>}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <div>
          <h3>用户数据 {userApi.loading && '(加载中...)'}</h3>
          {userApi.data && (
            <div>
              <p>用户数量: {userApi.data.length}</p>
              <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                {userApi.data.slice(0, 5).map(user => (
                  <div key={user.id} style={{ padding: '8px', border: '1px solid #eee', margin: '4px 0' }}>
                    {user.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <h3>文章数据 {postApi.loading && '(加载中...)'}</h3>
          {postApi.data && (
            <div>
              <p>文章数量: {postApi.data.length}</p>
              <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                {postApi.data.slice(0, 5).map(post => (
                  <div key={post.id} style={{ padding: '8px', border: '1px solid #eee', margin: '4px 0' }}>
                    {post.title}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <h3>评论数据 {commentApi.loading && '(加载中...)'}</h3>
          {commentApi.data && (
            <div>
              <p>评论数量: {commentApi.data.length}</p>
              <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                {commentApi.data.slice(0, 5).map(comment => (
                  <div key={comment.id} style={{ padding: '8px', border: '1px solid #eee', margin: '4px 0' }}>
                    {comment.body.substring(0, 50)}...
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 条件请求和缓存

```javascript
import { useApi } from '@ai-code/hooks';
import { useLocalStorage } from '@ai-code/hooks';
import { useState, useEffect } from 'react';

function CachedApiRequests() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cache, setCache] = useLocalStorage('apiCache', {});
  const [useCache, setUseCache] = useState(true);
  
  const { data, loading, error, get } = useApi({
    baseURL: 'https://jsonplaceholder.typicode.com',
    onSuccess: (data) => {
      // 缓存成功的响应
      if (useCache && searchTerm) {
        setCache(prev => ({
          ...prev,
          [searchTerm]: {
            data,
            timestamp: Date.now()
          }
        }));
      }
    }
  });

  const searchUsers = () => {
    if (!searchTerm) return;

    // 检查缓存
    const cachedData = cache[searchTerm];
    const cacheValid = cachedData && (Date.now() - cachedData.timestamp < 5 * 60 * 1000); // 5分钟缓存

    if (useCache && cacheValid) {
      console.log('使用缓存数据');
      // 这里可以设置缓存数据到状态中
      return;
    }

    // 发起新请求
    get(`/users?q=${searchTerm}`);
  };

  const clearCache = () => {
    setCache({});
  };

  const getCacheInfo = () => {
    const cacheKeys = Object.keys(cache);
    const cacheSize = JSON.stringify(cache).length;
    return { keys: cacheKeys, size: cacheSize };
  };

  const cacheInfo = getCacheInfo();

  return (
    <div>
      <h2>条件请求和缓存</h2>
      
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="搜索用户..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
          />
          <button onClick={searchUsers} disabled={loading || !searchTerm}>
            {loading ? '搜索中...' : '搜索'}
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label>
            <input
              type="checkbox"
              checked={useCache}
              onChange={(e) => setUseCache(e.target.checked)}
            />
            启用缓存 (5分钟)
          </label>
          
          <button onClick={clearCache} style={{ fontSize: '12px' }}>
            清除缓存
          </button>
        </div>
      </div>

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '12px', 
        borderRadius: '4px',
        marginBottom: '16px'
      }}>
        <h4>缓存信息</h4>
        <p>缓存条目: {cacheInfo.keys.length}</p>
        <p>缓存大小: {(cacheInfo.size / 1024).toFixed(2)} KB</p>
        {cacheInfo.keys.length > 0 && (
          <div>
            <p>缓存键: {cacheInfo.keys.join(', ')}</p>
          </div>
        )}
      </div>

      {error && <div style={{ color: 'red' }}>错误: {error}</div>}
      
      {data && (
        <div>
          <h3>搜索结果</h3>
          <div>
            {data.map(user => (
              <div key={user.id} style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '8px'
              }}>
                <div><strong>{user.name}</strong></div>
                <div style={{ color: '#666' }}>{user.email}</div>
                <div style={{ color: '#666' }}>{user.phone}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

## API

### 参数

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| options | `UseApiOptions<T>` | ❌ | 配置选项 |

### UseApiOptions

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| baseURL | `string` | `''` | API 基础URL |
| headers | `Record<string, string>` | `{}` | 默认请求头 |
| transform | `(data: any) => T` | `(data) => data` | 数据转换函数 |
| onSuccess | `(data: T) => void` | - | 成功回调 |
| onError | `(error: Error) => void` | - | 错误回调 |

### 返回值

返回 `UseApiReturn<T>` 对象：

| 属性 | 类型 | 描述 |
|------|------|------|
| data | `T \| null` | 响应数据 |
| loading | `boolean` | 是否正在加载 |
| error | `string \| null` | 错误信息 |
| request | `(url: string, options?: RequestInit) => Promise<void>` | 通用请求方法 |
| get | `(url: string, options?: RequestInit) => Promise<void>` | GET 请求 |
| post | `(url: string, data?: any, options?: RequestInit) => Promise<void>` | POST 请求 |
| put | `(url: string, data?: any, options?: RequestInit) => Promise<void>` | PUT 请求 |
| delete | `(url: string, options?: RequestInit) => Promise<void>` | DELETE 请求 |
| reset | `() => void` | 重置状态并取消请求 |

## 使用场景

### 1. RESTful API 操作

```javascript
function ProductManager() {
  const { data: products, loading, get, post, put, delete: deleteProduct } = useApi({
    baseURL: '/api/products'
  });

  const loadProducts = () => get('');
  const createProduct = (product) => post('', product);
  const updateProduct = (id, product) => put(`/${id}`, product);
  const removeProduct = (id) => deleteProduct(`/${id}`);

  return (
    <div>
      {/* 产品管理界面 */}
    </div>
  );
}
```

### 2. 文件上传

```javascript
function FileUpload() {
  const { loading, post, data } = useApi({
    baseURL: '/api'
  });

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    await post('/upload', formData, {
      headers: {
        // 不设置 Content-Type，让浏览器自动设置
      }
    });
  };

  return (
    <div>
      <input type="file" onChange={(e) => uploadFile(e.target.files[0])} />
      {loading && <p>上传中...</p>}
      {data && <p>上传成功: {data.url}</p>}
    </div>
  );
}
```

### 3. 分页数据

```javascript
function PaginatedList() {
  const [page, setPage] = useState(1);
  const { data, loading, get } = useApi({
    baseURL: '/api'
  });

  useEffect(() => {
    get(`/items?page=${page}&limit=10`);
  }, [page]);

  return (
    <div>
      {data && (
        <>
          {data.items.map(item => <div key={item.id}>{item.name}</div>)}
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
            上一页
          </button>
          <button onClick={() => setPage(p => p + 1)} disabled={page === data.totalPages}>
            下一页
          </button>
        </>
      )}
    </div>
  );
}
```

## 最佳实践

### 1. 错误处理

```javascript
const { data, error, get } = useApi({
  onError: (error) => {
    // 全局错误处理
    if (error.message.includes('401')) {
      // 未授权，重定向到登录页
      window.location.href = '/login';
    } else if (error.message.includes('500')) {
      // 服务器错误，显示友好提示
      showNotification('服务器暂时不可用，请稍后重试');
    }
  }
});
```

### 2. 请求拦截

```javascript
const { request } = useApi({
  headers: {
    'Authorization': `Bearer ${getToken()}`,
    'X-Request-ID': generateRequestId()
  },
  transform: (data) => {
    // 统一处理响应格式
    if (data.code === 0) {
      return data.data;
    }
    throw new Error(data.message || '请求失败');
  }
});
```

### 3. 类型安全

```javascript
interface User {
  id: number;
  name: string;
  email: string;
}

const { data, get } = useApi<User[]>({
  baseURL: '/api'
});

// data 现在有完整的类型提示
const firstUser = data?.[0]?.name;
```

## 注意事项

1. **请求取消**：Hook 会自动取消之前未完成的请求，避免竞态条件
2. **内存泄漏**：组件卸载时会自动清理请求，无需手动处理
3. **错误边界**：建议配合错误边界组件使用，处理意外错误
4. **缓存策略**：Hook 本身不提供缓存，需要配合其他状态管理方案
5. **并发限制**：对于大量并发请求，需要考虑浏览器和服务器的限制 