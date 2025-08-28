# 🚀 AI-Code 测试系统快速开始指南

欢迎使用 AI-Code 企业级自动化测试系统！本指南将帮助您在 5 分钟内完成环境设置并运行第一个测试。

## 📋 前置要求

在开始之前，请确保您的系统已安装以下软件：

- **Node.js** >= 18.0.0
- **Python** >= 3.11
- **pnpm** >= 8.0.0
- **Git** 最新版本
- **Docker** >= 20.0 (推荐，用于测试数据库)

## ⚡ 一键设置

### 1. 自动化设置（推荐）

运行我们的自动化设置脚本，它会为您完成所有配置：

```bash
# 进入项目根目录
cd /path/to/AI-code

# 运行设置脚本
./testing/tools/setup.sh
```

设置脚本会自动：
- ✅ 检查系统依赖
- ✅ 设置 Python 虚拟环境
- ✅ 安装所有必要的包
- ✅ 配置测试数据库
- ✅ 创建环境变量文件
- ✅ 设置 Git hooks
- ✅ 验证安装

### 2. 手动设置（可选）

如果您希望手动设置，请按以下步骤进行：

```bash
# 1. 安装 Node.js 依赖
pnpm install

# 2. 设置 Python 环境
cd testing/orchestrator
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
cd ../..

# 3. 安装测试工具
npx playwright install
pnpm add -D @testing-library/react @testing-library/jest-dom

# 4. 启动测试数据库
docker-compose -f testing/docker-compose.test.yml up -d
```

## 🧪 运行您的第一个测试

设置完成后，让我们运行一些测试来验证一切正常：

### 快速测试

```bash
# 运行单元测试
./test.sh unit

# 运行特定应用的测试
python testing/orchestrator/main.py run --app blog --suite unit
```

### 完整测试套件

```bash
# 运行所有测试
./test.sh all

# 使用编排器运行完整套件
python testing/orchestrator/main.py run --suite all --verbose
```

### 智能测试（仅测试变更）

```bash
# 仅运行受变更影响的测试
python testing/orchestrator/main.py run --changed-only
```

## 🎮 交互式测试

使用交互式模式选择测试：

```bash
python testing/orchestrator/main.py interactive
```

系统会引导您选择：
- 测试套件类型
- 目标应用
- 运行选项

## 👀 开发模式

### 监视模式

文件变更时自动运行测试：

```bash
# 监视 blog 应用
./test.sh watch blog

# 监视特定测试套件
python testing/orchestrator/main.py watch --app blog --suite unit
```

### Jest 监视模式

```bash
# 使用 Jest 监视模式
pnpm test:watch

# 针对特定应用
cd apps/blog && pnpm test --watch
```

## 📊 查看测试结果

### 控制台输出

测试运行时会显示实时进度和彩色结果：

```
🧪 AI-Code 测试编排器
📋 测试套件: unit
📱 目标应用: blog

🔄 执行任务: blog-unit
✅ blog-unit: PASSED (2.3s)

🎉 所有测试通过! (1/1)
```

### HTML 报告

```bash
# 打开详细的 HTML 报告
open testing/reports/html/index.html

# 查看 E2E 测试报告
open testing/reports/playwright/index.html
```

### 实时状态

```bash
# 查看系统状态
python testing/orchestrator/main.py status

# 健康检查
python testing/orchestrator/main.py health
```

## 🔧 管理和调试

### 查看配置

```bash
# 验证配置文件
python testing/orchestrator/main.py config-validate

# 列出所有应用
python testing/orchestrator/main.py list-apps
```

### Flaky 测试管理

```bash
# 查看 flaky 测试列表
python testing/orchestrator/main.py flaky --list

# 清空 flaky 测试记录
python testing/orchestrator/main.py flaky --clear
```

### 调试模式

```bash
# 详细输出
python testing/orchestrator/main.py run --verbose

# 调试模式
python testing/orchestrator/main.py run --debug

# CI 模式（简化输出）
python testing/orchestrator/main.py run --ci-mode
```

## 🐳 Docker 服务管理

### 启动测试服务

```bash
# 启动基础服务（PostgreSQL + Redis）
docker-compose -f testing/docker-compose.test.yml up -d

# 启动所有服务（包括可选服务）
docker-compose -f testing/docker-compose.test.yml --profile storage --profile mail up -d
```

### 管理服务

```bash
# 查看服务状态
docker-compose -f testing/docker-compose.test.yml ps

# 查看日志
docker-compose -f testing/docker-compose.test.yml logs

# 停止服务
docker-compose -f testing/docker-compose.test.yml down
```

## 📚 常用测试场景

### 开发新功能

```bash
# 1. 启动监视模式
./test.sh watch blog

# 2. 在另一个终端开发
# ... 编写代码 ...

# 3. 测试会自动运行
# 💡 提示：保存文件时测试会自动执行
```

### 发布前检查

```bash
# 运行完整测试套件
./test.sh all

# 包含性能和安全测试
python testing/orchestrator/main.py run --suite all --strict
```

### 调试失败的测试

```bash
# 详细输出模式
python testing/orchestrator/main.py run --app blog --verbose

# 仅重试失败的测试
python testing/orchestrator/main.py retry --failed-only

# E2E 测试调试模式
cd testing/suites/e2e
npx playwright test --headed --debug
```

## 🎯 性能优化建议

### 并行执行

```bash
# 增加并行工作进程
python testing/orchestrator/main.py run --parallel 8

# Jest 并行配置
pnpm test --maxWorkers=8
```

### 缓存优化

```bash
# 清理测试缓存
pnpm test:clean

# 使用 Jest 缓存
pnpm test --cache
```

### 选择性测试

```bash
# 只测试更改的文件
pnpm test --onlyChanged

# 跳过 flaky 测试
python testing/orchestrator/main.py run --skip-flaky
```

## 🚨 常见问题

### 端口占用

```bash
# 查找占用端口的进程
lsof -i :3000
lsof -i :3001

# 杀死进程
kill -9 <PID>
```

### 数据库连接问题

```bash
# 检查数据库状态
docker-compose -f testing/docker-compose.test.yml ps postgres-test

# 重启数据库
docker-compose -f testing/docker-compose.test.yml restart postgres-test
```

### 依赖问题

```bash
# 清理并重新安装
pnpm clean
pnpm install

# 重新安装测试依赖
npx playwright install
```

## 📞 获取帮助

### 内置帮助

```bash
# 查看所有可用命令
python testing/orchestrator/main.py --help

# 查看特定命令帮助
python testing/orchestrator/main.py run --help
```

### 文档和资源

- 📖 [完整文档](../README.md)
- 🔧 [配置指南](./configuration.md)
- 🐛 [故障排除](./troubleshooting.md)
- 💡 [最佳实践](./best-practices.md)

### 日志和调试

```bash
# 查看详细日志
python testing/orchestrator/main.py run --debug

# 检查配置
python testing/orchestrator/main.py config-validate

# 系统健康检查
python testing/orchestrator/main.py health
```

---

🎉 **恭喜！** 您已经成功设置了 AI-Code 测试系统。现在您可以享受企业级的自动化测试体验了！

如果遇到任何问题，请查看故障排除文档或在项目中提交 Issue。祝您测试愉快！ 🧪✨
