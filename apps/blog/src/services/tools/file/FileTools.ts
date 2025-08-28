/**
 * 文件操作工具集
 * 支持文件读写、搜索、操作等功能
 */

import { BaseTool, ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '../ToolProtocol';

// 文件读取工具
export class FileReadTool extends BaseTool {
    constructor() {
        const definition: ToolDefinition = {
            name: 'file_read',
            description: 'Read the contents of a file',
            category: 'file',
            parameters: {
                path: {
                    name: 'path',
                    type: 'string',
                    description: 'Path to the file to read',
                    required: true
                },
                encoding: {
                    name: 'encoding',
                    type: 'string',
                    description: 'File encoding',
                    required: false,
                    enum: ['utf8', 'ascii', 'base64', 'binary'],
                    default: 'utf8'
                },
                maxSize: {
                    name: 'maxSize',
                    type: 'number',
                    description: 'Maximum file size to read (bytes)',
                    required: false,
                    default: 1048576, // 1MB
                    minimum: 1,
                    maximum: 10485760 // 10MB
                }
            },
            security: {
                level: 'restricted',
                permissions: ['file:read'],
                sandbox: true,
                timeout: 10000
            },
            examples: [
                {
                    description: 'Read a text file',
                    input: { path: './example.txt' },
                    output: { content: 'Hello, World!', size: 13, encoding: 'utf8' }
                }
            ]
        };
        super(definition);
    }

    async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
        const { path, encoding = 'utf8', maxSize = 1048576 } = parameters;
        const startTime = Date.now();

        try {
            // 安全检查
            const securityWarnings = this.performSecurityCheck(parameters, context);

            // 在浏览器环境中使用File API
            if (context.environment === 'browser') {
                return this.readFileInBrowser(path, encoding, maxSize, startTime, securityWarnings);
            }

            // 在Node.js环境中使用fs模块
            return this.readFileInNode(path, encoding, maxSize, startTime, securityWarnings);
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'FILE_READ_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to read file'
                },
                metadata: {
                    executionTime: Date.now() - startTime,
                    securityWarnings: this.performSecurityCheck(parameters, context)
                }
            };
        }
    }

    private async readFileInBrowser(
        path: string,
        encoding: string,
        maxSize: number,
        startTime: number,
        securityWarnings: string[]
    ): Promise<ToolExecutionResult> {
        // 在浏览器中，我们需要用户选择文件或从特定存储中读取
        // 这里模拟从localStorage或sessionStorage读取

        if (path.startsWith('localStorage:')) {
            const key = path.replace('localStorage:', '');
            const content = localStorage.getItem(key);

            if (content === null) {
                return {
                    success: false,
                    error: {
                        code: 'FILE_NOT_FOUND',
                        message: `LocalStorage key not found: ${key}`
                    },
                    metadata: {
                        executionTime: Date.now() - startTime,
                        securityWarnings
                    }
                };
            }

            return {
                success: true,
                result: {
                    content,
                    size: content.length,
                    encoding,
                    path,
                    type: 'localStorage'
                },
                metadata: {
                    executionTime: Date.now() - startTime,
                    securityWarnings
                }
            };
        }

        if (path.startsWith('sessionStorage:')) {
            const key = path.replace('sessionStorage:', '');
            const content = sessionStorage.getItem(key);

            if (content === null) {
                return {
                    success: false,
                    error: {
                        code: 'FILE_NOT_FOUND',
                        message: `SessionStorage key not found: ${key}`
                    },
                    metadata: {
                        executionTime: Date.now() - startTime,
                        securityWarnings
                    }
                };
            }

            return {
                success: true,
                result: {
                    content,
                    size: content.length,
                    encoding,
                    path,
                    type: 'sessionStorage'
                },
                metadata: {
                    executionTime: Date.now() - startTime,
                    securityWarnings
                }
            };
        }

        // 对于真实文件，需要用户交互选择
        return {
            success: false,
            error: {
                code: 'BROWSER_LIMITATION',
                message: 'Direct file system access not available in browser. Use localStorage: or sessionStorage: prefix, or implement file picker.'
            },
            metadata: {
                executionTime: Date.now() - startTime,
                securityWarnings
            }
        };
    }

    private async readFileInNode(
        path: string,
        encoding: string,
        maxSize: number,
        startTime: number,
        securityWarnings: string[]
    ): Promise<ToolExecutionResult> {
        // 在实际的Node.js环境中，这里会使用fs模块
        // 这里提供模拟实现

        // 模拟文件系统
        const mockFiles: Record<string, string> = {
            './package.json': JSON.stringify({ name: 'mock-package', version: '1.0.0' }, null, 2),
            './README.md': '# Mock Project\n\nThis is a mock file for demonstration.',
            './config.txt': 'API_KEY=mock_key\nDEBUG=true\nPORT=3000'
        };

        const content = mockFiles[path];

        if (content === undefined) {
            return {
                success: false,
                error: {
                    code: 'FILE_NOT_FOUND',
                    message: `File not found: ${path}`
                },
                metadata: {
                    executionTime: Date.now() - startTime,
                    securityWarnings
                }
            };
        }

        if (content.length > maxSize) {
            return {
                success: false,
                error: {
                    code: 'FILE_TOO_LARGE',
                    message: `File size ${content.length} exceeds maximum ${maxSize} bytes`
                },
                metadata: {
                    executionTime: Date.now() - startTime,
                    securityWarnings
                }
            };
        }

        return {
            success: true,
            result: {
                content,
                size: content.length,
                encoding,
                path,
                type: 'file'
            },
            metadata: {
                executionTime: Date.now() - startTime,
                securityWarnings
            }
        };
    }
}

