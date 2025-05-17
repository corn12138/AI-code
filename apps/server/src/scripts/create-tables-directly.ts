import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';

// 加载环境变量
dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

async function createTables() {
    // 读取SQL脚本
    const sqlPath = path.resolve(process.cwd(), 'src/database/schema.sql');
    if (!fs.existsSync(sqlPath)) {
        console.error(`SQL文件不存在: ${sqlPath}`);
        process.exit(1);
    }

    const sqlScript = fs.readFileSync(sqlPath, 'utf8');

    // 连接到数据库
    const client = new Client({
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '6543', 10),
        user: process.env.DATABASE_USER || 'app_user',
        password: process.env.DATABASE_PASSWORD || 'HYm_7893_hyujs_m',
        database: 'blogdb', // 直接指定blogdb
        // database: process.env.DATABASE_NAME || 'blogdb',
    });

    try {
        console.log(`连接到数据库: blogdb...`);
        await client.connect();
        console.log('数据库连接成功');

        console.log('执行创建表语句...');
        // 分割SQL语句并执行
        const statements = sqlScript
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i];
            console.log(`执行SQL语句 ${i + 1}/${statements.length}...`);
            await client.query(stmt);
        }

        console.log('表创建成功!');

        // 验证表是否存在
        console.log('\n检查表是否创建成功:');
        const tables = ['users', 'categories', 'tags', 'articles'];
        for (const table of tables) {
            const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = $1
        ) as exists;
      `, [table]);

            console.log(`- 表 ${table}: ${result.rows[0].exists ? '已创建' : '未创建'}`);
        }
    } catch (error) {
        console.error('创建表失败:', error);
    } finally {
        await client.end();
        console.log('数据库连接已关闭');
    }
}

createTables();
