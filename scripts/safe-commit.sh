#!/bin/bash

# 安全代码提交脚本
# 用法: ./scripts/safe-commit.sh [commit_message]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否在Git仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}错误: 当前目录不是Git仓库${NC}"
    exit 1
fi

echo -e "${GREEN}🔒 开始安全检查...${NC}"

# 检查敏感文件
SENSITIVE_FILES=(
    ".env"
    "apps/server/.env"
    "apps/server/.env.prod"
    "apps/blog/.env"
    "apps/blog/.env.local"
    "apps/blog/.env.backup"
    "ai-code-testing.yml"
    "testing/config.yml"
)

echo -e "${YELLOW}检查敏感文件...${NC}"
for file in "${SENSITIVE_FILES[@]}"; do
    if [ -f "$file" ]; then
        if git ls-files --error-unmatch "$file" >/dev/null 2>&1; then
            echo -e "${RED}❌ 发现敏感文件被Git跟踪: $file${NC}"
            echo -e "${YELLOW}建议执行: git rm --cached $file${NC}"
            exit 1
        else
            echo -e "${GREEN}✅ $file 未被Git跟踪${NC}"
        fi
    fi
done

# 检查是否包含敏感关键词
echo -e "${YELLOW}检查代码中的敏感关键词...${NC}"
SENSITIVE_PATTERNS=(
    "password.*=.*[a-zA-Z0-9_]{8,}"
    "secret.*=.*[a-zA-Z0-9_]{16,}"
    "key.*=.*[a-zA-Z0-9_]{16,}"
    "token.*=.*[a-zA-Z0-9_]{16,}"
    "api_key.*=.*[a-zA-Z0-9_]{16,}"
)

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if git diff --cached --name-only | xargs grep -l "$pattern" 2>/dev/null; then
        echo -e "${RED}❌ 发现敏感关键词: $pattern${NC}"
        echo -e "${YELLOW}请检查暂存区的文件并移除敏感信息${NC}"
        exit 1
    fi
done

# 检查环境变量文件
echo -e "${YELLOW}检查环境变量文件...${NC}"
if find . -name ".env*" -type f | grep -v node_modules | grep -v .git; then
    echo -e "${YELLOW}⚠️  发现环境变量文件，请确保它们没有被提交${NC}"
    find . -name ".env*" -type f | grep -v node_modules | grep -v .git
fi

# 检查文件大小
echo -e "${YELLOW}检查大文件...${NC}"
LARGE_FILES=$(find . -type f -size +10M -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null || true)
if [ -n "$LARGE_FILES" ]; then
    echo -e "${YELLOW}⚠️  发现大文件 (>10MB):${NC}"
    echo "$LARGE_FILES"
    echo -e "${YELLOW}请考虑使用Git LFS或移除这些文件${NC}"
fi

# 检查提交消息
COMMIT_MESSAGE="$1"
if [ -z "$COMMIT_MESSAGE" ]; then
    echo -e "${YELLOW}请输入提交消息:${NC}"
    read -r COMMIT_MESSAGE
fi

# 检查提交消息格式
if [[ ! "$COMMIT_MESSAGE" =~ ^(feat|fix|docs|style|refactor|test|chore|security)(\(.+\))?: ]]; then
    echo -e "${YELLOW}⚠️  提交消息格式建议: type(scope): description${NC}"
    echo -e "${YELLOW}类型: feat, fix, docs, style, refactor, test, chore, security${NC}"
    echo -e "${YELLOW}示例: feat(auth): add JWT authentication${NC}"
fi

# 显示暂存的文件
echo -e "${YELLOW}暂存的文件:${NC}"
git diff --cached --name-only

# 确认提交
echo -e "${YELLOW}是否确认提交? (y/N)${NC}"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    git commit -m "$COMMIT_MESSAGE"
    echo -e "${GREEN}✅ 提交成功!${NC}"
else
    echo -e "${YELLOW}提交已取消${NC}"
    exit 0
fi

echo -e "${GREEN}🎉 安全检查完成，代码已安全提交!${NC}"
