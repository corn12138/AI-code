# 🚀 GitHub Pages 部署故障排除指南

如果你访问 `https://corn12138.github.io/ai-code-hooks/` 遇到 404 错误，请按照以下步骤解决：

## 🔧 步骤 1: 检查 GitHub Pages 设置

1. **访问仓库设置**
   - 进入 `https://github.com/corn12138/ai-code-hooks`
   - 点击 **Settings** 选项卡
   - 在左侧菜单找到 **Pages**

2. **配置 Pages 设置**
   ```
   Source: GitHub Actions
   Branch: 不选择任何分支 (使用 GitHub Actions)
   ```

3. **确认设置**
   - 如果显示 "Deploy from a branch"，改为 "GitHub Actions"
   - 保存设置

## 🔧 步骤 2: 检查 GitHub Actions

1. **查看 Actions 状态**
   - 在仓库页面点击 **Actions** 选项卡
   - 查看 "Deploy Docs" 工作流是否运行成功

2. **手动触发构建**
   - 点击 "Deploy Docs" 工作流
   - 点击 "Run workflow" 按钮
   - 选择 `main` 分支并运行

## 🔧 步骤 3: 验证文件结构

确保仓库根目录有以下文件：
```
.github/workflows/docs.yml  ✅
.dumirc.ts                  ✅
docs/                       ✅
src/                        ✅
package.json               ✅
```

## 🔧 步骤 4: 网络推送问题解决

如果遇到网络推送问题，可以尝试：

### 方案 A: 重试推送
```bash
# 在 shared/hooks 目录下
git push hooks-origin main
```

### 方案 B: 使用 SSH (如果 HTTPS 有问题)
```bash
# 检查远程 URL
git remote -v

# 如果是 HTTPS，改为 SSH
git remote set-url hooks-origin git@github.com:corn12138/ai-code-hooks.git

# 推送
git push hooks-origin main
```

### 方案 C: 手动上传文件
1. 在 GitHub 网页界面直接上传修改的文件
2. 特别是 `.dumirc.ts` 和 `docs/examples.md`

## 🔧 步骤 5: 临时解决方案 - 手动部署

如果以上都不行，可以手动部署：

1. **本地构建**
   ```bash
   cd shared/hooks
   npm run docs:build
   ```

2. **上传到 GitHub Pages**
   - 创建一个新分支 `gh-pages`
   - 将 `docs-dist` 内容复制到这个分支
   - 在 Pages 设置中选择 `gh-pages` 分支

## 🔧 步骤 6: 验证部署

成功后，应该能在以下地址访问：
- **主页**: https://corn12138.github.io/ai-code-hooks/
- **快速开始**: https://corn12138.github.io/ai-code-hooks/guide
- **示例**: https://corn12138.github.io/ai-code-hooks/examples

## 🚨 常见问题

### Q: 为什么路径是 /ai-code-hooks/ ？
A: 这是基于仓库名称自动设置的 GitHub Pages 路径。

### Q: 可以改为自定义域名吗？
A: 可以！在 Pages 设置中添加自定义域名。

### Q: Actions 运行失败怎么办？
A: 检查 Actions 日志，通常是依赖安装或构建问题。

## 🛠️ 调试命令

```bash
# 检查本地构建
npm run docs:build

# 检查构建产物
ls -la docs-dist/

# 预览本地构建
npm run docs:preview

# 检查远程状态
git status
git log --oneline -3
```

## 📞 如果还是无法解决

1. 检查 GitHub Actions 日志
2. 确认网络连接稳定
3. 尝试在不同网络环境下访问
4. 等待 5-10 分钟后重试 (GitHub Pages 有缓存)

---

**快速链接**:
- 📦 NPM 包: https://www.npmjs.com/package/@corn12138/hooks
- 🔗 GitHub 仓库: https://github.com/corn12138/ai-code-hooks
- 📖 文档站点: https://corn12138.github.io/ai-code-hooks/ 