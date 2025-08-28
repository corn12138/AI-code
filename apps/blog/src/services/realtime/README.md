# Enterprise Realtime Communication Architecture

This directory contains a comprehensive realtime communication system that supports WebSocket, Server-Sent Events (SSE), and polling connections with advanced features like connection fallback, message prioritization, and AI integration.

## Overview

The realtime communication system provides:

- **Multiple Connection Types**: WebSocket, SSE, and polling with automatic fallback
- **Connection Management**: Auto-reconnection, heartbeat, and quality monitoring
- **Message Handling**: Priority queues, batching, compression, and streaming
- **AI Integration**: Direct integration with LLM and tool systems
- **Enterprise Features**: Room management, client isolation, and monitoring

## Architecture

```
realtime/
├── core/           # Core manager and interfaces
├── connections/    # Connection implementations
├── client/         # Client-side SDK
├── integrations/   # AI and other integrations
├── examples/       # Usage examples
└── index.ts        # Main exports
```

## Core Components

### RealtimeManager (`core/RealtimeManager.ts`)

Central coordinator for all realtime connections:

```typescript
const manager = new RealtimeManager({
  maxConnections: 1000,
  heartbeatInterval: 30000,
  enableCompression: true,
  enableBatching: true
});

// Add connections
manager.addConnection(connection);

// Send messages
await manager.sendToConnection(connectionId, message);
await manager.broadcast(message);
await manager.sendToRoom(roomId, message);

// Manage rooms
manager.joinRoom(connectionId, roomId);
manager.leaveRoom(connectionId, roomId);
```

### Connection Types (`connections/`)

Three connection implementations with automatic fallback:

#### WebSocket Connection
- Full bidirectional communication
- Low latency, high throughput
- Enhanced version with compression and batching

#### SSE Connection  
- Server-to-client streaming
- Auto-reconnection with exponential backoff
- HTTP POST for client-to-server messages

#### Polling Connection
- Fallback for restricted networks
- Configurable polling intervals
- RESTful HTTP-based communication

### Client SDK (`client/RealtimeClient.ts`)

Unified client interface with adaptive connection management:

```typescript
const client = new RealtimeClient({
  url: 'wss://api.example.com/realtime',
  connectionType: 'websocket',
  fallbackTypes: ['sse', 'polling'],
  autoReconnect: true,
  enableCompression: true
});

await client.connect();

// Send messages
await client.send('chat:message', { text: 'Hello!' });

// Subscribe to events
client.subscribe('chat:response', (message) => {
  console.log('Received:', message.payload);
});

// Room management
await client.joinRoom('general');
await client.sendToRoom('general', 'message', { text: 'Hello room!' });
```

## AI Integration

### AIAssistantRealtimeIntegration (`integrations/AIAssistantIntegration.ts`)

Direct integration with LLM and tool systems:

```typescript
const integration = new AIAssistantRealtimeIntegration(
  realtimeClient,
  llmManager,
  toolRegistry
);

// Handles:
// - chat:message -> LLM processing
// - tool:execute -> Tool execution
// - stream:* -> Streaming responses
// - conversation:* -> Context management
```

**Supported Message Types:**
- `chat:message` - Send message to AI
- `chat:response` - AI response
- `stream:start` - Begin streaming response
- `stream:data` - Streaming content chunks
- `stream:end` - Complete streaming response
- `tool:execute` - Execute a tool
- `tool:result` - Tool execution result
- `conversation:start/end` - Manage conversation state

## Advanced Features

### Connection Quality Monitoring

```typescript
const detector = new ConnectionQualityDetector();

// Records latency and packet loss
detector.recordLatency(50);
detector.recordPacketLoss();

// Gets quality metrics
const quality = detector.getConnectionQuality(); // 'excellent' | 'good' | 'fair' | 'poor'
const suggested = detector.getSuggestedConnectionType(); // 'websocket' | 'sse' | 'polling'
```

### Message Priority Queue

```typescript
const queue = new PriorityMessageQueue();

// Messages processed in priority order
queue.enqueue({ 
  ...message, 
  priority: 'critical' // 'critical' | 'high' | 'normal' | 'low'
});

const nextMessage = queue.dequeue();
```

### Connection Fallback Strategy

Automatic fallback chain:
1. **WebSocket** (preferred) - Full duplex, low latency
2. **SSE** (fallback) - Server push with HTTP POST
3. **Polling** (last resort) - Simple HTTP requests

### Compression and Batching

```typescript
// Enhanced WebSocket with optimization
const connection = new EnhancedWebSocketConnection(id, url, protocols, maxAttempts, {
  enableCompression: true,  // Compress large messages
  enableBatching: true,     // Batch small messages
  batchSize: 10,           // Max messages per batch
  batchInterval: 100       // Batch every 100ms
});
```

## Usage Patterns

### 1. Simple Chat Application

```typescript
const client = RealtimeBuilder.createWebSocketClient('ws://localhost:3001/realtime');

await client.connect();

client.subscribe('chat:message', (message) => {
  displayMessage(message.payload);
});

await client.send('chat:message', { 
  text: 'Hello world!',
  userId: 'user123'
});
```

### 2. AI-Powered Chat

```typescript
const { client, integration } = REALTIME_PRESETS.AI_CHAT(
  'http://localhost:3001',
  llmManager,
  toolRegistry
);

await client.connect();

// Send AI chat message
await client.send('chat:message', {
  conversationId: 'conv-123',
  content: 'What is the weather like?',
  model: 'gpt-4',
  stream: true
});

// Handle streaming response
client.subscribe('stream:data', (message) => {
  updateStreamingResponse(message.payload.content);
});
```

