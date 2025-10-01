# 🔒 敏感信息安全修复指南

## 🚨 发现的安全问题

### 1. 数据库密码硬编码
- **文件**: `apps/server/src/config/database-defaults.ts`
- **问题**: 数据库密码 `HYm_7893_hyujs_m` 被硬编码
- **风险**: 高风险 - 任何能访问代码的人都能看到数据库密码

### 2. 脚本中的硬编码密码
- **文件**: 多个数据库脚本文件
- **问题**: 降级密码硬编码
- **风险**: 中风险 - 可能在环境变量缺失时暴露密码

### 3. 开发环境默认密钥
- **文件**: JWT配置文件
- **问题**: 弱默认密钥
- **风险**: 中风险 - 开发环境可能使用弱密钥

## 🛠️ 修复步骤

### 第一步：立即修复硬编码密码

#### 1. 修复 database-defaults.ts
```typescript
// apps/server/src/config/database-defaults.ts
export const DATABASE_DEFAULTS = {
    HOST: 'localhost',
    PORT: 6543,
    USER: 'app_user',
    PASSWORD: '', // 移除硬编码密码，强制使用环境变量
    NAME: 'blogdb',
    LOGGING: true,
    SSL: false,
} as const;
```

#### 2. 修复脚本文件
```typescript
// 所有脚本文件中的密码配置
password: process.env.DATABASE_PASSWORD || (() => {
    throw new Error('DATABASE_PASSWORD environment variable is required');
})(),
```

#### 3. 强化JWT配置
```typescript
// apps/server/src/config/configuration.ts
secret: process.env.JWT_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET is required in production');
    }
    return 'dev-only-secret-' + Math.random().toString(36);
})(),
```

### 第二步：创建环境变量模板

#### 1. 创建 .env.example 文件
```bash
# 数据库配置
DATABASE_HOST=localhost
DATABASE_PORT=6543
DATABASE_USER=app_user
DATABASE_PASSWORD=your_secure_password_here
DATABASE_NAME=blogdb

# JWT配置
JWT_SECRET=your_super_secure_jwt_secret_here

# API密钥 (如果需要)
OPENAI_API_KEY=your_openai_api_key_here
```

#### 2. 更新 .gitignore
```gitignore
# 环境变量文件
.env
.env.local
.env.production
.env.development

# 数据库文件
*.db
*.sqlite

# 日志文件
logs/
*.log
```

### 第三步：更新文档

#### 1. 移除文档中的真实密码
```bash
# 替换所有文档中的真实密码为占位符
DATABASE_URL="postgresql://app_user:YOUR_PASSWORD@localhost:6543/blogdb?schema=public"
```

#### 2. 添加安全提醒
```markdown
⚠️ **安全提醒**: 
- 永远不要在代码中硬编码密码
- 使用强密码和随机生成的密钥
- 定期轮换密码和密钥
```

### 第四步：Git历史清理

#### 1. 检查Git历史
```bash
git log --oneline | grep -i password
git log --oneline | grep -i secret
```

#### 2. 如果需要清理历史 (谨慎操作)
```bash
# 创建备份
git branch backup-before-cleanup

# 使用 git filter-branch 或 BFG Repo-Cleaner
# 注意：这会重写Git历史，需要强制推送
```

### 第五步：实施安全最佳实践

#### 1. 代码审查检查清单
- [ ] 没有硬编码密码
- [ ] 没有硬编码API密钥
- [ ] 环境变量正确使用
- [ ] 敏感信息不在日志中

#### 2. 自动化安全检查
```bash
# 添加pre-commit hook
#!/bin/sh
# 检查是否有敏感信息
if git diff --cached | grep -E "(password|secret|key).*=.*['\"][^'\"]{8,}['\"]"; then
    echo "⚠️ 可能包含硬编码的敏感信息"
    exit 1
fi
```

#### 3. 环境变量验证
```typescript
// 启动时验证必需的环境变量
const requiredEnvVars = [
    'DATABASE_PASSWORD',
    'JWT_SECRET'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}
```

## 🔐 密码安全建议

### 1. 生成强密码
```bash
# 生成随机密码
openssl rand -base64 32

# 生成JWT密钥
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. 密码复杂度要求
- 至少16个字符
- 包含大小写字母、数字、特殊字符
- 不使用字典词汇
- 定期更换

### 3. 密钥管理
- 使用密钥管理服务 (如AWS Secrets Manager)
- 实施密钥轮换策略
- 限制密钥访问权限

## 📋 修复检查清单

- [ ] 移除所有硬编码密码
- [ ] 创建 .env.example 文件
- [ ] 更新 .gitignore
- [ ] 修复文档中的敏感信息
- [ ] 实施环境变量验证
- [ ] 添加安全检查脚本
- [ ] 更新部署文档
- [ ] 通知团队成员更新本地环境

## 🚨 紧急行动项

1. **立即更改数据库密码**
2. **重新生成JWT密钥**
3. **检查是否有其他系统使用了泄露的密码**
4. **更新所有环境的配置**
5. **通知相关人员**

---

**记住**: 安全是一个持续的过程，不是一次性的任务。定期审查和更新安全措施。
