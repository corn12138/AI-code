/**
 * Shell命令执行工具集
 * 支持命令执行、后台任务、环境变量管理等功能
 */

import { BaseTool, ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '../ToolProtocol';

// Shell命令执行工具
export class ShellExecuteTool extends BaseTool {
    private static runningProcesses: Map<string, any> = new Map();

    constructor() {
        const definition: ToolDefinition = {
            name: 'shell_execute',
            description: 'Execute a shell command',
            category: 'shell',
            parameters: {
                command: {
                    name: 'command',
                    type: 'string',
                    description: 'Shell command to execute',
                    required: true
                },
                workingDirectory: {
                    name: 'workingDirectory',
                    type: 'string',
                    description: 'Working directory for command execution',
                    required: false,
                    default: './'
                },
                timeout: {
                    name: 'timeout',
                    type: 'number',
                    description: 'Command timeout in milliseconds',
                    required: false,
                    default: 30000,
                    minimum: 1000,
                    maximum: 300000
                },
                environment: {
                    name: 'environment',
                    type: 'object',
                    description: 'Additional environment variables',
                    required: false,
                    properties: {}
                },
                shell: {
                    name: 'shell',
                    type: 'string',
                    description: 'Shell to use for execution',
                    required: false,
                    enum: ['bash', 'sh', 'zsh', 'cmd', 'powershell'],
                    default: 'bash'
                }
            },
            security: {
                level: 'dangerous',
                permissions: ['shell:execute'],
                sandbox: true,
                timeout: 300000
            },
            examples: [
                {
                    description: 'List directory contents',
                    input: { command: 'ls -la' },
                    output: { stdout: 'total 8\ndrwxr-xr-x  2 user user 4096 Jan  1 00:00 .\n...', exitCode: 0 }
                },
                {
                    description: 'Get current directory',
                    input: { command: 'pwd' },
                    output: { stdout: '/home/user/project', exitCode: 0 }
                }
            ]
        };
        super(definition);
    }

    async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
        const {
            command,
            workingDirectory = './',
            timeout = 30000,
            environment = {},
            shell = 'bash'
        } = parameters;
        const startTime = Date.now();

        try {
            // 安全检查
            const securityWarnings = this.performSecurityCheck(parameters, context);

            // 命令白名单检查
            const securityCheck = this.checkCommandSecurity(command, context);
            if (!securityCheck.allowed) {
                return {
                    success: false,
                    error: {
                        code: 'COMMAND_BLOCKED',
                        message: securityCheck.reason
                    },
                    metadata: {
                        executionTime: Date.now() - startTime,
                        securityWarnings
                    }
                };
            }

            // 在浏览器环境中模拟执行
            if (context.environment === 'browser') {
                return this.simulateCommandInBrowser(command, workingDirectory, timeout, environment, shell, startTime, securityWarnings);
            }

            // 在Node.js环境中实际执行
            return this.executeCommandInNode(command, workingDirectory, timeout, environment, shell, startTime, securityWarnings);
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'SHELL_EXECUTION_ERROR',
                    message: error instanceof Error ? error.message : 'Shell execution failed'
                },
                metadata: {
                    executionTime: Date.now() - startTime,
                    securityWarnings: this.performSecurityCheck(parameters, context)
                }
            };
        }
    }

    private checkCommandSecurity(command: string, context: ToolExecutionContext): { allowed: boolean; reason?: string } {
        // 危险命令黑名单
        const dangerousCommands = [
            'rm -rf /',
            'format',
            'del /f /s /q',
            'mkfs',
            'dd if=',
            'sudo rm',
            'chmod 777',
            ':(){ :|:& };:',  // fork bomb
            'curl | sh',
            'wget | sh'
        ];

        // 检查黑名单
        for (const dangerous of dangerousCommands) {
            if (command.includes(dangerous)) {
                return {
                    allowed: false,
                    reason: `Command contains dangerous pattern: ${dangerous}`
                };
            }
        }

        // 检查用户权限
        const requiredPermissions = this.getCommandPermissions(command);
        const userPermissions = context.permissions;

        for (const permission of requiredPermissions) {
            if (!userPermissions.includes(permission)) {
                return {
                    allowed: false,
                    reason: `Missing required permission: ${permission}`
                };
            }
        }

        return { allowed: true };
    }

    private getCommandPermissions(command: string): string[] {
        const permissions: string[] = ['shell:execute'];

        // 根据命令添加特定权限要求
        if (command.includes('sudo')) {
            permissions.push('shell:sudo');
        }
        if (command.includes('npm') || command.includes('yarn') || command.includes('pip')) {
            permissions.push('shell:package_manager');
        }
        if (command.includes('git')) {
            permissions.push('shell:git');
        }
        if (command.includes('docker')) {
            permissions.push('shell:docker');
        }
        if (command.includes('systemctl') || command.includes('service')) {
            permissions.push('shell:system_service');
        }

        return permissions;
    }

    private async simulateCommandInBrowser(
        command: string,
        workingDirectory: string,
        timeout: number,
        environment: Record<string, string>,
        shell: string,
        startTime: number,
        securityWarnings: string[]
    ): Promise<ToolExecutionResult> {
        // 模拟常见命令的输出
        const simulatedOutputs: Record<string, any> = {
            'pwd': {
                stdout: '/Users/demo/project',
                stderr: '',
                exitCode: 0
            },
            'ls': {
                stdout: 'package.json\nREADME.md\nsrc/\nnode_modules/\n.git/',
                stderr: '',
                exitCode: 0
            },
            'ls -la': {
                stdout: 'total 256\ndrwxr-xr-x  10 user  staff   320 Jan  1 12:00 .\ndrwxr-xr-x   3 user  staff    96 Jan  1 12:00 ..\n-rw-r--r--   1 user  staff  1024 Jan  1 12:00 package.json\n-rw-r--r--   1 user  staff   512 Jan  1 12:00 README.md\ndrwxr-xr-x   5 user  staff   160 Jan  1 12:00 src\ndrwxr-xr-x 500 user  staff 16000 Jan  1 12:00 node_modules',
                stderr: '',
                exitCode: 0
            },
            'whoami': {
                stdout: 'demo-user',
                stderr: '',
                exitCode: 0
            },
            'date': {
                stdout: new Date().toString(),
                stderr: '',
                exitCode: 0
            },
            'echo hello': {
                stdout: 'hello',
                stderr: '',
                exitCode: 0
            },
            'node --version': {
                stdout: 'v18.17.0',
                stderr: '',
                exitCode: 0
            },
            'npm --version': {
                stdout: '9.6.7',
                stderr: '',
                exitCode: 0
            },
            'git status': {
                stdout: 'On branch main\nYour branch is up to date with \'origin/main\'.\n\nnothing to commit, working tree clean',
                stderr: '',
                exitCode: 0
            }
        };

        // 简化命令匹配
        const normalizedCommand = command.trim().toLowerCase();
        let result = simulatedOutputs[normalizedCommand];

        if (!result) {
            // 处理echo命令
            if (command.startsWith('echo ')) {
                const text = command.substring(5);
                result = {
                    stdout: text,
                    stderr: '',
                    exitCode: 0
                };
            }
            // 处理cat命令
            else if (command.startsWith('cat ')) {
                const filename = command.substring(4).trim();
                result = {
                    stdout: `# Mock content of ${filename}\n# This is simulated file content`,
                    stderr: '',
                    exitCode: 0
                };
            }
            // 处理grep命令
            else if (command.includes('grep')) {
                result = {
                    stdout: 'matching line 1\nmatching line 2',
                    stderr: '',
                    exitCode: 0
                };
            }
            // 默认未知命令
            else {
                result = {
                    stdout: '',
                    stderr: `Command not found in simulation: ${command}`,
                    exitCode: 127
                };
            }
        }

        // 模拟执行时间
        const simulatedDelay = Math.random() * 1000 + 100;
        await new Promise(resolve => setTimeout(resolve, simulatedDelay));

        return {
            success: result.exitCode === 0,
            result: {
                command,
                stdout: result.stdout,
                stderr: result.stderr,
                exitCode: result.exitCode,
                workingDirectory,
                environment,
                shell,
                simulated: true
            },
            metadata: {
                executionTime: Date.now() - startTime,
                securityWarnings
            }
        };
    }

    private async executeCommandInNode(
        command: string,
        workingDirectory: string,
        timeout: number,
        environment: Record<string, string>,
        shell: string,
        startTime: number,
        securityWarnings: string[]
    ): Promise<ToolExecutionResult> {
        // 在实际的Node.js环境中，这里会使用child_process模块
        // 这里提供模拟实现

        return {
            success: false,
            error: {
                code: 'NOT_IMPLEMENTED',
                message: 'Actual shell execution not implemented in this demo environment'
            },
            metadata: {
                executionTime: Date.now() - startTime,
                securityWarnings
            }
        };
    }
}

