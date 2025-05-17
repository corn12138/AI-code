import * as bcryptjs from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Client } from 'pg';

// 加载环境变量
const envPath = process.env.NODE_ENV === 'production'
    ? path.resolve(process.cwd(), '.env.prod')
    : path.resolve(process.cwd(), '.env');

dotenv.config({ path: envPath });

async function seed() {
    console.log('开始填充种子数据...');

    const client = new Client({
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '6543', 10),
        user: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'postgres',
        database: process.env.DATABASE_NAME || 'blogdb',
        ssl: process.env.DATABASE_SSL === 'true' ? {
            rejectUnauthorized: false
        } : false,
    });

    try {
        // 连接到数据库
        console.log(`连接到数据库: ${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`);
        await client.connect();
        console.log('数据库连接成功');

        // 检查用户表是否存在
        const tableCheck = await client.query(`
      SELECT to_regclass('public.users') as exists;
    `);

        if (!tableCheck.rows[0].exists) {
            console.error('用户表不存在，请先运行数据库迁移');
            return;
        }

        // 检查管理员用户是否已存在
        const adminEmail = 'admin@example.com';
        const userCheck = await client.query(
            'SELECT * FROM users WHERE email = $1',
            [adminEmail]
        );

        if (userCheck.rows.length === 0) {
            // 创建管理员用户
            const hashedPassword = await bcryptjs.hash('Admin@123', 12);
            await client.query(`
        INSERT INTO users(email, username, "fullName", password, roles)
        VALUES($1, $2, $3, $4, $5)
      `, [
                adminEmail,
                'admin',
                '系统管理员',
                hashedPassword,
                JSON.stringify(['admin', 'user'])
            ]);
            console.log('已创建管理员用户');
        } else {
            console.log('管理员用户已存在，跳过创建');
        }

        // 创建默认分类
        const categories = [
            { name: '技术', description: '技术相关文章', slug: 'tech' },
            { name: '设计', description: '设计相关文章', slug: 'design' },
            { name: '产品', description: '产品相关文章', slug: 'product' },
            { name: '运营', description: '运营相关文章', slug: 'operation' }
        ];

        for (const category of categories) {
            const categoryCheck = await client.query(
                'SELECT * FROM categories WHERE name = $1',
                [category.name]
            );

            if (categoryCheck.rows.length === 0) {
                await client.query(`
          INSERT INTO categories(name, description, slug)
          VALUES($1, $2, $3)
        `, [
                    category.name,
                    category.description,
                    category.slug
                ]);
                console.log(`已创建分类: ${category.name}`);
            } else {
                console.log(`分类 ${category.name} 已存在，跳过创建`);
            }
        }

        // 创建默认标签
        const tags = [
            'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js',
            'NestJS', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS',
            'UI/UX', 'CSS', 'HTML', '产品设计', '用户体验', '低代码平台'
        ];

        for (const tagName of tags) {
            const tagCheck = await client.query(
                'SELECT * FROM tags WHERE name = $1',
                [tagName]
            );

            if (tagCheck.rows.length === 0) {
                await client.query(`
          INSERT INTO tags(name)
          VALUES($1)
        `, [tagName]);
                console.log(`已创建标签: ${tagName}`);
            } else {
                console.log(`标签 ${tagName} 已存在，跳过创建`);
            }
        }

        console.log('种子数据填充完成！');
    } catch (error) {
        console.error('填充种子数据时出错:', error);
        process.exit(1);
    } finally {
        // 关闭数据库连接
        await client.end();
        console.log('数据库连接已关闭');
    }
}

// 执行种子函数
seed();
