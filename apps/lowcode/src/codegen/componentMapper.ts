/**
 * 组件映射器
 * 负责将现有组件映射到Taro多端组件
 */

import { ComponentPlatformMapping, TargetPlatform } from './types';

// 基础组件映射配置
// 内置基础映射
export const COMPONENT_MAPPINGS: ComponentPlatformMapping[] = [
  // 容器组件
  {
    type: 'Container',
    platforms: {
      weapp: {
        component: 'View',
        importPath: '@tarojs/components',
      },
      alipay: {
        component: 'View',
        importPath: '@tarojs/components',
      },
      h5: {
        component: 'View',
        importPath: '@tarojs/components',
      },
      rn: {
        component: 'View',
        importPath: '@tarojs/components',
      },
      tt: {
        component: 'View',
        importPath: '@tarojs/components',
      },
      qq: {
        component: 'View',
        importPath: '@tarojs/components',
      },
    },
  },

  // 文本组件
  {
    type: 'Text',
    platforms: {
      weapp: {
        component: 'Text',
        importPath: '@tarojs/components',
      },
      alipay: {
        component: 'Text',
        importPath: '@tarojs/components',
      },
      h5: {
        component: 'Text',
        importPath: '@tarojs/components',
      },
      rn: {
        component: 'Text',
        importPath: '@tarojs/components',
      },
      tt: {
        component: 'Text',
        importPath: '@tarojs/components',
      },
      qq: {
        component: 'Text',
        importPath: '@tarojs/components',
      },
    },
  },

  // 按钮组件
  {
    type: 'Button',
    platforms: {
      weapp: {
        component: 'Button',
        importPath: '@tarojs/components',
        props: [
          { source: 'variant', target: 'type', transform: (value: string) => value === 'contained' ? 'primary' : 'default' },
          { source: 'disabled', target: 'disabled' },
          { source: 'onClick', target: 'onClick' }
        ]
      },
      alipay: {
        component: 'Button',
        importPath: '@tarojs/components',
        props: [
          { source: 'variant', target: 'type', transform: (value: string) => value === 'contained' ? 'primary' : 'default' },
          { source: 'disabled', target: 'disabled' },
          { source: 'onClick', target: 'onTap' }
        ]
      },
      h5: {
        component: 'Button',
        importPath: '@tarojs/components',
        props: [
          { source: 'variant', target: 'className', transform: (value: string) => `btn-${value}` },
          { source: 'disabled', target: 'disabled' },
          { source: 'onClick', target: 'onClick' }
        ]
      },
      rn: {
        component: 'Button',
        importPath: '@tarojs/components',
        props: [
          { source: 'variant', target: 'type', transform: (value: string) => value === 'contained' ? 'primary' : 'default' },
          { source: 'disabled', target: 'disabled' },
          { source: 'onClick', target: 'onPress' }
        ]
      },
      tt: {
        component: 'Button',
        importPath: '@tarojs/components'
      },
      qq: {
        component: 'Button',
        importPath: '@tarojs/components'
      }
    }
  },

  // 输入框组件
  {
    type: 'Input',
    platforms: {
      weapp: {
        component: 'Input',
        importPath: '@tarojs/components',
        props: [
          { source: 'value', target: 'value' },
          { source: 'placeholder', target: 'placeholder' },
          { source: 'onChange', target: 'onInput' },
          { source: 'disabled', target: 'disabled' }
        ]
      },
      alipay: {
        component: 'Input',
        importPath: '@tarojs/components',
        props: [
          { source: 'value', target: 'value' },
          { source: 'placeholder', target: 'placeholder' },
          { source: 'onChange', target: 'onInput' },
          { source: 'disabled', target: 'disabled' }
        ]
      },
      h5: {
        component: 'Input',
        importPath: '@tarojs/components',
        props: [
          { source: 'value', target: 'value' },
          { source: 'placeholder', target: 'placeholder' },
          { source: 'onChange', target: 'onInput' },
          { source: 'disabled', target: 'disabled' }
        ]
      },
      rn: {
        component: 'Input',
        importPath: '@tarojs/components',
        props: [
          { source: 'value', target: 'value' },
          { source: 'placeholder', target: 'placeholder' },
          { source: 'onChange', target: 'onChangeText' },
          { source: 'disabled', target: 'editable', transform: (value) => !value }
        ]
      },
      tt: {
        component: 'Input',
        importPath: '@tarojs/components',
      },
      qq: {
        component: 'Input',
        importPath: '@tarojs/components',
      },
    },
  },

  // 图片组件
  {
    type: 'Image',
    platforms: {
      weapp: {
        component: 'Image',
        importPath: '@tarojs/components',
        props: [
          { source: 'src', target: 'src' },
          { source: 'alt', target: 'alt' },
          { source: 'mode', target: 'mode' }
        ]
      },
      alipay: {
        component: 'Image',
        importPath: '@tarojs/components',
        props: [
          { source: 'src', target: 'src' },
          { source: 'alt', target: 'alt' },
          { source: 'mode', target: 'mode' }
        ]
      },
      h5: {
        component: 'Image',
        importPath: '@tarojs/components',
        props: [
          { source: 'src', target: 'src' },
          { source: 'alt', target: 'alt' }
        ]
      },
      rn: {
        component: 'Image',
        importPath: '@tarojs/components',
        props: [
          { source: 'src', target: 'source', transform: (value) => ({ uri: value }) },
          { source: 'mode', target: 'resizeMode' }
        ]
      },
      tt: {
        component: 'Image',
        importPath: '@tarojs/components',
      },
      qq: {
        component: 'Image',
        importPath: '@tarojs/components',
      },
    },
  },
];

