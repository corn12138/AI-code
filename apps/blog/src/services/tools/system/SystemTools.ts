/**
 * 系统工具集
 * 支持系统信息获取、资源监控、进程管理等功能
 */

import { BaseTool, ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '../ToolProtocol';

// 系统信息工具
export class SystemInfoTool extends BaseTool {
    constructor() {
        const definition: ToolDefinition = {
            name: 'system_info',
            description: 'Get system information and environment details',
            category: 'system',
            parameters: {
                category: {
                    name: 'category',
                    type: 'string',
                    description: 'Information category to retrieve',
                    required: false,
                    enum: ['all', 'os', 'hardware', 'network', 'browser', 'runtime'],
                    default: 'all'
                }
            },
            security: {
                level: 'safe',
                permissions: ['system:info'],
                sandbox: true,
                timeout: 5000
            },
            examples: [
                {
                    description: 'Get all system information',
                    input: { category: 'all' },
                    output: {
                        os: { platform: 'browser', userAgent: '...' },
                        hardware: { cores: 4, memory: '8GB' }
                    }
                }
            ]
        };
        super(definition);
    }

    async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
        const { category = 'all' } = parameters;
        const startTime = Date.now();

        try {
            const systemInfo = this.getSystemInfo(category, context);

            return {
                success: true,
                result: systemInfo,
                metadata: { executionTime: Date.now() - startTime }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'SYSTEM_INFO_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to get system info'
                },
                metadata: { executionTime: Date.now() - startTime }
            };
        }
    }

    private getSystemInfo(category: string, context: ToolExecutionContext): any {
        const info: any = {};

        if (category === 'all' || category === 'os') {
            info.os = this.getOSInfo();
        }

        if (category === 'all' || category === 'hardware') {
            info.hardware = this.getHardwareInfo();
        }

        if (category === 'all' || category === 'network') {
            info.network = this.getNetworkInfo();
        }

        if (category === 'all' || category === 'browser') {
            info.browser = this.getBrowserInfo();
        }

        if (category === 'all' || category === 'runtime') {
            info.runtime = this.getRuntimeInfo(context);
        }

        return info;
    }

    private getOSInfo(): any {
        if (typeof navigator !== 'undefined') {
            return {
                platform: 'browser',
                userAgent: navigator.userAgent,
                language: navigator.language,
                languages: navigator.languages,
                onLine: navigator.onLine,
                cookieEnabled: navigator.cookieEnabled,
                doNotTrack: navigator.doNotTrack
            };
        }

        // Node.js environment simulation
        return {
            platform: 'nodejs',
            arch: 'x64',
            version: 'v18.17.0',
            uptime: Math.floor(Math.random() * 86400), // seconds
            hostname: 'demo-server'
        };
    }

    private getHardwareInfo(): any {
        if (typeof navigator !== 'undefined') {
            const hardwareConcurrency = navigator.hardwareConcurrency || 4;

            return {
                cores: hardwareConcurrency,
                memory: this.getMemoryInfo(),
                screen: {
                    width: screen.width,
                    height: screen.height,
                    colorDepth: screen.colorDepth,
                    pixelDepth: screen.pixelDepth
                },
                devicePixelRatio: window.devicePixelRatio || 1
            };
        }

        // Simulated server hardware
        return {
            cores: 8,
            memory: {
                total: '16GB',
                free: '4.2GB',
                used: '11.8GB'
            },
            storage: {
                total: '500GB',
                free: '120GB',
                used: '380GB'
            }
        };
    }

    private getMemoryInfo(): any {
        // Browser memory info (if available)
        if ('memory' in performance) {
            const memInfo = (performance as any).memory;
            return {
                usedJSHeapSize: this.formatBytes(memInfo.usedJSHeapSize),
                totalJSHeapSize: this.formatBytes(memInfo.totalJSHeapSize),
                jsHeapSizeLimit: this.formatBytes(memInfo.jsHeapSizeLimit)
            };
        }

        return {
            estimated: '2-8GB',
            available: 'Unknown in browser environment'
        };
    }

    private getNetworkInfo(): any {
        if (typeof navigator !== 'undefined' && 'connection' in navigator) {
            const connection = (navigator as any).connection;
            return {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            };
        }

        return {
            status: navigator?.onLine ? 'online' : 'offline',
            type: 'unknown'
        };
    }

    private getBrowserInfo(): any {
        if (typeof navigator === 'undefined') {
            return { environment: 'nodejs' };
        }

        const ua = navigator.userAgent;
        let browserName = 'Unknown';
        let browserVersion = 'Unknown';

        if (ua.includes('Chrome')) {
            browserName = 'Chrome';
            browserVersion = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
        } else if (ua.includes('Firefox')) {
            browserName = 'Firefox';
            browserVersion = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
        } else if (ua.includes('Safari')) {
            browserName = 'Safari';
            browserVersion = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
        } else if (ua.includes('Edge')) {
            browserName = 'Edge';
            browserVersion = ua.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
        }

        return {
            name: browserName,
            version: browserVersion,
            userAgent: ua,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            support: {
                webGL: this.checkWebGLSupport(),
                webAssembly: typeof WebAssembly !== 'undefined',
                serviceWorker: 'serviceWorker' in navigator,
                webRTC: 'RTCPeerConnection' in window
            }
        };
    }

    private getRuntimeInfo(context: ToolExecutionContext): any {
        return {
            environment: context.environment,
            timestamp: new Date().toISOString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            permissions: context.permissions,
            constraints: context.constraints
        };
    }

    private checkWebGLSupport(): boolean {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch {
            return false;
        }
    }

    private formatBytes(bytes: number): string {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
}

