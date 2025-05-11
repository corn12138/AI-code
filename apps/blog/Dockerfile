# 第一阶段：依赖安装
FROM node:18-alpine AS deps
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/blog/package.json ./apps/blog/
COPY shared/ ./shared/
COPY config/ ./config/

RUN npm install -g pnpm && pnpm install --frozen-lockfile

# 第二阶段：构建
FROM node:18-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm install -g pnpm && pnpm build --filter blog

# 第三阶段：生产
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/apps/blog/next.config.js ./
COPY --from=builder /app/apps/blog/package.json ./
COPY --from=builder /app/apps/blog/public ./public
COPY --from=builder /app/apps/blog/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

USER node
EXPOSE 3000

CMD ["node_modules/.bin/next", "start"]
