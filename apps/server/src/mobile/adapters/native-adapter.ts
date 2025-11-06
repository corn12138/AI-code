import { Injectable, Logger } from '@nestjs/common';
import { MobileService } from '../mobile.service';
import { ClientCapabilities, ClientType } from '../types/client.types';
import { ExternalServiceAdapter } from './external-service.adapter';

/**
 * 原生应用适配器
 * 为 Android 和 iOS 原生应用提供专门的接口和服务
 */
@Injectable()
export class NativeAdapter {
    private readonly logger = new Logger(NativeAdapter.name);

    constructor(
        private readonly mobileService: MobileService,
        private readonly externalServiceAdapter: ExternalServiceAdapter,
    ) { }

    /**
     * 获取原生应用配置
     */
    async getNativeAppConfig(clientType: ClientType): Promise<any> {
        this.logger.log(`获取原生应用配置: ${clientType}`);

        const capabilities = this.getClientCapabilities(clientType);

        return {
            client: {
                type: clientType,
                capabilities,
                version: '1.0.0',
                buildNumber: '1',
            },
            api: {
                baseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
                timeout: 30000,
                retryAttempts: 3,
                retryDelay: 1000,
            },
            features: {
                offlineMode: capabilities.supportsOfflineMode,
                pushNotifications: capabilities.supportsPushNotifications,
                fileUpload: capabilities.supportsFileUpload,
                realTimeSync: capabilities.supportsRealTimeSync,
            },
            limits: {
                maxFileSize: capabilities.maxFileSize,
                maxRequestsPerMinute: 60,
                cacheSize: 100,
                offlineDataRetention: 7, // days
            },
            endpoints: {
                docs: '/api/mobile/v1/docs',
                categories: '/api/mobile/v1/categories',
                upload: '/api/v1/upload/presign',
                health: '/api/public/v1/health',
            },
        };
    }

