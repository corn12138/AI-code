import React from 'react';
import { ComponentProps } from '@/types';

interface RadioOption {
  label: string;
  value: string;
}

interface RadioProps extends ComponentProps {
  name: string;
  label: string;
  options: RadioOption[];
  required?: boolean;
  defaultValue?: string;
  disabled?: boolean;
  optionType?: 'default' | 'button';
  layout?: 'vertical' | 'horizontal' | 'inline';
  labelCol?: { span: number };
  wrapperCol?: { span: number };
  style?: React.CSSProperties;
}

export const Radio: React.FC<RadioProps> = ({ 
  name,
  label,
  options = [],
  required = false,
  defaultValue = '',
  disabled = false,
  optionType = 'default',
  layout = 'vertical',
  labelCol = { span: 6 },
  wrapperCol = { span: 18 },
  style = {}
}) => {
  const radioStyle: React.CSSProperties = {
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
  
  // 根据optionType调整单选框样式
  const isButtonStyle = optionType === 'button';
  
  return (
    <div className={formItemClasses} style={radioStyle}>
      <div className="form-item-content" style={{ display: layout === 'horizontal' ? 'flex' : 'block' }}>
        <label 
          className="form-label" 
          style={labelStyle}
        >
          {required && <span className="text-red-500 mr-1">*</span>}
          {label}
        </label>
        
        <div className="form-control" style={wrapperStyle}>
          <div className={`radio-group ${isButtonStyle ? 'flex' : ''}`}>
            {options.map((option) => (
              <div key={option.value} className={`radio-item ${isButtonStyle ? 'mr-0' : 'mb-2'}`}>
                {isButtonStyle ? (
                  <label className={`inline-block border px-3 py-1 cursor-pointer ${defaultValue === option.value ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input
                      type="radio"
                      name={name}
                      value={option.value}
                      defaultChecked={defaultValue === option.value}
                      disabled={disabled}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ) : (
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={name}
                      value={option.value}
                      defaultChecked={defaultValue === option.value}
                      disabled={disabled}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2">{option.label}</span>
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
