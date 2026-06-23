# FULL-INT-AUDIT-013 接口合同全量审核

时间：2026-06-23 21:02（Asia/Shanghai）

角色：接口联调负责人

## 范围与边界

- 已读启动材料：`AGENTS.md`、`PRD.md`、`docs/runtime/pm-active-worklog.md`、`docs/gameplay-moments-team-announcements.md`。
- 已做静态核查：`miniprogram/services`、`miniprogram/pages` 中小程序 API 调用，`backend/server.js` 路由，`backend/data/*` 数据层，`backend/scripts/smoke*` 与 `verify-normalized-*` 可复用证据。
- 已做只读 HTTP 探针：仅访问 `https://api.pomer.cn/api/v1`，未携带 token，未创建/上传/结束/审核/清理线上数据。
- 未修改业务源码，未修改 PM 总台账，未触碰 `pomer.cn` 公司官网。
- 敏感值处理：token 未读取；线上 `sessionId/profileId/inviteCode` 仅记录后缀或摘要。

## 只读线上探针

| 接口 | 方法 | 凭证 | HTTP / code | 结论 |
| --- | --- | --- | --- | --- |
| `/api/v1/config/home` | GET | 无 | 200 / 0 | 公开配置可读 |
| `/api/v1/share/config` | GET | 无 | 200 / 0 | 公开分享配置可读 |
| `/api/v1/rankings/today?category=today_funny&limit=3` | GET | 无 | 200 / 0 | 当前返回空榜单 |
| `/api/v1/user/profile` | GET | 无 | 200 / 0 | 匿名兜底 profile 可读 |
| `/api/v1/user/session-moment-summaries` | GET | 无 | 401 / 401 | 用户摘要正确要求 token |
| `/api/v1/user/share-image-summaries` | GET | 无 | 401 / 401 | 分享图摘要正确要求 token |
| `/api/v1/reports/history?mode=all` | GET | 无 | 401 / 401 | 历史记录正确要求 token |
| `/api/v1/sessions/live` | GET | 无 | 200 / 0 | 返回当前 live session 摘要，见问题 `FULL-INT-AUDIT-013-P0-01` |

线上敏感样本脱敏：无 token；`/sessions/live` 返回的当前 session 仅记录 `sessionTail=b4e84c`、`profileTail=8b9a52/3f0c61`、`hasJoinedPlayers=true`、`hasPhotoHighlights=true`。

## 链路覆盖矩阵

| 链路 | 前端调用位置 | 后端路由 / 数据层 | 当前判断 |
| --- | --- | --- | --- |
| 创建聚会 | `miniprogram/pages/create-session/index.ts`、`add-players/index.ts` -> `createManagedSession()` | `POST /api/v1/sessions` -> `createManagedSession()` | 路由存在；首拍前状态合同不完全一致，见 `P1-02` |
| 邀请 / 加入 | `index.ts`、`invite-group/index.ts` -> `joinManagedSession()`、`getManagedLiveSession()` | `POST /sessions/join`、`GET /sessions/live` -> `joinManagedSession()` | 基础合同存在；满员错误与无参读取边界有缺口，见 `P0-01`、`P1-03` |
| 踢人 / 重新加入 | `invite-group/index.ts` -> `kickManagedSessionMember()`、`joinManagedSession()` | `POST /sessions/:id/members/:profileId/kick`、`POST /sessions/join` | 路由存在；分享归属需线上样本复跑，见 `P1-04` |
| 拍照上传 / 保存瞬间 | `moment-editor/index.ts` -> `uploadManagedMomentImage()`、`createManagedMoment()` | `POST /moments/uploads/image`、`POST /sessions/:id/moments` -> `uploadMomentImage()`、`createMoment()` | 基础合同存在；两步写入有孤儿对象风险，见 `P2-08` |
| 首拍进行中 / 首页挂起 | `utils/session.ts`、`index.ts`、`me/index.ts`、`album/index.ts` | `GET /user/session-moment-summaries`、`GET /sessions/live` | 前端过滤已接；后端仍按 session 状态输出，见 `P1-02` |
| 我的统计 / 相册 | `me/index.ts`、`album/index.ts`、`wine-history/index.ts` | `/user/session-moment-summaries`、`/reports/history` | 008FB 已由 PM 记录线上 tokenTail `a9160666` 下 `total=22/ended=16` 闭环；本轮未读取 token |
| 精彩瞬间 / 推举资格 | `session-brief/index.ts`、`rankings/index.ts`、`album/index.ts` | `GET /rankings/today`、`GET /moments/:id/nomination-eligibility`、`POST /moments/:id/nominations` | 路由存在；公开榜单隐私字段需确认，见 `P2-07` |
| 分享授权 | `share-poster/index.ts`、`me/index.ts` | `/briefs/:id/share-images`、`/share-images/:id`、legacy `/session-briefs`/`share-image-tasks` | 后端合同有本地 smoke；线上矩阵仍待有效 token / 样本复跑，见 `P1-04`、`P2-05` |
| 双审通过 / 上榜 / 奖励 | 后台页面与小程序榜单读取 | `POST /admin/moments/:id/review`、`GET /rankings/today`、`/admin/ranking-rewards/grant` | 本地 `smoke-admin-moments-flow.js` 覆盖；线上用户态与后台证据待 QA/后台补齐 |
| OSS/CDN 上传 | `moment-editor/index.ts` -> upload API | `uploadMomentImage()` -> `object-storage.putObject()` | PM worklog 记录生产 OSS 上传/CDN/删除闭环；本轮未写入复测 |

