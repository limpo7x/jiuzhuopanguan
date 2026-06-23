# FULL-ADMIN-LINKAGE-AUDIT-013 后台参数与小程序联通审核

时间：2026-06-23 21:02
角色：后台管理负责人
范围：后台管理系统参数、内容配置、审核动作、分享授权、公开候选、榜单/奖励资格、首页配置、模板配置、运营参数与小程序前端消费链路。
边界：只做静态核查与 `api.pomer.cn` 安全 GET 检查；未执行后台写操作，未改业务源码，未改 PM 总台账，未触碰 `pomer.cn` 公司官网。

## 读取与命令证据

- 已读：`AGENTS.md`、`PRD.md`、`docs/runtime/pm-active-worklog.md`、`docs/gameplay-moments-team-announcements.md`。
- 已核查源码：`backend/data/admin.js`、`backend/public/admin/static/heatwave-ops/app.js`、`backend/data/moments.js`、`backend/data/content.js`、`backend/server.js`、`miniprogram/services/*`、相关前端页面消费者。
- 只读本地摘要：`getPageData()` 显示本地后台有 `templates=9`、`toolsCatalog=8`、`momentReviewRows=19`、`shareImageTasks=18`、`rankingRewardRules=7`。
- 只读线上 GET：
  - `GET https://api.pomer.cn/api/v1/config/home` -> `200`，但 `hero/quickTools/banner/judge` 均为空。
  - `GET https://api.pomer.cn/api/v1/config/templates` -> `200`，但 `filters/templates` 均为空。
  - `GET https://api.pomer.cn/api/v1/tools/catalog` -> `200`，返回 8 个工具和 CDN 图片。
  - `GET https://api.pomer.cn/api/v1/config/points` -> `200`，仅内置 `task-first-login`，`rewards=[]`。
  - `GET https://api.pomer.cn/api/v1/membership/catalog` -> `200`，`membershipEnabled=false`，`plans/benefits=[]`。
  - `GET https://api.pomer.cn/api/v1/share/config` -> `200`，`poster/preview/shareItems` 为空。
  - `GET https://api.pomer.cn/api/v1/questions/catalog` -> `200`，`questions=[]`。
  - `GET https://api.pomer.cn/api/v1/merchants/catalog` -> `200`，`shops=[]`。
  - `GET https://api.pomer.cn/api/v1/user/commerce` 未带用户 token 返回 `200` 默认空资产。
  - `GET https://api.pomer.cn/api/v1/user/session-moment-summaries` 未带用户 token 返回 `401`。

## 总体结论

- 后台到小程序前端的基础通道是存在的：`/api/v1/admin/pages/:slug` 保存后台配置，前端通过 `/api/v1/config/*`、`/api/v1/tools/*`、`/api/v1/membership/*`、`/api/v1/session-briefs/*`、`/api/v1/user/session-moment-summaries` 等接口消费。
- 当前强联通且线上有真实数据的链路：工具箱运营配置 -> `/tools/catalog` -> 首页快捷工具/工具箱页。
- 当前代码静态显示已联通但缺线上登录态样本复核的链路：精彩瞬间审核通过 -> `reviewStatus/secondaryReviewStatus/rankingEligible` -> 简报/相册/排行榜推举。
- 当前疑似最大断点不是页面壳，而是线上配置数据源为空或本地/线上 store 不一致：模板、首页、会员、商户、分享素材、题库在线上接口均返回空。
- 本轮未执行任何后台写操作，因此所有“保存后是否即时影响线上小程序”的项目，只能标为静态联通或待验证，不能写成已验收通过。

## 问题与链路清单

### A-001 精彩瞬间审核通过后前台推举显示链路缺线上样本复核

