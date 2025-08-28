'use client';

import React, { createContext, useContext, useReducer, ReactNode, useCallback, useEffect } from 'react';
import { LLMManager } from '../../../services/llm/LLMManager';
import { ToolRegistry } from '../../../services/tools/ToolRegistry';

// Types
export interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    tokens?: number;
    cost?: number;
    tools?: string[];
    attachments?: Attachment[];
    thinking?: string;
    executionTime?: number;
  };
  status?: 'sending' | 'sent' | 'received' | 'error' | 'cancelled';
  streaming?: boolean;
  error?: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'document' | 'code' | 'audio' | 'video';
  name: string;
  url: string;
  size: number;
  mimeType?: string;
  metadata?: Record<string, any>;
}

export interface ChatSettings {
  selectedModel: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  presencePenalty: number;
  frequencyPenalty: number;
  systemPrompt: string;
  enableTools: boolean;
  enableStreaming: boolean;
  enableSpeech: boolean;
  autoScroll: boolean;
  darkMode: boolean;
  language: string;
}

export interface ChatMetrics {
  totalMessages: number;
  totalTokens: number;
  totalCost: number;
  averageResponseTime: number;
  successRate: number;
  errorCount: number;
  toolUsageCount: number;
  sessionStartTime: Date;
}

// State interface
export interface ChatState {
  messages: Message[];
  attachments: Attachment[];
  settings: ChatSettings;
  metrics: ChatMetrics;
  isLoading: boolean;
  isConnected: boolean;
  streamingMessage: string;
  error: string | null;
  selectedThread: string | null;
  threads: ChatThread[];
}

export interface ChatThread {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  lastMessage?: string;
  tags: string[];
}

// Action types
type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<Message> } }
  | { type: 'DELETE_MESSAGE'; payload: string }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_ATTACHMENT'; payload: Attachment }
  | { type: 'REMOVE_ATTACHMENT'; payload: string }
  | { type: 'SET_ATTACHMENTS'; payload: Attachment[] }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<ChatSettings> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_STREAMING_MESSAGE'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_METRICS'; payload: Partial<ChatMetrics> }
  | { type: 'SELECT_THREAD'; payload: string | null }
  | { type: 'ADD_THREAD'; payload: ChatThread }
  | { type: 'UPDATE_THREAD'; payload: { id: string; updates: Partial<ChatThread> } }
  | { type: 'DELETE_THREAD'; payload: string }
  | { type: 'CLEAR_CHAT' }
  | { type: 'RESET_STATE' };

// Initial state
const initialSettings: ChatSettings = {
  selectedModel: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1,
  presencePenalty: 0,
  frequencyPenalty: 0,
  systemPrompt: 'You are a helpful AI assistant.',
  enableTools: true,
  enableStreaming: true,
  enableSpeech: true,
  autoScroll: true,
  darkMode: false,
  language: 'en'
};

const initialMetrics: ChatMetrics = {
  totalMessages: 0,
  totalTokens: 0,
  totalCost: 0,
  averageResponseTime: 0,
  successRate: 100,
  errorCount: 0,
  toolUsageCount: 0,
  sessionStartTime: new Date()
};

const initialState: ChatState = {
  messages: [],
  attachments: [],
  settings: initialSettings,
  metrics: initialMetrics,
  isLoading: false,
  isConnected: false,
  streamingMessage: '',
  error: null,
  selectedThread: null,
  threads: []
};

