# 博客系统主题与样式定制指南

本文档详细介绍博客系统的样式架构和定制方法，适合开发者和设计师参考。

## 样式架构概述

博客系统的样式架构基于以下技术和设计原则：

1. **Tailwind CSS**: 主要样式框架，提供原子化CSS类
2. **CSS变量**: 通过CSS变量系统实现主题定制
3. **组件级样式**: 特定组件的样式定义
4. **响应式设计**: 适配不同屏幕尺寸的布局策略

## Tailwind CSS配置

系统使用经过定制的Tailwind配置，主要特性包括：

### 核心配置

```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class", // 启用class策略的深色模式
  theme: {
    extend: {
      colors: {
        // 使用CSS变量引用颜色，实现动态主题
        primary: {
          50: 'hsl(var(--primary-50))',
          100: 'hsl(var(--primary-100))',
          // ...其他色调
          600: 'hsl(var(--primary-600))',
          700: 'hsl(var(--primary-700))',
        },
        secondary: {
          // ...类似的变量映射
        },
        // 其他颜色定义
      },
      typography: (theme) => ({
        // 定制prose插件的样式
        DEFAULT: {
          css: {
            color: 'var(--tw-prose-body)',
            maxWidth: 'none',
            // ...其他typography设置
          }
        },
        // 深色模式的typography样式
        dark: {
          css: {
            color: 'var(--tw-prose-invert-body)',
            // ...其他深色样式
          }
        }
      }),
      // 其他主题扩展
    }
  },
  plugins: [
    require('@tailwindcss/typography'), // 用于文章内容排版
    require('@tailwindcss/forms'),      // 增强表单元素样式
    // 其他插件
  ],
}
```

### 自定义组件类

在`@layer components`中定义了多个可复用的组件类：

```css
@layer components {
  .container-content {
    @apply container mx-auto px-4 max-w-7xl;
  }

  /* Markdown 内容样式 */
  .prose pre {
    @apply bg-gray-900 text-gray-100 rounded-lg shadow-md overflow-x-auto;
  }

  .prose code:not(pre code) {
    @apply bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-200;
  }

  .prose blockquote {
    @apply border-l-4 border-primary-500 bg-primary-50 dark:bg-primary-900/20 pl-4 py-2 rounded-r-md italic text-gray-700 dark:text-gray-300;
  }

  .prose a {
    @apply text-primary-600 dark:text-primary-400 hover:underline font-medium;
  }
  
  /* 其他组件类 */
}
```

## 主题变量系统

博客实现了完整的主题变量系统，支持亮色/暗色模式和主题定制。

### 基础变量定义

在`:root`选择器和`.dark`类中定义了对应的CSS变量：

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  /* 其他暗色模式变量 */
}
```

### 字体系统

博客使用了精心选择的字体组合：

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Fira+Code&display=swap');

body {
  font-family: 'Inter', sans-serif;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: 'Merriweather', serif;
}

code {
  font-family: 'Fira Code', monospace;
}
```

## 自定义UI元素

### 自定义滚动条

博客实现了美观的自定义滚动条样式：

```css
/* 自定义滚动条 */
::-webkit-scrollbar {
  @apply w-2;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-800;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-600 rounded-full hover:bg-gray-400 dark:hover:bg-gray-500;
}
```

### 卡片组件

常用的卡片UI组件样式：

```css
.card {
  @apply bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm;
}

.card-hover {
  @apply transition-shadow hover:shadow-md;
}
```

## 响应式设计策略

博客系统采用"移动优先"的响应式设计策略，使用Tailwind的断点系统：

```
- 默认: 移动设备 (<640px)
- sm: 640px及以上
- md: 768px及以上
- lg: 1024px及以上
- xl: 1280px及以上
- 2xl: 1536px及以上
```

### 关键布局模式

1. **堆叠到网格**:
   ```html
   <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
     <!-- 卡片内容 -->
   </div>
   ```

