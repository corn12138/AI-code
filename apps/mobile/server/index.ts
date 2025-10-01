import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ArticleCategory } from '../src/types/index.ts';
import { checkAPIHealth, fetchArticleByIdFromAPI, fetchArticlesFromAPI } from './api.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

// 中间件
app.use(compression());
app.use(cors());
app.use(express.json());

// 静态文件服务
if (!isDev) {
    app.use('/assets', express.static(path.resolve(__dirname, '../dist/assets')));
    app.use('/public', express.static(path.resolve(__dirname, '../public')));
}

// 读取HTML模板
let template: string;
async function loadTemplate() {
    try {
        template = await fs.readFile(
            path.resolve(__dirname, 'template.html'),
            'utf-8'
        );
    } catch (error) {
        console.error('Failed to load HTML template:', error);
        process.exit(1);
    }
}

// 渲染HTML页面
function renderHTML(options: {
    html: string;
    title: string;
    description: string;
    url: string;
    image?: string;
    initialData: any;
    styles?: string;
    scripts?: string;
}) {
    const {
        html,
        title,
        description,
        url,
        image = '/public/default-og-image.jpg',
        initialData,
        styles = '',
        scripts = isDev ? '<script type="module" src="/src/main.tsx"></script>' : '<script type="module" src="/assets/main.js"></script>',
    } = options;

    return template
        .replace('{{html}}', html)
        .replace(/{{title}}/g, title)
        .replace(/{{description}}/g, description)
        .replace(/{{url}}/g, url)
        .replace(/{{image}}/g, image)
        .replace('{{initialData}}', JSON.stringify(initialData))
        .replace('{{ssrContext}}', JSON.stringify({ url, timestamp: Date.now() }))
        .replace('{{styles}}', styles)
        .replace('{{scripts}}', scripts);
}

// 健康检查
app.get('/health', async (req, res) => {
    const apiHealthy = await checkAPIHealth();
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        api: apiHealthy ? 'healthy' : 'unhealthy',
    });
});