// Reducer
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        metrics: {
          ...state.metrics,
          totalMessages: state.metrics.totalMessages + 1,
          totalTokens: state.metrics.totalTokens + (action.payload.metadata?.tokens || 0),
          totalCost: state.metrics.totalCost + (action.payload.metadata?.cost || 0)
        }
      };

    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id ? { ...msg, ...action.payload.updates } : msg
        )
      };

    case 'DELETE_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter(msg => msg.id !== action.payload)
      };

    case 'SET_MESSAGES':
      return {
        ...state,
        messages: action.payload
      };

    case 'ADD_ATTACHMENT':
      return {
        ...state,
        attachments: [...state.attachments, action.payload]
      };

    case 'REMOVE_ATTACHMENT':
      return {
        ...state,
        attachments: state.attachments.filter(att => att.id !== action.payload)
      };

    case 'SET_ATTACHMENTS':
      return {
        ...state,
        attachments: action.payload
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_CONNECTED':
      return {
        ...state,
        isConnected: action.payload
      };

    case 'SET_STREAMING_MESSAGE':
      return {
        ...state,
        streamingMessage: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        metrics: action.payload 
          ? { ...state.metrics, errorCount: state.metrics.errorCount + 1 }
          : state.metrics
      };

    case 'UPDATE_METRICS':
      return {
        ...state,
        metrics: { ...state.metrics, ...action.payload }
      };

    case 'SELECT_THREAD':
      return {
        ...state,
        selectedThread: action.payload
      };

    case 'ADD_THREAD':
      return {
        ...state,
        threads: [...state.threads, action.payload]
      };

    case 'UPDATE_THREAD':
      return {
        ...state,
        threads: state.threads.map(thread =>
          thread.id === action.payload.id ? { ...thread, ...action.payload.updates } : thread
        )
      };

    case 'DELETE_THREAD':
      return {
        ...state,
        threads: state.threads.filter(thread => thread.id !== action.payload)
      };

    case 'CLEAR_CHAT':
      return {
        ...state,
        messages: [],
        attachments: [],
        streamingMessage: '',
        error: null
      };

    case 'RESET_STATE':
      return {
        ...initialState,
        settings: state.settings, // Preserve user settings
        threads: state.threads // Preserve thread history
      };

    default:
      return state;
  }
}

// Context interface
interface ChatContextType {
  state: ChatState;
  actions: {
    addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
    updateMessage: (id: string, updates: Partial<Message>) => void;
    deleteMessage: (id: string) => void;
    sendMessage: (content: string, attachments?: Attachment[]) => Promise<void>;
    addAttachment: (attachment: Attachment) => void;
    removeAttachment: (id: string) => void;
    updateSettings: (settings: Partial<ChatSettings>) => void;
    clearChat: () => void;
    retryMessage: (messageId: string) => Promise<void>;
    cancelMessage: (messageId: string) => void;
    createThread: (title?: string) => void;
    selectThread: (threadId: string | null) => void;
    deleteThread: (threadId: string) => void;
    exportChat: () => string;
    importChat: (data: string) => void;
  };
  services: {
    llmManager: LLMManager;
    toolRegistry: ToolRegistry;
  };
}

// Create context
const ChatContext = createContext<ChatContextType | null>(null);

