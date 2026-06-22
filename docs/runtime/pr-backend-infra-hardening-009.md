# PR-BE-009 后端基础设施加固只读审计与改造方案

时间：2026-06-22（Asia/Shanghai）

角色：后端/API 负责人

范围：只核查 `jiuzhuopanguan` 后端/API；未触碰 `pomer.cn` 官网；未修改 PM 总台账；本次未做业务源码切换。

## 1. 当前真实状态

### 1.1 `app_store` 与实体表

- `backend/sql/mysql-init.sql` 当前只初始化 `app_store(store_key,data_json,updated_at)`，业务主存储仍是 JSON 文档。
- `backend/data/store-accessor.js` 在启用 MySQL 时把完整 store 以 `store_key + data_json` 写入 `app_store`，并默认保留文件镜像；未按实体表读写。
- 当前 5 个 store key：
  - `content_store`
  - `social_store`
  - `admin_store`
  - `moments_store`
  - `asset_manifest`
- `backend/sql/mysql-normalized-schema.sql` 已有实体表定义，覆盖用户、用户会话、登录日志、好友、聚会、成员、战报、瞬间、账本事件、简报、分享图任务、举报、榜单奖励、积分、模板、工具、后台用户、后台会话、操作日志、素材等。
- `backend/data/normalized-db.js` 只做从当前 JSON store 到 normalized tables 的映射和 upsert，同步入口是 `backend/scripts/sync-normalized-db.js` / `npm --prefix backend run db:sync-normalized`。
- 没有发现业务函数从 normalized tables 读取或直接写实体表；`admin.js`、`moments.js` 等仍通过 `readStore()/writeStore()` 修改 JSON store。

结论：实体表“已建模、可回填”，但不是生产读写主路径。不能标记为“已拆完成”。

### 1.2 上传与 `/uploads/`

- 后台素材：`backend/data/assets.js` 的 `saveAdminImage()` 压缩后写入 `backend/public/uploads/admin/<category>/...`，返回 `/uploads/admin/...`。
- 用户头像：`POST /api/v1/user/avatar/upload` 复用 `saveAdminImage({ category: 'user-avatars' })`，仍落本地 `/uploads/admin/user-avatars/...`。
- 精彩瞬间：`backend/data/moments.js` 的 `uploadMomentImage()` 写入 `backend/public/uploads/moments/<sessionId>/...`，返回 `/uploads/moments/...`。
- 分享图任务：`processShareImageTask()` 写入 `backend/public/uploads/moments/share-tasks/<taskId>.png`，返回 `/uploads/moments/share-tasks/...`。
- 静态服务：`backend/server.js` 对 `GET /uploads/*` 做本地文件读取，`Cache-Control: public, max-age=2592000, immutable`。
- 分享图生成依赖本地路径：`resolveLocalUploadPath()` 只会把 `/uploads/...` 映射到本地文件；远程 URL 当前不会被读入 poster 渲染。

结论：没有对象存储/CDN provider 抽象；URL 合同以本地 `/uploads/` 为主。直接改成远程 URL 会影响分享图二次渲染，需要先补 provider 的 `putObject/getPublicUrl/readForRender` 能力。

### 1.3 后台登录安全 API

- 登录接口：`POST /api/v1/admin/auth/login` 调用 `loginAdmin({ ...payload, ip, userAgent })`，成功后写 12 小时 cookie session。
- 当前工作区已有登录失败计数和锁定逻辑：`failedLoginCount/lastFailedLoginAt/lockedUntil`，达到阈值后锁定并清理该用户 sessions。
- 当前工作区已有密码重置函数和路由：`resetAdminPassword()`、`POST /api/v1/admin/users/:id/reset-password`，会更新 `passwordHash/passwordUpdatedAt`、清空失败计数并注销该账号 sessions。
- 当前审计未发现 schema 已同步这些新增字段：`backend/sql/mysql-normalized-schema.sql` 的 `admin_users` 仍只有 `password_hash/last_login_at/status` 等基础字段。
- `reset-password` 路由只要求已登录后台 session，未看到超级管理员/权限点限制。
- `system-permissions` 保存后台用户时，如果新增用户没有旧密码，仍会默认 `Admin@123456`，这是高风险默认密码行为，不能视为合格密码初始化能力。
- `admin_operation_logs` 当前 schema 字段只有 `operator_id/action/target_type/target_id/detail/created_at`，代码里也主要把 IP/UA 拼入 detail，缺少结构化 `ip/userAgent/result/failureReason/requestId` 字段。

结论：后台安全 API 已有部分工作区代码，但仍未完成数据库 schema、权限约束、结构化审计和专项验证，不能标记为闭环。

