# 酒桌判官精彩瞬间时间线后台管理开发计划

更新时间：2026-06-15

依据文档：

- `docs/gameplay-moments-development-spec.md`
- `docs/archive/gameplay-auction-moments-operation-plan.md`
- `docs/gameplay-moments-frontend-development-plan.md`
- `docs/gameplay-moments-backend-development-plan.md`
- `docs/admin-console-ia.md`

## 1. 后台管理职责边界

本计划只覆盖酒桌判官后台管理系统，不覆盖小程序页面实现、后端 moments 核心数据层、分享图渲染 worker、积分推举业务逻辑和线上部署。

后台管理开发目标：

- 新增精彩瞬间审核、举报处理、分享图任务监控、榜单奖励配置四类后台页面。
- 复用现有 `/admin/pages/:slug` 动态页协议、`heatwave-ops` 静态壳层和后台登录会话。
- 所有强审计操作必须调用后端动作接口，不用普通页面保存绕过理由、操作者和状态变更日志。
- 后台展示只读取后端计算后的 `completionStatus`、`reviewStatus`、`secondaryReviewStatus`、`rankingEligible`、`rewardEligible`，不在后台前端自行推导资格。
- 线上验证目标只能是 `api.pomer.cn`，不得改动、重启、部署或代理 `pomer.cn` 公司官网服务。

不属于本轮后台交付：

- 视频审核、视频转码、视频封面管理。
- 拍卖、反转事件、判官精选特权。
- 自由公开广场运营后台。
- 真实支付、现金打赏、财务结算。
- 独立 BI 系统或自定义报表引擎。

## 2. 当前后台承载点

| 类型 | 当前文件/接口 | 本轮处理方式 |
| --- | --- | --- |
| 后台页面入口 | `/admin/pages/:slug` | 继续复用，不新增独立后台框架 |
| 页面数据接口 | `GET /api/v1/admin/pages/:slug` | 新增 moments 相关 slug 的数据 schema |
| 页面保存接口 | `PUT /api/v1/admin/pages/:slug` | 仅用于奖励配置等低风险配置保存 |
| 强审计动作 | 待新增 `/api/v1/admin/moments/*`、`/api/v1/admin/share-image-tasks/*` | 审核、隐藏、要求重传、重试任务必须走动作接口 |
| 静态壳层 | `backend/public/admin/static/heatwave-ops/` | 新增页面 shell、导航项和必要交互组件 |
| 页面数据工厂 | `backend/data/admin.js` | 新增 pageMap 或转接后端 moments 数据层 |
| 操作日志 | `admin_operation_logs` / `system-operation-logs` | 扩展为内容审核、分享任务、奖励配置可追溯 |
| 既有商业化页 | `commerce-points`、`commerce-point-ledger` | 榜单奖励建议新增 `commerce-ranking-rewards`，不塞进每日任务配置 |

当前核查结论：

- 现有后台已有登录、动态页面、导航、基础上传、积分和操作日志展示能力。
- 本次 moments 相关 slug 已有代码证据：`content-moments-review`、`content-moment-reports`、`growth-share-tasks`、`commerce-ranking-rewards`。
- 后端动作接口、后台页面、本地 HTTP smoke、本地浏览器 E2E 和 UGC 风控口径已出现；后台仍不能假接生产数据，必须继续等待线上写操作窗口、真实样本、前台状态同步和测试/风控复核证据。

协作前置检查：

- 遇到依赖后端、前端、测试、风控或 PM 的任务时，必须先查看总控文档、前端计划、后端计划和进度台账，确认协作项是否已有实现和验证证据。
- 如果协作项未完成，后台只能先做 slug、导航、空态、字段 schema 和表单校验壳层；不得伪造审核数据、伪造任务状态或把强审计动作标记完成。
- 后台页面能否进入验收，必须以后端动作接口、操作日志和前端状态同步均完成为前提。
- 后台成员只能修改后台计划中的本人节点、交付记录和证据说明；不得直接修改总进度、前端/后端/测试节点或 PM 审核结论。
- 需要跨角色协作时，后台节点只能标记“待联调 / 阻塞 / 待复核”，并写明依赖的任务编号、角色和缺少证据；总进度由项目经理/Codex PM 验证后统一汇总。

## 3. 后台任务摘选

### M0 协作项：合同与数据底座

后台不是 M0 主责，但必须参与字段与审计合同确认。

| 任务编号 | 后台管理工作 | 依赖 | 输出 |
| --- | --- | --- | --- |
| `DEV-M0-01` | 复核 DDL 是否支持审核页、举报页、分享任务页、奖励配置页所需字段 | 后端/DBA | 字段缺口清单 |
| `DEV-M0-02` | 复核 `moments.js` 暴露给后台的数据读取和动作函数边界 | 后端/API | 后台数据 schema 确认 |
| `DEV-M0-03` | 复核 `docs/api-spec.md` 中 admin review、reports、share task、ranking rewards 接口 | 后端/API、前端 | 后台接口字段确认 |
| `DEV-M0-05` | 参与 smoke 结果复核，确认能产生待审核 moment、举报、失败分享任务测试数据 | 后端/测试 | 后台联调样本数据 |

M0 后台完成标准：

- 四个后台 slug 的字段、筛选项、动作入参、错误码和日志格式已写入 API 文档。
- 后端能提供至少一组本地样本：待二审 moment、私密占位 moment、举报记录、failed 分享图任务、奖励规则。
- 明确哪些页面只读、哪些页面可写、哪些操作必须填写原因。

### M4 主责项：审核与运营配置

| 任务编号 | 后台管理工作 | 后端依赖 | 输出 |
| --- | --- | --- | --- |
| `DEV-M4-01` | 新增 `content-moments-review`，支持瞬间审核、二审、隐藏、要求重传、移出榜单候选 | moment 列表与 review action 接口 | 页面、筛选、动作弹层、日志校验 |
| `DEV-M4-02` | 新增 `content-moment-reports`，支持举报查看、处理记录、下架状态 | moment report 数据与处理接口 | 举报列表、处理弹层、状态追踪 |
| `DEV-M4-03` | 新增 `growth-share-tasks`，支持分享图任务监控、失败原因、后台重试 | share task 列表与 retry 接口 | 任务表、重试动作、查看图/简报入口 |
| `DEV-M4-04` | 新增 `commerce-ranking-rewards`，支持榜单奖励阶梯配置 | ranking reward rules 读写接口 | 配置表单、阶梯校验、修改原因 |
| `DEV-M4-05` | 所有后台动作写入 `admin_operation_logs` 并能在 `system-operation-logs` 追溯 | 后端日志写入能力 | 日志展示字段与验证清单 |

M4 后台完成标准：

- 管理员可将一条已补全 moment 从待二审改为通过、隐藏、要求重传、移出榜单候选。
- 举报处理后，前台 timeline、brief、榜单资格立即受影响。
- 分享图失败任务可在后台查看失败原因并重试。
- 榜单奖励配置保存时必须填写修改原因，并可查到操作日志。
- 批量保存不能替代审核、隐藏、要求重传、重试等强审计动作。

### M5 协作项：榜单与积分推举

| 任务编号 | 后台管理工作 | 依赖 | 输出 |
| --- | --- | --- | --- |
| `DEV-M5-01` | 预留今日榜单运营查看入口和分类枚举 | 后端 rankings 接口、前端榜单页 | 后台只读榜单监控方案 |
| `DEV-M5-04` | 核对推举扣减、失败退款、下架退款是否进入积分流水 | 后端 commerce 扩展 | 流水追溯验收清单 |
| `DEV-M5-05` | 配合奖励发放 job 或 admin action，展示发放结果和失败原因 | 后端奖励发放能力 | 奖励发放日志与复核入口 |

M5 未满足前置条件时，后台只交付奖励配置，不开放手动发奖和推举干预。

## 4. 页面设计清单

### 4.1 `content-moments-review`

定位：内容运营审核台，用于处理公开传播和上榜前的 UGC 风险。

最小字段：

- 缩略图、文案、标签。
- 酒局名称、sessionId。
- 上传者昵称、profileId、OpenID。
- 节点类型：opening、highlight、private、closing。
- 可见范围和用途授权。
- 补全状态、审核状态、二审状态。
- `rankingEligible`、`rewardEligible`。
- 举报数、最近举报原因。
- 创建时间、更新时间。

筛选项：

- 节点类型。
- 补全状态。
- 审核状态。
- 二审状态。
- 是否可上榜。
- 是否有举报。
- 酒局 ID / 上传者 / 关键词。

动作：

- 通过一审/二审。
- 隐藏。
- 要求重传。
- 移出榜单候选。
- 查看所在酒局。
- 查看简报。

强制规则：

- 隐藏、要求重传、移出榜单候选必须填写原因。
- 不允许后台直接编辑用户正文和图片；只能改变审核状态和运营资格。
- 私密爆料默认不可上榜、不可公开分享，后台仅保留举报和下架能力。

### 4.2 `content-moment-reports`

定位：举报处理台，用于处理用户对 moment 的举报。

最小字段：

- 举报 ID、momentId、sessionId。
- 举报人、被举报上传者。
- 举报原因、补充说明、证据截图 URL。
- 被举报 moment 摘要。
- 当前处理状态。
- 处理人、处理时间、处理说明。

动作：

- 标记有效并隐藏内容。
- 标记无效并保留内容。
- 要求上传者重传。
- 移出榜单候选。
- 合并同 moment 重复举报。

强制规则：

- 处理结果必须写入操作日志。
- 举报处理不能泄露私密爆料正文给无权限管理员以外的普通页面。

### 4.3 `growth-share-tasks`

定位：增长与数据下的分享图任务监控页。

最小字段：

- taskId、briefId、sessionId。
- 状态：pending、processing、ready、failed、expired。
- layoutMode。
- 选中节点数、节点摘要。
- 生成耗时、重试次数。
- 失败原因。
- imageUrl。
- 创建时间、开始时间、完成时间。

筛选项：

- 状态。
- layoutMode。
- 是否失败。
- 酒局 ID / brief ID / task ID。
- 创建时间范围。

动作：

- 重试失败任务。
- 查看简报。
- 查看生成图。
- 复制图片 URL。

强制规则：

- 只有 failed/expired 且后端允许重试的任务显示重试入口。
- 重试必须调用后台动作接口并写日志。
- ready 图片仅展示后端返回的成品，不在后台重新筛选节点。

### 4.4 `commerce-ranking-rewards`

定位：商业化下的榜单积分阶梯奖励配置页。

配置字段：

- category：today_funny、today_debt、today_highlight、today_visual、best_opening、best_closing。
- enabled。
- tiers：rankStart、rankEnd、points。
- effectiveAt。
- reason。
- updatedBy、updatedAt。

校验规则：

- 阶梯名次区间不得重叠。
- `rankStart` 必须小于等于 `rankEnd`。
- 积分必须为非负整数。
- 保存必须填写修改原因。
- 配置保存后必须写操作日志。

## 5. 与其他开发人员的协作状态

截至 2026-06-15，根据 PM 台账、总控规格和当前仓库搜索，协作状态如下。后台成员仍只维护后台节点；跨角色完成态以 PM 汇总台账为准。

| 协作方 | 关键任务 | 当前状态 | 对后台影响 |
| --- | --- | --- | --- |
| 后端/API | `DEV-M0-01` DDL | 首轮已实现，待 MySQL 实连复核 | 后台字段可先按合同联调，数据库上线前仍需 DDL 验证 |
| 后端/API | `DEV-M0-02` moments 数据层 | 首轮已实现，待后台字段复核 | 审核、举报、分享任务已有数据源雏形，但后台动作仍待联调 |
| 后端/API | `DEV-M0-03` API 文档 | 首轮已实现，待前端/后台/测试复核 | 后台动作接口和错误码需继续对齐 |
| 后端/API | `DEV-M0-05` smoke 脚本 | 首轮已实现，待测试复跑固化 | 可作为后台联调样本来源，但仍需失败任务、举报、二审样本 |
| 前端 | `DEV-M0-04` services 类型 | 首轮已实现，待前端负责人复核 | 前台状态展示字段仍需共同复核 |
| 前端 | `DEV-M1-04` 私密爆料展示 | 代码证据已出现，待真机三用户联调 | 后台审核动作仍需验证不会泄露私密内容 |
| 前端 | `DEV-M2-04` 待补图入口 | 接口已预置，页面入口待联调 | 要求重传后的前台补图闭环未完成 |
| 前端 | `DEV-M3-04` 分享任务状态 | 组件已出现，个人页/历史页接入待联调 | 后台重试后前台状态提示待联调 |
| 测试/PM | DEV 台账审核 | 已启动，测试/联调人员已新增 | 所有后台任务完成后必须补任务编号、证据和验证结果 |

后台可提前做：

- 确定四个 slug、导航归属、页面字段和动作弹层。
- 给后端输出后台字段缺口清单。
- 准备静态 page shell、导航项和只读空态。
- 准备奖励配置表单校验逻辑。

后台不能提前标记完成：

- 真实审核动作。
- 举报处理闭环。
- 分享图任务重试。
- 操作日志追溯。
- 榜单奖励配置生效。

这些必须等后端数据层、动作接口和 smoke 样本完成后联调。当前后端/API 与后台壳层已具备部分线上联调条件，本地后台页面点击 E2E 已有复核证据；但后台页面仍不能标记完成，原因是缺少线上后台写操作窗口、真实举报样本、failed/expired 分享任务样本、线上操作日志复测和前台状态同步验证。

## 6. 实施顺序

### 阶段 A：合同确认

1. 和后端确认四个后台 slug 的 page schema。
2. 和后端确认强审计动作接口：
   - `POST /api/v1/admin/moments/:momentId/review`
   - `POST /api/v1/admin/moments/:momentId/require-resubmit`
   - `POST /api/v1/admin/share-image-tasks/:taskId/retry`
3. 和 PM 确认操作原因枚举、审核结果枚举和退回口径。
4. 和前端确认前台会如何展示 `hidden/rejected/require_resubmit`。

### 阶段 B：后台壳层与导航

1. 更新 `backend/public/admin/static/heatwave-ops/generate.js` 的 slugs。
2. 生成四个轻量页面 shell。
3. 更新 `manifest.json`。
4. 更新 `app.js` 导航：
   - 内容运营：`content-moments-review`、`content-moment-reports`
   - 增长与数据：`growth-share-tasks`
   - 商业化：`commerce-ranking-rewards`
5. 空数据时展示明确空态，不展示假审核结果。

### 阶段 C：动态页数据接入

1. 在 `backend/data/admin.js` 或后端 moments 模块中增加 pageMap 数据工厂。
2. `content-moments-review` 和 `content-moment-reports` 优先只读列表 + 动作按钮。
3. `growth-share-tasks` 优先只读监控 + retry action。
4. `commerce-ranking-rewards` 支持配置编辑和保存。
5. 所有列表保留分页、筛选和搜索能力，避免 UGC 增长后页面不可用。

### 阶段 D：强审计动作

1. 审核动作弹层必须收集 action、reason、targetId。
2. 调用后端动作接口后刷新当前 page 数据。
3. 请求失败时展示后端 message，不本地伪造成功状态。
4. 校验 `system-operation-logs` 能查到动作记录。
5. 与前端联调状态变化是否影响 timeline、brief、榜单入口。

### 阶段 E：M5 准备

1. 奖励规则配置稳定后，再配合后端做发奖 dry-run。
2. 推举、退款、奖励均能在 `commerce-point-ledger` 查到。
3. 不在 M4 阶段开放手动发奖入口。

## 7. 文件改动计划

预计涉及：

- `docs/gameplay-moments-admin-development-plan.md`
- `docs/api-spec.md`
- `docs/admin-console-ia.md`
- `backend/public/admin/static/heatwave-ops/generate.js`
- `backend/public/admin/static/heatwave-ops/manifest.json`
- `backend/public/admin/static/heatwave-ops/app.js`
- `backend/public/admin/static/heatwave-ops/*.html`
- `backend/data/admin.js`
- `backend/data/moments.js`
- `backend/server.js`
- `backend/sql/mysql-normalized-schema.sql`
- `backend/data/normalized-db.js`

实际开发时必须以任务编号拆提交，不能一次性混入 M0、M4、M5 全部改动。

## 8. 验收与验证

文档改动：

```powershell
npm.cmd run check:encoding
```

后台静态壳层改动：

```powershell
node --check backend/public/admin/static/heatwave-ops/generate.js
node --check backend/public/admin/static/heatwave-ops/app.js
npm.cmd run check:encoding
```

后台数据和路由改动：

```powershell
node --check backend/server.js
node --check backend/data/admin.js
node --check backend/data/moments.js
npm.cmd run check:encoding
```

接口联调：

```powershell
node backend/scripts/smoke-moments-flow.js
npm.cmd --prefix backend run smoke:admin-moments
```

后台页面验收：

- 登录后可打开四个新 slug。
- 空数据、加载失败、权限失败都有明确状态。
- 审核、隐藏、要求重传、重试、保存奖励配置均返回成功或明确错误。
- 操作日志可查到操作者、动作、目标、理由、时间。
- 前台 timeline、brief、个人页、分享任务状态能同步反映后台操作结果。

## 9. 交付记录格式

每个后台任务完成后，提交说明必须包含：

- 任务编号：例如 `DEV-M4-01`。
- 改动文件清单。
- 新增或变更后台 slug。
- 新增或变更动作接口。
- 操作日志字段和验证方式。
- 与后端/前端/测试的联调结论。
- 已执行验证命令和结果。
- 未验证事项和原因。
- 是否涉及 `api.pomer.cn` 线上验证。

## 10. 线上真实写操作 E2E 清单

本清单只用于准备 `api.pomer.cn` 后台真实写操作 E2E。当前阶段不得执行线上写操作，不得触碰 `pomer.cn` 公司官网；后台负责人只能维护后台计划中的本人节点和证据说明，不修改 PM 总台账或其他角色计划。

### 10.1 前置条件

线上后台写操作开始前，必须由 PM 确认以下条件全部满足：

