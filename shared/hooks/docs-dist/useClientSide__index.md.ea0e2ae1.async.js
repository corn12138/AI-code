"use strict";(self.webpackChunk_corn12138_hooks=self.webpackChunk_corn12138_hooks||[]).push([[852],{66412:function(c,s,e){e.r(s);var d=e(63978),u=e(14023),r=e(3813),m=e(42469),f=e(19341),t=e(9805),h=e(97722),p=e(27804),i=e(46510),o=e(81576),a=e(44194),n=e(58403),_=e(31549);function l(){return(0,_.jsx)(i.dY,{children:(0,_.jsx)(a.Suspense,{fallback:(0,_.jsx)(o.Z,{}),children:(0,_.jsx)(_.Fragment,{children:(0,_.jsxs)("div",{className:"markdown",children:[(0,_.jsxs)("h1",{id:"useclientside",children:[(0,_.jsx)("a",{"aria-hidden":"true",tabIndex:"-1",href:"#useclientside",children:(0,_.jsx)("span",{className:"icon icon-link"})}),"useClientSide"]}),(0,_.jsx)("p",{children:n.texts[0].value}),(0,_.jsxs)("h2",{id:"useclientside-1",children:[(0,_.jsx)("a",{"aria-hidden":"true",tabIndex:"-1",href:"#useclientside-1",children:(0,_.jsx)("span",{className:"icon icon-link"})}),"useClientSide"]}),(0,_.jsx)("p",{children:n.texts[1].value}),(0,_.jsx)(t.Z,{lang:"javascript",children:n.texts[2].value}),(0,_.jsxs)("h2",{id:"useclientsideeffect",children:[(0,_.jsx)("a",{"aria-hidden":"true",tabIndex:"-1",href:"#useclientsideeffect",children:(0,_.jsx)("span",{className:"icon icon-link"})}),"useClientSideEffect"]}),(0,_.jsx)("p",{children:n.texts[3].value}),(0,_.jsx)(t.Z,{lang:"javascript",children:n.texts[4].value}),(0,_.jsxs)("h2",{id:"useclientstate",children:[(0,_.jsx)("a",{"aria-hidden":"true",tabIndex:"-1",href:"#useclientstate",children:(0,_.jsx)("span",{className:"icon icon-link"})}),"useClientState"]}),(0,_.jsx)("p",{children:n.texts[5].value}),(0,_.jsx)(t.Z,{lang:"javascript",children:n.texts[6].value})]})})})})}s.default=l},58403:function(c,s,e){e.r(s),e.d(s,{texts:function(){return d}});const d=[{value:"\u5BA2\u6237\u7AEF\u6E32\u67D3\u76F8\u5173\u7684Hooks\uFF0C\u4E3B\u8981\u7528\u4E8E\u89E3\u51B3SSR/SSG\u73AF\u5883\u4E0B\u7684\u95EE\u9898\u3002",paraId:0,tocIndex:0},{value:"\u68C0\u6D4B\u5F53\u524D\u662F\u5426\u5728\u5BA2\u6237\u7AEF\u73AF\u5883\u3002",paraId:1,tocIndex:1},{value:`import { useClientSide } from '@ai-code/hooks';

function MyComponent() {
  const isClient = useClientSide();

  return (
    <div>
      {isClient ? (
        <div>
          <p>\u8FD9\u662F\u5BA2\u6237\u7AEF\u7EC4\u4EF6</p>
          <button onClick={() => alert('\u5BA2\u6237\u7AEF\u4EA4\u4E92')}>\u70B9\u51FB\u6211</button>
        </div>
      ) : (
        <div>\u670D\u52A1\u7AEF\u6E32\u67D3\u5360\u4F4D\u7B26</div>
      )}
    </div>
  );
}
`,paraId:2,tocIndex:1},{value:"\u53EA\u5728\u5BA2\u6237\u7AEF\u6267\u884C\u526F\u4F5C\u7528\u3002",paraId:3,tocIndex:2},{value:`import { useClientSideEffect } from '@ai-code/hooks';

function MyComponent() {
  useClientSideEffect(() => {
    // \u53EA\u5728\u5BA2\u6237\u7AEF\u6267\u884C
    const timer = setInterval(() => {
      console.log('\u5BA2\u6237\u7AEF\u5B9A\u65F6\u5668');
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <div>\u7EC4\u4EF6\u5185\u5BB9</div>;
}
`,paraId:4,tocIndex:2},{value:"\u5BA2\u6237\u7AEF\u72B6\u6001\u7BA1\u7406\u3002",paraId:5,tocIndex:3},{value:`import { useClientState } from '@ai-code/hooks';

function MyComponent() {
  const [count, setCount] = useClientState(0);

  return (
    <div>
      <p>\u8BA1\u6570: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        \u589E\u52A0
      </button>
    </div>
  );
}
`,paraId:6,tocIndex:3}]}}]);
