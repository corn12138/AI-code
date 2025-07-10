#!/bin/bash

# Hooks 发布脚本
# 用法: ./scripts/publish-hooks.sh [version] [message]

set -e

VERSION=${1:-"patch"}
MESSAGE=${2:-"Update hooks"}

echo "🔄 同步到独立仓库..."
./scripts/sync-hooks.sh "$MESSAGE"

echo "📦 准备发布版本..."
if command -v gh &> /dev/null; then
    # 使用 GitHub CLI 创建 release
    cd /tmp
    git clone https://github.com/corn12138/ai-code-hooks.git
    cd ai-code-hooks
    
    # 更新版本号
    npm version $VERSION --no-git-tag-version
    NEW_VERSION=$(node -p "require('./package.json').version")
    
    # 提交版本更新
    git add package.json
    git commit -m "chore: bump version to $NEW_VERSION"
    git push
    
    # 创建 release
    gh release create "v$NEW_VERSION" --title "v$NEW_VERSION" --notes "$MESSAGE"
    
    cd /tmp && rm -rf ai-code-hooks
    echo "✅ 已发布版本 v$NEW_VERSION"
else
    echo "⚠️  请手动在 GitHub 上创建 Release"
    echo "🔗 https://github.com/corn12138/ai-code-hooks/releases/new"
fi