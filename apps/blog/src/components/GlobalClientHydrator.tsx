'use client';

import { useEffect, useState } from 'react';
import { HomeClientHydration } from './home/HomeClientHydration';

export function GlobalClientHydrator() {
    const [mounted, setMounted] = useState(false);
    const [hasHomeContainer, setHasHomeContainer] = useState(false);

    useEffect(() => {
        setMounted(true);
        setHasHomeContainer(!!document.getElementById('home-container'));
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <>
            {hasHomeContainer && <HomeClientHydration />}
            {/* 其他页面的水合器可以在这里添加 */}
        </>
    );
}
