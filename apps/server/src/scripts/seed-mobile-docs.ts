import * as fs from 'fs';
import * as path from 'path';
import dataSource from '../database/migrations/config';
import { DocCategory, MobileDoc } from '../mobile/entities/mobile-doc.entity';

interface DocFile {
    fileName: string;
    filePath: string;
    title: string;
    category: DocCategory;
    tags: string[];
    isHot: boolean;
    sortOrder: number;
}

// 文档文件映射配置
const DOC_FILES: DocFile[] = [
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
 * 计算阅读时间（基于字数）
 */
function calculateReadTime(content: string): number {
    const wordsPerMinute = 200; // 中文阅读速度约200字/分钟
    const wordCount = content.length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return Math.max(1, readTime);
}

/**
 * 创建文档数据
 */
function createDocData(docFile: DocFile): Partial<MobileDoc> | null {
    const content = readMarkdownFile(docFile.filePath);

    if (!content) {
        console.warn(`跳过空文件: ${docFile.filePath}`);
        return null;
    }

    const summary = extractSummary(content);
    const readTime = calculateReadTime(content);

    return {
        title: docFile.title,
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
        docType: 'markdown',
        filePath: docFile.filePath,
    };
}

/**
 * 种子数据主函数
 */
async function seedMobileDocs() {
    console.log('🌱 开始种子移动端文档数据...');

    try {
        // 初始化数据源
        if (!dataSource.isInitialized) {
            await dataSource.initialize();
            console.log('✅ 数据库连接成功');
        }

        const mobileDocRepository = dataSource.getRepository(MobileDoc);

        // 清空现有数据
        console.log('🗑️  清空现有文档数据...');
        await mobileDocRepository.clear();

        // 创建文档数据
        const docDataList: Partial<MobileDoc>[] = [];

        for (const docFile of DOC_FILES) {
            console.log(`📖 处理文档: ${docFile.fileName}`);
            const docData = createDocData(docFile);

            if (docData) {
                docDataList.push(docData);
                console.log(`✅ 文档数据创建成功: ${docData.title}`);
            }
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
    } finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
            console.log('🔌 数据库连接已关闭');
        }
    }
}

/**
 * 验证文档数据
 */
async function verifyDocs() {
    console.log('\n🔍 验证文档数据...');

    try {
        if (!dataSource.isInitialized) {
            await dataSource.initialize();
        }

        const mobileDocRepository = dataSource.getRepository(MobileDoc);

        const totalCount = await mobileDocRepository.count();
        const publishedCount = await mobileDocRepository.count({ where: { published: true } });
        const hotCount = await mobileDocRepository.count({ where: { isHot: true } });

        console.log(`📈 总文档数: ${totalCount}`);
        console.log(`📈 已发布文档数: ${publishedCount}`);
        console.log(`🔥 热门文档数: ${hotCount}`);

        // 检查每个分类的文档数量
        for (const category of Object.values(DocCategory)) {
            const count = await mobileDocRepository.count({ where: { category } });
            console.log(`📂 ${category}: ${count} 个文档`);
        }

    } catch (error) {
        console.error('❌ 验证失败:', error);
    } finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
    }
}

// 主执行函数
async function main() {
    const command = process.argv[2];

    switch (command) {
        case 'seed':
            await seedMobileDocs();
            break;
        case 'verify':
            await verifyDocs();
            break;
        case 'reseed':
            await seedMobileDocs();
            await verifyDocs();
            break;
        default:
            console.log('使用方法:');
            console.log('  npm run seed:mobile-docs seed    - 种子文档数据');
            console.log('  npm run seed:mobile-docs verify  - 验证文档数据');
            console.log('  npm run seed:mobile-docs reseed  - 重新种子并验证');
            break;
    }
}

// 执行主函数
if (require.main === module) {
    main().catch(error => {
        console.error('执行失败:', error);
        process.exit(1);
    });
}

export { seedMobileDocs, verifyDocs };
