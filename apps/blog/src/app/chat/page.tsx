import { Metadata } from 'next';
import ChatPageClient from '../../components/chat/ChatPageClient';
import TopNavbar from '../../components/layout/TopNavbar';

export const metadata: Metadata = {
    title: 'AI 智能助手 - AI Tech Blog',
    description: '与 AI 智能助手进行对话，获取技术问题的解答和帮助',
};

export default function ChatPage() {
    return (
        <div className="h-screen flex flex-col">
            <TopNavbar />
            <ChatPageClient />
        </div>
    );
} 