"use strict";(self.webpackChunk_corn12138_hooks=self.webpackChunk_corn12138_hooks||[]).push([[12],{33490:function($,x,t){var T;t.r(x),t.d(x,{demos:function(){return B}});var U=t(10154),N=t.n(U),F=t(73193),y=t.n(F),j=t(76711),A=t.n(j),K=t(90819),l=t.n(K),R=t(45332),S=t.n(R),z=t(89933),h=t.n(z),n=t(44194),P=t(68509),B={"src-use-local-storage-demo-0":{component:n.memo(n.lazy(h()(l()().mark(function u(){var r,o,a;return l()().wrap(function(s){for(;;)switch(s.prev=s.next){case 0:return a=function(){var v=o("myKey","defaultValue"),c=S()(v,2),f=c[0],g=c[1];return n.createElement("div",null,n.createElement("p",null,"Stored value: ",f),n.createElement("button",{onClick:function(){return g("new value")}},"Update Value"))},s.next=3,Promise.resolve().then(t.bind(t,68509));case 3:r=s.sent,o=r.useLocalStorage;case 5:case"end":return s.stop()}},u)})))),asset:{type:"BLOCK",id:"src-use-local-storage-demo-0",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useLocalStorage } from '@corn12138/hooks';

function MyComponent() {
  const [value, setValue] = useLocalStorage('myKey', 'defaultValue');
  
  return (
    <div>
      <p>Stored value: {value}</p>
      <button onClick={() => setValue('new value')}>
        Update Value
      </button>
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":P},renderOpts:{compile:function(){var u=h()(l()().mark(function o(){var a,i=arguments;return l()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.e(216).then(t.bind(t,29525));case 2:return e.abrupt("return",(a=e.sent).default.apply(a,i));case 3:case"end":return e.stop()}},o)}));function r(){return u.apply(this,arguments)}return r}()}},"src-use-local-storage-demo-1":{component:n.memo(n.lazy(h()(l()().mark(function u(){var r,o,a;return l()().wrap(function(s){for(;;)switch(s.prev=s.next){case 0:return a=function(){var v=o("isLoggedIn",!1,{syncAcrossTabs:!0}),c=S()(v,2),f=c[0],g=c[1],I=o("cart",[],{syncAcrossTabs:!0}),p=S()(I,2),m=p[0],d=p[1],C=function(){g(!0)},E=function(){g(!1),d([])},_=function(k){d(function(w){return[].concat(A()(w),[k])})};return n.createElement("div",null,n.createElement("h2",null,"\u8D2D\u7269\u5E94\u7528"),f?n.createElement("div",null,n.createElement("p",null,"\u5DF2\u767B\u5F55 (\u6240\u6709\u6807\u7B7E\u9875\u540C\u6B65)"),n.createElement("p",null,"\u8D2D\u7269\u8F66\u5546\u54C1\u6570: ",m.length),n.createElement("button",{onClick:function(){return _({id:Date.now(),name:"\u5546\u54C1"})}},"\u6DFB\u52A0\u5546\u54C1"),n.createElement("button",{onClick:E},"\u767B\u51FA")):n.createElement("div",null,n.createElement("p",null,"\u672A\u767B\u5F55"),n.createElement("button",{onClick:C},"\u767B\u5F55")))},s.next=3,Promise.resolve().then(t.bind(t,68509));case 3:r=s.sent,o=r.useLocalStorage;case 5:case"end":return s.stop()}},u)})))),asset:{type:"BLOCK",id:"src-use-local-storage-demo-1",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useLocalStorage } from '@corn12138/hooks';

function CrossTabSync() {
  // \u8DE8\u6807\u7B7E\u9875\u540C\u6B65\u7528\u6237\u72B6\u6001
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('isLoggedIn', false, {
    syncAcrossTabs: true  // \u9ED8\u8BA4\u4E3A true
  });

  const [shoppingCart, setShoppingCart] = useLocalStorage('cart', [], {
    syncAcrossTabs: true
  });

  const login = () => {
    setIsLoggedIn(true);
    // \u5176\u4ED6\u6807\u7B7E\u9875\u4F1A\u540C\u6B65\u66F4\u65B0
  };

  const logout = () => {
    setIsLoggedIn(false);
    setShoppingCart([]); // \u6E05\u7A7A\u8D2D\u7269\u8F66
  };

  const addToCart = (item) => {
    setShoppingCart(prev => [...prev, item]);
  };

  return (
    <div>
      <h2>\u8D2D\u7269\u5E94\u7528</h2>
      
      {isLoggedIn ? (
        <div>
          <p>\u5DF2\u767B\u5F55 (\u6240\u6709\u6807\u7B7E\u9875\u540C\u6B65)</p>
          <p>\u8D2D\u7269\u8F66\u5546\u54C1\u6570: {shoppingCart.length}</p>
          
          <button onClick={() => addToCart({ id: Date.now(), name: '\u5546\u54C1' })}>
            \u6DFB\u52A0\u5546\u54C1
          </button>
          
          <button onClick={logout}>\u767B\u51FA</button>
        </div>
      ) : (
        <div>
          <p>\u672A\u767B\u5F55</p>
          <button onClick={login}>\u767B\u5F55</button>
        </div>
      )}
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":P},renderOpts:{compile:function(){var u=h()(l()().mark(function o(){var a,i=arguments;return l()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.e(216).then(t.bind(t,29525));case 2:return e.abrupt("return",(a=e.sent).default.apply(a,i));case 3:case"end":return e.stop()}},o)}));function r(){return u.apply(this,arguments)}return r}()}},"src-use-local-storage-demo-2":{component:n.memo(n.lazy(h()(l()().mark(function u(){var r,o,a,i;return l()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return i=function(){var c=o("compressedData",{items:[]},{serializer:{read:function(d){return JSON.parse(d)},write:function(d){return JSON.stringify(d)}},onError:function(d){console.error("\u5B58\u50A8\u9519\u8BEF:",d)}}),f=S()(c,2),g=f[0],I=f[1],p=function(){I(function(d){return y()(y()({},d),{},{items:[].concat(A()(d.items),[{id:Date.now(),data:Math.random()}])})})};return n.createElement("div",null,n.createElement("h2",null,"\u5927\u6570\u636E\u5B58\u50A8"),n.createElement("p",null,"\u6570\u636E\u9879\u6570\u91CF: ",g.items.length),n.createElement("button",{onClick:p},"\u6DFB\u52A0\u6570\u636E"))},a=function(){var c=o("lastVisit",new Date,{serializer:{read:function(d){return new Date(d)},write:function(d){return d.toISOString()}}}),f=S()(c,2),g=f[0],I=f[1],p=function(){I(new Date)};return n.createElement("div",null,n.createElement("h2",null,"\u8BBF\u95EE\u8BB0\u5F55"),n.createElement("p",null,"\u4E0A\u6B21\u8BBF\u95EE: ",g.toLocaleString()),n.createElement("button",{onClick:p},"\u66F4\u65B0\u8BBF\u95EE\u65F6\u95F4"))},e.next=4,Promise.resolve().then(t.bind(t,68509));case 4:r=e.sent,o=r.useLocalStorage;case 6:case"end":return e.stop()}},u)})))),asset:{type:"BLOCK",id:"src-use-local-storage-demo-2",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useLocalStorage } from '@corn12138/hooks';

// \u81EA\u5B9A\u4E49\u65E5\u671F\u5E8F\u5217\u5316
function DateStorage() {
  const [lastVisit, setLastVisit] = useLocalStorage(
    'lastVisit',
    new Date(),
    {
      serializer: {
        read: (value) => new Date(value),
        write: (value) => value.toISOString()
      }
    }
  );

  const updateVisit = () => {
    setLastVisit(new Date());
  };

  return (
    <div>
      <h2>\u8BBF\u95EE\u8BB0\u5F55</h2>
      <p>\u4E0A\u6B21\u8BBF\u95EE: {lastVisit.toLocaleString()}</p>
      <button onClick={updateVisit}>\u66F4\u65B0\u8BBF\u95EE\u65F6\u95F4</button>
    </div>
  );
}

// \u538B\u7F29\u5B58\u50A8\u5927\u5BF9\u8C61
function CompressedStorage() {
  const [largeData, setLargeData] = useLocalStorage(
    'compressedData',
    { items: [] },
    {
      serializer: {
        read: (value) => {
          // \u53EF\u4EE5\u5728\u8FD9\u91CC\u6DFB\u52A0\u89E3\u538B\u7F29\u903B\u8F91
          return JSON.parse(value);
        },
        write: (value) => {
          // \u53EF\u4EE5\u5728\u8FD9\u91CC\u6DFB\u52A0\u538B\u7F29\u903B\u8F91
          return JSON.stringify(value);
        }
      },
      onError: (error) => {
        console.error('\u5B58\u50A8\u9519\u8BEF:', error);
        // \u53EF\u4EE5\u5728\u8FD9\u91CC\u6DFB\u52A0\u9519\u8BEF\u4E0A\u62A5
      }
    }
  );

  const addItem = () => {
    setLargeData(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), data: Math.random() }]
    }));
  };

  return (
    <div>
      <h2>\u5927\u6570\u636E\u5B58\u50A8</h2>
      <p>\u6570\u636E\u9879\u6570\u91CF: {largeData.items.length}</p>
      <button onClick={addItem}>\u6DFB\u52A0\u6570\u636E</button>
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":P},renderOpts:{compile:function(){var u=h()(l()().mark(function o(){var a,i=arguments;return l()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.e(216).then(t.bind(t,29525));case 2:return e.abrupt("return",(a=e.sent).default.apply(a,i));case 3:case"end":return e.stop()}},o)}));function r(){return u.apply(this,arguments)}return r}()}},"src-use-local-storage-demo-3":{component:n.memo(n.lazy(h()(l()().mark(function u(){var r,o,a;return l()().wrap(function(s){for(;;)switch(s.prev=s.next){case 0:return a=function(){var v=o("sensitiveData",{token:"",preferences:{}},{onError:function(m){console.error("localStorage \u9519\u8BEF:",m),m.name==="QuotaExceededError"?alert("\u5B58\u50A8\u7A7A\u95F4\u4E0D\u8DB3\uFF0C\u8BF7\u6E05\u7406\u6D4F\u89C8\u5668\u6570\u636E"):m.name==="SecurityError"?console.warn("\u65E0\u6CD5\u8BBF\u95EE localStorage\uFF0C\u53EF\u80FD\u5904\u4E8E\u9690\u79C1\u6A21\u5F0F"):console.warn("\u5B58\u50A8\u64CD\u4F5C\u5931\u8D25:",m.message)}}),c=S()(v,2),f=c[0],g=c[1],I=function(m){try{g(function(d){return y()(y()({},d),{},{token:m})})}catch(d){}};return n.createElement("div",null,n.createElement("h2",null,"\u654F\u611F\u6570\u636E\u5B58\u50A8"),n.createElement("p",null,"Token: ",f.token?"\u5DF2\u8BBE\u7F6E":"\u672A\u8BBE\u7F6E"),n.createElement("button",{onClick:function(){return I("new-token-"+Date.now())}},"\u4FDD\u5B58\u65B0Token"))},s.next=3,Promise.resolve().then(t.bind(t,68509));case 3:r=s.sent,o=r.useLocalStorage;case 5:case"end":return s.stop()}},u)})))),asset:{type:"BLOCK",id:"src-use-local-storage-demo-3",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useLocalStorage } from '@corn12138/hooks';

function ErrorHandling() {
  const [sensitiveData, setSensitiveData] = useLocalStorage(
    'sensitiveData',
    { token: '', preferences: {} },
    {
      onError: (error) => {
        console.error('localStorage \u9519\u8BEF:', error);
        
        // \u6839\u636E\u9519\u8BEF\u7C7B\u578B\u5904\u7406
        if (error.name === 'QuotaExceededError') {
          alert('\u5B58\u50A8\u7A7A\u95F4\u4E0D\u8DB3\uFF0C\u8BF7\u6E05\u7406\u6D4F\u89C8\u5668\u6570\u636E');
        } else if (error.name === 'SecurityError') {
          console.warn('\u65E0\u6CD5\u8BBF\u95EE localStorage\uFF0C\u53EF\u80FD\u5904\u4E8E\u9690\u79C1\u6A21\u5F0F');
        } else {
          console.warn('\u5B58\u50A8\u64CD\u4F5C\u5931\u8D25:', error.message);
        }
      }
    }
  );

  const saveToken = (token) => {
    try {
      setSensitiveData(prev => ({ ...prev, token }));
    } catch (error) {
      // \u9519\u8BEF\u4F1A\u901A\u8FC7 onError \u56DE\u8C03\u5904\u7406
    }
  };

  return (
    <div>
      <h2>\u654F\u611F\u6570\u636E\u5B58\u50A8</h2>
      <p>Token: {sensitiveData.token ? '\u5DF2\u8BBE\u7F6E' : '\u672A\u8BBE\u7F6E'}</p>
      <button onClick={() => saveToken('new-token-' + Date.now())}>
        \u4FDD\u5B58\u65B0Token
      </button>
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":P},renderOpts:{compile:function(){var u=h()(l()().mark(function o(){var a,i=arguments;return l()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.e(216).then(t.bind(t,29525));case 2:return e.abrupt("return",(a=e.sent).default.apply(a,i));case 3:case"end":return e.stop()}},o)}));function r(){return u.apply(this,arguments)}return r}()}},"src-use-local-storage-demo-4":{component:n.memo(n.lazy(h()(l()().mark(function u(){var r,o,a,i,s,e;return l()().wrap(function(c){for(;;)switch(c.prev=c.next){case 0:return e=function(){var g=o("formDraft",{name:"",email:"",message:""}),I=S()(g,2),p=I[0],m=I[1],d=i(!0),C=S()(d,2),E=C[0],_=C[1];s(function(){_(!1);var O=setTimeout(function(){return _(!0)},1e3);return function(){return clearTimeout(O)}},[p]);var b=function(L,M){m(function(D){return y()(y()({},D),{},N()({},L,M))})},k=function(){m({name:"",email:"",message:""})},w=function(){var O=h()(l()().mark(function L(){return l()().wrap(function(D){for(;;)switch(D.prev=D.next){case 0:return D.prev=0,D.next=3,fetch("/api/submit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)});case 3:k(),alert("\u63D0\u4EA4\u6210\u529F\uFF01"),D.next=10;break;case 7:D.prev=7,D.t0=D.catch(0),alert("\u63D0\u4EA4\u5931\u8D25\uFF0C\u8349\u7A3F\u5DF2\u4FDD\u5B58");case 10:case"end":return D.stop()}},L,null,[[0,7]])}));return function(){return O.apply(this,arguments)}}();return n.createElement("div",null,n.createElement("h2",null,"\u6301\u4E45\u5316\u8868\u5355"),n.createElement("p",null,"\u72B6\u6001: ",E?"\u5DF2\u4FDD\u5B58":"\u4FDD\u5B58\u4E2D..."),n.createElement("form",{onSubmit:function(L){L.preventDefault(),w()}},n.createElement("div",null,n.createElement("input",{type:"text",placeholder:"\u59D3\u540D",value:p.name,onChange:function(L){return b("name",L.target.value)}})),n.createElement("div",null,n.createElement("input",{type:"email",placeholder:"\u90AE\u7BB1",value:p.email,onChange:function(L){return b("email",L.target.value)}})),n.createElement("div",null,n.createElement("textarea",{placeholder:"\u6D88\u606F",value:p.message,onChange:function(L){return b("message",L.target.value)}})),n.createElement("div",null,n.createElement("button",{type:"submit"},"\u63D0\u4EA4"),n.createElement("button",{type:"button",onClick:k},"\u6E05\u9664\u8349\u7A3F"))))},c.next=3,Promise.resolve().then(t.bind(t,68509));case 3:return r=c.sent,o=r.useLocalStorage,c.next=7,Promise.resolve().then(t.t.bind(t,44194,19));case 7:a=c.sent,i=a.useState,s=a.useEffect;case 10:case"end":return c.stop()}},u)})))),asset:{type:"BLOCK",id:"src-use-local-storage-demo-4",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useLocalStorage } from '@corn12138/hooks';
import { useState, useEffect } from 'react';