## 问题清单

### FULL-INT-AUDIT-013-P0-01：`/sessions/live` 无 token、无参数返回当前 live session

- 严重级别：P0
- 前端调用位置：`miniprogram/services/operations.ts:949`，`getManagedLiveSession(sessionId?, inviteCode?)` 允许无参数调用；页面侧主要传参，但服务层合同未强约束。
- 后端处理位置：`backend/server.js:1381` 到 `backend/server.js:1430`；无 `sessionId` 且无 `inviteCode` 时不要求用户 token，并从 normalized/app_store 选择一个 live session 返回。
- 请求方法：GET `/api/v1/sessions/live`
- 鉴权要求：当前实现无参数不鉴权；建议改为无参数必须鉴权且只能返回当前用户归属，或直接 `400 sessionId or inviteCode required`。
- 请求字段：当前允许空 query。
- 响应字段：线上只读证据显示返回 `id/inviteCode/joinedPlayers/joinStatusPlayers/photoHighlights/visibleNodes/ledgerSummary` 等；文档仅记录 `sessionTail=b4e84c`、`profileTail=8b9a52/3f0c61`、`hasJoinedPlayers=true`、`hasPhotoHighlights=true`。
- 错误态：当前无错误态；期望无参 `400` 或未登录 `401`，非成员仅在带 `inviteCode` 时返回裁剪后的 public invite view。
- 线上/本地证据：`curl.exe -sS -i https://api.pomer.cn/api/v1/sessions/live` 返回 `HTTP 200 / code 0`，且含成员和照片摘要；静态代码确认 no-query 分支未调用 `requireUserSession()`。
- 影响链路：邀请、首页挂起、成员隐私、公开分享摘要边界。
- 疑似责任角色：后端/API。
- 建议修补方向：后端禁止无参数匿名读取默认 live session；`query.sessionId` 必须校验成员，`query.inviteCode` 的匿名路径只返回 `toPublicInviteLiveSession()` 裁剪字段；补一个线上只读回归：无参 400/401，invite public 不含成员 profileId 和照片明细。

### FULL-INT-AUDIT-013-P1-02：首拍后才计入进行中的规则未沉到后端合同

