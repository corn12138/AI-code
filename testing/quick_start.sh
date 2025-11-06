#!/bin/bash
# AI-Code 企业级测试系统快速启动脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 打印标题
print_title() {
    echo ""
    print_message $PURPLE "🚀 AI-Code 企业级测试系统"
    print_message $PURPLE "=================================="
    echo ""
}

# 检查依赖
check_dependencies() {
    print_message $BLUE "🔍 检查系统依赖..."
    
    # 检查 Python
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
        print_message $GREEN "✅ Python: $PYTHON_VERSION"
    else
        print_message $RED "❌ Python 3 未安装"
        exit 1
    fi
    
    # 检查 Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_message $GREEN "✅ Node.js: $NODE_VERSION"
    else
        print_message $RED "❌ Node.js 未安装"
        exit 1
    fi
    
    # 检查 pnpm
    if command -v pnpm &> /dev/null; then
        PNPM_VERSION=$(pnpm --version)
        print_message $GREEN "✅ pnpm: $PNPM_VERSION"
    else
        print_message $YELLOW "⚠️  pnpm 未安装，正在安装..."
        npm install -g pnpm
    fi
    
    # 检查 Git
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version | cut -d' ' -f3)
        print_message $GREEN "✅ Git: $GIT_VERSION"
    else
        print_message $RED "❌ Git 未安装"
        exit 1
    fi
    
    echo ""
}

# 安装 Python 依赖
install_python_deps() {
    print_message $BLUE "📦 安装 Python 依赖..."
    
    if [ -f "requirements.txt" ]; then
        pip3 install -r requirements.txt
        print_message $GREEN "✅ Python 依赖安装完成"
    else
        print_message $YELLOW "⚠️  requirements.txt 不存在，跳过 Python 依赖安装"
    fi
    
    echo ""
}

# 安装 Node.js 依赖
install_node_deps() {
    print_message $BLUE "📦 安装 Node.js 依赖..."
    
    # 安装根目录依赖
    if [ -f "package.json" ]; then
        pnpm install
        print_message $GREEN "✅ 根目录依赖安装完成"
    fi
    
    # 安装各应用依赖
    for app in apps/*/; do
        if [ -f "${app}package.json" ]; then
            app_name=$(basename "$app")
            print_message $BLUE "  📱 安装 $app_name 依赖..."
            (cd "$app" && pnpm install)
        fi
    done
    
    print_message $GREEN "✅ 所有依赖安装完成"
    echo ""
}

# 设置测试环境
setup_test_environment() {
    print_message $BLUE "🔧 设置测试环境..."
    
    # 创建必要目录
    mkdir -p testing/reports/{html,json,junit,allure}
    mkdir -p testing/logs
    mkdir -p testing/temp
    mkdir -p testing/data
    
    # 设置环境变量
    export NODE_ENV=test
    export TEST_ENV=true
    export CI=true
    
    print_message $GREEN "✅ 测试环境设置完成"
    echo ""
}

# 运行测试
run_tests() {
    local test_type=$1
    local apps=$2
    
    print_message $BLUE "🧪 运行测试..."
    
    # 构建命令
    cmd="python3 testing/run_tests.py"
    
    if [ -n "$apps" ]; then
        cmd="$cmd --apps $apps"
    fi
    
    if [ -n "$test_type" ]; then
        cmd="$cmd --types $test_type"
    fi
    
    print_message $CYAN "执行命令: $cmd"
    echo ""
    
    # 执行测试
    eval $cmd
    
    echo ""
    print_message $GREEN "✅ 测试执行完成"
}

# 显示帮助信息
show_help() {
    print_message $CYAN "使用方法:"
    echo "  $0 [选项]"
    echo ""
    print_message $CYAN "选项:"
    echo "  --setup-only     只设置环境，不运行测试"
    echo "  --unit           运行单元测试"
    echo "  --integration    运行集成测试"
    echo "  --e2e           运行端到端测试"
    echo "  --all           运行所有测试"
    echo "  --apps <apps>   指定要测试的应用 (用空格分隔)"
    echo "  --help          显示此帮助信息"
    echo ""
    print_message $CYAN "示例:"
    echo "  $0 --setup-only"
    echo "  $0 --unit"
    echo "  $0 --integration --apps blog server"
    echo "  $0 --all"
}

# 主函数
main() {
    print_title
    
    # 解析参数
    SETUP_ONLY=false
    TEST_TYPE=""
    APPS=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --setup-only)
                SETUP_ONLY=true
                shift
                ;;
            --unit)
                TEST_TYPE="unit"
                shift
                ;;
            --integration)
                TEST_TYPE="integration"
                shift
                ;;
            --e2e)
                TEST_TYPE="e2e"
                shift
                ;;
            --all)
                TEST_TYPE="unit integration e2e"
                shift
                ;;
            --apps)
                APPS="$2"
                shift 2
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                print_message $RED "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 检查依赖
    check_dependencies
    
    # 安装依赖
    install_python_deps
    install_node_deps
    
    # 设置环境
    setup_test_environment
    
    # 如果只是设置环境，则退出
    if [ "$SETUP_ONLY" = true ]; then
        print_message $GREEN "🎉 环境设置完成！"
        exit 0
    fi
    
    # 运行测试
    if [ -n "$TEST_TYPE" ]; then
        run_tests "$TEST_TYPE" "$APPS"
    else
        print_message $YELLOW "⚠️  未指定测试类型，运行默认测试..."
        run_tests "unit" "$APPS"
    fi
    
    print_message $GREEN "🎉 所有操作完成！"
}

# 执行主函数
main "$@"
