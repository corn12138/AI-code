import { ComponentModel } from '@/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * 根据ID查找组件
 */
export function findComponentById(root: ComponentModel, id: string): ComponentModel | null {
  if (root.id === id) {
    return root;
  }
  
  if (!root.children) {
    return null;
  }
  
  for (const child of root.children) {
    const found = findComponentById(child, id);
    if (found) {
      return found;
    }
  }
  
  return null;
}

/**
 * 根据ID查找组件的父组件
 */
export function findParentComponent(root: ComponentModel, id: string): ComponentModel | null {
  if (!root.children) {
    return null;
  }
  
  for (const child of root.children) {
    if (child.id === id) {
      return root;
    }
    
    const found = findParentComponent(child, id);
    if (found) {
      return found;
    }
  }
  
  return null;
}

/**
 * 从组件树中删除指定ID的组件
 */
export function removeComponent(root: ComponentModel, id: string): ComponentModel {
  if (root.id === id) {
    // 不能删除根组件
    return root;
  }
  
  if (!root.children) {
    return root;
  }
  
  // 在当前组件的子组件中查找并删除
  root.children = root.children.filter(child => child.id !== id);
  
  // 递归处理所有子组件
  root.children.forEach(child => {
    removeComponent(child, id);
  });
  
  return root;
}

/**
 * 更新组件
 */
export function updateComponent(root: ComponentModel, id: string, updates: Partial<ComponentModel>): ComponentModel {
  if (root.id === id) {
    return { ...root, ...updates };
  }
  
  if (!root.children) {
    return root;
  }
  
  const updatedChildren = root.children.map(child => updateComponent(child, id, updates));
  
  return {
    ...root,
    children: updatedChildren
  };
}

/**
 * 创建新组件实例
 */
export function createComponentInstance(type: string, props: any = {}, style: any = {}, children: ComponentModel[] = []): ComponentModel {
  return {
    id: uuidv4(),
    type,
    name: type,
    props,
    style,
    children
  };
}

/**
 * 创建一个空页面模板
 */
export function createEmptyPage(name: string = '新页面'): ComponentModel {
  return {
    id: 'root',
    type: 'Root',
    name: 'Root',
    props: {},
    style: {},
    children: []
  };
}

/**
 * 深度克隆组件
 */
export function cloneComponent(component: ComponentModel): ComponentModel {
  return JSON.parse(JSON.stringify(component));
}
