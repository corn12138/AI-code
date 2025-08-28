/**
 * 代码操作工具集
 * 支持代码执行、分析、格式化、重构等功能
 */

import { BaseTool, ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '../ToolProtocol';

// 代码执行工具
export class CodeExecuteTool extends BaseTool {
    constructor() {
        const definition: ToolDefinition = {
            name: 'code_execute',
            description: 'Execute code in various programming languages',
            category: 'code',
            parameters: {
                language: {
                    name: 'language',
                    type: 'string',
                    description: 'Programming language',
                    required: true,
                    enum: ['javascript', 'typescript', 'python', 'bash', 'sql', 'html', 'css']
                },
                code: {
                    name: 'code',
                    type: 'string',
                    description: 'Code to execute',
                    required: true
                },
                context: {
                    name: 'context',
                    type: 'object',
                    description: 'Execution context and variables',
                    required: false,
                    properties: {
                        variables: {
                            name: 'variables',
                            type: 'object',
                            description: 'Variables to make available',
                            required: false
                        },
                        imports: {
                            name: 'imports',
                            type: 'array',
                            description: 'Modules to import',
                            required: false,
                            items: {
                                name: 'import',
                                type: 'string',
                                description: 'Module name',
                                required: false
                            }
                        }
                    }
                },
                timeout: {
                    name: 'timeout',
                    type: 'number',
                    description: 'Execution timeout in milliseconds',
                    required: false,
                    default: 30000,
                    minimum: 1000,
                    maximum: 300000
                }
            },
            security: {
                level: 'dangerous',
                permissions: ['code:execute'],
                sandbox: true,
                timeout: 300000
            },
            examples: [
                {
                    description: 'Execute JavaScript code',
                    input: { language: 'javascript', code: 'console.log("Hello, World!");' },
                    output: { result: null, output: 'Hello, World!\n', success: true }
                }
            ]
        };
        super(definition);
    }

    async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
        const { language, code, context: execContext = {}, timeout = 30000 } = parameters;
        const startTime = Date.now();

        try {
            // 安全检查
            const securityWarnings = this.performSecurityCheck(parameters, context);
            const securityCheck = this.checkCodeSecurity(code, language);

            if (!securityCheck.safe) {
                return {
                    success: false,
                    error: {
                        code: 'UNSAFE_CODE',
                        message: securityCheck.reason
                    },
                    metadata: {
                        executionTime: Date.now() - startTime,
                        securityWarnings
                    }
                };
            }

            // 执行代码
            const result = await this.executeCode(language, code, execContext, timeout);

            return {
                success: result.success,
                result: result.success ? {
                    output: result.output,
                    result: result.result,
                    language,
                    executionTime: result.executionTime
                } : undefined,
                error: result.success ? undefined : {
                    code: 'EXECUTION_ERROR',
                    message: result.error || 'Code execution failed'
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
                    code: 'CODE_EXECUTION_ERROR',
                    message: error instanceof Error ? error.message : 'Code execution failed'
                },
                metadata: {
                    executionTime: Date.now() - startTime,
                    securityWarnings: this.performSecurityCheck(parameters, context)
                }
            };
        }
    }

    private checkCodeSecurity(code: string, language: string): { safe: boolean; reason?: string } {
        // 危险代码模式检查
        const dangerousPatterns = [
            /eval\(/i,
            /Function\(/i,
            /process\.exit/i,
            /require\s*\(\s*['"`]fs['"`]\s*\)/i,
            /require\s*\(\s*['"`]child_process['"`]\s*\)/i,
            /document\.write/i,
            /innerHTML\s*=/i,
            /while\s*\(\s*true\s*\)/i, // 无限循环
            /for\s*\(\s*;\s*;\s*\)/i   // 无限循环
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(code)) {
                return { safe: false, reason: `Dangerous pattern detected: ${pattern.source}` };
            }
        }

        // 语言特定检查
        if (language === 'javascript' || language === 'typescript') {
            if (code.includes('XMLHttpRequest') || code.includes('fetch')) {
                return { safe: false, reason: 'Network requests not allowed in code execution' };
            }
        }

        return { safe: true };
    }

    private async executeCode(
        language: string,
        code: string,
        execContext: any,
        timeout: number
    ): Promise<{ success: boolean; output?: string; result?: any; error?: string; executionTime: number }> {
        const startTime = Date.now();

        try {
            switch (language) {
                case 'javascript':
                    return await this.executeJavaScript(code, execContext, timeout, startTime);
                case 'typescript':
                    return await this.executeTypeScript(code, execContext, timeout, startTime);
                case 'python':
                    return await this.executePython(code, execContext, timeout, startTime);
                case 'sql':
                    return await this.executeSQL(code, execContext, timeout, startTime);
                case 'html':
                    return await this.executeHTML(code, execContext, timeout, startTime);
                case 'css':
                    return await this.executeCSS(code, execContext, timeout, startTime);
                default:
                    throw new Error(`Unsupported language: ${language}`);
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Execution failed',
                executionTime: Date.now() - startTime
            };
        }
    }

    private async executeJavaScript(
        code: string,
        execContext: any,
        timeout: number,
        startTime: number
    ): Promise<any> {
        return new Promise((resolve) => {
            const originalConsoleLog = console.log;
            let output = '';

            // 重定向console.log
            console.log = (...args: any[]) => {
                output += args.map(arg => String(arg)).join(' ') + '\n';
            };

            try {
                // 创建执行环境
                const contextVars = execContext.variables || {};
                const contextStr = Object.entries(contextVars)
                    .map(([key, value]) => `const ${key} = ${JSON.stringify(value)};`)
                    .join('\n');

                const fullCode = contextStr + '\n' + code;

                // 使用Function构造器创建沙箱环境
                const executor = new Function(`
          "use strict";
          const result = (function() {
            ${fullCode}
          })();
          return result;
        `);

                const timeoutId = setTimeout(() => {
                    resolve({
                        success: false,
                        error: `Execution timeout after ${timeout}ms`,
                        executionTime: Date.now() - startTime
                    });
                }, timeout);

                const result = executor();
                clearTimeout(timeoutId);

                resolve({
                    success: true,
                    output: output.trim(),
                    result,
                    executionTime: Date.now() - startTime
                });
            } catch (error) {
                resolve({
                    success: false,
                    error: error instanceof Error ? error.message : 'Execution failed',
                    output: output.trim(),
                    executionTime: Date.now() - startTime
                });
            } finally {
                console.log = originalConsoleLog;
            }
        });
    }

    private async executeTypeScript(
        code: string,
        execContext: any,
        timeout: number,
        startTime: number
    ): Promise<any> {
        // 简化版本：将TypeScript代码转换为JavaScript再执行
        // 在实际环境中，这里会使用TypeScript编译器

        // 移除类型注解的简单方法（仅用于演示）
        const jsCode = code
            .replace(/:\s*\w+(\[\])?/g, '') // 移除类型注解
            .replace(/interface\s+\w+\s*{[^}]*}/g, '') // 移除接口定义
            .replace(/type\s+\w+\s*=\s*[^;]+;/g, ''); // 移除类型别名

        return this.executeJavaScript(jsCode, execContext, timeout, startTime);
    }

    private async executePython(
        code: string,
        execContext: any,
        timeout: number,
        startTime: number
    ): Promise<any> {
        // Python执行模拟（实际环境中需要Python解释器）
        return {
            success: false,
            error: 'Python execution not available in browser environment',
            output: '# Python execution requires server-side environment',
            executionTime: Date.now() - startTime
        };
    }

    private async executeSQL(
        code: string,
        execContext: any,
        timeout: number,
        startTime: number
    ): Promise<any> {
        // SQL执行模拟
        const mockDatabase = {
            users: [
                { id: 1, name: 'John Doe', email: 'john@example.com' },
                { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
            ],
            products: [
                { id: 1, name: 'Laptop', price: 999.99 },
                { id: 2, name: 'Phone', price: 599.99 }
            ]
        };

        try {
            const query = code.trim().toLowerCase();
            let result: any;

            if (query.startsWith('select')) {
                if (query.includes('from users')) {
                    result = mockDatabase.users;
                } else if (query.includes('from products')) {
                    result = mockDatabase.products;
                } else {
                    result = { message: 'Table not found' };
                }
            } else {
                result = { message: 'Only SELECT queries are supported in this demo' };
            }

            return {
                success: true,
                output: JSON.stringify(result, null, 2),
                result,
                executionTime: Date.now() - startTime
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'SQL execution failed',
                executionTime: Date.now() - startTime
            };
        }
    }

    private async executeHTML(
        code: string,
        execContext: any,
        timeout: number,
        startTime: number
    ): Promise<any> {
        try {
            // 创建临时iframe来渲染HTML
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            const doc = iframe.contentDocument || iframe.contentWindow?.document;
            if (doc) {
                doc.open();
                doc.write(code);
                doc.close();

                // 获取渲染结果的一些信息
                const elementCount = doc.querySelectorAll('*').length;
                const textContent = doc.body?.textContent || '';

                document.body.removeChild(iframe);

                return {
                    success: true,
                    output: `HTML rendered successfully. Elements: ${elementCount}, Text length: ${textContent.length}`,
                    result: {
                        elementCount,
                        textLength: textContent.length,
                        title: doc.title
                    },
                    executionTime: Date.now() - startTime
                };
            } else {
                throw new Error('Cannot create document');
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'HTML execution failed',
                executionTime: Date.now() - startTime
            };
        }
    }

    private async executeCSS(
        code: string,
        execContext: any,
        timeout: number,
        startTime: number
    ): Promise<any> {
        try {
            // 创建style元素并应用CSS
            const style = document.createElement('style');
            style.textContent = code;
            document.head.appendChild(style);

            // 分析CSS
            const rules = style.sheet?.cssRules || [];
            const ruleCount = rules.length;

            // 移除临时样式
            document.head.removeChild(style);

            return {
                success: true,
                output: `CSS applied successfully. Rules: ${ruleCount}`,
                result: {
                    ruleCount,
                    css: code
                },
                executionTime: Date.now() - startTime
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'CSS execution failed',
                executionTime: Date.now() - startTime
            };
        }
    }
}

// 代码分析工具
export class CodeAnalyzeTool extends BaseTool {
    constructor() {
        const definition: ToolDefinition = {
            name: 'code_analyze',
            description: 'Analyze code for quality, complexity, and potential issues',
            category: 'code',
            parameters: {
                code: {
                    name: 'code',
                    type: 'string',
                    description: 'Code to analyze',
                    required: true
                },
                language: {
                    name: 'language',
                    type: 'string',
                    description: 'Programming language',
                    required: true,
                    enum: ['javascript', 'typescript', 'python', 'java', 'css', 'html']
                },
                analysisType: {
                    name: 'analysisType',
                    type: 'array',
                    description: 'Types of analysis to perform',
                    required: false,
                    items: {
                        name: 'type',
                        type: 'string',
                        description: 'Analysis type',
                        required: false
                    }
                }
            },
            security: {
                level: 'safe',
                permissions: ['code:analyze'],
                sandbox: true,
                timeout: 15000
            },
            examples: [
                {
                    description: 'Analyze JavaScript code',
                    input: { code: 'function add(a, b) { return a + b; }', language: 'javascript' },
                    output: { complexity: 1, issues: [], suggestions: [] }
                }
            ]
        };
        super(definition);
    }

    async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
        const { code, language, analysisType = ['all'] } = parameters;
        const startTime = Date.now();

        try {
            const analysis = this.analyzeCode(code, language, analysisType);

            return {
                success: true,
                result: analysis,
                metadata: { executionTime: Date.now() - startTime }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'CODE_ANALYSIS_ERROR',
                    message: error instanceof Error ? error.message : 'Code analysis failed'
                },
                metadata: { executionTime: Date.now() - startTime }
            };
        }
    }

    private analyzeCode(code: string, language: string, analysisTypes: string[]): any {
        const analysis: any = {
            language,
            lineCount: code.split('\n').length,
            characterCount: code.length,
            timestamp: new Date().toISOString()
        };

        if (analysisTypes.includes('all') || analysisTypes.includes('complexity')) {
            analysis.complexity = this.calculateComplexity(code, language);
        }

        if (analysisTypes.includes('all') || analysisTypes.includes('quality')) {
            analysis.quality = this.analyzeQuality(code, language);
        }

        if (analysisTypes.includes('all') || analysisTypes.includes('security')) {
            analysis.security = this.analyzeSecurityIssues(code, language);
        }

        if (analysisTypes.includes('all') || analysisTypes.includes('performance')) {
            analysis.performance = this.analyzePerformance(code, language);
        }

        return analysis;
    }

    private calculateComplexity(code: string, language: string): any {
        let complexity = 1; // 基础复杂度

        // 简单的圈复杂度计算
        const complexityPatterns = [
            /\bif\s*\(/g,
            /\belse\s+if\s*\(/g,
            /\bwhile\s*\(/g,
            /\bfor\s*\(/g,
            /\bswitch\s*\(/g,
            /\bcase\s+/g,
            /\bcatch\s*\(/g,
            /\&\&/g,
            /\|\|/g,
            /\?.*:/g // 三元操作符
        ];

        for (const pattern of complexityPatterns) {
            const matches = code.match(pattern);
            if (matches) {
                complexity += matches.length;
            }
        }

        return {
            cyclomaticComplexity: complexity,
            level: complexity <= 10 ? 'low' : complexity <= 20 ? 'medium' : 'high',
            description: this.getComplexityDescription(complexity)
        };
    }

    private getComplexityDescription(complexity: number): string {
        if (complexity <= 10) return 'Low complexity, easy to maintain';
        if (complexity <= 20) return 'Medium complexity, moderate maintenance';
        return 'High complexity, consider refactoring';
    }

    private analyzeQuality(code: string, language: string): any {
        const issues: string[] = [];
        const suggestions: string[] = [];

        // 通用质量检查
        if (code.length < 10) {
            issues.push('Code is too short for meaningful analysis');
        }

        if (!code.includes('\n')) {
            suggestions.push('Consider adding line breaks for better readability');
        }

        // JavaScript/TypeScript特定检查
        if (language === 'javascript' || language === 'typescript') {
            if (code.includes('var ')) {
                suggestions.push('Consider using let or const instead of var');
            }

            if (code.includes('== ') || code.includes('!= ')) {
                suggestions.push('Consider using strict equality (=== or !==)');
            }

            if (!code.includes('function') && !code.includes('=>') && code.includes('=')) {
                suggestions.push('Consider using arrow functions for brevity');
            }
        }

        return {
            issues,
            suggestions,
            score: Math.max(0, 100 - issues.length * 20 - suggestions.length * 5),
            grade: this.calculateGrade(issues.length, suggestions.length)
        };
    }

    private calculateGrade(issueCount: number, suggestionCount: number): string {
        const totalDeductions = issueCount * 20 + suggestionCount * 5;
        if (totalDeductions <= 10) return 'A';
        if (totalDeductions <= 25) return 'B';
        if (totalDeductions <= 40) return 'C';
        if (totalDeductions <= 60) return 'D';
        return 'F';
    }

    private analyzeSecurityIssues(code: string, language: string): any {
        const issues: string[] = [];
        const warnings: string[] = [];

        // 通用安全检查
        if (code.includes('eval(')) {
            issues.push('Use of eval() is dangerous and should be avoided');
        }

        if (code.includes('innerHTML')) {
            warnings.push('Use of innerHTML may lead to XSS vulnerabilities');
        }

        if (code.includes('document.write')) {
            warnings.push('document.write can be exploited for code injection');
        }

        // JavaScript特定检查
        if (language === 'javascript' || language === 'typescript') {
            if (code.includes('localStorage') || code.includes('sessionStorage')) {
                warnings.push('Storing sensitive data in browser storage is not secure');
            }
        }

        return {
            issues,
            warnings,
            securityScore: Math.max(0, 100 - issues.length * 30 - warnings.length * 10),
            level: issues.length === 0 && warnings.length <= 1 ? 'secure' :
                issues.length === 0 ? 'moderate' : 'risky'
        };
    }

    private analyzePerformance(code: string, language: string): any {
        const issues: string[] = [];
        const suggestions: string[] = [];

        // 性能相关检查
        if (code.includes('for') && code.includes('length')) {
            if (!code.includes('len = ') && !code.includes('length)')) {
                suggestions.push('Cache array length in loops for better performance');
            }
        }

        if (code.includes('document.getElementById') || code.includes('querySelector')) {
            suggestions.push('Consider caching DOM queries for better performance');
        }

        const nestedLoops = (code.match(/for\s*\([^}]*for\s*\(/g) || []).length;
        if (nestedLoops > 0) {
            warnings.push(`${nestedLoops} nested loops detected - may impact performance`);
        }

        return {
            issues,
            suggestions,
            nestedLoops,
            performanceScore: Math.max(0, 100 - issues.length * 25 - suggestions.length * 5),
            recommendation: this.getPerformanceRecommendation(issues.length, suggestions.length)
        };
    }

    private getPerformanceRecommendation(issueCount: number, suggestionCount: number): string {
        if (issueCount === 0 && suggestionCount === 0) return 'Excellent performance characteristics';
        if (issueCount === 0) return 'Good performance with minor optimization opportunities';
        return 'Performance improvements recommended';
    }
}

// 代码格式化工具
export class CodeFormatTool extends BaseTool {
    constructor() {
        const definition: ToolDefinition = {
            name: 'code_format',
            description: 'Format and beautify code according to style guidelines',
            category: 'code',
            parameters: {
                code: {
                    name: 'code',
                    type: 'string',
                    description: 'Code to format',
                    required: true
                },
                language: {
                    name: 'language',
                    type: 'string',
                    description: 'Programming language',
                    required: true,
                    enum: ['javascript', 'typescript', 'json', 'css', 'html', 'markdown']
                },
                options: {
                    name: 'options',
                    type: 'object',
                    description: 'Formatting options',
                    required: false,
                    properties: {
                        indentSize: {
                            name: 'indentSize',
                            type: 'number',
                            description: 'Number of spaces for indentation',
                            required: false,
                            default: 2
                        },
                        useTabs: {
                            name: 'useTabs',
                            type: 'boolean',
                            description: 'Use tabs instead of spaces',
                            required: false,
                            default: false
                        },
                        maxLineLength: {
                            name: 'maxLineLength',
                            type: 'number',
                            description: 'Maximum line length',
                            required: false,
                            default: 80
                        }
                    }
                }
            },
            security: {
                level: 'safe',
                permissions: ['code:format'],
                sandbox: true,
                timeout: 10000
            },
            examples: [
                {
                    description: 'Format JavaScript code',
                    input: { code: 'function add(a,b){return a+b;}', language: 'javascript' },
                    output: { formatted: 'function add(a, b) {\n  return a + b;\n}' }
                }
            ]
        };
        super(definition);
    }

    async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
        const { code, language, options = {} } = parameters;
        const startTime = Date.now();

        try {
            const formatted = this.formatCode(code, language, options);

            return {
                success: true,
                result: {
                    original: code,
                    formatted,
                    language,
                    options,
                    changes: this.analyzeChanges(code, formatted)
                },
                metadata: { executionTime: Date.now() - startTime }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'CODE_FORMAT_ERROR',
                    message: error instanceof Error ? error.message : 'Code formatting failed'
                },
                metadata: { executionTime: Date.now() - startTime }
            };
        }
    }

    private formatCode(code: string, language: string, options: any): string {
        const indentSize = options.indentSize || 2;
        const useTabs = options.useTabs || false;
        const indent = useTabs ? '\t' : ' '.repeat(indentSize);

        switch (language) {
            case 'javascript':
            case 'typescript':
                return this.formatJavaScript(code, indent);
            case 'json':
                return this.formatJSON(code, indent);
            case 'css':
                return this.formatCSS(code, indent);
            case 'html':
                return this.formatHTML(code, indent);
            case 'markdown':
                return this.formatMarkdown(code);
            default:
                return this.basicFormat(code, indent);
        }
    }

    private formatJavaScript(code: string, indent: string): string {
        // 简单的JavaScript格式化
        let formatted = code
            .replace(/\{/g, ' {\n')
            .replace(/\}/g, '\n}')
            .replace(/;/g, ';\n')
            .replace(/,/g, ', ')
            .replace(/\s+/g, ' ')
            .trim();

        // 添加缩进
        const lines = formatted.split('\n');
        let indentLevel = 0;
        const result: string[] = [];

        for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed.includes('}')) {
                indentLevel = Math.max(0, indentLevel - 1);
            }

            if (trimmed) {
                result.push(indent.repeat(indentLevel) + trimmed);
            }

            if (trimmed.includes('{')) {
                indentLevel++;
            }
        }

        return result.join('\n');
    }

    private formatJSON(code: string, indent: string): string {
        try {
            const parsed = JSON.parse(code);
            return JSON.stringify(parsed, null, indent);
        } catch {
            return code; // Return original if parsing fails
        }
    }

    private formatCSS(code: string, indent: string): string {
        return code
            .replace(/\{/g, ' {\n')
            .replace(/\}/g, '\n}\n')
            .replace(/;/g, ';\n')
            .replace(/,/g, ', ')
            .split('\n')
            .map(line => {
                const trimmed = line.trim();
                if (trimmed.includes('{') || trimmed.includes('}')) {
                    return trimmed;
                }
                return trimmed ? indent + trimmed : '';
            })
            .filter(line => line.length > 0)
            .join('\n');
    }

    private formatHTML(code: string, indent: string): string {
        // 基本的HTML格式化
        let formatted = code
            .replace(/></g, '>\n<')
            .replace(/\s+/g, ' ')
            .trim();

        const lines = formatted.split('\n');
        let indentLevel = 0;
        const result: string[] = [];

        for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed.startsWith('</') && !trimmed.includes('/>')) {
                indentLevel = Math.max(0, indentLevel - 1);
            }

            if (trimmed) {
                result.push(indent.repeat(indentLevel) + trimmed);
            }

            if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.includes('/>')) {
                indentLevel++;
            }
        }

        return result.join('\n');
    }

    private formatMarkdown(code: string): string {
        // 基本的Markdown格式化
        return code
            .split('\n')
            .map(line => line.trim())
            .join('\n')
            .replace(/\n\n\n+/g, '\n\n'); // 移除多余的空行
    }

    private basicFormat(code: string, indent: string): string {
        // 基本格式化：清理空白字符并添加基本缩进
        return code
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
    }

    private analyzeChanges(original: string, formatted: string): any {
        const originalLines = original.split('\n');
        const formattedLines = formatted.split('\n');

        return {
            originalLineCount: originalLines.length,
            formattedLineCount: formattedLines.length,
            originalCharCount: original.length,
            formattedCharCount: formatted.length,
            linesAdded: Math.max(0, formattedLines.length - originalLines.length),
            linesRemoved: Math.max(0, originalLines.length - formattedLines.length),
            charactersChanged: Math.abs(formatted.length - original.length),
            significantChanges: this.countSignificantChanges(original, formatted)
        };
    }

    private countSignificantChanges(original: string, formatted: string): number {
        // 计算非空白字符的变化
        const originalNonWhitespace = original.replace(/\s/g, '');
        const formattedNonWhitespace = formatted.replace(/\s/g, '');

        return originalNonWhitespace === formattedNonWhitespace ? 0 : 1;
    }
}

// 代码重构工具
export class CodeRefactorTool extends BaseTool {
    constructor() {
        const definition: ToolDefinition = {
            name: 'code_refactor',
            description: 'Refactor code to improve structure, readability, and maintainability',
            category: 'code',
            parameters: {
                code: {
                    name: 'code',
                    type: 'string',
                    description: 'Code to refactor',
                    required: true
                },
                language: {
                    name: 'language',
                    type: 'string',
                    description: 'Programming language',
                    required: true,
                    enum: ['javascript', 'typescript', 'python']
                },
                refactorType: {
                    name: 'refactorType',
                    type: 'string',
                    description: 'Type of refactoring to perform',
                    required: true,
                    enum: ['extract_function', 'rename_variable', 'eliminate_duplication', 'simplify_conditions', 'modernize_syntax']
                },
                target: {
                    name: 'target',
                    type: 'string',
                    description: 'Target for refactoring (variable name, function name, etc.)',
                    required: false
                },
                newName: {
                    name: 'newName',
                    type: 'string',
                    description: 'New name for rename operations',
                    required: false
                }
            },
            security: {
                level: 'safe',
                permissions: ['code:refactor'],
                sandbox: true,
                timeout: 20000
            },
            examples: [
                {
                    description: 'Extract function from code',
                    input: {
                        code: 'const result = a * 2 + b * 2; const other = c * 2 + d * 2;',
                        language: 'javascript',
                        refactorType: 'extract_function'
                    },
                    output: { refactored: 'function multiply(x) { return x * 2; }...' }
                }
            ]
        };
        super(definition);
    }

    async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
        const { code, language, refactorType, target, newName } = parameters;
        const startTime = Date.now();

        try {
            const refactoredResult = this.performRefactoring(code, language, refactorType, target, newName);

            return {
                success: true,
                result: refactoredResult,
                metadata: { executionTime: Date.now() - startTime }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'CODE_REFACTOR_ERROR',
                    message: error instanceof Error ? error.message : 'Code refactoring failed'
                },
                metadata: { executionTime: Date.now() - startTime }
            };
        }
    }

    private performRefactoring(
        code: string,
        language: string,
        refactorType: string,
        target?: string,
        newName?: string
    ): any {
        switch (refactorType) {
            case 'extract_function':
                return this.extractFunction(code, language);
            case 'rename_variable':
                return this.renameVariable(code, language, target!, newName!);
            case 'eliminate_duplication':
                return this.eliminateDuplication(code, language);
            case 'simplify_conditions':
                return this.simplifyConditions(code, language);
            case 'modernize_syntax':
                return this.modernizeSyntax(code, language);
            default:
                throw new Error(`Unknown refactor type: ${refactorType}`);
        }
    }

    private extractFunction(code: string, language: string): any {
        // 简单的函数提取：查找重复的表达式
        const duplicates = this.findDuplicateExpressions(code);

        if (duplicates.length === 0) {
            return {
                original: code,
                refactored: code,
                changes: [],
                message: 'No suitable code found for function extraction'
            };
        }

        const extractedFunction = this.generateExtractedFunction(duplicates[0], language);
        const refactored = this.replaceWithFunctionCall(code, duplicates[0], extractedFunction.name);

        return {
            original: code,
            refactored: extractedFunction.definition + '\n\n' + refactored,
            changes: [{
                type: 'function_extracted',
                name: extractedFunction.name,
                occurrences: duplicates[0].occurrences
            }],
            extractedFunction
        };
    }

    private findDuplicateExpressions(code: string): any[] {
        // 简化版：查找重复的简单表达式
        const expressions = code.match(/\w+\s*[+\-*/]\s*\w+/g) || [];
        const counts: Record<string, number> = {};

        expressions.forEach(expr => {
            counts[expr] = (counts[expr] || 0) + 1;
        });

        return Object.entries(counts)
            .filter(([_, count]) => count > 1)
            .map(([expr, count]) => ({
                expression: expr,
                occurrences: count
            }));
    }

    private generateExtractedFunction(duplicate: any, language: string): any {
        const functionName = 'extracted_' + Math.random().toString(36).substr(2, 5);

        let definition = '';
        if (language === 'javascript' || language === 'typescript') {
            definition = `function ${functionName}() {\n  return ${duplicate.expression};\n}`;
        }

        return {
            name: functionName,
            definition,
            parameters: []
        };
    }

    private replaceWithFunctionCall(code: string, duplicate: any, functionName: string): string {
        return code.replace(new RegExp(duplicate.expression, 'g'), `${functionName}()`);
    }

    private renameVariable(code: string, language: string, target: string, newName: string): any {
        if (!target || !newName) {
            throw new Error('Target and newName are required for rename operation');
        }

        // 简单的变量重命名
        const pattern = new RegExp(`\\b${target}\\b`, 'g');
        const refactored = code.replace(pattern, newName);
        const occurrences = (code.match(pattern) || []).length;

        return {
            original: code,
            refactored,
            changes: [{
                type: 'variable_renamed',
                from: target,
                to: newName,
                occurrences
            }]
        };
    }

    private eliminateDuplication(code: string, language: string): any {
        // 查找并消除重复代码
        const lines = code.split('\n');
        const duplicateLines: Record<string, number[]> = {};

        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (trimmed && trimmed.length > 10) { // 只考虑有意义的行
                if (!duplicateLines[trimmed]) {
                    duplicateLines[trimmed] = [];
                }
                duplicateLines[trimmed].push(index);
            }
        });

        const duplicates = Object.entries(duplicateLines)
            .filter(([_, indices]) => indices.length > 1);

        if (duplicates.length === 0) {
            return {
                original: code,
                refactored: code,
                changes: [],
                message: 'No duplicate code found'
            };
        }

        // 简单处理：移除重复行（保留第一个）
        const linesToRemove = new Set<number>();
        duplicates.forEach(([_, indices]) => {
            indices.slice(1).forEach(index => linesToRemove.add(index));
        });

        const refactoredLines = lines.filter((_, index) => !linesToRemove.has(index));

        return {
            original: code,
            refactored: refactoredLines.join('\n'),
            changes: [{
                type: 'duplication_eliminated',
                duplicateCount: duplicates.length,
                linesRemoved: linesToRemove.size
            }]
        };
    }

    private simplifyConditions(code: string, language: string): any {
        let refactored = code;
        const changes: any[] = [];

        // 简化 if-else 条件
        const simplifications = [
            {
                pattern: /if\s*\(\s*(\w+)\s*===?\s*true\s*\)/g,
                replacement: 'if ($1)',
                description: 'Simplified boolean comparison'
            },
            {
                pattern: /if\s*\(\s*(\w+)\s*===?\s*false\s*\)/g,
                replacement: 'if (!$1)',
                description: 'Simplified negative boolean comparison'
            },
            {
                pattern: /if\s*\(\s*!(\w+)\s*===?\s*false\s*\)/g,
                replacement: 'if ($1)',
                description: 'Simplified double negative'
            }
        ];

        simplifications.forEach(({ pattern, replacement, description }) => {
            const matches = refactored.match(pattern);
            if (matches) {
                refactored = refactored.replace(pattern, replacement);
                changes.push({
                    type: 'condition_simplified',
                    description,
                    occurrences: matches.length
                });
            }
        });

        return {
            original: code,
            refactored,
            changes
        };
    }

    private modernizeSyntax(code: string, language: string): any {
        if (language !== 'javascript' && language !== 'typescript') {
            return {
                original: code,
                refactored: code,
                changes: [],
                message: 'Syntax modernization only available for JavaScript/TypeScript'
            };
        }

        let refactored = code;
        const changes: any[] = [];

        // ES6+ 语法现代化
        const modernizations = [
            {
                pattern: /var\s+(\w+)/g,
                replacement: 'let $1',
                description: 'Replaced var with let'
            },
            {
                pattern: /function\s*\(\s*(\w+(?:,\s*\w+)*)\s*\)\s*\{/g,
                replacement: '($1) => {',
                description: 'Converted to arrow function'
            },
            {
                pattern: /\.indexOf\(([^)]+)\)\s*!==\s*-1/g,
                replacement: '.includes($1)',
                description: 'Used includes() instead of indexOf()'
            }
        ];

        modernizations.forEach(({ pattern, replacement, description }) => {
            const matches = refactored.match(pattern);
            if (matches) {
                refactored = refactored.replace(pattern, replacement);
                changes.push({
                    type: 'syntax_modernized',
                    description,
                    occurrences: matches.length
                });
            }
        });

        return {
            original: code,
            refactored,
            changes
        };
    }
}
