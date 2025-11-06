# 博客系统迁移指南

## 📋 概述

本指南将帮助你将现有的博客系统平滑迁移到新的增强版本，享受更好的性能和用户体验。

## 🚀 快速迁移步骤

### 1. 更新依赖

```bash
# 更新hooks库到最新版本
npm install @corn12138/hooks@latest

# 安装新的依赖
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install react-hot-toast
```

### 2. 替换Provider组件

将原有的`ClientProviders`替换为`ClientProvidersEnhanced`：

```tsx
// ❌ 旧版本
// import ClientProviders from './components/ClientProviders';

// ✅ 新版本
import ClientProvidersEnhanced from './components/ClientProvidersEnhanced';

export default function RootLayout({ children }) {
    return (
        <html lang="zh-CN">
            <body>
                <ClientProvidersEnhanced>
                    {children}
                </ClientProvidersEnhanced>
            </body>
        </html>
    );
}
```

### 3. 升级认证逻辑

将原有的`useAuth`替换为`useAuthSecure`：

```tsx
// ❌ 旧版本
// import { useAuth } from '@corn12138/hooks';

// ✅ 新版本
import { useAuthSecure } from '@corn12138/hooks';

export default function MyComponent() {
    // ❌ 旧版本
    // const { isAuthenticated, user, login, logout } = useAuth();

    // ✅ 新版本
    const { 
        isAuthenticated, 
        user, 
        login, 
        logout,
        loading,
        error,
        clearError 
    } = useAuthSecure();

    const handleLogin = async (credentials) => {
        const result = await login(credentials);
        if (!result.success) {
            // 处理登录失败
            console.error(result.error);
        }
    };

    return (
        // 组件内容
    );
}
```

### 4. 升级布局组件

将`MainLayout`替换为`MainLayoutEnhanced`：

```tsx
// ❌ 旧版本
// import MainLayout from '../components/layout/MainLayout';

// ✅ 新版本
import MainLayoutEnhanced from '../components/layout/MainLayoutEnhanced';

export default function HomePage() {
    return (
        <div>
            <TopNavbar />
            <MainLayoutEnhanced>
                {/* 页面内容 */}
            </MainLayoutEnhanced>
        </div>
    );
}
```

### 5. 添加页面状态管理

在需要状态持久化的页面中添加`usePageState`：

```tsx
import { usePageState } from '@corn12138/hooks';

export default function ArticlePage() {
    const {
        saveScrollPosition,
        restoreScrollPosition,
        saveCustomData,
        getCustomData
    } = usePageState({
        enableScrollRestoration: true,
        enableFormPersistence: true,
        enableRouteCache: true
    });

    // 保存阅读进度
    const saveReadingProgress = (progress) => {
        saveCustomData('readingProgress', progress);
    };

    // 恢复阅读进度
    const readingProgress = getCustomData('readingProgress') || 0;

    return (
        // 页面内容
    );
}
```

### 6. 升级导航逻辑

使用`useSmoothRouter`替换原有的导航：

```tsx
import { useSmoothRouter } from '@corn12138/hooks';

export default function NavigationComponent() {
    const { push, preload, isNavigating } = useSmoothRouter();

    const handleNavigation = async (path) => {
        await push(path);
    };

    const handleLinkHover = (path) => {
        preload(path);
    };

    return (
        <nav>
            <Link 
                href="/articles"
                onMouseEnter={() => handleLinkHover('/articles')}
                onClick={(e) => {
                    e.preventDefault();
                    handleNavigation('/articles');
                }}
            >
                文章列表
            </Link>
        </nav>
    );
}
```

### 7. 增强UI交互

添加更丰富的交互效果：

```tsx
import { useUIInteraction } from '@corn12138/hooks';

export default function InteractiveButton() {
    const { ripple, hapticFeedback, fadeIn } = useUIInteraction();
    const buttonRef = useRef(null);

    const handleClick = (event) => {
        // 添加水波纹效果
        ripple(event.currentTarget, event);
        
        // 添加触觉反馈
        hapticFeedback('light');
        
        // 执行其他逻辑
        onClick();
    };

    useEffect(() => {
        // 入场动画
        if (buttonRef.current) {
            fadeIn(buttonRef.current);
        }
    }, [fadeIn]);

    return (
        <button 
            ref={buttonRef}
            onClick={handleClick}
            className="interactive-button"
        >
            点击我
        </button>
    );
}
```

### 8. 升级表单处理

将原有的表单逻辑替换为`useFormEnhanced`：

```tsx
// ❌ 旧版本
// import { useForm } from '@corn12138/hooks';

// ✅ 新版本
import { useFormEnhanced } from '@corn12138/hooks';

export default function LoginForm() {
    const form = useFormEnhanced({
        email: {
            defaultValue: '',
            validation: { 
                required: true, 
                email: true 
            },
            validateOnChange: true,
            debounceMs: 300
        },
        password: {
            defaultValue: '',
            validation: { 
                required: true, 
                minLength: 8 
            },
            validateOnBlur: true
        },
        $form: {
            validateOnSubmit: true,
            onSubmit: async (data) => {
                const result = await login(data);
                if (result.success) {
                    toast.success('登录成功！');
                } else {
                    toast.error(result.error);
                }
            }
        }
    }, 'loginForm');

    return (
        <form {...form.getFormProps()}>
            <input 
                {...form.getFieldProps('email')}
                type="email"
                placeholder="邮箱"
            />
            {form.getFieldState('email').error && (
                <span className="error">
                    {form.getFieldState('email').error}
                </span>
            )}

            <input 
                {...form.getFieldProps('password')}
                type="password"
                placeholder="密码"
            />
            {form.getFieldState('password').error && (
                <span className="error">
                    {form.getFieldState('password').error}
                </span>
            )}

            <button 
                type="submit"
                disabled={form.state.isSubmitting || !form.state.isValid}
            >
                {form.state.isSubmitting ? '登录中...' : '登录'}
            </button>
        </form>
    );
}
```

