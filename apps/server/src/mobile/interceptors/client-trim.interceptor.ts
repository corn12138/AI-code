import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClientAdapter } from '../adapters/client.adapter';
import { ClientType } from '../types/client.types';

/**
 * 客户端数据裁剪拦截器
 * 根据客户端类型自动裁剪响应数据
 */
@Injectable()
export class ClientTrimInterceptor implements NestInterceptor {
    private readonly logger = new Logger(ClientTrimInterceptor.name);

    constructor(private readonly clientAdapter: ClientAdapter) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<Request>();
        const clientType = this.extractClientType(request);

        // 将客户端类型附加到请求对象上，供后续使用
        (request as any).clientType = clientType;

        this.logger.debug(`Request from client: ${clientType} to ${request.path}`);

        return next.handle().pipe(
            map((data) => {
                // 根据客户端类型裁剪响应数据
                return this.adaptResponseData(data, clientType);
            }),
        );
    }

    /**
     * 从请求头中提取客户端类型
     */
    private extractClientType(request: Request): ClientType {
        const xClient = request.headers['x-client'] as string;
        const userAgent = request.headers['user-agent'] as string;

        // 优先使用 X-Client 头
        if (xClient) {
            switch (xClient.toLowerCase()) {
                case 'web':
                    return ClientType.WEB;
                case 'ios':
                    return ClientType.IOS;
                case 'android':
                    return ClientType.ANDROID;
            }
        }

        // 回退到 User-Agent 分析
        if (userAgent) {
            const ua = userAgent.toLowerCase();
            if (ua.includes('iphone') || ua.includes('ipad')) {
                return ClientType.IOS;
            }
            if (ua.includes('android')) {
                return ClientType.ANDROID;
            }
        }

        // 默认返回 Web
        return ClientType.WEB;
    }

    /**
     * 根据客户端类型适配响应数据
     */
    private adaptResponseData(data: any, clientType: ClientType): any {
        if (!data) {
            return data;
        }

        // 处理分页响应
        if (data.items && Array.isArray(data.items)) {
            return this.adaptPaginatedResponse(data, clientType);
        }

        // 处理单个文档响应
        if (data.id && data.title) {
            return this.adaptSingleDocResponse(data, clientType);
        }

        // 处理文档列表响应
        if (Array.isArray(data) && data.length > 0 && data[0].id) {
            return this.adaptDocListResponse(data, clientType);
        }

        // 其他类型的响应数据
        return this.adaptGenericResponse(data, clientType);
    }

    /**
     * 适配分页响应
     */
    private adaptPaginatedResponse(data: any, clientType: ClientType): any {
        const adaptedItems = this.clientAdapter.adaptDocsForClient(data.items, clientType);
        const adaptedPagination = this.clientAdapter.adaptPaginationForClient(data, clientType);

        return {
            ...adaptedPagination,
            items: adaptedItems,
        };
    }

    /**
     * 适配单个文档响应
     */
    private adaptSingleDocResponse(data: any, clientType: ClientType): any {
        return this.clientAdapter.adaptDocForClient(data, clientType);
    }

    /**
     * 适配文档列表响应
     */
    private adaptDocListResponse(data: any[], clientType: ClientType): any[] {
        return this.clientAdapter.adaptDocsForClient(data, clientType);
    }

    /**
     * 适配通用响应
     */
    private adaptGenericResponse(data: any, clientType: ClientType): any {
        // 根据客户端类型添加元数据
        const clientCapabilities = this.clientAdapter.getClientCapabilities(clientType);

        return {
            ...data,
            _client: {
                type: clientType,
                capabilities: clientCapabilities,
                timestamp: new Date().toISOString(),
            },
        };
    }
}
