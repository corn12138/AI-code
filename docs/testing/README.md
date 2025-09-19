# 🧪 AI-Code 企业级自动化测试系统

一个完整的 Monorepo 自动化测试解决方案，支持多技术栈、智能调度、实时监控和企业级集成。

## 🏗️ 系统架构

```mermaid
graph TB
    A[测试触发] --> B[Python 测试编排器]
    B --> C[智能任务调度]
    C --> D[并行执行引擎]
    D --> E[多技术栈适配器]
    E --> F[Next.js/React 测试]
    E --> G[NestJS 测试]
    E --> H[Vite/UMI 测试]
    E --> I[原生移动测试]
    F --> J[结果聚合器]
    G --> J
    H --> J
    I --> J
    J --> K[报告生成器]
    K --> L[通知系统]
    K --> M[质量门禁]
```

## 🚀 核心特性

### 🎯 智能测试调度
- **变更驱动测试**: 基于 Git diff 的智能测试选择
- **依赖关系分析**: 自动识别应用间依赖并优化执行顺序
- **资源感知调度**: 动态调整并行度避免资源竞争
- **Flaky 测试管理**: 自动重试、隔离和趋势分析

### 🔧 多技术栈支持
- **前端框架**: Next.js, React, Vite, UMI
- **后端框架**: NestJS, Express
- **移动端**: React Native, 原生 iOS/Android
- **测试工具**: Jest, Vitest, Playwright, Detox

### 📊 企业级监控
- **实时进度追踪**: WebSocket 实时状态更新
- **性能监控**: 测试执行时间、资源使用率
- **质量指标**: 覆盖率、成功率、趋势分析
- **告警系统**: 钉钉、企业微信、邮件通知

### 🛡️ 质量保障
- **多层测试**: Unit → Integration → E2E → Performance → Security
- **合约测试**: Pact 确保服务间兼容性
- **环境隔离**: Testcontainers 提供一致的测试环境
- **安全扫描**: 依赖漏洞、代码安全检查

## 📁 目录结构