| 前置项 | 责任角色 | 必须证据 | 未满足时后台状态 |
| --- | --- | --- | --- |
| 线上写操作窗口 | PM / 运维 | 明确时间窗口、目标服务为 `api.pomer.cn` / `jiuzhuopanguan-backend`、回滚或清理方式 | 阻塞 |
| 后台测试账号 | PM / 运维 / 接口联调 | 可登录 `/admin` 的测试账号、权限范围、会话有效期 | 阻塞 |
| 固定测试酒局 | 接口联调负责人 | `sessionId`、三用户身份、token 或可复用登录方式、清理策略 | 待联调 |
| 待审 moment | 接口联调负责人 | 至少 1 条 `complete + pending/pending` 且可公开审核的 moment | 待联调 |
| 举报样本 | 接口联调负责人 + UGC 风控 | 至少 1 条 pending report，含举报人、被举报 moment 和原因 | 待联调 |
| failed/expired 分享任务 | 接口联调负责人 | 至少 1 条 failed 或 expired share task，允许后台 retry | 待联调 |
| 榜单奖励候选 | 后端/API + 接口联调 | 至少 1 条符合 `complete + consent + approved + secondary approved + rankingEligible` 的榜单候选 | 待联调 |
| 风控口径签字 | UGC 风控负责人 | `UGC-QA-004`、`UGC-QA-005`、`UGC-QA-008` 执行人和验收结论 | 待复核 |
| 测试验收记录 | 测试负责人 | `QA-M4-001` 至 `QA-M4-007`、`QA-M5-005` 的记录模板和截图要求 | 待复核 |

### 10.2 页面与动作清单

| 任务 | 后台 slug / 页面路径 | 必须样本 | 操作按钮 / page action | 预期状态变化 | operationLogs 验收点 | 前台同步截图点 | 依赖 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `DEV-M4-01` | `content-moments-review` / `/admin/pages/content-moments-review` | 待审公开 moment；至少覆盖 pending、hidden 或 require_resubmit 对照行 | `approve`、`hide`、`reject`、`require_resubmit`、`remove_ranking` | `reviewStatus` / `secondaryReviewStatus` / `rankingEligible` / `rewardEligible` 按动作变化；不可用动作不展示 | 日志含操作者、动作、momentId、原因、旧状态、新状态、时间 | timeline 节点状态、session brief 节点状态、榜单入口资格、上传者待重传提示 | 接口联调提供样本；UGC 确认审核口径；测试记录截图 |
| `DEV-M4-02` | `content-moment-reports` / `/admin/pages/content-moment-reports` | pending 举报样本；被举报 moment 可被隐藏或保留 | `valid_hide`、`invalid_keep`、`require_resubmit`、`remove_ranking` | report 变 handled；moment 被隐藏、要求重传、移出榜单或保持公开 | 日志含操作者、动作、reportId、momentId、处理原因、结果 | timeline / brief 中涉事 moment 状态；举报处理后榜单资格；普通用户不可见敏感处理信息 | 接口联调提供举报；UGC 签字；测试复核前台同步 |
| `DEV-M4-03` | `growth-share-tasks` / `/admin/pages/growth-share-tasks` | failed 或 expired share task；同 brief 有可见 timeline 节点 | `retry` | `status` 变 `pending`，`retryCount` 增加，`failedReason` 清空或按后端返回更新；pending/ready 不显示 retry | 日志含操作者、taskId、旧状态、新状态、retry 原因、时间 | 个人页/历史页/分享海报页任务状态从失败转生成中；ready 后可预览/保存 | 接口联调提供 failed/expired 样本；测试复核前台任务状态 |
| `DEV-M4-04` | `commerce-ranking-rewards` / `/admin/pages/commerce-ranking-rewards` | 当前奖励配置；至少 1 个 category 的可编辑规则 | 保存奖励配置 | 奖励阶梯保存成功；名次不重叠、积分非负、必须填写 reason；页面刷新后配置仍在 | 日志含操作者、`commerce-ranking-rewards`、修改前后摘要、reason、时间 | M5 发奖前后读取同一配置；积分流水展示规则来源 | 后端确认 M5 发奖读取配置；测试确认配置校验 |
| `DEV-M4-05` | `system-operation-logs` / `/admin/pages/system-operation-logs` | 上述 M4 操作产生的日志 | 只读追溯 | 日志列表能按时间显示审核、举报、分享任务、奖励配置记录 | 每条日志能追到操作者、动作、目标、原因、时间、旧值/新值或 detail | 与对应前台状态截图一一对应 | 测试负责人提交日志截图；UGC 确认日志足够复核 |
| `DEV-M5-05` | `commerce-ranking-rewards` / `/admin/pages/commerce-ranking-rewards` | 已通过审核且符合榜单资格的候选；奖励配置已启用 | `grant` page action，例如 `/api/v1/admin/ranking-rewards/grant` | 符合条件的上传者获得 `ranking-reward` 积分；重复发放跳过；失败有错误或跳过说明 | 日志含操作者、category、date、granted/skipped/totalPoints；points ledger 和 rankingRewardPayouts 可追溯 | 榜单页奖励状态、积分流水、用户积分变化、重复发放提示 | 后端提供候选和幂等说明；测试执行 `QA-M5-005`；UGC 执行 `UGC-QA-008` |

### 10.3 样本依赖分工

| 样本 / 证据 | 先提供角色 | 后台使用方式 | 验收角色 |
| --- | --- | --- | --- |
| 进行中固定酒局、三用户、token / 账号说明 | 接口联调负责人 | 关联审核、举报、分享任务和前台同步截图 | 测试负责人 |
| 待审 moment、已隐藏 moment、要求重传 moment | 接口联调负责人 | 验证 `content-moments-review` row action 显隐和状态变化 | UGC 风控 + 测试 |
| pending 举报样本 | 接口联调负责人 | 验证 `content-moment-reports` 处理动作和日志 | UGC 风控 + 测试 |
| failed / expired share task | 接口联调负责人 | 验证后台 retry 和前台任务状态同步 | 测试负责人 |
| 榜单候选、推举记录、可退款记录 | 后端/API + 接口联调负责人 | 验证 `remove_ranking` 退款、`grant` 发奖和幂等 | UGC 风控 + 测试 |
| 审核、举报、发奖风控结论 | UGC 风控负责人 | 决定哪些动作可执行、哪些样本必须退回 | PM / 测试 |
| 页面点击录屏、operationLogs 截图、前台同步截图 | 测试负责人 | 作为后台任务能否准出的证据 | PM |

### 10.4 真实样本到位后的 E2E 执行顺序

> 本节仅描述线上窗口获批后的执行顺序；当前第三轮准备阶段不做线上写操作。

| 顺序 | 后台范围 | 执行动作 | 必须同步验收 | 依赖样本 / 签字 |
| --- | --- | --- | --- | --- |
| 0 | 环境与账号确认 | 只读打开 `/admin/login`、五个后台 slug 和固定样本；确认目标域名为 `api.pomer.cn`，不触碰 `pomer.cn` | 记录后台账号、执行人、窗口时间、样本清单版本 | 接口联调提供真实 ID；测试确认录屏设备；PM 确认写操作窗口 |
| 1 | 审核 `content-moments-review` | 对待审公开 moment 执行 `approve`；对风控样本分别执行 `hide`、`require_resubmit`、`remove_ranking`，每次填写 reason | 每个动作后检查行状态、`system-operation-logs`、timeline、session brief、rankings 资格和上传者提示 | `UGC-QA-004` 签字；测试录后台点击和前台同步 |
| 2 | 举报 `content-moment-reports` | 对 pending 举报执行 `valid_hide`；另用独立样本执行 `invalid_keep`、`require_resubmit` 或 `remove_ranking` | 举报变 handled；moment 状态符合口径；operationLogs 含 reportId / momentId / reason；前台不可泄露敏感处理信息 | `UGC-QA-005` 签字；接口联调提供 reportId 和被举报 momentId |
| 3 | 分享任务 retry `growth-share-tasks` | 对 failed / expired share task 执行 `retry` | task 状态回到 pending，retryCount 增加；operationLogs 可追溯；前台个人页、历史页或分享海报页状态同步 | 接口联调提供 `share-task-failed-20260615` 的真实 taskId；测试录前后台同步 |
| 4 | 奖励配置 `commerce-ranking-rewards` | 在约定 category 保存一次测试奖励配置，填写 reason，刷新确认持久化 | operationLogs 记录修改前后摘要；M5 发奖读取同一配置；非法名次或负积分仍被拦截 | 后端确认 M5 读取规则；测试记录保存、刷新、校验失败截图 |
| 5 | 发奖 `commerce-ranking-rewards` page action | 对已满足榜单资格的 category/date 执行一次 `grant`；随后再次执行验证幂等跳过 | points ledger、rankingRewardPayouts、用户积分、榜单奖励状态和 operationLogs 一致；重复发放必须 skipped | `UGC-QA-008` 签字；测试执行 `QA-M5-005`；后端提供幂等说明 |
| 6 | operationLogs 总追溯 | 在 `system-operation-logs` 按时间核对审核、举报、retry、奖励配置、发奖日志 | 每条日志能追到操作者、动作、目标 ID、原因、旧值/新值或 detail、时间 | 测试提交日志截图；后台负责人核对动作清单无缺项 |
| 7 | 前台同步复核 | 按样本回看 timeline、session brief、rankings、个人页/历史页、积分流水 | 前台状态与后台最终状态一致；若延迟，记录接口响应和刷新时间 | 前端/测试提供真机截图或录屏；UGC 对敏感态展示签字 |

### 10.5 第三轮前置输入清单

| 责任角色 | 必须提供 | 后台等待原因 | 当前状态 |
| --- | --- | --- | --- |
| 接口联调负责人 | 固定酒局真实 `sessionId`；`it-host-20260615`、`it-member-a-20260615`、`it-member-b-20260615`、`it-outsider-20260615` 的 `profileId`、token 或可登录方式 | 后台动作后必须用同一批用户验证前台同步和权限边界 | 待提供 |
| 接口联调负责人 | 审核样本真实 `momentId`：待审公开、已隐藏、要求重传、可移出榜单、二审样本 `review-secondary-20260615` | 支撑 `DEV-M4-01` 全部 row action，不用同一条数据重复覆盖互斥动作 | 待提供 |
| 接口联调负责人 | 举报样本真实 `reportId` 和被举报 `momentId`，至少覆盖有效隐藏、无效保留、要求重传或移出榜单 | 支撑 `DEV-M4-02`，并避免举报处理污染审核样本 | 待提供 |
| 接口联调负责人 | 分享任务真实 `taskId`：`share-task-failed-20260615` 以及 expired 对照样本；对应 brief / timeline 节点 ID | 支撑 `DEV-M4-03` retry 和前台任务状态截图 | 待提供 |
| 接口联调负责人 + 后端/API | M5 样本真实 ID：榜单 item、nominationId、pointsLedgerId 或退款候选、rankingRewardPayoutId 或可生成它的 category/date、奖励 rule ID | 支撑 `DEV-M5-05` 发奖、重复发奖、积分流水和 payout 追溯 | 待提供 |
| 测试负责人 | 后台登录、审核、举报、retry、奖励配置、发奖、operationLogs 查询的连续录屏；前台 timeline / brief / rankings / 分享任务 / 积分流水同步录屏 | 作为后台线上写操作是否准出的验收证据 | 待录制 |
| UGC 风控负责人 | `UGC-QA-004` 审核动作、`UGC-QA-005` 举报处理、`UGC-QA-008` 奖励重复发放反例签字；如涉及分享图与退款，同步签 `UGC-QA-003`、`UGC-QA-007` | 后台只能按已签字口径执行写操作，不能自行判断敏感态或惩罚性动作 | 待签字 |

### 10.6 线上窗口到位后第一小时安排

| 时间段 | 后台动作 | 输出物 | 停止条件 |
| --- | --- | --- | --- |
| 0-10 分钟 | 确认目标为 `api.pomer.cn` 酒桌判官后台；核对账号、窗口、样本 ID、录屏开启和回滚/清理约定 | 窗口开始记录、样本清单截图 | 任一样本 ID 缺失、账号权限不符或目标域名不一致即停止 |
| 10-20 分钟 | 只读打开五个 slug，确认样本可见、按钮显隐符合预期 | 页面初始截图、样本行截图 | 样本不可见、按钮与状态不符或 operationLogs 页面不可访问即停止 |
| 20-35 分钟 | 执行审核与举报写操作，每个动作后立即查日志和前台同步 | 审核/举报录屏、日志截图、前台同步截图 | UGC 口径不明、日志缺关键字段或前台出现越权展示即停止 |
| 35-45 分钟 | 执行分享任务 retry 和奖励配置保存 | retry 录屏、配置保存录屏、日志截图 | retry 状态未变、配置刷新丢失或日志缺 reason 即停止 |
| 45-55 分钟 | 在 PM 允许 M5 同窗时执行发奖和重复发奖；否则只做发奖前只读核对 | 发奖/重复发奖录屏、points ledger、payout、日志截图 | 未获 PM M5 写授权、幂等说明缺失或积分流水不可查即停止 |
| 55-60 分钟 | 汇总 operationLogs 与前台同步证据，列出失败项和待补证据 | 后台首小时执行记录、阻塞清单、下一轮补跑清单 | 不做未授权清理，不继续扩大写操作范围 |

### 10.7 本地 smoke 记录

| 时间 | 范围 | 结论 | 证据 | 未验证 |
| --- | --- | --- | --- | --- |
| 2026-06-15 | 本地后台强审计 smoke | 通过，可作为线上 E2E 前的本地回归证据 | `pwsh` 版本为 `7.6.2`；`npm.cmd --prefix backend run smoke:admin-moments` 输出 `ok:true`、`reviewMomentId=admin-smoke-review-1781502438105`、`reportId=admin-smoke-report-1781502438105`、`shareTaskId=admin-smoke-task-1781502438105`、`retriedTaskStatus=pending`、`operationLogCount=4`、`operationLogPageRows=14` | 未做线上后台写操作；未验证真实样本；未验证前台同步截图；命令存在既有 Node `DEP0169 url.parse()` 弃用警告 |

### 10.8 当前 `INT-DATA-001` manifest 后台 E2E 样本可执行性复核

记录时间：2026-06-15。复核范围仅限后台管理执行可行性判断；不执行线上写操作，不重启服务，不修改 PM 总台账，不替接口联调、UGC 或测试标记完成。

当前 manifest 摘要：

| 类别 | 当前 ID | 后台判断 |
| --- | --- | --- |
| 固定酒局 | `session-1781507687012-e4343d` | 可用于后台动作后的前台同步定位；真机截图仍依赖测试/前端 |
| 待审候选 | `highlightId=moment-1781507687034-93c8676b`，状态 `pending/pending`；`reviewMomentId` 字段为空 | 可作为 `DEV-M4-01` 候选复核对象，但需接口联调确认该 highlight 是否允许后台审核写操作；不能因 `reviewMomentId` 为空直接写 M4 可通过 |
| 举报样本 | `reportId=moment-report-it-moments-20260615` | 可用于 `content-moment-reports` 只读定位；真实处理必须等后台账号、写窗口、UGC 口径和测试录屏 |
| 分享任务 | pending `share-task-1781507687044-805585b3`；ready `share-task-1781507687046-d1098582`；failed `share-task-1781507687115-e4df874c`；expired `share-task-it-moments-20260615-expired` | 四态样本已足够做本地/只读状态复核；后台 retry 写操作只能在授权窗口对 failed/expired 执行 |
| M5 榜单/发奖 | category `best_opening`；ranking item `moment-1781507687032-eb1806a4`；nomination `nomination-1781507687124-4ad71db9`；reward payout `ranking-reward-payout-1781507687129-1ea46263`；`pointsLedgerIds=[]` | 可只读核对候选、payout 和发奖入口；发奖/重复发奖仍缺 points ledger 证据、线上写窗口和 UGC-QA-008 签字 |

| 任务 | 后台 slug | 当前可执行范围 | 当前阻塞点 | 下一步责任 |
| --- | --- | --- | --- | --- |
| `DEV-M4-01` | `content-moments-review` | 可本地复跑 smoke；可在后台页面只读定位 `highlightId=moment-1781507687034-93c8676b` 和按钮显隐 | `reviewMomentId` 为空；线上后台账号、写操作窗口、operationLogs 截图、timeline / brief / rankings 前台同步截图缺失；UGC-QA-004 未基于真实样本签字 | 接口联调确认 highlight 是否就是审核写样本并补 `reviewMomentId` 映射；PM/运维给后台账号和写窗口；测试录审核动作与前台同步；UGC 签 `UGC-QA-004` |
| `DEV-M4-02` | `content-moment-reports` | 可本地复跑 smoke；可只读定位 `reportId=moment-report-it-moments-20260615` | 不能处理举报；缺线上写窗口、处理前后 report/moment 响应、operationLogs、前台同步截图；UGC-QA-005 未签 | PM/运维给写窗口；测试录举报处理和日志；接口联调确认 report 关联 moment 与可处理状态；UGC 签 `UGC-QA-005` |
| `DEV-M4-03` | `growth-share-tasks` | 可只读复核 pending/ready/failed/expired 四态；failed/expired 样本已满足 retry 候选条件 | 后台 retry 是写操作，当前不能执行；缺 retry 后 operationLogs、任务状态变化和个人页/历史页/分享海报前台同步截图 | PM 授权低风险 retry 窗口；测试录 retry 和前台状态；接口联调保持四态样本可查 |
| `DEV-M4-04` | `commerce-ranking-rewards` | 可本地复跑奖励配置 smoke；可只读打开页面和现有规则 | 保存配置是写操作；缺线上后台账号、可改测试规则、保存前后 operationLogs、M5 读取同一配置证据 | PM/运维给后台账号与配置写窗口；后端说明可改 category / rule；测试录保存、刷新和校验失败截图 |
| `DEV-M4-05` | `system-operation-logs` | 可只读打开日志页；可本地 smoke 验证日志字段；线上只能查看既有日志 | 当前 manifest `admin.operationLogIds=[]`；没有本轮线上写动作产生的审核/举报/retry/奖励配置/发奖日志；缺日志与前台截图一一对应证据 | 后台在授权窗口执行动作后提供 operationLogId；测试截图日志页；UGC 复核日志字段足够追责 |
| `DEV-M5-05` | `commerce-ranking-rewards` | 可只读核对 `best_opening`、ranking item、nomination、reward payout 和发奖 page action 是否可见 | 发奖和重复发奖是高风险写操作；`pointsLedgerIds=[]`，缺积分流水；缺 rankingRewardPayouts 跳过记录、operationLogs、前台积分/榜单同步；UGC-QA-008 未签 | PM 单独授权 M5 发奖窗口；后端/API 提供幂等与 ledger 查询口径；测试录两次发奖、ledger、payout 和前台积分；UGC 签 `UGC-QA-008` |

