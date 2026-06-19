# 酒桌判官精彩瞬间数据与运营指标计划

更新时间：2026-06-18

角色：数据/运营指标负责人

## 1. 文档定位

本文只维护“精彩瞬间时间线与分享增长”迭代的数据指标口径、埋点缺口、报表需求和运营验收证据要求。

数据/运营指标负责人不得修改 PM 总进度、前端计划、后端计划、后台计划、测试计划或其他角色完成结论。本文中的“口径已定义”不等于开发完成；凡缺少埋点、接口、数据表、报表或验收记录的指标，统一标记为“待埋点 / 待报表 / 待联调 / 待验收”。

## 2. 已读取材料

| 类型 | 文件 | 数据侧结论 |
| --- | --- | --- |
| 协作规则 | `AGENTS.md` | 数据侧只能维护本指标文档；依赖其他角色时只能标记待联调、阻塞或待复核 |
| 团队通知 | `docs/gameplay-moments-team-announcements.md` | 数据/运营指标负责人职责已公告，但仍属于建议补齐；需补指标口径、埋点验收和报表责任人 |
| PM 台账 | `docs/gameplay-moments-progress-tracker.md` | M0/M1/M3/M4/M5 有部分代码和 smoke 证据，但数据/运营指标报表未闭环 |
| 总控规格 | `docs/gameplay-moments-development-spec.md` | M1-M5 明确 opening、moment、brief、share task、review、report、nomination、reward 等业务对象 |
| 业务流程 | `docs/business-flow.md` | 精彩瞬间时间线仍缺真机、线上后台写操作、UGC 反例和报表闭环 |
| 运营归档 | `docs/archive/gameplay-auction-moments-operation-plan.md` | 已给出开场打卡参与率、精彩瞬间上传率、分享图生成成功率等目标值 |
| 后端计划 | `docs/gameplay-moments-backend-development-plan.md` | moments、share task、report、nomination、reward、admin review 等数据源已有首轮实现证据，但聚合指标接口未定义 |
| 前端计划 | `docs/gameplay-moments-frontend-development-plan.md` | 页面和服务层已有代码证据，但真机联调、事件埋点和页面级指标验收仍缺 |
| 改版需求 | `docs/party-recorder-redesign-requirements.md` | 2026-06-17 已明确“拍照记录 + 酒桌记账 / 聚会账本”双主线并存，并共同进入分享页和分享截图保存 |
| Clean Slate 总控 | `docs/party-recorder-clean-slate-reset-plan.md` | 2026-06-18 起指标视角重建为“聚会记录师”新项目，不再以旧玩法、惩罚、欠酒、战报、榜单作为默认增长主线 |

## 3. 当前可用数据源盘点

| 数据源 | 当前证据 | 可支撑指标 | 当前限制 |
| --- | --- | --- | --- |
| `moment_records` / `momentsStore.momentRecords` | DDL 草案和 JSON store 已出现 | 开场打卡率、瞬间上传率、私密使用率、二审通过率 | DDL 实体表仍待 DBA/运维复核；缺运营聚合接口和报表 |
| `session_briefs` / `momentsStore.sessionBriefs` | brief 接口和页面基础已出现 | 简报生成、分享图分母、可推举内容池 | 真机简报页与固定酒局联调未完成 |
| `share_image_tasks` | share task 状态机、后台监控页、本地/线上 process 证据已出现 | 分享图生成成功率、失败率、重试率 | 缺真实全状态样本、前端预览/保存验收和成功率报表 |
| `moment_reports` | 举报处理后台页和动作接口已有本地 smoke | 举报通过率、举报处理率 | 缺真实举报样本、线上后台写操作、前台状态同步 |
| `moment_nominations` | 推举接口、资格、扣积分本地/HTTP smoke 已出现 | 推举转化、推举成功率、退款率 | 缺真机榜单页、线上 M5 写入和曝光/点击埋点 |
| `ranking_reward_payouts` | 奖励发放 action 和记录结构已出现 | 奖励发放成功率、重复发放跳过率 | 缺线上发奖窗口、失败/重复发放页面验收 |
| `pointsLedger` | 推举扣分、退款、榜单奖励写入路径已出现 | 推举扣减、退款、奖励流水追溯 | 缺后台流水页面复核和线上真实样本 |
| `analytics_events` / `/api/v1/analytics/events` | 旧埋点入口已存在 | 可扩展为事件漏斗 | 现有事件主要服务旧战报，如 `report_view`、`report_share`、`report_replay`；缺 moments 专用事件名和字段 |
| 后台动态页 metrics | `content-moments-review`、`content-moment-reports`、`growth-share-tasks`、`commerce-ranking-rewards` 已有页面 metrics | 可作为处理队列状态参考 | 不是运营指标看板，缺趋势、漏斗、转化率和测试数据过滤 |

## 4. 指标口径表

### 4.1 开场打卡率

| 字段 | 口径 |
| --- | --- |
| 指标状态 | 待报表 / 待真机联调 |
| 分子 | 统计窗口内，至少有 2 个不同本局成员上传 `nodeType=opening` 且未被删除/隐藏的酒局数 |
| 分母 | 统计窗口内创建并进入进行中或已结束状态的有效酒局数 |
| 统计窗口 | 默认按自然日，时区 `Asia/Shanghai`；运营报表需支持最近 7 日、30 日 |
| 去重规则 | 同一 `sessionId + uploaderProfileId + nodeType=opening` 只计 1 人；用户替换开场照不重复计数 |
| 排除测试数据规则 | 排除 session 名称、clientDraftId、caption、profileId 或 inviteCode 含 `QA-`、`IT-MOMENTS-`、`smoke-`、`ui-smoke-`、`test-` 的数据；排除脚本执行后标记清理的数据 |
| 数据来源表/接口 | `moment_records.node_type=opening`；酒局来源为 liveSessions / sessions；前端入口为 `waiting-room -> moment-editor?nodeType=opening` |
| 缺少的埋点/接口/报表 | 缺 `moment_opening_submit_success` 埋点；缺按 session 聚合的开场打卡率接口；缺后台指标卡和趋势图 |
| 验收方式 | 接口联调负责人提供固定三用户酒局；前端提交等待室上传/替换真机截图；后端导出 opening 数据；后台报表展示分子、分母、比率并与原始记录对账 |

### 4.2 瞬间上传率

| 字段 | 口径 |
| --- | --- |
| 指标状态 | 待报表 / 待真机联调 |
| 分子 | 统计窗口内，至少有 1 条有效精彩瞬间的酒局数；有效精彩瞬间包含 `nodeType in opening/highlight/drinking/private/closing` 的用户 moment，排除纯辅助 `session_events` |
| 分母 | 统计窗口内创建并进入进行中或已结束状态的有效酒局数 |
| 统计窗口 | 默认按自然日，时区 `Asia/Shanghai`；运营报表需支持最近 7 日、30 日 |
| 去重规则 | 酒局维度只计是否发生；人均瞬间数另按有效 moment 数 / 参与成员数计算；同一 `clientDraftId` 幂等重复提交只计 1 条 |
| 排除测试数据规则 | 同 4.1；额外排除 smoke 脚本生成后已清理或标记为临时的 moment |
| 数据来源表/接口 | `moment_records`；创建接口 `POST /sessions/:sessionId/moments`；编辑/补图接口 `PUT /moments/:momentId` |
| 缺少的埋点/接口/报表 | 缺 `moment_submit_success`、`moment_submit_failed`、`moment_upload_failed` 埋点；缺上传率和人均瞬间数聚合接口；缺按节点类型拆分报表 |
| 验收方式 | 用固定酒局写入 opening/highlight/private/closing；对账 `moment_records` 与报表；测试提交真机上传、失败重试和幂等记录 |

### 4.3 私密使用率

| 字段 | 口径 |
| --- | --- |
| 指标状态 | 待埋点 / 待联调 / 待报表 |
| 分子 | 统计窗口内，`nodeType=private` 或 `visibility in private/selected` 的有效 moment 数 |
| 分母 | 统计窗口内全部有效用户 moment 数；运营可选另看“有私密使用的酒局数 / 有 moment 的酒局数” |
| 统计窗口 | 默认按自然日，时区 `Asia/Shanghai`；支持按酒局、用户、节点类型筛选 |
| 去重规则 | 按 `momentId` 去重；同一私密 moment 的多个接收人不重复计入分子；替换/编辑不重复计数 |
| 排除测试数据规则 | 同 4.1；三用户权限联调样本需可用固定前缀过滤 |
| 数据来源表/接口 | `moment_records.node_type`、`visibility`、`visible_profile_ids_json`；timeline 接口验证非接收者占位 |
| 缺少的埋点/接口/报表 | 缺 `moment_private_submit_success`、`moment_private_receiver_count` 埋点；缺私密使用率报表；缺三用户真机权限验收记录 |
| 验收方式 | A 发私密给 B，B 可见正文和图，C 只看占位；接口响应摘要和前端截图同时归档；报表仅统计数量，不展示私密正文或完整接收名单 |

### 4.4 分享图生成成功率

| 字段 | 口径 |
| --- | --- |
| 指标状态 | 待报表 / 待视觉验收 / 待前端真机联调 |
| 分子 | 统计窗口内进入终态 `ready` 且 `imageUrl` 可 GET 200 的 share image task 数 |
| 分母 | 统计窗口内创建的 share image task 数，包含 `pending/processing/ready/failed/expired`；可另看排除未超时 pending 的成熟分母 |
| 统计窗口 | 默认按任务创建日自然日；另需支持按完成日统计 |
| 去重规则 | 同一 `briefId + layoutMode` 未终态任务复用时只计 1 个任务；重试不新增分母，重试次数单独统计 |
| 排除测试数据规则 | 排除固定测试前缀 session/brief/task；排除 smoke 后已清理任务和本地临时 PNG |
| 数据来源表/接口 | `share_image_tasks.status`、`image_url`、`failure_reason`、`retry_count`；接口 `POST /session-briefs/:briefId/share-image-tasks`、`POST /share-image-tasks/:taskId/process`、`GET /share-image-tasks/:taskId` |
| 缺少的埋点/接口/报表 | 缺 `share_task_create`、`share_task_ready`、`share_task_failed`、`share_image_view`、`share_image_save_success` 埋点；缺失败原因分布和成功率趋势报表 |
| 验收方式 | 构造 pending、processing、ready、failed、expired 样本；ready 图片 GET 返回 `image/png`；前端提交预览/保存真机证据；后台报表展示成功率、失败率、重试率 |

### 4.5 推举转化

| 字段 | 口径 |
| --- | --- |
| 指标状态 | 第二阶段观察 / 待埋点 / 待真机联调 / 待报表 |
| 分子 | 统计窗口内成功创建 active nomination 的次数或用户数；默认主指标用成功推举次数 |
| 分母 | 默认使用可推举瞬间曝光次数；若曝光埋点未完成，临时用可推举瞬间所在 brief/rankings 访问用户数作为替代分母，并标注口径降级 |
| 统计窗口 | 默认按自然日，时区 `Asia/Shanghai`；需支持按榜单 category 拆分 |
| 去重规则 | 后端已限制同一用户同一 moment 同一 category 每天最多 1 次；报表按 `profileId + momentId + category + date` 去重 |
| 排除测试数据规则 | 排除测试 session、moment、profile、category 样本；排除 smoke 生成的 nomination |
| 数据来源表/接口 | `moment_nominations`；接口 `GET /rankings/today`、`GET /moments/:momentId/nomination-eligibility`、`POST /moments/:momentId/nominations`；积分流水 `pointsLedger(kind=moment-nomination)` |
| 缺少的埋点/接口/报表 | 缺 `nomination_entry_exposure`、`nomination_confirm_open`、`nomination_submit_success`、`nomination_submit_failed` 埋点；缺推举漏斗报表；缺积分不足、重复推举、资格不满足失败分布 |
| 验收方式 | 固定榜单数据下，前端真机验证曝光、确认、成功、重复 409、积分不足和不可推举态；后端对账 nomination 与 pointsLedger |

### 4.6 奖励发放

| 字段 | 口径 |
| --- | --- |
| 指标状态 | 待线上写入验收 / 待报表 |
| 分子 | 统计窗口内 `ranking_reward_payouts.status=granted` 且用户 `pointsLedger(kind=ranking-reward)` 已写入的奖励条数 |
| 分母 | 统计窗口内按启用奖励规则和榜单名次计算出的应发奖励条数；重复触发已跳过的记录不进入应发分母，可单独统计跳过数 |
| 统计窗口 | 默认按榜单日期 `date`；运营报表需支持按发放时间和 category 筛选 |
| 去重规则 | 使用 `sourceId` 或 `category + date + momentId + rank + ruleId` 幂等去重；重复触发只计一次成功或一次跳过 |
| 排除测试数据规则 | 排除测试 category/session/moment/profile/sourceId；线上发奖测试必须使用固定前缀和回收方案 |
| 数据来源表/接口 | `ranking_reward_payouts`；`pointsLedger(kind=ranking-reward)`；后台接口 `POST /admin/ranking-rewards/grant`；后台配置 `commerce-ranking-rewards` |
| 缺少的埋点/接口/报表 | 缺奖励发放结果报表、失败原因、跳过原因、重复发放统计；缺线上后台发奖按钮点击和流水页面验收 |
| 验收方式 | 后台负责人在线上测试窗口触发指定 category 发奖；测试复核 `rankingRewardPayouts`、pointsLedger、operationLogs 和重复触发幂等结果 |

### 4.7 二审通过率

| 字段 | 口径 |
| --- | --- |
| 指标状态 | 待真实样本 / 待报表 |
| 分子 | 统计窗口内二审结果为 `secondaryReviewStatus=approved` 的 moment 数 |
| 分母 | 统计窗口内进入二审处理的 moment 数；默认包含 `approved/rejected/require_resubmit`，不包含仍为 `pending` 且未处理的积压项 |
| 统计窗口 | 默认按二审处理时间；若缺处理时间，临时按 `updatedAt`，并标注口径降级 |
| 去重规则 | 同一 moment 多次二审处理默认按最后一次有效处理结果计入；如需运营效率报表，另统计处理次数 |
| 排除测试数据规则 | 排除测试 moment、session、operator；保留真实运营样本 |
| 数据来源表/接口 | `moment_records.review_status`、`secondary_review_status`；后台 `content-moments-review`；操作日志 `logType=瞬间审核` |
| 缺少的埋点/接口/报表 | 缺二审处理时间、处理人、原因的结构化报表；缺二审通过率趋势和积压队列报表；缺线上后台真实样本 |
| 验收方式 | 后台用真实待审 moment 执行 approve、reject、require_resubmit、remove_ranking；测试对账 moment 状态和 operationLogs；报表展示通过率和积压数 |

### 4.8 举报通过率

| 字段 | 口径 |
| --- | --- |
| 指标状态 | 待真实举报样本 / 待报表 |
| 分子 | 统计窗口内处理结果为有效的举报数；默认包含 `valid_hide`，运营可选把 `require_resubmit`、`remove_ranking` 计为部分有效并单独拆分 |
| 分母 | 统计窗口内已处理举报数；不含仍为 `pending` 的举报积压 |
| 统计窗口 | 默认按举报处理时间；若缺处理时间，临时按 `handledAt` 或 `updatedAt`，并标注口径降级 |
| 去重规则 | 同一 reportId 只计一次最终处理结果；同一 moment 多条举报分别计举报处理量，另可按 moment 去重查看涉事内容数 |
| 排除测试数据规则 | 排除测试 report、moment、session、profile；真实举报样本需由测试和风控确认可用于运营报表 |
| 数据来源表/接口 | `moment_reports.status`、`handled_by`、`handled_at`；后台 `content-moment-reports`；操作日志 `logType=瞬间举报` |
| 缺少的埋点/接口/报表 | 缺举报处理结果枚举的运营报表；缺举报原因分布、处理时长、有效率趋势；缺线上真实举报样本和前台同步验收 |
| 验收方式 | 构造或收集真实举报样本，后台执行 valid_hide、invalid_keep、require_resubmit、remove_ranking；测试复核 moment 状态、前台展示、operationLogs 和报表数字 |

## 5. 必须补齐的埋点事件建议

| 事件名 | 触发端 | 关键字段 | 支撑指标 | 当前状态 |
| --- | --- | --- | --- | --- |
| `moment_opening_submit_success` | 小程序/后端 | `sessionId`、`momentId`、`profileId`、`clientDraftId` | 开场打卡率 | 待埋点 |
| `moment_submit_success` | 小程序/后端 | `sessionId`、`momentId`、`nodeType`、`visibility`、`hasImage` | 瞬间上传率、私密使用率 | 待埋点 |
| `moment_submit_failed` | 小程序 | `sessionId`、`nodeType`、`errorCode`、`stage` | 上传失败分析 | 待埋点 |
| `private_moment_timeline_view` | 后端或小程序 | `sessionId`、`momentId`、`viewerRole`、`isPlaceholder` | 私密权限验收 | 待埋点，注意不能记录正文 |
| `share_task_create` | 后端 | `sessionId`、`briefId`、`taskId`、`layoutMode` | 分享图分母 | 待埋点 |
| `share_task_ready` | 后端 | `taskId`、`durationMs`、`selectedNodeCount` | 分享图成功率 | 待埋点 |
| `share_task_failed` | 后端 | `taskId`、`failureReason`、`retryCount` | 分享图失败率 | 待埋点 |
| `share_image_view` | 小程序 | `taskId`、`briefId`、`entryPage` | 分享图查看率 | 待埋点 |
| `share_image_save_success` | 小程序 | `taskId`、`briefId` | 分享图保存率 | 待埋点 |
| `nomination_entry_exposure` | 小程序 | `momentId`、`category`、`entryPage`、`eligible` | 推举转化分母 | 待埋点 |
| `nomination_submit_success` | 后端 | `momentId`、`category`、`profileId`、`pointsSpent` | 推举转化分子 | 待埋点 |
| `nomination_submit_failed` | 后端/小程序 | `momentId`、`category`、`errorCode` | 推举失败分析 | 待埋点 |
| `ranking_reward_grant_result` | 后端/后台 | `category`、`date`、`grantedCount`、`skippedCount`、`failedCount` | 奖励发放 | 待埋点/待报表 |
| `moment_review_action` | 后端/后台 | `momentId`、`action`、`operator`、`result` | 二审通过率 | 可从 operationLogs 推导，待结构化报表 |
| `moment_report_handle` | 后端/后台 | `reportId`、`momentId`、`action`、`operator`、`result` | 举报通过率 | 可从 operationLogs 推导，待结构化报表 |

