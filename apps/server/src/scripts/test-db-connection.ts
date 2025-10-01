#!/usr/bin/env ts-node

import { DataSource } from 'typeorm';
import { DATABASE_DEFAULTS } from '../config/database-defaults';

// 数据库配置
const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || DATABASE_DEFAULTS.HOST,
    port: parseInt(process.env.DATABASE_PORT || DATABASE_DEFAULTS.PORT.toString(), 10),
    username: process.env.DATABASE_USER || DATABASE_DEFAULTS.USER,
    password: process.env.DATABASE_PASSWORD || DATABASE_DEFAULTS.PASSWORD,
    database: process.env.DATABASE_NAME || DATABASE_DEFAULTS.NAME,
    synchronize: false,
    logging: true,
});

async function testConnection() {
    console.log('🔍 测试数据库连接...');
    console.log('配置信息:');
    console.log(`  Host: ${process.env.DATABASE_HOST || DATABASE_DEFAULTS.HOST}`);
    console.log(`  Port: ${process.env.DATABASE_PORT || DATABASE_DEFAULTS.PORT}`);
    console.log(`  Username: ${process.env.DATABASE_USER || DATABASE_DEFAULTS.USER}`);
    console.log(`  Database: ${process.env.DATABASE_NAME || DATABASE_DEFAULTS.NAME}`);

    try {
        await dataSource.initialize();
        console.log('✅ 数据库连接成功!');

        // 测试查询
        const result = await dataSource.query('SELECT NOW() as current_time');
        console.log('📅 当前时间:', result[0].current_time);

        // 检查表是否存在
        const tables = await dataSource.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'mobile_docs'
        `);

        if (tables.length > 0) {
            console.log('✅ mobile_docs 表已存在');

            // 检查表中的数据
            const count = await dataSource.query('SELECT COUNT(*) as count FROM mobile_docs');
            console.log(`📊 mobile_docs 表中有 ${count[0].count} 条记录`);
        } else {
            console.log('⚠️  mobile_docs 表不存在，需要运行迁移');
        }

    } catch (error: any) {
        console.error('❌ 数据库连接失败:', error);

        if (error.code === '28P01') {
            console.log('\n💡 可能的解决方案:');
            console.log('1. 检查数据库用户名和密码是否正确');
            console.log('2. 确保数据库用户有访问权限');
            console.log('3. 检查数据库是否正在运行');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 可能的解决方案:');
            console.log('1. 检查数据库服务是否启动');
            console.log('2. 检查主机和端口配置是否正确');
            console.log('3. 检查防火墙设置');
        }

        throw error;
    } finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
            console.log('🔌 数据库连接已关闭');
        }
    }
}

// 执行测试
if (require.main === module) {
    testConnection().catch(error => {
        console.error('测试失败:', error.message);
        process.exit(1);
    });
}

export { testConnection };