- 严重级别：P1
- 前端调用位置：`miniprogram/utils/session.ts:139` 到 `:149`，`index.ts:186` 到 `:188`，`me/index.ts:210` 到 `:240`，`album/index.ts:199` 到 `:279`。
- 后端处理位置：`backend/data/admin.js:1907` 到 `:1931` 创建 session；`backend/server.js:1642` `POST /sessions`；`backend/server.js:1381` `GET /sessions/live`。
- 请求方法：POST `/api/v1/sessions`、GET `/api/v1/user/session-moment-summaries`、GET `/api/v1/sessions/live`
- 鉴权要求：创建和用户摘要要求 token；`/sessions/live` 当前按参数分支部分要求 token。
- 请求字段：前端创建快速聚会时可传 `state=邀请中`，添加成员页可传 `state=等待开局`；首拍后本地写 `firstPhotoUploadedAt`。
- 响应字段：后端 session 仍以 `state/status/stateText` 表示等待/进行中/已结束；未提供 `firstPhotoUploadedAt/hasFirstPhoto/isActiveForResume` 等稳定字段。
- 错误态：无明确错误态；这是状态合同缺口。
- 线上/本地证据：PM worklog 记录首拍规则前端已改；静态代码显示首拍标记主要在小程序 storage 和摘要 `coverPhotoUrl` 过滤上实现，后端创建 session 后仍进入 `liveSessions`。
- 影响链路：首页挂起、我的统计、相册进行中、跨设备恢复、后台 sessions 统计。
- 疑似责任角色：后端/API + 前端联调。
- 建议修补方向：后端为 session 增加 `firstPhotoUploadedAt` 或 `hasFirstPhoto`，由 `createMoment()` 首张有效图片写入；`session-moment-summaries`、`sessions/live`、后台 sessions 均按同一字段输出 `isActiveForResume`，前端只消费后端合同，不再依赖本地 storage 推断跨设备状态。

### FULL-INT-AUDIT-013-P1-03：加入聚会满员错误未映射为可识别 HTTP 错误

- 严重级别：P1
- 前端调用位置：`miniprogram/pages/index/index.ts:505`、`invite-group/index.ts` 通过 `joinManagedSession()` 加入。
- 后端处理位置：`backend/data/admin.js:1788` 到 `:1792` 抛 `SESSION_FULL`；`backend/server.js:1680` 到 `:1703` 只映射 `NOT_SESSION_PLAYER` 和 `SESSION_NOT_FOUND`。
- 请求方法：POST `/api/v1/sessions/join`
- 鉴权要求：用户 token 必须有效。
- 请求字段：`{ inviteCode }`
- 响应字段：成功返回 live session；满员期望返回 `409 session full` 或 `400 session full`。
- 错误态：当前 `SESSION_FULL` 会进入全局 catch，返回 `HTTP 500 / code 500 / message=session full`。
- 线上/本地证据：静态审核确认 `SESSION_FULL` 未在 server join catch 中分支处理；本轮未做写入型满员样本。
- 影响链路：邀请加入、被踢后重新加入、满员提示、QA 自动化断言。
- 疑似责任角色：后端/API。
- 建议修补方向：在 `/sessions/join` 和 `/parties/join` catch 中映射 `SESSION_FULL` 为 `409 session full`；前端按 message/status 展示“聚会已满”。

### FULL-INT-AUDIT-013-P1-04：分享授权合同已有本地 smoke，但线上用户态矩阵仍缺样本复跑

- 严重级别：P1
- 前端调用位置：`miniprogram/pages/share-poster/index.ts:491` 到 `:533` 识别 `session not ended/not session member/forbidden`；`createManagedShareImageTask()`、`retryManagedShareImageTask()` 在 `operations.ts:1546` 到 `:1596`。
- 后端处理位置：`backend/data/moments.js:347` 到 `:356`，`assertEndedSessionHostForShareImage()`；`backend/server.js:1488` 到 `:1577` 分享图 legacy/modern routes。
- 请求方法：POST `/briefs/:briefId/share-images`、POST `/share-images/:taskId/retry`、POST `/share-images/:taskId/process`、GET `/share-images/:taskId`、GET `/user/share-image-summaries`
- 鉴权要求：创建/重试/处理要求有效 token，且结束后房主；详情和 ready summary 要求仍是 session 成员。
- 请求字段：`briefId/taskId/includeLedger/layoutMode/selectedNodeIds`
- 响应字段：`taskId/sessionId/briefId/status/imageUrl/readyShareImageUrl/finishedAt`
- 错误态：合同为进行中 `409 session not ended`，普通成员写操作 `403 forbidden`，被踢读取 `403 not session member`。
- 线上/本地证据：`backend/scripts/smoke-share-image-async-flow.js` 覆盖 `409/403/被踢 summaries 不出现`；本轮未拿有效 token，未执行线上写入样本，不写通过。
- 影响链路：分享授权、被踢/重新加入归属、`share-image-summaries` 与 `session-moment-summaries` 一致性。
- 疑似责任角色：接口联调 + 后端/API + QA。
- 建议修补方向：收到部署证据、host/member/kicked/rejoined token 与清理方案后按 `docs/runtime/pr-int-share-auth-011.md` 复跑；同时对 normalized/MySQL 与 app_store 的 share summaries 做同 profile/session/task 对账。