## 6. 报表需求

建议新增后台报表入口：`growth-moments-metrics` 或在“增长与数据”下新增“精彩瞬间指标”。

首轮报表最小字段：

| 模块 | 指标 |
| --- | --- |
| 酒局参与 | 开场打卡率、瞬间上传率、人均瞬间数、私密使用率 |
| 分享增长 | 简报生成数、分享图任务数、分享图生成成功率、失败原因 Top、查看率、保存率 |
| 推举榜单 | 可推举内容数、推举曝光、推举提交、推举成功率、重复/失败原因、退款数 |
| 奖励发放 | 应发数、已发数、跳过数、失败数、发放积分、重复发放拦截 |
| 内容审核 | 待审数、二审通过率、要求重传率、隐藏率、处理时长 |
| 举报处理 | 举报数、已处理数、举报通过率、无效举报率、处理时长 |

报表必须支持：

- 时间筛选：今日、昨日、近 7 日、近 30 日、自定义。
- 测试数据过滤：默认排除 `QA-`、`IT-MOMENTS-`、`smoke-`、`ui-smoke-`、`test-`。
- 维度筛选：节点类型、榜单 category、任务状态、审核状态、举报处理结果。
- 明细下钻：能从指标跳到对应 moment、session、task、report、nomination 或 payout。
- 导出：CSV 或后台表格复制，供运营验收和复盘。

## 7. 当前阻塞项

| 阻塞项 | 影响指标 | 缺少角色 | 缺少证据 |
| --- | --- | --- | --- |
| 固定测试酒局和账号未正式沉淀 | 全部指标 | 接口联调 / 测试 | sessionId、profileId、token/账号说明、清理策略 |
| 小程序真机联调未提交 | 开场打卡率、瞬间上传率、私密使用率、推举转化、分享图查看/保存 | 前端 / 测试 | 真机截图/录屏、入口路径、失败态记录 |
| 线上后台写操作未验收 | 二审通过率、举报通过率、奖励发放 | 后台 / 测试 / UGC 风控 | 真实样本、页面点击录屏、operationLogs、前台状态同步 |
| DDL 实体表未在可用 MySQL 环境复核 | 全部表级报表 | DBA/运维 | DDL 执行记录、表结构截图或导出、回滚方案 |
| moments 专用 analytics 事件未定义和接入 | 漏斗类指标 | 后端 / 前端 / 运营 | 事件名、字段、触发点、去重规则、验收样本 |
| 指标后台报表未实现 | 全部指标 | 后台 / 后端 | 报表 slug、聚合接口、测试数据过滤、导出能力 |

## 8. 角色协作需求

| 角色 | 需要提供 |
| --- | --- |
| 运营 | 确认目标值、统计窗口、是否采用“酒局维度”或“事件维度”为主口径；确认 `require_resubmit`、`remove_ranking` 是否计入举报部分有效 |
| 前端 | 在 waiting-room、moment-editor、session-brief、share-poster、rankings 接入事件触发点；提交真机路径、截图和失败态记录 |
| 后端/API | 定义 moments 专用埋点 schema；补聚合接口；保证后端成功/失败事件与业务写入同源；提供测试数据过滤能力 |
| 后台 | 新增指标报表入口；展示趋势、漏斗、失败原因、处理通过率和导出能力；提供真实后台样本截图 |
| 测试/验收 | 建立指标验收用例；用固定三用户酒局跑一轮数据；对账原始表、接口响应和后台报表 |
| 接口联调 | 维护固定测试酒局、opening/highlight/private/event、failed/expired share task、待审 moment、举报样本、可推举 moment |
| UGC 风控 | 确认私密、未授权、待补图、隐藏、要求重传内容在分享图、榜单、奖励指标中的排除规则 |
| DBA/运维 | 在可用 MySQL 环境复核 moments 相关实体表和查询性能；确认线上报表读取不会影响生产服务 |

## 9. 第一轮落地顺序

| 顺序 | 任务编号 | 负责人 | 动作 | 准出证据 |
| --- | --- | --- | --- | --- |
| 1 | `DATA-M0-01` | 数据/运营指标 + 运营 | PM 确认本文 8 个指标口径、目标值和测试数据过滤规则 | 运营签字或 PM 确认记录 |
| 2 | `DATA-M0-02` | 后端/API | 定义 moments 专用 analytics 事件和聚合接口草案 | API 合同、事件字段、错误码和样例 |
| 3 | `DATA-M0-03` | 前端 | 标注并接入首批事件触发点：opening、moment submit、share image view/save、nomination exposure/submit | 代码证据、真机截图、事件上报样本 |
| 4 | `DATA-M0-04` | 后台 | 新增或规划 `growth-moments-metrics` 报表入口 | 页面 schema、指标卡、筛选项、导出需求 |
| 5 | `DATA-QA-001` | 测试/接口联调 | 用固定三用户酒局跑一轮指标对账 | 原始数据、接口响应、报表截图、差异说明 |
| 6 | `DATA-DB-001` | DBA/运维 | 复核实体表和查询可用性 | DDL 执行记录、表结构截图或导出、回滚方案 |

## 10. 聚会记录师指标口径重构

产品改版后，数据侧主线从“游戏胜负 / 判官 / 积分榜单”调整为“创建聚会、拍第一张照片、邀请参与、共同上传、分享页传播、相册回访”。本节只定义新口径和研发拆分输入，不代表埋点、接口、报表或验收已经完成。

### 10.1 新核心指标表

| 指标 | 分子 | 分母 | 统计窗口 | 去重规则 | 排除测试数据规则 | 数据来源表/接口 | 缺少的埋点/接口/报表 | 验收方式 | 当前状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 三步创建完成率 | 完成“创建聚会 -> 选择/默认主题 -> 获得房间并进入开始记录/拍第一张入口”的创建流程数 | 点击首页 `创建聚会` 并进入创建流程的次数或用户数；默认以流程次数为主 | 默认按创建开始时间自然日，时区 `Asia/Shanghai`，支持近 7 日、30 日 | 同一 `clientFlowId` 只计 1 次；重复点击但未生成新 `partyId/sessionId` 不重复计入分子 | 排除 `QA-`、`IT-MOMENTS-`、`smoke-`、`ui-smoke-`、`test-` 前缀的 party/session/profile/inviteCode/clientFlowId | 新聚会房间表或现有 `liveSessions/sessions`；创建接口；前端首页创建入口 | 缺 `party_create_start`、`party_create_step_complete`、`party_create_success`；缺创建漏斗聚合接口；缺后台报表 | 前端真机跑 3 步创建；后端对账创建成功记录；后台报表展示每步人数、完成率、失败原因 | 待埋点 / 待接口 / 待报表 / 待验收 |
| 首张照片完成率 | 创建者在新聚会内成功拍摄或上传第一张有效照片的聚会数 | 统计窗口内成功创建的有效聚会数 | 默认按聚会创建时间自然日；可另按首张照片上传时间看延迟 | 同一 `partyId/sessionId` 只计第一张 `photoId/momentId`；替换图片不重复计数 | 同上；排除无效、删除、审核隐藏、脚本清理照片 | 照片表或现有 `moment_records`；上传接口；第一张照片标识 | 缺 `party_first_photo_open`、`party_first_photo_upload_success`、`party_first_photo_upload_failed`；缺首张照片延迟报表 | 固定账号创建聚会后上传首张照片；对账 photo/moment 原始记录、事件流和报表 | 待埋点 / 待接口 / 待报表 / 待真机验收 |
| 邀请转化 | 通过邀请链接/二维码成功加入聚会的参与者数 | 邀请页打开数或邀请分享点击数；首轮建议以邀请页打开数为主分母 | 默认按邀请页打开时间自然日；支持按聚会、渠道、分享人筛选 | 同一 `inviteCode + inviteeProfileId` 只计 1 次成功加入；同一访客多次打开只按 `visitorId/clientEventId` 去重 | 同上；排除运营演示账号和固定压测 inviteCode | 邀请码/分享记录表；加入聚会接口；分享页/邀请页访问日志 | 缺 `party_invite_share_tap`、`party_invite_page_open`、`party_invite_join_success`、`party_invite_join_failed`；缺渠道维度报表 | 构造 creator 分享、participant 打开并加入；对账 inviteCode、join 记录和事件漏斗 | 待埋点 / 待接口 / 待报表 / 待验收 |
| 参与者上传率 | 至少 1 名非创建者成功上传照片的聚会数；另可看非创建者上传人数 / 加入人数 | 有非创建者加入的有效聚会数 | 默认按聚会创建时间自然日；另支持按照片上传时间 | 同一 `partyId/sessionId + uploaderProfileId` 只计 1 名参与者；同一用户多张照片计入人均照片数但不重复计入上传率分子 | 同上；排除被删除、隐藏、待补图失败照片 | 照片表或 `moment_records`；成员表；上传接口 | 缺 `party_photo_upload_success`、`party_photo_upload_failed`、成员角色字段；缺参与者上传率报表 | 固定三用户聚会中创建者和参与者分别上传；报表能区分 creator/participant | 待埋点 / 待接口 / 待报表 / 待真机验收 |
| 分享页打开率 | 有至少 1 次分享页有效打开的聚会数；另可看打开 PV/UV | 已生成或已分享的有效聚会分享页数 | 默认按分享页打开时间自然日；支持按聚会创建日回看 | 同一 `shareId/partyId + visitorId` 统计 UV 去重；PV 单独展示；机器人或健康检查不计入 UV | 同上；排除 smoke 分享页、健康检查 UA/IP、后台预览 | 分享页访问日志；分享页接口；现有 share task 可作为兼容参考 | 缺 `party_share_page_open`、`party_share_page_generate_success`、`party_share_page_generate_failed`；缺分享页打开率报表 | 用真实分享入口打开分享页；后端记录 open 事件；报表对账分享页分母和 UV | 待埋点 / 待接口 / 待报表 / 待验收 |
| 相册回访率 | 聚会创建后次日或 7 日内再次打开相册的用户数或聚会数；首轮建议用用户 D1 回访率 | 有相册访问资格且首日打开过相册的用户数或聚会数 | 默认 D1：创建日后第 1 个自然日；另支持 D7 | 同一 `partyId/sessionId + profileId + date` 只计 1 次回访；创建当日多次打开不算 D1 | 同上；排除内部运营巡检和后台预览 | 相册页访问事件；相册接口；成员/访问权限表 | 缺 `party_album_open`、`party_album_revisit` 或可由 open 事件聚合；缺 D1/D7 留存报表 | 固定聚会在创建日和次日打开相册；报表按用户和聚会维度输出 D1/D7 | 待埋点 / 待接口 / 待报表 / 待验收 |

### 10.2 旧指标降权与归档

| 旧指标/模块 | 改版后定位 | 处理方式 | 数据侧状态 |
| --- | --- | --- | --- |
| 开场打卡率 | 可并入“首张照片完成率”和“参与者上传率”的节点拆分 | 不再作为首屏核心验收；保留为照片节点类型分析 | 待运营确认 |
| 瞬间上传率 | 可并入“参与者上传率”和人均照片数 | 作为相册活跃二级指标 | 待运营确认 |
| 私密使用率 | 作为隐私功能使用健康指标 | 不纳入改版首轮增长主指标，继续要求隐私报表不展示正文 | 待运营确认 |
| 分享图生成成功率 | 调整为“分享页打开率”和分享页生成健康 | 生成成功率保留为技术健康二级指标，主指标看分享页实际打开 | 待运营确认 / 待报表 |
| 推举转化 | 旧榜单/积分玩法二级指标 | 不作为聚会记录师首轮核心指标；仅在保留榜单入口时观察 | 降权 / 待埋点 |
| 奖励发放 | 旧积分激励二级指标 | 不作为改版主链路验收；若保留积分任务，单独进商业化/激励报表 | 降权 / 待流水对账 |
| 二审通过率、举报通过率 | 内容安全与风控健康指标 | 继续保留，但不替代创建、上传、分享、回访指标 | 二级风控指标 / 待真实样本 |
| 惩罚、欠酒、判官、胜负、榜单 | 历史玩法兼容或可选互动 | 从核心增长指标移除；如继续开放，只看入口点击、使用率和投诉率 | 降权 / 待产品确认入口 |

### 10.3 前端/后端埋点字段需求

| 事件名 | 触发端 | 触发条件 | 前端需带字段 | 后端需补字段/处理 | 支撑指标 |
| --- | --- | --- | --- | --- | --- |
| `party_create_start` | 小程序 | 首页点击 `创建聚会` 并进入创建流程 | `clientFlowId`、`entryPage`、`source`、`profileId`、`clientTs` | 接收事件并返回 `eventId`；标记测试数据字段 | 三步创建完成率 |
| `party_create_step_complete` | 小程序 | 创建流程每一步完成 | `clientFlowId`、`step`、`themeId`、`usedDefaultTheme`、`durationMs` | 校验 step 枚举，支持按 step 聚合 | 三步创建完成率 |
| `party_create_success` | 后端/API | 聚会房间创建成功并返回邀请方式 | `clientFlowId`、`themeId`、`entryPage` | `partyId/sessionId`、`creatorProfileId`、`inviteCode`、`serverTs`、`isTestData` | 三步创建完成率、首张照片完成率 |
| `party_first_photo_open` | 小程序 | 创建后进入 `开始记录 / 拍第一张` | `partyId/sessionId`、`profileId`、`sourcePage`、`clientTs` | 关联创建成功记录，禁止采集照片内容 | 首张照片完成率 |
| `party_first_photo_upload_success` | 后端/API | 第一张照片写入成功 | `partyId/sessionId`、`clientDraftId`、`uploadSource` | `photoId/momentId`、`uploaderProfileId`、`role=creator`、`serverTs`、`reviewStatus` | 首张照片完成率 |
| `party_invite_share_tap` | 小程序 | 创建者点击微信分享/二维码/复制邀请 | `partyId/sessionId`、`profileId`、`shareChannel`、`sourcePage` | `shareId`、`inviteCode`、`serverTs` | 邀请转化 |
| `party_invite_page_open` | 小程序/后端 | 访客打开邀请页或分享页邀请入口 | `inviteCode`、`shareId`、`visitorId`、`sourceChannel`、`clientTs` | 记录 UA/IP 风险标签、去重键、`isBot`、`isTestData` | 邀请转化、分享页打开率 |
| `party_invite_join_success` | 后端/API | 访客成功加入聚会 | `inviteCode`、`shareId`、`clientEventId` | `partyId/sessionId`、`inviteeProfileId`、`inviterProfileId`、`joinRole=participant`、`serverTs` | 邀请转化、参与者上传率 |
| `party_photo_upload_success` | 后端/API | 任一成员照片写入成功 | `partyId/sessionId`、`clientDraftId`、`uploadSource`、`isFirstPhotoClientHint` | `photoId/momentId`、`uploaderProfileId`、`role`、`isFirstPhoto`、`serverTs`、`reviewStatus` | 参与者上传率、首张照片完成率 |
| `party_share_page_generate_success` | 后端/API | 分享页或相册分享资源生成成功 | `partyId/sessionId`、`layoutMode` | `shareId`、`sharePageUrl`、`serverTs`、`generationDurationMs` | 分享页打开率、生成健康 |
| `party_share_page_open` | 小程序/后端 | 分享页被有效访问 | `shareId`、`partyId/sessionId`、`visitorId`、`sourceChannel` | `serverTs`、`isBot`、`isTestData`、`referer` | 分享页打开率 |
| `party_album_open` | 小程序/后端 | 用户打开聚会相册 | `partyId/sessionId`、`profileId`、`entryPage`、`clientTs` | `memberRole`、`serverTs`、`isRevisit`、`daysSinceCreate` | 相册回访率 |

公共字段要求：所有事件必须具备 `eventId/clientEventId`、`profileId` 或匿名 `visitorId`、`partyId/sessionId`、`serverTs`、`clientTs`、`isTestData`、`appVersion`、`platform`、`sourcePage`；照片、私密内容、用户正文和完整图片内容不得进入埋点。

## 11. 运营确认表

以下问题需要运营或 PM 明确确认；确认前本文口径仍为草案，所有指标状态仍为“待埋点 / 待报表 / 待验收”。

| 确认项 | 涉及指标 | 当前建议 | 需要运营确认的问题 | 未确认影响 |
| --- | --- | --- | --- | --- |
| 目标值 | 全部指标 | 沿运营归档先使用：开场打卡参与率 60%、精彩瞬间上传率 40%、分享图生成成功率 95%、待补图补全率 30%、进行中酒局返回成功率 95%；其他指标先观察 | 是否为本迭代验收目标，还是上线后观察目标；二审通过率、举报通过率、推举转化、奖励发放是否需要首轮目标值 | 不能进入验收，只能做趋势观察 |
| 统计主维度 | 开场打卡率、瞬间上传率、私密使用率 | 开场打卡率和瞬间上传率以“酒局维度”为主，私密使用率以“moment 维度”为主 | 是否需要同时输出用户维度、人均维度和酒局维度 | 报表字段和分母会变化 |
| 统计窗口 | 全部指标 | 默认 `Asia/Shanghai` 自然日，报表支持今日、昨日、近 7 日、近 30 日 | 是否需要按酒局结束时间、moment 创建时间、任务完成时间分别统计 | 后端聚合 SQL / JSON 聚合口径会变化 |
| 测试数据过滤 | 全部指标 | 默认排除 `QA-`、`IT-MOMENTS-`、`smoke-`、`ui-smoke-`、`test-` 前缀或包含值 | 是否还有线上测试账号、运营演示账号、固定门店/员工账号需要排除 | 报表会污染真实指标 |
| 私密使用率分母 | 私密使用率 | 默认全部有效用户 moment 数；另可展示有私密使用的酒局占比 | 是否把 `selected` 和 `private` 合并；是否排除非公开授权内容 | 私密使用率会偏高或偏低 |
| 分享图成功率成熟分母 | 分享图生成成功率 | 默认全部任务为分母；另展示排除未超时 pending 的成熟成功率 | pending 多久算超时：建议 10 分钟或 30 分钟 | 成功率波动大，不适合验收 |
| 推举转化分母 | 推举转化 | 首选可推举入口曝光；埋点未完成前临时用 rankings/brief 访问人数降级 | 是否接受临时分母；是否按 category 单独看转化 | 无法判断前端入口效率 |
| 奖励发放分母 | 奖励发放 | 按启用规则和榜单名次计算应发条数 | 跳过已发、无合规内容、积分为 0 的规则是否进入分母 | 发奖成功率不可对账 |
| 二审通过率分母 | 二审通过率 | 默认只统计已处理二审，不把 pending 积压放入分母；积压数单独展示 | 是否需要把超时未处理 pending 计入运营风险指标 | 审核效率与通过率会混淆 |
| 举报通过率有效定义 | 举报通过率 | 默认 `valid_hide` 为有效；`require_resubmit`、`remove_ranking` 单独拆分 | 是否把要求重传、移出榜单也算“部分有效” | 举报有效率口径不稳定 |
| 聚会记录师目标值 | 三步创建完成率、首张照片完成率、邀请转化、参与者上传率、分享页打开率、相册回访率 | 首轮建议先确认口径和埋点，目标值上线后观察 7 日再定 | 是否需要 PM 直接给首轮验收目标；是否按 D1/D7 分别设相册回访目标 | 新改版指标只能做口径和报表设计，不能进验收 |
| 旧玩法降权边界 | 推举、奖励、惩罚、判官、榜单 | 数据侧建议全部降为二级指标或历史兼容健康指标 | 是否仍保留任何旧玩法指标作为上线准出项 | 若不确认，报表优先级和研发排期会冲突 |

