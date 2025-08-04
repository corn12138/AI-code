'use client';

import { useClientSide } from '@corn12138/hooks';
import { DependencyList, ReactNode, useEffect, useState } from 'react';

// 用于在客户端渲染时使用的自定义钩子
export function useClientOnly<T>(callback: () => T, deps: DependencyList = []): T | null {
    const [value, setValue] = useState<T | null>(null);
    const isClient = useClientSide();

    useEffect(() => {
        if (isClient) {
            setValue(callback());
        }
    }, [isClient, callback, ...deps]);

    return value;
}

// 用于防止水合错误的包装器组件
interface ClientOnlyProps {
    children: ReactNode;
    fallback?: ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps): ReactNode {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return fallback;
    }

    return children;
}

// 检测是否在客户端环境
export const isClient = typeof window !== 'undefined';
