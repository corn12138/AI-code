import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Client } from 'pg';

// 加载环境变量
const envPath = process.env.NODE_ENV === 'production'
    ? path.resolve(process.cwd(), '.env.prod')
    : path.resolve(process.cwd(), '.env');

dotenv.config({ path: envPath });

async function createTestUser() {
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

        // 测试用户信息
        const testUsers = [
            {
                email: 'admin@example.com',
                username: 'admin',
                password: '123456', // 明文密码
                fullName: '管理员',
                roles: '["admin", "user"]' // JSON字符串格式
            },
            {
                email: 'user@example.com',
                username: 'user',
                password: '123456', // 明文密码
                fullName: '普通用户',
                roles: '["user"]' // JSON字符串格式
            }
        ];

        for (const userData of testUsers) {
            console.log(`\n处理用户: ${userData.email}`);

            // 检查用户是否已存在
            const existingUser = await client.query(
                'SELECT id FROM users WHERE email = $1 OR username = $2',
                [userData.email, userData.username]
            );

            if (existingUser.rows.length > 0) {
                console.log(`用户 ${userData.email} 已存在，更新密码...`);

                // 加密密码
                const hashedPassword = await bcrypt.hash(userData.password, 10);

                // 更新用户密码和信息
                await client.query(
                    'UPDATE users SET password = $1, "fullName" = $2, roles = $3::json WHERE email = $4',
                    [hashedPassword, userData.fullName, userData.roles, userData.email]
                );

                console.log(`✅ 用户 ${userData.email} 密码已更新`);
            } else {
                console.log(`创建新用户: ${userData.email}`);

                // 加密密码
                const hashedPassword = await bcrypt.hash(userData.password, 10);

                // 生成UUID
                const userId = await client.query('SELECT gen_random_uuid() as id');
                const id = userId.rows[0].id;

                // 创建新用户
                await client.query(`
                    INSERT INTO users (id, email, username, "fullName", password, roles, "createdAt", "updatedAt")
                    VALUES ($1, $2, $3, $4, $5, $6::json, NOW(), NOW())
                `, [id, userData.email, userData.username, userData.fullName, hashedPassword, userData.roles]);

                console.log(`✅ 用户 ${userData.email} 创建成功`);
            }

            // 验证密码加密
            const user = await client.query('SELECT password FROM users WHERE email = $1', [userData.email]);
            if (user.rows.length > 0) {
                const isValid = await bcrypt.compare(userData.password, user.rows[0].password);
                console.log(`密码验证: ${isValid ? '✅ 成功' : '❌ 失败'}`);

                if (!isValid) {
                    console.log(`数据库密码哈希: ${user.rows[0].password.substring(0, 20)}...`);
                    console.log(`明文密码: ${userData.password}`);
                }
            }
        }

        // 显示所有用户
        console.log('\n=== 当前用户列表 ===');
        const allUsers = await client.query(`
            SELECT id, email, username, "fullName", roles, "createdAt" 
            FROM users 
            ORDER BY "createdAt"
        `);

        allUsers.rows.forEach(user => {
            console.log(`用户: ${user.email} | 用户名: ${user.username} | 角色: ${JSON.stringify(user.roles)}`);
        });

        console.log('\n所有测试用户处理完成！');
        console.log('测试登录信息:');
        console.log('管理员 - 邮箱: admin@example.com, 密码: 123456');
        console.log('普通用户 - 邮箱: user@example.com, 密码: 123456');

    } catch (error) {
        console.error('创建测试用户失败:', error);
    } finally {
        await client.end();
    }
}

createTestUser();
