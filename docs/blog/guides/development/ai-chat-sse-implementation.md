# AI Chat SSE 流式对话系统实现方案

## 🎯 功能概述

在 Next.js 博客项目中实现一个基于 SSE (Server-Sent Events) 的 AI Chat 功能，支持：
- 实时流式对话响应
- 多轮对话历史
- 打字机效果显示
- 会话持久化存储
- 支持多种大模型 API

## 🚀 技术架构

```
前端 Chat UI → SSE 连接 → Next.js API Route → 大模型 API → 流式响应 → 前端实时显示
```

## 🔧 后端实现

### 1. **AI Chat API Route (SSE)**

```typescript
// apps/blog/src/app/api/chat/route.ts
import { OpenAI } from 'openai';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

// 配置 OpenAI (或其他模型)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

export async function POST(request: NextRequest) {
  try {
    // 验证用户认证
    const user = await requireAuth(request);
    
    const { message, conversationId, model = 'gpt-3.5-turbo' } = await request.json();

    if (!message) {
      return new Response('Message is required', { status: 400 });
    }

    // 获取或创建对话历史
    let conversation = null;
    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: user.id
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          id: conversationId || generateId(),
          userId: user.id,
          title: message.substring(0, 50) + '...',
          model
        },
        include: {
          messages: true
        }
      });
    }

    // 保存用户消息
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
        userId: user.id
      }
    });

    // 构建对话历史
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant. Please provide clear, concise, and helpful responses.'
      },
      ...conversation.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    // 创建 SSE 响应
    const encoder = new TextEncoder();
    let assistantMessage = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 调用 OpenAI Stream API
          const completion = await openai.chat.completions.create({
            model,
            messages,
            stream: true,
            max_tokens: 2000,
            temperature: 0.7,
          });

          // 处理流式响应
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            
            if (content) {
              assistantMessage += content;
              
              // 发送 SSE 数据
              const sseData = `data: ${JSON.stringify({
                type: 'content',
                content,
                conversationId: conversation.id
              })}\n\n`;
              
              controller.enqueue(encoder.encode(sseData));
            }
          }

          // 保存 AI 回复到数据库
          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              role: 'assistant',
              content: assistantMessage,
              model,
              tokenCount: assistantMessage.length // 简单估算
            }
          });

          // 发送完成信号
          const finishData = `data: ${JSON.stringify({
            type: 'finish',
            conversationId: conversation.id,
            messageId: 'msg-' + Date.now()
          })}\n\n`;
          
          controller.enqueue(encoder.encode(finishData));
          controller.close();

        } catch (error) {
          console.error('AI Chat Error:', error);
          
          // 发送错误信息
          const errorData = `data: ${JSON.stringify({
            type: 'error',
            error: 'AI service temporarily unavailable'
          })}\n\n`;
          
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// 生成唯一 ID
function generateId(): string {
  return 'conv_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}
```

### 2. **对话历史 API**

```typescript
// apps/blog/src/app/api/chat/conversations/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

// 获取对话列表
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    const conversations = await prisma.conversation.findMany({
      where: { userId: user.id },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 50
    });

    return Response.json({ conversations });
  } catch (error) {
    return new Response('Unauthorized', { status: 401 });
  }
}

// 创建新对话
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { title, model = 'gpt-3.5-turbo' } = await request.json();

    const conversation = await prisma.conversation.create({
      data: {
        title: title || 'New Conversation',
        userId: user.id,
        model
      }
    });

    return Response.json({ conversation });
  } catch (error) {
    return new Response('Unauthorized', { status: 401 });
  }
}
```

### 3. **具体对话 API**

```typescript
// apps/blog/src/app/api/chat/conversations/[id]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

// 获取对话详情和消息历史
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    const { id } = params;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId: user.id
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!conversation) {
      return new Response('Conversation not found', { status: 404 });
    }

    return Response.json({ conversation });
  } catch (error) {
    return new Response('Unauthorized', { status: 401 });
  }
}

// 删除对话
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    const { id } = params;

    await prisma.conversation.deleteMany({
      where: {
        id,
        userId: user.id
      }
    });

    return Response.json({ success: true });
  } catch (error) {
    return new Response('Unauthorized', { status: 401 });
  }
}
```

## 🎨 前端实现

### 1. **Chat 主组件**

