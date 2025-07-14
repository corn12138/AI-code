# Next.js 全栈迁移问题排查手册

## 概述

本文档专门记录了在 Next.js 全栈迁移过程中遇到的各种问题及其解决方案，便于快速查阅和解决类似问题。

## 问题分类索引

- [数据库连接问题](#数据库连接问题)
- [Next.js 路由问题](#nextjs-路由问题)
- [数据格式问题](#数据格式问题)
- [认证授权问题](#认证授权问题)
- [环境配置问题](#环境配置问题)
- [Prisma 相关问题](#prisma-相关问题)

---

## 数据库连接问题

### 问题 1: PostgreSQL 认证失败

**错误信息**:
```
Invalid `prisma.user.findUnique()` invocation:
Error occurred during query execution:
ConnectorError(ConnectorError { 
  user_facing_error: None, 
  kind: QueryError(PostgresError { 
    code: "28P01", 
    message: "password authentication failed for user \"app_user\"", 
    severity: "FATAL", 
    detail: None, 
    column: None, 
    hint: None 
  }) 
})
```

**问题原因**:
- 数据库用户密码错误
- SSH 隧道配置问题
- 数据库连接字符串格式错误

**解决步骤**:
1. **检查 SSH 隧道**:
   ```bash
   ssh -L 6543:localhost:5432 user@your-server
   ```

2. **测试数据库连接**:
   ```bash
   psql -h localhost -p 6543 -U app_user -d blogdb
   ```

3. **验证环境变量**:
   ```env
   DATABASE_URL="postgresql://app_user:correct_password@localhost:6543/blogdb?schema=public"
   ```

4. **重新生成 Prisma 客户端**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

**验证方法**:
```bash
curl -s http://localhost:3000/api/health | jq .
```

---

### 问题 2: 数据库表不存在

**错误信息**:
```
Error: Table 'public.users' doesn't exist in the current database.
```

**问题原因**:
- 数据库迁移未执行
- Prisma schema 与数据库不同步

**解决步骤**:
1. **执行数据库迁移**:
   ```bash
   npx prisma db push --force-reset
   ```

2. **生成 Prisma 客户端**:
   ```bash
   npx prisma generate
   ```

3. **验证表结构**:
   ```bash
   npx prisma studio
   ```

---

## Next.js 路由问题

### 问题 3: 动态路由参数冲突

**错误信息**:
```
Error: You cannot use different slug names for the same dynamic path ('id' !== 'name').
```

**问题原因**:
- 同一路径层级存在不同的动态参数名称
- 路由文件冲突：`/api/tags/[name]/articles/route.ts` 和 `/api/tags/[id]/route.ts`

**解决步骤**:
1. **删除冲突路由**:
   ```bash
   rm -rf apps/blog/src/app/api/tags/[name]
   ```

2. **重新组织路由结构**:
   ```
   /api/tags/[id]/route.ts          # 支持 ID/name/slug
   /api/tags/[id]/articles/route.ts # 支持 ID/name/slug
   ```

3. **修改API逻辑支持多种参数**:
   ```typescript
   const tag = await prisma.tag.findFirst({
     where: {
       OR: [
         { id: id },
         { name: id },
         { slug: id }
       ]
     }
   });
   ```

**验证方法**:
```bash
# 测试不同参数类型
curl -s "http://localhost:3000/api/tags/javascript"        # 通过 name
curl -s "http://localhost:3000/api/tags/javascript-tips"   # 通过 slug
curl -s "http://localhost:3000/api/tags/uuid-id"          # 通过 ID
```

---

### 问题 4: 路由文件命名规则

**错误信息**:
```
Error: Only one dynamic route segment is allowed per path level.
```

**问题原因**:
- 路由文件命名不符合 Next.js 规范
- 嵌套动态路由结构错误

**解决方案**:
1. **正确的路由结构**:
   ```
   ✅ /api/tags/[id]/route.ts
   ✅ /api/tags/[id]/articles/route.ts
   ❌ /api/tags/[id]/[name]/route.ts
   ```

2. **路由文件命名规则**:
   - 使用方括号 `[]` 表示动态路由
   - 每个层级只能有一个动态参数
   - 使用下划线 `_` 表示路由组（不影响URL结构）

---

## 数据格式问题

### 问题 5: 前后端数据格式不匹配

**错误现象**:
- 前端显示"数据格式错误"
- API 返回数据但前端无法正确解析

**问题原因**:
- 前端期望 `{ data: [...] }` 格式
- 后端实际返回 `{ tags: [...] }` 格式

**解决步骤**:
1. **检查 API 返回格式**:
   ```bash
   curl -s "http://localhost:3000/api/tags" | jq .
   ```

2. **统一数据格式**:
   ```typescript
   // 后端 API 返回
   return createApiResponse({
     tags: tagList  // 确保字段名一致
   });
   
   // 前端处理
   if (Array.isArray(data.tags)) {
     setTags(data.tags);  // 匹配后端字段名
   }
   ```

3. **添加类型定义**:
   ```typescript
   interface ApiResponse<T> {
     tags?: T[];
     articles?: T[];
     user?: T;
     // 其他字段...
   }
   ```

---

### 问题 6: 数据库字段映射错误

**错误信息**:
```
Error: Unknown field 'articleCount' on model 'Tag'
```

**问题原因**:
- 前端使用了不存在的字段
- Prisma 查询未包含计算字段

**解决方案**:
1. **使用 Prisma 的 `_count` 功能**:
   ```typescript
   const tags = await prisma.tag.findMany({
     include: {
       _count: {
         select: {
           articles: {
             where: { published: true }
           }
         }
       }
     }
   });
   
   // 转换为前端期望的格式
   const transformedTags = tags.map(tag => ({
     ...tag,
     articleCount: tag._count.articles
   }));
   ```

---

## 认证授权问题

### 问题 7: JWT Token 验证失败

**错误信息**:
```
{
  "error": "Invalid token",
  "code": "INVALID_TOKEN"
}
```

**问题原因**:
- JWT_SECRET 配置错误
- Token 格式不正确
- Token 过期

**解决步骤**:
1. **检查环境变量**:
   ```bash
   echo $JWT_SECRET
   ```

2. **验证 Token 格式**:
   ```bash
   # 正确格式
   curl -H "Authorization: Bearer your-jwt-token" http://localhost:3000/api/user/profile
   ```

3. **重新生成 JWT Secret**:
   ```bash
   openssl rand -hex 32
   ```

4. **检查 Token 过期时间**:
   ```typescript
   export function generateToken(userId: string, roles: string[]): string {
     return jwt.sign(
       { userId, roles },
       process.env.JWT_SECRET!,
       { expiresIn: '7d' }  // 确保过期时间合适
     );
   }
   ```

---

### 问题 8: 中间件无法正确拦截请求

**错误现象**:
- 保护的路由仍然可以无认证访问
- 中间件未生效

**问题原因**:
- 中间件配置错误
- 路由匹配规则有误

**解决方案**:
1. **检查中间件配置**:
   ```typescript
   // src/middleware.ts
   export const config = {
     matcher: '/api/:path*',  // 确保匹配规则正确
   };
   ```

2. **验证中间件是否生效**:
   ```typescript
   export function middleware(request: NextRequest) {
     console.log('Middleware triggered for:', request.nextUrl.pathname);
     // 其他逻辑...
   }
   ```

---

## 环境配置问题

### 问题 9: 环境变量未加载

**错误信息**:
```
Error: Environment variable JWT_SECRET is not defined
```

**问题原因**:
- `.env.local` 文件位置错误
- 环境变量名称拼写错误
- Next.js 环境变量加载顺序问题

**解决步骤**:
1. **检查文件位置**:
   ```bash
   ls -la apps/blog/.env.local
   ```

2. **验证变量名称**:
   ```bash
   # 正确的变量名
   JWT_SECRET=your-secret-key
   DATABASE_URL=your-database-url
   ```

3. **重启开发服务器**:
   ```bash
   pnpm run dev
   ```

4. **添加环境变量验证**:
   ```typescript
   if (!process.env.JWT_SECRET) {
     throw new Error('JWT_SECRET is not defined');
   }
   ```

---

### 问题 10: 生产环境配置差异

**问题原因**:
- 开发环境和生产环境配置不一致
- 环境变量在不同环境中未正确设置

**解决方案**:
1. **创建环境配置模板**:
   ```bash
   # .env.example
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   JWT_SECRET=your-jwt-secret
   NEXTAUTH_SECRET=your-nextauth-secret
   ```

2. **使用配置验证**:
   ```typescript
   const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'NEXTAUTH_SECRET'];
   
   for (const envVar of requiredEnvVars) {
     if (!process.env[envVar]) {
       throw new Error(`Missing required environment variable: ${envVar}`);
     }
   }
   ```

---

## Prisma 相关问题

### 问题 11: Prisma 客户端版本冲突

**错误信息**:
```
Error: The client and server are not compatible. Client version: 4.5.0, Server version: 4.6.0
```

**解决步骤**:
1. **更新 Prisma 包**:
   ```bash
   pnpm update prisma @prisma/client
   ```

2. **重新生成客户端**:
   ```bash
   npx prisma generate
   ```

3. **清理缓存**:
   ```bash
   rm -rf node_modules/.prisma
   pnpm install
   ```

---

### 问题 12: 数据库连接池耗尽

**错误信息**:
```
Error: Connection pool exhausted. All connections are in use.
```

**解决方案**:
1. **配置连接池**:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname?connection_limit=10&pool_timeout=20"
   ```

2. **优化 Prisma 客户端**:
   ```typescript
   const prisma = new PrismaClient({
     datasources: {
       db: {
         url: process.env.DATABASE_URL,
       },
     },
   });
   
   // 确保在应用关闭时断开连接
   process.on('beforeExit', async () => {
     await prisma.$disconnect();
   });
   ```

---

## 调试技巧

### 1. 启用详细日志

```typescript
// 在 Prisma 客户端中启用日志
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

### 2. 使用 Prisma Studio

```bash
npx prisma studio
```

### 3. 数据库查询调试

```bash
# 直接连接数据库查看数据
psql -h localhost -p 6543 -U app_user -d blogdb

# 查看表结构
\d+ users
\d+ articles
\d+ tags
```

### 4. API 端点测试

```bash
# 健康检查
curl -s http://localhost:3000/api/health | jq .

# 测试认证
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# 测试受保护的端点
curl -H "Authorization: Bearer your-token" \
  http://localhost:3000/api/user/profile
```

---

## 常用命令速查

### 数据库相关
```bash
# 推送 schema 到数据库
npx prisma db push

# 重置数据库
npx prisma db push --force-reset

# 生成 Prisma 客户端
npx prisma generate

# 运行 Prisma Studio
npx prisma studio

# 查看数据库状态
npx prisma db status
```

### 开发调试
```bash
# 启动开发服务器
pnpm run dev

# 构建生产版本
pnpm run build

# 检查 TypeScript 类型
pnpm run type-check

# 检查代码格式
pnpm run lint
```

### 测试验证
```bash
# 测试 API 健康状态
curl -s http://localhost:3000/api/health

# 测试标签API
curl -s http://localhost:3000/api/tags | jq .

# 测试文章API
curl -s "http://localhost:3000/api/articles?page=1&limit=5" | jq .
```

---

## 总结

通过系统性地记录和解决这些问题，我们积累了宝贵的经验：

1. **预防胜于治疗**: 完善的环境变量验证和错误处理
2. **工具化调试**: 使用 Prisma Studio、日志和curl进行调试
3. **文档化**: 详细记录问题和解决方案
4. **测试驱动**: 每个修复都要有相应的验证方法

这些经验和解决方案将为未来的项目开发提供重要参考。

---

*最后更新: 2025-01-13*  
*状态: 持续更新中* 