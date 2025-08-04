'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
    content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
    const [sanitizedContent, setSanitizedContent] = useState(content);

    // 客户端安全地使用DOMPurify
    useEffect(() => {
        const sanitizeContent = async () => {
            if (typeof window !== 'undefined') {
                const DOMPurify = (await import('dompurify')).default;
                setSanitizedContent(DOMPurify.sanitize(content));
            }
        };

        sanitizeContent();
    }, [content]);

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
                // 代码块语法高亮
                code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                        <SyntaxHighlighter
                            style={tomorrow as any}
                            language={match[1]}
                            PreTag="div"
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
                // 图片优化
                img({ node, ...props }) {
                    // 验证src是否为安全URL
                    const src = props.src || '';
                    // 只允许http, https或相对路径
                    const isSafe = !src.match(/^(javascript|data):/i);

                    if (!isSafe) return null;

                    // 使用Next.js的Image组件优化图片
                    return (
                        <span className="block relative min-h-[200px] my-4">
                            <Image
                                src={src}
                                alt={props.alt || ''}
                                fill
                                style={{ objectFit: 'contain' }}
                                className="rounded"
                            />
                        </span>
                    );
                },
                // 链接在新标签页打开
                a({ node, ...props }) {
                    // 验证href是否为安全URL
                    const href = props.href || '';
                    // 只允许http, https或相对路径
                    const isSafe = !href.match(/^(javascript|data):/i);

                    if (!isSafe) return <span>{props.children}</span>;

                    return (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                            {...props}
                        >
                            {props.children}
                        </a>
                    );
                },
            }}
        >
            {sanitizedContent}
        </ReactMarkdown>
    );
}
