# 酒桌判官精彩瞬间时间线后端开发计划

更新时间：2026-06-15

依据文档：

- `docs/gameplay-moments-development-spec.md`
- `docs/archive/gameplay-auction-moments-operation-plan.md`
- `docs/gameplay-moments-frontend-development-plan.md`

## 1. 后端职责边界

本计划只覆盖酒桌判官后端、API、数据层、数据库 DDL、后台动作接口和后端 smoke 验证。线上验证目标只能是 `api.pomer.cn`；不得改动、重启、部署或代理 `pomer.cn` 公司官网服务。

后端目标：

- 把酒局主流程的数据底座从旧战报扩展为 `moment + event + timeline + brief + share task`。
- 保留创建酒局、加入酒局、更新酒局、旧战报、积分中心、会员开关、后台登录、动态后台页等既有链路。
- 所有 UGC、私密爆料、分享图、榜单、积分推举都以后端权限和状态计算为准，前端只做展示和交互。
- 先实现 JSON store 兼容，再补 MySQL 实体表 DDL 和同步映射，避免一次性数据库迁移阻塞 MVP。
- 分享图任务先用进程内队列落地，接口状态机必须稳定，后续可替换为 Redis、BullMQ、云函数或独立 worker。

不属于 MVP 后端交付：

- 视频上传和视频转码。
- 拍卖、反转事件、自由公开广场。
- 判官精选特权。
- 复杂图片编辑器。
- 真实支付、现金打赏。

## 2. 当前后端承载点

| 类型 | 当前文件 | 处理方式 |
| --- | --- | --- |
| 路由入口 | `backend/server.js` | 继续保持薄路由，新增 moments 路由只做鉴权、参数解析和响应 |
| JSON/MySQL 兼容 store | `backend/data/store-accessor.js` | 新增 moments store，沿 `createStoreAccessor` 同步文件与 `app_store` |
| 酒局与战报 | `backend/data/admin.js` | 复用 `liveSessions`、`reports`、成员/判官判断；必要时抽出 session helper |
| 用户身份 | `backend/data/social.js` | 复用小程序用户会话和 profile |
| 积分流水 | `backend/data/commerce.js` | M5 接推举扣减、退款、奖励发放 |
| 图片上传 | `backend/data/assets.js` | 可复用压缩/manifest 思路，但 moments 上传应独立 category 与大小限制 |
| 后台动态页 | `backend/data/admin.js` + `backend/public/admin/static/heatwave-ops` | 新增审核/举报/任务/奖励配置 slug 和必要动作接口 |
| MySQL DDL | `backend/sql/mysql-normalized-schema.sql` | 新增 moments 相关实体表 |
| 同步脚本 | `backend/data/normalized-db.js` | 新增 moments store 到 normalized table 的 map |
| 接口文档 | `docs/api-spec.md` | M0 必须同步新增接口合同 |
| 验证脚本 | `backend/scripts/smoke-judge-flow.js` | 新增 `backend/scripts/smoke-moments-flow.js` |

## 3. 后端任务摘选

协作前置检查：

- 遇到依赖前端、后台、测试、风控或 PM 的任务时，必须先查看总控文档、前端计划、后台计划和进度台账，确认协作项是否已有实现和验证证据。
- 如果协作项未完成，后端可以先交接口合同、数据结构、壳层或 smoke 样本，但必须在交付记录中标记待联调项，不得把依赖前端/后台验证的任务标记完成。
- 需要前端消费或后台操作的字段，必须同步写入 `docs/api-spec.md` 或对应计划文档，不能只写在代码里。
- 后端成员只能修改后端计划中的本人节点、交付记录和证据说明；不得直接修改总进度、前端/后台/测试节点或 PM 审核结论。
- 需要跨角色协作时，后端节点只能标记“待联调 / 阻塞 / 待复核”，并写明依赖的任务编号、角色和缺少证据；总进度由项目经理/Codex PM 验证后统一汇总。

### M0 合同与数据底座

| 任务编号 | 后端工作 | 输出 | 协作对象 |
| --- | --- | --- | --- |
| `DEV-M0-01` | 新增 MySQL DDL 草案：`moment_records`、`session_events`、`session_briefs`、`share_image_tasks`、`moment_reports`、`moment_nominations`、`ranking_reward_rules` | `backend/sql/mysql-normalized-schema.sql` 变更，可重复执行 | DBA/测试/后台 |
| `DEV-M0-02` | 新增 `backend/data/moments.js`，实现 moments store、归一化、权限过滤、timeline 聚合、brief 草案、share task 状态结构 | 数据层 API 和 JSON store | 前端/后台 |
| `DEV-M0-03` | 更新 `docs/api-spec.md`，补齐 moments、timeline、brief、share task、admin review、uploads 接口 | API 合同 | 前端/测试 |
| `DEV-M0-05` | 新增 `backend/scripts/smoke-moments-flow.js`，覆盖创建开场、普通、私密、辅助事件、timeline 读取 | 可复用 smoke 脚本 | 前端/测试 |

M0 完成标准：

- `node --check backend/server.js backend/data/moments.js backend/scripts/smoke-moments-flow.js` 通过。
- `npm.cmd run check:encoding` 通过。
- 本地启动后，smoke 能在同一酒局里写入 `opening`、`highlight`、`private`、`drink_debt`，并按登录用户视角读回 timeline。
- API 文档、DDL、数据层字段命名一致：数据库 snake_case，API camelCase。

### M1 小程序 MVP 时间线

| 任务编号 | 后端工作 | 输出 | 协作对象 |
| --- | --- | --- | --- |
| `DEV-M1-01` | 支持每人每局 1 张 `opening`，同一上传者重复提交时更新或返回原记录 | `POST /sessions/:sessionId/moments`、`PUT /moments/:momentId` | 前端等待室 |
| `DEV-M1-03` | 支持图片、文案、标签、可见范围、用途授权、`clientDraftId` 幂等 | moments 创建/编辑/上传接口 | 前端瞬间编辑页 |
| `DEV-M1-04` | 实现私密爆料权限过滤：接收者看正文和图片，非接收者只看占位 | `GET /sessions/:sessionId/timeline` | 前端时间线 |
| `DEV-M1-05` | 聚合 `moment_records` 和 `session_events`，按 `createdAt` 统一返回 timeline | timeline 节点结构 | 前端组件 |
| `DEV-M1-06` | 个人当前酒局摘要返回待补图/最近节点/快捷返回所需字段 | 可先扩展 `/sessions/live` 或新增 summaries | 前端首页/历史页 |

M1 完成标准：

- 普通成员可以创建精彩瞬间，非成员不能读写。
- 判官权限只影响辅助事件，不影响普通成员上传 moments。
- 私密内容不在 API 响应中泄露正文、图片和完整接收名单。
- `clientDraftId` 和 `clientEventId` 重复提交不会生成重复节点。

### M2 结束页与时间线简报

| 任务编号 | 后端工作 | 输出 | 协作对象 |
| --- | --- | --- | --- |
| `DEV-M2-02` | 生成或刷新 `sessionBrief`，关联 opening、highlight、event、closing 节点 | `POST /sessions/:sessionId/brief`、`GET /session-briefs/:briefId` | 前端简报页 |
| `DEV-M2-03` | 统一计算 `completionStatus`、`rankingEligible`、`rewardEligible`，未补图不可公开分享/上榜/打赏 | 后端状态计算函数 | 前端/后台 |
| `DEV-M2-04` | 用户历史摘要返回待补图数、可补图 moment、brief/share task 状态 | `GET /user/session-moment-summaries` | 前端个人页/历史页 |
| `DEV-M2-05` | 旧 `reports` 保持兼容，新增 brief 与旧 report 的映射或跳转字段 | report/detail/history 扩展字段 | 前端旧战报 |

M2 完成标准：

- 无收尾照、部分瞬间缺图时仍可生成简报草稿。
- 补图后状态能从 `needs_media` 进入 `complete`，但上榜资格仍需授权和审核。
- 旧 `POST /reports`、`GET /reports/:id`、`GET /reports/history` 不被破坏。

### M3 异步分享图

| 任务编号 | 后端工作 | 输出 | 协作对象 |
| --- | --- | --- | --- |
| `DEV-M3-01` | 新增 `shareImageTasks` 状态机：`pending / processing / ready / failed / expired` | 数据结构和状态转换函数 | 前端/后台 |
| `DEV-M3-02` | 创建分享图任务，同一 `briefId + layoutMode` 已存在未终态任务时直接返回原任务 | `POST /session-briefs/:briefId/share-image-tasks` | 前端分享页 |
| `DEV-M3-03` | 进程内任务处理，支持失败原因、重试次数、重试接口 | `GET /share-image-tasks/:taskId`、`POST /share-image-tasks/:taskId/retry`、`POST /share-image-tasks/:taskId/process` | 前端/后台 |
| `DEV-M3-05` | 用 `sharp` 生成时间线分享图，服务端筛选当前用户可见节点，私密占位不进图 | `/uploads/moments/share-tasks/*` 图片 URL | 前端/运营 |

M3 完成标准：

- 用户创建任务后可离开页面，任务状态可轮询。
- ready、failed、retry 三种状态都能通过 smoke 覆盖。
- 分享图内容按后端可见性、授权、补全、审核状态过滤，不由前端决定。

### M4 后台审核与运营配置

| 任务编号 | 后端工作 | 输出 | 协作对象 |
| --- | --- | --- | --- |
| `DEV-M4-01` | 新增审核页数据和动作接口：通过、隐藏、要求重传、移出榜单候选 | `content-moments-review`、`POST /admin/moments/:momentId/review` | 后台前端/运营 |
| `DEV-M4-02` | 新增举报记录、举报处理、下架状态 | `content-moment-reports`、举报动作接口 | 后台/测试 |
| `DEV-M4-03` | 新增分享图任务监控、重试、失败原因查看 | `growth-share-tasks`、后台 retry 接口 | 后台 |
| `DEV-M4-04` | 新增榜单积分阶梯奖励配置，保存后可供 M5 使用 | `commerce-ranking-rewards` | 商业化运营 |
| `DEV-M4-05` | 所有后台动作写入 `admin_operation_logs`，至少含操作者、动作、目标、理由、时间 | 操作日志 | PM/测试 |

M4 完成标准：

- 管理员可改变 moment 审核/二审/重传状态，前台 timeline 和 brief 立即受影响。
- 配置保存和强审计动作都能在 `system-operation-logs` 或实体表中追溯。
- 后台批量保存不能替代审核动作接口；需要理由和操作者的场景必须走 action endpoint。

### M5 第二阶段榜单与局外推举

| 任务编号 | 后端工作 | 输出 | 协作对象 |
| --- | --- | --- | --- |
| `DEV-M5-01` | 今日榜单查询，支持多个 category，按推举/互动/时间排序 | `GET /rankings/today?category=...` | 前端榜单页 |
| `DEV-M5-02` | 只有参与过该局的用户可推举该局 moment | `POST /moments/:momentId/nominations` | 前端/测试 |
| `DEV-M5-03` | 推举资格以后端计算为准：`complete + consent + approved + rankingEligible` | eligibility 函数 | 前端 |
| `DEV-M5-04` | 推举扣积分、失败退款、下架退款写入 `points_ledger` | commerce 扩展 | 商业化/测试 |
| `DEV-M5-05` | 按后台阶梯配置发放榜单奖励，奖励流水可追溯 | reward job 或 admin action | 后台/运营 |

当前首轮实现说明：

- 已实现 `GET /rankings/today`、`GET /moments/:momentId/nomination-eligibility`、`POST /moments/:momentId/nominations`。
- 已覆盖参与局成员校验、资格校验、每天同一用户同一 moment/category 1 次限制、固定 10 积分扣减和 `pointsLedger` 流水。
- 已实现后台 `hide`、`reject`、`require_resubmit`、`remove_ranking` 后的推举退款，写入 `pointsLedger(kind=moment-nomination-refund)`。
- 已实现 `POST /admin/ranking-rewards/grant`，读取 `commerce-ranking-rewards` 阶梯配置发放榜单积分，并写入 `pointsLedger(kind=ranking-reward)` 与 `rankingRewardPayouts`。
- 已在 `commerce-ranking-rewards` 页面返回发奖 `pageActions`，静态后台会渲染并调用后台发奖接口。
- 尚未完成前端 `rankings` 页面、线上后台发奖点击、线上 M5 写入验收和完整风控反例。

M5 完成标准：

- 同一用户每日对同一瞬间有次数限制。
- 扣减、退款、奖励都可在积分流水查到。
- 私密、未授权、待补图、未二审通过、隐藏内容不能被推举或奖励。

## 4. 数据层设计

新增 `backend/data/moments.js`，职责分层如下：

| 分层 | 函数方向 | 说明 |
| --- | --- | --- |
| store | `readMomentsStore`、`writeMomentsStore`、`normalizeMomentsStore` | 使用 `createStoreAccessor`，key 建议为 `moments_store` |
| session helper | `getSessionOrThrow`、`assertSessionMember`、`assertSessionHost` | 可先在 moments 模块内部实现，后续再从 `admin.js` 抽公共 helper |
| moment CRUD | `createMoment`、`updateMoment`、`deleteMoment`、`uploadMomentImage` | 处理幂等、状态计算、上传资源 |
| event CRUD | `createSessionEvent` | 只允许判官写辅助事件，必须校验 `clientEventId` |
| timeline | `getSessionTimeline`、`buildTimelineNode`、`filterTimelineForViewer` | 私密爆料过滤在这里完成 |
| brief | `createOrRefreshSessionBrief`、`getSessionBrief` | 生成时间线简报和完整性状态 |
| share task | `createShareImageTask`、`getShareImageTask`、`retryShareImageTask`、`processShareImageQueue` | 状态机和进程内队列 |
| admin | `reviewMoment`、`requireMomentResubmit`、`hideMoment`、`listMomentReports` | 后台审核和举报 |
| rankings | 后续可抽 `backend/data/rankings.js` | M5 榜单、推举、奖励 |

JSON store 建议结构：

```json
{
  "momentRecords": [],
  "sessionEvents": [],
  "sessionBriefs": [],
  "shareImageTasks": [],
  "momentReports": [],
  "momentNominations": [],
  "rankingRewardRules": []
}
```

## 5. API 实施清单

### 小程序 API

| 方法 | 路径 | 后端处理 |
| --- | --- | --- |
| `POST` | `/api/v1/moments/uploads/image` | 图片 dataUrl 上传，限制 5 MB，允许 JPEG/PNG/WebP，返回 `/uploads/moments/*` |
| `POST` | `/api/v1/sessions/:sessionId/moments` | 创建 opening/highlight/private/closing |
| `PUT` | `/api/v1/moments/:momentId` | 本人编辑、补图、授权更新 |
| `DELETE` | `/api/v1/moments/:momentId` | 未公开前可删除，公开后改撤回/隐藏 |
| `GET` | `/api/v1/sessions/:sessionId/timeline` | 按当前登录用户过滤 timeline |
| `POST` | `/api/v1/sessions/:sessionId/events` | 判官写辅助事件，支持 `drink_debt/drink_add/wheel_result` |
| `POST` | `/api/v1/sessions/:sessionId/brief` | 生成或刷新 brief |
| `GET` | `/api/v1/session-briefs/:briefId` | 读取 brief |
| `POST` | `/api/v1/session-briefs/:briefId/share-image-tasks` | 创建分享图任务 |
| `GET` | `/api/v1/share-image-tasks/:taskId` | 查询任务 |
| `POST` | `/api/v1/share-image-tasks/:taskId/retry` | 重试失败任务 |
| `POST` | `/api/v1/share-image-tasks/:taskId/process` | 本地处理分享图任务，生成 ready PNG 或 failed 状态 |
| `GET` | `/api/v1/user/session-moment-summaries` | 个人页/历史页摘要 |
| `GET` | `/api/v1/rankings/today?category=...` | M5 今日榜单 |
| `POST` | `/api/v1/moments/:momentId/nominations` | M5 积分推举 |

### 后台 API

| 方法 | 路径 | 后端处理 |
| --- | --- | --- |
| `GET` | `/api/v1/admin/pages/content-moments-review` | 瞬间审核动态页数据 |
| `GET` | `/api/v1/admin/pages/content-moment-reports` | 举报处理动态页数据 |
| `GET` | `/api/v1/admin/pages/growth-share-tasks` | 分享图任务监控动态页数据 |
| `GET/PUT` | `/api/v1/admin/pages/commerce-ranking-rewards` | 榜单奖励配置 |
| `POST` | `/api/v1/admin/moments/:momentId/review` | 审核、二审、隐藏、移出榜单候选 |
| `POST` | `/api/v1/admin/moments/:momentId/require-resubmit` | 要求重传 |
| `POST` | `/api/v1/admin/share-image-tasks/:taskId/retry` | 后台重试分享图任务 |

## 6. 权限与状态规则

后端必须执行：

- 所有小程序写接口都需要用户登录。
- timeline、brief、share task 查询必须校验用户是本局成员；非成员返回 `403`。
- 创建普通精彩瞬间不需要判官权限；辅助事件和结束酒局仍需要判官权限。
- 编辑 moment 只允许上传者本人；管理员不能通过小程序接口改正文，只能通过后台审核接口改审核状态。
- 私密爆料只向上传者和指定接收者返回正文、图片、接收者列表；其他成员只返回占位文案。
- `rankingEligible`、`rewardEligible` 由后端根据补全、授权、审核、私密状态计算，不信任前端入参。
- 未补图、未授权、待二审、隐藏、要求重传内容不可进入公开分享图、榜单、积分奖励。
- 分享图任务筛选节点时必须再次执行可见性过滤。

## 7. 后台协作

后端先提供动态页数据 schema 和动作接口，后台开发再做页面壳层。字段最少如下：

| slug | 后端字段重点 |
| --- | --- |
| `content-moments-review` | 缩略图、文案、标签、酒局、上传者、节点类型、可见范围、授权、补全状态、审核状态、二审状态、举报数、操作 |
| `content-moment-reports` | 举报人、被举报 moment、理由、处理状态、处理人、处理时间、处理说明 |
| `growth-share-tasks` | taskId、brief、session、状态、节点数、耗时、失败原因、imageUrl、重试次数 |
| `commerce-ranking-rewards` | category、enabled、tiers、effectiveAt、reason、updatedAt |

强审计规则：

- 后台审核、隐藏、要求重传、任务重试、奖励配置保存必须写 `admin_operation_logs`。
- 操作日志 detail 至少包含 `reason`、旧状态、新状态、目标 ID。
- 批量保存页面数据不能绕过强审计动作。

## 8. 可重构边界

允许重构：

- 从 `backend/data/admin.js` 抽出 session helper，例如 `isSessionMember`、`isSessionHost`、`getSessionHost`，供 moments 复用。
- 将 `server.js` 中 moments 相关路由解析封装成局部 handler，保持主入口可读。
- 将图片上传公共逻辑从 `assets.js` 抽成可复用函数，但不要破坏后台现有上传路径。
- 将分享图 PNG 生成拆到 `backend/data/share-image-renderer.js`，避免 `moments.js` 过大。
- M5 榜单和推举逻辑可独立为 `backend/data/rankings.js`，避免污染 moments 核心 CRUD。

不允许重构：

- 不改变现有 `/api/v1/reports/*` 响应结构的关键字段。
- 不改变后台登录 Cookie 和 `/admin/pages/:slug` 动态页协议。
- 不把 `api.pomer.cn` 和 `pomer.cn` 的部署/路由混在一起。
- 不在 M0-M3 中引入必须依赖新基础设施的任务队列或对象存储。

## 9. 联调顺序

1. 后端完成 M0 数据层、DDL、API 文档和 smoke。
2. 前端完成 `operations.ts` 类型和最小调用，双方对齐字段缺口。
3. 后端补 M1 权限过滤和 timeline 聚合，前端接 moment-editor 与 timeline。
4. 后端补 M2 brief 与 summaries，前端接简报、历史、个人页。
5. 后端补 M3 share task 状态机和 PNG 生成，前端接任务状态。
6. 后端/后台补 M4 审核、举报、分享任务监控、奖励配置。
7. M5 等 M4 审计和积分规则稳定后再开放推举、榜单和奖励发放。

## 10. 验证要求

每次后端改动至少执行：

```powershell
pwsh -NoLogo -NoProfile -Command "$PSVersionTable.PSVersion.ToString()"
npm.cmd run check:encoding
node --check backend/server.js
node --check backend/data/moments.js
node --check backend/scripts/smoke-moments-flow.js
```

涉及 MySQL DDL 或归一化同步时追加：

```powershell
npm.cmd --prefix backend run mysql:test
npm.cmd --prefix backend run db:sync-normalized
```

涉及接口时追加：

```powershell
node backend/scripts/smoke-moments-flow.js
```

涉及文档时至少执行：

```powershell
npm.cmd run check:encoding
```

## 11. 第一轮建议排期

| 顺序 | 任务 | 后端输出 | 阻塞/依赖 |
| --- | --- | --- | --- |
| 1 | `DEV-M0-01` | DDL 与 JSON store 字段定稿 | 无 |
| 2 | `DEV-M0-02` | `backend/data/moments.js` 基础 CRUD、权限 helper、timeline 聚合 | 需确认 session member 字段 |
| 3 | `DEV-M0-03` | `docs/api-spec.md` moments 接口合同 | 前端复核字段 |
| 4 | `DEV-M0-05` | `smoke-moments-flow.js` | API 初版可跑 |
| 5 | `DEV-M1-04` / `DEV-M1-05` | 私密过滤 + timeline | 前端 timeline 组件 |
| 6 | `DEV-M2-02` / `DEV-M2-03` | brief + 状态计算 | 旧 report 兼容确认 |
| 7 | `DEV-M3-01` / `DEV-M3-03` | share task 状态机 + retry | 前端状态展示 |
| 8 | `DEV-M4-01` / `DEV-M4-05` | 审核动作 + 操作日志 | 后台页面壳 |
| 9 | `DEV-M4-04` | 奖励配置 | M5 前置 |
| 10 | `DEV-M5-02` / `DEV-M5-04` | 推举 + 积分流水 | M4 审计完成 |

## 12. 后端交付记录格式

每个后端任务完成后，提交说明必须包含：

- 任务编号：例如 `DEV-M0-02`。
- 改动文件清单。
- 新增或变更接口。
- 数据结构和 DDL 变更。
- 权限、隐私、幂等、状态计算说明。
- 与前端/后台的联调字段。
- 已执行验证命令和结果。
- 未验证事项和原因。
- 是否涉及 `api.pomer.cn` 线上部署。

## 13. 当前后端结论

截至 2026-06-15，后端/API 已具备以下可采信证据：

- `DEV-M0-01` 至 `DEV-M0-05`：DDL 草案、moments 数据层、API 合同、前端 services 合同和 smoke 脚本已出现；本地语法、编码、类型、数据层 smoke、HTTP smoke 通过；线上 `npm run mysql:test` 对 `app_store` 返回 `ok:true`。
- `DEV-M1-03` 至 `DEV-M1-05`：moments 上传、创建、timeline、私密 `visibleProfileIds` 本局成员校验、非本局成员 400 已通过公网写入联调。
- `DEV-M3-01` 至 `DEV-M3-05`：share task 状态机、创建任务、retry 限制、同步 `process`、ready PNG 生成已部署到 `api.pomer.cn`，公网 `process` 返回 ready，GET 图片返回 200 `image/png`。
- `DEV-M4-01` 至 `DEV-M4-05`：后台 slug、动作接口、operationLogs、本地 HTTP smoke 和本地浏览器页面点击 E2E 证据已出现；UGC 风控口径已确认；仍缺线上后台写操作窗口、真实举报/失败任务样本、前台状态同步和风控签字复核。
- `DEV-M5-01` 至 `DEV-M5-05`：今日榜单、推举资格、推举扣分、后台下架退款、榜单奖励发放 action 和后台 pageActions 已有本地/HTTP smoke 证据；仍缺前端 `rankings` 页面、线上 M5 写入、奖励失败/重复发放页面验收和完整风控反例。

后端仍不得标记全量完成的原因：

- 本机 MySQL 仍为环境阻塞，DDL 实体表需要 DBA/运维在可用数据库环境单独复核。
- M2 简报页、待补图闭环、旧战报映射已有页面基础证据，但仍缺固定酒局真机页面联调。
- M5 前端 `rankings` 页面、线上 M5 写入、失败/重复发放、风控反例和奖励流水后台复核仍未完成。
- 服务器本机 `smoke:moments-http` 在独立 3220 进程因测试账号鉴权返回 401，需接口联调负责人调整脚本账号策略；公网真实接口联调已通过。

## 14. 第二轮协作 / 待联调记录（后端/API）

记录时间：2026-06-15

本轮只做后端/API 文档核查和待联调记录，不改业务源码、不部署、不修改 PM 总台账、前端、后台、测试、风控或 UI/UX 计划。

已核查文档：

- `docs/gameplay-moments-backend-development-plan.md`
- `docs/gameplay-moments-interface-integration-test-plan.md`
- `docs/api-spec.md`
- `docs/database-baseline.md`
- `docs/database-normalization-plan.md`
- `docs/database-upgrade-api-separation-plan.md`
- `DEPLOY.md`

### 14.1 固定三用户联调数据包

当前已有脚本：

| 命令 | 前置环境 | 会写哪些数据 | 清理方式 | 是否可作为固定共享数据包 |
| --- | --- | --- | --- | --- |
| `npm.cmd --prefix backend run smoke:moments-http` | 本地 Node 后端可启动；脚本自启 `backend/server.js`，默认 `SMOKE_PORT=3220`；使用本地 JSON store 和测试登录态 | 临时 host、member A、member B、outsider；临时酒局；opening、highlight、private、event、brief、ready/failed share task、nomination、ranking、reward、refund；上传 smoke 图片 | `finally` 中按 `sessionId`、profileId、targetIds、uploadedUrls 清理 store 和图片 | 否。ID 使用时间戳，脚本结束自动清理，不保留固定 sessionId/token |
| `npm.cmd --prefix backend run smoke:admin-moments` | 本地 Node 后端可启动；后台默认测试账号可登录 | 临时后台审核、举报、failed task retry、奖励配置、operationLogs 样本 | 执行后恢复 admin/moments store | 否。用于本地后台动作 smoke，不提供共享测试酒局 |
| `npm.cmd --prefix backend run smoke:ugc-risk` | 本地数据层环境 | 私密占位、分享图过滤、推举拒绝、退款等风险反例样本 | 执行后清理风险样本 | 否。用于风控反例 smoke，不提供线上固定 ID |

后端/API 结论：当前没有可复用、可登记、可清理的“固定三用户联调数据包”生成脚本或线上接口。现有脚本只能作为 smoke 证据，不能给前端、后台、测试、UGC、UI/UX 共用。

后端需补的待联调项（依赖 PM 派工后再实现）：

- `DEV-M0-05 / INT-DATA-001`：新增固定数据准备脚本，例如 `backend/scripts/prepare-moments-integration-fixture.js`，支持 `--mode create|cleanup --prefix IT-MOMENTS-YYYYMMDD --keep --manifest <file>`。
- 脚本必须输出 manifest：host/memberA/memberB/outsider 的 profileId/token、sessionId、opening/highlight/private/event/brief/shareTask/review/report/nomination/payout 的实际 ID、创建时间、清理命令。
- 线上写入必须只面向 `api.pomer.cn`，且先由 PM/运维提供写操作窗口、测试账号/token 获取方式、后台账号和清理授权。
- 清理只能按 manifest 和 `it-` / `IT-MOMENTS-` 前缀清理，不得扫描删除真实业务数据；积分、推举、奖励样本清理前需导出 `pointsLedger`、`momentNominations`、`rankingRewardPayouts` 证据。

### 14.2 DDL 字段覆盖复核

`backend/sql/mysql-normalized-schema.sql` 已包含 8 张 moments 实体表，字段与 `backend/data/moments.js` 主要 store 结构可映射：

| 数据层 / 动作 | DDL 表 | 覆盖字段 | 风险 |
| --- | --- | --- | --- |
| `momentRecords`，M1/M2/M4/M5 moment 状态 | `moment_records` | `client_draft_id`、`session_id`、`uploader_profile_id`、`uploader_name`、`node_type`、`media_type`、`image_url`、`video_url`、`cover_image_url`、`duration`、`caption`、`tags_json`、`visibility`、`visible_profile_ids_json`、`timeline_title`、`is_timeline_placeholder`、`usage_consent_json`、`completion_status`、`review_status`、`secondary_review_status`、`ranking_eligible`、`reward_eligible`、`removed_at`、`created_at`、`updated_at` | 字段覆盖完整；但 `uploader_avatar_url` 在 DDL 中存在、当前 normalize 未写，后续同步映射需明确来源 |
| `sessionEvents`，M1 timeline event | `session_events` | `client_event_id`、`session_id`、`event_type`、`operator_profile_id`、`operator_name`、`target_profile_id`、`target_name`、`score_delta`、`caption`、`sync_status`、`created_at`、`updated_at` | 字段覆盖完整；需 DBA 验证唯一键 `session_id + operator_profile_id + client_event_id` 对空 `client_event_id` 的表现 |
| `sessionBriefs`，M2 brief | `session_briefs` | `session_id`、`title`、`cover_mode`、`opening_moment_ids_json`、`closing_moment_ids_json`、`timeline_node_ids_json`、`share_image_task_id`、`share_image_status`、`incomplete_moment_count`、`ranking_eligible`、`created_at`、`updated_at` | 数据层字段名为 `pendingMediaCount`，DDL 字段为 `incomplete_moment_count`；语义可映射，但同步脚本必须显式转换 |
| `shareImageTasks`，M3/M4 retry | `share_image_tasks` | `session_id`、`brief_id`、`status`、`layout_mode`、`selected_node_ids_json`、`image_url`、`failure_reason`、`retry_count`、`created_at`、`started_at`、`finished_at`、`updated_at` | 数据层字段名为 `failedReason`，DDL 字段为 `failure_reason`；语义可映射，但同步脚本必须显式转换 |
| M4 举报处理 | `moment_reports` | `moment_id`、`session_id`、`reporter_profile_id`、`reason`、`description`、`status`、`handled_by`、`handled_at`、`created_at` | 当前 `normalizeStore` 未标准化 `momentReports`；后续实体同步前需先固定 report 对象字段 |
| M5 推举与退款 | `moment_nominations` | `client_nomination_id`、`moment_id`、`session_id`、`profile_id`、`profile_name`、`category`、`points_spent`、`status`、`refunded_at`、`refund_reason`、`created_at`、`updated_at` | 字段覆盖完整；建议 DBA/后端复核是否需增加 `session_id + profile_id + moment_id + category + date` 或 `client_nomination_id` 唯一约束，避免实体表双写后重复推举 |
| M4 奖励配置 / M5 发奖规则 | `ranking_reward_rules` | `category`、`enabled`、`rank_start`、`rank_end`、`points`、`tiers_json`、`effective_at`、`reason`、`updated_at` | 当前 `rankingRewardRules` 未在 `moments.js` 中标准化；配置可能也来自 admin store，后续同步源需固定 |
| M5 发奖记录 | `ranking_reward_payouts` | `source_id`、`category`、`date`、`moment_id`、`session_id`、`profile_id`、`profile_name`、`rank`、`points`、`rule_id`、`status`、`operator`、`created_at`、`updated_at` | 字段覆盖完整，且 `source_id` 有唯一键；需线上重复发奖反例验证 |
| moments 上传资产 | 当前通用 `assets` 表 / JSON `uploadedAssets` | `uploadedAssets` 在 `moments_store` 中包含 `sessionId`、`uploaderProfileId`、`fileName`、`mimeType`、`size`、`url`、`createdAt` | 没有 dedicated `moment_uploaded_assets` 表；若后续需要按 session/uploader 查询上传资产，需补映射或独立表 |

额外同步风险：

- `backend/scripts/sync-normalized-db.js` 当前只初始化 content/social/admin/assets，并调用 `syncNormalizedTables()`。
- `backend/data/normalized-db.js` 当前同步任务未读取 `moments_store`，也未写入 `moment_records`、`session_events`、`session_briefs`、`share_image_tasks`、`moment_reports`、`moment_nominations`、`ranking_reward_rules`、`ranking_reward_payouts`。
- 因此 `npm.cmd --prefix backend run db:sync-normalized` 可执行 DDL，但不能证明 moments 实体表已有数据同步；DBA/运维复核时需把“DDL 可执行”和“moments 数据同步”拆成两个结论。

### 14.3 给 DBA/运维和接口联调负责人的动作

后端当前可支持：

- 对 `backend/sql/mysql-normalized-schema.sql` 做字段级复核，确认 8 张 moments 表可重复执行。
- 在可用 MySQL 环境运行 `npm.cmd --prefix backend run mysql:test`，只确认 `app_store` 连接可用。
- 在确认 `.env` 指向测试数据库后运行 `npm.cmd --prefix backend run db:sync-normalized`，只确认 DDL 可执行及既有 content/social/admin/assets 实体同步；不得把它当作 moments 实体表数据同步完成证据。
- 本地运行 `npm.cmd --prefix backend run smoke:moments-http`、`smoke:admin-moments`、`smoke:ugc-risk`，作为接口层和反例 smoke 参考。

仍需 PM 派给对应角色补证据：

| 任务 | 依赖角色 | 缺少证据 | 后端状态 |
| --- | --- | --- | --- |
| `INT-DATA-001` 固定三用户数据包 | PM / 运维 / 接口联调负责人 / 后端/API | 线上测试账号/token、后台账号、写操作窗口、清理授权、manifest 回填 | 待联调；当前仅有 smoke 脚本 |
| `DEV-M0-01` DDL 实连 | DBA / 运维 | 可用 MySQL 环境下的 DDL 执行日志、重复执行结果、表结构截图或 `SHOW CREATE TABLE` 记录 | 待 DBA 复核 |
| `DEV-M0-01B` moments 实体同步 | 后端/API / DBA | `moments_store` 到 8 张 moments 表的同步映射、回滚策略、行数对账 | 阻塞：当前同步脚本未覆盖 moments |
| `DEV-M4-01` 至 `DEV-M4-05` 线上后台动作 | 后台 / 测试 / 运维 | 线上后台账号、固定样本、operationLogs 证据、前台状态同步证据 | 待联调 |
| `DEV-M5-04` / `DEV-M5-05` 线上推举、退款、发奖 | 测试 / 风控 / 后台 / 接口联调负责人 | 固定 ranking/nomination/payout 样本、pointsLedger、重复发奖和下架退款反例 | 待联调 / 待复核 |

## 15. 第三轮 P0 交付记录：`DEV-M0-01` / `DATA-DB-001`

记录时间：2026-06-15

本轮目标：补齐 `moments_store -> 8 张 moments 实体表` 的第一阶段可验证同步能力，让 DBA/运维后续验证的不只是 DDL 存在。

本轮改动文件：

- `backend/data/normalized-db.js`
- `backend/scripts/sync-normalized-db.js`
- `docs/gameplay-moments-backend-development-plan.md`

本轮未改动：业务 API 路由、PM 总台账、前端/后台/测试/风控/UI/UX 文档、部署配置、线上 `api.pomer.cn` 数据库。

同步覆盖范围：

| JSON store 来源 | 实体表 | 覆盖字段说明 |
| --- | --- | --- |
| `momentRecords` | `moment_records` | 覆盖 moment ID、草稿幂等 ID、session/uploader、类型、媒体、文案、标签、可见范围、用途授权、补全/审核/二审、上榜/奖励资格、软删除和时间字段 |
| `sessionEvents` | `session_events` | 覆盖事件 ID、客户端幂等 ID、session、操作者/目标、事件类型、分值、文案、同步状态和时间字段 |
| `sessionBriefs` | `session_briefs` | 覆盖 brief ID、session、标题、封面模式、opening/closing/timeline 节点 ID、分享任务 ID/状态、待补图数量和上榜资格 |
| `shareImageTasks` | `share_image_tasks` | 覆盖任务 ID、session、brief、状态、布局、节点白名单、图片 URL、失败原因、重试次数和处理时间 |
| `momentReports` | `moment_reports` | 覆盖举报 ID、moment/session、举报人、原因、描述、处理状态、处理人、处理时间和创建时间 |
| `momentNominations` | `moment_nominations` | 覆盖推举 ID、客户端幂等 ID、moment/session/profile、分类、消耗积分、状态、退款时间/原因和时间字段 |
| `rankingRewardRules` / admin 回落规则 | `ranking_reward_rules` | 优先同步 `moments_store.rankingRewardRules`，为空时回落 `admin_store.rankingRewardRules`，覆盖分类、启用、名次区间、积分、tiers、原因和更新时间 |
| `rankingRewardPayouts` | `ranking_reward_payouts` | 覆盖发奖 ID、`source_id`、分类、日期、moment/session/profile、名次、积分、规则 ID、状态、操作者和时间字段 |

第一阶段未覆盖 / 待后续确认：

- `uploadedAssets` 暂未拆入 dedicated moments 上传资产表；当前 8 张 moments 实体表范围不含该表。
- `momentReports` 和 `rankingRewardRules` 在 `moments.js` 中仍是宽松对象，已按当前后台/风控字段做兼容映射；后续如新增字段，需同步更新 DDL 和 mapper。
- 本轮只补同步映射，不做双写和查询切换；线上 API 仍以 JSON store 兼容路径为准。

已执行验证：

```powershell
pwsh -NoLogo -NoProfile -Command '$PSVersionTable.PSVersion.ToString()'
node --check backend/data/normalized-db.js
node --check backend/scripts/sync-normalized-db.js
node --check backend/data/moments.js
npm.cmd run check:encoding
npm.cmd --prefix backend run mysql:test
```

