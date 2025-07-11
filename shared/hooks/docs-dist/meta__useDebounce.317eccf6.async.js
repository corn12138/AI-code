"use strict";(self.webpackChunk_corn12138_hooks=self.webpackChunk_corn12138_hooks||[]).push([[286],{48995:function(o,a,e){e.r(a),e.d(a,{demos:function(){return d}});var n=e(44194),d={}},58966:function(o,a,e){e.r(a),e.d(a,{texts:function(){return n}});const n=[{value:"\u9632\u6296Hook\uFF0C\u7528\u4E8E\u5EF6\u8FDF\u6267\u884C\u503C\u7684\u66F4\u65B0\u6216\u56DE\u8C03\u51FD\u6570\u3002",paraId:0,tocIndex:0},{value:"\u5EF6\u8FDF\u66F4\u65B0\u503C\uFF0C\u5E38\u7528\u4E8E\u641C\u7D22\u8F93\u5165\u7B49\u573A\u666F\u3002",paraId:1,tocIndex:1},{value:`import { useState, useEffect } from 'react';
import { useDebounce } from '@ai-code/hooks';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // \u53EA\u6709\u5F53\u7528\u6237\u505C\u6B62\u8F93\u5165500ms\u540E\u624D\u4F1A\u89E6\u53D1\u641C\u7D22
  useEffect(() => {
    if (debouncedSearchTerm) {
      // \u6267\u884C\u641C\u7D22
      console.log('\u641C\u7D22:', debouncedSearchTerm);
      // \u8FD9\u91CC\u53EF\u4EE5\u8C03\u7528\u5B9E\u9645\u7684\u641C\u7D22API
      // fetch(\`/api/search?q=\${debouncedSearchTerm}\`)
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="\u641C\u7D22..."
    />
  );
}
`,paraId:2,tocIndex:1},{value:"\u9632\u6296\u56DE\u8C03\u51FD\u6570\u3002",paraId:3,tocIndex:2},{value:`import { useDebouncedCallback } from '@ai-code/hooks';

function FormComponent() {
  const debouncedSave = useDebouncedCallback(
    (formData) => {
      // \u4FDD\u5B58\u8868\u5355\u6570\u636E
      console.log('\u4FDD\u5B58\u8868\u5355\u6570\u636E:', formData);
      // \u8FD9\u91CC\u53EF\u4EE5\u8C03\u7528\u5B9E\u9645\u7684\u4FDD\u5B58API
      // fetch('/api/save', { method: 'POST', body: JSON.stringify(formData) })
    },
    1000
  );

  return (
    <form>
      <input onChange={(e) => debouncedSave({ field: e.target.value })} />
    </form>
  );
}
`,paraId:4,tocIndex:2},{value:"\u53C2\u6570",paraId:5,tocIndex:4},{value:"\u7C7B\u578B",paraId:5,tocIndex:4},{value:"\u63CF\u8FF0",paraId:5,tocIndex:4},{value:"value",paraId:5,tocIndex:4},{value:"T",paraId:5,tocIndex:4},{value:"\u9700\u8981\u9632\u6296\u7684\u503C",paraId:5,tocIndex:4},{value:"delay",paraId:5,tocIndex:4},{value:"number",paraId:5,tocIndex:4},{value:"\u5EF6\u8FDF\u65F6\u95F4\uFF08\u6BEB\u79D2\uFF09",paraId:5,tocIndex:4},{value:"\u53C2\u6570",paraId:6,tocIndex:5},{value:"\u7C7B\u578B",paraId:6,tocIndex:5},{value:"\u63CF\u8FF0",paraId:6,tocIndex:5},{value:"callback",paraId:6,tocIndex:5},{value:"Function",paraId:6,tocIndex:5},{value:"\u9700\u8981\u9632\u6296\u7684\u56DE\u8C03\u51FD\u6570",paraId:6,tocIndex:5},{value:"delay",paraId:6,tocIndex:5},{value:"number",paraId:6,tocIndex:5},{value:"\u5EF6\u8FDF\u65F6\u95F4\uFF08\u6BEB\u79D2\uFF09",paraId:6,tocIndex:5},{value:"deps",paraId:6,tocIndex:5},{value:"Array",paraId:6,tocIndex:5},{value:"\u4F9D\u8D56\u6570\u7EC4",paraId:6,tocIndex:5}]}}]);
