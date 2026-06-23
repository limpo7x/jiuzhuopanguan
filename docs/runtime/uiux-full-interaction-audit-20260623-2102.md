# FULL-UIUX-AUDIT-013｜聚会记录师全量 UI/UX 静态审核记录

- 审核时间：2026-06-23 21:02
- 审核角色：UI/UX 审核负责人
- 审核范围：小程序已注册页面、核心进入/返回/创建/邀请/拍照/相册/我的/首页/分享/挂起/结束路径，以及精彩瞬间/推举/分享授权/双审通过相关 UI 可理解性。
- 审核结论：本轮为静态审核，未取得微信开发者工具预览框点击证据，所有结论均需标记为“静态审核/待预览框复核”，不得写正式通过。
- 修改边界：仅新增本 UI/UX 审核记录；未修改业务源码，未修改 PM 总台账，未触碰 `pomer.cn` 公司官网。

## 审核依据与方法

已只读核查：

- `AGENTS.md`
- `PRD.md`
- `docs/runtime/pm-active-worklog.md`
- `docs/gameplay-moments-team-announcements.md`
- `miniprogram/app.json`
- `miniprogram/pages/**`
- `miniprogram/utils/session.ts`
- `miniprogram/utils/session-return.ts`

使用的 UI/UX 审核 skill：

- `web-design-guidelines`
- 使用边界：该 skill 面向 Web Interface Guidelines，本轮仅提取其对清晰状态、禁用控件、错误后下一步、无死路导航、可操作元素可理解性的通用原则；ARIA、HTML 标签等 Web 专属规则不机械套用到微信小程序 WXML。
- 证据性质：静态代码与文档审查；未用开发者工具预览框点击验证。

## 静态覆盖摘要

已注册页面：

- 首页：`pages/index/index`
- 相册：`pages/album/index`
- 聚会账本：`pages/ledger/index`
- 工具箱：`pages/tools/index`
- 排行/回忆榜：`pages/rankings/index`
- 功能专区：`pages/feature-zones/index`
- 工具详情：`pages/tool-detail/index`
- 我的：`pages/me/index`
- 创建聚会：`pages/create-session/index`
- 邀请：`pages/invite-group/index`
- 分享预览：`pages/share-preview/index`
- 合规说明：`pages/compliance-guide/index`
- 照片记录编辑：`pages/moment-editor/index`
- 聚会简报：`pages/session-brief/index`
- 分享图：`pages/share-poster/index`
- 异常/失效状态：`pages/invalid-state/index`
- 隐私/功能状态：`pages/privacy-state/index`
- 设置：`pages/settings/index`
- 好友中心：`pages/friend-hub/index`
- 等待房间：`pages/waiting-room/index`
- 记录页分包：`pages/live-record/index`

静态正向发现：

- 首页主 CTA 直接进入创建聚会，未被旧参与房间拦截。证据：`miniprogram/pages/index/index.ts:436-442`。
- 首页“进行中”摘要已按首张照片过滤，未把仅创建/仅邀请房间作为进行中返回条。证据：`miniprogram/pages/index/index.ts:184-190`、`miniprogram/pages/index/index.ts:285-300`。
- 创建页写入运行态时使用“待首拍/startedAt: 0”，符合“首拍成功后才算进行中”的方向。证据：`miniprogram/pages/create-session/index.ts:126-146`。
- 邀请页、照片编辑页、记录页返回前会区分首拍前/首拍后，并提示“首张照片保存前不计入进行中”。证据：`miniprogram/pages/invite-group/index.ts:391-400`、`miniprogram/pages/moment-editor/index.ts:341-368`、`miniprogram/pages/live-record/index.ts:1359-1368`。
- 照片编辑页阻止首条记录无图提交，只有成功照片记录才标记首拍。证据：`miniprogram/pages/moment-editor/index.ts:600-603`、`miniprogram/pages/moment-editor/index.ts:621-625`。
- “我的”页统计里的进行中/待分享聚会使用首拍相关过滤。证据：`miniprogram/pages/me/index.ts:390-405`。
- 功能专区对未开放功能有 disabled 与 toast 说明，未发现静态直跳无效页面。证据：`miniprogram/pages/feature-zones/index.ts:217-241`。

## 问题清单

### UIUX-013-P0-01｜分享图无权限/被踢出状态仍可能展示记录内容