// 系统资源监控工具
export class SystemResourcesTool extends BaseTool {
    constructor() {
        const definition: ToolDefinition = {
            name: 'system_resources',
            description: 'Monitor system resource usage (CPU, memory, network)',
            category: 'system',
            parameters: {
                duration: {
                    name: 'duration',
                    type: 'number',
                    description: 'Monitoring duration in milliseconds',
                    required: false,
                    default: 5000,
                    minimum: 1000,
                    maximum: 60000
                },
                interval: {
                    name: 'interval',
                    type: 'number',
                    description: 'Sampling interval in milliseconds',
                    required: false,
                    default: 1000,
                    minimum: 100,
                    maximum: 5000
                },
                resources: {
                    name: 'resources',
                    type: 'array',
                    description: 'Resources to monitor',
                    required: false,
                    items: {
                        name: 'resource',
                        type: 'string',
                        description: 'Resource type',
                        required: false
                    }
                }
            },
            security: {
                level: 'safe',
                permissions: ['system:monitor'],
                sandbox: true,
                timeout: 70000
            },
            examples: [
                {
                    description: 'Monitor CPU and memory for 5 seconds',
                    input: { duration: 5000, resources: ['cpu', 'memory'] },
                    output: {
                        samples: [{ timestamp: '...', cpu: 45.2, memory: 67.8 }],
                        averages: { cpu: 44.1, memory: 68.2 }
                    }
                }
            ]
        };
        super(definition);
    }

    async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
        const {
            duration = 5000,
            interval = 1000,
            resources = ['cpu', 'memory', 'network']
        } = parameters;
        const startTime = Date.now();

