#!/bin/bash

# ====================================================================
# AI-Code 测试环境设置脚本
# 自动化设置完整的测试环境
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

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请安装 Node.js >= 18.0.0"
        exit 1
    fi
    
    local node_version=$(node --version | sed 's/v//')
    log_info "Node.js 版本: $node_version"
    
    # 检查 pnpm
    if ! command -v pnpm &> /dev/null; then
        log_warning "pnpm 未安装，正在安装..."
        npm install -g pnpm
    fi
    
    # 检查 Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 未安装，请安装 Python >= 3.11"
        exit 1
    fi
    
    local python_version=$(python3 --version | awk '{print $2}')
    log_info "Python 版本: $python_version"
    
    # 检查 Docker
    if ! command -v docker &> /dev/null; then
        log_warning "Docker 未安装，部分功能可能不可用"
    else
        log_info "Docker 版本: $(docker --version)"
    fi
    
    # 检查 Git
    if ! command -v git &> /dev/null; then
        log_error "Git 未安装"
        exit 1
    fi
    
    log_success "依赖检查完成"
}

# 设置 Python 环境
setup_python_env() {
    log_info "设置 Python 测试编排器环境..."
    
    cd testing/orchestrator
    
    # 创建虚拟环境
    if [ ! -d "venv" ]; then
        log_info "创建 Python 虚拟环境..."
        python3 -m venv venv
    fi
    
    # 激活虚拟环境
    source venv/bin/activate
    
    # 升级 pip
    pip install --upgrade pip
    
    # 安装依赖
    log_info "安装 Python 依赖..."
    pip install -r requirements.txt
    
    log_success "Python 环境设置完成"
    
    cd ../..
}

# 设置 Node.js 环境
setup_node_env() {
    log_info "设置 Node.js 环境..."
    
    # 安装根依赖
    log_info "安装根目录依赖..."
    pnpm install
    
    # 安装测试相关依赖
    log_info "安装测试依赖..."
    
    # Playwright
    if ! command -v playwright &> /dev/null; then
        log_info "安装 Playwright..."
        pnpm add -D playwright @playwright/test
        npx playwright install
    fi
    
    # Jest 和相关工具
    pnpm add -D jest @types/jest jest-environment-jsdom
    pnpm add -D @testing-library/react @testing-library/jest-dom
    pnpm add -D vitest @vitest/ui jsdom
    
    log_success "Node.js 环境设置完成"
}

# 设置测试数据库
setup_test_database() {
    log_info "设置测试数据库..."
    
    if command -v docker &> /dev/null; then
        log_info "使用 Docker 启动测试数据库..."
        
        # 启动测试服务
        docker-compose -f testing/docker-compose.test.yml up -d postgres-test redis-test
        
        # 等待服务启动
        log_info "等待数据库启动..."
        sleep 10
        
        # 检查数据库连接
        if docker-compose -f testing/docker-compose.test.yml exec -T postgres-test pg_isready -U test_user -d test_db; then
            log_success "测试数据库启动成功"
        else
            log_warning "测试数据库启动失败，将使用本地数据库"
        fi
    else
        log_warning "Docker 不可用，请手动配置测试数据库"
        log_info "请创建数据库: test_db"
        log_info "用户名: test_user"
        log_info "密码: test_password"
    fi
}

# 设置环境变量
setup_env_files() {
    log_info "设置环境变量文件..."
    
    # 创建测试环境变量模板
    local apps=("blog" "server" "mobile")
    
    for app in "${apps[@]}"; do
        local app_path="apps/$app"
        local env_test_file="$app_path/.env.test"
        
        if [ -d "$app_path" ] && [ ! -f "$env_test_file" ]; then
            log_info "创建 $env_test_file..."
            
            cat > "$env_test_file" << EOF
# 测试环境配置
NODE_ENV=test
DATABASE_URL=postgresql://test_user:test_password@localhost:5433/test_db
REDIS_URL=redis://localhost:6380
JWT_SECRET=test_jwt_secret_key_for_testing_only
API_BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# 测试专用配置
TEST_TIMEOUT=30000
TEST_PARALLEL=true
DISABLE_RATE_LIMITING=true
DISABLE_NOTIFICATIONS=true

# 外部服务（测试模式）
MAIL_PROVIDER=mailhog
MAIL_HOST=localhost
MAIL_PORT=1026
STORAGE_PROVIDER=local
EOF
        fi
    done
    
    log_success "环境变量文件设置完成"
}

