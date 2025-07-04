import { defineConfig } from 'dumi';

export default defineConfig({
    title: 'AI-Code Hooks',
    description: '项目通用Hooks库',
    themeConfig: {
        name: 'ai-code-hooks',
        github: 'https://github.com/yourusername/AI-code',
    },
    outputPath: 'docs-dist',
    exportStatic: {},
    styles: [`body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }`],
}); 