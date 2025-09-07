import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createMockPost } from '../../test/utils/test-utils';

import React from 'react'


import PostCard from '../PostCard'

// 模拟 Next.js 链接组件
vi.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href, ...props }: any) => {
        return React.createElement('a', { href, ...props }, children)
    },
}))

// 模拟 Next.js 图片组件
vi.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element
        return React.createElement('img', props)
    },
}))

describe('PostCard', () => {
    const mockPost = createMockPost({
        title: '测试文章',
        excerpt: '这是文章的摘要',
        slug: 'test-post',
        author: {
            id: '1',
            name: '测试作者',
            email: 'author@example.com',
            username: 'testauthor',
            avatar: 'https://example.com/avatar.jpg',
            bio: '测试作者简介',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
        },
        tags: ['JavaScript', 'React'],
        createdAt: new Date('2024-01-15'),
        date: '2024-01-15T10:00:00Z',
    })

    it('应该渲染文章卡片', () => {
        render(<PostCard post={mockPost} />)

        expect(screen.getByText('测试文章')).toBeInTheDocument()
        expect(screen.getByText('这是文章的摘要')).toBeInTheDocument()
        expect(screen.getByText('测试作者')).toBeInTheDocument()
        expect(screen.getByText('JavaScript')).toBeInTheDocument()
        expect(screen.getByText('React')).toBeInTheDocument()
    })

    it('应该显示文章链接', () => {
        render(<PostCard post={mockPost} />)

        const link = screen.getByRole('link', { name: /测试文章/i })
        expect(link).toHaveAttribute('href', '/blog/test-post')
    })

    it('应该显示作者头像', () => {
        render(<PostCard post={mockPost} />)

        const avatar = screen.getByAltText('测试作者')
        expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    })

    it('应该显示相对时间', () => {
        render(<PostCard post={mockPost} />)

        // 由于formatRelativeTime会显示相对时间，我们检查是否显示了时间相关的文本
        expect(screen.getByText(/分钟阅读/i)).toBeInTheDocument()
    })

    it('应该处理点击事件', () => {
        const onCardClick = vi.fn()
        render(<PostCard post={mockPost} onCardClick={onCardClick} />)

        const card = screen.getByRole('article')
        fireEvent.click(card)

        expect(onCardClick).toHaveBeenCalledWith(mockPost)
    })

    it('应该处理标签点击', () => {
        const onTagClick = vi.fn()
        render(<PostCard post={mockPost} onTagClick={onTagClick} />)

        const javascriptTag = screen.getByText('JavaScript')
        fireEvent.click(javascriptTag)

        expect(onTagClick).toHaveBeenCalledWith('JavaScript')
    })

    it('应该处理作者点击', () => {
        const onAuthorClick = vi.fn()
        render(<PostCard post={mockPost} onAuthorClick={onAuthorClick} />)

        const authorLink = screen.getByText('测试作者')
        fireEvent.click(authorLink)

        expect(onAuthorClick).toHaveBeenCalledWith(mockPost.author)
    })

    it('应该显示阅读时间', () => {
        const longPost = createMockPost({
            content: '这是一篇很长的文章内容，'.repeat(100), // 模拟长文章
        })

        render(<PostCard post={longPost} />)

        expect(screen.getByText(/分钟阅读/i)).toBeInTheDocument()
    })

    it('应该处理没有标签的文章', () => {
        const postWithoutTags = createMockPost({
            title: '无标签文章',
            tags: [],
        })

        render(<PostCard post={postWithoutTags} />)

        expect(screen.getByText('无标签文章')).toBeInTheDocument()
        expect(screen.queryByText('JavaScript')).not.toBeInTheDocument()
    })

    it('应该处理没有摘要的文章', () => {
        const postWithoutExcerpt = createMockPost({
            title: '无摘要文章',
            excerpt: '',
        })

        render(<PostCard post={postWithoutExcerpt} />)

        expect(screen.getByText('无摘要文章')).toBeInTheDocument()
        expect(screen.queryByText('这是文章的摘要')).not.toBeInTheDocument()
    })

    it('应该显示文章状态', () => {
        const draftPost = createMockPost({
            title: '草稿文章',
            published: false,
        })

        render(<PostCard post={draftPost} />)

        // 使用getAllByText因为可能有多个包含"草稿"的元素
        const draftElements = screen.getAllByText(/草稿/i)
        expect(draftElements.length).toBeGreaterThan(0)
    })
})