### 3. Room-based Communication

```typescript
// Join a room
await client.joinRoom('project-alpha');

// Send to room
await client.sendToRoom('project-alpha', 'document:update', {
  documentId: 'doc-123',
  changes: [{ op: 'insert', text: 'Hello' }]
});

// Listen for room messages
client.subscribe('document:update', (message) => {
  if (message.roomId === 'project-alpha') {
    applyChanges(message.payload.changes);
  }
});
```

### 4. Tool Integration

```typescript
// Execute a tool through realtime connection
await client.send('tool:execute', {
  conversationId: 'conv-123',
  toolName: 'calculator',
  input: { expression: '2 + 2 * 3' }
});

// Handle tool results
client.subscribe('tool:result', (message) => {
  if (message.payload.success) {
    console.log('Result:', message.payload.result);
  } else {
    console.error('Tool error:', message.payload.error);
  }
});
```

## Configuration Options

### RealtimeManager Configuration

```typescript
const config = {
  maxConnections: 1000,           // Max concurrent connections
  heartbeatInterval: 30000,       // Heartbeat every 30s
  pingTimeout: 5000,              // Ping timeout 5s
  maxReconnectAttempts: 5,        // Max reconnection attempts
  reconnectDelay: 1000,           // Initial reconnect delay
  messageBufferSize: 100,         // Buffer for offline clients
  maxMessageSize: 1048576,        // 1MB max message size
  rateLimitPerSecond: 10,         // Rate limiting
  enableCompression: true,        // Enable compression
  enableBatching: false,          // Enable message batching
  batchInterval: 100,             // Batch every 100ms
  batchSize: 10                   // Max 10 messages per batch
};
```

### Client Configuration

```typescript
const clientConfig = {
  url: 'wss://api.example.com/realtime',
  connectionType: 'websocket',
  fallbackTypes: ['sse', 'polling'],
  clientId: 'client-123',
  autoReconnect: true,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000,
  enableCompression: true,
  enableBatching: false,
  authentication: {
    token: 'jwt-token',
    headers: { 'X-API-Key': 'key' }
  }
};
```

## Performance Optimization

### Connection Management
- Automatic connection pooling
- Load balancing across connection types
- Graceful degradation based on network quality

### Message Optimization
- Message compression for large payloads
- Batching for high-frequency messages
- Priority queuing for critical messages

### Memory Management
- Connection cleanup on disconnect
- Message buffer limits
- Automatic garbage collection

## Error Handling

### Connection Errors
```typescript
client.on('error', (error) => {
  console.error('Connection error:', error);
  
  // Implement retry logic
  if (error.code === 'NETWORK_ERROR') {
    // Try fallback connection
  }
});
```

### Message Errors
```typescript
try {
  await client.send('message', payload);
} catch (error) {
  // Handle send failure
  // Maybe queue for retry
  console.error('Send failed:', error);
}
```

### Reconnection Handling
```typescript
client.on('disconnect', (reason) => {
  if (reason === 'server_error') {
    // Wait before reconnecting
    setTimeout(() => client.connect(), 5000);
  }
});
```

## Monitoring and Metrics

### Connection Metrics
```typescript
const metrics = manager.getMetrics();
console.log({
  connectionCount: metrics.connectionCount,
  messagesSent: metrics.messagesSent,
  messagesReceived: metrics.messagesReceived,
  errorRate: metrics.errorRate,
  uptime: metrics.uptime
});
```

### Client Metrics
```typescript
const info = client.getConnectionInfo();
console.log({
  connectionType: info.connectionType,
  isConnected: info.isConnected,
  subscriptions: info.subscriptions
});
```

## Security Considerations

### Authentication
- JWT token authentication
- Custom header authentication
- Connection-level authorization

### Message Validation
- Payload size limits
- Rate limiting
- Message type validation

### Connection Security
- WSS/HTTPS only in production
- CORS configuration
- Input sanitization

## Deployment

### Server Requirements
- WebSocket support
- SSE support
- HTTP/2 recommended
- Load balancer with sticky sessions

### Client Requirements
- Modern browser with WebSocket support
- EventSource API for SSE
- Fetch API for polling fallback

## Best Practices

1. **Connection Management**
   - Use connection pooling
   - Implement proper cleanup
   - Monitor connection health

2. **Message Design**
   - Keep messages small
   - Use appropriate priority levels
   - Implement message versioning

3. **Error Handling**
   - Always handle disconnections
   - Implement exponential backoff
   - Provide user feedback

4. **Performance**
   - Use compression for large messages
   - Batch high-frequency messages
   - Monitor connection quality

5. **Security**
   - Validate all inputs
   - Use authentication
   - Implement rate limiting

## Examples

See `examples/RealtimeUsage.ts` for comprehensive examples including:

1. Basic WebSocket communication
2. AI chat integration
3. Connection fallback scenarios
4. Quality monitoring
5. Message prioritization
6. Room-based communication
7. Error handling strategies

## Integration with Other Systems

### LLM Integration
- Direct connection to LLMManager
- Streaming response support
- Tool execution integration

### Tool Registry Integration
- Execute tools via realtime messages
- Return results through realtime channel
- Support for async tool operations

### Enterprise AI Assistant
- Backend for realtime AI interactions
- Context management
- Session handling

This realtime communication system provides the foundation for building responsive, scalable, and reliable real-time applications with advanced AI capabilities.