// 后台进程管理工具
export class ShellBackgroundTool extends BaseTool {
    private static backgroundProcesses: Map<string, any> = new Map();

    constructor() {
        const definition: ToolDefinition = {
            name: 'shell_background',
            description: 'Run a command in the background and manage background processes',
            category: 'shell',
            parameters: {
                action: {
                    name: 'action',
                    type: 'string',
                    description: 'Action to perform',
                    required: true,
                    enum: ['start', 'stop', 'list', 'status', 'logs']
                },
                command: {
                    name: 'command',
                    type: 'string',
                    description: 'Command to run in background (for start action)',
                    required: false
                },
                processId: {
                    name: 'processId',
                    type: 'string',
                    description: 'Process ID for stop/status/logs actions',
                    required: false
                },
                name: {
                    name: 'name',
                    type: 'string',
                    description: 'Name for the background process',
                    required: false
                }
            },
            security: {
                level: 'dangerous',
                permissions: ['shell:background'],
                sandbox: true,
                timeout: 10000
            },
            examples: [
                {
                    description: 'Start a background process',
                    input: { action: 'start', command: 'npm run dev', name: 'dev-server' },
                    output: { processId: 'bg-1234', name: 'dev-server', status: 'running' }
                },
                {
                    description: 'List background processes',
                    input: { action: 'list' },
                    output: { processes: [{ id: 'bg-1234', name: 'dev-server', status: 'running' }] }
                }
            ]
        };
        super(definition);
    }