## 2. 最小后端改造方案

### 2.1 实体表读写切换顺序

第一阶段：只补可验证回填，不切读写。

- 固化 `npm --prefix backend run db:sync-normalized` 为上线前/巡检可复跑命令。
- 新增 `backend/scripts/verify-normalized-db.js`：对比 `app_store` JSON 与实体表行数、关键 ID、最近更新时间。
- 优先校验对象：
  - `admin_store.liveSessions` -> `wine_sessions`、`wine_session_members`
  - `admin_store.reports` -> `wine_reports`
  - `moments_store.momentRecords` -> `moment_records`
  - `moments_store.sessionEvents` -> `session_events`
  - `moments_store.sessionBriefs` -> `session_briefs`
  - `moments_store.shareImageTasks` -> `share_image_tasks`
  - `social_store.profiles/userSessions/loginLogs` -> `users/user_sessions/user_login_logs`

第二阶段：双写，不切读。

- 在 `createManagedSession/updateManagedSession/endManagedSession/finishManagedSession/deleteManagedSession` 后增加实体表 repository 双写。
- 在 `createMoment/updateMoment/uploadMomentImage/createSessionEvent/createOrRefreshSessionBrief/createShareImageTask/processShareImageTask` 后增加实体表双写。
- 双写失败时默认不阻塞 JSON 主写，但必须记录 `admin_operation_logs` 或专用 `infra_sync_errors`，并让 health 接口暴露错误数。

第三阶段：灰度读切换。

- 增加环境变量：
  - `NORMALIZED_DB_WRITE=0|1`
  - `NORMALIZED_DB_READ=0|1`
  - `NORMALIZED_DB_READ_SCOPE=sessions,moments,users`
- 先把只读列表和后台查询切到实体表，再切用户关键接口。
- 每个接口保留 JSON fallback：实体表读失败或对账不一致时返回 JSON store，并记录告警。

第四阶段：收口。

- 连续通过回填校验、双写校验、线上 smoke 后，才逐步冻结 `app_store` 对高频对象的写入。
- `app_store` 保留低频配置和回滚快照，不立即删除。

### 2.2 回滚策略

- 回滚开关：把 `NORMALIZED_DB_READ=0`、`NORMALIZED_DB_WRITE=0`，业务重新完全走 `app_store` JSON。
- 数据回滚：实体表切换前必须保留 `app_store` 最新 JSON 备份；实体表不作为唯一源前不得清理 JSON。
- 双写异常：允许跳过实体表写入，但必须保留错误日志和可重放 payload。
- 删除类操作先软删或保留审计，不允许仅从实体表物理删除后再依赖 JSON 恢复。

## 3. 对象存储/CDN 改造方案

### 3.1 Provider 抽象

新增 `backend/data/object-storage.js`：

- `putObject({ key, buffer, contentType, cacheControl })`
- `getPublicUrl(key)`
- `readObjectForRender({ key, url })`
- `deleteObject(key)` 可选，先不接业务删除

Provider：

- `local`：保持当前 `backend/public/uploads` 行为。
- `s3-compatible`：兼容 OSS/COS/七牛/MinIO 等 S3 API 或厂商 SDK。
- `cdn`：只负责 URL 前缀，底层仍由对象存储写入。

建议环境变量：

```text
UPLOAD_PROVIDER=local|s3
UPLOAD_PUBLIC_BASE_URL=https://cdn.example.com
UPLOAD_LOCAL_PUBLIC_PREFIX=/uploads
UPLOAD_BUCKET=
UPLOAD_REGION=
UPLOAD_ENDPOINT=
UPLOAD_ACCESS_KEY_ID=
UPLOAD_SECRET_ACCESS_KEY=
UPLOAD_FORCE_PATH_STYLE=0
UPLOAD_SIGNED_READ=0
```

### 3.2 URL 合同

- API 返回继续保留 `url` 字段，新增可选字段：`storageProvider/objectKey/publicUrl/localCompatUrl`.
- 新上传优先返回 CDN 绝对 URL；为了兼容旧前端，可在 `UPLOAD_RETURN_ABSOLUTE_URL=0` 时仍返回 `/uploads/...`。
- 旧 `/uploads/...` 继续服务一段时间：
  - 未迁移文件：走本地静态服务。
  - 已迁移文件：可在 manifest 中记录映射，`GET /uploads/...` 302 到 CDN。

### 3.3 分享图渲染兼容

