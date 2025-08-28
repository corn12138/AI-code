'use client';

import { LLMManager } from '../../llm/LLMManager';
import { ToolRegistry } from '../../tools/ToolRegistry';
import {
  AgentToolFactory,
  BufferMemory,
  CalculatorTool,
  ConversationalReActAgent,
  ConversationChain,
  LANGCHAIN_PRESETS,
  LangChainBuilder,
  LLMChain,
  PromptTemplate,
  SequentialChain,
  WebSearchTool,
  ZeroShotReActAgent
} from '../index';

// Example usage of LangChain components
export class LangChainExamples {
  private llmManager: LLMManager;
  private toolRegistry: ToolRegistry;
  private builder: LangChainBuilder;

  constructor(llmManager: LLMManager, toolRegistry: ToolRegistry) {
    this.llmManager = llmManager;
    this.toolRegistry = toolRegistry;
    this.builder = new LangChainBuilder(llmManager, toolRegistry);
  }

  // Example 1: Simple LLM Chain
  async simpleLLMChainExample() {
    const prompt = new PromptTemplate({
      template: "Translate the following text from {source_lang} to {target_lang}: {text}",
      inputVariables: ["source_lang", "target_lang", "text"]
    });

    const chain = new LLMChain({
      llmManager: this.llmManager,
      prompt
    });

    const result = await chain.call({
      source_lang: "English",
      target_lang: "Spanish",
      text: "Hello, how are you?"
    });

    console.log("Translation result:", result.text);
    return result;
  }

  // Example 2: Sequential Chain
  async sequentialChainExample() {
    // First chain: Generate a story outline
    const outlineChain = new LLMChain({
      llmManager: this.llmManager,
      prompt: new PromptTemplate({
        template: "Create a story outline about: {topic}",
        inputVariables: ["topic"]
      }),
      outputKey: "outline"
    });

    // Second chain: Write the story
    const storyChain = new LLMChain({
      llmManager: this.llmManager,
      prompt: new PromptTemplate({
        template: "Write a short story based on this outline: {outline}",
        inputVariables: ["outline"]
      }),
      outputKey: "story"
    });

    const sequentialChain = new SequentialChain({
      llmManager: this.llmManager,
      chains: [outlineChain, storyChain],
      inputVariables: ["topic"],
      outputVariables: ["story"]
    });

    const result = await sequentialChain.call({
      topic: "a robot learning to paint"
    });

    console.log("Generated story:", result.story);
    return result;
  }

  // Example 3: Conversation Chain with Memory
  async conversationChainExample() {
    const memory = new BufferMemory({ maxMessages: 5 });
    const conversation = new ConversationChain({
      llmManager: this.llmManager,
      memory
    });

    // First message
    const response1 = await conversation.call({
      input: "Hi, my name is Alice. I'm a software engineer."
    });
    console.log("AI:", response1.response);

    // Second message
    const response2 = await conversation.call({
      input: "What's my name and profession?"
    });
    console.log("AI:", response2.response);

    return { response1, response2 };
  }

  // Example 4: Zero-Shot ReAct Agent
  async zeroShotAgentExample() {
    const tools = [
      new CalculatorTool(),
      new WebSearchTool()
    ];

    const agent = new ZeroShotReActAgent({
      llmManager: this.llmManager,
      tools,
      systemPrompt: "You are a helpful research assistant."
    });

    const result = await agent.call({
      input: "What's the square root of 144 and can you search for information about quantum computing?"
    });

    console.log("Agent result:", result.result);
    console.log("Steps taken:", result.intermediateSteps);
    return result;
  }

  // Example 5: Conversational Agent with Tools and Memory
  async conversationalAgentExample() {
    const tools = AgentToolFactory.getDefaultTools();
    const memory = new BufferMemory({ maxMessages: 10 });

    const agent = new ConversationalReActAgent({
      llmManager: this.llmManager,
      tools,
      memory,
      systemPrompt: "You are a helpful assistant that can use tools and remember our conversation."
    });

    // First interaction
    const response1 = await agent.call({
      input: "Hi! Can you calculate 25 * 4 for me?"
    });
    console.log("Agent:", response1.result);

    // Second interaction (with memory)
    const response2 = await agent.call({
      input: "What was the result of that calculation?"
    });
    console.log("Agent:", response2.result);

    return { response1, response2 };
  }

