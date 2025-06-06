# 服务器应用文档

服务器应用基于NestJS框架开发，为博客系统和低代码平台提供后端API支持。

## 主要功能

- **用户认证与授权**
  - 基于JWT的认证系统
  - 密码加密与验证
  - 刷新令牌机制
  - HTTP-Only Cookie安全实现
  - 登录、登出和令牌刷新API
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
│   ├── app.module.ts          # 应用主模块，整合所有其他模块
│   ├── main.ts                # 应用入口文件，负责启动NestJS应用和全局配置
│   ├── article/               # 文章模块，处理文章相关的CRUD操作、逻辑等
│   │   ├── entities/          # TypeORM实体定义
│   │   ├── dto/               # 数据传输对象，用于请求和响应的数据结构定义与验证
│   │   ├── article.controller.ts # 控制器，处理HTTP请求
│   │   ├── article.service.ts    # 服务，封装业务逻辑
│   │   └── article.module.ts     # 模块定义
│   ├── auth/                  # 认证模块，处理用户登录、注册、JWT生成与验证
│   │   ├── strategies/        # Passport策略 (e.g., JwtStrategy, LocalStrategy)
│   │   ├── guards/            # 路由守卫 (e.g., JwtAuthGuard)
│   │   └── dto/               # 认证相关的数据传输对象
│   ├── common/                # 通用功能、工具、装饰器等
│   │   ├── decorators/        # 自定义装饰器
│   │   ├── filters/           # 全局异常过滤器
│   │   ├── interceptors/      # 全局拦截器
│   │   └── middleware/        # 中间件 (e.g., XSS防护)
│   ├── config/                # 应用配置模块，管理环境变量和配置服务
│   │   └── configuration.ts   # 配置加载逻辑
│   ├── database/              # 数据库模块，处理数据库连接、迁移、种子数据等
│   │   ├── migrations/        # 数据库迁移脚本
│   │   └── seeds/             # 数据库填充种子数据
│   ├── health/                # 健康检查模块，提供健康检查端点
│   ├── lowcode/               # 低代码平台相关模块，处理页面存储、发布等
│   └── user/                  # 用户模块，处理用户信息的CRUD操作
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
