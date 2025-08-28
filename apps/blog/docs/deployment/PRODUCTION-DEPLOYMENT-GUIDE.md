# 🚀 生产环境部署指南

## 📋 部署前检查清单

### ✅ 功能完整性验证
- [x] 用户认证系统正常运行
- [x] AI对话功能稳定工作
- [x] 数据库连接和查询正常
- [x] 文章编辑器功能完善
- [x] 统计仪表板显示正确
- [x] 实时监控系统运行
- [x] 报告生成功能正常
- [x] 性能测试通过

### 🔒 安全性检查
- [x] API端点权限验证
- [x] 输入数据验证和清理
- [x] SQL注入防护
- [x] XSS攻击防护
- [x] CSRF令牌验证
- [x] 敏感信息加密存储

### 🏗️ 基础设施准备
- [ ] 服务器配置完成
- [ ] 域名和SSL证书
- [ ] CDN和静态资源优化
- [ ] 数据库备份策略
- [ ] 监控和日志系统

## 🌐 部署架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   负载均衡器     │────│   Web服务器     │────│   数据库服务器   │
│   (Nginx)       │    │   (Next.js)     │    │   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────│   Redis缓存     │──────────────┘
                        │   (Session)     │
                        └─────────────────┘
```

## 🐳 Docker部署 (推荐)

### 1. 构建生产镜像

```bash
# 构建前端应用
cd apps/blog
docker build -t blog-frontend:latest .

# 构建后端服务
cd ../server
docker build -t blog-backend:latest .
```

### 2. Docker Compose 生产配置

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # 前端应用
  frontend:
    image: blog-frontend:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.yourdomain.com
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - backend
      - database
    restart: unless-stopped

  # 后端API
  backend:
    image: blog-backend:latest
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - database
      - redis
    restart: unless-stopped

  # 数据库
  database:
    image: postgres:15
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped

  # Redis缓存
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  # Nginx负载均衡
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 3. 环境变量配置

```bash
# .env.production
NODE_ENV=production

# 数据库配置
DATABASE_URL=postgresql://username:password@database:5432/blog_prod
POSTGRES_DB=blog_prod
POSTGRES_USER=blog_user
POSTGRES_PASSWORD=your_secure_password

# 认证配置
NEXTAUTH_SECRET=your_nextauth_secret_key
JWT_SECRET=your_jwt_secret_key

# AI配置
OPENAI_API_KEY=your_openai_api_key
AI_MODEL_ENDPOINT=https://api.your-ai-provider.com
AI_DEFAULT_MODEL=qwen/qwen2.5-7b-instruct/bf-16

# Redis配置
REDIS_URL=redis://redis:6379

# 外部服务
SMTP_HOST=smtp.your-email-provider.com
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASS=your_email_password

# 监控配置
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info
```

## 🚀 部署步骤

### 1. 服务器准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Docker和Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 创建部署目录
mkdir -p /opt/blog-app
cd /opt/blog-app
```

### 2. 上传代码和配置

```bash
# 上传应用代码
git clone https://github.com/yourusername/AI-code.git .

# 复制生产配置
cp .env.example .env.production
# 编辑 .env.production 填入实际值

# 设置权限
sudo chown -R $USER:$USER /opt/blog-app
chmod 600 .env.production
```

### 3. SSL证书配置

```bash
# 使用 Let's Encrypt 获取SSL证书
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# 复制证书到nginx目录
mkdir -p ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/
```

### 4. 启动服务

```bash
# 启动所有服务
docker-compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f
```

### 5. 数据库初始化

```bash
# 运行数据库迁移
docker-compose -f docker-compose.prod.yml exec backend npm run migrate

# 创建初始数据
docker-compose -f docker-compose.prod.yml exec backend npm run seed
```

## 📊 监控和日志

### 1. 系统监控配置

```yaml
# monitoring/docker-compose.yml
version: '3.8'

services:
  # Prometheus监控
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    restart: unless-stopped

  # Grafana可视化
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana_data:/var/lib/grafana
    restart: unless-stopped

  # Node Exporter
  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"
    restart: unless-stopped

volumes:
  prometheus_data:
  grafana_data:
```

