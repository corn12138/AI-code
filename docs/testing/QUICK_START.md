# 🚀 AI-Code 自动化测试快速开始指南

本指南将帮助你快速设置和运行 AI-Code Monorepo 的完整自动化测试体系。

## 📋 前置要求

### 系统要求
- **Node.js**: >= 18.0.0
- **Python**: >= 3.11
- **pnpm**: >= 8.0.0
- **Git**: 最新版本

### 数据库要求
- **PostgreSQL**: >= 13 (用于集成测试)
- **Redis**: >= 6 (可选，用于缓存测试)

## 🔧 快速安装

### 1. 安装项目依赖
```bash
# 安装所有 Node.js 依赖
pnpm install

# 安装测试相关依赖
pnpm test:install
```

### 2. 设置数据库
```bash
# 创建测试数据库
createdb test_db

# 设置环境变量（复制并修改）
cp apps/blog/.env.example apps/blog/.env.test
cp apps/server/.env.example apps/server/.env.test
```

### 3. 初始化测试环境
```bash
# 初始化测试目录结构
pnpm test:setup

# 安装 Python 测试编排器依赖
cd testing/orchestrator
pip install -r requirements.txt
```

## 🧪 运行测试

### 方式一：使用 npm 脚本（推荐新手）

```bash
# 运行所有单元测试
pnpm test:unit

# 运行集成测试
pnpm test:integration

# 运行 E2E 测试
pnpm test:e2e

# 运行完整测试套件
pnpm test:coverage

# 实时查看测试（开发模式）
pnpm test:watch
```

### 方式二：使用 Python 测试编排器（推荐进阶用户）

```bash
# 运行特定测试套件
pnpm test:orchestrator:unit
pnpm test:orchestrator:integration
pnpm test:orchestrator:e2e

# 运行所有测试
pnpm test:orchestrator:all

# 为特定应用运行测试
cd testing/orchestrator
python main.py run --suite unit --app blog
python main.py run --suite integration --app server
```

### 方式三：直接使用编排器（最灵活）

```bash
cd testing/orchestrator

# 查看所有可用选项
python main.py --help

# 自定义配置运行
python main.py run \
  --suite unit \
  --parallel 6 \
  --timeout 900 \
  --retry 3 \
  --verbose
```

## 📊 查看测试结果

### 1. HTML 报告
```bash
# 生成并打开测试报告
pnpm test:reports
```

### 2. 控制台输出
测试运行时会实时显示：
- ✅ **通过的测试**: 绿色显示
- ❌ **失败的测试**: 红色显示，包含详细错误信息
- ⏱️ **执行时间**: 每个测试的耗时
- 📈 **覆盖率报告**: 代码覆盖率统计

### 3. CI/CD 集成
推送代码到 GitHub 后，自动触发完整测试流程：
- 代码质量检查
- 单元测试和集成测试  
- E2E 测试（多浏览器）
- 性能测试
- 安全测试

## 🎯 常用测试场景

### 开发阶段
```bash
# 快速单元测试（开发时）
pnpm test:watch

# 测试特定文件
pnpm test apps/blog/src/components/Button.test.tsx

# 测试特定应用
pnpm test:orchestrator:unit --app blog
```

### 发布前检查
```bash
# 完整测试套件
pnpm test:orchestrator:all

# 性能测试
pnpm test:performance

# 安全扫描
pnpm test:security
```

### 调试测试
```bash
# E2E 测试 UI 模式（可视化调试）
pnpm test:e2e:ui

# 详细日志模式
cd testing/orchestrator
python main.py run --suite e2e --verbose

# 失败时保留浏览器
cd testing/e2e
npx playwright test --headed --debug
```

## 🔍 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查数据库状态
pg_isready -h localhost -p 5432

# 检查环境变量
echo $DATABASE_URL

# 重置测试数据库
pnpm --filter blog db:reset
```

#### 2. 端口占用
```bash
# 查找占用端口的进程
lsof -i :3000
lsof -i :3001