```
testing/
├── 📄 README.md                    # 本文档
├── 📄 config.yml                   # 主配置文件
├── 📄 docker-compose.test.yml      # 测试环境容器
│
├── 🐍 orchestrator/                # Python 测试编排器
│   ├── 📄 main.py                  # 主入口点
│   ├── 📄 config.py                # 配置管理
│   ├── 📄 scheduler.py             # 智能调度器
│   ├── 📄 reporter.py              # 报告生成器
│   ├── 📄 requirements.txt         # Python 依赖
│   └── 📁 utils/                   # 工具模块
│       ├── 📄 git_integration.py   # Git 集成
│       ├── 📄 flaky_store.py       # Flaky 测试管理
│       ├── 📄 notification.py      # 通知系统
│       ├── 📄 logger.py            # 日志系统
│       ├── 📄 process_manager.py   # 进程管理
│       └── 📄 resource_monitor.py  # 资源监控
│
├── 🧪 suites/                      # 测试套件
│   ├── 📁 unit/                    # 单元测试
│   ├── 📁 integration/             # 集成测试
│   ├── 📁 e2e/                     # 端到端测试
│   ├── 📁 performance/             # 性能测试
│   ├── 📁 security/                # 安全测试
│   └── 📁 contracts/               # 合约测试
│
├── 📊 reports/                     # 测试报告
│   ├── 📁 html/                    # HTML 报告
│   ├── 📁 json/                    # JSON 数据
│   ├── 📁 coverage/                # 覆盖率报告
│   ├── 📁 allure/                  # Allure 报告
│   └── 📁 junit/                   # JUnit XML
│
├── 🔧 tools/                       # 工具脚本
│   ├── 📄 setup.sh                 # 环境设置
│   ├── 📄 cleanup.sh               # 清理脚本
│   ├── 📄 health-check.sh          # 健康检查
│   └── 📄 performance-baseline.sh  # 性能基准
│
└── 📚 docs/                        # 文档
    ├── 📄 quick-start.md           # 快速开始
    ├── 📄 configuration.md         # 配置指南
    ├── 📄 best-practices.md        # 最佳实践
    └── 📄 troubleshooting.md       # 故障排除

## 🔒 文件管理说明

### ✅ 需要提交的文件
- **文档**: `README.md`, `docs/`, `*.md`
- **配置**: `jest.config.js`, `requirements*.txt`
- **源代码**: `orchestrator/*.py`, `tools/`, `suites/`, `e2e/`
- **工具**: 所有脚本和工具文件

### ❌ 不提交的文件（已添加到.gitignore）
- **敏感配置**: `config.yml`, `real-world-config.yml`, `docker-compose.test.yml`
- **运行时文件**: `reports/`, `orchestrator/venv/`, `orchestrator/__pycache__/`
- **IDE配置**: `orchestrator/.idea/`, `*.swp`, `*.swo`
- **缓存文件**: `*.pyc`, `*.cache`, `.pytest_cache/`
```

## ⚡ 快速开始

### 1. 环境准备
```bash
# 安装依赖
pnpm install

# 设置 Python 环境
cd testing/orchestrator
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt

# 启动测试服务
docker-compose -f testing/docker-compose.test.yml up -d
```

### 2. 运行测试
```bash
# 运行所有测试
python testing/orchestrator/main.py run --suite all

# 运行特定应用测试
python testing/orchestrator/main.py run --app blog --suite unit

# 智能测试（仅变更相关）
python testing/orchestrator/main.py run --changed-only

# 交互式测试选择
python testing/orchestrator/main.py interactive
```

### 3. 查看报告
```bash
# 打开 HTML 报告
open testing/reports/html/index.html

# 查看实时状态
python testing/orchestrator/main.py status

# 查看 Flaky 测试列表
python testing/orchestrator/main.py flaky --list
```

## 🎮 使用示例

### 基础用法
```bash
# 运行单元测试
python testing/orchestrator/main.py run --suite unit

# 并行运行集成测试
python testing/orchestrator/main.py run --suite integration --parallel 4

# 运行带覆盖率的完整测试
python testing/orchestrator/main.py run --suite all --coverage --verbose
```

### 高级用法
```bash
# 性能测试模式
python testing/orchestrator/main.py run --suite performance --baseline

# 安全扫描
python testing/orchestrator/main.py run --suite security --strict

# CI 模式（简化输出）
python testing/orchestrator/main.py run --suite all --ci-mode
```

### 开发模式
```bash
# 监视模式（文件变更自动运行）
python testing/orchestrator/main.py watch --app blog

# 调试模式（详细日志）
python testing/orchestrator/main.py run --debug --verbose

# 失败重试
python testing/orchestrator/main.py retry --failed-only
```

## 📊 测试指标与质量门禁

### 质量指标
- **单元测试覆盖率**: ≥ 85%
- **集成测试覆盖率**: ≥ 75%
- **E2E 测试覆盖率**: ≥ 60%
- **性能回归**: < 10%
- **安全漏洞**: 0 High, ≤ 5 Medium

### 门禁规则
- **PR 合并**: 必须通过所有单元测试和集成测试
- **发布准备**: 必须通过完整测试套件
- **生产部署**: 必须通过性能测试和安全扫描

## 🔧 配置管理

### 主配置文件 (config.yml)
```yaml
project:
  name: "AI-Code Monorepo"
  root: "/path/to/project"

execution:
  parallel_workers: 6
  timeout: 3600
  retry_failed: 3

apps:
  blog:
    type: "nextjs"
    path: "./apps/blog"
    port: 3000
    dependencies: ["server"]
  
  server:
    type: "nestjs"
    path: "./apps/server"
    port: 3001

notification:
  dingtalk:
    webhook: "${DINGTALK_WEBHOOK}"
  email:
    smtp_host: "smtp.example.com"
    recipients: ["team@example.com"]
```

### 环境变量
```bash
# 数据库配置
export DATABASE_URL="postgresql://user:pass@localhost:5432/test_db"

# 通知配置
export DINGTALK_WEBHOOK="https://oapi.dingtalk.com/..."
export SMTP_PASSWORD="your-password"

# CI/CD 配置
export CI_MODE="true"
export GITHUB_TOKEN="your-token"
```

## 🔍 监控与告警

### 实时监控
- **测试执行状态**: 进行中、成功、失败、跳过
- **资源使用**: CPU、内存、磁盘 I/O
- **执行时间**: 单个测试、套件总时间
- **队列状态**: 等待、运行、完成任务数

### 告警规则
- **测试失败**: 立即通知相关团队
- **性能回归**: 超过基准 10% 时告警
- **覆盖率下降**: 低于阈值时告警
- **Flaky 测试**: 连续失败 3 次时标记

## 🚀 CI/CD 集成

### GitHub Actions
```yaml
name: 自动化测试
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: 运行测试
        run: |
          python testing/orchestrator/main.py run \
            --suite all \
            --ci-mode \
            --coverage \
            --report-format junit
```

### 分支策略
- **main**: 完整测试套件
- **develop**: 单元测试 + 集成测试
- **feature/***: 变更相关测试

## 🛠️ 故障排除

### 常见问题
1. **数据库连接失败**: 检查 `DATABASE_URL` 环境变量
2. **端口占用**: 使用 `lsof -i :PORT` 查找占用进程
3. **内存不足**: 减少 `parallel_workers` 数量
4. **测试超时**: 增加 `timeout` 配置

### 调试技巧
```bash
# 详细日志
python testing/orchestrator/main.py run --debug --verbose

# 单独运行失败的测试
python testing/orchestrator/main.py run --test-id "blog-unit-Button.test.tsx"

# 检查环境状态
python testing/orchestrator/main.py health-check
```

## 📈 最佳实践

### 测试编写
- **单元测试**: 快速、独立、确定性
- **集成测试**: 覆盖关键业务流程
- **E2E 测试**: 模拟真实用户场景

### 性能优化
- **并行执行**: 合理设置并行度
- **缓存策略**: 复用构建产物和依赖
- **智能选择**: 使用变更驱动测试

### 质量保障
- **代码审查**: 所有测试代码都需要 Review
- **定期维护**: 清理 Flaky 测试和过时用例
- **持续改进**: 基于指标优化测试策略

## 🔗 相关链接

- [快速开始指南](./docs/quick-start.md)
- [配置参考](./docs/configuration.md)
- [PyCharm 开发环境设置](./docs/pycharm-setup.md)
- [最佳实践](./docs/best-practices.md)
- [故障排除](./docs/troubleshooting.md)
- [API 文档](./docs/api.md)

---

**让测试成为开发的加速器，而不是阻碍。** 🚀