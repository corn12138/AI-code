# 🔧 AI-Code 测试系统故障排除指南

本指南涵盖了使用 AI-Code 测试系统时可能遇到的常见问题及其解决方案。

## 🚨 常见问题

### 1. 环境和依赖问题

#### Node.js 版本不兼容

**问题**：`Error: Unsupported Node.js version`

**解决方案**：
```bash
# 检查当前版本
node --version

# 使用 nvm 安装正确版本
nvm install 18
nvm use 18

# 或使用 Homebrew (Mac)
brew install node@18
```

#### Python 版本过低

**问题**：`SyntaxError: invalid syntax` 或 `ModuleNotFoundError`

**解决方案**：
```bash
# 安装 Python 3.11+
# Mac
brew install python@3.11

# Ubuntu/Debian
sudo apt update && sudo apt install python3.11

# 创建新的虚拟环境
cd testing/orchestrator
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### pnpm 未安装或版本过低

**问题**：`command not found: pnpm`

**解决方案**：
```bash
# 安装 pnpm
npm install -g pnpm

# 或使用 curl
curl -fsSL https://get.pnpm.io/install.sh | sh -

# 验证安装
pnpm --version
```

### 2. 数据库连接问题

#### PostgreSQL 连接失败

**问题**：`ECONNREFUSED` 或 `password authentication failed`

**诊断步骤**：
```bash
# 1. 检查 Docker 服务状态
docker-compose -f testing/docker-compose.test.yml ps

# 2. 查看数据库日志
docker-compose -f testing/docker-compose.test.yml logs postgres-test

# 3. 测试连接
docker-compose -f testing/docker-compose.test.yml exec postgres-test \
  psql -U test_user -d test_db -c "SELECT 1;"
```

**解决方案**：
```bash
# 重启数据库服务
docker-compose -f testing/docker-compose.test.yml restart postgres-test

# 如果端口冲突，修改端口
# 编辑 docker-compose.test.yml，改变端口映射
ports:
  - "5434:5432"  # 使用不同的端口

# 重新创建容器
docker-compose -f testing/docker-compose.test.yml down
docker-compose -f testing/docker-compose.test.yml up -d
```

#### 环境变量配置错误

**问题**：`Environment variable not found: DATABASE_URL`

**解决方案**：
```bash
# 检查环境变量文件
cat apps/blog/.env.test

# 如果不存在，创建它
cat > apps/blog/.env.test << EOF
DATABASE_URL=postgresql://test_user:test_password@localhost:5433/test_db
REDIS_URL=redis://localhost:6380
NODE_ENV=test
EOF

# 验证配置
python testing/orchestrator/main.py config-validate
```

### 3. 测试执行问题

#### 测试超时

**问题**：`Test timeout exceeded`

**解决方案**：
```bash
# 增加超时时间
python testing/orchestrator/main.py run --timeout 7200

# 或在配置文件中修改
# testing/config.yml
execution:
  test_timeout: 7200  # 2小时
  task_timeout: 1800  # 30分钟
```

#### 端口占用导致测试失败

**问题**：`EADDRINUSE: address already in use :::3000`

**诊断和解决**：
```bash
# 查找占用端口的进程
lsof -i :3000
lsof -i :3001
lsof -i :3002

# 杀死占用进程
kill -9 <PID>

# 或批量杀死 Node.js 进程
pkill -f node

# 重启测试
python testing/orchestrator/main.py run --app blog
```

#### Playwright 浏览器问题

**问题**：`browserType.launch: Executable doesn't exist`

**解决方案**：
```bash
# 重新安装浏览器
npx playwright install

# 安装系统依赖 (Linux)
npx playwright install-deps

# 如果权限问题
sudo npx playwright install

# 使用 Chromium only
npx playwright install chromium
```

### 4. 权限和文件系统问题

#### 文件权限错误

**问题**：`EACCES: permission denied`

**解决方案**：
```bash
# 检查文件权限
ls -la testing/tools/setup.sh

# 添加执行权限
chmod +x testing/tools/setup.sh
chmod +x test.sh

# 检查目录权限
sudo chown -R $USER:$USER testing/
```

#### 磁盘空间不足

**问题**：`ENOSPC: no space left on device`

**解决方案**：
```bash
# 检查磁盘空间
df -h

# 清理 Docker 容器和镜像
docker system prune -a

# 清理 Node.js 缓存
pnpm store prune
npm cache clean --force

# 清理测试报告
rm -rf testing/reports/*
```

### 5. 性能问题

#### 测试运行缓慢

**诊断**：
```bash
# 检查系统资源
top
htop

# 查看进程占用
ps aux | grep node
ps aux | grep python
```

**优化方案**：
```bash
# 减少并行度
python testing/orchestrator/main.py run --parallel 2

# 使用智能测试
python testing/orchestrator/main.py run --changed-only

# 跳过 flaky 测试
python testing/orchestrator/main.py run --skip-flaky

# 分步运行
python testing/orchestrator/main.py run --suite unit
python testing/orchestrator/main.py run --suite integration
```

#### 内存不足

**问题**：`JavaScript heap out of memory`