  // Example 6: Using Pre-built Presets
  async presetExample() {
    // Simple chatbot
    const chatbot = LANGCHAIN_PRESETS.SIMPLE_CHATBOT(this.llmManager);
    const chatResponse = await chatbot.call({
      input: "Hello! Tell me about yourself."
    });
    console.log("Chatbot:", chatResponse.response);

    // Tool agent
    const toolAgent = LANGCHAIN_PRESETS.TOOL_AGENT(this.llmManager);
    const agentResponse = await toolAgent.call({
      input: "Calculate the area of a circle with radius 5"
    });
    console.log("Tool Agent:", agentResponse.result);

    return { chatResponse, agentResponse };
  }

  // Example 7: Custom Chain Composition
  async customChainExample() {
    // Create a chain that analyzes text and then generates a response
    const analysisChain = new LLMChain({
      llmManager: this.llmManager,
      prompt: new PromptTemplate({
        template: "Analyze the sentiment and key topics in this text: {text}",
        inputVariables: ["text"]
      }),
      outputKey: "analysis"
    });

    const responseChain = new LLMChain({
      llmManager: this.llmManager,
      prompt: new PromptTemplate({
        template: "Based on this analysis: {analysis}\n\nGenerate an appropriate response to: {text}",
        inputVariables: ["analysis", "text"]
      }),
      outputKey: "response"
    });

    // Compose the chains
    const compositeChain = analysisChain.pipe(responseChain);

    const result = await compositeChain.call({
      text: "I'm feeling really frustrated with my work lately. Nothing seems to be going right."
    });

    console.log("Analysis:", result.analysis);
    console.log("Response:", result.response);
    return result;
  }

  // Example 8: Batch Processing
  async batchProcessingExample() {
    const translateChain = this.builder.createLLMChain(
      "Translate '{text}' to {language}",
      ["text", "language"]
    );

    const inputs = [
      { text: "Hello", language: "Spanish" },
      { text: "Goodbye", language: "French" },
      { text: "Thank you", language: "German" }
    ];

    const results = await translateChain.batch(inputs);

    results.forEach((result, index) => {
      console.log(`Translation ${index + 1}:`, result.text);
    });

    return results;
  }

  // Example 9: Error Handling and Retry
  async errorHandlingExample() {
    const chain = new LLMChain({
      llmManager: this.llmManager,
      prompt: new PromptTemplate({
        template: "Solve this math problem: {problem}",
        inputVariables: ["problem"]
      }),
      callbacks: {
        onStart: (input) => console.log("Starting chain with input:", input),
        onEnd: (output) => console.log("Chain completed with output:", output),
        onError: (error) => console.error("Chain error:", error),
        onStep: (step) => console.log("Chain step:", step)
      }
    });

    try {
      const result = await chain.call({
        problem: "What is 2 + 2 * 3?"
      });
      console.log("Math result:", result.text);
      return result;
    } catch (error) {
      console.error("Failed to solve math problem:", error);
      throw error;
    }
  }

  // Run all examples
  async runAllExamples() {
    console.log("=== Running LangChain Examples ===\n");

    try {
      console.log("1. Simple LLM Chain:");
      await this.simpleLLMChainExample();
      console.log();

      console.log("2. Sequential Chain:");
      await this.sequentialChainExample();
      console.log();

      console.log("3. Conversation Chain:");
      await this.conversationChainExample();
      console.log();

      console.log("4. Zero-Shot Agent:");
      await this.zeroShotAgentExample();
      console.log();

      console.log("5. Conversational Agent:");
      await this.conversationalAgentExample();
      console.log();

      console.log("6. Preset Examples:");
      await this.presetExample();
      console.log();

      console.log("7. Custom Chain:");
      await this.customChainExample();
      console.log();

      console.log("8. Batch Processing:");
      await this.batchProcessingExample();
      console.log();

      console.log("9. Error Handling:");
      await this.errorHandlingExample();
      console.log();

      console.log("=== All examples completed successfully! ===");
    } catch (error) {
      console.error("Example execution failed:", error);
    }
  }
}
