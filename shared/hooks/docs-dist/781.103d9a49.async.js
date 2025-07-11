"use strict";(self.webpackChunk_corn12138_hooks=self.webpackChunk_corn12138_hooks||[]).push([[781],{94781:function(t,n,e){e.r(n),e.d(n,{texts:function(){return a}});const a=[{value:"API \u8BF7\u6C42\u7BA1\u7406 Hook\uFF0C\u57FA\u4E8E useAsync \u6784\u5EFA\uFF0C\u63D0\u4F9B\u7B80\u6D01\u7684 RESTful API \u8C03\u7528\u63A5\u53E3\uFF0C\u652F\u6301\u8BF7\u6C42\u53D6\u6D88\u3001\u9519\u8BEF\u5904\u7406\u548C\u6570\u636E\u8F6C\u6362\u3002",paraId:0,tocIndex:0},{value:`import { useApi } from '@ai-code/hooks';

function UserList() {
  const { data: users, loading, error, get } = useApi({
    baseURL: 'https://api.example.com'
  });

  const loadUsers = () => {
    get('/users');
  };

  if (loading) return <div>\u52A0\u8F7D\u4E2D...</div>;
  if (error) return <div>\u9519\u8BEF: {error}</div>;

  return (
    <div>
      <h2>\u7528\u6237\u5217\u8868</h2>
      <button onClick={loadUsers}>\u52A0\u8F7D\u7528\u6237</button>
      
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
`,paraId:1,tocIndex:1},{value:`import { useApi } from '@ai-code/hooks';
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
      console.log('\u8BF7\u6C42\u6210\u529F:', data);
      // \u6210\u529F\u540E\u91CD\u65B0\u52A0\u8F7D\u7528\u6237\u5217\u8868
      if (data && !Array.isArray(data)) {
        loadUsers();
      }
    },
    onError: (error) => {
      console.error('\u8BF7\u6C42\u5931\u8D25:', error);
      alert('\u64CD\u4F5C\u5931\u8D25: ' + error.message);
    }
  });

  const loadUsers = () => get('/users');

  const createUser = async () => {
    await post('/users', formData);
    setFormData({ name: '', email: '' });
  };

  const updateUser = async () => {
    if (!selectedUser) return;
    await put(\`/users/\${selectedUser.id}\`, formData);
    setSelectedUser(null);
    setFormData({ name: '', email: '' });
  };

  const removeUser = async (userId) => {
    if (confirm('\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u7528\u6237\u5417\uFF1F')) {
      await deleteUser(\`/users/\${userId}\`);
    }
  };

  const selectUserForEdit = (user) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <div>
        <h3>\u7528\u6237\u5217\u8868</h3>
        <button onClick={loadUsers} disabled={loading}>
          {loading ? '\u52A0\u8F7D\u4E2D...' : '\u5237\u65B0\u7528\u6237'}
        </button>
        
        {error && <div style={{ color: 'red' }}>\u9519\u8BEF: {error}</div>}
        
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
                  <button onClick={() => selectUserForEdit(user)}>\u7F16\u8F91</button>
                  <button 
                    onClick={() => removeUser(user.id)}
                    style={{ marginLeft: '8px', color: 'red' }}
                  >
                    \u5220\u9664
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3>{selectedUser ? '\u7F16\u8F91\u7528\u6237' : '\u521B\u5EFA\u7528\u6237'}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            placeholder="\u59D3\u540D"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
          
          <input
            type="email"
            placeholder="\u90AE\u7BB1"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
          
          <div>
            <button 
              onClick={selectedUser ? updateUser : createUser}
              disabled={loading || !formData.name || !formData.email}
            >
              {loading ? '\u63D0\u4EA4\u4E2D...' : (selectedUser ? '\u66F4\u65B0' : '\u521B\u5EFA')}
            </button>
            
            {selectedUser && (
              <button 
                onClick={() => {
                  setSelectedUser(null);
                  setFormData({ name: '', email: '' });
                }}
                style={{ marginLeft: '8px' }}
              >
                \u53D6\u6D88
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
`,paraId:2,tocIndex:3},{value:`import { useApi } from '@ai-code/hooks';
import { useState } from 'react';

// \u6570\u636E\u8F6C\u6362\u51FD\u6570
const transformUserData = (data) => {
  if (Array.isArray(data)) {
    return data.map(user => ({
      ...user,
      fullName: \`\${user.firstName} \${user.lastName}\`,
      displayEmail: user.email.toLowerCase(),
      createdAt: new Date(user.createdAt)
    }));
  }
  
  return {
    ...data,
    fullName: \`\${data.firstName} \${data.lastName}\`,
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
      console.log('\u8F6C\u6362\u540E\u7684\u6570\u636E:', data);
    },
    onError: (error) => {
      console.error('API\u9519\u8BEF:', error);
      // \u53EF\u4EE5\u5728\u8FD9\u91CC\u6DFB\u52A0\u9519\u8BEF\u4E0A\u62A5
    }
  });

  const fetchUser = () => {
    if (userId) {
      get(\`/users/\${userId}\`);
    }
  };

  const fetchAllUsers = () => {
    get('/users');
  };

  return (
    <div>
      <h2>\u6570\u636E\u8F6C\u6362\u793A\u4F8B</h2>
      
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="\u8F93\u5165\u7528\u6237ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{ marginRight: '8px' }}
        />
        <button onClick={fetchUser} disabled={loading || !userId}>
          \u83B7\u53D6\u5355\u4E2A\u7528\u6237
        </button>
        <button onClick={fetchAllUsers} disabled={loading} style={{ marginLeft: '8px' }}>
          \u83B7\u53D6\u6240\u6709\u7528\u6237
        </button>
      </div>

      {loading && <div>\u52A0\u8F7D\u4E2D...</div>}
      {error && <div style={{ color: 'red' }}>\u9519\u8BEF: {error}</div>}
      
      {data && (
        <div>
          <h3>\u8F6C\u6362\u540E\u7684\u6570\u636E</h3>
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
`,paraId:3,tocIndex:4},{value:`import { useApi } from '@ai-code/hooks';
import { useState, useEffect } from 'react';

function ConcurrentRequests() {
  const [activeRequests, setActiveRequests] = useState(0);
  
  // \u7528\u6237\u6570\u636EAPI
  const userApi = useApi({
    baseURL: '/api',
    onSuccess: () => {
      setActiveRequests(prev => prev - 1);
    },
    onError: () => {
      setActiveRequests(prev => prev - 1);
    }
  });

  // \u6587\u7AE0\u6570\u636EAPI
  const postApi = useApi({
    baseURL: '/api',
    onSuccess: () => {
      setActiveRequests(prev => prev - 1);
    },
    onError: () => {
      setActiveRequests(prev => prev - 1);
    }
  });

  // \u8BC4\u8BBA\u6570\u636EAPI
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
      <h2>\u5E76\u53D1\u8BF7\u6C42\u7BA1\u7406</h2>
      
      <div style={{ marginBottom: '16px' }}>
        <button onClick={loadAllData} disabled={isAnyLoading}>
          \u52A0\u8F7D\u6240\u6709\u6570\u636E
        </button>
        <button 
          onClick={cancelAllRequests} 
          disabled={!isAnyLoading}
          style={{ marginLeft: '8px', color: 'red' }}
        >
          \u53D6\u6D88\u6240\u6709\u8BF7\u6C42
        </button>
        
        <div style={{ marginTop: '8px' }}>
          \u6D3B\u8DC3\u8BF7\u6C42\u6570: {activeRequests}
          {isAnyLoading && <span style={{ color: 'blue', marginLeft: '8px' }}>\u8BF7\u6C42\u8FDB\u884C\u4E2D...</span>}
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
          <h4>\u9519\u8BEF\u4FE1\u606F:</h4>
          {userApi.error && <div>\u7528\u6237\u6570\u636E: {userApi.error}</div>}
          {postApi.error && <div>\u6587\u7AE0\u6570\u636E: {postApi.error}</div>}
          {commentApi.error && <div>\u8BC4\u8BBA\u6570\u636E: {commentApi.error}</div>}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <div>
          <h3>\u7528\u6237\u6570\u636E {userApi.loading && '(\u52A0\u8F7D\u4E2D...)'}</h3>
          {userApi.data && (
            <div>
              <p>\u7528\u6237\u6570\u91CF: {userApi.data.length}</p>
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
          <h3>\u6587\u7AE0\u6570\u636E {postApi.loading && '(\u52A0\u8F7D\u4E2D...)'}</h3>
          {postApi.data && (
            <div>
              <p>\u6587\u7AE0\u6570\u91CF: {postApi.data.length}</p>
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
          <h3>\u8BC4\u8BBA\u6570\u636E {commentApi.loading && '(\u52A0\u8F7D\u4E2D...)'}</h3>
          {commentApi.data && (
            <div>
              <p>\u8BC4\u8BBA\u6570\u91CF: {commentApi.data.length}</p>
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
`,paraId:4,tocIndex:5},{value:`import { useApi } from '@ai-code/hooks';
import { useLocalStorage } from '@ai-code/hooks';
import { useState, useEffect } from 'react';

function CachedApiRequests() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cache, setCache] = useLocalStorage('apiCache', {});
  const [useCache, setUseCache] = useState(true);
  
  const { data, loading, error, get } = useApi({
    baseURL: 'https://jsonplaceholder.typicode.com',
    onSuccess: (data) => {
      // \u7F13\u5B58\u6210\u529F\u7684\u54CD\u5E94
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

    // \u68C0\u67E5\u7F13\u5B58
    const cachedData = cache[searchTerm];
    const cacheValid = cachedData && (Date.now() - cachedData.timestamp < 5 * 60 * 1000); // 5\u5206\u949F\u7F13\u5B58

    if (useCache && cacheValid) {
      console.log('\u4F7F\u7528\u7F13\u5B58\u6570\u636E');
      // \u8FD9\u91CC\u53EF\u4EE5\u8BBE\u7F6E\u7F13\u5B58\u6570\u636E\u5230\u72B6\u6001\u4E2D
      return;
    }

    // \u53D1\u8D77\u65B0\u8BF7\u6C42
    get(\`/users?q=\${searchTerm}\`);
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
      <h2>\u6761\u4EF6\u8BF7\u6C42\u548C\u7F13\u5B58</h2>
      
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="\u641C\u7D22\u7528\u6237..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
          />
          <button onClick={searchUsers} disabled={loading || !searchTerm}>
            {loading ? '\u641C\u7D22\u4E2D...' : '\u641C\u7D22'}
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label>
            <input
              type="checkbox"
              checked={useCache}
              onChange={(e) => setUseCache(e.target.checked)}
            />
            \u542F\u7528\u7F13\u5B58 (5\u5206\u949F)
          </label>
          
          <button onClick={clearCache} style={{ fontSize: '12px' }}>
            \u6E05\u9664\u7F13\u5B58
          </button>
        </div>
      </div>

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '12px', 
        borderRadius: '4px',
        marginBottom: '16px'
      }}>
        <h4>\u7F13\u5B58\u4FE1\u606F</h4>
        <p>\u7F13\u5B58\u6761\u76EE: {cacheInfo.keys.length}</p>
        <p>\u7F13\u5B58\u5927\u5C0F: {(cacheInfo.size / 1024).toFixed(2)} KB</p>
        {cacheInfo.keys.length > 0 && (
          <div>
            <p>\u7F13\u5B58\u952E: {cacheInfo.keys.join(', ')}</p>
          </div>
        )}
      </div>

      {error && <div style={{ color: 'red' }}>\u9519\u8BEF: {error}</div>}
      
      {data && (
        <div>
          <h3>\u641C\u7D22\u7ED3\u679C</h3>
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
`,paraId:5,tocIndex:6},{value:"\u53C2\u6570",paraId:6,tocIndex:8},{value:"\u7C7B\u578B",paraId:6,tocIndex:8},{value:"\u5FC5\u586B",paraId:6,tocIndex:8},{value:"\u63CF\u8FF0",paraId:6,tocIndex:8},{value:"options",paraId:6,tocIndex:8},{value:"UseApiOptions<T>",paraId:6,tocIndex:8},{value:"\u274C",paraId:6,tocIndex:8},{value:"\u914D\u7F6E\u9009\u9879",paraId:6,tocIndex:8},{value:"\u5C5E\u6027",paraId:7,tocIndex:9},{value:"\u7C7B\u578B",paraId:7,tocIndex:9},{value:"\u9ED8\u8BA4\u503C",paraId:7,tocIndex:9},{value:"\u63CF\u8FF0",paraId:7,tocIndex:9},{value:"baseURL",paraId:7,tocIndex:9},{value:"string",paraId:7,tocIndex:9},{value:"''",paraId:7,tocIndex:9},{value:"API \u57FA\u7840URL",paraId:7,tocIndex:9},{value:"headers",paraId:7,tocIndex:9},{value:"Record<string, string>",paraId:7,tocIndex:9},{value:"{}",paraId:7,tocIndex:9},{value:"\u9ED8\u8BA4\u8BF7\u6C42\u5934",paraId:7,tocIndex:9},{value:"transform",paraId:7,tocIndex:9},{value:"(data: any) => T",paraId:7,tocIndex:9},{value:"(data) => data",paraId:7,tocIndex:9},{value:"\u6570\u636E\u8F6C\u6362\u51FD\u6570",paraId:7,tocIndex:9},{value:"onSuccess",paraId:7,tocIndex:9},{value:"(data: T) => void",paraId:7,tocIndex:9},{value:"-",paraId:7,tocIndex:9},{value:"\u6210\u529F\u56DE\u8C03",paraId:7,tocIndex:9},{value:"onError",paraId:7,tocIndex:9},{value:"(error: Error) => void",paraId:7,tocIndex:9},{value:"-",paraId:7,tocIndex:9},{value:"\u9519\u8BEF\u56DE\u8C03",paraId:7,tocIndex:9},{value:"\u8FD4\u56DE ",paraId:8,tocIndex:10},{value:"UseApiReturn<T>",paraId:8,tocIndex:10},{value:" \u5BF9\u8C61\uFF1A",paraId:8,tocIndex:10},{value:"\u5C5E\u6027",paraId:9,tocIndex:10},{value:"\u7C7B\u578B",paraId:9,tocIndex:10},{value:"\u63CF\u8FF0",paraId:9,tocIndex:10},{value:"data",paraId:9,tocIndex:10},{value:"T | null",paraId:9,tocIndex:10},{value:"\u54CD\u5E94\u6570\u636E",paraId:9,tocIndex:10},{value:"loading",paraId:9,tocIndex:10},{value:"boolean",paraId:9,tocIndex:10},{value:"\u662F\u5426\u6B63\u5728\u52A0\u8F7D",paraId:9,tocIndex:10},{value:"error",paraId:9,tocIndex:10},{value:"string | null",paraId:9,tocIndex:10},{value:"\u9519\u8BEF\u4FE1\u606F",paraId:9,tocIndex:10},{value:"request",paraId:9,tocIndex:10},{value:"(url: string, options?: RequestInit) => Promise<void>",paraId:9,tocIndex:10},{value:"\u901A\u7528\u8BF7\u6C42\u65B9\u6CD5",paraId:9,tocIndex:10},{value:"get",paraId:9,tocIndex:10},{value:"(url: string, options?: RequestInit) => Promise<void>",paraId:9,tocIndex:10},{value:"GET \u8BF7\u6C42",paraId:9,tocIndex:10},{value:"post",paraId:9,tocIndex:10},{value:"(url: string, data?: any, options?: RequestInit) => Promise<void>",paraId:9,tocIndex:10},{value:"POST \u8BF7\u6C42",paraId:9,tocIndex:10},{value:"put",paraId:9,tocIndex:10},{value:"(url: string, data?: any, options?: RequestInit) => Promise<void>",paraId:9,tocIndex:10},{value:"PUT \u8BF7\u6C42",paraId:9,tocIndex:10},{value:"delete",paraId:9,tocIndex:10},{value:"(url: string, options?: RequestInit) => Promise<void>",paraId:9,tocIndex:10},{value:"DELETE \u8BF7\u6C42",paraId:9,tocIndex:10},{value:"reset",paraId:9,tocIndex:10},{value:"() => void",paraId:9,tocIndex:10},{value:"\u91CD\u7F6E\u72B6\u6001\u5E76\u53D6\u6D88\u8BF7\u6C42",paraId:9,tocIndex:10},{value:`function ProductManager() {
  const { data: products, loading, get, post, put, delete: deleteProduct } = useApi({
    baseURL: '/api/products'
  });

  const loadProducts = () => get('');
  const createProduct = (product) => post('', product);
  const updateProduct = (id, product) => put(\`/\${id}\`, product);
  const removeProduct = (id) => deleteProduct(\`/\${id}\`);

  return (
    <div>
      {/* \u4EA7\u54C1\u7BA1\u7406\u754C\u9762 */}
    </div>
  );
}
`,paraId:10,tocIndex:12},{value:`function FileUpload() {
  const { loading, post, data } = useApi({
    baseURL: '/api'
  });

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    await post('/upload', formData, {
      headers: {
        // \u4E0D\u8BBE\u7F6E Content-Type\uFF0C\u8BA9\u6D4F\u89C8\u5668\u81EA\u52A8\u8BBE\u7F6E
      }
    });
  };

  return (
    <div>
      <input type="file" onChange={(e) => uploadFile(e.target.files[0])} />
      {loading && <p>\u4E0A\u4F20\u4E2D...</p>}
      {data && <p>\u4E0A\u4F20\u6210\u529F: {data.url}</p>}
    </div>
  );
}
`,paraId:11,tocIndex:13},{value:`function PaginatedList() {
  const [page, setPage] = useState(1);
  const { data, loading, get } = useApi({
    baseURL: '/api'
  });

  useEffect(() => {
    get(\`/items?page=\${page}&limit=10\`);
  }, [page]);

  return (
    <div>
      {data && (
        <>
          {data.items.map(item => <div key={item.id}>{item.name}</div>)}
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
            \u4E0A\u4E00\u9875
          </button>
          <button onClick={() => setPage(p => p + 1)} disabled={page === data.totalPages}>
            \u4E0B\u4E00\u9875
          </button>
        </>
      )}
    </div>
  );
}
`,paraId:12,tocIndex:14},{value:`const { data, error, get } = useApi({
  onError: (error) => {
    // \u5168\u5C40\u9519\u8BEF\u5904\u7406
    if (error.message.includes('401')) {
      // \u672A\u6388\u6743\uFF0C\u91CD\u5B9A\u5411\u5230\u767B\u5F55\u9875
      window.location.href = '/login';
    } else if (error.message.includes('500')) {
      // \u670D\u52A1\u5668\u9519\u8BEF\uFF0C\u663E\u793A\u53CB\u597D\u63D0\u793A
      showNotification('\u670D\u52A1\u5668\u6682\u65F6\u4E0D\u53EF\u7528\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5');
    }
  }
});
`,paraId:13,tocIndex:16},{value:`const { request } = useApi({
  headers: {
    'Authorization': \`Bearer \${getToken()}\`,
    'X-Request-ID': generateRequestId()
  },
  transform: (data) => {
    // \u7EDF\u4E00\u5904\u7406\u54CD\u5E94\u683C\u5F0F
    if (data.code === 0) {
      return data.data;
    }
    throw new Error(data.message || '\u8BF7\u6C42\u5931\u8D25');
  }
});
`,paraId:14,tocIndex:17},{value:`interface User {
  id: number;
  name: string;
  email: string;
}

const { data, get } = useApi<User[]>({
  baseURL: '/api'
});

// data \u73B0\u5728\u6709\u5B8C\u6574\u7684\u7C7B\u578B\u63D0\u793A
const firstUser = data?.[0]?.name;
`,paraId:15,tocIndex:18},{value:"\u8BF7\u6C42\u53D6\u6D88",paraId:16,tocIndex:19},{value:"\uFF1AHook \u4F1A\u81EA\u52A8\u53D6\u6D88\u4E4B\u524D\u672A\u5B8C\u6210\u7684\u8BF7\u6C42\uFF0C\u907F\u514D\u7ADE\u6001\u6761\u4EF6",paraId:16,tocIndex:19},{value:"\u5185\u5B58\u6CC4\u6F0F",paraId:16,tocIndex:19},{value:"\uFF1A\u7EC4\u4EF6\u5378\u8F7D\u65F6\u4F1A\u81EA\u52A8\u6E05\u7406\u8BF7\u6C42\uFF0C\u65E0\u9700\u624B\u52A8\u5904\u7406",paraId:16,tocIndex:19},{value:"\u9519\u8BEF\u8FB9\u754C",paraId:16,tocIndex:19},{value:"\uFF1A\u5EFA\u8BAE\u914D\u5408\u9519\u8BEF\u8FB9\u754C\u7EC4\u4EF6\u4F7F\u7528\uFF0C\u5904\u7406\u610F\u5916\u9519\u8BEF",paraId:16,tocIndex:19},{value:"\u7F13\u5B58\u7B56\u7565",paraId:16,tocIndex:19},{value:"\uFF1AHook \u672C\u8EAB\u4E0D\u63D0\u4F9B\u7F13\u5B58\uFF0C\u9700\u8981\u914D\u5408\u5176\u4ED6\u72B6\u6001\u7BA1\u7406\u65B9\u6848",paraId:16,tocIndex:19},{value:"\u5E76\u53D1\u9650\u5236",paraId:16,tocIndex:19},{value:"\uFF1A\u5BF9\u4E8E\u5927\u91CF\u5E76\u53D1\u8BF7\u6C42\uFF0C\u9700\u8981\u8003\u8651\u6D4F\u89C8\u5668\u548C\u670D\u52A1\u5668\u7684\u9650\u5236",paraId:16,tocIndex:19}]}}]);
