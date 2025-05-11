import React from 'react';
import { ComponentProps } from '@/types';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends ComponentProps {
  name: string;
  label: string;
  placeholder?: string;
  options: SelectOption[];
  required?: boolean;
  defaultValue?: string;
  disabled?: boolean;
  allowClear?: boolean;
  mode?: 'default' | 'multiple' | 'tags';
  layout?: 'vertical' | 'horizontal' | 'inline';
  labelCol?: { span: number };
  wrapperCol?: { span: number };
  style?: React.CSSProperties;
}

export const Select: React.FC<SelectProps> = ({ 
  name,
  label,
  placeholder = '请选择',
  options = [],
  required = false,
  defaultValue = '',
  disabled = false,
  allowClear = true,
  mode = 'default',
  layout = 'vertical',
  labelCol = { span: 6 },
  wrapperCol = { span: 18 },
  style = {}
}) => {
  const selectStyle: React.CSSProperties = {
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
  
  // 处理多选和标签模式
  const isMultiple = mode === 'multiple' || mode === 'tags';
  
  return (
    <div className={formItemClasses} style={selectStyle}>
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
          <select
            id={name}
            name={name}
            defaultValue={defaultValue}
            disabled={disabled}
            required={required}
            multiple={isMultiple}
            className="w-full border border-gray-300 rounded px-3 py-2 appearance-none bg-white"
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
