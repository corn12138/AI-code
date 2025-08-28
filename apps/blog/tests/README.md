# 测试脚本

本目录包含项目的各种测试脚本，用于验证功能和服务配置。

## 📁 测试脚本列表

### 📧 邮件服务测试
- **test-email.js** - 基础邮件发送测试
  - 用途：测试邮件服务的基本功能
  - 运行：`node tests/test-email.js`

### 🔐 SMTP 连接测试
- **test-smtp.js** - SMTP 基础连接测试
  - 用途：验证 SMTP 服务器连接配置
  - 运行：`node tests/test-smtp.js`

- **test-smtp-secure.js** - SMTP 安全连接测试
  - 用途：测试 SMTP 的 SSL/TLS 安全连接
  - 运行：`node tests/test-smtp-secure.js`

### ✅ 综合测试
- **test-final.js** - 最终集成测试
  - 用途：运行项目的最终验证测试
  - 运行：`node tests/test-final.js`

## 🚀 使用方法

### 运行所有测试
```bash
# 运行所有测试脚本
for test in tests/test-*.js; do
    echo "Running $test..."
    node "$test"
done
```

### 运行特定测试
```bash
# 测试邮件服务
node tests/test-email.js

# 测试 SMTP 连接
node tests/test-smtp.js

# 测试安全 SMTP 连接
node tests/test-smtp-secure.js

# 运行最终测试
node tests/test-final.js
```

## 📝 测试前准备

1. **环境变量配置**
   - 确保 `.env` 文件已正确配置
   - 验证邮件服务相关环境变量

2. **依赖安装**
   - 确保所有依赖已安装：`npm install`
   - 验证 nodemailer 等邮件相关包

3. **服务状态**
   - 确保数据库服务运行正常
   - 验证邮件服务器可访问

## 🔧 故障排除

### 常见问题
- **SMTP 连接失败**：检查服务器地址和端口配置
- **认证失败**：验证用户名和密码
- **SSL 证书问题**：检查证书配置或使用 `rejectUnauthorized: false`

### 调试模式
```bash
# 启用详细日志
DEBUG=* node tests/test-smtp.js
```

---

*最后更新: 2025-01-27*
