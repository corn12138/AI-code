"use strict";(self.webpackChunk_corn12138_hooks=self.webpackChunk_corn12138_hooks||[]).push([[904],{8270:function(dn,I,n){var v;n.r(I),n.d(I,{demos:function(){return J}});var K=n(90819),E=n.n(K),un=n(45332),x=n.n(un),d=n(89933),R=n.n(d),a=n(44194),r=n(68509),J={"docs-examples-demo-0":{component:a.memo(a.lazy(R()(E()().mark(function p(){var l,e,s,u,o;return E()().wrap(function(w){for(;;)switch(w.prev=w.next){case 0:return w.next=2,Promise.resolve().then(n.t.bind(n,44194,19));case 2:return l=w.sent,e=l.default,s=l.useState,w.next=7,Promise.resolve().then(n.bind(n,68509));case 7:return u=w.sent,o=u.useDebounce,w.abrupt("return",{default:function(){var U=s(""),M=x()(U,2),W=M[0],nn=M[1],N=s(0),q=x()(N,2),rn=q[0],Z=q[1],ln=o(W,500);return e.useEffect(function(){ln&&(Z(function(Tn){return Tn+1}),console.log("\u6A21\u62DFAPI\u8C03\u7528\uFF1A",ln))},[ln]),e.createElement("div",{style:{padding:"20px",border:"1px solid #eee",borderRadius:"8px"}},e.createElement("h4",null,"\u{1F50D} \u641C\u7D22\u6F14\u793A"),e.createElement("div",{style:{marginBottom:"16px"}},e.createElement("input",{type:"text",value:W,onChange:function(gn){return nn(gn.target.value)},placeholder:"\u8F93\u5165\u641C\u7D22\u5173\u952E\u8BCD...",style:{width:"300px",padding:"8px 12px",border:"1px solid #ccc",borderRadius:"4px",fontSize:"14px"}})),e.createElement("div",{style:{background:"#f5f5f5",padding:"12px",borderRadius:"4px"}},e.createElement("p",null,e.createElement("strong",null,"\u5B9E\u65F6\u8F93\u5165\u503C\uFF1A")," ",W||"(\u7A7A)"),e.createElement("p",null,e.createElement("strong",null,"\u9632\u6296\u540E\u7684\u503C\uFF1A")," ",ln||"(\u7A7A)"),e.createElement("p",null,e.createElement("strong",null,"\u6A21\u62DFAPI\u8C03\u7528\u6B21\u6570\uFF1A")," ",rn)),e.createElement("div",{style:{marginTop:"12px",fontSize:"12px",color:"#666"}},"\u{1F4A1} \u63D0\u793A\uFF1A\u5FEB\u901F\u8F93\u5165\u6587\u5B57\uFF0C\u89C2\u5BDF\u9632\u6296\u6548\u679C\uFF01API\u8C03\u7528\u53EA\u5728\u505C\u6B62\u8F93\u5165500ms\u540E\u89E6\u53D1\u3002"))}});case 10:case"end":return w.stop()}},p)})))),asset:{type:"BLOCK",id:"docs-examples-demo-0",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import React, { useState } from 'react';
import { useDebounce } from '../src';

export default function DebounceDemo() {
  const [inputValue, setInputValue] = useState('');
  const [searchCount, setSearchCount] = useState(0);
  
  // \u9632\u6296\u5904\u7406\u7528\u6237\u8F93\u5165\uFF0C\u5EF6\u8FDF 500ms
  const debouncedValue = useDebounce(inputValue, 500);
  
  // \u6A21\u62DF\u641C\u7D22API\u8C03\u7528
  React.useEffect(() => {
    if (debouncedValue) {
      setSearchCount(prev => prev + 1);
      console.log('\u6A21\u62DFAPI\u8C03\u7528\uFF1A', debouncedValue);
    }
  }, [debouncedValue]);

  return (
    <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
      <h4>\u{1F50D} \u641C\u7D22\u6F14\u793A</h4>
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="\u8F93\u5165\u641C\u7D22\u5173\u952E\u8BCD..."
          style={{
            width: '300px',
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
      </div>
      
      <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
        <p><strong>\u5B9E\u65F6\u8F93\u5165\u503C\uFF1A</strong> {inputValue || '(\u7A7A)'}</p>
        <p><strong>\u9632\u6296\u540E\u7684\u503C\uFF1A</strong> {debouncedValue || '(\u7A7A)'}</p>
        <p><strong>\u6A21\u62DFAPI\u8C03\u7528\u6B21\u6570\uFF1A</strong> {searchCount}</p>
      </div>
      
      <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
        \u{1F4A1} \u63D0\u793A\uFF1A\u5FEB\u901F\u8F93\u5165\u6587\u5B57\uFF0C\u89C2\u5BDF\u9632\u6296\u6548\u679C\uFF01API\u8C03\u7528\u53EA\u5728\u505C\u6B62\u8F93\u5165500ms\u540E\u89E6\u53D1\u3002
      </div>
    </div>
  );
}`},react:{type:"NPM",value:"18.3.1"},"../src.ts":{type:"FILE",value:n(66736).Z}},entry:"index.tsx"},context:{"../src.ts":r,react:v||(v=n.t(a,2)),"/Users/huangyuming/Desktop/createProjects/AI-code/shared/hooks/src/index.ts":r},renderOpts:{compile:function(){var p=R()(E()().mark(function e(){var s,u=arguments;return E()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,n.e(216).then(n.bind(n,29525));case 2:return t.abrupt("return",(s=t.sent).default.apply(s,u));case 3:case"end":return t.stop()}},e)}));function l(){return p.apply(this,arguments)}return l}()}},"docs-examples-demo-1":{component:a.memo(a.lazy(R()(E()().mark(function p(){var l,e,s,u;return E()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,Promise.resolve().then(n.t.bind(n,44194,19));case 2:return l=t.sent,e=l.default,t.next=6,Promise.resolve().then(n.bind(n,68509));case 6:return s=t.sent,u=s.useLocalStorage,t.abrupt("return",{default:function(){var V=u("demo-theme","light"),U=x()(V,2),M=U[0],W=U[1],nn=u("demo-username",""),N=x()(nn,2),q=N[0],rn=N[1],Z=u("demo-notifications",!0),ln=x()(Z,2),Tn=ln[0],gn=ln[1],Mn=function(){W("light"),rn(""),gn(!0)};return e.createElement("div",{style:{padding:"20px",border:"1px solid #eee",borderRadius:"8px",background:M==="dark"?"#2d2d2d":"#fff",color:M==="dark"?"#fff":"#000"}},e.createElement("h4",null,"\u{1F4BE} \u672C\u5730\u5B58\u50A8\u6F14\u793A"),e.createElement("div",{style:{marginBottom:"16px"}},e.createElement("label",{style:{display:"block",marginBottom:"8px"}},"\u4E3B\u9898\u8BBE\u7F6E\uFF1A"),e.createElement("select",{value:M,onChange:function(En){return W(En.target.value)},style:{padding:"4px 8px",marginRight:"12px"}},e.createElement("option",{value:"light"},"\u6D45\u8272\u4E3B\u9898"),e.createElement("option",{value:"dark"},"\u6DF1\u8272\u4E3B\u9898"))),e.createElement("div",{style:{marginBottom:"16px"}},e.createElement("label",{style:{display:"block",marginBottom:"8px"}},"\u7528\u6237\u540D\uFF1A"),e.createElement("input",{type:"text",value:q,onChange:function(En){return rn(En.target.value)},placeholder:"\u8F93\u5165\u60A8\u7684\u7528\u6237\u540D",style:{padding:"8px 12px",border:"1px solid #ccc",borderRadius:"4px",background:M==="dark"?"#444":"#fff",color:M==="dark"?"#fff":"#000"}})),e.createElement("div",{style:{marginBottom:"16px"}},e.createElement("label",{style:{display:"flex",alignItems:"center"}},e.createElement("input",{type:"checkbox",checked:Tn,onChange:function(En){return gn(En.target.checked)},style:{marginRight:"8px"}}),"\u63A5\u6536\u901A\u77E5")),e.createElement("button",{onClick:Mn,style:{padding:"8px 16px",background:"#1890ff",color:"white",border:"none",borderRadius:"4px",cursor:"pointer"}},"\u91CD\u7F6E\u8BBE\u7F6E"),e.createElement("div",{style:{marginTop:"16px",fontSize:"12px",opacity:.7}},"\u{1F4A1} \u63D0\u793A\uFF1A\u60A8\u7684\u8BBE\u7F6E\u4F1A\u81EA\u52A8\u4FDD\u5B58\u5230\u6D4F\u89C8\u5668\u672C\u5730\u5B58\u50A8\u4E2D\uFF0C\u5237\u65B0\u9875\u9762\u540E\u4F9D\u7136\u6709\u6548\uFF01"))}});case 9:case"end":return t.stop()}},p)})))),asset:{type:"BLOCK",id:"docs-examples-demo-1",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import React from 'react';
import { useLocalStorage } from '../src';

export default function LocalStorageDemo() {
  // \u4F7F\u7528\u672C\u5730\u5B58\u50A8\u4FDD\u5B58\u7528\u6237\u504F\u597D
  const [theme, setTheme] = useLocalStorage('demo-theme', 'light');
  const [username, setUsername] = useLocalStorage('demo-username', '');
  const [notifications, setNotifications] = useLocalStorage('demo-notifications', true);

  const handleReset = () => {
    setTheme('light');
    setUsername('');
    setNotifications(true);
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #eee', 
      borderRadius: '8px',
      background: theme === 'dark' ? '#2d2d2d' : '#fff',
      color: theme === 'dark' ? '#fff' : '#000'
    }}>
      <h4>\u{1F4BE} \u672C\u5730\u5B58\u50A8\u6F14\u793A</h4>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          \u4E3B\u9898\u8BBE\u7F6E\uFF1A
        </label>
        <select 
          value={theme} 
          onChange={(e) => setTheme(e.target.value)}
          style={{ padding: '4px 8px', marginRight: '12px' }}
        >
          <option value="light">\u6D45\u8272\u4E3B\u9898</option>
          <option value="dark">\u6DF1\u8272\u4E3B\u9898</option>
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          \u7528\u6237\u540D\uFF1A
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="\u8F93\u5165\u60A8\u7684\u7528\u6237\u540D"
          style={{
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: theme === 'dark' ? '#444' : '#fff',
            color: theme === 'dark' ? '#fff' : '#000'
          }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          \u63A5\u6536\u901A\u77E5
        </label>
      </div>

      <button
        onClick={handleReset}
        style={{
          padding: '8px 16px',
          background: '#1890ff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        \u91CD\u7F6E\u8BBE\u7F6E
      </button>

      <div style={{ marginTop: '16px', fontSize: '12px', opacity: 0.7 }}>
        \u{1F4A1} \u63D0\u793A\uFF1A\u60A8\u7684\u8BBE\u7F6E\u4F1A\u81EA\u52A8\u4FDD\u5B58\u5230\u6D4F\u89C8\u5668\u672C\u5730\u5B58\u50A8\u4E2D\uFF0C\u5237\u65B0\u9875\u9762\u540E\u4F9D\u7136\u6709\u6548\uFF01
      </div>
    </div>
  );
}`},react:{type:"NPM",value:"18.3.1"},"../src.ts":{type:"FILE",value:n(66736).Z}},entry:"index.tsx"},context:{"../src.ts":r,react:v||(v=n.t(a,2)),"/Users/huangyuming/Desktop/createProjects/AI-code/shared/hooks/src/index.ts":r},renderOpts:{compile:function(){var p=R()(E()().mark(function e(){var s,u=arguments;return E()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,n.e(216).then(n.bind(n,29525));case 2:return t.abrupt("return",(s=t.sent).default.apply(s,u));case 3:case"end":return t.stop()}},e)}));function l(){return p.apply(this,arguments)}return l}()}},"docs-examples-demo-2":{component:a.memo(a.lazy(R()(E()().mark(function p(){var l,e,s,u;return E()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,Promise.resolve().then(n.t.bind(n,44194,19));case 2:return l=t.sent,e=l.default,t.next=6,Promise.resolve().then(n.bind(n,68509));case 6:return s=t.sent,u=s.useWindowSize,t.abrupt("return",{default:function(){var V=u(),U=V.width,M=V.height,W=function(){return U<768?{type:"\u{1F4F1} \u624B\u673A",color:"#ff4d4f"}:U<1024?{type:"\u{1F4CA} \u5E73\u677F",color:"#faad14"}:{type:"\u{1F4BB} \u684C\u9762",color:"#52c41a"}},nn=W();return e.createElement("div",{style:{padding:"20px",border:"1px solid #eee",borderRadius:"8px"}},e.createElement("h4",null,"\u{1F4D0} \u7A97\u53E3\u5C3A\u5BF8\u76D1\u542C\u6F14\u793A"),e.createElement("div",{style:{background:"#f0f2f5",padding:"16px",borderRadius:"8px",marginBottom:"16px"}},e.createElement("div",{style:{display:"flex",alignItems:"center",marginBottom:"8px"}},e.createElement("span",{style:{color:nn.color,fontSize:"20px",marginRight:"8px"}},nn.type),e.createElement("span",{style:{fontSize:"16px",fontWeight:"bold"}},U," \xD7 ",M)),e.createElement("div",{style:{fontSize:"14px",color:"#666"}},e.createElement("div",null,"\u5BBD\u5EA6: ",U,"px"),e.createElement("div",null,"\u9AD8\u5EA6: ",M,"px"))),e.createElement("div",{style:{display:"grid",gridTemplateColumns:U<768?"1fr":U<1024?"repeat(2, 1fr)":"repeat(3, 1fr)",gap:"12px",marginBottom:"16px"}},[1,2,3].map(function(N){return e.createElement("div",{key:N,style:{background:"#e6f7ff",padding:"16px",borderRadius:"6px",textAlign:"center",border:"1px solid #91d5ff"}},"\u7F51\u683C\u9879\u76EE ",N)})),e.createElement("div",{style:{fontSize:"12px",color:"#666"}},"\u{1F4A1} \u63D0\u793A\uFF1A\u8C03\u6574\u6D4F\u89C8\u5668\u7A97\u53E3\u5927\u5C0F\uFF0C\u89C2\u5BDF\u7F51\u683C\u5E03\u5C40\u548C\u8BBE\u5907\u7C7B\u578B\u7684\u53D8\u5316\uFF01"))}});case 9:case"end":return t.stop()}},p)})))),asset:{type:"BLOCK",id:"docs-examples-demo-2",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import React from 'react';
import { useWindowSize } from '../src';

export default function WindowSizeDemo() {
  const { width, height } = useWindowSize();
  
  // \u6839\u636E\u7A97\u53E3\u5927\u5C0F\u786E\u5B9A\u8BBE\u5907\u7C7B\u578B
  const getDeviceType = () => {
    if (width < 768) return { type: '\u{1F4F1} \u624B\u673A', color: '#ff4d4f' };
    if (width < 1024) return { type: '\u{1F4CA} \u5E73\u677F', color: '#faad14' };
    return { type: '\u{1F4BB} \u684C\u9762', color: '#52c41a' };
  };

  const device = getDeviceType();

  return (
    <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
      <h4>\u{1F4D0} \u7A97\u53E3\u5C3A\u5BF8\u76D1\u542C\u6F14\u793A</h4>
      
      <div style={{ 
        background: '#f0f2f5', 
        padding: '16px', 
        borderRadius: '8px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ color: device.color, fontSize: '20px', marginRight: '8px' }}>
            {device.type}
          </span>
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
            {width} \xD7 {height}
          </span>
        </div>
        
        <div style={{ fontSize: '14px', color: '#666' }}>
          <div>\u5BBD\u5EA6: {width}px</div>
          <div>\u9AD8\u5EA6: {height}px</div>
        </div>
      </div>

      {/* \u54CD\u5E94\u5F0F\u7F51\u683C\u6F14\u793A */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: width < 768 ? '1fr' : width < 1024 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '16px'
      }}>
        {[1, 2, 3].map(num => (
          <div
            key={num}
            style={{
              background: '#e6f7ff',
              padding: '16px',
              borderRadius: '6px',
              textAlign: 'center',
              border: '1px solid #91d5ff'
            }}
          >
            \u7F51\u683C\u9879\u76EE {num}
          </div>
        ))}
      </div>

      <div style={{ fontSize: '12px', color: '#666' }}>
        \u{1F4A1} \u63D0\u793A\uFF1A\u8C03\u6574\u6D4F\u89C8\u5668\u7A97\u53E3\u5927\u5C0F\uFF0C\u89C2\u5BDF\u7F51\u683C\u5E03\u5C40\u548C\u8BBE\u5907\u7C7B\u578B\u7684\u53D8\u5316\uFF01
      </div>
    </div>
  );
}`},react:{type:"NPM",value:"18.3.1"},"../src.ts":{type:"FILE",value:n(66736).Z}},entry:"index.tsx"},context:{"../src.ts":r,react:v||(v=n.t(a,2)),"/Users/huangyuming/Desktop/createProjects/AI-code/shared/hooks/src/index.ts":r},renderOpts:{compile:function(){var p=R()(E()().mark(function e(){var s,u=arguments;return E()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,n.e(216).then(n.bind(n,29525));case 2:return t.abrupt("return",(s=t.sent).default.apply(s,u));case 3:case"end":return t.stop()}},e)}));function l(){return p.apply(this,arguments)}return l}()}},"docs-examples-demo-3":{component:a.memo(a.lazy(R()(E()().mark(function p(){var l,e,s,u,o;return E()().wrap(function(w){for(;;)switch(w.prev=w.next){case 0:return w.next=2,Promise.resolve().then(n.t.bind(n,44194,19));case 2:return l=w.sent,e=l.default,w.next=6,Promise.resolve().then(n.bind(n,68509));case 6:return s=w.sent,u=s.useAsync,o=function(){var V=R()(E()().mark(function U(M){var W;return E()().wrap(function(N){for(;;)switch(N.prev=N.next){case 0:return N.next=2,new Promise(function(q){return setTimeout(q,1e3)});case 2:if(!(Math.random()<.3)){N.next=4;break}throw new Error("\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5");case 4:return W=[{id:1,name:"\u5F20\u4E09",email:"zhangsan@example.com"},{id:2,name:"\u674E\u56DB",email:"lisi@example.com"},{id:3,name:"\u738B\u4E94",email:"wangwu@example.com"}],N.abrupt("return",W.find(function(q){return q.id===M})||W[0]);case 6:case"end":return N.stop()}},U)}));return function(M){return V.apply(this,arguments)}}(),w.abrupt("return",{default:function(){var U=u(o,{immediate:!1,retryCount:2,retryDelay:1e3,onSuccess:function(ln){return console.log("\u7528\u6237\u52A0\u8F7D\u6210\u529F:",ln)},onError:function(ln){return console.log("\u52A0\u8F7D\u5931\u8D25:",ln.message)}}),M=U.data,W=U.loading,nn=U.error,N=U.execute,q=U.retry,rn=function(ln){N(ln)};return e.createElement("div",{style:{padding:"20px",border:"1px solid #eee",borderRadius:"8px"}},e.createElement("h4",null,"\u26A1 \u5F02\u6B65\u64CD\u4F5C\u6F14\u793A"),e.createElement("div",{style:{marginBottom:"16px"}},e.createElement("p",{style:{marginBottom:"12px"}},"\u9009\u62E9\u8981\u52A0\u8F7D\u7684\u7528\u6237\uFF1A"),[1,2,3].map(function(Z){return e.createElement("button",{key:Z,onClick:function(){return rn(Z)},disabled:W,style:{padding:"8px 16px",margin:"0 8px 8px 0",background:W?"#f5f5f5":"#1890ff",color:W?"#999":"white",border:"none",borderRadius:"4px",cursor:W?"not-allowed":"pointer"}},"\u52A0\u8F7D\u7528\u6237 ",Z)})),e.createElement("div",{style:{background:"#f5f5f5",padding:"16px",borderRadius:"8px",minHeight:"120px"}},W&&e.createElement("div",{style:{textAlign:"center",color:"#1890ff"}},"\u{1F504} \u52A0\u8F7D\u4E2D..."),nn&&e.createElement("div",{style:{color:"#ff4d4f"}},"\u274C ",nn,e.createElement("button",{onClick:q,style:{marginLeft:"12px",padding:"4px 8px",background:"#ff4d4f",color:"white",border:"none",borderRadius:"4px",cursor:"pointer"}},"\u91CD\u8BD5")),M&&!W&&e.createElement("div",{style:{color:"#52c41a"}},e.createElement("h5",{style:{margin:"0 0 8px 0"}},"\u2705 \u7528\u6237\u4FE1\u606F\u52A0\u8F7D\u6210\u529F\uFF1A"),e.createElement("div",null,e.createElement("strong",null,"ID:")," ",M.id),e.createElement("div",null,e.createElement("strong",null,"\u59D3\u540D:")," ",M.name),e.createElement("div",null,e.createElement("strong",null,"\u90AE\u7BB1:")," ",M.email))),e.createElement("div",{style:{marginTop:"12px",fontSize:"12px",color:"#666"}},"\u{1F4A1} \u63D0\u793A\uFF1A\u6B64\u793A\u4F8B\u670930%\u7684\u968F\u673A\u5931\u8D25\u7387\uFF0C\u652F\u6301\u81EA\u52A8\u91CD\u8BD5\u3002\u8BF7\u591A\u6B21\u70B9\u51FB\u4F53\u9A8C\u4E0D\u540C\u72B6\u6001\uFF01"))}});case 10:case"end":return w.stop()}},p)})))),asset:{type:"BLOCK",id:"docs-examples-demo-3",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import React from 'react';
import { useAsync } from '../src';

// \u6A21\u62DFAPI\u51FD\u6570
const mockFetchUser = async (userId: number): Promise<{id: number, name: string, email: string}> => {
  // \u6A21\u62DF\u7F51\u7EDC\u5EF6\u8FDF
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // \u6A21\u62DF\u968F\u673A\u5931\u8D25
  if (Math.random() < 0.3) {
    throw new Error('\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5');
  }
  
  const users = [
    { id: 1, name: '\u5F20\u4E09', email: 'zhangsan@example.com' },
    { id: 2, name: '\u674E\u56DB', email: 'lisi@example.com' },
    { id: 3, name: '\u738B\u4E94', email: 'wangwu@example.com' },
  ];
  
  return users.find(user => user.id === userId) || users[0];
};

export default function AsyncDemo() {
  const { data: user, loading, error, execute, retry } = useAsync(mockFetchUser, {
    immediate: false,
    retryCount: 2,
    retryDelay: 1000,
    onSuccess: (data) => console.log('\u7528\u6237\u52A0\u8F7D\u6210\u529F:', data),
    onError: (error) => console.log('\u52A0\u8F7D\u5931\u8D25:', error.message)
  });

  const handleLoadUser = (userId: number) => {
    execute(userId);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
      <h4>\u26A1 \u5F02\u6B65\u64CD\u4F5C\u6F14\u793A</h4>
      
      <div style={{ marginBottom: '16px' }}>
        <p style={{ marginBottom: '12px' }}>\u9009\u62E9\u8981\u52A0\u8F7D\u7684\u7528\u6237\uFF1A</p>
        {[1, 2, 3].map(id => (
          <button
            key={id}
            onClick={() => handleLoadUser(id)}
            disabled={loading}
            style={{
              padding: '8px 16px',
              margin: '0 8px 8px 0',
              background: loading ? '#f5f5f5' : '#1890ff',
              color: loading ? '#999' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            \u52A0\u8F7D\u7528\u6237 {id}
          </button>
        ))}
      </div>

      {/* \u72B6\u6001\u663E\u793A */}
      <div style={{ 
        background: '#f5f5f5', 
        padding: '16px', 
        borderRadius: '8px',
        minHeight: '120px'
      }}>
        {loading && (
          <div style={{ textAlign: 'center', color: '#1890ff' }}>
            \u{1F504} \u52A0\u8F7D\u4E2D...
          </div>
        )}
        
        {error && (
          <div style={{ color: '#ff4d4f' }}>
            \u274C {error}
            <button
              onClick={retry}
              style={{
                marginLeft: '12px',
                padding: '4px 8px',
                background: '#ff4d4f',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              \u91CD\u8BD5
            </button>
          </div>
        )}
        
        {user && !loading && (
          <div style={{ color: '#52c41a' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>\u2705 \u7528\u6237\u4FE1\u606F\u52A0\u8F7D\u6210\u529F\uFF1A</h5>
            <div><strong>ID:</strong> {user.id}</div>
            <div><strong>\u59D3\u540D:</strong> {user.name}</div>
            <div><strong>\u90AE\u7BB1:</strong> {user.email}</div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
        \u{1F4A1} \u63D0\u793A\uFF1A\u6B64\u793A\u4F8B\u670930%\u7684\u968F\u673A\u5931\u8D25\u7387\uFF0C\u652F\u6301\u81EA\u52A8\u91CD\u8BD5\u3002\u8BF7\u591A\u6B21\u70B9\u51FB\u4F53\u9A8C\u4E0D\u540C\u72B6\u6001\uFF01
      </div>
    </div>
  );
}`},react:{type:"NPM",value:"18.3.1"},"../src.ts":{type:"FILE",value:n(66736).Z}},entry:"index.tsx"},context:{"../src.ts":r,react:v||(v=n.t(a,2)),"/Users/huangyuming/Desktop/createProjects/AI-code/shared/hooks/src/index.ts":r},renderOpts:{compile:function(){var p=R()(E()().mark(function e(){var s,u=arguments;return E()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,n.e(216).then(n.bind(n,29525));case 2:return t.abrupt("return",(s=t.sent).default.apply(s,u));case 3:case"end":return t.stop()}},e)}));function l(){return p.apply(this,arguments)}return l}()}},"docs-examples-demo-formdemo":{component:a.memo(a.lazy(function(){return Promise.all([n.e(216),n.e(433)]).then(n.bind(n,50467))})),asset:{type:"BLOCK",id:"docs-examples-demo-formdemo",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:n(34759).Z},react:{type:"NPM",value:"18.3.1"}},entry:"index.tsx"},context:{react:v||(v=n.t(a,2))},renderOpts:{compile:function(){var p=R()(E()().mark(function e(){var s,u=arguments;return E()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,n.e(216).then(n.bind(n,29525));case 2:return t.abrupt("return",(s=t.sent).default.apply(s,u));case 3:case"end":return t.stop()}},e)}));function l(){return p.apply(this,arguments)}return l}()}},"docs-examples-demo-networkstatusdemo":{component:a.memo(a.lazy(function(){return Promise.all([n.e(216),n.e(433)]).then(n.bind(n,77643))})),asset:{type:"BLOCK",id:"docs-examples-demo-networkstatusdemo",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:n(64464).Z},react:{type:"NPM",value:"18.3.1"}},entry:"index.tsx"},context:{react:v||(v=n.t(a,2))},renderOpts:{compile:function(){var p=R()(E()().mark(function e(){var s,u=arguments;return E()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,n.e(216).then(n.bind(n,29525));case 2:return t.abrupt("return",(s=t.sent).default.apply(s,u));case 3:case"end":return t.stop()}},e)}));function l(){return p.apply(this,arguments)}return l}()}},"docs-examples-demo-authdemo":{component:a.memo(a.lazy(function(){return Promise.all([n.e(216),n.e(433)]).then(n.bind(n,56199))})),asset:{type:"BLOCK",id:"docs-examples-demo-authdemo",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:n(83684).Z},react:{type:"NPM",value:"18.3.1"}},entry:"index.tsx"},context:{react:v||(v=n.t(a,2))},renderOpts:{compile:function(){var p=R()(E()().mark(function e(){var s,u=arguments;return E()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,n.e(216).then(n.bind(n,29525));case 2:return t.abrupt("return",(s=t.sent).default.apply(s,u));case 3:case"end":return t.stop()}},e)}));function l(){return p.apply(this,arguments)}return l}()}},"docs-examples-demo-apidemo":{component:a.memo(a.lazy(function(){return Promise.all([n.e(216),n.e(433)]).then(n.bind(n,5344))})),asset:{type:"BLOCK",id:"docs-examples-demo-apidemo",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:n(18842).Z},react:{type:"NPM",value:"18.3.1"}},entry:"index.tsx"},context:{react:v||(v=n.t(a,2))},renderOpts:{compile:function(){var p=R()(E()().mark(function e(){var s,u=arguments;return E()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,n.e(216).then(n.bind(n,29525));case 2:return t.abrupt("return",(s=t.sent).default.apply(s,u));case 3:case"end":return t.stop()}},e)}));function l(){return p.apply(this,arguments)}return l}()}},"docs-examples-demo-clientsidedemo":{component:a.memo(a.lazy(function(){return Promise.all([n.e(216),n.e(433)]).then(n.bind(n,11084))})),asset:{type:"BLOCK",id:"docs-examples-demo-clientsidedemo",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:n(32776).Z},react:{type:"NPM",value:"18.3.1"}},entry:"index.tsx"},context:{react:v||(v=n.t(a,2))},renderOpts:{compile:function(){var p=R()(E()().mark(function e(){var s,u=arguments;return E()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,n.e(216).then(n.bind(n,29525));case 2:return t.abrupt("return",(s=t.sent).default.apply(s,u));case 3:case"end":return t.stop()}},e)}));function l(){return p.apply(this,arguments)}return l}()}},"docs-examples-demo-editordemo":{component:a.memo(a.lazy(function(){return Promise.all([n.e(216),n.e(433)]).then(n.bind(n,20340))})),asset:{type:"BLOCK",id:"docs-examples-demo-editordemo",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:n(58161).Z},react:{type:"NPM",value:"18.3.1"}},entry:"index.tsx"},context:{react:v||(v=n.t(a,2))},renderOpts:{compile:function(){var p=R()(E()().mark(function e(){var s,u=arguments;return E()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,n.e(216).then(n.bind(n,29525));case 2:return t.abrupt("return",(s=t.sent).default.apply(s,u));case 3:case"end":return t.stop()}},e)}));function l(){return p.apply(this,arguments)}return l}()}}}},42145:function(dn,I,n){var v;n.r(I),n.d(I,{demos:function(){return J}});var K=n(45332),E=n.n(K),un=n(90819),x=n.n(un),d=n(89933),R=n.n(d),a=n(44194),r=n(68509),J={"docs-guide-demo-0":{component:a.memo(a.lazy(R()(x()().mark(function p(){var l,e,s;return x()().wrap(function(o){for(;;)switch(o.prev=o.next){case 0:return s=function(){var w=e(),V=w.user,U=w.login,M=w.logout,W=w.loading,nn=function(){var N=R()(x()().mark(function q(){return x()().wrap(function(Z){for(;;)switch(Z.prev=Z.next){case 0:return Z.prev=0,Z.next=3,U({username:"admin",password:"123456"});case 3:Z.next=8;break;case 5:Z.prev=5,Z.t0=Z.catch(0),console.error("\u767B\u5F55\u5931\u8D25:",Z.t0);case 8:case"end":return Z.stop()}},q,null,[[0,5]])}));return function(){return N.apply(this,arguments)}}();return W?a.createElement("div",null,"\u767B\u5F55\u4E2D..."):a.createElement("div",null,V?a.createElement("div",null,a.createElement("span",null,"\u6B22\u8FCE\uFF0C",V.username,"!"),a.createElement("button",{onClick:M},"\u9000\u51FA")):a.createElement("button",{onClick:nn},"\u767B\u5F55"))},o.next=3,Promise.resolve().then(n.bind(n,68509));case 3:l=o.sent,e=l.useAuth;case 5:case"end":return o.stop()}},p)})))),asset:{type:"BLOCK",id:"docs-guide-demo-0",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useAuth } from '@corn12138/hooks';

function LoginComponent() {
  const { user, login, logout, loading } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ username: 'admin', password: '123456' });
    } catch (error) {
      console.error('\u767B\u5F55\u5931\u8D25:', error);
    }
  };

  if (loading) return <div>\u767B\u5F55\u4E2D...</div>;

  return (
    <div>
      {user ? (
        <div>
          <span>\u6B22\u8FCE\uFF0C{user.username}!</span>
          <button onClick={logout}>\u9000\u51FA</button>
        </div>
      ) : (
        <button onClick={handleLogin}>\u767B\u5F55</button>
      )}
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.3"}},entry:"index.tsx"},context:{"@corn12138/hooks":r},renderOpts:{compile:function(){var p=R()(x()().mark(function e(){var s,u=arguments;return x()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,n.e(216).then(n.bind(n,29525));case 2:return t.abrupt("return",(s=t.sent).default.apply(s,u));case 3:case"end":return t.stop()}},e)}));function l(){return p.apply(this,arguments)}return l}()}},"docs-guide-demo-1":{component:a.memo(a.lazy(R()(x()().mark(function p(){var l,e,s,u,o,t;return x()().wrap(function(V){for(;;)switch(V.prev=V.next){case 0:return t=function(){var M=u(""),W=E()(M,2),nn=W[0],N=W[1],q=e(nn,300);return o(function(){q&&console.log("\u641C\u7D22:",q)},[q]),a.createElement("input",{type:"text",placeholder:"\u8F93\u5165\u641C\u7D22\u5185\u5BB9...",value:nn,onChange:function(Z){return N(Z.target.value)}})},V.next=3,Promise.resolve().then(n.bind(n,68509));case 3:return l=V.sent,e=l.useDebounce,V.next=7,Promise.resolve().then(n.t.bind(n,44194,19));case 7:s=V.sent,u=s.useState,o=s.useEffect;case 10:case"end":return V.stop()}},p)})))),asset:{type:"BLOCK",id:"docs-guide-demo-1",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useDebounce } from '@corn12138/hooks';
import { useState, useEffect } from 'react';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // \u6267\u884C\u641C\u7D22\u903B\u8F91
      console.log('\u641C\u7D22:', debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      type="text"
      placeholder="\u8F93\u5165\u641C\u7D22\u5185\u5BB9..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.3"},react:{type:"NPM",value:"18.3.1"}},entry:"index.tsx"},context:{"@corn12138/hooks":r,react:v||(v=n.t(a,2))},renderOpts:{compile:function(){var p=R()(x()().mark(function e(){var s,u=arguments;return x()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,n.e(216).then(n.bind(n,29525));case 2:return t.abrupt("return",(s=t.sent).default.apply(s,u));case 3:case"end":return t.stop()}},e)}));function l(){return p.apply(this,arguments)}return l}()}},"docs-guide-demo-2":{component:a.memo(a.lazy(R()(x()().mark(function p(){var l,e,s;return x()().wrap(function(o){for(;;)switch(o.prev=o.next){case 0:return s=function(){var w=e(R()(x()().mark(function nn(){var N;return x()().wrap(function(rn){for(;;)switch(rn.prev=rn.next){case 0:return rn.next=2,fetch("/api/data");case 2:return N=rn.sent,rn.abrupt("return",N.json());case 4:case"end":return rn.stop()}},nn)}))),V=w.data,U=w.loading,M=w.error,W=w.execute;return a.createElement("div",null,a.createElement("button",{onClick:W,disabled:U},U?"\u52A0\u8F7D\u4E2D...":"\u83B7\u53D6\u6570\u636E"),M&&a.createElement("div",null,"\u9519\u8BEF: ",M.message),V&&a.createElement("div",null,"\u6570\u636E: ",JSON.stringify(V)))},o.next=3,Promise.resolve().then(n.bind(n,68509));case 3:l=o.sent,e=l.useAsync;case 5:case"end":return o.stop()}},p)})))),asset:{type:"BLOCK",id:"docs-guide-demo-2",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useAsync } from '@corn12138/hooks';

function DataComponent() {
  const { data, loading, error, execute } = useAsync(async () => {
    const response = await fetch('/api/data');
    return response.json();
  });

  return (
    <div>
      <button onClick={execute} disabled={loading}>
        {loading ? '\u52A0\u8F7D\u4E2D...' : '\u83B7\u53D6\u6570\u636E'}
      </button>
      
      {error && <div>\u9519\u8BEF: {error.message}</div>}
      {data && <div>\u6570\u636E: {JSON.stringify(data)}</div>}
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.3"}},entry:"index.tsx"},context:{"@corn12138/hooks":r},renderOpts:{compile:function(){var p=R()(x()().mark(function e(){var s,u=arguments;return x()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,n.e(216).then(n.bind(n,29525));case 2:return t.abrupt("return",(s=t.sent).default.apply(s,u));case 3:case"end":return t.stop()}},e)}));function l(){return p.apply(this,arguments)}return l}()}}}},73161:function(dn,I,n){n.r(I),n.d(I,{demos:function(){return K}});var v=n(44194),K={}},69298:function(dn,I,n){var v;n.r(I),n.d(I,{demos:function(){return r}});var K=n(45332),E=n.n(K),un=n(90819),x=n.n(un),d=n(89933),R=n.n(d),a=n(44194),r={"docs-simple-examples-demo-simpledemo":{component:a.memo(a.lazy(function(){return Promise.all([n.e(216),n.e(433)]).then(n.bind(n,13348))})),asset:{type:"BLOCK",id:"docs-simple-examples-demo-simpledemo",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:n(41180).Z},react:{type:"NPM",value:"18.3.1"}},entry:"index.tsx"},context:{react:v||(v=n.t(a,2))},renderOpts:{compile:function(){var J=R()(x()().mark(function l(){var e,s=arguments;return x()().wrap(function(o){for(;;)switch(o.prev=o.next){case 0:return o.next=2,n.e(216).then(n.bind(n,29525));case 2:return o.abrupt("return",(e=o.sent).default.apply(e,s));case 3:case"end":return o.stop()}},l)}));function p(){return J.apply(this,arguments)}return p}()}},"docs-simple-examples-demo-formdemo":{component:a.memo(a.lazy(function(){return Promise.all([n.e(216),n.e(433)]).then(n.bind(n,50467))})),asset:{type:"BLOCK",id:"docs-simple-examples-demo-formdemo",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:n(34759).Z},react:{type:"NPM",value:"18.3.1"}},entry:"index.tsx"},context:{react:v||(v=n.t(a,2))},renderOpts:{compile:function(){var J=R()(x()().mark(function l(){var e,s=arguments;return x()().wrap(function(o){for(;;)switch(o.prev=o.next){case 0:return o.next=2,n.e(216).then(n.bind(n,29525));case 2:return o.abrupt("return",(e=o.sent).default.apply(e,s));case 3:case"end":return o.stop()}},l)}));function p(){return J.apply(this,arguments)}return p}()}},"docs-simple-examples-demo-networkstatusdemo":{component:a.memo(a.lazy(function(){return Promise.all([n.e(216),n.e(433)]).then(n.bind(n,77643))})),asset:{type:"BLOCK",id:"docs-simple-examples-demo-networkstatusdemo",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:n(64464).Z},react:{type:"NPM",value:"18.3.1"}},entry:"index.tsx"},context:{react:v||(v=n.t(a,2))},renderOpts:{compile:function(){var J=R()(x()().mark(function l(){var e,s=arguments;return x()().wrap(function(o){for(;;)switch(o.prev=o.next){case 0:return o.next=2,n.e(216).then(n.bind(n,29525));case 2:return o.abrupt("return",(e=o.sent).default.apply(e,s));case 3:case"end":return o.stop()}},l)}));function p(){return J.apply(this,arguments)}return p}()}},"docs-simple-examples-demo-authdemo":{component:a.memo(a.lazy(function(){return Promise.all([n.e(216),n.e(433)]).then(n.bind(n,56199))})),asset:{type:"BLOCK",id:"docs-simple-examples-demo-authdemo",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:n(83684).Z},react:{type:"NPM",value:"18.3.1"}},entry:"index.tsx"},context:{react:v||(v=n.t(a,2))},renderOpts:{compile:function(){var J=R()(x()().mark(function l(){var e,s=arguments;return x()().wrap(function(o){for(;;)switch(o.prev=o.next){case 0:return o.next=2,n.e(216).then(n.bind(n,29525));case 2:return o.abrupt("return",(e=o.sent).default.apply(e,s));case 3:case"end":return o.stop()}},l)}));function p(){return J.apply(this,arguments)}return p}()}},"docs-simple-examples-demo-apidemo":{component:a.memo(a.lazy(function(){return Promise.all([n.e(216),n.e(433)]).then(n.bind(n,5344))})),asset:{type:"BLOCK",id:"docs-simple-examples-demo-apidemo",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:n(18842).Z},react:{type:"NPM",value:"18.3.1"}},entry:"index.tsx"},context:{react:v||(v=n.t(a,2))},renderOpts:{compile:function(){var J=R()(x()().mark(function l(){var e,s=arguments;return x()().wrap(function(o){for(;;)switch(o.prev=o.next){case 0:return o.next=2,n.e(216).then(n.bind(n,29525));case 2:return o.abrupt("return",(e=o.sent).default.apply(e,s));case 3:case"end":return o.stop()}},l)}));function p(){return J.apply(this,arguments)}return p}()}},"docs-simple-examples-demo-clientsidedemo":{component:a.memo(a.lazy(function(){return Promise.all([n.e(216),n.e(433)]).then(n.bind(n,11084))})),asset:{type:"BLOCK",id:"docs-simple-examples-demo-clientsidedemo",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:n(32776).Z},react:{type:"NPM",value:"18.3.1"}},entry:"index.tsx"},context:{react:v||(v=n.t(a,2))},renderOpts:{compile:function(){var J=R()(x()().mark(function l(){var e,s=arguments;return x()().wrap(function(o){for(;;)switch(o.prev=o.next){case 0:return o.next=2,n.e(216).then(n.bind(n,29525));case 2:return o.abrupt("return",(e=o.sent).default.apply(e,s));case 3:case"end":return o.stop()}},l)}));function p(){return J.apply(this,arguments)}return p}()}},"docs-simple-examples-demo-editordemo":{component:a.memo(a.lazy(function(){return Promise.all([n.e(216),n.e(433)]).then(n.bind(n,20340))})),asset:{type:"BLOCK",id:"docs-simple-examples-demo-editordemo",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:n(58161).Z},react:{type:"NPM",value:"18.3.1"}},entry:"index.tsx"},context:{react:v||(v=n.t(a,2))},renderOpts:{compile:function(){var J=R()(x()().mark(function l(){var e,s=arguments;return x()().wrap(function(o){for(;;)switch(o.prev=o.next){case 0:return o.next=2,n.e(216).then(n.bind(n,29525));case 2:return o.abrupt("return",(e=o.sent).default.apply(e,s));case 3:case"end":return o.stop()}},l)}));function p(){return J.apply(this,arguments)}return p}()}},"docs-simple-examples-demo-0":{component:a.memo(a.lazy(R()(x()().mark(function J(){var p,l,e;return x()().wrap(function(u){for(;;)switch(u.prev=u.next){case 0:return u.next=2,Promise.resolve().then(n.t.bind(n,44194,19));case 2:return p=u.sent,l=p.default,e=p.useState,u.abrupt("return",{default:function(){var t=e(0),w=E()(t,2),V=w[0],U=w[1];return l.createElement("div",{style:{padding:"20px",border:"1px solid #ccc"}},l.createElement("p",null,"\u8BA1\u6570\u5668: ",V),l.createElement("button",{onClick:function(){return U(V+1)}},"\u70B9\u51FB +1"))}});case 6:case"end":return u.stop()}},J)})))),asset:{type:"BLOCK",id:"docs-simple-examples-demo-0",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import React, { useState } from 'react';

export default function InlineDemo() {
  const [count, setCount] = useState(0);
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc' }}>
      <p>\u8BA1\u6570\u5668: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        \u70B9\u51FB +1
      </button>
    </div>
  );
}`},react:{type:"NPM",value:"18.3.1"}},entry:"index.tsx"},context:{react:v||(v=n.t(a,2))},renderOpts:{compile:function(){var J=R()(x()().mark(function l(){var e,s=arguments;return x()().wrap(function(o){for(;;)switch(o.prev=o.next){case 0:return o.next=2,n.e(216).then(n.bind(n,29525));case 2:return o.abrupt("return",(e=o.sent).default.apply(e,s));case 3:case"end":return o.stop()}},l)}));function p(){return J.apply(this,arguments)}return p}()}}}},68509:function(dn,I,n){n.r(I),n.d(I,{AuthProvider:function(){return l},useApi:function(){return jn},useAsync:function(){return Z},useAuth:function(){return e},useClientSide:function(){return w},useClientSideEffect:function(){return V},useClientState:function(){return U},useDebounce:function(){return o},useDebouncedCallback:function(){return t},useEditor:function(){return nn},useForm:function(){return En},useLocalStorage:function(){return Vn},useNetworkStatus:function(){return ln},useWindowSize:function(){return Nn},version:function(){return Hn}});var v=n(90819),K=n.n(v),E=n(89933),un=n.n(E),x=n(73193),d=n.n(x),R=n(45332),a=n.n(R),r=n(44194),J=n(31549),p=(0,r.createContext)(void 0),l=function(m){var f=m.children,h=(0,r.useState)({user:null,token:null,isLoading:!0,isAuthenticated:!1}),g=a()(h,2),P=g[0],b=g[1];(0,r.useEffect)(function(){var y=function(){if(typeof window!="undefined"){var L=localStorage.getItem("token"),S=localStorage.getItem("user");if(L&&S)try{var C=JSON.parse(S);b({user:C,token:L,isLoading:!1,isAuthenticated:!0})}catch(A){localStorage.removeItem("token"),localStorage.removeItem("user"),b(function(j){return d()(d()({},j),{},{isLoading:!1})})}else b(function(A){return d()(d()({},A),{},{isLoading:!1})})}};y()},[]);var G=(0,r.useCallback)(function(){var y=un()(K()().mark(function c(L){var S,C,A,j;return K()().wrap(function(k){for(;;)switch(k.prev=k.next){case 0:return b(function(on){return d()(d()({},on),{},{isLoading:!0})}),k.prev=1,k.next=4,fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(L)});case 4:if(S=k.sent,S.ok){k.next=7;break}throw new Error("\u767B\u5F55\u5931\u8D25");case 7:return k.next=9,S.json();case 9:C=k.sent,A=C.user,j=C.token,typeof window!="undefined"&&(localStorage.setItem("token",j),localStorage.setItem("user",JSON.stringify(A))),b({user:A,token:j,isLoading:!1,isAuthenticated:!0}),k.next=20;break;case 16:throw k.prev=16,k.t0=k.catch(1),b(function(on){return d()(d()({},on),{},{isLoading:!1})}),k.t0;case 20:case"end":return k.stop()}},c,null,[[1,16]])}));return function(c){return y.apply(this,arguments)}}(),[]),D=(0,r.useCallback)(function(){typeof window!="undefined"&&(localStorage.removeItem("token"),localStorage.removeItem("user")),b({user:null,token:null,isLoading:!1,isAuthenticated:!1})},[]),$=(0,r.useCallback)(function(){var y=un()(K()().mark(function c(L){var S,C,A,j;return K()().wrap(function(k){for(;;)switch(k.prev=k.next){case 0:return b(function(on){return d()(d()({},on),{},{isLoading:!0})}),k.prev=1,k.next=4,fetch("/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(L)});case 4:if(S=k.sent,S.ok){k.next=7;break}throw new Error("\u6CE8\u518C\u5931\u8D25");case 7:return k.next=9,S.json();case 9:C=k.sent,A=C.user,j=C.token,typeof window!="undefined"&&(localStorage.setItem("token",j),localStorage.setItem("user",JSON.stringify(A))),b({user:A,token:j,isLoading:!1,isAuthenticated:!0}),k.next=20;break;case 16:throw k.prev=16,k.t0=k.catch(1),b(function(on){return d()(d()({},on),{},{isLoading:!1})}),k.t0;case 20:case"end":return k.stop()}},c,null,[[1,16]])}));return function(c){return y.apply(this,arguments)}}(),[]),z=(0,r.useCallback)(function(y){b(function(c){if(!c.user)return c;var L=d()(d()({},c.user),y);return typeof window!="undefined"&&localStorage.setItem("user",JSON.stringify(L)),d()(d()({},c),{},{user:L})})},[]),F=d()(d()({},P),{},{login:G,logout:D,register:$,updateUser:z});return(0,J.jsx)(p.Provider,{value:F,children:f})},e=function(){var m=(0,r.useContext)(p);if(m===void 0)throw new Error("useAuth\u5FC5\u987B\u5728AuthProvider\u5185\u90E8\u4F7F\u7528");return m},s=n(76711),u=n.n(s);function o(i,m){var f=(0,r.useState)(i),h=a()(f,2),g=h[0],P=h[1];return(0,r.useEffect)(function(){var b=setTimeout(function(){P(i)},m);return function(){clearTimeout(b)}},[i,m]),g}function t(i,m){var f=arguments.length>2&&arguments[2]!==void 0?arguments[2]:[],h=(0,r.useState)(function(){return i}),g=a()(h,2),P=g[0],b=g[1];return(0,r.useEffect)(function(){var G=setTimeout(function(){b(function(){return i})},m);return function(){clearTimeout(G)}},[i,m].concat(u()(f))),P}function w(){var i=(0,r.useState)(!1),m=a()(i,2),f=m[0],h=m[1];return(0,r.useEffect)(function(){h(!0)},[]),f}function V(i,m){var f=w();(0,r.useEffect)(function(){if(f)return i()},[f].concat(u()(m||[])))}function U(i){var m=w(),f=(0,r.useState)(i),h=a()(f,2),g=h[0],P=h[1];return[m?g:i,P]}var M=n(86222),W=n.n(M);function nn(){var i=arguments.length>0&&arguments[0]!==void 0?arguments[0]:[],m=(0,r.useState)({components:i,selectedComponentId:null,draggedComponent:null,history:[i],historyIndex:0,mode:"design"}),f=a()(m,2),h=f[0],g=f[1],P=(0,r.useCallback)(function(y,c){g(function(L){var S=u()(L.components);if(c){var C=N(S,c);C&&(C.children=C.children||[],C.children.push(d()(d()({},y),{},{parentId:c})))}else S.push(y);var A=L.history.slice(0,L.historyIndex+1);return A.push(S),d()(d()({},L),{},{components:S,history:A,historyIndex:A.length-1})})},[]),b=(0,r.useCallback)(function(y){g(function(c){var L=q(u()(c.components),y),S=c.history.slice(0,c.historyIndex+1);return S.push(L),d()(d()({},c),{},{components:L,selectedComponentId:c.selectedComponentId===y?null:c.selectedComponentId,history:S,historyIndex:S.length-1})})},[]),G=(0,r.useCallback)(function(y,c){g(function(L){var S=rn(u()(L.components),y,c),C=L.history.slice(0,L.historyIndex+1);return C.push(S),d()(d()({},L),{},{components:S,history:C,historyIndex:C.length-1})})},[]),D=(0,r.useCallback)(function(y){g(function(c){return d()(d()({},c),{},{selectedComponentId:y})})},[]),$=(0,r.useCallback)(function(){g(function(y){if(y.historyIndex>0){var c=y.historyIndex-1;return d()(d()({},y),{},{components:y.history[c],historyIndex:c})}return y})},[]),z=(0,r.useCallback)(function(){g(function(y){if(y.historyIndex<y.history.length-1){var c=y.historyIndex+1;return d()(d()({},y),{},{components:y.history[c],historyIndex:c})}return y})},[]),F=(0,r.useCallback)(function(){g(function(y){return d()(d()({},y),{},{mode:y.mode==="design"?"preview":"design"})})},[]);return d()(d()({},h),{},{addComponent:P,removeComponent:b,updateComponent:G,selectComponent:D,undo:$,redo:z,toggleMode:F,canUndo:h.historyIndex>0,canRedo:h.historyIndex<h.history.length-1})}function N(i,m){var f=W()(i),h;try{for(f.s();!(h=f.n()).done;){var g=h.value;if(g.id===m)return g;if(g.children){var P=N(g.children,m);if(P)return P}}}catch(b){f.e(b)}finally{f.f()}return null}function q(i,m){return i.filter(function(f){return f.id===m?!1:(f.children&&(f.children=q(f.children,m)),!0)})}function rn(i,m,f){return i.map(function(h){return h.id===m?d()(d()({},h),f):h.children?d()(d()({},h),{},{children:rn(h.children,m,f)}):h})}function Z(i){var m=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};if(typeof i!="function")throw new Error("useAsync: asyncFunction must be a function");var f=m.immediate,h=f===void 0?!1:f,g=m.onSuccess,P=m.onError,b=m.retryCount,G=b===void 0?0:b,D=m.retryDelay,$=D===void 0?1e3:D,z=(0,r.useState)(null),F=a()(z,2),y=F[0],c=F[1],L=(0,r.useState)(!1),S=a()(L,2),C=S[0],A=S[1],j=(0,r.useState)(null),hn=a()(j,2),k=hn[0],on=hn[1],pn=(0,r.useRef)(),en=(0,r.useRef)(),_=(0,r.useRef)(0),an=(0,r.useRef)(!0);(0,r.useEffect)(function(){return an.current=!0,function(){var Q;an.current=!1,(Q=pn.current)===null||Q===void 0||Q.call(pn)}},[]);var yn=(0,r.useCallback)(function(Q){return new Promise(function(cn,bn){var H=setTimeout(cn,Q),sn=pn.current;pn.current=function(){clearTimeout(H),sn==null||sn(),bn(new Error("Operation cancelled"))}})},[]),fn=(0,r.useCallback)(un()(K()().mark(function Q(){var cn,bn,H,sn,Pn,Dn=arguments;return K()().wrap(function(Cn){for(;;)switch(Cn.prev=Cn.next){case 0:for(cn=Dn.length,bn=new Array(cn),H=0;H<cn;H++)bn[H]=Dn[H];if(an.current){Cn.next=3;break}return Cn.abrupt("return");case 3:return en.current=bn,_.current=0,A(!0),on(null),sn=!1,pn.current=function(){sn=!0},Pn=function(){var $n=un()(K()().mark(function zn(){var wn,An,kn,On;return K()().wrap(function(T){for(;;)switch(T.prev=T.next){case 0:wn=0,An=G+1;case 2:if(!(wn<An)){T.next=44;break}if(T.prev=3,!(sn||!an.current)){T.next=6;break}return T.abrupt("return");case 6:return T.next=8,i.apply(void 0,bn);case 8:if(kn=T.sent,!(sn||!an.current)){T.next=11;break}return T.abrupt("return");case 11:return c(kn),A(!1),g==null||g(kn),T.abrupt("return");case 17:if(T.prev=17,T.t0=T.catch(3),!(sn||!an.current)){T.next=21;break}return T.abrupt("return");case 21:if(On=T.t0 instanceof Error?T.t0:new Error("Unknown error"),wn++,!(wn<An)){T.next=38;break}if(T.prev=24,!(sn||!an.current)){T.next=27;break}return T.abrupt("return");case 27:return T.next=29,yn($);case 29:if(!(sn||!an.current)){T.next=31;break}return T.abrupt("return");case 31:T.next=36;break;case 33:return T.prev=33,T.t1=T.catch(24),T.abrupt("return");case 36:T.next=42;break;case 38:return on(On.message),A(!1),P==null||P(On),T.abrupt("return");case 42:T.next=2;break;case 44:case"end":return T.stop()}},zn,null,[[3,17],[24,33]])}));return function(){return $n.apply(this,arguments)}}(),Cn.next=12,Pn();case 12:case"end":return Cn.stop()}},Q)})),[i,g,P,G,$,yn]),Rn=(0,r.useCallback)(function(){var Q;c(null),on(null),A(!1),(Q=pn.current)===null||Q===void 0||Q.call(pn),_.current=0},[]),xn=(0,r.useCallback)(function(){var Q;(Q=pn.current)===null||Q===void 0||Q.call(pn),A(!1)},[]),In=(0,r.useCallback)(function(){en.current&&fn.apply(void 0,u()(en.current))},[fn]);return(0,r.useEffect)(function(){h&&fn()},[fn,h]),{data:y,loading:C,error:k,execute:fn,reset:Rn,cancel:xn,retry:In}}function ln(){var i=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},m=(0,r.useState)(typeof window!="undefined"?navigator.onLine:!0),f=a()(m,2),h=f[0],g=f[1],P=(0,r.useCallback)(un()(K()().mark(function G(){var D;return K()().wrap(function(z){for(;;)switch(z.prev=z.next){case 0:if(typeof window!="undefined"){z.next=2;break}return z.abrupt("return",!0);case 2:return z.prev=2,z.next=5,fetch("/ping",{method:"HEAD",cache:"no-cache",signal:AbortSignal.timeout(5e3)});case 5:return D=z.sent,z.abrupt("return",D.ok);case 9:return z.prev=9,z.t0=z.catch(2),z.abrupt("return",!1);case 12:case"end":return z.stop()}},G,null,[[2,9]])})),[]),b=(0,r.useCallback)(function(){typeof window!="undefined"&&P().then(function(G){if(g(G),G){var D;(D=i.onOnline)===null||D===void 0||D.call(i)}else{var $;($=i.onOffline)===null||$===void 0||$.call(i)}})},[P,i]);return(0,r.useEffect)(function(){if(typeof window!="undefined"){var G=function(){var F;g(!0),(F=i.onOnline)===null||F===void 0||F.call(i)},D=function(){var F;g(!1),(F=i.onOffline)===null||F===void 0||F.call(i)};window.addEventListener("online",G),window.addEventListener("offline",D);var $=setInterval(function(){P().then(function(z){g(z)})},3e4);return function(){window.removeEventListener("online",G),window.removeEventListener("offline",D),clearInterval($)}}},[P,i]),{isOnline:h,reconnect:b,checkConnectivity:P}}var Tn=n(10154),gn=n.n(Tn),Mn=n(89957),Ln=n.n(Mn);function En(i){if(!i.initialValues||Ln()(i.initialValues)!=="object")throw new Error("useForm: initialValues is required and must be an object");var m=i.initialValues,f=i.validate,h=i.fieldValidators,g=i.onSubmit,P=i.validateMode,b=P===void 0?"onSubmit":P,G=i.reValidateMode,D=G===void 0?"onChange":G,$=i.focusFirstError,z=$===void 0?!0:$,F=(0,r.useState)(m),y=a()(F,2),c=y[0],L=y[1],S=(0,r.useState)({}),C=a()(S,2),A=C[0],j=C[1],hn=(0,r.useState)({}),k=a()(hn,2),on=k[0],pn=k[1],en=(0,r.useState)(!1),_=a()(en,2),an=_[0],yn=_[1],fn=(0,r.useState)(!1),Rn=a()(fn,2),xn=Rn[0],In=Rn[1],Q=(0,r.useRef)(m),cn=(0,r.useRef)(null),bn=Object.keys(c).some(function(B){return c[B]!==Q.current[B]}),H=Object.keys(A).length===0,sn=(0,r.useCallback)(function(){var B=un()(K()().mark(function O(Y){var tn,mn,Sn;return K()().wrap(function(vn){for(;;)switch(vn.prev=vn.next){case 0:return mn=h==null?void 0:h[Y],mn&&(tn=mn(c[Y],c)),!tn&&f&&(Sn=f(c),tn=Sn[Y]),vn.abrupt("return",tn);case 4:case"end":return vn.stop()}},O)}));return function(O){return B.apply(this,arguments)}}(),[c,f,h]),Pn=(0,r.useCallback)(un()(K()().mark(function B(){var O,Y,tn,mn,Sn,X,vn,Bn;return K()().wrap(function(Un){for(;;)switch(Un.prev=Un.next){case 0:if(O={},f&&(Y=f(c),Object.assign(O,Y)),h)for(tn=0,mn=Object.entries(h);tn<mn.length;tn++)Sn=a()(mn[tn],2),X=Sn[0],vn=Sn[1],vn&&(Bn=vn(c[X],c),Bn&&(O[X]=Bn));return Un.abrupt("return",O);case 4:case"end":return Un.stop()}},B)})),[c,f,h]),Dn=(0,r.useCallback)(function(B,O){L(function(Y){return d()(d()({},Y),{},gn()({},B,O))}),xn&&(b==="onChange"||D==="onChange")&&sn(B).then(function(Y){j(function(tn){return d()(d()({},tn),{},gn()({},B,Y))})})},[sn,b,D,xn]),Fn=(0,r.useCallback)(function(B){L(function(O){return d()(d()({},O),B)})},[]),Cn=(0,r.useCallback)(function(B,O){j(function(Y){return d()(d()({},Y),{},gn()({},B,O))})},[]),$n=(0,r.useCallback)(function(B){j(B)},[]),zn=(0,r.useCallback)(function(){j({})},[]),wn=(0,r.useCallback)(function(B){var O=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!0;pn(function(Y){return d()(d()({},Y),{},gn()({},B,O))})},[]),An=(0,r.useCallback)(function(B){var O=B.target,Y=O.name,tn=O.value,mn=O.type,Sn=mn==="checkbox"?B.target.checked:tn;Dn(Y,Sn)},[Dn]),kn=(0,r.useCallback)(function(B){var O=B.target.name;wn(O,!0),(b==="onBlur"||xn&&D==="onBlur")&&sn(O).then(function(Y){j(function(tn){return d()(d()({},tn),{},gn()({},O,Y))})})},[wn,sn,b,D,xn]),On=(0,r.useCallback)(function(){if(!(!z||!cn.current)){var B=Object.keys(A)[0];if(B){var O=cn.current.querySelector('[name="'.concat(B,'"]'));O==null||O.focus()}}},[A,z]),Wn=(0,r.useCallback)(function(){var B=un()(K()().mark(function O(Y){var tn,mn;return K()().wrap(function(X){for(;;)switch(X.prev=X.next){case 0:return Y==null||Y.preventDefault(),In(!0),X.next=4,Pn();case 4:if(tn=X.sent,j(tn),mn=Object.keys(c).reduce(function(vn,Bn){return vn[Bn]=!0,vn},{}),pn(mn),Object.keys(tn).length!==0){X.next=24;break}if(!g){X.next=22;break}return yn(!0),X.prev=11,X.next=14,g(c);case 14:X.next=19;break;case 16:X.prev=16,X.t0=X.catch(11),console.error("Form submission error:",X.t0);case 19:return X.prev=19,yn(!1),X.finish(19);case 22:X.next=25;break;case 24:setTimeout(On,0);case 25:case"end":return X.stop()}},O,null,[[11,16,19,22]])}));return function(O){return B.apply(this,arguments)}}(),[c,Pn,g,On]),T=(0,r.useCallback)(function(){L(m),j({}),pn({}),yn(!1),In(!1)},[m]),Kn=(0,r.useCallback)(function(B){var O;return{name:String(B),value:(O=c[B])!==null&&O!==void 0?O:"",onChange:An,onBlur:kn,error:A[B],touched:on[B]}},[c,An,kn,A,on]);return(0,r.useEffect)(function(){m!==Q.current&&(Q.current=m,L(m))},[m]),{values:c,errors:A,touched:on,isSubmitting:an,isValid:H,isDirty:bn,isValidated:xn,setFieldValue:Dn,setValues:Fn,setFieldError:Cn,setErrors:$n,clearErrors:zn,setFieldTouched:wn,handleChange:An,handleBlur:kn,handleSubmit:Wn,validateField:sn,validateForm:Pn,reset:T,getFieldProps:Kn}}function Vn(i,m){var f=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{},h=f.serializer,g=h===void 0?{read:JSON.parse,write:JSON.stringify}:h,P=f.syncAcrossTabs,b=P===void 0?!0:P,G=f.onError,D=G===void 0?console.error:G,$=(0,r.useCallback)(function(){if(typeof window=="undefined")return m;try{var C=window.localStorage.getItem(i);return C?g.read(C):m}catch(A){return D(A),m}},[m,i,g,D]),z=(0,r.useState)($),F=a()(z,2),y=F[0],c=F[1],L=(0,r.useCallback)(function(C){if(typeof window!="undefined")try{var A=C instanceof Function?C(y):C;window.localStorage.setItem(i,g.write(A)),c(A),b&&window.dispatchEvent(new StorageEvent("storage",{key:i,newValue:g.write(A),oldValue:window.localStorage.getItem(i)}))}catch(j){D(j)}},[i,g,y,b,D]),S=(0,r.useCallback)(function(){if(typeof window!="undefined")try{window.localStorage.removeItem(i),c(m),b&&window.dispatchEvent(new StorageEvent("storage",{key:i,newValue:null,oldValue:window.localStorage.getItem(i)}))}catch(C){D(C)}},[i,m,b,D]);return(0,r.useEffect)(function(){if(!(!b||typeof window=="undefined")){var C=function(j){if(j.key===i)try{j.newValue===null?c(m):c(g.read(j.newValue))}catch(hn){D(hn)}};return window.addEventListener("storage",C),function(){return window.removeEventListener("storage",C)}}},[i,m,g,b,D]),(0,r.useEffect)(function(){c($())},[$]),[y,L,S]}function Nn(){var i=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},m=i.debounceMs,f=m===void 0?100:m,h=i.initialWidth,g=h===void 0?1024:h,P=i.initialHeight,b=P===void 0?768:P,G=(0,r.useState)(function(){return typeof window=="undefined"?{width:g,height:b}:{width:window.innerWidth,height:window.innerHeight}}),D=a()(G,2),$=D[0],z=D[1];return(0,r.useEffect)(function(){if(typeof window!="undefined"){var F,y=function(){clearTimeout(F),F=setTimeout(function(){z({width:window.innerWidth,height:window.innerHeight})},f)};return window.addEventListener("resize",y),y(),function(){window.removeEventListener("resize",y),clearTimeout(F)}}},[f]),$}function jn(){var i=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},m=i.baseURL,f=m===void 0?"":m,h=i.headers,g=h===void 0?{}:h,P=i.transform,b=P===void 0?function(en){return en}:P,G=i.onSuccess,D=i.onError,$=(0,r.useRef)(null),z=(0,r.useCallback)(function(){var en=un()(K()().mark(function _(an){var yn,fn,Rn,xn,In,Q,cn=arguments;return K()().wrap(function(H){for(;;)switch(H.prev=H.next){case 0:return yn=cn.length>1&&cn[1]!==void 0?cn[1]:{},$.current&&$.current.abort(),fn=new AbortController,$.current=fn,Rn=f?"".concat(f).concat(an):an,xn=d()(d()({},yn),{},{signal:fn.signal,headers:d()(d()({"Content-Type":"application/json"},g),yn.headers)}),H.prev=6,H.next=9,fetch(Rn,xn);case 9:if(In=H.sent,In.ok){H.next=12;break}throw new Error("HTTP error! status: ".concat(In.status));case 12:return H.next=14,In.json();case 14:return Q=H.sent,H.abrupt("return",b(Q));case 18:if(H.prev=18,H.t0=H.catch(6),!(H.t0 instanceof Error&&H.t0.name==="AbortError")){H.next=22;break}throw new Error("Request was cancelled");case 22:throw H.t0;case 23:case"end":return H.stop()}},_,null,[[6,18]])}));return function(_){return en.apply(this,arguments)}}(),[f,g,b]),F=Z(z,{onSuccess:G,onError:D}),y=F.data,c=F.loading,L=F.error,S=F.execute,C=F.reset,A=(0,r.useCallback)(function(en,_){return S(en,_)},[S]),j=(0,r.useCallback)(function(en,_){return S(en,d()(d()({},_),{},{method:"GET"}))},[S]),hn=(0,r.useCallback)(function(en,_,an){return S(en,d()(d()({},an),{},{method:"POST",body:_?JSON.stringify(_):void 0}))},[S]),k=(0,r.useCallback)(function(en,_,an){return S(en,d()(d()({},an),{},{method:"PUT",body:_?JSON.stringify(_):void 0}))},[S]),on=(0,r.useCallback)(function(en,_){return S(en,d()(d()({},_),{},{method:"DELETE"}))},[S]),pn=(0,r.useCallback)(function(){$.current&&($.current.abort(),$.current=null),C()},[C]);return{data:y,loading:c,error:L,request:A,get:j,post:hn,put:k,delete:on,reset:pn}}var Hn="1.0.0"},69459:function(dn,I,n){n.r(I),n.d(I,{texts:function(){return v}});const v=[{value:"\u5728\u8FD9\u91CC\u60A8\u53EF\u4EE5\u76F4\u63A5\u4F53\u9A8C\u548C\u6D4B\u8BD5\u6211\u4EEC\u7684 hooks\uFF01",paraId:0,tocIndex:0},{value:"\u8FD9\u4E9B\u793A\u4F8B\u5C55\u793A\u4E86\u5982\u4F55\u5728 Dumi \u4E2D\u521B\u5EFA\u771F\u6B63\u53EF\u4EA4\u4E92\u7684\u7EC4\u4EF6\uFF1A",paraId:1,tocIndex:11},{value:"\u5173\u952E\u8981\u7D20",paraId:2},{value:"\u72EC\u7ACB\u7684\u793A\u4F8B\u6587\u4EF6",paraId:3,tocIndex:12},{value:" - \u6BCF\u4E2A\u793A\u4F8B\u90FD\u662F\u5B8C\u6574\u7684\u7EC4\u4EF6",paraId:3,tocIndex:12},{value:"Mock \u6570\u636E\u548C\u51FD\u6570",paraId:3,tocIndex:12},{value:" - \u4E0D\u4F9D\u8D56\u5916\u90E8 API",paraId:3,tocIndex:12},{value:"\u5B8C\u6574\u7684\u72B6\u6001\u7BA1\u7406",paraId:3,tocIndex:12},{value:" - \u7EC4\u4EF6\u5185\u90E8\u5904\u7406\u6240\u6709\u72B6\u6001",paraId:3,tocIndex:12},{value:"\u9519\u8BEF\u5904\u7406",paraId:3,tocIndex:12},{value:" - \u6A21\u62DF\u771F\u5B9E\u573A\u666F\u7684\u9519\u8BEF\u60C5\u51B5",paraId:3,tocIndex:12},{value:"\u6700\u4F73\u5B9E\u8DF5",paraId:2},{value:"\u4F7F\u7528 ",paraId:4,tocIndex:13},{value:"export default",paraId:4,tocIndex:13},{value:" \u5BFC\u51FA\u7EC4\u4EF6",paraId:4,tocIndex:13},{value:"\u63D0\u4F9B\u6E05\u6670\u7684\u72B6\u6001\u53CD\u9988",paraId:4,tocIndex:13},{value:"\u6DFB\u52A0\u8BF4\u660E\u63D0\u793A",paraId:4,tocIndex:13},{value:"\u6A21\u62DF\u771F\u5B9E\u7684\u4F7F\u7528\u573A\u666F",paraId:4,tocIndex:13}]},68026:function(dn,I,n){n.r(I),n.d(I,{texts:function(){return v}});const v=[{value:"\u6B22\u8FCE\u4F7F\u7528 AI-Code Hooks\uFF01\u8FD9\u662F\u4E00\u4E2A\u529F\u80FD\u5F3A\u5927\u7684 React Hooks \u5E93\uFF0C\u4E13\u4E3A\u73B0\u4EE3 Web \u5F00\u53D1\u800C\u8BBE\u8BA1\u3002",paraId:0,tocIndex:0},{value:`# \u4F7F\u7528 npm
npm install @corn12138/hooks

# \u4F7F\u7528 yarn
yarn add @corn12138/hooks

# \u4F7F\u7528 pnpm
pnpm add @corn12138/hooks
`,paraId:1,tocIndex:1},{value:`import { useAuth, useDebounce, useAsync } from '@corn12138/hooks';
`,paraId:2,tocIndex:3},{value:`import * as Hooks from '@corn12138/hooks';
`,paraId:3,tocIndex:4},{value:"\u6240\u6709 Hooks \u90FD\u63D0\u4F9B\u5B8C\u6574\u7684 TypeScript \u7C7B\u578B\u5B9A\u4E49\uFF1A",paraId:4,tocIndex:9},{value:`import { useAuth, User } from '@corn12138/hooks';

interface MyUser extends User {
  role: 'admin' | 'user';
}

function TypedComponent() {
  const { user } = useAuth<MyUser>();
  
  return (
    <div>
      {user && <span>\u89D2\u8272: {user.role}</span>}
    </div>
  );
}
`,paraId:5,tocIndex:9},{value:"\u2705 ",paraId:6,tocIndex:10},{value:"\u96F6\u4F9D\u8D56",paraId:6,tocIndex:10},{value:"\uFF1A\u9664\u4E86 React\uFF0C\u65E0\u5176\u4ED6\u4F9D\u8D56",paraId:6,tocIndex:10},{value:"\u2705 ",paraId:6,tocIndex:10},{value:"TypeScript",paraId:6,tocIndex:10},{value:"\uFF1A\u5B8C\u6574\u7684\u7C7B\u578B\u652F\u6301",paraId:6,tocIndex:10},{value:"\u2705 ",paraId:6,tocIndex:10},{value:"Tree-shaking",paraId:6,tocIndex:10},{value:"\uFF1A\u652F\u6301\u6309\u9700\u5F15\u5165",paraId:6,tocIndex:10},{value:"\u2705 ",paraId:6,tocIndex:10},{value:"SSR \u53CB\u597D",paraId:6,tocIndex:10},{value:"\uFF1A\u652F\u6301\u670D\u52A1\u7AEF\u6E32\u67D3",paraId:6,tocIndex:10},{value:"\u2705 ",paraId:6,tocIndex:10},{value:"\u6D4B\u8BD5\u8986\u76D6",paraId:6,tocIndex:10},{value:"\uFF1A90%+ \u6D4B\u8BD5\u8986\u76D6\u7387",paraId:6,tocIndex:10},{value:"\u2705 ",paraId:6,tocIndex:10},{value:"\u4F53\u79EF\u5C0F\u5DE7",paraId:6,tocIndex:10},{value:"\uFF1Agzip \u540E\u4EC5 ~5KB",paraId:6,tocIndex:10},{value:"\u67E5\u770B ",paraId:7,tocIndex:11},{value:"\u4EA4\u4E92\u793A\u4F8B",paraId:8,tocIndex:11},{value:" \u9875\u9762\u83B7\u53D6\u66F4\u591A\u5B9E\u9645\u4F7F\u7528\u6848\u4F8B\u3002",paraId:7,tocIndex:11},{value:"\u5982\u679C\u60A8\u5728\u4F7F\u7528\u8FC7\u7A0B\u4E2D\u9047\u5230\u95EE\u9898\uFF0C\u8BF7\u901A\u8FC7\u4EE5\u4E0B\u65B9\u5F0F\u53CD\u9988\uFF1A",paraId:9,tocIndex:12},{value:"GitHub Issues",paraId:10,tocIndex:12},{value:"GitHub Discussions",paraId:10,tocIndex:12},{value:"\u6B22\u8FCE\u8D21\u732E\u4EE3\u7801\uFF01\u8BF7\u67E5\u770B ",paraId:11,tocIndex:13},{value:"\u8D21\u732E\u6307\u5357",paraId:11,tocIndex:13},{value:" \u4E86\u89E3\u8BE6\u7EC6\u4FE1\u606F\u3002",paraId:11,tocIndex:13},{value:"MIT License - \u8BE6\u89C1 ",paraId:12,tocIndex:14},{value:"LICENSE",paraId:12,tocIndex:14},{value:" \u6587\u4EF6\u3002",paraId:12,tocIndex:14}]},35821:function(dn,I,n){n.r(I),n.d(I,{texts:function(){return v}});const v=[{value:"\u4E13\u4E1A\u7EA7\u89E3\u51B3\u65B9\u6848",paraId:0},{value:"\u4E0D\u53EA\u662F\u7B80\u5355\u7684 hooks \u96C6\u5408\uFF0C\u800C\u662F\u7ECF\u8FC7\u5B9E\u6218\u9A8C\u8BC1\u7684\u5B8C\u6574\u89E3\u51B3\u65B9\u6848\u3002\u6BCF\u4E2A hook \u90FD\u7ECF\u8FC7\u7CBE\u5FC3\u8BBE\u8BA1\uFF0C\u652F\u6301\u590D\u6742\u7684\u4E1A\u52A1\u573A\u666F\u3002",paraId:1,tocIndex:1},{value:"\u5F00\u7BB1\u5373\u7528",paraId:0},{value:"\u96F6\u914D\u7F6E\u5F00\u59CB\uFF0C30\u79D2\u5185\u96C6\u6210\u5230\u60A8\u7684\u9879\u76EE\u4E2D\uFF1A",paraId:2,tocIndex:2},{value:`# \u5B89\u88C5
npm install @ai-code/hooks

# \u7ACB\u5373\u4F7F\u7528
import { useAuth } from '@ai-code/hooks';
`,paraId:3,tocIndex:2},{value:"\u9AD8\u6027\u80FD & \u7C7B\u578B\u5B89\u5168",paraId:0},{value:"\u5B8C\u6574\u7684 TypeScript \u652F\u6301",paraId:4,tocIndex:3},{value:" - \u63D0\u4F9B\u7CBE\u786E\u7684\u7C7B\u578B\u5B9A\u4E49\u548C\u667A\u80FD\u63D0\u793A",paraId:4,tocIndex:3},{value:"\u6027\u80FD\u4F18\u5316",paraId:4,tocIndex:3},{value:" - \u5185\u7F6E\u9632\u6296\u3001\u7F13\u5B58\u3001\u53D6\u6D88\u673A\u5236\uFF0C\u786E\u4FDD\u5E94\u7528\u6D41\u7545\u8FD0\u884C",paraId:4,tocIndex:3},{value:"SSR \u53CB\u597D",paraId:4,tocIndex:3},{value:" - \u5B8C\u7F8E\u652F\u6301 Next.js\u3001Nuxt.js \u7B49\u670D\u52A1\u7AEF\u6E32\u67D3\u6846\u67B6",paraId:4,tocIndex:3},{value:`
  `,paraId:5,tocIndex:4},{value:`
    `,paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"Hook",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u529F\u80FD\u63CF\u8FF0",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u4E3B\u8981\u7279\u6027",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u4F7F\u7528\u573A\u666F",paraId:5,tocIndex:4},{value:`
    `,paraId:5,tocIndex:4},{value:`
  `,paraId:5,tocIndex:4},{value:`
  `,paraId:5,tocIndex:4},{value:`
    `,paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u{1F510} useAuth",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u7528\u6237\u8BA4\u8BC1\u7BA1\u7406",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u767B\u5F55\u3001\u6CE8\u518C\u3001\u6743\u9650\u3001\u4F1A\u8BDD",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u7528\u6237\u7CFB\u7EDF\u3001\u6743\u9650\u63A7\u5236",paraId:5,tocIndex:4},{value:`
    `,paraId:5,tocIndex:4},{value:`
    `,paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u26A1 useAsync",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u5F02\u6B65\u64CD\u4F5C\u7BA1\u7406",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u91CD\u8BD5\u3001\u53D6\u6D88\u3001\u9519\u8BEF\u5904\u7406",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"API\u8C03\u7528\u3001\u6570\u636E\u52A0\u8F7D",paraId:5,tocIndex:4},{value:`
    `,paraId:5,tocIndex:4},{value:`
    `,paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u{1F4DD} useForm",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u8868\u5355\u72B6\u6001\u7BA1\u7406",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u9A8C\u8BC1\u3001\u63D0\u4EA4\u3001\u5B57\u6BB5\u7BA1\u7406",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u8868\u5355\u5F00\u53D1\u3001\u6570\u636E\u6536\u96C6",paraId:5,tocIndex:4},{value:`
    `,paraId:5,tocIndex:4},{value:`
    `,paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u{1F310} useNetworkStatus",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u7F51\u7EDC\u72B6\u6001\u76D1\u63A7",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u79BB\u7EBF\u68C0\u6D4B\u3001\u81EA\u52A8\u91CD\u8FDE",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u7F51\u7EDC\u72B6\u6001\u663E\u793A\u3001\u79BB\u7EBF\u5904\u7406",paraId:5,tocIndex:4},{value:`
    `,paraId:5,tocIndex:4},{value:`
    `,paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u{1F4BE} useLocalStorage",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u672C\u5730\u5B58\u50A8\u7BA1\u7406",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u7C7B\u578B\u5B89\u5168\u3001\u8DE8\u6807\u7B7E\u9875\u540C\u6B65",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u7528\u6237\u8BBE\u7F6E\u3001\u6570\u636E\u6301\u4E45\u5316",paraId:5,tocIndex:4},{value:`
    `,paraId:5,tocIndex:4},{value:`
    `,paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u{1F4D0} useWindowSize",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u7A97\u53E3\u5C3A\u5BF8\u76D1\u542C",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u9632\u6296\u4F18\u5316\u3001\u65AD\u70B9\u7BA1\u7406",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u54CD\u5E94\u5F0F\u8BBE\u8BA1\u3001\u52A8\u6001\u5E03\u5C40",paraId:5,tocIndex:4},{value:`
    `,paraId:5,tocIndex:4},{value:`
    `,paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u{1F680} useApi",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"API\u8BF7\u6C42\u7BA1\u7406",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"RESTful\u3001\u62E6\u622A\u5668\u3001\u7F13\u5B58",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u6570\u636E\u83B7\u53D6\u3001\u63A5\u53E3\u8C03\u7528",paraId:5,tocIndex:4},{value:`
    `,paraId:5,tocIndex:4},{value:`
    `,paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u{1F3A8} useEditor",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u7F16\u8F91\u5668\u72B6\u6001\u7BA1\u7406",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u7EC4\u4EF6\u64CD\u4F5C\u3001\u5386\u53F2\u8BB0\u5F55",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u4F4E\u4EE3\u7801\u5E73\u53F0\u3001\u53EF\u89C6\u5316\u7F16\u8F91",paraId:5,tocIndex:4},{value:`
    `,paraId:5,tocIndex:4},{value:`
    `,paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u{1F527} useDebounce",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u9632\u6296\u5904\u7406",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u6027\u80FD\u4F18\u5316\u3001\u5EF6\u8FDF\u6267\u884C",paraId:5,tocIndex:4},{value:`
      `,paraId:5,tocIndex:4},{value:"\u641C\u7D22\u8F93\u5165\u3001API\u8C03\u7528\u4F18\u5316",paraId:5,tocIndex:4},{value:`
    `,paraId:5,tocIndex:4},{value:`
  `,paraId:5,tocIndex:4},{value:"\u7528\u6237\u6CE8\u518C\u8868\u5355",paraId:0},{value:`import React from 'react';
import { useForm, useAsync } from '@ai-code/hooks';

const registerAPI = async (userData: { username: string; email: string; password: string }) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) throw new Error('\u6CE8\u518C\u5931\u8D25');
  return response.json();
};