    async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
        const { action, command, processId, name } = parameters;
        const startTime = Date.now();

        try {
            // 安全检查
            const securityWarnings = this.performSecurityCheck(parameters, context);

            let result: any;

            switch (action) {
                case 'start':
                    result = await this.startBackgroundProcess(command, name, context);
                    break;
                case 'stop':
                    result = await this.stopBackgroundProcess(processId);
                    break;
                case 'list':
                    result = this.listBackgroundProcesses();
                    break;
                case 'status':
                    result = this.getProcessStatus(processId);
                    break;
                case 'logs':
                    result = this.getProcessLogs(processId);
                    break;
                default:
                    throw new Error(`Unknown action: ${action}`);
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
                    code: 'BACKGROUND_PROCESS_ERROR',
                    message: error instanceof Error ? error.message : 'Background process operation failed'
                },
                metadata: {
                    executionTime: Date.now() - startTime,
                    securityWarnings: this.performSecurityCheck(parameters, context)
                }
            };
        }
    }

    private async startBackgroundProcess(command: string, name?: string, context?: ToolExecutionContext): Promise<any> {
        if (!command) {
            throw new Error('Command is required for start action');
        }

        const processId = `bg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const processName = name || `process-${processId}`;

        // 模拟后台进程
        const process = {
            id: processId,
            name: processName,
            command,
            status: 'running',
            startTime: new Date().toISOString(),
            pid: Math.floor(Math.random() * 10000) + 1000,
            logs: [`Started process: ${command}`, `Process ID: ${processId}`],
            environment: context?.environment || 'browser'
        };

        ShellBackgroundTool.backgroundProcesses.set(processId, process);

        // 模拟进程运行一段时间后可能停止
        setTimeout(() => {
            const proc = ShellBackgroundTool.backgroundProcesses.get(processId);
            if (proc && Math.random() > 0.7) { // 30% 几率进程自然结束
                proc.status = 'completed';
                proc.endTime = new Date().toISOString();
                proc.logs.push('Process completed successfully');
            }
        }, Math.random() * 30000 + 10000); // 10-40秒后

        return {
            processId,
            name: processName,
            command,
            status: 'running',
            startTime: process.startTime,
            pid: process.pid
        };
    }

    private async stopBackgroundProcess(processId?: string): Promise<any> {
        if (!processId) {
            throw new Error('Process ID is required for stop action');
        }

        const process = ShellBackgroundTool.backgroundProcesses.get(processId);
        if (!process) {
            throw new Error(`Process not found: ${processId}`);
        }

        if (process.status !== 'running') {
            throw new Error(`Process is not running: ${processId}`);
        }

        process.status = 'stopped';
        process.endTime = new Date().toISOString();
        process.logs.push('Process stopped by user');

        return {
            processId,
            name: process.name,
            status: 'stopped',
            endTime: process.endTime
        };
    }

    private listBackgroundProcesses(): any {
        const processes = Array.from(ShellBackgroundTool.backgroundProcesses.values()).map(proc => ({
            id: proc.id,
            name: proc.name,
            command: proc.command,
            status: proc.status,
            startTime: proc.startTime,
            endTime: proc.endTime || null,
            pid: proc.pid
        }));

        return {
            processes,
            count: processes.length,
            running: processes.filter(p => p.status === 'running').length,
            stopped: processes.filter(p => p.status === 'stopped').length,
            completed: processes.filter(p => p.status === 'completed').length
        };
    }

    private getProcessStatus(processId?: string): any {
        if (!processId) {
            throw new Error('Process ID is required for status action');
        }

        const process = ShellBackgroundTool.backgroundProcesses.get(processId);
        if (!process) {
            throw new Error(`Process not found: ${processId}`);
        }

        return {
            id: process.id,
            name: process.name,
            command: process.command,
            status: process.status,
            startTime: process.startTime,
            endTime: process.endTime || null,
            pid: process.pid,
            uptime: process.endTime ?
                new Date(process.endTime).getTime() - new Date(process.startTime).getTime() :
                Date.now() - new Date(process.startTime).getTime()
        };
    }

    private getProcessLogs(processId?: string): any {
        if (!processId) {
            throw new Error('Process ID is required for logs action');
        }

        const process = ShellBackgroundTool.backgroundProcesses.get(processId);
        if (!process) {
            throw new Error(`Process not found: ${processId}`);
        }

        return {
            processId,
            name: process.name,
            logs: process.logs,
            logCount: process.logs.length
        };
    }
}

// 环境变量管理工具
export class ShellEnvironmentTool extends BaseTool {
    private static environmentVariables: Map<string, string> = new Map();

    constructor() {
        const definition: ToolDefinition = {
            name: 'shell_environment',
            description: 'Manage environment variables',
            category: 'shell',
            parameters: {
                action: {
                    name: 'action',
                    type: 'string',
                    description: 'Action to perform',
                    required: true,
                    enum: ['get', 'set', 'unset', 'list', 'export']
                },
                name: {
                    name: 'name',
                    type: 'string',
                    description: 'Environment variable name',
                    required: false
                },
                value: {
                    name: 'value',
                    type: 'string',
                    description: 'Environment variable value (for set action)',
                    required: false
                }
            },
            security: {
                level: 'restricted',
                permissions: ['shell:environment'],
                sandbox: true,
                timeout: 5000
            },
            examples: [
                {
                    description: 'Set an environment variable',
                    input: { action: 'set', name: 'NODE_ENV', value: 'development' },
                    output: { name: 'NODE_ENV', value: 'development', action: 'set' }
                },
                {
                    description: 'Get an environment variable',
                    input: { action: 'get', name: 'NODE_ENV' },
                    output: { name: 'NODE_ENV', value: 'development' }
                }
            ]
        };
        super(definition);
    }

    async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
        const { action, name, value } = parameters;
        const startTime = Date.now();

        try {
            // 安全检查
            const securityWarnings = this.performSecurityCheck(parameters, context);

            let result: any;

            switch (action) {
                case 'get':
                    result = this.getEnvironmentVariable(name);
                    break;
                case 'set':
                    result = this.setEnvironmentVariable(name, value);
                    break;
                case 'unset':
                    result = this.unsetEnvironmentVariable(name);
                    break;
                case 'list':
                    result = this.listEnvironmentVariables();
                    break;
                case 'export':
                    result = this.exportEnvironmentVariables();
                    break;
                default:
                    throw new Error(`Unknown action: ${action}`);
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
                    code: 'ENVIRONMENT_ERROR',
                    message: error instanceof Error ? error.message : 'Environment operation failed'
                },
                metadata: {
                    executionTime: Date.now() - startTime,
                    securityWarnings: this.performSecurityCheck(parameters, context)
                }
            };
        }
    }

    private getEnvironmentVariable(name?: string): any {
        if (!name) {
            throw new Error('Variable name is required for get action');
        }

        // 首先检查自定义环境变量
        let value = ShellEnvironmentTool.environmentVariables.get(name);

        // 如果没有，检查浏览器环境或Node.js环境变量
        if (value === undefined) {
            if (typeof process !== 'undefined' && process.env) {
                value = process.env[name];
            }
        }

        return {
            name,
            value: value || null,
            exists: value !== undefined
        };
    }

    private setEnvironmentVariable(name?: string, value?: string): any {
        if (!name) {
            throw new Error('Variable name is required for set action');
        }
        if (value === undefined) {
            throw new Error('Variable value is required for set action');
        }

        // 检查变量名安全性
        if (!this.isValidVariableName(name)) {
            throw new Error(`Invalid variable name: ${name}`);
        }

        // 检查敏感变量
        if (this.isSensitiveVariable(name)) {
            throw new Error(`Cannot modify sensitive variable: ${name}`);
        }

        ShellEnvironmentTool.environmentVariables.set(name, value);

        return {
            name,
            value,
            action: 'set',
            timestamp: new Date().toISOString()
        };
    }

    private unsetEnvironmentVariable(name?: string): any {
        if (!name) {
            throw new Error('Variable name is required for unset action');
        }

        // 检查敏感变量
        if (this.isSensitiveVariable(name)) {
            throw new Error(`Cannot unset sensitive variable: ${name}`);
        }

        const existed = ShellEnvironmentTool.environmentVariables.has(name);
        ShellEnvironmentTool.environmentVariables.delete(name);

        return {
            name,
            action: 'unset',
            existed,
            timestamp: new Date().toISOString()
        };
    }

    private listEnvironmentVariables(): any {
        const customVars = Array.from(ShellEnvironmentTool.environmentVariables.entries()).map(([name, value]) => ({
            name,
            value,
            source: 'custom'
        }));

        // 添加一些模拟的系统环境变量
        const systemVars = [
            { name: 'PATH', value: '/usr/local/bin:/usr/bin:/bin', source: 'system' },
            { name: 'HOME', value: '/home/user', source: 'system' },
            { name: 'USER', value: 'demo-user', source: 'system' },
            { name: 'NODE_ENV', value: 'development', source: 'system' }
        ];

        const allVars = [...customVars, ...systemVars];

        return {
            variables: allVars,
            count: allVars.length,
            custom: customVars.length,
            system: systemVars.length
        };
    }

    private exportEnvironmentVariables(): any {
        const variables = Object.fromEntries(ShellEnvironmentTool.environmentVariables);

        return {
            variables,
            count: Object.keys(variables).length,
            exportFormat: Object.entries(variables)
                .map(([name, value]) => `export ${name}="${value}"`)
                .join('\n')
        };
    }

    private isValidVariableName(name: string): boolean {
        // 环境变量名必须以字母或下划线开头，只能包含字母、数字和下划线
        return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
    }

    private isSensitiveVariable(name: string): boolean {
        const sensitiveVars = [
            'PATH', 'HOME', 'USER', 'SHELL', 'PWD', 'OLDPWD',
            'LD_LIBRARY_PATH', 'PYTHONPATH', 'CLASSPATH'
        ];
        return sensitiveVars.includes(name.toUpperCase());
    }
}
