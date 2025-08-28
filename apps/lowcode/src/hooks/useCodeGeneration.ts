/**
 * 代码生成相关的React Hook
 */

import { PageModel } from '@/types';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { CodeGenerationConfig, TargetPlatform } from '../codegen/types';
import { codeGenService } from '../services/codeGenService';

interface UseCodeGenerationReturn {
    isGenerating: boolean;
    generatedCode: string | null;
    generatedStyles: string | null;
    generatePageCode: (page: PageModel, platform: TargetPlatform) => Promise<void>;
    generateAndDownload: (pages: PageModel[], platform: TargetPlatform, config: CodeGenerationConfig) => Promise<void>;
    previewCode: (page: PageModel, platform: TargetPlatform) => Promise<void>;
    validatePage: (page: PageModel, platform: TargetPlatform) => boolean;
    clearGenerated: () => void;
}

export function useCodeGeneration(): UseCodeGenerationReturn {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [generatedStyles, setGeneratedStyles] = useState<string | null>(null);

    /**
     * 生成单页面代码
     */
    const generatePageCode = useCallback(async (page: PageModel, platform: TargetPlatform) => {
        setIsGenerating(true);
        try {
            const { code, styles } = await codeGenService.generatePageCode(page, platform);
            setGeneratedCode(code);
            setGeneratedStyles(styles);
            toast.success(`${platform}平台代码生成成功！`);
        } catch (error) {
            console.error('Code generation failed:', error);
            toast.error(`代码生成失败: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    }, []);

    /**
     * 生成并下载项目代码
     */
    const generateAndDownload = useCallback(async (
        pages: PageModel[],
        platform: TargetPlatform,
        config: CodeGenerationConfig
    ) => {
        setIsGenerating(true);
        try {
            const blob = await codeGenService.generateAndDownload(pages, platform, config);

            // 创建下载链接
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${config.projectName}-${platform}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success('代码包下载成功！');
        } catch (error) {
            console.error('Download failed:', error);
            toast.error(`下载失败: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    }, []);

    /**
     * 预览代码
     */
    const previewCode = useCallback(async (page: PageModel, platform: TargetPlatform) => {
        setIsGenerating(true);
        try {
            const { jsx, styles } = await codeGenService.previewCode(page, platform);
            setGeneratedCode(jsx);
            setGeneratedStyles(styles);
        } catch (error: unknown) {
            console.error('Preview failed:', error);
            toast.error(`预览失败: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    }, []);

    /**
     * 验证页面配置
     */
    const validatePage = useCallback((page: PageModel, platform: TargetPlatform): boolean => {
        const errors = codeGenService.validatePageConfiguration(page, platform);

        if (errors.length > 0) {
            errors.forEach(error => toast.error(error));
            return false;
        }

        return true;
    }, []);

    /**
     * 清空生成的代码
     */
    const clearGenerated = useCallback(() => {
        setGeneratedCode(null);
        setGeneratedStyles(null);
    }, []);

    return {
        isGenerating,
        generatedCode,
        generatedStyles,
        generatePageCode,
        generateAndDownload,
        previewCode,
        validatePage,
        clearGenerated,
    };
}
