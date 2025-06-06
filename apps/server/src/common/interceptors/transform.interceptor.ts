import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// 修复接口定义，确保requestId类型正确
export interface ResponseFormat<T> {
    code: number;
    message: string;
    data: T;
    timestamp: string;
    path?: string;
    requestId?: string;
}

// 扩展Express的Request接口以支持requestId
declare module 'express' {
    interface Request {
        requestId?: string;
    }
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseFormat<T>> {
    private readonly logger = new Logger('ResponseTransform');

    intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseFormat<T>> {
        const request = context.switchToHttp().getRequest<Request>();
        const startTime = Date.now();
        const requestIdHeader = request.headers['x-request-id'];
        const requestId = typeof requestIdHeader === 'string' ? requestIdHeader : this.generateRequestId();

        // 安全地设置requestId属性
        request.requestId = requestId;

        return next.handle().pipe(
            map(data => {
                const responseTime = Date.now() - startTime;

                if (responseTime > 500) {
                    this.logger.warn(`慢请求警告: ${request.method} ${request.path} - ${responseTime}ms`);
                }

                // 记录响应日志
                this.logger.log(
                    `${request.method} ${request.path} ${context.switchToHttp().getResponse<Response>().statusCode} - ${responseTime}ms`,
                );

                // 构建标准响应格式
                return {
                    code: 0,
                    message: '操作成功',
                    data,
                    timestamp: new Date().toISOString(),
                    path: request.path,
                    requestId,
                };
            }),
        );
    }

    private generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
}
