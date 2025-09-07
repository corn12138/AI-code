'use client';

import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    streaming?: boolean;
}

interface MessageListProps {
    messages: Message[];
    loading: boolean;
}

const MessageList = memo(({ messages, loading }: MessageListProps) => {
    return (
        <div className="space-y-4 p-6">
            {messages.length === 0 && !loading && (
                <div className="text-center text-space-400 py-12">
                    <div className="text-4xl mb-4">🤖</div>
                    <h3 className="text-lg font-medium mb-2 text-space-200">欢迎使用 AI 智能助手</h3>
                    <p>您可以问我任何问题，我会尽力为您提供帮助。</p>
                </div>
            )}

            {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
            ))}

            {loading && (
                <div className="flex justify-start">
                    <div className="bg-space-800/60 backdrop-blur-sm rounded-xl px-4 py-2 max-w-xs border border-cosmic-500/20">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-cosmic-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-cosmic-400 rounded-full animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-cosmic-400 rounded-full animate-bounce delay-200" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

const MessageBubble = memo(({ message }: { message: Message }) => {
    const isUser = message.role === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className="flex max-w-3xl">
                {!isUser && (
                    <div className="flex-shrink-0 mr-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-cosmic-500 to-nebula-600 rounded-full flex items-center justify-center shadow-cosmic">
                            <span className="text-white text-sm font-medium">AI</span>
                        </div>
                    </div>
                )}

                <div className={`rounded-xl px-4 py-2 backdrop-blur-sm ${isUser
                    ? 'bg-gradient-to-r from-cosmic-600 to-nebula-600 text-white shadow-cosmic'
                    : 'bg-space-800/60 text-space-200 border border-cosmic-500/20'
                    }`}>
                    {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                        <div className="prose prose-sm max-w-none prose-headings:text-space-200 prose-p:text-space-300 prose-strong:text-cosmic-300 prose-a:text-cosmic-400 prose-a:hover:text-cosmic-300 prose-code:text-stardust-300 prose-pre:bg-space-800/60 prose-pre:border prose-pre:border-cosmic-500/20">
                            <ReactMarkdown
                                components={{
                                    code({ node, inline, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return !inline && match ? (
                                            <SyntaxHighlighter
                                                style={vscDarkPlus as any}
                                                language={match[1]}
                                                PreTag="div"
                                                customStyle={{
                                                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                                                    border: '1px solid rgba(139, 92, 246, 0.2)',
                                                    borderRadius: '12px',
                                                    backdropFilter: 'blur(12px)',
                                                }}
                                                {...props}
                                            >
                                                {String(children).replace(/\n$/, '')}
                                            </SyntaxHighlighter>
                                        ) : (
                                            <code className={`${className} bg-space-800/60 text-stardust-300 px-2 py-1 rounded border border-cosmic-500/20`} {...props}>
                                                {children}
                                            </code>
                                        );
                                    }
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    )}

                    {message.streaming && (
                        <div className="inline-block w-2 h-4 bg-cosmic-400 animate-pulse ml-1" />
                    )}
                </div>

                {isUser && (
                    <div className="flex-shrink-0 ml-3">
                        <div className="w-8 h-8 bg-space-600 rounded-full flex items-center justify-center border border-cosmic-500/20">
                            <span className="text-space-200 text-sm font-medium">U</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

MessageList.displayName = 'MessageList';
MessageBubble.displayName = 'MessageBubble';

export default MessageList; 