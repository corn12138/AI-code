# 博客应用文档

博客应用是一个现代化的技术博客平台，提供文章发布、编辑、评论等功能。

## 主要功能

- 文章创建和编辑（Markdown支持）
- 文章分类和标签管理
- 文章评论
- 用户认证
- 草稿保存

## 技术栈

- Next.js
- TypeScript
- Tailwind CSS
- React Hooks
- DOMPurify (XSS防护)
- React Markdown (Markdown渲染)

## 目录结构

```
apps/blog/
├── src/
│   ├── components/            # 组件
│   │   ├── MarkdownEditor.tsx # Markdown编辑器
│   │   ├── MarkdownRenderer.tsx # Markdown渲染器
│   ├── layouts/               # 页面布局
│   ├── pages/                 # 页面组件
│   ├── services/              # API服务
│   ├── store/                 # 状态管理
│   └── types/                 # 类型定义
```

## 关键组件

### Markdown编辑器

提供了功能丰富的Markdown编辑体验：

- 工具栏（粗体、斜体、链接等）
- 实时预览
- 分屏模式
- 图片粘贴上传
- 自动草稿保存

特性：
- 自动保存草稿（每30秒）
- 图片粘贴直接上传
- Markdown语法辅助

```tsx
export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  // 编辑器实现
  // ...
}
```

### Markdown渲染器

安全渲染Markdown内容为HTML：

- 语法高亮
- 自动处理图片尺寸
- 安全链接处理（新标签页打开，添加noopener）
- XSS防护

```tsx
export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // 首先净化原始内容防止XSS攻击
  const sanitizedContent = DOMPurify.sanitize(content);
  
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        // 安全处理各类内容
        // ...
      }}
    >
      {sanitizedContent}
    </ReactMarkdown>
  );
}
```

## API安全处理

博客应用在API请求中实现了多种安全措施：

- 输入内容转义和净化
- XSS防护过滤
- CSRF令牌处理
- 安全的Markdown到HTML转换

```typescript
// 文本内容安全处理
const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// 安全地将Markdown转换为HTML
const markdownToSafeHtml = (markdown: string): string => {
  return sanitizeHtml(markdown);
};
```

## 文章创建流程

1. 用户编写文章标题和Markdown内容
2. 选择相关标签
3. 系统自动保存草稿
4. 发布时进行安全处理并提交到API
5. 成功后重定向到文章页面

## 安全最佳实践

- 所有用户输入经过严格验证和清理
- HTML内容通过DOMPurify过滤
- 外部链接自动添加安全属性
- 图片上传限制文件类型和大小
