'use client';

import { ToastProvider } from '@/components/ui/toast';
import {
    AuthSecureProvider,
    usePageState,
    useSmoothRouter,
    useUIInteraction,
} from '@corn12138/hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { GlobalClientHydrator } from './GlobalClientHydrator';
import { LoadingIndicator } from './ui/LoadingIndicator';
import { PageTransition } from './ui/PageTransition';

// ==================== 配置 ====================

const createQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5分钟
            cacheTime: 10 * 60 * 1000, // 10分钟
            retry: (failureCount, error: any) => {
                // 认证错误不重试
                if (error?.status === 401 || error?.status === 403) {
                    return false;
                }
                return failureCount < 3;
            },
            refetchOnWindowFocus: false,
            refetchOnMount: false,
        },
        mutations: {
            retry: 1,
        },
    },
});

// ==================== 路由和导航增强组件 ====================

const NavigationEnhancer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isNavigating, navigationProgress } = useSmoothRouter({
        enablePreloading: true,
        enableOptimisticNavigation: true,
        enableTransitions: true,
        transitionDuration: 300,
        preloadDelay: 100,
        navigationTimeout: 8000,
        onNavigationStart: (path) => {
            console.log('Navigation started to:', path);
        },
        onNavigationComplete: (path, duration) => {
            console.log(`Navigation completed to ${path} in ${duration}ms`);
        },
        onNavigationError: (error, path) => {
            console.error(`Navigation error to ${path}:`, error);
        },
    });

    const { loading, showLoading, hideLoading } = useUIInteraction({
        enableHapticFeedback: true,
        enableSmoothScrolling: true,
        defaultAnimationDuration: 300,
    });

    // 同步导航状态到UI加载状态
    useEffect(() => {
        if (isNavigating) {
            showLoading('加载中...', 'progress');
        } else {
            hideLoading();
        }
    }, [isNavigating, showLoading, hideLoading]);

    return (
        <>
            {/* 顶部导航进度条 */}
            {isNavigating && (
                <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
                    <div
                        className="h-full bg-blue-600 transition-all duration-300 ease-out"
                        style={{ width: `${navigationProgress}%` }}
                    />
                </div>
            )}

            {/* 全局加载指示器 */}
            <LoadingIndicator loading={loading} />

            {/* 页面过渡效果 */}
            <PageTransition isTransitioning={isNavigating}>
                {children}
            </PageTransition>
        </>
    );
};

// ==================== 页面状态持久化组件 ====================

const PageStateManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        savePageState,
        restorePageState,
        restoreScrollPosition,
        hasStoredState,
    } = usePageState({
        enableScrollRestoration: true,
        enableFormPersistence: true,
        enableRouteCache: true,
        debounceMs: 200,
        maxCacheSize: 50,
    });

    // 页面加载时恢复状态
    useEffect(() => {
        if (hasStoredState) {
            restorePageState();
            // 延迟恢复滚动位置，确保内容已渲染
            setTimeout(() => {
                restoreScrollPosition();
            }, 100);
        }
    }, [hasStoredState, restorePageState, restoreScrollPosition]);

    // 页面卸载时保存状态
    useEffect(() => {
        const handleBeforeUnload = () => {
            savePageState();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            savePageState();
        };
    }, [savePageState]);

    return <>{children}</>;
};

// ==================== 错误边界组件 ====================

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    ErrorBoundaryState
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);

        // 这里可以添加错误报告逻辑
        // reportError(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">
                            出了一点问题
                        </h2>
                        <p className="text-gray-600 text-center mb-4">
                            页面遇到了意外错误，请刷新页面重试。
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                刷新页面
                            </button>
                            <button
                                onClick={() => this.setState({ hasError: false, error: null })}
                                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                重试
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-4 p-3 bg-gray-100 rounded text-xs">
                                <summary className="cursor-pointer font-medium text-gray-700">
                                    错误详情
                                </summary>
                                <pre className="mt-2 text-red-600 whitespace-pre-wrap">
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// ==================== 主提供者组件 ====================

export default function ClientProvidersEnhanced({
    children,
}: {
    children: React.ReactNode;
}) {
    const [queryClient] = useState(createQueryClient);

    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <AuthSecureProvider>
                    <ToastProvider>
                        <PageStateManager>
                            <NavigationEnhancer>
                                {children}

                                {/* 全局Toast通知 */}
                                <Toaster
                                    position="top-right"
                                    toastOptions={{
                                        duration: 4000,
                                        style: {
                                            background: '#363636',
                                            color: '#fff',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            padding: '12px 16px',
                                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                                        },
                                        success: {
                                            duration: 3000,
                                            style: {
                                                background: '#10B981',
                                            },
                                            iconTheme: {
                                                primary: '#fff',
                                                secondary: '#10B981',
                                            },
                                        },
                                        error: {
                                            duration: 5000,
                                            style: {
                                                background: '#EF4444',
                                            },
                                            iconTheme: {
                                                primary: '#fff',
                                                secondary: '#EF4444',
                                            },
                                        },
                                        loading: {
                                            duration: Infinity,
                                            style: {
                                                background: '#3B82F6',
                                            },
                                        },
                                    }}
                                />

                                {/* 客户端水合检测 */}
                                <GlobalClientHydrator />

                                {/* 开发环境下的React Query DevTools */}
                                {process.env.NODE_ENV === 'development' && (
                                    <ReactQueryDevtools
                                        initialIsOpen={false}
                                        position="bottom-right"
                                    />
                                )}
                            </NavigationEnhancer>
                        </PageStateManager>
                    </ToastProvider>
                </AuthSecureProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}
