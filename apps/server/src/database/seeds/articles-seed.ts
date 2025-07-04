import * as dotenv from 'dotenv';
import * as path from 'path';
import { Client } from 'pg';

// 加载环境变量
const envPath = process.env.NODE_ENV === 'production'
    ? path.resolve(process.cwd(), '.env.prod')
    : path.resolve(process.cwd(), '.env');

dotenv.config({ path: envPath });

async function seedArticles() {
    console.log('开始填充文章数据...');

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

        // 获取管理员用户ID
        const adminUser = await client.query('SELECT id FROM users WHERE email = $1', ['admin@example.com']);
        const adminId = adminUser.rows[0]?.id;

        if (!adminId) {
            console.error('未找到管理员用户');
            return;
        }

        // 获取分类ID
        const categories = await client.query('SELECT id, name FROM categories');
        const techCategoryId = categories.rows.find(c => c.name === '技术')?.id;

        // 获取标签
        const tags = await client.query('SELECT id, name FROM tags');
        const jsTag = tags.rows.find(t => t.name === 'JavaScript')?.id;
        const reactTag = tags.rows.find(t => t.name === 'React')?.id;
        const nodeTag = tags.rows.find(t => t.name === 'Node.js')?.id;
        const tsTag = tags.rows.find(t => t.name === 'TypeScript')?.id;

        const sampleArticles = [
            {
                title: 'JavaScript ES6+ 新特性详解',
                slug: 'javascript-es6-features',
                summary: '深入了解JavaScript ES6及以后版本的新特性，包括箭头函数、解构赋值、模块化等内容。',
                content: `# JavaScript ES6+ 新特性详解

ES6（ECMAScript 2015）为JavaScript带来了许多令人兴奋的新特性。本文将详细介绍这些特性及其使用方法。

## 1. 箭头函数

箭头函数提供了更简洁的函数声明方式：

\`\`\`javascript
// 传统函数
function add(a, b) {
    return a + b;
}

// 箭头函数
const add = (a, b) => a + b;
\`\`\`

## 2. 解构赋值

解构赋值允许我们从数组或对象中提取值：

\`\`\`javascript
// 数组解构
const [first, second] = [1, 2, 3];

// 对象解构
const { name, age } = { name: 'John', age: 30 };
\`\`\`

## 3. 模板字符串

使用反引号创建模板字符串：

\`\`\`javascript
const name = 'World';
const greeting = \`Hello, \${name}!\`;
\`\`\`

## 4. let 和 const

新的变量声明方式：

\`\`\`javascript
let mutable = 'can change';
const immutable = 'cannot change';
\`\`\`

## 总结

ES6+为JavaScript开发带来了巨大的改进，让代码更加简洁和强大。`,
                published: true,
                featuredImage: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=800&q=60',
                tags: [jsTag, tsTag]
            },
            {
                title: 'React Hook 最佳实践指南',
                slug: 'react-hooks-best-practices',
                summary: 'React Hook是React 16.8引入的新特性，本文介绍如何正确使用Hook来构建现代React应用。',
                content: `# React Hook 最佳实践指南

React Hook是函数组件中使用状态和其他React特性的方式。

## 常用Hook介绍

### useState

用于在函数组件中添加状态：

\`\`\`jsx
import React, { useState } from 'react';

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

### useEffect

用于处理副作用：

\`\`\`jsx
import React, { useState, useEffect } from 'react';

function Example() {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        document.title = \`You clicked \${count} times\`;
    }, [count]);
    
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

## Hook规则

1. 只在React函数的顶层调用Hook
2. 只在React函数中调用Hook

遵循这些规则，让你的应用更加稳定和可预测。`,
                published: true,
                featuredImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=60',
                tags: [reactTag, jsTag]
            },
            {
                title: 'Node.js 性能优化技巧',
                slug: 'nodejs-performance-optimization',
                summary: '介绍Node.js应用性能优化的各种技巧和最佳实践，帮助你构建高性能的服务端应用。',
                content: `# Node.js 性能优化技巧

Node.js以其高性能著称，但仍有许多优化空间。

## 1. 使用最新版本的Node.js

每个新版本都包含性能改进：

\`\`\`bash
# 检查Node.js版本
node --version

# 使用nvm升级
nvm install node
nvm use node
\`\`\`

## 2. 启用gzip压缩

\`\`\`javascript
const compression = require('compression');
const express = require('express');
const app = express();

app.use(compression());
\`\`\`

## 3. 使用连接池

\`\`\`javascript
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
\`\`\`

## 4. 实现缓存策略

使用Redis或内存缓存：

\`\`\`javascript
const redis = require('redis');
const client = redis.createClient();

// 缓存数据
client.setex('key', 3600, JSON.stringify(data));

// 获取缓存
client.get('key', (err, result) => {
    if (result) {
        return JSON.parse(result);
    }
    // 从数据库获取数据
});
\`\`\`

通过这些优化技巧，你的Node.js应用将获得显著的性能提升。`,
                published: true,
                featuredImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=60',
                tags: [nodeTag, jsTag]
            }
        ];

        for (const article of sampleArticles) {
            // 检查文章是否已存在
            const existingArticle = await client.query(
                'SELECT id FROM articles WHERE slug = $1',
                [article.slug]
            );

            if (existingArticle.rows.length === 0) {
                // 插入文章
                const result = await client.query(`
                    INSERT INTO articles(title, slug, summary, content, published, "featuredImage", "authorId", "categoryId")
                    VALUES($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING id
                `, [
                    article.title,
                    article.slug,
                    article.summary,
                    article.content,
                    article.published,
                    article.featuredImage,
                    adminId,
                    techCategoryId
                ]);

                const articleId = result.rows[0].id;

                // 为文章添加标签
                for (const tagId of article.tags) {
                    if (tagId) {
                        await client.query(`
                            INSERT INTO article_tags("articleId", "tagId")
                            VALUES($1, $2)
                            ON CONFLICT DO NOTHING
                        `, [articleId, tagId]);
                    }
                }

                console.log(`已创建文章: ${article.title}`);
            } else {
                console.log(`文章 ${article.title} 已存在，跳过创建`);
            }
        }

        console.log('文章数据填充完成！');
    } catch (error) {
        console.error('填充文章数据时出错:', error);
        process.exit(1);
    } finally {
        await client.end();
        console.log('数据库连接已关闭');
    }
}

// 执行种子函数
seedArticles(); 