function RegisterForm() {
  const { execute: handleRegister, loading } = useAsync(registerAPI, {
    onSuccess: () => alert('\u6CE8\u518C\u6210\u529F\uFF01'),
    onError: (error) => alert(\`\u6CE8\u518C\u5931\u8D25: \${error.message}\`)
  });

  const form = useForm({
    initialValues: { username: '', email: '', password: '' },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.username?.trim()) errors.username = '\u7528\u6237\u540D\u4E0D\u80FD\u4E3A\u7A7A';
      if (!values.email?.trim()) errors.email = '\u90AE\u7BB1\u4E0D\u80FD\u4E3A\u7A7A';
      else if (!values.email.includes('@')) errors.email = '\u8BF7\u8F93\u5165\u6709\u6548\u90AE\u7BB1';
      if (!values.password?.trim()) errors.password = '\u5BC6\u7801\u4E0D\u80FD\u4E3A\u7A7A';
      else if (values.password.length < 6) errors.password = '\u5BC6\u7801\u81F3\u5C116\u4F4D';
      return errors;
    },
    onSubmit: handleRegister
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <input {...form.getFieldProps('username')} placeholder="\u7528\u6237\u540D" />
      <input {...form.getFieldProps('email')} placeholder="\u90AE\u7BB1" />
      <input {...form.getFieldProps('password')} type="password" placeholder="\u5BC6\u7801" />
      <button type="submit" disabled={loading || !form.isValid}>
        {loading ? '\u6CE8\u518C\u4E2D...' : '\u7ACB\u5373\u6CE8\u518C'}
      </button>
    </form>
  );
}
`,paraId:6,tocIndex:6},{value:"\u667A\u80FD\u641C\u7D22",paraId:0},{value:`import React, { useState } from 'react';
import { useDebounce, useAsync } from '@ai-code/hooks';

const searchAPI = async (query: string) => {
  if (!query.trim()) return [];
  const response = await fetch(\`/api/search?q=\${query}\`);
  return response.json();
};

function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  
  const { data: results, loading, execute } = useAsync(searchAPI, {
    immediate: false
  });

  React.useEffect(() => {
    if (debouncedQuery) {
      execute(debouncedQuery);
    }
  }, [debouncedQuery, execute]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="\u8F93\u5165\u641C\u7D22\u5173\u952E\u8BCD..."
      />
      {loading && <div>\u641C\u7D22\u4E2D...</div>}
      {results?.length > 0 && (
        <ul>
          {results.map((item: any, index: number) => (
            <li key={index}>{item.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
`,paraId:7,tocIndex:7},{value:"\u7F51\u7EDC\u72B6\u6001\u63D0\u793A",paraId:0},{value:`import React from 'react';
import { useNetworkStatus, useLocalStorage } from '@ai-code/hooks';

function NetworkStatusIndicator() {
  const { isOnline, reconnect } = useNetworkStatus();
  const [showNotifications, setShowNotifications] = useLocalStorage('show-network-notifications', true);

  if (!showNotifications) return null;

  return (
    <div className={\`status-bar \${isOnline ? 'online' : 'offline'}\`}>
      <span>{isOnline ? '\u{1F7E2} \u5728\u7EBF' : '\u{1F534} \u79BB\u7EBF'}</span>
      {!isOnline && (
        <button onClick={reconnect}>\u91CD\u65B0\u8FDE\u63A5</button>
      )}
      <button onClick={() => setShowNotifications(false)}>\xD7</button>
    </div>
  );
}
`,paraId:8,tocIndex:8},{value:"\u54CD\u5E94\u5F0F\u5E03\u5C40",paraId:0},{value:`import React from 'react';
import { useWindowSize, useDebounce } from '@ai-code/hooks';

function ResponsiveGrid() {
  const { width } = useWindowSize();
  const debouncedWidth = useDebounce(width, 150);

  const columns = debouncedWidth < 768 ? 1 : debouncedWidth < 1024 ? 2 : 3;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: \`repeat(\${columns}, 1fr)\`,
      gap: '16px'
    }}>
      <div>\u7F51\u683C\u9879\u76EE 1</div>
      <div>\u7F51\u683C\u9879\u76EE 2</div>
      <div>\u7F51\u683C\u9879\u76EE 3</div>
    </div>
  );
}
`,paraId:9,tocIndex:9},{value:"\u4F01\u4E1A\u7EA7\u5E94\u7528",paraId:0},{value:"\u7528\u6237\u7BA1\u7406\u7CFB\u7EDF - \u8BA4\u8BC1\u3001\u6743\u9650\u63A7\u5236",paraId:10,tocIndex:11},{value:"\u6570\u636E\u7BA1\u7406\u5E73\u53F0 - \u8868\u5355\u5904\u7406\u3001API\u96C6\u6210",paraId:10,tocIndex:11},{value:"\u5185\u5BB9\u7BA1\u7406\u7CFB\u7EDF - \u7F16\u8F91\u5668\u3001\u6587\u4EF6\u4E0A\u4F20",paraId:10,tocIndex:11},{value:"\u7535\u5546\u540E\u53F0 - \u5546\u54C1\u7BA1\u7406\u3001\u8BA2\u5355\u5904\u7406",paraId:10,tocIndex:11},{value:"\u5728\u7EBF\u4EA7\u54C1",paraId:0},{value:"SaaS \u5E94\u7528 - \u7528\u6237\u8BA4\u8BC1\u3001\u6570\u636E\u540C\u6B65",paraId:11,tocIndex:12},{value:"\u793E\u4EA4\u5E73\u53F0 - \u5B9E\u65F6\u901A\u8BAF\u3001\u72B6\u6001\u7BA1\u7406",paraId:11,tocIndex:12},{value:"\u535A\u5BA2\u7CFB\u7EDF - \u5185\u5BB9\u7F16\u8F91\u3001\u8BC4\u8BBA\u7CFB\u7EDF",paraId:11,tocIndex:12},{value:"\u5728\u7EBF\u5DE5\u5177 - \u54CD\u5E94\u5F0F\u8BBE\u8BA1\u3001\u79BB\u7EBF\u652F\u6301",paraId:11,tocIndex:12},{value:"\u521B\u610F\u9879\u76EE",paraId:0},{value:"\u4F4E\u4EE3\u7801\u5E73\u53F0 - \u53EF\u89C6\u5316\u7F16\u8F91\u5668",paraId:12,tocIndex:13},{value:"\u8BBE\u8BA1\u5DE5\u5177 - \u7EC4\u4EF6\u7BA1\u7406\u3001\u5386\u53F2\u8BB0\u5F55",paraId:12,tocIndex:13},{value:"\u539F\u578B\u5236\u4F5C - \u4EA4\u4E92\u8BBE\u8BA1\u3001\u72B6\u6001\u7BA1\u7406",paraId:12,tocIndex:13},{value:"\u5B8C\u6574\u6587\u6863",paraId:0},{value:"\u6211\u4EEC\u4E3A\u60A8\u51C6\u5907\u4E86\u8BE6\u7EC6\u7684\u6587\u6863\u548C\u793A\u4F8B\uFF1A",paraId:13,tocIndex:15},{value:"\u{1F4D6} ",paraId:14,tocIndex:15},{value:"\u5FEB\u901F\u5F00\u59CB\u6307\u5357",paraId:15,tocIndex:15},{value:" - 5\u5206\u949F\u4E0A\u624B\u6307\u5357",paraId:14,tocIndex:15},{value:"\u{1F527} ",paraId:14,tocIndex:15},{value:"API \u6587\u6863",paraId:16,tocIndex:15},{value:" - \u5B8C\u6574\u7684 API \u53C2\u8003",paraId:14,tocIndex:15},{value:"\u{1F4A1} ",paraId:14,tocIndex:15},{value:"\u6700\u4F73\u5B9E\u8DF5",paraId:17,tocIndex:15},{value:" - \u6027\u80FD\u4F18\u5316\u5EFA\u8BAE",paraId:14,tocIndex:15},{value:"\u{1F3AE} ",paraId:14,tocIndex:15},{value:"\u5728\u7EBF\u793A\u4F8B",paraId:18,tocIndex:15},{value:" - \u4EA4\u4E92\u5F0F\u4EE3\u7801\u793A\u4F8B",paraId:14,tocIndex:15},{value:"\u4EA4\u4E92\u5F0F\u793A\u4F8B",paraId:0},{value:"\u{1F510} \u8BA4\u8BC1\u7CFB\u7EDF - \u5B8C\u6574\u7684\u7528\u6237\u8BA4\u8BC1\u6D41\u7A0B",paraId:19,tocIndex:16},{value:"\u{1F4DD} \u8868\u5355\u5904\u7406 - \u590D\u6742\u8868\u5355\u9A8C\u8BC1",paraId:19,tocIndex:16},{value:"\u{1F310} \u7F51\u7EDC\u76D1\u63A7 - \u79BB\u7EBF\u72B6\u6001\u5904\u7406",paraId:19,tocIndex:16},{value:"\u{1F3A8} \u7F16\u8F91\u5668 - \u53EF\u89C6\u5316\u7EC4\u4EF6\u7F16\u8F91",paraId:19,tocIndex:16},{value:"\u5F00\u53D1\u5DE5\u5177",paraId:0},{value:"\u{1F50D} \u5728\u7EBF\u8C03\u8BD5\u5668 - \u5B9E\u65F6\u6D4B\u8BD5 hooks",paraId:20,tocIndex:17},{value:"\u{1F4CA} \u6027\u80FD\u5206\u6790 - \u6027\u80FD\u76D1\u63A7\u5DE5\u5177",paraId:20,tocIndex:17},{value:"\u{1F9EA} \u6D4B\u8BD5\u5DE5\u5177 - \u5355\u5143\u6D4B\u8BD5\u6307\u5357",paraId:20,tocIndex:17},{value:"\u751F\u4EA7\u5C31\u7EEA",paraId:0},{value:"\u{1F4C8} ",paraId:21,tocIndex:19},{value:"95%+ \u6D4B\u8BD5\u8986\u76D6\u7387",paraId:21,tocIndex:19},{value:" - \u786E\u4FDD\u4EE3\u7801\u8D28\u91CF",paraId:21,tocIndex:19},{value:"\u{1F512} ",paraId:21,tocIndex:19},{value:"\u7C7B\u578B\u5B89\u5168",paraId:21,tocIndex:19},{value:" - \u5B8C\u6574\u7684 TypeScript \u652F\u6301",paraId:21,tocIndex:19},{value:"\u26A1 ",paraId:21,tocIndex:19},{value:"\u9AD8\u6027\u80FD",paraId:21,tocIndex:19},{value:" - \u7ECF\u8FC7\u6027\u80FD\u4F18\u5316\u548C\u57FA\u51C6\u6D4B\u8BD5",paraId:21,tocIndex:19},{value:"\u{1F30D} ",paraId:21,tocIndex:19},{value:"\u56FD\u9645\u5316",paraId:21,tocIndex:19},{value:" - \u652F\u6301\u591A\u8BED\u8A00\u73AF\u5883",paraId:21,tocIndex:19},{value:"\u793E\u533A\u9A71\u52A8",paraId:0},{value:"\u{1F4AC} ",paraId:22,tocIndex:20},{value:"\u6D3B\u8DC3\u793E\u533A",paraId:22,tocIndex:20},{value:" - \u53CA\u65F6\u7684\u95EE\u9898\u54CD\u5E94\u548C\u529F\u80FD\u8BA8\u8BBA",paraId:22,tocIndex:20},{value:"\u{1F504} ",paraId:22,tocIndex:20},{value:"\u6301\u7EED\u66F4\u65B0",paraId:22,tocIndex:20},{value:" - \u5B9A\u671F\u53D1\u5E03\u65B0\u529F\u80FD\u548C\u6539\u8FDB",paraId:22,tocIndex:20},{value:"\u{1F4D6} ",paraId:22,tocIndex:20},{value:"\u4E30\u5BCC\u6587\u6863",paraId:22,tocIndex:20},{value:" - \u8BE6\u7EC6\u7684\u4F7F\u7528\u6307\u5357\u548C\u793A\u4F8B",paraId:22,tocIndex:20},{value:"\u{1F393} ",paraId:22,tocIndex:20},{value:"\u5B66\u4E60\u53CB\u597D",paraId:22,tocIndex:20},{value:" - \u4ECE\u5165\u95E8\u5230\u7CBE\u901A\u7684\u5B8C\u6574\u5B66\u4E60\u8DEF\u5F84",paraId:22,tocIndex:20},{value:`# \u4F7F\u7528 npm
npm install @ai-code/hooks

# \u4F7F\u7528 yarn
yarn add @ai-code/hooks

# \u4F7F\u7528 pnpm
pnpm add @ai-code/hooks
`,paraId:23,tocIndex:22},{value:`import React from 'react';
import { useForm, useAsync } from '@ai-code/hooks';

function MyComponent() {
  const { execute: fetchData, loading, data } = useAsync(
    async () => {
      const response = await fetch('/api/data');
      return response.json();
    }
  );
  
  return (
    <div>
      <button onClick={() => fetchData()} disabled={loading}>
        {loading ? '\u52A0\u8F7D\u4E2D...' : '\u83B7\u53D6\u6570\u636E'}
      </button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
`,paraId:24,tocIndex:23},{value:"\u4E0B\u4E00\u6B65",paraId:0},{value:"\u{1F4D6} ",paraId:25,tocIndex:24},{value:"\u9605\u8BFB\u5FEB\u901F\u5F00\u59CB\u6307\u5357",paraId:26,tocIndex:24},{value:"\u{1F3AE} ",paraId:25,tocIndex:24},{value:"\u5C1D\u8BD5\u5728\u7EBF\u793A\u4F8B",paraId:27,tocIndex:24},{value:"\u{1F4AC} ",paraId:25,tocIndex:24},{value:"\u52A0\u5165\u793E\u533A\u8BA8\u8BBA",paraId:25,tocIndex:24},{value:"\u2B50 ",paraId:25,tocIndex:24},{value:"\u7ED9\u9879\u76EE\u70B9\u661F",paraId:25,tocIndex:24},{value:`
  `,paraId:0},{value:`
  `,paraId:0},{value:"\u5DF2\u6709\u6570\u5343\u540D\u5F00\u53D1\u8005\u5728\u4F7F\u7528 @ai-code/hooks \u6784\u5EFA\u4F18\u79C0\u7684\u5E94\u7528",paraId:28,tocIndex:25},{value:"\u{1F3AF} ",paraId:29,tocIndex:25},{value:"\u51C6\u5907\u597D\u4E86\u5417\uFF1F",paraId:29,tocIndex:25},{value:" ",paraId:29,tocIndex:25},{value:"\u7ACB\u5373\u5F00\u59CB",paraId:30,tocIndex:25},{value:" \u60A8\u7684\u5F00\u53D1\u4E4B\u65C5\uFF01",paraId:29,tocIndex:25},{value:" ",paraId:0}]},41907:function(dn,I,n){n.r(I),n.d(I,{texts:function(){return v}});const v=[{value:"\u5982\u679C\u4E3B\u793A\u4F8B\u9875\u9762\u6709\u95EE\u9898\uFF0C\u8FD9\u91CC\u63D0\u4F9B\u4E86\u66F4\u7B80\u5355\u7684\u6F14\u793A\u7248\u672C\u3002",paraId:0,tocIndex:0},{value:'<code src="">',paraId:1},{value:`<code src="./components/YourComponent.tsx"></code>
`,paraId:2,tocIndex:9},{value:"\u5982\u679C\u5BFC\u5165\u5916\u90E8\u5305\u6709\u95EE\u9898\uFF0C\u53EF\u4EE5\u5728\u7EC4\u4EF6\u5185\u90E8\u5B9E\u73B0\u7B80\u5316\u7248\u672C\u7684 hooks\uFF1A",paraId:3,tocIndex:11},{value:`// \u7B80\u5355\u7684\u9632\u6296\u5B9E\u73B0
function useSimpleDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
`,paraId:4,tocIndex:11},{value:"\u81EA\u5305\u542B\u7EC4\u4EF6",paraId:5,tocIndex:13},{value:" - \u7EC4\u4EF6\u5E94\u8BE5\u5305\u542B\u6240\u6709\u5FC5\u9700\u7684\u4F9D\u8D56",paraId:5,tocIndex:13},{value:"\u660E\u786E\u7684\u5BFC\u51FA",paraId:5,tocIndex:13},{value:" - \u4F7F\u7528 ",paraId:5,tocIndex:13},{value:"export default",paraId:5,tocIndex:13},{value:"\u5185\u8054\u6837\u5F0F",paraId:5,tocIndex:13},{value:" - \u907F\u514D\u4F9D\u8D56\u5916\u90E8CSS",paraId:5,tocIndex:13},{value:"\u9519\u8BEF\u5904\u7406",paraId:5,tocIndex:13},{value:" - \u63D0\u4F9B\u53CB\u597D\u7684\u9519\u8BEF\u53CD\u9988",paraId:5,tocIndex:13},{value:"\u6E05\u6670\u7684\u8BF4\u660E",paraId:5,tocIndex:13},{value:" - \u6DFB\u52A0\u4F7F\u7528\u63D0\u793A",paraId:5,tocIndex:13},{value:"\u907F\u514D\u590D\u6742\u4F9D\u8D56",paraId:6,tocIndex:14},{value:" - \u5C3D\u91CF\u4F7F\u7528\u539F\u751F React hooks",paraId:6,tocIndex:14},{value:"\u63D0\u4F9B Mock \u6570\u636E",paraId:6,tocIndex:14},{value:" - \u4E0D\u4F9D\u8D56\u771F\u5B9E API",paraId:6,tocIndex:14},{value:"\u54CD\u5E94\u5F0F\u8BBE\u8BA1",paraId:6,tocIndex:14},{value:" - \u786E\u4FDD\u5728\u4E0D\u540C\u8BBE\u5907\u4E0A\u90FD\u80FD\u6B63\u5E38\u663E\u793A",paraId:6,tocIndex:14},{value:"\u6027\u80FD\u4F18\u5316",paraId:6,tocIndex:14},{value:" - \u4F7F\u7528 useMemo, useCallback \u7B49\u4F18\u5316\u6027\u80FD",paraId:6,tocIndex:14},{value:`docs/
\u251C\u2500\u2500 index.md              # \u9996\u9875
\u251C\u2500\u2500 examples.md           # \u4E3B\u8981\u793A\u4F8B\u9875\u9762
\u251C\u2500\u2500 simple-examples.md    # \u7B80\u5316\u793A\u4F8B\u9875\u9762
\u2514\u2500\u2500 components/           # \u793A\u4F8B\u7EC4\u4EF6\u76EE\u5F55
    \u251C\u2500\u2500 SimpleDemo.tsx    # \u7B80\u5355\u6F14\u793A\u7EC4\u4EF6
    \u251C\u2500\u2500 AsyncDemo.tsx     # \u5F02\u6B65\u64CD\u4F5C\u6F14\u793A
    \u2514\u2500\u2500 FormDemo.tsx      # \u8868\u5355\u6F14\u793A
`,paraId:7,tocIndex:15}]},18842:function(dn,I){I.Z=`import { useCallback, useState } from 'react';

// API\u8BF7\u6C42\u72B6\u6001\u7C7B\u578B
interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

// API\u914D\u7F6E\u7C7B\u578B
interface ApiConfig {
    baseURL?: string;
    timeout?: number;
    headers?: Record<string, string>;
}

// \u8BF7\u6C42\u9009\u9879\u7C7B\u578B
interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
}

// \u7B80\u5316\u7684 useApi \u5B9E\u73B0
function useSimpleApi<T = any>(config: ApiConfig = {}) {
    const [state, setState] = useState<ApiState<T>>({
        data: null,
        loading: false,
        error: null
    });

    // \u6A21\u62DFAPI\u6570\u636E
    const mockData = {
        users: [
            { id: 1, name: '\u5F20\u4E09', email: 'zhangsan@example.com', status: 'active' },
            { id: 2, name: '\u674E\u56DB', email: 'lisi@example.com', status: 'inactive' },
            { id: 3, name: '\u738B\u4E94', email: 'wangwu@example.com', status: 'active' },
        ],
        posts: [
            { id: 1, title: 'React Hooks \u6700\u4F73\u5B9E\u8DF5', author: '\u5F20\u4E09', likes: 42 },
            { id: 2, title: 'TypeScript \u9AD8\u7EA7\u6280\u5DE7', author: '\u674E\u56DB', likes: 38 },
            { id: 3, title: '\u524D\u7AEF\u6027\u80FD\u4F18\u5316\u6307\u5357', author: '\u738B\u4E94', likes: 55 },
        ]
    };

    // \u6A21\u62DF\u7F51\u7EDC\u5EF6\u8FDF
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // \u6A21\u62DFAPI\u8BF7\u6C42
    const request = useCallback(async (url: string, options: RequestOptions = {}) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            // \u6A21\u62DF\u7F51\u7EDC\u5EF6\u8FDF
            await delay(800 + Math.random() * 1200);

            // \u6A21\u62DF\u9519\u8BEF
            if (url.includes('error')) {
                throw new Error('\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF');
            }

            if (url.includes('timeout')) {
                await delay(5000);
                throw new Error('\u8BF7\u6C42\u8D85\u65F6');
            }

            // \u6A21\u62DF\u4E0D\u540CAPI\u7AEF\u70B9
            let responseData: any;

            if (url.includes('users')) {
                responseData = mockData.users;
            } else if (url.includes('posts')) {
                responseData = mockData.posts;
            } else if (url.includes('user/') && options.method === 'PUT') {
                // \u6A21\u62DF\u66F4\u65B0\u7528\u6237
                const userId = parseInt(url.split('/').pop() || '1');
                const updatedUser = {
                    id: userId,
                    ...options.body,
                    email: \`\${options.body.name.toLowerCase()}@example.com\`
                };
                responseData = updatedUser;
            } else if (options.method === 'POST') {
                // \u6A21\u62DF\u521B\u5EFA\u6570\u636E
                responseData = {
                    id: Date.now(),
                    ...options.body,
                    createdAt: new Date().toISOString()
                };
            } else {
                responseData = { message: '\u8BF7\u6C42\u6210\u529F', data: options.body };
            }

            setState({
                data: responseData,
                loading: false,
                error: null
            });

            return responseData;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '\u8BF7\u6C42\u5931\u8D25';
            setState({
                data: null,
                loading: false,
                error: errorMessage
            });
            throw error;
        }
    }, []);

    // GET \u8BF7\u6C42
    const get = useCallback((url: string, options: Omit<RequestOptions, 'method'> = {}) => {
        return request(url, { ...options, method: 'GET' });
    }, [request]);

    // POST \u8BF7\u6C42
    const post = useCallback((url: string, data?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) => {
        return request(url, { ...options, method: 'POST', body: data });
    }, [request]);

    // PUT \u8BF7\u6C42
    const put = useCallback((url: string, data?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) => {
        return request(url, { ...options, method: 'PUT', body: data });
    }, [request]);

    // DELETE \u8BF7\u6C42
    const del = useCallback((url: string, options: Omit<RequestOptions, 'method'> = {}) => {
        return request(url, { ...options, method: 'DELETE' });
    }, [request]);

    // \u6E05\u9664\u72B6\u6001
    const clearState = useCallback(() => {
        setState({ data: null, loading: false, error: null });
    }, []);

    return {
        ...state,
        request,
        get,
        post,
        put,
        delete: del,
        clearState
    };
}

export default function ApiDemo() {
    const api = useSimpleApi({ baseURL: 'https://api.example.com' });
    const [selectedEndpoint, setSelectedEndpoint] = useState('users');
    const [requestMethod, setRequestMethod] = useState<'GET' | 'POST' | 'PUT'>('GET');
    const [requestBody, setRequestBody] = useState('{"name": "\u65B0\u7528\u6237", "email": "newuser@example.com"}');
    const [requestHistory, setRequestHistory] = useState<Array<{
        id: number;
        method: string;
        url: string;
        status: 'success' | 'error';
        timestamp: string;
        duration: number;
    }>>([]);

    // \u9884\u5B9A\u4E49\u7684API\u7AEF\u70B9
    const endpoints = [
        { value: 'users', label: '\u83B7\u53D6\u7528\u6237\u5217\u8868', method: 'GET' },
        { value: 'posts', label: '\u83B7\u53D6\u6587\u7AE0\u5217\u8868', method: 'GET' },
        { value: 'users', label: '\u521B\u5EFA\u7528\u6237', method: 'POST' },
        { value: 'user/1', label: '\u66F4\u65B0\u7528\u6237', method: 'PUT' },
        { value: 'error', label: '\u6A21\u62DF\u9519\u8BEF', method: 'GET' },
        { value: 'timeout', label: '\u6A21\u62DF\u8D85\u65F6', method: 'GET' },
    ];

    const handleRequest = async () => {
        const startTime = Date.now();
        const url = \`/api/\${selectedEndpoint}\`;

        try {
            let result;
            switch (requestMethod) {
                case 'GET':
                    result = await api.get(url);
                    break;
                case 'POST':
                    const postData = JSON.parse(requestBody);
                    result = await api.post(url, postData);
                    break;
                case 'PUT':
                    const putData = JSON.parse(requestBody);
                    result = await api.put(url, putData);
                    break;
            }

            // \u8BB0\u5F55\u8BF7\u6C42\u5386\u53F2
            const duration = Date.now() - startTime;
            setRequestHistory(prev => [{
                id: Date.now(),
                method: requestMethod,
                url,
                status: 'success',
                timestamp: new Date().toLocaleTimeString(),
                duration
            }, ...prev].slice(0, 10));

        } catch (error) {
            const duration = Date.now() - startTime;
            setRequestHistory(prev => [{
                id: Date.now(),
                method: requestMethod,
                url,
                status: 'error',
                timestamp: new Date().toLocaleTimeString(),
                duration
            }, ...prev].slice(0, 10));
        }
    };

    const clearHistory = () => {
        setRequestHistory([]);
        api.clearState();
    };

    const selectEndpoint = (endpoint: any) => {
        setSelectedEndpoint(endpoint.value);
        setRequestMethod(endpoint.method);

        // \u6839\u636E\u65B9\u6CD5\u8BBE\u7F6E\u9ED8\u8BA4\u8BF7\u6C42\u4F53
        if (endpoint.method === 'POST') {
            setRequestBody('{"name": "\u65B0\u7528\u6237", "status": "active"}');
        } else if (endpoint.method === 'PUT') {
            setRequestBody('{"name": "\u66F4\u65B0\u7684\u7528\u6237\u540D", "status": "inactive"}');
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
            <h4>\u{1F310} API\u8BF7\u6C42\u5C01\u88C5\u6F14\u793A</h4>

            {/* \u8BF7\u6C42\u914D\u7F6E */}
            <div style={{ marginBottom: '20px' }}>
                <h5 style={{ margin: '0 0 12px 0' }}>\u8BF7\u6C42\u914D\u7F6E</h5>

                {/* \u5FEB\u901F\u9009\u62E9\u7AEF\u70B9 */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        \u5FEB\u901F\u9009\u62E9\uFF1A
                    </label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {endpoints.map((endpoint, index) => (
                            <button
                                key={index}
                                onClick={() => selectEndpoint(endpoint)}
                                style={{
                                    padding: '6px 12px',
                                    background: selectedEndpoint === endpoint.value && requestMethod === endpoint.method ? '#1890ff' : '#f5f5f5',
                                    color: selectedEndpoint === endpoint.value && requestMethod === endpoint.method ? 'white' : '#666',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                {endpoint.method} {endpoint.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* \u624B\u52A8\u914D\u7F6E */}
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 100px', gap: '12px', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
                            \u8BF7\u6C42\u65B9\u6CD5
                        </label>
                        <select
                            value={requestMethod}
                            onChange={(e) => setRequestMethod(e.target.value as any)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }}
                        >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
                            API\u7AEF\u70B9
                        </label>
                        <input
                            type="text"
                            value={selectedEndpoint}
                            onChange={(e) => setSelectedEndpoint(e.target.value)}
                            placeholder="\u4F8B\u5982: users, posts"
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }}
                        />
                    </div>

                    <button
                        onClick={handleRequest}
                        disabled={api.loading}
                        style={{
                            padding: '8px 16px',
                            background: api.loading ? '#f5f5f5' : '#1890ff',
                            color: api.loading ? '#999' : 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: api.loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {api.loading ? '\u8BF7\u6C42\u4E2D...' : '\u53D1\u9001\u8BF7\u6C42'}
                    </button>
                </div>

                {/* \u8BF7\u6C42\u4F53\uFF08POST/PUT\u65F6\u663E\u793A\uFF09 */}
                {(requestMethod === 'POST' || requestMethod === 'PUT') && (
                    <div style={{ marginTop: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
                            \u8BF7\u6C42\u4F53 (JSON)
                        </label>
                        <textarea
                            value={requestBody}
                            onChange={(e) => setRequestBody(e.target.value)}
                            placeholder='{"key": "value"}'
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                                fontSize: '12px'
                            }}
                        />
                    </div>
                )}
            </div>

            {/* \u8BF7\u6C42\u72B6\u6001\u663E\u793A */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                }}>
                    <h5 style={{ margin: 0 }}>\u8BF7\u6C42\u72B6\u6001</h5>
                    <button
                        onClick={clearHistory}
                        style={{
                            padding: '4px 8px',
                            background: 'transparent',
                            color: '#666',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        \u6E05\u9664\u5386\u53F2
                    </button>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '12px',
                    marginBottom: '16px'
                }}>
                    <div style={{
                        padding: '12px',
                        background: api.loading ? '#fff7e6' : (api.error ? '#fff2f0' : '#f6ffed'),
                        border: \`1px solid \${api.loading ? '#ffc53d' : (api.error ? '#ffb3b3' : '#b7eb8f')}\`,
                        borderRadius: '6px'
                    }}>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>\u72B6\u6001</div>
                        <div style={{ fontWeight: 'bold' }}>
                            {api.loading ? '\u23F3 \u8BF7\u6C42\u4E2D' : (api.error ? '\u274C \u8BF7\u6C42\u5931\u8D25' : (api.data ? '\u2705 \u8BF7\u6C42\u6210\u529F' : '\u2B55 \u7B49\u5F85\u8BF7\u6C42'))}
                        </div>
                    </div>

                    {api.error && (
                        <div style={{
                            padding: '12px',
                            background: '#fff2f0',
                            border: '1px solid #ffb3b3',
                            borderRadius: '6px'
                        }}>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>\u9519\u8BEF\u4FE1\u606F</div>
                            <div style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: '12px' }}>
                                {api.error}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* \u54CD\u5E94\u6570\u636E */}
            {api.data && (
                <div style={{ marginBottom: '20px' }}>
                    <h5 style={{ margin: '0 0 12px 0' }}>\u54CD\u5E94\u6570\u636E</h5>
                    <div style={{
                        background: '#f5f5f5',
                        padding: '16px',
                        borderRadius: '8px',
                        maxHeight: '300px',
                        overflowY: 'auto'
                    }}>
                        <pre style={{
                            margin: 0,
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                        }}>
                            {JSON.stringify(api.data, null, 2)}
                        </pre>
                    </div>
                </div>
            )}

            {/* \u8BF7\u6C42\u5386\u53F2 */}
            <div>
                <h5 style={{ margin: '0 0 12px 0' }}>\u8BF7\u6C42\u5386\u53F2</h5>
                <div style={{
                    background: '#f5f5f5',
                    padding: '16px',
                    borderRadius: '8px',
                    maxHeight: '200px',
                    overflowY: 'auto'
                }}>
                    {requestHistory.length > 0 ? (
                        requestHistory.map((record) => (
                            <div
                                key={record.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '8px 0',
                                    borderBottom: '1px solid #eee',
                                    fontSize: '12px'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{
                                        background: record.status === 'success' ? '#52c41a' : '#ff4d4f',
                                        color: 'white',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontSize: '10px'
                                    }}>
                                        {record.method}
                                    </span>
                                    <span>{record.url}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#666' }}>
                                    <span>{record.duration}ms</span>
                                    <span>{record.timestamp}</span>
                                    <span>{record.status === 'success' ? '\u2705' : '\u274C'}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                            \u6682\u65E0\u8BF7\u6C42\u5386\u53F2
                        </div>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
                \u{1F4A1} \u63D0\u793A\uFF1A\u5C1D\u8BD5\u4E0D\u540C\u7684API\u7AEF\u70B9\u548C\u8BF7\u6C42\u65B9\u6CD5\uFF0C\u89C2\u5BDFloading\u72B6\u6001\u3001\u9519\u8BEF\u5904\u7406\u548C\u54CD\u5E94\u6570\u636E\u7684\u53D8\u5316\uFF01
            </div>
        </div>
    );
} `},83684:function(dn,I){I.Z=`import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// \u7528\u6237\u7C7B\u578B\u5B9A\u4E49
interface User {
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'user';
    avatar?: string;
}

// \u8BA4\u8BC1\u72B6\u6001\u7C7B\u578B
interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

// \u8BA4\u8BC1\u4E0A\u4E0B\u6587\u7C7B\u578B
interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (userData: { username: string; email: string; password: string }) => Promise<void>;
    updateProfile: (userData: Partial<User>) => Promise<void>;
    clearError: () => void;
}

// \u521B\u5EFA\u8BA4\u8BC1\u4E0A\u4E0B\u6587
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// \u6A21\u62DF\u7528\u6237\u6570\u636E
const mockUsers = [
    { id: 1, username: 'admin', email: 'admin@example.com', password: '123456', role: 'admin' as const },
    { id: 2, username: 'user', email: 'user@example.com', password: '123456', role: 'user' as const },
];

// \u8BA4\u8BC1\u63D0\u4F9B\u8005\u7EC4\u4EF6
function AuthProvider({ children }: { children: React.ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
    });

    // \u6A21\u62DFAPI\u5EF6\u8FDF
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // \u767B\u5F55\u51FD\u6570
    const login = useCallback(async (email: string, password: string) => {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            await delay(1000); // \u6A21\u62DF\u7F51\u7EDC\u5EF6\u8FDF

            const user = mockUsers.find(u => u.email === email && u.password === password);

            if (!user) {
                throw new Error('\u90AE\u7BB1\u6216\u5BC6\u7801\u9519\u8BEF');
            }

            const { password: _, ...userWithoutPassword } = user;

            setAuthState({
                user: userWithoutPassword,
                isAuthenticated: true,
                isLoading: false,
                error: null
            });

            // \u6A21\u62DF\u4FDD\u5B58\u5230localStorage
            localStorage.setItem('auth-demo-user', JSON.stringify(userWithoutPassword));

        } catch (error) {
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : '\u767B\u5F55\u5931\u8D25'
            }));
        }
    }, []);

    // \u767B\u51FA\u51FD\u6570
    const logout = useCallback(() => {
        setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
        });
        localStorage.removeItem('auth-demo-user');
    }, []);

    // \u6CE8\u518C\u51FD\u6570
    const register = useCallback(async (userData: { username: string; email: string; password: string }) => {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            await delay(1200);

            // \u68C0\u67E5\u90AE\u7BB1\u662F\u5426\u5DF2\u5B58\u5728
            if (mockUsers.some(u => u.email === userData.email)) {
                throw new Error('\u8BE5\u90AE\u7BB1\u5DF2\u88AB\u6CE8\u518C');
            }

            const newUser: User = {
                id: mockUsers.length + 1,
                username: userData.username,
                email: userData.email,
                role: 'user'
            };

            setAuthState({
                user: newUser,
                isAuthenticated: true,
                isLoading: false,
                error: null
            });

            localStorage.setItem('auth-demo-user', JSON.stringify(newUser));

        } catch (error) {
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : '\u6CE8\u518C\u5931\u8D25'
            }));
        }
    }, []);

    // \u66F4\u65B0\u7528\u6237\u4FE1\u606F
    const updateProfile = useCallback(async (userData: Partial<User>) => {
        if (!authState.user) return;

        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            await delay(800);

            const updatedUser = { ...authState.user, ...userData };

            setAuthState(prev => ({
                ...prev,
                user: updatedUser,
                isLoading: false
            }));

            localStorage.setItem('auth-demo-user', JSON.stringify(updatedUser));

        } catch (error) {
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : '\u66F4\u65B0\u5931\u8D25'
            }));
        }
    }, [authState.user]);

    // \u6E05\u9664\u9519\u8BEF
    const clearError = useCallback(() => {
        setAuthState(prev => ({ ...prev, error: null }));
    }, []);

    // \u521D\u59CB\u5316\u65F6\u68C0\u67E5\u672C\u5730\u5B58\u50A8
    useEffect(() => {
        const savedUser = localStorage.getItem('auth-demo-user');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                setAuthState({
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null
                });
            } catch (error) {
                localStorage.removeItem('auth-demo-user');
            }
        }
    }, []);

    const contextValue: AuthContextType = {
        ...authState,
        login,
        logout,
        register,
        updateProfile,
        clearError
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

// useAuth hook
function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// \u767B\u5F55\u8868\u5355\u7EC4\u4EF6
function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error, clearError } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (email && password) {
            await login(email, password);
        }
    };

    const fillDemoData = (type: 'admin' | 'user') => {
        setEmail(type === 'admin' ? 'admin@example.com' : 'user@example.com');
        setPassword('123456');
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '300px' }}>
            <h5 style={{ margin: '0 0 16px 0' }}>\u7528\u6237\u767B\u5F55</h5>

            {error && (
                <div style={{
                    padding: '8px',
                    background: '#fff2f0',
                    border: '1px solid #ffb3b3',
                    borderRadius: '4px',
                    color: '#ff4d4f',
                    marginBottom: '12px',
                    fontSize: '12px'
                }}>
                    {error}
                    <button
                        type="button"
                        onClick={clearError}
                        style={{
                            float: 'right',
                            background: 'none',
                            border: 'none',
                            color: '#ff4d4f',
                            cursor: 'pointer'
                        }}
                    >
                        \xD7
                    </button>
                </div>
            )}

            <div style={{ marginBottom: '12px' }}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="\u90AE\u7BB1\u5730\u5740"
                    style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    }}
                />
            </div>

            <div style={{ marginBottom: '16px' }}>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="\u5BC6\u7801"
                    style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    }}
                />
            </div>

            <button
                type="submit"
                disabled={isLoading || !email || !password}
                style={{
                    width: '100%',
                    padding: '10px',
                    background: isLoading || !email || !password ? '#f5f5f5' : '#1890ff',
                    color: isLoading || !email || !password ? '#999' : 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLoading || !email || !password ? 'not-allowed' : 'pointer',
                    marginBottom: '12px'
                }}
            >
                {isLoading ? '\u767B\u5F55\u4E2D...' : '\u767B\u5F55'}
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    type="button"
                    onClick={() => fillDemoData('admin')}
                    style={{
                        flex: 1,
                        padding: '6px',
                        background: '#faad14',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                    }}
                >
                    \u7BA1\u7406\u5458\u767B\u5F55
                </button>
                <button
                    type="button"
                    onClick={() => fillDemoData('user')}
                    style={{
                        flex: 1,
                        padding: '6px',
                        background: '#52c41a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                    }}
                >
                    \u666E\u901A\u7528\u6237\u767B\u5F55
                </button>
            </div>
        </form>
    );
}

// \u7528\u6237\u8D44\u6599\u7EC4\u4EF6
function UserProfile() {
    const { user, logout, updateProfile, isLoading } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState(user?.username || '');

    const handleUpdate = async () => {
        await updateProfile({ username });
        setIsEditing(false);
    };

    if (!user) return null;

    return (
        <div style={{ maxWidth: '400px' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
            }}>
                <h5 style={{ margin: 0 }}>\u7528\u6237\u4FE1\u606F</h5>
                <button
                    onClick={logout}
                    style={{
                        padding: '6px 12px',
                        background: '#ff4d4f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                    }}
                >
                    \u9000\u51FA\u767B\u5F55
                </button>
            </div>

            <div style={{
                background: '#f5f5f5',
                padding: '16px',
                borderRadius: '8px'
            }}>
                <div style={{ marginBottom: '12px' }}>
                    <strong>\u7528\u6237\u540D\uFF1A</strong>
                    {isEditing ? (
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{
                                marginLeft: '8px',
                                padding: '4px 8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }}
                        />
                    ) : (
                        <span style={{ marginLeft: '8px' }}>{user.username}</span>
                    )}
                </div>

                <div style={{ marginBottom: '12px' }}>
                    <strong>\u90AE\u7BB1\uFF1A</strong>
                    <span style={{ marginLeft: '8px' }}>{user.email}</span>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <strong>\u89D2\u8272\uFF1A</strong>
                    <span style={{
                        marginLeft: '8px',
                        padding: '2px 8px',
                        background: user.role === 'admin' ? '#faad14' : '#52c41a',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '12px'
                    }}>
                        {user.role === 'admin' ? '\u7BA1\u7406\u5458' : '\u666E\u901A\u7528\u6237'}
                    </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleUpdate}
                                disabled={isLoading}
                                style={{
                                    padding: '6px 12px',
                                    background: '#1890ff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                {isLoading ? '\u4FDD\u5B58\u4E2D...' : '\u4FDD\u5B58'}
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setUsername(user.username);
                                }}
                                style={{
                                    padding: '6px 12px',
                                    background: '#ccc',
                                    color: '#666',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                \u53D6\u6D88
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{
                                padding: '6px 12px',
                                background: '#1890ff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            \u7F16\u8F91\u8D44\u6599
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// \u4E3B\u6F14\u793A\u7EC4\u4EF6
export default function AuthDemo() {
    return (
        <AuthProvider>
            <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
                <h4>\u{1F510} \u7528\u6237\u8BA4\u8BC1\u7BA1\u7406\u6F14\u793A</h4>

                <AuthContent />

                <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                    \u{1F4A1} \u63D0\u793A\uFF1A\u4F7F\u7528\u5FEB\u901F\u767B\u5F55\u6309\u94AE\u4F53\u9A8C\u4E0D\u540C\u7528\u6237\u89D2\u8272\uFF0C\u6216\u8005\u624B\u52A8\u8F93\u5165\u90AE\u7BB1\u548C\u5BC6\u7801\uFF01
                </div>
            </div>
        </AuthProvider>
    );
}

// \u8BA4\u8BC1\u5185\u5BB9\u7EC4\u4EF6
function AuthContent() {
    const { isAuthenticated, user } = useAuth();

    return (
        <div>
            {!isAuthenticated ? (
                <LoginForm />
            ) : (
                <UserProfile />
            )}

            {/* \u72B6\u6001\u663E\u793A */}
            <div style={{
                marginTop: '20px',
                padding: '12px',
                background: '#f0f2f5',
                borderRadius: '6px'
            }}>
                <h6 style={{ margin: '0 0 8px 0' }}>\u5F53\u524D\u72B6\u6001\uFF1A</h6>
                <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                    <div><strong>\u5DF2\u767B\u5F55\uFF1A</strong> {isAuthenticated ? 'true' : 'false'}</div>
                    {user && (
                        <>
                            <div><strong>\u7528\u6237ID\uFF1A</strong> {user.id}</div>
                            <div><strong>\u7528\u6237\u540D\uFF1A</strong> {user.username}</div>
                            <div><strong>\u90AE\u7BB1\uFF1A</strong> {user.email}</div>
                            <div><strong>\u89D2\u8272\uFF1A</strong> {user.role}</div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
} `},32776:function(dn,I){I.Z=`import React, { useEffect, useState } from 'react';

// \u7B80\u5316\u7684 useClientSide \u5B9E\u73B0
function useSimpleClientSide() {
    const [isClient, setIsClient] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setHasMounted(true);
    }, []);

    return {
        isClient,
        hasMounted,
        isServer: !isClient
    };
}

// \u6D4F\u89C8\u5668\u4FE1\u606F\u68C0\u6D4B
function useBrowserInfo() {
    const [browserInfo, setBrowserInfo] = useState<{
        userAgent: string;
        platform: string;
        language: string;
        cookieEnabled: boolean;
        onLine: boolean;
        screenWidth: number;
        screenHeight: number;
        viewportWidth: number;
        viewportHeight: number;
        colorDepth: number;
        pixelRatio: number;
        timezone: string;
        touchSupport: boolean;
    } | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const updateBrowserInfo = () => {
                setBrowserInfo({
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    language: navigator.language,
                    cookieEnabled: navigator.cookieEnabled,
                    onLine: navigator.onLine,
                    screenWidth: screen.width,
                    screenHeight: screen.height,
                    viewportWidth: window.innerWidth,
                    viewportHeight: window.innerHeight,
                    colorDepth: screen.colorDepth,
                    pixelRatio: window.devicePixelRatio || 1,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0
                });
            };

            updateBrowserInfo();

            // \u76D1\u542C\u7A97\u53E3\u5927\u5C0F\u53D8\u5316
            window.addEventListener('resize', updateBrowserInfo);
            window.addEventListener('online', updateBrowserInfo);
            window.addEventListener('offline', updateBrowserInfo);

            return () => {
                window.removeEventListener('resize', updateBrowserInfo);
                window.removeEventListener('online', updateBrowserInfo);
                window.removeEventListener('offline', updateBrowserInfo);
            };
        }
    }, []);

    return browserInfo;
}

// \u670D\u52A1\u7AEF\u6E32\u67D3\u5B89\u5168\u7EC4\u4EF6
function ClientOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
    const { isClient } = useSimpleClientSide();

    return isClient ? <>{children}</> : <>{fallback}</>;
}

export default function ClientSideDemo() {
    const { isClient, hasMounted, isServer } = useSimpleClientSide();
    const browserInfo = useBrowserInfo();
    const [renderTime, setRenderTime] = useState<string>('');
    const [reRenderCount, setReRenderCount] = useState(0);
    const [showClientContent, setShowClientContent] = useState(false);

    // \u8BB0\u5F55\u6E32\u67D3\u65F6\u95F4
    useEffect(() => {
        if (hasMounted) {
            setRenderTime(new Date().toLocaleTimeString());
        }
    }, [hasMounted]);

    // \u6A21\u62DF\u91CD\u65B0\u6E32\u67D3
    const triggerReRender = () => {
        setReRenderCount(prev => prev + 1);
    };

    const getBrowserName = (userAgent: string) => {
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        if (userAgent.includes('Opera')) return 'Opera';
        return '\u672A\u77E5\u6D4F\u89C8\u5668';
    };

    const getDeviceType = (userAgent: string, touchSupport: boolean) => {
        if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
            return '\u79FB\u52A8\u8BBE\u5907';
        }
        if (touchSupport) {
            return '\u89E6\u5C4F\u8BBE\u5907';
        }
        return '\u684C\u9762\u8BBE\u5907';
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
            <h4>\u{1F4BB} \u5BA2\u6237\u7AEF\u68C0\u6D4B\u6F14\u793A</h4>

            {/* \u57FA\u7840\u72B6\u6001\u663E\u793A */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '20px'
            }}>
                <div style={{
                    padding: '16px',
                    background: isClient ? '#f6ffed' : '#fff7e6',
                    border: \`1px solid \${isClient ? '#b7eb8f' : '#ffc53d'}\`,
                    borderRadius: '8px'
                }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                        {isClient ? '\u{1F310}' : '\u{1F527}'}
                    </div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {isClient ? '\u5BA2\u6237\u7AEF\u73AF\u5883' : '\u670D\u52A1\u7AEF\u73AF\u5883'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        isClient: {isClient.toString()}
                    </div>
                </div>

                <div style={{
                    padding: '16px',
                    background: hasMounted ? '#f6ffed' : '#fff2f0',
                    border: \`1px solid \${hasMounted ? '#b7eb8f' : '#ffb3b3'}\`,
                    borderRadius: '8px'
                }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                        {hasMounted ? '\u2705' : '\u23F3'}
                    </div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {hasMounted ? '\u5DF2\u6302\u8F7D' : '\u6302\u8F7D\u4E2D'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        hasMounted: {hasMounted.toString()}
                    </div>
                    {renderTime && (
                        <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>
                            \u6302\u8F7D\u65F6\u95F4: {renderTime}
                        </div>
                    )}
                </div>

                <div style={{
                    padding: '16px',
                    background: '#f0f2f5',
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px'
                }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>\u{1F504}</div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        \u91CD\u6E32\u67D3\u6B21\u6570
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                        {reRenderCount}
                    </div>
                    <button
                        onClick={triggerReRender}
                        style={{
                            marginTop: '8px',
                            padding: '4px 8px',
                            background: '#1890ff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '10px'
                        }}
                    >
                        \u89E6\u53D1\u91CD\u6E32\u67D3
                    </button>
                </div>
            </div>

            {/* SSR \u5B89\u5168\u7EC4\u4EF6\u6F14\u793A */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                }}>
                    <h5 style={{ margin: 0 }}>SSR \u5B89\u5168\u7EC4\u4EF6\u6F14\u793A</h5>
                    <button
                        onClick={() => setShowClientContent(!showClientContent)}
                        style={{
                            padding: '6px 12px',
                            background: '#1890ff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        {showClientContent ? '\u9690\u85CF' : '\u663E\u793A'}\u5BA2\u6237\u7AEF\u5185\u5BB9
                    </button>
                </div>

                <div style={{
                    padding: '16px',
                    background: '#f5f5f5',
                    borderRadius: '8px'
                }}>
                    <div style={{ marginBottom: '12px' }}>
                        <strong>\u603B\u662F\u663E\u793A\u7684\u5185\u5BB9\uFF1A</strong> \u8FD9\u6BB5\u6587\u5B57\u5728\u670D\u52A1\u7AEF\u548C\u5BA2\u6237\u7AEF\u90FD\u4F1A\u6E32\u67D3
                    </div>

                    <ClientOnly fallback={<div style={{ color: '#faad14' }}>\u23F3 \u670D\u52A1\u7AEF\u6E32\u67D3\u65F6\u663E\u793A\u7684\u5360\u4F4D\u5185\u5BB9...</div>}>
                        <div style={{ color: '#52c41a' }}>
                            \u2705 \u53EA\u5728\u5BA2\u6237\u7AEF\u663E\u793A\u7684\u5185\u5BB9\uFF1A\u5F53\u524D\u65F6\u95F4\u662F {new Date().toLocaleString()}
                        </div>
                    </ClientOnly>

                    {showClientContent && (
                        <ClientOnly>
                            <div style={{
                                marginTop: '12px',
                                padding: '12px',
                                background: '#e6f7ff',
                                border: '1px solid #91d5ff',
                                borderRadius: '4px'
                            }}>
                                \u{1F3AF} \u8FD9\u662F\u52A8\u6001\u663E\u793A\u7684\u5BA2\u6237\u7AEF\u4E13\u5C5E\u5185\u5BB9\uFF01<br />
                                \u968F\u673A\u6570: {Math.random().toFixed(4)}
                            </div>
                        </ClientOnly>
                    )}
                </div>
            </div>

            {/* \u6D4F\u89C8\u5668\u4FE1\u606F */}
            <ClientOnly
                fallback={
                    <div style={{
                        padding: '16px',
                        background: '#f5f5f5',
                        borderRadius: '8px',
                        textAlign: 'center',
                        color: '#666'
                    }}>
                        \u23F3 \u6B63\u5728\u52A0\u8F7D\u6D4F\u89C8\u5668\u4FE1\u606F...
                    </div>
                }
            >
                {browserInfo && (
                    <div>
                        <h5 style={{ margin: '0 0 12px 0' }}>\u6D4F\u89C8\u5668\u73AF\u5883\u4FE1\u606F</h5>

                        {/* \u57FA\u672C\u4FE1\u606F\u5361\u7247 */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '12px',
                            marginBottom: '16px'
                        }}>
                            <div style={{ padding: '12px', background: '#f0f2f5', borderRadius: '6px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>\u{1F30F} \u6D4F\u89C8\u5668\u4FE1\u606F</div>
                                <div style={{ fontSize: '12px' }}>
                                    <div><strong>\u6D4F\u89C8\u5668:</strong> {getBrowserName(browserInfo.userAgent)}</div>
                                    <div><strong>\u5E73\u53F0:</strong> {browserInfo.platform}</div>
                                    <div><strong>\u8BED\u8A00:</strong> {browserInfo.language}</div>
                                    <div><strong>\u65F6\u533A:</strong> {browserInfo.timezone}</div>
                                </div>
                            </div>

                            <div style={{ padding: '12px', background: '#f0f2f5', borderRadius: '6px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>\u{1F4F1} \u8BBE\u5907\u4FE1\u606F</div>
                                <div style={{ fontSize: '12px' }}>
                                    <div><strong>\u8BBE\u5907\u7C7B\u578B:</strong> {getDeviceType(browserInfo.userAgent, browserInfo.touchSupport)}</div>
                                    <div><strong>\u89E6\u5C4F\u652F\u6301:</strong> {browserInfo.touchSupport ? '\u662F' : '\u5426'}</div>
                                    <div><strong>\u50CF\u7D20\u6BD4:</strong> {browserInfo.pixelRatio}x</div>
                                    <div><strong>\u989C\u8272\u6DF1\u5EA6:</strong> {browserInfo.colorDepth}\u4F4D</div>
                                </div>
                            </div>

                            <div style={{ padding: '12px', background: '#f0f2f5', borderRadius: '6px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>\u{1F4CF} \u5C4F\u5E55\u4FE1\u606F</div>
                                <div style={{ fontSize: '12px' }}>
                                    <div><strong>\u5C4F\u5E55:</strong> {browserInfo.screenWidth} \xD7 {browserInfo.screenHeight}</div>
                                    <div><strong>\u89C6\u53E3:</strong> {browserInfo.viewportWidth} \xD7 {browserInfo.viewportHeight}</div>
                                    <div><strong>\u7F51\u7EDC:</strong> {browserInfo.onLine ? '\u5728\u7EBF' : '\u79BB\u7EBF'}</div>
                                    <div><strong>Cookie:</strong> {browserInfo.cookieEnabled ? '\u542F\u7528' : '\u7981\u7528'}</div>
                                </div>
                            </div>
                        </div>

                        {/* User Agent */}
                        <div style={{
                            padding: '12px',
                            background: '#f5f5f5',
                            borderRadius: '6px'
                        }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>\u{1F50D} User Agent</div>
                            <div style={{
                                fontSize: '10px',
                                fontFamily: 'monospace',
                                wordBreak: 'break-all',
                                color: '#666'
                            }}>
                                {browserInfo.userAgent}
                            </div>
                        </div>
                    </div>
                )}
            </ClientOnly>

            {/* \u72B6\u6001\u8BF4\u660E */}
            <div style={{
                marginTop: '20px',
                padding: '12px',
                background: '#f0f2f5',
                borderRadius: '6px'
            }}>
                <h6 style={{ margin: '0 0 8px 0' }}>Hook \u72B6\u6001\u8BF4\u660E\uFF1A</h6>
                <div style={{ fontSize: '12px', color: '#666' }}>
                    <div><strong>isClient:</strong> {isClient.toString()} - \u662F\u5426\u5728\u5BA2\u6237\u7AEF\u73AF\u5883</div>
                    <div><strong>isServer:</strong> {isServer.toString()} - \u662F\u5426\u5728\u670D\u52A1\u7AEF\u73AF\u5883</div>
                    <div><strong>hasMounted:</strong> {hasMounted.toString()} - \u7EC4\u4EF6\u662F\u5426\u5DF2\u5B8C\u6210\u6302\u8F7D</div>
                </div>
            </div>

            <div style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
                \u{1F4A1} \u63D0\u793A\uFF1AuseClientSide \u7528\u4E8E\u89E3\u51B3 SSR/SSG \u73AF\u5883\u4E0B\u7684\u6C34\u5408(hydration)\u95EE\u9898\uFF0C\u786E\u4FDD\u5BA2\u6237\u7AEF\u4E13\u5C5E\u4EE3\u7801\u53EA\u5728\u5BA2\u6237\u7AEF\u6267\u884C\uFF01
            </div>
        </div>
    );
} `},58161:function(dn,I){I.Z=`import React, { useCallback, useState } from 'react';

// \u7EC4\u4EF6\u7C7B\u578B\u5B9A\u4E49
interface Component {
    id: string;
    type: 'button' | 'input' | 'text' | 'div' | 'image';
    props: Record<string, any>;
    style: Record<string, any>;
    children?: Component[];
    parent?: string;
}

// \u7F16\u8F91\u5668\u72B6\u6001\u7C7B\u578B
interface EditorState {
    components: Component[];
    selectedId: string | null;
    history: Component[][];
    historyIndex: number;
    isDragging: boolean;
    dragTarget: string | null;
}

// \u7B80\u5316\u7684 useEditor \u5B9E\u73B0
function useSimpleEditor() {
    const [state, setState] = useState<EditorState>({
        components: [],
        selectedId: null,
        history: [[]],
        historyIndex: 0,
        isDragging: false,
        dragTarget: null
    });

    // \u6DFB\u52A0\u7EC4\u4EF6
    const addComponent = useCallback((type: Component['type'], parentId?: string) => {
        const newComponent: Component = {
            id: \`\${type}_\${Date.now()}\`,
            type,
            props: getDefaultProps(type),
            style: getDefaultStyle(type),
            children: [],
            parent: parentId
        };

        setState(prev => {
            const newComponents = [...prev.components];

            if (parentId) {
                const parent = findComponentById(newComponents, parentId);
                if (parent) {
                    parent.children = parent.children || [];
                    parent.children.push(newComponent);
                }
            } else {
                newComponents.push(newComponent);
            }

            const newHistory = prev.history.slice(0, prev.historyIndex + 1);
            newHistory.push(newComponents);

            return {
                ...prev,
                components: newComponents,
                selectedId: newComponent.id,
                history: newHistory,
                historyIndex: newHistory.length - 1
            };
        });
    }, []);

    // \u5220\u9664\u7EC4\u4EF6
    const deleteComponent = useCallback((id: string) => {
        setState(prev => {
            const newComponents = prev.components.filter(comp => comp.id !== id);

            // \u9012\u5F52\u5220\u9664\u5B50\u7EC4\u4EF6
            const removeFromChildren = (components: Component[]): Component[] => {
                return components.map(comp => ({
                    ...comp,
                    children: comp.children ? removeFromChildren(comp.children.filter(child => child.id !== id)) : []
                }));
            };

            const finalComponents = removeFromChildren(newComponents);

            const newHistory = prev.history.slice(0, prev.historyIndex + 1);
            newHistory.push(finalComponents);

            return {
                ...prev,
                components: finalComponents,
                selectedId: prev.selectedId === id ? null : prev.selectedId,
                history: newHistory,
                historyIndex: newHistory.length - 1
            };
        });
    }, []);

    // \u66F4\u65B0\u7EC4\u4EF6\u5C5E\u6027
    const updateComponent = useCallback((id: string, updates: Partial<Component>) => {
        setState(prev => {
            const newComponents = [...prev.components];
            const updateComponentRecursive = (components: Component[]): Component[] => {
                return components.map(comp => {
                    if (comp.id === id) {
                        return { ...comp, ...updates };
                    }
                    if (comp.children) {
                        return { ...comp, children: updateComponentRecursive(comp.children) };
                    }
                    return comp;
                });
            };

            const updatedComponents = updateComponentRecursive(newComponents);

            const newHistory = prev.history.slice(0, prev.historyIndex + 1);
            newHistory.push(updatedComponents);

            return {
                ...prev,
                components: updatedComponents,
                history: newHistory,
                historyIndex: newHistory.length - 1
            };
        });
    }, []);

    // \u9009\u62E9\u7EC4\u4EF6
    const selectComponent = useCallback((id: string | null) => {
        setState(prev => ({ ...prev, selectedId: id }));
    }, []);

    // \u64A4\u9500/\u91CD\u505A
    const undo = useCallback(() => {
        setState(prev => {
            if (prev.historyIndex > 0) {
                const newIndex = prev.historyIndex - 1;
                return {
                    ...prev,
                    components: prev.history[newIndex],
                    historyIndex: newIndex
                };
            }
            return prev;
        });
    }, []);

    const redo = useCallback(() => {
        setState(prev => {
            if (prev.historyIndex < prev.history.length - 1) {
                const newIndex = prev.historyIndex + 1;
                return {
                    ...prev,
                    components: prev.history[newIndex],
                    historyIndex: newIndex
                };
            }
            return prev;
        });
    }, []);

    // \u6E05\u7A7A\u753B\u5E03
    const clearCanvas = useCallback(() => {
        setState(prev => {
            const newHistory = prev.history.slice(0, prev.historyIndex + 1);
            newHistory.push([]);

            return {
                ...prev,
                components: [],
                selectedId: null,
                history: newHistory,
                historyIndex: newHistory.length - 1
            };
        });
    }, []);

    return {
        ...state,
        addComponent,
        deleteComponent,
        updateComponent,
        selectComponent,
        undo,
        redo,
        clearCanvas,
        canUndo: state.historyIndex > 0,
        canRedo: state.historyIndex < state.history.length - 1
    };
}

// \u5DE5\u5177\u51FD\u6570
function getDefaultProps(type: Component['type']): Record<string, any> {
    switch (type) {
        case 'button':
            return { children: '\u6309\u94AE', onClick: 'console.log("clicked")' };
        case 'input':
            return { placeholder: '\u8BF7\u8F93\u5165\u5185\u5BB9', type: 'text' };
        case 'text':
            return { children: '\u6587\u672C\u5185\u5BB9' };
        case 'div':
            return { children: '\u5BB9\u5668' };
        case 'image':
            return { src: 'https://via.placeholder.com/150x100', alt: '\u56FE\u7247' };
        default:
            return {};
    }
}

function getDefaultStyle(type: Component['type']): Record<string, any> {
    const baseStyle = {
        margin: '8px',
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px'
    };

    switch (type) {
        case 'button':
            return { ...baseStyle, background: '#1890ff', color: 'white', cursor: 'pointer' };
        case 'input':
            return { ...baseStyle, width: '200px' };
        case 'text':
            return { ...baseStyle, border: 'none', background: 'transparent' };
        case 'div':
            return { ...baseStyle, minHeight: '100px', background: '#f5f5f5' };
        case 'image':
            return { ...baseStyle, maxWidth: '150px', height: 'auto' };
        default:
            return baseStyle;
    }
}

function findComponentById(components: Component[], id: string): Component | null {
    for (const comp of components) {
        if (comp.id === id) return comp;
        if (comp.children) {
            const found = findComponentById(comp.children, id);
            if (found) return found;
        }
    }
    return null;
}

// \u7EC4\u4EF6\u6E32\u67D3\u5668
function ComponentRenderer({
    component,
    isSelected,
    onSelect,
    onDelete
}: {
    component: Component;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
}) {
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(component.id);
    };

    const renderElement = () => {
        const style = {
            ...component.style,
            position: 'relative' as const,
            outline: isSelected ? '2px solid #1890ff' : 'none',
            cursor: 'pointer'
        };

        switch (component.type) {
            case 'button':
                return (
                    <button style={style} onClick={handleClick}>
                        {component.props.children}
                    </button>
                );
            case 'input':
                return (
                    <input
                        style={style}
                        placeholder={component.props.placeholder}
                        type={component.props.type}
                        onClick={handleClick}
                        readOnly
                    />
                );
            case 'text':
                return (
                    <span style={style} onClick={handleClick}>
                        {component.props.children}
                    </span>
                );
            case 'div':
                return (
                    <div style={style} onClick={handleClick}>
                        {component.props.children}
                        {component.children?.map(child => (
                            <ComponentRenderer
                                key={child.id}
                                component={child}
                                isSelected={false}
                                onSelect={onSelect}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                );
            case 'image':
                return (
                    <img
                        style={style}
                        src={component.props.src}
                        alt={component.props.alt}
                        onClick={handleClick}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            {renderElement()}
            {isSelected && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(component.id);
                    }}
                    style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '20px',
                        height: '20px',
                        background: '#ff4d4f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    \xD7
                </button>
            )}
        </div>
    );
}

// \u5C5E\u6027\u7F16\u8F91\u5668
function PropertyEditor({
    component,
    onUpdate
}: {
    component: Component | null;
    onUpdate: (id: string, updates: Partial<Component>) => void;
}) {
    if (!component) {
        return (
            <div style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
                \u8BF7\u9009\u62E9\u4E00\u4E2A\u7EC4\u4EF6\u8FDB\u884C\u7F16\u8F91
            </div>
        );
    }

    const handlePropChange = (key: string, value: any) => {
        onUpdate(component.id, {
            props: { ...component.props, [key]: value }
        });
    };

    const handleStyleChange = (key: string, value: any) => {
        onUpdate(component.id, {
            style: { ...component.style, [key]: value }
        });
    };

    return (
        <div style={{ padding: '16px' }}>
            <h6 style={{ margin: '0 0 12px 0' }}>\u5C5E\u6027\u7F16\u8F91</h6>

            <div style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>\u7EC4\u4EF6\u4FE1\u606F</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                    <div>ID: {component.id}</div>
                    <div>\u7C7B\u578B: {component.type}</div>
                </div>
            </div>

            {/* \u5C5E\u6027\u7F16\u8F91 */}
            <div style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>\u5C5E\u6027</div>

                {component.type === 'button' && (
                    <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                            \u6309\u94AE\u6587\u5B57
                        </label>
                        <input
                            type="text"
                            value={component.props.children || ''}
                            onChange={(e) => handlePropChange('children', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '6px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '12px'
                            }}
                        />
                    </div>
                )}

                {component.type === 'input' && (
                    <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                            \u5360\u4F4D\u7B26
                        </label>
                        <input
                            type="text"
                            value={component.props.placeholder || ''}
                            onChange={(e) => handlePropChange('placeholder', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '6px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '12px'
                            }}
                        />
                    </div>
                )}

                {component.type === 'text' && (
                    <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                            \u6587\u672C\u5185\u5BB9
                        </label>
                        <input
                            type="text"
                            value={component.props.children || ''}
                            onChange={(e) => handlePropChange('children', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '6px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '12px'
                            }}
                        />
                    </div>
                )}

                {component.type === 'image' && (
                    <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                            \u56FE\u7247\u5730\u5740
                        </label>
                        <input
                            type="text"
                            value={component.props.src || ''}
                            onChange={(e) => handlePropChange('src', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '6px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '12px'
                            }}
                        />
                    </div>
                )}
            </div>

            {/* \u6837\u5F0F\u7F16\u8F91 */}
            <div>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>\u6837\u5F0F</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                            \u80CC\u666F\u8272
                        </label>
                        <input
                            type="color"
                            value={component.style.background || '#ffffff'}
                            onChange={(e) => handleStyleChange('background', e.target.value)}
                            style={{ width: '100%', height: '32px' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                            \u6587\u5B57\u8272
                        </label>
                        <input
                            type="color"
                            value={component.style.color || '#000000'}
                            onChange={(e) => handleStyleChange('color', e.target.value)}
                            style={{ width: '100%', height: '32px' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                            \u5185\u8FB9\u8DDD
                        </label>
                        <input
                            type="text"
                            value={component.style.padding || ''}
                            onChange={(e) => handleStyleChange('padding', e.target.value)}
                            placeholder="8px"
                            style={{
                                width: '100%',
                                padding: '6px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '12px'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                            \u5706\u89D2
                        </label>
                        <input
                            type="text"
                            value={component.style.borderRadius || ''}
                            onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                            placeholder="4px"
                            style={{
                                width: '100%',
                                padding: '6px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '12px'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function EditorDemo() {
    const editor = useSimpleEditor();
    const [draggedType, setDraggedType] = useState<Component['type'] | null>(null);

    const componentTypes: Array<{ type: Component['type']; label: string; icon: string }> = [
        { type: 'button', label: '\u6309\u94AE', icon: '\u{1F518}' },
        { type: 'input', label: '\u8F93\u5165\u6846', icon: '\u{1F4DD}' },
        { type: 'text', label: '\u6587\u672C', icon: '\u{1F4C4}' },
        { type: 'div', label: '\u5BB9\u5668', icon: '\u{1F4E6}' },
        { type: 'image', label: '\u56FE\u7247', icon: '\u{1F5BC}\uFE0F' }
    ];

    const handleDragStart = (type: Component['type']) => {
        setDraggedType(type);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (draggedType) {
            editor.addComponent(draggedType);
            setDraggedType(null);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const selectedComponent = editor.components.find(comp => comp.id === editor.selectedId) || null;

    return (
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
            <h4>\u{1F3A8} \u4F4E\u4EE3\u7801\u7F16\u8F91\u5668\u6F14\u793A</h4>

            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 250px', gap: '16px', height: '500px' }}>
                {/* \u7EC4\u4EF6\u5E93 */}
                <div style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '16px',
                    background: '#f9f9f9'
                }}>
                    <h6 style={{ margin: '0 0 12px 0' }}>\u7EC4\u4EF6\u5E93</h6>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {componentTypes.map((type) => (
                            <div
                                key={type.type}
                                draggable
                                onDragStart={() => handleDragStart(type.type)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px',
                                    background: 'white',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    cursor: 'grab',
                                    fontSize: '12px'
                                }}
                            >
                                <span>{type.icon}</span>
                                <span>{type.label}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <h6 style={{ margin: '0 0 12px 0' }}>\u64CD\u4F5C</h6>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                                onClick={editor.undo}
                                disabled={!editor.canUndo}
                                style={{
                                    padding: '6px',
                                    background: editor.canUndo ? '#1890ff' : '#f5f5f5',
                                    color: editor.canUndo ? 'white' : '#999',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: editor.canUndo ? 'pointer' : 'not-allowed',
                                    fontSize: '12px'
                                }}
                            >
                                \u21B6 \u64A4\u9500
                            </button>

                            <button
                                onClick={editor.redo}
                                disabled={!editor.canRedo}
                                style={{
                                    padding: '6px',
                                    background: editor.canRedo ? '#1890ff' : '#f5f5f5',
                                    color: editor.canRedo ? 'white' : '#999',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: editor.canRedo ? 'pointer' : 'not-allowed',
                                    fontSize: '12px'
                                }}
                            >
                                \u21B7 \u91CD\u505A
                            </button>

                            <button
                                onClick={editor.clearCanvas}
                                style={{
                                    padding: '6px',
                                    background: '#ff4d4f',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                \u{1F5D1}\uFE0F \u6E05\u7A7A
                            </button>
                        </div>
                    </div>
                </div>

                {/* \u753B\u5E03\u533A\u57DF */}
                <div
                    style={{
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '16px',
                        background: 'white',
                        minHeight: '400px',
                        position: 'relative'
                    }}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => editor.selectComponent(null)}
                >
                    <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        fontSize: '12px',
                        color: '#999'
                    }}>
                        \u753B\u5E03 ({editor.components.length} \u4E2A\u7EC4\u4EF6)
                    </div>

                    <div style={{ marginTop: '24px' }}>
                        {editor.components.length === 0 ? (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '200px',
                                color: '#999',
                                fontSize: '14px',
                                border: '2px dashed #ddd',
                                borderRadius: '8px'
                            }}>
                                \u62D6\u62FD\u7EC4\u4EF6\u5230\u8FD9\u91CC\u5F00\u59CB\u8BBE\u8BA1
                            </div>
                        ) : (
                            editor.components.map(component => (
                                <ComponentRenderer
                                    key={component.id}
                                    component={component}
                                    isSelected={component.id === editor.selectedId}
                                    onSelect={editor.selectComponent}
                                    onDelete={editor.deleteComponent}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* \u5C5E\u6027\u9762\u677F */}
                <div style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    background: '#f9f9f9',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '12px',
                        background: '#1890ff',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '14px'
                    }}>
                        \u5C5E\u6027\u9762\u677F
                    </div>

                    <PropertyEditor
                        component={selectedComponent}
                        onUpdate={editor.updateComponent}
                    />
                </div>
            </div>

            {/* \u7F16\u8F91\u5668\u72B6\u6001 */}
            <div style={{
                marginTop: '16px',
                padding: '12px',
                background: '#f0f2f5',
                borderRadius: '6px'
            }}>
                <h6 style={{ margin: '0 0 8px 0' }}>\u7F16\u8F91\u5668\u72B6\u6001\uFF1A</h6>
                <div style={{ fontSize: '12px', color: '#666' }}>
                    <div><strong>\u7EC4\u4EF6\u6570\u91CF:</strong> {editor.components.length}</div>
                    <div><strong>\u9009\u4E2D\u7EC4\u4EF6:</strong> {editor.selectedId || '\u65E0'}</div>
                    <div><strong>\u5386\u53F2\u8BB0\u5F55:</strong> {editor.historyIndex + 1} / {editor.history.length}</div>
                    <div><strong>\u53EF\u64A4\u9500:</strong> {editor.canUndo ? '\u662F' : '\u5426'}</div>
                    <div><strong>\u53EF\u91CD\u505A:</strong> {editor.canRedo ? '\u662F' : '\u5426'}</div>
                </div>
            </div>

            <div style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
                \u{1F4A1} \u63D0\u793A\uFF1A\u4ECE\u5DE6\u4FA7\u7EC4\u4EF6\u5E93\u62D6\u62FD\u7EC4\u4EF6\u5230\u753B\u5E03\uFF0C\u70B9\u51FB\u7EC4\u4EF6\u8FDB\u884C\u9009\u62E9\uFF0C\u5728\u53F3\u4FA7\u5C5E\u6027\u9762\u677F\u4E2D\u7F16\u8F91\u7EC4\u4EF6\u5C5E\u6027\uFF01
            </div>
        </div>
    );
} `},34759:function(dn,I){I.Z=`import React, { useCallback, useState } from 'react';

// \u7B80\u5316\u7684 useForm \u5B9E\u73B0
type ValidateFunction<T> = (values: T) => Partial<Record<keyof T, string>>;

interface UseFormOptions<T> {
    initialValues: T;
    validate?: ValidateFunction<T>;
    onSubmit?: (values: T) => void | Promise<void>;
}

function useSimpleForm<T extends Record<string, any>>(options: UseFormOptions<T>) {
    const { initialValues, validate, onSubmit } = options;

    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = useCallback(() => {
        if (!validate) return {};
        return validate(values);
    }, [values, validate]);

    const setFieldValue = useCallback((name: keyof T, value: any) => {
        setValues(prev => ({ ...prev, [name]: value }));

        // \u6E05\u9664\u8BE5\u5B57\u6BB5\u7684\u9519\u8BEF
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    }, [errors]);

    const setFieldTouched = useCallback((name: keyof T, isTouched = true) => {
        setTouched(prev => ({ ...prev, [name]: isTouched }));
    }, []);

    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault();

        const formErrors = validateForm();
        setErrors(formErrors);

        if (Object.keys(formErrors).length === 0) {
            setIsSubmitting(true);
            try {
                await onSubmit?.(values);
            } catch (error) {
                console.error('\u8868\u5355\u63D0\u4EA4\u5931\u8D25:', error);
            } finally {
                setIsSubmitting(false);
            }
        }
    }, [values, validateForm, onSubmit]);

    const getFieldProps = useCallback((name: keyof T) => ({
        name: String(name),
        value: values[name] || '',
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            setFieldValue(name, e.target.value);
        },
        onBlur: () => {
            setFieldTouched(name, true);
            if (validate) {
                const formErrors = validate(values);
                setErrors(prev => ({ ...prev, [name]: formErrors[name] }));
            }
        }
    }), [values, setFieldValue, setFieldTouched, validate]);

    const isValid = Object.keys(errors).length === 0;

    return {
        values,
        errors,
        touched,
        isSubmitting,
        isValid,
        setFieldValue,
        setFieldTouched,
        handleSubmit,
        getFieldProps
    };
}

interface LoginForm {
    email: string;
    password: string;
    rememberMe: boolean;
}

export default function FormDemo() {
    const [submitResult, setSubmitResult] = useState<string>('');

    const form = useSimpleForm<LoginForm>({
        initialValues: {
            email: '',
            password: '',
            rememberMe: false
        },
        validate: (values) => {
            const errors: Partial<Record<keyof LoginForm, string>> = {};

            if (!values.email?.trim()) {
                errors.email = '\u90AE\u7BB1\u4E0D\u80FD\u4E3A\u7A7A';
            } else if (!/\\S+@\\S+\\.\\S+/.test(values.email)) {
                errors.email = '\u90AE\u7BB1\u683C\u5F0F\u4E0D\u6B63\u786E';
            }

            if (!values.password?.trim()) {
                errors.password = '\u5BC6\u7801\u4E0D\u80FD\u4E3A\u7A7A';
            } else if (values.password.length < 6) {
                errors.password = '\u5BC6\u7801\u957F\u5EA6\u81F3\u5C116\u4F4D';
            }

            return errors;
        },
        onSubmit: async (values) => {
            // \u6A21\u62DF\u767B\u5F55API\u8C03\u7528
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (values.email === 'demo@example.com' && values.password === '123456') {
                setSubmitResult('\u2705 \u767B\u5F55\u6210\u529F\uFF01\u6B22\u8FCE\u56DE\u6765\uFF01');
            } else {
                setSubmitResult('\u274C \u767B\u5F55\u5931\u8D25\uFF1A\u90AE\u7BB1\u6216\u5BC6\u7801\u9519\u8BEF');
            }
        }
    });

    const handleReset = () => {
        form.setFieldValue('email', '');
        form.setFieldValue('password', '');
        form.setFieldValue('rememberMe', false);
        setSubmitResult('');
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
            <h4>\u{1F4DD} \u8868\u5355\u72B6\u6001\u7BA1\u7406\u6F14\u793A</h4>

            <form onSubmit={form.handleSubmit} style={{ maxWidth: '400px' }}>
                {/* \u90AE\u7BB1\u5B57\u6BB5 */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                        \u90AE\u7BB1\u5730\u5740 *
                    </label>
                    <input
                        {...form.getFieldProps('email')}
                        type="email"
                        placeholder="\u8BF7\u8F93\u5165\u90AE\u7BB1\u5730\u5740"
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: \`1px solid \${form.touched.email && form.errors.email ? '#ff4d4f' : '#ccc'}\`,
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                    />
                    {form.touched.email && form.errors.email && (
                        <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                            {form.errors.email}
                        </div>
                    )}
                </div>

                {/* \u5BC6\u7801\u5B57\u6BB5 */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                        \u5BC6\u7801 *
                    </label>
                    <input
                        {...form.getFieldProps('password')}
                        type="password"
                        placeholder="\u8BF7\u8F93\u5165\u5BC6\u7801"
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: \`1px solid \${form.touched.password && form.errors.password ? '#ff4d4f' : '#ccc'}\`,
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                    />
                    {form.touched.password && form.errors.password && (
                        <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                            {form.errors.password}
                        </div>
                    )}
                </div>

                {/* \u8BB0\u4F4F\u6211 */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                            type="checkbox"
                            checked={form.values.rememberMe}
                            onChange={(e) => form.setFieldValue('rememberMe', e.target.checked)}
                            style={{ marginRight: '8px' }}
                        />
                        \u8BB0\u4F4F\u6211
                    </label>
                </div>

                {/* \u63D0\u4EA4\u6309\u94AE */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <button
                        type="submit"
                        disabled={form.isSubmitting || !form.isValid}
                        style={{
                            padding: '10px 20px',
                            background: form.isSubmitting || !form.isValid ? '#f5f5f5' : '#1890ff',
                            color: form.isSubmitting || !form.isValid ? '#999' : 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: form.isSubmitting || !form.isValid ? 'not-allowed' : 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        {form.isSubmitting ? '\u767B\u5F55\u4E2D...' : '\u767B\u5F55'}
                    </button>

                    <button
                        type="button"
                        onClick={handleReset}
                        style={{
                            padding: '10px 20px',
                            background: 'transparent',
                            color: '#666',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        \u91CD\u7F6E
                    </button>
                </div>
            </form>

            {/* \u72B6\u6001\u663E\u793A */}
            <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                <h5 style={{ margin: '0 0 12px 0' }}>\u8868\u5355\u72B6\u6001\uFF1A</h5>
                <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                    <div><strong>\u8868\u5355\u503C\uFF1A</strong> {JSON.stringify(form.values, null, 2)}</div>
                    <div style={{ marginTop: '8px' }}><strong>\u9A8C\u8BC1\u9519\u8BEF\uFF1A</strong> {JSON.stringify(form.errors, null, 2)}</div>
                    <div style={{ marginTop: '8px' }}><strong>\u5B57\u6BB5\u72B6\u6001\uFF1A</strong> {JSON.stringify(form.touched, null, 2)}</div>
                    <div style={{ marginTop: '8px' }}><strong>\u8868\u5355\u6709\u6548\uFF1A</strong> {form.isValid ? 'true' : 'false'}</div>
                    <div style={{ marginTop: '8px' }}><strong>\u63D0\u4EA4\u4E2D\uFF1A</strong> {form.isSubmitting ? 'true' : 'false'}</div>
                </div>
            </div>

            {/* \u63D0\u4EA4\u7ED3\u679C */}
            {submitResult && (
                <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: submitResult.includes('\u6210\u529F') ? '#f6ffed' : '#fff2f0',
                    border: \`1px solid \${submitResult.includes('\u6210\u529F') ? '#b7eb8f' : '#ffb3b3'}\`,
                    borderRadius: '4px',
                    color: submitResult.includes('\u6210\u529F') ? '#52c41a' : '#ff4d4f'
                }}>
                    {submitResult}
                </div>
            )}

            <div style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
                \u{1F4A1} \u63D0\u793A\uFF1A\u5C1D\u8BD5\u8F93\u5165 demo@example.com / 123456 \u8FDB\u884C\u767B\u5F55\u6D4B\u8BD5\uFF01
            </div>
        </div>
    );
} `},64464:function(dn,I){I.Z=`import { useCallback, useEffect, useState } from 'react';

// \u7B80\u5316\u7684 useNetworkStatus \u5B9E\u73B0
function useSimpleNetworkStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [downlink, setDownlink] = useState<number | undefined>();
    const [effectiveType, setEffectiveType] = useState<string | undefined>();
    const [reconnectAttempts, setReconnectAttempts] = useState(0);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setReconnectAttempts(0);
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // \u5C1D\u8BD5\u83B7\u53D6\u7F51\u7EDC\u8FDE\u63A5\u4FE1\u606F
        if ('connection' in navigator) {
            const connection = (navigator as any).connection;
            setDownlink(connection?.downlink);
            setEffectiveType(connection?.effectiveType);

            const handleConnectionChange = () => {
                setDownlink(connection?.downlink);
                setEffectiveType(connection?.effectiveType);
            };

            connection?.addEventListener('change', handleConnectionChange);

            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
                connection?.removeEventListener('change', handleConnectionChange);
            };
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const reconnect = useCallback(async () => {
        setReconnectAttempts(prev => prev + 1);

        try {
            // \u6A21\u62DF\u91CD\u8FDE\u5C1D\u8BD5
            const response = await fetch('/api/ping', {
                method: 'HEAD',
                cache: 'no-cache'
            });

            if (response.ok) {
                setIsOnline(true);
                setReconnectAttempts(0);
            }
        } catch (error) {
            console.log('\u91CD\u8FDE\u5931\u8D25:', error);
        }
    }, []);

    const getNetworkQuality = () => {
        if (!isOnline) return { label: '\u79BB\u7EBF', color: '#ff4d4f' };
        if (!effectiveType) return { label: '\u672A\u77E5', color: '#faad14' };

        switch (effectiveType) {
            case 'slow-2g':
            case '2g':
                return { label: '\u6162\u901F\u7F51\u7EDC', color: '#ff4d4f' };
            case '3g':
                return { label: '\u4E2D\u901F\u7F51\u7EDC', color: '#faad14' };
            case '4g':
                return { label: '\u9AD8\u901F\u7F51\u7EDC', color: '#52c41a' };
            default:
                return { label: '\u826F\u597D', color: '#52c41a' };
        }
    };

    return {
        isOnline,
        downlink,
        effectiveType,
        reconnectAttempts,
        reconnect,
        networkQuality: getNetworkQuality()
    };
}

export default function NetworkStatusDemo() {
    const {
        isOnline,
        downlink,
        effectiveType,
        reconnectAttempts,
        reconnect,
        networkQuality
    } = useSimpleNetworkStatus();

    const [logs, setLogs] = useState<string[]>([]);
    const [isSimulatingOffline, setIsSimulatingOffline] = useState(false);

    // \u8BB0\u5F55\u7F51\u7EDC\u72B6\u6001\u53D8\u5316
    useEffect(() => {
        const timestamp = new Date().toLocaleTimeString();
        const status = isOnline ? '\u5728\u7EBF' : '\u79BB\u7EBF';
        const message = \`[\${timestamp}] \u7F51\u7EDC\u72B6\u6001: \${status}\`;

        setLogs(prev => [message, ...prev].slice(0, 10)); // \u4FDD\u7559\u6700\u8FD110\u6761\u8BB0\u5F55
    }, [isOnline]);

    const simulateOffline = () => {
        setIsSimulatingOffline(true);

        // \u6A21\u62DF\u7F51\u7EDC\u4E2D\u65AD
        window.dispatchEvent(new Event('offline'));

        setTimeout(() => {
            window.dispatchEvent(new Event('online'));
            setIsSimulatingOffline(false);
        }, 3000);
    };

    const clearLogs = () => {
        setLogs([]);
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
            <h4>\u{1F310} \u7F51\u7EDC\u72B6\u6001\u76D1\u63A7\u6F14\u793A</h4>

            {/* \u7F51\u7EDC\u72B6\u6001\u5361\u7247 */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '20px'
            }}>
                {/* \u8FDE\u63A5\u72B6\u6001 */}
                <div style={{
                    padding: '16px',
                    background: isOnline ? '#f6ffed' : '#fff2f0',
                    border: \`1px solid \${isOnline ? '#b7eb8f' : '#ffb3b3'}\`,
                    borderRadius: '8px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '8px'
                    }}>
                        <span style={{ fontSize: '24px', marginRight: '8px' }}>
                            {isOnline ? '\u{1F7E2}' : '\u{1F534}'}
                        </span>
                        <span style={{ fontWeight: 'bold' }}>
                            {isOnline ? '\u5728\u7EBF' : '\u79BB\u7EBF'}
                        </span>
                    </div>
                    {reconnectAttempts > 0 && (
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            \u91CD\u8FDE\u5C1D\u8BD5: {reconnectAttempts} \u6B21
                        </div>
                    )}
                </div>

                {/* \u7F51\u7EDC\u8D28\u91CF */}
                <div style={{
                    padding: '16px',
                    background: '#f0f2f5',
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '8px'
                    }}>
                        <span style={{ fontSize: '24px', marginRight: '8px' }}>\u{1F4CA}</span>
                        <span style={{ fontWeight: 'bold' }}>\u7F51\u7EDC\u8D28\u91CF</span>
                    </div>
                    <div style={{ color: networkQuality.color, fontWeight: 'bold' }}>
                        {networkQuality.label}
                    </div>
                    {effectiveType && (
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            \u7C7B\u578B: {effectiveType}
                        </div>
                    )}
                </div>

                {/* \u8FDE\u63A5\u901F\u5EA6 */}
                <div style={{
                    padding: '16px',
                    background: '#f0f2f5',
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '8px'
                    }}>
                        <span style={{ fontSize: '24px', marginRight: '8px' }}>\u26A1</span>
                        <span style={{ fontWeight: 'bold' }}>\u4E0B\u8F7D\u901F\u5EA6</span>
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                        {downlink ? \`\${downlink} Mbps\` : '\u672A\u77E5'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        \u4F30\u7B97\u5E26\u5BBD
                    </div>
                </div>
            </div>

            {/* \u64CD\u4F5C\u6309\u94AE */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <button
                    onClick={reconnect}
                    disabled={isOnline}
                    style={{
                        padding: '8px 16px',
                        background: isOnline ? '#f5f5f5' : '#1890ff',
                        color: isOnline ? '#999' : 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isOnline ? 'not-allowed' : 'pointer'
                    }}
                >
                    {reconnectAttempts > 0 ? \`\u91CD\u8FDE\u4E2D... (\${reconnectAttempts})\` : '\u624B\u52A8\u91CD\u8FDE'}
                </button>

                <button
                    onClick={simulateOffline}
                    disabled={isSimulatingOffline}
                    style={{
                        padding: '8px 16px',
                        background: isSimulatingOffline ? '#f5f5f5' : '#faad14',
                        color: isSimulatingOffline ? '#999' : 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isSimulatingOffline ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isSimulatingOffline ? '\u6A21\u62DF\u4E2D...' : '\u6A21\u62DF\u79BB\u7EBF'}
                </button>

                <button
                    onClick={clearLogs}
                    style={{
                        padding: '8px 16px',
                        background: 'transparent',
                        color: '#666',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    \u6E05\u9664\u65E5\u5FD7
                </button>
            </div>

            {/* \u7F51\u7EDC\u72B6\u6001\u6307\u793A\u5668 */}
            {!isOnline && (
                <div style={{
                    padding: '12px',
                    background: '#fff2f0',
                    border: '1px solid #ffb3b3',
                    borderRadius: '4px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <span style={{ color: '#ff4d4f' }}>
                        \u26A0\uFE0F \u7F51\u7EDC\u8FDE\u63A5\u5DF2\u65AD\u5F00\uFF0C\u67D0\u4E9B\u529F\u80FD\u53EF\u80FD\u65E0\u6CD5\u4F7F\u7528
                    </span>
                    <button
                        onClick={reconnect}
                        style={{
                            padding: '4px 8px',
                            background: '#ff4d4f',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        \u91CD\u65B0\u8FDE\u63A5
                    </button>
                </div>
            )}

            {/* \u72B6\u6001\u65E5\u5FD7 */}
            <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                <h5 style={{ margin: '0 0 12px 0' }}>\u72B6\u6001\u65E5\u5FD7\uFF1A</h5>
                <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                }}>
                    {logs.length > 0 ? (
                        logs.map((log, index) => (
                            <div key={index} style={{
                                padding: '4px 0',
                                borderBottom: index < logs.length - 1 ? '1px solid #eee' : 'none'
                            }}>
                                {log}
                            </div>
                        ))
                    ) : (
                        <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                            \u6682\u65E0\u65E5\u5FD7\u8BB0\u5F55
                        </div>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
                \u{1F4A1} \u63D0\u793A\uFF1A\u5C1D\u8BD5\u65AD\u5F00\u7F51\u7EDC\u8FDE\u63A5\u6216\u70B9\u51FB"\u6A21\u62DF\u79BB\u7EBF"\u6309\u94AE\u6765\u6D4B\u8BD5\u7F51\u7EDC\u72B6\u6001\u76D1\u63A7\u529F\u80FD\uFF01
            </div>
        </div>
    );
} `},41180:function(dn,I){I.Z=`import { useEffect, useState } from 'react';

// \u672C\u5730\u5B9E\u73B0\u7B80\u5355\u7684\u9632\u6296 hook
function useSimpleDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function SimpleDemo() {
    const [inputValue, setInputValue] = useState('');
    const [searchCount, setSearchCount] = useState(0);

    // \u4F7F\u7528\u7B80\u5355\u9632\u6296\uFF0C\u5EF6\u8FDF 500ms
    const debouncedValue = useSimpleDebounce(inputValue, 500);

    // \u6A21\u62DF\u641C\u7D22API\u8C03\u7528
    useEffect(() => {
        if (debouncedValue) {
            setSearchCount(prev => prev + 1);
            console.log('\u6A21\u62DFAPI\u8C03\u7528\uFF1A', debouncedValue);
        }
    }, [debouncedValue]);

    return (
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', margin: '20px 0' }}>
            <h4>\u{1F50D} \u7B80\u5355\u9632\u6296\u6F14\u793A</h4>
            <div style={{ marginBottom: '16px' }}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="\u8F93\u5165\u641C\u7D22\u5173\u952E\u8BCD..."
                    style={{
                        width: '300px',
                        padding: '8px 12px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '14px'
                    }}
                />
            </div>

            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
                <p><strong>\u5B9E\u65F6\u8F93\u5165\u503C\uFF1A</strong> {inputValue || '(\u7A7A)'}</p>
                <p><strong>\u9632\u6296\u540E\u7684\u503C\uFF1A</strong> {debouncedValue || '(\u7A7A)'}</p>
                <p><strong>\u6A21\u62DFAPI\u8C03\u7528\u6B21\u6570\uFF1A</strong> {searchCount}</p>
            </div>

            <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
                \u{1F4A1} \u63D0\u793A\uFF1A\u5FEB\u901F\u8F93\u5165\u6587\u5B57\uFF0C\u89C2\u5BDF\u9632\u6296\u6548\u679C\uFF01API\u8C03\u7528\u53EA\u5728\u505C\u6B62\u8F93\u5165500ms\u540E\u89E6\u53D1\u3002
            </div>
        </div>
    );
} `},66736:function(dn,I){I.Z=`// \u8BA4\u8BC1\u76F8\u5173
export { AuthProvider, useAuth } from './useAuth';
export type { AuthContextType, AuthState, User } from './useAuth';

// \u9632\u6296\u76F8\u5173
export { useDebounce, useDebouncedCallback } from './useDebounce';

// \u5BA2\u6237\u7AEF\u76F8\u5173
export { useClientSide, useClientSideEffect, useClientState } from './useClientSide';

// \u7F16\u8F91\u5668\u76F8\u5173
export { useEditor } from './useEditor';
export type { EditorComponent, EditorState } from './useEditor';

// \u5F02\u6B65\u64CD\u4F5C\u76F8\u5173
export { useAsync } from './useAsync';
export type { UseAsyncOptions, UseAsyncReturn } from './useAsync';

// \u7F51\u7EDC\u72B6\u6001\u76F8\u5173
export { useNetworkStatus } from './useNetworkStatus';
export type { UseNetworkStatusOptions, UseNetworkStatusReturn } from './useNetworkStatus';

// \u8868\u5355\u76F8\u5173
export { useForm } from './useForm';
export type { UseFormOptions, UseFormReturn } from './useForm';

// \u672C\u5730\u5B58\u50A8\u76F8\u5173
export { useLocalStorage } from './useLocalStorage';
export type { UseLocalStorageOptions } from './useLocalStorage';

// \u7A97\u53E3\u5927\u5C0F\u76F8\u5173
export { useWindowSize } from './useWindowSize';
export type { UseWindowSizeOptions, WindowSize } from './useWindowSize';

// API\u8BF7\u6C42\u76F8\u5173
export { useApi } from './useApi';
export type { UseApiOptions, UseApiReturn } from './useApi';

// \u7248\u672C\u4FE1\u606F
export const version = '1.0.0'; `}}]);
