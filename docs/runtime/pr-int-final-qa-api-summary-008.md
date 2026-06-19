# PR-INT-FINAL-QA-API-SUMMARY-008 API 摘要

记录时间：2026-06-16

范围：基于接口联调计划 3.19 与服务器侧脱敏 manifest `int-data-001-online-manifest-sanitized.json`。本文不包含完整 token，不读取 private manifest，不替测试写通过。

## 基础信息

| 项 | 值 |
| --- | --- |
| API base | `https://api.pomer.cn/api/v1` |
| prefix | `IT-MOMENTS-20260616-006B` |
| sessionId | `session-1781584503517-c033e9` |
| inviteCode | `W58G7T` |
| briefId | `brief-1781584503870-25d5edac` |
| host | `user-1781583974510-1a52e6`，token 后 8 位 `4afb1b00` |
| memberA | `user-1781583974512-aedd1b`，token 后 8 位 `c1b1585a` |
| memberB | `user-1781583974514-a46045`，token 后 8 位 `dc59b557` |
| outsider | `user-1781583974515-9019e6`，token 后 8 位 `f9118246` |

## 页面 Query

| 页面 / 场景 | Query |
| --- | --- |
| invite-group | `sessionId=session-1781584503517-c033e9&inviteCode=W58G7T` |
| moment-editor 首张照片 | `sessionId=session-1781584503517-c033e9&nodeType=opening` |
| session-brief | `briefId=brief-1781584503870-25d5edac&sessionId=session-1781584503517-c033e9` |
| share-poster/share-preview ready | `briefId=brief-1781584503870-25d5edac&taskId=share-task-1781584503902-a99a5211` |
| share-poster/share-preview failed | `taskId=share-task-1781584504132-3251bd01` |
| rankings | `category=best_opening` |

## 样本 ID

| 类型 | ID / 摘要 |
| --- | --- |
| opening | `moment-1781584503741-d53b131f` |
| highlight | `moment-1781584503769-1a5b4d94` |
| private | `moment-1781584503795-17a32c27` |
| failed candidate | `moment-1781584503823-56dc9214` |
| event | `event-1781584503850-94ad3aeb` |
| pending share task | `share-task-1781584503885-8bf3c52b` |
| ready share task | `share-task-1781584503902-a99a5211` |
| ready image | `/uploads/moments/share-tasks/share-task-1781584503902-a99a5211.png` |
| failed share task | `share-task-1781584504132-3251bd01` |
| ranking category | `best_opening` |
| ranking item | `moment-1781584503741-d53b131f` |
| nomination | `nomination-1781584504202-df008444` |
| reward payout | `ranking-reward-payout-1781584504234-5a8cb962` |
| points ledger | `ledger-1781584504234-f8d759bf`、`ledger-1781584504202-0eb017c5` |
| operation logs | `admin-op-1781584504167-457c2e`、`admin-op-1781584504109-c1655b`、`admin-op-1781584504077-f9714e` |

## API 摘要

| API | 归档摘要 |
| --- | --- |
| `GET /session-briefs/brief-1781584503870-25d5edac` | 脱敏 evidence 返回 brief，含 `timelineNodeIds`、`shareImageTaskId`、`shareImageStatus`、`timeline`。 |
| `GET /share-image-tasks/share-task-1781584503902-a99a5211` | 脱敏 evidence 返回 `status=ready`。 |
| `GET /share-image-tasks/share-task-1781584504132-3251bd01` | 脱敏 evidence 返回 `status=failed`。 |
| `GET /rankings/today?category=best_opening` | 脱敏 evidence 返回 `items.length=1`。 |
| `GET /user/commerce` | 脱敏 evidence 存在 memberB commerce；points ledger ID 见上表。 |
| timeline | 脱敏 evidence 存在 host timeline 与 memberB timeline，均含 `sessionId`、`nodes`、`pendingMediaCount`。 |

## Warnings / Skipped

- `remote expired task and report sample skipped; no safe public API/helper available`
- `reviewMomentId remains empty; failedCandidateMomentId plus admin.operationLogIds are the review/action evidence, not a dedicated review moment field`
- `remote report sample skipped; no safe public report creation helper in current fixture script`
- `remote expired share task skipped; no safe public expired-task creation helper in current fixture script`