# 杀死进程
kill -9 <PID>
```

#### 3. 依赖问题
```bash
# 清理并重新安装
pnpm clean
pnpm install

# 重新安装测试依赖
pnpm test:install
```

#### 4. Python 环境问题
```bash
# 检查 Python 版本
python --version

# 使用虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r testing/orchestrator/requirements.txt
```

### 日志和调试

#### 查看详细日志
```bash
# 测试编排器日志
cd testing/orchestrator
python main.py run --verbose

# 应用日志
tail -f apps/blog/logs/test.log
tail -f apps/server/logs/test.log
```

#### 测试报告位置
```
testing/reports/
├── html/           # HTML 可视化报告
├── json/           # JSON 数据报告
├── coverage/       # 代码覆盖率报告
├── playwright-report/  # E2E 测试报告
└── junit/          # JUnit XML 报告
```

## 📈 性能优化建议

### 1. 并行执行
```bash
# 增加并行工作进程
python main.py run --parallel 8

# Jest 并行配置
pnpm test:unit --maxWorkers=8
```

### 2. 选择性测试
```bash
# 只测试更改的文件
pnpm test --onlyChanged

# 跳过慢速测试
pnpm test --testPathIgnorePatterns=slow
```

### 3. 缓存优化
```bash
# 清理测试缓存
pnpm test:clean

# 使用 Jest 缓存
pnpm test --cache
```

## 🚀 进阶功能

### 1. 自定义测试配置
编辑 `testing.yml` 文件自定义配置：
```yaml
execution:
  parallel_workers: 6
  test_timeout: 3600
  retry_failed: 3
```

### 2. 添加新的测试套件
```bash
# 创建新的测试套件
mkdir testing/custom-suite
cd testing/custom-suite
# 添加测试文件...
```

### 3. 集成外部工具
- **SonarQube**: 代码质量分析
- **Allure**: 高级测试报告
- **K6**: 负载测试
- **OWASP ZAP**: 安全测试

## 📚 更多资源

- [完整文档](./README.md)
- [配置参考](./orchestrator/README.md)
- [E2E 测试指南](./e2e/README.md)
- [CI/CD 集成](../.github/workflows/README.md)

## 💡 提示

- 🔄 **定期运行**: 建议每天运行完整测试套件
- 📊 **监控覆盖率**: 保持代码覆盖率在 80% 以上
- 🚀 **CI/CD 集成**: 所有 PR 都应通过自动化测试
- 🐛 **及时修复**: 发现问题立即修复，避免累积技术债务

---

## 📄 **AI-Code Monorepo 完整自动化测试配置**

根据你的实际项目结构，这里是完整的自动化测试配置文件：

### 🔧 **项目配置文件 (ai-code-testing.yml)**

```yaml
# ====================================================================
# AI-Code Monorepo 自动化测试完整配置
# 适配技术栈：Next.js + NestJS + React + Vite + 原生移动端
# ====================================================================

# 项目基础信息
project_name: "AI-Code Monorepo"
project_root: "/Users/huangyuming/Desktop/createProjects/AI-code"
test_root: "./testing"
version: "1.0.0"

# ====================================================================
# 执行配置
# ====================================================================
execution:
  parallel_workers: 6          # 6个并行工作进程
  test_timeout: 3600           # 1小时总超时
  retry_failed: 3              # 失败重试3次
  fail_fast: false             # 不快速失败，收集所有错误
  max_concurrent_apps: 3       # 最多同时运行3个应用

