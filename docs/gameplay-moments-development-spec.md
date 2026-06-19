# 酒桌判官精彩瞬间时间线迭代开发执行文档

更新时间：2026-06-15

依据文档：`docs/archive/gameplay-auction-moments-operation-plan.md`

## 1. 文档定位

本文是“精彩瞬间时间线与分享增长”迭代的研发执行口径。运营方案负责定义产品方向；本文负责定义开发边界、接口契约、前端/后端/后台分工、验收标准和项目经理审核方式。

后续开发人员必须按本文任务编号推进。任何代码改动、接口新增、页面新增、后台配置、数据库变更，都要在提交说明或迭代说明里标注对应任务编号，并由项目经理按第 12 节审核。

进度跟踪台账见：`docs/gameplay-moments-progress-tracker.md`。

## 2. 项目边界

- 本迭代只属于酒桌判官项目。
- API、后台、服务验证目标只能是 `api.pomer.cn`。
- 不得改动、重启、部署或代理 `pomer.cn` 公司官网服务。
- 当前小程序已有页面和后端接口要兼容保留，不能破坏创建酒局、加入酒局、判官记录、战报生成、积分中心、后台登录等既有链路。
- MVP 不做视频上传、拍卖、反转事件、判官精选特权、自由公开广场。

## 3. 当前仓库能力核查

| 模块 | 当前已有 | 本迭代缺口 | 结论 |
| --- | --- | --- | --- |
| 酒局创建/加入 | `POST /sessions`、`POST /sessions/join`、`GET /sessions/live` | 酒局内时间线节点、全员瞬间上传 | 复用酒局身份与成员判断，新增 moments 能力 |
| 判官记录 | `pages/live-record` 维护欠酒、加酒、转盘结果 | 辅助事件未独立写入时间线 | 需将欠酒/加酒/转盘变成 `sessionEvents` |
| 战报 | `POST /reports`、`GET /reports/:id`、`GET /reports/:id/poster.png` | 时间线版简报、开场/收尾照、未补全节点规则 | 需新增 `sessionBrief`，旧战报继续兼容 |
| 分享图 | 当前按报告同步下载海报 PNG | 异步生成任务、个人页完成提示 | 需新增 `shareImageTasks` 和个人页状态 |
| 积分 | 积分任务、商城、流水、后台手动调整 | 局外推举消耗积分、榜单奖励阶梯 | MVP 先做奖励配置，第二阶段接推举扣积分 |
| 后台 | 动态后台页、积分、战报、酒局、素材 | 瞬间二审、举报、分享图任务、榜单奖励配置 | 新增后台 slugs 和数据处理 |
| 数据库 | 已有规范化基础表和 `app_store` 兼容 | `moment_records` 等实体表缺失 | 先做 JSON store 兼容 + 实体表 DDL，逐步双写 |

## 4. 角色分工

| 角色 | 负责范围 | 必须产出 |
| --- | --- | --- |
| 产品/项目经理 | 范围裁剪、任务验收、风险判定 | 本文任务状态更新、验收结论、退回原因 |
| 小程序前端 | 页面入口、上传交互、时间线展示、个人页状态 | 页面代码、服务层类型、空态/失败态/权限态 |
| 后端/API | 数据模型、鉴权、上传、时间线、分享图任务、积分流水 | 接口、数据归一化、脚本、最小 smoke test |
| 后台管理 | 审核页、任务监控、奖励配置、举报处理 | 后台 slug、表单字段、权限、操作日志 |
| 测试/验收 | 端到端流程、边界场景、回归 | 验收记录、失败截图或接口响应、复测结论 |

人员状态补充：截至 2026-06-15，测试/验收负责人、接口联调负责人、UGC 风控/内容审核负责人和 UI/UX 负责人已新增。测试与接口联调的具体姓名/账号、`DEV-M0` 复核记录和固定联调数据仍待登记；UGC 风控口径已在 `docs/gameplay-moments-ugc-risk-control-plan.md` 固化，但 `UGC-QA-001` 至 `UGC-QA-008` 执行记录仍待补齐；UI/UX 已在 `docs/gameplay-moments-ui-ux-development-plan.md` 建立版本升级计划和 SKILL 自动选择规则，但截图证据和设计 QA 结论仍待补齐。

