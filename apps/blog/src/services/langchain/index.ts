'use client';

// Core exports
export { BaseChain, CompositeChain, createChain } from './core/BaseChain';
export type { BaseMemory, ChainCallbacks, ChainConfig, ChainInput, ChainOutput } from './core/BaseChain';

// Memory exports
export {
  BufferMemory, ConversationBufferWindowMemory, SummaryMemory, VectorStoreMemory
} from './memory/BaseMemory';
export type { MemoryMessage } from './memory/BaseMemory';

// Prompt exports
export {
  COMMON_PROMPTS, ChatPromptTemplate, ConditionalPromptSelector, FewShotPromptTemplate, PromptTemplate
} from './prompts/PromptTemplate';
export type { PromptTemplateConfig, PromptTemplateInput } from './prompts/PromptTemplate';

// Agent exports
export {
  AgentToolFactory, CalculatorTool, CodeExecutionTool,
  DatabaseTool,
  EmailTool, FileSystemTool, HTTPTool, WeatherTool, WebSearchTool
} from './agents/AgentTools';
export { BaseAgent, ZeroShotReActAgent } from './agents/BaseAgent';
export type { AgentAction, AgentConfig, AgentFinish, AgentStep, AgentTool } from './agents/BaseAgent';
export { ConversationalReActAgent, StructuredChatAgent } from './agents/ConversationalReActAgent';

// Chain exports
export {
  ConversationChain,
  ConversationSummaryChain,
  QAWithSourcesChain
} from './chains/ConversationChain';
export {
  ConditionalChain, LLMChain, ParallelChain, RouterChain, SequentialChain,
  TransformChain
} from './chains/LLMChain';
export type { ConversationChainConfig, LLMChainConfig } from './chains/LLMChain';

// Utility functions for common use cases
export class LangChainBuilder {
  private llmManager: any;
  private toolRegistry?: any;

  constructor(llmManager: any, toolRegistry?: any) {
    this.llmManager = llmManager;
    this.toolRegistry = toolRegistry;
  }

  // Create a simple LLM chain
  createLLMChain(template: string, inputVariables: string[]) {
    const prompt = new PromptTemplate({ template, inputVariables });
    return new LLMChain({
      llmManager: this.llmManager,
      prompt
    });
  }

  // Create a conversation chain
  createConversationChain(memory?: BaseMemory) {
    return new ConversationChain({
      llmManager: this.llmManager,
      memory: memory || new BufferMemory()
    });
  }

  // Create a zero-shot agent
  createZeroShotAgent(tools: AgentTool[], systemPrompt?: string) {
    return new ZeroShotReActAgent({
      llmManager: this.llmManager,
      tools,
      systemPrompt
    });
  }

  // Create a conversational agent
  createConversationalAgent(tools: AgentTool[], memory?: BaseMemory, systemPrompt?: string) {
    return new ConversationalReActAgent({
      llmManager: this.llmManager,
      tools,
      memory: memory || new BufferMemory(),
      systemPrompt
    });
  }

  // Create tools from tool registry
  createToolsFromRegistry() {
    if (!this.toolRegistry) {
      throw new Error('Tool registry not provided');
    }
    return AgentToolFactory.createFromToolRegistry(this.toolRegistry);
  }
}

// Pre-built configurations for common scenarios
export const LANGCHAIN_PRESETS = {
  // Simple Q&A chatbot
  SIMPLE_CHATBOT: (llmManager: any) => {
    const builder = new LangChainBuilder(llmManager);
    return builder.createConversationChain(new BufferMemory({ maxMessages: 10 }));
  },

  // Tool-using agent
  TOOL_AGENT: (llmManager: any, tools?: AgentTool[]) => {
    const builder = new LangChainBuilder(llmManager);
    const agentTools = tools || AgentToolFactory.getDefaultTools();
    return builder.createZeroShotAgent(agentTools, 'You are a helpful assistant with access to various tools.');
  },

  // Conversational agent with memory
  CONVERSATIONAL_AGENT: (llmManager: any, tools?: AgentTool[]) => {
    const builder = new LangChainBuilder(llmManager);
    const agentTools = tools || AgentToolFactory.getDefaultTools();
    const memory = new BufferMemory({ maxMessages: 20 });
    return builder.createConversationalAgent(
      agentTools,
      memory,
      'You are a helpful assistant that can use tools and remember our conversation.'
    );
  },

  // Q&A with sources
  QA_WITH_SOURCES: (llmManager: any) => {
    return new QAWithSourcesChain({
      llmManager
    });
  }
};
