import { useCallback, useRef, useState } from 'react';

/**
 * 认证类型枚举
 */
export type AuthType = 'bearer' | 'basic' | 'custom' | 'none';

/**
 * HTTP 方法枚举
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH';

/**
 * 数据格式类型
 */
export type DataFormat = 'json' | 'form' | 'text' | 'custom';

/**
 * 连接状态
 */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting';

/**
 * SSE 数据解析器
 */
export interface SSEParser {
    /** 是否为有效的 SSE 行 */
    isValidLine: (line: string) => boolean;
    /** 解析 SSE 数据 */
    parseData: (line: string) => any;
    /** 检查是否为结束信号 */
    isEndSignal: (data: any) => boolean;
}

/**
 * 重连配置
 */
export interface ReconnectConfig {
    /** 是否启用自动重连 */
    enabled: boolean;
    /** 最大重连次数 */
    maxAttempts: number;
    /** 重连间隔（毫秒） */
    interval: number;
    /** 重连间隔递增因子 */
    backoffFactor: number;
}

/**
 * 超时配置
 */
export interface TimeoutConfig {
    /** 连接超时（毫秒） */
    connection: number;
    /** 响应超时（毫秒） */
    response: number;
    /** 空闲超时（毫秒） */
    idle: number;
}

/**
 * 数据转换器
 */
export interface DataTransformer {
    /** 发送前的数据转换 */
    request?: (data: any) => any;
    /** 接收后的数据转换 */
    response?: (data: any) => any;
}

/**
 * Chat SSE Hook 配置选项
 */
export interface UseChatSSEOptions {
    /** 消息接收回调 */
    onMessage: (content: string, type: string, data?: any) => void;
    /** 错误处理回调 */
    onError: (error: Error) => void;
    /** 连接状态变化回调 */
    onConnectionChange?: (status: ConnectionStatus) => void;
    /** 重连尝试回调 */
    onReconnectAttempt?: (attempt: number, maxAttempts: number) => void;

    // === API 配置 ===
    /** Chat API 端点，默认为 '/api/chat' */
    chatEndpoint?: string;
    /** HTTP 方法，默认为 'POST' */
    httpMethod?: HttpMethod;
    /** 数据格式，默认为 'json' */
    dataFormat?: DataFormat;
    /** 自定义请求头 */
    headers?: Record<string, string>;
    /** 跨域模式 */
    corsMode?: RequestMode;
    /** 请求凭证模式 */
    credentials?: RequestCredentials;

    // === 认证配置 ===
    /** 认证类型，默认为 'bearer' */
    authType?: AuthType;
    /** 获取认证token的方法 */
    getAuthToken?: () => string | null;
    /** 获取用户名密码（Basic认证） */
    getBasicAuth?: () => { username: string; password: string } | null;
    /** 自定义认证头生成器 */
    getCustomAuthHeader?: () => Record<string, string>;

    // === 模型配置 ===
    /** 默认模型名称 */
    defaultModel?: string;
    /** 获取可用模型的端点 */
    modelsEndpoint?: string;
    /** 模型选择器在请求体中的字段名 */
    modelFieldName?: string;

    // === SSE 配置 ===
    /** 自定义 SSE 解析器 */
    sseParser?: SSEParser;
    /** 是否使用原生 EventSource（而非 fetch） */
    useEventSource?: boolean;
    /** EventSource 初始化配置 */
    eventSourceConfig?: EventSourceInit;

    // === 重连配置 ===
    reconnect?: ReconnectConfig;

    // === 超时配置 ===
    timeout?: TimeoutConfig;

    // === 数据转换 ===
    dataTransformer?: DataTransformer;

    // === 自定义请求构建器 ===
    /** 自定义请求体构建器 */
    buildRequestBody?: (message: string, conversationId?: string | null, model?: string, extraData?: any) => any;
    /** 自定义 URL 构建器 */
    buildRequestUrl?: (endpoint: string, params?: Record<string, string>) => string;

    // === 调试配置 ===
    /** 是否启用调试日志 */
    debug?: boolean;
    /** 自定义日志函数 */
    logger?: (level: 'info' | 'warn' | 'error', message: string, data?: any) => void;
}

/**
 * Chat SSE Hook 返回值
 */
export interface UseChatSSEReturn {
    /** 发送消息 */
    sendMessage: (message: string, conversationId?: string | null, model?: string, extraData?: any) => Promise<void>;
    /** 断开连接 */
    disconnect: () => void;
    /** 获取可用模型列表 */
    getAvailableModels: () => Promise<{ availableModels: string[]; defaultModel: string }>;
    /** 连接状态 */
    connectionStatus: ConnectionStatus;
    /** 是否已连接 */
    isConnected: boolean;
    /** 重连次数 */
    reconnectAttempts: number;
    /** 手动重连 */
    reconnect: () => Promise<void>;
}

