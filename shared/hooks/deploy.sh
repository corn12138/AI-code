#!/bin/bash

# AI-Code Hooks 文档站点部署脚本
# 支持多种部署方式

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# 脚本配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="ai-code-hooks-docs"
DEFAULT_PORT=8080

# 显示帮助信息
show_help() {
    echo -e "${BLUE}AI-Code Hooks 文档部署脚本${NC}"
    echo ""
    echo "用法: $0 [选项] <部署类型>"
    echo ""
    echo "部署类型:"
    echo "  local      - 本地开发部署"
    echo "  docker     - Docker 容器部署"
    echo "  production - 生产环境部署（带SSL）"
    echo "  build      - 仅构建不部署"
    echo "  clean      - 清理资源"
    echo ""
    echo "选项:"
    echo "  -p, --port PORT    指定端口 (默认: $DEFAULT_PORT)"
    echo "  -d, --domain DOMAIN  指定域名（生产环境）"
    echo "  -h, --help         显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 local                    # 本地开发"
    echo "  $0 docker -p 3000          # Docker部署到3000端口"
    echo "  $0 production -d docs.example.com  # 生产部署"
}

# 检查依赖
check_dependencies() {
    local deps=("$@")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            echo -e "${RED}❌ 缺少依赖: $dep${NC}"
            echo -e "${YELLOW}请安装 $dep 后重试${NC}"
            exit 1
        fi
    done
}

# 本地开发部署
deploy_local() {
    echo -e "${BLUE}🚀 启动本地开发环境...${NC}"
    
    check_dependencies "npm"
    
    # 安装依赖
    echo -e "${YELLOW}📦 安装依赖...${NC}"
    npm install --legacy-peer-deps
    
    # 启动开发服务器
    echo -e "${YELLOW}🔥 启动开发服务器...${NC}"
    echo -e "${GREEN}访问地址: http://localhost:8000${NC}"
    npm run dev
}

# Docker 部署
deploy_docker() {
    local port=${1:-$DEFAULT_PORT}
    
    echo -e "${BLUE}🐳 Docker 容器部署...${NC}"
    
    check_dependencies "docker" "docker-compose"
    
    # 检查端口是否被占用
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}❌ 端口 $port 已被占用${NC}"
        echo -e "${YELLOW}请使用 -p 参数指定其他端口${NC}"
        exit 1
    fi
    
    # 设置环境变量
    export DOCS_PORT=$port
    export COMPOSE_PROJECT_NAME=$PROJECT_NAME
    
    # 构建并启动
    echo -e "${YELLOW}🔨 构建 Docker 镜像...${NC}"
    docker-compose build docs
    
    echo -e "${YELLOW}🚀 启动容器...${NC}"
    docker-compose up -d docs
    
    # 等待容器启动
    echo -e "${YELLOW}⏳ 等待服务启动...${NC}"
    sleep 10
    
    # 健康检查
    if curl -f http://localhost:$port/health &>/dev/null; then
        echo -e "${GREEN}✅ 部署成功！${NC}"
        echo -e "${GREEN}📖 访问地址: http://localhost:$port${NC}"
        echo -e "${BLUE}📊 查看日志: docker-compose logs -f docs${NC}"
        echo -e "${BLUE}🛑 停止服务: docker-compose down${NC}"
    else
        echo -e "${RED}❌ 部署失败，请检查日志${NC}"
        docker-compose logs docs
        exit 1
    fi
}

# 生产环境部署
deploy_production() {
    local domain=$1
    local port=${2:-$DEFAULT_PORT}
    
    if [[ -z "$domain" ]]; then
        echo -e "${RED}❌ 生产环境部署需要指定域名${NC}"
        echo -e "${YELLOW}使用: $0 production -d your-domain.com${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}🏭 生产环境部署到: $domain${NC}"
    
    check_dependencies "docker" "docker-compose"
    
    # 更新 Caddyfile 配置
    echo -e "${YELLOW}🔧 配置 SSL 证书...${NC}"
    cat > Caddyfile << EOF
$domain {
    reverse_proxy docs:80
    
    encode gzip
    
    header {
        X-Frame-Options "SAMEORIGIN"
        X-XSS-Protection "1; mode=block"
        X-Content-Type-Options "nosniff"
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        Referrer-Policy "strict-origin-when-cross-origin"
    }
    
    @static {
        path *.js *.css *.png *.jpg *.jpeg *.gif *.ico *.svg *.woff *.woff2 *.ttf *.eot
    }
    header @static Cache-Control "public, max-age=31536000"
    
    log {
        output file /var/log/caddy/access.log
        format json
    }
}
EOF
    
    # 设置环境变量
    export DOCS_PORT=$port
    export DOCS_DOMAIN=$domain
    export COMPOSE_PROJECT_NAME=$PROJECT_NAME
    
    # 启动生产环境
    echo -e "${YELLOW}🚀 启动生产环境...${NC}"
    docker-compose --profile ssl up -d
    
    # 等待服务启动
    echo -e "${YELLOW}⏳ 等待 SSL 证书配置...${NC}"
    sleep 30
    
    echo -e "${GREEN}✅ 生产环境部署完成！${NC}"
    echo -e "${GREEN}🌐 访问地址: https://$domain${NC}"
    echo -e "${BLUE}📊 查看日志: docker-compose logs -f${NC}"
}

# 仅构建
build_only() {
    echo -e "${BLUE}🔨 构建文档...${NC}"
    
    check_dependencies "npm"
    
    # 安装依赖
    npm install --legacy-peer-deps
    
    # 构建
    npm run docs:build
    
    echo -e "${GREEN}✅ 构建完成！${NC}"
    echo -e "${BLUE}📁 构建产物: docs-dist/${NC}"
}

# 清理资源
clean_resources() {
    echo -e "${BLUE}🧹 清理资源...${NC}"
    
    # 停止并删除容器
    if command -v docker-compose &> /dev/null; then
        docker-compose down -v --remove-orphans
        docker-compose --profile ssl down -v --remove-orphans
    fi
    
    # 清理 Docker 镜像
    if command -v docker &> /dev/null; then
        echo -e "${YELLOW}🗑️ 清理 Docker 镜像...${NC}"
        docker images | grep $PROJECT_NAME | awk '{print $3}' | xargs -r docker rmi -f
    fi
    
    # 清理构建产物
    if [[ -d "docs-dist" ]]; then
        rm -rf docs-dist
        echo -e "${YELLOW}🗑️ 清理构建产物...${NC}"
    fi
    
    echo -e "${GREEN}✅ 清理完成！${NC}"
}

# 主函数
main() {
    local command=""
    local port=$DEFAULT_PORT
    local domain=""
    
    # 解析参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -p|--port)
                port="$2"
                shift 2
                ;;
            -d|--domain)
                domain="$2"
                shift 2
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            local|docker|production|build|clean)
                command="$1"
                shift
                ;;
            *)
                echo -e "${RED}❌ 未知参数: $1${NC}"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 检查命令
    if [[ -z "$command" ]]; then
        echo -e "${RED}❌ 请指定部署类型${NC}"
        show_help
        exit 1
    fi
    
    # 切换到脚本目录
    cd "$SCRIPT_DIR"
    
    # 执行对应命令
    case $command in
        local)
            deploy_local
            ;;
        docker)
            deploy_docker "$port"
            ;;
        production)
            deploy_production "$domain" "$port"
            ;;
        build)
            build_only
            ;;
        clean)
            clean_resources
            ;;
    esac
}

# 执行主函数
main "$@" 