- 页面/路径：`/pages/share-poster/index`；分享图生成页、外部分享直达、成员无权限/被踢出/未结束等状态。
- 现象：分享任务被 `shareActionBlocked` 禁用后，WXML 仍无条件渲染 `posterTimelineNodes` 时间线内容；无权限/被踢出状态只禁用按钮，不保证清空照片、时间线、总结内容。
- 用户影响：被踢出或无权限用户可能看到该局照片/记录摘要，违背“被踢出不展示该局记录”；同时用户会看到内容但无法保存，造成权限状态混乱。
- 严重级别：P0
- 证据来源：静态审核/待预览框复核；`miniprogram/pages/share-poster/index.wxml:30-52`、`miniprogram/pages/share-poster/index.ts:846-887`、`miniprogram/pages/share-poster/index.ts:890-911`、`miniprogram/pages/share-poster/index.ts:915-939`。
- 预期行为：无权限、被踢出、聚会未结束、分享任务不可用时，应进入独立状态页或空态卡片；必须隐藏/清空照片、时间线、总结、二维码，只保留可解释文案和安全返回按钮。
- 疑似责任角色：前端、后端/API、测试。
- 建议修补方向：前端增加 `canViewPosterContent` 或 `shareViewState`，在 blocked/error/unavailable 时不渲染 timeline；后端/API 稳定返回 `notEnded/noPermission/removed/notMember` 错误类型；测试补预览框与接口态截图证据。

### UIUX-013-P1-02｜相册“进行中”数量未严格遵守首拍规则

- 页面/路径：`/pages/album/index`；我的相册、进行中筛选、首页统计跳转相册。
- 现象：相册筛选列表的进行中逻辑使用了 `hasFirstPhotoSummary`，但顶部 `ongoingCount` 仍只按“未结束”统计，未过滤无首拍聚会。
- 用户影响：仅创建/仅邀请的聚会可能计入“进行中”数量，造成数量与列表不一致，也违背“首拍成功后才算进行中”。
- 严重级别：P1
- 证据来源：静态审核/待预览框复核；`miniprogram/pages/album/index.ts:199-202`、`miniprogram/pages/album/index.ts:274-283`、`miniprogram/pages/album/index.ts:455-467`、`miniprogram/pages/album/index.wxml:65-68`。
- 预期行为：`ongoingCount` 与进行中列表使用同一判断：未结束且已有首拍/封面/分享图证据。
- 疑似责任角色：前端、测试。
- 建议修补方向：抽出统一 summary 状态分类函数，`ongoingCount`、列表筛选、入口文案共用；测试补“创建后不首拍”的相册计数用例。

### UIUX-013-P1-03｜账本独立页把任意 sessionId 当作可回到本局

- 页面/路径：`/pages/ledger/index`；从首页/工具箱/相册进入账本，或有邀请中 session runtime 时打开账本。
- 现象：账本页 `hasSession` 只检查 `sessionId`，远端拉取成功也直接置为 true；WXML 用 `hasSession` 控制“回到本局/暂无进行中聚会”和“新建聚会”按钮。
- 用户影响：首拍前的邀请中房间会被表现为可回到本局的进行中聚会，可能隐藏新建聚会入口，造成状态污染。
- 严重级别：P1
- 证据来源：静态审核/待预览框复核；`miniprogram/pages/ledger/index.ts:231-241`、`miniprogram/pages/ledger/index.ts:294-306`、`miniprogram/pages/ledger/index.ts:313-326`、`miniprogram/pages/ledger/index.wxml:65-68`。
- 预期行为：账本页判断“有进行中聚会”必须使用 `isSessionRuntimeInProgress()` 或后端首拍字段；首拍前只展示“先拍第一张照片”或“新建聚会/返回邀请”的明确动作。
- 疑似责任角色：前端、测试。
- 建议修补方向：账本页引入首拍态判断，区分 `noSession/pendingFirstPhoto/inProgress/ended`；预览框复核首拍前进入账本的按钮与返回路径。

### UIUX-013-P1-04｜“照片审核通过后可推举/待审核”与当前 PRD 冲突，双审链路不可理解

- 页面/路径：`/pages/album/index`、`/pages/session-brief/index`；精彩瞬间、照片推举、今日回忆榜入口。
- 现象：相册与简报里存在“待审核”“照片审核通过后可推举”文案，但 PRD 明确相册直接展示已上传照片，不能再沿用审核图片机制；用户也看不到“双审通过”到底指照片审核、推举审核、分享授权还是榜单资格。
- 用户影响：用户会误以为照片上传后需要人工审核，且推举按钮为何不可用不清晰；精彩瞬间/推举/分享授权链路容易被理解为阻塞。
- 严重级别：P1
- 证据来源：静态审核/待预览框复核；`PRD.md:130-136`、`miniprogram/pages/album/index.ts:218-224`、`miniprogram/pages/album/index.ts:540-546`、`miniprogram/pages/session-brief/index.ts:140-149`、`miniprogram/pages/session-brief/index.wxml:40-73`。
- 预期行为：如果当前没有照片审核机制，文案应改为“暂不可推举/需公开授权后可推举/需满足榜单资格”；如果确实存在双审，UI 需要展示清楚的状态阶梯与责任方。
- 疑似责任角色：UI/UX、前端、后端/API、后台管理、测试。
- 建议修补方向：由后端/API 返回可推举资格和精确原因码；前端按原因码展示非审核化文案；后台若有审核任务需补状态定义和管理入口证据。

