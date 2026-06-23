# DBA/运维 009 基建加固审计与执行方案

日期：2026-06-22

角色：DBA/运维负责人

目标边界：仅面向 `api.pomer.cn` / `jiuzhuopanguan`。本交付不触碰 `pomer.cn` 公司官网，不执行服务器命令，不修改 PM 总台账。

## 1. 只读核查范围

已读取：

- `AGENTS.md`
- `PRD.md`
- `docs/runtime/pm-active-worklog.md`
- `backend/sql/mysql-init.sql`
- `backend/sql/mysql-normalized-schema.sql`
- `backend/data/store-accessor.js`
- `backend/data/normalized-db.js`
- `DEPLOY.md`
- 补充只读核查：`backend/package.json`、`backend/scripts/sync-normalized-db.js`、`backend/scripts/test-mysql.js`、`backend/ecosystem.config.js`、`deploy/nginx/jiuzhuopanguan-api.conf.example`、`backend/server.js` 上传与静态资源片段、`backend/data/assets.js`、`backend/data/moments.js` 上传片段、`deploy/mysql/normalized-schema.sql`。

未读取旧长文档；未访问服务器；未执行线上写入、部署、重启、清理。

## 2. 现状审计

### 2.1 已存在

- MySQL 基础表：`backend/sql/mysql-init.sql` 已创建 `jiuzhuopanguan.app_store`，字段为 `store_key/data_json/updated_at`。
- 归一化表 DDL：`backend/sql/mysql-normalized-schema.sql` 已覆盖 `users`、`user_sessions`、`wine_sessions`、`wine_session_members`、`moment_records`、`session_events`、`session_briefs`、`share_image_tasks`、`moment_reports`、`points_ledger`、`admin_operation_logs`、`assets` 等高频表。
- 归一化同步脚本：`backend/package.json` 已有 `db:sync-normalized`，入口为 `backend/scripts/sync-normalized-db.js`，会初始化各 JSON store 后调用 `syncNormalizedTables()`。
- 当前主存储访问器：`backend/data/store-accessor.js` 支持 MySQL `app_store`，并可用 `STORE_FILE_MIRROR` 同步本地 JSON 镜像。
- Nginx 示例：`deploy/nginx/jiuzhuopanguan-api.conf.example` 只声明 `server_name api.pomer.cn`，并把 `/api/v1/`、`/admin`、`/admin/static/`、`/uploads/` 反代到 `127.0.0.1:3010`。
- PM2 示例：`backend/ecosystem.config.js` 已定义 `jiuzhuopanguan-backend`，`PORT=3010`。
- MySQL 连通性脚本：`backend/scripts/test-mysql.js` 只检查 `app_store` 计数。
- PM 补充确认：CDN/OSS 基础链路已配置并验收通过。已确认 `pomer-party-recorder-prod` 私有 OSS Bucket、`cdn.pomer.cn` CDN、HTTPS、HTTP 到 HTTPS 跳转、私有 Bucket 同账号回源均可用；PM 验证 `https://cdn.pomer.cn/cdn-check.png` 返回 `HTTP/1.1 200 OK`、`Content-Type: image/png`、`x-oss-cdn-auth: success`。

### 2.2 缺失或不能证明完成

- 不能证明 `app_store` 已被实体表替代。当前 `admin_store`、`content_store`、`social_store`、`moments_store`、`asset_manifest` 仍通过 `createStoreAccessor()` 读写 `app_store` blob。
- `syncNormalizedTables()` 是从现有 store 到实体表的单向同步，不是运行时实体表读写，也没有看到实体表到 `app_store` 的一致性回写。
- 未发现实体表双写开关、读切换开关、失败补偿队列、校验脚本或回滚脚本。
- DBA/运维不提交后端 OSS provider 业务代码。后端/API 侧已完成 OSS provider 接入与线上真实上传 E2E；DBA/运维本次只提交运维脚本和证据文档。
- 未发现 Nginx 配置备份脚本、MySQL dump 脚本、恢复演练记录、PM2 日志轮转/监控脚本、健康检查告警脚本。
- 未发现独立 `/healthz` 接口；当前可用健康探针只能临时使用 `GET /api/v1/config/home`。

## 3. 实体表拆分方案

### 3.1 高频对象与目标表

