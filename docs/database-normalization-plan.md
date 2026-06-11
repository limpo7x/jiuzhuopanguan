# 数据库结构整改计划

当前后端通过 `app_store(store_key, data_json LONGTEXT)` 保存整块 JSON，适合演示和快速迭代，但不适合正式产品。

## 主要风险

- 查询无法使用业务索引，例如按 `profileId` 查积分流水、按 `sessionId` 查成员、按 `reportId` 查分享事件。
- 写入是整块 JSON 覆盖，并发写容易互相覆盖。
- 审计、回滚、统计、分页都依赖应用层全量读写。
- 用户、酒局、战报、积分、好友、埋点、后台权限之间没有数据库外键约束。

## 建议表

- `users`: `id`, `phone`, `wechat_open_id`, `wechat_union_id`, `name`, `avatar_url`, `identity_tag`, `created_at`, `updated_at`
- `user_sessions`: `token_hash`, `user_id`, `expires_at`, `created_at`
- `wine_sessions`: `id`, `invite_code`, `host_profile_id`, `name`, `template`, `player_count`, `state`, `status`, `created_at`, `updated_at`
- `wine_session_members`: `id`, `session_id`, `profile_id`, `name`, `avatar_url`, `is_host`, `status`, `debt_count`, `drink_count`, `cleared_count`
- `wine_reports`: `id`, `session_id`, `title`, `scene`, `share_rate`, `replay_rate`, `created_at`
- `points_ledger`: `id`, `profile_id`, `delta`, `kind`, `source_id`, `title`, `created_at`
- `friendships`: `id`, `owner_id`, `friend_id`, `alias`, `meta`, `updated_at`
- `poke_threads`: `id`, `sender_id`, `receiver_id`, `status`, `created_at`, `updated_at`
- `analytics_events`: `id`, `type`, `profile_id`, `report_id`, `asset_id`, `meta_json`, `created_at`
- `admin_users`, `admin_roles`, `admin_sessions`, `admin_operation_logs`
- `content_configs`: 保留低频配置 JSON，例如首页、积分、模板配置

## 迁移顺序

1. 新增实体表，保留 `app_store` 作为镜像。
2. 写双写适配层，新增数据同时写实体表和旧 JSON。
3. 后台列表、用户积分、酒局、战报、埋点查询切到实体表。
4. 稳定后只保留配置类 JSON，移除高频业务对象的整块覆盖写。
