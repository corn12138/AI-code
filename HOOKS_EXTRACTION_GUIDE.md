# Hooks 提取指南

## 目标
将 AI-Code 项目中的自定义 hooks 提取到独立的 NPM 包中，以便复用和独立维护。

## 包信息
- **包名**: `@corn12138/hooks`
- **版本**: `1.0.0`
- **描述**: 🎣 A collection of powerful React hooks for modern web development

## 发布验证

### 命令行验证
```bash
# 查看包信息
npm view @corn12138/hooks

# 安装测试
npm install @corn12138/hooks

# 测试导入
node -e "console.log(require('@corn12138/hooks'))"
```

### 浏览器验证
```html
<!-- CDN 引用 -->
<script src="https://unpkg.com/@corn12138/hooks@latest/dist/index.umd.js"></script>
```

### 代码示例
```typescript
// ESM 导入
import { useAuth, useDebounce, useAsync } from '@corn12138/hooks';

// CommonJS 导入
const { useAuth, useDebounce } = require('@corn12138/hooks');

// 按需导入（Tree Shaking）
import { useDebounce } from '@corn12138/hooks';  // 只打包 230B!
```

## 使用统计

```bash
# 查看下载统计
npm view @corn12138/hooks downloads
npx npm-stat @corn12138/hooks
```

## 成功标志

恭喜！您的 `@corn12138/hooks` 现在是：

🎉 Initial release of @corn12138/hooks!

## 📋 准备工作检查清单

- [x] ✅ Rollup 构建配置完成
- [x] ✅ 多格式构建 (ESM, CJS, UMD)
- [x] ✅ GitHub Actions CI/CD 配置
- [x] ✅ 社区文档完整 (CONTRIBUTING, SECURITY, etc.)
- [x] ✅ 'use client' 指令修复
- [x] ✅ Bundle 大小优化 (< 5KB gzipped)
- [x] ✅ 所有更改已提交到主仓库

## 🎯 第一步：创建 GitHub 仓库

### 1.1 在 GitHub 上创建新仓库

1. 访问 https://github.com/new
2. **设置仓库信息**：
   ```
   Repository name: ai-code-hooks
   Description: 🎣 A collection of powerful React hooks for modern web development
   Visibility: Public ✅
   
   ❌ 重要：不要勾选任何初始化选项
   ❌ Add a README file
   ❌ Add .gitignore  
   ❌ Choose a license
   ```
3. 点击 **"Create repository"**
4. **复制仓库 URL**，格式类似：
   ```
   https://github.com/your-username/ai-code-hooks.git
   ```

## 🔄 第二步：执行 Git Subtree 提取

### 2.1 运行提取脚本

在 AI-code 根目录下执行：

```bash
# 确保在正确目录
pwd  # 应该显示: /path/to/AI-code

# 执行提取脚本
./extract-hooks.sh https://github.com/your-username/ai-code-hooks.git
```

### 2.2 脚本执行流程

脚本会自动完成以下操作：

```bash
ℹ️  检查 Git 状态...
ℹ️  使用 git subtree 提取 shared/hooks...
ℹ️  创建独立仓库...
ℹ️  设置独立仓库...
ℹ️  更新 package.json 仓库信息...
ℹ️  提交独立仓库的初始配置...
ℹ️  添加远程仓库...
ℹ️  推送到 GitHub...
ℹ️  清理临时文件...
✅ 🎉 Git Subtree 提取完成!
```

## 🔧 第三步：配置 GitHub 仓库

### 3.1 设置仓库配置

访问您的新仓库：`https://github.com/your-username/ai-code-hooks`

#### **Settings → General**
- [x] Allow squash merging
- [x] Allow merge commits
- [x] Allow rebase merging
- [x] Automatically delete head branches

#### **Settings → Pages**
- Source: GitHub Actions
- 文档将自动部署到：`https://your-username.github.io/ai-code-hooks`

#### **Settings → Branches**
创建分支保护规则：
```yaml
Branch name pattern: main
Protection rules:
  ✅ Require a pull request before merging
  ✅ Require status checks to pass before merging
    - CI / test (Node.js 18)
    - CI / test (Node.js 20)
  ✅ Require up-to-date branches
```

### 3.2 配置 Secrets

**Settings → Secrets and variables → Actions**

添加必需的 Secrets：

