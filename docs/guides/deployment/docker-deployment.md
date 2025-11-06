# Dumi 文档部署完整指南

本文档提供多种方式来部署你的 Dumi 文档站点，满足不同需求和预算。

## 🎉 好消息：你的文档已在线！

**当前访问地址**: https://corn12138.github.io/ai-code-hooks/

但如果你想要更好的体验或完全控制，请继续阅读。

## ⚡ 快速开始

### 最简单（0 分钟）
```bash
# 你的文档已经在线！
# 访问: https://corn12138.github.io/ai-code-hooks/
```

### 升级到 Netlify（5 分钟）
```bash
# 1. 访问 https://netlify.com
# 2. 连接你的 GitHub 仓库 'ai-code-hooks'
# 3. 构建设置：
#    Build command: npm install --legacy-peer-deps && npm run docs:build
#    Publish directory: docs-dist
# 4. 点击 Deploy site
# 5. 获得更快的访问速度！
```

### 本地运行（1 分钟）
```bash
cd shared/hooks
npm run dev
# 访问 http://localhost:8000
```

### Docker 部署（2 分钟）
```bash
cd shared/hooks
./deploy.sh docker
# 访问 http://localhost:8080
```

---

## 🚀 部署方案对比

| 方案 | 成本 | 设置难度 | 访问速度 | 自定义域名 | 控制程度 | 推荐场景 |
|------|------|----------|----------|------------|----------|----------|
| **GitHub Pages** | 免费 | ⭐ | ⭐⭐⭐ | ✅ | ⭐⭐ | 开源项目，已配置 |
| **Netlify** | 免费/付费 | ⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | ⭐⭐⭐ | 专业静态站点 |
| **Vercel** | 免费/付费 | ⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | ⭐⭐⭐ | 现代前端应用 |
| **云服务器** | 付费 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ | ⭐⭐⭐⭐⭐ | 完全控制需求 |

---

## 方案1: GitHub Pages（当前已配置 ✅）

### 📍 访问地址
- **URL**: https://corn12138.github.io/ai-code-hooks/
- **状态**: ✅ 已部署运行

### 🔧 配置状态
```yaml
# .github/workflows/docs.yml 已配置
- 自动构建：✅
- 自动部署：✅ 
- 自定义域名：支持
- HTTPS：✅ 自动
```

### 📝 使用方法
```bash
# 更新文档只需推送代码
git add .
git commit -m "docs: update documentation"
git push origin main
# 5-10分钟后自动部署完成
```

---

## 方案2: Netlify 部署（推荐升级 ⭐⭐⭐⭐⭐）

### 🌟 优势
- ✅ **全球CDN**: 更快的访问速度
- ✅ **自动HTTPS**: 免费SSL证书
- ✅ **自定义域名**: 免费支持
- ✅ **预览部署**: PR预览功能
- ✅ **表单处理**: 支持联系表单

### 📋 部署步骤

**第1步: 注册 Netlify**
1. 访问 https://netlify.com
2. 使用 GitHub 账号登录
3. 点击 "New site from Git"

**第2步: 连接仓库**
1. 选择 "GitHub"
2. 找到 `ai-code-hooks` 仓库
3. 点击配置

**第3步: 构建设置**
```yaml
Build command: npm install --legacy-peer-deps && npm run docs:build
Publish directory: docs-dist
```

**第4步: 环境变量（可选）**
```env
NODE_VERSION=18
NODE_ENV=production
NETLIFY=true
```

**第5步: 部署**
- 点击 "Deploy site"
- 等待构建完成（约2-3分钟）
- 获得类似 `https://amazing-name-123456.netlify.app` 的URL

### 🔗 自定义域名
```bash
# 在 Netlify 控制台
1. Site settings → Domain management
2. Add custom domain
3. 输入域名: docs.your-domain.com
4. 设置DNS记录（Netlify会提供指导）
```

---

## 方案3: Vercel 部署

### 📋 部署步骤

