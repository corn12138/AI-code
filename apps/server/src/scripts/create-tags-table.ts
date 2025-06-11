import * as dotenv from 'dotenv';
import * as path from 'path';
import { Client } from 'pg';

// 加载环境变量
const envPath = process.env.NODE_ENV === 'production'
    ? path.resolve(process.cwd(), '.env.prod')
    : path.resolve(process.cwd(), '.env');

dotenv.config({ path: envPath });

async function createTagsTable() {
    const client = new Client({
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '6543', 10),
        user: process.env.DATABASE_USER || 'app_user',
        password: process.env.DATABASE_PASSWORD || 'postgres',
        database: process.env.DATABASE_NAME || 'blogdb',
        ssl: process.env.DATABASE_SSL === 'true' ? {
            rejectUnauthorized: false
        } : false,
    });

    try {
        await client.connect();
        console.log('数据库连接成功');

        // 检查 tags 表是否存在
        const tableExists = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'tags'
            );
        `);

        if (tableExists.rows[0].exists) {
            console.log('tags 表已存在');
        } else {
            console.log('创建 tags 表...');

            // 创建 tags 表
            await client.query(`
                CREATE TABLE tags (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(100) NOT NULL UNIQUE,
                    slug VARCHAR(100) NOT NULL UNIQUE,
                    description TEXT,
                    color VARCHAR(7),
                    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `);

            console.log('✅ tags 表创建成功');
        }

        // 检查 article_tags 关联表是否存在
        const articleTagsExists = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'article_tags'
            );
        `);

        if (articleTagsExists.rows[0].exists) {
            console.log('article_tags 关联表已存在');
        } else {
            console.log('创建 article_tags 关联表...');

            // 创建 article_tags 关联表
            await client.query(`
                CREATE TABLE article_tags (
                    "articleId" UUID NOT NULL,
                    "tagId" UUID NOT NULL,
                    PRIMARY KEY ("articleId", "tagId")
                );
            `);

            // 添加外键约束（如果 articles 表存在）
            const articlesExists = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' AND table_name = 'articles'
                );
            `);

            if (articlesExists.rows[0].exists) {
                await client.query(`
                    ALTER TABLE article_tags 
                    ADD CONSTRAINT "FK_article_tags_articleId" 
                    FOREIGN KEY ("articleId") REFERENCES articles(id) ON DELETE CASCADE;
                `);

                await client.query(`
                    ALTER TABLE article_tags 
                    ADD CONSTRAINT "FK_article_tags_tagId" 
                    FOREIGN KEY ("tagId") REFERENCES tags(id) ON DELETE CASCADE;
                `);

                console.log('✅ article_tags 外键约束添加成功');
            }

            console.log('✅ article_tags 关联表创建成功');
        }

        // 创建索引
        console.log('创建索引...');

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_article_tags_articleId ON article_tags("articleId");
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_article_tags_tagId ON article_tags("tagId");
        `);

        console.log('✅ 索引创建成功');

        console.log('\n数据库表结构准备完成！');

    } catch (error) {
        console.error('创建标签表失败:', error);
    } finally {
        await client.end();
    }
}

createTagsTable();
