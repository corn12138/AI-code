import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ArticleCard from '@/components/ArticleCard'

import React from 'react'


// 模拟 Next.js 组件
vi.mock('next/image', () => ({
    default: ({ src, alt, ...props }: any) => {
        return React.createElement('img', { src, alt, ...props })
    },
}))

vi.mock('next/link', () => ({
    default: ({ href, children, ...props }: any) => {
        return React.createElement('a', { href, ...props }, children)
    },
}))

// 模拟工具函数
vi.mock('@/lib/utils', () => ({
    formatRelativeTime: vi.fn((date) => '2小时前'),
    truncateText: vi.fn((text, length) => text.substring(0, length)),
}))

// 模拟数据
const mockArticle = {
    id: '1',
    slug: 'test-article',
    title: '测试文章标题',
    excerpt: '这是一篇测试文章的摘要内容',
    content: '这是文章的完整内容，包含很多文字...',
    coverImage: 'https://example.com/image.jpg',
    publishedAt: '2025-01-27T10:00:00Z',
    createdAt: '2025-01-27T10:00:00Z',
    updatedAt: '2025-01-27T10:00:00Z',
    viewCount: 100,
    likeCount: 50,
    commentCount: 10,
    readingTime: 5,
    author: {
        id: '1',
        username: '测试作者',
        email: 'author@example.com',
        avatar: 'https://example.com/avatar.jpg',
    },
    tags: [
        { id: '1', name: '技术', slug: 'tech' },
        { id: '2', name: '编程', slug: 'programming' },
    ],
    comments: [],
}

