# 贡献指南

感谢您有兴趣为博客与低代码平台项目做出贡献！这份文档将指导您如何参与项目开发。

## 如何贡献

您可以通过以下方式贡献：

1. 报告错误和问题
2. 提交功能请求
3. 编写和改进文档
4. 提交代码修复或新功能

## 开发流程

### 1. Fork 和克隆代码库

1. 在GitHub上Fork项目仓库
2. 克隆您的Fork到本地
   ```bash
   git clone https://github.com/YOUR_USERNAME/AI-code.git
   ```
3. 设置上游仓库
   ```bash
   git remote add upstream https://github.com/original-owner/AI-code.git
   ```

### 2. 创建分支

为您的工作创建一个新分支：

```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/issue-description
```

遵循分支命名约定：
- `feature/`: 新功能
- `fix/`: 错误修复
- `docs/`: 文档更新
- `refactor/`: 代码重构

### 3. 开发和测试

1. 进行必要的代码更改
2. 遵循项目的[代码规范](./code-standards.md)
3. 添加或更新测试以验证您的更改
4. 确保所有测试通过：
   ```bash
   npm test
   ```

### 4. 提交更改

1. 遵循[约定式提交](https://www.conventionalcommits.org/)规范：
   ```bash
   git commit -m "feat(component): 添加新的组件功能"
   git commit -m "fix(api): 修复认证错误"
   ```

2. 如果需要，将多个提交压缩成一个有意义的提交

### 5. 保持分支最新

定期从上游拉取更改，以确保您的代码与最新版本兼容：

```bash
git fetch upstream
git rebase upstream/main
```

如果遇到冲突，请解决它们并继续rebase：
```bash
git add .
git rebase --continue
```

### 6. 推送更改

将您的分支推送到您的Fork：

```bash
git push origin feature/your-feature-name
```

### 7. 创建合并请求 (Pull Request)

1. 在GitHub上导航到您的Fork
2. 点击"Pull Request"按钮
3. 选择您的分支和目标分支（通常是main或master）
4. 提供详细描述，包括：
   - 您解决的问题或实现的功能
   - 实现方法
   - 测试方法
   - 任何需要注意的事项
5. 点击"Create pull request"

## 行为准则

我们致力于为所有贡献者和参与者提供一个友好、安全和热情的环境。本项目采纳并期望所有参与者遵守[Contributor Covenant行为准则](https://www.contributor-covenant.org/version/2/1/code_of_conduct/)。

核心原则包括：
- **尊重**: 尊重所有人的观点、经验和身份。
- **协作**: 鼓励建设性的讨论和协作。
- **包容**: 努力创造一个让每个人都感到受欢迎和有价值的环境。
- **专业**: 在所有互动中保持专业和礼貌。

任何违反行为准则的行为都可能导致被禁止参与项目。如果您遇到或目睹不可接受的行为，请联系项目维护者。

## 报告问题

提交问题时，请包含：

1. 问题的明确描述
2. 重现步骤
3. 预期行为和实际行为
4. 环境信息（浏览器、操作系统等）
5. 可能的解决方案
6. 相关的截图或日志

## 代码审查

合并请求将由项目维护者审查。审查过程中可能需要：

1. 解决代码风格问题
2. 添加更多测试
3. 简化或优化实现
4. 更新文档

## Pull Request (PR) 生命周期

1.  **创建PR**: 按照上述流程创建PR，确保描述清晰，关联相关Issue。
2.  **自动化检查**: PR提交后，会自动运行CI/CD流程，包括代码风格检查、测试等。确保所有检查通过。
3.  **代码审查**: 项目维护者或其他贡献者会对PR进行审查，可能会提出修改建议或问题。
4.  **讨论与修改**: 积极参与讨论，根据反馈修改您的代码。推送新的提交到您的分支会自动更新PR。
5.  **批准与合并**: 一旦审查通过且所有检查通过，维护者会将PR合并到目标分支。
6.  **关闭**: PR合并后会自动关闭。相关的Issue也可能随之关闭。

## 开发环境

请参考[开发环境设置](./setup.md)文档设置您的开发环境。

## 文档贡献

我们非常重视文档更新：

1. 确保文档与代码保持同步
2. 使用清晰简洁的语言
3. 提供示例和使用说明
4. 修复拼写和语法错误

## 感谢

您的贡献对项目至关重要！我们感谢您的时间和精力。
