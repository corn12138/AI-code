import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
    content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
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
                            style={tomorrow}
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
                    // 使用Next.js的Image组件优化图片
                    return (
                        <span className="block relative min-h-[200px] my-4">
                            <Image
                                src={props.src || ''}
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
                    return (
                        <a
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
            {content}
        </ReactMarkdown>
    );
}