/**
 * Chat SSE 数据类型
 */
export interface ChatSSEData {
    type: 'content' | 'finish' | 'error' | string;
    content?: string;
    conversationId?: string;
    messageId?: string;
    model?: string;
    error?: string;
    [key: string]: any;
}

/**
 * 默认 SSE 解析器
 */
const defaultSSEParser: SSEParser = {
    isValidLine: (line: string) => line.startsWith('data: '),
    parseData: (line: string) => {
        try {
            return JSON.parse(line.slice(6));
        } catch {
            return { type: 'content', content: line.slice(6) };
        }
    },
    isEndSignal: (data: any) => data?.type === 'finish' || data?.type === 'error'
};

/**
 * 默认重连配置
 */
const defaultReconnectConfig: ReconnectConfig = {
    enabled: false,
    maxAttempts: 3,
    interval: 1000,
    backoffFactor: 2
};

/**
 * 默认超时配置
 */
const defaultTimeoutConfig: TimeoutConfig = {
    connection: 10000,
    response: 30000,
    idle: 60000
};

/**
 * useChatSSE - 用于处理Chat流式对话的Hook
 * 
 * @description
 * 这个Hook提供了与AI聊天服务进行SSE（Server-Sent Events）通信的能力。
 * 支持实时流式消息接收、多轮对话、模型选择、自动重连等功能。
 * 高度可配置，支持各种不同的API接口和认证方式。
 * 
 * @example
 * ```tsx
 * import { useChatSSE } from '@corn12138/hooks';
 * 
 * // 基础用法
 * function ChatComponent() {
 *   const { sendMessage, connectionStatus } = useChatSSE({
 *     onMessage: (content, type, data) => {
 *       console.log('收到消息:', content);
 *     },
 *     onError: (error) => {
 *       console.error('Chat错误:', error);
 *     }
 *   });
 * 
 *   return <div>连接状态: {connectionStatus}</div>;
 * }
 * 
 * // 高级自定义
 * function CustomChatComponent() {
 *   const { sendMessage } = useChatSSE({
 *     chatEndpoint: 'https://api.example.com/v2/chat',
 *     authType: 'custom',
 *     getCustomAuthHeader: () => ({ 'X-API-Key': 'your-key' }),
 *     reconnect: { enabled: true, maxAttempts: 5 },
 *     sseParser: {
 *       isValidLine: (line) => line.startsWith('event: '),
 *       parseData: (line) => JSON.parse(line.slice(7)),
 *       isEndSignal: (data) => data.event === 'done'
 *     },
 *     onMessage: (content, type) => console.log(content),
 *     onError: (error) => console.error(error)
 *   });
 * 
 *   return <div>自定义聊天组件</div>;
 * }
 * ```
 */
