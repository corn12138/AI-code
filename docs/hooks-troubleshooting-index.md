# Hooks 问题快速索引

本文档为您提供快速定位和解决 `@ai-code/hooks` 相关问题的索引。

## 🚨 紧急问题快速解决

### 模块找不到
```bash
Error: Cannot resolve module '@ai-code/hooks'
```
**快速解决**: 检查 [模块解析问题](./hooks-migration-issues-solutions.md#1-模块解析问题)

### 构建失败
```bash
Error: Cannot find module '@ai-code/hooks/dist/index.js'
```
**快速解决**: 检查 [构建顺序问题](./hooks-migration-issues-solutions.md#2-构建顺序问题)

### 热重载不工作
开发时修改hooks代码不生效
**快速解决**: 检查 [热重载失效](./hooks-migration-issues-solutions.md#3-热重载失效)

### 类型错误
```bash
Type 'X' is not assignable to type 'Y'
```
**快速解决**: 检查 [类型定义冲突](./hooks-migration-issues-solutions.md#2-类型定义冲突)

---

## 📚 按问题类型分类

### 🔧 迁移阶段
- [重复代码识别和统一](./hooks-migration-issues-solutions.md#1-重复代码识别和统一)
- [类型定义冲突](./hooks-migration-issues-solutions.md#2-类型定义冲突)
- [依赖关系梳理](./hooks-migration-issues-solutions.md#3-依赖关系梳理)

### 🔗 集成阶段
- [模块解析问题](./hooks-migration-issues-solutions.md#1-模块解析问题)
- [构建顺序问题](./hooks-migration-issues-solutions.md#2-构建顺序问题)
- [热重载失效](./hooks-migration-issues-solutions.md#3-热重载失效)

### 📖 文档化阶段
- [Dumi配置冲突](./hooks-migration-issues-solutions.md#1-dumi配置冲突)
- [示例代码执行错误](./hooks-migration-issues-solutions.md#2-示例代码执行错误)
- [交互式示例实现困难](./hooks-migration-issues-solutions.md#3-交互式示例实现困难)

### 🏗️ 构建打包
- [Father构建配置优化](./hooks-migration-issues-solutions.md#1-father构建配置优化)
- [类型定义文件生成](./hooks-migration-issues-solutions.md#2-类型定义文件生成)

### 🔄 项目依赖
- [循环依赖检测](./hooks-migration-issues-solutions.md#1-循环依赖检测)
- [版本同步问题](./hooks-migration-issues-solutions.md#2-版本同步问题)

---

## 🛠️ 常用命令

### 构建相关
```bash
# 单独构建hooks包
cd shared/hooks && pnpm build

# 构建所有依赖hooks的项目
pnpm -r --filter '@ai-code/hooks' build && pnpm -r build

# 检查构建结果
ls -la shared/hooks/dist/
```

### 开发调试
```bash
# 启动hooks文档服务
cd shared/hooks && pnpm dev

# 同时启动多个项目进行调试
pnpm -r --parallel dev

# 检查模块是否正确链接
pnpm list @ai-code/hooks
```

### 依赖检查
```bash
# 检查循环依赖
npx madge --circular --extensions ts,tsx shared/hooks/src

# 检查类型
cd shared/hooks && pnpm tsc --noEmit

# 检查包版本一致性
pnpm list @ai-code/hooks --depth=0
```

---

## 🔍 问题诊断流程

### 1. 确定问题类型
- [ ] 编译时错误（构建失败）
- [ ] 运行时错误（页面报错）  
- [ ] 开发体验问题（热重载等）
- [ ] 类型检查错误

### 2. 收集错误信息
- [ ] 完整的错误堆栈
- [ ] 发生问题的具体步骤
- [ ] 相关的配置文件内容
- [ ] Node.js和包管理器版本

### 3. 按优先级排查
1. **检查基础配置**：workspace、tsconfig、package.json
2. **验证构建产物**：确认hooks包已正确构建
3. **检查导入路径**：确认import语句正确
4. **验证类型定义**：确认TypeScript类型无冲突

### 4. 应用解决方案
- 参考 [具体解决方案文档](./hooks-migration-issues-solutions.md)
- 运行相关的检查命令
- 重新构建和测试

---

## 📞 获取帮助

### 内部资源
1. **详细问题文档**: [hooks-migration-issues-solutions.md](./hooks-migration-issues-solutions.md)
2. **实现指南**: [hooks-independence-guide.md](./hooks-independence-guide.md)
3. **技术总结**: [hooks-independence-implementation.md](./hooks-independence-implementation.md)

### 问题报告
如果遇到文档中未涵盖的问题：

1. **收集信息**：
   - 错误截图/日志
   - 重现步骤
   - 环境信息（Node.js版本、操作系统等）

2. **查找相似问题**：
   - 搜索现有文档
   - 检查项目issue历史

3. **报告问题**：
   - 创建详细的问题报告
   - 提供最小重现示例
   - 说明期望的行为

---

## 🎯 预防措施

### 开发最佳实践
- ✅ 修改hooks代码前先运行测试
- ✅ 保持workspace配置同步
- ✅ 定期检查依赖版本一致性
- ✅ 及时更新文档和类型定义

### 监控检查
- ✅ 设置CI/CD检查hooks构建
- ✅ 定期运行循环依赖检查
- ✅ 监控包体积变化
- ✅ 验证向后兼容性

---

**最后更新**: 2024年7月
**维护**: AI-Code开发团队 