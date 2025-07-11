"use strict";(self.webpackChunk_corn12138_hooks=self.webpackChunk_corn12138_hooks||[]).push([[566],{91280:function(a,t,d){d.r(t);var n=d(63978),i=d(14023),x=d(3813),h=d(42469),v=d(19341),c=d(9805),s=d(97722),I=d(27804),r=d(46510),l=d(81576),u=d(44194),_=d(1878),e=d(31549);function o(){return(0,e.jsx)(r.dY,{children:(0,e.jsx)(u.Suspense,{fallback:(0,e.jsx)(l.Z,{}),children:(0,e.jsx)(e.Fragment,{children:(0,e.jsxs)("div",{className:"markdown",children:[(0,e.jsxs)("h1",{id:"useauth",children:[(0,e.jsx)("a",{"aria-hidden":"true",tabIndex:"-1",href:"#useauth",children:(0,e.jsx)("span",{className:"icon icon-link"})}),"useAuth"]}),(0,e.jsx)("p",{children:_.texts[0].value}),(0,e.jsxs)("h2",{id:"\u57FA\u7840\u7528\u6CD5",children:[(0,e.jsx)("a",{"aria-hidden":"true",tabIndex:"-1",href:"#\u57FA\u7840\u7528\u6CD5",children:(0,e.jsx)("span",{className:"icon icon-link"})}),"\u57FA\u7840\u7528\u6CD5"]}),(0,e.jsx)(c.Z,{lang:"javascript",children:_.texts[1].value}),(0,e.jsxs)("h2",{id:"api",children:[(0,e.jsx)("a",{"aria-hidden":"true",tabIndex:"-1",href:"#api",children:(0,e.jsx)("span",{className:"icon icon-link"})}),"API"]}),(0,e.jsxs)("h3",{id:"authstate",children:[(0,e.jsx)("a",{"aria-hidden":"true",tabIndex:"-1",href:"#authstate",children:(0,e.jsx)("span",{className:"icon icon-link"})}),"AuthState"]}),(0,e.jsxs)(s.Z,{children:[(0,e.jsx)("thead",{children:(0,e.jsxs)("tr",{children:[(0,e.jsx)("th",{children:_.texts[2].value}),(0,e.jsx)("th",{children:_.texts[3].value}),(0,e.jsx)("th",{children:_.texts[4].value})]})}),(0,e.jsxs)("tbody",{children:[(0,e.jsxs)("tr",{children:[(0,e.jsx)("td",{children:_.texts[5].value}),(0,e.jsx)("td",{children:_.texts[6].value}),(0,e.jsx)("td",{children:_.texts[7].value})]}),(0,e.jsxs)("tr",{children:[(0,e.jsx)("td",{children:_.texts[8].value}),(0,e.jsx)("td",{children:_.texts[9].value}),(0,e.jsx)("td",{children:_.texts[10].value})]}),(0,e.jsxs)("tr",{children:[(0,e.jsx)("td",{children:_.texts[11].value}),(0,e.jsx)("td",{children:_.texts[12].value}),(0,e.jsx)("td",{children:_.texts[13].value})]}),(0,e.jsxs)("tr",{children:[(0,e.jsx)("td",{children:_.texts[14].value}),(0,e.jsx)("td",{children:_.texts[15].value}),(0,e.jsx)("td",{children:_.texts[16].value})]})]})]}),(0,e.jsxs)("h3",{id:"\u65B9\u6CD5",children:[(0,e.jsx)("a",{"aria-hidden":"true",tabIndex:"-1",href:"#\u65B9\u6CD5",children:(0,e.jsx)("span",{className:"icon icon-link"})}),"\u65B9\u6CD5"]}),(0,e.jsxs)(s.Z,{children:[(0,e.jsx)("thead",{children:(0,e.jsxs)("tr",{children:[(0,e.jsx)("th",{children:_.texts[17].value}),(0,e.jsx)("th",{children:_.texts[18].value}),(0,e.jsx)("th",{children:_.texts[19].value})]})}),(0,e.jsxs)("tbody",{children:[(0,e.jsxs)("tr",{children:[(0,e.jsx)("td",{children:_.texts[20].value}),(0,e.jsxs)("td",{children:[_.texts[21].value,(0,e.jsx)("void",{})]}),(0,e.jsx)("td",{children:_.texts[22].value})]}),(0,e.jsxs)("tr",{children:[(0,e.jsx)("td",{children:_.texts[23].value}),(0,e.jsx)("td",{children:_.texts[24].value}),(0,e.jsx)("td",{children:_.texts[25].value})]}),(0,e.jsxs)("tr",{children:[(0,e.jsx)("td",{children:_.texts[26].value}),(0,e.jsxs)("td",{children:[_.texts[27].value,(0,e.jsx)("void",{})]}),(0,e.jsx)("td",{children:_.texts[28].value})]}),(0,e.jsxs)("tr",{children:[(0,e.jsx)("td",{children:_.texts[29].value}),(0,e.jsx)("td",{children:_.texts[30].value}),(0,e.jsx)("td",{children:_.texts[31].value})]})]})]})]})})})})}t.default=o},1878:function(a,t,d){d.r(t),d.d(t,{texts:function(){return n}});const n=[{value:"\u7528\u6237\u8BA4\u8BC1\u7BA1\u7406Hook\uFF0C\u63D0\u4F9B\u767B\u5F55\u3001\u6CE8\u518C\u3001\u767B\u51FA\u7B49\u529F\u80FD\u3002",paraId:0,tocIndex:0},{value:`// 1. \u5B89\u88C5
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