### 4.1 进度节点修改边界

- 各角色只能修改自己负责的任务节点、交付记录和证据说明。
- 总进度节点、跨角色结论、里程碑状态和 PM 审核结论只能由项目经理/Codex PM 在验证后统一更新。
- 开发成员不得直接把他人任务、跨角色任务或总进度改为“已完成”。
- 如果任务依赖其他角色，只能在本人节点标记“待联调 / 阻塞 / 待复核”，并写明依赖的角色、任务编号和缺少证据。
- 为避免重复修改同一文件，角色进度优先写入对应角色计划；`docs/gameplay-moments-progress-tracker.md` 只作为 PM 汇总台账。

## 5. 版本拆分

### M0 合同与数据底座

目标：先让接口、数据结构、权限规则定型，前端和后台不再各自造假数据。

必须完成：

- `DEV-M0-01` 新增数据模型和 DDL 草案。
- `DEV-M0-02` 新增后端 moments 数据访问层，先兼容 JSON store，再预留实体表双写。
- `DEV-M0-03` 更新 `docs/api-spec.md`，写清 moments、timeline、brief、share task、admin review 接口。
- `DEV-M0-04` 更新小程序 `services/operations.ts` 类型和方法，不做复杂 UI。
- `DEV-M0-05` 增加最小后端 smoke 脚本或可复用 curl 清单。

验收：能创建酒局后，通过接口创建一条开场瞬间、一条普通瞬间、一条私密爆料、一条欠酒辅助事件，并按时间线读回。

### M1 小程序 MVP 时间线

目标：用户能在真实酒局里上传和查看精彩瞬间。

必须完成：

- `DEV-M1-01` 等待室增加每人 1 张开场打卡入口，可替换，不强制。
- `DEV-M1-02` 进行中记录页主按钮改为“添加精彩瞬间”，欠酒/加酒/转盘降为辅助按钮。
- `DEV-M1-03` 新增或复用瞬间编辑页，支持图片、文案、标签、可见范围、用途授权。
- `DEV-M1-04` 支持私密爆料指定本局成员可见，非接收者只看到占位节点。
- `DEV-M1-05` 时间线按 `createdAt` 展示开场、精彩瞬间、辅助事件、私密占位、收尾。
- `DEV-M1-06` 首页或判官入口展示正在进行中的酒局，一键返回当前时间线。

验收：普通成员不是判官也能添加瞬间；判官只在辅助事件上有额外操作权；私密内容不会泄露给非接收者。

### M2 结束页与简报

目标：结束酒局不被未补图阻塞，但简报能清楚呈现完整性状态。

必须完成：

- `DEV-M2-01` 结束流程引导上传收尾照，不强制。
- `DEV-M2-02` 生成 `sessionBrief`，按时间线展示开场、过程、辅助事件、收尾。
- `DEV-M2-03` 未补图节点可留占位，但不能公开分享、上榜、打赏。
- `DEV-M2-04` 个人页/历史页显示待补图数量、可继续补全入口。
- `DEV-M2-05` 旧 `result-report` 保留兼容，新增时间线简报逐步替代旧战报展示。

验收：无收尾照、部分瞬间缺图时仍可结束酒局；补图后状态从 `needs_media` 进入 `complete`。

### M3 异步分享图

目标：分享图从前端同步等待改成服务端任务，完成后在个人页提示。

必须完成：

- `DEV-M3-01` 新增 `shareImageTasks` 数据结构和任务状态机。
- `DEV-M3-02` `POST /session-briefs/:briefId/share-image-tasks` 创建任务，返回 `pending`。
- `DEV-M3-03` 后端任务执行 `pending -> processing -> ready/failed`，可先用进程内队列，必须可重试。
- `DEV-M3-04` 个人页酒局列表展示“分享图生成中 / 已生成 / 失败可重试”。
- `DEV-M3-05` 分享图内容按时间线筛选：开场拼图、3-6 个关键节点、辅助事件小标签、收尾照、再开一局入口码。

验收：用户点击生成分享图后可离开页面；任务完成后从个人页进入查看或保存；失败任务可重试。

### M4 后台审核与运营配置

目标：运营人员能处理 UGC 风险，配置榜单奖励，不需要开发改数据。

必须完成：

