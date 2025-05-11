# 第一阶段：依赖安装
FROM node:18-alpine AS deps
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/lowcode/package.json ./apps/lowcode/
COPY shared/ ./shared/
COPY config/ ./config/

RUN npm install -g pnpm && pnpm install --frozen-lockfile

# 第二阶段：构建
FROM node:18-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm install -g pnpm && pnpm build --filter lowcode

# 第三阶段：生产
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

COPY --from=builder /app/apps/lowcode/dist .
COPY apps/lowcode/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3002

CMD ["nginx", "-g", "daemon off;"]
