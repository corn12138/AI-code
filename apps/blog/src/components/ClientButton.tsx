'use client';

import React from 'react';

interface ClientButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export function ClientButton({ onClick, className, disabled, children }: ClientButtonProps) {
  return (
    <button 
      onClick={onClick} 
      className={className} 
      disabled={disabled}
    >
      {children}
    </button>
  );
}
