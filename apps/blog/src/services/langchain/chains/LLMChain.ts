
import { BaseChain, ChainConfig, ChainInput, ChainOutput } from '../core/BaseChain';
import { PromptTemplate } from '../prompts/PromptTemplate';

// LLM Chain configuration
export interface LLMChainConfig extends ChainConfig {
    prompt: PromptTemplate;
    outputKey?: string;
    outputParser?: (output: string) => any;
}

// Simple LLM Chain - prompts the LLM and returns the response
export class LLMChain extends BaseChain {
    private prompt: PromptTemplate;
    private outputKey: string;
    private outputParser?: (output: string) => any;

    constructor(config: LLMChainConfig) {
        super(config);
        this.prompt = config.prompt;
        this.outputKey = config.outputKey || 'text';
        this.outputParser = config.outputParser;
    }

    async _call(input: ChainInput): Promise<ChainOutput> {
        this.addStep('Format Prompt', 'Formatting prompt template with input variables');

        // Format the prompt with input variables
        const formattedPrompt = this.prompt.format(input);

        this.addStep('Call LLM', `Sending prompt to LLM: ${formattedPrompt.substring(0, 100)}...`);

        // Call the LLM
        const response = await this.callLLM(formattedPrompt);

        this.addStep('Process Response', `Received response: ${response.substring(0, 100)}...`);

        // Parse the output if a parser is provided
        const parsedOutput = this.outputParser ? this.outputParser(response) : response;

        return {
            [this.outputKey]: parsedOutput,
            result: parsedOutput
        };
    }
}

// Sequential Chain - runs multiple chains in sequence
export class SequentialChain extends BaseChain {
    private chains: BaseChain[];
    private inputVariables: string[];
    private outputVariables: string[];

    constructor(config: ChainConfig & {
        chains: BaseChain[];
        inputVariables: string[];
        outputVariables: string[];
    }) {
        super(config);
        this.chains = config.chains;
        this.inputVariables = config.inputVariables;
        this.outputVariables = config.outputVariables;
    }

    async _call(input: ChainInput): Promise<ChainOutput> {
        let currentValues = { ...input };

        for (let i = 0; i < this.chains.length; i++) {
            const chain = this.chains[i];
            this.addStep(`Chain ${i + 1}`, `Executing ${chain.constructor.name}`);

            const result = await chain._call(currentValues);

            // Merge results into current values
            currentValues = { ...currentValues, ...result };

            this.addStep(`Chain ${i + 1} Complete`, `Added outputs: ${Object.keys(result).join(', ')}`);
        }

        // Return only the specified output variables
        const output: ChainOutput = {};
        for (const variable of this.outputVariables) {
            if (currentValues[variable] !== undefined) {
                output[variable] = currentValues[variable];
            }
        }

        output.result = output;
        return output;
    }
}

// Transform Chain - applies a transformation function to the input
export class TransformChain extends BaseChain {
    private transform: (input: ChainInput) => ChainOutput | Promise<ChainOutput>;
    private inputVariables: string[];
    private outputVariables: string[];

    constructor(config: ChainConfig & {
        transform: (input: ChainInput) => ChainOutput | Promise<ChainOutput>;
        inputVariables: string[];
        outputVariables: string[];
    }) {
        super(config);
        this.transform = config.transform;
        this.inputVariables = config.inputVariables;
        this.outputVariables = config.outputVariables;
    }

    async _call(input: ChainInput): Promise<ChainOutput> {
        this.addStep('Transform Input', 'Applying transformation function');

        const result = await this.transform(input);

        this.addStep('Transform Complete', `Generated outputs: ${Object.keys(result).join(', ')}`);

        return {
            ...result,
            result: result
        };
    }
}

// Router Chain - routes to different chains based on input
export class RouterChain extends BaseChain {
    private routes: Map<string, BaseChain>;
    private defaultChain?: BaseChain;
    private routerFn: (input: ChainInput) => string | Promise<string>;

    constructor(config: ChainConfig & {
        routes: Map<string, BaseChain>;
        routerFn: (input: ChainInput) => string | Promise<string>;
        defaultChain?: BaseChain;
    }) {
        super(config);
        this.routes = config.routes;
        this.routerFn = config.routerFn;
        this.defaultChain = config.defaultChain;
    }

    async _call(input: ChainInput): Promise<ChainOutput> {
        this.addStep('Route Selection', 'Determining which chain to use');

        const routeKey = await this.routerFn(input);

        const selectedChain = this.routes.get(routeKey) || this.defaultChain;

        if (!selectedChain) {
            throw new Error(`No chain found for route: ${routeKey}`);
        }

        this.addStep('Execute Route', `Executing chain for route: ${routeKey}`);

        const result = await selectedChain._call(input);

        return {
            ...result,
            selectedRoute: routeKey
        };
    }
}

// Conditional Chain - executes chain based on condition
export class ConditionalChain extends BaseChain {
    private condition: (input: ChainInput) => boolean | Promise<boolean>;
    private trueChain: BaseChain;
    private falseChain?: BaseChain;

    constructor(config: ChainConfig & {
        condition: (input: ChainInput) => boolean | Promise<boolean>;
        trueChain: BaseChain;
        falseChain?: BaseChain;
    }) {
        super(config);
        this.condition = config.condition;
        this.trueChain = config.trueChain;
        this.falseChain = config.falseChain;
    }

    async _call(input: ChainInput): Promise<ChainOutput> {
        this.addStep('Evaluate Condition', 'Checking condition');

        const conditionResult = await this.condition(input);

        if (conditionResult) {
            this.addStep('Execute True Branch', 'Condition is true, executing true chain');
            return await this.trueChain._call(input);
        } else if (this.falseChain) {
            this.addStep('Execute False Branch', 'Condition is false, executing false chain');
            return await this.falseChain._call(input);
        } else {
            this.addStep('Skip Execution', 'Condition is false, no false chain provided');
            return { result: null, skipped: true };
        }
    }
}

// Parallel Chain - executes multiple chains in parallel
export class ParallelChain extends BaseChain {
    private chains: Map<string, BaseChain>;

    constructor(config: ChainConfig & {
        chains: Map<string, BaseChain>;
    }) {
        super(config);
        this.chains = config.chains;
    }

    async _call(input: ChainInput): Promise<ChainOutput> {
        this.addStep('Start Parallel Execution', `Executing ${this.chains.size} chains in parallel`);

        const promises = Array.from(this.chains.entries()).map(async ([key, chain]) => {
            try {
                const result = await chain._call(input);
                return { key, result, success: true };
            } catch (error) {
                return { key, error, success: false };
            }
        });

        const results = await Promise.all(promises);

        const output: ChainOutput = { result: {} };

        for (const { key, result, error, success } of results) {
            if (success) {
                output[key] = result;
                (output.result as any)[key] = result;
            } else {
                output[`${key}_error`] = error;
            }
        }

        this.addStep('Parallel Execution Complete', `Completed ${results.filter(r => r.success).length}/${results.length} chains successfully`);

        return output;
    }
}
