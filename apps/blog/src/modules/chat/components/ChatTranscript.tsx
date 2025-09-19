'use client';

import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ChatMessage } from '../types';

interface ChatTranscriptProps {
    messages: ChatMessage[];
}

const MarkdownRender = memo(({ content }: { content: string }) => (
    <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        className="prose prose-sm max-w-none prose-headings:text-slate-100 prose-strong:text-indigo-200 prose-p:text-slate-200 prose-code:text-indigo-200"
        components={{
            code({ inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                if (!inline && match) {
                    return (
                        <SyntaxHighlighter
                            style={vscDarkPlus as any}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                                background: 'rgba(15, 23, 42, 0.8)',
                                border: '1px solid rgba(99, 102, 241, 0.24)',
                                borderRadius: '16px',
                                padding: '16px',
                            }}
                            {...props}
                        >
                            {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                    );
                }
                return (
                    <code
                        className={`${className ?? ''} rounded-md bg-slate-900/80 px-2 py-[2px] text-indigo-200`}
                        {...props}
                    >
                        {children}
                    </code>
                );
            },
        }}
    >
        {content}
    </ReactMarkdown>
));
MarkdownRender.displayName = 'MarkdownRender';

export function ChatTranscript({ messages }: ChatTranscriptProps) {
    if (!messages.length) {
        return (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
                <div className="relative mb-6 flex h-16 w-16 items-center justify-center">
                    <div className="absolute h-full w-full animate-ping rounded-full bg-indigo-500/30" />
                    <div className="relative flex h-full w-full items-center justify-center rounded-full bg-indigo-500/30 text-2xl">
                        🤖
                    </div>
                </div>
                <h3 className="text-sm font-semibold text-slate-200">开启第一次对话</h3>
                <p className="mt-3 max-w-xs text-sm leading-6 text-slate-400">
                    输入你的问题或需求，AI 将以实时流式的方式回应你，并自动记录上下文。
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {messages.map((message) => {
                const isAssistant = message.role === 'assistant';
                const status = message.status;
                return (
                    <div key={message.id} className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                        <div
                            className={`relative max-w-3xl rounded-3xl border px-5 py-4 shadow-lg shadow-black/10 backdrop-blur ${
                                isAssistant
                                    ? 'border-indigo-500/20 bg-slate-950/70'
                                    : 'border-indigo-400/30 bg-gradient-to-r from-indigo-500/90 via-purple-500/80 to-pink-500/80 text-white'
                            }`}
                        >
                            <div className="absolute -top-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-indigo-200/70">
                                <span>{isAssistant ? 'AI' : 'You'}</span>
                                <span className="text-slate-600">•</span>
                                <span>{new Date(message.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="mt-3 text-sm leading-7">
                                {isAssistant ? (
                                    <MarkdownRender content={message.content} />
                                ) : (
                                    <p className="whitespace-pre-line text-slate-100">{message.content}</p>
                                )}
                            </div>
                            {status === 'streaming' && (
                                <div className="mt-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-indigo-300">
                                    <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
                                    <span>Streaming</span>
                                </div>
                            )}
                            {status === 'error' && message.error && (
                                <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                                    {message.error}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
