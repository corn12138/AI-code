# LLM API 集成实现方案

## 1. 多模型统一接入层

### 1.1 抽象接口设计
```typescript
// shared/ai/interfaces/llm.interface.ts
export interface ILLMProvider {
  name: string;
  model: string;
  apiKey: string;
  baseURL?: string;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export interface ILLMResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, any>;
}

export abstract class BaseLLMClient {
  abstract chat(messages: ChatMessage[]): Promise<ILLMResponse>;
  abstract streamChat(messages: ChatMessage[]): AsyncGenerator<string>;
  abstract embedding(text: string): Promise<number[]>;
}
```

### 1.2 多模型适配器实现
```typescript
// apps/blog/src/lib/ai/providers/
export class OpenAIAdapter extends BaseLLMClient {
  private client: OpenAI;
  
  constructor(config: ILLMProvider) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL
    });
  }
  
  async chat(messages: ChatMessage[]): Promise<ILLMResponse> {
    const completion = await this.client.chat.completions.create({
      model: this.config.model,
      messages: messages,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens
    });
    
    return this.formatResponse(completion);
  }
  
  async *streamChat(messages: ChatMessage[]): AsyncGenerator<string> {
    const stream = await this.client.chat.completions.create({
      model: this.config.model,
      messages: messages,
      stream: true
    });
    
    for await (const chunk of stream) {
      yield chunk.choices[0]?.delta?.content || '';
    }
  }
}

// Claude 适配器
export class ClaudeAdapter extends BaseLLMClient {
  private client: Anthropic;
  
  async chat(messages: ChatMessage[]): Promise<ILLMResponse> {
    const response = await this.client.messages.create({
      model: "claude-3-opus-20240229",
      messages: this.convertMessages(messages),
      max_tokens: this.config.maxTokens
    });
    
    return this.formatResponse(response);
  }
}
```

## 2. LangChain 集成架构

### 2.1 RAG 系统实现
```typescript
// apps/blog/src/lib/ai/langchain/rag.ts
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { RetrievalQAChain } from 'langchain/chains';

export class RAGSystem {
  private vectorStore: PineconeStore;
  private embeddings: OpenAIEmbeddings;
  private chain: RetrievalQAChain;
  
  async initialize() {
    // 初始化向量数据库
    this.embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-small"
    });
    
    this.vectorStore = await PineconeStore.fromExistingIndex(
      this.embeddings,
      { 
        pineconeIndex: await this.getPineconeIndex(),
        namespace: 'blog-content'
      }
    );
    
    // 构建检索链
    this.chain = RetrievalQAChain.fromLLM(
      this.llm,
      this.vectorStore.asRetriever({
        k: 5,
        searchType: "similarity",
        scoreThreshold: 0.7
      })
    );
  }
  
  async indexDocument(content: string, metadata: Record<string, any>) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ["\n\n", "\n", " ", ""]
    });
    
    const docs = await splitter.createDocuments([content], [metadata]);
    await this.vectorStore.addDocuments(docs);
  }
  
  async query(question: string): Promise<string> {
    const response = await this.chain.call({
      query: question,
      context: await this.getRelevantContext(question)
    });
    
    return response.text;
  }
}
```

### 2.2 Agent 系统设计
```typescript
// apps/blog/src/lib/ai/langchain/agents.ts
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { Calculator } from 'langchain/tools/calculator';
import { WebBrowser } from 'langchain/tools/webbrowser';
import { SerpAPI } from 'langchain/tools';

export class AIAgent {
  private executor: AgentExecutor;
  private tools: Tool[];
  
  async initialize() {
    // 定义工具集
    this.tools = [
      new Calculator(),
      new WebBrowser({ model: this.llm, embeddings: this.embeddings }),
      new SerpAPI(process.env.SERP_API_KEY),
      await this.createCustomTool('code-executor', this.executeCode),
      await this.createCustomTool('file-manager', this.manageFiles)
    ];
    
    // 初始化 Agent
    this.executor = await initializeAgentExecutorWithOptions(
      this.tools,
      this.llm,
      {
        agentType: "openai-functions",
        verbose: true,
        returnIntermediateSteps: true,
        maxIterations: 5,
        earlyStoppingMethod: "generate"
      }
    );
  }
  
  async execute(input: string): Promise<AgentResponse> {
    const result = await this.executor.call({
      input,
      chat_history: this.chatHistory
    });
    
    return {
      output: result.output,
      intermediateSteps: result.intermediateSteps,
      toolsUsed: this.extractToolsUsed(result)
    };
  }
  
  private createCustomTool(name: string, func: Function): DynamicTool {
    return new DynamicTool({
      name,
      description: `Tool for ${name}`,
      func: async (input: string) => {
        try {
          return await func(input);
        } catch (error) {
          return `Error: ${error.message}`;
        }
      }
    });
  }
}
```

