import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as xss from 'xss';

@Injectable()
export class XssProtectionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 跳过文件上传等二进制内容
    if (req.is('multipart/form-data')) {
      return next();
    }

    if (req.body) {
      this.sanitizeObject(req.body);
    }

    if (req.query) {
      this.sanitizeObject(req.query);
    }

    if (req.params) {
      this.sanitizeObject(req.params);
    }

    next();
  }

  private sanitizeObject(obj: any): void {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        // 对字符串进行XSS过滤
        obj[key] = xss.filterXSS(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        // 递归处理嵌套对象
        this.sanitizeObject(obj[key]);
      }
    });
  }
}
