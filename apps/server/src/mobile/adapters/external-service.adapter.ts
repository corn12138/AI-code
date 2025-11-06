import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * 外部服务适配器
 * 为将来可能使用 Python 或 Go 服务预留接口
 */
@Injectable()
export class ExternalServiceAdapter {
    private readonly logger = new Logger(ExternalServiceAdapter.name);
    private readonly pythonServiceUrl: string;
    private readonly goServiceUrl: string;

    constructor(private readonly configService: ConfigService) {
        this.pythonServiceUrl = this.configService.get<string>('PYTHON_SERVICE_URL', '');
        this.goServiceUrl = this.configService.get<string>('GO_SERVICE_URL', '');
    }

    /**
     * 检查 Python 服务是否可用
     */
    async isPythonServiceAvailable(): Promise<boolean> {
        if (!this.pythonServiceUrl) {
            return false;
        }

        try {
            const response = await fetch(`${this.pythonServiceUrl}/health`, {
                method: 'GET',
                timeout: 5000,
            });
            return response.ok;
        } catch (error) {
            this.logger.warn(`Python service not available: ${error.message}`);
            return false;
        }
    }

    /**
     * 检查 Go 服务是否可用
     */
    async isGoServiceAvailable(): Promise<boolean> {
        if (!this.goServiceUrl) {
            return false;
        }

        try {
            const response = await fetch(`${this.goServiceUrl}/health`, {
                method: 'GET',
                timeout: 5000,
            });
            return response.ok;
        } catch (error) {
            this.logger.warn(`Go service not available: ${error.message}`);
            return false;
        }
    }

    /**
     * 调用 Python 服务获取高并发数据
     */
    async callPythonService<T>(
        endpoint: string,
        data?: any,
        options?: RequestInit,
    ): Promise<T> {
        if (!this.pythonServiceUrl) {
            throw new Error('Python service URL not configured');
        }

        const url = `${this.pythonServiceUrl}${endpoint}`;
        const requestOptions: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Service-Type': 'python',
                ...options?.headers,
            },
            body: data ? JSON.stringify(data) : undefined,
            ...options,
        };

        try {
            this.logger.debug(`Calling Python service: ${url}`);
            const response = await fetch(url, requestOptions);

            if (!response.ok) {
                throw new Error(`Python service error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            this.logger.error(`Python service call failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * 调用 Go 服务获取高并发数据
     */
    async callGoService<T>(
        endpoint: string,
        data?: any,
        options?: RequestInit,
    ): Promise<T> {
        if (!this.goServiceUrl) {
            throw new Error('Go service URL not configured');
        }

        const url = `${this.goServiceUrl}${endpoint}`;
        const requestOptions: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Service-Type': 'go',
                ...options?.headers,
            },
            body: data ? JSON.stringify(data) : undefined,
            ...options,
        };

        try {
            this.logger.debug(`Calling Go service: ${url}`);
            const response = await fetch(url, requestOptions);

            if (!response.ok) {
                throw new Error(`Go service error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            this.logger.error(`Go service call failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * 智能路由：根据负载和性能选择服务
     */
    async smartRoute<T>(
        endpoint: string,
        data?: any,
        options?: RequestInit,
    ): Promise<T> {
        // 检查服务可用性
        const pythonAvailable = await this.isPythonServiceAvailable();
        const goAvailable = await this.isGoServiceAvailable();

        // 优先使用 Go 服务（通常性能更好）
        if (goAvailable) {
            try {
                return await this.callGoService<T>(endpoint, data, options);
            } catch (error) {
                this.logger.warn(`Go service failed, falling back to Python: ${error.message}`);
            }
        }

        // 回退到 Python 服务
        if (pythonAvailable) {
            try {
                return await this.callPythonService<T>(endpoint, data, options);
            } catch (error) {
                this.logger.warn(`Python service failed: ${error.message}`);
            }
        }

        // 如果外部服务都不可用，返回默认响应
        throw new Error('All external services unavailable');
    }

    /**
     * 获取高并发文档列表（从外部服务）
     */
    async getHighConcurrencyDocs(query: any): Promise<any> {
        return this.smartRoute('/api/v1/docs/high-concurrency', query);
    }

    /**
     * 获取实时统计数据（从外部服务）
     */
    async getRealTimeStats(): Promise<any> {
        return this.smartRoute('/api/v1/stats/real-time');
    }

    /**
     * 批量处理文档（从外部服务）
     */
    async batchProcessDocs(docs: any[]): Promise<any> {
        return this.smartRoute('/api/v1/docs/batch-process', { docs });
    }

    /**
     * 获取推荐内容（从外部服务）
     */
    async getRecommendations(userId: string, limit: number = 10): Promise<any> {
        return this.smartRoute('/api/v1/recommendations', { userId, limit });
    }

    /**
     * 搜索优化（从外部服务）
     */
    async optimizedSearch(query: string, filters: any): Promise<any> {
        return this.smartRoute('/api/v1/search/optimized', { query, filters });
    }
}

/**
 * 服务路由配置
 */
export interface ServiceRouteConfig {
    pythonServiceUrl?: string;
    goServiceUrl?: string;
    fallbackToNodeJS?: boolean;
    timeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
}

/**
 * 外部服务健康检查
 */
export interface ServiceHealth {
    service: 'python' | 'go' | 'nodejs';
    available: boolean;
    responseTime: number;
    lastChecked: Date;
    error?: string;
}
