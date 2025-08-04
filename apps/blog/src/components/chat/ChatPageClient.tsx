'use client';

import dynamic from 'next/dynamic';

// 在Client Component中使用dynamic import
const AIChatInterface = dynamic(
    () => import('@/components/chat/AIChatInterface'),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">正在加载 AI 助手...</p>
                </div>
            </div>
        )
    }
);

export default function ChatPageClient() {
    return (
        <div className="flex-1">
            <AIChatInterface />
        </div>
    );
} 