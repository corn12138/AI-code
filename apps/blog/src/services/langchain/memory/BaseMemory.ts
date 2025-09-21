
import { BaseMemory, ChainInput, ChainOutput } from '../core/BaseChain';

// Message structure for memory
export interface MemoryMessage {
    input: string;
    output: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

// Buffer Memory - keeps a buffer of recent messages
export class BufferMemory implements BaseMemory {
    private messages: MemoryMessage[] = [];
    private maxMessages: number;
    private inputKey: string;
    private outputKey: string;

    constructor(options: {
        maxMessages?: number;
        inputKey?: string;
        outputKey?: string;
    } = {}) {
        this.maxMessages = options.maxMessages ?? 10;
        this.inputKey = options.inputKey ?? 'input';
        this.outputKey = options.outputKey ?? 'output';
    }

    async addMessage(input: string, output: string, metadata?: Record<string, any>): Promise<void> {
        const message: MemoryMessage = {
            input,
            output,
            timestamp: new Date(),
            metadata
        };

        this.messages.push(message);

        // Maintain buffer size
        if (this.messages.length > this.maxMessages) {
            this.messages = this.messages.slice(-this.maxMessages);
        }
    }

    async getMessages(): Promise<MemoryMessage[]> {
        return [...this.messages];
    }

    async clear(): Promise<void> {
        this.messages = [];
    }

    async saveContext(inputValues: ChainInput, outputValues: ChainOutput): Promise<void> {
        const input = inputValues[this.inputKey] || JSON.stringify(inputValues);
        const output = outputValues[this.outputKey] || outputValues.result || JSON.stringify(outputValues);

        await this.addMessage(input, output, {
            inputValues,
            outputValues
        });
    }

    async loadMemoryVariables(inputValues: ChainInput): Promise<ChainInput> {
        const history = this.messages
            .map(msg => `Human: ${msg.input}\nAI: ${msg.output}`)
            .join('\n\n');

        return {
            history,
            chat_history: this.messages
        };
    }

    // Get formatted conversation history
    getFormattedHistory(): string {
        return this.messages
            .map(msg => `Human: ${msg.input}\nAI: ${msg.output}`)
            .join('\n\n');
    }
}

// Summary Memory - maintains a summary of the conversation
export class SummaryMemory implements BaseMemory {
    private summary: string = '';
    private recentMessages: MemoryMessage[] = [];
    private maxRecentMessages: number;
    private summaryPrompt: string;
    private llmManager: any; // LLMManager instance

    constructor(options: {
        maxRecentMessages?: number;
        summaryPrompt?: string;
        llmManager: any;
    }) {
        this.maxRecentMessages = options.maxRecentMessages ?? 5;
        this.llmManager = options.llmManager;
        this.summaryPrompt = options.summaryPrompt ?? `
Progressively summarize the lines of conversation provided, adding onto the previous summary returning a new summary.

EXAMPLE:
Current summary:
The human asks what the AI thinks of artificial intelligence. The AI thinks artificial intelligence is a force for good.

New lines of conversation:
Human: Why do you think artificial intelligence is a force for good?
AI: Because artificial intelligence will help humans reach their full potential.

New summary:
The human asks what the AI thinks of artificial intelligence. The AI thinks artificial intelligence is a force for good because it will help humans reach their full potential.

Current summary:
{summary}

New lines of conversation:
{new_lines}

New summary:`;
    }

    async addMessage(input: string, output: string, metadata?: Record<string, any>): Promise<void> {
        const message: MemoryMessage = {
            input,
            output,
            timestamp: new Date(),
            metadata
        };

        this.recentMessages.push(message);

        // If we have too many recent messages, update the summary
        if (this.recentMessages.length > this.maxRecentMessages) {
            await this.updateSummary();
        }
    }

    async getMessages(): Promise<MemoryMessage[]> {
        return [...this.recentMessages];
    }

    async clear(): Promise<void> {
        this.summary = '';
        this.recentMessages = [];
    }

    async saveContext(inputValues: ChainInput, outputValues: ChainOutput): Promise<void> {
        const input = inputValues.input || JSON.stringify(inputValues);
        const output = outputValues.result || JSON.stringify(outputValues);

        await this.addMessage(input, output, {
            inputValues,
            outputValues
        });
    }

