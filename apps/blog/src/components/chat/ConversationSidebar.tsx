'use client';

import { useState } from 'react';

interface Conversation {
    id: string;
    title: string;
    messageCount: number;
    lastMessage: string | null;
    updatedAt: string;
}

interface ConversationSidebarProps {
    conversations: Conversation[];
    currentConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onNewConversation: () => void;
    onDeleteConversation?: (id: string) => void;
}

export default function ConversationSidebar({
    conversations,
    currentConversationId,
    onSelectConversation,
    onNewConversation,
    onDeleteConversation
}: ConversationSidebarProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();

        if (!onDeleteConversation) return;

        if (window.confirm('确定要删除这个对话吗？此操作不可恢复。')) {
            setDeletingId(id);
            try {
                await onDeleteConversation(id);
            } catch (error) {
                console.error('Delete conversation failed:', error);
            } finally {
                setDeletingId(null);
            }
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (diffDays === 1) {
            return '昨天';
        } else if (diffDays < 7) {
            return `${diffDays}天前`;
        } else {
            return date.toLocaleDateString('zh-CN', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    return (
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
            {/* 头部 */}
            <div className="p-4 border-b border-gray-200">
                <button
                    onClick={onNewConversation}
                    className="w-full bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                    + 新建对话
                </button>
            </div>

            {/* 对话列表 */}
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        <div className="text-3xl mb-2">💬</div>
                        <p className="text-sm">还没有对话记录</p>
                        <p className="text-xs mt-1">点击上方按钮开始新对话</p>
                    </div>
                ) : (
                    <div className="space-y-1 p-2">
                        {conversations.map((conversation) => (
                            <div
                                key={conversation.id}
                                onClick={() => onSelectConversation(conversation.id)}
                                className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${currentConversationId === conversation.id
                                        ? 'bg-blue-100 border border-blue-200'
                                        : 'hover:bg-gray-100'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-gray-900 truncate">
                                            {conversation.title}
                                        </h3>

                                        {conversation.lastMessage && (
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                {conversation.lastMessage}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-gray-400">
                                                {conversation.messageCount} 条消息
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {formatDate(conversation.updatedAt)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 删除按钮 */}
                                    {onDeleteConversation && (
                                        <button
                                            onClick={(e) => handleDelete(e, conversation.id)}
                                            disabled={deletingId === conversation.id}
                                            className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-gray-400 hover:text-red-500 focus:outline-none transition-opacity"
                                            title="删除对话"
                                        >
                                            {deletingId === conversation.id ? (
                                                <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 底部信息 */}
            <div className="p-4 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500">
                    AI 智能助手
                </p>
            </div>
        </div>
    );
} 