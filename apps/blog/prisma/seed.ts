import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 开始数据库种子数据填充...');

    // 创建管理员用户
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            username: 'admin',
            fullName: '系统管理员',
            password: adminPassword,
            roles: JSON.stringify(['admin', 'editor', 'user']),
            bio: '系统管理员账户',
        },
    });

    console.log('✅ 创建管理员用户:', admin.email);

    // 创建测试用户
    const testUserPassword = await bcrypt.hash('test123', 12);
    const testUser = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
            email: 'test@example.com',
            username: 'testuser',
            fullName: '测试用户',
            password: testUserPassword,
            roles: JSON.stringify(['user']),
            bio: '这是一个测试用户账户',
        },
    });

    console.log('✅ 创建测试用户:', testUser.email);

    // 创建作者用户
    const authorPassword = await bcrypt.hash('author123', 12);
    const author = await prisma.user.upsert({
        where: { email: 'author@example.com' },
        update: {},
        create: {
            email: 'author@example.com',
            username: 'author',
            fullName: '内容作者',
            password: authorPassword,
            roles: JSON.stringify(['editor', 'user']),
            bio: '专业内容创作者',
        },
    });

    console.log('✅ 创建作者用户:', author.email);

    // 创建演示用户（更贴近真实场景）
    const demoPassword = await bcrypt.hash('demo123', 12);
    const demoUser = await prisma.user.upsert({
        where: { email: 'demo@example.com' },
        update: {},
        create: {
            email: 'demo@example.com',
            username: 'demo',
            fullName: '演示用户',
            password: demoPassword,
            roles: JSON.stringify(['user']),
            bio: '这是一个演示账户，展示博客系统的功能',
        },
    });

    console.log('✅ 创建演示用户:', demoUser.email);

    // 创建分类
    const techCategory = await prisma.category.upsert({
        where: { name: '技术' },
        update: {},
        create: {
            name: '技术',
            slug: 'tech',
            description: '技术相关文章',
        },
    });

    const frontendCategory = await prisma.category.upsert({
        where: { name: '前端开发' },
        update: {},
        create: {
            name: '前端开发',
            slug: 'frontend',
            description: '前端开发相关文章',
        },
    });

    console.log('✅ 创建分类:', techCategory.name, frontendCategory.name);

    // 创建标签
    const reactTag = await prisma.tag.upsert({
        where: { name: 'React' },
        update: {},
        create: {
            name: 'React',
            slug: 'react',
            description: 'React框架相关',
            color: '#61DAFB',
        },
    });

    const nextjsTag = await prisma.tag.upsert({
        where: { name: 'Next.js' },
        update: {},
        create: {
            name: 'Next.js',
            slug: 'nextjs',
            description: 'Next.js框架相关',
            color: '#000000',
        },
    });

    const typescriptTag = await prisma.tag.upsert({
        where: { name: 'TypeScript' },
        update: {},
        create: {
            name: 'TypeScript',
            slug: 'typescript',
            description: 'TypeScript相关',
            color: '#3178C6',
        },
    });

    console.log('✅ 创建标签:', reactTag.name, nextjsTag.name, typescriptTag.name);

    // 创建示例文章
    const article1 = await prisma.article.create({
        data: {
            title: 'Next.js 14 全栈开发实战：从零到生产部署',
            slug: 'nextjs-14-fullstack-guide',
            content: `
# Next.js 14 全栈开发实战

Next.js 14 带来了许多令人兴奋的新特性，包括 App Router、Server Components、Streaming 等。本文将带你从零开始构建一个完整的全栈应用。

## 主要内容

1. **App Router** - 新的路由系统
2. **Server Components** - 服务器端组件
3. **流式渲染** - Streaming 和 Suspense
4. **数据获取** - 新的数据获取模式
5. **部署优化** - 生产环境最佳实践

## 开始学习

让我们从安装 Next.js 14 开始...

\`\`\`bash
npx create-next-app@latest my-app --typescript --tailwind --eslint
\`\`\`

这将创建一个包含所有最新特性的 Next.js 项目。
            `,
            summary: 'Complete guide to building full-stack applications with Next.js 14, covering App Router, Server Components, and deployment best practices.',
            published: true,
            status: 'PUBLISHED',
            metaTitle: 'Next.js 14 全栈开发完整指南',
            metaDescription: '学习使用 Next.js 14 构建现代全栈应用，包括 App Router、Server Components 等最新特性。',
            keywords: 'Next.js, React, TypeScript, 全栈开发, App Router',
            viewCount: 1285,
            authorId: author.id,
            categoryId: frontendCategory.id,
            publishedAt: new Date(),
            tags: {
                connect: [
                    { id: nextjsTag.id },
                    { id: reactTag.id },
                    { id: typescriptTag.id }
                ]
            }
        }
    });

    const article2 = await prisma.article.create({
        data: {
            title: 'React 18 并发特性深度解析',
            slug: 'react-18-concurrent-features',
            content: `
# React 18 并发特性深度解析

React 18 引入了并发特性，这是 React 历史上最重要的更新之一。

## 核心概念

- **并发渲染** - Concurrent Rendering
- **自动批处理** - Automatic Batching  
- **Suspense** - 数据获取和代码分割
- **useTransition** - 标记非紧急更新

## 实际应用

这些特性如何提升用户体验...
            `,
            summary: '深入了解 React 18 的并发特性，包括并发渲染、Suspense、useTransition 等核心概念。',
            published: true,
            status: 'PUBLISHED',
            viewCount: 892,
            authorId: admin.id,
            categoryId: frontendCategory.id,
            publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1天前
            tags: {
                connect: [
                    { id: reactTag.id },
                    { id: typescriptTag.id }
                ]
            }
        }
    });

    console.log('✅ 创建示例文章:', article1.title, article2.title);

    // 创建示例评论
    await prisma.comment.create({
        data: {
            content: '非常详细的教程！对初学者很有帮助。',
            authorId: testUser.id,
            articleId: article1.id,
        }
    });

    await prisma.comment.create({
        data: {
            content: 'React 18 的并发特性确实革命性，期待更多实战案例。',
            authorId: demoUser.id,
            articleId: article2.id,
        }
    });

    console.log('✅ 创建示例评论');

    console.log('\n🎉 数据库种子数据填充完成！');
    console.log('\n📝 测试账户信息:');
    console.log('====================');
    console.log('管理员账户:');
    console.log('  邮箱: admin@example.com');
    console.log('  密码: admin123');
    console.log('  权限: admin, editor, user');
    console.log('');
    console.log('测试用户:');
    console.log('  邮箱: test@example.com');
    console.log('  密码: test123');
    console.log('  权限: user');
    console.log('');
    console.log('作者账户:');
    console.log('  邮箱: author@example.com');
    console.log('  密码: author123');
    console.log('  权限: editor, user');
    console.log('');
    console.log('演示账户:');
    console.log('  邮箱: demo@example.com');
    console.log('  密码: demo123');
    console.log('  权限: user');
    console.log('====================');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ 种子数据填充失败:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
