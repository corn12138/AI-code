#!/bin/bash

# ====================================================================
# AI-Code 测试快捷脚本
# 提供简单易用的测试命令接口
# ====================================================================

set -euo pipefail

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查项目根目录
check_project_root() {
    if [ ! -f "package.json" ] || [ ! -d "apps" ] || [ ! -d "testing" ]; then
        log_error "请在项目根目录运行此脚本"
        exit 1
    fi
}

# 检查 Python 环境
check_python_env() {
    if [ ! -f "testing/orchestrator/venv/bin/activate" ]; then
        log_warning "Python 虚拟环境未找到，正在创建..."
        cd testing/orchestrator
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
        cd ../..
        log_success "Python 环境创建完成"
    fi
}

# 运行 Python 测试编排器
run_orchestrator() {
    check_python_env
    cd testing/orchestrator
    source venv/bin/activate
    python main.py "$@"
    cd ../..
}

# 显示使用帮助
show_help() {
    cat << EOF
🧪 AI-Code 测试快捷脚本

用法: ./test.sh <命令> [选项]

基础命令:
  unit                   运行单元测试
  integration           运行集成测试
  e2e                   运行端到端测试
  contract              运行合约测试
  performance           运行性能测试
  security              运行安全测试
  all                   运行所有测试

开发命令:
  watch <app>           监视应用文件变更
  interactive           交互式测试选择
  status                查看系统状态
  health                健康检查

管理命令:
  flaky                 查看 flaky 测试列表
  retry                 重试失败的测试
  config                验证配置文件
  apps                  列出所有应用

高级选项:
  --app <name>          指定应用名称
  --changed-only        仅运行变更相关的测试
  --skip-flaky          跳过 flaky 测试
  --verbose             详细输出
  --debug               调试模式
  --parallel <n>        并行工作进程数
  --timeout <s>         超时时间（秒）

示例:
  ./test.sh unit                    # 运行所有单元测试
  ./test.sh unit --app blog         # 运行 blog 应用的单元测试
  ./test.sh e2e --verbose           # 详细模式运行 E2E 测试
  ./test.sh watch blog              # 监视 blog 应用
  ./test.sh all --changed-only      # 智能测试（仅变更）
  ./test.sh interactive             # 交互式选择
  ./test.sh flaky                   # 查看 flaky 测试

Docker 服务:
  ./test.sh docker up               # 启动测试服务
  ./test.sh docker down             # 停止测试服务
  ./test.sh docker logs             # 查看服务日志

更多信息:
  - 完整文档: testing/README.md
  - 快速开始: testing/docs/quick-start.md
  - 故障排除: testing/docs/troubleshooting.md
EOF
}

# Docker 服务管理
manage_docker() {
    case "${2:-help}" in
        "up")
            log_info "启动测试服务..."
            docker-compose -f testing/docker-compose.test.yml up -d
            log_success "测试服务已启动"
            ;;
        "down")
            log_info "停止测试服务..."
            docker-compose -f testing/docker-compose.test.yml down
            log_success "测试服务已停止"
            ;;
        "logs")
            docker-compose -f testing/docker-compose.test.yml logs -f
            ;;
        "ps"|"status")
            docker-compose -f testing/docker-compose.test.yml ps
            ;;
        "restart")
            log_info "重启测试服务..."
            docker-compose -f testing/docker-compose.test.yml restart
            log_success "测试服务已重启"
            ;;
        *)
            echo "Docker 命令:"
            echo "  ./test.sh docker up       # 启动服务"
            echo "  ./test.sh docker down     # 停止服务"
            echo "  ./test.sh docker logs     # 查看日志"
            echo "  ./test.sh docker ps       # 查看状态"
            echo "  ./test.sh docker restart  # 重启服务"
            ;;
    esac
}

# 主函数
main() {
    check_project_root
    
    # 如果没有参数，显示帮助
    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi
    
    case "$1" in
        # 基础测试命令
        "unit")
            shift
            log_info "运行单元测试..."
            run_orchestrator run --suite unit "$@"
            ;;
        "integration")
            shift
            log_info "运行集成测试..."
            run_orchestrator run --suite integration "$@"
            ;;
        "e2e")
            shift
            log_info "运行端到端测试..."
            run_orchestrator run --suite e2e "$@"
            ;;
        "contract")
            shift
            log_info "运行合约测试..."
            run_orchestrator run --suite contract "$@"
            ;;
        "performance")
            shift
            log_info "运行性能测试..."
            run_orchestrator run --suite performance "$@"
            ;;
        "security")
            shift
            log_info "运行安全测试..."
            run_orchestrator run --suite security "$@"
            ;;
        "all")
            shift
            log_info "运行所有测试..."
            run_orchestrator run --suite all "$@"
            ;;
            
        # 开发命令
        "watch")
            if [ -z "${2:-}" ]; then
                log_error "请指定要监视的应用名称"
                echo "示例: ./test.sh watch blog"
                exit 1
            fi
            log_info "启动监视模式: $2"
            run_orchestrator watch --app "$2" "${@:3}"
            ;;
        "interactive")
            log_info "启动交互式测试选择..."
            run_orchestrator interactive
            ;;
        "status")
            run_orchestrator status
            ;;
        "health")
            run_orchestrator health
            ;;
            
        # 管理命令
        "flaky")
            run_orchestrator flaky --list
            ;;
        "retry")
            shift
            run_orchestrator retry "$@"
            ;;
        "config")
            run_orchestrator config-validate
            ;;
        "apps")
            run_orchestrator list-apps
            ;;
            
        # Docker 管理
        "docker")
            manage_docker "$@"
            ;;
            
        # 帮助和其他
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "未知命令: $1"
            echo
            echo "运行 './test.sh help' 查看可用命令"
            exit 1
            ;;
    esac
}

# 错误处理
trap 'log_error "命令执行失败"; exit 1' ERR

# 运行主函数
main "$@"
