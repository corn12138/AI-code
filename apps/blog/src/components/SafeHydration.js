'use client';

import { useEffect, useState } from 'react';

export default function SafeHydration({ children, fallback = null }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return fallback;
    }

    return <div suppressHydrationWarning>{children}</div>;
}
