import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface HttpExceptionResponse {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = '服务器内部错误';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as string | HttpExceptionResponse;

      if (typeof exceptionResponse === 'object') {
        message = exceptionResponse.message || exception.message;
        error = exceptionResponse.error || error;
      } else {
        message = exceptionResponse || exception.message;
      }
    }

    // 记录错误信息
    this.logger.error(
      `${request.method} ${request.url} - ${status}: ${Array.isArray(message) ? message.join(', ') : message
      }`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    // 返回统一格式的错误响应
    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error,
      message
    });
  }
}
