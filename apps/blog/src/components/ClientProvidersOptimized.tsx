'use client';

import { ToastProvider } from '@/components/ui/toast';
import { AuthProvider } from '@corn12138/hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';

/**
 * 优化的客户端提供者 - 大厂最佳实践
 * 
 * 优化策略：
 * 1. 移除了复杂的全局水合逻辑
 * 2. 简化了提供者结构
 * 3. 让各个组件自己管理水合状态
 * 4. 减少了不必要的副作用
 */

export default function ClientProvidersOptimized({
    children,
}: {
    children: React.ReactNode;
}) {
    // 使用 useState 创建 QueryClient 实例，确保在服务端和客户端保持一致
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // 设置合理的默认值，减少不必要的请求
                staleTime: 5 * 60 * 1000, // 5分钟
                cacheTime: 10 * 60 * 1000, // 10分钟
                retry: 1,
                refetchOnWindowFocus: false,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <ToastProvider>
                    {children}

                    {/* 全局 Toast 配置 - 优化样式和性能 */}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                                borderRadius: '8px',
                                fontSize: '14px',
                                maxWidth: '400px',
                            },
                            success: {
                                style: {
                                    background: '#10B981',
                                },
                                iconTheme: {
                                    primary: '#fff',
                                    secondary: '#10B981',
                                },
                            },
                            error: {
                                style: {
                                    background: '#EF4444',
                                },
                                iconTheme: {
                                    primary: '#fff',
                                    secondary: '#EF4444',
                                },
                            },
                        }}
                    />
                </ToastProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}