# ====================================================================
# 应用配置 - 基于实际项目结构
# ====================================================================
apps:
  # Next.js 博客应用
  blog:
    name: "blog"
    type: "nextjs"
    path: "./apps/blog"
    port: 3000
    dependencies: ["server"]
    
    # 测试命令配置
    commands:
      dev: "pnpm dev"
      build: "pnpm build"
      test_unit: "jest --testPathPattern=src --coverage"
      test_integration: "jest --testPathPattern=integration"
      test_e2e: "playwright test"
      lint: "next lint"
      type_check: "tsc --noEmit"
    
    # 环境配置
    env_file: "./apps/blog/.env.test"
    test_timeout: 600
    startup_wait: 10
    health_check: "http://localhost:3000/api/health"
    
    # 数据库相关
    database:
      required: true
      setup_command: "pnpm db:setup"
      seed_command: "pnpm db:seed"
      reset_command: "pnpm db:reset"

  # NestJS 服务端
  server:
    name: "server"
    type: "nestjs"
    path: "./apps/server"
    port: 3001
    dependencies: []
    
    # 测试命令配置
    commands:
      dev: "pnpm dev"
      build: "pnpm build"
      test_unit: "jest --config jest-unit.config.js"
      test_integration: "jest --config jest-integration.config.js"
      test_e2e: "jest --config test/jest-e2e.json"
      test_auth: "jest --testPathPattern=src/auth"
      test_users: "jest --testPathPattern=src/users --coverage"
      lint: "eslint \"{src,apps,libs,test}/**/*.ts\""
      type_check: "tsc --noEmit"
    
    # 环境配置
    env_file: "./apps/server/.env.test"
    test_timeout: 900
    startup_wait: 15
    health_check: "http://localhost:3001/health"
    
    # 数据库相关
    database:
      required: true
      setup_command: "npm run db:setup"
      seed_command: "npm run db:seed:simple"
      check_command: "npm run db:check"

    port: 3002
    dependencies: ["server"]
    
    # 测试命令配置
    commands:
      dev: "pnpm dev"
      build: "pnpm build"
      test_unit: "vitest run --coverage"
      test_component: "vitest run src/components"
      test_codegen: "vitest run src/codegen"
      lint: "eslint src --ext .ts,.tsx"
      type_check: "tsc --noEmit"
    
    # 环境配置
    env_file: "./apps/lowcode/.env.test"
    test_timeout: 600
    startup_wait: 8
    health_check: "http://localhost:3002"

  # UMI React 移动端
  mobile:
    name: "mobile"
    type: "umi-react"
    path: "./apps/mobile"
    port: 8000
    dependencies: ["server"]
    
    # 测试命令配置
    commands:
      dev: "pnpm dev"
      build: "pnpm build"
      test_unit: "jest --coverage"
      test_component: "jest src/components"
      test_pages: "jest src/pages"
      lint: "eslint src --ext .ts,.tsx"
      type_check: "tsc --noEmit"
    
    # 环境配置
    env_file: "./apps/mobile/.env.test"
    test_timeout: 600
    startup_wait: 10
    health_check: "http://localhost:8000"

  # Android 原生应用
  android:
    name: "android-native"
    type: "android"
    path: "./apps/android-native"
    port: null
    dependencies: ["server"]
    
    # 测试命令配置
    commands:
      build: "./gradlew assembleDebug"
      test_unit: "./gradlew testDebugUnitTest"
      test_instrumented: "./gradlew connectedDebugAndroidTest"
      lint: "./gradlew lintDebug"
    
    test_timeout: 1200
    env_file: "./apps/android-native/.env.test"

  # iOS 原生应用
  ios:
    name: "ios-native"
    type: "ios"
    path: "./apps/ios-native"
    port: null
    dependencies: ["server"]
    
    # 测试命令配置
    commands:
      build: "xcodebuild -workspace WorkbenchApp.xcworkspace -scheme WorkbenchApp build"
      test_unit: "xcodebuild test -workspace WorkbenchApp.xcworkspace -scheme WorkbenchApp -destination 'platform=iOS Simulator,name=iPhone 14'"
      lint: "swiftlint"
    
    test_timeout: 1800
    env_file: "./apps/ios-native/.env.test"