## 不得写通过的缺口

| 缺口 | 当前口径 |
| --- | --- |
| dedicated `reviewMomentId` | 空。只能用 `failedCandidateMomentId` + `operationLogIds` 作为后台 action 证据，不能作为 dedicated review 样本通过。 |
| `reportId` | 空。举报样本未生成，UGC/后台举报处理仍待补样本或待联调。 |
| `expiredTaskId` | 空。expired share task / expired retry 仍待后端/API helper 或后台补样本。 |

## Cleanup / 残留扫描口径

| 项 | 口径 |
| --- | --- |
| sanitized manifest | `/www/backup/jiuzhuopanguan/pr-int-db-generated-fixture-run-006-20260616123313/int-data-001-online-manifest-sanitized.json` |
| private manifest | 服务器私密目录保存，接口联调未读取；不得进入公开文档。 |
| cleanup command | `node backend/scripts/prepare-moments-integration-fixture.js --mode cleanup --manifest ../../backup/jiuzhuopanguan/pr-int-db-generated-fixture-run-006-20260616123313/int-data-001-online-manifest-private.json` |
| prefix 扫描 | 按 `IT-MOMENTS-20260616-006B` 扫描 sessions、momentRecords、sessionEvents、sessionBriefs、shareImageTasks、momentNominations、rankingRewardPayouts、pointsLedger、operationLogs、uploads。 |
| 当前残留状态 | 线上样本当前保留，供最后大版本测试采集；不得 cleanup，除非 PM 另派清理任务。 |

## PR-INT-REWARD-REPORT-EXPIRED-SAMPLES-009 补样本摘要

记录时间：2026-06-16

范围：基于线上 final 样本补齐奖励正向、举报、expired retry 样本。完整 token 只在服务器私密 `tokens.env` 中使用，本文只记录 token 后 8 位和样本 ID。

| 项 | 值 |
| --- | --- |
| API base | `https://api.pomer.cn/api/v1` |
| prefix | `IT-MOMENTS-20260616-009` |
| 复用 session | `session-1781584503517-c033e9` |
| 复用 brief | `brief-1781584503870-25d5edac` |
| host token 后 8 位 | `4afb1b00` |
| memberA token 后 8 位 | `c1b1585a` |
| PM2 复核 | 仅重启 `jiuzhuopanguan-backend`，重启后 PID `245940`；未触碰 `pomer` 官网服务。 |

### 新增 / 补齐样本

| 类型 | ID / 摘要 | 用途 |
| --- | --- | --- |
| 正向发奖候选 | `moment-1781586554926-ffc93c65` | `opening`，`reviewStatus=approved`，`secondaryReviewStatus=approved`，`rankingEligible=true`，`rewardEligible=true`，榜单第一条。 |
| 正向推举 | `nomination-1781586678021-ca565a1c` | `best_opening`，host 推举 memberA opening。 |
| 正向发奖 payout | `ranking-reward-payout-1781586678028-9cad8832` | `grantedCount=1`，`totalPoints=60`，memberA 收到榜单奖励。 |
| 举报样本 | `moment-report-it-moments-20260616-009` | `status=pending`，举报目标为 private `moment-1781584503795-17a32c27`，reporter 为 memberA，target 为 memberB。 |
| expired share task | `share-task-it-moments-20260616-009-expired` | `status=expired`，`retryCount=0`，绑定 `brief-1781584503870-25d5edac`，用于后台/前端 retry 前置样本。 |

### 只读复核摘要

| 请求 | 脱敏响应摘要 |
| --- | --- |
| `GET /config/home` | HTTP 200，`code=0`。 |
| `GET /share-image-tasks/share-task-it-moments-20260616-009-expired` | 使用 host token；HTTP 200，`code=0`，`status=expired`，`retryCount=0`。 |
| `GET /rankings/today?category=best_opening` | HTTP 200，`code=0`，`items.length=2`，第一条 `moment.id=moment-1781586554926-ffc93c65`。 |
| 服务端残留扫描 | moment / nomination / payout / report / expired task 均可按 ID 命中；payout `status=granted`，`points=60`，`operator=pr-int-009`。 |

