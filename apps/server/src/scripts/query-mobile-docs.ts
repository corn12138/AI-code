#!/usr/bin/env ts-node

import { DataSource } from 'typeorm';
import { DATABASE_DEFAULTS } from '../config/database-defaults';
import { MobileDoc } from '../mobile/entities/mobile-doc.entity';

// 数据库配置
const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || DATABASE_DEFAULTS.HOST,
    port: parseInt(process.env.DATABASE_PORT || DATABASE_DEFAULTS.PORT.toString(), 10),
    username: process.env.DATABASE_USER || DATABASE_DEFAULTS.USER,
    password: process.env.DATABASE_PASSWORD || DATABASE_DEFAULTS.PASSWORD,
    database: process.env.DATABASE_NAME || DATABASE_DEFAULTS.NAME,
    entities: [MobileDoc],
    synchronize: false,
    logging: false,
});

async function queryMobileDocs() {
    console.log('📚 查询数据库中的移动端文档...');

    try {
        // 初始化数据源
        if (!dataSource.isInitialized) {
            await dataSource.initialize();
            console.log('✅ 数据库连接成功');
        }

        const mobileDocRepository = dataSource.getRepository(MobileDoc);

        // 查询所有文档
        const docs = await mobileDocRepository.find({
            order: {
                sortOrder: 'DESC',
                createdAt: 'DESC',
            },
        });

        console.log(`\n📊 找到 ${docs.length} 个文档:\n`);

        docs.forEach((doc, index) => {
            console.log(`${index + 1}. 📄 ${doc.title}`);
            console.log(`   📂 分类: ${doc.category}`);
            console.log(`   👤 作者: ${doc.author}`);
            console.log(`   ⏱️  阅读时间: ${doc.readTime}分钟`);
            console.log(`   🏷️  标签: ${doc.tags.join(', ')}`);
            console.log(`   🔥 热门: ${doc.isHot ? '是' : '否'}`);
            console.log(`   📝 摘要: ${doc.summary?.substring(0, 100)}...`);
            console.log(`   📅 创建时间: ${doc.createdAt.toLocaleString()}`);
            console.log('');
        });

        // 按分类统计
        const categoryStats = await mobileDocRepository
            .createQueryBuilder('doc')
            .select('doc.category', 'category')
            .addSelect('COUNT(*)', 'count')
            .groupBy('doc.category')
            .getRawMany();

        console.log('📈 分类统计:');
        categoryStats.forEach(stat => {
            console.log(`   ${stat.category}: ${stat.count} 个文档`);
        });

        // 查询特定文档的完整内容
        const firstDoc = docs[0];
        if (firstDoc) {
            console.log(`\n📖 第一个文档的内容预览:`);
            console.log(`标题: ${firstDoc.title}`);
            console.log(`内容长度: ${firstDoc.content.length} 字符`);
            console.log(`内容开头: ${firstDoc.content.substring(0, 200)}...`);
        }

    } catch (error) {
        console.error('❌ 查询失败:', error);
        throw error;
    } finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
            console.log('\n🔌 数据库连接已关闭');
        }
    }
}

// 执行查询
if (require.main === module) {
    queryMobileDocs().catch(error => {
        console.error('执行失败:', error.message);
        process.exit(1);
    });
}

export { queryMobileDocs };
