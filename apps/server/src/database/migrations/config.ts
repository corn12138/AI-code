import * as dotenv from 'dotenv';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { Article } from '../../article/entities/article.entity';
import { Category } from '../../article/entities/category.entity';
import { Comment } from '../../article/entities/comment.entity';
import { Tag } from '../../article/entities/tag.entity';
import { LowcodePage } from '../../lowcode/entities/lowcode-page.entity';
import { User } from '../../user/entities/user.entity';

// 加载正确的环境变量文件，优先读取生产环境配置
const envPath = process.env.NODE_ENV === 'production'
    ? path.resolve(process.cwd(), '.env.prod')
    : path.resolve(process.cwd(), '.env');

dotenv.config({ path: envPath });

console.log(`数据库迁移配置使用环境: ${process.env.NODE_ENV || 'development'}`);
console.log(`连接到数据库: ${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`);

// 创建 DataSource 实例用于迁移
const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'blogdb',
    // 明确指定实体而不是使用通配符模式
    entities: [
        User,
        Article,
        Category,
        Tag,
        Comment,
        LowcodePage
    ],
    migrations: [
        'src/database/migrations/*{.ts,.js}',
    ],
    synchronize: false,
    logging: process.env.DATABASE_LOGGING === 'true',
    ssl: process.env.DATABASE_SSL === 'true' ? {
        rejectUnauthorized: false // 允许自签名证书，华为云可能需要
    } : false,
});

export default dataSource;
