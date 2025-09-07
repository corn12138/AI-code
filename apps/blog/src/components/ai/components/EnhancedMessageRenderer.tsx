'use client';

import {
    ArrowPathIcon,
    ChatBubbleLeftIcon,
    CheckIcon,
    ClockIcon,
    DocumentDuplicateIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    HandThumbDownIcon,
    HandThumbUpIcon,
    SpeakerWaveIcon
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import 'katex/dist/katex.min.css';
import React, { useCallback, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { Message, useChat } from '../context/ChatContext';

interface EnhancedMessageRendererProps {
    message: Message & {
        isGroupStart?: boolean;
        isGroupEnd?: boolean;
    };
    showTimestamp?: boolean;
    isGroupStart?: boolean;
    isGroupEnd?: boolean;
    enableInteractions?: boolean;
    enableTTS?: boolean;
    onRetry?: () => void;
    onFeedback?: (messageId: string, feedback: 'positive' | 'negative') => void;
}

export const EnhancedMessageRenderer: React.FC<EnhancedMessageRendererProps> = ({
    message,
    showTimestamp = true,
    isGroupStart = true,
    isGroupEnd = true,
    enableInteractions = true,
    enableTTS = true,
    onRetry,
    onFeedback
}) => {
    const { actions } = useChat();
    const [isPlaying, setIsPlaying] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    // Format timestamp
    const formattedTime = useMemo(() => {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(message.timestamp);
    }, [message.timestamp]);

    // Status indicator
    const StatusIndicator = () => {
        switch (message.status) {
            case 'sending':
                return (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                        <ClockIcon className="w-3 h-3 text-space-400" />
                    </motion.div>
                );
            case 'sent':
                return <CheckIcon className="w-3 h-3 text-nebula-400" />;
            case 'received':
                return <CheckIcon className="w-3 h-3 text-cosmic-400" />;
            case 'error':
                return <ExclamationTriangleIcon className="w-3 h-3 text-red-400" />;
            default:
                return null;
        }
    };

    // Copy to clipboard
    const copyToClipboard = useCallback(async (text: string, type: string = 'text') => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedCode(type);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    }, []);

    // Text-to-speech
    const speakText = useCallback(async () => {
        if (!enableTTS || !window.speechSynthesis) return;

        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            return;
        }

        try {
            const utterance = new SpeechSynthesisUtterance(message.content);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 0.8;

            utterance.onstart = () => setIsPlaying(true);
            utterance.onend = () => setIsPlaying(false);
            utterance.onerror = () => setIsPlaying(false);

            window.speechSynthesis.speak(utterance);
        } catch (error) {
            console.error('Speech synthesis error:', error);
            setIsPlaying(false);
        }
    }, [message.content, enableTTS, isPlaying]);

    // Custom renderers for markdown
    const renderers = useMemo(() => ({
        code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';

            if (inline) {
                return (
                    <code
                        className="bg-space-800/60 text-stardust-300 px-1.5 py-0.5 rounded text-sm font-mono border border-cosmic-500/20"
                        {...props}
                    >
                        {children}
                    </code>
                );
            }

            return (
                <div className="relative group">
                    <div className="flex items-center justify-between bg-space-800/80 backdrop-blur-sm text-space-200 px-4 py-2 rounded-t-lg border border-cosmic-500/20">
                        <span className="text-sm font-medium">{language || 'Code'}</span>
                        <button
                            onClick={() => copyToClipboard(String(children).replace(/\n$/, ''), 'code')}
                            className="flex items-center space-x-1 text-xs text-space-400 hover:text-cosmic-300 transition-colors"
                        >
                            <DocumentDuplicateIcon className="w-4 h-4" />
                            <span>{copiedCode === 'code' ? 'Copied!' : 'Copy'}</span>
                        </button>
                    </div>
                    <SyntaxHighlighter
                        style={tomorrow}
                        language={language}
                        PreTag="div"
                        className="!mt-0 !rounded-t-none"
                        customStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.6)',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            borderRadius: '0 0 12px 12px',
                            backdropFilter: 'blur(12px)',
                        }}
                        {...props}
                    >
                        {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                </div>
            );
        },

        blockquote: ({ children }: any) => (
            <blockquote className="border-l-4 border-cosmic-500 pl-4 italic text-space-400 my-4 bg-space-800/40 backdrop-blur-sm rounded-r-lg p-3">
                {children}
            </blockquote>
        ),

        table: ({ children }: any) => (
            <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-cosmic-500/20 bg-space-800/40 backdrop-blur-sm rounded-lg">
                    {children}
                </table>
            </div>
        ),

        th: ({ children }: any) => (
            <th className="border border-cosmic-500/20 bg-space-800/60 backdrop-blur-sm px-4 py-2 text-left font-semibold text-space-200">
                {children}
            </th>
        ),

        td: ({ children }: any) => (
            <td className="border border-cosmic-500/20 px-4 py-2 text-space-300">
                {children}
            </td>
        )
    }), [copyToClipboard, copiedCode]);

    // Message styling based on type and group position
    const getMessageClasses = () => {
        const baseClasses = "max-w-[85%] p-4 rounded-2xl relative group backdrop-blur-sm";
        const typeClasses = message.type === 'user'
            ? "bg-gradient-to-r from-cosmic-600 to-nebula-600 text-white ml-auto shadow-cosmic"
            : message.type === 'assistant'
                ? "bg-space-800/60 text-space-200 border border-cosmic-500/20"
                : "bg-stardust-500/20 text-stardust-300 border border-stardust-500/30";

        const groupClasses = message.type === 'user'
            ? `${!isGroupStart ? 'rounded-br-md' : ''} ${!isGroupEnd ? 'rounded-tr-md' : ''}`
            : `${!isGroupStart ? 'rounded-bl-md' : ''} ${!isGroupEnd ? 'rounded-tl-md' : ''}`;

        return `${baseClasses} ${typeClasses} ${groupClasses}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'} px-4 py-2`}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            {/* Message bubble */}
            <div className={getMessageClasses()}>
                {/* Streaming indicator */}
                {message.streaming && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-cosmic-400 rounded-full animate-pulse" />
                )}

                {/* Message content */}
                <div className="prose prose-sm max-w-none prose-headings:text-space-200 prose-p:text-space-300 prose-strong:text-cosmic-300 prose-a:text-cosmic-400 prose-a:hover:text-cosmic-300 prose-code:text-stardust-300 prose-pre:bg-space-800/60 prose-pre:border prose-pre:border-cosmic-500/20">
                    {message.type === 'system' ? (
                        <div className="flex items-center space-x-2">
                            <ChatBubbleLeftIcon className="w-4 h-4" />
                            <span className="font-medium">{message.content}</span>
                        </div>
                    ) : (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={renderers}
                        >
                            {message.content}
                        </ReactMarkdown>
                    )}
                </div>

                {/* Error message */}
                {message.error && (
                    <div className="mt-2 p-2 bg-red-900/40 backdrop-blur-sm border border-red-500/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
                            <span className="text-sm text-red-300">{message.error}</span>
                        </div>
                    </div>
                )}

                {/* Message metadata */}
                {message.metadata && isGroupEnd && (
                    <div className="mt-2 text-xs opacity-70 flex flex-wrap gap-2">
                        {message.metadata.model && (
                            <span className="bg-space-700/60 backdrop-blur-sm px-2 py-1 rounded border border-cosmic-500/20">
                                {message.metadata.model}
                            </span>
                        )}
                        {message.metadata.tokens && (
                            <span className="bg-space-700/60 backdrop-blur-sm px-2 py-1 rounded border border-cosmic-500/20">
                                {message.metadata.tokens} tokens
                            </span>
                        )}
                        {message.metadata.cost && (
                            <span className="bg-space-700/60 backdrop-blur-sm px-2 py-1 rounded border border-cosmic-500/20">
                                ${message.metadata.cost.toFixed(4)}
                            </span>
                        )}
                        {message.metadata.executionTime && (
                            <span className="bg-space-700/60 backdrop-blur-sm px-2 py-1 rounded border border-cosmic-500/20">
                                {message.metadata.executionTime}ms
                            </span>
                        )}
                        {message.metadata.tools && message.metadata.tools.length > 0 && (
                            <span className="bg-space-700/60 backdrop-blur-sm px-2 py-1 rounded border border-cosmic-500/20">
                                🔧 {message.metadata.tools.length} tools
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Timestamp and actions */}
            {(showTimestamp || showActions) && isGroupEnd && (
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`mt-1 flex items-center space-x-2 text-xs text-space-400 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                            }`}
                    >
                        {/* Timestamp */}
                        {showTimestamp && (
                            <span className="flex items-center space-x-1">
                                <span>{formattedTime}</span>
                                <StatusIndicator />
                            </span>
                        )}

                        {/* Actions */}
                        {enableInteractions && showActions && (
                            <div className="flex items-center space-x-1">
                                {/* Copy message */}
                                <button
                                    onClick={() => copyToClipboard(message.content, 'message')}
                                    className="p-1 rounded hover:bg-space-700/60 transition-colors text-space-400 hover:text-cosmic-300"
                                    title="Copy message"
                                >
                                    <DocumentDuplicateIcon className="w-3 h-3" />
                                </button>

                                {/* Text-to-speech */}
                                {enableTTS && message.type === 'assistant' && (
                                    <button
                                        onClick={speakText}
                                        className={`p-1 rounded hover:bg-space-700/60 transition-colors ${isPlaying ? 'text-cosmic-300' : 'text-space-400 hover:text-cosmic-300'
                                            }`}
                                        title={isPlaying ? 'Stop speaking' : 'Read aloud'}
                                    >
                                        <SpeakerWaveIcon className="w-3 h-3" />
                                    </button>
                                )}

                                {/* Retry */}
                                {message.status === 'error' && onRetry && (
                                    <button
                                        onClick={onRetry}
                                        className="p-1 rounded hover:bg-space-700/60 transition-colors text-cosmic-400"
                                        title="Retry message"
                                    >
                                        <ArrowPathIcon className="w-3 h-3" />
                                    </button>
                                )}

                                {/* Feedback */}
                                {message.type === 'assistant' && onFeedback && (
                                    <>
                                        <button
                                            onClick={() => onFeedback(message.id, 'positive')}
                                            className="p-1 rounded hover:bg-space-700/60 transition-colors text-space-400 hover:text-nebula-300"
                                            title="Good response"
                                        >
                                            <HandThumbUpIcon className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => onFeedback(message.id, 'negative')}
                                            className="p-1 rounded hover:bg-space-700/60 transition-colors text-space-400 hover:text-red-400"
                                            title="Poor response"
                                        >
                                            <HandThumbDownIcon className="w-3 h-3" />
                                        </button>
                                    </>
                                )}

                                {/* View details */}
                                {message.metadata && (
                                    <button
                                        className="p-1 rounded hover:bg-space-700/60 transition-colors text-space-400 hover:text-cosmic-300"
                                        title="View details"
                                    >
                                        <EyeIcon className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Copy feedback */}
            <AnimatePresence>
                {copiedCode && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-0 right-0 bg-nebula-500 text-white text-xs px-2 py-1 rounded shadow-cosmic"
                    >
                        Copied!
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