| app_store key / JSON 对象 | 高频业务对象 | 目标表 |
| --- | --- | --- |
| `social_store.profiles` | 用户资料、微信身份、手机号 | `users` |
| `social_store.userSessions` | 用户登录态 | `user_sessions` |
| `social_store.loginLogs` | 登录日志 | `user_login_logs` |
| `social_store.friendships` | 好友关系 | `friendships` |
| `admin_store.liveSessions` | 聚会房间、进行中/已结束状态 | `wine_sessions` |
| `admin_store.liveSessions[].members` | 聚会成员、账本计数 | `wine_session_members` |
| `admin_store.reports` | 战报/聚会回忆报告 | `wine_reports` |
| `moments_store.momentRecords` | 照片/瞬间记录 | `moment_records` |
| `moments_store.sessionEvents` | 时间线事件、账本事件 | `session_events` |
| `moments_store.sessionBriefs` | 聚会简报 | `session_briefs` |
| `moments_store.shareImageTasks` | 分享图任务 | `share_image_tasks` |
| `moments_store.momentReports` | UGC 举报 | `moment_reports` |
| `moments_store.momentNominations` | 高光提名 | `moment_nominations` |
| `moments_store.rankingRewardRules/Payouts` | 榜单奖励规则和发放 | `ranking_reward_rules`、`ranking_reward_payouts` |
| `content_store.pointsConfig.tasks/rewards` | 积分任务和商品 | `points_tasks`、`points_rewards` |
| `content_store.userCommerce` | 用户积分/会员状态 | `user_commerce_states` |
| `content_store.userCommerce.*.pointsLedger` | 积分流水 | `points_ledger` |
| `content_store.userCommerce.*.taskStates` | 任务领取 | `points_task_claims` |
| `content_store.templateConfig` | 模板筛选和模板 | `template_filters`、`templates` |
| `admin_store.questionBank` | 题库 | `question_bank` |
| `admin_store.shareAssets/toolsCatalog` | 分享素材、工具目录 | `share_assets`、`tools_catalog` |
| `admin_store.adminUsers/roles/sessions/operationLogs` | 后台账号、角色、会话、操作日志 | `admin_users`、`admin_roles`、`admin_sessions`、`admin_operation_logs` |
| `asset_manifest.uploads`、`moments_store.uploadedAssets` | 上传资产索引 | `assets` |

### 3.2 迁移阶段

1. 准备阶段：
   - 先备份 `app_store`、本地 JSON 镜像和 `/uploads/`。
   - 在 `api.pomer.cn` 对应数据库执行 `backend/sql/mysql-normalized-schema.sql`。
   - 执行 `npm run mysql:test`，确认仍能访问 `app_store`。

2. 首次同步：
   - 执行 `npm run db:sync-normalized`。
   - 对比 `app_store` JSON 数量与实体表行数，记录差异。
   - 当前脚本只能从 blob 同步到实体表，不能作为切换完成证据。

3. 影子双写：
   - 后端/API 负责人需要把写路径改成 `app_store` 主写 + 实体表影子写。
   - 推荐环境变量：
     - `NORMALIZED_DB_WRITE=shadow`
     - `NORMALIZED_DB_READ=0`
     - `APP_STORE_FALLBACK_READ=1`
     - `NORMALIZED_DB_STRICT=0`
   - 影子写失败只能告警和记录，不影响主链路。

4. 双写校验：
   - 每日或每次发布后跑行数、关键 ID、状态字段、时间字段校验。
   - P0 校验对象：`wine_sessions.state/status/ended_at`、`wine_session_members`、`moment_records.image_url`、`session_events`、`share_image_tasks.image_url`。

5. 分模块读切换：
   - 先切只读/低风险：后台列表、素材列表、榜单聚合。
   - 再切用户主链路：个人中心摘要、相册、记录、分享任务。
   - 推荐环境变量：
     - `NORMALIZED_DB_READ=admin,assets,reports`
     - 全量前不得设置 `NORMALIZED_DB_READ=all`。

6. 回滚：
   - 立即回滚开关：`NORMALIZED_DB_READ=0`、`NORMALIZED_DB_WRITE=shadow` 或关闭影子写。
   - 保留 `app_store` 作为主数据至少 7 天或 3 个完整测试批次。
   - 只有实体表与 `app_store` 对账连续通过，且已完成恢复演练后，才允许讨论 `app_store` 退为归档。

### 3.3 是否仍依赖 app_store

是，当前仍依赖 `app_store`。实体表 DDL 和同步脚本已存在，但运行时读写没有完成实体表切换。DBA/运维本次只能标记为“具备 DDL 和单向同步基础，待后端/API 改造读写路径、接口联调和测试验收”。

## 4. 对象存储 / CDN 接入方案

状态：基础链路已验收，后端 OSS provider 已接入并完成线上真实上传 E2E；`oss:DeleteObject` 最小权限已补齐，上传、CDN 读取和 OSS 删除清理链路已闭环。

已验收基础链路：

