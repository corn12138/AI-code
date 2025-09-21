
import { BaseChain, ChainInput, ChainOutput, ChainConfig } from '../core/BaseChain';
import { PromptTemplate } from '../prompts/PromptTemplate';

// Tool interface for agents
export interface AgentTool {
    name: string;
    description: string;
    execute(input: string): Promise<string>;
    inputSchema?: Record<string, any>;
}

// Agent action
export interface AgentAction {
    tool: string;
    toolInput: string;
    log: string;
}

// Agent finish
export interface AgentFinish {
    returnValues: Record<string, any>;
    log: string;
}

// Agent step
export type AgentStep = AgentAction | AgentFinish;

// Agent configuration
export interface AgentConfig extends ChainConfig {
    tools: AgentTool[];
    systemPrompt?: string;
    maxIterations?: number;
    earlyStoppingMethod?: 'force' | 'generate';
}

// Base Agent class
export abstract class BaseAgent extends BaseChain {
    protected tools: Map<string, AgentTool>;
    protected maxIterations: number;
    protected earlyStoppingMethod: 'force' | 'generate';

    constructor(config: AgentConfig) {
        super(config);
        this.tools = new Map(config.tools.map(tool => [tool.name, tool]));
        this.maxIterations = config.maxIterations || 10;
        this.earlyStoppingMethod = config.earlyStoppingMethod || 'force';
    }

    // Abstract method to plan the next action
    abstract plan(
        steps: Array<{ action: AgentAction; observation: string }>,
        input: ChainInput
    ): Promise<AgentStep>;

    // Main execution method
    async _call(input: ChainInput): Promise<ChainOutput> {
        const steps: Array<{ action: AgentAction; observation: string }> = [];
        let iterations = 0;

        while (iterations < this.maxIterations) {
            iterations++;

            try {
                // Plan the next step
                const step = await this.plan(steps, input);

                if (this.isAgentFinish(step)) {
                    this.addStep('Agent Finish', step.log);
                    return {
                        result: step.returnValues,
                        steps: steps
                    };
                }

                // Execute the action
                const action = step as AgentAction;
                this.addStep(`Action: ${action.tool}`, action.log);

                const tool = this.tools.get(action.tool);
                if (!tool) {
                    throw new Error(`Tool ${action.tool} not found`);
                }

                const observation = await tool.execute(action.toolInput);
                this.addStep(`Observation`, observation);

                steps.push({ action, observation });

            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                this.addStep('Error', errorMsg);

                if (this.earlyStoppingMethod === 'force') {
                    return {
                        result: `Agent stopped due to error: ${errorMsg}`,
                        steps: steps,
                        error: errorMsg
                    };
                }

                // Continue with error as observation
                if (steps.length > 0) {
                    steps[steps.length - 1].observation = `Error: ${errorMsg}`;
                }
            }
        }

        // Max iterations reached
        this.addStep('Max Iterations', `Stopped after ${this.maxIterations} iterations`);
        return {
            result: 'Agent stopped due to max iterations',
            steps: steps
        };
    }

    private isAgentFinish(step: AgentStep): step is AgentFinish {
        return 'returnValues' in step;
    }

    // Helper method to get tool descriptions
    protected getToolDescriptions(): string {
        return Array.from(this.tools.values())
            .map(tool => `${tool.name}: ${tool.description}`)
            .join('\n');
    }

    // Helper method to get tool names
    protected getToolNames(): string[] {
        return Array.from(this.tools.keys());
    }
}

// Zero-shot React Agent - reasons and acts without examples
export class ZeroShotReActAgent extends BaseAgent {
    private promptTemplate: PromptTemplate;

    constructor(config: AgentConfig) {
        super(config);

        this.promptTemplate = new PromptTemplate({
            template: `${config.systemPrompt || 'You are a helpful AI assistant.'} You have access to the following tools:

{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
{agent_scratchpad}`,
            inputVariables: ['tools', 'tool_names', 'input', 'agent_scratchpad']
        });
    }

    async plan(
        steps: Array<{ action: AgentAction; observation: string }>,
        input: ChainInput
    ): Promise<AgentStep> {
        // Build the agent scratchpad from previous steps
        const scratchpad = steps
            .map(step => `Thought: ${step.action.log}\nAction: ${step.action.tool}\nAction Input: ${step.action.toolInput}\nObservation: ${step.observation}`)
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

        // Look for Action
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

// Conversational Agent - maintains conversation context
export class ConversationalAgent extends BaseAgent {
    private promptTemplate: PromptTemplate;

    constructor(config: AgentConfig) {
        super(config);

        this.promptTemplate = new PromptTemplate({
            template: `${config.systemPrompt || 'You are a helpful AI assistant having a conversation with a human.'} You have access to the following tools:

{tools}

To use a tool, please use the following format:

```
Action: tool_name
Action Input: the input to the tool
```

The result will be returned as an observation. You can then continue the conversation or use another tool if needed.

Previous conversation:
{chat_history}
