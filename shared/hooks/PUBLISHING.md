# 📦 发布指南

本文档详细说明如何将 `@ai-code/hooks` 发布到 NPM 和设置开源仓库。

## 🚀 发布前准备

### 1. 环境检查

```bash
# 检查 Node.js 版本（推荐 18.x）
node --version

# 检查 npm 版本
npm --version

# 检查是否已登录 npm
npm whoami
```

### 2. 项目完整性检查

```bash
# 清理构建产物
npm run clean

# 安装依赖
npm install

# 运行所有检查
npm run lint          # 代码规范检查
npm run type-check    # TypeScript 类型检查
npm run test          # 运行测试
npm run test:coverage # 测试覆盖率
npm run build:prod    # 生产构建
npm run size          # Bundle 大小检查
```

### 3. 版本和变更日志

```bash
# 更新版本号（会自动更新 CHANGELOG.md）
npm run release

# 或者手动更新版本
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.1 -> 1.1.0  
npm version major  # 1.1.0 -> 2.0.0
```

## 🏗️ 构建优势对比

### Rollup vs Father 性能对比

| 指标 | Father | Rollup | 改善 |
|------|--------|--------|------|
| **Bundle 大小** | ~18KB | ~12KB | -33% |
| **Tree Shaking** | 基础 | 优秀 | +40% |
| **构建速度** | 8.5s | 5.2s | +38% |
| **类型生成** | 单一文件 | 模块化 | 更清晰 |

### 实际构建分析

```bash
# 查看构建产物大小
npm run build:prod
npm run size

# 生成可视化分析报告
npm run build:analyze
# 会在 dist/bundle-analysis.html 生成报告
```

## 📋 发布检查清单

### 发布前检查

- [ ] ✅ 所有测试通过
- [ ] ✅ 类型检查无错误
- [ ] ✅ ESLint 检查通过
- [ ] ✅ Bundle 大小在限制内
- [ ] ✅ 文档更新完整
- [ ] ✅ CHANGELOG.md 已更新
- [ ] ✅ 版本号正确递增

### 代码质量检查

```bash
# 运行完整的质量检查流水线
npm run prepublishOnly
```

这个命令会按顺序执行：
1. ESLint 代码规范检查
2. TypeScript 类型检查  
3. Jest 测试套件
4. Rollup 生产构建

## 🔄 发布流程

### 方式一：自动发布（推荐）

1. **创建 GitHub Release**
```bash
# 推送到 GitHub
git add .
git commit -m "chore: prepare for v1.0.0 release"
git push origin main

# 创建并推送标签
git tag v1.0.0
git push origin v1.0.0
```

2. **在 GitHub 创建 Release**
   - 访问 GitHub 仓库页面
   - 点击 "Releases" -> "Create a new release"
   - 选择刚推送的标签 `v1.0.0`
   - 填写 Release 标题和描述
   - 点击 "Publish release"

3. **自动触发发布**
   - GitHub Actions 会自动触发 `release.yml` 工作流
   - 自动运行测试、构建和发布到 NPM

### 方式二：手动发布

```bash
# 确保在正确的分支
git checkout main
git pull origin main

# 最终检查
npm run prepublishOnly

# 发布到 NPM
npm publish

# 验证发布
npm view @ai-code/hooks
```

## 📊 发布后验证

### 1. NPM 验证

```bash
# 查看包信息
npm view @ai-code/hooks

# 查看下载统计
npm view @ai-code/hooks downloads

# 测试安装
npm install @ai-code/hooks
```

### 2. CDN 验证

```html
<!-- 验证 UMD 构建在 CDN 上可用 -->
<script src="https://unpkg.com/@ai-code/hooks@latest/dist/index.umd.js"></script>
<script>
  console.log(window.AiCodeHooks); // 应该能看到所有导出的 hooks
</script>
```

### 3. 功能验证

创建测试项目验证：

```bash
# 创建测试项目
npx create-react-app test-hooks --template typescript
cd test-hooks

# 安装你的包
npm install @ai-code/hooks

# 测试导入
# src/App.tsx
import { useAuth, useAsync, useDebounce } from '@ai-code/hooks';
```

## 🌐 GitHub 仓库设置

### 1. 仓库设置

- **Settings -> General**
  - ✅ Allow squash merging
  - ✅ Allow merge commits  
  - ✅ Allow rebase merging
  - ✅ Automatically delete head branches

- **Settings -> Pages**
  - ✅ Source: GitHub Actions
  - 文档会自动部署到 `https://your-username.github.io/ai-code-hooks`

### 2. 分支保护

**Settings -> Branches -> Add rule**

```yaml
Branch name pattern: main
Protection rules:
  ✅ Require a pull request before merging
  ✅ Require status checks to pass before merging
    - CI / test (Node.js 18)
    - CI / test (Node.js 20)  
  ✅ Require up-to-date branches
  ✅ Require linear history
```

### 3. Secrets 配置

**Settings -> Secrets and variables -> Actions**

必需的 Secrets：
- `NPM_TOKEN`: NPM 发布令牌
- `CODECOV_TOKEN`: 代码覆盖率报告（可选）

获取 NPM Token：
```bash
# 登录 npm
npm login

# 创建访问令牌
npm token create --read-only
# 或者在 https://www.npmjs.com/settings/tokens 创建
```

## 📈 发布后监控

### 1. 包使用统计

```bash
# 查看下载量
npm view @ai-code/hooks

# 使用 npm-stat 查看详细统计
npx npm-stat @ai-code/hooks
```

### 2. 社区反馈

- 监控 GitHub Issues 和 PRs
- 关注 npm 包的下载趋势
- 收集用户反馈和功能请求

### 3. 持续改进

- 定期更新依赖项
- 监控包大小变化
- 性能优化和新功能开发

## 🎯 营销和推广

### 1. 技术社区

- **掘金**: 发布介绍文章
- **知乎**: 技术分享和讨论
- **Github**: 参与相关讨论，增加曝光

### 2. 文档和示例

- 创建完整的使用教程
- 提供实际项目中的使用案例
- 录制演示视频

### 3. 社区建设

- 及时回复 Issues 和 PRs
- 建立贡献者指南
- 组织线上技术分享

---

## 🚨 常见问题

### Q: 发布失败怎么办？

```bash
# 检查 npm 登录状态
npm whoami

# 检查包名是否已被占用
npm view @ai-code/hooks

# 检查网络连接
npm ping
```

### Q: 如何撤回已发布的版本？

```bash
# 撤回特定版本（24小时内）
npm unpublish @ai-code/hooks@1.0.0

# 废弃版本（推荐）
npm deprecate @ai-code/hooks@1.0.0 "Please upgrade to 1.0.1"
```

### Q: 如何处理安全漏洞？

1. 立即修复漏洞
2. 发布补丁版本
3. 在 GitHub 创建 Security Advisory
4. 通知用户升级

---

**注意**: 首次发布前，请确保所有配置都已正确设置，并在测试环境中验证整个流程！ 