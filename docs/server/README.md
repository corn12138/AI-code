# 服务器应用文档

服务器应用基于NestJS框架开发，为博客系统和低代码平台提供后端API支持。

## 主要功能

- 用户认证与授权
- 博客文章CRUD操作
- 低代码页面存储和发布
- 文件上传处理
- 安全防护

## 技术栈

- NestJS
- TypeScript
- PostgreSQL (通过TypeORM)
- Winston (日志)
- Swagger (API文档)

## 目录结构

```
apps/server/
├── src/
│   ├── app.module.ts          # 应用主模块
│   ├── main.ts                # 应用入口
│   ├── article/               # 文章模块
│   ├── auth/                  # 认证模块
│   ├── common/                # 通用功能
│   │   ├── filters/           # 全局过滤器
│   │   ├── middleware/        # 中间件
│   ├── config/                # 配置
│   ├── database/              # 数据库模块
│   ├── health/                # 健康检查
│   ├── lowcode/               # 低代码相关
│   └── user/                  # 用户模块
```

## API文档

API文档使用Swagger生成，启动服务后可通过以下地址访问：
```
http://localhost:3001/api/docs
```

## 安全特性

- **XSS防护**: 使用XssProtectionMiddleware对请求进行净化
- **安全HTTP头**: 使用Helmet配置安全相关HTTP头
- **CORS策略**: 限制跨域请求，启用凭证
- **请求限流**: 防止DoS攻击
- **输入验证**: 使用ValidationPipe验证所有输入

详细的安全实现请参考[安全文档](../security.md)。

## 中间件

### XSS防护中间件

XssProtectionMiddleware用于清理请求中的潜在XSS攻击载荷：

```typescript
@Injectable()
export class XssProtectionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 跳过文件上传等二进制内容
    if (req.is('multipart/form-data')) {
      return next();
    }

    // 净化请求体、查询参数和URL参数
    if (req.body) this.sanitizeObject(req.body);
    if (req.query) this.sanitizeObject(req.query);
    if (req.params) this.sanitizeObject(req.params);

    next();
  }

  // 递归清理对象中的所有字符串
  private sanitizeObject(obj: any): void {
    // ...实现细节
  }
}
```

## 配置与环境

服务器应用使用以下环境配置文件：
- `.env` - 开发环境配置
- `.env.prod` - 生产环境配置

主要配置项包括：
- 数据库连接信息
- JWT密钥
- 跨域允许的域名
- 限流参数
