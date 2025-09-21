import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import type { ChatConversationSummary } from '../../types';
import { ChatSidebar } from '../components/ChatSidebar';

const conversations: ChatConversationSummary[] = [
    {
        id: 'conv-1',
        title: '第一次对话',
        model: 'qwen/qwen2.5-7b-instruct/bf-16',
        messageCount: 3,
        lastMessage: '你好',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'conv-2',
        title: '第二次对话',
        model: 'google/gemma-3-27b-instruct/bf-16',
        messageCount: 1,
        lastMessage: '再见',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

describe('ChatSidebar', () => {
    const onSelect = vi.fn();
    const onDelete = vi.fn();
    const onCreate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders conversations and highlights the active one', () => {
        render(
            <ChatSidebar
                conversations={conversations}
                activeConversationId="conv-2"
                isLoading={false}
                onSelect={onSelect}
                onCreateDraft={onCreate}
                onDelete={onDelete}
            />
        );

        expect(screen.getByText('第一次对话')).toBeInTheDocument();
        expect(screen.getByText('第二次对话')).toBeInTheDocument();

        const activeItem = screen.getByRole('button', { name: /第二次对话/ });
        expect(activeItem).toHaveClass('bg-indigo-500/10');
    });

    it('calls callbacks when selecting or deleting', () => {
        render(
            <ChatSidebar
                conversations={conversations}
                activeConversationId={null}
                isLoading={false}
                onSelect={onSelect}
                onCreateDraft={onCreate}
                onDelete={onDelete}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: /第一次对话/ }));
        expect(onSelect).toHaveBeenCalledWith('conv-1');

        fireEvent.click(screen.getByText('新对话'));
        expect(onCreate).toHaveBeenCalled();

        fireEvent.click(screen.getAllByRole('button', { name: '删除' })[0]);
        expect(onDelete).toHaveBeenCalledWith('conv-1');
    });
});
