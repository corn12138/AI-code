import * as fs from 'fs';
import * as path from 'path';
import { Article, ArticleCategory } from '../types';

// 文档文件映射配置
const DOC_FILES = [
    {
        fileName: 'README.md',
        filePath: 'docs/README.md',
        title: '移动端技术文章阅读平台 - 文档中心',
        category: 'latest' as ArticleCategory,
        tags: ['文档中心', '导航', '概览'],
        isHot: true,
        sortOrder: 100,
    },
    {
        fileName: 'SSR_IMPLEMENTATION_GUIDE.md',
        filePath: 'docs/SSR_IMPLEMENTATION_GUIDE.md',
        title: 'SSR实现指南 - 从零开始构建服务端渲染',
        category: 'frontend' as ArticleCategory,
        tags: ['SSR', '服务端渲染', 'React', '实现指南'],
        isHot: true,
        sortOrder: 90,
    },
    {
        fileName: 'SSR_VS_NEXTJS_COMPARISON.md',
        filePath: 'docs/SSR_VS_NEXTJS_COMPARISON.md',
        title: 'SSR vs Next.js 全面对比分析',
        category: 'frontend' as ArticleCategory,
        tags: ['SSR', 'Next.js', '技术选型', '对比分析'],
        isHot: true,
        sortOrder: 85,
    },
    {
        fileName: 'SSR_ARCHITECTURE_DEEP_DIVE.md',
        filePath: 'docs/SSR_ARCHITECTURE_DEEP_DIVE.md',
        title: 'SSR架构深度解析 - 核心原理与实现',
        category: 'backend' as ArticleCategory,
        tags: ['SSR', '架构设计', '深度解析', 'Node.js'],
        isHot: true,
        sortOrder: 80,
    },
    {
        fileName: 'SSR_PERFORMANCE_OPTIMIZATION.md',
        filePath: 'docs/SSR_PERFORMANCE_OPTIMIZATION.md',
        title: 'SSR性能优化指南 - 全面提升渲染性能',
        category: 'frontend' as ArticleCategory,
        tags: ['SSR', '性能优化', '缓存策略', 'Web Vitals'],
        isHot: true,
        sortOrder: 75,
    },
    {
        fileName: 'DOCUMENTATION_INDEX.md',
        filePath: 'docs/DOCUMENTATION_INDEX.md',
        title: '文档索引 - 快速查找和学习路径',
        category: 'latest' as ArticleCategory,
        tags: ['文档索引', '学习路径', '快速查找'],
        isHot: false,
        sortOrder: 70,
    },
];

/**
 * 读取Markdown文件内容
 */
function readMarkdownFile(filePath: string): string {
    try {
        const fullPath = path.resolve(__dirname, '../../', filePath);
        if (fs.existsSync(fullPath)) {
            return fs.readFileSync(fullPath, 'utf-8');
        }
    } catch (error) {
        console.warn(`无法读取文件: ${filePath}`, error);
    }
    return '';
}

/**
 * 从Markdown内容中提取摘要
 */
function extractSummary(content: string): string {
    // 移除标题和代码块
    const cleanContent = content
        .replace(/^#{1,6}\s+.*$/gm, '') // 移除标题
        .replace(/```[\s\S]*?```/g, '') // 移除代码块
        .replace(/`[^`]*`/g, '') // 移除行内代码
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 移除链接，保留文本
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, '') // 移除图片
        .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体标记
        .replace(/\*(.*?)\*/g, '$1') // 移除斜体标记
        .replace(/\n+/g, ' ') // 替换换行为空格
        .trim();

    // 找到第一个有意义的段落
    const paragraphs = cleanContent.split(/\s{2,}/).filter(p => p.length > 50);
    const summary = paragraphs[0] || cleanContent.substring(0, 200);

    return summary.length > 300 ? summary.substring(0, 300) + '...' : summary;
}

/**
 * 计算阅读时间（分钟）
 */
function calculateReadTime(content: string): number {
    const wordsPerMinute = 200; // 中文阅读速度约200字/分钟
    const wordCount = content.length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return Math.max(1, readTime);
}

/**
 * 生成基于真实文档的模拟数据
 */
function generateRealDocsData(): Article[] {
    const articles: Article[] = [];

    DOC_FILES.forEach((docFile, index) => {
        const content = readMarkdownFile(docFile.filePath);

        // 如果无法读取文件，使用默认内容
        const finalContent = content || `# ${docFile.title}\n\n这是关于${docFile.title}的详细文档内容。\n\n## 概述\n\n本文档提供了相关技术的详细说明和最佳实践。`;

        const summary = extractSummary(finalContent);
        const readTime = calculateReadTime(finalContent);

        articles.push({
            id: `doc-${index + 1}`,
            title: docFile.title,
            summary: summary || `这是一篇关于${docFile.title}的技术文档，包含了详细的实现指南和最佳实践。`,
            content: finalContent,
            category: docFile.category,
            author: 'AI-Code Team',
            publishDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            readTime,
            tags: docFile.tags,
            imageUrl: `https://picsum.photos/400/240?random=${docFile.category}-${index}`,
            isHot: docFile.isHot,
        });
    });

    return articles;
}

// 生成真实文档数据
export const REAL_DOCS_DATA = generateRealDocsData();

// 按分类分组的数据
export const DOCS_BY_CATEGORY = {
    latest: REAL_DOCS_DATA.filter(doc => doc.category === 'latest'),
    frontend: REAL_DOCS_DATA.filter(doc => doc.category === 'frontend'),
    backend: REAL_DOCS_DATA.filter(doc => doc.category === 'backend'),
    ai: REAL_DOCS_DATA.filter(doc => doc.category === 'ai'),
    mobile: REAL_DOCS_DATA.filter(doc => doc.category === 'mobile'),
    design: REAL_DOCS_DATA.filter(doc => doc.category === 'design'),
};

// 热门文档
export const HOT_DOCS = REAL_DOCS_DATA.filter(doc => doc.isHot);

// 最新文档（按发布时间排序）
export const LATEST_DOCS = [...REAL_DOCS_DATA].sort((a, b) =>
    new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
);