当前后台结论：`INT-DATA-001` 已把后台从“缺全部真实样本”推进到“可做本地/只读复核，部分写操作候选样本可定位”。但 DBA/运维已确认当前不具备部署准入，测试真机仍阻塞；因此 `DEV-M4-01` 至 `DEV-M4-05`、`DEV-M5-05` 仍不能标记完成，只能保持待联调 / 待复核。

### 10.9 线上后台写操作窗口执行单

记录时间：2026-06-15。依据 `DEPLOY-AUTH-001`、接口联调 3.4 样本快照和本计划 10.8。当前仍缺后台账号、写操作窗口和 PM 授权；本节只作为授权后的执行单，不代表已经执行或通过。

执行总闸口：

| 闸口 | 必须确认 | 未满足时处理 |
| --- | --- | --- |
| 目标环境 | 只允许 `https://api.pomer.cn/admin` / `https://api.pomer.cn/api/v1`，不得触碰 `pomer.cn` | 立即停止，退回 PM / DBA 运维 |
| 授权范围 | PM 明确窗口时间、执行人、允许 slug/action、是否允许 M5 发奖/重复发奖 | 未授权 action 一律只读准备 |
| 后台账号 | 后台测试账号或 session 可登录；测试负责人已开始录屏 | 登录失败或权限不足时退回 PM / DBA 运维 |
| 样本版本 | 使用接口联调 3.4 latest manifest，session `session-1781507687012-e4343d`，不得混用旧 ID | 样本不可查时退回接口联调 |
| 证据采集 | 测试已准备后台录屏、原因弹窗截图、operationLogs 截图、前台同步截图命名 | 证据采集未就绪时不执行写操作 |
| UGC 口径 | `UGC-QA-004`、`UGC-QA-005`、`UGC-QA-008` 已确认本次允许动作和退回条件 | 口径不明时只读，不执行强审计动作 |

| 任务 | slug / 页面 | 样本 ID | 动作 | 是否写操作 | 执行前确认 | 必须录屏 / 截图 | operationLogs 查询 | 前台同步检查 | 失败退回对象 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `DEV-M4-01` | `content-moments-review` / `/admin/pages/content-moments-review` | `highlightId=moment-1781507687034-93c8676b`，替代空 `reviewMomentId`；如 PM 要求 dedicated 样本，等接口联调补 | 只读打开样本行、核对按钮显隐 | 否 | 样本为 `pending/pending`；按钮只对可执行状态展示 | 页面列表、详情或行截图；按钮显隐截图 | 不要求新增日志 | 无前台状态变化 | 样本不可见退回接口联调；按钮显隐异常退回后台 |
| `DEV-M4-01` | `content-moments-review` | 同上；如需覆盖 `hide` / `require_resubmit` / `remove_ranking`，必须使用独立样本 | `approve` 或 PM 指定的单一低风险审核动作，填写 reason | 是 | PM 授权该 action；UGC-QA-004 允许；测试录屏已开启；不得用同一条样本连续覆盖互斥动作 | 后台点击全程录屏；原因弹窗截图；动作前后行状态截图；action 响应摘要 | 在 `system-operation-logs` 以 momentId / action / 时间查询；截图需含操作者、动作、目标、原因、旧值/新值或 detail | timeline、session brief、rankings 资格、上传者状态截图；如 remove_ranking 涉及退款，还需 points ledger | 日志缺失退回后端/API；状态不同步退回前端/后端；口径争议退回 UGC；样本错误退回接口联调 |
| `DEV-M4-02` | `content-moment-reports` / `/admin/pages/content-moment-reports` | `reportId=moment-report-it-moments-20260615` | 只读打开举报行，核对关联 moment 与可处理动作 | 否 | report 未被处理或状态符合接口联调说明 | 举报列表、详情、动作按钮截图 | 不要求新增日志 | 无前台状态变化 | report 不可见或已被处理退回接口联调 |
| `DEV-M4-02` | `content-moment-reports` | 同上；四类动作需独立 report 或 PM 确认可重复恢复 | `valid_hide` / `invalid_keep` / `require_resubmit` / `remove_ranking` 中 PM 授权的一项，填写 reason | 是 | PM 授权举报处理；UGC-QA-005 允许；已确认动作不会污染其他验收样本 | 后台处理全程录屏；原因弹窗截图；处理前后 report/moment 状态截图；action 响应摘要 | 按 reportId / momentId / action 查询日志；截图含操作者、处理原因、结果和时间 | timeline / brief 中涉事 moment 状态；rankings 资格；普通用户不得看到敏感处理信息；如 remove_ranking 涉及退款，补 ledger | 举报状态错误退回后端/API；前台仍公开或误下架退回前端/后端；退款缺失退回后端/API；口径争议退回 UGC |
| `DEV-M4-03` | `growth-share-tasks` / `/admin/pages/growth-share-tasks` | pending `share-task-1781507687044-805585b3`；ready `share-task-1781507687046-d1098582`；failed `share-task-1781507687115-e4df874c`；expired `share-task-it-moments-20260615-expired` | 只读核对四态、失败原因、retry 按钮显隐 | 否 | failed / expired 才应展示 retry；pending / ready 不应展示 retry | 四态任务行截图；ready PNG 链接或预览截图 | 不要求新增日志 | ready PNG、分享任务状态页面或接口摘要 | 四态不可查退回接口联调；按钮显隐异常退回后台 |
| `DEV-M4-03` | `growth-share-tasks` | failed `share-task-1781507687115-e4df874c` 或 expired `share-task-it-moments-20260615-expired` | `retry`，填写 reason | 是 | PM 授权低风险 retry；测试已准备前台分享任务状态截图；确认不对 pending/ready 执行 retry | retry 点击录屏；动作前后任务状态截图；action 响应摘要 | 按 taskId / retry / 时间查询日志；截图含旧状态、新状态、retryCount、原因 | 个人页、历史页或分享海报页状态由 failed/expired 转 pending/生成中；后续 ready 时补预览/保存截图 | retry 状态未变退回后端/API；前台不同步退回前端；日志缺字段退回后端/API |
| `DEV-M4-04` | `commerce-ranking-rewards` / `/admin/pages/commerce-ranking-rewards` | 当前线上奖励规则；优先 PM 指定测试 category/rule；M5 category `best_opening` 只读可核对 | 只读打开配置，核对规则、page action 和校验提示 | 否 | 确认可读配置不触发保存；确认 M5 发奖按钮是否可见但不点击 | 配置页截图、规则快照、按钮显隐截图 | 不要求新增日志 | 无前台状态变化 | 规则不可查退回后端/API；页面异常退回后台 |
| `DEV-M4-04` | `commerce-ranking-rewards` | PM 指定可改测试 rule / category | 保存奖励配置，填写 reason | 是 | PM 明确允许改哪条规则；后端说明 M5 读取该配置；测试记录保存前后值 | 保存前后录屏；原因弹窗截图；刷新后规则仍在截图；非法名次/负积分校验截图 | 按 `commerce-ranking-rewards` / action / 时间查询日志；截图含修改前后摘要、reason、操作者 | M5 发奖前读取同一配置；如前台展示规则来源，补积分流水或奖励说明截图 | 保存丢失退回后端/API；页面反馈异常退回后台；规则影响不明退回 PM/后端 |
| `DEV-M4-05` | `system-operation-logs` / `/admin/pages/system-operation-logs` | 本窗口产生的 momentId / reportId / taskId / ruleId / category / payoutId；当前 `admin.operationLogIds=[]` | 只读查询和导出截图 | 否 | 上述写操作至少已完成一项；记录目标 ID 与执行时间 | 日志页筛选、列表、详情截图；与动作录屏时间对应 | 逐条核对操作者、动作、目标、原因、时间、旧值/新值或 detail | 与每个前台同步截图建立一一对应索引 | 查不到日志退回后端/API；字段不足退回后端/API / UGC；截图缺失退回测试 |
| `DEV-M5-05` | `commerce-ranking-rewards` | category `best_opening`；ranking item `moment-1781507687032-eb1806a4`；nomination `nomination-1781507687124-4ad71db9`；payout `ranking-reward-payout-1781507687129-1ea46263`；`pointsLedgerIds=[]` | 只读核对发奖候选、既有 payout、按钮显隐 | 否 | PM 未授权 M5 时只读；确认 points ledger 缺口仍存在 | 发奖区、候选、payout 截图；按钮显隐截图 | 不要求新增日志 | 榜单页奖励状态只读截图可准备 | 候选或 payout 不可查退回接口联调/后端 |
| `DEV-M5-05` | `commerce-ranking-rewards` | 同上；如 PM 指定新的 category/date，以 PM 授权为准 | `grant` 发奖一次；如 PM 明确允许，再重复触发一次验证 skipped | 是，高风险 | PM 单独授权 M5 发奖/重复发奖；后端/API 给幂等与 ledger 查询口径；UGC-QA-008 允许；测试准备两次发奖录屏 | 发奖按钮录屏；第一次响应；第二次 skipped 响应；失败/无可发对象反馈截图 | 按 category/date/action 查询发奖日志；截图含 granted/skipped/totalPoints；关联 payoutId | points ledger、rankingRewardPayouts、用户积分变化、榜单奖励状态、重复发放提示 | 重复加积分退回后端/API P0；缺 ledger 退回后端/API；前台积分不同步退回前端/后端；无反馈退回后台 |

执行后交付包：

| 证据类型 | 命名 / 内容要求 | 责任人 |
| --- | --- | --- |
| 后台录屏 | `QA-DEV-M4-<action>-admin-desktop-<targetId>-20260615.mp4`；必须包含页面、按钮、原因、提交、结果 | 测试负责人录屏，后台负责人执行或旁路确认 |
| operationLogs 截图 | `QA-DEV-M4-05-operation-logs-<action>-admin-desktop-<targetId>-20260615.png`；必须能追到操作者、动作、目标、原因、时间 | 测试负责人截图，后台负责人核对字段 |
| 前台同步截图 | timeline / brief / rankings / share task / points ledger / user points，文件名需含角色、设备和 targetId | 测试负责人，前端配合 |
| API / 数据摘要 | report/moment/task/payout/ledger 响应摘要；M5 必须含 points ledger 和 rankingRewardPayouts | 后端/API、接口联调、测试 |
| UGC 签字 | `UGC-QA-004`、`UGC-QA-005`、`UGC-QA-008` 根据真实证据签通过或退回；不得用本地 smoke 代替 | UGC 风控负责人 |

### 10.10 `PR-ADMIN-ONLINE-ACTION-E2E-003` 线上后台 action E2E 执行记录

记录时间：2026-06-16。目标仅为 `https://api.pomer.cn` 对应酒桌判官 / 聚会记录师后台和数据；未触碰 `pomer.cn` 公司官网、官网 PM2、官网 Nginx block、官网目录或无关项目。执行方式为后台 API E2E，证据路径：`docs/runtime/pr-admin-online-action-e2e-003-1781582834621.json`。

| 项目 | 记录 |
| --- | --- |
| 后台入口 | `https://api.pomer.cn/admin/login`；登录接口 `POST https://api.pomer.cn/api/v1/admin/auth/login` |
| 后台账号 | `admin`，登录返回用户 `系统管理员 / 超级管理员`；session cookie 已在证据中脱敏为 `jiuzhuopanguan_admin_session=<redacted>` |
| 执行窗口 | 2026-06-16 12:07 左右，北京时间 |
| 证据形态 | API 前后快照、operationLogs 页面数据快照；当前未采集浏览器录屏，需测试负责人补页面级录屏 / 截图 |
| 回滚 / 清理方式 | 榜单奖励配置临时改动已通过 `PUT /api/v1/admin/pages/commerce-ranking-rewards` 写回原始集合；审核状态动作保留为线上测试证据，后续如需清理需接口联调/后端按样本 ID 定向处理 |

| 范围 | 样本 ID / 目标 | 动作 | 结果 | operationLogs / 同步证据 | 回滚或清理 |
| --- | --- | --- | --- | --- | --- |
| `DEV-M4-01` 审核通过 | `moment-1781549804535-b8b389b0`，caption `今晚开场，先留证` | `POST /api/v1/admin/moments/:id/review`，`action=approve`，reason `PR-ADMIN-ONLINE-ACTION-E2E-003 approve smoke` | 成功；状态 `pending/pending -> approved/approved` | `system-operation-logs` 出现 `审核精彩瞬间：approve`，日志时间 `2026-06-16T04:07:11.602Z`；前台真机同步截图未采集 | 保留为测试证据；如需恢复只能由后端/API 按样本 ID 定向处理 |
| `DEV-M4-01` 隐藏 | `moment-1781540671054-90a9122f`，caption `恶意我` | `POST /api/v1/admin/moments/:id/review`，`action=hide`，reason `PR-ADMIN-ONLINE-ACTION-E2E-003 hide smoke` | 成功；状态 `pending/pending -> hidden/pending`，`rankingEligible=false` | `system-operation-logs` 出现 `审核精彩瞬间：hide`，日志时间 `2026-06-16T04:07:11.652Z`；前台相册/时间线同步截图未采集 | 保留为测试证据；如需恢复需后端/API 定向处理 |
| `DEV-M4-01` 要求重传 | `moment-1781549829409-b3aece35`，caption `刚刚这一刻，值得留在时间线` | `POST /api/v1/admin/moments/:id/require-resubmit`，reason `PR-ADMIN-ONLINE-ACTION-E2E-003 require resubmit smoke` | 成功；状态 `pending/pending -> pending/require_resubmit`，`completionStatus=needs_media` | `system-operation-logs` 出现 `审核精彩瞬间：require_resubmit`，日志时间 `2026-06-16T04:07:11.706Z`；上传者前台重传提示未截图 | 保留为测试证据；如需恢复需后端/API 定向处理 |
| `DEV-M4-02` 举报处理 | `content-moment-reports` | 计划执行 `valid_hide`，但先查列表 | 阻塞；线上举报列表为 0，无可处理 report 样本 | 无新增 operationLogs；不能伪造举报处理通过 | 需要接口联调/UGC 补线上举报样本 |
| `DEV-M4-03` 分享任务 retry | `growth-share-tasks` 当前 4 条：2 条 pending、1 条 ready、1 条 pending；无 failed/expired | 计划执行 `retry`，但只允许 failed/expired | 阻塞；当前无可重试样本，未对 pending/ready 强行 retry | 无新增 operationLogs；只记录四态缺口 | 需要接口联调/后端补 failed 或 expired share task |
| `DEV-M4-04` 榜单奖励配置 | `reward-rule-best-opening-1` | 临时 `points 60 -> 61`，reason `PR-ADMIN-ONLINE-ACTION-E2E-003 temp config save`；随后写回原始集合 | 成功；保存接口可写，随后回滚到 `points=60`、reason `初始榜单奖励配置`；`updatedAt` 因写回刷新为本次时间 | `system-operation-logs` 出现两条 `保存榜单奖励配置`，时间约 `2026-06-16T04:07:11.811Z` 和 `2026-06-16T04:07:11.837Z` | 配置值已恢复；operationLogs 保留为测试证据 |
| `DEV-M5-05` 榜单奖励发奖 | `POST /api/v1/admin/ranking-rewards/grant`，category `best_opening`，limit `20` | 尝试发奖 | 失败；接口返回 500：`grantRankingRewardsByAdmin is not a function` | 未形成发奖成功日志；线上 `best_opening` 榜单只读查询在执行前为空 | 退回后端/API 修复导出或部署版本；修复后后台复跑发奖/重复发奖 |

当前后台结论：

- 线上后台账号、审核 action、奖励配置保存、operationLogs 写入已得到真实 `api.pomer.cn` 证据。
- 举报处理、share task retry、M5 发奖仍不能写通过：分别缺 report 样本、缺 failed/expired share task、发奖接口 500。
- 前台同步截图/录屏仍缺，后台本轮只记录 API / 日志级证据；测试负责人需基于上述样本 ID 补 timeline、相册/照片墙、分享任务、积分/榜单截图。
- `pomer.cn` 官网项目未触碰。

### 10.11 `PR-ADMIN-ONLINE-ACTION-FOLLOWUP-004` 后台 action E2E follow-up 等待项

记录时间：2026-06-16。上一轮 `PR-ADMIN-ONLINE-ACTION-E2E-003` 只能证明 `approve`、`hide`、`require_resubmit`、奖励配置临时保存与回滚、operationLogs 写入在 `api.pomer.cn` 上有部分真实证据；不能写成 `DEV-M4-01` 至 `DEV-M5-05` 全量后台通过。本节仅补后台管理职责内的等待项、复跑条件和证据格式，不改 PM 总台账，不触碰 `pomer.cn` 官网项目。

