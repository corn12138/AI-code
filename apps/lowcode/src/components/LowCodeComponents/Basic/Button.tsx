import React from 'react';
import { ComponentProps } from '@/types';

interface ButtonProps extends ComponentProps {
  text: string;
  type?: 'primary' | 'secondary' | 'text' | 'link';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: {
    type: 'console.log' | 'alert' | 'navigate';
    args: string[];
  };
  style?: React.CSSProperties;
}

export const Button: React.FC<ButtonProps> = ({ 
  text, 
  type = 'primary', 
  size = 'medium', 
  disabled = false,
  onClick,
  style = {} 
}) => {
  const handleClick = () => {
    if (onClick) {
      switch (onClick.type) {
        case 'console.log':
          console.log(...onClick.args);
          break;
        case 'alert':
          alert(onClick.args.join(' '));
          break;
        case 'navigate':
          if (onClick.args[0]) {
            window.location.href = onClick.args[0];
          }
          break;
      }
    }
  };

  const getButtonClasses = () => {
    const baseClasses = 'rounded font-medium focus:outline-none transition-colors';
    
    const typeClasses = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
      text: 'bg-transparent hover:bg-gray-100 text-gray-800',
      link: 'bg-transparent text-blue-600 hover:text-blue-800 underline p-0'
    };
    
    const sizeClasses = {
      small: 'text-xs py-1 px-2',
      medium: 'text-sm py-2 px-4',
      large: 'text-base py-3 px-6'
    };
    
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
    
    return `${baseClasses} ${typeClasses[type]} ${sizeClasses[size]} ${disabledClass}`;
  };
  
  return (
    <button
      className={getButtonClasses()}
      style={style}
      disabled={disabled}
      onClick={handleClick}
    >
      {text}
    </button>
  );
};
