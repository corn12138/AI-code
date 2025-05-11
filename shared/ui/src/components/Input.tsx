import React from 'react';
import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * 输入框标签
   */
  label?: string;
  /**
   * 是否显示错误
   */
  error?: boolean;
  /**
   * 错误信息
   */
  errorMessage?: string;
  /**
   * 输入框前图标
   */
  startIcon?: React.ReactNode;
  /**
   * 输入框后图标
   */
  endIcon?: React.ReactNode;
  /**
   * 输入框尺寸
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * 是否满宽
   */
  fullWidth?: boolean;
}

/**
 * 基础输入框组件
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error = false,
      errorMessage,
      startIcon,
      endIcon,
      size = 'md',
      fullWidth = false,
      className,
      ...rest
    },
    ref
  ) => {
    // 输入框容器类名
    const containerClasses = clsx(
      'relative',
      {
        'w-full': fullWidth,
      },
      className
    );
    
    // 输入框类名
    const inputClasses = clsx(
      'border rounded transition-colors focus:outline-none focus:ring-2',
      {
        // 尺寸样式
        'py-1 px-2 text-xs': size === 'sm',
        'py-2 px-3 text-sm': size === 'md',
        'py-3 px-4 text-base': size === 'lg',
        
        // 图标样式
        'pl-9': startIcon,
        'pr-9': endIcon,
        
        // 宽度样式
        'w-full': fullWidth,
        
        // 错误样式
        'border-red-500 focus:border-red-500 focus:ring-red-500': error,
        'border-gray-300 focus:border-blue-500 focus:ring-blue-500': !error,
      }
    );
    
    // 标签类名
    const labelClasses = clsx(
      'block text-sm font-medium mb-1',
      {
        'text-red-500': error,
        'text-gray-700': !error,
      }
    );
    
    return (
      <div className={containerClasses}>
        {label && (
          <label htmlFor={rest.id} className={labelClasses}>
            {label}
          </label>
        )}
        
        <div className="relative">
          {startIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              {startIcon}
            </div>
          )}
          
          <input ref={ref} className={inputClasses} {...rest} />
          
          {endIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {endIcon}
            </div>
          )}
        </div>
        
        {error && errorMessage && (
          <p className="mt-1 text-xs text-red-500">{errorMessage}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
