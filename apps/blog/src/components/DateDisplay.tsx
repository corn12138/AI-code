'use client';

import { useEffect, useState } from 'react';

export default function DateDisplay() {
    const [date, setDate] = useState<string>('');

    useEffect(() => {
        setDate(new Date().toLocaleDateString());
    }, []);

    // 初始渲染时不显示日期，避免水合错误
    if (!date) {
        return <div>Loading...</div>;
    }

    return <div>当前日期：{date}</div>;
}
