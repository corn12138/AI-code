// 组件基础属性
export interface ComponentProps {
  [key: string]: any;
}

// 组件样式
export interface ComponentStyle {
  [key: string]: string | number;
}

// 组件模型
export interface ComponentModel {
  id: string;
  type: string;
  name: string;
  props: ComponentProps;
  style: ComponentStyle;
  children?: ComponentModel[];
  parent?: string;
}

// 页面模型
export interface PageModel {
  id: string;
  name: string;
  description?: string;
  components: ComponentModel;
  version: string;
  createdAt: string;
  updatedAt: string;
}

// 组件注册信息
export interface ComponentRegistration {
  type: string;
  name: string;
  icon: string;
  description?: string;
  defaultProps: ComponentProps;
  defaultStyle: ComponentStyle;
  propSchema: PropSchema;
  styleSchema: PropSchema;
  Component: React.ComponentType<any>;
  allowChildren?: boolean;
  initialChildren?: ComponentModel[];
  category: 'basic' | 'layout' | 'form' | 'chart' | 'advanced';
}

// JSON Schema相关类型
export type PropType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null';

export interface PropSchema {
  type: PropType | PropType[];
  title?: string;
  description?: string;
  properties?: Record<string, PropSchema>;
  items?: PropSchema;
  required?: string[];
  enum?: any[];
  enumNames?: string[];
  default?: any;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  format?: string;
  widget?: string;
}

// 拖拽相关类型
export interface DragItem {
  type: string;
  id: string;
  component: ComponentRegistration;
  index?: number;
}

// 编辑器相关类型
export type EditorMode = 'edit' | 'preview';

export interface EditorState {
  currentPage: PageModel | null;
  selectedId: string | null;
  hoveredId: string | null;
  mode: EditorMode;
  canvasScale: number;
  showGrid: boolean;
}

// 低代码页面相关API类型
export interface CreatePageDTO {
  name: string;
  description?: string;
  components: ComponentModel;
}

export interface UpdatePageDTO {
  name?: string;
  description?: string;
  components?: ComponentModel;
}

export interface PageResponse {
  id: string;
  name: string;
  description?: string;
  components: ComponentModel;
  version: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  isPublished: boolean;
}

// 用户相关类型
export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  role: string;
}
