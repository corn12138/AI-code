# useWindowSize

用于获取窗口尺寸的 React Hook。

## 基本用法

```tsx
import { useWindowSize } from '@corn12138/hooks';

function WindowInfo() {
  const { width, height } = useWindowSize();
  
  return (
    <div>
      <p>Window Size: {width} x {height}</p>
    </div>
  );
}
```

## 响应式组件

```tsx
import { useWindowSize } from '@corn12138/hooks';

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
}
```

## 动态样式

```tsx
import { useWindowSize } from '@corn12138/hooks';

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
        gridTemplateColumns: `repeat(${getColumns()}, 1fr)`,
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
}
```

## 性能优化

```tsx
import { useWindowSize } from '@corn12138/hooks';

function OptimizedComponent() {
  const { width, height } = useWindowSize();
  
  // 使用 useMemo 优化计算
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
}
```

## 条件渲染

```tsx
import { useWindowSize } from '@corn12138/hooks';

function ConditionalRender() {
  const { width, height } = useWindowSize();
  
  // 只在大屏幕上显示侧边栏
  const showSidebar = width > 1024;
  
  // 在小屏幕上显示简化版本
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
}
```

## 图片响应式

```tsx
import { useWindowSize } from '@corn12138/hooks';

function ResponsiveImage() {
  const { width } = useWindowSize();
  
  const getImageSize = () => {
    if (width < 600) return 'small';
    if (width < 1200) return 'medium';
    return 'large';
  };
  
  return (
    <img 
      src={`/images/hero-${getImageSize()}.jpg`}
      alt="Hero Image"
      style={{
        width: '100%',
        height: 'auto',
        maxWidth: width < 600 ? '100%' : '800px'
      }}
    />
  );
}
```

## 虚拟滚动

```tsx
import { useWindowSize } from '@corn12138/hooks';

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