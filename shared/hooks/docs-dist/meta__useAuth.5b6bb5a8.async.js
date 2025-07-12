"use strict";(self.webpackChunk_corn12138_hooks=self.webpackChunk_corn12138_hooks||[]).push([[50],{47034:function(v,o,e){e.r(o),e.d(o,{demos:function(){return x}});var c=e(90819),d=e.n(c),h=e(89933),m=e.n(h),n=e(44194),g=e(68509),x={"useauth-demo-0":{component:n.memo(n.lazy(m()(d()().mark(function i(){var t,l,r,p,I;return d()().wrap(function(u){for(;;)switch(u.prev=u.next){case 0:return I=function(){var s=l(),_=s.user,A=s.login,P=s.logout,f=s.loading;return f?n.createElement("div",null,"Loading..."):n.createElement("div",null,_?n.createElement("div",null,n.createElement("p",null,"Welcome, ",_.name,"!"),n.createElement("button",{onClick:P},"Logout")):n.createElement("button",{onClick:function(){return A("username","password")}},"Login"))},p=function(){return n.createElement(r,null,n.createElement(I,null))},u.next=4,Promise.resolve().then(e.bind(e,68509));case 4:t=u.sent,l=t.useAuth,r=t.AuthProvider;case 7:case"end":return u.stop()}},i)})))),asset:{type:"BLOCK",id:"useauth-demo-0",refAtomIds:["useAuth"],dependencies:{"index.tsx":{type:"FILE",value:`import { useAuth, AuthProvider } from '@corn12138/hooks';

function App() {
  return (
    <AuthProvider>
      <MyComponent />
    </AuthProvider>
  );
}

function MyComponent() {
  const { user, login, logout, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => login('username', 'password')}>
          Login
        </button>
      )}
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":g},renderOpts:{compile:function(){var i=m()(d()().mark(function l(){var r,p=arguments;return d()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,e.e(216).then(e.bind(e,29525));case 2:return a.abrupt("return",(r=a.sent).default.apply(r,p));case 3:case"end":return a.stop()}},l)}));function t(){return i.apply(this,arguments)}return t}()}}}},1878:function(v,o,e){e.r(o),e.d(o,{texts:function(){return c}});const c=[{value:"\u7528\u4E8E\u8EAB\u4EFD\u8BA4\u8BC1\u7684 React Hook\u3002",paraId:0,tocIndex:0},{value:`npm install @corn12138/hooks
`,paraId:1,tocIndex:1},{value:"\u5C5E\u6027",paraId:2,tocIndex:3},{value:"\u7C7B\u578B",paraId:2,tocIndex:3},{value:"\u63CF\u8FF0",paraId:2,tocIndex:3},{value:"user",paraId:2,tocIndex:3},{value:"User | null",paraId:2,tocIndex:3},{value:"\u5F53\u524D\u7528\u6237\u4FE1\u606F",paraId:2,tocIndex:3},{value:"token",paraId:2,tocIndex:3},{value:"string | null",paraId:2,tocIndex:3},{value:"\u8BA4\u8BC1\u4EE4\u724C",paraId:2,tocIndex:3},{value:"isLoading",paraId:2,tocIndex:3},{value:"boolean",paraId:2,tocIndex:3},{value:"\u662F\u5426\u6B63\u5728\u52A0\u8F7D",paraId:2,tocIndex:3},{value:"isAuthenticated",paraId:2,tocIndex:3},{value:"boolean",paraId:2,tocIndex:3},{value:"\u662F\u5426\u5DF2\u8BA4\u8BC1",paraId:2,tocIndex:3},{value:"\u65B9\u6CD5",paraId:3,tocIndex:4},{value:"\u7C7B\u578B",paraId:3,tocIndex:4},{value:"\u63CF\u8FF0",paraId:3,tocIndex:4},{value:"login",paraId:3,tocIndex:4},{value:"(credentials) => Promise",paraId:3,tocIndex:4},{value:"\u7528\u6237\u767B\u5F55",paraId:3,tocIndex:4},{value:"logout",paraId:3,tocIndex:4},{value:"() => void",paraId:3,tocIndex:4},{value:"\u7528\u6237\u767B\u51FA",paraId:3,tocIndex:4},{value:"register",paraId:3,tocIndex:4},{value:"(userData) => Promise",paraId:3,tocIndex:4},{value:"\u7528\u6237\u6CE8\u518C",paraId:3,tocIndex:4},{value:"updateUser",paraId:3,tocIndex:4},{value:"(userData) => void",paraId:3,tocIndex:4},{value:"\u66F4\u65B0\u7528\u6237\u4FE1\u606F",paraId:3,tocIndex:4}]}}]);
