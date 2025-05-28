# 开发环境设置

本文档介绍如何设置和运行博客与低代码平台项目的开发环境。

## 先决条件

- Node.js v16+
- npm v8+ 或 yarn v1.22+
- PostgreSQL 14+
- Git

## 克隆代码库

```bash
git clone https://github.com/yourusername/AI-code.git
cd AI-code
```

## 安装依赖

项目使用 workspace 管理多个应用，因此在根目录安装所有依赖：

```bash
# 使用npm
npm install

# 或使用yarn
yarn install
```

## 环境配置

1. 复制环境变量模板文件：

```bash
cp apps/server/.env.example apps/server/.env
cp apps/blog/.env.example apps/blog/.env
cp apps/lowcode/.env.example apps/lowcode/.env
```

2. 根据实际环境修改各个`.env`文件，包括数据库连接、API地址等

## 数据库设置

1. 创建PostgreSQL数据库：

```sql
CREATE DATABASE ai_code;
CREATE USER ai_code_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ai_code TO ai_code_user;
```

2. 运行数据库迁移：

```bash
cd apps/server
npm run migration:run

# 或使用yarn
yarn migration:run
```

## 启动开发服务器

### 启动后端服务

```bash
# 在项目根目录
npm run start:server

# 或使用yarn
yarn start:server
```

服务将在 http://localhost:3001 上运行，API文档可通过 http://localhost:3001/api/docs 访问。

### 启动博客应用

```bash
# 在项目根目录
npm run start:blog

# 或使用yarn
yarn start:blog
```

博客应用将在 http://localhost:3000 上运行。

### 启动低代码平台

```bash
# 在项目根目录
npm run start:lowcode

# 或使用yarn
yarn start:lowcode
```

低代码平台将在 http://localhost:3002 上运行。

## 构建生产版本

```bash
# 构建所有应用
npm run build

# 或构建单个应用
npm run build:server
npm run build:blog
npm run build:lowcode
```

## 测试

```bash
# 运行所有测试
npm test

# 或测试单个应用
npm run test:server
npm run test:blog
npm run test:lowcode
```

## 常见问题

### CORS错误

确保在`.env`文件中正确配置了允许的前端域名，并且服务器的CORS设置正确。

### 数据库连接问题

检查`.env`文件中的数据库连接信息是否正确，以及PostgreSQL服务是否正在运行。

### 权限问题

在开发环境中，确保已登录并获取了有效的认证令牌。可以通过浏览器开发工具查看存储的令牌。
