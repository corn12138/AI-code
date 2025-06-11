import React, { useEffect, useState } from 'react';

interface SessionFeedbackProps {
    onRelogin: () => void;
}

export function SessionFeedback({ onRelogin }: SessionFeedbackProps) {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const handleSessionEvent = (event: CustomEvent) => {
            if (event.type === 'session-expired') {
                setMessage('您的会话已过期，请重新登录');
                setVisible(true);
            } else if (event.type === 'session-refresh-failed') {
                setMessage('会话刷新失败，请检查您的网络连接');
                setVisible(true);
            }
        };

        window.addEventListener('session-expired', handleSessionEvent as EventListener);
        window.addEventListener('session-refresh-failed', handleSessionEvent as EventListener);

        return () => {
            window.removeEventListener('session-expired', handleSessionEvent as EventListener);
            window.removeEventListener('session-refresh-failed', handleSessionEvent as EventListener);
        };
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
            <div className="flex items-center">
                <div className="py-1">
                    <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 10.32 10.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
                    </svg>
                </div>
                <div>
                    <p className="font-bold">{message}</p>
                    <div className="mt-2">
                        <button
                            onClick={onRelogin}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded mr-2">
                            重新登录
                        </button>
                        <button
                            onClick={() => setVisible(false)}
                            className="bg-transparent hover:bg-gray-100 text-gray-700 font-semibold py-1 px-2 border border-gray-500 rounded">
                            关闭
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
