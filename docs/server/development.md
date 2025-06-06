# 服务器开发指南

本文档详细介绍服务器项目的开发流程、最佳实践和常见问题解决方案。

## 项目架构

Server项目基于NestJS框架开发，采用模块化架构，主要提供以下功能：

- 用户认证与授权
- 文章管理API
- 低代码平台数据服务
- 文件上传处理
- 数据库交互

## 环境设置

### 数据库连接

项目支持本地PostgreSQL或通过SSH隧道连接远程数据库：

```typescript
// 数据库连接配置示例
const dbConfig = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || 'blogdb',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.DATABASE_LOGGING === 'true',
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  
  // 连接池配置
  extra: {
    // 最大连接池大小
    max: 20,
    // 最小连接池大小
    min: 5,
    // 连接闲置多久后被释放(ms)
    idleTimeoutMillis: 30000,
  },
}
```

### SSH隧道配置

当通过SSH隧道连接远程数据库时，需要注意以下配置：

1. 确保本地端口与环境变量配置一致(如DATEBASE_PORT=6543)
2. 调整连接超时设置以适应SSH隧道可能的延迟
3. 考虑减小连接池大小，以适应隧道带宽限制

## 实体设计

### 实体属性初始化

TypeScript中的严格模式要求所有属性必须初始化。对于实体类，我们使用以下方案：

```typescript
// 正确的实体属性定义方式
@Entity('lowcode_pages')
export class LowcodePage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;  // 使用!操作符表示该属性会被初始化

  @Column()
  title!: string;
  
  @Column({ nullable: true })
  description!: string;
  
  // ...其他属性
}
```

### 实体关系

#### 用户与低代码页面的关系：

```typescript
// User实体
@Entity('users')
export class User {
  // ...其他属性
  
  @OneToMany(() => LowcodePage, page => page.owner)
  lowcodePages!: LowcodePage[];
}

// LowcodePage实体
@Entity('lowcode_pages')
export class LowcodePage {
  // ...其他属性
  
  @Column()
  ownerId!: string;
  
  @ManyToOne(() => User, user => user.lowcodePages)
  owner!: User;
}
```

### 数据类型选择

1. **文本类型**：对于可能包含大量内容的字段，使用`text`类型而非`varchar`
2. **JSON数据**：使用`jsonb`类型存储结构化数据
3. **时间戳**：尽量使用`@CreateDateColumn`和`@UpdateDateColumn`自动管理

```typescript
// 示例：正确的数据类型选择
@Column({ type: 'jsonb', default: '{}' })
content!: Record<string, any>;

@Column({ nullable: true, type: 'text' })
bio!: string | null;

@CreateDateColumn({ name: 'created_at' })
createdAt!: Date;
```

## 单元测试

Server项目使用Jest框架进行单元测试。测试文件位于各模块的`tests`文件夹或同级目录下。

### 测试配置

项目根目录包含Jest配置文件：

```javascript
// jest.config.js
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  collectCoverageFrom: [
    '**/*.service.(t|j)s',
    '**/*.controller.(t|j)s',
    '!**/node_modules/**',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1'
  }
};
```

### 编写测试用例

#### 服务层测试示例：

```typescript
// auth.service.spec.ts
describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByUsernameOrEmail: jest.fn(),
            findOne: jest.fn(),
            updateRefreshToken: jest.fn(),
          }
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          }
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          }
        },
      ],
    }).compile();
    
    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });
  
  it('should return null when user does not exist', async () => {
    (usersService.findByUsernameOrEmail as jest.Mock).mockResolvedValue(null);
    
    const result = await service.validateUser('nonexistent', 'password123');
    
    expect(result).toBeNull();
  });
  
  // 更多测试...
});
```

#### 控制器测试示例：

```typescript
// auth.controller.spec.ts
describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            logout: jest.fn(),
          }
        },
      ],
    }).compile();
    
    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });
  
  it('should return access token and user info', async () => {
    const loginDto = { usernameOrEmail: 'test', password: 'pass' };
    const mockResult = {
      accessToken: 'test-token',
      refreshToken: 'refresh-token',
      user: { id: 'user-id' }
    };
    
    (authService.login as jest.Mock).mockResolvedValue(mockResult);
    
    const mockResponse = {
      cookie: jest.fn(),
    };
    
    const result = await controller.login(loginDto, mockResponse as any);
    
    expect(result).not.toHaveProperty('refreshToken');
    expect(result).toHaveProperty('accessToken');
  });
  
  // 更多测试...
});
```

### 运行测试

可以通过以下命令运行测试：

