'use client';

import { useEffect, useState } from 'react';

// 用于在客户端渲染时使用的自定义钩子
export function useClientOnly(callback, deps = []) {
    const [value, setValue] = useState(null);

    useEffect(() => {
        setValue(callback());
    }, deps);

    return value;
}

// 用于防止水合错误的包装器组件
export function ClientOnly({ children, fallback = null }) {
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
