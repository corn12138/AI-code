import * as dotenv from 'dotenv';
import * as path from 'path';
import { Client } from 'pg';

// 加载环境变量
dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

async function checkDatabaseAccess() {
    // 使用环境变量中的 app_user 连接数据库
    const client = new Client({
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '6543', 10),
        user: process.env.DATABASE_USER || 'app_user',
        password: process.env.DATABASE_PASSWORD || 'HYm_7893_hyujs_m',
        database: process.env.DATABASE_NAME || 'blogdb',
        ssl: process.env.DATABASE_SSL === 'true' ? {
            rejectUnauthorized: false
        } : false,
    });

    try {
        console.log(`=== 连接验证 ===`);
        console.log(`尝试以用户 ${process.env.DATABASE_USER || 'app_user'} 连接到 ${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`);
        await client.connect();
        console.log('✅ 数据库连接成功');

        // 检查当前用户
        const userResult = await client.query('SELECT current_user, current_database()');
        console.log(`当前连接用户: ${userResult.rows[0].current_user}`);
        console.log(`当前数据库: ${userResult.rows[0].current_database}`);

        // 检查可用的schema
        console.log(`\n=== Schema信息 ===`);
        const schemasResult = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT LIKE 'pg_%' AND schema_name != 'information_schema'
    `);

        console.log('可访问的schema:');
        schemasResult.rows.forEach(row => {
            console.log(`- ${row.schema_name}`);
        });

        // 检查表权限
        console.log(`\n=== 表权限 ===`);
        const tablesResult = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name
    `);

        if (tablesResult.rows.length === 0) {
            console.log('⚠️ 未找到任何表! 可能表尚未创建或当前用户没有权限。');
        } else {
            console.log('可见的表:');
            tablesResult.rows.forEach(row => {
                console.log(`- ${row.table_schema}.${row.table_name}`);
            });
        }

        // 检查是否有我们期望的特定表
        console.log(`\n=== 预期表检查 ===`);
        const expectedTables = ['users', 'categories', 'tags', 'articles', 'comments', 'lowcode_pages'];
        for (const table of expectedTables) {
            const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = $1
        ) as exists;
      `, [table]);

            console.log(`- 表 ${table}: ${tableCheck.rows[0].exists ? '✅ 存在' : '❌ 不存在'}`);
        }

        // 如果表不存在，检查用户权限
        console.log(`\n=== 用户权限检查 ===`);
        const permissionsResult = await client.query(`
      SELECT 
        grantee, 
        table_schema, 
        table_name, 
        privilege_type
      FROM 
        information_schema.table_privileges
      WHERE 
        grantee = $1
      ORDER BY table_schema, table_name, privilege_type;
    `, [`${userResult.rows[0].current_user}`]);

        if (permissionsResult.rows.length === 0) {
            console.log('⚠️ 当前用户没有任何表权限!');
            console.log('可能需要授予以下权限:');
            console.log('GRANT ALL PRIVILEGES ON DATABASE blogdb TO app_user;');
            console.log('GRANT ALL PRIVILEGES ON SCHEMA public TO app_user;');
            console.log('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;');
        } else {
            console.log('当前用户权限:');
            permissionsResult.rows.forEach(row => {
                console.log(`- ${row.table_schema}.${row.table_name}: ${row.privilege_type}`);
            });
        }

    } catch (error) {
        console.error('❌ 数据库检查失败:', error);
    } finally {
        await client.end();
    }
}

checkDatabaseAccess();
