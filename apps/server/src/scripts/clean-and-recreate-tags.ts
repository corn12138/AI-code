import * as dotenv from 'dotenv';
import * as path from 'path';
import { Client } from 'pg';

// 加载环境变量
const envPath = process.env.NODE_ENV === 'production'
    ? path.resolve(process.cwd(), '.env.prod')
    : path.resolve(process.cwd(), '.env');

dotenv.config({ path: envPath });

async function cleanAndRecreateTagsTable() {
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

        // 备份现有数据
        console.log('备份现有标签数据...');
        const existingTags = await client.query('SELECT * FROM tags ORDER BY id');
        console.log(`找到 ${existingTags.rows.length} 个现有标签`);

        // 删除相关约束和索引
        console.log('\n删除约束和索引...');
        try {
            await client.query('DROP INDEX IF EXISTS idx_tags_slug');
            await client.query('DROP INDEX IF EXISTS idx_tags_name');
            await client.query('ALTER TABLE tags DROP CONSTRAINT IF EXISTS tags_slug_unique');
            await client.query('ALTER TABLE tags DROP CONSTRAINT IF EXISTS tags_name_key');
        } catch (error) {
            console.warn('删除约束时出现警告，继续执行...');
        }

        // 删除表
        console.log('删除tags表...');
        await client.query('DROP TABLE IF EXISTS tags CASCADE');

        // 重新创建表
        console.log('重新创建tags表...');
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

        // 创建索引
        console.log('创建索引...');
        await client.query('CREATE INDEX idx_tags_slug ON tags(slug)');
        await client.query('CREATE INDEX idx_tags_name ON tags(name)');

        // 恢复数据（如果有）
        if (existingTags.rows.length > 0) {
            console.log('\n恢复标签数据...');

            for (const tag of existingTags.rows) {
                // 生成slug（如果没有）
                let slug = tag.slug;
                if (!slug && tag.name) {
                    slug = tag.name
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
                        .replace(/-+/g, '-')
                        .replace(/^-|-$/g, '');

                    if (!slug) {
                        slug = `tag-${tag.id?.substring(0, 8) || 'unknown'}`;
                    }
                }

                try {
                    await client.query(`
                        INSERT INTO tags (id, name, slug, description, color, "createdAt", "updatedAt")
                        VALUES ($1, $2, $3, $4, $5, COALESCE($6, NOW()), COALESCE($7, NOW()))
                        ON CONFLICT (name) DO NOTHING
                    `, [
                        tag.id || null,
                        tag.name,
                        slug,
                        tag.description || null,
                        tag.color || null,
                        tag.createdAt || null,
                        tag.updatedAt || null
                    ]);

                    console.log(`✅ 恢复标签: ${tag.name} (${slug})`);
                } catch (insertError) {
                    console.warn(`⚠️ 跳过重复标签: ${tag.name}`);
                }
            }
        }

        // 添加示例标签（如果表为空）
        const currentCount = await client.query('SELECT COUNT(*) FROM tags');
        if (parseInt(currentCount.rows[0].count as string, 10) === 0) {
            console.log('\n添加示例标签...');

            const sampleTags = [
                { name: 'JavaScript', slug: 'javascript', description: 'JavaScript 编程语言', color: '#f7df1e' },
                { name: 'React', slug: 'react', description: 'React 前端框架', color: '#61dafb' },
                { name: 'Node.js', slug: 'nodejs', description: 'Node.js 后端开发', color: '#339933' },
                { name: 'TypeScript', slug: 'typescript', description: 'TypeScript 类型安全', color: '#3178c6' },
                { name: 'NestJS', slug: 'nestjs', description: 'NestJS 企业级框架', color: '#e0234e' }
            ];

            for (const tag of sampleTags) {
                await client.query(`
                    INSERT INTO tags (name, slug, description, color)
                    VALUES ($1, $2, $3, $4)
                `, [tag.name, tag.slug, tag.description, tag.color]);

                console.log(`✅ 添加示例标签: ${tag.name}`);
            }
        }

        // 重新创建article_tags关联表（如果需要）
        console.log('\n检查article_tags关联表...');
        const articleTagsExists = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'article_tags'
            );
        `);

        if (!articleTagsExists.rows[0].exists) {
            console.log('创建article_tags关联表...');
            await client.query(`
                CREATE TABLE article_tags (
                    "articleId" UUID NOT NULL,
                    "tagId" UUID NOT NULL,
                    PRIMARY KEY ("articleId", "tagId"),
                    FOREIGN KEY ("tagId") REFERENCES tags(id) ON DELETE CASCADE
                );
            `);

            await client.query('CREATE INDEX idx_article_tags_articleId ON article_tags("articleId")');
            await client.query('CREATE INDEX idx_article_tags_tagId ON article_tags("tagId")');

            console.log('✅ article_tags关联表创建成功');
        }

        // 显示最终结果
        console.log('\n=== 最终标签列表 ===');
        const finalTags = await client.query('SELECT id, name, slug, description, color FROM tags ORDER BY name');
        finalTags.rows.forEach(tag => {
            console.log(`- ${tag.name} (${tag.slug}) [${tag.color || 'N/A'}]`);
        });

        console.log('\n✅ tags表重建完成！');

    } catch (error) {
        console.error('重建tags表失败:', error);
    } finally {
        await client.end();
    }
}

cleanAndRecreateTagsTable();
