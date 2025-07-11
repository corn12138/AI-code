"use strict";(self.webpackChunk_corn12138_hooks=self.webpackChunk_corn12138_hooks||[]).push([[50],{47034:function(o,a,n){n.r(a),n.d(a,{demos:function(){return d}});var e=n(44194),d={}},1878:function(o,a,n){n.r(a),n.d(a,{texts:function(){return e}});const e=[{value:"\u7528\u6237\u8BA4\u8BC1\u7BA1\u7406Hook\uFF0C\u63D0\u4F9B\u767B\u5F55\u3001\u6CE8\u518C\u3001\u767B\u51FA\u7B49\u529F\u80FD\u3002",paraId:0,tocIndex:0},{value:`// 1. \u5B89\u88C5
npm install @ai-code/hooks

// 2. \u5BFC\u5165
import { useAuth, AuthProvider } from '@ai-code/hooks';

// 3. \u5728\u5E94\u7528\u6839\u90E8\u5305\u88F9AuthProvider
function App() {
  return (
    <AuthProvider>
      <YourAppContent />
    </AuthProvider>
  );
}

// 4. \u5728\u7EC4\u4EF6\u4E2D\u4F7F\u7528useAuth
function LoginComponent() {
  const { login, logout, user, isAuthenticated, isLoading } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ username: 'test', password: '123456' });
    } catch (error) {
      console.error('\u767B\u5F55\u5931\u8D25:', error);
    }
  };

  if (isLoading) return <div>\u52A0\u8F7D\u4E2D...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>\u6B22\u8FCE, {user?.username}!</p>
          <button onClick={logout}>\u767B\u51FA</button>
        </div>
      ) : (
        <button onClick={handleLogin}>\u767B\u5F55</button>
      )}
    </div>
  );
}
`,paraId:1,tocIndex:1},{value:"\u5C5E\u6027",paraId:2,tocIndex:3},{value:"\u7C7B\u578B",paraId:2,tocIndex:3},{value:"\u63CF\u8FF0",paraId:2,tocIndex:3},{value:"user",paraId:2,tocIndex:3},{value:"User | null",paraId:2,tocIndex:3},{value:"\u5F53\u524D\u7528\u6237\u4FE1\u606F",paraId:2,tocIndex:3},{value:"token",paraId:2,tocIndex:3},{value:"string | null",paraId:2,tocIndex:3},{value:"\u8BA4\u8BC1\u4EE4\u724C",paraId:2,tocIndex:3},{value:"isLoading",paraId:2,tocIndex:3},{value:"boolean",paraId:2,tocIndex:3},{value:"\u662F\u5426\u6B63\u5728\u52A0\u8F7D",paraId:2,tocIndex:3},{value:"isAuthenticated",paraId:2,tocIndex:3},{value:"boolean",paraId:2,tocIndex:3},{value:"\u662F\u5426\u5DF2\u8BA4\u8BC1",paraId:2,tocIndex:3},{value:"\u65B9\u6CD5",paraId:3,tocIndex:4},{value:"\u7C7B\u578B",paraId:3,tocIndex:4},{value:"\u63CF\u8FF0",paraId:3,tocIndex:4},{value:"login",paraId:3,tocIndex:4},{value:"(credentials) => Promise",paraId:3,tocIndex:4},{value:"\u7528\u6237\u767B\u5F55",paraId:3,tocIndex:4},{value:"logout",paraId:3,tocIndex:4},{value:"() => void",paraId:3,tocIndex:4},{value:"\u7528\u6237\u767B\u51FA",paraId:3,tocIndex:4},{value:"register",paraId:3,tocIndex:4},{value:"(userData) => Promise",paraId:3,tocIndex:4},{value:"\u7528\u6237\u6CE8\u518C",paraId:3,tocIndex:4},{value:"updateUser",paraId:3,tocIndex:4},{value:"(userData) => void",paraId:3,tocIndex:4},{value:"\u66F4\u65B0\u7528\u6237\u4FE1\u606F",paraId:3,tocIndex:4}]}}]);
