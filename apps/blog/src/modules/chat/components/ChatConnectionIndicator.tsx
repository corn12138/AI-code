'use client';

import type { ChatConnectionStatus } from '../types';

interface ChatConnectionIndicatorProps {
    status: ChatConnectionStatus;
    reconnectAttempts: number;
    onReconnect: () => void;
}

const STATUS_LABEL: Record<ChatConnectionStatus, string> = {
    connected: '已连接',
    connecting: '连接中…',
    disconnected: '未连接',
    error: '连接错误',
    reconnecting: '重连中…',
};

const STATUS_COLOR: Record<ChatConnectionStatus, string> = {
    connected: 'bg-emerald-400',
    connecting: 'bg-amber-400',
    disconnected: 'bg-slate-500',
    error: 'bg-rose-500',
    reconnecting: 'bg-indigo-400',
};

export function ChatConnectionIndicator({ status, reconnectAttempts, onReconnect }: ChatConnectionIndicatorProps) {
    return (
        <div className="flex items-center gap-3 rounded-full border border-slate-800/80 bg-slate-950/70 px-3 py-2 text-xs text-slate-300 shadow-lg">
            <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLOR[status]}`} />
            <span>{STATUS_LABEL[status]}</span>
            {status === 'reconnecting' && reconnectAttempts > 0 && (
                <span className="text-[11px] text-indigo-300/80">第 {reconnectAttempts} 次尝试</span>
            )}
            {status === 'error' && (
                <button
                    type="button"
                    onClick={onReconnect}
                    className="ml-2 rounded-full border border-indigo-400/40 px-2 py-0.5 text-[11px] text-indigo-200 transition hover:border-indigo-300 hover:text-indigo-100"
                >
                    重新连接
                </button>
            )}
        </div>
    );
}
