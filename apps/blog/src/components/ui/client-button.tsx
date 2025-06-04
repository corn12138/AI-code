'use client';

import React from 'react';

interface ClientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    onClickAction?: 'toggleMenu' | 'clearSearch' | 'toggleTheme' | 'none';
}

export function ClientButton({
    children,
    onClickAction,
    className,
    ...props
}: ClientButtonProps) {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        // 根据指定的动作执行相应操作
        switch (onClickAction) {
            case 'toggleMenu':
                // 这里只是一个示例实现
                const menuElement = document.getElementById('mobile-menu');
                if (menuElement) {
                    const isVisible = menuElement.classList.contains('block');
                    menuElement.classList.toggle('block', !isVisible);
                    menuElement.classList.toggle('hidden', isVisible);
                }
                break;
            case 'clearSearch':
                // 清除搜索功能
                const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
                if (searchInput) {
                    searchInput.value = '';
                    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
                break;
            case 'toggleTheme':
                // 切换主题
                document.documentElement.classList.toggle('dark');
                break;
        }

        // 如果有自定义的onClick，仍然调用它
        if (props.onClick) {
            props.onClick(e);
        }
    };

    return (
        <button
            className={className}
            {...props}
            onClick={handleClick}
        >
            {children}
        </button>
    );
}