## 12. 研发拆分表

以下拆分只描述数据/运营指标落地所需研发任务，不代表对应开发任务已完成。各角色完成态仍需 PM 按真实证据汇总。

| 任务编号 | 派给角色 | 研发任务 | 覆盖指标 | 输入依赖 | 输出证据 | 当前状态 |
| --- | --- | --- | --- | --- | --- | --- |
| `DATA-M0-01` | 运营 + 数据/运营指标 | 确认改版后核心指标目标值、主维度、统计窗口、测试数据过滤规则；确认旧玩法指标降权边界 | 三步创建完成率、首张照片完成率、邀请转化、参与者上传率、分享页打开率、相册回访率及旧二级指标 | 本文第 10 节、第 11 节 | 运营或 PM 确认记录；必要时修订本文口径 | 待运营确认 |
| `DATA-M0-02` | 后端/API | 设计聚会记录师 analytics 事件 schema，明确事件名、字段、触发成功/失败条件、幂等键和隐私字段禁采规则 | 三步创建、首张照片、邀请、参与者上传、分享页打开、相册回访 | 本文第 10.3 节事件字段需求 | API 合同或后端计划记录；事件样例；错误码；测试数据过滤字段 | 待埋点 |
| `DATA-M0-03` | 后端/API | 提供指标聚合接口，至少支持时间范围、测试数据过滤、party/session、role、shareChannel、D1/D7 回访筛选 | 新核心指标及旧二级指标 | 运营确认后的最终口径；party/session/photo/share/album 相关数据源 | 聚合接口样例响应；分子分母明细；与原始表对账说明 | 待接口 |
| `DATA-M0-04` | 前端 | 在首页创建、主题选择、开始记录/拍第一张、邀请页、相册页、分享页接入事件触发点；失败态也要上报 | 三步创建、首张照片、邀请、参与者上传、分享页打开、相册回访 | 后端事件 schema；固定测试聚会 | 代码证据；真机事件上报样本；失败态截图/录屏 | 待前端接入 |
| `DATA-M0-05` | 后台 | 新增或规划 `growth-party-recorder-metrics` 报表入口，展示创建漏斗、首张照片、邀请漏斗、参与者上传、分享页打开、相册 D1/D7 回访和旧二级指标 | 新核心指标及旧二级指标 | 后端聚合接口；运营确认口径 | 后台 slug/page schema；筛选项；导出字段；报表截图 | 待报表 |
| `DATA-QA-001` | 测试/验收 + 接口联调 | 用固定三用户酒局跑一轮指标对账，覆盖 opening/highlight/private/share task/nomination/review/report/reward | 全部指标 | 固定数据包、前后端埋点、后台报表 | 原始数据、接口响应、报表截图、差异说明、通过/失败记录 | 待验收 |
| `DATA-RISK-001` | UGC 风控 + 测试 | 确认私密、未授权、待补图、隐藏、要求重传内容在分享图、榜单、奖励和指标报表中的排除规则 | 私密使用率、分享图成功率、推举转化、奖励发放、二审/举报通过率 | UGC 反例矩阵；真实或固定样本 | 风控签字结论；反例接口响应；报表排除验证 | 待风控验收 |
| `DATA-DB-001` | DBA/运维 + 后端/API | 复核 moments 实体表、同步脚本和报表查询可用性，确认不以 `app_store` 通过替代实体表验收 | 全部表级报表 | 后端同步方案；PM 授权；数据库备份 | DDL 执行记录、表结构导出、同步覆盖范围、回滚方案 | 待 DBA 复核 |

## 13. 指标状态总表

| 指标 | 口径 | 埋点 | 聚合接口 | 后台报表 | 验收 |
| --- | --- | --- | --- | --- | --- |
| 三步创建完成率 | 待运营确认 | 待埋点 | 待接口 | 待报表 | 待验收 |
| 首张照片完成率 | 待运营确认 | 待埋点 | 待接口 | 待报表 | 待验收 |
| 邀请转化 | 待运营确认 | 待埋点 | 待接口 | 待报表 | 待验收 |
| 参与者上传率 | 待运营确认 | 待埋点 | 待接口 | 待报表 | 待验收 |
| 分享页打开率 | 待运营确认 | 待埋点 | 待接口 | 待报表 | 待验收 |
| 相册回访率 | 待运营确认 | 待埋点 | 待接口 | 待报表 | 待验收 |
| 开场打卡率 | 待运营确认 | 待埋点 | 待接口 | 待报表 | 待验收 |
| 瞬间上传率 | 待运营确认 | 待埋点 | 待接口 | 待报表 | 待验收 |
| 私密使用率 | 待运营确认 | 待埋点 | 待接口 | 待报表 | 待验收 |
| 分享图生成成功率 | 待运营确认 | 待埋点 | 待接口 | 待报表 | 待验收 |
| 推举转化 | 待运营确认 | 待埋点 | 待接口 | 待报表 | 待验收 |
| 奖励发放 | 待运营确认 | 待埋点/可从流水推导 | 待接口 | 待报表 | 待验收 |
| 二审通过率 | 待运营确认 | 可从 operationLogs 推导，待结构化 | 待接口 | 待报表 | 待验收 |
| 举报通过率 | 待运营确认 | 可从 operationLogs 推导，待结构化 | 待接口 | 待报表 | 待验收 |

## 14. 当前数据侧结论

截至 2026-06-15，数据/运营指标只能判定为“口径首轮已定义”。业务侧已有 moments、share task、report、nomination、reward、operationLogs 和旧 analytics 的部分数据底座，但尚不能把指标标记为完成。

当前未完成原因：

- 缺 moments 专用埋点事件和字段。
- 缺运营指标聚合接口。
- 缺后台指标报表。
- 缺固定测试数据和真机联调证据。
- 缺线上后台写操作、真实举报样本和奖励发放样本。
- 缺 MySQL 实体表复核。

因此，本文所有指标在 PM 验证前均保持“待埋点 / 待报表 / 待联调 / 待验收”，不得作为开发完成或上线准出结论。

## 15. 当前 manifest 对指标验收的支撑与缺口

PM 当前事实说明 manifest 可支撑部分样本对账：session、opening/highlight/private、share task 四态、report、nomination、rewardPayout；但 `operationLogIds`、`pointsLedgerIds` 为空，MySQL 实体表未实连。数据侧据此只作验收支撑判断，不把任何指标写成完成。

| manifest 内容 | 可支撑的数据指标 | 当前可做 | 缺口与限制 | 数据侧状态 |
| --- | --- | --- | --- | --- |
| session 样本 | 开场打卡率、瞬间上传率、私密使用率、分享图生成成功率、推举转化 | 可作为分母候选和跨表关联主键，支持接口/报表设计样例 | 缺真机用户路径、线上正式测试账号、测试数据清理授权；不能代表真实业务分母 | 待联调 |
| opening/highlight/private 样本 | 开场打卡率、瞬间上传率、私密使用率 | 可对 `moment_records` 口径做样本级分子计算，验证 private 是否被单独识别 | 缺三用户真机截图和 timeline 角色视角；不能证明非接收者页面不泄露 | 待真机验收 |
| share task 四态 | 分享图生成成功率 | 可设计 `ready / failed / expired / pending/processing` 状态聚合和失败原因字段 | 缺前端预览/保存、ready PNG 视觉验收、线上后台 retry 写操作 | 待报表 / 待视觉验收 |
| report 样本 | 分享链路、旧战报兼容对账 | 可确认旧 `report_share` 和新 brief/share task 需要区分 | 旧 analytics 不能替代 moments 专用事件；不能直接作为新分享图成功率分母 | 待埋点 |
| nomination 样本 | 推举转化 | 可对推举成功、重复限制、category 维度做接口/报表设计 | 缺推举入口曝光、确认弹层、失败原因、积分不足等前端埋点 | 待埋点 / 待真机验收 |
| rewardPayout 样本 | 奖励发放 | 可设计奖励发放成功、跳过、重复发放幂等的报表字段 | `pointsLedgerIds` 为空，无法完成用户积分流水对账；缺线上发奖窗口 | 待后台写操作 / 待流水对账 |
| `operationLogIds` 为空 | 二审通过率、举报通过率、奖励发放 | 暂不能做后台动作结果的日志级验收 | 不能证明审核、举报、retry、奖励配置和发奖动作已可追溯 | 阻塞 |
| `pointsLedgerIds` 为空 | 推举转化、奖励发放 | 暂不能做扣分、退款、奖励到账的流水级验收 | 不能证明 nomination 扣减、refund、ranking reward 与用户积分余额一致 | 阻塞 |
| MySQL 实体表未实连 | 全部表级报表 | 只能按 JSON store / manifest 设计口径和接口样例 | 不能证明 `moment_records`、`share_image_tasks`、`moment_nominations`、`ranking_reward_payouts` 等实体表可查询 | DBA 实连阻塞 |

## 16. `DATA-M0-01` 至 `DATA-DB-001` 当前复核

| 任务编号 | 当前判断 | 可推进范围 | 阻塞原因 | 下一步责任 |
| --- | --- | --- | --- | --- |
| `DATA-M0-01` | 改版后仍是口径草案 | 可由运营/PM 确认新 6 个核心指标目标值、统计窗口、测试数据过滤、旧玩法降权边界 | 运营尚未确认；不能进入验收 | 运营 + PM 确认第 10、11 节问题 |
| `DATA-M0-02` | 可进入后端事件设计 | 后端可基于第 10.3 节设计聚会记录师 analytics 事件 schema | 尚未实现埋点；manifest 不能替代事件流 | 后端/API 输出事件名、字段、触发条件、禁采隐私字段 |
| `DATA-M0-03` | 可进入后端聚合接口设计 | 后端可基于 party/session/photo/share/album 字段设计聚合接口样例 | MySQL 未实连，聚合只能先按 JSON store / manifest 样例设计；不能验收性能和实体表查询 | 后端/API 输出聚合接口草案、样例响应、测试数据过滤规则 |
| `DATA-M0-04` | 仍因真机阻塞 | 前端可先标注首页创建、拍第一张、邀请、相册、分享页事件触发点和页面参数 | 缺真机、缺事件上报样本，不能验证创建漏斗、首张照片、邀请加入、相册回访 | 前端补事件触发点设计和真机上报证据 |
| `DATA-M0-05` | 可进入后台报表设计 | 后台可先规划 `growth-party-recorder-metrics` slug、筛选、导出字段 | 缺后端聚合接口、后台真实写操作和 operationLogs；不能验收报表准确性 | 后台输出报表 schema 和页面设计，等接口后联调 |
| `DATA-QA-001` | 仍因固定数据/真机/后台写操作阻塞 | 测试可基于 manifest 制定对账用例 | 缺 operationLogIds、pointsLedgerIds，缺真机和线上后台写操作；不能做完整指标验收 | 测试 + 接口联调补固定数据实际 ID、对账步骤、通过/失败标准 |
| `DATA-RISK-001` | 仍待风控反例验收 | 可用 private/share task/nomination 样本设计排除规则 | 缺真机私密视角、分享图视觉、后台真实审核/举报和奖励反例 | UGC 风控 + 测试补反例截图、接口响应、签字结论 |
| `DATA-DB-001` | DBA 实连阻塞 | 可准备 DDL/同步字段对照和报表查询清单 | MySQL 实体表未实连，不能用 `app_store` 或 manifest 替代表验收 | DBA/运维等 PM 授权后执行 MySQL DDL、SHOW CREATE TABLE、同步验证 |

## 17. `PR-DATA-ONLINE-METRICS-SAMPLE-003` 线上测试样本证据记录

PM 已通过 `PR-PM-ONLINE-TEST-SERVER-AUTH-001` 授权 `api.pomer.cn` 作为酒桌判官 / 聚会记录师线上测试服务器。数据侧只记录 `api.pomer.cn` 范围内的测试样本证据；不得触碰 `pomer.cn` 官网项目或无关服务；不得把测试样本写入正式运营统计或验收通过。

### 17.1 线上样本证据总表

| 范围 | 样本 ID / 数据来源 | 当前接口/日志摘要 | 可支撑指标 | 残留状态 | 清理方式 | 数据侧判断 |
| --- | --- | --- | --- | --- | --- | --- |
| 公共只读入口 | `GET https://api.pomer.cn/api/v1/config/home` | 2026-06-16 只读返回 HTTP 200，`code:0`；当前首页配置仍展示旧“酒桌判官”文案 | 只能证明线上 API 域名可读，不支撑聚会记录师新指标验收 | 无新增残留 | 只读请求，无需清理 | 可作为线上只读连通证据 |
| 创建 / 聚会样本 | 历史线上 session `session-1781465622025-5f436e`，来源：接口联调计划 2026-06-15 线上部署后 smoke 记录 | 记录显示公网创建成功并生成 session；未见本轮可复跑创建事件、`party_create_*` 埋点或三步流程截图 | 三步创建完成率只能做历史样本引用，不能验收新版三步创建 | 线上历史测试数据残留状态未由数据侧确认 | 需后端/API 或接口联调提供按 sessionId 的清理命令、清理日志和残留扫描 | 待埋点 / 待线上样本复核 |
| 拍照 / 上传样本 | 历史线上上传图片与 brief：`brief-1781465622338-8c84f732`，来源：接口联调计划 2026-06-15 线上部署后 smoke 记录 | 记录显示曾上传图片并生成 brief；未见本轮 `party_first_photo_upload_success` 或 `party_photo_upload_success` 事件样本 | 首张照片完成率、参与者上传率只能先设计字段，不能验收 | 线上图片和 moment 残留状态未确认 | 需按 session/moment/photo ID 导出和清理；清理后记录 404 或查询无结果 | 待事件样本 / 待清理证据 |
| 分享样本 | 历史线上 share task `share-task-1781465622362-b11e8289`，图片路径 `/uploads/moments/share-tasks/share-task-1781465622362-b11e8289.png` | 2026-06-16 只读 `HEAD` 图片路径返回 HTTP 404；历史记录显示 2026-06-15 曾 `process` 到 `ready` 且 GET 200 `image/png` | 只能证明历史分享图生成链路曾跑通；当前不能作为分享页打开率或分享图可访问验收 | 当前图片文件疑似已清理或失效，需后端确认任务记录是否仍存在 | 若仍有 task 记录，需后端/API 按 taskId 清理；若已清理，需补接口或日志证明 | 待报表 / 待分享页 open 事件 |
| 举报样本 | 暂无线上 reportId；本地 manifest 有 `moment-report-it-moments-20260615` | 线上授权后尚未提供真实举报创建、处理接口摘要、后台 action 日志或前台状态同步 | 举报通过率仅保留口径，不能验收 | 线上残留未知 | 需测试/UGC 在授权窗口创建可清理举报样本并提供 cleanup 记录 | 阻塞：缺线上样本 |
| 审核样本 | 暂无线上 review action 样本；本地 manifest `admin.operationLogIds=[]` | 未见线上审核 approve/reject/require_resubmit 的 operationLogs、操作者、处理时间或结果枚举 | 二审通过率仅保留口径，不能验收 | 线上残留未知 | 需后台/测试在授权窗口执行审核动作，并提供 operationLogId、moment 状态回查和回滚/清理方式 | 阻塞：缺 operationLogs |
| 榜单 / 推举样本 | 本地 manifest 有 `nomination-1781507687124-4ad71db9`、`rankingItemId=moment-1781507687032-eb1806a4`；暂无线上 nominationId | 线上尚未提供推举曝光、确认、成功、失败和 rankings 结果样本；本地样本不能替代线上 | 邀请/分享新指标不依赖推举；旧推举转化降为二级指标 | 线上残留未知 | 若保留榜单，需后端/API 提供 nomination 清理或退款路径 | 降权 / 待线上样本 |
| 积分流水 | 本地 manifest `pointsLedgerIds=[]`；暂无线上 points ledger ID | 缺扣分、退款、榜单奖励到账流水；不能证明推举、奖励发放与用户余额一致 | 旧积分/奖励指标降为二级商业化指标，不能验收 | 线上残留未知 | 需后台/后端提供 ledgerId、用户余额前后对账、回滚或补偿方式 | 阻塞：缺 pointsLedger |
| operationLogs | 本地 manifest `operationLogIds=[]`；暂无线上 operationLogId | 缺审核、举报、重试、发奖、配置变更的线上操作日志摘要 | 二审、举报、奖励发放、后台报表准确性均不能验收 | 线上残留未知 | 需后台/运维提供日志 ID、日志摘要、操作者、时间、关联业务 ID 和清理/保留策略 | 阻塞：缺 operationLogs |
| 聚合报表字段 | 计划入口 `growth-party-recorder-metrics`；当前未见线上报表页面或聚合接口响应 | 尚无三步创建、首张照片、邀请、参与者上传、分享页打开、相册回访的分子/分母接口样例 | 新 6 项核心指标均不能验收 | 无新增残留 | 需后台/后端提供只读聚合接口、报表截图或导出样例，并标注测试数据过滤 | 待接口 / 待报表 |

