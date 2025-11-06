import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useArticleStore } from '../articleStore';

// Mock fetch 函数
global.fetch = vi.fn();

describe('articleStore - 完整测试', () => {
    beforeEach(() => {
        // 重置 store 状态
        useArticleStore.getState().reset();
        vi.clearAllMocks();

        // Mock fetch 返回错误，强制使用模拟数据
        vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
    });

    describe('状态管理', () => {
        it('应该正确管理文章列表状态', () => {
            const { setCurrentArticle } = useArticleStore.getState();

            const mockArticle = {
                id: '1',
                title: '测试文章',
                summary: '测试摘要',
                content: '测试内容',
                category: 'frontend' as const,
                author: '测试作者',
                publishDate: '2023-01-01T00:00:00.000Z',
                readTime: 5,
                tags: ['测试', '前端'],
                imageUrl: 'https://example.com/image.jpg',
                isHot: true,
            };

            setCurrentArticle(mockArticle);

            const state = useArticleStore.getState();
            expect(state.currentArticle).toEqual(mockArticle);
        });

        it('应该正确管理分类状态', () => {
            const { setCurrentCategory } = useArticleStore.getState();

            setCurrentCategory('backend');
            expect(useArticleStore.getState().currentCategory).toBe('backend');

            setCurrentCategory('ai');
            expect(useArticleStore.getState().currentCategory).toBe('ai');
        });

        it('应该正确重置状态', () => {
            const { reset, setCurrentArticle, setCurrentCategory } = useArticleStore.getState();

            // 设置一些状态
            setCurrentCategory('frontend');
            setCurrentArticle({
                id: '1',
                title: '测试',
                summary: '测试',
                content: '测试',
                category: 'frontend',
                author: '测试',
                publishDate: '2023-01-01T00:00:00.000Z',
                readTime: 5,
                tags: ['测试'],
            } as any);

            reset();

            const state = useArticleStore.getState();
            expect(state.currentCategory).toBe('latest');
            expect(state.currentArticle).toBeNull();
            expect(state.articles).toEqual([]);
            expect(state.loading).toBe(false);
            expect(state.error).toBeNull();
        });
    });

    describe('分页状态', () => {
        it('应该有正确的初始分页状态', () => {
            const state = useArticleStore.getState();
            expect(state.pagination).toEqual({
                page: 1,
                pageSize: 10,
                total: 0,
                hasMore: true,
            });
        });
    });

    describe('错误处理', () => {
        it('应该正确处理错误状态', () => {
            const { reset } = useArticleStore.getState();

            // 模拟错误状态
            useArticleStore.setState({
                error: '测试错误',
                loading: false,
            });

            expect(useArticleStore.getState().error).toBe('测试错误');

            reset();
            expect(useArticleStore.getState().error).toBeNull();
        });
    });
});
