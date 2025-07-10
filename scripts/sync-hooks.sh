#!/bin/bash

# Hooks 同步脚本
# 用法: ./scripts/sync-hooks.sh [commit-message]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 检查是否在正确的目录
if [ ! -f "package.json" ] || [ ! -d "shared/hooks" ]; then
    echo -e "${RED}❌ 请在 AI-code 项目根目录运行此脚本${NC}"
    exit 1
fi

# 获取提交信息
COMMIT_MESSAGE=${1:-"sync: update hooks from monorepo"}

echo -e "${BLUE}🔄 开始同步 hooks 到独立仓库...${NC}"

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain shared/hooks)" ]; then
    echo -e "${YELLOW}⚠️  检测到 shared/hooks 有未提交的更改${NC}"
    git status shared/hooks
    
    read -p "是否要提交这些更改? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add shared/hooks
        git commit -m "$COMMIT_MESSAGE"
        echo -e "${GREEN}✅ 已提交更改${NC}"
    else
        echo -e "${RED}❌ 请先提交或暂存更改${NC}"
        exit 1
    fi
fi

# 检查远程仓库
if ! git remote get-url hooks-origin >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  添加 hooks 远程仓库...${NC}"
    git remote add hooks-origin https://github.com/corn12138/ai-code-hooks.git
fi

# 同步到独立仓库
echo -e "${BLUE}🚀 推送到独立仓库...${NC}"
if git subtree push --prefix=shared/hooks hooks-origin main; then
    echo -e "${GREEN}✅ 同步成功！${NC}"
    echo -e "${BLUE}🔗 创建 Release: https://github.com/corn12138/ai-code-hooks/releases/new${NC}"
else
    echo -e "${RED}❌ 同步失败，尝试强制推送...${NC}"
    git push hooks-origin `git subtree split --prefix=shared/hooks HEAD`:main --force
    echo -e "${GREEN}✅ 强制同步成功！${NC}"
fi