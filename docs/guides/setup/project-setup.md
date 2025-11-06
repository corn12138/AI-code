# 开发环境设置

本文档介绍如何设置和运行博客与低代码平台项目的开发环境。

## 先决条件

- Node.js v16+
- npm v8+ 或 yarn v1.22+
- PostgreSQL 14+
- Git
- 支持Service Worker的现代浏览器(Chrome, Firefox, Safari, Edge)

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
npm run dev:server

# 或使用yarn
yarn dev:server
```

服务将在 http://localhost:3001 上运行，API文档可通过 http://localhost:3001/api/docs 访问。

### 启动博客应用

```bash
# 在项目根目录
npm run dev:blog

# 或使用yarn
yarn dev:blog
```

博客应用将在 http://localhost:3000 上运行。

### 启动低代码平台

```bash
# 在项目根目录
npm run dev:lowcode

# 或使用yarn
yarn dev:lowcode
```

低代码平台将在 http://localhost:3002 上运行。

#### 测试离线功能

1. 启动低代码平台后，确认Service Worker已注册成功
   - 打开浏览器开发者工具 → Application → Service Workers
   - 应当看到已注册的service-worker.js处于"activated"状态

2. 模拟离线环境
   - 在开发者工具中选择 Network → Offline
   - 或物理断开网络连接

3. 尝试创建或编辑页面，操作应当正常进行

4. 恢复网络连接，观察同步状态
   - 右下角应显示同步状态
   - 或查看开发者工具控制台中的同步日志

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

## Service Worker开发与调试

### 开发模式下的Service Worker

开发模式默认启用Service Worker，但每次更改service-worker.js后需要执行以下操作以应用更改：

1. 在开发者工具中导航到Application → Service Workers
2. 点击"Update"链接或"Unregister"后重新加载页面

### 强制更新Service Worker

在生产环境，修改service-worker.js的内容时需要更改版本号以强制更新：

```javascript
const CACHE_NAME = 'lowcode-cache-v2'; // 更改版本号
```

### 禁用Service Worker

临时禁用Service Worker进行测试：

```bash
# 在.env.development中添加
VITE_DISABLE_SW=true
```

## 常见问题

### CORS错误

确保在`.env`文件中正确配置了允许的前端域名，并且服务器的CORS设置正确。

### 数据库连接问题

检查`.env`文件中的数据库连接信息是否正确，以及PostgreSQL服务是否正在运行。

### 权限问题

在开发环境中，确保已登录并获取了有效的认证令牌。可以通过浏览器开发工具查看存储的令牌。

### Service Worker相关问题

#### Service Worker注册失败

- **问题**: 控制台显示Service Worker注册失败
- **解决**: 确认正在使用HTTPS或localhost访问应用

#### 离线模式不工作

- **问题**: 断网后应用无法正常工作
- **解决**: 
  - 检查Service Worker是否处于活动状态
  - 确认首次访问时已完全加载资源缓存
  - 查看IndexedDB权限是否被阻止

#### 同步失败

- **问题**: 网络恢复后更改未同步到服务器
- **解决**:
  - 查看同步队列中是否有记录
  - 尝试点击界面上的"立即同步"按钮
  - 检查服务器端API是否正常响应

### 端口冲突

- **问题**: 启动开发服务器时提示端口已被占用 (e.g., `Port 3000 is already in use`)。
- **解决**:
  - 检查是否有其他应用占用了该端口，关闭冲突应用或更改本项目配置中的端口号。
  - 例如，在 `apps/blog/package.json` 或相关启动脚本中修改端口。

### 依赖安装失败

- **问题**: `npm install` 或 `yarn install` 过程中报错。
- **解决**:
  - 确保Node.js和npm/yarn版本符合“先决条件”中的要求。
  - 删除 `node_modules` 目录和 `package-lock.json` 或 `yarn.lock` 文件，然后重试。
  - 检查网络连接，或尝试切换npm/yarn的镜像源。
  - 查看错误日志，根据具体错误信息搜索解决方案（例如缺少Python、C++编译器等构建工具）。

### 构建失败

- **问题**: 运行 `npm run build` 时出现错误。
- **解决**:
  - 仔细阅读构建错误日志，通常会指示问题所在的文件或模块。
  - 检查环境变量配置是否正确，特别是生产环境相关的变量。
  - 确保所有应用的依赖都已正确安装且版本兼容。
  - 尝试清理缓存：`npm cache clean --force` 或 `yarn cache clean`。

### TypeScript类型错误

- **问题**: 开发或构建过程中出现TypeScript类型检查错误。
- **解决**:
  - 根据错误提示修改代码，确保类型匹配。
  - 检查 `tsconfig.json` 文件配置是否正确。
  - 如果使用了第三方库，确认其类型定义（`@types/...`）已安装。
