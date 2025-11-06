import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useArticleStore } from '../articleStore';

describe('articleStore - 简化测试', () => {
    beforeEach(() => {
        // 重置 store 状态
        useArticleStore.getState().reset();
        vi.clearAllMocks();
    });

    describe('初始状态', () => {
        it('应该有正确的初始状态', () => {
            const state = useArticleStore.getState();
            expect(state.articles).toEqual([]);
            expect(state.currentCategory).toBe('latest');
            expect(state.loading).toBe(false);
            expect(state.error).toBeNull();
            expect(state.pagination).toEqual({
                page: 1,
                pageSize: 10,
                total: 0,
                hasMore: true,
            });
            expect(state.currentArticle).toBeNull();
        });
    });

    describe('setCurrentCategory', () => {
        it('应该设置当前分类', () => {
            const { setCurrentCategory } = useArticleStore.getState();
            setCurrentCategory('frontend');
            expect(useArticleStore.getState().currentCategory).toBe('frontend');
        });
    });

    describe('setCurrentArticle', () => {
        it('应该设置当前文章', () => {
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
            expect(useArticleStore.getState().currentArticle).toEqual(mockArticle);
        });

        it('应该清除当前文章', () => {
            const { setCurrentArticle } = useArticleStore.getState();
            setCurrentArticle(null);
            expect(useArticleStore.getState().currentArticle).toBeNull();
        });
    });

    describe('reset', () => {
        it('应该重置所有状态', () => {
            const { reset } = useArticleStore.getState();

            // 设置一些状态
            useArticleStore.setState({
                articles: [{ id: '1', title: '测试' } as any],
                currentCategory: 'frontend',
                loading: true,
                error: '测试错误',
                currentArticle: { id: '1', title: '测试' } as any,
            });

            reset();

            const state = useArticleStore.getState();
            expect(state.articles).toEqual([]);
            expect(state.currentCategory).toBe('latest');
            expect(state.loading).toBe(false);
            expect(state.error).toBeNull();
            expect(state.currentArticle).toBeNull();
        });
    });
});