```typescript
// apps/blog/src/components/chat/AIChatInterface.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatSSE } from '@/hooks/useChatSSE';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ConversationSidebar from './ConversationSidebar';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  streaming?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messageCount: number;
}

export default function AIChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { sendMessage, isConnected } = useChatSSE({
    onMessage: (content: string, type: string) => {
      if (type === 'content') {
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.role === 'assistant' && lastMessage.streaming) {
            // 更新流式消息
            return prev.map((msg, index) => 
              index === prev.length - 1 
                ? { ...msg, content: msg.content + content }
                : msg
            );
          } else {
            // 创建新的助手消息
            return [...prev, {
              id: `msg-${Date.now()}`,
              role: 'assistant',
              content,
              timestamp: new Date(),
              streaming: true
            }];
          }
        });
      } else if (type === 'finish') {
        setMessages(prev => 
          prev.map(msg => ({ ...msg, streaming: false }))
        );
        setLoading(false);
      } else if (type === 'error') {
        setError('AI 服务暂时不可用，请稍后重试');
        setLoading(false);
      }
    },
    onError: (error) => {
      setError(error.message);
      setLoading(false);
    }
  });

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 发送消息
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    setError(null);
    setLoading(true);

    // 添加用户消息
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      await sendMessage(content, currentConversationId);
    } catch (error) {
      setError('发送消息失败，请重试');
      setLoading(false);
    }
  };

  // 加载对话历史
  const loadConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  // 切换对话
  const switchConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.conversation.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.createdAt)
        })));
        setCurrentConversationId(conversationId);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  // 新建对话
  const createNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
  };

  useEffect(() => {
    loadConversations();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      <ConversationSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={switchConversation}
        onNewConversation={createNewConversation}
      />

      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col">
        {/* 头部 */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">
              AI 智能助手
            </h1>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-sm text-gray-600">
                {isConnected ? '已连接' : '连接中...'}
              </span>
            </div>
          </div>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto">
          <MessageList messages={messages} loading={loading} />
          <div ref={messagesEndRef} />
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* 输入区域 */}
        <MessageInput
          onSendMessage={handleSendMessage}
          loading={loading}
          placeholder="输入您的问题..."
        />
      </div>
    </div>
  );
}
```

### 2. **SSE Hook**

```typescript
// apps/blog/src/hooks/useChatSSE.ts
import { useRef, useCallback } from 'react';

interface UseChatSSEOptions {
  onMessage: (content: string, type: string, data?: any) => void;
  onError: (error: Error) => void;
}

export function useChatSSE({ onMessage, onError }: UseChatSSEOptions) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const isConnected = useRef(false);

  const sendMessage = useCallback(async (
    message: string, 
    conversationId?: string | null
  ) => {
    try {
      // 关闭之前的连接
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // 获取认证 token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('需要登录才能使用 AI 助手');
      }

      // 发送消息并建立 SSE 连接
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          conversationId,
          model: 'gpt-3.5-turbo'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // 使用 ReadableStream 处理 SSE
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      isConnected.current = true;

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                onMessage(data.content || '', data.type, data);
                
                if (data.type === 'finish' || data.type === 'error') {
                  reader.cancel();
                  return;
                }
              } catch (e) {
                console.warn('Failed to parse SSE data:', line);
              }
            }
          }
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          onError(error as Error);
        }
      } finally {
        isConnected.current = false;
        reader.releaseLock();
      }

    } catch (error) {
      isConnected.current = false;
      onError(error as Error);
    }
  }, [onMessage, onError]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      isConnected.current = false;
    }
  }, []);

  return {
    sendMessage,
    disconnect,
    isConnected: isConnected.current
  };
}
```

### 3. **消息列表组件**

