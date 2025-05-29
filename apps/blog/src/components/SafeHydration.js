import { useEffect, useState } from 'react';

export default function SafeHydration({ children, fallback = null }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // 返回一个与children结构相似的skeleton或空div
        return fallback;
    }

    return (
        <div suppressHydrationWarning>
            {children}
        </div>
    );
}
