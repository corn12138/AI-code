import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponse } from '../types/client.types';

/**
 * 移动端异常过滤器
 * 统一处理所有异常，返回标准化的错误响应
 */
@Catch()
export class MobileExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(MobileExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status = this.getHttpStatus(exception);
        const errorResponse = this.buildErrorResponse(exception, request, status);

        // 记录错误日志
        this.logError(exception, request, status);

        response.status(status).json(errorResponse);
    }

    /**
     * 获取 HTTP 状态码
     */
    private getHttpStatus(exception: unknown): number {
        if (exception instanceof HttpException) {
            return exception.getStatus();
        }

        // 根据错误类型返回不同的状态码
        if (exception instanceof Error) {
            const message = exception.message.toLowerCase();

            if (message.includes('not found') || message.includes('不存在')) {
                return HttpStatus.NOT_FOUND;
            }

            if (message.includes('unauthorized') || message.includes('未授权')) {
                return HttpStatus.UNAUTHORIZED;
            }

            if (message.includes('forbidden') || message.includes('禁止')) {
                return HttpStatus.FORBIDDEN;
            }

            if (message.includes('conflict') || message.includes('冲突')) {
                return HttpStatus.CONFLICT;
            }

            if (message.includes('validation') || message.includes('验证')) {
                return HttpStatus.UNPROCESSABLE_ENTITY;
            }
        }

        return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    /**
     * 构建错误响应
     */
    private buildErrorResponse(
        exception: unknown,
        request: Request,
        status: number,
    ): ErrorResponse {
        const traceId = this.generateTraceId();
        const clientType = this.extractClientType(request);

        let code: string;
        let message: string;
        let retryable = false;

        if (exception instanceof HttpException) {
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
                code = this.getDefaultErrorCode(status);
            } else if (typeof exceptionResponse === 'object') {
                const responseObj = exceptionResponse as any;
                code = responseObj.code || this.getDefaultErrorCode(status);
                message = responseObj.message || exception.message;
            }

            // 某些状态码表示可以重试
            retryable = this.isRetryableStatus(status);
        } else if (exception instanceof Error) {
            code = this.getDefaultErrorCode(status);
            message = this.sanitizeErrorMessage(exception.message);
            retryable = this.isRetryableError(exception);
        } else {
            code = 'INTERNAL_ERROR';
            message = '服务器内部错误';
            retryable = false;
        }

        // 根据客户端类型调整错误信息
        message = this.adaptErrorMessageForClient(message, clientType);

        return {
            code: code || this.getDefaultErrorCode(status),
            message,
            httpStatus: status,
            traceId,
            retryable,
            timestamp: new Date().toISOString(),
            path: request.url,
        };
    }

    /**
     * 记录错误日志
     */
    private logError(exception: unknown, request: Request, status: number): void {
        const clientInfo = this.getClientInfo(request);

        if (status >= 500) {
            // 服务器错误，记录详细日志
            this.logger.error(
                `Server error for ${clientInfo.type} client: ${request.method} ${request.url}`,
                exception instanceof Error ? exception.stack : exception,
            );
        } else {
            // 客户端错误，记录警告
            this.logger.warn(
                `Client error for ${clientInfo.type} client: ${status} ${request.method} ${request.url}`,
            );
        }
    }

    /**
     * 提取客户端类型
     */
    private extractClientType(request: Request): string {
        const xClient = request.headers['x-client'] as string;
        const userAgent = request.headers['user-agent'] as string;

        if (xClient) {
            return xClient;
        }

        if (userAgent) {
            const ua = userAgent.toLowerCase();
            if (ua.includes('iphone') || ua.includes('ipad')) {
                return 'ios';
            }
            if (ua.includes('android')) {
                return 'android';
            }
        }

        return 'web';
    }

    /**
     * 获取客户端信息
     */
    private getClientInfo(request: Request): any {
        return {
            type: this.extractClientType(request),
            platform: request.headers['x-platform'],
            version: request.headers['x-app-version'],
            userAgent: request.headers['user-agent'],
            ip: request.ip,
        };
    }

    /**
     * 生成跟踪ID
     */
    private generateTraceId(): string {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }

    /**
     * 获取默认错误代码
     */
    private getDefaultErrorCode(status: number): string {
        const errorCodes: Record<number, string> = {
            400: 'BAD_REQUEST',
            401: 'UNAUTHORIZED',
            403: 'FORBIDDEN',
            404: 'NOT_FOUND',
            409: 'CONFLICT',
            422: 'VALIDATION_ERROR',
            429: 'TOO_MANY_REQUESTS',
            500: 'INTERNAL_ERROR',
            502: 'BAD_GATEWAY',
            503: 'SERVICE_UNAVAILABLE',
            504: 'GATEWAY_TIMEOUT',
        };

        return errorCodes[status] || 'UNKNOWN_ERROR';
    }

    /**
     * 判断状态码是否可以重试
     */
    private isRetryableStatus(status: number): boolean {
        return [408, 429, 500, 502, 503, 504].includes(status);
    }

    /**
     * 判断错误是否可以重试
     */
    private isRetryableError(exception: Error): boolean {
        const message = exception.message.toLowerCase();
        return (
            message.includes('timeout') ||
            message.includes('network') ||
            message.includes('connection') ||
            message.includes('temporary')
        );
    }

    /**
     * 清理错误信息
     */
    private sanitizeErrorMessage(message: string): string {
        // 移除敏感信息
        return message
            .replace(/password[=:]\s*\S+/gi, 'password=***')
            .replace(/token[=:]\s*\S+/gi, 'token=***')
            .replace(/key[=:]\s*\S+/gi, 'key=***');
    }

    /**
     * 根据客户端类型调整错误信息
     */
    private adaptErrorMessageForClient(message: string, clientType: string): string {
        // 可以根据不同客户端类型提供更友好的错误信息
        switch (clientType) {
            case 'ios':
                return this.adaptErrorMessageForIOS(message);
            case 'android':
                return this.adaptErrorMessageForAndroid(message);
            case 'web':
                return this.adaptErrorMessageForWeb(message);
            default:
                return message;
        }
    }

    /**
     * iOS 端错误信息适配
     */
    private adaptErrorMessageForIOS(message: string): string {
        // iOS 端可能需要更简洁的错误信息
        if (message.includes('网络')) {
            return '网络连接失败，请检查网络设置';
        }
        if (message.includes('超时')) {
            return '请求超时，请重试';
        }
        return message;
    }

    /**
     * Android 端错误信息适配
     */
    private adaptErrorMessageForAndroid(message: string): string {
        // Android 端可能需要更详细的错误信息
        if (message.includes('网络')) {
            return '网络连接失败，请检查网络设置或切换网络';
        }
        if (message.includes('超时')) {
            return '请求超时，请检查网络状况后重试';
        }
        return message;
    }

    /**
     * Web 端错误信息适配
     */
    private adaptErrorMessageForWeb(message: string): string {
        // Web 端可以提供更详细的错误信息
        return message;
    }
}
