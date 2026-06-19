# 数据库结构整改计划

更新时间：2026-06-13

## 1. 当前实际状态

当前后端已经支持 MySQL，但仍采用大 JSON store 模型：

```sql
app_store(
  store_key VARCHAR(64) PRIMARY KEY,
  data_json LONGTEXT NOT NULL,
  updated_at TIMESTAMP
)
```

初始化脚本：

```text
backend/sql/mysql-init.sql
```

读写适配层：

```text
backend/data/store-accessor.js
```

启用 MySQL 的条件：

- `MYSQL_HOST`
- `MYSQL_USER`
- `MYSQL_DATABASE`

当前 store key：

- `content_store`
- `social_store`
- `admin_store`
- `asset_manifest`

本地 JSON 仍作为镜像和兜底：

- `backend/data/content-store.json`
- `backend/data/social-store.json`
- `backend/data/admin-store.json`
- `backend/data/asset-manifest.json`

## 2. 当前方案优点

- 迁移成本低，适合快速迭代。
- 本地开发无需 MySQL 也能运行。
- 首次启用 MySQL 时可从本地 JSON 自动导入。
- 通过 `STORE_FILE_MIRROR` 可以控制是否继续写本地镜像。

## 3. 当前主要风险

- 整块 JSON 覆盖写，并发写入存在互相覆盖风险。
- 无法给 `profileId`、`sessionId`、`reportId`、`inviteCode`、`createdAt` 等字段建立业务索引。
- 后台分页、筛选、导出、统计都依赖应用层全量读写。
- 积分流水、登录日志、操作日志、埋点事件等增长后会拖慢整块 store。
- 用户、酒局、战报、积分、社交关系、后台权限之间没有外键约束。
- 审计、回滚、财务核算、核销对账缺少结构化基础。

## 4. 建议实体表

### 4.1 用户与会话

- `users`: `id`, `wechat_open_id`, `wechat_union_id`, `phone`, `name`, `avatar_url`, `signature`, `identity_tag`, `login_count`, `last_login_at`, `created_at`, `updated_at`
- `user_sessions`: `token_hash`, `user_id`, `expires_at`, `created_at`
- `user_login_logs`: `id`, `user_id`, `wechat_open_id`, `phone`, `source`, `login_at`

说明：

- 当前项目应以微信 OpenID 为核心唯一身份。
- 手机号是可选绑定字段，不宜作为唯一必填主键。

### 4.2 酒局与战报

- `wine_sessions`: `id`, `invite_code`, `host_profile_id`, `name`, `template_id`, `template_name`, `player_count`, `state`, `status`, `source`, `started_at`, `ended_at`, `created_at`, `updated_at`
- `wine_session_members`: `id`, `session_id`, `profile_id`, `name`, `avatar_url`, `phone`, `is_host`, `status`, `debt_count`, `drink_count`, `cleared_count`, `meta_json`, `created_at`, `updated_at`
- `wine_session_wheel_events`: `id`, `session_id`, `member_id`, `question_id`, `delta_debt`, `delta_cleared`, `created_at`
- `wine_reports`: `id`, `session_id`, `profile_id`, `template_name`, `title`, `scene`, `highlight1`, `highlight2`, `highlight3`, `view_count`, `share_count`, `replay_count`, `status`, `created_at`

### 4.3 积分与商业化

- `user_commerce_states`: `profile_id`, `points`, `membership_active`, `membership_plan_id`, `membership_expires_at`, `updated_at`
- `points_tasks`: `id`, `title`, `value`, `icon_class`, `status`, `sort_order`
- `points_rewards`: `id`, `title`, `subtitle`, `cost`, `icon_class`, `status`, `sort_order`
- `points_ledger`: `id`, `profile_id`, `delta`, `kind`, `source_id`, `title`, `created_at`
- `points_task_claims`: `id`, `profile_id`, `task_id`, `source_id`, `claimed_at`
- `reward_redemptions`: `id`, `profile_id`, `reward_id`, `cost`, `created_at`
- `membership_plans`: `id`, `name`, `price`, `duration_days`, `status`, `sort_order`
- `membership_orders`: `id`, `profile_id`, `plan_id`, `created_at`, `expires_at`, `status`

### 4.4 模板、题库、内容运营

- `template_filters`: `id`, `name`, `sort_order`, `status`
- `templates`: `id`, `filter_id`, `title`, `meta`, `cost`, `image_url`, `status`, `sort_order`
- `question_bank`: `id`, `content`, `type`, `difficulty`, `template`, `risk_level`, `status`, `created_at`, `updated_at`
- `share_assets`: `id`, `name`, `asset_type`, `scene`, `image_url`, `status`, `open_count`, `return_count`, `created_at`, `updated_at`
- `tools_catalog`: `id`, `name`, `category`, `target`, `image_url`, `usage_count`, `favorite_count`, `status`, `sort_order`, `is_hot`, `placement`
- `home_configs`: 低频配置可继续保留 JSON，例如 Hero、活动 Banner、快捷工具

