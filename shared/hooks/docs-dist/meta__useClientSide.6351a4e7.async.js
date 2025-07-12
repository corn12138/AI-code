"use strict";(self.webpackChunk_corn12138_hooks=self.webpackChunk_corn12138_hooks||[]).push([[501],{347:function(h,c,e){e.r(c),e.d(c,{demos:function(){return P}});var m=e(45332),C=e.n(m),y=e(90819),u=e.n(y),E=e(89933),d=e.n(E),l=e(44194),p=e(68509),P={"src-use-client-side-demo-0":{component:l.memo(l.lazy(d()(u()().mark(function i(){var s,r,o;return u()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return o=function(){var _=r();return l.createElement("div",null,_?l.createElement("div",null,"\u8FD9\u662F\u5BA2\u6237\u7AEF\u5185\u5BB9"):l.createElement("div",null,"\u8FD9\u662F\u670D\u52A1\u7AEF\u5185\u5BB9"))},t.next=3,Promise.resolve().then(e.bind(e,68509));case 3:s=t.sent,r=s.useClientSide;case 5:case"end":return t.stop()}},i)})))),asset:{type:"BLOCK",id:"src-use-client-side-demo-0",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useClientSide } from '@corn12138/hooks';

function MyComponent() {
  const isClient = useClientSide();
  
  return (
    <div>
      {isClient ? (
        <div>\u8FD9\u662F\u5BA2\u6237\u7AEF\u5185\u5BB9</div>
      ) : (
        <div>\u8FD9\u662F\u670D\u52A1\u7AEF\u5185\u5BB9</div>
      )}
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":p},renderOpts:{compile:function(){var i=d()(u()().mark(function r(){var o,a=arguments;return u()().wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,e.e(216).then(e.bind(e,29525));case 2:return n.abrupt("return",(o=n.sent).default.apply(o,a));case 3:case"end":return n.stop()}},r)}));function s(){return i.apply(this,arguments)}return s}()}},"src-use-client-side-demo-1":{component:l.memo(l.lazy(d()(u()().mark(function i(){var s,r,o;return u()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return o=function(){return r(function(){console.log("\u5BA2\u6237\u7AEF\u4EE3\u7801")},[]),l.createElement("div",null,"Browser only content")},t.next=3,Promise.resolve().then(e.bind(e,68509));case 3:s=t.sent,r=s.useClientSideEffect;case 5:case"end":return t.stop()}},i)})))),asset:{type:"BLOCK",id:"src-use-client-side-demo-1",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useClientSideEffect } from '@corn12138/hooks';

function BrowserOnlyComponent() {
  useClientSideEffect(() => {
    // \u8FD9\u4E2A\u4EE3\u7801\u53EA\u5728\u5BA2\u6237\u7AEF\u8FD0\u884C
    console.log('\u5BA2\u6237\u7AEF\u4EE3\u7801');
  }, []);
  
  return <div>Browser only content</div>;
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":p},renderOpts:{compile:function(){var i=d()(u()().mark(function r(){var o,a=arguments;return u()().wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,e.e(216).then(e.bind(e,29525));case 2:return n.abrupt("return",(o=n.sent).default.apply(o,a));case 3:case"end":return n.stop()}},r)}));function s(){return i.apply(this,arguments)}return s}()}},"src-use-client-side-demo-2":{component:l.memo(l.lazy(d()(u()().mark(function i(){var s,r,o;return u()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return o=function(){var _=r(0),f=C()(_,2),v=f[0],g=f[1];return l.createElement("div",null,l.createElement("p",null,"Count: ",v),l.createElement("button",{onClick:function(){return g(v+1)}},"Increment"))},t.next=3,Promise.resolve().then(e.bind(e,68509));case 3:s=t.sent,r=s.useClientState;case 5:case"end":return t.stop()}},i)})))),asset:{type:"BLOCK",id:"src-use-client-side-demo-2",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useClientState } from '@corn12138/hooks';

function StatefulComponent() {
  const [count, setCount] = useClientState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":p},renderOpts:{compile:function(){var i=d()(u()().mark(function r(){var o,a=arguments;return u()().wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,e.e(216).then(e.bind(e,29525));case 2:return n.abrupt("return",(o=n.sent).default.apply(o,a));case 3:case"end":return n.stop()}},r)}));function s(){return i.apply(this,arguments)}return s}()}}}},58403:function(h,c,e){e.r(c),e.d(c,{texts:function(){return m}});const m=[{value:"\u7528\u4E8E\u5728\u5BA2\u6237\u7AEF\u73AF\u5883\u4E2D\u5B89\u5168\u6267\u884C\u4EE3\u7801\u7684 React Hook\u3002",paraId:0,tocIndex:0}]}}]);
