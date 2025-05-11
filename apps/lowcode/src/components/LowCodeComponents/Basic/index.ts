import { ComponentRegistration } from '@/types';
import { Text } from './Text';
import { Button } from './Button';
import { Image } from './Image';
import { Container } from './Container';
import { Divider } from './Divider';

export const basicComponents: ComponentRegistration[] = [
  {
    type: 'Text',
    name: '文本',
    icon: 'text-icon',
    description: '文本组件，用于显示文字内容',
    defaultProps: {
      content: '这是一段文本',
      tag: 'p'
    },
    defaultStyle: {
      color: '#333333',
      fontSize: '14px',
      fontWeight: 'normal',
      lineHeight: '1.5',
      textAlign: 'left',
      padding: '8px'
    },
    propSchema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          title: '内容',
          widget: 'textarea'
        },
        tag: {
          type: 'string',
          title: 'HTML标签',
          enum: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span'],
          enumNames: ['段落', '标题1', '标题2', '标题3', '标题4', '标题5', '标题6', '行内文本']
        }
      },
      required: ['content']
    },
    styleSchema: {
      type: 'object',
      properties: {
        color: { type: 'string', title: '颜色', widget: 'color' },
        fontSize: { type: 'string', title: '字体大小' },
        fontWeight: { 
          type: 'string', 
          title: '字体粗细',
          enum: ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
          enumNames: ['正常', '粗体', '100', '200', '300', '400', '500', '600', '700', '800', '900']
        },
        lineHeight: { type: 'string', title: '行高' },
        textAlign: { 
          type: 'string', 
          title: '对齐方式',
          enum: ['left', 'center', 'right', 'justify'],
          enumNames: ['左对齐', '居中', '右对齐', '两端对齐']
        },
        padding: { type: 'string', title: '内边距' }
      }
    },
    Component: Text,
    category: 'basic'
  },
  {
    type: 'Button',
    name: '按钮',
    icon: 'button-icon',
    description: '按钮组件，用于触发交互行为',
    defaultProps: {
      text: '按钮',
      type: 'primary',
      size: 'medium',
      onClick: { type: 'console.log', args: ['Button clicked'] }
    },
    defaultStyle: {
      width: 'auto',
      padding: '8px 16px',
      borderRadius: '4px',
      margin: '8px'
    },
    propSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', title: '按钮文本' },
        type: { 
          type: 'string', 
          title: '类型',
          enum: ['primary', 'secondary', 'text', 'link'],
          enumNames: ['主要', '次要', '文本', '链接']
        },
        size: { 
          type: 'string', 
          title: '尺寸',
          enum: ['small', 'medium', 'large'],
          enumNames: ['小', '中', '大']
        },
        disabled: { type: 'boolean', title: '禁用' },
        onClick: { 
          type: 'object', 
          title: '点击事件',
          properties: {
            type: { 
              type: 'string',
              enum: ['console.log', 'alert', 'navigate'],
              enumNames: ['控制台输出', '弹窗提示', '页面跳转']
            },
            args: { type: 'array', items: { type: 'string' } }
          }
        }
      },
      required: ['text', 'type', 'size']
    },
    styleSchema: {
      type: 'object',
      properties: {
        width: { type: 'string', title: '宽度' },
        padding: { type: 'string', title: '内边距' },
        borderRadius: { type: 'string', title: '圆角' },
        margin: { type: 'string', title: '外边距' }
      }
    },
    Component: Button,
    category: 'basic'
  },
  {
    type: 'Image',
    name: '图片',
    icon: 'image-icon',
    description: '图片组件，用于展示图片',
    defaultProps: {
      src: 'https://via.placeholder.com/300x200',
      alt: '图片',
      objectFit: 'cover'
    },
    defaultStyle: {
      width: '100%',
      height: '200px',
      borderRadius: '4px',
      margin: '8px 0'
    },
    propSchema: {
      type: 'object',
      properties: {
        src: { type: 'string', title: '图片地址', widget: 'imageUpload' },
        alt: { type: 'string', title: '替代文本' },
        objectFit: { 
          type: 'string', 
          title: '填充方式',
          enum: ['fill', 'contain', 'cover', 'none', 'scale-down'],
          enumNames: ['填充', '包含', '覆盖', '无', '缩小']
        }
      },
      required: ['src']
    },
    styleSchema: {
      type: 'object',
      properties: {
        width: { type: 'string', title: '宽度' },
        height: { type: 'string', title: '高度' },
        borderRadius: { type: 'string', title: '圆角' },
        margin: { type: 'string', title: '外边距' }
      }
    },
    Component: Image,
    category: 'basic'
  },
  {
    type: 'Container',
    name: '容器',
    icon: 'container-icon',
    description: '容器组件，用于包裹其他组件',
    defaultProps: {
      background: 'transparent'
    },
    defaultStyle: {
      padding: '16px',
      border: '1px solid #eee',
      borderRadius: '4px',
      minHeight: '100px',
      width: '100%'
    },
    propSchema: {
      type: 'object',
      properties: {
        background: { type: 'string', title: '背景色', widget: 'color' }
      }
    },
    styleSchema: {
      type: 'object',
      properties: {
        width: { type: 'string', title: '宽度' },
        height: { type: 'string', title: '高度' },
        padding: { type: 'string', title: '内边距' },
        margin: { type: 'string', title: '外边距' },
        border: { type: 'string', title: '边框' },
        borderRadius: { type: 'string', title: '圆角' },
        backgroundColor: { type: 'string', title: '背景颜色', widget: 'color' },
        display: { 
          type: 'string', 
          title: '显示类型',
          enum: ['block', 'flex', 'inline-block', 'inline-flex'],
          enumNames: ['块级', '弹性布局', '内联块级', '内联弹性']
        },
        flexDirection: { 
          type: 'string', 
          title: '弹性方向',
          enum: ['row', 'column', 'row-reverse', 'column-reverse'],
          enumNames: ['水平', '垂直', '水平反向', '垂直反向']
        },
        justifyContent: { 
          type: 'string', 
          title: '主轴对齐',
          enum: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around'],
          enumNames: ['起始', '结束', '居中', '两端', '环绕']
        },
        alignItems: { 
          type: 'string', 
          title: '交叉轴对齐',
          enum: ['flex-start', 'flex-end', 'center', 'stretch', 'baseline'],
          enumNames: ['起始', '结束', '居中', '拉伸', '基线']
        }
      }
    },
    Component: Container,
    allowChildren: true,
    category: 'basic'
  },
  {
    type: 'Divider',
    name: '分割线',
    icon: 'divider-icon',
    description: '分割线组件，用于区隔内容',
    defaultProps: {
      orientation: 'horizontal',
      dashed: false,
      text: ''
    },
    defaultStyle: {
      margin: '16px 0',
      borderColor: '#e8e8e8',
      borderWidth: '1px',
      width: '100%'
    },
    propSchema: {
      type: 'object',
      properties: {
        orientation: { 
          type: 'string', 
          title: '方向',
          enum: ['horizontal', 'vertical'],
          enumNames: ['水平', '垂直']
        },
        dashed: { type: 'boolean', title: '虚线' },
        text: { type: 'string', title: '文本' }
      }
    },
    styleSchema: {
      type: 'object',
      properties: {
        margin: { type: 'string', title: '外边距' },
        borderColor: { type: 'string', title: '边框颜色', widget: 'color' },
        borderWidth: { type: 'string', title: '边框宽度' },
        width: { type: 'string', title: '宽度' }
      }
    },
    Component: Divider,
    category: 'basic'
  }
];