### FULL-INT-AUDIT-013-P2-05：分享图 modern/legacy fallback 会在 409/403 权限错误后继续发起第二次写操作

- 严重级别：P2
- 前端调用位置：`miniprogram/services/operations.ts:1546` 到 `:1596`
- 后端处理位置：`backend/server.js:1488` 到 `:1577`
- 请求方法：POST `/briefs/:briefId/share-images` fallback POST `/session-briefs/:briefId/share-image-tasks`；POST `/share-images/:taskId/retry|process` fallback legacy。
- 鉴权要求：同分享授权合同。
- 请求字段：同分享授权合同。
- 响应字段：同分享授权合同。
- 错误态：当前前端对任何 primary 错误都 fallback，包括 `409 session not ended`、`403 forbidden`、`403 not session member`。
- 线上/本地证据：静态审核确认 fallback catch 不区分 404/405 与业务禁止错误；本轮未做线上写入复测。
- 影响链路：分享授权错误态、后端日志、限流、重复审计记录。
- 疑似责任角色：前端 + 后端/API。
- 建议修补方向：只在 primary 返回 `404/405` 或明确 `route not found` 时 fallback；`401/403/409` 直接向页面抛出原错误，避免对禁止态做第二次写请求。

### FULL-INT-AUDIT-013-P2-06：结束聚会 fallback 捕获所有错误，403/401 后仍继续尝试旧接口和 PUT

- 严重级别：P2
- 前端调用位置：`miniprogram/services/operations.ts:1024` 到 `:1041`，`live-record/index.ts:1289`
- 后端处理位置：`backend/server.js:1766` 到 `:1875`
- 请求方法：POST `/sessions/:id/end` fallback POST `/sessions/:id/finish` fallback PUT `/sessions/:id`
- 鉴权要求：有效 token，且必须房主。
- 请求字段：无或 `{ state, status }`
- 响应字段：`sessionId/state/status/endedAt/updatedAt`
- 错误态：非房主应稳定 `403 forbidden`；不存在应 `404 session not found`。
- 线上/本地证据：静态审核确认前端 catch 不区分 403/401/409，会继续请求不存在的 `/finish` 并最终 PUT；后端没有 `/sessions/:id/finish` 分支。
- 影响链路：结束聚会、我的统计、相册已结束分类、后台 sessions。
- 疑似责任角色：前端。
- 建议修补方向：只在 `404 route not found` 或 `405` 时 fallback 旧接口；`401/403/409` 直接展示权限/状态错误；如后端不再支持 `/finish`，移除该 fallback。

### FULL-INT-AUDIT-013-P2-07：公开榜单接口无鉴权，若有数据会返回 moment 内 uploader 标识

- 严重级别：P2
- 前端调用位置：`miniprogram/pages/rankings/index.ts:110`、`operations.ts:1602` 到 `:1610`
- 后端处理位置：`backend/server.js:1303`；`backend/data/moments.js:1970` 到 `:2018`
- 请求方法：GET `/api/v1/rankings/today?category=&limit=`
- 鉴权要求：当前无 token 要求。
- 请求字段：`category/limit`
- 响应字段：`category/date/items[].moment`，静态实现会包含 `uploaderProfileId/uploaderName/imageUrl/caption` 等。
- 错误态：无明确鉴权错误；空榜返回 `items=[]`。
- 线上/本地证据：本轮线上只读榜单返回空数组，未见实际泄露；静态代码显示公开路由未鉴权且构造 ranking item 时序列化 moment。
- 影响链路：精彩瞬间、推举榜、用户隐私。
- 疑似责任角色：PM/产品 + 后端/API。
- 建议修补方向：确认“今日回忆榜”是否允许公网匿名；若只允许小程序登录用户，增加 token；若允许公开，响应中去除 `uploaderProfileId` 等身份字段，仅保留昵称/头像的展示级字段，并明确隐私合同。

