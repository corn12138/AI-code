import { useEffect, useState } from 'react';

// 检测是否在客户端环境
export const isClient = typeof window !== 'undefined';

// 安全地访问window对象
export const safeWindow = isClient ? window : undefined;

// 客户端状态钩子
export function useClientSide() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return mounted;
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
