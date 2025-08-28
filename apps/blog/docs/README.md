# Blog 项目文档

## 📚 文档结构

本目录包含了 Next.js 博客项目的所有相关文档，按功能分类组织。

### 📁 文档分类

#### 🔧 Setup (环境设置)
- **ENV-SETUP.md** - 环境变量配置指南
- **EMAIL-SETUP.md** - 邮件服务配置
- **AI-CHAT-SETUP.md** - AI聊天功能设置
- **STANDALONE-SETUP.md** - 独立部署设置

#### 🚀 Deployment (部署)
- **PRODUCTION-DEPLOYMENT-GUIDE.md** - 生产环境部署指南
- **DOCKER-GUIDE.md** - Docker 部署配置

#### 💻 Development (开发)
- **COMPONENT_AUDIT_GUIDE.md** - 组件审查指南
- **REFACTOR_SUMMARY.md** - 重构总结报告
- **TOAST-IMPLEMENTATION-SUMMARY.md** - Toast 组件实现总结

#### 🏗️ Architecture (架构)
- **AI-ANALYTICS-DESIGN.md** - AI 分析系统设计
- **AI-ANALYTICS-IMPLEMENTATION-SUMMARY.md** - AI 分析实现总结
- **PROJECT-COMPLETION-SUMMARY.md** - 项目完成总结

#### 🧪 Testing (测试)
项目的测试文件位于 `/tests` 目录下，包含：
- **test-email.js** - 邮件服务测试
- **test-final.js** - 最终测试
- **test-smtp-secure.js** - SMTP 安全连接测试  
- **test-smtp.js** - SMTP 基础测试

## 🔍 快速导航

### 新手入门
1. 环境设置：[ENV-SETUP.md](setup/ENV-SETUP.md)
2. 项目架构：[PROJECT-COMPLETION-SUMMARY.md](architecture/PROJECT-COMPLETION-SUMMARY.md)
3. 部署指南：[PRODUCTION-DEPLOYMENT-GUIDE.md](deployment/PRODUCTION-DEPLOYMENT-GUIDE.md)

### 开发者
1. 组件开发：[COMPONENT_AUDIT_GUIDE.md](development/COMPONENT_AUDIT_GUIDE.md)
2. 重构指南：[REFACTOR_SUMMARY.md](development/REFACTOR_SUMMARY.md)
3. AI 功能：[AI-ANALYTICS-DESIGN.md](architecture/AI-ANALYTICS-DESIGN.md)

### 运维人员
1. Docker 部署：[DOCKER-GUIDE.md](deployment/DOCKER-GUIDE.md)
2. 独立部署：[STANDALONE-SETUP.md](setup/STANDALONE-SETUP.md)
3. 邮件配置：[EMAIL-SETUP.md](setup/EMAIL-SETUP.md)

## 📝 文档维护

- 所有文档均采用 Markdown 格式
- 请在修改文档时更新对应的时间戳
- 新增文档请更新此 README.md 索引

## 🔗 相关链接

- [项目根目录文档](../../../docs/) - 整个项目的文档
- [测试目录](../tests/) - 测试脚本和工具

---

*最后更新: $(date +%Y-%m-%d)*
