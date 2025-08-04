# 邮件服务和重置密码功能设置指南

## 📧 功能概述

本系统已实现完整的邮件验证功能：
- ✅ 密码重置（通过邮件链接）
- ✅ 邮箱验证码登录
- ✅ 防滥用机制（频率限制、尝试次数限制）
- ✅ 美观的邮件模板
- ✅ 完整的前端页面

## 🔧 环境变量配置

在您的 `.env` 文件中添加以下配置：

```env
# 邮件服务配置
SMTP_HOST="smtp.163.com"
SMTP_PORT="587"
SMTP_USER="your-email@163.com"
SMTP_PASS="your-smtp-authorization-code"
SENDER_NAME="AI博客系统"

# 应用URL（用于生成重置链接）
NEXTAUTH_URL="http://localhost:3000"
```

## 📮 163邮箱配置步骤

### 1. 开启SMTP服务
1. 登录163邮箱
2. 进入设置 → POP3/SMTP/IMAP
3. 开启IMAP/SMTP服务
4. 设置授权码（这个授权码就是SMTP_PASS）

### 2. 获取授权码
- 在163邮箱设置中生成客户端授权码
- 将授权码作为 `SMTP_PASS` 的值
- **注意：不是邮箱登录密码，是专门的授权码**

### 3. 常用邮箱SMTP配置

#### 163邮箱
```env
SMTP_HOST="smtp.163.com"
SMTP_PORT="587"
```

#### QQ邮箱
```env
SMTP_HOST="smtp.qq.com"
SMTP_PORT="587"
```

#### Gmail
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
```

#### 阿里云邮箱
```env
SMTP_HOST="smtp.mxhichina.com"
SMTP_PORT="587"
```

## 🚀 使用方法

### 1. 忘记密码
1. 访问 `/forgot-password`
2. 输入邮箱地址
3. 点击"发送重置链接"
4. 检查邮箱（包括垃圾邮件文件夹）
5. 点击邮件中的重置链接
6. 设置新密码

### 2. 邮箱验证码登录
1. 访问 `/login`
2. 切换到"验证码登录"标签
3. 输入邮箱地址
4. 点击"获取验证码"
5. 输入收到的6位数字验证码
6. 点击"验证码登录"

## 🔒 安全特性

### 防滥用机制
- 每个邮箱每天最多发送10次验证码
- 发送间隔限制：1分钟内只能发送一次
- 验证码有效期：10分钟
- 重置链接有效期：1小时
- 验证码最多尝试3次

### 数据库设计
```sql
-- 验证码表
CREATE TABLE verification_codes (
  id            TEXT PRIMARY KEY,
  code          TEXT NOT NULL,
  email         TEXT NOT NULL,
  type          TEXT NOT NULL, -- 'PASSWORD_RESET', 'EMAIL_LOGIN'
  status        TEXT NOT NULL DEFAULT 'PENDING',
  user_id       TEXT,
  expires_at    TIMESTAMP NOT NULL,
  verified_at   TIMESTAMP,
  revoked_at    TIMESTAMP,
  attempts      INTEGER DEFAULT 0,
  max_attempts  INTEGER DEFAULT 3,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📱 API接口

### 发送验证码
```bash
POST /api/auth/send-verification-code
Content-Type: application/json

{
  "email": "user@example.com",
  "type": "email_login" | "password_reset"
}
```

### 邮箱验证码登录
```bash
POST /api/auth/email-login
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

### 发送重置密码链接
```bash
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### 重置密码
```bash
PUT /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "token": "reset-token-from-email",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

### 验证重置令牌
```bash
GET /api/auth/verify-reset-token?email=user@example.com&token=reset-token
```

## 🎨 页面路由

- `/login` - 登录页面（支持密码和验证码登录）
- `/forgot-password` - 忘记密码页面
- `/reset-password` - 重置密码页面（通过邮件链接访问）

## 🧪 测试

### 开发环境
在开发环境下，验证码会在控制台输出，方便测试：
```javascript
console.log('开发环境验证码:', code);
```

### 生产环境
生产环境下验证码只会通过邮件发送，不会在响应中返回。

## ⚠️ 注意事项

1. **邮件配置**：确保SMTP配置正确，否则邮件发送会失败
2. **授权码**：使用邮箱的授权码，不是登录密码
3. **防火墙**：确保服务器可以访问SMTP端口（通常是587或465）
4. **SSL证书**：生产环境建议使用HTTPS，确保重置链接安全
5. **垃圾邮件**：提醒用户检查垃圾邮件文件夹

## 🔍 故障排除

### 邮件发送失败
1. 检查SMTP配置是否正确
2. 确认授权码是否有效
3. 检查网络连接
4. 查看服务器日志

### 验证码无效
1. 检查验证码是否过期（10分钟）
2. 确认验证码输入正确
3. 检查是否超过最大尝试次数（3次）

### 重置链接无效
1. 检查链接是否过期（1小时）
2. 确认链接格式正确
3. 检查邮箱地址是否匹配

## 📈 扩展功能

可以进一步扩展的功能：
- 短信验证码登录
- 双因素认证
- 邮件模板自定义
- 多语言支持
- 邮件发送统计 