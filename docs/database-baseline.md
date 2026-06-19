# 线上数据库基础信息与升级基线

更新时间：2026-06-15

## 1. 项目边界

本文件只记录酒桌判官项目数据库和服务信息。

- 项目域名：`api.pomer.cn`
- 后台入口：`https://api.pomer.cn/admin`
- API 前缀：`https://api.pomer.cn/api/v1`
- 禁止影响：`pomer.cn` 公司官网服务

同机 PM2 当前有两个服务：

| PM2 名称 | 用途 | 当前处理策略 |
| --- | --- | --- |
| `jiuzhuopanguan-backend` | 酒桌判官 API / 后台 | 可按本文操作 |
| `pomer` | 公司官网 | 不修改、不重启、不部署 |

## 2. 线上运行环境

| 项 | 当前值 |
| --- | --- |
| 服务器 SSH 别名 | `pomer.cn` |
| 酒桌判官项目目录 | `/www/wwwroot/jiuzhuopanguan-git` |
| 后端目录 | `/www/wwwroot/jiuzhuopanguan-git/backend` |
| PM2 服务名 | `jiuzhuopanguan-backend` |
| PM2 工作目录 | `/www/wwwroot/jiuzhuopanguan-git/backend` |
| PM2 启动文件 | `/www/wwwroot/jiuzhuopanguan-git/backend/server.js` |
| Node.js | `v20.20.2` |
| npm | `10.8.2` |
| 后端端口 | `3010` |
| Nginx 反代 | `api.pomer.cn` -> `127.0.0.1:3010` |

## 3. MySQL 基础信息

不在本文记录数据库密码。

| 项 | 当前值 |
| --- | --- |
| `MYSQL_HOST` | `127.0.0.1` |
| `MYSQL_PORT` | `3306` |
| `MYSQL_USER` | `jiuzhuopanguan` |
| `MYSQL_DATABASE` | `jiuzhuopanguan` |
| `MYSQL_STORE_TABLE` | `app_store` |
| `STORE_FILE_MIRROR` | `1` |

当前仍保留 `app_store` 作为配置和兼容主表，同时新增实体表作为后续前后端分离和数据库规范化升级基础。

## 4. 当前表结构分层

说明：以下 2026-06-14 快照不包含 2026-06-15 “精彩瞬间时间线与分享增长”迭代新增的 moments 实体表验收结果。新增 DDL 草案已在 `backend/sql/mysql-normalized-schema.sql` 中出现，但本轮线上 `npm run mysql:test` 只证明 `app_store` 可用，不能替代 moments 实体表执行验收。

### 4.1 兼容配置表

| 表 | 用途 |
| --- | --- |
| `app_store` | 当前 JSON store 兼容主表，包含 `content_store`、`social_store`、`admin_store`、`asset_manifest` |

### 4.2 用户与社交

| 表 | 用途 |
| --- | --- |
| `users` | 小程序用户 |
| `user_sessions` | 小程序用户登录态 |
| `user_login_logs` | 用户登录记录 |
| `friendships` | 酒友关系 |
| `poke_threads` | 互动打招呼线程 |

### 4.3 酒局与战报

| 表 | 用途 |
| --- | --- |
| `wine_sessions` | 酒局主表 |
| `wine_session_members` | 酒局成员 |
| `wine_reports` | 战报 |

### 4.4 积分与商业化

| 表 | 用途 |
| --- | --- |
| `points_tasks` | 积分任务配置 |
| `points_rewards` | 积分商品配置 |
| `user_commerce_states` | 用户积分与会员状态 |
| `points_ledger` | 积分流水 |
| `points_task_claims` | 任务领取记录 |
| `reward_redemptions` | 积分商品兑换 |
| `membership_orders` | 会员订单 |
| `membership_plans` | 会员套餐 |
| `membership_benefits` | 会员权益 |

### 4.5 内容运营

| 表 | 用途 |
| --- | --- |
| `template_filters` | 模板分类 |
| `templates` | 酒局模板 |
| `question_bank` | 题库 |
| `share_assets` | 分享素材 |
| `tools_catalog` | 工具箱目录 |
| `assets` | 上传资源索引 |

### 4.6 后台与日志

| 表 | 用途 |
| --- | --- |
| `admin_users` | 后台账号 |
| `admin_roles` | 后台角色 |
| `admin_sessions` | 后台登录态 |
| `admin_operation_logs` | 后台操作日志 |
| `analytics_events` | 埋点事件 |

### 4.7 精彩瞬间新增实体表待验收

