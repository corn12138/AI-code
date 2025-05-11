import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 卡片标题
   */
  title?: React.ReactNode;
  /**
   * 卡片内容
   */
  children: React.ReactNode;
  /**
   * 卡片底部
   */
  footer?: React.ReactNode;
  /**
   * 是否包含阴影
   */
  shadow?: boolean;
  /**
   * 是否包含边框
   */
  bordered?: boolean;
  /**
   * 卡片高度固定
   */
  fixedHeight?: boolean | string | number;
}

/**
 * 卡片组件，用于内容分组展示
 */
const Card: React.FC<CardProps> = ({
  title,
  children,
  footer,
  shadow = true,
  bordered = true,
  fixedHeight,
  className,
  ...rest
}) => {
  const cardClasses = clsx(
    'bg-white rounded overflow-hidden',
    {
      'shadow': shadow,
      'border border-gray-200': bordered,
    },
    className
  );
  
  const contentStyle: React.CSSProperties = {};
  
  if (fixedHeight) {
    if (typeof fixedHeight === 'boolean') {
      contentStyle.height = '100%';
    } else {
      contentStyle.height = fixedHeight;
    }
    contentStyle.overflow = 'auto';
  }
  
  return (
    <div className={cardClasses} {...rest}>
      {title && (
        <div className="px-4 py-3 border-b border-gray-200">
          {typeof title === 'string' ? (
            <h3 className="font-medium text-gray-900">{title}</h3>
          ) : (
            title
          )}
        </div>
      )}
      
      <div className="p-4" style={contentStyle}>
        {children}
      </div>
      
      {footer && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
