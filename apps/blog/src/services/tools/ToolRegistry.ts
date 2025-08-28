/**
 * 工具注册中心
 * 注册所有29种工具到全局注册表
 */

import { globalToolRegistry } from './ToolProtocol';

// 浏览器工具
import { BrowserGetInfoTool, BrowserInteractTool, BrowserNavigateTool, BrowserScreenshotTool } from './browser/BrowserTools';

// 文件工具
import { FileInfoTool, FileReadTool, FileSearchTool, FileWriteTool } from './file/FileTools';

// Shell工具
import { ShellBackgroundTool, ShellEnvironmentTool, ShellExecuteTool } from './shell/ShellTools';

// 代码工具
import { CodeAnalyzeTool, CodeExecuteTool, CodeFormatTool, CodeRefactorTool } from './code/CodeTools';

// 数据工具
import { DataJoinTool, DataPivotTool, DataQueryTool, DataTransformTool } from './data/DataTools';

// API工具
import { GraphQLQueryTool, HTTPRequestTool, WebSocketConnectTool } from './api/APITools';

// 机器学习工具
import { MLEvaluateTool, MLPredictTool, MLTrainTool } from './ml/MLTools';

// 系统工具
import { SystemInfoTool, SystemProcessTool, SystemResourcesTool } from './system/SystemTools';

// 工具类别定义
export const TOOL_CATEGORIES = {
    BROWSER: 'browser',
    FILE: 'file',
    SHELL: 'shell',
    CODE: 'code',
    DATA: 'data',
    API: 'api',
    ML: 'ml',
    SYSTEM: 'system'
} as const;

// 注册所有工具
export function registerAllTools(): void {
    console.log('Registering all 29 tools...');

    // 浏览器工具 (4个)
    globalToolRegistry.register(new BrowserNavigateTool());
    globalToolRegistry.register(new BrowserInteractTool());
    globalToolRegistry.register(new BrowserScreenshotTool());
    globalToolRegistry.register(new BrowserGetInfoTool());

    // 文件工具 (4个)
    globalToolRegistry.register(new FileReadTool());
    globalToolRegistry.register(new FileWriteTool());
    globalToolRegistry.register(new FileSearchTool());
    globalToolRegistry.register(new FileInfoTool());

    // Shell工具 (3个)
    globalToolRegistry.register(new ShellExecuteTool());
    globalToolRegistry.register(new ShellBackgroundTool());
    globalToolRegistry.register(new ShellEnvironmentTool());

    // 代码工具 (4个)
    globalToolRegistry.register(new CodeExecuteTool());
    globalToolRegistry.register(new CodeAnalyzeTool());
    globalToolRegistry.register(new CodeFormatTool());
    globalToolRegistry.register(new CodeRefactorTool());

    // 数据工具 (4个)
    globalToolRegistry.register(new DataTransformTool());
    globalToolRegistry.register(new DataQueryTool());
    globalToolRegistry.register(new DataJoinTool());
    globalToolRegistry.register(new DataPivotTool());

    // API工具 (3个)
    globalToolRegistry.register(new HTTPRequestTool());
    globalToolRegistry.register(new GraphQLQueryTool());
    globalToolRegistry.register(new WebSocketConnectTool());

    // 机器学习工具 (3个)
    globalToolRegistry.register(new MLPredictTool());
    globalToolRegistry.register(new MLTrainTool());
    globalToolRegistry.register(new MLEvaluateTool());

    // 系统工具 (3个)
    globalToolRegistry.register(new SystemInfoTool());
    globalToolRegistry.register(new SystemResourcesTool());
    globalToolRegistry.register(new SystemProcessTool());

    // 验证注册数量
    const registeredTools = globalToolRegistry.getAllTools();
    console.log(`Successfully registered ${registeredTools.length} tools`);

    if (registeredTools.length !== 28) {
        console.warn(`Expected 28 tools, but registered ${registeredTools.length}`);
    }

    // 输出工具统计
    const stats = globalToolRegistry.getStatistics();
    console.log('Tool registration statistics:', stats);
}

