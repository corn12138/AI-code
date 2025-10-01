#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { DATABASE_DEFAULTS } from '../config/database-defaults';
import { CreateMobileDocsTable1704067200000 } from '../database/migrations/1704067200000-CreateMobileDocsTable';
import { DocCategory, MobileDoc } from '../mobile/entities/mobile-doc.entity';

// 数据库配置
const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || DATABASE_DEFAULTS.HOST,
    port: parseInt(process.env.DATABASE_PORT || DATABASE_DEFAULTS.PORT.toString(), 10),
    username: process.env.DATABASE_USER || DATABASE_DEFAULTS.USER,
    password: process.env.DATABASE_PASSWORD || DATABASE_DEFAULTS.PASSWORD,
    database: process.env.DATABASE_NAME || DATABASE_DEFAULTS.NAME,
    entities: [MobileDoc],
    migrations: [CreateMobileDocsTable1704067200000],
    synchronize: false,
    logging: true,
});

// 文档文件映射配置
const DOC_FILES = [
    {
        fileName: 'README.md',
        filePath: 'docs/README.md',
        title: '移动端技术文章阅读平台 - 文档中心',
        category: DocCategory.LATEST,
        tags: ['文档中心', '导航', '概览'],
        isHot: true,
        sortOrder: 100,
    },
    {
        fileName: 'SSR_IMPLEMENTATION_GUIDE.md',
        filePath: 'docs/SSR_IMPLEMENTATION_GUIDE.md',
        title: 'SSR实现指南 - 从零开始构建服务端渲染',
        category: DocCategory.FRONTEND,
        tags: ['SSR', '服务端渲染', 'React', '实现指南'],
        isHot: true,
        sortOrder: 90,
    },
    {
        fileName: 'SSR_VS_NEXTJS_COMPARISON.md',
        filePath: 'docs/SSR_VS_NEXTJS_COMPARISON.md',
        title: 'SSR vs Next.js 全面对比分析',
        category: DocCategory.FRONTEND,
        tags: ['SSR', 'Next.js', '技术选型', '对比分析'],
        isHot: true,
        sortOrder: 85,
    },
    {
        fileName: 'SSR_ARCHITECTURE_DEEP_DIVE.md',
        filePath: 'docs/SSR_ARCHITECTURE_DEEP_DIVE.md',
        title: 'SSR架构深度解析 - 核心原理与实现',
        category: DocCategory.BACKEND,
        tags: ['SSR', '架构设计', '深度解析', 'Node.js'],
        isHot: true,
        sortOrder: 80,
    },
    {
        fileName: 'SSR_PERFORMANCE_OPTIMIZATION.md',
        filePath: 'docs/SSR_PERFORMANCE_OPTIMIZATION.md',
        title: 'SSR性能优化指南 - 全面提升渲染性能',
        category: DocCategory.FRONTEND,
        tags: ['SSR', '性能优化', '缓存策略', 'Web Vitals'],
        isHot: true,
        sortOrder: 75,
    },
    {
        fileName: 'DOCUMENTATION_INDEX.md',
        filePath: 'docs/DOCUMENTATION_INDEX.md',
        title: '文档索引 - 快速查找和学习路径',
        category: DocCategory.LATEST,
        tags: ['文档索引', '学习路径', '快速查找'],
        isHot: false,
        sortOrder: 70,
    },
];

/**
 * 读取Markdown文件内容
 */
function readMarkdownFile(filePath: string): string {
    const fullPath = path.resolve(__dirname, '../../../mobile', filePath);

    if (!fs.existsSync(fullPath)) {
        console.warn(`文件不存在: ${fullPath}`);
        return '';
    }

    return fs.readFileSync(fullPath, 'utf-8');
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
 * 运行数据库迁移
 */
async function runMigrations() {
    console.log('🔄 运行数据库迁移...');

    try {
        await dataSource.runMigrations();
        console.log('✅ 数据库迁移完成');
    } catch (error) {
        console.error('❌ 数据库迁移失败:', error);
        throw error;
    }
}

/**
 * 种子移动端文档数据
 */
async function seedMobileDocs() {
    console.log('🌱 开始种子移动端文档数据...');

    try {
        const mobileDocRepository = dataSource.getRepository(MobileDoc);

        // 清空现有数据
        console.log('🗑️  清空现有文档数据...');
        await mobileDocRepository.clear();

        // 创建文档数据
        const docDataList: Partial<MobileDoc>[] = [];

        for (const docFile of DOC_FILES) {
            console.log(`📖 处理文档: ${docFile.fileName}`);
            const content = readMarkdownFile(docFile.filePath);

            if (!content) {
                console.warn(`跳过空文件: ${docFile.filePath}`);
                continue;
            }

            const summary = extractSummary(content);
            const readTime = calculateReadTime(content);
            // const slug = generateSlug(docFile.title);

            const docData: Partial<MobileDoc> = {
                title: docFile.title,
                // slug,
                summary,
                content,
                category: docFile.category,
                author: 'AI-Code Team',
                readTime,
                tags: docFile.tags,
                imageUrl: undefined,
                isHot: docFile.isHot,
                published: true,
                sortOrder: docFile.sortOrder,
                filePath: docFile.filePath,
            };

            docDataList.push(docData);
            console.log(`✅ 文档数据创建成功: ${docData.title}`);
        }

        // 批量插入数据
        if (docDataList.length > 0) {
            console.log(`💾 批量插入 ${docDataList.length} 个文档...`);
            const savedDocs = await mobileDocRepository.save(docDataList);
            console.log(`✅ 成功插入 ${savedDocs.length} 个文档`);

            // 显示插入的文档信息
            savedDocs.forEach((doc, index) => {
                console.log(`   ${index + 1}. ${doc.title} (${doc.category}) - ${doc.readTime}分钟阅读`);
            });
        } else {
            console.log('⚠️  没有找到有效的文档数据');
        }

        // 显示统计信息
        const stats = await mobileDocRepository
            .createQueryBuilder('doc')
            .select('doc.category', 'category')
            .addSelect('COUNT(*)', 'count')
            .groupBy('doc.category')
            .getRawMany();

        console.log('\n📊 文档分类统计:');
        stats.forEach(stat => {
            console.log(`   ${stat.category}: ${stat.count} 个文档`);
        });

        console.log('\n🎉 移动端文档数据种子完成!');

    } catch (error) {
        console.error('❌ 种子数据失败:', error);
        throw error;
    }
}

/**
 * 主执行函数
 */
async function main() {
    console.log('🚀 开始数据库迁移和种子数据...');

    try {
        // 初始化数据源
        if (!dataSource.isInitialized) {
            await dataSource.initialize();
            console.log('✅ 数据库连接成功');
        }

        // 运行迁移
        await runMigrations();

        // 种子数据
        await seedMobileDocs();

        console.log('\n🎉 所有操作完成!');

    } catch (error) {
        console.error('❌ 操作失败:', error);
        process.exit(1);
    } finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
            console.log('🔌 数据库连接已关闭');
        }
    }
}

// 执行主函数
if (require.main === module) {
    main().catch(error => {
        console.error('执行失败:', error);
        process.exit(1);
    });
}

export { main };
