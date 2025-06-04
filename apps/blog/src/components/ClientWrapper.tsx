'use client';

import React, { useEffect, useState } from 'react';
import Footer from './Footer';
import Navbar from './Navbar';

// 基础的客户端专用包装器
export function ClientOnly({
    children,
    fallback = null
}: {
    children: React.ReactNode,
    fallback?: React.ReactNode
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) {
        return fallback as JSX.Element | null;
    }

    return <div suppressHydrationWarning key="client-only">{children}</div>;
}

// 带加载指示器的客户端组件
export function ClientWithLoading({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <ClientOnly
            fallback={
                <div className="w-full h-full min-h-[100px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            }
        >
            {children}
        </ClientOnly>
    );
}

// 页面级客户端包装器（带导航和页脚）
export default function ClientPageWrapper({
    children
}: {
    children: React.ReactNode
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                {mounted ? children : (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}

// 错误边界组件
export class ErrorBoundary extends React.Component<
    { children: React.ReactNode; fallback: React.ReactNode },
    { hasError: boolean }
> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("客户端组件错误:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}