- `DEV-M4-01` 后台新增 `content-moments-review`：瞬间审核、二审、隐藏、要求重传、移出榜单候选。
- `DEV-M4-02` 后台新增 `content-moment-reports`：举报处理、处理记录、下架状态。
- `DEV-M4-03` 后台新增 `growth-share-tasks`：分享图任务监控、重试、失败原因。
- `DEV-M4-04` 后台新增或扩展 `commerce-points`：榜单积分阶梯奖励配置。
- `DEV-M4-05` 所有后台处理写入 `admin_operation_logs`，至少包含操作者、动作、目标、理由、时间。

验收：管理员可把一条已补全瞬间从待二审改为通过、隐藏、要求重传；前台状态立即受影响。

### M5 第二阶段榜单与局外推举

目标：在 MVP 稳定后再引入积分消耗和榜单增长。

必须完成：

- `DEV-M5-01` 新增今日榜单页：今日最有梗、最欠酒、最精彩、最有画面、最佳开场、最佳收尾。
- `DEV-M5-02` 新增推举接口，只有参与过该局的用户可推举。
- `DEV-M5-03` 推举只允许 `complete + consent + approved + rankingEligible` 的瞬间。
- `DEV-M5-04` 推举扣积分写入 `points_ledger`，失败、下架、风控退回必须有退款或转余额规则。
- `DEV-M5-05` 榜单奖励按后台阶梯配置发放，奖励流水可追溯。

验收：同一用户每日对同一瞬间有次数限制；积分扣减、退回、奖励都可在后台流水查到。

## 6. 数据模型

### 6.1 新增实体表

后端先实现 JSON store 兼容，数据库升级时新增以下实体表。字段命名使用 snake_case，API 返回使用 camelCase。

| 表 | 用途 | MVP |
| --- | --- | --- |
| `moment_records` | 开场、精彩、私密、收尾等 UGC 节点 | 是 |
| `session_events` | 欠酒、加酒、转盘等辅助事件 | 是 |
| `session_briefs` | 时间线版酒局简报 | 是 |
| `share_image_tasks` | 分享图异步生成任务 | 是 |
| `moment_reports` | 举报与处理记录 | 是 |
| `moment_nominations` | 局外积分推举 | 第二阶段 |
| `ranking_reward_rules` | 榜单奖励阶梯配置 | MVP 配置，第二阶段发放 |

### 6.2 moment_records 核心字段

| 字段 | 类型 | 规则 |
| --- | --- | --- |
| `id` | varchar | `moment-` 前缀 |
| `session_id` | varchar | 必须属于有效酒局 |
| `uploader_profile_id` | varchar | 当前登录用户 |
| `node_type` | enum string | `opening/highlight/drinking/private/closing` |
| `media_type` | enum string | MVP 仅 `image`，预留 `video` |
| `image_url` | text | `needs_media` 可为空 |
| `caption` | text | 为空时后端生成默认文案 |
| `tags_json` | json | 标签数组 |
| `visibility` | enum string | `private/selected/session/share/featured` |
| `visible_profile_ids_json` | json | selected/private 必填 |
| `usage_consent_json` | json | 默认全 true，用户可取消 |
| `completion_status` | enum string | `draft/needs_media/complete` |
| `review_status` | enum string | `pending/approved/rejected/hidden` |
| `secondary_review_status` | enum string | `pending/approved/rejected/require_resubmit` |
| `ranking_eligible` | tinyint | 必须由规则计算，不信任前端 |
| `reward_eligible` | tinyint | 必须由规则计算，不信任前端 |
| `is_timeline_placeholder` | tinyint | 私密内容对非接收者为 true |
| `created_at` | datetime | 服务端写入，可接收客户端时间但不能完全信任 |

### 6.3 session_events 核心字段

| 字段 | 类型 | 规则 |
| --- | --- | --- |
| `id` | varchar | `event-` 前缀 |
| `client_event_id` | varchar | 前端幂等键，避免弱网重复提交 |
| `session_id` | varchar | 必填 |
| `event_type` | enum string | `drink_debt/drink_add/wheel_result` |
| `operator_profile_id` | varchar | 当前登录用户，MVP 只允许判官提交 |
| `target_profile_id` | varchar | 目标成员 |
| `score_delta` | int | 加酒/欠酒变化 |
| `caption` | text | 可选 |
| `created_at` | datetime | 时间线排序字段 |

