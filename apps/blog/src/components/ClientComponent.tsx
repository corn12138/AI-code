'use client';

import React, { useEffect, useState } from 'react';

type ClientComponentProps = {
    children: React.ReactNode;
    fallback?: React.ReactNode;
};

// 通用客户端组件包装器
// 用于确保组件只在客户端渲染，并提供优雅的加载状态
export default function ClientComponent({ children, fallback = null }: ClientComponentProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return fallback ? <>{fallback}</> : null;
    }

    return <>{children}</>;
}

// 带有加载指示器的客户端组件
export function ClientComponentWithLoading({ children }: ClientComponentProps) {
    return (
        <ClientComponent
            fallback={
                <div className="w-full h-full min-h-[100px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            }
        >
            {children}
        </ClientComponent>
    );
}

// 简单的错误边界组件
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