### UIUX-013-P1-05｜分享图页返回逻辑固定回首页，破坏来源上下文

- 页面/路径：`/pages/share-poster/index`；从结束聚会、我的、相册、分享历史或外链进入后返回。
- 现象：分享图页 `handleBackTap` 固定 `reLaunch('/pages/index/index')`。
- 用户影响：从“我的/相册/结束后分享/分享合集”进入时，返回会丢失原路径和筛选状态；用户可能重复跳首页，无法回到刚才的任务上下文。
- 严重级别：P1
- 证据来源：静态审核/待预览框复核；`miniprogram/pages/share-poster/index.ts:1601-1607`。
- 预期行为：有页面栈时优先 `navigateBack`；无栈时按来源参数回到相册分享筛选、我的分享图或首页；“返回首页”作为单独按钮而不是通用返回。
- 疑似责任角色：前端、测试。
- 建议修补方向：分享图入口统一传 `from`，分享图页实现来源感知返回；测试覆盖结束后跳转、我的进入、相册进入、外链进入四类路径。

### UIUX-013-P2-06｜创建页“高级设置”实际跳到功能/隐私占位页

- 页面/路径：`/pages/create-session/index`；创建聚会表单里的“高级设置”行。
- 现象：WXML 文案是“高级设置”，点击后调用 `handleMoreTemplatesTap`，跳转 `/pages/privacy-state/index?type=feature`。
- 用户影响：用户预期是主题、人数、模板、权限等设置，但实际进入通用功能占位页，形成误跳与死路感。
- 严重级别：P2
- 证据来源：静态审核/待预览框复核；`miniprogram/pages/create-session/index.wxml:55-58`、`miniprogram/pages/create-session/index.ts:188-191`。
- 预期行为：如果高级设置未开放，应在当前行直接显示“暂未开放”或禁用；如果是模板/更多配置，应跳到真实设置页或展开内联设置。
- 疑似责任角色：UI/UX、前端。
- 建议修补方向：重命名并调整交互：`高级设置` 改为 `更多模板暂未开放` 或接入真实设置页；避免普通设置入口跳到隐私/功能空态。

### UIUX-013-P2-07｜创建聚会预设命名仍偏旧玩法/对抗感

- 页面/路径：`/pages/create-session/index`；聚会名称预设。
- 现象：预设包含“复仇局”“翻盘局”“决战到天亮”“生'史'局”等旧玩法/对抗式表达。
- 用户影响：产品已转为“聚会记录/拍照/相册/分享/回忆”，这些命名会把用户心智拉回旧玩法，降低拍照记录主线权重。
- 严重级别：P2
- 证据来源：静态审核/待预览框复核；`miniprogram/pages/create-session/index.ts:39-48`。
- 预期行为：预设应围绕真实聚会场景，如“生日小聚”“老友饭局”“同事团建”“家庭聚会”“周末小聚”“露营烧烤”。
- 疑似责任角色：UI/UX、前端。
- 建议修补方向：替换预设文案，并检查分享图、相册、首页是否仍有旧玩法强表达。

### UIUX-013-P2-08｜记录页没有可见分享状态说明，分享入口心智断层

- 页面/路径：`/pages/live-record/index`；记录/相册/账本分段页、结束前分享认知。
- 现象：记录页 WXML 只显示“记录/相册/聚会账本”三段；TS 里仍有 `share` 分段拦截逻辑并提示“结束聚会后再生成分享图”，但界面上没有可见分享分段或解释。
- 用户影响：用户可能不知道分享图需要结束后生成；如果从其他入口看到分享能力，会以为记录页遗漏功能或分享被隐藏。
- 严重级别：P2
- 证据来源：静态审核/待预览框复核；`PRD.md:100-107`、`PRD.md:139-151`、`miniprogram/pages/live-record/index.wxml:47-57`、`miniprogram/pages/live-record/index.ts:1220-1231`。
- 预期行为：保留“分享”作为禁用分段或轻量提示“结束后生成分享图”；按钮不可生成最终图，但要解释入口在哪里。
- 疑似责任角色：UI/UX、前端、测试。
- 建议修补方向：记录页新增非阻塞分享状态提示；若 PM 决定结束前不展示分享 tab，则清理 TS 中不可达的 share 分段逻辑并在结束按钮附近解释。

### UIUX-013-P2-09｜分享预览页“举报/反馈待后台开通”是可疑伪入口