| 范围 | 当前状态 | 等待对象 / 任务 | 到位后后台动作 | 复跑证据格式 | 回滚 / 清理方式 | 当前结论 |
| --- | --- | --- | --- | --- | --- | --- |
| `DEV-M4-02` 举报处理 | 线上 `content-moment-reports` 列表为 0，未执行举报处理写操作 | 接口联调补真实 `reportId`、关联 `momentId`、举报类型和允许动作；UGC 风控签 `UGC-QA-005` 可执行口径；测试准备前台同步录屏 | 在 `content-moment-reports` 只对接口联调指定 report 执行 PM 允许的 `valid_hide` / `invalid_keep` / `require_resubmit` / `remove_ranking` 之一，不复用已污染样本 | 后台页面录屏：列表、详情、原因弹窗、提交结果；处理前后 report/moment 状态截图；`system-operation-logs` 按 reportId / momentId / action 查询截图；前台 timeline / brief / 相册或榜单资格同步截图；失败时保留接口响应原文 | 举报处理动作默认保留为测试证据；如需恢复，由后端/API 按 reportId、momentId 和旧状态定向清理或补偿；后台不得自行伪造恢复 | 待联调；未通过 |
| `DEV-M4-03` share task retry | 线上 `growth-share-tasks` 当前只有 pending/ready/pending，无 failed/expired；未执行 retry | 接口联调补真实 failed 或 expired `taskId`、关联 brief/timeline 节点；后端确认 retry 后状态口径；测试准备分享任务前台状态截图 | 在 `growth-share-tasks` 只对 failed/expired 样本执行 `retry`，不得对 pending/ready 强行 retry | 后台页面录屏：任务行、失败原因、retry 按钮、提交结果；动作前后 task 状态、`retryCount`、`failedReason` 截图；operationLogs 按 taskId / retry / 时间查询截图；前台个人页、历史页或分享海报页状态同步截图；失败时保留 HTTP 状态码和响应体 | retry 后任务状态按后端队列口径保留；如需清理，由后端/API 提供任务重置或删除方式；后台只记录样本 ID 和结果 | 待联调；未通过 |
| `DEV-M5-05` 榜单奖励发放 | `POST /api/v1/admin/ranking-rewards/grant` 返回 500：`grantRankingRewardsByAdmin is not a function`；无成功 payout / ledger / 发奖日志 | 后端/API `PR-BE-ONLINE-REWARD-GRANT-FIX-004` 修复线上奖励发放函数导出或部署版本；接口联调补 category/date、候选 item、nomination、预期 payout / ledger 查询口径；UGC 签 `UGC-QA-008`；测试准备两次发奖录屏 | 修复后在 `commerce-ranking-rewards` 对 PM 指定 category/date 执行一次 `grant`；如 PM 明确允许，再执行第二次验证 skipped / 幂等 | 后台页面录屏：发奖按钮、确认、第一次响应、第二次 skipped 或失败反馈；operationLogs 按 category/date/action 查询截图，需含 granted/skipped/totalPoints；points ledger、rankingRewardPayouts、用户积分、榜单奖励状态截图；失败时保留完整 500 原文 | 如发生错误发奖或重复加积分，必须退回后端/API 按 ledgerId / payoutId 执行补偿或回滚；后台不得直接改积分流水 | 阻塞于后端 `PR-BE-ONLINE-REWARD-GRANT-FIX-004`；未通过 |
| `DEV-M4-05` operationLogs 汇总 | 已有审核和奖励配置日志；举报、retry、成功发奖日志缺失 | 等上述三类动作真实复跑成功后，测试补日志页截图；后端/API 补缺字段时给查询口径 | 只读核对 `system-operation-logs`，按 action、targetId、时间窗口建立截图索引 | 日志列表和详情截图；每条日志与后台录屏、前台截图一一对应；字段缺失时记录缺少操作者、动作、目标、原因、旧值/新值、时间中的哪一项 | operationLogs 不清理，作为审计证据保留 | 部分可核查；未闭环 |

复跑前置条件：

- 后端/API 完成 `PR-BE-ONLINE-REWARD-GRANT-FIX-004`，并给出线上修复证据、可复跑命令、发奖幂等和 ledger / payout 查询口径。
- 接口联调提供线上 report 样本和 failed/expired share task 样本，必须包含样本 ID、当前状态、允许动作、预期状态变化和清理方式。
- 测试负责人准备后台页面录屏、operationLogs 截图、前台同步截图命名规则，并覆盖失败原文采集。
- UGC 风控负责人对举报处理、隐藏、要求重传、榜单奖励相关反例矩阵签可执行或退回；不得用后台 action 成功替代风控通过。

复跑交付包要求：

| 证据类型 | 必填内容 |
| --- | --- |
| 后台页面截图 / 录屏 | 后台入口、账号角色、slug、样本 ID、动作按钮、原因输入、提交结果、刷新后状态 |
| operationLogs | 日志页筛选条件、操作者、动作、targetId、原因、旧状态 / 新状态或 detail、时间；与后台录屏时间对应 |
| 前台同步截图 | timeline / brief / 相册或照片墙 / 分享任务 / 榜单 / 积分页按动作对应截图，文件名包含样本 ID 和设备 |
| 失败原文 | HTTP 状态码、接口路径、请求动作、响应体、发生时间；500 或字段缺失必须退回后端/API |
| 回滚 / 清理方式 | 每个样本写明保留为证据、后端定向恢复、任务重置、积分补偿或不允许清理；不能只写“已处理” |

### 10.12 `PR-ADMIN-REWARD-RETEST-006` 榜单奖励发放页面复跑记录

记录时间：2026-06-16。PM 已回收后端/API 修复 `PR-BE-ONLINE-REWARD-GRANT-FIX-004`，后台管理按职责复跑 `api.pomer.cn` 后台奖励发放链路；未改 PM 总台账，未触碰 `pomer.cn` 官网项目、官网 PM2、官网 Nginx block、官网目录或无关项目。证据目录：`docs/runtime/pr-admin-reward-retest-006/`。

| 项目 | 记录 |
| --- | --- |
| 后台入口 | `https://api.pomer.cn/admin/login` |
| 后台账号 | `admin`，页面显示 `系统管理员`，API 登录返回超级管理员角色；证据不记录明文 session cookie |
| 后台页面 | `https://api.pomer.cn/admin/static/heatwave-ops/commerce-ranking-rewards.html`，slug `commerce-ranking-rewards` |
| 页面截图 | `docs/runtime/pr-admin-reward-retest-006/01-login-page.png`、`02-commerce-ranking-rewards-page.png`、`04-system-operation-logs-page.png` |
| API 证据 | `docs/runtime/pr-admin-reward-retest-006/api-retest-response.json` |
| 页面动作入口 | 页面数据接口返回 `grant-best_opening` 等 page action；当前 `heatwave-ops` 静态页面截图未渲染发奖按钮，仅渲染奖励规则新增/编辑按钮。本轮用后台登录态直调同一后台发奖 API 复跑，并用 operationLogs 页面截图核对结果。 |
| 发奖请求 | `POST /api/v1/admin/ranking-rewards/grant`，body `{"category":"best_opening","limit":20}` |
| 接口响应 | HTTP 200，`code=0`，`category=best_opening`，`date=2026-06-16`，`grantedCount=0`，`skippedCount=1`，`totalPoints=0`；item `momentId=moment-1781584503741-d53b131f`，`status=skipped`，`sourceId=ranking-reward:2026-06-16:best_opening:moment-1781584503741-d53b131f:reward-rule-best-opening-1` |
| operationLogs | `system-operation-logs` 页面截图显示最新 `发放榜单奖励`，targetId `ranking-rewards:best_opening:2026-06-16`，详情 `发放 0 条，跳过 1 条，合计 0 积分`，时间 `2026-06-16T04:37:30.823Z`；上一条为同 category 发放 1 条、合计 60 积分，说明本次复跑命中幂等跳过 |
| 回滚 / 清理 | 本次 `grantedCount=0`、`totalPoints=0`，未新增积分发放；operationLogs 作为审计证据保留，不清理。若后续发现重复发奖或积分异常，必须由后端/API 按 `sourceId`、ledgerId、payoutId 定向补偿，后台不得直接改积分流水。 |

当前后台结论：

- `DEV-M5-05` 的 500 阻塞已解除：发奖接口不再返回 `grantRankingRewardsByAdmin is not a function`，页面登录态下复跑返回 HTTP 200。
- 本轮只能证明“空发放 / 幂等跳过可成功返回并写 operationLogs”，不能证明奖励完整验收通过；仍缺有可发放候选时的 `grantedCount>0`、points ledger、rankingRewardPayouts、用户积分和前台榜单/积分同步截图。
- `commerce-ranking-rewards` 页面数据接口已有 page action，但当前静态页面截图未渲染发奖按钮；后台页面可用性仍需后台/前端补 UI 入口或说明操作入口。
- `DEV-M4-02` 举报处理和 `DEV-M4-03` failed/expired share task retry 仍等待接口联调 manifest 样本，不能因 M5 复跑成功而写通过。

### 10.13 `PR-ADMIN-REWARD-ACTION-ENTRY-007` 榜单发奖页面 action 入口缺口核查

记录时间：2026-06-16。状态：入口缺口核查中 / 待修复边界确认。本节只收口 `commerce-ranking-rewards` 页面未出现“发奖”按钮的问题，不把 `PR-ADMIN-REWARD-RETEST-006` 的接口 HTTP 200 写成后台按钮入口完成；未改 PM 总台账，未触碰 `pomer.cn` 官网项目。证据目录：`docs/runtime/pr-admin-reward-action-entry-007/`。

| 核查项 | 证据 / 结论 |
| --- | --- |
| 后台入口与账号 | `https://api.pomer.cn/admin/login`；账号 `admin`，登录返回 `系统管理员 / 超级管理员`，session cookie 脱敏 |
| 页面路径 | `https://api.pomer.cn/admin/static/heatwave-ops/commerce-ranking-rewards.html`，slug `commerce-ranking-rewards` |
| 页面截图 | `docs/runtime/pr-admin-reward-action-entry-007/01-commerce-ranking-rewards-no-grant-button.png`；截图只显示奖励规则、新增奖励规则、编辑按钮和 UI Kit，未显示 `发放最佳开场` 或其他发奖按钮 |
| DOM / 渲染摘要 | `docs/runtime/pr-admin-reward-action-entry-007/dom-render-summary.json`；`pageActionButtons=[]`，`toolbarText=UI Kit`，页面按钮列表只有导航、退出、新增奖励规则、编辑和分页 |
| action 字段摘要 | `docs/runtime/pr-admin-reward-action-entry-007/entry-gap-evidence.json`；`GET /api/v1/admin/pages/commerce-ranking-rewards` 返回 `actionCount=6`，包含 `grant-best_opening`，endpoint `/api/v1/admin/ranking-rewards/grant`，method `POST`，body `{"category":"best_opening"}` |
| 权限 / 登录态 | 同一账号可登录页面并可用后台登录态直调发奖 API；因此不是后台账号权限或登录态缺失导致按钮不可见 |
| 线上静态资源 | 线上 HTML 引用 `/admin/static/heatwave-ops/app.js?v=20260611-admin-pagination-2`；该线上 JS 检测结果：`hasRenderPageActions=false`、`hasPageActionButton=false`、`hasRunPageAction=false` |
| 本地静态实现 | 本地 `backend/public/admin/static/heatwave-ops/app.js` 已有 `renderPageActions()`、`runPageAction()` 和 `[data-action="page-action"]` 事件绑定；本地 HTML / 生成器已使用 `v=20260615-admin-action-dialogs` |
| 直接原因 | 线上静态后台资源仍是旧版本 `20260611-admin-pagination-2`，未同步包含 page action 渲染逻辑的 `heatwave-ops` 静态页 / app.js；页面数据接口有 action，但旧静态 JS 不消费 `pageActions`，所以按钮不出现 |
| 责任边界 | 后端 action 合同存在且可调用，权限/登录态可用；缺口归属线上静态后台资源版本 / 部署同步，需发布含 page action 渲染逻辑的后台静态页，或由后台静态页实现负责人确认并修复部署 |
| 测试边界 | 测试不能只走接口复测替代页面按钮入口验收；接口 200 和 operationLogs 只能作为 API 证据。页面按钮入口必须等静态页修复部署后重新截图 / 录屏 |

下一步等待：

- 后台静态页 / 部署负责人：同步或发布 `heatwave-ops` 当前版本静态资源，确保线上 HTML 引用包含 `renderPageActions` / `runPageAction` / `data-action="page-action"` 的 `app.js`。
- 后端/API：无需修改 action 合同；仅需在静态页修复后配合确认 `grant-best_opening` 等 action 仍按当前合同返回。
- 测试负责人：静态页修复后必须从页面按钮点击 `发放最佳开场` 或 PM 指定 category，录制按钮、确认弹窗、接口响应、operationLogs；修复前可保留接口复测证据，但不能写页面入口通过。

### 10.14 `PR-ADMIN-REWARD-PAGE-ACTION-RETEST-008` 榜单发奖页面按钮复测记录

记录时间：2026-06-16。初始状态：等待静态资源同步。前置依赖 DBA/运维完成 `PR-OPS-ADMIN-STATIC-ACTION-DEPLOY-008`，把线上 `heatwave-ops` 静态资源同步到包含 page action 渲染逻辑的版本。本节只验证后台页面按钮入口，不改 PM 总台账，不触碰 `pomer.cn` 官网项目。

等待项：

- DBA/运维：完成 `PR-OPS-ADMIN-STATIC-ACTION-DEPLOY-008`，并给出线上 `commerce-ranking-rewards.html` / `app.js` 版本、部署时间和回滚方式。
- 后台管理：运维同步后打开 `https://api.pomer.cn/admin/static/heatwave-ops/commerce-ranking-rewards.html`，确认 `grant-best_opening` 或等价发奖按钮是否渲染。
- 测试负责人：按钮出现后录制页面点击、确认弹窗、页面反馈、operationLogs；不能继续只用接口直调替代页面入口。

复测证据要求：

| 证据类型 | 必填内容 |
| --- | --- |
| 页面截图 / DOM | 后台账号、页面路径、静态资源版本、`grant-best_opening` 或等价发奖按钮、按钮 `data-action` / `data-page-action` 摘要 |
| 页面点击动作 | 从页面按钮点击发奖，包含确认弹窗、确认提交、页面成功或失败反馈 |
| 接口响应 | `category`、`date`、`grantedCount`、`skippedCount`、`totalPoints`、items / sourceId；若为空榜或幂等跳过，只能写空发放或 skipped 通过 |
| operationLogs | `发放榜单奖励` 日志，targetId、操作者、详情、时间与点击动作对应 |
| 边界说明 | 页面入口可单独判定是否闭环；奖励完整验收仍需正向发奖、points ledger、rankingRewardPayouts、用户积分、前台榜单 / 积分同步截图 |

复测结果：

| 核查项 | 结果 |
| --- | --- |
| 运维前置 | PM 回报 `PR-OPS-ADMIN-STATIC-ACTION-DEPLOY-008` 已完成；线上 HTML 已引用 `app.js?v=20260615-admin-action-dialogs` |
| 页面按钮 | 已看到 `grant-best_opening` 等 page action 按钮；`发放最佳开场` 可从页面 DOM 定位，截图：`docs/runtime/pr-admin-reward-page-action-retest-008/01-page-button-visible.png` |
| 页面点击 | 已从页面按钮触发 `grant-best_opening`，出现确认弹窗并点击 `确认执行`；确认弹窗截图：`docs/runtime/pr-admin-reward-page-action-retest-008/02-confirm-dialog.png` |
| 接口响应 | 页面点击触发 `POST /api/v1/admin/ranking-rewards/grant`，HTTP 200，`category=best_opening`，`date=2026-06-16`，`grantedCount=0`，`skippedCount=1`，`totalPoints=0`，item `momentId=moment-1781584503741-d53b131f`，`status=skipped`，`sourceId=ranking-reward:2026-06-16:best_opening:moment-1781584503741-d53b131f:reward-rule-best-opening-1` |
| 页面反馈 | 页面状态显示 `发放最佳开场已完成：发放 0 条，跳过 1 条`，截图：`docs/runtime/pr-admin-reward-page-action-retest-008/03-after-page-click-result.png` |
| operationLogs | `system-operation-logs` 有 `发放榜单奖励`，targetId `ranking-rewards:best_opening:2026-06-16`；截图：`docs/runtime/pr-admin-reward-page-action-retest-008/04-operation-logs-after-click.png` |
| 证据文件 | `docs/runtime/pr-admin-reward-page-action-retest-008/page-button-click-evidence.json`；初始等待证据 `waiting-static-sync-evidence.json` 已标记为被最终页面按钮复测证据覆盖 |

当前后台结论：

- `PR-ADMIN-REWARD-PAGE-ACTION-RETEST-008` 页面入口已闭环：线上静态资源同步后，`commerce-ranking-rewards` 页面可看到发奖按钮，并能从页面按钮触发 `grant-best_opening`。
- 本次仍是幂等跳过 / 空增量发放：`grantedCount=0`、`skippedCount=1`、`totalPoints=0`。只能证明页面入口、接口触发、页面反馈和 operationLogs 闭环，不能写成奖励完整验收通过。
- 奖励完整验收仍缺：有可发放候选时的 `grantedCount>0`、points ledger、rankingRewardPayouts、用户积分变化、前台榜单 / 积分同步截图。
- `DEV-M4-02` 举报处理和 `DEV-M4-03` failed/expired share task retry 仍等待接口联调 manifest 样本，不受本轮 M5 页面入口复测影响。

### 10.15 `PR-ADMIN-REWARD-009-VERIFY-011` 009 奖励 / 举报 / expired 样本后台复跑

记录时间：2026-06-16。依据接口联调 `PR-INT-REWARD-REPORT-EXPIRED-SAMPLES-009` 已补齐线上样本，本节只记录后台管理职责内复跑结果；不改 PM 总台账，不触碰 `pomer.cn` 官网项目，不替测试或 UGC 写通过。证据目录：`docs/runtime/pr-admin-reward-009-verify-011/`，证据文件：`docs/runtime/pr-admin-reward-009-verify-011/evidence.json`。

