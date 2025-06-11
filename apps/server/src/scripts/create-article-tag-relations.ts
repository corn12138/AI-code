import * as dotenv from 'dotenv';
import * as path from 'path';
import { Client } from 'pg';

// 加载环境变量
const envPath = process.env.NODE_ENV === 'production'
    ? path.resolve(process.cwd(), '.env.prod')
    : path.resolve(process.cwd(), '.env');

dotenv.config({ path: envPath });

async function createArticleTagRelations() {
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

        // 获取所有文章和标签
        const articles = await client.query('SELECT id, title, slug FROM articles ORDER BY title');
        const tags = await client.query('SELECT id, name, slug FROM tags ORDER BY name');

        console.log(`找到 ${articles.rows.length} 篇文章和 ${tags.rows.length} 个标签`);

        // 定义文章和标签的关联关系
        const relations = [
            { articleSlug: 'javascript-basics', tagSlugs: ['javascript', 'frontend'] },
            { articleSlug: 'react-component-guide', tagSlugs: ['react', 'javascript', 'frontend'] },
            { articleSlug: 'nodejs-backend-development', tagSlugs: ['nodejs', 'backend'] },
            { articleSlug: 'typescript-type-system', tagSlugs: ['typescript', 'javascript', 'frontend'] },
            { articleSlug: 'nestjs-enterprise-development', tagSlugs: ['nestjs', 'nodejs', 'backend', 'typescript'] }
        ];

        // 清除现有关联
        await client.query('DELETE FROM article_tags');
        console.log('清除现有文章标签关联');

        // 创建新的关联
        for (const relation of relations) {
            const article = articles.rows.find(a => a.slug === relation.articleSlug);
            if (!article) {
                console.warn(`未找到文章: ${relation.articleSlug}`);
                continue;
            }

            console.log(`\n为文章 "${article.title}" 添加标签...`);

            for (const tagSlug of relation.tagSlugs) {
                const tag = tags.rows.find(t => t.slug === tagSlug);
                if (!tag) {
                    console.warn(`  未找到标签: ${tagSlug}`);
                    continue;
                }

                try {
                    await client.query(`
                        INSERT INTO article_tags ("articleId", "tagId")
                        VALUES ($1, $2)
                        ON CONFLICT ("articleId", "tagId") DO NOTHING
                    `, [article.id, tag.id]);

                    console.log(`  ✅ 添加标签: ${tag.name}`);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    console.warn(`  ⚠️ 添加标签失败 ${tag.name}: ${errorMessage}`);
                }
            }
        }

        // 显示关联结果
        console.log('\n=== 文章标签关联结果 ===');
        const relationResults = await client.query(`
            SELECT 
                a.title as article_title,
                a.slug as article_slug,
                t.name as tag_name,
                t.slug as tag_slug
            FROM article_tags at
            JOIN articles a ON at."articleId" = a.id
            JOIN tags t ON at."tagId" = t.id
            ORDER BY a.title, t.name
        `);

        let currentArticle = '';
        relationResults.rows.forEach(row => {
            if (row.article_title !== currentArticle) {
                console.log(`\n📄 ${row.article_title}:`);
                currentArticle = row.article_title;
            }
            console.log(`  🏷️  ${row.tag_name}`);
        });

        // 显示每个标签的文章数量
        console.log('\n=== 标签文章统计 ===');
        const tagStats = await client.query(`
            SELECT 
                t.name,
                t.slug,
                COUNT(at."articleId") as article_count
            FROM tags t
            LEFT JOIN article_tags at ON t.id = at."tagId"
            LEFT JOIN articles a ON at."articleId" = a.id AND a.published = true
            GROUP BY t.id, t.name, t.slug
            ORDER BY article_count DESC, t.name
        `);

        tagStats.rows.forEach(stat => {
            console.log(`🏷️  ${stat.name}: ${stat.article_count} 篇文章`);
        });

        console.log('\n✅ 文章标签关联创建完成！');

    } catch (error) {
        console.error('创建文章标签关联失败:', error);
    } finally {
        await client.end();
    }
}

createArticleTagRelations();
