
// Base prompt template interface
export interface PromptTemplateInput {
    [key: string]: any;
}

export interface PromptTemplateConfig {
    template: string;
    inputVariables: string[];
    partialVariables?: Record<string, string>;
    templateFormat?: 'f-string' | 'jinja2';
    validateTemplate?: boolean;
}

// Base prompt template class
export class PromptTemplate {
    public template: string;
    public inputVariables: string[];
    public partialVariables: Record<string, string>;
    public templateFormat: 'f-string' | 'jinja2';

    constructor(config: PromptTemplateConfig) {
        this.template = config.template;
        this.inputVariables = config.inputVariables;
        this.partialVariables = config.partialVariables || {};
        this.templateFormat = config.templateFormat || 'f-string';

        if (config.validateTemplate !== false) {
            this.validateTemplate();
        }
    }

    // Format the template with input variables
    format(input: PromptTemplateInput): string {
        const allVariables = { ...this.partialVariables, ...input };
        let formattedTemplate = this.template;

        // Replace variables in the template
        for (const [key, value] of Object.entries(allVariables)) {
            const regex = new RegExp(`\\{${key}\\}`, 'g');
            formattedTemplate = formattedTemplate.replace(regex, String(value));
        }

        return formattedTemplate;
    }

    // Validate that all required variables are present in the template
    private validateTemplate(): void {
        const templateVars = this.extractVariables(this.template);
        const missingVars = this.inputVariables.filter(v => !templateVars.includes(v));
        const extraVars = templateVars.filter(v =>
            !this.inputVariables.includes(v) && !this.partialVariables.hasOwnProperty(v)
        );

        if (missingVars.length > 0) {
            throw new Error(`Template is missing variables: ${missingVars.join(', ')}`);
        }

        if (extraVars.length > 0) {
            console.warn(`Template has undefined variables: ${extraVars.join(', ')}`);
        }
    }

    // Extract variables from template string
    private extractVariables(template: string): string[] {
        const matches = template.match(/\{([^}]+)\}/g);
        if (!matches) return [];

        return matches.map(match => match.slice(1, -1));
    }

    // Create a partial template with some variables filled
    partial(partialVariables: Record<string, string>): PromptTemplate {
        return new PromptTemplate({
            template: this.template,
            inputVariables: this.inputVariables.filter(v => !partialVariables.hasOwnProperty(v)),
            partialVariables: { ...this.partialVariables, ...partialVariables },
            templateFormat: this.templateFormat
        });
    }

    // Static factory method
    static fromTemplate(template: string, inputVariables?: string[]): PromptTemplate {
        const extractedVars = inputVariables || new PromptTemplate({
            template,
            inputVariables: [],
            validateTemplate: false
        }).extractVariables(template);

        return new PromptTemplate({
            template,
            inputVariables: extractedVars
        });
    }
}

// Chat prompt template for conversation-style prompts
export class ChatPromptTemplate {
    public messages: ChatMessage[];

    constructor(messages: ChatMessage[]) {
        this.messages = messages;
    }

    format(input: PromptTemplateInput): ChatMessage[] {
        return this.messages.map(message => ({
            role: message.role,
            content: typeof message.content === 'string'
                ? this.formatString(message.content, input)
                : message.content.format(input)
        }));
    }

    private formatString(template: string, input: PromptTemplateInput): string {
        let formatted = template;
        for (const [key, value] of Object.entries(input)) {
            const regex = new RegExp(`\\{${key}\\}`, 'g');
            formatted = formatted.replace(regex, String(value));
        }
        return formatted;
    }

    static fromMessages(messages: Array<[string, string | PromptTemplate]>): ChatPromptTemplate {
        const chatMessages: ChatMessage[] = messages.map(([role, content]) => ({
            role: role as 'system' | 'user' | 'assistant',
            content: typeof content === 'string' ? content : content
        }));

        return new ChatPromptTemplate(chatMessages);
    }
}

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string | PromptTemplate;
}

// Few-shot prompt template for providing examples
export class FewShotPromptTemplate extends PromptTemplate {
    public examples: PromptTemplateInput[];
    public examplePrompt: PromptTemplate;
    public exampleSeparator: string;

    constructor(config: {
        examples: PromptTemplateInput[];
        examplePrompt: PromptTemplate;
        suffix: string;
        inputVariables: string[];
        exampleSeparator?: string;
        prefix?: string;
    }) {
        const prefix = config.prefix || '';
        const exampleSeparator = config.exampleSeparator || '\n\n';

        // Build the template with examples
        const exampleStrings = config.examples.map(example =>
            config.examplePrompt.format(example)
        );

        const template = [
            prefix,
            exampleStrings.join(exampleSeparator),
            config.suffix
        ].filter(Boolean).join(exampleSeparator);

        super({
            template,
            inputVariables: config.inputVariables
        });

        this.examples = config.examples;
        this.examplePrompt = config.examplePrompt;
        this.exampleSeparator = exampleSeparator;
    }
}

// Prompt template selector - chooses template based on input
export class ConditionalPromptSelector {
    private conditions: Array<{
        condition: (input: PromptTemplateInput) => boolean;
        template: PromptTemplate;
    }>;
    private defaultTemplate: PromptTemplate;

    constructor(config: {
        conditions: Array<{
            condition: (input: PromptTemplateInput) => boolean;
            template: PromptTemplate;
        }>;
        defaultTemplate: PromptTemplate;
    }) {
        this.conditions = config.conditions;
        this.defaultTemplate = config.defaultTemplate;
    }

    select(input: PromptTemplateInput): PromptTemplate {
        for (const { condition, template } of this.conditions) {
            if (condition(input)) {
                return template;
            }
        }
        return this.defaultTemplate;
    }

    format(input: PromptTemplateInput): string {
        const selectedTemplate = this.select(input);
        return selectedTemplate.format(input);
    }
}

// Common prompt templates
export const COMMON_PROMPTS = {
    // Question answering
    QA_TEMPLATE: new PromptTemplate({
        template: `Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

Context: {context}

Question: {question}
Answer:`,
        inputVariables: ['context', 'question']
    }),

    // Summarization
    SUMMARIZE_TEMPLATE: new PromptTemplate({
        template: `Please summarize the following text:

Text: {text}

Summary:`,
        inputVariables: ['text']
    }),

    // Code generation
    CODE_TEMPLATE: new PromptTemplate({
        template: `Write {language} code to solve the following problem:

Problem: {problem}

Requirements:
{requirements}

Code:`,
        inputVariables: ['language', 'problem', 'requirements']
    }),

    // Translation
    TRANSLATE_TEMPLATE: new PromptTemplate({
        template: `Translate the following text from {source_language} to {target_language}:

Text: {text}

Translation:`,
        inputVariables: ['source_language', 'target_language', 'text']
    }),

    // Conversation
    CONVERSATION_TEMPLATE: new PromptTemplate({
        template: `The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:
{history}
Human: {input}
AI:`,
        inputVariables: ['history', 'input']
    }),

    // Few-shot classification
    CLASSIFICATION_TEMPLATE: new PromptTemplate({
        template: `Classify the following text into one of these categories: {categories}

Examples:
{examples}

Text: {text}
Category:`,
        inputVariables: ['categories', 'examples', 'text']
    }),

    // SQL generation
    SQL_TEMPLATE: new PromptTemplate({
        template: `Given the following database schema:
{schema}

Generate a SQL query to answer the following question:
{question}

SQL Query:`,
        inputVariables: ['schema', 'question']
    })
};
