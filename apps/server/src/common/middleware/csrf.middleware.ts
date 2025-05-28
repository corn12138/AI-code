import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { CsrfService } from '../services/csrf.service';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  constructor(
    private csrfService: CsrfService,
    private configService: ConfigService
  ) {}

  use(req: Request & { user?: any }, res: Response, next: NextFunction) {
    // 检查是否启用了CSRF保护
    const csrfEnabled = this.configService.get<boolean>('security.csrfEnabled', false);
    if (!csrfEnabled) {
      return next();
    }

    // 跳过安全方法（GET, HEAD, OPTIONS）和公共路径
    const safeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(req.method);
    if (safeMethod) {
      return next();
    }

    // 跳过API文档路径
    if (req.path.startsWith('/api/docs')) {
      return next();
    }

    // 获取请求中的CSRF令牌 - 遵循Angular和其他前端框架的标准头部命名
    const rawCsrfToken = req.headers['x-xsrf-token'] || req.headers['x-csrf-token'];
    const csrfToken = Array.isArray(rawCsrfToken) ? rawCsrfToken[0] : rawCsrfToken as string;
    if (!csrfToken) {
      throw new UnauthorizedException('CSRF token missing');
    }

    // 获取用户的cookie中的CSRF令牌
    const cookieCsrfToken = req.cookies['XSRF-TOKEN'];
    if (!cookieCsrfToken) {
      throw new UnauthorizedException('CSRF cookie missing');
    }

    // 检查两个令牌是否匹配（双重提交验证）
    if (csrfToken !== cookieCsrfToken) {
      throw new UnauthorizedException('CSRF token mismatch');
    }

    // 验证令牌有效性
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }
    
    const isValid = this.csrfService.validateToken(csrfToken, req.user.id);
    if (!isValid) {
      throw new UnauthorizedException('Invalid CSRF token');
    }

    next();
  }
}
