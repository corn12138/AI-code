移动端 + H5 统一 BFF（NestJS）可实施需求与设计方案 v1.0

作者：Hcorn & ChatGPT
日期：2025-10-04 (Asia/Tokyo)
状态：草案 → 可实施
适用端：iOS 原生、Android 原生、H5（嵌入原生 WebView）

⸻

1. 背景与目标
	•	现状：已有基于 NestJS 的后端服务（主要服务 H5）。计划让 iOS/Android 原生 App 也直接接入该服务，形成统一 BFF 层。
	•	问题：不同端对数据粒度、网络条件、发版节奏、兼容周期等存在差异。
	•	目标：在 不拆服务 的前提下，通过 版本化、端区分、契约稳定、缓存与离线友好 的设计，让三端稳定复用同一套接口；并为未来演进为“双 BFF + 共享领域服务”预留清晰边界。

成功标准（验收）：
	1.	三端均在 /v1 稳定运行，接口变更遵循向后兼容；2) 关键页面接口 P95 < 300ms（同区域）；3) 弱网可用、离线写入幂等；4) OpenAPI 文档与 SDK 自动生成；5) 监控与告警闭环（Sentry + Prometheus/Grafana）。

⸻

2. 范围（In/Out Scope）

In：鉴权、用户、内容查询与操作、文件上传（预签名直传）、设备注册与推送 Token、远程配置、增量同步、错误与重试规范、缓存/限流策略、观测与日志、CI/CD、灰度发布。
Out：重型实时系统（如大规模 IM/音视频）、核心域微服务拆分（留待未来演进）、数据分析全链路（仅埋点上报接口）。

⸻

