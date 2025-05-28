# 低代码平台应用文档

低代码平台允许用户通过可视化拖拽界面快速构建应用页面，无需编写代码。

## 主要功能

- 组件库管理
- 可视化页面编辑器
- 组件属性配置面板
- 页面预览
- 页面发布

## 技术栈

- React
- TypeScript
- Tailwind CSS
- Zustand (状态管理)
- React DnD (拖拽功能)
- DOMPurify (安全处理)

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

使用HtmlContent组件安全渲染HTML内容：

```tsx
const HtmlContent: React.FC<HtmlContentProps> = ({ content, style }) => {
  // ...
  useEffect(() => {
    // 清理HTML内容
    const sanitizedHtml = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br', 'span', 'div', 'img'],
      ALLOWED_ATTR: ['href', 'target', 'src', 'alt', 'class', 'id', 'style'],
      // ...其他安全配置
    });
    
    // ...其他安全处理
  }, [content]);
  
  return <div ref={containerRef} style={style} />;
};
```