### 6.4 状态计算规则

| 场景 | completionStatus | reviewStatus | secondaryReviewStatus | rankingEligible | rewardEligible |
| --- | --- | --- | --- | --- | --- |
| 无图草稿 | `needs_media` | `pending` | `pending` | false | false |
| 有图有文案，未授权榜单 | `complete` | `pending` | `pending` | false | false |
| 已授权但未二审 | `complete` | `approved` | `pending` | false | false |
| 二审通过 | `complete` | `approved` | `approved` | true | true |
| 私密爆料 | `complete` 或 `needs_media` | `pending` | `pending` | false | false |
| 被隐藏/要求重传 | `needs_media` 或 `complete` | `hidden/rejected` | `require_resubmit` | false | false |

## 7. API 合同

所有小程序接口默认需要用户登录。后端必须校验当前用户是否为本局成员；判官权限只用于辅助事件和结束酒局，不用于精选内容。

### 7.1 小程序接口

| 方法 | 路径 | 任务 | 说明 |
| --- | --- | --- | --- |
| `POST` | `/sessions/:sessionId/moments` | M0/M1 | 创建瞬间，支持开场、精彩、私密、收尾 |
| `PUT` | `/moments/:momentId` | M0/M1 | 编辑本人瞬间、补图、更新授权 |
| `DELETE` | `/moments/:momentId` | M0/M1 | 删除本人草稿或未公开瞬间 |
| `GET` | `/sessions/:sessionId/timeline` | M0/M1 | 读取本局时间线，按可见范围返回 |
| `POST` | `/sessions/:sessionId/events` | M0/M1 | 写入欠酒、加酒、转盘辅助事件 |
| `POST` | `/sessions/:sessionId/brief` | M2 | 生成或刷新时间线简报 |
| `GET` | `/session-briefs/:briefId` | M2 | 读取简报详情 |
| `POST` | `/session-briefs/:briefId/share-image-tasks` | M3 | 创建分享图任务 |
| `GET` | `/share-image-tasks/:taskId` | M3 | 查询任务状态 |
| `POST` | `/share-image-tasks/:taskId/retry` | M3 | 失败重试 |
| `GET` | `/user/session-moment-summaries` | M2/M3 | 个人页/历史页读取待补图、分享图状态、推举入口 |
| `GET` | `/rankings/today?category=...` | M5 | 今日榜单 |
| `POST` | `/moments/:momentId/nominations` | M5 | 消耗积分推举 |

### 7.2 上传接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `POST` | `/moments/uploads/image` | 小程序上传图片，返回 `/uploads/moments/*` URL |

请求体可以先沿用后台上传模式：

```json
{
  "fileName": "opening.jpg",
  "dataUrl": "data:image/jpeg;base64,...",
  "sessionId": "session-xxx"
}
```

规则：

- 文件大小上限 MVP 建议 5 MB。
- 仅允许 `image/jpeg`、`image/png`、`image/webp`。
- 服务端写入资源索引，分类为 `moments`。
- 生产后续迁移 OSS/COS/CDN 时，接口返回结构保持不变。

### 7.3 后台接口

后台继续优先使用动态页模式：

| slug | 任务 | 权限 | 说明 |
| --- | --- | --- | --- |
| `content-moments-review` | M4 | 内容运营 | 瞬间审核与二审 |
| `content-moment-reports` | M4 | 内容运营 | 举报处理 |
| `growth-share-tasks` | M4 | 增长与数据 | 分享图任务监控 |
| `commerce-ranking-rewards` | M4/M5 | 商业化 | 榜单奖励阶梯配置 |

保存仍走：

- `GET /api/v1/admin/pages/:slug`
- `PUT /api/v1/admin/pages/:slug`

若某个操作需要强审计，不要只依赖批量保存，需新增动作接口，例如：

- `POST /api/v1/admin/moments/:momentId/review`
- `POST /api/v1/admin/moments/:momentId/require-resubmit`
- `POST /api/v1/admin/share-image-tasks/:taskId/retry`

## 8. 小程序前端实施要求

### 8.1 页面与入口

