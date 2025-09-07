'use client';

import { KeyboardEvent, useRef, useState } from 'react';

interface MessageInputProps {
    onSendMessage: (message: string) => void;
    loading: boolean;
    placeholder?: string;
}

export default function MessageInput({
    onSendMessage,
    loading,
    placeholder = "输入消息..."
}: MessageInputProps) {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (message.trim() && !loading) {
            onSendMessage(message.trim());
            setMessage('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInput = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    return (
        <div className="bg-space-900/40 backdrop-blur-xl border-t border-cosmic-500/20 p-4">
            <div className="flex items-end space-x-3 max-w-4xl mx-auto">
                <div className="flex-1">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onInput={handleInput}
                        placeholder={placeholder}
                        disabled={loading}
                        className="w-full resize-none border border-cosmic-500/30 rounded-xl px-4 py-3 bg-space-800/60 backdrop-blur-sm text-space-200 placeholder-space-500 focus:outline-none focus:ring-2 focus:ring-cosmic-500/20 focus:border-cosmic-400/50 disabled:bg-space-700/60 disabled:cursor-not-allowed transition-all duration-300"
                        style={{ minHeight: '44px', maxHeight: '200px' }}
                        rows={1}
                    />
                </div>

                <button
                    onClick={handleSend}
                    disabled={!message.trim() || loading}
                    className="bg-gradient-to-r from-cosmic-600 to-nebula-600 text-white rounded-xl px-6 py-3 hover:from-cosmic-700 hover:to-nebula-700 focus:outline-none focus:ring-2 focus:ring-cosmic-500/20 focus:ring-offset-2 focus:ring-offset-space-900 disabled:bg-space-700 disabled:cursor-not-allowed transition-all duration-300 shadow-cosmic"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        '发送'
                    )}
                </button>
            </div>

            <p className="text-xs text-space-400 text-center mt-2">
                按 Enter 发送，Shift + Enter 换行
            </p>
        </div>
    );
} 