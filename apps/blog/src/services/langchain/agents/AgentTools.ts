
import { ToolRegistry } from '../../tools/ToolRegistry';
import { AgentTool } from './BaseAgent';

// Calculator tool for mathematical operations
export class CalculatorTool implements AgentTool {
    name = 'calculator';
    description = 'Useful for mathematical calculations. Input should be a mathematical expression.';

    async execute(input: string): Promise<string> {
        try {
            // Simple calculator implementation
            // In production, you might want to use a more robust math parser
            const sanitized = input.replace(/[^0-9+\-*/().\s]/g, '');
            const result = eval(sanitized);
            return `The answer is ${result}`;
        } catch (error) {
            return `Error in calculation: ${error}`;
        }
    }
}

// Web search tool (placeholder implementation)
export class WebSearchTool implements AgentTool {
    name = 'web_search';
    description = 'Search the internet for current information. Input should be a search query.';

    async execute(input: string): Promise<string> {
        // This would integrate with a real search API like Google, Bing, etc.
        return `Search results for "${input}": [This is a placeholder - would return real search results]`;
    }
}

// Weather tool (placeholder implementation)
export class WeatherTool implements AgentTool {
    name = 'weather';
    description = 'Get current weather information for a location. Input should be a city name.';

    async execute(input: string): Promise<string> {
        // This would integrate with a weather API
        return `Weather in ${input}: [This is a placeholder - would return real weather data]`;
    }
}

// File system tool
export class FileSystemTool implements AgentTool {
    name = 'file_system';
    description = 'Read, write, or list files. Input should be JSON with action and path.';

    async execute(input: string): Promise<string> {
        try {
            const { action, path, content } = JSON.parse(input);

            switch (action) {
                case 'read':
                    // In a real implementation, you'd read the file
                    return `Content of ${path}: [File content would be here]`;
                case 'write':
                    // In a real implementation, you'd write to the file
                    return `Successfully wrote to ${path}`;
                case 'list':
                    // In a real implementation, you'd list directory contents
                    return `Files in ${path}: [Directory listing would be here]`;
                default:
                    return `Unknown action: ${action}`;
            }
        } catch (error) {
            return `Error: ${error}`;
        }
    }
}

// Code execution tool
export class CodeExecutionTool implements AgentTool {
    name = 'code_execution';
    description = 'Execute code in various languages. Input should be JSON with language and code.';

    async execute(input: string): Promise<string> {
        try {
            const { language, code } = JSON.parse(input);

            // This would integrate with a code execution service
            // For security reasons, this should run in a sandboxed environment
            return `Executed ${language} code:\n${code}\n\nOutput: [Code execution result would be here]`;
        } catch (error) {
            return `Error executing code: ${error}`;
        }
    }
}

// Database query tool
export class DatabaseTool implements AgentTool {
    name = 'database';
    description = 'Query database. Input should be a SQL query.';

    async execute(input: string): Promise<string> {
        try {
            // This would connect to a real database
            return `Query result for: ${input}\n[Database results would be here]`;
        } catch (error) {
            return `Database error: ${error}`;
        }
    }
}

// Email tool
export class EmailTool implements AgentTool {
    name = 'email';
    description = 'Send emails. Input should be JSON with to, subject, and body.';

    async execute(input: string): Promise<string> {
        try {
            const { to, subject, body } = JSON.parse(input);

            // This would integrate with an email service
            return `Email sent to ${to} with subject "${subject}"`;
        } catch (error) {
            return `Error sending email: ${error}`;
        }
    }
}

// HTTP request tool
export class HTTPTool implements AgentTool {
    name = 'http_request';
    description = 'Make HTTP requests. Input should be JSON with method, url, and optional data.';

    async execute(input: string): Promise<string> {
        try {
            const { method, url, data } = JSON.parse(input);

            // This would make actual HTTP requests
            return `${method} request to ${url} completed. Response: [HTTP response would be here]`;
        } catch (error) {
            return `HTTP request error: ${error}`;
        }
    }
}

// Tool factory to create tools based on existing ToolRegistry
export class AgentToolFactory {
    static createFromToolRegistry(toolRegistry: ToolRegistry): AgentTool[] {
        const tools: AgentTool[] = [];
        const availableTools = toolRegistry.getAvailableTools();

        for (const [toolName, toolInfo] of availableTools) {
            const agentTool: AgentTool = {
                name: toolName,
                description: toolInfo.description,
                async execute(input: string): Promise<string> {
                    try {
                        const result = await toolRegistry.executeTool(toolName, JSON.parse(input));
                        return typeof result === 'string' ? result : JSON.stringify(result);
                    } catch (error) {
                        return `Error executing ${toolName}: ${error}`;
                    }
                }
            };
            tools.push(agentTool);
        }

        return tools;
    }

    static getDefaultTools(): AgentTool[] {
        return [
            new CalculatorTool(),
            new WebSearchTool(),
            new WeatherTool(),
            new FileSystemTool(),
            new CodeExecutionTool(),
            new DatabaseTool(),
            new EmailTool(),
            new HTTPTool()
        ];
    }
}