| 页面 | 改动 | 任务 |
| --- | --- | --- |
| `pages/index/index` | 展示正在进行中的酒局，一键返回时间线 | M1 |
| `pages/waiting-room/index` | 开场打卡入口、已上传状态、替换入口 | M1 |
| `pages/live-record/index` | 主按钮为添加精彩瞬间，辅助事件降权 | M1 |
| `pages/moment-editor/index` | 新增瞬间编辑页，支持图片、文案、标签、授权 | M1 |
| `pages/session-brief/index` | 新增时间线简报页 | M2 |
| `pages/wine-history/index` | 展示待补图、分享图状态、可推举入口 | M2/M3/M5 |
| `pages/me/index` | 个人页提示分享图完成和待补图 | M2/M3 |
| `pages/share-poster/index` | 迁移到任务查询与成品图查看 | M3 |
| `pages/table-mode/index` | 时间线轮播精彩瞬间，辅助数据弱展示 | M1/M2 |
| `pages/rankings/index` | 今日榜单，第二阶段新增 | M5 |

### 8.2 组件建议

| 组件 | 用途 |
| --- | --- |
| `components/moment-timeline` | 时间线节点列表 |
| `components/moment-card` | 图片/文案/标签/状态展示 |
| `components/moment-consent` | 用途授权选项 |
| `components/share-task-status` | 分享图任务状态展示 |
| `components/session-return-bar` | 正在进行中酒局快捷返回 |

组件不是强制目录，但功能必须模块化，避免在单页内堆所有逻辑。

### 8.3 前端状态与失败态

必须覆盖：

- 未登录：先登录再创建/编辑瞬间。
- 非本局成员：不能查看时间线详情。
- 非判官：不能提交辅助事件，但能提交自己的精彩瞬间。
- 弱网重复提交：使用 `clientEventId` 或前端本地 pending 状态防重。
- 上传失败：保留草稿，不丢文案和授权选择。
- 私密爆料：非接收者不可看到图片、正文、完整接收名单。
- 分享图任务失败：显示失败原因摘要和重试入口。

## 9. 后端实施要求

### 9.1 模块建议

| 文件 | 职责 |
| --- | --- |
| `backend/data/moments.js` | moment、timeline、brief、task 的读写与归一化 |
| `backend/data/rankings.js` | 第二阶段榜单、推举、奖励计算 |
| `backend/scripts/smoke-moments-flow.js` | moments 关键链路 smoke test |
| `backend/sql/mysql-normalized-schema.sql` | 新增实体表 DDL |
| `backend/server.js` | 路由接入，保持薄路由 |

### 9.2 权限规则

- 创建瞬间：本局成员可创建。
- 编辑瞬间：上传者本人可编辑；管理员只能通过后台审核接口改变审核状态。
- 删除瞬间：公开前上传者可删除；公开后改为隐藏或撤回，不物理删除。
- 私密爆料：只有上传者和指定接收者可看正文和图片。
- 辅助事件：MVP 只允许判官提交，后续可开放给本人确认。
- 结束酒局：仍按现有判官权限。
- 分享图任务：本局成员可为自己的简报触发；任务内容按可见性过滤。

### 9.3 幂等与恢复

- 写入瞬间可接收 `clientDraftId`，同一用户同一 session 下重复提交应返回原记录。
- 写入辅助事件必须接收 `clientEventId`。
- 分享图任务同一 `briefId + layoutMode` 已有 `pending/processing/ready` 时，不重复创建，直接返回现有任务。
- 上传图片成功但保存 moment 失败时，资源保留为孤儿资产，后台或脚本后续清理。

## 10. 后台实施要求

### 10.1 审核页字段

`content-moments-review` 至少展示：

- 缩略图
- 文案
- 标签
- 酒局名称
- 上传者
- 节点类型
- 可见范围
- 授权状态
- 补全状态
- 审核状态
- 二审状态
- 举报数
- 操作：通过、隐藏、要求重传、移出榜单候选

### 10.2 分享图任务页字段

`growth-share-tasks` 至少展示：

- 任务 ID
- 酒局/简报
- 状态
- 选中节点数
- 生成耗时
- 失败原因
- 图片 URL
- 操作：重试、查看简报、查看生成图

### 10.3 榜单奖励配置

`commerce-ranking-rewards` 至少支持：

