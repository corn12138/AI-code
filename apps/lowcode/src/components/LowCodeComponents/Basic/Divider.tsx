import React from 'react';
import { ComponentProps } from '@/types';

interface DividerProps extends ComponentProps {
  orientation?: 'horizontal' | 'vertical';
  dashed?: boolean;
  text?: string;
  style?: React.CSSProperties;
}

export const Divider: React.FC<DividerProps> = ({ 
  orientation = 'horizontal',
  dashed = false,
  text = '',
  style = {} 
}) => {
  const baseStyle: React.CSSProperties = {
    ...style,
    borderStyle: dashed ? 'dashed' : 'solid',
  };
  
  if (orientation === 'vertical') {
    return (
      <div
        style={{
          ...baseStyle,
          display: 'inline-block',
          height: '1em',
          width: 0,
          verticalAlign: 'middle',
          position: 'relative',
          top: '-0.06em',
          borderLeftWidth: style.borderWidth || '1px',
          margin: style.margin || '0 8px',
        }}
      />
    );
  }
  
  if (text) {
    return (
      <div
        style={{
          ...baseStyle,
          display: 'flex',
          alignItems: 'center',
          width: style.width || '100%',
          margin: style.margin || '16px 0',
          whiteSpace: 'nowrap',
          borderWidth: 0,
        }}
      >
        <div
          style={{
            flex: 1,
            borderTopWidth: style.borderWidth || '1px',
            borderTopStyle: dashed ? 'dashed' : 'solid',
            borderTopColor: style.borderColor || '#e8e8e8',
          }}
        />
        <span style={{ padding: '0 16px' }}>{text}</span>
        <div
          style={{
            flex: 1,
            borderTopWidth: style.borderWidth || '1px',
            borderTopStyle: dashed ? 'dashed' : 'solid',
            borderTopColor: style.borderColor || '#e8e8e8',
          }}
        />
      </div>
    );
  }
  
  return (
    <hr
      style={{
        ...baseStyle,
        width: style.width || '100%',
        height: 0,
        margin: style.margin || '16px 0',
        borderWidth: 0,
        borderTopWidth: style.borderWidth || '1px',
      }}
    />
  );
};
