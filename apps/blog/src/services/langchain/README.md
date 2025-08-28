# LangChain Integration Framework

This directory contains a comprehensive LangChain-inspired framework for building advanced AI applications with chains, agents, and memory systems.

## Overview

The LangChain integration provides:

- **Chains**: Composable sequences of operations
- **Agents**: AI systems that can use tools and reason about actions
- **Memory**: Persistent conversation and context management
- **Prompts**: Template system for dynamic prompt generation
- **Tools**: Extensible tool system for external integrations

## Architecture

```
langchain/
├── core/           # Base classes and interfaces
├── chains/         # Chain implementations
├── agents/         # Agent implementations
├── memory/         # Memory systems
├── prompts/        # Prompt templates
├── examples/       # Usage examples
└── index.ts        # Main exports
```

## Core Components

### Base Chain (`core/BaseChain.ts`)

The foundation for all chain operations:

```typescript
const chain = new LLMChain({
  llmManager: llmManager,
  prompt: new PromptTemplate({
    template: "Translate {text} to {language}",
    inputVariables: ["text", "language"]
  })
});

const result = await chain.call({
  text: "Hello world",
  language: "Spanish"
});
```

### Memory Systems (`memory/BaseMemory.ts`)

- **BufferMemory**: Maintains recent conversation history
- **SummaryMemory**: Keeps a running summary of conversations
- **ConversationBufferWindowMemory**: Sliding window of recent messages
- **VectorStoreMemory**: Semantic search-based memory (placeholder)

```typescript
const memory = new BufferMemory({ maxMessages: 10 });
const conversation = new ConversationChain({
  llmManager,
  memory
});
```

### Prompt Templates (`prompts/PromptTemplate.ts`)

Dynamic prompt generation with variable substitution:

```typescript
const prompt = new PromptTemplate({
  template: "You are a {role}. {task}",
  inputVariables: ["role", "task"]
});

const formatted = prompt.format({
  role: "helpful assistant",
  task: "Answer questions about science"
});
```

### Agents (`agents/BaseAgent.ts`)

Intelligent systems that can use tools:

- **ZeroShotReActAgent**: Reasoning and acting without examples
- **ConversationalReActAgent**: Conversational agent with tool use
- **StructuredChatAgent**: Structured JSON-based interactions

```typescript
const agent = new ZeroShotReActAgent({
  llmManager,
  tools: [new CalculatorTool(), new WebSearchTool()],
  systemPrompt: "You are a research assistant."
});

const result = await agent.call({
  input: "What's 15% of 250?"
});
```

### Chains (`chains/`)

Pre-built chain implementations:

- **LLMChain**: Simple LLM prompting
- **SequentialChain**: Multiple chains in sequence
- **ConversationChain**: Chat with memory
- **QAWithSourcesChain**: Question answering with citations

```typescript
const sequential = new SequentialChain({
  llmManager,
  chains: [summaryChain, analysisChain],
  inputVariables: ["text"],
  outputVariables: ["analysis"]
});
```

## Quick Start

### 1. Basic LLM Chain

```typescript
import { LangChainBuilder, PromptTemplate, LLMChain } from './langchain';

const builder = new LangChainBuilder(llmManager);
const chain = builder.createLLMChain(
  "Explain {concept} in simple terms",
  ["concept"]
);

const result = await chain.call({ concept: "quantum computing" });
```

### 2. Conversational Agent

```typescript
import { LANGCHAIN_PRESETS } from './langchain';

const agent = LANGCHAIN_PRESETS.CONVERSATIONAL_AGENT(llmManager);
const response = await agent.call({
  input: "Calculate 25 * 8 and tell me about the result"
});
```

### 3. Custom Chain Composition

```typescript
const analysisChain = new LLMChain({
  llmManager,
  prompt: new PromptTemplate({
    template: "Analyze: {text}",
    inputVariables: ["text"]
  })
});

const summaryChain = new LLMChain({
  llmManager,
  prompt: new PromptTemplate({
    template: "Summarize: {analysis}",
    inputVariables: ["analysis"]
  })
});

const composite = analysisChain.pipe(summaryChain);
```

## Available Tools

The framework includes several built-in tools:

- **CalculatorTool**: Mathematical calculations
- **WebSearchTool**: Internet search (placeholder)
- **WeatherTool**: Weather information (placeholder)
- **FileSystemTool**: File operations
- **CodeExecutionTool**: Code execution (sandboxed)
- **DatabaseTool**: Database queries
- **EmailTool**: Email sending
- **HTTPTool**: HTTP requests

You can also create tools from the existing ToolRegistry:

```typescript
const tools = AgentToolFactory.createFromToolRegistry(toolRegistry);
```

## Memory Management

Different memory types for different use cases:

```typescript
// Short-term memory
const bufferMemory = new BufferMemory({ maxMessages: 5 });

// Summarized memory
const summaryMemory = new SummaryMemory({
  llmManager,
  maxRecentMessages: 3
});

// Sliding window
const windowMemory = new ConversationBufferWindowMemory(5);
```

## Advanced Features

### Callbacks and Monitoring

```typescript
const chain = new LLMChain({
  llmManager,
  prompt,
  callbacks: {
    onStart: (input) => console.log("Starting:", input),
    onEnd: (output) => console.log("Completed:", output),
    onError: (error) => console.error("Error:", error),
    onStep: (step) => console.log("Step:", step)
  }
});
```

### Batch Processing

```typescript
const inputs = [
  { text: "Hello", language: "Spanish" },
  { text: "Goodbye", language: "French" }
];

const results = await translateChain.batch(inputs);
```

### Streaming

```typescript
for await (const chunk of chain.stream(input)) {
  console.log("Partial result:", chunk);
}
```

## Integration with Existing Systems

The LangChain framework integrates seamlessly with:

- **LLMManager**: Uses the unified LLM API layer
- **ToolRegistry**: Leverages the 29-tool protocol system
- **EnterpriseAIAssistant**: Can be used as the backend reasoning system

```typescript
// Integration example
const llmManager = new LLMManager(config);
const toolRegistry = new ToolRegistry();
const builder = new LangChainBuilder(llmManager, toolRegistry);

const agent = builder.createConversationalAgent(
  builder.createToolsFromRegistry()
);
```

## Examples

See `examples/LangChainUsage.ts` for comprehensive examples including:

1. Simple LLM chains
2. Sequential processing
3. Conversational agents
4. Tool usage
5. Memory management
6. Error handling
7. Batch processing
8. Custom compositions

## Error Handling

The framework includes comprehensive error handling:

```typescript
try {
  const result = await chain.call(input);
} catch (error) {
  console.error("Chain execution failed:", error);
  // Handle error appropriately
}
```

## Performance Considerations

- Use batch processing for multiple similar operations
- Choose appropriate memory types based on use case
- Implement streaming for long-running operations
- Monitor token usage and costs through callbacks
- Use caching where appropriate

## Future Enhancements

Planned features:

1. Vector store integration for semantic memory
2. Additional agent types (Plan-and-Execute, etc.)
3. Custom tool creation utilities
4. Advanced routing strategies
5. Performance optimization tools
6. Integration with external knowledge bases

## Best Practices

1. **Chain Composition**: Break complex operations into smaller, reusable chains
2. **Memory Management**: Choose the right memory type for your use case
3. **Tool Design**: Make tools focused and single-purpose
4. **Error Handling**: Always implement proper error handling
5. **Monitoring**: Use callbacks to monitor performance and costs
6. **Testing**: Test chains with various inputs and edge cases