// 文件写入工具
export class FileWriteTool extends BaseTool {
    constructor() {
        const definition: ToolDefinition = {
            name: 'file_write',
            description: 'Write content to a file',
            category: 'file',
            parameters: {
                path: {
                    name: 'path',
                    type: 'string',
                    description: 'Path to the file to write',
                    required: true
                },
                content: {
                    name: 'content',
                    type: 'string',
                    description: 'Content to write to the file',
                    required: true
                },
                encoding: {
                    name: 'encoding',
                    type: 'string',
                    description: 'File encoding',
                    required: false,
                    enum: ['utf8', 'ascii', 'base64', 'binary'],
                    default: 'utf8'
                },
                mode: {
                    name: 'mode',
                    type: 'string',
                    description: 'Write mode',
                    required: false,
                    enum: ['write', 'append'],
                    default: 'write'
                }
            },
            security: {
                level: 'dangerous',
                permissions: ['file:write'],
                sandbox: true,
                timeout: 15000
            },
            examples: [
                {
                    description: 'Write content to a file',
                    input: { path: './output.txt', content: 'Hello, World!' },
                    output: { success: true, bytesWritten: 13, path: './output.txt' }
                }
            ]
        };
        super(definition);
    }

    async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
        const { path, content, encoding = 'utf8', mode = 'write' } = parameters;
        const startTime = Date.now();

