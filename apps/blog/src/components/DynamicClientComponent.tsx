'use client';

import { useEffect, useState } from 'react';

export default function DynamicClientComponent() {
    // 状态用于存储客户端特定的数据
    const [clientData, setClientData] = useState<string | null>(null);

    useEffect(() => {
        // 在客户端执行的代码，例如获取窗口尺寸、本地时间等
        setClientData(new Date().toLocaleString());
        // 可以安全使用 window、document 等浏览器 API
    }, []);

    return (
        <div>
            {clientData ? (
                <p>客户端数据: {clientData}</p>
            ) : (
                <p>加载中...</p>
            )}
        </div>
    );
}
