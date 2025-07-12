"use strict";(self.webpackChunk_corn12138_hooks=self.webpackChunk_corn12138_hooks||[]).push([[230],{89604:function(g,I,e){e.r(I),e.d(I,{demos:function(){return S}});var h=e(76711),w=e.n(h),O=e(45332),x=e.n(O),E=e(90819),u=e.n(E),_=e(89933),v=e.n(_),r=e(44194),f=e(68509),S={"src-use-network-status-demo-0":{component:r.memo(r.lazy(v()(u()().mark(function i(){var a,s,o;return u()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return o=function(){var l=s(),p=l.online,m=l.downlink,c=l.effectiveType;return r.createElement("div",null,r.createElement("p",null,"Status: ",p?"Online":"Offline"),p&&r.createElement("div",null,r.createElement("p",null,"Speed: ",m," Mbps"),r.createElement("p",null,"Connection: ",c)))},t.next=3,Promise.resolve().then(e.bind(e,68509));case 3:a=t.sent,s=a.useNetworkStatus;case 5:case"end":return t.stop()}},i)})))),asset:{type:"BLOCK",id:"src-use-network-status-demo-0",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useNetworkStatus } from '@corn12138/hooks';

function NetworkIndicator() {
  const { online, downlink, effectiveType } = useNetworkStatus();
  
  return (
    <div>
      <p>Status: {online ? 'Online' : 'Offline'}</p>
      {online && (
        <div>
          <p>Speed: {downlink} Mbps</p>
          <p>Connection: {effectiveType}</p>
        </div>
      )}
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":f},renderOpts:{compile:function(){var i=v()(u()().mark(function s(){var o,d=arguments;return u()().wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,e.e(216).then(e.bind(e,29525));case 2:return n.abrupt("return",(o=n.sent).default.apply(o,d));case 3:case"end":return n.stop()}},s)}));function a(){return i.apply(this,arguments)}return a}()}},"src-use-network-status-demo-1":{component:r.memo(r.lazy(v()(u()().mark(function i(){var a,s,o;return u()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return o=function(){var l=s(),p=l.online,m=l.downlink,c=p&&m>10;return r.createElement("div",null,r.createElement("img",{src:c?"/high-res.jpg":"/low-res.jpg",alt:"Dynamic quality"}))},t.next=3,Promise.resolve().then(e.bind(e,68509));case 3:a=t.sent,s=a.useNetworkStatus;case 5:case"end":return t.stop()}},i)})))),asset:{type:"BLOCK",id:"src-use-network-status-demo-1",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useNetworkStatus } from '@corn12138/hooks';

function DataComponent() {
  const { online, downlink } = useNetworkStatus();
  
  // \u6839\u636E\u7F51\u7EDC\u72B6\u6001\u8C03\u6574\u884C\u4E3A
  const shouldLoadHighRes = online && downlink > 10;
  
  return (
    <div>
      <img 
        src={shouldLoadHighRes ? '/high-res.jpg' : '/low-res.jpg'} 
        alt="Dynamic quality"
      />
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":f},renderOpts:{compile:function(){var i=v()(u()().mark(function s(){var o,d=arguments;return u()().wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,e.e(216).then(e.bind(e,29525));case 2:return n.abrupt("return",(o=n.sent).default.apply(o,d));case 3:case"end":return n.stop()}},s)}));function a(){return i.apply(this,arguments)}return a}()}},"src-use-network-status-demo-2":{component:r.memo(r.lazy(v()(u()().mark(function i(){var a,s,o,d,t;return u()().wrap(function(l){for(;;)switch(l.prev=l.next){case 0:return t=function(){var m=s(),c=m.online,y=d("offline",[]),k=x()(y,2),P=k[0],D=k[1];return useEffect(function(){c||D(function(N){return[].concat(w()(N),[{timestamp:Date.now()}])})},[c]),r.createElement("div",null,!c&&r.createElement("div",null,"\u60A8\u5F53\u524D\u79BB\u7EBF\uFF0C\u6570\u636E\u5C06\u5728\u8054\u7F51\u540E\u540C\u6B65"))},l.next=3,Promise.resolve().then(e.bind(e,68509));case 3:return a=l.sent,s=a.useNetworkStatus,l.next=7,Promise.resolve().then(e.bind(e,68509));case 7:o=l.sent,d=o.useLocalStorage;case 9:case"end":return l.stop()}},i)})))),asset:{type:"BLOCK",id:"src-use-network-status-demo-2",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useNetworkStatus } from '@corn12138/hooks';
import { useLocalStorage } from '@corn12138/hooks';

function OfflineHandler() {
  const { online } = useNetworkStatus();
  const [offlineData, setOfflineData] = useLocalStorage('offline', []);
  
  useEffect(() => {
    if (!online) {
      // \u4FDD\u5B58\u79BB\u7EBF\u6570\u636E
      setOfflineData(prev => [...prev, { timestamp: Date.now() }]);
    }
  }, [online]);
  
  return (
    <div>
      {!online && (
        <div>\u60A8\u5F53\u524D\u79BB\u7EBF\uFF0C\u6570\u636E\u5C06\u5728\u8054\u7F51\u540E\u540C\u6B65</div>
      )}
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":f},renderOpts:{compile:function(){var i=v()(u()().mark(function s(){var o,d=arguments;return u()().wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,e.e(216).then(e.bind(e,29525));case 2:return n.abrupt("return",(o=n.sent).default.apply(o,d));case 3:case"end":return n.stop()}},s)}));function a(){return i.apply(this,arguments)}return a}()}},"src-use-network-status-demo-3":{component:r.memo(r.lazy(v()(u()().mark(function i(){var a,s,o;return u()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return o=function(){var l=s(),p=l.downlink,m=l.effectiveType,c=l.rtt,y=function(){return p>10?"green":p>1?"yellow":"red"};return r.createElement("div",null,r.createElement("div",{style:{color:y()}},"Network Quality: ",m),r.createElement("p",null,"Speed: ",p," Mbps"),r.createElement("p",null,"Latency: ",c," ms"))},t.next=3,Promise.resolve().then(e.bind(e,68509));case 3:a=t.sent,s=a.useNetworkStatus;case 5:case"end":return t.stop()}},i)})))),asset:{type:"BLOCK",id:"src-use-network-status-demo-3",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useNetworkStatus } from '@corn12138/hooks';

function QualityMonitor() {
  const { downlink, effectiveType, rtt } = useNetworkStatus();
  
  const getQualityColor = () => {
    if (downlink > 10) return 'green';
    if (downlink > 1) return 'yellow';
    return 'red';
  };
  
  return (
    <div>
      <div style={{ color: getQualityColor() }}>
        Network Quality: {effectiveType}
      </div>
      <p>Speed: {downlink} Mbps</p>
      <p>Latency: {rtt} ms</p>
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":f},renderOpts:{compile:function(){var i=v()(u()().mark(function s(){var o,d=arguments;return u()().wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,e.e(216).then(e.bind(e,29525));case 2:return n.abrupt("return",(o=n.sent).default.apply(o,d));case 3:case"end":return n.stop()}},s)}));function a(){return i.apply(this,arguments)}return a}()}},"src-use-network-status-demo-4":{component:r.memo(r.lazy(v()(u()().mark(function i(){var a,s,o;return u()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return o=function(){var l=s(),p=l.online,m=l.downlink,c=function(){return p?m>25?"4K":m>10?"1080p":m>5?"720p":"480p":"none"};return r.createElement("div",null,r.createElement("video",{src:"/video-".concat(c(),".mp4"),controls:!0}),r.createElement("p",null,"Quality: ",c()))},t.next=3,Promise.resolve().then(e.bind(e,68509));case 3:a=t.sent,s=a.useNetworkStatus;case 5:case"end":return t.stop()}},i)})))),asset:{type:"BLOCK",id:"src-use-network-status-demo-4",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useNetworkStatus } from '@corn12138/hooks';

function VideoPlayer() {
  const { online, downlink } = useNetworkStatus();
  
  const getVideoQuality = () => {
    if (!online) return 'none';
    if (downlink > 25) return '4K';
    if (downlink > 10) return '1080p';
    if (downlink > 5) return '720p';
    return '480p';
  };
  
  return (
    <div>
      <video 
        src={\`/video-\${getVideoQuality()}.mp4\`}
        controls
      />
      <p>Quality: {getVideoQuality()}</p>
    </div>
  );
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":f},renderOpts:{compile:function(){var i=v()(u()().mark(function s(){var o,d=arguments;return u()().wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,e.e(216).then(e.bind(e,29525));case 2:return n.abrupt("return",(o=n.sent).default.apply(o,d));case 3:case"end":return n.stop()}},s)}));function a(){return i.apply(this,arguments)}return a}()}}}},80983:function(g,I,e){e.r(I),e.d(I,{texts:function(){return h}});const h=[{value:"\u7528\u4E8E\u76D1\u63A7\u7F51\u7EDC\u72B6\u6001\u7684 React Hook\u3002",paraId:0,tocIndex:0},{value:"\u53C2\u6570",paraId:1,tocIndex:7},{value:"\u7C7B\u578B",paraId:1,tocIndex:7},{value:"\u5FC5\u586B",paraId:1,tocIndex:7},{value:"\u63CF\u8FF0",paraId:1,tocIndex:7},{value:"options",paraId:1,tocIndex:7},{value:"UseNetworkStatusOptions",paraId:1,tocIndex:7},{value:"\u274C",paraId:1,tocIndex:7},{value:"\u914D\u7F6E\u9009\u9879",paraId:1,tocIndex:7},{value:"\u5C5E\u6027",paraId:2,tocIndex:8},{value:"\u7C7B\u578B",paraId:2,tocIndex:8},{value:"\u9ED8\u8BA4\u503C",paraId:2,tocIndex:8},{value:"\u63CF\u8FF0",paraId:2,tocIndex:8},{value:"onOnline",paraId:2,tocIndex:8},{value:"() => void",paraId:2,tocIndex:8},{value:"-",paraId:2,tocIndex:8},{value:"\u7F51\u7EDC\u8FDE\u63A5\u56DE\u8C03",paraId:2,tocIndex:8},{value:"onOffline",paraId:2,tocIndex:8},{value:"() => void",paraId:2,tocIndex:8},{value:"-",paraId:2,tocIndex:8},{value:"\u7F51\u7EDC\u65AD\u5F00\u56DE\u8C03",paraId:2,tocIndex:8},{value:"\u8FD4\u56DE ",paraId:3,tocIndex:9},{value:"UseNetworkStatusReturn",paraId:3,tocIndex:9},{value:" \u5BF9\u8C61\uFF1A",paraId:3,tocIndex:9},{value:"\u5C5E\u6027",paraId:4,tocIndex:9},{value:"\u7C7B\u578B",paraId:4,tocIndex:9},{value:"\u63CF\u8FF0",paraId:4,tocIndex:9},{value:"isOnline",paraId:4,tocIndex:9},{value:"boolean",paraId:4,tocIndex:9},{value:"\u662F\u5426\u5728\u7EBF",paraId:4,tocIndex:9},{value:"reconnect",paraId:4,tocIndex:9},{value:"() => void",paraId:4,tocIndex:9},{value:"\u91CD\u65B0\u68C0\u6D4B\u8FDE\u63A5",paraId:4,tocIndex:9},{value:"checkConnectivity",paraId:4,tocIndex:9},{value:"() => Promise<boolean>",paraId:4,tocIndex:9},{value:"\u5F02\u6B65\u68C0\u6D4B\u8FDE\u901A\u6027",paraId:4,tocIndex:9},{value:`function OfflineNotification() {
  const { isOnline } = useNetworkStatus();
  
  if (isOnline) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#dc3545',
      color: 'white',
      padding: '12px',
      textAlign: 'center',
      zIndex: 9999
    }}>
      \u26A0\uFE0F \u7F51\u7EDC\u8FDE\u63A5\u5DF2\u65AD\u5F00\uFF0C\u67D0\u4E9B\u529F\u80FD\u53EF\u80FD\u65E0\u6CD5\u4F7F\u7528
    </div>
  );
}
`,paraId:5,tocIndex:11},{value:`function NetworkDependentFeatures() {
  const { isOnline } = useNetworkStatus();
  
  return (
    <div>
      <button disabled={!isOnline}>
        \u5728\u7EBF\u804A\u5929 {!isOnline && '(\u9700\u8981\u7F51\u7EDC\u8FDE\u63A5)'}
      </button>
      
      <button disabled={!isOnline}>
        \u540C\u6B65\u6570\u636E {!isOnline && '(\u79BB\u7EBF\u6A21\u5F0F)'}
      </button>
      
      <button>
        \u79BB\u7EBF\u9605\u8BFB (\u59CB\u7EC8\u53EF\u7528)
      </button>
    </div>
  );
}
`,paraId:6,tocIndex:12},{value:`function DataSyncStatus() {
  const { isOnline } = useNetworkStatus({
    onOnline: () => {
      // \u7F51\u7EDC\u6062\u590D\u65F6\u81EA\u52A8\u540C\u6B65
      syncPendingData();
    }
  });
  
  const syncPendingData = async () => {
    // \u540C\u6B65\u903B\u8F91
    console.log('\u5F00\u59CB\u540C\u6B65\u6570\u636E...');
  };
  
  return (
    <div>
      <h3>\u6570\u636E\u540C\u6B65</h3>
      <p>\u72B6\u6001: {isOnline ? '\u5B9E\u65F6\u540C\u6B65' : '\u79BB\u7EBF\u6A21\u5F0F'}</p>
      {!isOnline && <p>\u7F51\u7EDC\u6062\u590D\u540E\u5C06\u81EA\u52A8\u540C\u6B65\u6570\u636E</p>}
    </div>
  );
}
`,paraId:7,tocIndex:13},{value:`function GracefulDegradation() {
  const { isOnline } = useNetworkStatus();
  
  return (
    <div>
      {isOnline ? (
        <LiveDataComponent />
      ) : (
        <CachedDataComponent />
      )}
    </div>
  );
}
`,paraId:8,tocIndex:15},{value:`function NetworkAwareErrorBoundary({ children }) {
  const { isOnline } = useNetworkStatus();
  
  // \u6839\u636E\u7F51\u7EDC\u72B6\u6001\u663E\u793A\u4E0D\u540C\u7684\u9519\u8BEF\u63D0\u793A
  return (
    <ErrorBoundary
      fallback={isOnline ? <OnlineErrorUI /> : <OfflineErrorUI />}
    >
      {children}
    </ErrorBoundary>
  );
}
`,paraId:9,tocIndex:16},{value:`// \u907F\u514D\u8FC7\u5EA6\u68C0\u6D4B
const { isOnline, checkConnectivity } = useNetworkStatus();

// \u4F7F\u7528\u9632\u6296\u907F\u514D\u9891\u7E41\u68C0\u6D4B
const debouncedCheck = useDebouncedCallback(checkConnectivity, 1000);
`,paraId:10,tocIndex:17},{value:"\u6D4F\u89C8\u5668\u517C\u5BB9\u6027",paraId:11,tocIndex:18},{value:"\uFF1A\u4F9D\u8D56 ",paraId:11,tocIndex:18},{value:"navigator.onLine",paraId:11,tocIndex:18},{value:" API\uFF0C\u5728\u67D0\u4E9B\u73AF\u5883\u4E0B\u53EF\u80FD\u4E0D\u51C6\u786E",paraId:11,tocIndex:18},{value:"\u8FDE\u901A\u6027\u68C0\u6D4B",paraId:11,tocIndex:18},{value:"\uFF1A\u9ED8\u8BA4\u8BF7\u6C42 ",paraId:11,tocIndex:18},{value:"/ping",paraId:11,tocIndex:18},{value:" \u7AEF\u70B9\uFF0C\u9700\u8981\u670D\u52A1\u5668\u652F\u6301\u6216\u81EA\u5B9A\u4E49\u68C0\u6D4B\u903B\u8F91",paraId:11,tocIndex:18},{value:"\u9690\u79C1\u8003\u8651",paraId:11,tocIndex:18},{value:"\uFF1A\u9891\u7E41\u7684\u7F51\u7EDC\u68C0\u6D4B\u53EF\u80FD\u4EA7\u751F\u989D\u5916\u6D41\u91CF",paraId:11,tocIndex:18},{value:"\u79FB\u52A8\u7AEF",paraId:11,tocIndex:18},{value:"\uFF1A\u79FB\u52A8\u8BBE\u5907\u7684\u7F51\u7EDC\u72B6\u6001\u53D8\u5316\u66F4\u9891\u7E41\uFF0C\u9700\u8981\u9002\u5F53\u7684\u9632\u6296\u5904\u7406",paraId:11,tocIndex:18},{value:"\u670D\u52A1\u7AEF\u6E32\u67D3",paraId:11,tocIndex:18},{value:"\uFF1A\u5728 SSR \u73AF\u5883\u4E2D\u9ED8\u8BA4\u8FD4\u56DE\u5728\u7EBF\u72B6\u6001",paraId:11,tocIndex:18}]}}]);
