#!/usr/bin/env ts-node

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { MobileService } from '../mobile/mobile.service';
import { DocCategory } from '../mobile/entities/mobile-doc.entity';

async function testMobileAPI() {
    console.log('🧪 测试移动端API接口...');

    try {
        // 创建NestJS应用实例
        const app = await NestFactory.createApplicationContext(AppModule);
        const mobileService = app.get(MobileService);

        console.log('✅ NestJS应用初始化成功');

        // 测试获取所有文档
        console.log('\n📚 测试获取所有文档:');
        const allDocs = await mobileService.findAll({});
        console.log(`找到 ${allDocs.items.length} 个文档`);
        
        allDocs.items.forEach((doc, index) => {
            console.log(`${index + 1}. ${doc.title} (${doc.category})`);
        });

        // 测试按分类获取文档
        console.log('\n🏷️ 测试获取frontend分类文档:');
        const frontendDocs = await mobileService.findAll({ category: DocCategory.FRONTEND });
        console.log(`找到 ${frontendDocs.items.length} 个frontend文档`);
        
        frontendDocs.items.forEach((doc, index) => {
            console.log(`${index + 1}. ${doc.title}`);
        });

        // 测试获取单个文档
        if (allDocs.items.length > 0) {
            const firstDocId = allDocs.items[0].id;
            console.log(`\n📄 测试获取单个文档 (ID: ${firstDocId}):`);
            const singleDoc = await mobileService.findOne(firstDocId);
            console.log(`标题: ${singleDoc.title}`);
            console.log(`分类: ${singleDoc.category}`);
            console.log(`内容长度: ${singleDoc.content.length} 字符`);
        }

        // 测试获取热门文档
        console.log('\n🔥 测试获取热门文档:');
        const hotDocs = await mobileService.getHotDocs();
        console.log(`找到 ${hotDocs.length} 个热门文档`);

        hotDocs.forEach((doc, index) => {
            console.log(`${index + 1}. ${doc.title} (${doc.category})`);
        });

        // 测试分类统计
        console.log('\n📊 测试分类统计:');
        const stats = await mobileService.getStatsByCategory();
        if (Array.isArray(stats)) {
            stats.forEach((stat: any) => {
                console.log(`${stat.category}: ${stat.count} 个文档`);
            });
        }

        await app.close();
        console.log('\n✅ API测试完成!');

    } catch (error) {
        console.error('❌ API测试失败:', error);
        throw error;
    }
}

// 执行测试
if (require.main === module) {
    testMobileAPI().catch(error => {
        console.error('执行失败:', error.message);
        process.exit(1);
    });
}

export { testMobileAPI };
