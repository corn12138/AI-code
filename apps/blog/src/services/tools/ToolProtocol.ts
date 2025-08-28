/**
 * 工具调用协议系统 - 企业级工具执行框架
 * 支持29种工具类型，包括浏览器操作、文件读写、Shell命令执行等
 */

export interface ToolParameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    description: string;
    required: boolean;
    default?: any;
    enum?: any[];
    pattern?: string;
    minimum?: number;
    maximum?: number;
    items?: ToolParameter;
    properties?: Record<string, ToolParameter>;
}

export interface ToolDefinition {
    name: string;
    description: string;
    category: 'browser' | 'file' | 'shell' | 'code' | 'data' | 'api' | 'ml' | 'system';
    parameters: Record<string, ToolParameter>;
    security: {
        level: 'safe' | 'restricted' | 'dangerous';
        permissions: string[];
        sandbox: boolean;
        timeout: number; // 超时时间（毫秒）
    };
    examples: Array<{
        description: string;
        input: Record<string, any>;
        output: any;
    }>;
}

export interface ToolExecutionContext {
    userId?: string;
    sessionId?: string;
    workspaceId?: string;
    permissions: string[];
    environment: 'browser' | 'node' | 'worker';
    constraints: {
        maxExecutionTime: number;
        maxMemoryUsage: number;
        allowedDomains: string[];
        allowedPaths: string[];
        denyPatterns: string[];
    };
}

export interface ToolExecutionResult {
    success: boolean;
    result?: any;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    metadata: {
        executionTime: number;
        memoryUsed?: number;
        cacheHit?: boolean;
        securityWarnings?: string[];
    };
}

export interface ToolCall {
    id: string;
    name: string;
    parameters: Record<string, any>;
    context: ToolExecutionContext;
}

export abstract class BaseTool {
    protected definition: ToolDefinition;
    protected cache: Map<string, { result: any; timestamp: number }> = new Map();
    protected readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

    constructor(definition: ToolDefinition) {
        this.definition = definition;
    }

    get name(): string {
        return this.definition.name;
    }

    get description(): string {
        return this.definition.description;
    }

    get category(): string {
        return this.definition.category;
    }

    get definition_(): ToolDefinition {
        return this.definition;
    }

    // 验证参数
    validateParameters(parameters: Record<string, any>): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        // 检查必需参数
        for (const [name, param] of Object.entries(this.definition.parameters)) {
            if (param.required && !(name in parameters)) {
                errors.push(`Missing required parameter: ${name}`);
            }
        }

        // 检查参数类型和约束
        for (const [name, value] of Object.entries(parameters)) {
            const param = this.definition.parameters[name];
            if (!param) {
                errors.push(`Unknown parameter: ${name}`);
                continue;
            }

            const validation = this.validateParameterValue(value, param);
            if (!validation.valid) {
                errors.push(`Parameter ${name}: ${validation.error}`);
            }
        }

