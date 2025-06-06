import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger('ExceptionFilter');

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = '服务器内部错误';
        let errorCode = 'INTERNAL_ERROR'; // 修改变量名以避免类型冲突
        const timestamp = new Date().toISOString();

        // HTTP异常处理
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const errorResponse = exception.getResponse();
            message = typeof errorResponse === 'object' && 'message' in errorResponse
                ? Array.isArray(errorResponse.message)
                    ? errorResponse.message[0]
                    : errorResponse.message
                : exception.message;

            // 修复类型问题
            if (typeof errorResponse === 'object' && 'error' in errorResponse) {
                const error = errorResponse.error;
                errorCode = typeof error === 'string' ? error : exception.name;
            } else {
                errorCode = exception.name;
            }
        }
        // 数据库错误
        else if (exception instanceof QueryFailedError) {
            status = HttpStatus.BAD_REQUEST;
            message = '数据操作失败';
            errorCode = 'DATABASE_ERROR';

            // 处理唯一约束违反
            if (exception.message.includes('duplicate key')) {
                message = '记录已存在，请勿重复创建';
                errorCode = 'DUPLICATE_ERROR';
            }

            // 不要在生产环境泄露SQL详情
            const sqlDetails = process.env.NODE_ENV !== 'production'
                ? exception.message
                : '数据库错误';

            this.logger.error(`数据库错误: ${exception.message}`, exception.stack);
        }
        // 其他错误
        else {
            this.logger.error(
                `未处理异常: ${exception.message || '未知错误'}`,
                exception.stack
            );
        }

        // 安全考虑：生产环境下不返回详细技术错误
        if (process.env.NODE_ENV === 'production' && status === HttpStatus.INTERNAL_SERVER_ERROR) {
            message = '服务器内部错误，请稍后再试';
        }

        // 构建标准错误响应格式
        response.status(status).json({
            success: false,
            code: errorCode, // 使用更名后的变量
            message,
            timestamp,
            path: request.url,
            // 只在非生产环境下返回错误堆栈
            ...(process.env.NODE_ENV !== 'production' && exception.stack && {
                stack: exception.stack.split('\n'),
            }),
        });
    }
}