- 后台页面/参数/动作：`content-moments-review`，列表行操作 `approve`，通过无需 reason。
- 后端字段/API：`POST /api/v1/admin/moments/:id/review`；`backend/data/admin.js` 中 `reviewManagedMoment()` 调用 `applyAdminMomentReviewState()`，写入 `reviewStatus=approved`、`secondaryReviewStatus=approved`，并重算 `rankingEligible/rewardEligible`。
- 前端消费页面/字段：`miniprogram/pages/session-brief/index.ts` 使用 `node.rankingEligible` 决定按钮 `推举这张/待审核`；`miniprogram/pages/album/index.ts` 使用 `rankingEligible` 计算相册推举入口；`miniprogram/pages/rankings/index.ts` 调用推举接口。
- 当前联通状态：代码静态已联通；线上真实登录态样本待验证。
- 证据来源：`backend/data/admin.js:3673`、`backend/data/admin.js:3688`、`backend/data/admin.js:3821`；`backend/data/moments.js:2024`、`backend/data/moments.js:2060`；`miniprogram/pages/session-brief/index.ts:140`、`miniprogram/pages/album/index.ts:204`。
- 严重级别：P1。
- 用户或运营影响：若线上数据未按该合同写入，管理员点“通过”后用户仍会看到“待审核/照片审核通过后可推举”，影响回忆榜推举与运营审核闭环。
- 疑似责任角色：后台管理、后端/API、接口联调、QA。
- 建议修补方向：接口联调用有效 `jzp-user-token` 准备一个待审核真实 moment，后台通过后只读复查 `session-brief`、`nomination-eligibility`、相册入口状态；证据只记录 token 后 8 位和脱敏 momentId。

### A-002 公开分享候选已补审核条件，但仍缺线上分享图候选矩阵

- 后台页面/参数/动作：`content-moments-review` 审核状态；`growth-share-tasks` 分享图任务。
- 后端字段/API：`backend/data/moments.js` 中 `isTimelineNodeShareImageEligible()` 要求 `usageConsent.share`、`completionStatus=complete`、非私密、双审通过；分享图创建/处理走 `/api/v1/session-briefs/:id/share-image-tasks`、`/api/v1/share-image-tasks/:id/process`。
- 前端消费页面/字段：`miniprogram/pages/share-poster/index.ts`、`miniprogram/pages/share-preview/index.ts` 通过 `photoHighlights/shareContentFilter/visibleNodes` 展示公开分享内容。
- 当前联通状态：代码静态已联通；线上样本待验证。
- 证据来源：`backend/data/moments.js:520`、`backend/data/moments.js:612`、`backend/data/moments.js:1653`；`miniprogram/pages/share-poster/index.ts:731`、`miniprogram/pages/share-preview/index.ts:434`。
- 严重级别：P1。
- 用户或运营影响：若线上仍有旧任务或旧 brief 缓存，可能出现审核未通过图片进入分享图，或审核通过图片未进分享图。
- 疑似责任角色：后端/API、接口联调、QA。
- 建议修补方向：用结束态 session 做矩阵：未审核图片不进 `photoHighlights`，通过后进入；隐藏/重传后移出；重新生成分享图任务后 `imageUrl` 可访问。

### A-003 后台分享图任务重试绕过用户端分享权限合同

- 后台页面/参数/动作：`growth-share-tasks` 行操作 `retry`。
- 后端字段/API：`POST /api/v1/admin/share-image-tasks/:id/retry` 调用 `retryManagedShareImageTask()`，当前只校验任务存在、状态为 `failed/expired`、reason 非空，然后把任务改回 `pending`。
- 前端消费页面/字段：小程序分享页读取任务状态与 `imageUrl/failedReason/retryCount`。
- 当前联通状态：疑似断链/合同缺口。
- 证据来源：`backend/data/admin.js:3847`、`backend/data/admin.js:3878`；后台行操作定义 `backend/data/admin.js:3433`。
- 严重级别：P1。
- 用户或运营影响：管理员可把不满足“聚会已结束/分享候选可见/成员关系有效”的失败任务重置为 pending，可能制造无法处理的任务或绕过分享授权口径。
- 疑似责任角色：后台管理、后端/API。
- 建议修补方向：后台 retry 应复用或显式对齐用户端分享合同，至少校验 session 已结束、任务所属 brief/session 存在、visible nodes 非空；若后台需要超管绕过，应写清审计日志和 UI 提示。