        return { valid: errors.length === 0, errors };
    }

    private validateParameterValue(value: any, param: ToolParameter): { valid: boolean; error?: string } {
        // 类型检查
        if (param.type === 'string' && typeof value !== 'string') {
            return { valid: false, error: 'Must be a string' };
        }
        if (param.type === 'number' && typeof value !== 'number') {
            return { valid: false, error: 'Must be a number' };
        }
        if (param.type === 'boolean' && typeof value !== 'boolean') {
            return { valid: false, error: 'Must be a boolean' };
        }
        if (param.type === 'array' && !Array.isArray(value)) {
            return { valid: false, error: 'Must be an array' };
        }
        if (param.type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
            return { valid: false, error: 'Must be an object' };
        }

        // 枚举检查
        if (param.enum && !param.enum.includes(value)) {
            return { valid: false, error: `Must be one of: ${param.enum.join(', ')}` };
        }

        // 模式检查
        if (param.pattern && typeof value === 'string' && !new RegExp(param.pattern).test(value)) {
            return { valid: false, error: `Must match pattern: ${param.pattern}` };
        }

        // 数值范围检查
        if (typeof value === 'number') {
            if (param.minimum !== undefined && value < param.minimum) {
                return { valid: false, error: `Must be >= ${param.minimum}` };
            }
            if (param.maximum !== undefined && value > param.maximum) {
                return { valid: false, error: `Must be <= ${param.maximum}` };
            }
        }

        return { valid: true };
    }

    // 检查权限
    checkPermissions(context: ToolExecutionContext): { allowed: boolean; missing: string[] } {
        const requiredPermissions = this.definition.security.permissions;
        const userPermissions = context.permissions;

        const missing = requiredPermissions.filter(perm => !userPermissions.includes(perm));

        return {
            allowed: missing.length === 0,
            missing
        };
    }

    // 生成缓存键
    protected generateCacheKey(parameters: Record<string, any>): string {
        return `${this.name}:${JSON.stringify(parameters)}`;
    }

    // 获取缓存
    protected getFromCache(cacheKey: string): any | null {
        const cached = this.cache.get(cacheKey);
        if (!cached) return null;

        const now = Date.now();
        if (now - cached.timestamp > this.CACHE_TTL) {
            this.cache.delete(cacheKey);
            return null;
        }

        return cached.result;
    }

    // 设置缓存
    protected setCache(cacheKey: string, result: any): void {
        this.cache.set(cacheKey, {
            result,
            timestamp: Date.now()
        });
    }

    // 清理过期缓存
    protected cleanupCache(): void {
        const now = Date.now();
        for (const [key, cached] of this.cache.entries()) {
            if (now - cached.timestamp > this.CACHE_TTL) {
                this.cache.delete(key);
            }
        }
    }

    // 抽象方法：执行工具
    abstract execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult>;

    // 执行工具（带验证和缓存）
    async run(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
        const startTime = Date.now();

        try {
            // 参数验证
            const paramValidation = this.validateParameters(parameters);
            if (!paramValidation.valid) {
                return {
                    success: false,
                    error: {
                        code: 'INVALID_PARAMETERS',
                        message: 'Parameter validation failed',
                        details: paramValidation.errors
                    },
                    metadata: {
                        executionTime: Date.now() - startTime
                    }
                };
            }

            // 权限检查
            const permissionCheck = this.checkPermissions(context);
            if (!permissionCheck.allowed) {
                return {
                    success: false,
                    error: {
                        code: 'INSUFFICIENT_PERMISSIONS',
                        message: 'Insufficient permissions',
                        details: { missing: permissionCheck.missing }
                    },
                    metadata: {
                        executionTime: Date.now() - startTime
                    }
                };
            }

            // 检查缓存
            const cacheKey = this.generateCacheKey(parameters);
            const cachedResult = this.getFromCache(cacheKey);
            if (cachedResult) {
                return {
                    success: true,
                    result: cachedResult,
                    metadata: {
                        executionTime: Date.now() - startTime,
                        cacheHit: true
                    }
                };
            }

            // 执行工具
            const result = await this.executeWithTimeout(parameters, context);

            // 缓存结果（如果成功）
            if (result.success && this.shouldCache(parameters)) {
                this.setCache(cacheKey, result.result);
            }

            return {
                ...result,
                metadata: {
                    ...result.metadata,
                    executionTime: Date.now() - startTime,
                    cacheHit: false
                }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'EXECUTION_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown error',
                    details: error
                },
                metadata: {
                    executionTime: Date.now() - startTime
                }
            };
        }
    }

    // 带超时的执行
    private async executeWithTimeout(
        parameters: Record<string, any>,
        context: ToolExecutionContext
    ): Promise<ToolExecutionResult> {
        const timeout = Math.min(this.definition.security.timeout, context.constraints.maxExecutionTime);

        return Promise.race([
            this.execute(parameters, context),
            new Promise<ToolExecutionResult>((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`Tool execution timeout after ${timeout}ms`));
                }, timeout);
            })
        ]);
    }

    // 判断是否应该缓存结果
    protected shouldCache(parameters: Record<string, any>): boolean {
        // 默认缓存只读操作
        return this.definition.category === 'data' ||
            this.name.includes('read') ||
            this.name.includes('get') ||
            this.name.includes('search');
    }

    // 安全检查
    protected performSecurityCheck(parameters: Record<string, any>, context: ToolExecutionContext): string[] {
        const warnings: string[] = [];

        // 检查文件路径安全
        if ('path' in parameters) {
            const path = parameters.path as string;
            if (path.includes('..') || path.startsWith('/')) {
                warnings.push('Potentially unsafe file path detected');
            }

            const allowedPaths = context.constraints.allowedPaths;
            if (allowedPaths.length > 0 && !allowedPaths.some(allowed => path.startsWith(allowed))) {
                warnings.push('Path not in allowed directories');
            }
        }

        // 检查URL安全
        if ('url' in parameters) {
            const url = parameters.url as string;
            try {
                const parsedUrl = new URL(url);
                const allowedDomains = context.constraints.allowedDomains;
                if (allowedDomains.length > 0 && !allowedDomains.includes(parsedUrl.hostname)) {
                    warnings.push('Domain not in allowed list');
                }
            } catch {
                warnings.push('Invalid URL format');
            }
        }

        // 检查命令安全
        if ('command' in parameters) {
            const command = parameters.command as string;
            const denyPatterns = context.constraints.denyPatterns;
            for (const pattern of denyPatterns) {
                if (new RegExp(pattern).test(command)) {
                    warnings.push(`Command matches deny pattern: ${pattern}`);
                }
            }
        }

        return warnings;
    }
}

