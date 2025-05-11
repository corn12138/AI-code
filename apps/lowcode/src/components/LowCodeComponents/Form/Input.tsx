import React from 'react';
import { ComponentProps } from '@/types';

interface InputProps extends ComponentProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'password' | 'number' | 'email' | 'tel' | 'url';
  required?: boolean;
  defaultValue?: string;
  disabled?: boolean;
  maxLength?: number;
  addonBefore?: string;
  addonAfter?: string;
  layout?: 'vertical' | 'horizontal' | 'inline';
  labelCol?: { span: number };
  wrapperCol?: { span: number };
  style?: React.CSSProperties;
}

export const Input: React.FC<InputProps> = ({ 
  name,
  label,
  placeholder = '请输入',
  type = 'text',
  required = false,
  defaultValue = '',
  disabled = false,
  maxLength,
  addonBefore,
  addonAfter,
  layout = 'vertical',
  labelCol = { span: 6 },
  wrapperCol = { span: 18 },
  style = {}
}) => {
  const inputStyle: React.CSSProperties = {
    ...style
  };
  
  // 根据布局方式调整表单项样式
  const formItemClasses = `form-item form-item-${layout}`;
  
  // 针对水平布局调整label和控件区域宽度
  const labelStyle: React.CSSProperties = layout === 'horizontal' ? {
    flex: `0 0 ${(labelCol.span / 24) * 100}%`,
    maxWidth: `${(labelCol.span / 24) * 100}%`,
    textAlign: 'right',
    paddingRight: '12px',
  } : {};
  
  const wrapperStyle: React.CSSProperties = layout === 'horizontal' ? {
    flex: `0 0 ${(wrapperCol.span / 24) * 100}%`,
    maxWidth: `${(wrapperCol.span / 24) * 100}%`,
  } : {};
  
  return (
    <div className={formItemClasses} style={inputStyle}>
      <div className="form-item-content" style={{ display: layout === 'horizontal' ? 'flex' : 'block' }}>
        <label 
          className="form-label" 
          style={labelStyle} 
          htmlFor={name}
        >
          {required && <span className="text-red-500 mr-1">*</span>}
          {label}
        </label>
        
        <div className="form-control" style={wrapperStyle}>
          <div className="relative">
            {addonBefore && (
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                {addonBefore}
              </span>
            )}
            
            <input
              id={name}
              name={name}
              type={type}
              placeholder={placeholder}
              defaultValue={defaultValue}
              disabled={disabled}
              maxLength={maxLength}
              required={required}
              className={`w-full border border-gray-300 rounded px-3 py-2 ${addonBefore ? 'pl-8' : ''} ${addonAfter ? 'pr-8' : ''}`}
            />
            
            {addonAfter && (
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                {addonAfter}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
