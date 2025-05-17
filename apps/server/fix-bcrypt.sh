#!/bin/bash

echo "开始修复bcrypt..."

# 删除node_modules中的bcrypt
rm -rf node_modules/.pnpm/bcrypt*

# 重新安装依赖
echo "重新安装依赖..."
pnpm install

# 手动重建bcrypt
echo "手动重建bcrypt..."
cd node_modules/bcrypt
npm rebuild

echo "bcrypt修复完成！"
