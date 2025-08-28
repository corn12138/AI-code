# Blog项目独立启动手册

## 🎯 概述

本手册介绍如何将Blog项目作为独立的Next.js全栈应用运行，不依赖Docker或其他外部服务。

## ✅ 配置完成状态

经过配置后，你的Blog项目现在是一个**完全独立的Next.js全栈应用**，具备以下功能：

- ✅ 用户认证（注册/登录）
- ✅ JWT令牌管理
- ✅ 数据库连接（通过SSH隧道）
- ✅ 博客内容管理
- ✅ AI聊天功能
- ✅ 低代码页面编辑

## 🔧 当前配置

### 数据库连接
- **类型**: PostgreSQL 16.8
- **连接方式**: SSH隧道转发
- **本地端口**: 6543
- **远程服务器**: 122.9.160.210:5432
- **数据库**: blogdb

### 环境变量
使用 `.env` 文件，包含正确的数据库凭据和所有必要配置。

## 🚀 启动步骤

### 1. 确保SSH隧道连接
确保你的Termius SSH端口转发正在运行：
```
本地端口: 6543
远程地址: 122.9.160.210:5432
```

### 2. 进入项目目录
```bash
cd /Users/huangyuming/Desktop/createProjects/AI-code/apps/blog
```

### 3. 安装依赖（如果需要）
```bash
pnpm install
```

### 4. 生成Prisma客户端
```bash
npx prisma generate
```

### 5. 同步数据库结构
```bash
npx prisma db push
```

### 6. 启动开发服务器
```bash
npm run dev
```

### 7. 访问应用
打开浏览器访问：http://localhost:3000

## 🧪 验证功能

### API健康检查
```bash
curl http://localhost:3000/api/health
```
期望输出：
```json
{
  "status": "healthy",
  "message": "API is running",
  "database": "connected"
}
```

### 用户注册
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Password123!",
    "confirmPassword": "Password123!"
  }'
```

### 用户登录
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

## 📋 可用API端点

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/refresh` - 刷新令牌

### 内容管理
- `GET /api/articles` - 获取文章列表
- `POST /api/articles` - 创建文章
- `GET /api/articles/[id]` - 获取单篇文章
- `PUT /api/articles/[id]` - 更新文章
- `DELETE /api/articles/[id]` - 删除文章

### 分类和标签
- `GET /api/categories` - 获取分类列表
- `POST /api/categories` - 创建分类
- `GET /api/tags` - 获取标签列表
- `POST /api/tags` - 创建标签

### AI聊天
- `POST /api/chat` - AI对话接口

### 健康检查
- `GET /api/health` - 系统健康状态

## 🗂️ 项目结构

```
apps/blog/
├── src/
│   ├── app/
│   │   ├── api/          # API路由
│   │   ├── (pages)/      # 页面组件
│   │   └── globals.css   # 全局样式
│   ├── components/       # React组件
│   ├── lib/             # 工具库
│   └── types/           # TypeScript类型
├── prisma/
│   └── schema.prisma    # 数据库模型
├── .env                 # 环境变量（生产配置）
└── package.json         # 项目配置
```

## 🛠️ 故障排除

### 数据库连接失败
1. 检查SSH隧道是否正常运行
2. 验证端口6543是否被正确转发
3. 确认数据库凭据正确

```bash
# 检查端口连接
nc -zv localhost 6543

# 测试数据库连接
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect().then(() => {
  console.log('✅ 数据库连接成功');
  prisma.\$disconnect();
}).catch(err => {
  console.error('❌ 数据库连接失败:', err.message);
});
"
```

### API错误
1. 检查环境变量配置
2. 确保Prisma客户端已生成
3. 验证数据库表结构

```bash
# 重新生成Prisma客户端
npx prisma generate

# 查看数据库状态
npx prisma migrate status
```

### 端口冲突
```bash
# 查看端口占用
lsof -i :3000

# 强制停止进程
kill -9 $(lsof -t -i:3000)
```

## 📈 性能优化

### 数据库优化
- 使用连接池
- 添加适当的索引
- 定期清理日志

### Next.js优化
- 启用静态生成
- 使用图片优化
- 代码分割

## 🔒 安全配置

### 环境变量安全
- ✅ JWT密钥安全存储
- ✅ 数据库凭据加密
- ✅ API密钥保护

### 认证安全
- ✅ 密码强度验证
- ✅ JWT令牌过期机制
- ✅ CSRF保护启用

## 🎉 成功标志

当你看到以下内容时，说明Blog项目已完全配置成功：

1. **健康检查通过**：`/api/health` 返回 `"database": "connected"`
2. **用户注册成功**：能够创建新用户并获得JWT令牌
3. **用户登录成功**：能够使用邮箱密码登录
4. **前端页面加载**：http://localhost:3000 正常显示

## 📞 支持信息

如遇问题，请检查：
- SSH隧道连接状态
- 环境变量配置
- 数据库连接
- API响应状态

---

**恭喜！** 🎊 你的Blog项目现在是一个完全独立的Next.js全栈应用，可以独立运行所有功能！

*最后更新：2025-07-16* 