### 17.2 本轮可进入设计的聚合字段

| 指标 | 聚合字段建议 | 线上样本准入要求 | 当前状态 |
| --- | --- | --- | --- |
| 三步创建完成率 | `date`、`partyId/sessionId`、`clientFlowId`、`step`、`startedCount`、`stepCompleteCount`、`createdCount`、`failReason`、`isTestData` | 至少 1 个线上测试创建流程，包含开始、步骤完成、创建成功事件和清理记录 | 待埋点 |
| 首张照片完成率 | `partyId/sessionId`、`creatorProfileId`、`firstPhotoId/momentId`、`createdAt`、`firstPhotoAt`、`durationMs`、`uploadSource`、`isTestData` | 至少 1 个线上测试 session 和第一张照片 ID，能回查上传成功日志 | 待事件样本 |
| 邀请转化 | `inviteCode`、`shareId`、`inviterProfileId`、`inviteeProfileId`、`openUv`、`joinSuccessCount`、`sourceChannel`、`isTestData` | 至少 1 个线上邀请打开和加入成功样本，能区分打开与加入 | 待埋点 |
| 参与者上传率 | `partyId/sessionId`、`memberCount`、`participantUploaderCount`、`participantPhotoCount`、`role`、`photoId/momentId`、`isTestData` | 至少 1 个非创建者线上上传样本，能按角色去重 | 待真机/事件样本 |
| 分享页打开率 | `shareId`、`partyId/sessionId`、`sharePageUrl`、`openPv`、`openUv`、`sourceChannel`、`isBot`、`isTestData` | 至少 1 个当前可打开的线上分享页和 open 事件；历史 404 图片不能替代 | 待分享页 open |
| 相册回访率 | `partyId/sessionId`、`profileId`、`albumOpenDate`、`daysSinceCreate`、`isRevisit`、`d1Retained`、`d7Retained`、`isTestData` | 至少 1 个跨自然日线上相册回访样本，或测试明确采用压缩窗口 | 待回访样本 |

### 17.3 清理与残留记录要求

| 对象 | 必须记录 | 当前缺口 | 责任角色 |
| --- | --- | --- | --- |
| session / party | `sessionId/partyId`、创建人、inviteCode、创建时间、清理命令、清理后查询结果 | 历史线上 session 残留未确认 | 后端/API + 接口联调 |
| photo / moment | `photoId/momentId`、上传人、角色、图片路径、审核状态、清理后图片和记录状态 | 线上首张照片、新版参与者上传样本缺失 | 后端/API + 前端 + 测试 |
| share page / share task | `shareId/taskId`、URL、状态、open 事件、图片/页面残留、清理结果 | 历史 ready 图片当前 404，缺当前可用分享页样本 | 后端/API + 后台 |
| report / review | `reportId`、`momentId`、处理动作、处理人、operationLogId、前台状态同步、回滚方式 | 缺线上 report/review 样本和 operationLogs | 后台 + UGC 风控 + 测试 |
| ranking / reward / points ledger | `nominationId`、`rewardPayoutId`、`pointsLedgerId`、用户积分前后值、退款/补偿方式 | 线上榜单、奖励、流水证据缺失 | 后端/API + 后台 + 测试 |
| 聚合报表 | 接口 URL、筛选参数、分子分母明细、测试数据过滤条件、导出样例 | 缺线上聚合接口和后台报表 | 后端/API + 后台 |

## 18. 数据侧交付记录

| 日期 | 执行人 | 范围 | 结论 | 证据 | 阻塞/下一步 |
| --- | --- | --- | --- | --- | --- |
| 2026-06-15 | 数据/运营指标负责人 | 首轮指标口径交付 | 已创建数据指标文档；只定义口径，不标记开发完成 | 读取团队通知、PM 台账、总控规格、业务流程、运营归档、后端计划、前端计划；核查 `analytics_events`、`moment_records`、`share_image_tasks`、`moment_reports`、`moment_nominations`、`ranking_reward_payouts`、`pointsLedger`、后台四个 moments slug 证据 | 等运营确认口径；后端补埋点/聚合接口；后台补报表；前端补真机事件；测试补固定数据对账 |
| 2026-06-15 | 数据/运营指标负责人 | 第三轮口径确认与研发拆分 | 已补运营确认表、研发拆分表和指标状态总表；仍不标记开发完成 | 读取本文和 PM 台账第 7 节下一步责任；补 `DATA-M0-01` 至 `DATA-M0-05`、`DATA-QA-001`、`DATA-RISK-001`、`DATA-DB-001` 的责任与证据要求 | 等运营确认目标和口径；PM 可据此派后端、前端、后台、测试、DBA/运维继续落地 |
| 2026-06-15 | 数据/运营指标负责人 | 当前 manifest 对指标验收的支撑与缺口复核 | manifest 可支撑 session、opening/highlight/private、share task 四态、report、nomination、rewardPayout 的样本级接口/报表设计；不能支撑完整验收 | PM 当前事实：线上只读公共接口可用；manifest 有部分样本；`operationLogIds`、`pointsLedgerIds` 为空；MySQL 实体表未实连；真机、后台写操作、DBA MySQL 实连和部署准入仍阻塞 | 后端/API 可先做事件和聚合接口设计；后台可先做报表 schema；前端需补真机事件；测试需补对账；DBA/运维需等授权做实体表实连 |
| 2026-06-15 | 数据/运营指标负责人 | 聚会记录师指标口径重构 | 已新增聚会记录师 6 个核心指标口径、旧积分/榜单/惩罚指标降权说明、前后端埋点字段需求；仍不标记开发完成 | 读取 `docs/party-recorder-redesign-requirements.md` 和本文；按 `PR-DATA-001` 将数据主线调整为创建、首照、邀请、参与者上传、分享页打开、相册回访 | 运营/PM 确认目标值和旧玩法降权；后端/API 补事件 schema 与聚合接口；前端补事件触发；后台补报表；测试补真机与对账；DBA/运维补实体表实连 |
| 2026-06-16 | 数据/运营指标负责人 | `PR-DATA-ONLINE-METRICS-SAMPLE-003` 线上测试样本证据口径 | 已补线上样本证据表、聚合字段设计和清理/残留记录要求；未写任何验收通过 | 只读核查 `https://api.pomer.cn/api/v1/config/home` 返回 `code:0`；只读 `HEAD /uploads/moments/share-tasks/share-task-1781465622362-b11e8289.png` 返回 404；引用接口联调计划中的历史线上 session/brief/share task 样本；读取本地 manifest 中 `operationLogIds=[]`、`pointsLedgerIds=[]` | PM 派后端/API、前端、后台、测试、UGC、DBA/运维分别补线上样本 ID、事件/日志摘要、报表字段、清理命令和残留扫描；测试样本不得进入正式运营统计 |
| 2026-06-17 | 数据/运营指标负责人 | `PR-DATA-009-011-METRICS-GAP-REVIEW` 009 样本与预览框矩阵数据证据复核 | 009 已补正向发奖、举报、expired 样本和后台 action 证据；011 已回收部分预览框 page/data/storage/console 摘要；仍不标记完整指标验收通过 | 读取 `docs/runtime/pr-int-final-qa-api-summary-008.md`、`docs/runtime/pr-admin-reward-009-verify-011/evidence.json`、测试计划 13.16.37；记录 `moment-report-it-moments-20260616-009`、`share-task-it-moments-20260616-009-expired`、`ranking-reward-payout-1781586678028-9cad8832`、operationLogs 截图和 `PR-QA-011-*` 失败项 | 前端/接口联调修三步创建、邀请、brief、rankings、private query；测试补复拍和 Network 摘要；UGC 对举报/隐私/expired retry 签字；后台/后端补 points ledger 与前台同步；DBA/运维补 MySQL 实体表实连 |
| 2026-06-17 | 数据/运营指标负责人 | `PR-DATA-DUAL-FLOW-SHARE-014` 双主线分享指标口径 | 已补拍照单线、记账单线、双主线联合导出的事件名、字段、报表缺口和依赖角色；不写完整验收通过 | 读取 `AGENTS.md`、`docs/party-recorder-redesign-requirements.md`、PM 台账和本文；确认酒桌记账 / 聚会账本必须与拍照记录共同进入分享页和分享截图保存 | 前端补入口/分享页埋点；后端/API 补账本事件和联合分享接口日志；后台补报表字段；测试补预览框矩阵；UGC 补分享公开过滤；DBA/运维补实体表字段 |
| 2026-06-17 | 数据/运营指标负责人 | PM 最新通知同步：分享页 / 分享截图保存最高优先级与精准阅读规则 | 已补后续关注边界：数据侧继续盯记账、拍照、联合分享、保存、回流、举报/审核/榜单/积分流水；缺前端实现、测试截图和接口证据前不得写完整指标验收通过 | 定向读取 `AGENTS.md`、PM 台账 020/最新派工行、本文 20 节；按通知采用 `rg` / 章节号 / 关键词精读 | 后续回包优先列读取章节、证据路径、缺口和下一步责任；只有证据冲突或边界不清时再扩展阅读全文 |
| 2026-06-18 | 数据/运营指标负责人 | `PR-DATA-CLEAN-SLATE-001` Clean Slate 新项目指标草案 | 已补指标废弃表、新核心事件字段、后台报表草案、测试数据过滤规则和样本 ID 规则；明确这只是口径草案，不代表埋点完成或报表上线 | 读取 `AGENTS.md`、`docs/party-recorder-clean-slate-reset-plan.md`、PM 台账关键词段和本文；按 Clean Slate 总控废弃旧玩法指标视角 | PM 派前端补事件触发与预览证据；后端/API 补事件 schema、日志和聚合接口；后台补报表；测试补 clean-slate 样本；UGC 补举报/审核公开过滤；DBA/运维补数据清理和实体表证据 |
| 2026-06-18 | 数据/运营指标负责人 | `PR-DATA-CLEAN-SLATE-EVENT-SCHEMA-002` 事件 schema 与聚合接口字段表 | 已补公共字段 schema、逐事件专属字段 schema、聚合接口返回字段表和角色字段责任矩阵；仍只作为实现参考，不写埋点完成 | 只读 `docs/runtime/ai-thread-dispatch-queue.md` 对应任务行、`docs/party-recorder-clean-slate-reset-plan.md` 和本文第 22 节 | 前端、后端/API、后台、测试按第 23 节字段责任矩阵补实现与证据；PM 不应据此写报表上线 |
| 2026-06-18 | 数据/运营指标负责人 | `PR-DATA-CLEAN-SLATE-PHASE1-MAP-003` phase1 页面 / 接口事件映射 | 已补 phase1 事件映射表、待实现字段表和测试 / 后端字段对照提醒；只作为前后端第一阶段实装参考，不写埋点完成 | 只读 `docs/runtime/ai-thread-dispatch-queue.md` 对应任务行和本文第 23 节；按前端 003 `album/ledger/privacy-state` 壳页与后端 003 `parties/brief/share` 最小兼容出口映射 | 前端先接公共字段和壳页可得字段；后端/API 补主键、归因和日志字段；后台后续接聚合和 warnings；测试按字段对照补 page/data/Network 证据 |
| 2026-06-18 | 数据/运营指标负责人 | `PR-DATA-TOOLBOX-CATALOG-008C-CHECK` 工具箱目录配置证据核查 | 已补默认目录、运行时 store、`placement/status/toolsHero` 和前台接口过滤条件证据；结论为本地 store 未清空，但默认目录为空且 `toolsHero` 缺失，需后台/后端核对运行时数据源，不写恢复完成 | 只读 `backend/data/admin.js`、`backend/data/admin-store.json`、`backend/data/content-store.json`、`backend/data/front.js`、`miniprogram/services/operations.ts` 和派工说明；未部署、未重启、未清理数据 | 后台管理负责人核对运行时 `toolsCatalog` 是否未加载本地 store；后端/API 负责人核对 `/api/v1/tools/catalog` 实际响应；前端负责人准备本地兜底；测试补 Network 响应与页面 data 对账 |

## 19. 009 样本与预览框矩阵的数据侧复核

复核时间：2026-06-17。范围只覆盖数据/运营指标负责人职责内的样本、字段、埋点和报表证据缺口判断；不改 PM 总进度，不替测试、后台、UGC、前端或后端写通过。线上边界仅引用 `api.pomer.cn` / `jiuzhuopanguan-backend` 证据，未触碰 `pomer.cn` 官网。

### 19.1 本轮读取证据

| 证据 | 关键内容 | 数据侧用途 |
| --- | --- | --- |
| `docs/runtime/pr-int-final-qa-api-summary-008.md` | 006B final 样本有 session、brief、ready/failed share task、rankings、points ledger、operationLogs；009 追加正向发奖候选、report、expired task | 建立指标样本 ID 对照和报表字段草案 |
| `docs/runtime/pr-admin-reward-009-verify-011/evidence.json` | 后台页面按钮触发发奖幂等跳过、举报 `invalid_keep`、expired retry；接口均 HTTP 200；operationLogs 截图已归档 | 判断后台动作、日志和审计字段是否可追踪 |
| `docs/gameplay-moments-test-acceptance-plan.md` 13.16.37 | 预览框自动化已回收首页、创建、邀请、相册、分享、brief、rankings、我的页的 page/data/storage/console 摘要；三步创建、邀请、brief、rankings 仍有待修失败项 | 判断创建、拍照、分享、相册、榜单相关前端事件是否具备验收样本 |
| `docs/runtime/int-data-001-manifest.json` | 本地 manifest 仍可说明 opening/highlight/private、share task、nomination、rewardPayout 的字段结构；本地 `operationLogIds` / `pointsLedgerIds` 仍为空 | 只作为本地字段结构参考，不替代线上 009 证据 |

### 19.2 009 样本对指标的支撑与限制

| 样本 / 字段 | 当前证据 | 可支撑指标 | 仍缺什么 | 数据侧状态 |
| --- | --- | --- | --- | --- |
| `session-1781584503517-c033e9` / `inviteCode=W58G7T` | 接口联调摘要记录为线上 final session；测试 011 用该 query 打开邀请、brief、分享页 | 创建、邀请、分享、相册、brief 的关联主键 | 创建页 `templatesLoading=true`，邀请页 query 未落 data，三步创建未闭环；缺 `party_create_*` 事件 | 待前端/接口联调修复后复拍 |
| `moment-1781584503741-d53b131f` / opening | 006B opening 样本；rankings 可返回 item | 首张照片、参与者上传、开场打卡、榜单候选 | 缺预览框从创建到拍第一张的连续 page/data/Network 摘要；缺 `party_first_photo_upload_success` | 待测试复拍 / 待埋点 |
| `moment-1781584503795-17a32c27` / private | 009 举报目标为 private；后台举报处理返回 moment 保持 `visibility=selected` | 私密使用率、举报处理、UGC 风控 | 测试 011 显示 `moment-editor` private query 未进入 data，`visibility=session`；缺 A/B/C 视角和前台同步 | 待前端/UGC/测试复核 |
| `share-task-1781584503902-a99a5211` / ready | 分享预览页 data 落地，点击保存后生成 `posterImagePath=http://tmp/...png` | 分享预览、分享图生成成功率、保存成功率草案 | 缺系统相册真机保存；缺 `share_image_view`、`share_image_save_success` 事件；缺公开分享页 open UV | 预览框部分可追踪 / 待埋点 |
| `share-task-it-moments-20260616-009-expired` | 接口联调先记录 `status=expired/retryCount=0`；后台 009 执行 retry 后 `status=pending/retryCount=1`，有 operationLogs | 分享图失败/过期率、重试率、后台处理时长 | 该 expired 样本已被消费，后续需引用原态截图或另补 expired；缺前台任务状态同步截图 | 待测试/后台补同步 |
| `moment-report-it-moments-20260616-009` | 后台 009 执行 `invalid_keep` 后 report `handled`，`statusText=无效，保留内容`，operationLogs 有举报处理记录 | 举报处理率、举报通过率/无效率、处理时长字段草案 | 只覆盖 `invalid_keep` 一类；缺 `valid_hide`、`require_resubmit`、`remove_ranking`；缺 UGC 签字和前台同步 | 待 UGC / 测试补 |
| `ranking-reward-payout-1781586678028-9cad8832` | 接口联调记录正向发奖 `grantedCount=1/totalPoints=60`；后台 009 再点发奖为幂等 `grantedCount=0/skippedCount=2` | 奖励发放成功率、重复发放跳过率、奖励积分 | 缺最新 points ledger ID 与用户积分前后对账归档；缺前台积分/榜单同步截图 | 待后端/后台/测试补流水对账 |
| operationLogs | 009 证据目录有 `10-operation-logs-after-009-actions.png`；evidence 中有发奖、举报、expired retry 日志摘要 | 二审/举报/重试/发奖审计报表 | 缺结构化报表接口；部分 report 响应内 `operationLogId=null`，需以后台日志列表 targetId 对账 | 待后台报表 / 待字段对账 |
| MySQL 实体表 | 本轮未见 `moment_records`、`share_image_tasks`、`moment_reports`、`ranking_reward_payouts` 等实体表实连导出 | 全部表级运营报表 | 仍缺 DBA/运维 MySQL DDL、SHOW CREATE TABLE、同步行数、字段对账 | `DATA-DB-001` 阻塞 |

### 19.3 八类业务链路可追踪性判断

