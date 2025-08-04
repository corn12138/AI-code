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
        <div className="bg-white border-t border-gray-200 p-4">
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
                        className="w-full resize-none border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        style={{ minHeight: '44px', maxHeight: '200px' }}
                        rows={1}
                    />
                </div>

                <button
                    onClick={handleSend}
                    disabled={!message.trim() || loading}
                    className="bg-blue-500 text-white rounded-lg px-6 py-3 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        '发送'
                    )}
                </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-2">
                按 Enter 发送，Shift + Enter 换行
            </p>
        </div>
    );
} 