验证结果：

- `pwsh` 版本：`7.6.2`。
- `node --check` 三个后端 JS 文件通过。
- `npm.cmd run check:encoding` 通过。
- `npm.cmd --prefix backend run mysql:test` 失败，错误为本机 MySQL `ECONNREFUSED ::1:3306 / 127.0.0.1:3306`；属于本机数据库环境不可用，未能执行实连同步验证。

DBA/运维下一步复核方式：

1. 在可用 MySQL 测试环境确认 `.env` 指向测试库，不使用真实用户线上写库窗口。
2. 运行 `npm.cmd --prefix backend run mysql:test`，确认连接和 `app_store` 可用。
3. 运行 `npm.cmd --prefix backend run db:sync-normalized`。
4. 核对日志中是否出现 8 张 moments 表的同步行数：`moment_records`、`session_events`、`session_briefs`、`share_image_tasks`、`moment_reports`、`moment_nominations`、`ranking_reward_rules`、`ranking_reward_payouts`。
5. 用 `SELECT COUNT(*)` 和抽样 `SELECT` 对照 JSON `moments_store`，确认字段映射和行数可解释。

后端状态：`DEV-M0-01` / `DATA-DB-001` 已补第一阶段同步映射，仍待 DBA/运维提供 MySQL 实连、重复执行和行数对账证据；未拿到该证据前，不能标记数据库实体同步验收完成。

## 16. 第四轮 P0 交付记录：`INT-DATA-001`

记录时间：2026-06-15

本轮目标：支持固定三用户联调数据包落地，提供可生成 manifest 的后端脚本；不修改 PM 总台账、不线上写数据、不触碰 `pomer.cn`。

本轮改动文件：

- `backend/scripts/prepare-moments-integration-fixture.js`
- `backend/package.json`
- `docs/gameplay-moments-backend-development-plan.md`

新增命令：

```powershell
npm.cmd --prefix backend run fixture:moments-integration -- --mode status --manifest docs/runtime/int-data-001-manifest.json
npm.cmd --prefix backend run fixture:moments-integration -- --mode create --base-url http://127.0.0.1:3221/api/v1 --prefix IT-MOMENTS-20260615 --manifest docs/runtime/int-data-001-manifest.json --keep
npm.cmd --prefix backend run fixture:moments-integration -- --mode cleanup --manifest docs/runtime/int-data-001-manifest.json --export-evidence docs/runtime/int-data-001-evidence.json
```

脚本能力：

- 支持 `status`、`create`、`cleanup` 三种模式；默认 `status`，不写数据。
- 本地 `create` 会自启后端服务，生成 host/memberA/memberB/outsider、酒局、opening、highlight、private、event、brief、pending/ready/failed/expired share task、report、nomination、ranking、可选 reward payout，并写入 manifest。
- 本地 `cleanup` 只读取 manifest，且只接受 `IT-MOMENTS-` 前缀与 `local` 环境；清理前可导出 evidence。
- 远程 `api.pomer.cn` create 需要 `INT_DATA_ALLOW_REMOTE_WRITE=1` 和四个用户 token；缺账号/token/写操作窗口时不会执行线上生成。
- 远程 cleanup 当前拒绝执行，避免误删真实数据；线上清理由 PM/运维按 manifest 授权后另行执行。

仍缺证据：

- 未执行线上写数据，缺 PM/运维写操作窗口、线上测试账号/token、后台 cookie 或后台账号。
- 远程 report / expired share task 没有安全公开制造路径；脚本会在 manifest 中记录 skipped/warnings，需后端后续补测试 helper 或由后台/测试手工制造。
- 固定数据能否作为跨角色共享样本，仍需接口联调负责人实际运行并回填 manifest。

后端状态：脚本与命令已补，待接口联调负责人/测试在本地或授权环境执行；未拿到实际 manifest 前，`INT-DATA-001` 仍为待联调。

第六轮本地 create 阻塞修复补充：

- 根因 1：脚本原先先启动本地服务进程，再在父进程写入 `bindWechatUser` token；服务进程已缓存启动时的 social store，导致 `/sessions` 读取不到新 token 并返回 `401 unauthorized`。已调整为本地 profiles/token 先生成，再启动本地服务。
- 根因 2：failed share task 创建时传入的 `selectedNodeIds` 必须属于“可用于分享图”的 brief timeline 节点；pending moment 不满足可分享条件。已调整为先后台 approve failed candidate，创建 failed task 后再 hide 并 process，使 failed 样本基于真实可选节点生成。
- 本地验证已执行：`node --check backend/scripts/prepare-moments-integration-fixture.js`、`npm.cmd run check:encoding`、本地 create、manifest JSON.parse、cleanup、`IT-MOMENTS-20260615` 残留扫描。
- 验证结果：本地 create 生成 `docs/runtime/int-data-001-manifest.json`，关键字段无缺失；cleanup 成功导出 evidence 后，已移除本次临时 manifest/evidence，避免留下指向已清理数据的 actual manifest。残留扫描只命中 `docs/runtime/int-data-001-manifest.template.json`。
- 后端状态：本地 fixture create 阻塞已解除；接口联调负责人可重新执行本地 create 生成自己的 actual manifest。

第七轮 expired share task 404 复核补充：

- 根因：local expired task / report 样本由脚本父进程直接写 `moments-store`，但写入发生在 nomination、ranking reward 等子服务进程 API 写操作之前；后续子服务进程使用已缓存的旧 moments store 写回文件，覆盖了父进程刚插入的 expired task/report。因此旧 manifest 中 `share-task-it-moments-20260615-expired` 只存在于 manifest，不存在于 `backend/data`，GET 返回 404。
- 修复：已将 local expired task / report 写入移动到所有会写 moments store 的 API 调用之后、manifest 持久化之前，避免后续 API 写回旧缓存覆盖该本地 fixture 实体。
- 验证：`node --check backend/scripts/prepare-moments-integration-fixture.js` 通过；`npm.cmd run check:encoding` 通过；只读请求当前保留 manifest 的 expired task 仍返回 404，说明当前保留数据由旧脚本生成且实体已缺失。
- 处理边界：本轮未 cleanup、未删除或移动 actual manifest、未重建 fixture、未线上写入、未改 PM 总台账。当前 actual manifest 若必须覆盖 expired 200，需要 PM 授权接口联调重新执行本地 create，或授权后端/API 做一次针对当前 manifest 的本地受控修复并重启 3221 服务。

第八轮 expired share task 404 退回复核补充：

- 只读复核当前 actual manifest：`session-1781507687012-e4343d`，expired ID 为 `share-task-it-moments-20260615-expired`。
- 当前 `backend/data/moments-store.json` 已存在该 expired task，且 `sessionId` 与 manifest 一致；`backend/data/moments.js` 的 `SHARE_TASK_STATUSES` 包含 `expired`，`normalizeShareImageTask` 不会把该状态丢弃或改写为 `pending`。
- 本轮未发现 `writeMomentsStore(momentsStore)` 未落盘证据；与 PM 复核时“只命中 manifest”相比，当前工作区 `rg` 已可命中 `backend/data/moments-store.json`。
- 仍返回 404 的可解释原因：当前 3221 监听进程 PID `25368` 可能在 expired 写入前已启动或已首次读取 moments store，`store-accessor` 使用进程内 cache，文件后续变化不会自动刷新到正在运行的服务进程。
- 本轮未改业务源码、未 cleanup、未重建 manifest、未线上写入、未改 PM 总台账。后端/API 状态为：文件层实体存在，接口层仍待接口联调重启本地 3221 后只读复核；若重启后仍 404，再退回后端/API 继续诊断路由或读取路径。

## 17. `reviewMomentId` 与 `pointsLedgerIds` 证据口径

记录时间：2026-06-15

本轮范围：只读核查当前 `INT-DATA-001` manifest 的 M4/M5 缺口，不改业务源码、不改 PM 总台账、不执行线上写入、不回填 manifest。

已核查现状：

- 当前 manifest `moments.reviewMomentId` 为空；`moments.highlightId=moment-1781507687034-93c8676b`。
- 当前 `backend/data/moments-store.json` 中 `highlightId` 对应 `momentRecords` 实体存在，状态为 `reviewStatus=pending`、`secondaryReviewStatus=pending`、`rankingEligible=false`、`rewardEligible=false`，可作为 M4 待审候选样本口径。
- `highlightId` 不是 dedicated `reviewMomentId`。后台、测试、UGC 如使用该样本，必须写明“以 highlight 待审样本替代 dedicated review moment”，不能据此宣称 `reviewMomentId` 已回填。
- 当前 manifest `m5.pointsLedgerIds=[]`，但 `docs/runtime/int-data-001-manifest.json` 的 evidence 内已有 memberB `/user/commerce` 快照，包含推举扣分 ledger：`ledger-1781507687124-c80dfdf1`，`kind=moment-nomination`，`sourceId=nomination-1781507687124-4ad71db9`。
- 只读文件核查 `backend/data/content-store.json` 还可定位 host 的榜单奖励 ledger：`ledger-1781507687129-71036ef5`，`kind=ranking-reward`，`sourceId=ranking-reward:2026-06-15:best_opening:moment-1781507687032-eb1806a4:reward-rule-best-opening-1`。
- 本地 3221 只读接口复核 `/api/v1/user/commerce`：host token 返回 `ranking-reward` ledger `ledger-1781507687129-71036ef5`；memberB token 返回 `moment-nomination` ledger `ledger-1781507687124-c80dfdf1`。

可立即只读补采方式：

```powershell
# 读取 manifest 中 host/memberB token 后，只读查询当前用户积分流水
Invoke-RestMethod -Method Get `
  -Uri "http://127.0.0.1:3221/api/v1/user/commerce" `
  -Headers @{ "X-JZP-User-Token" = "<host-or-memberB-token>" }
```

补采口径：

- memberB ledger 可作为 `DEV-M5-04` 推举扣分证据：`kind=moment-nomination` 且 `sourceId` 等于当前 `m5.nominationId`。
- host ledger 可作为 `DEV-M5-05` 榜单奖励发放证据：`kind=ranking-reward` 且 `sourceId` 指向当前 ranking item、category、date 和 reward rule。
- 上述只读结果只能作为“当前本地数据存在 ledger 证据”的补采材料；不得把本地 smoke 或本轮只读结果直接写成当前 manifest 的 `m5.pointsLedgerIds` 已回填，除非 PM 明确授权由接口联调或后端/API 重建/回填 manifest 并重新做 JSON.parse、只读复核和残留说明。

仍需授权/协作：

- 若 PM 要 dedicated `reviewMomentId`，需派后端/API 或接口联调在授权窗口创建独立待审 moment，或授权更新 fixture 生成 dedicated review 样本；随后接口联调回填 manifest 并提供只读确认。
- 若 PM 要 `m5.pointsLedgerIds` 成为 manifest 顶层字段，需派接口联调或后端/API 在不清理当前数据的前提下按当前本地 ledger 只读补采后回填 manifest；若需要重新生成 fixture，必须先获得 PM 授权并说明会影响当前保留数据。
- 后台/测试/UGC 仍不能据 `reviewMomentId` 空、`pointsLedgerIds` 空的 manifest 直接签 M4/M5 真实通过；只能按上述替代/补采口径标记待联调或待复核。

## 18. 聚会记录师三步创建与拍照 API 影响评估

记录时间：2026-06-15

本轮范围：基于 `docs/party-recorder-redesign-requirements.md` 评估后端/API 合同影响；不改业务源码、不改 PM 总台账、不线上写入。

目标默认路径：

1. 首页点击“创建聚会”。
2. 自动或轻量选择聚会主题，立即得到房间和邀请方式。
3. 点击“开始记录 / 拍第一张”，进入拍照或上传，照片落入当前聚会时间线。

现有接口可复用能力：

| 改版能力 | 现有接口/数据 | 当前判断 |
| --- | --- | --- |
| 快速创建聚会 | `POST /api/v1/sessions` -> `createManagedSession` -> `getLiveSessionConfig` | 可复用。创建响应已返回 `id`、`inviteCode`、`sessionName`、`templateName`、成员等 live config。 |
| 默认房间名 | `createManagedSession.name` 来自 `payload.sessionName` | 需补默认口径。当前后端不自动生成默认名称，前端可先传 `YYYY-MM-DD 聚会` 或 `某某的聚会`；若要求后端兜底，需要新增默认生成规则。 |
| 默认模板 | `payload.templateName`、`payload.templateImageUrl`；`GET /api/v1/config/templates` 返回模板配置 | 可复用但需降权。模板可由前端默认取第一项/推荐项；后端当前不强制模板，不应作为创建必填。 |
| 邀请码加入 | `POST /api/v1/sessions/join`、`GET /api/v1/sessions/by-invite`、`GET /api/v1/sessions/live?inviteCode=...` | 可复用。`inviteCode` 已是创建后可用的加入凭证。 |
| 邀请二维码 | `GET /api/v1/tools/qr-code.png?text=...` | 可临时复用为任意文本二维码，但缺“聚会邀请页 path / short link / scene 参数”合同。若二维码需要承载小程序页面参数，需前端给页面路径，后端/API 再确认是否新增专用 `inviteQrUrl`。 |
| 拍第一张照片上传 | `POST /api/v1/moments/uploads/image` | 可复用。需 token、`sessionId`、`dataUrl`、`fileName`，返回 `/uploads/moments/...webp`。 |
| 拍照后生成记录 | `POST /api/v1/sessions/:sessionId/moments` | 可复用。上传图片后用 `imageUrl` 创建 `nodeType=highlight` 或 `opening` 的 moment；会写入 timeline。 |
| 时间线 | `GET /api/v1/sessions/:sessionId/timeline` | 可复用。创建第一张后可立即读到节点。 |
| 简报/相册入口 | `POST /api/v1/sessions/:sessionId/brief`、`GET /api/v1/session-briefs/:briefId` | 可复用为后续相册/分享页数据底座；默认创建阶段不应阻塞拍照。 |

建议的第一阶段 API 合同口径：

- 创建聚会最小请求允许只传轻量字段：`sessionName?`、`playerCount?`、`templateName?`、`templateImageUrl?`、`source="quick-create"`。
- 后端应兼容缺省 `playerCount`、`templateName`、`state`、`status`；玩法设置、积分、榜单、惩罚类字段不作为默认创建必填。
- 创建响应必须继续返回：`id`、`inviteCode`、`sessionName`、`hostProfileId`、`joinedCount`、`playerCount`、`templateName`、`templateImageUrl`。
- 第一张照片链路建议前端先串联两个现有接口：先 `/moments/uploads/image`，再 `/sessions/:sessionId/moments`。如体验要求单请求完成，可新增 `POST /api/v1/sessions/:sessionId/moments/quick-photo` 合同草案，但本轮不实现。
- `nodeType` 默认建议为 `highlight`；如产品希望首张标记为开场封面，可用现有 `opening`，但需前端/UI 明确首张照片在时间线和相册中的展示语义。

必须新增/调整的字段或接口草案：

| 优先级 | 项 | 原因 | 后端/API建议 |
| --- | --- | --- | --- |
| P0 | 默认房间名兜底 | 三步创建不能要求用户手填 | 可先由前端传默认名；若 PM 要后端兜底，则在 `createManagedSession` 缺 `sessionName` 时生成 `聚会 YYYY-MM-DD HH:mm`。 |
| P0 | 邀请二维码内容口径 | 当前只有通用二维码 PNG，不知道应编码小程序 path、H5 fallback 还是 inviteCode 文本 | PM 派前端给新版邀请页路径；接口联调确认二维码内容；后端再决定是否新增 `inviteQrUrl` / `sharePage` 字段。 |
| P0 | 拍第一张完成证据 | 现有需要上传 + 创建 moment 两次请求 | 第一阶段可复用两接口；测试需提供“创建后 3 步内完成”的接口顺序证据。若前端体验明显受阻，再评估合并接口。 |
| P1 | `source` 枚举 | 旧数据已有 `source`，但无新版枚举 | 建议约定 `quick-create`、`invite-code`、`qr-code`、`album-share`。 |
| P1 | `templateId` | 当前 session 只有 `template`/`templateImageUrl`，缺稳定模板 ID | 若新版模板要追踪转化，建议新增兼容字段 `templateId`，旧 `templateName` 保留展示。 |
| P1 | `sharePage` / `invitePath` | 邀请页、相册页、分享页需要统一入口 | 需前端先给页面路由；后端可在 live config 中透出。 |

玩法设置降权后的兼容口径：

- 旧字段 `players` / `playerCount`、`template` / `templateName`、`state`、`status`、`members.debtCount`、`drinkCount`、`clearedCount`、`wheelHistory`、榜单/积分/推举字段继续保留，避免破坏历史数据和后台页面。
- 默认创建与拍照路径不得依赖玩法设置、惩罚、积分、榜单、后台审核通过；这些字段只能作为高级配置、二级功能或后续运营能力。
- 新增 UI 文案和接口说明应使用“聚会记录师 / 聚会 / 记录 / 相册 / 分享 / 回忆”，历史代码字段名暂不强制改名。

需要协作提供的接口证据：

| 角色 | 任务编号 | 需要证据 |
| --- | --- | --- |
| 前端 | `PR-FE-001` | 新版三步页面路由、创建请求 payload、邀请页 path/二维码内容、拍照后两接口串联日志。 |
| 接口联调 | `PR-INT-001` | 本地固定 token 下执行：`POST /sessions`、`POST /sessions/join`、`POST /moments/uploads/image`、`POST /sessions/:id/moments`、`GET /sessions/:id/timeline` 的请求/响应摘要。 |
| 测试/验收 | `PR-QA-001` | 375/390/414 宽度真机或开发者工具录屏；证明三步内创建房间并拍第一张照片，且第一张在 timeline 可见。 |
| UI/UX | `PR-UX-001` | 明确首张照片是 `highlight` 还是 `opening` 的产品语义，以及邀请二维码/分享页入口文案。 |
| UGC 风控 | `PR-UGC-001` | 默认拍照公开范围、私密/相册分享过滤口径；确认首张照片是否默认参与分享图/相册公开。 |

后端/API当前结论：第一阶段无需立即大改后端即可支持“快速创建 + 邀请 + 拍第一张 + 时间线可见”的主链路；但默认房间名、邀请二维码内容、首张照片语义和是否新增合并接口仍需 PM 派前端/UI/接口联调补合同证据后再决定实现。

## 19. `PR-BE-AUTH401-CONTRACT-001` 鉴权 401 合同核查

记录时间：2026-06-15

本轮范围：只核查线上 `api.pomer.cn` 与本地代码合同；不改业务源码、不改 PM 总台账、不线上写入、不重启服务、不触碰 `pomer.cn`。

结论：

- `GET /api/v1/reports/history?mode=host` 必须登录。后端路由调用 `requireUserSession()`，无有效用户 token 返回 401 属预期合同。
- `GET /api/v1/user/session-moment-summaries` 必须登录。后端路由调用 `requireUserSession()`，无有效用户 token 返回 401 属预期合同。
- 401 响应 payload 稳定为 `{"code":401,"message":"unauthorized","data":null}`。
- 线上 CORS 允许 `X-JZP-User-Token`，后端也支持 `Authorization: Bearer <token>`；当前无证据表明线上不支持 token header。
- 本轮未使用敏感 token，无法证明某个真实用户 token 是否被清空；但无 token、假 token 的表现均符合合同。若前端带有效 token 仍 401，需要接口联调提供脱敏 token 后 8 位、登录时间、请求时间、响应原文，由后端/运维查 token store 或部署数据源。

只读验证证据：

```powershell
curl.exe -i -sS https://api.pomer.cn/api/v1/reports/history?mode=host
# HTTP/1.1 401 Unauthorized
# {"code":401,"message":"unauthorized","data":null}

curl.exe -i -sS https://api.pomer.cn/api/v1/user/session-moment-summaries
# HTTP/1.1 401 Unauthorized
# {"code":401,"message":"unauthorized","data":null}

curl.exe -i -sS -H "X-JZP-User-Token: invalid-contract-check-token" https://api.pomer.cn/api/v1/user/auth/session
# HTTP/1.1 200 OK
# {"code":0,"message":"ok","data":{"loggedIn":false,"profile":null}}

curl.exe -i -sS -X OPTIONS https://api.pomer.cn/api/v1/user/session-moment-summaries `
  -H "Origin: https://servicewechat.com" `
  -H "Access-Control-Request-Method: GET" `
  -H "Access-Control-Request-Headers: X-JZP-User-Token"
# HTTP/1.1 204 No Content
# Access-Control-Allow-Headers: Content-Type, Authorization, X-JZP-User-Token
```

前端正确流程：

1. 启动或进入需要个人数据的页面前，读取本地保存的用户 token。
2. 调 `GET /api/v1/user/auth/session`，带 `X-JZP-User-Token`；若返回 `loggedIn:true`，继续访问历史与摘要接口。
3. 若无 token 或 `loggedIn:false`，先走微信登录：`wx.login()` 获取 `loginCode`，再 `POST /api/v1/user/auth/login`，请求体包含 `loginCode` 和可选 `profile`。
4. 登录成功后保存返回的 `token`，后续所有需要登录的接口都带 `X-JZP-User-Token: <token>`。
5. 若登录失败或用户拒绝授权，前端应展示“需要登录后查看我的聚会记录 / 请重新登录”一类状态，不应把 401 当接口异常弹成系统错误，也不应静默空白。

需要协作复核：

- 前端 `PR-FE-REDESIGN-FULL-001`：补请求日志，证明历史/摘要接口已带 `X-JZP-User-Token`，并在 `loggedIn:false` 时触发登录态恢复。
- 接口联调：用非敏感测试账号复核 `/user/auth/session -> /user/auth/login -> history/summaries` 顺序；回传状态码、payload 和 token 后 8 位，不提交完整 token。
- 测试：复拍“无 token / token 失效 / 登录成功”三态页面，不把预期 401 判为后端失败。

后端/API状态：本轮不需要修业务逻辑；只有在“前端已携带有效 token 但仍 401”被接口联调用脱敏证据复现后，才进入后端/运维排查 token store、部署数据源或会话失效问题。

## 20. `PR-BE-RANKINGS-ONLINE-ROUTE-001` 线上 rankings 路由 404 核查

记录时间：2026-06-16

本轮范围：只核查后端/API 路由合同、本地代码和线上只读响应；不改业务源码、不改 PM 总台账、不线上写入、不重启 PM2/Nginx、不触碰 `pomer.cn`。

已核查文件：

- `backend/server.js`
- `backend/data/moments.js`
- `docs/api-spec.md`
- `docs/gameplay-moments-interface-integration-test-plan.md` 3.10
- `docs/gameplay-moments-backend-development-plan.md`

本地代码结论：

- `backend/server.js` 已注册 `GET /api/v1/rankings/today`，路由位于 `/api/v1/moments/...` 动态路由之前，不存在被 moments 动态路由吞掉的问题。
- `backend/data/moments.js` 已导出并实现 `listTodayRankings({ category, limit })`。
- 本地 3221 只读验证同一路径返回 HTTP 200：

```powershell
curl.exe -i -sS "http://127.0.0.1:3221/api/v1/rankings/today?category=best_opening&limit=50"
# HTTP/1.1 200 OK
# {"code":0,"message":"ok","data":{"category":"best_opening","date":"2026-06-16","items":[]}}
```

线上只读验证：

```powershell
curl.exe -i -sS "https://api.pomer.cn/api/v1/rankings/today?category=best_opening&limit=20"
# HTTP/1.1 404 Not Found
# {"code":404,"message":"not found","data":null}

curl.exe -i -sS "https://api.pomer.cn/api/v1/config/home"
# HTTP/1.1 200 OK
# 说明 api.pomer.cn 的 /api/v1 代理基本可达，不是整站或公司官网域名问题。
```

根因判断：

- 本地代码和本地服务均有 rankings 路由，线上 `api.pomer.cn` 返回 404，因此当前更像线上运行进程未包含该路由，或部署/进程版本未更新。
- Nginx/API 前缀整体错误的概率较低，因为同一线上前缀 `/api/v1/config/home` 可 HTTP 200。
- 路由注册顺序导致 404 的概率较低，因为本地同一 `server.js` 已通过同一路径验证。
- 仍需运维/部署侧确认：PM2 当前进程代码版本、服务重启时间、部署目录是否为本仓库当前后端、是否存在多实例旧进程、Nginx upstream 是否指向旧端口/旧服务。

是否需要代码修复：

- 本轮未发现必须修改后端源码的证据。
- 若运维确认线上代码已是当前 `backend/server.js` 但仍 404，再退回后端/API 继续查线上入口文件、构建产物或路由加载分支。

需要运维配合与回滚方式：

1. 只读确认当前线上 PM2 进程：服务名、cwd、启动脚本、最近重启时间、commit 或文件时间戳。
2. 在部署窗口发布当前后端代码到 `api.pomer.cn` 对应服务目录，并重启对应 PM2 进程；不要触碰 `pomer.cn` 公司官网服务。
3. 回滚方式：保留发布前目录/commit 和 PM2 进程配置；若 `/api/v1/config/home`、`/api/v1/user/auth/session`、`/api/v1/rankings/today` 任一关键只读接口异常，立即回滚到发布前版本并重启。
4. 部署后只读验收命令：

```powershell
curl.exe -i -sS "https://api.pomer.cn/api/v1/rankings/today?category=best_opening&limit=50"
curl.exe -i -sS "https://api.pomer.cn/api/v1/rankings/today?category=today_highlight&limit=50"
curl.exe -i -sS "https://api.pomer.cn/api/v1/config/home"
```

后端/API状态：本地路由存在且可复跑；线上仍缺 200 证据。当前不能写“已线上修复”，需 PM 派运维/部署负责人检查并发布当前后端版本，或提供线上服务版本证据后再继续后端排查。

## 21. `PR-BE-RANKINGS-DEPLOY-PACK-001` rankings 线上最小发布包

记录时间：2026-06-16

本轮范围：基于 PM 已完成的服务器只读归属证据，整理 rankings 路由最小发布包、验证命令和回滚方案；不改业务源码、不部署、不改 PM 总台账、不线上写入、不触碰 `pomer.cn`。

PM 提供的线上只读结论：

- PM2 服务：`jiuzhuopanguan-backend` online。
- PM2 script path：`/www/wwwroot/jiuzhuopanguan-git/backend/server.js`。
- PM2 cwd：`/www/wwwroot/jiuzhuopanguan-git/backend`。
- Nginx：`server_name api.pomer.cn`，`location /` 反代 `127.0.0.1:3010`。
- 服务器目录 HEAD：`9dd553280273a5d9690421bf72b016ef61667750` / `9dd5532 2026-06-13 fix: allow invite without preset friends`。
- 服务器 `backend/server.js` 未命中 `rankings/today` / `listTodayRankings`。
- 服务器本机 3010 与公网 `api.pomer.cn` 的 `/api/v1/rankings/today?...` 均返回 404。

本地发布包核查：

- 本地 `backend/server.js` 已引入 `./data/moments`，并注册 `GET /api/v1/rankings/today`。
- 本地 `backend/data/moments.js` 是新增未跟踪文件，包含 `listTodayRankings`、`initMomentsStore` 和 moments 数据层能力；服务器当前缺该文件/能力时，单独发布 `server.js` 会导致 `require('./data/moments')` 失败。
- 本地 `backend/package.json` 有未提交脚本项变更，但 rankings 路由运行不依赖新增 npm package；现有依赖 `sharp`、`qrcode` 已在 `package.json` dependencies 中，`moments.js` 使用的 `sharp` 不是新依赖。
- 不涉及数据库/DDL；`GET /rankings/today` 读取 JSON `moments_store`，空榜也应返回 HTTP 200 + `items:[]`。

rankings 最小发布包：

| 文件 | 必须性 | 原因 |
| --- | --- | --- |
| `backend/server.js` | 必须 | 注册 `GET /api/v1/rankings/today`，并在服务启动时调用 `initMomentsStore()`。 |
| `backend/data/moments.js` | 必须 | 新增 moments 数据层，导出 `listTodayRankings`；当前本地为未跟踪文件，必须随发布包一并放到服务器。 |
| `backend/data/store-accessor.js` | 通常不需要 | 服务器已有 store accessor；除非运维 diff 发现服务器版本缺 `createStoreAccessor` 当前接口。 |
| `backend/package.json` | rankings 可不发 | 本地改动主要是新增 smoke/fixture 脚本；不影响线上 rankings 路由运行。若运维要保持脚本一致，可随独立发布窗口处理。 |
| `backend/package-lock.json` / `node_modules` | 不需要 | 无新增运行依赖。 |
| SQL / DDL | 不需要 | 本次只恢复 JSON store 路由，不涉及 MySQL 表结构。 |
| `backend/data/moments-store.json` | 不建议随代码包覆盖 | 这是运行数据文件。服务器缺文件时由 `initMomentsStore()` 创建默认 store；不得用本地测试数据覆盖线上数据。 |

发布前本地验证命令：

```powershell
node --check backend/server.js
node --check backend/data/moments.js

# 如本地 3221 已运行，验证 rankings 路由存在。
curl.exe -i -sS "http://127.0.0.1:3221/api/v1/rankings/today?category=best_opening&limit=50"
curl.exe -i -sS "http://127.0.0.1:3221/api/v1/rankings/today?category=today_highlight&limit=50"
curl.exe -i -sS "http://127.0.0.1:3221/api/v1/rankings/today?category=bad_category&limit=50"

# 可选本地 smoke，允许写入本地临时数据并自动清理时再跑。
npm.cmd --prefix backend run smoke:moments-http
```

本轮已执行的本地验证：

- `node --check backend/server.js` 通过。
- `node --check backend/data/moments.js` 通过。
- `curl.exe -i -sS "http://127.0.0.1:3221/api/v1/rankings/today?category=best_opening&limit=50"` 返回 HTTP 200，`data.category=best_opening`，`date=2026-06-16`，`items=[]`。

发布后只读验证命令：

```bash
# 服务器本机
curl -i -sS "http://127.0.0.1:3010/api/v1/rankings/today?category=best_opening&limit=50"
curl -i -sS "http://127.0.0.1:3010/api/v1/rankings/today?category=today_highlight&limit=50"
curl -i -sS "http://127.0.0.1:3010/api/v1/rankings/today?category=bad_category&limit=50"

# 公网 api.pomer.cn
curl -i -sS "https://api.pomer.cn/api/v1/rankings/today?category=best_opening&limit=50"
curl -i -sS "https://api.pomer.cn/api/v1/rankings/today?category=today_highlight&limit=50"
curl -i -sS "https://api.pomer.cn/api/v1/rankings/today?category=bad_category&limit=50"