| 链路 | 当前能追踪什么 | 不能写通过的原因 | 下一步责任 |
| --- | --- | --- | --- |
| 创建 | 有 sessionId、inviteCode 和创建页/邀请页截图；可设计 `party_create_start`、`party_create_submit`、`party_create_success` 字段 | 创建页模板仍 loading，CTA 未跳转，邀请页 query 未落 data；没有完整三步闭环和事件流 | 前端修 `PR-QA-011-P0-001/002`；接口联调确认模板/创建接口；测试复拍 |
| 拍照 / 首张照片 | 有 opening 样本和 moment-editor 页面截图 | 预览框未证明从创建后进入拍照/上传并成功提交；缺上传事件和 Network 摘要 | 前端补 query/data；测试跑创建到首照；后端补 `party_first_photo_upload_success` |
| 分享 | ready share task、分享预览页和临时海报路径已可追踪；expired retry 已有后台日志 | 缺分享页 open、保存成功、系统权限、前台 retry 后状态同步；expired 样本已被消费 | 前端/测试补分享页 open/save 事件；后台/接口联调必要时补新 expired 样本 |
| 举报 | 009 report 可追踪到后台处理和日志 | 只覆盖 `invalid_keep`；缺有效隐藏、要求重传、移出榜单；缺 UGC 签字和前台同步 | UGC 给口径签字；后台/测试补剩余动作或明确降级 |
| 审核 | operationLogs 有 009 正向候选 approve、006B 审核/隐藏历史日志 | dedicated `reviewMomentId` 仍缺；缺当前样本多动作审核矩阵和前台状态同步 | 后端/API 或接口联调补 dedicated 待审样本；后台/测试执行 |
| 榜单 | rankings API 摘要有 items，009 发奖候选上榜 | 预览框 rankings 页面仍 loading，query category 未采纳；缺前台榜单页面完成态 | 前端/接口联调修 `PR-QA-011-P1-004`；测试复拍 |
| 积分流水 | 006B 摘要有历史 points ledger，009 有 payout 与发奖日志 | 009 最新 ledger ID、用户积分前后值和前台积分同步未归档；不能完成账务验收 | 后端/API 给 ledger 查询结果；后台/测试补截图；UGC 复核重复发奖 |
| 报表字段 | 已能列出 session/moment/task/report/payout/log 的字段草案 | 缺 `growth-party-recorder-metrics` 聚合接口、后台报表 slug、导出样例和 MySQL 实体表实连 | 后端/API 设计聚合接口；后台设计报表；DBA/运维实连 |

### 19.4 需要回报 PM 的缺口清单

| 缺口 | 任务编号 / 证据 | 缺少角色 | 下一步 |
| --- | --- | --- | --- |
| 三步创建和邀请页未闭环 | `PR-QA-011-P0-001`、`PR-QA-011-P0-002`；截图 `pr-qa-011-create-session-primary-tap-9420.png`、`pr-qa-011-invite-group-9420.png` | 前端、接口联调、测试 | 前端修模板加载和 query 落 data；接口联调确认模板/创建接口；测试复拍并补 page/data/storage/console |
| brief / rankings 页面 loading | `PR-QA-011-P1-003`、`PR-QA-011-P1-004` | 前端、接口联调、测试 | 修 query/category 与加载闭环；测试用 006B query 复拍 |
| private query 与权限事件不可信 | `PR-QA-011-P1-005`；`moment-editor` data `visibility=session` | 前端、UGC、测试 | 前端修 private query 落地；UGC 明确隐私字段禁采；测试补 A/B/C 或预览框可替代视角 |
| 举报只覆盖 `invalid_keep` | 009 report 已处理；缺 `valid_hide` / `require_resubmit` / `remove_ranking` | UGC、后台、测试 | UGC 判断是否需要补全四动作；后台按授权执行；测试补前台同步 |
| expired 样本已消费 | 009 expired retry 后变 `pending/retryCount=1` | 接口联调、后台、测试 | 后续引用 009 原态截图；如需再测 expired，接口联调另补样本 |
| 奖励流水缺最新对账 | 009 payout 已存在，后台复点为 skipped；缺最新 ledger / 用户积分前后 | 后端/API、后台、测试、UGC | 后端给 `/user/commerce` 或后台流水查询；测试归档 ledgerId、delta、sourceId、余额前后 |
| operationLogs 还不是报表接口 | 009 有日志截图和 evidence，但未见结构化聚合接口 | 后台、后端/API | 后台/后端设计 `growth-party-recorder-metrics` 或审计聚合字段，含 targetId、action、operator、detail、createdAt |
| MySQL 实体表仍未实连 | `DATA-DB-001` | DBA/运维、后端/API | 执行 DDL、同步、SHOW CREATE TABLE、行数/字段对账；不能用 JSON store 或 manifest 替代 |

### 19.5 数据侧当前结论

009 样本让举报、expired retry、奖励发放幂等和 operationLogs 从“缺样本”推进到“有线上样本与后台动作证据”；011 预览框矩阵让首页、分享、相册、我的页具备部分 page/data/storage/console 初证。但创建、拍照、邀请、brief、rankings、private 权限、points ledger 对账、报表接口和 MySQL 实体表仍未闭环。

因此 `DATA-M0-01` 至 `DATA-DB-001` 维持以下状态：口径和字段设计可继续推进；完整指标验收仍为 `待埋点 / 待聚合接口 / 待后台报表 / 待复拍 / 待流水对账 / 待 DBA 实连`。数据侧不得把 009 或 011 写成运营指标完成。

## 20. `PR-DATA-DUAL-FLOW-SHARE-014` 双主线分享指标口径

复核时间：2026-06-17。依据 `docs/party-recorder-redesign-requirements.md`，聚会记录师必须同时保留拍照记录和酒桌记账 / 聚会账本，两条主线共同进入分享页和分享截图保存。本节只定义指标口径、事件字段、报表缺口和依赖角色，不改源码、不改 PM 总台账，不把任何指标写成完整验收通过。

### 20.1 统计分流原则

| 流程类型 | 定义 | 统计目标 | 防误判规则 |
| --- | --- | --- | --- |
| 拍照单线 | 聚会内只产生照片 / moment / 相册 / 时间线内容，未产生账本事件 | 衡量拍照记录是否顺畅 | 只能进入 `photo_only` 分组，不得代表账本价值 |
| 记账单线 | 聚会内只产生欠酒、已喝、加酒、结算、关键事件等账本记录，未上传照片 | 衡量酒桌记账 / 聚会账本是否被使用 | 必须进入 `ledger_only` 分组，不能因无照片而被分享漏斗排除 |
| 双主线联合导出 | 同一聚会同时有照片记录和账本记录，分享页 / 分享图同时展示照片高光与账本高光 | 衡量新版核心价值：记录 + 记账 + 分享 | 单独进入 `combined` 分组；分享成功、保存成功、回访必须能按 `contentComposition=combined` 拆分 |

核心报表必须默认展示三列：`photo_only`、`ledger_only`、`combined`。如果只统计照片相关 moment，会把酒桌记账价值吞掉，数据侧判为口径失败。

### 20.2 新增指标口径

| 指标 | 口径 | 分母 | 分子 | 当前状态 |
| --- | --- | --- | --- | --- |
| 记账入口点击率 | 用户在首页、记录页、当前聚会页、桌面模式或分享页点击酒桌记账 / 聚会账本入口的次数、人数和聚会数 | 有可见账本入口曝光的会话 / 用户 / 聚会 | `ledger_entry_click` 去重后的点击 | 待埋点 / 待入口曝光样本 |
| 记账事件创建率 | 成功创建账本事件的聚会占比和用户占比 | 已创建聚会或已进入记录页的聚会 | 至少 1 条有效账本事件的聚会；事件级另统计成功条数 | 待接口日志 / 待实体字段 |
| 拍照事件创建率 | 成功创建照片 / moment 的聚会占比和用户占比 | 已创建聚会或已进入记录页的聚会 | 至少 1 条有效 photo moment 的聚会；事件级另统计成功条数 | 沿用 moment 口径，待新版埋点 |
| 联合分享页打开率 | 分享页被打开且可区分内容组成的 PV / UV | 已生成分享页或分享链接的聚会 | `combined_share_page_open`，按 `contentComposition` 拆分 | 待分享页 open 埋点 |
| 分享图片保存率 | 分享截图 / 分享图保存成功次数 | 分享页打开或分享图 ready 的任务 | `combined_share_image_save_success` | 待保存成功 / 失败回调 |
| 分享成功率 | 用户触发微信分享、复制链接、保存后转发等成功动作 | 分享页打开或分享 CTA 点击 | `combined_share_success` | 待前端分享回调与渠道字段 |
| 保存失败率 | 分享图片保存失败次数和原因分布 | 分享保存尝试次数 | `combined_share_image_save_failed` | 待失败码 / 权限状态 |
| 分享回访率 | 分享页被同一用户或新访客再次打开，或 D1/D7 回访 | 首次打开分享页的用户 / shareId | 后续打开事件，按 `visitorType` 和 `daysSinceFirstOpen` 统计 | 待 shareId / visitorId / 回访窗口 |

### 20.3 事件名与字段建议

| 事件名 | 触发端 | 必填字段 | 可选字段 | 支撑指标 |
| --- | --- | --- | --- | --- |
| `ledger_entry_exposure` | 小程序 | `sessionId`、`page`、`entryPosition`、`profileId`、`isTestData` | `sourceFlow`、`hasPhotoEvents`、`hasLedgerEvents` | 记账入口点击率分母 |
| `ledger_entry_click` | 小程序 | `sessionId`、`page`、`entryPosition`、`profileId`、`sourceFlow`、`isTestData` | `clientFlowId`、`fromTab` | 记账入口点击率 |
| `ledger_event_create_success` | 小程序 / 后端 | `sessionId`、`ledgerEventId`、`profileId`、`ledgerEventType`、`clientEventId`、`createdAt`、`isTestData` | `amount`、`targetProfileId`、`noteLength`、`sourcePage` | 记账事件创建 |
| `ledger_event_create_failed` | 小程序 / 后端 | `sessionId`、`profileId`、`ledgerEventType`、`errorCode`、`stage`、`isTestData` | `clientEventId`、`retryable` | 记账创建失败 |
| `photo_event_create_success` | 小程序 / 后端 | `sessionId`、`momentId`、`profileId`、`nodeType`、`hasImage`、`clientDraftId`、`isTestData` | `visibility`、`sourcePage`、`uploadDurationMs` | 拍照事件创建 |
| `photo_event_create_failed` | 小程序 / 后端 | `sessionId`、`profileId`、`nodeType`、`errorCode`、`stage`、`isTestData` | `clientDraftId`、`retryable` | 拍照创建失败 |
| `combined_share_page_open` | 小程序 / Web 分享页 | `shareId`、`sessionId`、`profileIdOrVisitorId`、`contentComposition`、`sourceChannel`、`isTestData` | `briefId`、`taskId`、`visitorType`、`referrer` | 联合分享页打开、分享回访 |
| `combined_share_image_save_success` | 小程序 | `shareId`、`sessionId`、`taskId`、`contentComposition`、`profileId`、`durationMs`、`isTestData` | `imageWidth`、`imageHeight`、`saveTarget` | 分享图片保存 |
| `combined_share_image_save_failed` | 小程序 | `shareId`、`sessionId`、`taskId`、`contentComposition`、`profileId`、`errorCode`、`permissionState`、`isTestData` | `retryCount`、`platform` | 保存失败 |
| `combined_share_success` | 小程序 | `shareId`、`sessionId`、`profileId`、`shareChannel`、`contentComposition`、`isTestData` | `taskId`、`fromButton`、`scene` | 分享成功 |
| `combined_share_revisit` | 小程序 / Web 分享页 | `shareId`、`sessionId`、`profileIdOrVisitorId`、`firstOpenAt`、`revisitAt`、`daysSinceFirstOpen`、`contentComposition`、`isTestData` | `visitorType`、`sourceChannel` | 分享回访 |

字段约束：

- `contentComposition` 只能取 `photo_only`、`ledger_only`、`combined`、`empty`；报表默认排除 `empty`，但测试阶段保留用于发现空分享页。
- `sourceFlow` 建议取 `home`、`record_tab`、`current_party`、`table_mode`、`album`、`share_page`。
- `ledgerEventType` 建议先兼容旧能力：`drink_debt`、`drink_paid`、`drink_add`、`settlement`、`key_event`、`note`。
- 账本事件不得采集敏感正文；`noteLength`、类型、金额或杯数可用于统计，具体备注文本默认不进入 analytics。
- 所有事件必须带 `isTestData` 或可由 `sessionName/clientEventId/clientDraftId/prefix` 识别测试数据，默认从正式运营报表排除 `QA-`、`IT-MOMENTS-`、`smoke-`、`ui-smoke-`、`test-`。

### 20.4 聚合接口与报表字段建议

建议后台报表入口沿用或扩展为 `growth-party-recorder-metrics`，新增“双主线分享”模块。

| 报表模块 | 必须字段 | 维度 | 当前缺口 |
| --- | --- | --- | --- |
| 双主线采用 | `sessionsWithPhotoOnly`、`sessionsWithLedgerOnly`、`sessionsWithCombined`、`photoOnlyRate`、`ledgerOnlyRate`、`combinedRate` | 日期、sessionId、templateId、sourceFlow、是否测试数据 | 缺账本事件实体 / 接口日志；缺按 contentComposition 聚合 |
| 记账漏斗 | `ledgerEntryExposurePv/Uv`、`ledgerEntryClickPv/Uv`、`ledgerEventCreateSuccess`、`ledgerEventCreateFailed`、`ledgerCreateFailReasonTop` | 页面、入口位置、事件类型、角色 | 缺入口曝光/点击埋点；缺账本创建成功 / 失败日志 |
| 拍照漏斗 | `photoEntryPv/Uv`、`photoEventCreateSuccess`、`photoEventCreateFailed`、`firstPhotoDurationMsP50/P90` | 页面、nodeType、角色、visibility | 现有 moment 样本可参考，缺新版事件名和三步闭环样本 |
| 联合分享漏斗 | `sharePageOpenPv/Uv`、`shareImageSaveAttempt`、`shareImageSaveSuccess`、`shareImageSaveFailed`、`shareSuccess`、`shareRevisitD1/D7` | `contentComposition`、渠道、访客类型、保存目标 | 缺分享页 open、保存失败、分享成功、回访事件 |
| 分享截图内容质量 | `shareTasksReady`、`shareTasksFailed`、`photoNodeCount`、`ledgerEventCount`、`hasPhotoHighlight`、`hasLedgerHighlight` | layoutMode、taskStatus、失败原因 | 缺分享图生成时的账本内容计数字段 |
| 明细下钻 | `sessionId`、`shareId`、`briefId`、`taskId`、`momentIdsCount`、`ledgerEventIdsCount`、`lastEventAt` | session / share / task | 缺 shareId 与账本事件 ID 关联 |

聚合接口草案：

```text
GET /api/v1/admin/metrics/party-recorder-dual-flow?from=YYYY-MM-DD&to=YYYY-MM-DD&composition=photo_only|ledger_only|combined&excludeTestData=1
```

返回建议：

```json
{
  "code": 0,
  "data": {
    "summary": {
      "sessionsWithPhotoOnly": 0,
      "sessionsWithLedgerOnly": 0,
      "sessionsWithCombined": 0,
      "sharePageOpenUv": 0,
      "shareImageSaveSuccess": 0,
      "shareSuccess": 0,
      "shareRevisitD1": 0
    },
    "funnels": [],
    "compositionBreakdown": [],
    "failureReasons": [],
    "samples": []
  }
}
```

### 20.5 样本证据准入

| 样本 | 必须包含 | 当前状态 |
| --- | --- | --- |
| 拍照单线样本 | `sessionId`、至少 1 个 `momentId`、`photo_event_create_success`、分享页 open、分享图保存结果 | 待测试 / 前端补 |
| 记账单线样本 | `sessionId`、至少 1 个 `ledgerEventId`、`ledger_event_create_success`、分享页 open、分享图保存结果 | 待后端/API 确认账本事件数据源；待前端入口 |
| 双主线联合样本 | 同一 `sessionId` 同时有 `momentId` 和 `ledgerEventId`，`contentComposition=combined`，分享页和分享截图同时展示照片高光与账本高光 | 当前无完整证据，P0 待补 |
| 保存失败样本 | 分享图保存失败回调、`errorCode`、`permissionState`、用户提示截图 | 待测试构造权限拒绝 / 系统失败 |
| 分享回访样本 | `shareId`、首次打开、再次打开、访客类型、D1 或压缩窗口说明 | 待后端/API 和测试定义访客识别 |

没有上述样本前，数据侧只能写“口径已定义 / 待埋点 / 待接口日志 / 待报表 / 待验收”，不得写“指标验收通过”。

### 20.6 依赖角色与 PM 回报

| 依赖角色 | 需要补齐 | 对应证据 |
| --- | --- | --- |
| 前端负责人 | 账本入口曝光/点击埋点；拍照成功/失败埋点；分享页 open、保存成功/失败、分享成功、回访埋点；`contentComposition` 传参 | 预览框命令、page/data/storage/console、截图、事件上报摘要 |
| 后端/API 负责人 | 账本事件创建成功/失败日志；账本事件与 session/share/brief/task 的关联；联合分享聚合接口；测试数据过滤 | API 合同、样例响应、日志字段、失败码 |
| 接口联调负责人 | 三类固定样本：`photo_only`、`ledger_only`、`combined`；每类给 sessionId、momentId、ledgerEventId、shareId/taskId | 脱敏 manifest / API 摘要 / cleanup 口径 |
| 后台负责人 | `growth-party-recorder-metrics` 报表模块、筛选、导出、明细下钻；分享内容组成统计 | 后台页面截图、导出样例、接口响应 |
| 测试/验收负责人 | 预览框点击矩阵覆盖账本入口、账本创建、拍照创建、联合分享页、保存成功/失败、回访 | 命令原文、截图、Console/Network/storage、失败原文 |
| UGC 风控负责人 | 联合分享中照片、账本事件、私密记录、敏感账本备注的公开过滤口径 | 风控签字、反例样本、分享页过滤截图 |
| DBA/运维负责人 | 如进入 MySQL 实体报表，补账本事件表 / analytics_events / share task / session brief 的字段实连与同步 | DDL、SHOW CREATE TABLE、同步日志、回滚方案 |
| 运营 / PM | 确认双主线指标目标值、统计窗口、记账事件类型是否全部计入主指标、分享回访 D1/D7 是否采用压缩测试窗口 | PM 确认记录或运营口径 |

当前数据侧状态：`PR-DATA-DUAL-FLOW-SHARE-014` 已完成口径和字段建议；执行验收仍阻塞于埋点、账本事件数据源、联合分享页/截图实现、预览框样本、后台报表和实体表实连。

## 21. PM 最新通知同步与后续关注边界

记录时间：2026-06-17。PM 最新通知再次明确：分享页和分享截图保存是当前最重要页面；酒桌记账 / 聚会账本必须与拍照流程并存并共同导出分享。数据侧只维护指标口径和证据缺口，不改源码、不改 PM 总台账。