- 页面/路径：`/pages/share-preview/index`；外部分享返回模式。
- 现象：分享预览页展示“举报/反馈待后台开通”，但静态 WXML 未见真实可点反馈入口。
- 用户影响：外部用户看到类似操作入口却无法使用，影响安全感和合规信任；如果是按钮，应可点，如果是说明，应避免按钮样式。
- 严重级别：P2
- 证据来源：静态审核/待预览框复核；`miniprogram/pages/share-preview/index.wxml:103-105`。
- 预期行为：接入真实举报/反馈页或后台接口；未开通时改为被动说明，不使用操作入口样式。
- 疑似责任角色：前端、后台管理、UGC 风控、测试。
- 建议修补方向：补 report route 与后台任务，或临时改成清晰的不可操作说明。

### UIUX-013-P2-10｜等待房间可能让成员在首拍前进入记录页

- 页面/路径：`/pages/waiting-room/index`；成员加入后等待房主首拍/开始。
- 现象：等待房间检测当前用户已加入且非房主时，会自动 redirect 到记录页；开始逻辑也会写入 `startedAt`，但不写首拍字段。
- 用户影响：成员可能在首拍前看到记录页，误以为聚会已进行中；`startedAt` 的存在也会干扰“首拍成功后才算进行中”的理解。
- 严重级别：P2
- 证据来源：静态审核/待预览框复核；`miniprogram/pages/waiting-room/index.ts:184-195`、`miniprogram/pages/waiting-room/index.ts:286-291`。
- 预期行为：首拍前应保留在等待首拍状态，或进入首拍引导；记录页只在已有首张照片后作为进行中主页面。
- 疑似责任角色：前端、测试。
- 建议修补方向：等待房间增加 `pendingFirstPhoto` 状态；非房主可看到“等待房主拍第一张照片”，房主看到“去拍第一张照片”；首拍后再跳记录页。

### UIUX-013-P3-11｜未注册旧页面仍保留旧品牌/旧玩法文案，存在回流风险

- 页面/路径：未注册页面目录，如 `restart-state`、`judge-wheel`、`session-rules` 等。
- 现象：静态扫描发现未注册旧页面仍包含“酒桌判官”“判官转盘”“惩罚卡”等旧文案；当前 `app.json` 未注册这些页面，未发现已注册页面静态直跳到未注册旧页面。
- 用户影响：当前线上风险低；但后续如恢复路由、后台配置动态跳转、或误加 app.json，旧品牌和旧玩法会重新暴露。
- 严重级别：P3
- 证据来源：静态审核/待预览框复核；`miniprogram/app.json` 页面注册清单；旧目录静态扫描。
- 预期行为：旧页面应归档、删除、加技术注释，或统一做品牌文案迁移；至少保持未注册状态并纳入回归检查。
- 疑似责任角色：前端、PM。
- 建议修补方向：PM 开清理任务；前端确认旧目录是否仍需保留，若保留需加路由禁用说明。

## P0/P1 汇总

- P0：1 个
  - UIUX-013-P0-01：分享图无权限/被踢出状态仍可能展示记录内容。
- P1：4 个
  - UIUX-013-P1-02：相册“进行中”数量未严格遵守首拍规则。
  - UIUX-013-P1-03：账本独立页把任意 sessionId 当作可回到本局。
  - UIUX-013-P1-04：“照片审核通过后可推举/待审核”与当前 PRD 冲突，双审链路不可理解。
  - UIUX-013-P1-05：分享图页返回逻辑固定回首页，破坏来源上下文。

## 需要补证据/联调的事项

- 前端需补：分享图权限空态、相册进行中数量、账本首拍态、分享图来源返回、创建页高级设置、创建预设、等待房间首拍前状态的修补方案与预览框证据。
- 后端/API 需补：分享授权错误类型稳定返回；summary 是否带首拍/封面字段；推举资格原因码；被踢出/非成员状态是否保证不返回记录详情。
- 后台管理/UGC 风控需补：举报/反馈入口是否已有后台任务；照片/推举/榜单是否存在真实审核或双审流程；如存在需提供状态定义。
- 测试需补：微信开发者工具预览框路径证据，至少覆盖创建后返回、邀请后返回、首拍后进入记录、旧参与房间不拦截新建、相册进行中计数、账本首拍前状态、结束后分享、分享无权限/被踢出、我的进入分享图返回。

## PM 回报口径

- 文档路径：`docs/runtime/uiux-full-interaction-audit-20260623-2102.md`
- 问题数量：11 个
- 严重级别分布：P0 1 个，P1 4 个，P2 5 个，P3 1 个
- 当前状态：静态审核完成，待开发者工具预览框复核；不得标记正式通过。
- 最高优先级：先修分享图无权限/被踢出仍可能展示内容的问题，再修首拍态在相册/账本/等待房间里的不一致。
