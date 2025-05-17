import * as dotenv from 'dotenv';
import * as path from 'path';
import { DataSource } from 'typeorm';

// 确保加载正确的.env文件
dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

// 创建 DataSource 实例用于迁移
export default new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '6543', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'blogdb',
    entities: [
        'src/**/*.entity{.ts,.js}',
    ],
    migrations: [
        'src/database/migrations/*{.ts,.js}',
    ],
    synchronize: false,
    logging: process.env.DATABASE_LOGGING === 'true',
});
