import { http, HttpResponse } from 'msw'
import { createMockComment, createMockPost, createMockUser } from '../utils/test-utils'

// 用户相关API
export const userHandlers = [
    // 获取用户信息
    http.get('/api/user', () => {
        return HttpResponse.json(createMockUser())
    }),

    // 用户登录
    http.post('/api/auth/login', async ({ request }) => {
        const body = await request.json()
        if (body.email === 'test@example.com' && body.password === 'password') {
            return HttpResponse.json({
                user: createMockUser(),
                token: 'mock-jwt-token'
            })
        }
        return HttpResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
        )
    }),

    // 用户注册
    http.post('/api/auth/register', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({
            user: createMockUser({ email: body.email, username: body.username }),
            token: 'mock-jwt-token'
        })
    }),

    // 用户登出
    http.post('/api/auth/logout', () => {
        return HttpResponse.json({ message: 'Logged out successfully' })
    }),

    // 更新用户信息
    http.put('/api/user', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json(createMockUser(body))
    }),
]

// 文章相关API
export const postHandlers = [
    // 获取文章列表
    http.get('/api/posts', ({ request }) => {
        const url = new URL(request.url)
        const page = url.searchParams.get('page') || '1'
        const limit = url.searchParams.get('limit') || '10'

        const posts = Array.from({ length: parseInt(limit) }, (_, i) =>
            createMockPost({
                id: (i + 1).toString(),
                title: `Post ${i + 1}`,
                slug: `post-${i + 1}`,
            })
        )

        return HttpResponse.json({
            posts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: 100,
                totalPages: 10,
            }
        })
    }),

    // 获取单篇文章
    http.get('/api/posts/:slug', ({ params }) => {
        const { slug } = params
        return HttpResponse.json(createMockPost({ slug: slug as string }))
    }),

    // 创建文章
    http.post('/api/posts', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json(createMockPost(body))
    }),

    // 更新文章
    http.put('/api/posts/:id', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json(createMockPost(body))
    }),

    // 删除文章
    http.delete('/api/posts/:id', () => {
        return HttpResponse.json({ message: 'Post deleted successfully' })
    }),

    // 获取热门文章
    http.get('/api/posts/hot', () => {
        const hotPosts = Array.from({ length: 5 }, (_, i) =>
            createMockPost({
                id: (i + 1).toString(),
                title: `Hot Post ${i + 1}`,
                slug: `hot-post-${i + 1}`,
            })
        )
        return HttpResponse.json(hotPosts)
    }),
]

// 评论相关API
export const commentHandlers = [
    // 获取文章评论
    http.get('/api/posts/:postId/comments', ({ params }) => {
        const { postId } = params
        const comments = Array.from({ length: 3 }, (_, i) =>
            createMockComment({
                id: (i + 1).toString(),
                postId: postId as string,
                content: `Comment ${i + 1}`,
            })
        )
        return HttpResponse.json(comments)
    }),

    // 创建评论
    http.post('/api/comments', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json(createMockComment(body))
    }),

    // 删除评论
    http.delete('/api/comments/:id', () => {
        return HttpResponse.json({ message: 'Comment deleted successfully' })
    }),
]

// 标签相关API
export const tagHandlers = [
    // 获取所有标签
    http.get('/api/tags', () => {
        return HttpResponse.json([
            { id: '1', name: 'JavaScript', count: 10 },
            { id: '2', name: 'React', count: 8 },
            { id: '3', name: 'TypeScript', count: 6 },
            { id: '4', name: 'Next.js', count: 4 },
        ])
    }),

    // 获取标签下的文章
    http.get('/api/tags/:tag/posts', ({ params }) => {
        const { tag } = params
        const posts = Array.from({ length: 5 }, (_, i) =>
            createMockPost({
                id: (i + 1).toString(),
                title: `${tag} Post ${i + 1}`,
                tags: [tag as string],
            })
        )
        return HttpResponse.json(posts)
    }),
]

// 搜索相关API
export const searchHandlers = [
    // 搜索文章
    http.get('/api/search', ({ request }) => {
        const url = new URL(request.url)
        const q = url.searchParams.get('q') || ''

        const results = Array.from({ length: 3 }, (_, i) =>
            createMockPost({
                id: (i + 1).toString(),
                title: `Search Result ${i + 1} for "${q}"`,
                content: `Content containing "${q}"`,
            })
        )

        return HttpResponse.json({
            results,
            query: q,
            total: results.length,
        })
    }),
]

// AI相关API
export const aiHandlers = [
    // AI代码分析
    http.post('/api/ai/analyze', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({
            analysis: {
                complexity: 'medium',
                suggestions: ['Consider using TypeScript', 'Add error handling'],
                score: 85,
            },
            code: body.code,
        })
    }),

    // AI代码生成
    http.post('/api/ai/generate', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({
            code: `// Generated code for: ${body.prompt}\nfunction example() {\n  console.log('Hello World');\n}`,
            explanation: 'This is a simple example function',
        })
    }),
]

// 文件上传API
export const uploadHandlers = [
    // 上传图片
    http.post('/api/upload/image', async ({ request }) => {
        const formData = await request.formData()
        const file = formData.get('file') as File

        return HttpResponse.json({
            url: 'https://example.com/uploaded-image.jpg',
            filename: file.name,
            size: file.size,
        })
    }),

    // 上传文件
    http.post('/api/upload/file', async ({ request }) => {
        const formData = await request.formData()
        const file = formData.get('file') as File

        return HttpResponse.json({
            url: 'https://example.com/uploaded-file.pdf',
            filename: file.name,
            size: file.size,
        })
    }),
]

// 统计相关API
export const analyticsHandlers = [
    // 获取访问统计
    http.get('/api/analytics/visits', () => {
        return HttpResponse.json({
            total: 1000,
            today: 50,
            thisWeek: 300,
            thisMonth: 1200,
        })
    }),

    // 获取文章统计
    http.get('/api/analytics/posts', () => {
        return HttpResponse.json({
            total: 100,
            published: 80,
            drafts: 20,
            views: 5000,
        })
    }),
]

// 导出所有处理器
export const handlers = [
    ...userHandlers,
    ...postHandlers,
    ...commentHandlers,
    ...tagHandlers,
    ...searchHandlers,
    ...aiHandlers,
    ...uploadHandlers,
    ...analyticsHandlers,
]
