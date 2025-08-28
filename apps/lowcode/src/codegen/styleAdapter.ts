/**
 * 样式适配器
 * 处理不同平台的样式差异和兼容性
 */

import { TargetPlatform } from './types';

// 样式单位映射
const STYLE_UNITS: Record<TargetPlatform, string> = {
    weapp: 'rpx',
    alipay: 'rpx',
    h5: 'px',
    rn: '',  // React Native不需要单位
    tt: 'rpx',
    qq: 'rpx',
};

// 不支持的样式属性
const UNSUPPORTED_STYLES: Record<TargetPlatform, string[]> = {
    weapp: ['boxShadow', 'transform3d', 'filter'],
    alipay: ['boxShadow', 'transform3d', 'filter'],
    h5: [],
    rn: ['boxShadow', 'float', 'clear'],
    tt: ['boxShadow', 'transform3d', 'filter'],
    qq: ['boxShadow', 'transform3d', 'filter'],
};

// 样式属性名映射
const STYLE_PROPERTY_MAPPINGS: Record<TargetPlatform, Record<string, string>> = {
    weapp: {
        'backgroundColor': 'background-color',
        'fontSize': 'font-size',
        'fontWeight': 'font-weight',
        'textAlign': 'text-align',
        'borderRadius': 'border-radius',
        'marginTop': 'margin-top',
        'marginRight': 'margin-right',
        'marginBottom': 'margin-bottom',
        'marginLeft': 'margin-left',
        'paddingTop': 'padding-top',
        'paddingRight': 'padding-right',
        'paddingBottom': 'padding-bottom',
        'paddingLeft': 'padding-left',
    },
    alipay: {
        'backgroundColor': 'background-color',
        'fontSize': 'font-size',
        'fontWeight': 'font-weight',
        'textAlign': 'text-align',
        'borderRadius': 'border-radius',
        'marginTop': 'margin-top',
        'marginRight': 'margin-right',
        'marginBottom': 'margin-bottom',
        'marginLeft': 'margin-left',
        'paddingTop': 'padding-top',
        'paddingRight': 'padding-right',
        'paddingBottom': 'padding-bottom',
        'paddingLeft': 'padding-left',
    },
    h5: {
        // H5保持驼峰命名或转换为kebab-case
    },
    rn: {
        // React Native使用驼峰命名
        'borderRadius': 'borderRadius',
        'backgroundColor': 'backgroundColor',
    },
    tt: {},
    qq: {},
};

/**
 * 适配样式对象到目标平台
 */
export function adaptStyles(
    styles: Record<string, any>,
    platform: TargetPlatform
): Record<string, any> {
    const adaptedStyles: Record<string, any> = {};
    const propertyMappings = STYLE_PROPERTY_MAPPINGS[platform] || {};
    const unsupportedProps = UNSUPPORTED_STYLES[platform] || [];

    for (const [key, value] of Object.entries(styles)) {
        // 跳过不支持的样式属性
        if (unsupportedProps.includes(key)) {
            console.warn(`Style property "${key}" is not supported on platform "${platform}"`);
            continue;
        }

        // 转换属性名
        const adaptedKey = propertyMappings[key] || key;

        // 转换属性值
        const adaptedValue = adaptStyleValue(key, value, platform);

        adaptedStyles[adaptedKey] = adaptedValue;
    }

    return adaptedStyles;
}

/**
 * 适配样式值
 */
function adaptStyleValue(property: string, value: any, platform: TargetPlatform): any {
    // 处理数值类型的样式值
    if (typeof value === 'number') {
        return addStyleUnit(value, platform);
    }

    // 处理字符串类型的样式值
    if (typeof value === 'string') {
        // 处理颜色值
        if (isColorProperty(property)) {
            return adaptColorValue(value, platform);
        }

        // 处理带单位的数值
        if (hasNumericValue(value)) {
            return adaptUnitValue(value, platform);
        }
    }

    return value;
}

/**
 * 为数值添加适当的单位
 */
function addStyleUnit(value: number, platform: TargetPlatform): string | number {
    const unit = STYLE_UNITS[platform];

    if (!unit) {
        return value; // React Native等平台不需要单位
    }

    return `${value}${unit}`;
}

/**
 * 判断是否为颜色属性
 */
function isColorProperty(property: string): boolean {
    const colorProperties = [
        'color', 'backgroundColor', 'borderColor',
        'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
        'shadowColor', 'textShadowColor'
    ];

    return colorProperties.some(prop =>
        property.toLowerCase().includes(prop.toLowerCase())
    );
}

/**
 * 适配颜色值
 */
function adaptColorValue(value: string, platform: TargetPlatform): string {
    // 处理rgba到hex的转换（某些平台可能不支持rgba）
    if (platform === 'weapp' || platform === 'alipay') {
        // 小程序平台的特殊颜色处理
        return convertRgbaToSupportedFormat(value);
    }

    return value;
}

/**
 * 转换rgba颜色为支持的格式
 */
function convertRgbaToSupportedFormat(value: string): string {
    // 如果是rgba格式，尝试转换为hex或rgb
    if (value.startsWith('rgba(')) {
        // 简单的rgba转换逻辑，实际项目中可能需要更复杂的处理
        const rgbaMatch = value.match(/rgba\\((\\d+),\\s*(\\d+),\\s*(\\d+),\\s*([\\d.]+)\\)/);
        if (rgbaMatch) {
            const [, r, g, b, a] = rgbaMatch;
            const alpha = parseFloat(a);

            if (alpha === 1) {
                // 完全不透明，转换为rgb
                return `rgb(${r}, ${g}, ${b})`;
            }
            // 否则保持rgba，或者根据平台需求进一步处理
        }
    }

    return value;
}

/**
 * 检查字符串是否包含数值
 */
function hasNumericValue(value: string): boolean {
    return /\\d/.test(value);
}

/**
 * 适配单位值
 */
function adaptUnitValue(value: string, platform: TargetPlatform): string {
    const targetUnit = STYLE_UNITS[platform];

    if (!targetUnit) {
        // 移除单位（如React Native）
        return value.replace(/[a-zA-Z%]+$/, '');
    }

    // 提取数值和单位
    const match = value.match(/^([\\d.]+)([a-zA-Z%]*)$/);
    if (match) {
        const [, num, unit] = match;

        // 如果原单位是px，在小程序中转换为rpx
        if (unit === 'px' && (platform === 'weapp' || platform === 'alipay')) {
            return `${num}rpx`;
        }

        // 如果原单位是rpx，在H5中转换为px
        if (unit === 'rpx' && platform === 'h5') {
            return `${num}px`;
        }
    }

    return value;
}

/**
 * 生成平台特定的样式字符串
 */
export function generateStyleString(
    styles: Record<string, any>,
    platform: TargetPlatform,
    format: 'css' | 'object' = 'css'
): string {
    const adaptedStyles = adaptStyles(styles, platform);

    if (format === 'object') {
        return JSON.stringify(adaptedStyles, null, 2);
    }

    // 生成CSS字符串
    const cssRules = Object.entries(adaptedStyles)
        .map(([key, value]) => `  ${key}: ${value};`)
        .join('\\n');

    return `{\\n${cssRules}\\n}`;
}