// 获取工具定义（用于AI模型的function calling）
export function getToolDefinitionsForAI(): any[] {
    return globalToolRegistry.getToolDefinitions().map(definition => ({
        type: 'function',
        function: {
            name: definition.name,
            description: definition.description,
            parameters: {
                type: 'object',
                properties: Object.fromEntries(
                    Object.entries(definition.parameters).map(([name, param]) => [
                        name,
                        {
                            type: param.type,
                            description: param.description,
                            ...(param.enum && { enum: param.enum }),
                            ...(param.pattern && { pattern: param.pattern }),
                            ...(param.minimum !== undefined && { minimum: param.minimum }),
                            ...(param.maximum !== undefined && { maximum: param.maximum }),
                            ...(param.default !== undefined && { default: param.default })
                        }
                    ])
                ),
                required: Object.entries(definition.parameters)
                    .filter(([_, param]) => param.required)
                    .map(([name]) => name)
            }
        }
    }));
}

// 获取工具使用统计
export function getToolUsageStatistics(): {
    totalExecutions: number;
    successRate: number;
    averageExecutionTime: number;
    toolBreakdown: Record<string, { executions: number; successRate: number }>;
    categoryBreakdown: Record<string, number>;
} {
    // 这里应该从实际的使用统计中获取数据
    // 现在返回模拟数据
    return {
        totalExecutions: 1247,
        successRate: 0.94,
        averageExecutionTime: 1834, // ms
        toolBreakdown: {
            'browser_navigate': { executions: 156, successRate: 0.98 },
            'file_read': { executions: 234, successRate: 0.96 },
            'shell_execute': { executions: 89, successRate: 0.87 },
            'code_analyze': { executions: 167, successRate: 0.92 }
        },
        categoryBreakdown: {
            browser: 398,
            file: 287,
            shell: 156,
            code: 223,
            data: 98,
            api: 85
        }
    };
}

// 获取推荐工具
export function getRecommendedTools(context: {
    userRole?: string;
    currentTask?: string;
    recentlyUsed?: string[];
}): Array<{
    name: string;
    description: string;
    category: string;
    confidence: number;
    reason: string;
}> {
    const allTools = globalToolRegistry.getAllTools();
    const recommendations: Array<any> = [];

    // 基于用户角色的推荐
    if (context.userRole === 'developer') {
        recommendations.push(
            ...allTools
                .filter(tool => ['code', 'shell', 'file'].includes(tool.category))
                .map(tool => ({
                    name: tool.name,
                    description: tool.description,
                    category: tool.category,
                    confidence: 0.8,
                    reason: 'Commonly used by developers'
                }))
        );
    }

    if (context.userRole === 'designer') {
        recommendations.push(
            ...allTools
                .filter(tool => ['browser', 'file'].includes(tool.category))
                .map(tool => ({
                    name: tool.name,
                    description: tool.description,
                    category: tool.category,
                    confidence: 0.7,
                    reason: 'Useful for design workflows'
                }))
        );
    }

    // 基于当前任务的推荐
    if (context.currentTask?.includes('automation')) {
        recommendations.push(
            ...allTools
                .filter(tool => ['shell', 'browser'].includes(tool.category))
                .map(tool => ({
                    name: tool.name,
                    description: tool.description,
                    category: tool.category,
                    confidence: 0.9,
                    reason: 'Great for automation tasks'
                }))
        );
    }

    // 去重并排序
    const uniqueRecommendations = recommendations
        .filter((rec, index, self) =>
            index === self.findIndex(r => r.name === rec.name)
        )
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 10); // 最多返回10个推荐

    return uniqueRecommendations;
}

