import { Metadata } from 'next';
import TopNavbar from '@/components/layout/TopNavbar';
import { ChatShell } from '@/modules/chat/components/ChatShell';
import { getChatSessionConfig } from '@/modules/chat/server/config';

export const metadata: Metadata = {
    title: 'AI 智能助手 - AI Tech Blog',
    description: '与 AI 智能助手进行对话，获取技术问题的解答和帮助',
};

export default function ChatPage() {
    const config = getChatSessionConfig();
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <TopNavbar />
            <ChatShell config={config} />
        </div>
    );
}