**解决方案**：
```bash
# 增加 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=8192"

# 在 package.json 中配置
{
  "scripts": {
    "test": "node --max-old-space-size=8192 ./node_modules/.bin/jest"
  }
}

# 减少并发测试数量
# 修改 jest.config.js
module.exports = {
  maxWorkers: 2,  # 减少工作进程
  workerIdleMemoryLimit: "512MB"
};
```

### 6. Git 和版本控制问题

#### Git hooks 失败

**问题**：`pre-commit hook failed`

**解决方案**：
```bash
# 检查 hooks 权限
ls -la .git/hooks/

# 添加执行权限
chmod +x .git/hooks/pre-commit

# 临时跳过 hooks
git commit --no-verify -m "commit message"

# 修复 hooks 后重新提交
git add .
git commit --amend
```

#### Git diff 检测失败

**问题**：智能测试无法检测变更

**解决方案**：
```bash
# 检查 Git 状态
git status
git log --oneline -5

# 设置正确的分支
git fetch origin
git checkout main

# 强制全量测试
python testing/orchestrator/main.py run --no-changed-only
```

### 7. Docker 相关问题

#### Docker 服务启动失败

**问题**：`Cannot connect to the Docker daemon`

**解决方案**：
```bash
# 启动 Docker 服务
sudo systemctl start docker  # Linux
open -a Docker  # Mac

# 检查 Docker 状态
docker info

# 重启 Docker
sudo systemctl restart docker
```

#### 容器网络问题

**问题**：容器间无法通信

**解决方案**：
```bash
# 检查网络
docker network ls
docker network inspect ai-code-test-network

# 重新创建网络
docker-compose -f testing/docker-compose.test.yml down
docker network prune
docker-compose -f testing/docker-compose.test.yml up -d
```

### 8. 配置问题

#### YAML 配置解析错误

**问题**：`yaml.scanner.ScannerError`

**解决方案**：
```bash
# 验证 YAML 语法
python -c "import yaml; yaml.safe_load(open('testing/config.yml'))"

# 使用在线 YAML 验证器
# https://yamllint.com/

# 检查缩进和特殊字符
cat -A testing/config.yml | head -20
```

#### 应用配置错误

**问题**：`AppConfig validation error`

**解决方案**：
```bash
# 验证配置
python testing/orchestrator/main.py config-validate

# 查看详细错误
python testing/orchestrator/main.py config-validate --verbose

# 使用默认配置
cp testing/config.yml testing/config.yml.backup
python testing/orchestrator/config.py  # 生成默认配置
```

## 🔍 调试技巧

### 启用详细日志

```bash
# Python 编排器详细日志
python testing/orchestrator/main.py run --debug --verbose

# Node.js 详细日志
DEBUG=* pnpm test

# Jest 详细输出
pnpm test --verbose --no-cache
```

### 使用调试模式

```bash
# 单步调试 E2E 测试
cd testing/suites/e2e
npx playwright test --headed --debug

# Node.js 调试模式
node --inspect-brk ./node_modules/.bin/jest --runInBand

# Python 调试模式
cd testing/orchestrator
python -m pdb main.py run --app blog
```

### 收集诊断信息

```bash
# 系统信息
python testing/orchestrator/main.py health

# 环境诊断
node -v
python3 --version
docker --version
pnpm --version

# 网络诊断
ping localhost
telnet localhost 3000
telnet localhost 5433
```

## 📋 问题报告模板

如果问题仍然存在，请使用以下模板报告问题：

```markdown
## 问题描述
[简要描述遇到的问题]

## 复现步骤
1. 
2. 
3. 

## 预期行为
[描述期望的结果]

## 实际行为
[描述实际发生的情况]

## 环境信息
- OS: [e.g., macOS 13.0, Ubuntu 20.04]
- Node.js: [版本]
- Python: [版本]
- Docker: [版本]
- 浏览器: [如果相关]

## 错误日志
```
[粘贴完整的错误日志]
```

## 已尝试的解决方案
[列出已经尝试过的解决方法]
```

## 🆘 紧急情况处理

### 完全重置环境

```bash
# 1. 停止所有服务
docker-compose -f testing/docker-compose.test.yml down
pkill -f node
pkill -f python

# 2. 清理所有缓存
pnpm store prune
npm cache clean --force
docker system prune -a

# 3. 重新设置
rm -rf testing/orchestrator/venv
rm -rf node_modules
./testing/tools/setup.sh

# 4. 验证安装
python testing/orchestrator/main.py config-validate
./test.sh unit
```

### 回滚到上一个工作版本

```bash
# 检查 Git 历史
git log --oneline -10

# 回滚到特定提交
git checkout <commit-hash>

# 或回滚配置文件
git checkout HEAD~1 -- testing/config.yml
```

## 📞 获取额外帮助

- 📧 **邮件支持**: dev-team@company.com
- 💬 **内部聊天**: #testing-support
- 📚 **文档**: [完整文档](../README.md)
- 🐛 **问题跟踪**: GitHub Issues

---

💡 **提示**: 大多数问题都可以通过重新运行 `./testing/tools/setup.sh` 来解决。如果问题持续存在，请不要犹豫寻求帮助！
