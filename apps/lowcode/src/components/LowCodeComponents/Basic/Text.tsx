import React from 'react';
import { ComponentProps } from '@/types';

interface TextProps extends ComponentProps {
  content: string;
  tag?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';
  style?: React.CSSProperties;
}

export const Text: React.FC<TextProps> = ({ 
  content, 
  tag = 'p', 
  style = {} 
}) => {
  const Tag = tag as keyof JSX.IntrinsicElements;
  
  return (
    <Tag style={style}>{content}</Tag>
  );
};