### FULL-INT-AUDIT-013-P2-08：拍照上传与创建 moment 是两步写入，第二步失败会留下上传对象

- 严重级别：P2
- 前端调用位置：`miniprogram/pages/moment-editor/index.ts:501` 先 `uploadManagedMomentImage()`，`:622` 再 `createManagedMoment()`。
- 后端处理位置：`backend/server.js:1308`、`:1766` 下 `POST /sessions/:id/moments`；`backend/data/moments.js:2137` 到 `:2178` 上传写 `uploadedAssets`。
- 请求方法：POST `/moments/uploads/image`，POST `/sessions/:sessionId/moments`
- 鉴权要求：两步都需要有效 token；上传阶段还要求用户是 session member。
- 请求字段：上传 `{ dataUrl, fileName, sessionId }`；创建 `{ imageUrl, caption, nodeType, usageConsent, visibility, visibleProfileIds, clientDraftId }`
- 响应字段：上传返回 `url/publicUrl/localCompatUrl/objectKey/storageProvider`；创建返回 moment record。
- 错误态：上传失败返回对应错误；创建失败可能为 `400 private moment requires visibleProfileIds`、`403 not session member`、`404 session not found` 等。
- 线上/本地证据：PM worklog 记录 OSS E2E 已有清理闭环；静态审核显示业务前端没有在创建失败时删除刚上传对象或标记可清理孤儿对象。
- 影响链路：拍照上传、首拍进行中、OSS/CDN 存储残留。
- 疑似责任角色：后端/API + 前端。
- 建议修补方向：优先提供单接口事务式保存，或在 `createMoment` 失败后由前端调用明确 cleanup 接口；至少后端记录 `uploadedAssets` 未绑定 moment 的 TTL/清理任务，并在联调中补残留扫描。

## P0/P1 汇总

| 编号 | 级别 | 简述 | 当前状态 |
| --- | --- | --- | --- |
| `FULL-INT-AUDIT-013-P0-01` | P0 | `/sessions/live` 无 token 无参数泄露当前 live session 摘要 | 线上只读已复现，待后端修复 |
| `FULL-INT-AUDIT-013-P1-02` | P1 | 首拍进行中规则未沉到后端合同 | 静态审核，待后端合同/线上样本 |
| `FULL-INT-AUDIT-013-P1-03` | P1 | 加入满员错误未映射，疑似 500 | 静态审核，待后端修复/满员样本 |
| `FULL-INT-AUDIT-013-P1-04` | P1 | 分享授权线上矩阵缺有效 token 与清理样本复跑 | 本地 smoke 有证据，线上待联调 |

## 待补证据事项

- 前端：确认是否仍需要 `getManagedLiveSession()` 支持无参；如不需要，前端服务层改为参数必填或调用前拦截。
- 后端/API：修复 `/sessions/live` 无参匿名读取、`SESSION_FULL` 错误映射、首拍状态字段合同；给出 SHARE-AUTH-011 当前线上部署 commit 与健康证据。
- 后台：补线上后台审核/二审/上榜/奖励资格的只读或可清理验收证据；不要把本地 smoke 等同线上通过。
- DBA/运维：如启用 normalized/MySQL 灰度读，补 `sessions/live`、`session-moment-summaries`、`share-image-summaries` 同 profile/session/task 对账报告；发现不一致直接转后端/DBA 联查。
- QA：拿有效小程序登录态后，按 PM 要求只记录 token 后 8 位，复测创建聚会、首拍前返回、首拍后挂起、分享授权 409/403、被踢/重新加入、相册/我的统计。

## 结论

本轮为只读审核和静态对齐，不写线上数据。共记录问题/缺口 8 个：P0 1 个、P1 3 个、P2 4 个、P3 0 个。当前不能写“全链路通过”；优先收敛 `P0-01`，随后补 SHARE-AUTH-011 线上矩阵与首拍状态后端合同。
