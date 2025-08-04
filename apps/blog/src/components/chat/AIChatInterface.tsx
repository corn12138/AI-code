'use client';

import { useAuth, useChatSSE } from '@corn12138/hooks';
import { useEffect, useRef, useState } from 'react';
import ConversationSidebar from './ConversationSidebar';
import MessageInput from './MessageInput';
import MessageList from './MessageList';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    streaming?: boolean;
}

interface Conversation {
    id: string;
    title: string;
    messageCount: number;
    lastMessage: string | null;
    updatedAt: string;
}

// 定义连接状态类型
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting';

export default function AIChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // 模型选择相关状态
    const [selectedModel, setSelectedModel] = useState<string>('qwen/qwen2.5-7b-instruct/bf-16');
    const [availableModels, setAvailableModels] = useState<string[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { token } = useAuth();

    // 使用 useChatSSE hook
    const {
        sendMessage,
        connectionStatus,
        isConnected,
        getAvailableModels,
        reconnectAttempts
    } = useChatSSE({
        // 必需的回调函数
        onMessage: (content: string, type: string, data?: any) => {
            if (type === 'content') {
                // 处理流式内容
                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage?.role === 'assistant' && lastMessage.streaming) {
                        // 更新最后一条消息
                        return prev.map((msg, index) =>
                            index === prev.length - 1
                                ? { ...msg, content: msg.content + content }
                                : msg
                        );
                    } else {
                        // 创建新的助手消息
                        return [...prev, {
                            id: `assistant-${Date.now()}`,
                            role: 'assistant',
                            content,
                            timestamp: new Date(),
                            streaming: true
                        }];
                    }
                });
            } else if (type === 'complete' || type === 'finish') {
                // 消息完成
                setMessages(prev =>
                    prev.map(msg => ({ ...msg, streaming: false }))
                );

                // 如果是新对话，设置对话ID
                if (data?.conversationId && !currentConversationId) {
                    setCurrentConversationId(data.conversationId);
                    // 重新加载对话列表
                    loadConversations();
                }
            } else if (type === 'error') {
                setError(data?.error || '生成回复时出现错误');
                setMessages(prev =>
                    prev.map(msg => ({ ...msg, streaming: false }))
                );
            }
        },
        onError: (error: Error) => {
            console.error('Chat SSE Error:', error);
            setError(error.message || '连接AI服务失败，请重试');
            setMessages(prev =>
                prev.map(msg => ({ ...msg, streaming: false }))
            );
        },

        // 可选的配置项
        chatEndpoint: '/api/chat',
        authType: 'bearer' as const,
        getAuthToken: () => token,
        defaultModel: selectedModel,
        reconnect: {
            enabled: true,
            maxAttempts: 3,
            interval: 1000,
            backoffFactor: 2
        },
        onConnectionChange: (status: any) => {
            console.log('Chat连接状态:', status);
            if (status === 'connected') {
                setError(null);
            }
        },
        onReconnectAttempt: (attempt: number, maxAttempts: number) => {
            console.log(`重连尝试 ${attempt}/${maxAttempts}`);
        },
        debug: true
    } as any); // 临时使用 any 类型来绕过类型检查

    // 滚动到底部
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 加载可用模型
    const loadModels = async () => {
        try {
            const modelData = await getAvailableModels();
            if (modelData.availableModels && modelData.availableModels.length > 0) {
                setAvailableModels(modelData.availableModels);
                setSelectedModel(modelData.defaultModel || modelData.availableModels[0]);
            } else {
                // 使用fallback模型
                setAvailableModels(['qwen/qwen2.5-7b-instruct/bf-16', 'google/gemma-3-27b-instruct/bf-16']);
                setSelectedModel('qwen/qwen2.5-7b-instruct/bf-16');
            }
        } catch (error) {
            console.error('Failed to load models:', error);
            // 使用fallback模型
            setAvailableModels(['qwen/qwen2.5-7b-instruct/bf-16', 'google/gemma-3-27b-instruct/bf-16']);
            setSelectedModel('qwen/qwen2.5-7b-instruct/bf-16');
        }
    };

    // 发送消息
    const handleSendMessage = async (content: string) => {
        if (!content.trim() || !token) {
            if (!token) {
                setError('请先登录后再使用AI聊天功能');
            }
            return;
        }

        setError(null);

        // 添加用户消息
        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);

        try {
            // 使用 useChatSSE 发送消息
            await sendMessage(content, currentConversationId, selectedModel);
        } catch (error) {
            console.error('发送消息失败:', error);
            setError('发送消息失败，请重试');
        }
    };

    // 加载对话历史
    const loadConversations = async () => {
        try {
            if (!token) return;

            const response = await fetch('/api/chat/conversations', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setConversations(data.conversations || []);
            }
        } catch (error) {
            console.error('Failed to load conversations:', error);
        }
    };

    // 切换对话
    const switchConversation = async (conversationId: string) => {
        try {
            if (!token) return;

            const response = await fetch(`/api/chat/conversations/${conversationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(data.conversation.messages.map((msg: any) => ({
                    id: msg.id,
                    role: msg.role,
                    content: msg.content,
                    timestamp: new Date(msg.createdAt),
                    streaming: false
                })));
                setCurrentConversationId(conversationId);

                // 如果对话有使用的模型，切换到该模型
                if (data.conversation.model && availableModels.includes(data.conversation.model)) {
                    setSelectedModel(data.conversation.model);
                }
            }
        } catch (error) {
            console.error('Failed to load conversation:', error);
        }
    };

    // 新建对话
    const createNewConversation = () => {
        setMessages([]);
        setCurrentConversationId(null);
        setError(null);
    };

    // 删除对话
    const deleteConversation = async (conversationId: string) => {
        try {
            if (!token) return;

            const response = await fetch(`/api/chat/conversations/${conversationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // 刷新对话列表
                await loadConversations();

                // 如果删除的是当前对话，清空消息
                if (conversationId === currentConversationId) {
                    createNewConversation();
                }
            }
        } catch (error) {
            console.error('Failed to delete conversation:', error);
        }
    };

    // 获取模型显示名称
    const getModelDisplayName = (model: string) => {
        const modelNames: { [key: string]: string } = {
            'qwen/qwen2.5-7b-instruct/bf-16': '千问 2.5 (7B)',
            'google/gemma-3-27b-instruct/bf-16': 'Gemma 3 (27B)',
            'gpt-3.5-turbo': 'GPT-3.5 Turbo',
            'gpt-4': 'GPT-4'
        };
        return modelNames[model] || model;
    };

    useEffect(() => {
        if (token) {
            loadConversations();
            loadModels();
        }
    }, [token]);

    // 如果没有登录，显示提示
    if (!token) {
        return (
            <div className="flex h-screen bg-gray-50 items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">需要登录</h2>
                    <p className="text-gray-600 mb-4">请先登录后再使用AI聊天功能</p>
                    <a href="/login" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        去登录
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* 侧边栏 */}
            <ConversationSidebar
                conversations={conversations}
                currentConversationId={currentConversationId}
                onSelectConversation={switchConversation}
                onNewConversation={createNewConversation}
                onDeleteConversation={deleteConversation}
            />

            {/* 主聊天区域 */}
            <div className="flex-1 flex flex-col">
                {/* 头部 */}
                <div className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-semibold text-gray-800">
                                AI 智能助手
                            </h1>

                            {/* 模型选择器 */}
                            <div className="flex items-center space-x-2">
                                <label className="text-sm text-gray-600">模型:</label>
                                <select
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    disabled={connectionStatus === 'connecting'}
                                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                >
                                    {availableModels.map((model) => (
                                        <option key={model} value={model}>
                                            {getModelDisplayName(model)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' :
                                connectionStatus === 'connecting' ? 'bg-yellow-500' :
                                    'bg-red-500'
                                }`} />
                            <span className="text-sm text-gray-600">
                                {isConnected ? '已连接' :
                                    connectionStatus === 'connecting' ? '连接中...' :
                                        connectionStatus === 'reconnecting' ? `重连中(${reconnectAttempts})` : '未连接'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 消息列表 */}
                <div className="flex-1 overflow-y-auto">
                    <MessageList messages={messages} loading={connectionStatus === 'connecting'} />
                    <div ref={messagesEndRef} />
                </div>

                {/* 错误提示 */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mb-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                            <button
                                onClick={() => setError(null)}
                                className="ml-auto text-red-400 hover:text-red-600"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                {/* 输入区域 */}
                <MessageInput
                    onSendMessage={handleSendMessage}
                    loading={connectionStatus === 'connecting'}
                    placeholder={`与 ${getModelDisplayName(selectedModel)} 对话...`}
                />
            </div>
        </div>
    );
} 