- Bucket：`pomer-party-recorder-prod`
- Bucket 类型：私有 OSS Bucket
- CDN 域名：`cdn.pomer.cn`
- HTTPS：已可用
- HTTP 到 HTTPS 跳转：已可用
- 回源授权：私有 Bucket 同账号回源，验证响应头 `x-oss-cdn-auth: success`
- PM 验证样本：`https://cdn.pomer.cn/cdn-check.png`
- PM 验证结果：`HTTP/1.1 200 OK`、`Content-Type: image/png`、`x-oss-cdn-auth: success`

运维侧仍需补齐记录：

- Bucket 所属账号、region、权限策略、生命周期策略、服务端加密策略。
- `cdn.pomer.cn` 证书颁发机构、证书序列号、生效时间、到期时间、续期方式和负责人。
- CDN 回源配置截图或导出记录：源站类型、回源 host、私有 Bucket 同账号授权方式、缓存规则。
- HTTP 到 HTTPS 跳转配置记录和验证命令输出。
- `cdn-check.png` 的 object key、ETag、Content-Length、Content-Type、缓存头。
- 告警联系人和证书续期提醒渠道。

### 4.1 推荐接入边界

- 后端/API 负责上传 provider 抽象：本地、S3 兼容、腾讯云 COS、阿里云 OSS 等只能由服务端写入。
- 前端、小程序、后台只消费返回的 `url` / `cdnUrl`，不得直连对象存储密钥。
- DBA/运维负责 bucket、CDN 域名、Nginx 兼容路由、迁移脚本运行、回滚和证据。

### 4.2 推荐环境变量

```bash
UPLOAD_PROVIDER=oss
UPLOAD_BUCKET=pomer-party-recorder-prod
UPLOAD_REGION=oss-cn-beijing
UPLOAD_PUBLIC_BASE_URL=https://cdn.pomer.cn
OSS_SOURCE_HOST=pomer-party-recorder-prod.oss-cn-beijing.aliyuncs.com
OSS_ACCESS_KEY_ID: <server-env-only>
OSS_ACCESS_KEY_SECRET: <server-env-only>
OSS_TIMEOUT_MS=60000
OSS_AUTHORIZATION_V4=1
UPLOAD_LOCAL_MIRROR=1
```

### 4.3 Nginx 路由变更点

当前 `/uploads/` 反代到 Node。后端接入 OSS provider 后仍建议保留兼容入口：

- 首选：小程序和后台新返回绝对 CDN URL，例如 `https://cdn.pomer.cn/jiuzhuopanguan/moments/...`。
- 兼容旧数据：`https://api.pomer.cn/uploads/...` 继续可访问。
- 迁移期 Nginx 可对 `/uploads/` 做以下二选一：
  - 继续反代到 Node，本地旧文件保底。
  - `try_files` 或 302 到 CDN，同步失败时回落 Node。

不得直接删除 `/uploads/` location；当前大量 manifest、测试证据和历史数据仍保存 `/uploads/moments/...`。

### 4.4 迁移策略

1. 扫描旧资产：
   - `backend/public/uploads/moments`
   - `backend/public/uploads/admin`
   - `moments_store.uploadedAssets`
   - `asset_manifest.uploads`
   - `moment_records.imageUrl`
   - `share_image_tasks.imageUrl`
2. 上传到对象存储，object key 保持可追溯：
   - `jiuzhuopanguan/moments/<sessionId>/<file>`
   - `jiuzhuopanguan/moments/share-tasks/<file>`
   - `jiuzhuopanguan/admin/<category>/<file>`
3. 回写资产索引：
   - 新增 `storageProvider/storageKey/cdnUrl/migratedAt`。
   - 暂不覆盖旧 `url`；接口序列化时优先返回 `cdnUrl`，无则返回旧 `/uploads/`。
4. 校验：
   - 每批抽样 `curl -I` CDN URL。
   - 校验图片大小非 0、Content-Type 为 image、HTTP 200/304。
   - 基础链路固定探针：

     ```bash
     curl -I http://cdn.pomer.cn/cdn-check.png
     curl -I https://cdn.pomer.cn/cdn-check.png
     curl -fsSI https://cdn.pomer.cn/cdn-check.png | grep -Ei 'HTTP/|Content-Type|Content-Length|x-oss-cdn-auth|Location|Cache-Control'
     ```

   - 预期：HTTPS 返回 200，`Content-Type` 为 `image/png`，`x-oss-cdn-auth` 为 `success`；HTTP 请求应跳转到 HTTPS。
5. 回滚：
   - `STORAGE_PROVIDER=local`
   - `UPLOAD_LOCAL_FALLBACK=1`
   - Nginx `/uploads/` 恢复反代 `127.0.0.1:3010`
   - 保留本地 `/uploads/` 至少 7 天。

## 5. 备份与监控方案

### 5.1 Nginx 配置备份