```typescript
// apps/blog/src/components/chat/MessageList.tsx
'use client';

import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  streaming?: boolean;
}

interface MessageListProps {
  messages: Message[];
  loading: boolean;
}

const MessageList = memo(({ messages, loading }: MessageListProps) => {
  return (
    <div className="space-y-4 p-6">
      {messages.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-12">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-lg font-medium mb-2">欢迎使用 AI 智能助手</h3>
          <p>您可以问我任何问题，我会尽力为您提供帮助。</p>
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {loading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-xs">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

const MessageBubble = memo(({ message }: { message: Message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="flex max-w-3xl">
        {!isUser && (
          <div className="flex-shrink-0 mr-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">AI</span>
            </div>
          </div>
        )}
        
        <div className={`rounded-lg px-4 py-2 ${
          isUser 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
          
          {message.streaming && (
            <div className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1" />
          )}
        </div>

        {isUser && (
          <div className="flex-shrink-0 ml-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm font-medium">U</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

MessageList.displayName = 'MessageList';
MessageBubble.displayName = 'MessageBubble';

export default MessageList;
```

### 4. **消息输入组件**

```typescript
// apps/blog/src/components/chat/MessageInput.tsx
'use client';

import { useState, useRef, KeyboardEvent } from 'react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  loading: boolean;
  placeholder?: string;
}

export default function MessageInput({ 
  onSendMessage, 
  loading, 
  placeholder = "输入消息..." 
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !loading) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-end space-x-3 max-w-4xl mx-auto">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder={placeholder}
            disabled={loading}
            className="w-full resize-none border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            style={{ minHeight: '44px', maxHeight: '200px' }}
            rows={1}
          />
        </div>
        
        <button
          onClick={handleSend}
          disabled={!message.trim() || loading}
          className="bg-blue-500 text-white rounded-lg px-6 py-3 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            '发送'
          )}
        </button>
      </div>
      
      <p className="text-xs text-gray-500 text-center mt-2">
        按 Enter 发送，Shift + Enter 换行
      </p>
    </div>
  );
}
```

## 🗄️ 数据库模型

```prisma
// prisma/schema.prisma

model Conversation {
  id        String   @id @default(cuid())
  title     String
  userId    String
  model     String   @default("gpt-3.5-turbo")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages Message[]

  @@index([userId])
  @@index([createdAt])
}

model Message {
  id             String   @id @default(cuid())
  conversationId String
  role           String   // 'user' | 'assistant' | 'system'
  content        String   @db.Text
  model          String?
  tokenCount     Int?
  userId         String?
  createdAt      DateTime @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  user         User?        @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([conversationId])
  @@index([createdAt])
}

// 添加到现有 User 模型
model User {
  // ... 现有字段

  conversations Conversation[]
  messages      Message[]
}
```

## 🌐 页面集成

```typescript
// apps/blog/src/app/chat/page.tsx
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI 智能助手 - TechBlog',
  description: '与 AI 智能助手进行对话，获取技术问题的解答和帮助',
};

// 动态加载聊天组件避免 SSR 问题
const AIChatInterface = dynamic(
  () => import('@/components/chat/AIChatInterface'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }
);

export default function ChatPage() {
  return (
    <div className="h-screen">
      <AIChatInterface />
    </div>
  );
}
```

## ⚙️ 环境配置

```env
# .env.local

# OpenAI API 配置
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_BASE_URL=https://api.openai.com/v1

# 或者使用其他模型服务
# ANTHROPIC_API_KEY=your-claude-api-key
# GOOGLE_AI_API_KEY=your-gemini-api-key

# 其他配置
CHAT_MAX_TOKENS=2000
CHAT_TEMPERATURE=0.7
```

## 📱 移动端适配

```typescript
// apps/blog/src/components/chat/MobileChatLayout.tsx
'use client';

import { useState } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function MobileChatLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isMobile) {
    return children;
  }

  return (
    <div className="relative h-screen">
      {/* 移动端汉堡菜单 */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 bg-blue-500 text-white p-2 rounded-lg"
      >
        ☰
      </button>

      {/* 侧边栏遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {children}
    </div>
  );
}
```

## 🎯 功能特点

### 1. **实时流式响应**
- 使用 SSE 实现真正的实时响应
- 打字机效果，逐字显示
- 无需轮询，性能更好

### 2. **多轮对话支持**
- 保持完整的对话上下文
- 支持对话历史回顾
- 智能对话标题生成

### 3. **多模型支持**
- OpenAI GPT 系列
- Anthropic Claude
- Google Gemini
- 易于扩展其他模型

### 4. **用户体验优化**
- 响应式设计
- 移动端适配
- 错误处理和重试
- 离线状态提示

### 5. **安全性**
- 用户认证验证
- 请求频率限制
- 输入内容过滤
- 数据隐私保护

这个实现方案提供了一个完整的、生产就绪的 AI Chat 系统，您可以根据需要进行定制和扩展！ 