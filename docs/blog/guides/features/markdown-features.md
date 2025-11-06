# Markdown编辑与渲染功能详解

本文档详细介绍博客系统的Markdown编辑和渲染功能实现。

## Markdown编辑器

### 技术选型

博客系统的Markdown编辑器基于以下技术构建：

- **Monaco Editor**: 提供代码编辑体验
- **React-Markdown**: 实时预览渲染
- **DOMPurify**: 内容安全过滤
- **自定义工具栏**: 常用Markdown操作快捷按钮

### 编辑器组件架构

在Next.js App Router中，Markdown编辑器通常会作为**客户端组件** (`"use client";`) 实现，因为它需要用户交互、状态管理和浏览器API。

```
MarkdownEditor (Client Component)
│
├── Toolbar (Client Component) - 提供格式化按钮 (粗体, 斜体, 列表等)
│   └── IconButton (Client Component)
│
├── EditorCore (Client Component) - Monaco Editor实例封装
│   └── (Handles user input, syntax highlighting for Markdown source)
│
├── PreviewPane (Client or Server Component, depending on strategy)
│   └── MarkdownRenderer (Client or Server Component) - 渲染Markdown为HTML
│       └── (Uses react-markdown, DOMPurify)
│
└── StateManagement (Client-side, e.g., Zustand or React Context/useState)
    └── (Manages editor content, selection, UI state)

Data Flow:
1. User types in EditorCore.
2. EditorCore updates its internal state and calls `onChange` prop.
3. Parent component (hosting MarkdownEditor) receives new Markdown content.
4. Parent component passes new content to PreviewPane.
5. PreviewPane (or its child MarkdownRenderer) re-renders the HTML preview.
6. Toolbar buttons interact with EditorCore to apply formatting.

Considerations with App Router:
- **MarkdownEditor.tsx**: Marked with `"use client";`. It will manage its own state or interact with a client-side store.
- **MarkdownRenderer.tsx**:
    - If used for *live preview within the editor*, it will likely be a Client Component or be part of the MarkdownEditor Client Component tree.
    - If used for *displaying saved articles on a page*, it can be a Server Component if it only receives Markdown content as a prop and renders it. This is beneficial for SEO and initial page load performance.
- **Image Uploads/Pasting**: Handled by client-side logic within the editor, making API calls to a Route Handler (`app/api/upload/route.ts`) for processing and storage.
- **Auto-save**: Implemented using client-side timers and potentially `localStorage` for temporary drafts or API calls for persistent drafts.

## 编辑器核心功能实现

### 图片粘贴上传

编辑器支持直接从剪贴板粘贴图片，实现流程如下：

```tsx
// 处理粘贴事件
const handlePaste = useCallback(
  async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    // 查找剪贴板中的图片项
    const imageItem = Array.from(items).find(
      item => item.kind === 'file' && item.type.startsWith('image/')
    );
    
    if (!imageItem) return;

    e.preventDefault();  // 阻止默认粘贴行为
    const file = imageItem.getAsFile();
    if (!file) return;

    try {
      setIsUploading(true);
      // 上传图片到服务器
      const imageUrl = await uploadImageService(file);
      
      // 在光标位置插入Markdown图片语法
      const textarea = textareaRef.current;
      if (textarea) {
        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;
        const imageMarkdown = `![图片](${imageUrl})`;
        
        const newValue = 
          value.substring(0, startPos) + 
          imageMarkdown + 
          value.substring(endPos);
        
        onChange(newValue);
        
        // 更新光标位置到插入内容之后
        setTimeout(() => {
          textarea.selectionStart = startPos + imageMarkdown.length;
          textarea.selectionEnd = startPos + imageMarkdown.length;
          textarea.focus();
        }, 0);
      }
    } catch (error) {
      console.error('上传图片失败:', error);
      alert('图片上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  },
  [value, onChange]
);
```

### Markdown语法工具栏

工具栏实现各种Markdown格式化快捷操作：

```tsx
// 工具栏按钮点击处理
const insertMarkdown = useCallback((syntax: string, placeholder?: string) => {
  const textarea = textareaRef.current;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.substring(start, end);
  
  let newText;
  let newCursorPos;

  // 根据是否有选中文本，采用不同处理策略
  if (selected) {
    // 如果有选中的文本，在其前后添加语法标记
    newText = 
      value.substring(0, start) +
      syntax.replace('$1', selected) +
      value.substring(end);
    
    newCursorPos = start + syntax.indexOf('$1') + selected.length +
      (syntax.length - syntax.indexOf('$1') - 2);
  } else if (placeholder) {
    // 如果没有选中文本但有占位符，插入带占位符的语法
    newText = 
      value.substring(0, start) +
      syntax.replace('$1', placeholder) +
      value.substring(end);
    
    newCursorPos = start + syntax.indexOf('$1');
  } else {
    // 否则，只插入语法
    newText = 
      value.substring(0, start) +
      syntax +
      value.substring(end);
    
    newCursorPos = start + syntax.length;
  }

  onChange(newText);

  // 更新光标位置并聚焦
  setTimeout(() => {
    textarea.focus();
    textarea.selectionStart = placeholder ? newCursorPos : newCursorPos;
    textarea.selectionEnd = placeholder ? newCursorPos + (placeholder?.length || 0) : newCursorPos;
  }, 0);
}, [value, onChange]);
```

### 编辑模式切换

编辑器提供三种模式，通过Tab组件实现无缝切换：

1. **纯编辑模式**: 全屏Markdown编辑
2. **纯预览模式**: 全屏渲染预览
3. **分屏模式**: 左侧编辑，右侧实时预览

```tsx
<Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
  <Tab.List className="flex border-b border-gray-200 dark:border-gray-700">
    <Tab className={({ selected }) => `
      px-4 py-2 text-sm font-medium focus:outline-none 
      ${selected 
        ? "text-primary-600 border-b-2 border-primary-600"
        : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
      }
    `}>
      编辑
    </Tab>
    <Tab className={/* 类似样式 */}>预览</Tab>
    <Tab className={/* 类似样式 */}>分屏</Tab>
  </Tab.List>

  <Tab.Panels className="relative">
    {/* 编辑模式 */}
    <Tab.Panel>{/* 编辑器 */}</Tab.Panel>
    
    {/* 预览模式 */}
    <Tab.Panel>{/* 预览区 */}</Tab.Panel>
    
    {/* 分屏模式 */}
    <Tab.Panel>{/* 编辑器和预览区并排 */}</Tab.Panel>
  </Tab.Panels>
</Tab.Group>
```

### 辅助功能

1. **Tab键处理**:
   - 捕获Tab键按键事件
   - 在编辑区插入两个空格代替Tab字符
   - 保持光标位置和焦点

2. **字数统计**:
   - 实时计算字符数
   - 计算单词数（基于空格分割）
   - 在编辑器底部显示统计信息

3. **自动保存**:
   - 使用`useEffect`和`useCallback`设置定时器
   - 在编辑器内容变更后延迟保存
   - 支持本地存储(localStorage)和远程保存

## Markdown渲染细节

### 安全渲染配置

博客使用了精细的安全配置，确保Markdown内容安全渲染：

```tsx
// MarkdownPreview.tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import DOMPurify from 'dompurify';

export default function MarkdownPreview({ content }: { content: string }) {
  // 首先使用DOMPurify进行初步净化
  const sanitizedContent = DOMPurify.sanitize(content);

  return (
    <ReactMarkdown
      // GitHub风格Markdown支持
      remarkPlugins={[remarkGfm]}
      // 允许处理HTML，但会经过sanitize
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      // 自定义组件处理
      components={{
        // 安全处理代码块，添加语法高亮
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';
          
          if (!inline) {
            return (
              <div className="relative">
                {language && (
                  <div className="absolute right-2 top-2 text-xs text-gray-400">
                    {language}
                  </div>
                )}
                <pre className={className} {...props}>
                  <code className={language ? `language-${language}` : ''}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          }
          return <code className={className} {...props}>{children}</code>;
        },
        
        // 安全处理图片，使用Next.js Image组件优化
        img({ src, alt, ...props }) {
          // 验证src是否为有效URL
          if (!src || typeof src !== 'string') return null;
          
          if (src.startsWith('http')) {
            // 远程图片使用Next Image优化
            return (
              <div className="my-4">
                <Image
                  src={src}
                  alt={alt || ''}
                  width={700}
                  height={400}
                  className="rounded-lg max-w-full h-auto"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            );
          }
          
          // 本地图片直接渲染
          return (
            <img
              src={src}
              alt={alt || ''}
              className="rounded-lg max-w-full h-auto my-4"
              {...props}
            />
          );
        },
        
        // 安全处理链接
        a({ href, children, ...props }) {
          if (!href) return <span>{children}</span>;
          
          const isExternal = href.startsWith('http');
          
          return (
            <a
              href={href}
              {...props}
              {...(isExternal ? {
                target: "_blank",
                rel: "noopener noreferrer"
              } : {})}
              className="text-primary-600 hover:underline"
            >
              {children}
              {isExternal && (
                <span className="inline-block ml-1 text-xs">↗</span>
              )}
            </a>
          );
        }
      }}
    >
      {sanitizedContent}
    </ReactMarkdown>
  );
}
```

### 自定义Markdown扩展

博客系统支持多种自定义Markdown扩展语法：

1. **提示框**:
   ```markdown
   :::tip
   这是一个提示信息
   :::
   ```

2. **警告框**:
   ```markdown
   :::warning
   这是一个警告信息
   :::
   ```

3. **代码块行高亮**:
   ```markdown
   ```js{1,3-5}
   // 第1行和第3-5行将被高亮
   const hello = 'world';
   function example() {
     return hello;
   }
   ```
   ```

## 自动保存与恢复机制

编辑器实现了可靠的自动保存与内容恢复机制：

1. **本地自动保存**:
   - 使用localStorage保存草稿
   - 定期自动保存（默认30秒）
   - 保存时间戳和内容哈希值

2. **远程保存**:
   - 定期向API发送保存请求
   - 在编辑器失去焦点时保存
   - 在用户主动触发保存时保存

3. **内容恢复**:
   - 页面加载时检查本地存储
   - 与远程草稿比较时间戳，加载最新版本
   - 提供恢复到之前版本的选项

4. **冲突处理**:
   - 检测本地版本与远程版本的冲突
   - 呈现用户友好的冲突解决界面
   - 允许用户选择保留哪个版本或合并内容

## Markdown编辑器定制

### 暗黑模式支持

编辑器完全支持暗黑模式，确保在不同显示主题下都有良好的可读性和视觉舒适度：

```tsx
// 编辑区域暗黑模式样式
<textarea
  ref={textareaRef}
  value={value}
  onChange={(e) => onChange(e.target.value)}
  onPaste={handlePaste}
  onKeyDown={handleTabKey}
  placeholder={placeholder}
  className="w-full h-[500px] p-4 resize-none focus:outline-none 
    text-base font-mono
    bg-white dark:bg-gray-950
    text-gray-800 dark:text-gray-200"
/>
```

### 移动端优化

编辑器针对移动设备做了特别优化：

1. **触摸友好界面**:
   - 更大的按钮点击区域
   - 简化的移动端工具栏

2. **虚拟键盘适配**:
   - 自动调整视图避免被键盘遮挡
   - 优化输入体验，减少视图跳动

3. **响应式布局**:
   - 在小屏幕设备上自动切换为单列布局
   - 隐藏次要工具栏选项，保留核心功能

## 性能优化

为了保证编辑器在处理大文档时的性能，实施了以下优化：

1. **编辑器优化**:
   - 使用`useCallback`和`useMemo`减少不必要的渲染
   - 延迟处理输入内容改变事件

2. **预览优化**:
   - 实时预览使用防抖动技术，避免频繁渲染
   - 大型文档使用虚拟滚动技术
   
3. **资源优化**:
   - 动态导入预览组件减少初始加载大小
   - 使用网络字体优化提升用户感知性能

这些专业的编辑与渲染功能，为博客作者提供了流畅、高效的内容创作体验。

