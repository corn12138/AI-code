'use client';

import { ToastProvider } from '@/components/ui/toast';
import { AuthProvider } from '@corn12138/hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { GlobalClientHydrator } from './GlobalClientHydrator';

export default function ClientProviders({
    children,
}: {
    children: React.ReactNode;
}) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <ToastProvider>
                    {children}
                    {/* react-hot-toast Toaster 全局配置 */}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                                borderRadius: '8px',
                                fontSize: '14px',
                            },
                            success: {
                                style: {
                                    background: '#10B981',
                                },
                            },
                            error: {
                                style: {
                                    background: '#EF4444',
                                },
                            },
                        }}
                    />
                    <GlobalClientHydrator />
                </ToastProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}
