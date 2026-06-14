# 数据库修整与前后端分离升级计划

更新时间：2026-06-14

## 1. 目标

本次改造目标不是一次性推翻现有后端，而是把当前可运行系统整理成可渐进升级的前后端分离架构：

- 前台小程序、中台、后台都只能通过 HTTP API 访问业务能力。
- 数据库从 `app_store` 大 JSON 逐步拆成可索引、可审计、可迁移的 MySQL 实体表。
- 低频运营配置可以继续保留 JSON；用户、酒局、战报、积分、登录日志、埋点、上传资产必须逐步实体化。
- 迁移过程保留回滚路径，不能破坏现有 `api.pomer.cn` 服务。

## 2. 当前基线

当前后端已经具备 API 边界：

- 前台 API：`/api/v1/config/*`、`/api/v1/user/*`、`/api/v1/sessions/*`、`/api/v1/reports/*`、`/api/v1/points/*`、`/api/v1/social/*`
- 后台 API：`/api/v1/admin/auth/*`、`/api/v1/admin/pages/:slug`、`/api/v1/admin/uploads/image`
- 后台页面：`/admin`、`/admin/login`、`/admin/pages/:slug`

当前数据库基线：

- MySQL 只保证 `app_store(store_key, data_json, updated_at)`。
- `content_store`、`social_store`、`admin_store`、`asset_manifest` 仍是大 JSON。
- 本地 JSON 文件仍作为镜像和兜底。

## 3. 目标数据模型

### 3.1 保留 JSON 的配置类数据

这些数据变化低、结构弹性高，可以暂时继续保留在 `app_store`：

- 首页装修配置
- 合规提示文案
- 分享文案配置
- 部分低频运营开关

### 3.2 必须实体化的高频业务数据

第一批实体表：

- `users`
- `user_sessions`
- `user_login_logs`
- `friendships`
- `poke_threads`
- `wine_sessions`
- `wine_session_members`
- `wine_reports`
- `points_tasks`
- `points_rewards`
- `user_commerce_states`
- `points_ledger`
- `points_task_claims`
- `reward_redemptions`
- `membership_orders`
- `template_filters`
- `templates`
- `question_bank`
- `share_assets`
- `tools_catalog`
- `membership_plans`
- `membership_benefits`
- `admin_users`
- `admin_roles`
- `admin_sessions`
- `admin_operation_logs`
- `analytics_events`
- `assets`

## 4. 升级阶段

### 阶段 1：实体表镜像

目标：不改变现有业务读写，先把 JSON store 同步到实体表。

本阶段已落地的工程动作：

- 新增 `backend/sql/mysql-normalized-schema.sql`。
- `backend/sql/mysql-init.sql` 继续保留 `app_store`，并说明实体表脚本需要单独执行。
- 新增 `backend/data/normalized-db.js`，负责建表和同步。
- 新增 `backend/scripts/sync-normalized-db.js`，作为人工迁移命令。
- 新增 `backend/package.json` 命令：`npm run db:sync-normalized`。

执行命令：

```bash
cd /data/www/jiuzhuopanguan/backend
set -a
. ./.env
set +a
npm run db:sync-normalized
```

本阶段上线规则：

- 不切换业务读写来源。
- 不删除 JSON store。
- 同步脚本必须可重复执行。
- 同步失败不得影响当前 API 服务启动。

### 阶段 2：双写

目标：新增或变更业务数据时，同时写 JSON store 和实体表。

优先双写顺序：

1. 用户登录、用户资料、登录日志
2. 酒局创建、成员加入、酒局更新
3. 战报生成、分享埋点
4. 积分领取、积分调整、商品兑换
5. 上传资产、后台操作日志

要求：

- 每个双写动作必须基于业务 ID 幂等。
- 实体表写失败时记录错误，不直接吞掉。
- 对财务、积分、核销类数据，后续要增加重放队列。

### 阶段 3：查询切换

目标：只读查询先切实体表，降低 JSON 全量读压力。

优先切换：

- 后台 `user-login-logs`
- 后台 `commerce-point-ledger`
- 后台 `system-operation-logs`
- `/api/v1/reports/history`
- `/api/v1/user/judge-stats`
- `/api/v1/tools/usage-records`

### 阶段 4：写入主源切换

目标：实体表成为高频业务主源，JSON store 只保留配置。

切换顺序：

1. 用户与会话
2. 酒局与成员
3. 战报
4. 积分流水
5. 社交关系
6. 埋点与日志

## 5. 前后端分离规则

- 小程序、未来 uni-app 前台、中台和后台都不得直接依赖 `backend/data/*.json`。
- 前端只允许访问 `/api/v1/*`。
- 后台管理页面只允许通过 `/api/v1/admin/*` 读写。
- 服务端内部可以短期保留 JSON store 兼容层，但必须收敛到 API 和实体表。
- 新增前端页面前，先补 API 文档和响应结构。

## 6. 风险与回滚

| 风险 | 控制方式 |
| --- | --- |
| 实体表结构不完整 | 阶段 1 只做镜像，不切业务读写 |
| 同步脚本误写数据 | 使用 `INSERT ... ON DUPLICATE KEY UPDATE` 幂等写入 |
| 线上数据库版本差异 | DDL 使用 `CREATE TABLE IF NOT EXISTS` |
| JSON 与实体表不一致 | 阶段 2 增加双写和重放机制 |
| 前后端改造范围过大 | API 契约先冻结，前台/后台分批替换 |

回滚方式：

- 阶段 1：停止执行 `db:sync-normalized` 即可，业务仍读写 JSON store。
- 阶段 2：关闭双写开关，回到 JSON store 主源。
- 阶段 3：只读 API 切回原有 store 查询。

## 7. 验收标准

阶段 1 验收：

- `node --check backend/data/normalized-db.js` 通过。
- `node --check backend/scripts/sync-normalized-db.js` 通过。
- `npm run db:sync-normalized` 在 MySQL 环境存在时可完成建表和同步。
- 无 MySQL 环境时脚本明确失败，不影响普通 `node server.js` 启动。

阶段 2 验收：

- 登录、创建酒局、结束酒局、积分领取、后台保存都能产生实体表记录。
- 重复请求不会产生重复关键记录。

阶段 3 验收：

- 后台只读页支持分页、筛选，并从实体表查询。
- 历史战报和积分流水不再依赖整块 JSON 扫描。