### A-004 模板配置本地有数据但线上小程序接口返回空

- 后台页面/参数/动作：`content-templates`，模板分类、模板列表、解锁卡。
- 后端字段/API：`updateTemplateConfig()` 写 `content_store.templateConfig`；前端读 `GET /api/v1/config/templates`。
- 前端消费页面/字段：`miniprogram/pages/premium-templates/index.ts`、`miniprogram/pages/feature-zones/index.ts` 使用 `filters/templates/unlockCard`。
- 当前联通状态：疑似断链或线上数据未迁移。
- 证据来源：本地 `getPageData(content-templates)` 为 `filters:5, templates:9`；线上 `GET /config/templates` 返回 `filters:[] templates:[]`；源码 `backend/data/admin.js:2505`、`backend/data/admin.js:3955`、`backend/data/content.js:311`；前端 `miniprogram/services/content.ts:215`。
- 严重级别：P1。
- 用户或运营影响：高级模板中心和功能区模板入口为空，模板配置无法转化为用户可见内容。
- 疑似责任角色：后台管理、DBA/运维、后端/API。
- 建议修补方向：确认线上 `content_store` 主存储是 MySQL 还是文件镜像；导入或通过后台保存模板配置后复查 `/config/templates`，并由前端/QA 验证模板中心展示。

### A-005 首页装修接口联通但线上配置为空

- 后台页面/参数/动作：`content-home-ops`，Hero、工具箱主视觉、活动 Banner、快捷工具。
- 后端字段/API：`updateHomeConfig()` 写 `homeConfig`；工具箱主视觉写 `adminStore.toolsHero`；前端读 `/config/home`，工具箱还读 `/tools/catalog` 的 `hero`。
- 前端消费页面/字段：`miniprogram/services/home.ts`、首页 `miniprogram/pages/index/index.ts`；工具箱 `miniprogram/pages/tools/index.ts`。
- 当前联通状态：已联通但线上配置为空。
- 证据来源：`backend/data/admin.js:2459`、`backend/data/admin.js:3928`；线上 `GET /config/home` 返回空 `hero/quickTools/banner/judge`；前端 `miniprogram/services/home.ts:78`。
- 严重级别：P1。
- 用户或运营影响：首页主视觉、Banner、快捷工具无法由后台运营控制；工具箱有数据但首页快捷工具可能为空。
- 疑似责任角色：后台管理、运营、QA。
- 建议修补方向：后台录入最小首页配置并保存，复查 `/config/home` 非空；如果首页设计不需要旧 Hero，也应在后台标注字段废弃，避免运营误配。

### A-006 会员/权益后台本地有配置但线上目录关闭且为空

- 后台页面/参数/动作：`commerce-membership`，`membershipEnabled`、套餐、权益。
- 后端字段/API：后台写 `adminStore.membershipEnabled/membershipPlans/membershipBenefits`；前端读 `GET /api/v1/membership/catalog`。
- 前端消费页面/字段：`member-center`、`coupon-center`、`feature-zones`。
- 当前联通状态：疑似断链或线上数据未配置。
- 证据来源：本地 `getPageData(commerce-membership)` 为 `membershipPlans:3, membershipBenefits:3`；线上 `/membership/catalog` 返回 `membershipEnabled=false plans=[] benefits=[]`；源码 `backend/data/admin.js:2848`、`backend/data/admin.js:4055`；前端 `miniprogram/pages/member-center/index.ts:35`。
- 严重级别：P1。
- 用户或运营影响：会员与权益功能区显示暂未开放或空列表，后台配置无法转化为前端体验。
- 疑似责任角色：后台管理、后端/API、运营。
- 建议修补方向：确认是否产品有意关闭；若要迁移上线，需线上保存 membership 配置并补 QA 截图；若暂不开放，后台应标状态“未上线”，前端继续禁用。