目标服务：`api.pomer.cn` Nginx server block。

可复跑命令：

```bash
sudo mkdir -p /data/backups/jiuzhuopanguan/nginx
sudo cp -a /etc/nginx/conf.d/jiuzhuopanguan-api.conf /data/backups/jiuzhuopanguan/nginx/jiuzhuopanguan-api.conf.$(date +%Y%m%d%H%M%S)
sudo nginx -T > /data/backups/jiuzhuopanguan/nginx/nginx-full.$(date +%Y%m%d%H%M%S).conf
sudo nginx -t
```

验收证据：

- 备份文件路径。
- `nginx -t` 输出成功。
- `nginx -T` 中只命中 `api.pomer.cn`，不得包含本次改动写入 `pomer.cn` 官网 server block。

回滚：

```bash
sudo cp -a /data/backups/jiuzhuopanguan/nginx/<backup-file> /etc/nginx/conf.d/jiuzhuopanguan-api.conf
sudo nginx -t
sudo systemctl reload nginx
```

### 5.2 MySQL dump 与恢复演练

目标数据库：`jiuzhuopanguan`。

备份命令：

```bash
mkdir -p /data/backups/jiuzhuopanguan/mysql
mysqldump --single-transaction --routines --triggers --default-character-set=utf8mb4 \
  -h 127.0.0.1 -u <mysql_user> -p jiuzhuopanguan \
  > /data/backups/jiuzhuopanguan/mysql/jiuzhuopanguan.$(date +%Y%m%d%H%M%S).sql
gzip /data/backups/jiuzhuopanguan/mysql/jiuzhuopanguan.*.sql
sha256sum /data/backups/jiuzhuopanguan/mysql/jiuzhuopanguan.*.sql.gz
```

恢复演练命令：

```bash
mysql -h 127.0.0.1 -u <mysql_user> -p -e "CREATE DATABASE IF NOT EXISTS jiuzhuopanguan_restore_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
gunzip -c /data/backups/jiuzhuopanguan/mysql/<backup>.sql.gz | mysql -h 127.0.0.1 -u <mysql_user> -p jiuzhuopanguan_restore_test
mysql -h 127.0.0.1 -u <mysql_user> -p -e "SELECT COUNT(*) AS app_store_rows FROM jiuzhuopanguan_restore_test.app_store;"
mysql -h 127.0.0.1 -u <mysql_user> -p -e "DROP DATABASE jiuzhuopanguan_restore_test;"
```

验收证据：

- dump 文件路径、大小、sha256。
- 恢复库 `app_store` 行数。
- 关键实体表存在性：`SHOW TABLES LIKE 'wine_sessions';`、`SHOW TABLES LIKE 'moment_records';`。
- 演练后删除恢复库，避免残留。

### 5.3 PM2 进程与日志监控

目标进程：`jiuzhuopanguan-backend`。

可复跑命令：

```bash
pm2 describe jiuzhuopanguan-backend
pm2 status jiuzhuopanguan-backend
pm2 logs jiuzhuopanguan-backend --lines 120 --nostream
pm2 jlist > /data/backups/jiuzhuopanguan/pm2/pm2-jlist.$(date +%Y%m%d%H%M%S).json
pm2 save
```