#### NPM_TOKEN (必需)
```bash
# 1. 登录 npm
npm login

# 2. 创建访问令牌
npm token create --read-write

# 3. 复制生成的 token，添加到 GitHub Secrets
# Name: NPM_TOKEN
# Value: npm_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### CODECOV_TOKEN (可选)
如果需要代码覆盖率报告：
1. 访问 https://codecov.io
2. 连接你的 GitHub 仓库
3. 获取 token 并添加到 Secrets

## 📦 第四步：NPM 发布

### 4.1 自动发布 (推荐)

1. **创建 Release**：
   - 访问 `https://github.com/your-username/ai-code-hooks/releases`
   - 点击 "Create a new release"
   - Tag version: `v1.0.0`
   - Release title: `v1.0.0 - Initial Release`
   - 描述：
     ```markdown
     🎉 Initial release of @corn12138/hooks!
     
     ## ✨ Features
     - 🔐 useAuth - Authentication management
     - ⏱️ useDebounce - Value & callback debouncing  
     - 💻 useClientSide - SSR/CSR detection
     - 🔄 useAsync - Async operation management
     - 🌐 useNetworkStatus - Network monitoring
     - 📝 useForm - Form state management
     - 💾 useLocalStorage - localStorage sync
     - 📏 useWindowSize - Responsive monitoring
     - 🔌 useApi - HTTP request management
     
     ## 📊 Bundle Sizes
     - ESM: 4.33 KB gzipped
     - CJS: 4.46 KB gzipped
     - UMD: 4.59 KB gzipped
     ```
   - 点击 "Publish release"

2. **GitHub Actions 自动发布**：
   - Release 创建后会自动触发 `release.yml` 工作流
   - 自动运行测试、构建和 NPM 发布

### 4.2 手动发布 (备选)

如果自动发布失败，可以手动发布：

```bash
# 克隆独立仓库
git clone https://github.com/your-username/ai-code-hooks.git
cd ai-code-hooks

# 安装依赖
npm install

# 运行完整检查
npm run prepublishOnly  # 包含: lint + type-check + test + build

# 发布到 NPM
npm publish

# 验证发布
npm view @corn12138/hooks
```

## 🎯 第五步：验证发布

### 5.1 NPM 验证

```bash
# 查看包信息
npm view @corn12138/hooks

# 测试安装
npm install @corn12138/hooks

# 检查导入
node -e "console.log(require('@corn12138/hooks'))"
```

### 5.2 CDN 验证

```html
<!-- UMD 构建测试 -->
<script src="https://unpkg.com/@corn12138/hooks@latest/dist/index.umd.js"></script>
<script>
  console.log(window.AiCodeHooks); // 应该显示所有导出的 hooks
</script>
```

### 5.3 项目中使用

```javascript
// ESM 导入
import { useAuth, useDebounce, useAsync } from '@corn12138/hooks';

// CommonJS 导入
const { useAuth, useDebounce } = require('@corn12138/hooks');

// 按需导入 (Tree Shaking)
import { useDebounce } from '@corn12138/hooks';  // 只打包 230B!
```

## 📈 第六步：推广和维护

### 6.1 项目推广

- **技术社区**：掘金、知乎、Dev.to
- **README Badge**：添加 npm 版本、下载量、构建状态
- **文档站点**：`https://your-username.github.io/ai-code-hooks`

### 6.2 持续维护

```bash
# 版本更新流程
git tag v1.0.1
git push origin v1.0.1
# GitHub Release 会自动触发 NPM 发布

# 监控下载量
npm view @corn12138/hooks downloads
npx npm-stat @corn12138/hooks
```

## 🎉 完成！

恭喜！您的 `@corn12138/hooks` 现在是：

✅ **独立的 GitHub 仓库**  
✅ **发布到 NPM** 
✅ **支持多种导入方式**
✅ **完整的 CI/CD 流程**
✅ **企业级文档和社区标准**
✅ **自动化发布流程**

您的 hooks 库现在可以被全世界的开发者使用了！🌍

---

## 🆘 故障排除

### 常见问题

**Q: git subtree 失败**
```bash
# 清理并重试
git branch -D hooks-standalone
./extract-hooks.sh https://github.com/your-username/ai-code-hooks.git
```

**Q: NPM 发布权限错误**
```bash
# 检查登录状态
npm whoami

# 重新登录
npm login
```

**Q: GitHub Actions 失败**
- 检查 NPM_TOKEN 是否正确设置
- 确认 package.json 中的包名没有冲突

需要帮助？[创建 Issue](https://github.com/your-username/ai-code-hooks/issues) 📝 