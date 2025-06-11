import * as dotenv from 'dotenv';
import * as path from 'path';
import { Client } from 'pg';

// 加载环境变量
const envPath = process.env.NODE_ENV === 'production'
    ? path.resolve(process.cwd(), '.env.prod')
    : path.resolve(process.cwd(), '.env');

dotenv.config({ path: envPath });

async function createArticlesTable() {
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

        // 检查表结构
        console.log('检查 articles 表结构...');
        const tableStructure = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'articles' AND table_schema = 'public'
            ORDER BY ordinal_position;
        `);

        console.log('当前 articles 表结构:');
        tableStructure.rows.forEach(row => {
            console.log(`- ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });

        // 获取管理员用户ID
        const adminUser = await client.query('SELECT id FROM users WHERE email = $1', ['admin@example.com']);
        if (adminUser.rows.length === 0) {
            console.error('未找到管理员用户，请先创建用户');
            return;
        }

        const authorId = adminUser.rows[0].id;
        console.log(`使用管理员用户 ${authorId} 作为文章作者`);

        // 检查是否已有文章
        const existingArticles = await client.query('SELECT COUNT(*) FROM articles');
        const articleCount = parseInt(existingArticles.rows[0].count as string, 10);

        if (articleCount > 0) {
            console.log(`已有 ${articleCount} 篇文章，继续添加示例文章...`);
        } else {
            console.log('开始创建示例文章...');
        }

        const sampleArticles = [
            {
                title: 'JavaScript 基础教程',
                slug: 'javascript-basics',
                summary: '学习 JavaScript 的基础知识，包括变量、函数、对象等核心概念。', // 使用 summary 而不是 excerpt
                content: `# JavaScript 基础教程

JavaScript 是一种动态的、弱类型的编程语言，主要用于 Web 开发。

## 变量声明

\`\`\`javascript
let name = "Hello World";
const PI = 3.14159;
var age = 25;
\`\`\`

## 函数

\`\`\`javascript
function greet(name) {
    return "Hello, " + name + "!";
}
\`\`\`

这是一个完整的 JavaScript 基础教程...`,
                published: true
            },
            {
                title: 'React 组件开发指南',
                slug: 'react-component-guide',
                summary: '深入了解 React 组件的创建、状态管理和生命周期。',
                content: `# React 组件开发指南

React 是一个用于构建用户界面的 JavaScript 库。

## 函数组件

\`\`\`jsx
function Welcome(props) {
    return <h1>Hello, {props.name}</h1>;
}
\`\`\`

## Hook 的使用

\`\`\`jsx
import { useState, useEffect } from 'react';

function Counter() {
    const [count, setCount] = useState(0);
    
    return (
        <div>
            <p>You clicked {count} times</p>
            <button onClick={() => setCount(count + 1)}>
                Click me
            </button>
        </div>
    );
}
\`\`\`

更多内容...`,
                published: true
            },
            {
                title: 'Node.js 后端开发',
                slug: 'nodejs-backend-development',
                summary: '使用 Node.js 和 Express 构建现代化的后端 API 服务。',
                content: `# Node.js 后端开发

Node.js 让我们可以使用 JavaScript 进行服务器端开发。

## Express 基础

\`\`\`javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
\`\`\`

详细内容...`,
                published: true
            }
        ];

        for (const article of sampleArticles) {
            // 检查文章是否已存在
            const existingArticle = await client.query('SELECT id FROM articles WHERE slug = $1', [article.slug]);

            if (existingArticle.rows.length > 0) {
                console.log(`文章 "${article.title}" 已存在，跳过创建`);
                continue;
            }

            try {
                await client.query(`
                    INSERT INTO articles (title, slug, summary, content, published, "authorId")
                    VALUES ($1, $2, $3, $4, $5, $6)
                `, [
                    article.title,
                    article.slug,
                    article.summary,
                    article.content,
                    article.published,
                    authorId
                ]);

                console.log(`✅ 创建文章: ${article.title}`);
            } catch (insertError) {
                const errorMessage = insertError instanceof Error ? insertError.message : String(insertError);
                console.warn(`⚠️ 创建文章失败 "${article.title}": ${errorMessage}`);
            }
        }

        // 显示所有文章
        console.log('\n=== 当前文章列表 ===');
        const allArticles = await client.query(`
            SELECT a.id, a.title, a.slug, a.published, u.username
            FROM articles a
            JOIN users u ON a."authorId" = u.id
            ORDER BY a."createdAt" DESC
        `);

        allArticles.rows.forEach(article => {
            const status = article.published ? '已发布' : '草稿';
            console.log(`- ${article.title} [${status}] by ${article.username}`);
        });

        console.log('\n✅ 文章数据插入完成！');

    } catch (error) {
        console.error('插入文章数据失败:', error);
    } finally {
        await client.end();
    }
}

createArticlesTable();
