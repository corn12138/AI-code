# 服务端模块

## 功能概述

服务端使用NestJS开发，提供博客和低代码平台所需的API服务。

### 主要功能

- **用户管理**: 注册、登录、权限控制
- **文章管理**: 创建、查询、更新、删除
- **低代码平台**: 页面保存、发布、模板管理
- **数据存储**: 使用PostgreSQL存储业务数据
- **安全保障**: XSS防护、CSRF防护、权限控制
- **日志系统**: 使用Winston实现多级别日志记录
- **API文档**: 集成Swagger提供在线API文档

## 模块设计

- **AuthModule**: 负责认证和授权
- **UserModule**: 用户管理
- **ArticleModule**: 文章管理
- **CommentModule**: 评论管理
- **LowcodeModule**: 低代码平台
- **CommonModule**: 通用功能
- **HealthModule**: 健康检查
- **DatabaseModule**: 数据库连接和配置

## 数据模型

主要实体关系：

```
USER {
  UUID id PK
  VARCHAR username UNIQUE
  VARCHAR email UNIQUE
  VARCHAR password_hash
  VARCHAR fullName
  VARCHAR[] roles
  TIMESTAMP created_at
  TIMESTAMP updated_at
}

ARTICLE {
  UUID id PK
  VARCHAR title
  TEXT content
  UUID author_id FK
  UUID[] category_ids FK
  UUID[] tag_ids FK
  BOOLEAN is_published
  TIMESTAMP created_at
  TIMESTAMP updated_at
}

CATEGORY {
  UUID id PK
  VARCHAR name
  VARCHAR description
  VARCHAR slug
  TIMESTAMP created_at
  TIMESTAMP updated_at
}

TAG {
  UUID id PK
  VARCHAR name
  TIMESTAMP created_at
  TIMESTAMP updated_at
}

COMMENT {
  UUID id PK
  TEXT content
  UUID article_id FK
  UUID author_id FK
  TIMESTAMP created_at
  TIMESTAMP updated_at
}

LOWCODE_PAGE {
  UUID id PK
  VARCHAR title
  VARCHAR description
  JSONB content
  UUID owner_id FK
  BOOLEAN published
  TIMESTAMP created_at
  TIMESTAMP updated_at
  TIMESTAMP published_at
}
```

## API端点