    /**
     * 获取原生应用专用的文档数据
     */
    async getNativeDocs(
        clientType: ClientType,
        query: any,
    ): Promise<any> {
        this.logger.log(`获取原生应用文档: ${clientType}`);

        // 根据客户端类型调整查询参数
        const adaptedQuery = this.adaptQueryForNative(clientType, query);

        // 尝试使用外部服务获取高并发数据
        try {
            const externalData = await this.externalServiceAdapter.getHighConcurrencyDocs(adaptedQuery);
            if (externalData) {
                return this.adaptExternalDataForNative(clientType, externalData);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.warn(`外部服务不可用，使用本地服务: ${errorMessage}`);
        }

        // 回退到本地服务
        const localData = await this.mobileService.findAll(adaptedQuery);
        return this.adaptLocalDataForNative(clientType, localData);
    }

    /**
     * 获取原生应用专用的推荐内容
     */
    async getNativeRecommendations(
        clientType: ClientType,
        userId: string,
        limit: number = 10,
    ): Promise<any> {
        this.logger.log(`获取原生应用推荐: ${clientType}`);

        try {
            // 尝试使用外部服务的推荐算法
            const recommendations = await this.externalServiceAdapter.getRecommendations(userId, limit);
            return this.adaptRecommendationsForNative(clientType, recommendations);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.warn(`外部推荐服务不可用，使用本地推荐: ${errorMessage}`);

            // 回退到本地推荐逻辑
            return this.getLocalRecommendations(clientType, limit);
        }
    }

    /**
     * 处理原生应用的文件上传
     */
    async handleNativeFileUpload(
        clientType: ClientType,
        fileInfo: any,
    ): Promise<any> {
        this.logger.log(`处理原生应用文件上传: ${clientType}`);

        const capabilities = this.getClientCapabilities(clientType);

        // 检查文件大小限制
        if (fileInfo.size > capabilities.maxFileSize) {
            throw new Error(`文件大小超过限制: ${capabilities.maxFileSize} bytes`);
        }

        // 检查文件格式支持
        const supportedFormats = [
            ...capabilities.supportedImageFormats,
            ...capabilities.supportedVideoFormats,
        ];

        const fileExtension = fileInfo.name.split('.').pop()?.toLowerCase();
        if (fileExtension && !supportedFormats.includes(fileExtension)) {
            throw new Error(`不支持的文件格式: ${fileExtension}`);
        }

        // 调用文件上传服务
        return await this.externalServiceAdapter.callPythonService('/api/v1/upload/presign', fileInfo);
    }

    /**
     * 获取客户端能力
     */
    private getClientCapabilities(clientType: ClientType): ClientCapabilities {
        const capabilities = {
            [ClientType.IOS]: {
                supportsOfflineMode: true,
                supportsPushNotifications: true,
                supportsFileUpload: true,
                supportsRealTimeSync: true,
                maxFileSize: 50 * 1024 * 1024, // 50MB
                supportedImageFormats: ['jpg', 'jpeg', 'png', 'heic'],
                supportedVideoFormats: ['mp4', 'mov'],
            },
            [ClientType.ANDROID]: {
                supportsOfflineMode: true,
                supportsPushNotifications: true,
                supportsFileUpload: true,
                supportsRealTimeSync: true,
                maxFileSize: 50 * 1024 * 1024, // 50MB
                supportedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
                supportedVideoFormats: ['mp4', '3gp', 'webm'],
            },
            [ClientType.WEB]: {
                supportsOfflineMode: false,
                supportsPushNotifications: false,
                supportsFileUpload: true,
                supportsRealTimeSync: false,
                maxFileSize: 100 * 1024 * 1024, // 100MB
                supportedImageFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
                supportedVideoFormats: ['mp4', 'webm', 'ogg'],
            },
        };

        return capabilities[clientType];
    }

    /**
     * 为原生应用适配查询参数
     */
    private adaptQueryForNative(clientType: ClientType, query: any): any {
        const adaptedQuery = { ...query };

        // 原生应用通常需要更小的页面大小
        if (clientType === ClientType.IOS || clientType === ClientType.ANDROID) {
            adaptedQuery.pageSize = Math.min(query.pageSize || 10, 20);
        }

        // 原生应用可能需要特定的排序方式
        if (!adaptedQuery.sortBy) {
            adaptedQuery.sortBy = 'createdAt';
            adaptedQuery.sortOrder = 'DESC';
        }

        return adaptedQuery;
    }

    /**
     * 适配外部服务数据为原生应用格式
     */
    private adaptExternalDataForNative(clientType: ClientType, data: any): any {
        return {
            ...data,
            _native: {
                clientType,
                optimized: true,
                source: 'external',
                timestamp: new Date().toISOString(),
            },
        };
    }

    /**
     * 适配本地数据为原生应用格式
     */
    private adaptLocalDataForNative(clientType: ClientType, data: any): any {
        return {
            ...data,
            _native: {
                clientType,
                optimized: false,
                source: 'local',
                timestamp: new Date().toISOString(),
            },
        };
    }

    /**
     * 适配推荐数据为原生应用格式
     */
    private adaptRecommendationsForNative(clientType: ClientType, recommendations: any): any {
        return {
            recommendations: recommendations.items || recommendations,
            _native: {
                clientType,
                algorithm: 'external',
                timestamp: new Date().toISOString(),
            },
        };
    }

    /**
     * 获取本地推荐内容
     */
    private async getLocalRecommendations(clientType: ClientType, limit: number): Promise<any> {
        // 简单的本地推荐逻辑：获取热门文档
        const hotDocs = await this.mobileService.findAll({
            isHot: true,
            published: true,
            page: 1,
            pageSize: limit,
        });

        return {
            recommendations: hotDocs.items,
            _native: {
                clientType,
                algorithm: 'local',
                timestamp: new Date().toISOString(),
            },
        };
    }

    /**
     * 获取原生应用健康检查
     */
    async getNativeHealthCheck(clientType: ClientType): Promise<any> {
        this.logger.log(`获取原生应用健康检查: ${clientType}`);

        const [localHealth, externalHealth] = await Promise.allSettled([
            this.getLocalHealth(),
            this.getExternalHealth(),
        ]);

        return {
            status: 'ok',
            client: clientType,
            services: {
                local: localHealth.status === 'fulfilled' ? localHealth.value : { status: 'error' },
                external: externalHealth.status === 'fulfilled' ? externalHealth.value : { status: 'unavailable' },
            },
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * 获取本地服务健康状态
     */
    private async getLocalHealth(): Promise<any> {
        return {
            status: 'ok',
            database: 'connected',
            cache: 'available',
        };
    }

    /**
     * 获取外部服务健康状态
     */
    private async getExternalHealth(): Promise<any> {
        const [pythonHealth, goHealth] = await Promise.allSettled([
            this.externalServiceAdapter.isPythonServiceAvailable(),
            this.externalServiceAdapter.isGoServiceAvailable(),
        ]);

        return {
            python: pythonHealth.status === 'fulfilled' ? pythonHealth.value : false,
            go: goHealth.status === 'fulfilled' ? goHealth.value : false,
        };
    }
}