# ====================================================================
# 共享库配置
# ====================================================================
shared_libraries:
  hooks:
    name: "shared-hooks"
    path: "./shared/hooks"
    test_command: "jest --coverage"
    build_command: "pnpm build"
    
  auth:
    name: "shared-auth" 
    path: "./shared/auth"
    test_command: "jest --coverage"
    build_command: "pnpm build"
    
  ui:
    name: "shared-ui"
    path: "./shared/ui"
    test_command: "jest --coverage"
    build_command: "pnpm build"
    
  utils:
    name: "shared-utils"
    path: "./shared/utils"
    test_command: "jest --coverage"
    build_command: "pnpm build"

# ====================================================================
# 数据库配置
# ====================================================================
database:
  # 测试数据库
  test:
    host: "localhost"
    port: 6543              # SSH隧道端口
    database: "blogdb"
    username: "app_user"
    password: "HYm_7893_hyujs_m"
    ssl: false
    
  # 华为云生产数据库
  production:
    host: "${DATABASE_HOST}"
    port: 5432
    database: "${DATABASE_NAME}"
    username: "${DATABASE_USER}"
    password: "${DATABASE_PASSWORD}"
    ssl: true

# ====================================================================
# 测试套件配置
# ====================================================================
test_suites:
  # 单元测试
  unit:
    description: "组件和函数单元测试"
    timeout: 600
    coverage_required: true
    parallel: true
    coverage_threshold: 80
    
    targets:
      blog: "jest --testPathPattern=src/components|src/lib|src/utils"
      server: "jest --config jest-unit.config.js"
      lowcode: "vitest run src/components src/utils"
      mobile: "jest src/components src/utils"
      shared: "jest --projects shared/*/jest.config.js"

  # 集成测试  
  integration:
    description: "API和数据库集成测试"
    timeout: 1200
    requires_database: true
    requires_services: ["server"]
    parallel: false
    
    targets:
      blog: "jest --testPathPattern=integration"
      server: "jest --config jest-integration.config.js"
      lowcode: "vitest run --testPathPattern=integration"
      mobile: "jest --testPathPattern=integration"

  # 端到端测试
  e2e:
    description: "完整用户流程测试"
    timeout: 2400
    browsers: ["chromium", "firefox", "webkit"]
    requires_services: ["server", "blog", "mobile"]
    parallel: false
    
    targets:
      web: "playwright test"
      mobile_web: "playwright test --project='Mobile Chrome'"
      cross_browser: "playwright test --project=chromium --project=firefox"

  # API测试
  api:
    description: "RESTful API测试"
    timeout: 900
    requires_services: ["server"]
    
    targets:
      auth: "jest --testPathPattern=src/auth/.*e2e"
      articles: "jest --testPathPattern=src/articles/.*e2e"
      users: "jest --testPathPattern=src/users/.*e2e"
      lowcode: "jest --testPathPattern=src/lowcode/.*e2e"

  # 性能测试
  performance:
    description: "负载和性能测试"
    timeout: 3600
    load_test_duration: "10m"
    max_response_time: 2000
    requires_services: ["server", "blog"]
    
    targets:
      api_load: "k6 run testing/performance/api-load.js"
      web_performance: "lighthouse http://localhost:3000"
      database_load: "k6 run testing/performance/db-load.js"

  # 安全测试
  security:
    description: "安全漏洞扫描"
    timeout: 1800
    
    targets:
      dependency_check: "npm audit --audit-level=moderate"
      code_scan: "semgrep --config=auto ."
      web_security: "zap-baseline.py -t http://localhost:3000"

# ====================================================================
# 环境配置
# ====================================================================
environments:
  # 本地开发环境
  development:
    database_url: "postgresql://app_user:HYm_7893_hyujs_m@localhost:6543/blogdb"
    node_env: "development"
    log_level: "debug"
    debug: true
    
  # 测试环境
  test:
    database_url: "postgresql://test_user:test_password@localhost:5432/test_db"
    node_env: "test"
    log_level: "error"
    debug: false
    
  # CI环境
  ci:
    database_url: "postgresql://ci_user:ci_password@postgres:5432/ci_db"
    node_env: "test"
    log_level: "error"
    debug: false
    parallel_workers: 2
    timeout_multiplier: 1.5

