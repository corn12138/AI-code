"use strict";(self.webpackChunk_corn12138_hooks=self.webpackChunk_corn12138_hooks||[]).push([[983],{80983:function(o,n,e){e.r(n),e.d(n,{texts:function(){return t}});const t=[{value:"\u7F51\u7EDC\u72B6\u6001\u76D1\u63A7 Hook\uFF0C\u5B9E\u65F6\u76D1\u6D4B\u7F51\u7EDC\u8FDE\u63A5\u72B6\u6001\uFF0C\u652F\u6301\u91CD\u8FDE\u68C0\u6D4B\u548C\u72B6\u6001\u56DE\u8C03\u3002",paraId:0,tocIndex:0},{value:`import { useNetworkStatus } from '@ai-code/hooks';

function NetworkIndicator() {
  const { isOnline, reconnect, checkConnectivity } = useNetworkStatus();

  const handleReconnect = async () => {
    const isConnected = await checkConnectivity();
    console.log('\u7F51\u7EDC\u8FDE\u63A5\u68C0\u6D4B\u7ED3\u679C:', isConnected);
  };

  return (
    <div>
      <div style={{
        padding: '12px',
        borderRadius: '6px',
        backgroundColor: isOnline ? '#d4edda' : '#f8d7da',
        color: isOnline ? '#155724' : '#721c24',
        border: \`1px solid \${isOnline ? '#c3e6cb' : '#f5c6cb'}\`
      }}>
        <h3>\u7F51\u7EDC\u72B6\u6001</h3>
        <p>\u72B6\u6001: {isOnline ? '\u5728\u7EBF' : '\u79BB\u7EBF'}</p>
        
        {!isOnline && (
          <div>
            <p>\u7F51\u7EDC\u8FDE\u63A5\u5DF2\u65AD\u5F00\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u8BBE\u7F6E</p>
            <button onClick={reconnect}>\u91CD\u65B0\u8FDE\u63A5</button>
            <button onClick={handleReconnect}>\u624B\u52A8\u68C0\u6D4B</button>
          </div>
        )}
      </div>
    </div>
  );
}
`,paraId:1,tocIndex:1},{value:`import { useNetworkStatus } from '@ai-code/hooks';
import { useState } from 'react';

function NetworkStatusWithCallbacks() {
  const [messages, setMessages] = useState([]);
  
  const { isOnline, reconnect } = useNetworkStatus({
    onOnline: () => {
      console.log('\u7F51\u7EDC\u5DF2\u8FDE\u63A5');
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'success',
        text: '\u7F51\u7EDC\u8FDE\u63A5\u5DF2\u6062\u590D',
        time: new Date().toLocaleTimeString()
      }]);
      
      // \u7F51\u7EDC\u6062\u590D\u65F6\u7684\u5904\u7406\u903B\u8F91
      // \u6BD4\u5982\u91CD\u65B0\u53D1\u9001\u5931\u8D25\u7684\u8BF7\u6C42\u3001\u540C\u6B65\u79BB\u7EBF\u6570\u636E\u7B49
      console.log('\u7F51\u7EDC\u6062\u590D\uFF0C\u53EF\u4EE5\u6267\u884C\u6570\u636E\u540C\u6B65\u64CD\u4F5C');
    },
    onOffline: () => {
      console.log('\u7F51\u7EDC\u5DF2\u65AD\u5F00');
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'error', 
        text: '\u7F51\u7EDC\u8FDE\u63A5\u5DF2\u65AD\u5F00',
        time: new Date().toLocaleTimeString()
      }]);
      
      // \u7F51\u7EDC\u65AD\u5F00\u65F6\u7684\u5904\u7406\u903B\u8F91
      // \u6BD4\u5982\u7F13\u5B58\u672A\u53D1\u9001\u7684\u6570\u636E\u3001\u5207\u6362\u5230\u79BB\u7EBF\u6A21\u5F0F\u7B49
    }
  });

  const clearMessages = () => setMessages([]);

  return (
    <div>
      <div style={{
        padding: '16px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        marginBottom: '16px'
      }}>
        <h3>\u7F51\u7EDC\u72B6\u6001\u76D1\u63A7</h3>
        <p>\u5F53\u524D\u72B6\u6001: <strong style={{color: isOnline ? 'green' : 'red'}}>
          {isOnline ? '\u5728\u7EBF' : '\u79BB\u7EBF'}
        </strong></p>
        
        <div style={{ marginTop: '12px' }}>
          <button onClick={reconnect}>\u68C0\u67E5\u8FDE\u63A5</button>
          <button onClick={clearMessages} style={{ marginLeft: '8px' }}>
            \u6E05\u9664\u65E5\u5FD7
          </button>
        </div>
      </div>
      
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        maxHeight: '200px',
        overflowY: 'auto'
      }}>
        <h4>\u7F51\u7EDC\u72B6\u6001\u65E5\u5FD7</h4>
        {messages.length === 0 ? (
          <p style={{ color: '#666' }}>\u6682\u65E0\u65E5\u5FD7</p>
        ) : (
          messages.map(message => (
            <div key={message.id} style={{
              padding: '8px',
              margin: '4px 0',
              borderRadius: '4px',
              backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
              color: message.type === 'success' ? '#155724' : '#721c24'
            }}>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>
                {message.time}
              </span>
              <span style={{ marginLeft: '8px' }}>{message.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
`,paraId:2,tocIndex:3},{value:`import { useNetworkStatus } from '@ai-code/hooks';
import { useLocalStorage } from '@ai-code/hooks';
import { useState, useEffect } from 'react';

function OfflineDataSync() {
  const { isOnline } = useNetworkStatus({
    onOnline: async () => {
      // \u7F51\u7EDC\u6062\u590D\u65F6\u540C\u6B65\u79BB\u7EBF\u6570\u636E
      await syncOfflineData();
    }
  });
  
  const [offlineQueue, setOfflineQueue] = useLocalStorage('offlineQueue', []);
  const [isSyncing, setIsSyncing] = useState(false);

  const syncOfflineData = async () => {
    if (offlineQueue.length === 0) return;
    
    setIsSyncing(true);
    
    try {
      for (const item of offlineQueue) {
        // \u6A21\u62DF\u53D1\u9001\u79BB\u7EBF\u6570\u636E
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
      }
      
      // \u540C\u6B65\u6210\u529F\u540E\u6E05\u7A7A\u961F\u5217
      setOfflineQueue([]);
      console.log('\u79BB\u7EBF\u6570\u636E\u540C\u6B65\u5B8C\u6210');
    } catch (error) {
      console.error('\u79BB\u7EBF\u6570\u636E\u540C\u6B65\u5931\u8D25:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const addOfflineData = (data) => {
    if (isOnline) {
      // \u5728\u7EBF\u65F6\u76F4\u63A5\u53D1\u9001
      sendDataOnline(data);
    } else {
      // \u79BB\u7EBF\u65F6\u52A0\u5165\u961F\u5217
      setOfflineQueue(prev => [...prev, {
        ...data,
        timestamp: Date.now(),
        id: Date.now().toString()
      }]);
    }
  };

  const sendDataOnline = async (data) => {
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      console.log('\u6570\u636E\u53D1\u9001\u6210\u529F');
    } catch (error) {
      // \u53D1\u9001\u5931\u8D25\u65F6\u52A0\u5165\u79BB\u7EBF\u961F\u5217
      addOfflineData(data);
    }
  };

  return (
    <div>
      <div style={{
        padding: '16px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        marginBottom: '16px'
      }}>
        <h3>\u79BB\u7EBF\u6570\u636E\u540C\u6B65</h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span>\u7F51\u7EDC\u72B6\u6001:</span>
          <span style={{
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: isOnline ? '#d4edda' : '#f8d7da',
            color: isOnline ? '#155724' : '#721c24'
          }}>
            {isOnline ? '\u5728\u7EBF' : '\u79BB\u7EBF'}
          </span>
          
          {isSyncing && (
            <span style={{ color: '#007bff' }}>\u6B63\u5728\u540C\u6B65...</span>
          )}
        </div>
        
        <p>\u79BB\u7EBF\u961F\u5217: {offlineQueue.length} \u9879\u5F85\u540C\u6B65</p>
        
        <div style={{ marginTop: '12px' }}>
          <button onClick={() => addOfflineData({ 
            action: 'create', 
            data: { name: '\u6D4B\u8BD5\u6570\u636E', value: Math.random() }
          })}>
            \u6DFB\u52A0\u6570\u636E (\u81EA\u52A8\u68C0\u6D4B\u7F51\u7EDC\u72B6\u6001)
          </button>
          
          {isOnline && offlineQueue.length > 0 && (
            <button 
              onClick={syncOfflineData}
              style={{ marginLeft: '8px' }}
              disabled={isSyncing}
            >
              \u624B\u52A8\u540C\u6B65\u79BB\u7EBF\u6570\u636E
            </button>
          )}
        </div>
      </div>
      
      {offlineQueue.length > 0 && (
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <h4>\u79BB\u7EBF\u961F\u5217</h4>
          {offlineQueue.map(item => (
            <div key={item.id} style={{
              padding: '8px',
              margin: '4px 0',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              <div>\u64CD\u4F5C: {item.action}</div>
              <div>\u65F6\u95F4: {new Date(item.timestamp).toLocaleString()}</div>
              <div>\u6570\u636E: {JSON.stringify(item.data)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`,paraId:3,tocIndex:4},{value:`import { useNetworkStatus } from '@ai-code/hooks';
import { useState, useEffect, useRef } from 'react';

function NetworkQualityMonitor() {
  const { isOnline, checkConnectivity } = useNetworkStatus();
  const [ping, setPing] = useState(null);
  const [quality, setQuality] = useState('unknown');
  const intervalRef = useRef(null);

  const measurePing = async () => {
    if (!isOnline) return;
    
    const startTime = performance.now();
    try {
      const isConnected = await checkConnectivity();
      const endTime = performance.now();
      const pingTime = endTime - startTime;
      
      if (isConnected) {
        setPing(Math.round(pingTime));
        
        // \u6839\u636E\u5EF6\u8FDF\u5224\u65AD\u7F51\u7EDC\u8D28\u91CF
        if (pingTime < 100) {
          setQuality('excellent');
        } else if (pingTime < 300) {
          setQuality('good');
        } else if (pingTime < 1000) {
          setQuality('fair');
        } else {
          setQuality('poor');
        }
      } else {
        setPing(null);
        setQuality('disconnected');
      }
    } catch (error) {
      setPing(null);
      setQuality('error');
    }
  };

  useEffect(() => {
    if (isOnline) {
      measurePing();
      intervalRef.current = setInterval(measurePing, 10000); // \u6BCF10\u79D2\u68C0\u6D4B\u4E00\u6B21
    } else {
      setPing(null);
      setQuality('offline');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isOnline]);

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'excellent': return '#28a745';
      case 'good': return '#17a2b8';
      case 'fair': return '#ffc107';
      case 'poor': return '#fd7e14';
      case 'offline':
      case 'disconnected':
      case 'error': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getQualityText = (quality) => {
    switch (quality) {
      case 'excellent': return '\u4F18\u79C0';
      case 'good': return '\u826F\u597D';
      case 'fair': return '\u4E00\u822C';
      case 'poor': return '\u8F83\u5DEE';
      case 'offline': return '\u79BB\u7EBF';
      case 'disconnected': return '\u65E0\u8FDE\u63A5';
      case 'error': return '\u68C0\u6D4B\u5931\u8D25';
      default: return '\u672A\u77E5';
    }
  };

  return (
    <div style={{
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      textAlign: 'center'
    }}>
      <h3>\u7F51\u7EDC\u8D28\u91CF\u76D1\u63A7</h3>
      
      <div style={{
        display: 'inline-block',
        padding: '20px',
        borderRadius: '50%',
        backgroundColor: getQualityColor(quality),
        color: 'white',
        fontSize: '18px',
        fontWeight: 'bold',
        minWidth: '80px',
        minHeight: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        {ping !== null ? \`\${ping}ms\` : '--'}
        <div style={{ fontSize: '12px', marginTop: '4px' }}>
          {getQualityText(quality)}
        </div>
      </div>
      
      <div style={{ marginTop: '16px' }}>
        <button onClick={measurePing} disabled={!isOnline}>
          \u7ACB\u5373\u68C0\u6D4B
        </button>
      </div>
      
      <div style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
        {isOnline ? '\u81EA\u52A8\u6BCF10\u79D2\u68C0\u6D4B\u4E00\u6B21' : '\u7F51\u7EDC\u79BB\u7EBF'}
      </div>
    </div>
  );
}
`,paraId:4,tocIndex:5},{value:`import { useNetworkStatus } from '@ai-code/hooks';
import { useState, useEffect, useRef } from 'react';

function SmartReconnect() {
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const reconnectTimeoutRef = useRef(null);
  const maxReconnectAttempts = 5;

  const { isOnline, checkConnectivity } = useNetworkStatus({
    onOnline: () => {
      setReconnectAttempts(0);
      setIsReconnecting(false);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    },
    onOffline: () => {
      startReconnectProcess();
    }
  });

  const startReconnectProcess = () => {
    if (isReconnecting || reconnectAttempts >= maxReconnectAttempts) return;
    
    setIsReconnecting(true);
    attemptReconnect();
  };

  const attemptReconnect = async () => {
    const newAttempts = reconnectAttempts + 1;
    setReconnectAttempts(newAttempts);
    
    try {
      const isConnected = await checkConnectivity();
      
      if (isConnected) {
        setIsReconnecting(false);
        setReconnectAttempts(0);
        return;
      }
    } catch (error) {
      console.error('\u91CD\u8FDE\u68C0\u6D4B\u5931\u8D25:', error);
    }

    // \u5982\u679C\u8FD8\u6CA1\u8FBE\u5230\u6700\u5927\u91CD\u8FDE\u6B21\u6570\uFF0C\u7EE7\u7EED\u5C1D\u8BD5
    if (newAttempts < maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(2, newAttempts - 1), 30000); // \u6307\u6570\u9000\u907F\uFF0C\u6700\u592730\u79D2
      
      reconnectTimeoutRef.current = setTimeout(() => {
        attemptReconnect();
      }, delay);
    } else {
      setIsReconnecting(false);
    }
  };

  const manualReconnect = () => {
    setReconnectAttempts(0);
    setIsReconnecting(false);
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    startReconnectProcess();
  };

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const getNextRetryTime = () => {
    if (!isReconnecting || reconnectAttempts >= maxReconnectAttempts) return 0;
    return Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 30000);
  };

  return (
    <div style={{
      padding: '16px',
      border: '1px solid #ddd',
      borderRadius: '8px'
    }}>
      <h3>\u667A\u80FD\u91CD\u8FDE\u673A\u5236</h3>
      
      <div style={{ marginBottom: '16px' }}>
        <div>\u7F51\u7EDC\u72B6\u6001: 
          <span style={{
            marginLeft: '8px',
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: isOnline ? '#d4edda' : '#f8d7da',
            color: isOnline ? '#155724' : '#721c24'
          }}>
            {isOnline ? '\u5728\u7EBF' : '\u79BB\u7EBF'}
          </span>
        </div>
        
        {!isOnline && (
          <div style={{ marginTop: '8px' }}>
            <div>\u91CD\u8FDE\u5C1D\u8BD5: {reconnectAttempts} / {maxReconnectAttempts}</div>
            
            {isReconnecting && (
              <div style={{ color: '#007bff' }}>
                \u6B63\u5728\u91CD\u8FDE... 
                {getNextRetryTime() > 0 && (
                  <span style={{ fontSize: '14px', marginLeft: '8px' }}>
                    \u4E0B\u6B21\u5C1D\u8BD5: {(getNextRetryTime() / 1000).toFixed(0)}\u79D2\u540E
                  </span>
                )}
              </div>
            )}
            
            {reconnectAttempts >= maxReconnectAttempts && !isReconnecting && (
              <div style={{ color: '#dc3545' }}>
                \u91CD\u8FDE\u5931\u8D25\uFF0C\u5DF2\u8FBE\u5230\u6700\u5927\u5C1D\u8BD5\u6B21\u6570
              </div>
            )}
          </div>
        )}
      </div>
      
      <div>
        <button 
          onClick={manualReconnect} 
          disabled={isOnline || (isReconnecting && reconnectAttempts < maxReconnectAttempts)}
        >
          \u624B\u52A8\u91CD\u8FDE
        </button>
      </div>
    </div>
  );
}
`,paraId:5,tocIndex:6},{value:"\u53C2\u6570",paraId:6,tocIndex:8},{value:"\u7C7B\u578B",paraId:6,tocIndex:8},{value:"\u5FC5\u586B",paraId:6,tocIndex:8},{value:"\u63CF\u8FF0",paraId:6,tocIndex:8},{value:"options",paraId:6,tocIndex:8},{value:"UseNetworkStatusOptions",paraId:6,tocIndex:8},{value:"\u274C",paraId:6,tocIndex:8},{value:"\u914D\u7F6E\u9009\u9879",paraId:6,tocIndex:8},{value:"\u5C5E\u6027",paraId:7,tocIndex:9},{value:"\u7C7B\u578B",paraId:7,tocIndex:9},{value:"\u9ED8\u8BA4\u503C",paraId:7,tocIndex:9},{value:"\u63CF\u8FF0",paraId:7,tocIndex:9},{value:"onOnline",paraId:7,tocIndex:9},{value:"() => void",paraId:7,tocIndex:9},{value:"-",paraId:7,tocIndex:9},{value:"\u7F51\u7EDC\u8FDE\u63A5\u56DE\u8C03",paraId:7,tocIndex:9},{value:"onOffline",paraId:7,tocIndex:9},{value:"() => void",paraId:7,tocIndex:9},{value:"-",paraId:7,tocIndex:9},{value:"\u7F51\u7EDC\u65AD\u5F00\u56DE\u8C03",paraId:7,tocIndex:9},{value:"\u8FD4\u56DE ",paraId:8,tocIndex:10},{value:"UseNetworkStatusReturn",paraId:8,tocIndex:10},{value:" \u5BF9\u8C61\uFF1A",paraId:8,tocIndex:10},{value:"\u5C5E\u6027",paraId:9,tocIndex:10},{value:"\u7C7B\u578B",paraId:9,tocIndex:10},{value:"\u63CF\u8FF0",paraId:9,tocIndex:10},{value:"isOnline",paraId:9,tocIndex:10},{value:"boolean",paraId:9,tocIndex:10},{value:"\u662F\u5426\u5728\u7EBF",paraId:9,tocIndex:10},{value:"reconnect",paraId:9,tocIndex:10},{value:"() => void",paraId:9,tocIndex:10},{value:"\u91CD\u65B0\u68C0\u6D4B\u8FDE\u63A5",paraId:9,tocIndex:10},{value:"checkConnectivity",paraId:9,tocIndex:10},{value:"() => Promise<boolean>",paraId:9,tocIndex:10},{value:"\u5F02\u6B65\u68C0\u6D4B\u8FDE\u901A\u6027",paraId:9,tocIndex:10},{value:`function OfflineNotification() {
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
`,paraId:10,tocIndex:12},{value:`function NetworkDependentFeatures() {
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
`,paraId:11,tocIndex:13},{value:`function DataSyncStatus() {
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
`,paraId:12,tocIndex:14},{value:`function GracefulDegradation() {
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
`,paraId:13,tocIndex:16},{value:`function NetworkAwareErrorBoundary({ children }) {
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
`,paraId:14,tocIndex:17},{value:`// \u907F\u514D\u8FC7\u5EA6\u68C0\u6D4B
const { isOnline, checkConnectivity } = useNetworkStatus();

// \u4F7F\u7528\u9632\u6296\u907F\u514D\u9891\u7E41\u68C0\u6D4B
const debouncedCheck = useDebouncedCallback(checkConnectivity, 1000);
`,paraId:15,tocIndex:18},{value:"\u6D4F\u89C8\u5668\u517C\u5BB9\u6027",paraId:16,tocIndex:19},{value:"\uFF1A\u4F9D\u8D56 ",paraId:16,tocIndex:19},{value:"navigator.onLine",paraId:16,tocIndex:19},{value:" API\uFF0C\u5728\u67D0\u4E9B\u73AF\u5883\u4E0B\u53EF\u80FD\u4E0D\u51C6\u786E",paraId:16,tocIndex:19},{value:"\u8FDE\u901A\u6027\u68C0\u6D4B",paraId:16,tocIndex:19},{value:"\uFF1A\u9ED8\u8BA4\u8BF7\u6C42 ",paraId:16,tocIndex:19},{value:"/ping",paraId:16,tocIndex:19},{value:" \u7AEF\u70B9\uFF0C\u9700\u8981\u670D\u52A1\u5668\u652F\u6301\u6216\u81EA\u5B9A\u4E49\u68C0\u6D4B\u903B\u8F91",paraId:16,tocIndex:19},{value:"\u9690\u79C1\u8003\u8651",paraId:16,tocIndex:19},{value:"\uFF1A\u9891\u7E41\u7684\u7F51\u7EDC\u68C0\u6D4B\u53EF\u80FD\u4EA7\u751F\u989D\u5916\u6D41\u91CF",paraId:16,tocIndex:19},{value:"\u79FB\u52A8\u7AEF",paraId:16,tocIndex:19},{value:"\uFF1A\u79FB\u52A8\u8BBE\u5907\u7684\u7F51\u7EDC\u72B6\u6001\u53D8\u5316\u66F4\u9891\u7E41\uFF0C\u9700\u8981\u9002\u5F53\u7684\u9632\u6296\u5904\u7406",paraId:16,tocIndex:19},{value:"\u670D\u52A1\u7AEF\u6E32\u67D3",paraId:16,tocIndex:19},{value:"\uFF1A\u5728 SSR \u73AF\u5883\u4E2D\u9ED8\u8BA4\u8FD4\u56DE\u5728\u7EBF\u72B6\u6001",paraId:16,tocIndex:19}]}}]);
