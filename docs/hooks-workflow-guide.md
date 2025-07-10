#!/bin/bash

# Hooks 同步脚本
# 用法: ./scripts/sync-hooks.sh [message]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查是否在正确的目录
if [ ! -f "package.json" ] || [ ! -d "shared/hooks" ]; then
    echo -e "${RED}❌ 请在 AI-code 项目根目录运行此脚本${NC}"
    exit 1
fi

# 获取提交信息
COMMIT_MESSAGE=${1:-"sync: update hooks from monorepo"}

echo -e "${BLUE}🔄 开始同步 hooks 到独立仓库...${NC}"

# 检查 shared/hooks 是否有未提交的更改
if [ -n "$(git status --porcelain shared/hooks)" ]; then
    echo -e "${YELLOW}⚠️  检测到 shared/hooks 有未提交的更改${NC}"
    echo -e "${YELLOW}📋 当前状态:${NC}"
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

# 检查远程仓库配置
if ! git remote get-url hooks-origin >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  未找到 hooks-origin 远程仓库，正在添加...${NC}"
    git remote add hooks-origin https://github.com/corn12138/ai-code-hooks.git
    echo -e "${GREEN}✅ 已添加 hooks-origin 远程仓库${NC}"
fi

# 同步到独立仓库
echo -e "${BLUE}🚀 推送到独立仓库...${NC}"
if git subtree push --prefix=shared/hooks hooks-origin main; then
    echo -e "${GREEN}✅ 同步成功！${NC}"
    echo -e "${GREEN}📦 现在可以在 GitHub 上创建 Release 进行发布${NC}"
    echo -e "${BLUE}🔗 访问: https://github.com/corn12138/ai-code-hooks/releases/new${NC}"
else
    echo -e "${RED}❌ 同步失败${NC}"
    echo -e "${YELLOW}💡 提示: 如果遇到冲突，可以尝试使用 --force 参数${NC}"
    echo -e "${YELLOW}⚠️  强制推送命令: git subtree push --prefix=shared/hooks hooks-origin main --force${NC}"
    exit 1
fi 