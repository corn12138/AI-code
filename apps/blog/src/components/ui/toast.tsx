'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

// Toast类型定义
export interface Toast {
    id: string;
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive' | 'success';
}

// Toast上下文
interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Provider组件
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { ...toast, id };
        setToasts(prev => [...prev, newToast]);

        // 自动移除toast
        setTimeout(() => {
            removeToast(id);
        }, 3000);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

// Toast容器组件
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map(toast => (
                <ToastComponent key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}

// 单个Toast组件
function ToastComponent({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const bgColor = {
        default: 'bg-gray-800',
        destructive: 'bg-red-600',
        success: 'bg-green-600'
    }[toast.variant || 'default'];

    return (
        <div
            className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg min-w-64 max-w-md relative animate-in slide-in-from-right duration-300`}
            onClick={() => onRemove(toast.id)}
        >
            {toast.title && (
                <div className="font-semibold text-sm">{toast.title}</div>
            )}
            {toast.description && (
                <div className="text-sm mt-1 opacity-90">{toast.description}</div>
            )}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(toast.id);
                }}
                className="absolute top-2 right-2 text-white/60 hover:text-white"
            >
                ×
            </button>
        </div>
    );
}

// Hook使用toast
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
} 