### 4.5 社交

- `friendships`: `id`, `owner_id`, `friend_id`, `alias`, `meta`, `updated_at`
- `poke_threads`: `id`, `sender_id`, `receiver_id`, `status`, `created_at`, `updated_at`

### 4.6 埋点与日志

- `analytics_events`: `id`, `type`, `profile_id`, `report_id`, `asset_id`, `tool_id`, `meta_json`, `created_at`
- `admin_users`: `id`, `username`, `password_hash`, `name`, `role_id`, `status`, `last_login_at`
- `admin_roles`: `id`, `name`, `scope`, `permissions_json`, `status`
- `admin_sessions`: `token_hash`, `user_id`, `expires_at`, `created_at`
- `admin_operation_logs`: `id`, `operator_id`, `action`, `target_type`, `target_id`, `detail`, `created_at`
- `assets`: `id`, `category`, `file_name`, `url`, `mime_type`, `size`, `created_at`

### 4.7 精彩瞬间时间线

本轮“精彩瞬间时间线与分享增长”迭代已在 `backend/sql/mysql-normalized-schema.sql` 增补 DDL 草案。当前线上 `npm run mysql:test` 仅证明 `app_store` 可用，不能替代以下实体表验收。

- `moment_records`: 精彩瞬间节点，含 `session_id`、上传者、图片、文案、可见范围、审核状态、补全状态、用途授权。
- `session_events`: 欠酒、加酒、转盘等辅助事件节点。
- `session_briefs`: 时间线简报，关联 opening、closing、timeline 节点和分享任务状态。
- `share_image_tasks`: 分享图生成任务，含状态、图片 URL、失败原因、重试次数、节点白名单。
- `moment_reports`: UGC 举报处理记录。
- `moment_nominations`: M5 榜单推举记录，保留扣积分、退款状态和退款原因。
- `ranking_reward_rules`: 榜单奖励阶梯配置，保留分类、名次区间、积分和启用状态。
- `ranking_reward_payouts`: M5 榜单奖励发放记录，使用 `source_id` 防重复发奖。

验收要求：

- DBA/运维在可用 MySQL 环境执行 DDL，确认可重复执行。
- 后端保留 JSON store 兼容，不因实体表失败影响当前线上 API。
- 后续双写或查询切换前，必须补同步脚本和回滚方案。

## 5. 迁移顺序

### 阶段 1：只读镜像表

目标：不改变业务写入，先把 JSON store 拆出实体表用于查询。

动作：

1. 新建实体表。
2. 编写一次性同步脚本，把 `app_store` 中的数据展开写入实体表。
3. 后台只读页面优先从实体表读取，例如积分流水、登录日志、战报列表、酒局列表。
4. 保留旧 JSON store 作为写入源。

### 阶段 2：双写

目标：新增/更新时同时写 JSON store 和实体表。

优先双写对象：

1. 用户与登录日志
2. 积分流水
3. 酒局与成员
4. 战报
5. 埋点事件

要求：

- 每个双写动作必须可重复执行。
- 失败时要有日志和重放能力。
- 后台保存页面要避免只写一边。

### 阶段 3：查询切换

目标：业务读逐步切到实体表。

优先切换：

- `/api/v1/reports/history`
- `/api/v1/user/judge-stats`
- `/api/v1/points/tasks/:taskId/claim`
- `/api/v1/tools/usage-records`
- 后台 `commerce-point-ledger`
- 后台 `user-login-logs`

### 阶段 4：保留配置 JSON，移除高频业务 JSON

最终建议：

- 保留 JSON：首页配置、合规文案、低频运营配置。
- 迁出实体表：用户、酒局、战报、积分、社交、日志、埋点、上传资源。

## 6. 索引建议

- `users(wechat_open_id)` 唯一索引
- `users(phone)` 普通索引
- `wine_sessions(invite_code)` 唯一索引
- `wine_sessions(host_profile_id, created_at)`
- `wine_session_members(session_id, profile_id)`
- `wine_reports(session_id)`
- `wine_reports(profile_id, created_at)`
- `points_ledger(profile_id, created_at)`
- `points_task_claims(profile_id, task_id, claimed_at)`
- `analytics_events(type, profile_id, created_at)`
- `analytics_events(report_id, created_at)`
- `friendships(owner_id, friend_id)` 唯一索引
- `poke_threads(sender_id, receiver_id)`
- `admin_operation_logs(created_at)`

## 7. 当前不建议立刻做的事

- 不建议一次性删除 `app_store`，会增加回滚风险。
- 不建议先做复杂 BI，再补基础实体表。
- 不建议继续把积分流水、登录日志、埋点事件长期堆在同一个 JSON store 里。
- 不建议把手机号设为用户唯一主键，当前微信 OpenID 更符合实际登录链路。
