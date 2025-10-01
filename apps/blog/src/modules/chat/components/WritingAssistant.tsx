'use client';

import { useAuth } from '@corn12138/hooks';
import { ensureCsrfToken, getCsrfHeaderName } from '@/utils/csrf';
import { useEffect, useRef, useState } from 'react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface WritingAssistantProps {
    isVisible?: boolean;
}

export default function WritingAssistant({ isVisible = true }: WritingAssistantProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { isAuthenticated } = useAuth();
    const csrfHeader = getCsrfHeaderName();

    const quickPrompts = [
        '优化这段文字',
        '检查语法错误',
        '给我写作灵感',
        '总结要点',
        '扩展内容',
        '改写成正式文体'
    ];

    // 生成对话ID
    const generateConversationId = () => {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    };

    // 滚动到底部
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 欢迎消息
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                id: 'welcome',
                role: 'assistant',
                content: '您好！我是AI写作助手，可以帮助您：\n\n• 改进文章内容和结构\n• 检查语法和拼写\n• 提供写作建议和灵感\n• 优化文章SEO\n\n请告诉我您需要什么帮助！',
                timestamp: new Date()
            }]);
        }
    }, [messages.length]);

    // 格式化消息内容
    const formatMessageContent = (content: string) => {
        const lines = content.split('\n');
        return lines.map((line, index) => {
            // 代码块
            if (line.trim().startsWith('```')) {
                return <div key={index} className="my-2 p-3 bg-gray-100 rounded font-mono text-sm">{line.replace(/```/g, '')}</div>;
            }
            // 列表项
            if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                return <div key={index} className="my-1 ml-4">{line}</div>;
            }
            // 普通段落
            return line.trim() ? (
                <div key={index} className="my-2">{line}</div>
            ) : (
                <div key={index} className="my-1"></div>
            );
        });
    };

    const sendMessage = async (message: string) => {
        if (!message.trim() || isLoading || !isAuthenticated) return;

        // 生成或复用conversationId
        const currentConversationId = conversationId || generateConversationId();
        if (!conversationId) {
            setConversationId(currentConversationId);
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: message,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const csrfToken = await ensureCsrfToken();
            const response = await fetch('/api/chat', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...(csrfToken ? { [csrfHeader]: csrfToken } : {}),
                },
                body: JSON.stringify({
                    message: message,
                    conversationId: currentConversationId
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            let assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);

            let streamCompleted = false;

            while (reader && !streamCompleted) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            if (data.type === 'content') {
                                assistantMessage.content += data.content;
                                setMessages(prev => {
                                    const newMessages = [...prev];
                                    const lastMessage = newMessages[newMessages.length - 1];
                                    if (lastMessage.role === 'assistant') {
                                        lastMessage.content = assistantMessage.content;
                                    }
                                    return newMessages;
                                });
                            } else if (data.type === 'complete') {
                                streamCompleted = true;
                                setIsLoading(false);
                                break;
                            } else if (data.type === 'error') {
                                throw new Error(data.error);
                            }
                        } catch (e) {
                            // Skip invalid JSON lines
                        }
                    }
                }
            }

        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: '抱歉，AI服务暂时不可用。请稍后再试。',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(inputValue);
    };

    const handleQuickPrompt = (prompt: string) => {
        sendMessage(prompt);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-white border-l border-gray-200">
            {/* Header */}
            <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg">✨</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">AI 写作助手</h3>
                        <p className="text-sm text-gray-600">专业的写作建议和灵感</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🤖</span>
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">欢迎使用AI写作助手</h4>
                        <p className="text-sm text-gray-600 mb-6">选择下方的快捷提示开始对话，或直接输入你的问题</p>

                        {/* 内嵌快捷提示 */}
                        <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                            {quickPrompts.map((prompt, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuickPrompt(prompt)}
                                    disabled={isLoading}
                                    className="p-3 text-xs bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg text-gray-700 border border-blue-200 hover:border-blue-300 transition-all duration-200 disabled:opacity-50"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((message, index) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                            {/* 消息气泡 */}
                            <div
                                className={`px-4 py-3 rounded-2xl shadow-sm ${message.role === 'user'
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md'
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                                    }`}
                            >
                                <div className={`text-sm leading-relaxed ${message.role === 'assistant' ? 'space-y-1' : ''
                                    }`}>
                                    {message.role === 'assistant' ?
                                        formatMessageContent(message.content) :
                                        <div className="whitespace-pre-wrap">{message.content}</div>
                                    }
                                </div>
                            </div>

                            {/* 时间戳 */}
                            <div className={`text-xs text-gray-500 mt-1 px-2 ${message.role === 'user' ? 'text-right' : 'text-left'
                                }`}>
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>

                        {/* 头像 */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${message.role === 'user'
                            ? 'bg-blue-600 text-white order-1 ml-2'
                            : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 order-2 mr-2'
                            }`}>
                            {message.role === 'user' ? '👤' : '🤖'}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start animate-fade-in">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 flex items-center justify-center text-sm font-medium mr-2">
                            🤖
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <span className="text-sm text-gray-600 ml-2">正在思考...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSubmit} className="flex items-end space-x-3">
                    <div className="flex-1">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            placeholder="输入你的问题... (Enter发送，Shift+Enter换行)"
                            disabled={isLoading}
                            rows={1}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-sm leading-tight"
                            style={{ minHeight: '44px', maxHeight: '120px' }}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-sm"
                    >
                        <span className="text-sm font-medium">发送</span>
                        <span className="text-lg">🚀</span>
                    </button>
                </form>

                {/* 提示文字 */}
                <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
                    <span>AI助手可以帮您优化文章、检查语法、提供创作灵感</span>
                </div>
            </div>
        </div>
    );
} 
