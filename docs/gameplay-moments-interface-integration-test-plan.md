# 酒桌判官精彩瞬间时间线接口联调测试计划

角色：接口联调负责人（已新增，待登记姓名/账号）
日期：2026-06-15
目标域名边界：只面向 `api.pomer.cn` / `jiuzhuopanguan-backend`，不触碰 `pomer.cn` 公司官网。
线上联调环境：已有线上服务器和域名，可支持联调；写接口联调必须使用固定测试数据并提前确认窗口。

## 1. 通读与核查范围

本计划已核查以下开发、进度、接口、部署和归档材料：

| 类型 | 文件 | 结论 |
| --- | --- | --- |
| 总控规格 | `docs/gameplay-moments-development-spec.md` | M0 已有首轮实现证据，M1-M5 仍按硬约束推进 |
| 前端计划 | `docs/gameplay-moments-frontend-development-plan.md` | 前端必须先完成 `operations.ts` 字段复核，再进入 M1 页面联调 |
| 后端计划 | `docs/gameplay-moments-backend-development-plan.md` | 后端联调顺序为 M0 合同、M1 timeline、M2 brief、M3 share task、M4 admin、M5 ranking |
| 后台计划 | `docs/gameplay-moments-admin-development-plan.md` | 后台四个 slug 可做壳层和只读页，强审计动作必须等接口、日志和样本齐全后联调 |
| PM 台账 | `docs/gameplay-moments-progress-tracker.md` | M0 本地 smoke 已通过；测试/验收和接口联调人员已新增，仍待提交复核记录与固定联调数据；UGC 风控已加入并提交口径文档 |
| UGC 风控计划 | `docs/gameplay-moments-ugc-risk-control-plan.md` | 私密、分享图、审核、举报、推举资格、退款和奖励发放口径已确认，待联调执行 |
| UI/UX 计划 | `docs/gameplay-moments-ui-ux-development-plan.md` | UI/UX 负责人已新增，需自动选择合适 SKILL 做界面、交互、视觉和设计 QA 复核 |
| 接口合同 | `docs/api-spec.md` | moments、timeline、brief、share task、admin review 接口已写入合同 |
| 后台 IA | `docs/admin-console-ia.md` | 后台目标入口、slug 和页面能力已定义 |
| 数据库计划 | `docs/database-normalization-plan.md`、`docs/database-upgrade-api-separation-plan.md`、`docs/database-baseline.md` | MySQL 实体表与同步路线存在，本地 MySQL 实连仍需在可用环境复测 |
| 部署说明 | `DEPLOY.md` | 线上验证只允许 `api.pomer.cn`，PM2 服务为 `jiuzhuopanguan-backend` |
| 运营归档 | `docs/archive/gameplay-auction-moments-operation-plan.md` | 提供完整流程、UGC 完整性、分享图、榜单和验收指标口径 |

当前文档状态已同步：后台计划不再按“核心开发任务未开始”处理，M4 本地 HTTP、本地浏览器 E2E 和 UGC 风控口径已有证据。接口联调计划仍以 PM 台账、总控规格和当前代码证据为准；线上写操作、真实样本、前台状态同步和测试/风控复核完成前，后台相关任务只能标记“待联调 / 待复核”。

## 2. 当前可联调边界

### 线上环境只读检查

2026-06-15 已完成线上只读 smoke：

| 检查项 | 命令 | 结果 |
| --- | --- | --- |
| 首页配置 | `curl.exe -f --max-time 15 https://api.pomer.cn/api/v1/config/home` | 通过，返回 `code:0` |
| 积分配置 | `curl.exe -f --max-time 15 https://api.pomer.cn/api/v1/config/points` | 通过，返回 `code:0` |
| 模板配置 | `curl.exe -f --max-time 15 https://api.pomer.cn/api/v1/config/templates` | 通过，返回 `code:0` |
| 后台入口 | `curl.exe -i --max-time 15 https://api.pomer.cn/admin` | 通过，GET 返回 302 到 `/admin/login` |
| 后台登录页 | `curl.exe -i --max-time 15 https://api.pomer.cn/admin/login` | 通过，GET 返回 200 登录页 |

说明：`HEAD /admin` 返回 404，不能作为后台入口失败证据；当前以后端实际 GET 行为作为线上入口判断。

### 可立即复核

| 任务 | 可复核内容 | 当前证据 |
| --- | --- | --- |
| `DEV-M0-01` | DDL 与 moments 实体表字段是否覆盖接口合同 | `backend/sql/mysql-normalized-schema.sql` 已有 moments 相关表；MySQL 实连未完成 |
| `DEV-M0-02` | moments 数据层、权限过滤、timeline、brief、share task 基础结构 | `backend/data/moments.js` 存在 |
| `DEV-M0-03` | moments / admin review / share task 接口合同 | `docs/api-spec.md` 已写入 |
| `DEV-M0-04` | 小程序服务层类型和 API 方法 | `miniprogram/services/operations.ts` 已出现 moments 方法 |
| `DEV-M0-05` | 最小 smoke 覆盖 opening、highlight、private、event、brief、share task | `backend/scripts/smoke-moments-flow.js` 存在 |
| `DEV-M4-01` 至 `DEV-M4-05` | 后台只读 slug、动作接口预置、操作日志写入路径 | `backend/data/admin.js`、`backend/server.js` 已出现相关 slug 和 action 入口 |

### 暂不能标记完成

| 范围 | 阻塞原因 | 缺少证据 |
| --- | --- | --- |
| MySQL DDL 实连 | 本机 MySQL 3306 曾 `ECONNREFUSED` | 可用 MySQL 环境下的 `npm.cmd --prefix backend run mysql:test` 和 DDL 执行记录 |
| M1 小程序页面联调 | 计划中页面和组件仍未作为主链路验收 | 前端页面实测、字段消费截图或录屏、失败态记录 |
| M3 分享图任务完整状态 | M0 只有基础 pending，真实 ready/failed/retry 队列未验收 | 任务状态机、失败样本、retry 后状态和日志 |
| M4 后台动作按钮联调 | 本地 HTTP 登录态 smoke 已通过，真实后台页面点击仍需复测 | 后台真实页面按钮点击、cookie 会话、operationLogs 页面查询截图或记录 |
| M5 榜单、推举、积分流水 | 依赖 M4 审计稳定和积分规则 | rankings、nominations、points ledger、奖励发放记录 |
| UGC 风控验收 | UGC 风控负责人已加入，口径已确认 | 私密内容、举报、下架、榜单资格、退款和重复发奖的风控执行记录 |
| UI/UX 验收 | UI/UX 负责人已加入，计划已提交 | 同一批固定数据下的小程序/后台截图、SKILL 选择记录、设计 QA 结论 |

## 3. 固定联调测试数据

接口联调统一使用一组固定语义数据，避免各角色各测各的：

| 数据 | 建议标识 | 用途 |
| --- | --- | --- |
| 测试酒局 | `it-moments-20260615-a` | 全链路 session |
| 判官 | `it-host-20260615` | 创建酒局、提交 event、后台可追溯操作者 |
| 普通成员 A | `it-member-a-20260615` | 上传 highlight / private |
| 普通成员 B | `it-member-b-20260615` | private 指定可见用户 |
| 非成员 C | `it-outsider-20260615` | 验证 403 和隐私隔离 |
| opening | `opening-host-20260615` | 每人每局一张、重复提交替换 |
| highlight | `highlight-a-20260615` | 普通全员可见节点 |
| private | `private-a-to-b-20260615` | B 可见正文和图，C/非接收者只看占位 |
| event | `event-drink-debt-20260615` | 判官写入 `drink_debt` 辅助事件 |
| failed share task | `share-task-failed-20260615` | M3/M4 retry 联调 |
| 二审 moment | `review-secondary-20260615` | M4 审核、隐藏、要求重传、日志联调 |

固定数据维护规则：

- 所有写接口必须带 `clientDraftId` 或 `clientEventId`，用于幂等复测。
- 私密节点只能给指定接收者返回正文、图片和标签；非接收者不得收到完整 `visibleProfileIds`。
- 后台动作必须带 `reason`，否则测试判为失败。
- 分享图任务必须至少覆盖 `pending`、`processing`、`ready`、`failed`、`expired`、`retry`。
- 每轮联调结束要记录数据残留；不能删除线上真实业务数据。

### 3.1 固定三用户联调数据包（P0 第二轮）

本节只记录接口联调负责人维护的数据包状态。当前未拿到可复用线上用户 token、后台账号窗口和写操作授权，不能伪造鉴权，也不能向 `api.pomer.cn` 写入或清理数据。

| 项目 | 固定语义标识 | 实际 ID / token | 服务任务 | 状态 |
| --- | --- | --- | --- | --- |
| 测试酒局 | `it-moments-20260615-a` | 缺实际 ID | `DEV-M1` 至 `DEV-M5`、前端/测试/UGC/UI/UX/后台共用 | 阻塞：缺可复用线上 sessionId |
| 判官 / host | `it-host-20260615` | 缺实际 profileId；缺 token | 创建酒局、提交 event、生成 brief/share task、后台追溯 | 阻塞：缺测试账号/token |
| 普通成员 A | `it-member-a-20260615` | 缺实际 profileId；缺 token | 上传 highlight/private、验证 `clientDraftId` 幂等 | 阻塞：缺测试账号/token |
| 普通成员 B | `it-member-b-20260615` | 缺实际 profileId；缺 token | private 接收者、M5 推举人 | 阻塞：缺测试账号/token |
| 非成员 C | `it-outsider-20260615` | 缺实际 profileId；缺 token | 验证 403、私密不泄露、非本局成员不可推举 | 阻塞：缺测试账号/token |
| opening | `opening-host-20260615` | 缺实际 ID | `DEV-M1-01`、`DEV-M1-05`、`DEV-M2-02`、`DEV-M5-01` | 阻塞：缺固定酒局和 host token |
| highlight | `highlight-a-20260615` | 缺实际 ID | `DEV-M1-03`、`DEV-M1-05`、`DEV-M2-02`、`DEV-M3-05`、`DEV-M5-01` | 阻塞：缺固定酒局和 member A token |
| private | `private-a-to-b-20260615` | 缺实际 ID | `DEV-M1-04`、`DEV-M3-05`、`UGC-QA-001`、`UGC-QA-003` | 阻塞：缺三用户 token；需 A 发给 B，C 只见占位 |
| event | `event-drink-debt-20260615` | 缺实际 ID | `DEV-M1-02`、`DEV-M1-05`、`DEV-M2-02` | 阻塞：缺 host token |
| pending share task | `share-task-pending-20260615` | 缺实际 ID | `DEV-M3-01`、`DEV-M3-02`、`DEV-M3-04` | 阻塞：缺 briefId 和 host token |
| ready share task | `share-task-ready-20260615` | 缺固定实际 ID；历史参考 `share-task-1781465622362-b11e8289` | `DEV-M3-03`、`DEV-M3-05`、前端预览/保存、UI/UX 截图 | 历史样本可参考；不是固定数据包 |
| failed share task | `share-task-failed-20260615` | 缺实际 ID | `DEV-M3-03`、`DEV-M3-04`、`DEV-M4-03`、`QA-M3-004`、`QA-M4-004` | 阻塞：缺固定失败任务；本地 smoke 会自动清理，不可作为共享数据 |
| expired share task | `share-task-expired-20260615` | 缺实际 ID | `DEV-M3-03`、`DEV-M3-04`、前端 expired/retry 状态 | 阻塞：缺状态制造方式或后端工具 |
| 待审 moment | `review-secondary-20260615` | 缺实际 ID | `DEV-M4-01`、`DEV-M4-05`、`UGC-QA-004` | 阻塞：缺线上后台账号窗口和待审样本 |
| 举报样本 | `report-private-20260615` | 缺实际 reportId | `DEV-M4-02`、`UGC-QA-005` | 阻塞：缺真实举报样本和后台处理窗口 |
| M5 ranking 样本 | `ranking-today-highlight-20260615` | 缺实际 ranking item ID | `DEV-M5-01`、`DEV-M5-03`、`QA-M5-001`、`QA-M5-003` | 阻塞：缺可上榜公开 moment |
| M5 nomination 样本 | `nomination-b-highlight-20260615` | 缺实际 nominationId | `DEV-M5-02`、`DEV-M5-04`、`QA-M5-002`、`QA-M5-004` | 阻塞：缺 member B token 和可上榜 moment |
| M5 reward payout 样本 | `reward-today-highlight-20260615` | 缺实际 payoutId | `DEV-M5-05`、`UGC-QA-008` | 阻塞：缺线上发奖窗口和重复发奖反例 |

可复跑命令与生成边界：

| 命令 | 能验证什么 | 是否生成可共享固定数据 |
| --- | --- | --- |
| `npm.cmd --prefix backend run smoke:moments-http` | 本地 HTTP 覆盖 opening/highlight/private/event、brief、ready/failed/retry、nomination、ranking、reward、refund | 否；脚本会清理 profile、session、图片和测试数据 |
| `npm.cmd --prefix backend run smoke:admin-moments` | 本地后台登录态、审核、举报、failed task retry、奖励配置、operationLogs | 否；脚本会恢复/清理 smoke 数据 |
| `npm.cmd --prefix backend run smoke:ugc-risk` | 本地风控反例、私密占位、分享图过滤、推举拒绝、退款 | 否；脚本会清理风险样本 |

线上生成状态：当前缺用户 token、后台账号、写操作窗口和清理授权，不能安全生成线上固定数据包。后端/API 或运维需先提供测试账号/token 获取方式和只写测试前缀；接口联调负责人再按本节语义标识生成实际 ID 并回填。

清理策略：

- 所有线上固定样本必须使用 `it-` / `IT-MOMENTS-20260615-` 前缀，并登记创建人、创建时间、任务编号和清理授权。
- 清理只能删除或回收上述固定测试前缀样本，不得扫描删除真实用户数据。
- 涉及积分、推举、奖励发放的样本，清理前必须先导出 `pointsLedger`、`momentNominations`、`rankingRewardPayouts` 证据，再由 PM/运维确认是否回滚或保留。
- failed/expired/retry 样本清理前必须保留任务状态截图或接口响应，避免后台、前端、测试和 UGC 无法复核同一条样本。

### 3.2 `INT-DATA-001` 最小生成方案

目标：生成一份可供前端、测试、UGC、UI/UX、后台共用的固定三用户联调 manifest。当前只能形成方案和 manifest 草案；缺鉴权凭据和写操作窗口前，不执行线上生成。

前置输入：

| 输入 | 来源 | 用途 | 当前状态 |
| --- | --- | --- | --- |
| `baseUrl` | PM/运维 | 本地或 `https://api.pomer.cn/api/v1` | 线上只能使用 `api.pomer.cn` |
| host/memberA/memberB/outsider 登录方式 | 后端/API 或运维 | 换取 `X-JZP-User-Token` | 缺 |
| 后台账号或后台 session cookie | PM/运维/后台 | 审核、举报处理、后台 retry、发奖 | 缺 |
| 写操作窗口 | PM/运维 | 避免污染真实业务 | 缺 |
| 清理授权 | PM/运维 | 按 manifest 精确回收测试数据 | 缺 |
| 固定前缀 | 接口联调负责人 | 数据隔离和检索 | 建议 `IT-MOMENTS-20260615` |

建议脚本：`backend/scripts/prepare-moments-integration-fixture.js`。该脚本属于后端/API 协作项，接口联调负责人只提出设计；未获 PM 派发前不新增业务源码。

建议参数：

```text
node backend/scripts/prepare-moments-integration-fixture.js --mode create --base-url https://api.pomer.cn/api/v1 --prefix IT-MOMENTS-20260615 --manifest docs/runtime/int-data-001-manifest.json --keep
node backend/scripts/prepare-moments-integration-fixture.js --mode cleanup --manifest docs/runtime/int-data-001-manifest.json --export-evidence docs/runtime/int-data-001-evidence.json
```

创建顺序：

| 顺序 | 操作 | API / 复用逻辑 | 产物 |
| --- | --- | --- | --- |
| 1 | 登录或注入 4 个测试身份 | 复用 `smoke-moments-http-flow.js#createMiniSession` 的本地思路；线上需真实 token 获取方式 | `profiles.host/memberA/memberB/outsider` |
| 2 | host 创建酒局，A/B 加入，outsider 不加入 | `POST /sessions`、`POST /sessions/join` | `session.sessionId`、`inviteCode` |
| 3 | 上传开场图并创建 opening | `POST /moments/uploads/image`、`POST /sessions/:sessionId/moments` | `moments.openingId` |
| 4 | A 创建 highlight | `POST /sessions/:sessionId/moments` | `moments.highlightId` |
| 5 | A 创建 private，`visibleProfileIds=[memberB]` | `POST /sessions/:sessionId/moments` | `moments.privateId` |
| 6 | host 创建 `drink_debt` event | `POST /sessions/:sessionId/events` | `events.drinkDebtEventId` |
| 7 | host 生成 brief | `POST /sessions/:sessionId/brief` | `brief.briefId` |
| 8 | 创建 pending share task | `POST /session-briefs/:briefId/share-image-tasks` | `shareTasks.pendingTaskId` |
| 9 | process 一条 ready task 并 GET 图片 | `POST /share-image-tasks/:taskId/process`；GET `imageUrl` | `shareTasks.readyTaskId`、`imageUrl` |
| 10 | 制造 failed task | 复用 `smoke-moments-http-flow.js` 的“创建任务后让 selected node 不可公开，再 process”思路，或后端提供测试专用失败状态工具 | `shareTasks.failedTaskId` |
| 11 | 制造 expired task | 需要后端提供状态制造能力，或脚本在本地 JSON store 模式写入；线上不能直接改库 | `shareTasks.expiredTaskId` |
| 12 | 创建待审 moment | 新建 `reviewStatus=pending` / `secondaryReviewStatus=pending` 的公开样本；若接口默认状态不支持，需后端提供测试 helper | `admin.reviewMomentId` |
| 13 | 创建举报样本 | 需要前台举报接口或后端测试 helper；后台 smoke 当前直接写 store，线上不可直接复用 | `admin.reportId` |
| 14 | 审核可上榜样本并创建 nomination | `POST /admin/moments/:momentId/review`、`POST /moments/:momentId/nominations` | `m5.nominationId`、`m5.rankingCategory` |
| 15 | 查询 ranking | `GET /rankings/today?category=best_opening` 或 `today_highlight` | `m5.rankingItemId` |
| 16 | 可选发奖样本 | `POST /admin/ranking-rewards/grant` | `m5.rewardPayoutId`、`pointsLedger` 证据 |

manifest 草案：

```json
{
  "id": "INT-DATA-001",
  "prefix": "IT-MOMENTS-20260615",
  "environment": "local|api.pomer.cn",
  "baseUrl": "https://api.pomer.cn/api/v1",
  "createdAt": "",
  "createdBy": "接口联调负责人",
  "cleanupAuthorizedBy": "",
  "profiles": {
    "host": { "profileId": "缺实际 ID", "token": "缺 token", "role": "host" },
    "memberA": { "profileId": "缺实际 ID", "token": "缺 token", "role": "member" },
    "memberB": { "profileId": "缺实际 ID", "token": "缺 token", "role": "member" },
    "outsider": { "profileId": "缺实际 ID", "token": "缺 token", "role": "outsider" }
  },
  "session": { "sessionId": "缺实际 ID", "inviteCode": "缺实际 ID", "status": "active" },
  "moments": {
    "openingId": "缺实际 ID",
    "highlightId": "缺实际 ID",
    "privateId": "缺实际 ID",
    "reviewMomentId": "缺实际 ID"
  },
  "events": { "drinkDebtEventId": "缺实际 ID" },
  "brief": { "briefId": "缺实际 ID" },
  "shareTasks": {
    "pendingTaskId": "缺实际 ID",
    "readyTaskId": "缺实际 ID",
    "readyImageUrl": "缺实际 ID",
    "failedTaskId": "缺实际 ID",
    "expiredTaskId": "缺实际 ID"
  },
  "admin": {
    "reportId": "缺实际 ID",
    "operationLogIds": []
  },
  "m5": {
    "rankingCategory": "best_opening",
    "rankingItemId": "缺实际 ID",
    "nominationId": "缺实际 ID",
    "rewardPayoutId": "缺实际 ID",
    "pointsLedgerIds": []
  },
  "cleanup": {
    "mode": "manifest-only",
    "command": "node backend/scripts/prepare-moments-integration-fixture.js --mode cleanup --manifest docs/runtime/int-data-001-manifest.json",
    "mustExportEvidenceBeforeCleanup": true
  }
}
```

可复用脚本片段：

| 来源脚本 | 可复用部分 | 不能直接复用的原因 |
| --- | --- | --- |
| `backend/scripts/smoke-moments-http-flow.js` | `api()` 的 `X-JZP-User-Token` 调用方式；4 个用户、创建酒局、加入、上传、opening/highlight/private/event、brief、share task、process、failed/retry、nomination、ranking、reward、refund 主链路 | `finally` 会清理；ID 使用时间戳；默认本地自启服务；线上账号策略未参数化 |
| `backend/scripts/smoke-admin-moments-flow.js` | 后台登录 cookie、审核页、举报页、分享任务 retry、奖励配置、operationLogs 校验 | 直接构造本地 store 样本；`finally` 恢复；不适合线上固定数据 |
| `backend/scripts/smoke-ugc-risk-flow.js` | 私密占位断言、分享图安全节点过滤、推举反例、举报退款链路 | 直接走本地数据层；`finally` 清理；不能给前端/后台共用 |

后端/API 需要新增能力：

- 脚本支持 `create|cleanup|status` 三种模式，默认只读 `status`。
- 线上模式必须只通过公开/后台 API 写入，不直接改 JSON store 或数据库。
- 支持 `--keep` 保留固定数据；没有 `--keep` 时仍按 smoke 清理。
- 输出 manifest，并在 cleanup 前导出证据：timeline、brief、share task、report、ranking、points ledger、operation logs。
- 提供 failed/expired share task 的可控制造方式；如果线上不允许手动改状态，需新增测试专用受控 endpoint 或后台 action。
- 提供 report 样本创建路径；如果前台举报 API 尚未开放，需要后端提供测试 helper 或明确由后台负责人手工创建。

### 3.3 当前 manifest M4/M5 样本交接表

记录时间：2026-06-15。范围仅限当前本地 `INT-DATA-001` actual manifest：`docs/runtime/int-data-001-manifest.json`，base 为 `http://127.0.0.1:3221/api/v1` 或同 LAN 候选 `http://192.168.0.101:3221/api/v1`。本表只做接口联调交接，不替后台、UGC、测试、UI/UX 写通过；不 cleanup、不 recreate、不写线上、不改 PM 总台账。

当前固定数据：

| 类型 | 当前 ID / 状态 | 可交接用途 | 限制 |
| --- | --- | --- | --- |
| session | `session-1781507687012-e4343d` | M1-M5 共用固定酒局 | 仅本地 fixture；真机需同 LAN/代理 |
| opening | `moment-1781507687032-eb1806a4`，`approved` / secondary `approved` / `rankingEligible=true` | M5 `best_opening` 榜单候选、ranking item、奖励发放样本 | 不代表线上榜单；如测试要重复发奖需先确认幂等和清理策略 |
| highlight | `moment-1781507687034-93c8676b`，`pending` / secondary `pending` | 可替代 `moments.reviewMomentId` 作为 M4 待审样本候选 | manifest 字段 `moments.reviewMomentId` 为空；后台/测试使用时必须写明替代来源为 `highlightId`，不得声称 dedicated reviewMomentId 已回填 |
| private | `moment-1781507687036-c0cc62cc`，memberB 可见、其他视角占位 | M1 私密不泄露、UGC 私密过滤、UI/UX 占位视觉复核 | 只能做只读权限/展示验证；不用于公开分享图节点 |
| failed candidate | `moment-1781507687039-ee0677bb`，`hidden` | M4 隐藏内容、M3 failed share task 的候选背景样本 | 已隐藏，不应作为公开展示通过证据 |
| report | `moment-report-it-moments-20260615` | M4 举报列表/处理样本、UGC 举报口径复核 | 是否执行处理写操作需 PM 单独授权；当前 `admin.operationLogIds=[]` |
| share task 四态 | pending `share-task-1781507687044-805585b3`；ready `share-task-1781507687046-d1098582`；failed `share-task-1781507687115-e4df874c`；expired `share-task-it-moments-20260615-expired` | M3/M4 分享任务状态、retry、后台任务监控、UI/UX 状态展示 | retry 属写操作；测试/后台执行前需 PM 授权，并记录状态变化 |
| M5 nomination | `nomination-1781507687124-4ad71db9`，category `best_opening` | M5 推举、榜单计分、积分消费样本 | `m5.pointsLedgerIds=[]`，积分流水 ID 未回填；需要后端/API 或测试从 commerce/ledger 响应补证 |
| M5 reward payout | `ranking-reward-payout-1781507687129-1ea46263` | M5 发奖/奖励记录样本 | 已有 payout ID，但 `pointsLedgerIds=[]`；重复发奖或退款验证需 PM 授权 |

按角色交接：

| 角色 | 可用样本 | 用途 | 限制 / 是否可执行写操作 |
| --- | --- | --- | --- |
| 后台 | `highlightId` 作为待审候选；`reportId`；failed/expired share task；`rewardPayoutId` | 审核、举报处理、分享任务 retry、奖励记录页和发奖记录复核 | 默认只读。审核、举报处理、retry、发奖均为写操作，必须等 PM 明确授权；`operationLogIds=[]`，执行后需后台回填 operation log 证据 |
| UGC | `privateId`；hidden `failedCandidateMomentId`；`reportId`；ready/failed/expired task | 私密占位、不泄露、隐藏内容、举报样本、分享图过滤口径复核 | 默认只读。若要改举报状态、隐藏/恢复内容或触发 retry，需 PM 授权；不得把 hidden 样本当公开内容通过 |
| 测试 | session、4 个 profile/token、opening/highlight/private、brief、share task 四态、report、nomination、reward payout | 第一小时 manifest 核对、M1 私密、M2 brief、M3 share task、M4 低风险后台动作、M5 榜单/奖励冒烟 | 可执行只读验证；写操作只按测试计划和 PM 授权窗口执行。`reviewMomentId`、`operationLogIds`、`pointsLedgerIds` 为空需在测试记录中列为字段缺口或替代口径 |
| UI/UX | private 占位、ready PNG、pending/failed/expired task、highlight 待审态 | 时间线隐私占位、分享任务状态、海报预览、待审/隐藏状态视觉检查 | 仅做视觉/交互复核，不操作写接口；需说明截图来自本地 `INT-DATA-001`，不代表线上 |

字段缺口与替代口径：

| 字段 | 当前状态 | 可否替代 | 责任方 / 下一步 |
| --- | --- | --- | --- |
| `moments.reviewMomentId` | 空 | 可由 `moments.highlightId=moment-1781507687034-93c8676b` 临时代替待审样本，因为该 moment 为 `pending/pending` | 后台/测试使用时必须写明替代口径；若必须 dedicated reviewMomentId，PM 派后端/API 或接口联调在授权后重建 manifest |
| `admin.operationLogIds` | 空 | 不可直接替代 | 后台在执行审核、举报处理、retry、发奖等写操作后回填 operation log 证据；未执行写操作前不得写完成 |
| `m5.pointsLedgerIds` | 空 | 不可直接替代 | 后端/API 或测试从用户 commerce/points ledger 只读接口补采；若要验证发奖/退款流水，需 PM 授权写操作窗口 |

### 3.4 人工真机 / 后台联调样本快照

记录时间：2026-06-15。范围仅限当前 latest manifest `docs/runtime/int-data-001-manifest.json`。本节用于测试、前端、后台、UGC、UI/UX 人工执行时统一引用当前样本，避免混用旧 `sessionId/profileId/taskId`。本节不替任何角色写通过；不 cleanup、不 recreate、不线上写入、不改 PM 总台账。

API base：

| 场景 | API base | 限制 |
| --- | --- | --- |
| 本机接口层复核 | `http://127.0.0.1:3221/api/v1` | 仅本机可用；当前只读探测可用 |
| 同 LAN / 代理真机候选 | `http://192.168.0.101:3221/api/v1` | 手机与电脑需同网或走可控代理；微信开发者工具/体验版需允许本地调试或配置合法域名/不校验合法域名方案；上线前必须切回 `https://api.pomer.cn/api/v1` |

当前身份与用途：

| 角色 | profileId | token 位置 / 指纹 | 用途 | 限制 |
| --- | --- | --- | --- | --- |
| host / 判官 | `user-1781507686650-a33705` | `profiles.host.token`，后 8 位 `f69589` | 创建者视角、timeline 占位复核、brief/share task/admin 只读接口 host token | 不代表后台管理员；后台写操作仍需后台账号 |
| memberA / 上传者 | `user-1781507686651-a46952` | `profiles.memberA.token`，后 8 位 `b36b0b6` | highlight/private 上传者视角，M1 私密发起人 | 真机需前端/测试能映射到该身份或使用 token 调试 |
| memberB / 接收者 | `user-1781507686651-000860` | `profiles.memberB.token`，后 8 位 `5d48f60` | private 接收者视角，验证可见正文和图片 | 仅本局成员；不用于非成员占位 |
| outsider / 非本局 | `user-1781507686651-093df4` | `profiles.outsider.token`，后 8 位 `281c81` | 非本局 403、私密不泄露反例 | 不在当前 session 中；访问 session timeline 应为 403 |

当前样本：

| 类别 | 当前 ID | 人工联调用途 | 限制 |
| --- | --- | --- | --- |
| session | `session-1781507687012-e4343d` | 进入 live-record、moment-editor、timeline、brief、rankings 的固定酒局 | 仅 latest manifest；不要使用旧 session |
| inviteCode | `C56EVT` | 如需加入/识别酒局的辅助信息 | 当前 fixture 已生成成员关系，通常不需重新 join |
| opening / 榜单候选 | `moment-1781507687032-eb1806a4` | M5 `best_opening` ranking item；opening 展示；奖励样本关联 | 写操作需 PM 授权；不代表线上榜单 |
| highlight / 待审替代样本 | `moment-1781507687034-93c8676b` | M4 待审样本候选；UI/UX 待审状态；测试后台低风险动作候选 | `moments.reviewMomentId` 为空，使用时必须写明以 `highlightId` 替代 dedicated review moment |
| private | `moment-1781507687036-c0cc62cc` | M1 私密不泄露：memberB 可见，host/其他视角占位 | 不用于分享图公开节点；真机必须采集 B 可见与非接收者占位证据 |
| hidden / failed candidate | `moment-1781507687039-ee0677bb` | UGC 隐藏内容、failed share 背景样本 | 已 hidden，不得当公开内容通过 |
| report | `moment-report-it-moments-20260615` | M4 举报样本、UGC 举报口径复核 | 处理举报是写操作，需 PM 授权；`operationLogIds` 当前为空 |
| brief | `brief-1781507687042-d1990edd` | M2 简报、M3 share task 关联 | 仅本地 fixture |
| pending share task | `share-task-1781507687044-805585b3` | M3 pending 状态展示；pending 不可 retry 反例 | 只读可用；retry 写操作需授权 |
| ready share task | `share-task-1781507687046-d1098582` | M3 ready 预览、PNG 保存、UI/UX 图片状态 | PNG 路径 `/uploads/moments/share-tasks/share-task-1781507687046-d1098582.png` |
| failed share task | `share-task-1781507687115-e4df874c` | M3/M4 failed 状态、retry 按钮、后台任务监控 | retry 是写操作，需 PM 授权并记录状态变化 |
| expired share task | `share-task-it-moments-20260615-expired` | M3/M4 expired 状态、retry 按钮、UI/UX 状态展示 | 当前只读可用；retry 是写操作，需 PM 授权 |
| nomination | `nomination-1781507687124-4ad71db9` | M5 推举记录、榜单计分 | 积分流水 ID 未回填 |
| reward payout | `ranking-reward-payout-1781507687129-1ea46263` | M5 奖励发放记录样本 | 发奖/退款复测需 PM 授权；points ledger ID 未回填 |

当前只读探测：

| 接口 | 结果 | 备注 |
| --- | --- | --- |
| `GET /config/home` | HTTP 200，`code:0` | 当前 3221 可用 |
| `GET /share-image-tasks/share-task-1781507687044-805585b3` | HTTP 200，`status=pending` | host token |
| `GET /share-image-tasks/share-task-1781507687046-d1098582` | HTTP 200，`status=ready` | host token |
| `GET /share-image-tasks/share-task-1781507687115-e4df874c` | HTTP 200，`status=failed` | host token |
| `GET /share-image-tasks/share-task-it-moments-20260615-expired` | HTTP 200，`status=expired` | host token |

仍缺字段：

| 字段 / 条件 | 当前状态 | 下一步责任 |
| --- | --- | --- |
| `moments.reviewMomentId` | 空 | 若必须 dedicated review ID，PM 派后端/API 或接口联调在授权后补建；当前只能用 `highlightId` 替代并标注 |
| `admin.operationLogIds` | 空 | 后台在 PM 授权写操作后回填 operationLogs 证据 |
| `m5.pointsLedgerIds` | 空 | 后端/API 或测试从 commerce/points ledger 只读响应补采；账务写操作需 PM 授权 |
| 后台管理员账号 / 写操作窗口 | 未由接口联调提供 | PM/后台提供；接口联调仅提供样本 ID 和 token |
| 真机设备 / 体验版二维码 / A/B/C 登录态 | 未由接口联调提供 | 前端/测试提供并采集截图/录屏；无证据不得写真机通过 |

### 3.5 聚会记录师三步流程联调数据草案

记录时间：2026-06-15。依据 `docs/party-recorder-redesign-requirements.md`，新版目标是“创建聚会、邀请/加入、拍第一张记录”三步内完成。本文只维护接口联调数据草案和样本边界；不 cleanup、不 recreate、不写线上、不改 PM 总台账，不替前端、后端/API、测试、UI/UX 标记完成。

三步流程数据需求：

| 步骤 | 目标动作 | 需要的数据 / 接口 | 当前 `INT-DATA-001` 可复用项 | 缺口 / 责任方 |
| --- | --- | --- | --- | --- |
| 1. 创建聚会 | 首页点击“创建聚会”，自动生成默认聚会房间 | `POST /sessions` 或新版 quick create；默认房间名、默认主题、默认权限、创建者 token | 已有固定 session `session-1781507687012-e4343d`；host `user-1781507686650-a33705` / `profiles.host.token` 可做发起人；manifest `inviteCode=C56EVT` | 后端/API 需确认是否新增 `party-recorder` 快速创建字段或沿用 `/sessions`；前端需给新版入口页面和 query；UI/UX 需确认默认主题/文案 |
| 2. 邀请 / 加入 | 创建后立即展示邀请码/二维码/分享入口，成员可加入 | `inviteCode`、join API、参与者 token、分享入口或二维码数据 | inviteCode `C56EVT`；memberA `user-1781507686651-a46952`、memberB `user-1781507686651-000860` 已在固定局；outsider `user-1781507686651-093df4` 可做非成员反例 | 前端需提供新版邀请页路径、二维码/分享卡生成方式；后端/API 需确认是否需要专用邀请短链/sharePage 字段；测试需确认真机加入方式 |
| 3. 拍第一张记录 | 点击“开始记录 / 拍第一张”，进入拍照或上传并生成第一条记录 | 上传图片、创建 moment/record、timeline 读取、首条记录状态 | 可用 firstMoment 候选：opening `moment-1781507687032-eb1806a4`，已 approved/secondary approved，可作为“第一张记录”只读样本；private `moment-1781507687036-c0cc62cc` 可做隐私反例 | 前端需确认新版拍照/上传页路径和按钮流；后端/API 需确认是否把 `opening` 改名/映射为 `first_record` 或新增 record 类型；测试需真机拍照/上传录屏 |

三步流程固定数据草案：

| 数据项 | 当前值 | 用途 | 是否可复用 | 限制 |
| --- | --- | --- | --- | --- |
| `sessionId` | `session-1781507687012-e4343d` | 新版聚会房间固定样本 | 可复用 | 旧字段名仍是 session；产品文案应显示“聚会” |
| `inviteCode` | `C56EVT` | 邀请/加入样本 | 可复用 | 缺新版二维码/分享卡实体 |
| 发起人 profile/token | host `user-1781507686650-a33705` / `profiles.host.token` | 创建聚会、查看房间、发起分享 | 可复用 | token 存在于 manifest；不写入本文完整 token |
| 成员 A profile/token | `user-1781507686651-a46952` / `profiles.memberA.token` | 上传者、第一张记录或后续记录 | 可复用 | 真机登录态需前端/测试映射 |
| 成员 B profile/token | `user-1781507686651-000860` / `profiles.memberB.token` | 加入者、接收者、相册查看 | 可复用 | 真机登录态需前端/测试映射 |
| 非成员 profile/token | outsider `user-1781507686651-093df4` / `profiles.outsider.token` | 非成员访问限制、隐私反例 | 可复用 | 不应能访问当前聚会 timeline |
| `firstMoment` 候选 | opening `moment-1781507687032-eb1806a4` | “拍第一张记录”完成后的首条记录只读样本 | 可复用 | 这是旧 moments 的 `opening` 类型；后端/API 需确认新版命名映射 |
| `privateMoment` | `moment-1781507687036-c0cc62cc` | 隐私/可见性反例 | 可复用 | 不作为默认首条公开记录 |
| `sharePage` / 分享入口 | 缺实际 sharePage URL 或二维码 ID | 邀请页、分享页、相册页入口 | 不完整 | 前端需给页面路径；后端/API 需确认是否新增短链、二维码、公开分享页字段 |
| `briefId` | `brief-1781507687042-d1990edd` | 可临时代替聚会相册/简报入口 | 可临时复用 | 产品文案需从“简报/战报”降权为“相册/回忆” |
| ready share image | `share-task-1781507687046-d1098582`，PNG `/uploads/moments/share-tasks/share-task-1781507687046-d1098582.png` | 分享页/海报预览样本 | 可复用 | 不等于新版 sharePage；只作为图片任务样本 |

API base 边界：

| 环境 | base | 可做什么 | 禁止 / 限制 |
| --- | --- | --- | --- |
| 本地 | `http://127.0.0.1:3221/api/v1` | 本机接口只读、开发者工具本机调试、manifest 数据复核 | 不代表线上；不得 cleanup/recreate，除非 PM 另派 |
| 同 LAN / 代理 | `http://192.168.0.101:3221/api/v1` | 手机与电脑同网时的人工真机候选 API | 需前端/测试确认不校验合法域名或代理方案；不能作为线上验收 |
| 线上 | `https://api.pomer.cn/api/v1` | 上线前/线上只读或授权写入验证 | 本轮不写线上；不得触碰 `pomer.cn` 公司官网 |

当前结论：

- `INT-DATA-001` 可支撑三步流程的接口层样本草案：已有固定聚会、发起人/成员/非成员 token、邀请码、第一张记录候选、相册/分享图候选。
- 新版“聚会记录师”仍缺产品化字段和页面合同：`sharePage`、新版邀请页、拍第一张记录页、默认主题/房间名、`opening` 到 `first_record` 的命名映射。
- 接口联调只能先提供样本和边界；后端/API 与前端确认合同前，不把三步流程标记为可验收完成。

### 3.6 `PR-INT-RETEST-001` 三步创建复拍接口/数据说明

记录时间：2026-06-15。目标是支撑前端/测试对“聚会记录师三步创建并拍第一张”的复拍。本文只提供接口联调数据和边界，不 cleanup、不 recreate、不线上写入、不改 PM 总台账，不替前端/测试写通过。

复拍可用固定数据：

| 数据 | 当前值 | 用途 | 备注 |
| --- | --- | --- | --- |
| `sessionId` | `session-1781507687012-e4343d` | 进入当前聚会、记录页、相册/brief、分享任务复核 | 当前 latest manifest；不要使用旧 session |
| `inviteCode` | `C56EVT` | 邀请/加入页展示、手动加入输入样本 | 当前 memberA/memberB 已在局内；如要演示“新成员加入”，需 PM 授权新 session 或新增测试身份 |
| host | `user-1781507686650-a33705`，token 字段 `profiles.host.token` | 发起人/创建者/记录管理视角 | 可读 session、timeline、brief、share task |
| memberA | `user-1781507686651-a46952`，token 字段 `profiles.memberA.token` | 上传者/拍第一张记录演示身份 | 可作为“开始记录 / 拍第一张”的用户视角 |
| memberB | `user-1781507686651-000860`，token 字段 `profiles.memberB.token` | 参与者/被邀请者/相册查看者 | 可用于验证加入后查看记录 |
| outsider | `user-1781507686651-093df4`，token 字段 `profiles.outsider.token` | 非成员反例 | 访问当前 session timeline 应为 403 |
| firstMoment 候选 | opening `moment-1781507687032-eb1806a4` | 已存在的“第一张记录”只读样本 | 如复拍必须现场新拍/新上传，这属于写操作，需 PM 授权或使用独立新 session |
| private 反例 | `moment-1781507687036-c0cc62cc` | 隐私可见性检查 | memberB 可见，非接收者占位 |
| brief / 相册候选 | `brief-1781507687042-d1990edd` | 聚会记录聚合页、相册/回忆入口样本 | 文案需由前端按“聚会记录师”改版调整 |
| share image / 分享候选 | ready task `share-task-1781507687046-d1098582`，PNG `/uploads/moments/share-tasks/share-task-1781507687046-d1098582.png` | 分享预览/海报样本 | 不是新版 sharePage URL；sharePage 仍缺 |

页面 query 建议（待前端确认最终页面名和参数）：

| 场景 | 建议页面 / query | 数据来源 | 需要前端确认 |
| --- | --- | --- | --- |
| 继续当前聚会记录 | `pages/live-record/index?sessionId=session-1781507687012-e4343d` | `manifest.session.sessionId` | 新版“记录”页是否仍使用 `live-record`，是否需要 `apiBase`/环境开关 |
| 拍第一张记录 / 上传 | `pages/moment-editor/index?sessionId=session-1781507687012-e4343d&type=opening` | `sessionId` + firstMoment 旧类型 `opening` | 新版是否改为 `type=first_record`、`recordType=photo` 或其他字段 |
| 邀请 / 加入 | `pages/live-record/index?sessionId=session-1781507687012-e4343d&inviteCode=C56EVT` 或新版邀请页 | `sessionId` + `inviteCode` | 新版邀请页路径、二维码/分享卡参数、是否支持仅 inviteCode 打开 |
| 相册 / 分享预览 | `pages/session-brief/index?sessionId=session-1781507687012-e4343d&briefId=brief-1781507687042-d1990edd` | `brief.briefId` | 新版相册页是否替代 `session-brief`；sharePage URL/短链仍缺 |
| 非成员反例 | 同 timeline/记录页，使用 outsider token | `profiles.outsider.token` | 前端/测试如何注入或切换非成员身份 |

如三步录屏需要“全新 session”：

| 需求 | 当前可做方式 | 边界 |
| --- | --- | --- |
| 只演示已有聚会的三步入口和首条记录 | 使用当前 `INT-DATA-001`，不写数据 | 可立即给前端/测试复拍引用，但不能证明新建写入链路 |
| 本地新建 session 并真实拍/上传第一张 | 本地可沿现有公开 API：host token `POST /sessions`，成员 token `POST /sessions/join`，上传后 `POST /sessions/:sessionId/moments` 创建 opening/record | 这会新增本地数据；本轮未获授权，不执行。需 PM 明确授权是否生成新 session、是否保留、是否清理 |
| cleanup/recreate `INT-DATA-001` | 需执行 fixture cleanup/create | 本轮禁止；如需要必须由 PM 单独授权 |
| 线上新建或复拍 | `https://api.pomer.cn/api/v1` 写操作 | 本轮禁止；线上写入需 PM/运维授权、测试账号、清理策略；不得触碰 `pomer.cn` |

API base 使用边界：

| base | 用途 | 限制 |
| --- | --- | --- |
| `http://127.0.0.1:3221/api/v1` | 本机开发者工具、接口只读、当前 manifest 数据读取 | 当前仅允许只读；不 cleanup、不 recreate |
| `http://192.168.0.101:3221/api/v1` | 同 LAN 手机/代理候选 | 需手机与电脑同网，且前端/测试处理合法域名/不校验合法域名；不代表线上 |
| `https://api.pomer.cn/api/v1` | 上线前目标 API | 本轮不写线上；线上只读/写入须按 PM 授权；不得触碰 `pomer.cn` 公司官网 |

当前缺口：

- `sharePage` / 邀请短链 / 二维码 ID 缺实际字段，需前端和后端/API 确认。
- “拍第一张记录”的接口字段仍是旧 `opening`，是否映射为 `first_record` 需后端/API 确认。
- 前端需确认页面路径、query 参数、身份/token 注入方式、是否支持 LAN API。
- 测试需确认复拍是“复用现有数据演示”还是“新建 session 真写入”；后者必须等 PM 授权。

### 3.7 `PR-INT-ASSET-FLOW-001` 资产接入后三步路径核查

记录时间：2026-06-15。已读取前端计划 14.8、接口联调计划 3.6、测试计划 13.16.10。前端 `PR-FE-ASSET-INTEGRATE-001` 已将三步路径调整为：`create-session` 调用现有 `createManagedSession` 后直达 `invite-group`，邀请页主 CTA 跳 `moment-editor?nodeType=opening`。本节只做接口联调核查，不 cleanup、不线上写入、不改 PM 总台账。

可用测试参数：

| 参数 | 当前值 / 建议 | 用途 | 限制 |
| --- | --- | --- | --- |
| 本地 API base | `http://127.0.0.1:3221/api/v1` | 开发者工具本机调试、接口只读 | 本轮不执行写操作 |
| LAN API base | `http://192.168.0.101:3221/api/v1` | 同 LAN 真机候选 | 需前端/测试确认合法域名或代理/不校验合法域名 |
| 线上 API base | `https://api.pomer.cn/api/v1` | 上线前目标 | 本轮不写线上；写入需 PM/运维授权 |
| sessionId | `session-1781507687012-e4343d` | 复用已有聚会进入邀请/记录/拍第一张 | 只能验证“已有数据复拍”，不能证明新建 session 写入 |
| inviteCode | `C56EVT` | 邀请页展示、加入口令样本 | 当前 memberA/memberB 已在局内 |
| host | `user-1781507686650-a33705` / `profiles.host.token` | 发起人/创建者视角 | 不等于后台管理员 |
| memberA | `user-1781507686651-a46952` / `profiles.memberA.token` | 普通成员拍第一张/上传者视角 | 真机需前端/测试确认登录态映射 |
| memberB | `user-1781507686651-000860` / `profiles.memberB.token` | 参与者/接收者视角 | 可用于加入后查看 |
| outsider | `user-1781507686651-093df4` / `profiles.outsider.token` | 非成员反例 | 应无法访问当前 session timeline |
| firstMoment | opening `moment-1781507687032-eb1806a4` | 已有“拍第一张”结果样本 | 不是新拍写入证据 |

页面 query 建议：

| 页面 | 建议 query | 说明 |
| --- | --- | --- |
| `create-session` | 由前端按默认入口进入，不建议预置旧 `sessionId` | 若录屏必须证明创建动作，需真实调用 `createManagedSession`，属于写操作 |
| `invite-group` | `sessionId=session-1781507687012-e4343d&inviteCode=C56EVT` | 仅用于复用 fixed data 打开邀请页；前端需确认页面实际参数 |
| `moment-editor` | `sessionId=session-1781507687012-e4343d&nodeType=opening` | 与前端 14.8 的主 CTA 一致；用于“拍第一张”入口复拍 |
| `live-record` / 记录页 | `sessionId=session-1781507687012-e4343d` | 查看首条 opening、timeline 和后续记录 |

核查结论：

- 现有 `INT-DATA-001` 足够支撑前端/测试复拍：已有 sessionId、inviteCode、host/member/outsider、token、opening firstMoment、API base 和建议页面 query。
- 如果测试目标是验证前端三步视觉路径、邀请页主 CTA、`moment-editor?nodeType=opening` 跳转，当前 fixed data 可用。
- 如果测试目标是证明 `create-session -> createManagedSession -> invite-group` 真实新建 session，必须执行写操作；本轮未授权，应标记为 `待 PM 授权本地/线上写入`。
- 后端/API 暂不需要新配合即可复用现有 session 复拍；若要求新 session、sharePage/二维码实体、或 `opening` 改为 `first_record`，需后端/API 确认合同。

### 3.8 `PR-INT-AUTH401-REPRO-001` 鉴权合同复核

记录时间：2026-06-15。用户报错接口：`GET /reports/history?mode=host`、`GET /user/session-moment-summaries`。本节只做只读鉴权复核，不线上写入、不 cleanup、不改 PM 总台账。

后端合同：

| 项目 | 结论 |
| --- | --- |
| 请求头 | 优先使用 `X-JZP-User-Token: <token>`；也支持 `Authorization: Bearer <token>` |
| 无 token | HTTP 401，payload `{ "code": 401, "message": "unauthorized", "data": null }` |
| 无效 token | HTTP 401，payload 同上 |
| 有效 token | HTTP 200，payload `{ "code": 0, "message": "ok", "data": ... }` |
| 前端处理建议 | 收到 401 时清理本地失效登录态或触发重新登录/重新换取用户 token；不要无限重试，不要把 401 当空数据渲染 |

只读复核结果：

| 环境 | token | `/reports/history?mode=host` | `/user/session-moment-summaries` | 说明 |
| --- | --- | --- | --- | --- |
| 本地 `127.0.0.1:3221` | 无 token | HTTP 401 / `code=401` / `unauthorized` | HTTP 401 / `code=401` / `unauthorized` | 符合合同 |
| 本地 `127.0.0.1:3221` | 无效 token | HTTP 401 / `code=401` / `unauthorized` | HTTP 401 / `code=401` / `unauthorized` | 符合合同 |
| 本地 `127.0.0.1:3221` | 当前 manifest host token，后 8 位 `a9f69589` | HTTP 200 / `code=0` / data array length `1` | HTTP 200 / `code=0` / data array length `1` | 本地有效 token 可用 |
| 线上 `https://api.pomer.cn` | 无 token | HTTP 401 / `code=401` / `unauthorized` | HTTP 401 / `code=401` / `unauthorized` | 线上只读验证，不泄露 token |
| 线上 `https://api.pomer.cn` | 无效 token | HTTP 401 / `code=401` / `unauthorized` | HTTP 401 / `code=401` / `unauthorized` | 线上只读验证，不泄露 token |
| 线上 `https://api.pomer.cn` | 有效 token | 未验证 | 未验证 | 当前接口联调没有线上有效用户 token；需前端/测试提供或通过登录链路获取 |

可复跑命令：

```powershell
# 无 token：应返回 401
curl.exe -i "https://api.pomer.cn/api/v1/reports/history?mode=host"
curl.exe -i "https://api.pomer.cn/api/v1/user/session-moment-summaries"

# 无效 token：应返回 401
curl.exe -i -H "X-JZP-User-Token: invalid-int-token-20260615" "https://api.pomer.cn/api/v1/reports/history?mode=host"
curl.exe -i -H "X-JZP-User-Token: invalid-int-token-20260615" "https://api.pomer.cn/api/v1/user/session-moment-summaries"

# 本地有效 token：使用 docs/runtime/int-data-001-manifest.json 内 profiles.host.token；不要在日志里打印完整 token
curl.exe -i -H "X-JZP-User-Token: <local-host-token>" "http://127.0.0.1:3221/api/v1/reports/history?mode=host"
curl.exe -i -H "X-JZP-User-Token: <local-host-token>" "http://127.0.0.1:3221/api/v1/user/session-moment-summaries"
```

缺口：

- 线上有效 token 未验证；需要前端/测试提供真实线上登录态或可复跑登录换 token 步骤。
- 本地 manifest token 仅适用于 `127.0.0.1:3221` 的 fixed data，不应拿去线上当有效 token。

### 3.9 `PR-INT-REMAINING-PAGES-DATA-001` 剩余页面复拍数据说明

记录时间：2026-06-16。目标页面：`me`、`wine-history`、`share-poster/share-preview`、`session-brief`、`rankings`。本文只给接口联调样本、页面 query、API base 和只读接口摘要；不 cleanup、不 recreate、不线上写入、不改 PM 总台账，不写测试通过。

#### 3.9.1 五页可用参数表

| 页面 | 建议 query / 入口 | profile/token | API base | 可只读复拍内容 | 限制 |
| --- | --- | --- | --- | --- | --- |
| `me` | `/pages/me/index` | host/memberA/memberB 均可；建议 memberB `user-1781507686651-000860`，token 取 `profiles.memberB.token`，后 8 位 `d5d48f60` | 本地 `http://127.0.0.1:3221/api/v1`；LAN `http://192.168.0.101:3221/api/v1` | `GET /user/commerce`、用户资料、积分/任务卡片、pointsLedger 摘要 | 个人页真机登录态由前端/测试负责；接口联调不注入微信登录态 |
| `wine-history` | `/pages/wine-history/index` | host `user-1781507686650-a33705`，token 后 8 位 `a9f69589` | 同上 | `GET /reports/history?mode=host`、`GET /user/session-moment-summaries` 有效 token 均 200，返回数组 length `1` | 无 token/失效 token 必须显示登录态失效，不应渲染为空数据 |
| `share-poster/share-preview` | `/pages/share-poster/index?briefId=brief-1781507687042-d1990edd&taskId=share-task-1781507687046-d1098582`；failed/expired 复拍替换 `taskId` | host token | 同上；PNG 静态图用服务根地址 `http://127.0.0.1:3221` 或 LAN 根地址 | ready/failed/expired 三态、ready PNG 预览保存、failed/expired 重试按钮展示 | retry 是写操作，需 PM 授权；PNG 视觉过滤需截图/人工确认 |
| `session-brief` | `/pages/session-brief/index?sessionId=session-1781507687012-e4343d&briefId=brief-1781507687042-d1990edd` | host/memberB；建议 host 先读全量占位口径 | 同上 | opening/highlight/private/event 混合节点；private 在 host 视角为占位 | 当前没有 closing/needs_media 样本；需后端/API 或 PM 授权写入补样本 |
| `rankings` | `/pages/rankings/index?category=best_opening` | host/memberB；momentId `moment-1781507687032-eb1806a4` | 同上 | nomination eligibility、memberB commerce points/ledger、reward payout ID 展示 | 2026-06-16 当天 `GET /rankings/today?category=best_opening` 返回 0 条；重复推举/积分不足/退款均需写操作或补样本 |

#### 3.9.2 `wine-history` 鉴权复跑说明

请求头：`X-JZP-User-Token: <token>`。token 必须从 `docs/runtime/int-data-001-manifest.json` 读取，日志只记录后 8 位。

| 场景 | 命令示例 | 当前结果 |
| --- | --- | --- |
| 未登录 / 无 token | `curl.exe -i "http://127.0.0.1:3221/api/v1/reports/history?mode=host"`；`curl.exe -i "http://127.0.0.1:3221/api/v1/user/session-moment-summaries"` | 两个接口均 HTTP 401，`code=401`，`message=unauthorized` |
| 失效 token | `curl.exe -i -H "X-JZP-User-Token: invalid-int-token-20260616" "http://127.0.0.1:3221/api/v1/reports/history?mode=host"`；同样请求 `/user/session-moment-summaries` | 两个接口均 HTTP 401，`code=401` |
| 有效 token | `curl.exe -i -H "X-JZP-User-Token: <host-token>" "http://127.0.0.1:3221/api/v1/reports/history?mode=host"`；同样请求 `/user/session-moment-summaries` | 两个接口均 HTTP 200，`code=0`，data array length `1` |

前端处理建议：401 应触发重新登录/换取 token 或登录态失效提示，不要把 401 当成空历史列表。

#### 3.9.3 `share-poster/share-preview` 样本

| 状态 | taskId | GET 结果 | 页面用途 | 限制 |
| --- | --- | --- | --- | --- |
| pending | `share-task-1781507687044-805585b3` | HTTP 200，`status=pending` | loading/pending 状态 | 不应展示 retry |
| ready | `share-task-1781507687046-d1098582` | HTTP 200，`status=ready`，`imageUrl=/uploads/moments/share-tasks/share-task-1781507687046-d1098582.png` | 预览/保存 PNG | PNG 静态访问：`GET http://127.0.0.1:3221/uploads/moments/share-tasks/share-task-1781507687046-d1098582.png` 返回 HTTP 200、`image/png`、约 103366 bytes |
| failed | `share-task-1781507687115-e4df874c` | HTTP 200，`status=failed`，`failedReason=share task has no visible nodes` | failed 状态、重试按钮 | retry 是写操作，需 PM 授权 |
| expired | `share-task-it-moments-20260615-expired` | HTTP 200，`status=expired` | expired 状态、重试按钮 | retry 是写操作，需 PM 授权 |

过滤节点验证缺口：ready task 当前 `selectedNodeIds=["event-1781507687041-e380feb7"]`，不包含 private；failed task 当前 `selectedNodeIds=["moment-1781507687039-ee0677bb"]`，该 moment 为 hidden，失败原因为无可见节点。接口层可证明任务状态和选中节点；PNG 是否视觉上不泄露私密/隐藏内容仍需测试/UI/UX 截图和人工复核。

#### 3.9.4 `session-brief` 混合节点样本

当前 `GET /session-briefs/brief-1781507687042-d1990edd` 返回 HTTP 200。host 视角 timeline 节点：

| 节点类型 | 当前 ID | 状态 | 用途 |
| --- | --- | --- | --- |
| opening | `moment-1781507687032-eb1806a4` | approved / 有图 | 首图、封面、第一张记录 |
| highlight | `moment-1781507687034-93c8676b` | pending / 有图 | 待审内容、普通照片样本 |
| private | `moment-1781507687036-c0cc62cc` | host 视角 placeholder / 无图 | 私密占位、不泄露 |
| hidden highlight | `moment-1781507687039-ee0677bb` | hidden / 有图 | 隐藏内容、failed task 背景 |
| event | `event-1781507687041-e380feb7` | `drink_debt` | 非照片事件混排 |
| closing | 缺 | 无样本 | 需 PM 授权写入或后端/API 补样本 |
| needs_media | 缺 | 无样本 | 需 PM 授权写入或后端/API 补样本 |

#### 3.9.5 `rankings` / M5 当前证据与缺口

| 项目 | 当前证据 | 缺口 |
| --- | --- | --- |
| 榜单 category | manifest `m5.rankingCategory=best_opening` | 2026-06-16 只读 `GET /rankings/today?category=best_opening` 返回 HTTP 200 但 items `0`；当前 manifest 的 nomination 属 2026-06-15 fixture，不再出现在今日榜单 |
| ranking item | manifest `rankingItemId=moment-1781507687032-eb1806a4` | 今日榜单空；页面可测空态，不能测榜单列表态 |
| 推举资格 | host/memberB 只读 `GET /moments/moment-1781507687032-eb1806a4/nomination-eligibility?category=best_opening` 均 HTTP 200，`eligible=true`，`pointsCost=10` | 实际推举是写操作；本轮禁止 |
| 积分不足 | memberB `GET /user/commerce` 返回 points `70`，不满足积分不足样本 | 需后端/API 提供低积分账号或 PM 授权构造样本 |
| 重复推举 | 当前只读资格 `alreadyNominatedToday=false` | 需执行一次推举后再复测重复 409，属于写操作，需 PM 授权 |
| 退款 / points ledger | memberB `GET /user/commerce` 返回 pointsLedgerCount `1`，ledgerId `ledger-1781507687124-c80dfdf1`；manifest `rewardPayoutId=ranking-reward-payout-1781507687129-1ea46263` | manifest `m5.pointsLedgerIds=[]` 未回填；退款/发奖/重复发奖需要后台写操作和 operationLogs，需 PM 授权 |

#### 3.9.6 API base 边界与禁止项

| 环境 | base | 可做 | 禁止 |
| --- | --- | --- | --- |
| 本地 | `http://127.0.0.1:3221/api/v1` | 只读复拍、接口摘要、fixed data 页面联调 | 本轮不得 cleanup/recreate，不得执行 retry/nomination/后台动作等写操作 |
| LAN | `http://192.168.0.101:3221/api/v1` | 同网真机候选，只读复拍 | 需前端/测试确认代理/合法域名设置；不代表线上 |
| 线上 | `https://api.pomer.cn/api/v1` | 只读可按 PM 授权执行 | 本轮不得线上写入；不得触碰 `pomer.cn` 公司官网 |

### 3.10 `PR-INT-0616-RANKINGS-NOTFOUND-001` rankings `not found` 只读定位

记录时间：2026-06-16。问题：0616 真机截图中 `rankings` 页面空态显示英文 `not found`。本节只读定位接口/路由/query/样本/前端兜底责任；不 cleanup、不 recreate、不线上写入、不泄露完整 token、不改 PM 总台账。

可复跑页面 query 与 API：

| 场景 | 页面 query | API 请求 | 当前结果 |
| --- | --- | --- | --- |
| 本地正确 category | `/pages/rankings/index?category=best_opening` | `GET http://127.0.0.1:3221/api/v1/rankings/today?category=best_opening&limit=50` | HTTP 200，`code=0`，`category=best_opening`，`date=2026-06-16`，`items.length=0` |
| 本地默认/人气榜 | `/pages/rankings/index?category=today_highlight` | `GET http://127.0.0.1:3221/api/v1/rankings/today?category=today_highlight&limit=50` | HTTP 200，`code=0`，`items.length=0` |
| 本地 category 不匹配 | `/pages/rankings/index?category=bad_category` | `GET http://127.0.0.1:3221/api/v1/rankings/today?category=bad_category&limit=50` | HTTP 200，`code=0`，后端归一化为 `today_highlight`，`items.length=0`；前端页面也会把非法 query 回退为 `today_highlight` |
| 本地错误路由 | 不适用 | `GET http://127.0.0.1:3221/api/v1/ranking/today?category=best_opening&limit=50` 或 `/rankings/today/bad?...` | HTTP 404，`code=404`，`message=not found` |
| 线上当前路由 | `/pages/rankings/index?category=best_opening`，若 base 为线上 | `GET https://api.pomer.cn/api/v1/rankings/today?category=best_opening&limit=50` | HTTP 404，`code=404`，`message=not found` |

责任判断：

| 情况 | 预期 payload | 页面文案责任 |
| --- | --- | --- |
| 空榜 / 无样本 | HTTP 200，`{ code:0, message:"ok", data:{ category, date, items:[] } }` | 前端应显示中文空态，如“当前榜单还没有推举” |
| category 不匹配 | 本地后端归一化到 `today_highlight` 并返回 HTTP 200；前端也有 query 白名单回退 | 不应显示 `not found`；如显示，说明请求未走到正确 API 或错误态兜底未中文化 |
| 错误路由 / 线上未部署该路由 | HTTP 404，`{ code:404, message:"not found", data:null }` | 接口返回英文 message；前端当前 catch 会把 `error.message` 写入 `emptyText`，因此会显示 `not found`。这是接口未命中/线上路由缺失 + 前端错误兜底英文直显共同导致 |
| 有样本榜单 | HTTP 200，`items.length>0` | 当前 2026-06-16 本地 fixed data 不具备今日榜单列表态；需要 PM 授权写入或后端/API 补当天样本 |

当前结论：

- 本地 `127.0.0.1:3221` 的正确 rankings API 可用，空榜是 HTTP 200，不会从接口返回 `not found`。
- 当前线上 `https://api.pomer.cn/api/v1/rankings/today?...` 返回 HTTP 404 / `message=not found`；若真机使用线上 base，则 `not found` 来自接口 404。
- 前端 `miniprogram/pages/rankings/index.ts` 在 catch 中把 `error.message` 写入 `emptyText`；`requestJson` 会把后端 `payload.message` 作为 Error message。因此线上 404 会被直显成英文空态。前端应改为中文错误兜底，且测试需确认真机 base 是否为本地/LAN还是线上。

给测试的脱敏样本：

| 项目 | 值 |
| --- | --- |
| manifest | `docs/runtime/int-data-001-manifest.json` |
| category | `best_opening` |
| rankingItemId | `moment-1781507687032-eb1806a4` |
| nominationId | `nomination-1781507687124-4ad71db9` |
| host token | 仅记录后 8 位 `a9f69589`；完整 token 只从 manifest 本地读取 |
| 本地 API | `http://127.0.0.1:3221/api/v1/rankings/today?category=best_opening&limit=50` |
| LAN API | `http://192.168.0.101:3221/api/v1/rankings/today?category=best_opening&limit=50` |
| 线上 API | `https://api.pomer.cn/api/v1/rankings/today?category=best_opening&limit=50`，当前只读返回 404 |

缺失证据 / 下一步：

- 需要前端/测试确认真机当时使用的 API base；若是线上，退后端/API 或部署责任复核 `/rankings/today` 是否已部署到 `api.pomer.cn`。
- 需要前端把 rankings 错误态兜底改为中文，不要直接把后端英文 message 作为空态标题。
- 需要 PM 授权写入或后端/API 补当天榜单样本，才能复拍 rankings 列表态；当前只能复拍本地空态和错误态。

### 3.11 `PR-INT-RANKINGS-ONLINE-VERIFY-PREP-001` rankings 线上路由闭环验证包

记录时间：2026-06-16。目标：给后端/API、DBA/运维提供 `/api/v1/rankings/today` 线上路由闭环的可复跑验证包。榜单接口为只读接口，本轮无需 token，不泄露完整 token；不重建数据、不 cleanup、不线上写入。

category 白名单与页面 query：

| category | 页面 query | 用途 |
| --- | --- | --- |
| `today_highlight` | `/pages/rankings/index?category=today_highlight` | 默认人气/精彩榜，前端非法 query 会回退到该值 |
| `today_funny` | `/pages/rankings/index?category=today_funny` | 今日有梗 |
| `today_debt` | `/pages/rankings/index?category=today_debt` | 今日欠酒/互动类旧分类 |
| `today_visual` | `/pages/rankings/index?category=today_visual` | 视觉类照片榜 |
| `best_opening` | `/pages/rankings/index?category=best_opening` | 开场照榜；当前 manifest ranking category |
| `best_closing` | `/pages/rankings/index?category=best_closing` | 收尾照榜 |

本地正确请求：

```powershell
curl.exe -i "http://127.0.0.1:3221/api/v1/rankings/today?category=best_opening&limit=50"
curl.exe -i "http://127.0.0.1:3221/api/v1/rankings/today?category=today_highlight&limit=50"
```

当前只读摘要：

| 环境 | 请求 | HTTP / payload 摘要 |
| --- | --- | --- |
| 本地 | `/api/v1/rankings/today?category=best_opening&limit=50` | HTTP 200，`code=0`，`message=ok`，`data.category=best_opening`，`data.date=2026-06-16`，`items.length=0` |
| 本地 | `/api/v1/rankings/today?category=today_highlight&limit=50` | HTTP 200，`code=0`，`message=ok`，`data.category=today_highlight`，`data.date=2026-06-16`，`items.length=0` |

线上当前失败请求：

```powershell
curl.exe -i "https://api.pomer.cn/api/v1/rankings/today?category=best_opening&limit=50"
curl.exe -i "https://api.pomer.cn/api/v1/rankings/today?category=today_highlight&limit=50"
```

当前只读失败摘要：

| 环境 | 请求 | HTTP / payload 摘要 |
| --- | --- | --- |
| 线上 `api.pomer.cn` | `/api/v1/rankings/today?category=best_opening&limit=50` | HTTP 404，`code=404`，`message=not found`，`data=null` |
| 线上 `api.pomer.cn` | `/api/v1/rankings/today?category=today_highlight&limit=50` | HTTP 404，`code=404`，`message=not found`，`data=null` |

修复后期望线上请求：

```powershell
curl.exe -i "https://api.pomer.cn/api/v1/rankings/today?category=best_opening&limit=50"
curl.exe -i "https://api.pomer.cn/api/v1/rankings/today?category=today_highlight&limit=50"
curl.exe -i "https://api.pomer.cn/api/v1/rankings/today?category=bad_category&limit=50"
```

修复后最小结构要求：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "category": "best_opening",
    "date": "2026-06-16",
    "items": []
  }
}
```

说明：

- 空榜不是错误，必须返回 HTTP 200 + `items: []`。
- `bad_category` 应按后端合同归一化为 `today_highlight`，仍返回 HTTP 200 + `items: []` 或真实列表。
- 榜单接口无需用户 token；若线上返回 401 反而是鉴权策略异常。
- 若线上仍返回 404，优先检查部署版本、`backend/server.js` 是否包含 `GET /api/v1/rankings/today` 路由、Nginx/PM2 是否指向最新 `jiuzhuopanguan-backend`。

仍缺证据：

- 运维/后端修复后，需要回填线上 `best_opening`、`today_highlight`、`bad_category` 三条 curl 的响应摘要。
- 当前本地 fixed data 在 2026-06-16 今日榜单为空；如需线上/本地列表态，需要 PM 授权写入当天 nomination 样本，或后端/API 提供只读 fixtures。

### 3.12 `PR-INT-FLOW-FIXTURE-001` 发布后流程固定复拍样本包

记录时间：2026-06-16。范围：基于当前 `docs/runtime/int-data-001-manifest.json` 与本地/LAN 只读接口结果，为前端与测试复拍提供稳定引用。未执行 cleanup、未 recreate、未线上写入、未修改 PM 总台账；本节不泄露完整 token，仅记录 profile、角色、token 后 8 位和 manifest 字段路径。

#### 3.12.1 API base 与使用边界

| 场景 | API base | 用途 | 边界 |
| --- | --- | --- | --- |
| 本机复拍 | `http://127.0.0.1:3221/api/v1` | 固定 `INT-DATA-001` 数据、接口只读复核、开发者工具本机调试 | 仅本地；不得 cleanup/recreate，除非 PM 另行授权。 |
| 同 LAN 真机候选 | `http://192.168.0.101:3221/api/v1` | 手机与电脑同网、代理或开发者工具允许本地调试时访问同一批 fixture | 不代表线上；需确认手机同网、防火墙、微信开发者工具/体验版域名策略。 |
| 线上只读 | `https://api.pomer.cn/api/v1` | 发布后公网 smoke，例如 `config/home`、无 token 榜单接口 | 本任务不得线上写入；固定 fixture ID 只保证本地/LAN 可用。 |

静态分享图不走 `/api/v1` 前缀：`ready` 图片使用 `http://127.0.0.1:3221/uploads/moments/share-tasks/share-task-1781507687046-d1098582.png`，本地只读返回 HTTP 200、`image/png`。

#### 3.12.2 固定角色与 token 脱敏说明

| 角色 | profileId | manifest 字段 | token 后 8 位 | 复拍用途 |
| --- | --- | --- | --- | --- |
| host | `user-1781507686650-a33705` | `profiles.host.token` | `a9f69589` | 创建者视角、session brief、share task、榜单入口、主持人历史。 |
| memberA | `user-1781507686651-a46952` | `profiles.memberA.token` | `9b36b0b6` | 普通成员视角、timeline/session 只读交叉验证。 |
| memberB | `user-1781507686651-000860` | `profiles.memberB.token` | `d5d48f60` | 私密 moment 可见方、nomination eligibility、points ledger 只读验证。 |
| outsider | `user-1781507686651-093df4` | `profiles.outsider.token` | `93281c81` | 非成员 403/占位态复核。 |

前端/测试执行命令时从本地 manifest 读取完整 token，不得写入文档、截图或 IM；汇报仅保留后 8 位或 `<host-token>`、`<memberB-token>` 占位。

#### 3.12.3 session / moment / brief 固定样本

| 类型 | ID / 值 | 状态与用途 | 限制 |
| --- | --- | --- | --- |
| sessionId | `session-1781507687012-e4343d` | 固定三用户聚会；页面 query 主键。 | 本地/LAN fixture，不代表线上。 |
| inviteCode | `C56EVT` | `invite-group` 与加入页展示/分享口令样本。 | 如需真实新 session 邀请链路，需 PM 授权写操作。 |
| opening moment | `moment-1781507687032-eb1806a4` | `approved`，`rankingEligible=true`，可作首张记录、榜单候选、expired task selected node。 | 今日榜单列表当前为空，不等于榜单链路通过。 |
| highlight moment | `moment-1781507687034-93c8676b` | `pending`，可作待审/UGC 样本候选。 | `moments.reviewMomentId` 仍为空；后台待审专用样本需后台/UGC 确认是否接受替代。 |
| private moment | `moment-1781507687036-c0cc62cc` | `memberB` 可见，其他角色占位；session brief 返回 `placeholder=true`。 | 用于私密可见性，不用于公开分享节点。 |
| failed candidate | `moment-1781507687039-ee0677bb` | `hidden`，failed share task selected node。 | 用于失败分享任务，不写成可公开内容。 |
| event | `event-1781507687041-e380feb7` | `drink_debt` / `synced`，pending/ready share task selected node。 | 历史玩法事件样本，聚会记录师主路径只作兼容验证。 |
| brief | `brief-1781507687042-d1990edd` | 本地 `GET /session-briefs/{briefId}` 返回 HTTP 200，包含 opening/highlight/private/hidden/event 混合节点。 | manifest 无 closing / needs_media 样本；`/sessions/{sessionId}/brief` 是生成 brief 的 POST 合同，不作为读取路径。 |
| report | `moment-report-it-moments-20260615` | 举报样本 ID。 | 仅供后台/UGC 只读定位；是否进入后台待审列表需后台/UGC 另证。 |

#### 3.12.4 share task 固定样本

| 状态 | taskId | 只读 GET 结果 | selectedNodeIds / 摘要 | 复拍用途 |
| --- | --- | --- | --- | --- |
| pending | `share-task-1781507687044-805585b3` | HTTP 200，`code=0`，`status=pending` | `event-1781507687041-e380feb7`，无 `imageUrl` | 分享生成中/等待态。 |
| ready | `share-task-1781507687046-d1098582` | HTTP 200，`code=0`，`status=ready` | `event-1781507687041-e380feb7`，`imageUrl=/uploads/moments/share-tasks/share-task-1781507687046-d1098582.png` | 分享海报成功态；PNG 静态路径本地 HTTP 200。 |
| failed | `share-task-1781507687115-e4df874c` | HTTP 200，`code=0`，`status=failed` | `moment-1781507687039-ee0677bb`，`failedReason=share task has no visible nodes` | 分享失败态与错误提示。 |
| expired | `share-task-it-moments-20260615-expired` | HTTP 200，`code=0`，`status=expired` | `moment-1781507687032-eb1806a4`，`failedReason=IT-MOMENTS-20260615 local expired fixture` | 过期任务态；此前 404 冲突已按当前 3221 进程只读复核恢复，但不替测试写通过。 |

#### 3.12.5 rankings / nomination / points ledger 固定样本

| 项 | 当前样本 / 结果 | 用途 | 限制 |
| --- | --- | --- | --- |
| ranking category | `best_opening` | 榜单页面 query 与接口 category。 | 前端不要使用旧 `today` 路由；页面建议 `category=best_opening` 或按合同使用 `today_highlight`。 |
| ranking item | `moment-1781507687032-eb1806a4` | 榜单候选 moment。 | 本地 `GET /rankings/today?category=best_opening` 返回 HTTP 200、`code=0`、`itemCount=0`，当前只能验证接口结构/空榜，不是有榜数据。 |
| nomination | `nomination-1781507687124-4ad71db9` | 推举样本 ID。 | 已存在历史 nomination，但今日榜单列表为空；重复推举/积分不足需要写操作，待 PM 授权。 |
| reward payout | `ranking-reward-payout-1781507687129-1ea46263` | 奖励发放样本 ID。 | 退款/补偿链路暂无只读闭环证据。 |
| memberB eligibility | `GET /moments/moment-1781507687032-eb1806a4/nomination-eligibility?category=best_opening` | 本地 HTTP 200，`eligible=true`，`pointsCost=10`，`alreadyNominatedToday=false`。 | 只验证当前 memberB 可推举合同；不执行新增 nomination。 |
| memberB points ledger | `ledger-1781507687124-c80dfdf1` | `GET /user/commerce` 本地 HTTP 200，`points=70`，ledger `kind=moment-nomination`、`delta=-10`、`sourceId=nomination-1781507687124-4ad71db9`。 | manifest 的 `m5.pointsLedgerIds` 仍为空；接口联调只记录只读响应，不自行回填 manifest。 |

#### 3.12.6 页面 query 与复跑接口摘要

| 页面 / 流程 | 建议 query | 复跑接口 | 数据状态 |
| --- | --- | --- | --- |
| `invite-group` | `sessionId=session-1781507687012-e4343d&inviteCode=C56EVT` | `GET /session-briefs/{briefId}` 或前端已有 session 读取接口 | 可只读复拍邀请展示；真实新 session 需 PM 授权写入。 |
| `moment-editor` 首张记录 | `sessionId=session-1781507687012-e4343d&nodeType=opening` | 如只读可用 existing opening；提交新 moment 属写操作 | 可用 opening 样本复拍页面；不得自行新增第一张。 |
| `session-brief` | `briefId=brief-1781507687042-d1990edd&sessionId=session-1781507687012-e4343d` | `GET /session-briefs/{briefId}` with `<host-token>` | 本地 200，混合节点可用；缺 closing/needs_media。 |
| `share-poster/share-preview` | `taskId=share-task-1781507687046-d1098582` 或 failed/expired taskId | `GET /share-image-tasks/{taskId}` with `<host-token>`；PNG 用 origin root | ready/failed/expired 可复拍；过滤节点写入场景需 PM 授权。 |
| `rankings` | `sessionId=session-1781507687012-e4343d&category=best_opening` | `GET /rankings/today?category=best_opening` | 本地 200 空榜；线上发布后 smoke 由专项跟进，当前不写测试通过。 |
| `wine-history` / `me` | 使用 host/memberB token | `GET /reports/history?mode=host`、`GET /user/session-moment-summaries`、`GET /user/commerce` | 鉴权合同按 3.8；本节仅提供脱敏 token 引用。 |

可复跑只读命令模板（将 token 从本地 manifest 注入命令，不要把完整 token 写入文档或截图）：

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:3221/api/v1/session-briefs/brief-1781507687042-d1990edd" -Headers @{ Authorization = "Bearer <host-token>" }
Invoke-RestMethod -Uri "http://127.0.0.1:3221/api/v1/share-image-tasks/share-task-1781507687046-d1098582" -Headers @{ Authorization = "Bearer <host-token>" }
Invoke-RestMethod -Uri "http://127.0.0.1:3221/api/v1/share-image-tasks/share-task-1781507687115-e4df874c" -Headers @{ Authorization = "Bearer <host-token>" }
Invoke-RestMethod -Uri "http://127.0.0.1:3221/api/v1/share-image-tasks/share-task-it-moments-20260615-expired" -Headers @{ Authorization = "Bearer <host-token>" }
Invoke-WebRequest -Uri "http://127.0.0.1:3221/uploads/moments/share-tasks/share-task-1781507687046-d1098582.png" -UseBasicParsing
Invoke-RestMethod -Uri "http://127.0.0.1:3221/api/v1/rankings/today?category=best_opening"
Invoke-RestMethod -Uri "http://127.0.0.1:3221/api/v1/moments/moment-1781507687032-eb1806a4/nomination-eligibility?category=best_opening" -Headers @{ Authorization = "Bearer <memberB-token>" }
Invoke-RestMethod -Uri "http://127.0.0.1:3221/api/v1/user/commerce" -Headers @{ Authorization = "Bearer <memberB-token>" }
```

#### 3.12.7 缺失证据与待协作项

- `m5.pointsLedgerIds` 在 manifest 内仍为空；本节仅根据 `GET /user/commerce` 只读响应记录 `ledger-1781507687124-c80dfdf1`，不得由接口联调自行回填 manifest。需要后端/API 判断是否补 manifest 字段或保持接口只读证据。
- 今日榜单 `best_opening` 本地返回 200 但 `itemCount=0`；如前端/测试需要非空榜单、重复推举、积分不足、退款/points ledger 闭环，需要 PM 授权本地写操作或后端/API 提供固定样本。
- `closing`、`needs_media`、后台 operation log、专用 `reviewMomentId` 仍缺实际 ID；后台/UGC/UI/UX 如需要专门页面样本，应由对应角色确认 `highlightId` 是否可替代，或请后端/API 补样本。
- 前端/测试复拍应使用本节 query 与脱敏 token 规则；接口联调只提供数据合同和只读响应摘要，不替测试写通过。

### 3.13 `PR-INT-BRIEF-PATH-CONTRACT-001` brief 路径合同修正

记录时间：2026-06-16。测试复测准备发现 brief 路径合同差异：`GET /session-briefs/brief-1781507687042-d1990edd` 返回 200，但 `GET /sessions/session-1781507687012-e4343d/brief` 返回 404。本节只修正接口联调计划，不 cleanup、不 recreate、不线上写入、不泄露完整 token、不改 PM 总台账。

当前合同结论：

| 场景 | 方法与路径 | 当前结果 | 结论 |
| --- | --- | --- | --- |
| 读取已生成 brief | `GET /session-briefs/:briefId` | 本地 200，`code=0`，返回 `sessionId`、`title`、`openingMomentIds`、`timelineNodeIds`、`shareImageTaskId`、`shareImageStatus`、`pendingMediaCount` 等字段 | 前端/测试复拍应以此为准。 |
| 生成 brief | `POST /sessions/:sessionId/brief` | API 文档定义为生成动作 | 属写操作；本轮不得执行。 |
| 按 session 读取 brief | `GET /sessions/:sessionId/brief` | 本地 404，`code=404`，`message=not found` | 当前不是有效读取合同；3.12 已修正，不再作为复拍模板。 |

本地只读复核摘要（host token 仅从 manifest 本地读取，未写入文档）：

| 请求 | HTTP / payload 摘要 |
| --- | --- |
| `GET http://127.0.0.1:3221/api/v1/session-briefs/brief-1781507687042-d1990edd` | HTTP 200，`code=0`，`message=ok`，`data.sessionId=session-1781507687012-e4343d`，返回 brief 聚合字段。 |
| `GET http://127.0.0.1:3221/api/v1/sessions/session-1781507687012-e4343d/brief` | HTTP 404，`code=404`，`message=not found`，`data=null`。 |

前端/测试复拍建议：

| 页面 | 推荐 query | 推荐读取接口 | 说明 |
| --- | --- | --- | --- |
| `session-brief` | `briefId=brief-1781507687042-d1990edd&sessionId=session-1781507687012-e4343d` | `GET /session-briefs/brief-1781507687042-d1990edd` | `briefId` 为读取主键，`sessionId` 可保留作返回/导航上下文。 |
| `share-poster/share-preview` | `briefId=brief-1781507687042-d1990edd&taskId=share-task-1781507687046-d1098582` | `GET /session-briefs/{briefId}` + `GET /share-image-tasks/{taskId}` | brief 与 share task 分开读取；PNG 静态图仍走服务根地址。 |
| `invite-group` / 记录入口 | `sessionId=session-1781507687012-e4343d&inviteCode=C56EVT` | 如需要 brief 聚合展示，再用 manifest 内 `briefId` 调 `GET /session-briefs/{briefId}` | 不要从 `GET /sessions/{sessionId}/brief` 读取。 |

可复跑只读命令模板：

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:3221/api/v1/session-briefs/brief-1781507687042-d1990edd" -Headers @{ Authorization = "Bearer <host-token>" }
Invoke-RestMethod -Uri "http://127.0.0.1:3221/api/v1/sessions/session-1781507687012-e4343d/brief" -Headers @{ Authorization = "Bearer <host-token>" }
```

待协作项：

- 前端需检查 `session-brief`、`share-poster/share-preview`、邀请页中是否仍按 `GET /sessions/{sessionId}/brief` 读取；如有，改为 `GET /session-briefs/{briefId}` 或先取得 briefId 后再读取。
- 测试复拍 brief 页面时以 `briefId=brief-1781507687042-d1990edd` 为主参数；`/sessions/{sessionId}/brief` 的 404 不应作为页面失败结论，除非前端仍调用该错误路径。
- 后端/API 如希望支持按 session 读取 latest brief，需要另开合同变更；当前接口联调不要求后端改路由。

### 3.14 `PR-INT-FINAL-CAPTURE-SUPPORT-002` 最后大版本采集窗口只读样本支持

记录时间：2026-06-16。范围：为最后大版本截图/录屏采集窗口提供接口联调只读样本、API base、脱敏 token、公网 rankings smoke 和复跑命令。本轮未 cleanup、未 recreate、未线上写入、未泄露完整 token、未修改 PM 总台账或测试/UI/UX/UGC 结论。

#### 3.14.1 API base 与当前可用性

| 环境 | API base | 当前状态 | 用途与限制 |
| --- | --- | --- | --- |
| 本机 fixed data | `http://127.0.0.1:3221/api/v1` | 本轮 `Get-NetTCPConnection -LocalPort 3221` 未发现监听；本地接口只读请求 `fetch failed` | 样本 ID 仍以当前 manifest 为准；采集前需后端/API 或测试启动本地 3221 后复跑。接口联调本轮不启动/重启服务。 |
| 同 LAN 真机候选 | `http://192.168.0.101:3221/api/v1` | 依赖本机 3221 服务和同网访问；本轮未复测 | 仅用于手机与电脑同网/代理/开发者工具允许本地调试时；不代表线上。 |
| 线上公网只读 | `https://api.pomer.cn/api/v1` | 本轮只读 smoke：`config/home` 与 rankings 三类请求均 HTTP 200 | 只用于公网 smoke；不得用本地 fixture token 写入线上，不触碰 `pomer.cn` 公司官网。 |

#### 3.14.2 固定样本与 token 脱敏

| 项 | 当前值 | 用途 |
| --- | --- | --- |
| sessionId | `session-1781507687012-e4343d` | 聚会记录主路径、邀请、记录页、返回上下文。 |
| inviteCode | `C56EVT` | 邀请/加入页展示样本。 |
| briefId | `brief-1781507687042-d1990edd` | `session-brief` / 分享预览聚合读取主键。 |
| host | `user-1781507686650-a33705`，token 后 8 位 `a9f69589` | host 视角 brief、share task、历史页。 |
| memberA | `user-1781507686651-a46952`，token 后 8 位 `9b36b0b6` | 普通成员视角复拍。 |
| memberB | `user-1781507686651-000860`，token 后 8 位 `d5d48f60` | 私密 moment 可见方、推举资格、积分流水。 |
| outsider | `user-1781507686651-093df4`，token 后 8 位 `93281c81` | 非成员反例/403 或占位态。 |

完整 token 只能从 `docs/runtime/int-data-001-manifest.json` 本地读取，不得写入文档、截图、录屏字幕或群消息。

#### 3.14.3 brief / moment / share task / rankings / points 样本 ID

| 类型 | ID / 字段 | 采集用途 | 当前限制 |
| --- | --- | --- | --- |
| opening | `moment-1781507687032-eb1806a4` | 首张记录、榜单候选、expired task 节点。 | 非空榜单仍缺。 |
| highlight | `moment-1781507687034-93c8676b` | 待审/UGC 候选样本。 | `reviewMomentId` 为空；后台专用待审样本待确认。 |
| private | `moment-1781507687036-c0cc62cc` | memberB 可见、其他角色占位。 | 不用于公开分享。 |
| failed candidate | `moment-1781507687039-ee0677bb` | failed share task 节点。 | hidden 状态，仅用于失败态。 |
| event | `event-1781507687041-e380feb7` | pending/ready share task selected node。 | 历史互动事件，聚会记录师主路径仅作兼容。 |
| report | `moment-report-it-moments-20260615` | 举报样本。 | 是否进入后台列表需后台/UGC 另证。 |
| pending task | `share-task-1781507687044-805585b3` | 分享生成中/等待态。 | 本轮因 3221 未监听未复跑；沿用 manifest 与既有只读证据。 |
| ready task | `share-task-1781507687046-d1098582` | 分享海报成功态；PNG `/uploads/moments/share-tasks/share-task-1781507687046-d1098582.png`。 | PNG 静态访问需服务根地址，不走 `/api/v1`。 |
| failed task | `share-task-1781507687115-e4df874c` | 分享失败态，原因 `share task has no visible nodes`。 | retry 属写操作，需 PM 授权。 |
| expired task | `share-task-it-moments-20260615-expired` | 分享过期态。 | 本轮因 3221 未监听未复跑；采集前需本地服务启动后确认仍 200/status=expired。 |
| ranking category | `best_opening` | rankings 页面 query。 | 本地/线上当前只能验证空榜结构。 |
| nomination | `nomination-1781507687124-4ad71db9` | 推举样本 ID。 | 重复推举需要写操作。 |
| reward payout | `ranking-reward-payout-1781507687129-1ea46263` | 奖励发放样本 ID。 | 退款/补偿缺只读闭环证据。 |
| points ledger | `ledger-1781507687124-c80dfdf1` | memberB `GET /user/commerce` 只读响应曾返回该流水。 | manifest `m5.pointsLedgerIds=[]`，接口联调不自行回填。 |

#### 3.14.4 rankings 公网 smoke

本轮只读访问 `api.pomer.cn`，未带 token、未写入：

| 请求 | HTTP / payload 摘要 |
| --- | --- |
| `GET https://api.pomer.cn/api/v1/config/home` | HTTP 200，`code=0`，`message=ok`，`data` 为 object。 |
| `GET https://api.pomer.cn/api/v1/rankings/today?category=best_opening&limit=50` | HTTP 200，`code=0`，`category=best_opening`，`date=2026-06-16`，`items.length=0`。 |
| `GET https://api.pomer.cn/api/v1/rankings/today?category=today_highlight&limit=50` | HTTP 200，`code=0`，`category=today_highlight`，`date=2026-06-16`，`items.length=0`。 |
| `GET https://api.pomer.cn/api/v1/rankings/today?category=bad_category&limit=50` | HTTP 200，`code=0`，归一化 `category=today_highlight`，`date=2026-06-16`，`items.length=0`。 |

结论：公网 rankings 路由已从此前 404 恢复为 200；当前仍是空榜结构，不代表非空榜单样本已具备。

#### 3.14.5 采集窗口页面 query 与可复跑命令

| 页面 / 场景 | 建议 query | 接口摘要 |
| --- | --- | --- |
| `invite-group` | `sessionId=session-1781507687012-e4343d&inviteCode=C56EVT` | 如需 brief 聚合，使用 `briefId` 调 `GET /session-briefs/{briefId}`。 |
| `session-brief` | `briefId=brief-1781507687042-d1990edd&sessionId=session-1781507687012-e4343d` | `GET /session-briefs/brief-1781507687042-d1990edd`。 |
| `share-poster/share-preview` ready | `briefId=brief-1781507687042-d1990edd&taskId=share-task-1781507687046-d1098582` | `GET /share-image-tasks/{taskId}`；PNG 用服务根地址。 |
| `share-poster/share-preview` failed | `taskId=share-task-1781507687115-e4df874c` | failed 状态与失败原因展示。 |
| `share-poster/share-preview` expired | `taskId=share-task-it-moments-20260615-expired` | 采集前需本地 3221 复跑确认 200/status=expired。 |
| `rankings` | `category=best_opening` 或 `category=today_highlight` | 公网与本地均应使用 `/rankings/today?category=...`，不要用旧 `/rankings/today` 页面兜底文案当接口结论。 |
| `me` / `wine-history` | 使用 host/memberB 本地 token | 鉴权接口仍按 3.8 合同；完整 token 不进文档。 |

只读命令模板：

```powershell
# 公网 smoke，无 token
curl.exe -i "https://api.pomer.cn/api/v1/config/home"
curl.exe -i "https://api.pomer.cn/api/v1/rankings/today?category=best_opening&limit=50"
curl.exe -i "https://api.pomer.cn/api/v1/rankings/today?category=today_highlight&limit=50"
curl.exe -i "https://api.pomer.cn/api/v1/rankings/today?category=bad_category&limit=50"

# 本地 fixed data，只读；完整 token 从 manifest 本地读取，不要打印
Invoke-RestMethod -Uri "http://127.0.0.1:3221/api/v1/session-briefs/brief-1781507687042-d1990edd" -Headers @{ Authorization = "Bearer <host-token>" }
Invoke-RestMethod -Uri "http://127.0.0.1:3221/api/v1/share-image-tasks/share-task-1781507687044-805585b3" -Headers @{ Authorization = "Bearer <host-token>" }
Invoke-RestMethod -Uri "http://127.0.0.1:3221/api/v1/share-image-tasks/share-task-1781507687046-d1098582" -Headers @{ Authorization = "Bearer <host-token>" }
Invoke-RestMethod -Uri "http://127.0.0.1:3221/api/v1/share-image-tasks/share-task-1781507687115-e4df874c" -Headers @{ Authorization = "Bearer <host-token>" }
Invoke-RestMethod -Uri "http://127.0.0.1:3221/api/v1/share-image-tasks/share-task-it-moments-20260615-expired" -Headers @{ Authorization = "Bearer <host-token>" }
Invoke-WebRequest -Uri "http://127.0.0.1:3221/uploads/moments/share-tasks/share-task-1781507687046-d1098582.png" -UseBasicParsing
Invoke-RestMethod -Uri "http://127.0.0.1:3221/api/v1/moments/moment-1781507687032-eb1806a4/nomination-eligibility?category=best_opening" -Headers @{ Authorization = "Bearer <memberB-token>" }
Invoke-RestMethod -Uri "http://127.0.0.1:3221/api/v1/user/commerce" -Headers @{ Authorization = "Bearer <memberB-token>" }
```

#### 3.14.6 仍需 PM 授权或其他角色补证的样本缺口

- 非空榜单：当前公网与本地 `best_opening` / `today_highlight` 均是 200 空榜；如截图需要榜单列表，需 PM 授权本地/线上写入 nomination 或后端/API 提供固定非空样本。
- 重复推举：需要再次提交 nomination，属于写操作；需 PM 授权并明确是否保留/清理。
- 积分不足：需要低积分账号或扣减积分样本，属于数据准备/写操作；需后端/API 或测试提供。
- 退款/补偿：当前仅有 `rewardPayoutId` 和一条 nomination points ledger 只读证据；退款/补偿流水、operation log 缺实际样本。
- `reviewMomentId`：manifest 为空；`highlightId` 可作待审候选，但后台/UGC 若需要专用待审 ID，需后端/API 补样本或 UGC 确认替代口径。
- 本地 3221 服务：本轮未监听，采集前需要后端/API 或测试启动本地服务并复跑 brief/share task/points 只读命令；接口联调本轮不启动、不重启、不 cleanup。

### 3.15 `PR-INT-ONLINE-FINAL-FIXTURE-003` 线上最终采集样本创建尝试

记录时间：2026-06-16。依据 `PR-PM-ONLINE-TEST-SERVER-AUTH-001`，线上 `api.pomer.cn` 已授权作为酒桌判官/聚会记录师测试服务器；本轮只面向 `api.pomer.cn`，未触碰 `pomer.cn` 官网项目、官网 PM2、官网 Nginx block、官网目录或无关项目。目标是创建/补齐线上最终采集样本；实际结果为：缺可写用户 token / 微信 `loginCode`，`POST /sessions` 鉴权失败，未生成线上 final manifest，不能交付线上最终采集样本 ID。

#### 3.15.1 已执行命令与响应摘要

| 步骤 | 命令 / 请求 | 响应摘要 | 结论 |
| --- | --- | --- | --- |
| 检查远程 fixture 前置 | 读取 `backend/scripts/prepare-moments-integration-fixture.js`、`backend/package.json`、接口联调计划、API 文档 | 远程 create 需要 `INT_DATA_ALLOW_REMOTE_WRITE=1`，并需要 `INT_DATA_HOST_TOKEN`、`INT_DATA_MEMBER_A_TOKEN`、`INT_DATA_MEMBER_B_TOKEN`、`INT_DATA_OUTSIDER_TOKEN`；cleanup 脚本只支持 local，remote cleanup 不支持自动执行。 | 现有脚本可尝试远程创建，但不能自动远程清理。 |
| 检查本机环境变量 | 只检查变量是否存在，不输出值 | `INT_DATA_HOST_TOKEN`、`INT_DATA_MEMBER_A_TOKEN`、`INT_DATA_MEMBER_B_TOKEN`、`INT_DATA_OUTSIDER_TOKEN`、`INT_DATA_ADMIN_COOKIE`、`INT_DATA_ADMIN_USERNAME`、`INT_DATA_ADMIN_PASSWORD`、`INT_DATA_ALLOW_REMOTE_WRITE` 均不存在。 | 本机未持有独立线上测试 token / 后台 cookie。 |
| 只读核查 `/user/profile` | 对无 token、无效 token、本地 manifest token 调 `GET /user/profile` | 三者均 HTTP 200、`code=0`，仅返回默认 profile 摘要字段 `nickname/avatarUrl/points`。 | `/user/profile` 不能证明 token 有效。 |
| 写权限核查 | 用本地 manifest host token 调 `POST /sessions` | `Authorization: Bearer <host-token>` 返回 HTTP 401、`code=401`、`message=unauthorized`；一次 `X-JZP-User-Token` 请求为网络层 `fetch failed`，未返回 sessionId。 | 当前本地 manifest token 不能作为线上写 token。 |
| 远程 fixture create | 见下方命令模板；实际命令从本地 manifest 注入 token 环境变量，不在命令行打印完整 token。 | 脚本在第一步 `POST /sessions` 失败：`statusCode:401`，`payload:{ code:401, message:"unauthorized", data:null }`；`docs/runtime/pr-int-online-final-fixture-003-manifest.json` 不存在。 | 未创建 session/moment/brief/share task/ranking/report 样本。 |
| 线上登录配置只读 | `GET https://api.pomer.cn/api/v1/user/auth/config` | HTTP 200、`code=0`、`wechatLoginEnabled=true`。 | 线上有效用户 token 应通过微信登录 code 或测试 token 获取。 |
| 公共配置只读 | `GET https://api.pomer.cn/api/v1/config/home` | HTTP 200、`code=0`。 | 线上服务可访问，问题是用户态写鉴权，不是公网服务不可达。 |

远程 fixture 尝试命令（命令执行时 token 来自本地 manifest 环境变量；不得在截图/日志中展开完整 token）：

```powershell
$m = Get-Content -Raw -Path docs/runtime/int-data-001-manifest.json | ConvertFrom-Json
$env:INT_DATA_ALLOW_REMOTE_WRITE='1'
$env:INT_DATA_HOST_TOKEN=$m.profiles.host.token
$env:INT_DATA_MEMBER_A_TOKEN=$m.profiles.memberA.token
$env:INT_DATA_MEMBER_B_TOKEN=$m.profiles.memberB.token
$env:INT_DATA_OUTSIDER_TOKEN=$m.profiles.outsider.token
npm.cmd --prefix backend run fixture:moments-integration -- --mode create --base-url https://api.pomer.cn/api/v1 --prefix IT-MOMENTS-20260616-FINAL --manifest docs/runtime/pr-int-online-final-fixture-003-manifest.json --keep --no-start-server
Remove-Item Env:\INT_DATA_ALLOW_REMOTE_WRITE, Env:\INT_DATA_HOST_TOKEN, Env:\INT_DATA_MEMBER_A_TOKEN, Env:\INT_DATA_MEMBER_B_TOKEN, Env:\INT_DATA_OUTSIDER_TOKEN -ErrorAction SilentlyContinue
```

错误原文摘要：

```text
Error: POST /sessions failed: unauthorized
statusCode: 401
payload: { code: 401, message: 'unauthorized', data: null }
```

#### 3.15.2 当前线上最终样本状态

| 样本项 | 目标 | 当前状态 | 责任/下一步 |
| --- | --- | --- | --- |
| host/memberA/memberB/outsider | 4 个线上有效用户 token 与 profileId | 缺。当前本地 manifest token 对线上写接口 401；`GET /user/profile` 的 200 不是有效 token 证据。 | PM 派测试/前端提供 4 个真实线上登录态 token，或派后端/API 提供只用于测试服务器的 token 生成/绑定方式。 |
| session | 线上最终采集 session | 未创建；无 sessionId。 | 等有效 host token 后复跑 create。 |
| 首张照片 / 相册 / moments | opening/highlight/private/failed candidate | 未创建。 | 等 session 创建后由 fixture 生成。 |
| brief | final brief | 未创建。 | 等 session/moment 创建后由 `POST /sessions/:sessionId/brief` 生成。 |
| share task 四态 | pending/ready/failed/expired | 未创建。 | 现有脚本远程仅能安全创建 pending/ready/failed 候选；expired 远程无安全公开 helper，需后端/API 补线上测试 helper 或后台/DBA 方案。 |
| 举报/审核候选 | reportId / reviewMomentId | 未创建。 | 现有脚本远程无安全公开举报 helper；审核/隐藏需要后台 cookie。PM 需派后台/运维提供后台测试账号/cookie，或后端/API 提供测试 helper。 |
| rankings / nomination / points ledger | nomination、ranking item、points ledger、reward payout | 未创建。 | 需要有效 memberB token；reward payout 还需要后台 cookie 执行发奖。 |
| online manifest | `docs/runtime/pr-int-online-final-fixture-003-manifest.json` | 不存在。 | 鉴权补齐后复跑 create 才能生成。 |

#### 3.15.3 残留与清理方式

| 项 | 当前判断 |
| --- | --- |
| manifest 残留 | `docs/runtime/pr-int-online-final-fixture-003-manifest.json` 不存在。 |
| 已知线上样本 ID | 无。fixture 在 `POST /sessions` 首个写入点返回 401，未返回 sessionId。 |
| 可能残留 | 一次手工 `POST /sessions` 的 `X-JZP-User-Token` 探测出现网络层 `fetch failed`，未返回 sessionId；按当前证据无法确认服务端是否收到该请求。建议后端/运维按前缀 `IT-MOMENTS-20260616-AUTH-PROBE`、`IT-MOMENTS-20260616-FINAL` 查线上测试数据和日志。 |
| cleanup 方式 | 现有 `prepare-moments-integration-fixture.js --mode cleanup` 明确拒绝 remote cleanup；线上 cleanup 需后端/API 或 DBA/运维提供按 prefix/sessionId/profileId/momentId/shareTaskId/reportId/nominationId/payoutId 精确删除的脚本或后台清理动作。未生成 manifest 前不能由接口联调执行清理。 |

#### 3.15.4 下一步复跑条件

- PM 派前端/测试提供 4 个线上有效用户 token，要求 token 可通过 `POST /sessions` 创建测试 session；交接时只允许记录 token 后 8 位。
- PM 派后台/运维提供后台测试账号或短期 `INT_DATA_ADMIN_COOKIE`，用于 approve/hide/reward/report/retry 等后台写样本；没有后台 cookie 时，远程脚本只能生成部分前台样本，无法补齐举报、审核、发奖、退款。
- PM 派后端/API 补远程安全 helper 或一次性 cleanup 脚本：至少覆盖 expired share task、report 样本、reviewMomentId、pointsLedgerIds 回填和按 `IT-MOMENTS-20260616-FINAL` 前缀清理。
- 接口联调拿到以上前置后复跑：

```powershell
npm.cmd --prefix backend run fixture:moments-integration -- --mode create --base-url https://api.pomer.cn/api/v1 --prefix IT-MOMENTS-20260616-FINAL --manifest docs/runtime/pr-int-online-final-fixture-003-manifest.json --keep --no-start-server
```

### 3.16 `PR-INT-ONLINE-FINAL-FIXTURE-RETRY-004` 线上最终采集样本重试准备

记录时间：2026-06-16。目标：在 `PR-INT-ONLINE-FINAL-FIXTURE-003` 因旧/本地 token 对 `api.pomer.cn` 的 `POST /sessions` 返回 401 后，先固化下一轮重试前置条件、命令模板、manifest 字段、cleanup/残留扫描方式。本节只更新接口联调计划，不改 PM 总台账，不执行线上写入，不泄露完整 token，不用旧本地 token 冒充线上有效 token。

#### 3.16.1 重试阻塞条件

| 前置条件 | 必须提供的证据 | 当前状态 | 不满足时处理 |
| --- | --- | --- | --- |
| 4 个有效线上登录态/token 或 loginCode | host/memberA/memberB/outsider 的线上有效 token，或可换取 token 的微信 `loginCode`；交接记录只写 token 后 8 位。 | 缺。上一轮旧/本地 token 对 `POST /sessions` 返回 401。 | 不执行 create；继续阻塞在接口联调。 |
| token 有效性验证 | 必须通过 `POST /sessions` 或等价写接口创建测试 session；`GET /user/profile` 200 不能作为有效 token 证据。 | 已确认 `/user/profile` 对无 token/无效 token 也返回 200 默认摘要。 | 不得把 `/user/profile` 200 写成 token 有效。 |
| 后台 cookie / 后台测试账号 | 短期 `INT_DATA_ADMIN_COOKIE`，或可登录的后台测试账号；只记录 cookie 是否存在和账号角色，不写密码/cookie 明文。 | 缺。 | 无法执行 approve/hide/reward/report/retry；远程 fixture 只能生成部分前台样本。 |
| 后端奖励发放修复状态 | 后端/API 确认线上 `POST /admin/ranking-rewards/grant` 已发布并可写 `pointsLedger(kind=ranking-reward)` 与 `rankingRewardPayouts`；或说明仍待发布/待复测。 | 本地 smoke 已覆盖；线上发奖点击和写入验收仍未完成。 | 不把 reward payout / points ledger 写成线上可用样本。 |
| remote expired/report/helper | 后端/API 提供远程安全 helper 或允许的后台/DBA 操作，用于 expired share task、report、reviewMomentId、pointsLedgerIds。 | 缺。现有脚本 remote 分支会跳过 expired/report。 | manifest 需保留 warnings/skipped，不得声称四态和举报已齐。 |
| cleanup / 残留扫描 | 后端/API 或 DBA/运维提供线上按 prefix/ID 精确扫描与清理方式；现有脚本 `cleanup` 只支持 local。 | 缺。 | 写入前必须接受“无法自动 cleanup”的风险，或先补 cleanup 脚本。 |

#### 3.16.2 重试命令模板

重试时不得把完整 token 写入命令历史、截图、文档或群消息；建议由执行窗口注入环境变量，文档只记录 token 后 8 位和命令模板。

```powershell
# 前置：由 PM/测试/前端/后端通过安全通道注入真实线上 token；这里不写明文
$env:INT_DATA_ALLOW_REMOTE_WRITE='1'
$env:INT_DATA_HOST_TOKEN='<online-host-token>'
$env:INT_DATA_MEMBER_A_TOKEN='<online-member-a-token>'
$env:INT_DATA_MEMBER_B_TOKEN='<online-member-b-token>'
$env:INT_DATA_OUTSIDER_TOKEN='<online-outsider-token>'
$env:INT_DATA_ADMIN_COOKIE='<optional-online-admin-cookie>'

npm.cmd --prefix backend run fixture:moments-integration -- --mode create --base-url https://api.pomer.cn/api/v1 --prefix IT-MOMENTS-20260616-FINAL --manifest docs/runtime/pr-int-online-final-fixture-004-manifest.json --keep --no-start-server

Remove-Item Env:\INT_DATA_ALLOW_REMOTE_WRITE, Env:\INT_DATA_HOST_TOKEN, Env:\INT_DATA_MEMBER_A_TOKEN, Env:\INT_DATA_MEMBER_B_TOKEN, Env:\INT_DATA_OUTSIDER_TOKEN, Env:\INT_DATA_ADMIN_COOKIE -ErrorAction SilentlyContinue
```

如果 PM 派发的是微信 `loginCode` 而不是 token，接口联调不得自行伪造 token；需先由前端/测试或后端/API 使用 `POST /user/auth/login` 换取真实线上 token，再按 token 后 8 位登记。

#### 3.16.3 manifest 字段要求

重试成功后，`docs/runtime/pr-int-online-final-fixture-004-manifest.json` 至少应包含：

| 字段 | 要求 |
| --- | --- |
| `id` / `prefix` / `environment` / `baseUrl` / `createdAt` | `id=INT-DATA-001` 或本任务固定 ID；`prefix=IT-MOMENTS-20260616-FINAL`；`environment=api.pomer.cn`；`baseUrl=https://api.pomer.cn/api/v1`。 |
| `profiles.host/memberA/memberB/outsider` | profileId、role、name、token；对外只汇报 token 后 8 位。 |
| `session` | sessionId、inviteCode、status。 |
| `moments` | openingId、highlightId、privateId、failedCandidateMomentId；若 dedicated `reviewMomentId` 仍缺，必须写空并在 warnings 说明。 |
| `events` | drinkDebtEventId 或新版聚会记录事件 ID。 |
| `brief` | briefId；读取合同必须使用 `GET /session-briefs/{briefId}`。 |
| `shareTasks` | pendingTaskId、readyTaskId、readyImageUrl、failedTaskId、expiredTaskId；远程缺 expired 时不得伪造。 |
| `admin` | reportId、operationLogIds；无后台 cookie/helper 时允许为空，但必须写 warnings/skipped。 |
| `m5` | rankingCategory、rankingItemId、nominationId、rewardPayoutId、pointsLedgerIds；reward/ledger 缺口必须区分“未执行发奖”与“已发奖但未回填”。 |
| `cleanup` | cleanup 模式、清理责任人、清理命令或后端/DBA 手动清理步骤；远程自动 cleanup 不可用时必须写明。 |
| `warnings` / `skipped` / `evidence` | 记录 remote expired/report/admin reward/helper 缺失、接口响应摘要、HTTP 状态和只读复核结果。 |

#### 3.16.4 cleanup 与残留扫描方案

重试前扫描：

```powershell
# 需要后端/API 或 DBA/运维在 api.pomer.cn 对应测试数据源执行，接口联调不能用本地 rg 代替线上扫描
# 扫描前缀：IT-MOMENTS-20260616-FINAL
# 扫描对象：profiles/userSessions/loginLogs、sessions、momentRecords、sessionEvents、sessionBriefs、shareImageTasks、momentReports、momentNominations、rankingRewardPayouts、pointsLedger、uploads
```

重试后记录：

| 项 | 必填记录 |
| --- | --- |
| 写入命令 | create 命令、执行时间、执行人、baseUrl、manifest 路径。 |
| token 脱敏 | 4 个 token 仅记录后 8 位；后台 cookie 仅记录是否提供和过期时间，不记录明文。 |
| 样本 ID | session/profile/moment/event/brief/shareTask/report/nomination/payout/ledger/operationLog 全量 ID。 |
| 响应摘要 | 每个关键接口 HTTP 状态、`code`、核心 `data.id/status/category/items.length`，不得贴完整敏感 payload。 |
| 残留 | manifest 是否存在、线上前缀扫描结果、上传 PNG 路径。 |
| 清理方式 | 优先后端/API 提供 remote cleanup；否则 DBA/运维按 manifest 精确清理并导出 evidence。 |

重试失败处理：

- 如果再次在 `POST /sessions` 返回 401：立即停止，不继续调用 moment/brief/share/ranking 写接口；记录错误原文和 token 后 8 位，退回提供 token 的角色。
- 如果中途失败且已生成 sessionId：不得隐瞒残留；立即把已知 sessionId/profileId/momentId 写入本节，并请求后端/API 或 DBA/运维按 manifest/前缀清理。
- 如果没有 manifest 但存在网络层 `fetch failed`：按 prefix 在服务端扫描，不得仅凭本地无文件判断无残留。

### 3.17 `PR-INT-DB-GENERATED-FIXTURE-005` DB 生成身份后的线上最终 manifest 执行口径

记录时间：2026-06-16。用户已确认当前没有 4 个真实账号供测试，要求“用现有登录和数据库直接生成”。因此接口联调后续不再等待用户/测试提供 4 个真实账号；改为等待 DBA/运维与后端/API 基于现有登录机制和数据库生成 host/memberA/memberB/outsider 四个可写入线上测试身份后，直接在 `api.pomer.cn` 创建最终采集 manifest。本节只更新接口联调计划，不改 PM 总台账，不触碰 `pomer.cn` 官网项目、官网 PM2、官网 Nginx block、官网目录或无关项目。

#### 3.17.1 当前状态与阻塞条件

| 项 | 当前状态 | 接口联调处理 |
| --- | --- | --- |
| DB 生成测试身份 | 尚未在接口联调可见证据中出现；`docs/runtime` 未发现线上 final manifest 或 DB 生成身份私密运行文件。PM 队列已派后端/API `PR-BE-DB-LOGIN-SEED-005` 和 DBA/运维相关生成/回滚任务。 | 等后端/API 或 DBA/运维交付四角色 profileId/token 后 8 位、有效性验证和 cleanup 方案；未交付前不执行 create。 |
| 旧本地 token | 已证明对 `api.pomer.cn` 的 `POST /sessions` 返回 401。 | 不得复用旧本地 token，不得把 `/user/profile` 200 写成线上有效。 |
| 后端奖励发放修复 | 本地 smoke 已覆盖；线上 `POST /admin/ranking-rewards/grant` 写入 reward payout / points ledger 的修复状态和发布证据仍需后端/API 回填。 | 未确认前，manifest 可生成 nomination/ranking，但 rewardPayoutId / ranking-reward ledger 只能标 warnings/skipped。 |
| 后台 cookie / 后台测试账号 | 仍需后台/运维提供，或后端/API 提供安全 helper。 | 缺失时不能补齐审核、举报处理、发奖、retry operationLogs。 |
| remote cleanup | 现有 `prepare-moments-integration-fixture.js --mode cleanup` 只支持 local，远程 cleanup 会拒绝。 | 写入前必须有 DBA/运维或后端/API 的线上按 prefix/ID 精确扫描与清理方式。 |

#### 3.17.2 后端/API 或 DBA/运维需交付的身份包

完整 token 只能放在本地私密运行文件或安全通道中，不得进入本公开计划。接口联调计划只记录 token 后 8 位。

| 字段 | 要求 |
| --- | --- |
| 交付文件 | 建议 `docs/runtime/pr-int-db-generated-fixture-005.secrets.local.json`，需加入本地私密/不提交范围；公开文档只写摘要。 |
| host/memberA/memberB/outsider | 每个角色提供 `profileId`、`name`、`role`、`token`、`tokenLast8`、生成来源（DB seed / 后端 helper / 登录绑定）。 |
| 有效性验证 | 每个 token 至少通过 `POST /sessions` 或等价写接口验证；不能只用 `GET /user/profile`。 |
| 后台凭据 | 可选 `adminCookie` 或后台测试账号登录方式；公开计划只记录是否提供、角色和过期时间，不记录明文。 |
| 回滚依据 | profile/session/token/openId/loginLog/pointsLedger 等可精确定位字段，必须带 `IT-MOMENTS-20260616-FINAL` 或同等测试前缀/备注。 |
| 奖励发放状态 | 明确线上 `POST /admin/ranking-rewards/grant` 是否可用，若不可用需说明 rewardPayoutId / ranking-reward ledger 预计为空。 |

#### 3.17.3 执行命令模板

拿到 DB 生成身份包后，由接口联调在本地读取私密文件注入环境变量；命令和文档不得展开完整 token。

```powershell
$secret = Get-Content -Raw -Path docs/runtime/pr-int-db-generated-fixture-005.secrets.local.json | ConvertFrom-Json
$env:INT_DATA_ALLOW_REMOTE_WRITE='1'
$env:INT_DATA_HOST_TOKEN=$secret.profiles.host.token
$env:INT_DATA_MEMBER_A_TOKEN=$secret.profiles.memberA.token
$env:INT_DATA_MEMBER_B_TOKEN=$secret.profiles.memberB.token
$env:INT_DATA_OUTSIDER_TOKEN=$secret.profiles.outsider.token
if ($secret.adminCookie) { $env:INT_DATA_ADMIN_COOKIE=$secret.adminCookie }

npm.cmd --prefix backend run fixture:moments-integration -- --mode create --base-url https://api.pomer.cn/api/v1 --prefix IT-MOMENTS-20260616-FINAL --manifest docs/runtime/pr-int-db-generated-fixture-005-manifest.json --keep --no-start-server

Remove-Item Env:\INT_DATA_ALLOW_REMOTE_WRITE, Env:\INT_DATA_HOST_TOKEN, Env:\INT_DATA_MEMBER_A_TOKEN, Env:\INT_DATA_MEMBER_B_TOKEN, Env:\INT_DATA_OUTSIDER_TOKEN, Env:\INT_DATA_ADMIN_COOKIE -ErrorAction SilentlyContinue
```

如果后端/API 提供的是新脚本或 API，而不是现有 `fixture:moments-integration`，接口联调按后端/API 提供的命令执行，但必须保留同等字段：manifest、样本 ID、token 后 8 位、响应摘要、cleanup/残留扫描。

#### 3.17.4 最终 manifest 覆盖要求

| 模块 | 必须覆盖 | 允许 warnings/skipped 的条件 |
| --- | --- | --- |
| session / roles | sessionId、inviteCode、host/memberA/memberB/outsider profileId、role、tokenLast8。 | 无。缺任一项不能交测试采集。 |
| 首张照片 / 相册 | opening/first photo、highlight、private、failed candidate、briefId；brief 读取使用 `GET /session-briefs/{briefId}`。 | closing/needs_media 可暂缺，但需写入缺口。 |
| share task 四态 | pending、ready、failed、expired；readyImageUrl；failed/expired 可 retry 的样本 ID。 | 现有远程脚本无 expired helper 时，必须由后端/API 补 helper；否则不能声称四态齐全。 |
| 举报 / 审核候选 | reportId、reviewMomentId 或明确以 pending highlight 替代；operationLogIds 如执行后台动作需回填。 | 缺后台 cookie/helper 时 report/review/operationLog 允许标 skipped，但不能交后台/UGC 写通过。 |
| rankings / points ledger | rankingCategory、rankingItemId、nominationId、pointsLedgerIds；如发奖可用，需 rewardPayoutId 与 ranking-reward ledger。 | 奖励发放修复未完成时，rewardPayoutId / ranking-reward ledger 可为空但必须写 warnings。 |
| retry / cleanup | failed/expired share retry 样本、retry 前状态、cleanup 命令、残留扫描结果。 | remote cleanup 未提供时不能执行不可回收写入，除非 PM/DBA 明确接受并给手动清理方式。 |

#### 3.17.5 API 摘要与脱敏输出格式

交付给 PM/测试时只输出以下摘要，不输出完整 token：

| 项 | 摘要格式 |
| --- | --- |
| token | `role=host profileId=... tokenLast8=xxxxxxxx`。 |
| session | `sessionId=... inviteCode=... status=...`。 |
| brief | `GET /session-briefs/{briefId}` HTTP、`code`、`sessionId`、`timelineNodeIds.length`。 |
| share task | 每个 task 的 HTTP、`code`、`status`、`selectedNodeIds.length`、`imageUrl` 是否存在。 |
| rankings | `GET /rankings/today?category=best_opening` HTTP、`code`、`items.length`、是否包含 `rankingItemId`。 |
| points ledger | `GET /user/commerce` HTTP、`code`、points、ledger id/kind/delta/sourceId 摘要。 |
| report/review | reportId、reviewMomentId、后台 action/operationLogIds 摘要；没有后台动作则写 skipped。 |
| cleanup | cleanup 命令或 DBA/运维清理单号、前缀扫描命中数、上传文件路径。 |

#### 3.17.6 cleanup / 残留扫描

线上写入前后均需 DBA/运维或后端/API 执行前缀扫描；接口联调不能用本地 `rg` 代替线上扫描。

```text
prefix: IT-MOMENTS-20260616-FINAL
scan targets: profiles/userSessions/loginLogs, sessions, momentRecords, sessionEvents, sessionBriefs, shareImageTasks, momentReports, momentNominations, rankingRewardPayouts, pointsLedger, operationLogs, uploads
```

清理策略：

- 首选后端/API 提供 remote cleanup 脚本，按 manifest 精确删除 `IT-MOMENTS-20260616-FINAL` 数据。
- 如无脚本，由 DBA/运维按 manifest ID 清理并导出 before/after evidence。
- 清理前必须先导出 pointsLedger、momentNominations、rankingRewardPayouts、operationLogs 和 uploaded file paths。
- 若 create 中途失败但已生成 sessionId 或任一样本 ID，立即记录残留并请求后端/API 或 DBA/运维清理；不得再次 create 叠加残留。

### 3.18 `PR-INT-DB-GENERATED-FIXTURE-RUN-006` 线上 DB 身份 final manifest 执行记录

记录时间：2026-06-16。PM 已回收后端/API 结果：`api.pomer.cn` 对应 MySQL `social_store` 已生成 host/memberA/memberB/outsider 四个测试身份，并验证 4 个 `/api/v1/user/auth/session` 均 HTTP 200 / `loggedIn=true`；host token 已 `POST /api/v1/sessions` 成功，HTTP 201，smoke session `session-1781584037456-ee2e2b`，inviteCode `TWPNX2`；后台奖励发放函数缺失 500 已修复，`POST /api/v1/admin/ranking-rewards/grant` 返回 200，当前今日榜为空 `grantedCount=0`。本节只记录接口联调执行状态，不改 PM 总台账，不泄露完整 token。

#### 3.18.1 已接收的脱敏身份证据

| 角色 | profileId | openId / 来源 | token 后 8 位 | 状态 |
| --- | --- | --- | --- | --- |
| host | `user-1781583974510-1a52e6` | `PR-BE-DB-LOGIN-SEED-005-20260616-host` | `4afb1b00` | 后端/API 已验证 `auth/session loggedIn=true`，且 `POST /sessions` 201。 |
| memberA | `user-1781583974512-aedd1b` | `PR-BE-DB-LOGIN-SEED-005-20260616-memberA` | `c1b1585a` | 后端/API 已验证 `auth/session loggedIn=true`。 |
| memberB | `user-1781583974514-a46045` | `PR-BE-DB-LOGIN-SEED-005-20260616-memberB` | `dc59b557` | 后端/API 已验证 `auth/session loggedIn=true`。 |
| outsider | `user-1781583974515-9019e6` | `PR-BE-DB-LOGIN-SEED-005-20260616-outsider` | `f9118246` | 后端/API 已验证 `auth/session loggedIn=true`。 |

接口联调本地核查结果：

| 检查项 | 结果 |
| --- | --- |
| 本地完整 token 环境变量 | `INT_DATA_HOST_TOKEN`、`INT_DATA_MEMBER_A_TOKEN`、`INT_DATA_MEMBER_B_TOKEN`、`INT_DATA_OUTSIDER_TOKEN`、`INT_DATA_ADMIN_COOKIE` 均未设置。 |
| 本地私密身份文件 | `docs/runtime/pr-int-db-generated-fixture-005.secrets.local.json`、`docs/runtime/pr-int-db-generated-fixture-006*.json` 暂未发现。 |
| 后端安全交接线程 | 已向后端/API 线程 `019ec9c5-3045-7603-83ce-a1bec52c8586` 发送补充请求：优先服务器侧代跑 006 manifest，或提供仅接口联调可读的私密 token 文件/一次性命令。 |

结论：当前不再阻塞于“没有 4 个账号”；四个 DB 生成身份已存在并经后端/API 验证可写。接口联调尚未拿到完整 token 或服务器侧代跑结果，因此不能在本地执行 create，也不得用旧本地 token 或 token 后 8 位冒充完整 token。

#### 3.18.2 本轮目标 manifest 与命令

目标路径：`docs/runtime/pr-int-db-generated-fixture-006-manifest.json`。

若后端/API 提供私密 token 文件，接口联调本地执行模板：

```powershell
$secret = Get-Content -Raw -Path docs/runtime/pr-int-db-generated-fixture-006.secrets.local.json | ConvertFrom-Json
$env:INT_DATA_ALLOW_REMOTE_WRITE='1'
$env:INT_DATA_HOST_TOKEN=$secret.profiles.host.token
$env:INT_DATA_MEMBER_A_TOKEN=$secret.profiles.memberA.token
$env:INT_DATA_MEMBER_B_TOKEN=$secret.profiles.memberB.token
$env:INT_DATA_OUTSIDER_TOKEN=$secret.profiles.outsider.token
if ($secret.adminCookie) { $env:INT_DATA_ADMIN_COOKIE=$secret.adminCookie }

npm.cmd --prefix backend run fixture:moments-integration -- --mode create --base-url https://api.pomer.cn/api/v1 --prefix IT-MOMENTS-20260616-FINAL --manifest docs/runtime/pr-int-db-generated-fixture-006-manifest.json --keep --no-start-server

Remove-Item Env:\INT_DATA_ALLOW_REMOTE_WRITE, Env:\INT_DATA_HOST_TOKEN, Env:\INT_DATA_MEMBER_A_TOKEN, Env:\INT_DATA_MEMBER_B_TOKEN, Env:\INT_DATA_OUTSIDER_TOKEN, Env:\INT_DATA_ADMIN_COOKIE -ErrorAction SilentlyContinue
```

若后端/API 在服务器侧代跑，接口联调只接收脱敏 manifest 摘要、可复跑只读命令和 cleanup/残留扫描证据，不要求公开完整 token。

#### 3.18.3 final manifest 必须覆盖与允许缺口

| 模块 | 目标字段 | 当前执行状态 |
| --- | --- | --- |
| session / roles | sessionId、inviteCode、4 个 profileId、token 后 8 位 | 待 manifest create；已有后端 smoke session 只能证明 host token 可写，不直接作为 final manifest。 |
| moments / 相册 | opening、highlight、private、failed candidate、briefId | 待 manifest create。 |
| share task | pending、ready、failed、expired、readyImageUrl、failed/expired retry 样本 | 待 manifest create；若现有脚本 remote 缺 expired helper，必须 warnings/skipped。 |
| report / review | reportId、reviewMomentId 或 highlight 替代口径、operationLogIds | 待后端/API 或后台 helper；不得伪造。 |
| rankings / points | rankingCategory、rankingItemId、nominationId、pointsLedgerIds、rewardPayoutId | 后台奖励发放 500 已修，但今日榜为空时 `grantedCount=0`；若没有非空榜，reward payout 可能为空并需 warnings。 |
| cleanup / 残留 | cleanup 命令、prefix 扫描、上传文件路径、DB before/after evidence | 待 DBA/运维或后端/API 提供线上 remote cleanup/扫描。 |

#### 3.18.4 当前阻塞与下一步

- 阻塞：接口联调本地缺完整 token 或服务器侧代跑结果；不能仅凭 token 后 8 位执行 create。
- 阻塞：现有远程脚本可能缺 expired/report/review/ledger helper；需要后端/API 明确代跑时的 warnings/skipped 或补 helper。
- 下一步：等后端/API `PR-BE-SEED-TOKEN-HANDOFF-006` 返回私密文件路径、服务器侧 manifest、或明确不可代跑原因；接口联调收到后立即生成/核验 `docs/runtime/pr-int-db-generated-fixture-006-manifest.json` 并补 API 摘要、样本 ID、cleanup 和残留扫描。

### 3.19 `PR-INT-MANIFEST-SANITIZED-VERIFY-007` 线上 final fixture 脱敏 manifest 复核

记录时间：2026-06-16。后端/API 已在服务器侧代跑 final fixture；完整 token 与 private manifest 仅保存在服务器私密目录。接口联调本轮只读取脱敏 manifest：`/www/backup/jiuzhuopanguan/pr-int-db-generated-fixture-run-006-20260616123313/int-data-001-online-manifest-sanitized.json`。未读取、复制或传播完整 token；未修改 PM 总台账。

#### 3.19.1 JSON.parse 与字段齐缺复核

| 项 | 结果 |
| --- | --- |
| JSON.parse | 通过。 |
| manifest id / prefix | `INT-DATA-001` / `IT-MOMENTS-20260616-006B`。 |
| environment / baseUrl | `api.pomer.cn` / `https://api.pomer.cn/api/v1`。 |
| session | `sessionId=session-1781584503517-c033e9`，`inviteCode=W58G7T`，`status=created`。 |
| roles | host/memberA/memberB/outsider 4 个 profile 均存在，仅记录 token 后 8 位。 |
| moments | opening、highlight、private、failedCandidate 均存在；dedicated `reviewMomentId` 为空。 |
| brief | `briefId=brief-1781584503870-25d5edac`。 |
| share task | pending、ready、failed 存在；`expiredTaskId` 为空。 |
| admin | `operationLogIds` 3 条；`reportId` 为空。 |
| M5 | rankingCategory、rankingItemId、nominationId、rewardPayoutId、pointsLedgerIds 2 条均存在。 |
| evidence | 含 timeline、memberBTimeline、brief、readyTask、failedTask、ranking、memberBCommerce、extra；`errors` 为空。 |

#### 3.19.2 可公开使用的测试样本

| 类型 | ID / 摘要 | 测试用途 |
| --- | --- | --- |
| host | `user-1781583974510-1a52e6`，token 后 8 位 `4afb1b00` | 创建者视角、brief、share task、榜单、后台同步前台核验。 |
| memberA | `user-1781583974512-aedd1b`，token 后 8 位 `c1b1585a` | 上传者/普通成员视角。 |
| memberB | `user-1781583974514-a46045`，token 后 8 位 `dc59b557` | 私密可见方、推举/积分 ledger 只读。 |
| outsider | `user-1781583974515-9019e6`，token 后 8 位 `f9118246` | 非成员权限反例。 |
| session | `session-1781584503517-c033e9` / inviteCode `W58G7T` | 最终线上采集主 session。 |
| opening | `moment-1781584503741-d53b131f` | 首张照片、榜单候选、ranking item。 |
| highlight | `moment-1781584503769-1a5b4d94` | 普通精彩记录；可作为待审候选口径之一，但不是 dedicated `reviewMomentId`。 |
| private | `moment-1781584503795-17a32c27` | memberB 可见、其他角色占位/权限验证。 |
| failed candidate | `moment-1781584503823-56dc9214` | failed share task / 后台 action 证据关联。 |
| event | `event-1781584503850-94ad3aeb` | timeline 混合节点兼容样本。 |
| brief | `brief-1781584503870-25d5edac` | 相册/简报读取主键。 |
| pending task | `share-task-1781584503885-8bf3c52b` | 分享生成中状态。 |
| ready task | `share-task-1781584503902-a99a5211`，PNG `/uploads/moments/share-tasks/share-task-1781584503902-a99a5211.png` | 分享海报成功态。 |
| failed task | `share-task-1781584504132-3251bd01` | 分享失败态；可作为后台/前端 retry 候选，但 retry 属写操作。 |
| nomination | `nomination-1781584504202-df008444` | M5 推举样本。 |
| reward payout | `ranking-reward-payout-1781584504234-5a8cb962` | M5 榜单奖励发放样本。 |
| operation logs | `admin-op-1781584504167-457c2e`、`admin-op-1781584504109-c1655b`、`admin-op-1781584504077-f9714e` | 后台 action / 审计追溯样本。 |
| points ledger | `ledger-1781584504234-f8d759bf`、`ledger-1781584504202-0eb017c5` | ranking reward / nomination 积分流水样本。 |

#### 3.19.3 页面路径 / query 建议

| 页面 / 场景 | 建议 query | API 摘要 |
| --- | --- | --- |
| `invite-group` | `sessionId=session-1781584503517-c033e9&inviteCode=W58G7T` | 用于邀请展示/加入入口；成员加入状态以实际页面登录态为准。 |
| `moment-editor` 首张照片 | `sessionId=session-1781584503517-c033e9&nodeType=opening` | 现有 opening 可作已完成首张照片样本；再次提交是写操作。 |
| `session-brief` | `briefId=brief-1781584503870-25d5edac&sessionId=session-1781584503517-c033e9` | 读取合同：`GET /session-briefs/brief-1781584503870-25d5edac`。 |
| `share-poster/share-preview` ready | `briefId=brief-1781584503870-25d5edac&taskId=share-task-1781584503902-a99a5211` | `GET /share-image-tasks/share-task-1781584503902-a99a5211`，状态 `ready`，PNG 使用服务根地址。 |
| `share-poster/share-preview` failed | `taskId=share-task-1781584504132-3251bd01` | `GET /share-image-tasks/share-task-1781584504132-3251bd01`，状态 `failed`。 |
| `rankings` | `category=best_opening` | `GET /rankings/today?category=best_opening`，evidence 中 `items.length=1`，包含 ranking item。 |
| `me` / 积分 | 使用 memberB 或 host 线上 token | `GET /user/commerce`，可核 points ledger；文档只记录 token 后 8 位。 |

#### 3.19.4 关键 API 摘要

| API | 脱敏响应摘要 |
| --- | --- |
| host timeline | evidence 有 `timeline`，包含 `sessionId`、`nodes`、`pendingMediaCount`。 |
| memberB timeline | evidence 有 `memberBTimeline`，包含 `sessionId`、`nodes`、`pendingMediaCount`。 |
| `GET /session-briefs/{briefId}` | evidence brief id `brief-1781584503870-25d5edac`，含 `timelineNodeIds`、`shareImageTaskId`、`shareImageStatus`、`timeline`。 |
| `GET /share-image-tasks/{readyTaskId}` | evidence readyTask id `share-task-1781584503902-a99a5211`，`status=ready`。 |
| `GET /share-image-tasks/{failedTaskId}` | evidence failedTask id `share-task-1781584504132-3251bd01`，`status=failed`。 |
| `GET /rankings/today?category=best_opening` | evidence ranking `category=best_opening`，`items.length=1`。 |
| `GET /user/commerce` | evidence memberBCommerce 存在，pointsLedger 可用于积分流水核查。 |
| admin evidence | `operationLogIds` 3 条；用于后台审计样本追溯。 |

#### 3.19.5 warnings / skipped / 缺口

warnings：

- `remote expired task and report sample skipped; no safe public API/helper available`
- `reviewMomentId remains empty; failedCandidateMomentId plus admin.operationLogIds are the review/action evidence, not a dedicated review moment field`
- `remote report sample skipped; no safe public report creation helper in current fixture script`
- `remote expired share task skipped; no safe public expired-task creation helper in current fixture script`

仍阻塞 / 不得标通过：

- dedicated `reviewMomentId` 为空；只能用 `failedCandidateMomentId` + `operationLogIds` 作为后台 action 证据，不能声称专用待审样本齐全。
- `reportId` 为空；举报样本未生成，UGC/后台举报处理仍待补样本或待联调。
- `expiredTaskId` 为空；expired share task / expired retry 仍待后端/API helper 或后台补样本。
- retry 写操作未由接口联调执行；failed task 可作为 retry 候选，但测试/后台执行前需记录写操作和残留。

#### 3.19.6 cleanup / 残留扫描口径

| 项 | 口径 |
| --- | --- |
| private manifest | 保存在服务器私密目录，不进入公开文档；接口联调本轮未读取。 |
| sanitized manifest | `/www/backup/jiuzhuopanguan/pr-int-db-generated-fixture-run-006-20260616123313/int-data-001-online-manifest-sanitized.json`。 |
| cleanup command | 脱敏 manifest 记录为 `node backend/scripts/prepare-moments-integration-fixture.js --mode cleanup --manifest ../../backup/jiuzhuopanguan/pr-int-db-generated-fixture-run-006-20260616123313/int-data-001-online-manifest-private.json`；该命令引用 private manifest，执行前必须由后端/API 或 DBA/运维导出 evidence。 |
| prefix 扫描 | 按 `IT-MOMENTS-20260616-006B` 扫描 sessions、momentRecords、sessionEvents、sessionBriefs、shareImageTasks、momentNominations、rankingRewardPayouts、pointsLedger、operationLogs、uploads。 |
| 残留状态 | 线上样本当前保留，供最后大版本测试采集；不得 cleanup，除非 PM 另派清理任务。 |

### 3.20 `PR-INT-FINAL-QA-API-SUMMARY-008` 最终采集测试归档 API 摘要

记录时间：2026-06-16。测试 `PR-QA-FINAL-IP12-CAPTURE-EXEC-007` 已确认 3.19 公开摘要可用，但需要可归档 API 摘要文件。接口联调已基于 3.19 产出归档文件：`docs/runtime/pr-int-final-qa-api-summary-008.md`。该文件不包含完整 token，不读取 private manifest，不改 PM 总台账。

测试引用方式：

| 项 | 归档位置 |
| --- | --- |
| API 摘要文件 | `docs/runtime/pr-int-final-qa-api-summary-008.md` |
| 样本来源章节 | 本计划 3.19 `PR-INT-MANIFEST-SANITIZED-VERIFY-007` |
| API base | `https://api.pomer.cn/api/v1` |
| prefix | `IT-MOMENTS-20260616-006B` |
| session / invite | `session-1781584503517-c033e9` / `W58G7T` |
| brief | `brief-1781584503870-25d5edac` |
| ready / failed share task | `share-task-1781584503902-a99a5211` / `share-task-1781584504132-3251bd01` |
| rankings / M5 | `best_opening`、`nomination-1781584504202-df008444`、`ranking-reward-payout-1781584504234-5a8cb962` |
| pointsLedger | `ledger-1781584504234-f8d759bf`、`ledger-1781584504202-0eb017c5` |
| operationLogs | `admin-op-1781584504167-457c2e`、`admin-op-1781584504109-c1655b`、`admin-op-1781584504077-f9714e` |

测试归档摘要已覆盖：

- session / roles / brief / share task / rankings / ledger / operationLogs 样本 ID。
- 页面 query：`invite-group`、`moment-editor`、`session-brief`、`share-poster/share-preview`、`rankings`。
- warnings/skipped 原文。
- cleanup 命令与 prefix 残留扫描口径。

仍不得写通过的缺口：

- dedicated `reviewMomentId` 为空。
- `reportId` 为空。
- `expiredTaskId` 为空。

下一步：测试可把 `docs/runtime/pr-int-final-qa-api-summary-008.md` 作为 `PR-QA-FINAL-IP12-CAPTURE-EXEC-007` 的 API 摘要归档附件；涉及 `reviewMomentId`、`reportId`、`expiredTaskId` 的用例必须标为待补样本 / 待联调，并退回后端/API 或后台补 helper/样本。

### 3.21 `PR-INT-REWARD-REPORT-EXPIRED-SAMPLES-009` 奖励正向 / 举报 / expired 补样本

记录时间：2026-06-16

执行边界：

- 环境：`https://api.pomer.cn/api/v1`，线上测试服务器授权范围内。
- 未 cleanup 当前 final 样本；未触碰 `pomer.cn` 官网项目、`pomer` 官网 PM2、官网 Nginx block、官网目录或无关项目。
- 完整 token 只在服务器私密 `tokens.env` 中使用，公开文档只记录 token 后 8 位。
- 本轮仅更新接口联调计划和 `docs/runtime/pr-int-final-qa-api-summary-008.md`，不改 PM 总台账，不替测试/后台/UGC 写通过。

执行命令摘要：

```text
ssh pomer.cn "cd /www/wwwroot/jiuzhuopanguan-git/backend && set -a && . ./.env && . /www/backup/jiuzhuopanguan/pr-int-db-generated-fixture-run-006-20260616123313/tokens.env && set +a && mysqldump ... app_store > /www/backup/jiuzhuopanguan/pr-int-db-generated-fixture-run-006-20260616123313/mysql-app-store-before-pr-int-009-final.sql && node /tmp/pr-int-009-direct.js && pm2 restart jiuzhuopanguan-backend --update-env"
```

前置错误和处理：

| 尝试 | 结果 | 是否写入样本 |
| --- | --- | --- |
| 旧变量名读取 token | `missing HOST_TOKEN` | 否 |
| 旧 helper 名 | `listMomentRecords is not a function` | 否 |
| 错误上传路径 | `POST /moments/upload HTTP 404` | 否 |
| 混合公网 API + 未 flush data 层 | expired 公网 GET 404 | 可能留下非最终文件镜像残留；最终以 `pr-int-009-direct.js` 和 PM2 重启后公网复核为准 |

最终样本摘要：

| 类型 | ID / 摘要 | 复拍用途 |
| --- | --- | --- |
| API base | `https://api.pomer.cn/api/v1` | 公网复拍；仅限测试服务器。 |
| session / brief | `session-1781584503517-c033e9` / `brief-1781584503870-25d5edac` | 复用 final 006B 样本。 |
| host token 后 8 位 | `4afb1b00` | 只读 GET、host 推举来源；不公开完整 token。 |
| memberA token 后 8 位 | `c1b1585a` | 正向发奖候选上传者 / 获奖者。 |
| 正向发奖候选 moment | `moment-1781586554926-ffc93c65` | `opening`，`reviewStatus=approved`，`secondaryReviewStatus=approved`，`rankingEligible=true`，`rewardEligible=true`。 |
| nomination | `nomination-1781586678021-ca565a1c` | `best_opening`，host 推举 memberA opening。 |
| reward payout | `ranking-reward-payout-1781586678028-9cad8832` | 本轮发奖返回 `grantedCount=1`，`skippedCount=1`，`totalPoints=60`。 |
| reportId | `moment-report-it-moments-20260616-009` | `status=pending`，目标 private `moment-1781584503795-17a32c27`，reporter memberA，target memberB。 |
| expiredTaskId | `share-task-it-moments-20260616-009-expired` | `status=expired`，`retryCount=0`，用于后台/前端 expired retry 前置样本。 |

公网只读复核：

| 请求 | 摘要 |
| --- | --- |
| `GET /config/home` | HTTP 200，`code=0`。 |
| `GET /share-image-tasks/share-task-it-moments-20260616-009-expired` | host token；HTTP 200，`code=0`，`status=expired`，`retryCount=0`。 |
| `GET /rankings/today?category=best_opening` | HTTP 200，`code=0`，`items.length=2`，第一条 `moment.id=moment-1781586554926-ffc93c65`。 |
| 服务端残留扫描 | moment / nomination / payout / report / expired task 均按 ID 命中；payout `status=granted`、`points=60`、`operator=pr-int-009`。 |
| PM2 状态 | 仅重启 `jiuzhuopanguan-backend`；复核 PID `245940` online；未重启 `pomer`。 |

Warnings / skipped：

- `reviewMomentId` 仍不是 dedicated 待审核字段；本轮正向候选已审核并用于正向发奖，不替代 dedicated review 样本验收。
- `reportId` 和 `expiredTaskId` 为服务器侧 data/helper 补样本，并经 PM2 重启后公网只读验证可见；当前没有公开用户侧“创建举报样本 / 创建 expired task” helper 交付给测试复跑。
- 本轮未执行 expired retry 写操作，避免把 `share-task-it-moments-20260616-009-expired` 消费成 `pending`；后台/测试复测 retry 前需记录当前 expired 状态。
- 最终归档摘要已追加到 `docs/runtime/pr-int-final-qa-api-summary-008.md`。

Cleanup / 残留扫描口径：

| 项 | 口径 |
| --- | --- |
| 写入前备份 | `/www/backup/jiuzhuopanguan/pr-int-db-generated-fixture-run-006-20260616123313/mysql-app-store-before-pr-int-009-final.sql` |
| prefix 扫描 | `IT-MOMENTS-20260616-009` |
| 精确 ID 扫描 | `moment-1781586554926-ffc93c65`、`nomination-1781586678021-ca565a1c`、`ranking-reward-payout-1781586678028-9cad8832`、`moment-report-it-moments-20260616-009`、`share-task-it-moments-20260616-009-expired` |
| cleanup 方式 | 本轮不 cleanup。后续由 PM 派后端/API 或 DBA 基于备份和精确 ID 清理 009 样本；不得清理整套 006B final 样本。 |

下一步复拍建议：

- 后台：用现有奖励页面先复核 `best_opening` 列表和本轮 payout 证据；如要再次点“发放”，应预期当前 009 payout 已发放，可能变为 skipped，不能再用它证明第二次 `grantedCount>0`。
- 后台 / 测试：用 `share-task-it-moments-20260616-009-expired` 执行 retry 前先记录 GET `status=expired`；执行 retry 后应验证状态转 `pending`、`retryCount=1` 和 operationLogs。
- UGC / 后台：用 `moment-report-it-moments-20260616-009` 打开举报处理入口；处理后应验证 report 状态、涉事 moment 状态和 operationLogs。
- 测试：仍不得把 dedicated `reviewMomentId` 写通过；需要 PM 另派后端/API 补 dedicated 待审样本或确认现有 `highlightId` 替代口径。

### 3.22 `PR-INT-DEDICATED-REVIEW-SAMPLE-011` dedicated `reviewMomentId` 补样本

记录时间：2026-06-17

执行边界：

- 环境：`https://api.pomer.cn/api/v1`，仅面向 `api.pomer.cn` / `jiuzhuopanguan-backend` 测试服务器。
- 完整 token 只在服务器私密 `tokens.env` 中读取，公开文档只记录 token 后 8 位。
- 本轮只创建 dedicated 待审样本并回填服务器私密 / 脱敏 manifest；不 cleanup 当前 final 样本，不触碰 `pomer.cn` 官网项目，不改 PM 总台账。
- 创建后不调用后台审核 action，避免把待审样本消费成 approved / hidden。

执行前依据：

| 来源 | 口径 |
| --- | --- |
| 后端/API 计划 31 节 | 现有 `POST /api/v1/sessions/:sessionId/moments` 已支持创建默认 `pending/pending` moment，不需要新增后端代码。 |
| 009 样本 | 正向候选 `moment-1781586554926-ffc93c65` 已 approved 并用于发奖，不能替代 dedicated 待审核样本。 |
| final manifest | 服务器私密 manifest 原 `moments.reviewMomentId` 为空；需补独立样本。 |

执行摘要：

| 项 | 值 |
| --- | --- |
| session | `session-1781584503517-c033e9` |
| clientDraftId | `IT-MOMENTS-20260616-011-review-dedicated` |
| host token 后 8 位 | `4afb1b00` |
| 新 dedicated reviewMomentId | `moment-1781682962307-8169479c` |
| reviewStatus | `pending` |
| secondaryReviewStatus | `pending` |
| rankingEligible / rewardEligible | `false` / `false` |
| sanitized manifest | `/www/backup/jiuzhuopanguan/pr-int-db-generated-fixture-run-006-20260616123313/int-data-001-online-manifest-sanitized.json` 已回填 `moments.reviewMomentId`。 |

命令执行记录：

| 步骤 | 结果 |
| --- | --- |
| 首次 here-doc 执行 | 失败，PowerShell 管道换行导致远端 Bash 未识别 `NODE` 结束符，Node 报 `ReferenceError: NODE is not defined`；该次未完成业务 API 写入。 |
| 第二次 base64 脚本执行 | 成功，返回 `ok:true`、`reviewMomentId=moment-1781682962307-8169479c`、`reviewStatus=pending`、`secondaryReviewStatus=pending`。 |
| 公网 timeline 只读复核 | host token 调用 `GET /sessions/session-1781584503517-c033e9/timeline` 返回 `code=0`，可定位该节点，`nodeType=highlight`、`reviewStatus=pending`、`secondaryReviewStatus=pending`。 |
| 脱敏 manifest JSON.parse | 通过；`moments.reviewMomentId=moment-1781682962307-8169479c`；`profiles.*.token` 字段数为 0，仅保留 tokenTail。 |
| 服务端 store 只读复核 | 一次 `initMomentsStore/readMomentsStore` 复核命令超时，未作为失败结论；当前以公网 API 和脱敏 manifest JSON.parse 作为本轮可复核证据。 |

当前 warnings / skipped 口径：

- 服务器脱敏 manifest 已清除 `reviewMomentId remains empty` 类 warning。
- 脱敏 manifest 仍保留历史 remote helper warnings：`remote expired task and report sample skipped...` 等 3 条；009 已在归档摘要中补 report / expired 实际样本，但 011 本轮不负责重写这些 warnings。
- `moment-report-it-moments-20260616-009` 和 `share-task-it-moments-20260616-009-expired` 继续按 009 摘要引用。

Cleanup / 残留扫描口径：

| 项 | 口径 |
| --- | --- |
| 本轮新增样本 | `moment-1781682962307-8169479c`，`clientDraftId=IT-MOMENTS-20260616-011-review-dedicated`。 |
| cleanup | 本轮不 cleanup。后续若 PM 派清理，应基于 private manifest 或精确 ID 清理，不得清理整套 006B final 样本。 |
| 后台 / 测试使用边界 | 该样本可用于后台审核入口、UGC 审核前台同步和 operation log 关联前置；使用前先记录 pending/pending 原态，后台 action 后需另补 operationLogs、前台同步截图/API 摘要。 |

### 3.23 `PR-INT-LOCAL-API-REFUSED-013` 本地 fixed data API 拒绝连接收口

记录时间：2026-06-17

问题来源：PM 从微信开发者工具调试器截图 `docs/runtime/pm-devtools-debugger-window-20260617.png` 看到 `pages/session-brief/index` Console 红错：

- `GET http://127.0.0.1:3221/api/v1/sessions/live?sessionId=session-1781507687012-e4343d&inviteCode=C56EVT net::ERR_CONNECTION_REFUSED`，调用栈 `operations.ts:719`。
- `POST http://127.0.0.1:3221/api/v1/user/auth/login net::ERR_CONNECTION_REFUSED`，调用栈 `social.ts:207`。

本轮边界：

- 只处理接口联调职责范围：本地 3221 fixed data 服务状态、健康检查、API base 切换口径和测试/前端交接步骤。
- 不 cleanup 当前 local / final / 009 / 011 样本。
- 不触碰 `pomer.cn` 官网项目、官网 PM2、官网 Nginx 或无关服务。
- 不泄露完整 token；本节只引用本地 session / inviteCode / token 后 8 位。

复核结论：

| 项 | 结论 |
| --- | --- |
| 报错直接原因 | 本轮开始时 `Get-NetTCPConnection -LocalPort 3221` 无监听，微信开发者工具仍命中 `runtime-api-base=http://127.0.0.1:3221/api/v1` 或等价本地配置，因此出现 `ERR_CONNECTION_REFUSED`。 |
| 本地 fixed data 是否仍可用 | 可用，但仅限复拍 2026-06-15 本地 `INT-DATA-001` 固定数据包：`session-1781507687012-e4343d` / `C56EVT`。 |
| 当前最终 / 线上样本默认口径 | 如果测试的是 006B / 009 / 011 线上 final 样本，应切回 `https://api.pomer.cn/api/v1`，不要继续使用 127.0.0.1。 |
| 本轮处理 | 已恢复本地 3221 服务，供当前报错页面继续读取本地 fixed data；同时给出切回线上 API base 的步骤。 |

本地 3221 恢复记录：

| 项 | 值 |
| --- | --- |
| 启动命令 | `set PORT=3221&& npm.cmd --prefix backend start > docs/runtime/pr-int-local-api-refused-013.out.log 2> docs/runtime/pr-int-local-api-refused-013.err.log` |
| 启动方式 | 本机隐藏 `cmd.exe` 后台进程；不涉及线上服务。 |
| 监听 PID | `32192` |
| 监听状态 | `::]:3221 Listen`，`OwningProcess=32192`。 |
| 日志 | `docs/runtime/pr-int-local-api-refused-013.out.log` 显示 `jiuzhuopanguan backend listening on port 3221`；`DEP0169 url.parse()` 为既有 Node 警告。 |

本地 fixed data 摘要：

| 项 | 值 |
| --- | --- |
| manifest | `docs/runtime/int-data-001-manifest.json` |
| sessionId | `session-1781507687012-e4343d` |
| inviteCode | `C56EVT` |
| briefId | `brief-1781507687042-d1990edd` |
| host profile | `user-1781507686650-a33705`，token 后 8 位 `a9f69589` |
| memberA profile | `user-1781507686651-a46952`，token 后 8 位 `9b36b0b6` |

恢复后只读 API 摘要：

| 请求 | 摘要 |
| --- | --- |
| `GET /api/v1/config/home` | HTTP 200，`code=0`。 |
| `GET /api/v1/sessions/live?sessionId=session-1781507687012-e4343d&inviteCode=C56EVT` | HTTP 200，`code=0`，返回 session `id=session-1781507687012-e4343d`、`inviteCode=C56EVT`、`joinedCount=3`、`stateText=进行中`。 |
| `GET /api/v1/session-briefs/brief-1781507687042-d1990edd` | HTTP 200，`code=0`，返回 `briefId=brief-1781507687042-d1990edd`。 |
| `GET /api/v1/sessions/session-1781507687012-e4343d/timeline` | HTTP 200，`code=0`，`nodes.length=5`。 |
| `POST /api/v1/user/auth/login` | 已可达；测试假 `loginCode` 返回 HTTP 502，业务提示“微信登录 code 无效或已过期...invalid code”，这证明不再是连接拒绝，但不代表登录通过。真实微信开发者工具登录需使用有效 `wx.login` code 和匹配 AppID。 |

测试 / 前端切换步骤：

| 场景 | API base 处理 |
| --- | --- |
| 继续复拍本地 `INT-DATA-001` fixed data | 微信开发者工具 Console 设置：`wx.setStorageSync('runtime-api-base', 'http://127.0.0.1:3221/api/v1')`；确认当前页面 query 使用 `sessionId=session-1781507687012-e4343d` / `briefId=brief-1781507687042-d1990edd`。 |
| 切回线上 final / 009 / 011 样本 | 微信开发者工具 Storage 删除 `runtime-api-base`，或 Console 执行：`wx.removeStorageSync('runtime-api-base')`；再执行 `wx.getStorageSync('runtime-api-base') || 'https://api.pomer.cn/api/v1'`，预期输出线上地址。 |
| 强制指定线上 API | 如测试需要显式写入，可执行：`wx.setStorageSync('runtime-api-base', 'https://api.pomer.cn/api/v1')`，并在证据中记录 Network host 为 `api.pomer.cn`。 |

当前注意事项：

- 如果页面 query 仍是 `session-1781507687012-e4343d` / `C56EVT`，这是本地 `INT-DATA-001` 样本，不应拿去请求 `api.pomer.cn` 并判定线上缺数据。
- 如果页面要验证 006B / 009 / 011 线上样本，应使用 `docs/runtime/pr-int-final-qa-api-summary-008.md` 中的线上 session / brief / report / expired / reviewMomentId，并清掉本地 API base 覆盖。
- 本地 3221 是当前机器临时服务窗口；若电脑重启或进程退出，需按上方启动命令恢复，或切回线上 API base。

### 3.24 `PR-INT-DUAL-FLOW-FIXTURE-014` 拍照记录 + 聚会账本双主线样本盘点

记录时间：2026-06-17

需求来源：`docs/party-recorder-redesign-requirements.md` 4.1 明确“拍照记录 + 酒桌记账 / 聚会账本”必须并行存在，并共同沉淀到分享页和分享截图保存。本节只做接口联调样本盘点、可复跑 query、API 摘要和缺口交接；不 cleanup final / 009 / 011 样本，不触碰 `pomer.cn` 官网项目，不泄露完整 token。

#### 3.24.1 当前结论

| 判断项 | 结论 |
| --- | --- |
| 是否已有照片 moments | 有。本地 `INT-DATA-001` 和线上 006B/009/011 均有 opening / highlight / private / review 等照片记录样本。 |
| 是否已有酒桌记账 / 聚会账本数据 | 部分有。当前只有 `drink_debt` 关键事件样本；成员账本计数 `debtCount/drinkCount/clearedCount` 均为 0，缺非零账本摘要。 |
| 是否已有“照片 + 账本”同一时间线 | 有。timeline / brief 的 `timelineNodeIds` 同时包含 moment 和 `drink_debt` event。 |
| 是否已有“照片 + 账本”共同导出到同一 ready 分享图 | 没有。当前 ready share task 的 `selectedNodeIds` 只包含 event，不包含照片 moment；不能证明联合分享图。 |
| 是否已有保存图能力 | 前端 `share-poster` / `share-preview` 有 `wx.saveImageToPhotosAlbum` 和 canvas 兜底能力，但缺使用“双主线联合样本”的预览框截图、保存点击和 Console/Network/storage 摘要。 |

#### 3.24.2 本地 fixed data 可复跑摘要

API base：`http://127.0.0.1:3221/api/v1`。仅用于本机 / 同 LAN fixed data 复拍，不代表线上。

| 类型 | ID / Query | 脱敏摘要 |
| --- | --- | --- |
| session | `session-1781507687012-e4343d` / invite `C56EVT` | `GET /sessions/live?...` 返回 `code=0`、`joinedCount=3`。 |
| 照片 moments | opening `moment-1781507687032-eb1806a4`；highlight `moment-1781507687034-93c8676b`；private `moment-1781507687036-c0cc62cc` | timeline 返回 4 条 moment 类节点，其中 private 在 host 视角为占位。 |
| 记账事件 | `event-1781507687041-e380feb7` | `eventType=drink_debt`、operator host、target memberA、`scoreDelta=1`、`caption=IT-MOMENTS-20260615 drink debt`。 |
| 成员账本计数 | host / memberA / memberB | `sessions/live` 返回三人 `debtCount=0`、`drinkCount=0`、`clearedCount=0`；不能证明非零账本摘要。 |
| brief | `briefId=brief-1781507687042-d1990edd&sessionId=session-1781507687012-e4343d` | `GET /session-briefs/{briefId}` 返回 `timelineNodeIds` 同时包含 moments 和 event。 |
| ready share task | `share-task-1781507687046-d1098582` | `status=ready`、`selectedNodeIds=["event-1781507687041-e380feb7"]`、有 PNG；仅证明事件可进入分享图，不证明照片 + 账本联合导出。 |
| share-poster query | `/pages/share-poster/index?briefId=brief-1781507687042-d1990edd&taskId=share-task-1781507687046-d1098582` | 可用于事件型 ready 分享图预览 / 保存按钮冒烟；不是双主线联合准出样本。 |
| session-brief query | `/pages/session-brief/index?briefId=brief-1781507687042-d1990edd&sessionId=session-1781507687012-e4343d` | 可用于复核同一 brief 的照片 + event 时间线展示。 |
| 记录 / 账本页 query | `/pages/live-record/index?sessionId=session-1781507687012-e4343d`；`/pages/table-mode/index?sessionId=session-1781507687012-e4343d` | 可检查入口和 UI，但当前账本计数为 0，不能证明“已喝 / 欠酒 / 消杯”非零状态。 |

#### 3.24.3 线上 final / 009 / 011 可复跑摘要

API base：`https://api.pomer.cn/api/v1`。完整 token 只在服务器私密文件中使用，公开摘要只记录 token 后 8 位。

| 类型 | ID / Query | 脱敏摘要 |
| --- | --- | --- |
| session | `session-1781584503517-c033e9` / invite `W58G7T` | `GET /sessions/live?...` 返回 `code=0`、`joinedCount=3`。 |
| 照片 moments | opening `moment-1781584503741-d53b131f`；highlight `moment-1781584503769-1a5b4d94`；private `moment-1781584503795-17a32c27`；009 reward opening `moment-1781586554926-ffc93c65`；011 review `moment-1781682962307-8169479c` | timeline 返回 7 个节点，照片记录覆盖 approved / pending / private / hidden / reward / review 多状态。 |
| 记账事件 | `event-1781584503850-94ad3aeb` | `eventType=drink_debt`、`caption=IT-MOMENTS-20260616-006B drink debt`。 |
| 成员账本计数 | host / memberA / memberB | `sessions/live` 返回三人 `debtCount=0`、`drinkCount=0`、`clearedCount=0`；缺非零账本摘要。 |
| brief | `briefId=brief-1781584503870-25d5edac&sessionId=session-1781584503517-c033e9` | `GET /session-briefs/{briefId}` 返回 `timelineNodeIds` 包含 4 个 moment + 1 个 event；注意 brief 尚未纳入 009/011 后续新增节点。 |
| ready share task | `share-task-1781584503902-a99a5211` | `status=ready`、`selectedNodeIds=["event-1781584503850-94ad3aeb"]`、有 PNG；仅事件型分享图，不是联合分享图。 |
| 009 report | `moment-report-it-moments-20260616-009` | 举报样本可用于 UGC / 后台处理，不属于账本样本。 |
| 009 expired task | `share-task-it-moments-20260616-009-expired` | 本轮只读复核发现当前公网状态已为 `pending`，说明 expired 原态可能已被 retry 消费；后续不得再当“未消费 expired 原态”通过证据。 |
| 011 reviewMomentId | `moment-1781682962307-8169479c` | dedicated 待审样本，可用于审核链路，不属于账本样本。 |

#### 3.24.4 双主线预览框矩阵建议

| 矩阵项 | 当前可用样本 | API / 页面 | 当前状态 |
| --- | --- | --- | --- |
| 拍照记录 | 本地 opening / highlight；线上 opening / highlight / 009 opening / 011 review | `moment-editor?sessionId=...&nodeType=opening`、`live-record?sessionId=...`、timeline API | 可测照片记录展示；提交新照片属写操作，需测试窗口记录。 |
| 酒桌记账 / 聚会账本 | 本地 / 线上各 1 条 `drink_debt` event；成员计数均 0 | `POST /sessions/:sessionId/events` 合同存在；`sessions/live` 有 `debtCount/drinkCount/clearedCount` 字段；`table-mode` 可展示账本行 | 只能测入口和事件展示；缺非零账本数据。 |
| 联合分享页 | brief timeline 同时包含 moment + event | `session-brief?briefId=...&sessionId=...` | 可测同一 brief 是否展示双主线；不能证明 ready 分享图同时包含两者。 |
| 保存分享图 | 事件型 ready task 可打开 `share-poster`；前端有保存能力 | `share-poster?briefId=...&taskId=...`，保存按钮触发 `wx.saveImageToPhotosAlbum` | 只能测事件型 ready 图保存；缺“照片 + 账本”联合 ready PNG。 |

#### 3.24.5 待补样本与责任方

| 缺口 | 需要补什么 | 责任方 |
| --- | --- | --- |
| 非零聚会账本 | 至少 1 个成员 `debtCount>0`，至少 1 个成员 `drinkCount>0`，可选 `clearedCount>0`；并保留对应 `drink_debt` / `drink_add` / `wheel_result` 事件。 | 后端/API 确认 `updateManagedSession` / `POST /sessions/:sessionId/events` 是否足以形成一致账本；前端在 `live-record` / `table-mode` 触发并持久化；测试记录 Network 摘要。 |
| 联合 ready share task | 创建新的 share task，`selectedNodeIds` 必须同时包含一个 approved 照片 moment 和一个账本 event，例如 `[openingMomentId, drinkDebtEventId]`；随后 process 到 `ready` 并保存 PNG。 | 后端/API 或接口联调在 PM 授权窗口执行；前端/测试复拍 share-poster 保存。 |
| 分享页账本高光字段 | 当前 brief / share task 只返回 timeline nodes，没有显式 `ledgerSummary` / `accountingHighlights` 字段；如 UI 要展示“欠酒王 / 已喝 / 消杯 / 账本榜单”，需明确字段来源。 | 后端/API 给字段合同或确认由前端从 `sessions/live.joinedPlayers` 聚合；前端实现展示；测试验收。 |
| 009 expired 原态 | 当前 009 expired task 已变 `pending`，不能继续作为 expired 原态样本。 | 后台 / 测试如已执行 retry，需回填 operationLogs 和状态变化证据；若仍需 expired 原态，后端/API 或接口联调另补新 expired 样本。 |

Warnings / skipped：

- 当前已有样本只能证明“照片 moments 与 drink_debt event 可共存于 timeline / brief”。
- 当前没有可准出的“双主线联合 ready 分享图”样本；不得把 event-only PNG 或仅页面入口写成联合分享通过。
- 当前成员账本计数均为 0；不得把 `drink_debt` 单事件写成完整聚会账本通过。
- 本轮未 cleanup、未新增线上写入、未触碰 `pomer.cn` 官网项目。

Cleanup / 残留口径：

| 范围 | 口径 |
| --- | --- |
| 本地 `INT-DATA-001` | 当前保留；如后续补联合分享样本，需按 manifest / taskId 精确清理，不得删除真实数据。 |
| 线上 006B / 009 / 011 | 当前保留；后续 cleanup 仍按 `docs/runtime/pr-int-final-qa-api-summary-008.md` 的 private manifest、prefix 和精确 ID 执行。 |
| 新增 dual-flow 样本 | 建议使用前缀 `IT-MOMENTS-20260617-014`，并单独登记 session / event / shareTask / PNG / operationLogs；未生成前保持 skipped。 |

### 3.25 `PR-INT-SHARE-FLOW-DATA-015` 分享流程照片 + 聚会账本联合样本

记录时间：2026-06-17。执行边界：只处理接口联调样本、固定数据、脱敏 API 摘要、线上 `api.pomer.cn` 接口状态和清理策略；不 cleanup final / 009 / 011 样本，不触碰 `pomer.cn` 官网项目，不泄露完整 token，不修改 PM 总进度。

#### 3.25.1 样本结论

| 判断项 | 结论 |
| --- | --- |
| 照片 moments | 已覆盖 2 条 approved 且允许 share 的照片节点：006B opening + 009 reward opening。 |
| 欠酒 / 已喝 / 加酒事件 | 已保留原 006B `drink_debt`，并新增 015 `drink_add` 事件。 |
| 关键事件 | 已新增 015 `wheel_result` 关键事件。 |
| 榜单 / 高光 | report `ranks` 已包含 `Ledger highlight` 与 `Photo highlight` 两条；照片高光使用 009 approved opening，避免 pending review 节点进入分享图。 |
| 聚会总结 / report / brief | 已刷新线上 brief，生成 report `report-1781685446506-044e40`。 |
| share task ready / failed | 已生成联合 ready task `share-task-1781685446105-ae6b6317`，并复用既有 failed task `share-task-1781584504132-3251bd01`。 |
| 保存图 | ready task PNG 已生成并可访问；poster 接口 HTTP 200，下载大小约 141724 bytes。 |

#### 3.25.2 API base 与页面 query

API base：`https://api.pomer.cn/api/v1`。本节全部面向 `api.pomer.cn`，未使用、未触碰 `pomer.cn` 官网。

| 页面 / 场景 | Query / URL | 用途 |
| --- | --- | --- |
| 聚会记录 / 账本共存 | `/pages/live-record/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T` | 查看照片 timeline、drink_debt、drink_add、wheel_result。 |
| 聚会账本页 | `/pages/table-mode/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T` | 查看非零账本计数：Member A 欠酒 2 / 已喝 1；Member B 欠酒 1 / 已喝 3 / 已清 1。 |
| 聚会简报 / 联合分享入口 | `/pages/session-brief/index?sessionId=session-1781584503517-c033e9&briefId=brief-1781584503870-25d5edac` | brief timeline 同时包含照片和账本/关键事件。 |
| ready 分享图 | `/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781685446105-ae6b6317` | 联合分享图预览、保存图按钮、保存成功路径。 |
| failed / 保存失败分支 | `/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781584504132-3251bd01` | failed 状态、错误提示、重试/保存失败 UI 分支。 |
| report 详情 | `/pages/report-detail/index?reportId=report-1781685446506-044e40` | 聚会总结、榜单/高光、分享页引用。实际页面路径以当前前端路由为准。 |

如微信开发者工具仍覆盖本地 API base，先清理 storage：

```js
wx.removeStorageSync('runtime-api-base')
wx.getStorageSync('runtime-api-base') || 'https://api.pomer.cn/api/v1'
```

#### 3.25.3 脱敏 API 摘要

| 类型 | ID / 字段 | 脱敏响应摘要 |
| --- | --- | --- |
| token | host/memberA/memberB | 只记录后 8 位：host `4afb1b00`、memberA `c1b1585a`、memberB `dc59b557`；完整 token 只在服务器私密文件中读取。 |
| session | `session-1781584503517-c033e9` / invite `W58G7T` | `GET /sessions/live` HTTP 200，joinedPlayers 3 人。 |
| 账本计数 | Member A / Member B | Member A：`debtCount=2`、`drinkCount=1`、`clearedCount=0`；Member B：`debtCount=1`、`drinkCount=3`、`clearedCount=1`。 |
| 照片节点 | `moment-1781584503741-d53b131f`、`moment-1781586554926-ffc93c65` | 两者均为 approved + share 可用节点，进入联合 ready task。 |
| 原欠酒事件 | `event-1781584503850-94ad3aeb` | `eventType=drink_debt`，006B 历史样本保留。 |
| 015 加酒事件 | `event-1781685326780-cf7f878a` | `eventType=drink_add`，target Member A，caption 前缀 `IT-MOMENTS-20260617-015`。 |
| 015 关键事件 | `event-1781685326801-d0dfe088` | `eventType=wheel_result`，target Member B，caption 前缀 `IT-MOMENTS-20260617-015`。 |
| brief | `brief-1781584503870-25d5edac` | 刷新后 timeline 节点数 `9`；上述 2 个照片节点 + 2 个 015 事件均存在。 |
| ready share task | `share-task-1781685446105-ae6b6317` | `status=ready`，`imageUrl=/uploads/moments/share-tasks/share-task-1781685446105-ae6b6317.png`，`selectedNodeIds` 同时包含 2 个照片 moment 和 2 个事件。 |
| failed share task | `share-task-1781584504132-3251bd01` | `status=failed`，`failedReason=share task has no visible nodes`，可用于 failed / 保存失败分支 UI。 |
| report | `report-1781685446506-044e40` | `GET /reports/{reportId}` HTTP 200，`eventCount=3`、`rankCount=2`。 |
| poster PNG | `GET /reports/report-1781685446506-044e40/poster.png` | HTTP 200，约 141724 bytes。 |

#### 3.25.4 warnings / skipped

- `moment-1781584503769-1a5b4d94` 仍是 pending review，高光照片不能进入 ready 分享图；本次联合 ready task 改用 009 approved opening，避免把待审节点当通过证据。
- `share-task-1781584504132-3251bd01` 是既有 failed 分支样本，不是 015 新建失败任务；用于测试 failed UI / 保存失败兜底可以，不能写成 015 新建失败任务通过。
- 015 账本非零计数通过 `PUT /sessions/:sessionId` 固化到 `sessions/live.joinedPlayers`；若前端 UI 需要独立 `ledgerSummary`、`accountingHighlights` 或按人聚合字段，当前接口未提供显式字段，需要后端/API 补合同，或前端明确从 joinedPlayers + timeline events 聚合。
- 线上 009 expired task 曾被其他流程改为 `pending`，不能再作为 expired 原态样本；本节 failed 分支只使用 `share-task-1781584504132-3251bd01`。
- 本轮未执行 cleanup，未删除 final / 009 / 011 / 015 数据，未触碰 `pomer.cn`。

#### 3.25.5 cleanup / 残留口径

| 范围 | 口径 |
| --- | --- |
| final 006B | 保留 session、brief、原 moments、原 `drink_debt`、原 ready/failed task；本轮只在同一 final session 上追加 015 账本计数、事件、ready task 和 report。 |
| 009 / 011 | 009 moment 与 011 dedicated reviewMomentId 均保留；015 ready task 引用 009 approved opening，但不 cleanup、不改 011。 |
| 015 新增残留 | 精确 ID：`event-1781685326780-cf7f878a`、`event-1781685326801-d0dfe088`、`share-task-1781685446105-ae6b6317`、PNG `/uploads/moments/share-tasks/share-task-1781685446105-ae6b6317.png`、`report-1781685446506-044e40`，以及 session joinedPlayers 的非零账本计数。 |
| 后续 cleanup | 除非 PM 明确派发清理任务，否则不得清理当前 final / 009 / 011 / 015 样本。若后续清理，必须按上述精确 ID 和 prefix 扫描，先导出证据，再清理，不允许按 session 粗删。 |

#### 3.25.6 下一步责任方

| 角色 | 下一步 |
| --- | --- |
| 前端 | 用上述 query 接入 UI/UX 分享流程页面，确认 `share-poster` ready / failed / 保存图按钮读取 `taskId`，并从 `sessions/live.joinedPlayers` 或后端新增字段展示账本高光。 |
| 测试 | 增加双主线预览框矩阵：拍照、记账、联合分享、保存图；Network 证据需包含 `sessions/live`、`session-briefs/{briefId}`、`share-image-tasks/{taskId}`、`reports/{reportId}`。 |
| UI/UX | 可使用 015 样本做酷炫分享流程视觉，不要用空态或 event-only PNG 伪装联合样本。 |
| 后端/API | 若产品要求显式账本聚合字段，补 `ledgerSummary/accountingHighlights` 或明确字段合同；当前 015 可先按 joinedPlayers + timeline events 联调。 |

### 3.26 `PR-INT-SHARE-FLOW-BE016-VERIFY-017` 后端 016 发布后接口复跑准备

记录时间：2026-06-17。PM 已说明：后端/API `PR-BE-SHARE-FLOW-LEDGER-CONTRACT-016` 已在本地实现 brief 账本聚合合同和 `dual_flow/includeLedger` 分享图支持，但尚未部署到 `api.pomer.cn`。本节只准备复跑命令、验收字段和待发布口径；未写线上 HTTP 通过证据，不 cleanup，不触碰 `pomer.cn` 官网项目，不泄露完整 token。

#### 3.26.1 当前状态

| 项目 | 结论 |
| --- | --- |
| 后端本地合同 | 已在 `backend/data/moments.js` 看到 `ledgerSummary/accountingHighlights/settlementSummary/ledgerRankings/eventHighlights/shareContentFilter` 聚合逻辑；`createShareImageTask` 已支持 `ledgerIncluded: payload.includeLedger === true || layoutMode === 'dual_flow'`。 |
| API 文档 | `docs/api-spec.md` 已列出 brief 新字段、空态规则、隐私过滤口径和 `POST /session-briefs/:briefId/share-image-tasks` 的 `layoutMode=dual_flow` / `includeLedger=true` 规则。 |
| 线上状态 | 待 DBA/运维发布到 `api.pomer.cn`；发布前不得写“线上字段已通过”。 |
| 复核样本 | 沿用 015：session `session-1781584503517-c033e9`、invite `W58G7T`、brief `brief-1781584503870-25d5edac`、ready task `share-task-1781685446105-ae6b6317`、failed task `share-task-1781584504132-3251bd01`。 |

#### 3.26.2 发布后验收字段

`GET /api/v1/session-briefs/brief-1781584503870-25d5edac` 发布后必须返回以下字段，且不能由前端伪造：

| 字段 | 015 样本期望值 / 验收口径 |
| --- | --- |
| `ledgerSummary.sessionId` | `session-1781584503517-c033e9`。 |
| `ledgerSummary.participantCount` | `3`。 |
| `ledgerSummary.ledgerCount` | 期望 `11`：debt `3` + drunk `4` + cleared `1` + addWine `2` + keyEvent `1`。 |
| `ledgerSummary.debtCups` | `3`，来自 Member A `2` + Member B `1`。 |
| `ledgerSummary.drunkCups` | `4`，来自 Member A `1` + Member B `3`。 |
| `ledgerSummary.addWineCount` | `2`，来自 015 `drink_add` 事件 `scoreDelta=2`。 |
| `ledgerSummary.debtEventCount` | 至少 `1`，来自原 006B `drink_debt`。 |
| `ledgerSummary.clearedCups` | `1`，来自 Member B。 |
| `ledgerSummary.keyEventCount` | `1`，来自 015 `wheel_result`。 |
| `ledgerSummary.hasLedgerData` | `true`。 |
| `ledgerSummary.visibilityScope` | `public_summary`。 |
| `ledgerSummary.generatedFrom` | 包含 `session-members` 与 `timeline-events`。 |
| `accountingHighlights` | 固定包含 `debt/drunk/add_wine/cleared` 四类；对应 value 应为 `3/4/2/1`，text 使用中性文案。 |
| `settlementSummary.status` | `open`。 |
| `settlementSummary.safeForPublic` | `true`。 |
| `ledgerRankings.debt/drink/cleared` | 数组；displayName 脱敏，不返回完整 token 或敏感个人明细。 |
| `eventHighlights` | 至少包含 `drink_debt`、`drink_add`、`wheel_result` 中的摘要；文案应中性。 |
| `shareContentFilter.allowedNodeIds` | 包含可分享照片 `moment-1781584503741-d53b131f`、`moment-1781586554926-ffc93c65` 以及公开事件节点。 |
| `shareContentFilter.filteredNodeIds` / `filteredNodes` | 应过滤 private / pending / hidden / 未授权内容，例如 pending highlight、private、hidden、011 pending review 等不得进入 PNG。 |

`GET /api/v1/share-image-tasks/share-task-1781685446105-ae6b6317` 仍可作为旧 ready task 回归样本；它是 015 创建的旧 layout 任务，不要求 retroactively 变成 `dual_flow`。016 发布后需要另建或复用 `layoutMode=dual_flow` 的任务来验证 `ledgerIncluded=true`。

#### 3.26.3 发布后复跑命令

以下命令只在 DBA/运维确认 `PR-OPS-SHARE-FLOW-BE016-DEPLOY-017` 已发布到 `api.pomer.cn` 后执行。完整 token 只从服务器私密文件读取，输出只打印尾号和字段摘要。

```powershell
$script = @'
const https = require('https')
const BASE = 'https://api.pomer.cn/api/v1/'
const token = process.env.INT_DATA_HOST_TOKEN
const briefId = 'brief-1781584503870-25d5edac'
const sessionId = 'session-1781584503517-c033e9'
const existingReadyTaskId = 'share-task-1781685446105-ae6b6317'
const failedTaskId = 'share-task-1781584504132-3251bd01'
const selectedNodeIds = [
  'moment-1781584503741-d53b131f',
  'moment-1781586554926-ffc93c65',
  'event-1781685326780-cf7f878a',
  'event-1781685326801-d0dfe088',
]

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(path, BASE)
    const data = body ? JSON.stringify(body) : null
    const r = https.request({
      method,
      hostname: u.hostname,
      port: 443,
      path: u.pathname + u.search,
      headers: {
        Accept: 'application/json',
        'X-JZP-User-Token': token,
        ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    }, (res) => {
      let chunks = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => { chunks += chunk })
      res.on('end', () => {
        let parsed = chunks
        try { parsed = chunks ? JSON.parse(chunks) : null } catch {}
        if (res.statusCode >= 400) {
          reject({ statusCode: res.statusCode, body: parsed })
          return
        }
        resolve(parsed && parsed.data !== undefined ? parsed.data : parsed)
      })
    })
    r.on('error', reject)
    if (data) r.write(data)
    r.end()
  })
}

(async () => {
  const brief = await req('GET', `session-briefs/${briefId}`)
  const oldReady = await req('GET', `share-image-tasks/${existingReadyTaskId}`)
  const failed = await req('GET', `share-image-tasks/${failedTaskId}`)
  const dualTask = await req('POST', `session-briefs/${briefId}/share-image-tasks`, {
    layoutMode: 'dual_flow',
    includeLedger: true,
    selectedNodeIds,
  })
  const processed = await req('POST', `share-image-tasks/${dualTask.id}/process`)

  console.log(JSON.stringify({
    ok: true,
    tokenTail: String(token || '').slice(-8),
    sessionId,
    brief: {
      id: brief.id,
      hasLedgerSummary: !!brief.ledgerSummary,
      ledgerSummary: brief.ledgerSummary,
      accountingHighlights: brief.accountingHighlights,
      settlementSummary: brief.settlementSummary,
      ledgerRankingsKeys: brief.ledgerRankings ? Object.keys(brief.ledgerRankings) : [],
      eventHighlights: brief.eventHighlights,
      shareContentFilter: {
        allowedCount: brief.shareContentFilter && brief.shareContentFilter.allowedNodeIds ? brief.shareContentFilter.allowedNodeIds.length : null,
        filteredCount: brief.shareContentFilter && brief.shareContentFilter.filteredNodeIds ? brief.shareContentFilter.filteredNodeIds.length : null,
        filteredNodeIds: brief.shareContentFilter ? brief.shareContentFilter.filteredNodeIds : null,
        notice: brief.shareContentFilter ? brief.shareContentFilter.notice : '',
      },
    },
    oldReadyTask: {
      id: oldReady.id,
      status: oldReady.status,
      layoutMode: oldReady.layoutMode,
      ledgerIncluded: oldReady.ledgerIncluded === true,
      imageUrl: oldReady.imageUrl,
    },
    failedTask: {
      id: failed.id,
      status: failed.status,
      failedReason: failed.failedReason || '',
    },
    dualFlowTask: {
      id: processed.id,
      status: processed.status,
      layoutMode: processed.layoutMode,
      ledgerIncluded: processed.ledgerIncluded === true,
      imageUrl: processed.imageUrl,
      selectedNodeIds: processed.selectedNodeIds,
    },
  }, null, 2))
})().catch((error) => {
  console.error(JSON.stringify({ ok: false, error }, null, 2))
  process.exit(1)
})
'@
$b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($script))
$remote = @"
set -euo pipefail
cd /www/wwwroot/jiuzhuopanguan-git/backend
set -a
. /www/backup/jiuzhuopanguan/pr-int-db-generated-fixture-run-006-20260616123313/tokens.env
set +a
node -e "eval(Buffer.from('$b64','base64').toString('utf8'))"
"@
$remote | ssh pomer.cn "bash -s"
```

PNG 原图二次校验命令，需将 `<dual-flow-task-id>` 替换为上一步输出：

```powershell
ssh pomer.cn 'curl -sk -o /dev/null -w "dual_flow_png_http=%{http_code} size=%{size_download}\n" "https://api.pomer.cn/uploads/moments/share-tasks/<dual-flow-task-id>.png"'
```

#### 3.26.4 验收通过 / 失败判定

| 项目 | 通过标准 | 失败 / 待发布口径 |
| --- | --- | --- |
| brief 新字段 | `ledgerSummary/accountingHighlights/settlementSummary/ledgerRankings/eventHighlights/shareContentFilter` 全部存在，且 015 期望值匹配。 | 任一字段缺失：记录为 `待后端 016 发布或发布未生效`，不得由前端空数据替代。 |
| 公开分享过滤 | `allowedNodeIds` 只含公开、审核通过、允许分享的节点；`filteredNodeIds` 覆盖 private、pending、hidden 或未授权节点。 | 待审/私密/hidden 节点进入 allowed 或 PNG：退回后端/API + UGC。 |
| 旧 ready task | `share-task-1781685446105-ae6b6317` 仍可 GET，`status=ready`，PNG 仍可访问。 | 旧样本不可读：先记录回归风险，不 cleanup。 |
| 新 dual flow task | POST `layoutMode=dual_flow` + `includeLedger=true` 返回 `ledgerIncluded=true`，process 后 `status=ready` 且有 PNG。 | `ledgerIncluded` 缺失、仍为 timeline、PNG 无账本区块或 process 失败：退回后端/API。 |
| failed 分支 | `share-task-1781584504132-3251bd01` 仍为 `failed`，错误原因可读。 | 状态被 retry 改写：记录 warning，需另补 failed 样本。 |

#### 3.26.5 cleanup / 残留口径

- 发布前不执行任何线上写入；本节命令仅待发布后复跑。
- 发布后 `dual_flow/includeLedger` 验证会新增或复用一个 `layoutMode=dual_flow` share task；必须在回包中登记新 taskId、PNG 路径和 `ledgerIncluded` 状态。
- 除非 PM 单独派发 cleanup，不得清理 final / 009 / 011 / 015 / 017 样本。
- 如后续 cleanup，必须按精确 ID 和 `layoutMode=dual_flow` 扫描，先导出 HTTP 摘要和 PNG 证据，再清理；不得按 session 粗删。

#### 3.26.6 下一步责任方

| 角色 | 下一步 |
| --- | --- |
| DBA/运维 | 等 PM 确认发布窗口后，只发布 `api.pomer.cn` / `jiuzhuopanguan-backend` 的后端 016；记录备份、PM2、smoke、回滚，保护 `pomer.cn` 官网。 |
| 接口联调 | 发布后执行 3.26.3 命令，回填 HTTP 摘要、字段样例、dual flow taskId、PNG 状态、warnings/skipped。 |
| 后端/API | 若字段缺失、数值不符或 PNG 未含账本区块，按 016 合同修复，不要求前端兜底伪造。 |
| 前端/测试/UGC | 等接口联调复跑后，使用 brief 新字段和 `ledgerIncluded=true` task 做预览框、保存图和传播隐私门禁复测。 |

### 3.27 `PR-INT-SHARE-FLOW-BE016-VERIFY-017-RUN` 后端 016 线上接口复跑

记录时间：2026-06-17。执行边界：DBA/运维已回包 `PR-OPS-SHARE-FLOW-BE016-DEPLOY-017`，后端 016 已发布到 `api.pomer.cn`，备份路径 `/www/backup/jiuzhuopanguan/PR-OPS-SHARE-FLOW-BE016-DEPLOY-017/backend-be016-before-20260617171431.tgz`。本节只复跑 `https://api.pomer.cn/api/v1` / `jiuzhuopanguan` 后端接口证据；未修改 PM 总台账、团队公告、派发队列；未触碰 `pomer.cn` 官网；未 cleanup；未泄露完整 token；不得写上线通过。

#### 3.27.1 复跑命令

本轮通过服务器私密 token 文件执行只读 HTTP 复核，完整 token 未输出，只记录后 8 位。

```powershell
$script = '<本节复跑脚本：GET session-briefs/brief-1781584503870-25d5edac；GET share-image-tasks/{ready,failed,dualFlow}；GET PNG 静态 URL；host/member/outsider/no-token 权限对照>'
$b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($script))
$remote = @"
set -euo pipefail
cd /www/wwwroot/jiuzhuopanguan-git/backend
set -a
. /www/backup/jiuzhuopanguan/pr-int-db-generated-fixture-run-006-20260616123313/tokens.env
set +a
node -e "eval(Buffer.from('$b64','base64').toString('utf8'))"
"@
$remote | ssh pomer.cn "bash -s"
```

脱敏 token 尾号：

| 身份 | token 后 8 位 | 本轮用途 |
| --- | --- | --- |
| host | `4afb1b00` | brief / task / PNG 主复核。 |
| memberA | `c1b1585a` | 成员身份 task 查询对照。 |
| memberB | `dc59b557` | 015 样本成员尾号保留。 |
| outsider | `f9118246` | 非成员权限错误复现。 |
| QA 当前 storage | `c418e86ad` | QA 13.16.42 预览框记录；不属于 015 样本 host/member 尾号。 |

#### 3.27.2 brief 字段摘要

请求：`GET https://api.pomer.cn/api/v1/session-briefs/brief-1781584503870-25d5edac`，header `X-JZP-User-Token: <host-token>`。

| 字段 | 线上响应摘要 |
| --- | --- |
| HTTP | `200` |
| `id` | `brief-1781584503870-25d5edac` |
| `sessionId` | `session-1781584503517-c033e9` |
| `fieldsPresent` | `ledgerSummary/accountingHighlights/settlementSummary/ledgerRankings/eventHighlights/shareContentFilter` 全部存在。 |
| `ledgerSummary` | `participantCount=3`、`ledgerCount=11`、`debtCups=3`、`drunkCups=4`、`addWineCount=2`、`debtEventCount=1`、`clearedCups=1`、`keyEventCount=1`、`hasLedgerData=true`、`visibilityScope=public_summary`、`generatedFrom=["session-members","timeline-events"]`。 |
| `accountingHighlights` | 四项：`debt=3`、`drunk=4`、`add_wine=2`、`cleared=1`，文案为中性“待处理记录/完成记录/加酒记录/已消记录”。 |
| `settlementSummary` | `status=open`、`safeForPublic=true`、`text=本场已记录 11 条账本高光，还有 3 条待处理记录。` |
| `ledgerRankings` | `debt/drink/cleared` 均为数组；displayName 为 `成员2/成员3` 等脱敏称谓，不返回 token。 |
| `eventHighlights` | 3 条：`wheel_result`、`drink_add`、`drink_debt`，文案分别为“记录了一条关键互动 / 新增一条加酒记录 / 新增一条待处理记录”。 |
| `shareContentFilter` | `allowedCount=5`、`filteredCount=4`；allowed 包含 `moment-1781584503741-d53b131f`、`moment-1781586554926-ffc93c65`、`event-1781584503850-94ad3aeb`、`event-1781685326780-cf7f878a`、`event-1781685326801-d0dfe088`。 |
| `filteredNodeIds` | `moment-1781584503769-1a5b4d94`、`moment-1781584503795-17a32c27`、`moment-1781584503823-56dc9214`、`moment-1781682962307-8169479c`。过滤原因：`not_approved` 或 `private_or_not_visible`。 |

`GET /sessions/live?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T` 同轮响应 HTTP `200`，`joinedCount=3`；成员计数仍为 Member A `debt=2/drink=1/cleared=0`、Member B `debt=1/drink=3/cleared=1`。

#### 3.27.3 share task / PNG 摘要

| task | host 查询 | memberA 查询 | outsider 查询 | no token 查询 | PNG |
| --- | --- | --- | --- | --- | --- |
| ready `share-task-1781685446105-ae6b6317` | HTTP `200`，`status=ready`，`layoutMode=IT-MOMENTS-20260617-015-dual-flow-approved`，`ledgerIncluded=false`，`selectedNodeIds` 含 2 个照片 + 2 个事件。 | HTTP `200`，`status=ready`。 | HTTP `403`，`code=403`，`message=not session member`。 | HTTP `401`，`code=401`，`message=unauthorized`。 | `https://api.pomer.cn/uploads/moments/share-tasks/share-task-1781685446105-ae6b6317.png`，HTTP `200`，`image/png`，约 `218122` bytes。 |
| failed `share-task-1781584504132-3251bd01` | HTTP `200`，`status=failed`，`layoutMode=IT-MOMENTS-20260616-006B-failed`，`failedReason=share task has no visible nodes`，无 `imageUrl`。 | HTTP `200`，`status=failed`。 | HTTP `403`，`message=not session member`。 | HTTP `401`，`message=unauthorized`。 | 无 PNG，符合 failed 样本。 |
| dual_flow `share-task-1781687817395-94cf4452` | HTTP `200`，`status=ready`，`layoutMode=dual_flow`，`ledgerIncluded=true`，`selectedNodeIds` 含 2 个照片 + 3 个事件。 | HTTP `200`，`status=ready`。 | HTTP `403`，`message=not session member`。 | HTTP `401`，`message=unauthorized`。 | `https://api.pomer.cn/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png`，HTTP `200`，`image/png`，约 `216413` bytes。 |

结论：后端 016 线上 brief 聚合字段与 `dual_flow/includeLedger` task 合同已可通过 host/member 样本身份读取；旧 ready task 是 015 旧 layout 样本，不要求 `ledgerIncluded=true`；017 的 `dual_flow` PNG 证据以 `share-task-1781687817395-94cf4452` 为准。

#### 3.27.4 QA 13.16.42 退回判断

| QA 现象 | 接口联调判断 |
| --- | --- |
| `shareTask=null`、`readyShareImageUrl=""` | host/memberA 直接 GET ready / failed / dual_flow task 均可返回 HTTP 200；接口合同有 task。QA 预览框未落 data 更像当前 storage 身份未切到 015 样本成员，或前端 catch 后未把错误态和 task 查询结果区分展示。 |
| `not session member` | 已复现为非成员权限保护：outsider token 查询任一 task 均 HTTP `403` / `message=not session member`；无 token 为 HTTP `401` / `unauthorized`。QA storage token 后 8 位 `c418e86ad` 不匹配 015 host/memberA/memberB 尾号 `4afb1b00/c1b1585a/dc59b557`，所以优先判定为样本登录态 / storage token 问题，不是 task 不存在。 |
| failed task 未触发失败态 | 后端 `share-task-1781584504132-3251bd01` 返回 HTTP `200`、`status=failed`、`failedReason=share task has no visible nodes`。若页面仍 `saveState=idle`、`shareTask=null`，前端需复核 `getManagedShareImageTask` 成功/失败分支和 `applyShareTask` 调用。 |
| `ledgerIncluded=true` 前端 data 缺失风险 | 本地前端 `RemoteShareImageTask`、`ManagedShareImageTask`、`normalizeShareImageTask` 尚未声明 / 映射 `ledgerIncluded`。即使接口返回 `ledgerIncluded=true`，页面 data 可能无法证明该字段；前端需补类型和 normalize 映射。 |
| brief 新字段前端 data 缺失风险 | 本地前端 `RemoteSessionBrief`、`ManagedSessionBrief`、`normalizeSessionBrief` 尚未声明 / 映射 `ledgerSummary/accountingHighlights/settlementSummary/ledgerRankings/eventHighlights/shareContentFilter`。分享预览若仍靠前端聚合，测试不能用页面 data 证明后端 016 合同已接入。 |

#### 3.27.5 给前端 / 测试的复跑前置

API base 必须是线上：

```js
wx.setStorageSync('runtime-api-base', 'https://api.pomer.cn/api/v1')
```

测试样本身份必须切到 015 成员态之一，不能使用 QA 本轮的 `c418e86ad` 身份复核成员受限接口。可复跑页面：

| 页面 | query | 预期 |
| --- | --- | --- |
| session brief | `/pages/session-brief/index?sessionId=session-1781584503517-c033e9&briefId=brief-1781584503870-25d5edac` | brief 可加载；如要证明 016 字段，前端需把 brief 聚合字段映射到 page data。 |
| old ready poster | `/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781685446105-ae6b6317` | 旧 ready PNG 可保存；`ledgerIncluded=false` 属预期。 |
| dual flow poster | `/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452` | 017 推荐保存图样本；应显示 `layoutMode=dual_flow`、`ledgerIncluded=true`、ready PNG。 |
| failed poster | `/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781584504132-3251bd01` | 应进入 failed / retry UI，错误原文 `share task has no visible nodes`。 |

测试如果继续使用非成员 token，应把 HTTP `403 not session member` 作为权限反例，不应写成 ready task 数据缺失。

#### 3.27.6 warnings / skipped

- 本轮未创建新的 `dual_flow/includeLedger` task，直接复核 DBA/运维已创建的 `share-task-1781687817395-94cf4452`；无新增 017 写入残留。
- 旧 ready task `share-task-1781685446105-ae6b6317` 是 015 旧 layout，`ledgerIncluded=false` 是预期，不是 016 回归失败。
- `share-task-1781687817395-94cf4452` 是 017 推荐给 QA/前端复测的 `dual_flow` ready PNG。
- 接口证据不等于预览框通过；前端仍需修登录态注入、brief/task 新字段映射、failed UI、保存成功/失败状态和回流 data。
- 未 cleanup final / 009 / 011 / 015 / 017 样本；未触碰 `pomer.cn` 官网；未写上线通过。

#### 3.27.7 cleanup / 残留口径

| 范围 | 口径 |
| --- | --- |
| 015 样本 | 保留 session `session-1781584503517-c033e9`、brief、moments、events、old ready/failed task、report；不得清理。 |
| 017 dual_flow 样本 | 保留 `share-task-1781687817395-94cf4452` 与 PNG `/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png`，作为后端 016 发布后验收样本。 |
| 后续 cleanup | 需 PM 单独派发；按精确 taskId / PNG / prefix 导出证据后处理，不得按 session 粗删。 |

### 3.28 `PR-INT-SHARE-FLOW-MEMBER-STORAGE-019` 015 样本成员 DevTools storage 前置

记录时间：2026-06-17。执行边界：只提供 QA 可复跑的样本成员 storage 前置方案；只面向 `api.pomer.cn`；不修改 PM 总台账、团队公告、派发队列；不 cleanup 009 / 011 / final / share 样本；不触碰 `pomer.cn` 官网；不在文档或日志输出完整 token。

#### 3.28.1 问题结论

QA `PR-QA-SHARE-FLOW-P0-018-PARTIAL-VERIFY` 已确认局部修复，但当前 DevTools storage token 后 8 位为 `c418e86ad`，不是 015 样本成员。接口联调 3.27 已证明：

| 身份 | token 后 8 位 | ready / failed / dual_flow task |
| --- | --- | --- |
| host | `4afb1b00` | HTTP `200`。 |
| memberA | `c1b1585a` | HTTP `200`。 |
| memberB | `dc59b557` | 样本成员尾号，保留备用。 |
| outsider | `f9118246` | HTTP `403`，`message=not session member`。 |
| no token | 空 | HTTP `401`，`message=unauthorized`。 |
| QA 当前 storage | `c418e86ad` | 非 015 样本成员；ready / failed 页面出现 `not session member` 属权限反例，不是 task 缺失。 |

因此 019 的目标不是新增样本，而是让 QA 在微信开发者工具内临时注入 015 host/member storage，再复测 ready task、PNG 和保存按钮前置。

#### 3.28.2 storage key 与预期值

| key | 预期 | 说明 |
| --- | --- | --- |
| `runtime-api-base` | `https://api.pomer.cn/api/v1` | 强制使用线上 API。 |
| `jzp-user-token` | 015 host 或 memberA 完整 token，仅写入 DevTools storage；日志只允许输出后 8 位。 | 这是 `operations.ts` 请求头 `X-JZP-User-Token` 的来源。 |
| `social-current-profile-id` | host `user-1781583974510-1a52e6` 或 memberA `user-1781583974512-aedd1b` | 页面展示/本地身份辅助。 |
| `social-current-profile` | `{ id, name, avatarUrl: "", signature: "", identityTag: "" }` | 避免页面显示空身份；认证仍以 `jzp-user-token` 为准。 |
| `social-user-session-token` | 建议删除 | 当前代码不使用该 key 做 API 鉴权，保留旧值容易误导证据。 |

注意：现有 `npm.cmd run wechat:auto -- ... --storage` 会原样读取 storage，可能把完整 `jzp-user-token` 打进日志。测试记录 token 时必须使用本节的安全摘要脚本，或手工只写后 8 位；不要把 `--storage` 结果原样贴入报告。

#### 3.28.3 安全注入命令

用途：从服务器私密 token 文件读取 015 host/member token，注入本机微信开发者工具 storage；脚本输出只包含 token 后 8 位。`$Identity` 可取 `host` 或 `memberA`，默认建议 `host`。

```powershell
$Identity = 'host' # 可选：host / memberA
$tokenJson = ssh pomer.cn "bash -lc 'set -euo pipefail; set -a; . /www/backup/jiuzhuopanguan/pr-int-db-generated-fixture-run-006-20260616123313/tokens.env; set +a; node -e \"const id=process.argv[1]; const map={host:{token:process.env.INT_DATA_HOST_TOKEN,profileId:\\\"user-1781583974510-1a52e6\\\",name:\\\"PR Seed Host\\\"},memberA:{token:process.env.INT_DATA_MEMBER_A_TOKEN,profileId:\\\"user-1781583974512-aedd1b\\\",name:\\\"PR Seed Member A\\\"}}; const item=map[id]; if(!item||!item.token) process.exit(2); console.log(JSON.stringify(item));\" $Identity'"
$tokenData = $tokenJson | ConvertFrom-Json
$env:JZP_QA_TOKEN = [string]$tokenData.token
$env:JZP_QA_IDENTITY = $Identity
$env:JZP_QA_PROFILE_ID = [string]$tokenData.profileId
$env:JZP_QA_PROFILE_NAME = [string]$tokenData.name
$env:JZP_QA_API_BASE = 'https://api.pomer.cn/api/v1'
$env:WECHAT_AUTOMATOR_PORT = '9420'
node -e "const automator=require('miniprogram-automator'); (async()=>{const mp=await automator.connect({wsEndpoint:'ws://127.0.0.1:'+(process.env.WECHAT_AUTOMATOR_PORT||'9420')}); const token=process.env.JZP_QA_TOKEN||''; const profile={id:process.env.JZP_QA_PROFILE_ID,name:process.env.JZP_QA_PROFILE_NAME,avatarUrl:'',signature:'',identityTag:''}; await mp.callWxMethod('setStorageSync','runtime-api-base',process.env.JZP_QA_API_BASE); await mp.callWxMethod('setStorageSync','jzp-user-token',token); await mp.callWxMethod('setStorageSync','social-current-profile-id',profile.id); await mp.callWxMethod('setStorageSync','social-current-profile',profile); await mp.callWxMethod('removeStorageSync','social-user-session-token').catch(()=>{}); console.log(JSON.stringify({ok:true,identity:process.env.JZP_QA_IDENTITY,apiBase:process.env.JZP_QA_API_BASE,profileId:profile.id,profileName:profile.name,tokenTail:token.slice(-8),storageKeys:['runtime-api-base','jzp-user-token','social-current-profile-id','social-current-profile']})); await mp.disconnect();})().catch((e)=>{console.error(JSON.stringify({ok:false,message:e.message}));process.exit(1);})"
Remove-Item Env:\JZP_QA_TOKEN -ErrorAction SilentlyContinue
Remove-Item Env:\JZP_QA_IDENTITY -ErrorAction SilentlyContinue
Remove-Item Env:\JZP_QA_PROFILE_ID -ErrorAction SilentlyContinue
Remove-Item Env:\JZP_QA_PROFILE_NAME -ErrorAction SilentlyContinue
```

预期安全输出：

| identity | 预期 `tokenTail` | 预期 `profileId` |
| --- | --- | --- |
| `host` | `4afb1b00` | `user-1781583974510-1a52e6` |
| `memberA` | `c1b1585a` | `user-1781583974512-aedd1b` |

如果命令失败：

| 失败点 | 原因 / 处理 |
| --- | --- |
| `automator.connect` 失败 | 微信开发者工具自动化端口未启动；先按测试计划启动 9420 自动化，再重跑。 |
| SSH 读取 token 失败 | 需要接口联调 / 运维确认服务器私密 token 文件仍存在；不得向公共文档复制完整 token。 |
| 输出 tokenTail 不是 `4afb1b00` 或 `c1b1585a` | 不得继续跑 ready 样本；先清理错误 storage 并重注入。 |

#### 3.28.4 安全 storage 摘要命令

不要使用 `wechat:auto --storage` 原样输出完整 token。使用以下命令只打印后 8 位：

```powershell
node -e "const automator=require('miniprogram-automator'); (async()=>{const mp=await automator.connect({wsEndpoint:'ws://127.0.0.1:9420'}); const token=String(await mp.callWxMethod('getStorageSync','jzp-user-token')||''); const apiBase=await mp.callWxMethod('getStorageSync','runtime-api-base'); const profileId=await mp.callWxMethod('getStorageSync','social-current-profile-id'); console.log(JSON.stringify({ok:true,apiBase,profileId,tokenTail:token.slice(-8),tokenPresent:Boolean(token)})); await mp.disconnect();})().catch((e)=>{console.error(JSON.stringify({ok:false,message:e.message}));process.exit(1);})"
```

预期：

```json
{"ok":true,"apiBase":"https://api.pomer.cn/api/v1","profileId":"user-1781583974510-1a52e6","tokenTail":"4afb1b00","tokenPresent":true}
```

memberA 身份时 `profileId=user-1781583974512-aedd1b`、`tokenTail=c1b1585a`。

#### 3.28.5 QA 页面复跑 query

注入 host/member storage 后再执行页面复测。为避免 token 泄露，以下命令不要加 `--storage`；storage 证据用 3.28.4 的安全摘要命令单独记录。

| 场景 | 命令 | 预期 |
| --- | --- | --- |
| ready task 打开 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781685446105-ae6b6317" --wait 6000 --data photoHighlights,accountingHighlights,keyEvents,shareSummary,saveState,errorText,readyShareImageUrl,shareTask` | `shareTask.status=ready`，`readyShareImageUrl` 指向 `/uploads/moments/share-tasks/share-task-1781685446105-ae6b6317.png` 或等效完整 URL；`errorText` 不应为 `not session member`。 |
| ready 保存按钮前置 | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781685446105-ae6b6317" --selector .poster-primary-action --wait 5000 --data saveState,errorText,posterImagePath,readyShareImageUrl,shareTask` | DevTools 预览阶段可验证按钮不因 403 阻塞；真机相册权限不在本轮覆盖。 |
| failed task 真实失败态 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781584504132-3251bd01" --wait 6000 --data saveState,errorText,readyShareImageUrl,shareTask` | `shareTask.status=failed`，`shareTask.failedReason=share task has no visible nodes`；不应显示 `not session member`。 |
| dual_flow ready 补充 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --wait 6000 --data saveState,errorText,readyShareImageUrl,shareTask` | `shareTask.status=ready`；前端如已映射 `ledgerIncluded`，应可看到 `ledgerIncluded=true`。 |

ready PNG 直接 URL：

| task | PNG URL | 预期 |
| --- | --- | --- |
| old ready | `https://api.pomer.cn/uploads/moments/share-tasks/share-task-1781685446105-ae6b6317.png` | HTTP `200`，`image/png`。 |
| dual_flow ready | `https://api.pomer.cn/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png` | HTTP `200`，`image/png`。 |

#### 3.28.6 权限反例保留

| 场景 | 前置 | 预期 |
| --- | --- | --- |
| no-token | `wx.removeStorageSync('jzp-user-token')`，保留线上 API base | task 查询 HTTP `401`，`message=unauthorized`；页面可显示登录态/权限错误，但不能写 ready 合同失败。 |
| outsider | 注入 outsider token 尾号 `f9118246`，或使用当前非样本成员 token `c418e86ad` | task 查询 HTTP `403`，`message=not session member`；这是权限反例，不用于验证 ready PNG / 保存按钮前置。 |

如 QA 继续用 `c418e86ad` 复测 ready/failed，只能记录权限反例；不得把 `shareTask=null` 写成接口 ready task 缺失。

#### 3.28.7 cleanup / 残留口径

| 范围 | 口径 |
| --- | --- |
| DevTools storage | 本节只改本机微信开发者工具 storage。复测结束可执行 `wx.removeStorageSync('jzp-user-token')`、`wx.removeStorageSync('social-current-profile-id')`、`wx.removeStorageSync('social-current-profile')`，或重新登录真实账号。 |
| 线上样本 | 不新增、不删除、不 cleanup；继续保留 final / 009 / 011 / 015 / 017 样本。 |
| 日志 | 只允许记录 token 后 8 位、profileId、API base、page data 摘要；不得贴完整 token 或原样 `--storage` 输出。 |

#### 3.28.8 下一步责任方

| 角色 | 下一步 |
| --- | --- |
| QA | 先跑 3.28.3 注入 host/member storage，再跑 3.28.4 安全摘要，最后跑 3.28.5 页面矩阵；结果仍不得写上线通过。 |
| 前端 | 若成员 storage 下仍 `shareTask=null` 或 `readyShareImageUrl=""`，复核 `getManagedShareImageTask`、`applyShareTask`、`ledgerIncluded` 和 016 brief 字段 normalize。 |
| 接口联调 | 如 SSH token 文件缺失或注入脚本失败，回收失败原文并交运维/接口联调补安全 handoff；不在公共文档写完整 token。 |

### 3.29 `PR-INT-SHARE-FLOW-022-STORAGE-SUPPORT` 022 首屏复测 storage 前置支持

记录时间：2026-06-17。执行边界：只为 QA 022 复测提供接口联调 / 测试前置支持；不改业务源码，不改 PM / 测试 / UIUX 文档，不清理、不写库、不部署、不重启；目标只限 `api.pomer.cn` / `jiuzhuopanguan` 后端服务，不触碰 `pomer.cn` 官网。

#### 3.29.1 推荐复测路径确认

前端计划 14.35 已明确 022 复测路径：

```text
/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452
```

接口联调只读复核结论：该路径仍适用，理由如下：

| 项 | 只读复核摘要 |
| --- | --- |
| API base | `https://api.pomer.cn/api/v1` |
| taskId | `share-task-1781687817395-94cf4452` |
| HTTP | `GET /share-image-tasks/{taskId}` -> `200` |
| status | `ready` |
| layout | `layoutMode=dual_flow` |
| ledger | `ledgerIncluded=true` |
| imageUrl | `/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png` |
| PNG | `https://api.pomer.cn/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png` -> HTTP `200`，`content-type=image/png` |
| selected nodes | `selectedNodeCount=5`，覆盖照片 + 账本事件。 |

不建议用旧 ready task `share-task-1781685446105-ae6b6317` 作为 022 主路径；它是 015 旧 layout 样本，`ledgerIncluded=false` 属预期，只适合回归旧 ready PNG。

#### 3.29.2 本轮只读接口验证命令

本轮为了确认 022 推荐 task 仍可用，执行了只读验证。完整 token 未输出，只记录 host token 后 8 位 `4afb1b00`。

```powershell
# 只读：读取私密 host token 后请求 api.pomer.cn，不写库、不清理、不部署
ssh pomer.cn "<读取 /www/backup/jiuzhuopanguan/pr-int-db-generated-fixture-run-006-20260616123313/tokens.env 内 INT_DATA_HOST_TOKEN；GET https://api.pomer.cn/api/v1/share-image-tasks/share-task-1781687817395-94cf4452；GET https://api.pomer.cn/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png；仅输出 tokenTail/status/layoutMode/ledgerIncluded/imageUrl/PNG 状态>"
```

响应摘要：

```json
{
  "apiBase": "https://api.pomer.cn/api/v1",
  "tokenTail": "4afb1b00",
  "task": {
    "http": 200,
    "id": "share-task-1781687817395-94cf4452",
    "status": "ready",
    "layoutMode": "dual_flow",
    "ledgerIncluded": true,
    "imageUrl": "/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png",
    "selectedNodeCount": 5
  },
  "png": {
    "http": 200,
    "contentType": "image/png",
    "url": "https://api.pomer.cn/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png"
  }
}
```

#### 3.29.3 QA storage/token 安全摘要

沿用 3.28 的安全注入方案。QA/PM 在测试窗口执行时，只允许日志记录 token 后 8 位，不得输出完整 token。

| 身份 | token 后 8 位 | profileId | 用途 |
| --- | --- | --- | --- |
| host | `4afb1b00` | `user-1781583974510-1a52e6` | 推荐默认身份；可读 brief/task/PNG。 |
| memberA | `c1b1585a` | `user-1781583974512-aedd1b` | 成员态备选；可读 brief/task/PNG。 |
| outsider | `f9118246` | 非 015 成员 | 权限反例；应返回 `403 not session member`。 |
| no-token | 空 | 空 | 权限反例；应返回 `401 unauthorized`。 |

必须设置 / 核对的 DevTools storage：

| key | 预期 |
| --- | --- |
| `runtime-api-base` | `https://api.pomer.cn/api/v1` |
| `jzp-user-token` | host 或 memberA 完整 token，仅写入 DevTools storage；日志只写 token 后 8 位。 |
| `social-current-profile-id` | host 或 memberA 的 profileId。 |
| `social-current-profile` | 与 profileId 对应的本地 profile 对象。 |

安全摘要命令仍用 3.28.4：只输出 `apiBase/profileId/tokenTail/tokenPresent`。不要把 `npm.cmd run wechat:auto --storage` 的原始 storage 输出贴进测试报告，因为它可能包含完整 `jzp-user-token`。

#### 3.29.4 给 QA 的 022 复测命令建议

先执行 3.28.3 的 host/member storage 安全注入，再执行 3.28.4 的安全 storage 摘要，确认 tokenTail 是 `4afb1b00` 或 `c1b1585a`。随后复测 022 首屏。

```powershell
npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --wait 6000 --data photoHighlights,accountingHighlights,keyEvents,shareSummary,ledgerIncluded,taskIncludeLedger,taskLayoutMode,readyShareImageUrl,shareTask,saveState,errorText
```

建议 selector：

```powershell
npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --selector .poster-stage-primary --wait 3000 --data ledgerIncluded,taskIncludeLedger,taskLayoutMode,readyShareImageUrl,shareTask,saveState,errorText
npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --selector .poster-primary-action --wait 5000 --data saveState,errorText,posterImagePath,readyShareImageUrl,shareTask
npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --selector .poster-state-card-warn --wait 3000 --data saveState,errorText,shareTask
npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --selector .poster-return-card --wait 3000 --data saveState,errorText,shareTask
```

预期 data / 可验证字段：

| 字段 | 预期 |
| --- | --- |
| `shareTask.status` | `ready` |
| `readyShareImageUrl` | 指向 `share-task-1781687817395-94cf4452.png` 或等效完整 URL。 |
| `taskLayoutMode` / `shareTask.layoutMode` | `dual_flow` |
| `ledgerIncluded` / `taskIncludeLedger` | `true`，前端 019 映射后应可见。 |
| `accountingHighlights` | 非空，至少包含欠酒/已喝/已清或后端 016 聚合等效字段。 |
| `keyEvents` | 非空，包含 015 关键事件摘要。 |
| `errorText` | 不应为 `not session member`；若出现，先检查 storage tokenTail。 |

#### 3.29.5 成员权限风险与反例

| 场景 | 预期 | 处理 |
| --- | --- | --- |
| host/member token | task HTTP `200`，页面可验证 ready PNG / 保存按钮前置。 | 用于 022 主复测。 |
| outsider token `f9118246` | task HTTP `403`，`message=not session member`。 | 仅作权限反例；不得用于 ready 视觉准出。 |
| no-token | task HTTP `401`，`message=unauthorized`。 | 仅作权限反例。 |
| QA 旧 token `c418e86ad` | 非 015 样本成员，可能继续触发 `not session member`。 | 先跑 3.28 storage 注入，不要把该身份下的 `shareTask=null` 判为接口缺 task。 |

#### 3.29.6 cleanup / 残留口径

- 本轮只做只读接口确认和复测前置说明；未执行清理、写库、部署、重启。
- 线上样本继续保留：`brief-1781584503870-25d5edac`、`share-task-1781687817395-94cf4452`、PNG `/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png`。
- DevTools storage 是测试机本地状态；复测结束可按 3.28.7 清理 `jzp-user-token/social-current-profile-id/social-current-profile` 或重新登录真实账号。
- 如 QA 需要新 task 或改样本，必须另派任务并由 PM 明确；本轮不写入。

### 3.30 `PR-INT-SHARE-FLOW-RETURN-FIELDS-024` 分享回流字段只读核查

记录时间：2026-06-17。执行边界：只读核查 `api.pomer.cn` / `jiuzhuopanguan` 接口字段；不改业务源码，不改 PM / 测试 / UIUX / UGC 文档，不清理、不写库、不部署、不重启；不触碰 `pomer.cn` 官网；日志只输出 token 后 8 位。

#### 3.30.1 只读命令摘要

本轮只读请求：

| 请求 | 身份 | 目的 |
| --- | --- | --- |
| `GET https://api.pomer.cn/api/v1/session-briefs/brief-1781584503870-25d5edac` | host / memberA / outsider / no-token | 复核 brief 新字段、照片高光可推导节点、过滤字段、权限反例。 |
| `GET https://api.pomer.cn/api/v1/share-image-tasks/share-task-1781687817395-94cf4452` | host / memberA / outsider / no-token | 复核 dual_flow ready task、PNG、权限反例。 |
| `GET https://api.pomer.cn/api/v1/sessions/live?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T` | no-token / host header | 复核 share-preview 当前公开邀请入口可用字段。 |
| `GET https://api.pomer.cn/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png` | 无 token | 复核 PNG 可达。 |

脱敏 token 摘要：

| 身份 | token 后 8 位 | 说明 |
| --- | --- | --- |
| host | `4afb1b00` | 成员态，brief/task 均 HTTP 200。 |
| memberA | `c1b1585a` | 成员态，brief/task 均 HTTP 200。 |
| outsider | `f9118246` | 非成员权限反例，brief/task 均 HTTP 403。 |
| no-token | 空 | 未登录权限反例，brief/task 均 HTTP 401。 |

#### 3.30.2 字段矩阵

| 字段 / 页面需要 | 线上接口来源 | host / memberA 结果 | outsider / no-token 结果 | 当前判断 |
| --- | --- | --- | --- | --- |
| `photoHighlights` | 目前没有独立接口字段；可从 `GET /session-briefs/{briefId}` 的 `timeline.nodes` 中按 approved + share consent + complete + 非私密过滤推导。 | 可推导 2 条：`moment-1781584503741-d53b131f`、`moment-1781586554926-ffc93c65`，均有 imageUrl。 | outsider HTTP 403 `not session member`；no-token HTTP 401 `unauthorized`。 | poster 成员态可消费；share-preview 当前公开邀请入口不会自动得到照片高光。 |
| `accountingHighlights` | `GET /session-briefs/{briefId}` 显式字段；`share-preview` 也可从 `GET /sessions/live` 前端聚合。 | brief 返回 4 项：debt `3`、drunk `4`、add_wine `2`、cleared `1`。 | brief 无权限；公开 live 返回 joinedPlayers，可前端聚合欠酒/已喝/已清。 | 线上存在；前端 share-preview 已能显示账本高光。 |
| `ledgerSummary` | `GET /session-briefs/{briefId}` 显式字段。 | `ledgerCount=11`、`debtCups=3`、`drunkCups=4`、`addWineCount=2`、`clearedCups=1`、`keyEventCount=1`、`visibilityScope=public_summary`。 | brief 无权限。 | 线上存在；公开 share-preview 若只读 live，不会拿到该字段。 |
| `eventHighlights` / `keyEvents` | `GET /session-briefs/{briefId}` 显式字段；`share-preview` 当前从 live 的成员账本计数构造 keyEvents。 | brief 返回 3 条：`wheel_result`、`drink_add`、`drink_debt` 中性文案。 | brief 无权限；公开 live 没有 eventHighlights 字段。 | 线上存在于 brief；share-preview 当前 keyEvents 是前端聚合，不是后端 eventHighlights。 |
| `shareContentFilter.filteredNodeIds` | `GET /session-briefs/{briefId}` 显式字段。 | `allowedCount=5`、`filteredCount=4`；filtered：`moment-1781584503769-1a5b4d94`、`moment-1781584503795-17a32c27`、`moment-1781584503823-56dc9214`、`moment-1781682962307-8169479c`。 | brief 无权限。 | 线上存在于 brief；poster 可消费；share-preview 公开 live 不返回。 |
| `visibleNodes` | 当前线上 brief/task/live 接口均无显式字段。 | 无。 | 无。 | 缺后端/API 024 字段合同，或前端需明确从 `shareContentFilter.allowedNodeIds + timeline.nodes` 映射。 |
| `permissionState` | 当前线上 brief/task/live 接口均无显式字段；poster 页面有前端结构字段 `permissionState=public`。 | 接口无。 | 接口无；权限通过 HTTP 403/401 表达。 | 缺后端/API 024 字段合同，或前端需明确页面字段为临时结构，不可当后端权限摘要。 |
| `share task selectedNodeIds` | `GET /share-image-tasks/share-task-1781687817395-94cf4452`。 | HTTP 200，`status=ready`、`layoutMode=dual_flow`、`ledgerIncluded=true`、`selectedNodeIds` 5 个，覆盖 2 个照片 + 3 个事件。 | outsider 403；no-token 401。 | dual_flow 保存图样本成立。 |
| PNG | task `imageUrl` 静态资源。 | `https://api.pomer.cn/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png` HTTP 200，`image/png`。 | 静态 PNG 无 token 可读。 | 保存图原图可达；UGC 仍需页面/PNG 视觉确认。 |

#### 3.30.3 公开回流 / share-preview 入口判断

当前可确认的公开入口是：

```text
GET /sessions/live?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T
```

只读结果：

| 字段 | 结果 |
| --- | --- |
| HTTP | `200` |
| joinedCount | `3` |
| joinedPlayers / joinStatusPlayers | 返回成员和账本计数；Member A `debt=2/drink=1/cleared=0`，Member B `debt=1/drink=3/cleared=1`。 |
| `photoHighlights` | 不存在。 |
| `accountingHighlights` | 不存在；前端从成员计数聚合。 |
| `eventHighlights` | 不存在；前端从成员账本计数构造 keyEvents。 |
| `shareContentFilter` / `filteredNodeIds` | 不存在。 |
| `visibleNodes` / `permissionState` | 不存在。 |

因此 QA 13.16.46/13.16.47 中 `share-preview photoHighlights=[]` 的直接原因不是线上 brief 缺照片高光素材，而是公开 invite/live 合同没有返回照片高光，且当前 `share-preview` 代码即使读取 brief 合同，也只消费 `accountingHighlights/eventHighlights/ledgerSummary/shareContentFilter`，没有把 brief timeline 转成 `photoHighlights`。

#### 3.30.4 退回对象

| 缺口 | 退回对象 | 需要补什么 |
| --- | --- | --- |
| share-preview `photoHighlights=[]` | 前端 024 优先；如产品要求公开 invite 接口直接给照片，则后端/API 024 配合。 | 前端可在带 `briefId` 时复用 brief timeline 过滤逻辑生成 `photoHighlights`；或后端/API 在公开回流接口补安全的 `photoHighlights` 字段。不得用空数组写通过。 |
| `visibleNodes` 缺失 | 后端/API 024 或前端 024 明确字段来源。 | 后端可返回 `visibleNodes`；或前端把 `shareContentFilter.allowedNodeIds` 映射成页面 `visibleNodes`，并在 QA data 中可见。 |
| `permissionState` 缺失 | 后端/API 024 或前端 024 明确字段来源。 | 后端可返回 `permissionState=member/public/unauthorized`；或前端明确 `permissionState=public` 是页面结构字段，并用 HTTP 403/401 作为真实权限反例。 |
| share-preview `filteredNodeIds` 缺失 | 前端 024。 | 已可从 brief `shareContentFilter.filteredNodeIds` 取得；share-preview 需要把该字段暴露到 page data，或在页面给出等效过滤提示。 |
| UGC 局外 / 未登录角色证据 | 测试 + UGC，接口联调配合。 | 使用 outsider/no-token 复测 403/401，或待后端补公开回流合同后复测公开字段；不得用成员态字段替代局外准出。 |

#### 3.30.5 下一步测试复核建议

成员态 poster 继续用 022 推荐路径：

```powershell
npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --wait 6000 --data photoHighlights,accountingHighlights,keyEvents,shareSummary,ledgerIncluded,taskIncludeLedger,taskLayoutMode,readyShareImageUrl,shareTask,shareContentFilter,visibleNodes,filteredNodeIds,permissionState,errorText
```

回流页需继续复测，但预期仍会暴露缺口，直到前端/后端补字段：

```powershell
npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-preview/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T&briefId=brief-1781584503870-25d5edac" --wait 5000 --data photoHighlights,photoHighlightsNotice,accountingHighlights,keyEvents,shareSummary,shareContentFilter,visibleNodes,filteredNodeIds,permissionState
```

权限反例：

- outsider token 后 8 位 `f9118246` 查询 brief/task 应为 HTTP `403 not session member`。
- no-token 查询 brief/task 应为 HTTP `401 unauthorized`。
- 公开 invite/live 无 token HTTP `200`，但不返回 `photoHighlights/shareContentFilter/visibleNodes/permissionState`。

#### 3.30.6 cleanup / 残留口径

- 本轮只读核查，无新增数据、无 cleanup、无部署、无重启。
- 继续保留 `brief-1781584503870-25d5edac`、`share-task-1781687817395-94cf4452`、PNG `/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png`。
- 如后续要新增公开回流接口、shareId 或字段合同，需 PM 另派后端/API 024 或前端 024；接口联调不自行改代码。

### 3.31 `PR-INT-SHARE-GENERATED-PNG-SOURCE-028` 分享生图源头只读定位

任务边界：PM 028 只读定位；不写库、不 cleanup、不部署、不重启、不泄露完整 token，不触碰 `pomer.cn` 官网。目标只限 `api.pomer.cn` / `jiuzhuopanguan`。

#### 3.31.1 精读范围

| 文件 | 精读点 |
| --- | --- |
| `AGENTS.md` | 域名边界、只改本角色节点、不得泄露完整 token。 |
| `docs/runtime/ai-thread-dispatch-queue.md` | 028 行：接口联调只读定位 ready PNG / 前端 canvas / 缓存责任。 |
| 本计划 3.29 / 3.30 | 022/024 成员态样本、ready PNG、权限反例和字段合同。 |
| `miniprogram/pages/share-poster/index.ts` | `applyShareTask`、`handleSaveTap`、`buildPosterImage`、`readyShareImageUrl`、`posterImagePath`。 |
| `backend/data/moments.js` | `buildShareImageSvg`、`processShareImageTask`。 |

#### 3.31.2 只读命令与 PNG 证据

```powershell
# 公开静态 PNG，只读下载到本机临时目录
curl.exe -sS -D - -o $env:TEMP\share-task-1781687817395-94cf4452.png https://api.pomer.cn/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png

# 本机文件尺寸 / hash / 分辨率
$file = Join-Path $env:TEMP 'share-task-1781687817395-94cf4452.png'
$hash = Get-FileHash -Algorithm SHA256 -LiteralPath $file
Add-Type -AssemblyName System.Drawing
$img=[System.Drawing.Image]::FromFile($file)
[pscustomobject]@{ Length=(Get-Item -LiteralPath $file).Length; Sha256=$hash.Hash; Width=$img.Width; Height=$img.Height }
$img.Dispose()

# 无 token 权限反例，只读
curl.exe -sS -D - -o - https://api.pomer.cn/api/v1/share-image-tasks/share-task-1781687817395-94cf4452
```

响应摘要：

| 项 | 当前证据 |
| --- | --- |
| PNG URL | `https://api.pomer.cn/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png` |
| HTTP | `200 OK`，`content-type=image/png`，`cache-control=public, max-age=2592000, immutable` |
| Last-Modified | `Wed, 17 Jun 2026 09:16:57 GMT` |
| ETag | `W/"121623-19ed4de95aa.991"` |
| 文件尺寸 | `121623` bytes |
| 分辨率 | `900 x 1400` |
| SHA256 | `D5214EF75165B27593B37CB03FAB681DD6CA7B640E1193B1FA398D129DDA30D4` |
| no-token task GET | HTTP `401`，`message=unauthorized` |

视觉只读确认：该 PNG 本体仍是旧红色战报壳，包含 `今晚精彩瞬间`、`酒局时间线简报`、`dual_flow` 徽标、两个空白照片洞、内部样本名截断 `IT-MOMENTS-... openi...` / `PR Seed Host`。它不是 UI 015/020 要求的照片墙 + 聚会账本 + 时间线 + 总结/安全区分享图。

#### 3.31.3 task 字段与成员态口径

完整成员 token 仍只允许在私密执行环境使用，本计划不记录完整 token。沿用 3.29 / 3.30 已复核的成员态摘要：

| 身份 | token 日志口径 | task 合同摘要 |
| --- | --- | --- |
| host | 只输出后 8 位 `4afb1b00` | HTTP `200`，`status=ready`，`layoutMode=dual_flow`，`ledgerIncluded=true`，`imageUrl=/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png`，`selectedNodeIds` 5 个。 |
| memberA | 只输出后 8 位 `c1b1585a` | HTTP `200`，同一 ready task 可读。 |
| outsider | 只输出后 8 位 `f9118246` | HTTP `403`，`message=not session member`。 |
| no-token | 空 | HTTP `401`，`message=unauthorized`。 |

可复跑成员态命令模板仍使用 3.29.2 的私密 token 读取方式；执行方必须只输出 `tokenTail/status/layoutMode/ledgerIncluded/imageUrl`，不得把完整 token 写入日志。

#### 3.31.4 页面保存图来源判断

| 链路 | 代码位置 | 只读判断 |
| --- | --- | --- |
| 页面 ready 图展示 | `share-poster/index.ts` `applyShareTask` 设置 `readyShareImageUrl`；`share-poster/index.wxml` `<image src="{{readyShareImageUrl}}">` | 页面展示 / 预览 ready task 时直接使用后端 PNG。若截图来自 ready 图区域或 task 预览，则坏图源头是后端 ready PNG。 |
| 分享卡 imageUrl | `onShareAppMessage` / `onShareTimeline` 使用 `posterImagePath || posterImageUrl` | 当前不会优先使用 `readyShareImageUrl`；若未生成 `posterImagePath`，分享卡可能仍退到静态 `posterImageUrl`。 |
| DevTools 保存按钮 | `handleSaveTap` 在 `isDevtoolsRuntime()` 下直接置 `posterImagePath=devtools-preview-share-poster.png` | DevTools 只验证保存态，不生成真实图片；不能用它证明真实保存 PNG。 |
| 真机保存按钮 | `ensurePosterImage` -> `buildPosterImage` | 当前 `buildPosterImage()` 在 `readyShareImageUrl` 存在时返回 `drawCanvasToFile(CANVAS_WIDTH, CANVAS_HEIGHT)`，并不下载后端 ready PNG。真实保存图应来自前端 canvas fallback。 |
| 后端 ready PNG 生成 | `backend/data/moments.js` `processShareImageTask` -> `buildShareImageSvg` -> `sharp(...).png()` | 线上 ready PNG 与本地 renderer 文案/布局吻合，后端 renderer 仍输出旧红色战报壳。 |

#### 3.31.5 责任判断与转派建议

结论：

1. `share-task-1781687817395-94cf4452.png` 当前线上 PNG 本体确认是旧布局，不是缓存误读，也不是测试拿错 task：URL、ETag、mtime、hash、尺寸均已记录，图面内容与 `backend/data/moments.js` 的 `buildShareImageSvg` 旧 SVG renderer 文案一致。
2. 页面 ready 图区域 / task 预览使用 `readyShareImageUrl`，因此该区域坏图源头是后端 renderer，转 `PR-BE-SHARE-GENERATED-PNG-RENDERER-028`。
3. 真机点击“保存分享图”当前应走前端 canvas，不下载后端 ready PNG；若用户截图来自真实保存到相册的 PNG，则还需前端 028 继续核查 canvas 输出是否也未按 UI 015/020；若截图来自 ready 图预览，则优先是后端 028。
4. 不是旧缓存主因：公开 PNG 带 immutable 缓存，但本轮重新下载得到的实体 hash 与图面均为旧图；即使清缓存也只会拿到同一后端旧 renderer 产物，除非后端重新生成新 PNG 或前端不再展示该 PNG。

#### 3.31.6 cleanup / 残留口径

- 本轮只读，不新增 task、不重试、不 process、不 cleanup、不写库。
- 继续保留 `share-task-1781687817395-94cf4452` 与 `/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png`，作为 028 坏图源头证据。
- 后续如后端修 renderer，需要新建或重新处理 task 时，必须由后端/API 或 DBA/运维按 PM 派工记录写入、备份、回滚和残留口径；接口联调再只读复核新 PNG 的 URL、mtime、hash、尺寸和视觉摘要。

### 3.32 `PR-INT-CLEAN-SLATE-001` Clean Slate 新主链路 fixture manifest 草案

记录时间：2026-06-18。依据 `docs/party-recorder-clean-slate-reset-plan.md`，接口联调立即停止基于旧样本继续扩大新版验收。本节只更新接口联调计划，不创建新数据、不 cleanup、不写库、不部署、不重启，不泄露完整 token，不触碰 `pomer.cn` 官网。

#### 3.32.1 旧 manifest / 旧 fixture 废弃说明

从 Clean Slate 计划发布起，下列旧样本只保留为历史排障和污染定位证据，不再作为新版“聚会记录师”准出依据：

| 旧样本 / 旧证据 | 当前处理 |
| --- | --- |
| 本地 `docs/runtime/int-data-001-manifest.json` 与 `INT-DATA-001` 本地 fixture | 废弃为新版准出依据；不得继续扩展成新版验收矩阵。 |
| 线上 006B / 009 / 011 / 015 / 017 / 022 / 024 / 028 样本 | 只保留历史可追溯证据；不得把旧 judge/report/share fixture 可读写成新版链路通过。 |
| 旧 `report` / `ranking` / `reward` / `nomination` / 旧 ready PNG | 不进入新版主链路 manifest；如后续仍需能力，必须由后端/API 给新版合同和新样本。 |
| 旧 `share-task-1781687817395-94cf4452` 与旧 generated PNG | 只作为 028 坏图源头证据；不得作为新版分享图准出。 |
| 旧 token / 旧 profile | 不自动继承到新版 manifest；如复用测试账号，必须重新标记为 Clean Slate 测试身份并只记录 token 后 8 位。 |

本轮不 cleanup 任何旧样本。后续清理必须由 PM 另派 DBA/运维或后端/API，先备份、导出 evidence，再按精确 ID / prefix 清理。

#### 3.32.2 新主链路 fixture manifest 草案

建议新 manifest 路径：`docs/runtime/pr-int-clean-slate-001-manifest.json`。当前仅为草案；未实际生成前，测试、前端、后台、UGC、UI/UX 均只能标记“待联调 / 待样本”。

```json
{
  "manifestVersion": "clean-slate-001",
  "product": "party-recorder",
  "prefix": "PRCS-20260618-001",
  "apiBase": "https://api.pomer.cn/api/v1",
  "createdAt": "<iso-time>",
  "profiles": {
    "host": { "profileId": "", "displayName": "Clean Slate Host", "tokenTail": "", "role": "host" },
    "memberA": { "profileId": "", "displayName": "Clean Slate Member A", "tokenTail": "", "role": "member" },
    "memberB": { "profileId": "", "displayName": "Clean Slate Member B", "tokenTail": "", "role": "member" },
    "outsider": { "profileId": "", "displayName": "Clean Slate Outsider", "tokenTail": "", "role": "outsider" }
  },
  "party": {
    "partyId": "",
    "sessionId": "",
    "inviteCode": "",
    "title": "",
    "theme": "",
    "visibility": "invite_only",
    "createdBy": "host"
  },
  "members": [
    { "profileRef": "host", "memberId": "", "joinState": "joined", "permission": "owner" },
    { "profileRef": "memberA", "memberId": "", "joinState": "joined", "permission": "member" },
    { "profileRef": "memberB", "memberId": "", "joinState": "joined", "permission": "member" }
  ],
  "photos": {
    "firstPhotoId": "",
    "wallPhotoIds": [],
    "privatePhotoId": "",
    "pendingReviewPhotoId": "",
    "rejectedPhotoId": "",
    "albumId": "",
    "albumQuery": ""
  },
  "ledger": {
    "ledgerId": "",
    "expenseItemIds": [],
    "settlementId": "",
    "memberBalanceIds": [],
    "summaryId": ""
  },
  "moments": {
    "keyEventIds": [],
    "photoMomentIds": [],
    "ledgerMomentIds": [],
    "timelineQuery": ""
  },
  "brief": {
    "briefId": "",
    "query": "",
    "requiredFields": [
      "photoHighlights",
      "ledgerSummary",
      "accountingHighlights",
      "settlementSummary",
      "eventHighlights",
      "albumSummary",
      "shareContentFilter"
    ]
  },
  "share": {
    "taskReadyId": "",
    "taskFailedId": "",
    "taskPendingId": "",
    "taskExpiredId": "",
    "layoutMode": "party_recorder_dual_flow",
    "imageUrl": "",
    "imageSha256": "",
    "imageSize": { "width": 0, "height": 0 },
    "returnShareId": "",
    "returnQuery": "",
    "saveImageExpected": true
  },
  "privacyModeration": {
    "visibleNodeIds": [],
    "filteredNodeIds": [],
    "permissionStateSamples": {
      "host": "owner",
      "member": "member",
      "outsider": "forbidden",
      "noToken": "unauthorized"
    },
    "reportId": "",
    "reviewCaseIds": []
  },
  "warnings": [],
  "skipped": [],
  "cleanup": {
    "mode": "planned-only",
    "prefix": "PRCS-20260618-001",
    "manifestPrivatePath": "",
    "scanBeforeCommand": "",
    "cleanupCommand": "",
    "scanAfterCommand": ""
  }
}
```

#### 3.32.3 新样本 ID 规则

| 类型 | 建议规则 | 说明 |
| --- | --- | --- |
| prefix | `PRCS-YYYYMMDD-###` | `PRCS` = Party Recorder Clean Slate；只用于新版重建样本。 |
| party/session | `party-prcs-YYYYMMDD-###-*` / `session-prcs-YYYYMMDD-###-*` | 如后端仍使用 `session-*`，需在 manifest 同时记录 `partyId/sessionId` 映射。 |
| profile/member | `user-prcs-YYYYMMDD-role-*` / `member-prcs-...` | token 不写入公开 manifest，仅记录 `tokenTail`。 |
| photo | `photo-prcs-YYYYMMDD-type-*` | 覆盖 first/wall/private/pending/rejected。 |
| ledger | `ledger-prcs-YYYYMMDD-*`、`expense-prcs-*`、`settlement-prcs-*` | 新版账本不得继续用“欠酒/已喝”作为合同字段名。 |
| brief | `brief-prcs-YYYYMMDD-###-*` | 必须同时覆盖照片、账本、关键事件、相册摘要。 |
| share task | `share-task-prcs-YYYYMMDD-ready-*` 等 | ready/failed/pending/expired 单独 ID，不能复用旧 ready PNG。 |
| share return | `share-return-prcs-YYYYMMDD-*` 或 `shareId` | 需后端/API 明确公开回流合同后落定。 |
| report/review | `report-prcs-*`、`review-prcs-*` | 只覆盖新版相册/分享/照片违规；旧玩法举报不进入主链路。 |

#### 3.32.4 cleanup / 残留扫描方案草案

本轮不执行 cleanup。新版 cleanup 必须满足以下顺序：

1. `scan-before`：按 `prefix=PRCS-YYYYMMDD-###` 和 manifest 精确 ID 扫描 party/session/photos/ledger/brief/share/report/review/upload files。
2. `backup`：导出数据库 / store / 上传文件索引，记录备份路径、hash 和恢复方式。
3. `cleanup`：只删除 manifest 私密文件中列出的新版样本 ID；禁止通配清理旧 final/009/011/015/017/share 全量样本。
4. `scan-after`：再次按 prefix 和精确 ID 扫描，输出 remaining count；如有残留列入 `warnings`，不得写清理完成。
5. `evidence`：将 before/after scan、cleanup stdout/stderr、目标服务、操作者、时间写入 runtime evidence 文件。

建议命令模板，需后端/API 或 DBA/运维补实际脚本后才能执行：

```powershell
npm.cmd --prefix backend run fixture:party-recorder-clean-slate -- --mode scan --base-url https://api.pomer.cn/api/v1 --manifest docs/runtime/pr-int-clean-slate-001-manifest.private.json --prefix PRCS-20260618-001 --export-evidence docs/runtime/pr-int-clean-slate-001-scan-before.json
npm.cmd --prefix backend run fixture:party-recorder-clean-slate -- --mode cleanup --manifest docs/runtime/pr-int-clean-slate-001-manifest.private.json --export-evidence docs/runtime/pr-int-clean-slate-001-cleanup.json
npm.cmd --prefix backend run fixture:party-recorder-clean-slate -- --mode scan --base-url https://api.pomer.cn/api/v1 --manifest docs/runtime/pr-int-clean-slate-001-manifest.private.json --prefix PRCS-20260618-001 --export-evidence docs/runtime/pr-int-clean-slate-001-scan-after.json
```

#### 3.32.5 token 脱敏方式

| 介质 | 允许内容 | 禁止内容 |
| --- | --- | --- |
| 公开接口联调计划 | `profileId`、角色、`tokenTail` 后 8 位、权限反例状态码 | 完整 token、可还原 token 的片段、Authorization header 全量值 |
| 私密 manifest | 完整 token 可存放于服务器私密路径或本地 gitignored 文件 | 不得进入公开 docs、截图、录屏、IM、PM 总台账 |
| 命令日志 | `tokenTail=<last8>`、HTTP status、字段摘要 | `X-JZP-User-Token: <full>`、`Bearer <full>` |
| QA storage 前置 | 由 QA/PM 在测试窗口注入，日志只打印后 8 位 | 接口联调不在本轮实际注入 DevTools storage |

#### 3.32.6 当前接口缺口与责任方

| 缺口 | 需要谁补 | 最小合同 / 证据 |
| --- | --- | --- |
| 新版 party/session 创建合同 | 后端/API `PR-BE-CLEAN-SLATE-001` | `POST /parties` 或新版 quick create 是否替代 `/sessions`；默认主题、邀请权限、返回 `partyId/sessionId/inviteCode`。 |
| 成员加入与角色权限 | 后端/API | host/member/outsider/no-token 的 200/403/401 合同；成员列表字段和 DevTools storage key。 |
| 拍照记录 / 相册合同 | 后端/API + 前端 | first photo、photo wall、private、pending/rejected review、album query；前端给新版页面 query。 |
| 聚会账本合同 | 后端/API | expense/settlement/balance/summary 字段；不得继续用旧“欠酒/已喝”作为主合同命名。 |
| 简报聚合合同 | 后端/API | `photoHighlights/ledgerSummary/accountingHighlights/settlementSummary/eventHighlights/albumSummary/shareContentFilter` 明确字段来源。 |
| 分享图任务合同 | 后端/API | 新 `layoutMode=party_recorder_dual_flow`、ready PNG 视觉规格、hash/mtime/size、failed/pending/expired 状态。 |
| 分享回流公开合同 | 后端/API + UGC | `shareId` / invite return endpoint、`visibleNodeIds/filteredNodeIds/permissionState`、公开字段脱敏规则。 |
| 保存分享图页面 query | 前端 `PR-FE-CLEAN-SLATE-001` | 新分享页、保存图页、回流页、相册页 query；旧 `share-poster/share-preview` 若保留必须声明重建边界。 |
| 隐私 / 举报 / 审核 | 后端/API + UGC + 后台 | report/review 状态机、审核后台入口、私密内容不进分享图的 API 证据。 |
| cleanup 脚本 | 后端/API + DBA/运维 | 新 fixture create/scan/cleanup 脚本、备份路径、回滚方式、残留扫描证据。 |

接口联调下一步只接收后端/API 的新版合同和前端新版页面 query 后，再补可复跑 HTTP 命令。未收到前，不再用旧 manifest 填补新版验收缺口。

### 3.33 `PR-INT-CLEAN-SLATE-MANIFEST-RUN-002` actual clean manifest 生成前置收口

记录时间：2026-06-18。依据 PM 二派 `PR-INT-CLEAN-SLATE-MANIFEST-RUN-002`，本节只把 3.32 草案收口为可执行前置模板。未收到后端/API 002 和前端 002 前，不创建新样本、不 cleanup、不写库。

#### 3.33.1 私密 manifest 文件名规范

| 用途 | 建议文件名 | 说明 |
| --- | --- | --- |
| 私密 manifest 正式文件 | `docs/runtime/pr-int-clean-slate-<batch>-manifest.private.json` | 含完整 token、私密 query、cleanup 精确 ID；不得提交公开 repo。 |
| 私密 manifest 本地覆盖 | `docs/runtime/pr-int-clean-slate-<batch>-manifest.private.local.json` | 仅本机或测试窗口使用；加入 gitignore。 |
| 公开脱敏摘要 | `docs/runtime/pr-int-clean-slate-<batch>-manifest-sanitized.md` | 给 PM/测试/前端/UGC 的共享摘要，不含完整 token。 |
| 公开脱敏 JSON | `docs/runtime/pr-int-clean-slate-<batch>-manifest-sanitized.json` | 仅保留 tokenTail、query 模板、字段覆盖和 warnings/skipped。 |
| 运行索引文件 | `docs/runtime/pr-int-clean-slate-<batch>-run-index.md` | 记录本批次目标服务、操作者、evidence 文件、状态。 |

命名规则：

- `<batch>` 统一使用 `PRCS-YYYYMMDD-###`，例如 `PRCS-20260618-002`。
- 私密 manifest 与脱敏摘要必须同 batch，禁止混用旧 006B/015/017 样本批次。
- 若同日重跑，递增 `###`，不得覆盖旧 batch。

#### 3.33.2 公开脱敏摘要模板

建议模板文件：`docs/runtime/pr-int-clean-slate-<batch>-manifest-sanitized.md`

```md
# PR-INT Clean Slate Manifest Sanitized Summary

- batch: `PRCS-20260618-002`
- product: `party-recorder`
- apiBase: `https://api.pomer.cn/api/v1`
- source: `api.pomer.cn / jiuzhuopanguan`
- createdAt: `<iso-time>`
- status: `planned` | `created` | `partial` | `blocked`

## Profiles

| role | profileId | tokenTail | note |
| --- | --- | --- | --- |
| host | `user-prcs-...` | `abcd1234` | owner |
| memberA | `user-prcs-...` | `efgh5678` | member |
| memberB | `user-prcs-...` | `ijkl9012` | member |
| outsider | `user-prcs-...` | `mnop3456` | permission negative case |

## Primary IDs

| type | id | query / note |
| --- | --- | --- |
| party | `party-prcs-...` | create / party home |
| session | `session-prcs-...` | runtime fallback if backend still uses session |
| brief | `brief-prcs-...` | `/pages/...?...` |
| shareReadyTask | `share-task-prcs-...` | dual flow |
| shareFailedTask | `share-task-prcs-...` | failure branch |
| report | `report-prcs-...` | moderation |

## Field Coverage

| domain | requiredFields | status |
| --- | --- | --- |
| brief | `photoHighlights,ledgerSummary,accountingHighlights,settlementSummary,eventHighlights,albumSummary,shareContentFilter` | `pending` |
| share | `layoutMode,imageUrl,imageSha256,imageSize,returnShareId` | `pending` |
| moderation | `visibleNodeIds,filteredNodeIds,permissionState,reportId,reviewCaseIds` | `pending` |

## Warnings

- `waiting PR-BE-CLEAN-SLATE-001 contract`
- `waiting PR-FE-CLEAN-SLATE-001 page query`

## Cleanup

- mode: `not-run`
- plannedPrefix: `PRCS-20260618-002`
- evidenceRef: `docs/runtime/pr-int-clean-slate-20260618-002-scan-before.json`
```

#### 3.33.3 evidence 文件名与 JSON 字段格式

建议文件名：

| 阶段 | 文件名 |
| --- | --- |
| scan-before | `docs/runtime/pr-int-clean-slate-<batch>-scan-before.json` |
| cleanup | `docs/runtime/pr-int-clean-slate-<batch>-cleanup.json` |
| scan-after | `docs/runtime/pr-int-clean-slate-<batch>-scan-after.json` |
| combined summary | `docs/runtime/pr-int-clean-slate-<batch>-evidence-summary.md` |

建议 JSON 顶层字段：

```json
{
  "batch": "PRCS-20260618-002",
  "stage": "scan-before",
  "product": "party-recorder",
  "apiBase": "https://api.pomer.cn/api/v1",
  "targetService": "jiuzhuopanguan-backend",
  "executedAt": "<iso-time>",
  "executedBy": "interface-integration | backend-api | dba-ops",
  "mode": "scan | cleanup",
  "manifestRef": {
    "privatePath": "docs/runtime/pr-int-clean-slate-20260618-002-manifest.private.json",
    "sanitizedPath": "docs/runtime/pr-int-clean-slate-20260618-002-manifest-sanitized.json"
  },
  "prefix": "PRCS-20260618-002",
  "commandTemplate": "",
  "stats": {
    "partyCount": 0,
    "sessionCount": 0,
    "photoCount": 0,
    "ledgerCount": 0,
    "briefCount": 0,
    "shareTaskCount": 0,
    "reportCount": 0,
    "reviewCount": 0,
    "uploadFileCount": 0
  },
  "ids": {
    "parties": [],
    "sessions": [],
    "photos": [],
    "briefs": [],
    "shareTasks": [],
    "reports": [],
    "reviews": [],
    "uploads": []
  },
  "tokenTails": {
    "host": "",
    "memberA": "",
    "memberB": "",
    "outsider": ""
  },
  "warnings": [],
  "skipped": [],
  "residuals": [],
  "backup": {
    "path": "",
    "hash": "",
    "restorable": false
  }
}
```

字段约束：

- `manifestRef.privatePath` 只写路径，不内联 token。
- `tokenTails` 只保留后 8 位。
- `ids` 必须是精确 ID，不允许只写模糊 prefix。
- `residuals` 只在 `scan-after` 或 cleanup 失败时非空。
- `backup` 在 `cleanup` 阶段必须存在；`scan-before` 可为空对象。

#### 3.33.4 actual clean manifest 所需最小字段清单

后端/API 002 最小字段：

| 域 | 最小字段 |
| --- | --- |
| party create | `partyId`、`sessionId`、`inviteCode`、`title`、`theme`、`visibility`、`createdBy` |
| member join | `memberId`、`profileId`、`joinState`、`permission`、`joinedAt` |
| photos / album | `photoId`、`momentId`、`visibility`、`reviewStatus`、`imageUrl`、`albumId` |
| ledger | `ledgerId`、`expenseItemIds`、`settlementId`、`memberBalanceIds`、`ledgerSummary` |
| brief | `briefId`、`photoHighlights`、`ledgerSummary`、`accountingHighlights`、`settlementSummary`、`eventHighlights`、`albumSummary`、`shareContentFilter` |
| share task | `taskId`、`status`、`layoutMode`、`imageUrl`、`imageSha256`、`imageSize.width`、`imageSize.height`、`returnShareId` |
| moderation | `visibleNodeIds`、`filteredNodeIds`、`permissionState`、`reportId`、`reviewCaseIds` |
| cleanup support | `prefix` 可扫字段、精确 ID 删除能力、before/after scan 返回结构 |

前端 002 最小字段：

| 页面 | 最小 query / data 口径 |
| --- | --- |
| 创建页 | `partyId` 或 `sessionId`；若有快速创建回流需给 success query。 |
| 拍照记录页 | `partyId/sessionId`、`albumId`、`inviteCode`。 |
| 账本页 | `partyId/sessionId`、`ledgerId`。 |
| 简报页 | `briefId`、`partyId/sessionId`。 |
| 分享页 / 保存图页 | `briefId`、`taskId`、`shareId` 三者中哪些必填必须定。 |
| 分享回流页 | `shareId` 或 `inviteCode + briefId`；必须定公开态 query。 |
| 相册页 | `albumId` 或 `partyId/sessionId`；是否需要 `viewerRole`。 |

#### 3.33.5 旧样本去留表

| 旧样本范围 | 后续动作 | 原因 |
| --- | --- | --- |
| 本地 `INT-DATA-001` manifest 与其本地 session/profile/task | 未来必须清理 | 仅本地旧固定数据，且含旧 judge/report/share 语义，不应继续污染新版联调。 |
| 线上 006B final manifest 衍生样本 | 未来必须清理 | 属旧“最终样本”体系，继续存在会混淆新版 clean batch。 |
| 线上 009 奖励/report/expired 补样本 | 未来必须清理 | 旧 ranking/reward/report 支线，不属于新版主链路。 |
| 线上 011 dedicated review sample | 未来必须清理 | 旧待审样本口径，需让位给新版相册/分享审核样本。 |
| 015/017/022/024/028 share flow 样本与旧 ready PNG | 未来必须清理 | 属旧分享页、旧 generated PNG、旧 dual_flow 合同。 |
| 旧 judge/report/share fixture 脚本生成的 runtime chrome profile | 只归档，不要求线上清理 | 本地/运行时证据，可保留索引供追溯。 |
| `docs/runtime` 旧截图、旧错误快照 | 只归档，不要求接口联调清理 | PM 已定为 P2 归档资产，不影响线上数据一致性。 |
| 旧坏图源头证据 `share-task-1781687817395-94cf4452` | 先归档，待后端/运维统一清理 | 当前仍是 028 责任证据，未到立刻删除窗口。 |

收口条件：只有当后端/API 002 给出新合同、前端 002 给出新页面 query、DBA/运维给出清理预案后，接口联调才可把 3.33 模板落为 actual manifest 运行命令。

### 3.34 `PR-INT-CLEAN-SLATE-MANIFEST-BUILD-003` actual clean manifest 首轮构建阻塞收口

记录时间：2026-06-18。依据 PM 三派 `PR-INT-CLEAN-SLATE-MANIFEST-BUILD-003`，本轮目标是“等前端 003 和后端 003 回包后，按 3.33 模板生成首个 actual clean manifest 私密版和脱敏版；先做 scan-before，不做 cleanup”。接口联调按限定范围只读核查 `docs/runtime/ai-thread-dispatch-queue.md` 对应任务行和 3.33，未扩展到其他实施文档或源码改动。

当前状态：本节为前端/后端 003 未完成时的历史阻塞记录，已被 3.35 `PR-INT-CLEAN-SLATE-MANIFEST-BUILD-003-RERUN` 覆盖；当前 PM 回包以 3.35 为准。

#### 3.34.1 当前阻塞结论

| 依赖 | 当前状态 | 影响 |
| --- | --- | --- |
| 前端 `PR-FE-CLEAN-SLATE-PHASE1-IMPLEMENT-003` | `sent`，未见“新壳路径 / 新页面 query”最终回包 | 无法把 `briefId/taskId/shareId/albumId/partyId` 写成 actual clean manifest 的可执行 query。 |
| 后端/API `PR-BE-CLEAN-SLATE-PHASE1-IMPLEMENT-003` | `sent`，未见“本地 JSON/store baseline / clean facade / 最小 `parties/brief/share` 兼容出口”最终回包 | 无法生成首个 private manifest，也无法运行合法的 `scan-before`。 |

因此本轮状态只能记为 `blocked-before-build`：

- 未生成 `docs/runtime/pr-int-clean-slate-PRCS-20260618-003-manifest.private.json`
- 未生成 `docs/runtime/pr-int-clean-slate-PRCS-20260618-003-manifest-sanitized.json`
- 未生成 `docs/runtime/pr-int-clean-slate-PRCS-20260618-003-scan-before.json`
- 未执行任何 create / scan / cleanup 命令
- 未复用旧 `006B` / `015` / `017` 样本批次

#### 3.34.2 预留文件名与状态占位

为避免后续混批，首个 phase1 actual clean manifest 预留使用以下文件名；当前均为“未创建”状态：

| 文件 | 状态 |
| --- | --- |
| `docs/runtime/pr-int-clean-slate-PRCS-20260618-003-manifest.private.json` | 未创建；等待后端/API 003 提供 baseline/facade 和测试身份来源。 |
| `docs/runtime/pr-int-clean-slate-PRCS-20260618-003-manifest-sanitized.json` | 未创建；等待 private manifest 落地后脱敏导出。 |
| `docs/runtime/pr-int-clean-slate-PRCS-20260618-003-manifest-sanitized.md` | 未创建；等待 scan-before 结果填充字段覆盖和 warnings。 |
| `docs/runtime/pr-int-clean-slate-PRCS-20260618-003-scan-before.json` | 未创建；等待后端/API 003 提供可扫 facade 和精确 ID。 |

#### 3.34.3 scan-before 未执行原因

`scan-before` 在 3.33 中要求至少具备以下前置：

1. private manifest 已存在，且包含本批次精确 IDs。
2. 后端/API 可按 `prefix=PRCS-20260618-003` 或精确 ID 返回 `party/session/photos/ledger/brief/share/report/review/upload files` 扫描结果。
3. 前端已给出新壳页面 query，能把 manifest 中的 primary IDs 对到实际页面入口。

本轮三项前置均未满足，因此不得伪造 `scan-before` evidence，也不得把模板文件当成实际产物提交。

#### 3.34.4 下一步依赖与接口联调动作

后端/API 003 回包后，至少需提供：

- 本地 baseline 文件清单或路径
- clean facade 的最小路由/字段
- 可供 manifest 生成的测试身份来源
- `scan-before` 的可扫键：prefix 或精确 ID 列表

前端 003 回包后，至少需提供：

- 新页面路径：创建、拍照、账本、简报、分享、回流、相册
- 每个页面的最小 query
- 若 `partyId` 与 `sessionId` 并存，哪一个是页面主键

接口联调收到上述两侧回包后，下一轮才执行：

1. 生成 `PRCS-20260618-003` private manifest
2. 导出 sanitized JSON / MD
3. 运行 `scan-before`
4. 只回报 IDs、字段覆盖、脱敏摘要；继续不 cleanup

### 3.35 `PR-INT-CLEAN-SLATE-MANIFEST-BUILD-003-RERUN` scan-before 脱敏摘要

记录时间：2026-06-18。PM 复派后确认 3.34 的 `blocked-before-build` 已过期：前端 14.46 已回包新壳路径，后端/API 003 已新增 `backend/data/clean-slate.js`、`backend/scripts/smoke-clean-slate-phase1.js` 与 clean facade，PM 复跑 smoke 通过。接口联调本轮按最新状态重跑本地 `scan-before`，不 cleanup，不复用旧 006B/015/017 样本批次，不写完整 token。

#### 3.35.1 本轮读取与执行范围

| 项 | 结果 |
| --- | --- |
| PM 队列 | `PR-BE-CLEAN-SLATE-PHASE1-IMPLEMENT-003` 已 `done`；`PR-INT-CLEAN-SLATE-MANIFEST-BUILD-003-RERUN` 已派发。 |
| 前端 14.46 | 新增 `/pages/album/index`、`/pages/ledger/index`、`/pages/privacy-state/index`；给出预览路径 `/pages/album/index`、`/pages/album/index?mode=unshared`、`/pages/ledger/index`、`/pages/privacy-state/index?type=filtered`。 |
| 后端 003 | clean facade 本地 helper 与 smoke 已存在；后端明确未部署、未重启、未触碰 `api.pomer.cn`。 |
| 执行命令 | `node backend/scripts/smoke-clean-slate-phase1.js`，本地通过。 |

#### 3.35.2 产物文件

| 文件 | 状态 | 说明 |
| --- | --- | --- |
| `docs/runtime/pr-int-clean-slate-PRCS-20260618-003-manifest.private.json` | 未创建 | 后端 003 尚未提供新 PRCS 测试身份 / token 来源；本轮不读取旧 token。 |
| `docs/runtime/pr-int-clean-slate-PRCS-20260618-003-manifest-sanitized.json` | 已创建 | 基于本地 smoke 输出的脱敏 manifest 摘要，不含完整 token。 |
| `docs/runtime/pr-int-clean-slate-PRCS-20260618-003-manifest-sanitized.md` | 已创建 | 给 PM/测试/UGC/前端阅读的脱敏摘要。 |
| `docs/runtime/pr-int-clean-slate-PRCS-20260618-003-scan-before.json` | 已创建 | scan-before evidence；来源为本地 smoke，不是线上 scan。 |

#### 3.35.3 scan-before 摘要

| 域 | 摘要 |
| --- | --- |
| source | 本地 `node backend/scripts/smoke-clean-slate-phase1.js`。 |
| deployment | smoke 输出 `undeployed=true`；本轮不访问线上 `api.pomer.cn`。 |
| party/session | `session-1781507687012-e4343d` 被 clean facade 映射为 `partyId/sessionId`。 |
| inviteCode | `C56EVT`。 |
| members | host/memberA/memberB 三个 profile 可见；未读取 token，tokenTail 为空。 |
| photo | visible opening `moment-1781507687032-eb1806a4`；baseline photo seed `moment-1781507687039-ee0677bb`。 |
| ledger/event | `event-1781507687041-e380feb7`；当前仍是 legacy `drink_debt` event type。 |
| brief | `brief-1781507687042-d1990edd`；有 `ledgerSummary/accountingHighlights/settlementSummary/eventHighlights/shareContentFilter`。 |
| share | `share-task-it-moments-20260615-expired`；expired old task，无 ready imageUrl / hash / size。 |
| moderation | `moment-report-it-moments-20260615`；缺 `reviewCaseIds`。 |

#### 3.35.4 字段覆盖与仍缺字段

已覆盖：

- party facade：`partyId/sessionId/inviteCode/members/photoHighlights/ledgerSummary/eventHighlights/shareContentFilter/visibleNodeIds/filteredNodeIds/permissionState`
- brief facade：`briefId/timeline/accountingHighlights/ledgerSummary/settlementSummary/eventHighlights/shareContentFilter`
- share facade：`taskId/status/layoutMode`
- frontend query：`/pages/album/index`、`/pages/album/index?mode=unshared`、`/pages/ledger/index`、`/pages/privacy-state/index?type=filtered`

仍缺：

- 新 PRCS 批次真实 ID；当前 scan-before 仍映射本地旧 `INT-DATA-001` ID。
- private manifest 与完整 token 来源；本轮未读取、未生成。
- `brief.albumSummary`。
- `brief.photoHighlights` 非空证据；当前 brief facade 中 `photoHighlights=[]`。
- ready share image 的 `imageUrl/imageSha256/imageSize/returnShareId`。
- `reviewCaseIds`、outsider/no-token 权限反例。
- 线上 `api.pomer.cn` 部署后 scan；当前 smoke 明确 `undeployed=true`。

#### 3.35.5 cleanup / 旧批次口径

- 本轮未执行 cleanup。
- 本轮未复用旧 006B/015/017 线上样本批次。
- 本轮 scan-before 显示 clean facade 仍从本地旧 store 映射出 `IT-MOMENTS`、`drink_debt`、`share-task-it-moments-20260615-expired`；这些只能作为旧污染扫描证据，不能作为 clean actual fixture 通过。
- 下一步需后端/API 提供新 PRCS 测试身份、真实 clean seed/create 能力和 ready share image；前端需继续给分享/简报/回流 actual query，接口联调再生成 private manifest 并复跑 scan-before。

### 3.36 `PR-INT-CLEAN-SLATE-ACTUAL-MANIFEST-004` actual clean manifest 预派依赖登记

记录时间：2026-06-18。PM 第四轮预派要求：等待后端/API `PR-BE-CLEAN-SLATE-PAYLOAD-SEED-004` 回包 clean payload 与 PRCS 样本/token 来源后，再生成首个 actual clean private manifest 与 sanitized manifest。本节只登记依赖与预留文件名；不创建新样本、不生成 private manifest、不 cleanup、不线上写入、不触碰 `pomer.cn` 官网。

#### 3.36.1 当前队列状态

| 任务 | 状态 | 接口联调判断 |
| --- | --- | --- |
| 后端/API `PR-BE-CLEAN-SLATE-PAYLOAD-SEED-004` | `sent` | 等待 clean payload、PRCS 样本 ID、token 来源、payload 白名单和本地 smoke 证据。 |
| 接口联调 `PR-INT-CLEAN-SLATE-ACTUAL-MANIFEST-004` | `sent` | 预派等待；当前不能复用旧 `006B/015/017/INT-DATA-001` 填充 actual manifest。 |

#### 3.36.2 待后端 004 依赖字段

后端/API 004 至少需要交付以下字段，接口联调才能生成 private / sanitized manifest：

| 域 | 必需字段 |
| --- | --- |
| batch | `prefix=PRCS-YYYYMMDD-###`、生成时间、`undeployed/deployed` 状态。 |
| token source | host/memberA/memberB/outsider 的完整 token 私密来源或生成命令；公开只允许 `tokenTail` 后 8 位。 |
| party | `partyId`、`sessionId`、`inviteCode`、`title`、`theme`、`visibility`、`createdBy`、`memberCount`。 |
| members | `memberId`、`profileId`、`role`、`permission`、`joinState`、`joinedAt`。 |
| photos / album | `photoId`、`momentId`、`albumId`、`imageUrl`、`visibility`、`reviewStatus`、`usageConsent`、`photoHighlights` 非空证据。 |
| ledger | 新版账本字段：`ledgerId`、`entryIds`、`summary`、`settlementId`、`balanceIds`；不得把旧 `drink_debt` 作为 clean payload 主字段。 |
| brief | `briefId`、`photoHighlights`、`ledgerSummary`、`accountingHighlights`、`settlementSummary`、`eventHighlights`、`albumSummary`、`shareContentFilter`。 |
| share image | ready/pending/failed/expired task IDs、`layoutMode`、`imageUrl`、`imageSha256`、`imageSize`、`returnShareId/shareId`。 |
| share return | 公开回流 endpoint 或页面 query 所需字段：`shareId`、`inviteCode`、`briefId`、`permissionState`。 |
| moderation | `reportId`、`reviewCaseIds`、`visibleNodeIds`、`filteredNodeIds`、公开过滤原因。 |
| cleanup scan | `scan-before` 可扫 prefix 或精确 ID 列表、before/after 结构、禁止清旧批次说明。 |

#### 3.36.3 actual manifest 预留文件名

后端 004 到位后，接口联调按以下命名生成或引用产物。当前状态均为“待生成”：

| 文件 | 当前状态 |
| --- | --- |
| `docs/runtime/pr-int-clean-slate-PRCS-20260618-004-manifest.private.json` | 待后端 004 token/source 到位后生成；不得进入公开文档。 |
| `docs/runtime/pr-int-clean-slate-PRCS-20260618-004-manifest-sanitized.json` | 待 private manifest 脱敏后生成。 |
| `docs/runtime/pr-int-clean-slate-PRCS-20260618-004-manifest-sanitized.md` | 待 scan-before 后填入 PM 可读摘要。 |
| `docs/runtime/pr-int-clean-slate-PRCS-20260618-004-scan-before.json` | 待后端 004 clean payload 与 scan 能力到位后执行。 |

#### 3.36.4 页面 query 预置口径

前端 14.46 已提供第一阶段新壳路径，可先作为 manifest 的页面 query 基线；后续如果前端 004 更新 actual query，以前端 004 为准。

| 页面 | 当前 query |
| --- | --- |
| 相册 | `/pages/album/index` |
| 未分享 / 待整理相册 | `/pages/album/index?mode=unshared` |
| 账本 | `/pages/ledger/index` |
| 隐私过滤状态 | `/pages/privacy-state/index?type=filtered` |
| 简报 | 待前端 004 给 `briefId/partyId/sessionId` 口径。 |
| 分享图 | 待前端 004 给 `briefId/taskId/shareId` 口径。 |
| 分享回流 | 待前端 004 给 `shareId` 或 `inviteCode + briefId` 口径。 |

#### 3.36.5 后续 scan-before 执行计划

后端 004 到位后，接口联调执行顺序：

1. 读取后端 004 私密 token 来源，只生成 private manifest，不在公开文档输出完整 token。
2. 导出 sanitized JSON / MD，只保留 `profileId`、`tokenTail`、页面 query、字段覆盖、warnings/skipped。
3. 执行 `scan-before`，只扫描 `PRCS-20260618-004` prefix 或 private manifest 精确 ID。
4. 记录 API 摘要：party/live、brief、share image、share return、album、ledger、privacy/moderation。
5. 保持 cleanup 为 `not-run`，残留扫描计划只写 before evidence，不执行删除。

#### 3.36.6 warnings / skipped 预置

当前预置 warnings：

- `waiting PR-BE-CLEAN-SLATE-PAYLOAD-SEED-004 clean payload and PRCS token source`
- `do not reuse legacy 006B/015/017/INT-DATA-001 samples as clean actual acceptance`
- `cleanup not run`
- `api.pomer.cn write/scan not run unless PM assigns after backend 004`

当前预置 skipped：

- `private manifest generation skipped until backend 004 provides token source`
- `sanitized manifest generation skipped until private manifest exists`
- `scan-before skipped until clean payload exact IDs exist`
- `cleanup skipped by PM boundary`

### 3.37 `PR-INT-CLEAN-SLATE-ACTUAL-MANIFEST-005-RUN` private token manifest 与脱敏 scan-before

记录时间：2026-06-18。后端/API `PR-BE-CLEAN-SLATE-PRIVATE-MANIFEST-005` 已回包，新增 `backend/scripts/manage-clean-slate-private-manifest.js`，可基于本地 `social-store` 生成 PRCS 四角色 token，stdout 仅输出 token 后 8 位。本轮接口联调使用该脚本生成 private manifest，并产出 005 脱敏 runtime 证据。不 cleanup、不线上写入、不触碰 `pomer.cn` 官网。

#### 3.37.1 执行命令

```powershell
node backend/scripts/manage-clean-slate-private-manifest.js --mode generate --seed prcs-005 --output %TEMP%/jiuzhuopanguan-private/pr-int-clean-slate-PRCS-20260618-005-manifest.private.json
node backend/scripts/manage-clean-slate-private-manifest.js --mode inspect --seed prcs-005
node backend/scripts/smoke-clean-slate-phase1.js
```

安全结果：

- 完整 token 只写入 `%TEMP%/jiuzhuopanguan-private/pr-int-clean-slate-PRCS-20260618-005-manifest.private.json`。
- 公开 docs/runtime 仅记录 `profileId` 与 token 后 8 位。
- 本轮保留 `prcs-005` seed 供后续测试，未执行 cleanup。

#### 3.37.2 文件产物

| 文件 | 状态 |
| --- | --- |
| `%TEMP%/jiuzhuopanguan-private/pr-int-clean-slate-PRCS-20260618-005-manifest.private.json` | 已生成；私密路径，含完整 token，不进入公开 docs/runtime。 |
| `docs/runtime/pr-int-clean-slate-PRCS-20260618-005-manifest-sanitized.json` | 已生成；不含完整 token。 |
| `docs/runtime/pr-int-clean-slate-PRCS-20260618-005-manifest-sanitized.md` | 已生成；PM/测试/UGC/前端可读摘要。 |
| `docs/runtime/pr-int-clean-slate-PRCS-20260618-005-scan-before.json` | 已生成；本地 scan-before evidence。 |
| `docs/runtime/pr-int-clean-slate-PRCS-20260618-005-run-index.md` | 已生成；记录命令、文件和 cleanup 计划。 |

#### 3.37.3 四角色 token 脱敏摘要

| role | profileId | token 后 8 位 |
| --- | --- | --- |
| host | `user-1781750973039-6bebeb` | `800c2717` |
| memberA | `user-1781750973040-d3b4a7` | `23a57387` |
| memberB | `user-1781750973040-280cc1` | `d07afc11` |
| outsider | `user-1781750973040-c4e5c8` | `c065ca91` |

`inspect --seed prcs-005` 当前残留计数：`profiles=4`、`userSessions=4`、`loginLogs=4`、`friendships=0`、`pokes=0`。这是本轮保留的 private manifest seed，不是 cleanup 失败。

#### 3.37.4 scan-before / API 摘要

`node backend/scripts/smoke-clean-slate-phase1.js` 输出摘要：

| 域 | 摘要 |
| --- | --- |
| deployment | `undeployed=true`；本轮未访问线上 `api.pomer.cn`。 |
| tokenHandoff | smoke 仍标记 `pending_seed`，但接口联调已通过 private manifest 生成补齐本地 token 来源。 |
| payloadWhitelists | `partiesLive`、`briefs`、`shareImages` 三组白名单已输出。 |
| party/live | clean payload 有 `partyId/inviteCode/title/photoHighlights/accountingHighlights/ledgerSummary/keyEvents/shareNotice/summary`。 |
| brief | clean payload 有 `briefId/partyId/title/photoHighlights/accountingHighlights/ledgerSummary/settlementSummary/keyEvents/shareNotice/summary`。 |
| share image | clean payload 有 `shareImageId/partyId/briefId/status/renderMode/imageUrl/includeLedger/createdAt/finishedAt/message`。 |
| storeCounts | `adminLiveSessions=4`、`momentsBriefs=1`、`momentsShareImageTasks=4`、`socialProfiles=13`。 |

页面 query：

| 页面 | query |
| --- | --- |
| album | `/pages/album/index` |
| album unshared | `/pages/album/index?mode=unshared` |
| ledger | `/pages/ledger/index` |
| privacy filtered | `/pages/privacy-state/index?type=filtered` |
| brief | 待前端 004 actual query。 |
| share | 待前端 004 actual query。 |
| share return | 待前端 004 actual query。 |

#### 3.37.5 仍阻塞项

- private token handoff 已解除，但 actual clean `party/photo/ledger/brief/shareImage` 仍未生成；当前 payload 的 primary IDs 仍来自本地旧 `INT-DATA-001`。
- 本轮不得把 `session-1781507687012-e4343d`、`brief-1781507687042-d1990edd`、`share-task-1781507687046-d1098582` 写成 clean actual fixture 通过。
- share image 仍缺 `imageSha256/imageSize/returnShareId`。
- 缺 `reviewCaseIds`、outsider/no-token API 负例。
- 后端 smoke 仍 `undeployed=true`，线上 `api.pomer.cn` scan 未执行。
- 前端 brief/share/share return actual query 仍待前端 004。

#### 3.37.6 cleanup / 残留扫描计划

本轮不 cleanup，保留 private manifest seed 供后续测试。后续如 PM 派 cleanup，执行：

```powershell
node backend/scripts/manage-clean-slate-private-manifest.js --mode cleanup --seed prcs-005
node backend/scripts/manage-clean-slate-private-manifest.js --mode inspect --seed prcs-005
```

预期 cleanup 后 `profiles/userSessions/loginLogs/friendships/pokes` 残留均为 `0`。执行前不得清理旧 006B/015/017/INT-DATA-001；只清 `seed=prcs-005` 的 token/profile 残留。

### 3.38 `PR-INT-CLEAN-SLATE-ACTUAL-MANIFEST-006-RUN` actual clean manifest 与脱敏 scan-before

记录时间：2026-06-18。后端/API `PR-BE-CLEAN-SLATE-ACTUAL-DATA-006` 已回包 `backend/scripts/manage-clean-slate-actual-fixture.js`，可生成 actual clean party/photo/ledger/brief/shareImage/share return fixture。本轮接口联调使用后端 006 helper 生成 `prcs-006` actual private manifest、公开脱敏 manifest、scan-before 和 run-index。完整 token 只保留在私密路径或本机 env；公开文档和日志只写 token 后 8 位。不 cleanup、不线上写入、不触碰 `pomer.cn` 官网。

#### 3.38.1 执行命令

```powershell
node --check backend/scripts/manage-clean-slate-actual-fixture.js
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-006
node backend/scripts/manage-clean-slate-actual-fixture.js --mode create --seed prcs-006 --output $env:TEMP\jiuzhuopanguan-private\pr-int-clean-slate-PRCS-20260618-006-manifest.private.json
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-006
```

执行结果摘要：

- private manifest 已生成到 `%TEMP%/jiuzhuopanguan-private/pr-int-clean-slate-PRCS-20260618-006-manifest.private.json`；该文件含完整 token，不进入公开文档。
- actual fixture 来源为 `local-clean-slate-actual-fixture`，`tokenSource=local-bindWechatUser`，`undeployed=true`。
- 本轮未执行 `api.pomer.cn` 写入、部署、重启或 cleanup。

#### 3.38.2 文件产物

| 文件 | 状态 |
| --- | --- |
| `%TEMP%/jiuzhuopanguan-private/pr-int-clean-slate-PRCS-20260618-006-manifest.private.json` | 已生成；私密路径，含完整 token，不公开内容。 |
| `docs/runtime/pr-int-clean-slate-PRCS-20260618-006-manifest-sanitized.json` | 已生成；覆盖 party/session、host/member、photo、ledger、brief、ready/failed shareImage、share return 页面 query。 |
| `docs/runtime/pr-int-clean-slate-PRCS-20260618-006-manifest-sanitized.md` | 已生成；PM/前端/测试可读摘要。 |
| `docs/runtime/pr-int-clean-slate-PRCS-20260618-006-scan-before.json` | 已生成；记录 `inspect --seed prcs-006` 残留计数与本地图片/PNG 文件存在性。 |
| `docs/runtime/pr-int-clean-slate-PRCS-20260618-006-run-index.md` | 已生成；记录命令、文件、复测入口和 cleanup 责任。 |

#### 3.38.3 token 脱敏摘要

| role | profileId | 权限 | token 后 8 位 |
| --- | --- | --- | --- |
| host | `user-1781753066620-ec7977` | host | `a344ca32` |
| memberA | `user-1781753066620-f2c625` | member | `12d644a0` |
| memberB | `user-1781753066621-109af2` | member | `5803654d` |
| outsider | `user-1781753066621-e5338a` | outsider | `4a136953` |

测试注入 storage 时必须从 private manifest 或 QA 本地 env 读取完整 token；日志、截图、回包只能显示后 8 位。

#### 3.38.4 actual fixture 摘要

| 域 | 摘要 |
| --- | --- |
| party/session | `session-1781753066622-4b386b`，invite `YYRXUP`，title `周末聚会记录`，memberCount/joinedCount 均为 `3`。 |
| album/photos | album `album-session-1781753066622-4b386b`；公开已审照片 `moment-1781753066633-f2834ef5`、`moment-1781753066633-77ed7c40`；filtered/private 照片 `moment-1781753066634-f6807165`。 |
| ledger | ledger `ledger-session-1781753066622-4b386b`；事件 `event-1781753066634-5c3bb5cf`、`event-1781753066635-7c858ae1`；`participantCount=3`、`entryCount=2`、`pendingCount=1`、`addedCount=1`、`hasLedgerData=true`。 |
| brief | `brief-1781753066635-243583c1`；`photoHighlights=2`、`accountingHighlights=4`、`keyEvents=2`、`settlementSummary.status=open`。 |
| ready shareImage | `share-task-1781753066636-c3fc0fb3`；`status=ready`、`layoutMode=party_story`、`includeLedger=true`、PNG `900x1400`、sha256 `0607c4e9536a12cbf01878ef0eb2099b39bbdedbfff738a240dae73a18aff8cc`。 |
| failed shareImage | `share-task-1781753066749-c7c56b`；`status=failed`、`layoutMode=brief_story`、`imageUrl=""`、message `分享图暂时生成失败，请稍后重试。` |
| share return | `share-return-session-1781753066622-4b386b`；payload 含 `photoHighlights/accountingHighlights/ledgerSummary/keyEvents/shareNotice`。 |

`inspect --seed prcs-006` 当前 scan-before / 残留计数：`liveSessions=1`、`momentRecords=3`、`sessionEvents=2`、`sessionBriefs=1`、`shareImageTasks=2`、`uploadedAssets=3`、`photoFilesExisting=3`、`shareImageFilesExisting=1`。这是本轮保留给 QA/前端复跑的本地 actual fixture，不是 cleanup 失败。

#### 3.38.5 前端/测试页面 query

| 页面 | query |
| --- | --- |
| album | `/pages/album/index?partyId=session-1781753066622-4b386b&albumId=album-session-1781753066622-4b386b` |
| album unshared/filtered | `/pages/album/index?mode=unshared&partyId=session-1781753066622-4b386b&albumId=album-session-1781753066622-4b386b` |
| ledger | `/pages/ledger/index?partyId=session-1781753066622-4b386b&ledgerId=ledger-session-1781753066622-4b386b` |
| privacy filtered | `/pages/privacy-state/index?type=filtered&partyId=session-1781753066622-4b386b&shareId=share-return-session-1781753066622-4b386b` |
| brief | `/pages/session-brief/index?sessionId=session-1781753066622-4b386b&briefId=brief-1781753066635-243583c1` |
| share poster ready | `/pages/share-poster/index?briefId=brief-1781753066635-243583c1&taskId=share-task-1781753066636-c3fc0fb3` |
| share poster failed | `/pages/share-poster/index?briefId=brief-1781753066635-243583c1&taskId=share-task-1781753066749-c7c56b` |
| share return | `/pages/share-preview/index?shareId=share-return-session-1781753066622-4b386b&inviteCode=YYRXUP&briefId=brief-1781753066635-243583c1` |

测试准入说明：

- 推荐先用 host token 后 8 位 `a344ca32` 验证 album/ledger/brief/share poster ready/save；再用 memberA 后 8 位 `12d644a0` 验证成员态。
- API base 如需 HTTP 预览，应指向读取同一 JSON store 的本地后端；本 manifest 不能直接指向 `api.pomer.cn`，除非后续另派线上 seed。
- outsider 后 8 位 `4a136953` 与 no-token 只作为权限反例预留；本轮未执行接口负例。

#### 3.38.6 warnings / skipped

- `undeployed=true`：这是本地 actual clean fixture 证据，不是线上 `api.pomer.cn` 通过证据。
- 未复用旧 `INT-DATA-001`、旧 `006B/015/017` 或 005 token handoff 写 clean actual 通过。
- `reviewCaseIds`、`reportId` 仍未由后端 006 helper 生成。
- outsider/no-token API 401/403 负例未执行；只登记了 outsider profile/token 尾号，等待测试或后续接口联调任务。
- 本轮未 cleanup，`prcs-006` 本地数据和 PNG 文件保留给 QA/前端复跑。

#### 3.38.7 cleanup / 残留扫描计划

本轮不 cleanup。后续 PM 明确派 cleanup 后，先导出/确认测试证据，再执行：

```powershell
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-006
node backend/scripts/manage-clean-slate-actual-fixture.js --mode cleanup --seed prcs-006
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-006
```

预期 actual cleanup 后 `liveSessions/momentRecords/sessionEvents/sessionBriefs/shareImageTasks/uploadedAssets/photoFilesExisting/shareImageFilesExisting` 均为 `0`。如 PM 同时允许清理四角色 private profiles/tokens，再执行：

```powershell
node backend/scripts/manage-clean-slate-private-manifest.js --mode cleanup --seed prcs-006
```

清理前不得清理旧 009/011/final/share 样本，不得清理 `INT-DATA-001` 或其他 seed；只按 `seed=prcs-006` 精确回收。

### 3.39 `PR-INT-LINK-CLEANUP-DATA-008` 链路收缩复测样本

记录时间：2026-06-18。PM 派发 008，要求给前端/测试提供可复测样本和页面 query，并继续配合 006 sanitized manifest。本轮先读 `docs/party-recorder-redesign-requirements.md` 4.2、派发队列 006/008、接口联调 3.37/3.38 和后端/API 44。当前本地文档未发现独立后端 008 helper；接口联调使用后端 006 actual fixture helper 新建独立 `seed=prcs-008`，不复用旧 `INT-DATA-001`、旧 006B/015/017，也不把 006 样本冒充 008。完整 token 只在 private manifest；公开只写后 8 位。

#### 3.39.1 执行命令

```powershell
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-008
node backend/scripts/manage-clean-slate-actual-fixture.js --mode create --seed prcs-008 --output $env:TEMP\jiuzhuopanguan-private\pr-int-link-cleanup-PRCS-20260618-008-manifest.private.json
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-008
```

执行结果：

- create 前 `prcs-008` 残留为 0。
- private manifest 已生成到 `%TEMP%/jiuzhuopanguan-private/pr-int-link-cleanup-PRCS-20260618-008-manifest.private.json`，该文件含完整 token，不进入公开文档。
- 公开脱敏摘要已写入：
  - `docs/runtime/pr-int-link-cleanup-PRCS-20260618-008-sanitized.json`
  - `docs/runtime/pr-int-link-cleanup-PRCS-20260618-008-sanitized.md`
- 本轮未访问 `api.pomer.cn`，未写线上，未 cleanup。

#### 3.39.2 token 脱敏摘要

| role | profileId | 权限 | token 后 8 位 |
| --- | --- | --- | --- |
| host | `user-1781756527689-f2fbe0` | host | `20cf10b7` |
| memberA | `user-1781756527691-ff0197` | member | `4ea6c85e` |
| memberB | `user-1781756527691-ee3294` | member | `15b29b2c` |
| outsider | `user-1781756527692-596050` | outsider | `65792002` |

测试注入 storage 时必须从 private manifest 或 QA 本地 env 读取完整 token；日志和截图只能显示后 8 位。

#### 3.39.3 008 样本字段摘要

| 008 要求 | 字段 / 结论 |
| --- | --- |
| party/session | `session-1781756527692-d277f0`，invite `E52MK5`，title `周末聚会记录`，state `进行中`。 |
| 创建时间 | session `createdAt=2026-06-18T04:22:07.692Z`；brief `generatedAt=2026-06-18T04:22:07.875Z`；ready share task `createdAt=2026-06-18T04:22:07.713Z`。 |
| 首页最近相册第一张封面 | 第一张照片 URL：`/uploads/moments/session-1781756527692-d277f0/1781756527696-party-opening-1a4f80.webp`；可作为首页最近相册封面来源。 |
| 图片直显参与相册/简报/分享 | album、brief `photoHighlights`、share return payload 均包含第一张和第二张图片 URL；ready share PNG 已生成。 |
| 真实欠酒/加酒账本 | raw event types 为 `drink_debt`、`drink_add`；clean summary 为 `pendingCount=1`、`addedCount=1`、`entryCount=2`、`hasLedgerData=true`。 |
| 我创建的聚会简报图片 | brief `brief-1781756527712-95eff999`，`photoHighlights[0].imageUrl` 为第一张照片；host token 后 8 位 `20cf10b7`。 |
| ready shareImage | `share-task-1781756527713-442cb75c`，`status=ready`、`layoutMode=party_story`、`includeLedger=true`、PNG `900x1400`、sha256 `670fe376736b43f3ffd8e98d0ec33c18685c127341635e06ae265fa52a3392d0`。 |
| failed shareImage | `share-task-1781756527876-8bd75f`，`status=failed`、`imageUrl=""`、message `分享图暂时生成失败，请稍后重试。`。 |
| share return | `share-return-session-1781756527692-d277f0`；payload 含 `photoHighlights/accountingHighlights/ledgerSummary/keyEvents/shareNotice`。 |
| 工具箱 | 页面 `/pages/tools/index`；接口优先 `GET /tools/catalog`，点击记录 `POST /tools/history`；若接口失败，前端 `getManagedToolsCatalog()` 返回 `DEFAULT_TOOLS_CATALOG`，本地工具定义在 `miniprogram/utils/toolkit.ts`。基础工具箱点击不依赖本 party token。 |
| 拍第一张后进入进行中 | 起点 `/pages/moment-editor/index?sessionId=session-1781756527692-d277f0&nodeType=opening`；保存后预期 `/pages/live-record/index?sessionId=session-1781756527692-d277f0`。 |

#### 3.39.4 页面 query

| 页面 | query |
| --- | --- |
| 首页最近相册 | `/pages/index/index` |
| 拍第一张 | `/pages/moment-editor/index?sessionId=session-1781756527692-d277f0&nodeType=opening` |
| 保存后进行中 | `/pages/live-record/index?sessionId=session-1781756527692-d277f0` |
| host 进行中 | `/pages/live-record/index?sessionId=session-1781756527692-d277f0&role=host` |
| album | `/pages/album/index?partyId=session-1781756527692-d277f0&albumId=album-session-1781756527692-d277f0` |
| ledger | `/pages/ledger/index?partyId=session-1781756527692-d277f0&ledgerId=ledger-session-1781756527692-d277f0` |
| brief / 我创建的聚会简报 | `/pages/session-brief/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999` |
| share poster ready | `/pages/share-poster/index?briefId=brief-1781756527712-95eff999&taskId=share-task-1781756527713-442cb75c` |
| share poster failed | `/pages/share-poster/index?briefId=brief-1781756527712-95eff999&taskId=share-task-1781756527876-8bd75f` |
| share return | `/pages/share-preview/index?shareId=share-return-session-1781756527692-d277f0&inviteCode=E52MK5&briefId=brief-1781756527712-95eff999` |
| toolbox | `/pages/tools/index` |

#### 3.39.5 scan-before / 残留

`inspect --seed prcs-008` 当前计数：`liveSessions=1`、`momentRecords=3`、`sessionEvents=2`、`sessionBriefs=1`、`shareImageTasks=2`、`uploadedAssets=3`、`photoFilesExisting=3`、`shareImageFilesExisting=1`。

本轮保留 `prcs-008` 供前端/测试复测，不是 cleanup 失败。

#### 3.39.6 warnings / skipped

- 当前是本地 JSON store fixture，`undeployed=true`，不是线上 `api.pomer.cn` 通过证据。
- 未发现独立后端 008 helper，本轮用后端 006 actual helper 生成独立 008 seed；如后端/API 008 后续补 dedicated 合同，以后端 008 回包为准。
- `party.payload.coverImageUrl` 当前为空；008 复测的第一张封面来源应取 `photoHighlights[0].imageUrl` / `album.firstPhoto.imageUrl`。如果前端只消费 `coverImageUrl`，需退回后端/API 008 或前端映射。
- helper 仍输出 `reviewStatus=approved`；4.2 的“图片上传后直接展示”要由前端/后端 008 确认不再把人工审核状态作为直显阻塞。
- 未执行 outsider/no-token API 401/403 负例；outsider token 仅预留。
- 未生成 no-photo 默认封面样本；如测试必须覆盖“无照片默认封面”，需后端/API 或接口联调另开空相册 seed。
- 未生成 `reviewCaseIds/reportId`，不覆盖举报/审核样本。

#### 3.39.7 cleanup / 残留扫描计划

本轮不 cleanup。PM 另派 cleanup 后，只清 `seed=prcs-008`：

```powershell
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-008
node backend/scripts/manage-clean-slate-actual-fixture.js --mode cleanup --seed prcs-008
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-008
```

如 PM 同时允许清四角色 private profiles/tokens，再执行：

```powershell
node backend/scripts/manage-clean-slate-private-manifest.js --mode cleanup --seed prcs-008
```

不得清理 006/009/011/final/share 样本，不得清理 `INT-DATA-001` 或其他 seed。

### 3.40 `PR-INT-LINK-CLEANUP-DATA-008-FIX` 复测样本可读性修正

记录时间：2026-06-18。PM 追加收口：前端 14.52 使用 008 样本时，DevTools 9420 成员态返回 `brief not found` 和 share poster failed 空数据。本轮只做本地只读定位和公开脱敏证据更新，不改业务源码，不访问线上，不 cleanup。

#### 3.40.1 失败原文

| 页面 | 前端 14.52 query | 失败原文 |
| --- | --- | --- |
| brief | `/pages/session-brief/index?briefId=brief-1781756527712-95eff999` | `errorText=brief not found`、`timelineNodes=[]` |
| share poster | `/pages/share-poster/index?briefId=brief-1781756527712-95eff999&taskId=share-task-1781756527713-442cb75c` | `shareTask.status=failed`、`failedReason=分享图暂时无法展示，请稍后重试`、`photoHighlights=[]`、`accountingHighlights=[]`、`keyEvents=[]`、`readyShareImageUrl=""` |

#### 3.40.2 本地只读定位

执行命令：

```powershell
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-008
node -e "<local getSessionBrief/getShareImageTask + clean facade mapBrief/mapShareImage verification; profileId only>"
```

结论：

- `prcs-008` 样本未被 cleanup，本地 store 仍有 `liveSessions=1`、`momentRecords=3`、`sessionEvents=2`、`sessionBriefs=1`、`shareImageTasks=2`、`uploadedAssets=3`、`photoFilesExisting=3`、`shareImageFilesExisting=1`。
- 成员 profile `user-1781756527691-ff0197` 可在本地读到 raw brief：`brief-1781756527712-95eff999`，`sessionId=session-1781756527692-d277f0`，`timeline.nodes=5`。
- 成员 profile `user-1781756527691-ff0197` 可在本地读到 raw ready task：`share-task-1781756527713-442cb75c`，`status=ready`，`imageUrl=/uploads/moments/share-tasks/share-task-1781756527713-442cb75c.png`。
- clean facade 映射后 brief 有 `photoHighlights=2`、`accountingHighlights=4`、`keyEvents=2`、`ledgerSummary.entryCount=2/pendingCount=1/addedCount=1`。
- clean facade 映射后 share image 为 `status=ready`、`imageUrl=/uploads/moments/share-tasks/share-task-1781756527713-442cb75c.png`、`layoutMode=party_story`。

#### 3.40.3 原因判断

当前失败不是样本被清理，而是复测入口/合同使用不一致：

1. `prcs-008` 是本地 JSON store 样本，`undeployed=true`。如果 DevTools API base 仍为 `https://api.pomer.cn/api/v1`，线上不会有 `brief-1781756527712-95eff999`，因此返回 `brief not found`。
2. 前端 14.52 brief query 少了 `sessionId`。建议复测必须带 `sessionId=session-1781756527692-d277f0`，避免页面只靠 `briefId` 加载失败后无上下文。
3. clean 聚合字段来自 clean facade 路由：`GET /api/v1/briefs/:briefId` 与 `GET /api/v1/share-images/:taskId`。当前前端服务层仍使用 legacy/raw `GET /api/v1/session-briefs/:briefId` 与 `GET /api/v1/share-image-tasks/:taskId`；raw task 可返回 ready 状态，但 raw brief 不保证直接携带 clean `photoHighlights/accountingHighlights/keyEvents` 聚合字段。前端/API 需对齐 clean facade 路由或补 raw 路由字段 parity。

#### 3.40.4 FIX 复测包

证据文件：

- `docs/runtime/pr-int-link-cleanup-PRCS-20260618-008-fix-sanitized.md`
- 继续沿用 `docs/runtime/pr-int-link-cleanup-PRCS-20260618-008-sanitized.json`
- 继续沿用 `docs/runtime/pr-int-link-cleanup-PRCS-20260618-008-sanitized.md`

token 后 8 位：

| role | profileId | token 后 8 位 |
| --- | --- | --- |
| host | `user-1781756527689-f2fbe0` | `20cf10b7` |
| memberA | `user-1781756527691-ff0197` | `4ea6c85e` |
| memberB | `user-1781756527691-ee3294` | `15b29b2c` |
| outsider | `user-1781756527692-596050` | `65792002` |

完整 token 只允许 QA 从 private/env 注入；公开日志只写后 8 位。

推荐 storage / API base：

```text
runtime-api-base = http://127.0.0.1:3221/api/v1
memberA token tail = 4ea6c85e
```

本地后端需读取同一工作区 JSON store。若未启动本地后端，本轮只提供数据层只读证据，不写 HTTP 通过。

推荐页面 query：

| 页面 | query |
| --- | --- |
| brief | `/pages/session-brief/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999` |
| share poster ready | `/pages/share-poster/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999&taskId=share-task-1781756527713-442cb75c` |
| share return | `/pages/share-preview/index?shareId=share-return-session-1781756527692-d277f0&inviteCode=E52MK5&briefId=brief-1781756527712-95eff999` |
| album | `/pages/album/index?partyId=session-1781756527692-d277f0&albumId=album-session-1781756527692-d277f0` |
| ledger | `/pages/ledger/index?partyId=session-1781756527692-d277f0&ledgerId=ledger-session-1781756527692-d277f0` |

如测试改走 HTTP clean facade，可先读：

```powershell
curl.exe -H "Authorization: Bearer <memberA-token-from-private-env>" http://127.0.0.1:3221/api/v1/briefs/brief-1781756527712-95eff999
curl.exe -H "Authorization: Bearer <memberA-token-from-private-env>" http://127.0.0.1:3221/api/v1/share-images/share-task-1781756527713-442cb75c
```

#### 3.40.5 warnings / skipped

- 本轮未访问 `api.pomer.cn`，未触碰 `pomer.cn` 官网。
- 本轮未执行 cleanup。
- private manifest 文件在 `%TEMP%` 当前不可读，本轮未重新生成或输出完整 token；复测仍应使用既有 private/env token handoff。
- 未运行 DevTools 9420 命令；PM 指示避免 approval 阻塞，本轮只做本地只读定位和脱敏证据。
- 如果前端仍固定调用 raw `/session-briefs/:id` 和 `/share-image-tasks/:id`，页面可能继续拿不到 clean 聚合字段；这是前端/API 合同对齐问题，不是 `prcs-008` 样本不存在。

#### 3.40.6 cleanup / 残留口径

继续保留 `prcs-008` 给测试复跑。后续 PM 明确派 cleanup 后，只清 `seed=prcs-008`：

```powershell
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-008
node backend/scripts/manage-clean-slate-actual-fixture.js --mode cleanup --seed prcs-008
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-008
```

不得清理 006/009/011/final/share 样本，不得清理 `INT-DATA-001` 或其他 seed。

### 3.41 `PR-INT-LOCAL-API-3221-008D-RUNTIME` 本地 3221 运行准入

记录时间：2026-06-18。PM 新派 008D：008B/008C 剩余阻塞集中在本地 `http://127.0.0.1:3221/api/v1` 未运行或未读取当前 store。本轮只做接口联调职责内的本地运行准入：启动/确认本地服务、只读验证 clean facade 与 PNG，不触碰线上、不 cleanup、不泄露完整 token，不把接口可读写成页面通过。

#### 3.41.1 本地后端命令 / cwd / PID

应启动命令：

```powershell
$env:PORT='3221'
npm.cmd --prefix backend start
```

本轮实际用后台进程启动：

```powershell
$env:PORT='3221'
Start-Process -FilePath 'C:\Program Files\nodejs\npm.cmd' -ArgumentList '--prefix','backend','start' -WorkingDirectory 'F:\codexlist\jiuzhuopanguan' -RedirectStandardOutput 'docs/runtime/pr-int-local-api-3221-008d.out.log' -RedirectStandardError 'docs/runtime/pr-int-local-api-3221-008d.err.log' -WindowStyle Hidden
```

运行结果：

| 项 | 值 |
| --- | --- |
| cwd | `F:\codexlist\jiuzhuopanguan` |
| store | `F:\codexlist\jiuzhuopanguan\backend\data` |
| API base | `http://127.0.0.1:3221/api/v1` |
| Listen | `::3221` |
| PID | `30080` |
| Process | `node.exe` |
| Command line | `node server.js` |
| stdout | `docs/runtime/pr-int-local-api-3221-008d.out.log` |
| stderr | `docs/runtime/pr-int-local-api-3221-008d.err.log` |

日志尾部：`jiuzhuopanguan backend listening on port 3221`。

#### 3.41.2 storage / token 前置

成员态建议使用 memberA：

| role | profileId | token 后 8 位 |
| --- | --- | --- |
| memberA | `user-1781756527691-ff0197` | `4ea6c85e` |

DevTools storage：

```text
runtime-api-base = http://127.0.0.1:3221/api/v1
jzp-user-token = <memberA-token-from-private-env>
social-current-profile-id = user-1781756527691-ff0197
```

完整 token 只能从 private/env 注入；公开日志只写后 8 位。

#### 3.41.3 只读接口验证摘要

| 接口 | HTTP / code | 摘要 |
| --- | --- | --- |
| `GET /api/v1/config/home` | `200 / 0` | `quickTools=4`。 |
| `GET /api/v1/briefs/brief-1781756527712-95eff999` | `200 / 0` | `photoHighlights=2`、`accountingHighlights=4`、`keyEvents=2`、`ledgerSummary.entryCount=2/pendingCount=1/addedCount=1/hasLedgerData=true`、`firstPhotoUrl=/uploads/moments/session-1781756527692-d277f0/1781756527696-party-opening-1a4f80.webp`。 |
| `GET /api/v1/share-images/share-task-1781756527713-442cb75c` | `200 / 0` | `status=ready`、`imageUrl=/uploads/moments/share-tasks/share-task-1781756527713-442cb75c.png`、`layoutMode=party_story`、`includeLedger=true`。 |
| `HEAD /uploads/moments/share-tasks/share-task-1781756527713-442cb75c.png` | `404` | `content-type=application/json; charset=utf-8`。静态 HEAD 当前不通。 |
| `GET /uploads/moments/share-tasks/share-task-1781756527713-442cb75c.png` | `200` | `content-type=image/png`、`byteLength=167268`、PNG signature `89504e470d0a1a0a`。 |

结论：本地 3221 已读取当前 store，clean brief 与 clean share image 可读；PNG GET 可达。HEAD 404 是静态 HEAD 支持缺口，不能单独判定 PNG 不存在。

#### 3.41.4 证据文件

- `docs/runtime/pr-int-local-api-3221-008d-runtime.md`
- 日志：`docs/runtime/pr-int-local-api-3221-008d.out.log`
- 日志：`docs/runtime/pr-int-local-api-3221-008d.err.log`

#### 3.41.5 测试可复跑页面 query

| 页面 | query |
| --- | --- |
| brief | `/pages/session-brief/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999` |
| share poster ready | `/pages/share-poster/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999&taskId=share-task-1781756527713-442cb75c` |
| share preview | `/pages/share-preview/index?shareId=share-return-session-1781756527692-d277f0&inviteCode=E52MK5&briefId=brief-1781756527712-95eff999` |
| live record | `/pages/live-record/index?sessionId=session-1781756527692-d277f0&role=member` |
| ledger | `/pages/ledger/index?partyId=session-1781756527692-d277f0&ledgerId=ledger-session-1781756527692-d277f0` |
| album | `/pages/album/index?partyId=session-1781756527692-d277f0&albumId=album-session-1781756527692-d277f0` |

#### 3.41.6 warnings / skipped / cleanup 口径

- 本轮未访问 `api.pomer.cn`，未触碰 `pomer.cn` 官网。
- 本轮未 cleanup `prcs-008`，也未停止本地服务；PID `30080` 保留给 QA 复测。
- 本轮只证明本地接口可读，不代表 DevTools 页面通过；测试仍需记录 Console/Network/storage/page data 和截图。
- PNG `HEAD` 为 404，`GET` 为 200；如测试准入必须 HEAD 200，需退回后端/API 补静态 HEAD 支持。
- 后续如 PM 要停止本地服务，只停止 PID `30080`；不得 cleanup 006/009/011/final/share 样本，也不得 cleanup `prcs-008`，除非 PM 另派。

### 3.42 `PR-INT-LINK-CLEANUP-008G-NONWHITE-PHOTO-FIXTURE` 非白图照片样本

记录时间：2026-06-18。PM 新派 008G：`prcs-008` 两张照片样本本体为 `1x1` 全白 WebP，不能证明真实照片渲染通过。本轮只在接口联调职责内准备本地可清理样本，不触发 DevTools，不访问线上，不 cleanup 既有 `prcs-008`。新增独立 `seed=prcs-008g`，并将该 seed 的两张公开照片文件替换为非 1x1、非纯白、可视觉识别的 WebP。

#### 3.42.1 执行命令

```powershell
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-008g
node backend/scripts/manage-clean-slate-actual-fixture.js --mode create --seed prcs-008g --output $env:TEMP\jiuzhuopanguan-private\pr-int-link-cleanup-PRCS-20260618-008g-manifest.private.json
node -e "<overwrite prcs-008g opening/highlight photo files with non-white 640x420 WebP and print stats>"
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-008g
```

3221 已在样本生成后重启以读取最新 store：

| 项 | 值 |
| --- | --- |
| PID | `18088` |
| cwd | `F:\codexlist\jiuzhuopanguan` |
| API base | `http://127.0.0.1:3221/api/v1` |
| 启动命令 | `PORT=3221 npm.cmd --prefix backend start` |
| stdout | `docs/runtime/pr-int-local-api-3221-008g.out.log` |
| stderr | `docs/runtime/pr-int-local-api-3221-008g.err.log` |

#### 3.42.2 样本 ID / token 尾号

| 字段 | 值 |
| --- | --- |
| sessionId | `session-1781787045680-8e406c` |
| inviteCode | `J2BEL2` |
| albumId | `album-session-1781787045680-8e406c` |
| briefId | `brief-1781787045693-bc8904b9` |
| ready shareTaskId | `share-task-1781787045694-9725ffeb` |
| failed shareTaskId | `share-task-1781787045808-5d5b28` |
| returnShareId | `share-return-session-1781787045680-8e406c` |
| host token tail | `ddceb616` |
| memberA token tail | `b8615971` |
| memberB token tail | `c9c5b046` |
| outsider token tail | `bf8bf64b` |

推荐测试使用 memberA，token 后 8 位 `b8615971`。完整 token 只在 private/env，不写公开文档。

#### 3.42.3 非白图照片证明

| 照片 | imageUrl | 文件路径 | 尺寸 / bytes | SHA-256 | 像素摘要 |
| --- | --- | --- | --- | --- | --- |
| opening | `/uploads/moments/session-1781787045680-8e406c/1781787045682-party-opening-c85a76.webp` | `backend/public/uploads/moments/session-1781787045680-8e406c/1781787045682-party-opening-c85a76.webp` | `640x420` / `14402` | `4176f7a72273adc5a7edb25b91650c1fba337e82dedc0f0bd501c9a8626786ec` | R `11/255/89.74`、G `18/255/125.46`、B `6/255/98.37` |
| highlight | `/uploads/moments/session-1781787045680-8e406c/1781787045687-party-highlight-a07ad1.webp` | `backend/public/uploads/moments/session-1781787045680-8e406c/1781787045687-party-highlight-a07ad1.webp` | `640x420` / `15388` | `b5b1c05139110a23fe965eebcc0fa8aae0e87fec10f63164c64ec32d559f9190` | R `10/255/125.42`、G `13/255/77.56`、B `13/255/130.31` |

结论：两张图片均大于 `8x8`，非 `1x1`，像素通道 min 明显小于 255，mean 不是 255，能证明不是纯白图。图片 GET 也已返回 `200`。

#### 3.42.4 clean facade 可读性

成员态 token 尾号：`b8615971`。

| 接口 | HTTP / code | 摘要 |
| --- | --- | --- |
| `GET /api/v1/briefs/brief-1781787045693-bc8904b9` | `200 / 0` | `photoHighlights=2`、`accountingHighlights=4`、`keyEvents=2`、`ledgerSummary.entryCount=2/pendingCount=1/addedCount=1/hasLedgerData=true`。 |
| `GET /api/v1/share-images/share-task-1781787045694-9725ffeb` | `200 / 0` | `status=ready`、`imageUrl=/uploads/moments/share-tasks/share-task-1781787045694-9725ffeb.png`、`layoutMode=party_story`、`includeLedger=true`。 |
| `GET` opening/highlight image URLs | `200` | opening `14402` bytes，highlight `15388` bytes。 |

#### 3.42.5 测试页面 query

| 页面 | query |
| --- | --- |
| brief | `/pages/session-brief/index?sessionId=session-1781787045680-8e406c&briefId=brief-1781787045693-bc8904b9` |
| share poster ready | `/pages/share-poster/index?sessionId=session-1781787045680-8e406c&briefId=brief-1781787045693-bc8904b9&taskId=share-task-1781787045694-9725ffeb` |
| share preview | `/pages/share-preview/index?shareId=share-return-session-1781787045680-8e406c&inviteCode=J2BEL2&briefId=brief-1781787045693-bc8904b9` |
| live record | `/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=member` |
| ledger | `/pages/ledger/index?partyId=session-1781787045680-8e406c&ledgerId=ledger-session-1781787045680-8e406c` |
| album | `/pages/album/index?partyId=session-1781787045680-8e406c&albumId=album-session-1781787045680-8e406c` |

#### 3.42.6 证据文件

- `docs/runtime/pr-int-link-cleanup-PRCS-20260618-008g-nonwhite-photo-sanitized.md`

#### 3.42.7 cleanup / 残留

当前 `inspect --seed prcs-008g` 计数：`liveSessions=1`、`momentRecords=3`、`sessionEvents=2`、`sessionBriefs=1`、`shareImageTasks=2`、`uploadedAssets=3`、`photoFilesExisting=3`、`shareImageFilesExisting=1`。

本轮不 cleanup。PM 明确派 cleanup 后，只清 `seed=prcs-008g`：

```powershell
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-008g
node backend/scripts/manage-clean-slate-actual-fixture.js --mode cleanup --seed prcs-008g
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-008g
```

如 PM 同时允许清 private profiles/tokens：

```powershell
node backend/scripts/manage-clean-slate-private-manifest.js --mode cleanup --seed prcs-008g
```

不得 cleanup 既有 `prcs-008`、006/009/011/final/share 样本或 `INT-DATA-001`。

#### 3.42.8 warnings / skipped

- DevTools 当前硬冻结，本轮未触发微信开发者工具，不写页面通过。
- 未访问 `api.pomer.cn`，未触碰 `pomer.cn` 官网。
- ready share PNG 是替换照片文件前生成的；本轮证明的是页面消费的 photo imageUrl 非白图，不证明 ready PNG 已嵌入新照片。
- 本地 `prcs-008g` 残留为预期保留，供 008G 复测使用。

### 3.43 `PR-INT-LINK-CLEANUP-008V-SHARE-RETURN-PHOTO-SAMPLE` 分享回流照片样本只读判断

记录时间：2026-06-18。PM 新派 008V：测试 13.16.91 已证明分享回流分流 data 存在，`briefId=brief-1781756527712-95eff999` 时 `shareReturnMode=true`、`photoHighlights=2`、`accountingHighlights=4`、`keyEvents=2`，但两项照片均 `imageBroken=true`。本轮只读核查旧 008 brief / share return 样本的图片 URL 和本地文件，不触发 DevTools，不访问线上，不 cleanup。

#### 3.43.1 旧 008 API 摘要

API base：`http://127.0.0.1:3221/api/v1`。成员态 token 后 8 位：`4ea6c85e`。

`GET /api/v1/briefs/brief-1781756527712-95eff999`：

| 字段 | 结果 |
| --- | --- |
| HTTP / code | `200 / 0` |
| partyId | `session-1781756527692-d277f0` |
| photoHighlights | `2` |
| accountingHighlights | `4` |
| keyEvents | `2` |
| ledgerSummary | `entryCount=2`、`pendingCount=1`、`addedCount=1` |

返回的照片字段与前端消费字段一致：前端 `share-preview` 读取 `photoHighlights[].imageUrl`。

| 照片 | `photoHighlights[].imageUrl` | 本地 GET | bytes |
| --- | --- | --- | ---: |
| opening | `/uploads/moments/session-1781756527692-d277f0/1781756527696-party-opening-1a4f80.webp` | `200` | `44` |
| highlight | `/uploads/moments/session-1781756527692-d277f0/1781756527702-party-highlight-19e9f0.webp` | `200` | `44` |

#### 3.43.2 图片本体像素摘要

| imageUrl | 文件路径 | 尺寸 | SHA-256 | 像素摘要 |
| --- | --- | --- | --- | --- |
| `/uploads/moments/session-1781756527692-d277f0/1781756527696-party-opening-1a4f80.webp` | `backend/public/uploads/moments/session-1781756527692-d277f0/1781756527696-party-opening-1a4f80.webp` | `1x1`、`44` bytes | `eac5d3acc16c45bcc21ffe69595acdf4a7ad06758c3a180d08ec60a93cc4ee3a` | RGB 全通道 `min=255/max=255/mean=255` |
| `/uploads/moments/session-1781756527692-d277f0/1781756527702-party-highlight-19e9f0.webp` | `backend/public/uploads/moments/session-1781756527692-d277f0/1781756527702-party-highlight-19e9f0.webp` | `1x1`、`44` bytes | `eac5d3acc16c45bcc21ffe69595acdf4a7ad06758c3a180d08ec60a93cc4ee3a` | RGB 全通道 `min=255/max=255/mean=255` |

前端 `share-preview` 的 `handlePhotoImageLoad()` 在图片加载宽高均小于 `8` 时会设置 `imageBroken=true`；因此旧 008 两张 `1x1` 全白 WebP 被标记为 `imageBroken=true` 属于合理的样本质量暴露，不是分享回流分流字段缺失。

#### 3.43.3 样本责任判断

- 旧 008 `brief-1781756527712-95eff999` 可证明 URL 字段存在且本地 GET 可读。
- 旧 008 不能证明真实照片视觉通过，因为两张图片本体都是 `1x1` 全白 WebP。
- 字段责任：前端消费 `photoHighlights[].imageUrl` 与接口返回字段一致，本轮只读未发现字段名不一致。
- 样本责任：旧 008 照片样本质量不足，应由接口 fixture / 样本数据侧承担；前端将其标记 `imageBroken=true` 合理。
- 如果 PM 要保留旧 008 briefId 作为唯一复测样本，需要后端/API 或接口 fixture 侧替换这两张图片文件或重建该 seed；本轮不修改旧 008。

#### 3.43.4 可复测建议

旧 008 回流 query：

```text
/pages/share-preview/index?sessionId=session-1781756527692-d277f0&inviteCode=E52MK5&briefId=brief-1781756527712-95eff999
```

该 query 只能证明分享回流 data 分流和 URL 可读，不能写真实照片视觉通过。

推荐测试切到 3.42 已准备的非白图样本 `prcs-008g`：

| 字段 | 值 |
| --- | --- |
| sessionId | `session-1781787045680-8e406c` |
| inviteCode | `J2BEL2` |
| briefId | `brief-1781787045693-bc8904b9` |
| ready shareTaskId | `share-task-1781787045694-9725ffeb` |
| memberA token 后 8 位 | `b8615971` |

推荐 008V 复测 query：

```text
/pages/share-preview/index?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2&briefId=brief-1781787045693-bc8904b9
```

3.42 已记录 `prcs-008g` 两张照片均为 `640x420` 非纯白 WebP，clean facade 可读且 `photoHighlights/accountingHighlights/keyEvents` 均非空。

#### 3.43.5 证据 / cleanup 口径

证据文件：

- `docs/runtime/pr-int-link-cleanup-PRCS-20260618-008v-share-return-photo-sample.md`
- 可引用 3.42 证据：`docs/runtime/pr-int-link-cleanup-PRCS-20260618-008g-nonwhite-photo-sanitized.md`

本轮不 cleanup，不访问 `api.pomer.cn`，不触碰 `pomer.cn` 官网，不泄露完整 token。保留旧 `prcs-008` 与新 `prcs-008g` 给后续单点复测。后续如 PM 要清理，只能按明确 seed 执行；不得清理 006/009/011/final/share 或 `INT-DATA-001`。

### 3.44 `PR-INT-LINK-CLEANUP-008V-STORAGE-SAMPLE-HANDOFF` 008g 成员态 storage 交接

记录时间：2026-06-18。PM 补充：测试按 `prcs-008g` 非白图 query 复测时，DevTools storage 仍是旧 `prcs-008` memberA token 尾号 `4ea6c85e`，而 `prcs-008g` memberA token 尾号是 `b8615971`，导致打开 008g query 后 `photoHighlights/accountingHighlights/keyEvents=[]`。本轮只提供接口联调职责内的安全 storage handoff，不触发 DevTools、不访问线上、不 cleanup、不泄露完整 token。

#### 3.44.1 样本 / 登录态对应关系

| 样本 | sessionId | memberA profileId | token 后 8 位 |
| --- | --- | --- | --- |
| 旧 `prcs-008` | `session-1781756527692-d277f0` | `user-1781756527691-ff0197` | `4ea6c85e` |
| 非白图 `prcs-008g` | `session-1781787045680-8e406c` | `user-1781787045679-f3f2eb` | `b8615971` |

本地 `social-store` 只读确认两组 token 均存在且未打印完整 token。3221 当前监听 PID `18088`，API base `http://127.0.0.1:3221/api/v1`。

#### 3.44.2 推荐方案：切到 008g memberA storage

DevTools storage 目标值：

| storage key | 设置值 |
| --- | --- |
| `runtime-api-base` | `http://127.0.0.1:3221/api/v1` |
| `jzp-user-token` | `prcs-008g` memberA 完整 token，只能由 QA 从 private/env 注入；公开只写后 8 位 `b8615971` |
| `social-current-profile-id` | `user-1781787045679-f3f2eb` |
| `social-current-profile` | `{ "id": "user-1781787045679-f3f2eb", "name": "聚会记录师成员A", "avatarUrl": "", "signature": "", "identityTag": "" }` |

安全摘要只允许写：

```json
{
  "apiBase": "http://127.0.0.1:3221/api/v1",
  "profileId": "user-1781787045679-f3f2eb",
  "tokenTail": "b8615971",
  "tokenPresent": true
}
```

#### 3.44.3 推荐测试 query

主复测 query：

```text
/pages/share-preview/index?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2&briefId=brief-1781787045693-bc8904b9
```

参考 query：

```text
/pages/session-brief/index?sessionId=session-1781787045680-8e406c&briefId=brief-1781787045693-bc8904b9
/pages/share-poster/index?sessionId=session-1781787045680-8e406c&briefId=brief-1781787045693-bc8904b9&taskId=share-task-1781787045694-9725ffeb
```

#### 3.44.4 恢复步骤摘要

如果 QA 后续需要回到旧 `prcs-008` 样本，再把 storage 切回：

| storage key | 恢复值 |
| --- | --- |
| `runtime-api-base` | `http://127.0.0.1:3221/api/v1` |
| `jzp-user-token` | 旧 `prcs-008` memberA 完整 token，只能从 private/env 注入；公开只写后 8 位 `4ea6c85e` |
| `social-current-profile-id` | `user-1781756527691-ff0197` |

不得把 `wechat:auto --storage` 原始输出原样贴进测试报告，避免泄露完整 token。

#### 3.44.5 备选方案判断

当前不建议新增同旧 token `4ea6c85e` 的非白图样本，因为 `prcs-008g` 已满足非白图、clean facade 可读、照片/账本/事件非空；本轮阻塞是 storage 登录态不匹配。若 QA 无法安全切换 DevTools storage，再由 PM 另派接口/后端 fixture 任务：在旧 `prcs-008` memberA 可访问范围内生成或替换非白图样本。

#### 3.44.6 证据 / cleanup

证据文件：

- `docs/runtime/pr-int-link-cleanup-PRCS-20260618-008v-storage-sample-handoff.md`

本轮未触发 DevTools、未访问 `api.pomer.cn`、未触碰 `pomer.cn`、未 cleanup、未输出完整 token。不写页面通过或测试通过。

### 3.45 `PR-FE-INT-LINK-CLEANUP-008X-FIRST-PHOTO-COVER-CONTRACT` 首页首张照片封面合同只读核查

记录时间：2026-06-19。PM 审计发现首页最近相册当前使用 `coverPhotoUrl || first timeline image`，如果后端 `coverPhotoUrl` 不是上传的第一张照片，则不能严格满足“封面展示上传第一张照片”。本轮只读 `docs/runtime/pm-objective-coverage-20260619.md` 和队列 008X 行，并在本地 3221 / 当前 store 上核查样本字段；不触发 DevTools、不访问线上、不 cleanup、不输出完整 token。

#### 3.45.1 只读样本 / API base

| 项 | 值 |
| --- | --- |
| API base | `http://127.0.0.1:3221/api/v1` |
| 本地 3221 PID | `18088` |
| 样本 A | `prcs-008g`：`session-1781787045680-8e406c` / `brief-1781787045693-bc8904b9` / memberA token 后 8 位 `b8615971` |
| 样本 B | 旧 `prcs-008`：`session-1781756527692-d277f0` / `brief-1781756527712-95eff999` / memberA token 后 8 位 `4ea6c85e` |

本轮完整 token 只从本地 `backend/data/social-store.json` 读取用于 HTTP 鉴权，日志和文档只保留后 8 位。

#### 3.45.2 字段摘要

| 样本 | `GET /user/session-moment-summaries` | `GET /briefs/:briefId` | 与“上传第一张照片”关系 |
| --- | --- | --- | --- |
| `prcs-008g` | HTTP `200` / `code=0`；summary 找到；返回 keys 不含 `coverPhotoUrl` / `coverImageUrl`，对应值为空 | HTTP `200` / `code=0`；`photoHighlights=2`；`photoHighlights[0].imageUrl=/uploads/moments/session-1781787045680-8e406c/1781787045687-party-highlight-a07ad1.webp` | 不严格。008g 的 opening 图是 `/uploads/moments/session-1781787045680-8e406c/1781787045682-party-opening-c85a76.webp`，但 brief 首图返回 highlight；两个公开 moment `createdAt` 相同，store 顺序使 highlight 在前 |
| 旧 `prcs-008` | HTTP `200` / `code=0`；summary 找到；返回 keys 不含 `coverPhotoUrl` / `coverImageUrl`，对应值为空 | HTTP `200` / `code=0`；`photoHighlights=2`；`photoHighlights[0].imageUrl=/uploads/moments/session-1781756527692-d277f0/1781756527696-party-opening-1a4f80.webp` | 当前旧样本碰巧等于 opening / 第一张，但该样本照片本体仍是 1x1 白图，且不能证明合同严格 |

前端源码口径：

- `miniprogram/pages/index/index.ts`：`mapRecentAlbumsFromSummaries()` 先取 `item.coverPhotoUrl`，为空时才调用 `findFirstBriefPhoto(brief)`。
- `findFirstBriefPhoto(brief)` 取第一个 `nodeKind === 'moment' && imageUrl` 的 timeline 节点。
- `miniprogram/services/operations.ts`：当 brief 没有 `timeline` 时，会用 clean brief 的 `photoHighlights` 构造 timeline，因此 `photoHighlights[0]` 会影响首页 fallback 首图。

后端源码口径：

- `backend/data/moments.js#getUserSessionMomentSummaries()` 当前未返回 `coverPhotoUrl` / `coverImageUrl`。
- `backend/data/moments.js` brief 生成逻辑按可见 nodes 得到 `photoHighlights`，再设置 `coverPhotoUrl=photoHighlights[0]?.imageUrl || ''`。
- `backend/data/clean-slate.js` party live payload 使用 `liveSession.coverPhotoUrl || photoHighlights[0]?.imageUrl`，如果未来 `liveSession.coverPhotoUrl` 与首张上传照片不同，会覆盖 brief 首图。

#### 3.45.3 结论 / 退回对象

接口侧结论：008X 不能写成“严格展示上传第一张照片”已覆盖。当前本地 `session-moment-summaries` 没有返回封面字段，首页会 fallback 到 brief 首图；但 `prcs-008g` 已证明 brief 首图可能不是用户意图上的第一张 uploaded/opening 照片。若后端未来返回 `coverPhotoUrl`，前端当前优先级还会让 `coverPhotoUrl` 覆盖 brief 首图，合同更不严格。

建议退回：

- 前端 008X：若目标是严格“上传第一张照片”，首页最近相册应优先使用确定的 first uploaded/timeline photo 字段，不应优先信任泛义 `coverPhotoUrl`。
- 后端/API 后续：如产品希望 `coverPhotoUrl` 即为权威封面，需新增或收紧字段合同，明确 `coverPhotoUrl` / `firstUploadedPhotoUrl` 必须等于首张公开/可见上传照片，并用上传时间或创建序列做确定性排序；否则接口联调只能标“合同不严 / 待补字段”。

#### 3.45.4 证据 / cleanup 口径

证据文件：

- `docs/runtime/pr-int-link-cleanup-PRCS-20260619-008x-first-photo-cover-contract.md`

本轮未触发 DevTools、未访问 `api.pomer.cn`、未触碰 `pomer.cn`、未 cleanup、未输出完整 token。保留 `prcs-008` 与 `prcs-008g` 供后续复测；不得把“接口可读”写成页面通过。

### 3.46 `PR-INT-LINK-CLEANUP-008AB-NO-PHOTO-DEFAULT-COVER-SAMPLE` 无图默认封面样本只读查找

记录时间：2026-06-19。PM 派发 008AB：测试 13.16.94 已确认 008g 有照片首图封面预览框阶段通过，剩余缺口是“无图默认封面”。本轮只读 PM objective 指定行和测试 13.16.94，并查找本地/runtime/fixture 中是否已有“无照片但有 session summary / album item”的可复用样本；不触发 DevTools、不访问线上、不 cleanup、不输出完整 token。

#### 3.46.1 读取范围 / 当前目标

| 文件 | 只读结论 |
| --- | --- |
| `docs/runtime/pm-objective-coverage-20260619.md` | `Home recent album cover should show uploaded first photo, fallback if none` 当前状态为 008g 首图预览框通过，但 no-photo default 未测 |
| `docs/gameplay-moments-test-acceptance-plan.md` 13.16.94 | 首页最近相册和相册列表使用 008g `opening` 首图，单点预览框阶段通过；未验证项包含无图默认封面 |

#### 3.46.2 本地无图候选

本地 `admin-store` 存在三条无照片静态 session，但不能作为最近相册 / 相册列表默认封面样本：

| sessionId | inviteCode | moment images | briefId | reportId | token 尾号 | 判断 |
| --- | --- | ---: | --- | --- | --- | --- |
| `session-1` | `A17K9Q` | `0` | 空 | 空 | 空 | 无成员 summary，不能驱动首页最近相册 |
| `session-2` | `N27K9Q` | `0` | 空 | 空 | 空 | 无成员 summary，不能驱动首页最近相册 |
| `session-3` | `N37K9Q` | `0` | 空 | 空 | 空 | 无成员 summary，不能驱动首页最近相册 |

`GET /config/home` 当前返回 `hero/quickTools/banner/judge`，不包含 `recentTools` 或 `recentAlbums`，因此首页最近相册运行态仍依赖 `GET /user/session-moment-summaries`。

#### 3.46.3 成员 summary 扫描摘要

| token 后 8 位 | `GET /user/session-moment-summaries` | 结果 |
| --- | --- | --- |
| `b8615971` | HTTP `200` / `code=0` / `count=1` | 008g，有照片，不是无图默认样本 |
| `4ea6c85e` | HTTP `200` / `code=0` / `count=2` | 两个 summary item 均有 brief/local 照片，不是无图默认样本 |
| `a9f69589` | HTTP `200` / `code=0` / `count=1` | INT-DATA，有照片，不是无图默认样本 |
| `ddceb616` | HTTP `200` / `code=0` / `count=1` | 008g host，有照片，不是无图默认样本 |
| `20cf10b7` | HTTP `200` / `code=0` / `count=1` | 旧 008 host，有照片，不是无图默认样本 |
| `a344ca32` | HTTP `200` / `code=0` / `count=1` | 006，有照片，不是无图默认样本 |

近似样本 `session-1781773386962-1c89d2` / `brief-1781773415317-72a8d020` / token 尾号 `4ea6c85e` 虽然 summary `coverPhotoUrl=""`、`coverImageUrl=""`，但 `GET /briefs/brief-1781773415317-72a8d020` 返回 `photoHighlights=2`，本地 `momentRecords.imageUrl` 为 `2`，不能作为无图样本。

#### 3.46.4 结论 / 补样方案

当前无可复用无图样本。不得使用 `prcs-008`、`prcs-008g`、006 或 `INT-DATA-001` 冒充“无照片默认封面”覆盖，因为这些样本都有照片；`session-1/2/3` 虽然无照片，但缺少最近相册所需的成员 summary / brief / token 证据。

最小可行补样方案：由后端/API 或接口 fixture 负责人在本地新增 seed `prcs-008ab-no-photo`，字段合同如下：

| 字段 | 要求 |
| --- | --- |
| `sessionId` / `inviteCode` | 固定可复跑 ID |
| host/member profile + token | 公开只写 token 后 8 位 |
| session report / summary row | `GET /user/session-moment-summaries` 能返回该 session item |
| `briefId` | 可为空 brief 或有效 empty brief；前端 query 可复跑 |
| cover 字段 | `coverPhotoUrl=""`、`coverImageUrl=""` |
| 图片字段 | 无 `momentRecords.imageUrl`、无 brief `photoHighlights`、无 timeline image node |
| 预期 UI | 首页最近相册 / 相册列表显示默认封面资产 |
| cleanup | 按 seed 精确清理 session/report/brief/profile/token，并做 scan-before / cleanup / scan-after |

本轮未执行本地写入。创建该 seed 需要 PM 另派 fixture 写入任务或明确允许本地测试数据写入；不需要线上 `api.pomer.cn` 写入。

#### 3.46.5 证据 / cleanup 口径

证据文件：

- `docs/runtime/pr-int-link-cleanup-PRCS-20260619-008ab-no-photo-default-cover-sample.md`

本轮未触发 DevTools、未访问 `api.pomer.cn`、未触碰 `pomer.cn`、未 cleanup、未输出完整 token。不写页面通过或测试通过。

### 3.47 `PR-INT-LINK-CLEANUP-008AC-BRIEF-IMAGE-URL-REACHABILITY` 简报大图 URL 可达性只读核查

记录时间：2026-06-19。PM 派发 008AC：用户反馈简报“查看原图 / 查看大图”一直转圈，测试 13.16.96 记录系统 `wx.previewImage` 黑色预览层停在加载态。前端将处理 008AC，接口侧只给 008g 图片 URL 可达性证据，避免把 URL 不可达误判为前端问题。本轮只读测试计划 13.16.96 和队列 008AC 行，不触发 DevTools、不访问线上、不 cleanup、不输出完整 token。

#### 3.47.1 样本 / API base

| 项 | 值 |
| --- | --- |
| API base | `http://127.0.0.1:3221/api/v1` |
| asset base | `http://127.0.0.1:3221` |
| sessionId | `session-1781787045680-8e406c` |
| briefId | `brief-1781787045693-bc8904b9` |
| memberA token 后 8 位 | `b8615971` |

测试 13.16.96 记录：点击 `.brief-image-preview-probe` 后 `previewImageCount=2`，`previewImageUrl=http://127.0.0.1:3221/uploads/moments/session-1781787045680-8e406c/1781787045687-party-highlight-a07ad1.webp`，系统预览层显示 `1/2` 加载态。

#### 3.47.2 字段来源

`GET /api/v1/briefs/brief-1781787045693-bc8904b9` 只读结果：

| 字段 | 摘要 |
| --- | --- |
| HTTP / code | `200 / 0` |
| `sessionId` | `session-1781787045680-8e406c` |
| `photoHighlights.length` | `2` |
| backend response `timeline` | absent |
| backend response timeline image count | `0` |

接口返回源字段是 `photoHighlights[].imageUrl`，两条均为 `/uploads/...`，没有 `http://store`、`__store__` 或临时 store URL。小程序端的 `timelineNodes` 可由 clean brief 的 `photoHighlights` 构造。

#### 3.47.3 图片 HTTP 可达性

| 来源 | source URL | normalized URL | GET | Content-Type | bytes | 尺寸 / hash |
| --- | --- | --- | --- | --- | ---: | --- |
| `photoHighlights[0].imageUrl` | `/uploads/moments/session-1781787045680-8e406c/1781787045687-party-highlight-a07ad1.webp` | `http://127.0.0.1:3221/uploads/moments/session-1781787045680-8e406c/1781787045687-party-highlight-a07ad1.webp` | `200` | `application/octet-stream` | `15388` | `640x420` WebP；SHA-256 `b5b1c05139110a23fe965eebcc0fa8aae0e87fec10f63164c64ec32d559f9190` |
| `photoHighlights[1].imageUrl` | `/uploads/moments/session-1781787045680-8e406c/1781787045682-party-opening-c85a76.webp` | `http://127.0.0.1:3221/uploads/moments/session-1781787045680-8e406c/1781787045682-party-opening-c85a76.webp` | `200` | `application/octet-stream` | `14402` | `640x420` WebP；SHA-256 `4176f7a72273adc5a7edb25b91650c1fba337e82dedc0f0bd501c9a8626786ec` |

#### 3.47.4 接口判断 / 责任边界

接口侧判断：008g 简报两张图片 URL 可达，且不是 `http://store` / `__store__` 临时 URL。后端 brief payload 当前已提供 `/uploads/...` 可规范化直链，原始图片文件为真实 `640x420` WebP；不需要改 brief 字段路径形态。

注意：当前本地静态文件响应 `Content-Type=application/octet-stream`，不是 `image/webp`。这不影响“HTTP GET 200 + 图片字节可读”的接口证据，但可能影响 `wx.previewImage` 系统预览层兼容性。如果前端 008AC 已在预览前使用规范化 HTTP URL 或缓存本地临时路径后仍转圈，再转后端/API 检查静态资源 MIME：`.webp` 应返回 `image/webp`。

前端 008AC 消费建议：

- 不要把 `http://store...` 或 `__store__` 传给 `wx.previewImage`。
- 008g 预览应使用规范化后的 `http://127.0.0.1:3221/uploads/...webp`，或先下载 / 缓存成系统预览可加载的本地 temp path。
- 日志只写 `previewImageUrl`、`previewImageCount` 和 token 后 8 位，不写完整 token。

#### 3.47.5 证据 / cleanup 口径

证据文件：

- `docs/runtime/pr-int-link-cleanup-PRCS-20260619-008ac-brief-image-url-reachability.md`

本轮未触发 DevTools、未访问 `api.pomer.cn`、未触碰 `pomer.cn`、未 cleanup、未输出完整 token。不写页面通过或测试通过。

### 3.48 `PR-INT-LINK-CLEANUP-008AD-LEDGER-FORBIDDEN-HOST-AUTH-CHECK` 账本 forbidden / host 权限只读核查

记录时间：2026-06-19。PM 派发 008AD：用户截图显示记录/账本页“发起人可调整”，点击欠酒/加酒 `+/-` 后 toast `forbidden`。PM 初判前端加减走 `PUT /sessions/:sessionId`，后端只允许 session host；当前 UI 可能把非 host token 当成 judge 显示可编辑。本轮只读测试 13.16.96 账本段和队列 008AA/008AD 行；不触发 DevTools、不访问线上、不 cleanup、不执行 PUT、不输出完整 token。

#### 3.48.1 样本身份

| 项 | 值 |
| --- | --- |
| API base | `http://127.0.0.1:3221/api/v1` |
| sessionId | `session-1781787045680-8e406c` |
| inviteCode | `J2BEL2` |
| sessionName | `周末聚会记录` |
| 后端 hostProfileId | `user-1781787045678-c892b9` |
| host token 后 8 位 | `ddceb616` |
| 当前常用 memberA profileId | `user-1781787045679-f3f2eb` |
| 当前常用 memberA token 后 8 位 | `b8615971` |
| `b8615971` 是否后端 host | `false` |

本地 store 成员关系：

| profileId | name | isHost | token 后 8 位 |
| --- | --- | --- | --- |
| `user-1781787045678-c892b9` | `聚会记录师房主` | `true` | `ddceb616` |
| `user-1781787045679-f3f2eb` | `聚会记录师成员A` | `false` | `b8615971` |
| `user-1781787045679-4cd6ea` | `聚会记录师成员B` | `false` | `c9c5b046` |

008g 账本事件存在且由 host 操作：`drink_debt` 目标 memberA、`drink_add` 目标 memberB，`operatorProfileId=user-1781787045678-c892b9`。

#### 3.48.2 只读 API / 路由合同

`GET /api/v1/sessions/live?sessionId=session-1781787045680-8e406c` 使用 memberA token 尾号 `b8615971` 返回：

| 字段 | 摘要 |
| --- | --- |
| HTTP / code | `200 / 0` |
| `hostProfileId` | `user-1781787045678-c892b9` |
| 当前 token profile | `user-1781787045679-f3f2eb` |
| 当前 token 是否 host | `false` |
| `joinStatusPlayers.length` | `3` |

注意：当前 `joinStatusPlayers[].isHost` 不可作为写权限依据，因为该接口响应中三条成员 `isHost` 均为 `false`；前端应使用 `liveSession.hostProfileId === currentUser.id` 判断写权限。

后端 `PUT /sessions/:sessionId` 权限合同：

- `backend/server.js` 以 `targetSession.members.find(item => item.isHost).profileId === userSession.profile.id` 计算 `isHost`。
- 非 host 执行 `PUT` 直接返回 `403 forbidden`。
- memberA `b8615971` 对应 `user-1781787045679-f3f2eb`，不等于 host `user-1781787045678-c892b9`，因此点击 `+/-` 触发 `PUT /sessions/session-1781787045680-8e406c` 出现 `forbidden` 属后端预期鉴权结果。

本轮未实际执行 `PUT`，只做身份和代码合同只读判断。

#### 3.48.3 前端可用权限合同

前端 ledger / live-record 编辑入口应按以下合同收口：

- 可编辑：`liveSession.hostProfileId === currentUser.id`。
- 不可编辑：当前登录用户不是 `hostProfileId`，即使 query 带 `role=judge`，也只能只读。
- `role=judge` query、runtime `isJudge`、测试/预览态参数不能作为后端写权限。
- `joinStatusPlayers[].isHost` 当前响应不可靠，不应单独用于展示 `发起人可调整` 或 `+/-`。
- under memberA token 尾号 `b8615971` 展示 `ledgerEditable=true`、`发起人可调整`、`+/-`，属于前端权限映射问题；后端无需放宽鉴权。

如测试需要验证 host 编辑路径，可切换到 host profile `user-1781787045678-c892b9`，token 后 8 位 `ddceb616`；完整 token 只能从 private/env 注入，不得写入公开文档或日志。

#### 3.48.4 证据 / cleanup 口径

证据文件：

- `docs/runtime/pr-int-link-cleanup-PRCS-20260619-008ad-ledger-forbidden-host-auth-check.md`

本轮未触发 DevTools、未访问 `api.pomer.cn`、未触碰 `pomer.cn`、未 cleanup、未执行 PUT、未输出完整 token。不写页面通过或测试通过。

### 3.49 `PR-INT-LINK-CLEANUP-008AG-INVITE-JOIN-CONTRACT` 邀请加入合同只读核查

记录时间：2026-06-19。PM 正式派发 008AG：用户要求邀请好友页面有邀请卡片，可分享给好友，好友点击后即可加入该局；页面显示已加入玩家小头像列，并按创建时人数显示空态头像，刷新后已加入头像填充空位。本轮只读 AGENTS、`docs/api-spec.md` session join / invite 段、队列 008AG 行和 3.42 008g 样本段；不触发 DevTools、不访问线上、不 cleanup、不执行 `POST /sessions/join`、不输出完整 token。

#### 3.49.1 接口 / 前端现有合同

| 能力 | 当前合同 | 判断 |
| --- | --- | --- |
| 公开读取邀请局 | `GET /sessions/live?sessionId=...&inviteCode=...`；`GET /sessions/by-invite?inviteCode=...` | 支持，不要求登录，返回公开/安全 live session 字段 |
| 加入该局 | `POST /sessions/join` body `{ inviteCode }` | 支持，但需要登录态；本轮未执行写入 |
| 分享路径 | `invite-group.onShareAppMessage()` 返回 `/pages/index/index?inviteCode=<code>&sessionId=<sessionId>` | 支持把口令和 session 传给好友入口 |
| 首页回流 | `index.onLoad()` 读取 `inviteCode` 后调用 `joinByInviteCode()`；该函数先 `ensureUserAuthorized`，登录后调用 `joinManagedSession()` -> `POST /sessions/join` | 支持“登录/授权后半自动加入”；不支持无登录静默加入 |

后端 `joinManagedSession` 逻辑：

- 已在成员列表内的 profile，会更新为 `status="已加入"`。
- 新 profile 在未满员时可追加为成员。
- 已满员时 data layer 抛 `SESSION_FULL`；当前 server route 检查段只显式映射 `NOT_SESSION_PLAYER`、`SESSION_NOT_FOUND`，如要测满员分支需后端/API 明确稳定错误码。

#### 3.49.2 008g 脱敏只读摘要

| 项 | 值 |
| --- | --- |
| sessionId | `session-1781787045680-8e406c` |
| inviteCode | `J2BEL2` |
| memberA token 后 8 位 | `b8615971` |

| 请求 | 鉴权 | HTTP / code | `playerCount` | `joinedCount` | `joinedPlayers` | `joinStatusPlayers` |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| `GET /sessions/live?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2` | 无 | `200 / 0` | `3` | `3` | `3` | `3` |
| `GET /sessions/live?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2` | memberA `b8615971` | `200 / 0` | `3` | `3` | `3` | `3` |
| `GET /sessions/by-invite?inviteCode=J2BEL2` | 无 | `200 / 0` | `3` | `3` | `3` | `3` |
| `GET /sessions/by-invite?inviteCode=J2BEL2` | memberA `b8615971` | `200 / 0` | `3` | `3` | `3` | `3` |

成员字段摘要：

| profileId | name | avatarUrl | status | isHost |
| --- | --- | --- | --- | --- |
| `user-1781787045678-c892b9` | `聚会记录师房主` | 空 | `已加入` | response 中为 `false` |
| `user-1781787045679-f3f2eb` | `聚会记录师成员A` | 空 | `已加入` | `false` |
| `user-1781787045679-4cd6ea` | `聚会记录师成员B` | 空 | `已加入` | `false` |

注意：`hostProfileId=user-1781787045678-c892b9` 单独返回；`joinStatusPlayers[].isHost` 当前不可靠，三条均为 `false`，不应用于发起人权限或发起人标识。

#### 3.49.3 头像 slot 可用字段

前端可用字段：

- `playerCount`：创建时人数 / 总槽位。
- `joinedCount`：已加入人数。
- `joinStatusPlayers`：推荐用于头像 slot 的成员列表。
- `joinedPlayers`：仅已加入玩家列表，可用于紧凑头像列。
- 每人字段：`profileId`、`name`、`avatarUrl`、`status`，账本字段另有 `debtCount/drinkCount/clearedCount`。

渲染建议：

- 按 `playerCount` 创建固定数量头像槽。
- 用 `joinStatusPlayers` 顺序填充；`status === "已加入"` 或有 `profileId` 时视作已占位。
- `avatarUrl` 为空时，用 `name` 首字 / 默认头像兜底。
- 空槽用默认头像和等待态。

008g 是满员样本：`joinedCount=3/playerCount=3`，能证明已加入头像列字段存在，但不能证明空槽填充和刷新后新增头像占位。

#### 3.49.4 缺口 / 下一步责任

当前合同可以支持“好友点击分享链接 -> 进入首页回流 -> 登录/授权 -> 调用 `/sessions/join` -> 加入该局”。不能写成无登录静默加入已完成，因为后端 join 明确需要登录态。

缺口：

| 缺口 | 责任方 | 说明 |
| --- | --- | --- |
| 无登录点击即加入 | 产品/前端/后端确认 | 当前合同是登录/授权后加入；如要无登录静默加入，需要新的身份策略，不建议绕过登录 |
| 空头像槽样本 | 后端/API 或接口 fixture | 008g 已满员，需新 seed 验证 `playerCount > joinedCount` 和加入后刷新填槽 |
| 满员错误合同 | 后端/API | `SESSION_FULL` 当前未在 route 显式映射；若测试要覆盖满员分支，需稳定错误码/文案 |
| 页面通过证据 | 前端/测试 | 本轮只读接口合同，不触发 DevTools，不写页面通过 |

建议补样：新增本地 seed `prcs-008ag-invite-open-slot`，初始 `playerCount=4/joinedCount=2`，保留 host + 1 member，准备一个未入局 token；在明确写入任务中执行一次 `/sessions/join`，复核 `joinedCount` 增加和 `joinStatusPlayers` 填槽，并提供 cleanup。

#### 3.49.5 证据 / cleanup 口径

证据文件：

- `docs/runtime/pr-int-link-cleanup-PRCS-20260619-008ag-invite-join-contract.md`

本轮未触发 DevTools、未访问 `api.pomer.cn`、未触碰 `pomer.cn`、未 cleanup、未执行 `POST /sessions/join`、未输出完整 token。不写页面通过或测试通过。

### 3.50 `PR-INT-LINK-CLEANUP-008AH-INVITE-OPEN-SLOT-SAMPLE` 邀请空槽样本只读查找

记录时间：2026-06-19。PM 追加 008AH：008AG 已用 008g 满员样本收口邀请卡、分享、3/3 头像槽和刷新稳定性，但用户要求还包含“按之前选的人数做空态头像，已加入的可手动刷新，刷新后头像填充空态头像中”。008g `playerCount=3/joinedCount=3` 已满员，不能证明空槽和新用户加入后刷新填充。本轮只读查找现有本地/runtime/fixture 是否有 open-slot 样本；不触发 DevTools、不访问线上、不 cleanup、不执行 `POST /sessions/join`、不输出完整 token。

#### 3.50.1 查找条件

| 条件 | 要求 |
| --- | --- |
| open slot | `playerCount > joinedCount` |
| 稳定入口 | 有 `sessionId / inviteCode` |
| 可访问身份 | 至少一个 token 后 8 位可用于打开 invite-group |
| 只读接口 | `GET /sessions/live` 返回 `playerCount / joinedCount / joinedPlayers` 或 `joinStatusPlayers` |
| 用途 | 测试能看到空态头像槽；本轮不执行 join 写入 |

#### 3.50.2 推荐候选 A：5 槽 / 1 人已加入

| 字段 | 值 |
| --- | --- |
| sessionId | `session-1781808709710-8f00b7` |
| inviteCode | `KB8DN6` |
| sessionName | `生'史'局` |
| token 后 8 位 | `b8615971` |
| source / state | local quick-create / `邀请中` |

只读接口：

`GET /api/v1/sessions/live?sessionId=session-1781808709710-8f00b7&inviteCode=KB8DN6`

| 鉴权 | HTTP / code | `playerCount` | `joinedCount` | `joinedPlayers` | `joinStatusPlayers` | `hostProfileId` |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| 无 token | `200 / 0` | `5` | `1` | `1` | `1` | `user-1781787045679-f3f2eb` |
| token `b8615971` | `200 / 0` | `5` | `1` | `1` | `1` | `user-1781787045679-f3f2eb` |

`joinStatusPlayers[0]` 摘要：`profileId=user-1781787045679-f3f2eb`、`name=聚会记录师成员A`、`avatarUrl=""`、`status=已加入`。

测试 query：

```text
/pages/invite-group/index?sessionId=session-1781808709710-8f00b7&inviteCode=KB8DN6
```

预期：前端按 `playerCount=5` 生成 5 个头像槽，`joinStatusPlayers` 填 1 个已加入槽，剩余 4 个显示空态头像。头像为空时应用 `name` 首字或默认头像兜底。

限制：这是现有 local quick-create 数据，不是 clean `prcs-*` seed；标题不适合作最终视觉文案样本；只能证明空槽显示读侧字段，不能证明新用户 join 后刷新填槽。

#### 3.50.3 候选 B：2 槽 / 1 人已加入

| 字段 | 值 |
| --- | --- |
| sessionId | `session-1781773386962-1c89d2` |
| inviteCode | `WGCNM8` |
| sessionName | `周五快乐局` |
| token 后 8 位 | `4ea6c85e` |
| source / state | local quick-create / `邀请中` |

只读接口：

`GET /api/v1/sessions/live?sessionId=session-1781773386962-1c89d2&inviteCode=WGCNM8`

| 鉴权 | HTTP / code | `playerCount` | `joinedCount` | `joinedPlayers` | `joinStatusPlayers` | `hostProfileId` |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| 无 token | `200 / 0` | `2` | `1` | `1` | `1` | `user-1781756527691-ff0197` |
| token `4ea6c85e` | `200 / 0` | `2` | `1` | `1` | `1` | `user-1781756527691-ff0197` |

测试 query：

```text
/pages/invite-group/index?sessionId=session-1781773386962-1c89d2&inviteCode=WGCNM8
```

限制：只有 1 个空槽，弱于候选 A；不是 clean `prcs-*` seed；不能证明 join 后填槽。

#### 3.50.4 不推荐候选

`session-1`、`session-2`、`session-3` 也满足 `playerCount > joinedCount`，但无可访问 token 后 8 位，且成员无稳定 profileId，不推荐作为 008AH 测试样本。

#### 3.50.5 结论 / 后续补样

当前有可复用 open-slot 读侧样本，推荐 QA 先用候选 A 验证空态头像槽：`session-1781808709710-8f00b7 / KB8DN6 / token 后 8 位 b8615971`。该样本只用于证明“读取到 `playerCount > joinedCount`，前端能按人数渲染空槽”；不得写成“新用户点击加入后刷新填槽通过”。

如 PM 要闭环“新用户加入后刷新填充空位”，需另派写入型 fixture 任务，建议 seed：

`prcs-008ah-invite-open-slot`

| 字段 | 要求 |
| --- | --- |
| 初始 `playerCount` | `4` |
| 初始 `joinedCount` | `2` |
| 初始成员 | host + memberA 已加入 |
| 空槽 | 初始 2 个 |
| 新用户身份 | memberB 或 outsider token，初始不在 session 内 |
| 只读前置 | `GET /sessions/live` 返回 `playerCount=4/joinedCount=2` |
| 写入动作 | 另行授权后使用新用户 token 调 `POST /sessions/join` |
| 写后期望 | `joinedCount=3`，`joinStatusPlayers` 出现新用户；前端刷新填 1 个空槽 |
| cleanup | seed 精确 cleanup；scan-before / cleanup / scan-after 覆盖 session、members、login/session token 副作用 |

如果现有 helper 不能创建和精确 cleanup 该 seed，需后端/API 支持；本轮未执行任何写入。

#### 3.50.6 证据 / cleanup 口径

证据文件：

- `docs/runtime/pr-int-link-cleanup-PRCS-20260619-008ah-invite-open-slot-sample.md`

本轮未触发 DevTools、未访问 `api.pomer.cn`、未触碰 `pomer.cn`、未 cleanup、未执行 `POST /sessions/join`、未输出完整 token。不写页面通过或测试通过。

### 3.51 `PR-INT-LINK-CLEANUP-008AL-INVITE-SAMPLE-DRIFT-READONLY` 邀请样本漂移只读核查

记录时间：2026-06-19。PM 派发 008AL 只读核查：测试 13.16.111 在 DevTools storage 切到 008g memberA token 后 8 位 `b8615971` 后，打开 `/pages/invite-group/index?sessionId=session-1781787045680-8e406c`，页面 data 显示 `inviteCode=PNLGNK/sessionName=生'史'局/playerCount=5/joinedCount=1`，而非预期 008g `J2BEL2/3 of 3`。本轮只读核查本地 store 与 3221 API，不触发 DevTools、不线上写入、不 cleanup、不重建样本、不输出完整 token。

证据文件：`docs/runtime/pr-int-link-cleanup-PRCS-20260619-008al-invite-sample-drift-readonly.md`。

只读命令摘要：

```powershell
node -e "const fs=require('fs'); const store=JSON.parse(fs.readFileSync('backend/data/admin-store.json','utf8')); const sessions=store.sessions||[]; const byInvite=c=>sessions.filter(s=>s.inviteCode===c).map(s=>({id:s.id,inviteCode:s.inviteCode,name:s.name,players:s.players,joinedCount:(s.members||[]).length,source:s.source,state:s.state})); console.log(JSON.stringify({target:sessions.filter(s=>s.id==='session-1781787045680-8e406c').map(s=>({id:s.id,inviteCode:s.inviteCode,name:s.name,players:s.players,joinedCount:(s.members||[]).length,hostProfileId:s.hostProfileId,source:s.source,state:s.state,memberTokenTails:(s.members||[]).map(m=>(m.token||'').slice(-8))})), open:sessions.filter(s=>s.id==='session-1781808709710-8f00b7').map(s=>({id:s.id,inviteCode:s.inviteCode,name:s.name,players:s.players,joinedCount:(s.members||[]).length,hostProfileId:s.hostProfileId,source:s.source,state:s.state,memberTokenTails:(s.members||[]).map(m=>(m.token||'').slice(-8))})), inviteMatches:{J2BEL2:byInvite('J2BEL2'),PNLGNK:byInvite('PNLGNK'),KB8DN6:byInvite('KB8DN6')}} ,null,2))"

$base='http://127.0.0.1:3221/api/v1'
curl.exe -s "$base/sessions/live?sessionId=session-1781787045680-8e406c"
curl.exe -s "$base/sessions/live?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2"
curl.exe -s "$base/sessions/live?sessionId=session-1781787045680-8e406c&inviteCode=PNLGNK"
curl.exe -s "$base/sessions/by-invite?inviteCode=J2BEL2"
curl.exe -s "$base/sessions/by-invite?inviteCode=PNLGNK"
curl.exe -s "$base/sessions/by-invite?inviteCode=KB8DN6"
curl.exe -s "$base/sessions/live?sessionId=session-1781808709710-8f00b7"

rg -n "onLoad\(|hydrateLiveSession\(|runtime\.inviteCode|sessionRuntime|enableSessionLeaveAlert" miniprogram/pages/invite-group/index.ts miniprogram/utils/session-return.ts
```

字段摘要：

| 样本 / 查询 | 当前结果 |
| --- | --- |
| 008g store `session-1781787045680-8e406c` | `inviteCode=J2BEL2`、`sessionName=周末聚会记录`、`playerCount=3`、`joinedCount=3`、`source=prcs-clean-slate-actual-prcs-008g`、成员 token 尾号 `ddceb616/b8615971/c9c5b046` |
| `GET /sessions/live?sessionId=session-1781787045680-8e406c` | `200/code=0`，返回 008g `J2BEL2/3/3`，`joinStatusPlayers=3` |
| `GET /sessions/live?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2` | `200/code=0`，返回 008g `J2BEL2/3/3` |
| `GET /sessions/live?sessionId=session-1781787045680-8e406c&inviteCode=PNLGNK` | `404/code=404` |
| `GET /sessions/by-invite?inviteCode=J2BEL2` | `200/code=0`，映射到 008g |
| `GET /sessions/by-invite?inviteCode=PNLGNK` | `404/code=404`，当前 store 无该 inviteCode |
| 008AH open-slot quick-create | `session-1781808709710-8f00b7`、`inviteCode=KB8DN6`、`sessionName=生'史'局`、`playerCount=5`、`joinedCount=1`、token 尾号 `b8615971` |

责任判断：

- 当前本地 store/API 没有把 008g 覆盖成 `PNLGNK/1 of 5`；008g `sessionId` 仍唯一对应 `J2BEL2/3 of 3`。
- 当前 `backend/data/admin-store.json` 中无 `PNLGNK`，`api/v1/sessions/by-invite?inviteCode=PNLGNK` 返回 404；因此不是当前本地 fixture 覆盖、sessionId 复用或 mock store 已更新。
- `生'史'局/5/1` 与 008AH open-slot quick-create 样本形态一致，但当前 inviteCode 为 `KB8DN6`；`PNLGNK` 更像 DevTools runtime/storage 中保留的旧邀请态。
- `miniprogram/pages/invite-group/index.ts` 当前从 query 取 `sessionId`，但 `hydrateLiveSession(sessionId, runtime.inviteCode)` 使用 runtime inviteCode；当 runtime 中有旧 `PNLGNK` 时，会请求 `sessionId=008g&inviteCode=PNLGNK` 并得到 404，随后 fallback 使用 `runtime.inviteCode/sessionName/playerCount/selectedPlayers`，形成页面 data 漂移。

测试复跑建议：

| 场景 | 推荐 query / 前置 | 预期 |
| --- | --- | --- |
| 严格 008g 业务样本 | `/pages/invite-group/index?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2`，token 尾号 `b8615971`；前端需消费 query inviteCode 或清理/覆盖旧 runtime inviteCode | `inviteCode=J2BEL2`、`playerCount=3`、`joinedCount=3`、`joinStatusPlayers.length=3` |
| open-slot 空槽只读 | `/pages/invite-group/index?sessionId=session-1781808709710-8f00b7&inviteCode=KB8DN6`，token 尾号 `b8615971` | `inviteCode=KB8DN6`、`sessionName=生'史'局`、`playerCount=5`、`joinedCount=1`；只能证明空槽读取，不证明 join-after-refresh |

下一步责任：

- 前端：`invite-group` 需要优先使用 query `inviteCode`，或在 query `sessionId` 存在时不要让 stale `runtime.inviteCode` 污染 live 查询；fallback 不应把查询目标替换成无关 runtime session。
- 测试：复测 008g 业务样本时记录 query、API base、token 尾号和 runtime/storage 关键字段；若仍显示 `PNLGNK`，按前端 runtime/storage 漂移退回，不写 008g 业务样本通过。
- 接口联调：如 PM 后续要求 join-after-refresh，可另开稳定 open-slot 样本任务，执行 scan-before、授权 join 写入、scan-after 和 cleanup 计划；本轮不执行。

warnings/skipped：

- skipped：DevTools、线上 API、写入、cleanup、样本重建。
- token：公开记录只写后 8 位 `b8615971`，不写完整 token。
- 本节只给接口/数据责任判断，不写页面通过、测试通过或上线通过。

### 3.52 `PR-INT-LINK-CLEANUP-008AN-RECORD-LEDGER-TIMELINE-DATA-CONTRACT` 记录 / 账本左侧时间线数据合同只读核查

记录时间：2026-06-19。PM 派发 008AN：用户要求记录 / 账本页重做，页面名称应显示玩家创建的聚会名，记录页左侧明线时间线需包含拍照、欠酒 / 加酒等所有时间节点。本轮只读梳理当前数据合同，不写入、不 cleanup、不重建样本、不改接口、不输出完整 token、不触碰线上或 `pomer.cn`。

只读命令摘要：

```powershell
rg -n "GET /sessions/live|GET /sessions/:sessionId/timeline|POST /sessions/:sessionId/events|accountingHighlights|eventHighlights" docs/api-spec.md
rg -n "RemoteMomentRecord|RemoteSessionEventRecord|normalizeMomentRecord|normalizeSessionEventRecord|getManagedLiveSession|getManagedSessionTimeline" miniprogram/services/operations.ts
rg -n "buildTimelineViewState|buildEventDetail|ledgerTimelineItems|photoNodes|hydrateManagedSession" miniprogram/pages/live-record/index.ts
rg -n "hydrateLedger|applyLedgerEventsToPlayers|ledgerEditable|getManagedSessionTimeline" miniprogram/pages/ledger/index.ts
rg -n "createSessionEvent|getSessionTimeline|buildSessionLedgerSnapshot|getPublicSessionShareSummary" backend/data/moments.js backend/server.js

node -e "const fs=require('fs'); const admin=JSON.parse(fs.readFileSync('backend/data/admin-store.json','utf8')); const moments=JSON.parse(fs.readFileSync('backend/data/moments-store.json','utf8')); const sid='session-1781787045680-8e406c'; const bid='brief-1781787045693-bc8904b9'; const sessions=[...(admin.liveSessions||[]),...(admin.sessions||[])]; const session=sessions.find(s=>s.id===sid)||{}; const brief=(moments.sessionBriefs||[]).find(b=>b.id===bid)||{}; const momentNodes=(moments.momentRecords||[]).filter(m=>m.sessionId===sid&&!m.removedAt).map(m=>({kind:'moment',id:m.id,nodeType:m.nodeType,imageUrl:m.imageUrl,createdAt:m.createdAt,updatedAt:m.updatedAt,uploaderProfileId:m.uploaderProfileId,uploaderName:m.uploaderName,uploaderAvatarPresent:Boolean(m.uploaderAvatarUrl),caption:m.caption,timelineTitle:m.timelineTitle,visibility:m.visibility,visibleProfileIds:Array.isArray(m.visibleProfileIds)?m.visibleProfileIds.length:0,usageConsent:m.usageConsent})); const eventNodes=(moments.sessionEvents||[]).filter(e=>e.sessionId===sid).map(e=>({kind:'event',id:e.id,eventType:e.eventType,createdAt:e.createdAt,updatedAt:e.updatedAt,operatorProfileId:e.operatorProfileId,operatorName:e.operatorName,targetProfileId:e.targetProfileId,targetName:e.targetName,scoreDelta:e.scoreDelta,caption:e.caption,timelineTitle:e.timelineTitle,syncStatus:e.syncStatus})); const combined=[...momentNodes,...eventNodes].sort((a,b)=>new Date(a.createdAt||0)-new Date(b.createdAt||0)); console.log(JSON.stringify({session:{id:session.id,inviteCode:session.inviteCode,name:session.name,playerCount:session.players,joinedCount:session.joinedCount,hostProfileId:session.hostProfileId,memberCount:(session.members||[]).length},brief:{id:brief.id,title:brief.title,sessionId:brief.sessionId,timelineNodeIds:Array.isArray(brief.timelineNodeIds)?brief.timelineNodeIds.length:0,createdAt:brief.createdAt,updatedAt:brief.updatedAt},counts:{moments:momentNodes.length,events:eventNodes.length,ledgerEvents:eventNodes.filter(e=>['drink_debt','drink_add'].includes(e.eventType)).length,combined:combined.length},combinedOrder:combined.map(n=>({kind:n.kind,id:n.id,type:n.nodeType||n.eventType,createdAt:n.createdAt,title:n.timelineTitle||n.caption||'',actor:n.uploaderName||n.operatorName||'',target:n.targetName||'',scoreDelta:n.scoreDelta||0,imageUrl:Boolean(n.imageUrl),visibility:n.visibility||''}))},null,2))"
```

本轮尝试用本地 `http://127.0.0.1:3221/api/v1` 读取 `sessions/live`、`sessions/:sessionId/timeline`、`briefs/:briefId` 时 Node `fetch` 返回 `fetch failed`，`Get-NetTCPConnection -LocalPort 3221` 无监听输出；按只读边界未启动 / 重启 3221，接口运行态复核标记为 skipped，以下结论来自本地 JSON store、源码合同和 `docs/api-spec.md`。

现有字段摘要：

| 需求 | 当前来源 | 当前 008g 摘要 | 判断 |
| --- | --- | --- | --- |
| 页面标题 `sessionName` | `GET /sessions/live` 的 `sessionName`，服务层映射自 live session；本地 store 为 `admin-store.liveSessions[].name` | `session-1781787045680-8e406c` 的 `name=周末聚会记录`、`inviteCode=J2BEL2`、`playerCount=3`、`joinedCount=3` | 可支撑页面标题显示玩家创建的聚会名；前端不要使用固定“聚会账本”覆盖远端值 |
| 拍照事件 | 成员态 `GET /sessions/:sessionId/timeline` 的 `nodeKind=moment` 节点；store 为 `momentRecords` | 3 条 moment：opening/highlight/private；字段含 `id/imageUrl/createdAt/updatedAt/uploaderProfileId/uploaderName/caption/timelineTitle/visibility/visibleProfileIds/usageConsent` | 可支撑照片节点、图片、时间、上传人昵称、文案和可见性；008g 头像字段为空，若必须显示头像需从成员 profile / live session 合并兜底 |
| 账本变动事件 | 成员态 `GET /sessions/:sessionId/timeline` 的 `nodeKind=event` 节点；写入合同为 `POST /sessions/:sessionId/events` | 2 条 ledger event：`drink_debt` 给 memberA `scoreDelta=1`，`drink_add` 给 memberB `scoreDelta=1`；字段含 `id/eventType/createdAt/updatedAt/operatorProfileId/operatorName/targetProfileId/targetName/scoreDelta/caption/syncStatus` | 可支撑欠酒 / 加酒、数量、操作者、目标玩家、时间排序；缺 operatorAvatarUrl / targetAvatarUrl，前端需用 profileId 去成员列表合并 |
| 聚合账本摘要 | `ledgerSummary/accountingHighlights/settlementSummary/ledgerRankings/eventHighlights` | `accountingHighlights` 只适合统计卡；`eventHighlights` 是中性摘要，不返回操作者 / 目标用户明细 | 可用于分享 / 保存图摘要，不适合重做左侧明线时间线的明细源 |
| 时间线排序 | `getSessionTimeline` 把 moment + event 合并后按 `createdAt` 升序排序；brief `timelineNodeIds` 记录节点 ID | 008g store 合并后 5 节点：2 个公开照片、1 个私密照片、2 个账本事件；多个节点时间精确到同一毫秒 | 可支撑基础排序；同毫秒节点缺稳定二级排序字段 / sequence，严格“发生先后”仍有歧义 |

当前 008g 节点摘要：

| 顺序字段 | kind | type | actor | target | scoreDelta | image | visibility |
| --- | --- | --- | --- | --- | ---: | --- | --- |
| `2026-06-18T12:50:45.691Z` | moment | `highlight` | 聚会记录师成员A |  | `0` | 有 | `session` |
| `2026-06-18T12:50:45.691Z` | moment | `opening` | 聚会记录师房主 |  | `0` | 有 | `session` |
| `2026-06-18T12:50:45.692Z` | moment | `private` | 聚会记录师成员B |  | `0` | 有，但私密 | `private` |
| `2026-06-18T12:50:45.692Z` | event | `drink_debt` | 聚会记录师房主 | 聚会记录师成员A | `1` | 无 |  |
| `2026-06-18T12:50:45.693Z` | event | `drink_add` | 聚会记录师房主 | 聚会记录师成员B | `1` | 无 |  |

前端现状：

- `live-record` 已从 `getManagedLiveSession` 设置 `sessionName`，并从 `getManagedSessionTimeline` 拆 `photoNodes` 与 `ledgerTimelineItems`。
- `live-record` 的 `ledgerTimelineItems` 目前只保留 `id/title/type/typeText/scoreText/detail`，没有把 `createdAt/operatorProfileId/operatorName/targetProfileId/targetName/operatorAvatarUrl/targetAvatarUrl` 保留到视图模型；如果 UI 要左侧明线完整事件卡，需要前端扩展视图模型。
- `ledger` 页用 `getManagedLiveSession` + `getManagedSessionTimeline` 计算成员欠酒 / 加酒统计，能读计数和 host 权限，但不是完整时间线展示模型。
- clean brief 的 `buildTimelineNodesFromCleanBrief` 兜底只用 `photoHighlights/keyEvents` 构造节点，会丢失 `operatorProfileId/targetProfileId/targetName` 等明细；记录 / 账本页不应依赖 clean brief 兜底作为明细时间线源。

最小合同缺口：

| 缺口 | 归属建议 | 最小合同 |
| --- | --- | --- |
| 操作者 / 目标头像 | 后端/API 或前端合并均可；推荐后端在成员态 timeline event 直接补 `operatorAvatarUrl`、`targetAvatarUrl` | event node 增加 `operatorAvatarUrl`、`targetAvatarUrl`；若不补，前端必须用 `operatorProfileId/targetProfileId` 从 `sessions/live.joinStatusPlayers` 合并头像 |
| 严格排序稳定性 | 后端/API | timeline node 增加 `timelineOrder`、`sequence` 或 `createdAtMs + sortIndex`；同毫秒时按服务端写入顺序稳定 |
| 统一事件文案 | 后端/API 可给，前端可兜底 | event node 增加 `displayText` / `timelineTitle`，例如“房主给成员A记了 1 杯欠酒”；前端不得从 `eventHighlights` 反推明细 |
| 账本动作正负语义 | 后端/API | 明确 `eventType=drink_debt/drink_add`、`scoreDelta` 正负含义和单位；如未来支持消杯 / 撤销，需新增 `drink_clear` / `ledger_adjust` 或 `deltaType` |
| 私密 / 权限占位 | 已有基础字段，需前端消费 | moment node 现有 `visibility/isTimelinePlaceholder/visibleProfileIds`；左侧时间线应对私密节点显示占位或过滤，不能展示私密图片给无权限成员 |
| 页面标题字段 | 前端 | 标题优先 `liveSession.sessionName` / `session.name`，其次 query/runtime；不要用 brief `title=聚会时间线简报` 当页面名 |

下一步建议：

- 前端：记录 / 账本重做的主数据源用成员态 `GET /sessions/:sessionId/timeline` + `GET /sessions/live`，不要用 `accountingHighlights/eventHighlights` 做明细时间线；扩展 `ledgerTimelineItems` 视图模型保留时间、actor、target、profileId 和头像兜底。
- 后端/API：补成员态 timeline event 的头像和稳定排序字段；如要支持更多账本动作，先扩展事件类型合同，不要把聚合高光字段伪装成明细事件。
- 测试：008g 可作为本地只读样本证明当前 store 有 3 照片节点 + 2 账本事件；但本轮未启动 3221，不能写运行中接口通过；待本地服务恢复后复跑 `GET /sessions/live` 和 `GET /sessions/:sessionId/timeline`。

warnings/skipped：

- skipped：本地 3221 HTTP 复核，原因是 `fetch failed` 且端口 3221 未监听；本轮按只读边界未启动服务。
- skipped：线上 API、写入、cleanup、样本重建、DevTools。
- token：只沿用 008g memberA 尾号 `b8615971`，不输出完整 token。
- 结论为数据合同梳理，不写页面通过、测试通过或上线通过。

### 3.53 `PR-INT-LINK-CLEANUP-008AN-DATA-ENV-RECHECK` 记录 / 账本时间线成员态数据环境复核

记录时间：2026-06-19。PM 新派 008AN 环境复核：前端 14.91 已完成记录 / 账本统一明线时间线结构，但 DevTools 运行态 data 为空：`sessionName=""`、`recordTimelineItems=[]`、`photoNodes=[]`、`ledgerTimelineItems=[]`、`timelineNodes=[]`。本轮只做本地只读或最小环境恢复，给测试提供可用成员态数据环境；不触碰线上或 `pomer.cn`，不 cleanup，不重建样本，不输出完整 token。

环境恢复：

| 项 | 结果 |
| --- | --- |
| API base | `http://127.0.0.1:3221/api/v1` |
| 初始监听检查 | `Get-NetTCPConnection -LocalPort 3221` 无监听输出 |
| 启动命令 | `PORT=3221 npm.cmd --prefix backend start` |
| cwd | `F:\codexlist\jiuzhuopanguan` |
| 当前监听 PID | `17684` |
| 进程命令行 | `node server.js` |
| stdout | `docs/runtime/pr-int-link-cleanup-008an-data-env-recheck-3221.out.log`，含 `jiuzhuopanguan backend listening on port 3221` |
| stderr | `docs/runtime/pr-int-link-cleanup-008an-data-env-recheck-3221.err.log`，当前无错误输出 |
| 写入说明 | 仅启动本地服务并写 stdout/stderr 日志；未执行 fixture create / cleanup / 写接口 / 线上请求 |

只读复核命令摘要：

```powershell
Get-NetTCPConnection -LocalPort 3221 -ErrorAction SilentlyContinue | Select-Object LocalAddress,LocalPort,State,OwningProcess
Get-CimInstance Win32_Process -Filter "ProcessId=17684" | Select-Object ProcessId,CommandLine,ExecutablePath

node -e "<read backend/data/social-store.json token for profile user-1781787045679-f3f2eb, call local /sessions/live, /sessions/:id/timeline, /briefs/:id, print token tail and field counts only>"
```

推荐测试样本 / storage：

| 字段 | 值 |
| --- | --- |
| sessionId | `session-1781787045680-8e406c` |
| inviteCode | `J2BEL2` |
| briefId | `brief-1781787045693-bc8904b9` |
| profileId | `user-1781787045679-f3f2eb` |
| token 后 8 位 | `b8615971` |
| storage `runtime-api-base` | `http://127.0.0.1:3221/api/v1` |
| storage `social-current-profile-id` | `user-1781787045679-f3f2eb` |
| storage `jzp-user-token` | 008g memberA 完整 token；只允许 QA 从 private/env 注入，公开日志只写后 8 位 `b8615971` |

推荐页面 query：

```text
/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=member
/pages/ledger/index?sessionId=session-1781787045680-8e406c&role=member
```

可选旁证页面：

```text
/pages/session-brief/index?sessionId=session-1781787045680-8e406c&briefId=brief-1781787045693-bc8904b9
```

HTTP 字段摘要：

| 接口 | HTTP / code | 摘要 |
| --- | --- | --- |
| `GET /sessions/live?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2` | `200 / 0` | `sessionName=周末聚会记录`、`inviteCode=J2BEL2`、`playerCount=3`、`joinedCount=3`、`hostProfileId=user-1781787045678-c892b9` |
| `GET /sessions/session-1781787045680-8e406c/timeline` | `200 / 0` | `nodeCount=5`、`photoNodeWithImageCount=2`、`eventCount=2`、`ledgerEventCount=2`、`hasDrinkDebt=true`、`hasDrinkAdd=true`、`pendingMediaCount=0` |
| `GET /briefs/brief-1781787045693-bc8904b9` | `200 / 0` | `photoHighlights=2`、`accountingHighlights=4`、`ledgerSummary.hasLedgerData=true`；clean brief 可作旁证，但 008AN 明细时间线主源仍应是 `/sessions/:sessionId/timeline` |

timeline 节点摘要：

| kind | type | id | actor | target | scoreDelta | imageUrl |
| --- | --- | --- | --- | --- | ---: | --- |
| moment | `highlight` | `moment-1781787045691-181c3e21` | 聚会记录师成员A |  | `0` | `/uploads/moments/session-1781787045680-8e406c/1781787045687-party-highlight-a07ad1.webp` |
| moment | `opening` | `moment-1781787045691-92c7f14b` | 聚会记录师房主 |  | `0` | `/uploads/moments/session-1781787045680-8e406c/1781787045682-party-opening-c85a76.webp` |
| moment | `private` | `moment-1781787045692-d340df06` | 聚会记录师成员B |  | `0` | 成员 A 视角为空，私密占位符合权限过滤 |
| event | `drink_debt` | `event-1781787045692-6dbe67d6` | 聚会记录师房主 | 聚会记录师成员A | `1` |  |
| event | `drink_add` | `event-1781787045693-464dde2c` | 聚会记录师房主 | 聚会记录师成员B | `1` |  |

测试准入口径：

- 若 DevTools page data 仍为空，优先核对 storage `runtime-api-base` 是否为 `http://127.0.0.1:3221/api/v1`、`social-current-profile-id` 是否为 `user-1781787045679-f3f2eb`、token 尾号是否为 `b8615971`。
- 008AN 的真实混排判断应读取页面 data：`sessionName`、`recordTimelineItems`、`photoNodes`、`ledgerTimelineItems`、`timelineNodes`；其中 timeline 必须出现至少 1 条带 `imageUrl` 的 `moment`、1 条 `drink_debt`、1 条 `drink_add`。
- 本轮只证明接口 / 数据环境可用，不写 008AN 页面通过、测试通过、UIUX 通过或上线通过。

cleanup / 残留口径：

- 数据残留：未新增 / 未修改样本，沿用已存在 `prcs-008g`；未执行 cleanup。
- 进程残留：本地 3221 服务保持运行，PID `17684`，供测试复跑；若 PM 要停止，可执行 `Stop-Process -Id 17684`，但本轮未停止以避免测试再次空态。
- 日志残留：新增本地服务 stdout/stderr 日志两份，仅记录启动输出，不含 token。

warnings/skipped：

- 未触碰 `api.pomer.cn` 或 `pomer.cn`。
- 未执行写接口、fixture create、cleanup、DevTools 操作。
- 公开文档只写 token 后 8 位 `b8615971`。
- clean brief `/briefs/:briefId` 不返回完整明细 timeline 计数，本轮只作照片 / 账本聚合旁证；明细混排以 `/sessions/:sessionId/timeline` 为准。

### 3.54 `PR-INT-HOME-RECENT-ALBUM-BRIEFID-404-008BB-CONTRACT` 首页最近相册 briefId 404 条件待命

记录时间：2026-06-19。PM 派发条件待命：用户调试器红错显示首页最近相册请求 `/briefs/session-*` 和 `/session-briefs/session-*` 404。PM 已定位为前端把 `sessionId` 当 `briefId` 传给 `getManagedSessionBrief`；前端将先修为只有真实 `briefId` 才读取 brief。本轮接口联调不写入、不 cleanup、不重建样本、不触发 DevTools、不访问线上，仅登记待命。

当前合同边界：

| 场景 | 合同 |
| --- | --- |
| 生成 / 刷新 brief | `POST /sessions/:sessionId/brief` |
| 读取 brief | `GET /session-briefs/:briefId` 或 clean facade `GET /briefs/:briefId` |
| 非合同 | 不把 `sessionId` 传给 `/briefs/:id` 或 `/session-briefs/:id` 读取；`/briefs/session-*` 返回 404 属调用方参数错误，不应被写成后端缺口 |

待命触发条件：

- 只有当前端明确反馈 `GET /user/session-moment-summaries` 缺少首页最近相册所需只读字段时，接口联调再执行只读合同核查。
- 需要核查的字段仅限：首页最近相册是否稳定返回 `briefId`、是否返回首张照片 URL / 可读封面字段、是否需要补最小 summary 合同。
- 若字段缺失，只给后端/API 最小合同建议和样本响应摘要；不得造假 briefId，不得复用 `sessionId` 冒充 briefId。

预设只读核查命令模板，待触发后执行：

```powershell
$base = 'http://127.0.0.1:3221/api/v1'
# token 只从 private/env 读取，公开日志仅输出 token 后 8 位
curl.exe -s -H "Authorization: Bearer <member-token-from-private-env>" "$base/user/session-moment-summaries"
```

待核查摘要字段：

| 字段 | 预期用途 |
| --- | --- |
| `sessionId` | 首页最近相册跳转聚会 / 相册 / 记录页 |
| `sessionName` / `title` | 首页最近相册标题 |
| `briefId` | 只有存在时才能调用 `/briefs/:briefId` |
| `coverPhotoUrl` / `coverImageUrl` / `shareImageUrl` | 最近相册封面候选，需明确“首张上传照片”还是其他封面 |
| `createdAt` | 最近相册排序 |
| `pendingMediaCount` / `canResumeMomentIds` | 未完成记录提示 |

当前状态：条件待命。前端修正“只有 `briefId` 才读 brief”前，接口联调不执行额外核查；不得把 `sessionId` 读取 brief 写成现有合同，不写页面通过、测试通过或上线通过。

### 3.55 `PR-INT-SHARE-GENERATE-STATUS-QR-CONTRACT-008BG` 分享生成 / 刷新状态 / 二维码合同复核

记录时间：2026-06-19。PM 派发 008BG：用户指出分享预览状态不能假、生成完成后刷新状态要立即回传、玩家才能点分享、分享图底部要小程序二维码。本轮在项目边界内使用本地 `127.0.0.1:3221/api/v1` 与 008g 样本复核；未触碰 `api.pomer.cn` 或 `pomer.cn` 官网。为证明 pending -> ready 状态回传，本轮在本地创建了临时 share task 并生成 PNG；未 cleanup，已记录清理口径。

环境 / 样本：

| 字段 | 值 |
| --- | --- |
| API base | `http://127.0.0.1:3221/api/v1` |
| local 3221 | 复用 3.53 启动的本地服务，PID `17684` |
| sessionId | `session-1781787045680-8e406c` |
| inviteCode | `J2BEL2` |
| briefId | `brief-1781787045693-bc8904b9` |
| 成员态 profileId | `user-1781787045679-f3f2eb` |
| token 后 8 位 | `b8615971` |
| 既有 ready task | `share-task-1781787045694-9725ffeb` |
| 本轮临时 task 1 | `share-task-1781864781729-5aa63c1b`，layoutMode `status_contract_008bg` |
| 本轮临时 task 2 | `share-task-1781864833426-2696766c`，layoutMode `status_contract_008bg_rerun_1781864833387` |

只读 / 本地生成命令摘要：

```powershell
$base = 'http://127.0.0.1:3221/api/v1'
# token 只从 backend/data/social-store.json 或 private/env 读取；公开只输出后 8 位 b8615971

# 1. raw brief 合同
GET $base/session-briefs/brief-1781787045693-bc8904b9

# 2. 既有 ready task 状态与 PNG
GET $base/share-image-tasks/share-task-1781787045694-9725ffeb
GET http://127.0.0.1:3221/uploads/moments/share-tasks/share-task-1781787045694-9725ffeb.png

# 3. 本地临时任务，证明 pending -> process -> ready -> GET ready
POST $base/session-briefs/brief-1781787045693-bc8904b9/share-image-tasks
body: {
  "layoutMode": "status_contract_008bg_rerun_1781864833387",
  "includeLedger": true,
  "selectedNodeIds": [
    "moment-1781787045691-181c3e21",
    "moment-1781787045691-92c7f14b",
    "event-1781787045692-6dbe67d6",
    "event-1781787045693-464dde2c"
  ]
}
GET $base/share-image-tasks/share-task-1781864833426-2696766c
POST $base/share-image-tasks/share-task-1781864833426-2696766c/process
GET $base/share-image-tasks/share-task-1781864833426-2696766c
GET http://127.0.0.1:3221/uploads/moments/share-tasks/share-task-1781864833426-2696766c.png

# 4. 二维码现状
GET http://127.0.0.1:3221/api/v1/tools/qr-code.png?text=<share-path>
GET http://127.0.0.1:3221/static/share-miniapp-qr.png
```

raw brief 摘要：

| 字段 | 结果 |
| --- | --- |
| HTTP / code | `200 / 0` |
| title | `聚会时间线简报` |
| timelineNodeCount | `5` |
| momentCount / with image | `3 / 2` |
| eventCount | `2` |
| ledger event | `drink_debt=true`、`drink_add=true` |
| 成员头像字段 | 照片节点 `uploaderAvatarUrl` 均为空；账本 event 不返回 `operatorAvatarUrl/targetAvatarUrl`，只返回 profileId/name；前端需用成员资料合并或显示头像兜底 |

timeline 节点：

| nodeKind | type | id | createdAt | actor | target | scoreDelta | imageUrl |
| --- | --- | --- | --- | --- | --- | ---: | --- |
| moment | `highlight` | `moment-1781787045691-181c3e21` | `2026-06-18T12:50:45.691Z` | 聚会记录师成员A |  | `0` | `/uploads/moments/session-1781787045680-8e406c/1781787045687-party-highlight-a07ad1.webp` |
| moment | `opening` | `moment-1781787045691-92c7f14b` | `2026-06-18T12:50:45.691Z` | 聚会记录师房主 |  | `0` | `/uploads/moments/session-1781787045680-8e406c/1781787045682-party-opening-c85a76.webp` |
| moment | `private` | `moment-1781787045692-d340df06` | `2026-06-18T12:50:45.692Z` | 聚会记录师成员B |  | `0` | 成员 A 视角为空，私密占位 |
| event | `drink_debt` | `event-1781787045692-6dbe67d6` | `2026-06-18T12:50:45.692Z` | 聚会记录师房主 | 聚会记录师成员A | `1` |  |
| event | `drink_add` | `event-1781787045693-464dde2c` | `2026-06-18T12:50:45.693Z` | 聚会记录师房主 | 聚会记录师成员B | `1` |  |

分享任务链路摘要：

| 步骤 | HTTP / code | taskId | status | imageUrl / PNG | 时间字段 |
| --- | --- | --- | --- | --- | --- |
| 读取既有 ready task | `200 / 0` | `share-task-1781787045694-9725ffeb` | `ready` | `/uploads/moments/share-tasks/share-task-1781787045694-9725ffeb.png`，GET `200 image/png`，`168293` bytes | `startedAt=2026-06-18T12:50:45.695Z`、`finishedAt/updatedAt=2026-06-18T12:50:45.807Z` |
| 创建临时 task | `201 / 0` | `share-task-1781864833426-2696766c` | `pending` | 空 | `createdAt/updatedAt=2026-06-19T10:27:13.426Z` |
| 创建后立即 GET | `200 / 0` | `share-task-1781864833426-2696766c` | `pending` | 空 | 同上 |
| `POST /process` | `200 / 0` | `share-task-1781864833426-2696766c` | `ready` | `/uploads/moments/share-tasks/share-task-1781864833426-2696766c.png` | `startedAt=2026-06-19T10:27:13.429Z`、`finishedAt/updatedAt=2026-06-19T10:27:13.604Z` |
| process 后再次 GET | `200 / 0` | `share-task-1781864833426-2696766c` | `ready` | PNG GET `200 image/png`，`268892` bytes，PNG signature `89504e470d0a1a0a` | 与 process 返回一致 |

刷新状态合同判断：

- 当前本地合同支持真实状态回传：创建后 `GET` 返回 `pending/imageUrl=""`；同步 `POST /share-image-tasks/:taskId/process` 完成后，再次 `GET` 立即返回 `ready/imageUrl/finishedAt/updatedAt`。
- 前端不能把“预览状态”写死为 ready；应以 `GET /share-image-tasks/:taskId` 的 `status`、`imageUrl`、`failedReason`、`updatedAt/finishedAt` 为准。
- 玩家分享按钮启用条件建议：`status === "ready" && imageUrl`；pending/processing/failed/expired 不应允许保存或分享成品图。失败 / 过期时按合同调用 `POST /share-image-tasks/:taskId/retry`，只允许 `failed/expired`，本轮未对 ready 任务执行 retry。
- 如果前端不主动调用 `process`，当前本地实现不会有后台 worker 自动推进 pending；生产若没有独立 worker，前端 / 测试需要明确触发 `process` 或按后端队列返回的状态轮询。

二维码合同：

| 来源 | 结果 | 判断 |
| --- | --- | --- |
| `GET /api/v1/tools/qr-code.png?text=<share-path>` | `200 image/png`，`6072` bytes，PNG signature `89504e470d0a1a0a` | 普通二维码生成接口，编码任意文本 / 路径；不是微信小程序码合同 |
| `GET /static/share-miniapp-qr.png` | `200 image/png`，`133743` bytes，PNG signature `89504e470d0a1a0a` | 静态旧资产，可作为临时底部二维码图片候选；是否为真实可用小程序码未由接口证明 |
| share task / renderer | `shareImageTask` 不返回 `qrCodeUrl` / `miniProgramCodeUrl`；`buildShareImageSvg` 当前未接入 QR 字段 | 分享图底部“小程序二维码”缺正式合同；不能声称当前生成 PNG 已包含可用小程序码 |

二维码最小合同建议：

- 后端/API 给 share task 或 share config 增加明确字段：`miniProgramQrUrl` 或 `shareQrCodeUrl`。
- 若只是普通二维码，字段名应避免写“小程序码”，建议 `qrCodeUrl`；若是微信小程序码，需由后端接微信接口生成并写 `miniProgramCodeUrl`，同时说明 scene/path、有效期、环境版本。
- 分享图 renderer 应显式把该 URL 绘制到底部，并在 task GET 中回传所用二维码 URL / 类型，方便前端和测试核查。

结束聚会 / 账本提交 API 只读合同：

| 目标 | 当前 API | 参数 / 权限 | 返回 / 影响数据源 | 本轮执行 |
| --- | --- | --- | --- | --- |
| 账本欠酒 / 加酒提交 | `POST /sessions/:sessionId/events` | host 才能写；`clientEventId` 必填；`eventType=drink_debt/drink_add/wheel_result`；`targetProfileId` 必须是本局成员；`scoreDelta` 为数量 | 成功 `201 / code=0`，写 `moments-store.sessionEvents`，影响 `GET /sessions/:id/timeline`、brief `ledgerSummary/accountingHighlights/eventHighlights`、分享图账本区 | 未执行，避免新增账本事件污染 008g；008g 既有两条事件已可读 |
| 账本成员计数 / session 字段调整 | `PUT /sessions/:sessionId` | host 才能写；memberA 非 host 会 403，见 3.48 | 成功 `200 / code=0`，写 `admin-store.liveSessions` 成员计数 / session 状态等 | 未执行 |
| 结束聚会 / 生成报告 | `POST /reports` | 登录用户；payload 可带 `sessionId/sessionName/playerCount/events/ranks/sessionState/sessionStatus` | 成功 `201 / code=0`，写 `admin-store.reports`，并按 payload 更新 `liveSessions[].state/status`；不是 brief 读取接口 | 未执行，避免生成报告和改 session 状态 |

cleanup / 残留口径：

- 本轮新增本地 share tasks：`share-task-1781864781729-5aa63c1b`、`share-task-1781864833426-2696766c`。
- 本轮新增本地 PNG：`backend/public/uploads/moments/share-tasks/share-task-1781864781729-5aa63c1b.png`、`backend/public/uploads/moments/share-tasks/share-task-1781864833426-2696766c.png`，两者均 `268892` bytes。
- 本轮未 cleanup，保留给测试可复跑；如 PM 后续要求清理，应精确移除上述两个 task、对应 PNG，并将 `brief-1781787045693-bc8904b9` 的 `shareImageTaskId/shareImageStatus` 恢复到清理前或重新指向既有 ready task `share-task-1781787045694-9725ffeb`，再做残留扫描。

warnings/skipped：

- 未触碰 `api.pomer.cn` / `pomer.cn`，未部署，未重启线上。
- 未执行 DevTools；不写前端 / 测试 / UI / 上线通过。
- 未执行 ready task retry；按合同 ready 不可 retry，retry 只用于 `failed/expired`。
- 二维码当前只能证明普通 QR 接口和静态 QR 资产可达，不能证明分享图底部已有微信小程序码。
- token 仅公开后 8 位 `b8615971`。

### 3.56 `PR-INT-SHARE-QR-PROCESS-VERIFY-008BL` 分享二维码与生成状态复核条件待命

记录时间：2026-06-19。PM 追加 008BL 条件待命：等待后端/API `PR-BE-SHARE-QR-CONTRACT-008BJ` 和前端 `PR-FE-SHARE-QR-INTEGRATE-008BK` 回包后，接口联调再执行分享 task 二维码字段、ready PNG 底部二维码和 create -> process -> GET status 即时回传复核。本节仅登记待命；当前不提前 cleanup、不新增写入、不扩大验证、不触碰 `pomer.cn` 官网，不写测试 / UI / 上线通过。

待触发前置：

| 依赖 | 必须回包内容 |
| --- | --- |
| 后端/API 008BJ | share task payload 明确返回 `miniProgramQrUrl` 或 `qrCodeUrl`；如补 `posterImageUrl` / `readyShareImageUrl`，需说明字段来源和兼容口径；ready PNG renderer 已把二维码绘制到底部，或明确普通 QR 与微信小程序码的差异 |
| 前端 008BK | 前端读取新字段并在分享 / 保存状态页消费；仍保留 `imageUrl` 状态源，不把预览状态写死；给测试页面 query 和 data 字段名 |

待验证范围：

1. 后端 share task payload 是否同时保留 `imageUrl`，并返回 `miniProgramQrUrl` / `qrCodeUrl`；如有 `posterImageUrl` / `readyShareImageUrl`，记录字段值、优先级和是否与 `imageUrl` 等价。
2. ready PNG 底部是否实际包含二维码区域：必须至少执行 PNG GET、尺寸 / 字节摘要；必要时做像素抽样或截图证据，不能只看字段。
3. `create -> process -> GET status` 是否仍能 `pending -> ready -> ready/imageUrl` 即时回传；若后端改为 worker 队列，需记录轮询间隔、最大等待和状态过渡。
4. 给前端 / 测试可复跑样本：`sessionId`、`briefId`、`taskId`、token 后 8 位、API base、页面 query、cleanup / 残留口径。

预设样本与命令模板，待依赖回包后执行：

```powershell
$base = 'http://127.0.0.1:3221/api/v1'
$sessionId = 'session-1781787045680-8e406c'
$briefId = 'brief-1781787045693-bc8904b9'
# token 只从 private/env 读取；公开日志仅输出后 8 位 b8615971

GET $base/session-briefs/$briefId
POST $base/session-briefs/$briefId/share-image-tasks
POST $base/share-image-tasks/<new-task-id>/process
GET $base/share-image-tasks/<new-task-id>
GET http://127.0.0.1:3221/uploads/moments/share-tasks/<new-task-id>.png
```

预期记录字段：

| 类别 | 字段 |
| --- | --- |
| task 状态 | `taskId/status/imageUrl/failedReason/retryCount/createdAt/startedAt/finishedAt/updatedAt` |
| 二维码字段 | `miniProgramQrUrl/qrCodeUrl/posterImageUrl/readyShareImageUrl`，以及字段是否为空、是否可 GET |
| PNG 证据 | URL、HTTP、Content-Type、bytes、尺寸、底部二维码区域像素 / 截图摘要 |
| 样本身份 | `sessionId/briefId/profileId/tokenTail/API base` |
| cleanup | 新增 taskId、PNG 路径、是否保留给测试、清理命令和 brief task 指针恢复口径 |

执行记录：2026-06-19 PM 解除待命并正式触发 008BL。后端/API 008BJ 已补字段和 renderer，前端 008BK 已补 create -> process -> GET status 消费逻辑。本轮在本地 `127.0.0.1:3221/api/v1` 复核，不触碰 `api.pomer.cn` / `pomer.cn` 官网，不写测试 / UI / 上线通过。

环境恢复：

| 项 | 结果 |
| --- | --- |
| API base | `http://127.0.0.1:3221/api/v1` |
| 原本地进程 | 3.53 启动的 3221 旧进程 PID `17684`，为加载 008BJ 新代码已停止 |
| 新本地进程 | PID `472` |
| 启动命令 | `PORT=3221 npm.cmd --prefix backend start` |
| stdout | `docs/runtime/pr-int-share-qr-process-verify-008bl-3221.out.log`，含 `jiuzhuopanguan backend listening on port 3221` |
| stderr | `docs/runtime/pr-int-share-qr-process-verify-008bl-3221.err.log`，当前无错误输出 |

样本与身份：

| 字段 | 值 |
| --- | --- |
| sessionId | `session-1781787045680-8e406c` |
| briefId | `brief-1781787045693-bc8904b9` |
| profileId | `user-1781787045679-f3f2eb` |
| token 后 8 位 | `b8615971` |
| 新 taskId | `share-task-1781865942423-96fd9bd9` |
| layoutMode | `qr_contract_008bl_1781865942388` |

可复跑命令摘要：

```powershell
$base = 'http://127.0.0.1:3221/api/v1'
# token 只从 private/env 读取；公开日志仅输出后 8 位 b8615971

GET $base/session-briefs/brief-1781787045693-bc8904b9

POST $base/briefs/brief-1781787045693-bc8904b9/share-images
body: {
  "layoutMode": "qr_contract_008bl_<timestamp>",
  "includeLedger": true,
  "selectedNodeIds": [
    "moment-1781787045691-181c3e21",
    "moment-1781787045691-92c7f14b",
    "event-1781787045692-6dbe67d6",
    "event-1781787045693-464dde2c"
  ]
}

GET  $base/share-images/<taskId>
POST $base/share-images/<taskId>/process
GET  $base/share-images/<taskId>
GET  $base/share-image-tasks/<taskId>   # legacy detail used to confirm full updatedAt/selectedNodeIds
GET  http://127.0.0.1:3221/uploads/moments/share-tasks/<taskId>.png
GET  http://127.0.0.1:3221/static/share-miniapp-qr.png
```

brief / 节点摘要：

| 接口 | HTTP / code | 摘要 |
| --- | --- | --- |
| `GET /session-briefs/brief-1781787045693-bc8904b9` | `200 / 0` | `timelineNodeCount=5`、`momentWithImageCount=2`、`hasDrinkDebt=true`、`hasDrinkAdd=true` |

create -> process -> GET status 摘要：

| 步骤 | HTTP / code | status | imageUrl | posterImageUrl | readyShareImageUrl | miniProgramQrUrl / qrCodeUrl | 时间字段 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| clean create `/briefs/:briefId/share-images` | `201 / 0` | `pending` | 空 | 空 | 空 | `/static/share-miniapp-qr.png` / `/static/share-miniapp-qr.png` | `createdAt=2026-06-19T10:45:42.423Z` |
| clean GET after create | `200 / 0` | `pending` | 空 | 空 | 空 | `/static/share-miniapp-qr.png` / `/static/share-miniapp-qr.png` | `createdAt=2026-06-19T10:45:42.423Z` |
| clean `POST /share-images/:taskId/process` | `200 / 0` | `ready` | `/uploads/moments/share-tasks/share-task-1781865942423-96fd9bd9.png` | 同 `imageUrl` | 同 `imageUrl` | `/static/share-miniapp-qr.png` / `/static/share-miniapp-qr.png` | `finishedAt=2026-06-19T10:45:42.613Z` |
| clean GET after process | `200 / 0` | `ready` | `/uploads/moments/share-tasks/share-task-1781865942423-96fd9bd9.png` | 同 `imageUrl` | 同 `imageUrl` | `/static/share-miniapp-qr.png` / `/static/share-miniapp-qr.png` | `finishedAt=2026-06-19T10:45:42.613Z` |
| legacy GET `/share-image-tasks/:taskId` | `200 / 0` | `ready` | `/uploads/moments/share-tasks/share-task-1781865942423-96fd9bd9.png` | 同 `imageUrl` | 同 `imageUrl` | `/static/share-miniapp-qr.png` / `/static/share-miniapp-qr.png` | `startedAt=2026-06-19T10:45:42.426Z`、`finishedAt/updatedAt=2026-06-19T10:45:42.613Z` |

结论：本地 clean 合同已支持 `pending -> ready -> ready/imageUrl` 即时回传；`imageUrl` 保留，`posterImageUrl` / `readyShareImageUrl` 与 `imageUrl` 等价，`miniProgramQrUrl` / `qrCodeUrl` 指向 `/static/share-miniapp-qr.png`。clean 映射里 `updatedAt` 为空，因此本轮用 legacy GET 补充确认完整 `updatedAt`；如前端只依赖 clean 字段展示刷新时间，后端/API 需评估是否把 `updatedAt` 也映射到 clean task。

PNG / 二维码证据：

| 目标 | HTTP | Content-Type | bytes | PNG signature | 尺寸 / 像素摘要 |
| --- | --- | --- | ---: | --- | --- |
| `/uploads/moments/share-tasks/share-task-1781865942423-96fd9bd9.png` | `200` | `image/png` | `287373` | `89504e470d0a1a0a` | `900x1400`；底部右侧 QR 区域 crop `{ left:680, top:1196, width:108, height:108 }`，RGB min/max 覆盖 `0/255`，stdev sum `228.35`，说明该区域有高对比图形，不是纯色空白 |
| `/static/share-miniapp-qr.png` | `200` | `image/png` | `133743` | `89504e470d0a1a0a` | `430x430`；QR 区域 crop stdev sum `221.58`，静态小程序码占位资源可达 |

二维码口径：

- 本轮验证的是 008BJ 明确的旧项目静态小程序码占位：`miniProgramQrUrl=/static/share-miniapp-qr.png`、`qrCodeUrl=/static/share-miniapp-qr.png`。
- PNG renderer 已把该静态码画入底部右侧安全区；像素采样区域与 renderer 坐标 `x=680,y=1196,w=108,h=108` 对齐。
- 本轮不声称它是会话专属小程序码，也不声称线上已部署。

cleanup / 残留口径：

- 本轮新增本地 task：`share-task-1781865942423-96fd9bd9`。
- 本轮新增本地 PNG：`backend/public/uploads/moments/share-tasks/share-task-1781865942423-96fd9bd9.png`。
- 未 cleanup，保留给前端 / 测试复跑。若 PM 后续要求清理，应精确删除该 task 和 PNG，并恢复 `brief-1781787045693-bc8904b9` 的 `shareImageTaskId/shareImageStatus` 指针到清理前或既有 ready task，再做残留扫描。

warnings/skipped：

- 未触碰 `api.pomer.cn` / `pomer.cn`，未部署、未重启线上。
- 未触发 DevTools，不写测试 / UI / 上线通过。
- 未 cleanup 3.55 的 008BG 临时 task，也未 cleanup 本轮 008BL task。
- token 仅公开后 8 位 `b8615971`。

### 3.57 `PR-INT-LEDGER-HOST-WRITEBACK-SAMPLE-008BN` host 账本写入与记录页同步样本

记录时间：2026-06-19。PM 派发 008BN：测试 13.16.120 已收口 008BI，但 ledger 仍阻塞于当前测试只有 memberA token，`ledgerEditable=false`，不能验证“加减暂存 -> 确定修改 -> 记录页 timeline / 账本 tab 同步”。本轮仅在本地 `127.0.0.1:3221/api/v1` 使用 008g host token 做最小写入验证；未触碰 `api.pomer.cn` / `pomer.cn` 官网，未 cleanup 008BL ready share task，不写测试 / 真机 / 上线通过。

证据文件：

| 文件 | 内容 |
| --- | --- |
| `docs/runtime/pr-int-ledger-host-writeback-008bn-before.json` | 写入前 008g session、成员计数、timeline events、008BL / 008BG share task 保留摘要 |
| `docs/runtime/pr-int-ledger-host-writeback-008bn-result.json` | host 写入命令结果、写前 / 写后 live 与 timeline 摘要 |

环境 / 样本：

| 字段 | 值 |
| --- | --- |
| API base | `http://127.0.0.1:3221/api/v1` |
| local 3221 | PID `472`，沿用 3.56 本地进程 |
| sessionId | `session-1781787045680-8e406c` |
| inviteCode | `J2BEL2` |
| sessionName | `周末聚会记录` |
| host profileId | `user-1781787045678-c892b9` |
| host token 后 8 位 | `ddceb616` |
| memberA profileId | `user-1781787045679-f3f2eb` |
| memberB profileId | `user-1781787045679-4cd6ea` |

只读 / 写入命令摘要：

```powershell
# 1. 写前快照，保留可回滚 session 与 events
node -e "<read backend/data/admin-store.json + backend/data/moments-store.json; write docs/runtime/pr-int-ledger-host-writeback-008bn-before.json>"

# 2. host token 调用 live/timeline 写前摘要
GET http://127.0.0.1:3221/api/v1/sessions/live?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2
GET http://127.0.0.1:3221/api/v1/sessions/session-1781787045680-8e406c/timeline

# 3. host 确定修改账本 tab 计数
PUT http://127.0.0.1:3221/api/v1/sessions/session-1781787045680-8e406c
body: selectedPlayers=[
  memberA debtCount: 0 -> 1,
  memberB drinkCount: 0 -> 1
]

# 4. host 新增一条 timeline 账本事件，证明记录页 timeline 可同步新节点
POST http://127.0.0.1:3221/api/v1/sessions/session-1781787045680-8e406c/events
body: {
  "clientEventId": "pr-int-008bn-host-writeback-debt-1781866200",
  "eventType": "drink_debt",
  "targetProfileId": "user-1781787045679-f3f2eb",
  "scoreDelta": 1,
  "caption": "008BN host writeback check"
}

# 5. 写后复读 live/timeline
GET http://127.0.0.1:3221/api/v1/sessions/live?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2
GET http://127.0.0.1:3221/api/v1/sessions/session-1781787045680-8e406c/timeline
```

写前摘要：

| 数据源 | HTTP / code | 摘要 |
| --- | --- | --- |
| `GET /sessions/live` | `200 / 0` | 3 名成员均 `debtCount=0/drinkCount=0/clearedCount=0`；hostProfileId=`user-1781787045678-c892b9` |
| `GET /sessions/:id/timeline` | `200 / 0` | `nodeCount=5`、`ledgerEventCount=2`；已有 `drink_debt` 与 `drink_add` 各 1 条 |

写入结果：

| 操作 | HTTP / code | 结果 |
| --- | --- | --- |
| host `PUT /sessions/:sessionId` | `200 / 0` | memberA `debtCount 0 -> 1`；memberB `drinkCount 0 -> 1`；host 保持 `0/0/0` |
| host `POST /sessions/:sessionId/events` | `201 / 0` | 新增 `event-1781866683850-2a2b287a`，`eventType=drink_debt`，operator=房主，target=成员A，`scoreDelta=1`，`clientEventId=pr-int-008bn-host-writeback-debt-1781866200` |

写后摘要：

| 数据源 | HTTP / code | 摘要 |
| --- | --- | --- |
| `GET /sessions/live` | `200 / 0` | memberA `debtCount=1/drinkCount=0`；memberB `debtCount=0/drinkCount=1`；账本 tab 可据此显示欠酒 / 加酒同步后的成员计数 |
| `GET /sessions/:id/timeline` | `200 / 0` | `nodeCount 5 -> 6`、`ledgerEventCount 2 -> 3`；新增 host 写入的 `drink_debt` 节点可供记录页 timeline 展示 |

前端 / 测试可复跑口径：

| 目标 | query / storage |
| --- | --- |
| host ledger 页 | `/pages/ledger/index?sessionId=session-1781787045680-8e406c&role=member`，storage 使用 host profile `user-1781787045678-c892b9` 与 token 后 8 位 `ddceb616` |
| host 记录页 | `/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=member`，同 host storage |
| memberA 只读反例 | 使用 memberA token 后 8 位 `b8615971`，应仍 `ledgerEditable=false`，只读查看写后计数 / timeline |

接口责任判断：

- `PUT /sessions/:sessionId` 已可用来持久化 host 在账本页“暂存后确定修改”的成员计数；非 host 403 的口径仍沿用 3.48。
- `POST /sessions/:sessionId/events` 已可用来向记录页 timeline 写入账本事件；如果前端要求“确定修改”自动生成时间线节点，需要前端在确认时同步调用 event 写入，或后端/API 提供复合接口一次性更新计数并产生日志事件。
- 当前前端源码先前显示 ledger `handleConfirmTap` 只调用 `PUT /sessions/:sessionId`；这能同步账本 tab 计数，但不会自动新增 timeline event。008BN 的记录页 timeline 同步需要前端 008BN 或后端/API 复合接口补齐，不能只靠 `PUT` 推导新 timeline 节点。

cleanup / 回滚口径：

- 本轮未 cleanup，保留 host 写入结果供前端 / 测试复跑。
- 本轮新增 / 修改：
  - `admin-store.liveSessions[].members` 中 008g memberA `debtCount=1`、memberB `drinkCount=1`。
  - `moments-store.sessionEvents` 新增 `event-1781866683850-2a2b287a`。
- 未 cleanup 008BL / 008BG ready share tasks；写前快照确认保留 `share-task-1781865942423-96fd9bd9`、`share-task-1781864833426-2696766c`、`share-task-1781864781729-5aa63c1b`。
- 精确回滚命令模板，需 PM 明确后再执行：

```powershell
node -e "const fs=require('fs'); const before=JSON.parse(fs.readFileSync('docs/runtime/pr-int-ledger-host-writeback-008bn-before.json','utf8')); const adminPath='backend/data/admin-store.json'; const momentsPath='backend/data/moments-store.json'; const admin=JSON.parse(fs.readFileSync(adminPath,'utf8')); const moments=JSON.parse(fs.readFileSync(momentsPath,'utf8')); admin.liveSessions=(admin.liveSessions||[]).map(s=>s.id===before.sessionId?before.session:s); const beforeIds=new Set((before.events||[]).map(e=>e.id)); moments.sessionEvents=(moments.sessionEvents||[]).filter(e=>e.sessionId!==before.sessionId || beforeIds.has(e.id)); fs.writeFileSync(adminPath,JSON.stringify(admin,null,2)); fs.writeFileSync(momentsPath,JSON.stringify(moments,null,2)); console.log('rolled back 008BN ledger writeback sample');"
```

warnings / skipped：

- 未触碰 `api.pomer.cn` / `pomer.cn`，未线上写入、未部署、未重启线上。
- 未 cleanup 当前 008BL ready share task。
- 未泄露完整 token；公开只写 host token 后 8 位 `ddceb616`、memberA token 后 8 位 `b8615971`。
- 本节只证明接口写入与本地样本可复跑，不写测试通过、真机通过或上线通过。

### 3.58 `PR-INT-LEDGER-REAL-AVATAR-SAMPLE-008BR` 真实头像样本读回

记录时间：2026-06-19。PM 派发 008BR：后端/API 008BM 已补 live / brief / clean facade 的头像字段合同，但 008g 样本原始头像仍多为空串，无法支撑 008BP 写“真实头像”结论。本轮只在本地 `127.0.0.1:3221/api/v1` 处理 008g 样本头像数据源，生成的是“本地可回滚测试头像样本”：头像来源为写入 session member / social profile 的项目内静态头像资产，不等于微信授权头像上线通过。不触碰 `api.pomer.cn` / `pomer.cn` 官网，不写测试 / 真机 / 上线通过。

证据文件：

| 文件 | 内容 |
| --- | --- |
| `docs/runtime/pr-int-ledger-real-avatar-008br-before.json` | 写入前 008g session、host/member profile、session member / social profile 头像空值快照 |
| `docs/runtime/pr-int-ledger-real-avatar-008br-result.json` | 写入后 3221 读回摘要，覆盖 live、timeline、raw brief、clean brief、静态头像 GET |
| `docs/runtime/pr-int-ledger-real-avatar-008br-3221.out.log` | 本地 3221 重启 stdout，PID `24988` |
| `docs/runtime/pr-int-ledger-real-avatar-008br-3221.err.log` | 本地 3221 重启 stderr；仅记录既有启动日志 / warning |

环境 / 样本：

| 字段 | 值 |
| --- | --- |
| API base | `http://127.0.0.1:3221/api/v1` |
| local 3221 | PID `24988`，为加载头像写入后的 store 已重启本地服务 |
| sessionId | `session-1781787045680-8e406c` |
| inviteCode | `J2BEL2` |
| briefId | `brief-1781787045693-bc8904b9` |
| host profileId / token 后 8 位 | `user-1781787045678-c892b9` / `ddceb616` |
| memberA profileId / token 后 8 位 | `user-1781787045679-f3f2eb` / `b8615971` |
| memberB profileId / token 后 8 位 | `user-1781787045679-4cd6ea` / `c9c5b046` |

写入来源与命令摘要：

```powershell
# 1. 写入前快照
node -e "<read backend/data/admin-store.json + backend/data/social-store.json; write docs/runtime/pr-int-ledger-real-avatar-008br-before.json>"

# 2. 将 008g host/member 的头像写入 session member 与 social profile 数据源
# host    user-1781787045678-c892b9 -> /static/avatar-1.png
# memberA user-1781787045679-f3f2eb -> /static/avatar-2.png
# memberB user-1781787045679-4cd6ea -> /static/avatar-3.png
node -e "<update backend/data/admin-store.json liveSessions[].hostAvatarUrl/members[].avatarUrl and backend/data/social-store.json profiles[].avatarUrl>"

# 3. 重启本地 3221 读取当前 JSON store
PORT=3221 npm.cmd --prefix backend start

# 4. 只读复核
GET http://127.0.0.1:3221/api/v1/sessions/live?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2
GET http://127.0.0.1:3221/api/v1/sessions/session-1781787045680-8e406c/timeline
GET http://127.0.0.1:3221/api/v1/session-briefs/brief-1781787045693-bc8904b9
GET http://127.0.0.1:3221/api/v1/briefs/brief-1781787045693-bc8904b9
GET http://127.0.0.1:3221/static/avatar-1.png
GET http://127.0.0.1:3221/static/avatar-2.png
GET http://127.0.0.1:3221/static/avatar-3.png
```

写前状态：

| 数据源 | 摘要 |
| --- | --- |
| `admin-store.liveSessions[].hostAvatarUrl` | 008g host 头像为空串 |
| `admin-store.liveSessions[].members[].avatarUrl` | host / memberA / memberB 头像均为空串 |
| `social-store.profiles[].avatarUrl` | host / memberA / memberB 头像均为空串 |

写后读回摘要：

| 数据源 | HTTP / code | 头像字段摘要 |
| --- | --- | --- |
| `GET /sessions/live` | `200 / 0` | `hostAvatarUrl=/static/avatar-1.png`；`joinedPlayers[]` 与 `joinStatusPlayers[]` 中 host/memberA/memberB 均返回非空 `avatarUrl` |
| `GET /sessions/:id/timeline` | `200 / 0` | `nodeCount=6`；2 条照片节点返回 `uploaderAvatarUrl=/static/avatar-2.png`、`/static/avatar-1.png`；3 条账本 event 返回 `operatorAvatarUrl=/static/avatar-1.png`，`targetAvatarUrl=/static/avatar-2.png` 或 `/static/avatar-3.png` |
| `GET /session-briefs/:briefId` | `200 / 0` | raw brief `timelineNodes` 与 timeline 接口一致，照片 / 账本 event 头像字段均非空 |
| `GET /briefs/:briefId` | `200 / 0` | clean `photoHighlights[]` 返回 `uploaderAvatarUrl=/static/avatar-2.png`、`/static/avatar-1.png`；clean `keyEvents[]` 的 `operatorAvatarUrl/targetAvatarUrl` 仍为空串 |
| 静态头像 GET | `200` | `/static/avatar-1.png` 401120 bytes、`/static/avatar-2.png` 418684 bytes、`/static/avatar-3.png` 399592 bytes，均为 `image/png`，PNG signature `89504e470d0a1a0a` |

前端 / 测试可复跑口径：

| 目标 | query / storage |
| --- | --- |
| ledger/live 成员头像 | `/pages/ledger/index?sessionId=session-1781787045680-8e406c&role=member`，storage 使用 memberA token 后 8 位 `b8615971` 或 host token 后 8 位 `ddceb616` |
| live record 时间线头像 | `/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=member`，同 008g 成员态 storage |
| share / brief 照片头像 | `/pages/share-preview/index?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2&briefId=brief-1781787045693-bc8904b9`，同 memberA token 后 8 位 `b8615971` |

接口责任判断：

- ledger/live 可消费的 `joinedPlayers[].avatarUrl`、`joinStatusPlayers[].avatarUrl` 和 `hostAvatarUrl` 已可由 session member / social profile 数据源读回，满足接口侧头像字段合同复核。
- raw timeline / raw brief 的 moment 与 ledger event 头像字段已可读；记录页如消费 `timelineNodes` / `/sessions/:id/timeline`，可拿到操作者与目标玩家头像。
- clean facade 的 `photoHighlights[].uploaderAvatarUrl` 已可读；但 clean `keyEvents[]` 仍未带出账本 event 的 `operatorAvatarUrl/targetAvatarUrl`。该缺口不阻塞本轮 ledger / live-record 使用 live 或 raw timeline 验证头像，但不能写 clean brief 事件头像通过；如前端 008BP 必须在 clean `keyEvents` 展示账本头像，需要后端/API 继续补 clean keyEvents 映射，或前端改用 raw timeline 字段。

cleanup / 回滚口径：

- 本轮未 cleanup，保留 008g 头像写入供前端 / 测试复跑；未 cleanup 008BN 账本写入、未 cleanup 008BL ready share task。
- 写入仅限本地数据源：
  - `backend/data/admin-store.json` 中 008g `hostAvatarUrl` 与 host/memberA/memberB `members[].avatarUrl`。
  - `backend/data/social-store.json` 中 host/memberA/memberB `profiles[].avatarUrl`。
- 精确回滚命令模板，需 PM 明确后再执行；执行后需重启 3221 或确认进程已重新加载 store：

```powershell
node -e "const fs=require('fs'); const before=JSON.parse(fs.readFileSync('docs/runtime/pr-int-ledger-real-avatar-008br-before.json','utf8')); const adminPath='backend/data/admin-store.json'; const socialPath='backend/data/social-store.json'; const admin=JSON.parse(fs.readFileSync(adminPath,'utf8')); const social=JSON.parse(fs.readFileSync(socialPath,'utf8')); admin.liveSessions=(admin.liveSessions||[]).map(s=>s.id===before.sessionId?before.session:s); const profileMap=new Map((before.profiles||[]).map(p=>[p.id,p])); social.profiles=(social.profiles||[]).map(p=>profileMap.has(p.id)?profileMap.get(p.id):p); fs.writeFileSync(adminPath,JSON.stringify(admin,null,2)); fs.writeFileSync(socialPath,JSON.stringify(social,null,2)); console.log('rolled back 008BR avatars');"
```

warnings / skipped：

- 本轮头像使用项目内已有真人风格静态头像资产 `/static/avatar-1.png` 至 `/static/avatar-3.png`，并写入 session member / social profile 数据源；不是灰色默认头像，也不是接口临时造字段，但仍属于本地可回滚测试头像样本，不等于微信授权头像上线通过。若 PM / 测试要求“真实微信授权头像”，需前端 / 测试提供实际授权登录 profile 头像数据后再复核。
- clean `keyEvents[]` 账本事件头像仍为空，已列为后端/API clean facade 映射缺口；raw timeline 与 raw brief 已有账本 event 头像。
- 未触碰 `api.pomer.cn` / `pomer.cn`，未线上写入、未部署、未重启线上。
- 未泄露完整 token；公开只写后 8 位 `ddceb616`、`b8615971`、`c9c5b046`。
- 本节只证明接口字段与本地样本可复跑，不写测试通过、真机通过或上线通过。

### 3.59 `PR-INT-008G-SAMPLE-FREEZE-ROLLBACK-008BU` 008g 样本冻结与回滚方案

记录时间：2026-06-19。PM 恢复派发 008BU：008BP 测试 13.16.126 已完成 ledger / live-record 单点预览框复测，但 008g 本地样本已经被 008BL / 008BN / 008BR / 008BP 多轮写入累加。本轮只做只读核查和方案，不 cleanup、不重建、不线上写入、不触碰 `pomer.cn` 官网，不写测试 / 上线通过。

只读命令摘要：

```powershell
# store 摘要，只输出 ID、计数、状态、token 后 8 位，不输出完整 token
node -e "<read backend/data/admin-store.json + backend/data/moments-store.json + backend/data/social-store.json; summarize session-1781787045680-8e406c / brief-1781787045693-bc8904b9>"

# 当前本地 API 只读漂移复核
$base='http://127.0.0.1:3221/api/v1'
GET $base/sessions/live?sessionId=session-1781787045680-8e406c
GET $base/sessions/live?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2
GET $base/sessions/live?sessionId=session-1781787045680-8e406c&inviteCode=PNLGNK
```

当前 008g 冻结摘要：

| 字段 | 当前值 |
| --- | --- |
| API base | `http://127.0.0.1:3221/api/v1` |
| sessionId | `session-1781787045680-8e406c` |
| inviteCode | `J2BEL2` |
| sessionName | `周末聚会记录` |
| playerCount / joinedCount | `3 / 3` |
| briefId | `brief-1781787045693-bc8904b9`；session 本体无独立 brief 指针字段，brief 通过 `moments-store.sessionBriefs[].sessionId` 关联 |
| host | `user-1781787045678-c892b9`，token 后 8 位 `ddceb616`，`avatarUrl=/static/avatar-1.png`，`debtCount=3/drinkCount=0/clearedCount=0` |
| memberA | `user-1781787045679-f3f2eb`，token 后 8 位 `b8615971`，`avatarUrl=/static/avatar-2.png` 或本地绝对 URL，`debtCount=2/drinkCount=0/clearedCount=0` |
| memberB | `user-1781787045679-4cd6ea`，token 后 8 位 `c9c5b046`，`avatarUrl=/static/avatar-3.png` 或本地绝对 URL，`debtCount=0/drinkCount=1/clearedCount=0` |

当前 sessionEvents 摘要：

| ID | 类型 | 来源判断 | target | scoreDelta | createdAt |
| --- | --- | --- | --- | ---: | --- |
| `event-1781787045692-6dbe67d6` | `drink_debt` | 008g 原始欠酒 | memberA | `1` | `2026-06-18T12:50:45.692Z` |
| `event-1781787045693-464dde2c` | `drink_add` | 008g 原始加酒 | memberB | `1` | `2026-06-18T12:50:45.693Z` |
| `event-1781866683850-2a2b287a` | `drink_debt` | 008BN host 写入样本 | memberA | `1` | `2026-06-19T10:58:03.850Z` |
| `event-1781868034882-55de3528` | `drink_debt` | PM / 测试 13.16.123 附近写入 | host | `2` | `2026-06-19T11:20:34.882Z` |
| `event-1781869127785-63af140e` | `drink_debt` | 测试 13.16.126 写入 | host | `1` | `2026-06-19T11:38:47.785Z` |

当前 share task 摘要：

| taskId | status | layoutMode | imageUrl / 说明 |
| --- | --- | --- | --- |
| `share-task-1781787045694-9725ffeb` | `ready` | `party_story` | 008g 原始 ready PNG |
| `share-task-1781787045808-5d5b28` | `failed` | `brief_story` | 008g 原始 failed task |
| `share-task-1781806423338-043b2b3d` | `pending` | `dual_flow` | 后续 dual_flow pending 残留 |
| `share-task-1781864781729-5aa63c1b` | `ready` | `status_contract_008bg` | 008BG ready PNG |
| `share-task-1781864833426-2696766c` | `ready` | `status_contract_008bg_rerun_1781864833387` | 008BG rerun ready PNG |
| `share-task-1781865942423-96fd9bd9` | `ready` | `qr_contract_008bl_1781865942388` | 008BL ready PNG，二维码像素证据已在 3.56 |

13.16.111 `PNLGNK / 1 of 5` 漂移只读判断：

| 来源 | 只读结果 | 判断 |
| --- | --- | --- |
| 当前 `admin-store` | 仅找到 008g `session-1781787045680-8e406c / J2BEL2 / 3 / 3`；当前 store 查询未发现同 sessionId 的 `PNLGNK` 记录 | 当前 store 不支持 `PNLGNK / 1 of 5` 作为 008g 业务样本 |
| `GET /sessions/live?sessionId=session-1781787045680-8e406c` | `200 / code=0`，返回 `J2BEL2 / 3 / 3`，`joinStatusPlayers=3` | 当前 API 不复现漂移 |
| `GET /sessions/live?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2` | `200 / code=0`，返回 `J2BEL2 / 3 / 3` | 当前 API 不复现漂移 |
| `GET /sessions/live?sessionId=session-1781787045680-8e406c&inviteCode=PNLGNK` | `404` | 当前 API 明确拒绝 `PNLGNK` 与该 sessionId 的组合 |
| DevTools page data / storage | 本轮未触发 DevTools | 若测试窗口仍看到 `PNLGNK / 1 of 5`，优先按旧运行态、页面缓存、storage 残留、mock store 覆盖或未带 `inviteCode=J2BEL2` 的页面状态处理；需测试在 DevTools 内补 storage/page data/Network 证据，接口联调不替代触发 |

推荐页面 query：

```text
/pages/invite-group/index?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2
/pages/ledger/index?sessionId=session-1781787045680-8e406c&role=member
/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=member
/pages/share-poster/index?briefId=brief-1781787045693-bc8904b9&taskId=share-task-1781865942423-96fd9bd9
```

方案 A：冻结当前累加样本继续测试。

| 项 | 内容 |
| --- | --- |
| 适用场景 | 继续复测 008BP 后续头像、host 账本可编辑、live-record 事件同步、008BL 分享二维码 ready PNG，且接受账本计数已不是 008g 初始状态 |
| 风险 | member 计数和 event 数已被多轮测试累加，不能再作为“原始 008g 基线”或“首次加减”证据；后续测试若继续写入，会增加回滚复杂度 |
| 需要冻结记录 | 当前 session counts、5 条 event、6 条 share task、008BR 头像、008BL PNG 和 brief 关联关系 |
| 可复跑命令模板 | 继续只读 `GET /sessions/live`、`GET /sessions/:id/timeline`、`GET /session-briefs/:briefId`、`GET /share-image-tasks/:taskId`；若测试写入，必须先新建写前快照 |
| 是否需重启 3221 | 不需要，除非有外部 store 写入后进程未刷新 |

方案 B：按 PM 授权回滚到目标基线。

| 回滚目标 | 需要处理的数据 | 风险 / 说明 |
| --- | --- | --- |
| 回滚 ledger 写入 | 从 `backend/data/admin-store.json` 恢复 008g members 计数；从 `backend/data/moments-store.json` 删除 008BN、13.16.123、13.16.126 后续 events，至少保留原始 `event-1781787045692-6dbe67d6` 与 `event-1781787045693-464dde2c` | 会影响 008BP 后续复测证据；必须由 PM 指定“回到哪个时间点”，不能由接口联调自行判断 |
| 回滚 008BR 头像 | 使用 `docs/runtime/pr-int-ledger-real-avatar-008br-before.json` 恢复 host/member session member 与 social profile 头像 | 如果仍要测 ledger/live-record 头像，不能清；清理后头像会回到空值 |
| 回滚 008BL / 008BG share tasks | 删除指定 task、对应 `backend/public/uploads/moments/share-tasks/*.png`，并恢复 brief 的 share 指针到原始 ready task `share-task-1781787045694-9725ffeb` 或 PM 指定 task | 如果仍要测分享二维码/ready PNG，不能清 008BL ready PNG `share-task-1781865942423-96fd9bd9` |
| 进程状态 | store 回滚后需重启 3221，或确认当前进程重新加载 JSON store | 否则 DevTools/API 可能继续读旧缓存，造成再次漂移 |

回滚命令模板，需 PM 明确授权、明确目标基线后才能执行：

```powershell
# B1. 回滚 008BN 账本写入快照层；仅覆盖 session 和 008BN 前已有 events
node -e "const fs=require('fs'); const before=JSON.parse(fs.readFileSync('docs/runtime/pr-int-ledger-host-writeback-008bn-before.json','utf8')); const adminPath='backend/data/admin-store.json'; const momentsPath='backend/data/moments-store.json'; const admin=JSON.parse(fs.readFileSync(adminPath,'utf8')); const moments=JSON.parse(fs.readFileSync(momentsPath,'utf8')); admin.liveSessions=(admin.liveSessions||[]).map(s=>s.id===before.sessionId?before.session:s); const beforeIds=new Set((before.events||[]).map(e=>e.id)); moments.sessionEvents=(moments.sessionEvents||[]).filter(e=>e.sessionId!==before.sessionId || beforeIds.has(e.id)); fs.writeFileSync(adminPath,JSON.stringify(admin,null,2)); fs.writeFileSync(momentsPath,JSON.stringify(moments,null,2)); console.log('rolled back 008BN ledger writeback sample');"

# B2. 回滚 008BR 头像；如果仍要测头像，不执行
node -e "const fs=require('fs'); const before=JSON.parse(fs.readFileSync('docs/runtime/pr-int-ledger-real-avatar-008br-before.json','utf8')); const adminPath='backend/data/admin-store.json'; const socialPath='backend/data/social-store.json'; const admin=JSON.parse(fs.readFileSync(adminPath,'utf8')); const social=JSON.parse(fs.readFileSync(socialPath,'utf8')); admin.liveSessions=(admin.liveSessions||[]).map(s=>s.id===before.sessionId?before.session:s); const profileMap=new Map((before.profiles||[]).map(p=>[p.id,p])); social.profiles=(social.profiles||[]).map(p=>profileMap.has(p.id)?profileMap.get(p.id):p); fs.writeFileSync(adminPath,JSON.stringify(admin,null,2)); fs.writeFileSync(socialPath,JSON.stringify(social,null,2)); console.log('rolled back 008BR avatars');"

# B3. 删除后续 share tasks / PNG、恢复 brief 指针：需 PM 先给保留/删除 task 清单，再执行专门脚本
# B4. 重启本地 3221：PORT=3221 npm.cmd --prefix backend start
```

不可清 / 需授权清单：

- 008BR 头像样本：若 008BP 或后续 ledger/live-record 仍要验证头像，必须保留；只有 PM 明确不再需要头像样本时才可回滚。
- 008BL ready PNG：`share-task-1781865942423-96fd9bd9` 及其 PNG 是分享二维码证据；若仍要测分享二维码或保存图，不能清。
- 008BG ready tasks：`share-task-1781864781729-5aa63c1b`、`share-task-1781864833426-2696766c` 是否保留需 PM 指定。
- 13.16.123 / 13.16.126 测试写入 events 是否删除需测试/PM 确认；接口联调当前只记录，不擅自删除。

接口联调建议：

- 短期建议选方案 A，冻结当前 008g 累加样本作为“ledger/live-record/头像/二维码”综合回归样本，所有后续报告必须注明它不是初始干净 008g 基线。
- 如果 PM 需要干净 invite / 首次加减 / 初始账本演示，应另派授权执行方案 B 或新建独立 clean fixture；不要在当前样本上继续混写后再称为基线。

warnings / skipped：

- 本轮未 cleanup、未重建、未线上写入、未触碰 `pomer.cn` 官网。
- 未触发 DevTools；历史 `PNLGNK / 1 of 5` 若仍在页面复现，需测试提供 DevTools storage/page data/Network 证据。
- 未泄露完整 token；公开只写后 8 位 `ddceb616`、`b8615971`、`c9c5b046`。
- 本节只给样本冻结 / 回滚方案，不写测试通过或上线通过。

## 4. 分阶段测试安排

### 阶段 0：M0 合同复核

| 用例 | 任务 | 操作 | 通过标准 |
| --- | --- | --- | --- |
| DDL 字段复核 | `DEV-M0-01` | 对照 `docs/api-spec.md` 检查 DDL 字段 | moment、event、brief、share task、report、nomination、reward 字段可映射 |
| 数据层 smoke | `DEV-M0-02`、`DEV-M0-05` | 执行 `node backend/scripts/smoke-moments-flow.js` | opening、highlight、private、event、brief、share task 均创建并可读 |
| API 合同复核 | `DEV-M0-03` | 对照 `backend/server.js` 路由和 `docs/api-spec.md` | 路径、方法、必填字段、错误码一致 |
| 前端服务层复核 | `DEV-M0-04` | 对照 `operations.ts` 的类型、normalize 和 request 方法 | 前端能表达所有 API 返回状态，不吞权限和上传失败 |

结论口径：M0 只能在 PM、测试、接口联调三方复核后进入 M1；MySQL 未实连前，`DEV-M0-01` 保持“有条件通过 / 待 DBA 或可用数据库环境复核”。

### 阶段 1：M1 小程序时间线联调

| 用例 | 任务 | 操作 | 通过标准 |
| --- | --- | --- | --- |
| 开场打卡 | `DEV-M1-01` | 判官和成员上传 opening，再重复上传 | 每人每局最多一条 opening，重复提交更新原记录 |
| 全员瞬间 | `DEV-M1-03`、`DEV-M1-05` | 成员 A 上传 highlight | timeline 出现 `moment/highlight`，上传者、标签、授权正确 |
| 私密爆料 | `DEV-M1-04` | A 指定 B 可见，B、C 分别拉 timeline | B 看正文和图；C 只看占位；非成员 403 |
| 辅助事件 | `DEV-M1-02` | 判官提交 `drink_debt`，普通成员尝试提交 | 判官成功，普通成员失败或无权限；重复 `clientEventId` 幂等 |
| 当前酒局返回 | `DEV-M1-06` | 首页、判官页、历史页读取 live session | 能回到同一测试酒局时间线 |

阻塞判定：如果前端页面未接入，只能完成 HTTP / services 层联调，不标记 M1 页面完成。

### 阶段 2：M2 简报与补图联调

| 用例 | 任务 | 操作 | 通过标准 |
| --- | --- | --- | --- |
| 收尾照 | `DEV-M2-01` | 结束前上传 closing | brief 底部出现 closing，未上传也不阻塞结束 |
| 简报生成 | `DEV-M2-02`、`DEV-M2-03` | 调 `POST /sessions/:sessionId/brief` | 返回 opening、closing、timelineNodeIds、pendingMediaCount、rankingEligible |
| 待补图摘要 | `DEV-M2-04` | 创建无图节点后拉 user summaries | 当前用户能看到待补图数量和可继续补图 ID |
| 旧战报兼容 | `DEV-M2-05` | 从旧 `result-report` 进入 brief | 旧报告关键字段不破坏，新入口可用 |

阻塞判定：缺 `session-brief` 页面或 user summaries 页面入口时，只能完成接口层联调。

### 阶段 3：M3 分享图任务联调

| 用例 | 任务 | 操作 | 通过标准 |
| --- | --- | --- | --- |
| 创建任务 | `DEV-M3-01`、`DEV-M3-02` | 对同一 `briefId + layoutMode` 重复创建 | 未终态任务复用，不重复生成 |
| 轮询状态 | `DEV-M3-03`、`DEV-M3-04` | 查询 pending、processing、ready、failed、expired | 前端状态展示完整，ready 有成品 URL |
| 失败重试 | `DEV-M3-03`、`DEV-M3-04` | 对 failed/expired 调 retry | 回到 pending，retryCount 增加，失败原因保留 |
| 分享隐私过滤 | `DEV-M3-05` | 用包含 private 的 brief 生成分享图 | 分享图只使用服务端过滤后的公开节点 |

阻塞判定：只有 pending 基础实现时，M3 只能登记“待状态机联调”。

### 阶段 4：M4 后台审核与日志联调

| 用例 | 任务 | 操作 | 通过标准 |
| --- | --- | --- | --- |
| 审核列表 | `DEV-M4-01` | 登录后台打开 `content-moments-review` | 待审核、二审、隐藏、重传状态字段可见 |
| 审核动作 | `DEV-M4-01`、`DEV-M4-05` | approve / hide / reject / remove_ranking | 状态变化正确，必须写 operationLogs |
| 要求重传 | `DEV-M4-01`、`DEV-M4-05` | 调 require-resubmit | 前台显示需重传，节点不可上榜/分享 |
| 举报处理 | `DEV-M4-02` | 打开 `content-moment-reports` 并处理举报 | 处理结果可追溯，涉事 moment 状态同步 |
| 分享任务监控 | `DEV-M4-03` | 打开 `growth-share-tasks`，后台 retry failed task | retry 成功，日志可查 |
| 奖励配置 | `DEV-M4-04` | 修改 `commerce-ranking-rewards` | 阶梯校验、保存原因、日志写入正确 |

阻塞判定：后台页面只有只读壳层时，不开放强审计操作验收。

### 阶段 5：M5 榜单、推举与积分联调

| 用例 | 任务 | 操作 | 通过标准 |
| --- | --- | --- | --- |
| 今日榜单 | `DEV-M5-01` | 查询多个 category | 排序、分页、隐藏/重传过滤正确 |
| 推举资格 | `DEV-M5-02`、`DEV-M5-03` | 非成员、未完整、未授权、已隐藏节点尝试推举 | 后端拒绝，前端禁用只做提示 |
| 积分扣退 | `DEV-M5-04` | 推举成功、失败、下架退款 | points ledger 可追溯 |
| 榜单奖励 | `DEV-M5-05` | 触发奖励发放 | 读取后台配置，成功和失败都有日志 |

阻塞判定：M4 审计和积分流水不稳定前，不开放 M5 入口验收。

## 5. 每轮执行命令

本地最小验证：

```powershell
$PSVersionTable.PSVersion.ToString()
npm.cmd run check:encoding
npm.cmd run typecheck
node --check backend/server.js
node --check backend/data/moments.js
node --check backend/data/admin.js
node --check backend/scripts/smoke-moments-flow.js
node backend/scripts/smoke-moments-flow.js
npm.cmd --prefix backend run check:admin-ui
```

涉及 MySQL 或 DDL 时追加：

```powershell
npm.cmd --prefix backend run mysql:test
npm.cmd --prefix backend run db:sync-normalized
```

涉及线上 smoke 时优先执行只读验证：

```powershell
curl -f https://api.pomer.cn/api/v1/config/home
curl -f https://api.pomer.cn/api/v1/config/points
curl -f https://api.pomer.cn/api/v1/config/templates
curl -i https://api.pomer.cn/admin
curl -i https://api.pomer.cn/admin/login
```

线上联调前置条件：

- PM 确认本轮允许使用 `api.pomer.cn` 做线上联调。
- 运维确认当前 PM2 服务是 `jiuzhuopanguan-backend`。
- 不重启、不修改、不代理 `pomer.cn`。
- 写接口只使用固定测试数据，不污染真实用户数据。
- 涉及后台登录态、写接口、上传和状态变更前，先确认测试账号、测试酒局、回收方式和操作窗口。

## 6. 接口联调交付记录格式

每次联调后追加一条记录到本文件，不直接修改 PM 总进度：

```text
日期：
执行人：接口联调负责人
任务编号：
测试环境：本地 / api.pomer.cn
测试数据：
执行命令或接口清单：
通过项：
失败项：
阻塞项：
缺少角色：
缺少证据：
下一步责任人：
是否影响线上部署：
```

状态用语限制：

- 代码、接口、页面和验证证据齐全，才能写“通过”。
- 依赖他人但未联调，只能写“待联调”。
- 只有计划没有实现或验证证据，只能写“阻塞”或“只能先做壳层/合同/空态”。
- MySQL、PM2、Nginx、线上域名等环境问题必须写清“本机不可验证”或“线上服务异常”，不得混淆。

## 7. 今日安排

| 顺序 | 事项 | 责任对象 | 输出 |
| --- | --- | --- | --- |
| 1 | 完成线上只读 smoke | 接口联调负责人 | `config/home`、`config/points`、`config/templates`、`/admin`、`/admin/login` 当前已通过 |
| 2 | 复跑 M0 本地验证命令 | 接口联调负责人 | M0 smoke 复核记录 |
| 3 | 对照 `api-spec.md` 和 `operations.ts` 做字段缺口表 | 接口联调负责人 + 前端 | 字段缺口清单 |
| 4 | 对照 `server.js` 和 `moments.js` 做权限/错误码缺口表 | 接口联调负责人 + 后端 | 权限与错误码缺口清单 |
| 5 | 准备固定测试酒局和三类用户 | 后端/API + 接口联调负责人 | 可复用联调样本 |
| 6 | 后台四个 slug 做只读打开与 action 入口复核 | 后台 + 接口联调负责人 | 后台联调阻塞清单 |
| 7 | 确认线上写接口联调窗口和测试账号 | PM/运维/接口联调负责人 | 线上写接口联调许可、测试账号、回收方案 |
| 8 | 补 MySQL 可用环境验证 | DBA/运维 | `mysql:test` 与 DDL 复核记录 |
| 9 | 执行 UGC 风控反例验收 | 风控/测试/接口联调 | `UGC-QA-001` 至 `UGC-QA-008` 执行记录、样本 ID、签字结论 |

当前结论：线上服务器和 `api.pomer.cn` 可支持联调，且只读与写入 smoke 均已有通过记录；UGC 风控负责人已加入并确认口径。接口联调继续从固定测试数据、线上写操作窗口、账号策略和 UGC 反例执行推进。M1-M5 只按依赖逐段开放。缺 DDL 实体表复核、前端真机页面联调、线上后台写操作、测试验收复核记录、UGC-QA 执行记录前，不把后续任务标记完成。

## 8. 接口联调执行记录

| 日期 | 环境 | 任务编号 | 结论 | 证据 | 阻塞/下一步 |
| --- | --- | --- | --- | --- | --- |
| 2026-06-15 | 本地 | `DEV-M0-01` 至 `DEV-M0-05` | M0 本地静态验证和 moments smoke 通过；MySQL 实连仍阻塞 | `npm.cmd run check:encoding` 通过；`npm.cmd run typecheck` 通过；`node --check backend/server.js`、`backend/data/moments.js`、`backend/data/admin.js`、`backend/scripts/smoke-moments-flow.js` 通过；`node backend/scripts/smoke-moments-flow.js` 返回 `ok:true`，生成 session/opening/highlight/private/event/brief/shareTask | `npm.cmd --prefix backend run mysql:test` 报 `ECONNREFUSED ::1/127.0.0.1:3306` 和 `127.0.0.1:3306`，需 DBA/运维提供可用 MySQL 环境复测 DDL |
| 2026-06-15 | 本地 HTTP | 公共接口 / 后台入口 | 运行中的 `node backend/server.js` 可支持本地只读 smoke | `curl.exe -f http://127.0.0.1:3010/api/v1/config/home` 返回 `code:0`；`curl.exe -f http://127.0.0.1:3010/api/v1/config/points` 返回 `code:0`；`GET /admin` 返回 302 到 `/admin/login`；`GET /admin/login` 返回 200 | 未执行需要登录或写入的 moments HTTP 联调；需测试账号和固定测试酒局后再做 |
| 2026-06-15 | 本地 HTTP | `DEV-M0` 至 `DEV-M5` 接口层 | moments HTTP smoke 通过，覆盖写入、权限、分享图、推举、榜单、后台发奖和移出榜单退款接口层 | `npm.cmd --prefix backend run smoke:moments-http` 输出 `ok:true`；创建 opening/highlight/private/event/brief；host 视角 private 为占位，memberB 可见私密正文；share task process 返回 `ready` 和 PNG；失败任务变 `failed`，retry 回 `pending`；生成 nomination，rankings 返回 1 条；后台登录态调用 `POST /admin/ranking-rewards/grant` 返回 `rankingRewardGranted=1`；后台 `remove_ranking` 返回 `refundedPoints=10`；脚本执行后恢复 store 并清理生成图 | 仍缺小程序真机页面、后台真实发奖按钮、线上独立脚本账号策略复测、分享图视觉验收和 UGC-QA 反例执行；执行时 Node 输出 `DEP0169 url.parse()` 弃用警告 |
| 2026-06-15 | 本地文档/代码 | `DEV-M0-03`、`DEV-M0-04` | API 合同、后端路由、前端服务层路径基本对齐 | `backend/server.js` 存在 moments upload、moment CRUD、timeline、events、brief、share-image-tasks、user summaries、admin review/retry 路由；`miniprogram/services/operations.ts` 存在对应 `uploadManagedMomentImage`、`createManagedMoment`、`updateManagedMoment`、`deleteManagedMoment`、`getManagedSessionTimeline`、`createManagedSessionEvent`、`createOrRefreshManagedSessionBrief`、`getManagedSessionBrief`、`createManagedShareImageTask`、`getManagedShareImageTask`、`retryManagedShareImageTask`、`getManagedSessionMomentSummaries` | 下一步需要前端负责人页面级消费复核，不能仅凭 services 层判定 M1 完成 |
| 2026-06-15 | 本地 | `INT-GAP-001` 至 `INT-GAP-004` | 后端合同缺口已补代码，本地/HTTP/线上 process 已有复测证据；前端页面和风控反例仍待补 | `backend/data/moments.js` 已补 `visibleProfileIds` 本局成员校验、`targetProfileId` 本局成员校验、用户侧 retry 状态限制、公开后删除 409、分享图 `selectedNodeIds` 可见 timeline 白名单；`backend/scripts/smoke-moments-flow.js`、`smoke:moments-http` 和线上 `process` 已覆盖多项负向与 ready PNG | 仍需前端真机按钮状态、三用户私密不泄露、后台线上写操作和分享图视觉验收 |
| 2026-06-15 | 本地 | `DEV-M3-01`、`DEV-M3-03`、`DEV-M3-05` | M3 后端本地同步生成链路已通过，线上 process/ready 已复测；分享页静态接入已复核，真机和视觉验收仍待补 | `backend/data/moments.js` 已新增 `processShareImageTask`；`backend/server.js` 已新增 `POST /api/v1/share-image-tasks/:taskId/process`；`node backend/scripts/smoke-moments-flow.js` 返回 `shareTaskStatus=ready`、`failedTaskStatus=failed`、`retriedTaskStatus=pending`，并确认生成 PNG 后清理；线上 `api.pomer.cn` 已返回 ready PNG 且 GET 图片 200；`miniprogram/pages/share-poster` 已接入 `share-task-status`、`handleTaskPrimaryTap`、`handlePreviewTaskTap`、ready 图片保存和 failed/expired retry；`npm.cmd run typecheck` 通过 | 需微信开发者工具/真机验证 share-poster ready/failed/expired 状态、个人页/历史页入口、线上后台写操作窗口和分享图视觉验收 |
| 2026-06-15 | 本地 HTTP | `DEV-M3-01`、`DEV-M3-03`、`DEV-M3-05` | M3 HTTP 路由级 smoke 通过，线上已部署复测 | `npm.cmd --prefix backend run smoke:moments-http` 返回 `shareTaskStatus=ready`、`failedTaskStatus=failed`、`retriedTaskStatus=pending`，并确认无测试数据和 PNG 残留 | 前端页面、线上后台写操作样本和图片视觉验收仍待联调 |
| 2026-06-15 | 本地前端 | `DEV-M0-04`、`DEV-M1-03` | `moment-editor` 提交 payload 已补幂等字段 | `miniprogram/pages/moment-editor/index.ts` 在页面实例生成稳定 `clientDraftId`，`buildPayload()` 随 moments 创建请求提交；`npm.cmd run typecheck` 和 `npm.cmd run check:encoding` 通过 | 仍需微信开发者工具或真机验证重复点击/失败重试不会创建重复 moment |
| 2026-06-15 | 本地前端 | `DEV-M1-03`、`DEV-M1-04`、`DEV-M3-04` | 前端页面/组件接口字段审查通过静态校验 | `moment-editor` 已接本局成员、`visibleProfileIds`、上传和创建 moment；`share-task-status` 只在 `failed/expired` 展示重试；`share-poster` 已接分享任务状态、预览、保存、创建、刷新、失败重试入口；`npm.cmd run typecheck` 通过 | 仍缺微信开发者工具或真机三用户端到端联调：A 发私密给 B，B 可见正文，C 仅占位；分享任务按钮需结合真实 failed/expired 样本复测；UI/UX 需按计划自动选择 SKILL 做截图评审 |
| 2026-06-15 | 本地数据层 | `DEV-M4-01`、`DEV-M4-03`、`DEV-M4-05` | 后台强审计动作函数和 operationLogs 已有 smoke 证据；后续本地页面点击 E2E 已补充 | `backend/scripts/smoke-moments-flow.js` 已覆盖 `reviewManagedMoment(approve)`、`reviewManagedMoment(require_resubmit)`、后台 `retryManagedShareImageTask`；断言 operationLogs 存在审核和重试记录；smoke 后清理生成图片、`smoke-*` 数据和相关日志 | 仍缺线上后台写操作、真实样本和前台状态同步，不能把 M4 后台闭环标记完成 |
| 2026-06-15 | 本地 HTTP | `DEV-M4-01` 至 `DEV-M4-05` | 后台登录态 action endpoint smoke 通过；后续本地浏览器 E2E 已补充 | `npm.cmd --prefix backend run smoke:admin-moments` 输出 `ok:true`，覆盖后台登录、`content-moments-review` 读取、moment 审核通过、`content-moment-reports` 读取、举报处理隐藏、`growth-share-tasks` 读取、failed share task retry、`commerce-ranking-rewards` 保存、operationLogs `operationLogCount=4`；脚本执行后恢复 admin/moments store | 仍缺线上后台账号窗口、线上写操作和真实样本复测；执行时 Node 输出 `DEP0169 url.parse()` 弃用警告，属服务启动既有警告 |
| 2026-06-15 | 本地浏览器 | `DEV-M4-01` 至 `DEV-M4-05`、`DEV-M5-05` | 真实后台页面点击 E2E 通过；同时修复原生 `window.prompt` / `window.confirm` 在 Electron/in-app 浏览器不可用的问题 | 使用本地 `127.0.0.1:3010`、临时 `ui-smoke-1781489205912` 数据验证：后台登录成功；`content-moments-review` 点击“通过”后自定义原因弹窗提交，行状态刷新为 `approved/approved`；`content-moment-reports` 点击“有效并隐藏”后刷新为“有效，已隐藏内容”；`growth-share-tasks` 点击“重试”后 `failed -> pending`、`retryCount 0 -> 1`；`commerce-ranking-rewards` 页面编辑第一条奖励规则，积分 `100 -> 101`、原因 `ui e2e reward update`；页面级“发放今日最有梗”确认框 E2E 通过，浏览器中 `window.confirm` 实测为 `undefined`，提交后状态提示“发放 0 条，跳过 0 条”；数据文件出现三条 operationLogs 和奖励配置记录；结束后恢复 admin/moments store，`ui-smoke` 残留扫描无命中；后台静态资源版本已 bump 到 `20260615-admin-action-dialogs`，`npm.cmd --prefix backend run check:admin-ui` 通过 | 线上后台写操作窗口、线上测试账号、风控验收人和微信真机三用户页面联调仍待确认；本地服务已停止 |
| 2026-06-15 | `api.pomer.cn` | `DEV-M0-02` 至 `DEV-M0-05`、`DEV-M1-04`、`DEV-M3-02`、`DEV-M3-03` | 线上 HTTP 写入联调通过，路由、鉴权、MySQL app_store 和权限过滤可用 | 部署前 `/api/v1/user/session-moment-summaries` 为 404，部署后未登录为 401；线上 `npm run mysql:test` 返回 `ok:true`；公网创建测试酒局 `session-1781464115047-06968b`、上传图片 `/uploads/moments/session-1781464115047-06968b/1781464115134-it-opening-1781464116545-5c027c.webp`、写入 `opening=moment-1781464115218-d886e1c8`、`highlight=moment-1781464115287-f98a492d`、`private=moment-1781464115350-4969c519`、`event=event-1781464115414-196d0f85`；host timeline 4 节点且私密占位，member 可见私密正文；生成 `brief-1781464115623-4f7c5b93`、`share-task-1781464115687-938b6ad5`，状态 `pending`；非本局 `visibleProfileIds` 返回 400，pending retry 返回 409 | 未做小程序真机页面消费、后台登录态 action E2E、真实分享图 processing/ready/failed 生成队列；线上测试数据按用户授权保留 |
| 2026-06-15 | `api.pomer.cn` | `DEV-M3-01`、`DEV-M3-03`、`DEV-M3-05` | 线上部署后 process/ready 联调通过，可进入页面和测试联调 | 部署包已解到 `/www/wwwroot/jiuzhuopanguan-git`，`pm2 restart jiuzhuopanguan-backend --update-env` 后 online；公网创建 `session-1781465622025-5f436e`、上传图片、生成 `brief-1781465622338-8c84f732` 和 `share-task-1781465622362-b11e8289`；`POST /share-image-tasks/:taskId/process` 返回 `ready`，图片 `/uploads/moments/share-tasks/share-task-1781465622362-b11e8289.png`，GET 返回 200 `image/png`；pending retry 返回 409，非本局 `visibleProfileIds` 返回 400；部署后快照 `/www/backup/jiuzhuopanguan/moments-20260615033152-postdeploy` | 服务器本机 smoke 脚本因测试账号鉴权返回 401，需修正脚本账号策略；未做小程序真机、线上后台写操作、三用户非接收者占位、视觉验收 |
| 2026-06-15 | 本地 / `api.pomer.cn` 只读 | 接口联调负责人启动复核 | 当前代码与线上只读入口可继续支持接口联调；本轮未执行线上写操作 | `pwsh` 7.6.2 已确认；`curl.exe -f https://api.pomer.cn/api/v1/config/home`、`points`、`templates` 均返回 `code:0`；`GET /admin` 返回 302 到 `/admin/login`，`GET /admin/login` 返回 200；`npm.cmd run check:encoding`、`npm.cmd run typecheck` 通过；`node --check backend/server.js`、`node --check backend/data/moments.js`、`node --check backend/data/admin.js` 分别通过；`npm.cmd --prefix backend run smoke:moments-http`、`smoke:admin-moments`、`smoke:ugc-risk` 均返回 `ok:true` | 线上写接口、后台 action、发奖/退款未执行；需 PM/运维提供线上测试账号、后台账号、写操作窗口和清理授权 |
| 2026-06-15 | 文档 / 本地残留扫描 | 固定联调数据状态 | 固定数据当前只有语义标识和历史线上样本，尚未形成可复用账号/token/进行中固定酒局包 | `rg` 仅在本文档找到 `it-moments-20260615-a`、`it-host-20260615`、`it-member-a-20260615`、`it-member-b-20260615`、`share-task-failed-20260615`、`review-secondary-20260615` 等建议标识；本轮 smoke 临时 ID 残留扫描无命中；`backend/public/uploads/moments/share-tasks` 当前无本轮残留文件 | 接口联调负责人需建立固定三用户酒局、token 使用说明、failed/expired share task、待审 moment、举报样本和清理策略；未补齐前测试/前端/后台/UGC 只能按待联调推进 |
| 2026-06-15 | 文档 / manifest 草案 | `INT-DATA-001` | 已形成可执行 manifest 模板草案；当前仍不能开始测试第一小时 | 新增 `docs/runtime/int-data-001-manifest.template.json`，字段覆盖 host/memberA/memberB/outsider、session、opening/highlight/private/event、brief、pending/ready/failed/expired share task、review/report、ranking/nomination/reward payout、清理命令和 firstHourReadiness；已读取接口联调 3.1/3.2、后端固定数据包结论、测试 13.10-13.13、后台 10.4-10.6、UGC 6.3-6.4；仓库未发现可直接使用的测试 token、后台窗口、固定 session 或真实 manifest | 阻塞：后端/API 需新增或提供 `prepare-moments-integration-fixture.js` 等价生成/清理脚本；PM/运维需提供线上写窗口、后台账号、清理授权；测试/前端需等 manifest 实际 ID 后才能执行第一小时 |
| 2026-06-15 | 本地 `127.0.0.1:3221` | `INT-DATA-001` 第五轮本地 manifest 尝试 | `status` 成功返回 manifest 不存在；已执行本地 `create`，但未生成 manifest，不能交测试第一小时 | `npm.cmd --prefix backend run fixture:moments-integration -- --mode status --manifest docs/runtime/int-data-001-manifest.json` 返回 `ok:true`、`mode:"status"`、`exists:false`、`manifest:"F:\\codexlist\\jiuzhuopanguan\\docs\\runtime\\int-data-001-manifest.json"`；随后执行 `npm.cmd --prefix backend run fixture:moments-integration -- --mode create --base-url http://127.0.0.1:3221/api/v1 --prefix IT-MOMENTS-20260615 --manifest docs/runtime/int-data-001-manifest.json --keep`，本地服务启动后 `POST /sessions failed: unauthorized`，`statusCode:401`，`payload:{ code:401, message:"unauthorized", data:null }`；`docs/runtime/int-data-001-manifest.json` 不存在，无法执行 JSON.parse 和关键字段齐缺校验；`rg "IT-MOMENTS-20260615|INT-DATA-001 fixture account" backend/data -S` 无命中 | 阻塞：后端/API 需修复本地 fixture 创建 `/sessions` 的鉴权/token 策略，或提供可复跑的本地测试 token/账号路径；本轮未执行 cleanup，因为无 manifest 且未发现 `IT-MOMENTS-20260615` 数据残留；Node 输出 `DEP0169 url.parse()` 既有弃用警告，未出现 manifest warnings/skipped |
| 2026-06-15 | 本地 `127.0.0.1:3221` | `INT-DATA-001` actual manifest | actual manifest 已重新生成并保留，可交测试第一小时使用本地数据；本轮未执行 cleanup | `status` 命令返回 `exists:false`；随后执行 `npm.cmd --prefix backend run fixture:moments-integration -- --mode create --base-url http://127.0.0.1:3221/api/v1 --prefix IT-MOMENTS-20260615 --manifest docs/runtime/int-data-001-manifest.json --keep` 成功，输出 `ok:true`、`mode:"create"`、`sessionId:"session-1781506784680-02d0a3"`；`JSON.parse` 通过，manifest 路径为 `docs/runtime/int-data-001-manifest.json`；4 个 profile/token 均存在：host `user-1781506784332-e605eb`、memberA `user-1781506784333-1e0ef8`、memberB `user-1781506784333-dcdcd4`、outsider `user-1781506784334-d22d78`；样本齐全：opening `moment-1781506784699-1fc36a9a`、highlight `moment-1781506784701-cb885292`、private `moment-1781506784703-82eee0ec`、event `event-1781506784706-780d4fe2`、brief `brief-1781506784708-27d5b341`、pending task `share-task-1781506784710-06d879ef`、ready task `share-task-1781506784711-94847106`、failed task `share-task-1781506784787-76bc5d8f`、expired task `share-task-it-moments-20260615-expired`、review sample 使用 pending highlight `moment-1781506784701-cb885292`、report `moment-report-it-moments-20260615`、nomination `nomination-1781506784795-48dc91b2`、reward payout `ranking-reward-payout-1781506784799-f238499a`；`missing:[]`、`warnings:[]`、`skipped:[]`，计算字段缺失为 0 | 等 PM 派测试/前端启动本地第一小时；清理命令为 `node backend/scripts/prepare-moments-integration-fixture.js --mode cleanup --manifest docs/runtime/int-data-001-manifest.json`，cleanup 前必须先导出证据，否则 manifest 指向的本地 ID 会失效；风险：这是本地 `127.0.0.1:3221` 数据，不代表线上 `api.pomer.cn` 状态 |
| 2026-06-15 | 本地 `127.0.0.1:3221` | `INT-DATA-001` 本地服务可用性收口 | 本地后端已启动且基础只读可访问；局内三用户 token 可读当前 session timeline，outsider 返回 403；expired share task 实体仍需后端/API 复核 | 启动命令：`PORT=3221 npm.cmd --prefix backend start`，本轮用后台 `pwsh` 启动并写日志到 `docs/runtime/int-data-001-local-server.out.log` / `.err.log`；`Get-NetTCPConnection -LocalPort 3221` 显示 `Listen`、`OwningProcess=21744`；`GET /api/v1/config/home` 返回 HTTP 200、`code:0`；host/memberA/memberB 分别带 manifest token 访问 `GET /api/v1/sessions/session-1781506784680-02d0a3/timeline` 均返回 HTTP 200、`code:0`、`nodeCount:5`；host 视角 private 为占位且无 caption/image，memberA/memberB 视角 private 有正文和图片；outsider token 访问同一 timeline 返回 HTTP 403、`code:403`；host token 读取 brief 返回 HTTP 200；share task 只读：pending/ready/failed 分别返回 HTTP 200 且状态为 `pending`/`ready`/`failed`，expired `share-task-it-moments-20260615-expired` 返回 HTTP 404；`rg` 仅在 manifest 中找到 expired ID，未在 `backend/data` 找到实体 | 测试可先执行本地服务连通、三用户 timeline 权限、brief、pending/ready/failed share task 只读；如第一小时必须覆盖 expired share task 实体，需 PM 派后端/API 补齐 expired fixture 持久化或说明该样本为前端状态模拟 ID；当前未 cleanup，服务保持本地 3221 运行，未访问线上 |
| 2026-06-15 | 本地 `127.0.0.1:3221` | `INT-DATA-001` expired fixture 重建复核纠正 | 已按 PM 授权清理旧本地 fixture 并重建 actual manifest；但 expired share task 只读结果与 PM 复核冲突，当前不得写通过，按待后端/API 复核处理 | 旧 manifest 摘要：session `session-1781506784680-02d0a3`、4 个 profile/token、pending/ready/failed/expired ID 已在执行前记录；旧 3221 服务进程 `21744` 为上一轮 `node server.js`，为避免 create 脚本端口冲突已停止，端口释放；cleanup 命令：`npm.cmd --prefix backend run fixture:moments-integration -- --mode cleanup --manifest docs/runtime/int-data-001-manifest.json --export-evidence docs/runtime/int-data-001-evidence-before-recreate.json`，返回 `ok:true`、`mode:"cleanup"`、导出旧 evidence；recreate 命令：`npm.cmd --prefix backend run fixture:moments-integration -- --mode create --base-url http://127.0.0.1:3221/api/v1 --prefix IT-MOMENTS-20260615 --manifest docs/runtime/int-data-001-manifest.json --keep`，返回 `ok:true`、`mode:"create"`、新 session `session-1781507687012-e4343d`；新 manifest `JSON.parse` 通过，host `user-1781507686650-a33705`、memberA `user-1781507686651-a46952`、memberB `user-1781507686651-000860`、outsider `user-1781507686651-093df4` 均有 token；private `moment-1781507687036-c0cc62cc`、brief `brief-1781507687042-d1990edd`、pending `share-task-1781507687044-805585b3`、ready `share-task-1781507687046-d1098582`、failed `share-task-1781507687115-e4df874c`、expired `share-task-it-moments-20260615-expired`、report `moment-report-it-moments-20260615`、nomination `nomination-1781507687124-4ad71db9`、reward payout `ranking-reward-payout-1781507687129-1ea46263` 齐全；`missing:[]`、`warnings:[]`、`skipped:[]`；曾记录本地脚本只读返回 expired HTTP 200 / `status=expired`，但 PM 随后用同一 manifest/session/host token 复核 `GET /share-image-tasks/share-task-it-moments-20260615-expired` 返回 HTTP 404，且 `rg "share-task-it-moments-20260615-expired" backend/data docs/runtime/int-data-001-manifest.json` 仅命中 manifest、未命中 `backend/data`；因此接口联调以 PM 复核为准撤回 expired 200 结论 | 测试下一步只能继续 `config/home`、三用户 timeline、brief、pending/ready/failed share task；expired 不得作为通过证据。需 PM 派后端/API 复核为什么 create 后 manifest 有 expired ID 但本地持久化 store 无实体，或提供新的可复跑修复命令；接口联调在后端补证据后再复测。本轮未访问线上、未 cleanup 新数据、未改 PM 总台账 |
| 2026-06-15 | 本地 `127.0.0.1:3221` | `INT-DATA-001` expired 服务缓存复核 | 当前 3221 无需重启，expired share task 已按最新只读复核恢复为可读；不替测试写通过 | 当前 manifest：session `session-1781507687012-e4343d`、expired `share-task-it-moments-20260615-expired`、host `user-1781507686650-a33705`；当前 3221 监听 PID `25368`，本轮未重启；使用 host token `GET /api/v1/share-image-tasks/share-task-it-moments-20260615-expired` 返回 HTTP 200、`code:0`、`data.status:"expired"`、`sessionId:"session-1781507687012-e4343d"`、`briefId:"brief-1781507687042-d1990edd"`；`rg -F "share-task-it-moments-20260615-expired" backend/data/moments-store.json docs/runtime/int-data-001-manifest.json` 同时命中本地 store 与 manifest，`rg -F '"status": "expired"' backend/data/moments-store.json` 命中 store；此前 404 冲突按后端/API 判断为 3221 进程缓存旧 store 窗口，当前以最新只读复核为准 | 测试下一步命令：继续使用 `http://127.0.0.1:3221/api/v1` 与 `docs/runtime/int-data-001-manifest.json`，按第一小时流程复核 manifest/profile/token、M1 私密不泄露、M2 brief、M3 ready/failed/expired/retry；接口联调只确认接口可读，不替测试/前端写通过；本轮未 cleanup、未 recreate、未访问线上、未改 PM 总台账 |
| 2026-06-15 | 本地 LAN `192.168.0.101:3221` | `INT-DATA-001` 真机访问本地数据说明 | 已补充候选真机 API base；仅限同 LAN/代理测试，不代表线上 | PM 只读核查确认本机 LAN 地址 `192.168.0.101`，本机访问 `http://192.168.0.101:3221/api/v1/config/home` 返回 `code:0`，且 `127.0.0.1:3221` 仍监听；候选真机 API base：`http://192.168.0.101:3221/api/v1`；微信开发者工具 CLI 可显示 help，但 `islogin/open` 超时，不能据此判定真机/开发者工具链路已通 | 测试/前端如需真机访问本地 `INT-DATA-001` 数据，手机与电脑需在同一 LAN，或使用可控代理；微信开发者工具/体验版需允许本地调试或配置合法域名/不校验合法域名方案；上线前 API base 必须切回 `https://api.pomer.cn/api/v1`；本轮不 cleanup、不线上写入、不改 PM 总台账 |

## 9. 当前接口合同缺口清单

| 编号 | 任务 | 缺口 | 证据 | 影响 | 下一步责任 |
| --- | --- | --- | --- | --- | --- |
| INT-GAP-001 | `DEV-M1-04` | 后端与前端选择器已补代码，待真机页面复测：`private` / `selected` moment 的 `visibleProfileIds` 必须属于本局成员 | `backend/data/moments.js#normalizeVisibleProfileIds`；`backend/scripts/smoke-moments-flow.js` 已补非本局成员应 400；`miniprogram/pages/moment-editor` 已加载本局成员并提交 `visibleProfileIds` | 仍缺小程序真机从选择成员到 timeline 权限展示的端到端证据 | 测试补三用户页面联调：A 发私密给 B，B 可见正文，C 仅占位；接口联调复核错误提示 |
| INT-GAP-002 | `DEV-M3-03` | 线上 HTTP 已复测：用户侧 `retry` 仅允许 `failed` / `expired`，`process` 可生成 ready；前端静态按钮状态已接入 | `backend/data/moments.js#retryShareImageTask`、`processShareImageTask`；本地 smoke 覆盖 pending 不可 retry、ready、failed、failed retry 回 pending；公网 pending retry 返回 409，process 返回 ready；`share-task-status` 组件只在 `failed/expired` 展示重试，`share-poster` 主按钮按 `ready/failed/expired/pending/processing` 分流 | 前端真机仍需结合真实 failed/expired 样本复测；后台 failed/expired 重试本地 E2E 已有，线上写操作未测 | 测试补 pending/processing/ready 不可 retry 和 process ready/failed 页面用例；前端补真机录屏或截图证据 |
| INT-GAP-003 | `DEV-M1-03`、`DEV-M4-01` | 已补代码，待 HTTP 复测：用户侧删除公开后内容返回 409 | `backend/data/moments.js#deleteMoment` 已拒绝 approved、rankingEligible、rewardEligible moment；UGC 风控口径已确认公开后需走后台隐藏/撤回 | 后台隐藏/撤回仍需线上联调和真实样本复核 | 后台/测试/风控补 approved/rankingEligible 删除用例和后台隐藏链路 |
| INT-GAP-004 | `DEV-M3-05` | 线上 ready PNG 已生成，待视觉验收：`selectedNodeIds` 必须来自当前 brief 可见 timeline，私密占位不可进入分享任务和 PNG | `backend/data/moments.js#createShareImageTask` 已做白名单校验；`processShareImageTask` 使用服务端任务节点生成 `/uploads/moments/share-tasks/*.png`；公网生成 `/uploads/moments/share-tasks/share-task-1781465622362-b11e8289.png`，GET 返回 200 `image/png`；`share-poster` 已静态接入 ready 图片预览和保存 | 仍缺视觉验收、微信真机预览/保存联调和三用户私密不泄露验证 | 测试补私密节点分享图用例；前端补 ready 图片预览保存真机证据 |
| INT-GAP-005 | `DEV-M4-01` 至 `DEV-M4-05` | 本地后台真实页面按钮点击 E2E 已补齐；线上后台写操作窗口仍待确认 | `backend/scripts/smoke-moments-flow.js` 已断言 admin review / require-resubmit / retry 和 operationLogs；`npm.cmd --prefix backend run smoke:admin-moments` 已覆盖登录态 HTTP action endpoint、动态页读取、举报处理、奖励配置保存和 operationLogs；本地浏览器已验证审核通过、举报隐藏、分享任务重试、奖励配置保存、页面级发奖确认五类页面动作，并修复 `window.prompt` / `window.confirm` 不可用导致按钮无法继续调用接口的问题 | 本地 M4 后台闭环可复核；线上后台写操作、线上测试账号、操作窗口和回收方案未确认前，不能标记线上通过 | PM/运维提供线上后台测试账号和写操作窗口；接口联调负责人按固定数据复测线上后台页面动作 |
| INT-GAP-006 | `DEV-M5-04`、`DEV-M5-05` | 后端已补推举退款和榜单奖励发放 action，后台页已暴露发奖 action 元数据，线上发奖点击和写入验收未完成 | `createMomentNomination` 写 `pointsLedger(kind=moment-nomination)`；后台 `hide/reject/require_resubmit/remove_ranking` 触发 `pointsLedger(kind=moment-nomination-refund)`；`POST /admin/ranking-rewards/grant` 写 `pointsLedger(kind=ranking-reward)` 和 `rankingRewardPayouts`；`commerce-ranking-rewards` 返回发奖 pageActions；本地和 HTTP smoke 覆盖扣 10 积分、重复推举 409、rankings 查询、发奖和退款 | 线上发奖按钮点击、线上写入窗口、奖励失败/重复发放 UI 反馈、完整风控反例仍未验收 | 测试补线上后台发奖点击、线上 M5 写入、下架退款、奖励流水和重复发奖验收 |
