import type { Metadata } from 'next';
import ClientProviders from '../components/ClientProviders';
import '../styles/globals.css';

export const metadata: Metadata = {
    title: 'AI Tech Blog - 人工智能技术博客',
    description: '专注于AI技术分享、前端开发、智能编程的现代化技术博客平台',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="zh-CN">
            <body>
                <ClientProviders>
                    {children}
                </ClientProviders>
            </body>
        </html>
    );
}
