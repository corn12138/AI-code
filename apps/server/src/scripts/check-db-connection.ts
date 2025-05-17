import * as dotenv from 'dotenv';
import * as path from 'path';
import { Client } from 'pg';

// 加载环境变量
const envPath = process.env.NODE_ENV === 'production'
    ? path.resolve(process.cwd(), '.env.prod')
    : path.resolve(process.cwd(), '.env');

dotenv.config({ path: envPath });

async function checkDatabaseConnection() {
    // 首先连接到默认数据库(postgres)以创建我们的应用数据库
    const pgClient = new Client({
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT || '6543', 10),
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: 'postgres', // 连接默认数据库
        ssl: process.env.DATABASE_SSL === 'true' ? {
            rejectUnauthorized: false
        } : false,
    });

    try {
        console.log('正在连接到PostgreSQL默认数据库...');
        await pgClient.connect();
        console.log('成功连接到PostgreSQL服务器！');

        // 检查目标数据库是否存在
        const dbName = process.env.DATABASE_NAME || 'blogdb';
        const checkDbResult = await pgClient.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [dbName]
        );

        // 如果数据库不存在，则创建它
        if (checkDbResult.rowCount === 0) {
            console.log(`数据库 "${dbName}" 不存在，正在创建...`);
            // 使用双引号避免小写问题
            await pgClient.query(`CREATE DATABASE "${dbName}"`);
            console.log(`数据库 "${dbName}" 创建成功！`);
        } else {
            console.log(`数据库 "${dbName}" 已存在。`);
        }

        await pgClient.end();

        // 现在连接到我们的应用数据库
        const appClient = new Client({
            host: process.env.DATABASE_HOST,
            port: parseInt(process.env.DATABASE_PORT || '6543', 10),
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: dbName,
            ssl: process.env.DATABASE_SSL === 'true' ? {
                rejectUnauthorized: false
            } : false,
        });

        console.log(`正在连接到应用数据库 "${dbName}"...`);
        await appClient.connect();
        console.log(`成功连接到应用数据库 "${dbName}"！`);

        const res = await appClient.query('SELECT version()');
        console.log('数据库版本:', res.rows[0].version);

        // 检查是否已经存在uuid扩展
        const extResult = await appClient.query(
            "SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp'"
        );

        if (extResult.rowCount === 0) {
            console.log('正在创建uuid-ossp扩展...');
            await appClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
            console.log('uuid-ossp扩展创建成功！');
        } else {
            console.log('uuid-ossp扩展已存在。');
        }

        await appClient.end();
        console.log('数据库准备就绪！');
        process.exit(0);
    } catch (err) {
        console.error('数据库操作失败:', err);
        process.exit(1);
    }
}

checkDatabaseConnection();