2. **侧边栏布局**:
   ```html
   <div class="flex flex-col lg:flex-row gap-8">
     <div class="w-full lg:w-3/4">
       <!-- 主内容 -->
     </div>
     <div class="w-full lg:w-1/4">
       <!-- 侧边栏 -->
     </div>
   </div>
   ```

3. **导航栏响应**:
   ```html
   <nav>
     <!-- 移动端汉堡菜单 - 仅在小屏幕显示 -->
     <button class="block lg:hidden">
       <!-- 汉堡图标 -->
     </button>
     
     <!-- 导航链接 - 小屏幕隐藏，大屏幕横向显示 -->
     <div class="hidden lg:flex items-center space-x-4">
       <!-- 导航项 -->
     </div>
   </nav>
   ```

## 主题定制指南

### 创建自定义主题

你可以通过修改CSS变量创建自定义主题：

1. **定义新的主题类**：
   ```css
   .theme-blue {
     --primary: 210 100% 50%;
     --primary-foreground: 0 0% 100%;
     /* 其他变量 */
   }
   
   .theme-green {
     --primary: 142 76% 36%;
     --primary-foreground: 0 0% 100%;
     /* 其他变量 */
   }
   ```

2. **应用主题类**：
   ```javascript
   // 应用蓝色主题
   document.documentElement.classList.add('theme-blue');
   
   // 或绿色主题
   document.documentElement.classList.add('theme-green');
   ```

### 定制Typography样式

修改博客文章内容的排版样式：

```javascript
// tailwind.config.js 中的 typography 配置
typography: {
  DEFAULT: {
    css: {
      // 修改标题样式
      h1: {
        fontWeight: '800',
        fontSize: '2.25em',
      },
      // 自定义引用块
      blockquote: {
        fontStyle: 'normal',
        fontWeight: '500',
      },
      // 自定义代码块样式
      pre: {
        backgroundColor: 'var(--code-bg)',
        color: 'var(--code-text)',
      },
      // 其他元素样式
    }
  }
}
```

## 高级主题功能

### 主题偏好持久化

博客系统使用localStorage保存用户主题偏好：

```javascript
// 保存主题选择
const saveThemePreference = (theme) => {
  localStorage.setItem('theme-preference', theme);
}

// 获取已保存的主题
const getThemePreference = () => {
  return localStorage.getItem('theme-preference');
}

// 应用主题
const applyTheme = (theme) => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  saveThemePreference(theme);
}

// 检测系统主题偏好
const detectSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light';
}
```

### 主题切换过渡效果

为提供平滑的主题切换体验，添加CSS过渡效果：

```css
/* 添加全局过渡效果 */
* {
  transition-property: color, background-color, border-color;
  transition-duration: 200ms;
  transition-timing-function: ease-out;
}

/* 某些元素可能需要排除在过渡效果之外 */
.no-transition {
  transition: none !important;
}
```

## 可访问性考虑

博客系统设计遵循WCAG 2.1标准，确保内容对所有用户可访问：

1. **颜色对比度**：
   - 所有文本与背景的对比度符合AA级标准(4.5:1)
   - 标题和大号文本符合AA级标准(3:1)

2. **键盘导航**：
   - 所有交互元素可通过键盘访问
   - 焦点状态清晰可见

3. **屏幕阅读器支持**：
   - 合适的ARIA角色和标签
   - 语义化HTML结构

4. **减少动画**：
   - 尊重用户的减少动画偏好设置
   - 动画可通过媒体查询禁用

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## 性能优化

为确保样式不影响页面性能，博客系统采用多种优化策略：

1. **CSS分层加载**：
   - 关键CSS内联在`<head>`中
   - 非关键样式延迟加载

2. **样式代码分离**：
   - 基础样式应用于所有页面
   - 特定页面的样式按需加载

3. **减少样式重新计算**：
   - 避免频繁修改影响布局的CSS属性
   - 使用CSS变换代替会触发重排的属性

这些主题和样式设计使博客系统不仅具有美观的外观，还保证了良好的用户体验和性能表现。
