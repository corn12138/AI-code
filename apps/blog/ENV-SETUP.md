# 环境变量配置指南

## 🔧 创建环境变量文件

请在 `apps/blog/` 目录下创建 `.env.local` 文件，并添加以下配置：

### 方式一：使用现有 server 数据库（推荐）

```env
# 数据库配置 - 使用现有 server 项目的数据库
DATABASE_URL="postgresql://app_user:blogpassword@localhost:6543/blogdb?schema=public"

# JWT 认证配置
JWT_SECRET="your-super-secret-jwt-key-replace-this-in-production"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# 密码加密配置
BCRYPT_SALT_ROUNDS="12"

# Next.js 配置
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-replace-this-in-production"

# 文件上传配置
UPLOAD_MAX_SIZE="10485760"
UPLOAD_ALLOWED_TYPES="image/jpeg,image/png,image/gif,image/webp"

# 过渡期配置（迁移完成后可删除）
SERVER_URL="http://localhost:3001"

# 开发环境配置
NODE_ENV="development"

# 安全配置
CSRF_ENABLED="true"
CSRF_SECRET="csrf-secret-key-replace-this-in-production"
```

### 方式二：创建新数据库

如果您想创建全新的数据库：

```env
# 数据库配置 - 新数据库
DATABASE_URL="postgresql://username:password@localhost:5432/blog_db?schema=public"
# 其他配置与方式一相同...
```

## 📋 创建步骤

1. **创建文件**：
   ```bash
   touch .env.local
   ```

2. **编辑文件**：
   使用您喜欢的编辑器打开 `.env.local` 文件并粘贴上述配置

3. **修改配置**：
   - 替换 `your-super-secret-jwt-key-replace-this-in-production` 为强密码
   - 替换 `your-nextauth-secret-key-replace-this-in-production` 为强密码
   - 如果使用新数据库，修改 `DATABASE_URL` 中的用户名、密码等

## 🔐 生成安全密钥

您可以使用以下命令生成安全的密钥：

```bash
# 生成 JWT 密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 生成 NextAuth 密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 生成 CSRF 密钥
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

## ✅ 验证配置

创建文件后，运行以下命令验证配置：

```bash
# 验证环境变量是否正确加载
npm run build
```

## 📝 注意事项

1. **安全性**：不要将 `.env.local` 文件提交到 Git
2. **数据库**：确保数据库服务正在运行
3. **端口**：确保配置的端口没有被占用
4. **权限**：确保数据库用户有适当的权限

## 🚨 常见问题

### Q: 数据库连接失败
- 检查数据库服务是否运行
- 验证用户名、密码、数据库名是否正确
- 确认端口是否正确

### Q: 权限错误
- 确保数据库用户有 CREATE、SELECT、INSERT、UPDATE、DELETE 权限

### Q: 环境变量不生效
- 重启开发服务器
- 检查文件名是否为 `.env.local`
- 确认文件在正确的目录下 