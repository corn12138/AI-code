"use strict";(self.webpackChunk_corn12138_hooks=self.webpackChunk_corn12138_hooks||[]).push([[999],{38861:function(b,g,e){e.r(g),e.d(g,{demos:function(){return R}});var x=e(45332),E=e.n(x),C=e(90819),d=e.n(C),L=e(89933),I=e.n(L),a=e(44194),f=e(68509),R={"src-use-api-demo-0":{component:a.memo(a.lazy(I()(d()().mark(function u(){var o,s,r;return d()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return r=function(){var i=s("/api/users"),h=i.data,p=i.loading,c=i.error;return p?a.createElement("div",null,"Loading..."):c?a.createElement("div",null,"Error: ",c.message):a.createElement("div",null,h.map(function(m){return a.createElement("div",{key:m.id},m.name)}))},t.next=3,Promise.resolve().then(e.bind(e,68509));case 3:o=t.sent,s=o.useApi;case 5:case"end":return t.stop()}},u)})))),asset:{type:"BLOCK",id:"src-use-api-demo-0",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useApi } from '@corn12138/hooks';

function MyComponent() {
  const { data, loading, error } = useApi('/api/users');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {data.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":f},renderOpts:{compile:function(){var u=I()(d()().mark(function s(){var r,l=arguments;return d()().wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,e.e(216).then(e.bind(e,29525));case 2:return n.abrupt("return",(r=n.sent).default.apply(r,l));case 3:case"end":return n.stop()}},s)}));function o(){return u.apply(this,arguments)}return o}()}},"src-use-api-demo-1":{component:a.memo(a.lazy(I()(d()().mark(function u(){var o,s,r;return d()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return r=function(){var i=s("/api/users",{method:"GET",headers:{Authorization:"Bearer token"}}),h=i.data,p=i.loading,c=i.error,m=i.refetch;return a.createElement("div",null,a.createElement("button",{onClick:m},"Refresh"),p&&a.createElement("p",null,"Loading..."),c&&a.createElement("p",null,"Error: ",c.message),h&&h.map(function(v){return a.createElement("div",{key:v.id},v.name)}))},t.next=3,Promise.resolve().then(e.bind(e,68509));case 3:o=t.sent,s=o.useApi;case 5:case"end":return t.stop()}},u)})))),asset:{type:"BLOCK",id:"src-use-api-demo-1",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useApi } from '@corn12138/hooks';

function UserList() {
  const { data, loading, error, refetch } = useApi('/api/users', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer token'
    }
  });
  
  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && data.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":f},renderOpts:{compile:function(){var u=I()(d()().mark(function s(){var r,l=arguments;return d()().wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,e.e(216).then(e.bind(e,29525));case 2:return n.abrupt("return",(r=n.sent).default.apply(r,l));case 3:case"end":return n.stop()}},s)}));function o(){return u.apply(this,arguments)}return o}()}},"src-use-api-demo-2":{component:a.memo(a.lazy(I()(d()().mark(function u(){var o,s,r;return d()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return r=function(){var i=useState(""),h=E()(i,2),p=h[0],c=h[1],m=s("/api/search?q=".concat(p),{enabled:p.length>0}),v=m.data,y=m.loading;return a.createElement("div",null,a.createElement("input",{value:p,onChange:function(A){return c(A.target.value)},placeholder:"Search..."}),y&&a.createElement("p",null,"Searching..."),v&&a.createElement("p",null,"Found ",v.length," results"))},t.next=3,Promise.resolve().then(e.bind(e,68509));case 3:o=t.sent,s=o.useApi;case 5:case"end":return t.stop()}},u)})))),asset:{type:"BLOCK",id:"src-use-api-demo-2",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useApi } from '@corn12138/hooks';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const { data, loading } = useApi(\`/api/search?q=\${query}\`, {
    enabled: query.length > 0
  });
  
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
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":f},renderOpts:{compile:function(){var u=I()(d()().mark(function s(){var r,l=arguments;return d()().wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,e.e(216).then(e.bind(e,29525));case 2:return n.abrupt("return",(r=n.sent).default.apply(r,l));case 3:case"end":return n.stop()}},s)}));function o(){return u.apply(this,arguments)}return o}()}},"src-use-api-demo-3":{component:a.memo(a.lazy(I()(d()().mark(function u(){var o,s,r;return d()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return r=function(i){var h=i.postId,p=s("/api/posts/".concat(h)),c=p.data,m=p.loading,v=p.error;return m?a.createElement("div",null,"Loading post..."):v?a.createElement("div",null,"Error: ",v.message):c?a.createElement("div",null,a.createElement("h1",null,c.title),a.createElement("p",null,c.content)):a.createElement("div",null,"Post not found")},t.next=3,Promise.resolve().then(e.bind(e,68509));case 3:o=t.sent,s=o.useApi;case 5:case"end":return t.stop()}},u)})))),asset:{type:"BLOCK",id:"src-use-api-demo-3",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useApi } from '@corn12138/hooks';

function PostEditor({ postId }: { postId: string }) {
  const { data: post, loading, error } = useApi(\`/api/posts/\${postId}\`);
  
  if (loading) return <div>Loading post...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!post) return <div>Post not found</div>;
  
  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":f},renderOpts:{compile:function(){var u=I()(d()().mark(function s(){var r,l=arguments;return d()().wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,e.e(216).then(e.bind(e,29525));case 2:return n.abrupt("return",(r=n.sent).default.apply(r,l));case 3:case"end":return n.stop()}},s)}));function o(){return u.apply(this,arguments)}return o}()}},"src-use-api-demo-4":{component:a.memo(a.lazy(I()(d()().mark(function u(){var o,s,r,l,t;return d()().wrap(function(i){for(;;)switch(i.prev=i.next){case 0:return t=function(){var p=l("currentUserId",null),c=E()(p,1),m=c[0],v=s("/api/users/".concat(m),{enabled:!!m}),y=v.data,P=v.loading,A=v.error;return m?P?a.createElement("div",null,"Loading..."):A?a.createElement("div",null,"Error: ",A.message):a.createElement("div",null,a.createElement("h1",null,y.name),a.createElement("p",null,y.email)):a.createElement("div",null,"Please log in")},i.next=3,Promise.resolve().then(e.bind(e,68509));case 3:return o=i.sent,s=o.useApi,i.next=7,Promise.resolve().then(e.bind(e,68509));case 7:r=i.sent,l=r.useLocalStorage;case 9:case"end":return i.stop()}},u)})))),asset:{type:"BLOCK",id:"src-use-api-demo-4",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useApi } from '@corn12138/hooks';
import { useLocalStorage } from '@corn12138/hooks';

function UserProfile() {
  const [userId] = useLocalStorage('currentUserId', null);
  const { data: user, loading, error } = useApi(\`/api/users/\${userId}\`, {
    enabled: !!userId
  });
  
  if (!userId) return <div>Please log in</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":f},renderOpts:{compile:function(){var u=I()(d()().mark(function s(){var r,l=arguments;return d()().wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,e.e(216).then(e.bind(e,29525));case 2:return n.abrupt("return",(r=n.sent).default.apply(r,l));case 3:case"end":return n.stop()}},s)}));function o(){return u.apply(this,arguments)}return o}()}}}},94781:function(b,g,e){e.r(g),e.d(g,{texts:function(){return x}});const x=[{value:"\u7528\u4E8E\u5904\u7406 API \u8BF7\u6C42\u7684 React Hook\u3002",paraId:0,tocIndex:0},{value:`import { useApi } from '@corn12138/hooks';
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
`,paraId:1,tocIndex:6},{value:`import { useApi } from '@corn12138/hooks';
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
`,paraId:2,tocIndex:7},{value:`import { useApi } from '@corn12138/hooks';
import { useLocalStorage } from '@corn12138/hooks';
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
`,paraId:3,tocIndex:8},{value:"\u53C2\u6570",paraId:4,tocIndex:10},{value:"\u7C7B\u578B",paraId:4,tocIndex:10},{value:"\u5FC5\u586B",paraId:4,tocIndex:10},{value:"\u63CF\u8FF0",paraId:4,tocIndex:10},{value:"options",paraId:4,tocIndex:10},{value:"UseApiOptions<T>",paraId:4,tocIndex:10},{value:"\u274C",paraId:4,tocIndex:10},{value:"\u914D\u7F6E\u9009\u9879",paraId:4,tocIndex:10},{value:"\u5C5E\u6027",paraId:5,tocIndex:11},{value:"\u7C7B\u578B",paraId:5,tocIndex:11},{value:"\u9ED8\u8BA4\u503C",paraId:5,tocIndex:11},{value:"\u63CF\u8FF0",paraId:5,tocIndex:11},{value:"baseURL",paraId:5,tocIndex:11},{value:"string",paraId:5,tocIndex:11},{value:"''",paraId:5,tocIndex:11},{value:"API \u57FA\u7840URL",paraId:5,tocIndex:11},{value:"headers",paraId:5,tocIndex:11},{value:"Record<string, string>",paraId:5,tocIndex:11},{value:"{}",paraId:5,tocIndex:11},{value:"\u9ED8\u8BA4\u8BF7\u6C42\u5934",paraId:5,tocIndex:11},{value:"transform",paraId:5,tocIndex:11},{value:"(data: any) => T",paraId:5,tocIndex:11},{value:"(data) => data",paraId:5,tocIndex:11},{value:"\u6570\u636E\u8F6C\u6362\u51FD\u6570",paraId:5,tocIndex:11},{value:"onSuccess",paraId:5,tocIndex:11},{value:"(data: T) => void",paraId:5,tocIndex:11},{value:"-",paraId:5,tocIndex:11},{value:"\u6210\u529F\u56DE\u8C03",paraId:5,tocIndex:11},{value:"onError",paraId:5,tocIndex:11},{value:"(error: Error) => void",paraId:5,tocIndex:11},{value:"-",paraId:5,tocIndex:11},{value:"\u9519\u8BEF\u56DE\u8C03",paraId:5,tocIndex:11},{value:"\u8FD4\u56DE ",paraId:6,tocIndex:12},{value:"UseApiReturn<T>",paraId:6,tocIndex:12},{value:" \u5BF9\u8C61\uFF1A",paraId:6,tocIndex:12},{value:"\u5C5E\u6027",paraId:7,tocIndex:12},{value:"\u7C7B\u578B",paraId:7,tocIndex:12},{value:"\u63CF\u8FF0",paraId:7,tocIndex:12},{value:"data",paraId:7,tocIndex:12},{value:"T | null",paraId:7,tocIndex:12},{value:"\u54CD\u5E94\u6570\u636E",paraId:7,tocIndex:12},{value:"loading",paraId:7,tocIndex:12},{value:"boolean",paraId:7,tocIndex:12},{value:"\u662F\u5426\u6B63\u5728\u52A0\u8F7D",paraId:7,tocIndex:12},{value:"error",paraId:7,tocIndex:12},{value:"string | null",paraId:7,tocIndex:12},{value:"\u9519\u8BEF\u4FE1\u606F",paraId:7,tocIndex:12},{value:"request",paraId:7,tocIndex:12},{value:"(url: string, options?: RequestInit) => Promise<void>",paraId:7,tocIndex:12},{value:"\u901A\u7528\u8BF7\u6C42\u65B9\u6CD5",paraId:7,tocIndex:12},{value:"get",paraId:7,tocIndex:12},{value:"(url: string, options?: RequestInit) => Promise<void>",paraId:7,tocIndex:12},{value:"GET \u8BF7\u6C42",paraId:7,tocIndex:12},{value:"post",paraId:7,tocIndex:12},{value:"(url: string, data?: any, options?: RequestInit) => Promise<void>",paraId:7,tocIndex:12},{value:"POST \u8BF7\u6C42",paraId:7,tocIndex:12},{value:"put",paraId:7,tocIndex:12},{value:"(url: string, data?: any, options?: RequestInit) => Promise<void>",paraId:7,tocIndex:12},{value:"PUT \u8BF7\u6C42",paraId:7,tocIndex:12},{value:"delete",paraId:7,tocIndex:12},{value:"(url: string, options?: RequestInit) => Promise<void>",paraId:7,tocIndex:12},{value:"DELETE \u8BF7\u6C42",paraId:7,tocIndex:12},{value:"reset",paraId:7,tocIndex:12},{value:"() => void",paraId:7,tocIndex:12},{value:"\u91CD\u7F6E\u72B6\u6001\u5E76\u53D6\u6D88\u8BF7\u6C42",paraId:7,tocIndex:12},{value:`function ProductManager() {
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
`,paraId:8,tocIndex:14},{value:`function FileUpload() {
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
`,paraId:9,tocIndex:15},{value:`function PaginatedList() {
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
`,paraId:10,tocIndex:16},{value:`const { data, error, get } = useApi({
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
`,paraId:11,tocIndex:18},{value:`const { request } = useApi({
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
`,paraId:12,tocIndex:19},{value:`interface User {
  id: number;
  name: string;
  email: string;
}

const { data, get } = useApi<User[]>({
  baseURL: '/api'
});

// data \u73B0\u5728\u6709\u5B8C\u6574\u7684\u7C7B\u578B\u63D0\u793A
const firstUser = data?.[0]?.name;
`,paraId:13,tocIndex:20},{value:"\u8BF7\u6C42\u53D6\u6D88",paraId:14,tocIndex:21},{value:"\uFF1AHook \u4F1A\u81EA\u52A8\u53D6\u6D88\u4E4B\u524D\u672A\u5B8C\u6210\u7684\u8BF7\u6C42\uFF0C\u907F\u514D\u7ADE\u6001\u6761\u4EF6",paraId:14,tocIndex:21},{value:"\u5185\u5B58\u6CC4\u6F0F",paraId:14,tocIndex:21},{value:"\uFF1A\u7EC4\u4EF6\u5378\u8F7D\u65F6\u4F1A\u81EA\u52A8\u6E05\u7406\u8BF7\u6C42\uFF0C\u65E0\u9700\u624B\u52A8\u5904\u7406",paraId:14,tocIndex:21},{value:"\u9519\u8BEF\u8FB9\u754C",paraId:14,tocIndex:21},{value:"\uFF1A\u5EFA\u8BAE\u914D\u5408\u9519\u8BEF\u8FB9\u754C\u7EC4\u4EF6\u4F7F\u7528\uFF0C\u5904\u7406\u610F\u5916\u9519\u8BEF",paraId:14,tocIndex:21},{value:"\u7F13\u5B58\u7B56\u7565",paraId:14,tocIndex:21},{value:"\uFF1AHook \u672C\u8EAB\u4E0D\u63D0\u4F9B\u7F13\u5B58\uFF0C\u9700\u8981\u914D\u5408\u5176\u4ED6\u72B6\u6001\u7BA1\u7406\u65B9\u6848",paraId:14,tocIndex:21},{value:"\u5E76\u53D1\u9650\u5236",paraId:14,tocIndex:21},{value:"\uFF1A\u5BF9\u4E8E\u5927\u91CF\u5E76\u53D1\u8BF7\u6C42\uFF0C\u9700\u8981\u8003\u8651\u6D4F\u89C8\u5668\u548C\u670D\u52A1\u5668\u7684\u9650\u5236",paraId:14,tocIndex:21}]}}]);