function PersistentForm() {
  // \u6301\u4E45\u5316\u8868\u5355\u6570\u636E
  const [formData, setFormData] = useLocalStorage('formDraft', {
    name: '',
    email: '',
    message: ''
  });

  const [isSaved, setIsSaved] = useState(true);

  // \u76D1\u542C\u8868\u5355\u53D8\u5316
  useEffect(() => {
    setIsSaved(false);
    const timer = setTimeout(() => setIsSaved(true), 1000);
    return () => clearTimeout(timer);
  }, [formData]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const clearDraft = () => {
    setFormData({ name: '', email: '', message: '' });
  };

  const submitForm = async () => {
    try {
      // \u63D0\u4EA4\u8868\u5355
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      // \u6210\u529F\u540E\u6E05\u9664\u8349\u7A3F
      clearDraft();
      alert('\u63D0\u4EA4\u6210\u529F\uFF01');
    } catch (error) {
      alert('\u63D0\u4EA4\u5931\u8D25\uFF0C\u8349\u7A3F\u5DF2\u4FDD\u5B58');
    }
  };

  return (
    <div>
      <h2>\u6301\u4E45\u5316\u8868\u5355</h2>
      <p>\u72B6\u6001: {isSaved ? '\u5DF2\u4FDD\u5B58' : '\u4FDD\u5B58\u4E2D...'}</p>
      
      <form onSubmit={(e) => { e.preventDefault(); submitForm(); }}>
        <div>
          <input
            type="text"
            placeholder="\u59D3\u540D"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
          />
        </div>
        
        <div>
          <input
            type="email"
            placeholder="\u90AE\u7BB1"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
          />
        </div>
        
        <div>
          <textarea
            placeholder="\u6D88\u606F"
            value={formData.message}
            onChange={(e) => updateField('message', e.target.value)}
          />
        </div>
        
        <div>
          <button type="submit">\u63D0\u4EA4</button>
          <button type="button" onClick={clearDraft}>\u6E05\u9664\u8349\u7A3F</button>
        </div>
      </form>
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"},react:{type:"NPM",value:"18.3.1"}},entry:"index.tsx"},context:{"@corn12138/hooks":P,react:T||(T=t.t(n,2))},renderOpts:{compile:function(){var u=h()(l()().mark(function o(){var a,i=arguments;return l()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.e(216).then(t.bind(t,29525));case 2:return e.abrupt("return",(a=e.sent).default.apply(a,i));case 3:case"end":return e.stop()}},o)}));function r(){return u.apply(this,arguments)}return r}()}},"src-use-local-storage-demo-5":{component:n.memo(n.lazy(h()(l()().mark(function u(){var r;return l()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:r=function(){var s=useLocalStorage("language","zh-CN"),e=S()(s,2),v=e[0],c=e[1],f=useLocalStorage("theme","light"),g=S()(f,2),I=g[0],p=g[1],m=useLocalStorage("sidebarCollapsed",!1),d=S()(m,2),C=d[0],E=d[1];return n.createElement("div",null,n.createElement("select",{value:v,onChange:function(b){return c(b.target.value)}},n.createElement("option",{value:"zh-CN"},"\u4E2D\u6587"),n.createElement("option",{value:"en-US"},"English")),n.createElement("button",{onClick:function(){return p(I==="light"?"dark":"light")}},"\u5207\u6362\u4E3B\u9898"),n.createElement("button",{onClick:function(){return E(!C)}},C?"\u5C55\u5F00":"\u6536\u8D77","\u4FA7\u8FB9\u680F"))};case 1:case"end":return a.stop()}},u)})))),asset:{type:"BLOCK",id:"src-use-local-storage-demo-5",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`function UserSettings() {
  const [language, setLanguage] = useLocalStorage('language', 'zh-CN');
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage('sidebarCollapsed', false);

  return (
    <div>
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="zh-CN">\u4E2D\u6587</option>
        <option value="en-US">English</option>
      </select>
      
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        \u5207\u6362\u4E3B\u9898
      </button>
      
      <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
        {sidebarCollapsed ? '\u5C55\u5F00' : '\u6536\u8D77'}\u4FA7\u8FB9\u680F
      </button>
    </div>
  );
}`}},entry:"index.tsx"},context:{},renderOpts:{compile:function(){var u=h()(l()().mark(function o(){var a,i=arguments;return l()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.e(216).then(t.bind(t,29525));case 2:return e.abrupt("return",(a=e.sent).default.apply(a,i));case 3:case"end":return e.stop()}},o)}));function r(){return u.apply(this,arguments)}return r}()}},"src-use-local-storage-demo-6":{component:n.memo(n.lazy(h()(l()().mark(function u(){var r;return l()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:r=function(){var s=useLocalStorage("cartItems",[]),e=S()(s,2),v=e[0],c=e[1],f=function(m){c(function(d){var C=d.find(function(E){return E.id===m.id});return C?d.map(function(E){return E.id===m.id?y()(y()({},E),{},{quantity:E.quantity+1}):E}):[].concat(A()(d),[y()(y()({},m),{},{quantity:1})])})},g=function(m){c(function(d){return d.filter(function(C){return C.id!==m})})},I=function(){return v.reduce(function(m,d){return m+d.price*d.quantity},0)};return n.createElement("div",null,n.createElement("h2",null,"\u8D2D\u7269\u8F66 (",v.length," \u4EF6\u5546\u54C1)"),n.createElement("p",null,"\u603B\u4EF7: \xA5",I()),v.map(function(p){return n.createElement("div",{key:p.id},n.createElement("span",null,p.name," x ",p.quantity),n.createElement("button",{onClick:function(){return g(p.id)}},"\u5220\u9664"))}))};case 1:case"end":return a.stop()}},u)})))),asset:{type:"BLOCK",id:"src-use-local-storage-demo-6",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`function ShoppingCart() {
  const [items, setItems] = useLocalStorage('cartItems', []);

  const addItem = (product) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div>
      <h2>\u8D2D\u7269\u8F66 ({items.length} \u4EF6\u5546\u54C1)</h2>
      <p>\u603B\u4EF7: \xA5{getTotalPrice()}</p>
      
      {items.map(item => (
        <div key={item.id}>
          <span>{item.name} x {item.quantity}</span>
          <button onClick={() => removeItem(item.id)}>\u5220\u9664</button>
        </div>
      ))}
    </div>
  );
}`}},entry:"index.tsx"},context:{},renderOpts:{compile:function(){var u=h()(l()().mark(function o(){var a,i=arguments;return l()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.e(216).then(t.bind(t,29525));case 2:return e.abrupt("return",(a=e.sent).default.apply(a,i));case 3:case"end":return e.stop()}},o)}));function r(){return u.apply(this,arguments)}return r}()}},"src-use-local-storage-demo-7":{component:n.memo(n.lazy(h()(l()().mark(function u(){var r;return l()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:r=function(){var s=useLocalStorage("gameState",{level:1,score:0,lives:3,achievements:[]}),e=S()(s,2),v=e[0],c=e[1],f=function(p){c(function(m){return y()(y()({},m),p)})},g=function(){c({level:1,score:0,lives:3,achievements:[]})};return n.createElement("div",null,n.createElement("h2",null,"\u6E38\u620F\u5B58\u6863"),n.createElement("p",null,"\u7B49\u7EA7: ",v.level),n.createElement("p",null,"\u5206\u6570: ",v.score),n.createElement("p",null,"\u751F\u547D: ",v.lives),n.createElement("p",null,"\u6210\u5C31: ",v.achievements.length),n.createElement("button",{onClick:function(){return f({score:v.score+100})}},"\u589E\u52A0\u5206\u6570"),n.createElement("button",{onClick:g},"\u91CD\u7F6E\u6E38\u620F"))};case 1:case"end":return a.stop()}},u)})))),asset:{type:"BLOCK",id:"src-use-local-storage-demo-7",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`function GameSave() {
  const [gameState, setGameState] = useLocalStorage('gameState', {
    level: 1,
    score: 0,
    lives: 3,
    achievements: []
  });

  const saveGame = (newState) => {
    setGameState(prev => ({ ...prev, ...newState }));
  };

  const resetGame = () => {
    setGameState({
      level: 1,
      score: 0,
      lives: 3,
      achievements: []
    });
  };

  return (
    <div>
      <h2>\u6E38\u620F\u5B58\u6863</h2>
      <p>\u7B49\u7EA7: {gameState.level}</p>
      <p>\u5206\u6570: {gameState.score}</p>
      <p>\u751F\u547D: {gameState.lives}</p>
      <p>\u6210\u5C31: {gameState.achievements.length}</p>
      
      <button onClick={() => saveGame({ score: gameState.score + 100 })}>
        \u589E\u52A0\u5206\u6570
      </button>
      
      <button onClick={resetGame}>\u91CD\u7F6E\u6E38\u620F</button>
    </div>
  );
}`}},entry:"index.tsx"},context:{},renderOpts:{compile:function(){var u=h()(l()().mark(function o(){var a,i=arguments;return l()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.e(216).then(t.bind(t,29525));case 2:return e.abrupt("return",(a=e.sent).default.apply(a,i));case 3:case"end":return e.stop()}},o)}));function r(){return u.apply(this,arguments)}return r}()}},"src-use-local-storage-demo-8":{component:n.memo(n.lazy(h()(l()().mark(function u(){var r,o,a,i;return l()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:r=useLocalStorage("userProfile",{name:"",age:0},{serializer:{read:function(c){try{var f=JSON.parse(c);if(typeof f.name=="string"&&typeof f.age=="number")return f;throw new Error("Invalid data structure")}catch(g){return{name:"",age:0}}},write:JSON.stringify}}),o=S()(r,2),a=o[0],i=o[1];case 1:case"end":return e.stop()}},u)})))),asset:{type:"BLOCK",id:"src-use-local-storage-demo-8",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`const [userProfile, setUserProfile] = useLocalStorage(
  'userProfile',
  { name: '', age: 0 },
  {
    serializer: {
      read: (value) => {
        try {
          const data = JSON.parse(value);
          // \u9A8C\u8BC1\u6570\u636E\u7ED3\u6784
          if (typeof data.name === 'string' && typeof data.age === 'number') {
            return data;
          }
          throw new Error('Invalid data structure');
        } catch {
          return { name: '', age: 0 }; // \u8FD4\u56DE\u9ED8\u8BA4\u503C
        }
      },
      write: JSON.stringify
    }
  }
);`}},entry:"index.tsx"},context:{},renderOpts:{compile:function(){var u=h()(l()().mark(function o(){var a,i=arguments;return l()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.e(216).then(t.bind(t,29525));case 2:return e.abrupt("return",(a=e.sent).default.apply(a,i));case 3:case"end":return e.stop()}},o)}));function r(){return u.apply(this,arguments)}return r}()}},"src-use-local-storage-demo-9":{component:n.memo(n.lazy(h()(l()().mark(function u(){var r,o,a,i,s;return l()().wrap(function(v){for(;;)switch(v.prev=v.next){case 0:r="1.0",o=useLocalStorage("appData",{version:r,data:{}},{serializer:{read:function(f){var g=JSON.parse(f);return g.version!==r?{version:r,data:{}}:g},write:JSON.stringify}}),a=S()(o,2),i=a[0],s=a[1];case 2:case"end":return v.stop()}},u)})))),asset:{type:"BLOCK",id:"src-use-local-storage-demo-9",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`const STORAGE_VERSION = '1.0';

const [appData, setAppData] = useLocalStorage(
  'appData',
  { version: STORAGE_VERSION, data: {} },
  {
    serializer: {
      read: (value) => {
        const stored = JSON.parse(value);
        if (stored.version !== STORAGE_VERSION) {
          // \u5904\u7406\u7248\u672C\u5347\u7EA7
          return { version: STORAGE_VERSION, data: {} };
        }
        return stored;
      },
      write: JSON.stringify
    }
  }
);`}},entry:"index.tsx"},context:{},renderOpts:{compile:function(){var u=h()(l()().mark(function o(){var a,i=arguments;return l()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.e(216).then(t.bind(t,29525));case 2:return e.abrupt("return",(a=e.sent).default.apply(a,i));case 3:case"end":return e.stop()}},o)}));function r(){return u.apply(this,arguments)}return r}()}},"src-use-local-storage-demo-10":{component:n.memo(n.lazy(h()(l()().mark(function u(){var r,o,a;return l()().wrap(function(s){for(;;)switch(s.prev=s.next){case 0:return a=function(){var v=useLocalStorage("largeData",{}),c=S()(v,2),f=c[0],g=c[1],I=o(g,500),p=function(d){I(d)};return n.createElement("div",null,"/* \u7EC4\u4EF6\u5185\u5BB9 */")},s.next=3,Promise.resolve().then(t.bind(t,68509));case 3:r=s.sent,o=r.useDebouncedCallback;case 5:case"end":return s.stop()}},u)})))),asset:{type:"BLOCK",id:"src-use-local-storage-demo-10",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`// \u5BF9\u4E8E\u5927\u5BF9\u8C61\uFF0C\u4F7F\u7528\u9632\u6296\u4F18\u5316\u5199\u5165
import { useDebouncedCallback } from '@corn12138/hooks';

function OptimizedStorage() {
  const [data, setData] = useLocalStorage('largeData', {});
  
  const debouncedSetData = useDebouncedCallback(setData, 500);
  
  // \u9891\u7E41\u66F4\u65B0\u65F6\u4F7F\u7528\u9632\u6296\u7248\u672C
  const handleDataChange = (newData) => {
    debouncedSetData(newData);
  };

  return <div>/* \u7EC4\u4EF6\u5185\u5BB9 */</div>;
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":P},renderOpts:{compile:function(){var u=h()(l()().mark(function o(){var a,i=arguments;return l()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.e(216).then(t.bind(t,29525));case 2:return e.abrupt("return",(a=e.sent).default.apply(a,i));case 3:case"end":return e.stop()}},o)}));function r(){return u.apply(this,arguments)}return r}()}}}},77568:function($,x,t){t.r(x),t.d(x,{texts:function(){return T}});const T=[{value:"\u7528\u4E8E\u5728\u672C\u5730\u5B58\u50A8\u4E2D\u5B58\u50A8\u548C\u83B7\u53D6\u6570\u636E\u7684 React Hook\u3002",paraId:0,tocIndex:0},{value:"\u53C2\u6570",paraId:1,tocIndex:8},{value:"\u7C7B\u578B",paraId:1,tocIndex:8},{value:"\u5FC5\u586B",paraId:1,tocIndex:8},{value:"\u63CF\u8FF0",paraId:1,tocIndex:8},{value:"key",paraId:1,tocIndex:8},{value:"string",paraId:1,tocIndex:8},{value:"\u2705",paraId:1,tocIndex:8},{value:"localStorage \u952E\u540D",paraId:1,tocIndex:8},{value:"initialValue",paraId:1,tocIndex:8},{value:"T",paraId:1,tocIndex:8},{value:"\u2705",paraId:1,tocIndex:8},{value:"\u521D\u59CB\u503C",paraId:1,tocIndex:8},{value:"options",paraId:1,tocIndex:8},{value:"UseLocalStorageOptions<T>",paraId:1,tocIndex:8},{value:"\u274C",paraId:1,tocIndex:8},{value:"\u914D\u7F6E\u9009\u9879",paraId:1,tocIndex:8},{value:"\u5C5E\u6027",paraId:2,tocIndex:9},{value:"\u7C7B\u578B",paraId:2,tocIndex:9},{value:"\u9ED8\u8BA4\u503C",paraId:2,tocIndex:9},{value:"\u63CF\u8FF0",paraId:2,tocIndex:9},{value:"serializer",paraId:2,tocIndex:9},{value:"{ read: Function, write: Function }",paraId:2,tocIndex:9},{value:"JSON",paraId:2,tocIndex:9},{value:"\u5E8F\u5217\u5316\u914D\u7F6E",paraId:2,tocIndex:9},{value:"syncAcrossTabs",paraId:2,tocIndex:9},{value:"boolean",paraId:2,tocIndex:9},{value:"true",paraId:2,tocIndex:9},{value:"\u662F\u5426\u8DE8\u6807\u7B7E\u9875\u540C\u6B65",paraId:2,tocIndex:9},{value:"onError",paraId:2,tocIndex:9},{value:"(error: Error) => void",paraId:2,tocIndex:9},{value:"console.error",paraId:2,tocIndex:9},{value:"\u9519\u8BEF\u5904\u7406\u56DE\u8C03",paraId:2,tocIndex:9},{value:"\u8FD4\u56DE\u4E00\u4E2A\u6570\u7EC4 ",paraId:3,tocIndex:10},{value:"[value, setValue, removeValue]",paraId:3,tocIndex:10},{value:"\uFF1A",paraId:3,tocIndex:10},{value:"\u7D22\u5F15",paraId:4,tocIndex:10},{value:"\u7C7B\u578B",paraId:4,tocIndex:10},{value:"\u63CF\u8FF0",paraId:4,tocIndex:10},{value:"0",paraId:4,tocIndex:10},{value:"T",paraId:4,tocIndex:10},{value:"\u5F53\u524D\u5B58\u50A8\u7684\u503C",paraId:4,tocIndex:10},{value:"1",paraId:4,tocIndex:10},{value:"(value: T | (prev: T) => T) => void",paraId:4,tocIndex:10},{value:"\u8BBE\u7F6E\u503C\u7684\u51FD\u6570",paraId:4,tocIndex:10},{value:"2",paraId:4,tocIndex:10},{value:"() => void",paraId:4,tocIndex:10},{value:"\u5220\u9664\u503C\u7684\u51FD\u6570",paraId:4,tocIndex:10},{value:"\u5B58\u50A8\u9650\u5236",paraId:5,tocIndex:19},{value:"\uFF1AlocalStorage \u901A\u5E38\u6709 5-10MB \u7684\u5B58\u50A8\u9650\u5236",paraId:5,tocIndex:19},{value:"\u540C\u6B65\u64CD\u4F5C",paraId:5,tocIndex:19},{value:"\uFF1AlocalStorage \u662F\u540C\u6B65 API\uFF0C\u5927\u91CF\u6570\u636E\u53EF\u80FD\u5F71\u54CD\u6027\u80FD",paraId:5,tocIndex:19},{value:"\u9690\u79C1\u6A21\u5F0F",paraId:5,tocIndex:19},{value:"\uFF1A\u67D0\u4E9B\u6D4F\u89C8\u5668\u7684\u9690\u79C1\u6A21\u5F0F\u53EF\u80FD\u7981\u7528 localStorage",paraId:5,tocIndex:19},{value:"\u6570\u636E\u7C7B\u578B",paraId:5,tocIndex:19},{value:"\uFF1A\u53EA\u80FD\u5B58\u50A8\u5B57\u7B26\u4E32\uFF0C\u590D\u6742\u5BF9\u8C61\u9700\u8981\u5E8F\u5217\u5316",paraId:5,tocIndex:19},{value:"\u8DE8\u57DF\u9650\u5236",paraId:5,tocIndex:19},{value:"\uFF1A\u4E0D\u540C\u57DF\u540D\u65E0\u6CD5\u5171\u4EAB localStorage \u6570\u636E",paraId:5,tocIndex:19},{value:"\u751F\u547D\u5468\u671F",paraId:5,tocIndex:19},{value:"\uFF1A\u6570\u636E\u4F1A\u6C38\u4E45\u4FDD\u5B58\uFF0C\u76F4\u5230\u7528\u6237\u624B\u52A8\u6E05\u9664\u6216\u4EE3\u7801\u5220\u9664",paraId:5,tocIndex:19}]}}]);
