'use client';

import { FormEvent, KeyboardEvent, useCallback, useRef, useState } from 'react';

interface ChatComposerProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

export function ChatComposer({ onSend, disabled = false, placeholder }: ChatComposerProps) {
    const [value, setValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const autoResize = useCallback(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 240)}px`;
    }, []);

    const handleSubmit = useCallback(
        (message: string) => {
            const trimmed = message.trim();
            if (!trimmed || disabled) return;
            onSend(trimmed);
            setValue('');
            if (textareaRef.current) {
                textareaRef.current.style.height = '60px';
            }
        },
        [disabled, onSend]
    );

    const handleFormSubmit = (event: FormEvent) => {
        event.preventDefault();
        handleSubmit(value);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSubmit(value);
        }
    };

    return (
        <form onSubmit={handleFormSubmit} className="relative">
            <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 backdrop-blur-xl px-5 py-4 shadow-lg shadow-black/30">
                <textarea
                    ref={textareaRef}
                    value={value}
                    disabled={disabled}
                    onChange={(event) => {
                        setValue(event.target.value);
                        if (typeof requestAnimationFrame === 'function') {
                            requestAnimationFrame(autoResize);
                        } else {
                            autoResize();
                        }
                    }}
                    onKeyDown={handleKeyDown}
                    onInput={autoResize}
                    placeholder={placeholder ?? '输入你的问题，Shift+Enter 换行'}
                    rows={2}
                    className="min-h-[60px] w-full resize-none bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                />
                <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-slate-500">
                    <span>Enter 发送 · Shift + Enter 换行</span>
                    <button
                        type="submit"
                        disabled={disabled || !value.trim()}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 py-2 text-xs font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <span>发送</span>
                    </button>
                </div>
            </div>
        </form>
    );
}
