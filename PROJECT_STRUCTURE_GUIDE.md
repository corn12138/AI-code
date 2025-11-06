# 📁 AI-Code 项目结构指南

## 🎯 项目概述

AI-Code 是一个企业级全栈 Monorepo 项目，包含多个应用和共享库。

## 📂 核心目录结构

### 🏗️ 应用目录 (`apps/`)
```
apps/
├── blog/                    # 📱 Next.js 博客应用
├── mobile/                  # 📱 Vite + React 移动端应用  
├── server/                  # 🖥️ NestJS 后端服务
├── android-native/          # 🤖 Android 原生应用
└── ios-native/              # 🍎 iOS 原生应用
```

### 📚 共享库 (`shared/`)
```
shared/
├── hooks/                   # 🪝 共享 React Hooks
├── ui/                      # 🎨 共享 UI 组件
├── utils/                   # 🔧 共享工具函数
└── auth/                    # 🔐 共享认证逻辑
```

### ⚙️ 配置文件
```
├── package.json             # 📦 根包配置
├── pnpm-workspace.yaml      # 🔧 pnpm 工作空间配置
├── tsconfig.json            # 📝 TypeScript 配置
├── docker-compose.yml       # 🐳 Docker 编排
└── .gitignore               # 🚫 Git 忽略规则
```

## 📋 文件分类

### ✅ 项目核心文件 (应该保留)

#### 应用代码
- `apps/` - 所有应用目录
- `shared/` - 共享库目录
- `config/` - 配置文件目录

#### 项目配置
- `package.json` - 根包配置
- `pnpm-workspace.yaml` - 工作空间配置
- `tsconfig.json` - TypeScript 配置
- `docker-compose*.yml` - Docker 配置

#### 文档
- `README.md` - 项目说明
- `docs/` - 项目文档目录
- `NATIVE_APPS_README.md` - 原生应用说明

#### 脚本工具
- `scripts/` - 项目脚本
- `monitoring/` - 监控配置
- `nginx/` - Nginx 配置

### ⚠️ 运行时生成文件 (可以清理)

#### 构建产物
- `node_modules/` - 依赖包 (可重新安装)
- `apps/*/node_modules/` - 各应用依赖
- `apps/*/dist/` - 构建输出
- `apps/*/dist-native/` - 原生构建输出
- `apps/*/.next/` - Next.js 构建缓存
- `apps/*/test-results/` - 测试结果
- `apps/*/coverage/` - 测试覆盖率报告

#### 缓存文件
- `apps/*/.vitest/` - Vitest 缓存
- `apps/*/tsconfig.tsbuildinfo` - TypeScript 构建信息
- `testing/__pycache__/` - Python 缓存
- `testing/logs/` - 测试日志

#### 临时文件
- `apps/*/public/` 中的临时文件
- 各种 `.cache` 目录

### 📊 报告文件 (可以整理)

#### 项目报告
- `PROJECT_CLEANUP_SUMMARY.md`
- `TAILWIND_UPGRADE_REPORT.md`
- `VITEST_UPGRADE_REPORT.md`
- `MOBILE_EMBEDDING_STRATEGY.md`
- `MOBILE_EMBEDDING_USAGE_GUIDE.md`
- `SECURITY_FIX_GUIDE.md`

#### 测试报告
- `testing/FINAL_REPORT.md`
- `testing/LINT_FIX_REPORT.md`
- `testing/SYSTEM_ENHANCEMENT_REPORT.md`
- `testing/TESTING_SYSTEM_REPORT.md`
- `testing/TEST_CONFIG_UPDATE_REPORT.md`

## 🧹 清理建议

### 1. 移动报告文件到统一目录
```
docs/reports/
├── project/                 # 项目报告
│   ├── PROJECT_CLEANUP_SUMMARY.md
│   ├── TAILWIND_UPGRADE_REPORT.md
│   └── VITEST_UPGRADE_REPORT.md
├── testing/                # 测试报告
│   ├── FINAL_REPORT.md
│   ├── LINT_FIX_REPORT.md
│   └── SYSTEM_ENHANCEMENT_REPORT.md
└── mobile/                 # 移动端报告
    ├── MOBILE_EMBEDDING_STRATEGY.md
    └── MOBILE_EMBEDDING_USAGE_GUIDE.md
```

### 2. 清理运行时文件
- 删除所有 `node_modules/` 目录
- 删除所有构建产物目录
- 删除缓存文件
- 清理测试结果

### 3. 优化目录结构
- 统一文档组织
- 清理重复配置
- 优化脚本分类

## 🚀 快速清理命令

```bash
# 清理所有依赖和构建产物
find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name ".next" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "test-results" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "coverage" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name ".vitest" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true

# 清理缓存文件
find . -name "*.tsbuildinfo" -delete
find . -name ".cache" -type d -exec rm -rf {} + 2>/dev/null || true
```

## 📝 维护建议

1. **定期清理**: 每月清理一次运行时文件
2. **文档组织**: 保持文档分类清晰
3. **配置统一**: 避免重复配置
4. **脚本管理**: 统一脚本位置和命名

---

*最后更新: 2025-01-03*
*维护者: AI Assistant*
