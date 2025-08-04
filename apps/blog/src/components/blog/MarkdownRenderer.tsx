'use client';

import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
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
                code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                        <SyntaxHighlighter
                            style={atomDark as any}
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
                a: ({ node, ...props }) => (
                    <Link href={props.href || '#'} className="text-primary-600 hover:text-primary-700 hover:underline">
                        {props.children}
                    </Link>
                ),
                img: ({ node, ...props }) => (
                    <div className="relative my-6 rounded-lg overflow-hidden aspect-auto min-h-[20rem]">
                        <Image
                            src={props.src || ''}
                            alt={props.alt || ''}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    );
}