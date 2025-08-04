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
                <div className="text-center text-gray-500 py-12">
                    <div className="text-4xl mb-4">🤖</div>
                    <h3 className="text-lg font-medium mb-2">欢迎使用 AI 智能助手</h3>
                    <p>您可以问我任何问题，我会尽力为您提供帮助。</p>
                </div>
            )}

            {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
            ))}

            {loading && (
                <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-xs">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
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
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">AI</span>
                        </div>
                    </div>
                )}

                <div className={`rounded-lg px-4 py-2 ${isUser
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                    }`}>
                    {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                        <div className="prose prose-sm max-w-none">
                            <ReactMarkdown
                                components={{
                                    code({ node, inline, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return !inline && match ? (
                                            <SyntaxHighlighter
                                                style={vscDarkPlus as any}
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
                                    }
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    )}

                    {message.streaming && (
                        <div className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1" />
                    )}
                </div>

                {isUser && (
                    <div className="flex-shrink-0 ml-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 text-sm font-medium">U</span>
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