- `resolveLocalUploadPath()` 不能只认本地 `/uploads/`；需改为 `resolveImageBufferForRender(url)`。
- 对 CDN/对象存储 URL：优先通过 `objectKey` 从 provider 读取；没有 `objectKey` 时谨慎 http(s) 拉取，限制域名白名单、大小和超时。
- 分享图输出也走 `putObject()`，不再直接 `fs.writeFileSync()`。

### 3.4 迁移策略

- 先迁移 manifest：扫描 `asset_manifest.uploads`、`moments_store.uploadedAssets`、`momentRecords.imageUrl`、`shareImageTasks.imageUrl`。
- 对每个 `/uploads/...` 文件上传到对象存储，记录 `objectKey/publicUrl/legacyUrl/migratedAt`.
- API 读出时优先 publicUrl，旧 URL 保底。
- 迁移完成前不得删除 `backend/public/uploads`。

## 4. 后台安全 API 方案

### 4.1 Schema 字段

补齐 `admin_users`：

- `password_changed_at DATETIME NULL`
- `failed_login_count INT NOT NULL DEFAULT 0`
- `last_failed_login_at DATETIME NULL`
- `locked_until DATETIME NULL`
- `force_password_reset TINYINT(1) NOT NULL DEFAULT 0`

补齐 `admin_operation_logs`：

- `ip VARCHAR(64) NULL`
- `user_agent TEXT NULL`
- `result VARCHAR(32) NULL`
- `failure_reason TEXT NULL`
- `request_id VARCHAR(64) NULL`

或新增 `admin_auth_events`，专门记录登录/失败/锁定/重置。

### 4.2 API

- `POST /api/v1/admin/auth/login`
  - 当前工作区已有基础失败计数/锁定逻辑；下一步要补配置化阈值、结构化审计和专项测试。
- `POST /api/v1/admin/users/:id/reset-password`
  - 当前工作区已有路由和函数；下一步必须加超级管理员权限校验。
  - payload 建议扩展为 `{ newPassword, forceReset }`。
  - 写 `passwordHash/passwordChangedAt/forcePasswordReset`，清除该用户 sessions。
- `POST /api/v1/admin/auth/change-password`
  - 当前登录用户修改自己密码。
  - payload: `{ oldPassword, newPassword }`。
- `POST /api/v1/admin/users/:id/unlock`
  - 清零失败计数和 `locked_until`。
  - 当前可通过重置密码间接清零，但没有单独 unlock API。

### 4.3 最小测试点

- 连续 N 次错误密码后返回 423/429，不创建 session。
- 锁定期间正确密码仍不能登录。
- 管理员重置密码后旧密码不可用、新密码可登录、旧 sessions 失效。
- 改密必须校验旧密码。
- 每次失败、锁定、重置、解锁都有审计日志，包含 operator、target、result、ip/userAgent。
- reset-password 非超级管理员调用应返回 403。

## 5. 阻塞与协作项

- DBA/运维：需要确认线上 MySQL 是否已执行 `mysql-normalized-schema.sql`，以及是否允许新增安全字段/表。
- DBA/运维：需要提供对象存储/CDN 类型、bucket、endpoint、域名、凭据注入方式和回源/缓存策略。
- 后台管理：需要提供密码重置、解锁、强制改密的 UI 入口和权限模型。
- 测试验收：需要提供数据库回填对账、上传 URL 可访问、登录锁定和密码重置的用例。

## 6. 本次结论

本次只完成后端/API 只读审计和最小改造方案。当前不能宣称：

- 高频业务对象已从 `app_store` 拆到实体表主读写。
- 正式对象存储/CDN 已接入。
- 后台密码重置、登录失败限制/锁定 API 已完成闭环；当前只能说工作区已有部分代码，仍缺 schema/权限/验证。

## 7. PM 补充后的 OSS/CDN 接入实现

时间：2026-06-22 05:20（Asia/Shanghai）

PM 已确认 CDN/OSS 基础链路可用：

- OSS Bucket：`pomer-party-recorder-prod`
- 地域：华北2（北京），SDK region 使用 `oss-cn-beijing`
- OSS 源站域名：`pomer-party-recorder-prod.oss-cn-beijing.aliyuncs.com`
- CDN 域名：`https://cdn.pomer.cn`
- Bucket 保持私有，CDN 私有 OSS Bucket 回源已开启

### 7.1 本次已落地代码

- 新增 `backend/data/object-storage.js`
  - 默认 `UPLOAD_PROVIDER=local`，保持原本本地 `/uploads/` 写入和返回。
  - 配置 `UPLOAD_PROVIDER=oss` 后，使用 `ali-oss` 上传到私有 OSS Bucket，不设置公共读 ACL。
  - OSS 上传成功后返回 `https://cdn.pomer.cn/{objectKey}`。
  - 默认保留本地镜像，旧 `/uploads/{objectKey}` 仍可访问；设置 `UPLOAD_LOCAL_MIRROR=0` 可关闭本地镜像。