        try {
            // 安全检查
            const securityWarnings = this.performSecurityCheck(parameters, context);

            // 在浏览器环境中
            if (context.environment === 'browser') {
                return this.writeFileInBrowser(path, content, encoding, mode, startTime, securityWarnings);
            }

            // 在Node.js环境中
            return this.writeFileInNode(path, content, encoding, mode, startTime, securityWarnings);
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'FILE_WRITE_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to write file'
                },
                metadata: {
                    executionTime: Date.now() - startTime,
                    securityWarnings: this.performSecurityCheck(parameters, context)
                }
            };
        }
    }

    private async writeFileInBrowser(
        path: string,
        content: string,
        encoding: string,
        mode: string,
        startTime: number,
        securityWarnings: string[]
    ): Promise<ToolExecutionResult> {
        // 在浏览器中写入到localStorage或sessionStorage

        if (path.startsWith('localStorage:')) {
            const key = path.replace('localStorage:', '');

            if (mode === 'append') {
                const existing = localStorage.getItem(key) || '';
                localStorage.setItem(key, existing + content);
            } else {
                localStorage.setItem(key, content);
            }

            return {
                success: true,
                result: {
                    bytesWritten: content.length,
                    path,
                    encoding,
                    mode,
                    type: 'localStorage'
                },
                metadata: {
                    executionTime: Date.now() - startTime,
                    securityWarnings
                }
            };
        }

        if (path.startsWith('sessionStorage:')) {
            const key = path.replace('sessionStorage:', '');

            if (mode === 'append') {
                const existing = sessionStorage.getItem(key) || '';
                sessionStorage.setItem(key, existing + content);
            } else {
                sessionStorage.setItem(key, content);
            }

            return {
                success: true,
                result: {
                    bytesWritten: content.length,
                    path,
                    encoding,
                    mode,
                    type: 'sessionStorage'
                },
                metadata: {
                    executionTime: Date.now() - startTime,
                    securityWarnings
                }
            };
        }

        // 使用File System Access API（如果可用）
        if ('showSaveFilePicker' in window) {
            try {
                const fileHandle = await (window as any).showSaveFilePicker({
                    suggestedName: path.split('/').pop() || 'file.txt'
                });

                const writable = await fileHandle.createWritable();
                await writable.write(content);
                await writable.close();

                return {
                    success: true,
                    result: {
                        bytesWritten: content.length,
                        path: fileHandle.name,
                        encoding,
                        mode,
                        type: 'fileSystemAccess'
                    },
                    metadata: {
                        executionTime: Date.now() - startTime,
                        securityWarnings
                    }
                };
            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                    return {
                        success: false,
                        error: {
                            code: 'USER_CANCELLED',
                            message: 'User cancelled file save dialog'
                        },
                        metadata: {
                            executionTime: Date.now() - startTime,
                            securityWarnings
                        }
                    };
                }
                throw error;
            }
        }

        // fallback: 下载文件
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = path.split('/').pop() || 'file.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return {
            success: true,
            result: {
                bytesWritten: content.length,
                path,
                encoding,
                mode,
                type: 'download'
            },
            metadata: {
                executionTime: Date.now() - startTime,
                securityWarnings
            }
        };
    }

    private async writeFileInNode(
        path: string,
        content: string,
        encoding: string,
        mode: string,
        startTime: number,
        securityWarnings: string[]
    ): Promise<ToolExecutionResult> {
        // 在实际的Node.js环境中，这里会使用fs模块
        // 这里提供模拟实现

        return {
            success: true,
            result: {
                bytesWritten: content.length,
                path,
                encoding,
                mode,
                type: 'file'
            },
            metadata: {
                executionTime: Date.now() - startTime,
                securityWarnings
            }
        };
    }
}

// 文件搜索工具
export class FileSearchTool extends BaseTool {
    constructor() {
        const definition: ToolDefinition = {
            name: 'file_search',
            description: 'Search for files matching a pattern',
            category: 'file',
            parameters: {
                pattern: {
                    name: 'pattern',
                    type: 'string',
                    description: 'Search pattern (glob or regex)',
                    required: true
                },
                directory: {
                    name: 'directory',
                    type: 'string',
                    description: 'Directory to search in',
                    required: false,
                    default: './'
                },
                recursive: {
                    name: 'recursive',
                    type: 'boolean',
                    description: 'Search recursively in subdirectories',
                    required: false,
                    default: true
                },
                maxResults: {
                    name: 'maxResults',
                    type: 'number',
                    description: 'Maximum number of results to return',
                    required: false,
                    default: 100,
                    minimum: 1,
                    maximum: 1000
                },
                includeContent: {
                    name: 'includeContent',
                    type: 'boolean',
                    description: 'Include file content in results',
                    required: false,
                    default: false
                }
            },
            security: {
                level: 'restricted',
                permissions: ['file:search'],
                sandbox: true,
                timeout: 30000
            },
            examples: [
                {
                    description: 'Search for TypeScript files',
                    input: { pattern: '*.ts', directory: './src' },
                    output: { files: ['./src/index.ts', './src/utils.ts'], count: 2 }
                }
            ]
        };
        super(definition);
    }

