#!/bin/bash

# 🚀 Git Subtree 提取脚本 - 将 shared/hooks 提取为独立仓库
# 使用方法: ./extract-hooks.sh <github-repo-url>

set -e  # 出错时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印彩色消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查参数
if [ $# -eq 0 ]; then
    print_error "请提供 GitHub 仓库 URL"
    echo "使用方法: ./extract-hooks.sh https://github.com/corn12138/ai-code-hooks.git"
    exit 1
fi

REPO_URL=$1
HOOKS_DIR="shared/hooks"
TEMP_DIR="temp-hooks-repo"

print_info "开始 Git Subtree 提取流程..."
print_info "源目录: $HOOKS_DIR"
print_info "目标仓库: $REPO_URL"

# 第一步：检查当前状态
print_info "检查 Git 状态..."
if [[ -n $(git status --porcelain) ]]; then
    print_warning "工作区有未提交的更改，请先提交或储藏"
    git status --short
    exit 1
fi

# 第二步：创建临时目录
print_info "创建临时工作目录..."
if [ -d "$TEMP_DIR" ]; then
    print_warning "临时目录已存在，正在删除..."
    rm -rf "$TEMP_DIR"
fi

# 第三步：使用 git subtree 提取
print_info "使用 git subtree 提取 $HOOKS_DIR..."
git subtree push --prefix="$HOOKS_DIR" origin hooks-standalone || {
    print_info "创建新的 subtree 分支..."
    git subtree split --prefix="$HOOKS_DIR" -b hooks-standalone
}

# 第四步：克隆到临时目录
print_info "创建独立仓库..."
git clone . "$TEMP_DIR" --branch hooks-standalone --single-branch

# 进入临时目录
cd "$TEMP_DIR"

# 第五步：清理和设置
print_info "设置独立仓库..."

# 创建新的 .gitignore (针对独立仓库)
cat > .gitignore << EOL
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Build outputs
dist/
build/
*.tsbuildinfo

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/

# Dumi
.dumi/tmp/

# Rollup cache
.rollup.cache/

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock
EOL

# 更新 package.json 中的仓库信息
print_info "更新 package.json 仓库信息..."
if command -v jq &> /dev/null; then
    # 如果有 jq，使用 jq 更新
    REPO_NAME=$(basename "$REPO_URL" .git)
    USERNAME=$(basename $(dirname "$REPO_URL"))
    
    jq --arg url "$REPO_URL" \
       --arg bugs "${REPO_URL//.git/}/issues" \
       --arg homepage "https://${USERNAME}.github.io/${REPO_NAME}" \
       '.repository.url = $url | .bugs.url = $bugs | .homepage = $homepage' \
       package.json > package.json.tmp && mv package.json.tmp package.json
else
    print_warning "未安装 jq，请手动更新 package.json 中的仓库信息"
fi

# 提交更改
print_info "提交独立仓库的初始配置..."
git add .
git commit -m "feat: initial independent repository setup

- Add repository-specific .gitignore
- Update package.json repository URLs
- Ready for independent development and npm publishing"

# 第六步：添加远程仓库并推送
print_info "添加远程仓库..."
git remote remove origin
git remote add origin "$REPO_URL"

print_info "推送到 GitHub..."
git push -u origin main

# 第七步：清理
cd ..
print_info "清理临时文件..."
rm -rf "$TEMP_DIR"

# 清理本地分支
git branch -D hooks-standalone 2>/dev/null || true

print_success "🎉 Git Subtree 提取完成!"
echo ""
print_info "下一步操作:"
echo "1. 访问 $REPO_URL 确认代码已推送"
echo "2. 配置 GitHub Actions secrets (NPM_TOKEN)"
echo "3. 创建第一个 Release 来触发 NPM 发布"
echo "4. 运行: npm publish (如果手动发布)"
echo ""
print_success "您的 hooks 库现在是一个独立的仓库了！" 