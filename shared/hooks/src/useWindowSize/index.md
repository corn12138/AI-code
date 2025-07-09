# useWindowSize

窗口尺寸监听 Hook，监听浏览器窗口大小变化，支持防抖和服务端渲染。

## 基础用法

```javascript
import { useWindowSize } from '@ai-code/hooks';

function ResponsiveComponent() {
  const { width, height } = useWindowSize();

  return (
    <div>
      <h2>窗口尺寸</h2>
      <p>宽度: {width}px</p>
      <p>高度: {height}px</p>
      
      {width < 768 && <p>移动端视图</p>}
      {width >= 768 && width < 1024 && <p>平板视图</p>}
      {width >= 1024 && <p>桌面视图</p>}
    </div>
  );
}
```

## 高级用法

### 自定义防抖时间

```javascript
import { useWindowSize } from '@ai-code/hooks';

function CustomDebounce() {
  // 自定义防抖时间为 500ms
  const { width, height } = useWindowSize({
    debounceMs: 500
  });

  return (
    <div>
      <h2>慢速响应组件</h2>
      <p>当前尺寸: {width} x {height}</p>
      <p>防抖延迟: 500ms</p>
    </div>
  );
}
```

### 响应式布局

```javascript
import { useWindowSize } from '@ai-code/hooks';
import React, { useMemo } from 'react';

function ResponsiveLayout() {
  const { width } = useWindowSize();
  
  // 根据屏幕宽度计算布局
  const layout = useMemo(() => {
    if (width < 576) {
      return { columns: 1, sidebar: false, compact: true };
    } else if (width < 768) {
      return { columns: 2, sidebar: false, compact: true };
    } else if (width < 992) {
      return { columns: 2, sidebar: true, compact: false };
    } else if (width < 1200) {
      return { columns: 3, sidebar: true, compact: false };
    } else {
      return { columns: 4, sidebar: true, compact: false };
    }
  }, [width]);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${layout.columns}, 1fr)`,
      gap: layout.compact ? '8px' : '16px',
      padding: layout.compact ? '8px' : '16px'
    }}>
      <div>内容区域</div>
      <div>更多内容</div>
      {layout.columns > 2 && <div>额外内容</div>}
      {layout.columns > 3 && <div>更多额外内容</div>}
      
      {layout.sidebar && (
        <div style={{
          gridColumn: '1 / -1',
          marginTop: '16px',
          padding: '16px',
          backgroundColor: '#f5f5f5'
        }}>
          侧边栏内容
        </div>
      )}
    </div>
  );
}
```

### 条件渲染组件

```javascript
import { useWindowSize } from '@ai-code/hooks';

function ConditionalRendering() {
  const { width, height } = useWindowSize();
  
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isLandscape = width > height;

  return (
    <div>
      <h2>条件渲染示例</h2>
      
      {isMobile && (
        <div>
          <h3>移动端组件</h3>
          <button style={{ width: '100%', padding: '12px' }}>
            全宽按钮
          </button>
        </div>
      )}
      
      {isTablet && (
        <div style={{ display: 'flex', gap: '16px' }}>
          <h3>平板组件</h3>
          <button style={{ flex: 1, padding: '8px' }}>
            弹性按钮
          </button>
        </div>
      )}
      
      {isDesktop && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          <div>
            <h3>桌面组件</h3>
            <p>多列布局</p>
          </div>
          <div>
            <h3>第二列</h3>
            <p>更多内容</p>
          </div>
          <div>
            <h3>第三列</h3>
            <p>额外信息</p>
          </div>
        </div>
      )}
      
      {isLandscape && (
        <div style={{ 
          position: 'fixed', 
          top: '10px', 
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px'
        }}>
          横屏模式
        </div>
      )}
    </div>
  );
}
```

### 图表自适应

```javascript
import { useWindowSize } from '@ai-code/hooks';
import React, { useEffect, useRef } from 'react';