```bash
# 运行所有测试
npm test

# 运行特定模块的测试
npm run test:auth

# 运行并监视更改
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

## 安全最佳实践

### 全局异常过滤器

项目实现了全局异常过滤器，统一处理所有错误：

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');
  
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let errorCode = 'INTERNAL_ERROR';
    
    // 不同类型异常的处理逻辑
    if (exception instanceof HttpException) {
      // HTTP异常处理
      status = exception.getStatus();
      // ...处理逻辑
    } 
    else if (exception instanceof QueryFailedError) {
      // 数据库错误处理
      status = HttpStatus.BAD_REQUEST;
      // ...处理逻辑
    }
    
    // 生产环境错误信息脱敏
    if (process.env.NODE_ENV === 'production' && status === HttpStatus.INTERNAL_SERVER_ERROR) {
      message = '服务器内部错误，请稍后再试';
    }
    
    // 标准错误响应
    response.status(status).json({
      success: false,
      code: errorCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

### 响应转换拦截器

统一处理所有API响应：

```typescript
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseFormat<T>> {
  private readonly logger = new Logger('ResponseTransform');
  
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseFormat<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const startTime = Date.now();
    
    return next.handle().pipe(
      map(data => {
        const responseTime = Date.now() - startTime;
        
        if (responseTime > 500) {
          this.logger.warn(`慢请求警告: ${request.method} ${request.path} - ${responseTime}ms`);
        }
        
        // 标准响应格式
        return {
          code: 0,
          message: '操作成功',
          data,
          timestamp: new Date().toISOString(),
          path: request.path,
        };
      }),
    );
  }
}
```

### XSS防护中间件

项目实现了XSS防护中间件，过滤用户输入：

```typescript
@Injectable()
export class XssProtectionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 跳过文件上传请求
    if (req.is('multipart/form-data')) {
      return next();
    }

    // 净化请求体、查询参数和URL参数
    if (req.body) this.sanitizeObject(req.body);
    if (req.query) this.sanitizeObject(req.query);
    if (req.params) this.sanitizeObject(req.params);

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

## 性能优化

### 缓存策略

使用`CacheModule`和`CacheInterceptor`缓存请求结果：

```typescript
// 缓存模块配置
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const useRedis = configService.get('USE_REDIS_CACHE') === 'true';
        
        if (useRedis) {
          return {
            store: redisStore,
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get('REDIS_PORT', 6379),
            ttl: 60, // 默认缓存60秒
          };
        }
        
        return {
          ttl: 60, // 默认缓存60秒
          max: 100, // 最大缓存项数
        };
      },
    }),
  ],
})
export class AppModule {}
```

### 数据库优化

数据库连接池优化：

```typescript
// 数据库连接池配置
extra: {
  // 最大连接数
  max: 20,
  // 最小连接数
  min: 5,
  // 连接超时
  connectionTimeoutMillis: 10000,
  // 闲置超时
  idleTimeoutMillis: 30000,
},
```

## 问题排查指南

### 数据库连接问题

如果遇到数据库连接问题，请按以下步骤排查：

1. 检查环境变量配置是否正确
2. 验证数据库服务是否运行正常
3. 如果使用SSH隧道，确保隧道正常工作
4. 运行数据库连接检查脚本：

```bash
npm run db:check
```

### 认证问题

JWT认证相关问题解决方案：

1. 确保JWT_SECRET环境变量已正确设置
2. 检查JWT策略注册和配置
3. 验证客户端请求中的令牌格式是否正确

```typescript
// 生成安全的JWT密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### TypeScript类型错误

处理常见的TypeScript错误：

1. 属性初始化错误：使用非空断言操作符`!`
2. 导入模块错误：检查路径和文件名大小写
3. 类型不兼容：使用类型守卫或类型断言

## 部署流程

### 环境变量配置

部署前需要设置以下关键环境变量：

```
NODE_ENV=production
PORT=3001
DATABASE_HOST=your-db-host
DATABASE_PORT=6543
DATABASE_USER=your-db-user
DATABASE_PASSWORD=your-db-password
DATABASE_NAME=your-db-name
DATABASE_SSL=true
JWT_SECRET=your-jwt-secret
```

### 构建与启动

```bash
# 构建项目
npm run build

# 启动生产服务
NODE_ENV=production node dist/main.js
```

### 使用PM2管理进程

```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start dist/main.js --name "blog-api" -i max

# 查看日志
pm2 logs blog-api

# 监控应用
pm2 monit
```

## 常见问题

### 1. 环境变量未加载

**症状**: 启动时报告找不到配置值或环境变量未定义  
**解决**: 确保.env文件位于正确位置，并使用以下代码加载：

```typescript
const envPath = process.env.NODE_ENV === 'production'
  ? path.resolve(process.cwd(), '.env.prod')
  : path.resolve(process.cwd(), '.env');

dotenv.config({ path: envPath });
```

### 2. 类型错误: Property 'X' has no initializer

**症状**: TypeScript编译错误，提示属性没有初始化  
**解决**: 使用非空断言操作符：

```typescript
@Entity()
export class Example {
  @PrimaryGeneratedColumn()
  id!: number; // 添加!操作符
}
```

### 3. bcrypt编译失败

**症状**: 依赖安装或构建时bcrypt报错  
**解决**: 

```bash
# 切换到纯JavaScript实现
npm run fix:bcrypt
```

### 4. JWT认证失败

**症状**: API返回401未授权错误  
**解决**: 检查JWT配置和令牌:

```typescript
// 确保策略使用正确的密钥
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET环境变量未设置');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }
}
```

