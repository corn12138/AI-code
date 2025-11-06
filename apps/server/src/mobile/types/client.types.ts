/**
 * 客户端类型定义
 * 用于区分不同端的请求和响应
 */

export enum ClientType {
    WEB = 'web',
    IOS = 'ios',
    ANDROID = 'android',
}

export enum ClientPlatform {
    WEB = 'web',
    IOS = 'ios',
    ANDROID = 'android',
}

export interface ClientInfo {
    type: ClientType;
    platform: ClientPlatform;
    version: string;
    buildNumber?: string;
    userAgent?: string;
}

export interface ClientHeaders {
    'X-Client': ClientType;
    'X-App-Version': string;
    'X-Build-Number'?: string;
    'X-Platform': ClientPlatform;
    'X-Device-Id'?: string;
    'X-OS-Version'?: string;
}

/**
 * API 版本类型
 */
export enum ApiVersion {
    V1 = 'v1',
    V2 = 'v2',
}

/**
 * 统一的错误响应格式
 */
export interface ErrorResponse {
    code: string;
    message: string;
    httpStatus: number;
    traceId: string;
    retryable: boolean;
    timestamp: string;
    path: string;
}

/**
 * 统一的成功响应格式
 */
export interface SuccessResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
    traceId: string;
    timestamp: string;
}

/**
 * 分页响应格式
 */
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
    cursor?: string;
    nextCursor?: string;
}

/**
 * 客户端能力标识
 */
export interface ClientCapabilities {
    supportsOfflineMode: boolean;
    supportsPushNotifications: boolean;
    supportsFileUpload: boolean;
    supportsRealTimeSync: boolean;
    maxFileSize: number;
    supportedImageFormats: string[];
    supportedVideoFormats: string[];
}
