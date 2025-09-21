import type { ComponentProps } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ChatComposer } from '../components/ChatComposer';

const renderComposer = (props: Partial<ComponentProps<typeof ChatComposer>> = {}) => {
    const onSend = vi.fn();
    const utils = render(
        <ChatComposer
            onSend={onSend}
            disabled={props.disabled ?? false}
            placeholder={props.placeholder ?? '输入消息'}
        />
    );
    const textarea = screen.getByPlaceholderText(props.placeholder ?? '输入消息') as HTMLTextAreaElement;
    const button = screen.getByRole('button', { name: '发送' });
    return { onSend, utils, textarea, button };
};

describe('ChatComposer', () => {
    it('sends trimmed message on button click', () => {
        const { onSend, textarea, button } = renderComposer();

        fireEvent.change(textarea, { target: { value: ' 你好，AI ' } });
        fireEvent.click(button);

        expect(onSend).toHaveBeenCalledTimes(1);
        expect(onSend).toHaveBeenCalledWith('你好，AI');
        expect(textarea.value).toBe('');
    });

    it('submits message when pressing Enter without Shift', () => {
        const { onSend, textarea } = renderComposer();

        fireEvent.change(textarea, { target: { value: '快捷发送' } });
        fireEvent.keyDown(textarea, { key: 'Enter' });

        expect(onSend).toHaveBeenCalledWith('快捷发送');
    });

    it('does not submit when disabled', () => {
        const { onSend, textarea, button } = renderComposer({ disabled: true });

        fireEvent.change(textarea, { target: { value: '你好' } });
        fireEvent.click(button);

        expect(onSend).not.toHaveBeenCalled();
        expect(button).toBeDisabled();
    });
});