### 21.1 后续重点指标

| 指标组 | 数据侧关注项 | 当前状态 |
| --- | --- | --- |
| 记账链路 | `ledger_entry_exposure`、`ledger_entry_click`、`ledger_event_create_success/failed` | 口径已在 20 节定义；缺前端入口曝光/点击埋点，缺后端账本事件日志和样本 |
| 拍照链路 | `photo_event_create_success/failed`、首张照片完成、参与者上传 | 口径已有；缺三步创建到拍第一张的预览框闭环和 Network 摘要 |
| 联合分享 | `combined_share_page_open`、`combined_share_image_save_success/failed`、`combined_share_success`、`combined_share_revisit` | 口径已有；缺分享页实现截图、保存成功/失败样本、分享成功回调和回访样本 |
| 内容治理 | 举报、审核、分享公开过滤、敏感账本备注脱敏 | 009 有部分举报/operationLogs 证据；缺新版分享页实现截图、UGC 角色视角和更多处理动作样本 |
| 榜单 / 积分流水 | 榜单展示、奖励发放、points ledger、用户积分前后对账 | 009 有 payout / 幂等日志；缺最新 ledgerId、余额前后、前台同步和报表聚合 |

### 21.2 不得写通过的条件

| 缺失证据 | 数据侧结论 |
| --- | --- |
| 没有前端实现截图或预览框 page/data/storage/console 摘要 | 只能写“口径已定义 / 待实现 / 待复拍”，不得写分享页指标通过 |
| 没有接口联调样本或 API/日志摘要 | 只能写“待接口证据”，不得把视觉稿或计划当成数据样本 |
| 没有分享图片保存成功 / 失败回调 | 保存率和失败率只能保留事件字段建议 |
| 没有分享成功和回流查看事件 | 分享成功率、分享回访率不得验收 |
| 没有 ledger / payout / operationLogs 对账 | 榜单、积分流水、审核举报指标不得写完整验收通过 |

### 21.3 精准阅读规则

后续数据/运营指标任务按 PM 最新阅读规则执行：

1. 先读 `AGENTS.md`。
2. 用 `rg` / 章节号 / 关键词读取 PM 指定任务段、相关证据段和最新派工行。
3. 优先读取本文对应任务节，例如 `PR-DATA-DUAL-FLOW-SHARE-014` 先读第 20 节，分享页最高优先级通知先读第 21 节。
4. 只有出现证据冲突、跨角色边界不清、PM 明确要求或当前任务无法判断时，再扩展阅读全文。

数据侧回报必须写清：读取的章节、证据路径、缺哪个角色、缺哪个任务编号或字段、下一步由谁补；不得只依据口头状态或单个计划文件标完成。

## 22. `PR-DATA-CLEAN-SLATE-001` Clean Slate 新项目指标草案

记录时间：2026-06-18。依据 `docs/party-recorder-clean-slate-reset-plan.md`，用户已要求重新建立项目并清空旧项目污染。数据侧从本任务起废弃旧玩法增长视角，改按“聚会记录师”新项目口径设计指标：创建聚会、邀请进入、拍第一张、上传照片、账本记一笔、生成简报、保存分享图、转发分享、回流进入、相册回看、举报/审核。

本节是指标、字段和报表草案，只代表数据侧口径建议；不代表前端埋点已接入、后端日志已落库、后台报表已上线或测试验收已通过。

### 22.1 指标废弃表

| 旧指标 / 旧事件 | Clean Slate 处理 | 可否内部兼容 | 禁止事项 | 替代新指标 |
| --- | --- | --- | --- | --- |
| 判官 / 裁判使用率 | 面向用户废弃 | 仅允许作为旧路由迁移审计字段 | 不得作为新版核心 KPI，不得在报表首页默认展示 | 创建聚会、邀请进入、拍第一张 |
| 惩罚 / 题库 / 转盘 / 喝酒惩罚 | 面向用户废弃 | 只允许历史数据归档查询 | 不得作为增长漏斗、活跃目标或分享页内容默认指标 | 上传照片、账本记一笔、生成简报 |
| 欠酒 / 加酒 / 已喝等旧玩法指标 | 用户侧旧文案废弃 | 可内部兼容为账本事件类型，如 `drink_debt`、`drink_add`、`drink_paid` | 不得继续按“欠酒榜”“惩罚榜”命名 | 账本记一笔、账本事件创建成功率 |
| 战报打开 / 战报分享 / report replay | 作为用户侧产品指标废弃 | 可迁移映射到简报和分享页回放审计 | 不得把旧战报打开量并入新版分享页打开量 | 生成简报、保存分享图、转发分享、回流进入 |
| 今日榜单 / 推举 / 奖励发放 | 首版新项目不作为默认增长主线 | 如 PM 保留激励，可作为二级内部兼容模块 | 不得覆盖创建、拍照、账本、分享核心漏斗 | 相册回看、分享回流、内容质量观察 |
| 积分流水 | 不作为用户增长 KPI | 可作为财务、奖励或后台审计流水 | 不得用积分活跃替代聚会记录活跃 | 账本审计、后台操作日志 |
| `share_task_ready` 旧技术健康指标 | 保留为内部任务健康指标 | 可继续做分享图生成状态监控 | 不得等同于用户保存或转发成功 | 保存分享图、保存失败、转发分享 |

### 22.2 新核心事件字段

公共必填字段：`eventId`、`clientEventId`、`sessionId` 或 `partyId`、`profileId` 或 `visitorId`、`sourcePage`、`sourceFlow`、`scene`、`isTestData`、`clientTs`、`createdAt`、`appVersion`、`buildId`。事件上报需幂等，`clientEventId` 重复时只计一次。

| 事件名 | 触发时机 | 关键字段 | 当前状态 |
| --- | --- | --- | --- |
| `party_create_start` | 用户进入创建聚会并开始提交 | `templateId`、`entryPosition`、`sourceFlow` | 待前端埋点 |
| `party_create_success` | 后端创建聚会成功 | `partyId/sessionId`、`inviteCode`、`createDurationMs` | 待后端日志 / 待前端回传 |
| `party_create_failed` | 创建失败或超时 | `errorCode`、`errorMessageKey`、`stage`、`retryable` | 待失败码规范 |
| `party_invite_open` | 邀请链接或邀请码页打开 | `inviteCode`、`shareId`、`visitorType`、`sourceChannel` | 待分享入口参数 |
| `party_invite_join_success` | 访客成功加入聚会 | `inviteCode`、`joinProfileId`、`hostProfileId`、`joinDurationMs` | 待接口日志 |
| `party_invite_join_failed` | 加入失败 | `inviteCode`、`errorCode`、`stage` | 待失败样本 |
| `first_photo_start` | 创建后进入第一张照片拍摄 / 选择 | `partyId/sessionId`、`cameraSource`、`sourcePage` | 待前端埋点 |
| `first_photo_create_success` | 聚会第一张照片创建成功 | `photoId/momentId`、`mediaType`、`uploadSource`、`uploadDurationMs` | 待预览框闭环样本 |
| `first_photo_create_failed` | 第一张照片失败 | `errorCode`、`stage`、`permissionState`、`retryable` | 待失败样本 |
| `photo_upload_success` | 任意照片上传成功 | `photoId/momentId`、`mediaType`、`albumPosition`、`visibility` | 待新版事件名 |
| `photo_upload_failed` | 任意照片上传失败 | `errorCode`、`stage`、`fileSizeBucket`、`retryable` | 待失败码规范 |
| `ledger_entry_click` | 用户点击聚会账本 / 记一笔入口 | `entryPosition`、`hasPhotoEvents`、`hasLedgerEvents` | 待前端埋点 |
| `ledger_event_create_success` | 成功记一笔 | `ledgerEventId`、`ledgerEventType`、`amount`、`counterpartyProfileId` | 待账本实体和接口日志 |
| `ledger_event_create_failed` | 记一笔失败 | `ledgerEventType`、`errorCode`、`stage` | 待失败样本 |
| `brief_generate_success` | 自动或手动生成简报成功 | `briefId`、`photoCount`、`ledgerEventCount`、`generateDurationMs` | 待简报接口日志 |
| `brief_generate_failed` | 简报生成失败 | `errorCode`、`stage`、`photoCount`、`ledgerEventCount` | 待失败样本 |
| `share_image_save_success` | 分享截图 / 分享图保存成功 | `shareTaskId`、`shareImageId`、`shareId`、`saveTarget`、`contentComposition` | 待保存回调 |
| `share_image_save_failed` | 保存分享图失败 | `shareTaskId`、`shareId`、`errorCode`、`permissionState`、`contentComposition` | 待保存失败样本 |
| `share_forward_success` | 用户成功转发分享 | `shareId`、`shareChannel`、`contentComposition`、`fromButton` | 待前端分享回调 |
| `share_forward_failed` | 转发失败或取消 | `shareId`、`shareChannel`、`errorCode`、`stage` | 待失败码规范 |
| `share_revisit_open` | 分享页回流打开 | `shareId`、`visitorType`、`daysSinceFirstOpen`、`sourceChannel` | 待访客识别 |
| `album_revisit_open` | 用户回看相册 | `partyId/sessionId`、`albumEntry`、`daysSincePartyCreate` | 待前端埋点 |
| `content_report_submit` | 用户提交举报 | `reportId`、`targetType`、`targetId`、`reasonCode` | 待新版举报样本 |
| `content_review_action` | 后台审核处理 | `reviewAction`、`operatorId`、`targetType`、`targetId`、`operationLogId` | 待后台结构化日志 |

`contentComposition` 统一取值：`photo_only`、`ledger_only`、`combined`、`empty`。新版分享报表必须按该字段拆分，避免只统计拍照导致账本价值消失。

### 22.3 后台报表草案

建议后台新增或独立扩展报表入口：`growth-party-recorder-clean-slate`。默认排除测试数据，展示正式新项目核心漏斗；旧玩法报表只能放在历史兼容或迁移审计区。

| 报表模块 | 关键指标 | 维度 | 需要的后端字段 |
| --- | --- | --- | --- |
| 创建与邀请漏斗 | 创建开始、创建成功、创建失败、邀请打开、加入成功、加入失败 | 日期、入口、模板、渠道、是否测试数据 | `partyId/sessionId`、`inviteCode`、`sourceFlow`、`errorCode` |
| 首照与照片上传漏斗 | 第一张开始、第一张成功、第一张失败、照片上传成功 / 失败、人均照片数 | 日期、页面、媒体类型、上传来源、角色 | `photoId/momentId`、`mediaType`、`uploadDurationMs`、`visibility` |
| 账本漏斗 | 记账入口点击、记账成功、记账失败、每聚会账本条数 | 日期、入口、账本类型、角色 | `ledgerEventId`、`ledgerEventType`、`amount`、`counterpartyProfileId` |
| 简报与分享漏斗 | 简报生成成功 / 失败、保存分享图成功 / 失败、转发成功 / 失败 | `contentComposition`、渠道、保存目标、失败原因 | `briefId`、`shareTaskId`、`shareImageId`、`shareId`、`errorCode` |
| 回流与相册沉淀 | 分享回流 PV/UV、D1/D7 回访、相册回看 PV/UV | 访客类型、渠道、回访窗口、聚会年龄 | `visitorId`、`daysSinceFirstOpen`、`daysSincePartyCreate` |
| 举报 / 审核 | 举报提交、审核处理、处理时长、有效 / 无效 / 隐藏 / 保留 | target 类型、原因、操作人、处理动作 | `reportId`、`reviewAction`、`operatorId`、`operationLogId` |
| 数据质量 | 测试数据占比、缺字段事件数、重复事件数、无法归因事件数 | 事件名、版本、来源、测试批次 | `isTestData`、`testRunId`、`clientEventId`、`buildId` |

聚合接口草案：

```text
GET /api/v1/admin/metrics/party-recorder-clean-slate?from=YYYY-MM-DD&to=YYYY-MM-DD&excludeTestData=1
```

返回结构建议：

```json
{
  "code": 0,
  "data": {
    "summary": {
      "partyCreateSuccess": 0,
      "firstPhotoSuccess": 0,
      "ledgerEventCreateSuccess": 0,
      "briefGenerateSuccess": 0,
      "shareImageSaveSuccess": 0,
      "shareForwardSuccess": 0,
      "shareRevisitUv": 0,
      "albumRevisitUv": 0
    },
    "funnels": [],
    "compositionBreakdown": [],
    "failureReasons": [],
    "reportReview": [],
    "samples": [],
    "warnings": []
  }
}
```

### 22.4 测试数据过滤规则

正式运营报表默认 `excludeTestData=1`。测试样本必须可被字段或前缀稳定识别，不能混入正式指标。

| 规则 | 字段范围 | 处理方式 |
| --- | --- | --- |
| 显式测试标记 | `isTestData=true`、`testRunId`、`tags` | 默认排除；后台可手动切换查看 |
| 固定前缀 | `QA-`、`IT-`、`IT-MOMENTS-`、`PR-`、`smoke-`、`ui-smoke-`、`test-`、`clean-slate-`、`fixture-`、`devtools-` | 命中任一字段即排除正式报表 |
| ID / 名称扫描 | `sessionId/partyId`、`sessionName`、`inviteCode`、`profileId/openId/name`、`clientEventId/clientDraftId`、`briefId`、`shareId/shareTaskId`、`ledgerEventId`、`reportId`、`operator`、`sourceId` | 用于测试样本识别和清理核对 |
| 内容字段保护 | `caption`、`note`、账本备注、举报说明 | 报表仅允许存长度、类型、脱敏摘要或原因码，不采集原文 |
| 清理状态 | `cleanupStatus`、`cleanupAt`、`residualScanResult` | 测试写入必须记录清理或残留扫描，未清理样本不得误入正式指标 |

### 22.5 样本 ID 规则

测试样本统一使用可追溯、可过滤、可清理的 ID，不泄露完整 token、openid 或私密内容。

| 对象 | ID 规则 | 示例 | 责任角色 |
| --- | --- | --- | --- |
| 测试批次 | `PR-CS-YYYYMMDD-<role>-<scenario>-<seq>` | `PR-CS-20260618-data-create-photo-ledger-001` | 测试 / 接口联调 |
| 聚会 / session | `party-pr-cs-YYYYMMDD-<seq>` 或 `session-pr-cs-YYYYMMDD-<seq>` | `party-pr-cs-20260618-001` | 后端/API |
| 照片 / moment | `photo-pr-cs-YYYYMMDD-<seq>` 或 `moment-pr-cs-YYYYMMDD-<seq>` | `photo-pr-cs-20260618-001` | 前端 / 后端/API |
| 账本事件 | `ledger-pr-cs-YYYYMMDD-<seq>` | `ledger-pr-cs-20260618-001` | 后端/API |
| 简报 | `brief-pr-cs-YYYYMMDD-<seq>` | `brief-pr-cs-20260618-001` | 后端/API |
| 分享 | `share-pr-cs-YYYYMMDD-<seq>` / `share-task-pr-cs-YYYYMMDD-<seq>` | `share-task-pr-cs-20260618-001` | 后端/API / 前端 |
| 举报 / 审核 | `report-pr-cs-YYYYMMDD-<seq>` / `review-pr-cs-YYYYMMDD-<seq>` | `report-pr-cs-20260618-001` | UGC / 后台 |

### 22.6 后端 / 后台依赖

| 角色 | 需要补齐 | 交付证据 |
| --- | --- | --- |
| 后端/API | 新事件 schema、幂等事件写入、创建/邀请/照片/账本/简报/分享/回流/相册/举报审核日志；`isTestData` 和 `testRunId` 字段；Clean Slate 聚合接口 | API 合同、样例请求响应、失败码、日志字段、样本 ID、可复跑命令 |
| 后台 | `growth-party-recorder-clean-slate` 报表、测试数据过滤开关、明细下钻、CSV 导出、缺字段 warnings | 后台截图、导出样例、接口响应、字段对账 |
| 前端 | 所有新核心事件触发点、`contentComposition`、保存分享图成功 / 失败、转发成功 / 失败、回流参数 | 预览框 page/data/storage/console、Network 摘要、截图 |
| 测试/验收 | clean-slate 样本矩阵：创建、邀请、首照、上传、账本、简报、保存、转发、回流、相册、举报/审核 | 测试命令、样本 manifest、失败原文、cleanup / 残留扫描 |
| UGC 风控 | 举报 / 审核口径、分享页公开过滤、账本备注和照片隐私保护 | 风控规则、反例样本、审核动作证据 |
| DBA/运维 | 旧数据清理或隔离策略、实体表字段、同步日志、备份 / 回滚和残留扫描 | DDL、SHOW CREATE TABLE、行数对账、备份路径、回滚说明 |

### 22.7 当前状态回报

`PR-DATA-CLEAN-SLATE-001` 数据侧已完成 Clean Slate 指标草案：旧玩法指标废弃表、新核心事件字段、报表草案、测试数据过滤规则和样本 ID 规则均已补入本文。

仍缺证据：前端埋点触发和预览框证据、后端/API 事件 schema 与接口日志、后台报表页面和导出、测试样本 manifest 与 cleanup、UGC 举报/审核签字、DBA/运维实体表与旧数据隔离证据。因此当前只能标记为“口径草案完成 / 待埋点 / 待日志 / 待报表 / 待样本 / 待验收”，不得写完整指标验收通过。

## 23. `PR-DATA-CLEAN-SLATE-EVENT-SCHEMA-002` 事件 schema 与聚合接口字段表

记录时间：2026-06-18。PM 已验收第 22 节指标草案，本节把草案收口成后端/API、后台、前端和测试可对齐的字段级 schema。读取范围按 PM 要求限定为 `docs/runtime/ai-thread-dispatch-queue.md` 对应任务行、`docs/party-recorder-clean-slate-reset-plan.md` 和本文第 22 节。

本节仍是数据侧 schema 参考，不代表埋点已完成、接口已上线、后台报表已上线或测试样本已生成。

### 23.1 公共事件字段 schema

所有事件均需带公共字段；如事件发生在匿名回流场景，`profileId` 可空，但必须提供 `visitorId`。