- 分类：今日最有梗、今日最欠酒、今日最精彩、今日最有画面、最佳开场、最佳收尾。
- 启用开关。
- 阶梯：起始名次、结束名次、奖励积分。
- 生效时间。
- 修改原因。

配置保存必须写后台操作日志。

## 11. 验收与测试

### 11.1 每次改动必须执行

| 改动类型 | 最小验证 |
| --- | --- |
| 文档 | `node scripts/check-encoding.js` |
| 后端 JS | `node --check backend/server.js`，涉及新文件也逐个 `node --check` |
| 小程序 TS | `npm.cmd run typecheck` |
| 接口 | 本地 `backend` 启动后跑 smoke 脚本或 curl 清单 |
| 数据库 | DDL 可重复执行，`npm run mysql:test` 不报错 |
| 后台页 | 登录后可打开 slug，保存/操作返回成功，日志可查 |
| 分享图 | 生成任务覆盖 ready、failed、retry 三种状态 |

### 11.2 MVP 验收用例

| 用例 | 步骤 | 通过标准 |
| --- | --- | --- |
| 开场打卡 | 创建酒局，成员进入等待室，上传开场照 | 每人最多 1 张，可替换，时间线出现 opening |
| 全员瞬间 | 非判官成员进入进行中酒局，上传图片和文案 | 时间线出现 highlight，上传者正确 |
| 私密爆料 | A 指定 B 可见，C 刷新时间线 | B 看正文和图，C 只看占位 |
| 辅助事件 | 判官给成员加欠酒，进入转盘 | 时间线出现 drinking/event 节点 |
| 未补图 | 创建无图瞬间后结束酒局 | 可结束，但该节点不可公开分享/上榜/打赏 |
| 收尾照 | 结束页上传收尾照 | 简报底部出现 closing |
| 分享图任务 | 点击生成分享图后离开页面 | 个人页显示生成中，ready 后可查看 |
| 后台二审 | 管理员要求重传某瞬间 | 前台该瞬间不可上榜，显示需补图/重传 |

## 12. 项目经理进度审核机制

### 12.1 开发提交要求

每次开发完成后，开发人员必须提供：

- 任务编号：例如 `DEV-M1-03`。
- 改动文件清单。
- 接口变更说明。
- 数据结构变更说明。
- 已执行验证命令和结果。
- 未验证事项和原因。
- 是否影响 `api.pomer.cn` 线上部署。

缺少任务编号或验证结果的改动，不进入“已完成”。

### 12.2 PM 审核动作

项目经理每次审核必须做：

1. 对照本文第 5 节确认任务编号是否属于当前里程碑。
2. 用 `git diff --stat` 和具体文件 diff 核对改动范围。
3. 查接口文档、前端服务层、后端路由、后台 slug、数据库 DDL 是否同步。
4. 运行或复核第 11.1 节对应验证命令。
5. 按第 12.3 节更新进度台账。
6. 给出结论：`通过`、`退回`、`有条件通过`。

### 12.3 进度台账

