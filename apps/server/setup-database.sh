#!/bin/bash

# 显示执行的命令
set -x

# 确保Node环境变量已设置
if [ -z "$NODE_ENV" ]; then
  export NODE_ENV=development
  echo "NODE_ENV 未设置，默认使用 development 环境"
fi

echo "当前环境: $NODE_ENV"

# 第1步：检查数据库连接并创建数据库（如果不存在）
echo "===== 检查数据库连接并创建数据库 ====="
npx ts-node -r tsconfig-paths/register ./src/scripts/check-db-connection.ts

if [ $? -ne 0 ]; then
  echo "数据库连接或创建失败，脚本终止"
  exit 1
fi

# 第2步：使用手动SQL脚本初始化表结构
echo "===== 初始化数据库表结构 ====="
npm run db:init-manual

if [ $? -ne 0 ]; then
  echo "数据库表结构初始化失败，尝试使用ORM迁移"
  npm run migration:run
  
  if [ $? -ne 0 ]; then
    echo "ORM迁移也失败了，脚本终止"
    exit 1
  fi
fi

# 第3步：填充种子数据（使用简化版本）
echo "===== 填充种子数据 ====="
npm run db:seed:simple

if [ $? -ne 0 ]; then
  echo "填充种子数据失败，脚本终止"
  exit 1
fi

echo "===== 数据库设置完成！====="
echo "可以启动应用了"
