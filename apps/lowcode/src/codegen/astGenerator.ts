/**
 * AST生成器
 * 将低代码组件模型转换为抽象语法树
 */

import { ComponentModel } from '@/types';
import { getComponentMapping } from './componentMapper';
import { ASTNode, GenerationContext, TargetPlatform } from './types';

/**
 * 将组件模型转换为AST节点
 */
export function componentToAST(
    component: ComponentModel,
    platform: TargetPlatform,
    context: GenerationContext
): ASTNode {
    const mapping = getComponentMapping(component.type, platform);

    if (!mapping) {
        throw new Error(`Component type "${component.type}" is not supported on platform "${platform}"`);
    }

    // 记录具名导入
    if (!context.imports[mapping.importPath]) {
        context.imports[mapping.importPath] = new Set();
    }
    context.imports[mapping.importPath].add(mapping.component);

    // 转换属性
    const transformedProps = transformProps(component.props, mapping.props || [], context);

    // 转换样式
    const transformedStyles = transformStyles(component.style, context);

    // 递归处理子组件
    const children: ASTNode[] = [];
    if (component.children) {
        for (const child of component.children) {
            children.push(componentToAST(child, platform, context));
        }
    }

    return {
        type: 'component',
        tagName: mapping.component,
        props: transformedProps,
        styles: transformedStyles,
        children,
    };
}

/**
 * 转换组件属性
 */
function transformProps(
    originalProps: Record<string, any>,
    propMappings: any[],
    context: GenerationContext
): Record<string, any> {
    const transformedProps: Record<string, any> = {};

    // 如果没有映射配置，直接使用原属性
    if (!propMappings.length) {
        return originalProps;
    }

    // 应用属性映射
    for (const mapping of propMappings) {
        const sourceValue = originalProps[mapping.source];
        if (sourceValue !== undefined) {
            const targetValue = mapping.transform
                ? mapping.transform(sourceValue)
                : sourceValue;
            transformedProps[mapping.target] = targetValue;
        }
    }

    // 保留未映射的属性
    for (const [key, value] of Object.entries(originalProps)) {
        const isMapped = propMappings.some(m => m.source === key);
        if (!isMapped) {
            transformedProps[key] = value;
        }
    }

    return transformedProps;
}

/**
 * 转换样式属性
 */
function transformStyles(
    originalStyles: Record<string, any>,
    context: GenerationContext
): Record<string, any> {
    const transformedStyles: Record<string, any> = {};

    for (const [key, value] of Object.entries(originalStyles)) {
        // 基础样式转换逻辑
        const transformedKey = transformStyleKey(key, context.platform);
        const transformedValue = transformStyleValue(key, value, context.platform);

        transformedStyles[transformedKey] = transformedValue;
    }

    return transformedStyles;
}

/**
 * 转换样式属性名
 */
function transformStyleKey(key: string, platform: TargetPlatform): string {
    // 平台特定的样式属性转换
    const styleKeyMappings: Record<TargetPlatform, Record<string, string>> = {
        weapp: {
            'backgroundColor': 'background-color',
            'fontSize': 'font-size',
            'fontWeight': 'font-weight',
            'textAlign': 'text-align',
            'borderRadius': 'border-radius',
        },
        alipay: {
            'backgroundColor': 'background-color',
            'fontSize': 'font-size',
            'fontWeight': 'font-weight',
            'textAlign': 'text-align',
            'borderRadius': 'border-radius',
        },
        h5: {
            // H5使用标准CSS属性名，可能需要驼峰转换
        },
        rn: {
            // React Native使用驼峰命名
        },
        tt: {},
        qq: {},
    };

    return styleKeyMappings[platform]?.[key] || key;
}

/**
 * 转换样式属性值
 */
function transformStyleValue(key: string, value: any, platform: TargetPlatform): any {
    // 单位转换
    if (typeof value === 'number') {
        // 在小程序中，数值默认单位为rpx
        if (platform === 'weapp' || platform === 'alipay') {
            return `${value}rpx`;
        }
        // 在H5中，数值默认单位为px
        if (platform === 'h5') {
            return `${value}px`;
        }
    }

    // 颜色值转换
    if (key.includes('color') || key.includes('Color')) {
        return transformColorValue(value, platform);
    }

    return value;
}

/**
 * 转换颜色值
 */
function transformColorValue(value: any, platform: TargetPlatform): any {
    // 这里可以添加平台特定的颜色转换逻辑
    // 例如：某些平台不支持rgba，需要转换为hex
    return value;
}

/**
 * 生成完整的页面AST
 */
export function generatePageAST(
    rootComponent: ComponentModel,
    platform: TargetPlatform
): { ast: ASTNode; context: GenerationContext } {
    const context: GenerationContext = {
        platform,
        componentMappings: [],
        globalStyles: {},
        imports: {},
        dependencies: new Set(),
    };

    const ast = componentToAST(rootComponent, platform, context);

    return { ast, context };
}
