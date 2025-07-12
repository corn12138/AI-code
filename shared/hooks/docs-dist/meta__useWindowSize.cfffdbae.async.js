"use strict";(self.webpackChunk_corn12138_hooks=self.webpackChunk_corn12138_hooks||[]).push([[506],{658:function(y,I,i){i.r(I),i.d(I,{demos:function(){return x}});var w=i(90819),d=i.n(w),g=i(89933),p=i.n(g),n=i(44194),f=i(68509),x={"src-use-window-size-demo-0":{component:n.memo(n.lazy(p()(d()().mark(function s(){var o,r,a;return d()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return a=function(){var c=r(),l=c.width,h=c.height;return n.createElement("div",null,n.createElement("p",null,"Window Size: ",l," x ",h))},t.next=3,Promise.resolve().then(i.bind(i,68509));case 3:o=t.sent,r=o.useWindowSize;case 5:case"end":return t.stop()}},s)})))),asset:{type:"BLOCK",id:"src-use-window-size-demo-0",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useWindowSize } from '@corn12138/hooks';

function WindowInfo() {
  const { width, height } = useWindowSize();
  
  return (
    <div>
      <p>Window Size: {width} x {height}</p>
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":f},renderOpts:{compile:function(){var s=p()(d()().mark(function r(){var a,u=arguments;return d()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,i.e(216).then(i.bind(i,29525));case 2:return e.abrupt("return",(a=e.sent).default.apply(a,u));case 3:case"end":return e.stop()}},r)}));function o(){return s.apply(this,arguments)}return o}()}},"src-use-window-size-demo-1":{component:n.memo(n.lazy(p()(d()().mark(function s(){var o,r,a;return d()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return a=function(){var c=r(),l=c.width,h=l<768,m=l>=768&&l<1024,v=l>=1024;return n.createElement("div",null,h&&n.createElement("div",null,"Mobile Layout"),m&&n.createElement("div",null,"Tablet Layout"),v&&n.createElement("div",null,"Desktop Layout"))},t.next=3,Promise.resolve().then(i.bind(i,68509));case 3:o=t.sent,r=o.useWindowSize;case 5:case"end":return t.stop()}},s)})))),asset:{type:"BLOCK",id:"src-use-window-size-demo-1",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useWindowSize } from '@corn12138/hooks';

function ResponsiveComponent() {
  const { width } = useWindowSize();
  
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  
  return (
    <div>
      {isMobile && <div>Mobile Layout</div>}
      {isTablet && <div>Tablet Layout</div>}
      {isDesktop && <div>Desktop Layout</div>}
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":f},renderOpts:{compile:function(){var s=p()(d()().mark(function r(){var a,u=arguments;return d()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,i.e(216).then(i.bind(i,29525));case 2:return e.abrupt("return",(a=e.sent).default.apply(a,u));case 3:case"end":return e.stop()}},r)}));function o(){return s.apply(this,arguments)}return o}()}},"src-use-window-size-demo-2":{component:n.memo(n.lazy(p()(d()().mark(function s(){var o,r,a;return d()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return a=function(){var c=r(),l=c.width,h=function(){return l<600?1:l<900?2:l<1200?3:4};return n.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(".concat(h(),", 1fr)"),gap:"20px"}},Array.from({length:12}).map(function(m,v){return n.createElement("div",{key:v,style:{height:"200px",backgroundColor:"#f0f0f0"}},"Item ",v+1)}))},t.next=3,Promise.resolve().then(i.bind(i,68509));case 3:o=t.sent,r=o.useWindowSize;case 5:case"end":return t.stop()}},s)})))),asset:{type:"BLOCK",id:"src-use-window-size-demo-2",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useWindowSize } from '@corn12138/hooks';

