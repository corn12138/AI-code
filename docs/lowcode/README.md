# 低代码平台应用文档

低代码平台允许用户通过可视化拖拽界面快速构建应用页面，无需编写代码。

## 主要功能

- 组件库管理
- 可视化页面编辑器
- 组件属性配置面板
- 页面预览
- 页面发布
- **离线编辑功能** - 通过Service Worker实现断网状态下的编辑和自动同步

## 技术栈

- React
- TypeScript
- Tailwind CSS
- Zustand (状态管理)
- React DnD (拖拽功能)
- DOMPurify (安全处理)
- Service Worker API (离线功能支持)
- IndexedDB (本地数据存储)

## 目录结构

```
apps/lowcode/
├── src/
│   ├── components/            # 组件
│   │   ├── Editor/            # 编辑器组件
│   │   ├── LowCodeComponents/ # 低代码组件库
│   │   │   ├── Basic/         # 基础组件
│   ├── store/                 # 状态管理
│   ├── services/              # API服务
│   ├── types/                 # 类型定义
│   ├── utils/                 # 工具函数
│   ├── assets/                # 静态资源
│   └── index.css              # 全局样式
```

## 核心组件

### 状态管理 (EditorStore)

使用Zustand管理编辑器状态，包括页面结构、选中组件、编辑模式等：

```typescript
export interface EditorStore extends EditorState {
  // 页面操作
  initPage: (page: PageModel) => void;
  setPageName: (name: string) => void;
  
  // 组件操作
  addComponent: (component: ComponentModel, parentId?: string, index?: number) => void;
  updateComponentProps: (id: string, props: Record<string, any>) => void;
  deleteComponent: (id: string) => void;
  // ...其他方法
}
```

### 组件库

低代码平台提供以下基础组件：

- 文本组件 (Text)
- 按钮组件 (Button)
- 图片组件 (Image)
- 容器组件 (Container)
- 分割线组件 (Divider)

每个组件都包含以下定义：

```typescript
{
  type: 'ComponentType',
  name: '组件显示名称',
  icon: 'icon-name',
  description: '组件描述',
  defaultProps: { /* 默认属性 */ },
  defaultStyle: { /* 默认样式 */ },
  propSchema: { /* 属性配置模式 */ },
  styleSchema: { /* 样式配置模式 */ },
  Component: ActualComponent,
  category: 'basic'
}
```

### 安全措施

- 使用DOMPurify净化HTML内容防止XSS攻击
- 内容安全策略(CSP)限制资源加载
- 安全处理用户输入和外部链接

### 编辑器界面

编辑器分为三个主要部分：

1. **左侧组件面板**: 显示可用组件列表，支持拖拽到画布
2. **中央画布**: 展示和编辑页面内容，支持组件放置和移动
3. **右侧属性面板**: 配置选中组件的属性和样式

## 页面保存与发布流程

1. 用户完成页面设计后点击保存按钮
2. 系统将页面结构转换为JSON格式
3. 通过API发送到服务器端保存
4. 发布时生成可访问的页面URL

## HTML内容安全处理

使用`HtmlContent`组件安全渲染用户生成的或动态获取的HTML内容。该组件内部依赖`DOMPurify`来防止XSS攻击。

```tsx
// src/components/HtmlContent.tsx (示例片段)
import React, { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';

interface HtmlContentProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

const HtmlContent: React.FC<HtmlContentProps> = ({ content, className, style }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // 配置DOMPurify以允许特定标签和属性，同时强制执行安全策略
      const sanitizedHtml = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br', 'span', 'div', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'pre', 'code'],
        ALLOWED_ATTR: ['href', 'target', 'src', 'alt', 'class', 'id', 'style', 'title'],
        ALLOW_DATA_ATTR: false, // 通常禁止data-*属性，除非明确需要
        ADD_ATTR: ['target'], // 确保所有<a>标签都有target属性
        FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'style'], // 显式禁止危险标签
        FORBID_ATTR: ['onerror', 'onload', 'onclick'], // 显式禁止危险事件处理器属性
        FORCE_BODY: true, // 确保输出被包裹在<body>标签内
      });
      containerRef.current.innerHTML = sanitizedHtml;

      // 对所有<a>标签设置安全属性
      const links = containerRef.current.querySelectorAll('a');
      links.forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      });
    }
  }, [content]);

  return <div ref={containerRef} className={className} style={style} />;
};

export default HtmlContent;
```

## 离线功能核心机制

低代码平台通过Service Worker和IndexedDB实现离线编辑能力：

1.  **Service Worker (SW)**:
    *   **资源缓存**: SW在安装时缓存应用的核心静态资源（HTML, CSS, JS, 图片），使得应用在离线时仍可加载。
    *   **请求拦截**: SW拦截网络请求。对于静态资源，优先从缓存提供；对于API请求，在离线时可以返回预设的响应或将操作加入同步队列。
2.  **IndexedDB**:
    *   **本地存储**: 用户在离线状态下对页面的修改（如组件添加、属性变更）被保存在浏览器的IndexedDB中。
    *   **同步队列**: 待同步到服务器的操作（如保存页面、发布页面）也会被记录在IndexedDB的队列中。
3.  **同步逻辑**:
    *   当网络恢复时（通过`online`事件监听），应用会尝试将IndexedDB中队列的操作同步到后端服务器。
    *   同步成功后，清除队列中的对应记录。
    *   详细实现参考：[离线功能实现文档](../offline-features.md)

## 与后端API交互

低代码平台依赖后端API进行数据持久化和管理。主要交互端点包括：

-   `GET /api/lowcode/pages`: 获取用户创建的页面列表。
-   `POST /api/lowcode/pages`: 创建一个新的低代码页面。
-   `GET /api/lowcode/pages/:id`: 获取特定页面的详细配置 (JSON)。
-   `PUT /api/lowcode/pages/:id`: 更新特定页面的配置。
-   `DELETE /api/lowcode/pages/:id`: 删除一个页面。
-   `POST /api/lowcode/pages/:id/publish`: 发布或更新已发布页面的状态。
-   `GET /api/lowcode/templates`: (如果支持) 获取可用的页面模板列表。

所有API请求都应包含认证信息（如JWT令牌），并由后端进行权限校验。
