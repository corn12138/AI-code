"use strict";(self.webpackChunk_corn12138_hooks=self.webpackChunk_corn12138_hooks||[]).push([[286],{48995:function(C,c,e){e.r(c),e.d(c,{demos:function(){return S}});var I=e(10154),T=e.n(I),O=e(73193),g=e.n(O),A=e(90819),u=e.n(A),x=e(45332),E=e.n(x),M=e(89933),v=e.n(M),s=e(44194),y=e(68509),S={"src-use-debounce-demo-0":{component:s.memo(s.lazy(v()(u()().mark(function l(){var t,r,o;return u()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return o=function(){var f=useState(""),p=E()(f,2),d=p[0],D=p[1],i=r(d,500);return useEffect(function(){i&&console.log("\u641C\u7D22:",i)},[i]),s.createElement("input",{type:"text",value:d,onChange:function(_){return D(_.target.value)},placeholder:"\u8F93\u5165\u641C\u7D22\u5185\u5BB9..."})},a.next=3,Promise.resolve().then(e.bind(e,68509));case 3:t=a.sent,r=t.useDebounce;case 5:case"end":return a.stop()}},l)})))),asset:{type:"BLOCK",id:"src-use-debounce-demo-0",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useDebounce } from '@corn12138/hooks';

function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  useEffect(() => {
    if (debouncedSearchTerm) {
      // \u6267\u884C\u641C\u7D22\u8BF7\u6C42
      console.log('\u641C\u7D22:', debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);
  
  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="\u8F93\u5165\u641C\u7D22\u5185\u5BB9..."
    />
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":y},renderOpts:{compile:function(){var l=v()(u()().mark(function r(){var o,m=arguments;return u()().wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,e.e(216).then(e.bind(e,29525));case 2:return n.abrupt("return",(o=n.sent).default.apply(o,m));case 3:case"end":return n.stop()}},r)}));function t(){return l.apply(this,arguments)}return t}()}},"src-use-debounce-demo-1":{component:s.memo(s.lazy(v()(u()().mark(function l(){var t,r,o;return u()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return o=function(){var f=useState({name:"",email:""}),p=E()(f,2),d=p[0],D=p[1],i=r(function(_){console.log("\u4FDD\u5B58\u8868\u5355:",_)},1e3),b=function(h,j){var P=g()(g()({},d),{},T()({},h,j));D(P),i(P)};return s.createElement("form",null,s.createElement("input",{type:"text",value:d.name,onChange:function(h){return b("name",h.target.value)},placeholder:"\u59D3\u540D"}),s.createElement("input",{type:"email",value:d.email,onChange:function(h){return b("email",h.target.value)},placeholder:"\u90AE\u7BB1"}))},a.next=3,Promise.resolve().then(e.bind(e,68509));case 3:t=a.sent,r=t.useDebouncedCallback;case 5:case"end":return a.stop()}},l)})))),asset:{type:"BLOCK",id:"src-use-debounce-demo-1",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useDebouncedCallback } from '@corn12138/hooks';

function FormComponent() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  
  const debouncedSave = useDebouncedCallback((data) => {
    // \u81EA\u52A8\u4FDD\u5B58\u8868\u5355\u6570\u636E
    console.log('\u4FDD\u5B58\u8868\u5355:', data);
  }, 1000);
  
  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    debouncedSave(newData);
  };
  
  return (
    <form>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        placeholder="\u59D3\u540D"
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        placeholder="\u90AE\u7BB1"
      />
    </form>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":y},renderOpts:{compile:function(){var l=v()(u()().mark(function r(){var o,m=arguments;return u()().wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,e.e(216).then(e.bind(e,29525));case 2:return n.abrupt("return",(o=n.sent).default.apply(o,m));case 3:case"end":return n.stop()}},r)}));function t(){return l.apply(this,arguments)}return t}()}}}},58966:function(C,c,e){e.r(c),e.d(c,{texts:function(){return I}});const I=[{value:"\u7528\u4E8E\u9632\u6296\u5904\u7406\u7684 React Hook\u3002",paraId:0,tocIndex:0},{value:"\u53C2\u6570",paraId:1,tocIndex:4},{value:"\u7C7B\u578B",paraId:1,tocIndex:4},{value:"\u63CF\u8FF0",paraId:1,tocIndex:4},{value:"value",paraId:1,tocIndex:4},{value:"T",paraId:1,tocIndex:4},{value:"\u9700\u8981\u9632\u6296\u7684\u503C",paraId:1,tocIndex:4},{value:"delay",paraId:1,tocIndex:4},{value:"number",paraId:1,tocIndex:4},{value:"\u5EF6\u8FDF\u65F6\u95F4\uFF08\u6BEB\u79D2\uFF09",paraId:1,tocIndex:4},{value:"\u53C2\u6570",paraId:2,tocIndex:5},{value:"\u7C7B\u578B",paraId:2,tocIndex:5},{value:"\u63CF\u8FF0",paraId:2,tocIndex:5},{value:"callback",paraId:2,tocIndex:5},{value:"Function",paraId:2,tocIndex:5},{value:"\u9700\u8981\u9632\u6296\u7684\u56DE\u8C03\u51FD\u6570",paraId:2,tocIndex:5},{value:"delay",paraId:2,tocIndex:5},{value:"number",paraId:2,tocIndex:5},{value:"\u5EF6\u8FDF\u65F6\u95F4\uFF08\u6BEB\u79D2\uFF09",paraId:2,tocIndex:5},{value:"deps",paraId:2,tocIndex:5},{value:"Array",paraId:2,tocIndex:5},{value:"\u4F9D\u8D56\u6570\u7EC4",paraId:2,tocIndex:5}]}}]);
