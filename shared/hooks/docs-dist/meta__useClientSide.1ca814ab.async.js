"use strict";(self.webpackChunk_corn12138_hooks=self.webpackChunk_corn12138_hooks||[]).push([[501],{347:function(e,t,n){n.r(t),n.d(t,{demos:function(){return u}});var o=n(44194),u={}},58403:function(e,t,n){n.r(t),n.d(t,{texts:function(){return o}});const o=[{value:"\u5BA2\u6237\u7AEF\u6E32\u67D3\u76F8\u5173\u7684Hooks\uFF0C\u4E3B\u8981\u7528\u4E8E\u89E3\u51B3SSR/SSG\u73AF\u5883\u4E0B\u7684\u95EE\u9898\u3002",paraId:0,tocIndex:0},{value:"\u68C0\u6D4B\u5F53\u524D\u662F\u5426\u5728\u5BA2\u6237\u7AEF\u73AF\u5883\u3002",paraId:1,tocIndex:1},{value:`import { useClientSide } from '@ai-code/hooks';

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