        try {
            const monitoring = await this.monitorResources(duration, interval, resources);

            return {
                success: true,
                result: {
                    duration,
                    interval,
                    resources,
                    samples: monitoring.samples,
                    statistics: monitoring.statistics,
                    alerts: monitoring.alerts
                },
                metadata: { executionTime: Date.now() - startTime }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'SYSTEM_MONITOR_ERROR',
                    message: error instanceof Error ? error.message : 'Resource monitoring failed'
                },
                metadata: { executionTime: Date.now() - startTime }
            };
        }
    }

    private async monitorResources(
        duration: number,
        interval: number,
        resources: string[]
    ): Promise<{ samples: any[]; statistics: any; alerts: any[] }> {
        const samples: any[] = [];
        const alerts: any[] = [];

        const startTime = Date.now();

        while (Date.now() - startTime < duration) {
            const sample: any = {
                timestamp: new Date().toISOString(),
                time: Date.now() - startTime
            };

            for (const resource of resources) {
                const value = await this.sampleResource(resource);
                sample[resource] = value;

                // Check for alerts
                const alert = this.checkAlert(resource, value);
                if (alert) {
                    alerts.push(alert);
                }
            }

            samples.push(sample);

            if (Date.now() - startTime < duration - interval) {
                await new Promise(resolve => setTimeout(resolve, interval));
            }
        }

        const statistics = this.calculateStatistics(samples, resources);

        return { samples, statistics, alerts };
    }

    private async sampleResource(resource: string): Promise<number> {
        switch (resource) {
            case 'cpu':
                return this.sampleCPU();
            case 'memory':
                return this.sampleMemory();
            case 'network':
                return this.sampleNetwork();
            case 'disk':
                return this.sampleDisk();
            default:
                return 0;
        }
    }

    private sampleCPU(): number {
        // 模拟CPU使用率
        const baseLoad = 20 + Math.random() * 40; // 20-60% base load
        const spike = Math.random() < 0.1 ? Math.random() * 30 : 0; // 10% chance of spike
        return Math.min(100, Math.round(baseLoad + spike));
    }

    private sampleMemory(): number {
        if (typeof performance !== 'undefined' && 'memory' in performance) {
            const memInfo = (performance as any).memory;
            return Math.round((memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100);
        }

        // Simulated memory usage
        return Math.round(40 + Math.random() * 30); // 40-70%
    }

    private sampleNetwork(): number {
        // Simulated network usage in Mbps
        return Math.round(Math.random() * 100);
    }

    private sampleDisk(): number {
        // Simulated disk usage percentage
        return Math.round(50 + Math.random() * 30); // 50-80%
    }

    private checkAlert(resource: string, value: number): any | null {
        const thresholds = {
            cpu: 90,
            memory: 85,
            network: 95,
            disk: 90
        };

        const threshold = thresholds[resource as keyof typeof thresholds];
        if (threshold && value > threshold) {
            return {
                resource,
                value,
                threshold,
                severity: value > threshold * 1.1 ? 'critical' : 'warning',
                timestamp: new Date().toISOString(),
                message: `${resource.toUpperCase()} usage is ${value}%, exceeding threshold of ${threshold}%`
            };
        }

        return null;
    }

    private calculateStatistics(samples: any[], resources: string[]): any {
        const stats: any = {};

        for (const resource of resources) {
            const values = samples.map(s => s[resource]).filter(v => v !== undefined);

            if (values.length > 0) {
                const sum = values.reduce((a, b) => a + b, 0);
                const sortedValues = [...values].sort((a, b) => a - b);

                stats[resource] = {
                    average: Math.round(sum / values.length * 100) / 100,
                    min: Math.min(...values),
                    max: Math.max(...values),
                    median: sortedValues[Math.floor(sortedValues.length / 2)],
                    samples: values.length
                };
            }
        }

        return stats;
    }
}

// 系统进程管理工具
export class SystemProcessTool extends BaseTool {
    private static processes: Map<string, any> = new Map();

    constructor() {
        const definition: ToolDefinition = {
            name: 'system_process',
            description: 'Manage system processes and tasks',
            category: 'system',
            parameters: {
                action: {
                    name: 'action',
                    type: 'string',
                    description: 'Process action to perform',
                    required: true,
                    enum: ['list', 'create', 'kill', 'status', 'monitor']
                },
                processId: {
                    name: 'processId',
                    type: 'string',
                    description: 'Process ID (for kill/status/monitor actions)',
                    required: false
                },
                command: {
                    name: 'command',
                    type: 'string',
                    description: 'Command to execute (for create action)',
                    required: false
                },
                name: {
                    name: 'name',
                    type: 'string',
                    description: 'Process name (for create action)',
                    required: false
                }
            },
            security: {
                level: 'restricted',
                permissions: ['system:process'],
                sandbox: true,
                timeout: 10000
            },
            examples: [
                {
                    description: 'List all processes',
                    input: { action: 'list' },
                    output: {
                        processes: [
                            { pid: '1234', name: 'node', cpu: 5.2, memory: 45.1, status: 'running' }
                        ]
                    }
                }
            ]
        };
        super(definition);
    }

    async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
        const { action, processId, command, name } = parameters;
        const startTime = Date.now();