| 任务编号 | 状态 | 负责人 | 审核结论 | 证据 | 备注 |
| --- | --- | --- | --- | --- | --- |
| DEV-M0-01 | 已完成首轮实现 | 后端 | 有条件通过，待 PM/DBA 复核 | `backend/sql/mysql-normalized-schema.sql` 已新增 moments 相关表；本机 MySQL 3306 拒绝连接 | 新增 DDL 与数据结构 |
| DEV-M0-02 | 已完成首轮实现 | 后端 | 有条件通过，待 PM/测试复核 | `backend/data/moments.js` 已新增；`node --check` 与 M0 smoke 通过 | moments 数据层 |
| DEV-M0-03 | 已完成首轮实现 | 后端 | 有条件通过，待前端/测试复核 | `docs/api-spec.md` 已新增精彩瞬间时间线接口合同 | API 文档同步 |
| DEV-M0-04 | 已完成首轮实现 | 前端 | 有条件通过，待前端复核 | `miniprogram/services/operations.ts` 已新增 moments 类型与 API 方法；`npm.cmd run typecheck` 通过 | services 类型与方法 |
| DEV-M0-05 | 已完成首轮实现 | 后端 | 有条件通过，待测试复核 | `backend/scripts/smoke-moments-flow.js` 已新增；本地 smoke 通过 | smoke 脚本 |
| DEV-M1-01 | 前端入口已接，待真机联调 | 前端/后端 | 有条件待审核 | `waiting-room` 已新增开局签到入口并跳转 `moment-editor?nodeType=opening` | 开场打卡 |
| DEV-M1-02 | 前端入口已接，待真机联调 | 前端/后端 | 有条件待审核 | `live-record` 已新增“记精彩瞬间”入口，辅助事件降为次级区域 | 进行中页主入口 |
| DEV-M1-03 | 页面基础已补，待真机联调 | 前端/后端 | 有条件待审核 | `miniprogram/pages/moment-editor` 已支持上传、说明、节点类型、可见范围、授权和 `clientDraftId` | 瞬间编辑页 |
| DEV-M1-04 | 权限与成员选择已补代码，待三用户联调 | 前端/后端/测试 | 待联调 | 后端校验 `visibleProfileIds` 必须为本局成员；前端可选择本局成员；公网非本局成员返回 400 | 私密爆料 |
| DEV-M1-05 | 组件/API 读取已接，待页面联调 | 前端/后端 | 有条件待审核 | `moment-timeline`、`moment-card` 已出现，`live-record` 调用 timeline 接口 | 时间线展示 |
| DEV-M1-06 | 前端基础已接，待页面联调 | 前端/后端 | 有条件待审核 | `session-return-bar`、`session-return.ts` 已出现，首页/判官入口/历史页已接返回条 | 当前酒局快捷返回 |
| DEV-M2-01 | 未开始 | 前端 | 待审核 | - | 收尾照 |
| DEV-M2-02 | 接口已预置，页面未开始 | 后端/前端 | 待联调 | `POST /sessions/:sessionId/brief`、`GET /session-briefs/:briefId` 已存在；公网已生成 brief；未发现 `pages/session-brief` | sessionBrief |
| DEV-M2-03 | 基础状态已预置，规则待复核 | 后端/API | 待联调 | 已有 `completionStatus`、`rankingEligible`、`rewardEligible` 字段；缺完整资格用例 | 未补全规则 |
| DEV-M2-04 | 接口已预置，页面入口待联调 | 前端/后端 | 待联调 | `GET /user/session-moment-summaries` 与前端 service 已存在；页面待补图入口仍需实测 | 待补图入口 |
| DEV-M2-05 | 未开始 | 前端 | 待审核 | - | 旧战报兼容 |
| DEV-M3-01 | 状态机已部署，待页面联调 | 后端/API | 有条件待审核 | `shareImageTasks` 支持 `pending/processing/ready/failed/expired`；公网 process/ready 已通过 | 分享图任务结构 |
| DEV-M3-02 | 创建任务接口已部署复测 | 后端/API | 有条件待审核 | 线上已生成 `share-task-1781465622362-b11e8289` | 创建任务接口 |
| DEV-M3-03 | 处理器已部署，待前端/后台联调 | 后端/API | 有条件待审核 | `POST /share-image-tasks/:taskId/process` 公网返回 ready；pending retry 返回 409 | 任务执行与重试 |
| DEV-M3-04 | 三类前端页面状态已接，待真机联调 | 前端 | 有条件待审核 | `components/share-task-status` 已出现；个人页/历史页消费 user summaries；`share-poster` 已接任务查询、创建、ready 预览/保存和 failed/expired retry | 全状态真实样本 |
| DEV-M3-05 | PNG 渲染已部署，待视觉验收 | 后端/API | 有条件待审核 | 公网分享图 GET 返回 200 `image/png`，仍缺视觉和前端预览/保存 | 时间线分享图排版 |
| DEV-M4-01 | 页面操作已接，本地 E2E 已补，待线上写操作 | 后台/后端 | 有条件待审核 | `content-moments-review` slug、列表和动作接口已出现；本地浏览器 E2E 已验证审核通过 | 瞬间审核 |
| DEV-M4-02 | 页面操作已接，待真实举报样本 | 后台/后端 | 有条件待审核 | `content-moment-reports` slug 和举报动作接口已出现 | 举报处理 |
| DEV-M4-03 | 页面操作已接，待 failed/expired 样本 | 后台/后端 | 有条件待审核 | `growth-share-tasks` slug 和后台 retry 入口已出现 | 分享任务监控 |
| DEV-M4-04 | 配置壳已完成，待 M5 生效联调 | 后台/后端 | 有条件待审核 | `commerce-ranking-rewards` 已出现，支持奖励规则配置壳层 | 奖励配置 |
| DEV-M4-05 | 已启动，待操作日志页面级复测 | 后台/后端 | 待审核 | 后台动作会写 operationLogs，仍缺页面追溯验收 | 操作日志 |
| DEV-M5-01 | 后端接口、前端服务层和页面首轮已补 | 前端/后端 | 有条件待审核 | `GET /rankings/today` 本地和 HTTP smoke 已覆盖；`miniprogram/pages/rankings` 已新增 | 今日榜单 |
| DEV-M5-02 | 后端接口已补 | 后端 | 有条件待审核 | `POST /moments/:momentId/nominations` 覆盖局成员推举和重复推举 409 | 推举接口 |
| DEV-M5-03 | 后端资格函数已补 | 后端 | 有条件待审核 | 后端要求 `complete + ranking consent + approved + secondary approved + rankingEligible` | 推举资格 |
| DEV-M5-04 | 后端扣积分和移出榜单退款已补 | 后端 | 有条件待审核 | 推举写 `moment-nomination`，退款写 `moment-nomination-refund` | 积分扣退 |
| DEV-M5-05 | 后端发奖 action 和后台 page action 已补 | 后端/后台 | 有条件待审核 | `POST /admin/ranking-rewards/grant` 写 `ranking-reward` 和 `rankingRewardPayouts`；`commerce-ranking-rewards` 暴露发奖按钮元数据 | 榜单奖励发放 |

