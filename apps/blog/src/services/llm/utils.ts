/**
 * LLM服务工具函数
 */

import { LLMMessage, LLMResponse } from './LLMProvider';

// 消息工具函数
export class MessageUtils {
    // 计算消息token数（粗略估算）
    static estimateTokens(text: string): number {
        // 简单的token估算：平均每4个字符一个token
        return Math.ceil(text.length / 4);
    }

    // 计算消息数组的总token数
    static estimateMessagesTokens(messages: LLMMessage[]): number {
        return messages.reduce((total, msg) => {
            return total + this.estimateTokens(msg.content);
        }, 0);
    }

    // 截断消息以适应上下文长度
    static truncateMessages(
        messages: LLMMessage[],
        maxTokens: number,
        preserveSystem: boolean = true
    ): LLMMessage[] {
        const systemMessages = preserveSystem
            ? messages.filter(msg => msg.role === 'system')
            : [];

        const otherMessages = messages.filter(msg => msg.role !== 'system');

        let currentTokens = this.estimateMessagesTokens(systemMessages);
        const result = [...systemMessages];

        // 从最新的消息开始添加
        for (let i = otherMessages.length - 1; i >= 0; i--) {
            const msg = otherMessages[i];
            const msgTokens = this.estimateTokens(msg.content);

            if (currentTokens + msgTokens <= maxTokens) {
                result.unshift(msg);
                currentTokens += msgTokens;
            } else {
                break;
            }
        }

        return result;
    }

    // 合并相邻的相同角色消息
    static mergeAdjacentMessages(messages: LLMMessage[]): LLMMessage[] {
        if (messages.length <= 1) return messages;

        const merged: LLMMessage[] = [];
        let current = messages[0];

        for (let i = 1; i < messages.length; i++) {
            const next = messages[i];

            if (current.role === next.role) {
                // 合并消息
                current = {
                    ...current,
                    content: current.content + '\n\n' + next.content
                };
            } else {
                merged.push(current);
                current = next;
            }
        }

        merged.push(current);
        return merged;
    }

    // 验证消息格式
    static validateMessages(messages: LLMMessage[]): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!Array.isArray(messages)) {
            errors.push('Messages must be an array');
            return { valid: false, errors };
        }

        if (messages.length === 0) {
            errors.push('Messages array cannot be empty');
        }

        for (const [index, msg] of messages.entries()) {
            if (!msg.role || !['system', 'user', 'assistant', 'function'].includes(msg.role)) {
                errors.push(`Message ${index}: Invalid role "${msg.role}"`);
            }

            if (typeof msg.content !== 'string') {
                errors.push(`Message ${index}: Content must be a string`);
            }

            if (msg.content.trim().length === 0) {
                errors.push(`Message ${index}: Content cannot be empty`);
            }
        }

        return { valid: errors.length === 0, errors };
    }

    // 创建系统消息
    static createSystemMessage(content: string): LLMMessage {
        return {
            role: 'system',
            content
        };
    }

    // 创建用户消息
    static createUserMessage(content: string): LLMMessage {
        return {
            role: 'user',
            content
        };
    }

    // 创建助手消息
    static createAssistantMessage(content: string): LLMMessage {
        return {
            role: 'assistant',
            content
        };
    }
}

// 响应工具函数
export class ResponseUtils {
    // 提取响应中的代码块
    static extractCodeBlocks(content: string): Array<{ language: string; code: string }> {
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        const blocks: Array<{ language: string; code: string }> = [];
        let match;

        while ((match = codeBlockRegex.exec(content)) !== null) {
            blocks.push({
                language: match[1] || 'text',
                code: match[2].trim()
            });
        }

        return blocks;
    }

    // 提取响应中的链接
    static extractLinks(content: string): Array<{ text: string; url: string }> {
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const links: Array<{ text: string; url: string }> = [];
        let match;

        while ((match = linkRegex.exec(content)) !== null) {
            links.push({
                text: match[1],
                url: match[2]
            });
        }

        return links;
    }

    // 计算响应质量分数
    static calculateQualityScore(response: LLMResponse): number {
        let score = 0;

        // 内容长度分数（0-30分）
        const contentLength = response.content.length;
        if (contentLength > 100) score += 30;
        else if (contentLength > 50) score += 20;
        else if (contentLength > 10) score += 10;

        // 完成原因分数（0-25分）
        if (response.finish_reason === 'stop') score += 25;
        else if (response.finish_reason === 'length') score += 15;

        // Token效率分数（0-25分）
        const efficiency = response.usage.completion_tokens / response.usage.prompt_tokens;
        if (efficiency > 0.5) score += 25;
        else if (efficiency > 0.3) score += 20;
        else if (efficiency > 0.1) score += 15;
        else score += 10;

        // 响应时间分数（0-20分）
        const latency = response.metadata?.latency || 5000;
        if (latency < 1000) score += 20;
        else if (latency < 3000) score += 15;
        else if (latency < 5000) score += 10;
        else score += 5;

        return Math.min(100, score);
    }

    // 格式化响应为Markdown
    static formatAsMarkdown(response: LLMResponse): string {
        let formatted = response.content;

        // 添加元数据
        if (response.metadata) {
            formatted += '\n\n---\n\n';
            formatted += '**Response Metadata:**\n';
            formatted += `- Model: ${response.model}\n`;
            formatted += `- Tokens: ${response.usage.total_tokens}\n`;

            if (response.metadata.cost) {
                formatted += `- Cost: $${response.metadata.cost.toFixed(4)}\n`;
            }

            if (response.metadata.latency) {
                formatted += `- Latency: ${response.metadata.latency}ms\n`;
            }
        }

        return formatted;
    }
}

