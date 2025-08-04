import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../../metrics/metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
    constructor(private readonly metricsService: MetricsService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const startTime = Date.now();
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();

        const method = request.method;
        const route = this.getRoutePattern(request);

        return next.handle().pipe(
            tap({
                next: () => {
                    const duration = (Date.now() - startTime) / 1000;
                    const statusCode = response.statusCode;

                    this.metricsService.recordHttpRequest(
                        method,
                        route,
                        statusCode,
                        duration
                    );
                },
                error: (error) => {
                    const duration = (Date.now() - startTime) / 1000;
                    const statusCode = error.status || 500;

                    this.metricsService.recordHttpRequest(
                        method,
                        route,
                        statusCode,
                        duration
                    );
                }
            })
        );
    }

    private getRoutePattern(request: any): string {
        // 尝试获取路由模式，如果没有则使用路径
        if (request.route && request.route.path) {
            return request.route.path;
        }

        // 简化路径，移除查询参数和哈希
        const url = new URL(request.url, `http://${request.headers.host}`);
        let pathname = url.pathname;

        // 将动态路径段替换为参数模式
        pathname = pathname.replace(/\/\d+/g, '/:id');
        pathname = pathname.replace(/\/[a-f0-9-]{36}/g, '/:uuid');

        return pathname;
    }
} 