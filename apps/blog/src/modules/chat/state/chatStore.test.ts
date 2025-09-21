import { beforeEach, describe, expect, it } from 'vitest';

import { useChatStore } from './chatStore';
import type { ChatConversationSummary, ChatMessage } from '../types';

const resetStore = () => {
  useChatStore.setState((state) => ({
    ...state,
    messages: [],
    conversations: [],
    activeConversationId: null,
    selectedModel: null,
    connectionStatus: 'disconnected',
    error: null,
    isBootstrapped: false,
  }));
};

describe('chatStore', () => {
  beforeEach(() => {
    resetStore();
  });

  const createUserMessage = (content: string): ChatMessage => ({
    id: `user-${Date.now()}`,
    role: 'user',
    content,
    createdAt: new Date().toISOString(),
    status: 'complete'
  });

  const createConversation = (id: string, title = '会话'): ChatConversationSummary => ({
    id,
    title,
    model: 'gpt-4',
    messageCount: 1,
    lastMessage: 'hello',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  it('bootstraps hydration state and updates model', () => {
    const store = useChatStore.getState();
    expect(store.isBootstrapped).toBe(false);

    useChatStore.getState().bootstrap({
      messages: [createUserMessage('hi')],
      conversations: [createConversation('conv-1')],
      activeConversationId: 'conv-1'
    }, 'gpt-4');

    const hydrated = useChatStore.getState();
    expect(hydrated.isBootstrapped).toBe(true);
    expect(hydrated.messages).toHaveLength(1);
    expect(hydrated.conversations).toHaveLength(1);
    expect(hydrated.activeConversationId).toBe('conv-1');
    expect(hydrated.selectedModel).toBe('gpt-4');
  });

  it('handles assistant streaming lifecycle', () => {
    const store = useChatStore.getState();

    store.pushUserMessage(createUserMessage('问题'));
    store.startAssistantMessage('assistant-1');
    store.appendAssistantChunk('回答');
    store.appendAssistantChunk(' 继续');

    let messages = useChatStore.getState().messages;
    expect(messages).toHaveLength(2);
    const assistant = messages.at(-1);
    expect(assistant?.content).toBe('回答 继续');
    expect(assistant?.status).toBe('streaming');

    store.finalizeAssistantMessage();
    expect(useChatStore.getState().messages.at(-1)?.status).toBe('complete');

    store.startAssistantMessage('assistant-2');
    store.markAssistantError('网络错误');
    const errored = useChatStore.getState().messages.at(-1);
    expect(errored?.status).toBe('error');
    expect(errored?.error).toBe('网络错误');
    expect(useChatStore.getState().error).toBe('网络错误');
  });

  it('upserts and removes conversations consistently', () => {
    const { upsertConversation, removeConversation, setMessages, setActiveConversation } = useChatStore.getState();

    upsertConversation(createConversation('conv-1', '第一次'));
    upsertConversation(createConversation('conv-2', '第二次'));
    upsertConversation(createConversation('conv-1', '第一次(更新)'));

    let conversations = useChatStore.getState().conversations;
    expect(conversations).toHaveLength(2);
    expect(conversations.find(c => c.id === 'conv-1')?.title).toBe('第一次(更新)');

    // Removing active conversation should clear messages and reset active id
    setActiveConversation('conv-2');
    setMessages([createUserMessage('hi')]);
    removeConversation('conv-2');

    const stateAfterRemoval = useChatStore.getState();
    expect(stateAfterRemoval.activeConversationId).toBeNull();
    expect(stateAfterRemoval.messages).toHaveLength(0);
    expect(stateAfterRemoval.conversations).toHaveLength(1);
  });
});
