import React from 'react';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 按钮类型
   */
  variant?: ButtonVariant;
  /**
   * 按钮尺寸
   */
  size?: ButtonSize;
  /**
   * 是否为块级元素（占满容器宽度）
   */
  block?: boolean;
  /**
   * 是否禁用
   */
  disabled?: boolean;
  /**
   * 是否显示加载状态
   */
  loading?: boolean;
  /**
   * 按钮前图标
   */
  startIcon?: React.ReactNode;
  /**
   * 按钮后图标
   */
  endIcon?: React.ReactNode;
  /**
   * 子元素
   */
  children: React.ReactNode;
}

/**
 * 基础按钮组件
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      block = false,
      disabled = false,
      loading = false,
      startIcon,
      endIcon,
      children,
      className,
      ...rest
    },
    ref
  ) => {
    // 设置按钮类名
    const buttonClasses = clsx(
      'inline-flex items-center justify-center rounded font-medium transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      {
        // 变体样式
        'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500': variant === 'primary',
        'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500': variant === 'secondary',
        'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-blue-500': variant === 'outline',
        'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500': variant === 'ghost',
        'bg-transparent hover:underline p-0 h-auto text-blue-600 focus:ring-0': variant === 'link',
        'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500': variant === 'danger',
        
        // 尺寸样式
        'text-xs py-1 px-2': size === 'sm',
        'text-sm py-2 px-4': size === 'md',
        'text-base py-3 px-6': size === 'lg',
        
        // 块级样式
        'w-full': block,
        
        // 禁用样式
        'opacity-50 cursor-not-allowed pointer-events-none': disabled || loading,
        
        // 加载样式
        'relative': loading,
      },
      className
    );
    
    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        {...rest}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}
        
        <span className={loading ? 'invisible' : 'flex items-center'}>
          {startIcon && <span className="mr-2">{startIcon}</span>}
          {children}
          {endIcon && <span className="ml-2">{endIcon}</span>}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
