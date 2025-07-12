# Hooks 独立性实施记录

## 项目信息
- 包名：`@corn12138/hooks`
- 版本：1.0.0
- 描述：🎣 A collection of powerful React hooks for modern web development

## 修改的文件列表

### Blog 应用
- `src/hooks/useAuth.tsx` - 重新导出@corn12138/hooks
- `src/hooks/useClientSide.ts` - 重新导出@corn12138/hooks
- `src/hooks/useDebounce.ts` - 重新导出@corn12138/hooks
- `src/components/common/Header.tsx` - 使用@corn12138/hooks
- `src/components/auth/Login.tsx` - 使用@corn12138/hooks
- `src/components/ClientWrapper.tsx` - 使用@corn12138/hooks
- `src/components/ClientProviders.tsx` - 使用@corn12138/hooks
- `src/components/CommentSection.tsx` - 使用@corn12138/hooks
- `src/components/layout/Navbar.tsx` - 使用@corn12138/hooks
- `src/components/auth/RequireAuth.tsx` - 使用@corn12138/hooks
- `src/components/blog/CommentSection.tsx` - 使用@corn12138/hooks

### Lowcode 应用
- `src/components/Layout/Navbar.tsx` - 使用@corn12138/hooks
- `src/pages/Login.tsx` - 使用@corn12138/hooks
- `src/pages/Home.tsx` - 使用@corn12138/hooks
- `src/main.tsx` - 使用@corn12138/hooks
- `src/App.tsx` - 使用@corn12138/hooks

## 代码示例
```typescript
// Header.tsx
import { useAuth, useClientSide } from '@corn12138/hooks';

// NetworkStatus.tsx
import { useNetworkStatus } from '@corn12138/hooks';
```

## 技术架构

### 构建配置

使用Father 4.x进行构建：

```typescript
// .fatherrc.ts
import { defineConfig } from 'father';

export default defineConfig({
  esm: {
    output: 'dist',
  },
  cjs: {
    output: 'dist',
  },
  platform: 'browser',
});
```

### 包结构

```
shared/hooks/
├── src/
│   ├── index.ts                 # 主入口文件
│   ├── useAuth/
│   │   ├── index.tsx           # 认证hook
│   │   └── index.md            # 文档
│   ├── useAsync/
│   │   ├── index.ts            # 异步操作hook
│   │   └── index.md            # 文档
│   ├── useClientSide/
│   │   ├── index.ts            # 客户端hook
│   │   └── index.md            # 文档
│   ├── useDebounce/
│   │   ├── index.ts            # 防抖hook
│   │   └── index.md            # 文档
│   ├── useForm/
│   │   ├── index.ts            # 表单hook
│   │   └── index.md            # 文档
│   ├── useLocalStorage/
│   │   ├── index.ts            # 本地存储hook
│   │   └── index.md            # 文档
│   ├── useNetworkStatus/
│   │   ├── index.ts            # 网络状态hook
│   │   └── index.md            # 文档
│   ├── useWindowSize/
│   │   ├── index.ts            # 窗口大小hook
│   │   └── index.md            # 文档
│   ├── useApi/
│   │   ├── index.ts            # API请求hook
│   │   └── index.md            # 文档
│   └── useEditor/
│       ├── index.ts            # 编辑器hook
│       └── index.md            # 文档
├── dist/                        # 构建输出
├── docs/                        # 额外文档
├── package.json
├── .fatherrc.ts
└── tsconfig.json
```

## 消除的重复代码

### 原始状态（重复实现）

**Blog项目:**
```typescript
// apps/blog/src/hooks/useClientSide.ts
export default function useClientSide() {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);
    return isClient;
}

// apps/blog/src/utils/clientUtils.ts
export function useClientSide() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        return () => {
            setMounted(false);
        };
    }, []);
    return mounted;
}

// apps/blog/src/utils/hydrationHelper.ts
export function useClientOnly(callback, deps = []) {
    const [value, setValue] = useState(null);
    useEffect(() => {
        setValue(callback());
    }, deps);
    return value;
}
```

**LowCode项目:**
```typescript
// apps/lowcode/src/components/NetworkStatus.tsx
const [isOnline, setIsOnline] = useState(true);
useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => {
        setIsOnline(true);
        // ...
    };
    const handleOffline = () => {
        setIsOnline(false);
        // ...
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    // ...
}, []);
```

### 统一后的实现

**统一的hooks包:**
```typescript
// shared/hooks/src/useClientSide/index.ts
export function useClientSide() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    return () => setIsClient(false);
  }, []);
  
  return isClient;
}

// shared/hooks/src/useNetworkStatus/index.ts
export function useNetworkStatus(options = {}) {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  );
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOnline = () => {
      setIsOnline(true);
      options.onOnline?.();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      options.onOffline?.();
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [options]);
  
  return { isOnline };
}
```

## 使用示例

### 在Blog项目中使用

```typescript
// apps/blog/src/components/common/Header.tsx
import { useAuth, useClientSide } from '@corn12138/hooks';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const isClient = useClientSide();
  
  if (!isClient) {
    return <div>Loading...</div>;
  }
  
  return (
    <header>
      {isAuthenticated ? (
        <div>Welcome, {user?.name}!</div>
      ) : (
        <div>Please login</div>
      )}
    </header>
  );
}
```

### 在LowCode项目中使用

```typescript
// apps/lowcode/src/components/NetworkStatus.tsx
import { useNetworkStatus } from '@corn12138/hooks';

export default function NetworkStatus() {
  const { isOnline } = useNetworkStatus({
    onOnline: () => {
      toast.success('网络连接已恢复');
    },
    onOffline: () => {
      toast.warning('网络连接已断开');
    }
  });
  
  return (
    <div className={isOnline ? 'online' : 'offline'}>
      {isOnline ? '在线' : '离线'}
    </div>
  );
}
```

## 构建和测试

### 构建命令

```bash
# 构建hooks包
cd shared/hooks
pnpm build

# 构建成功后的产物
dist/
├── index.js
├── index.d.ts
├── useAuth/
│   ├── index.js
│   └── index.d.ts
├── useAsync/
│   ├── index.js
│   └── index.d.ts
└── ...
```

### 测试命令

```bash
# 启动Blog项目
cd apps/blog
pnpm dev

# 启动LowCode项目
cd apps/lowcode
pnpm dev

# 启动Hooks文档
cd shared/hooks
pnpm dev
```

## 优势总结

### 1. 代码复用性提升
- ✅ 消除了重复的hooks实现
- ✅ 统一的API接口
- ✅ 更好的类型安全

### 2. 维护性改善
- ✅ 集中管理所有hooks
- ✅ 统一的版本控制
- ✅ 便于单元测试

### 3. 开发效率提升
- ✅ 完整的TypeScript支持
- ✅ 详细的文档和示例
- ✅ 开箱即用的功能

### 4. 项目架构优化
- ✅ 更清晰的依赖关系
- ✅ 模块化的设计
- ✅ 易于扩展和修改

## 下一步计划

1. **完善文档**: 为每个hook添加更详细的使用示例和最佳实践
2. **添加单元测试**: 确保hooks的可靠性
3. **性能优化**: 优化hooks的性能和内存使用
4. **发布到NPM**: 考虑发布为公共包供其他项目使用

## 结论

通过这次hooks独立化工作，我们成功地：
- 统一了项目中的hooks管理
- 提升了代码的可维护性和复用性
- 建立了完整的文档系统
- 优化了项目架构

这为AI-Code项目的后续开发奠定了坚实的基础，也为其他类似项目提供了参考。 