| 字段名 | 类型 | 来源角色 | 是否必填 | 测试数据过滤方式 |
| --- | --- | --- | --- | --- |
| `eventId` | string | 后端/API | 是 | 以后端生成 ID 对账；命中 `PR-` / `clean-slate-` 可标测试 |
| `eventName` | enum string | 前端 / 后端/API / 后台 | 是 | 不参与过滤，用于缺字段 warnings |
| `clientEventId` | string | 前端 / 测试 | 是 | 命中 `QA-`、`IT-`、`PR-`、`smoke-`、`ui-smoke-`、`test-`、`clean-slate-`、`fixture-`、`devtools-` 即排除正式报表 |
| `partyId` | string | 后端/API | 条件必填 | 命中测试前缀排除；可与 `sessionId` 互为兼容 |
| `sessionId` | string | 后端/API | 条件必填 | 命中测试前缀排除；Clean Slate 新表落地后优先用 `partyId` |
| `profileId` | string | 前端 / 后端/API | 条件必填 | 测试账号、测试 profile 前缀或测试 tags 排除 |
| `visitorId` | string | 前端 / 后端/API | 条件必填 | 分享回流匿名访客必填；测试 visitor 前缀排除 |
| `sourcePage` | enum string | 前端 | 是 | 不单独过滤；与测试截图页面路径对账 |
| `sourceFlow` | enum string | 前端 | 是 | 允许 `create`、`invite`、`photo`、`ledger`、`brief`、`share`、`album`、`review` |
| `scene` | string | 前端 | 是 | 微信 scene 或内部场景；测试 scene 命中前缀排除 |
| `isTestData` | boolean | 前端 / 后端/API / 测试 | 是 | `true` 默认从正式报表排除 |
| `testRunId` | string | 测试 / 接口联调 | 否 | 命中 `PR-CS-YYYYMMDD-<role>-<scenario>-<seq>` 默认排除 |
| `clientTs` | datetime string | 前端 | 是 | 不过滤；用于排查上报延迟 |
| `createdAt` | datetime string | 后端/API | 是 | 报表统计主时间，按 `Asia/Shanghai` 聚合 |
| `appVersion` | string | 前端 | 是 | 测试包版本需与验收记录对齐 |
| `buildId` | string | 前端 / 测试 | 是 | 测试 build 命中前缀或测试 manifest 排除 |
| `platform` | enum string | 前端 | 否 | `devtools` 平台默认进入测试维度，不进正式报表 |

### 23.2 逐事件专属字段 schema

字段写法：`字段名:类型:来源:必填/可选:过滤方式`。公共字段不重复列出。

| 事件名 | 专属字段 schema | 字段生产责任 | 证据责任 |
| --- | --- | --- | --- |
| `party_create_start` | `templateId:string:前端:可选:测试模板前缀排除`；`entryPosition:string:前端:必填:不单独过滤`；`createFlowId:string:前端:必填:命中测试前缀排除` | 前端产入口、流程 ID；后端仅接收 | 测试补创建页 page/data/Network 摘要 |
| `party_create_success` | `partyId:string:后端/API:必填:测试前缀排除`；`sessionId:string:后端/API:可选:测试前缀排除`；`inviteCode:string:后端/API:必填:测试码排除`；`createDurationMs:number:前端/后端/API:可选:不单独过滤` | 后端/API 产主键和邀请码；前端回传耗时 | 后端/API 补创建日志；测试补成功样本 ID |
| `party_create_failed` | `errorCode:string:后端/API:必填:不单独过滤`；`errorMessageKey:string:后端/API:可选:不采集原文`；`stage:string:前端/后端/API:必填:不单独过滤`；`retryable:boolean:后端/API:可选:不单独过滤` | 前端产失败阶段；后端/API 产错误码 | 测试补失败原文和截图 |
| `party_invite_open` | `inviteCode:string:前端/后端/API:必填:测试码排除`；`shareId:string:后端/API:可选:测试前缀排除`；`visitorType:enum:前端/后端/API:必填:不单独过滤`；`sourceChannel:string:前端:必填:不单独过滤` | 前端产打开渠道；后端/API 解析 invite/share | 测试补邀请打开 query 和 storage |
| `party_invite_join_success` | `inviteCode:string:后端/API:必填:测试码排除`；`joinProfileId:string:后端/API:必填:测试 profile 排除`；`hostProfileId:string:后端/API:可选:测试 profile 排除`；`joinDurationMs:number:前端/后端/API:可选:不单独过滤` | 后端/API 产加入关系；前端产耗时 | 后端/API 补加入日志；测试补成员列表证据 |
| `party_invite_join_failed` | `inviteCode:string:前端/后端/API:必填:测试码排除`；`errorCode:string:后端/API:必填:不单独过滤`；`stage:string:前端/后端/API:必填:不单独过滤` | 前端产阶段；后端/API 产错误码 | 测试补过期/无效邀请码样本 |
| `first_photo_start` | `cameraSource:enum:前端:必填:不单独过滤`；`photoFlowId:string:前端:必填:测试前缀排除`；`permissionState:enum:前端:可选:不单独过滤` | 前端产拍摄/相册来源和权限 | 测试补创建后首照入口截图 |
| `first_photo_create_success` | `photoId:string:后端/API:必填:测试前缀排除`；`momentId:string:后端/API:可选:测试前缀排除`；`mediaType:enum:前端:必填:不单独过滤`；`uploadSource:enum:前端:必填:不单独过滤`；`uploadDurationMs:number:前端/后端/API:可选:不单独过滤` | 前端产媒体属性；后端/API 产照片主键 | 测试补首照成功 Network 和相册可见 |
| `first_photo_create_failed` | `errorCode:string:后端/API:必填:不单独过滤`；`stage:string:前端/后端/API:必填:不单独过滤`；`permissionState:enum:前端:可选:不单独过滤`；`retryable:boolean:后端/API:可选:不单独过滤` | 前端产权限/阶段；后端/API 产错误码 | 测试补权限拒绝或上传失败样本 |
| `photo_upload_success` | `photoId:string:后端/API:必填:测试前缀排除`；`momentId:string:后端/API:可选:测试前缀排除`；`mediaType:enum:前端:必填:不单独过滤`；`albumPosition:number:后端/API:可选:不单独过滤`；`visibility:enum:前端/后端/API:必填:不单独过滤` | 前端产可见性意图；后端/API 产主键和排序 | 测试补上传后相册/简报样本 |
| `photo_upload_failed` | `errorCode:string:后端/API:必填:不单独过滤`；`stage:string:前端/后端/API:必填:不单独过滤`；`fileSizeBucket:string:前端:可选:不采集原始文件`；`retryable:boolean:后端/API:可选:不单独过滤` | 前端产文件桶和阶段；后端/API 产错误码 | 测试补失败回调 |
| `ledger_entry_click` | `entryPosition:string:前端:必填:不单独过滤`；`hasPhotoEvents:boolean:后端/API:可选:不单独过滤`；`hasLedgerEvents:boolean:后端/API:可选:不单独过滤` | 前端产点击位置；后端/API 可补聚会状态 | 测试补入口点击截图和事件摘要 |
| `ledger_event_create_success` | `ledgerEventId:string:后端/API:必填:测试前缀排除`；`ledgerEventType:enum:前端/后端/API:必填:不单独过滤`；`amount:number:前端/后端/API:可选:不采集备注原文`；`counterpartyProfileId:string:前端/后端/API:可选:测试 profile 排除` | 前端产用户输入类型；后端/API 产账本主键和规范化值 | 后端/API 补账本日志；测试补账本明细 |
| `ledger_event_create_failed` | `ledgerEventType:enum:前端:必填:不单独过滤`；`errorCode:string:后端/API:必填:不单独过滤`；`stage:string:前端/后端/API:必填:不单独过滤` | 前端产类型/阶段；后端/API 产错误码 | 测试补失败样本 |
| `brief_generate_success` | `briefId:string:后端/API:必填:测试前缀排除`；`photoCount:number:后端/API:必填:不单独过滤`；`ledgerEventCount:number:后端/API:必填:不单独过滤`；`generateDurationMs:number:后端/API:可选:不单独过滤` | 后端/API 产简报主键和内容计数 | 测试补简报页 data 和截图 |
| `brief_generate_failed` | `errorCode:string:后端/API:必填:不单独过滤`；`stage:string:后端/API:必填:不单独过滤`；`photoCount:number:后端/API:可选:不单独过滤`；`ledgerEventCount:number:后端/API:可选:不单独过滤` | 后端/API 产失败日志 | 测试补空内容/异常失败样本 |
| `share_image_save_success` | `shareTaskId:string:后端/API:必填:测试前缀排除`；`shareImageId:string:后端/API:可选:测试前缀排除`；`shareId:string:后端/API:必填:测试前缀排除`；`saveTarget:enum:前端:必填:不单独过滤`；`contentComposition:enum:后端/API:必填:不单独过滤` | 前端产保存目标；后端/API 产分享主键和内容组成 | 测试补保存成功回调、storage 和截图 |
| `share_image_save_failed` | `shareTaskId:string:后端/API:必填:测试前缀排除`；`shareId:string:后端/API:必填:测试前缀排除`；`errorCode:string:前端/后端/API:必填:不单独过滤`；`permissionState:enum:前端:可选:不单独过滤`；`contentComposition:enum:后端/API:必填:不单独过滤` | 前端产权限/失败；后端/API 产分享归因 | 测试补权限拒绝或保存失败样本 |
| `share_forward_success` | `shareId:string:后端/API:必填:测试前缀排除`；`shareChannel:enum:前端:必填:不单独过滤`；`contentComposition:enum:后端/API:必填:不单独过滤`；`fromButton:string:前端:可选:不单独过滤` | 前端产分享渠道；后端/API 产分享归因 | 测试补转发回调可得性说明 |
| `share_forward_failed` | `shareId:string:后端/API:必填:测试前缀排除`；`shareChannel:enum:前端:必填:不单独过滤`；`errorCode:string:前端/后端/API:必填:不单独过滤`；`stage:string:前端:必填:不单独过滤` | 前端产取消/失败阶段；后端/API 归因 | 测试补取消或失败样本 |
| `share_revisit_open` | `shareId:string:前端/后端/API:必填:测试前缀排除`；`visitorType:enum:后端/API:必填:不单独过滤`；`daysSinceFirstOpen:number:后端/API:必填:不单独过滤`；`sourceChannel:string:前端:可选:不单独过滤` | 前端产来源；后端/API 产回访识别 | 测试补首次/再次打开样本 |
| `album_revisit_open` | `albumEntry:enum:前端:必填:不单独过滤`；`daysSincePartyCreate:number:后端/API:必填:不单独过滤`；`photoCount:number:后端/API:可选:不单独过滤` | 前端产入口；后端/API 产聚会年龄和照片数 | 测试补相册回看 page/data |
| `content_report_submit` | `reportId:string:后端/API:必填:测试前缀排除`；`targetType:enum:前端/后端/API:必填:不单独过滤`；`targetId:string:前端/后端/API:必填:测试前缀排除`；`reasonCode:enum:前端:必填:不采集说明原文` | 前端产原因码；后端/API 产举报主键 | UGC/测试补举报样本和隐私检查 |
| `content_review_action` | `reviewAction:enum:后台:必填:不单独过滤`；`operatorId:string:后台:必填:测试 operator 排除`；`targetType:enum:后台:必填:不单独过滤`；`targetId:string:后台:必填:测试前缀排除`；`operationLogId:string:后台/后端/API:必填:测试前缀排除` | 后台产审核动作；后端/API 产审计日志 ID | 后台/UGC/测试补审核动作和前台同步 |

### 23.3 聚合接口返回字段表

接口仍沿第 22 节草案：

```text
GET /api/v1/admin/metrics/party-recorder-clean-slate?from=YYYY-MM-DD&to=YYYY-MM-DD&excludeTestData=1
```

| 返回路径 | 字段名 | 类型 | 来源角色 | 含义 | 测试数据过滤 |
| --- | --- | --- | --- | --- | --- |
| `summary` | `partyCreateStart` | number | 后端/API 聚合 | 创建开始事件数 | 默认排除 `isTestData=true` 和测试前缀 |
| `summary` | `partyCreateSuccess` | number | 后端/API 聚合 | 创建成功事件数 | 同上 |
| `summary` | `partyInviteOpenUv` | number | 后端/API 聚合 | 邀请打开去重访客数 | 同上 |
| `summary` | `partyInviteJoinSuccess` | number | 后端/API 聚合 | 邀请加入成功数 | 同上 |
| `summary` | `firstPhotoSuccess` | number | 后端/API 聚合 | 第一张照片成功数 | 同上 |
| `summary` | `photoUploadSuccess` | number | 后端/API 聚合 | 照片上传成功数 | 同上 |
| `summary` | `ledgerEventCreateSuccess` | number | 后端/API 聚合 | 账本记一笔成功数 | 同上 |
| `summary` | `briefGenerateSuccess` | number | 后端/API 聚合 | 简报生成成功数 | 同上 |
| `summary` | `shareImageSaveSuccess` | number | 后端/API 聚合 | 保存分享图成功数 | 同上 |
| `summary` | `shareForwardSuccess` | number | 后端/API 聚合 | 转发分享成功数 | 同上 |
| `summary` | `shareRevisitUv` | number | 后端/API 聚合 | 分享回流 UV | 同上 |
| `summary` | `albumRevisitUv` | number | 后端/API 聚合 | 相册回看 UV | 同上 |
| `summary` | `reportSubmitCount` | number | 后端/API 聚合 | 举报提交数 | 同上 |
| `summary` | `reviewActionCount` | number | 后端/API / 后台聚合 | 审核处理数 | 同上 |
| `funnels[]` | `name` | string | 后台 | 漏斗名，如 `create_invite`、`photo`、`ledger`、`brief_share` | 不过滤 |
| `funnels[]` | `steps` | array | 后端/API 聚合 | 漏斗步骤数组 | 继承接口过滤 |
| `funnels[].steps[]` | `eventName` | string | 后端/API 聚合 | 对应事件名 | 不过滤 |
| `funnels[].steps[]` | `count` | number | 后端/API 聚合 | 步骤计数 | 继承接口过滤 |
| `funnels[].steps[]` | `uv` | number | 后端/API 聚合 | 步骤去重人数 / 访客数 | 继承接口过滤 |
| `funnels[].steps[]` | `conversionRate` | number | 后端/API 聚合 | 相邻步骤转化率 | 继承接口过滤 |
| `compositionBreakdown[]` | `contentComposition` | enum string | 后端/API 聚合 | `photo_only`、`ledger_only`、`combined`、`empty` | `empty` 可显示在质量报表，不进核心转化 |
| `compositionBreakdown[]` | `partyCount` | number | 后端/API 聚合 | 对应内容组成的聚会数 | 继承接口过滤 |
| `compositionBreakdown[]` | `sharePageOpenUv` | number | 后端/API 聚合 | 分享页打开 UV | 继承接口过滤 |
| `compositionBreakdown[]` | `shareImageSaveSuccess` | number | 后端/API 聚合 | 保存成功数 | 继承接口过滤 |
| `compositionBreakdown[]` | `shareForwardSuccess` | number | 后端/API 聚合 | 转发成功数 | 继承接口过滤 |
| `failureReasons[]` | `eventName` | string | 后端/API 聚合 | 失败事件名 | 不过滤 |
| `failureReasons[]` | `errorCode` | string | 后端/API 聚合 | 失败码 | 不采集原始错误文本 |
| `failureReasons[]` | `stage` | string | 前端 / 后端/API | 失败阶段 | 不过滤 |
| `failureReasons[]` | `count` | number | 后端/API 聚合 | 失败次数 | 继承接口过滤 |
| `failureReasons[]` | `sampleEventIds` | array string | 后端/API | 脱敏事件样本 ID | 测试样本只在 includeTestData 时展示 |
| `reportReview[]` | `targetType` | enum string | 后台 / 后端/API | 举报或审核对象类型 | 不过滤 |
| `reportReview[]` | `reasonCode` | enum string | 前端 / UGC | 举报原因码 | 不展示用户说明原文 |
| `reportReview[]` | `reviewAction` | enum string | 后台 | 审核动作 | 不过滤 |
| `reportReview[]` | `count` | number | 后端/API 聚合 | 对应动作次数 | 继承接口过滤 |
| `reportReview[]` | `avgHandleDurationMs` | number | 后端/API 聚合 | 平均处理耗时 | 继承接口过滤 |
| `samples[]` | `testRunId` | string | 测试 / 接口联调 | 测试批次 ID | 默认正式报表不返回测试样本 |
| `samples[]` | `partyId` | string | 后端/API | 脱敏聚会 ID | 测试前缀默认排除 |
| `samples[]` | `photoId` | string | 后端/API | 脱敏照片 ID | 测试前缀默认排除 |
| `samples[]` | `ledgerEventId` | string | 后端/API | 脱敏账本事件 ID | 测试前缀默认排除 |
| `samples[]` | `briefId` | string | 后端/API | 脱敏简报 ID | 测试前缀默认排除 |
| `samples[]` | `shareId` | string | 后端/API | 脱敏分享 ID | 测试前缀默认排除 |
| `samples[]` | `reportId` | string | 后端/API | 脱敏举报 ID | 测试前缀默认排除 |
| `samples[]` | `cleanupStatus` | enum string | 测试 / 接口联调 / DBA运维 | `pending`、`cleaned`、`residual_found`、`waived` | 未清理测试样本不得进入正式指标 |
| `warnings[]` | `code` | string | 后端/API / 后台 | 缺字段、重复事件、无法归因等告警码 | 不过滤 |
| `warnings[]` | `messageKey` | string | 后台 | 后台展示文案 key | 不写用户敏感原文 |
| `warnings[]` | `eventName` | string | 后端/API | 受影响事件 | 不过滤 |
| `warnings[]` | `affectedCount` | number | 后端/API 聚合 | 影响事件数 | 继承接口过滤 |
| `warnings[]` | `sampleEventIds` | array string | 后端/API | 脱敏样本事件 ID | 测试样本只在 includeTestData 时展示 |

### 23.4 角色字段责任矩阵