| 样本 | ID / 原态 | 后台动作 | 结果 | operationLogs / 证据 | 边界 |
| --- | --- | --- | --- | --- | --- |
| 正向发奖候选 | moment `moment-1781586554926-ffc93c65`；nomination `nomination-1781586678021-ca565a1c`；payout `ranking-reward-payout-1781586678028-9cad8832`；接口联调已记录该 payout `grantedCount=1`、`totalPoints=60` | 打开 `commerce-ranking-rewards`，从页面按钮点击 `发放最佳开场`，确认弹窗后提交 | HTTP 200；本次为重复发奖幂等结果：`grantedCount=0`、`skippedCount=2`、`totalPoints=0`；返回 item 包含 `moment-1781586554926-ffc93c65`，`status=skipped`，sourceId `ranking-reward:2026-06-16:best_opening:moment-1781586554926-ffc93c65:reward-rule-best-opening-1` | 截图：`01-reward-page-button-before.png`、`02-reward-confirm-dialog.png`、`03-reward-after-click.png`；operationLogs 有 `发放榜单奖励` | 后台页面按钮对 009 样本可触发且幂等跳过正常；本轮不能再次证明 `grantedCount>0`，正向发奖证据仍以接口联调 payout 和后端 ledger 查询口径为准 |
| 举报处理 | report `moment-report-it-moments-20260616-009`；原态 `pending / 待处理`；目标 moment `moment-1781584503795-17a32c27` | 打开 `content-moment-reports`，选择低破坏动作 `invalid_keep / 无效保留`，填写 reason `PR-ADMIN-REWARD-009-VERIFY-011 invalid keep evidence` 后提交 | HTTP 200；report 变 `handled`，`statusText=无效，保留内容`，`action=invalid_keep`；目标 moment 保持原状态，未隐藏、未要求重传、未移出榜单；refund `refundedCount=0` | 截图：`04-report-before-invalid-keep.png`、`05-report-reason-dialog.png`、`06-report-after-handle.png`；operationLogs 有 `处理精彩瞬间举报：invalid_keep`，targetId `moment-report-it-moments-20260616-009` | 只能证明后台举报处理入口可处理该样本；UGC 风控是否认可该处理口径仍需 UGC 签字，测试仍需前台可见性 / 普通用户敏感信息不可见截图 |
| expired share task retry | task `share-task-it-moments-20260616-009-expired`；执行前页面原态 `status=expired`、`retryCount=0` | 打开 `growth-share-tasks`，在记录 expired 原态后点击 `重试`，填写 reason `PR-ADMIN-REWARD-009-VERIFY-011 expired retry evidence` 后提交 | HTTP 200；task 变 `status=pending`、`retryCount=1`、`failedReason=''` | 截图：`07-expired-task-before-retry.png`、`08-expired-retry-reason-dialog.png`、`09-expired-task-after-retry.png`；operationLogs 有 `重试分享图任务`，targetId `share-task-it-moments-20260616-009-expired`，detail `状态 expired -> pending` | 该 expired 样本已被消费成 pending；后续不能再用它证明 expired 原态，需引用本节截图和 evidence 原态，或由接口联调另补 expired 样本 |

operationLogs 汇总截图：`docs/runtime/pr-admin-reward-009-verify-011/10-operation-logs-after-009-actions.png`。

当前后台结论：

- 009 奖励页面按钮、举报处理入口、expired retry 入口均已在 `api.pomer.cn` 后台页面完成复跑，并有页面截图、接口响应和 operationLogs。
- `DEV-M5-05` 的页面按钮与幂等发奖状态可判定后台入口闭环；正向发奖完整验收仍需结合接口联调已生成的 payout、后端/API ledger / payout / 用户积分查询，以及测试前台同步截图。
- `DEV-M4-02` 举报处理入口已能处理 009 report；但 UGC 风控签字和前台同步截图仍缺，后台不能写 UGC / 测试通过。
- `DEV-M4-03` expired retry 已执行成功；该样本已从 expired 消费为 pending，后续复核必须使用本轮原态截图或补新 expired 样本。
- 前台同步缺口：未录小程序榜单 / 积分页、举报处理后的普通用户可见性、分享任务状态变化截图；需测试负责人继续补证据。

本线程复核补充（2026-06-17）：已核对 `docs/runtime/pr-admin-reward-009-verify-011/evidence.json` 和 10 张截图文件。证据 JSON 可解析，截图均为有效 PNG；后台页面动作均记录为 HTTP 200。operationLogs 关键记录为：`admin-op-1781587214003-9a574e`（发放榜单奖励，跳过 2 条）、`admin-op-1781587217683-97e040`（处理举报 `invalid_keep`）、`admin-op-1781587221045-6a5c55`（expired 分享图任务 `expired -> pending`）。本线程未再次点击 retry 或发奖按钮，原因是 009 expired 样本已被本轮证据消费为 `pending/retryCount=1`，重复操作会破坏“执行前 expired 原态”证据链；后续如需再次复核 expired 原态，应由接口联调补新的 expired 样本。

## 11. 当前后台结论

后台管理已不再停留在纯计划阶段：四个 slug、后台静态页、动态 pageMap、M4 强审计动作接口、奖励配置壳层和 operationLogs 代码证据已经出现，并已随 `jiuzhuopanguan-backend` 部署到 `api.pomer.cn`。

本地后台 HTTP smoke 已通过：`npm.cmd --prefix backend run smoke:admin-moments` 覆盖后台登录态、`content-moments-review` 读取与审核、`content-moment-reports` 读取与举报处理、`growth-share-tasks` 读取与失败任务 retry、`commerce-ranking-rewards` 保存、operationLogs 写入和 `system-operation-logs` 页面追溯。本地浏览器页面点击 E2E 也已验证审核通过、举报隐藏、分享任务重试、奖励配置保存四类动作。UGC 风控口径已在 `docs/gameplay-moments-ugc-risk-control-plan.md` 确认。上述结果证明本地后台闭环可复核，但仍不能替代线上后台写操作窗口、真实运营样本、前台状态同步和 UGC 风控执行记录。

后台动作按钮已增加行状态显隐规则：审核按钮按 `reviewStatus` / `secondaryReviewStatus` / `rankingEligible` 展示，已隐藏内容不再暴露隐藏、要求重传或移出榜单动作；举报处理按钮仅对待处理举报展示，已处理举报显示无可用操作；分享图重试仅对 `failed` / `expired` 任务展示。后端动作接口仍保留强校验，前端显隐只负责降低运营误点概率。

可进入真实联调的后台工作：

- `content-moments-review`：用真实待审 moment 验证通过、隐藏、要求重传、移出榜单候选。
- `content-moment-reports`：用真实举报样本验证有效/无效/要求重传和状态同步。
- `growth-share-tasks`：用 failed/expired share task 验证后台 retry 和前台状态变化。
- `commerce-ranking-rewards`：验证奖励规则保存、校验、原因填写和操作日志。

仍必须等待协作完成后才能验收的工作：

- 线上后台登录态按钮 E2E。
- 真实样本下的操作日志线上复测。
- 前台 timeline、brief、历史页、分享任务状态同步。
- UGC 风控/内容审核负责人提交审核、举报、二审、隐藏、要求重传的真实样本复核记录和签字结论。
- 榜单奖励发放和推举干预。

所有开发必须继续遵守 `api.pomer.cn` 与 `pomer.cn` 的项目域名边界，不得把酒桌判官后台操作扩散到公司官网服务。

## 12. 聚会记录师后台配置影响评估

记录时间：2026-06-15。依据 `docs/party-recorder-redesign-requirements.md` 和当前后台计划。本文只评估后台管理职责范围内的配置、审核和运营入口影响；不执行线上写操作，不修改 PM 总台账，不替前端、后端、运营、UGC 或测试标记完成。

改版判断：产品前台权重从“酒桌判官 / 玩法 / 裁判 / 欠酒 / 积分榜”转向“聚会记录师 / 记录 / 相册 / 分享 / 回忆”。后台不应继续把玩法配置、榜单奖励、积分活动作为默认主路径；需要把“聚会模板、分享页、照片墙/相册审核、品牌文案”纳入配置影响清单。

| 影响项 | 当前后台承载 | 建议新增 / 调整 | 可只读准备 | 需要写操作窗口 | 依赖确认 |
| --- | --- | --- | --- | --- | --- |
| 聚会模板配置 | 旧后台已有模板/配置类能力，但当前 M4 计划重点在 moments 审核和奖励配置；创建流程仍受旧玩法模板影响 | 新增或调整 `party-template-config` 类配置页：默认聚会主题、默认房间名规则、精选 3 个模板、是否跳过玩法配置、默认权限 | 梳理现有模板字段、页面 slug、前端创建流程使用的配置 key；列出“玩法必填”相关旧配置 | 保存默认模板、调整启用/禁用、变更排序、修改默认文案都需要后台写窗口和 operationLogs | 前端确认三步创建需要哪些字段；后端确认快速创建 API 是否读取后台配置；运营确认默认模板和主题文案 |
| 分享页配置 | 现有 `growth-share-tasks` 监控分享图任务，偏任务状态和 retry；缺“分享页主配置” | 新增或调整 `party-share-page-config`：分享页标题、副标题、按钮文案、二维码/邀请文案、默认封面、是否展示照片墙入口 | 只读盘点现有分享图任务状态、ready PNG、分享页文案来源和静态资源路径 | 保存分享页文案、封面、默认分享样式、入口开关需要写窗口；需记录修改原因和日志 | 前端确认分享页组件和入口；后端确认配置读取接口；运营确认分享页主文案和活动口径；UI/UX 确认视觉样式 |
| 照片墙 / 相册审核 | 现有 `content-moments-review`、`content-moment-reports` 可审核 moment 和举报；定位仍是“精彩瞬间 / 榜单资格” | 调整审核语义为“照片墙 / 相册内容审核”：增加相册公开态、照片墙展示资格、分享页可见性、私密照片过滤提示 | 只读复核现有审核字段能否表达公开、隐藏、要求重传、移出分享/相册；列出需要改名的后台文案 | 执行审核、隐藏、要求重传、移出照片墙/分享页属于写操作，必须等后台账号和窗口 | UGC 确认相册/照片墙公开过滤口径；后端确认字段是否仍用 `reviewStatus` / `rankingEligible` 或需新增 album/share eligibility；前端确认前台同步点 |
| 旧玩法配置降权 | 当前文档仍有“酒桌判官、玩法、欠酒、判官、榜单奖励”等旧心智；后台商业化和增长页仍可能把积分/榜单放前 | 后台导航和配置页降权：玩法、积分、惩罚、榜单奖励从主路径降为高级/历史配置；默认不影响创建聚会 | 只读盘点后台页面 slug、导航分组、文案中旧词命中；列出需要隐藏、降级或重命名的配置项 | 修改后台导航、开关、默认启用状态、线上文案都需要写窗口；如涉及静态资源部署需 DBA/运维准入 | PM 确认哪些旧玩法保留为二级入口；运营确认旧活动是否继续；前端确认是否仍读取旧配置；后端确认禁用后兼容 |
| 品牌文案配置 | 当前后台计划和部分页面仍使用“酒桌判官 / 精彩瞬间 / 判官”等历史名 | 新增或统一 `brand-copy-config`：产品名“聚会记录师”、首页主 CTA、创建/邀请/拍照/相册/分享页文案、旧词替换表 | 只读扫描后台和配置文案来源；整理旧词清单：酒桌判官、判官、玩法、欠酒、惩罚、裁判、榜单 | 保存品牌文案、替换线上展示配置、发布静态后台资源需要写窗口和回滚方案 | PM/运营确认最终品牌词；UI/UX 确认语气和视觉；前端确认页面文案读取方式；后端确认配置接口 |

### 12.1 后台只读准备清单

| 准备项 | 产出 | 不需要写窗口的边界 |
| --- | --- | --- |
| 后台 slug 盘点 | 当前内容审核、举报、分享任务、奖励配置、系统日志、模板/品牌相关页面或配置接口清单 | 只读查看代码、文档和本地后台静态资源，不提交线上配置 |
| 旧文案命中清单 | 后台页面、配置 key、运营文案中的“酒桌判官 / 判官 / 玩法 / 欠酒 / 惩罚 / 裁判 / 榜单”命中位置 | 只列清单，不直接替换线上文案 |
| 配置字段草案 | 聚会模板、分享页、相册审核、品牌文案的字段建议和默认值来源 | 字段草案不等于后端 API 已支持 |
| 审核口径映射 | 将旧 moments 审核动作映射为照片墙/相册/分享页可见性动作 | 仅做口径映射，不执行审核 action |
| 证据需求表 | 后续改版后台验收需要的截图、operationLogs、前台同步点 | 不替测试/UGC 写通过 |

### 12.2 需要后台写操作窗口的项

| 写操作项 | 写入风险 | 窗口前置 |
| --- | --- | --- |
| 保存聚会模板默认配置 | 影响新建聚会默认主题、模板排序、是否跳过玩法配置 | PM 授权；前端/后端确认字段；运营给默认模板 |
| 保存分享页配置 | 影响邀请、分享页、二维码、封面和分享文案 | PM 授权；UI/UX/运营确认文案和视觉；后端确认配置读取 |
| 调整照片墙/相册审核状态 | 影响内容是否公开展示、进入分享页或相册 | PM 授权；UGC 口径；测试录屏；operationLogs；前台同步截图 |
| 降权或关闭旧玩法配置 | 可能影响旧用户路径、历史房间、积分/榜单入口 | PM 明确保留/降权范围；前端兼容方案；后端兜底 |
| 保存品牌文案配置 | 影响线上产品名和所有入口文案 | PM/运营最终文案；UI/UX 视觉方案；回滚方案 |

### 12.3 需要其他角色确认的配置项

| 角色 | 需要确认 | 后台等待结果 |
| --- | --- | --- |
| 前端负责人 | 三步创建读取哪些配置；首页、记录、相册、分享页是否从后台配置取文案/模板；照片墙/相册可见性前台同步点 | 配置 key、页面路径、截图点 |
| 后端/API 负责人 | 快速创建 API、模板配置读取、分享页配置读取、album/share eligibility 字段是否复用现有 moments 字段 | 接口合同、字段清单、默认值和兼容策略 |
| 运营 / PM | 聚会模板名称、默认主题、品牌文案、旧玩法降权范围、是否保留积分/榜单作为二级入口 | 可上线配置内容和禁用/保留清单 |
| UGC 风控负责人 | 照片墙/相册/分享页公开前过滤规则；私密照片、隐藏、待补图、未授权内容是否允许进入分享页 | 审核动作口径和退回条件 |
| UI/UX 负责人 | 聚会记录师视觉方向、分享页样式、模板卡片密度、品牌语气 | 配置展示形态和截图验收标准 |
| 测试/验收负责人 | 新版后台配置保存、operationLogs、前台同步截图命名和失败判定 | 改版后台验收用例 |

### 12.4 `PR-ADMIN-UX-FULL-PAGES-SUPPORT-001` 后台全量页面 P3 审计输入

记录时间：2026-06-16。执行范围：仅为 UI/UX 全量页面扩展提供后台信息架构 / 可用性审计输入；不执行后台 action，不线上写入，不修改 PM 总台账，不把旧壳补丁或前端自测写成后台通过。

#### 12.4.1 `heatwave-ops` 静态页与配置页当前清单

| 分组 | 页面 / slug | 当前承载 | 对 UI/UX 的关系 | 本轮状态 |
| --- | --- | --- | --- | --- |
| 入口 / 基础 | `index.html`、`login.html`、`overview-dashboard.html`、`ui-kit.html` | 后台入口、登录、经营总览、组件样式基线 | 后台品牌仍显示“酒桌判官后台 / Heatwave Ops”，会影响 UI/UX 对品牌一致性的判断 | 只读审计 |
| 内容配置 | `content-home-ops` | 首页 Hero、酒桌判官页主图、活动 Banner、快捷工具 | 直接影响小程序首页、工具入口、旧品牌文案和首屏权重 | 需前端/运营确认新首页配置 key |
| 内容配置 | `content-templates` | 酒局模板、模板分类、免费/高级模板 | 直接影响创建聚会模板、模板卡片缩略图和“玩法必填”心智 | 需改为聚会模板口径 |
| 内容配置 | `content-question-bank` | 题库与任务 | 属旧玩法/惩罚心智，改版后应降权或作为历史高级配置 | 只读列为降权风险 |
| 内容配置 | `content-share-assets` | 分享素材、战报海报、邀局卡、分享码 | 直接影响分享页、分享图、邀请卡和相册分享物料 | 需 UI/UX/运营确认新版分享样式 |
| 内容配置 | `content-tools-ops` | 工具箱运营、工具分类、图片、投放位置 | 工具缩略图可能被误用为相册/模板缩略图；首页工具权重需下降 | 需前端确认工具入口降权 |
| 审核 / UGC | `content-moments-review` | 精彩瞬间审核、二审、隐藏、要求重传、移出榜单 | 应改为照片墙/相册内容审核口径；审核结果影响前台相册、分享页可见性 | 等 UGC/测试证据 |
| 审核 / UGC | `content-moment-reports` | 瞬间举报处理 | 举报处理会影响前台照片墙、相册和分享页展示 | 等真实举报样本和前台同步截图 |
| 用户与酒局 | `user-profiles`、`user-login-logs`、`sessions`、`reports` | 用户、登录、酒局管理、战报中心 | `酒局/战报` 文案与“聚会记录师/相册/回忆”新心智不一致 | 只读列为文案风险 |
| 商业化 / 积分 | `commerce-points`、`commerce-point-ledger` | 积分体系、积分流水 | 积分/任务不应占据新主路径；只作为二级或账务追溯 | 需 PM/运营确认降权 |
| 商业化 / 会员商户 | `commerce-membership`、`commerce-merchants` | 会员、商户合作 | 当前不是“记录/相册/分享”主路径；避免干扰首屏体验 | 只读审计 |
| 商业化 / 榜单 | `commerce-ranking-rewards` | 榜单奖励配置、发奖 page action | 榜单/奖励属于旧玩法权重，改版后需谨慎降级；仍影响 points ledger 和 operationLogs | 写操作需 PM 单独授权 |
| 数据 | `data-users`、`data-content`、`data-business` | 用户、内容、商业数据 | 可辅助 UI/UX 评估首页/分享/相册权重，但不能替代用户截图 | 只读审计 |
| 增长与分享 | `growth-share-tasks` | 分享图任务状态、失败原因、retry | 直接影响分享生成状态、分享页可用性和分享图错误反馈 | retry 属写操作，当前只读 |
| 系统 | `system-permissions`、`system-config`、`system-operation-logs` | 权限、基础配置、后台操作日志 | operationLogs 是后台配置/审核影响前台的必要证据；系统配置可能承载品牌/开关 | 当前只读，写入需授权 |

补充：`manifest.json` 当前列出 23 个静态页面；动态导航还包括 `user-login-logs`、`commerce-point-ledger`、`system-operation-logs` 等由统一动态壳渲染的页面。`generate.js` 和 `app.js` 仍包含“酒桌判官后台”标题，属于品牌一致性风险输入，不在本轮修改。

#### 12.4.2 会影响小程序 UI/UX 的后台配置项

