import React from 'react';
import { ComponentProps } from '@/types';

interface GridProps extends ComponentProps {
  gutter?: number;
  justify?: 'start' | 'end' | 'center' | 'space-between' | 'space-around';
  align?: 'top' | 'middle' | 'bottom';
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Grid: React.FC<GridProps> = ({ 
  gutter = 16, 
  justify = 'start', 
  align = 'top',
  children,
  style = {} 
}) => {
  const gridStyle: React.CSSProperties = {
    ...style,
    display: 'flex',
    flexWrap: 'wrap',
    marginLeft: -gutter / 2,
    marginRight: -gutter / 2,
    justifyContent: mapJustify(justify),
    alignItems: mapAlign(align)
  };
  
  // 为所有直接子元素添加gutter间距
  const childrenWithGutter = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        style: {
          ...(child.props.style || {}),
          paddingLeft: gutter / 2,
          paddingRight: gutter / 2
        }
      });
    }
    return child;
  });
  
  return (
    <div style={gridStyle}>
      {childrenWithGutter}
    </div>
  );
};

// 映射对齐方式
function mapJustify(justify: string): React.CSSProperties['justifyContent'] {
  const map: Record<string, React.CSSProperties['justifyContent']> = {
    'start': 'flex-start',
    'end': 'flex-end',
    'center': 'center',
    'space-between': 'space-between',
    'space-around': 'space-around'
  };
  return map[justify] || 'flex-start';
}

function mapAlign(align: string): React.CSSProperties['alignItems'] {
  const map: Record<string, React.CSSProperties['alignItems']> = {
    'top': 'flex-start',
    'middle': 'center',
    'bottom': 'flex-end'
  };
  return map[align] || 'flex-start';
}
