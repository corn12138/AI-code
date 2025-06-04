'use client';

import React, { useEffect, useState } from 'react';

interface SafeHydrationProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export default function SafeHydration({ children, fallback = null }: SafeHydrationProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <>{fallback}</>;
    }

    return <div suppressHydrationWarning>{children}</div>;
}