### Warnings / Skipped

- `dedicated reviewMomentId` 仍未单独生成；009 的正向候选是发奖候选，不替代 dedicated 待审核样本。
- 举报样本和 expired task 使用服务器侧 data/helper 补齐，并通过 PM2 重启后公网只读复核；当前不是公开用户侧创建接口。
- 未执行 `POST /admin/share-image-tasks/:taskId/retry`，避免把 expired 样本消费成 pending；后台/测试执行 retry 前应先截图或记录当前 `status=expired`。
- 未 cleanup 当前 final 样本和 009 样本。

### Cleanup / 残留扫描口径

| 项 | 口径 |
| --- | --- |
| 写入前备份 | `/www/backup/jiuzhuopanguan/pr-int-db-generated-fixture-run-006-20260616123313/mysql-app-store-before-pr-int-009-final.sql` |
| prefix 扫描 | 按 `IT-MOMENTS-20260616-009` 扫描 momentRecords、momentNominations、rankingRewardPayouts、momentReports、shareImageTasks、pointsLedger、operationLogs、uploads。 |
| 精确 ID 扫描 | `moment-1781586554926-ffc93c65`、`nomination-1781586678021-ca565a1c`、`ranking-reward-payout-1781586678028-9cad8832`、`moment-report-it-moments-20260616-009`、`share-task-it-moments-20260616-009-expired`。 |
| cleanup 口径 | 本轮不 cleanup。后续若 PM 派清理，由后端/API 或 DBA 基于备份和上述 ID 精确删除，不能清理整套 006B final 样本。 |

## PR-INT-DEDICATED-REVIEW-SAMPLE-011 补样本摘要

记录时间：2026-06-17

范围：基于后端/API `PR-BE-DEDICATED-REVIEW-SAMPLE-011` 口径补 dedicated 待审样本。完整 token 只在服务器私密 `tokens.env` 中使用，本文只记录 token 后 8 位和样本 ID。

| 项 | 值 |
| --- | --- |
| API base | `https://api.pomer.cn/api/v1` |
| 复用 session | `session-1781584503517-c033e9` |
| clientDraftId | `IT-MOMENTS-20260616-011-review-dedicated` |
| host token 后 8 位 | `4afb1b00` |
| dedicated reviewMomentId | `moment-1781682962307-8169479c` |
| 状态 | `reviewStatus=pending`，`secondaryReviewStatus=pending` |
| 资格 | `rankingEligible=false`，`rewardEligible=false` |

### 只读复核摘要

| 请求 / 文件 | 脱敏响应摘要 |
| --- | --- |
| 创建脚本 | 返回 `ok=true`，`reviewMomentId=moment-1781682962307-8169479c`，状态为 `pending/pending`。 |
| `GET /sessions/session-1781584503517-c033e9/timeline` | 使用 host token；HTTP 200 / `code=0`；可定位 `moment-1781682962307-8169479c`，`nodeType=highlight`，状态为 `pending/pending`。 |
| sanitized manifest | JSON.parse 通过；`moments.reviewMomentId=moment-1781682962307-8169479c`；`profiles.*.token` 字段数为 0，仅保留 tokenTail。 |

### Warnings / Skipped

- dedicated `reviewMomentId` 已补齐，可供后台审核入口、UGC 审核前台同步和 operation log 关联用例作为前置样本。
- 该样本仍未被后台 action 消费；后台/测试使用前应先记录 `pending/pending` 原态，执行 action 后另补 `operationLogs`、前台同步截图/API 摘要。
- 009 的 report / expired 样本继续引用：`moment-report-it-moments-20260616-009`、`share-task-it-moments-20260616-009-expired`。
- 本轮未 cleanup 当前 final / 009 / 011 样本。

### Cleanup / 残留扫描口径

| 项 | 口径 |
| --- | --- |
| 011 精确 ID | `moment-1781682962307-8169479c` |
| 011 前缀 / draft | `IT-MOMENTS-20260616-011-review-dedicated` |
| cleanup 口径 | 后续若 PM 派清理，应基于 private manifest 或精确 ID 清理，不得清理整套 006B final 样本。 |
