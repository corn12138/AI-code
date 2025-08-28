/**
 * 代码生成服务
 * 提供代码生成的高级API
 */

import { ComponentModel, PageModel } from '@/types';
import { generatePageAST } from '../codegen/astGenerator';
import {
    generateAppConfig,
    generateComponentCode,
    generatePackageJson,
    generateProjectConfig,
    generateTsConfig
} from '../codegen/templateGenerator';
import {
    CodeGenerationConfig,
    GeneratedCode,
    TargetPlatform
} from '../codegen/types';

export class CodeGenerationService {
    /**
     * 生成单个页面的代码
     */
    async generatePageCode(
        page: PageModel,
        platform: TargetPlatform,
        pageName: string = 'Index'
    ): Promise<{ code: string; styles: string }> {
        try {
            const { ast, context } = generatePageAST(page.components, platform);
            const code = generateComponentCode(ast, context, pageName);

            // 生成样式文件
            const styles = this.generatePageStyles(page.components);

            return { code, styles };
        } catch (error) {
            console.error('Code generation failed:', error);
            throw new Error(`Failed to generate code for platform ${platform}: ${error.message}`);
        }
    }

    /**
     * 生成完整项目代码
     */
    async generateProjectCode(
        pages: PageModel[],
        platform: TargetPlatform,
        config: CodeGenerationConfig
    ): Promise<GeneratedCode> {
        const generatedCode: GeneratedCode = {
            pages: {},
            components: {},
            styles: {},
            configs: {
                'app.config.ts': '',
                'project.config.json': '',
                'package.json': '',
                'tsconfig.json': '',
            },
        };

        try {
            // 生成页面代码
            for (const page of pages) {
                const pageName = this.sanitizePageName(page.name);
                const { code, styles } = await this.generatePageCode(page, platform, pageName);

                generatedCode.pages[`pages/${pageName}/index`] = {
                    code,
                    imports: [],
                    dependencies: [],
                };

                generatedCode.styles[`pages/${pageName}/index.scss`] = styles;
            }

            // 生成配置文件
            generatedCode.configs['app.config.ts'] = generateAppConfig(config);
            generatedCode.configs['package.json'] = generatePackageJson(config);
            generatedCode.configs['tsconfig.json'] = generateTsConfig();

            // 针对不同平台生成特定配置
            if (platform === 'weapp' || platform === 'alipay' || platform === 'tt' || platform === 'qq') {
                generatedCode.configs['project.config.json'] = generateProjectConfig(config);
            }

            return generatedCode;
        } catch (error) {
            console.error('Project generation failed:', error);
            throw new Error(`Failed to generate project for platform ${platform}: ${error.message}`);
        }
    }

    /**
     * 生成并下载代码包
     */
    async generateAndDownload(
        pages: PageModel[],
        platform: TargetPlatform,
        config: CodeGenerationConfig
    ): Promise<Blob> {
        const generatedCode = await this.generateProjectCode(pages, platform, config);
        return this.createCodeArchive(generatedCode, config.projectName);
    }

    /**
     * 预览生成的代码
     */
    async previewCode(
        page: PageModel,
        platform: TargetPlatform
    ): Promise<{ jsx: string; styles: string }> {
        const { code, styles } = await this.generatePageCode(page, platform, 'Preview');

        // 提取JSX部分用于预览
        const jsxMatch = code.match(/return \\((\\s*<[\\s\\S]*>\\s*)\\);/);
        const jsx = jsxMatch ? jsxMatch[1].trim() : '';

        return { jsx, styles };
    }

    /**
     * 验证页面配置
     */
    validatePageConfiguration(page: PageModel, platform: TargetPlatform): string[] {
        const errors: string[] = [];

        try {
            // 检查页面基本信息
            if (!page.name || page.name.trim() === '') {
                errors.push('页面名称不能为空');
            }

            if (!page.components) {
                errors.push('页面必须包含组件配置');
                return errors;
            }

            // 递归验证组件配置
            this.validateComponentConfiguration(page.components, platform, errors);

        } catch (error) {
            errors.push(`配置验证失败: ${error.message}`);
        }

        return errors;
    }

    /**
     * 递归验证组件配置
     */
    private validateComponentConfiguration(
        component: ComponentModel,
        platform: TargetPlatform,
        errors: string[]
    ): void {
        // 检查组件基本属性
        if (!component.id) {
            errors.push('组件ID不能为空');
        }

        if (!component.type) {
            errors.push('组件类型不能为空');
        }

        // 验证子组件
        if (component.children) {
            for (const child of component.children) {
                this.validateComponentConfiguration(child, platform, errors);
            }
        }
    }

    /**
     * 生成页面样式
     */
    private generatePageStyles(component: ComponentModel): string {
        const styles: string[] = [];

        // 为组件生成CSS类
        if (component.style && Object.keys(component.style).length > 0) {
            const className = `.${component.type.toLowerCase()}-${component.id}`;
            const cssProps = Object.entries(component.style)
                .map(([prop, value]) => `  ${this.kebabCase(prop)}: ${value};`)
                .join('\\n');

            styles.push(`${className} {\\n${cssProps}\\n}`);
        }

        // 递归处理子组件样式
        if (component.children) {
            for (const child of component.children) {
                styles.push(this.generatePageStyles(child));
            }
        }

        return styles.join('\\n\\n');
    }

    /**
     * 清理页面名称，确保符合文件命名规范
     */
    private sanitizePageName(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\\-_]/g, '')
            .replace(/^[0-9]/, 'page-$&'); // 确保不以数字开头
    }

    /**
     * 将驼峰命名转换为kebab-case
     */
    private kebabCase(str: string): string {
        return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }

    /**
     * 创建代码压缩包
     */
    private async createCodeArchive(code: GeneratedCode, projectName: string): Promise<Blob> {
        // 这里需要使用zip库，如JSZip
        // 示例实现，实际项目中需要安装并导入JSZip
        const files: Record<string, string> = {};

        // 添加页面文件
        for (const [path, pageCode] of Object.entries(code.pages)) {
            files[`${path}.tsx`] = pageCode.code;
        }

        // 添加样式文件
        for (const [path, styles] of Object.entries(code.styles)) {
            files[path] = styles;
        }

        // 添加配置文件
        for (const [filename, content] of Object.entries(code.configs)) {
            files[filename] = content;
        }

        // 模拟创建zip文件（实际实现需要JSZip）
        const fileContent = JSON.stringify(files, null, 2);
        return new Blob([fileContent], { type: 'application/json' });
    }
}

// 创建单例实例
export const codeGenService = new CodeGenerationService();
