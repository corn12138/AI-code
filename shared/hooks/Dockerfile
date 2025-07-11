# 多阶段构建 - 构建阶段
FROM node:18-alpine as builder

WORKDIR /app

# 复制包文件
COPY package*.json ./
COPY .dumirc.ts ./
COPY tsconfig.json ./

# 安装依赖
RUN npm install --legacy-peer-deps

# 复制源代码
COPY src/ ./src/
COPY docs/ ./docs/
COPY public/ ./public/

# 设置环境变量
ENV NODE_ENV=production
ENV NETLIFY=false

# 构建文档
RUN npm run docs:build

# 生产阶段 - 使用 nginx 服务静态文件
FROM nginx:alpine

# 安装 curl 用于健康检查
RUN apk add --no-cache curl

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 复制构建的静态文件
COPY --from=builder /app/docs-dist /usr/share/nginx/html

# 添加健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"] 