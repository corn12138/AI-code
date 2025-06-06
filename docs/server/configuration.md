# 服务器配置详解

本文档详细介绍服务器项目的核心配置、中间件和特性，作为开发指南的补充。

## 应用启动配置

服务器应用使用`main.ts`作为入口点，包含多项关键配置：

### 日志系统详解

服务器使用Winston进行先进的日志管理：

```typescript
// Winston配置
const logger = WinstonModule.createLogger({
  transports: [
    // 控制台日志 - 彩色格式化输出
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        winston.format.colorize(),
        winston.format.printf((info) => {
          return `${info.timestamp} ${info.level}: ${info.message}`;
        }),
      ),
    }),
    // 错误日志文件
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    // 综合日志文件
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});
```

日志系统特点：
- 多目标输出(控制台和文件)
- 彩色命令行输出提高可读性
- 单独的错误日志文件便于故障排查
- 自动时间戳和格式化

### API文档集成

项目集成了Swagger自动生成API文档：

```typescript
// Swagger配置
const config = new DocumentBuilder()
  .setTitle('博客与低代码API')
  .setDescription('博客与低代码平台的后端API文档')
  .setVersion('1.0')
  .addTag('auth', '认证相关')
  .addTag('users', '用户相关')
  .addTag('articles', '文章相关')
  .addTag('lowcode', '低代码平台相关')
  .addBearerAuth() // 添加Bearer认证支持
  .build();
```

访问路径: `http://[host]:[port]/api/docs`

### 安全配置详解

#### Helmet中间件

项目使用Helmet配置各种安全相关的HTTP头：

```typescript
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        scriptSrc: [`'self'`, `'unsafe-inline'`, 'https://cdn.jsdelivr.net'],
        styleSrc: [`'self'`, `'unsafe-inline'`, 'https://cdn.jsdelivr.net'],
        imgSrc: [`'self'`, 'data:', 'https://cdn.jsdelivr.net'],
        connectSrc: [`'self'`, process.env.NODE_ENV === 'production'
          ? 'https://api.yourdomain.com'
          : 'http://localhost:3001'],
        fontSrc: [`'self'`, 'https://cdn.jsdelivr.net'],
        objectSrc: [`'none'`],
        mediaSrc: [`'self'`],
        frameSrc: [`'none'`],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    xssFilter: true,
  })
);
```

这些配置提供了:
- 内容安全策略(CSP)
- XSS防护
- 点击劫持保护
- MIME类型安全设置

#### CORS配置

项目使用精细的CORS配置，支持前端客户端访问：

```typescript
app.enableCors({
  origin: [
    'http://localhost:3000', // 博客前端
    'http://localhost:3002', // 低代码平台前端
    // 在此添加生产环境域名
  ],
  credentials: true, // 允许携带cookies
  exposedHeaders: ['X-CSRF-Token'], // 暴露CSRF令牌
});
```

这确保了:
- 只有允许的前端域名可以访问API
- 支持跨域认证(通过credentials)
- CSRF令牌可被前端应用读取

## 全局管道与过滤器

### 验证管道

使用ValidationPipe进行全局输入验证：

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,        // 过滤掉DTO中未定义的属性
    forbidNonWhitelisted: true, // 如有多余属性则抛出错误
    transform: true,        // 自动将请求数据转换为DTO类
  }),
);
```

这确保了:
- 所有请求参数都会根据DTO中的验证规则进行验证
- 自动剔除请求中的额外字段，防止恶意数据注入
- 自动类型转换，减少手动转换的需求

### 全局异常过滤器

项目使用自定义异常过滤器，统一处理错误响应：

```typescript
app.useGlobalFilters(new HttpExceptionFilter());
```

`HttpExceptionFilter`实现标准化的错误响应格式，确保所有API异常返回一致的结构。

## 环境变量与启动检查

服务器在启动时进行环境变量检查，确保关键配置已设置：

```typescript
// 环境变量检查
if (!process.env.JWT_SECRET) {
  logger.error('缺少环境变量: JWT_SECRET');
  process.exit(1);
}
```

### 核心环境变量

项目依赖以下关键环境变量：

| 变量名 | 描述 | 是否必需 | 默认值 |
|--------|------|---------|--------|
| `PORT` | 服务器端口 | 否 | 3001 |
| `NODE_ENV` | 运行环境 | 否 | development |
| `JWT_SECRET` | JWT签名密钥 | 是 | 无 |
| `DATABASE_HOST` | 数据库主机 | 是 | 无 |
| `DATABASE_PORT` | 数据库端口 | 否 | 5432 |
| `DATABASE_USER` | 数据库用户 | 是 | 无 |
| `DATABASE_PASSWORD` | 数据库密码 | 是 | 无 |
| `DATABASE_NAME` | 数据库名称 | 是 | 无 |

## 中间件配置

### Cookie处理

服务器使用cookie-parser中间件处理HTTP cookie：

```typescript
app.use(cookieParser());
```

这对于基于cookie的认证（如刷新令牌）至关重要。

### 全局前缀

所有API路由都使用`/api`前缀：

```typescript
app.setGlobalPrefix('api');
```

这使得API访问路径为 `http://[host]:[port]/api/[resource]`。

## 最佳实践建议

### 环境变量管理

1. 使用`.env.example`作为环境变量模板，但不要提交实际的`.env`文件
2. 生产环境使用安全的环境变量管理工具，如AWS Secrets Manager或环境变量注入

### 日志管理

1. 在生产环境考虑集成集中式日志管理系统(如ELK Stack)
2. 实施日志轮换策略，防止日志文件过大
3. 确保敏感数据不会被记录到日志中(如密码、令牌)

### CORS配置管理

1. 生产环境中严格限制允许的域名
2. 定期审查CORS策略，确保只有必要的域名被允许
3. 考虑使用环境变量配置允许的域名列表

### API文档安全

在生产环境中，可考虑以下措施保护Swagger文档:

```typescript
// 生产环境中可以限制API文档访问
if (process.env.NODE_ENV !== 'production') {
  SwaggerModule.setup('api/docs', app, document);
} else {
  // 生产环境可以通过身份验证后才能访问文档
  app.use('/api/docs', (req, res, next) => {
    // 基本认证实现
    const auth = req.headers.authorization;
    if (!auth) {
      res.set('WWW-Authenticate', 'Basic realm="API Documentation"');
      return res.status(401).send('认证失败');
    }
    // 验证逻辑
    next();
  });
  SwaggerModule.setup('api/docs', app, document);
}
```

## 可扩展性考虑

### 添加新的全局前缀

如需为特定模块添加额外前缀，可以使用以下方法：

```typescript
app.use('/api/v2', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: { '^/api/v2': '/api' },
}));
```

### 集成其他中间件

可以添加额外的中间件来扩展服务器功能：

```typescript
// 请求日志中间件
app.use(morgan('combined'));

// 压缩中间件
app.use(compression());

// 自定义中间件
app.use((req, res, next) => {
  req.customData = { /* 一些数据 */ };
  next();
});
```