- 修改 `backend/data/assets.js`
  - 后台素材和用户头像上传改走 `putObject()`。
  - object key：`admin/{folder}/{fileName}`。
  - manifest 新增 `objectKey/publicUrl/localCompatUrl/storageProvider`，保留 `url` 字段给现有前端。
- 修改 `backend/data/moments.js`
  - 精彩瞬间上传改走 `putObject()`。
  - object key：`moments/{sessionId}/{fileName}`。
  - 分享图任务输出改走 `putObject()`。
  - object key：`moments/share-tasks/{taskId}.png`。
  - 分享图渲染读取图片改为 `readObjectForRender()`：优先读本地镜像，缺镜像时允许读取 `https://cdn.pomer.cn/...` 或 OSS 源站 URL。
- 修改 `backend/package.json` / `backend/package-lock.json`
  - 新增依赖：`ali-oss`。

### 7.2 部署环境变量

生产启用 OSS/CDN：

```text
UPLOAD_PROVIDER=oss
UPLOAD_BUCKET=pomer-party-recorder-prod
UPLOAD_REGION=oss-cn-beijing
UPLOAD_PUBLIC_BASE_URL=https://cdn.pomer.cn
OSS_ACCESS_KEY_ID=<由服务器环境注入>
OSS_ACCESS_KEY_SECRET=<由服务器环境注入>
OSS_SOURCE_HOST=pomer-party-recorder-prod.oss-cn-beijing.aliyuncs.com
UPLOAD_LOCAL_MIRROR=1
```

可选：

```text
UPLOAD_ENDPOINT=
OSS_TIMEOUT_MS=60000
OSS_AUTHORIZATION_V4=1
UPLOAD_LOCAL_MIRROR=0
```

说明：

- AccessKey 不得写入仓库、文档或前端。
- Bucket 继续保持私有，不需要改公共读。
- `UPLOAD_PUBLIC_BASE_URL` 必须使用 CDN 域名，不直接返回 OSS 源站。

### 7.3 回滚开关

- 立即回滚到本地上传：`UPLOAD_PROVIDER=local`，重启 `jiuzhuopanguan` 后端服务。
- 兼容旧资源：`GET /uploads/*` 静态服务未删除。
- 若启用 OSS 时 `UPLOAD_LOCAL_MIRROR=1`，新上传也会写本地镜像，可用 `/uploads/{objectKey}` 临时回退访问。
- 不清理 `backend/public/uploads`，旧文件迁移完成前不得删除。

### 7.4 待线上验证

需要 DBA/运维在服务器注入 AccessKey 后执行：

- 后台上传一张图片，确认 API 返回 `https://cdn.pomer.cn/admin/...`。
- 小程序上传一张精彩瞬间，确认 API 返回 `https://cdn.pomer.cn/moments/{sessionId}/...`。
- 生成分享图，确认任务返回 `https://cdn.pomer.cn/moments/share-tasks/...`。
- `curl.exe -I` 上述三个 CDN URL 均应返回 200、正确 Content-Type。
- 切 `UPLOAD_PROVIDER=local` 重启后，新上传应回到 `/uploads/...`。

本地没有 OSS AccessKey，本次不做真实 OSS 写入；已做语法、编码、本地 provider smoke 和 CDN 只读读取 smoke。

### 7.5 本地验证

已执行：

```powershell
node --check backend/data/object-storage.js
node --check backend/data/assets.js
node --check backend/data/moments.js
node --check backend/server.js
npm.cmd run check:encoding
```

本地 provider smoke：

```json
{
  "ok": true,
  "provider": "local",
  "url": "/uploads/codex-smoke/object-storage.txt",
  "objectKey": "codex-smoke/object-storage.txt"
}
```

说明：临时文件已在 smoke 脚本内删除。

OSS/CDN URL 合同 smoke：

```json
{
  "ok": true,
  "url": "https://cdn.pomer.cn/moments/share-tasks/demo.png"
}
```

CDN 只读读取 smoke：

```json
{
  "ok": true,
  "length": 45947
}
```

仍未验证：缺服务器侧 OSS AccessKey，未执行真实 `putObject()` 到 `pomer-party-recorder-prod`。

### 7.6 生产启用清单：CDN 500GB 中国内地下行流量包后

状态：待 DBA/运维注入生产 AccessKey 后执行；当前不能标闭环。

#### RAM AccessKey 最小权限

