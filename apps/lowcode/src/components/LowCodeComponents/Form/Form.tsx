import React from 'react';
import { ComponentProps } from '@/types';

interface FormProps extends ComponentProps {
  name: string;
  layout?: 'vertical' | 'horizontal' | 'inline';
  labelCol?: { span: number };
  wrapperCol?: { span: number };
  initialValues?: Record<string, any>;
  onSubmit?: {
    type: 'console.log' | 'alert';
    args: string[];
  };
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Form: React.FC<FormProps> = ({ 
  name,
  layout = 'vertical',
  labelCol = { span: 6 },
  wrapperCol = { span: 18 },
  initialValues = {},
  onSubmit,
  children,
  style = {}
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 收集表单数据
    const formData = new FormData(e.target as HTMLFormElement);
    const data: Record<string, any> = {};
    
    formData.forEach((value, key) => {
      data[key] = value;
    });
    
    // 触发提交事件
    if (onSubmit) {
      switch (onSubmit.type) {
        case 'console.log':
          console.log('Form data:', data, ...(onSubmit.args || []));
          break;
        case 'alert':
          alert(`Form submitted: ${JSON.stringify(data)}\n${onSubmit.args.join(' ')}`);
          break;
      }
    }
  };
  
  const formStyle: React.CSSProperties = {
    ...style
  };
  
  // 根据布局方式调整表单样式
  const formClasses = `form-${layout}`;
  
  // 为所有子元素添加布局属性
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        layout,
        labelCol,
        wrapperCol
      });
    }
    return child;
  });
  
  return (
    <form 
      name={name}
      className={formClasses}
      style={formStyle}
      onSubmit={handleSubmit}
    >
      {childrenWithProps}
      
      <div className="form-actions" style={{ marginTop: '16px' }}>
        <button 
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          提交
        </button>
        <button 
          type="reset"
          className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
        >
          重置
        </button>
      </div>
    </form>
  );
};