建议补充：

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 20M
pm2 set pm2-logrotate:retain 14
pm2 set pm2-logrotate:compress true
```

验收证据：

- `pm2 describe` 中 `script path` 指向 `jiuzhuopanguan/backend/server.js`。
- `pm2 status` 为 `online`。
- 最近 120 行日志无连续重启、端口占用、MySQL 连接失败、上传写入失败。
- PM2 dump 已保存。

回滚：

```bash
cd /data/www/jiuzhuopanguan/backend
pm2 restart jiuzhuopanguan-backend --update-env
pm2 logs jiuzhuopanguan-backend --lines 80 --nostream
```

### 5.4 健康检查与告警

当前无独立 `/healthz`，临时健康检查使用：

```bash
curl -fsS https://api.pomer.cn/api/v1/config/home >/tmp/jzp-health-home.json
curl -fsSI https://api.pomer.cn/admin
curl -fsSI https://api.pomer.cn/uploads/
```

建议后端/API 补充：

- `GET /healthz`：只检查进程存活。
- `GET /readyz`：检查 MySQL、`app_store`、归一化表、上传 provider 可用性。

DBA/运维验收命令：

```bash
curl -fsS https://api.pomer.cn/healthz
curl -fsS https://api.pomer.cn/readyz
mysql -h 127.0.0.1 -u <mysql_user> -p -e "SELECT COUNT(*) AS total FROM jiuzhuopanguan.app_store;"
```

告警建议：

- Nginx：5xx 数量、证书过期、`nginx -t` 失败。
- MySQL：连接失败、备份失败、`app_store` 和实体表关键行数突降。
- PM2：进程非 online、restart 次数增加、日志出现 `failed to initialize stores`、`ECONNREFUSED`、`persist failed`。
- 上传：对象存储上传失败、CDN URL 非 200、旧 `/uploads/` 回源失败。
- CDN/OSS：`cdn-check.png` 非 200、`x-oss-cdn-auth` 非 `success`、HTTP 未跳 HTTPS、证书剩余有效期低于 30 天、回源 403/404/5xx、缓存命中率异常降低、对象存储 4xx/5xx 增加。
- 证书续期提醒：每日至少一次检查 `cdn.pomer.cn` 证书到期时间；低于 30 天提醒，低于 7 天升级为 P0 运维风险。

证书检查命令：

```bash
echo | openssl s_client -servername cdn.pomer.cn -connect cdn.pomer.cn:443 2>/dev/null | openssl x509 -noout -dates -issuer -subject -serial
```

## 6. 服务器级命令清单、风险与回滚

以下命令只能在确认目标为 `api.pomer.cn` / `jiuzhuopanguan` 后执行，不得作用于 `pomer.cn` 官网。

| 操作 | 目标服务 | 命令 | 风险 | 回滚 |
| --- | --- | --- | --- | --- |
| 查看 Nginx 全配置 | Nginx | `sudo nginx -T` | 输出可能包含其他项目配置，不能误改 | 只读，无状态变更 |
| 备份 API Nginx 配置 | Nginx `api.pomer.cn` | `sudo cp -a /etc/nginx/conf.d/jiuzhuopanguan-api.conf /data/backups/jiuzhuopanguan/nginx/...` | 备份路径权限不足 | 换有权限目录；不影响服务 |
| 校验 Nginx | Nginx | `sudo nginx -t` | 无配置变更时低风险 | 只读校验 |
| 重载 Nginx | Nginx | `sudo systemctl reload nginx` | 配置错误会影响反代；必须先 `nginx -t` | 恢复备份配置后 reload |
| MySQL 备份 | MySQL `jiuzhuopanguan` | `mysqldump --single-transaction ... jiuzhuopanguan > backup.sql` | 大库时 IO 压力；凭证暴露风险 | 停止任务；删除不完整备份 |
| 恢复演练 | MySQL `jiuzhuopanguan_restore_test` | `gunzip -c backup.sql.gz | mysql ... jiuzhuopanguan_restore_test` | 误导入生产库风险 | 必须使用 `_restore_test` 库；演练后 drop |
| PM2 状态检查 | PM2 `jiuzhuopanguan-backend` | `pm2 describe jiuzhuopanguan-backend` | 只读 | 无需回滚 |
| PM2 重启 | PM2 `jiuzhuopanguan-backend` | `pm2 restart jiuzhuopanguan-backend --update-env` | 短暂不可用；错误 env 会启动失败 | 恢复 `.env` 备份后再次 restart |
| CDN 切换 | Nginx / 后端上传配置 | 设置 `STORAGE_PROVIDER`、`STORAGE_CDN_BASE_URL`、调整 `/uploads/` 兼容 | 图片不可达、分享图保存失败 | `STORAGE_PROVIDER=local`，恢复 `/uploads/` 反代 Node |
| CDN 基础探针 | CDN `cdn.pomer.cn` | `curl -fsSI https://cdn.pomer.cn/cdn-check.png` | 只读；依赖外网解析和证书状态 | 无需回滚，失败时回查 CDN/OSS 配置 |
| CDN 证书检查 | CDN `cdn.pomer.cn` | `openssl s_client ... | openssl x509 -noout -dates` | 只读；命令输出包含证书元信息 | 无需回滚，到期风险走证书续期 |

## 7. 验收证据清单

实体表拆分验收：

- `SHOW TABLES` 证明确认实体表存在。
- `npm run db:sync-normalized` 输出每张表同步行数。
- `app_store` JSON 数量与实体表关键行数对账。
- 后端/API 提供双写和读切换开关。
- 接口联调证明同一用户、同一 session 下 `summary/history/admin sessions` 数据一致。

对象存储/CDN 验收：

- 基础链路已验收：`pomer-party-recorder-prod` 私有 OSS Bucket、`cdn.pomer.cn`、HTTPS、HTTP 到 HTTPS、私有 Bucket 同账号回源。
- provider、bucket、CDN 域名、证书有效期、回源授权方式、HTTP 跳转、缓存规则记录。
- 固定探针 `https://cdn.pomer.cn/cdn-check.png` 返回 200，`Content-Type: image/png`，`x-oss-cdn-auth: success`。
- 新上传照片返回 CDN URL 或兼容 URL。
- 旧 `/uploads/` URL 仍可访问。
- 分享图、后台素材、相册图片分别抽样 `curl -I` 成功。
- 回滚到 local provider 后仍可上传和读取。

