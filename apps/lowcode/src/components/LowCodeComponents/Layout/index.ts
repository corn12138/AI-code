import { ComponentRegistration } from '@/types';
import { Grid } from './Grid';
import { Row } from './Row';
import { Column } from './Column';

export const layoutComponents: ComponentRegistration[] = [
  {
    type: 'Grid',
    name: '栅格',
    icon: 'grid-icon',
    description: '24列栅格布局，响应式设计',
    defaultProps: {
      gutter: 16,
      justify: 'start',
      align: 'top'
    },
    defaultStyle: {
      width: '100%'
    },
    propSchema: {
      type: 'object',
      properties: {
        gutter: { type: 'number', title: '间距' },
        justify: { 
          type: 'string', 
          title: '水平对齐',
          enum: ['start', 'end', 'center', 'space-between', 'space-around'],
          enumNames: ['起始', '结束', '居中', '两端', '环绕']
        },
        align: { 
          type: 'string', 
          title: '垂直对齐',
          enum: ['top', 'middle', 'bottom'],
          enumNames: ['顶部', '中间', '底部']
        }
      }
    },
    styleSchema: {
      type: 'object',
      properties: {
        width: { type: 'string', title: '宽度' },
        margin: { type: 'string', title: '外边距' }
      }
    },
    Component: Grid,
    allowChildren: true,
    category: 'layout'
  },
  {
    type: 'Row',
    name: '行',
    icon: 'row-icon',
    description: '行容器，用于放置列',
    defaultProps: {
      gutter: 16,
      justify: 'start',
      align: 'top'
    },
    defaultStyle: {
      width: '100%',
      marginBottom: '16px'
    },
    propSchema: {
      type: 'object',
      properties: {
        gutter: { type: 'number', title: '间距' },
        justify: { 
          type: 'string', 
          title: '水平对齐',
          enum: ['start', 'end', 'center', 'space-between', 'space-around'],
          enumNames: ['起始', '结束', '居中', '两端', '环绕']
        },
        align: { 
          type: 'string', 
          title: '垂直对齐',
          enum: ['top', 'middle', 'bottom'],
          enumNames: ['顶部', '中间', '底部']
        }
      }
    },
    styleSchema: {
      type: 'object',
      properties: {
        width: { type: 'string', title: '宽度' },
        marginBottom: { type: 'string', title: '下边距' }
      }
    },
    Component: Row,
    allowChildren: true,
    category: 'layout'
  },
  {
    type: 'Column',
    name: '列',
    icon: 'column-icon',
    description: '列容器，栅格系统中的基本单位',
    defaultProps: {
      span: 12,
      offset: 0,
      xs: null,
      sm: null,
      md: null,
      lg: null,
      xl: null
    },
    defaultStyle: {
      minHeight: '50px'
    },
    propSchema: {
      type: 'object',
      properties: {
        span: { 
          type: 'number', 
          title: '列宽',
          minimum: 0,
          maximum: 24
        },
        offset: { 
          type: 'number', 
          title: '偏移量',
          minimum: 0,
          maximum: 24
        },
        xs: { 
          type: ['number', 'null'], 
          title: '超小屏幕 <576px',
          minimum: 0,
          maximum: 24
        },
        sm: { 
          type: ['number', 'null'], 
          title: '小屏幕 ≥576px',
          minimum: 0,
          maximum: 24
        },
        md: { 
          type: ['number', 'null'], 
          title: '中等屏幕 ≥768px',
          minimum: 0,
          maximum: 24
        },
        lg: { 
          type: ['number', 'null'], 
          title: '大屏幕 ≥992px',
          minimum: 0,
          maximum: 24
        },
        xl: { 
          type: ['number', 'null'], 
          title: '超大屏幕 ≥1200px',
          minimum: 0,
          maximum: 24
        }
      }
    },
    styleSchema: {
      type: 'object',
      properties: {
        padding: { type: 'string', title: '内边距' },
        minHeight: { type: 'string', title: '最小高度' },
        background: { type: 'string', title: '背景色', widget: 'color' }
      }
    },
    Component: Column,
    allowChildren: true,
    category: 'layout'
  }
];
