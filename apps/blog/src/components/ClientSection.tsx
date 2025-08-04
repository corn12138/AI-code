'use client';

import { useEffect, useState } from 'react';

export default function ClientSection({ initialData }: { initialData: any }) {
    const [clientState, setClientState] = useState(initialData);
    const [browserInfo, setBrowserInfo] = useState("");

    useEffect(() => {
        // 安全地使用浏览器 API
        setBrowserInfo(`${window.innerWidth}x${window.innerHeight}`);
    }, []);

    return (
        <div>
            <h2>客户端互动部分</h2>
            <p>屏幕尺寸: {browserInfo}</p>
            <button onClick={() => setClientState({ ...clientState, clicked: true })}>
                点击更新状态
            </button>
        </div>
    );
}
