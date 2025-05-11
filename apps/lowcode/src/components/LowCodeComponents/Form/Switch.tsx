import React from 'react';
import { ComponentProps } from '@/types';

interface SwitchProps extends ComponentProps {
  name: string;
  label: string;
  checkedChildren?: string;
  unCheckedChildren?: string;
  required?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  layout?: 'vertical' | 'horizontal' | 'inline';
  labelCol?: { span: number };
  wrapperCol?: { span: number };
  style?: React.CSSProperties;
}

export const Switch: React.FC<SwitchProps> = ({ 
  name,
  label,
  checkedChildren = '',
  unCheckedChildren = '',
  required = false,
  defaultChecked = false,
  disabled = false,
  layout = 'vertical',
  labelCol = { span: 6 },
  wrapperCol = { span: 18 },
  style = {}
}) => {
  const switchStyle: React.CSSProperties = {
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
    <div className={formItemClasses} style={switchStyle}>
      <div className="form-item-content" style={{ display: layout === 'horizontal' ? 'flex' : 'block' }}>
        <label 
          className="form-label" 
          style={labelStyle}
        >
          {required && <span className="text-red-500 mr-1">*</span>}
          {label}
        </label>
        
        <div className="form-control" style={wrapperStyle}>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name={name}
              defaultChecked={defaultChecked}
              disabled={disabled}
              className="sr-only"
            />
            <div className={`relative w-10 h-5 bg-gray-200 rounded-full transition-colors ${defaultChecked ? 'bg-blue-600' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${defaultChecked ? 'transform translate-x-5' : ''}`}></div>
              {checkedChildren && defaultChecked && (
                <span className="absolute inset-0 flex items-center justify-start pl-1 text-white text-xs">{checkedChildren}</span>
              )}
              {unCheckedChildren && !defaultChecked && (
                <span className="absolute inset-0 flex items-center justify-end pr-1 text-gray-700 text-xs">{unCheckedChildren}</span>
              )}
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