备份监控验收：

- Nginx 配置备份文件和 `nginx -t` 成功输出。
- MySQL dump 文件、sha256、恢复演练行数。
- PM2 `online`、日志无阻塞错误、logrotate 生效。
- 健康检查脚本返回 2xx，并记录失败告警方式。

## 8. 当前结论

- 实体表：有 DDL、同步脚本和线上 36 表影子对账通过证据，仍未完全替代 `app_store`；运行时读写切换继续由后端/API 推进。
- 对象存储/CDN：`pomer-party-recorder-prod` 私有 OSS Bucket + `cdn.pomer.cn` CDN 基础链路已验收，OSS RAM 环境变量已注入，provider 已切到 `oss`，接口联调真实上传 CDN URL 已闭环；`oss:DeleteObject` 最小权限已补齐，测试对象可由脚本自动清理。
- 备份监控：Nginx/MySQL/PM2 已具备一次性备份恢复证据、健康监控脚本和 cron 定时落地证据。
- `app_store` 当前仍是主存储，不得删除或退役。

## 9. 009 线上证据收口

本节基于 PM 已记录的线上证据目录补充，不提交任何敏感 `.env`、AccessKey、Secret 或 token 原文。

### 9.1 运维脚本最终状态

已复核脚本：

- `deploy/ops/ops-009-backup-drill.sh`
- `deploy/ops/ops-009-enable-oss-env.sh`
- `deploy/ops/ops-009-health-monitor.sh`
- `deploy/ops/ops-009-install-cron.sh`

收口要求：

- `ops-009-enable-oss-env.sh` 只落 `env.before.redacted` / `env.after.redacted`，敏感键只记录长度。
- `ops-009-backup-drill.sh` 和 `ops-009-health-monitor.sh` 的 `pm2 jlist` 证据只保存脱敏 JSON。
- `ops-009-health-monitor.sh` 不持久化完整 `nginx -T`，只保存 `api.pomer.cn` 命中片段，避免把其他项目配置纳入 DBA 009 证据。
- 所有脚本目标默认指向 `/www/wwwroot/jiuzhuopanguan-git/backend`、`/www/backup/jiuzhuopanguan`、`jiuzhuopanguan-backend`、`api.pomer.cn`、`cdn.pomer.cn`。

### 9.2 线上证据目录引用

- 一次性健康监控证据：`/www/backup/jiuzhuopanguan/ops-009-health-20260622115522`，结果 `status=0`。
- cron 安装前备份：`/www/backup/jiuzhuopanguan/crontab.before-ops009-20260622115935.txt`。
- cron 健康监控滚动目录：`/www/backup/jiuzhuopanguan/ops-009-health-latest`，同一 cron 命令手工执行结果 `status=0`。
- cron 健康监控日志：`/www/backup/jiuzhuopanguan/ops-009-cron-health.log`。
- cron 备份演练日志：`/www/backup/jiuzhuopanguan/ops-009-cron-backup.log`。
- OSS env 配置证据：`/www/backup/jiuzhuopanguan/ops-009-oss-env-20260622123327`。
- OSS 真实上传 E2E 证据：`/www/backup/jiuzhuopanguan/ops-009-oss-upload-20260622125500`。
- OSS 上传清理后实体表修复证据：`/www/backup/jiuzhuopanguan/ops-009-oss-upload-20260622125500/post-sync/verify-normalized-shadow.json`。
- OSS 上传后健康监控证据：`/www/backup/jiuzhuopanguan/ops-009-health-20260622130000`，结果 `status=0`。
- OSS DeleteObject 权限补齐与旧 smoke 对象清理证据：`/www/backup/jiuzhuopanguan/ops-009-oss-delete-20260622162000`。
- OSS 上传 E2E 最终复跑证据：`/www/backup/jiuzhuopanguan/ops-009-oss-upload-20260622180000`。
- 最终 E2E 后残留对账：`/www/backup/jiuzhuopanguan/ops-009-post-final-oss-clean-20260622180500`。

### 9.3 已执行证据摘要

