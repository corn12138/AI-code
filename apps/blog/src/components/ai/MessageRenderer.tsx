'use client';

import {
    CheckIcon,
    ClockIcon,
    DocumentDuplicateIcon,
    ExclamationTriangleIcon,
    HandThumbDownIcon,
    HandThumbUpIcon,
    SparklesIcon,
    SpeakerWaveIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import 'katex/dist/katex.min.css';
import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

interface Message {
    id: string;
    type: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: {
        model?: string;
        tokens?: number;
        tools?: string[];
        attachments?: Attachment[];
        thinking?: string;
    };
    status?: 'sending' | 'sent' | 'received' | 'error';
    streaming?: boolean;
}

interface Attachment {
    id: string;
    type: 'image' | 'document' | 'code';
    name: string;
    url: string;
    size: number;
}

interface MessageRendererProps {
    message: Message;
}

export const MessageRenderer: React.FC<MessageRendererProps> = ({ message }) => {
    const [copied, setCopied] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showThinking, setShowThinking] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    // 复制消息内容
    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    // 文字转语音
    const speakMessage = () => {
        if ('speechSynthesis' in window) {
            if (isPlaying) {
                speechSynthesis.cancel();
                setIsPlaying(false);
            } else {
                const utterance = new SpeechSynthesisUtterance(message.content);
                utterance.rate = 0.9;
                utterance.pitch = 1;
                utterance.volume = 0.8;

                utterance.onstart = () => setIsPlaying(true);
                utterance.onend = () => setIsPlaying(false);
                utterance.onerror = () => setIsPlaying(false);

                speechSynthesis.speak(utterance);
            }
        }
    };

    // 获取状态图标
    const getStatusIcon = () => {
        switch (message.status) {
            case 'sending':
                return <ClockIcon className="w-3 h-3 text-gray-400 animate-pulse" />;
            case 'sent':
                return <CheckIcon className="w-3 h-3 text-green-500" />;
            case 'received':
                return <CheckIcon className="w-3 h-3 text-blue-500" />;
            case 'error':
                return <ExclamationTriangleIcon className="w-3 h-3 text-red-500" />;
            default:
                return null;
        }
    };

    // 自定义代码块渲染
    const CodeBlock = ({ language, children }: { language: string; children: string }) => {
        const [codeCopied, setCodeCopied] = useState(false);

        const copyCode = async () => {
            await navigator.clipboard.writeText(children);
            setCodeCopied(true);
            setTimeout(() => setCodeCopied(false), 2000);
        };

        return (
            <div className="relative group">
                <div className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-t-lg">
                    <span className="text-sm text-gray-300 font-mono">{language}</span>
                    <button
                        onClick={copyCode}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-700"
                    >
                        {codeCopied ? (
                            <CheckIcon className="w-4 h-4 text-green-400" />
                        ) : (
                            <DocumentDuplicateIcon className="w-4 h-4 text-gray-400" />
                        )}
                    </button>
                </div>
                <SyntaxHighlighter
                    language={language}
                    style={tomorrow}
                    customStyle={{
                        margin: 0,
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0,
                    }}
                >
                    {children}
                </SyntaxHighlighter>
            </div>
        );
    };

    // Markdown 组件配置
    const markdownComponents = {
        code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';

            if (!inline && language) {
                return <CodeBlock language={language}>{String(children).replace(/\n$/, '')}</CodeBlock>;
            }

            return (
                <code
                    className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono"
                    {...props}
                >
                    {children}
                </code>
            );
        },

        // 自定义表格样式
        table({ children }: any) {
            return (
                <div className="overflow-x-auto my-4">
                    <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                        {children}
                    </table>
                </div>
            );
        },

        // 自定义链接样式
        a({ href, children }: any) {
            return (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                    {children}
                </a>
            );
        },

        // 自定义列表样式
        ul({ children }: any) {
            return <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>;
        },

        ol({ children }: any) {
            return <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>;
        },

        // 自定义引用块
        blockquote({ children }: any) {
            return (
                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
                    {children}
                </blockquote>
            );
        }
    };

    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 px-4`}
        >
            <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
                {/* Avatar */}
                <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser
                        ? 'bg-blue-600 text-white'
                        : isSystem
                            ? 'bg-gray-500 text-white'
                            : 'bg-gradient-to-r from-purple-500 to-blue-600 text-white'
                        }`}>
                        {isUser ? (
                            <UserIcon className="w-5 h-5" />
                        ) : (
                            <SparklesIcon className="w-5 h-5" />
                        )}
                    </div>

                    {/* Message Content */}
                    <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
                        {/* Message Bubble */}
                        <div
                            className={`inline-block px-4 py-3 rounded-2xl ${isUser
                                ? 'bg-blue-600 text-white'
                                : isSystem
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                                } ${message.streaming ? 'animate-pulse' : ''}`}
                        >
                            {/* 思考过程 */}
                            {message.metadata?.thinking && (
                                <div className="mb-3">
                                    <button
                                        onClick={() => setShowThinking(!showThinking)}
                                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                    >
                                        💭 {showThinking ? 'Hide thinking' : 'Show thinking'}
                                    </button>

                                    {showThinking && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 border-l-4 border-yellow-400"
                                        >
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm, remarkMath]}
                                                rehypePlugins={[rehypeKatex]}
                                                components={markdownComponents}
                                            >
                                                {message.metadata.thinking}
                                            </ReactMarkdown>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {/* 主要内容 */}
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                                {isUser ? (
                                    <div className="whitespace-pre-wrap">{message.content}</div>
                                ) : (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm, remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                        components={markdownComponents}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                )}
                            </div>

                            {/* 附件 */}
                            {message.metadata?.attachments && message.metadata.attachments.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {message.metadata.attachments.map((attachment) => (
                                        <div
                                            key={attachment.id}
                                            className="flex items-center space-x-2 p-2 bg-white/10 rounded-lg"
                                        >
                                            <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                                                📎
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{attachment.name}</p>
                                                <p className="text-xs opacity-75">
                                                    {(attachment.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 工具使用 */}
                            {message.metadata?.tools && message.metadata.tools.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1">
                                    {message.metadata.tools.map((tool, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                                        >
                                            🔧 {tool}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Message Actions */}
                        {!isUser && message.status === 'received' && (
                            <div className="flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => copyToClipboard(message.content)}
                                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    title="Copy message"
                                >
                                    {copied ? (
                                        <CheckIcon className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <DocumentDuplicateIcon className="w-4 h-4 text-gray-500" />
                                    )}
                                </button>

                                {/* TTS按钮 */}
                                {'speechSynthesis' in window && (
                                    <button
                                        onClick={speakMessage}
                                        className={`p-1 rounded transition-colors ${isPlaying
                                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
                                            }`}
                                        title={isPlaying ? 'Stop speaking' : 'Read aloud'}
                                    >
                                        <SpeakerWaveIcon className="w-4 h-4" />
                                    </button>
                                )}

                                {/* 反馈按钮 */}
                                <button
                                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    title="Good response"
                                >
                                    <HandThumbUpIcon className="w-4 h-4 text-gray-500 hover:text-green-500" />
                                </button>

                                <button
                                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    title="Poor response"
                                >
                                    <HandThumbDownIcon className="w-4 h-4 text-gray-500 hover:text-red-500" />
                                </button>
                            </div>
                        )}

                        {/* Metadata */}
                        <div className={`flex items-center space-x-2 mt-1 text-xs text-gray-500 ${isUser ? 'justify-end' : 'justify-start'
                            }`}>
                            <span>{message.timestamp.toLocaleTimeString()}</span>

                            {message.metadata?.model && !isUser && (
                                <>
                                    <span>•</span>
                                    <span>{message.metadata.model}</span>
                                </>
                            )}

                            {message.metadata?.tokens && (
                                <>
                                    <span>•</span>
                                    <span>{message.metadata.tokens} tokens</span>
                                </>
                            )}

                            {getStatusIcon()}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
