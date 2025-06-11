import * as dotenv from 'dotenv';
import * as path from 'path';
import { Client } from 'pg';

// 加载环境变量
const envPath = process.env.NODE_ENV === 'production'
    ? path.resolve(process.cwd(), '.env.prod')
    : path.resolve(process.cwd(), '.env');

dotenv.config({ path: envPath });

async function createSampleTags() {
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

        // 示例标签数据
        const sampleTags = [
            {
                name: 'JavaScript',
                slug: 'javascript',
                description: 'JavaScript 编程语言相关技术和最佳实践',
                color: '#f7df1e'
            },
            {
                name: 'React',
                slug: 'react',
                description: 'React 前端框架开发技术',
                color: '#61dafb'
            },
            {
                name: 'Node.js',
                slug: 'nodejs',
                description: 'Node.js 后端开发技术',
                color: '#339933'
            },
            {
                name: 'TypeScript',
                slug: 'typescript',
                description: 'TypeScript 类型安全的 JavaScript',
                color: '#3178c6'
            },
            {
                name: 'NestJS',
                slug: 'nestjs',
                description: 'NestJS 企业级 Node.js 框架',
                color: '#e0234e'
            },
            {
                name: '数据库',
                slug: 'database',
                description: '数据库设计、优化和管理',
                color: '#336791'
            },
            {
                name: '前端开发',
                slug: 'frontend',
                description: '前端开发技术和工具',
                color: '#ff6b6b'
            },
            {
                name: '后端开发',
                slug: 'backend',
                description: '后端开发架构和技术',
                color: '#4ecdc4'
            }
        ];

        for (const tag of sampleTags) {
            console.log(`处理标签: ${tag.name}`);

            // 检查标签是否已存在（同时检查 name 和 slug）
            const existingTag = await client.query(
                'SELECT id FROM tags WHERE name = $1 OR slug = $2',
                [tag.name, tag.slug]
            );

            if (existingTag.rows.length > 0) {
                console.log(`标签 ${tag.name} 已存在，跳过创建`);
                continue;
            }

            try {
                // 生成UUID
                const tagId = await client.query('SELECT gen_random_uuid() as id');
                const id = tagId.rows[0].id;

                // 创建标签
                await client.query(`
                    INSERT INTO tags (id, name, slug, description, color, "createdAt", "updatedAt")
                    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                `, [id, tag.name, tag.slug, tag.description, tag.color]);

                console.log(`✅ 标签 ${tag.name} 创建成功`);
            } catch (insertError) {
                const errorMessage = insertError instanceof Error ? insertError.message : String(insertError);
                console.warn(`⚠️ 标签 ${tag.name} 创建失败: ${errorMessage}`);

                // 如果是重复键错误，继续处理下一个标签
                if (errorMessage.includes('duplicate key')) {
                    console.log(`标签 ${tag.name} 可能已存在，跳过`);
                    continue;
                } else {
                    throw insertError;
                }
            }
        }

        // 显示所有标签
        console.log('\n=== 当前标签列表 ===');
        const allTags = await client.query(`
            SELECT id, name, slug, description, color, "createdAt" 
            FROM tags 
            ORDER BY "createdAt"
        `);

        if (allTags.rows.length > 0) {
            allTags.rows.forEach(tag => {
                console.log(`标签: ${tag.name} | Slug: ${tag.slug} | 颜色: ${tag.color || 'N/A'}`);
            });
        } else {
            console.log('暂无标签数据');
        }

        console.log('\n所有示例标签处理完成！');

    } catch (error) {
        console.error('创建示例标签失败:', error);
    } finally {
        await client.end();
    }
}

createSampleTags();