| 字段类别 | 前端产 | 后端/API 产 | 后台产 | 测试补证据 |
| --- | --- | --- | --- | --- |
| 公共事件身份 | `clientEventId`、`sourcePage`、`sourceFlow`、`scene`、`clientTs`、`appVersion`、`buildId`、`platform` | `eventId`、`createdAt`、`partyId/sessionId` 规范化、`profileId/visitorId` 归因 | 不产，后台只展示 | event 上报摘要、page/data/storage、Network、测试 build 信息 |
| 测试过滤 | `isTestData` 初始值、测试 build 标记 | `isTestData` 兜底识别、`testRunId` 存储、前缀扫描 | 报表过滤开关和 includeTestData 权限 | clean manifest、`PR-CS-*` 批次、cleanup / residual scan |
| 创建 / 邀请 | 入口、流程 ID、耗时、打开渠道、失败阶段 | `partyId/sessionId`、`inviteCode`、加入关系、错误码 | 不产 | 创建成功/失败、邀请打开/加入截图和日志 |
| 照片 / 首照 | 拍摄来源、媒体类型、权限、可见性意图、文件大小桶 | `photoId/momentId`、排序、上传耗时、存储状态、错误码 | 不产 | 首照闭环、上传成功/失败、相册可见证据 |
| 账本 | 入口位置、账本类型、用户输入金额/对象 | `ledgerEventId`、规范化类型、金额、关联用户、错误码 | 不产 | 账本创建成功/失败、账本明细对账 |
| 简报 | 触发入口可由前端补充 | `briefId`、`photoCount`、`ledgerEventCount`、生成耗时、错误码 | 不产 | 简报页 data、分享前内容组成 |
| 保存 / 转发 / 回流 | 保存目标、权限状态、分享渠道、按钮来源、回流来源 | `shareTaskId`、`shareImageId`、`shareId`、`contentComposition`、访客类型、回访窗口 | 不产 | 保存成功/失败、转发回调、首次/再次打开证据 |
| 相册回看 | 相册入口 | 聚会年龄、照片数、回看归因 | 不产 | 相册页 page/data/storage |
| 举报 / 审核 | 举报原因码、target 类型和 ID | `reportId`、举报日志、处理耗时、`operationLogId` | `reviewAction`、`operatorId`、后台操作结果 | UGC 反例样本、后台处理截图、前台同步 |
| 聚合报表 | 不产聚合字段 | `summary`、`funnels`、`compositionBreakdown`、`failureReasons`、`reportReview`、`samples`、`warnings` 原始聚合 | 后台页面、筛选、导出、warnings 展示 | CSV/页面截图、接口响应、字段对账 |

### 23.5 当前交付状态

`PR-DATA-CLEAN-SLATE-EVENT-SCHEMA-002` 已完成数据侧收口：事件 schema 表、聚合接口字段表和角色字段责任矩阵已补入本文。当前状态仍为“schema 已定义 / 待前端埋点 / 待后端日志与聚合接口 / 待后台报表 / 待测试证据”，不得写埋点完成、接口上线或报表上线。

## 24. `PR-DATA-CLEAN-SLATE-PHASE1-MAP-003` phase1 页面 / 接口事件映射

记录时间：2026-06-18。按 PM 三派任务，phase1 范围只覆盖前端 `album/ledger/privacy-state` 壳页与主链路入口迁移，以及后端/API 本地 `parties/brief/share` 最小兼容出口、clean facade 命名层和 JSON/store baseline。以下映射仅说明 phase1 当前应接的事件 schema，不代表页面、接口、埋点或报表已完成验收。

### 24.1 phase1 事件映射表

| phase1 页面 / 接口 | 当前阶段定位 | 对应事件 schema | 现在可先埋字段 | 需等后端字段 | 需等后台字段 |
| --- | --- | --- | --- | --- | --- |
| 首页创建聚会入口 | 前端主链路入口迁移 | `party_create_start` | `eventName`、`clientEventId`、`sourcePage=home`、`sourceFlow=create`、`scene`、`entryPosition`、`createFlowId`、`clientTs`、`appVersion`、`buildId`、`isTestData` | `eventId`、`createdAt`、`partyId/sessionId` | 无 |
| `parties` 最小创建出口 | 后端/API phase1 最小兼容接口 | `party_create_success`、`party_create_failed` | 前端可回传 `createDurationMs`、`stage` | `eventId`、`createdAt`、`partyId/sessionId`、`inviteCode`、`errorCode`、`errorMessageKey`、`retryable` | 无 |
| 邀请进入链路 | phase1 范围未见新页实装说明，但 `parties` 出口已应保留邀请归因位 | `party_invite_open`、`party_invite_join_success`、`party_invite_join_failed` | 若前端已有 query 打开，可先埋 `sourceChannel`、`sourcePage`、`scene` | `shareId`、`inviteCode`、`visitorType`、`joinProfileId`、`hostProfileId`、`errorCode` | 无 |
| 开始记录 / 拍第一张入口 | 前端主链路入口迁移应预留 | `first_photo_start` | `cameraSource`、`photoFlowId`、`permissionState`、公共字段 | `eventId`、`createdAt`、`partyId/sessionId` | 无 |
| 照片创建 / 上传接口 | phase1 后端 003 未承诺 `photos` 最小出口，当前只能预留映射 | `first_photo_create_success`、`first_photo_create_failed`、`photo_upload_success`、`photo_upload_failed` | 前端可先准备 `mediaType`、`uploadSource`、`visibility`、`fileSizeBucket`、`stage` | `photoId/momentId`、`albumPosition`、`uploadDurationMs`、`errorCode`、`retryable` | 无 |
| `album` 壳页 | 前端 phase1 新壳页 | `album_revisit_open` | `albumEntry`、`sourcePage=album`、`sourceFlow=album`、公共字段 | `daysSincePartyCreate`、`photoCount`、`partyId/sessionId` | 无 |
| `ledger` 壳页入口 | 前端 phase1 新壳页 | `ledger_entry_click` | `entryPosition`、`sourcePage=ledger`、`sourceFlow=ledger`、公共字段 | `hasPhotoEvents`、`hasLedgerEvents`、`partyId/sessionId` | 无 |
| 账本创建接口 | phase1 后端 003 未承诺 `ledger` 最小出口，当前只能预留映射 | `ledger_event_create_success`、`ledger_event_create_failed` | 前端可先准备 `ledgerEventType`、`amount`、`counterpartyProfileId`、`stage` | `ledgerEventId`、`errorCode`、`createdAt`、`partyId/sessionId` | 无 |
| `brief` 最小兼容出口 | 后端/API phase1 最小兼容接口 | `brief_generate_success`、`brief_generate_failed` | 前端若有打开入口，可先埋 `sourcePage`、`sourceFlow=brief` | `briefId`、`photoCount`、`ledgerEventCount`、`generateDurationMs`、`errorCode`、`stage` | 无 |
| `share` 最小兼容出口 | 后端/API phase1 最小兼容接口 | `share_image_save_success`、`share_image_save_failed`、`share_forward_success`、`share_forward_failed`、`share_revisit_open` | 前端可先准备 `saveTarget`、`shareChannel`、`fromButton`、`permissionState`、`sourceChannel` | `shareTaskId`、`shareImageId`、`shareId`、`contentComposition`、`visitorType`、`daysSinceFirstOpen`、`errorCode` | `warnings.messageKey`、报表展示字段 |
| `privacy-state` 壳页 | 前端 phase1 新壳页，更多偏状态承接 | 暂不单独产核心事件；为 `content_report_submit`、`content_review_action` 预留 `targetType/targetId` 显示位 | 可先统一公共字段和页面来源 | `reportId`、`operationLogId`、审核归因字段 | `reviewAction`、`operatorId`、报表 review 聚合 |

### 24.2 待实现字段表

| 字段 | 当前状态 | 谁先做 | 依赖说明 |
| --- | --- | --- | --- |
| `clientEventId`、`sourcePage`、`sourceFlow`、`scene`、`clientTs`、`appVersion`、`buildId`、`isTestData` | phase1 可先埋 | 前端 | 不依赖后端；测试需同步 build 与页面路径证据 |
| `entryPosition`、`createFlowId`、`cameraSource`、`photoFlowId`、`albumEntry`、`saveTarget`、`shareChannel`、`fromButton`、`permissionState` | phase1 可先埋 | 前端 | 适用于新壳页和主链路入口；先保证命名稳定 |
| `eventId`、`createdAt` | 待后端 | 后端/API | 所有正式事件都需要；没有这两个字段只能算前端草样，不算正式 analytics |
| `partyId/sessionId`、`inviteCode` | 待后端 | 后端/API | 依赖 `parties` 最小兼容出口；无主键时测试只能做 page/data 证据 |
| `photoId/momentId`、`albumPosition`、`uploadDurationMs` | 待后端 | 后端/API | phase1 003 未承诺 `photos` 出口，先记为后续阶段 |
| `ledgerEventId`、`hasPhotoEvents`、`hasLedgerEvents` | 待后端 | 后端/API | phase1 只有 `ledger` 壳页，没有账本最小出口时不可补正式成功事件 |
| `briefId`、`photoCount`、`ledgerEventCount`、`generateDurationMs` | 部分待后端 | 后端/API | 依赖 `brief` 最小兼容出口；前端仅能报入口或打开 |
| `shareTaskId`、`shareImageId`、`shareId`、`contentComposition`、`visitorType`、`daysSinceFirstOpen` | 待后端 | 后端/API | 依赖 `share` 最小兼容出口和回流识别逻辑 |
| `reviewAction`、`operatorId`、`warnings.messageKey`、`warnings.affectedCount` | 待后台 | 后台 | phase1 不在前端 003 / 后端 003 最小实装范围；进入报表和审核面后补 |
| `testRunId`、`cleanupStatus`、`sampleEventIds` 对账 | 待测试 / 接口联调 | 测试 / 接口联调 | 要跟 clean manifest 和 residual scan 一起补，不能由前端自行伪造 |

### 24.3 给测试 / 后端的字段对照提醒

| 角色 | 提醒 | 当前要求 |
| --- | --- | --- |
| 测试 | phase1 若只有壳页可进，没有后端主键，也要补 `sourcePage`、`sourceFlow`、`clientEventId`、`buildId`、`isTestData` 对照截图和 Network 摘要 | 可证明“入口已接事件位”，不能证明“成功事件已闭环” |
| 测试 | `devtools` 平台、`PR-CS-*` 批次、`clean-slate-*` 前缀必须进入测试过滤 | 防止 phase1 壳页联调样本混入正式报表 |
| 测试 | `album`、`ledger`、`privacy-state` 壳页至少各补 1 组 page/data/storage 证据 | 后续好判断页面壳已落地但业务字段未实装 |
| 后端/API | `parties` phase1 一旦可返回 `partyId/sessionId` 和 `inviteCode`，就应同步产出 `eventId`、`createdAt` 和失败 `errorCode` | 否则创建链路只能停留在前端半埋点 |
| 后端/API | `brief/share` phase1 最小出口应优先保证主键和归因字段，不急着补全报表聚合 | 最小必需字段：`briefId`、`shareId`、`shareTaskId`、`contentComposition` |
| 后端/API | `photos/ledger` 不在本轮 003 明确承诺范围时，不要伪造成功事件；缺主键时只能保留 start / click / 打开类事件 | 数据侧不能把预留字段写成已落地 |
| 后端/API | 所有 phase1 事件继续遵守第 23.1 节测试过滤规则，尤其 `isTestData`、前缀扫描和 `createdAt` 统一时区 | 否则后面 summary 和 samples 会不可对账 |

### 24.4 当前回报 PM

`PR-DATA-CLEAN-SLATE-PHASE1-MAP-003` 已完成 phase1 事件映射表和待实现字段表。当前可先做的是前端壳页公共字段、入口字段和部分页面来源字段；必须等后端 003 的是 `parties/brief/share` 主键、归因、失败码和时间字段；必须等后台后续阶段的是 `warnings`、`reviewAction` 和审核/报表展示字段。

因此 phase1 数据侧状态应写为“映射已定义 / 前端可先埋公共字段 / 后端待补主键与日志字段 / 后台待补报表字段 / 测试待补 page-data-network 对照”，不得写埋点完成。

## 25. `PR-DATA-TOOLBOX-CATALOG-008C-CHECK` 工具箱目录配置证据核查

记录时间：2026-06-18。范围只覆盖数据运营侧和后台配置侧证据核查，不改 PM 总台账，不改业务源码，不做部署、重启或清理。依据 PM 提供的 DevTools 9420 现象：`/pages/tools/index` 能打开但 page data 为 `allTools=[]`、`filteredTools=[]`、`popularTools=[]`、`categoryCards=[]`；而 `/pages/tool-detail/index?id=qr-code` 可直达。

### 25.1 文件与命令证据

| 证据 | 命令 / 文件 | 结果 |
| --- | --- | --- |
| 默认目录定义 | `backend/data/admin.js` | `DEFAULT_TOOLS_CATALOG = []`；`createDefaultStore()` 里 `toolsCatalog: normalizeToolsCatalog(DEFAULT_TOOLS_CATALOG)`，即默认新 store 的工具目录为空 |
| 当前运行时 store | `backend/data/admin-store.json` | 存在 `toolsCatalog` 数组，包含 8 个工具；全部 `status="启用"` |
| 精确统计 | `pwsh` 只读统计 `backend/data/admin-store.json` | `TOTAL=8`，`ENABLED=8`，`PLACEMENT=both|COUNT=3`，`PLACEMENT=tools|COUNT=5`，`TOOLS_HERO=MISSING` |
| 旧工具存在性 | `backend/data/admin-store.json` | 明确存在二维码生成、图片压缩、JSON 格式化、房贷计算、汇率换算；对应 ID 分别为 `tool-qr`、`tool-compress`、`tool-json`、`tool-loan`、`tool-currency` |
| 前台接口过滤条件 | `backend/data/front.js` | `listFrontendTools()` 只按 `isEnabledTool` 过滤 `status` 含“停用”的项，再按 `sortOrder` 排序；`supportsPlacement` 仅检查 `placement` 是否为 `both` 或目标位置 |
| ID 兼容映射 | `backend/data/front.js` | `TOOL_ID_MAP` 已把 `tool-qr -> qr-code`、`tool-compress -> image-compress`、`tool-json -> json`、`tool-loan -> loan-calc`、`tool-currency -> currency` 映射到前端旧工具 ID |
| 内容侧旧工具痕迹 | `backend/data/content-store.json` | `toolHistory`、`homeConfig.quickTools` 中仍有 `qr-code`、`json`、`currency`、`image-compress`、`loan-calc` 等旧工具 ID |
| 前端 fallback 逻辑 | `miniprogram/services/operations.ts` | `getManagedToolsCatalog()` 在远端 `tools` 为空时会走 `buildLocalToolsCatalog()` 本地兜底，而不是直接保留空数组 |

### 25.2 当前目录状态判断

| 检查项 | 证据 | 数据侧判断 |
| --- | --- | --- |
| 目录是否被本地 store 清空 | `backend/data/admin-store.json` 有 8 个工具 | 否，本地 store 未清空 |
| 是否被 `status` 停用 | 8/8 为 `status="启用"` | 否，不是停用导致 |
| 是否被 `placement` 配错 | `both=3`、`tools=5`，没有只投 `home` 的条目 | 否，`/pages/tools/index` 过滤到 `tools` 时理论上应有 8 个可见工具 |
| `toolsHero` 是否缺失 | `TOOLS_HERO=MISSING` | 是，Hero 配置缺失，但这只会影响标题/副标题/主图，不应把 `allTools` 过滤成空 |
| 默认配置是否危险 | `DEFAULT_TOOLS_CATALOG=[]` | 是；如果运行时 store 走了新默认初始化、未加载 `admin-store.json` 或走到空 accessor，`/api/v1/tools/catalog` 会返回空目录 |
| 旧工具是否还在目录中 | 二维码、图片压缩、JSON、房贷、汇率均存在 | 是，旧酒桌判官工具箱核心工具仍在本地 store |

### 25.3 数据侧结论

当前证据不支持“工具目录已被本地配置停用或 placement 配错”。本地 `backend/data/admin-store.json` 中 `toolsCatalog` 完整存在，8 个工具全部启用，且 `placement` 都支持工具箱页展示。

数据侧能确认的风险点有两个：

1. `backend/data/admin.js` 默认目录为空。
2. `toolsHero` 在当前 store 中缺失。

其中真正会导致 `/api/v1/tools/catalog` 变空的是第 1 点：如果运行时 store 没有正确加载 `backend/data/admin-store.json`、被新默认 store 覆盖、或读到了空 accessor，接口会返回空工具目录。第 2 点只会导致 Hero 文案和图片为空，不会让 `allTools` 变空。

另外，`backend/data/front.js` 已有 `tool-qr -> qr-code` 等 ID 兼容映射，`miniprogram/services/operations.ts` 也有远端空目录时的本地 fallback。因此 DevTools 里目录页仍出现四个空数组，数据侧不能据此判成“本地目录配置已恢复正常”，需要后台/后端继续核对运行时响应和前端兜底是否实际生效。

### 25.4 缺口与下一步责任人

| 缺口 | 当前证据 | 下一步责任人 |
| --- | --- | --- |
| `/api/v1/tools/catalog` 运行时实际响应未归档 | 只读到本地代码和 store，未记录 DevTools Network 响应体 | 测试验收负责人补 Network 响应；后端/API 负责人核对接口返回是否为空 |
| 运行时 store 是否未加载本地 `admin-store.json` | 本地文件有 8 个工具，但 PM 看到页面 data 为空 | 后台管理负责人、后端/API 负责人核对运行时 accessor / store 来源 |
| 默认空目录风险未消除 | `DEFAULT_TOOLS_CATALOG=[]` | 后台管理负责人评估是否需补种目录；后端/API 负责人评估是否需在空 store 时恢复目录 |
| Hero 缺失 | `TOOLS_HERO=MISSING` | 后台管理负责人补 `toolsHero` 标题/副标题/主图配置 |
| 前端空目录兜底未在 PM 复核中体现 | 代码里有 `buildLocalToolsCatalog()`，但 PM 看到 4 个空数组 | 前端负责人核对 fallback 触发条件、缓存和页面 `loadCatalog()` 实际数据写入 |

### 25.5 回包口径

本任务只能回报为：本地默认目录为空，但当前本地运行时 store 并未清空；`status` 与 `placement` 证据均正常；`toolsHero` 缺失；若 PM 复核时工具页仍是空数组，应写“待后台/后端补目录或前端本地兜底”，不得标记工具箱目录恢复完成。