| 配置项 | 相关后台页 | 影响的小程序体验 | UI/UX 需关注 |
| --- | --- | --- | --- |
| 品牌文案 | `content-home-ops`、`system-config`、后台壳层标题 | 首页、创建、记录、相册、分享页是否继续出现“酒桌判官/判官/酒局” | 新版截图中所有主路径应统一“聚会记录师/聚会/记录/相册/分享/回忆” |
| 首页配置 | `content-home-ops` | 首页 Hero、主 CTA、快捷工具、活动 Banner | 防止后台旧 Hero / 快捷工具配置回灌，压过“创建聚会/加入聚会/继续记录” |
| 模板缩略图 | `content-templates` | 创建聚会模板卡、默认主题、模板图片 | 模板图不能继续强化玩法/惩罚/酒桌；卡片尺寸需配合前端新版布局 |
| 工具缩略图 | `content-tools-ops` | 首页工具、工具箱、可能被前端误当作相册/模板素材 | 工具图不应混入相册缩略图；工具入口应降权 |
| 分享图配置 | `content-share-assets`、`growth-share-tasks` | 分享页、分享图、邀请卡、ready/failed/expired 状态 | 分享图必须符合相册/回忆主路径，状态反馈要清晰 |
| UGC 审核 | `content-moments-review` | 照片墙、相册、时间线、分享页可见性 | 审核状态和分享过滤关系必须可理解，避免隐藏/待补图进入公开分享 |
| 举报处理 | `content-moment-reports` | 被举报照片是否仍在时间线、相册、分享页展示 | 举报处理后前台同步和敏感信息不可泄露 |
| 榜单奖励 | `commerce-ranking-rewards`、`commerce-points`、`commerce-point-ledger` | 榜单/积分是否继续出现在主路径 | 新版应降权；如保留，只能作为二级激励，不干扰记录/相册 |
| operationLogs | `system-operation-logs` | 后台配置或审核动作是否能被测试/UGC 追溯 | 每次配置/审核影响前台截图时，必须能关联日志 |

#### 12.4.3 后台侧配置风险给 UI/UX

| 风险 | 触发来源 | 对 UI/UX 的影响 | 需要补证据 |
| --- | --- | --- | --- |
| 旧文案回灌 | `content-home-ops`、`content-templates`、`sessions`、`reports`、后台壳层标题仍有“酒桌判官/判官/酒局/战报”等 | 新版前台即使重做，也可能被后台配置再次带回旧心智 | 前端提供新版截图；运营/PM 提供最终替换词；后台提供旧词命中清单 |
| 旧玩法词回灌 | `content-question-bank`、`commerce-points`、`commerce-ranking-rewards` | “欠酒/惩罚/积分/榜单”继续抢占主路径 | PM/运营确认降权清单；前端证明主路径不依赖这些配置 |
| 工具图误作相册缩略图 | `content-tools-ops` 和 `content-templates` 都有图片/缩略图 | 工具图标可能混入模板、相册或分享卡，造成视觉不统一 | 前端标明每个图片字段用途；UI/UX 给缩略图规范 |
| 分享过滤配置不清 | `content-share-assets`、`growth-share-tasks`、`content-moments-review` | private/hidden/needs_media/未授权内容可能进入分享图或分享页 | UGC 提供过滤规则；测试提供 ready PNG、分享页截图和接口摘要 |
| 审核状态配置不清 | `content-moments-review`、`content-moment-reports` | 审核、举报、要求重传后前台相册/照片墙/分享页状态不一致 | 前端同步截图；operationLogs；UGC 签字 |
| operationLogs 证据断裂 | `system-operation-logs` 只读追溯未与新版截图关联 | UI/UX/测试无法判断前台变化来自哪次后台配置或审核 | 测试建立截图与 logId 对照；后台只读复核字段完整性 |

#### 12.4.4 当前后台结论

- 后台可为 UI/UX 全量页面扩展提供 IA、配置来源、旧文案命中、审核/分享/日志风险输入。
- 当前不得执行后台 action、不得保存配置、不得线上写入。
- 前端完全复刻 UI/UX 新版主路径前，后台不能把旧壳补丁、旧配置截图或前端自测写成后台通过。
- 后续后台只在前端新版截图、UGC 过滤口径、测试证据和 PM 授权到位后，复核品牌配置、模板/分享/相册审核入口是否与新版一致。

### 12.5 `PR-PM-ROLE-READING-SCOPE-020` 分享页 / 双主线后台边界通知

记录时间：2026-06-17。阅读依据：`AGENTS.md` 域名与角色边界、PM 台账第 346-373 行最新派工、派发队列第 138 行后台支持项、后台计划第 12.4 节分享 / 审核 / operationLogs 风险输入。本节只记录后台管理负责人收到边界通知和后续触发条件；不执行后台 action，不保存配置，不改前端源码，不修改 PM 总台账，不写完成或上线通过。

用户最新优先级：分享页和分享截图保存是当前最重要页面；酒桌记账 / 聚会账本必须与拍照记录流程并存，并共同进入分享页和分享截图保存。后台侧不主动改前端分享页、保存图、账本入口、页面视觉或分享导出逻辑；仅在被明确要求提供配置、审核、举报、日志或积分奖励证据时配合。

后台后续触发条件：

| 触发来源 | 后台可做 | 必须等待的证据 / 授权 | 禁止事项 |
| --- | --- | --- | --- |
| 分享配置被要求配合 | 只读盘点 `content-share-assets`、`growth-share-tasks`、`system-config` 是否承载分享页标题、封面、样式、ready/failed/expired 状态配置 | UI/UX 分享规格、前端字段清单、后端配置合同、PM 授权写窗口 | 不直接改分享页前端，不保存线上分享配置，不用旧素材冒充新版分享视觉 |
| 审核 / 举报影响分享展示 | 复核 `content-moments-review`、`content-moment-reports` 动作是否能提供 operationLogs，并标明前台同步截图缺口 | UGC 过滤口径、测试截图 / page data / API 摘要、PM 授权后台 action | 不替 UGC 或测试写通过，不擅自隐藏 / 处理真实内容 |
| 分享图任务状态或保存失败需要后台证据 | 只读查看 `growth-share-tasks` 的 ready / failed / expired / retry 记录、失败原因、日志链路 | 接口联调样本 ID、测试失败原文、后台账号和写操作窗口 | 不主动 retry 消费样本；需要 retry 时必须先记录原态 |
| 奖励 / 积分 / 账本证据被要求 | 只读核对 `commerce-point-ledger`、`commerce-ranking-rewards`、`system-operation-logs` 是否能追溯账本高光、奖励或积分变动 | 后端/API ledger / payout 查询口径、接口联调脱敏样本、测试前台同步截图 | 不把积分 / 榜单作为新版主路径完成证据，不替前端实现账本并存导出 |

阅读规则执行记录：后续后台任务优先用 `rg`、章节号和任务编号定位 `AGENTS.md`、PM 指定任务段、相关证据段和最新派工行；只有出现证据冲突、跨角色边界不清、线上写操作授权不明或 PM 明确要求时，再扩展阅读全文。

## 13. `PR-ADMIN-CLEAN-SLATE-001` 后台旧污染只读盘点与重建建议

记录时间：2026-06-18。依据 `AGENTS.md`、`docs/party-recorder-clean-slate-reset-plan.md`、`docs/admin-console-ia.md`、本计划第 12 节、`backend/public/admin/static/heatwave-ops/manifest.json`、`backend/public/admin/static/heatwave-ops/app.js`、`backend/data/admin.js`、`backend/server.js` 只读盘点。本节只更新后台计划，不改后台静态资源，不改前端源码，不部署，不清理线上数据，不修改 PM 总台账。

### 13.1 后台菜单废弃 / 重建表

| 当前后台入口 | 旧污染判断 | Clean Slate 建议 | 后台动作 |
| --- | --- | --- | --- |
| `overview-dashboard` 经营驾驶舱 | 指标仍围绕酒局、战报、积分资产池 | 重建为聚会创建、拍照、账本、简报、分享保存、回流指标总览 | 旧页待隔离；新合同等数据/后端定义 |
| `content-home-ops` 首页装修 | 承载旧 Hero、酒桌判官页主图、活动 Banner、快捷工具 | 重建为聚会记录师首页配置：创建聚会、加入聚会、拍照、相册、分享主 CTA | 仅保留配置页能力；旧字段和旧图需备份后重建 |
| `content-templates` 酒局模板 | “酒局模板”、积分价格、玩法模板、免费模板链路仍旧 | 重建为聚会模板：聚会类型、默认房间名、照片/账本默认开关 | 页面能力可复用；字段合同需后端/API 重建 |
| `content-question-bank` 题库与任务 | 玩法/惩罚/问答，直接污染新产品 | 建议删除或归档到历史高级配置，不进入新版后台主菜单 | 旧页面列入删除/隔离清单 |
| `content-share-assets` 分享素材 | 仍有战报海报、邀局卡、分享码 | 重建为分享页/保存图素材配置：照片墙、账本高光、关键事件、聚会总结、安全区 | 页面能力可复用；素材和字段需重建 |
| `content-tools-ops` 工具箱运营 | 工具入口会回灌旧玩法心智 | 默认从新版最小后台移除；如保留仅作二级运营配置 | 待 PM/运营确认是否删除 |
| `content-moments-review` 精彩瞬间审核 | “精彩瞬间/榜单资格”口径旧 | 重命名为相册 / 照片内容审核，保留审核、隐藏、要求重传、分享可见性控制 | action 可复用，字段合同需改为 album/share eligibility |
| `content-moment-reports` 瞬间举报处理 | 可用于新版，但文案仍旧 | 重建为照片 / 分享举报处理，保留处理记录和日志 | action 可复用，展示文案和字段需重建 |
| `user-profiles`、`user-login-logs` | 用户能力中性，但部分标签/积分字段旧 | 最小保留为用户与登录审计，不进入产品主路径 | 保留只读/审计能力 |
| `sessions` 酒局管理 | “酒局”“判官”字段污染严重 | 重建为聚会管理：聚会、成员、创建人、邀请码、照片/账本状态 | 旧页待隔离；新 parties 合同需后端/API 重建 |
| `reports` 战报中心 | “战报”是旧分享结构核心污染 | 删除或重建为聚会简报 / 分享记录，不复用旧战报布局 | 旧页面列入删除/隔离清单 |
| `commerce-points` 积分体系 | 积分任务、商品和旧玩法激励会抢主路径 | 新版最小后台不默认保留；如账本需要积分，仅作账务证据二级页 | 默认隔离，等 PM 确认 |
| `commerce-point-ledger` 积分变动记录 | 可作为奖励/账务审计证据，但旧积分心智重 | 保留为账本 / 奖励流水只读证据页，不做主菜单卖点 | 可复用只读能力 |
| `commerce-membership`、`commerce-merchants` | 会员、商户合作不是 Clean Slate 第一阶段主链路 | 建议删除或隐藏，后续商业化再重建 | 列入隔离清单 |
| `commerce-ranking-rewards` 榜单奖励配置 | 今日最欠酒、榜单奖励、发奖 action 污染严重 | 默认移出新版最小后台；如保留仅作历史数据审计，不可阻塞分享/相册 | 发奖 action 暂停作为主路径能力 |
| `data-users`、`data-content`、`data-business` | 旧内容/商业分析口径混有模板、战报、积分 | 重建为运营指标：创建、拍照、账本、简报、分享保存、分享回流 | 旧页待重建，指标合同等数据负责人 |
| `growth-share-tasks` 分享图任务 | 与新版分享保存强相关，但字段仍是旧 task/brief | 保留并重建为分享生成任务：照片 + 账本 + 简报导出状态、失败原因、重试日志 | action 可复用，任务合同需后端/API 重建 |
| `system-permissions`、`system-config`、`system-operation-logs` | 系统能力中性，文案和日志类型仍旧 | 保留权限、配置、operationLogs；清理旧品牌和旧日志类型展示口径 | 保留能力，重建展示分类 |

新版后台最小保留建议：

- 内容审核：相册 / 照片审核、公开 / 分享可见性、要求重传、隐藏。
- 举报处理：照片、分享页、局外访问举报处理和处理记录。
- 分享任务：分享页 / 保存图生成任务、ready / failed / expired / retry 状态、失败原因。
- 相册 / 照片：照片墙、相册分组、是否进入分享页或保存图。
- 账本 / 简报配置：账本高光、关键事件、聚会总结字段映射和简报生成配置。
- 运营指标：创建完成率、首张照片完成率、记账事件数、简报生成、分享图保存、分享回流。
- 系统审计：管理员权限、系统配置、operationLogs。

### 13.2 旧静态资源清单

| 路径 / 文件 | 当前状态 | 污染点 | 建议处理 |
| --- | --- | --- | --- |
| `backend/public/admin/static/heatwave-ops/manifest.json` | 23 个静态页面，description 为“酒桌判官后台静态 UI 资产包” | 旧品牌、旧页面集合 | 备份后重建为 clean manifest |
| `app.js` | 当前导航和动态渲染主逻辑 | `酒桌判官后台`、`酒局模板`、`用户与酒局`、`酒局管理`、`战报中心`、`积分体系`、`榜单奖励配置` | 不直接 patch；等新菜单合同确定后整体替换 |
| `generate.js` | 批量生成静态页脚手架 | 默认生成 `酒桌判官后台` 标题 | 备份后改为新版生成器 |
| `login.html`、各 slug `.html` | 多数 title 为 `*- 酒桌判官后台` | 旧品牌壳层 | 备份后批量重建 |
| `overview-dashboard.html`、`ui-kit.html` | 静态 UI / 示例 | 示例中仍有战报海报等旧样本 | 归档旧 UI kit，按新版设计重建 |
| `content-question-bank.html` | 静态页存在 | 题库 / 惩罚入口 | 建议删除或归档 |
| `sessions.html`、`reports.html` | 静态页存在 | 酒局管理、战报中心 | 建议删除或重建为聚会管理 / 简报分享 |
| `commerce-points.html`、`commerce-ranking-rewards.html` | 静态页存在 | 积分体系、榜单奖励、今日最欠酒 | 默认隔离，除非 PM 确认账务审计保留 |
| `content-share-assets.html`、`growth-share-tasks.html` | 静态页存在 | 可复用但旧“战报分享”语义污染 | 重建为新版分享配置 / 分享任务 |
| `bg-dashboard.svg`、`bg-premium.svg`、`bg-template.svg`、`bg-alert.svg`、`icons.svg`、`styles.css` | 静态视觉资产 | 可能延续 Heatwave Ops 风格和旧图标语义 | 先备份，等 UI/UX 新后台视觉确认后替换 |

### 13.3 后台 action 影响说明

| action / 接口 | 当前用途 | Clean Slate 处理 | 后端/API 重建项 |
| --- | --- | --- | --- |
| `POST /api/v1/admin/moments/:momentId/review` | 审核、隐藏、要求重传、移出榜单 | 可复用审核 / 隐藏 / 要求重传；`remove_ranking` 不应作为新版主能力 | 将 `moment` 合同重建为 `photo/albumItem` 或明确兼容层；新增 share visibility / album visibility 字段 |
| `POST /api/v1/admin/moment-reports/:reportId/handle` | 举报有效/无效/要求重传/移出榜单 | 可复用举报处理；移出榜单需降级或删除 | 举报对象需从 moment/report 迁移到 photo/share/album 语义 |
| `POST /api/v1/admin/share-image-tasks/:taskId/retry` | failed/expired 分享图任务重试 | 可复用，但必须先记录原态，避免消费样本 | 分享任务需支持照片 + 账本 + 简报联合导出，返回保存图状态和失败原因 |
| `PUT /api/v1/admin/pages/content-share-assets` | 保存分享素材 | 可作为新版分享配置基础 | 需新增分享页标题、保存图背景、账本模块、照片墙模块、安全区配置字段 |
| `PUT /api/v1/admin/pages/content-templates` | 保存旧酒局模板 | 仅复用保存机制，不复用旧字段 | 新 parties/templates 合同：聚会类型、默认相册/账本/分享开关 |
| `PUT /api/v1/admin/pages/sessions` | 保存旧酒局管理 | 不建议直接复用 | 新 parties 管理合同需后端/API 重建 |
| `PUT /api/v1/admin/pages/reports` | 保存旧战报 | 建议废弃 | 新 brief/share summary 合同需后端/API 重建 |
| `PUT /api/v1/admin/pages/commerce-points` | 保存积分任务/商品/用户积分 | 不进新版主链路；可保留账务审计能力 | 如保留，需明确 ledger 与聚会账本不是同一概念 |
| `POST /api/v1/admin/ranking-rewards/grant` | 榜单奖励发放 | 默认暂停作为 Clean Slate 主路径 | 若保留为历史审计，需移出分享 / 相册主流程 |
| `system-operation-logs` 读取 | 审计后台动作 | 必须保留 | 日志类型需重建为分享配置、照片审核、举报处理、分享任务、账本/简报配置 |

### 13.4 需后端 / 运维配合项

| 责任方 | 需要配合 | 后台等待证据 |
| --- | --- | --- |
| 后端/API | 重建 `parties/photos/album/ledger/brief/share` 后台数据合同；明确旧 `sessions/reports/moments/rankings` 的兼容或废弃关系 | 新 pageMap 字段、action endpoint、错误码、operationLogs 类型 |
| 后端/API | 分享图任务支持照片 + 账本 + 简报联合导出，不再只围绕旧 brief/report | ready/failed/expired/retry 响应样例、保存图 URL、失败原因字段 |
| 后端/API | 审核 / 举报对象语义从 `moment` 迁移到照片 / 相册 / 分享项，或给过渡映射 | 字段映射表、迁移风险、前台同步点 |
| DBA/运维 | 静态后台替换前备份线上 `heatwave-ops`、旧 `admin-store/content-store/moments-store` 数据 | 备份路径、校验命令、回滚命令、目标服务确认仅 `api.pomer.cn` |
| DBA/运维 | 如要清空旧 generated share task 图片、旧上传资产、旧测试样本，先给清理预案 | 删除清单、残留扫描、恢复方式、不得触碰 `pomer.cn` 证明 |
| UI/UX | 新版后台最小 IA、分享配置页、审核页、任务页、指标页视觉规格 | 页面清单、字段优先级、旧菜单删除确认 |
| 测试/验收 | Clean Slate 后台准出规则 | 旧词扫描、菜单不存在截图、分享任务 / 审核 / 日志页面截图、回滚演练要求 |

### 13.5 静态资源备份 / 替换 / 回滚预案

本轮不执行以下命令，仅作为后续运维窗口预案。

