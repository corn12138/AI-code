"use strict";(self.webpackChunk_corn12138_hooks=self.webpackChunk_corn12138_hooks||[]).push([[305],{11673:function(P,x,n){n.r(x),n.d(x,{demos:function(){return k}});var I=n(90819),d=n.n(I),_=n(89933),m=n.n(_),e=n(44194),T=n(68509),k={"src-use-editor-demo-0":{component:e.memo(e.lazy(m()(d()().mark(function u(){var a,l,i;return d()().wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return i=function(){var o=l(""),E=o.content,f=o.setContent,g=o.history,y=o.undo,p=o.redo,C=o.canUndo,v=o.canRedo;return e.createElement("div",null,e.createElement("div",null,e.createElement("button",{onClick:y,disabled:!C},"Undo"),e.createElement("button",{onClick:p,disabled:!v},"Redo")),e.createElement("textarea",{value:E,onChange:function(s){return f(s.target.value)},rows:10,cols:50}))},r.next=3,Promise.resolve().then(n.bind(n,68509));case 3:a=r.sent,l=a.useEditor;case 5:case"end":return r.stop()}},u)})))),asset:{type:"BLOCK",id:"src-use-editor-demo-0",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useEditor } from '@corn12138/hooks';

function TextEditor() {
  const { content, setContent, history, undo, redo, canUndo, canRedo } = useEditor('');
  
  return (
    <div>
      <div>
        <button onClick={undo} disabled={!canUndo}>Undo</button>
        <button onClick={redo} disabled={!canRedo}>Redo</button>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
        cols={50}
      />
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":T},renderOpts:{compile:function(){var u=m()(d()().mark(function l(){var i,c=arguments;return d()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,n.e(216).then(n.bind(n,29525));case 2:return t.abrupt("return",(i=t.sent).default.apply(i,c));case 3:case"end":return t.stop()}},l)}));function a(){return u.apply(this,arguments)}return a}()}},"src-use-editor-demo-1":{component:e.memo(e.lazy(m()(d()().mark(function u(){var a,l,i;return d()().wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return i=function(){var o=l(""),E=o.content,f=o.setContent,g=o.insertText,y=o.formatText,p=o.getSelection,C=function(){var s=p();y("bold",s)},v=function(){var s=p();y("italic",s)};return e.createElement("div",null,e.createElement("div",null,e.createElement("button",{onClick:C},"Bold"),e.createElement("button",{onClick:v},"Italic"),e.createElement("button",{onClick:function(){return g("Hello World!")}},"Insert Text")),e.createElement("div",{contentEditable:!0,dangerouslySetInnerHTML:{__html:E},onInput:function(s){return f(s.target.innerHTML)},style:{border:"1px solid #ccc",padding:"10px",minHeight:"200px"}}))},r.next=3,Promise.resolve().then(n.bind(n,68509));case 3:a=r.sent,l=a.useEditor;case 5:case"end":return r.stop()}},u)})))),asset:{type:"BLOCK",id:"src-use-editor-demo-1",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useEditor } from '@corn12138/hooks';

function RichTextEditor() {
  const { content, setContent, insertText, formatText, getSelection } = useEditor('');
  
  const handleBold = () => {
    const selection = getSelection();
    formatText('bold', selection);
  };
  
  const handleItalic = () => {
    const selection = getSelection();
    formatText('italic', selection);
  };
  
  return (
    <div>
      <div>
        <button onClick={handleBold}>Bold</button>
        <button onClick={handleItalic}>Italic</button>
        <button onClick={() => insertText('Hello World!')}>
          Insert Text
        </button>
      </div>
      <div
        contentEditable
        dangerouslySetInnerHTML={{ __html: content }}
        onInput={(e) => setContent(e.target.innerHTML)}
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          minHeight: '200px'
        }}
      />
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":T},renderOpts:{compile:function(){var u=m()(d()().mark(function l(){var i,c=arguments;return d()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,n.e(216).then(n.bind(n,29525));case 2:return t.abrupt("return",(i=t.sent).default.apply(i,c));case 3:case"end":return t.stop()}},l)}));function a(){return u.apply(this,arguments)}return a}()}},"src-use-editor-demo-2":{component:e.memo(e.lazy(m()(d()().mark(function u(){var a,l,i;return d()().wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return i=function(){var o=l("",{language:"javascript",autoIndent:!0,autoComplete:!0}),E=o.content,f=o.setContent,g=o.insertText,y=o.autoComplete,p=o.formatCode,C=o.validateSyntax,v=o.errors,h=function(b){b.key==="Tab"&&(b.preventDefault(),g("  "))};return e.createElement("div",null,e.createElement("div",null,e.createElement("button",{onClick:p},"Format Code"),e.createElement("button",{onClick:C},"Validate")),v.length>0&&e.createElement("div",{style:{color:"red"}},v.map(function(s){return e.createElement("div",{key:s.line},"Line ",s.line,": ",s.message)})),e.createElement("textarea",{value:E,onChange:function(b){return f(b.target.value)},onKeyDown:h,style:{fontFamily:"monospace",fontSize:"14px",width:"100%",height:"400px"}}))},r.next=3,Promise.resolve().then(n.bind(n,68509));case 3:a=r.sent,l=a.useEditor;case 5:case"end":return r.stop()}},u)})))),asset:{type:"BLOCK",id:"src-use-editor-demo-2",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useEditor } from '@corn12138/hooks';

function CodeEditor() {
  const { 
    content, 
    setContent, 
    insertText, 
    autoComplete, 
    formatCode,
    validateSyntax,
    errors 
  } = useEditor('', {
    language: 'javascript',
    autoIndent: true,
    autoComplete: true
  });
  
  const handleTabKey = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      insertText('  '); // \u63D2\u5165\u4E24\u4E2A\u7A7A\u683C
    }
  };
  
  return (
    <div>
      <div>
        <button onClick={formatCode}>Format Code</button>
        <button onClick={validateSyntax}>Validate</button>
      </div>
      {errors.length > 0 && (
        <div style={{ color: 'red' }}>
          {errors.map(error => (
            <div key={error.line}>
              Line {error.line}: {error.message}
            </div>
          ))}
        </div>
      )}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleTabKey}
        style={{
          fontFamily: 'monospace',
          fontSize: '14px',
          width: '100%',
          height: '400px'
        }}
      />
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":T},renderOpts:{compile:function(){var u=m()(d()().mark(function l(){var i,c=arguments;return d()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,n.e(216).then(n.bind(n,29525));case 2:return t.abrupt("return",(i=t.sent).default.apply(i,c));case 3:case"end":return t.stop()}},l)}));function a(){return u.apply(this,arguments)}return a}()}}}}}]);
