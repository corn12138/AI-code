# 第一阶段：依赖安装
FROM node:18-alpine AS deps
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/server/package.json ./apps/server/
COPY shared/ ./shared/
COPY config/ ./config/

RUN npm install -g pnpm && pnpm install --frozen-lockfile

# 第二阶段：构建
FROM node:18-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm install -g pnpm && pnpm build --filter server

# 第三阶段：生产
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/apps/server/package.json ./
COPY --from=builder /app/node_modules ./node_modules

USER node
EXPOSE 3001

CMD ["node", "dist/main"]