## 3. 流式响应处理

### 3.1 SSE (Server-Sent Events) 实现
```typescript
// apps/blog/src/app/api/chat/route.ts
export async function POST(req: Request) {
  const { messages, model } = await req.json();
  
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  
  // 异步处理流式响应
  (async () => {
    try {
      const llmClient = LLMFactory.create(model);
      const responseStream = llmClient.streamChat(messages);
      
      for await (const chunk of responseStream) {
        const data = `data: ${JSON.stringify({ content: chunk })}\n\n`;
        await writer.write(encoder.encode(data));
      }
      
      await writer.write(encoder.encode('data: [DONE]\n\n'));
    } catch (error) {
      const errorData = `data: ${JSON.stringify({ error: error.message })}\n\n`;
      await writer.write(encoder.encode(errorData));
    } finally {
      await writer.close();
    }
  })();
  
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### 3.2 WebSocket 实时通信
```typescript
// apps/blog/src/lib/websocket/chat-socket.ts
export class ChatWebSocket {
  private ws: WebSocket;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  connect() {
    this.ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.authenticate();
    };
    
    this.ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'chat.message':
          await this.handleChatMessage(data.payload);
          break;
        case 'chat.typing':
          this.handleTypingIndicator(data.payload);
          break;
        case 'model.switch':
          await this.handleModelSwitch(data.payload);
          break;
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.reconnect();
    };
  }
  
  async sendMessage(message: string, options?: ChatOptions) {
    const payload = {
      type: 'chat.message',
      message,
      model: options?.model || 'gpt-4',
      stream: options?.stream !== false,
      temperature: options?.temperature || 0.7,
      timestamp: Date.now()
    };
    
    this.ws.send(JSON.stringify(payload));
  }
  
  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      setTimeout(() => this.connect(), delay);
    }
  }
}
```

## 4. 上下文管理与会话持久化

### 4.1 会话管理器
```typescript
// apps/blog/src/lib/ai/session-manager.ts
export class SessionManager {
  private sessions: Map<string, ChatSession> = new Map();
  private redis: Redis;
  
  async createSession(userId: string): Promise<ChatSession> {
    const session: ChatSession = {
      id: generateSessionId(),
      userId,
      messages: [],
      context: {},
      createdAt: new Date(),
      model: 'gpt-4',
      maxTokens: 4096
    };
    
    this.sessions.set(session.id, session);
    await this.persistSession(session);
    
    return session;
  }
  
  async addMessage(sessionId: string, message: ChatMessage) {
    const session = await this.getSession(sessionId);
    
    // 智能上下文裁剪
    if (this.getTokenCount(session.messages) > session.maxTokens * 0.8) {
      session.messages = await this.pruneContext(session.messages);
    }
    
    session.messages.push(message);
    await this.persistSession(session);
  }
  
  private async pruneContext(messages: ChatMessage[]): Promise<ChatMessage[]> {
    // 保留系统消息和最近的消息
    const systemMessages = messages.filter(m => m.role === 'system');
    const recentMessages = messages.slice(-10);
    
    // 使用摘要压缩中间消息
    const middleMessages = messages.slice(1, -10);
    if (middleMessages.length > 0) {
      const summary = await this.summarizeMessages(middleMessages);
      return [
        ...systemMessages,
        { role: 'assistant', content: `Previous conversation summary: ${summary}` },
        ...recentMessages
      ];
    }
    
    return [...systemMessages, ...recentMessages];
  }
}
```

## 5. 错误处理与降级策略

### 5.1 智能降级机制
```typescript
// apps/blog/src/lib/ai/fallback-handler.ts
export class FallbackHandler {
  private providers: ILLMProvider[] = [
    { name: 'openai', model: 'gpt-4', priority: 1 },
    { name: 'claude', model: 'claude-3-opus', priority: 2 },
    { name: 'gemini', model: 'gemini-pro', priority: 3 },
    { name: 'local', model: 'llama2', priority: 4 }
  ];
  