| 表 | 用途 | 当前验收状态 |
| --- | --- | --- |
| `moment_records` | 精彩瞬间节点 | DDL 草案已出现，待 DBA/运维执行复核 |
| `session_events` | 时间线辅助事件 | DDL 草案已出现，待 DBA/运维执行复核 |
| `session_briefs` | 时间线简报 | DDL 草案已出现，待 DBA/运维执行复核 |
| `share_image_tasks` | 分享图任务 | DDL 草案已出现，待 DBA/运维执行复核 |
| `moment_reports` | UGC 举报记录 | DDL 草案已出现，待 DBA/运维执行复核 |
| `moment_nominations` | 榜单推举记录，含退款状态字段 | DDL 草案已出现，待 DBA/运维执行复核 |
| `ranking_reward_rules` | 榜单奖励规则，含 rank 区间和 points | DDL 草案已出现，待 DBA/运维执行复核 |
| `ranking_reward_payouts` | 榜单奖励发放记录 | DDL 草案已出现，待 DBA/运维执行复核 |

## 5. 当前数据量快照

快照时间：2026-06-14 16:51 左右。

| 表 | 行数 |
| --- | ---: |
| `admin_operation_logs` | 0 |
| `admin_roles` | 3 |
| `admin_sessions` | 0 |
| `admin_users` | 2 |
| `analytics_events` | 36 |
| `app_store` | 4 |
| `assets` | 50 |
| `friendships` | 0 |
| `membership_benefits` | 3 |
| `membership_orders` | 0 |
| `membership_plans` | 3 |
| `points_ledger` | 2 |
| `points_rewards` | 4 |
| `points_tasks` | 4 |
| `points_task_claims` | 0 |
| `poke_threads` | 0 |
| `question_bank` | 11 |
| `reward_redemptions` | 0 |
| `share_assets` | 3 |
| `template_filters` | 5 |
| `templates` | 9 |
| `tools_catalog` | 7 |
| `user_commerce_states` | 2 |
| `user_login_logs` | 11 |
| `user_sessions` | 3 |
| `users` | 2 |
| `wine_reports` | 8 |
| `wine_session_members` | 8 |
| `wine_sessions` | 8 |

## 6. 已完成的升级动作

2026-06-14 已完成：

1. 备份线上数据库。
2. 上传规范化实体表 DDL。
3. 停止 `jiuzhuopanguan-backend`。
4. 清空 `jiuzhuopanguan` 数据库。
5. 重建 `app_store` 和 28 张实体表。
6. 从线上 JSON 镜像同步数据到实体表。
7. 重启 `jiuzhuopanguan-backend`。
8. 验证核心 API 和后台登录页。

## 7. 备份位置

| 备份 | 路径 |
| --- | --- |
| 清库前数据库备份 | `/www/backup/jiuzhuopanguan/mysql-before-clear-20260614164702.sql` |
| 清库前代码文件备份 | `/www/backup/jiuzhuopanguan/code-before-db-reset-20260614164702` |
| 实体表前数据库备份 | `/www/backup/jiuzhuopanguan/mysql-before-normalized-notablespaces-20260614164615.sql` |

说明：

- `mysql-before-normalized-20260614164604.sql` 生成时 MySQL 用户缺少 `PROCESS` 权限，随后已使用 `--no-tablespaces` 重新生成干净备份。
- 恢复数据库前必须再次确认目标库是 `jiuzhuopanguan`。

## 8. 常用升级命令

### 8.1 进入后端目录

```bash
ssh pomer.cn
cd /www/wwwroot/jiuzhuopanguan-git/backend
```

### 8.2 测试 MySQL

```bash
npm run mysql:test
```

预期返回：

```json
{
  "ok": true,
  "table": "app_store",
  "total": 4
}
```

### 8.3 同步 JSON store 到实体表

```bash
npm run db:sync-normalized
```

该命令会：

- 创建缺失的实体表。
- 保留现有 `app_store`。
- 将线上 JSON store 镜像同步到实体表。
- 使用幂等 upsert，允许重复执行。

### 8.4 重启酒桌判官后端

```bash
pm2 restart jiuzhuopanguan-backend --update-env
```

不要重启 `pomer`。

### 8.5 验证线上接口

```bash
curl -f https://api.pomer.cn/api/v1/config/home
curl -f https://api.pomer.cn/api/v1/config/points
curl -f https://api.pomer.cn/api/v1/config/templates
curl -f https://api.pomer.cn/admin/login
```

注意：当前后端只处理 `GET /admin/login`，`HEAD /admin/login` 返回 404 是既有行为。

## 9. 后续升级建议

下一阶段建议做双写，不建议立刻把业务读写全部切到实体表。

优先顺序：

1. 用户登录、用户资料、登录日志双写。
2. 酒局创建、成员加入、酒局结束双写。
3. 战报生成、分享埋点双写。
4. 积分领取、积分调整、商品兑换双写。
5. 后台只读页面逐步改为实体表查询。

切换前必须保留回滚路径：

- `app_store` 继续保留。
- JSON 文件镜像继续保留。
- 实体表作为镜像和查询优化层先运行一段时间。