function DynamicGrid() {
  const { width } = useWindowSize();
  
  const getColumns = () => {
    if (width < 600) return 1;
    if (width < 900) return 2;
    if (width < 1200) return 3;
    return 4;
  };
  
  return (
    <div 
      style={{
        display: 'grid',
        gridTemplateColumns: \`repeat(\${getColumns()}, 1fr)\`,
        gap: '20px'
      }}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{ 
          height: '200px', 
          backgroundColor: '#f0f0f0' 
        }}>
          Item {i + 1}
        </div>
      ))}
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":f},renderOpts:{compile:function(){var s=p()(d()().mark(function r(){var a,u=arguments;return d()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,i.e(216).then(i.bind(i,29525));case 2:return e.abrupt("return",(a=e.sent).default.apply(a,u));case 3:case"end":return e.stop()}},r)}));function o(){return s.apply(this,arguments)}return o}()}},"src-use-window-size-demo-3":{component:n.memo(n.lazy(p()(d()().mark(function s(){var o,r,a;return d()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return a=function(){var c=r(),l=c.width,h=c.height,m=useMemo(function(){return{isMobile:l<768,columns:Math.floor(l/300),itemSize:Math.floor(l/Math.floor(l/300))-20}},[l]);return n.createElement("div",null,n.createElement("p",null,"Device: ",m.isMobile?"Mobile":"Desktop"),n.createElement("p",null,"Columns: ",m.columns),n.createElement("p",null,"Item Size: ",m.itemSize,"px"))},t.next=3,Promise.resolve().then(i.bind(i,68509));case 3:o=t.sent,r=o.useWindowSize;case 5:case"end":return t.stop()}},s)})))),asset:{type:"BLOCK",id:"src-use-window-size-demo-3",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useWindowSize } from '@corn12138/hooks';

function OptimizedComponent() {
  const { width, height } = useWindowSize();
  
  // \u4F7F\u7528 useMemo \u4F18\u5316\u8BA1\u7B97
  const layout = useMemo(() => {
    return {
      isMobile: width < 768,
      columns: Math.floor(width / 300),
      itemSize: Math.floor(width / Math.floor(width / 300)) - 20
    };
  }, [width]);
  
  return (
    <div>
      <p>Device: {layout.isMobile ? 'Mobile' : 'Desktop'}</p>
      <p>Columns: {layout.columns}</p>
      <p>Item Size: {layout.itemSize}px</p>
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":f},renderOpts:{compile:function(){var s=p()(d()().mark(function r(){var a,u=arguments;return d()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,i.e(216).then(i.bind(i,29525));case 2:return e.abrupt("return",(a=e.sent).default.apply(a,u));case 3:case"end":return e.stop()}},r)}));function o(){return s.apply(this,arguments)}return o}()}},"src-use-window-size-demo-4":{component:n.memo(n.lazy(p()(d()().mark(function s(){var o,r,a;return d()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return a=function(){var c=r(),l=c.width,h=c.height,m=l>1024,v=l<600;return n.createElement("div",{style:{display:"flex"}},m&&n.createElement("aside",{style:{width:"250px",backgroundColor:"#f5f5f5"}},n.createElement("h3",null,"Sidebar"),n.createElement("nav",null,n.createElement("ul",null,n.createElement("li",null,n.createElement("a",{href:"#home"},"Home")),n.createElement("li",null,n.createElement("a",{href:"#about"},"About")),n.createElement("li",null,n.createElement("a",{href:"#contact"},"Contact"))))),n.createElement("main",{style:{flex:1,padding:"20px"}},v?n.createElement("div",null,n.createElement("h1",null,"Mobile View"),n.createElement("p",null,"Simplified content for mobile")):n.createElement("div",null,n.createElement("h1",null,"Desktop View"),n.createElement("p",null,"Full content for desktop"),n.createElement("div",null,"Additional features..."))))},t.next=3,Promise.resolve().then(i.bind(i,68509));case 3:o=t.sent,r=o.useWindowSize;case 5:case"end":return t.stop()}},s)})))),asset:{type:"BLOCK",id:"src-use-window-size-demo-4",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useWindowSize } from '@corn12138/hooks';

function ConditionalRender() {
  const { width, height } = useWindowSize();
  
  // \u53EA\u5728\u5927\u5C4F\u5E55\u4E0A\u663E\u793A\u4FA7\u8FB9\u680F
  const showSidebar = width > 1024;
  
  // \u5728\u5C0F\u5C4F\u5E55\u4E0A\u663E\u793A\u7B80\u5316\u7248\u672C
  const showSimplified = width < 600;
  
  return (
    <div style={{ display: 'flex' }}>
      {showSidebar && (
        <aside style={{ width: '250px', backgroundColor: '#f5f5f5' }}>
          <h3>Sidebar</h3>
          <nav>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>
        </aside>
      )}
      
      <main style={{ flex: 1, padding: '20px' }}>
        {showSimplified ? (
          <div>
            <h1>Mobile View</h1>
            <p>Simplified content for mobile</p>
          </div>
        ) : (
          <div>
            <h1>Desktop View</h1>
            <p>Full content for desktop</p>
            <div>Additional features...</div>
          </div>
        )}
      </main>
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":f},renderOpts:{compile:function(){var s=p()(d()().mark(function r(){var a,u=arguments;return d()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,i.e(216).then(i.bind(i,29525));case 2:return e.abrupt("return",(a=e.sent).default.apply(a,u));case 3:case"end":return e.stop()}},r)}));function o(){return s.apply(this,arguments)}return o}()}},"src-use-window-size-demo-5":{component:n.memo(n.lazy(p()(d()().mark(function s(){var o,r,a;return d()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return a=function(){var c=r(),l=c.width,h=function(){return l<600?"small":l<1200?"medium":"large"};return n.createElement("img",{src:"/images/hero-".concat(h(),".jpg"),alt:"Hero Image",style:{width:"100%",height:"auto",maxWidth:l<600?"100%":"800px"}})},t.next=3,Promise.resolve().then(i.bind(i,68509));case 3:o=t.sent,r=o.useWindowSize;case 5:case"end":return t.stop()}},s)})))),asset:{type:"BLOCK",id:"src-use-window-size-demo-5",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useWindowSize } from '@corn12138/hooks';

function ResponsiveImage() {
  const { width } = useWindowSize();
  
  const getImageSize = () => {
    if (width < 600) return 'small';
    if (width < 1200) return 'medium';
    return 'large';
  };
  
  return (
    <img 
      src={\`/images/hero-\${getImageSize()}.jpg\`}
      alt="Hero Image"
      style={{
        width: '100%',
        height: 'auto',
        maxWidth: width < 600 ? '100%' : '800px'
      }}
    />
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":f},renderOpts:{compile:function(){var s=p()(d()().mark(function r(){var a,u=arguments;return d()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,i.e(216).then(i.bind(i,29525));case 2:return e.abrupt("return",(a=e.sent).default.apply(a,u));case 3:case"end":return e.stop()}},r)}));function o(){return s.apply(this,arguments)}return o}()}},"src-use-window-size-demo-6":{component:n.memo(n.lazy(p()(d()().mark(function s(){var o,r,a;return d()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return a=function(c){var l=c.items,h=r(),m=h.height,v=50,z=Math.ceil(m/v)+2;return n.createElement("div",{style:{height:m-100,overflow:"auto"}},l.slice(0,z).map(function(S,b){return n.createElement("div",{key:b,style:{height:v,borderBottom:"1px solid #eee",display:"flex",alignItems:"center",padding:"0 20px"}},S.title)}))},t.next=3,Promise.resolve().then(i.bind(i,68509));case 3:o=t.sent,r=o.useWindowSize;case 5:case"end":return t.stop()}},s)})))),asset:{type:"BLOCK",id:"src-use-window-size-demo-6",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useWindowSize } from '@corn12138/hooks';

function VirtualList({ items }) {
  const { height } = useWindowSize();
  const itemHeight = 50;
  const visibleItems = Math.ceil(height / itemHeight) + 2;
  
  return (
    <div style={{ height: height - 100, overflow: 'auto' }}>
      {items.slice(0, visibleItems).map((item, index) => (
        <div 
          key={index}
          style={{ 
            height: itemHeight,
            borderBottom: '1px solid #eee',
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px'
          }}
        >
          {item.title}
        </div>
      ))}
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":f},renderOpts:{compile:function(){var s=p()(d()().mark(function r(){var a,u=arguments;return d()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,i.e(216).then(i.bind(i,29525));case 2:return e.abrupt("return",(a=e.sent).default.apply(a,u));case 3:case"end":return e.stop()}},r)}));function o(){return s.apply(this,arguments)}return o}()}}}},41383:function(y,I,i){i.r(I),i.d(I,{texts:function(){return w}});const w=[{value:"\u7528\u4E8E\u83B7\u53D6\u7A97\u53E3\u5C3A\u5BF8\u7684 React Hook\u3002",paraId:0,tocIndex:0},{value:"\u53C2\u6570",paraId:1,tocIndex:9},{value:"\u7C7B\u578B",paraId:1,tocIndex:9},{value:"\u5FC5\u586B",paraId:1,tocIndex:9},{value:"\u63CF\u8FF0",paraId:1,tocIndex:9},{value:"options",paraId:1,tocIndex:9},{value:"UseWindowSizeOptions",paraId:1,tocIndex:9},{value:"\u274C",paraId:1,tocIndex:9},{value:"\u914D\u7F6E\u9009\u9879",paraId:1,tocIndex:9},{value:"\u5C5E\u6027",paraId:2,tocIndex:10},{value:"\u7C7B\u578B",paraId:2,tocIndex:10},{value:"\u9ED8\u8BA4\u503C",paraId:2,tocIndex:10},{value:"\u63CF\u8FF0",paraId:2,tocIndex:10},{value:"debounceMs",paraId:2,tocIndex:10},{value:"number",paraId:2,tocIndex:10},{value:"100",paraId:2,tocIndex:10},{value:"\u9632\u6296\u5EF6\u8FDF\u65F6\u95F4\uFF08\u6BEB\u79D2\uFF09",paraId:2,tocIndex:10},{value:"initialWidth",paraId:2,tocIndex:10},{value:"number",paraId:2,tocIndex:10},{value:"1024",paraId:2,tocIndex:10},{value:"SSR \u521D\u59CB\u5BBD\u5EA6",paraId:2,tocIndex:10},{value:"initialHeight",paraId:2,tocIndex:10},{value:"number",paraId:2,tocIndex:10},{value:"768",paraId:2,tocIndex:10},{value:"SSR \u521D\u59CB\u9AD8\u5EA6",paraId:2,tocIndex:10},{value:"\u8FD4\u56DE ",paraId:3,tocIndex:11},{value:"WindowSize",paraId:3,tocIndex:11},{value:" \u5BF9\u8C61\uFF1A",paraId:3,tocIndex:11},{value:"\u5C5E\u6027",paraId:4,tocIndex:11},{value:"\u7C7B\u578B",paraId:4,tocIndex:11},{value:"\u63CF\u8FF0",paraId:4,tocIndex:11},{value:"width",paraId:4,tocIndex:11},{value:"number",paraId:4,tocIndex:11},{value:"\u7A97\u53E3\u5BBD\u5EA6\uFF08\u50CF\u7D20\uFF09",paraId:4,tocIndex:11},{value:"height",paraId:4,tocIndex:11},{value:"number",paraId:4,tocIndex:11},{value:"\u7A97\u53E3\u9AD8\u5EA6\uFF08\u50CF\u7D20\uFF09",paraId:4,tocIndex:11},{value:`function ResponsiveGrid() {
  const { width } = useWindowSize();
  
  const columns = width < 768 ? 1 : width < 1200 ? 2 : 3;
  
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: \`repeat(\${columns}, 1fr)\`,
      gap: '16px'
    }}>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} style={{ 
          padding: '20px', 
          backgroundColor: '#f0f0f0',
          textAlign: 'center'
        }}>
          \u9879\u76EE {i + 1}
        </div>
      ))}
    </div>
  );
}
`,paraId:5,tocIndex:13},{value:`function ResponsiveNavbar() {
  const { width } = useWindowSize();
  const isMobile = width < 768;
  
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 20px',
      backgroundColor: '#333',
      color: 'white'
    }}>
      <div>Logo</div>
      
      {isMobile ? (
        <button>\u2630</button>
      ) : (
        <div style={{ display: 'flex', gap: '20px' }}>
          <a href="#home">\u9996\u9875</a>
          <a href="#about">\u5173\u4E8E</a>
          <a href="#services">\u670D\u52A1</a>
          <a href="#contact">\u8054\u7CFB</a>
        </div>
      )}
    </nav>
  );
}
`,paraId:6,tocIndex:14},{value:`function ResponsiveModal({ isOpen, onClose, children }) {
  const { width, height } = useWindowSize();
  const isMobile = width < 768;
  
  if (!isOpen) return null;
  
  const modalStyle = isMobile ? {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    zIndex: 1000,
    overflow: 'auto'
  } : {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: Math.min(600, width - 40),
    maxHeight: height - 40,
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    zIndex: 1000,
    overflow: 'auto'
  };
  
  return (
    <>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 999
        }}
        onClick={onClose}
      />
      <div style={modalStyle}>
        {isMobile && (
          <div style={{ 
            padding: '12px', 
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3>\u6807\u9898</h3>
            <button onClick={onClose}>\xD7</button>
          </div>
        )}
        <div style={{ padding: '20px' }}>
          {children}
        </div>
      </div>
    </>
  );
}
`,paraId:7,tocIndex:15},{value:`// \u4F7F\u7528\u5408\u9002\u7684\u9632\u6296\u65F6\u95F4
const { width } = useWindowSize({
  debounceMs: 150 // \u5E73\u8861\u54CD\u5E94\u6027\u548C\u6027\u80FD
});

// \u907F\u514D\u5728 render \u4E2D\u8FDB\u884C\u590D\u6742\u8BA1\u7B97
const layout = useMemo(() => {
  return calculateLayout(width);
}, [width]);
`,paraId:8,tocIndex:17},{value:`// \u8BBE\u7F6E\u5408\u7406\u7684\u521D\u59CB\u503C\u907F\u514D\u6C34\u5408\u4E0D\u5339\u914D
const { width, height } = useWindowSize({
  initialWidth: 1200,  // \u5E38\u89C1\u684C\u9762\u5BBD\u5EA6
  initialHeight: 800   // \u5E38\u89C1\u684C\u9762\u9AD8\u5EA6
});

// \u5728\u5BA2\u6237\u7AEF\u6E32\u67D3\u5B8C\u6210\u524D\u663E\u793A\u9ED8\u8BA4\u5E03\u5C40
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

if (!mounted) {
  return <DefaultLayout />;
}
`,paraId:9,tocIndex:18},{value:`// \u4F7F\u7528\u5E38\u91CF\u907F\u514D\u91CD\u590D\u8BA1\u7B97
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

function OptimizedComponent() {
  const { width } = useWindowSize();
  
  // \u7F13\u5B58\u65AD\u70B9\u5224\u65AD\u7ED3\u679C
  const deviceType = useMemo(() => {
    if (width < MOBILE_BREAKPOINT) return 'mobile';
    if (width < TABLET_BREAKPOINT) return 'tablet';
    return 'desktop';
  }, [width]);
  
  return (
    <div>
      {deviceType === 'mobile' && <MobileComponent />}
      {deviceType === 'tablet' && <TabletComponent />}
      {deviceType === 'desktop' && <DesktopComponent />}
    </div>
  );
}
`,paraId:10,tocIndex:19},{value:"\u9632\u6296\u8BBE\u7F6E",paraId:11,tocIndex:20},{value:"\uFF1A\u6839\u636E\u4F7F\u7528\u573A\u666F\u8BBE\u7F6E\u5408\u9002\u7684\u9632\u6296\u65F6\u95F4\uFF0C\u56FE\u8868\u7B49\u91CD\u6E32\u67D3\u7EC4\u4EF6\u5EFA\u8BAE\u4F7F\u7528\u66F4\u957F\u7684\u9632\u6296\u65F6\u95F4",paraId:11,tocIndex:20},{value:"\u670D\u52A1\u7AEF\u6E32\u67D3",paraId:11,tocIndex:20},{value:"\uFF1A\u5728 SSR \u73AF\u5883\u4E2D\u4F1A\u4F7F\u7528\u521D\u59CB\u503C\uFF0C\u9700\u8981\u5904\u7406\u5BA2\u6237\u7AEF\u6C34\u5408\u65F6\u7684\u5C3A\u5BF8\u5DEE\u5F02",paraId:11,tocIndex:20},{value:"\u6027\u80FD\u5F71\u54CD",paraId:11,tocIndex:20},{value:"\uFF1A\u9891\u7E41\u7684\u7A97\u53E3\u5927\u5C0F\u53D8\u5316\u53EF\u80FD\u5BFC\u81F4\u5927\u91CF\u91CD\u6E32\u67D3\uFF0C\u5EFA\u8BAE\u4F7F\u7528 useMemo \u4F18\u5316\u8BA1\u7B97",paraId:11,tocIndex:20},{value:"\u5185\u5B58\u6CC4\u6F0F",paraId:11,tocIndex:20},{value:"\uFF1AHook \u4F1A\u81EA\u52A8\u6E05\u7406\u4E8B\u4EF6\u76D1\u542C\u5668\uFF0C\u65E0\u9700\u624B\u52A8\u5904\u7406",paraId:11,tocIndex:20},{value:"\u79FB\u52A8\u7AEF",paraId:11,tocIndex:20},{value:"\uFF1A\u5728\u79FB\u52A8\u7AEF\u8981\u6CE8\u610F\u865A\u62DF\u952E\u76D8\u5F39\u51FA\u65F6\u4F1A\u6539\u53D8\u7A97\u53E3\u9AD8\u5EA6",paraId:11,tocIndex:20}]}}]);
