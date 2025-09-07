import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../Button';

describe('Button组件', () => {
    it('应该正确渲染按钮文本', () => {
        render(<Button>点击我</Button>);
        expect(screen.getByText('点击我')).toBeInTheDocument();
    });

    it('应该应用正确的CSS类', () => {
        render(<Button variant="primary">按钮</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('btn-primary');
    });

    it('应该处理点击事件', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>点击</Button>);

        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('应该在禁用状态下不触发点击事件', () => {
        const handleClick = vi.fn();
        render(<Button disabled onClick={handleClick}>禁用按钮</Button>);

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();

        fireEvent.click(button);
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('应该支持不同的尺寸', () => {
        const { rerender } = render(<Button size="small">小按钮</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn-small');

        rerender(<Button size="large">大按钮</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn-large');
    });

    it('应该支持加载状态', () => {
        render(<Button loading>加载中</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('btn-loading');
        expect(button).toBeDisabled();
    });
});
