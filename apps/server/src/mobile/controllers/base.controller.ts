import { Controller, Logger, Req, UseInterceptors } from '@nestjs/common';
import { Request } from 'express';
import { ClientTrimInterceptor } from '../interceptors/client-trim.interceptor';
import { ClientType } from '../types/client.types';

/**
 * 基础控制器
 * 提供通用的功能和装饰器
 */
@Controller()
@UseInterceptors(ClientTrimInterceptor)
export abstract class BaseController {
    protected readonly logger: Logger;

    constructor(controllerName: string) {
        this.logger = new Logger(controllerName);
    }

    /**
     * 从请求中获取客户端类型
     */
    protected getClientType(@Req() request: Request): ClientType {
        return (request as any).clientType || ClientType.WEB;
    }

    /**
     * 从请求中获取客户端信息
     */
    protected getClientInfo(@Req() request: Request): any {
        return {
            type: this.getClientType(request),
            platform: request.headers['x-platform'],
            version: request.headers['x-app-version'],
            buildNumber: request.headers['x-build-number'],
            deviceId: request.headers['x-device-id'],
            osVersion: request.headers['x-os-version'],
            userAgent: request.headers['user-agent'],
        };
    }

    /**
     * 记录客户端请求日志
     */
    protected logClientRequest(@Req() request: Request, operation: string): void {
        const clientInfo = this.getClientInfo(request);
        this.logger.log(
            `${operation} request from ${clientInfo.type} client (${clientInfo.version}) to ${request.path}`,
        );
    }

    /**
     * 记录客户端错误日志
     */
    protected logClientError(@Req() request: Request, operation: string, error: any): void {
        const clientInfo = this.getClientInfo(request);
        this.logger.error(
            `${operation} error for ${clientInfo.type} client: ${error.message}`,
            error.stack,
        );
    }
}