// 工具注册表
export class ToolRegistry {
    private tools: Map<string, BaseTool> = new Map();
    private categories: Map<string, Set<string>> = new Map();

    register(tool: BaseTool): void {
        this.tools.set(tool.name, tool);

        const category = tool.category;
        if (!this.categories.has(category)) {
            this.categories.set(category, new Set());
        }
        this.categories.get(category)!.add(tool.name);
    }

    unregister(toolName: string): void {
        const tool = this.tools.get(toolName);
        if (tool) {
            this.tools.delete(toolName);
            this.categories.get(tool.category)?.delete(toolName);
        }
    }

    get(toolName: string): BaseTool | undefined {
        return this.tools.get(toolName);
    }

    getByCategory(category: string): BaseTool[] {
        const toolNames = this.categories.get(category) || new Set();
        return Array.from(toolNames).map(name => this.tools.get(name)!).filter(Boolean);
    }

    getAllTools(): BaseTool[] {
        return Array.from(this.tools.values());
    }

    getToolDefinitions(): ToolDefinition[] {
        return this.getAllTools().map(tool => tool.definition_);
    }

    // 根据描述搜索工具
    searchTools(query: string): BaseTool[] {
        const lowerQuery = query.toLowerCase();
        return this.getAllTools().filter(tool =>
            tool.name.toLowerCase().includes(lowerQuery) ||
            tool.description.toLowerCase().includes(lowerQuery)
        );
    }

    // 验证工具调用
    async validateToolCall(toolCall: ToolCall): Promise<{ valid: boolean; errors: string[] }> {
        const tool = this.get(toolCall.name);
        if (!tool) {
            return { valid: false, errors: [`Tool '${toolCall.name}' not found`] };
        }

        return tool.validateParameters(toolCall.parameters);
    }

    // 执行工具调用
    async executeToolCall(toolCall: ToolCall): Promise<ToolExecutionResult> {
        const tool = this.get(toolCall.name);
        if (!tool) {
            return {
                success: false,
                error: {
                    code: 'TOOL_NOT_FOUND',
                    message: `Tool '${toolCall.name}' not found`
                },
                metadata: {
                    executionTime: 0
                }
            };
        }

        return await tool.run(toolCall.parameters, toolCall.context);
    }

    // 批量执行工具调用
    async executeToolCalls(toolCalls: ToolCall[], parallel: boolean = false): Promise<ToolExecutionResult[]> {
        if (parallel) {
            return Promise.all(toolCalls.map(call => this.executeToolCall(call)));
        } else {
            const results: ToolExecutionResult[] = [];
            for (const call of toolCalls) {
                const result = await this.executeToolCall(call);
                results.push(result);

                // 如果出现错误且是关键工具，停止执行
                if (!result.success && this.isCriticalTool(call.name)) {
                    break;
                }
            }
            return results;
        }
    }

    private isCriticalTool(toolName: string): boolean {
        // 定义关键工具，这些工具失败会影响后续执行
        const criticalTools = ['file_write', 'shell_execute', 'browser_navigate'];
        return criticalTools.includes(toolName);
    }

    // 获取工具统计信息
    getStatistics(): {
        totalTools: number;
        categoryCounts: Record<string, number>;
        securityLevels: Record<string, number>;
    } {
        const tools = this.getAllTools();
        const categoryCounts: Record<string, number> = {};
        const securityLevels: Record<string, number> = {};

        for (const tool of tools) {
            categoryCounts[tool.category] = (categoryCounts[tool.category] || 0) + 1;
            const level = tool.definition_.security.level;
            securityLevels[level] = (securityLevels[level] || 0) + 1;
        }

        return {
            totalTools: tools.length,
            categoryCounts,
            securityLevels
        };
    }
}

// 默认工具注册表实例
export const globalToolRegistry = new ToolRegistry();