// 自定义映射（运行期可注册）
const CUSTOM_MAPPINGS: ComponentPlatformMapping[] = [];

/**
 * 注册组件映射
 * options.override = true 时覆盖同名组件的已有映射；否则做浅合并（按平台键覆盖）
 */
export function registerComponentMappings(
  mappings: ComponentPlatformMapping[],
  options: { override?: boolean } = {}
): void {
  for (const incoming of mappings) {
    const existingIndex = CUSTOM_MAPPINGS.findIndex(m => m.type === incoming.type);
    if (existingIndex >= 0) {
      if (options.override) {
        CUSTOM_MAPPINGS[existingIndex] = incoming;
      } else {
        CUSTOM_MAPPINGS[existingIndex] = mergePlatformMapping(CUSTOM_MAPPINGS[existingIndex], incoming);
      }
    } else {
      CUSTOM_MAPPINGS.push(incoming);
    }
  }
}

/**
 * 清空自定义映射（主要用于测试或重置）
 */
export function clearCustomComponentMappings(): void {
  CUSTOM_MAPPINGS.splice(0, CUSTOM_MAPPINGS.length);
}

function mergePlatformMapping(base: ComponentPlatformMapping, patch: ComponentPlatformMapping): ComponentPlatformMapping {
  const result: ComponentPlatformMapping = {
    type: base.type,
    platforms: { ...base.platforms }
  } as ComponentPlatformMapping;

  for (const [platform, cfg] of Object.entries(patch.platforms)) {
    const prev = result.platforms[platform as TargetPlatform];
    // 浅合并 props/styles 数组直接替换
    result.platforms[platform as TargetPlatform] = prev
      ? { ...prev, ...cfg }
      : cfg;
  }

  return result;
}

function getAllMappings(): ComponentPlatformMapping[] {
  // 自定义映射优先级高于内置映射（同名组件会被覆盖或合并）
  const byType = new Map<string, ComponentPlatformMapping>();
  for (const m of COMPONENT_MAPPINGS) {
    byType.set(m.type, m);
  }
  for (const cm of CUSTOM_MAPPINGS) {
    const existed = byType.get(cm.type);
    if (existed) {
      byType.set(cm.type, mergePlatformMapping(existed, cm));
    } else {
      byType.set(cm.type, cm);
    }
  }
  return Array.from(byType.values());
}

/**
 * 获取组件在指定平台的映射配置
 */
export function getComponentMapping(componentType: string, platform: TargetPlatform) {
  const mapping = getAllMappings().find(m => m.type === componentType);
  return mapping?.platforms[platform];
}

/**
 * 获取所有支持的组件类型
 */
export function getSupportedComponentTypes(): string[] {
  return getAllMappings().map(m => m.type);
}

/**
 * 检查组件是否支持指定平台
 */
export function isComponentSupportedOnPlatform(componentType: string, platform: TargetPlatform): boolean {
  const mapping = getComponentMapping(componentType, platform);
  return !!mapping;
}
