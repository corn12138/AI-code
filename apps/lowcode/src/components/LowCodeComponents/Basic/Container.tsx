import React from 'react';
import { ComponentProps } from '@/types';

interface ContainerProps extends ComponentProps {
  background?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Container: React.FC<ContainerProps> = ({ 
  background = 'transparent',
  children,
  style = {} 
}) => {
  const containerStyle: React.CSSProperties = {
    backgroundColor: background,
    ...style
  };
  
  return (
    <div style={containerStyle}>
      {children}
    </div>
  );
};
