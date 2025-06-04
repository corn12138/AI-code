'use client';

import { useAuth } from '@shared/auth';
import React from 'react';

// 由于@shared/auth没有导出AuthProvider，我们创建自己的Provider包装器
export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
        </>
    );
}
