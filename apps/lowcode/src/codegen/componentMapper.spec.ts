import { beforeEach, describe, expect, it } from 'vitest';
import { clearCustomComponentMappings, getComponentMapping, registerComponentMappings } from './componentMapper';
import type { ComponentPlatformMapping } from './types';

describe('componentMapper', () => {
    beforeEach(() => {
        clearCustomComponentMappings();
    });

    it('should get built-in mapping for basic components', () => {
        const mapping = getComponentMapping('Container', 'weapp');
        expect(mapping?.component).toBe('View');
        expect(mapping?.importPath).toBe('@tarojs/components');
    });

    it('should register custom mapping and fetch it', () => {
        const custom: ComponentPlatformMapping = {
            type: 'Card',
            platforms: {
                weapp: { component: 'View', importPath: '@tarojs/components' },
                alipay: { component: 'View', importPath: '@tarojs/components' },
                h5: { component: 'View', importPath: '@tarojs/components' },
                rn: { component: 'View', importPath: '@tarojs/components' },
                tt: { component: 'View', importPath: '@tarojs/components' },
                qq: { component: 'View', importPath: '@tarojs/components' }
            }
        };
        registerComponentMappings([custom]);

        const mapping = getComponentMapping('Card', 'h5');
        expect(mapping?.component).toBe('View');
    });

    it('should override existing mapping when override option is true', () => {
        const patch: ComponentPlatformMapping = {
            type: 'Button',
            platforms: {
                weapp: { component: 'Button', importPath: '@tarojs/components', props: [{ source: 'onClick', target: 'onTap' }] },
                alipay: { component: 'Button', importPath: '@tarojs/components' },
                h5: { component: 'Button', importPath: '@tarojs/components' },
                rn: { component: 'Button', importPath: '@tarojs/components' },
                tt: { component: 'Button', importPath: '@tarojs/components' },
                qq: { component: 'Button', importPath: '@tarojs/components' }
            }
        };
        registerComponentMappings([patch], { override: true });

        const mapping = getComponentMapping('Button', 'weapp');
        expect(mapping?.props?.some(p => p.source === 'onClick' && p.target === 'onTap')).toBe(true);
    });
});
