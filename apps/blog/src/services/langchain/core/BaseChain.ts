'use client';

import { LLMManager } from '../../llm/LLMManager';
import { ToolRegistry } from '../../tools/ToolRegistry';

// Base interfaces for LangChain-like functionality
export interface ChainInput {
    [key: string]: any;
}

export interface ChainOutput {
    [key: string]: any;
    result?: any;
    intermediateSteps?: Array<{
        action: string;
        observation: string;
        timestamp: Date;
    }>;
}

export interface ChainCallbacks {
    onStart?: (input: ChainInput) => void;
    onEnd?: (output: ChainOutput) => void;
    onError?: (error: Error) => void;
    onStep?: (step: { action: string; observation: string }) => void;
    onToken?: (token: string) => void;
}

export interface ChainConfig {
    llmManager: LLMManager;
    toolRegistry?: ToolRegistry;
    verbose?: boolean;
    maxIterations?: number;
    temperature?: number;
    callbacks?: ChainCallbacks;
    memory?: BaseMemory;
}

// Base Memory interface
export interface BaseMemory {
    addMessage(input: string, output: string): Promise<void>;
    getMessages(): Promise<Array<{ input: string; output: string; timestamp: Date }>>;
    clear(): Promise<void>;
    saveContext(inputValues: ChainInput, outputValues: ChainOutput): Promise<void>;
    loadMemoryVariables(inputValues: ChainInput): Promise<ChainInput>;
}

// Abstract base chain class
export abstract class BaseChain {
    protected config: ChainConfig;
    protected _intermediateSteps: Array<{
        action: string;
        observation: string;
        timestamp: Date;
    }> = [];

    constructor(config: ChainConfig) {
        this.config = config;
    }

    // Abstract method that must be implemented by subclasses
    abstract _call(input: ChainInput): Promise<ChainOutput>;

    // Main execution method
    async call(input: ChainInput): Promise<ChainOutput> {
        this._intermediateSteps = [];

        try {
            // Trigger start callback
            if (this.config.callbacks?.onStart) {
                this.config.callbacks.onStart(input);
            }

            // Load memory variables if memory is configured
            let enrichedInput = input;
            if (this.config.memory) {
                const memoryVariables = await this.config.memory.loadMemoryVariables(input);
                enrichedInput = { ...input, ...memoryVariables };
            }

            // Execute the chain
            const output = await this._call(enrichedInput);

            // Add intermediate steps to output
            output.intermediateSteps = this._intermediateSteps;

            // Save to memory if configured
            if (this.config.memory) {
                await this.config.memory.saveContext(input, output);
            }

            // Trigger end callback
            if (this.config.callbacks?.onEnd) {
                this.config.callbacks.onEnd(output);
            }

            return output;
        } catch (error) {
            if (this.config.callbacks?.onError) {
                this.config.callbacks.onError(error as Error);
            }
            throw error;
        }
    }

    // Helper method to add intermediate steps
    protected addStep(action: string, observation: string): void {
        const step = {
            action,
            observation,
            timestamp: new Date()
        };

        this._intermediateSteps.push(step);

        if (this.config.callbacks?.onStep) {
            this.config.callbacks.onStep(step);
        }

        if (this.config.verbose) {
            console.log(`[${step.timestamp.toISOString()}] ${action}: ${observation}`);
        }
    }

    // Helper method to call LLM
    protected async callLLM(prompt: string, options?: {
        temperature?: number;
        maxTokens?: number;
        stop?: string[];
        stream?: boolean;
    }): Promise<string> {
        try {
            const response = await this.config.llmManager.complete({
                messages: [{ role: 'user', content: prompt }],
                temperature: options?.temperature ?? this.config.temperature ?? 0.7,
                maxTokens: options?.maxTokens ?? 2048,
                stop: options?.stop,
                stream: options?.stream ?? false
            });

            return response.content;
        } catch (error) {
            throw new Error(`LLM call failed: ${error}`);
        }
    }

    // Helper method to use tools
    protected async useTool(toolName: string, input: any): Promise<string> {
        if (!this.config.toolRegistry) {
            throw new Error('Tool registry not configured');
        }

        try {
            const result = await this.config.toolRegistry.executeTool(toolName, input);
            return typeof result === 'string' ? result : JSON.stringify(result);
        } catch (error) {
            throw new Error(`Tool execution failed: ${error}`);
        }
    }

    // Batch processing
    async batch(inputs: ChainInput[]): Promise<ChainOutput[]> {
        const results: ChainOutput[] = [];

        for (const input of inputs) {
            try {
                const result = await this.call(input);
                results.push(result);
            } catch (error) {
                results.push({
                    error: error instanceof Error ? error.message : 'Unknown error',
                    input
                });
            }
        }

        return results;
    }

    // Stream processing (for real-time applications)
    async *stream(input: ChainInput): AsyncGenerator<Partial<ChainOutput>, ChainOutput, unknown> {
        // This would be implemented based on the specific chain type
        // For now, just yield the final result
        const result = await this.call(input);
        yield result;
        return result;
    }

    // Chain composition - allows chaining multiple chains together
    pipe(nextChain: BaseChain): CompositeChain {
        return new CompositeChain([this, nextChain]);
    }
}

// Composite chain for chaining multiple chains
export class CompositeChain extends BaseChain {
    private chains: BaseChain[];

    constructor(chains: BaseChain[]) {
        // Use the config from the first chain
        super(chains[0].config);
        this.chains = chains;
    }

    async _call(input: ChainInput): Promise<ChainOutput> {
        let currentInput = input;
        let finalOutput: ChainOutput = {};

        for (let i = 0; i < this.chains.length; i++) {
            const chain = this.chains[i];
            this.addStep(`Chain ${i + 1}`, `Executing ${chain.constructor.name}`);

            const output = await chain._call(currentInput);

            // Use the output as input for the next chain
            currentInput = output;
            finalOutput = output;

            this.addStep(`Chain ${i + 1} Complete`, `Output: ${JSON.stringify(output, null, 2)}`);
        }

        return finalOutput;
    }
}

// Utility function to create chains with common configurations
export function createChain<T extends BaseChain>(
    ChainClass: new (config: ChainConfig) => T,
    config: Partial<ChainConfig> & { llmManager: LLMManager }
): T {
    const defaultConfig: ChainConfig = {
        llmManager: config.llmManager,
        verbose: false,
        maxIterations: 10,
        temperature: 0.7,
        ...config
    };

    return new ChainClass(defaultConfig);
}
