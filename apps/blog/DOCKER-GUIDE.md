# Blog项目 Docker 使用手册

## 📁 项目Docker结构 

AI-code/
├── docker-compose.yml # 开发环境配置
├── docker-compose.production.yml # 生产环境配置
├── apps/blog/Dockerfile # Blog应用Dockerfile
└── docker/base/Dockerfile # 基础镜像Dockerfile


## 🚀 快速启动

### 开发环境启动
```bash
# 在项目根目录执行
cd /Users/huangyuming/Desktop/createProjects/AI-code

# 启动所有服务
docker-compose up

# 后台运行
docker-compose up -d

# 只启动blog服务
docker-compose up blog
```

### 生产环境启动
```bash
# 使用生产环境配置
docker-compose -f docker-compose.production.yml up -d
```

## 🔧 单独运行Blog应用

```bash
# 进入blog目录
cd apps/blog

# 构建镜像
docker build -t ai-blog .

# 运行容器
docker run -p 3000:3000 ai-blog

# 带环境变量运行
docker run -p 3000:3000 --env-file ENV_CONFIG.txt ai-blog
```

## 📋 常用Docker命令

### 查看状态
```bash
# 查看运行中的容器
docker-compose ps

# 查看所有容器
docker ps -a

# 查看镜像
docker images
```

### 日志管理
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f blog

# 查看最近100行日志
docker-compose logs --tail=100 blog
```

### 进入容器
```bash
# 进入blog容器
docker-compose exec blog sh

# 或使用bash（如果可用）
docker-compose exec blog bash
```

### 清理和重建
```bash
# 停止所有服务
docker-compose down

# 停止并删除数据卷
docker-compose down -v

# 重新构建镜像
docker-compose build --no-cache

# 强制重新创建容器
docker-compose up --force-recreate
```

## ⚙️ 环境配置

### 环境变量文件
- `ENV_CONFIG.txt` - 包含所有环境变量配置
- 确保数据库连接、API密钥等配置正确

### 数据库配置
```bash
# 运行数据库迁移
docker-compose exec blog npx prisma migrate dev

# 生成Prisma客户端
docker-compose exec blog npx prisma generate

# 查看数据库状态
docker-compose exec blog npx prisma db status
```

## 🐛 故障排除

### 常见问题

#### 端口占用
```bash
# 查看端口占用
lsof -i :3000

# 强制停止占用端口的进程
kill -9 $(lsof -t -i:3000)
```

#### 镜像构建失败
```bash
# 清理Docker缓存
docker system prune -a

# 删除悬空镜像
docker image prune

# 查看构建过程详细信息
docker-compose build --no-cache --progress=plain
```

#### 容器启动失败
```bash
# 查看容器错误日志
docker-compose logs blog

# 检查容器配置
docker-compose config

# 验证Dockerfile语法
docker build --dry-run -t test-build .
```

### 数据库连接问题
```bash
# 检查数据库容器状态
docker-compose ps db

# 测试数据库连接
docker-compose exec blog npx prisma db ping

# 重启数据库服务
docker-compose restart db
```

## 🔄 开发工作流

### 代码更新后重启
```bash
# 重启blog服务
docker-compose restart blog

# 重新构建并启动
docker-compose up --build blog
```

### 依赖更新
```bash
# 重新构建镜像（安装新依赖）
docker-compose build --no-cache blog

# 重新启动服务
docker-compose up -d blog
```

## 📊 性能监控

### 查看资源使用
```bash
# 查看容器资源使用情况
docker stats

# 查看特定容器资源使用
docker stats blog_container_name
```

### 磁盘空间管理
```bash
# 查看Docker磁盘使用
docker system df

# 清理未使用的资源
docker system prune

# 清理所有未使用的镜像
docker image prune -a
```

## 🛡️ 安全最佳实践

1. **环境变量**: 不要在Dockerfile中硬编码敏感信息
2. **用户权限**: 使用非root用户运行容器
3. **网络安全**: 只暴露必要的端口
4. **镜像安全**: 定期更新基础镜像

## 📝 备份和恢复

### 数据备份
```bash
# 备份数据库
docker-compose exec db pg_dump -U username dbname > backup.sql

# 备份整个数据卷
docker run --rm -v blog_data:/data -v $(pwd):/backup alpine tar czf /backup/blog_backup.tar.gz -C /data .
```

### 数据恢复
```bash
# 恢复数据库
docker-compose exec -T db psql -U username dbname < backup.sql
```

## 🎯 快速参考

| 操作 | 命令 |
|------|------|
| 启动开发环境 | `docker-compose up -d` |
| 查看日志 | `docker-compose logs -f blog` |
| 重启服务 | `docker-compose restart blog` |
| 进入容器 | `docker-compose exec blog sh` |
| 停止所有服务 | `docker-compose down` |
| 重新构建 | `docker-compose build --no-cache` |
| 清理资源 | `docker system prune` |

## 📞 联系方式

如有问题，请查看：
- `AI-CHAT-SETUP.md` - AI聊天功能配置
- `ENV-SETUP.md` - 环境配置说明
- `MIGRATION-GUIDE.md` - 迁移指南

---
*最后更新：$(date)*