不要使用主账号 AccessKey。创建专用 RAM 用户或 RAM 角色，仅允许本项目服务端写入 `pomer-party-recorder-prod` 的业务前缀。

建议自定义策略：

```json
{
  "Version": "1",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "oss:PutObject",
        "oss:GetObject"
      ],
      "Resource": [
        "acs:oss:*:*:pomer-party-recorder-prod/admin/*",
        "acs:oss:*:*:pomer-party-recorder-prod/moments/*"
      ]
    }
  ]
}
```

说明：

- 当前服务端上传只需要 `oss:PutObject`；分享图渲染或回读对象时可用 `oss:GetObject`。
- 不授予 `oss:DeleteObject`，避免误删线上素材。
- 不授予 `oss:PutBucketAcl`、`oss:PutObjectAcl`，避免代码或人工把 Bucket/Object 改成公共读。
- 如需巡检列举，可另建只读巡检角色并把 `oss:ListObjects` 限制在 `admin/`、`moments/` 前缀；业务上传 AK 不默认授予 List。

#### 生产环境变量

```text
UPLOAD_PROVIDER=oss
UPLOAD_BUCKET=pomer-party-recorder-prod
UPLOAD_REGION=oss-cn-beijing
UPLOAD_PUBLIC_BASE_URL=https://cdn.pomer.cn
OSS_SOURCE_HOST=pomer-party-recorder-prod.oss-cn-beijing.aliyuncs.com
OSS_ACCESS_KEY_ID=<仅服务器环境变量注入>
OSS_ACCESS_KEY_SECRET=<仅服务器环境变量注入>
UPLOAD_LOCAL_MIRROR=1
OSS_TIMEOUT_MS=60000
OSS_AUTHORIZATION_V4=1
```

回滚到本地：

```text
UPLOAD_PROVIDER=local
```

#### 部署顺序

1. 在服务器为 `api.pomer.cn` 对应的 `jiuzhuopanguan` 后端服务注入上述环境变量；不得改 `pomer.cn` 官网服务。
2. 部署包含 `backend/data/object-storage.js`、`backend/data/assets.js`、`backend/data/moments.js`、`backend/package.json`、`backend/package-lock.json` 的后端代码。
3. 在后端目录安装依赖：`npm install --omit=dev` 或按现有部署脚本执行安装，确保 `ali-oss` 存在。
4. 重启目标后端服务并带上新环境变量，例如 `pm2 restart jiuzhuopanguan-backend --update-env`。
5. 先执行真实 OSS `putObject()` smoke，再做后台/小程序上传接口 smoke。

#### 真实 OSS `putObject()` 验证命令

只在服务器执行；不要在命令输出里打印 AccessKey。

```powershell
$env:UPLOAD_PROVIDER='oss'
$env:UPLOAD_BUCKET='pomer-party-recorder-prod'
$env:UPLOAD_REGION='oss-cn-beijing'
$env:UPLOAD_PUBLIC_BASE_URL='https://cdn.pomer.cn'
$env:OSS_SOURCE_HOST='pomer-party-recorder-prod.oss-cn-beijing.aliyuncs.com'

node -e "const storage=require('./backend/data/object-storage');(async()=>{const key='admin/codex-smoke/oss-putobject-'+Date.now()+'.txt';const r=await storage.putObject({key,buffer:Buffer.from('ok'),contentType:'text/plain'});console.log(JSON.stringify({ok:true,provider:r.provider,objectKey:r.objectKey,url:r.url},null,2));})().catch(e=>{console.error(e.message);process.exit(1)})"
```

期望：

```json
{
  "ok": true,
  "provider": "oss",
  "objectKey": "admin/codex-smoke/oss-putobject-<timestamp>.txt",
  "url": "https://cdn.pomer.cn/admin/codex-smoke/oss-putobject-<timestamp>.txt"
}
```

随后验证 CDN：

```powershell
curl.exe -I "https://cdn.pomer.cn/admin/codex-smoke/oss-putobject-<timestamp>.txt"
```

期望：`HTTP/1.1 200 OK`，且不是 OSS 公共读直出；Bucket 仍保持私有。

#### 失败回滚

- `putObject()` 失败：保留 `UPLOAD_PROVIDER=local`，重启后端，上传继续回到 `/uploads/...`。
- CDN 访问失败但 OSS 写入成功：先保持 `UPLOAD_LOCAL_MIRROR=1`，临时使用 `/uploads/{objectKey}` 验证业务链路，再由 DBA/运维查 CDN 回源。
- 不删除 `backend/public/uploads`；不改 Bucket ACL；不清理历史对象。