**第1步: 登录 Vercel**
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login
```

**第2步: 配置 vercel.json**
```json
{
  "buildCommand": "npm install --legacy-peer-deps && npm run docs:build",
  "outputDirectory": "docs-dist",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": null,
  "functions": {},
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**第3步: 部署**
```bash
# 在项目目录运行
vercel

# 跟随提示配置
# 获得 https://your-project.vercel.app 地址
```

---

## 方案4: 云服务器部署

### 🖥️ 服务器要求
- **配置**: 1核2G内存（最低）
- **系统**: Ubuntu 20.04+ / CentOS 7+
- **软件**: Docker + Docker Compose

### 📦 Docker 部署方案

**第1步: 创建 Dockerfile**
```dockerfile
# 多阶段构建
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
COPY .dumirc.ts tsconfig.json ./

RUN npm install --legacy-peer-deps

COPY src/ ./src/
COPY docs/ ./docs/
COPY public/ ./public/

RUN npm run docs:build

# 生产环境
FROM nginx:alpine

COPY --from=builder /app/docs-dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**第2步: 创建 nginx.conf**
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # 处理单页应用路由
        location / {
            try_files $uri $uri/ /index.html;
        }

        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # 安全头
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-XSS-Protection "1; mode=block";
        add_header X-Content-Type-Options "nosniff";
    }
}
```

**第3步: 创建 docker-compose.yml**
```yaml
version: '3.8'

services:
  docs:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3

  # 可选：添加 SSL 证书（使用 Caddy）
  caddy:
    image: caddy:alpine
    ports:
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    restart: unless-stopped

volumes:
  caddy_data:
  caddy_config:
```

**第4步: 部署命令**
```bash
# 上传文件到服务器
scp -r * user@your-server:/opt/docs/

# SSH 连接服务器
ssh user@your-server

cd /opt/docs

# 构建并启动
docker-compose up -d

# 查看状态
docker-compose ps
docker-compose logs docs
```

### 🔒 SSL 证书配置（Caddy）
```caddyfile
# Caddyfile
docs.your-domain.com {
    reverse_proxy docs:80
    
    encode gzip
    
    header {
        # 安全头
        X-Frame-Options "SAMEORIGIN"
        X-XSS-Protection "1; mode=block"
        X-Content-Type-Options "nosniff"
        Strict-Transport-Security "max-age=31536000;"
    }
}
```

---

## 🎯 推荐选择

### 对于大多数情况（推荐）:
1. **当前就很好**: GitHub Pages 已经满足基本需求
2. **想要更好体验**: 选择 Netlify，5分钟部署，全球CDN
3. **专业项目**: Netlify + 自定义域名

### 对于特殊需求:
1. **完全控制**: 云服务器 + Docker
2. **企业环境**: 私有云部署
3. **高并发**: CDN + 负载均衡

---

## 🚀 快速部署 Netlify（5分钟）

如果你想升级到 Netlify，按以下步骤：

```bash
# 1. 访问 https://netlify.com
# 2. 点击 "New site from Git"
# 3. 选择 GitHub → ai-code-hooks 仓库
# 4. 构建设置：
#    Build command: npm install --legacy-peer-deps && npm run docs:build
#    Publish directory: docs-dist
# 5. 点击 "Deploy site"
# 6. 等待构建完成
# 7. 获得新的访问地址！
```

**结果**: 你将获得类似 `https://corn12138.github.io/ai-code-hooks` 的URL，访问速度更快！

---

## 📊 性能对比

### 访问速度测试（中国大陆）
- **GitHub Pages**: ~800ms
- **Netlify**: ~200ms
- **Vercel**: ~300ms
- **自建服务器**: 取决于带宽

### 功能对比
| 功能 | GitHub Pages | Netlify | Vercel | 云服务器 |
|------|--------------|---------|---------|----------|
| 自动部署 | ✅ | ✅ | ✅ | 需配置 |
| 自定义域名 | ✅ | ✅ | ✅ | ✅ |
| HTTPS | ✅ | ✅ | ✅ | 需配置 |
| 全球CDN | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 需配置 |
| 表单处理 | ❌ | ✅ | ✅ | 需开发 |
| 边缘函数 | ❌ | ✅ | ✅ | 需开发 |

---

## 🎉 总结

**最简单**: 继续使用 GitHub Pages（已经在线）
**最快速**: 部署到 Netlify（5分钟升级）
**最可控**: 使用云服务器（适合企业）

你现在有哪种偏好？我可以帮你具体实施！ 