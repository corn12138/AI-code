'use client';

import { useEffect, useState } from 'react';

export default function ClientComponent() {
    const [clientTime, setClientTime] = useState<string>('');

    useEffect(() => {
        setClientTime(new Date().toLocaleTimeString());

        const timer = setInterval(() => {
            setClientTime(new Date().toLocaleTimeString());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="hidden">
            {/* 这个组件仅用于测试客户端渲染 */}
            <span data-testid="client-time">{clientTime}</span>
        </div>
    );
}
