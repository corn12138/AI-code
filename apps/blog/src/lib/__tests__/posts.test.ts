import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAllSlugs, getPostBySlug, getPosts, getRelatedPosts } from '../posts';



// 模拟 fs 模块
vi.mock('fs', () => ({
    default: {
        readdirSync: vi.fn(),
        readFileSync: vi.fn(),
    },
}))

// 模拟 path 模块
vi.mock('path', () => ({
    default: {
        join: vi.fn(),
    },
}))

// 模拟 gray-matter
vi.mock('gray-matter', () => ({
    default: vi.fn(),
}))

// 模拟 remark
vi.mock('remark', () => ({
    remark: vi.fn(() => ({
        use: vi.fn(() => ({
            process: vi.fn(),
        })),
    })),
}))

// 模拟 remark-html
vi.mock('remark-html', () => ({
    default: vi.fn(),
}))

describe('posts', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getPosts', () => {
        it('应该获取所有文章', async () => {
            const fs = await import('fs')
            const path = await import('path')
            const matter = await import('gray-matter')

            const mockFileNames = ['post1.md', 'post2.md']
            const mockPost1 = { title: 'Post 1', date: '2024-01-01' }
            const mockPost2 = { title: 'Post 2', date: '2024-01-02' }

            vi.mocked(fs.default.readdirSync).mockReturnValue(mockFileNames as any)
            vi.mocked(path.default.join).mockReturnValue('/mock/path')
            vi.mocked(fs.default.readFileSync).mockReturnValueOnce('content1' as any)
            vi.mocked(fs.default.readFileSync).mockReturnValueOnce('content2' as any)
            vi.mocked(matter.default).mockReturnValueOnce({ data: mockPost1 } as any)
            vi.mocked(matter.default).mockReturnValueOnce({ data: mockPost2 } as any)

            const result = await getPosts()

            expect(fs.default.readdirSync).toHaveBeenCalled()
            expect(result).toHaveLength(2)
            // 由于按日期降序排列，post2（日期更新）应该在前面
            expect(result[0]).toEqual({
                id: 'post2',
                slug: 'post2',
                ...mockPost2,
            })
            expect(result[1]).toEqual({
                id: 'post1',
                slug: 'post1',
                ...mockPost1,
            })
        })

        it('应该按日期排序文章', async () => {
            const fs = await import('fs')
            const path = await import('path')
            const matter = await import('gray-matter')

            const mockFileNames = ['post1.md', 'post2.md']
            const mockPost1 = { title: 'Post 1', date: '2024-01-01' }
            const mockPost2 = { title: 'Post 2', date: '2024-01-02' }

            vi.mocked(fs.default.readdirSync).mockReturnValue(mockFileNames as any)
            vi.mocked(path.default.join).mockReturnValue('/mock/path')
            vi.mocked(fs.default.readFileSync).mockReturnValue('content' as any)
            vi.mocked(matter.default).mockReturnValueOnce({ data: mockPost1 } as any)
            vi.mocked(matter.default).mockReturnValueOnce({ data: mockPost2 } as any)

            const result = await getPosts()

            // 应该按日期降序排列（最新的在前）
            expect(result[0].date).toBe('2024-01-02')
            expect(result[1].date).toBe('2024-01-01')
        })
    })

    describe('getPostBySlug', () => {
        it('应该根据slug获取文章', async () => {
            const fs = await import('fs')
            const path = await import('path')
            const matter = await import('gray-matter')
            const remark = await import('remark')

            const mockPostData = { title: 'Test Post', date: '2024-01-01' }
            const mockContent = '# Test Content'

            vi.mocked(path.default.join).mockReturnValue('/mock/path/test-post.md')
            vi.mocked(fs.default.readFileSync).mockReturnValue(mockContent as any)
            vi.mocked(matter.default).mockReturnValue({
                data: mockPostData,
                content: mockContent,
            } as any)
            vi.mocked(remark.remark).mockReturnValue({
                use: vi.fn(() => ({
                    process: vi.fn().mockResolvedValue({ toString: () => '<h1>Test Content</h1>' }),
                })),
            } as any)

            const result = await getPostBySlug('test-post')

            expect(fs.default.readFileSync).toHaveBeenCalledWith('/mock/path/test-post.md', 'utf8')
            expect(result).toEqual({
                id: 'test-post',
                slug: 'test-post',
                content: '<h1>Test Content</h1>',
                ...mockPostData,
            })
        })

        it('应该处理文章不存在的情况', async () => {
            const fs = await import('fs')
            const path = await import('path')

            vi.mocked(path.default.join).mockReturnValue('/mock/path/non-existent.md')
            vi.mocked(fs.default.readFileSync).mockImplementation(() => {
                throw new Error('File not found')
            })

            const result = await getPostBySlug('non-existent')

            expect(result).toBeNull()
        })
    })

    describe('getAllSlugs', () => {
        it('应该获取所有文章的slug', async () => {
            const fs = await import('fs')

            const mockFileNames = ['post1.md', 'post2.md', 'post3.md']
            vi.mocked(fs.default.readdirSync).mockReturnValue(mockFileNames as any)

            const result = await getAllSlugs()

            expect(fs.default.readdirSync).toHaveBeenCalled()
            expect(result).toEqual(['post1', 'post2', 'post3'])
        })
    })

    describe('getRelatedPosts', () => {
        it('应该返回空数组（暂时实现）', async () => {
            const result = await getRelatedPosts('current-post', ['tag1', 'tag2'])

            expect(result).toEqual([])
        })
    })
})
