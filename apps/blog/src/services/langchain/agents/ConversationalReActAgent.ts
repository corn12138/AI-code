'use client';

import { BaseAgent, AgentStep, AgentAction, AgentConfig } from './BaseAgent';
import { PromptTemplate } from '../prompts/PromptTemplate';
import { ChainInput } from '../core/BaseChain';

// Conversational React Agent - maintains conversation context while using tools
export class ConversationalReActAgent extends BaseAgent {
  private promptTemplate: PromptTemplate;

  constructor(config: AgentConfig) {
    super(config);

    this.promptTemplate = new PromptTemplate({
      template: `${config.systemPrompt || 'You are a helpful AI assistant having a conversation with a human.'} You have access to the following tools:

{tools}

To use a tool, please use the following format:

```
Thought: Do I need to use a tool? What should I do?
Action: the action to take, should be one of [{ tool_names }]
Action Input: the input to the action
Observation: the result of the action
```

When you have a response to say to the Human, or if you do not need to use a tool, you MUST use the format:

```
Thought: Do I need to use a tool ? No
Final Answer: [your response here]
      ```

Previous conversation:
{chat_history}

New input: {input}
{agent_scratchpad}`,
      inputVariables: ['tools', 'tool_names', 'chat_history', 'input', 'agent_scratchpad']
    });
}

  async plan(
  steps: Array<{ action: AgentAction; observation: string }>,
  input: ChainInput
): Promise < AgentStep > {
  // Build the agent scratchpad from previous steps
  const scratchpad = steps
    .map(step => `Thought: ${step.action.log}\nAction: ${step.action.tool}\nAction Input: ${step.action.toolInput}\nObservation: ${step.observation}`)
    .join('\n');

  // Get chat history from memory if available
  const chatHistory = this.config.memory
    ? (await this.config.memory.loadMemoryVariables(input)).history || ''
    : '';

  // Format the prompt
  const prompt = this.promptTemplate.format({
    tools: this.getToolDescriptions(),
    tool_names: this.getToolNames().join(', '),
    chat_history: chatHistory,
    input: input.input || JSON.stringify(input),
    agent_scratchpad: scratchpad
  });

  // Get response from LLM
  const response = await this.callLLM(prompt);

  // Parse the response
  return this.parseResponse(response);
}

  private parseResponse(response: string): AgentStep {
  // Look for Final Answer
  const finalAnswerMatch = response.match(/Final Answer:\s*(.+?)(?:\n|$)/s);
  if (finalAnswerMatch) {
    return {
      returnValues: { output: finalAnswerMatch[1].trim() },
      log: response
    };
  }

  // Look for Action in code blocks
  const actionBlockMatch = response.match(/```[\s\S]*?Action:\s*(.+?)(?:\n|$)[\s\S]*?Action Input:\s*(.+?)(?:\n|$)[\s\S]*?```/s);
  if (actionBlockMatch) {
    return {
      tool: actionBlockMatch[1].trim(),
      toolInput: actionBlockMatch[2].trim(),
      log: response
    };
  }

  // Look for Action outside code blocks
  const actionMatch = response.match(/Action:\s*(.+?)(?:\n|$)/);
  const actionInputMatch = response.match(/Action Input:\s*(.+?)(?:\n|$)/s);

  if (actionMatch && actionInputMatch) {
    return {
      tool: actionMatch[1].trim(),
      toolInput: actionInputMatch[1].trim(),
      log: response
    };
  }

  // If we can't parse properly, return a finish with the raw response
  return {
    returnValues: { output: response },
    log: response
  };
}
}

// Structured Chat Agent - uses structured chat format
export class StructuredChatAgent extends BaseAgent {
  private promptTemplate: PromptTemplate;

  constructor(config: AgentConfig) {
    super(config);

    this.promptTemplate = new PromptTemplate({
      template: `Respond to the human as helpfully and accurately as possible. You have access to the following tools:

{tools}

Use a json blob to specify a tool by providing an action key (tool name) and an action_input key (tool input).

Valid "action" values: "Final Answer" or {tool_names}

Provide only ONE action per $JSON_BLOB, as shown:

```
{{
      "action": $TOOL_NAME,
      "action_input": $INPUT
    }}
```

Follow this format:

Question: input question to answer
Thought: consider previous and subsequent steps
Action:
```
$JSON_BLOB
  ```
Observation: action result
... (repeat Thought/Action/Observation N times)
Thought: I know what to respond
Action:
```
{
  {
    "action": "Final Answer",
      "action_input": "Final response to human"
  }
}
```

Begin! Reminder to ALWAYS respond with a valid json blob of a single action. Use tools if necessary. Respond directly if appropriate. Format is Action:```$JSON_BLOB```then Observation:.

Question: {input}
{agent_scratchpad}`,
  inputVariables: ['tools', 'tool_names', 'input', 'agent_scratchpad']
    });
  }

  async plan(
    steps: Array<{ action: AgentAction; observation: string }>,
    input: ChainInput
  ): Promise < AgentStep > {
    // Build the agent scratchpad from previous steps
    const scratchpad = steps
      .map(step => `Thought: ${step.action.log}\nAction:\n\`\`\`\n${JSON.stringify({ action: step.action.tool, action_input: step.action.toolInput })}\n\`\`\`\nObservation: ${step.observation}`)
      .join('\n');

    // Format the prompt
    const prompt = this.promptTemplate.format({
      tools: this.getToolDescriptions(),
      tool_names: this.getToolNames().join(', '),
      input: input.input || JSON.stringify(input),
      agent_scratchpad: scratchpad
    });

    // Get response from LLM
    const response = await this.callLLM(prompt);

    // Parse the response
    return this.parseStructuredResponse(response);
  }

  private parseStructuredResponse(response: string): AgentStep {
  try {
    // Extract JSON blob from response
    const jsonMatch = response.match(/```\s*(\{[\s\S]*?\})\s*```/);
    if (!jsonMatch) {
      throw new Error('No JSON blob found in response');
    }

    const jsonBlob = JSON.parse(jsonMatch[1]);
    const action = jsonBlob.action;
    const actionInput = jsonBlob.action_input;

    if (action === 'Final Answer') {
      return {
        returnValues: { output: actionInput },
        log: response
      };
    }

    return {
      tool: action,
      toolInput: actionInput,
      log: response
    };
  } catch (error) {
    // If parsing fails, return a finish with the raw response
    return {
      returnValues: { output: response },
      log: response
    };
  }
}
}
