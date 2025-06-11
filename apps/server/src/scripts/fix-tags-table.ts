import * as dotenv from 'dotenv';
import * as path from 'path';
import { Client } from 'pg';

// 加载环境变量
const envPath = process.env.NODE_ENV === 'production'
    ? path.resolve(process.cwd(), '.env.prod')
    : path.resolve(process.cwd(), '.env');

dotenv.config({ path: envPath });

async function fixTagsTable() {
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

        // 检查 tags 表的结构
        console.log('检查 tags 表结构...');
        const tableStructure = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'tags' AND table_schema = 'public'
            ORDER BY ordinal_position;
        `);

        console.log('当前 tags 表结构:');
        tableStructure.rows.forEach(row => {
            console.log(`- ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });

        // 检查并处理 slug 列
        const hasSlug = tableStructure.rows.some(row => row.column_name === 'slug');

        if (!hasSlug) {
            console.log('\n添加 slug 列...');

            // 先添加为可空列
            await client.query(`
                ALTER TABLE tags ADD COLUMN slug VARCHAR(100);
            `);

            // 为现有记录生成 slug
            const existingTags = await client.query('SELECT id, name FROM tags WHERE slug IS NULL');
            console.log(`需要为 ${existingTags.rows.length} 个标签生成 slug`);

            for (const tag of existingTags.rows) {
                let slug = tag.name
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-') // 支持中文
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');

                // 确保 slug 不为空
                if (!slug) {
                    slug = `tag-${tag.id.substring(0, 8)}`;
                }

                // 检查 slug 是否重复
                let finalSlug = slug;
                let counter = 1;
                while (true) {
                    const existing = await client.query('SELECT id FROM tags WHERE slug = $1 AND id != $2', [finalSlug, tag.id]);
                    if (existing.rows.length === 0) {
                        break;
                    }
                    finalSlug = `${slug}-${counter}`;
                    counter++;
                }

                await client.query('UPDATE tags SET slug = $1 WHERE id = $2', [finalSlug, tag.id]);
                console.log(`为标签 "${tag.name}" 生成 slug: ${finalSlug}`);
            }

            // 现在设置为不可空并添加唯一约束
            await client.query(`ALTER TABLE tags ALTER COLUMN slug SET NOT NULL`);
            await client.query(`ALTER TABLE tags ADD CONSTRAINT tags_slug_unique UNIQUE (slug)`);

            console.log('✅ slug 列添加成功');
        }

        // 处理其他列
        const additionalColumns = [
            { name: 'description', type: 'TEXT', nullable: true },
            { name: 'color', type: 'VARCHAR(7)', nullable: true },
            { name: 'createdAt', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, default: 'NOW()' },
            { name: 'updatedAt', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, default: 'NOW()' }
        ];

        for (const col of additionalColumns) {
            const hasColumn = tableStructure.rows.some(row => row.column_name === col.name);

            if (!hasColumn) {
                console.log(`\n添加 ${col.name} 列...`);

                if (col.nullable) {
                    await client.query(`ALTER TABLE tags ADD COLUMN "${col.name}" ${col.type}`);
                } else {
                    // 对于非空列，先添加为可空，设置默认值，然后设为非空
                    await client.query(`ALTER TABLE tags ADD COLUMN "${col.name}" ${col.type}`);

                    if (col.default) {
                        await client.query(`UPDATE tags SET "${col.name}" = ${col.default} WHERE "${col.name}" IS NULL`);
                    }

                    await client.query(`ALTER TABLE tags ALTER COLUMN "${col.name}" SET NOT NULL`);

                    if (col.default) {
                        await client.query(`ALTER TABLE tags ALTER COLUMN "${col.name}" SET DEFAULT ${col.default}`);
                    }
                }

                console.log(`✅ ${col.name} 列添加成功`);
            }
        }

        // 创建索引
        console.log('\n创建/更新索引...');

        try {
            await client.query('DROP INDEX IF EXISTS idx_tags_slug');
            await client.query('DROP INDEX IF EXISTS idx_tags_name');

            await client.query(`CREATE INDEX idx_tags_slug ON tags(slug)`);
            await client.query(`CREATE INDEX idx_tags_name ON tags(name)`);

            console.log('✅ 索引创建成功');
        } catch (indexError) {
            const errorMessage = indexError instanceof Error ? indexError.message : String(indexError);
            console.warn('索引创建警告:', errorMessage);
        }

        // 显示最终的表结构
        console.log('\n最终 tags 表结构:');
        const finalStructure = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'tags' AND table_schema = 'public'
            ORDER BY ordinal_position;
        `);

        finalStructure.rows.forEach(row => {
            console.log(`- ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });

        // 显示现有数据
        console.log('\n现有标签数据:');
        const existingData = await client.query('SELECT id, name, slug FROM tags ORDER BY name');
        existingData.rows.forEach(tag => {
            console.log(`- ${tag.name} (${tag.slug})`);
        });

        console.log('\n✅ tags 表结构修复完成！');

    } catch (error) {
        console.error('修复 tags 表失败:', error);
    } finally {
        await client.end();
    }
}

fixTagsTable();
