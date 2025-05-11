import React from 'react';
import { ComponentProps } from '@/types';

interface CheckboxOption {
  label: string;
  value: string;
}

interface CheckboxProps extends ComponentProps {
  name: string;
  label: string;
  options: CheckboxOption[];
  required?: boolean;
  defaultValue?: string[];
  disabled?: boolean;
  layout?: 'vertical' | 'horizontal' | 'inline';
  labelCol?: { span: number };
  wrapperCol?: { span: number };
  style?: React.CSSProperties;
}

export const Checkbox: React.FC<CheckboxProps> = ({ 
  name,
  label,
  options = [],
  required = false,
  defaultValue = [],
  disabled = false,
  layout = 'vertical',
  labelCol = { span: 6 },
  wrapperCol = { span: 18 },
  style = {}
}) => {
  const checkboxStyle: React.CSSProperties = {
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
    <div className={formItemClasses} style={checkboxStyle}>
      <div className="form-item-content" style={{ display: layout === 'horizontal' ? 'flex' : 'block' }}>
        <label 
          className="form-label" 
          style={labelStyle}
        >
          {required && <span className="text-red-500 mr-1">*</span>}
          {label}
        </label>
        
        <div className="form-control" style={wrapperStyle}>
          <div className="checkbox-group">
            {options.map((option) => (
              <div key={option.value} className="checkbox-item mb-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name={name}
                    value={option.value}
                    defaultChecked={defaultValue.includes(option.value)}
                    disabled={disabled}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2">{option.label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