### A-007 商户合作后台本地有配置但线上商户接口为空

- 后台页面/参数/动作：`commerce-merchants`，商户券名称、分类、图片、库存、状态。
- 后端字段/API：后台写 `adminStore.merchants`；前端读 `GET /api/v1/merchants/catalog`。
- 前端消费页面/字段：`feature-zones` 合作优惠、`coupon-center`。
- 当前联通状态：疑似断链或线上数据未配置。
- 证据来源：本地 `getPageData(commerce-merchants)` 为 `merchants:3`；线上 `/merchants/catalog` 返回 `shops=[]`；源码 `backend/data/admin.js:2911`、`backend/data/admin.js:4064`；前端 `miniprogram/pages/feature-zones/index.ts:14`。
- 严重级别：P1。
- 用户或运营影响：合作优惠入口没有真实券/商户内容，迁移功能区无法闭环。
- 疑似责任角色：后台管理、运营、后端/API。
- 建议修补方向：导入线上商户配置或在前端隐藏该入口；补商户图片 CDN 访问证据和领取/核销后端合同。

### A-008 分享素材配置线上为空，分享页使用默认/降级素材

- 后台页面/参数/动作：`content-share-assets`，分享素材图片、场景、状态、打开率、回流率。
- 后端字段/API：后台写 `adminStore.shareAssets`；前端读 `GET /api/v1/share/config`。
- 前端消费页面/字段：`share-poster` 使用 `poster.imageUrl/title`、`preview.inviteCode/imageUrl/title`、`shareItems`。
- 当前联通状态：接口已联通但线上配置为空。
- 证据来源：本地 `shareAssets:3`；线上 `/share/config` 返回 `poster.imageUrl="" shareItems=[]`；源码 `backend/data/admin.js:2584`、`backend/data/admin.js:3973`；前端 `miniprogram/pages/share-poster/index.ts:731`。
- 严重级别：P2。
- 用户或运营影响：分享页可能只能依赖固定 fallback 和动态分享图，后台素材运营无法生效。
- 疑似责任角色：后台管理、运营、前端。
- 建议修补方向：明确分享素材是否仍保留；若保留，线上录入素材并验证分享页读取；若废弃，后台页面改名或降权，避免运营误以为已生效。

### A-009 积分配置线上仅有内置登录任务，奖励池为空

- 后台页面/参数/动作：`commerce-points`，积分任务、积分商品、用户积分。
- 后端字段/API：后台写 `pointsConfig` 与用户积分集合；前端读 `/config/points`、`/user/commerce`，写 `/points/tasks/:id/claim`、`/points/rewards/:id/redeem`。
- 前端消费页面/字段：首页签到、`wine-points`、`feature-zones`。
- 当前联通状态：已联通但配置不足。
- 证据来源：线上 `/config/points` 返回 `task-first-login`，`rewards=[]`；源码 `backend/data/admin.js:2793`、`backend/data/admin.js:4044`；前端 `miniprogram/pages/wine-points/index.ts:92`。
- 严重级别：P2。
- 用户或运营影响：积分页有基础任务但没有可兑换内容，奖励运营无法闭环。
- 疑似责任角色：运营、后台管理。
- 建议修补方向：按新项目口径补积分任务/奖励，避免旧玩法文案；补领取/兑换 smoke 与 operationLogs。

### A-010 未登录 `/user/commerce` 返回 200 空资产，鉴权口径不一致