export function useChatSSE({
    onMessage,
    onError,
    onConnectionChange,
    onReconnectAttempt,

    // API 配置
    chatEndpoint = '/api/chat',
    httpMethod = 'POST',
    dataFormat = 'json',
    headers = {},
    corsMode = 'cors',
    credentials = 'same-origin',

    // 认证配置
    authType = 'bearer',
    getAuthToken = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('accessToken');
        }
        return null;
    },
    getBasicAuth,
    getCustomAuthHeader,

    // 模型配置
    defaultModel = 'qwen/qwen2.5-7b-instruct/bf-16',
    modelsEndpoint,
    modelFieldName = 'model',

    // SSE 配置
    sseParser = defaultSSEParser,
    useEventSource = false,
    eventSourceConfig = {},

    // 重连配置
    reconnect = defaultReconnectConfig,

    // 超时配置
    timeout = defaultTimeoutConfig,

    // 数据转换
    dataTransformer,

    // 自定义构建器
    buildRequestBody,
    buildRequestUrl,

    // 调试配置
    debug = false,
    logger = (level, message, data) => {
        if (debug) {
            console[level](`[useChatSSE] ${message}`, data || '');
        }
    }
}: UseChatSSEOptions): UseChatSSEReturn {
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
    const [reconnectAttempts, setReconnectAttempts] = useState(0);

    const eventSourceRef = useRef<EventSource | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    /**
     * 更新连接状态
     */
    const updateConnectionStatus = useCallback((status: ConnectionStatus) => {
        setConnectionStatus(status);
        onConnectionChange?.(status);
        logger('info', `连接状态变更: ${status}`);
    }, [onConnectionChange, logger]);

    /**
     * 构建认证头
     */
    const buildAuthHeaders = useCallback((): Record<string, string> => {
        switch (authType) {
            case 'bearer': {
                const token = getAuthToken();
                return token ? { 'Authorization': `Bearer ${token}` } : {};
            }
            case 'basic': {
                const auth = getBasicAuth?.();
                if (auth) {
                    const encoded = btoa(`${auth.username}:${auth.password}`);
                    return { 'Authorization': `Basic ${encoded}` };
                }
                return {};
            }
            case 'custom': {
                return getCustomAuthHeader?.() || {};
            }
            case 'none':
            default:
                return {};
        }
    }, [authType, getAuthToken, getBasicAuth, getCustomAuthHeader]);

    /**
     * 构建请求体
     */
    const buildDefaultRequestBody = useCallback((
        message: string,
        conversationId?: string | null,
        model?: string,
        extraData?: any
    ) => {
        const body = {
            message,
            conversationId,
            [modelFieldName]: model || defaultModel,
            ...extraData
        };

        return dataTransformer?.request ? dataTransformer.request(body) : body;
    }, [modelFieldName, defaultModel, dataTransformer]);

    /**
     * 构建请求 URL
     */
    const buildDefaultRequestUrl = useCallback((endpoint: string, params?: Record<string, string>) => {
        if (!params || Object.keys(params).length === 0) return endpoint;

        const url = new URL(endpoint, window.location.origin);
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.set(key, value);
        });
        return url.toString();
    }, []);

    /**
     * 发送消息并建立连接
     */
    const sendMessage = useCallback(async (
        message: string,
        conversationId?: string | null,
        model?: string,
        extraData?: any
    ) => {
        try {
            updateConnectionStatus('connecting');

            // 取消之前的请求
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }

            logger('info', '开始发送消息', { message, conversationId, model });

            // 构建请求体
            const requestBody = buildRequestBody
                ? buildRequestBody(message, conversationId, model, extraData)
                : buildDefaultRequestBody(message, conversationId, model, extraData);

            // 构建请求头
            const authHeaders = buildAuthHeaders();
            const requestHeaders = {
                ...authHeaders,
                ...headers
            };

            // 根据数据格式设置Content-Type
            if (dataFormat === 'json') {
                requestHeaders['Content-Type'] = 'application/json';
            } else if (dataFormat === 'form') {
                requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
            }

            // 构建URL
            const requestUrl = buildRequestUrl
                ? buildRequestUrl(chatEndpoint)
                : buildDefaultRequestUrl(chatEndpoint);

            if (useEventSource) {
                // 使用 EventSource
                const url = new URL(requestUrl);
                url.searchParams.set('message', message);
                if (conversationId) url.searchParams.set('conversationId', conversationId);
                if (model) url.searchParams.set(modelFieldName, model);

                const eventSource = new EventSource(url.toString(), eventSourceConfig);
                eventSourceRef.current = eventSource;

                eventSource.onopen = () => {
                    updateConnectionStatus('connected');
                    setReconnectAttempts(0);
                };

                eventSource.onmessage = (event) => {
                    try {
                        const data = sseParser.parseData(`data: ${event.data}`);
                        const transformedData = dataTransformer?.response ? dataTransformer.response(data) : data;
                        onMessage(transformedData.content || '', transformedData.type || 'content', transformedData);

                        if (sseParser.isEndSignal(transformedData)) {
                            eventSource.close();
                            updateConnectionStatus('disconnected');
                        }
                    } catch (error) {
                        logger('error', 'EventSource 数据解析错误', error);
                    }
                };

                eventSource.onerror = (error) => {
                    logger('error', 'EventSource 连接错误', error);
                    updateConnectionStatus('error');
                    onError(new Error('EventSource connection failed'));

                    if (reconnect.enabled && reconnectAttempts < reconnect.maxAttempts) {
                        scheduleReconnect(message, conversationId, model, extraData);
                    }
                };

            } else {
                // 使用 fetch + ReadableStream
                abortControllerRef.current = new AbortController();
                const timeoutId = setTimeout(() => {
                    abortControllerRef.current?.abort();
                }, timeout.connection);

                let body: any;
                if (dataFormat === 'json') {
                    body = JSON.stringify(requestBody);
                } else if (dataFormat === 'form') {
                    body = new URLSearchParams(requestBody as Record<string, string>);
                } else {
                    body = requestBody;
                }

                const response = await fetch(requestUrl, {
                    method: httpMethod,
                    headers: requestHeaders,
                    body: httpMethod !== 'GET' ? body : undefined,
                    signal: abortControllerRef.current.signal,
                    mode: corsMode,
                    credentials
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                if (!response.body) {
                    throw new Error('No response body');
                }

                updateConnectionStatus('connected');
                setReconnectAttempts(0);

                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value);
                        const lines = chunk.split('\n');

                        for (const line of lines) {
                            if (sseParser.isValidLine(line)) {
                                try {
                                    const data = sseParser.parseData(line);
                                    const transformedData = dataTransformer?.response ? dataTransformer.response(data) : data;
                                    onMessage(transformedData.content || '', transformedData.type || 'content', transformedData);

                                    if (sseParser.isEndSignal(transformedData)) {
                                        reader.cancel();
                                        updateConnectionStatus('disconnected');
                                        return;
                                    }
                                } catch (error) {
                                    logger('warn', 'SSE 数据解析失败', { line, error });
                                }
                            }
                        }
                    }
                } catch (error) {
                    if (error instanceof Error && error.name !== 'AbortError') {
                        logger('error', 'ReadableStream 读取错误', error);
                        throw error;
                    }
                } finally {
                    updateConnectionStatus('disconnected');
                    reader.releaseLock();
                }
            }

        } catch (error) {
            updateConnectionStatus('error');
            logger('error', '发送消息失败', error);
            onError(error as Error);

            if (reconnect.enabled && reconnectAttempts < reconnect.maxAttempts) {
                scheduleReconnect(message, conversationId, model, extraData);
            }
        }
    }, [
        updateConnectionStatus, logger, buildRequestBody, buildDefaultRequestBody,
        buildAuthHeaders, headers, dataFormat, buildRequestUrl, buildDefaultRequestUrl,
        chatEndpoint, useEventSource, eventSourceConfig, sseParser, dataTransformer,
        onMessage, reconnect, reconnectAttempts, httpMethod, corsMode, credentials,
        timeout, modelFieldName, onError
    ]);

    /**
     * 计划重连
     */
    const scheduleReconnect = useCallback((
        message: string,
        conversationId?: string | null,
        model?: string,
        extraData?: any
    ) => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        const nextAttempt = reconnectAttempts + 1;
        const delay = reconnect.interval * Math.pow(reconnect.backoffFactor, reconnectAttempts);

        logger('info', `准备第 ${nextAttempt} 次重连`, { delay });
        onReconnectAttempt?.(nextAttempt, reconnect.maxAttempts);

        updateConnectionStatus('reconnecting');
        setReconnectAttempts(nextAttempt);

        reconnectTimeoutRef.current = setTimeout(() => {
            sendMessage(message, conversationId, model, extraData);
        }, delay);
    }, [reconnectAttempts, reconnect, logger, onReconnectAttempt, updateConnectionStatus, sendMessage]);

    /**
     * 断开连接
     */
    const disconnect = useCallback(() => {
        logger('info', '手动断开连接');

        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        updateConnectionStatus('disconnected');
        setReconnectAttempts(0);
    }, [logger, updateConnectionStatus]);

    /**
     * 手动重连
     */
    const manualReconnect = useCallback(async () => {
        logger('info', '手动触发重连');
        setReconnectAttempts(0);
        // 重连需要重新发送最后一条消息，这里先提供接口
        updateConnectionStatus('disconnected');
    }, [logger, updateConnectionStatus]);

    /**
     * 获取可用模型列表
     */
    const getAvailableModels = useCallback(async () => {
        try {
            const endpoint = modelsEndpoint || chatEndpoint;
            const authHeaders = buildAuthHeaders();
            const requestHeaders = { ...authHeaders, ...headers };

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: requestHeaders,
                mode: corsMode,
                credentials
            });

            if (response.ok) {
                const data = await response.json();
                return dataTransformer?.response ? dataTransformer.response(data) : data;
            }
        } catch (error) {
            logger('error', '获取模型列表失败', error);
        }

        // 返回默认配置
        return {
            availableModels: [defaultModel, 'google/gemma-3-27b-instruct/bf-16'],
            defaultModel
        };
    }, [modelsEndpoint, chatEndpoint, buildAuthHeaders, headers, corsMode, credentials, dataTransformer, logger, defaultModel]);

    return {
        sendMessage,
        disconnect,
        getAvailableModels,
        connectionStatus,
        isConnected: connectionStatus === 'connected',
        reconnectAttempts,
        reconnect: manualReconnect
    };
} 