// Provider component
interface ChatProviderProps {
  children: ReactNode;
  llmManager?: LLMManager;
  toolRegistry?: ToolRegistry;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ 
  children, 
  llmManager = new LLMManager({}),
  toolRegistry = new ToolRegistry()
}) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Initialize services
  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('chat-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
      } catch (error) {
        console.warn('Failed to load saved settings:', error);
      }
    }

    // Load threads from localStorage
    const savedThreads = localStorage.getItem('chat-threads');
    if (savedThreads) {
      try {
        const threads = JSON.parse(savedThreads);
        threads.forEach((thread: ChatThread) => {
          dispatch({ type: 'ADD_THREAD', payload: thread });
        });
      } catch (error) {
        console.warn('Failed to load saved threads:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('chat-settings', JSON.stringify(state.settings));
  }, [state.settings]);

  // Save threads to localStorage
  useEffect(() => {
    localStorage.setItem('chat-threads', JSON.stringify(state.threads));
  }, [state.threads]);

  // Actions
  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const fullMessage: Message = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    dispatch({ type: 'ADD_MESSAGE', payload: fullMessage });
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    dispatch({ type: 'UPDATE_MESSAGE', payload: { id, updates } });
  }, []);

  const deleteMessage = useCallback((id: string) => {
    dispatch({ type: 'DELETE_MESSAGE', payload: id });
  }, []);

  const sendMessage = useCallback(async (content: string, attachments?: Attachment[]) => {
    const startTime = Date.now();
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: 'user',
        content,
        timestamp: new Date(),
        metadata: { attachments: attachments?.length ? attachments : undefined },
        status: 'sending'
      };

      dispatch({ type: 'ADD_MESSAGE', payload: userMessage });

      // Send to LLM
      const response = await llmManager.complete({
        messages: [
          { role: 'system', content: state.settings.systemPrompt },
          ...state.messages.map(msg => ({
            role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.content
          })),
          { role: 'user', content }
        ],
        model: state.settings.selectedModel,
        temperature: state.settings.temperature,
        maxTokens: state.settings.maxTokens,
        stream: state.settings.enableStreaming,
        tools: state.settings.enableTools ? Array.from(toolRegistry.getAvailableTools().keys()) : undefined
      });

      // Update user message status
      dispatch({ type: 'UPDATE_MESSAGE', payload: { 
        id: userMessage.id, 
        updates: { status: 'sent' } 
      }});

      // Add assistant response
      const assistantMessage: Message = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        metadata: {
          model: response.model,
          tokens: response.usage?.totalTokens,
          cost: response.cost,
          tools: response.toolCalls?.map(tc => tc.name),
          executionTime: Date.now() - startTime
        },
        status: 'received'
      };

      dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });

      // Update metrics
      dispatch({ type: 'UPDATE_METRICS', payload: {
        averageResponseTime: (state.metrics.averageResponseTime + (Date.now() - startTime)) / 2,
        successRate: (state.metrics.successRate * state.metrics.totalMessages + 100) / (state.metrics.totalMessages + 1),
        toolUsageCount: state.metrics.toolUsageCount + (response.toolCalls?.length || 0)
      }});

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      
      // Update user message with error status
      dispatch({ type: 'UPDATE_MESSAGE', payload: { 
        id: userMessage.id, 
        updates: { status: 'error', error: errorMessage } 
      }});
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_STREAMING_MESSAGE', payload: '' });
    }
  }, [state.settings, state.messages, llmManager, toolRegistry, state.metrics]);

  const addAttachment = useCallback((attachment: Attachment) => {
    dispatch({ type: 'ADD_ATTACHMENT', payload: attachment });
  }, []);

  const removeAttachment = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ATTACHMENT', payload: id });
  }, []);

  const updateSettings = useCallback((settings: Partial<ChatSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

  const clearChat = useCallback(() => {
    dispatch({ type: 'CLEAR_CHAT' });
  }, []);

  const retryMessage = useCallback(async (messageId: string) => {
    const message = state.messages.find(msg => msg.id === messageId);
    if (message && message.type === 'user') {
      await sendMessage(message.content, message.metadata?.attachments);
    }
  }, [state.messages, sendMessage]);

  const cancelMessage = useCallback((messageId: string) => {
    dispatch({ type: 'UPDATE_MESSAGE', payload: { 
      id: messageId, 
      updates: { status: 'cancelled' } 
    }});
  }, []);

  const createThread = useCallback((title?: string) => {
    const thread: ChatThread = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: title || `Chat ${state.threads.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
      tags: []
    };
    dispatch({ type: 'ADD_THREAD', payload: thread });
    dispatch({ type: 'SELECT_THREAD', payload: thread.id });
  }, [state.threads.length]);

  const selectThread = useCallback((threadId: string | null) => {
    dispatch({ type: 'SELECT_THREAD', payload: threadId });
    // Load thread messages here if implementing thread persistence
  }, []);

  const deleteThread = useCallback((threadId: string) => {
    dispatch({ type: 'DELETE_THREAD', payload: threadId });
    if (state.selectedThread === threadId) {
      dispatch({ type: 'SELECT_THREAD', payload: null });
    }
  }, [state.selectedThread]);

  const exportChat = useCallback(() => {
    return JSON.stringify({
      messages: state.messages,
      settings: state.settings,
      metrics: state.metrics,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }, [state.messages, state.settings, state.metrics]);

  const importChat = useCallback((data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.messages) {
        dispatch({ type: 'SET_MESSAGES', payload: parsed.messages });
      }
      if (parsed.settings) {
        dispatch({ type: 'UPDATE_SETTINGS', payload: parsed.settings });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to import chat data' });
    }
  }, []);

  const contextValue: ChatContextType = {
    state,
    actions: {
      addMessage,
      updateMessage,
      deleteMessage,
      sendMessage,
      addAttachment,
      removeAttachment,
      updateSettings,
      clearChat,
      retryMessage,
      cancelMessage,
      createThread,
      selectThread,
      deleteThread,
      exportChat,
      importChat
    },
    services: {
      llmManager,
      toolRegistry
    }
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

// Hook to use chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Hook to use chat actions only
export const useChatActions = () => {
  const { actions } = useChat();
  return actions;
};

// Hook to use chat state only
export const useChatState = () => {
  const { state } = useChat();
  return state;
};

// Hook to use chat services only
export const useChatServices = () => {
  const { services } = useChat();
  return services;
};