function ResponsiveChart() {
  const { width, height } = useWindowSize({
    debounceMs: 200 // 图表更新稍慢一些避免频繁重绘
  });
  
  const chartRef = useRef(null);
  
  // 计算图表尺寸
  const chartDimensions = {
    width: Math.max(300, width - 40), // 最小宽度 300px，留出边距
    height: Math.max(200, height * 0.6) // 最小高度 200px，占用 60% 屏幕高度
  };

  useEffect(() => {
    // 模拟图表库初始化/更新
    const initializeChart = () => {
      if (chartRef.current) {
        console.log('更新图表尺寸:', chartDimensions);
        // 这里可以调用图表库的 resize 方法
        // chart.resize(chartDimensions.width, chartDimensions.height);
      }
    };

    initializeChart();
  }, [chartDimensions.width, chartDimensions.height]);

  return (
    <div>
      <h2>自适应图表</h2>
      <div 
        ref={chartRef}
        style={{
          width: chartDimensions.width,
          height: chartDimensions.height,
          border: '1px solid #ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9f9f9'
        }}
      >
        <div>
          <p>图表区域</p>
          <p>{chartDimensions.width} x {chartDimensions.height}</p>
        </div>
      </div>
    </div>
  );
}
```

### 性能监控

```javascript
import { useWindowSize } from '@ai-code/hooks';
import { useState, useEffect } from 'react';

function PerformanceMonitor() {
  const { width, height } = useWindowSize({
    debounceMs: 50 // 快速响应用于监控
  });
  
  const [resizeCount, setResizeCount] = useState(0);
  const [lastResize, setLastResize] = useState(Date.now());

  useEffect(() => {
    setResizeCount(prev => prev + 1);
    setLastResize(Date.now());
  }, [width, height]);

  return (
    <div>
      <h2>窗口变化监控</h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginTop: '16px'
      }}>
        <div style={{ 
          padding: '16px', 
          border: '1px solid #ddd',
          borderRadius: '8px'
        }}>
          <h3>当前尺寸</h3>
          <p>宽度: {width}px</p>
          <p>高度: {height}px</p>
          <p>比例: {(width / height).toFixed(2)}</p>
        </div>
        
        <div style={{ 
          padding: '16px', 
          border: '1px solid #ddd',
          borderRadius: '8px'
        }}>
          <h3>变化统计</h3>
          <p>调整次数: {resizeCount}</p>
          <p>上次调整: {new Date(lastResize).toLocaleTimeString()}</p>
        </div>
        
        <div style={{ 
          padding: '16px', 
          border: '1px solid #ddd',
          borderRadius: '8px'
        }}>
          <h3>设备类型</h3>
          <p>{width < 576 ? '超小屏幕' : 
             width < 768 ? '小屏幕' :
             width < 992 ? '中等屏幕' :
             width < 1200 ? '大屏幕' : '超大屏幕'}</p>
          <p>方向: {width > height ? '横屏' : '竖屏'}</p>
        </div>
      </div>
    </div>
  );
}
```

### 自定义断点

```javascript
import { useWindowSize } from '@ai-code/hooks';
import { useMemo } from 'react';

// 自定义断点配置
const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400
};

function useBreakpoint() {
  const { width } = useWindowSize();
  
  return useMemo(() => {
    const current = Object.entries(breakpoints)
      .reverse()
      .find(([, breakpoint]) => width >= breakpoint)?.[0] || 'xs';
    
    return {
      current,
      isXs: current === 'xs',
      isSm: current === 'sm',
      isMd: current === 'md',
      isLg: current === 'lg',
      isXl: current === 'xl',
      isXxl: current === 'xxl',
      isSmUp: width >= breakpoints.sm,
      isMdUp: width >= breakpoints.md,
      isLgUp: width >= breakpoints.lg,
      isXlUp: width >= breakpoints.xl,
      isSmDown: width < breakpoints.md,
      isMdDown: width < breakpoints.lg,
      isLgDown: width < breakpoints.xl,
    };
  }, [width]);
}

