# 安全最佳实践文档

本文档详细介绍项目中实施的安全措施和最佳实践。

## XSS防护

### 服务端XSS防护

项目使用全局XSS防护中间件进行输入净化：

```typescript
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
```

### 前端XSS防护

#### 博客应用

使用DOMPurify净化渲染的HTML和Markdown内容：

```typescript
// 净化HTML
const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html);
};

// 转义文本
const escapeHtml = (text: string): string => {
  return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
};
```

#### 低代码平台

在渲染用户生成的HTML时进行严格过滤：

```tsx
useEffect(() => {
  if (!containerRef.current) return;
  
  // 清理HTML内容
  const sanitizedHtml = DOMPurify.sanitize(content, {
    // 严格限制允许的标签和属性
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br', 'span', 'div', 'img'],
    ALLOWED_ATTR: ['href', 'target', 'src', 'alt', 'class', 'id', 'style'],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
    FORCE_BODY: true,
    SANITIZE_DOM: true,
  });
  
  // 设置清理后的内容
  containerRef.current.innerHTML = sanitizedHtml;
  
  // 为所有链接添加安全属性
  if (containerRef.current) {
    const links = containerRef.current.querySelectorAll('a');
    links.forEach(link => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
  }
}, [content]);
```

## 内容安全策略 (CSP)

### 服务端CSP配置

通过Helmet中间件配置CSP：

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

### 前端CSP配置

在HTML中通过meta标签配置CSP（低代码平台示例）：

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  font-src 'self';
  connect-src 'self' http://localhost:3001;
">
```

## CORS配置

服务端CORS配置：

```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    // 生产环境下的域名
  ],
  credentials: true, // 允许携带cookies
  exposedHeaders: ['X-CSRF-Token'],
});
```

## 输入验证

使用NestJS的ValidationPipe进行请求验证：

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

## 请求限流

使用ThrottlerModule防止DoS攻击：

```typescript
ThrottlerModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    ttl: configService.get('throttle.ttl', 60),
    limit: configService.get('throttle.limit', 100),
  }),
})
```

## CSRF防护

在API请求中处理CSRF令牌：

```typescript
// axios拦截器处理CSRF令牌
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 特殊处理CSRF错误
    if (error.response?.status === 401 && error.response?.data?.message?.includes('CSRF')) {
      console.error('CSRF token validation failed.');
      toast.error('安全验证失败，请刷新页面或重新登录');
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);
```

## 安全处理外部链接

为外部链接添加安全属性：

```typescript
// 在Markdown渲染时处理链接
a({ node, ...props }) {
  // 验证href是否为安全URL
  const href = props.href || '';
  // 只允许http, https或相对路径
  const isSafe = !href.match(/^(javascript|data):/i);
  
  if (!isSafe) return <span>{props.children}</span>;
  
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
      {...props}
    >
      {props.children}
    </a>
  );
}
```

## 安全处理上传文件

图片上传时的安全处理：

```typescript
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.url;
};
```

## 安全日志记录

使用Winston进行安全日志记录，重点关注认证尝试、权限变更、关键操作等安全相关事件。

```typescript
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';
import 'winston-daily-rotate-file'; // 用于日志轮转

// 安全事件专用日志格式
const securityLogFormat = winston.format.printf(({ level, message, timestamp, context, userId, ipAddress }) => {
  return `${timestamp} [${level.toUpperCase()}] [${context || 'Security'}] UserID: ${userId || 'N/A'}, IP: ${ipAddress || 'N/A'} - ${message}`;
});

export const securityLogger = WinstonModule.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }), // 记录错误堆栈
    winston.format.splat(),
    securityLogFormat // 使用自定义安全日志格式
  ),
  transports: [
    // 控制台输出 (可选, 开发环境可能需要)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // 开发环境可添加颜色
        securityLogFormat
      ),
      level: 'info', // 开发环境可以更详细
    }),
    // 安全事件日志文件 (轮转)
    new winston.transports.DailyRotateFile({
      filename: 'logs/security-%DATE%.log', // 按日期轮转
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true, // 压缩旧日志
      maxSize: '20m',      // 单个文件最大20MB
      maxFiles: '14d',     // 保留14天日志
      level: 'warn',       // 记录警告及以上级别，或根据需要调整为info
      format: securityLogFormat, // 确保文件日志也使用此格式
    }),
    // 关键错误日志文件
    new winston.transports.File({
      filename: 'logs/security-critical-error.log',
      level: 'error', // 只记录错误及以上级别
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json() // 错误日志通常使用JSON格式便于机器解析
      ),
    }),
  ],
  // 可以为特定上下文（如AuthService）配置不同的日志级别
  // contextLevels: {
  //   AuthService: 'debug',
  // },
});

// 使用示例 (在服务中注入Logger)
// import { Logger } from '@nestjs/common';
// private readonly logger = new Logger(SecurityService.name);
// this.logger.warn(`Failed login attempt for user: ${username}`, { userId: 'N/A', ipAddress: req.ip });
// this.logger.error(`Critical security event: ${error.message}`, { stack: error.stack });
```

确保对敏感信息（如密码、令牌）在记录前进行脱敏处理。

## 认证安全实践

### 双令牌认证系统

项目使用双令牌系统（Access Token + Refresh Token）增强安全性：

```typescript
// 令牌生成与安全存储
async getTokens(userId: string, username: string, roles: string[]) {
  const [accessToken, refreshToken] = await Promise.all([
    this.jwtService.signAsync(
      {
        sub: userId,
        username,
        roles,
      },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m', // 短期访问令牌
      },
    ),
    this.jwtService.signAsync(
      {
        sub: userId,
        username,
        roles,
      },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d', // 长期刷新令牌
      },
    ),
  ]);

  return {
    accessToken,
    refreshToken,
  };
}
```

### 刷新令牌安全存储

刷新令牌通过HTTP-Only Cookie安全存储，减少XSS攻击风险：

```typescript
// Cookie安全配置
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,        // 阻止JavaScript访问
  secure: process.env.NODE_ENV === 'production', // 仅HTTPS传输
  sameSite: 'strict',    // 防止CSRF攻击
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7天过期
  path: '/',
});
```

### 密码安全

用户密码使用BCrypt算法进行单向加密：

```typescript
// 密码验证
async validateUser(usernameOrEmail: string, pass: string): Promise<any> {
  const user = await this.usersService.findByUsernameOrEmail(usernameOrEmail);
  if (!user) {
    return null;
  }

  // 安全比较密码哈希
  const isPasswordValid = await bcrypt.compare(pass, user.password);
  if (isPasswordValid) {
    const { password, refreshToken, ...result } = user;
    return result;
  }
  return null;
}
```

### 客户端令牌处理

客户端API请求拦截器负责安全地处理令牌：

```typescript
// API拦截器处理认证令牌
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器处理令牌刷新
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url.includes('/auth/refresh')) {
      originalRequest._retry = true;

      try {
        // 尝试刷新令牌
        const { data } = await api.post('/auth/refresh');
        localStorage.setItem('accessToken', data.accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // 刷新失败，清除认证状态
        localStorage.removeItem('accessToken');
        // 重定向到登录页
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
```