- Nginx：已备份 `api.pomer.cn` 相关配置 2 份，`nginx -t` 成功。
- MySQL：因应用账号无建库权限，恢复演练改用同库临时表恢复 `app_store`；`restored_app_store_rows=5`；临时表已删除，复查 `restore_temp_tables=0`。
- PM2：已导出 `describe-jiuzhuopanguan-backend.txt`、脱敏 `pm2-jlist`、最近日志；`jiuzhuopanguan-backend` online，`unstable restarts=0`。
- API：`https://api.pomer.cn/api/v1/config/home` HTTP 200；`https://api.pomer.cn/admin/login` HTTP 200。
- CDN：`https://cdn.pomer.cn/cdn-check.png` HTTP 200，`Content-Type=image/png`，`Content-Length=45947`，`x-oss-cdn-auth=success`。
- cron：已安装 `# BEGIN jiuzhuopanguan ops-009` 到 `# END jiuzhuopanguan ops-009` 标记块；每 15 分钟执行健康监控；每日 03:20 执行 Nginx/MySQL/PM2 备份与恢复演练。
- OSS env：`UPLOAD_PROVIDER=oss`、`UPLOAD_BUCKET=pomer-party-recorder-prod`、`UPLOAD_REGION=oss-cn-beijing`、`UPLOAD_PUBLIC_BASE_URL=https://cdn.pomer.cn`、`OSS_SOURCE_HOST=pomer-party-recorder-prod.oss-cn-beijing.aliyuncs.com`、`UPLOAD_LOCAL_MIRROR=1`；密钥仅记录长度，未写原文。
- OSS DeleteObject 权限补齐：用户已在 RAM 用户 `jzp-oss-uploader-prod` 下新增 `DeleteObject` 权限策略；旧 smoke 对象 `client.delete(objectKey)` 返回 `ok=true`、HTTP status `204`；删除后 `client.head(objectKey)` 返回 `exists=false`、`code=NoSuchKey`、HTTP status `404`。
- OSS 上传 E2E 最终复跑：上传接口返回 `uploadHttp=201`、`provider=oss`、URL 为 `https://cdn.pomer.cn/moments/session-1782112459649-56e4e0/1782112461643-ops009-oss-smoke-1782112461563-5a8acd.webp`；CDN HEAD 返回 `status=200`、`Content-Type=image/webp`、`x-oss-cdn-auth=success`；`deletedObject=true`；PM2 前后重启均 `exit=0` 且 `apiReady=true`。
- 清理：最终 E2E 后残留对账通过，`verify-normalized-shadow.json` 通过，`verify-session-read.json` 通过且 `mismatchCount=0`，`verify-share-image-read.json` 通过，健康监控通过。
- 实体表：修复后 `verify-normalized-shadow.json` 为 `ok=true`、`checkedTables=36`、`mismatches=[]`；仍不能宣称实体表已完全替代 `app_store`。

### 9.4 当前状态

- Cron：已落地，健康监控每 15 分钟执行，备份恢复演练每日 03:20 执行。
- PM2：`jiuzhuopanguan-backend` online，已按 OSS env 重启；`pomer` 官网服务未重启。
- Nginx：`api.pomer.cn` 相关配置已备份，`nginx -t` 成功；未改 `pomer.cn` 官网 server block。
- MySQL：已完成 dump 与同库临时表恢复演练；临时表已删除；实体表影子对账通过。
- OSS/CDN：provider 已切到 `oss`，真实上传 URL 与 CDN HEAD 已通过；`oss:DeleteObject` 已补齐，上传后删除清理已通过最终复跑。
- 官网边界：本次证据和脚本均面向 `api.pomer.cn` / `jiuzhuopanguan`；`pomer.cn` 公司官网未改动、未重启、未部署。

## 10. SHARE-AUTH-011 DBA/运维观察项

PM 知会：分享图权限尚未闭环；首页封面已由后端返回 `coverPhotoUrl`，线上部署版本为 `c9dc0b05 fix(home): use first uploaded photo as memory cover`。DBA/运维当前不改 PM 总台账，只记录后续后端补 SHARE-AUTH-011 后需要复核的数据一致性风险。

### 10.1 重点表与字段

- `wine_session_members`：踢出成员、重新通过分享链接加入、房主/成员权限变更后，`app_store.admin_store.liveSessions[].members` 与 normalized 行数和 `session_id/profile_id/status/is_host` 必须一致。
- `share_image_tasks`：进行中禁止、结束后允许、无权限禁止、重新加入恢复归属后，任务创建/刷新/处理不能产生孤儿任务；`status/image_url/brief_id/session_id` 必须与 `app_store.moments_store.shareImageTasks` 对齐。
- `session_briefs`：`share_image_task_id/share_image_status/timeline_node_ids_json` 应随分享任务状态同步，不能出现 brief 指向已拒绝或已删除任务。
- `moment_records.image_url`：`coverPhotoUrl` 来源依赖本局最早上传图；后端补权限后仍需确认实体表 `moment_records.image_url` 与 app_store 照片记录一致，且不把默认图、空 URL 或无权限照片作为封面。

### 10.2 后端补丁后的复核命令建议

