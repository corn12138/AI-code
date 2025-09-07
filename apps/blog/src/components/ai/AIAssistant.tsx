'use client';

import {
    ArrowPathIcon,
    ChevronDownIcon,
    CogIcon,
    DocumentTextIcon,
    MicrophoneIcon,
    PaperAirplaneIcon,
    PhotoIcon,
    SparklesIcon,
    StopIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useVirtualizer } from '@tanstack/react-virtual';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAIModels } from '../../hooks/useAIModels';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useWebSocket } from '../../hooks/useWebSocket';
import { ChatSettings } from './ChatSettings';
import { MessageRenderer } from './MessageRenderer';

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

export const AIAssistant: React.FC = () => {
    // State
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [selectedModel, setSelectedModel] = useState('gpt-4');
    const [isLoading, setIsLoading] = useState(false);
    const [streamingMessage, setStreamingMessage] = useState<string>('');

    // Refs
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Hooks
    const { sendMessage, isConnected, lastMessage } = useWebSocket();
    const { availableModels, modelCapabilities } = useAIModels();
    const {
        isListening,
        transcript,
        startListening,
        stopListening,
        isSupported: speechSupported
    } = useSpeechRecognition();

    // Virtual scrolling for performance
    const virtualizer = useVirtualizer({
        count: messages.length,
        getScrollElement: () => messagesContainerRef.current,
        estimateSize: () => 80,
        overscan: 5
    });

    // Handle streaming messages
    useEffect(() => {
        if (lastMessage?.type === 'stream:data') {
            setStreamingMessage(prev => prev + lastMessage.content);
        } else if (lastMessage?.type === 'stream:end') {
            if (streamingMessage) {
                const newMessage: Message = {
                    id: Date.now().toString(),
                    type: 'assistant',
                    content: streamingMessage,
                    timestamp: new Date(),
                    metadata: lastMessage.metadata,
                    status: 'received'
                };

                setMessages(prev => [...prev, newMessage]);
                setStreamingMessage('');
            }
            setIsLoading(false);
        }
    }, [lastMessage, streamingMessage]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages, streamingMessage]);

    // Handle speech recognition
    useEffect(() => {
        if (transcript) {
            setInputValue(transcript);
        }
    }, [transcript]);

    // Send message
    const handleSendMessage = useCallback(async () => {
        if (!inputValue.trim() && attachments.length === 0) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: inputValue,
            timestamp: new Date(),
            metadata: {
                attachments: attachments.length > 0 ? attachments : undefined
            },
            status: 'sending'
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setInputValue('');
        setAttachments([]);

        try {
            await sendMessage('chat:message', {
                content: inputValue,
                model: selectedModel,
                attachments,
                stream: true
            });

            // Update message status
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === userMessage.id
                        ? { ...msg, status: 'sent' }
                        : msg
                )
            );
        } catch (error) {
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === userMessage.id
                        ? { ...msg, status: 'error' }
                        : msg
                )
            );
            setIsLoading(false);
        }
    }, [inputValue, attachments, selectedModel, sendMessage]);

    // Handle file upload
    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);

        const newAttachments: Attachment[] = files.map(file => ({
            id: Date.now().toString() + Math.random(),
            type: file.type.startsWith('image/') ? 'image' : 'document',
            name: file.name,
            url: URL.createObjectURL(file),
            size: file.size
        }));

        setAttachments(prev => [...prev, ...newAttachments]);
    }, []);

    // Remove attachment
    const removeAttachment = useCallback((id: string) => {
        setAttachments(prev => prev.filter(att => att.id !== id));
    }, []);

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }, [handleSendMessage]);

    // Toggle voice input
    const toggleVoiceInput = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    // Memoized components
    const messageItems = useMemo(() =>
        virtualizer.getVirtualItems().map((virtualItem) => {
            const message = messages[virtualItem.index];
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
                    transition={{ duration: 0.3 }}
                >
                    <MessageRenderer message={message} />
                </motion.div>
            );
        })
        , [virtualizer, messages]);

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Main Chat Interface */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="mb-4 w-96 max-w-[calc(100vw-2rem)] h-[600px] bg-space-900/90 backdrop-blur-xl rounded-2xl shadow-cosmic border border-cosmic-500/20 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-cosmic-500/20 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-cosmic-500 to-nebula-600 rounded-full flex items-center justify-center shadow-cosmic">
                                    <SparklesIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-space-200">AI Assistant</h3>
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-nebula-400' : 'bg-red-400'}`} />
                                        <span className="text-xs text-space-400">
                                            {isConnected ? 'Connected' : 'Disconnected'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className="p-2 rounded-lg hover:bg-space-800/60 transition-colors text-space-400 hover:text-cosmic-300"
                                >
                                    <CogIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className="p-2 rounded-lg hover:bg-space-800/60 transition-colors text-space-400 hover:text-cosmic-300"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Settings Panel */}
                        <AnimatePresence>
                            {showSettings && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-b border-cosmic-500/20 overflow-hidden"
                                >
                                    <ChatSettings
                                        selectedModel={selectedModel}
                                        onModelChange={setSelectedModel}
                                        availableModels={availableModels}
                                        modelCapabilities={modelCapabilities}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Messages Container */}
                        <div
                            ref={messagesContainerRef}
                            className="flex-1 overflow-auto"
                            style={{
                                height: `${virtualizer.getTotalSize()}px`,
                                position: 'relative'
                            }}
                        >
                            {messageItems}

                            {/* Streaming message */}
                            {streamingMessage && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-4"
                                >
                                    <MessageRenderer
                                        message={{
                                            id: 'streaming',
                                            type: 'assistant',
                                            content: streamingMessage,
                                            timestamp: new Date(),
                                            streaming: true
                                        }}
                                    />
                                </motion.div>
                            )}

                            {/* Loading indicator */}
                            {isLoading && !streamingMessage && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-4 flex items-center space-x-2"
                                >
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-cosmic-400 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-cosmic-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                        <div className="w-2 h-2 bg-cosmic-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    </div>
                                    <span className="text-sm text-space-400">AI is thinking...</span>
                                </motion.div>
                            )}
                        </div>

                        {/* Attachments Preview */}
                        <AnimatePresence>
                            {attachments.length > 0 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="p-3 border-t border-cosmic-500/20 bg-space-800/40"
                                >
                                    <div className="flex flex-wrap gap-2">
                                        {attachments.map((attachment) => (
                                            <div
                                                key={attachment.id}
                                                className="flex items-center space-x-2 bg-space-800/60 backdrop-blur-sm rounded-lg p-2 border border-cosmic-500/20"
                                            >
                                                {attachment.type === 'image' ? (
                                                    <PhotoIcon className="w-4 h-4 text-cosmic-400" />
                                                ) : (
                                                    <DocumentTextIcon className="w-4 h-4 text-nebula-400" />
                                                )}
                                                <span className="text-sm text-space-300 truncate max-w-[120px]">
                                                    {attachment.name}
                                                </span>
                                                <button
                                                    onClick={() => removeAttachment(attachment.id)}
                                                    className="p-1 rounded hover:bg-space-700/60 transition-colors text-space-400 hover:text-cosmic-300"
                                                >
                                                    <XMarkIcon className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Input Area */}
                        <div className="p-4 border-t border-cosmic-500/20">
                            <div className="flex items-end space-x-2">
                                <div className="flex-1 relative">
                                    <textarea
                                        ref={inputRef}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Type your message..."
                                        className="w-full resize-none rounded-lg border border-cosmic-500/30 bg-space-800/60 backdrop-blur-sm px-3 py-2 text-sm text-space-200 placeholder-space-500 focus:border-cosmic-400/50 focus:outline-none focus:ring-2 focus:ring-cosmic-500/20 max-h-32"
                                        rows={1}
                                        style={{
                                            minHeight: '40px',
                                            height: Math.min(Math.max(40, inputValue.split('\n').length * 20), 128)
                                        }}
                                    />

                                    {/* Input Actions */}
                                    <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            accept="image/*,.pdf,.doc,.docx,.txt"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />

                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-1 rounded hover:bg-space-700/60 transition-colors text-space-400 hover:text-cosmic-300"
                                            title="Attach file"
                                        >
                                            <DocumentTextIcon className="w-4 h-4" />
                                        </button>

                                        {speechSupported && (
                                            <button
                                                onClick={toggleVoiceInput}
                                                className={`p-1 rounded transition-colors ${isListening
                                                    ? 'bg-red-900/40 text-red-300'
                                                    : 'hover:bg-space-700/60 text-space-400 hover:text-cosmic-300'
                                                    }`}
                                                title={isListening ? 'Stop recording' : 'Start voice input'}
                                            >
                                                {isListening ? (
                                                    <StopIcon className="w-4 h-4" />
                                                ) : (
                                                    <MicrophoneIcon className="w-4 h-4" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={handleSendMessage}
                                    disabled={(!inputValue.trim() && attachments.length === 0) || isLoading}
                                    className="p-2 bg-gradient-to-r from-cosmic-600 to-nebula-600 text-white rounded-lg hover:from-cosmic-700 hover:to-nebula-700 disabled:bg-space-700 disabled:cursor-not-allowed transition-all duration-300 shadow-cosmic"
                                >
                                    {isLoading ? (
                                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <PaperAirplaneIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            {/* Model info */}
                            <div className="mt-2 text-xs text-space-400 flex items-center justify-between">
                                <span>Model: {selectedModel}</span>
                                <span>{inputValue.length} chars</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-14 h-14 bg-gradient-to-r from-cosmic-600 to-nebula-600 rounded-full shadow-cosmic flex items-center justify-center text-white hover:shadow-xl transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <AnimatePresence mode="wait">
                    {isExpanded ? (
                        <motion.div
                            key="close"
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 90 }}
                        >
                            <ChevronDownIcon className="w-6 h-6" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                        >
                            <SparklesIcon className="w-6 h-6" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Connection indicator */}
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-space-900 ${isConnected ? 'bg-nebula-400' : 'bg-red-400'
                    }`} />
            </motion.button>
        </div>
    );
};