| 阶段 | 预案 | 验收点 |
| --- | --- | --- |
| 本地备份 | 备份 `backend/public/admin/static/heatwave-ops/` 到 `docs/archive/admin-static/heatwave-ops-before-clean-slate-<timestamp>/` 或由 git branch / commit 固化 | 备份目录文件数、`manifest.json`、`app.js`、CSS、SVG、HTML 均存在 |
| 线上备份 | 在服务器备份 `/www/wwwroot/jiuzhuopanguan-git/backend/public/admin/static/heatwave-ops` 到 `/www/backup/jiuzhuopanguan/PR-ADMIN-CLEAN-SLATE-001/heatwave-ops-before-<timestamp>.tgz` | tar 包存在、可列出、未触碰 `pomer.cn` 官网目录 |
| 替换 | 仅在 PM/运维授权后同步新版 clean slate 静态目录；优先整体目录替换，不手改线上散文件 | 公网 `/admin`、`/admin/login`、`/admin/static/heatwave-ops/app.js` 版本可验证 |
| 回滚 | 解压备份 tar 覆盖回原 `heatwave-ops` 目录；必要时只重启 `jiuzhuopanguan-backend` 或清浏览器缓存 | 后台登录页恢复、旧 manifest 可读、服务仍指向 `api.pomer.cn` 项目 |
| 验证 | 运行 `npm.cmd run check:encoding`、`node --check backend/public/admin/static/heatwave-ops/app.js`、必要时 `npm.cmd --prefix backend run check:admin-ui` | 编码 / JS / UI 合同通过；旧词扫描仅允许归档和技术注释命中 |

当前后台结论：`PR-ADMIN-CLEAN-SLATE-001` 已完成只读盘点与计划记录；旧后台外壳、菜单、数据种子和 action 合同均存在明显历史污染。后台建议先隔离旧静态资源与旧数据基线，最小重建为“内容审核 / 举报 / 分享任务 / 相册照片 / 账本简报配置 / 运营指标 / 系统审计”。任何删除、替换、线上清理或部署都必须等待 PM、后端/API、DBA/运维、UI/UX 和测试证据到位。

## 14. `PR-ADMIN-CLEAN-SLATE-MIN-IA-002` 首版后台最小 IA 白名单

记录时间：2026-06-18。只读范围：`docs/runtime/ai-thread-dispatch-queue.md` 第 292 行、`docs/party-recorder-clean-slate-reset-plan.md`、本计划第 13 节。本节只收口后台 IA 白名单，不部署、不改静态资源、不改前端、不写完成或上线通过。

### 14.1 首版后台必须保留的菜单白名单

| 一级菜单 | 首版页面 | 目的 | 对应第 13 节依据 | 首版状态 |
| --- | --- | --- | --- | --- |
| 工作台 | `clean-overview` | 只看新主链路健康度：创建、拍照、账本、简报、分享保存、回流 | 13.1 `overview-dashboard` 需重建为新指标总览 | 必须重建 |
| 内容安全 | `album-photo-review` | 照片 / 相册审核，控制公开、分享、要求重传、隐藏 | 13.1 `content-moments-review` 可复用 action，需重建语义 | 必须保留 |
| 内容安全 | `photo-report-handling` | 照片、分享页、局外访问举报处理 | 13.1 `content-moment-reports` 可复用处理能力 | 必须保留 |
| 分享运营 | `share-generation-tasks` | 分享页 / 保存图生成任务，ready / failed / expired / retry | 13.1 `growth-share-tasks` 与新版分享保存强相关 | 必须保留 |
| 分享运营 | `share-page-config` | 分享页标题、保存图背景、照片墙、账本高光、关键事件、安全区配置 | 13.1 `content-share-assets` 可作为新版分享配置基础 | 必须重建 |
| 相册与照片 | `album-photo-library` | 照片墙、相册分组、进入分享页 / 保存图资格 | 13.1 新版最小保留建议“相册 / 照片” | 必须新建 |
| 账本与简报 | `ledger-brief-config` | 账本高光、关键事件、聚会总结字段映射和简报生成配置 | 13.1 新版最小保留建议“账本 / 简报配置” | 必须新建 |
| 运营指标 | `party-recorder-metrics` | 创建完成率、首张照片完成率、记账事件、简报生成、分享图保存、分享回流 | 13.1 `data-*` 需重建为新指标 | 必须重建 |
| 系统审计 | `system-operation-logs` | 管理员权限、系统配置、operationLogs 追溯 | 13.1 系统能力中性、operationLogs 必须保留 | 必须保留并重命名日志类型 |

首版白名单结论：首版后台只服务 Clean Slate 主链路和准出证据，不承载旧玩法、旧积分商城、会员商户、战报中心、题库任务和榜单奖励。

### 14.2 完全移除的菜单黑名单

| 当前入口 | 移除原因 | 后续处理 |
| --- | --- | --- |
| `content-question-bank` 题库与任务 | 玩法 / 惩罚 / 问答直接污染“聚会记录师”主线 | 从首版菜单完全移除，旧数据归档 |
| `content-tools-ops` 工具箱运营 | 工具入口会回灌旧玩法心智 | 首版移除；如运营需要，另开二期 |
| `sessions` 酒局管理 | 酒局 / 判官字段污染严重 | 不直接保留；由 `party-management` 候选页按新 parties 合同重建 |
| `reports` 战报中心 | 战报是旧分享结构核心污染 | 完全移除旧页；由 `brief-share-records` 候选页按新 brief/share 合同重建 |
| `commerce-points` 积分体系 | 积分任务 / 商品抢占新主路径 | 首版移除；账务证据只通过二级只读 ledger 候选页处理 |
| `commerce-membership` 会员体系 | 不属于 Clean Slate 第一阶段主链路 | 首版移除 |
| `commerce-merchants` 商户合作 | 不属于 Clean Slate 第一阶段主链路 | 首版移除 |
| `commerce-ranking-rewards` 榜单奖励配置 | 今日最欠酒 / 榜单奖励 / 发奖 action 污染严重 | 首版移除，不作为分享 / 相册主流程证据 |
| 旧 `data-business` 商业分析 | 与积分、会员、商户旧模型绑定 | 移除，指标归入 `party-recorder-metrics` |

黑名单执行边界：本节只列清单，不删除文件、不改 manifest、不改 `app.js`。

### 14.3 二级页候选清单

| 候选页 | 归属一级菜单 | 是否首版进入菜单 | 触发条件 |
| --- | --- | --- | --- |
| `party-template-config` | 工作台 / 分享运营 | 暂不进首版主菜单 | 前端确认三步创建仍需后台模板配置后再加入 |
| `party-management` | 工作台 | 候选二级 | 后端/API 完成 parties 合同后替代旧 `sessions` |
| `brief-share-records` | 账本与简报 / 分享运营 | 候选二级 | 后端/API 完成 brief/share summary 合同后替代旧 `reports` |
| `ledger-evidence` | 账本与简报 | 候选二级，只读 | 需要追溯账本高光或奖励 / 积分证据时开放 |
| `user-audit` | 系统审计 | 候选二级，只读 | 需要登录态、局外访问或举报责任人追溯时开放 |
| `asset-library` | 分享运营 | 候选二级 | UI/UX 给出新版分享素材规格和资源命名后开放 |
| `system-permissions` | 系统审计 | 候选二级 | 多管理员权限、字段权限或发布窗口需要时开放 |
| `system-config` | 系统审计 | 候选二级 | 只承载环境 / 上传 / 静态资源配置，不放产品旧文案 |

二级页规则：候选页不得阻塞首版主链路；没有新合同和新证据前，不能把旧 `sessions/reports/points/ranking` 页面改名后冒充新版页面。

### 14.4 页面与后端/API page/action 合同对照

| 新页面 slug | 复用 / 废弃来源 | 需要的 page 合同 | 需要的 action 合同 | 后端/API 状态 |
| --- | --- | --- | --- | --- |
| `clean-overview` | 废弃旧 `overview-dashboard` 指标口径 | `GET /api/v1/admin/pages/clean-overview` 返回创建、拍照、账本、简报、分享保存、分享回流指标 | 无强 action | 需后端/API 新建 |
| `album-photo-review` | 复用 `content-moments-review` 审核能力 | `GET /api/v1/admin/pages/album-photo-review` 返回 photo/albumItem、公开态、分享可见性、重传状态 | `POST /api/v1/admin/photos/:photoId/review` 或兼容 `moments/:momentId/review`，保留 approve/hide/require_resubmit，移除主路径 `remove_ranking` | 需重建 photo/album 语义或提供兼容映射 |
| `photo-report-handling` | 复用 `content-moment-reports` 处理能力 | `GET /api/v1/admin/pages/photo-report-handling` 返回 report、photo/share target、举报人、处理状态 | `POST /api/v1/admin/photo-reports/:reportId/handle` 或兼容 `moment-reports/:id/handle`；保留 valid_hide/invalid_keep/require_resubmit | 需重建举报对象语义 |
| `share-generation-tasks` | 复用 `growth-share-tasks` retry 能力 | `GET /api/v1/admin/pages/share-generation-tasks` 返回分享任务、保存图、照片 + 账本 + 简报组成、失败原因 | `POST /api/v1/admin/share-image-tasks/:taskId/retry` 可复用；retry 前必须记录原态 | 需扩展 task payload 支持 ledger/brief/photo 联合导出 |
| `share-page-config` | 复用 `content-share-assets` 保存机制 | `GET /api/v1/admin/pages/share-page-config` 返回分享页标题、保存图背景、照片墙模块、账本模块、二维码安全区 | `PUT /api/v1/admin/pages/share-page-config` 保存配置并写 operationLogs | 需新 pageMap 和字段校验 |
| `album-photo-library` | 新建，不复用旧工具/模板素材 | `GET /api/v1/admin/pages/album-photo-library` 返回相册、照片分组、分享资格、公开状态 | 可选：批量设置分享资格、隐藏、要求补图，必须写 operationLogs | 需后端/API 新建 |
| `ledger-brief-config` | 新建，不能直接复用旧战报 | `GET /api/v1/admin/pages/ledger-brief-config` 返回账本高光、关键事件、聚会总结、简报模块顺序 | `PUT /api/v1/admin/pages/ledger-brief-config` 保存配置并写 operationLogs | 需后端/API 新建 |
| `party-recorder-metrics` | 重建旧 `data-*` | `GET /api/v1/admin/pages/party-recorder-metrics` 返回 Clean Slate 指标 | 无强 action；导出另派 | 需数据/后端定义指标字段 |
| `system-operation-logs` | 复用现有日志页 | `GET /api/v1/admin/pages/system-operation-logs` 返回新版日志类型：分享配置、照片审核、举报处理、分享任务、账本/简报配置 | 无写 action | 可复用读取，需重命名日志类型和过滤项 |

### 14.5 PM 交付结论

- 最小 IA 白名单已收敛为 7 个一级菜单 / 9 个首版页面：工作台、内容安全、分享运营、相册与照片、账本与简报、运营指标、系统审计。
- 黑名单明确移除旧题库任务、工具箱、旧酒局管理、旧战报中心、积分体系、会员、商户、榜单奖励、旧商业分析。
- 二级页候选只能在新合同、新证据到位后开放，不能用旧页面改名冒充。
- page/action 对照显示：可复用的是审核、举报、share retry、operationLogs 读取和部分配置保存机制；必须重建的是 parties/photos/album/ledger/brief/share/metrics page 合同。

## 15. `PR-ADMIN-CLEAN-SLATE-PAGE-CONTRACT-003` 首版 page/action 合同草案

记录时间：2026-06-18。只读范围：`docs/runtime/ai-thread-dispatch-queue.md` 第 300 行、本计划第 14 节。本节只准备后台首版 page map / action map 给后端/API 003 对接；不部署，不改静态资源，不写完成或上线通过。

### 15.1 首版页面 slug 字段白名单

| slug | 页面类型 | 字段白名单 | 明确禁止字段 |
| --- | --- | --- | --- |
| `clean-overview` | readonly dashboard | `createdPartyCount`、`firstPhotoCount`、`ledgerEventCount`、`briefGeneratedCount`、`shareImageSavedCount`、`shareReturnVisitCount`、`activeIssueCount`、`updatedAt` | `wine`、`judge`、`punishment`、`debtRanking`、旧 `reportShareRate` |
| `album-photo-review` | action list | `photoId`、`partyId`、`partyName`、`uploaderProfileId`、`uploaderName`、`thumbnailUrl`、`caption`、`albumVisibility`、`shareVisibility`、`reviewStatus`、`resubmitStatus`、`createdAt`、`updatedAt`、`availableActions` | `rankingEligible`、`rewardEligible`、`debtScore`、`judgeOnly`、完整 openId、手机号 |
| `photo-report-handling` | action list | `reportId`、`targetType`、`targetId`、`partyId`、`reporterProfileId`、`reporterName`、`reasonCode`、`reasonText`、`status`、`handledAt`、`handlerName`、`availableActions` | 私密照片原图、私密正文、完整 openId、手机号、旧 `remove_ranking` 主操作 |
| `share-generation-tasks` | action list | `taskId`、`partyId`、`briefId`、`layoutMode`、`status`、`photoCount`、`ledgerEventCount`、`keyEventCount`、`imageUrl`、`failedReason`、`retryCount`、`createdAt`、`updatedAt`、`availableActions` | 旧 report poster 字段、未脱敏 token、私密 photo 原图、被过滤节点正文 |
| `share-page-config` | config form | `title`、`subtitle`、`coverImageUrl`、`backgroundImageUrl`、`showPhotoWall`、`showLedgerHighlights`、`showKeyEvents`、`showPartySummary`、`qrSafeArea`、`buttonText`、`reason`、`updatedAt` | 旧战报海报、欠酒榜文案、惩罚文案、会员广告字段 |
| `album-photo-library` | readonly / optional action list | `albumId`、`partyId`、`partyName`、`photoCount`、`publicPhotoCount`、`shareablePhotoCount`、`pendingReviewCount`、`lastPhotoAt`、`coverPhotoUrl`、`availableActions` | 旧工具素材、题库图片、完整私密照片集合 |
| `ledger-brief-config` | config form | `ledgerHighlightEnabled`、`ledgerFields`、`keyEventFields`、`summaryTemplate`、`briefModuleOrder`、`shareIncludeLedger`、`reason`、`updatedAt` | 积分商城、今日最欠酒、惩罚、旧战报模板字段 |
| `party-recorder-metrics` | readonly dashboard | `partyCreated`、`firstPhotoCompleted`、`ledgerEventCreated`、`briefGenerated`、`shareImageGenerated`、`shareImageSaved`、`shareReturned`、`dateRange`、`updatedAt` | 旧商业化指标、会员收入、商户券、惩罚题使用率 |
| `system-operation-logs` | readonly log list | `id`、`logType`、`operator`、`action`、`targetType`、`targetId`、`targetName`、`detail`、`createdAt` | 完整 token、cookie、完整 openId、手机号、私密正文 |

字段白名单规则：后端/API 若暂时沿用旧 `moment/session/report` 内部模型，返回给后台首版页面时也必须转换成上表语义；不得把旧字段原样暴露给新后台页面。

### 15.2 action 白名单

| action key | 适用 slug | 方法 / 路径草案 | 入参白名单 | 日志要求 |
| --- | --- | --- | --- | --- |
| `photo-approve` | `album-photo-review` | `POST /api/v1/admin/photos/:photoId/review` | `action=approve`、`reason` | 写 `照片审核` operationLog |
| `photo-hide` | `album-photo-review`、`album-photo-library` | `POST /api/v1/admin/photos/:photoId/review` | `action=hide`、`reason` | 写 `照片审核` operationLog |
| `photo-require-resubmit` | `album-photo-review`、`album-photo-library` | `POST /api/v1/admin/photos/:photoId/review` | `action=require_resubmit`、`reason` | 写 `照片审核` operationLog |
| `report-valid-hide` | `photo-report-handling` | `POST /api/v1/admin/photo-reports/:reportId/handle` | `action=valid_hide`、`reason` | 写 `照片举报` operationLog |
| `report-invalid-keep` | `photo-report-handling` | `POST /api/v1/admin/photo-reports/:reportId/handle` | `action=invalid_keep`、`reason` | 写 `照片举报` operationLog |
| `report-require-resubmit` | `photo-report-handling` | `POST /api/v1/admin/photo-reports/:reportId/handle` | `action=require_resubmit`、`reason` | 写 `照片举报` operationLog |
| `share-task-retry` | `share-generation-tasks` | `POST /api/v1/admin/share-image-tasks/:taskId/retry` | `reason` | 写 `分享任务` operationLog；retry 前必须保留原态 |
| `save-share-page-config` | `share-page-config` | `PUT /api/v1/admin/pages/share-page-config` | 字段白名单 + `reason` | 写 `分享配置` operationLog |
| `save-ledger-brief-config` | `ledger-brief-config` | `PUT /api/v1/admin/pages/ledger-brief-config` | 字段白名单 + `reason` | 写 `账本简报配置` operationLog |

action 白名单规则：首版不提供批量删除、直接编辑用户照片正文、手工加积分、发榜单奖励、处理会员/商户、保存旧战报等高污染动作。

### 15.3 完全停用的旧 page/action 清单

| 旧 page/action | 停用原因 | 替代关系 |
| --- | --- | --- |
| `content-question-bank` 全页与保存 | 题库 / 惩罚污染新产品 | 无首版替代 |
| `content-tools-ops` 全页与保存 | 工具箱回灌旧玩法 | 暂无首版替代 |
| `sessions` 全页与保存 | 酒局 / 判官字段污染 | 后续 `party-management` 新合同 |
| `reports` 全页与保存 | 旧战报结构污染分享 | 后续 `brief-share-records` 新合同 |
| `commerce-points` 全页与保存 / 手工积分调整 | 积分商城和旧激励不进主链路 | 二级只读 `ledger-evidence` 候选 |
| `commerce-membership` 全页与保存 | 非首版主链路 | 二期商业化 |
| `commerce-merchants` 全页与保存 | 非首版主链路 | 二期商业化 |
| `commerce-ranking-rewards` 全页与保存 | 榜单奖励 / 今日最欠酒污染 | 首版停用 |
| `POST /api/v1/admin/ranking-rewards/grant` | 发榜单奖励不属于 Clean Slate 分享 / 相册主链路 | 停用；仅历史归档可查 |
| `remove_ranking` action | 榜单语义旧 | 从首版审核 / 举报主操作移除 |
| 旧 `content-share-assets` 战报海报字段 | 战报分享污染新分享保存图 | 由 `share-page-config` 字段替代 |

