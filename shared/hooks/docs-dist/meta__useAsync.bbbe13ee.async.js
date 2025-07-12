"use strict";(self.webpackChunk_corn12138_hooks=self.webpackChunk_corn12138_hooks||[]).push([[244],{77292:function(_,E,e){e.r(E),e.d(E,{demos:function(){return M}});var D=e(45332),O=e.n(D),b=e(90819),t=e.n(b),$=e(89933),p=e.n($),r=e(44194),P=e(68509),M={"src-use-async-demo-0":{component:r.memo(r.lazy(p()(t()().mark(function d(){var s,o,u;return t()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return u=function(){var l=o(fetchData),m=l.data,c=l.loading,v=l.error,y=l.execute;return r.createElement("div",null,c&&r.createElement("p",null,"Loading..."),v&&r.createElement("p",null,"Error: ",v.message),m&&r.createElement("p",null,"Data: ",JSON.stringify(m)),r.createElement("button",{onClick:y},"Fetch Data"))},a.next=3,Promise.resolve().then(e.bind(e,68509));case 3:s=a.sent,o=s.useAsync;case 5:case"end":return a.stop()}},d)})))),asset:{type:"BLOCK",id:"src-use-async-demo-0",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useAsync } from '@corn12138/hooks';

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
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":P},renderOpts:{compile:function(){var d=p()(t()().mark(function o(){var u,I=arguments;return t()().wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,e.e(216).then(e.bind(e,29525));case 2:return n.abrupt("return",(u=n.sent).default.apply(u,I));case 3:case"end":return n.stop()}},o)}));function s(){return d.apply(this,arguments)}return s}()}},"src-use-async-demo-1":{component:r.memo(r.lazy(p()(t()().mark(function d(){var s,o,u;return t()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return u=function(){var l=o(p()(t()().mark(function x(){var g;return t()().wrap(function(i){for(;;)switch(i.prev=i.next){case 0:return i.next=2,fetch("/api/data");case 2:return g=i.sent,i.abrupt("return",g.json());case 4:case"end":return i.stop()}},x)})),{immediate:!0}),m=l.data,c=l.loading,v=l.error,y=l.execute;return r.createElement("div",null,c&&r.createElement("div",null,"Loading..."),v&&r.createElement("div",null,"Error: ",v.message),m&&r.createElement("div",null,"Data loaded: ",m.length," items"))},a.next=3,Promise.resolve().then(e.bind(e,68509));case 3:s=a.sent,o=s.useAsync;case 5:case"end":return a.stop()}},d)})))),asset:{type:"BLOCK",id:"src-use-async-demo-1",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useAsync } from '@corn12138/hooks';

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
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":P},renderOpts:{compile:function(){var d=p()(t()().mark(function o(){var u,I=arguments;return t()().wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,e.e(216).then(e.bind(e,29525));case 2:return n.abrupt("return",(u=n.sent).default.apply(u,I));case 3:case"end":return n.stop()}},o)}));function s(){return d.apply(this,arguments)}return s}()}},"src-use-async-demo-2":{component:r.memo(r.lazy(p()(t()().mark(function d(){var s,o,u;return t()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return u=function(){var l=useState(""),m=O()(l,2),c=m[0],v=m[1],y=o(p()(t()().mark(function i(){var A;return t()().wrap(function(h){for(;;)switch(h.prev=h.next){case 0:if(c){h.next=2;break}return h.abrupt("return",[]);case 2:return h.next=4,fetch("/api/search?q=".concat(c));case 4:return A=h.sent,h.abrupt("return",A.json());case 6:case"end":return h.stop()}},i)})),{deps:[c]}),x=y.data,g=y.loading,C=y.error;return r.createElement("div",null,r.createElement("input",{value:c,onChange:function(A){return v(A.target.value)},placeholder:"Search..."}),g&&r.createElement("p",null,"Searching..."),x&&r.createElement("p",null,"Found ",x.length," results"))},a.next=3,Promise.resolve().then(e.bind(e,68509));case 3:s=a.sent,o=s.useAsync;case 5:case"end":return a.stop()}},d)})))),asset:{type:"BLOCK",id:"src-use-async-demo-2",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useAsync } from '@corn12138/hooks';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const { data, loading, error } = useAsync(
    async () => {
      if (!query) return [];
      const response = await fetch(\`/api/search?q=\${query}\`);
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
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":P},renderOpts:{compile:function(){var d=p()(t()().mark(function o(){var u,I=arguments;return t()().wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,e.e(216).then(e.bind(e,29525));case 2:return n.abrupt("return",(u=n.sent).default.apply(u,I));case 3:case"end":return n.stop()}},o)}));function s(){return d.apply(this,arguments)}return s}()}},"src-use-async-demo-3":{component:r.memo(r.lazy(p()(t()().mark(function d(){var s,o,u;return t()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return u=function(l){var m=l.userId,c=o(p()(t()().mark(function C(){var i;return t()().wrap(function(f){for(;;)switch(f.prev=f.next){case 0:return f.next=2,fetch("/api/users/".concat(m));case 2:if(i=f.sent,i.ok){f.next=5;break}throw new Error("User not found");case 5:return f.abrupt("return",i.json());case 6:case"end":return f.stop()}},C)})),{immediate:!0}),v=c.data,y=c.loading,x=c.error,g=c.execute;return y?r.createElement("div",null,"Loading user..."):x?r.createElement("div",null,"Error: ",x.message):v?r.createElement("div",null,r.createElement("h1",null,v.name),r.createElement("p",null,v.email),r.createElement("button",{onClick:g},"Refresh")):r.createElement("div",null,"No user found")},a.next=3,Promise.resolve().then(e.bind(e,68509));case 3:s=a.sent,o=s.useAsync;case 5:case"end":return a.stop()}},d)})))),asset:{type:"BLOCK",id:"src-use-async-demo-3",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useAsync } from '@corn12138/hooks';

interface User {
  id: number;
  name: string;
  email: string;
}

function UserProfile({ userId }: { userId: number }) {
  const { data: user, loading, error, execute } = useAsync<User>(
    async () => {
      const response = await fetch(\`/api/users/\${userId}\`);
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
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":P},renderOpts:{compile:function(){var d=p()(t()().mark(function o(){var u,I=arguments;return t()().wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,e.e(216).then(e.bind(e,29525));case 2:return n.abrupt("return",(u=n.sent).default.apply(u,I));case 3:case"end":return n.stop()}},o)}));function s(){return d.apply(this,arguments)}return s}()}}}},10156:function(_,E,e){e.r(E),e.d(E,{texts:function(){return D}});const D=[{value:"\u7528\u4E8E\u5904\u7406\u5F02\u6B65\u64CD\u4F5C\u7684 React Hook\u3002",paraId:0,tocIndex:0},{value:"\u53C2\u6570",paraId:1,tocIndex:6},{value:"\u7C7B\u578B",paraId:1,tocIndex:6},{value:"\u5FC5\u586B",paraId:1,tocIndex:6},{value:"\u63CF\u8FF0",paraId:1,tocIndex:6},{value:"asyncFunction",paraId:1,tocIndex:6},{value:"(...args: any[]) => Promise<T>",paraId:1,tocIndex:6},{value:"\u2705",paraId:1,tocIndex:6},{value:"\u5F02\u6B65\u51FD\u6570",paraId:1,tocIndex:6},{value:"options",paraId:1,tocIndex:6},{value:"UseAsyncOptions",paraId:1,tocIndex:6},{value:"\u274C",paraId:1,tocIndex:6},{value:"\u914D\u7F6E\u9009\u9879",paraId:1,tocIndex:6},{value:"\u5C5E\u6027",paraId:2,tocIndex:7},{value:"\u7C7B\u578B",paraId:2,tocIndex:7},{value:"\u9ED8\u8BA4\u503C",paraId:2,tocIndex:7},{value:"\u63CF\u8FF0",paraId:2,tocIndex:7},{value:"immediate",paraId:2,tocIndex:7},{value:"boolean",paraId:2,tocIndex:7},{value:"false",paraId:2,tocIndex:7},{value:"\u662F\u5426\u7ACB\u5373\u6267\u884C",paraId:2,tocIndex:7},{value:"retryCount",paraId:2,tocIndex:7},{value:"number",paraId:2,tocIndex:7},{value:"0",paraId:2,tocIndex:7},{value:"\u91CD\u8BD5\u6B21\u6570",paraId:2,tocIndex:7},{value:"retryDelay",paraId:2,tocIndex:7},{value:"number",paraId:2,tocIndex:7},{value:"1000",paraId:2,tocIndex:7},{value:"\u91CD\u8BD5\u5EF6\u8FDF\uFF08\u6BEB\u79D2\uFF09",paraId:2,tocIndex:7},{value:"onSuccess",paraId:2,tocIndex:7},{value:"(data: T) => void",paraId:2,tocIndex:7},{value:"-",paraId:2,tocIndex:7},{value:"\u6210\u529F\u56DE\u8C03",paraId:2,tocIndex:7},{value:"onError",paraId:2,tocIndex:7},{value:"(error: Error) => void",paraId:2,tocIndex:7},{value:"-",paraId:2,tocIndex:7},{value:"\u9519\u8BEF\u56DE\u8C03",paraId:2,tocIndex:7},{value:"\u5C5E\u6027",paraId:3,tocIndex:8},{value:"\u7C7B\u578B",paraId:3,tocIndex:8},{value:"\u63CF\u8FF0",paraId:3,tocIndex:8},{value:"data",paraId:3,tocIndex:8},{value:"T | null",paraId:3,tocIndex:8},{value:"\u5F02\u6B65\u64CD\u4F5C\u8FD4\u56DE\u7684\u6570\u636E",paraId:3,tocIndex:8},{value:"loading",paraId:3,tocIndex:8},{value:"boolean",paraId:3,tocIndex:8},{value:"\u662F\u5426\u6B63\u5728\u52A0\u8F7D",paraId:3,tocIndex:8},{value:"error",paraId:3,tocIndex:8},{value:"string | null",paraId:3,tocIndex:8},{value:"\u9519\u8BEF\u4FE1\u606F",paraId:3,tocIndex:8},{value:"execute",paraId:3,tocIndex:8},{value:"(...args: any[]) => Promise<void>",paraId:3,tocIndex:8},{value:"\u6267\u884C\u5F02\u6B65\u51FD\u6570",paraId:3,tocIndex:8},{value:"reset",paraId:3,tocIndex:8},{value:"() => void",paraId:3,tocIndex:8},{value:"\u91CD\u7F6E\u6240\u6709\u72B6\u6001",paraId:3,tocIndex:8},{value:"cancel",paraId:3,tocIndex:8},{value:"() => void",paraId:3,tocIndex:8},{value:"\u53D6\u6D88\u5F53\u524D\u64CD\u4F5C",paraId:3,tocIndex:8},{value:"retry",paraId:3,tocIndex:8},{value:"() => void",paraId:3,tocIndex:8},{value:"\u4F7F\u7528\u4E0A\u6B21\u53C2\u6570\u91CD\u8BD5",paraId:3,tocIndex:8},{value:`const { data, error, execute } = useAsync(
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
`,paraId:4,tocIndex:10},{value:`function Component() {
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
`,paraId:5,tocIndex:11},{value:`function UserPosts({ userId }) {
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
`,paraId:6,tocIndex:12},{value:"\u7EC4\u4EF6\u5378\u8F7D\u65F6\u81EA\u52A8\u6E05\u7406",paraId:7,tocIndex:13},{value:"\uFF1AHook \u4F1A\u5728\u7EC4\u4EF6\u5378\u8F7D\u65F6\u81EA\u52A8\u53D6\u6D88\u6B63\u5728\u8FDB\u884C\u7684\u8BF7\u6C42",paraId:7,tocIndex:13},{value:"\u91CD\u8BD5\u673A\u5236",paraId:7,tocIndex:13},{value:"\uFF1A\u5931\u8D25\u65F6\u4F1A\u6839\u636E ",paraId:7,tocIndex:13},{value:"retryCount",paraId:7,tocIndex:13},{value:" \u81EA\u52A8\u91CD\u8BD5\uFF0C\u6BCF\u6B21\u91CD\u8BD5\u95F4\u9694 ",paraId:7,tocIndex:13},{value:"retryDelay",paraId:7,tocIndex:13},{value:" \u6BEB\u79D2",paraId:7,tocIndex:13},{value:"\u53C2\u6570\u7F13\u5B58",paraId:7,tocIndex:13},{value:"\uFF1A",paraId:7,tocIndex:13},{value:"retry()",paraId:7,tocIndex:13},{value:" \u65B9\u6CD5\u4F1A\u4F7F\u7528\u4E0A\u6B21 ",paraId:7,tocIndex:13},{value:"execute()",paraId:7,tocIndex:13},{value:" \u7684\u53C2\u6570",paraId:7,tocIndex:13},{value:"\u9519\u8BEF\u7C7B\u578B",paraId:7,tocIndex:13},{value:"\uFF1A\u9519\u8BEF\u4FE1\u606F\u7EDF\u4E00\u8F6C\u6362\u4E3A\u5B57\u7B26\u4E32\u7C7B\u578B",paraId:7,tocIndex:13},{value:"\u5E76\u53D1\u63A7\u5236",paraId:7,tocIndex:13},{value:"\uFF1A\u65B0\u7684 ",paraId:7,tocIndex:13},{value:"execute()",paraId:7,tocIndex:13},{value:" \u8C03\u7528\u4F1A\u53D6\u6D88\u4E4B\u524D\u7684\u8BF7\u6C42",paraId:7,tocIndex:13}]}}]);
