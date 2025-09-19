const TOKEN_RATIO = 4;

const MODEL_PRICING: Record<string, { input: number; output: number }> = {
    'qwen/qwen2.5-7b-instruct/bf-16': { input: 0.0001, output: 0.0001 },
    'google/gemma-3-27b-instruct/bf-16': { input: 0.0002, output: 0.0002 },
    'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
    'gpt-4': { input: 0.03, output: 0.06 },
};

export function estimateTokens(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / TOKEN_RATIO);
}

export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const pricing = MODEL_PRICING[model] ?? MODEL_PRICING['qwen/qwen2.5-7b-instruct/bf-16'];
    return (inputTokens * pricing.input + outputTokens * pricing.output) / 1000;
}

export function getModelProvider(model: string): string {
    if (!model) return 'unknown';
    if (model.includes('qwen')) return 'alibaba';
    if (model.includes('gemma') || model.includes('google')) return 'google';
    if (model.includes('gpt')) return 'openai';
    return 'unknown';
}