### 2. 日志聚合

```yaml
# logging/docker-compose.yml
version: '3.8'

services:
  # ELK Stack
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.8.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5044:5044"
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.8.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

volumes:
  elasticsearch_data:
```

## 🔧 性能优化

### 1. Nginx配置优化

```nginx
# nginx/nginx.conf
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    # 基础配置
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # 缓存配置
    open_file_cache max=10000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;

    # 上游服务器
    upstream frontend {
        server frontend:3000;
        keepalive 32;
    }

    upstream backend {
        server backend:8000;
        keepalive 32;
    }

    # 主网站
    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # 前端应用
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # API代理
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### 2. 数据库优化

```sql
-- PostgreSQL性能优化
-- postgresql.conf 关键配置
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

-- 创建索引优化查询
CREATE INDEX CONCURRENTLY idx_articles_status ON articles(status);
CREATE INDEX CONCURRENTLY idx_articles_user_id ON articles(user_id);
CREATE INDEX CONCURRENTLY idx_conversations_user_id ON conversations(user_id);
CREATE INDEX CONCURRENTLY idx_messages_conversation_id ON messages(conversation_id);
```

## 🔄 CI/CD 流水线

### GitHub Actions配置

```yaml
# .github/workflows/deploy.yml
name: Production Deployment

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run lint

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker images
        run: |
          docker build -t blog-frontend:${{ github.sha }} apps/blog/
          docker build -t blog-backend:${{ github.sha }} apps/server/

      - name: Deploy to production
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/blog-app
            git pull origin main
            docker-compose -f docker-compose.prod.yml down
            docker-compose -f docker-compose.prod.yml pull
            docker-compose -f docker-compose.prod.yml up -d
```

## 🛡️ 安全强化

### 1. 防火墙配置

```bash
# UFW防火墙设置
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. 应用安全配置

```javascript
// security.js - 安全中间件
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// 安全头设置
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 最多100个请求
  message: '请求过于频繁，请稍后重试',
});

app.use('/api/', limiter);
```

## 📋 部署后验证

### 1. 健康检查

```bash
# 检查服务状态
curl -f http://yourdomain.com/api/health

# 检查数据库连接
docker-compose exec backend npm run db:check

# 检查Redis连接
docker-compose exec redis redis-cli ping
```

### 2. 性能验证

```bash
# 负载测试
ab -n 1000 -c 10 https://yourdomain.com/

# 数据库性能
docker-compose exec database psql -U blog_user -d blog_prod -c "EXPLAIN ANALYZE SELECT * FROM articles LIMIT 10;"
```

### 3. 监控验证

- 访问 Grafana: http://yourdomain.com:3001
- 访问 Kibana: http://yourdomain.com:5601  
- 检查日志聚合和指标收集

## 🚨 故障排除

### 常见问题和解决方案

1. **服务启动失败**
   ```bash
   # 查看详细日志
   docker-compose logs service_name
   
   # 检查资源使用
   docker stats
   ```

2. **数据库连接问题**
   ```bash
   # 检查数据库状态
   docker-compose exec database pg_isready
   
   # 重置数据库连接
   docker-compose restart database
   ```

3. **性能问题**
   ```bash
   # 监控系统资源
   htop
   iotop
   
   # 分析慢查询
   docker-compose exec database psql -c "SELECT * FROM pg_stat_activity;"
   ```

## 📱 维护建议

1. **定期备份**
   - 每日数据库备份
   - 每周完整系统备份
   - 测试备份恢复流程

2. **监控报警**
   - CPU/内存使用率超过80%
   - 磁盘空间不足
   - 服务响应时间超过阈值
   - 错误率超过1%

3. **安全更新**
   - 定期更新Docker镜像
   - 及时应用安全补丁
   - 监控安全漏洞

4. **性能优化**
   - 定期分析慢查询
   - 优化数据库索引
   - 调整缓存策略

---

✅ **部署完成后，您的AI博客系统将具备：**
- 🔒 企业级安全防护
- 🚀 高性能负载处理
- 📊 全面监控和分析
- 🔄 自动化部署流程
- 🛡️ 故障自动恢复
- 📈 可扩展架构设计 