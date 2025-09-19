import type { ChatSessionConfig } from '../types';

const FALLBACK_MODELS = [
    'qwen/qwen2.5-7b-instruct/bf-16',
    'google/gemma-3-27b-instruct/bf-16',
];

function parseModelsFromEnv(): string[] {
    const raw = process.env.CHAT_AVAILABLE_MODELS;
    if (!raw) return FALLBACK_MODELS;

    const models = raw
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

    return models.length > 0 ? models : FALLBACK_MODELS;
}

function parseDefaultModel(models: string[]): string {
    const candidate = process.env.CHAT_DEFAULT_MODEL?.trim();
    if (candidate && models.includes(candidate)) {
        return candidate;
    }

    return candidate ?? models[0] ?? FALLBACK_MODELS[0];
}

export function getChatSessionConfig(): ChatSessionConfig {
    const models = parseModelsFromEnv();
    const defaultModel = parseDefaultModel(models);

    const reconnectEnabled = process.env.CHAT_RECONNECT_ENABLED !== 'false';
    const reconnectMaxAttempts = Number(process.env.CHAT_RECONNECT_MAX_ATTEMPTS ?? 3);
    const reconnectInterval = Number(process.env.CHAT_RECONNECT_INTERVAL ?? 1000);
    const reconnectBackoff = Number(process.env.CHAT_RECONNECT_BACKOFF ?? 2);

    return {
        defaultModel,
        availableModels: models,
        chatEndpoint: '/api/chat',
        conversationsEndpoint: '/api/chat/conversations',
        conversationDetailEndpoint: (id: string) => `/api/chat/conversations/${id}`,
        reconnect: reconnectEnabled
            ? {
                  enabled: true,
                  maxAttempts: Number.isFinite(reconnectMaxAttempts) ? reconnectMaxAttempts : 3,
                  interval: Number.isFinite(reconnectInterval) ? reconnectInterval : 1000,
                  backoffFactor: Number.isFinite(reconnectBackoff) ? reconnectBackoff : 2,
              }
            : undefined,
    };
}
