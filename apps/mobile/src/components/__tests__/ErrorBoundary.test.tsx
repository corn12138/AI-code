import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
    console.error = vi.fn();
});

afterAll(() => {
    console.error = originalError;
});

// 创建一个会抛出错误的组件
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
        throw new Error('测试错误');
    }
    return <div>正常组件</div>;
};

describe('ErrorBoundary组件', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('应该正常渲染子组件', () => {
        render(
            <ErrorBoundary>
                <div>测试内容</div>
            </ErrorBoundary>
        );

        expect(screen.getByText('测试内容')).toBeInTheDocument();
    });

    it('应该捕获子组件错误并显示错误UI', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText('页面出错了')).toBeInTheDocument();
        expect(screen.getByText('抱歉，页面遇到了一个错误')).toBeInTheDocument();
    });

    it('应该显示错误详情', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText('错误详情')).toBeInTheDocument();
    });

    it('应该处理重新加载功能', () => {
        const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => { });

        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        const reloadButton = screen.getByText('重新加载');
        reloadButton.click();

        expect(reloadSpy).toHaveBeenCalled();
        reloadSpy.mockRestore();
    });

    it('应该处理返回首页功能', () => {
        const mockNavigate = vi.fn();
        vi.mock('react-router-dom', () => ({
            useNavigate: () => mockNavigate,
        }));

        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        const homeButton = screen.getByText('返回首页');
        homeButton.click();

        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('应该记录错误信息', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('应该显示错误边界状态', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText('错误状态')).toBeInTheDocument();
    });

    it('应该处理异步错误', async () => {
        const AsyncErrorComponent = () => {
            throw new Promise((_, reject) => {
                setTimeout(() => reject(new Error('异步错误')), 0);
            });
        };

        render(
            <ErrorBoundary>
                <AsyncErrorComponent />
            </ErrorBoundary>
        );

        // 等待异步错误被捕获
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(screen.getByText('页面出错了')).toBeInTheDocument();
    });

    it('应该重置错误状态', () => {
        const { rerender } = render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText('页面出错了')).toBeInTheDocument();

        // 重新渲染，不抛出错误
        rerender(
            <ErrorBoundary>
                <ThrowError shouldThrow={false} />
            </ErrorBoundary>
        );

        expect(screen.getByText('正常组件')).toBeInTheDocument();
    });
});