    async loadMemoryVariables(inputValues: ChainInput): Promise<ChainInput> {
        const recentHistory = this.recentMessages
            .map(msg => `Human: ${msg.input}\nAI: ${msg.output}`)
            .join('\n');

        return {
            summary: this.summary,
            history: recentHistory,
            chat_history: this.recentMessages
        };
    }

    private async updateSummary(): Promise<void> {
        const newLines = this.recentMessages
            .slice(0, -this.maxRecentMessages)
            .map(msg => `Human: ${msg.input}\nAI: ${msg.output}`)
            .join('\n');

        const prompt = this.summaryPrompt
            .replace('{summary}', this.summary)
            .replace('{new_lines}', newLines);

        try {
            const response = await this.llmManager.complete({
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                maxTokens: 500
            });

            this.summary = response.content.trim();

            // Keep only the most recent messages
            this.recentMessages = this.recentMessages.slice(-this.maxRecentMessages);
        } catch (error) {
            console.error('Failed to update summary:', error);
        }
    }

    getSummary(): string {
        return this.summary;
    }
}

// Conversation Buffer Window Memory - keeps a sliding window of conversation
export class ConversationBufferWindowMemory implements BaseMemory {
    private messages: MemoryMessage[] = [];
    private windowSize: number;

    constructor(windowSize: number = 5) {
        this.windowSize = windowSize;
    }

    async addMessage(input: string, output: string, metadata?: Record<string, any>): Promise<void> {
        const message: MemoryMessage = {
            input,
            output,
            timestamp: new Date(),
            metadata
        };

        this.messages.push(message);

        // Maintain window size (keep pairs of human/AI messages)
        if (this.messages.length > this.windowSize * 2) {
            this.messages = this.messages.slice(-this.windowSize * 2);
        }
    }

    async getMessages(): Promise<MemoryMessage[]> {
        return [...this.messages];
    }

    async clear(): Promise<void> {
        this.messages = [];
    }

    async saveContext(inputValues: ChainInput, outputValues: ChainOutput): Promise<void> {
        const input = inputValues.input || JSON.stringify(inputValues);
        const output = outputValues.result || JSON.stringify(outputValues);

        await this.addMessage(input, output, {
            inputValues,
            outputValues
        });
    }

    async loadMemoryVariables(inputValues: ChainInput): Promise<ChainInput> {
        const history = this.messages
            .map(msg => `Human: ${msg.input}\nAI: ${msg.output}`)
            .join('\n\n');

        return {
            history,
            chat_history: this.messages
        };
    }
}

// Vector Store Memory - uses embeddings for semantic search (placeholder implementation)
export class VectorStoreMemory implements BaseMemory {
    private messages: MemoryMessage[] = [];
    private maxMessages: number;

    constructor(options: {
        maxMessages?: number;
        vectorStore?: any; // Would integrate with vector database
        embeddingFunction?: (text: string) => Promise<number[]>;
    } = {}) {
        this.maxMessages = options.maxMessages ?? 100;
        // Vector store integration would go here
    }

    async addMessage(input: string, output: string, metadata?: Record<string, any>): Promise<void> {
        const message: MemoryMessage = {
            input,
            output,
            timestamp: new Date(),
            metadata
        };

        this.messages.push(message);

        if (this.messages.length > this.maxMessages) {
            this.messages = this.messages.slice(-this.maxMessages);
        }

        // Here we would compute embeddings and store in vector database
        // For now, just store in memory
    }

    async getMessages(): Promise<MemoryMessage[]> {
        return [...this.messages];
    }

    async clear(): Promise<void> {
        this.messages = [];
    }

    async saveContext(inputValues: ChainInput, outputValues: ChainOutput): Promise<void> {
        const input = inputValues.input || JSON.stringify(inputValues);
        const output = outputValues.result || JSON.stringify(outputValues);

        await this.addMessage(input, output);
    }

    async loadMemoryVariables(inputValues: ChainInput): Promise<ChainInput> {
        // In a real implementation, this would do semantic search
        // For now, just return recent messages
        const history = this.messages
            .slice(-5)
            .map(msg => `Human: ${msg.input}\nAI: ${msg.output}`)
            .join('\n\n');

        return {
            history,
            chat_history: this.messages.slice(-5)
        };
    }

    // Semantic search method (placeholder)
    async semanticSearch(query: string, topK: number = 5): Promise<MemoryMessage[]> {
        // This would perform actual semantic search using embeddings
        // For now, just return recent messages
        return this.messages.slice(-topK);
    }
}
