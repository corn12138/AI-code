'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [theme, setTheme] = useState('light');

    // 在客户端加载时获取当前主题
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') || 'light';
        setTheme(storedTheme);
        document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full"
            aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
        >
            {theme === 'dark' ? '🌙' : '☀️'}
        </button>
    );
}
