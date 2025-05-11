import React from 'react';
import { ComponentProps } from '@/types';

interface ColumnProps extends ComponentProps {
  span?: number;
  offset?: number;
  xs?: number | null;
  sm?: number | null;
  md?: number | null;
  lg?: number | null;
  xl?: number | null;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Column: React.FC<ColumnProps> = ({ 
  span = 12, 
  offset = 0,
  xs = null,
  sm = null,
  md = null,
  lg = null,
  xl = null,
  children,
  style = {} 
}) => {
  // 计算基础样式
  const columnStyle: React.CSSProperties = {
    ...style,
    flex: `0 0 ${(span / 24) * 100}%`,
    maxWidth: `${(span / 24) * 100}%`,
    marginLeft: offset > 0 ? `${(offset / 24) * 100}%` : undefined,
    boxSizing: 'border-box'
  };
  
  return (
    <div style={columnStyle}>
      {children}
    </div>
  );
};
