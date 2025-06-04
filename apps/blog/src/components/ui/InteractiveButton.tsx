'use client';

import { ReactNode } from 'react';

interface InteractiveButtonProps {
    onClick: () => void;
    className?: string;
    children: ReactNode;
    type?: 'button' | 'submit' | 'reset';
}

export default function InteractiveButton({
    onClick,
    className,
    children,
    type = 'button'
}: InteractiveButtonProps) {
    return (
        <button type={type} onClick={onClick} className={className}>
            {children}
        </button>
    );
}
