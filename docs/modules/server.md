# 服务端模块

## 功能概述

服务端使用NestJS开发，提供博客和低代码平台所需的API服务。

### 主要功能

- **用户管理**: 注册、登录、权限控制
- **文章管理**: 创建、查询、更新、删除
- **低代码平台**: 页面保存、发布
- **数据存储**: 使用PostgreSQL存储业务数据
- **安全保障**: XSS防护、CSRF防护、权限控制

## 模块设计

- **AuthModule**: 负责认证和授权
- **UserModule**: 用户管理
- **ArticleModule**: 文章管理
- **CommentModule**: 评论管理
- **LowCodeModule**: 低代码平台
- **CommonModule**: 通用功能

## 数据模型

主要实体关系：

```
USER {
  UUID id PK
  VARCHAR username UNIQUE
  VARCHAR password_hash
  VARCHAR role
  TIMESTAMP created_at
}

ARTICLE {
  UUID id PK
  VARCHAR title
  TEXT content
  UUID author_id FK
  BOOLEAN is_published
  TIMESTAMP created_at
  TIMESTAMP updated_at
}

LOWCODE_PAGE {
  UUID id PK
  VARCHAR name
  JSONB data
  UUID owner_id FK
  TIMESTAMP created_at
  TIMESTAMP updated_at
}
```

## API端点

### 认证

- `POST /auth/login` - 用户登录
- `POST /auth/register` - 用户注册
- `POST /auth/refresh` - 刷新令牌

### 用户

- `GET /users/me` - 获取当前用户信息
- `PUT /users/me` - 更新用户信息
- `GET /users/:id` - 获取指定用户信息

### 文章

- `GET /articles` - 获取文章列表
- `GET /articles/:id` - 获取单篇文章
- `POST /articles` - 创建文章
- `PUT /articles/:id` - 更新文章
- `DELETE /articles/:id` - 删除文章

### 低代码平台

- `GET /lowcode/pages` - 获取页面列表
- `GET /lowcode/pages/:id` - 获取页面配置
- `POST /lowcode/pages` - 创建页面
- `PUT /lowcode/pages/:id` - 更新页面
- `DELETE /lowcode/pages/:id` - 删除页面

## 安全措施

- 使用BCrypt加密密码
- JWT认证与授权
- CSRF保护
- XSS过滤
- 请求速率限制
- 敏感数据脱敏

## 环境配置

### 环境要求

- Node.js 16+
- PostgreSQL 13+
- Redis 6+ (可选，用于缓存和会话存储)

### 环境变量

服务端需要以下环境变量，可通过`.env`文件配置：

```
# 应用设置
PORT=3001
NODE_ENV=development

# 数据库配置
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=bloguser
DATABASE_PASSWORD=blogpassword
DATABASE_NAME=blogdb
DATABASE_LOGGING=true
DATABASE_SSL=false

# JWT配置
JWT_SECRET=your-secret-key-here
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# 安全配置
BCRYPT_SALT_ROUNDS=12
CSRF_ENABLED=false
```

## 启动流程

### 开发环境启动

1. **准备数据库**：
   ```bash
   # 创建PostgreSQL数据库
   createdb blogdb
   # 或使用Docker
   docker run -d --name postgres -e POSTGRES_PASSWORD=blogpassword -e POSTGRES_USER=bloguser -e POSTGRES_DB=blogdb -p 5432:5432 postgres:13
   ```

2. **安装依赖**：
   ```bash
   cd /Users/huangyuming/Desktop/createProjects/AI-code
   pnpm install
   ```

3. **环境配置**：
   ```bash
   cp apps/server/.env.example apps/server/.env
   # 编辑.env文件配置数据库连接和JWT密钥
   ```

4. **启动开发服务**：
   ```bash
   # 启动后端服务
   pnpm dev:server
   
   # 或进入server目录单独启动
   cd apps/server
   pnpm dev
   ```

5. **初始化数据库**（首次运行）：
   ```bash
   # 使用NestJS CLI执行数据库迁移
   cd apps/server
   npx typeorm migration:run
   
   # 或使用自定义脚本初始化数据
   npm run seed
   ```

### 生产环境启动

1. **构建应用**：
   ```bash
   cd /Users/huangyuming/Desktop/createProjects/AI-code
   pnpm build:server
   ```

2. **配置环境变量**：确保生产环境的环境变量已正确设置

3. **启动服务**：
   ```bash
   # 使用Node直接启动
   cd apps/server
   NODE_ENV=production node dist/main.js
   
   # 或使用PM2
   pm2 start dist/main.js --name api-server
   
   # 或通过Docker
   docker-compose up -d server
   ```

## 打包和部署流程

### 构建应用

```bash
# 仅构建服务端
pnpm build:server

# 构建所有应用
pnpm build
```

### Docker部署

1. **构建Docker镜像**：
   ```bash
   docker build -t my-blog-api:latest -f apps/server/Dockerfile .
   ```

2. **运行容器**：
   ```bash
   docker run -d -p 3001:3001 --env-file ./apps/server/.env.prod my-blog-api:latest
   ```

3. **使用Docker Compose**：
   ```bash
   # 启动所有服务
   docker-compose up -d
   
   # 仅启动服务端
   docker-compose up -d server
   ```

### CI/CD流程

项目支持通过GitHub Actions自动化部署：

1. 当代码推送到`main`分支时，触发测试和构建
2. 测试通过后自动构建Docker镜像
3. 将镜像推送到容器仓库
4. 触发服务器上的部署脚本

## 调试和监控

### 日志系统

服务使用Winston日志库，日志保存在`logs/`目录下：

- `combined.log` - 所有级别的日志
- `error.log` - 仅错误日志

### 性能监控

- 集成Prometheus指标收集
- 支持通过`/metrics`端点暴露监控数据
- 可与Grafana配合实现可视化监控

### 健康检查

- `GET /health` - 检查服务健康状态
- `GET /health/db` - 检查数据库连接状态

## 故障排除

常见问题及解决方法：

1. **数据库连接错误**：
   - 检查`.env`文件中的数据库配置
   - 确认PostgreSQL服务已启动
   - 检查网络防火墙设置

2. **认证问题**：
   - 确保JWT_SECRET已正确配置
   - 检查token过期时间设置

3. **API返回500错误**：
   - 查看服务日志找出具体错误
   - 开发环境启用详细日志：`LOG_LEVEL=debug`
