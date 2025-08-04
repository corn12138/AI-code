'use client';

import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
// import rehypeSanitize from 'rehype-sanitize'; // 缺失依赖，暂时注释
import Image from 'next/image';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface MarkdownPreviewProps {
  content: string;
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  // 如果没有内容，显示占位符
  const displayContent = useMemo(() => {
    return content || '预览区域';
  }, [content]);

  return (
    <ReactMarkdown
      className="prose prose-slate dark:prose-invert max-w-none"
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={vscDarkPlus as any}
              language={match[1]}
              PreTag="div"
              className="rounded-md"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        img({ src, alt, ...props }) {
          if (!src) return null;

          // 外部图片使用 Image 组件优化
          return (
            <span className="relative block w-full max-w-full my-6">
              {/* 对于外部图片，添加 loader 和宽高处理 */}
              <Image
                src={src}
                alt={alt || ''}
                width={800}
                height={450}
                className="rounded-md max-h-[500px] object-contain"
                unoptimized={!src.startsWith('http')}
              />
            </span>
          );
        },
        a({ href, children, ...props }) {
          return (
            <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          );
        }
      }}
    >
      {displayContent}
    </ReactMarkdown>
  );
}
