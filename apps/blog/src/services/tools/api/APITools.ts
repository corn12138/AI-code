/**
 * API调用工具集
 * 支持HTTP请求、GraphQL查询、WebSocket连接等功能
 */

import { BaseTool, ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '../ToolProtocol';

// HTTP请求工具
export class HTTPRequestTool extends BaseTool {
    constructor() {
        const definition: ToolDefinition = {
            name: 'http_request',
            description: 'Make HTTP requests to APIs',
            category: 'api',
            parameters: {
                url: {
                    name: 'url',
                    type: 'string',
                    description: 'Request URL',
                    required: true,
                    pattern: '^https?://.+'
                },
                method: {
                    name: 'method',
                    type: 'string',
                    description: 'HTTP method',
                    required: false,
                    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
                    default: 'GET'
                },
                headers: {
                    name: 'headers',
                    type: 'object',
                    description: 'Request headers',
                    required: false,
                    properties: {}
                },
                body: {
                    name: 'body',
                    type: 'string',
                    description: 'Request body (JSON string)',
                    required: false
                },
                timeout: {
                    name: 'timeout',
                    type: 'number',
                    description: 'Request timeout in milliseconds',
                    required: false,
                    default: 30000,
                    minimum: 1000,
                    maximum: 60000
                }
            },
            security: {
                level: 'restricted',
                permissions: ['api:http'],
                sandbox: true,
                timeout: 60000
            },
            examples: [
                {
                    description: 'GET request to API',
                    input: { url: 'https://api.example.com/users', method: 'GET' },
                    output: { status: 200, data: [{ id: 1, name: 'John' }] }
                }
            ]
        };
        super(definition);
    }

    async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
        const { url, method = 'GET', headers = {}, body, timeout = 30000 } = parameters;
        const startTime = Date.now();

        try {
            // 安全检查
            const securityWarnings = this.performSecurityCheck(parameters, context);

            const response = await this.makeRequest(url, method, headers, body, timeout);

            return {
                success: true,
                result: {
                    url,
                    method,
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries()),
                    data: response.data,
                    responseTime: Date.now() - startTime
                },
                metadata: {
                    executionTime: Date.now() - startTime,
                    securityWarnings
                }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'HTTP_REQUEST_ERROR',
                    message: error instanceof Error ? error.message : 'HTTP request failed'
                },
                metadata: {
                    executionTime: Date.now() - startTime,
                    securityWarnings: this.performSecurityCheck(parameters, context)
                }
            };
        }
    }

    private async makeRequest(
        url: string,
        method: string,
        headers: Record<string, string>,
        body?: string,
        timeout: number = 30000
    ): Promise<any> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const requestOptions: RequestInit = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                signal: controller.signal
            };

            if (body && method !== 'GET' && method !== 'HEAD') {
                requestOptions.body = body;
            }

            const response = await fetch(url, requestOptions);

            let data: any;
            const contentType = response.headers.get('content-type');

            if (contentType?.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            return {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                data
            };
        } finally {
            clearTimeout(timeoutId);
        }
    }
}

// GraphQL查询工具
export class GraphQLQueryTool extends BaseTool {
    constructor() {
        const definition: ToolDefinition = {
            name: 'graphql_query',
            description: 'Execute GraphQL queries and mutations',
            category: 'api',
            parameters: {
                endpoint: {
                    name: 'endpoint',
                    type: 'string',
                    description: 'GraphQL endpoint URL',
                    required: true,
                    pattern: '^https?://.+'
                },
                query: {
                    name: 'query',
                    type: 'string',
                    description: 'GraphQL query or mutation',
                    required: true
                },
                variables: {
                    name: 'variables',
                    type: 'object',
                    description: 'Query variables',
                    required: false,
                    properties: {}
                },
                headers: {
                    name: 'headers',
                    type: 'object',
                    description: 'Request headers',
                    required: false,
                    properties: {}
                }
            },
            security: {
                level: 'restricted',
                permissions: ['api:graphql'],
                sandbox: true,
                timeout: 30000
            },
            examples: [
                {
                    description: 'Query user data',
                    input: {
                        endpoint: 'https://api.example.com/graphql',
                        query: 'query { user(id: 1) { name email } }'
                    },
                    output: { data: { user: { name: 'John', email: 'john@example.com' } } }
                }
            ]
        };
        super(definition);
    }

    async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
        const { endpoint, query, variables = {}, headers = {} } = parameters;
        const startTime = Date.now();