### 15.4 给后端/API 003 对接的最小 page map

| slug | view | metrics | tables / collection | pageActions / rowActions |
| --- | --- | --- | --- | --- |
| `clean-overview` | `dashboard` | `createdPartyCount`、`firstPhotoCount`、`ledgerEventCount`、`briefGeneratedCount`、`shareImageSavedCount`、`shareReturnVisitCount` | `sections`: `partyFunnel`、`shareFunnel`、`openIssues` | 无 |
| `album-photo-review` | `action-list` | `pendingReviewCount`、`shareableCount`、`hiddenCount`、`resubmitCount` | `table.key=photos`；主键 `photoId`；列：照片、聚会、上传者、可见性、审核状态、更新时间 | `photo-approve`、`photo-hide`、`photo-require-resubmit` |
| `photo-report-handling` | `action-list` | `pendingReportCount`、`handledReportCount`、`validHideCount`、`invalidKeepCount` | `table.key=reports`；主键 `reportId`；列：举报对象、聚会、举报人、原因、状态、处理时间 | `report-valid-hide`、`report-invalid-keep`、`report-require-resubmit` |
| `share-generation-tasks` | `action-list` | `readyCount`、`failedCount`、`expiredCount`、`retryableCount` | `table.key=shareTasks`；主键 `taskId`；列：任务、聚会、布局、照片数、账本事件数、状态、失败原因、重试次数 | `share-task-retry` |
| `share-page-config` | `config-form` | `updatedAt`、`enabledModulesCount` | `form.key=sharePageConfig`；字段按 15.1 | `save-share-page-config` |
| `album-photo-library` | `readonly-list` | `albumCount`、`photoCount`、`publicPhotoCount`、`shareablePhotoCount` | `table.key=albums`；主键 `albumId`；列：相册、聚会、照片数、公开数、可分享数、封面、最后更新 | 可选 `photo-hide`、`photo-require-resubmit`，默认不启用 |
| `ledger-brief-config` | `config-form` | `updatedAt`、`enabledLedgerFieldsCount` | `form.key=ledgerBriefConfig`；字段按 15.1 | `save-ledger-brief-config` |
| `party-recorder-metrics` | `dashboard` | `partyCreated`、`firstPhotoCompleted`、`ledgerEventCreated`、`briefGenerated`、`shareImageSaved`、`shareReturned` | `sections`: `coreFunnel`、`contentFunnel`、`shareFunnel` | 无 |
| `system-operation-logs` | `readonly-list` | `totalCount`、`photoReviewCount`、`reportCount`、`shareTaskCount`、`configCount` | `table.key=operationLogs`；主键 `id`；列：类型、操作人、动作、对象、详情、时间 | 无 |

最小 page map 约束：

- 所有写 action 必须带 `reason`，失败时返回可读 `message`，成功后刷新当前 page 数据。
- 所有 action 必须写 operationLogs，并能在 `system-operation-logs` 以新版 logType 查询。
- 所有页面返回的用户身份只允许昵称、脱敏 ID 或 profileId；不得返回完整 token、cookie、手机号、完整 openId。
- 后端/API 若无法一次完成新 endpoint，可先提供兼容 endpoint，但响应字段必须符合 15.1 白名单。

### 15.5 PM 交付结论

- page map 已收口为 9 个首版 slug，字段白名单已列明。
- action map 只允许照片审核、照片举报、分享任务 retry、分享配置保存、账本简报配置保存。
- 停用清单明确禁止旧题库、工具箱、旧酒局、旧战报、积分体系、会员商户、榜单奖励和 `remove_ranking` 主路径。
- 后端/API 003 对接重点是把旧内部模型转换成 `party/photo/album/shareTask/ledgerBrief/metrics/operationLogs` 新语义响应。

## 16. `PR-ADMIN-TOOLBOX-CATALOG-008C-CHECK` 工具箱目录后台配置证据

记录时间：2026-06-18。任务边界：只检查后台配置证据，只更新本后台计划；不部署，不改 PM 文档，不直接改前端/后端源码，不写工具箱已通过。派发队列未检索到独立后台 008C 行，已按 PM 最新派工和相邻数据运营 / 前端兜底任务上下文记录。

### 16.1 文件 / 页面证据

| 检查点 | 证据位置 | 当前结论 | 风险 |
| --- | --- | --- | --- |
| `content-tools-ops` 是否存在 | `backend/public/admin/static/heatwave-ops/app.js` 导航包含 `content-tools-ops`；`backend/public/admin/static/heatwave-ops/content-tools-ops.html` 存在 | 静态后台有工具箱运营入口和独立页面壳 | Clean Slate 首版 IA 第 14/15 节已将该页列为黑名单 / 停用；本次仅为 008C 配置核查，不改变首版 IA 结论 |
| 是否能管理 `toolsCatalog` | `backend/data/admin.js` 的 `pageMap['content-tools-ops']` 使用 `collection.key=toolsCatalog` | 后台 page/action 合同侧可以保存工具目录集合 | 若后端默认目录为空，新 store 仍可能没有任何可管理条目 |
| 字段是否覆盖必要目录字段 | `backend/data/admin.js` 的 `content-tools-ops` 字段 / 列包含 `id`、`name`、`category`、`target`、`imageUrl`、`usageCount`、`favoriteCount`、`favoriteRate`、`status`、`sortOrder`、`isHot`、`placement` | 已覆盖 PM 提到的 `id/name/category/status/placement/sortOrder`，并保留图片、目标和运营指标字段 | 运行时接口若只消费部分字段，需要后端/API 明确字段转换和默认值 |
| 当前 store 工具目录 | `backend/data/admin-store.json` 的 `toolsCatalog` 有 8 条；本地抽样显示 8 条均为 `status=启用`，`placement` 为 `both` 或 `tools` | 本地已有运营配置数据，可作为补种来源 | 该文件不是默认种子；新环境、重置 store 或运行时未读该 store 时仍会空目录 |
| 默认工具目录 | `backend/data/admin.js` 中 `DEFAULT_TOOLS_CATALOG = []`，默认 store 初始化走 `normalizeToolsCatalog(DEFAULT_TOOLS_CATALOG)` | 默认目录为空属后台配置侧真实缺口 | 可能导致新 store、缺失 store、清库后运行时工具箱列表为空 |
| `toolsHero` 当前 store | 本地 `backend/data/admin-store.json` 未发现 `toolsHero` 对象 | 当前 store 不能直接提供工具箱 Hero 标题 / 副标题 / 主图 | 前端或接口若依赖 `toolsHero`，会拿不到运营配置 |
| `toolsHero` 后台合同 | `backend/data/admin.js` 读取 `store.toolsHero || {}`，并在 `content-home-ops` 暴露 `toolsHeroTitle`、`toolsHeroSubtitle`、`toolsHeroImageUrl`；保存时写回 `adminStore.toolsHero = { title, subtitle, imageUrl }` | 后台/API 已有 `toolsHero` 读写合同，但它挂在首页运营配置，不在 `content-tools-ops` 页面 | 若 PM 要求工具箱页内配置 Hero，需要后端/API 调整 pageMap，静态后台通常可复用通用表单渲染，但仍需验证 |

### 16.2 后台侧最小恢复 / 补种方案

| 方案 | 操作范围 | 字段清单 | 适用场景 | 回滚方式 |
| --- | --- | --- | --- | --- |
| A. 默认目录补种 | 后端/API 在 `backend/data/admin.js` 将 `DEFAULT_TOOLS_CATALOG` 从空数组改为 8 条默认工具，并保留 `normalizeToolsCatalog` | 必填：`id`、`name`、`category`、`status`、`placement`、`sortOrder`；建议保留：`target`、`imageUrl`、`usageCount`、`favoriteCount`、`favoriteRate`、`isHot` | 新 store、清库、缺失 `admin-store.json` 时避免空目录 | 回滚 `DEFAULT_TOOLS_CATALOG` 修改；保留部署前源码 diff / commit |
| B. store 补种 | 后端/API 或 DBA 将当前 `backend/data/admin-store.json` 的 8 条 `toolsCatalog` 作为种子导入目标 store | 同 A；另需记录 `updatedAt`、操作者和补种原因 | 线上 store 已存在但 `toolsCatalog` 缺失或为空 | 导入前备份 `admin-store.json` 或 DB row；回滚时恢复备份 |
| C. 运行时兜底 | 后端/API 的工具箱列表接口在 `toolsCatalog` 为空时回退 `DEFAULT_TOOLS_CATALOG`，并按 `status=启用`、`placement in ['tools','both']`、`sortOrder` 排序 | 返回前端最小字段：`id`、`name`、`category`、`imageUrl`、`status`、`placement`、`sortOrder` | 防止配置缺失导致 DevTools 列表为空 | 回滚接口兜底逻辑；保留接口响应样本对比 |
| D. Hero 补种 | 后端/API 给 `toolsHero` 增加默认值，或由后台首页运营配置写入 `{ title, subtitle, imageUrl }` | `title`、`subtitle`、`imageUrl`；可选 `updatedAt`、`operator` | 分享页 / 工具箱页需要主视觉运营配置 | 导入前备份 store；恢复旧 `toolsHero` 或删除该对象 |
| E. Hero 页面归位 | 若 PM 要求在 `content-tools-ops` 内管理 Hero，由后端/API 在 `content-tools-ops` pageMap 增加 `toolsHeroTitle`、`toolsHeroSubtitle`、`toolsHeroImageUrl`，保存仍落 `adminStore.toolsHero` | 同 D | 配置入口需与工具箱目录同页 | 回滚 pageMap 字段；静态后台若无需改版则不动静态资源 |

### 16.3 后端/API 与运维配合项

| 配合方 | 是否需要 | 事项 | 证据要求 |
| --- | --- | --- | --- |
| 后端/API | 需要 | 确认工具箱运行时接口读取 `adminStore.toolsCatalog`，为空时是否 fallback；补齐 `DEFAULT_TOOLS_CATALOG` 或接口兜底；确认 `toolsHero` 输出给前端的字段名 | 代码 diff、接口响应样本、空 store smoke、operationLogs 或配置保存日志 |
| DBA / 数据运维 | 可能需要 | 若线上 store 已空，需要备份后补种 `toolsCatalog` 和可选 `toolsHero` | 备份文件 / DB row、补种前后条数、回滚说明 |
| 静态后台 / 运维 | 暂不需要立即发布 | 当前静态后台已有 `content-tools-ops` 壳和通用渲染入口；如仅改默认种子 / store，不需要发布静态资源 | 若后续把 Hero 移到 `content-tools-ops` 且通用表单不满足，再提供静态资源 diff、截图和回滚包 |
| 前端 | 本任务不直接配合 | PM 已退前端做本地兜底；后台只提供配置侧缺口和合同结论 | 前端通过与否不由本节认定 |

### 16.4 PM 回包结论

- `content-tools-ops` 配置侧可以管理 `toolsCatalog`，字段已覆盖 `id/name/category/status/placement/sortOrder`，同时包含图片、目标和运营指标字段。
- 当前 `admin-store.json` 有 8 条启用工具且 placement 正常，但 `backend/data/admin.js` 的 `DEFAULT_TOOLS_CATALOG=[]` 会让新 store / 清库场景产生空目录。
- 当前 store 缺 `toolsHero`；后台/API 已有 `toolsHero` 读写合同，但入口在 `content-home-ops`，不是 `content-tools-ops`。是否归位到工具箱页需 PM / 后端/API 再确认。
- 建议后端/API 优先补默认目录和运行时兜底，再按需补 `toolsHero` 默认值；如只改默认种子和 store，不需要 DBA/运维发布静态后台资源。
- 本节不写工具箱已通过，不代表 DevTools 工具箱列表问题已闭环。

## 17. `PR-ADMIN-SESSION-END-STATE-008BX` 结束聚会状态后台核查

记录时间：2026-06-19。任务边界：只核查后台 `sessions` / 概览 / 运营数据的状态展示和统计，只更新本后台计划；不改 PM 总进度 / 公告 / 队列，不改前端 / 后端源码，不清理 008g / 008BR / 008BL 数据，不触碰 `pomer.cn` 官网，不写上线通过。

### 17.1 派发和依赖状态

| 来源 | 证据 | 结论 |
| --- | --- | --- |
| 派发队列 | `docs/runtime/ai-thread-dispatch-queue.md` 第 518-520 行 | 008BV 后端、008BW 前端、008BX 后台均已 fork 恢复线程；后台只接管状态展示 / 统计核查 |
| 总进度 | `docs/gameplay-moments-progress-tracker.md` 第 843-845 行 | PM 仍记录后端 / 前端 / 后台恢复任务未闭环；后台本节只补角色内核查，不改 PM 总台账 |
| 后端依赖 | 008BV 仍需补 end / PUT 状态写入、`endedAt/updatedAt`、live/history/admin 读取口径 | 后台不能写后端完成；`endedAt` 字段应等待后端合同稳定后再接入页面字段 |

### 17.2 字段口径和当前后台证据

| 检查点 | 证据位置 | 当前口径 | 判断 |
| --- | --- | --- | --- |
| 状态字段来源 | `backend/data/admin.js` 第 2229-2276 行，`sessions` pageMap 读取 `store.liveSessions`，字段包含 `state` 和 `status` | `state` 是流程状态，`status` 是运营状态 | 二者已分离，不应用 `status=正常` 判断是否进行中 |
| `state` 可选项 | `backend/data/admin.js` 第 1961 行 | `getSessionStateOptions()` 合并 `等待开局`、`进行中`、`已结束` 和现有 store 值 | 后台合同已支持 `进行中 / 已结束` 选项 |
| `status` 可选项 | `backend/data/admin.js` 第 1963 行 | `getSessionStatusOptions()` 合并 `正常`、`待观察`、`灰度`、`停用` | `status=正常` 只代表运营状态，不应覆盖结束状态 |
| sessions 列表显示 | `backend/data/admin.js` 第 2260、2273-2274 行 | 编辑字段有 `流程状态 state`；列表列显示 `流程状态 state` 和 `状态 status` | 已结束聚会可通过列表 `流程状态=已结束` 清楚识别 |
| sessions 统计 | `backend/data/admin.js` 第 970-975 行 | `activeCount` 只统计 `state` 包含 `进行中`；已结束统计只看 `state` 包含 `结束` | `status=正常` 不会把已结束计入进行中 |
| 概览统计 | `backend/data/admin.js` 第 897-900 行 | 概览 `酒局总数` trend 只显示 `进行中 ${activeSessions}`，`activeSessions` 同样只看 `state` 包含 `进行中` | 已结束不会计入进行中；但概览缺少显式“已结束 N”展示 |
| 本地样本 | `backend/data/admin-store.json` 第 1027、1056、1085 行附近 | 同一 store 中存在 `state=进行中 26 分钟`、`state=已结束`、`state=等待开局`，且已结束样本 `status=正常` | 可证明 `state` 与 `status` 是两个不同维度；`status=正常` 不应干扰结束识别 |
| 静态入口 | `backend/public/admin/static/heatwave-ops/app.js` 第 26 行、`sessions.html` 第 11 行 | 静态后台有 `sessions` 页面入口，页面由通用 collection 渲染 pageMap 字段 | 不需要为本次核查发布静态资源 |

### 17.3 缺口和最小处理建议

| 缺口 | 当前影响 | 本轮处理 | 后续责任 |
| --- | --- | --- | --- |
| `endedAt` 未进入 `sessions` pageMap 字段 / 列 | 后台能识别“已结束”，但看不到结束时间 | 本轮不改源码，记录为后端 008BV 合同依赖；避免提前自造字段 | 后端 008BV 补 `endedAt/updatedAt` 写入和读回后，后台再把 `endedAt` 加入 `sessions` 字段 / 列 |
| 静态后台无列表筛选控件 | 已结束可通过 `state` 列清楚显示，但不能在页面内一键筛选 | 本轮不做静态改动；当前满足“至少清楚显示”底线 | 若 PM 要求筛选，后台可最小新增 collection 级 `state` filter，或等待新版 `party-management` 合同 |
| 概览未显式展示已结束数量 | 概览不会误算进行中，但只在 `sessions` 指标卡 trend 中显示已结束，overview-dashboard 未直显结束数 | 本轮不改概览源码，只记录建议 | 后端 / PM 确定结束状态后，可把概览卡 trend 改为 `进行中 X / 已结束 Y` |
| 旧 IA 中 `sessions` 已被 Clean Slate 标记为待重建 | 当前页仍是“酒局管理”旧页 | 本轮只做后台状态核查，不改变第 14/15 节 IA 结论 | 后续由 `party-management` 新合同承接聚会管理 |

### 17.4 PM 回包结论

- 字段口径：后台应以 `liveSessions.state` 判断流程状态，取值至少包含 `进行中` / `已结束`；`liveSessions.status` 仅为运营状态，`status=正常` 不能让已结束继续算入进行中；`endedAt` 是结束时间字段，当前后台 pageMap 未展示，等待后端 008BV 稳定写入。
- 当前支持项：`sessions` 列表已显示 `state`，编辑字段也有 `state` 下拉；`getSessionMetrics()` 的“进行中”只按 `state.includes('进行中')` 统计，已结束只按 `state.includes('结束')` 统计，已结束不会因 `status=正常` 被计入进行中。
- 当前缺失项：没有 `endedAt` 列，没有页面级筛选控件，overview-dashboard 没有显式“已结束 N”趋势；这些不影响“已结束可清楚显示 / 不误算进行中”的最低要求，但影响后台整理效率。
- 改动理由：本轮不改后台静态资源和后端源码，因为后端 008BV 仍未交付结束写入与 `endedAt` 读回合同；贸然改静态筛选或字段可能接到不稳定字段。
- 后续触发条件：后端 008BV 回包 `state=已结束`、`endedAt`、`updatedAt` 的写入 / 读回证据后，后台再最小补 `endedAt` 列和可选 `state` 筛选；测试再验证结束聚会不会出现在进行中统计。
- 本节不写上线通过，不替后端 / 前端 / 测试确认完成。
