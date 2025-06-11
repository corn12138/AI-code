import * as dotenv from 'dotenv';
import * as path from 'path';
import { Client } from 'pg';

// 加载环境变量
const envPath = process.env.NODE_ENV === 'production'
    ? path.resolve(process.cwd(), '.env.prod')
    : path.resolve(process.cwd(), '.env');

dotenv.config({ path: envPath });

async function fixArticlesTable() {
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

        // 检查 articles 表的结构
        console.log('检查 articles 表结构...');
        const tableStructure = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'articles' AND table_schema = 'public'
            ORDER BY ordinal_position;
        `);

        console.log('当前 articles 表结构:');
        tableStructure.rows.forEach(row => {
            console.log(`- ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });

        // 需要添加的列
        const requiredColumns = [
            { name: 'coverImage', type: 'VARCHAR(500)', nullable: true },
            { name: 'publishedAt', type: 'TIMESTAMP WITH TIME ZONE', nullable: true }
        ];

        for (const col of requiredColumns) {
            const hasColumn = tableStructure.rows.some(row => row.column_name === col.name);

            if (!hasColumn) {
                console.log(`\n添加 ${col.name} 列...`);

                let sql = `ALTER TABLE articles ADD COLUMN "${col.name}" ${col.type}`;
                if (!col.nullable) {
                    sql += ' NOT NULL';
                }

                await client.query(sql);
                console.log(`✅ ${col.name} 列添加成功`);
            } else {
                console.log(`✅ ${col.name} 列已存在`);
            }
        }

        // 创建索引
        console.log('\n创建/更新索引...');
        try {
            await client.query('CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published)');
            await client.query('CREATE INDEX IF NOT EXISTS idx_articles_publishedAt ON articles("publishedAt")');
            await client.query('CREATE INDEX IF NOT EXISTS idx_articles_authorId ON articles("authorId")');
            console.log('✅ 索引创建成功');
        } catch (indexError) {
            const errorMessage = indexError instanceof Error ? indexError.message : String(indexError);
            console.warn('索引创建警告:', errorMessage);
        }

        // 显示最终的表结构
        console.log('\n最终 articles 表结构:');
        const finalStructure = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'articles' AND table_schema = 'public'
            ORDER BY ordinal_position;
        `);

        finalStructure.rows.forEach(row => {
            console.log(`- ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });

        console.log('\n✅ articles 表结构修复完成！');

    } catch (error) {
        console.error('修复 articles 表失败:', error);
    } finally {
        await client.end();
    }
}

fixArticlesTable();