        try {
            let result: any;

            switch (action) {
                case 'list':
                    result = this.listProcesses();
                    break;
                case 'create':
                    result = this.createProcess(command!, name);
                    break;
                case 'kill':
                    result = this.killProcess(processId!);
                    break;
                case 'status':
                    result = this.getProcessStatus(processId!);
                    break;
                case 'monitor':
                    result = await this.monitorProcess(processId!);
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
                    code: 'SYSTEM_PROCESS_ERROR',
                    message: error instanceof Error ? error.message : 'Process operation failed'
                },
                metadata: { executionTime: Date.now() - startTime }
            };
        }
    }

    private listProcesses(): any {
        // 模拟系统进程列表
        const systemProcesses = [
            {
                pid: '1',
                name: 'init',
                cpu: 0.1,
                memory: 0.5,
                status: 'running',
                startTime: new Date(Date.now() - 86400000).toISOString(),
                user: 'root'
            },
            {
                pid: '1234',
                name: 'node',
                cpu: 15.2,
                memory: 125.4,
                status: 'running',
                startTime: new Date(Date.now() - 3600000).toISOString(),
                user: 'app'
            },
            {
                pid: '5678',
                name: 'nginx',
                cpu: 2.1,
                memory: 45.7,
                status: 'running',
                startTime: new Date(Date.now() - 7200000).toISOString(),
                user: 'www-data'
            }
        ];

        // 添加自定义进程
        const customProcesses = Array.from(SystemProcessTool.processes.values());

        const allProcesses = [...systemProcesses, ...customProcesses];

        return {
            processes: allProcesses,
            count: allProcesses.length,
            running: allProcesses.filter(p => p.status === 'running').length,
            totalCpu: allProcesses.reduce((sum, p) => sum + p.cpu, 0),
            totalMemory: allProcesses.reduce((sum, p) => sum + p.memory, 0)
        };
    }

    private createProcess(command: string, name?: string): any {
        const pid = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const processName = name || command.split(' ')[0];

        const process = {
            pid,
            name: processName,
            command,
            cpu: Math.random() * 10,
            memory: Math.random() * 50 + 10,
            status: 'running',
            startTime: new Date().toISOString(),
            user: 'demo'
        };

        SystemProcessTool.processes.set(pid, process);

        // 模拟进程可能会结束
        setTimeout(() => {
            const proc = SystemProcessTool.processes.get(pid);
            if (proc && Math.random() > 0.7) {
                proc.status = 'completed';
                proc.endTime = new Date().toISOString();
            }
        }, Math.random() * 30000 + 5000);

        return {
            created: true,
            process
        };
    }

    private killProcess(processId: string): any {
        const process = SystemProcessTool.processes.get(processId);

        if (!process) {
            // 检查是否是系统进程
            if (['1', '1234', '5678'].includes(processId)) {
                throw new Error(`Cannot kill system process: ${processId}`);
            }
            throw new Error(`Process not found: ${processId}`);
        }

        process.status = 'killed';
        process.endTime = new Date().toISOString();

        return {
            killed: true,
            processId,
            name: process.name,
            endTime: process.endTime
        };
    }

    private getProcessStatus(processId: string): any {
        const process = SystemProcessTool.processes.get(processId);

        if (!process) {
            throw new Error(`Process not found: ${processId}`);
        }

        const uptime = process.endTime ?
            new Date(process.endTime).getTime() - new Date(process.startTime).getTime() :
            Date.now() - new Date(process.startTime).getTime();

        return {
            ...process,
            uptime: Math.round(uptime / 1000), // seconds
            children: [], // 模拟子进程列表
            threads: Math.floor(Math.random() * 8) + 1,
            openFiles: Math.floor(Math.random() * 20) + 5
        };
    }

    private async monitorProcess(processId: string): Promise<any> {
        const process = SystemProcessTool.processes.get(processId);

        if (!process) {
            throw new Error(`Process not found: ${processId}`);
        }

        // 模拟监控数据收集
        const samples: any[] = [];
        const duration = 5000; // 5 seconds
        const interval = 1000; // 1 second

        for (let i = 0; i < duration / interval; i++) {
            await new Promise(resolve => setTimeout(resolve, interval));

            samples.push({
                timestamp: new Date().toISOString(),
                cpu: process.cpu + (Math.random() - 0.5) * 5,
                memory: process.memory + (Math.random() - 0.5) * 10,
                threads: Math.floor(Math.random() * 8) + 1,
                openFiles: Math.floor(Math.random() * 20) + 5
            });
        }

        return {
            processId,
            name: process.name,
            monitoringDuration: duration,
            samples,
            averages: {
                cpu: samples.reduce((sum, s) => sum + s.cpu, 0) / samples.length,
                memory: samples.reduce((sum, s) => sum + s.memory, 0) / samples.length
            }
        };
    }
}