// 成本计算工具
export class CostUtils {
    // 标准定价表（每1K tokens的成本，美元）
    static readonly PRICING = {
        'gpt-4': { input: 0.03, output: 0.06 },
        'gpt-4-turbo': { input: 0.01, output: 0.03 },
        'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
        'claude-3-opus': { input: 0.015, output: 0.075 },
        'claude-3-sonnet': { input: 0.003, output: 0.015 },
        'claude-3-haiku': { input: 0.00025, output: 0.00125 }
    };

    // 计算请求成本
    static calculateCost(
        model: string,
        inputTokens: number,
        outputTokens: number
    ): number {
        const pricing = this.PRICING[model as keyof typeof this.PRICING];
        if (!pricing) return 0;

        return (inputTokens * pricing.input + outputTokens * pricing.output) / 1000;
    }

    // 估算请求成本（基于消息内容）
    static estimateRequestCost(model: string, messages: LLMMessage[]): number {
        const inputTokens = MessageUtils.estimateMessagesTokens(messages);
        const estimatedOutputTokens = Math.min(inputTokens * 0.5, 1000); // 估算输出为输入的50%，最多1000tokens

        return this.calculateCost(model, inputTokens, estimatedOutputTokens);
    }

    // 格式化成本显示
    static formatCost(cost: number): string {
        if (cost < 0.001) {
            return '<$0.001';
        }
        return `$${cost.toFixed(3)}`;
    }

    // 计算成本效率（每美元的有效token数）
    static calculateCostEfficiency(response: LLMResponse): number {
        const cost = response.metadata?.cost || 0;
        if (cost === 0) return 0;

        return response.usage.completion_tokens / cost;
    }
}

// 性能分析工具
export class PerformanceUtils {
    // 计算吞吐量（tokens/秒）
    static calculateThroughput(tokens: number, durationMs: number): number {
        return tokens / (durationMs / 1000);
    }

    // 分析响应性能
    static analyzePerformance(responses: LLMResponse[]): {
        averageLatency: number;
        averageThroughput: number;
        averageCost: number;
        totalRequests: number;
        successRate: number;
    } {
        if (responses.length === 0) {
            return {
                averageLatency: 0,
                averageThroughput: 0,
                averageCost: 0,
                totalRequests: 0,
                successRate: 0
            };
        }

        const latencies = responses
            .map(r => r.metadata?.latency)
            .filter(l => l !== undefined) as number[];

        const costs = responses
            .map(r => r.metadata?.cost)
            .filter(c => c !== undefined) as number[];

        const throughputs = responses
            .map(r => {
                const latency = r.metadata?.latency;
                return latency ? this.calculateThroughput(r.usage.total_tokens, latency) : 0;
            })
            .filter(t => t > 0);

        return {
            averageLatency: latencies.length > 0
                ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length
                : 0,
            averageThroughput: throughputs.length > 0
                ? throughputs.reduce((sum, t) => sum + t, 0) / throughputs.length
                : 0,
            averageCost: costs.length > 0
                ? costs.reduce((sum, c) => sum + c, 0) / costs.length
                : 0,
            totalRequests: responses.length,
            successRate: 1.0 // 传入的都是成功的响应
        };
    }

    // 生成性能报告
    static generatePerformanceReport(responses: LLMResponse[]): string {
        const analysis = this.analyzePerformance(responses);

        return `
# Performance Report

## Overview
- Total Requests: ${analysis.totalRequests}
- Success Rate: ${(analysis.successRate * 100).toFixed(1)}%

## Latency
- Average Latency: ${analysis.averageLatency.toFixed(0)}ms

## Throughput
- Average Throughput: ${analysis.averageThroughput.toFixed(1)} tokens/sec

## Cost
- Average Cost per Request: ${CostUtils.formatCost(analysis.averageCost)}
- Total Cost: ${CostUtils.formatCost(analysis.averageCost * analysis.totalRequests)}

## Efficiency
- Cost per Token: ${CostUtils.formatCost(analysis.averageCost / (responses.reduce((sum, r) => sum + r.usage.completion_tokens, 0) / responses.length))}
    `.trim();
    }
}

// 错误处理工具
export class ErrorUtils {
    // 分析错误类型
    static analyzeError(error: Error): {
        type: 'network' | 'auth' | 'quota' | 'validation' | 'server' | 'unknown';
        retryable: boolean;
        suggestion: string;
    } {
        const message = error.message.toLowerCase();

        if (message.includes('network') || message.includes('timeout') || message.includes('connection')) {
            return {
                type: 'network',
                retryable: true,
                suggestion: 'Check network connection and retry'
            };
        }

        if (message.includes('unauthorized') || message.includes('api key') || message.includes('auth')) {
            return {
                type: 'auth',
                retryable: false,
                suggestion: 'Check API key and authentication'
            };
        }

        if (message.includes('quota') || message.includes('rate limit') || message.includes('budget')) {
            return {
                type: 'quota',
                retryable: false,
                suggestion: 'Check quota limits and billing'
            };
        }

        if (message.includes('validation') || message.includes('invalid')) {
            return {
                type: 'validation',
                retryable: false,
                suggestion: 'Check request parameters'
            };
        }

        if (message.includes('server') || message.includes('internal') || message.includes('500')) {
            return {
                type: 'server',
                retryable: true,
                suggestion: 'Server error, retry later'
            };
        }

        return {
            type: 'unknown',
            retryable: false,
            suggestion: 'Contact support'
        };
    }

    // 格式化错误信息
    static formatError(error: Error): string {
        const analysis = this.analyzeError(error);

        return `
Error Type: ${analysis.type}
Retryable: ${analysis.retryable ? 'Yes' : 'No'}
Suggestion: ${analysis.suggestion}
Original Message: ${error.message}
    `.trim();
    }
}
