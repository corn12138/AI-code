import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';

// 加载环境变量
const envPath = process.env.NODE_ENV === 'production'
    ? path.resolve(process.cwd(), '.env.prod')
    : path.resolve(process.cwd(), '.env');

dotenv.config({ path: envPath });

async function runSqlScript(scriptPath: string) {
    // 读取SQL脚本
    const sqlScript = fs.readFileSync(scriptPath, 'utf8');

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
        console.log(`连接到数据库 ${process.env.DATABASE_HOST || 'localhost'}:${process.env.DATABASE_PORT || '6543'}/${process.env.DATABASE_NAME || 'blogdb'}...`);
        await client.connect();
        console.log('数据库连接成功！');

        console.log('开始执行SQL脚本...');
        // 将SQL脚本拆分为单独的语句
        const statements = sqlScript
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            console.log(`执行语句 ${i + 1}/${statements.length}`);
            await client.query(statement);
        }

        console.log('SQL脚本执行完成！');
        process.exit(0);
    } catch (err) {
        console.error('执行SQL脚本失败:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

// 获取命令行参数中指定的SQL文件路径
const scriptPath = process.argv[2];
if (!scriptPath) {
    console.error('请指定SQL脚本文件路径');
    process.exit(1);
}

runSqlScript(scriptPath);