### 认证

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/refresh` - 刷新令牌
- `POST /api/auth/logout` - 用户退出

### 用户

- `GET /api/users/me` - 获取当前用户信息
- `PUT /api/users/me` - 更新用户信息
- `GET /api/users/:id` - 获取指定用户信息
- `GET /api/users` - 获取用户列表（管理员）

### 文章

- `GET /api/articles` - 获取文章列表
- `GET /api/articles/:id` - 获取单篇文章
- `POST /api/articles` - 创建文章
- `PUT /api/articles/:id` - 更新文章
- `DELETE /api/articles/:id` - 删除文章
- `GET /api/articles/categories` - 获取分类列表
- `GET /api/articles/tags` - 获取标签列表

### 低代码平台

- `GET /api/lowcode/pages` - 获取当前用户的页面列表
- `GET /api/lowcode/pages/:id` - 获取页面配置
- `POST /api/lowcode/pages` - 创建页面
- `PUT /api/lowcode/pages/:id` - 更新页面
- `DELETE /api/lowcode/pages/:id` - 删除页面
- `POST /api/lowcode/pages/:id/publish` - 发布页面
- `GET /api/lowcode/templates` - 获取模板列表
- `POST /api/lowcode/templates/:id` - 基于模板创建页面
- `GET /api/lowcode/published/:id` - 获取已发布页面（无需认证）

## 低代码平台详情

低代码平台允许用户创建、编辑和发布自定义页面。主要功能包括：

### 页面管理
- 创建、编辑、删除和查询页面
- 页面内容以JSON格式存储，支持复杂的页面结构
- 页面访问权限控制，确保用户只能访问自己的页面

### 模板系统
- 提供多种预定义页面模板
- 支持博客首页、产品展示、个人简介等常见场景
- 用户可基于模板快速创建新页面

### 发布流程
- 页面支持草稿（未发布）和已发布两种状态。
- **API触发发布**: 前端调用 `POST /api/lowcode/pages/:id/publish` 端点来发布或更新已发布的页面。
- **数据处理**:
    - 服务器端将当前页面的 `content` (JSONB) 标记为已发布版本。
    - 可以考虑存储历史版本，例如在 `LOWCODE_PAGE_VERSIONS` 表中记录每次发布的快照。
    - 更新 `LOWCODE_PAGE` 表中的 `published_at` 时间戳和 `published_content` (如果单独存储已发布内容)。
- **访问控制**: 已发布的页面通过 `GET /api/lowcode/published/:id` 或一个特定的公共路径（如 `/p/:pageSlug`）提供访问，此端点通常无需认证或使用简化的认证机制。
- **CDN与缓存**: 对于已发布的页面，可以考虑集成CDN并配置适当的缓存策略以提高访问速度和可用性。服务器在发布时可能需要触发CDN缓存刷新。

### 版本管理 (可选增强)
- **版本历史**: 每次发布操作都创建一个新的页面版本记录。这允许用户回滚到之前的某个已发布版本。
- **版本标签**: 用户可以为特定版本打上标签（如 "v1.0", "圣诞节活动版"）。
- **版本对比**: (高级功能) 允许用户对比不同版本之间的内容差异。
- **数据库设计**: 可能需要额外的表来存储版本信息，例如 `LOWCODE_PAGE_VERSIONS (id, page_id, content, created_at, notes)`。

## 安全措施

- 使用BCrypt和BCryptJS加密密码
- JWT认证与授权
- CSRF保护
- XSS过滤
- 请求速率限制（使用ThrottlerModule）
- 敏感数据脱敏
- Helmet中间件提供安全HTTP头

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

## 日志系统

系统使用Winston日志库实现多级别日志记录：

- **控制台日志**: 彩色输出，包含时间戳和日志级别
- **错误日志文件**: 存储所有错误级别日志到`logs/error.log`
- **组合日志文件**: 存储所有级别日志到`logs/combined.log`

日志格式包含时间戳、日志级别和详细消息，方便调试和问题排查。

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
   # 检查数据库连接
   npm run db:check
   
   # 运行迁移脚本
   npm run migration:run
   
   # 填充种子数据
   npm run db:seed
   
   # 或使用一键设置脚本
   npm run db:full-setup
   ```

### 生产环境启动

1. **构建应用**：
   ```bash
   cd /Users/huangyuming/Desktop/createProjects/AI-code
   pnpm build:server
   ```

2. **配置环境变量**：
   ```bash
   cp apps/server/.env apps/server/.env.prod
   # 编辑.env.prod设置生产环境参数
   ```

3. **启动服务**：
   ```bash
   # 使用Node直接启动
   cd apps/server
   NODE_ENV=production node dist/main.js
   
   # 或使用PM2
   pm2 start dist/main.js --name api-server
   
   # 生产环境数据库初始化
   npm run migrate:prod
   npm run seed:prod
   ```

## 打包和部署流程

### Docker部署

Docker部署使用多阶段构建优化镜像大小和构建效率：

1. **依赖阶段**: 安装所有依赖
2. **构建阶段**: 编译TypeScript代码
3. **运行阶段**: 只包含生产环境所需的文件

```bash
# 构建镜像
docker build -t blog-api:latest -f apps/server/Dockerfile .

# 运行容器
docker run -d -p 3001:3001 --env-file ./apps/server/.env.prod blog-api:latest
```

### 华为云部署

项目提供华为云部署脚本：

```bash
# 部署到华为云
npm run deploy:huaweicloud
```

## API文档

系统集成Swagger API文档，可通过以下方式访问：

- 开发环境: http://localhost:3001/api/docs
- 生产环境: https://你的域名/api/docs

文档包含所有API端点的详细说明、请求参数、响应格式和认证要求。

## 故障排除

常见问题及解决方法：

1. **数据库连接错误**：
   - 运行`npm run db:check`诊断连接问题
   - 检查`.env`文件中的数据库配置
   - 验证数据库用户权限：`npm run db:verify-access`

2. **BCrypt编译问题**：
   - 项目同时支持`bcrypt`和`bcryptjs`
   - 如遇编译问题，运行`npm run fix:bcrypt`切换到纯JavaScript实现

3. **日志问题排查**：
   - 检查`logs/`目录下的日志文件
   - 错误详情记录在`logs/error.log`中
   - 开发环境控制台输出彩色日志

4. **API文档无法访问**：
   - 确认应用正常运行：`curl localhost:3001/api/health`
   - 检查Swagger配置在`main.ts`中是否正确