- 后台页面/参数/动作：用户权益、积分、会员相关配置会影响 `/user/commerce`。
- 后端字段/API：`GET /api/v1/user/commerce` 未带 token 返回默认空资产；`GET /api/v1/user/session-moment-summaries` 未带 token 返回 401。
- 前端消费页面/字段：首页、功能区、积分页、模板中心会读取用户资产状态。
- 当前联通状态：疑似接口合同缺口。
- 证据来源：线上 `/user/commerce` 未登录返回 `200`；线上 `/user/session-moment-summaries` 未登录返回 `401`；PM 台账也记录过该差异。
- 严重级别：P1。
- 用户或运营影响：前端可能把未登录误判为“已登录但资产为空”，导致会员、积分、模板解锁状态展示偏差。
- 疑似责任角色：后端/API、前端。
- 建议修补方向：统一用户态接口鉴权合同；未登录应返回 401 或明确 `loggedIn=false`，前端按登录态展示。

### A-011 聚会管理可编辑 liveSessions，但与 report/brief/share 关联仍需谨慎

- 后台页面/参数/动作：`sessions` 聚会管理。
- 后端字段/API：后台保存直接覆盖 `adminStore.liveSessions`；用户端摘要由 `reports + liveSessions + momentsStore.brief/shareTask` 组合得出。
- 前端消费页面/字段：我的/相册通过 `/user/session-moment-summaries` 消费 `state/status/endedAt/briefId/shareImageTaskId`。
- 当前联通状态：部分已联通，复杂关联待验证。
- 证据来源：`backend/data/admin.js:2691`、`backend/data/admin.js:4032`；`backend/data/moments.js:1925` 附近构造 summary 字段；前端 `miniprogram/pages/me/index.ts:374`、`miniprogram/pages/album/index.ts:454`。
- 严重级别：P1。
- 用户或运营影响：管理员手动改聚会状态可能影响前台分类，但不会自动补齐 report/brief/share task；可能出现已结束但无分享图、或状态与记录不一致。
- 疑似责任角色：后台管理、后端/API、接口联调。
- 建议修补方向：后台聚会管理应区分“查看”和“状态修复动作”；如允许手动结束/修复，应走专用 action，同时同步 endedAt、report、brief、share task 关联并写 operationLogs。

### A-012 题库与任务后台仍是旧玩法配置，当前小程序主链路无明确消费者

- 后台页面/参数/动作：`content-question-bank`。
- 后端字段/API：后台写 `adminStore.questionBank`；公开 `GET /api/v1/questions/catalog` 返回题库。
- 前端消费页面/字段：当前聚会记录师主链路未发现明确页面消费题库；线上返回 `questions=[]`。
- 当前联通状态：无前端消费者或已降权。
- 证据来源：`backend/data/admin.js:2556`、`backend/data/admin.js:3968`；线上 `/questions/catalog` 返回空。
- 严重级别：P3。
- 用户或运营影响：后台仍保留旧玩法心智，易误导运营；对当前创建/拍照/相册/分享主链路影响低。
- 疑似责任角色：PM、后台管理、UI/UX。
- 建议修补方向：按新 IA 降权或改名为可选互动题库；未恢复前不要作为上线主能力。

### A-013 增长与数据三页是后台只读分析，无小程序前端消费者

- 后台页面/参数/动作：`data-users`、`data-content`、`data-business`。
- 后端字段/API：`GET /api/v1/admin/pages/:slug` 返回 dashboard 数据；不写前台业务配置。
- 前端消费页面/字段：无小程序页面消费者。
- 当前联通状态：已联通到后台页面；无前端消费者。
- 证据来源：`backend/data/admin.js:2441`、`backend/data/admin.js:2447`、`backend/data/admin.js:2453`；`backend/public/admin/static/heatwave-ops/app.js:45`。
- 严重级别：P3。
- 用户或运营影响：不影响小程序展示；只影响后台观察能力。
- 疑似责任角色：后台管理、数据运营。
- 建议修补方向：后续如要影响前台推荐/排序，需新增明确配置字段和 API 合同，不能只靠分析页展示。

