import * as dotenv from 'dotenv';
import * as path from 'path';
import { Client } from 'pg';
import { DATABASE_DEFAULTS } from '../config/database-defaults';

// 加载环境变量
const envPath = process.env.NODE_ENV === 'production'
    ? path.resolve(process.cwd(), '.env.prod')
    : path.resolve(process.cwd(), '.env');

dotenv.config({ path: envPath });

async function checkDatabaseData() {
    const client = new Client({
        host: process.env.DATABASE_HOST || DATABASE_DEFAULTS.HOST,
        port: parseInt(process.env.DATABASE_PORT || DATABASE_DEFAULTS.PORT.toString(), 10),
        user: process.env.DATABASE_USER || DATABASE_DEFAULTS.USER,
        password: process.env.DATABASE_PASSWORD || DATABASE_DEFAULTS.PASSWORD,
        database: process.env.DATABASE_NAME || DATABASE_DEFAULTS.NAME,
        ssl: process.env.DATABASE_SSL === 'true' ? {
            rejectUnauthorized: false
        } : false,
    });

    try {
        console.log(`连接到数据库: ${process.env.DATABASE_HOST || DATABASE_DEFAULTS.HOST}:${process.env.DATABASE_PORT || DATABASE_DEFAULTS.PORT}/${process.env.DATABASE_NAME || DATABASE_DEFAULTS.NAME}`);
        await client.connect();
        console.log('数据库连接成功');

        // 检查数据表是否存在
        console.log('\n检查数据表:');
        const tables = ['users', 'categories', 'tags', 'articles', 'comments', 'lowcode_pages', 'article_tags'];
        for (const table of tables) {
            const tableCheck = await client.query(`
        SELECT to_regclass('public.${table}') as exists;
      `);
            console.log(`- 表 ${table}: ${tableCheck.rows[0].exists ? '存在' : '不存在'}`);
        }

        // 检查种子数据
        console.log('\n检查种子数据:');

        // 用户数据
        const userCount = await client.query('SELECT COUNT(*) FROM users');
        console.log(`- 用户数量: ${userCount.rows[0].count}`);
        if (parseInt(userCount.rows[0].count as string, 10) > 0) {
            const adminUser = await client.query("SELECT * FROM users WHERE email = 'admin@example.com'");
            console.log(`- 管理员用户: ${adminUser.rows.length > 0 ? '存在' : '不存在'}`);
        }

        // 分类数据
        const categoryCount = await client.query('SELECT COUNT(*) FROM categories');
        console.log(`- 分类数量: ${categoryCount.rows[0].count}`);
        if (parseInt(categoryCount.rows[0].count as string, 10) > 0) {
            const categories = await client.query('SELECT name FROM categories');
            console.log(`- 分类列表: ${categories.rows.map(c => c.name).join(', ')}`);
        }

        // 标签数据
        const tagCount = await client.query('SELECT COUNT(*) FROM tags');
        console.log(`- 标签数量: ${tagCount.rows[0].count}`);
        if (parseInt(tagCount.rows[0].count as string, 10) > 0) {
            const sampleTags = await client.query('SELECT name FROM tags LIMIT 5');
            console.log(`- 部分标签: ${sampleTags.rows.map(t => t.name).join(', ')}${parseInt(tagCount.rows[0].count as string, 10) > 5 ? '...' : ''}`);
        }

        console.log('\n数据检查完成');
    } catch (error) {
        console.error('数据检查失败:', error);
    } finally {
        await client.end();
        console.log('数据库连接已关闭');
    }
}

checkDatabaseData();