        try {
            const result = await this.executeGraphQL(endpoint, query, variables, headers);

            return {
                success: !result.errors,
                result: {
                    data: result.data,
                    errors: result.errors,
                    query,
                    variables,
                    endpoint
                },
                metadata: { executionTime: Date.now() - startTime }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'GRAPHQL_ERROR',
                    message: error instanceof Error ? error.message : 'GraphQL query failed'
                },
                metadata: { executionTime: Date.now() - startTime }
            };
        }
    }

    private async executeGraphQL(
        endpoint: string,
        query: string,
        variables: Record<string, any>,
        headers: Record<string, string>
    ): Promise<any> {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify({
                query,
                variables
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }
}

// WebSocket连接工具
export class WebSocketConnectTool extends BaseTool {
    private static connections: Map<string, WebSocket> = new Map();

    constructor() {
        const definition: ToolDefinition = {
            name: 'websocket_connect',
            description: 'Connect to WebSocket endpoints and manage connections',
            category: 'api',
            parameters: {
                action: {
                    name: 'action',
                    type: 'string',
                    description: 'Action to perform',
                    required: true,
                    enum: ['connect', 'disconnect', 'send', 'status', 'list']
                },
                url: {
                    name: 'url',
                    type: 'string',
                    description: 'WebSocket URL (for connect action)',
                    required: false,
                    pattern: '^wss?://.+'
                },
                connectionId: {
                    name: 'connectionId',
                    type: 'string',
                    description: 'Connection ID (for disconnect/send/status actions)',
                    required: false
                },
                message: {
                    name: 'message',
                    type: 'string',
                    description: 'Message to send (for send action)',
                    required: false
                },
                protocols: {
                    name: 'protocols',
                    type: 'array',
                    description: 'WebSocket protocols',
                    required: false,
                    items: {
                        name: 'protocol',
                        type: 'string',
                        description: 'Protocol name',
                        required: false
                    }
                }
            },
            security: {
                level: 'restricted',
                permissions: ['api:websocket'],
                sandbox: true,
                timeout: 10000
            },
            examples: [
                {
                    description: 'Connect to WebSocket',
                    input: { action: 'connect', url: 'wss://echo.websocket.org' },
                    output: { connectionId: 'ws-123', status: 'connected' }
                }
            ]
        };
        super(definition);
    }

    async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
        const { action, url, connectionId, message, protocols = [] } = parameters;
        const startTime = Date.now();

        try {
            let result: any;

            switch (action) {
                case 'connect':
                    result = await this.connectWebSocket(url!, protocols);
                    break;
                case 'disconnect':
                    result = this.disconnectWebSocket(connectionId!);
                    break;
                case 'send':
                    result = this.sendMessage(connectionId!, message!);
                    break;
                case 'status':
                    result = this.getConnectionStatus(connectionId!);
                    break;
                case 'list':
                    result = this.listConnections();
                    break;
                default:
                    throw new Error(`Unknown action: ${action}`);
            }

            return {
                success: true,
                result,
                metadata: { executionTime: Date.now() - startTime }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'WEBSOCKET_ERROR',
                    message: error instanceof Error ? error.message : 'WebSocket operation failed'
                },
                metadata: { executionTime: Date.now() - startTime }
            };
        }
    }

    private async connectWebSocket(url: string, protocols: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            const connectionId = `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            try {
                const ws = new WebSocket(url, protocols);

                ws.onopen = () => {
                    WebSocketConnectTool.connections.set(connectionId, ws);
                    resolve({
                        connectionId,
                        url,
                        status: 'connected',
                        protocols: ws.protocol ? [ws.protocol] : [],
                        timestamp: new Date().toISOString()
                    });
                };

                ws.onerror = (error) => {
                    reject(new Error(`WebSocket connection failed: ${error}`));
                };

                ws.onclose = (event) => {
                    WebSocketConnectTool.connections.delete(connectionId);
                    console.log(`WebSocket ${connectionId} closed:`, event.code, event.reason);
                };

                ws.onmessage = (event) => {
                    console.log(`WebSocket ${connectionId} received:`, event.data);
                };

                // 连接超时
                setTimeout(() => {
                    if (ws.readyState === WebSocket.CONNECTING) {
                        ws.close();
                        reject(new Error('WebSocket connection timeout'));
                    }
                }, 10000);

            } catch (error) {
                reject(error);
            }
        });
    }

    private disconnectWebSocket(connectionId: string): any {
        const ws = WebSocketConnectTool.connections.get(connectionId);

        if (!ws) {
            throw new Error(`Connection not found: ${connectionId}`);
        }

        ws.close();
        WebSocketConnectTool.connections.delete(connectionId);

        return {
            connectionId,
            status: 'disconnected',
            timestamp: new Date().toISOString()
        };
    }

    private sendMessage(connectionId: string, message: string): any {
        const ws = WebSocketConnectTool.connections.get(connectionId);

        if (!ws) {
            throw new Error(`Connection not found: ${connectionId}`);
        }

        if (ws.readyState !== WebSocket.OPEN) {
            throw new Error(`Connection not open: ${connectionId}`);
        }

        ws.send(message);

        return {
            connectionId,
            message,
            sent: true,
            timestamp: new Date().toISOString()
        };
    }

    private getConnectionStatus(connectionId: string): any {
        const ws = WebSocketConnectTool.connections.get(connectionId);

        if (!ws) {
            throw new Error(`Connection not found: ${connectionId}`);
        }

        const states = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];

        return {
            connectionId,
            readyState: ws.readyState,
            state: states[ws.readyState],
            url: ws.url,
            protocol: ws.protocol,
            bufferedAmount: ws.bufferedAmount
        };
    }

    private listConnections(): any {
        const connections = Array.from(WebSocketConnectTool.connections.entries()).map(([id, ws]) => ({
            connectionId: id,
            url: ws.url,
            readyState: ws.readyState,
            state: ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][ws.readyState],
            protocol: ws.protocol,
            bufferedAmount: ws.bufferedAmount
        }));

        return {
            connections,
            count: connections.length,
            active: connections.filter(c => c.readyState === WebSocket.OPEN).length
        };
    }
}
