# 第一阶段：依赖安装
FROM node:18-alpine AS deps
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/blog/package.json ./apps/blog/
COPY shared/ ./shared/
COPY config/ ./config/

# 添加生产环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 安装pnpm并安装依赖
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# 第二阶段：构建
FROM node:18-alpine AS builder
WORKDIR /app

# 从deps阶段复制node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 构建应用
RUN npm install -g pnpm && pnpm build --filter blog

# 第三阶段：生产
FROM node:18-alpine AS runner
WORKDIR /app

# 设置环境变量
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# 复制必要文件
COPY --from=builder /app/apps/blog/next.config.js ./
COPY --from=builder /app/apps/blog/package.json ./
COPY --from=builder /app/apps/blog/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/blog/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# 设置正确的权限
USER nextjs

# 暴露应用端口
EXPOSE 3000

# 设置健康检查
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# 启动应用
CMD ["node_modules/.bin/next", "start"]