## 🔧 配置更新

### 1. TypeScript配置

确保你的`tsconfig.json`包含了必要的配置：

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 2. Tailwind CSS配置

更新`tailwind.config.js`以支持新的样式：

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'ripple': 'ripple 0.6s linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
```

### 3. Next.js配置

更新`next.config.js`以获得更好的性能：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['example.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
}

module.exports = nextConfig
```

## 🧪 测试迁移

### 1. 验证认证功能

```bash
# 测试登录流程
npm run test:auth

# 测试Token刷新
npm run test:token-refresh
```

### 2. 验证页面状态

```bash
# 测试滚动位置恢复
npm run test:scroll-restoration

# 测试表单数据持久化
npm run test:form-persistence
```

### 3. 验证路由功能

```bash
# 测试页面导航
npm run test:navigation

# 测试预加载功能
npm run test:preloading
```

## 📱 移动端适配

### 1. 确保触摸友好

检查所有交互元素的最小点击区域：

```css
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 2. 添加视口元标签

确保在`layout.tsx`中包含：

```tsx
export const metadata: Metadata = {
  title: 'Your Blog',
  description: 'Your blog description',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}
```

### 3. 优化移动端性能

```tsx
// 图片懒加载
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
/>
```

## 🐛 常见问题排查

### 1. 认证状态丢失

**问题**：页面刷新后用户登录状态丢失

**解决方案**：
```tsx
// 确保使用了AuthSecureProvider
import { AuthSecureProvider } from '@corn12138/hooks';

// 检查localStorage中的token
const token = localStorage.getItem('accessToken');
if (!token) {
  // Token丢失，需要重新登录
}
```

### 2. 页面状态不保存

**问题**：页面切换后滚动位置和表单数据丢失

**解决方案**：
```tsx
// 确保在正确的位置使用usePageState
const pageState = usePageState({
  enableScrollRestoration: true,
  enableFormPersistence: true,
  enableRouteCache: true
});

// 手动保存重要状态
pageState.saveCustomData('importantData', data);
```

### 3. 导航动画卡顿

**问题**：页面切换动画不流畅

**解决方案**：
```tsx
// 检查是否启用了硬件加速
.page-transition {
  transform: translateZ(0);
  will-change: transform, opacity;
}

// 使用CSS containment
.page-content {
  contain: layout style paint;
}
```

### 4. 移动端触摸反馈无效

**问题**：在移动设备上触觉反馈不工作

**解决方案**：
```tsx
// 检查浏览器支持
if ('vibrate' in navigator) {
  navigator.vibrate(pattern);
}

// 确保在HTTPS环境下使用
if (location.protocol === 'https:') {
  hapticFeedback('light');
}
```

## 🔄 回滚计划

如果迁移过程中遇到问题，可以按以下步骤回滚：

### 1. 保留原始文件

```bash
# 迁移前备份重要文件
cp src/components/ClientProviders.tsx src/components/ClientProviders.backup.tsx
cp src/components/layout/MainLayout.tsx src/components/layout/MainLayout.backup.tsx
```

### 2. 逐步回滚

```bash
# 1. 回滚Provider
mv src/components/ClientProviders.backup.tsx src/components/ClientProviders.tsx

# 2. 回滚布局
mv src/components/layout/MainLayout.backup.tsx src/components/layout/MainLayout.tsx

# 3. 降级依赖版本
npm install @corn12138/hooks@1.0.0
```

### 3. 清理缓存

```bash
# 清理构建缓存
rm -rf .next
npm run build

# 清理浏览器存储
# 提示用户清理localStorage和sessionStorage
```

## 📈 性能验证

迁移完成后，使用以下工具验证性能改进：

### 1. Lighthouse审计

```bash
# 安装Lighthouse CLI
npm install -g lighthouse

# 运行审计
lighthouse http://localhost:3000 --output=html --output-path=./lighthouse-report.html
```

### 2. Web Vitals监控

```tsx
// 添加性能监控
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### 3. Bundle分析

```bash
# 分析Bundle大小
npm install --save-dev @next/bundle-analyzer

# 运行分析
ANALYZE=true npm run build
```

## 🎯 验收标准

迁移完成后，确保以下功能正常工作：

- [ ] 用户登录/登出功能
- [ ] 页面滚动位置恢复
- [ ] 表单数据持久化
- [ ] 页面导航流畅
- [ ] 移动端触摸体验
- [ ] 加载动画和反馈
- [ ] 错误处理和重试
- [ ] 性能指标改善

## 🤝 获取帮助

如果在迁移过程中遇到问题，可以通过以下渠道获取帮助：

- 📚 查看[完整文档](./blog-refactor-guide.md)
- 🐛 提交[GitHub Issue](https://github.com/your-repo/issues)
- 💬 加入[讨论群组](https://discord.gg/your-channel)
- 📧 发送邮件至：[support@example.com]

---

**祝你迁移顺利！享受新版本带来的卓越体验！** 🚀
