'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useChatSession } from '../hooks/useChatSession';
import type { ChatSessionConfig } from '../types';
import { ChatSidebar } from './ChatSidebar';
import { ChatTranscript } from './ChatTranscript';
import { ChatComposer } from './ChatComposer';
import { ChatConnectionIndicator } from './ChatConnectionIndicator';

interface ChatShellProps {
    config: ChatSessionConfig;
}

export function ChatShell({ config }: ChatShellProps) {
    const transcriptRef = useRef<HTMLDivElement>(null);
    const {
        messages,
        conversations,
        availableModels,
        selectedModel,
        connectionStatus,
        reconnectAttempts,
        error,
        isAuthenticated,
        isLoadingConversations,
        isFetchingConversation,
        activeConversationId,
        sendChatMessage,
        retryLastMessage,
        selectConversation,
        deleteConversation,
        createDraftConversation,
        setSelectedModel,
        refreshConversations,
        reconnect,
        clearError,
    } = useChatSession(config);

    useEffect(() => {
        const container = transcriptRef.current;
        if (!container) return;
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    const isComposerDisabled = useMemo(() => {
        if (!isAuthenticated) return true;
        if (connectionStatus === 'connecting') return true;
        if (isFetchingConversation) return true;
        return false;
    }, [connectionStatus, isAuthenticated, isFetchingConversation]);

    const statusMessage = useMemo(() => {
        if (!isAuthenticated) {
            return '登录后即可与 AI 实时对话';
        }
        if (connectionStatus === 'connecting') {
            return '正在建立与 AI 服务的连接…';
        }
        if (connectionStatus === 'reconnecting') {
            return '网络波动，正在尝试恢复流式连接…';
        }
        return null;
    }, [connectionStatus, isAuthenticated]);

    return (
        <div className="relative flex h-[calc(100vh-64px)] overflow-hidden bg-slate-950">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),transparent_55%),radial-gradient(circle_at_bottom,_rgba(99,102,241,0.15),transparent_55%)]" />
            <div className="relative z-10 grid h-full w-full grid-cols-[minmax(18rem,22rem)_1fr]">
                <ChatSidebar
                    conversations={conversations}
                    activeConversationId={activeConversationId}
                    isLoading={isLoadingConversations}
                    onSelect={selectConversation}
                    onCreateDraft={createDraftConversation}
                    onDelete={deleteConversation}
                />

                <main className="flex h-full flex-col overflow-hidden border-l border-slate-800/50 bg-slate-950/50 backdrop-blur-2xl">
                    <header className="flex items-center justify-between gap-4 border-b border-slate-800/60 px-8 py-6">
                        <div>
                            <h1 className="text-lg font-semibold text-slate-100">AI 流式对话助手</h1>
                            <p className="mt-1 text-xs text-slate-400">
                                支持多模型自动切换，结合上下文持续优化回答质量。
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 rounded-full border border-slate-800/80 bg-slate-950/70 px-3 py-2 text-xs text-slate-200 shadow-lg">
                                <span className="text-slate-400">模型</span>
                                <select
                                    value={selectedModel}
                                    onChange={(event) => setSelectedModel(event.target.value)}
                                    className="rounded-full border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:outline-none"
                                >
                                    {availableModels.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <ChatConnectionIndicator
                                status={connectionStatus}
                                reconnectAttempts={reconnectAttempts}
                                onReconnect={reconnect}
                            />
                        </div>
                    </header>

                    {statusMessage && (
                        <div className="border-b border-slate-800/60 bg-slate-900/60 px-8 py-3 text-xs text-slate-300">
                            {statusMessage}
                            {isAuthenticated && (
                                <button
                                    type="button"
                                    onClick={refreshConversations}
                                    className="ml-4 inline-flex items-center text-[11px] text-indigo-300 underline-offset-4 hover:underline"
                                >
                                    刷新对话列表
                                </button>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="mx-8 mt-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-300/80">连接异常</h3>
                                    <p className="mt-2 leading-6">{error}</p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={retryLastMessage}
                                        className="rounded-full border border-rose-400/40 px-3 py-1 text-[11px] text-rose-100 hover:border-rose-300"
                                    >
                                        重试发送
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearError}
                                        className="text-xs text-rose-200/70 hover:text-rose-100"
                                    >
                                        关闭
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={transcriptRef} className="flex-1 overflow-y-auto px-8 py-8">
                        <ChatTranscript messages={messages} />
                    </div>

                    <div className="mt-auto border-t border-slate-800/60 px-8 py-6">
                        {!isAuthenticated ? (
                            <div className="rounded-3xl border border-indigo-400/40 bg-indigo-500/10 px-6 py-6 text-center text-slate-100">
                                <p className="text-sm font-medium text-indigo-100">需要登录才能继续</p>
                                <p className="mt-2 text-xs text-indigo-200">
                                    登录后可以同步历史记录、在多设备之间无缝切换并享受更高的速率额度。
                                </p>
                                <div className="mt-4">
                                    <a
                                        href="/login"
                                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-xs font-medium text-white transition hover:scale-[1.02]"
                                    >
                                        立即登录
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <ChatComposer
                                disabled={isComposerDisabled}
                                onSend={sendChatMessage}
                                placeholder={`与 ${selectedModel} 对话，按 Enter 发送`}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