# ====================================================================
# 报告配置
# ====================================================================
reporting:
  formats: ["html", "json", "junit", "allure"]
  coverage_threshold: 75.0
  output_directory: "./testing/reports"
  
  # 集成外部工具
  integrations:
    sonarqube:
      enabled: true
      url: "${SONAR_URL}"
      token: "${SONAR_TOKEN}"
      
    codecov:
      enabled: true
      token: "${CODECOV_TOKEN}"
      
    allure:
      enabled: true
      results_dir: "./testing/reports/allure-results"
      report_dir: "./testing/reports/allure-report"

# ====================================================================
# 通知配置
# ====================================================================
notification:
  enabled: true
  
  # 钉钉通知
  dingtalk:
    webhook_url: "${DINGTALK_WEBHOOK_URL}"
    enabled: true
    notify_on: ["failure", "success", "flaky"]
    
  # 企业微信通知
  wechat:
    webhook_url: "${WECHAT_WEBHOOK_URL}"
    enabled: false
    
  # 邮件通知
  email:
    smtp_host: "smtp.163.com"
    smtp_port: 587
    username: "${SMTP_USERNAME}"
    password: "${SMTP_PASSWORD}"
    from: "AI-Code测试平台 <noreply@aicode.com>"
    to: ["dev-team@company.com", "qa-team@company.com"]
    notify_on: ["failure", "fixed"]

# ====================================================================
# CI/CD配置
# ====================================================================
ci_cd:
  # GitHub Actions
  github:
    enabled: true
    trigger_on: ["push", "pull_request"]
    branches: ["main", "develop"]
    
  # GitLab CI
  gitlab:
    enabled: false
    
  # Jenkins
  jenkins:
    enabled: false
    
  # 部署配置
  deployment:
    staging:
      auto_deploy: true
      requires_tests: ["unit", "integration"]
      
    production:
      auto_deploy: false
      requires_tests: ["unit", "integration", "e2e", "security"]
      approval_required: true

# ====================================================================
# 高级功能配置
# ====================================================================
advanced:
  # 智能测试选择
  smart_testing:
    enabled: true
    changed_files_only: true
    dependency_analysis: true
    
  # 并行优化
  parallel_optimization:
    enabled: true
    resource_aware: true
    load_balancing: true
    
  # 缓存配置
  caching:
    enabled: true
    cache_dependencies: true
    cache_build_artifacts: true
    cache_test_results: true
    ttl: "7d"
    
  # 监控配置
  monitoring:
    enabled: true
    metrics_collection: true
    performance_tracking: true
    flaky_test_detection: true
```

### 🚀 **快速使用指南**

将上述配置保存为 `ai-code-testing.yml`，然后：

```bash
# 1. 安装依赖
pnpm test:install

# 2. 初始化测试环境
pnpm test:setup

# 3. 使用配置文件运行测试
cd testing/orchestrator
python main.py run --config ../../ai-code-testing.yml --suite all

# 4. 运行特定应用测试
python main.py run --config ../../ai-code-testing.yml --suite unit --app blog

# 5. 生成报告
python main.py run --config ../../ai-code-testing.yml --suite unit --verbose
```

### 🎯 **关键特性**

- ✅ **完全适配你的项目结构**: Next.js + NestJS + Vite + UMI + 原生
- ✅ **智能依赖管理**: 自动处理应用间依赖关系  
- ✅ **多环境支持**: 开发/测试/CI 环境配置
- ✅ **企业级通知**: 钉钉/企业微信/邮件集成
- ✅ **丰富的测试套件**: 单元/集成/E2E/性能/安全测试
- ✅ **CI/CD 就绪**: GitHub Actions + 其他 CI 工具支持

---

如果遇到任何问题，请查看详细文档或提交 Issue。Happy Testing! 🧪✨