### 12.4 审核结论标准

| 结论 | 标准 |
| --- | --- |
| 通过 | 任务功能完成，文档同步，验证通过，无阻断风险 |
| 有条件通过 | 主链路可用，但存在不阻断 MVP 的小缺口，必须记录补项 |
| 退回 | 任务编号不匹配、关键验收失败、权限/隐私/积分风险、破坏既有链路、缺少验证 |

## 13. 实施顺序硬约束

1. 先做 M0，再做 M1。没有接口和数据层，不允许先堆前端假页面。
2. 私密爆料必须和权限过滤同批完成，不允许先展示真实内容再补权限。
3. 分享图任务必须有失败态和重试态，不允许只有 happy path。
4. 涉及积分扣减、退回、奖励的 M5 功能必须等后台流水和奖励配置完成后再开放。
5. 任何线上操作前必须确认目标是 `api.pomer.cn` 和 `jiuzhuopanguan-backend`，不得影响 `pomer` 服务。
6. 遇到需要其他角色协作的任务时，必须先通读本迭代所有相关文档和台账，确认协作项已有代码、接口、文档和验证证据；不能只看当前角色计划或口头状态就继续推进。
7. 如果协作项只有计划、没有实现或验证证据，当前任务必须标记为“阻塞 / 待联调 / 只能做壳层”，不得伪造数据、假接接口或标记完成。
8. 各成员只维护自己的进度节点；总进度、跨角色结论和里程碑状态必须交由项目经理/Codex PM 验证后汇总，避免多人重复修改同一文件。

## 14. 当前结论

截至 2026-06-15，研发执行文档已创建，M0 合同与数据底座已完成本地 smoke、HTTP smoke、线上 MySQL 与公网写入联调；M1 前端代码证据、M2 简报页代码证据、M3 分享图处理器、M4 后台接口层和 M5 榜单/推举/退款/发奖接口层及 `rankings` 页面首轮代码证据已出现，并已部署过 `api.pomer.cn` 对应 `jiuzhuopanguan-backend` 供真实联调；UGC 风控口径已确认，UI/UX 版本升级计划已创建。当前不能把 MVP 标记完成：仍缺小程序真机、三用户私密权限、线上后台写操作、分享图视觉验收、UI/UX 设计 QA、UGC-QA 反例执行、M5 固定榜单数据联调和线上写入验收。本机 MySQL 连接失败仍只代表本机环境阻塞；线上 `app_store` 检查已通过，但 DDL 实体表还需 DBA/运维单独复核。
