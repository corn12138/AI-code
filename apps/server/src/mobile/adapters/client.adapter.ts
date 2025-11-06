import { Injectable } from '@nestjs/common';
import { MobileDoc } from '../entities/mobile-doc.entity';
import { ClientCapabilities, ClientType } from '../types/client.types';

/**
 * 客户端适配器
 * 根据不同客户端类型裁剪数据，优化传输效率
 */
@Injectable()
export class ClientAdapter {

    /**
     * 获取客户端能力配置
     */
    getClientCapabilities(clientType: ClientType): ClientCapabilities {
        const capabilities: Record<ClientType, ClientCapabilities> = {
            [ClientType.WEB]: {
                supportsOfflineMode: true,
                supportsPushNotifications: false,
                supportsFileUpload: true,
                supportsRealTimeSync: true,
                maxFileSize: 100 * 1024 * 1024, // 100MB
                supportedImageFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
                supportedVideoFormats: ['mp4', 'webm', 'ogg'],
            },
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
        };

        return capabilities[clientType];
    }

    /**
     * 为 Web 端裁剪文档数据
     */
    adaptDocForWeb(doc: MobileDoc): any {
        return {
            id: doc.id,
            title: doc.title,
            summary: doc.summary,
            content: doc.content,
            category: doc.category,
            author: doc.author,
            readTime: doc.readTime,
            tags: doc.tags,
            imageUrl: doc.imageUrl,
            isHot: doc.isHot,
            published: doc.published,
            sortOrder: doc.sortOrder,
            docType: doc.docType,
            filePath: doc.filePath,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            // Web 端额外字段
            _links: {
                self: `/api/web/v1/docs/${doc.id}`,
                edit: `/api/web/v1/docs/${doc.id}/edit`,
                delete: `/api/web/v1/docs/${doc.id}`,
            },
            _meta: {
                wordCount: this.calculateWordCount(doc.content),
                readingProgress: 0,
                isBookmarked: false,
            },
        };
    }

    /**
     * 为 iOS 端裁剪文档数据
     */
    adaptDocForIOS(doc: MobileDoc): any {
        return {
            id: doc.id,
            title: doc.title,
            summary: doc.summary,
            content: doc.content,
            category: doc.category,
            author: doc.author,
            readTime: doc.readTime,
            tags: doc.tags,
            imageUrl: doc.imageUrl,
            isHot: doc.isHot,
            published: doc.published,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            // iOS 端特定字段
            _ios: {
                supportsOfflineReading: true,
                supportsShare: true,
                supportsBookmark: true,
                estimatedDataUsage: this.estimateDataUsage(doc),
            },
        };
    }

    /**
     * 为 Android 端裁剪文档数据
     */
    adaptDocForAndroid(doc: MobileDoc): any {
        return {
            id: doc.id,
            title: doc.title,
            summary: doc.summary,
            content: doc.content,
            category: doc.category,
            author: doc.author,
            readTime: doc.readTime,
            tags: doc.tags,
            imageUrl: doc.imageUrl,
            isHot: doc.isHot,
            published: doc.published,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            // Android 端特定字段
            _android: {
                supportsOfflineReading: true,
                supportsShare: true,
                supportsBookmark: true,
                estimatedDataUsage: this.estimateDataUsage(doc),
                supportsMaterialDesign: true,
            },
        };
    }

    /**
     * 根据客户端类型自动裁剪文档数据
     */
    adaptDocForClient(doc: MobileDoc, clientType: ClientType): any {
        switch (clientType) {
            case ClientType.WEB:
                return this.adaptDocForWeb(doc);
            case ClientType.IOS:
                return this.adaptDocForIOS(doc);
            case ClientType.ANDROID:
                return this.adaptDocForAndroid(doc);
            default:
                return this.adaptDocForWeb(doc);
        }
    }

    /**
     * 批量裁剪文档数据
     */
    adaptDocsForClient(docs: MobileDoc[], clientType: ClientType): any[] {
        return docs.map(doc => this.adaptDocForClient(doc, clientType));
    }

    /**
     * 计算字数
     */
    private calculateWordCount(content: string): number {
        return content.length;
    }

    /**
     * 估算数据使用量（字节）
     */
    private estimateDataUsage(doc: MobileDoc): number {
        let size = 0;
        size += doc.title.length * 2; // UTF-16
        size += (doc.summary?.length || 0) * 2;
        size += doc.content.length * 2;
        size += doc.author.length * 2;
        size += doc.tags.join(',').length * 2;
        size += (doc.imageUrl?.length || 0) * 2;
        return size;
    }

    /**
     * 为不同端生成不同的分页信息
     */
    adaptPaginationForClient(pagination: any, clientType: ClientType): any {
        const basePagination = {
            total: pagination.total,
            page: pagination.page,
            pageSize: pagination.pageSize,
            hasMore: pagination.hasMore,
        };

        switch (clientType) {
            case ClientType.WEB:
                return {
                    ...basePagination,
                    _web: {
                        showPageNumbers: true,
                        showPageSizeSelector: true,
                        defaultPageSize: 20,
                        maxPageSize: 100,
                    },
                };
            case ClientType.IOS:
            case ClientType.ANDROID:
                return {
                    ...basePagination,
                    cursor: pagination.cursor,
                    nextCursor: pagination.nextCursor,
                    _mobile: {
                        supportsInfiniteScroll: true,
                        prefetchDistance: 3,
                        cacheSize: 50,
                    },
                };
            default:
                return basePagination;
        }
    }
}