// 工具健康检查
export async function performToolHealthCheck(): Promise<{
    healthy: number;
    unhealthy: number;
    results: Array<{
        name: string;
        category: string;
        healthy: boolean;
        responseTime?: number;
        error?: string;
    }>;
}> {
    const tools = globalToolRegistry.getAllTools();
    const results: Array<any> = [];
    let healthy = 0;
    let unhealthy = 0;

    // 并行检查所有工具的健康状态
    const healthCheckPromises = tools.map(async (tool) => {
        const startTime = Date.now();

        try {
            // 执行一个简单的健康检查（这里模拟）
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));

            const responseTime = Date.now() - startTime;
            const isHealthy = Math.random() > 0.1; // 90% 概率健康

            if (isHealthy) {
                healthy++;
            } else {
                unhealthy++;
            }

            return {
                name: tool.name,
                category: tool.category,
                healthy: isHealthy,
                responseTime,
                ...(isHealthy ? {} : { error: 'Simulated health check failure' })
            };
        } catch (error) {
            unhealthy++;
            return {
                name: tool.name,
                category: tool.category,
                healthy: false,
                error: error instanceof Error ? error.message : 'Health check failed'
            };
        }
    });

    const healthCheckResults = await Promise.allSettled(healthCheckPromises);

    healthCheckResults.forEach((result) => {
        if (result.status === 'fulfilled') {
            results.push(result.value);
        } else {
            unhealthy++;
            results.push({
                name: 'unknown',
                category: 'unknown',
                healthy: false,
                error: 'Health check promise rejected'
            });
        }
    });

    return {
        healthy,
        unhealthy,
        results
    };
}

// 工具搜索和发现
export function searchTools(query: string, filters?: {
    categories?: string[];
    securityLevel?: string[];
    permissions?: string[];
}): Array<{
    name: string;
    description: string;
    category: string;
    relevanceScore: number;
    securityLevel: string;
}> {
    let tools = globalToolRegistry.getAllTools();

    // 应用过滤器
    if (filters?.categories?.length) {
        tools = tools.filter(tool => filters.categories!.includes(tool.category));
    }

    if (filters?.securityLevel?.length) {
        tools = tools.filter(tool =>
            filters.securityLevel!.includes(tool.definition_.security.level)
        );
    }

    if (filters?.permissions?.length) {
        tools = tools.filter(tool =>
            tool.definition_.security.permissions.some(perm =>
                filters.permissions!.includes(perm)
            )
        );
    }

    // 计算相关性评分
    const queryLower = query.toLowerCase();
    const results = tools.map(tool => {
        let score = 0;

        // 名称匹配（权重最高）
        if (tool.name.toLowerCase().includes(queryLower)) {
            score += 10;
        }

        // 描述匹配
        if (tool.description.toLowerCase().includes(queryLower)) {
            score += 5;
        }

        // 类别匹配
        if (tool.category.toLowerCase().includes(queryLower)) {
            score += 3;
        }

        // 模糊匹配
        const fuzzyScore = calculateFuzzyScore(queryLower, tool.name.toLowerCase());
        score += fuzzyScore;

        return {
            name: tool.name,
            description: tool.description,
            category: tool.category,
            relevanceScore: score,
            securityLevel: tool.definition_.security.level
        };
    });

    // 按相关性排序并返回
    return results
        .filter(result => result.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// 简单的模糊匹配评分
function calculateFuzzyScore(query: string, target: string): number {
    let score = 0;
    let queryIndex = 0;

    for (let i = 0; i < target.length && queryIndex < query.length; i++) {
        if (target[i] === query[queryIndex]) {
            score += 1;
            queryIndex++;
        }
    }

    return queryIndex === query.length ? score : 0;
}

// 初始化工具系统
export function initializeToolSystem(): void {
    console.log('Initializing Tool System...');

    // 注册所有工具
    registerAllTools();

    // 执行健康检查
    performToolHealthCheck().then(healthStatus => {
        console.log('Tool health check completed:', healthStatus);
    });

    console.log('Tool System initialized successfully');
}
