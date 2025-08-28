'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useMemo, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { EnhancedMessageRenderer } from './EnhancedMessageRenderer';

interface MessageListProps {
    className?: string;
    enableVirtualization?: boolean;
    showTimestamps?: boolean;
    groupMessages?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
    className = '',
    enableVirtualization = true,
    showTimestamps = true,
    groupMessages = true
}) => {
    const { state } = useChat();
    const { messages, streamingMessage, settings, isLoading } = state;

    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Group messages by time proximity and sender
    const groupedMessages = useMemo(() => {
        if (!groupMessages) return messages.map(msg => ({ ...msg, isGroupStart: true, isGroupEnd: true }));

        return messages.map((message, index) => {
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;

            const timeDiff = prevMessage
                ? new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime()
                : Infinity;

            const nextTimeDiff = nextMessage
                ? new Date(nextMessage.timestamp).getTime() - new Date(message.timestamp).getTime()
                : Infinity;

            const isGroupStart = !prevMessage ||
                prevMessage.type !== message.type ||
                timeDiff > 5 * 60 * 1000; // 5 minutes

            const isGroupEnd = !nextMessage ||
                nextMessage.type !== message.type ||
                nextTimeDiff > 5 * 60 * 1000; // 5 minutes

            return {
                ...message,
                isGroupStart,
                isGroupEnd
            };
        });
    }, [messages, groupMessages]);

    // Virtual scrolling setup
    const virtualizer = useVirtualizer({
        count: groupedMessages.length,
        getScrollElement: () => messagesContainerRef.current,
        estimateSize: () => 100, // Estimated message height
        overscan: 5,
        enabled: enableVirtualization && groupedMessages.length > 50
    });

    // Auto-scroll to bottom
    useEffect(() => {
        if (settings.autoScroll && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, streamingMessage, settings.autoScroll]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'Home':
                        e.preventDefault();
                        messagesContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                        break;
                    case 'End':
                        e.preventDefault();
                        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Render messages with virtualization
    const renderVirtualizedMessages = () => {
        const items = virtualizer.getVirtualItems();

        return (
            <div
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    position: 'relative'
                }}
            >
                {items.map((virtualItem) => {
                    const message = groupedMessages[virtualItem.index];
                    return (
                        <motion.div
                            key={virtualItem.key}
                            data-index={virtualItem.index}
                            ref={virtualizer.measureElement}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                transform: `translateY(${virtualItem.start}px)`
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: virtualItem.index * 0.05 }}
                        >
                            <MessageRenderer
                                message={message}
                                showTimestamp={showTimestamps && message.isGroupEnd}
                                isGroupStart={message.isGroupStart}
                                isGroupEnd={message.isGroupEnd}
                            />
                        </motion.div>
                    );
                })}
            </div>
        );
    };

    // Render messages without virtualization
    const renderRegularMessages = () => (
        <AnimatePresence initial={false}>
            {groupedMessages.map((message, index) => (
                <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                    <EnhancedMessageRenderer
                        message={message}
                        showTimestamp={showTimestamps && message.isGroupEnd}
                        isGroupStart={message.isGroupStart}
                        isGroupEnd={message.isGroupEnd}
                    />
                </motion.div>
            ))}
        </AnimatePresence>
    );

    return (
        <div
            ref={messagesContainerRef}
            className={`flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent ${className}`}
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
        >
            <div className="min-h-full flex flex-col">
                {/* Empty state */}
                {messages.length === 0 && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex items-center justify-center p-8"
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">💬</span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Start a conversation
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                                Ask me anything! I can help with code, writing, analysis, and more.
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Messages */}
                {messages.length > 0 && (
                    <div className="flex-1">
                        {enableVirtualization && groupedMessages.length > 50
                            ? renderVirtualizedMessages()
                            : renderRegularMessages()
                        }
                    </div>
                )}

                {/* Streaming message */}
                <AnimatePresence>
                    {streamingMessage && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="px-4"
                        >
                            <EnhancedMessageRenderer
                                message={{
                                    id: 'streaming',
                                    type: 'assistant',
                                    content: streamingMessage,
                                    timestamp: new Date(),
                                    streaming: true,
                                    isGroupStart: true,
                                    isGroupEnd: true
                                }}
                                showTimestamp={false}
                                isGroupStart={true}
                                isGroupEnd={true}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Loading indicator */}
                <AnimatePresence>
                    {isLoading && !streamingMessage && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 flex items-center space-x-3"
                        >
                            <div className="flex space-x-1">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-2 h-2 bg-blue-500 rounded-full"
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.7, 1, 0.7]
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            delay: i * 0.2
                                        }}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                AI is thinking...
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Scroll anchor */}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};
