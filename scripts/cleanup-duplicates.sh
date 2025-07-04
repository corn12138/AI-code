#!/bin/bash

echo "🧹 开始清理重复文件..."

# 删除根目录重复的文件夹
echo "删除根目录重复文件夹..."
rm -rf components/
rm -rf types/
rm -rf utils/

# 清理空的或重复的配置文件
echo "清理重复配置..."

# 创建备份
echo "创建备份..."
mkdir -p .backup/$(date +%Y%m%d_%H%M%S)
cp -r components/ .backup/$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || echo "components/ 不存在"
cp -r types/ .backup/$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || echo "types/ 不存在"  
cp -r utils/ .backup/$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || echo "utils/ 不存在"

# 检查内容差异
echo "=== 检查 components/ 与 shared/components/ 的差异 ==="
if [ -d "components/" ] && [ -d "shared/components/" ]; then
    diff -r components/ shared/components/ || echo "发现差异，需要手动合并"
fi

echo "=== 检查 types/ 与 shared/types/ 的差异 ==="  
if [ -d "types/" ] && [ -d "shared/types/" ]; then
    diff -r types/ shared/types/ || echo "发现差异，需要手动合并"
fi

echo "=== 检查 utils/ 与 shared/utils/ 的差异 ==="
if [ -d "utils/" ] && [ -d "shared/utils/" ]; then
    diff -r utils/ shared/utils/ || echo "发现差异，需要手动合并"
fi

echo "✅ 清理完成！"
echo "请检查项目是否正常运行，如有问题可从 .backup/ 恢复" 