### A-014 榜单奖励配置与发奖动作已接入，但缺线上奖励发放闭环证据

- 后台页面/参数/动作：`commerce-ranking-rewards`，规则保存与 `发放今日回忆榜/最佳开场/最佳收尾` 等 pageActions。
- 后端字段/API：规则进入 `rankingRewardRules`，发奖调用 `grantRankingRewards()`，榜单读 `/api/v1/rankings/today`，推举写 `/api/v1/moments/:id/nominations`。
- 前端消费页面/字段：`rankings`、`session-brief`、`album`。
- 当前联通状态：代码静态已联通；线上无榜单样本，发奖待验证。
- 证据来源：本地 `rankingRewardRules:7`；线上 `/rankings/today` 返回 `items=[]`；源码 `backend/data/admin.js:3477`、`backend/data/moments.js:918`；前端 `miniprogram/pages/rankings/index.ts:154`。
- 严重级别：P1。
- 用户或运营影响：即使审核和推举成功，如果没有 nomination/ranking 样本或发奖未验证，用户看不到榜单奖励结果。
- 疑似责任角色：后端/API、接口联调、数据运营、QA。
- 建议修补方向：用审核通过且可推举的真实 moment 建 nomination 样本，验证 `/rankings/today` 有 item，再由后台发奖，检查积分流水和 operationLogs。

## P0/P1 清单

- P0：本轮未发现新的确定性 P0；但未执行写操作和登录态验证，不能给上线准出。
- P1：
  - A-001：审核通过后前台推举显示缺线上样本复核。
  - A-002：公开分享候选缺线上分享图矩阵。
  - A-003：后台分享图任务重试绕过用户端分享权限合同。
  - A-004：模板配置本地有数据但线上接口为空。
  - A-005：首页装修线上配置为空。
  - A-006：会员/权益线上关闭且为空。
  - A-007：商户合作线上为空。
  - A-010：`/user/commerce` 未登录返回 200 空资产，鉴权口径不一致。
  - A-011：聚会管理手动编辑与 report/brief/share 关联仍需验证。
  - A-014：榜单奖励配置与发奖缺线上闭环证据。

## 需要其他角色补证据

- 后端/API：
  - 复核 `/user/commerce` 未登录 200 是否符合合同。
  - 补后台分享图任务 retry 与 SHARE-AUTH-011 分享权限合同一致性。
  - 确认线上 `content_store/admin_store/moments_store` 主存储来源，解释本地配置与线上接口空数据差异。
- 接口联调：
  - 用有效 token 做 A-001/A-002/A-014 矩阵：审核通过、可推举、可进分享候选、可上榜、可发奖。
  - 所有 token 只写后 8 位，不泄露完整值。
- 前端：
  - 对模板、会员、商户、分享素材、首页配置为空时的页面空态做复核，确认不会假成功或展示旧玩法主心智。
  - 复核 `share-poster/share-preview` 是否完全依赖后端过滤后的 `photoHighlights/shareContentFilter`，避免前端 fallback 绕过审核条件。
- QA：
  - 在微信开发者工具预览框复测后台通过审核后的相册推举入口、简报页推举按钮、排行榜推举动作。
  - 复测线上配置为空时首页、模板中心、会员中心、合作优惠、分享页是否有清晰空态。
- 运营/后台管理：
  - 明确哪些后台配置本轮应上线：模板、首页、会员、商户、分享素材、积分奖励。
  - 若应上线，需在后台保存配置后提供 `/config/*`、`/membership/catalog`、`/merchants/catalog` 等接口证据。

## 本轮未做事项

- 未执行任何后台登录写操作。
- 未点击“审核通过/隐藏/重试/发奖/保存配置”。
- 未修改业务源码。
- 未部署、未重启服务、未触碰 `pomer.cn` 公司官网。
- 未改 PM 总台账。
