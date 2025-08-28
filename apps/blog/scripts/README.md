# 工具脚本

本目录包含项目开发和维护相关的工具脚本。

## 📁 脚本列表

### 🔧 环境检查
- **check-env.js** - 环境变量检查脚本
  - 用途：验证项目所需的环境变量是否已正确配置
  - 运行：`node scripts/check-env.js`

### 🧹 缓存清理
- **clean-cache.sh** - 缓存清理脚本
  - 用途：清理 Next.js 构建缓存和 node_modules 缓存
  - 运行：`./scripts/clean-cache.sh`

## 🚀 使用方法

### 环境检查
```bash
# 检查环境变量配置
node scripts/check-env.js
```

### 缓存清理
```bash
# 清理所有缓存
./scripts/clean-cache.sh

# 或者使用 npm script
npm run clean
```

## 📝 注意事项

- 运行脚本前请确保有相应的执行权限
- 环境检查脚本会验证所有必需的环境变量
- 缓存清理脚本会删除 .next 和 node_modules/.cache 目录

---

*最后更新: 2025-01-27*