    async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
        const {
            pattern,
            directory = './',
            recursive = true,
            maxResults = 100,
            includeContent = false
        } = parameters;
        const startTime = Date.now();

        try {
            // 安全检查
            const securityWarnings = this.performSecurityCheck(parameters, context);

            // 在浏览器环境中
            if (context.environment === 'browser') {
                return this.searchFilesInBrowser(pattern, directory, recursive, maxResults, includeContent, startTime, securityWarnings);
            }

            // 在Node.js环境中
            return this.searchFilesInNode(pattern, directory, recursive, maxResults, includeContent, startTime, securityWarnings);
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'FILE_SEARCH_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to search files'
                },
                metadata: {
                    executionTime: Date.now() - startTime,
                    securityWarnings: this.performSecurityCheck(parameters, context)
                }
            };
        }
    }

    private async searchFilesInBrowser(
        pattern: string,
        directory: string,
        recursive: boolean,
        maxResults: number,
        includeContent: boolean,
        startTime: number,
        securityWarnings: string[]
    ): Promise<ToolExecutionResult> {
        // 在浏览器中搜索localStorage和sessionStorage中的项目
        const results: any[] = [];

        // 搜索localStorage
        if (directory === './' || directory.includes('localStorage')) {
            for (let i = 0; i < localStorage.length && results.length < maxResults; i++) {
                const key = localStorage.key(i);
                if (key && this.matchesPattern(key, pattern)) {
                    const item: any = {
                        path: `localStorage:${key}`,
                        type: 'localStorage',
                        size: localStorage.getItem(key)?.length || 0
                    };

                    if (includeContent) {
                        item.content = localStorage.getItem(key);
                    }

                    results.push(item);
                }
            }
        }

        // 搜索sessionStorage
        if (directory === './' || directory.includes('sessionStorage')) {
            for (let i = 0; i < sessionStorage.length && results.length < maxResults; i++) {
                const key = sessionStorage.key(i);
                if (key && this.matchesPattern(key, pattern)) {
                    const item: any = {
                        path: `sessionStorage:${key}`,
                        type: 'sessionStorage',
                        size: sessionStorage.getItem(key)?.length || 0
                    };

                    if (includeContent) {
                        item.content = sessionStorage.getItem(key);
                    }

                    results.push(item);
                }
            }
        }

        return {
            success: true,
            result: {
                files: results,
                count: results.length,
                pattern,
                directory,
                recursive
            },
            metadata: {
                executionTime: Date.now() - startTime,
                securityWarnings
            }
        };
    }

    private async searchFilesInNode(
        pattern: string,
        directory: string,
        recursive: boolean,
        maxResults: number,
        includeContent: boolean,
        startTime: number,
        securityWarnings: string[]
    ): Promise<ToolExecutionResult> {
        // 模拟文件系统搜索
        const mockFiles = [
            './package.json',
            './README.md',
            './src/index.ts',
            './src/utils.ts',
            './src/components/Button.tsx',
            './src/components/Input.tsx',
            './tests/index.test.ts',
            './tests/utils.test.ts',
            './docs/api.md',
            './docs/getting-started.md'
        ];

        const matchingFiles = mockFiles
            .filter(file => {
                // 检查目录匹配
                if (!file.startsWith(directory.replace('./', ''))) {
                    return false;
                }

                // 检查递归设置
                if (!recursive) {
                    const relativePath = file.replace(directory, '');
                    if (relativePath.includes('/')) {
                        return false;
                    }
                }

                // 检查模式匹配
                const fileName = file.split('/').pop() || '';
                return this.matchesPattern(fileName, pattern);
            })
            .slice(0, maxResults);

        const results = matchingFiles.map(file => {
            const item: any = {
                path: file,
                type: 'file',
                size: Math.floor(Math.random() * 10000) // 模拟文件大小
            };

            if (includeContent) {
                item.content = `// Mock content for ${file}\n// This is a demonstration file.`;
            }

            return item;
        });

        return {
            success: true,
            result: {
                files: results,
                count: results.length,
                pattern,
                directory,
                recursive
            },
            metadata: {
                executionTime: Date.now() - startTime,
                securityWarnings
            }
        };
    }

    private matchesPattern(text: string, pattern: string): boolean {
        // 简单的glob模式匹配
        if (pattern.includes('*')) {
            const regexPattern = pattern
                .replace(/\./g, '\\.')
                .replace(/\*/g, '.*')
                .replace(/\?/g, '.');
            return new RegExp(`^${regexPattern}$`).test(text);
        }

        // 正则表达式模式
        if (pattern.startsWith('/') && pattern.endsWith('/')) {
            const regex = pattern.slice(1, -1);
            return new RegExp(regex).test(text);
        }

        // 精确匹配
        return text === pattern;
    }
}

