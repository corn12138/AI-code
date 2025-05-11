import React from 'react';
import { ComponentProps } from '@/types';

interface ImageProps extends ComponentProps {
  src: string;
  alt?: string;
  objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
  style?: React.CSSProperties;
}

export const Image: React.FC<ImageProps> = ({ 
  src, 
  alt = '', 
  objectFit = 'cover',
  style = {} 
}) => {
  const imageStyle: React.CSSProperties = {
    ...style,
    objectFit
  };
  
  return (
    <img 
      src={src} 
      alt={alt} 
      style={imageStyle} 
      loading="lazy"
    />
  );
};
