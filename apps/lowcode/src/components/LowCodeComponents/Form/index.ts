import { ComponentRegistration } from '@/types';
import { Form } from './Form';
import { Input } from './Input';
import { Select } from './Select';
import { Checkbox } from './Checkbox';
import { Radio } from './Radio';
import { Switch } from './Switch';

export const formComponents: ComponentRegistration[] = [
  {
    type: 'Form',
    name: '表单',
    icon: 'form-icon',
    description: '表单容器，用于包裹表单控件',
    defaultProps: {
      name: 'form',
      layout: 'vertical',
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      initialValues: {},
      onSubmit: { type: 'console.log', args: ['Form submitted'] }
    },
    defaultStyle: {
      width: '100%',
      padding: '16px',
      border: '1px solid #eee',
      borderRadius: '4px'
    },
    propSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', title: '表单名称' },
        layout: { 
          type: 'string', 
          title: '布局方式',
          enum: ['vertical', 'horizontal', 'inline'],
          enumNames: ['垂直', '水平', '内联']
        },
        labelCol: { 
          type: 'object', 
          title: '标签列布局',
          properties: {
            span: { type: 'number', title: '宽度', minimum: 1, maximum: 24 }
          }
        },
        wrapperCol: { 
          type: 'object', 
          title: '控件列布局',
          properties: {
            span: { type: 'number', title: '宽度', minimum: 1, maximum: 24 }
          }
        },
        initialValues: { 
          type: 'object', 
          title: '初始值',
          properties: {}
        },
        onSubmit: { 
          type: 'object', 
          title: '提交事件',
          properties: {
            type: { 
              type: 'string',
              enum: ['console.log', 'alert'],
              enumNames: ['控制台输出', '弹窗提示']
            },
            args: { type: 'array', items: { type: 'string' } }
          }
        }
      },
      required: ['name']
    },
    styleSchema: {
      type: 'object',
      properties: {
        width: { type: 'string', title: '宽度' },
        padding: { type: 'string', title: '内边距' },
        border: { type: 'string', title: '边框' },
        borderRadius: { type: 'string', title: '圆角' }
      }
    },
    Component: Form,
    allowChildren: true,
    category: 'form'
  },
  {
    type: 'Input',
    name: '输入框',
    icon: 'input-icon',
    description: '基础表单输入控件',
    defaultProps: {
      name: 'input',
      label: '输入框',
      placeholder: '请输入',
      type: 'text',
      required: false,
      defaultValue: '',
      disabled: false
    },
    defaultStyle: {
      width: '100%',
      marginBottom: '16px'
    },
    propSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', title: '字段名' },
        label: { type: 'string', title: '标签' },
        placeholder: { type: 'string', title: '占位文本' },
        type: { 
          type: 'string', 
          title: '输入类型',
          enum: ['text', 'password', 'number', 'email', 'tel', 'url'],
          enumNames: ['文本', '密码', '数字', '邮箱', '电话', '网址']
        },
        required: { type: 'boolean', title: '必填' },
        defaultValue: { type: 'string', title: '默认值' },
        disabled: { type: 'boolean', title: '禁用' },
        maxLength: { type: 'number', title: '最大长度' },
        addonBefore: { type: 'string', title: '前置标签' },
        addonAfter: { type: 'string', title: '后置标签' }
      },
      required: ['name', 'label']
    },
    styleSchema: {
      type: 'object',
      properties: {
        width: { type: 'string', title: '宽度' },
        marginBottom: { type: 'string', title: '下边距' }
      }
    },
    Component: Input,
    category: 'form'
  },
  {
    type: 'Select',
    name: '选择器',
    icon: 'select-icon',
    description: '下拉选择控件',
    defaultProps: {
      name: 'select',
      label: '选择器',
      placeholder: '请选择',
      options: [
        { label: '选项1', value: '1' },
        { label: '选项2', value: '2' }
      ],
      required: false,
      defaultValue: '',
      disabled: false,
      allowClear: true
    },
    defaultStyle: {
      width: '100%',
      marginBottom: '16px'
    },
    propSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', title: '字段名' },
        label: { type: 'string', title: '标签' },
        placeholder: { type: 'string', title: '占位文本' },
        options: { 
          type: 'array', 
          title: '选项',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string', title: '标签' },
              value: { type: 'string', title: '值' }
            }
          }
        },
        required: { type: 'boolean', title: '必填' },
        defaultValue: { type: 'string', title: '默认值' },
        disabled: { type: 'boolean', title: '禁用' },
        allowClear: { type: 'boolean', title: '允许清空' },
        mode: { 
          type: 'string', 
          title: '模式',
          enum: ['default', 'multiple', 'tags'],
          enumNames: ['单选', '多选', '标签']
        }
      },
      required: ['name', 'label', 'options']
    },
    styleSchema: {
      type: 'object',
      properties: {
        width: { type: 'string', title: '宽度' },
        marginBottom: { type: 'string', title: '下边距' }
      }
    },
    Component: Select,
    category: 'form'
  },
  {
    type: 'Checkbox',
    name: '复选框',
    icon: 'checkbox-icon',
    description: '复选框控件',
    defaultProps: {
      name: 'checkbox',
      label: '复选框',
      options: [
        { label: '选项1', value: '1' },
        { label: '选项2', value: '2' }
      ],
      required: false,
      defaultValue: [],
      disabled: false
    },
    defaultStyle: {
      width: '100%',
      marginBottom: '16px'
    },
    propSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', title: '字段名' },
        label: { type: 'string', title: '标签' },
        options: { 
          type: 'array', 
          title: '选项',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string', title: '标签' },
              value: { type: 'string', title: '值' }
            }
          }
        },
        required: { type: 'boolean', title: '必填' },
        defaultValue: { type: 'array', title: '默认值', items: { type: 'string' } },
        disabled: { type: 'boolean', title: '禁用' }
      },
      required: ['name', 'label', 'options']
    },
    styleSchema: {
      type: 'object',
      properties: {
        width: { type: 'string', title: '宽度' },
        marginBottom: { type: 'string', title: '下边距' }
      }
    },
    Component: Checkbox,
    category: 'form'
  },
  {
    type: 'Radio',
    name: '单选框',
    icon: 'radio-icon',
    description: '单选框控件',
    defaultProps: {
      name: 'radio',
      label: '单选框',
      options: [
        { label: '选项1', value: '1' },
        { label: '选项2', value: '2' }
      ],
      required: false,
      defaultValue: '',
      disabled: false,
      optionType: 'default'
    },
    defaultStyle: {
      width: '100%',
      marginBottom: '16px'
    },
    propSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', title: '字段名' },
        label: { type: 'string', title: '标签' },
        options: { 
          type: 'array', 
          title: '选项',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string', title: '标签' },
              value: { type: 'string', title: '值' }
            }
          }
        },
        required: { type: 'boolean', title: '必填' },
        defaultValue: { type: 'string', title: '默认值' },
        disabled: { type: 'boolean', title: '禁用' },
        optionType: { 
          type: 'string', 
          title: '按钮样式',
          enum: ['default', 'button'],
          enumNames: ['默认', '按钮']
        }
      },
      required: ['name', 'label', 'options']
    },
    styleSchema: {
      type: 'object',
      properties: {
        width: { type: 'string', title: '宽度' },
        marginBottom: { type: 'string', title: '下边距' }
      }
    },
    Component: Radio,
    category: 'form'
  },
  {
    type: 'Switch',
    name: '开关',
    icon: 'switch-icon',
    description: '开关控件',
    defaultProps: {
      name: 'switch',
      label: '开关',
      checkedChildren: '',
      unCheckedChildren: '',
      required: false,
      defaultChecked: false,
      disabled: false
    },
    defaultStyle: {
      marginBottom: '16px'
    },
    propSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', title: '字段名' },
        label: { type: 'string', title: '标签' },
        checkedChildren: { type: 'string', title: '选中时内容' },
        unCheckedChildren: { type: 'string', title: '非选中时内容' },
        required: { type: 'boolean', title: '必填' },
        defaultChecked: { type: 'boolean', title: '默认选中' },
        disabled: { type: 'boolean', title: '禁用' }
      },
      required: ['name', 'label']
    },
    styleSchema: {
      type: 'object',
      properties: {
        marginBottom: { type: 'string', title: '下边距' }
      }
    },
    Component: Switch,
    category: 'form'
  }
];