describe('ArticleCard 组件', () => {
    describe('渲染测试', () => {
        it('应该正确渲染文章卡片', () => {
            render(<ArticleCard article={mockArticle} />)

            // 检查文章标题
            expect(screen.getByText('测试文章标题')).toBeInTheDocument()

            // 检查文章摘要
            expect(screen.getByText('这是一篇测试文章的摘要内容')).toBeInTheDocument()

            // 检查作者信息
            expect(screen.getByText('测试作者')).toBeInTheDocument()

            // 检查浏览量
            expect(screen.getByText('100')).toBeInTheDocument()
        })

        it('应该显示文章封面图片', () => {
            render(<ArticleCard article={mockArticle} />)

            const coverImage = screen.getByAltText('测试文章标题')
            expect(coverImage).toBeInTheDocument()
            expect(coverImage).toHaveAttribute('src', 'https://example.com/image.jpg')
        })

        it('应该显示文章标签', () => {
            render(<ArticleCard article={mockArticle} />)

            expect(screen.getByText('技术')).toBeInTheDocument()
            expect(screen.getByText('编程')).toBeInTheDocument()
        })

        it('应该在没有封面图片时显示默认图片', () => {
            const articleWithoutCover = {
                ...mockArticle,
                coverImage: undefined,
            }

            render(<ArticleCard article={articleWithoutCover} />)

            // 检查是否没有封面图片容器
            expect(screen.queryByAltText('测试文章标题')).not.toBeInTheDocument()
        })

        it('应该在没有摘要时使用内容截取', () => {
            const articleWithoutExcerpt = {
                ...mockArticle,
                excerpt: undefined,
            }

            render(<ArticleCard article={articleWithoutExcerpt} />)

            expect(screen.getByText(/这是文章的完整内容/)).toBeInTheDocument()
        })
    })

    describe('链接测试', () => {
        it('应该包含正确的文章链接', () => {
            render(<ArticleCard article={mockArticle} />)

            const articleLink = screen.getByRole('link', { name: /测试文章标题/i })
            expect(articleLink).toHaveAttribute('href', '/blog/test-article')
        })
    })

    describe('变体测试', () => {
        it('应该支持 highlight 属性', () => {
            render(<ArticleCard article={mockArticle} highlight={true} />)

            const articleCard = screen.getByText('测试文章标题').closest('.card')
            expect(articleCard).toHaveClass('ring-2', 'ring-primary-500', 'bg-primary-50')
        })

        it('应该支持默认 highlight 属性', () => {
            render(<ArticleCard article={mockArticle} />)

            const articleCard = screen.getByText('测试文章标题').closest('.card')
            expect(articleCard).not.toHaveClass('ring-2', 'ring-primary-500', 'bg-primary-50')
        })
    })

    describe('交互测试', () => {
        it('应该在悬停时显示阴影效果', () => {
            render(<ArticleCard article={mockArticle} />)

            const articleCard = screen.getByText('测试文章标题').closest('.card')
            expect(articleCard).toHaveClass('group')
        })

        it('应该在悬停时缩放封面图片', () => {
            render(<ArticleCard article={mockArticle} />)

            const coverImage = screen.getByAltText('测试文章标题')
            expect(coverImage).toHaveClass('group-hover:scale-105')
        })

        it('应该在悬停时改变标题颜色', () => {
            render(<ArticleCard article={mockArticle} />)

            const title = screen.getByText('测试文章标题')
            expect(title).toHaveClass('group-hover:text-primary-600')
        })
    })

    describe('可访问性测试', () => {
        it('应该包含正确的 alt 文本', () => {
            render(<ArticleCard article={mockArticle} />)

            const coverImage = screen.getByAltText('测试文章标题')
            expect(coverImage).toBeInTheDocument()

            const authorAvatar = screen.getByAltText('测试作者')
            expect(authorAvatar).toBeInTheDocument()
        })

        it('应该包含正确的语义化标签', () => {
            render(<ArticleCard article={mockArticle} />)

            // 检查链接元素
            const link = screen.getByRole('link', { name: /测试文章标题/i })
            expect(link).toBeInTheDocument()
            expect(link).toHaveAttribute('href', '/blog/test-article')
        })

        it('应该支持键盘导航', () => {
            render(<ArticleCard article={mockArticle} />)

            const articleLink = screen.getByRole('link', { name: /测试文章标题/i })

            articleLink.focus()
            expect(articleLink).toHaveFocus()

            fireEvent.keyDown(articleLink, { key: 'Enter' })
            // 这里可以添加导航验证
        })
    })

    describe('边界情况', () => {
        it('应该处理空标签数组', () => {
            const articleWithoutTags = {
                ...mockArticle,
                tags: [],
            }

            render(<ArticleCard article={articleWithoutTags} />)

            expect(screen.queryByText('技术')).not.toBeInTheDocument()
            expect(screen.queryByText('编程')).not.toBeInTheDocument()
        })

        it('应该处理空作者信息', () => {
            const articleWithoutAuthor = {
                ...mockArticle,
                author: {
                    id: '1',
                    username: '',
                    avatar: undefined,
                },
            }

            render(<ArticleCard article={articleWithoutAuthor} />)

            expect(screen.queryByText('测试作者')).not.toBeInTheDocument()
        })

        it('应该处理很长的标题', () => {
            const articleWithLongTitle = {
                ...mockArticle,
                title: '这是一个非常非常非常非常非常非常非常非常非常非常长的文章标题，可能会超出容器的宽度限制',
            }

            render(<ArticleCard article={articleWithLongTitle} />)

            expect(screen.getByText(/这是一个非常非常非常非常非常非常非常非常非常非常长的文章标题/)).toBeInTheDocument()
        })

        it('应该处理特殊字符', () => {
            const articleWithSpecialChars = {
                ...mockArticle,
                title: '文章标题包含特殊字符：@#$%^&*()',
                author: {
                    ...mockArticle.author,
                    username: '作者@#$%^&*()',
                },
            }

            render(<ArticleCard article={articleWithSpecialChars} />)

            expect(screen.getByText('文章标题包含特殊字符：@#$%^&*()')).toBeInTheDocument()
            expect(screen.getByText('作者@#$%^&*()')).toBeInTheDocument()
        })
    })

    describe('样式测试', () => {
        it('应该包含正确的 CSS 类名', () => {
            render(<ArticleCard article={mockArticle} />)

            const articleCard = screen.getByText('测试文章标题').closest('.card')
            expect(articleCard).toHaveClass('card', 'group')
        })

        it('应该支持高亮样式', () => {
            render(<ArticleCard article={mockArticle} highlight={true} />)

            const articleCard = screen.getByText('测试文章标题').closest('.card')
            expect(articleCard).toHaveClass('ring-2', 'ring-primary-500', 'bg-primary-50')
        })
    })

    describe('性能测试', () => {
        it('应该正确处理大量标签', () => {
            const articleWithManyTags = {
                ...mockArticle,
                tags: Array.from({ length: 20 }, (_, i) => ({
                    id: String(i + 1),
                    name: `标签${i + 1}`,
                    slug: `tag-${i + 1}`,
                })),
            }

            render(<ArticleCard article={articleWithManyTags} />)

            // 应该只显示前几个标签
            expect(screen.getByText('标签1')).toBeInTheDocument()
            expect(screen.getByText('标签2')).toBeInTheDocument()
            expect(screen.queryByText('标签20')).not.toBeInTheDocument()
        })

        it('应该处理大数字的浏览量', () => {
            const articleWithLargeViewCount = {
                ...mockArticle,
                viewCount: 999999,
            }

            render(<ArticleCard article={articleWithLargeViewCount} />)

            expect(screen.getByText('999999')).toBeInTheDocument()
        })
    })
})
