#!/bin/bash

# 清理Next.js缓存
echo "Cleaning Next.js cache..."
rm -rf .next/cache

# 确保.next目录存在并有正确权限
mkdir -p .next/cache/webpack
chmod -R 755 .next

echo "Cache cleaned successfully!"