function BreakpointExample() {
  const breakpoint = useBreakpoint();
  
  return (
    <div>
      <h2>断点系统示例</h2>
      <p>当前断点: <strong>{breakpoint.current}</strong></p>
      
      <div style={{ marginTop: '16px' }}>
        {breakpoint.isXs && <p>超小屏幕内容</p>}
        {breakpoint.isSm && <p>小屏幕内容</p>}
        {breakpoint.isMd && <p>中等屏幕内容</p>}
        {breakpoint.isLg && <p>大屏幕内容</p>}
        {breakpoint.isXl && <p>超大屏幕内容</p>}
      </div>
      
      <div style={{ marginTop: '16px' }}>
        {breakpoint.isMdUp && <p>中等屏幕及以上显示</p>}
        {breakpoint.isSmDown && <p>小屏幕及以下显示</p>}
      </div>
    </div>
  );
}
```

## API

### 参数

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| options | `UseWindowSizeOptions` | ❌ | 配置选项 |

### UseWindowSizeOptions

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| debounceMs | `number` | `100` | 防抖延迟时间（毫秒） |
| initialWidth | `number` | `1024` | SSR 初始宽度 |
| initialHeight | `number` | `768` | SSR 初始高度 |

### 返回值

返回 `WindowSize` 对象：

| 属性 | 类型 | 描述 |
|------|------|------|
| width | `number` | 窗口宽度（像素） |
| height | `number` | 窗口高度（像素） |

## 使用场景

### 1. 响应式组件

```javascript
function ResponsiveGrid() {
  const { width } = useWindowSize();
  
  const columns = width < 768 ? 1 : width < 1200 ? 2 : 3;
  
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '16px'
    }}>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} style={{ 
          padding: '20px', 
          backgroundColor: '#f0f0f0',
          textAlign: 'center'
        }}>
          项目 {i + 1}
        </div>
      ))}
    </div>
  );
}
```

### 2. 导航栏适配

```javascript
function ResponsiveNavbar() {
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
        <button>☰</button>
      ) : (
        <div style={{ display: 'flex', gap: '20px' }}>
          <a href="#home">首页</a>
          <a href="#about">关于</a>
          <a href="#services">服务</a>
          <a href="#contact">联系</a>
        </div>
      )}
    </nav>
  );
}
```

### 3. 模态框适配

```javascript
function ResponsiveModal({ isOpen, onClose, children }) {
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
            <h3>标题</h3>
            <button onClick={onClose}>×</button>
          </div>
        )}
        <div style={{ padding: '20px' }}>
          {children}
        </div>
      </div>
    </>
  );
}
```

## 最佳实践

### 1. 性能优化

```javascript
// 使用合适的防抖时间
const { width } = useWindowSize({
  debounceMs: 150 // 平衡响应性和性能
});

// 避免在 render 中进行复杂计算
const layout = useMemo(() => {
  return calculateLayout(width);
}, [width]);
```

### 2. 服务端渲染

```javascript
// 设置合理的初始值避免水合不匹配
const { width, height } = useWindowSize({
  initialWidth: 1200,  // 常见桌面宽度
  initialHeight: 800   // 常见桌面高度
});

// 在客户端渲染完成前显示默认布局
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

if (!mounted) {
  return <DefaultLayout />;
}
```

### 3. 条件渲染优化

```javascript
// 使用常量避免重复计算
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

function OptimizedComponent() {
  const { width } = useWindowSize();
  
  // 缓存断点判断结果
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
```

## 注意事项

1. **防抖设置**：根据使用场景设置合适的防抖时间，图表等重渲染组件建议使用更长的防抖时间
2. **服务端渲染**：在 SSR 环境中会使用初始值，需要处理客户端水合时的尺寸差异
3. **性能影响**：频繁的窗口大小变化可能导致大量重渲染，建议使用 useMemo 优化计算
4. **内存泄漏**：Hook 会自动清理事件监听器，无需手动处理
5. **移动端**：在移动端要注意虚拟键盘弹出时会改变窗口高度 