3. 总体架构
	•	客户端（iOS/Android 原生、H5 in WebView）→ API Gateway/Nginx → NestJS（BFF） → 内部资源（DB、Redis、对象存储、消息队列、推送服务 APNs/FCM）
	•	BFF 只做编排与适配：领域逻辑沉在 domain/*（可被未来多 BFF 复用）。

关键设计点：
	•	版本化：URI 版本 /v1（后续 /v2），永不破坏旧版本；以 Sunset 头/文档标记废弃日期。
	•	端差异：路径或头区分（推荐路径 + 头双保险）：/web/v1/...、/mobile/v1/...；并要求请求头 X-Client: web|ios|android、X-App-Version。
	•	契约稳定：仅新增字段；删除/语义变更需新版本；统一错误体与业务码。

⸻

4. API 设计规范

4.1 基础
	•	协议：HTTPS（强制），支持 HTTP/2。
	•	鉴权：OAuth2/OIDC + PKCE。短效 Access Token（1530min）+ 长效 Refresh Token（730d）。
	•	内容：application/json; charset=utf-8。
	•	压缩：启用 gzip/br（服务端 compression()）。
	•	幂等：对 写操作 支持 Idempotency-Key（UUID）头；同 Key 重放返回首个结果。
	•	分页：游标分页 ?cursor=xxx&limit=20；返回 nextCursor。
	•	增量：列表支持 since=<ISO8601>；返回 hasMore。

4.2 错误体

{
  "code": "USER_NOT_FOUND",   // 业务码
  "message": "用户不存在",     // 本地化友好文案（可选 i18n）
  "httpStatus": 404,
  "traceId": "3b7c...",
  "retryable": false            // 是否建议客户端重试
}

HTTP → 业务码映射：200/201 正常；400 参数；401 未授权/过期；403 权限；404 不存在；409 冲突；422 业务校验失败；429 频控；5xx 服务/依赖异常。

4.3 缓存/协商
	•	只读接口：返回 ETag 与 Last-Modified；支持 If-None-Match/If-Modified-Since。
	•	公共资源（图片/配置）：Cache-Control: public, max-age=...；动态数据 no-store 或短 max-age。

⸻

5. 鉴权与安全
	•	登录：授权码 + PKCE（App 内置系统浏览器/SFAuthenticationSession/CustomTabs）。
	•	Token 刷新：POST /auth/v1/token/refresh；返回新 Access Token。
	•	存储：Access/Refresh Token 分别存 Keychain / Android Keystore；H5 用 Secure Cookie + SameSite=Lax。
	•	TLS Pinning：关键接口域名在原生端启用证书锁定（可灰度下发指纹）。
	•	完整性校验（可选）：Apple App Attest / Android Play Integrity；服务端核验设备声明。
	•	防重放/签名（可选）：高风险操作附加 HMAC（X-Signature）。
	•	速率限制：/auth、/upload/presign、写操作按 IP/用户级 rate limit（Redis）。

⸻

6. 关键功能模块与接口草案（V1）

注：以下为 最小可用 接口集合，均为 JSON；Authorization: Bearer <access_token>。

6.1 健康/配置
	•	GET /public/v1/health → { status: 'ok', time, version }
	•	GET /public/v1/config → 远程配置（携带 X-Client/X-App-Version 做差异化）

6.2 认证
	•	POST /auth/v1/token（授权码交换，服务端调用 IdP/OIDC）
	•	POST /auth/v1/token/refresh（刷新）
	•	POST /auth/v1/logout（服务端失效 Refresh，清除会话）

6.3 用户（Web 与 Mobile 可分路径或用头裁剪）
	•	GET /mobile/v1/profile → 精简字段（头像、昵称、计数、最近状态）
	•	GET /web/v1/profile → 全量字段（含权限/偏好等）
	•	PATCH /v1/profile → 更新（幂等，返回最新）

6.4 内容（示例：Feed）
	•	GET /mobile/v1/feed?cursor&limit&since → 聚合后端多源（BFF 聚合）
	•	POST /v1/feed/:id/like（幂等，支持 Idempotency-Key）

6.5 设备与推送
	•	POST /mobile/v1/devices/register
请求：{ platform: 'ios'|'android', deviceToken, locale, appVersion }
返回：{ deviceId }
	•	POST /mobile/v1/devices/unregister
请求：{ deviceId }

6.6 文件直传（预签名）
	•	POST /v1/upload/presign
请求：{ mimeType, size, sha256 } → 返回 { uploadUrl, key, expiresAt, headers }
客户端直传对象存储（S3/OSS）；随后 POST /v1/upload/confirm 保存元信息。

6.7 埋点与诊断
	•	POST /v1/telemetry/events（批量，gzip）
	•	POST /v1/diagnostics/logs（仅白名单）

⸻

7. DTO 示例（节选）

// mobile profile（裁剪版）
interface MobileProfile {
  id: string;
  nickname: string;
  avatarUrl?: string;
  stats: { followers: number; following: number };
  updatedAt: string; // ISO8601
}

// presign 响应
interface PresignResp {
  uploadUrl: string;
  key: string;
  expiresAt: string;
  headers?: Record<string, string>;
}


⸻

8. 服务端实现要点（NestJS）
	•	版本化：app.enableVersioning({ type: VersioningType.URI }) → /v1/*
	•	压缩：app.use(compression())
	•	全局拦截器：CacheInterceptor（只读接口）、TimeoutInterceptor、ClassSerializerInterceptor
	•	端裁剪：X-Client 头 + MobileTrimInterceptor（或分别建 web/mobile 控制器）
	•	统一异常过滤器：转换为标准错误体；写入 traceId
	•	配置化：@nestjs/config 管理多环境；密钥从 KMS/Env 注入

项目结构（建议）：

apps/api/src
 ├─ main.ts
 ├─ common/
 │   ├─ interceptors/
 │   ├─ filters/
 │   ├─ guards/
 │   └─ utils/
 ├─ modules/
 │   ├─ auth/
 │   ├─ user/
 │   ├─ feed/
 │   ├─ device/
 │   ├─ upload/
 │   └─ telemetry/
 └─ domain/                  # 领域服务，供 web/mobile 复用
     ├─ user.domain.ts
     └─ ...


⸻

9. 数据与存储（示例）
	•	PostgreSQL：users、devices、files、events、refresh_tokens
	•	Redis：缓存、限流计数、会话、幂等 Key（TTL 24h）
	•	对象存储：S3/OSS（私有桶 + CDN）

⸻

10. 性能与容量目标（SLO）
	•	可用性：月可用 ≥ 99.9%
	•	延迟（同区域）：P95 API < 300ms，P99 < 800ms
	•	错误率：5xx < 0.2%，429 < 0.5%
	•	吞吐：单实例 500 RPS（读为主）基准；水平扩容

⸻

11. 可观测性与告警
	•	Tracing/日志：traceId 跨端贯通（客户端上报 → 网关 → BFF）
	•	Metrics：QPS、P95/P99、错误率、外部依赖时延、队列积压、对象存储失败率
	•	APM：Sentry（前端/原生/Node） + Prometheus/Grafana
	•	告警：阈值 + 异常突增（rate of change）

⸻

12. 客户端策略（移动端要点）
	•	超时：读 10s、写 15s；网络切换重试退避（200ms×2^n，上限 5s）
	•	缓存：优先读本地 + ETag 验证；弱网仅同步差量（since）
	•	离线写：本地队列 + 幂等 Key；恢复网络后自动补传
	•	灰度：远程配置决定开关、阈值、接口路径白名单

⸻

13. 安全与合规
	•	输入校验：class-validator 全量 DTO 校验
	•	安全头：HSTS、X-Content-Type-Options、Referrer-Policy
	•	依赖扫描：npm audit / Snyk；容器镜像漏洞扫描
	•	日志脱敏：Token、手机号、邮箱、身份证等

⸻

14. CI/CD 与环境
	•	环境：dev / staging / prod（独立 DB/Redis/桶/密钥）
	•	流水线：
	1.	Lint/TypeCheck/Unit（Jest）
	2.	E2E（Supertest + Testcontainers）
	3.	合约测试（Pact，可选）
	4.	构建镜像（docker build）
	5.	数据库迁移（Prisma/TypeORM）
	6.	部署（K8s Helm/Compose）+ 蓝绿/金丝雀
	7.	Smoke/Test + 自动回滚
	•	环境变量（示例）：DB_URL、REDIS_URL、S3_BUCKET、OIDC_ISSUER、OIDC_CLIENT_ID、OIDC_REDIRECT_URI、JWT_SECRET、RATE_LIMIT_REQ_PER_MIN

⸻

15. 版本与废弃（Deprecation）
	•	新增字段：直接追加，保证向后兼容
	•	破坏性变更：发布 /v2；/v1 提前 3 个月标注 Sunset，文档声明 EOL
	•	SDK：同时生成 v1/v2 客户端（TypeScript/Swift/Kotlin）

⸻

16. 迁移计划（从 H5-only → 三端统一）
	1.	为现有 H5 接口落到 /web/v1/*（保持兼容，双写期 2 周）
	2.	新增 /mobile/v1/*（先与 /web/v1 同能，减少字段/聚合）
	3.	H5/原生灰度切换至新路径；监控对比指标（错误率/延迟/带宽）
	4.	宣布旧未版本化路径冻结，1 个月后下线

⸻

17. 风险与对策
	•	弱网/断网：客户端离线队列 + 服务器幂等；降级提示
	•	证书锁定误伤：灰度/可远程下发指纹；回退开关
	•	对象存储直传失败：回退多段/分片；超时重试 + 断点续传
	•	版本碎片化：远程配置约束最小版本；旧版走兼容路径

⸻

18. 验收用例（节选）
	•	登录 PKCE 成功/失败/取消；Token 过期自动刷新；Refresh 失效强制重新登录
	•	/mobile/v1/profile 响应体不超过 3KB；ETag 命中率 ≥ 60%
	•	/v1/upload/presign 直传 + confirm 数据可回查；失败回退重试
	•	幂等：对同一 Idempotency-Key 重放返回相同 requestId
	•	限流：单用户 60 req/min，超限返回 429 + Retry-After

⸻

19. 开发任务拆解（两周 Sprint × 2）

Sprint 1（两周）
	•	项目骨架与中间件：版本化、压缩、异常、日志、配置、Cache/RateLimit
	•	Auth 模块：PKCE 流程、刷新、登出
	•	用户模块：/web/v1/profile 与 /mobile/v1/profile 基础版
	•	健康/配置：/public/v1/health、/public/v1/config

Sprint 2（两周）
	•	设备与推送注册模块
	•	文件直传 Presign + Confirm
	•	Feed 列表（游标/增量）
	•	观测（Sentry + Prometheus）与基础告警
	•	E2E/契约测试 + OpenAPI/SDK 生成

⸻

20. 示例配置与代码片段（NestJS）

// main.ts（关键配置）
app.enableVersioning({ type: VersioningType.URI });
app.use(compression());
app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
app.useGlobalFilters(new HttpExceptionFilter());
app.enableShutdownHooks();

// Mobile 裁剪拦截器（示意）
@Injectable()
export class MobileTrimInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler) {
    const req = ctx.switchToHttp().getRequest();
    const client = req.headers['x-client'];
    return next.handle().pipe(map((data) => (client === 'ios' || client === 'android') ? trim(data) : data));
  }
}

# openapi.yaml（片段）
openapi: 3.0.3
info:
  title: Unified BFF API
  version: 1.0.0
paths:
  /mobile/v1/profile:
    get:
      security: [ { bearerAuth: [] } ]
      responses:
        '200': { description: OK }


⸻

21. 附录：错误码建议（节选）
	•	AUTH_INVALID_CODE、AUTH_TOKEN_EXPIRED、AUTH_REFRESH_REVOKED
	•	USER_NOT_FOUND、USER_FORBIDDEN
	•	UPLOAD_SIZE_EXCEEDED、UPLOAD_SIGNATURE_INVALID
	•	TOO_MANY_REQUESTS（429，可重试）

⸻