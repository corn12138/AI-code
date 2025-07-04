import { AuthProvider } from '@ai-code/hooks';
import type { Metadata } from 'next';
import ClientProviders from '../components/ClientProviders';
import '../styles/globals.css';

export const metadata: Metadata = {
    title: '博客网站',
    description: '一个现代化的博客网站',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="zh-CN">
            <body>
                <AuthProvider>
                    <ClientProviders>
                        {children}
                    </ClientProviders>
                </AuthProvider>
            </body>
        </html>
    );
}