# 回归一个既有只读接口，确认反代和服务未被破坏
curl -i -sS "https://api.pomer.cn/api/v1/config/home"
```

预期结果：

- `best_opening`：HTTP 200，`code=0`，`data.category="best_opening"`，允许 `items=[]`。
- `today_highlight`：HTTP 200，`code=0`，`data.category="today_highlight"`，允许 `items=[]`。
- `bad_category`：HTTP 200，`code=0`，后端归一化为 `today_highlight`，允许 `items=[]`。
- `config/home`：继续 HTTP 200。

回滚方案：

1. 发布前备份服务器现状文件：
   - `/www/wwwroot/jiuzhuopanguan-git/backend/server.js`
   - 如服务器已有 `/www/wwwroot/jiuzhuopanguan-git/backend/data/moments.js`，也备份；如没有，记录为“发布新增文件”。
2. 仅覆盖发布包文件，不覆盖 `backend/data/*.json` 运行数据。
3. 重启 `jiuzhuopanguan-backend` PM2 进程后执行只读验证。
4. 触发回滚条件：
   - PM2 进程无法 online。
   - `/api/v1/config/home` 由 200 变为异常。
   - `/api/v1/rankings/today` 仍 404 且服务日志出现 `Cannot find module './data/moments'` 或启动异常。
   - 出现非预期 5xx。
5. 回滚动作：
   - 恢复备份的 `backend/server.js`。
   - 若 `backend/data/moments.js` 是本次新增且需回滚，移走或恢复发布前状态。
   - 重启 `jiuzhuopanguan-backend`，确认 `/api/v1/config/home` 恢复 200。

风险与缺少证据：

- 本地 `backend/server.js` 包含的不只是 rankings，还包含 moments、M4/M5 后台动作等一组未上线 API；如果只按文件覆盖，实际发布范围大于单一路由。运维发布前应接受这是“moments API 批量补齐包”，或由后端/API 另行拆分单路由 hotfix。
- `backend/data/moments.js` 当前为未跟踪文件，发布时必须显式带上，不能只从 git HEAD 部署。
- 本轮未执行线上发布，因此缺服务器本机 3010 与公网 200 证据。
- 若 PM 要严格最小化到只上线 rankings，不带 M1-M5 其它 API，需要单独授权后端/API 拆分 hotfix 源码；本轮按当前本地代码给出可发布包，不改源码。

后端/API结论：允许进入运维发布窗口的前提是 PM 接受当前发布包会同时带上 `backend/server.js` 中已存在的 moments API 路由和新增 `backend/data/moments.js`。若只允许 rankings 单路由上线，则不能直接发布当前文件包，需另派后端/API 拆分 hotfix。

2026-06-16 PM 只读复核补充：

- 当前阻塞已不是“服务器权限 / 归属证据不可采集”。PM 已确认 SSH、PM2、Nginx、服务器 HEAD、服务目录和本机 3010 响应。
- 最新线上状态仍为：`api.pomer.cn -> 127.0.0.1:3010`，PM2 `jiuzhuopanguan-backend` online，服务器 HEAD `9dd5532`，服务器 `backend/server.js` 未命中 `rankings/today` / `listTodayRankings`，服务器本机和公网 `/api/v1/rankings/today?...` 均 404。
- 当前真实阻塞为“发布范围授权阻塞”：本地可发布包会把 `backend/server.js` 中现有 moments/M4/M5 路由与新增 `backend/data/moments.js` 一并带上；如果 PM/运维只授权 rankings 单路由，则不能直接发布当前文件包。

下一步准备两条路径：

| 路径 | 内容 | 后端/API状态 | 需要 PM 授权 |
| --- | --- | --- | --- |
| A | 接受当前 `backend/server.js` + `backend/data/moments.js` 包 | 可进入运维发布窗口；发布后按第 21 节本机 3010 + 公网 curl 验证 | 授权“moments API 批量补齐包”发布范围，并由运维备份/覆盖/重启/回滚 |
| B | 拆纯 rankings hotfix | 当前尚未拆；需另派后端/API 改源码，尽量只新增 `GET /api/v1/rankings/today` 所需最小实现，避免带出 M1-M5 其它 API | 授权后端/API 做 hotfix 代码拆分、验证、发布包记录 |

后端/API不执行部署、不重启、不写库、不改 PM 总台账。未获得 A 或 B 授权前，线上 404 只能保持“待发布范围确认 / 待运维窗口”，不能写已修复。

## 22. `PR-API-DB-FLOW-SMOKE-001` 发布后流程只读 smoke

记录时间：2026-06-16

本轮范围：只读复核 session、moment、brief、share task、rankings、points ledger 数据链路是否支撑当前前端/测试复拍；不线上写入、不 cleanup、不改 PM 总台账、不触碰 `pomer.cn`。

已核查输入：

- 当前本地 manifest：`docs/runtime/int-data-001-manifest.json`。
- 本地服务：`127.0.0.1:3221` 正在监听，PID `25368`。
- 当前 manifest session：`session-1781507687012-e4343d`，inviteCode `C56EVT`。
- 当前 manifest 角色：host/memberA/memberB/outsider 均有 profileId/token；本文不记录完整 token。

只读 smoke 命令：

```powershell
# 固定样本摘要，不输出完整 token
node -e "const fs=require('fs'); const m=JSON.parse(fs.readFileSync('docs/runtime/int-data-001-manifest.json','utf8')); console.log({id:m.id,sessionId:m.session.sessionId,inviteCode:m.session.inviteCode,moments:m.moments,brief:m.brief.briefId,shareTasks:m.shareTasks,m5:m.m5})"

# 本地只读链路，使用 manifest 内 host/memberB/outsider token：
# GET /sessions/live?sessionId=...
# GET /sessions/:sessionId/timeline
# GET /session-briefs/:briefId
# GET /share-image-tasks/:taskId
# GET /rankings/today?category=best_opening&limit=50
# GET /user/commerce

# 公网发布后 rankings 只读验证
curl.exe -i -sS "https://api.pomer.cn/api/v1/rankings/today?category=best_opening&limit=50"
curl.exe -i -sS "https://api.pomer.cn/api/v1/rankings/today?category=today_highlight&limit=50"
curl.exe -i -sS "https://api.pomer.cn/api/v1/rankings/today?category=bad_category&limit=50"
curl.exe -i -sS "https://api.pomer.cn/api/v1/config/home"
```

本轮只读响应摘要：

| 链路 | 环境 | 结果 |
| --- | --- | --- |
| session live | 本地 3221 | HTTP 200；`id=session-1781507687012-e4343d`，`inviteCode=C56EVT`，`joinedCount=3` |
| host timeline | 本地 3221 | HTTP 200；`nodeCount=5`，含 opening/highlight/private/hidden/event；host 看到 private 占位 |
| memberB timeline | 本地 3221 | HTTP 200；`nodeCount=5`；memberB 可见 private 正文、图片和 `visibleProfileIds` |
| outsider timeline | 本地 3221 | HTTP 403；`message=not session member` |
| brief | 本地 3221 | HTTP 200；`brief-1781507687042-d1990edd`，`timelineNodeCount=5`，`rankingEligible=false` |
| pending share task | 本地 3221 | HTTP 200；`status=pending`，无 `imageUrl` |
| ready share task | 本地 3221 | HTTP 200；`status=ready`，`imageUrl=/uploads/moments/share-tasks/share-task-1781507687046-d1098582.png` |
| failed share task | 本地 3221 | HTTP 200；`status=failed` |
| expired share task | 本地 3221 | HTTP 200；`status=expired` |
| rankings best_opening | 本地 3221 | HTTP 200；`date=2026-06-16`，`items=[]` |
| host commerce ledger | 本地 3221 | HTTP 200；host `points=60`；ledger `ledger-1781507687129-71036ef5`，`kind=ranking-reward` |
| memberB commerce ledger | 本地 3221 | HTTP 200；memberB `points=70`；ledger `ledger-1781507687124-c80dfdf1`，`kind=moment-nomination` |
| rankings best_opening | 公网 `api.pomer.cn` | HTTP 200；`category=best_opening`，`date=2026-06-16`，`items=[]` |
| rankings today_highlight | 公网 `api.pomer.cn` | HTTP 200；`category=today_highlight`，`date=2026-06-16`，`items=[]` |
| rankings bad_category | 公网 `api.pomer.cn` | HTTP 200；后端归一化为 `today_highlight`，`items=[]` |
| config/home | 公网 `api.pomer.cn` | HTTP 200；反代和基础服务可读 |

缺失字段 / 风险：

- `moments.reviewMomentId` 仍为空；M4 后台审核只能用 `highlightId=moment-1781507687034-93c8676b` 作为 pending/pending 替代样本，不能写 dedicated review 样本已回填。
- `m5.pointsLedgerIds` 仍为空；本轮只读已能从 `/user/commerce` 补采 host/memberB ledger ID，但不得把本轮 smoke 结果直接写成 manifest 顶层字段已回填。
- `rankings` 当前 2026-06-16 今日榜为空：`INT-DATA-001` 的 nomination/reward 样本创建于 2026-06-15，不会进入 2026-06-16 今日榜。前端/测试可复拍空榜和错误兜底，但不能复拍真实榜单列表态。
- `brief.rankingEligible=false`，与当前待审/隐藏/私密过滤状态一致；不代表后端 rankings 失效。
- 本轮只读公网仅覆盖 public rankings/config；未用线上用户 token 读取线上 session/moment/ledger，因此不能宣称线上全链路已通过。

是否需要接口联调补固定样本：

- 若当前复拍只要求 session/timeline/brief/share task 四态、私密权限、points ledger 只读证据：现有本地 `INT-DATA-001` 可支撑。
- 若复拍要求 2026-06-16 今日榜单有列表项、`m5.pointsLedgerIds` 顶层字段回填、dedicated `reviewMomentId`、线上真实 session/moment/ledger：需要 PM 另行授权接口联调/后端补固定样本或回填 manifest。
- 若需要线上写入生成今日榜单样本，必须另有 PM/运维授权、测试账号/token、清理/回滚方案；本轮不得执行。

后端/API当前状态：本地数据链路只读 smoke 可支撑前端/测试复拍“可读链路、权限、四态任务、空榜、ledger 补采”；不支撑“今日榜有数据、manifest 顶层 ledgerIds 已回填、dedicated reviewMomentId、线上全链路通过”的结论。

## 23. `PR-INT-BRIEF-PATH-CONTRACT-001` brief 路由合同确认

记录时间：2026-06-16

本轮范围：只确认后端/API brief 路由合同；不改源码、不线上写入、不 cleanup、不改 PM 总台账、不触碰 `pomer.cn`。

后端实际注册路由：

- `POST /api/v1/sessions/:sessionId/brief`：已注册，用于生成或刷新当前 session 的 brief，返回 brief 数据。
- `GET /api/v1/session-briefs/:briefId`：已注册，用于按 `briefId` 读取 brief，并按当前用户权限返回 timeline。
- `POST /api/v1/session-briefs/:briefId/share-image-tasks`：已注册，用于创建分享图任务。
- `GET /api/v1/sessions/:sessionId/brief`：当前未注册；因此测试发现 404 属于当前代码合同表现。

只读复核结果：

```powershell
# 使用当前 INT-DATA-001 host token，本地 3221 只读
GET /api/v1/session-briefs/brief-1781507687042-d1990edd
# HTTP 200, code=0, id=brief-1781507687042-d1990edd, timelineNodeCount=5

GET /api/v1/sessions/session-1781507687012-e4343d/brief
# HTTP 404, code=404, message=not found
```

合同判断：

- 当前后端合同是“sessionId 只用于 `POST /sessions/:sessionId/brief` 生成/刷新；读取使用 `GET /session-briefs/:briefId`”。
- `docs/api-spec.md` 与后端计划前置合同也按上述口径书写；但接口联调计划 3.9 附近出现了 `GET /sessions/{sessionId}/brief` 的调用口径，属于文档/调用口径与后端实际合同不一致。
- 若前端已经持有 manifest 或 summaries 中的 `briefId`，应调用 `GET /api/v1/session-briefs/:briefId`，不需要后端新增 route。
- 若新版“聚会记录师”页面只持有 `sessionId`，且希望直接读取已存在 brief，不先 POST 刷新，则可以新增兼容只读 route：`GET /api/v1/sessions/:sessionId/brief`，后端按 sessionId 查已有 brief 并返回；若不存在，建议返回 404 或明确 `brief:null` 的 200 口径，需 PM/前端/接口联调先定合同。

后端/API建议：

| 方案 | 适用情况 | 后端动作 |
| --- | --- | --- |
| 修文档/前端调用 | 前端/测试可拿到 `briefId` | 不改后端；接口联调和前端统一改为 `GET /session-briefs/:briefId`。 |
| 补兼容 route | 前端页面天然只有 `sessionId`，需要一跳读取已有 brief | 需 PM 另派后端/API 实现 `GET /sessions/:sessionId/brief`，并补本地/线上只读验证。 |

当前状态：本轮不做源码修复。后端/API确认 `/sessions/{sessionId}/brief` 404 不是线上异常，而是当前未注册 route；下一步由 PM 决定是修接口联调/前端调用口径，还是授权后端补兼容 GET route。

## 24. `PR-BE-FINAL-FIXTURE-SERVICE-002` 本地 fixed data 3221 服务恢复说明

记录时间：2026-06-16

本轮范围：只确认如何恢复或启动本地 `127.0.0.1:3221` fixed data 服务；不启动服务、不 cleanup、不 recreate、不线上写入、不改 Nginx/PM2、不改 PM 总台账、不触碰 `pomer.cn`。服务启动说明不等于接口验收通过。

已核查内容：

- `Get-NetTCPConnection -LocalPort 3221` 本轮无监听输出，确认当前本机 `127.0.0.1:3221` fixed data 服务未运行。
- `docs/runtime/int-data-001-manifest.json` 存在且 JSON 可解析。
- 当前 manifest 摘要：`sessionId=session-1781507687012-e4343d`，`inviteCode=C56EVT`，host `user-1781507686650-a33705`，`briefId=brief-1781507687042-d1990edd`，ready task `share-task-1781507687046-d1098582`，ranking category `best_opening`。
- 本轮未执行服务启动、未改 manifest、未清理或重建 fixed data。

恢复命令：

```powershell
# 在 F:\codexlist\jiuzhuopanguan 执行；前台启动，便于测试/接口联调观察日志
$env:PORT = "3221"
npm.cmd --prefix backend start
```

如需后台窗口启动，可由执行人另开 PowerShell 窗口运行同一命令；不要执行 cleanup/recreate，不要修改 `docs/runtime/int-data-001-manifest.json`。

启动前检查：

```powershell
Get-NetTCPConnection -LocalPort 3221 -ErrorAction SilentlyContinue |
  Select-Object LocalAddress,LocalPort,State,OwningProcess
```

- 无输出：端口空闲，可启动。
- 有 `Listen`：已有服务，先做健康检查，不要重复启动；如需停止/重启，必须由 PM 明确授权并记录 PID。

预期健康检查：

```powershell
curl.exe -i -sS "http://127.0.0.1:3221/api/v1/config/home"
curl.exe -i -sS "http://127.0.0.1:3221/api/v1/rankings/today?category=best_opening&limit=50"

# 使用 manifest 中 host token，不要打印完整 token
curl.exe -i -sS -H "X-JZP-User-Token: <host-token>" "http://127.0.0.1:3221/api/v1/session-briefs/brief-1781507687042-d1990edd"
curl.exe -i -sS -H "X-JZP-User-Token: <host-token>" "http://127.0.0.1:3221/api/v1/share-image-tasks/share-task-1781507687046-d1098582"
curl.exe -i -sS "http://127.0.0.1:3221/uploads/moments/share-tasks/share-task-1781507687046-d1098582.png"
```

预期结果：

- `/api/v1/config/home`：HTTP 200，`code=0`。
- `/api/v1/rankings/today?category=best_opening`：HTTP 200，允许 `items=[]`。
- `/api/v1/session-briefs/brief-1781507687042-d1990edd`：HTTP 200，`timeline.nodes` 可读。
- `/api/v1/share-image-tasks/share-task-1781507687046-d1098582`：HTTP 200，`status=ready`，有 `imageUrl`。
- ready PNG：HTTP 200，`Content-Type` 应为 `image/png`。

责任边界：

- 如果最终大版本采集使用本地 fixed data，执行启动和健康检查的人应是当前采集链路负责人：接口联调或测试。后端/API已提供命令和预期，不替测试写通过。
- 如果执行 `npm.cmd --prefix backend start` 后服务启动失败、缺依赖、端口异常或健康检查返回 5xx/404，再退回后端/API排查。
- 如果测试只使用公网 `api.pomer.cn`，则本地 3221 不属于线上验收必需项；不要把本地服务未启动写成公网接口失败。

仍缺证据：

- 本轮没有启动 3221，因此缺当前时刻的 `config/home`、brief、share task、PNG 健康检查实际输出。
- 缺接口联调/测试在采集窗口内执行上述命令后的截图或日志。
- 缺同 LAN 真机访问 `http://192.168.0.101:3221/api/v1` 的网络/合法域名配置确认；如要真机使用本地 fixed data，需前端/测试确认代理或开发者工具设置。

后端/API当前状态：本地 fixed data manifest 可用，但 3221 服务未运行；后端/API提供恢复命令和只读健康检查，等待接口联调或测试按采集目标执行。

## 25. `PR-BE-ONLINE-FIXTURE-SUPPORT-003` 线上最终采集样本支持

记录时间：2026-06-16

本轮范围：支持接口联调直接在 `api.pomer.cn` 线上测试环境创建最终采集样本时的后端/API兜底；只面向酒桌判官/聚会记录师 `api.pomer.cn` 服务。不得触碰 `pomer.cn` 官网项目、`pomer` 官网 PM2、官网 Nginx block、官网目录或无关项目。本轮无具体写入错误原文，未主动执行线上写入。

PM 授权口径：

- 根据 `PR-PM-ONLINE-TEST-SERVER-AUTH-001`，后端/API 可在职责范围内对 `api.pomer.cn` 对应服务执行测试写入、补样本、部署、重启或清理，不再逐项等待单独授权。
- 每次动作仍必须记录：目标、命令、证据、备份/回滚或清理方式。
- 所有线上样本必须使用明确测试前缀，例如 `IT-MOMENTS-` / `PR-FINAL-`；不得扫描式删除真实业务数据。

当前只读健康检查：

```powershell
curl.exe -i -sS "https://api.pomer.cn/api/v1/config/home"
# HTTP 200, code=0

curl.exe -i -sS "https://api.pomer.cn/api/v1/rankings/today?category=best_opening&limit=50"
# HTTP 200, code=0, category=best_opening, date=2026-06-16, items=[]
```

线上造数前置条件：

| 项 | 要求 |
| --- | --- |
| API base | `https://api.pomer.cn/api/v1` |
| 用户 token | host/memberA/memberB/outsider 四类测试 token；不得在文档中记录完整 token |
| 前缀 | 建议 `PR-FINAL-YYYYMMDD` 或 `IT-MOMENTS-YYYYMMDD` |
| manifest | 必须输出线上 actual manifest，记录 session/profile/moment/brief/task/report/nomination/payout/ledger ID |
| 清理 | 必须基于 manifest 精确清理或保留证据；不允许按宽泛关键词扫描删除 |
| 备份 | 写入前导出/记录相关 manifest 与 pointsLedger/momentNominations/rankingRewardPayouts 证据 |

可用 smoke / 健康检查命令：

```powershell
# 只读基础
curl.exe -i -sS "https://api.pomer.cn/api/v1/config/home"
curl.exe -i -sS "https://api.pomer.cn/api/v1/rankings/today?category=best_opening&limit=50"
curl.exe -i -sS -H "X-JZP-User-Token: <host-token>" "https://api.pomer.cn/api/v1/user/auth/session"

# create/session
curl.exe -i -sS -X POST "https://api.pomer.cn/api/v1/sessions" `
  -H "Content-Type: application/json" `
  -H "X-JZP-User-Token: <host-token>" `
  --data "{\"sessionName\":\"PR-FINAL-20260616 聚会记录\",\"playerCount\":3,\"templateName\":\"PR-FINAL-20260616\",\"source\":\"online-final-capture\"}"

# brief 生成与读取
curl.exe -i -sS -X POST "https://api.pomer.cn/api/v1/sessions/<sessionId>/brief" `
  -H "Content-Type: application/json" `
  -H "X-JZP-User-Token: <host-token>" `
  --data "{}"
curl.exe -i -sS -H "X-JZP-User-Token: <host-token>" "https://api.pomer.cn/api/v1/session-briefs/<briefId>"

# share task
curl.exe -i -sS -X POST "https://api.pomer.cn/api/v1/session-briefs/<briefId>/share-image-tasks" `
  -H "Content-Type: application/json" `
  -H "X-JZP-User-Token: <host-token>" `
  --data "{\"layoutMode\":\"timeline\"}"
curl.exe -i -sS -H "X-JZP-User-Token: <host-token>" "https://api.pomer.cn/api/v1/share-image-tasks/<taskId>"

# rankings / points
curl.exe -i -sS "https://api.pomer.cn/api/v1/rankings/today?category=best_opening&limit=50"
curl.exe -i -sS -H "X-JZP-User-Token: <member-token>" "https://api.pomer.cn/api/v1/user/commerce"
```

错误兜底口径：

| 链路 | 常见错误 | 后端/API处理 |
| --- | --- | --- |
| auth/session | 401 或 `loggedIn:false` | 前端/接口联调需先登录换 token；若带有效测试 token 仍 401，回传 token 后 8 位、请求时间和响应原文，后端查 token store。 |
| create session | 401 | 缺 `X-JZP-User-Token` 或 token 失效；先修登录态，不改 create 合同。 |
| create session | 5xx | 后端/API按日志最小修复；修复前保留请求体、响应原文和时间。 |
| brief | `GET /sessions/:sessionId/brief` 404 | 当前未注册 GET by sessionId；应使用 `POST /sessions/:sessionId/brief` 生成/刷新，`GET /session-briefs/:briefId` 读取。若必须按 sessionId GET，需另派 route 实现。 |
| share task | `selectedNodeIds must belong to visible brief timeline nodes` | selectedNodeIds 必须来自当前 brief 可见且可分享节点；接口联调应改用 brief 返回的实际节点 ID。 |
| share task process/ready | PNG 404 或非 image/png | 先确认 task `status=ready` 和 `imageUrl`；若 ready 仍静态 404，后端查上传目录/静态路由。 |
| rankings | 200 但 `items=[]` | 空榜不是接口错误；需要当天 nomination/approved/rankingEligible 样本才有列表态。 |
| points ledger | `pointsLedgerIds=[]` | 可通过 `/user/commerce` 只读补采；manifest 顶层回填需接口联调/后端按证据更新。 |
| report/review/admin action | 401/403 | 区分用户 token 与后台 cookie；后台 action 需要后台登录态，不使用小程序 token。 |

回滚 / 清理要求：

- 如果只是接口联调创建测试数据：优先保留 manifest 作为采集证据；清理前必须导出 evidence。
- 清理只能按 manifest 中具体 ID 执行；不得按 `PR-FINAL` 或 `IT-MOMENTS` 在全库宽泛删除。
- 当前 `fixture:moments-integration` 远程 create 需要 `INT_DATA_ALLOW_REMOTE_WRITE=1` 与四类用户 token；远程 cleanup 仍需后端/API确认安全策略后再执行，不能假设脚本已支持线上清理。
- 如线上服务部署/重启引发回归：回滚到发布前 `backend/server.js` / `backend/data/moments.js` / PM2 配置备份，并验证 `/api/v1/config/home`、`/api/v1/user/auth/session`、`/api/v1/rankings/today`。

后端/API当前状态：

- 公网 `api.pomer.cn` 基础健康和 rankings public route 当前可读。
- 本轮未执行线上写入，因此尚无线上最终采集 manifest、session/moment/brief/share task/points/report/review 实际 ID。
- 等接口联调执行线上造数；如出现错误，后端/API按错误原文和上述链路做最小修复或合同说明。

## 26. `PR-BE-ONLINE-REWARD-GRANT-FIX-004` 线上榜单奖励发放函数修复

记录时间：2026-06-16

本轮范围：只处理 `api.pomer.cn` 对应 `jiuzhuopanguan-backend` 后端/API；不触碰 `pomer.cn` 官网项目、`pomer` 官网 PM2、官网 Nginx block、官网目录或无关项目；不改 PM 总台账，不替测试/UI/UGC 写通过。

错误原文：

- 后台 `POST /api/v1/admin/ranking-rewards/grant` 返回 HTTP 500。
- 错误：`grantRankingRewardsByAdmin is not a function`。

根因定位：

- 本地 `backend/data/admin.js` 已定义并导出 `grantRankingRewardsByAdmin`。
- 本地 `backend/server.js` 已从 `./data/admin` 解构并调用该函数。
- 线上只读核查发现：`server.js` 已命中 `grantRankingRewardsByAdmin` 调用，但线上 `data/admin.js` 未命中该函数。
- 根因是线上发布版本不一致：此前发布带上了新版 `server.js`，但漏发或未更新 `backend/data/admin.js`，导致运行时解构到的 `grantRankingRewardsByAdmin` 为 `undefined`。

执行动作：

| 项 | 内容 |
| --- | --- |
| 目标服务 | `api.pomer.cn` / PM2 `jiuzhuopanguan-backend` |
| 目标目录 | `/www/wwwroot/jiuzhuopanguan-git/backend` |
| 修改文件 | `/www/wwwroot/jiuzhuopanguan-git/backend/data/admin.js` |
| 备份路径 | `/www/backup/jiuzhuopanguan/admin-grant-fix-20260616121819/admin.js` |
| 部署方式 | 从本地工作区复制 `backend/data/admin.js` 到线上目标目录 |
| 重启 | `pm2 restart jiuzhuopanguan-backend --update-env` |
| 未触碰 | `pomer` PM2、`pomer.cn` 官网 Nginx、官网目录、无关项目 |

执行命令摘要：

```bash
# 远端备份
ssh pomer.cn 'set -e; ts=$(date +%Y%m%d%H%M%S); backup=/www/backup/jiuzhuopanguan/admin-grant-fix-$ts; mkdir -p $backup; cp /www/wwwroot/jiuzhuopanguan-git/backend/data/admin.js $backup/admin.js; printf "%s\n" $backup'

# 覆盖目标服务文件
scp backend/data/admin.js pomer.cn:/www/wwwroot/jiuzhuopanguan-git/backend/data/admin.js

# 远端语法和导出检查
ssh pomer.cn 'cd /www/wwwroot/jiuzhuopanguan-git/backend && node --check data/admin.js && node -e "const admin=require(\"./data/admin\"); console.log(typeof admin.grantRankingRewardsByAdmin)"'

# 重启目标 PM2 服务
ssh pomer.cn 'pm2 restart jiuzhuopanguan-backend --update-env'
```

验证证据：

- 远端 `node --check data/admin.js` 通过。
- 远端 `typeof admin.grantRankingRewardsByAdmin` 输出 `function`。
- `pm2 describe jiuzhuopanguan-backend`：status `online`，script path `/www/wwwroot/jiuzhuopanguan-git/backend/server.js`，cwd `/www/wwwroot/jiuzhuopanguan-git/backend`，重启后 PID `238187`。
- `GET https://api.pomer.cn/api/v1/config/home` 返回 HTTP 200 / `code=0`。
- `GET https://api.pomer.cn/api/v1/rankings/today?category=best_opening&limit=50` 返回 HTTP 200 / `code=0` / `items=[]`。
- 后台登录后调用 `POST https://api.pomer.cn/api/v1/admin/ranking-rewards/grant`，请求体 `{"category":"best_opening","limit":50}`，返回 HTTP 200：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "category": "best_opening",
    "date": "2026-06-16",
    "grantedCount": 0,
    "skippedCount": 0,
    "totalPoints": 0,
    "items": []
  }
}
```

说明：

- 本次 action 验证会产生后台登录态和一次发奖操作日志；由于当前 `best_opening` 今日榜为空，`grantedCount=0`，未实际发放积分。
- `items=[]` 是当前样本状态，不代表奖励列表态验收通过；只证明 HTTP 500 / `grantRankingRewardsByAdmin is not a function` 已修复。

后台负责人可复跑：

1. 登录 `https://api.pomer.cn/admin/login`。
2. 打开 `commerce-ranking-rewards`。
3. 点击发放今日 `best_opening` / 最有开场类奖励。
4. 预期：页面不再报 HTTP 500；接口返回 `code=0`，`grantedCount/skippedCount/totalPoints/items` 字段存在。
5. 如果当前榜单为空，预期 `grantedCount=0`、`items=[]`；这不是失败。

失败回滚方式：

```bash
# 恢复备份 admin.js
scp pomer.cn:/www/backup/jiuzhuopanguan/admin-grant-fix-20260616121819/admin.js /tmp/admin.js.rollback
ssh pomer.cn 'cp /www/backup/jiuzhuopanguan/admin-grant-fix-20260616121819/admin.js /www/wwwroot/jiuzhuopanguan-git/backend/data/admin.js && pm2 restart jiuzhuopanguan-backend --update-env'

# 回滚后只读健康检查
curl -i -sS https://api.pomer.cn/api/v1/config/home
curl -i -sS "https://api.pomer.cn/api/v1/rankings/today?category=best_opening&limit=50"
```

回滚触发条件：

- PM2 `jiuzhuopanguan-backend` 无法 online。
- `config/home` 或 rankings 由 200 变为 5xx/不可达。
- 后台其它已通过 action 出现新 5xx，且确认由本次 `admin.js` 覆盖导致。

后端/API当前状态：线上奖励发放 action 的函数缺失问题已修复并验证为 HTTP 200；仍需测试/后台用真实页面复拍，不得由后端/API替测试/UI/UGC 写通过。

## 27. `PR-BE-DB-LOGIN-SEED-005` 线上测试身份数据库生成与奖励发放复核

记录时间：2026-06-16

本轮范围：只处理 `api.pomer.cn` 对应 `jiuzhuopanguan-backend` 后端/API；不触碰 `pomer.cn` 官网项目、`pomer` 官网 PM2、官网 Nginx block、官网目录或无关项目；不改 PM 总台账，不替测试/UI/UGC 写通过。

用户确认当前没有 4 个真实账号/token，要求“用现有登陆和数据库直接生成”。公网 `/api/v1/user/auth/login` 依赖微信 `loginCode -> openid`，无真实微信 code 时不能直接造号；本轮改用后端现有数据层 `bindWechatUser()` 在目标服务 MySQL store 中生成测试身份。

关键定位：

- 普通 SSH shell 未加载 `.env`，`isMySQLEnabled()` 为 false，直接执行数据层脚本只会写入文件镜像，重启后会被 PM2 进程的 MySQL store 覆盖。
- PM2 `jiuzhuopanguan-backend` 环境实际启用 MySQL store：`MYSQL_DATABASE=jiuzhuopanguan`，`MYSQL_STORE_TABLE=app_store`，`STORE_FILE_MIRROR=1`。
- 因此造号脚本必须在 `/www/wwwroot/jiuzhuopanguan-git/backend` 下先加载 `.env`，再调用 `bindWechatUser()`，并等待异步持久化完成；随后重启 `jiuzhuopanguan-backend` 让进程 cache 重新加载。

执行动作：

| 项 | 内容 |
| --- | --- |
| 目标服务 | `api.pomer.cn` / PM2 `jiuzhuopanguan-backend` |
| 目标目录 | `/www/wwwroot/jiuzhuopanguan-git/backend` |
| 数据源 | MySQL `jiuzhuopanguan.app_store` 的 `social_store`，文件镜像 `backend/data/social-store.json` |
| 备份目录 | `/www/backup/jiuzhuopanguan/login-seed-005-20260616122325/` |
| 备份文件 | `social-store.json`、`admin-store-before-session-smoke.json`、`mysql-app-store-before-seed.sql` |
| 写入方式 | 加载 `.env` 后调用 `bindWechatUser()` 生成 host/memberA/memberB/outsider |
| 重启 | `pm2 restart jiuzhuopanguan-backend --update-env`，仅重启目标服务 |
| 未触碰 | `pomer` PM2、`pomer.cn` 官网 Nginx、官网目录、无关项目 |

生成身份证据：

| role | profileId | openId | token 后 8 位 |
| --- | --- | --- | --- |
| host | `user-1781583974510-1a52e6` | `PR-BE-DB-LOGIN-SEED-005-20260616-host` | `4afb1b00` |
| memberA | `user-1781583974512-aedd1b` | `PR-BE-DB-LOGIN-SEED-005-20260616-memberA` | `c1b1585a` |
| memberB | `user-1781583974514-a46045` | `PR-BE-DB-LOGIN-SEED-005-20260616-memberB` | `dc59b557` |
| outsider | `user-1781583974515-9019e6` | `PR-BE-DB-LOGIN-SEED-005-20260616-outsider` | `f9118246` |

说明：完整 token 只用于本轮私有命令验证，不写入公开文档；接口联调/测试如需完整 token，应由 PM/后端通过安全通道提供或重新执行同等脚本并仅记录 token 后 8 位。

验证命令摘要：

```powershell
# 四个 token 均应返回 loggedIn=true；文档不得记录完整 token
curl.exe -sS -i -H "X-JZP-User-Token: <host-token>" "https://api.pomer.cn/api/v1/user/auth/session"
curl.exe -sS -i -H "X-JZP-User-Token: <memberA-token>" "https://api.pomer.cn/api/v1/user/auth/session"
curl.exe -sS -i -H "X-JZP-User-Token: <memberB-token>" "https://api.pomer.cn/api/v1/user/auth/session"
curl.exe -sS -i -H "X-JZP-User-Token: <outsider-token>" "https://api.pomer.cn/api/v1/user/auth/session"

# host token 写接口鉴权验证
curl.exe -sS -i -X POST "https://api.pomer.cn/api/v1/sessions" `
  -H "Content-Type: application/json" `
  -H "X-JZP-User-Token: <host-token>" `
  --data "{\"sessionName\":\"PR-BE-DB-LOGIN-SEED-005 鉴权验证\",\"playerCount\":4,\"templateName\":\"聚会记录师默认模板\",\"source\":\"PR-BE-DB-LOGIN-SEED-005\"}"

# 奖励发放 500 复核
curl.exe -sS -i -b <admin-cookie> -H "Content-Type: application/json" `
  -X POST "https://api.pomer.cn/api/v1/admin/ranking-rewards/grant" `
  --data "{\"category\":\"best_opening\",\"limit\":50}"
```

验证结果：

- `GET /api/v1/user/auth/session`：host/memberA/memberB/outsider 四个 token 均返回 HTTP 200 / `code=0` / `loggedIn=true`。
- `POST /api/v1/sessions`：host token 返回 HTTP 201 / `code=0`，创建 smoke session `session-1781584037456-ee2e2b`，inviteCode `TWPNX2`，source `PR-BE-DB-LOGIN-SEED-005`。
- `POST /api/v1/admin/ranking-rewards/grant`：后台登录后返回 HTTP 200 / `code=0`，`grantedCount=0`、`items=[]`。当前今日榜为空，未实际发放积分；该结果只证明 `grantRankingRewardsByAdmin is not a function` 的 500 已闭环，不代表奖励列表态验收通过。
- 本地语法检查：`node --check backend/data/social.js`、`node --check backend/server.js`、`node --check backend/data/admin.js` 均通过。

残留与清理/回滚：

- 当前线上保留 4 个 `PR-BE-DB-LOGIN-SEED-005-20260616-*` 测试身份及其 userSessions/loginLogs。
- 当前线上保留 smoke session `session-1781584037456-ee2e2b`，用于证明 host token 可通过 `POST /sessions` 写接口鉴权。
- 如 PM 要清理测试身份和 smoke session，后端/API应按 openId 前缀和 session source 精确清理，不得宽泛删除真实用户或真实 session。
- 全量回滚可使用备份 `/www/backup/jiuzhuopanguan/login-seed-005-20260616122325/mysql-app-store-before-seed.sql` 恢复 `app_store`，然后 `pm2 restart jiuzhuopanguan-backend --update-env`；该回滚会撤销本轮之后写入到 `app_store` 的测试数据，执行前需确认没有其它角色在同一窗口写入新证据。

后端/API当前状态：

- `PR-BE-DB-LOGIN-SEED-005`：4 个线上测试身份已通过 `api.pomer.cn` 鉴权，并已用 host 身份成功创建 session。
- `PR-BE-ONLINE-REWARD-GRANT-FIX-004`：后台奖励发放函数缺失 500 继续验证为 HTTP 200；仍需后台/测试按页面动作复拍，不由后端/API替他们标记通过。

## 28. `PR-BE-SEED-TOKEN-HANDOFF-006` / `PR-INT-DB-GENERATED-FIXTURE-RUN-006` 安全 token 交接与线上 manifest 代跑

记录时间：2026-06-16

本轮范围：只处理 `api.pomer.cn` 对应 `jiuzhuopanguan-backend` 后端/API；不触碰 `pomer.cn` 官网项目、`pomer` 官网 PM2、官网 Nginx block、官网目录或无关项目；不改 PM 总台账，不替测试/UI/UGC 写通过。

处理策略：

- 不在公开文档写完整 token。
- 后端/API选择服务器侧代跑线上 manifest 生成，同时在服务器私密目录保存 root-only token env 与 private manifest。
- 对外只记录 profileId/openId、token 后 8 位、manifest 私密路径、样本 ID、warnings/skipped、cleanup/回滚方式。

服务器私密目录：

```text
/www/backup/jiuzhuopanguan/pr-int-db-generated-fixture-run-006-20260616123313
```

私密文件：

| 文件 | 权限 | 说明 |
| --- | --- | --- |
| `tokens.env` | `600` | 四角色完整 token 与后台账号 env，仅服务器侧读取，不写公开文档 |
| `int-data-001-online-manifest-private.json` | `600` | 完整线上 manifest，含 token，仅服务器侧读取 |
| `int-data-001-online-manifest-sanitized.json` | `600` | 脱敏 manifest，已移除完整 token，保留 token 后 8 位 |
| `int-data-001-online-evidence-extra.json` | `600` | operationLogs / points ledger 补采证据 |
| `mysql-app-store-before-fixture-run.sql` | `644` | 本轮线上 manifest 写入前 MySQL `app_store` 备份 |
| `mysql-app-store-before-memberB-points-topup.sql` | `644` | memberB 测试积分补点前 MySQL `app_store` 备份 |

执行命令摘要：

```bash
# 生成 root-only token env
cd /www/wwwroot/jiuzhuopanguan-git/backend
set -a
. ./.env
set +a
node <read social_store and write tokens.env>
chmod 600 /www/backup/jiuzhuopanguan/pr-int-db-generated-fixture-run-006-20260616123313/tokens.env

# 发布后端 fixture 脚本到服务器 scripts 目录
scp backend/scripts/prepare-moments-integration-fixture.js pomer.cn:/www/wwwroot/jiuzhuopanguan-git/backend/scripts/prepare-moments-integration-fixture.js
ssh pomer.cn 'cd /www/wwwroot/jiuzhuopanguan-git/backend && node --check scripts/prepare-moments-integration-fixture.js'

# 备份 app_store 后代跑线上 manifest
mysqldump --no-tablespaces ... app_store > /www/backup/jiuzhuopanguan/pr-int-db-generated-fixture-run-006-20260616123313/mysql-app-store-before-fixture-run.sql

set -a
. ./.env
. /www/backup/jiuzhuopanguan/pr-int-db-generated-fixture-run-006-20260616123313/tokens.env
set +a
node scripts/prepare-moments-integration-fixture.js \
  --mode create \
  --base-url https://api.pomer.cn/api/v1 \
  --prefix IT-MOMENTS-20260616-006B \
  --manifest /www/backup/jiuzhuopanguan/pr-int-db-generated-fixture-run-006-20260616123313/int-data-001-online-manifest-private.json \
  --keep \
  --no-start-server
```

四角色脱敏身份：

| role | profileId | openId | token 后 8 位 |
| --- | --- | --- | --- |
| host | `user-1781583974510-1a52e6` | `PR-BE-DB-LOGIN-SEED-005-20260616-host` | `4afb1b00` |
| memberA | `user-1781583974512-aedd1b` | `PR-BE-DB-LOGIN-SEED-005-20260616-memberA` | `c1b1585a` |
| memberB | `user-1781583974514-a46045` | `PR-BE-DB-LOGIN-SEED-005-20260616-memberB` | `dc59b557` |
| outsider | `user-1781583974515-9019e6` | `PR-BE-DB-LOGIN-SEED-005-20260616-outsider` | `f9118246` |

首次代跑结果：

- 前缀：`IT-MOMENTS-20260616-006`。
- 失败原文：`POST /moments/moment-1781584437537-2e21801b/nominations failed: points not enough`。
- 根因：memberB 测试身份无积分余额，推举接口按后端规则需要积分。
- 处理：备份 `app_store` 后，仅给 memberB 测试身份补 500 测试积分，写入 ledger `ledger-1781584484873-a0db85`，kind `fixture-seed-topup`，随后重启 `jiuzhuopanguan-backend` 让进程 cache 加载最新 content store。

成功 manifest 摘要：

| 项 | 值 |
| --- | --- |
| manifest private path | `/www/backup/jiuzhuopanguan/pr-int-db-generated-fixture-run-006-20260616123313/int-data-001-online-manifest-private.json` |
| manifest sanitized path | `/www/backup/jiuzhuopanguan/pr-int-db-generated-fixture-run-006-20260616123313/int-data-001-online-manifest-sanitized.json` |
| prefix | `IT-MOMENTS-20260616-006B` |
| environment | `api.pomer.cn` |
| sessionId | `session-1781584503517-c033e9` |
| inviteCode | `W58G7T` |
| openingId | `moment-1781584503741-d53b131f` |
| highlightId | `moment-1781584503769-1a5b4d94` |
| privateId | `moment-1781584503795-17a32c27` |
| failedCandidateMomentId | `moment-1781584503823-56dc9214` |
| drinkDebtEventId | `event-1781584503850-94ad3aeb` |
| briefId | `brief-1781584503870-25d5edac` |
| pendingTaskId | `share-task-1781584503885-8bf3c52b` |
| readyTaskId | `share-task-1781584503902-a99a5211` |
| readyImageUrl | `/uploads/moments/share-tasks/share-task-1781584503902-a99a5211.png` |
| failedTaskId | `share-task-1781584504132-3251bd01` |
| rankingCategory | `best_opening` |
| rankingItemId | `moment-1781584503741-d53b131f` |
| nominationId | `nomination-1781584504202-df008444` |
| rewardPayoutId | `ranking-reward-payout-1781584504234-5a8cb962` |

补采回填证据：

| 字段 | ID |
| --- | --- |
| `admin.operationLogIds` | `admin-op-1781584504167-457c2e`、`admin-op-1781584504109-c1655b`、`admin-op-1781584504077-f9714e` |
| `m5.pointsLedgerIds` | `ledger-1781584504234-f8d759bf`、`ledger-1781584504202-0eb017c5` |
| host ranking reward ledger | `ledger-1781584504234-f8d759bf`，kind `ranking-reward`，delta `60` |
| memberB nomination ledger | `ledger-1781584504202-0eb017c5`，kind `moment-nomination`，delta `-10` |
| memberB topup ledger | `ledger-1781584484873-a0db85`，kind `fixture-seed-topup`，delta `500` |

warnings / skipped：

- `reviewMomentId` 仍为空；本轮有 `failedCandidateMomentId` 与 `admin.operationLogIds` 作为审核动作证据，但不是 dedicated `reviewMomentId` 字段。
- 远程 `reportId` 仍为空；当前 fixture 脚本没有安全公开 report 创建 helper。
- 远程 `expiredTaskId` 仍为空；当前 fixture 脚本没有安全公开 expired share task 创建 helper。
- 首次失败前缀 `IT-MOMENTS-20260616-006` 已产生部分 session/share task 残留；成功 manifest 以 `IT-MOMENTS-20260616-006B` 与上述具体 ID 为准。由于字符串 `006` 会包含命中 `006B`，残留扫描应按 manifest ID 精确核对，不应只按前缀 contains 下结论。

验证结果：

- 远端 `node --check scripts/prepare-moments-integration-fixture.js` 通过。
- private manifest / sanitized manifest 均 JSON.parse 通过。
- 只读接口复核均 HTTP 200 / `code=0`：
  - `GET /user/auth/session`
  - `GET /sessions/live?sessionId=session-1781584503517-c033e9`
  - `GET /sessions/session-1781584503517-c033e9/timeline`
  - `GET /session-briefs/brief-1781584503870-25d5edac`
  - `GET /share-image-tasks/share-task-1781584503902-a99a5211`
  - `GET /share-image-tasks/share-task-1781584504132-3251bd01`
  - `GET /rankings/today?category=best_opening`
  - `GET /user/commerce`（memberB token）

接口联调安全读取方式：

```bash
# 在服务器上读取脱敏 manifest；不包含完整 token
sudo cat /www/backup/jiuzhuopanguan/pr-int-db-generated-fixture-run-006-20260616123313/int-data-001-online-manifest-sanitized.json

# 如接口联调确需复跑 create，只能在服务器侧 source root-only token env，不要把完整 token 写入文档或聊天
cd /www/wwwroot/jiuzhuopanguan-git/backend
set -a
. ./.env
. /www/backup/jiuzhuopanguan/pr-int-db-generated-fixture-run-006-20260616123313/tokens.env
set +a
node scripts/prepare-moments-integration-fixture.js --mode create --base-url https://api.pomer.cn/api/v1 --prefix IT-MOMENTS-<NEW> --manifest /www/backup/jiuzhuopanguan/<safe-dir>/int-data-001-online-manifest-private.json --keep --no-start-server
```

cleanup / 回滚：

- 线上 fixture cleanup 当前不能使用脚本的 `cleanup` 模式；该脚本远程 cleanup 会拒绝执行，避免误删真实数据。
- 清理必须按 private manifest 中具体 ID 精确执行，并在清理前导出 evidence；不得按 `IT-MOMENTS` 宽泛删除。
- 如需全量回滚本轮数据，可恢复 `/www/backup/jiuzhuopanguan/pr-int-db-generated-fixture-run-006-20260616123313/mysql-app-store-before-fixture-run.sql`，再 `pm2 restart jiuzhuopanguan-backend --update-env`；执行前必须确认没有其它角色在本轮之后写入需要保留的新证据。
- 如只清成功 manifest，应清 `session-1781584503517-c033e9`、上述 moment/event/brief/share task/nomination/payout/ledger/operationLog ID，并保留清理前后扫描证据。

后端/API当前状态：

- `PR-BE-SEED-TOKEN-HANDOFF-006` 已完成安全交接：完整 token 仅在服务器 root-only 文件和 private manifest 中，公开记录只保留 token 后 8 位。
- `PR-INT-DB-GENERATED-FIXTURE-RUN-006` 已由后端/API服务器侧代跑成功，接口联调可使用脱敏 manifest 摘要继续采集；若需要完整 token 复跑，只能走服务器侧安全命令。
- 仍缺 dedicated `reviewMomentId`、远程 report helper、远程 expired share task helper；这些不能写成已覆盖，只能作为 warnings/skipped 或后端后续 helper 任务。

## 29. `PR-BE-ADMIN-PAGE-ACTION-CONTRACT-008` 后台页面 action 合同确认

记录时间：2026-06-16

本轮范围：只确认 `api.pomer.cn` / `jiuzhuopanguan-backend` 后台页面数据合同；不改业务代码、不改 PM 总台账、不触碰 `pomer.cn` 官网项目。

背景：后台确认奖励发放页面按钮不出现的直接原因是线上静态 `heatwave-ops` 资源旧；后端页面数据接口本身返回 6 个 `grant-*` pageActions。运维正在执行 `PR-OPS-ADMIN-STATIC-ACTION-DEPLOY-008` 同步静态资源。

核查文件：

- 本地：`backend/data/admin.js`
- 本地：`backend/public/admin/static/heatwave-ops/app.js`
- 线上：`/www/wwwroot/jiuzhuopanguan-git/backend/data/admin.js`
- 线上：`/www/wwwroot/jiuzhuopanguan-git/backend/public/admin/static/heatwave-ops/app.js`

线上 API 验证：

```powershell
$cookie = New-TemporaryFile
curl.exe -sS -i -c $cookie.FullName -H "Content-Type: application/json" `
  -X POST "https://api.pomer.cn/api/v1/admin/auth/login" `
  --data "{\"username\":\"admin\",\"password\":\"<redacted>\"}"

curl.exe -sS -b $cookie.FullName `
  "https://api.pomer.cn/api/v1/admin/pages/commerce-ranking-rewards"
```

结果摘要：

- 后台登录：HTTP 200。
- `GET /api/v1/admin/pages/commerce-ranking-rewards`：`code=0`。
- `pageActions.length=6`。

线上返回的 pageActions：

| key | label | endpoint | method | body.category | confirm |
| --- | --- | --- | --- | --- | --- |
| `grant-today_funny` | `发放今日最有梗` | `/api/v1/admin/ranking-rewards/grant` | `POST` | `today_funny` | 有 |
| `grant-today_debt` | `发放今日最欠酒` | `/api/v1/admin/ranking-rewards/grant` | `POST` | `today_debt` | 有 |
| `grant-today_highlight` | `发放今日最精彩` | `/api/v1/admin/ranking-rewards/grant` | `POST` | `today_highlight` | 有 |
| `grant-today_visual` | `发放今日最有画面` | `/api/v1/admin/ranking-rewards/grant` | `POST` | `today_visual` | 有 |
| `grant-best_opening` | `发放最佳开场` | `/api/v1/admin/ranking-rewards/grant` | `POST` | `best_opening` | 有 |
| `grant-best_closing` | `发放最佳收尾` | `/api/v1/admin/ranking-rewards/grant` | `POST` | `best_closing` | 有 |

静态页合同对照：

- 新版静态 `app.js` 使用 `renderPageActions()` 渲染 `state.page.pageActions`。
- 按钮属性为 `data-action="page-action"`、`data-page-action="<action.key>"`。
- 点击后 `runPageAction(actionKey)` 从 `state.page.pageActions` 查找 action。
- `runPageAction` 请求：

```js
request(action.endpoint, {
  method: action.method || 'POST',
  body: JSON.stringify(action.body || {}),
})
```

合同结论：

- API 合同与新版静态页 `runPageAction` 预期一致。
- `grant-best_opening` 等 6 个 action 均存在。
- endpoint、method、body.category、confirm 字段齐全。
- 不需要后端代码改动；若按钮仍不出现，应继续由运维/后台核查静态资源是否完成同步、浏览器缓存是否命中新版 `app.js`、页面 HTML 是否加载到新版脚本。

后台页面复录应看证据：

1. 浏览器 Network：`GET /api/v1/admin/pages/commerce-ranking-rewards` 返回 `pageActions` 数组且长度为 6。
2. 页面 DOM：出现 6 个 `data-action="page-action"` 按钮，至少包含 `data-page-action="grant-best_opening"`。
3. 点击 `grant-best_opening` 后 Network：`POST /api/v1/admin/ranking-rewards/grant`，payload 为 `{"category":"best_opening"}`。
4. 接口响应：HTTP 200 / `code=0`，包含 `grantedCount`、`skippedCount`、`totalPoints`、`items` 字段。
5. 若按钮仍不出现：截图/Network 需同时提供实际加载的 `/admin/static/heatwave-ops/app.js` 响应时间、内容是否含 `runPageAction` 与 `data-page-action`。

后端/API当前状态：合同未变且匹配新版静态页；本任务不需要后端源码修复，等待 `PR-OPS-ADMIN-STATIC-ACTION-DEPLOY-008` 和后台页面复录证据。

## 30. `PR-BE-REWARD-LEDGER-QUERY-009` 奖励发放 ledger / payout 查询口径

记录时间：2026-06-16

本轮范围：只确认 `api.pomer.cn` / `jiuzhuopanguan-backend` 的奖励发放后端/API查询口径与最小支持；不改业务代码、不改 PM 总台账、不触碰 `pomer.cn` 官网项目。

背景：后台页面按钮发奖入口已闭环，但完整验收仍需正向发奖、`pointsLedger`、`rankingRewardPayouts`、用户积分变化、前台同步证据。接口联调正在补 `PR-INT-REWARD-REPORT-EXPIRED-SAMPLES-009`。

现有接口/脚本能力结论：

- 用户侧积分与 ledger 查询已有 API：`GET /api/v1/user/commerce`。
- 后台侧全量积分流水已有页面数据 API：`GET /api/v1/admin/pages/commerce-point-ledger`。
- 发奖动作返回 `items`，包含本次 `rankingRewardPayouts` 中生成或跳过的结果。
- `rankingRewardPayouts` 当前没有独立公开 GET API；后端/API可用服务器侧只读 Node 脚本按 payoutId/sourceId 精确查询 `moments_store.rankingRewardPayouts`。
- 现有 API/脚本已足够支撑本轮查询口径；不需要后端代码改动。

正向发奖后推荐复核顺序：

1. 后台点击发奖或调用 `POST /api/v1/admin/ranking-rewards/grant`。
2. 记录响应 `grantedCount`、`skippedCount`、`totalPoints`、`items[]`。
3. 对每个 `items[].status="granted"` 的 payout，记录 `id`、`sourceId`、`momentId`、`profileId`、`points`、`rank`、`ruleId`。
4. 用获奖用户 token 调 `/user/commerce`，确认：
   - `points` 增加；
   - `pointsLedger[]` 出现 `kind="ranking-reward"`；
   - ledger `sourceId` 与 payout `sourceId` 一致；
   - ledger `delta` 等于 payout `points`。
5. 后台调 `commerce-point-ledger` 页面数据，确认后台流水列表中出现同一 ledger。
6. 服务器侧只读查 `rankingRewardPayouts`，确认 payout 已持久化。

用户侧 API 查询：

```powershell
# 获奖用户 token，例如本轮线上样本 host；不要在文档写完整 token
curl.exe -sS -i `
  -H "X-JZP-User-Token: <winner-token>" `
  "https://api.pomer.cn/api/v1/user/commerce"
```

关键字段：

| 字段 | 含义 | 正向发奖期望 |
| --- | --- | --- |
| `points` | 当前用户积分余额 | 比发奖前增加 `payout.points` |
| `pointsLedger[].id` | 积分流水 ID | 可写入 manifest `m5.pointsLedgerIds` |
| `pointsLedger[].kind` | 流水类型 | 发奖为 `ranking-reward` |
| `pointsLedger[].sourceId` | 幂等来源 | 等于 payout `sourceId` |
| `pointsLedger[].delta` | 积分变化 | 等于正数奖励积分 |
| `pointsLedger[].createdAt` | 流水时间 | 应与发奖时间接近 |

后台积分流水页面 API：

```powershell
$cookie = New-TemporaryFile
curl.exe -sS -i -c $cookie.FullName -H "Content-Type: application/json" `
  -X POST "https://api.pomer.cn/api/v1/admin/auth/login" `
  --data "{\"username\":\"admin\",\"password\":\"<redacted>\"}"

curl.exe -sS -b $cookie.FullName `
  "https://api.pomer.cn/api/v1/admin/pages/commerce-point-ledger"
```

关键字段：

| 字段 | 含义 | 复核方式 |
| --- | --- | --- |
| `tables[].rows[].id` | ledger ID | 应等于 `/user/commerce` 中的 ledger ID |
| `profileId` | 用户 ID | 应等于获奖用户 `profileId` |
| `userName` / `wechatOpenId` | 用户展示信息 | 用于后台页面定位 |
| `title` | 变动原因 | 发奖通常为 `榜单奖励：<category> 第<rank>名` |
| `delta` | 积分变化 | 等于 payout `points` |
| `kind` | 类型 | 发奖为 `ranking-reward` |
| `createdAt` | 时间 | 应与发奖时间接近 |

服务器侧 payout 只读查询：

```bash
cd /www/wwwroot/jiuzhuopanguan-git/backend
set -a
. ./.env
set +a
node <<'NODE'
const { initMomentsStore, readMomentsStore } = require('./data/moments')
const { initContentStore, readContentStore } = require('./data/content')

;(async () => {
  await Promise.all([initMomentsStore(), initContentStore()])
  const payoutId = '<ranking-reward-payout-id>'
  const profileId = '<winner-profile-id>'
  const momentsStore = readMomentsStore()
  const contentStore = readContentStore()
  const payout = (momentsStore.rankingRewardPayouts || []).find((item) => item.id === payoutId)
  const ledgers = (contentStore.userCommerce?.[profileId]?.pointsLedger || []).filter(
    (entry) => entry.kind === 'ranking-reward' && (!payout || entry.sourceId === payout.sourceId),
  )
  console.log(JSON.stringify({ payout, points: contentStore.userCommerce?.[profileId]?.points, ledgers }, null, 2))
  process.exit(0)
})().catch((error) => {
  console.error(error)
  process.exit(1)
})
NODE
```

payout 关键字段：

| 字段 | 含义 |
| --- | --- |
| `id` | payout ID，可写入 manifest `m5.rewardPayoutId` |
| `sourceId` | 幂等来源，格式 `ranking-reward:<date>:<category>:<momentId>:<ruleId>` |
| `category` / `date` | 榜单分类和发奖日期 |
| `momentId` / `sessionId` | 被奖励瞬间和所属聚会 |
| `profileId` / `profileName` | 获奖用户 |
| `rank` / `points` / `ruleId` | 命中的名次、积分和规则 |
| `status` | 正向发奖为 `granted`；重复发奖通常在接口返回中显示 `skipped` |
| `operator` | 发奖后台操作人 |
| `createdAt` / `updatedAt` | 发奖记录时间 |

当前线上样本只读证据（`PR-INT-DB-GENERATED-FIXTURE-RUN-006`）：

| 项 | 值 |
| --- | --- |
| sessionId | `session-1781584503517-c033e9` |
| rankingCategory | `best_opening` |
| rewardPayoutId | `ranking-reward-payout-1781584504234-5a8cb962` |
| payout sourceId | `ranking-reward:2026-06-16:best_opening:moment-1781584503741-d53b131f:reward-rule-best-opening-1` |
| winner profileId | `user-1781583974510-1a52e6` |
| payout points | `60` |
| host points after grant | `60` |
| host ranking ledger | `ledger-1781584504234-f8d759bf`，kind `ranking-reward`，delta `60` |
| memberB nomination ledger | `ledger-1781584504202-0eb017c5`，kind `moment-nomination`，delta `-10` |
| memberB points after nomination | `490` |

接口联调 helper 需求判断：

- 如果 `PR-INT-REWARD-REPORT-EXPIRED-SAMPLES-009` 只需要验证正向发奖、ledger、payout、积分变化和前台同步，现有 API/服务器侧只读脚本已够，不需要后端代码改动。
- 如果接口联调要求把 `rankingRewardPayouts` 通过公开 API 查询，需要新增只读后台 endpoint 或在 `commerce-ranking-rewards` 页面补 payout table；这是后续最小 helper，不应混入本任务。
- 如果接口联调要求自动生成 report / expired share task / dedicated reviewMomentId，当前线上 fixture 仍缺安全 helper，应另派后端/API补最小测试 helper，并明确鉴权、前缀、清理策略；不要在现有发奖查询任务里扩大实现。

后台/测试验收建议：

1. 后台页面点击发奖后，保存接口响应原文。
2. 后台复核 `commerce-point-ledger` 是否出现同一 ledger。
3. 测试用获奖用户 token 查 `/user/commerce`，记录 `points` 与 `ranking-reward` ledger。
4. 接口联调在服务器侧只读查询 payout，记录 `rankingRewardPayouts` 的 `id/sourceId/profileId/points/status`。
5. 前台复拍“我的积分/用户中心/积分流水”时，应看到同一用户积分余额变化；如果前端没有展示 ledger 明细，只能证明余额同步，不能证明 ledger UI 已覆盖。

后端/API当前状态：正向发奖后的 ledger / payout / 用户积分变化已有可复核查询口径；本任务不需要后端代码改动。仍待接口联调/后台/测试基于 `PR-INT-REWARD-REPORT-EXPIRED-SAMPLES-009` 产出最终复核证据。

## 31. `PR-BE-DEDICATED-REVIEW-SAMPLE-011` dedicated `reviewMomentId` 样本评估

记录时间：2026-06-16

本轮范围：只做后端/API职责内评估与命令口径；不改业务代码、不改 PM 总台账、不触碰 `pomer.cn` 官网项目。

背景：接口联调 009 已补正向发奖、report、expired，但仍缺 dedicated `reviewMomentId`。本轮正向候选已审核并用于发奖，不能替代 dedicated 待审核样本。

核查结论：

- 需要补一个独立待审核/审核候选 moment 样本。
- 现有 API 已支持，不需要后端代码改动。
- `POST /api/v1/sessions/:sessionId/moments` 创建新 moment 时默认 `reviewStatus=pending`、`secondaryReviewStatus=pending`。
- 只要不调用后台 `POST /api/v1/admin/moments/:momentId/review`，该样本会保持待审核状态，可作为 dedicated `reviewMomentId`。
- 新样本建议使用独立 `clientDraftId`，例如 `IT-MOMENTS-20260616-011-review-dedicated`；接口具备幂等逻辑，同一 session + uploader + clientDraftId 重跑会返回已有记录，降低重复造数风险。

当前线上样本状态只读核查：

| 字段 | 当前值 / 口径 |
| --- | --- |
| manifest session | `session-1781584503517-c033e9` |
| manifest `reviewMomentId` | 空 |
| `failedCandidateMomentId` | `moment-1781584503823-56dc9214`，已被后台 hide，不能作为待审核样本 |
| 正向发奖候选 | 已 approve 并用于榜单/发奖，不能替代 dedicated 待审核样本 |
| 现有 pending 样本 | 当前 session 中存在 pending highlight/private，但未回填到 `reviewMomentId`，且不是本轮 dedicated 明确样本 |

接口联调可复跑命令（服务器侧，避免公开完整 token）：

```bash
cd /www/wwwroot/jiuzhuopanguan-git/backend
set -a
. ./.env
. /www/backup/jiuzhuopanguan/pr-int-db-generated-fixture-run-006-20260616123313/tokens.env
set +a

node <<'NODE'
const fs = require('fs')

const baseUrl = 'https://api.pomer.cn/api/v1'
const manifestPath = '/www/backup/jiuzhuopanguan/pr-int-db-generated-fixture-run-006-20260616123313/int-data-001-online-manifest-private.json'
const sanitizedPath = '/www/backup/jiuzhuopanguan/pr-int-db-generated-fixture-run-006-20260616123313/int-data-001-online-manifest-sanitized.json'
const sessionId = 'session-1781584503517-c033e9'
const clientDraftId = 'IT-MOMENTS-20260616-011-review-dedicated'
const hostToken = process.env.INT_DATA_HOST_TOKEN
const tinyPngDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII='

const api = async (pathname, { method = 'GET', body } = {}) => {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-JZP-User-Token': hostToken,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload || payload.code !== 0) {
    throw new Error(`${method} ${pathname} failed: ${payload?.message || response.status}`)
  }
  return payload.data
}

;(async () => {
  const asset = await api('/moments/uploads/image', {
    method: 'POST',
    body: {
      sessionId,
      fileName: `${clientDraftId}.png`,
      dataUrl: tinyPngDataUrl,
    },
  })
  const moment = await api(`/sessions/${encodeURIComponent(sessionId)}/moments`, {
    method: 'POST',
    body: {
      clientDraftId,
      nodeType: 'highlight',
      caption: 'IT-MOMENTS-20260616-011 dedicated review pending sample',
      imageUrl: asset.url,
      tags: ['INT-DATA-001', 'review-dedicated'],
      visibility: 'session',
      usageConsent: {
        session: true,
        brief: false,
        share: false,
        ranking: false,
      },
    },
  })

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  manifest.moments.reviewMomentId = moment.id
  manifest.warnings = (manifest.warnings || []).filter((item) => !String(item).includes('reviewMomentId remains empty'))
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
  fs.chmodSync(manifestPath, 0o600)

  const sanitized = JSON.parse(JSON.stringify(manifest))
  for (const role of Object.keys(sanitized.profiles || {})) {
    const token = sanitized.profiles[role].token || ''
    sanitized.profiles[role].tokenTail = token.slice(-8)
    delete sanitized.profiles[role].token
  }
  fs.writeFileSync(sanitizedPath, `${JSON.stringify(sanitized, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
  fs.chmodSync(sanitizedPath, 0o600)

  console.log(JSON.stringify({
    ok: true,
    reviewMomentId: moment.id,
    reviewStatus: moment.reviewStatus,
    secondaryReviewStatus: moment.secondaryReviewStatus,
    rankingEligible: moment.rankingEligible,
    rewardEligible: moment.rewardEligible,
    manifestPath,
    sanitizedPath,
  }, null, 2))
})().catch((error) => {
  console.error(error)
  process.exit(1)
})
NODE
```

预期响应 / 验收口径：

| 字段 | 预期 |
| --- | --- |
| `reviewMomentId` | 新返回的 `moment-...` |
| `reviewStatus` | `pending` |
| `secondaryReviewStatus` | `pending` |
| `rankingEligible` | `false` |
| `rewardEligible` | `false` |
| `usageConsent.ranking` | `false` |

只读复核命令：

```bash
cd /www/wwwroot/jiuzhuopanguan-git/backend
set -a
. ./.env
set +a
node <<'NODE'
const { initMomentsStore, readMomentsStore } = require('./data/moments')

;(async () => {
  await initMomentsStore()
  const reviewMomentId = '<reviewMomentId>'
  const store = readMomentsStore()
  const moment = (store.momentRecords || []).find((item) => item.id === reviewMomentId)
  console.log(JSON.stringify({
    id: moment?.id,
    clientDraftId: moment?.clientDraftId,
    sessionId: moment?.sessionId,
    reviewStatus: moment?.reviewStatus,
    secondaryReviewStatus: moment?.secondaryReviewStatus,
    rankingEligible: moment?.rankingEligible,
    rewardEligible: moment?.rewardEligible,
    removedAt: moment?.removedAt,
  }, null, 2))
  process.exit(0)
})().catch((error) => {
  console.error(error)
  process.exit(1)
})
NODE
```

风险与边界：

- 不应复用已 approve / hide / 发奖的 moment 作为 dedicated `reviewMomentId`，否则后台/测试无法证明待审核入口独立覆盖。
- 创建 dedicated 待审样本后，不要再调用后台审核 action；如被后台误点 approve/hide，需要重新创建或用新 `clientDraftId` 补样本。
- 若接口联调只回填 manifest 字段而未做只读复核，后台/测试仍只能标记待复核。
- 当前不需要新增 helper；只有当接口联调要求“一键生成并回填所有 report/expired/review 样本”的固定工具时，才建议后续补最小 fixture helper，并严格限制前缀、manifest 路径和 cleanup 策略。

后端/API当前状态：

- dedicated `reviewMomentId` 需要补独立样本。
- 现有 API 已支持补样本和回填 manifest，不需要后端代码改动。
- 等待接口联调执行上述服务器侧命令并提供 `reviewMomentId`、pending/pending 只读证据、manifest JSON.parse 结果。

## 32. `PR-BE-LOCAL-FIXTURE-SERVICE-013` 本地 fixed data 服务只读核查

记录时间：2026-06-17

本轮范围：只做后端/API职责内只读判断；不线上写入、不 cleanup、不重启线上服务器、不触碰 `pomer.cn` 官网项目。

背景：PM 调试器截图 `docs/runtime/pm-devtools-debugger-window-20260617.png` 显示微信开发者工具预览框仍在请求本地 API：

- `GET http://127.0.0.1:3221/api/v1/sessions/live?... net::ERR_CONNECTION_REFUSED`
- `POST http://127.0.0.1:3221/api/v1/user/auth/login net::ERR_CONNECTION_REFUSED`

只读核查结果：

| 项 | 结果 |
| --- | --- |
| 3221 端口 | 当前无监听进程 |
| 本地健康检查 | `curl.exe -sS -i --max-time 5 http://127.0.0.1:3221/api/v1/config/home` 失败 |
| 错误原文 | `curl: (7) Failed to connect to 127.0.0.1 port 3221 after 2030 ms: Couldn't connect to server` |
| fixed data manifest | 存在 |
| manifest status 命令 | `npm.cmd --prefix backend run fixture:moments-integration -- --mode status --manifest docs/runtime/int-data-001-manifest.json` |
| manifest 摘要 | `ok:true`、`environment:"local"`、`sessionId:"session-1781507687012-e4343d"`、`warnings:[]` |

判断：

- 当前 `ERR_CONNECTION_REFUSED` 是本机 `127.0.0.1:3221` 服务未启动导致，不是后端路由合同缺失。
- 本地 fixed data 路线仍可用，但必须由接口联调或测试先显式启动 3221 服务，再让预览框使用 `runtime-api-base=http://127.0.0.1:3221/api/v1`。
- 如果本轮预览矩阵目标是线上开发阶段验收，不应继续请求本地 3221；测试/前端应清除或改写微信开发者工具 Storage 中的 `runtime-api-base`，使用默认线上 `https://api.pomer.cn/api/v1`。
- 本地 manifest token 只适用于本地 3221 fixed data，不得拿去请求 `api.pomer.cn`。

本地 fixed data 服务启动命令：

```powershell
cd F:\codexlist\jiuzhuopanguan
$env:PORT = '3221'
npm.cmd --prefix backend start
```

如需后台窗口保活，可由接口联调或测试用独立终端启动；后端/API本轮未启动该服务。

健康检查命令：

```powershell
curl.exe -sS -i --max-time 10 http://127.0.0.1:3221/api/v1/config/home
```

预期：

- HTTP 200
- 响应 JSON 包含 `code:0`

fixed data 只读检查命令：

```powershell
$manifest = Get-Content docs/runtime/int-data-001-manifest.json -Raw | ConvertFrom-Json
$token = $manifest.profiles.host.token
$sessionId = $manifest.session.sessionId
curl.exe -sS -i --max-time 10 `
  -H "X-JZP-User-Token: $token" `
  "http://127.0.0.1:3221/api/v1/sessions/$sessionId/timeline"
```

预期：

- HTTP 200
- 响应 JSON 包含 `code:0`
- timeline 返回当前 manifest 对应的节点

线上预览矩阵建议：

```javascript
// 微信开发者工具 Console
wx.removeStorageSync('runtime-api-base')
wx.getStorageSync('runtime-api-base') || 'https://api.pomer.cn/api/v1'
```

预期输出为 `https://api.pomer.cn/api/v1`。如果仍输出 `http://127.0.0.1:3221/api/v1`，预览框会继续打本地服务；在 3221 未启动时必然复现 `ERR_CONNECTION_REFUSED`。

下一步责任：

| 场景 | 下一步责任人 | 动作 |
| --- | --- | --- |
| 继续使用本地 fixed data | 接口联调负责人 / 测试执行人 | 启动 3221，本地健康检查通过后再设置 `runtime-api-base` 指向本地 |
| 使用线上预览矩阵 | 测试执行人 / 前端负责人 | 清除 `runtime-api-base` 或确认其为线上地址，Network host 应为 `api.pomer.cn` |
| 3221 启动后仍 404/401/500 | 后端/API负责人 | 基于新错误原文只读排查路由、manifest token 或数据文件 |
| 线上 `api.pomer.cn` 出错 | 接口联调 / 后端/API / DBA运维按任务边界处理 | 只面向 `api.pomer.cn`，不得触碰 `pomer.cn` 官网 |

后端/API当前状态：

- 本地服务启动命令和健康检查可交给接口联调/测试。
- 当前未启动本地 3221，未执行线上写入、cleanup 或服务器重启。
- PM 调试器里的本地请求失败应先由测试/前端确认当前预览矩阵目标：要么启动本地 fixed data 服务，要么清除 `runtime-api-base` 切回线上。

## 33. `PR-BE-DUAL-FLOW-SHARE-CONTRACT-014` 照片 + 聚会账本联合分享合同核查

记录时间：2026-06-17

本轮范围：只做后端/API职责内合同核查和最小后端建议；不改 PM 总进度、不改团队公告、不改派发队列；不线上写入、不 cleanup、不重启或部署；不触碰 `pomer.cn` 官网项目。

已读取材料：

- `AGENTS.md`
- `docs/party-recorder-redesign-requirements.md`
- `docs/gameplay-moments-progress-tracker.md`
- `docs/gameplay-moments-backend-development-plan.md`
- `docs/api-spec.md`
- `docs/business-flow.md`
- 后端/API代码：`backend/server.js`、`backend/data/moments.js`、`backend/data/admin.js`
- 当前调用侧证据：`miniprogram/services/operations.ts`、`miniprogram/pages/live-record/index.ts`、`miniprogram/pages/share-poster/index.ts`

需求判断：

`docs/party-recorder-redesign-requirements.md` 已明确“拍照记录”和“酒桌记账 / 聚会账本”必须双主线并存，并且一起进入分享页和分享截图保存。当前后端已有照片时间线、账本成员计数、离散事件、旧战报和分享图任务等能力，但合同层尚未形成一个稳定的“照片 + 账本高光”聚合响应。

### 现有接口能力矩阵

| 能力 | 现有接口/代码 | 当前结论 |
| --- | --- | --- |
| 创建/读取聚会房间 | `POST /api/v1/sessions`、`GET /api/v1/sessions/live`、`PUT /api/v1/admin/sessions/:sessionId` | 可承载聚会成员和账本计数；成员字段已有 `debtCount`、`drinkCount`、`clearedCount`、`wheelHistory` |
| 拍照/相册时间线 | `POST /api/v1/sessions/:sessionId/moments`、`GET /api/v1/sessions/:sessionId/timeline` | 可承载照片节点，并按审核/授权过滤用于分享 |
| 账本离散事件 | `POST /api/v1/sessions/:sessionId/events` | 可写入 `drink_debt`、`drink_add`、`wheel_result` 等事件；事件会合入 timeline，且当前分享图任务允许选中 event 节点 |
| 分享简报 | `POST /api/v1/sessions/:sessionId/brief`、`GET /api/v1/session-briefs/:briefId` | 可返回 timeline、开场/收尾/节点 ID、分享任务状态；缺少账本摘要、结算摘要、账本榜单聚合字段 |
| 分享图任务 | `POST /api/v1/session-briefs/:briefId/share-image-tasks`、`POST /api/v1/share-image-tasks/:taskId/process` | 可从 brief timeline 选照片和事件生成 PNG；当前 `layoutMode` 默认 `timeline`，渲染器未声明/验证双流账本区块 |
| 旧战报/结果页 | `POST /api/v1/reports`、`GET /api/v1/reports/:reportId`、`GET /api/v1/reports/:reportId/poster.png` | 可返回 `ranks[]`、`events[]` 并生成旧战报海报；与 moments brief/share task 是两条链路，尚未统一 |
| 榜单/积分 | `GET /api/v1/rankings/today`、积分任务/流水接口 | 当前是照片/瞬间提名和积分体系，不是从账本成员计数生成的酒桌账本榜单 |

### 可复用字段来源

| 分享内容 | 当前可复用来源 | 合同状态 |
| --- | --- | --- |
| 照片/相册高光 | `momentRecords` 经 `GET /sessions/:sessionId/timeline`、`sessionBrief.timeline.nodes` 返回；分享任务过滤已授权、审核通过、媒体完整节点 | 已有基础合同 |
| 欠酒 | 管理会话成员 `members[].debtCount` / `selectedPlayers[].debtCount`；离散事件可用 `sessionEvents.eventType = drink_debt`；旧战报可用 `report.ranks[].value/title` 表达 | 有数据来源，缺统一聚合字段 |
| 已喝 | 管理会话成员 `members[].drinkCount` / `selectedPlayers[].drinkCount`；当前没有专门的 `drink_done` eventType，主要靠成员计数表达 | 有计数字段，缺事件语义和分享聚合字段 |
| 加酒 | `POST /sessions/:sessionId/events` 的 `eventType = drink_add`；成员计数也可通过管理会话更新 | 有事件来源，缺摘要字段 |
| 关键事件 | `sessionEvents`、成员 `wheelHistory`、旧战报 `report.events[]` | 有多处来源，缺去重和排序后的高光聚合 |
| 结算摘要 | 旧战报 `report.ranks[]` / `report.events[]`，以及会话成员 `debtCount/drinkCount/clearedCount` 可计算 | 缺后端标准 `settlementSummary` |
| 账本榜单 | 旧战报 `report.ranks[]`，或从成员 `debtCount/drinkCount/clearedCount` 计算 | 缺后端标准 `ledgerRankings`，`/rankings/today` 不适合直接复用 |
| 分享页保存截图 | 旧链路 `GET /reports/:reportId/poster.png`；新链路 `shareImageTasks.imageUrl`，小程序保存 `readyShareImageUrl` 或 fallback canvas | 有保存链路，缺双流分享图渲染合同和样本证据 |

### 合同缺口

当前接口“可以让前端临时把照片 brief + 账本成员计数/旧战报拼在一起展示”，但不足以作为稳定后端合同宣布已完成双流分享，原因：

1. `sessionBrief` 响应没有 `ledgerSummary`、`ledgerHighlights`、`ledgerRankings`、`settlementSummary` 等字段，前端/测试无法只依赖 brief 判断账本是否进入分享。
2. `shareImageTask` 只记录 `layoutMode` 和 `selectedNodeIds`，未声明 `dual_flow`、`includeLedger`、`ledgerSnapshotId` 或类似字段；生成 PNG 的 `buildShareImageSvg` 当前只接收 `brief/task/nodes`，没有账本快照输入。
3. 旧 `reports/:id/poster.png` 和新 `session-briefs/:id/share-image-tasks` 是两条分享图链路；旧战报有榜单和事件，新分享图有照片 timeline，但合同未统一。
4. `/rankings/today` 是 moments 提名榜，不是账本成员榜；不能直接作为“欠酒/已喝/结算榜单”的后端证据。
5. 现有 fixture/接口联调样本已有 moments、report、expired、dedicated review 等样本，但没有“同一 session 同时包含照片节点 + 账本成员计数 + 账本事件 + 可生成分享图”的双流样本证据。

### 最小后端建议

若 PM 确认本轮必须让“照片 + 聚会账本高光”成为可验收后端合同，建议后端最小改动如下：

1. 在 `backend/data/moments.js` 增加只读聚合 helper，例如 `buildSessionLedgerSnapshot(sessionId)`，从管理会话成员、`sessionEvents`、必要时旧 `reports` 计算：
   - `ledgerSummary`: `totalDebtCount`、`totalDrinkCount`、`totalClearedCount`、`eventCount`、`updatedAt`
   - `settlementSummary`: `status`、`text`、`generatedFrom`
   - `ledgerRankings.debt` / `ledgerRankings.drink` / `ledgerRankings.cleared`
   - `ledgerHighlights[]`: 欠酒、已喝、加酒、转盘/关键事件高光
2. 将该快照挂入 `GET /api/v1/session-briefs/:briefId` 和 `POST /api/v1/sessions/:sessionId/brief` 响应，字段命名建议：

```json
{
  "ledgerSummary": {
    "totalDebtCount": 3,
    "totalDrinkCount": 5,
    "totalClearedCount": 2,
    "eventCount": 4,
    "updatedAt": "2026-06-17T00:00:00.000Z"
  },
  "settlementSummary": {
    "status": "open",
    "text": "3 人参与，仍有 3 条待处理记录，已完成 2 次消杯。",
    "generatedFrom": "session-members"
  },
  "ledgerRankings": {
    "debt": [{ "profileId": "profile-a", "name": "成员A", "value": 2 }],
    "drink": [{ "profileId": "profile-b", "name": "成员B", "value": 3 }]
  },
  "ledgerHighlights": [
    { "id": "event-1", "type": "drink_add", "title": "加酒记录", "targetName": "成员A", "value": 1, "createdAt": "2026-06-17T00:00:00.000Z" }
  ]
}
```

3. 扩展分享图任务合同：
   - 请求：`layoutMode: "dual_flow"` 或 `includeLedger: true`
   - 响应：保留 `selectedNodeIds`，增加 `ledgerIncluded: true`、`ledgerHighlightIds` 或直接引用 brief 内 `ledgerSummary`
   - 渲染：`processShareImageTask` 调用 `buildShareImageSvg` 时传入 `ledgerSnapshot`，PNG 必须同时包含照片节点和账本摘要/榜单区块。
4. 同步更新 `docs/api-spec.md`、`docs/business-flow.md`、后端 smoke/fixture；在有样本前不得把测试、前端或 PM 总进度写成通过。

### 接口联调样本需求

需要接口联调补一组专用双流样本，至少包含：

- 同一 `sessionId` 下 2 个及以上已授权、审核通过、媒体完整的 moment 照片节点。
- 同一 `sessionId` 下成员计数包含非零 `debtCount`、`drinkCount`、`clearedCount`。
- 至少 1 条 `drink_debt`、1 条 `drink_add`、1 条 `wheel_result` 或等价关键事件。
- `sessionBrief` 返回账本聚合字段。
- `shareImageTask` 使用 `dual_flow` 或 `includeLedger` 生成 ready PNG。
- 分享页保存使用该 ready PNG，而不是仅 fallback canvas 或旧 report poster。

后端/API当前状态：

- 现有接口“部分足以支撑”：照片、账本计数、账本事件、旧战报、分享图任务均有基础能力。
- 现有接口“不足以宣布完成”：缺统一账本聚合字段、缺双流分享图合同、缺专用联调样本和 PNG 证据。
- 如仅做临时前端拼装，后端可先不改代码，但风险是测试无法用单一接口/样本证明“照片 + 聚会账本高光”共同进入分享图。
- 如 PM 要求本轮可验收闭环，需要后端补最小聚合 helper 和分享任务合同，再由接口联调补双流样本。

## 34. `PR-BE-SHARE-FLOW-LEDGER-CONTRACT-016` 分享流程账本聚合字段合同与最小实现

记录时间：2026-06-17

本轮范围：后端/API 最小合同实现；不改 PM 总台账、团队公告、派发队列；不执行线上写入、cleanup、重启或部署；不触碰 `pomer.cn` 官网项目。

已读取材料：

- `AGENTS.md`
- `docs/party-recorder-redesign-requirements.md`
- `docs/gameplay-moments-progress-tracker.md`
- `docs/gameplay-moments-team-announcements.md`
- `docs/gameplay-moments-backend-development-plan.md`
- `docs/api-spec.md`
- `docs/gameplay-moments-interface-integration-test-plan.md` 3.25
- `docs/gameplay-moments-ui-ux-development-plan.md` 12.7.16
- `docs/gameplay-moments-ugc-risk-control-plan.md` 6.19
- 当前后端/API代码：`backend/data/moments.js`、`backend/server.js`、`backend/data/admin.js`

### 判断

前端理论上可以从现有接口自行聚合：

| 内容 | 前端可自行聚合来源 |
| --- | --- |
| 欠酒 | `sessions/live.joinedPlayers[].debtCount`，或 timeline `eventType=drink_debt` |
| 已喝 | `sessions/live.joinedPlayers[].drinkCount` |
| 加酒 | timeline `eventType=drink_add` |
| 关键事件 | timeline `eventType=wheel_result`，或 report `events[]` |
| 榜单高光 | report `ranks[]`，或 joinedPlayers 按 `debtCount/drinkCount/clearedCount` 排序 |
| 结算摘要 | joinedPlayers + timeline events + report 文案拼接 |

但不建议把分享流程 015/016 的稳定合同交给前端临时拼装，原因：

1. UI/UX 12.7.16 明确分享入口、预览、保存海报、回流查看都需要 `accountingHighlights`、`summary` 等稳定字段。
2. UGC 6.19 要求账本聚合默认脱敏、公开传播安全、过滤字段可审计；前端自行拼 joinedPlayers 容易把个人明细或完整 profile 误带到保存图。
3. 接口联调 3.25 已指出 015 样本虽可用，但缺 `ledgerSummary/accountingHighlights` 显式字段；继续让前端拼装会使测试无法用单一响应验收。
4. 后端 014 已确认缺统一聚合字段和双流分享图合同，016 应补最小后端字段，而不是继续只给口径。

### 本轮最小实现

已修改：

- `backend/data/moments.js`
  - 新增 `buildSessionLedgerSnapshot({ sessionId, timeline })`。
  - `POST /api/v1/sessions/:sessionId/brief` 响应追加：
    - `ledgerSummary`
    - `accountingHighlights`
    - `settlementSummary`
    - `ledgerRankings`
    - `eventHighlights`
    - `shareContentFilter`
  - `GET /api/v1/session-briefs/:briefId` 响应追加同一组字段。
  - `POST /api/v1/session-briefs/:briefId/share-image-tasks` 支持 `layoutMode=dual_flow` 或 `includeLedger=true`，任务返回 `ledgerIncluded=true`。
  - `processShareImageTask` 在 dual flow / includeLedger 场景下向分享 PNG 渲染器传入账本快照，并在 PNG 中渲染账本摘要区块。
- `docs/api-spec.md`
  - 补充 brief 聚合字段、空态规则、隐私/角色过滤口径、dual flow share task 请求字段。

### 字段合同

`ledgerSummary`：

```json
{
  "sessionId": "session-xxx",
  "participantCount": 3,
  "ledgerCount": 8,
  "debtCups": 2,
  "drunkCups": 3,
  "addWineCount": 1,
  "debtEventCount": 1,
  "clearedCups": 2,
  "keyEventCount": 1,
  "hasLedgerData": true,
  "visibilityScope": "public_summary",
  "generatedFrom": ["session-members", "timeline-events"],
  "updatedAt": "2026-06-17T00:00:00.000Z",
  "emptyText": "聚会账本还没开始，先记一笔。"
}
```

`accountingHighlights[]`：

```json
[
  { "type": "debt", "label": "待处理记录", "value": 2, "unit": "条", "text": "待处理记录 2条" },
  { "type": "drunk", "label": "完成记录", "value": 3, "unit": "条", "text": "完成记录 3条" },
  { "type": "add_wine", "label": "加酒记录", "value": 1, "unit": "条", "text": "加酒记录 1条" },
  { "type": "cleared", "label": "已消记录", "value": 2, "unit": "条", "text": "已消记录 2条" }
]
```

`settlementSummary`：

```json
{
  "status": "open",
  "text": "本场已记录 8 条账本高光，还有 2 条待处理记录。",
  "generatedFrom": "session-members+timeline-events",
  "safeForPublic": true
}
```

`ledgerRankings`：

```json
{
  "debt": [{ "rank": 1, "displayName": "成员1", "value": 2 }],
  "drink": [{ "rank": 1, "displayName": "成员2", "value": 3 }],
  "cleared": []
}
```

`eventHighlights[]`：

```json
[
  { "id": "event-xxx", "type": "drink_add", "text": "新增一条加酒记录", "createdAt": "2026-06-17T00:00:00.000Z" }
]
```

`shareContentFilter`：

```json
{
  "allowedNodeIds": ["moment-xxx", "event-xxx"],
  "filteredNodeIds": ["moment-private"],
  "filteredNodes": [{ "nodeId": "moment-private", "nodeKind": "moment", "reason": "private_or_not_visible" }],
  "notice": "仅展示已授权且审核通过的公开内容；私密、待审、待补图和未授权内容不会进入分享图。"
}
```

空态规则：

- 无成员计数、无账本事件时：`ledgerSummary.hasLedgerData=false`、`ledgerCount=0`、`settlementSummary.status=empty`。
- `accountingHighlights` 固定返回四项，值为 0 时给空态文案，前端仍应显示账本模块和“先记一笔”入口。
- `ledgerRankings.debt/drink/cleared` 无数据时为空数组。

隐私/角色过滤口径：

- 聚合字段默认 `visibilityScope=public_summary`，仅返回聚合数值、中性文案、脱敏 `displayName`，不返回完整 `profileId`、token、手机号、points ledger 或个人明细。
- 完整成员账本仍由成员态页面从 `sessions/live.joinedPlayers` 读取，不进入公开分享字段。
- 照片节点仍沿现有服务端过滤：私密、待审、待补图、未授权分享、hidden / removed 不进入 `allowedNodeIds` 和分享 PNG。

### 可执行验证命令

语法检查：

```powershell
node --check backend/data/moments.js
node --check backend/server.js
```

只读函数级验证：

```powershell
node -e "const fs=require('fs'); const m=JSON.parse(fs.readFileSync('docs/runtime/int-data-001-manifest.json','utf8')); const {getSessionBrief}=require('./backend/data/moments'); const brief=getSessionBrief({briefId:m.brief.briefId, profile:{id:m.profiles.host.profileId, name:m.profiles.host.name}}); console.log(JSON.stringify({ledgerSummary:brief.ledgerSummary, accountingHighlights:brief.accountingHighlights, settlementSummary:brief.settlementSummary, eventHighlights:brief.eventHighlights, filter:{allowed:(brief.shareContentFilter.allowedNodeIds||[]).length, filtered:(brief.shareContentFilter.filteredNodeIds||[]).length}}, null, 2));"
```

HTTP 联调复跑建议：

```powershell
$manifest = Get-Content docs/runtime/int-data-001-manifest.json -Raw | ConvertFrom-Json
$token = $manifest.profiles.host.token
$briefId = $manifest.brief.briefId
curl.exe -sS -H "X-JZP-User-Token: $token" "http://127.0.0.1:3221/api/v1/session-briefs/$briefId"
```

dual flow 分享图任务复跑建议：

```powershell
$body = @{ layoutMode = 'dual_flow'; includeLedger = $true } | ConvertTo-Json
curl.exe -sS -X POST `
  -H "Content-Type: application/json" `
  -H "X-JZP-User-Token: $token" `
  -d $body `
  "http://127.0.0.1:3221/api/v1/session-briefs/$briefId/share-image-tasks"
```

若返回新 `taskId`，本地同步处理：

```powershell
curl.exe -sS -X POST -H "X-JZP-User-Token: $token" "http://127.0.0.1:3221/api/v1/share-image-tasks/<taskId>/process"
```

接口联调 015 线上样本复跑时，需用 3.25 的 `brief-1781584503870-25d5edac`、`share-task-1781685446105-ae6b6317`、015 事件和 session 账本计数复核上述字段；本轮未线上写入、未部署，因此线上 `api.pomer.cn` 需等待部署/联调窗口后才能出现新字段。

### 本轮验证结果

- `$PSVersionTable.PSVersion.ToString()`：`7.6.2`
- `node --check backend/data/moments.js`：通过
- `node --check backend/server.js`：通过
- 只读函数级验证：`getSessionBrief` 已返回 `ledgerSummary/accountingHighlights/settlementSummary/eventHighlights/shareContentFilter`。
- 当前本地 manifest 样本摘要：`ledgerSummary.ledgerCount=1`、`debtCups=1`、`accountingHighlights[0].value=1`、`settlementSummary.status=open`、`shareContentFilter.allowed=2`、`filtered=3`。

后端/API当前状态：

- 本轮已改后端代码和 API 文档，解决“没有稳定账本聚合字段”的合同缺口。
- 本轮未部署、未线上写入、未 cleanup、未重启服务器；线上 `api.pomer.cn` 暂不具备新字段，需后续按运维/PM 授权发布。
- 仍需接口联调用 015 联合样本复跑 HTTP 响应和 dual flow ready PNG；前端需接入字段并提供 page data 摘要；测试需补分享页/保存图截图、PNG 原图、A/B/C/outsider 或未登录视角证据。

## 35. `PR-PM-ROLE-READING-SCOPE-020` / 分享页最高优先级边界通知记录

记录时间：2026-06-17

本轮范围：只记录 PM 全员通知和后端/API后续触发条件；不改业务源码、不改 API 合同、不改 PM 总台账、团队公告或派发队列；不线上写入、不 cleanup、不重启或部署；不触碰 `pomer.cn` 官网项目。

已按精准阅读规则读取：

- `AGENTS.md`
- PM 最新证据段：`docs/gameplay-moments-progress-tracker.md` 中 `2026-06-17` 分享页协作门禁与 `PR-PM-ROLE-READING-SCOPE-020`
- 最新后端派工行：`PR-BE-SHARE-FLOW-LEDGER-CONTRACT-016`、`PR-BE-DUAL-FLOW-SHARE-CONTRACT-014`
- 后端已有记录：本计划第 33、34 节

收到的边界通知：

- 分享页和分享截图保存是当前最高优先级页面。
- 酒桌记账 / 聚会账本必须与拍照流程并存，并共同导出到分享页和分享截图保存。
- 前端不得沿用旧框架，不得为视觉复刻破坏既有数据结构、接口合同或真实字段来源。
- 后端/API在 016 已补最小账本聚合合同后，不主动扩大实现范围。
- 后端/API后续只在接口联调、前端或测试以明确错误原文 / 字段缺口 / 合同不匹配证据退回时响应。
- 不得触碰 `pomer.cn` 官网项目；涉及线上后端操作仍只限 `api.pomer.cn` / `jiuzhuopanguan`，并需记录目标、命令、证据、回滚/清理口径。

后续触发条件：

| 触发来源 | 需要提供的证据 | 后端/API响应边界 |
| --- | --- | --- |
| 接口联调退回 | 015/020 样本的 HTTP 响应原文、`briefId/taskId/sessionId`、脱敏 token 后 8 位、缺失字段名 | 只修 `ledgerSummary/accountingHighlights/settlementSummary/shareContentFilter` 等合同缺口或给出字段来源说明 |
| 前端退回 | 页面实际消费字段、接口响应片段、无法映射的字段名、不能破坏数据结构的约束 | 只调整后端字段兼容或补文档；不替前端重构页面 |
| 测试退回 | 微信开发者工具预览框 Console/Network/storage 摘要、失败截图、接口状态码、响应原文 | 只处理后端/API错误；若是旧视觉壳、布局或保存按钮问题，转前端/UI/UX |
| UGC退回 | 泄露字段、局外/未登录访问证据、私密/待审/hidden/needs_media 进入分享的节点 ID | 只处理服务端过滤和脱敏合同；不替 UGC 写准出 |
| 运维/PM授权发布 | 明确目标为 `api.pomer.cn` / `jiuzhuopanguan`、发布窗口、备份/回滚、验证命令 | 仅按授权范围配合发布或验证；不得触碰 `pomer.cn` 官网 |

当前后端/API状态：

- 已收到分享页最高优先级和精准阅读规则通知。
- 本轮不写完成、不写上线通过、不新增代码。
- 下一步等待接口联调/前端/测试基于 015/020 的明确字段合同退回或线上发布授权。

## 36. `PR-BE-SHARE-FLOW-PUBLIC-RETURN-CONTRACT-024` 公开回流安全分享摘要合同

记录时间：2026-06-17

本轮范围：只改后端/API源码、`docs/api-spec.md` 和本后端计划；不改 PM/测试/UIUX/UGC/接口联调文档，不替任何角色写通过；不线上写入、不 cleanup、不重启、不部署；不触碰 `pomer.cn` 官网项目。目标服务限定为 `api.pomer.cn` / `jiuzhuopanguan`，本轮仅本地实现与验证，线上需 DBA/运维发布后生效。

已按精准阅读规则读取：

- `AGENTS.md`
- 本计划第 34 / 35 节
- `docs/gameplay-moments-interface-integration-test-plan.md` 3.30
- `docs/api-spec.md` 中 `/sessions/live`、`/session-briefs/:briefId` 和分享图任务段
- `docs/runtime/ai-thread-dispatch-queue.md` 最新 024 行

### 结论

应在公开回流接口 `GET /api/v1/sessions/live?sessionId=...&inviteCode=...` 返回安全分享摘要。

理由：

1. 接口联调 3.30 已证明成员态 brief 有足够字段，但公开回流 live 不返回 `photoHighlights/shareContentFilter/eventHighlights/visibleNodes/permissionState`。
2. `share-preview` 是公开邀请回流入口，长期只靠前端从成员态 brief 临时推导，会让 no-token / outsider / public 的权限口径不稳定。
3. 后端可以在 live 响应中只追加脱敏、过滤后的公开摘要，不破坏已有 `joinedPlayers`、`joinStatusPlayers`、`sessionName` 等结构。
4. brief / task 成员态合同仍保持不变，公开 live 只给可公开传播摘要，不开放完整 timeline 或成员态节点。

### 本轮最小实现

已修改：

- `backend/data/moments.js`
  - 新增 `getPublicSessionShareSummary({ sessionId, inviteCode })`。
  - 从 `moments-store` 只筛选已授权分享、审核通过、媒体完整、非私密的公开照片节点。
  - 复用 016 的账本聚合和分享过滤口径。
  - 对公开 `visibleNodes` / event 摘要做脱敏，不返回操作者、目标人、profileId 或原始 caption。
- `backend/data/front.js`
  - `getLiveSessionConfig(sessionId, inviteCode)` 在找到 session 时追加公开安全摘要字段。
  - 原有 live session 字段保持兼容。
- `docs/api-spec.md`
  - 补 `/sessions/live` 公开回流字段合同和过滤口径。

### 字段合同矩阵

| 字段 | `/sessions/live` 公开返回 | 成员态 brief 返回 | 说明 |
| --- | --- | --- | --- |
| `photoHighlights` | 返回 | 可从 `timeline.nodes` 推导 | 公开最多 6 条，仅含审核通过、授权分享、媒体完整、非私密照片 |
| `accountingHighlights` | 返回 | 返回 | 聚合账本高光，公开安全 |
| `ledgerSummary` | 返回 | 返回 | `visibilityScope=public_summary`，不含个人明细 |
| `eventHighlights` / `keyEvents` | 返回 | 返回 | 公开为中性文案，不含操作者/目标人 |
| `shareContentFilter` | 返回 | 返回 | 含 `allowedNodeIds/filteredNodeIds/filteredNodes/notice` |
| `filteredNodeIds` | 返回 | 可从 `shareContentFilter` 读取 | 便捷镜像字段 |
| `visibleNodeIds` | 返回 | 可从 allowed nodes 映射 | 公开可展示节点 ID |
| `visibleNodes` | 返回脱敏摘要 | 成员态可用完整 timeline | 公开 event 不含 target/operator/caption |
| `permissionState` | 返回 `public` | 成员态仍由 HTTP 200/403/401 表达 | 供 share-preview page data 稳定消费 |
| `publicAccessState` | 返回 | 不要求 | `state=public_invite`、`canViewPublicShare=true`、`canViewMemberBrief=false` |

### 风险过滤口径

公开 live 不得返回：

- private / selected / 私密占位节点。
- pending、未二审、hidden / removed、needs_media、require_resubmit、未授权分享节点。
- 完整 `profileId`、token、手机号、openId、unionId、points ledger、完整成员敏感账本。
- event 的 `operatorName`、`operatorProfileId`、`targetName`、`targetProfileId`、原始 caption。

公开 live 可返回：

- 已授权公开照片缩略信息：`id/imageUrl/nodeType/title/createdAt`。
- 聚合账本摘要：`ledgerSummary/accountingHighlights`。
- 中性关键事件：`eventHighlights/keyEvents`。
- 过滤摘要：`shareContentFilter/filteredNodeIds/visibleNodeIds/visibleNodes`。
- 权限摘要：`permissionState/publicAccessState`。

### 验证命令

语法检查：

```powershell
node --check backend/data/moments.js
node --check backend/data/front.js
node --check backend/server.js
```

本地函数级 smoke：

```powershell
node -e "const fs=require('fs'); const m=JSON.parse(fs.readFileSync('docs/runtime/int-data-001-manifest.json','utf8')); const {getLiveSessionConfig}=require('./backend/data/front'); const s=getLiveSessionConfig(m.session.sessionId,m.session.inviteCode); console.log(JSON.stringify({sessionId:s.id, inviteCode:s.inviteCode, photoHighlights:(s.photoHighlights||[]).map(x=>x.id), accountingHighlights:(s.accountingHighlights||[]).map(x=>({type:x.type,value:x.value})), ledgerSummary:s.ledgerSummary, eventHighlights:(s.eventHighlights||[]).map(x=>({id:x.id,type:x.type})), filteredNodeIds:s.filteredNodeIds, visibleNodeIds:s.visibleNodeIds, permissionState:s.permissionState, publicAccessState:s.publicAccessState}, null, 2));"
```

本地 HTTP smoke，需 3221 服务启动后由接口联调/测试执行：

```powershell
curl.exe -sS -i "http://127.0.0.1:3221/api/v1/sessions/live?sessionId=<sessionId>&inviteCode=<inviteCode>"
```

线上 HTTP smoke，需 DBA/运维发布本后端代码到 `api.pomer.cn` 后执行：

```powershell
curl.exe -sS -i "https://api.pomer.cn/api/v1/sessions/live?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T"
```

预期字段摘要：

- HTTP 200。
- `photoHighlights.length >= 1`，015 样本预期应包含公开照片高光。
- `accountingHighlights.length=4`。
- `ledgerSummary.visibilityScope=public_summary`。
- `eventHighlights` / `keyEvents` 返回中性文案。
- `shareContentFilter.filteredNodeIds` 存在。
- `visibleNodeIds` / `visibleNodes` 存在。
- `permissionState=public`。
- `publicAccessState.state=public_invite`。

### 本轮验证结果

- `node --check backend/data/moments.js`：通过。
- `node --check backend/data/front.js`：通过。
- `node --check backend/server.js`：通过。
- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- `npm.cmd run typecheck`：通过。
- `git diff --check -- backend/data/front.js backend/data/moments.js docs/api-spec.md docs/gameplay-moments-backend-development-plan.md`：通过；仅提示 LF/CRLF 转换 warning，无空白错误。
- 本地函数级 smoke：基于 `docs/runtime/int-data-001-manifest.json` 返回：
  - `photoHighlights=["moment-1781507687032-eb1806a4"]`
  - `accountingHighlights` 四项存在，debt value 为 `1`
  - `ledgerSummary.visibilityScope=public_summary`
  - `eventHighlights` 含 `drink_debt`
  - `filteredNodeIds` 3 条
  - `visibleNodeIds` 包含公开 moment 和 event
  - `permissionState=public`
  - `publicAccessState.state=public_invite`

后端/API当前状态：

- 本轮为“最小实现 / 待发布”。
- 代码已在本地完成，未部署到 `api.pomer.cn`；线上 024 样本仍需 DBA/运维发布后复跑。
- 前端 024 临时推导可作为发布前兜底，但后端正式合同已提供；发布后前端应优先消费 `/sessions/live` 的公开回流字段。
- 测试需要新增 024 复测点：公开 live 字段摘要、share-preview page data、局外/未登录不会拿到成员态 brief/task、公开字段不泄露私密/待审/hidden/needs_media/未授权节点。

## 37. PR-BE-SHARE-GENERATED-PNG-RENDERER-028：分享生图来源只读核查与后端触发条件

时间：2026-06-17

本节只记录后端/API 条件派工的只读核查结论。PM 队列 028 明确要求接口联调先定位当前坏图来源，在接口联调或前端证据确认后端 ready PNG 是实际保存/分享图来源前，后端不抢先修改 renderer，不写完成、不写上线通过。

### 已读范围

- `AGENTS.md`
- PM 队列 028 行：`PR-UX-SHARE-GENERATED-IMAGE-UI-MISMATCH-028-REDLINE`、`PR-FE-SHARE-GENERATED-IMAGE-UI-MISMATCH-028`、`PR-INT-SHARE-GENERATED-PNG-SOURCE-028`、`PR-BE-SHARE-GENERATED-PNG-RENDERER-028`
- 后端 PNG/share task 相关代码：`backend/data/moments.js` 的 `buildShareImageSvg`、`processShareImageTask`
- 后端计划 36 节附近的公开分享回流字段合同

### 当前责任判断

当前结论：条件待办 / 只读核查完成 / 暂不改后端代码。

后端存在 ready PNG 渲染链路：

- `POST /api/v1/share-image-tasks/:taskId/process`
- `processShareImageTask({ taskId, profile })`
- `buildShareImageSvg({ brief, task, nodes, ledgerSnapshot })`
- `sharp(Buffer.from(svg)).png().toBuffer()`
- 输出 `/uploads/moments/share-tasks/<taskId>.png`

但 PM 队列 028 同时要求接口联调 `PR-INT-SHARE-GENERATED-PNG-SOURCE-028` 先只读定位坏图来自后端 ready PNG、前端 canvas fallback 还是旧缓存。当前尚未看到接口联调 028 或前端 028 给出“用户截图里的实际保存图等于后端 `/uploads/moments/share-tasks/<taskId>.png`”的证据，因此本轮不改 renderer。

### 后端 renderer 风险点

只读代码核查发现，若最终确认当前保存/分享图确实使用后端 ready PNG，现有 renderer 需要最小修：

- 视觉仍是红橙 hero 壳，不符合 UI 015/020 的照片墙 + 聚会账本 + 时间线 + 总结/安全区方向。
- 标题存在 `今晚精彩瞬间`、默认 `酒局时间线简报`，不符合新版“聚会记录师”对外文案。
- event 行 fallback 使用 `判官`，不适合作为公开分享图文案。
- 图片解析失败时会画空色块，容易形成空白照片洞。
- `dual_flow` 只展示最多 3 张照片、1 条时间线，可能导致账本下沉、时间线截断或大留白。

以上是后端代码风险，不等同于已经确认线上用户截图来源为后端 ready PNG。

### 后端改代码触发条件

满足任一证据后，后端/API 才进入最小实现：

1. 接口联调 028 给出 URL/hash/mtime/尺寸/HTTP 头证据，证明坏图文件是 `https://api.pomer.cn/uploads/moments/share-tasks/<taskId>.png` 或本地同路径 ready PNG。
2. 前端 028 证据显示保存/分享最终 `posterImagePath` 或下载源直接取 `shareImageTask.imageUrl` / `readyShareImageUrl`。
3. task 字段显示 `status=ready`、`imageUrl=/uploads/moments/share-tasks/<taskId>.png`、`layoutMode=dual_flow` 或 `ledgerIncluded=true`，且截图内容与该 PNG 一致。

触发后最小后端修复范围：

- 只改 `backend/data/moments.js` 的 `buildShareImageSvg` 及必要 helper。
- 去掉旧红色战报壳、旧“酒局”文案、英文/内部样本名、`判官` fallback。
- 改为新版公开分享安全图：照片墙、聚会账本摘要、关键时间线、总结/安全区。
- 图片缺失时不画空白洞，改为短空态或收缩布局。
- 输出字段和 URL 继续兼容既有 share task，不破坏 `/sessions/live`、brief、report 合同。
- 本地验证后标记“待 DBA/运维发布”，不得自行部署或重启。

### 非后端责任分流

- 若接口联调证明坏图来自前端 canvas fallback 或前端选择旧 URL：转前端 028，后端不改代码。
- 若证明坏图来自浏览器/微信缓存或旧 task 文件：转接口联调/前端确认刷新、重新生成或缓存失效口径；后端仅在新 task 仍生成坏图时介入。
- 若产品决定后端 ready PNG 不再作为公开保存图：需在后端/API 合同写清 `shareImageTask.imageUrl` 只作状态/兼容字段，前端保存图必须使用前端 015/020 canvas 输出；同时不得把坏 ready PNG 暴露为公开可分享主图。

### 接口联调可复跑只读命令

确认静态 PNG 响应头：

```powershell
curl.exe -sS -I "https://api.pomer.cn/uploads/moments/share-tasks/<taskId>.png"
```

下载后计算 hash 和尺寸，文件名不要包含 token：

```powershell
curl.exe -sS -o .\tmp-share-task-028.png "https://api.pomer.cn/uploads/moments/share-tasks/<taskId>.png"
Get-FileHash .\tmp-share-task-028.png -Algorithm SHA256
```

task 字段只读核查需由接口联调使用已有授权方式执行，不输出完整 token，仅记录 token 后 8 位、状态码、`status/imageUrl/layoutMode/ledgerIncluded/updatedAt/finishedAt` 字段摘要。

### 本轮验证

- 未改后端源码，未生成 PNG，未做线上写入、部署、重启或 cleanup。
- `$PSVersionTable.PSVersion.ToString()`：`7.6.2`。
- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- `git diff --check -- docs/gameplay-moments-backend-development-plan.md`：该文件当前为未跟踪文件，普通 diff 无输出。
- `git diff --no-index --check -- <empty> docs/gameplay-moments-backend-development-plan.md`：通过；仅有 LF/CRLF warning，无空白错误。

## 38. PR-BE-SHARE-GENERATED-PNG-RENDERER-029-CONFIRMED：后端 ready PNG renderer 实修

时间：2026-06-17

接口联调 3.31 已补齐责任证据：线上 ready PNG `https://api.pomer.cn/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png` 本体确认为后端旧 renderer 输出，HTTP 200，900x1400，121623 bytes，SHA256 `D5214EF75165B27593B37CB03FAB681DD6CA7B640E1193B1FA398D129DDA30D4`，图面含 `今晚精彩瞬间 / 酒局时间线简报 / dual_flow / 空白照片洞 / IT-MOMENTS / PR Seed Host` 等旧布局旧文案。本节进入实修，不再停留在 028 的条件等待。

### 已读范围

- `AGENTS.md`
- 后端计划 37 节
- 接口联调计划 3.31
- UI/UX 计划 12.7.23
- `docs/design-assets/party-recorder/share-flow-015/ASSET_SPEC_020.md`
- PM 队列 029 行
- `backend/data/moments.js` 的 `buildShareImageSvg`、`processShareImageTask`、图片解析和 share task 默认标题

### Renderer 口径

本轮选择实修后端 ready PNG renderer，不废弃 `shareImageTask.imageUrl` 公开用途。接口合同保持兼容：ready task 仍返回 `/uploads/moments/share-tasks/<taskId>.png`，但发布后新生成 / 重新生成的 PNG 不得再输出旧红色战报壳。

新 renderer 输出口径：

- 保持既有 `900x1400` PNG 尺寸，避免破坏前端和接口联调的静态资源合同。
- 视觉改为 015/020 方向的暗色聚会分享舞台。
- 上半区：标题 `今晚聚会高光`、聚会副标题、照片墙。
- 照片区：只渲染成功解析且信息量足够的照片；图片拉取失败或近似纯色时不画空白洞，改为短空态和拍照 CTA。
- 中段：聚会账本 4 项霓虹高光，复用 `accountingHighlights/ledgerSummary`。
- 下段：最多 3 条关键时刻，使用中性中文事件文案，不暴露操作者、目标人或内部 ID。
- 总结区：使用安全中文聚会总结，不输出测试种子名。
- 底部安全区：展示房间码、授权公开提示和 `聚会记录师`，不贴边、不被截断。

### 改动文件

- `backend/data/moments.js`
  - 新增海报文案清洗：过滤 `IT-MOMENTS`、`PR Seed`、`dual_flow`、内部 ID、fixture/sample/test 等内部字段。
  - `buildShareImageSvg` 重写为暗色海报结构：照片墙、账本高光、关键时刻、聚会总结、房间码/隐私安全区。
  - event / moment 文案改为用户可读中文，不再使用 `判官`、成员真实样本名、caption 或 task layout 原始枚举。
  - `resolveImageDataUri` 增加低信息量图片检测，避免成功加载但近似纯色的图片被当成照片墙，形成空白照片洞。
  - brief 默认标题由 `酒局时间线简报` 改为 `聚会时间线简报`；历史线上旧 brief 仍由 renderer 清洗兜底。
  - 导出 `_buildShareImageSvgForTest` 作为本地 smoke 入口，不新增线上 API。

### 本地 PNG 证据

本轮未触碰线上、不重新 process 线上样本、不覆盖 028 证据 PNG。本地 smoke 使用仓库数据和 synthetic ledger snapshot 生成：

| 项 | 结果 |
| --- | --- |
| 本地 PNG | `C:\Users\Administrator\AppData\Local\Temp\pr-be-share-generated-png-renderer-029-local.png` |
| 尺寸 | `900 x 1400` |
| 文件大小 | `165666` bytes |
| SHA256 | `0844B3C7EEBD23D9B72D804E1853933234A0C62329FE14EA0C568DB2F3FF2334` |
| 旧词扫描 | `containsOldCopy=false`，扫描词：`今晚精彩瞬间 / 酒局时间线简报 / dual_flow / PR Seed / IT-MOMENTS / 判官` |
| 目检摘要 | 暗色聚会分享舞台；照片空态为中文 CTA；账本 4 项、3 条关键时刻、总结、房间码和授权提示均在画布内；未见旧红色战报壳、英文枚举、内部样本名或底部截断。 |

注意：本地 smoke 的照片区走空态，是因为本地 fixture 图片被低信息量检测过滤。测试不能把空态当作“照片 + 聚会账本联合分享完成”；发布后仍需使用 015/017/024 样本中真实授权照片复测。

### 验证命令与结果

```powershell
node --check backend/data/moments.js
node --check backend/server.js
npm.cmd run check:encoding
git diff --check -- backend/data/moments.js
git diff --no-index --check -- <empty> backend/data/moments.js
git diff --no-index --check -- <empty> docs/gameplay-moments-backend-development-plan.md
```

结果：

- `node --check backend/data/moments.js`：通过。
- `node --check backend/server.js`：通过。
- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- `git diff --check -- backend/data/moments.js`：通过。
- 由于 `backend/data/moments.js` 和本计划文件当前在工作树中显示为未跟踪文件，已追加 `git diff --no-index --check -- <empty> <file>` 目标检查：两项均通过；仅有 LF/CRLF warning，无空白错误。
- 本地 PNG smoke：通过，见上方 PNG 证据。

### 发布与复核口径

当前状态：本地最小实现完成 / 待 DBA/运维发布。

未执行：

- 未部署到 `api.pomer.cn`。
- 未重启后端服务。
- 未触碰 `pomer.cn` 官网。
- 未清理、覆盖或重新生成线上 028 证据 PNG。

DBA/运维发布后，接口联调 / 测试需要复核：

1. 新建或重新处理一个 `ledgerIncluded=true` 的 share task，记录 taskId、PNG URL、HTTP 头、mtime、尺寸、bytes、SHA256。
2. 新 PNG 图面不得再出现旧红色战报壳、`今晚精彩瞬间`、`酒局时间线简报`、`dual_flow`、`IT-MOMENTS`、`PR Seed Host`、`判官`、空白照片洞、大面积留白或时间线截断。
3. 使用真实授权照片样本验证照片墙；若照片仍为空态，必须区分“确无可公开照片”与“字段/图片解析失败”，不得把空态写成联合分享完成。
4. 继续验证公开过滤：private、hidden、needs_media、待审、未授权分享节点不得进入 PNG。

## 39. PR-BE-CLEAN-SLATE-001：后端/API旧污染只读盘点与新合同草案

时间：2026-06-18

任务来源：PM 已发布 `docs/party-recorder-clean-slate-reset-plan.md`，用户要求重新建立“聚会记录师”并清空旧项目污染。本节仅做后端/API只读盘点和合同草案；未删除文件、未清理 store、未写线上、未重启服务、未触碰 `pomer.cn` 官网。

### 已读范围

- `AGENTS.md`
- `docs/party-recorder-clean-slate-reset-plan.md`
- `backend/server.js`
- `backend/data/admin.js`
- `backend/data/admin-store.json`
- `backend/data/content-store.json`
- `backend/data/moments-store.json`
- `backend/data/content.js`
- `backend/data/commerce.js`
- `backend/data/front.js`
- `backend/data/moments.js`
- `backend/scripts/*smoke*`、`backend/scripts/prepare-moments-integration-fixture.js`
- `backend/public/admin/static/heatwave-ops/*`
- `docs/runtime/int-data-001-manifest*.json`、旧 admin/ranking/share 证据目录

### 旧接口保留/废弃表

| 接口/合同 | 当前来源 | Clean Slate 判断 | 处理建议 |
| --- | --- | --- | --- |
| `GET /api/v1/user/judge-stats` | `backend/server.js` + `content-store` | 用户可见必须废弃 | 不进入新主链路；如需兼容仅返回 410/空壳或内部迁移期隐藏接口。 |
| `GET /api/v1/reports/featured`、`/reports/history`、`/reports/:id`、`/reports/:id/poster.png`、`POST /api/v1/reports` | `backend/server.js` + `admin-store.reports` + `renderReportPosterPng` | 用户可见“战报/report poster”必须废弃 | 新合同改为 `brief` / `share image`；旧 report 只可作为内部归档数据，前端不得再消费。 |
| `/static/report-poster.png` | `backend/server.js` 静态资源映射 | 必须废弃 | 替换为新版 share poster 资产或移除公开入口；删除前需备份静态文件。 |
| `GET /api/v1/rankings/today` | `backend/server.js` + `moments.js` nomination/ranking | 默认主链路废弃，内部可选归档 | 不作为第一阶段公开功能；若保留，改名为内部运营榜，不得出现“今日最欠酒/榜单奖励”。 |
| `POST /api/v1/moments/:id/nominations`、`GET /nomination-eligibility` | `moments.js` | 用户可见废弃 | 积分推举不进入 Clean Slate MVP；旧 `momentNominations` 归档。 |
| `POST /api/v1/admin/ranking-rewards/grant` | `server.js` + `admin.js` + `moments.js` | 废弃 | 停止公开后台使用；ranking reward payout 只保留备份。 |
| `GET/PUT /api/v1/admin/config/points`、`POST /points/tasks/:id/claim`、`POST /points/rewards/:id/redeem`、`GET /user/commerce` | `content.js`、`commerce.js` | Clean Slate MVP 不保留用户可见 | 会员/积分/商城从新产品主链路移出；内部字段可暂存，用户可见入口废弃。 |
| `GET /api/v1/config/templates`、`PUT /admin/config/templates`、`POST /templates/:id/unlock` | `content.js` + old template config | 旧玩法模板废弃 | 新建 party preset 只服务“聚会记录”场景，不再叫酒局/惩罚模板。 |
| `GET /api/v1/questions/catalog`、后台 `content-question-bank` | `server.js` + `admin-store.questionBank` | 废弃 | 题库/惩罚玩法不进入新产品。 |
| `GET /api/v1/tools/catalog/history/usage-records` | `server.js` + `toolsCatalog` | 待隔离 | 工具箱不是聚会记录主链路；Clean Slate 第一阶段从前台隐藏，后端保留需 PM 另判。 |
| `POST /api/v1/sessions`、`/sessions/join`、`/sessions/live`、`/sessions/by-invite` | `server.js` + `admin-store.liveSessions` + `front.js` | 可兼容保留但需改名/净化 | 内部表可继续叫 session；外部合同建议迁移为 `parties`，字段文案统一聚会。 |
| `POST /api/v1/moments/uploads/image`、`/moments`、`/session-briefs`、`/share-image-tasks` | `moments.js` | 可重建复用 | 保留照片/时间线/简报/分享任务能力，清除旧 node/event/ranking/report 污染。 |
| `POST /api/v1/admin/moments/:id/review|hide|resubmit`、`admin/moment-reports/:id/handle`、`admin/share-image-tasks/:id/retry` | `server.js` + `admin.js` | 后台能力可保留，菜单/文案/数据需重建 | 改为内容审核、举报处理、分享任务运维；去掉旧后台品牌和榜单奖励菜单。 |

### 旧 store / 数据污染盘点

| 文件 | 顶层数据 | 旧污染命中 | Clean Slate 处理 |
| --- | --- | --- | --- |
| `backend/data/admin-store.json` | `adminUsers=2`、`roles=3`、`sessions=1`、`operationLogs=16`、`analyticsEvents=3`、`userOps=3`、`questionBank=3`、`shareAssets=3`、`toolsCatalog=8`、`liveSessions=4`、`reports=3`、`rankingRewardRules=7` 等 | `IT-MOMENTS`、`ranking-rewards`、`战报分享`、`经典惩罚`、`周五热场局战报`、`欠酒大王`、旧 host/member 样本 | 备份后重建；保留 admin 账号/角色需重新初始化，旧 sessions/token 清空；reports/questionBank/rankingRewardRules/shareAssets 归档不进新前台。 |
| `backend/data/content-store.json` | `profile=3`、`compliance=1`、`toolHistory=4`、`homeConfig=4`、`pointsConfig=3`、`templateConfig=3`、`commerce=10`、`userCommerce=3` | `酒桌判官`、`欠酒互怼`、`分享战报`、`经典惩罚`、`task-share-report`、points reward / nomination ledger | 备份后重建为聚会记录师默认配置；积分/会员/模板商城只可内部归档，不进入 Clean Slate MVP。 |
| `backend/data/moments-store.json` | `momentRecords=4`、`sessionEvents=1`、`sessionBriefs=1`、`shareImageTasks=4`、`momentReports=1`、`momentNominations=1`、`rankingRewardPayouts=1`、`uploadedAssets=1` | `IT-MOMENTS`、`private-a-to-b`、`share-task` 旧 PNG、`momentReports`、`momentNominations`、`rankingRewardPayouts`、`drink_debt` / `drink_add` | 备份后重建新 fixture；旧 samples 只保留归档，不作为新版验收样本。 |
| `backend/public/uploads/moments/share-tasks/*.png` | 至少存在旧 ready PNG | 旧 share task PNG、旧战报/旧模板输出 | 备份后清理或归档；新 share task 必须重新生成。 |
| `backend/public/admin/static/heatwave-ops/*` | Web 后台静态壳 | `酒桌判官后台`、`酒局模板`、`用户与酒局`、`酒局管理`、`战报中心`、`积分体系`、`榜单奖励配置`、`今日最欠酒` 等 | 后台负责人重建；后端/API 只记录合同影响，不能把旧后台页面当新版管理台。 |

### 旧脚本 / fixture / runtime 证据

| 路径 | 判断 | 处理建议 |
| --- | --- | --- |
| `backend/scripts/smoke-judge-flow.js` | 旧 judge 流 smoke | P1 归档或删除；不得作为新版验收。 |
| `backend/scripts/smoke-moments-flow.js`、`smoke-moments-http-flow.js`、`smoke-admin-moments-flow.js`、`smoke-ugc-risk-flow.js` | 有照片/简报/审核能力，但 fixture 命名和旧报告/榜单混杂 | 可改造成新版 party/photo/ledger/share smoke；改造前不得当 Clean Slate 通过证据。 |
| `backend/scripts/prepare-moments-integration-fixture.js` | 旧接口联调 fixture 生成器 | 需要重写为 `prepare-party-recorder-clean-fixture.js` 或等效新 manifest。 |
| `docs/runtime/int-data-001-manifest.json` | 旧 009/015/024 样本 ID 清单 | 废弃为历史证据；新建 `party-recorder-clean-slate-manifest.json`。 |
| `docs/runtime/pr-admin-reward-*`、`chrome-profile*`、`pr-qa-011-*rankings*`、`pm-ready-share-task-028-20260617.png` | 旧后台奖励、ranking、share PNG 证据 | 归档索引保留，不能污染新版准出；chrome profile 可由测试/PM 另列清理。 |

### 新数据模型草案

| 新模型 | 建议字段 | 说明 |
| --- | --- | --- |
| `parties` | `partyId`、`title`、`hostProfileId`、`inviteCode`、`status`、`createdAt`、`startedAt`、`endedAt`、`settings` | 对外替代旧 `sessions/liveSessions`；内部可先映射到 `sessionId`，但 API 文档和前端字段使用 party。 |
| `partyMembers` | `partyId`、`profileId`、`displayName`、`avatarUrl`、`role=host/member/guest`、`joinedAt`、`lastActiveAt` | 保留成员和权限，不暴露旧 judge/viewer 角色。 |
| `photos` / `moments` | `photoId`、`partyId`、`uploaderProfileId`、`imageUrl`、`thumbnailUrl`、`caption`、`visibility`、`reviewStatus`、`shareConsent`、`createdAt` | 内部可复用 momentRecords；用户可见叫照片/瞬间，不叫爆料/惩罚/判官。 |
| `ledgerEntries` | `entryId`、`partyId`、`type=debt/paid/add/adjustment/note`、`amount`、`unit`、`actorProfileId`、`targetProfileId`、`note`、`visibility`、`createdAt` | 兼容“聚会账本/酒桌记账”但不使用“欠酒大王”等旧惩罚文案；公开分享只返回聚合摘要。 |
| `briefs` | `briefId`、`partyId`、`title`、`photoHighlights[]`、`ledgerSummary`、`keyEvents[]`、`shareSummary`、`visibilityScope`、`createdAt` | 替代旧 report；brief 是新版自动简报核心。 |
| `shareImages` | `taskId`、`partyId`、`briefId`、`status`、`imageUrl`、`renderMode`、`includePhotoWall`、`includeLedger`、`filteredNodeIds`、`createdAt`、`finishedAt` | 保留 share-image-tasks 能力，清理旧 layoutMode/raw enum 外露。 |
| `privacyReports` | `reportId`、`partyId`、`targetType=photo/comment/ledger/share`、`targetId`、`reporterProfileId`、`reason`、`status`、`handledBy`、`handledAt` | 替代旧 momentReports/report 中心；只做隐私/内容安全。 |
| `reviewQueue` | `reviewId`、`targetType`、`targetId`、`status=pending/approved/hidden/resubmit`、`reason`、`operator`、`updatedAt` | 后台审核最小模型。 |
| `operationLogs` | `logId`、`actor`、`action`、`targetType`、`targetId`、`before`、`after`、`createdAt` | 保留审计。 |

### 新 API 草案

| 能力 | 建议接口 | 说明 |
| --- | --- | --- |
| 创建聚会 | `POST /api/v1/parties` | 返回 `partyId/inviteCode/host/member`；兼容期可代理旧 `/sessions`。 |
| 加入聚会 | `POST /api/v1/parties/join`、`GET /api/v1/parties/by-invite` | 替代 `/sessions/join`、`/sessions/by-invite`。 |
| 聚会现场 | `GET /api/v1/parties/live?partyId=...&inviteCode=...` | 返回公开/成员可见状态、照片墙摘要、账本摘要和权限口径。 |
| 上传照片 | `POST /api/v1/parties/:partyId/photos/uploads`、`POST /api/v1/parties/:partyId/photos` | 复用当前 upload + createMoment，但合同命名转 photos。 |
| 聚会账本 | `GET /api/v1/parties/:partyId/ledger`、`POST /api/v1/parties/:partyId/ledger`、`PATCH /api/v1/ledger/:entryId` | 账本条目和聚合摘要分开；公开分享只走 summary。 |
| 自动简报 | `POST /api/v1/parties/:partyId/briefs`、`GET /api/v1/briefs/:briefId` | 替代旧 reports。 |
| 分享图任务 | `POST /api/v1/briefs/:briefId/share-images`、`GET /api/v1/share-images/:taskId`、`POST /api/v1/share-images/:taskId/process` | 替代旧 share-image-tasks；字段名不外露 `dual_flow`。 |
| 分享回流 | `GET /api/v1/share/party-brief?shareId=...` 或 `GET /api/v1/parties/live?...` | 返回公开安全摘要：照片、账本、关键事件、可见范围。 |
| 举报/隐私 | `POST /api/v1/privacy-reports`、`GET /api/v1/admin/privacy-reports`、`POST /api/v1/admin/privacy-reports/:id/handle` | 保留安全能力，去掉旧 report 战报语义。 |
| 审核 | `GET /api/v1/admin/review-queue`、`POST /api/v1/admin/review-queue/:id/approve|hide|resubmit` | 后台最小审核合同。 |

### 兼容字段处理说明

内部可临时兼容：

- `sessionId`：内部映射 `partyId`，迁移期返回时可双写 `partyId/sessionId`，前端新代码只读 `partyId`。
- `momentRecords` / `momentId`：内部可继续存储照片节点，外部文案和字段优先 `photoId` / `momentId` 双写。
- `nodeType=opening/highlight/closing`：可映射为照片类型；`private` 仅作为权限状态内部值。
- `eventType=drink_debt/drink_add/wheel_result`：内部可映射账本类型，但外部必须显示 `ledgerEntry.type` 和中文聚会账本文案。
- `shareImageTasks`：内部可复用任务表；外部接口改 `shareImages`，不得外露 `dual_flow`。
- `operationLogs/adminUsers/roles`：可保留，但后台品牌和菜单重建。

用户可见必须废弃：

- 品牌/文案：`酒桌判官`、`判官`、`酒局`、`欠酒`、`惩罚`、`战报`、`裁判`。
- 公开能力：题库惩罚、旧工具箱玩法、旧 report poster、旧 rankings/today、积分商城/榜单奖励、旧后台“战报中心/今日最欠酒”。
- 测试样本名：`IT-MOMENTS`、`PR Seed Host`、`dual_flow`、`fixture/sample/test`、内部 ID 片段。

### 备份、回滚、清理方式预案

本轮未执行清理。后续任何 `api.pomer.cn` 写入/重启/清理前，必须先由 PM/DBA/运维确认目标是 `api.pomer.cn` 的 `jiuzhuopanguan` 服务，不触碰 `pomer.cn` 官网，并记录命令、输出和证据路径。

本地备份建议：

```powershell
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupRoot = \"docs/runtime/clean-slate-backups/PR-BE-CLEAN-SLATE-001-$stamp\"
New-Item -ItemType Directory -Force -Path $backupRoot
Copy-Item backend/data/admin-store.json,backend/data/content-store.json,backend/data/moments-store.json -Destination $backupRoot
Copy-Item -Recurse backend/public/uploads/moments/share-tasks -Destination (Join-Path $backupRoot 'share-tasks')
Copy-Item -Recurse backend/public/admin/static/heatwave-ops -Destination (Join-Path $backupRoot 'heatwave-ops')
Get-FileHash $backupRoot/* -Algorithm SHA256 | Out-File (Join-Path $backupRoot 'SHA256SUMS.txt')
```

线上备份建议，待 DBA/运维执行并替换实际路径：

```bash
STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP=/www/backup/jiuzhuopanguan/PR-BE-CLEAN-SLATE-001-$STAMP
mkdir -p \"$BACKUP\"
cp -a /www/wwwroot/jiuzhuopanguan/backend/data/admin-store.json \"$BACKUP\"/
cp -a /www/wwwroot/jiuzhuopanguan/backend/data/content-store.json \"$BACKUP\"/
cp -a /www/wwwroot/jiuzhuopanguan/backend/data/moments-store.json \"$BACKUP\"/
cp -a /www/wwwroot/jiuzhuopanguan/backend/public/uploads/moments/share-tasks \"$BACKUP\"/
cp -a /www/wwwroot/jiuzhuopanguan/backend/public/admin/static/heatwave-ops \"$BACKUP\"/
find \"$BACKUP\" -type f -print0 | xargs -0 sha256sum > \"$BACKUP/SHA256SUMS.txt\"
```

回滚方式：

- store 回滚：停止写入窗口后，用备份 JSON 覆盖对应 store，重启仅限 `jiuzhuopanguan-backend`，并复跑只读 health/API smoke。
- 静态资源回滚：用备份目录覆盖 `backend/public/admin/static/heatwave-ops` 或 share task 静态目录，记录 hash 变化。
- 若 MySQL 模式开启，必须先导出相关表；当前本地盘点只覆盖 JSON store，不能替代线上 DB 备份。

### 验证命令

本轮只读盘点命令：

```powershell
rg -n \"pathname ===|startsWith\\('/api/v1|startsWith\\('/admin|renderReportPoster|judge-stats|rankings|reports|points|admin|share-image|moment-reports|ranking-rewards\" backend/server.js
rg -n \"酒桌|酒局|判官|惩罚|战报|欠酒|ranking|reward|payout|nomination|IT-MOMENTS|PR Seed|dual_flow\" backend/data backend/public/admin/static/heatwave-ops backend/scripts docs/runtime
node -e \"const fs=require('fs');const files=['backend/data/admin-store.json','backend/data/content-store.json','backend/data/moments-store.json']; for (const f of files){const data=JSON.parse(fs.readFileSync(f,'utf8')); const counts={}; for(const k of Object.keys(data)){const v=data[k]; counts[k]=Array.isArray(v)?v.length:(v&&typeof v==='object'?Object.keys(v).length:typeof v)}; console.log(f, counts)}\"
```

更新本计划后的验证：

```powershell
npm.cmd run check:encoding
git diff --no-index --check -- <empty> docs/gameplay-moments-backend-development-plan.md
```

当前状态：`PR-BE-CLEAN-SLATE-001` 后端/API只读盘点完成；未清理、未改接口、未写线上。下一步需要 PM 分派后端实现阶段，先做备份，再重建 JSON store / API facade / fixture manifest。

## 40. PR-BE-CLEAN-SLATE-BASELINE-002：JSON基线、兼容 facade 与最小实现顺序

时间：2026-06-18

任务来源：PM 二派 `PR-BE-CLEAN-SLATE-BASELINE-002`。本节只基于 PM 队列任务行、`docs/party-recorder-clean-slate-reset-plan.md` 和本计划第 39 节，补可执行基线；本轮不清线上数据、不部署、不重启、不改后端源码。

### JSON / store 新基线草案

#### `backend/data/admin-store.json`

保留：

- `adminUsers`
- `roles`
- `sessions`
- `operationLogs`
- `analyticsEvents`
- `momentReviewItems`
- `momentReportItems`
- `shareImageTasks`
- `liveSessions`：仅作为内部兼容容器，迁移期承载 `parties`

废弃：

- `questionBank`
- `reports`
- `rankingRewardRules`
- `shareAssets`
- `membershipPlans`
- `membershipBenefits`
- `membershipEnabled`
- `adSlots`
- `merchants`
- `campaigns`
- `baseConfigs`
- `toolsCatalog`
- `userOps` 中纯酒局/商业化运营视角字段

默认新值：

```json
{
  "adminUsers": [
    {
      "id": "admin-root",
      "username": "admin",
      "passwordHash": "<沿用现有 hash 机制初始化>",
      "name": "系统管理员",
      "roleId": "role-super-admin",
      "status": "active",
      "lastLoginAt": ""
    }
  ],
  "roles": [
    { "id": "role-super-admin", "name": "超级管理员", "permissions": ["*"], "status": "active" },
    { "id": "role-content-review", "name": "内容审核", "permissions": ["review", "privacy_reports", "share_images"], "status": "active" }
  ],
  "sessions": [],
  "operationLogs": [],
  "analyticsEvents": [],
  "liveSessions": [],
  "momentReviewItems": [],
  "momentReportItems": [],
  "shareImageTasks": []
}
```

#### `backend/data/content-store.json`

保留：

- `profile`
- `compliance`
- `homeConfig`

废弃：

- `pointsConfig`
- `templateConfig`
- `commerce`
- `userCommerce`
- `toolHistory`
- 所有 `task-share-report`、reward、nomination、积分商城字段

默认新值：

```json
{
  "profile": {
    "nickname": "聚会发起人",
    "avatarUrl": "",
    "bio": ""
  },
  "compliance": {
    "privacyNotice": "仅展示已授权公开内容",
    "reportEnabled": true,
    "reviewEnabled": true
  },
  "homeConfig": {
    "brandName": "聚会记录师",
    "headline": "三步创建聚会并拍下第一张照片",
    "subHeadline": "照片、账本、简报和分享回流统一沉淀",
    "heroImageUrl": ""
  }
}
```

#### `backend/data/moments-store.json`

保留：

- `momentRecords`
- `sessionEvents`
- `sessionBriefs`
- `shareImageTasks`
- `momentReports`
- `uploadedAssets`

废弃：

- `momentNominations`
- `rankingRewardPayouts`
- `rankingRewardRules`
- 旧 `drink_debt/drink_add/wheel_result` 直接对外语义

默认新值：

```json
{
  "momentRecords": [],
  "sessionEvents": [],
  "sessionBriefs": [],
  "shareImageTasks": [],
  "momentReports": [],
  "uploadedAssets": []
}
```

迁移说明：

- `momentRecords` 内部兼容 `photos`
- `sessionEvents` 内部兼容 `ledgerEntries`
- `sessionBriefs` 内部兼容 `briefs`
- `momentReports` 改作 `privacyReports`

#### `backend/data/social-store.json`

保留：

- `profiles`
- `friendships`

废弃：

- `pokes`
- 酒桌社交线程、撮合、touch/wine friend 旧玩法状态

默认新值：

```json
{
  "profiles": [],
  "friendships": []
}
```

#### `backend/data/asset-manifest.json`

保留：

- 新版品牌、分享图、海报、相册、账本相关静态资源索引

废弃：

- 旧 `report-poster`
- 旧战报海报
- 旧酒局模板封面
- 旧榜单/积分商城/惩罚题库配图

默认新值：

```json
{
  "brand": [],
  "share": [],
  "album": [],
  "ledger": [],
  "admin": []
}
```

### 废弃 key 清单

#### 表级 / 文件级

| 文件 | 后续废弃/清理对象 | 说明 |
| --- | --- | --- |
| `backend/data/admin-store.json` | `questionBank`、`reports`、`rankingRewardRules`、`shareAssets`、`membershipPlans`、`membershipBenefits`、`membershipEnabled`、`adSlots`、`merchants`、`campaigns`、`baseConfigs`、`toolsCatalog` | 旧玩法、商业化和旧后台视角污染 |
| `backend/data/content-store.json` | `pointsConfig`、`templateConfig`、`commerce`、`userCommerce`、`toolHistory` | 积分、模板商城、工具箱污染 |
| `backend/data/moments-store.json` | `momentNominations`、`rankingRewardPayouts`、`rankingRewardRules` | 排行榜/奖励污染 |
| `backend/public/static/report-poster.png` | 整个静态入口 | 旧战报图 |
| `backend/public/admin/static/heatwave-ops/*` | 旧品牌和旧酒局后台页面 | 后台负责人后续重建或整体隔离 |
| `backend/public/uploads/moments/share-tasks/*.png` | 旧 ready PNG | 新版发布前需备份并清旧图 |
| `backend/scripts/smoke-judge-flow.js` | 整个脚本 | 旧 judge 流 |
| `backend/scripts/prepare-moments-integration-fixture.js` | 旧 fixture 生成器 | 后续替换为 clean manifest 生成器 |

#### 字段级

| 旧 key / 值 | 新口径 |
| --- | --- |
| `sessionId` | `partyId` |
| `liveSessions` | `parties` |
| `momentId` / `momentRecords` | `photoId` / `photos` |
| `sessionEvents` | `ledgerEntries` |
| `sessionBriefs` | `briefs` |
| `shareImageTasks` | `shareImages` |
| `momentReports` | `privacyReports` |
| `nodeType=opening/highlight/closing/private` | `photoType=opening/highlight/closing` + `visibility` |
| `eventType=drink_debt/drink_add/wheel_result` | `ledger.type=debt/add/note` 或 `brief.keyEvents` |
| `layoutMode=dual_flow` | `renderMode=party_story` 或内部隐藏字段 |
| `rankingReward*` / `nomination*` / `points*` / `reward*` | Clean Slate MVP 移除 |

### 兼容 facade 次序

阶段 1：数据层先兼容，接口不切。

- `liveSessions` 内部定义 party 形状，但现有 `/sessions*` 继续可读。
- `momentRecords` / `sessionEvents` / `sessionBriefs` / `shareImageTasks` 先按新基线清空旧业务字段，只保留最小能力。

阶段 2：新增 facade，不立刻删旧接口。

- `POST /api/v1/parties` -> 内部调用旧 `createSession`
- `POST /api/v1/parties/join` -> 内部调用旧 `joinSession`
- `GET /api/v1/parties/live` -> 内部调用旧 `getLiveSessionConfig`
- `POST /api/v1/parties/:partyId/photos/uploads` / `photos` -> 映射旧 moments upload/create
- `GET/POST /api/v1/parties/:partyId/ledger` -> 先从 `sessionEvents` facade
- `POST /api/v1/parties/:partyId/briefs` -> facade 到 `createOrRefreshSessionBrief`
- `POST /api/v1/briefs/:briefId/share-images` -> facade 到 `createShareImageTask`

阶段 3：前端切新接口，新前端停止消费旧名。

- 前端只读 `partyId`、`photoId`、`ledgerSummary`、`briefId`、`shareImages`
- 旧 `/sessions`、`/moments`、`/session-briefs`、`/share-image-tasks` 只保留给旧测试脚本和迁移期 smoke

阶段 4：清旧合同。

- 旧 `/reports*`、`/rankings*`、`/points*`、`/templates*`、`/questions*`、`/user/judge-stats` 直接 410/下线
- 旧 `/sessions*`、`/moments*`、`/session-briefs*`、`/share-image-tasks*` 在前端 cutover 和新 manifest 稳定后再删

### 最小实现顺序

1. `store baseline`
   先重建 5 个 JSON/store 基线和默认 seed，清掉旧 ranking/report/punishment/points 污染字段，但暂不删历史备份。

2. `party facade`
   在 `server.js` 新增 `/parties` facade，内部先映射旧 session 读写，保证前端可以先切创建/加入/现场页。

3. `photo facade`
   新增 `/parties/:partyId/photos/uploads` 和 `/photos` facade，沿用当前图片上传和 moment 存储。

4. `ledger facade`
   把 `sessionEvents` 重新约束成账本条目最小集合，先支持新增、列表、摘要。

5. `brief facade`
   让 `/briefs` 能从 party + photo + ledger 聚合新版自动简报，不再依赖旧 report。

6. `share image facade`
   新增 `/share-images` facade，复用当前 share renderer，保证 Clean Slate manifest 能覆盖保存分享图。

7. `privacy/review facade`
   把 `momentReports` 和 admin review 口径重命名成 `privacyReports` / `reviewQueue`，供后台和风控接入。

8. `clean manifest generator`
   替换旧 `prepare-moments-integration-fixture.js`，生成新的 party/photo/ledger/brief/share 样本。

### 最小实现顺序与前端 cutover 的依赖关系

前端最早可切的顺序：

- 第一步切 `parties`
- 第二步切 `photos`
- 第三步切 `ledger`
- 第四步切 `briefs`
- 第五步切 `shareImages`

原因：

- `clean manifest` 至少要先有 `partyId`、成员、1 张公开照片、1-2 条 ledger、1 个 brief、1 个 share image task，测试和接口联调才有新基线可复跑。
- 如果先动 `brief/share` 而 party/photo/ledger 仍是旧合同，前端会继续被旧 `session/moment/dual_flow` 命名污染。

### 供 DBA/运维后续执行的文件级废弃清单

本轮只交清单，不执行：

| 目标 | 后续动作 |
| --- | --- |
| `backend/data/admin-store.json` 旧业务字段 | 备份后裁剪为新基线 |
| `backend/data/content-store.json` 旧 points/template/commerce 字段 | 备份后裁剪为新基线 |
| `backend/data/moments-store.json` 旧 nomination/payout/ranking 字段 | 备份后裁剪为新基线 |
| `backend/data/social-store.json` 旧 pokes/wine friend 状态 | 备份后裁剪为新基线 |
| `backend/public/static/report-poster.png` | 备份后删除或替换 |
| `backend/public/uploads/moments/share-tasks/*` 旧 PNG | 备份后按 manifest 白名单保留/清理 |
| `backend/public/admin/static/heatwave-ops/*` | 备份后整体隔离到历史目录，或重建新后台壳 |
| `backend/scripts/smoke-judge-flow.js` | 归档或删除 |
| `backend/scripts/prepare-moments-integration-fixture.js` | 替换为 clean manifest 生成器 |

### 基线 seed 草案

建议新 baseline seed 只保留一套最小样本：

- `party-001`
  一场聚会，`inviteCode`、host、2 个 member。
- `photo-001`
  1 张开场公开照片。
- `ledger-001`、`ledger-002`
  1 条待处理记录，1 条已完成记录。
- `brief-001`
  由上面样本自动生成。
- `share-image-001`
  基于 `brief-001` 的 ready/fallback 任务。
- `privacy-report-001`
  1 条待处理举报样本。

不再预置：

- ranking reward payout
- nomination
- punish/question bank
- points reward/template unlock
- old report/poster

### 验证命令

```powershell
rg -n \"PR-BE-CLEAN-SLATE-BASELINE-002|CLEAN-SLATE-BASELINE-002\" docs/runtime/ai-thread-dispatch-queue.md
Get-Content docs/party-recorder-clean-slate-reset-plan.md
Get-Content docs/gameplay-moments-backend-development-plan.md | Select-Object -Skip 2668 -First 260
npm.cmd run check:encoding
git diff --no-index --check -- <empty> docs/gameplay-moments-backend-development-plan.md
```

当前状态：`PR-BE-CLEAN-SLATE-BASELINE-002` 基线草案已补；仍未清线上数据、未部署、未重启。下一步应由 PM 分派后端实现阶段：先做 store baseline 和 facade，再让接口联调重建 clean manifest。

## 41. PR-BE-CLEAN-SLATE-PHASE1-IMPLEMENT-003：本地 baseline helper 与 clean facade 第一阶段实装

### 本轮边界

- 只按 PM 三派执行本地/源码层第一阶段实装。
- 不清线上数据，不触碰 `api.pomer.cn`，不部署，不重启。
- 不改 PM 总台账、团队公告、接口联调/测试/UIUX/UGC 文档。

### 已实施文件

| 文件 | 本轮改动 |
| --- | --- |
| `backend/data/clean-slate.js` | 新增 clean baseline helper 与 facade 命名层，提供 `sessions -> parties`、`sessionBriefs -> briefs`、`shareImageTasks -> shareImages` 映射，以及本地 baseline snapshot。 |
| `backend/server.js` | 新增最小兼容出口：`GET /api/v1/clean-slate/baseline`、`GET/POST /api/v1/parties*`、`POST /api/v1/parties/:partyId/briefs`、`GET /api/v1/briefs/:briefId`、`POST /api/v1/briefs/:briefId/share-images`、`GET/POST /api/v1/share-images/:taskId*`。 |
| `backend/scripts/smoke-clean-slate-phase1.js` | 新增本地 smoke，直接读取 helper 与现有 store，输出 baseline seed、store 计数和 facade 样本。 |

### 本轮实现口径

#### 1. baseline helper

未直接覆盖 `admin-store/content-store/moments-store/social-store/asset-manifest`。本轮采用 helper 方式先落新基线视图：

- `getCleanSlateBaseline()`
  - 汇总 5 类 store 的保留 key、废弃 key、当前计数和最小 snapshot。
  - 输出 clean seed 草案：`party/photo/ledger/brief/shareImage/privacyReport`。
  - 明确 `undeployed: true`，供接口联调 003 生成 clean manifest 时只读消费。

这样可以先给接口联调稳定字段口径，同时避免误覆盖当前本地旧测试数据。

#### 2. clean facade 命名层

`backend/data/clean-slate.js` 当前提供：

- `getPartyLiveFacade(sessionId, inviteCode)`
  - 兼容输出 `partyId`、`title`、`host`、`members`、`ledgerSummary`、`accountingHighlights`、`eventHighlights`、`photoHighlights`、`shareContentFilter`。
- `mapBrief(brief)`
  - 兼容输出 `briefId`、`partyId`、`timeline`、`ledgerSummary`、`settlementSummary`、`eventHighlights`。
- `mapShareImage(task)`
  - 兼容输出 `shareImageId`、`partyId`、`briefId`、`renderMode`、`status`、`imageUrl`。

兼容策略：

- 新字段优先：`partyId/briefId/shareImageId/renderMode`
- 旧字段保留别名：`sessionId/taskId/layoutMode`
- 仅做命名与聚合整理，不改现有底层 `admin.js` / `moments.js` 的存储行为

#### 3. 最小兼容出口

本轮已补的最小本地接口：

| 新出口 | 内部复用 |
| --- | --- |
| `GET /api/v1/clean-slate/baseline` | `getCleanSlateBaseline()` |
| `GET /api/v1/parties/live` | `getLiveSessionConfig()` + `getPartyLiveFacade()` |
| `GET /api/v1/parties/by-invite` | 旧 `getManagedSessionByInviteCode()` |
| `POST /api/v1/parties` | 旧 `createManagedSession()` |
| `POST /api/v1/parties/join` | 旧 `joinManagedSession()` |
| `POST /api/v1/parties/:partyId/briefs` | 旧 `createOrRefreshSessionBrief()` |
| `GET /api/v1/briefs/:briefId` | 旧 `getSessionBrief()` + `mapBrief()` |
| `POST /api/v1/briefs/:briefId/share-images` | 旧 `createShareImageTask()` + `mapShareImage()` |
| `GET /api/v1/share-images/:taskId` | 旧 `getShareImageTask()` + `mapShareImage()` |
| `POST /api/v1/share-images/:taskId/retry|process` | 旧 share task retry/process |

这套接口已足够接口联调 003 先造 clean manifest：

1. 读取 `/api/v1/clean-slate/baseline`
2. 创建/加入 `parties`
3. 生成 `briefs`
4. 生成/查询 `share-images`

### 本地验证

已执行：

```powershell
node --check backend/data/clean-slate.js
node --check backend/server.js
node --check backend/scripts/smoke-clean-slate-phase1.js
npm.cmd run check:encoding
node backend/scripts/smoke-clean-slate-phase1.js
git diff --no-index --check -- NUL backend/data/clean-slate.js
git diff --no-index --check -- NUL backend/scripts/smoke-clean-slate-phase1.js
git diff --check -- backend/server.js
```

待 PM/接口联调使用的最小 smoke：

```powershell
node backend/scripts/smoke-clean-slate-phase1.js
```

输出应包含：

- `undeployed: true`
- `baselineSeeds.party/brief/shareImage`
- `facadeSamples.party/brief/shareImage`

### 结果与下一步

- 本轮结论：`PR-BE-CLEAN-SLATE-PHASE1-IMPLEMENT-003` 已完成本地第一阶段实装，范围仅限 helper + facade + 最小兼容出口。
- 当前仍未部署、未重启、未触碰线上 `api.pomer.cn` 数据。
- 下一步责任人：
  - 接口联调：基于新增 helper/出口生成 clean manifest，并补 `parties/briefs/share-images` 复跑证据。
  - PM：决定第二阶段是否进入真实 store 基线文件覆盖方案，或先让前端切 facade。

## 42. PR-BE-CLEAN-SLATE-PAYLOAD-SEED-004：clean payload 白名单、PRCS token 交接方式与本地 smoke 净化

### 本轮边界

- 只改后端/API 源码和后端计划。
- 不部署、不重启、不触碰 `api.pomer.cn` / `pomer.cn`。
- 目标是把 clean facade 从“scan-before 摘要”收成“用户 payload 白名单 + 测试 debug 摘要分层”。

### 本轮改动文件

| 文件 | 本轮改动 |
| --- | --- |
| `backend/data/clean-slate.js` | 重构 clean facade：新增用户 payload 白名单序列化、debug 摘要分层、PRCS private token 交接说明、payload 示例 helper。 |
| `backend/scripts/smoke-clean-slate-phase1.js` | smoke 输出改为 `payloadExamples + debugSummary + tokenHandoff + payloadWhitelists`，并优先挑 ready/approved 样本。 |
| `backend/server.js` | 继续复用 clean facade，但 clean `parties/live`、`briefs`、`share-images` 现在默认走用户白名单输出，不再外露 raw 过滤/权限/内部节点字段。 |

### PRCS token / private manifest 安全交接方式

本轮没有在仓库中写入任何真实 token。已实现安全交接口径：

1. 优先 private manifest

- 由接口联调或后端在**仓库外** private 路径保存 manifest，例如本机临时目录或私密备份目录。
- `profiles.host/memberA/memberB/outsider.token` 仅存 private manifest。
- 公开文档只允许写 token 后 8 位。

2. 无 private manifest 时，改用本机环境变量

- `PRCS_HOST_TOKEN`
- `PRCS_MEMBER_A_TOKEN`
- `PRCS_MEMBER_B_TOKEN`
- `PRCS_OUTSIDER_TOKEN`

3. 已实现 helper

`backend/data/clean-slate.js` 新增：

- `buildPRCSPrivateTokenGuide({ privateManifestPath, env })`

`backend/scripts/smoke-clean-slate-phase1.js` 支持：

```powershell
node backend/scripts/smoke-clean-slate-phase1.js --private-manifest <private-manifest-path>
```

输出只会包含：

- `mode=private_manifest|environment|pending_seed`
- `privateManifestPath` 文件名
- `tokenSuffixes`
- `requiredEnvKeys`

不会输出完整 token。

### 用户 payload 白名单

#### `GET /api/v1/parties/live`

仅保留：

- `partyId`
- `inviteCode`
- `title`
- `coverImageUrl`
- `status`
- `memberCount`
- `joinedCount`
- `photoHighlights`
- `accountingHighlights`
- `ledgerSummary`
- `keyEvents`
- `shareNotice`
- `summary`

明确移除：

- `sessionId`
- `id`
- `host`
- `members`
- `shareContentFilter`
- `filteredNodeIds`
- `visibleNodeIds`
- `visibleNodes`
- `permissionState`
- `publicAccessState`

#### `GET /api/v1/briefs/:briefId`

仅保留：

- `briefId`
- `partyId`
- `title`
- `coverMode`
- `generatedAt`
- `photoHighlights`
- `accountingHighlights`
- `ledgerSummary`
- `settlementSummary`
- `keyEvents`
- `shareNotice`
- `summary`

明确移除：

- `sessionId`
- `id`
- `timeline`
- `rankingEligible`
- `ledgerRankings`
- `shareContentFilter`
- `filteredNodeIds`
- 任意 raw node/event id

#### `GET /api/v1/share-images/:taskId`

仅保留：

- `shareImageId`
- `partyId`
- `briefId`
- `status`
- `renderMode`
- `imageUrl`
- `includeLedger`
- `createdAt`
- `finishedAt`
- `message`

明确移除：

- `taskId`
- `id`
- `sessionId`
- `layoutMode`
- `selectedNodeIds`
- `failureReason`

### 旧污染字段净化规则

本轮已在 facade 层做以下净化：

1. 旧样本名净化

- `IT-MOMENTS`
- `PR Seed`
- `dual_flow`
- `fixture/sample/test`
- `酒局`

这些词如果落在标题/文本中，用户 payload 会被替换成中性文案，例如：

- `聚会记录`
- `聚会简报`
- `聚会记录样本`

2. 旧账本事件类型净化

对外不再返回 raw `drink_debt/drink_add/wheel_result`，统一映射为：

- `pending`
- `added`
- `note`

账本高光聚合类型也同步映射：

- `debt -> pending`
- `drunk -> completed`
- `add_wine -> added`
- `cleared -> cleared`

3. 内部字段隔离

以下字段只允许留在 smoke / 测试摘要：

- `filteredNodeIds`
- `visibleNodeIds`
- `visibleNodes`
- `permissionState`
- raw `layoutMode`
- raw `failureReason`
- raw event/node/task/session/user ids

### 本地 payload 示例

当前 `smoke-clean-slate-phase1.js` 已输出 clean 示例。基于现有本地旧数据净化后，示例摘要如下：

#### `parties/live`

```json
{
  "partyId": "session-1781507687012-e4343d",
  "inviteCode": "C56EVT",
  "title": "聚会记录",
  "status": "live",
  "memberCount": 3,
  "joinedCount": 3,
  "photoHighlights": [{ "photoType": "opening", "title": "聚会开场" }],
  "accountingHighlights": [{ "type": "pending", "label": "待处理记录", "value": 1 }],
  "ledgerSummary": { "participantCount": 3, "entryCount": 1, "pendingCount": 1 },
  "keyEvents": [{ "type": "pending", "title": "待处理记录" }],
  "shareNotice": "仅展示已授权且审核通过的公开内容；私密、待审、待补图和未授权内容不会进入分享图。"
}
```

#### `briefs`

```json
{
  "briefId": "brief-1781507687042-d1990edd",
  "partyId": "session-1781507687012-e4343d",
  "title": "聚会简报",
  "coverMode": "photo_wall",
  "photoHighlights": [{ "photoType": "opening", "title": "聚会开场" }],
  "ledgerSummary": { "entryCount": 1, "pendingCount": 1 },
  "settlementSummary": { "status": "open", "text": "本场已记录 1 条账本高光，还有 1 条待处理记录。" },
  "keyEvents": [{ "type": "pending", "title": "待处理记录" }]
}
```

#### `share-images`

```json
{
  "shareImageId": "share-task-1781507687046-d1098582",
  "partyId": "session-1781507687012-e4343d",
  "briefId": "brief-1781507687042-d1990edd",
  "status": "ready",
  "renderMode": "party_story",
  "imageUrl": "/uploads/moments/share-tasks/share-task-1781507687046-d1098582.png",
  "includeLedger": false
}
```

### 调试摘要分层

UGC 6.22.1 要求的 raw 字段仍可留在本地 smoke 摘要，但不得进入用户 payload。

当前 smoke 已拆出：

- `payloadExamples`
  - 给前端/接口/测试看用户态字段合同
- `debugSummary`
  - 只给接口联调/UGC 看 `filteredNodeCount`、`visibleNodeCount`、`permissionState`、`rawEventTypes`、`rawLayoutMode`

### 验证

已执行：

```powershell
node --check backend/data/clean-slate.js
node --check backend/server.js
node --check backend/scripts/smoke-clean-slate-phase1.js
npm.cmd run check:encoding
node backend/scripts/smoke-clean-slate-phase1.js
git diff --check -- backend/server.js docs/gameplay-moments-backend-development-plan.md
git diff --no-index --check -- NUL backend/data/clean-slate.js
git diff --no-index --check -- NUL backend/scripts/smoke-clean-slate-phase1.js
```

### 仍缺字段 / 仍缺证据

当前已解决“白名单输出”和“安全 token 交接方式”，但**仍未拿到真实 PRCS clean private manifest / token**，因此：

- `tokenHandoff.mode` 当前为 `pending_seed`
- 还缺接口联调提供的 private manifest 或本机 env token
- 还缺真正 clean 的 `party/photo/ledger/brief/shareImage` fixture，当前 smoke 仍是基于旧本地数据做净化示例
- 还缺前端 / 测试 / UGC 对这些新白名单 payload 的页面消费、PNG、截图证据

### 下一步责任人

- 接口联调：按 private manifest 或 env token 方式生成真实 clean PRCS 样本，并回填新的 sanitized manifest。
- 前端：只消费 `payloadExamples` 对应白名单字段，不再把 `filteredNodeIds/visibleNodeIds/permissionState` 暴露到 UI。
- 测试/UGC：继续把 raw 过滤字段留在 debug 摘要核查，不把它们当作用户展示合同。

## 43. PR-BE-CLEAN-SLATE-PRIVATE-MANIFEST-005：本地 private manifest 模板与四角色 token 私密交接脚本

### 本轮结论

- **可以**在不启动服务的前提下，直接使用本地 `backend/data/social-store.json` / `social_store` 生成 PRCS 四角色 token。
- 已新增私密脚本，支持：
  - `template`：输出空白 private manifest 模板
  - `generate`：本地生成 host/memberA/memberB/outsider 四角色 token，并写入私密 manifest
  - `inspect`：只输出后 8 位和残留计数
  - `cleanup`：按 seed 清理本轮生成的 profile / userSessions / loginLogs / friendships / pokes
- **不需要** DBA/运维或 PM 先提供 token 才能完成本地 private manifest；只有当接口联调要消费真实 clean actual fixture 时，才需要其持有私密 manifest 文件或环境变量。

### 本轮改动文件

| 文件 | 本轮改动 |
| --- | --- |
| `backend/scripts/manage-clean-slate-private-manifest.js` | 新增 private manifest 管理脚本，支持 `template/generate/inspect/cleanup`。 |
| `backend/templates/clean-slate-private-manifest.template.json` | 新增空白模板，字段完整但不含 token。 |
| `docs/gameplay-moments-backend-development-plan.md` | 记录生成方式、清理方式、安全边界和验证结果。 |

### 私密模板 / 生成方式

#### 1. 空白模板

可直接写出一份私密模板：

```powershell
node backend/scripts/manage-clean-slate-private-manifest.js --mode template --seed prcs-local --output <private-manifest-path>
```

输出文件内容包含：

- `profiles.host/memberA/memberB/outsider`
- `role`
- `name`
- `openIdHint`
- `profileId`
- `token`
- `tokenSuffix`

其中模板里的 `token` 默认空字符串，不会写真实 token。

#### 2. 本地直接生成四角色 token

可直接从本地 `social-store` 生成：

```powershell
node backend/scripts/manage-clean-slate-private-manifest.js --mode generate --seed prcs-005 --output <private-manifest-path>
```

生成逻辑：

- 使用 `bindWechatUser()` 为 4 个固定 openId 生成/刷新 token：
  - `prcs-clean-slate-<seed>-host`
  - `prcs-clean-slate-<seed>-member-a`
  - `prcs-clean-slate-<seed>-member-b`
  - `prcs-clean-slate-<seed>-outsider`
- 完整 token 仅写入 `output` 私密文件
- 终端只输出：
  - `profileId`
  - `tokenSuffix`
  - cleanup / residual check 命令

### token 安全边界

必须遵守：

1. 完整 token 只允许存在于：

- 私密 manifest 文件
- 本机环境变量

2. 公开文档 / PM 回报 / 接口联调公开记录中，只允许写：

- `tokenSuffix`
- 角色名
- `profileId`

3. 后端脚本 stdout 已默认脱敏，不打印完整 token。

### 接口联调可复跑命令

#### 生成私密 manifest

```powershell
node backend/scripts/manage-clean-slate-private-manifest.js --mode generate --seed prcs-005 --output C:\private\prcs-clean-slate-private-manifest.json
```

#### 检查当前 seed 是否已残留

```powershell
node backend/scripts/manage-clean-slate-private-manifest.js --mode inspect --seed prcs-005
```

#### 清理本轮生成的四角色 token / profile

```powershell
node backend/scripts/manage-clean-slate-private-manifest.js --mode cleanup --seed prcs-005
```

#### cleanup 后再次确认残留

```powershell
node backend/scripts/manage-clean-slate-private-manifest.js --mode inspect --seed prcs-005
```

### cleanup / 残留说明

`cleanup` 当前会按 seed 精确清除：

- `profiles`
- `userSessions`
- `loginLogs`
- `friendships`
- `pokes`

匹配依据：

- `wechatOpenId = prcs-clean-slate-<seed>-*`
- 以及这批 profileId 关联的 session/log/thread

不会扫描式删除其他用户。

### 本地验证结果

本轮已完成一次真实闭环验证，使用 seed：`prcs005verify2`

#### generate

- 成功生成 4 个角色
- 终端只输出 token 后 8 位：
  - host `***8a620696`
  - memberA `***757df5b2`
  - memberB `***8f066a9b`
  - outsider `***f9c572bf`

#### inspect1

- `profiles = 4`
- `userSessions = 4`
- `loginLogs = 4`

#### cleanup

- 精确移除：
  - `profiles = 4`
  - `userSessions = 4`
  - `loginLogs = 4`

#### inspect2

- 残留计数全部回到 `0`

### 验证命令

已执行：

```powershell
node --check backend/scripts/manage-clean-slate-private-manifest.js
node --check backend/data/clean-slate.js
npm.cmd run check:encoding
node backend/scripts/manage-clean-slate-private-manifest.js --mode template --seed prcs005verify --output $env:TEMP\prcs-private-manifest-template.json
node backend/scripts/manage-clean-slate-private-manifest.js --mode generate --seed prcs005verify2 --output $env:TEMP\prcs-private-manifest-generated-2.json
node backend/scripts/manage-clean-slate-private-manifest.js --mode inspect --seed prcs005verify2
node backend/scripts/manage-clean-slate-private-manifest.js --mode cleanup --seed prcs005verify2
node backend/scripts/manage-clean-slate-private-manifest.js --mode inspect --seed prcs005verify2
```

### 仍阻塞项

本轮已解掉 `tokenHandoff.mode=pending_seed` 的“本地生成能力”阻塞，但 actual manifest 仍有两类外部依赖：

1. 接口联调仍需持有**私密 manifest 文件本体**或将其中 token 写入本机环境变量后再跑 clean manifest 构建。
2. 真实 clean actual fixture 仍依赖接口联调后续用这些 token 去创建新的 `party/photo/ledger/brief/shareImage` 数据；本轮只解决 token 私密交接，不代替 actual fixture 造数完成。

### 下一步责任人

- 接口联调：使用新脚本生成 private manifest，或读取后端提供的私密文件，再继续 PRCS clean actual manifest 构建。
- PM：无需再为“token 从哪里来”单独派 DBA/运维；除非接口联调改为消费远程私密文件或环境注入。

## 44. PR-BE-CLEAN-SLATE-ACTUAL-DATA-006：本地 actual clean fixture 脚本与最小数据集

### 本轮结论

- 已补独立本地脚本 `backend/scripts/manage-clean-slate-actual-fixture.js`。
- 脚本可基于 005 private manifest 或本地 token 生成能力，创建一组 **actual clean** 本地数据：
  - 1 个 party / session
  - host/memberA/memberB 三个成员
  - 2 张公开 photo + 1 张私密过滤 photo
  - 2 条 ledger / session event
  - 1 个 brief
  - 1 个 ready shareImage task
  - 1 个 failed shareImage task
  - share return 所需的 clean payload + debug 摘要
- 公开 stdout 只输出 token 后 8 位、样本 ID、计数和 cleanup 命令；完整 token 只保留在 private manifest 文件。

### 本轮改动文件

| 文件 | 本轮改动 |
| --- | --- |
| `backend/scripts/manage-clean-slate-actual-fixture.js` | 新增 actual clean fixture 管理脚本，支持 `create/inspect/cleanup`。 |
| `backend/data/clean-slate.js` | 修正 failed shareImage 的 `message` 读取，兼容 `failedReason/failureReason`。 |
| `docs/gameplay-moments-backend-development-plan.md` | 记录 006 的生成命令、字段摘要、cleanup 和仍缺字段。 |

### 实现口径

#### 1. token 来源

脚本优先读取 005 产出的 private manifest：

```powershell
node backend/scripts/manage-clean-slate-private-manifest.js --mode generate --seed prcs-006 --output C:\private\prcs-006.private.json
```

再用该 private manifest 生成 actual clean fixture：

```powershell
node backend/scripts/manage-clean-slate-actual-fixture.js --mode create --seed prcs-006 --private-manifest C:\private\prcs-006.private.json --output C:\private\prcs-006-actual.private.json
```

如果没传 `--private-manifest`，脚本也可本地直接 `bindWechatUser()` 生成角色 token，但完整 token 仍只写入 `--output` 私密文件。

#### 2. actual clean 数据内容

create 后会生成：

- `party`
  - `partyId/sessionId`
  - `inviteCode`
  - `title=周末聚会记录`
  - `theme=night`
  - `visibility=session`
- `members`
  - host/memberA/memberB 为 joined
  - outsider 仅保留 profile，不加入 party
- `photos`
  - opening：approved + share consent
  - highlight：approved + share consent
  - private：approved 但私密，仅用于过滤/debug 摘要
- `ledger`
  - 1 条 `drink_debt`
  - 1 条 `drink_add`
  - facade 对外映射为 clean `pending/added`
- `brief`
  - 基于真实 timeline 聚合得到 `photoHighlights/accountingHighlights/ledgerSummary/settlementSummary/keyEvents/shareNotice`
- `shareImages`
  - ready：真实调用 `createShareImageTask + processShareImageTask`，落本地 PNG
  - failed：本地补一条 failed task，用于接口联调/测试状态覆盖
- `shareReturn`
  - 基于 `getLiveSessionConfig + clean facade` 生成 clean payload

#### 3. 用户 payload / debug 摘要分层

用户 payload 仍只走 42 节白名单：

- `parties/live`
- `briefs`
- `share-images`

raw 字段只在 private manifest 的 `debugSummary` 内保留：

- `filteredMomentId`
- `rawEventIds`
- `filteredNodeCount`
- `visibleNodeCount`
- `permissionState`
- `rawLayoutMode`

这些不会进用户 payload，也不会作为 PNG 用户字段。

### 接口联调可复跑命令

#### 1. 生成 private token manifest

```powershell
node backend/scripts/manage-clean-slate-private-manifest.js --mode generate --seed prcs-006 --output C:\private\prcs-006.private.json
```

#### 2. 生成 actual clean fixture private manifest

```powershell
node backend/scripts/manage-clean-slate-actual-fixture.js --mode create --seed prcs-006 --private-manifest C:\private\prcs-006.private.json --output C:\private\prcs-006-actual.private.json
```

#### 3. 残留扫描

```powershell
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-006
```

#### 4. 清理 actual fixture

```powershell
node backend/scripts/manage-clean-slate-actual-fixture.js --mode cleanup --seed prcs-006
```

#### 5. 如需同时清 token / profile

```powershell
node backend/scripts/manage-clean-slate-private-manifest.js --mode cleanup --seed prcs-006
```

### 本地验证结果

本轮已用 `seed=prcs006verify` 跑通闭环：

1. private token manifest generate
2. actual fixture create
3. inspect-before
4. actual fixture cleanup
5. inspect-after
6. private token cleanup

#### create 输出摘要

- `partyId=session-1781751683623-57f7e5`
- `briefId=brief-1781751683636-033992c2`
- `readyTaskId=share-task-1781751683637-50b16c51`
- `failedTaskId=share-task-1781751683782-c856c5`
- `returnShareId=share-return-session-1781751683623-57f7e5`
- `photoCount=2`
- `filteredPhotoCount=1`
- `ledgerEventCount=2`

#### inspect-before

- `liveSessions=1`
- `momentRecords=3`
- `sessionEvents=2`
- `sessionBriefs=1`
- `shareImageTasks=2`
- `uploadedAssets=3`
- `photoFilesExisting=3`
- `shareImageFilesExisting=1`

#### cleanup 后

- 上述 actual fixture 残留全部回到 `0`
- 再执行 private token cleanup 后，profile/userSession/loginLog 残留也回到 `0`

### 验证命令

已执行：

```powershell
node --check backend/scripts/manage-clean-slate-actual-fixture.js
node --check backend/data/clean-slate.js
npm.cmd run check:encoding
node backend/scripts/manage-clean-slate-private-manifest.js --mode generate --seed prcs006verify --output %TEMP%\prcs006-private-manifest.json
node backend/scripts/manage-clean-slate-actual-fixture.js --mode create --seed prcs006verify --private-manifest %TEMP%\prcs006-private-manifest.json --output %TEMP%\prcs006-actual-manifest.json
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs006verify
node backend/scripts/manage-clean-slate-actual-fixture.js --mode cleanup --seed prcs006verify
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs006verify
node backend/scripts/manage-clean-slate-private-manifest.js --mode cleanup --seed prcs006verify
```

### cleanup / 残留说明

`manage-clean-slate-actual-fixture.js --mode cleanup --seed <seed>` 会清：

- `adminStore.liveSessions`
- 关联 `analyticsEvents`
- `momentsStore.momentRecords`
- `sessionEvents`
- `sessionBriefs`
- `shareImageTasks`
- `uploadedAssets`
- 对应 photo webp 文件
- 对应 ready share PNG 文件

不会默认清：

- 005 的 private token/profile

这部分需单独执行：

```powershell
node backend/scripts/manage-clean-slate-private-manifest.js --mode cleanup --seed <seed>
```

### 仍缺字段

本轮已补 actual clean 数据主链路，但仍未补：

- `reviewCaseIds`
- `reportId`
- outsider / no-token API 负例 manifest
- 前端最终 actual query（brief/share/share return）仍待前端或接口联调写入实际 manifest

这些不能由后端/API 单边写成“已完成 actual manifest 通过”。

### 下一步责任人

- 接口联调：直接使用 005 + 006 脚本生成 private actual manifest / sanitized manifest / scan-before。
- 测试：基于新 actual IDs 跑页面和接口 smoke，不再复用旧 `INT-DATA-001` primary IDs。
- PM：无需再为本地 actual clean 样本生成另派 DBA/运维；当前阻塞已从“后端无 helper”转为“接口联调与前端/测试待消费新样本”。

## 45. PR-BE-DIRECT-PHOTO-LEDGER-CONTRACT-008：相册封面、创建时间、账本可编辑与图片直显合同确认

### 本轮结论

本轮属于“合同确认 + 最小源码改动”：

- 需要改源码：**需要**
- 改动范围：只限 `backend/data/front.js`、`backend/data/moments.js`、`backend/data/clean-slate.js`
- 不部署、不重启、不触碰 `api.pomer.cn` / `pomer.cn`

原因：

1. `createdAt` 原先未进入 `sessions/live` / clean party payload，无法给聚会列表稳定展示。
2. 最近相册封面缺稳定的 `coverPhotoUrl` 字段。
3. 4.2 已明确取消图片审核机制，但现有分享/公开回流/clean brief 仍按 `reviewStatus=approved` 过滤，和“上传后直接展示并参与分享”冲突。

### 5 个问题逐项结论

#### 1. 最近相册封面是否能取第一张上传照片

结论：**可以，但需区分公开态与默认封面责任。**

当前后端已补：

- `GET /sessions/live`
- clean `GET /api/v1/parties/live`

新增字段：

- `createdAt`
- `coverPhotoUrl`

取值规则：

- `coverPhotoUrl` 取当前聚会**第一张可直显且可分享**照片，即 `photoHighlights[0].imageUrl`
- 排序依据：`moment.createdAt` 升序，最早上传在前
- 无照片时：后端返回空字符串，**默认封面由前端兜底**

边界：

- 仍保留隐私范围；私密 / 指定可见图片不会进入 `coverPhotoUrl`
- 因 `sessions/live` 本身无 viewer profile 参数，本轮不把“局内私密首图”暴露到公开/弱上下文接口

#### 2. 创建聚会时间字段是否准确取当前实时时间并用于列表展示

结论：**可以。**

已有存储：

- `backend/data/admin.js#createManagedSession()` 在创建时写 `createdAt: iso()`

本轮新增对外字段：

- `GET /sessions/live` 返回 `createdAt`
- clean `GET /api/v1/parties/live` 白名单返回 `createdAt`

因此前端列表可直接使用：

- `createdAt`

不需要自己推导。

#### 3. 聚会账本欠酒/加酒数据是否可读可编辑

结论：**可读；可编辑能力存在，但当前仍是“成员计数 + 账本事件”双通道，不是独立 ledger CRUD。**

可读来源：

- `GET /sessions/live`
  - `joinedPlayers[].debtCount / drinkCount / clearedCount`
  - `ledgerSummary`
  - `accountingHighlights`
  - `eventHighlights`
- `GET /session-briefs/:briefId`
  - `ledgerSummary`
  - `accountingHighlights`
  - `settlementSummary`
  - `eventHighlights`
- clean `GET /api/v1/briefs/:briefId`
  - 同上，但已转白名单

可编辑来源：

- `PUT /sessions/:sessionId`
  - host 可通过 `selectedPlayers[].debtCount / drinkCount / clearedCount` 更新成员账本计数
- `POST /sessions/:sessionId/events`
  - host 可追加 `drink_debt` / `drink_add` / `wheel_result`

合同判断：

- **不能**把“关键事件按钮”当作账本唯一能力
- 当前正确口径应是：
  - 成员账本主数据：`selectedPlayers[].debtCount / drinkCount / clearedCount`
  - 账本流水/高光：`sessionEvents`

本轮未新增 dedicated ledger CRUD 路由，因为现有字段已能支持“可读 + 可编辑”最小需求；但后续若前端要做单条流水修改/删除，需另开后端任务。

#### 4. 取消图片审核机制后，相册/简报/分享页/保存分享图是否仍会被审核状态过滤

结论：**原先会；本轮已做最小改法。**

原先阻塞点：

- `backend/data/moments.js`
  - `isTimelineNodeShareImageEligible()` 要求 `reviewStatus === approved && secondaryReviewStatus === approved`
  - `buildShareContentFilter()` notice 和 reason 仍含审核前置
- `backend/data/clean-slate.js`
  - `buildBriefPhotoHighlights()` 只取 `approved` 图片
  - `pickPreferredMoment()` 只挑 `approved` 图片

本轮最小改法：

- 分享/简报/保存图的图片准入改为：
  - 非私密
  - 非指定可见
  - `usageConsent.share = true`
  - `completionStatus = complete`
- 不再要求 `reviewStatus/secondaryReviewStatus = approved`

仍保留过滤：

- `private`
- `selected`
- `needs_media`
- `removed`
- 未授权分享

结果：

- 图片上传后可直接进入：
  - `sessions/live.photoHighlights`
  - clean `parties/live.photoHighlights`
  - clean `briefs.photoHighlights`
  - share-image task 选图与 PNG 渲染

#### 5. 图片直显后仍保留哪些合同边界

保留，且本轮未放松：

1. 隐私范围

- `visibility=private|selected|session|share|featured` 仍有效
- `private/selected` 不进入公开封面、公开分享和保存图

2. 举报 / 删除

- 举报数据结构未移除，`momentReports` 仍可保留后置治理
- 用户删除仍走 `DELETE /moments/:momentId`

3. 字段白名单

- clean `parties/live` / `briefs` / `share-images` 仍只输出白名单
- raw `filteredNodeIds/visibleNodeIds/permissionState/reviewStatus/internal ids` 仍只允许停留在 debug/test 摘要

### 接口字段矩阵

| 需求 | 现接口/字段 | 现状 | 本轮结论 |
| --- | --- | --- | --- |
| 最近相册封面 | `sessions/live.coverPhotoUrl`、clean `parties/live.coverPhotoUrl` | 原缺 | **已补字段**；取第一张可直显照片，空态由前端默认封面兜底 |
| 创建时间 | `sessions/live.createdAt`、clean `parties/live.createdAt` | 原缺返回 | **已补字段**；取 `createManagedSession()` 实时时间 |
| 账本读取 | `joinedPlayers[].debtCount/drinkCount/clearedCount`、`ledgerSummary`、`accountingHighlights`、`eventHighlights` | 已有 | **无需改源码** |
| 账本编辑 | `PUT /sessions/:sessionId` 的 `selectedPlayers[]`；`POST /sessions/:sessionId/events` | 已有但未独立成 ledger CRUD | **合同确认可用**；关键事件不能替代成员账本主数据 |
| 图片直显参与简报/分享/PNG | `isTimelineNodeShareImageEligible`、clean brief photo 选择 | 原被审核状态拦截 | **已改最小逻辑** |
| 隐私/举报/删除/白名单 | `visibility`、`DELETE /moments/:momentId`、clean facade 白名单 | 已有 | **继续保留** |

### 本轮改动文件

| 文件 | 改动 |
| --- | --- |
| `backend/data/front.js` | `sessions/live` 增加 `createdAt`、`coverPhotoUrl` 透出位 |
| `backend/data/moments.js` | 分享/公开回流/PNG 选图去掉审核状态前置；新增 `coverPhotoUrl`；过滤提示改为“已授权公开内容” |
| `backend/data/clean-slate.js` | clean `parties/live` 白名单新增 `createdAt`、`coverPhotoUrl`；brief 照片高光去掉审核前置 |

### 验证

已执行：

```powershell
node --check backend/data/front.js
node --check backend/data/moments.js
node --check backend/data/clean-slate.js
npm.cmd run check:encoding
git diff --check -- backend/data/front.js backend/data/moments.js backend/data/clean-slate.js docs/gameplay-moments-backend-development-plan.md
```

### 仍缺项

本轮只解决合同与最小后端逻辑，不补：

- 最近相册“多聚会列表”专用列表接口
- dedicated ledger entry edit/delete 路由
- 举报后自动隐藏 / 后置治理联动策略
- 前端页面如何在首页列表优先用 `coverPhotoUrl`、空态如何展示

这些需由前端 008 / UGC 008 / 测试 008 继续消费验证，不由后端线程单边写“已通过”。

## 46. PR-BE-LINK-CLEANUP-RAW-PARITY-008-CHECK：raw parity 条件待命登记

### 本轮结论

- 本轮只做条件登记，不改后端源码、不部署、不重启、不触碰 `pomer.cn` 官网。
- 当前后端维持 008 主合同：前端/接口联调优先消费 clean facade `GET /api/v1/briefs/:briefId` 与 `GET /api/v1/share-images/:taskId`。
- 只有在前端明确给出“无法切 clean facade”的约束或错误原文后，后端才进入 raw parity 评估。

### 当前字段矩阵

| 路径 | `photoHighlights` | `accountingHighlights` | `keyEvents` | `ledgerSummary` | `readyShareImageUrl` | `shareTask.ready imageUrl` | 备注 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `GET /api/v1/briefs/:briefId` | 有 | 有 | 有 | 有 | 无独立字段 | 不适用 | clean facade，当前 008 主口径 |
| `GET /api/v1/share-images/:taskId` | 无 | 无 | 无 | 无 | 无独立字段 | 有，字段名为 `imageUrl` | clean facade 当前只返回任务态与成图地址 |
| `GET /api/v1/session-briefs/:briefId` | 无 | 有 | 无独立字段，原始名为 `eventHighlights` | 有 | 无 | 间接仅有 `shareImageTaskId/shareImageStatus`，不含 ready URL | raw brief 返回 `timeline + ledger snapshot`，不保证分享页直出字段 |
| `GET /api/v1/share-image-tasks/:taskId` | 无 | 无 | 无 | 无 | 无独立字段 | 有，字段名为 `imageUrl` | raw task 仅返回任务对象，不带 brief 聚合摘要 |

### raw parity 缺口判断

1. `raw /session-briefs/:briefId`

- 现状：
  - 有 `ledgerSummary`、`accountingHighlights`、`eventHighlights`
  - 没有 `photoHighlights`
  - 没有 clean 命名的 `keyEvents`
  - 没有 `readyShareImageUrl`，也没有嵌套 `shareTask` ready URL
- 若触发最小补丁：
  - 倾向只补 `photoHighlights`、`keyEvents` 别名、`readyShareImageUrl`
  - 影响面主要在 `backend/data/moments.js` 的 `getSessionBrief()` 返回体；理论上不需要改路由

2. `raw /share-image-tasks/:taskId`

- 现状：
  - 有任务级 `imageUrl`，当 `status=ready` 时可视为 ready 成图 URL
  - 没有 `readyShareImageUrl` 别名
  - 不返回 `photoHighlights/accountingHighlights/keyEvents/ledgerSummary`
- 若触发最小补丁：
  - 最小做法是只补 `readyShareImageUrl` 别名
  - 若要求把 brief 聚合字段也并入 task raw 返回，则需要在 `getShareImageTask()` 里回查 brief/timeline/ledger，影响面明显大于 brief 侧补齐，不建议在未触发前主动扩

### 是否需要后端改动

- 当前结论：`不需要立即改动`
- 原因：
  - clean facade 已经是 008 主合同，字段更稳定，白名单也更清晰
  - raw 路径属于内部/兼容口径，当前并不承诺和 clean facade 同形
  - 在没有前端明确退回证据前，主动做 raw parity 会扩大后端维护面，增加双合同漂移风险

### 若后续被触发的最小补丁方案

- 触发前提：
  - 前端明确无法切 clean facade，或
  - 接口联调提供 raw 消费链路的报错原文/字段缺失证据
- 拟改文件：
  - `backend/data/moments.js`
  - 如需专门兼容层，再评估是否补 `backend/server.js` 映射；当前预判大概率不需要
- 预期验证命令：
  - `node --check backend/data/moments.js`
  - `npm.cmd run check:encoding`
  - `git diff --check -- backend/data/moments.js docs/gameplay-moments-backend-development-plan.md`
  - 函数级 smoke：`getSessionBrief()` / `getShareImageTask()` 字段摘要

### 下一步触发条件

- 前端：若 008 不能切到 clean facade，提交具体依赖的 raw 路径、缺失字段名、页面报错或映射阻塞点
- 接口联调：补 raw `/session-briefs/:briefId` 或 `/share-image-tasks/:taskId` 的实际回包摘要，证明 clean facade 不能替换
- 后端/API：收到上述证据后，再决定是只补 brief raw 字段，还是明确拒绝 raw parity 并要求前端完成 clean cutover

## 47. PR-BE-TOOLBOX-CATALOG-RUNTIME-008C-CHECK：工具箱目录运行时只读核查

### 本轮结论

- 本轮只做只读核查，不改后端源码、不部署、不重启、不触碰 `pomer.cn` 官网。
- 本地代码直接读取当前 `backend/data/admin-store.json` 时，`listFrontendTools()` 返回 **8 个 tools / 5 个 categories / 4 个 popularTools**，不是空目录。
- `toolsHero` 缺失属事实，但**不是** `allTools=[]` 的直接根因；当前实现里 hero 为空不会影响 `tools` 数组生成。
- `DEFAULT_TOOLS_CATALOG=[]` 是后端的**潜在空仓风险**，但在当前仓库状态下并不是本次“本地预览 page data 为空”的直接证据根因。

### 已执行命令与结果

1. 本地 3221 只读请求

```powershell
Invoke-WebRequest http://127.0.0.1:3221/api/v1/tools/catalog
```

结果：

- 失败，当前本地 3221 未运行
- 错误原文：`由于目标计算机积极拒绝，无法连接。 (127.0.0.1:3221)`

2. 代码与 store 核查

```powershell
rg -n "DEFAULT_TOOLS_CATALOG|toolsCatalog|listFrontendTools|/api/v1/tools/catalog|tool-qr|qr-code|toolsHero" backend/data/admin.js backend/data/front.js backend/server.js backend/data/admin-store.json
```

关键结果：

- `backend/data/admin.js`：`DEFAULT_TOOLS_CATALOG = []`
- `backend/data/front.js`：`listFrontendTools()` 直接读取 `getAdminStore().toolsCatalog`
- `backend/server.js`：`GET /api/v1/tools/catalog` 直接 `sendOk(response, listFrontendTools())`
- `backend/data/admin-store.json`：当前存在 `toolsCatalog` 8 个，均为启用

3. 函数级 smoke（只读本地代码）

- 直接调用 `listFrontendTools()`，返回：
  - `tools = 8`
  - `categories = 5`
  - `popularTools = 4`
  - `heroMissing = true`
  - 首批工具 ID：`qr-code / image-compress / json / loan-calc / currency / unit / nine-grid / watermark`

### 运行时读取链路判断

1. `/api/v1/tools/catalog` 当前链路

- `backend/server.js`
  - `GET /api/v1/tools/catalog`
  - 直接调用 `listFrontendTools()`
- `backend/data/front.js`
  - `listFrontendTools()` 读取 `getAdminStore()`
  - `enabledTools = sortTools((store.toolsCatalog || []).filter(isEnabledTool))`

2. store 实际来源

- `backend/data/admin.js`
  - `storePath = backend/data/admin-store.json`
  - `getAdminStore = readStore`
- `backend/data/store-accessor.js`
  - `read()` 在未显式 `init()` 时直接 `loadFromFile()`
  - `loadFromFile()` 默认读 `filePath`
  - 若文件不存在或 JSON 解析失败，才回退 `createDefaultStore()`

3. MySQL / 其他 store 是否覆盖

- 当前后端前台读取链路没有发现对 `admin_store.init()` 的显式调用
- 这意味着 `/api/v1/tools/catalog` 常规读取更接近**直接读文件缓存**
- 因此如果某个本地运行实例返回空目录，更可能是：
  - 它运行的不是当前仓库目录
  - 它读取的是另一份 `admin-store.json`
  - 或那份文件缺失 / 解析失败后回退到了 `DEFAULT_TOOLS_CATALOG=[]`

### 根因 / 非根因判断

#### 非根因

- `toolsHero` 缺失：不是根因
  - `listFrontendTools()` 中 hero 与 tools 生成分离
  - hero 空只会让 `heroMissing=true`，不会把 `tools` 清空
- `tool-qr -> qr-code` 等 ID 兼容映射：不是根因
  - 直达 `/pages/tool-detail/index?id=qr-code` 可用，说明详情映射链路正常
- 当前仓库 `backend/data/admin-store.json` 本身为空：不是根因
  - 本地函数级 smoke 已验证能读出 8 个工具

#### 更可能的根因

- 预览框当时依赖的本地 API 实例并未运行，或
- 运行实例不在当前仓库 / 不在当前数据文件上，导致 `/api/v1/tools/catalog` 读取到默认空 store

### 是否需要后端改动

- 当前结论：`不需要立即改源码`

原因：

- 现仓库代码 + 当前 `admin-store.json` 已能正常产出 8 个工具目录
- 眼前证据更像是“本地服务实例/数据源不一致”或“服务未启动”，不是 `listFrontendTools()` 在当前代码上必然返回空
- 前端已接 `PR-FE-LINK-CLEANUP-008C-TOOLBOX-LIST-FALLBACK` 做本地兜底，这比后端在未复现前扩大改动更稳妥

### 若后续必须做后端最小硬化

仅在接口联调或前端拿出“当前运行实例确实返回空目录”的复现证据后，再评估以下最小方案：

1. 方案 A：`listFrontendTools()` 空目录 fallback

- 位置：`backend/data/front.js`
- 做法：当 `store.toolsCatalog` 为空时，回退到一份内置默认工具目录
- 优点：对 `/api/v1/tools/catalog` 最直接
- 风险：需要维护一份后端内置默认目录，和后台配置双源同步

2. 方案 B：`DEFAULT_TOOLS_CATALOG` 补默认工具目录

- 位置：`backend/data/admin.js`
- 做法：把 `DEFAULT_TOOLS_CATALOG=[]` 改成最小默认 8 工具
- 优点：文件缺失/损坏回退时不至于全空
- 风险：会影响所有“新建默认 store”路径，变更面大于方案 A

当前更倾向：若真要补，优先 **方案 A**，只做前台读取兜底，不扩大后台默认 seed。

### 下一步责任人

- 前端：继续保留本地 `tools list fallback`，避免预览框因本地 API 缺席直接空页
- 接口联调：如需后端继续处理，请补当前 3221 实例启动命令、工作目录、`/api/v1/tools/catalog` 实际回包摘要
- 后端/API：只有在确认“当前运行实例确实读到空 toolsCatalog”后，才进入最小硬化评估；本轮不写“工具箱已通过”

## 48. PR-BE-LOCAL-API-3221-008D-SUPPORT：本地 3221 API 条件待命登记

### 本轮结论

- 本轮只做条件待命登记，不改后端源码，不部署，不重启线上，不触碰 `api.pomer.cn` / `pomer.cn`。
- 当前由接口联调先处理 `PR-INT-LOCAL-API-3221-008D-RUNTIME`，目标是恢复/确认本地 `http://127.0.0.1:3221/api/v1` 读取当前工作区 JSON store。
- 后端/API 只有在接口联调明确反馈“启动失败”或“后端命令 / 依赖 / 路由错误”后，才进入最小支持。

### 当前待命边界

- 不主动启动本地服务
- 不主动改源码
- 不主动补依赖
- 不写页面通过、联调通过或上线通过

### 若被触发的最小支持范围

1. 启动类

- 核对本地 3221 的启动命令、工作目录、环境变量要求
- 确认是否读取当前工作区 JSON store，而不是其他目录或默认空 store

2. 依赖类

- 核对本地缺失依赖、Node 版本、脚本入口
- 只修与 `3221 /api/v1` 本地运行直接相关的问题

3. 路由类

- 核查并最小修复以下目标路由是否挂载、是否回当前 store：
  - `/api/v1/config/home`
  - clean `/api/v1/briefs/:id`
  - `/api/v1/share-images/:taskId`
  - ready PNG 对应读取链路

### 若被触发时的最小验证命令

```powershell
node --check backend/server.js
node --check backend/data/front.js
node --check backend/data/moments.js
npm.cmd run check:encoding
git diff --check -- backend/server.js backend/data/front.js backend/data/moments.js docs/gameplay-moments-backend-development-plan.md
```

如需本地 smoke，再按接口联调提供的失败原文补：

```powershell
Invoke-WebRequest http://127.0.0.1:3221/api/v1/config/home
Invoke-WebRequest http://127.0.0.1:3221/api/v1/briefs/<briefId>
Invoke-WebRequest http://127.0.0.1:3221/api/v1/share-images/<taskId>
```

### 触发条件

- 接口联调提交本地 3221 启动失败原文
- 或提交后端依赖缺失 / 脚本入口错误 / 路由 404/500 证据
- 或证明当前实例没有读取本工作区 JSON store

### 下一步责任人

- 接口联调：先完成本地 3221 runtime 核查，并给出启动命令、失败原文、目标路由回包摘要
- 后端/API：仅在上述证据到位后接手最小启动/依赖/路由修复

## 49. PR-BE-SHARE-GENERATE-STATUS-QR-008BG：分享生成、状态刷新、二维码与收口合同核查

### 本轮结论

- 本轮只做后端/API 合同核查与计划登记，不部署、不重启、不触碰 `pomer.cn` 官网。
- 分享图任务接口链路在源码中**完整存在**，本地代码能力支持 `create / get / retry / process`。
- 当前“刷新状态立即回传”不是靠异步 worker，也不是靠 `GET status` 自动触发生成；**必须显式调用 `POST process`**，且 `process` 请求会同步执行生成并直接返回 `ready` 或 `failed`。
- 当前 ready PNG renderer 已不是旧红色大卡壳，时间线时间也已使用真实 `timeline node createdAt`；但 **底部真实小程序二维码目前没有接入 renderer**。
- 当前二维码接口 `/api/v1/tools/qr-code.png?text=...` 只是**普通文本二维码**，不能证明可承载微信小程序 `path/scene` 或专用小程序码。
- `session/live` 成员数组、timeline event、moment 现状**缺稳定头像字段透出**；如果分享页/账本要展示操作者/目标头像，后端仍有最小合同缺口。
- “结束聚会”现有后端入口可用，但它走的是 `POST /api/v1/reports` -> `finishManagedSession()` 的“生成 report 并顺带改 session 状态”口径，不是独立 `finish session` API。

### 1. 分享图任务接口当前能力

#### 路由存在性

- raw：
  - `POST /api/v1/session-briefs/:briefId/share-image-tasks`
  - `GET /api/v1/share-image-tasks/:taskId`
  - `POST /api/v1/share-image-tasks/:taskId/retry`
  - `POST /api/v1/share-image-tasks/:taskId/process`
- clean facade：
  - `POST /api/v1/briefs/:briefId/share-images`
  - `GET /api/v1/share-images/:taskId`
  - `POST /api/v1/share-images/:taskId/retry`
  - `POST /api/v1/share-images/:taskId/process`

#### 状态枚举

- `pending`
- `processing`
- `ready`
- `failed`
- `expired`

#### 字段现状

| 接口 | 当前字段 | 结论 |
| --- | --- | --- |
| raw `GET /share-image-tasks/:taskId` | `id/sessionId/briefId/status/layoutMode/ledgerIncluded/selectedNodeIds/imageUrl/failedReason/retryCount/createdAt/startedAt/finishedAt/updatedAt` | 原始任务对象完整 |
| clean `GET /share-images/:taskId` | `shareImageId/partyId/briefId/status/renderMode/imageUrl/includeLedger/createdAt/finishedAt/message` | 可给前端直接消费 |
| `ready` | `status=ready` + `imageUrl` 非空 | 当前成立 |
| `failed` | `status=failed` + `failedReason/message` | 当前成立 |
| `expired` | `status=expired`，允许 retry/process | 当前有枚举和样本，但更像 fixture/兼容态 |

#### 本轮函数级验证摘要

- raw task 样本 `share-task-1781756527713-442cb75c`
  - `status=ready`
  - `imageUrl=/uploads/moments/share-tasks/share-task-1781756527713-442cb75c.png`
  - 无 `posterImageUrl`
- clean `mapShareImage(rawTask)` 样本
  - 返回 `imageUrl`
  - 无 `posterImageUrl`
  - 无 `readyShareImageUrl`

结论：

- 当前后端“有图即 `imageUrl`”，没有额外 `posterImageUrl` 字段
- 若前端要统一使用 `posterImageUrl/readyShareImageUrl`，需新增别名合同

### 2. “刷新状态立即回传”当前怎么做

当前实现判断：

- `GET /share-image-tasks/:taskId` / `GET /share-images/:taskId`
  - 只读状态
  - **不会自动触发生成**
- `POST /share-image-tasks/:taskId/process` / clean `POST /share-images/:taskId/process`
  - 会把任务置为 `processing`
  - 同一请求内执行 PNG 渲染
  - 成功则直接返回 `ready + imageUrl`
  - 失败则直接返回 `failed + failedReason`
- `POST /retry`
  - 只把 `failed/expired -> pending`
  - **不会自动继续生成**

给前端的可执行合同：

1. `POST create`
   - 若返回 `pending`，立即调用 `POST process`
2. `POST process`
   - 以返回体作为最新状态
   - 若 `ready`，即可点分享/保存
   - 若 `failed`，展示失败并允许 retry
3. 用户点击“刷新状态”
   - 先 `GET status`
   - 如果仍是 `pending/failed/expired` 且用户要继续生成，再显式 `POST process`

当前**不建议**前端假设：

- `GET status` 会自动生成
- `create` 后后台有异步 worker 自行完成

### 3. ready PNG renderer 现状

#### 已确认的正向项

- 当前 renderer 在 `backend/data/moments.js#buildShareImageSvg()`
- 不是旧红色账本大卡壳
- 标题/结构已是“照片墙 + 聚会账本 + 关键时刻 + 聚会总结 + 房间码”
- 时间线时间显示来自：
  - `timelineItems[*].createdAt`
  - `formatPosterTime(item.createdAt)`
- `formatPosterTime()` 直接格式化真实时间，不是写死假时间

#### 当前缺口

- ready PNG **没有**底部真实小程序二维码
- 当前 SVG 底部只有：
  - 房间码
  - “仅展示已授权公开内容”
  - 品牌文字
- renderer 里没有读取：
  - `/static/share-miniapp-qr.png`
  - `sharePosterMiniappCodePath`
  - `/api/v1/tools/qr-code.png`

补充对照：

- 旧 report poster 渲染链路在 `backend/server.js#buildReportPosterSvg()`
  - 已能把 `sharePosterMiniappCodePath` 静态二维码 PNG 贴到底部
- 但当前 moments ready PNG renderer **没有复用这条二维码链路**

结论：

- “真实 `createdAt`” 已支持
- “底部真实小程序二维码” 当前 **不支持**

### 4. 小程序二维码现状与最小合同

#### 已定位的旧资产 / 旧路径

- 静态资产存在：
  - `miniprogram/assets/share/share-poster-miniapp-code.png`
  - `miniprogram/pages/share-poster/assets/share/share-poster-miniapp-code.png`
  - `miniprogram/assets/home/share-miniapp-qr.png`
- `backend/server.js` 也有：
  - `sharePosterMiniappCodePath`
  - `/static/share-miniapp-qr.png` 静态映射

#### 当前二维码接口能力

- `GET /api/v1/tools/qr-code.png?text=...`
- 实现方式：`QRCode.toBuffer(text, ...)`
- 结论：这是普通文本二维码，不是微信小程序专用码接口

#### 当前阻塞

- 后端没有：
  - 微信小程序码生成接口
  - `page/path/scene` 合同
  - `sharePagePath` / `scene` / `miniProgramCodeUrl` 字段
- 因此现在不能确认“扫码直接落到小程序分享页/回流页”

#### 最小合同建议

若要真正支撑小程序码，建议新增专用字段合同：

- 输入：
  - `pagePath`
  - `scene`
  - `envVersion`
  - 可选 `width`
- 输出：
  - `miniProgramCodeUrl`
  - `expiresAt`（如后端缓存）
  - `fallbackQrImageUrl`（可选）

若短期只求先有可扫码视觉占位：

- 可先把现有静态 `share-poster-miniapp-code.png` 接入 ready PNG renderer
- 但这只能算**静态占位码**，不能等价为真实会话分享码

### 5. 账本头像 / 成员头像字段现状

#### 当前有的地方

- `admin liveSessions.members[*].avatarUrl` 底层存储存在
- `finishManagedSession()` 生成 report ranks 时会尝试补 `avatarUrl`

#### 当前对前台/分享链路的缺口

1. `session/live`

- `front.js#buildMembersFromSession()` 目前把成员 `avatarUrl` 直接写成空串
- 函数级样本验证：`joinedPlayers[*].avatarUrl = ""`

2. `brief/timeline`

- `serializeMomentForViewer()` 不返回 `uploaderAvatarUrl`
- `serializeEvent()` 不返回 `operatorAvatarUrl/targetAvatarUrl`
- 函数级样本验证：
  - moment 无头像字段
  - event 只有 `operatorProfileId/operatorName/targetProfileId/targetName`

3. `ledger/accountingHighlights`

- 汇总高光没有成员级头像

#### 最小合同缺口

若前端分享页/账本区要稳定展示头像，最小建议补：

- `sessions/live.joinedPlayers[].avatarUrl`
- `timeline moment.uploaderAvatarUrl`
- `timeline event.operatorAvatarUrl`
- `timeline event.targetAvatarUrl`

优先级建议：

- P0：`joinedPlayers[].avatarUrl`
- P0：`event.operatorAvatarUrl/targetAvatarUrl`
- P1：`moment.uploaderAvatarUrl`

### 6. 结束聚会能力与影响

#### 当前能力

- 现有入口：`POST /api/v1/reports`
- 服务函数：`finishManagedSession(payload)`

它会做两件事：

1. 生成一条 report
2. 按 payload 覆盖 live session 的：
   - `state`
   - `status`

#### 能否支撑“结束聚会”按钮

- **能勉强支撑**
- 但它是“生成 report 驱动的结束”，不是纯 session finish API
- 前端若只想点“结束聚会”而不立刻生成 report，需要额外合同澄清

#### 对数据源的影响

1. 个人中心 / 历史

- `GET /api/v1/reports/history`
- 由 `listManagedReports()` 汇总 report + session
- 当 report 生成且 session 状态改成“已结束”后，会进入历史列表口径

2. 首页 live / 最近聚会

- `getLiveSessionConfig()` 仍从 `liveSessions` 里挑 session
- 是否继续显示、显示顺序与 `state/status` 文本有关
- `finishManagedSession()` 不会移除 session，只会改 `state/status`

3. 最近相册 / brief / shareImage

- 现有 `finishManagedSession()` 本身不会刷新 moments brief/share task
- 它主要影响 report/history 口径，不会自动补“结束聚会后的联合分享收口”

结论：

- 现有接口可作为“结束聚会并生成 report”收口
- 若前端要“先结束聚会，再独立决定是否生成 report / brief / share image”，则后端还缺独立 finish session 合同

### 本轮结论矩阵

| 主题 | 当前结论 |
| --- | --- |
| 分享任务接口 | 路由完整，支持 create/get/retry/process |
| 刷新状态立即回传 | 必须显式 `POST process`；`GET` 不自动生成 |
| ready PNG 时间 | 已使用真实 `timeline node createdAt` |
| ready PNG 二维码 | 当前不支持真实小程序二维码 |
| `imageUrl/posterImageUrl` | 只有 `imageUrl`，无 `posterImageUrl` |
| 小程序码接口 | 当前只有普通文本二维码，不是专用小程序码 |
| 头像字段 | live/timeline/ledger 对前台链路仍缺稳定头像字段 |
| 结束聚会 | 可用 `POST /reports` 勉强支撑，但不是独立 finish API |

### 本轮只读验证摘要

- 函数级：
  - `getShareImageTask()` ready 样本返回 `status=ready + imageUrl`
  - `mapShareImage()` 样本无 `posterImageUrl`
  - `getSessionBrief()` / timeline 事件样本无 `operatorAvatarUrl/targetAvatarUrl`
  - `getLiveSessionConfig()` 样本 `joinedPlayers[].avatarUrl=""`
- 代码级：
  - `buildShareImageSvg()` 使用 `formatPosterTime(item.createdAt)`
  - renderer 未接入任何 QR asset/dataUri
  - `finishManagedSession()` 只改 report + session `state/status`

### 是否需要后端改动

- 当前不直接改源码，只给最小缺口
- 若 PM/前端正式触发，后端最小实现优先级建议：
  1. `share-images` 增加 `posterImageUrl/readyShareImageUrl` 别名
  2. ready PNG renderer 接入静态 QR 或专用小程序码字段
  3. `joinedPlayers/timeline events` 补头像字段
  4. 如需独立“结束聚会”按钮，再补 session finish 专用 API

## 50. PR-BE-SHARE-QR-RENDERER-FIELD-008BJ：分享二维码字段与 ready PNG 静态小程序码接入

### 本轮结论

- 本轮已做本地后端最小实现，范围仅限：
  - `share-image task` / clean `share-image` payload 增加二维码与分享图别名字段
  - moments ready PNG renderer 底部实际绘制小程序二维码
- 本轮**不是**会话专属小程序码；当前接入的是**旧项目静态小程序码占位资产**。
- 保留现有 `imageUrl`，同时补充：
  - `posterImageUrl`
  - `readyShareImageUrl`
  - `miniProgramQrUrl`
  - `qrCodeUrl`
- 时间链路未改口径，ready PNG 仍使用 timeline node 真实 `createdAt`。
- 本轮未部署、未重启、未触碰 `api.pomer.cn` / `pomer.cn`。

### 改动文件

| 文件 | 改动 |
| --- | --- |
| `backend/data/moments.js` | share task 原始返回补 `posterImageUrl/readyShareImageUrl/miniProgramQrUrl/qrCodeUrl`；ready PNG renderer 底部接入静态小程序码；保持真实 `createdAt` 时间 |
| `backend/data/clean-slate.js` | clean `share-images/:taskId` payload 增加上述别名与二维码字段 |

### 字段合同

#### raw `GET /api/v1/share-image-tasks/:taskId`

新增/确认字段：

- `imageUrl`
- `posterImageUrl`
- `readyShareImageUrl`
- `miniProgramQrUrl`
- `qrCodeUrl`

字段口径：

- `imageUrl`：现有成图地址，保持兼容
- `posterImageUrl`：当前等于 `imageUrl`
- `readyShareImageUrl`：当前等于 `imageUrl`
- `miniProgramQrUrl`：当前指向静态小程序码 URL `/static/share-miniapp-qr.png`
- `qrCodeUrl`：当前等于 `miniProgramQrUrl`

#### clean `GET /api/v1/share-images/:taskId`

新增/确认字段：

- `imageUrl`
- `posterImageUrl`
- `readyShareImageUrl`
- `miniProgramQrUrl`
- `qrCodeUrl`

前端当前可直接使用：

- 分享图主图：`posterImageUrl || readyShareImageUrl || imageUrl`
- 底部二维码预览：`miniProgramQrUrl || qrCodeUrl`

### ready PNG renderer 接入结果

- 当前 moments ready PNG renderer 已在底部安全区绘制二维码。
- 二维码来源不是动态会话码，而是静态小程序码资产。
- 位置在海报底部右侧浅底安全区，不覆盖：
  - 时间线
  - 房间码
  - “仅展示已授权公开内容”提示

### 静态二维码资产与 URL

本轮优先使用的静态 URL：

- `/static/share-miniapp-qr.png`

后端本地候选资产路径：

- `miniprogram/assets/home/share-miniapp-qr.png`
- `miniprogram/assets/share/share-poster-miniapp-code.png`
- `miniprogram/pages/share-poster/assets/share/share-poster-miniapp-code.png`

说明：

- `backend/server.js` 已存在 `/static/share-miniapp-qr.png` 静态映射
- 因此本轮不需要新增 server 路由即可复用该静态码

### 会话专属小程序码未完成项

本轮明确是“旧项目静态小程序码占位接入”，不是会话专属分享码。

后续若要改成真实小程序码，建议新增专用字段合同：

- 输入：
  - `pagePath`
  - `scene`
  - `envVersion`
- 输出：
  - `miniProgramCodeUrl`
  - `expiresAt`
  - 可选 `fallbackQrImageUrl`

### 接口联调可复跑口径

1. 创建分享任务

```http
POST /api/v1/session-briefs/:briefId/share-image-tasks
```

2. 触发生成

```http
POST /api/v1/share-image-tasks/:taskId/process
```

3. 读取状态

```http
GET /api/v1/share-image-tasks/:taskId
GET /api/v1/share-images/:taskId
```

应重点检查字段：

- `status`
- `imageUrl`
- `posterImageUrl`
- `readyShareImageUrl`
- `miniProgramQrUrl`
- `qrCodeUrl`

4. 验证静态二维码 URL

```http
GET /static/share-miniapp-qr.png
```

### 本轮本地验证摘要

- 语法校验：
  - `node --check backend/server.js`
  - `node --check backend/data/moments.js`
- 编码校验：
  - `npm.cmd run check:encoding`
- diff 校验：
  - `git diff --check -- backend/data/moments.js backend/data/clean-slate.js docs/gameplay-moments-backend-development-plan.md`
- 函数级重点摘要：
  - ready task 返回 `imageUrl + posterImageUrl + readyShareImageUrl + miniProgramQrUrl + qrCodeUrl`
  - clean `share-image` payload 同步返回上述字段
  - `_buildShareImageSvgForTest()` 输出 SVG 含 `/static/share-miniapp-qr.png` 对应图片 data URI

### 风险与后续

- 当前二维码是静态旧项目码，只能满足“底部应有小程序二维码”的视觉与最小合同要求
- 它不能证明扫码会进入当前会话分享页
- 若用户下一步要求“扫码直达当前聚会/当前分享页”，需另开后端/API 任务补专用小程序码合同与实现

## 51. PR-BE-LEDGER-AVATAR-FIELDS-008BM：账本/记录/brief 头像字段收口

### 本轮结论

- 本轮已完成后端字段实现的最小闭环，范围仅限：
  - `sessions/live.joinedPlayers[].avatarUrl`
  - `brief.timeline moment.uploaderAvatarUrl`
  - `brief.timeline event.operatorAvatarUrl`
  - `brief.timeline event.targetAvatarUrl`
  - clean brief `photoHighlights[].uploaderAvatarUrl`
  - clean brief `keyEvents[].operatorAvatarUrl/targetAvatarUrl`
- 不补假头像；如果 session member 和 social profile 都没有头像，则保持空串。
- 本轮不改前端、不改 PM 台账、不部署、不重启、不触碰 `pomer.cn` 官网。

### 改动文件

| 文件 | 改动 |
| --- | --- |
| `backend/data/front.js` | `buildMembersFromSession()` 改为优先读取 session member `avatarUrl`，再回退 social profile `avatarUrl`；`hostAvatarUrl` 同步从 host/member 实际头像透出 |
| `backend/data/moments.js` | timeline moment/event 序列化补 `uploaderAvatarUrl`、`operatorAvatarUrl`、`targetAvatarUrl`；公开 `photoHighlights` 同步补 `uploaderAvatarUrl` |
| `backend/data/clean-slate.js` | clean brief `photoHighlights` / `keyEvents` 透传头像字段 |

### 字段清单

#### live / 账本页可复用

- `GET /sessions/live`
  - `joinedPlayers[].avatarUrl`
  - `joinStatusPlayers[].avatarUrl`
  - `hostAvatarUrl`

#### brief / 记录页 / 时间线可复用

- `GET /session-briefs/:briefId`
  - `timeline.nodes[nodeKind=moment].uploaderAvatarUrl`
  - `timeline.nodes[nodeKind=event].operatorAvatarUrl`
  - `timeline.nodes[nodeKind=event].targetAvatarUrl`

#### clean brief / share 可复用

- `GET /api/v1/briefs/:briefId`
  - `photoHighlights[].uploaderAvatarUrl`
  - `keyEvents[].operatorAvatarUrl`
  - `keyEvents[].targetAvatarUrl`

### 头像来源口径

按优先级读取：

1. session member `avatarUrl`
2. social profile `avatarUrl`
3. 若上述都为空，则返回空串 `""`

口径说明：

- 授权用户头像：若已进 session member 或 social profile，原样透出
- profile avatar：作为 session member 为空时的回退来源
- fixture/mock 值：若数据源本身存的是 fixture/mock URL，按真实存量值透出，不改写不伪造
- 空值：如实为空，不生成默认头像，不用占位图冒充真实头像

### 样本与函数级验证摘要

本轮使用样本：

- `sessionId=session-1781756527692-d277f0`
- `briefId=brief-1781756527712-95eff999`
- `profileId=user-1781756527689-f2fbe0`

函数级 smoke 已验证：

- 字段已出现在以下响应结构中：
  - `joinedPlayers[].avatarUrl`
  - `moment.uploaderAvatarUrl`
  - `event.operatorAvatarUrl`
  - `event.targetAvatarUrl`
  - clean `photoHighlights[].uploaderAvatarUrl`
  - clean `keyEvents[].operatorAvatarUrl/targetAvatarUrl`

当前样本值结果：

- 以上字段在本地样本中仍多为 `""`
- 说明本轮**字段合同已补齐**，但样本源数据本身缺真实头像
- 因此当前阻塞已从“后端不返回头像字段”转为“接口联调/测试样本未提供真实头像数据”

### 已执行验证

```powershell
node --check backend/data/front.js
node --check backend/data/moments.js
node --check backend/data/clean-slate.js
npm.cmd run check:encoding
git diff --check -- backend/data/front.js backend/data/moments.js backend/data/clean-slate.js docs/gameplay-moments-backend-development-plan.md
```

结果：

- `node --check backend/data/front.js` 通过
- `node --check backend/data/moments.js` 通过
- `node --check backend/data/clean-slate.js` 通过
- `npm.cmd run check:encoding` 通过
- `git diff --check ...` 通过（仅有 CRLF warning，无 whitespace error）

### 未闭环项与下一步责任人

- 未闭环项：
  - 当前样本 `avatarUrl` 真实值仍为空，无法单靠后端字段补齐证明“账本页头像必须是真的”
- 下一步责任人：
  - 接口联调 / 测试：提供带真实 `avatarUrl` 的 session member / social profile 样本，或补实际登录授权头像数据
  - 前端：消费新字段，不得再用默认头像冒充真实头像
- 后端/API：如收到真实头像样本仍透传失败，再继续查 session/social 数据同步链路

## 52. PR-BE-SESSION-END-STATE-008BV：结束聚会状态收口合同

### 本轮结论

- 已补后端最小实现，结束聚会走状态收口，不走删除。
- 新增明确接口：`POST /api/v1/sessions/:sessionId/end`。
- 兼容原 `PUT /api/v1/sessions/:sessionId`：当写入结束态时自动写 `endedAt/updatedAt`。
- `POST /api/v1/reports` 仍可作为旧收口链路，但 `finishManagedSession()` 默认写 `state=已结束`、`status=已结束`、`endedAt/updatedAt`，不再写空 state/status。
- 本轮不改前端、不改 PM 总台账、不部署、不重启、不触碰 `pomer.cn` 官网。

### 接口合同

| 场景 | 接口 | 权限 | 结果 |
| --- | --- | --- | --- |
| 显式结束聚会 | `POST /api/v1/sessions/:sessionId/end` | host token | 返回 session，`state/status=已结束`，写入 `endedAt/updatedAt` |
| 管理更新结束态 | `PUT /api/v1/sessions/:sessionId` | host token | 若 payload state/status 为结束态，同步写 `endedAt/updatedAt` |
| 旧 report 收口 | `POST /api/v1/reports` | user token | 生成 report，并把关联 session 收口为 `已结束` |
| 读回 live | `GET /api/v1/sessions/live` | user/invite 口径 | 返回 `stateText/status/endedAt/updatedAt` |
| 历史/后台 | `listManagedReports()` / admin store | 后台读取 | 通过 session `state/status/endedAt/updatedAt` 判断和展示已结束 |

状态口径：

- 已开始聚会默认归一为 `state=进行中`、`status=进行中`。
- 结束后归一为 `state=已结束`、`status=已结束`，避免出现“正常/已结束”歧义。
- 结束动作只更新 session 状态时间，不删除 session、members、moments、brief 或 share task。
- 首页 live 默认选择时只返回 `进行中`、必要时 `等待` / 非结束态；如果全部 session 都是 `已结束` / 结束态，则返回 `null`，不再用 `sessions[0]` 兜底生成进行中入口。

### 改动文件

| 文件 | 改动 |
| --- | --- |
| `backend/data/admin.js` | 增加 session 状态归一；新增 `endManagedSession()`；`create/update/finishManagedSession()` 写 `state/status/endedAt/updatedAt` |
| `backend/server.js` | 新增 `POST /api/v1/sessions/:sessionId/end` host-only 路由 |
| `backend/data/front.js` | `sessions/live` 读回补 `endedAt/updatedAt`；默认 live 选择不优先已结束样本 |

### 本地读回证据

函数级 smoke 已执行，未触碰线上：

```powershell
node -e 'const admin=require("./backend/data/admin"); const created=admin.createManagedSession({sessionName:"PR-BE-008BV local smoke", playerCount:2, hostName:"008BV Host", hostProfileId:"profile-008bv-host", selectedPlayers:[{profileId:"profile-008bv-host", name:"008BV Host", isHost:true, status:"已加入"},{profileId:"profile-008bv-member", name:"008BV Member", status:"已加入"}]}); const ended=admin.endManagedSession(created.id, {}); const read=admin.getManagedSessionById(created.id); const ok=admin.deleteManagedSession(created.id); console.log(JSON.stringify({sessionId:created.id,state:read.state,status:read.status,hasEndedAt:Boolean(read.endedAt),hasUpdatedAt:Boolean(read.updatedAt),memberCount:Array.isArray(read.members)?read.members.length:0,deletedTemp:ok},null,2));'
```

读回摘要：

- 临时样本：`session-1781881319240-9e6e93`
- `state=已结束`
- `status=已结束`
- `endedAt` 存在
- `updatedAt` 存在
- `memberCount=2`
- `deletedTemp=true`

回滚口径：

- 本轮 smoke 仅创建并删除临时本地样本 `session-1781881319240-9e6e93`。
- 不清理 008BR 头像样本，不清理 008BL ready PNG 样本。
- 若线上后续需要回滚结束状态，应由 DBA/运维或接口联调按样本 ID 用备份 store 恢复对应 session 的 `state/status/endedAt/updatedAt`，不得用 `DELETE /sessions/:id` 当作结束回滚。

### 已执行验证

```powershell
node --check backend/server.js
node --check backend/data/admin.js
node --check backend/data/front.js
npm.cmd run check:encoding
git diff --check -- backend/server.js backend/data/admin.js backend/data/front.js docs/gameplay-moments-backend-development-plan.md
```

结果：

- `node --check backend/server.js` 通过
- `node --check backend/data/admin.js` 通过
- `node --check backend/data/front.js` 通过
- `npm.cmd run check:encoding` 通过，`Encoding check passed`
- `git diff --check ...` 通过；仅有 CRLF warning，无 whitespace error

复核追加：

- `pickLiveSession()` 已移除 `sessions[0] || null` 兜底。
- 全部为结束态时返回 `null`，避免首页把已结束聚会当进行中入口。
- 追加验证：
  - `node --check backend/data/front.js` 通过
  - `npm.cmd run check:encoding` 通过，`Encoding check passed`
  - `git diff --check -- backend/data/front.js` 通过；仅有 CRLF warning，无 whitespace error

### 下一步责任

- 前端：把“结束聚会”按钮从 `DELETE /sessions/:id` 切到 `POST /sessions/:id/end` 或 `PUT /sessions/:id` 写结束态。
- 接口联调/测试：用本地 3221 或后续发布后的 `api.pomer.cn` 复测结束、读回、历史/后台状态，不得把删除链路当结束链路。

## 53. PR-BE-ME-ENDED-SESSION-FIELDS-008CB：个人中心已结束聚会摘要字段补证

### 本轮结论

- 已补 `/api/v1/user/session-moment-summaries` 的个人中心聚会摘要字段。
- 已结束 session 现在可在每条摘要里显式读到 `state/status=已结束`、`endedAt`、`updatedAt`。
- 已结束 session 的 `canResume=false`，`canResumeMomentIds=[]`，不会被前端当作进行中续补入口。
- 保留 session、moments、brief、share task，不删除任何关联数据。
- 本轮不改前端、不改 PM 文档、不部署、不重启、不触碰 `pomer.cn` 官网。

### 接口字段合同

接口：

```http
GET /api/v1/user/session-moment-summaries
```

每条摘要新增 / 明确字段：

| 字段 | 口径 |
| --- | --- |
| `state` | session 当前业务状态，结束态为 `已结束` |
| `stateText` | 同 `state`，供前端直接展示标签 |
| `status` | session 当前状态，结束态为 `已结束` |
| `endedAt` | session 结束时间；未结束为空 |
| `updatedAt` | session 最近更新时间 |
| `canResume` | 仅非结束态且存在当前用户 `needs_media` moment 时为 `true` |
| `canShare` | 存在 brief / share task 时为 `true`，结束态不影响分享 |
| `canResumeMomentIds` | 结束态强制为空数组，避免误触续补入口 |
| `readyShareImageUrl` | ready task 的可分享图 URL 别名；无 ready 图则为空 |

兼容字段保留：

- `pendingMediaCount`
- `briefId`
- `shareImageTaskId`
- `shareImageStatus`
- `shareImageUrl`
- `rankingEntryEnabled`

### 本地读回样本

样本：

- `sessionId=session-1781787045680-8e406c`
- `profileId=user-1781787045678-c892b9`
- `briefId=brief-1781787045693-bc8904b9`

读回命令：

```powershell
node -e 'const {getUserSessionMomentSummaries}=require("./backend/data/moments"); const profile={id:"user-1781787045678-c892b9"}; const rows=getUserSessionMomentSummaries({profile}); const row=rows.find(item=>item.sessionId==="session-1781787045680-8e406c"); console.log(JSON.stringify({sessionId:row&&row.sessionId,state:row&&row.state,status:row&&row.status,endedAt:Boolean(row&&row.endedAt),updatedAt:Boolean(row&&row.updatedAt),canResume:row&&row.canResume,canShare:row&&row.canShare,canResumeMomentIds:Array.isArray(row&&row.canResumeMomentIds)?row.canResumeMomentIds.length:null,pendingMediaCount:row&&row.pendingMediaCount,briefId:row&&row.briefId,shareImageStatus:row&&row.shareImageStatus,readyShareImageUrl:Boolean(row&&row.readyShareImageUrl)}, null, 2));'
```

响应摘要：

- `state=已结束`
- `status=已结束`
- `endedAt=true`
- `updatedAt=true`
- `canResume=false`
- `canShare=true`
- `canResumeMomentIds=0`
- `pendingMediaCount=0`
- `shareImageStatus=ready`
- `readyShareImageUrl=true`

### 改动文件

| 文件 | 改动 |
| --- | --- |
| `backend/data/moments.js` | `getUserSessionMomentSummaries()` 补 `state/status/stateText/endedAt/updatedAt/canResume/canShare/readyShareImageUrl`，结束态清空 `canResumeMomentIds` |

### 已执行验证

```powershell
node --check backend/data/moments.js
npm.cmd run check:encoding
git diff --check -- backend/data/moments.js
```

结果：

- `node --check backend/data/moments.js` 通过
- `npm.cmd run check:encoding` 通过，`Encoding check passed`
- `git diff --check -- backend/data/moments.js` / `git diff --no-index --check -- <empty> backend/data/moments.js` 通过；仅有 CRLF warning，无 whitespace error

### 放行口径

- 后端/API 字段合同已满足前端 `PR-FE-ME-ENDED-SESSION-LABEL-008CC` 消费条件。
- 仍需前端/测试复测个人中心是否使用 `stateText/state/status` 显示“已结束”标签，且不再展示 resume 入口。

## 54. PR-BE-ME-ENDED-SESSION-FIELDS-RUNTIME-008CE：个人中心摘要运行态字段重载补证

### 退回根因

- 008CB 源码字段已存在，但测试本地 `127.0.0.1:3221` 仍由旧 Node 进程提供响应。
- 重启前只读 HTTP 复测：`GET /api/v1/user/session-moment-summaries` HTTP 200，但目标 `session-1781787045680-8e406c` 只返回旧字段集合，缺 `state/stateText/status/endedAt/updatedAt/canResume/canShare/readyShareImageUrl`。
- 本轮未发现数据层缺口：`backend/data/admin-store.json` 中目标 session 已有 `state/status=已结束`，且 `endedAt/updatedAt` 存在。

### 运行态命令

确认旧进程：

```powershell
Get-NetTCPConnection -LocalPort 3221
Get-CimInstance Win32_Process -Filter "ProcessId=23308" | Select-Object ProcessId,CommandLine
```

旧运行态摘要：

- PID：`23308`
- CommandLine：`node server.js`
- `GET /api/v1/user/session-moment-summaries`：HTTP 200，但目标行缺 008CB 新字段

本地测试服务重载：

```powershell
Stop-Process -Id 23308 -Force
$env:PORT='3221'
Start-Process -FilePath 'npm.cmd' -ArgumentList @('--prefix','backend','start') -WorkingDirectory 'F:\codexlist\jiuzhuopanguan' -WindowStyle Hidden
```

重载后：

- 新 PID：`12248`
- CommandLine：`node server.js`
- `GET /api/v1/config/home`：HTTP 200 / `code=0`

### 目标接口响应摘要

接口：

```http
GET http://127.0.0.1:3221/api/v1/user/session-moment-summaries
```

鉴权：

- profileId：`user-1781787045679-f3f2eb`
- token 后 8 位：`b8615971`
- 完整 token 仅从本地 `backend/data/social-store.json` 读取用于请求 header，未写入公开文档。

目标样本响应：

- `sessionId=session-1781787045680-8e406c`
- `state=已结束`
- `stateText=已结束`
- `status=已结束`
- `endedAt=true`
- `updatedAt=true`
- `canResume=false`
- `canShare=true`
- `canResumeMomentIds=0`
- `pendingMediaCount=0`
- `briefId=brief-1781787045693-bc8904b9`
- `shareImageStatus=ready`
- `shareImageUrl=true`
- `readyShareImageUrl=true`

响应 key 已包含：

- `state`
- `stateText`
- `status`
- `endedAt`
- `updatedAt`
- `canResume`
- `canShare`
- `readyShareImageUrl`

### 改动范围

- 本轮未新增源码补丁；执行的是本地 3221 测试服务重载，让 008CB 的 `backend/data/moments.js` 字段生效。
- 不删除 session、moments、brief、share task。
- 不 cleanup 冻结样本。
- 不触碰 `api.pomer.cn`，不触碰 `pomer.cn` 官网。

### 已执行验证

```powershell
node --check backend/data/moments.js
node --check backend/server.js
npm.cmd run check:encoding
git diff --check -- backend/data/moments.js backend/server.js
```

结果：

- `node --check backend/data/moments.js` 通过
- `node --check backend/server.js` 通过
- `npm.cmd run check:encoding` 通过，`Encoding check passed`
- `git diff --check -- backend/data/moments.js backend/server.js` 通过；仅有 CRLF warning，无 whitespace error

### 复测放行口径

- 后端本地 3221 运行态已经加载 008CB 字段，目标样本接口响应满足个人中心“已结束”标签消费条件。
- 可重新放行测试 `PR-QA-ME-ENDED-SESSION-LABEL-008CC-RETEST-2`。
- 前端/测试仍需确认 `/pages/me/index` 是否重新请求并消费 `stateText/state/status`，以及 `visiblePendingAlbums[].isEnded/stateLabel/actionLabel` 映射是否更新。

## 55. PR-BE-ME-ALBUM-SHARE-IA-FIELDS-008CI：个人中心相册/待分享/分享图 IA 字段只读核查

### 本轮结论

- 本轮只读核查，不改源码、不重启、不部署、不清数据、不触碰 `pomer.cn` 官网。
- `GET /api/v1/user/session-moment-summaries` 当前字段足以支持：
  - 相册/回忆数：按返回记录全量计数，包含 `进行中` 与 `已结束`。
  - 待分享回忆：前端可筛 `非结束态 && !readyShareImageUrl`。
  - 顶部不重复“待分享”：后端已提供分组判定字段，前端可只在列表分区展示。
- 当前字段只能支持“每个聚会当前绑定的分享图入口”；如果用户要求“同一聚会历史生成过的所有 ready 分享图逐个打开”，现有摘要接口不够，需要新增最小列表合同。

### 当前可用字段表

接口：

```http
GET /api/v1/user/session-moment-summaries
```

已确认每条摘要含以下字段：

| 需求 | 可用字段 | 前端筛选口径 |
| --- | --- | --- |
| 相册/回忆数 | `sessionId/state/status/stateText/endedAt` | 直接按摘要记录总数统计；不按状态排除 |
| 进行中/已结束标签 | `state/stateText/status/endedAt` | `stateText || state || status` 展示；`endedAt` 辅助排序/说明 |
| 待分享回忆 | `state/status/readyShareImageUrl/shareImageStatus/shareImageTaskId/canShare` | `!state.includes("结束") && !status.includes("结束") && !readyShareImageUrl` |
| 已生成分享图入口 | `shareImageTaskId/shareImageStatus/shareImageUrl/readyShareImageUrl/canShare` | `shareImageStatus==="ready" && readyShareImageUrl`；打开 `shareImageTaskId` 或 `readyShareImageUrl` |
| 禁止继续进行中入口 | `canResume/canResumeMomentIds/state/status` | 结束态 `canResume=false` 且 resume IDs 为空 |

### 只读接口摘要

本地 3221 运行态：

- `GET /api/v1/user/session-moment-summaries`
- profileId：`user-1781787045679-f3f2eb`
- token 后 8 位：`b8615971`
- HTTP：`200`
- `code=0`

摘要统计：

- 返回记录数：`5`
- 可作为相册/回忆总数：`5`
- 待分享候选：`4`
  - `session-1781863809747-96b0b0`：`state=进行中`，`shareImageStatus=pending`，无 ready 图
  - `session-1781810995640-edd086`：`state=进行中`，`shareImageStatus=pending`，无 ready 图
  - `session-1781810681607-249f31`：`state=进行中`，无 share task
  - `session-1781808709710-8f00b7`：`state=进行中`，无 share task
- 已生成分享图候选：`1`
  - `session-1781787045680-8e406c`
  - `shareImageTaskId=share-task-1781865942423-96fd9bd9`
  - `shareImageStatus=ready`
  - `readyShareImageUrl=true`

### 分享图合集缺口

只读 store 核查显示：

- `backend/data/moments-store.json` 当前共有 `18` 个 share image task。
- `session-1781787045680-8e406c` 下有 `6` 个 task，其中 `4` 个为 ready 且有图片。
- 但 `GET /api/v1/user/session-moment-summaries` 只返回当前 brief 绑定的一个 `shareImageTaskId/readyShareImageUrl`。

因此：

- 若前端 008CI 只需要“每个聚会一个当前 ready 分享图入口”，可直接消费现有字段。
- 若产品定义的“分享图合集”必须展示用户生成过的全部 ready 分享图，当前合同不够。

建议的最小后端补充合同：

```http
GET /api/v1/user/share-image-summaries
```

返回白名单字段：

- `taskId`
- `sessionId`
- `sessionName`
- `briefId`
- `status`
- `imageUrl`
- `readyShareImageUrl`
- `posterImageUrl`
- `createdAt`
- `updatedAt`
- `finishedAt`

过滤口径：

- 只返回当前用户所属 session 的任务。
- 默认只返回 `status=ready` 且存在真实 `imageUrl/readyShareImageUrl` 的任务。
- 不用默认图或空 URL 冒充已生成分享图。
- 不返回内部 debug 字段、raw permissions、完整 token。

### 是否需要前端等待

- 相册/回忆数、待分享回忆、当前 ready 分享图入口：前端不需要等待后端，可直接用 `GET /api/v1/user/session-moment-summaries`。
- 完整“分享图合集”多任务列表：前端需要等待 PM/前端明确是否必须展示全部历史 ready task；若必须，后端需另接最小接口实现任务。
