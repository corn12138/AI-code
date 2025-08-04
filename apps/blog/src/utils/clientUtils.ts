'use client';

import { useClientSide } from '@corn12138/hooks';
import React, { useEffect, useState } from 'react';
import { formatDate as formatDateFromUtil } from './date';

// 检测是否在客户端环境
export const isClient = typeof window !== 'undefined';

// 安全地访问window对象
export const safeWindow = isClient ? window : undefined;

// 用于在客户端渲染时使用的自定义钩子
export function useClientOnly<T>(callback: () => T, deps: any[] = []): T | null {
    const [value, setValue] = useState<T | null>(null);
    const mounted = useClientSide();

    useEffect(() => {
        if (mounted) {
            setValue(callback());
        }
    }, [mounted, callback, ...deps]);

    return value;
}

// 安全地处理日期/时间相关的逻辑
export function useSafeDateTime() {
    const [time, setTime] = useState('');
    const mounted = useClientSide();

    useEffect(() => {
        if (mounted) {
            setTime(new Date().toISOString());
        }
    }, [mounted]);

    return time;
}

// 安全地获取窗口尺寸
export function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
        width: undefined as number | undefined,
        height: undefined as number | undefined,
    });

    const mounted = useClientSide();

    useEffect(() => {
        if (!mounted) return;

        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }

        // 初始调用以设置初始尺寸
        handleResize();

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, [mounted]);

    return windowSize;
}

// 用于防止水合错误的包装器组件
export function ClientOnly({ children, fallback = null }: { children: React.ReactNode, fallback?: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        return () => {
            setMounted(false);
        };
    }, []);

    if (!mounted) {
        return fallback as JSX.Element | null;
    }

    // 使用React.Fragment而不是简写语法
    return React.createElement(React.Fragment, null, children);
}

// 重定向到date.ts中的formatDate以保持向后兼容
export { formatDateFromUtil as formatDate };

// 安全地获取浏览器存储
export const storage = {
    getItem: (key: string): string | null => {
        if (!isClient) return null;
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.error('获取本地存储失败:', e);
            return null;
        }
    },
    setItem: (key: string, value: string): boolean => {
        if (!isClient) return false;
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            console.error('设置本地存储失败:', e);
            return false;
        }
    },
    removeItem: (key: string): boolean => {
        if (!isClient) return false;
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('移除本地存储失败:', e);
            return false;
        }
    }
};