// API代理路由
app.get('/api/articles', async (req, res) => {
    try {
        const { category, page = 1, pageSize = 10 } = req.query;
        const result = await fetchArticlesFromAPI(
            category as ArticleCategory,
            parseInt(page as string),
            parseInt(pageSize as string)
        );
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('API proxy error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

app.get('/api/articles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const article = await fetchArticleByIdFromAPI(id);
        if (!article) {
            return res.status(404).json({ success: false, error: 'Article not found' });
        }
        res.json({ success: true, data: article });
    } catch (error) {
        console.error('API proxy error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// 新的移动端API代理路由
app.get('/api/mobile/docs', async (req, res) => {
    try {
        const { category, page = 1, pageSize = 10 } = req.query;
        const result = await fetchArticlesFromAPI(
            category as ArticleCategory,
            parseInt(page as string),
            parseInt(pageSize as string)
        );
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Mobile API proxy error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

app.get('/api/mobile/docs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const article = await fetchArticleByIdFromAPI(id);
        if (!article) {
            return res.status(404).json({ success: false, error: 'Article not found' });
        }
        res.json({ success: true, data: article });
    } catch (error) {
        console.error('Mobile API proxy error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// SSR路由处理
app.get('*', async (req, res) => {
    try {
        const url = req.originalUrl;
        let initialData: any = {};
        let title = '技术文章 - 移动端阅读平台';
        let description = '发现最新的技术文章，涵盖前端、后端、AI、移动开发等领域';
        let image = '/public/default-og-image.jpg';

        // 根据路由预加载数据
        if (url === '/' || url.startsWith('/?')) {
            // 首页 - 加载最新文章
            const articlesData = await fetchArticlesFromAPI('latest', 1, 10);
            initialData = {
                articles: articlesData.items,
                currentCategory: 'latest',
                pagination: {
                    page: articlesData.page,
                    pageSize: articlesData.pageSize,
                    total: articlesData.total,
                    hasMore: articlesData.hasMore,
                },
            };
            title = '最新技术文章 - 移动端阅读平台';
        } else if (url.startsWith('/frontend')) {
            // 前端分类页
            const articlesData = await fetchArticlesFromAPI('frontend', 1, 10);
            initialData = {
                articles: articlesData.items,
                currentCategory: 'frontend',
                pagination: {
                    page: articlesData.page,
                    pageSize: articlesData.pageSize,
                    total: articlesData.total,
                    hasMore: articlesData.hasMore,
                },
            };
            title = '前端开发文章 - 移动端阅读平台';
            description = '最新的前端开发技术文章，包括React、Vue、JavaScript等';
        } else if (url.startsWith('/backend')) {
            // 后端分类页
            const articlesData = await fetchArticlesFromAPI('backend', 1, 10);
            initialData = {
                articles: articlesData.items,
                currentCategory: 'backend',
                pagination: {
                    page: articlesData.page,
                    pageSize: articlesData.pageSize,
                    total: articlesData.total,
                    hasMore: articlesData.hasMore,
                },
            };
            title = '后端开发文章 - 移动端阅读平台';
            description = '后端开发技术文章，涵盖Node.js、数据库、API设计等';
        } else if (url.startsWith('/ai')) {
            // AI分类页
            const articlesData = await fetchArticlesFromAPI('ai', 1, 10);
            initialData = {
                articles: articlesData.items,
                currentCategory: 'ai',
                pagination: {
                    page: articlesData.page,
                    pageSize: articlesData.pageSize,
                    total: articlesData.total,
                    hasMore: articlesData.hasMore,
                },
            };
            title = 'AI技术文章 - 移动端阅读平台';
            description = '人工智能和机器学习相关的技术文章';
        } else if (url.startsWith('/mobile')) {
            // 移动端分类页
            const articlesData = await fetchArticlesFromAPI('mobile', 1, 10);
            initialData = {
                articles: articlesData.items,
                currentCategory: 'mobile',
                pagination: {
                    page: articlesData.page,
                    pageSize: articlesData.pageSize,
                    total: articlesData.total,
                    hasMore: articlesData.hasMore,
                },
            };
            title = '移动开发文章 - 移动端阅读平台';
            description = '移动端开发技术文章，包括React Native、Flutter等';
        } else if (url.startsWith('/design')) {
            // 设计分类页
            const articlesData = await fetchArticlesFromAPI('design', 1, 10);
            initialData = {
                articles: articlesData.items,
                currentCategory: 'design',
                pagination: {
                    page: articlesData.page,
                    pageSize: articlesData.pageSize,
                    total: articlesData.total,
                    hasMore: articlesData.hasMore,
                },
            };
            title = 'UI/UX设计文章 - 移动端阅读平台';
            description = 'UI/UX设计相关的文章和最佳实践';
        } else if (url.startsWith('/article/')) {
            // 文章详情页
            const articleId = url.split('/article/')[1];
            const article = await fetchArticleByIdFromAPI(articleId);
            if (article) {
                initialData = {
                    currentArticle: article,
                };
                title = `${article.title} - 移动端阅读平台`;
                description = article.summary || description;
                image = article.imageUrl || image;
            }
        }

        // 在开发环境中，我们需要使用Vite的开发服务器
        let html = '';
        if (isDev) {
            // 开发环境：返回基础HTML，让客户端渲染
            html = '<div id="root"></div>';
        } else {
            // 生产环境：进行服务端渲染
            try {
                const { render } = await import('./entry-server.jsx');
                const renderResult = await render({ url, initialData });
                html = renderResult.html;
                initialData = renderResult.initialData;
            } catch (error) {
                console.error('SSR render error:', error);
                // 降级到客户端渲染
                html = '<div id="root"></div>';
            }
        }

        const renderedHTML = renderHTML({
            html,
            title,
            description,
            url: req.protocol + '://' + req.get('host') + req.originalUrl,
            image,
            initialData,
        });

        // 设置缓存头
        if (!isDev) {
            res.set({
                'Cache-Control': 'public, max-age=300, s-maxage=600', // 5分钟浏览器缓存，10分钟CDN缓存
                'ETag': `"${Date.now()}"`,
            });
        }

        res.send(renderedHTML);
    } catch (error) {
        console.error('SSR error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// 启动服务器
async function startServer() {
    await loadTemplate();

    app.listen(PORT, () => {
        console.log(`🚀 SSR服务器运行在 http://localhost:${PORT}`);
        console.log(`📱 环境: ${isDev ? '开发' : '生产'}`);
        console.log(`🔗 API地址: ${process.env.API_BASE_URL || 'http://localhost:3001'}`);
    });
}

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('收到SIGTERM信号，正在关闭服务器...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('收到SIGINT信号，正在关闭服务器...');
    process.exit(0);
});

startServer().catch(error => {
    console.error('启动服务器失败:', error);
    process.exit(1);
});