  async executeWithFallback(
    request: ChatRequest
  ): Promise<ILLMResponse> {
    const sortedProviders = this.providers.sort((a, b) => a.priority - b.priority);
    
    for (const provider of sortedProviders) {
      try {
        const client = LLMFactory.create(provider.name);
        const response = await this.executeWithTimeout(
          client.chat(request.messages),
          provider.timeout || 30000
        );
        
        // 记录成功的提供商
        this.recordSuccess(provider);
        return response;
        
      } catch (error) {
        console.error(`Provider ${provider.name} failed:`, error);
        this.recordFailure(provider, error);
        
        // 如果是最后一个提供商，抛出错误
        if (provider === sortedProviders[sortedProviders.length - 1]) {
          throw new Error('All LLM providers failed');
        }
      }
    }
  }
  
  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      )
    ]);
  }
}
```

## 6. 性能优化策略

### 6.1 缓存机制
```typescript
// apps/blog/src/lib/ai/cache-manager.ts
export class AICacheManager {
  private memoryCache: LRUCache<string, any>;
  private redisCache: Redis;
  
  constructor() {
    this.memoryCache = new LRUCache({
      max: 500,
      ttl: 1000 * 60 * 5, // 5分钟
      updateAgeOnGet: true
    });
  }
  
  async getCachedResponse(key: string): Promise<ILLMResponse | null> {
    // L1 缓存 - 内存
    const memCached = this.memoryCache.get(key);
    if (memCached) return memCached;
    
    // L2 缓存 - Redis
    const redisCached = await this.redisCache.get(key);
    if (redisCached) {
      const parsed = JSON.parse(redisCached);
      this.memoryCache.set(key, parsed);
      return parsed;
    }
    
    return null;
  }
  
  async setCachedResponse(key: string, response: ILLMResponse) {
    // 同时写入两级缓存
    this.memoryCache.set(key, response);
    await this.redisCache.setex(
      key,
      3600, // 1小时
      JSON.stringify(response)
    );
  }
  
  generateCacheKey(messages: ChatMessage[], options: any): string {
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ messages, options }))
      .digest('hex');
    return `llm:response:${hash}`;
  }
}
```

### 6.2 并发控制
```typescript
// apps/blog/src/lib/ai/concurrency-manager.ts
export class ConcurrencyManager {
  private queue: PQueue;
  private rateLimiter: Bottleneck;
  
  constructor() {
    // 并发队列
    this.queue = new PQueue({
      concurrency: 10,
      interval: 1000,
      intervalCap: 20
    });
    
    // 速率限制
    this.rateLimiter = new Bottleneck({
      reservoir: 100,
      reservoirRefreshAmount: 100,
      reservoirRefreshInterval: 60 * 1000,
      maxConcurrent: 5,
      minTime: 100
    });
  }
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return this.queue.add(() =>
      this.rateLimiter.schedule(fn)
    );
  }
}
```

## 7. 监控与可观测性

### 7.1 性能监控
```typescript
// apps/blog/src/lib/ai/monitoring.ts
export class AIMonitoring {
  private metrics: MetricsCollector;
  
  async trackLLMCall(
    provider: string,
    model: string,
    fn: () => Promise<any>
  ) {
    const startTime = Date.now();
    const traceId = generateTraceId();
    
    try {
      const result = await fn();
      
      // 记录成功指标
      this.metrics.record({
        type: 'llm_call',
        provider,
        model,
        duration: Date.now() - startTime,
        status: 'success',
        tokens: result.usage?.totalTokens,
        traceId
      });
      
      return result;
      
    } catch (error) {
      // 记录失败指标
      this.metrics.record({
        type: 'llm_call',
        provider,
        model,
        duration: Date.now() - startTime,
        status: 'error',
        error: error.message,
        traceId
      });
      
      throw error;
    }
  }
  
  getMetrics() {
    return {
      totalCalls: this.metrics.getCount('llm_call'),
      avgDuration: this.metrics.getAverage('duration'),
      errorRate: this.metrics.getErrorRate(),
      tokenUsage: this.metrics.getSum('tokens'),
      providerBreakdown: this.metrics.getBreakdown('provider')
    };
  }
}
```

## 总结

这套 LLM API 集成方案实现了：

1. **多模型统一接入**：支持 OpenAI、Claude、Gemini 等主流模型
2. **LangChain 深度集成**：完整的 RAG 和 Agent 系统
3. **流式响应处理**：SSE 和 WebSocket 双通道支持
4. **智能降级策略**：多级故障转移和超时控制
5. **性能优化**：多级缓存、并发控制、智能裁剪
6. **完善的监控**：全链路追踪和性能指标收集

这些实现充分展示了对 LLM API 集成的深度理解和工程化能力。
