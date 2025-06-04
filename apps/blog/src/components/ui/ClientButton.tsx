'use client';

import React from 'react';

type ButtonProps = {
    onClick?: () => void;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    children: React.ReactNode;
};

// 客户端按钮组件，专门用于处理交互事件
export default function ClientButton({
    onClick,
    className = '',
    type = 'button',
    disabled = false,
    children
}: ButtonProps) {
    return (
        <button
            type={type}
            className={className}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

// 常用的按钮样式变体
export function PrimaryButton(props: ButtonProps) {
    const baseClass = 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors';
    return (
        <ClientButton
            {...props}
            className={`${baseClass} ${props.className || ''}`}
        />
    );
}

export function SecondaryButton(props: ButtonProps) {
    const baseClass = 'px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors';
    return (
        <ClientButton
            {...props}
            className={`${baseClass} ${props.className || ''}`}
        />
    );
}

export function DangerButton(props: ButtonProps) {
    const baseClass = 'px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors';
    return (
        <ClientButton
            {...props}
            className={`${baseClass} ${props.className || ''}`}
        />
    );
}
