#!/bin/bash

echo "🔍 项目健康检查..."

echo "1. 检查重复文件夹..."
if [ -d "components/" ]; then echo "⚠️  发现重复: components/"; fi
if [ -d "types/" ]; then echo "⚠️  发现重复: types/"; fi  
if [ -d "utils/" ]; then echo "⚠️  发现重复: utils/"; fi

echo "2. 依赖检查..."
pnpm install --dry-run

echo "3. 类型检查..." 
pnpm run type-check

echo "4. 构建检查..."
pnpm --filter '*' run build --dry-run

echo "✅ 检查完成！" 