# 创建测试配置文件
setup_test_configs() {
    log_info "创建测试配置文件..."
    
    # Jest 配置
    if [ ! -f "jest.config.js" ]; then
        cat > "jest.config.js" << EOF
module.exports = {
  projects: [
    '<rootDir>/apps/*/jest.config.js',
    '<rootDir>/shared/*/jest.config.js'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 75,
      statements: 75
    }
  }
};
EOF
    fi
    
    # Playwright 配置
    if [ ! -f "playwright.config.ts" ]; then
        cat > "playwright.config.ts" << EOF
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './testing/suites/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'testing/reports/playwright' }],
    ['json', { outputFile: 'testing/reports/json/playwright.json' }],
    ['junit', { outputFile: 'testing/reports/junit/playwright.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    }
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  }
});
EOF
    fi
    
    log_success "测试配置文件创建完成"
}

# 设置 Git hooks
setup_git_hooks() {
    log_info "设置 Git hooks..."
    
    if [ -d ".git" ]; then
        # 创建 pre-commit hook
        cat > ".git/hooks/pre-commit" << EOF
#!/bin/bash
# 运行测试和代码检查

echo "运行 pre-commit 检查..."

# 运行 lint 检查
pnpm lint:check || exit 1

# 运行单元测试
python testing/orchestrator/main.py run --suite unit --changed-only || exit 1

echo "✅ Pre-commit 检查通过"
EOF
        
        chmod +x ".git/hooks/pre-commit"
        log_success "Git hooks 设置完成"
    else
        log_warning "不是 Git 仓库，跳过 Git hooks 设置"
    fi
}

# 创建快捷脚本
create_shortcuts() {
    log_info "创建快捷脚本..."
    
    # 创建测试运行脚本
    cat > "test.sh" << EOF
#!/bin/bash
# 测试快捷脚本

case "\$1" in
    "unit")
        python testing/orchestrator/main.py run --suite unit
        ;;
    "integration")
        python testing/orchestrator/main.py run --suite integration
        ;;
    "e2e")
        python testing/orchestrator/main.py run --suite e2e
        ;;
    "all")
        python testing/orchestrator/main.py run --suite all
        ;;
    "watch")
        python testing/orchestrator/main.py watch --app \${2:-blog}
        ;;
    "flaky")
        python testing/orchestrator/main.py flaky --list
        ;;
    *)
        echo "用法: ./test.sh [unit|integration|e2e|all|watch|flaky]"
        echo "示例: ./test.sh unit"
        echo "示例: ./test.sh watch blog"
        ;;
esac
EOF
    
    chmod +x "test.sh"
    
    log_success "快捷脚本创建完成"
}

# 验证安装
verify_installation() {
    log_info "验证安装..."
    
    # 验证 Python 环境
    cd testing/orchestrator
    source venv/bin/activate
    if python main.py config-validate; then
        log_success "Python 测试编排器验证通过"
    else
        log_error "Python 测试编排器验证失败"
        return 1
    fi
    cd ../..
    
    # 验证 Node.js 环境
    if pnpm test:unit --dry-run 2>/dev/null; then
        log_success "Node.js 测试环境验证通过"
    else
        log_warning "Node.js 测试环境验证失败，可能需要手动配置"
    fi
    
    log_success "安装验证完成"
}

# 显示使用指南
show_usage() {
    log_success "🎉 AI-Code 测试环境设置完成！"
    echo
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📚 快速开始指南"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo
    echo "🧪 运行测试:"
    echo "  ./test.sh unit              # 单元测试"
    echo "  ./test.sh integration       # 集成测试"
    echo "  ./test.sh e2e               # 端到端测试"
    echo "  ./test.sh all               # 完整测试套件"
    echo
    echo "👀 开发模式:"
    echo "  ./test.sh watch blog        # 监视 blog 应用"
    echo "  pnpm test:watch             # Jest 监视模式"
    echo
    echo "🔧 管理工具:"
    echo "  python testing/orchestrator/main.py status      # 查看状态"
    echo "  python testing/orchestrator/main.py flaky --list # 查看 flaky 测试"
    echo "  python testing/orchestrator/main.py health      # 健康检查"
    echo
    echo "📊 查看报告:"
    echo "  open testing/reports/html/index.html           # HTML 报告"
    echo "  open testing/reports/playwright/index.html     # E2E 报告"
    echo
    echo "🐳 Docker 服务:"
    echo "  docker-compose -f testing/docker-compose.test.yml up -d    # 启动"
    echo "  docker-compose -f testing/docker-compose.test.yml down     # 停止"
    echo
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📖 详细文档: testing/README.md"
    echo "🐛 问题报告: testing/docs/troubleshooting.md"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# 主函数
main() {
    echo "🧪 AI-Code 测试环境设置开始..."
    echo
    
    # 检查是否在项目根目录
    if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
        log_error "请在项目根目录运行此脚本"
        exit 1
    fi
    
    # 执行设置步骤
    check_dependencies
    setup_python_env
    setup_node_env
    setup_test_database
    setup_env_files
    setup_test_configs
    setup_git_hooks
    create_shortcuts
    verify_installation
    
    echo
    show_usage
}

# 错误处理
trap 'log_error "设置过程中发生错误，请检查日志"; exit 1' ERR

# 运行主函数
main "$@"