// 文件信息获取工具
export class FileInfoTool extends BaseTool {
    constructor() {
        const definition: ToolDefinition = {
            name: 'file_info',
            description: 'Get information about a file or directory',
            category: 'file',
            parameters: {
                path: {
                    name: 'path',
                    type: 'string',
                    description: 'Path to the file or directory',
                    required: true
                }
            },
            security: {
                level: 'safe',
                permissions: ['file:read'],
                sandbox: true,
                timeout: 5000
            },
            examples: [
                {
                    description: 'Get file information',
                    input: { path: './example.txt' },
                    output: {
                        name: 'example.txt',
                        size: 1024,
                        type: 'file',
                        modified: '2024-01-01T00:00:00Z'
                    }
                }
            ]
        };
        super(definition);
    }

    async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
        const { path } = parameters;
        const startTime = Date.now();

        try {
            // 安全检查
            const securityWarnings = this.performSecurityCheck(parameters, context);

            let result: any;

            if (context.environment === 'browser') {
                result = this.getFileInfoInBrowser(path);
            } else {
                result = this.getFileInfoInNode(path);
            }

            return {
                success: true,
                result,
                metadata: {
                    executionTime: Date.now() - startTime,
                    securityWarnings
                }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'FILE_INFO_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to get file info'
                },
                metadata: {
                    executionTime: Date.now() - startTime,
                    securityWarnings: this.performSecurityCheck(parameters, context)
                }
            };
        }
    }

    private getFileInfoInBrowser(path: string): any {
        if (path.startsWith('localStorage:')) {
            const key = path.replace('localStorage:', '');
            const content = localStorage.getItem(key);

            if (content === null) {
                throw new Error(`LocalStorage key not found: ${key}`);
            }

            return {
                name: key,
                path,
                size: content.length,
                type: 'localStorage',
                created: null,
                modified: null,
                readable: true,
                writable: true
            };
        }

        if (path.startsWith('sessionStorage:')) {
            const key = path.replace('sessionStorage:', '');
            const content = sessionStorage.getItem(key);

            if (content === null) {
                throw new Error(`SessionStorage key not found: ${key}`);
            }

            return {
                name: key,
                path,
                size: content.length,
                type: 'sessionStorage',
                created: null,
                modified: null,
                readable: true,
                writable: true
            };
        }

        throw new Error('File system access not available in browser environment');
    }

    private getFileInfoInNode(path: string): any {
        // 模拟文件信息
        const mockFileInfo = {
            name: path.split('/').pop() || path,
            path,
            size: Math.floor(Math.random() * 100000),
            type: path.includes('.') ? 'file' : 'directory',
            created: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            modified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            readable: true,
            writable: true,
            executable: false
        };

        return mockFileInfo;
    }
}
