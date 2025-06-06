// 检查数据库连接脚本

const dotenv = require('dotenv');
import { Logger } from '@nestjs/common';
import * as path from 'path';
import { Client } from 'pg';

// 加载环境变量
const envPath = process.env.NODE_ENV === 'production'
    ? path.resolve(process.cwd(), '.env.prod')
    : path.resolve(process.cwd(), '.env');

dotenv.config({ path: envPath });

const logger = new Logger('DatabaseConnection');

// 最大重试次数
const MAX_RETRIES = 5;
// 重试延迟(ms)
const RETRY_DELAY = 3000;

async function connectWithRetry(client: Client, retries = 0): Promise<void> {
    try {
        await client.connect();
    } catch (err: unknown) {
        if (retries >= MAX_RETRIES) {
            // 安全地处理未知类型的错误
            const errorMessage = err instanceof Error ? err.message : String(err);
            logger.error(`连接数据库失败，已达到最大重试次数: ${errorMessage}`);
            throw err;
        }

        // 安全地处理未知类型的错误
        const errorMessage = err instanceof Error ? err.message : String(err);
        logger.warn(`连接数据库失败，${RETRY_DELAY / 1000}秒后重试 (${retries + 1}/${MAX_RETRIES}): ${errorMessage}`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        await connectWithRetry(client, retries + 1);
    }
}

async function checkDatabaseConnection() {
    // 首先连接到默认数据库(postgres)以创建我们的应用数据库
    const pgClient = new Client({
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT || '5432', 10), // 使用标准PostgreSQL端口
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: 'postgres', // 连接到默认数据库
        ssl: process.env.DATABASE_SSL === 'true' ? {
            rejectUnauthorized: false
        } : false,
        // 添加连接超时配置
        connectionTimeoutMillis: 10000,
        // 添加查询超时配置
        statement_timeout: 10000,
    });

    try {
        logger.log('正在连接到PostgreSQL默认数据库...');
        await connectWithRetry(pgClient);
        logger.log('成功连接到PostgreSQL服务器！');

        // 检查目标数据库是否存在
        const dbName = process.env.DATABASE_NAME || 'blogdb';
        const checkDbResult = await pgClient.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [dbName]
        );

        // 如果数据库不存在，则创建它
        if (checkDbResult.rowCount === 0) {
            logger.log(`数据库 "${dbName}" 不存在，正在创建...`);
            // 使用双引号避免小写问题
            await pgClient.query(`CREATE DATABASE "${dbName}"`);
            logger.log(`数据库 "${dbName}" 创建成功！`);
        } else {
            logger.log(`数据库 "${dbName}" 已存在。`);
        }

        await pgClient.end();

        // 现在连接到我们的应用数据库
        const appClient = new Client({
            host: process.env.DATABASE_HOST,
            port: parseInt(process.env.DATABASE_PORT || '5432', 10),
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: dbName,
            ssl: process.env.DATABASE_SSL === 'true' ? {
                rejectUnauthorized: false
            } : false,
        });

        logger.log(`正在连接到应用数据库 "${dbName}"...`);
        await appClient.connect();
        logger.log(`成功连接到应用数据库 "${dbName}"！`);

        const res = await appClient.query('SELECT version()');
        logger.log('数据库版本:', res.rows[0].version);

        // 检查是否已经存在uuid扩展
        const extResult = await appClient.query(
            "SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp'"
        );

        if (extResult.rowCount === 0) {
            logger.log('正在创建uuid-ossp扩展...');
            await appClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
            logger.log('uuid-ossp扩展创建成功！');
        } else {
            logger.log('uuid-ossp扩展已存在。');
        }

        await appClient.end();
        logger.log('数据库准备就绪！');
        process.exit(0);
    } catch (err: unknown) {
        // 安全地处理未知类型的错误
        const errorMessage = err instanceof Error ? err.message : String(err);
        const errorStack = err instanceof Error ? err.stack : undefined;
        logger.error('数据库操作失败:', errorStack || errorMessage);
        process.exit(1);
    }
}

checkDatabaseConnection();
