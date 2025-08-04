'use client';

import { ReactNode, useEffect, useState } from 'react';

interface HydrationBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    errorFallback?: ReactNode;
}

export function HydrationBoundary({
    children,
    fallback = null,
    errorFallback = null
}: HydrationBoundaryProps) {
    const [isHydrated, setIsHydrated] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        try {
            setIsHydrated(true);
        } catch (error) {
            console.error('Hydration error:', error);
            setHasError(true);
        }
    }, []);

    // 水合失败时的降级方案
    if (hasError) {
        return errorFallback || (
            <div className="text-sm text-gray-500 italic">
                功能暂时不可用，请刷新页面重试
            </div>
        );
    }

    // 水合完成前显示占位符
    if (!isHydrated) {
        return fallback;
    }

    return <>{children}</>;
} 