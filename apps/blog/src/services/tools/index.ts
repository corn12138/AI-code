/**
 * 工具系统统一导出
 * 29种企业级工具的完整实现
 */

// 核心工具协议
export * from './ToolProtocol';

// 工具注册表
export * from './ToolRegistry';

// 浏览器工具 (4个)
export * from './browser/BrowserTools';

// 文件工具 (4个)  
export * from './file/FileTools';

// Shell工具 (3个)
export * from './shell/ShellTools';

// 代码工具 (4个)
export * from './code/CodeTools';

// 数据工具 (4个)
export * from './data/DataTools';

// API工具 (3个)
export * from './api/APITools';

// 机器学习工具 (3个)
export * from './ml/MLTools';

// 系统工具 (3个)
export * from './system/SystemTools';

// 工具管理服务
export class ToolManager {
    private static instance: ToolManager;

    private constructor() {
        // 私有构造函数，确保单例
    }

    public static getInstance(): ToolManager {
        if (!ToolManager.instance) {
            ToolManager.instance = new ToolManager();
        }
        return ToolManager.instance;
    }

    // 初始化工具系统
    public async initialize(): Promise<void> {
        const { initializeToolSystem } = await import('./ToolRegistry');
        initializeToolSystem();
    }

    // 获取所有工具定义（用于AI模型）
    public async getToolDefinitions(): Promise<any[]> {
        const { getToolDefinitionsForAI } = await import('./ToolRegistry');
        return getToolDefinitionsForAI();
    }

    // 执行工具
    public async executeTool(toolCall: {
        name: string;
        parameters: Record<string, any>;
        context: any;
    }): Promise<any> {
        const { globalToolRegistry } = await import('./ToolProtocol');

        const tool = globalToolRegistry.get(toolCall.name);
        if (!tool) {
            throw new Error(`Tool not found: ${toolCall.name}`);
        }

        return await tool.run(toolCall.parameters, toolCall.context);
    }

    // 搜索工具
    public async searchTools(query: string, filters?: any): Promise<any[]> {
        const { searchTools } = await import('./ToolRegistry');
        return searchTools(query, filters);
    }

    // 获取推荐工具
    public async getRecommendedTools(context: any): Promise<any[]> {
        const { getRecommendedTools } = await import('./ToolRegistry');
        return getRecommendedTools(context);
    }

    // 健康检查
    public async performHealthCheck(): Promise<any> {
        const { performToolHealthCheck } = await import('./ToolRegistry');
        return await performToolHealthCheck();
    }

    // 获取使用统计
    public async getUsageStatistics(): Promise<any> {
        const { getToolUsageStatistics } = await import('./ToolRegistry');
        return getToolUsageStatistics();
    }
}

// 默认导出工具管理器实例
export default ToolManager.getInstance();