只面向 `api.pomer.cn` / `jiuzhuopanguan` 服务执行，不触碰 `pomer.cn` 官网：

```bash
cd /www/wwwroot/jiuzhuopanguan-git/backend
npm run db:sync-normalized
node scripts/verify-normalized-shadow.js
node scripts/verify-normalized-share-image-summaries.js
node scripts/verify-normalized-summary-read.js
node scripts/audit-normalized-tables.js
BACKUP_ROOT=/www/backup/jiuzhuopanguan STAMP=share-auth-011 scripts/ops-009-health-monitor.sh
```

验收口径：

- `verify-normalized-shadow.js` 返回 `ok=true`，且 `wine_session_members`、`share_image_tasks`、`session_briefs`、`moment_records` 无 mismatch。
- 分享图权限 smoke 后，进行中禁止与无权限禁止场景不得写入多余 `share_image_tasks`。
- 结束后允许生成场景必须同时写入 `share_image_tasks` 与 `session_briefs.share_image_task_id/share_image_status`。
- 重新加入恢复归属后，`wine_session_members` 必须恢复成员关系；对应分享图读取权限应与 normalized 读侧一致。
- 首页封面复核必须看到 `coverPhotoUrl` 来自同 `sessionId` 的真实 `moment_records.image_url`。

初始状态：本节仅记录观察项；当时未执行服务器命令，未修改 PM 总台账，未触碰 `pomer.cn` 官网。后续部署执行与证据见第 11 节。

## 11. SHARE-AUTH-011 后端合同部署证据

日期：2026-06-23

目标边界：仅面向 `api.pomer.cn` / `/www/wwwroot/jiuzhuopanguan-git/backend` / `jiuzhuopanguan-backend`。未触碰 `pomer.cn` 官网服务。

PM 同步的后端合同提交：`94960a43edab660077acba6c2cbd954acfa123cb backend: enforce ended share image auth`。

### 11.1 执行命令

```bash
cd /www/wwwroot/jiuzhuopanguan-git
git pull --ff-only origin main
cd /www/wwwroot/jiuzhuopanguan-git/backend
pm2 restart jiuzhuopanguan-backend --update-env
curl -fsS -o /dev/null -w "config_home http=%{http_code}\n" https://api.pomer.cn/api/v1/config/home
curl -fsS -o /dev/null -w "admin_login http=%{http_code}\n" https://api.pomer.cn/admin/login
```

### 11.2 证据目录

线上证据目录：`/www/backup/jiuzhuopanguan/share-auth-011-deploy-20260623110308`

关键文件：

- `SUMMARY.txt`
- `git-status-before.txt`
- `git-head-before.txt`
- `git-pull.txt`
- `git-head-after.txt`
- `pm2-status-before.txt`
- `pm2-describe-before.txt`
- `pm2-restart.txt`
- `pm2-status-after.txt`
- `pm2-describe-after.txt`
- `pm2-logs-after.txt`
- `api-config-home.txt`
- `api-admin-login.txt`

### 11.3 部署结果

- 部署前 head：`c9dc0b0589f8d6a303bf59b359e1267dfb87534d`
- 部署后 head：`94960a43edab660077acba6c2cbd954acfa123cb`
- `git pull --ff-only origin main`：fast-forward 成功。
- `pm2 restart jiuzhuopanguan-backend --update-env`：成功，目标进程 online。
- PM2 after：`jiuzhuopanguan-backend` pid `749779`，status `online`，unstable restarts `0`，script path `/www/wwwroot/jiuzhuopanguan-git/backend/server.js`。
- `GET https://api.pomer.cn/api/v1/config/home`：HTTP 200，`content_type=application/json; charset=utf-8`。
- `GET https://api.pomer.cn/admin/login`：HTTP 200，`content_type=text/html; charset=utf-8`。
- 远端工作区仍存在运行时数据/上传文件改动：`backend/data/social-store.json`、`backend/public/uploads/**`。本次未清理、未回滚、未删除这些运行时文件。
- `pomer` 官网 PM2 进程仅在 `pm2 status` 输出中被动显示，未重启，restarts 仍为 `0`。

### 11.4 后续 DBA 观察项

后端 SHARE-AUTH-011 上线后，后续如进行接口联调或测试写入，应复跑第 10 节的 normalized 对账命令，重点确认：

- 进行中禁止创建/刷新/处理最终分享图任务时，`share_image_tasks` 不产生多余行。
- 结束后允许创建时，`share_image_tasks` 与 `session_briefs` 同步一致。
- 被踢成员读取被拒绝时，`wine_session_members` 与 app_store 成员绑定一致。
- 首页 `coverPhotoUrl` 仍来自同局真实 `moment_records.image_url`。
