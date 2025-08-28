/**
 * 代码生成器相关类型定义
 */


// 支持的目标平台
export type TargetPlatform = 'weapp' | 'alipay' | 'h5' | 'rn' | 'tt' | 'qq';

// 组件平台映射配置
export interface ComponentPlatformMapping {
    // 组件类型
    type: string;
    // 各平台的组件映射
    platforms: {
        [K in TargetPlatform]: {
            component: string;        // 组件名称
            importPath: string;       // 导入路径
            props?: PropMapping[];    // 属性映射
            styles?: StyleMapping[];  // 样式映射
        };
    };
}

// 属性映射配置
export interface PropMapping {
    source: string;      // 原属性名
    target: string;      // 目标属性名
    transform?: (value: any) => any; // 值转换函数
}

// 样式映射配置  
export interface StyleMapping {
    source: string;      // 原样式属性
    target: string;      // 目标样式属性
    transform?: (value: any) => any; // 值转换函数
    platforms?: TargetPlatform[]; // 适用平台
}

// 代码生成配置
export interface CodeGenerationConfig {
    targetPlatform: TargetPlatform;
    outputDir: string;
    projectName: string;
    version: string;
    author?: string;
    description?: string;
}

// 生成的代码结构
export interface GeneratedCode {
    // 页面组件代码
    pages: {
        [path: string]: {
            code: string;
            imports: string[];
            dependencies: string[];
        };
    };
    // 组件代码
    components: {
        [name: string]: {
            code: string;
            imports: string[];
        };
    };
    // 样式文件
    styles: {
        [path: string]: string;
    };
    // 配置文件
    configs: {
        'app.config.ts': string;
        'project.config.json': string;
        'package.json': string;
        'tsconfig.json': string;
    };
    // 路由配置
    routes?: {
        [path: string]: {
            component: string;
            exact?: boolean;
        };
    };
}

// AST节点类型
export interface ASTNode {
    type: 'component' | 'text' | 'element';
    tagName: string;
    props: Record<string, any>;
    children: ASTNode[];
    styles: Record<string, any>;
}

// 代码生成上下文
export interface GenerationContext {
    platform: TargetPlatform;
    componentMappings: ComponentPlatformMapping[];
    globalStyles: Record<string, any>;
    // key: 模块路径，如 '@tarojs/components'；value: 需要从该模块具名导入的组件集合
    imports: Record<string, Set<string>>;
    dependencies: Set<string>;
}
