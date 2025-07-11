"use strict";(self.webpackChunk_corn12138_hooks=self.webpackChunk_corn12138_hooks||[]).push([[244],{77292:function(r,e,n){n.r(e),n.d(e,{demos:function(){return o}});var a=n(44194),o={}},10156:function(r,e,n){n.r(e),n.d(e,{texts:function(){return a}});const a=[{value:"\u5F02\u6B65\u64CD\u4F5C\u7BA1\u7406 Hook\uFF0C\u63D0\u4F9B loading\u3001error\u3001data \u72B6\u6001\u7BA1\u7406\uFF0C\u652F\u6301\u53D6\u6D88\u64CD\u4F5C\u548C\u91CD\u8BD5\u673A\u5236\u3002",paraId:0,tocIndex:0},{value:`import { useAsync } from '@ai-code/hooks';

function UserProfile({ userId }) {
  const { data: user, loading, error, execute } = useAsync(
    async (id) => {
      const response = await fetch(\`/api/users/\${id}\`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    }
  );

  // \u624B\u52A8\u89E6\u53D1\u8BF7\u6C42
  const loadUser = () => {
    execute(userId);
  };

  if (loading) return <div>\u52A0\u8F7D\u4E2D...</div>;
  if (error) return <div>\u9519\u8BEF: {error}</div>;
  if (!user) return <button onClick={loadUser}>\u52A0\u8F7D\u7528\u6237</button>;

  return (
    <div>
      <h2>\u7528\u6237\u4FE1\u606F</h2>
      <p>\u59D3\u540D: {user.name}</p>
      <p>\u90AE\u7BB1: {user.email}</p>
      <button onClick={loadUser}>\u5237\u65B0</button>
    </div>
  );
}
`,paraId:1,tocIndex:1},{value:`import { useAsync } from '@ai-code/hooks';

function DataList() {
  const { data, loading, error, execute, retry } = useAsync(
    async () => {
      // \u53EF\u80FD\u5931\u8D25\u7684 API \u8C03\u7528
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('\u7F51\u7EDC\u9519\u8BEF');
      return response.json();
    },
    {
      retryCount: 3,        // \u5931\u8D25\u540E\u91CD\u8BD5 3 \u6B21
      retryDelay: 2000,     // \u6BCF\u6B21\u91CD\u8BD5\u95F4\u9694 2 \u79D2
      onError: (error) => {
        console.error('\u8BF7\u6C42\u5931\u8D25:', error);
      },
      onSuccess: (data) => {
        console.log('\u8BF7\u6C42\u6210\u529F:', data);
      }
    }
  );

  return (
    <div>
      {loading && <div>\u52A0\u8F7D\u4E2D...</div>}
      {error && (
        <div>
          <p>\u9519\u8BEF: {error}</p>
          <button onClick={retry}>\u91CD\u8BD5</button>
        </div>
      )}
      {data && (
        <ul>
          {data.map(item => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      )}
      <button onClick={() => execute()}>\u5237\u65B0\u6570\u636E</button>
    </div>
  );
}
`,paraId:2,tocIndex:3},{value:`import { useAsync } from '@ai-code/hooks';

function SearchResults() {
  const { data, loading, execute, cancel } = useAsync(
    async (query) => {
      // \u6A21\u62DF\u6162\u901F API
      await new Promise(resolve => setTimeout(resolve, 2000));
      const response = await fetch(\`/api/search?q=\${query}\`);
      return response.json();
    }
  );

  const handleSearch = (query) => {
    execute(query);
  };

  const handleCancel = () => {
    cancel(); // \u53D6\u6D88\u5F53\u524D\u8BF7\u6C42
  };

  return (
    <div>
      <input 
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="\u641C\u7D22..."
      />
      {loading && (
        <div>
          <span>\u641C\u7D22\u4E2D...</span>
          <button onClick={handleCancel}>\u53D6\u6D88</button>
        </div>
      )}
      {data && (
        <div>
          <h3>\u641C\u7D22\u7ED3\u679C</h3>
          {data.results.map(item => (
            <div key={item.id}>{item.title}</div>
          ))}
        </div>
      )}
    </div>
  );
}
`,paraId:3,tocIndex:4},{value:`import { useAsync } from '@ai-code/hooks';
import { useEffect } from 'react';

function PostDetail({ postId }) {
  const { data: post, loading, error, execute } = useAsync(
    async (id) => {
      const response = await fetch(\`/api/posts/\${id}\`);
      return response.json();
    }
  );

  // \u5F53 postId \u53D8\u5316\u65F6\u81EA\u52A8\u52A0\u8F7D
  useEffect(() => {
    if (postId) {
      execute(postId);
    }
  }, [postId, execute]);

  if (loading) return <div>\u52A0\u8F7D\u6587\u7AE0...</div>;
  if (error) return <div>\u52A0\u8F7D\u5931\u8D25: {error}</div>;
  if (!post) return null;

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
`,paraId:4,tocIndex:5},{value:"\u53C2\u6570",paraId:5,tocIndex:7},{value:"\u7C7B\u578B",paraId:5,tocIndex:7},{value:"\u5FC5\u586B",paraId:5,tocIndex:7},{value:"\u63CF\u8FF0",paraId:5,tocIndex:7},{value:"asyncFunction",paraId:5,tocIndex:7},{value:"(...args: any[]) => Promise<T>",paraId:5,tocIndex:7},{value:"\u2705",paraId:5,tocIndex:7},{value:"\u5F02\u6B65\u51FD\u6570",paraId:5,tocIndex:7},{value:"options",paraId:5,tocIndex:7},{value:"UseAsyncOptions",paraId:5,tocIndex:7},{value:"\u274C",paraId:5,tocIndex:7},{value:"\u914D\u7F6E\u9009\u9879",paraId:5,tocIndex:7},{value:"\u5C5E\u6027",paraId:6,tocIndex:8},{value:"\u7C7B\u578B",paraId:6,tocIndex:8},{value:"\u9ED8\u8BA4\u503C",paraId:6,tocIndex:8},{value:"\u63CF\u8FF0",paraId:6,tocIndex:8},{value:"immediate",paraId:6,tocIndex:8},{value:"boolean",paraId:6,tocIndex:8},{value:"false",paraId:6,tocIndex:8},{value:"\u662F\u5426\u7ACB\u5373\u6267\u884C",paraId:6,tocIndex:8},{value:"retryCount",paraId:6,tocIndex:8},{value:"number",paraId:6,tocIndex:8},{value:"0",paraId:6,tocIndex:8},{value:"\u91CD\u8BD5\u6B21\u6570",paraId:6,tocIndex:8},{value:"retryDelay",paraId:6,tocIndex:8},{value:"number",paraId:6,tocIndex:8},{value:"1000",paraId:6,tocIndex:8},{value:"\u91CD\u8BD5\u5EF6\u8FDF\uFF08\u6BEB\u79D2\uFF09",paraId:6,tocIndex:8},{value:"onSuccess",paraId:6,tocIndex:8},{value:"(data: T) => void",paraId:6,tocIndex:8},{value:"-",paraId:6,tocIndex:8},{value:"\u6210\u529F\u56DE\u8C03",paraId:6,tocIndex:8},{value:"onError",paraId:6,tocIndex:8},{value:"(error: Error) => void",paraId:6,tocIndex:8},{value:"-",paraId:6,tocIndex:8},{value:"\u9519\u8BEF\u56DE\u8C03",paraId:6,tocIndex:8},{value:"\u5C5E\u6027",paraId:7,tocIndex:9},{value:"\u7C7B\u578B",paraId:7,tocIndex:9},{value:"\u63CF\u8FF0",paraId:7,tocIndex:9},{value:"data",paraId:7,tocIndex:9},{value:"T | null",paraId:7,tocIndex:9},{value:"\u5F02\u6B65\u64CD\u4F5C\u8FD4\u56DE\u7684\u6570\u636E",paraId:7,tocIndex:9},{value:"loading",paraId:7,tocIndex:9},{value:"boolean",paraId:7,tocIndex:9},{value:"\u662F\u5426\u6B63\u5728\u52A0\u8F7D",paraId:7,tocIndex:9},{value:"error",paraId:7,tocIndex:9},{value:"string | null",paraId:7,tocIndex:9},{value:"\u9519\u8BEF\u4FE1\u606F",paraId:7,tocIndex:9},{value:"execute",paraId:7,tocIndex:9},{value:"(...args: any[]) => Promise<void>",paraId:7,tocIndex:9},{value:"\u6267\u884C\u5F02\u6B65\u51FD\u6570",paraId:7,tocIndex:9},{value:"reset",paraId:7,tocIndex:9},{value:"() => void",paraId:7,tocIndex:9},{value:"\u91CD\u7F6E\u6240\u6709\u72B6\u6001",paraId:7,tocIndex:9},{value:"cancel",paraId:7,tocIndex:9},{value:"() => void",paraId:7,tocIndex:9},{value:"\u53D6\u6D88\u5F53\u524D\u64CD\u4F5C",paraId:7,tocIndex:9},{value:"retry",paraId:7,tocIndex:9},{value:"() => void",paraId:7,tocIndex:9},{value:"\u4F7F\u7528\u4E0A\u6B21\u53C2\u6570\u91CD\u8BD5",paraId:7,tocIndex:9},{value:`const { data, error, execute } = useAsync(
  async (userId) => {
    const response = await fetch(\`/api/users/\${userId}\`);
    if (!response.ok) {
      // \u629B\u51FA\u5177\u4F53\u7684\u9519\u8BEF\u4FE1\u606F
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }
    return response.json();
  },
  {
    onError: (error) => {
      // \u7EDF\u4E00\u9519\u8BEF\u5904\u7406
      if (error.message.includes('404')) {
        console.error('\u7528\u6237\u4E0D\u5B58\u5728');
      } else {
        console.error('\u52A0\u8F7D\u7528\u6237\u5931\u8D25:', error.message);
      }
    }
  }
);
`,paraId:8,tocIndex:11},{value:`function Component() {
  const { execute } = useAsync(
    async () => {
      // \u957F\u65F6\u95F4\u8FD0\u884C\u7684\u5F02\u6B65\u64CD\u4F5C
      const response = await fetch('/api/heavy-operation');
      return response.json();
    }
  );

  useEffect(() => {
    execute();
    
    // \u7EC4\u4EF6\u5378\u8F7D\u65F6\u4F1A\u81EA\u52A8\u53D6\u6D88\u8BF7\u6C42\uFF0C\u65E0\u9700\u624B\u52A8\u5904\u7406
  }, [execute]);

  return <div>Component</div>;
}
`,paraId:9,tocIndex:12},{value:`function UserPosts({ userId }) {
  const { data: posts, loading, execute } = useAsync(
    async (id) => {
      const response = await fetch(\`/api/users/\${id}/posts\`);
      return response.json();
    }
  );

  useEffect(() => {
    // \u53EA\u5728\u6709 userId \u65F6\u624D\u6267\u884C
    if (userId) {
      execute(userId);
    }
  }, [userId, execute]);

  if (!userId) return <div>\u8BF7\u9009\u62E9\u7528\u6237</div>;
  if (loading) return <div>\u52A0\u8F7D\u4E2D...</div>;
  
  return (
    <div>
      {posts?.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
`,paraId:10,tocIndex:13},{value:"\u7EC4\u4EF6\u5378\u8F7D\u65F6\u81EA\u52A8\u6E05\u7406",paraId:11,tocIndex:14},{value:"\uFF1AHook \u4F1A\u5728\u7EC4\u4EF6\u5378\u8F7D\u65F6\u81EA\u52A8\u53D6\u6D88\u6B63\u5728\u8FDB\u884C\u7684\u8BF7\u6C42",paraId:11,tocIndex:14},{value:"\u91CD\u8BD5\u673A\u5236",paraId:11,tocIndex:14},{value:"\uFF1A\u5931\u8D25\u65F6\u4F1A\u6839\u636E ",paraId:11,tocIndex:14},{value:"retryCount",paraId:11,tocIndex:14},{value:" \u81EA\u52A8\u91CD\u8BD5\uFF0C\u6BCF\u6B21\u91CD\u8BD5\u95F4\u9694 ",paraId:11,tocIndex:14},{value:"retryDelay",paraId:11,tocIndex:14},{value:" \u6BEB\u79D2",paraId:11,tocIndex:14},{value:"\u53C2\u6570\u7F13\u5B58",paraId:11,tocIndex:14},{value:"\uFF1A",paraId:11,tocIndex:14},{value:"retry()",paraId:11,tocIndex:14},{value:" \u65B9\u6CD5\u4F1A\u4F7F\u7528\u4E0A\u6B21 ",paraId:11,tocIndex:14},{value:"execute()",paraId:11,tocIndex:14},{value:" \u7684\u53C2\u6570",paraId:11,tocIndex:14},{value:"\u9519\u8BEF\u7C7B\u578B",paraId:11,tocIndex:14},{value:"\uFF1A\u9519\u8BEF\u4FE1\u606F\u7EDF\u4E00\u8F6C\u6362\u4E3A\u5B57\u7B26\u4E32\u7C7B\u578B",paraId:11,tocIndex:14},{value:"\u5E76\u53D1\u63A7\u5236",paraId:11,tocIndex:14},{value:"\uFF1A\u65B0\u7684 ",paraId:11,tocIndex:14},{value:"execute()",paraId:11,tocIndex:14},{value:" \u8C03\u7528\u4F1A\u53D6\u6D88\u4E4B\u524D\u7684\u8BF7\u6C42",paraId:11,tocIndex:14}]}}]);
