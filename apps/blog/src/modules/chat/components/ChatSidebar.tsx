'use client';

import { useMemo } from 'react';
import type { ChatConversationSummary } from '../types';

interface ChatSidebarProps {
    conversations: ChatConversationSummary[];
    activeConversationId: string | null;
    isLoading: boolean;
    onSelect: (conversationId: string) => void;
    onCreateDraft: () => void;
    onDelete: (conversationId: string) => void;
}

function formatTimestamp(value: string) {
    const formatter = new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' });
    const now = Date.now();
    const target = new Date(value).getTime();
    const diff = target - now;
    const diffMinutes = Math.round(diff / (60 * 1000));
    const diffHours = Math.round(diff / (60 * 60 * 1000));
    const diffDays = Math.round(diff / (24 * 60 * 60 * 1000));

    if (Math.abs(diffMinutes) < 60) {
        return formatter.format(diffMinutes, 'minute');
    }
    if (Math.abs(diffHours) < 24) {
        return formatter.format(diffHours, 'hour');
    }
    return formatter.format(diffDays, 'day');
}

export function ChatSidebar({
    conversations,
    activeConversationId,
    isLoading,
    onSelect,
    onCreateDraft,
    onDelete,
}: ChatSidebarProps) {
    const groupedConversations = useMemo(() => {
        if (!conversations.length) return [] as ChatConversationSummary[];
        return conversations.slice().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }, [conversations]);

    return (
        <aside className="h-full w-full max-w-80 bg-slate-950/60 border-r border-slate-800/70 backdrop-blur-xl flex flex-col">
            <div className="px-4 pb-4 pt-6 border-b border-slate-800/70 shadow-lg shadow-black/40">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-100 tracking-wide">对话列表</h2>
                        <p className="text-xs text-slate-400 mt-1">管理你的所有 AI 交流记录</p>
                    </div>
                    <button
                        type="button"
                        onClick={onCreateDraft}
                        className="inline-flex h-9 items-center rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-3 text-xs font-medium text-white shadow-indigo-500/30 transition hover:scale-[1.02] hover:shadow-lg"
                    >
                        新对话
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="space-y-3 px-4 py-6">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="animate-pulse rounded-xl border border-slate-800/70 bg-slate-900/50 p-3">
                                <div className="h-3 w-24 rounded-full bg-slate-800" />
                                <div className="mt-3 h-2 w-full rounded-full bg-slate-900" />
                                <div className="mt-2 h-2 w-4/5 rounded-full bg-slate-900" />
                            </div>
                        ))}
                    </div>
                ) : groupedConversations.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center px-6 text-center text-slate-400">
                        <div className="mb-4 text-4xl">💬</div>
                        <p className="text-sm font-medium text-slate-300">暂无对话</p>
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                            点击「新对话」即可开始与智能助手畅聊，自动保存历史记录。
                        </p>
                    </div>
                ) : (
                    <ul className="space-y-2 px-3 py-4">
                        {groupedConversations.map((conversation) => {
                            const isActive = conversation.id === activeConversationId;
                            return (
                                <li key={conversation.id}>
                                    <button
                                        type="button"
                                        onClick={() => onSelect(conversation.id)}
                                        className={`group w-full rounded-2xl border px-4 py-4 text-left transition ${
                                            isActive
                                                ? 'border-indigo-400/60 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                                                : 'border-transparent bg-slate-950/60 hover:border-indigo-400/30 hover:bg-slate-900/70'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <h3 className="line-clamp-1 text-sm font-semibold text-slate-100">
                                                {conversation.title || '未命名对话'}
                                            </h3>
                                            <span className="text-[11px] font-medium text-slate-500">
                                                {formatTimestamp(conversation.updatedAt)}
                                            </span>
                                        </div>
                                        {conversation.lastMessage && (
                                            <p className="mt-2 line-clamp-2 text-xs text-slate-400">
                                                {conversation.lastMessage}
                                            </p>
                                        )}

                                        <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-indigo-300/70">
                                            <span>{conversation.model}</span>
                                            <span>•</span>
                                            <span>{conversation.messageCount} 消息</span>
                                        </div>

                                        <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/5 opacity-0 transition group-hover:opacity-100" />
                                    </button>
                                    <div className="mt-1 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => onDelete(conversation.id)}
                                            className="rounded-full px-2 py-1 text-[11px] text-slate-500 transition hover:bg-red-500/10 hover:text-red-300"
                                        >
                                            删除
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </aside>
    );
}
