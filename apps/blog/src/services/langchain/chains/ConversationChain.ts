'use client';

import { BaseChain, ChainConfig, ChainInput, ChainOutput } from '../core/BaseChain';
import { BufferMemory } from '../memory/BaseMemory';
import { PromptTemplate } from '../prompts/PromptTemplate';

// Conversation Chain configuration
export interface ConversationChainConfig extends ChainConfig {
    prompt?: PromptTemplate;
    inputKey?: string;
    outputKey?: string;
}

// Conversation Chain - maintains conversation context with memory
export class ConversationChain extends BaseChain {
    private prompt: PromptTemplate;
    private inputKey: string;
    private outputKey: string;

    constructor(config: ConversationChainConfig) {
        // Set default memory if none provided
        if (!config.memory) {
            config.memory = new BufferMemory();
        }

        super(config);

        this.inputKey = config.inputKey || 'input';
        this.outputKey = config.outputKey || 'response';

        // Use provided prompt or default conversation prompt
        this.prompt = config.prompt || new PromptTemplate({
            template: `The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:
{history}
Human: {input}
AI:`,
            inputVariables: ['history', 'input']
        });
    }

    async _call(input: ChainInput): Promise<ChainOutput> {
        const userInput = input[this.inputKey] || input.input || JSON.stringify(input);

        this.addStep('Load Memory', 'Loading conversation history from memory');

        // Load memory variables (conversation history)
        const memoryVariables = this.config.memory
            ? await this.config.memory.loadMemoryVariables(input)
            : { history: '' };

        this.addStep('Format Prompt', 'Formatting conversation prompt with history and input');

        // Format the prompt with memory and current input
        const formattedPrompt = this.prompt.format({
            ...memoryVariables,
            [this.inputKey]: userInput
        });

        this.addStep('Generate Response', 'Generating AI response');

        // Get response from LLM
        const response = await this.callLLM(formattedPrompt);

        this.addStep('Save to Memory', 'Saving conversation turn to memory');

        // Save the conversation turn to memory
        if (this.config.memory) {
            await this.config.memory.saveContext(
                { [this.inputKey]: userInput },
                { [this.outputKey]: response }
            );
        }

        return {
            [this.outputKey]: response,
            result: response
        };
    }

    // Get conversation history
    async getHistory(): Promise<string> {
        if (this.config.memory) {
            const memoryVars = await this.config.memory.loadMemoryVariables({});
            return memoryVars.history || '';
        }
        return '';
    }

    // Clear conversation history
    async clearHistory(): Promise<void> {
        if (this.config.memory) {
            await this.config.memory.clear();
        }
    }

    // Predict method for compatibility
    async predict(input: string): Promise<string> {
        const result = await this.call({ [this.inputKey]: input });
        return result[this.outputKey] as string;
    }
}

// Conversation Summary Chain - maintains a summary of the conversation
export class ConversationSummaryChain extends ConversationChain {
    private summaryPrompt: PromptTemplate;

    constructor(config: ConversationChainConfig & {
        summaryPrompt?: PromptTemplate;
    }) {
        super(config);

        this.summaryPrompt = config.summaryPrompt || new PromptTemplate({
            template: `Progressively summarize the lines of conversation provided, adding onto the previous summary returning a new summary.

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

New summary:`,
            inputVariables: ['summary', 'new_lines']
        });
    }

    async summarizeConversation(
        summary: string = '',
        newLines: string = ''
    ): Promise<string> {
        const formattedPrompt = this.summaryPrompt.format({
            summary,
            new_lines: newLines
        });

        return await this.callLLM(formattedPrompt);
    }
}

// Q&A Chain with sources - for question answering with source attribution
export class QAWithSourcesChain extends BaseChain {
    private questionPrompt: PromptTemplate;
    private combinePrompt: PromptTemplate;

    constructor(config: ChainConfig & {
        questionPrompt?: PromptTemplate;
        combinePrompt?: PromptTemplate;
    }) {
        super(config);

        this.questionPrompt = config.questionPrompt || new PromptTemplate({
            template: `Use the following portion of a long document to see if any of the text is relevant to answer the question. 
Return any relevant text verbatim.

Context: {context}
Question: {question}
Relevant text, if any:`,
            inputVariables: ['context', 'question']
        });

        this.combinePrompt = config.combinePrompt || new PromptTemplate({
            template: `Given the following extracted parts of a long document and a question, create a final answer with references ("SOURCES"). 
If you don't know the answer, just say that you don't know. Don't try to make up an answer.

QUESTION: {question}
=========
{summaries}
=========
FINAL ANSWER:`,
            inputVariables: ['question', 'summaries']
        });
    }

    async _call(input: ChainInput): Promise<ChainOutput> {
        const question = input.question;
        const docs = input.docs || [];

        this.addStep('Extract Relevant Text', `Processing ${docs.length} documents`);

        // Extract relevant text from each document
        const relevantTexts: Array<{ text: string, source: string }> = [];

        for (let i = 0; i < docs.length; i++) {
            const doc = docs[i];
            const questionPrompt = this.questionPrompt.format({
                context: doc.content,
                question
            });

            const relevantText = await this.callLLM(questionPrompt);

            if (relevantText.trim()) {
                relevantTexts.push({
                    text: relevantText,
                    source: doc.source || `Document ${i + 1}`
                });
            }
        }

        this.addStep('Combine Answers', `Combining ${relevantTexts.length} relevant texts`);

        // Combine relevant texts with sources
        const summaries = relevantTexts
            .map(({ text, source }) => `${text}\nSOURCE: ${source}`)
            .join('\n\n');

        const combinePrompt = this.combinePrompt.format({
            question,
            summaries
        });

        const finalAnswer = await this.callLLM(combinePrompt);

        return {
            result: finalAnswer,
            sourceDocuments: relevantTexts.map(rt => rt.source)
        };
    }
}
