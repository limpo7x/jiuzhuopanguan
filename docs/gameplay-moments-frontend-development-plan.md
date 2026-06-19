# 酒桌判官精彩瞬间时间线前端开发计划

更新时间：2026-06-15

依据文档：

- `docs/gameplay-moments-development-spec.md`
- `docs/archive/gameplay-auction-moments-operation-plan.md`

## 1. 前端职责边界

本计划只覆盖小程序前端。后端 API、后台审核、数据模型、任务队列和数据库由对应开发人员负责，但前端必须按接口合同参与联调、验收和风险复核。

前端目标：

- 把酒局主流程从“判官持续记欠酒”调整为“全员精彩瞬间时间线”。
- 保留创建酒局、加入酒局、等待室、进行中记录、桌面模式、旧战报、积分中心、个人页等既有链路。
- 新增或改造开场打卡、精彩瞬间编辑、私密爆料、时间线展示、收尾照、时间线简报、异步分享图状态、榜单入口。
- 所有 UGC 相关界面必须覆盖未登录、非成员、非判官、上传失败、弱网重复提交、私密占位、审核状态和分享图失败态。
- 所有涉及新页面、核心流程改造或跨页面视觉统一的任务，必须引入 SKILL 参与设计评审或界面重构，不能只按开发便利堆功能。

不属于本阶段前端交付：

- 视频上传。
- 拍卖。
- 反转事件。
- 判官精选特权。
- 自由公开广场。
- 复杂图片编辑器。

## 2. 当前前端承载点

| 类型 | 当前文件 | 处理方式 |
| --- | --- | --- |
| 首页入口 | `miniprogram/pages/index/index.*` | 增加正在进行中酒局快捷返回 |
| 等待室 | `miniprogram/pages/waiting-room/index.*` | 增加每人 1 张开场打卡入口和状态 |
| 进行中记录 | `miniprogram/pages/live-record/index.*` | 主按钮改为添加精彩瞬间，欠酒/加酒/转盘降为辅助操作 |
| 桌面模式 | `miniprogram/pages/table-mode/index.*` | 增加时间线轮播，辅助数据弱展示 |
| 历史列表 | `miniprogram/pages/wine-history/index.*` | 展示待补图、分享图任务状态、可推举入口 |
| 个人页 | `miniprogram/pages/me/index.*` | 展示待补图和分享图完成提示 |
| 旧战报 | `miniprogram/pages/result-report/index.*` | 保留兼容，逐步增加跳转新简报 |
| 分享海报 | `miniprogram/pages/share-poster/index.*` | 从同步海报查看迁移到任务状态和成品图查看 |
| 服务层 | `miniprogram/services/operations.ts` | 新增 moments、timeline、brief、share task、rankings 类型与方法 |
| 全局路由 | `miniprogram/app.json` | 增加新页面路由 |

需要新增：

| 新增模块 | 建议路径 | 任务 |
| --- | --- | --- |
| 瞬间编辑页 | `miniprogram/pages/moment-editor/index.*` | `DEV-M1-03` |
| 时间线简报页 | `miniprogram/pages/session-brief/index.*` | `DEV-M2-02`、`DEV-M2-05` |
| 今日榜单页 | `miniprogram/pages/rankings/index.*` | `DEV-M5-01` |
| 时间线组件 | `miniprogram/components/moment-timeline/*` | `DEV-M1-05`、`DEV-M2-02` |
| 瞬间卡片 | `miniprogram/components/moment-card/*` | `DEV-M1-05` |
| 授权组件 | `miniprogram/components/moment-consent/*` | `DEV-M1-03` |
| 分享任务状态 | `miniprogram/components/share-task-status/*` | `DEV-M3-04` |
| 当前酒局返回条 | `miniprogram/components/session-return-bar/*` | `DEV-M1-06` |

## 3. 协作规则

1. 前端不先堆假页面。M0 接口合同、服务层类型和最小 smoke 口径确认后，再进入 M1 业务 UI。
2. 遇到依赖后端、后台、测试、风控或 PM 的任务时，必须先查看总控文档、后端计划、后台计划和进度台账，确认协作项是否已有实现和验证证据。
3. 如果协作项未完成，前端只能先做类型、空态、壳层或 mock-free 结构准备，并在交付记录中标记阻塞来源；不得假接接口或把页面标记完成。
4. 私密爆料必须和后端权限过滤同批联调；前端不能依赖本地隐藏来保护正文或图片。
5. 分享图必须按任务状态实现 `pending / processing / ready / failed / expired`，不能只做 ready 成功态。
6. 涉及积分、推举、榜单奖励的 M5 页面，必须等后端积分流水、后台奖励配置和风控规则可查后再开放入口。
7. 所有线上验证目标只允许指向 `api.pomer.cn` 的酒桌判官后端，不触碰 `pomer.cn` 公司官网。
8. 前端成员只能修改前端计划中的本人节点、交付记录和证据说明；不得直接修改总进度、后端/后台/测试节点或 PM 审核结论。
9. 需要跨角色协作时，前端节点只能标记“待联调 / 阻塞 / 待复核”，并写明依赖的任务编号、角色和缺少证据；总进度由项目经理/Codex PM 验证后统一汇总。

## 4. 前端任务摘选

### M0 合同与服务层

| 任务编号 | 前端工作 | 协作依赖 | 输出 |
| --- | --- | --- | --- |
| `DEV-M0-03` | 参与复核 `docs/api-spec.md` 中 moments、timeline、brief、share task、admin review 字段是否满足页面展示 | 后端/API | 前端字段缺口清单 |
| `DEV-M0-04` | 在 `operations.ts` 增加类型和请求方法：moments、uploads、timeline、events、brief、share tasks、history summaries、rankings、nominations | 后端/API | 服务层方法、类型定义、错误归一化 |
| `DEV-M0-05` | 参与 smoke 数据校验，确认前端能消费开场、普通、私密、辅助事件四类节点 | 后端/API、测试 | 联调记录 |

M0 前端完成标准：

- 不新增复杂 UI，只完成类型、方法和最小调用验证。
- 能通过接口读回时间线节点，并正确区分 `moment`、`event`、`private placeholder`。
- 所有新增 API 方法有失败错误抛出，不吞掉权限或上传失败。

### M1 小程序 MVP 时间线

| 任务编号 | 前端工作 | 涉及页面/组件 | 协作依赖 |
| --- | --- | --- | --- |
| `DEV-M1-01` | 等待室增加开场打卡入口、已上传状态、替换入口 | `waiting-room`、`moment-editor` | 后端开场瞬间接口 |
| `DEV-M1-02` | 进行中页主按钮改为“添加精彩瞬间”，欠酒/加酒/转盘降为辅助按钮 | `live-record` | 后端辅助事件接口 |
| `DEV-M1-03` | 新增瞬间编辑页，支持图片、文案、标签、可见范围、用途授权、草稿保留 | `moment-editor`，授权区可先内嵌在页面 | 上传接口、用户身份 |
| `DEV-M1-04` | 私密爆料选择本局成员；非接收者只渲染占位节点 | `moment-editor`、`moment-card` | 后端权限过滤 |
| `DEV-M1-05` | 时间线展示开场、精彩瞬间、辅助事件、私密占位、收尾 | `moment-timeline`、`moment-card`、`table-mode` | timeline 接口 |
| `DEV-M1-06` | 首页/判官入口/历史页展示当前进行中酒局，一键返回时间线 | `index`、`judge`、`wine-history`、`session-return-bar` | live session 接口 |

M1 前端完成标准：

- 普通成员可添加精彩瞬间，非判官不显示辅助事件提交权。
- 判官仍可执行欠酒、加酒、转盘，但这些操作写入时间线辅助事件。
- 上传失败时保留已选图片、文案、标签、授权，不丢草稿。
- 私密内容对非接收者不展示图片、正文、完整接收名单。
- 首页可从正在进行中酒局直接回到时间线。

### M2 结束页与时间线简报

| 任务编号 | 前端工作 | 涉及页面/组件 | 协作依赖 |
| --- | --- | --- | --- |
| `DEV-M2-01` | 结束流程引导上传收尾照，不强制阻塞结束 | `table-mode`、`moment-editor` | closing moment 接口 |
| `DEV-M2-02` | 新增时间线简报页，展示开场、过程、辅助事件、收尾 | `session-brief`、`moment-timeline` | sessionBrief 接口 |
| `DEV-M2-04` | 个人页/历史页显示待补图数量和继续补全入口 | `me`、`wine-history` | user summaries 接口 |
| `DEV-M2-05` | 旧 `result-report` 保留兼容，新增进入时间线简报的入口 | `result-report`、`wine-history` | brief 与 report 映射 |

M2 前端完成标准：

- 无收尾照、部分瞬间缺图时仍能结束酒局。
- 待补图节点有明确状态，不能显示为可公开分享或可上榜。
- 旧战报页面不被破坏；用户能从旧入口进入新简报。

### M3 异步分享图

| 任务编号 | 前端工作 | 涉及页面/组件 | 协作依赖 |
| --- | --- | --- | --- |
| `DEV-M3-04` | 个人页/酒局历史展示分享图生成中、已生成、失败可重试 | `me`、`wine-history`、`share-task-status` | share task 接口 |
| `DEV-M3-04` | 分享海报页改造为任务查询、成品图查看、失败重试 | `share-poster` | 后端任务状态机 |
| `DEV-M3-05` | 前端只展示服务端筛选结果和状态说明，不在本地重新决定公开内容 | `share-poster`、`session-brief` | 服务端分享图规则 |

M3 前端完成标准：

- 用户点击生成分享图后可离开页面。
- 个人页能看到任务状态变化。
- 失败任务展示失败摘要和重试入口。
- `ready` 后可查看、保存或分享成品图。

### M4 后台审核协作

M4 主要由后台和后端负责。前端需要配合：

- 在时间线、简报、历史、榜单入口识别 `reviewStatus`、`secondaryReviewStatus`、`rankingEligible`、`rewardEligible`。
- 对 `hidden / rejected / require_resubmit` 展示对应状态，不继续引导分享、上榜或打赏。
- 后台要求重传后，前端给上传者提供补图入口。

### M5 第二阶段榜单与推举

| 任务编号 | 前端工作 | 涉及页面/组件 | 协作依赖 |
| --- | --- | --- | --- |
| `DEV-M5-01` | 新增今日榜单页，支持多个榜单分类切换 | `rankings` | rankings 接口 |
| `DEV-M5-02` | 增加推举入口和确认弹层 | `session-brief`、`wine-history`、`rankings` | nomination 接口 |
| `DEV-M5-03` | 只展示可推举瞬间，前端禁用不符合资格节点 | `moment-card` | 后端资格计算 |
| `DEV-M5-04` | 积分消耗、失败退回提示、流水入口 | `rankings`、`wine-points` | points ledger |

M5 前端完成标准：

- 只有 `complete + consent + approved + rankingEligible` 的瞬间出现推举入口。
- 推举前明确积分消耗，失败时展示退回或待处理状态。
- 积分相关结果以后端流水为准，不由前端本地计算。

## 5. 页面实施顺序

1. 服务层优先：`operations.ts` 增加类型和 API 方法。
2. 基础组件：`moment-card`、`moment-timeline`、`moment-consent`、`share-task-status`、`session-return-bar`。
3. M1 页面：`moment-editor`、`waiting-room`、`live-record`、`index`、`wine-history`。
4. M2 页面：`session-brief`、`table-mode`、`result-report`、`me`。
5. M3 页面：`share-poster`、`wine-history`、`me`。
6. M5 页面：`rankings`、推举入口、积分提示。

## 6. UI 设计与 SKILL 必须项

UI/UX 负责人已新增。涉及界面交互、视觉一致性、状态表达、分享图视觉、移动端流程或设计 QA 的前端任务，必须先交给 UI/UX 负责人按 `docs/gameplay-moments-ui-ux-development-plan.md` 自动选择合适 SKILL 配合评审。

原则：

- 保持现有小程序导航和页面风格，不做无关视觉大改。
- 时间线相关组件统一视觉语言：节点类型、状态标签、隐私占位、待补图、审核中、生成中。
- 进行中页要把“添加精彩瞬间”作为最高优先级操作；欠酒、加酒、转盘降为工具按钮。
- 不在页面里写大段功能说明，用按钮、状态、占位和短文案引导。

必须使用 SKILL 参与的范围：

- `DEV-M1-03` 瞬间编辑页：提交前必须用 SKILL 做表单密度、图片上传区、授权区、私密成员选择和失败态设计评审。
- `DEV-M1-05` 时间线组件：提交前必须用 SKILL 统一节点卡片、状态标签、私密占位、辅助事件和待补图样式。
- `DEV-M1-02` 进行中页改造：主按钮、辅助按钮、判官权限态和非判官视图必须经过 SKILL 评审，避免旧记账界面和新时间线目标冲突。
- `DEV-M2-02` 时间线简报页：必须用 SKILL 参与页面结构设计，保证开场、过程、辅助事件、收尾照有清晰层级。
- `DEV-M3-04` 分享图任务状态：必须用 SKILL 评审 `pending / processing / ready / failed / expired` 的状态表达和重试入口。
- `DEV-M5-01` 今日榜单页：必须用 SKILL 参与榜单分类、推举入口、积分消耗提示和不可推举状态设计。
- 若 `waiting-room`、`live-record`、`share-poster`、`result-report`、`wine-history`、`me` 多页改造后视觉割裂，必须使用 SKILL 做整套时间线界面统一重构。
- 若新增组件导致卡片套卡片、按钮文案溢出、状态重叠、移动端布局不稳或权限态不清晰，必须使用 SKILL 修正后再进入验收。

SKILL 参与的交付要求：

- 前端负责人不自行替 UI/UX 判定 SKILL 是否适用；必须提交目标页面、截图、状态样本和交互说明，由 UI/UX 自动选择 `design-qa`、`imagegen-frontend-mobile`、`imagegen` 或 `design-taste-frontend` 等合适工具。
- 每个相关任务必须在提交说明中写明：使用的 SKILL、设计判断、保留的项目既有风格、调整的组件或页面、未采纳建议及理由。
- SKILL 不能替代接口、权限、隐私和积分规则；这些仍以后端合同和产品规则为准。
- SKILL 使用范围只限小程序前端页面和组件，不触碰后端、后台、`api.pomer.cn` 部署配置，也不影响 `pomer.cn` 官网。
- PM 审核时必须检查 UI/UX 的 SKILL 选择记录和评审证据；缺少记录的相关前端任务不能标记为“通过”。

## 7. 联调清单

| 场景 | 前端验收点 | 后端/后台依赖 |
| --- | --- | --- |
| 开场打卡 | 每人最多 1 张，可替换，时间线出现 opening | moments 创建/更新 |
| 全员瞬间 | 非判官可提交 highlight，上传者正确 | member 鉴权 |
| 私密爆料 | 接收者看正文和图，非接收者只看占位 | timeline 权限过滤 |
| 辅助事件 | 判官提交欠酒/加酒/转盘后时间线出现 event | events 接口、幂等键 |
| 未补图 | 可结束酒局，但节点不可分享/上榜/打赏 | completionStatus |
| 收尾照 | 结束流程可选上传 closing | closing moment |
| 简报 | 按时间线展示 opening/highlight/event/closing | sessionBrief |
| 分享图任务 | pending、processing、ready、failed、retry 全部可见 | share task 状态机 |
| 后台要求重传 | 前端展示需重传，并提供补图入口 | admin review 接口 |
| 榜单推举 | 只对可推举节点开放入口，积分结果可追溯 | nominations、points ledger |

## 8. 验证要求

每次前端改动至少执行：

```powershell
pwsh -NoLogo -NoProfile -Command "$PSVersionTable.PSVersion.ToString()"
npm.cmd run check:encoding
npm.cmd run typecheck
```

涉及 JS 后端联调或新增 smoke 时，配合后端执行：

```powershell
node --check backend/server.js
node backend/scripts/smoke-moments-flow.js
```

若只修改文档，至少执行：

```powershell
npm.cmd run check:encoding
```

## 9. 交付记录格式

每个前端任务完成后，提交说明必须包含：

- 任务编号：例如 `DEV-M1-03`。
- 改动文件清单。
- 接口依赖和字段变化。
- UI/UX / SKILL 参与记录：UI/UX 自动选择的 SKILL、选择依据、设计评审结论、界面重构范围、截图或 blocked 原因。
- 前端状态覆盖：空态、失败态、权限态、弱网态。
- 已执行验证命令和结果。
- 未验证事项和原因。
- 是否涉及 `api.pomer.cn` 线上验证。

## 10. 第一轮建议排期

| 顺序 | 任务 | 预计输出 | 前置依赖 |
| --- | --- | --- | --- |
| 1 | `DEV-M0-04` | 服务层类型和 API 方法 | 后端接口字段确认 |
| 2 | `DEV-M1-03` | 瞬间编辑页和授权组件 | 上传接口、moments 创建接口 |
| 3 | `DEV-M1-05` | 时间线组件和节点卡片 | timeline 接口 |
| 4 | `DEV-M1-01` | 等待室开场打卡 | opening 类型可写 |
| 5 | `DEV-M1-02` | 进行中页主入口和辅助事件降权 | events 接口 |
| 6 | `DEV-M1-06` | 当前酒局快捷返回 | live session 状态 |
| 7 | `DEV-M2-02` | 时间线简报页 | sessionBrief 接口 |
| 8 | `DEV-M2-04` | 待补图入口 | user summaries 接口 |
| 9 | `DEV-M3-04` | 分享图任务状态 | share task 接口 |
| 10 | `DEV-M5-01` | 今日榜单页 | rankings 和积分规则稳定 |

结论：前端第一优先级不是重画页面，而是先把 `operations.ts` 的 moments 合同、时间线组件和瞬间编辑页打通。凡涉及新页面、核心流程改造或跨页面视觉统一的任务，必须交给 UI/UX 负责人自动选择合适 SKILL 参与设计评审；M1 主链路跑通后，再按实际割裂程度决定是否追加全量 UI 重构。

## 11. 前端交付记录

| 日期 | 任务编号 | 交付内容 | UI/UX / SKILL 参与记录 | 验证 | 未验证 |
| --- | --- | --- | --- | --- | --- |
| 2026-06-15 | `DEV-M0-04` | `operations.ts` 已出现 moments、timeline、brief、share task、user summaries 等服务层方法和类型 | 不涉及视觉 SKILL | `npm.cmd run typecheck` 通过 | 需前端负责人复核字段命名和页面消费 |
| 2026-06-15 | `DEV-M1-01`、`DEV-M1-02`、`DEV-M1-05` | 等待室、进行中页和 timeline 组件已出现：开局签到入口、记精彩瞬间入口、`moment-timeline`、`moment-card` | 待补 UI/UX SKILL 自动选择与评审记录 | `npm.cmd run typecheck`、`npm.cmd run check:encoding` 通过 | 未做微信开发者工具/真机固定酒局联调；非判官权限态需实测 |
| 2026-06-15 | `DEV-M1-03`、`DEV-M1-04` | `moment-editor` 已出现，支持上传、说明、节点类型、可见范围、授权、`clientDraftId`、私密/指定可见成员选择和 `visibleProfileIds` 提交 | 待补 UI/UX SKILL 自动选择与评审记录 | `npm.cmd run typecheck`、`npm.cmd run check:encoding` 通过；公网接口已验证非本局 `visibleProfileIds` 返回 400 | 未做真机三用户端到端：A 发私密给 B，C 只看到占位 |
| 2026-06-15 | `DEV-M1-02`、`DEV-M1-03`、`DEV-M1-04` | 第二轮 P0 风险修复：`live-record` 的“记精彩瞬间”入口不再仅限判官展示，普通成员也可进入 `moment-editor?nodeType=highlight`；判官专属的添加玩家、欠酒/已喝调整、转盘和结束本局入口仍保留 `isJudge` 限制 | 依据 UI/UX `UX-RETURN-M1-001` 和测试 `QA-M1-002` 做最小代码修复；未新增设计系统、不重构无关页面 | `pwsh` 7.6.2 已确认；`npm.cmd run typecheck`、`npm.cmd run check:encoding` 通过 | 未做微信开发者工具/真机判官/非判官同局截图；仍需固定三用户私密链路：A 发私密给 B，B 可见正文和图，C 只看到占位 |
| 2026-06-15 | `DEV-M1-06` | 新增 `session-return-bar` 组件和 `session-return` 路由工具；首页、判官页、历史页在有真实 `sessionId` 或历史接口返回“进行中”记录时展示一键返回时间线入口 | 使用 `design-taste-frontend` 做轻量评审；按当前小程序暖色、圆角、短文案和强行动入口风格落地，不引入新设计系统，不重构无关页面 | `pwsh` 7.6.2 已确认；`npm.cmd run typecheck`、`npm.cmd run check:encoding` 通过 | 未做微信开发者工具/真机点击回到固定测试酒局；未做跨设备历史接口页面级联调 |
| 2026-06-15 | `DEV-M2-02`、`DEV-M2-05` | 新增 `session-brief` 页面，支持 `briefId` 读取或 `sessionId` 创建/刷新简报，复用 `moment-timeline`，展示待补图、收尾照状态、可推举状态和分享图任务；旧 `result-report` 新增进入简报入口 | 使用 `design-taste-frontend` 做轻量评审；页面结构按“简报摘要 + 时间线 + 分享任务”三段，沿用现有暖色、圆角、状态标签和短文案，不重构旧战报主流程 | `pwsh` 7.6.2 已确认；`npm.cmd run typecheck`、`npm.cmd run check:encoding` 通过 | 未做真机固定酒局页面联调；`wine-history` 已结束记录进入简报入口仍待补；收尾照上传引导未接 |
| 2026-06-15 | `DEV-M2-01`、`DEV-M2-05` | `table-mode` 新增可选收尾照入口，打开 `moment-editor` 的 closing 节点且不阻塞结束；`wine-history` 已结束记录新增独立“简报”按钮进入 `session-brief` | 使用 `design-taste-frontend` 做轻量评审；收尾照作为次级引导卡，不抢占“结束本局”；历史页简报按钮保持轻量，不改变整行旧战报点击行为 | `pwsh` 7.6.2 已确认；`npm.cmd run typecheck`、`npm.cmd run check:encoding` 通过 | 未做真机上传 closing moment；未验证无收尾照结束后简报状态；未做历史页固定酒局入口联调 |
| 2026-06-15 | `DEV-M2-04`、`DEV-M3-04` | 新增 `session-moment-summary` 组件并接入 `me`、`wine-history`：展示待补图数量、可续补数量、可推举标记和分享图任务状态；支持进入简报、ready 预览、failed/expired 用户侧 retry 后刷新 | 使用 `design-taste-frontend` 做轻量评审；该组件属于产品内状态摘要，不套用 landing 规则，仅采用状态完整、按钮对比、圆角一致、短文案和紧凑密度要求；复用 `share-task-status`，不另造状态视觉 | `pwsh` 7.6.2 已确认；`npm.cmd run typecheck`、`npm.cmd run check:encoding` 通过 | 未做微信开发者工具/真机固定酒局联调；待补图补齐后状态刷新、failed/expired 真实任务 retry、分享海报页任务化改造仍待复核 |
| 2026-06-15 | `DEV-M5-01`、`DEV-M5-02`、`DEV-M5-03` | `operations.ts` 已补 rankings、nomination eligibility、nomination 创建服务层类型和方法，可供 `rankings` 页面和推举入口联调 | 不涉及页面视觉 SKILL；仅补 API client 合同 | `npm.cmd run typecheck`、`npm.cmd run check:encoding` 通过 | 服务层已就绪；页面首轮实现见下一条，仍需前端负责人真机联调 |
| 2026-06-15 | `DEV-M5-01`、`DEV-M5-02`、`DEV-M5-03` | 新增 `rankings` 页面首轮实现：分类切换、榜单列表、空态、刷新、图片预览、资格确认和推举提交 | 使用 `design-taste-frontend` 做轻量评审；该页属于产品内列表页，沿用现有暖色体系、圆角和简洁状态表达，不引入营销式视觉 | `npm.cmd run typecheck`、`npm.cmd run check:encoding` 通过 | 未做微信开发者工具/真机联调；需固定榜单数据、重复推举、积分不足、移出榜单后空态复测 |
| 2026-06-15 | `DEV-M5-01`、`DEV-M5-02` | `session-brief` 和 `wine-history` 已接入“今日榜单”入口，跳转到 `rankings?category=today_highlight` | 沿用现有页面操作按钮样式，入口保持轻量，不改动摘要组件合同 | `npm.cmd run typecheck`、`npm.cmd run check:encoding` 通过；`git diff --check` 仅有 CRLF 提示 | 仍需微信开发者工具/真机确认跳转、返回栈和页面曝光位置 |
| 2026-06-15 | `DEV-M3-04` | `share-task-status` 组件已出现，可展示 pending/processing/ready/failed/expired，ready 触发预览，failed/expired 触发 retry 事件；个人页/历史页已通过 `session-moment-summary` 消费 user summaries | 使用 `design-taste-frontend` 做轻量评审；任务状态复用统一组件，不在个人页/历史页重复设计状态表达 | `npm.cmd run typecheck`、`npm.cmd run check:encoding` 通过；公网 ready PNG GET 返回 200 `image/png` | 分享海报页仍需完整任务化改造；个人页/历史页仍缺真机联调 |
| 2026-06-15 | `DEV-M3-04`、`DEV-M3-05` | `share-poster` 已从旧同步海报页改为分享图任务页：兼容 `taskId/briefId/sessionId/reportId`，支持生成任务、刷新任务、ready 成品图预览/保存、failed/expired 重试，并继续保留旧战报摘要和分享入口 | 使用 `design-taste-frontend` 做轻量评审；该页属于产品内任务状态页，只采用状态完整、按钮不重复、成品图真实展示、短文案和现有暖色体系，不引入新设计系统 | `pwsh` 7.6.2 已确认；`npm.cmd run typecheck`、`npm.cmd run check:encoding` 通过 | 未做微信开发者工具/真机联调；仍需真实 pending/processing/ready/failed/expired 样本、保存到相册权限、朋友圈分享入口和视觉验收 |
| 2026-06-15 | `DEV-M1-02`、`DEV-M1-03`、`DEV-M1-04` | 第三轮前端证据准备：已整理微信开发者工具/真机验收步骤，覆盖判官/非判官入口、A 发私密给 B、B/C timeline 视角、上传失败、保存中、授权取消和重复提交 | 依据测试执行包 `QA-M1-002` 至 `QA-M1-005`、UI/UX `UX-SHOT-M1-*` 与接口固定数据包 `it-moments-20260615-a` / `it-member-*` 编写；本轮不改业务源码，不替 UI/UX 判定通过 | 文档-only 更新；需执行 `npm.cmd run check:encoding` | 阻塞：接口联调尚未提供实际 `sessionId/profileId/token`；未做微信开发者工具/真机截图和录屏 |
| 2026-06-15 | `INT-DATA-001`、`DEV-M1-02`、`DEV-M1-03`、`DEV-M1-04` | INT-DATA-001 前端真机准备清单：已读取 actual manifest，补齐微信开发者工具/体验版进入路径、host/memberA/memberB/outsider 角色页面、M1 私密链路截图/录屏命名和本地 API 配置风险 | 本轮仅做前端联调准备，不改业务源码、不改 PM 总台账、不替测试写通过、不执行 cleanup、不触碰线上写入 | 文档-only 更新；需执行 `npm.cmd run check:encoding` | 阻塞：本地 `127.0.0.1:3221` 服务当前需接口联调/后端恢复；缺微信开发者工具版本、体验版二维码、真机设备和三用户登录态 |

## 12. `DEV-M1-02/03/04` 前端真机验收步骤

本节只记录前端侧可执行步骤和证据要求，不替代测试、接口联调、UGC 风控或 UI/UX 通过结论。所有写入型步骤必须使用接口联调负责人提供的固定测试酒局和测试账号，不得临时污染真实用户数据。

### 12.1 前置数据依赖

以下信息由接口联调负责人提供后，前端和测试才能执行完整链路：

| 数据 | 用途 | 等待项 |
| --- | --- | --- |
| 固定测试酒局 `it-moments-20260615-a` | 打开 `live-record`、提交 highlight/private、读取 timeline | 实际 `sessionId`、酒局状态、清理策略 |
| 判官 `it-host-20260615` | 验证判官入口、辅助事件权限、timeline 视角 | 实际 `profileId`、登录方式或 token |
| 普通成员 A `it-member-a-20260615` | 验证非判官可进入“记精彩瞬间”、上传 highlight/private | 实际 `profileId`、登录方式或 token |
| 普通成员 B `it-member-b-20260615` | 验证 private 接收者能看到正文和图片 | 实际 `profileId`、登录方式或 token |
| 非接收者/非成员 C `it-outsider-20260615` | 验证 C 只看到占位或非成员 403 | 实际 `profileId`、登录方式或 token |

### 12.2 `DEV-M1-02` 判官/非判官入口验收

1. 使用判官账号打开固定酒局的 `live-record` 页面。
2. 截图记录页面顶部“记精彩瞬间”入口可见。
3. 点击“记精彩瞬间”，确认进入 `moment-editor?nodeType=highlight`。
4. 返回 `live-record`，确认判官仍能看到添加玩家、欠酒/已喝调整、转盘、结束本局等判官能力。
5. 使用普通成员 A 打开同一固定酒局的 `live-record` 页面。
6. 截图记录普通成员也能看到“记精彩瞬间”入口。
7. 点击入口，确认进入 `moment-editor?nodeType=highlight`。
8. 确认普通成员不显示添加玩家、欠酒/已喝调整、转盘、结束本局等判官能力。
9. 记录入口路径、账号角色、`sessionId`、设备型号和截图文件名。

必须等待接口联调提供：固定 `sessionId`、判官账号、普通成员 A 账号。

### 12.3 `DEV-M1-03` 瞬间编辑页上传与失败态验收

1. 使用普通成员 A 从 `live-record` 进入 `moment-editor?nodeType=highlight`。
2. 截图：无图、无文案初始态。
3. 输入文案和标签，选择图片，截图：有图、有文案、授权区默认态。
4. 点击保存，截图或录屏：保存中状态。
5. 保存成功后，返回 `live-record` 或刷新 timeline，确认出现 A 上传的 highlight。
6. 断网或使用测试环境故意制造上传/保存失败，确认图片、文案、授权选择不丢失，并截图失败提示。
7. 快速重复点击保存，确认不会生成重复 moment；记录 timeline 中 moment 数量或接口摘要。
8. 取消榜单/分享授权后保存一次，记录授权取消状态截图。

必须等待接口联调提供：普通成员 A 账号、可写固定 `sessionId`、上传接口可用环境、失败态制造方式或可复现错误样本。

### 12.4 `DEV-M1-04` 私密爆料三用户验收

1. 使用普通成员 A 进入 `moment-editor`，切换为 private 或 selected 可见范围。
2. 截图：私密未选成员状态；点击保存应提示“请选择可见成员”。
3. 选择普通成员 B，截图：已选成员状态。
4. 上传图片、输入私密文案，保存为 `private-a-to-b-20260615`。
5. 使用 A 刷新 timeline，确认 A 可看到正文和图片。
6. 使用 B 刷新同一酒局 timeline，确认 B 可看到正文和图片。
7. 使用 C 刷新同一酒局 timeline，确认 C 只能看到私密占位，不展示图片、正文、完整接收名单。
8. 如 C 是非成员，记录接口或页面 403/无权限表现。
9. 保存三组截图/录屏和 timeline 响应摘要，标注 `momentId`、`sessionId`、A/B/C 的 `profileId`。

必须等待接口联调提供：A/B/C 实际 `profileId/token`、固定私密样本 `momentId` 或允许前端现场创建样本、timeline 响应摘要获取方式。

### 12.5 证据命名建议

| 场景 | 建议文件名 |
| --- | --- |
| 判官入口 | `QA-DEV-M1-02-live-record-entry-host-iPhone13-20260615.png` |
| 普通成员入口 | `QA-DEV-M1-02-live-record-entry-memberA-iPhone13-20260615.png` |
| 上传失败保留草稿 | `QA-DEV-M1-03-moment-editor-upload-failed-memberA-iPhone13-20260615.png` |
| 重复提交校验 | `QA-DEV-M1-03-moment-editor-duplicate-submit-memberA-iPhone13-20260615.mp4` |
| 私密接收者视角 | `QA-DEV-M1-04-timeline-private-visible-memberB-iPhone13-20260615.png` |
| 私密非接收者占位 | `QA-DEV-M1-04-timeline-private-placeholder-memberC-iPhone13-20260615.png` |

### 12.6 当前待联调结论

- 前端代码侧已满足进入验收的最低条件：普通成员入口已放开，`moment-editor` 已提交 `clientDraftId` 和 `visibleProfileIds`，`moment-timeline` 可展示服务端 timeline。
- 当前不能写“通过”：缺实际固定 `sessionId/profileId/token`、缺微信开发者工具/真机截图、缺三用户私密 timeline 录屏、缺 UI/UX 设计 QA。
- 前端下一步只在接口联调固定数据到位后执行截图/录屏，不再临时造假数据。

## 13. `INT-DATA-001` 前端待联调记录

本节只记录 M1 三用户私密验证所需的前端进入方式和证据命名。本轮未实际运行微信开发者工具/体验版，不写通过；不改业务源码、不改 PM 总台账、不改测试结论、不执行 cleanup、不触碰线上写入。

### 13.0 latest manifest ID 更新记录

`INT-DATA-001` manifest 已重建，旧 `session-1781506784680-02d0a3` 及其旧 profileId 不得继续用于真机/开发者工具验证。后续 M1 三用户私密验证必须使用当前 manifest：`session-1781507687012-e4343d`，host `user-1781507686650-a33705`，memberA `user-1781507686651-a46952`，memberB `user-1781507686651-000860`，outsider `user-1781507686651-093df4`。

### 13.1 页面路径与 query

| 页面 | 路径 | Query |
| --- | --- | --- |
| 当前酒局记录页 | `/pages/live-record/index` | `sessionId=session-1781507687012-e4343d`；可选 `role=host` 或 `role=member` |
| 私密瞬间编辑页 | `/pages/moment-editor/index` | `sessionId=session-1781507687012-e4343d`；`nodeType=private`；`visibility=private` |

### 13.2 角色进入页面

| 角色 | profileId | 应进入页面 | 前端检查点 |
| --- | --- | --- | --- |
| host | `user-1781507686650-a33705` | `/pages/live-record/index?sessionId=session-1781507687012-e4343d&role=host` | “记精彩瞬间”入口可见；判官专属能力仍保留 |
| memberA | `user-1781507686651-a46952` | `/pages/live-record/index?sessionId=session-1781507687012-e4343d&role=member`；`/pages/moment-editor/index?sessionId=session-1781507687012-e4343d&nodeType=private&visibility=private` | 普通成员可进入“记精彩瞬间”；提交 A 发给 B 的私密瞬间 |
| memberB | `user-1781507686651-000860` | `/pages/live-record/index?sessionId=session-1781507687012-e4343d&role=member` | timeline 中可见 A 发给 B 的私密正文和图片 |
| outsider | `user-1781507686651-093df4` | `/pages/live-record/index?sessionId=session-1781507687012-e4343d&role=member` | timeline 中只能看到私密占位或无权限态，不得看到正文和图片 |

### 13.3 M1 私密链路截图/录屏命名

| 角色 | 场景 | 文件名 |
| --- | --- | --- |
| host | 判官进入 `live-record`，入口和判官能力边界 | `FE-INT-DATA-001-DEV-M1-02-entry-host-<device>-20260615.png` |
| memberA | 普通成员进入 `live-record`，入口可见且无判官能力 | `FE-INT-DATA-001-DEV-M1-02-entry-memberA-<device>-20260615.png` |
| memberA | 进入 private 编辑、上传图文、保存私密瞬间 | `FE-INT-DATA-001-DEV-M1-04-private-submit-memberA-<device>-20260615.mp4` |
| memberB | timeline 可见私密正文和图片 | `FE-INT-DATA-001-DEV-M1-04-private-visible-memberB-<device>-20260615.png` |
| outsider | timeline 只见私密占位或无权限态 | `FE-INT-DATA-001-DEV-M1-04-private-placeholder-outsider-<device>-20260615.png` |
| memberA | 失败/重复提交验证，草稿保留且不重复创建 | `FE-INT-DATA-001-DEV-M1-03-failed-or-duplicate-memberA-<device>-20260615.mp4` |

### 13.4 本地 API 配置边界与阻塞

- 本地第一小时依赖接口联调确认并保持 `127.0.0.1:3221` 服务可访问。
- 当前前端 API 基础地址默认仍是线上 `https://api.pomer.cn/api/v1`。如要走 `http://127.0.0.1:3221/api/v1`，只能由 PM 单独授权配置方式；本轮不改源码。
- 真机体验版不能直接使用开发电脑的 `127.0.0.1`。若测试要在真机打本地数据，需要接口联调/后端提供 LAN IP、代理/隧道或等价可访问 API，并说明微信合法域名/不校验合法域名风险。
- 当前阻塞：缺微信开发者工具版本、体验版二维码、设备信息、A/B/outsider 登录态注入或登录方式，以及可访问的 `127.0.0.1:3221` 等价环境确认。

### 13.5 人工真机前端执行入口包

本包基于测试计划 13.15.8、UI/UX 计划 10.2.3 和接口联调计划 3.4，仅供人工测试人打开微信开发者工具 GUI、预览或体验版时使用。它不是测试通过记录；本轮未运行真机、未生成二维码、未改业务源码。

#### 13.5.1 项目与 appid

| 项目 | 值 |
| --- | --- |
| 工作目录 | `F:\codexlist\jiuzhuopanguan` |
| 小程序根目录 | `miniprogram/` |
| 项目配置 | `project.config.json` |
| appid | `wxe67ede146a5a91db` |
| compileType | `miniprogram` |

#### 13.5.2 API base 候选与配置边界

| 场景 | API base | 前端口径 |
| --- | --- | --- |
| 开发者工具本机调试 | `http://127.0.0.1:3221/api/v1` | 仅本机调试可用；依赖接口联调保持 3221 服务 |
| 同 LAN / 代理真机候选 | `http://192.168.0.101:3221/api/v1` | 手机与电脑需同网或走代理；需处理微信合法域名或“不校验合法域名”策略 |
| 默认 / 上线前 | `https://api.pomer.cn/api/v1` | 当前前端默认值；本地 LAN base 不得作为上线或线上验收通过依据 |

当前前端支持通过本地存储键 `runtime-api-base` 覆盖 API base，但本轮不修改源码、不替测试配置设备。若人工执行要切到本地或 LAN API，需 PM 授权测试执行人按设备环境设置，并在证据中截图记录 API base。

#### 13.5.3 页面路径、query 与角色映射

| 角色 | profileId | 页面路径 | 必填 query | 预期 |
| --- | --- | --- | --- | --- |
| host / 判官 | `user-1781507686650-a33705` | `/pages/live-record/index?sessionId=session-1781507687012-e4343d&role=host` | `sessionId`、可选 `role=host` | 判官视角可进入当前酒局；“记精彩瞬间”入口可见；判官能力边界可截图 |
| memberA / 上传者 | `user-1781507686651-a46952` | `/pages/live-record/index?sessionId=session-1781507687012-e4343d&role=member` | `sessionId`、可选 `role=member` | 普通成员入口可见；非判官能力不可见 |
| memberA / 私密编辑 | `user-1781507686651-a46952` | `/pages/moment-editor/index?sessionId=session-1781507687012-e4343d&nodeType=private&visibility=private` | `sessionId`、`nodeType=private`、`visibility=private` | 录屏 A 选择 B、上传图文并保存私密瞬间 |
| memberB / 接收者 | `user-1781507686651-000860` | `/pages/live-record/index?sessionId=session-1781507687012-e4343d&role=member` | `sessionId`、可选 `role=member` | timeline 可见 A 发给 B 的私密正文和图片 |
| outsider / C | `user-1781507686651-093df4` | `/pages/live-record/index?sessionId=session-1781507687012-e4343d&role=member` | `sessionId`、可选 `role=member` | 非本局应 403 或只显示无权限/占位；不得看到私密正文和图片 |

固定样本：private moment `moment-1781507687036-c0cc62cc`，ready share task `share-task-1781507687046-d1098582`，expired share task `share-task-it-moments-20260615-expired`。旧 `session-1781506784680-02d0a3` 已失效，人工真机不得混用。

#### 13.5.4 截图/录屏文件名

前端交给测试的入口包建议同时满足 QA 与 UI/UX 命名要求；测试计划的 `QA-*` 为验收归档名，UI/UX 计划的 `UX-*` 为设计 QA 接收名。

| 用途 | 角色 | 建议文件名 |
| --- | --- | --- |
| 普通成员入口 | memberA | `QA-DEV-M1-03-editor-initial-memberA-<device>-session-1781507687012-e4343d-20260615.png` |
| 私密提交录屏 | memberA | `QA-DEV-M1-04-private-submit-memberA-<device>-session-1781507687012-e4343d-20260615.mp4` |
| 接收者可见 | memberB | `QA-DEV-M1-04-private-visible-memberB-<device>-moment-1781507687036-c0cc62cc-20260615.png` |
| outsider/C 不泄露 | outsider | `QA-DEV-M1-04-private-placeholder-outsider-<device>-moment-1781507687036-c0cc62cc-20260615.png` |
| 失败/重复提交 | memberA | `QA-DEV-M1-03-duplicate-or-failed-memberA-<device>-session-1781507687012-e4343d-20260615.mp4` |
| UI/UX 私密选择接收包 | memberA | `UX-UX-M1-01-UX-SHOT-M1-EDITOR-02-moment-editor-private-selected-member-a-<device>-20260615.mp4` |
| UI/UX 私密占位接收包 | outsider | `UX-UX-M1-01-UX-SHOT-M1-TIMELINE-01-moment-timeline-private-placeholder-outsider-<device>-20260615.png` |

每个截图/录屏必须同时记录：入口路径、角色、profileId、sessionId、API base、设备型号、系统版本、微信版本、开发者工具版本或体验版来源、关联接口摘要。缺任一关键字段时，前端只能标记待补证据，不能写通过。

#### 13.5.5 当前前端无法单独完成的事项

| 事项 | 当前状态 | 责任方 / 下一步 |
| --- | --- | --- |
| 体验版二维码 | 前端线程当前未生成、未取得二维码 | PM/测试提供体验版发布或预览二维码；前端只记录入口路径 |
| 预览二维码 | 未生成；未运行微信开发者工具 GUI | PM/测试安排可操作微信开发者工具环境并截图二维码来源 |
| 开发者工具截图 | 未采集；本轮不运行 GUI | 测试/人工执行人采集项目打开截图、编译模式和 API base 截图 |
| 真机设备 | 缺设备型号、系统版本、微信版本、网络信息 | 测试提供 iOS/Android 设备和原始截图/录屏 |
| A/B/C 登录态 | manifest 有 token/profileId，但未映射到真实微信登录或设备态 | PM/测试/接口联调确认登录态注入或角色切换方式 |
| LAN / 代理访问 | 接口联调提供候选 `192.168.0.101:3221`，但真机未证明可访问 | 接口联调配合测试记录同网、代理、合法域名或不校验合法域名策略 |

当前结论：前端可交付人工真机执行入口包和路径清单；仍缺二维码、设备、登录态、GUI/真机截图与接口摘要回收。在这些证据补齐前，`DEV-M1-03`、`DEV-M1-04`、`UGC-QA-001` 至 `UGC-QA-003` 只能保持待联调 / blocked，不能写通过。

## 14. `PR-FE-001` 聚会记录师改版前端影响面与 P0 修复计划

本节只记录前端职责内的现状映射、P0 视觉缺陷修复和待 UI/UX 方案回收的影响面。产品名从本轮改版起面向用户统一为“聚会记录师”；旧“酒桌判官”仍可作为历史代码模块名和旧文档上下文保留。完整品牌重构、三步流程重排、视觉系统和底部 Tab 信息架构调整需等待 UI/UX 方案与 PM 统一排期，本轮不替 UI/UX 或测试写通过。

### 14.1 真机截图到页面/组件映射

| 问题编号 | 真机素材 | 当前页面/组件 | 主要文件 | 前端判断 |
| --- | --- | --- | --- | --- |
| `PR-UX-P0-001` | `C:\Users\Administrator\Desktop\真机测试\微信图片_20260615204251_176_528.jpg` | 创建流程第 3 步邀请/预选玩家页，底部双按钮 | `miniprogram/pages/add-players/index.wxml`、`miniprogram/pages/add-players/index.less` | 可前端立即修复：底部按钮布局超边界，和品牌重构无强依赖 |
| `PR-UX-P0-002` | `C:\Users\Administrator\Desktop\真机测试\微信图片_20260615204250_174_528.jpg` | 创建流程第 1 步，模板选择区 | `miniprogram/pages/create-session/index.wxml`、`miniprogram/pages/create-session/index.less`、`miniprogram/pages/create-session/index.ts` | 可前端立即修复：模板大卡横向露半张并被底部 CTA 遮挡，先收敛为 3 个紧凑精选卡 |
| `PR-UX-P1-001` | `C:\Users\Administrator\Desktop\真机测试\微信图片_20260615204248_172_528.jpg` | 首页/判官入口热门模板与长列表 | `miniprogram/pages/judge/index.*`、`miniprogram/pages/index/index.*` | 需 UI/UX 方案后重构：首页首屏、记录入口和玩法降权会影响信息架构 |
| `PR-UX-P1-002` | `C:\Users\Administrator\Desktop\真机测试\微信图片_20260615204249_173_528.jpg` | 我的页统计与待处理聚会 | `miniprogram/pages/me/index.*` | 需 UI/UX 方案后重构：统计卡片降权、待处理聚会前置和相册/分享入口权重需统一 |
| `PR-UX-P1-003` | `C:\Users\Administrator\Desktop\真机测试\微信图片_20260615204247_170_528.jpg`、`微信图片_20260615204248_171_528.jpg` | 首页、工具箱、底部 Tab | `miniprogram/pages/index/index.*`、`miniprogram/pages/tools/index.*`、`miniprogram/pages/me/index.*` | 需 UI/UX 方案后重构：创建/加入/继续记录应成为首屏 3 个核心动作，工具类入口降权 |
| `PR-UX-P1-004` | 多张截图 | 旧品牌文案和旧视觉资产 | `miniprogram/mock/home.ts`、`miniprogram/pages/index/*`、`miniprogram/pages/judge/*`、`miniprogram/pages/session-rules/*`、`miniprogram/pages/add-players/*`、`miniprogram/pages/table-mode/*`、底部 Tab 文案 | 需 UI/UX 方案后成批替换；不得在没有视觉系统和流程稿时零散改文案造成新旧混杂 |

### 14.2 已执行的 P0 最小修复

| 编号 | 修复范围 | 前端改动 | 验收口径 |
| --- | --- | --- | --- |
| `PR-UX-P0-001` | `add-players` 底部双按钮 | `.players-footer-row` 从 flex 改为稳定 grid，左侧“全选”和右侧邀请按钮按固定比例分栏；按钮补 `min-width:0`、内边距、居中和长文案换行，避免 iPhone 宽度下右侧文案与圆角区域溢出 | 需测试用原设备重新截图：`去分享邀请（已预选 1/1）` 不得超出右边界，底部安全区不遮挡 |
| `PR-UX-P0-002` | `create-session` 模板选择 | 免费模板首屏从 8 个收敛为 3 个精选项，保留“更多模板”；模板区从 216px 横向大卡改为三列紧凑卡，降低高度，避免露半张和被底部 CTA 遮挡 | 需测试用原设备重新截图：首屏模板卡应完整显示 3 个或可明确进入“更多模板”，底部 CTA 不遮挡选项内容 |

### 14.3 三步流程改造影响面清单

完整“三步内创建聚会房间并拍第一张照片”不是本轮 P0 样式修复范围，需等 UI/UX 提交新版首页、创建、邀请/二维码、拍照/上传、记录/相册 5 屏方案后再实施。前端影响面如下：

| 改造点 | 当前文件 | 依赖 |
| --- | --- | --- |
| 首页主行动改为“创建聚会 / 加入聚会 / 继续记录”，工具箱和玩法入口降权 | `miniprogram/pages/index/index.*`、`miniprogram/mock/home.ts`、`miniprogram/services/home.ts` | UI/UX 新首页方案、后端首页配置是否继续下发旧 hero/quickTools |
| 创建流程跳过强制玩法配置，默认生成聚会主题与房间 | `miniprogram/pages/create-session/index.*`、`miniprogram/pages/session-rules/index.*`、`miniprogram/pages/add-players/index.*` | 后端/API 快速创建接口或复用现有 session 创建路径；PM 确认玩法设置是否移入高级配置 |
| 创建后立即进入邀请/二维码和“拍第一张” | `miniprogram/pages/invite-group/index.*`、`miniprogram/pages/waiting-room/index.*`、`miniprogram/pages/moment-editor/index.*` | UI/UX 三步流程稿；接口联调提供快速创建 + opening moment 固定数据 |
| 底部 Tab 从“酒桌判官”改向“记录/相册” | `miniprogram/pages/index/index.*`、`miniprogram/pages/tools/index.*`、`miniprogram/pages/me/index.*`、相关 tab 样式 | UI/UX 信息架构和 PM 确认迁移策略 |
| 旧品牌/玩法文案批量替换 | `miniprogram/pages/*`、`miniprogram/components/*`、`miniprogram/mock/home.ts`、服务端内容配置 | UI/UX 文案规范、运营内容配置、测试回归清单 |

### 14.4 当前待补证据和依赖

- UI/UX：提交“聚会记录师”3 套或最终 1 套移动端方案，覆盖首页、创建、邀请、拍照/上传、记录/相册；明确底部 Tab、视觉系统、插画/照片资产、文案口径。
- 测试：用 `C:\Users\Administrator\Desktop\真机测试` 同类设备重新采集 `PR-UX-P0-001`、`PR-UX-P0-002` 修复后截图；补 375px、390px、414px 边界。
- 后端/API：确认三步快速创建是否需要新接口，默认房间名、默认模板、邀请码、首张 opening moment 是否可复用现有接口。
- PM：确认玩法设置是否从必填第 2 步降为高级配置；确认底部 Tab “记录/相册”迁移窗口。

### 14.5 新增暴露问题待 UI/UX 退回码

PM 追加用户反馈显示，当前仍暴露“元素超边界、单个列表太长、列表单列过于厚重占比过大”。`PR-UX-P0-001`、`PR-UX-P0-002` 的最小修复先保持；本节只列影响面和前端可执行处理模式，不继续扩大源码改动，等待 UI/UX 给出退回码与方案后再实施。

| 可能涉及页面 | 当前风险 | 等待 UI/UX 退回码后前端可执行模式 |
| --- | --- | --- |
| 首页 `miniprogram/pages/index/*` | 首屏非核心工具占比高，旧品牌/玩法心智重，列表和工具卡可能挤压创建/加入/继续记录 | 首屏只保留 3 个核心动作；工具入口降为二级；热门/最近内容采用精选 3 项 + 更多 |
| 工具箱 `miniprogram/pages/tools/*` | 工具列表可能过长，工具卡单列或大卡占比过重 | 双列网格、横滑精选、分组折叠；默认展示常用 3-4 项，其余进更多 |
| 酒桌判官/记录页 `miniprogram/pages/judge/*`、`miniprogram/pages/live-record/*` | 旧“判官/玩法/欠酒”权重高，记录/拍照入口不够聚焦，窄屏存在按钮和卡片挤压风险 | 主操作改向记录/拍照；玩法与辅助事件降权；按钮使用最长文案约束和底部安全区 |
| 我的页 `miniprogram/pages/me/*` | 统计卡和权益卡堆叠过多，待处理聚会/分享任务下移 | 保留 2-3 个核心指标；待处理聚会前置；次级统计进二级页或折叠 |
| 创建页 `miniprogram/pages/create-session/*` | 模板/推荐内容过多会重新造成横向截断或卡片厚重 | 精选 3 项 + 更多；紧凑双列/三列；固定卡片比例和底部 CTA 安全区 |
| 邀请/预选玩家页 `miniprogram/pages/add-players/*` | 长联系人列表、底部双按钮和最长邀请文案仍需真机复核 | 列表分组折叠；底部按钮固定 grid；最长文案在 375px 宽度内完整显示 |

统一前端处理模式：列表超过 5 项时优先使用“精选 3 项 + 更多”、双列/横滑/分组折叠；底部固定操作必须预留 `env(safe-area-inset-bottom)`，按钮使用 `min-width:0`、固定网格和最长文案约束；单卡高度必须设上限或固定比例，避免单列卡片吃掉半屏。上述处理等待 UI/UX 退回码后逐项执行，不能凭本节直接判定测试或设计通过。

### 14.6 `PR-FE-UX-FIX-001` 退回码整改执行记录

执行边界：PM 已允许前端按 UI/UX 通用退回码 `PR-FE-UX-BOUNDARY`、`PR-FE-UX-LIST`、`PR-FE-UX-CARD` 做最小整改。本节只记录前端执行，不修改 PM 总台账，不替 UI/UX 或测试写通过，不改后端接口，不做完整品牌重构。

| 页面 | 对应退回码 | 本轮前端处理 | 涉及文件 | 当前状态 |
| --- | --- | --- | --- | --- |
| `index` 首页 | `PR-FE-UX-LIST`、`PR-FE-UX-CARD`、`PR-FE-UX-BOUNDARY` | 首页 quick tools 和 recent tools 默认收敛为 3 项；工具宫格改为三列稳定网格；最近项中间列改为 `minmax(0, 1fr)`，避免长标题挤压右侧标签 | `miniprogram/pages/index/index.ts`、`miniprogram/pages/index/index.less` | 已做最小整改；仍需测试 375/390/414 复拍 |
| `tools` 工具箱 | `PR-FE-UX-LIST`、`PR-FE-UX-CARD` | 默认分类卡收敛为 3 项，热门工具收敛为 4 项，全量列表默认 5 项，分类/搜索结果最多 6 项；列表缩小缩略图与行高，降低单列厚重感 | `miniprogram/pages/tools/index.ts`、`miniprogram/pages/tools/index.less` | 已做最小整改；“更多/二级页”仍待 UI/UX 目标稿 |
| `judge/record` 记录/旧判官入口 | `PR-FE-UX-LIST`、`PR-FE-UX-CARD` | 拍一拍/互动卡默认收敛为 3 项；模板卡改为双列轻量卡，补 `min-width:0` 和两行截断，降低旧玩法卡片占屏 | `miniprogram/pages/judge/index.ts`、`miniprogram/pages/judge/index.less` | 已做最小整改；记录/拍照入口权重仍待 UI/UX 目标稿 |
| `me` 我的 | `PR-FE-UX-LIST`、`PR-FE-UX-CARD` | 我的酒局统计从 4 项降为 3 项；功能宫格改为三列 `minmax(0, 1fr)`；统计卡高度降低 | `miniprogram/pages/me/index.ts`、`miniprogram/pages/me/index.less` | 已做最小整改；待处理聚会/相册/分享信息架构仍待 UI/UX 目标稿 |
| `create-session` | `PR-FE-UX-BOUNDARY`、`PR-FE-UX-LIST`、`PR-FE-UX-CARD` | 沿用 14.2 已完成的 P0：模板默认 3 项精选，横向露半卡改为三列紧凑卡，底部 CTA 安全区保留 | `miniprogram/pages/create-session/index.ts`、`miniprogram/pages/create-session/index.less` | 已做 P0 最小整改；创建流程三步重排仍待 UI/UX/PM |
| `add-players` | `PR-FE-UX-BOUNDARY` | 沿用 14.2 已完成的 P0：底部双按钮改稳定 grid，长邀请文案允许换行并预留安全区 | `miniprogram/pages/add-players/index.less` | 已做 P0 最小整改；长联系人列表分组/折叠仍待 UI/UX 目标稿 |

本轮验证：

- `pwsh -NoLogo -NoProfile -Command '$PSVersionTable.PSVersion.ToString()'`：通过，版本 `7.6.2`。
- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- `git diff --check -- <前端变更文件和前端计划>`：通过，仅出现工作区 LF/CRLF 提示，无空白错误。

仍缺证据：本轮未运行微信开发者工具、体验版或真机，不写视觉/测试通过。测试需按 `docs/gameplay-moments-test-acceptance-plan.md` 13.16 在 375px、390px、414px 复拍 `index`、`tools`、`judge/record`、`me`、`create-session`、`add-players`；UI/UX 需继续回收完整“聚会记录师”三步流程目标稿与列表/更多页样式。

### 14.7 `PR-FE-ASSET-001` 人工视觉资产接入准备

执行边界：PM 已授权 UI/UX 负责人直接生图并产出设计图、切图、按钮、空态、背景、贴纸等资产。前端本节只准备接入清单，等待 UI/UX 的 `PR-UX-ASSET-001` 资产清单；在资产未回收前不自建视觉资产，不硬编码新图片路径，不改 PM 总台账，不替 UI/UX 或测试写通过。

#### 14.7.1 需要 UI/UX 交付的资产字段

| 字段 | 前端需要的内容 | 备注 |
| --- | --- | --- |
| 文件名 | 稳定英文或拼音文件名，建议带页面和用途，例如 `party-home-hero@2x.png` | 不使用临时截图名；同类状态需统一前缀 |
| 尺寸 | 原始像素、设计倍率、页面展示尺寸、裁切安全区 | 必须覆盖 375/390/414 宽度下的展示范围 |
| 格式 | `png` / `jpg` / `svg` / 可确认兼容的其他格式 | 照片背景优先 `jpg`，透明贴纸/空态优先 `png`，SVG 需确认小程序样式兼容 |
| 用途 | 首页 hero、创建页模板封面、邀请二维码背景、上传空态、时间线空态、我的页头图、贴纸/角标等 | 每个资产必须绑定页面和组件 |
| 压缩要求 | 目标体积、是否需要 TinyPNG/mozjpeg 等压缩、是否提供压缩前后文件 | 建议单张普通 UI 图小于 150KB，首屏大图小于 300KB；超过需 PM/前端确认包体影响 |
| 暗/亮底适配 | 亮底版、暗底版、透明边缘、文字避让区 | 首页/分享/二维码可能存在深色叠层，需给可读性说明 |
| 按钮状态 | normal、pressed、disabled、loading、selected 的视觉状态 | 若按钮用 CSS 实现，需给颜色/阴影/圆角/token；若用图片按钮，需逐状态切图 |
| 文案嵌入 | 是否含中文文案、是否可由前端渲染 | 关键文案优先前端文本渲染，避免图片中文字不可适配 |
| 版权与来源 | 生成方式、提示词摘要、是否可商用、是否含人物/商标风险 | 没有来源说明的资产只能待复核，不能直接上线 |
| 接入路径建议 | 建议放置目录、是否走后台配置或小程序本地包 | 首页/模板图优先走现有配置链路；固定 UI 小图可落 `miniprogram/assets/party-recorder/` |

#### 14.7.2 可接入页面与资产需求

| 页面 | 需要资产 | 当前占位 / 现状 | 接到资产后预计改动文件 |
| --- | --- | --- | --- |
| 首页 `index` | 聚会记录师 hero 背景、三主行动图标/贴纸、加入/继续记录辅助插图、底部 Tab 新图标 | 当前存在 `/assets/home/table-party-bg.jpg`、`/assets/home/party-hero.png` 等旧占位或配置图，均标记待替换 | `miniprogram/mock/home.ts`、`miniprogram/services/home.ts`、`miniprogram/pages/index/index.wxml`、`miniprogram/pages/index/index.less` |
| 创建聚会 `create-session` | 默认主题封面、模板精选封面、创建成功动效/贴纸、底部 CTA 状态 | 当前模板图来自后端静态模板或配置；新资产未回收前不改路径 | `miniprogram/pages/create-session/index.ts`、`miniprogram/pages/create-session/index.wxml`、`miniprogram/pages/create-session/index.less`、必要时 `backend/public/static/templates/*` 由对应角色处理 |
| 邀请/二维码 `invite-group` | 二维码容器背景、分享提示贴纸、复制/保存/分享按钮状态、成员空位插图 | 当前主要为 CSS 和内联 SVG 图标；缺新版视觉资产 | `miniprogram/pages/invite-group/index.wxml`、`miniprogram/pages/invite-group/index.less`、必要时分享图相关服务配置 |
| 拍照/上传 `moment-editor` | 上传空态、拍第一张插图、私密/公开状态贴纸、失败/重试空态、按钮状态 | 当前为空白/色块/CSS 状态，未接新版图 | `miniprogram/pages/moment-editor/index.wxml`、`miniprogram/pages/moment-editor/index.less`、`miniprogram/components/moment-card/*` |
| 记录/相册 `live-record`、timeline、brief/history | 时间线空态、相册空态、照片墙背景、审核/私密/待补图/失败状态贴纸、分享页背景 | 当前状态主要靠 CSS、内联 SVG 或已有分享任务图；新版资产待回收 | `miniprogram/pages/live-record/index.*`、`miniprogram/components/moment-timeline/*`、`miniprogram/components/session-moment-summary/*`、`miniprogram/pages/session-brief/*`、`miniprogram/pages/wine-history/*` |
| 我的页 `me` | 我的页头图、空状态插图、权益/设置轻图标、待处理聚会卡片背景 | 当前 `me` 使用旧 `party-hero` 背景和内联 SVG 图标，待统一替换 | `miniprogram/pages/me/index.wxml`、`miniprogram/pages/me/index.less`、必要时 `miniprogram/pages/me/index.ts` |

#### 14.7.3 前端接入规则与待替换项

- UI/UX 未交付 `PR-UX-ASSET-001` 前，不新增硬编码图片路径；已有 `/assets/home/table-party-bg.jpg`、`/assets/home/party-hero.png`、后端静态模板图和内联 SVG 只作为现状占位，标记待替换。
- 优先复用现有配置链路：后台/内容配置下发的 hero、模板、工具图片继续经 `miniprogram/services/home.ts` 和资产归一化逻辑接入；固定 UI 贴纸、空态、按钮状态再考虑放入 `miniprogram/assets/party-recorder/`。
- 前端接到资产后需补最小适配：`image` 的 `mode`、安全裁切区、暗/亮底 overlay、loading/失败占位、包体检查和 375/390/414 预览截图。
- 若 UI/UX 交付的是设计图而非可切图资产，前端只记录待切图，不直接从设计截图裁切上线。

#### 14.7.4 接到资产后的验证

- `npm.cmd run typecheck`：代码接入后必须通过。
- `npm.cmd run check:encoding`：中文文案或资源清单更新后必须通过。
- `git diff --check -- <接入文件>`：检查空白和换行。
- 微信开发者工具/体验版：至少复拍首页、创建聚会、邀请/二维码、拍照/上传、记录/相册、我的页；覆盖 375/390/414 宽度。
- 包体与加载：记录新增资产总大小、首屏图片体积、是否需要压缩或改走配置/网络图；未完成前不得写视觉资产接入通过。

### 14.8 `PR-FE-ASSET-INTEGRATE-001` 首版资产与 5 屏结构接入记录

执行边界：本轮按 UI/UX `PR-UX-ASSET-001-A/B` 复刻“聚会记录师”5 屏结构权重和 CTA 状态；不把 `pr-ux-asset-001-a-five-screen-target.png`、`pr-ux-asset-001-b-cta-states.png`、`pr-ux-asset-001-cd-empty-share-assets.png` 等 1MB+ 设计板作为小程序资源；不自建替代视觉资产；不改 PM 总台账；不替 UI/UX 或测试写通过。

#### 14.8.1 已接入文件和页面

| 页面 / 组件 | 接入方式 | 涉及文件 | 当前状态 |
| --- | --- | --- | --- |
| 首页 `index` | 复刻 A 的首页权重：品牌改为“聚会记录师”，首屏突出 `创建聚会 / 加入/扫码 / 继续记录`，工具与最近内容降级为 3 项；底部 Tab 可见文案调整为 `首页 / 相册 / 记录 / 我的` | `miniprogram/pages/index/index.wxml`、`miniprogram/pages/index/index.ts`、`miniprogram/pages/index/index.less`、`miniprogram/mock/home.ts` | 代码已接入；待 375/390/414 截图 |
| 创建聚会 `create-session` | 复刻 A/B：步骤文案改为 `创建聚会 / 邀请好友 / 拍第一张`；默认 CTA 改为 `创建并邀请`；调用现有 `createManagedSession` 后直达邀请页；玩法设置不再是默认必经路径 | `miniprogram/pages/create-session/index.wxml`、`miniprogram/pages/create-session/index.ts`、`miniprogram/pages/create-session/index.less` | 代码已接入；依赖接口可创建 session；待真机/开发者工具录屏 |
| 邀请/二维码 `invite-group` | 主 CTA 改为 `拍第一张`，跳转 `moment-editor?nodeType=opening`；`继续邀请` 降为次按钮；分享标题改为记录语义 | `miniprogram/pages/invite-group/index.wxml`、`miniprogram/pages/invite-group/index.ts`、`miniprogram/pages/invite-group/index.less` | 代码已接入；待二维码/口令真实样本截图 |
| 拍照/上传 `moment-editor` | 复刻 A 的拍照/上传屏：标题/节点改为 `拍照/上传`、`拍第一张`、`聚会照片`；接入 photo guide 和 uploading 独立切图；提交按钮接入 B 的 CTA 状态类 | `miniprogram/pages/moment-editor/index.wxml`、`miniprogram/pages/moment-editor/index.ts`、`miniprogram/pages/moment-editor/index.less` | 代码已接入；上传失败贴纸待失败态截图复核 |
| 记录/相册 `live-record`、`moment-timeline`、`session-moment-summary` | 主入口改为 `拍照/上传`；时间线标题改为 `记录/相册`；空态/加载态接入独立切图；记录页试装 `party-recorder-album-bg.webp` 并保留渐变兜底 | `miniprogram/pages/live-record/index.wxml`、`miniprogram/pages/live-record/index.ts`、`miniprogram/pages/live-record/index.less`、`miniprogram/components/moment-timeline/*`、`miniprogram/components/session-moment-summary/*` | 代码已接入；WebP 兼容、透明边缘和背景对比待真机复核 |
| 我的页 `me` | 统计和功能入口改为 `相册数 / 分享图 / 已解锁主题`、`聚会历史 / 我的相册 / 主题模板 / 分享记录`；底部 Tab 文案调整为相册/记录 | `miniprogram/pages/me/index.wxml`、`miniprogram/pages/me/index.ts` | 代码已接入；待空用户/普通用户/重度用户截图 |
| 旧记录入口 `judge` | 保留历史入口但用户可见权重改为 `记录/相册`，旧玩法/积分/商户入口降为记录说明、历史相册、主题模板、分享记录 | `miniprogram/pages/judge/index.wxml`、`miniprogram/pages/judge/index.ts` | 代码已接入；待旧数据兼容截图 |

#### 14.8.2 切图试装与包体记录

UI/UX `PR-UX-ASSET-CUT-001` 切图已试装到 `miniprogram/assets/party-recorder/`，未引用原始 1MB+ 设计板：

| 文件 | 大小 bytes | 本轮用途 |
| --- | ---: | --- |
| `party-recorder-empty-album-sticker.png` | 17326 | 时间线/摘要空态 |
| `party-recorder-uploading-sticker.png` | 12815 | 拍照上传中、时间线同步中 |
| `party-recorder-upload-failed-retry-sticker.png` | 29237 | 已入包，失败态待下一轮挂接和截图复核 |
| `party-recorder-photo-guide-sticker.png` | 26343 | 拍照/上传引导 |
| `party-recorder-album-bg.webp` | 10744 | 记录/相册页背景试装，保留渐变兜底 |
| `party-recorder-share-bg.webp` | 11452 | 已入包，分享页正式接入待下一轮 `PR-FE-ASSET-CUT-INTEGRATE-001` |

新增小程序本地资产合计 `107,917 bytes`。风险：WebP 在目标微信版本和真机机型上的兼容性、PNG 透明边缘、贴纸在暗/亮底上的对比度均未真机验证；测试复拍前不得写资产接入通过。

#### 14.8.3 本轮验证

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- `git diff --check -- <本轮前端文件>`：通过，仅出现工作区 LF/CRLF 提示，无空白错误。

仍缺证据：本轮未运行微信开发者工具、体验版或真机；缺 375/390/414 首页、创建、邀请、拍照/上传、记录/相册、我的页截图；缺三步 `创建聚会 -> 邀请/二维码 -> 拍第一张` 连续录屏；缺 WebP 兼容和透明边缘复核。UI/UX 仍需复核实现截图是否贴近 `PR-UX-ASSET-001-A/B`，测试需按 13.16.9 回收资产加载、按钮状态、包体和越界证据。

### 14.9 `PR-FE-ASSET-CUT-INTEGRATE-001` 切图正式接入与 UGC 提示执行记录

执行边界：本轮只在前端职责范围内接入 UI/UX `PR-UX-ASSET-CUT-001` 已回收切图，并按 UGC 6.7 补最小隐私、授权、举报、过滤提示；不改 PM 总台账，不替测试/UI/UX/UGC 写通过，不改后端过滤合同。

#### 14.9.1 源码改动清单

| 页面 / 组件 | 本轮前端改动 | 涉及文件 | 当前状态 |
| --- | --- | --- | --- |
| 分享邀请页 `share-preview` | 正式使用 `party-recorder-share-bg.webp` 作为邀请海报预览背景，口令/人数区域使用浅底安全区；文案改为“聚会记录师”语义；补公开分享过滤说明和“举报/反馈”入口；保存海报 canvas 文案同步降旧玩法 | `miniprogram/pages/share-preview/index.wxml`、`miniprogram/pages/share-preview/index.less`、`miniprogram/pages/share-preview/index.ts` | 代码已接入；仍需真机复拍二维码/房间码可读性 |
| 分享图页 `share-poster` | 正式使用 `party-recorder-share-bg.webp` 作为分享图预览卡背景，内容层保留浅底可读区；补“仅包含已授权且审核通过照片”过滤说明、房间码/二维码安全区提示和“举报/反馈”入口；旧“战报/欠酒王”主文案降级为聚会回忆 | `miniprogram/pages/share-poster/index.wxml`、`miniprogram/pages/share-poster/index.less`、`miniprogram/pages/share-poster/index.ts` | 代码已接入；后端生成成品图仍走既有任务/接口，未改合同 |
| 拍照/上传页 `moment-editor` | 正式使用 `party-recorder-upload-failed-retry-sticker.png` 作为上传失败态贴纸；失败态显示重试、返回邀请页和“已保留文字/可见范围/授权选择”；分享授权默认改为不勾选，公开分享需用户主动授权 | `miniprogram/pages/moment-editor/index.wxml`、`miniprogram/pages/moment-editor/index.less`、`miniprogram/pages/moment-editor/index.ts` | 代码已接入；仍需接口失败样本/断网样本截图 |
| 邀请/二维码页 `invite-group` | 补扫码加入后的上传权限、默认聚会内可见、发起人可管理相册/公开分享的前端提示 | `miniprogram/pages/invite-group/index.wxml`、`miniprogram/pages/invite-group/index.less` | 代码已接入；仍需二维码/口令真实样本截图 |
| 记录/相册页 `live-record` | 补相册默认聚会内可见、私密/待审/待补图不进入公开分享的提示，以及“举报/反馈”入口 toast | `miniprogram/pages/live-record/index.wxml`、`miniprogram/pages/live-record/index.less`、`miniprogram/pages/live-record/index.ts` | 代码已接入；仍需普通成员/发起人视角复拍 |

#### 14.9.2 包体增量与资产风险

本轮未新增小程序本地资产，沿用 14.8 已试装的 `miniprogram/assets/party-recorder/` 六个切图；资产包体增量为 `0 bytes`，当前切图合计仍为 `107,917 bytes`。风险仍保留：`party-recorder-share-bg.webp` 的目标微信版本/WebP 兼容性、深浅底叠加后的二维码/房间码可读性、PNG 透明边缘在真机上的毛边和压暗效果均未完成真机复核。

#### 14.9.3 待测试复拍截图/录屏点

- `share-preview`：邀请预览页背景图加载、口令安全区、人数区域、保存海报按钮、过滤说明和举报入口；文件建议 `pr-fe-asset-cut-001-share-preview-bg-safe-area.png`。
- `share-poster`：分享图预览背景、内容浅底可读区、分享任务成品图预览、过滤说明、房间码/二维码安全区提示和举报入口；文件建议 `pr-fe-asset-cut-001-share-poster-bg-filter-report.png`。
- `moment-editor`：断网或接口失败触发上传失败贴纸，确认“重试上传 / 返回邀请页 / 草稿保留”可见；文件建议 `pr-fe-asset-cut-001-upload-failed-retry.png`，录屏建议 `pr-fe-asset-cut-001-upload-failed-retry-draft.mp4`。
- `invite-group`：二维码/口令区域与隐私提示不互相遮挡，底部“拍第一张”安全区正常；文件建议 `pr-fe-asset-cut-001-invite-privacy-qr.png`。
- `live-record`：发起人/普通成员视角下相册隐私提示和举报入口可见，不挤压底部操作；文件建议 `pr-fe-asset-cut-001-live-record-privacy-report.png`。

#### 14.9.4 当前仍缺协作证据

- 测试：按测试计划 13.16.11 在微信开发者工具/体验版/真机复拍上述截图和断网/失败录屏；前端本轮未运行 GUI 或真机，不能写通过。
- UI/UX：复核 `party-recorder-share-bg.webp` 叠加后文字、按钮、口令/二维码区域是否符合切图目标稿；复核上传失败贴纸透明边缘和暗/亮底对比。
- UGC 风控：复核前端最小文案是否覆盖 UGC 6.7 的授权、过滤、举报表达；后端审核、举报处理、过滤合同仍由对应角色维护。
- 接口联调/后端：如测试要验证真实失败恢复、审核过滤、举报提交，需要提供可复跑的失败样本、待审/私密/隐藏/已授权素材样本和接口状态摘要。

#### 14.9.5 本轮验证

- `pwsh -NoLogo -NoProfile -Command '$PSVersionTable.PSVersion.ToString()'`：通过，版本 `7.6.2`。
- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- `git diff --check`：通过，仅输出工作区 LF/CRLF 提示，无空白错误。

### 14.10 `PR-FE-REDESIGN-FULL-001` 主路径全壳层复刻记录

执行边界：PM 紧急升级明确用户要求“完全抛弃之前旧的样式框，重新按照 UI 给出的设计图复刻”。本轮只修改小程序前端源码和前端计划；不改 PM 总台账，不替测试/UI/UX/UGC 写通过，不改后端接口合同，不把 `pr-ux-asset-001-a-five-screen-target.png`、`pr-ux-asset-001-b-cta-states.png` 等 1MB+ 设计板入包。

#### 14.10.1 复刻依据

- UI/UX 12.4.1：落地基线为 `Clean Quick Recorder`，白底/浅暖灰底，薄荷绿和浅蓝辅助，珊瑚橙只用于主 CTA；主路径必须覆盖首页、创建聚会、邀请/二维码、拍照/上传、记录/相册。
- UI/UX 12.5.2：`PR-UX-ASSET-001-A` 作为 5 屏结构目标图，`PR-UX-ASSET-001-B` 作为 CTA 状态规范；前端按组件复刻，不直接使用整张设计板。
- UI/UX 12.5.3：仅使用已切出的独立 PNG/WebP：`photo-guide`、`uploading`、`upload-failed-retry`、`empty-album`、`album-bg.webp`、`share-bg.webp`；WebP 兼容仍待真机复核。
- 测试 13.16.11：需继续回收 375/390/414 截图、三步连续录屏、上传失败录屏、WebP/透明边缘复核。
- UGC 6.7：拍照/上传、邀请、相册、分享必须保留默认聚会内可见、授权、过滤、举报提示；本轮只做前端文案/入口/状态表达。

#### 14.10.2 页面改动与旧壳清除点

| 页面 | 旧壳移除 / 绕开点 | 新复刻结构 | 源码文件 |
| --- | --- | --- | --- |
| 首页 `index` | 删除主路径可见的旧 `top-row` 登录/签到、搜索框、旧 hero、工具箱网格、最近长列表堆叠；不再让工具/玩法占首屏 | 目标图第 1 屏：品牌标题 + 三个主动作 `创建聚会 / 加入口令/扫码 / 继续记录`；最近相册只保留 3 张轻量缩略图；工具和历史入口下沉为轻入口 | `miniprogram/pages/index/index.wxml`、`miniprogram/pages/index/index.less` |
| 创建聚会 `create-session` | 绕开旧表单卡 + preset chip 长行 + 横滑模板大卡；模板不再承担主路径推进 | 目标图第 2 屏：标题、两项核心输入、精选 3 个轻量主题、高级设置折叠行、底部 `创建并邀请` 52px CTA | `miniprogram/pages/create-session/index.wxml`、`miniprogram/pages/create-session/index.less` |
| 邀请/二维码 `invite-group` | 移除旧邀请卡/复制卡双卡堆叠和列表式分享框架；不要求等待成员加入才拍照 | 目标图第 3 屏：房间码安全卡、三项分享入口、复制/预览轻操作、底部 `拍第一张 / 继续邀请` 双 CTA | `miniprogram/pages/invite-group/index.wxml`、`miniprogram/pages/invite-group/index.less` |
| 拍照/上传 `moment-editor` | 节点类型、可见范围、授权配置不再占首屏；旧配置型页面壳层下沉为辅助 | 目标图第 4 屏：标题、拍照贴纸/预览舞台、`拍照 / 从相册选择` 双入口、上传失败贴纸与重试/返回、默认可见提示、下方说明和授权 | `miniprogram/pages/moment-editor/index.wxml`、`miniprogram/pages/moment-editor/index.less` |
| 记录/相册 `live-record` | 移除旧“成员记录/互动调整”作为首屏主体；兼容记录降权到后部辅助面板 | 目标图第 5 屏：`记录 / 相册 / 分享` 分段、双列照片墙/空相册、`继续拍照` 主入口、隐私与举报提示、成员横排和兼容记录下沉 | `miniprogram/pages/live-record/index.wxml`、`miniprogram/pages/live-record/index.less`、`miniprogram/pages/live-record/index.ts` |
| 我的 `me` | 统计卡和功能宫格不再直接成为首屏唯一重点 | 新增 `创建聚会 / 我的相册 / 继续记录` 三个轻入口，统计和常用功能继续保留但降权 | `miniprogram/pages/me/index.wxml`、`miniprogram/pages/me/index.less` |

#### 14.10.3 旧品牌/旧心智清除证据

- 主路径五屏 WXML 扫描命令：`Select-String -Path miniprogram/pages/index/index.wxml,miniprogram/pages/create-session/index.wxml,miniprogram/pages/invite-group/index.wxml,miniprogram/pages/moment-editor/index.wxml,miniprogram/pages/live-record/index.wxml -Pattern '酒桌判官|欠酒|惩罚|判官|酒局|玩法|裁判'`。
- 当前扫描结果：无命中。
- 旧业务能力未删除：历史记录、统计、分享任务、成员记录、接口调用仍保留；仅从主路径视觉壳层降级或下沉，避免新用户首屏继续感知旧“工具箱/判官/欠酒/惩罚/酒局玩法”框架。

#### 14.10.4 待复拍截图/录屏点

- 首页：`PR-FE-REDESIGN-FULL-001-index-375/390/414.png`，确认首屏只有创建、加入、继续记录三主动作，底部 Tab 不挤压。
- 创建聚会：`PR-FE-REDESIGN-FULL-001-create-session-375/390/414.png`，确认模板仅 3 项、底部 `创建并邀请` 不遮挡内容。
- 邀请/二维码：`PR-FE-REDESIGN-FULL-001-invite-group-375/390/414.png`，确认房间码/二维码安全区、`拍第一张 / 继续邀请` 双 CTA 不越界。
- 拍照/上传：`PR-FE-REDESIGN-FULL-001-moment-editor-375/390/414.png`，补上传初始、上传中、失败重试和有图预览态。
- 记录/相册：`PR-FE-REDESIGN-FULL-001-live-record-375/390/414.png`，补空相册、1 张照片、20 张照片、发起人/普通成员视角。
- 三步连续录屏：`PR-FE-REDESIGN-FULL-001-create-invite-first-photo-<device>-<wechatVersion>-20260615.mp4`，覆盖首页创建聚会 -> 创建并邀请 -> 邀请页拍第一张 -> 拍照/上传。

#### 14.10.5 当前阻塞与待复核

- 本轮未运行微信开发者工具、体验版或真机，不能写视觉通过或测试通过。
- WebP 背景仍缺目标基础库和真机机型兼容证据；如不兼容，需 UI/UX 提供 PNG 压缩回退图，前端记录包体增量后替换。
- UI/UX 仍需按 12.6.2 接收矩阵复核实现截图是否贴近 `PR-UX-ASSET-001-A/B`。
- 测试仍需按 13.16.11 回收三宽截图、三步录屏、上传失败录屏和设备/微信版本/入口路径。
- UGC 风控仍需复核新版壳层中的默认可见、授权、过滤、举报表达；后端审核/举报/过滤合同不在本轮前端改动范围。

#### 14.10.6 本轮验证

- `pwsh -NoLogo -NoProfile -Command '$PSVersionTable.PSVersion.ToString()'`：通过，版本 `7.6.2`。
- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- `git diff --check`：通过，仅输出工作区 LF/CRLF 提示，无空白错误。
- 主路径五屏旧词扫描：无 `酒桌判官 / 欠酒 / 惩罚 / 判官 / 酒局 / 玩法 / 裁判` 命中。

### 14.11 `PR-FE-ONLINE-RETEST-HANDOFF-001` 新改动上线复拍包

执行边界：用户确认首轮只测 iPhone 12 / iOS 26.5 / 微信 8.0.73，且扫码可打开；截图和录屏需等待新改动上线后回收。本节只准备前端复拍交接包，不写测试通过，不改 PM 总台账，不改后端接口，不部署服务器，不触碰 `pomer.cn`。

#### 14.11.1 可用于新版预览/体验构建的前端改动

当前 `PR-FE-REDESIGN-FULL-001` 改动已完成本地前端验证，可进入新版微信开发者工具预览/体验构建；仍需实际构建二维码和真机复拍确认。

| 页面 | 路径 | 关键文件 | 复拍重点 |
| --- | --- | --- | --- |
| 首页 | `/pages/index/index` | `miniprogram/pages/index/index.wxml`、`miniprogram/pages/index/index.less` | 首屏三主动作：创建聚会、加入口令/扫码、继续记录；底部 Tab 不越界 |
| 创建聚会 | `/pages/create-session/index` | `miniprogram/pages/create-session/index.wxml`、`miniprogram/pages/create-session/index.less` | 两项核心输入、3 个轻量主题、高级设置折叠、底部 `创建并邀请` |
| 邀请/二维码 | `/pages/invite-group/index?sessionId=<sessionId>` | `miniprogram/pages/invite-group/index.wxml`、`miniprogram/pages/invite-group/index.less` | 房间码/二维码安全区、分享入口、`拍第一张 / 继续邀请` 双 CTA |
| 拍照/上传 | `/pages/moment-editor/index?sessionId=<sessionId>&nodeType=opening` | `miniprogram/pages/moment-editor/index.wxml`、`miniprogram/pages/moment-editor/index.less` | 拍照/从相册选择、上传中、上传失败重试、默认仅本聚会可见 |
| 记录/相册 | `/pages/live-record/index?sessionId=<sessionId>` | `miniprogram/pages/live-record/index.wxml`、`miniprogram/pages/live-record/index.less`、`miniprogram/pages/live-record/index.ts` | 记录/相册/分享分段、双列照片墙、继续拍照、隐私/举报提示 |
| 我的 | `/pages/me/index` | `miniprogram/pages/me/index.wxml`、`miniprogram/pages/me/index.less` | 创建聚会、我的相册、继续记录入口前置；统计和功能降权 |

#### 14.11.2 测试复拍路径

6 页单页复拍路径：

1. 首页：`/pages/index/index`。
2. 创建聚会：`/pages/create-session/index`。
3. 邀请/二维码：`/pages/invite-group/index?sessionId=<实际 sessionId>`。
4. 拍照/上传：`/pages/moment-editor/index?sessionId=<实际 sessionId>&nodeType=opening`。
5. 记录/相册：`/pages/live-record/index?sessionId=<实际 sessionId>`。
6. 我的：`/pages/me/index`。

三步连续录屏路径：

1. 从 `/pages/index/index` 点击 `创建聚会`。
2. 在 `/pages/create-session/index` 点击 `创建并邀请`。
3. 在 `/pages/invite-group/index?sessionId=<实际 sessionId>` 点击 `拍第一张`。
4. 到达 `/pages/moment-editor/index?sessionId=<实际 sessionId>&nodeType=opening`，触发拍照或从相册选择。

建议文件命名：

- `PR-FE-ONLINE-RETEST-HANDOFF-001-index-iPhone12-iOS26.5-WeChat8.0.73-<build>.png`
- `PR-FE-ONLINE-RETEST-HANDOFF-001-create-session-iPhone12-iOS26.5-WeChat8.0.73-<build>.png`
- `PR-FE-ONLINE-RETEST-HANDOFF-001-invite-group-iPhone12-iOS26.5-WeChat8.0.73-<build>.png`
- `PR-FE-ONLINE-RETEST-HANDOFF-001-moment-editor-iPhone12-iOS26.5-WeChat8.0.73-<build>.png`
- `PR-FE-ONLINE-RETEST-HANDOFF-001-live-record-iPhone12-iOS26.5-WeChat8.0.73-<build>.png`
- `PR-FE-ONLINE-RETEST-HANDOFF-001-me-iPhone12-iOS26.5-WeChat8.0.73-<build>.png`
- `PR-FE-ONLINE-RETEST-HANDOFF-001-three-step-iPhone12-iOS26.5-WeChat8.0.73-<build>.mp4`

#### 14.11.3 微信开发者工具 / 体验版动作清单

需要用户/PM/测试执行人在微信开发者工具执行并记录：

1. 打开项目目录：`F:\codexlist\jiuzhuopanguan\miniprogram`，确认 AppID 与本轮预览/体验版目标一致。
2. 执行编译，记录编译模式、启动页和 query；建议先用 `/pages/index/index`。
3. 预览或上传体验版，生成新的预览二维码或体验版入口；旧二维码不得复用为新改动证据。
4. 上传体验版时记录构建号、上传备注、上传时间、操作者账号；建议备注包含 `PR-FE-REDESIGN-FULL-001 / PR-FE-ONLINE-RETEST-HANDOFF-001`。
5. 真机扫码后记录设备：iPhone 12 / iOS 26.5 / 微信 8.0.73；记录扫码时间、二维码来源、是否过期。
6. 按 14.11.2 复拍 6 页截图和三步录屏；每张截图需要标明页面路径、角色、sessionId、API base 和构建号。

#### 14.11.4 当前缺口

- 仍缺 A/B/C/outsider 登录态、profileId/token 或可复用角色切换方式。
- 仍缺新改动上线后的截图/录屏，当前不能写测试通过、UI/UX 通过或 UGC 准出。
- 仍缺实际 `sessionId`、二维码/体验版入口、构建号、上传备注和 API base 截图。
- 前端不改后端接口、不部署服务器、不触碰 `pomer.cn`；若需要线上 API 或体验版配置变更，需 PM 单独派发对应角色。

### 14.12 `PR-FE-AUTH401-LOADING-001` 历史/相册页 401 与 loading 修复记录

执行边界：本轮只修改小程序前端页面和前端计划；不改后端接口合同，不把 401 视为接口通过，不改 PM 总台账，不触碰 `pomer.cn`。

#### 14.12.1 源码改动清单

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/wine-history/index.ts` | `loadSessions()` 在请求 `/reports/history` 与 `/user/session-moment-summaries` 前先调用 `getUserAuthSession()`；未登录或缺少 `wechatOpenId` 时直接进入登录引导空态，不再打鉴权接口。401/Unauthorized/未登录/登录已失效错误统一清理失效 token 并展示重新登录提示。`wx.showLoading`/`wx.hideLoading` 改为 `loadingShown` 配对；分享图重试后先关闭重试 loading，再刷新列表，避免嵌套双 hide。 |
| `miniprogram/pages/wine-history/index.wxml` | 未登录态隐藏筛选和榜单工具条，展示“登录后查看聚会相册”空态与“去登录”按钮；列表发起人文案替换旧“判官”露出。 |
| `miniprogram/pages/wine-history/index.less` | 增加登录引导空态和登录 CTA 的轻量样式，不重构页面壳层。 |

#### 14.12.2 未登录 / 失效 token 体验

- 未登录或本地没有有效 `wechatOpenId`：页面停留可用，展示“登录后查看聚会相册”和“去登录”，不请求两个需要 `X-JZP-User-Token` 的历史/摘要接口。
- token 失效或接口返回 401：前端清理本地用户 token，切换到同一登录引导态，并 toast “登录已失效，请重新登录”；不持续刷新鉴权接口。
- 非 401 的相册摘要接口错误：摘要区域降级为空数组，历史列表仍按 `reports/history` 结果展示；401 不会被摘要 catch 静默吞掉。

#### 14.12.3 待验证与协作需求

- 本轮未运行微信开发者工具、体验版或真机，不能写测试通过。
- 需要测试在新预览/体验版复拍：未登录进入 `/pages/wine-history/index?mode=host` 不再出现两条 401；失效 token 进入后展示登录引导且不循环刷 401；登录后历史/相册摘要正常加载；分享图失败重试不再出现 showLoading/hideLoading 配对警告。
- 需要后端/API 提供可复现的失效 token 或 401 样本账号，确认前端降级不会误伤正常登录态；接口合同仍以后端 `requireUserSession()` 为准。

#### 14.12.4 本轮验证

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- `git diff --check -- miniprogram/pages/wine-history/index.ts miniprogram/pages/wine-history/index.wxml miniprogram/pages/wine-history/index.less docs/gameplay-moments-frontend-development-plan.md`：通过，仅输出工作区 LF/CRLF 提示，无空白错误。
- WXML/TS 一致性自查：`authRequired` 已在 data/interface/WXML 使用；`handleLoginTap` 已定义并绑定；未登录空态按钮跳转 `/pages/me/index`；`showLoading` / `hideLoading` 使用 `loadingShown` 配对，分享图重试不再带着 loading 嵌套刷新。

### 14.13 `PR-FE-IP12-SCREENSHOT-FOLLOWUP-001` iPhone 12 创建页主题卡裁切跟进

执行边界：本轮按 PM 要求只做前端影响评估和可执行修复方案，不改业务源码，不改 PM 总台账，不替测试/UI/UGC 写通过。

#### 14.13.1 截图证据

- 真机目录：`C:\Users\Administrator\Desktop\真机测试`。
- 问题截图：`微信图片_20260615231514_187_528.jpg`。
- 批次结论：23:15 批次已能进入首页、创建聚会、拍第一张/上传页；创建页“轻量主题”三张主题卡片只露出局部大字，无法识别主题内容。

#### 14.13.2 代码核查与根因假设

| 核查点 | 当前证据 | 判断 |
| --- | --- | --- |
| WXML | `miniprogram/pages/create-session/index.wxml` 使用 `.create-theme-grid` 三列渲染前三个免费模板；图片节点为 `<image class="create-theme-image" mode="aspectFill">`，下方单行显示 `item.name` | 主问题发生在图片展示区域，文字标题区域没有承载足够识别信息 |
| LESS | `miniprogram/pages/create-session/index.less` 中 `.create-theme-grid` 为 `repeat(3, minmax(0, 1fr))`，gap `10px`；`.create-theme-image` 为 `width: 100%` + `aspect-ratio: 1 / 0.78`；卡片 `overflow: hidden` | iPhone 12 宽度下单卡约 80-90px，图片区域高度约 60-70px，不适合展示带大字的旧模板海报 |
| 数据来源 | `miniprogram/pages/create-session/index.ts` 通过 `getTemplateConfigFast()` 取免费模板前三项，直接使用配置/后端的 `imageUrl` | 当前图片大概率是旧模板/海报型素材，按小卡 `aspectFill` 裁切后只剩字形局部 |
| CTA / 安全区 | 截图中底部 `创建并邀请` 位于主题卡片下方，没有遮挡主题卡片 | 不是底部 CTA 或安全区遮挡导致 |
| 横向滚动 | 新版 WXML 没有使用横向 scroll-view，三列固定展示 | 不是横滑半露问题；属于三列固定小卡展示与素材比例不匹配 |

根因假设：`create-session` 新版三列轻量主题卡片继续使用旧模板海报图，且图片 `mode="aspectFill"` + 小尺寸容器 + `overflow:hidden`，导致海报中的大字和图形被裁到局部。该问题优先按前端展示策略修复；如果要保留图片语义，需要 UI/UX 提供适配 3 列小卡的缩略切图或后台替换模板图。

#### 14.13.3 拟改文件与最小修复方案

拟改文件：

- `miniprogram/pages/create-session/index.wxml`
- `miniprogram/pages/create-session/index.less`
- 如需清理缓存版本避免旧缓存继续显示，可同步评估 `miniprogram/pages/create-session/index.ts` 的 `TEMPLATE_CACHE_KEY` 是否升级。

前端可独立执行的最小修复方案：

1. 图片展示降级：将三列主题卡的图片从主识别区域降为浅色背景/顶部色带，避免旧海报图裁切成为主要信息；主题识别改由 `item.name` + `item.meta` 文案承担。
2. 展示模式调整：若仍显示图片，改为 `mode="aspectFit"`，并给 `.create-theme-image` 固定 `height`、`background` 和 `object-position` 兜底，避免局部字形裁切。
3. 卡片密度调整：三列仍保留，但减少图片高度或改为文字优先小卡；标题允许 2 行，meta 最多 1-2 行，保证 iPhone 12 下可识别。
4. 缓存处理：如线上用户已缓存旧模板数据，可升级 `create-session-template-cache-v1`，或在样式修复后不依赖缓存变更。

不建议本轮直接做的范围：

- 不重构创建页整体流程，不扩大到首页/邀请/上传页。
- 不替换模板图片资产，不自建新视觉资产。
- 不修改后端 `/config/templates` 合同或后台模板配置。

#### 14.13.4 需要 UI/UX / 测试补齐

- UI/UX：如希望保留图片型主题卡，需要提供 `PR-FE-IP12-SCREENSHOT-FOLLOWUP-001` 退回码或新切图要求，明确 3 列小卡缩略图尺寸、文字安全区、深浅底适配；否则前端建议先采用文字优先卡片作为 P0 修复。
- 测试：修复后需在 iPhone 12 / iOS 26.5 / 微信 8.0.73 复拍 `/pages/create-session/index`，文件建议 `PR-FE-IP12-SCREENSHOT-FOLLOWUP-001-create-session-theme-card-iPhone12-iOS26.5-WeChat8.0.73-<build>.png`；同时补控制台截图，确认没有图片加载失败、布局警告或底部 CTA 遮挡。

#### 14.13.5 建议验证命令

- 若后续 PM 授权前端修改源码，至少执行：
  - `npm.cmd run typecheck`
  - `npm.cmd run check:encoding`
  - `git diff --check -- miniprogram/pages/create-session/index.wxml miniprogram/pages/create-session/index.less miniprogram/pages/create-session/index.ts docs/gameplay-moments-frontend-development-plan.md`
- 本轮仅文档记录，需执行 `npm.cmd run check:encoding` 和前端计划 `git diff --check`。

### 14.14 `PR-FE-REMAINING-PAGES-IMPLEMENT-001` 剩余 P0 页面前端实现记录

执行边界：本轮按 UI/UX `PR-UX-REMAINING-PAGES-VISUAL-001` 和实践包实现剩余 P0 页面，不改 PM 总台账、派工队列、全员公告、测试计划、UGC 计划或 UI/UX 计划；不改后端接口合同，不部署服务器，不触碰 `pomer.cn`。

#### 14.14.1 复刻依据

- UI/UX 目标板：`docs/design-assets/party-recorder/remaining/pr-ux-remaining-p0-pages-five-screen-board.png`。
- 前端实践包：`docs/design-assets/party-recorder/remaining/README.md`。
- UI/UX 计划：`docs/gameplay-moments-ui-ux-development-plan.md` 12.7.1。
- 设计读法：Clean Quick Recorder，小程序产品内轻量相册工具；`design-taste-frontend` 仅用于反模板、长列表、厚重卡片、按钮溢出和状态完整性检查，不引入 Web/Tailwind/动效体系。

#### 14.14.2 改动文件与实际改动

| 页面 | 文件 | 实际改动 |
| --- | --- | --- |
| `me` 我的 | `miniprogram/pages/me/index.wxml`、`miniprogram/pages/me/index.less` | 头像/昵称下方保留三入口 `创建聚会 / 我的相册 / 继续记录`；统计从厚重卡片降为轻量数字条；会员权益和更多功能下沉为轻量行；常用功能改为“更多设置”。 |
| `wine-history` 历史相册 | `miniprogram/pages/wine-history/index.ts`、`miniprogram/pages/wine-history/index.wxml`、`miniprogram/pages/wine-history/index.less` | 增加三段入口 `我创建的 / 我加入的 / 分享图`，切换时复用现有 `mode` 拉取；保留 `getUserAuthSession()` 前置、401 降级和 `loadingShown` 配对；页面密度改为轻量相册行，榜单入口改为“回忆榜”。 |
| `share-poster` 分享预览 | `miniprogram/pages/share-poster/index.ts`、`miniprogram/pages/share-poster/index.wxml`、`miniprogram/pages/share-poster/index.less` | 导航从“分享战报”改为“分享预览”；预览卡增加“仅包含已授权照片”；任务区改为“分享图状态”；过滤提示、举报入口和双 CTA 保持可读，不遮挡安全区。 |
| `share-preview` 邀请预览 | `miniprogram/pages/share-preview/index.wxml`、`miniprogram/pages/share-preview/index.less` | 导航改为“邀请预览”；口令安全区前增加“仅包含已授权照片”；口令块增加安全边界，风险说明保持在卡片外部可读。 |
| `session-brief` 聚会简报 | `miniprogram/pages/session-brief/index.ts`、`miniprogram/pages/session-brief/index.wxml`、`miniprogram/pages/session-brief/index.less` | 标题从“时间线简报”改为“聚会简报”；统计项从“时间线”改为“照片”；空态和错误文案使用“聚会/照片记录”；回忆榜入口作为二级按钮，不抢拍照主路径。 |
| `rankings` 今日回忆榜 | `miniprogram/pages/rankings/index.ts`、`miniprogram/pages/rankings/index.wxml`、`miniprogram/pages/rankings/index.less` | 页面从“今日榜单”改为“今日回忆榜”；分类可见文案去掉“最欠酒”，保留后端 category 值不改接口；积分展示改为“热度”，按钮改为“推荐这张”；样式降低厚卡感，照片仍为主体。 |

#### 14.14.3 风险与仍缺证据

- 本轮未运行微信开发者工具、体验版或真机，不能写 UI/UX 或测试通过。
- `wine-history` 的 401/loading 修复已保留，但仍需测试补未登录、失效 token、登录后、控制台无重复 401 和无 loading 配对警告证据。
- 分享图公开过滤仍需后端/API、UGC 风控和测试提供过滤节点清单、PNG 原图与真实任务状态样本；前端只表达“仅包含已授权照片”与失败重试入口。
- `rankings` 仍复用既有积分/推举接口合同，points ledger、积分不足、重复推举和退款样本需接口/测试补证据。
- UI/UX 仍需基于 375/390/414 真机截图复核是否贴近目标板，不得仅凭源码记录写通过。

#### 14.14.4 验证命令

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- `git diff --check -- miniprogram/pages/me/index.wxml miniprogram/pages/me/index.less miniprogram/pages/wine-history/index.ts miniprogram/pages/wine-history/index.wxml miniprogram/pages/wine-history/index.less miniprogram/pages/share-poster/index.ts miniprogram/pages/share-poster/index.wxml miniprogram/pages/share-poster/index.less miniprogram/pages/share-preview/index.wxml miniprogram/pages/share-preview/index.less miniprogram/pages/session-brief/index.ts miniprogram/pages/session-brief/index.wxml miniprogram/pages/session-brief/index.less miniprogram/pages/rankings/index.ts miniprogram/pages/rankings/index.wxml miniprogram/pages/rankings/index.less docs/gameplay-moments-frontend-development-plan.md`：通过，仅输出工作区 LF/CRLF 提示，无空白错误。
- 由于本工作树中 `docs/gameplay-moments-frontend-development-plan.md`、`session-brief` 和 `rankings` 文件当前为未跟踪状态，补充执行 `git diff --no-index --check` 覆盖这些文件：通过，仅输出 LF/CRLF 提示，无空白错误；未改 Git 索引。
- 旧词扫描：`rg "分享战报|时间线简报|今日榜单|最欠酒|酒局缺少|未找到可分享的酒局|未找到可生成简报的酒局|酒桌判官|判官|欠酒|惩罚|裁判" miniprogram/pages/me miniprogram/pages/wine-history miniprogram/pages/share-poster miniprogram/pages/share-preview miniprogram/pages/session-brief miniprogram/pages/rankings -n` 无命中。

### 14.15 `PR-FE-0616-IP12-RETEST-FIX-001` iPhone 12 退回项前端修复记录

执行边界：本轮仅处理用户 2026-06-16 真机截图退回定位中明确的前端 P0 视觉和文案问题；不改 PM 总台账、测试计划、UGC 计划或 UI/UX 计划；不部署服务器，不触碰 `pomer.cn`，不替测试写通过。当前截图不是最终准出截图，后续仍需最后大版本统一复拍。

#### 14.15.1 已核查截图证据与根因

| 退回点 | 截图文件 | 根因判断 |
| --- | --- | --- |
| `create-session` 轻量主题卡严重裁切 | `C:\Users\Administrator\Desktop\真机测试\0616\微信图片_20260616002619_200_528.jpg` | 三列小卡继续使用旧模板海报图，`mode="aspectFill"` + 小容器 + 卡片裁切导致只露出局部字形；属于前端展示策略与旧素材比例不匹配。 |
| `rankings` 空态显示英文 `not found` | `C:\Users\Administrator\Desktop\真机测试\0616\微信图片_20260616002614_193_528.jpg` | `loadRanking()` catch 直接把接口错误原文写入 `emptyText` 和 toast，缺少中文化降级。 |
| 记录页仍出现旧“酒桌判官”主视觉大卡和旧玩法心智 | `C:\Users\Administrator\Desktop\真机测试\0616\微信图片_20260616002616_196_528.jpg` | `judge` 页仍透传 `homeConfig?.judge` 的旧主视觉、旧标题和旧图片；主 CTA 文案仍是旧玩法语义。 |
| `session-brief` 仍显示“酒局时间线简报” | `C:\Users\Administrator\Desktop\真机测试\0616\微信图片_20260616002612_190_528.jpg`、`微信图片_20260616002615_194_528.jpg` | 页面默认文案已改，但接口返回的 `brief.title` 仍可能包含旧标题，前端未做进入页面前的标题规范化。 |
| 首页最近相册缩略图像工具素材/二维码素材 | `C:\Users\Administrator\Desktop\真机测试\0616\微信图片_20260616002611_189_528.jpg` | 首页“最近相册”复用 `home.recentTools` 图片字段，后台/旧配置中的工具素材或二维码素材被当成相册缩略图展示。 |

#### 14.15.2 改动文件与修复方案

| 文件 | 修复内容 |
| --- | --- |
| `miniprogram/pages/create-session/index.wxml`、`miniprogram/pages/create-session/index.less` | 轻量主题卡改为文字优先：旧图片降为顶部浅色带并使用 `aspectFit`，标题允许 2 行，meta 允许 2 行，卡片不再把旧海报裁成局部字形作为主识别信息。 |
| `miniprogram/pages/rankings/index.ts` | 增加 `normalizeRankingErrorMessage()`，将 `not found` / `404` / `401` 等错误转为中文空态与 toast，避免英文错误直接暴露。 |
| `miniprogram/pages/judge/index.ts`、`miniprogram/pages/judge/index.wxml`、`miniprogram/pages/judge/index.less` | 记录页不再透传旧 `homeConfig.judge` 主视觉；移除旧图片大卡，统一为“聚会记录 / 记录这一刻 / 开始记录”；热门模板标题降为“相册入口”，保留业务入口但降低旧玩法心智。 |
| `miniprogram/pages/session-brief/index.ts` | 增加 `normalizeBriefTitle()`，对接口返回的旧“酒局 / 时间线简报 / 酒桌 / 判官”标题统一落为“聚会简报”，避免旧标题回灌。 |
| `miniprogram/pages/index/index.ts`、`miniprogram/pages/index/index.wxml`、`miniprogram/pages/index/index.less` | 首页最近相册不再展示 `recentTools.imageUrl` 中的工具/二维码素材；前端规范化工具类名称并使用轻量相册占位视觉，保留跳转能力。 |

#### 14.15.3 风险、待复拍与协作缺口

- 本轮未运行微信开发者工具、体验版或 iPhone 12 真机，不能写测试通过。
- `create-session` 的最终视觉仍需 UI/UX 判断是否接受“文字优先轻量主题卡”；如坚持图片主题卡，需要 UI/UX 提供适配 3 列小卡的新切图或后台替换旧模板缩略图。
- `judge` 记录页前端已阻断旧 `homeConfig.judge` 主视觉回灌，但后台旧配置仍可能存在；如后续其他入口读取该配置，需 PM 派后台/内容运营清理旧配置。
- `session-brief` 仅做前端标题规范化，不改接口数据；如服务端仍生成旧标题，需后端/API 在简报生成侧同步改口径。
- 首页最近相册当前使用前端轻量占位，不假造真实照片；如要显示真实聚会照片，需后端/API 提供已授权相册缩略图字段，UGC/测试补过滤与授权证据。
- 最终仍需最后大版本统一截图/录屏复拍；不建议继续让用户补零散截图。

#### 14.15.4 验证命令

- `pwsh -NoLogo -NoProfile -Command '$PSVersionTable.PSVersion.ToString()'`：`7.6.2`。
- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- `git diff --check -- miniprogram/pages/create-session/index.wxml miniprogram/pages/create-session/index.less miniprogram/pages/index/index.ts miniprogram/pages/index/index.wxml miniprogram/pages/index/index.less miniprogram/pages/judge/index.ts miniprogram/pages/judge/index.wxml miniprogram/pages/judge/index.less miniprogram/pages/session-brief/index.ts miniprogram/pages/rankings/index.ts docs/gameplay-moments-frontend-development-plan.md`：通过，仅输出工作区 LF/CRLF 提示，无空白错误。
- 由于本工作树中 `docs/gameplay-moments-frontend-development-plan.md`、`session-brief` 和 `rankings` 文件当前为未跟踪状态，补充执行 `git diff --no-index --check -- NUL docs/gameplay-moments-frontend-development-plan.md`、`git diff --no-index --check -- NUL miniprogram/pages/session-brief/index.ts`、`git diff --no-index --check -- NUL miniprogram/pages/rankings/index.ts`：命令因 no-index 差异返回 1，但输出仅有 LF/CRLF 提示，无空白错误；未改 Git 索引。
- 退回关键词扫描：`rg -n "酒桌主模式|快速开一局|酒局时间线简报|not found|homeConfig\?\.judge|今晚组局|不醉不归|<image wx:if=\"\{\{item.imageUrl\}\}\" class=\"home-album-image|mode=\"aspectFill\" miniprogram/pages/create-session" miniprogram/pages/create-session miniprogram/pages/index miniprogram/pages/judge miniprogram/pages/session-brief miniprogram/pages/rankings`：无命中。

### 14.16 `PR-FE-FINAL-RETEST-HOLD-001` 等待最终复拍前端交接记录

执行边界：本轮只记录前端等待复拍交接信息；不继续扩大改版源码，不改 PM 总台账、测试计划、UGC 计划或 UI/UX 计划；不部署服务器，不触碰 `pomer.cn`，不替测试或接口写通过。

#### 14.16.1 当前可供测试打开的页面路径

| 页面 | 建议路径 | 关键检查状态 |
| --- | --- | --- |
| 首页 | `/pages/index/index` | 检查品牌为“聚会记录师”，主路径突出 `创建聚会 / 加入口令/扫码 / 继续记录`；最近相册不再展示工具素材或二维码素材。 |
| 创建聚会 | `/pages/create-session/index` | 检查轻量主题卡不再只露局部字形，底部 `创建并邀请` 不越界、不遮挡。 |
| 邀请/二维码 | `/pages/invite-group/index` | 检查房间码/二维码安全区、拍第一张入口和授权提示；需真实 session 才能复核完整链路。 |
| 拍照/上传 | `/pages/moment-editor/index?sessionId=<sessionId>&nodeType=private&visibility=private` | 检查上传/失败重试/隐私提示；需接口联调给可进入 session 和登录态。 |
| 记录/相册 | `/pages/judge/index`、`/pages/live-record/index?sessionId=<sessionId>`、`/pages/wine-history/index?mode=album` | 检查记录页不再出现旧“酒桌判官”主视觉大卡，旧玩法只保留二级兼容入口；历史相册需登录态。 |
| 聚会简报 | `/pages/session-brief/index?sessionId=<sessionId>` | 检查旧“酒局时间线简报”被前端规范化为“聚会简报”；完整数据需后端简报接口样本。 |
| 今日回忆榜 | `/pages/rankings/index?category=today_highlight` | 检查 404 / `not found` 时前端展示中文空态；线上 API 404 仍属于后端/API 或部署闭环，前端不能写接口通过。 |
| 我的 | `/pages/me/index` | 检查入口权重偏向创建、相册、继续记录；旧玩法入口不抢主路径。 |

#### 14.16.2 已修复项与当前前端状态

- `PR-FE-0616-IP12-RETEST-FIX-001` 已完成代码侧修复：创建页主题卡裁切、榜单英文 `not found`、记录页旧主视觉、简报旧标题、首页最近相册素材误用均已做前端兜底。
- 前端已完成验证：`npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check` 通过；未运行微信开发者工具、体验版或真机。
- `rankings` 页面仅完成用户友好中文兜底；线上 `api.pomer.cn` rankings 路由 404 仍需后端/API 或部署闭环提供路由可达、鉴权、真实数据和控制台证据。前端不可把该项写成接口通过。
- 最终准出仍以最后大版本统一复拍为准；当前前端状态只能写“代码侧已修复 / 等待最终复拍 / 等待后端 API 闭环”。

#### 14.16.3 仍缺证据与不可宣称通过的边界

- 缺测试证据：iPhone 12 / iOS 26.5 / 微信 8.0.73 的最终大版本统一截图、录屏、控制台无 P0 错误记录。
- 缺后端/API 证据：`api.pomer.cn` rankings 路由不再 404，`/pages/rankings/index?category=today_highlight` 可拿到有效响应或业务空态响应；不能只凭前端中文兜底写通过。
- 缺接口联调证据：可进入的 `sessionId/profileId/token`，覆盖 host/memberA/memberB/outsider 的登录态和页面路径。
- 缺 UI/UX 复核证据：最终大版本截图对照目标稿确认无旧壳、无超边界、无厚重单列卡和无旧品牌主视觉。
- 缺 UGC/风控证据：相册、分享图、上传页中已授权照片、举报/过滤提示和公开分享安全边界的真实链路复核。

#### 14.16.4 最终大版本退回应对方式

- 如最终复拍被退回，前端只按截图文件名、页面路径、控制台原文和可复现步骤定点修 P0。
- 不再基于口头感受扩大重构范围；不做无证据扩写，不替后端/API、测试、UGC 或 UI/UX 下通过结论。
- 对 API 404、鉴权失败、线上数据缺失类问题，前端只保留友好降级和边界提示；接口通过必须由后端/API 或部署闭环提供证据。

### 14.17 `PR-FE-FULL-PAGES-INVENTORY-001` 全量页面前端影响面清单

执行边界：本轮只为 UI/UX `PR-UX-FULL-PROJECT-PAGES-VISUAL-001` 准备前端影响面；不改业务源码，不实现全量设计，不改 PM 总台账、测试计划、UGC 计划或 UI/UX 计划。核查来源为 `miniprogram/app.json`、`miniprogram/pages/*` 目录和前端页面旧词扫描。

#### 14.17.1 页面注册与影响面总览

`miniprogram/app.json` 当前注册 35 个页面；`miniprogram/pages` 当前存在 42 个页面目录；未注册目录 7 个，分别是 `admin-console`、`admin-home-config`、`admin-points-config`、`admin-template-config`、`join-claim`、`profile-edit`、`share-helper`。

| 页面目录 | 注册状态 | 类型/旧权重 | 改版痕迹 | 旧品牌/旧玩法风险 | UI/UX 优先级建议 |
| --- | --- | --- | --- | --- | --- |
| `index` | 已注册 | 首页主路径 | 已改“聚会记录师” | 低，需复核缩略图和底部 Tab | P0 |
| `create-session` | 已注册 | 创建主路径 | 已改创建聚会/三步 | 低，主题卡待最终复拍 | P0 |
| `invite-group` | 已注册 | 邀请/二维码主路径 | 已改邀请与拍照链路 | 中，需复核二维码安全区 | P0 |
| `moment-editor` | 已注册 | 拍照/上传主路径 | 已改拍照/上传/隐私提示 | 中，仍有事件类型和接口状态依赖 | P0 |
| `live-record` | 已注册 | 记录/相册主路径 | 已改记录/相册/继续拍照 | 中，TS 仍有“等待判官开始记录”等旧语义 | P0 |
| `judge` | 已注册 | 记录 Tab / 旧判官入口 | 已做旧主视觉阻断 | 中，兼容入口和模板仍需 UI/UX 定义 | P0 |
| `wine-history` | 已注册 | 我的相册/历史 | 已改相册口径并保留 401 修复 | 低到中，依赖鉴权和接口空态 | P0 |
| `share-preview` | 已注册 | 邀请预览/分享入口 | 已改聚会记录师邀请函 | 低到中，二维码/口令安全区需复核 | P0 |
| `share-poster` | 已注册 | 分享图预览 | 已改分享预览/授权照片 | 低到中，依赖分享任务状态 | P0 |
| `session-brief` | 已注册 | 聚会简报 | 已改聚会简报并做标题兜底 | 中，接口旧标题需后端同步 | P0 |
| `rankings` | 已注册 | 二级回忆榜 | 已改今日回忆榜并做中文兜底 | 中，线上 API 404 未闭环 | P0 |
| `me` | 已注册 | 我的页/入口聚合 | 已改创建/相册/继续记录 | 中，商业化入口仍需降权策略 | P0 |
| `tools` | 已注册 | 工具箱 | 有部分布局整改 | 高，仍有“工具箱/酒桌判官”Tab 文案 | P1 |
| `tool-detail` | 已注册 | 工具详情/二维码 | 未完整改版 | 高，代码内仍有 `酒桌判官` 默认二维码文案 | P1 |
| `add-players` | 已注册 | 旧创建流程/成员预选 | 有局部样式整改 | 高，仍有创建酒局、玩法设置、判官本人等文案 | P1 |
| `session-rules` | 已注册 | 旧规则/玩法设置 | 未完整改版 | 高，仍有创建酒局、欠酒、惩罚卡 | P1 |
| `waiting-room` | 已注册 | 等待房间 | 未完整改版 | 高，仍有酒局信息/酒局加载失败等文案 | P1 |
| `table-mode` | 已注册 | 旧桌面/欠酒记录 | 未完整改版 | 高，仍有欠酒、酒桌判官酒局 | P1 |
| `judge-wheel` | 已注册 | 旧判官转盘 | 未完整改版 | 高，仍有判官、惩罚、欠酒、转盘 | P1 |
| `result-report` | 已注册 | 旧战报结果 | 未完整改版 | 高，仍有分享战报、酒局信息 | P1 |
| `restart-state` | 已注册 | 再开一局/旧玩法恢复 | 未完整改版 | 高，仍有继续酒桌判官、惩罚局 | P1 |
| `invalid-state` | 已注册 | 失效/结束状态页 | 未完整改版 | 高，仍有酒局已结束 | P1 |
| `flow-overview` | 已注册 | 旧流程说明 | 未完整改版 | 高，仍有创建酒局、设置玩法、开始游戏 | P1 |
| `friend-hub` | 已注册 | 好友/拍一拍 | 未完整改版 | 中，仍有参与过的酒局 | P1 |
| `favorites` | 已注册 | 收藏/空态页 | 未完整改版 | 中，仍有历史酒局、战报 | P2 |
| `usage-history` | 已注册 | 使用记录 | 未完整改版 | 中，仍有工具/战报记录 | P2 |
| `wine-points` | 已注册 | 积分中心/商业化 | 未完整改版 | 中，商业化和积分权重需 UI/UX 决策 | P2 |
| `member-center` | 已注册 | 会员中心 | 未完整改版 | 高，仍有闪享会员、完整酒局体验 | P2 |
| `coupon-center` | 已注册 | 权益/券 | 未完整改版 | 中，商业化入口需降权 | P2 |
| `merchant-partners` | 已注册 | 商户合作 | 有聚会好去处文案 | 中，商业化入口需降权 | P2 |
| `premium-templates` | 已注册 | 模板/会员权益 | 未完整改版 | 中，模板和会员锁定需重排 | P2 |
| `invite-friends` | 已注册 | 邀请好友/增长 | 未完整改版 | 中，仍有酒局圈子、积分福利 | P2 |
| `question-bank` | 已注册 | 题库/后台内容 | 未完整改版 | 中，玩法题库应降为二级 | P2 |
| `settings` | 已注册 | 设置 | 未完整改版 | 低到中，后台控制文案需统一 | P2 |
| `compliance-guide` | 已注册 | 合规说明 | 未完整改版 | 中，朋友聚会互动娱乐表述需复核 | P2 |
| `logs` | 已注册 | 示例日志页 | 未改版 | 高，导航标题疑似乱码 | P2/清理 |
| `admin-console` | 未注册 | 小程序内后台配置页 | 未纳入主路由 | 中，需确认是否保留或迁出 | P3 |
| `admin-home-config` | 未注册 | 首页配置后台页 | 未纳入主路由 | 中，配置项可能影响前台旧主视觉 | P3 |
| `admin-points-config` | 未注册 | 积分配置后台页 | 未纳入主路由 | 中，商业化配置风险 | P3 |
| `admin-template-config` | 未注册 | 模板配置后台页 | 未纳入主路由 | 高，可能继续下发旧模板海报 | P3 |
| `join-claim` | 未注册 | 加入/认领链路 | 未纳入主路由 | 中，需确认是否废弃或注册 | P3 |
| `profile-edit` | 未注册 | 资料编辑 | 未纳入主路由 | 低到中，需确认入口 | P3 |
| `share-helper` | 未注册 | 分享辅助 | 未纳入主路由 | 中，需确认是否被代码跳转引用 | P3 |

#### 14.17.2 给 UI/UX 的前端实现风险

- 共用组件：`navigation-bar` 覆盖几乎所有页面；`session-return-bar` 用于首页、记录、历史相册；`moment-card` / `moment-timeline` 影响简报、相册时间线；`share-task-status` 影响简报和分享图状态。UI/UX 若改组件规格，需要同步给组件级尺寸、颜色、空态和按钮状态。
- 底部 Tab：当前 `index`、`tools`、`judge`、`me` 等页面存在手写底部导航，不是统一小程序 tabBar；全量改版要统一 Tab 文案、图标、选中态、安全区和跳转策略。
- 状态页：`invalid-state`、`restart-state`、`waiting-room`、`logs`、`favorites`、`usage-history` 多为旧壳或空态页，容易在真机复拍时暴露旧品牌和厚重卡片。
- 长列表与横滑：`tools`、`tool-detail`、`question-bank`、`rankings`、`wine-points`、`merchant-partners`、`premium-templates` 涉及长列表、分类筛选或横向 tab，需要 UI/UX 给默认收敛、更多入口和空态规则。
- 图片资产：`miniprogram/assets/home`、`miniprogram/assets/party-recorder`、`miniprogram/assets/share` 仍可能被后台配置或旧工具页引用；不能把设计大板直接入包，需独立切图、WebP 兼容和包体增量说明。
- 接口依赖：`rankings` 线上 404、`wine-history` 鉴权、`session-brief` 简报标题、`share-poster` 分享任务、`moment-editor` 上传失败态均需要接口/测试证据；前端只能做降级，不能写接口通过。
- 未注册页面：7 个未注册目录需 PM/UIUX 决策“注册 / 删除 / 后台迁出 / 保留备用”；前端不得擅自移除或注册。

#### 14.17.3 优先级建议与等待规格后的实施顺序

1. P0 主路径先定稿：`index`、`create-session`、`invite-group`、`moment-editor`、`live-record`、`judge`、`wine-history`、`share-preview`、`share-poster`、`session-brief`、`rankings`、`me`。目标是三步创建并拍第一张、相册/分享优先、旧玩法不回灌。
2. P1 旧玩法清理：`tools`、`tool-detail`、`add-players`、`session-rules`、`waiting-room`、`table-mode`、`judge-wheel`、`result-report`、`restart-state`、`invalid-state`、`flow-overview`、`friend-hub`。目标是降权、迁为二级兼容或改成聚会记录语义。
3. P2 商业化/工具/空态统一：`wine-points`、`member-center`、`coupon-center`、`merchant-partners`、`premium-templates`、`invite-friends`、`question-bank`、`favorites`、`usage-history`、`settings`、`compliance-guide`、`logs`。目标是统一空态、长列表密度、商业化入口权重和旧词清理。
4. P3 未注册目录决策：`admin-*`、`join-claim`、`profile-edit`、`share-helper`。等待 UI/UX 和 PM 确认是否进入小程序全量视觉范围，或归入后台/废弃/备用。
5. UI/UX 规格回收后，前端按“共用组件与 Tab -> P0 主路径 -> P1 旧玩法页 -> P2 商业化/工具页 -> P3 未注册页”的顺序实施；每轮只按目标稿和截图证据修 P0，不做无证据扩写。

### 14.18 `PR-FE-FLOW-NO-STUCK-001` / `PR-FE-SHARE-SAVE-FIX-001` / `PR-FE-WINE-HISTORY-BACK-FIX-001` / `PR-FE-ALBUM-TAIL-COMPACT-001` 发布后流程阻塞修复记录

执行边界：本轮只修发布后新增的前端流程体验阻塞；不改 PM 总台账、测试计划、UGC 计划或 UI/UX 计划；不部署服务器，不触碰 `pomer.cn`，不把后端/API 未闭环项写成通过。

#### 14.18.1 根因与修复方案

| 任务 | 问题 | 根因 | 修复文件与方案 |
| --- | --- | --- | --- |
| `PR-FE-FLOW-NO-STUCK-001` | 部分按钮点击后无反馈或进入坏链路 | `live-record` 顶部 `记录/相册/分享` 分段只做静态样式，没有事件绑定；`invite-group` 在 `sessionId` 为空时仍可进入预览/拍照路径 | `miniprogram/pages/live-record/index.wxml`、`miniprogram/pages/live-record/index.ts` 增加 `activeSegment` 与 `handleSegmentTap()`；相册给当前页反馈，分享携带 `sessionId` 跳 `share-poster`。`miniprogram/pages/invite-group/index.ts` 对预览/拍第一张增加空房间保护提示。 |
| `PR-FE-SHARE-SAVE-FIX-001` | 分享保存图片报错 | `share-preview` / `share-poster` 直接调用 `wx.saveImageToPhotosAlbum`，相册权限被拒时只落失败；`share-poster` 在没有 ready 任务图时依赖后端 `/reports/:id/poster.png` 下载，后端图缺失会直接导致保存失败 | `miniprogram/pages/share-preview/index.ts`、`miniprogram/pages/share-poster/index.ts` 增加相册权限兜底；`share-poster` 增加隐藏 canvas 和前端分享图兜底，后端海报下载失败时用本地 canvas 生成可保存图片。 |
| `PR-FE-WINE-HISTORY-BACK-FIX-001` | 我的相册返回失败 | `wine-history` 使用默认返回与空态 CTA 的 `navigateBack()`，从首页/我的页直达或栈为空时会失败 | `miniprogram/pages/wine-history/index.wxml`、`miniprogram/pages/wine-history/index.ts` 增加自定义返回；优先 `navigateBack`，失败后 `redirectTo('/pages/me/index')`，再兜底 `reLaunch('/pages/index/index')`。 |
| `PR-FE-ALBUM-TAIL-COMPACT-001` | 相册/记录页拖尾过长 | `wine-history` 底部 CTA 在 scroll 内参与文档流；`live-record` 相册墙和空态高度偏大，底部 padding 与固定 CTA 叠加后拖尾明显 | `miniprogram/pages/wine-history/index.wxml`、`miniprogram/pages/wine-history/index.less` 将底部 CTA 移出 scroll 并固定到底部安全区；`miniprogram/pages/live-record/index.less` 压缩相册墙、空态贴纸、兼容记录和固定按钮安全区。 |

#### 14.18.2 改动文件

- `miniprogram/pages/wine-history/index.wxml`
- `miniprogram/pages/wine-history/index.ts`
- `miniprogram/pages/wine-history/index.less`
- `miniprogram/pages/live-record/index.wxml`
- `miniprogram/pages/live-record/index.ts`
- `miniprogram/pages/live-record/index.less`
- `miniprogram/pages/share-preview/index.ts`
- `miniprogram/pages/share-poster/index.wxml`
- `miniprogram/pages/share-poster/index.ts`
- `miniprogram/pages/share-poster/index.less`
- `miniprogram/pages/invite-group/index.ts`

#### 14.18.3 待复拍点

- 主路径：`/pages/create-session/index -> /pages/invite-group/index?sessionId=<sessionId> -> /pages/moment-editor/index?sessionId=<sessionId>&nodeType=opening`，确认按钮不进入空 `sessionId` 链路。
- 记录页：`/pages/live-record/index?sessionId=<sessionId>`，点击 `记录 / 相册 / 分享` 三个分段，确认都有反馈或跳转，页面尾部不再出现明显空白拖尾。
- 我的相册：`/pages/wine-history/index?mode=album`、`mode=joined`、`mode=unshared`，从首页/我的页/直达进入后点导航返回与底部按钮，确认不再返回失败。
- 分享保存：`/pages/share-preview/index?sessionId=<sessionId>&inviteCode=<inviteCode>` 和 `/pages/share-poster/index?sessionId=<sessionId>`，分别测试保存海报、保存分享图、相册权限拒绝后再授权、后端海报下载失败时前端 canvas 兜底。

#### 14.18.4 验证命令

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- `git diff --check -- miniprogram/pages/wine-history/index.wxml miniprogram/pages/wine-history/index.ts miniprogram/pages/wine-history/index.less miniprogram/pages/live-record/index.wxml miniprogram/pages/live-record/index.ts miniprogram/pages/live-record/index.less miniprogram/pages/share-preview/index.ts miniprogram/pages/share-poster/index.wxml miniprogram/pages/share-poster/index.ts miniprogram/pages/share-poster/index.less miniprogram/pages/invite-group/index.ts docs/gameplay-moments-frontend-development-plan.md`：通过，仅输出工作区 LF/CRLF 提示，无空白错误。
- `git diff --no-index --check -- NUL docs/gameplay-moments-frontend-development-plan.md`：因前端计划当前为未跟踪文件且与空文件存在差异，命令返回 1；输出仅有 LF/CRLF 提示，无空白错误，未改 Git 索引。

### 14.19 `PR-INT-BRIEF-PATH-CONTRACT-001` 简报路径合同前端确认

执行边界：本轮只核对前端实际调用路径和页面 query，不改业务源码，不改 PM 总台账、测试计划、UGC 计划或 UI/UX 计划；不把接口 404 写成前端通过。

#### 14.19.1 前端实际调用路径

| 前端入口 | 页面 query | 实际前端调用 | 是否依赖 `/sessions/{sessionId}/brief` |
| --- | --- | --- | --- |
| `session-brief` | `/pages/session-brief/index?briefId=<briefId>` | `getManagedSessionBrief(briefId)` -> `GET /session-briefs/{briefId}` | 否 |
| `session-brief` | `/pages/session-brief/index?sessionId=<sessionId>` | `createOrRefreshManagedSessionBrief(sessionId)` -> `POST /sessions/{sessionId}/brief` | 是 |
| `share-poster` | `/pages/share-poster/index?taskId=<taskId>` | `getManagedShareImageTask(taskId)` 取回 `briefId` 后优先 `GET /session-briefs/{briefId}` | 视任务是否返回 `briefId`；正常不需要 session brief 创建 |
| `share-poster` | `/pages/share-poster/index?briefId=<briefId>` | `getManagedSessionBrief(briefId)` -> `GET /session-briefs/{briefId}` | 否 |
| `share-poster` | `/pages/share-poster/index?sessionId=<sessionId>` | `createOrRefreshManagedSessionBrief(sessionId)` -> `POST /sessions/{sessionId}/brief` | 是 |
| `share-poster` | 无 `briefId`、有 `sessionId` 且点击“生成分享图” | 先 `createOrRefreshManagedSessionBrief(sessionId)`，再 `POST /session-briefs/{briefId}/share-image-tasks` | 是 |
| `share-preview` | `/pages/share-preview/index?sessionId=<sessionId>&inviteCode=<inviteCode>` | 只调用 `getManagedLiveSession(sessionId, inviteCode)`；保存海报走前端 canvas | 否 |
| `live-record` | `/pages/live-record/index?sessionId=<sessionId>` | `getManagedSessionTimeline(sessionId)` -> timeline 接口；不直接请求 brief | 否 |
| `live-record` 分享分段 | 点击“分享”后跳 `/pages/share-poster/index?sessionId=<sessionId>` | 跳转后由 `share-poster` 调 `POST /sessions/{sessionId}/brief` | 间接依赖 |

#### 14.19.2 前端结论与待联调项

- 前端确认：`/session-briefs/{briefId}` 200 只覆盖 `briefId` 读取链路，不能覆盖所有前端入口。
- 前端确认：`/sessions/{sessionId}/brief` 404 会影响 `session-brief?sessionId=...`、`share-poster?sessionId=...`、`share-poster` 无 `briefId` 时生成分享图，以及 `live-record` 分享分段跳转后的分享图链路。
- 前端不依赖 `/sessions/{sessionId}/brief` 的页面：`share-preview`；`live-record` 的相册/时间线本身也不依赖 brief，只依赖 timeline。
- 如测试只验证 `/session-briefs/{briefId}`，仍需后端/API 继续补 `/sessions/{sessionId}/brief` 的 POST 合同、路由发布和真实 sessionId 样本；前端不能把 sessionId 简报创建链路写成通过。

#### 14.19.3 验证记录

- 只读核查命令：`rg -n "session-brief|briefId|createOrRefreshManagedSessionBrief|getManagedSessionBrief|/brief|share-poster|share-preview|getManagedSessionTimeline|getManagedShareImageTask" miniprogram/pages/session-brief miniprogram/pages/share-poster miniprogram/pages/share-preview miniprogram/pages/live-record miniprogram/services/operations.ts docs/gameplay-moments-frontend-development-plan.md`。
- 本轮未改源码，未运行 `typecheck`；仅需前端计划 `git diff --check`。

### 14.20 `PR-FE-HOME-LOGIN-ENTRY-001` 首页未登录入口修复记录

执行边界：本轮只修首页未登录创建聚会流程阻断；不改 PM 总台账、测试计划、UGC 计划或 UI/UX 计划；不部署服务器；保留 `PR-FE-AUTH401-LOADING-001` 的 401 降级和 loading 配对，不新增鉴权接口刷屏。

#### 14.20.1 根因与改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/index/index.ts` | `handlePrimaryTap()` 不再在未登录时只调用 `ensureUserAuthorized()` 的 toast 路径；改为先查 `getUserAuthSession()`，无 `wechatOpenId` 时直接打开首页登录面板，并记录 `authRedirectUrl='/pages/create-session/index'`；登录成功后自动跳转创建页。 |
| `miniprogram/pages/index/index.wxml` | 首页首屏主 CTA 下新增未登录可见入口 `登录后创建聚会`，点击直接打开同一登录面板。 |
| `miniprogram/pages/index/index.less` | 新增 `.home-login-entry`、`.home-login-title`、`.home-login-desc` 样式，确保入口首屏清晰可见且不挤压主 CTA。 |

#### 14.20.2 预期行为

- 未登录且 storage 无 `social-user-session-token` / `social-authorized-wechat-profile` 时，点击首页 `.home-action-primary` 应直接显示 `authPanelVisible=true` 的微信授权登录面板，不再停留在首页且只有 toast。
- 未登录时首页首屏可见 `登录后创建聚会` 入口，点击同样打开登录面板。
- 从 `创建聚会` 主 CTA 触发登录时，登录成功后自动进入 `/pages/create-session/index`；从普通登录入口触发时只完成登录，不自动跳转。
- 该修复只读取 `getUserAuthSession()`；无 token 场景不直接请求历史/相册鉴权接口，不影响 `wine-history` 401 降级和 loading 配对。

#### 14.20.3 微信开发者工具自动化点击记录

- PM 已给出前置自动化发现：微信开发者工具 `auto-port=9420` 可找到 `.home-action-primary`，但未登录 storage 下点击后仍停留 `pages/index/index`，且首页没有登录入口。
- 本线程未连接微信开发者工具 `auto-port=9420` 自动化控制环境，未执行实际点击复测；代码侧已将未登录点击结果改为打开首页登录面板。需 PM/测试在同一自动化环境复测 `.home-action-primary` 点击后 `authPanelVisible` / 登录面板是否出现。

#### 14.20.4 验证命令与待复拍

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- `git diff --check -- miniprogram/pages/index/index.ts miniprogram/pages/index/index.wxml miniprogram/pages/index/index.less docs/gameplay-moments-frontend-development-plan.md`：通过，仅输出工作区 LF/CRLF 提示，无空白错误。
- `git diff --no-index --check -- NUL docs/gameplay-moments-frontend-development-plan.md`：因前端计划当前为未跟踪文件且与空文件存在差异，命令返回 1；输出仅有 LF/CRLF 提示，无空白错误，未改 Git 索引。
- 待 iPhone 12 复拍：未登录首页首屏能看到登录入口；点击 `创建聚会` 弹出登录面板；登录成功后进入创建页；控制台无重复 401、无 loading 配对警告。

### 14.21 `PR-FE-FINAL-CAPTURE-HANDOFF-002` 最终大版本复拍交接包

执行边界：本轮只整理最终大版本复拍交接包，不改业务源码，不改 PM 总台账、测试计划、UGC 计划或 UI/UX 计划；不替任何角色写通过。除测试提供截图/控制台原文外，前端不再扩大实现范围。

#### 14.21.1 预览/体验入口记录字段

前端本线程无法生成微信开发者工具预览二维码、体验版二维码或上传构建号。测试/PM 复拍时请在测试记录中补齐以下字段：

| 字段 | 当前前端记录 |
| --- | --- |
| 微信开发者工具 auto-port | PM 已使用 `9420` 做首页登录入口初验 |
| 预览二维码 | 待 PM/测试从微信开发者工具生成 |
| 体验版二维码 | 待 PM/测试或有权限人员上传体验版后提供 |
| 构建号 / 上传备注 | 建议备注 `final-capture-PR-FE-HOME-LOGIN-ENTRY-001-and-flow-fixes`，实际以 PM/测试上传记录为准 |
| 首页登录入口 DevTools 初验证据 | `docs/runtime/home-login-entry-after-primary-tap-9420.png` |

#### 14.21.2 6 页主路径复拍页面

| 页面 | 路径 / 进入方式 | 复拍重点 |
| --- | --- | --- |
| 首页 | `/pages/index/index` | 品牌为“聚会记录师”；未登录首屏有 `登录后创建聚会`；点击 `.home-action-primary` 弹登录面板；底部 Tab 不越界。 |
| 创建聚会 | `/pages/create-session/index` | 轻量主题卡不裁切；`创建并邀请` 底部 CTA 不遮挡；三步路径第 1 步清晰。 |
| 邀请/二维码 | `/pages/invite-group/index?sessionId=session-1781507687012-e4343d` | 房间码/邀请入口可读；`拍第一张` 不进入空 session；`预览分享页` 可用。 |
| 拍照/上传 | `/pages/moment-editor/index?sessionId=session-1781507687012-e4343d&nodeType=opening` | 拍照/相册选择、上传失败态、重试/返回路径、隐私授权提示。 |
| 记录/相册 | `/pages/live-record/index?sessionId=session-1781507687012-e4343d` | `记录/相册/分享` 三个分段都有反馈；记录页不出现旧“酒桌判官”主视觉；拖尾不明显。 |
| 我的/相册 | `/pages/me/index`、`/pages/wine-history/index?mode=album` | 我的页入口权重；相册返回兜底；未登录/失效 token 不刷 401；底部 CTA 不拖尾。 |

#### 14.21.3 首页登录入口复拍路径

- 清空 storage 中 `social-user-session-token`、`social-authorized-wechat-profile`。
- 打开 `/pages/index/index`。
- 截图 1：首屏可见 `登录后创建聚会` 入口。
- 点击 `.home-action-primary` / `创建聚会`。
- 截图 2：登录面板出现，预期页面状态为 `authPanelVisible=true`，`authRedirectUrl=/pages/create-session/index`。
- 完成登录后复拍：应进入 `/pages/create-session/index`；控制台无重复 401、无 `showLoading/hideLoading` 配对警告。

#### 14.21.4 brief 读取 query 固定样本

测试简报链路时优先使用固定 query：

- `briefId=brief-1781507687042-d1990edd`
- `sessionId=session-1781507687012-e4343d`

建议路径：

- `GET briefId` 链路：`/pages/session-brief/index?briefId=brief-1781507687042-d1990edd`
- `sessionId` 创建/刷新链路：`/pages/session-brief/index?sessionId=session-1781507687012-e4343d`
- 双参数记录路径：`/pages/session-brief/index?briefId=brief-1781507687042-d1990edd&sessionId=session-1781507687012-e4343d`
- 分享图路径：`/pages/share-poster/index?briefId=brief-1781507687042-d1990edd`；如测 session 创建链路，再使用 `/pages/share-poster/index?sessionId=session-1781507687012-e4343d`

注意：`/session-briefs/{briefId}` 200 不能代替 `/sessions/{sessionId}/brief` 通过结论；两条链路需分别记录接口状态和控制台。

#### 14.21.5 已知待复拍项

- `PR-FE-HOME-LOGIN-ENTRY-001`：未登录首页点击创建聚会应打开登录面板，登录成功自动进入创建页。
- `PR-FE-FLOW-NO-STUCK-001`：主路径 CTA、`live-record` 分段按钮、邀请页空 session 防卡住。
- `PR-FE-SHARE-SAVE-FIX-001`：`share-preview` / `share-poster` 保存图片，相册权限拒绝后再授权，后端海报下载失败时前端 canvas 兜底。
- `PR-FE-WINE-HISTORY-BACK-FIX-001`：相册页从首页、我的页、直达进入后的返回兜底。
- `PR-FE-ALBUM-TAIL-COMPACT-001`：相册/记录页尾部不再出现明显长空白。
- `PR-INT-BRIEF-PATH-CONTRACT-001`：`briefId` 读取链路与 `sessionId` 创建/刷新链路分开验收。

#### 14.21.6 测试退回时的定点复修入口

如最终复拍退回，前端只按截图/控制台原文定点复修：

| 退回类型 | 前端复修入口 |
| --- | --- |
| 首页登录入口/创建按钮 | `miniprogram/pages/index/index.ts`、`index.wxml`、`index.less` |
| 创建页主题卡/底部 CTA | `miniprogram/pages/create-session/index.wxml`、`index.less`、必要时 `index.ts` |
| 邀请页按钮/空 session | `miniprogram/pages/invite-group/index.ts`、`index.wxml`、`index.less` |
| 拍照/上传/失败态 | `miniprogram/pages/moment-editor/index.ts`、`index.wxml`、`index.less` |
| 记录/相册分段、拖尾 | `miniprogram/pages/live-record/index.ts`、`index.wxml`、`index.less` |
| 我的相册返回/401 | `miniprogram/pages/wine-history/index.ts`、`index.wxml`、`index.less` |
| 简报 query / brief 合同 | `miniprogram/pages/session-brief/index.ts`、`miniprogram/services/operations.ts`；如为接口 404，责任转后端/API |
| 分享保存 | `miniprogram/pages/share-preview/index.ts`、`miniprogram/pages/share-poster/index.ts` / `index.wxml` / `index.less` |

#### 14.21.7 本轮验证

- 本轮仅更新前端计划交接说明，未改源码。
- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- `git diff --check -- docs/gameplay-moments-frontend-development-plan.md`：通过。

### 14.22 `PR-FE-ONLINE-CAPTURE-SUPPORT-003` 线上样本最终采集前端支持包

执行边界：本轮只配合线上 `api.pomer.cn` 真实样本最终采集，确认前端页面路径、query、API base 和测试退回时的定点复修入口；不改业务源码，不改 PM 总台账、测试计划、UGC 计划或 UI/UX 计划；不得替任何角色写通过。

#### 14.22.1 API base 与线上采集前置

| 项 | 前端确认 |
| --- | --- |
| 默认 API base | `https://api.pomer.cn/api/v1`，来源 `miniprogram/config/api.ts` 的 `REMOTE_API_BASE` |
| 本地覆盖风险 | storage key `runtime-api-base` 如存在会覆盖默认 API base；线上采集前需确认该 key 为空，或明确设置为 `https://api.pomer.cn/api/v1` |
| 禁止触碰范围 | 不触碰 `pomer.cn` 官网项目、官网 PM2、官网 Nginx block、官网目录或无关项目 |
| 前端记录要求 | 如测试要求前端协助修改运行时 API base，只能记录目标、入口、证据、恢复方式；实际线上服务器或 DevTools 配置由 PM/测试授权执行 |

#### 14.22.2 页面路径与 query

| 采集目标 | 页面路径 / query | 相关前端接口 |
| --- | --- | --- |
| 首页登录入口 | `/pages/index/index` | `getUserAuthSession()`；未登录点击 `.home-action-primary` 打开登录面板 |
| 创建聚会 | `/pages/create-session/index` | `createManagedSession()` |
| 邀请/二维码 | `/pages/invite-group/index?sessionId=<onlineSessionId>` | `getManagedLiveSession(sessionId, inviteCode)` |
| 邀请预览 | `/pages/share-preview/index?sessionId=<onlineSessionId>&inviteCode=<onlineInviteCode>` | `getManagedLiveSession(sessionId, inviteCode)`；保存海报走前端 canvas |
| 拍照/上传 | `/pages/moment-editor/index?sessionId=<onlineSessionId>&nodeType=opening`；私密链路用 `nodeType=private&visibility=private` | `createManagedMoment(sessionId, payload)` |
| 记录/相册 | `/pages/live-record/index?sessionId=<onlineSessionId>` | `getManagedLiveSession()`、`getManagedSessionTimeline(sessionId)` |
| 我的相册 | `/pages/wine-history/index?mode=album`、`mode=host`、`mode=joined`、`mode=unshared` | `getManagedReportHistory(mode)`、`getManagedSessionMomentSummaries()` |
| 简报读取 | `/pages/session-brief/index?briefId=<onlineBriefId>` | `GET /session-briefs/{briefId}` |
| 简报创建/刷新 | `/pages/session-brief/index?sessionId=<onlineSessionId>` | `POST /sessions/{sessionId}/brief` |
| 分享图任务 | `/pages/share-poster/index?briefId=<onlineBriefId>`、`/pages/share-poster/index?taskId=<onlineTaskId>`、`/pages/share-poster/index?sessionId=<onlineSessionId>` | `getManagedSessionBrief()`、`getManagedShareImageTask()`、`createOrRefreshManagedSessionBrief()`、`createManagedShareImageTask()` |
| 今日回忆榜 | `/pages/rankings/index?category=today_highlight` | `getManagedTodayRanking(category, 50)` |

#### 14.22.3 线上样本采集重点

- 首页登录：清 storage 后点击 `.home-action-primary`，应出现登录面板；PM 已有 DevTools 初验证据，iPhone 12 仍需复拍。
- brief：`briefId` 读取链路与 `sessionId` 创建/刷新链路分开采集，不可混用通过结论。
- rankings：线上 `rankings/today` 已由 PM 通知发布为 200，前端仅等待测试采集真实返回和页面显示证据，不再围绕 404 扩大修改。
- share：分别采集 `share-preview` 保存邀请海报、`share-poster` ready 成品图保存、后端图缺失时 canvas 兜底、相册权限拒绝后再授权。
- albums：`wine-history` 未登录/失效 token 不应重复刷 401；相册返回和底部 CTA 需复拍。
- live-record：`记录/相册/分享` 分段点击需有反馈或跳转；分享分段会进入 `share-poster?sessionId=<onlineSessionId>`，间接依赖 session brief 创建接口。

#### 14.22.4 测试退回时的定点复修范围

| 退回证据类型 | 前端定点范围 |
| --- | --- |
| 首页登录入口未出现 / 登录后未跳创建页 | `miniprogram/pages/index/index.ts`、`index.wxml`、`index.less` |
| API base 指向错误 | `miniprogram/config/api.ts` 和 storage `runtime-api-base` 记录；默认不改源码，先确认测试环境配置 |
| 创建/邀请/拍照主路径卡住 | `create-session`、`invite-group`、`moment-editor` 对应页面 |
| brief query 或路径不一致 | `session-brief/index.ts`、`share-poster/index.ts`、`services/operations.ts`；若接口 404/500，转后端/API |
| rankings 数据/空态异常 | `rankings/index.ts` / `index.wxml`；若接口状态非 200 或合同不符，转后端/API |
| 分享保存失败 | `share-preview/index.ts`、`share-poster/index.ts` / `index.wxml` / `index.less` |
| 相册返回、401、拖尾 | `wine-history/index.ts` / `index.wxml` / `index.less` |
| 记录/相册分段或分享跳转 | `live-record/index.ts` / `index.wxml` / `index.less` |

#### 14.22.5 本轮验证

- 本轮仅更新前端计划交接说明，未改源码。
- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- `git diff --check -- docs/gameplay-moments-frontend-development-plan.md`：通过。

### 14.23 `PR-FE-ONLINE-TEST-TOKEN-HANDOFF-004` 线上登录态获取交接说明

执行边界：本轮只提供前端职责内的线上登录态获取方案与证据要求；不改业务源码，不改 PM 总台账、测试计划、UGC 计划或 UI/UX 计划；不替测试或接口联调写通过；不得记录或传播完整 token。

#### 14.23.1 API base 与 storage key 确认

| 项 | 前端确认 |
| --- | --- |
| 默认 API base | `https://api.pomer.cn/api/v1`，来源 `miniprogram/config/api.ts` 的 `REMOTE_API_BASE` |
| API base 覆盖 key | `runtime-api-base`；若该 key 有值，会覆盖默认线上地址 |
| 清除覆盖方式 | 微信开发者工具 Storage 面板删除 `runtime-api-base`，或 Console 执行 `wx.removeStorageSync('runtime-api-base')` |
| 检查当前 base | Console 执行 `wx.getStorageSync('runtime-api-base') || 'https://api.pomer.cn/api/v1'`；预期输出线上地址 |
| 登录 token key | `jzp-user-token`，请求头由 `getUserAuthHeaders()` 发送为 `X-JZP-User-Token` |
| 授权微信资料 key | `social-authorized-wechat-profile` |
| 当前 profile key | `social-current-profile`、`social-current-profile-id` |

注意：历史文档里如出现 `social-user-session-token`，以当前源码为准，实际 token key 是 `jzp-user-token`。

#### 14.23.2 微信开发者工具 GUI 获取线上登录态步骤

1. 打开微信开发者工具，确认项目指向当前小程序源码。
2. Storage 面板删除 `runtime-api-base`，或确认值为空；如测试明确要手动设置，值必须是 `https://api.pomer.cn/api/v1`。
3. Storage 面板删除旧登录态：`jzp-user-token`、`social-authorized-wechat-profile`、`social-current-profile`、`social-current-profile-id`。
4. 打开 `/pages/index/index`。
5. 点击首页 `创建聚会` 或首屏 `登录后创建聚会`，出现微信授权登录面板。
6. 选择头像、填写可识别昵称，例如 `online-host`、`online-memberA`、`online-memberB`、`online-outsider`，点击确认登录。
7. Network 面板确认 `/api/v1/user/auth/login` 请求 host 为 `https://api.pomer.cn`，随后 `/api/v1/user/auth/session` 返回 `loggedIn=true`。
8. Storage 面板确认生成 `jzp-user-token`；只记录 token 后 8 位，不截图完整 token。
9. Storage 面板或 Console 记录 `social-current-profile-id` / `social-current-profile.id`，用于角色映射。

可用 Console 只读摘要命令：

```text
({
  apiBase: wx.getStorageSync('runtime-api-base') || 'https://api.pomer.cn/api/v1',
  tokenSuffix: String(wx.getStorageSync('jzp-user-token') || '').slice(-8),
  profileId: wx.getStorageSync('social-current-profile-id') || (wx.getStorageSync('social-current-profile') || {}).id || '',
  profileName: (wx.getStorageSync('social-authorized-wechat-profile') || {}).name || (wx.getStorageSync('social-current-profile') || {}).name || ''
})
```

截图要求：Console 摘要只允许显示 `tokenSuffix`，不得显示完整 `jzp-user-token`。

#### 14.23.3 真机获取线上登录态步骤

1. 使用预览版或体验版打开小程序，确认当前版本为最终采集版本。
2. 进入首页，点击 `创建聚会` 或 `登录后创建聚会`。
3. 授权头像和昵称，昵称按角色命名：`online-host`、`online-memberA`、`online-memberB`、`online-outsider`。
4. 真机无法直接读取完整 storage 时，由测试连接微信开发者工具真机调试或使用 DevTools Storage/Console 读取摘要。
5. 证据只记录：设备、微信号/角色、profileId、token 后 8 位、Network host 为 `api.pomer.cn` 的截图或控制台摘要；不得记录完整 token。

#### 14.23.4 四角色登录态采集表

| 角色 | 需要的登录态 | 推荐动作 | 允许记录 |
| --- | --- | --- | --- |
| host | 线上 `jzp-user-token` + profileId | 使用 host 微信号登录首页，昵称 `online-host` | profileId、token 后 8 位、`/user/auth/session loggedIn=true` 截图 |
| memberA | 线上 `jzp-user-token` + profileId | 使用 memberA 微信号登录首页，昵称 `online-memberA` | profileId、token 后 8 位、`/user/auth/session loggedIn=true` 截图 |
| memberB | 线上 `jzp-user-token` + profileId | 使用 memberB 微信号登录首页，昵称 `online-memberB` | profileId、token 后 8 位、`/user/auth/session loggedIn=true` 截图 |
| outsider | 线上 `jzp-user-token` + profileId | 使用 outsider 微信号登录首页，昵称 `online-outsider` | profileId、token 后 8 位、`/user/auth/session loggedIn=true` 截图 |

限制：如果只有同一个微信账号反复登录，后端通常会得到同一个 `wechatOpenId`，不能可靠代表 host/memberA/memberB/outsider 四个独立真实用户。需要测试/用户提供四个不同微信身份、四台设备/真机，或由后端/API 提供可审计的线上测试用户生成方式。

#### 14.23.5 前端无法直接完成的事项

- 前端不能在当前线程直接读取用户微信开发者工具或真机里的线上 storage。
- 前端不能生成四个不同微信 `wechatOpenId`；真实四角色登录态需要四个微信身份或后端/API 授权生成。
- 前端不记录完整 token，不把 token 写入文档；只允许记录后 8 位或 loginCode 来源说明，例如“首页登录面板触发 wx.login”。
- 如果 `POST /sessions` 仍返回 401，需测试/接口联调提供：请求 host、`X-JZP-User-Token` 是否存在、token 后 8 位、`/user/auth/session` 响应、角色 profileId；前端再按截图/控制台原文判断是否需定点复修。

#### 14.23.6 本轮验证

- 只读核查：`miniprogram/config/api.ts`、`miniprogram/utils/social.ts`。
- 本轮仅更新前端计划交接说明，未改源码。
- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- `git diff --check -- docs/gameplay-moments-frontend-development-plan.md`：通过。

### 14.24 `PR-FE-ONLINE-TEST-TOKEN-HANDOFF-004-UPDATE` DB 生成测试身份后的前端配合口径

执行边界：用户确认当前没有 4 个账号供测试，改为由现有登录和数据库直接生成测试身份。本轮前端不再负责引导用户凑 4 个测试账号/token；只保留 API base、页面路径、query、登录态注入/清理注意事项和测试退回后的定点复修范围。不改业务源码，不改 PM 总台账、测试计划、UGC 计划或 UI/UX 计划，不替接口联调或测试写通过。

#### 14.24.1 API base 保留检查项

| 项 | 前端确认 |
| --- | --- |
| 默认 API base | `https://api.pomer.cn/api/v1` |
| 覆盖 key | `runtime-api-base` |
| 清除覆盖 | DevTools Storage 删除 `runtime-api-base`，或 Console 执行 `wx.removeStorageSync('runtime-api-base')` |
| 线上采集前检查 | Console 执行 `wx.getStorageSync('runtime-api-base') || 'https://api.pomer.cn/api/v1'`，预期为线上地址 |
| token storage key | `jzp-user-token` |
| 请求头 | `X-JZP-User-Token` |

如果 DB 生成测试身份后小程序仍打到本地或旧环境，优先检查 `runtime-api-base` 是否残留；前端默认不改源码。

#### 14.24.2 DB 生成身份后的页面路径与 query

接口联调/测试用 DB 生成 host、memberA、memberB、outsider 后，前端页面进入建议如下：

| 目标 | 页面路径 / query | 前端依赖 |
| --- | --- | --- |
| 首页登录态检查 | `/pages/index/index` | storage 中 `jzp-user-token` 对应线上身份；`getUserAuthSession()` 返回 `loggedIn=true` |
| 创建/邀请链路 | `/pages/create-session/index` -> `/pages/invite-group/index?sessionId=<onlineSessionId>` | host token 应能创建或进入 session |
| 成员进入记录 | `/pages/live-record/index?sessionId=<onlineSessionId>&role=viewer` | memberA/memberB token 应能读取当前 session 和 timeline |
| host 进入记录 | `/pages/live-record/index?sessionId=<onlineSessionId>&role=judge` | host token 应能读取并更新 session |
| 私密上传 | `/pages/moment-editor/index?sessionId=<onlineSessionId>&nodeType=private&visibility=private` | memberA token；visibleProfileIds 需由页面成员选择或接口样本决定 |
| 相册/历史 | `/pages/wine-history/index?mode=album`、`mode=host`、`mode=joined`、`mode=unshared` | 当前 token 对应 profile 的历史/相册权限 |
| 简报读取 | `/pages/session-brief/index?briefId=<onlineBriefId>` | `GET /session-briefs/{briefId}` |
| 简报创建/刷新 | `/pages/session-brief/index?sessionId=<onlineSessionId>` | `POST /sessions/{sessionId}/brief` |
| 分享图 | `/pages/share-poster/index?briefId=<onlineBriefId>`、`/pages/share-poster/index?taskId=<onlineTaskId>`、`/pages/share-poster/index?sessionId=<onlineSessionId>` | brief/task/session 三种入口需分别记录 |
| 榜单 | `/pages/rankings/index?category=today_highlight` | 当前 token 可访问排行榜接口；如接口 401/403/404 转接口联调 |

#### 14.24.3 登录态注入/清理注意事项

- DB 生成身份后，如测试需要手工注入登录态，至少需要 storage 中 `jzp-user-token` 与后端可识别的线上 token 一致；推荐同时写入 `social-current-profile-id` 和 `social-current-profile`，便于页面展示和角色识别。
- 只允许在测试证据中记录 token 后 8 位，不记录完整 token；完整 token 如必须用于接口联调，应通过 PM/接口联调的安全通道，不写入前端计划。
- 切换角色前必须清理旧身份：`jzp-user-token`、`social-current-profile-id`、`social-current-profile`、`social-authorized-wechat-profile`；如保留旧 profile，可能出现页面显示身份与请求 token 身份不一致。
- 切换角色后打开 `/pages/index/index`，用 Console 摘要确认：

```text
({
  apiBase: wx.getStorageSync('runtime-api-base') || 'https://api.pomer.cn/api/v1',
  tokenSuffix: String(wx.getStorageSync('jzp-user-token') || '').slice(-8),
  profileId: wx.getStorageSync('social-current-profile-id') || (wx.getStorageSync('social-current-profile') || {}).id || '',
  profileName: (wx.getStorageSync('social-current-profile') || {}).name || ''
})
```

- 若 `/user/auth/session` 返回 `loggedIn=false` 或 401，说明 token 与线上后端会话不匹配；前端等待测试控制台原文，不自行判定接口通过。

#### 14.24.4 前端等待的证据与定点复修条件

- 需要接口联调/测试提供：目标 API base、角色名、profileId、token 后 8 位、页面路径、控制台原文、Network 状态码和响应摘要。
- 如 DB 生成身份在页面无法进入或返回 401，前端只在拿到控制台原文后定点判断：
  - API base 错误：检查 `runtime-api-base`，默认不改源码。
  - token 未带上：检查 `jzp-user-token` storage 与请求头 `X-JZP-User-Token`。
  - profile 显示错误但请求成功：检查 `social-current-profile` / `social-current-profile-id` 注入。
  - 页面 query 错误：按 14.24.2 对应页面修正进入路径或由测试更正 query。
  - 接口 401/403/404 且请求头已正确：转接口联调/后端，不由前端写通过。

#### 14.24.5 本轮验证

- 本轮仅更新前端计划交接说明，未改源码。
- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- `git diff --check -- docs/gameplay-moments-frontend-development-plan.md`：通过。

### 14.25 `PR-FE-FINAL-BUILD-QR-HANDOFF-008` 最终构建 / 二维码 / 控制台采集交接包

执行边界：测试 `PR-QA-FINAL-IP12-CAPTURE-EXEC-007` 已确认接口摘要可用，但缺最终构建、体验版二维码、真机操作窗口和控制台采集方式，无法执行最终真机采集。本轮前端只补交接记录，不改业务源码，不改 PM 总台账、测试计划、UGC 计划或 UI/UX 计划，不替测试写通过。

#### 14.25.1 当前可确认与不可确认的入口

| 项 | 前端确认 |
| --- | --- |
| 默认 API base | `https://api.pomer.cn/api/v1`，来源 `miniprogram/config/api.ts` |
| API base 覆盖 | storage key `runtime-api-base` 存在时会覆盖默认线上地址 |
| 当前最终二维码/体验版入口 | 前端线程当前没有微信开发者工具上传记录、体验版二维码、预览二维码或构建号证据，不能确认用户此前二维码是否对应最后大版本 |
| 如沿用用户此前二维码 | 必须由 PM/测试在微信开发者工具或小程序后台核对上传备注、上传时间、版本号/构建号，并确认包含 `PR-FE-HOME-LOGIN-ENTRY-001` 及其后的最终复拍交接版本；前端不能仅凭“扫码可打开”判断为最后大版本 |
| 如需要新二维码 | 需要 PM/测试/有上传权限的成员在微信开发者工具执行编译、预览或上传体验版，并提供二维码、上传备注、构建号/版本标识、上传时间和截图证据 |

建议本轮测试版本标识：`PR-FE-FINAL-BUILD-QR-HANDOFF-008 / party-recorder-final-capture / 2026-06-16`。上传备注建议写入：`聚会记录师最终复拍包：首页登录入口、三步创建邀请拍照、brief/rankings/share/albums路径`。

#### 14.25.2 测试应使用的页面路径

| 采集目标 | 页面路径 / query |
| --- | --- |
| 首页与未登录创建入口 | `/pages/index/index` |
| 创建聚会 | `/pages/create-session/index` |
| 邀请/二维码 | `/pages/invite-group/index?sessionId=<onlineSessionId>` |
| 邀请分享预览 | `/pages/share-preview/index?sessionId=<onlineSessionId>&inviteCode=<onlineInviteCode>` |
| 拍第一张 / 上传 | `/pages/moment-editor/index?sessionId=<onlineSessionId>&nodeType=opening` |
| 私密瞬间 | `/pages/moment-editor/index?sessionId=<onlineSessionId>&nodeType=private&visibility=private` |
| 记录 / 相册 | `/pages/live-record/index?sessionId=<onlineSessionId>` |
| 我的页 | `/pages/me/index` |
| 我的相册 / 历史 | `/pages/wine-history/index?mode=album`、`mode=host`、`mode=joined`、`mode=unshared` |
| 简报读取 | `/pages/session-brief/index?briefId=<onlineBriefId>` |
| 简报创建/刷新 | `/pages/session-brief/index?sessionId=<onlineSessionId>` |
| 分享图 | `/pages/share-poster/index?briefId=<onlineBriefId>`、`/pages/share-poster/index?taskId=<onlineTaskId>`、`/pages/share-poster/index?sessionId=<onlineSessionId>` |
| 今日回忆榜 | `/pages/rankings/index?category=today_highlight` |

三步主路径复拍顺序：`/pages/index/index` 点击创建聚会 -> `/pages/create-session/index` 创建并邀请 -> `/pages/invite-group/index?sessionId=<onlineSessionId>` 点击拍第一张 -> `/pages/moment-editor/index?sessionId=<onlineSessionId>&nodeType=opening`。

#### 14.25.3 控制台采集方式

| 方式 | 可采集内容 | 当前状态 |
| --- | --- | --- |
| 微信开发者工具 Console / Network | storage 摘要、API base、请求 host、状态码、错误原文、页面跳转 | 需要 PM/测试打开对应最终构建执行；前端不能在当前线程直接采集真机控制台 |
| 真机远程调试 | iPhone 12 真机 Console、Network、storage 摘要、页面截图/录屏 | 需要测试安排真机操作窗口并连接微信开发者工具远程调试 |
| 体验版普通扫码 | 可采集截图/录屏和页面可见状态 | 若不连接远程调试，无法拿到完整 Console / Network；需在证据中标注“未采控制台” |

Console 摘要命令只允许输出 token 后 8 位：

```text
({
  apiBase: wx.getStorageSync('runtime-api-base') || 'https://api.pomer.cn/api/v1',
  tokenSuffix: String(wx.getStorageSync('jzp-user-token') || '').slice(-8),
  profileId: wx.getStorageSync('social-current-profile-id') || (wx.getStorageSync('social-current-profile') || {}).id || '',
  profileName: (wx.getStorageSync('social-current-profile') || {}).name || ''
})
```

如出现 401/403/404/保存失败/页面卡住，测试需同步保留：页面路径、角色、点击动作、Network URL、状态码、响应摘要、Console 原文、截图或录屏文件名。

#### 14.25.4 Storage / API base 清理步骤

最终复拍前建议先清理旧环境与旧身份：

1. 微信开发者工具 Storage 删除 `runtime-api-base`，或 Console 执行 `wx.removeStorageSync('runtime-api-base')`。
2. 检查 API base：`wx.getStorageSync('runtime-api-base') || 'https://api.pomer.cn/api/v1'`，预期为线上地址。
3. 切换角色前清理登录态：`jzp-user-token`、`social-current-profile-id`、`social-current-profile`、`social-authorized-wechat-profile`。
4. 如使用 DB 生成身份并注入登录态，注入后只记录 `profileId` 与 token 后 8 位；完整 token 不写入截图、计划或群内公开材料。
5. 打开 `/pages/index/index` 后再次执行 14.25.3 的 Console 摘要，确认当前角色和线上 API base 后再进入采集路径。

如果测试使用体验版真机且无法直接清 storage，应由测试/PM明确是否先“删除小程序并重新扫码”、是否通过开发者工具远程调试清缓存；前端不能把未清缓存的采集结果写成最终通过。

#### 14.25.5 仍阻塞测试执行的材料

- 最终构建/体验版二维码或开发版入口：需 PM/测试/有上传权限成员提供。
- 上传备注、构建号、版本标识和上传时间：需 PM/测试提供，避免最终截图录屏对应旧构建。
- 真机操作窗口：需测试协调 iPhone 12 / iOS 26.5 / 微信 8.0.73 操作时间。
- 控制台采集方式：需测试确认使用微信开发者工具远程调试，或明确本轮只能采截图/录屏、无法采 Console / Network。
- 线上样本参数：需接口联调/测试提供 `<onlineSessionId>`、`<onlineBriefId>`、`<onlineTaskId>`、`<onlineInviteCode>`、角色 profileId 与 token 后 8 位。

#### 14.25.6 本轮验证

- 只读核查：`AGENTS.md`、`miniprogram/config/api.ts`、`miniprogram/utils/social.ts`、本前端计划现有 14.21-14.24 交接记录。
- 本轮仅更新前端计划交接说明，未改源码。
- 待执行：`npm.cmd run check:encoding`；`git diff --check -- docs/gameplay-moments-frontend-development-plan.md`。

### 14.26 `PR-FE-DEVTOOLS-PREVIEW-SUPPORT-010` 微信开发者工具预览框阶段验收支持包

状态：支持预览框阶段验收。用户最新指令明确当前暂无真机，测试调试以微信开发者工具右侧预览框为准；预览框通过即可作为当前开发阶段通过，不再因为缺真机截图录屏或体验版二维码影响开发进度。前端仍不得写正式发布真机通过，不改 PM 总台账、测试计划、UGC 计划或 UI/UX 计划。

#### 14.26.1 项目与预览框执行入口

| 项 | 前端交接 |
| --- | --- |
| 项目路径 | `F:\codexlist\jiuzhuopanguan` |
| 小程序源码根 | `F:\codexlist\jiuzhuopanguan\miniprogram` |
| 开发者工具执行方式 | 用微信开发者工具打开项目后，点击编译，在右侧预览框直接按页面路径 / query 进入；如使用自动化，沿 PM 既有 `auto-port=9420` 口径记录结果 |
| 当前阶段验收口径 | DevTools 右侧预览框可作为开发阶段通过证据；缺真机录屏、体验版二维码不再作为前端开发阻塞 |
| 正式发布边界 | 预览框通过不等同于 iPhone 12 真机通过或正式发布通过；如后续发布准出仍要求真机/体验版，由测试/PM另行记录 |

#### 14.26.2 页面路径 / query

| 目标 | 页面路径 / query | 预览框检查点 |
| --- | --- | --- |
| 首页登录入口 | `/pages/index/index` | 清 storage 后点击主 CTA，应打开登录面板，不停留无反馈 |
| 创建聚会 | `/pages/create-session/index` | 主题卡不裁切，底部 CTA 不越界，三步路径清晰 |
| 邀请/二维码 | `/pages/invite-group/index?sessionId=<onlineSessionId>` | 二维码/房间码安全区可读，按钮可达 |
| 邀请分享预览 | `/pages/share-preview/index?sessionId=<onlineSessionId>&inviteCode=<onlineInviteCode>` | 保存入口可见，授权照片说明清楚 |
| 拍第一张 / 上传 | `/pages/moment-editor/index?sessionId=<onlineSessionId>&nodeType=opening` | 上传区、失败态、授权提示和主按钮可达 |
| 私密瞬间 | `/pages/moment-editor/index?sessionId=<onlineSessionId>&nodeType=private&visibility=private` | 私密范围选择与提示清楚，不泄露无关成员 |
| 记录 / 相册 | `/pages/live-record/index?sessionId=<onlineSessionId>` | 记录/相册/分享分段可点，旧玩法不抢主路径，列表不拖尾 |
| 我的页 | `/pages/me/index` | 相册/记录入口清晰，旧品牌和旧玩法权重降级 |
| 我的相册 / 历史 | `/pages/wine-history/index?mode=album`、`mode=host`、`mode=joined`、`mode=unshared` | 未登录不刷 401，返回可用，列表不过厚 |
| 简报 | `/pages/session-brief/index?briefId=<onlineBriefId>`、`/pages/session-brief/index?sessionId=<onlineSessionId>` | `briefId` 读取和 `sessionId` 创建链路分开看，不混写通过 |
| 分享图 | `/pages/share-poster/index?briefId=<onlineBriefId>`、`/pages/share-poster/index?taskId=<onlineTaskId>`、`/pages/share-poster/index?sessionId=<onlineSessionId>` | 二维码/房间码/按钮文案安全区不被遮挡 |
| 今日回忆榜 | `/pages/rankings/index?category=today_highlight` | 空态中文兜底，接口状态以 Network 为准 |

三步主路径预览框优先执行：`/pages/index/index` 点击创建聚会 -> `/pages/create-session/index` 创建并邀请 -> `/pages/invite-group/index?sessionId=<onlineSessionId>` 点击拍第一张 -> `/pages/moment-editor/index?sessionId=<onlineSessionId>&nodeType=opening`。

#### 14.26.3 Storage / API base 清理与角色切换

预览框测试前先清理旧环境：

1. Storage 面板删除 `runtime-api-base`，或 Console 执行：

```text
wx.removeStorageSync('runtime-api-base')
```

2. 检查 API base，预期为线上地址：

```text
wx.getStorageSync('runtime-api-base') || 'https://api.pomer.cn/api/v1'
```

3. 切换 host / memberA / memberB / outsider 前清理旧身份：

```text
wx.removeStorageSync('jzp-user-token')
wx.removeStorageSync('social-current-profile-id')
wx.removeStorageSync('social-current-profile')
wx.removeStorageSync('social-authorized-wechat-profile')
```

4. 如测试需要注入 DB 生成身份，注入后只记录 `profileId` 与 token 后 8 位；完整 token 不写入前端计划、截图或公开材料。
5. 每次切换角色后，用 Console 摘要确认 API base 与当前身份：

```text
({
  apiBase: wx.getStorageSync('runtime-api-base') || 'https://api.pomer.cn/api/v1',
  tokenSuffix: String(wx.getStorageSync('jzp-user-token') || '').slice(-8),
  profileId: wx.getStorageSync('social-current-profile-id') || (wx.getStorageSync('social-current-profile') || {}).id || '',
  profileName: (wx.getStorageSync('social-current-profile') || {}).name || ''
})
```

#### 14.26.4 Console / Network 检查点

- Network 请求 host 应为 `https://api.pomer.cn`；如出现本地地址，先查 `runtime-api-base`。
- 登录态请求应带 `X-JZP-User-Token`；只记录 token 后 8 位。
- `/user/auth/session` 若返回 401 或 `loggedIn=false`，说明当前 token 不可用，转接口联调/测试核对身份生成与注入。
- `session-brief` 需区分 `/session-briefs/{briefId}` 与 `/sessions/{sessionId}/brief` 两条链路。
- `rankings`、`brief`、`share`、`album` 如接口非 200，测试需保留 URL、状态码、响应摘要和 Console 原文；前端不把中文兜底写成接口通过。
- UI/UX 退回截图应包含页面路径、query、预览框宽度或机型模拟、点击动作、问题区域截图。

#### 14.26.5 预览框退回项的前端定点修复范围

前端只按测试/UI/UX 预览框证据定点修 P0，不再扩大重构：

| 退回项 | 前端处理范围 |
| --- | --- |
| 元素越界 / 底部按钮不可达 | 对应页面 WXML / LESS 的安全区、固定按钮、最长文案约束 |
| 列表过厚 / 拖尾过长 | 默认精选 3-5 项、折叠、紧凑卡片、减少单列厚卡 |
| 三步路径不清 | `index`、`create-session`、`invite-group`、`moment-editor` 的主 CTA 与跳转状态 |
| 旧品牌 / 旧玩法权重过高 | `index`、`judge`、`live-record`、`me`、`wine-history` 的主视觉和入口权重降级 |
| 按钮点击无反馈 / 页面卡住 | 对应页面 TS 事件绑定、toast、navigateTo / redirectTo 兜底 |
| 保存 / 分享异常 | `share-preview`、`share-poster` 的保存权限、canvas 兜底和错误文案 |

#### 14.26.6 本轮验证

- 本轮仅更新前端计划交接说明，未改源码。
- 待执行：`npm.cmd run check:encoding`；`git diff --check -- docs/gameplay-moments-frontend-development-plan.md`。

### 14.27 `PR-FE-PREVIEW-P1-THEME-CARD-FIX-011` 创建页主题卡 P1 可读性与点击区域修复

执行边界：依据 UI/UX `PR-UX-DEVTOOLS-PREVIEW-REVIEW-010` 单页审计，`/pages/create-session/index` 预览框无 P0，可继续开发；本轮只处理两个 P1：`PR-FE-PREVIEW-P1-THEME-CARD-READABILITY` 与 `PR-FE-PREVIEW-P1-THEME-CARD-TAP-AREA`。不扩大到无退回码页面，不改 PM 总台账、测试计划或 UI/UX 结论。

#### 14.27.1 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/create-session/index.less` | 调整 `create-theme-*` 主题卡展示样式 |
| `docs/gameplay-moments-frontend-development-plan.md` | 补本任务前端交付记录 |

#### 14.27.2 修复方式

- `PR-FE-PREVIEW-P1-THEME-CARD-READABILITY`：三张轻量主题卡仍保持三列精选结构，但提高卡片最小高度、加载骨架高度、缩略图高度、缩略图可见度、主标题字号、主标题行高、副文案字号和副文案行高，降低预览框扫读成本。
- `PR-FE-PREVIEW-P1-THEME-CARD-TAP-AREA`：主题卡 `min-height` 从 116px 提升到 148px，内边距增加到 `12px 10px`，加载骨架同步到 `148px`，扩大点击舒适区；选中态继续使用同宽边框与外层 `box-shadow` 表达，不改变盒模型尺寸，避免选中边框挤压文字和图片。
- 未改 `create-session` TS 跳转逻辑、接口调用、登录态判断或三步路径 CTA。

#### 14.27.3 三步创建 / 拍照路径影响

- 对三步路径无业务影响：`/pages/index/index` -> `/pages/create-session/index` -> `/pages/invite-group/index?sessionId=<onlineSessionId>` -> `/pages/moment-editor/index?sessionId=<onlineSessionId>&nodeType=opening` 保持不变。
- 本轮仅增强创建页主题卡可读性和点击区域，不改变创建按钮、创建接口、邀请页跳转或拍第一张入口。
- 仍需测试/UI/UX 在 DevTools 右侧预览框复核主题卡是否达到 P1 退回要求。

#### 14.27.4 本轮验证

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- `git diff --check -- miniprogram/pages/create-session/index.less docs/gameplay-moments-frontend-development-plan.md`：无空白错误；提示 `miniprogram/pages/create-session/index.less` 后续由 Git 触碰时 LF 会替换为 CRLF，未影响本轮检查。
- 前端自检尝试 `npm.cmd run wechat:auto -- relaunch --port 9420 --path /pages/create-session/index --wait 2500 --storage --data sessionName,templates,playerCount,templatesLoading --output docs/runtime/pr-fe-011-create-session-theme-card-after.png` 超时；随后 `status` 也超时，判断为本机 DevTools 自动化会话异常。本轮不写预览框通过，需测试/UIUX用可用会话重跑 `create-session` 主题卡截图复核。

### 14.28 `PR-FE-DEVTOOLS-DEBUGGER-ERROR-013` DevTools 调试器前端可控警告处理

执行边界：依据 PM 调试器截图 `docs/runtime/pm-devtools-debugger-window-20260617.png`，本轮只处理前端职责内的 `session-brief` loading 配对与前端可控警告判断。不改 PM 总台账、测试计划、UI/UX 计划、后端/接口联调文档；`ERR_CONNECTION_REFUSED 127.0.0.1:3221` 归接口联调/后端恢复本地服务或 API base，不由前端在本任务处理。

#### 14.28.1 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/session-brief/index.ts` | 修复 `loadBrief()`、`handleCreateShareTaskTap()`、`handleRetryShareTask()` 的 `wx.showLoading` / `wx.hideLoading` 与 toast 顺序，避免请求失败、提前错误或成功 toast 时与 loading 生命周期交叉 |
| `docs/gameplay-moments-frontend-development-plan.md` | 补本任务前端交付记录、警告归因和待复拍项 |

#### 14.28.2 修复方式

- `PR-FE-DEVTOOLS-DEBUGGER-ERROR-013 / showLoading-hideLoading`：`session-brief` 三个 loading 路径统一改为先记录 `toastMessage`，在 `finally` 中先 `wx.hideLoading()`，然后再 `showToast()`；避免 catch 或成功态先弹 toast、后 hide loading 导致 DevTools 提示 `showLoading 与 hideLoading 必须配对使用`。
- 未改 `session-brief` 的接口调用、query 解析、页面结构、分享图任务接口或榜单跳转。

#### 14.28.3 调试器其他提示判断

| 提示 | 前端判断 | 本轮处理 |
| --- | --- | --- |
| `[pages/session-brief/index] Some selectors are not allowed in component wxss... ./components/navigation-bar/navigation-bar.wxss:6` | 来源是通用 `miniprogram/components/navigation-bar/navigation-bar.less`，不是 `session-brief` 私有样式；当前触发点为自定义导航组件的通用 selector 限制提示，影响面覆盖多页 | 本轮不扩大修改通用组件。建议另开低优任务：把 navigation-bar 组件 wxss 中不被允许的后代选择器改为组件内可用类名绑定，并做全页面导航回归 |
| `[pages/share-preview/index] <canvas>: canvas 2d 接口支持同层渲染性能更佳...` | `share-preview` 目前使用旧 `canvas-id` + `wx.createCanvasContext` 作为保存邀请海报兜底；前端计划已有 `PR-FE-SHARE-SAVE-FIX-001` 的 canvas 兜底说明，但没有专门的 Canvas 2D 迁移准出计划 | 本轮不作为 P0，不改 `share-preview`。建议后续单独评估 `share-preview` / `share-poster` 统一迁移 `type="2d"`，覆盖保存权限、临时文件生成和低版本基础库兼容 |
| `ERR_CONNECTION_REFUSED 127.0.0.1:3221` | 本地接口服务或 API base 问题，不是本页 loading 配对根因 | 转接口联调/后端恢复本地 3221 或切回 `https://api.pomer.cn/api/v1`；前端不在本任务伪造接口通过 |

#### 14.28.4 三步创建 / 拍照路径影响

- 本轮只修 `session-brief` 的 loading/toast 配对，不改变首页、创建聚会、邀请、拍第一张路径。
- 不影响 `/pages/index/index` -> `/pages/create-session/index` -> `/pages/invite-group/index?sessionId=<onlineSessionId>` -> `/pages/moment-editor/index?sessionId=<onlineSessionId>&nodeType=opening`。
- 仍需测试在 DevTools 右侧预览框复拍 `pages/session-brief/index`：接口失败、`briefId` 读取、`sessionId` 创建/刷新、分享图创建和 retry 失败/成功路径，确认 Console 不再出现 loading 配对警告。

#### 14.28.5 本轮验证

- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- `npm.cmd run typecheck`：通过。
- `git diff --check -- miniprogram/pages/session-brief/index.ts docs/gameplay-moments-frontend-development-plan.md`：通过，无输出。

### 14.29 `PR-FE-DUAL-FLOW-ACCOUNTING-014` 拍照记录与酒桌记账双主线入口恢复

执行边界：依据 PM 新派 P0 和用户纠偏，本轮只恢复前端可控入口与进行中页账本可见性；分享页/保存图的酷炫视觉与联合分享结构等待 UI/UX `PR-UX-DUAL-FLOW-SHARE-014` / `PR-FE-SHARE-FLOW-IMPLEMENT-015` 设计包回收后再按包复刻。不改 PM 总台账、测试计划、UI/UX 计划、UGC 或后端文档。

#### 14.29.1 影响面盘点

| 链路 | 当前状态 | 本轮判断 |
| --- | --- | --- |
| 酒桌记账 / 欠酒 / 已喝 | `operations.ts`、`live-record`、`table-mode`、`result-report` 仍保留 `debtCount`、`drinkCount`、`clearedCount`、排行和战报能力 | 功能未消失，但新 UI 中被弱化为“兼容记录”，用户容易误判记账消失 |
| 关键事件 / 转盘 | `live-record` 仍有 `handleWheelTap()`，`table-mode` 战报仍会生成关键事件 | 入口在新 WXML 中不可见或权重过低，需要恢复 |
| 桌面账本 | `table-mode` 仍是清晰账本表格，结束后可生成旧战报 | 可作为当前“聚会账本”承载页，不能阻塞三步拍照 |
| 战报 / 分享 | `result-report` 有账本排行与精彩事件，`share-poster` 有分享任务状态和本地保存兜底 | 联合“照片 + 账本高光”的最终酷炫分享页等待 UI/UX 设计包，不在本轮抢跑 |
| 历史 / 回流 | `wine-history` 已结束记录进入战报/分享图，进行中记录回 `live-record` | 入口存在，文案和视觉待后续分享流程统一 |

#### 14.29.2 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/judge/index.ts` | 快捷入口调整为“拍照记录 / 聚会账本 / 历史相册 / 分享记录”；`聚会账本` 有当前 `sessionId` 时进入 `table-mode`，无当前聚会时引导创建 |
| `miniprogram/pages/judge/index.wxml` | 区块标题改为“双主线入口”，明确拍照与账本并存 |
| `miniprogram/pages/judge/index.less` | 增加账本入口图标与入口色块 |
| `miniprogram/pages/live-record/index.wxml` | 页面标题改为“记录/账本”；新增“聚会账本”入口卡；判官账本面板恢复欠酒、已喝加减和关键事件按钮 |
| `miniprogram/pages/live-record/index.ts` | 底部副按钮改为“打开账本”；新增 `handleLedgerTap()` 复用保存并进入桌面账本 |
| `miniprogram/pages/live-record/index.less` | 增加账本入口卡与账本面板紧凑控制样式，避免加减按钮溢出 |

#### 14.29.3 三步创建 / 拍照路径影响

- 不改变 `/pages/index/index` -> `/pages/create-session/index` -> `/pages/invite-group/index?sessionId=<onlineSessionId>` -> `/pages/moment-editor/index?sessionId=<onlineSessionId>&nodeType=opening`。
- “继续拍照”仍是进行中页主操作，记账入口并存但不要求用户先配置账本。
- `table-mode` 作为聚会账本承载页复用现有 runtime / managed session 数据；本轮未新增接口字段。

#### 14.29.4 待复核 / 待联调

- UI/UX：复核 `judge` 与 `live-record` 双主线入口权重是否清晰，并给出分享页/保存图视觉标准。
- 测试：DevTools 预览框复拍 `judge`、`live-record`、`table-mode`，确认拍照主路径不被账本阻塞，判官加减欠酒/已喝后能进入桌面账本。
- 接口联调：如 `updateManagedSession` 写入失败，需保留 Network URL、状态码和响应摘要；前端不能把本地 runtime 变更写成接口通过。

### 14.30 `PR-FE-SHARE-FLOW-IMPLEMENT-015` 酷炫分享流程实现

状态：源码已实现 / 待测试预览框复测 / 待 UI/UX 对照 5 张目标图复核 / 待后端 API 016 补显式账本聚合合同。PM 二次激活后，UI/UX 设计包与接口联调样本已回收；本轮按 `docs/design-assets/party-recorder/share-flow-015/` 目标图用原生 WXML/WXSS/canvas 复刻，不把 5 张 PNG 整图入小程序包。

#### 14.30.1 影响页面 / 组件

| 范围 | 前端关注点 |
| --- | --- |
| `share-preview` | 邀请预览、加入状态、保存邀请图、公开分享安全区 |
| `share-poster` | 结果分享页、分享任务状态、成品图预览、保存成功/失败/重试、本地 canvas fallback |
| `result-report` | 旧战报兼容、账本排行/事件到分享页的入口 |
| `table-mode` | 结束本局、账本表格、结算摘要、生成战报/分享入口 |
| `judge` | 分享记录入口、双主线入口与回流 |
| `wine-history` | 已结束场次、待分享相册、分享图任务回流查看 |
| `share-task-status` | `pending / processing / ready / failed / expired` 状态表达与重试事件 |
| 保存图片逻辑 | `saveImageToPhotosAlbum` 权限、下载成品图、本地 canvas 临时文件、失败 toast |

#### 14.30.2 字段映射准备

| 分享模块 | 前端字段来源 | 等 UI/UX 包后实现要点 |
| --- | --- | --- |
| 照片墙 | `session-brief` / timeline nodes / share task 成品图 | 只展示已授权、审核通过、服务端筛选后的公开素材 |
| 欠酒 / 已喝 | `playerStats.debtCount`、`playerStats.drinkCount`、report ranks | 与照片高光同屏呈现，不能只剩照片或空列表 |
| 关键事件 | `report.events`、timeline `event` nodes、转盘/消杯记录 | 作为酒局基因高光，不覆盖拍照主线 |
| 榜单 / 高光 | `report.ranks`、`rankings`、session brief highlights | 标明来源与状态，未联调时只做待接入/空态 |
| 聚会总结 | `ManagedSessionBrief.title`、session name、player count、时间线摘要 | 与产品名“聚会记录师”一致，旧品牌只保留技术上下文 |
| 分享任务状态 | `ManagedShareImageTask.status`、`imageUrl`、`failedReason`、`retryCount` | 状态组件负责生成中、失败、过期和重试 |
| 保存成功 / 失败 | `saveImageToPhotosAlbum`、`downloadFile`、canvas temp file | 成功、拒权、下载失败、canvas 失败均需可见反馈 |
| 回流查看 | `briefId`、`sessionId`、`taskId`、`reportId` | 历史页、战报页、分享页之间 query 不能丢失 |

#### 14.30.3 待 UI/UX 回收材料

- 设计包任务：`PR-UX-DUAL-FLOW-SHARE-014` / `PR-FE-SHARE-FLOW-IMPLEMENT-015` 对应页面稿、状态稿、保存图稿和资产路径。
- 资产清单：背景、贴纸、按钮状态、分享图底图、尺寸、压缩要求和接入路径。
- 状态样本：空照片、少量照片、多照片、无账本、账本有欠酒/已喝、任务生成中、失败、过期、ready。
- 测试路径：UI/UX 包回收后前端交测试预览框路径至少覆盖 `/pages/share-preview/index?sessionId=<onlineSessionId>&inviteCode=<onlineInviteCode>`、`/pages/share-poster/index?sessionId=<onlineSessionId>`、`/pages/share-poster/index?briefId=<onlineBriefId>`、`/pages/share-poster/index?taskId=<onlineTaskId>`、`/pages/result-report/index?reportId=<onlineReportId>`、`/pages/wine-history/index?mode=unshared`。

#### 14.30.4 本轮验证

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- `git diff --check -- miniprogram/pages/share-poster/index.ts miniprogram/pages/share-poster/index.wxml miniprogram/pages/share-poster/index.less miniprogram/pages/share-preview/index.ts miniprogram/pages/share-preview/index.wxml miniprogram/pages/share-preview/index.less miniprogram/pages/session-brief/index.ts miniprogram/pages/session-brief/index.wxml miniprogram/pages/session-brief/index.less docs/gameplay-moments-frontend-development-plan.md`：通过，无空白错误；对已跟踪源码提示 LF 后续可能替换为 CRLF。
- 对当前 Git 视图中显示为未跟踪的 `session-brief` 与前端计划文件，补跑 `git diff --check --no-index -- NUL <file>`：无空白错误；命令因文件存在差异返回 1，仅输出 LF/CRLF 提示。

#### 14.30.5 本轮源码文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/share-poster/index.ts` | 接入 `briefId/taskId/sessionId` 分享融合数据；从 timeline 过滤公开照片，从 `getManagedLiveSession()` 的 `joinedPlayers/joinStatusPlayers` 聚合欠酒、已喝、已清、账本条数；从 event nodes 聚合关键事件；新增 `saveState/errorText/ledgerContractNotice` 供测试取数 |
| `miniprogram/pages/share-poster/index.wxml` | 按 015 目标图复刻分享入口、融合预览、保存成功/失败/重试、回流查看；保留 `share-task-status` 任务状态组件 |
| `miniprogram/pages/share-poster/index.less` | 增加 `poster-flow-015` 命名空间样式：暗色舞台、拍照/账本双高光、照片墙、账本数字条、关键事件、保存状态卡和回流操作 |
| `miniprogram/pages/share-preview/index.ts` | 邀请预览页补 `accountingHighlights/ledgerCount/shareSummary`，从 live session 真实账本计数聚合 |
| `miniprogram/pages/share-preview/index.wxml` | 邀请预览新增“照片记录 + 聚会账本”融合摘要，供测试 13.16.40 预览字段采集 |
| `miniprogram/pages/share-preview/index.less` | 新增邀请预览融合摘要样式，保持口令安全区可读 |
| `miniprogram/pages/session-brief/index.ts` | 新增 `handleOpenShareFlowTap()`，从简报进入 `share-poster` 并携带 `briefId/sessionId/taskId` |
| `miniprogram/pages/session-brief/index.wxml` | 分享图任务区新增“生成酷炫分享页”入口 |
| `miniprogram/pages/session-brief/index.less` | 新增分享流程入口样式 |

#### 14.30.6 测试预览框路径 / selector / data 摘要

| 用例 | 页面路径 | selector / data |
| --- | --- | --- |
| 简报入口 | `/pages/session-brief/index?sessionId=session-1781584503517-c033e9&briefId=brief-1781584503870-25d5edac` | selector：`.brief-share-flow-entry`；data：`briefId`、`sessionId`、`shareTask.id` |
| 分享融合 ready | `/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781685446105-ae6b6317` | selector：`.poster-stage-primary`、`.poster-primary-action`、`.poster-return-card`；data：`photoHighlights`、`accountingHighlights`、`keyEvents`、`shareSummary`、`saveState`、`ledgerContractNotice`、`readyShareImageUrl`、`shareTask.status` |
| failed / 重试 | `/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781584504132-3251bd01` | selector：`.poster-state-card-warn`、`.poster-state-action`；data：`errorText`、`saveState`、`shareTask.status`、`shareTask.failedReason`、`taskPrimaryLabel` |
| 邀请预览融合 | `/pages/share-preview/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T` | selector：`.share-fusion-summary`；data：`accountingHighlights`、`ledgerCount`、`shareSummary`、`joinedCount`、`playerCount` |

#### 14.30.7 字段缺口 / 待后端接口补齐

- 当前没有显式 `ledgerSummary/accountingHighlights/settlementSummary` 字段；前端本轮按接口联调 3.25 允许口径，从 `sessions/live.joinedPlayers` 与 timeline event nodes 真实聚合。
- 当前没有独立 `shareId` / 局外回流权限响应；`share-poster` 先用 `viewerRole='member'`、`permissionState='public'` 和 UGC 安全提示做前端结构，仍需后端/API 016 或后续回流合同补真实角色字段。
- 当前保存图 canvas 以 `canvas-id` 旧接口生成；DevTools 可能继续提示 Canvas 2D 同层渲染性能建议，后续可另开低优迁移，不影响本轮 P0 融合结构。

### 14.31 `PR-FE-SHARE-FLOW-P0-RETEST-FIX-018` QA 015 退回项前端收口

状态：已按 PM 收口停止扩大实现 / 入口与融合数据已修 / 保存按钮 DevTools 自动化仍阻塞 / 待测试复测与接口联调补字段。记录时间：2026-06-17。

#### 14.31.1 本轮源码影响

| 文件 | 修复摘要 |
| --- | --- |
| `miniprogram/pages/session-brief/index.ts` | query 先落 `briefId/sessionId`，授权或 brief 接口失败不再让 `loading=true` 卡死；失败时保留页面和分享入口，`errorText` 可供 QA 取数。 |
| `miniprogram/pages/share-poster/index.ts` | task/brief 查询失败拆分处理，失败也落 `shareTask.status=failed`、`saveState=failed`、`errorText`；固定 015/018 样本只补真实 `sessionId/inviteCode/briefId` 关联，用公开 `sessions/live` 聚合账本和账本关键事件，不伪造照片/task ready 数据。 |
| `miniprogram/pages/share-poster/index.wxml` | 顶部拍照/账本高光卡不再跳出到创建聚会；保持在分享流程内触发预览/任务状态动作。 |
| `miniprogram/pages/share-preview/index.ts` | 邀请预览补 `photoHighlights/keyEvents/photoHighlightsNotice` data 字段；关键事件从真实账本成员计数派生，照片字段为空态指向接口补齐。 |
| `miniprogram/pages/share-preview/index.wxml` / `index.less` | 邀请预览增加照片高光与关键事件证据区；照片缺口显示待 `PR-INT-SHARE-FLOW-BE016-VERIFY-017-RUN` 补字段。 |

#### 14.31.2 已通过的前端验证证据

| 项 | 命令 / 截图 | 摘要 |
| --- | --- | --- |
| TypeScript | `npm.cmd run typecheck` | 通过，`tsc --noEmit --pretty false` 无报错。 |
| 编码 | `npm.cmd run check:encoding` | 通过，`Encoding check passed`。 |
| brief 不再 loading | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/session-brief/index?sessionId=session-1781584503517-c033e9&briefId=brief-1781584503870-25d5edac" --wait 5000 --storage --data briefId,sessionId,loading,errorText,shareTask --output docs/runtime/pr-fe-share-flow-018-brief-entry-20260617.png` | 截图 `docs/runtime/pr-fe-share-flow-018-brief-entry-20260617.png`；data：`briefId=brief-1781584503870-25d5edac`、`sessionId=session-1781584503517-c033e9`、`loading=false`、`errorText=not session member`、`shareTask=null`；Console `[]`。 |
| brief 入口可点击 | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/session-brief/index?sessionId=session-1781584503517-c033e9&briefId=brief-1781584503870-25d5edac" --selector .brief-share-flow-entry --wait 3000 --storage --data briefId,sessionId,loading,errorText,shareTask --output docs/runtime/pr-fe-share-flow-018-brief-entry-tap-20260617.png` | selector 可点击并进入 `pages/share-poster/index`；截图 `docs/runtime/pr-fe-share-flow-018-brief-entry-tap-20260617.png`；Console 为前端记录的 brief unavailable warn。 |
| ready 路径账本/关键事件落地 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781685446105-ae6b6317" --wait 6000 --storage --data briefId,sessionId,photoHighlights,accountingHighlights,keyEvents,shareSummary,saveState,errorText,ledgerContractNotice,readyShareImageUrl,shareTask --output docs/runtime/pr-fe-share-flow-018-poster-ready-20260617.png` | 截图 `docs/runtime/pr-fe-share-flow-018-poster-ready-20260617.png`；data：`briefId=brief-1781584503870-25d5edac`、`sessionId=session-1781584503517-c033e9`、`accountingHighlights=[欠酒3杯, 已喝4杯, 已清1杯, 账本2条]`、`keyEvents=2`、`shareSummary=这场聚会留下 0 张公开照片、2 条账本高光和 2 个关键时刻。`、`saveState=failed`、`errorText=not session member`、`shareTask.status=failed`。 |

#### 14.31.3 保存按钮仍失败 / 未闭环

- 失败命令 1：`npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781685446105-ae6b6317" --selector .poster-primary-action --wait 5000 --storage --data saveState,errorText,posterImagePath,readyShareImageUrl,shareTask --output docs/runtime/pr-fe-share-flow-018-poster-ready-save-tap-20260617.png`。
- 失败原文：`command timed out after 124027 milliseconds`；此前同类保存点击也出现 `command timed out after 124058 milliseconds`。
- 失败命令 2：保存卡住后尝试 `npm.cmd --% run wechat:auto -- status --port 9420 --storage --data saveState,errorText,posterImagePath,readyShareImageUrl,shareTask --output docs/runtime/pr-fe-share-flow-018-after-save-timeout-status-20260617.png`，失败原文：`command timed out after 124032 milliseconds`。
- 残留状态：只读进程检查显示微信开发者工具仍有一组 `wechatdevtools.exe` 会话和多个 `node.exe` 进程；PM 收口后未再清理或重启。
- 当前页面是否仍留在分享流程：保存超时后的实时页面 data 未能通过 automator status 取回；保存点击前 ready 页面已在 `pages/share-poster/index`，且本轮源码已移除顶部高光卡跳转创建聚会的绑定。是否仍会跳转创建页需测试在工具链恢复后复拍确认；前端本轮不写通过。

#### 14.31.4 仍需接口 / 测试补齐

- 样本成员身份：当前 storage token 后 8 位 `c418e86ad`，对应用户不是固定样本成员；`session-briefs/<briefId>` 与 `share-image-tasks/<taskId>` 在当前身份下返回 `not session member`，需接口联调 / 后端提供可复跑成员 token/storage 前置，或把 015 公开分享查询合同改为不依赖成员身份。
- 照片/task 权限缺口：`photoHighlights=[]`、`readyShareImageUrl=""` 仍由 brief/task 权限阻塞导致；前端只展示真实空态和错误态，不伪造照片墙或 ready 成品图。
- `PR-INT-SHARE-FLOW-BE016-VERIFY-017-RUN`：仍需补 `ledgerIncluded`、`ledgerSummary/accountingHighlights`、`photoHighlights`、`keyEvents`、`shareSummary`、`filteredNodeIds/visibleNodes/permissionState` 等显式字段映射；本轮前端只做公开 live session 真实聚合兜底，016 新字段尚未接入验证。
- 测试：需在工具链恢复后复拍保存按钮、failed task `.poster-state-card-warn`、邀请预览 `photoHighlights/keyEvents` 字段；测试通过结论只能由测试线程写。

### 14.32 `PR-FE-SHARE-FLOW-CONTRACT-MAP-019` 016 合同字段前端映射

状态：源码已补字段类型与 normalize 映射 / 待测试使用 host/member storage 复拍 / 不写测试通过。记录时间：2026-06-17。本节只改前端源码和前端计划，不改 PM 总台账、团队公告、派发队列、测试/UIUX/UGC 文档。

#### 14.32.1 源码影响文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/services/operations.ts` | `RemoteShareImageTask/ManagedShareImageTask/normalizeShareImageTask` 补 `ledgerIncluded/includeLedger/layoutMode` 映射；`createManagedShareImageTask` payload 补 `includeLedger`；`RemoteSessionBrief/ManagedSessionBrief/normalizeSessionBrief` 补 `ledgerSummary/accountingHighlights/settlementSummary/ledgerRankings/eventHighlights/shareContentFilter`。 |
| `miniprogram/pages/share-poster/index.ts` | page data 补 `ledgerIncluded/taskIncludeLedger/taskLayoutMode/ledgerSummary/settlementSummary/ledgerRankings/shareContentFilter`；优先消费 016 `accountingHighlights/eventHighlights`，缺字段时才回退现有 live session/timeline 真实聚合；新建任务请求改为 `layoutMode=dual_flow&includeLedger=true`。 |
| `miniprogram/pages/session-brief/index.ts` | page data 补 016 brief 合同字段，入口页可直接取 `ledgerSummary/accountingHighlights/settlementSummary/ledgerRankings/eventHighlights/shareContentFilter`；创建分享图任务使用 `dual_flow/includeLedger=true`。 |
| `miniprogram/pages/share-preview/index.ts` | query 带 `briefId` 时读取 brief 016 合同字段并落 page data；无 `briefId` 时保持空态并继续使用公开 live session 的真实账本聚合，不硬编码样本、不造照片。 |

#### 14.32.2 字段映射摘要

| 合同字段 | 前端映射 |
| --- | --- |
| `shareTask.ledgerIncluded` | `ManagedShareImageTask.ledgerIncluded`，页面 data：`ledgerIncluded`、`shareTask.ledgerIncluded`。 |
| `shareTask.includeLedger` | `ManagedShareImageTask.includeLedger`，页面 data：`taskIncludeLedger`、`shareTask.includeLedger`；创建任务 payload 支持 `includeLedger=true`。 |
| `shareTask.layoutMode` | `ManagedShareImageTask.layoutMode` 已保留，页面 data：`taskLayoutMode`、`shareTask.layoutMode`。 |
| `brief.ledgerSummary` | `ManagedSessionBrief.ledgerSummary`，页面 data：`ledgerSummary`。 |
| `brief.accountingHighlights` | `ManagedSessionBrief.accountingHighlights`，`share-poster/share-preview` 转成可展示 metric；原始合同数组仍由 `session-brief` data 暴露。 |
| `brief.settlementSummary` | `ManagedSessionBrief.settlementSummary`，页面 data：`settlementSummary`。 |
| `brief.ledgerRankings` | `ManagedSessionBrief.ledgerRankings`，页面 data：`ledgerRankings`。 |
| `brief.eventHighlights` | `ManagedSessionBrief.eventHighlights`，`share-poster/share-preview` 转成 `keyEvents`；原始合同数组仍由 `session-brief` data 暴露。 |
| `brief.shareContentFilter` | `ManagedSessionBrief.shareContentFilter`，页面 data：`shareContentFilter`。 |

#### 14.32.3 页面 data 摘要 / 复测建议

| 页面 | QA 可取 data |
| --- | --- |
| `/pages/session-brief/index?sessionId=session-1781584503517-c033e9&briefId=brief-1781584503870-25d5edac` | `ledgerSummary,accountingHighlights,settlementSummary,ledgerRankings,eventHighlights,shareContentFilter,shareTask.layoutMode,shareTask.ledgerIncluded`；当前非成员 storage 仍可能返回 `not session member`，需按接口 3.27 注入 host/member token。 |
| `/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452` | dual_flow 推荐样本；取 `ledgerIncluded,taskIncludeLedger,taskLayoutMode,readyShareImageUrl,shareTask,ledgerSummary,settlementSummary,ledgerRankings,shareContentFilter,accountingHighlights,keyEvents`。 |
| `/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781685446105-ae6b6317` | 旧 ready 样本；3.27 已说明 `ledgerIncluded=false` 属预期，不应按 016 失败判断。 |
| `/pages/share-preview/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T&briefId=brief-1781584503870-25d5edac` | 带 `briefId` 时可取 `ledgerSummary,settlementSummary,ledgerRankings,shareContentFilter,accountingHighlights,keyEvents`；不带 `briefId` 时只能看到 live session 聚合和空态提示。 |

#### 14.32.4 验证

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- 待补：目标 `git diff --check` 在最终回包前执行。

#### 14.32.5 仍需依赖

- 接口联调 3.27 已给 host/member 可读结论，但当前前端 DevTools storage 若仍是非样本成员，ready/dual_flow task 会继续 `not session member`；测试需注入 3.27 的样本成员 storage/token 后复拍。
- 本轮只补合同字段映射，不继续扩大保存链路，不新增 DevTools 保存绕行，不替测试写预览框通过。

### 14.33 `PR-FE-SHARE-FLOW-PIXEL-MATCH-020` 分享视觉 020 复刻

状态：源码已按 UI/UX 020 规格重做分享相关视觉 / 待测试预览框复拍 / 待 UI/UX 像素复核。记录时间：2026-06-17。本节只改前端源码和前端计划，不改 PM 总台账、团队公告、派发队列、测试/UIUX/UGC 文档。

#### 14.33.1 源码影响文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/assets/party-recorder/share-flow/pr-share020-*.svg` | 接入 UI/UX 020 的 6 个 SVG 切图：星芒、珊瑚闪光、薄荷胶带、账本徽章、珊瑚下划线、薄荷安全盾；未把 015/020 整张目标 PNG 入包。 |
| `miniprogram/pages/share-poster/index.wxml` | 保留原 `poster-flow-015` 数据结构和 QA selector，补 020 入口舞台、照片拍立得、账本纸条、保存海报预览、安全区、回流查看结构。 |
| `miniprogram/pages/share-poster/index.less` | 按 020 规格重做暗色酒桌舞台、霓虹账本墙、竖版海报预览、成功/失败/重试状态卡和浅色回流卡视觉。 |
| `miniprogram/pages/share-preview/index.wxml` | 保留 `.share-fusion-summary`，补浅色公开回流页的品牌、拍立得照片墙、口令安全区、照片+账本融合摘要和关键事件证据区。 |
| `miniprogram/pages/share-preview/index.less` | 按 020 规格重做公开回流页：奶油纸面、黑色主标题、拍立得墙、深色融合账本卡、珊瑚保存按钮。 |
| `miniprogram/pages/session-brief/index.wxml` | 保留 `.brief-share-flow-entry` 和 `data-share-entry-selector`，增强分享入口为拍照记录 + 聚会账本并列入口。 |
| `miniprogram/pages/session-brief/index.less` | 分享入口改为 020 暗色聚会舞台样式，补 SVG 装饰、双流卡和珊瑚 CTA。 |

#### 14.33.2 设计图到结构映射

| UI/UX 015/020 目标 | 前端结构 |
| --- | --- |
| 01 分享入口面板 | `share-poster` 的 `.poster-share020-entry` 与 `session-brief` 的 `.brief-share020-entry`；照片记录和聚会账本并排展示。 |
| 02 分享预览融合页 | `share-poster` 的 `.poster-share020-preview`，使用真实 `photoHighlights/accountingHighlights/keyEvents/shareSummary`。 |
| 03 竖版保存海报 | `share-poster` 的 `.poster-share020-poster-preview`，保留照片墙、账本指标、聚会总结和口令/QR 安全区。 |
| 04 保存成功/失败/重试 | `share-poster` 的 `.poster-share020-save .poster-state-card-*`，不新增 DevTools 专用保存分支。 |
| 05 分享回流查看 | `share-preview` 的 `.share020-return-card` 与 `share-poster` 的 `.poster-share020-return`。 |

#### 14.33.3 字段不破坏说明 / 页面 data 摘要

- 本轮只改 WXML/WXSS/资源接入，不改 `services/operations.ts` 合同映射，不改 `RemoteShareImageTask/ManagedShareImageTask/RemoteSessionBrief/ManagedSessionBrief` 数据结构。
- `photoHighlights/accountingHighlights/keyEvents/shareSummary/ledgerIncluded/taskIncludeLedger/taskLayoutMode/readyShareImageUrl/shareTask.status/saveState/errorText` 均继续消费 019 已映射的真实字段或现有真实聚合；字段不存在时展示空态/待联调提示，不造样本数据。
- 推荐复测 ready dual_flow：`/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452`，selector：`.poster-stage-primary`、`.poster-primary-action`、`.poster-state-card-warn`、`.poster-return-card`。
- 推荐复测邀请预览：`/pages/share-preview/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T&briefId=brief-1781584503870-25d5edac`，selector：`.share-fusion-summary`。
- 推荐复测简报入口：`/pages/session-brief/index?sessionId=session-1781584503517-c033e9&briefId=brief-1781584503870-25d5edac`，selector：`.brief-share-flow-entry`。
- 接口 3.28 已说明当前非样本成员 storage 会导致 `not session member`；测试需先注入 host/member storage/token 后再判断 ready task 和 `readyShareImageUrl`。

#### 14.33.4 验证

- 待执行：`npm.cmd run typecheck`。
- 待执行：`npm.cmd run check:encoding`。
- 待执行：目标 `git diff --check`。

### 14.34 `PR-FE-SHARE-FLOW-COMPACT-REBASE-021` 分享页短屏海报舞台重做

状态：源码已按 PM 退回意见压缩 `share-poster` 结构 / 待测试预览框复拍 / 待 UI/UX 视觉复核。记录时间：2026-06-17。本节只改前端源码和前端计划，不改 PM 总台账、团队公告、派发队列、测试/UIUX/UGC 文档。

#### 14.34.1 退回原因与结构压缩证据

- 用户差评原文需落实：所有页面背景图、光效、排版都没按设计图还原；分享页又臭又长。
- PM 退回记录：020 版本 `share-poster` WXML 207 行、LESS 1539 行，入口/预览/保存/状态/回流四段大卡顺序堆叠。
- 021 当前结构：`share-poster` WXML 157 行，LESS 1523 行；WXML 主大卡从 4 段顺序堆叠压成 1 个 `.poster-stage-card.poster-share021-hero` 短屏海报舞台。
- 保留 QA selector：`.poster-stage-primary`、`.poster-primary-action`、`.poster-state-card-warn`、`.poster-return-card`；`share-preview` 保留 `.share-fusion-summary`；`session-brief` 保留 `.brief-share-flow-entry`。

#### 14.34.2 源码影响文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/share-poster/index.wxml` | 删除 020 的入口/预览/保存/回流四段大卡顺序堆叠；改为单屏 `.poster-share021-hero`，首屏内同时承载背景光效、照片墙、聚会账本、关键事件、保存/分享主动作、状态 dock 和回流入口。 |
| `miniprogram/pages/share-poster/index.less` | 删除已退回的 020 长覆盖样式和未使用的旧任务卡/预览大卡壳；新增 021 紧凑海报舞台、照片墙、账本霓虹条、状态横向 dock、回流 footer 样式。 |
| `miniprogram/pages/share-preview/index.wxml` / `.less` | 延续 020 浅色回流目标图结构，保持 `.share-fusion-summary` 与照片+账本+关键事件融合展示；本轮未再扩展成长列表。 |
| `miniprogram/pages/session-brief/index.wxml` / `.less` | 延续 020 分享入口强化，保持 `.brief-share-flow-entry` 并突出拍照记录 + 聚会账本并存。 |
| `miniprogram/assets/party-recorder/share-flow/pr-share020-*.svg` | 继续使用 UI/UX 020 的 6 个 SVG 切图，不引入整张设计 PNG。 |

#### 14.34.3 设计图到结构映射

| 目标图/规格 | 021 实现 |
| --- | --- |
| 015-01 分享入口 | `session-brief .brief-share020-entry` 和 `share-poster .poster-share021-hero` 顶部品牌 + 标题 + 双流信息。 |
| 015-02 分享预览融合 | `share-poster .poster-share021-body` 左侧照片墙、右侧账本霓虹条，首屏内并存，不再放到第二张大卡。 |
| 015-03 竖版保存海报 | `share-poster .poster-share021-hero` 使用短屏海报舞台承载导出前预览语义；保存按钮保留 `.poster-primary-action`。 |
| 015-04 保存状态 | `share-poster .poster-share021-state-dock` 横向承载成功/失败/重试，`.poster-state-card-warn` 仍可取证。 |
| 015-05 回流查看 | `share-preview .share020-return-card` 作为公开回流页，`share-poster .poster-return-card` 压缩为 hero footer 内入口。 |

#### 14.34.4 页面 data 不破坏说明

- 本轮不改 `services/operations.ts`、不改接口合同、不改 task/brief normalize。
- 继续消费真实 `photoHighlights/accountingHighlights/keyEvents/shareSummary/ledgerIncluded/taskIncludeLedger/taskLayoutMode/readyShareImageUrl/shareTask.status/saveState/errorText`。
- 字段缺失时只展示空态/待联调提示，不伪造照片、账本、ready 图片或成员身份。
- 照片 + 聚会账本继续在 `share-poster` 首屏并存，也继续在 `share-preview .share-fusion-summary` 里共同展示。

#### 14.34.5 全页面视觉偏差清单

| 页面 | 偏差 | 优先级 | 本轮处理 |
| --- | --- | --- | --- |
| 首页 `pages/index` | 仍有旧首页框架和泛功能入口感，背景光效/聚会影像氛围不足。 | P1 | 仅记录，需 UI/UX 021 全局视觉标准后再改。 |
| 创建页 `pages/create-session` | 主题卡/创建 CTA 已局部修过，但整体背景图、灯光、三步创建排版仍未按新目标图系统化。 | P1 | 仅记录，不扩大到创建流程。 |
| 加人/邀请 `pages/add-players`、`pages/invite-group` | 邀请页仍偏表单/列表，缺聚会感背景和分享入口视觉统一。 | P1 | 仅记录。 |
| 等待/现场记录 `pages/waiting-room`、`pages/live-record` | 现场记录更偏工具页，照片墙与酒桌记账并存的视觉层级不足。 | P0 | 仅记录，需后续专项；本轮不改现场主流程。 |
| 简报 `pages/session-brief` | 分享入口已对齐 020/021，但简报整体仍有旧白卡区块。 | P1 | 本轮只改分享入口。 |
| 分享海报 `pages/share-poster` | 020 被退回为长列表；021 已压缩为短屏海报舞台。 | P0 | 本轮已改。 |
| 分享回流 `pages/share-preview` | 已有 020 浅色回流页，但真实照片缺失时视觉冲击仍依赖后端/接口字段。 | P0 | 本轮保留结构，待测试复拍。 |
| 我的/工具 `pages/me`、`pages/tools` | 仍是旧工具/个人中心框架，与聚会记录师视觉体系断裂。 | P2 | 仅记录，不在分享 P0 内扩改。 |

#### 14.34.6 仍需 UI/UX/测试补齐

- UI/UX：如要继续追求“酷炫分享页”，需要补 021 专用背景光效层、真实聚会桌面/照片墙背景图、保存海报二维码安全区小组件、更明确的状态图标/动效规格；当前 020 只有 6 个 SVG 装饰和规格，不足以完全替代整页视觉资产。
- 测试：需用 3.28 的 host/member storage 前置复测 ready dual_flow，确认首屏能同时看到照片高光、聚会账本高光、保存/分享主动作、背景光效；测试通过结论只能由测试线程写。
- 接口：若 `photoHighlights=[]` 或 `readyShareImageUrl=""`，前端只能显示真实空态，仍需接口/后端确认样本成员权限和字段返回。

#### 14.34.7 验证

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- 目标 `git diff --check -- miniprogram/pages/share-poster/index.wxml miniprogram/pages/share-poster/index.less miniprogram/pages/share-preview/index.wxml miniprogram/pages/share-preview/index.less miniprogram/pages/session-brief/index.wxml miniprogram/pages/session-brief/index.less docs/gameplay-moments-frontend-development-plan.md`：通过；仅有 LF/CRLF 提示。
- PM DevTools `relaunch` / `status` 当前均 124 秒超时，前端 021 只能标“源码静态通过 / 预览取证待测试恢复”，不得写预览通过。

### 14.35 `PR-FE-SHARE-FLOW-FIRST-SCREEN-022` 分享页首屏可见性修复

状态：源码已按 PM 右侧预览截图修复首屏构图 / 待测试 DevTools 右侧预览框复拍 / 待 UI/UX 视觉复核。记录时间：2026-06-17。本节只改前端源码和前端计划，不改 PM 总台账、团队公告、派发队列、测试/UIUX/UGC 文档。

#### 14.35.1 截图证据与退回原因

- PM 右侧预览截图：`docs/runtime/wechat-devtools-preview.png`。
- 退回原因：021 画面首屏被两个超大贴纸/星芒占据，核心内容被挤到下方；照片高光、聚会账本/酒桌记账高光、保存/分享主动作没有在 812 高度首屏同时清晰出现。
- 结论：021 不进入 QA/UIUX 接收，022 以首屏可见性为准，不再用删行数作为质量证明。

#### 14.35.2 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/share-poster/index.less` | 补 022 首屏覆盖规则：贴纸从默认大图压成边角小装饰，限制星芒/闪光/胶带尺寸；压缩标题、照片墙、账本区、摘要、事件、按钮、状态 dock 的垂直节奏；状态卡改三列紧凑入口，确保 `.poster-state-card-warn` 首屏可见。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 新增 14.35，记录截图证据、退回原因、结构映射、data 不破坏说明、验证与待补资产。 |

#### 14.35.3 首屏四要素对应结构

| 首屏必须露出 | 对应结构 / selector |
| --- | --- |
| 标题 | `.poster-share021-hero .poster-hero-title`，压缩字号与上间距，避免被贴纸挤下去。 |
| 照片高光区 | `.poster-share021-photo-wall`，保留真实 `photoHighlights[]` 拍立得墙；缺字段时显示真实空态和拍照入口。 |
| 聚会账本/酒桌记账高光区 | `.poster-share021-ledger` + `.poster-metric-strip`，继续消费真实 `accountingHighlights`，与照片同级双列展示。 |
| 保存/分享主按钮 | `.poster-stage-primary` 与 `.poster-primary-action`，位于首屏下半部，不依赖下滑。 |
| 状态/失败提示入口 | `.poster-share021-state-dock .poster-state-list` 三列展示，保留 `.poster-state-card-warn`。 |

#### 14.35.4 data 与 selector 不破坏说明

- 不改 `services/operations.ts`，不改接口合同，不改 task/brief normalize，不造照片、账本、ready 图或成员身份。
- 继续消费真实 `photoHighlights/accountingHighlights/keyEvents/shareSummary/ledgerIncluded/taskIncludeLedger/taskLayoutMode/readyShareImageUrl/shareTask.status/saveState/errorText`。
- 保留 QA selector：`.brief-share-flow-entry`、`.poster-stage-primary`、`.poster-primary-action`、`.poster-state-card-warn`、`.poster-return-card`、`.share-fusion-summary`。
- 本轮只修 `share-poster` 首屏构图；`share-preview/session-brief` 沿用 020/021 已接入结构，待 UI/UX 后续全局视觉复核。

#### 14.35.5 仍需 UI/UX 补资产项

- 022 仍缺专用分享页背景光效分层图，当前只能用 CSS 径向光 + 现有背景图。
- 仍缺照片墙专用真实纹理/胶片边框、账本霓虹条细节图、保存状态小图标组、二维码安全区组件规格。
- 如要达到“酷炫分享页”目标，UI/UX 需补一张 812 高度首屏构图基准图，明确贴纸最大占比、按钮可见区域和账本/照片模块比例。

#### 14.35.6 复测路径

- `/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452`
- 预期首屏 data keys：`photoHighlights,accountingHighlights,keyEvents,shareSummary,ledgerIncluded,taskLayoutMode,readyShareImageUrl,shareTask.status,saveState,errorText`。
- 预期首屏 selector：`.poster-stage-primary`、`.poster-primary-action`、`.poster-state-card-warn`、`.poster-return-card`。

#### 14.35.7 验证

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- 目标 `git diff --check -- miniprogram/pages/share-poster/index.less docs/gameplay-moments-frontend-development-plan.md`：通过；仅有 LF/CRLF 提示。

### 14.36 `PR-FE-SHARE-FLOW-CONSOLE-CLEANUP-023` 分享页 Console 清理

状态：源码已修前端可控 console 警告 / 待测试 DevTools 右侧预览框复拍 Console。记录时间：2026-06-17。本节只改前端源码和前端计划，不改 PM 总台账、团队公告、派发队列、测试/UIUX/UGC 文档。

#### 14.36.1 QA 022 回包依据

- QA 截图：`docs/runtime/pr-qa-share-flow-first-screen-022-retest-window-foreground-20260617.png`。
- QA 确认：022 首屏已刷新到 ready dual_flow，贴纸缩小为边角装饰，照片高光、聚会账本/酒桌记账高光、保存/分享主按钮、状态入口同屏可见。
- 仍需前端处理：Console 仍有 `showLoading 与 hideLoading 必须配对使用 index.ts:793`，以及 navigation-bar selector warning、canvas 2d 接口 warning。

#### 14.36.2 修复点

| 文件 | 修复 |
| --- | --- |
| `miniprogram/pages/share-poster/index.ts` | `handleTaskPrimaryTap` 改为 ready 保存路径不再额外挂外层 `wx.showLoading`；failed/expired retry 与 catch 错误提示改为先 `wx.hideLoading()` 后 `showPreviewToast()`。`onLoad` catch 同步改为先记录 toast 文案，finally 中 hideLoading 后再 toast，避免同类配对 warning。 |
| `miniprogram/components/navigation-bar/navigation-bar.less` | 将组件 WXSS 中 `.weui-navigation-bar .android` 改为 `.weui-navigation-bar__inner.android`，避免组件样式内不允许的 descendant selector warning。 |

#### 14.36.3 未修 warning 分类

| Warning | 来源 | 本轮处理 | 是否影响分享保存 |
| --- | --- | --- | --- |
| `canvas 2d 接口支持同层渲染性能更佳` | `share-poster/share-preview` 仍使用 `canvas-id`、`wx.createCanvasContext`、`wx.canvasToTempFilePath` 旧 canvas 导出链路。 | 本轮不迁移，记录为低优先级性能/兼容提示；迁移到 2D canvas 需要重写绘制和导出，不适合在 console cleanup 中改保存链路。 | 不阻塞当前保存/分享流程；如后续 UI/UX 要重做保存海报导出质量，可另开 canvas 2D 迁移任务。 |

#### 14.36.4 data 与 selector 不破坏说明

- 不改接口合同、不改 task/brief normalize、不造数据。
- 不改 022 已确认的首屏布局，不扩大分享页结构。
- 保留 QA selector：`.brief-share-flow-entry`、`.poster-stage-primary`、`.poster-primary-action`、`.poster-state-card-warn`、`.poster-return-card`、`.share-fusion-summary`。
- 页面 data 仍沿用 `photoHighlights/accountingHighlights/keyEvents/shareSummary/ledgerIncluded/taskLayoutMode/readyShareImageUrl/shareTask.status/saveState/errorText`。

#### 14.36.5 复测路径与 Console 预期

- `/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452`
- 复测操作：ready dual_flow 首屏点击 `.poster-stage-primary` / `.poster-primary-action`；failed/expired 分支点击 `.poster-state-card-warn` 内重试。
- Console 预期：不再出现 `showLoading 与 hideLoading 必须配对使用 index.ts:793`；navigation-bar selector warning 应消失；canvas 2d 性能提示可能仍存在，按 14.36.3 记录为非阻塞。

#### 14.36.6 验证

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- 目标 `git diff --check -- miniprogram/pages/share-poster/index.ts miniprogram/components/navigation-bar/navigation-bar.less docs/gameplay-moments-frontend-development-plan.md`：通过；仅有 LF/CRLF 提示。

### 14.37 `PR-FE-SHARE-FLOW-CONSOLE-AND-FIELDS-024` Console 与回流字段修复

状态：源码已修 navigation-bar 可视 selector warning 与 `share-preview` brief 字段消费 / 待测试 DevTools 右侧预览框复拍 Console 与 page data。记录时间：2026-06-17。本节只改前端源码和前端计划，不改 PM 总台账、团队公告、派发队列、测试/UIUX/UGC/接口文档。

#### 14.37.1 Console 退回证据

- 测试 `PR-QA-SHARE-FLOW-CONSOLE-CLEANUP-023-RETEST`：ready dual_flow 页面打开和保存点击均成功，automator `console=[]`，保存后 `saveState=saved`。
- 可视调试器仍显示约 5 error / 120 warning；navigation-bar selector warning 原文仍可见：`./components/navigation-bar/navigation-bar.wxss:6 7:30`。
- `showLoading/hideLoading` 本轮可见区域未复现；canvas 2d 性能提示按 14.36 继续非阻塞分类。

#### 14.37.2 字段来源与本轮修复

| 字段 | 来源 | 本轮处理 |
| --- | --- | --- |
| `photoHighlights` | 成员态 `GET /session-briefs/<briefId>` 的 `timeline.nodes`，沿 `share-poster` 同类公开照片规则过滤：完成、审核通过、未二审拒绝、允许分享、非私密/指定可见、有 `imageUrl`，并排除 `shareContentFilter.filteredNodeIds`。 | `share-preview` 在 URL 带 `briefId` 且 brief 可读时推导照片高光；live session 后续 setData 不再清空 brief 推导结果。 |
| `shareContentFilter.filteredNodeIds` | 成员态 brief 的 `shareContentFilter.filteredNodeIds`。 | 新增 page data：`filteredNodeIds`，并保留原始 `shareContentFilter`。 |
| `visibleNodes` / 等效字段 | 后端 3.30 已说明 `visibleNodes` 不是接口字段。 | 前端新增等效 page data：`visibleNodeIds`，由 `brief.timeline.nodes[].id` 排除 `filteredNodeIds` 推导；不伪造完整 node 对象。 |
| `permissionState` | 后端 3.30 已说明 `permissionState` 不是 live/session-brief 固定字段。 | 新增 page data：`permissionState`；仅在 `shareContentFilter.permissionState/permission/visibilityScope` 存在时透传，否则为空字符串并保留缺口提示。 |

#### 14.37.3 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/components/navigation-bar/navigation-bar.less` | 删除组件 WXSS line 6 的组合 selector；Android/胶囊高度继续由 `navigation-bar.ts` 的 `safeAreaTop` 内联变量设置，避免再触发 `./components/navigation-bar/navigation-bar.wxss:6 7:30`。 |
| `miniprogram/pages/share-preview/index.ts` | 新增 `filteredNodeIds/visibleNodeIds/permissionState` page data；`loadBriefContract()` 改为返回字段包；`loadInviteSession()` 合并 brief 字段与 live session 账本，不再让公开 live 接口覆盖成员态 brief 推导的照片高光。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 新增 14.37，记录 Console 退回证据、字段来源、data 不破坏说明、复测路径和 API 依赖。 |

#### 14.37.4 data 不破坏说明

- 不改接口合同、不改 normalize、不造数据；`visibleNodeIds` 是前端对 brief timeline 的 ID 级等效推导，不冒充后端 `visibleNodes` 字段。
- 公开 `GET /sessions/live?...inviteCode=W58G7T` 不返回 `photoHighlights/shareContentFilter/eventHighlights` 时，`share-preview` 只在成员态 `briefId` 可读时补照片与过滤字段；否则保留缺口提示。
- 保持照片 + 聚会账本 / 酒桌记账并存，不改 022 首屏布局。
- 保留 QA selector：`.brief-share-flow-entry`、`.poster-stage-primary`、`.poster-primary-action`、`.poster-state-card-warn`、`.poster-return-card`、`.share-fusion-summary`。

#### 14.37.5 复测路径与预期

- ready dual_flow：`/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452`
  - Console 预期：不再出现 `showLoading/hideLoading`；不再出现 `./components/navigation-bar/navigation-bar.wxss:6 7:30`；canvas 2d 性能提示可能仍存在且非阻塞。
- 分享回流：`/pages/share-preview/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T&briefId=brief-1781584503870-25d5edac`
  - page data 预期：`photoHighlights` 从 brief timeline 推导；`filteredNodeIds` 来自 `shareContentFilter.filteredNodeIds`；`visibleNodeIds` 为前端等效推导；`permissionState` 若接口未给则为空字符串；`shareContentFilter` 原样保留；`accountingHighlights/keyEvents/shareSummary` 继续存在。

#### 14.37.6 仍需后端/API 配合

- 后端/API 024 若要公开回流页无需成员态也展示照片和过滤字段，仍需在公开 live/share-preview 合同中提供 `photoHighlights/shareContentFilter/eventHighlights` 或明确公开可见字段。
- `permissionState/visibleNodes` 目前不是后端接口字段；前端只暴露空字符串/ID 级等效字段，不应作为后端合同已完成证据。
- UGC 已指出保存 PNG、安全区、局外/未登录、过滤字段页面消费和回流页照片仍不准出；测试通过结论仍由测试线程复拍后写。

#### 14.37.7 验证

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- 目标 `git diff --check -- miniprogram/components/navigation-bar/navigation-bar.less miniprogram/pages/share-preview/index.ts docs/gameplay-moments-frontend-development-plan.md`：通过；仅有 LF/CRLF 提示。

### 14.38 `PR-FE-SHARE-FLOW-FULL-PAGE-VISUAL-025` 全分享流程视觉补齐

状态：源码已按 UI/UX 12.7.22 补全页面视觉节奏 / 待测试截图、PNG 原图、Console/Network 复核 / 不写 UI/UX 通过或上线通过。记录时间：2026-06-17。本节只改前端源码和前端计划，不改 PM 总台账、测试计划、UI/UX 计划、后端/API、UGC、接口联调或运维文档。

#### 14.38.1 对应 UI/UX 退回码与改法

| UI/UX 退回码 | 本轮改法 | 涉及文件 |
| --- | --- | --- |
| `PR-FE-SHARE024-P1-BRIEF-ENTRY-DENSITY` | `session-brief` 分享入口继续同屏展示“拍照记录 + 聚会账本/酒桌记账”，缩小贴纸和入口厚度，按钮保持 `.brief-share-flow-entry` 内清晰可点。 | `miniprogram/pages/session-brief/index.less` |
| `PR-FE-SHARE024-P1-EVENT-STRIP-OVERFLOW` | `share-poster` 事件区固定为横向短卡，时间短宽度，标题 1 行、meta 2 行，`word-break` 防止长 ID/长文案竖排，避免右侧裁切。 | `miniprogram/pages/share-poster/index.less` |
| `PR-FE-SHARE024-P0-SAVE-PNG-SAFE-AREA-MISSING` | ready task 优先下载并保存 `readyShareImageUrl` 的后端 PNG，不再优先走本地旧 canvas；本地 fallback canvas 维持 900x1600 近似 9:16，并扩大底部浅色安全区、QR 约 208px、房间码 66px、隐私提示距底部约 82px。 | `miniprogram/pages/share-poster/index.ts` |
| `PR-FE-SHARE024-P1-STATE-RETRY-EVIDENCE` | 保存状态 dock 三态并列可见；成功/失败/重试 active 态有语义色边框，`.poster-state-card-warn`、重试按钮保持可见可点，不挤压主海报。 | `miniprogram/pages/share-poster/index.less` |
| `PR-FE-SHARE024-P0-RETURN-PHOTO-VISIBILITY-MISSING` | `share-preview` 回流页渲染真实 `photoHighlights[].imageUrl`，并继续展示账本摘要、关键事件、聚会总结、`filteredNodeIds/visibleNodeIds/permissionState` 可见范围提示。 | `miniprogram/pages/share-preview/index.wxml`、`miniprogram/pages/share-preview/index.less` |
| `PR-FE-SHARE024-P1-OLD-SHELL-OR-LONG-PAGE` | `share-preview` 缩短浅色回流页节奏：标题、照片墙、口令安全区、融合摘要、范围提示紧凑排布；`share-poster` 保留 022 短屏舞台，不恢复旧白卡/连续堆叠。 | `miniprogram/pages/share-preview/index.less`、`miniprogram/pages/share-poster/index.less` |

#### 14.38.2 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/session-brief/index.less` | 分享入口缩小贴纸/厚度，保留双流卡和主按钮，避免旧厚卡感。 |
| `miniprogram/pages/share-poster/index.ts` | 保存图优先使用 ready task PNG；canvas fallback 重排为 9:16 安全区，放大 QR/房间码并预留底部隐私提示。 |
| `miniprogram/pages/share-poster/index.less` | 事件区、状态区、footer 回流入口加 025 覆盖：横向短卡、文本截断、状态 active 语义色、按钮可达。 |
| `miniprogram/pages/share-preview/index.wxml` | 回流照片墙补真实图片渲染；新增可见范围 / 过滤节点 / 可见节点提示条。 |
| `miniprogram/pages/share-preview/index.less` | 回流页短屏节奏、真实照片拍立得、融合摘要双列证据块、范围提示条。 |

#### 14.38.3 数据结构不破坏说明

- 不改后端字段名、不改接口合同、不造数据；ready PNG 只消费已有 `readyShareImageUrl`。
- 保留 QA/UGC 需要的 data：`ledgerIncluded/layoutMode/taskLayoutMode/photoHighlights/accountingHighlights/keyEvents/shareContentFilter/filteredNodeIds/visibleNodeIds/permissionState/readyShareImageUrl/posterImagePath/saveState/errorText`。
- `share-preview` 的 `visibleNodeIds` 仍是前端 ID 级等效推导，不冒充后端完整 `visibleNodes` 字段；后端/API 024 正式公开合同补齐后可自然替换公开字段来源。
- 保留 QA selectors：`.brief-share-flow-entry`、`.poster-stage-primary`、`.poster-primary-action`、`.poster-state-card-warn`、`.poster-share021-event-strip`、`.poster-return-card`、`.share-fusion-summary`。

#### 14.38.4 待测试 query / selector / data

| 覆盖点 | 路径 / query | selector / data |
| --- | --- | --- |
| 分享入口 | `/pages/session-brief/index?sessionId=session-1781584503517-c033e9&briefId=brief-1781584503870-25d5edac` | `.brief-share-flow-entry`；`shareTask,photoHighlights,accountingHighlights,keyEvents,shareSummary` |
| ready 海报全页面 | `/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452` | `.poster-stage-primary,.poster-primary-action,.poster-share021-event-strip,.poster-return-card`；`ledgerIncluded,taskLayoutMode,readyShareImageUrl,posterImagePath,saveState,photoHighlights,accountingHighlights,keyEvents` |
| failed / retry | `/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781584504132-3251bd01` | `.poster-state-card-warn`；`saveState,errorText,shareTask,taskPrimaryLabel` |
| 回流页 | `/pages/share-preview/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T&briefId=brief-1781584503870-25d5edac` | `.share-fusion-summary`；`photoHighlights,accountingHighlights,keyEvents,shareSummary,shareContentFilter,filteredNodeIds,visibleNodeIds,permissionState` |
| PNG 原图 / 安全区 | ready 路径点击保存后取 `posterImagePath` 或 `readyShareImageUrl` | 需要测试记录 PNG 原图、尺寸/文件大小、QR/房间码安全区、Console/Network/storage 摘要。 |

#### 14.38.5 仍需测试 / UIUX / 接口补证据

- 测试：需补全页面滚动截图、ready PNG 原图、保存成功/失败/重试、Console/Network/storage；不得把本轮静态验证写成测试通过。
- UI/UX：需基于 025 后的新截图复核全页面、保存图、回流页、失败态、长度和安全区；不得写上线通过。
- 后端/API：公开 live/share-preview 合同仍待 024 正式补 `photoHighlights/shareContentFilter/eventHighlights/permissionState`；前端当前成员态 brief 兜底不能替代公开合同准出。
- UGC：仍需公开/私密照片、账本条目、关键事件过滤反例和局外/未登录可见范围证据。

#### 14.38.6 验证

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- 目标 `git diff --check -- miniprogram/pages/session-brief/index.less miniprogram/pages/share-poster/index.ts miniprogram/pages/share-poster/index.less miniprogram/pages/share-preview/index.wxml miniprogram/pages/share-preview/index.less docs/gameplay-moments-frontend-development-plan.md`：通过；仅有 LF/CRLF 提示。

### 14.39 `PR-FE-SHARE-FLOW-DATA-BOUNDARY-COPY-026` 分享流用户文案边界修补

状态：源码已修补用户可见 raw data / 工程话术外露风险，page data 字段保留 / 待测试复拍 Console、页面截图和 data 摘要 / 不写测试通过、UI/UX 通过或上线通过。记录时间：2026-06-17。本节只改前端源码和前端计划，不改 PM 总台账、测试计划、UI/UX 计划、后端/API、UGC、接口联调或运维文档。

#### 14.39.1 扫描到的外露风险

| 页面 / 组件 | 风险 | 修补口径 |
| --- | --- | --- |
| `share-preview` | `photoHighlightsNotice` 和 `shareSummary` 曾包含 brief/live/字段接入/审核范围等工程话术。 | 改为普通用户文案：已同步可分享照片、暂无照片引导记录、照片和账本高光会汇总。 |
| `share-preview` | WXML 曾直接展示 `permissionState`、过滤节点数、可见节点数。 | WXML 不再展示 raw 状态和节点数量，改为“仅展示可分享内容”“私密和待审内容不会进入分享”“照片与聚会账本”。 |
| `share-poster` | footer 曾展示 `公开范围：{{permissionState}}`，失败态可能展示接口原文。 | footer 改为“公开内容已过滤”；错误进入 `toSafeShareErrorText` 映射后再进入可见 `errorText`。 |
| `share-task-status` | 组件曾直接展示 `task.failedReason` / `failedReason`。 | 新增 `toSafeFailedReason`，权限失败、空分享任务、网络/超时等映射为用户文案。 |

#### 14.39.2 可见文案替换表

| raw / 工程语义 | 用户可见文案 |
| --- | --- |
| `permissionState=public` / raw permission | `公开内容已过滤` 或 `仅展示可分享内容` |
| `filteredNodeIds` / `visibleNodeIds` / 节点数量 | `私密和待审内容不会进入分享` |
| 照片接口/brief/live 未返回或字段接入中 | `暂无可展示照片，先去记录一张聚会照片` |
| `not session member` / 401 / 403 / unauthorized | `当前账号暂不能查看这张分享页，请使用邀请入口加入聚会` |
| `share task has no visible nodes` | `这张分享图还没有可展示内容` |
| 其他未知接口错误原文 | `分享图暂时无法展示，请稍后重试` |

#### 14.39.3 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/share-preview/index.ts` | `photoHighlightsNotice`、空态和 `shareSummary` 去除 brief/live/字段接入话术；保留 `permissionState/filteredNodeIds/visibleNodeIds/shareContentFilter` page data。 |
| `miniprogram/pages/share-preview/index.wxml` | 范围提示条不再展示 raw permission 和节点数量；保留 `.share-fusion-summary` 和照片/账本/关键事件结构。 |
| `miniprogram/pages/share-preview/index.less` | 范围提示条改为单列可换行，避免用户文案被数字样式截断。 |
| `miniprogram/pages/share-poster/index.ts` | `LEDGER_CONTRACT_NOTICE` 改为用户文案；新增 `toSafeShareErrorText`，任务读取、简报读取、重试、保存失败等可见错误统一映射。 |
| `miniprogram/pages/share-poster/index.wxml` | `.poster-return-card` 内不再展示 `permissionState` raw 值，改为“公开内容已过滤”。 |
| `miniprogram/components/share-task-status/share-task-status.ts` | `displayFailedReason` 由 `toSafeFailedReason` 输出，避免组件直接渲染接口失败原文。 |

#### 14.39.4 Data 保留说明

- 不删除、不改名、不伪造 QA/UGC 需要的 page data：`permissionState/filteredNodeIds/visibleNodeIds/shareContentFilter/photoHighlights/accountingHighlights/keyEvents/ledgerIncluded/layoutMode/taskLayoutMode/readyShareImageUrl/saveState/errorText`。
- `share-preview` 仍从成员态 brief 合同推导可分享照片，`filteredNodeIds/visibleNodeIds/permissionState` 继续留在 data 供测试/UGC 检查；普通用户界面只看分享范围说明。
- `share-poster` 的 `shareTask` 结构保留，失败态可见文案已映射；不扩大保存链路、不改接口合同、不新增 mock 数据。

#### 14.39.5 待测试 query / selector / data

| 覆盖点 | 路径 / query | selector / data |
| --- | --- | --- |
| 回流页文案边界 | `/pages/share-preview/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T&briefId=brief-1781584503870-25d5edac` | `.share-fusion-summary`；确认页面不显示 raw `permissionState`、节点数量、brief/live/字段接入话术；data 仍有 `permissionState,filteredNodeIds,visibleNodeIds,shareContentFilter,photoHighlights,accountingHighlights,keyEvents`。 |
| ready 海报 | `/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452` | `.poster-stage-primary,.poster-primary-action,.poster-return-card`；确认 footer 显示“公开内容已过滤”，data 仍有 `permissionState,shareTask,readyShareImageUrl,saveState`。 |
| failed / retry | `/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781584504132-3251bd01` | `.poster-state-card-warn`；确认失败文案不出现接口原文或 raw task reason，重试按钮可见。 |
| 组件状态 | 含 `<share-task-status>` 的分享任务入口页 | 确认组件描述不展示 raw `failedReason`，仍可触发 preview/retry 事件。 |

#### 14.39.6 验证

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- 目标 `git diff --check -- miniprogram/pages/share-preview/index.ts miniprogram/pages/share-preview/index.wxml miniprogram/pages/share-preview/index.less miniprogram/pages/share-poster/index.ts miniprogram/pages/share-poster/index.wxml miniprogram/components/share-task-status/share-task-status.ts docs/gameplay-moments-frontend-development-plan.md`：通过；仅有 LF/CRLF 提示。
- 因工作区存在未跟踪文件，补充对同一目标文件跑 `git diff --no-index --check`：通过；仅有 LF/CRLF 提示。

### 14.40 `PR-FE-SHARE-PREVIEW-P0-UNREADABLE-027` 分享预览图首屏可读性 P0 修复

状态：源码已修复用户截图退回的 `share-poster` 首屏不可读问题 / 待测试用微信开发者工具右侧预览框复拍 390x844 截图 / 不写测试通过、UI/UX 通过或上线通过。记录时间：2026-06-17。本节只改前端源码和前端计划，不改 PM 总台账、测试计划、UI/UX 计划、后端/API、UGC、接口联调或运维文档。

#### 14.40.1 用户截图退回点

| 退回点 | 本轮处理 |
| --- | --- |
| 顶部出现英文/raw `dual_flow` | `share-poster` 使用 `displayTaskStatus/displayTaskLayoutMode` 中文展示，WXML 不再直接展示 raw `taskLayoutMode`；ready 场景显示“可保存 · 照片和账本”。 |
| 副标题仍像旧“酒局时间线简报” | 标题改为“聚会分享预览”，副标题改为“照片记录和聚会账本一起保存”。 |
| 无照片时两个大白块占高 | 无照片空态压缩为一行轻提示“暂无可展示照片 / 去拍第一张”；有照片时继续展示真实 `photoHighlights.imageUrl` 缩略图。 |
| 中部空白导致账本被推底 | 首屏改为单列短屏节奏：照片区、账本双列指标、摘要、时间线、保存动作连续排列。 |
| 时间线和底部提示被截断 | 时间线区限制为 1-2 条紧凑行，状态 dock 和 footer 安全提示压缩为首屏内可见。 |

#### 14.40.2 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/share-poster/index.wxml` | 顶部 meta、标题、副标题、照片空态改为面向用户的中文；继续保留 `.poster-stage-primary`、`.poster-primary-action`、`.poster-share021-event-strip`、`.poster-state-card-warn`、`.poster-return-card`。 |
| `miniprogram/pages/share-poster/index.less` | 新增 027 末尾覆盖：贴纸缩到边角弱装饰；无图空态 48px；照片缩略图、账本、摘要、时间线、保存按钮、状态 dock、隐私提示全部压缩到 390x844 可读首屏。 |
| `miniprogram/pages/share-poster/index.ts` | 沿用 026 已补的 `displayTaskStatus/displayTaskLayoutMode` 中文映射；本轮不改接口合同、不改保存链路、不造数据。 |

#### 14.40.3 Data 不破坏说明

- 不删除、不改名、不伪造 QA/UGC 需要的 page data：`shareTask/taskLayoutMode/ledgerIncluded/readyShareImageUrl/photoHighlights/accountingHighlights/keyEvents/shareContentFilter/filteredNodeIds/visibleNodeIds/permissionState/saveState/errorText`。
- 照片区仍只消费真实 `photoHighlights.imageUrl`；无照片时只显示用户空态，不造假缩略图。
- 聚会账本仍消费真实 `accountingHighlights` / 016 brief 字段或既有真实聚合；空账本时保留空态，不伪造账本数字。
- 保存图优先使用 025 的 ready PNG 路径，未新增 DevTools 专用保存分支，未迁移 canvas。

#### 14.40.4 待测试 query / selector / data

| 覆盖点 | 路径 / query | selector / data |
| --- | --- | --- |
| ready dual_flow 首屏复拍 | `/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452` | `.poster-stage-primary,.poster-primary-action,.poster-share021-event-strip,.poster-return-card`；预期 390x844 内可见标题、照片/空态、聚会账本、1-2 条时间线、保存按钮、隐私提示；data 取 `displayTaskStatus,displayTaskLayoutMode,photoHighlights,accountingHighlights,keyEvents,saveState,readyShareImageUrl`。 |
| failed / retry | `/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781584504132-3251bd01` | `.poster-state-card-warn,.poster-primary-action`；确认失败态仍可见、重试可点，错误文案不出现 raw 接口原文。 |
| 无照片空态 | 同 ready 路径或后端返回 `photoHighlights=[]` 的样本 | 确认照片区显示一行轻空态，不出现两个大白块或 200px+ 空洞。 |

#### 14.40.5 验证

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- 目标 `git diff --check -- miniprogram/pages/share-poster/index.ts miniprogram/pages/share-poster/index.wxml miniprogram/pages/share-poster/index.less docs/gameplay-moments-frontend-development-plan.md`：通过；仅有 LF/CRLF 提示。
- 本轮未跑微信开发者工具截图；需测试 027 用右侧预览框复拍用户截图同路径，重点确认 390x844 首屏不再截断。

### 14.41 首页相册 / 简报卡片内部字段可读性修补

状态：源码已修复用户截图中 `IT-MOMENTS-20260616-006B opening`、`PR Seed Host` 一类内部标题/测试发起人名外露风险 / 待测试在首页最近相册和简报卡片复拍 / 不改接口合同、不造数据。记录时间：2026-06-17。本节只改前端源码和前端计划。

#### 14.41.1 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/index/index.ts` | 首页最近相册新增展示层标题清洗：`IT/PR/QA/DEV/TEST` 种子标题按节点类型转成“开场照片 / 聚会照片 / 聚会账本 / 收尾照片 / 私密记录”，测试发起人名不作为用户可见标题。 |
| `miniprogram/components/session-moment-summary/session-moment-summary.ts` | 简报卡片同步标题清洗，默认副标题改为“继续补齐聚会照片和账本”，避免继续显示内部 seed/profile 文案。 |

#### 14.41.2 Data 不破坏说明

- 不修改 `getManagedSessionMomentSummaries()` 返回结构，不改 `title/sessionName/sessionId/briefId` 合同字段。
- 清洗只发生在首页最近相册和简报组件的用户展示字段；原始数据仍保留在服务层，便于测试/接口定位。

#### 14.41.3 待测试 query / selector / data

| 覆盖点 | 路径 / query | selector / data |
| --- | --- | --- |
| 首页最近相册 | `/pages/index/index` | 确认 `.home-album-label` 不显示 `IT-MOMENTS`、`opening`、`PR Seed Host`，应显示“开场照片”等中文标题。 |
| 简报卡片 | 含 `<session-moment-summary>` 的历史/简报入口页 | 确认卡片标题不展示内部任务编号或英文节点类型，副标题为用户能理解的聚会照片/账本口径。 |

### 14.42 分享成品图内部字段可读性修补

状态：源码已修复用户截图中 ready 成品图/保存图可能展示 `dual_flow`、`IT-MOMENTS ... opening`、`PR Seed Host`、旧“酒局时间线简报”等内部或旧口径文案的前端侧风险 / 待测试重新保存分享图和复拍 PNG 原图 / 不改接口合同、不造数据。记录时间：2026-06-17。本节只改前端源码和前端计划。

#### 14.42.1 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/share-poster/index.ts` | 新增分享图展示文本清洗：照片标题、上传人、关键事件标题/说明中的 `IT/PR/QA/DEV/TEST` 内部编号、`opening/highlight/closing` 英文字段、`PR Seed Host` 测试名统一转为“开场照片 / 聚会照片 / 收尾照片 / 聚会账本记录”等用户文案。 |
| `miniprogram/pages/share-poster/index.ts` | 保存图构建时，若已有 `readyShareImageUrl`，仍保留该字段供测试/API 定位，但保存文件改为前端清洗后的 canvas 图，避免继续保存后端旧 PNG 中的 raw 文案。 |

#### 14.42.2 Data 不破坏说明

- 不删除 `readyShareImageUrl/shareTask/taskLayoutMode/photoHighlights/accountingHighlights/keyEvents` 等 data 字段。
- 不改 `createManagedShareImageTask`、`getManagedShareImageTask` 接口合同；`layoutMode=dual_flow` 仍作为请求/任务字段存在，但不作为用户可见文案。
- 若后端/API 后续重新生成的 ready PNG 已完成文案净化，前端仍可通过 `readyShareImageUrl` 做接口验证；本轮只是避免用户保存旧 PNG 文案。

#### 14.42.3 待测试 query / selector / data

| 覆盖点 | 路径 / query | selector / data |
| --- | --- | --- |
| ready 保存图复拍 | `/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452` | 点击 `.poster-primary-action` 后取保存 PNG；确认图内不显示 `dual_flow`、`IT-MOMENTS`、`opening`、`PR Seed Host`、`酒局时间线简报`。 |
| 页面 data | 同 ready 路径 | data 仍保留 `readyShareImageUrl,shareTask,taskLayoutMode,photoHighlights,keyEvents`；可见 WXML 使用中文 `displayTaskLayoutMode/displayTaskStatus`。 |

### 14.43 `PR-FE-SHARE-GENERATED-IMAGE-UI-MISMATCH-028` 实际保存/分享生图 P0 修复

状态：源码已改实际生成图路径，不再把旧 backend ready PNG 当最终保存图 / DevTools 自动化保存点击本轮 64 秒超时，未取得 PNG 原图截图 / 待测试恢复右侧预览框后复拍 `posterImagePath`、保存 PNG 原图、Console/Network。记录时间：2026-06-17。本节只改前端源码和前端计划，不改 PM/测试/UIUX/后端/API/UGC 文档，不改接口合同，不造数据。

#### 14.43.1 退回问题与修复

| 028 退回点 | 前端修复 |
| --- | --- |
| 实际保存/分享图仍是旧红色战报壳 | `drawCanvasToFile()` 重做为 015/020 暗色酒桌海报：背景光效、标题、照片墙、聚会账本、时间线、总结纸条、房间码/QR、安全提示分区渲染。 |
| 空白照片洞和大面积留白 | canvas 有真实 `photoHighlights.imageUrl` 时先下载后 `drawImage` 画入照片墙；无真实照片时只画短空态“暂无可展示照片，先去记录一张聚会照片”，不画两个白洞。 |
| 账本下沉、时间线/底部安全区截断 | 生成图使用固定纵向节奏：照片墙在上、账本紧随、时间线最多 3 条、总结/房间码/QR 独立浅色纸条，底部安全提示距底边保留安全区。 |
| 英文 `dual_flow`、内部样本名、旧“酒局”文案 | 照片标题、上传人、关键事件标题/说明统一经过 `cleanShareText/cleanShareEventText`；可见任务状态使用 `displayTaskStatus/displayTaskLayoutMode` 中文。 |
| 旧 backend ready PNG 仍被保存/分享 | `buildPosterImage()` 在存在 `readyShareImageUrl` 时改为生成前端 canvas 图；`onShareAppMessage/onShareTimeline` 不再使用 `readyShareImageUrl` 作为分享图片；`readyShareImageUrl` 仍保留在 data 供 QA/API 定位。 |
| DevTools 保存证据不能是假路径 | DevTools 分支不再写 `devtools-preview-share-poster.png`，改为先 `ensurePosterImage()` 生成真实 canvas 临时文件，再写入 `posterImagePath`。 |

#### 14.43.2 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/share-poster/index.ts` | 重写 `drawCanvasToFile()` 保存图结构；真实照片下载后绘制，空照片用短空态；保存/分享不再引用旧 ready PNG；DevTools 保存分支生成真实 `posterImagePath`。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 新增 14.43 记录 028 修复、验证、未闭环预览取证。 |

#### 14.43.3 Data 不破坏说明

- 不删除、不改名、不伪造 `readyShareImageUrl/shareTask/taskLayoutMode/photoHighlights/accountingHighlights/keyEvents/shareContentFilter/filteredNodeIds/visibleNodeIds/permissionState/saveState/errorText`。
- 真实照片只来自 `photoHighlights.imageUrl`；下载失败的单张照片会退回“聚会照片”占位，不伪造照片内容。
- `readyShareImageUrl` 如果仍指向旧红色 PNG，前端本轮不保存它为最终图；源头旧 PNG 仍需后端/API 028 重新生成或确认。

#### 14.43.4 验证与未闭环证据

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过，`Encoding check passed`。
- 目标 `git diff --check -- miniprogram/pages/share-poster/index.ts docs/gameplay-moments-frontend-development-plan.md`：通过；仅有 LF/CRLF 提示。
- DevTools 自动化尝试：`npm.cmd --% run wechat:auto -- tap --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --selector .poster-primary-action --wait 8000 --data posterImagePath,saveState,readyShareImageUrl,photoHighlights,accountingHighlights,keyEvents,displayTaskLayoutMode,displayTaskStatus --output docs/runtime/pr-fe-share-generated-image-028-save-20260617.png`。
- DevTools 自动化结果：命令 64 秒超时，未生成 `docs/runtime/pr-fe-share-generated-image-028-save-20260617.png`，未取到 `posterImagePath`；本轮只能标源码静态通过 / 预览取证待测试恢复。

#### 14.43.5 待测试 query / selector / data

| 覆盖点 | 路径 / query | selector / data |
| --- | --- | --- |
| 实际生成/保存图 | `/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452` | 点击 `.poster-primary-action`，取 `posterImagePath,saveState,readyShareImageUrl,photoHighlights,accountingHighlights,keyEvents,displayTaskLayoutMode`；预期 `posterImagePath` 为真实临时文件，`saveState=saved` 或保存权限失败态。 |
| PNG 原图 | 同 ready 路径 | 检查导出图包含照片墙/短空态、聚会账本、时间线、总结/房间码/QR/隐私提示；不显示 `dual_flow`、`IT-MOMENTS`、`PR Seed Host`、旧“酒局”文案，不出现两个白色照片洞。 |
| 后端 ready PNG 源头 | 同 ready 路径 | 若 `readyShareImageUrl` 直接预览仍是旧红色战报壳，记录为后端/API 028 需重新生成 ready PNG；前端保存图已绕开旧 PNG。 |

### 14.44 `PR-FE-CLEAN-SLATE-001` 前端 Clean Slate 只读盘点

状态：只读盘点完成 / 待 PM 确认后进入备份、隔离、删除或重写实施 / 不写“清空完成”。记录时间：2026-06-18。本节只更新前端计划，不删除业务源码，不改 `app.json`，不改 PM 总台账、后端接口、测试/UIUX/UGC 文档。

#### 14.44.1 当前 `app.json` 路由对照

| 当前路由 | 污染判断 | Clean Slate 处理建议 |
| --- | --- | --- |
| `pages/index/index` | 新项目首页，但仍跳 `judge/tools/wine-history`。 | 保留，重写路由到新首页/相册/记录/我的，不再使用 `judge` tab。 |
| `pages/create-session/index` | 新三步创建入口，仍可能连旧模板/会员。 | 保留并重写为三步创建基线。 |
| `pages/invite-group/index`、`pages/waiting-room/index` | 邀请/等待链路可复用，但存在 `role=judge` 旧语义。 | 保留工程能力，重写文案与 role 命名。 |
| `pages/moment-editor/index`、`pages/live-record/index` | 拍照/现场记录核心，但仍调用 `table-mode/judge-wheel` 和欠酒文案。 | 保留核心拍照能力，重写现场记录与账本入口，移除旧玩法跳转。 |
| `pages/session-brief/index` | 聚会简报核心，仍含 rankings/欠酒文案。 | 保留并重写为照片+账本简报。 |
| `pages/share-poster/index`、`pages/share-preview/index` | 分享海报/回流核心，但旧 report ready PNG 和欠酒字段仍污染。 | 保留能力，按新视觉和新数据合同重写。 |
| `pages/wine-history/index` | 名称和模式仍是旧相册/酒局历史混合。 | 重命名或重建为 `album`；当前只可临时作为完整相册列表。 |
| `pages/me/index` | 我的页可保留，但仍依赖 `getManagedJudgeStats`、`wine-history`、`judge` tab。 | 保留页面，重写数据源与导航。 |
| `pages/judge/index`、`pages/judge-wheel/index`、`pages/question-bank/index`、`pages/table-mode/index` | 旧玩法主壳、转盘/题库/桌面计酒。 | P0 删除或隔离；需要的账本能力重建为 `ledger`。 |
| `pages/result-report/index` | 旧战报页。 | P0 删除或重建为 `brief/share` 的非旧战报视角。 |
| `pages/wine-points/index`、`premium-templates`、`member-center`、`coupon-center`、`merchant-partners` | 旧商业化/积分/会员入口。 | P1 隔离；新项目首版不作为主链路。 |
| `pages/tools/index`、`tool-detail`、`favorites`、`usage-history` | 旧工具箱外壳，含酒桌判官和工具业务。 | P1 从主包/首页剥离，若保留需做二级工具入口。 |
| `pages/session-rules/index`、`add-players/index`、`flow-overview/index`、`restart-state/index`、`invalid-state/index` | 旧创建/规则/异常页残留，部分有旧词。 | 按新流程重写或删除。 |
| `pages/logs/logs` | 模板示例页。 | P0 删除。 |

#### 14.44.2 Clean App Route Manifest 草案

| 新主链路 | 建议路由 | 来源/处理 |
| --- | --- | --- |
| 首页 | `pages/index/index` | 保留并清理旧 tab、工具、judge 入口。 |
| 三步创建 | `pages/create-session/index` | 保留，删除旧规则/模板阻塞。 |
| 邀请好友 | `pages/invite-group/index` | 保留，统一聚会口令/二维码/拍第一张。 |
| 拍照记录 | `pages/moment-editor/index` | 保留，默认拍第一张和后续补图。 |
| 现场记录 | `pages/live-record/index` | 保留并重写，主视觉为照片墙+账本，不再跳转盘/桌面模式。 |
| 聚会账本 | `pages/ledger/index` 或并入 `live-record` | 新建或重写，替代 `table-mode/judge-wheel` 的欠酒能力。 |
| 聚会简报 | `pages/session-brief/index` | 保留重写。 |
| 分享海报保存 | `pages/share-poster/index` | 保留重写为实际保存图主链路。 |
| 分享回流 | `pages/share-preview/index` | 保留重写公开回流。 |
| 相册 | `pages/album/index` 或重建 `wine-history` | 建议新建/重命名，迁出 `wine-history`。 |
| 我的 | `pages/me/index` | 保留重写数据源和入口。 |
| 失败/隐私态 | `pages/invalid-state/index`、`pages/restart-state/index` 重写或合并 | 保留最小失败态，清旧文案。 |

#### 14.44.3 旧页面删除 / 重建 / 保留表

| 类别 | 文件/目录 | 处理建议 | 备份/回滚 |
| --- | --- | --- | --- |
| P0 删除/隔离 | `miniprogram/pages/judge*`、`question-bank`、`table-mode`、`result-report`、`logs` | 从 `app.json` 移除并删除目录；账本/简报能力另建。 | 删除前新建 git 分支或打 tag；用 `git restore -- <path>` 回滚。 |
| P0 重写 | `share-poster`、`share-preview`、`session-brief`、`live-record` | 保留路径能力但重写为新项目视觉与字段，移除旧 report/judge/wine 依赖。 | 逐页小提交，保留旧实现到归档分支。 |
| P0 重命名/重建 | `wine-history` | 改为新 `album`；当前先作为临时完整相册列表。 | 先新增新页再迁路由，避免一次性断链。 |
| P1 隔离 | `wine-points`、`premium-templates`、`member-center`、`coupon-center`、`merchant-partners`、`tools`、`tool-detail`、`favorites`、`usage-history` | 从主链路下线，后续根据新商业化/工具策略重建。 | 从 `app.json` 移除前跑引用扫描。 |
| 保留工程能力 | `components/navigation-bar`、`session-return-bar`、`moment-card`、`moment-timeline`、`share-task-status`、`services/operations.ts` 中 request 基础能力 | 组件按新命名/样式重写；服务层仅保留 parties/photos/ledger/brief/share 需要的能力。 | 组件逐个替换，保留 API 类型 diff。 |
| 资产清理 | `assets/home/table-party-bg.jpg`、`assets/share/share-poster-miniapp-code.png`、旧 `party-recorder-share-bg.webp` | 旧桌面/旧分享背景列入替换；020 SVG 可暂保留作为新分享素材。 | 删除前复制到 `docs/archive` 或依赖 git。 |

#### 14.44.4 import / 跳转引用扫描摘要

命令：`rg -n "pages/(judge|judge-wheel|question-bank|table-mode|wine-history|wine-points|result-report|share-poster|share-preview|rankings|premium-templates|merchant-partners|coupon-center|member-center|tools|tool-detail|session-rules)" miniprogram --glob '!miniprogram/app.json'`

| 命中区域 | 典型命中 | 处理建议 |
| --- | --- | --- |
| 首页/底部 tab | `index.ts`、`index.wxml` 仍有 `judge/tools/wine-history`。 | 改为首页/相册/记录/我的，并剥离工具箱。 |
| 我的页 | `me.ts` 仍跳 `judge/wine-history/premium-templates/member-center`。 | 重写为相册、账号、隐私、反馈；旧商业化隔离。 |
| 现场记录 | `live-record.ts` 跳 `table-mode/judge-wheel/share-poster`。 | 删除转盘/桌面玩法跳转，改为账本和分享。 |
| 历史页 | `wine-history.ts` 跳 `rankings/result-report/share-poster`。 | 重建为相册列表，不再跳战报/榜单。 |
| 简报页 | `session-brief.ts` 跳 `rankings/share-poster/wine-history`。 | 保留分享，删除榜单，历史入口改相册。 |
| 工具/会员 | `firstLoginBonus.ts`、`invalid-state.ts`、`coupon-center.ts` 等跳 `wine-points/member-center/merchant`。 | 从新项目首版隔离。 |

#### 14.44.5 用户可见旧词命中摘要

命令：`rg -n "酒桌判官|判官|欠酒|惩罚|战报|裁判|酒局|不醉不归|最欠酒|喝酒|罚酒|转盘" miniprogram --glob "*.{ts,wxml,less,json}"`

| 命中路径 | 旧词类型 | 拟处理 |
| --- | --- | --- |
| `pages/add-players`、`session-rules`、`waiting-room` | 创建酒局、判官、欠酒规则。 | P0 删除/重写为聚会创建与邀请。 |
| `pages/live-record` | 欠酒、判官、转盘、旧账本文案。 | P0 重写现场记录和账本；若保留账本，改为聚会账本语言。 |
| `pages/judge-wheel`、`question-bank` | 判官转盘、惩罚、题库。 | P0 删除/隔离。 |
| `pages/table-mode` | 欠酒、战报、酒桌判官酒局。 | P0 删除/由新账本页替代。 |
| `pages/result-report` | 本局战报、分享战报。 | P0 删除/由聚会简报和分享页替代。 |
| `pages/tools`、`tool-detail`、`utils/toolkit.ts` | 酒桌判官工具/酒局邀人。 | P1 隔离或重写工具入口。 |
| `pages/member-center`、`favorites`、`usage-history`、`restart-state`、`invalid-state` | 会员战报、酒局历史、继续酒桌判官。 | P1/P0 按是否在主链路暴露处理。 |
| `components/moment-card`、`share-poster`、`share-preview`、`session-brief` | 欠酒作为账本字段展示。 | P0 改为聚会账本/待处理饮品记录等用户语言；保留 data 字段不等于可见文案。 |

#### 14.44.6 建议验证命令

- `rg -n "酒桌判官|判官|欠酒|惩罚|战报|裁判|酒局|不醉不归|最欠酒|喝酒|罚酒|转盘" miniprogram --glob "*.{ts,wxml,less,json}"`：Clean Slate 实施后应只剩技术豁免或无命中。
- `rg -n "pages/(judge|judge-wheel|question-bank|table-mode|wine-history|wine-points|result-report|rankings|premium-templates|merchant-partners|coupon-center|member-center|tools|tool-detail)" miniprogram`：实施后确认旧路由不再从主链路可达。
- `npm.cmd run typecheck`：路由和 TS 类型检查。
- `npm.cmd run check:encoding`：中文文案和 WXML 编码扫描。
- `git diff --check -- miniprogram/app.json miniprogram/pages miniprogram/components miniprogram/services miniprogram/utils docs/gameplay-moments-frontend-development-plan.md`：空白和换行检查。
- 微信开发者工具预览矩阵：`index -> create-session -> invite-group -> moment-editor -> live-record -> ledger -> session-brief -> share-poster -> share-preview -> album -> me`。

#### 14.44.7 本轮只读验证

- 已读：`AGENTS.md`、`docs/party-recorder-clean-slate-reset-plan.md`、`miniprogram/app.json`。
- 已扫：`miniprogram/pages`、`miniprogram/components`、`miniprogram/assets`、旧路由跳转、旧词命中、服务/工具旧能力引用。
- 本轮未删除源码、未改 `app.json`、未改后端接口、未改 PM 总台账。
- 本节结论是“清单已产出 / 待 PM 确认实施”，不是“清空完成”。

### 14.45 `PR-FE-CLEAN-SLATE-CUTOVER-002` 前端 Cutover 方案草案

状态：cutover 方案已补 / 未删目录、未改 `app.json`、未执行迁移 / 待 PM 放行后按阶段实施。记录时间：2026-06-18。本节只更新前端计划，不直接删除源码，不改 PM 总台账、后端接口、测试/UIUX/UGC 文档。

#### 14.45.1 `app.json` 精确 cutover diff 草案

第一阶段目标：`app.json` 只暴露新主链路和最小失败态。以下为实施草案，非本轮实际 diff。

```diff
 {
   "pages": [
     "pages/index/index",
-    "pages/tools/index",
-    "pages/judge/index",
     "pages/me/index",
     "pages/create-session/index",
-    "pages/session-rules/index",
-    "pages/add-players/index",
     "pages/invite-group/index",
     "pages/share-preview/index",
-    "pages/compliance-guide/index",
-    "pages/flow-overview/index",
     "pages/moment-editor/index",
     "pages/live-record/index",
-    "pages/table-mode/index",
-    "pages/judge-wheel/index",
-    "pages/result-report/index",
     "pages/session-brief/index",
-    "pages/rankings/index",
     "pages/share-poster/index",
-    "pages/wine-history/index",
-    "pages/wine-points/index",
-    "pages/premium-templates/index",
-    "pages/merchant-partners/index",
+    "pages/album/index",
+    "pages/ledger/index",
     "pages/invalid-state/index",
-    "pages/restart-state/index",
-    "pages/tool-detail/index",
-    "pages/member-center/index",
-    "pages/favorites/index",
-    "pages/usage-history/index",
-    "pages/coupon-center/index",
-    "pages/settings/index",
-    "pages/invite-friends/index",
+    "pages/privacy-state/index",
     "pages/friend-hub/index",
-    "pages/question-bank/index",
-    "pages/waiting-room/index",
-    "pages/logs/logs"
+    "pages/waiting-room/index"
   ]
 }
```

| 类别 | 路由 | cutover 动作 |
| --- | --- | --- |
| 保留但重写 | `index`、`create-session`、`invite-group`、`waiting-room`、`moment-editor`、`live-record`、`session-brief`、`share-poster`、`share-preview`、`me`、`invalid-state` | 保留路由，清旧词、清旧跳转、改新视觉和数据模型。 |
| 新建/改名 | `album`、`ledger`、`privacy-state` | `album` 替代 `wine-history`；`ledger` 替代 `table-mode/judge-wheel` 的账本能力；`privacy-state` 合并隐私/失败态。 |
| 移除旧路由 | `judge`、`judge-wheel`、`question-bank`、`table-mode`、`result-report`、`rankings`、`wine-history`、`wine-points`、`tools`、`tool-detail`、`favorites`、`usage-history`、`premium-templates`、`member-center`、`coupon-center`、`merchant-partners`、`session-rules`、`add-players`、`flow-overview`、`restart-state`、`logs` | 不直接删目录；先从 `app.json` 下线，确认无引用后归档/删除。 |
| 暂缓判断 | `compliance-guide`、`settings`、`invite-friends` | 若 UI/UX/UGC 要求保留隐私/举报/邀请能力，可并入 `privacy-state` 或新邀请页；本轮不列主链路。 |

#### 14.45.2 页面目录级归档 / 隔离顺序

| 阶段 | 动作 | 目录 | 依赖前置 | 失败回退 |
| --- | --- | --- | --- | --- |
| 0. 冻结基线 | 创建 cutover 分支和基线 tag，不改文件。 | 全仓库 | PM 放行；记录当前 `git status --short`。 | 切回原分支；不覆盖 dirty worktree。 |
| 1. 新建替代页 | 先建 `pages/album`、`pages/ledger`、`pages/privacy-state` 空壳/新壳。 | 新目录 | UI/UX 给最小页面结构；后端/API 给可用字段或空态。 | 删除新目录需走本阶段提交回滚，不碰旧目录。 |
| 2. 迁入口 | 修改 `index/me/live-record/session-brief/share-*` 跳转到新路由。 | 保留页 | 新页可打开；typecheck 过。 | 回滚该阶段提交；旧路由仍未删。 |
| 3. `app.json` 下线旧路由 | 从 `app.json` 移除 P0 旧路由。 | `app.json` | `rg pages/<old>` 无主链路引用；微信预览打开新主链路。 | 回滚 `app.json` 阶段提交。 |
| 4. 归档旧目录 | 移动到 `docs/archive/clean-slate-20260618/miniprogram/pages/<name>` 或保留到 cutover 分支归档 tag。 | `judge*`、`question-bank`、`table-mode`、`result-report`、旧商业化/工具页 | 旧路由已下线且 no-import 通过。 | 从归档目录按文件复制回新分支；禁止 `git restore -- <path>` 覆盖未确认改动。 |
| 5. 删除归档副本或保留索引 | PM/测试确认后再删除或保留压缩包索引。 | `docs/archive` | Clean Slate 预览矩阵通过。 | 使用归档目录或 tag 恢复。 |

必须等新页建好再删旧页：`wine-history -> album`、`table-mode/judge-wheel -> ledger`、`result-report -> session-brief/share-poster`、`restart-state/invalid-state -> privacy-state`。
可先下线再归档：`question-bank`、`logs`、`tools/tool-detail`、`wine-points`、`premium-templates`、`member-center`、`coupon-center`、`merchant-partners`、`favorites`、`usage-history`。

#### 14.45.3 组件 / 资产保留白名单与淘汰白名单

| 类型 | 白名单 | 处理 |
| --- | --- | --- |
| 组件保留 | `navigation-bar`、`session-return-bar`、`moment-card`、`moment-timeline`、`session-moment-summary`、`share-task-status` | 保留工程能力；统一改新视觉/新文案，去掉 judge/wine 命名和旧字段直出。 |
| 组件淘汰候选 | 无独立旧组件目录；旧污染主要在页面内和服务字段。 | 如后续拆出旧玩法组件，直接列入归档。 |
| 资产保留 | `assets/party-recorder/party-recorder-album-bg.webp`、`party-recorder-empty-album-sticker.png`、上传状态贴纸、`share-flow/pr-share020-*.svg` | 可作为新相册/分享素材临时保留，待 UI/UX 复核。 |
| 资产淘汰候选 | `assets/home/table-party-bg.jpg`、`assets/share/share-poster-miniapp-code.png`、旧生成分享图/旧 report poster 背景 | 先引用扫描；无引用后归档到 `docs/archive/clean-slate-20260618/assets/`。 |
| 服务保留 | `services/operations.ts` 的 request 基础、session/live/brief/share task/photo 能力 | 按新 API 合同拆分；旧 report/judge/ranking/question/tool/merchant 能力先隔离。 |
| 服务淘汰候选 | `getManagedQuestionBank`、`getManagedTodayRanking`、旧 `getManagedReport*`、`getManagedJudgeStats`、旧 tools/merchant/coupon/member 入口 | 等后端/API 新合同和前端新页稳定后移除。 |

#### 14.45.4 Dirty Worktree 回滚方案

禁止：在当前 dirty worktree 上直接执行 `git restore -- <path>`、`git reset --hard`、`git checkout -- <path>` 覆盖未确认文件。

可执行方案：

1. 实施前只读记录：`git status --short`、`git diff --stat`、`git diff --name-only`。
2. 创建专用分支：`git switch -c codex/clean-slate-cutover-002`；如分支已存在则新建带时间戳分支。
3. 建基线 tag 或轻量记录：`git tag clean-slate-fe-before-cutover-20260618`，仅在 PM 允许后执行。
4. 每个阶段独立提交：`cutover-01-new-pages`、`cutover-02-route-migration`、`cutover-03-app-json-prune`、`cutover-04-archive-old-pages`。
5. 归档移动优先用 `docs/archive/clean-slate-20260618/...`；目录移动前后各跑引用扫描。
6. 回滚只回滚本阶段提交或从归档目录复制目标文件；如果某文件有用户未确认改动，先人工 diff，不做整路径恢复。

#### 14.45.5 依赖扫描复核与 fail-fast 条件

| 阶段 | 必跑扫描 | Fail-fast 条件 |
| --- | --- | --- |
| 新页建好前 | `rg -n "pages/(album|ledger|privacy-state)" miniprogram` | 新路由不存在或不能被引用时，不移除旧路由。 |
| 旧路由下线前 | `rg -n "pages/(judge|judge-wheel|question-bank|table-mode|result-report|wine-history|wine-points|rankings|tools|tool-detail)" miniprogram --glob "!miniprogram/app.json"` | 任一主链路仍引用旧页，停止下线。 |
| 旧词清理后 | `rg -n "酒桌判官|判官|欠酒|惩罚|战报|裁判|酒局|转盘" miniprogram --glob "*.{ts,wxml,less,json}"` | 用户可见源码仍命中未豁免旧词，停止验收。 |
| 构建前 | `npm.cmd run typecheck`、`npm.cmd run check:encoding` | 任一失败停止合并。 |
| 路由裁剪后 | `git diff --check -- miniprogram/app.json miniprogram/pages miniprogram/components miniprogram/services miniprogram/utils` | 空白错误或路径缺失导致 diff check 异常，停止。 |
| 预览矩阵 | `npm.cmd run wechat:auto -- relaunch ...` 覆盖新主链路 | 首页/创建/邀请/拍照/账本/简报/分享/相册/我的任一 P0 路径打不开，停止。 |

#### 14.45.6 最小验证命令

- `npm.cmd run typecheck`
- `npm.cmd run check:encoding`
- `git diff --check -- miniprogram/app.json miniprogram/pages miniprogram/components miniprogram/services miniprogram/utils docs/gameplay-moments-frontend-development-plan.md`
- `rg -n "pages/(judge|judge-wheel|question-bank|table-mode|result-report|wine-history|wine-points|rankings|tools|tool-detail)" miniprogram`
- `rg -n "酒桌判官|判官|欠酒|惩罚|战报|裁判|酒局|转盘" miniprogram --glob "*.{ts,wxml,less,json}"`
- 预览矩阵草案：`/pages/index/index`、`/pages/create-session/index`、`/pages/invite-group/index`、`/pages/moment-editor/index`、`/pages/live-record/index`、`/pages/ledger/index`、`/pages/session-brief/index`、`/pages/share-poster/index`、`/pages/share-preview/index`、`/pages/album/index`、`/pages/me/index`。

#### 14.45.7 本轮状态

- 已读：`docs/runtime/ai-thread-dispatch-queue.md` 中 `PR-FE-CLEAN-SLATE-CUTOVER-002` 行、`docs/party-recorder-clean-slate-reset-plan.md`、前端计划 14.44。
- 已补：可执行 diff 草案、归档路径、路由移除顺序、依赖扫描复核、最小验证命令、dirty worktree 回滚方案。
- 未做：未删除目录、未改 `app.json`、未移动资产、未创建新页、未执行 git 分支/tag。

### 14.46 `PR-FE-CLEAN-SLATE-PHASE1-IMPLEMENT-003` 第一阶段实装记录

#### 14.46.1 本轮边界

- 只做“新壳可进、旧壳下线”第一阶段：新建 `album`、`ledger`、`privacy-state` 壳页；迁移主链路入口；从 `app.json` 下线 P0 旧路由。
- 本轮未删除旧目录、未归档旧目录、未改 PM 总台账 / 测试计划 / UI/UX 计划 / 后端或接口文档。
- UI/UX 12.7.25 资产包只接入隐私状态页必需 `pr-cs002-privacy-shield.svg`；分享页全量资产仍按后续 clean slate 分享任务接入。

#### 14.46.2 源码改动文件

| 类型 | 文件 | 改法 |
| --- | --- | --- |
| 路由 | `miniprogram/app.json` | 新增 `pages/album/index`、`pages/ledger/index`、`pages/privacy-state/index`；下线 `pages/judge/index`、`pages/judge-wheel/index`、`pages/question-bank/index`、`pages/table-mode/index`、`pages/result-report/index`。 |
| 新相册壳 | `miniprogram/pages/album/index.{json,ts,wxml,less}` | 使用 `getManagedSessionMomentSummaries()` 展示真实相册 / 待处理摘要；空态提示去创建聚会；不造照片或分享任务数据。 |
| 新账本壳 | `miniprogram/pages/ledger/index.{json,ts,wxml,less}` | 从 `getSessionRuntime()` 读取当前聚会成员、待整理记录、已完成记录；无进行中聚会时提示先创建或加入。 |
| 新隐私状态壳 | `miniprogram/pages/privacy-state/index.{json,ts,wxml,less}` | 承接功能整理、公开过滤、权限失败等用户可读状态；不显示 raw 字段。 |
| 资产 | `miniprogram/assets/party-recorder/clean-slate/pr-cs002-privacy-shield.svg` | 按 UI/UX 12.7.25 从 `clean-slate-001/cuts` 入包，供 `privacy-state` 使用。 |
| 首页入口 | `miniprogram/pages/index/index.ts`、`index.wxml`、`miniprogram/mock/home.ts` | 最近相册 / 全部相册切到 `album`；记录 tab 切到 `ledger`；首页二级“实用工具”替换为“聚会账本”。 |
| 我的页入口 | `miniprogram/pages/me/index.ts`、`index.wxml` | 相册数、分享图、待处理相册、聚会历史、我的相册、分享记录切到 `album`；记录 tab 切到 `ledger`；权益 / 主题切到 `privacy-state` 壳。 |
| 记录 / 简报 / 分享路径 | `miniprogram/pages/live-record/index.ts`、`session-brief/index.ts`、`share-poster/index.ts`、`wine-history/index.ts` | 保存后和旧转盘入口切到 `ledger`；简报返回 fallback 切到 `album`；分享转发不再指向 `result-report`；历史页旧报告入口切到 `share-poster`。 |
| 失败态与离开确认 | `miniprogram/pages/invalid-state/index.{ts,wxml}`、`miniprogram/utils/session-exit.ts` | 旧“酒局 / 本局 / 战报”可见文案改为聚会 / 相册 / 记录口径；旧快捷入口切到 `album` / `ledger`。 |
| 工具页内部 tab | `miniprogram/pages/tools/index.ts` | 若旧工具页仍被保留路由打开，记录 tab 不再跳 `judge`，改跳 `ledger`。 |

#### 14.46.3 路由对照与预览路径

| 旧入口 | 第一阶段新入口 |
| --- | --- |
| `/pages/judge/index` | `/pages/ledger/index` 或 `/pages/live-record/index?sessionId=...` |
| `/pages/table-mode/index` | `/pages/ledger/index` |
| `/pages/judge-wheel/index` | `/pages/ledger/index` |
| `/pages/result-report/index?reportId=...` | `/pages/share-poster/index?reportId=...` |
| `/pages/question-bank/index` | 本轮直接从 `app.json` 下线；目录保留待归档。 |
| `/pages/wine-history/index?mode=...` | 主链路切到 `/pages/album/index?mode=...`；旧路由暂保留兼容非主链路。 |

预览路径清单：

- `/pages/index/index`
- `/pages/album/index`
- `/pages/album/index?mode=unshared`
- `/pages/ledger/index`
- `/pages/privacy-state/index?type=filtered`
- `/pages/create-session/index`
- `/pages/invite-group/index`
- `/pages/live-record/index`
- `/pages/session-brief/index`
- `/pages/share-poster/index`
- `/pages/share-preview/index`
- `/pages/me/index`

#### 14.46.4 数据结构不破坏说明

- `album` 只消费 `ManagedSessionMomentSummary` 真实字段：`briefId/sessionId/title/sessionName/shareImageUrl/shareImageStatus/pendingMediaCount/shareImageTaskId`。
- `ledger` 只消费 `getSessionRuntime()` 本地运行态，不新增后端字段、不伪造账本数据。
- 原 `share-poster`、`share-preview`、`session-brief` QA data key 未删除；本轮只改跳转和用户可见入口。
- 旧目录未删除，后续归档前仍需按 14.45 扫描 import / route / user copy。

#### 14.46.5 验证命令

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过。
- `git diff --check -- miniprogram/app.json miniprogram/pages/album miniprogram/pages/ledger miniprogram/pages/privacy-state miniprogram/pages/index miniprogram/pages/me miniprogram/pages/live-record miniprogram/pages/session-brief miniprogram/pages/wine-history miniprogram/pages/invalid-state miniprogram/pages/share-poster/index.ts miniprogram/pages/tools/index.ts miniprogram/mock/home.ts miniprogram/utils/session-exit.ts miniprogram/assets/party-recorder/clean-slate/pr-cs002-privacy-shield.svg docs/gameplay-moments-frontend-development-plan.md`：通过，仅 Git LF/CRLF warning。
- Route scan：`rg -n 'pages/(judge|judge-wheel|question-bank|result-report|table-mode)/index' miniprogram --glob '!miniprogram/pages/judge/**' --glob '!miniprogram/pages/judge-wheel/**' --glob '!miniprogram/pages/question-bank/**' --glob '!miniprogram/pages/result-report/**' --glob '!miniprogram/pages/table-mode/**'`：无命中。
- `app.json` scan：`rg -n '"pages/(judge|judge-wheel|question-bank|result-report|table-mode)/index"' miniprogram/app.json`：无命中。

#### 14.46.6 待测试 / 待 PM 复核项

- 待测试用微信开发者工具预览框复跑上述路径，确认首页、相册、账本、我的页和分享页不再跳已下线 P0 旧路由。
- 旧 `wine-history`、`rankings`、`tools`、`premium-templates` 等非 P0 路由本轮未从 `app.json` 全量下线，需等 PM 放行 clean slate phase 2 再归档/删除。
- `album` 当前是最小壳页，未做完整筛选语义；`mode=host/joined/unshared` 先保留标题和空态，真实筛选需后续接口或前端聚合补齐。

### 14.47 `PR-FE-CLEAN-SLATE-PHASE2-004` 第二阶段实装记录

#### 14.47.1 本轮边界

- 只改前端源码和前端计划；未改 PM 总台账、测试计划、UI/UX 计划、UGC、后端/API 文档或接口合同。
- 本轮继续做 Clean Slate 下线 / 重写：保留 `share-preview`、`share-poster` 的核心分享能力，继续下线旧相册、旧积分、旧工具、旧商业化和旧后台入口路由。
- 聚会账本数据结构保留；用户可见文案统一为“聚会账本 / 待整理 / 已记录 / 已完成”，不展示旧“战报 / 判官 / 惩罚 / 欠酒”主叙事。

#### 14.47.2 改动文件

| 类型 | 文件 | 改法 |
| --- | --- | --- |
| 路由下线 | `miniprogram/app.json` | 从路由表继续移除 `tools`、`session-rules`、`add-players`、`flow-overview`、`rankings`、`wine-history`、`wine-points`、`premium-templates`、`merchant-partners`、`restart-state`、`tool-detail`、`member-center`、`favorites`、`usage-history`、`coupon-center`、`invite-friends`、`logs`；保留 `share-preview/share-poster` 并重写可见层。 |
| 分享海报 | `miniprogram/pages/share-poster/index.ts/wxml/less` | 可见账本指标从“欠酒/已喝/已清”改为“待整理/已记录/已完成”；保存图 canvas 改“关键时刻/口令”；WXML 切到 `pr-cs002-*` clean slate 资产；去掉预期接口失败的 `console.warn`，错误只落安全文案和 page data。 |
| 分享回流 | `miniprogram/pages/share-preview/index.ts/wxml/less` | 可见账本指标同样改为“待整理/已记录/已完成”；回流页切到 clean slate 背景光效；保留 `filteredNodeIds/visibleNodeIds/permissionState` data 供测试/UGC，但不在 UI 展示 raw 字段。 |
| 主链路旧入口兜底 | `miniprogram/pages/index/index.ts`、`miniprogram/pages/me/index.ts`、`miniprogram/mock/home.ts`、`miniprogram/services/home.ts`、`miniprogram/utils/firstLoginBonus.ts`、`miniprogram/pages/create-session/index.ts`、`miniprogram/pages/waiting-room/index.ts`、`miniprogram/pages/invalid-state/index.ts` | 已下线路由的 fallback 统一导向 `privacy-state`、`album`、`ledger` 或 `create-session`，避免用户从主链路跳到旧工具 / 旧积分 / 旧模板 / 旧流程说明页。 |
| 记录 / 简报可见文案 | `miniprogram/pages/live-record/index.ts/wxml`、`miniprogram/pages/session-brief/index.wxml` | 将“判官 / 欠酒 / 已喝 / 加酒”等旧心智文案替换为“发起人 / 待整理 / 已记录 / 已完成”。 |
| Clean Slate 资产 | `miniprogram/assets/party-recorder/clean-slate/pr-cs002-*.svg` | 按 UI/UX 12.7.25 将 8 个 SVG 切图入包，分享页和隐私态优先消费。 |

#### 14.47.3 路由 / 入口处理说明

- `wine-history`：已从 `app.json` 下线；主链路相册入口改走 `/pages/album/index`。
- `wine-points`：已从 `app.json` 下线；登录奖励 / 权益入口改走 `/pages/privacy-state/index?type=feature`。
- `share-preview`：保留路由并重写可见层；仍保留 QA/UGC data 字段。
- `share-poster`：保留路由并重写可见层和保存图文字；不再引用旧 `share020` 切图作为页面资源。
- 旧目录未删除：旧目录内部仍可能残留旧引用，需等 PM phase 3 放行后按 14.45 归档 / 删除。

#### 14.47.4 预览框证据

| 页面 | 命令 / 路径 | 截图 | data 摘要 | Console |
| --- | --- | --- | --- | --- |
| 分享海报 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --data photoHighlights,accountingHighlights,keyEvents,displayTaskLayoutMode,displayTaskStatus,saveState,posterImagePath,readyShareImageUrl --output docs/runtime/pr-fe-clean-slate-phase2-004-share-poster-task.png` | `docs/runtime/pr-fe-clean-slate-phase2-004-share-poster-task.png` | `photoHighlights=[]`、`accountingHighlights=[]`、`keyEvents=[]`、`displayTaskLayoutMode=照片记录`、`displayTaskStatus=生成失败`、`saveState=failed`、`readyShareImageUrl=""` | `console=[]` |
| 分享回流 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-preview/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T&briefId=brief-1781584503870-25d5edac" --data photoHighlights,accountingHighlights,keyEvents,shareSummary,filteredNodeIds,visibleNodeIds,permissionState --output docs/runtime/pr-fe-clean-slate-phase2-004-share-preview.png` | `docs/runtime/pr-fe-clean-slate-phase2-004-share-preview.png` | `photoHighlights=[]`、`accountingHighlights=[]`、`keyEvents=[]`、`shareSummary=这场聚会的可分享照片和账本高光会在这里汇总。`、`filteredNodeIds=[]`、`visibleNodeIds=[]`、`permissionState=""` | `console=[]` |

说明：当前 DevTools 样本未注入成员态 storage / token，接口数据为空或失败态；本轮只证明页面、空态、安全文案和 Console 清理，不把空态写成联合分享完成。照片 + 聚会账本 + 关键事件实数据仍需测试带成员态 storage 复跑。

#### 14.47.5 验证命令

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过。
- Route scan：`rg -n "pages/(wine-history|wine-points|rankings|premium-templates|merchant-partners|member-center|coupon-center|favorites|usage-history|invite-friends|logs|tool-detail|tools|session-rules|add-players|flow-overview|restart-state)/index|pages/logs/logs" miniprogram ...`：非旧目录 / 主链路无命中。
- `app.json` scan：`rg -n '"pages/(wine-history|wine-points|rankings|premium-templates|merchant-partners|member-center|coupon-center|favorites|usage-history|invite-friends|tools|tool-detail|session-rules|add-players|flow-overview|restart-state)/index"|"pages/logs/logs"' miniprogram/app.json`：无命中。
- 旧词扫描：分享核心页只剩内部清洗 / 错误映射里的 `not session member`、`share task has no visible nodes`、`酒局/判官` 正则；WXML 可见文案未命中。
- 目标 `git diff --check -- miniprogram/app.json miniprogram/pages/share-poster miniprogram/pages/share-preview miniprogram/pages/session-brief miniprogram/pages/live-record miniprogram/pages/index/index.ts miniprogram/pages/me/index.ts miniprogram/mock/home.ts miniprogram/services/home.ts miniprogram/utils/firstLoginBonus.ts miniprogram/pages/create-session/index.ts miniprogram/pages/waiting-room/index.ts miniprogram/pages/invalid-state/index.ts miniprogram/assets/party-recorder/clean-slate docs/gameplay-moments-frontend-development-plan.md`：通过，仅 Git LF/CRLF warning。

#### 14.47.6 待测试 / UIUX / UGC 复核

- 测试需带成员态 storage/token 复跑 `share-poster/share-preview`，确认 `photoHighlights/accountingHighlights/keyEvents` 有真实数据时照片 + 聚会账本同屏展示。
- UI/UX 需复核 clean slate 分享海报和回流页是否仍需 1:1 调整；本轮未写视觉通过。
- UGC 需复核保存 PNG 原图内不出现 raw ID、内部样本名、工程字段、接口错误原文；本轮未写风控准出。
- 旧目录仍未删除，phase 3 需继续归档 / 删除旧 `wine-*`、商业化、工具、旧玩法目录。

### 14.48 `PR-FE-CLEAN-SLATE-PHASE2-004-FIXUP` 修补记录

#### 14.48.1 退回点

- UI/UX 12.7.27 判定 `album` P0：截图中仍展示 `IT-MOMENTS`、`PR-BE-DB-LOGIN-SEED` 等工程字段 / 样本名。
- PM 目检 `share-preview`：回流页显示 `0/0 已加入`，属于生硬调试状态，不适合作为用户空态。
- 分享空态需保持产品化表达；page data 可保留给测试/UGC，但 UI 不显示 raw 字段或接口失败口径。

#### 14.48.2 源码修复

| 文件 | 修复 |
| --- | --- |
| `miniprogram/pages/album/index.ts` | 新增 `internalSeedPattern` 与 `normalizeAlbumMetaText()`；`title/meta` 均过滤 `IT-MOMENTS`、`PR-BE-DB-LOGIN-SEED`、`PR/QA/DEV/TEST Seed` 等内部样本名，无法识别真实聚会名时显示“聚会相册 N / 聚会记录”。 |
| `miniprogram/pages/share-preview/index.ts` | 新增 `inviteStatusText`，由 `joinedCount/playerCount` 推导用户文案；`0/0` 场景显示“等待好友加入”或“邀请已准备好”，原始计数字段继续保留在 page data。 |
| `miniprogram/pages/share-preview/index.wxml` | 将两个 `{{joinedCount}}/{{playerCount}} 已加入` 可见位置改为 `{{inviteStatusText}}`；成员列表为空时显示产品化空态，不显示生硬数字。 |
| `miniprogram/pages/share-preview/index.less` | 新增 `.share-status-empty` 空态样式。 |

#### 14.48.3 预览框证据

| 页面 | 命令 / 路径 | 截图 | data 摘要 | Console |
| --- | --- | --- | --- | --- |
| 相册 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/album/index?mode=album" --data items,pageTitle,emptyText,loading --output docs/runtime/pr-fe-clean-slate-phase2-004-fixup-album.png` | `docs/runtime/pr-fe-clean-slate-phase2-004-fixup-album.png` | `items[0].title=聚会相册 1`、`items[0].meta=聚会记录`、`items[1].title=聚会相册 2`、`loading=false`；未显示 `IT-MOMENTS/PR-BE-DB-LOGIN-SEED` | `console=[]` |
| 分享回流 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-preview/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T&briefId=brief-1781584503870-25d5edac" --data inviteStatusText,joinedCount,playerCount,photoHighlights,accountingHighlights,keyEvents,shareSummary,filteredNodeIds,visibleNodeIds,permissionState --output docs/runtime/pr-fe-clean-slate-phase2-004-fixup-share-preview.png` | `docs/runtime/pr-fe-clean-slate-phase2-004-fixup-share-preview.png` | `inviteStatusText=邀请已准备好`、`joinedCount=0`、`playerCount=0`；原始计数字段保留，UI 不展示 `0/0 已加入` | `console=[]` |

#### 14.48.4 验证命令

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过。
- 针对性扫描：`rg -n "IT-MOMENTS|PR-BE-DB-LOGIN-SEED|PR Seed|0/0 已加入|\\{\\{joinedCount\\}\\}/\\{\\{playerCount\\}\\}|欠酒|战报|判官|惩罚" miniprogram/pages/album miniprogram/pages/share-preview`：仅命中 `album/index.ts` 内部清洗正则，不命中可见 WXML。
- 目标 `git diff --check -- miniprogram/pages/album/index.ts miniprogram/pages/share-preview/index.ts miniprogram/pages/share-preview/index.wxml miniprogram/pages/share-preview/index.less docs/gameplay-moments-frontend-development-plan.md`：通过，仅 Git LF/CRLF warning。

#### 14.48.5 待复核

- 测试需用成员态 storage/token 复跑 `album`、`share-preview`，确认真实数据态仍不泄露工程字段。
- UI/UX 需复核相册和分享回流空态视觉，本轮不写 UI/UX 通过。
- UGC 需继续复核用户 UI/PNG 不出现 raw 字段、工程样本名或接口错误原文。

### 14.49 `PR-FE-CLEAN-SLATE-SHARE-POSTER-005-FIX` 分享海报主链路修补

#### 14.49.1 根因

- `share-poster` 自定义返回和完成分享兜底仍无条件 `reLaunch('/pages/index/index')`，测试在指定 `briefId/taskId` 样本下容易看到 summary 回到首页。
- 无业务 query 时仅 toast 后 return，没有把页面落到产品化失败 / 重试态；空路径或接口失败时缺少可证据化的 page data。
- 合成失败分享任务默认 `layoutMode=timeline`、`includeLedger=false`，在无权限 / 无 task 场景会弱化“照片 + 聚会账本”双主线。

#### 14.49.2 源码修复

| 文件 | 修复 |
| --- | --- |
| `miniprogram/pages/share-poster/index.ts` | 新增 `applyPosterUnavailableState()`，无 query / 加载异常 / 返回栈为空时均停留在 `share-poster` 并写入安全失败态：`saveState=failed`、`displayTaskStatus=生成失败`、`taskPrimaryLabel=重试生成`。 |
| `miniprogram/pages/share-poster/index.ts` | `buildShareTaskFromBrief()` 和 `buildUnavailableShareTask()` 默认保持 `includeLedger=true`、`ledgerIncluded=true`、`layoutMode=dual_flow`，只表达分享图布局意图，不伪造照片、账本或事件数据。 |
| `miniprogram/pages/share-poster/index.ts` | `handleBackTap()` 改为优先 `navigateBack`，无返回栈时停留当前页并提示“已停留在分享页，可继续重试”；`handleFinishShareTap()` 改为用户显式点击后 `navigateTo('/pages/album/index')`，不再静默回首页。 |

#### 14.49.3 预览框证据

| 场景 | 命令 / 路径 | 截图 | data 摘要 | Console |
| --- | --- | --- | --- | --- |
| 指定样本 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --data briefId,sessionId,shareTask,displayTaskLayoutMode,displayTaskStatus,saveState,errorText,photoHighlights,accountingHighlights,keyEvents,taskPrimaryLabel,readyShareImageUrl,posterImagePath --output docs/runtime/pr-fe-clean-slate-share-poster-005-fix.png` | `docs/runtime/pr-fe-clean-slate-share-poster-005-fix.png` | `page.path=pages/share-poster/index`；`briefId=brief-1781584503870-25d5edac`；`sessionId=session-1781584503517-c033e9`；`shareTask.status=failed`、`layoutMode=dual_flow`、`includeLedger=true`、`ledgerIncluded=true`；`displayTaskLayoutMode=照片和账本`、`saveState=failed`、`errorText=分享图暂时无法展示，请稍后重试`；`photoHighlights=[]`、`accountingHighlights=[]`、`keyEvents=[]` 未造数据。 | `console=[]` |
| 无业务参数 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?reset=1" --data shareTask,displayTaskLayoutMode,displayTaskStatus,saveState,errorText,photoHighlights,accountingHighlights,keyEvents,taskPrimaryLabel,readyShareImageUrl,posterImagePath --output docs/runtime/pr-fe-clean-slate-share-poster-005-empty-reset.png` | `docs/runtime/pr-fe-clean-slate-share-poster-005-empty-reset.png` | `page.path=pages/share-poster/index`；`shareTask.id=share-poster-unavailable`、`status=failed`、`layoutMode=dual_flow`；`displayTaskLayoutMode=照片和账本`、`displayTaskStatus=生成失败`、`taskPrimaryLabel=重试生成`、`errorText=分享图暂时无法展示，请稍后重试`。 | `console=[]` |

说明：空路径直接传 `/pages/share-poster/index` 时 DevTools automator 本轮沿用了上一条 query；因此补跑 `?reset=1` 作为无业务参数证据。

#### 14.49.4 验证命令

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过。
- 跳转扫描：`rg -n "reLaunch|redirectTo|navigateTo|pages/index/index|pages/album/index|applyPosterUnavailableState|buildUnavailableShareTask|buildShareTaskFromBrief" miniprogram/pages/share-poster/index.ts miniprogram/pages/share-poster/index.wxml`：`share-poster` 已无 `pages/index/index` 的 `reLaunch`；只保留显式创建聚会和查看相册入口。
- 目标 `git diff --check -- miniprogram/pages/share-poster/index.ts docs/gameplay-moments-frontend-development-plan.md`：通过，仅 Git LF/CRLF warning。

#### 14.49.5 待复核

- 测试需用 13.16.59 的成员态 storage token 后 8 位 `4afb1b00` 复跑同一路径，确认指定样本不再回首页 / 相册。
- 若线上 task 仍返回无权限或无可见内容，前端仅展示安全失败 / 重试态；真实照片 + 聚会账本同屏仍依赖测试拿到成员态可读 brief/task 数据后复拍。
- UI/UX / UGC 需继续确认失败态文案、空态和保存图不展示接口错误、工程字段或内部样本名。

### 14.50 `PR-FE-CLEAN-SLATE-SHARE-RETURN-HOME-006-FIX` 回流停页与首页泄露修补

#### 14.50.1 根因

- `share-preview` 转发路径仍指向 `/pages/index/index`，回流链路容易落到首页而不是回流页。
- `share-preview` 对 `briefId` 的消费被 live session 请求包在同一个总 try 内；brief 可读但 live / 权限失败时会进入总 catch 并清空页面数据，导致回流页不可验。
- `share-preview` 导航栏使用默认返回，栈异常时不能给出页面内停留证据。
- 首页最近相册只清洗了一部分内部样本名，且首页服务返回的 hero / 主入口工具仍可能带旧壳或工具入口；前端显示层未统一兜底为 clean slate 文案。

#### 14.50.2 源码修复

| 文件 | 修复 |
| --- | --- |
| `miniprogram/pages/share-preview/index.ts` | 新增 `briefId/errorText/previewLoadFailed` page data；`briefId` 优先落地，live 失败但 brief 可读时保留 brief 字段；完全失败时停在回流页并展示安全失败 / 重试态。 |
| `miniprogram/pages/share-preview/index.ts` | `onShareAppMessage()` 路径从首页改为 `/pages/share-preview/index?...`，保留 `inviteCode/sessionId/briefId` query。 |
| `miniprogram/pages/share-preview/index.ts`、`index.wxml`、`index.less` | 导航改 custom back；新增失败卡片，用户可见“分享页暂时无法展示 / 重试 / 查看相册”，不展示接口错误、内部 ID 或工程字段。 |
| `miniprogram/pages/index/index.ts` | 扩展首页最近相册显示层清洗：拦截 `PR-BE-DB-LOGIN`、`IT-MOMENTS`、`PR Seed`、内部 ID、英文状态等；`name/badgeText/usedAt` 均转成产品态文案。 |
| `miniprogram/pages/index/index.ts` | 首页 hero、主入口工具、合规文案固定使用 clean slate 前端文案，避免后端旧 home payload 把“酒桌判官 / 工具入口 / 旧工具列表”带回主入口。 |

#### 14.50.3 预览框证据

| 场景 | 命令 / 路径 | 截图 | data 摘要 | Console |
| --- | --- | --- | --- | --- |
| 回流指定样本 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-preview/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T&briefId=brief-1781584503870-25d5edac" --data briefId,sessionId,inviteCode,previewLoadFailed,errorText,inviteStatusText,photoHighlights,accountingHighlights,keyEvents,shareSummary,filteredNodeIds,visibleNodeIds,permissionState --output docs/runtime/pr-fe-clean-slate-share-return-home-006-share-preview.png` | `docs/runtime/pr-fe-clean-slate-share-return-home-006-share-preview.png` | `page.path=pages/share-preview/index`；`briefId=brief-1781584503870-25d5edac`、`sessionId=session-1781584503517-c033e9`、`inviteCode=W58G7T`；当前环境 `previewLoadFailed=true`、`errorText=这张分享页暂时无法展示，请稍后重试`；`photoHighlights=[]`、`accountingHighlights=[]`、`keyEvents=[]` 未造数据。 | `console=[]` |
| 仅 briefId 回流 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-preview/index?briefId=brief-1781584503870-25d5edac&previewReset=1" --data briefId,sessionId,inviteCode,previewLoadFailed,errorText,inviteStatusText,photoHighlights,accountingHighlights,keyEvents,shareSummary,filteredNodeIds,visibleNodeIds,permissionState --output docs/runtime/pr-fe-clean-slate-share-return-home-006-share-preview-brief.png` | `docs/runtime/pr-fe-clean-slate-share-return-home-006-share-preview-brief.png` | `page.path=pages/share-preview/index`；`briefId=brief-1781584503870-25d5edac`；无成员态可读数据时停在安全失败态，`previewLoadFailed=true`、`errorText=这张分享页暂时无法展示，请稍后重试`。 | `console=[]` |
| 首页最近相册 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/index/index?homeReset=3" --data home --output docs/runtime/pr-fe-clean-slate-share-return-home-006-home-clean.png` | `docs/runtime/pr-fe-clean-slate-share-return-home-006-home-clean.png` | `page.path=pages/index/index`；`home.hero.title=聚会记录师`；`quickTools=创建聚会/聚会账本/口令二维码`；`recentTools[0].name=聚会相册 1`、`recentTools[1].name=聚会相册 2`；未展示 `PR-BE-DB-LOGIN`、`IT-MOMENTS`、`PR Seed` 或旧工具列表。 | `console=[]` |

说明：首次并行复拍中 `briefId` 单路径命令被 DevTools automator 124 秒超时，顺序复跑已成功；首页首次并行复拍被上一页状态污染，顺序复跑 `homeReset=3` 已确认停在首页。

#### 14.50.4 验证命令

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过。
- 扫描：`rg -n "pages/index/index|share-poster\\?reset|PR-BE-DB-LOGIN|IT-MOMENTS|PR Seed|\\{\\{joinedCount\\}\\}/\\{\\{playerCount\\}\\}" miniprogram/pages/share-preview miniprogram/pages/index miniprogram/mock/home.ts`：`share-preview` 不再指向首页或 `share-poster?reset`；首页仅在清洗正则中命中内部字段。
- 目标 `git diff --check -- miniprogram/pages/share-preview/index.ts miniprogram/pages/share-preview/index.wxml miniprogram/pages/share-preview/index.less miniprogram/pages/index/index.ts docs/gameplay-moments-frontend-development-plan.md`：通过，仅 Git LF/CRLF warning。

#### 14.50.5 待复核

- 测试需带成员态 storage/token 复跑 `share-preview` 指定样本，确认有真实 brief/live 数据时照片、聚会账本、关键事件能在回流页同屏展示。
- 如果接口仍返回无权限 / 无公开字段，前端只展示安全失败或空态，不把接口错误、内部 ID、工程字段显示给用户。
- 保存 PNG、真实照片 + 聚会账本同屏仍需测试 / UIUX / UGC 按成员态实际数据复拍，本节不写通过。

### 14.51 `PR-FE-HOME-INVITE-LEDGER-CLEANUP-007` 首页 / 邀请 / 账本清理

#### 14.51.1 需求与数据边界

- 首页 `聚会待开局` 不得常驻；只有已有进行中聚会时才显示返回条。
- 首页内容区不展示 `输入口令`、`相册与分享`、`聚会账本` 三块说明型常驻入口；底部导航保留 `首页 / 相册 / 账本 / 我的`，主路径保持创建 / 加入口令 / 继续记录，真实相册保留在最近相册区。
- 邀请卡只保留口令、好友加入状态和必要动作，不再堆说明性板块。
- 进入本局后，`聚会账本` 与 `记录 / 相册 / 分享` 成为同级 tab，不再作为单独大卡或底部重复按钮。
- 账本页和局内账本优先展示授权微信昵称 / 头像或清洗后的展示名；`PR Seed Host`、`PR-BE-DB-LOGIN-SEED-005`、openId、signature、内部样本名只可保留在 storage / data，不得直出 UI、邀请卡或分享图。

#### 14.51.2 源码修复

| 文件 | 修复 |
| --- | --- |
| `miniprogram/utils/session-return.ts` | `buildSessionReturnFromRuntime()` 只有 `startedAt` 存在时返回可见进行中聚会；未开局直接返回 `EMPTY_SESSION_RETURN`，不再显示 `待开局`。 |
| `miniprogram/pages/index/index.wxml`、`index.less` | 删除首页内容区三块 `输入口令 / 相册与分享 / 聚会账本` 说明型二级入口；修正误删后保留底部导航 `首页 / 相册 / 账本 / 我的` 四项。 |
| `miniprogram/pages/invite-group/index.ts/wxml` | 邀请页新增 `joinedCount/playerCount/joinStatusText`；页面只展示房间码、加入状态、复制口令、预览分享页和拍第一张，移除步骤线、分享渠道网格和隐私说明大段。 |
| `miniprogram/pages/live-record/index.ts/wxml/less` | `activeSegment` 新增 `ledger`；tabs 改为 `记录 / 相册 / 分享 / 聚会账本` 四项同级；删除单独账本入口卡和重复底部账本按钮；`role=judge` 作为前端预览 / 测试显式发起者依据，发起者可在账本 tab 加减。 |
| `miniprogram/pages/live-record/index.ts` | 引入授权微信展示资料并增加 `cleanDisplayName()`，成员名命中 `PR Seed / PR-BE-DB-LOGIN / IT-MOMENTS / openId / signature` 时替换为 `发起人` 或 `成员 N`。 |
| `miniprogram/pages/ledger/index.ts/wxml/less` | 重写为干净账本页：展示成员头像、用户名、待整理 / 已记录两组步进器；发起者可加减并同步 runtime / 尝试同步接口；非发起者只查看；无会话时只显示产品空态和创建入口。 |

#### 14.51.3 静态证据

| 项 | 结果 |
| --- | --- |
| 首页待开局 | `session-return.ts` 已移除 `待开局` 可见返回条逻辑；`rg -n -F "聚会待开局"` 无命中。 |
| 首页入口 | `index.wxml` 已移除内容区 `home-secondary-entry`，底部导航保留 `首页 / 相册 / 账本 / 我的`；`rg -n -F "相册与分享"` 无命中。 |
| 局内 tabs | `live-record/index.wxml` 命中 `data-tab="ledger"` 和 `聚会账本`，与 `record/album/share` 同级。 |
| 数据破界防护 | `live-record/index.ts`、`ledger/index.ts` 均有 `internalDisplayPattern` 清洗 `PR Seed / PR-BE-DB-LOGIN / IT-MOMENTS / openId / signature`；扫描命中仅限清洗正则和登录 payload 字段名，不是用户可见 WXML。 |

#### 14.51.4 DevTools 9420 取证状态

- PM 已提供当前状态：`pages/live-record/index?sessionId=session-1781584437326-4b28df&role=judge`，Console `[]`；截图参数会报 `fail to capture screenshot`，测试另行复核。
- 本轮前端尝试：
  - `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/live-record/index?sessionId=session-1781584437326-4b28df&role=judge" --data activeSegment,isJudge,players,records,sessionId,sessionName,timelineNodes --output docs/runtime/pr-fe-home-invite-ledger-cleanup-007-live-record.png`：124 秒超时。
  - `npm.cmd --% run wechat:auto -- status --port 9420 --storage --data activeSegment,isJudge,players,records,sessionReturn,home,inviteCode,joinStatusText`：124 秒超时。
  - 临时清 `session-runtime` 后首页空态取证的 automator 连接命令：124 秒超时。
- 当前本机存在多个 Node / DevTools 相关进程，含 `D:\wechatkaifa\微信web开发者工具\node.exe` 和多条 `C:\Program Files\nodejs\node.exe`；前端不擅自杀进程或重启 DevTools。007 本轮只能标记为源码静态通过，预览截图 / page data 待测试恢复 DevTools 后复核。

#### 14.51.5 验证命令

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过。
- 扫描：`rg -n -F "聚会待开局" ...`、`rg -n -F "相册与分享" ...`：无命中；`rg -n "PR Seed|PR-BE-DB-LOGIN|IT-MOMENTS|signature|openId" ...`：仅命中清洗正则和登录 payload 字段。
- 目标 `git diff --check -- miniprogram/pages/index/index.wxml miniprogram/pages/index/index.less miniprogram/pages/invite-group/index.ts miniprogram/pages/invite-group/index.wxml miniprogram/pages/live-record/index.ts miniprogram/pages/live-record/index.wxml miniprogram/pages/live-record/index.less miniprogram/pages/ledger/index.ts miniprogram/pages/ledger/index.wxml miniprogram/pages/ledger/index.less miniprogram/utils/session-return.ts docs/gameplay-moments-frontend-development-plan.md`：通过，仅 Git LF/CRLF warning。

#### 14.51.6 待复核 / 依赖

- 测试需在 DevTools 9420 恢复后复跑首页空态 / 进行中态、邀请卡、局内四 tab、账本加减操作，记录 page data / Console / storage。
- 账本加减已在前端 runtime 和 `updateManagedSession()` 方向接入；真实发起者权限、actual manifest 角色和接口持久化仍需接口 / 测试提供成员态证据。
- UI/UX 需复核四 tab 和账本页主次；UGC 需复核 UI/分享图不展示 `PR Seed`、`PR-BE-DB-LOGIN`、openId、signature 等测试字段。本节不写测试 / UIUX / UGC 通过。

### 14.52 `PR-FE-LINK-CLEANUP-008` 链路收缩实装记录

#### 14.52.1 字段口径与边界

- 已消费后端/API 008 合同：`ManagedSessionMomentSummary` 新增映射 `coverPhotoUrl`、`createdAt`，兼容后端历史别名 `coverImageUrl`；首页和相册列表优先用 `coverPhotoUrl` 和 `createdAt`，封面为空时再读取 brief timeline 首张真实照片兜底，最后才回退默认封面 / 分享图。
- 图片展示与分享过滤取消前端 `reviewStatus / secondaryReviewStatus` 前置；仍保留非私密、可见、已授权分享、媒体可用等条件，不造假照片、账本或事件。
- 账本编辑仍保留现有数据结构：局内账本和账本页用 `debtCount / drinkCount` 步进器，runtime 同步并尝试 `PUT /sessions/:sessionId`；后续 `drink_debt / drink_add` 事件追加仍依赖接口 / 测试样本复核。
- Storage 中 `social-current-profile.name=PR Seed Host`、`signature=PR-BE-DB-LOGIN-SEED...` 只允许留在 storage/data，首页 / 我的页显示名新增 `PR/QA/DEV/TEST Seed` 清洗，避免测试身份直出。

#### 14.52.2 源码修复

| 文件 | 修复 |
| --- | --- |
| `miniprogram/services/operations.ts` | `RemoteSessionMomentSummary / ManagedSessionMomentSummary` 补 `coverPhotoUrl / createdAt`，normalize 时兼容 `coverImageUrl`。 |
| `miniprogram/app.json` | 恢复 `pages/tools/index`、`pages/tool-detail/index` 路由；旧 `judge/table-mode/result-report/wine-history/wine-points` 仍未重新注册。 |
| `miniprogram/pages/index/index.ts/wxml` | 最近相册优先显示首张真实照片封面与创建时间；底部保留四项导航，但把原账本入口改为 `工具箱` 并进入 `/pages/tools/index`；首页 display name 清洗 `PR Seed`。 |
| `miniprogram/pages/album/index.ts` | 相册列表同样优先用 `coverPhotoUrl`、`createdAt`，封面空时拉 brief 首张照片兜底。 |
| `miniprogram/pages/create-session/index.ts/wxml` | 创建时间显示当前实时时间；移除轻量主题选择块；创建 runtime `startedAt=Date.now()`，保留后台创建 session。 |
| `miniprogram/pages/moment-editor/index.ts/wxml/less` | 可见选项移除“仅自己”；4 项授权默认全选；说明输入压缩为最多 2 行视觉高度；新增默认文案 chip 点击填充；保存后 `redirectTo` 本局 `live-record`，不回首页。 |
| `miniprogram/pages/invite-group/index.ts/wxml` | 邀请页只保留口令、加入状态、复制口令和拍第一张；移除预览分享页入口和旧分享渠道按钮；接口失败时不展示 `0/N` 生硬状态。 |
| `miniprogram/pages/share-preview/index.ts/wxml` | 邀请预览移除“照片记录 + 聚会账本”大模块、口令安全区模块、分享 / 群 / 保存海报动作；photoHighlights 构建去掉审核前置。 |
| `miniprogram/pages/share-poster/index.ts` | 分享海报 photoHighlights 过滤去掉审核前置；保存图安全文案改为“仅展示可分享内容”，不再把待审作为用户阻塞。 |
| `miniprogram/pages/session-brief/index.ts/wxml` | `moment-timeline` 接入 `handleTimelineSelect`，点击有图节点调用 `wx.previewImage`，再次返回由原生预览层处理。 |
| `miniprogram/components/moment-card/moment-card.ts` | 不再显示“待审核 / 已审核 / 未通过 / 二审未过”等审核状态文案，避免图片审核阻塞心智。 |
| `miniprogram/pages/live-record/index.wxml`、`miniprogram/pages/ledger/index.ts/wxml` | 局内账本和账本页恢复“欠酒 / 加酒”步进器文案；移除“保存关键事件”按钮，不用事件按钮替代账本操作。 |
| `miniprogram/pages/me/index.ts/wxml` | 个人中心入口去重：相册、聚会账本、工具箱、好友管理、资料设置分流，不再大多数跳相册；底部账本入口同步改工具箱。 |
| `miniprogram/pages/tools/index.wxml`、`miniprogram/pages/tool-detail/index.ts`、`miniprogram/pages/privacy-state/index.ts` | 工具箱底部旧“酒桌判官”标签改“聚会账本”；工具详情默认二维码文案改“聚会记录师”；隐私说明去掉“待审”阻塞口径。 |

#### 14.52.3 DevTools 9420 证据

| 路径 / 命令 | 结果 |
| --- | --- |
| `npm.cmd run wechat:auto -- status --port 9420 --storage` | 当前页 `pages/index/index`，Console `[]`；storage 有 `jzp-user-token` 后 8 位 `4afb1b00`、`social-current-profile=PR Seed Host`，同时有授权微信资料 `.Li` 和头像。前端已做显示清洗，但 storage 原始字段保留给测试。 |
| `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/index/index' --data home,sessionReturn,loggedIn,userName` | 首页停在 `pages/index/index`，Console `[]`；`home.recentTools[0].imageUrl=https://api.pomer.cn/uploads/moments/...opening...webp`，证明最近相册可落真实照片封面；第二项无图保持空串，前端 fallback 默认封面。 |
| `node scripts/wechat-devtools-automator.js tap --port 9420 --path '/pages/tools/index' --selector '.tools-tile' --selectorTimeout 8000 --data toolId,toolName,toolMode,qrCode,imagePreviewSrc,toolError` | 工具箱首个工具可点击进入 `pages/tool-detail/index?id=qr-code`；data：`toolId=qr-code`、`toolName=二维码生成`、`toolMode=qr-code`、`qrCode=JZ699555`、`toolError=""`，Console `[]`。 |
| `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/session-brief/index?briefId=brief-1781756527712-95eff999' --data briefId,sessionId,timelineNodes,shareTask,loading,errorText` | 页面稳定停在 `pages/session-brief/index`，Console `[]`；当前样本返回 `loading=false`、`errorText=brief not found`、`timelineNodes=[]`，无法形成真实大图预览截图；前端事件链已接入 `wx.previewImage`，需测试用可读 brief 复拍。 |
| `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/share-poster/index?briefId=brief-1781756527712-95eff999&taskId=share-task-1781756527713-442cb75c' --data briefId,taskId,photoHighlights,accountingHighlights,keyEvents,readyShareImageUrl,shareTask,saveState,errorText` | 页面稳定停在 `pages/share-poster/index`，Console `[]`；当前 data：`shareTask.status=failed`、`failedReason=分享图暂时无法展示，请稍后重试`、`saveState=failed`、`photoHighlights=[]`、`accountingHighlights=[]`、`keyEvents=[]`、`readyShareImageUrl=""`。该样本未返回 ready/联合数据，前端不造假。 |
| 截图命令 | `--output docs/runtime/pr-fe-link-cleanup-008-*.png` 在当前 DevTools 环境报 `fail to capture screenshot`；本节只记录 page/data/Console，截图交测试右侧预览框复拍。 |

说明：`npm.cmd run wechat:auto -- relaunch --path "...&taskId=..."` 在 Windows 下会把 `&taskId` 拆成新命令，本节最终用 `node scripts/wechat-devtools-automator.js ... --path '/pages/...&taskId=...'` 取得正确 query。

#### 14.52.4 验证命令

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过。
- 目标 `git diff --check -- miniprogram/app.json miniprogram/services/operations.ts miniprogram/pages/index/index.ts miniprogram/pages/index/index.wxml miniprogram/pages/album/index.ts miniprogram/pages/create-session/index.ts miniprogram/pages/create-session/index.wxml miniprogram/pages/moment-editor/index.ts miniprogram/pages/moment-editor/index.wxml miniprogram/pages/moment-editor/index.less miniprogram/pages/invite-group/index.ts miniprogram/pages/invite-group/index.wxml miniprogram/pages/share-preview/index.ts miniprogram/pages/share-preview/index.wxml miniprogram/pages/share-poster/index.ts miniprogram/pages/session-brief/index.ts miniprogram/pages/session-brief/index.wxml miniprogram/pages/live-record/index.wxml miniprogram/pages/ledger/index.ts miniprogram/pages/ledger/index.wxml miniprogram/pages/me/index.ts miniprogram/pages/me/index.wxml miniprogram/pages/tools/index.wxml miniprogram/pages/tool-detail/index.ts miniprogram/pages/privacy-state/index.ts miniprogram/components/moment-card/moment-card.ts`：通过，仅 Git LF/CRLF warning。
- 路由扫描：`rg -n 'pages/tools/index|pages/tool-detail/index|pages/judge/index|pages/table-mode/index|pages/result-report/index|pages/wine-history/index|pages/wine-points/index' miniprogram/app.json` 只命中 `pages/tools/index`、`pages/tool-detail/index`。

#### 14.52.5 待复核 / 依赖

- 测试需用可读 008 manifest / 成员态 token 复拍：`/pages/session-brief/index?briefId=brief-1781756527712-95eff999` 或接口联调更新后的可读 brief，验证真实简报图片点击大图、再点返回简报。
- 接口 / 测试需确认 008 样本 `brief-1781756527712-95eff999` 和 `share-task-1781756527713-442cb75c` 在当前 storage 成员态下为何返回 `brief not found` / `task failed`；前端已保留安全失败态，不用假数据改成 ready。
- 保存 PNG、真实照片 + 聚会账本 + 时间线同屏仍需测试 / UIUX / UGC 在实际 ready task 上复拍；前端本轮只证明停页、字段映射、过滤口径和空态 / 失败态不破界。
- 账本 `drink_debt / drink_add` 事件追加需要接口 / 测试用真实发起人角色验证；本轮保留现有 `PUT /sessions/:sessionId` 成员计数更新，不写接口联调通过。

### 14.53 `PR-FE-LINK-CLEANUP-CLEAN-FACADE-008-FIX` clean facade 对齐

#### 14.53.1 根因与读取口径

- 已读接口联调 3.40 / `docs/runtime/pr-int-link-cleanup-PRCS-20260618-008-fix-sanitized.md`：`prcs-008` 样本未丢，`brief not found` / `task failed` 主因是 DevTools 仍指向线上 `api.pomer.cn` 或前端消费 raw legacy 路径。
- clean 聚合合同来源为：
  - `GET /api/v1/briefs/brief-1781756527712-95eff999`
  - `GET /api/v1/share-images/share-task-1781756527713-442cb75c`
- 推荐页面 query 必须保留 `sessionId=session-1781756527692-d277f0`：
  - `/pages/session-brief/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999`
  - `/pages/share-poster/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999&taskId=share-task-1781756527713-442cb75c`
  - `/pages/share-preview/index?shareId=share-return-session-1781756527692-d277f0&inviteCode=E52MK5&briefId=brief-1781756527712-95eff999`

#### 14.53.2 源码修复

| 文件 | 修复 |
| --- | --- |
| `miniprogram/services/operations.ts` | `getManagedSessionBrief()` 改为优先读 clean `/briefs/:briefId`，失败再 fallback raw `/session-briefs/:briefId`；`createManagedShareImageTask()` 优先 POST `/briefs/:briefId/share-images`；`getManagedShareImageTask()` / `retryManagedShareImageTask()` 优先读 `/share-images/:taskId`。 |
| `miniprogram/services/operations.ts` | `RemoteSessionBrief` 兼容 clean 字段 `briefId / partyId / generatedAt / photoHighlights / accountingHighlights / keyEvents`；无 raw timeline 时把 `photoHighlights` 映射为 `ManagedTimelineNode` 图片节点，把 `keyEvents` 映射为事件节点，供 `session-brief/share-poster/share-preview` 复用原 data 结构。 |
| `miniprogram/services/operations.ts` | `RemoteShareImageTask` 兼容 clean 字段 `shareImageId / partyId / renderMode / message`；normalize 后仍暴露既有 `ManagedShareImageTask.id/sessionId/layoutMode/failedReason/imageUrl/status`，不破坏 QA data。 |
| `miniprogram/pages/session-brief/index.ts` | 登录 redirect query 同时保留 `sessionId` 和 `briefId`，避免授权回流后只剩 briefId。 |
| `miniprogram/pages/share-poster/index.ts` | 分享路径含 task 时同步保留 `sessionId + briefId + taskId`，避免后续回流 / 测试只传 taskId。 |

#### 14.53.3 本地 clean facade 证据

- 本机 3221 初始未启动：`curl.exe -s -o NUL -w "%{http_code}" http://127.0.0.1:3221/api/v1/health` 返回 `000`。
- 本轮只为验证启动本地后端，未部署、未触碰 `api.pomer.cn` 或 `pomer.cn`。未带 token 访问 `/api/v1/briefs/brief-1781756527712-95eff999` 返回 `401`，符合成员态要求。
- 注入 DevTools storage 使用 memberA token，公开记录只写 token 后 8 位 `4ea6c85e`，不写完整 token；`runtime-api-base=http://127.0.0.1:3221/api/v1`。
- 只读 curl clean facade 摘要：
  - `/api/v1/briefs/brief-1781756527712-95eff999`：HTTP `200`，`photoHighlights=2`、`accountingHighlights=4`、`keyEvents=2`。
  - `/api/v1/share-images/share-task-1781756527713-442cb75c`：HTTP `200`，`status=ready`，`imageUrl=/uploads/moments/share-tasks/share-task-1781756527713-442cb75c.png`。

#### 14.53.4 DevTools 9420 状态

- Storage 已确认切到本地：`runtime-api-base=http://127.0.0.1:3221/api/v1`，`jzp-user-token` 后 8 位 `4ea6c85e`，`social-current-profile-id=user-1781756527691-ff0197`；Console `[]`。
- 但当前 DevTools 会话在代码变更后出现路由会话异常：`miniProgram.reLaunch('/pages/tools/index')` 和 `miniProgram.reLaunch('/pages/session-brief/index?...')` 均返回当前页 `pages/index/index`，未进入目标页；尝试 CLI 编译失败，`D:\wechatkaifa\微信web开发者工具\cli.bat` 不存在。
- 因上述 DevTools 会话状态，前端本轮无法给出 `session-brief/share-poster/share-preview` 的非空 page data 截图；不能写预览通过。测试需重新打开 / 重新编译 DevTools 后，用 14.53.1 query 与 memberA storage 复拍。

#### 14.53.5 验证命令

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过。
- 目标 `git diff --check -- miniprogram/services/operations.ts miniprogram/pages/session-brief/index.ts miniprogram/pages/share-poster/index.ts docs/gameplay-moments-frontend-development-plan.md`：通过，仅 Git LF/CRLF warning。

#### 14.53.6 待复核 / 008B 排队

- 待测试在可重新编译的 DevTools 9420 上复测：`photoHighlights/accountingHighlights/keyEvents` 非空、`shareTask.status=ready`、`readyShareImageUrl` 非空、简报图点击大图返回、照片 + 聚会账本同屏和保存 PNG。
- 若测试环境必须继续使用线上 `https://api.pomer.cn/api/v1`，则当前 prcs-008 本地样本不会存在；需测试按接口 3.40 切本地 base 或接口 / 后端提供线上等价样本。
- PM 新派 `PR-FE-LINK-CLEANUP-008B-UX-DELTA` 已接收但尚未实装；按 PM 指令排在本 clean facade 收口后执行，不在 14.53 中扩大源码。

### 14.54 `PR-FE-LINK-CLEANUP-008B-UX-DELTA` 用户体验差量修复

#### 14.54.1 DevTools 工具链定位

- 代码核查：`project.config.json` 的 `miniprogramRoot=miniprogram/`，`miniprogram/app.json` 已注册 `pages/tools/index`、`pages/session-brief/index`、`pages/share-poster/index`，对应页面 `index.json` 存在；未发现因 app.json 或业务路由缺失导致 relaunch 回首页。
- 14.53 遗留：`miniProgram.reLaunch('/pages/tools/index')` 和 `miniProgram.reLaunch('/pages/session-brief/index?...')` 均落回 `pages/index/index`；尝试 CLI 编译失败，`D:\wechatkaifa\微信web开发者工具\cli.bat` 不存在。
- 本轮自测：`node scripts/wechat-devtools-automator.js status --port 9420 --storage --data home,sessionReturn,loggedIn,userName` 返回 `Failed connecting to ws://127.0.0.1:9420, check if target project window is opened with automation enabled`。
- PM 并行复现：`npm.cmd run wechat:auto -- status --port 9420 --storage` 与 `npm.cmd run wechat:auto -- relaunch --port 9420 --path /pages/tools/index` 均失败，原文 `Error: Connection closed, check if wechat web devTools is still running`，堆栈来自 `miniprogram-automator/out/Connection.js`。
- 结论：当前 008B 不通过改业务路由绕工具链问题；DevTools 页面矩阵交测试在可用会话下复测。

#### 14.54.2 源码修复

| 文件 | 修复 |
| --- | --- |
| `miniprogram/pages/index/index.wxml` | 首页底部导航按 008B 最新口径收敛为 `首页 / 工具箱 / 我的`；删除底部 `相册` 常驻入口，`工具箱` 进入 `/pages/tools/index`。 |
| `miniprogram/pages/index/index.less` | `.bottom-nav` 从 4 列改 3 列；删除未使用的 `.home-secondary-entry / item / title / desc` 样式残留，避免被误判为常驻二级入口。 |

#### 14.54.3 13 项覆盖状态

| 项 | 当前状态 |
| --- | --- |
| 1 首页待开局 | 14.51 已改：`session-return` 只有 runtime `startedAt` 存在才显示返回条；本轮未改。 |
| 2 首页底部入口 | 本轮改为 `首页 / 工具箱 / 我的`，不保留底部相册 / 分享 / 聚会账本常驻入口；加入口令仍是主行动作弹窗，不是底部常驻入口。 |
| 3 最近相册第一张封面 | 14.52 已接 `coverPhotoUrl/createdAt`，空时拉 brief timeline 首张照片兜底，无照片才默认。 |
| 4 创建时间 / 去主题 | 14.52 已显示当前时间、移除轻量主题选择块；列表消费 `createdAt`。 |
| 5 邀请卡 / 邀请预览减法 | 14.52 已删邀请预览融合大模块、安全区模块、分享 / 群 / 保存海报按钮；邀请页只保留口令、加入状态、复制口令、拍第一张。 |
| 6 拍第一张回流 / 说明文案 | 14.52 已让保存后 `redirectTo live-record`；说明 textarea 压缩为 2 行视觉高度，并有默认文案 chip 填充。 |
| 7 可见授权 | 14.52 已去掉“仅自己”，4 项授权默认全选。 |
| 8 局内四 tab / 账本可编辑 | 14.51/14.52 已将 `聚会账本` 与 `记录 / 相册 / 分享` 同级；账本页和局内账本展示头像/用户名、`欠酒 / 加酒` 步进器，发起者/主持可加减；已移除“保存关键事件”按钮。 |
| 9 个人中心入口去重 | 14.52 已改成相册、聚会账本、工具箱、好友管理、资料设置分流，不再大多跳相册。 |
| 10 简报大图 | 14.52 已在 `session-brief` 接入 `moment-timeline bind:select` 和 `wx.previewImage`；真实点击返回需 DevTools 可用后复测。 |
| 11 取消图片审核阻塞 | 14.52 已去掉 `reviewStatus/secondaryReviewStatus` 前端展示过滤和“待审核/审核通过”用户文案；仍保留隐私、授权、举报边界。 |
| 12 数据破界清理 | 14.48-14.53 已清理 `PR Seed / IT-MOMENTS / brief not found / task failed / raw 字段 / 历史旧品牌` 直出；本轮扫描剩余命中仅在清洗正则、加入口令弹窗标题和工具说明。 |
| 13 工具箱可用 | 14.52 已恢复 `pages/tools/index`、`pages/tool-detail/index` 并证明第一个工具可进详情；至少 3 个工具 data 证据已在 14.52 记录 `二维码生成 / 图片压缩 / JSON 格式化 / 房贷计算 / 汇率换算`，本轮 DevTools 连接关闭，需测试复点至少 3 个工具。 |

#### 14.54.4 静态扫描与验证

- 扫描：`rg -n '聚会待开局|home-secondary-entry|输入口令|相册与分享|保存关键事件|仅自己|待审核|审核通过|PR Seed|IT-MOMENTS|brief not found|task failed|酒桌判官' ...`；核心页面剩余命中仅为清洗正则、`输入口令加入` 弹窗标题、工具箱二维码工具说明，不是底部常驻入口或用户异常文案。
- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过。
- 目标 `git diff --check -- miniprogram/pages/index/index.wxml miniprogram/pages/index/index.less docs/gameplay-moments-frontend-development-plan.md`：通过，仅 Git LF/CRLF warning。

#### 14.54.5 待测试复测矩阵

- DevTools 9420 恢复后，测试需复测：首页无进行中 / 有进行中、底部 `首页 / 工具箱 / 我的`、工具箱至少 3 个工具、邀请预览、创建页、拍第一张回流、局内四 tab、账本加减、个人中心入口、简报大图、分享页照片 + 聚会账本同屏、数据破界扫描。
- 本节不写预览通过 / UIUX 通过 / 上线通过。

### 14.55 `PR-FE-LINK-CLEANUP-008C-TOOLBOX-LIST-FALLBACK` 工具箱目录兜底修复

#### 14.55.1 退回证据与根因

- PM 复核：DevTools 9420 自动化已恢复，`/pages/tools/index` 可停页且 Console `[]`，但 `allTools=[]`、`filteredTools=[]`、`popularTools=[]`、`categoryCards=[]`；`/pages/tool-detail/index?id=qr-code` 可打开，说明详情能力存在。
- 根因：远端 `/tools/catalog` 成功但返回目录为空时，前端只消费空 remote catalog，未回退到 `miniprogram/utils/toolkit.ts` 的本地工具清单，导致列表不可见、不可点。
- 边界：远端目录为空不是前端伪造数据；本轮前端采用本地工具兜底保障工具箱可用，仍需数据运营 / 后台后续补齐远端工具目录。

#### 14.55.2 源码修复

| 文件 | 修复 |
| --- | --- |
| `miniprogram/services/operations.ts` | `getManagedToolsCatalog()` 在 remote `tools` 为空或请求异常时回退 `TOOL_LIST / TOOL_CATEGORIES / getToolCategoryCards()`，并给默认 hero 文案；不改远端合同、不伪造远端数据。 |
| `miniprogram/pages/tools/index.ts` | 页面层增加最后兜底：若服务层返回空 `catalog.tools`，直接用本地工具清单填充 `allTools / filteredTools / popularTools / categoryCards`，保证工具箱列表可见可点。 |
| `miniprogram/pages/tools/index.wxml` | 删除工具页底部重复 `聚会账本 / 酒桌判官` 入口，底部保持 `首页 / 工具箱 / 我的`，避免和局内四 tab 的聚会账本入口互相污染。 |
| `miniprogram/pages/tools/index.less` | 工具页底部网格同步为 3 列；工具列表缩小缩略图和行高，保持列表简洁。 |
| `miniprogram/utils/toolkit.ts` | 二维码工具 summary / tip 从“酒局邀人、邀局”改为“聚会邀人、邀人”，保留聚会场景但不露旧壳文案。 |

#### 14.55.3 DevTools 9420 证据

- `node scripts/wechat-devtools-automator.js status --port 9420 --storage`：返回当前页面、storage，Console `[]`。
- `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path /pages/tools/index --data allTools,filteredTools,popularTools,categoryCards,activeCategory,activeCategoryName,heroTitle,heroSubtitle`：停在 `pages/tools/index`；`allTools=9`，`filteredTools=5`，`popularTools=4`，`categoryCards=3`，`activeCategory=all`，`activeCategoryName=全部`，`heroTitle=顺手工具`，Console `[]`。
- 列表点击证据：用 automator 点击 `.tools-tile` 前 3 个卡片，均进入 `pages/tool-detail/index`，结果分别为 `image-compress / 图片压缩 / image-compress`、`text-count / 文字计数 / text-count`、`qr-code / 二维码生成 / qr-code`，`toolError=""`，Console `[]`。

#### 14.55.4 验证与待复测

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过。
- 目标 `git diff --check -- miniprogram/pages/tools/index.ts miniprogram/services/operations.ts miniprogram/utils/toolkit.ts miniprogram/pages/tools/index.wxml miniprogram/pages/tools/index.less docs/gameplay-moments-frontend-development-plan.md`：通过，仅 Git LF/CRLF warning。
- 待测试复测：工具箱入口从首页底部进入、分类筛选、至少 3 个工具详情实际交互；后台 / 数据运营需补远端 `/tools/catalog` 非空目录，本轮前端只保证本地兜底可用。

### 14.56 `PR-FE-LINK-CLEANUP-008C-QR-DETAIL-RUNTIME-COPY` 二维码详情运行态文案复核

#### 14.56.1 复核结论

- 源码扫描：`rg -n --hidden --glob '!node_modules/**' --glob '!.git/**' '适合酒局邀人|拉群/邀局|酒局邀人|邀局' .` 显示 `miniprogram` 前端源码无旧二维码文案命中；剩余命中位于历史文档、PM / 测试记录、后台历史数据和 clean slate 清单。
- 详情页数据源：`miniprogram/pages/tool-detail/index.ts` 只通过 `getToolById()` 从 `miniprogram/utils/toolkit.ts` 读取 `summary/tips`；未发现第二个前端详情数据源。
- 运行态原因：DevTools 9420 初次复跑仍返回旧 `summary=适合酒局邀人...`、`tips=拉群/邀局`；执行 compile cache 清理后仍旧。使用项目脚本强制重启自动化会话后，运行态刷新为源码新文案，判断为 DevTools 旧运行时 / 编译缓存未刷新，不需要额外源码修复。

#### 14.56.2 可复跑刷新步骤

1. `D:\wechatkaifa\微信web开发者工具\cli.bat cache --clean compile --project F:\codexlist\jiuzhuopanguan`
2. `pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420 -QuitExisting`
3. 等待 8 秒后执行：`node scripts/wechat-devtools-automator.js relaunch --port 9420 --path /pages/tool-detail/index?id=qr-code --wait 4000 --data toolId,toolName,toolMode,summary,tips,toolError`

#### 14.56.3 运行态 data 证据

- 刷新前：`toolId=qr-code`、`toolName=二维码生成`、`toolMode=qr-code`、`summary=当前提供轻量码阵预览和分享口令生成，适合酒局邀人和活动卡片场景。`、tips 含 `拉群/邀局`、`toolError=""`、Console `[]`。
- 强制重启后：`toolId=qr-code`、`toolName=二维码生成`、`toolMode=qr-code`、`summary=当前提供轻量码阵预览和分享口令生成，适合聚会邀人和活动卡片场景。`、tips 含 `拉群/邀人`、`toolError=""`、Console `[]`。

#### 14.56.4 验证

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过。
- 目标源码 `git diff --check -- miniprogram/pages/tools/index.ts miniprogram/services/operations.ts miniprogram/utils/toolkit.ts miniprogram/pages/tools/index.wxml miniprogram/pages/tools/index.less`：通过，仅 Git LF/CRLF warning。
- 前端计划为未跟踪文件，补跑 `git diff --check --no-index`：无 whitespace error。
- 本节只记录前端源码 / 运行态刷新证据，不写测试通过、UIUX 通过或上线通过。

### 14.57 `PR-FE-DEVTOOLS-COMPILE-CACHE-008D` 二维码详情缓存低风险复核

#### 14.57.1 用户 / PM 约束

- 用户确认 16:30 左右 DevTools / 自动化进程波动不是用户操作电脑导致；本轮前端只复核二维码详情旧词运行态，不继续触发工具链重启。
- 禁止把重装、全量清空开发者工具作为首选方案；优先采用低风险 compile cache 清理、重新编译、单次 relaunch 取证。

#### 14.57.2 旧词扫描与数据源判断

- `rg -n --hidden --glob '!node_modules/**' --glob '!.git/**' "适合酒局邀人|拉群/邀局|酒局邀人|邀局|聚会邀人|拉群/邀人" miniprogram docs/gameplay-moments-frontend-development-plan.md`：`miniprogram` 源码只命中 `miniprogram/utils/toolkit.ts` 的新文案 `聚会邀人 / 拉群/邀人`；旧词仅在前端计划历史清单 / 复核记录中出现。
- `miniprogram/pages/tool-detail/index.ts` 仍只从 `getToolById()` 读取工具配置，未发现另一个二维码详情前端数据源。
- 判断：旧 `酒局邀人 / 拉群/邀局` 为 DevTools 编译缓存 / 旧运行态未刷新问题，不是前端源码仍有旧数据源。

#### 14.57.3 当前运行态 data

- 本轮未重启 DevTools、未清缓存，只执行一次：`node scripts/wechat-devtools-automator.js relaunch --port 9420 --path /pages/tool-detail/index?id=qr-code --wait 2500 --data toolId,toolName,toolMode,summary,tips,toolError`。
- 返回：page=`pages/tool-detail/index`，query=`{ id: "qr-code" }`，`toolId=qr-code`，`toolName=二维码生成`，`toolMode=qr-code`，`summary=当前提供轻量码阵预览和分享口令生成，适合聚会邀人和活动卡片场景。`，tips 含 `适合场景=拉群/邀人`，`toolError=""`，Console `[]`。

#### 14.57.4 建议给测试 / PM 的低风险复跑顺序

1. 直接复跑二维码详情 data：`node scripts/wechat-devtools-automator.js relaunch --port 9420 --path /pages/tool-detail/index?id=qr-code --wait 2500 --data toolId,toolName,toolMode,summary,tips,toolError`。
2. 若仍旧，先在 DevTools 内点“编译”或执行 CLI compile cache 清理：`D:\wechatkaifa\微信web开发者工具\cli.bat cache --clean compile --project F:\codexlist\jiuzhuopanguan`。
3. 若仍旧，再用项目脚本低风险重连自动化端口：`pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420`；避免 `-QuitExisting`，除非 PM 明确允许重启会话。

#### 14.57.5 验证

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过。
- 目标源码 `git diff --check`：通过，仅 Git LF/CRLF warning；前端计划为未跟踪文件，补跑 `git diff --check --no-index` 无 whitespace error。
- 本节不写测试通过、UIUX 通过或上线通过。

### 14.58 `PR-FE-LINK-CLEANUP-008D-LIVE-RECORD-CLEANUP` 记录页清洁修复

#### 14.58.1 退回证据

- 正确成员态：DevTools 9420 storage 已由 PM 恢复为 memberA，`runtime-api-base=http://127.0.0.1:3221/api/v1`，profile `user-1781756527691-ff0197`，token 尾号 `4ea6c85e`。
- `/pages/live-record/index?sessionId=session-1781756527692-d277f0&role=member` 可读真实数据：`timelineNodes=5`，包含开场图、高光图、`drink_debt`、`drink_add` 和 1 条私密占位。
- 退回问题：记录页把所有 `timelineNodes` 当照片格子渲染，导致私密 / 无图 / 事件节点变成大白图块；“继续拍照”在卡片和底部重复；欠酒 / 加酒未以产品态进入记录页表达。

#### 14.58.2 源码修复

| 文件 | 修复 |
| --- | --- |
| `miniprogram/pages/live-record/index.ts` | 保留原始 `timelineNodes`，新增展示派生字段 `photoNodes / hiddenTimelineNotice / ledgerTimelineItems`；照片墙只取有真实 `imageUrl` 的 moment，私密 / 不可见占位收为轻量提示，`drink_debt / drink_add` 映射为中文账本动态。 |
| `miniprogram/pages/live-record/index.wxml` | 照片墙改用 `photoNodes`，移除无图大占位；新增 `账本动态` 区展示欠酒 / 加酒事件；删除卡片内重复“继续拍照”，底部 CTA 仅在记录 / 相册 tab 显示。 |
| `miniprogram/pages/live-record/index.less` | 新增私密轻提示和账本动态样式；不改局内四 tab、账本页数据结构或后端接口。 |

#### 14.58.3 DevTools 9420 data 证据

- 命令：`node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/live-record/index?sessionId=session-1781756527692-d277f0&role=member' --wait 3500 --data activeSegment,sessionId,sessionName,timelineNodes,photoNodes,hiddenTimelineNotice,ledgerTimelineItems,timelineEmptyText,timelineLoading,records,isJudge`
- 返回：page=`pages/live-record/index`，query=`{ sessionId: "session-1781756527692-d277f0", role: "member" }`，`activeSegment=record`，`isJudge=false`，`sessionName=周末聚会记录`。
- 原始 data 保留：`timelineNodes=5`，仍含开场图、高光图、私密占位、`drink_debt`、`drink_add`。
- 展示 data：`photoNodes=2`，两条均有真实图片 URL；`hiddenTimelineNotice=1 条私密记录已收起，仅在授权后展示`；`ledgerTimelineItems=2`，分别为 `欠酒记录 / 1 杯`、`加酒记录 / 1 杯`。
- Console：无 error；本轮输出仅有 `session-exit` info 日志。

#### 14.58.4 验证与待复测

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过。
- 目标 `git diff --check -- miniprogram/pages/live-record/index.ts miniprogram/pages/live-record/index.wxml miniprogram/pages/live-record/index.less`：通过，仅 Git LF/CRLF warning；前端计划为未跟踪文件，补跑 `git diff --check --no-index` 无 whitespace error。
- 待测试 / UIUX 在右侧预览框复核：照片墙是否不再出现空白图块、私密记录是否收敛为轻提示、账本动态是否清晰、重复 CTA 是否消失、账本四 tab 是否未受影响。本节不写测试通过、UIUX 通过或上线通过。

### 14.59 `PR-FE-LINK-CLEANUP-008E-LEDGER-PHOTO-RENDER-FIX` 事故后收口记录

#### 14.59.1 冻结边界

- PM 已确认用户未操作电脑；DevTools 9420 / Storage / 自动化波动归因我方操作或负责人线程操作，不能推给用户。
- 收到 `PR-PM-DEVTOOLS-INCIDENT-008E-FREEZE` 后，停止并行 DevTools 命令、清 Storage、重启开发者工具、高频 relaunch 和扩大点击矩阵。
- PM 旁证：`npm.cmd run wechat:auto -- status --port 9420 --storage --output docs/runtime/pm-devtools-incident-status-9420.png` 成功，当前页 `pages/session-brief/index`，Storage 为 memberA，token 尾号 `4ea6c85e`，Console `[]`。该旁证只代表工具恢复，不代表页面通过。

#### 14.59.2 已完成源码修复

| 文件 | 修复 |
| --- | --- |
| `miniprogram/services/operations.ts` | 对 `getManagedSessionTimeline()`、`getManagedSessionBrief()`、`createOrRefreshManagedSessionBrief()`、`getManagedSessionMomentSummaries()` 返回的照片 / 封面 / 分享图 URL 做本地缓存路径解析，保留原字段名，降低右侧预览 `<image>` 有 URL 但白卡的风险。 |
| `miniprogram/pages/ledger/index.ts` | 独立账本页支持 `sessionId/role` query 拉取 live session 和 timeline；从 `drink_debt / drink_add` 事件汇总成员欠酒 / 加酒，顶部统计显示成员 / 欠酒 / 加酒；主持视角 `role=judge` 暴露可编辑状态。 |
| `miniprogram/pages/ledger/index.wxml` | 增加账本动态同步说明和“可编辑”入口说明；成员行继续保留欠酒 / 加酒加减按钮。 |
| `miniprogram/pages/ledger/index.less` | 增加“可编辑”提示样式，不改账本数据结构。 |
| `miniprogram/pages/session-brief/index.ts` | 增加 `previewableImageCount / previewImageUrl / previewImageCount`，补 `handlePreviewFirstImageTap()`，便于 automator 用稳定 selector 证明大图预览触发。 |
| `miniprogram/pages/session-brief/index.wxml` | 在简报时间线后增加轻量 `.brief-image-preview-probe`，走同一组图片预览逻辑。 |
| `miniprogram/pages/session-brief/index.less` | 增加 `.brief-image-preview-probe` 样式。 |

#### 14.59.3 已发生 DevTools 命令与摘要

- 失败 / 误操作记录：曾并行执行 DevTools relaunch，导致同一 9420 会话竞争；其中一次 PowerShell query 未正确加引号，`&role=member` 被解释为命令分隔，报错 `The term 'role=member' is not recognized...`，并出现一次后台 Job 输出。这是我方命令构造问题，不能归因用户。
- `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/ledger/index?sessionId=session-1781756527692-d277f0&role=judge' --wait 3500 --data sessionId,sessionName,stats,players,isJudge,ledgerEditable,ledgerEventCount,hasSession`：成功停在 `pages/ledger/index`；`stats=[成员 3, 欠酒 1, 加酒 1]`，成员 A `debtCount=1`，成员 B `drinkCount=1`，`ledgerEventCount=2`，`isJudge=true`，`ledgerEditable=true`，Console `[]`。
- `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/live-record/index?sessionId=session-1781756527692-d277f0&role=member' --wait 4500 --data activeSegment,photoNodes,timelineNodes,hiddenTimelineNotice,ledgerTimelineItems,timelineLoading`：成功停在 `pages/live-record/index`；`photoNodes=2` 且图片路径为 `http://store/...` 本地缓存路径；`timelineNodes=5` 原始 data 保留；`ledgerTimelineItems=2`；Console 仅有 `session-exit` info，无 error。
- `node scripts/wechat-devtools-automator.js tap --port 9420 --path '/pages/session-brief/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999' --selector '.moment-card' ...`：失败，`Selector not found: .moment-card`。判断为自定义组件内部根节点不适合作为 page 级 selector。
- `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/session-brief/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999' --wait 4500 --data sessionId,briefId,timelineNodes,previewImageUrl,previewImageCount,errorText,loading`：成功，`timelineNodes` 中 2 条图片均为 `http://store/...` 本地缓存路径，`loading=false`，Console `[]`。
- `node scripts/wechat-devtools-automator.js tap --port 9420 --path '/pages/session-brief/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999' --selector '.brief-image-preview-probe' --selectorTimeout 8000 --wait 3000 --data sessionId,briefId,previewableImageCount,previewImageUrl,previewImageCount,loading,errorText`：成功，`previewableImageCount=2`，`previewImageUrl=http://store/...`，`previewImageCount=2`，`loading=false`，`errorText=""`，Console `[]`。

#### 14.59.4 未完成 / 待测试串行复测

- 收到冻结指令后，未继续复测 `share-poster / share-preview / album` 的图片渲染 data 和截图；这些页面已受服务层图片缓存修复覆盖，但仍需测试串行验证右侧预览是否不再白卡。
- 未继续补截图；PM 已要求不要为了补截图继续折腾工具链。
- 未检查或清理进程 / Storage / 自动化端口；冻结后不再执行会影响 DevTools 状态的命令。若测试发现残留会话异常，建议 PM 统一安排一次串行 `status --storage`，不要多线程同时 relaunch。
- 测试下一步建议串行执行：先 `status --storage` 确认 memberA / token 后 8 位；再按顺序单页复测 `ledger -> live-record -> session-brief -> share-poster -> share-preview -> album`；每次只跑一个 automator 命令，记录 page/data/Console，不并行、不清 Storage、不重启工具。

#### 14.59.5 静态验证

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过。
- 目标 `git diff --check -- miniprogram/services/operations.ts miniprogram/pages/ledger/index.ts miniprogram/pages/ledger/index.wxml miniprogram/pages/ledger/index.less miniprogram/pages/session-brief/index.ts miniprogram/pages/session-brief/index.wxml miniprogram/pages/session-brief/index.less`：通过，仅 Git LF/CRLF warning。
- 前端计划为未跟踪文件，补跑 `git diff --check --no-index`：无 whitespace error。
- 本节不写测试通过、UIUX 通过或上线通过。

### 14.60 `PR-FE-LINK-CLEANUP-008F-PHOTO-REAL-RENDER-FIX` 照片白卡静态收口

#### 14.60.1 事故冻结确认

- 收到 `PR-PM-DEVTOOLS-INCIDENT-008F-HARD-FREEZE` 后，已停止一切 DevTools 9420 操作；不再执行 `status / relaunch / tap / clearStorage / storage 注入 / 重启开发者工具 / 截图`。
- 本节只做源码静态收口、计划记录、`typecheck`、`check:encoding` 和目标 diff check。
- 用户未操作电脑；DevTools 崩溃 / 黑屏 / 断连 / Storage 污染 / 旧编译产物问题均按我方自动化或负责人线程事故处理，不归因用户。

#### 14.60.2 本轮已执行过的工具 / 运行态动作

- 串行 DevTools 取证前曾出现并行 relaunch 争用 9420 会话的问题，已在 14.59 记录；本轮 008F 中也曾在冻结令前执行过单页 `relaunch` 到 `live-record` 读取 data，返回仍为 `http://store/...`，说明运行态未刷新到当前源码或被旧编译产物影响。
- 本轮没有执行 `clearStorage`、没有注入 storage、没有重启开发者工具、没有清 token；没有写入完整 token。
- 本轮没有清理进程；收到 hard freeze 后未再检查或结束进程，避免继续触碰 DevTools 状态。
- 可能造成运行态污染的点：前序 008E 为证明图片可渲染，曾把服务层页面图片 URL 解析到 `http://store/...` 本地缓存路径；DevTools 旧编译产物可能继续运行该逻辑，导致 QA 看到 data 与源码不同步。本轮已从源码移除页面展示层的 store 替换。

#### 14.60.3 白卡根因与边界

- 本地样本文件核查：`backend/public/uploads/moments/session-1781756527692-d277f0/1781756527696-party-opening-1a4f80.webp` 与 `1781756527702-party-highlight-19e9f0.webp` 均为 `1x1` 全白 WebP，RGB min/max/mean 均为 `255`。
- 结论：当前白卡并非单纯 CSS 覆盖；样本本身为低信息白图，前端无法把它冒充为真实照片像素通过。
- 前端处理边界：有真实非白照片时继续展示真实 `imageUrl`；当图片自然尺寸过小或加载失败时，展示“聚会记录师 / 聚会照片”默认视觉兜底，避免用户看到白卡。该兜底不伪造照片数据，不能写成真实照片通过；真实照片链路需后续测试用非白样本复测。
- 旧封面来源：album 原来在无 `coverPhotoUrl` 时回退 `shareImageUrl`，可能拿到旧分享图 / 旧“酒桌判官”封面。本轮已改为无照片只显示聚会记录师默认封面，有照片时才使用第一张照片。

#### 14.60.4 已完成源码修复

| 文件 | 修复 |
| --- | --- |
| `miniprogram/services/operations.ts` | 移除页面展示层 timeline / brief / album summary 图片 URL 的 `http://store/...` 替换，恢复真实 HTTP 上传 URL 交给页面 `<image>`；保留 canvas/保存图内部下载逻辑不扩大。 |
| `miniprogram/pages/live-record/index.ts` / `index.wxml` / `index.less` | `photoNodes` 增加 `imageBroken`；图片 `bindload/binderror` 检测自然宽高小于 8px 或加载失败时显示聚会照片默认视觉，避免 1x1 白图占满照片卡。 |
| `miniprogram/components/moment-card/*` | 时间线卡片增加低信息图检测和默认视觉，覆盖 `session-brief` 图片卡。 |
| `miniprogram/pages/share-poster/index.ts` / `index.wxml` / `index.less` | 分享海报照片墙增加低信息图检测和默认视觉，保留原 `photoHighlights.imageUrl`。 |
| `miniprogram/pages/share-preview/index.ts` / `index.wxml` / `index.less` | 分享回流照片卡增加低信息图检测和默认视觉。 |
| `miniprogram/pages/album/index.ts` / `index.wxml` | 相册封面增加低信息图检测；无照片不再用 `shareImageUrl` 兜底，改显示“聚会记录师”默认封面。 |

#### 14.60.5 静态验证

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过。
- 目标 `git diff --check -- miniprogram/services/operations.ts miniprogram/pages/album/index.ts miniprogram/pages/album/index.wxml miniprogram/pages/live-record/index.ts miniprogram/pages/live-record/index.wxml miniprogram/pages/live-record/index.less miniprogram/components/moment-card/moment-card.ts miniprogram/components/moment-card/moment-card.wxml miniprogram/components/moment-card/moment-card.less miniprogram/pages/share-poster/index.ts miniprogram/pages/share-poster/index.wxml miniprogram/pages/share-poster/index.less miniprogram/pages/share-preview/index.ts miniprogram/pages/share-preview/index.wxml miniprogram/pages/share-preview/index.less docs/gameplay-moments-frontend-development-plan.md`：通过，仅 Git LF/CRLF warning。
- 不写测试通过、UIUX 通过或上线通过。

#### 14.60.6 待后续串行复测

- 测试需在工具稳定后使用非 1x1 白图样本串行复测 `live-record / session-brief / share-poster / share-preview / album`，确认真实照片像素可见。
- 若继续使用当前 prcs-008 低信息白图样本，只能验收“白图视觉兜底不再像故障白卡”，不能验收“真实照片像素通过”。
- DevTools 复测必须由 PM / 测试统一串行执行，不并行、不清 Storage、不重启工具；前端本节不再追加运行态证据。

### 14.61 `PR-FE-LINK-CLEANUP-008H-STATIC-REQUIREMENT-AUDIT-FIX` 静态需求审计与修补

#### 14.61.1 冻结边界

- PM 明确 DevTools hard freeze 仍生效；本节未执行 `status / relaunch / tap / clearStorage / storage 注入 / 截图 / 重启开发者工具`，未访问线上，未清理样本。
- 本节仅做源码静态审计、必要源码修补、前端计划记录、`typecheck`、`check:encoding` 和目标 diff check。

#### 14.61.2 需求项静态核对表

| # | 需求项 | 当前源码证据 | 修改文件 | 状态 / 待测试证据 |
| --- | --- | --- | --- | --- |
| 1 | 首页最近相册有照片取上传第一张，无照片才默认；不得回退旧 `shareImageUrl` / 旧封面 | `miniprogram/pages/index/index.ts` 通过 `getManagedSessionBrief()` 取 `coverPhotoUrl` 或 `timeline.nodes` 首张 `imageUrl`；本节移除 `item.shareImageUrl` 兜底。`album` 页 14.60 已移除 `shareImageUrl` 封面兜底。 | `miniprogram/pages/index/index.ts` | 已修复待测；需测试用非白图样本复拍首页最近相册封面。 |
| 2 | 记录 / 账本页展示欠酒 / 加酒数据并可编辑，不用“保存关键事件”替代 | `live-record` 四 tab 含 `聚会账本`；`ledger` 页从 `drink_debt / drink_add` 汇总统计并保留主持 / 发起者可编辑按钮；源码扫描未命中 `保存关键事件`。 | 无新增修改 | 静态已满足；可编辑实际写入仍需测试在成员态 / 主持态串行复测。 |
| 3 | 首页底部账本改工具箱；工具箱沿用旧工具清单且列表工具可进入使用 | 首页底部为 `首页 / 工具箱 / 我的`；`tools` 页 remote 为空时回退 `TOOL_LIST / TOOL_CATEGORIES / getToolCategoryCards()`；工具详情仍用 `tool-detail`。`miniprogram/services/home.ts` 的 `buildToolRoute()` 只服务旧首页 quick tool 占位，本轮首页 WXML 已不渲染 quick tool 区，不影响底部“工具箱”进入真实列表；若后续恢复 quick tool，需要单独改为工具详情链路。 | 无新增修改 | 静态已满足；DevTools 冻结下不复测点击，交测试恢复后验证至少 3 个工具。 |
| 4 | 个人中心入口去重，入口语义和落点一一对应 | `me` 页 `handleFeatureTap / handleAssetTap / handleWineStatTap` 分别路由到相册、账本、工具箱、好友、设置、不同相册模式，未多数跳相册。 | 无新增修改 | 静态已满足；页面跳转矩阵待测试复跑。 |
| 5 | 我创建的聚会进入聚会简报后，图片可点击大图再返回简报 | `session-brief` 已保留 `handleTimelineSelect()` 和 `.brief-image-preview-probe`，触发 `wx.previewImage()` 前写入 `previewImageUrl / previewImageCount`，供测试取 page state。 | 无新增修改 | 静态已满足；系统大图层返回需测试在 DevTools 可用时验证。 |
| 6 | 取消图片审核前置，上传后直接展示并进入相册 / 简报 / 分享链路 | 页面层无“待审核后展示 / 审核通过后可见”阻塞文案；`reviewStatus` 仅保留在服务类型和数据层；照片展示按 `imageUrl` 和隐私 / 授权过滤。 | 无新增修改 | 静态已满足；真实链路需接口样本 + 测试复拍。 |
| 7 | 创建聚会取当前实时时间并在列表展示；创建页去轻量主题选择 | `create-session` 用 `formatCreateTimeText()` 生成当前时间，`startedAt=Date.now()`；WXML 未渲染主题卡，只保留高级设置入口；聚会列表时间来自 `createdAt / updatedAt` 格式化。 | 无新增修改 | 静态已满足；列表时间展示待测试复拍。 |
| 8 | 邀请预览删“照片记录 + 聚会账本”模块、安全区模块；口令加入状态删分享 / 群 / 保存海报按钮 | `invite-group` 只剩房间码、加入状态、复制口令、拍第一张；`share-preview` 状态页只展示成员加入状态。本节把邀请预览中的“分享内容：照片与聚会账本”改为普通加入提示。 | `miniprogram/pages/share-preview/index.ts`、`miniprogram/pages/share-preview/index.wxml` | 已修复待测；确认邀请预览不再像分享模块需测试截图。 |
| 9 | 第一张保存后进入聚会进行中页；说明最多 2 行；下方默认文案点击填充 | `moment-editor` 保存成功 `redirectTo /pages/live-record/index?...`；说明为 `textarea`，预设文案 `captionPresets` 可点击填充；WXML 没有回首页逻辑。 | 无新增修改 | 静态已满足；回流页面需测试复跑。 |
| 10 | 可见与授权去掉“仅自己”；默认 4 项都选中 | `VISIBILITY_OPTIONS` 只有 `本聚会可见 / 允许分享 / 指定成员`；`CONSENT_ITEMS` 四项默认 `checked: true`，页面文案为“默认 4 项已选”。 | 无新增修改 | 静态已满足。 |
| 11 | 用户界面不得出现 `PR Seed`、`IT-MOMENTS`、`raw/debug`、接口错误原文、旧品牌主文案或测试字段 | 首页 / 相册 / 账本 / 记录页有内部字段清洗；工具详情文案已清为聚会口径。本节 `rg` 命中主要为内部变量、清洗正则、历史页面或非当前主链路旧壳；不新增可见旧词。 | 无新增修改 | 静态已满足；仍需测试做全页面肉眼扫描，旧 `restart-state/table-mode` 历史壳不在当前 app 主链路内。 |
| 12 | 分享页 / 保存图照片 + 聚会账本高光同屏并参与导出；静态确认消费真实 HTTP photo `imageUrl` | `share-poster` 从 `brief.timeline.nodes` 生成 `photoHighlights`，并从 `accountingHighlights / ledgerSummary / timelineKeyEvents` 生成账本高光；canvas 保存图下载 `item.imageUrl` 生成本地图，非仅依赖 `http://store/...`。14.60 已恢复页面展示层真实 HTTP 上传 URL，并对 1x1 白样本做低信息兜底。 | 无新增修改 | 已修复待测；真实非白照片像素和 PNG 原图必须由测试用 008G 非白样本复测。 |

#### 14.61.3 本节源码修补

| 文件 | 修补 |
| --- | --- |
| `miniprogram/pages/index/index.ts` | 首页最近相册封面只使用 `coverPhotoUrl` 或 brief 时间线首张照片，不再使用 `shareImageUrl` 兜底，避免旧分享图 / 旧“酒桌判官”封面回流。 |
| `miniprogram/pages/share-preview/index.ts` | 默认分享摘要改为普通聚会回忆口径，不再把邀请预览描述成“照片记录和聚会账本会一起进入分享页”。 |
| `miniprogram/pages/share-preview/index.wxml` | 邀请预览第三个提示项由“分享内容 / 照片与聚会账本”改为“加入提示 / 好友加入后再查看回忆”。 |

#### 14.61.4 验证要求与待复测

- 本节禁止 DevTools 取证，未提供右侧预览截图。
- 需测试在工具恢复后串行复测：首页最近相册非白图封面、邀请预览、拍第一张保存回流、局内四 tab、账本加减、简报大图、分享页 / 保存 PNG 的照片 + 聚会账本同屏。
- 008G 非白照片样本为真实照片像素准出前置；当前 1x1 白图样本只能验证低信息兜底，不能验证真实照片像素。

### 14.62 `PR-FE-LINK-CLEANUP-008I-STATIC-COPY-DATA-CLEANUP` 静态文案与残留 data 清理

#### 14.62.1 冻结边界

- DevTools hard freeze 继续生效；本节未运行 `status / relaunch / tap / clearStorage / storage 注入 / 截图 / 重启工具`，未访问线上，未 cleanup。
- 本节只清理前端可见文案、未渲染旧按钮 data / handler / 样式，并保留现有页面 data 结构和 canvas 绘制能力。

#### 14.62.2 收口点

| 缺口 | 处理 | 文件 | 数据结构影响 |
| --- | --- | --- | --- |
| 创建页仍展示“主题和高级设置可稍后调整” | 改为“更多设置可稍后调整”，不恢复主题卡、不新增主题选择入口。 | `miniprogram/pages/create-session/index.wxml` | 只改可见文案，不改创建 payload、`startedAt` 或模板数据层。 |
| `share-preview` data 仍有 `shareItems` 旧按钮 | 删除 `SharePreviewItem`、`shareItems` state、`handleSaveTap`、`handleShareTap`，避免 page data 或后续复用带回“分享给好友 / 分享到群 / 保存海报”按钮。 | `miniprogram/pages/share-preview/index.ts` | 不删除 `photoHighlights/accountingHighlights/keyEvents/shareContentFilter/filteredNodeIds/visibleNodeIds/permissionState` 等 QA / UGC data。 |
| `share-preview` LESS 仍有 `.share-action-*` 旧按钮样式 | 删除 `.share-action-grid / .share-action-item / .share-action-icon / .share-action-label` 及重复覆盖。 | `miniprogram/pages/share-preview/index.less` | 只删未渲染旧按钮样式，不影响当前邀请预览卡、状态列表、隐私提示和隐藏 canvas。 |

#### 14.62.3 静态扫描结果

- 命令：`rg -n "主题和高级设置|分享给好友|分享到群|保存海报|shareItems|handleSaveTap|handleShareTap|share-action-grid|share-action-item" miniprogram/pages/create-session miniprogram/pages/share-preview docs/gameplay-moments-frontend-development-plan.md`
- 结果：`miniprogram/pages/create-session` 与 `miniprogram/pages/share-preview` 目标源码目录不再命中上述旧文案 / 旧按钮 data / handler / style。
- 剩余命中均在 `docs/gameplay-moments-frontend-development-plan.md` 历史段落或本节扫描记录中，用于保留过程证据，不是用户可见 UI 或 page data。

#### 14.62.4 待测试证据

- 测试在 DevTools 恢复后串行复测创建页高级设置文案、邀请预览 page data 不含 `shareItems`、口令加入状态不出现“分享给好友 / 分享到群 / 保存海报”按钮。
- 本节不写页面通过、测试通过、UIUX 通过或上线通过。

### 14.63 `PR-FE-LINK-CLEANUP-008J-WAITING-ROOM-COPY-CLEANUP` 等待页旧词静态清理

#### 14.63.1 范围与边界

- DevTools hard freeze 继续生效；本节未运行 `status / relaunch / tap / clearStorage / storage 注入 / 截图 / 重启工具`，未访问线上，未 cleanup。
- 本轮只处理 `miniprogram/app.json` 已注册可达页面中 PM 静态扫描命中的可见旧词，不扩大到未注册历史页面。
- 不改业务数据结构、路由、状态机或接口字段。

#### 14.63.2 修改文件

| 文件 | 修改 |
| --- | --- |
| `miniprogram/pages/waiting-room/index.wxml` | `酒局信息` 改为 `聚会信息`。 |
| `miniprogram/pages/waiting-room/index.ts` | `酒局加载失败` 改为 `聚会加载失败`；`未找到当前酒局` 改为 `未找到当前聚会`；离开提示中的 `当前酒局` 改为 `当前聚会`。 |

#### 14.63.3 静态扫描结果

- 命令：`rg -n "酒局|酒桌判官|判官|惩罚|罚酒" miniprogram/pages/index miniprogram/pages/album miniprogram/pages/ledger miniprogram/pages/tools miniprogram/pages/tool-detail miniprogram/pages/me miniprogram/pages/create-session miniprogram/pages/invite-group miniprogram/pages/share-preview miniprogram/pages/compliance-guide miniprogram/pages/moment-editor miniprogram/pages/live-record miniprogram/pages/session-brief miniprogram/pages/share-poster miniprogram/pages/invalid-state miniprogram/pages/privacy-state miniprogram/pages/settings miniprogram/pages/friend-hub miniprogram/pages/waiting-room`
- 结果：`waiting-room` 不再命中旧词；当前可达页面仅剩 `miniprogram/pages/session-brief/index.ts` 的清洗正则和 `replace(/酒局/g, '聚会')`。
- 保留理由：`session-brief` 该命中用于把历史接口 / 样本文案中的旧词转换成“聚会”口径，防止旧数据外露，不是用户可见旧词源。

#### 14.63.4 待测试证据

- 测试在 DevTools 恢复后串行复测等待页：信息标题、加载失败 toast、未找到当前聚会 toast、返回确认文案均为“聚会”口径。
- 本节不写页面通过、测试通过、UIUX 通过或上线通过。

### 14.64 `PR-FE-LINK-CLEANUP-008L-SHARE-SAVE-COPY-CLEANUP` 分享保存页文案静态清理

#### 14.64.1 范围与边界

- DevTools hard freeze 继续生效；本节未运行 `status / relaunch / tap / clearStorage / storage 注入 / 截图 / 重启工具`，未访问线上，未 cleanup。
- 本轮只改 `miniprogram/pages/share-poster/index.wxml`、`miniprogram/pages/share-poster/index.ts` 和本前端计划；不改分享任务数据结构、不改账本 / 照片字段、不改接口合同、不改后端 renderer。

#### 14.64.2 文案替换

| 文件 | 旧文案 | 新文案 | 说明 |
| --- | --- | --- | --- |
| `miniprogram/pages/share-poster/index.wxml` | `分享海报` | `分享图` | 导航标题改为当前产品语义。 |
| `miniprogram/pages/share-poster/index.wxml` | `已保存海报` | `已保存分享图` | 保存按钮成功态统一为分享图。 |
| `miniprogram/pages/share-poster/index.wxml` | `海报已准备好分享` | `分享截图已准备好` | 保存状态说明贴合“分享截图保存”。 |
| `miniprogram/pages/share-poster/index.ts` | `分享海报` | `分享图` | `getShareLayoutText()` 默认展示文案改为分享图。 |

#### 14.64.3 数据结构未变说明

- 未改 `shareTask / readyShareImageUrl / posterImagePath / photoHighlights / accountingHighlights / keyEvents / shareContentFilter` 等 page data 和接口字段。
- `savePosterLabel`、`posterImagePath` 等内部字段名保留，避免破坏既有保存链路和 QA data；本轮只改用户可见字符串。

#### 14.64.4 静态扫描与待测

- 关键词扫描要求：目标源码 `miniprogram/pages/share-poster/index.wxml`、`miniprogram/pages/share-poster/index.ts` 不再出现用户可见 `分享海报 / 已保存海报 / 海报已准备好分享`。
- 计划文档历史段落仍可能命中“分享海报 / 保存海报”，这些是历史记录或本节替换表，不是当前用户可见源码。
- 待测试在 DevTools 恢复后串行复测分享保存页标题、保存按钮成功态、保存状态说明。本节不写页面通过、测试通过、UIUX 通过或上线通过。

### 14.65 `PR-FE-LINK-CLEANUP-008M-CREATE-TEMPLATE-RESIDUE-CLEANUP` 创建页模板残留静态清理

#### 14.65.1 范围与边界

- 本轮只处理 `miniprogram/pages/create-session/index.ts`、`miniprogram/pages/create-session/index.less`、`miniprogram/mock/home.ts` 和本前端计划；不改后端、不改接口合同、不部署、不触碰 `pomer.cn` 官网。
- 创建链路保留：微信授权、当前实时时间、人数、高级设置入口、创建并邀请、`createManagedSession()` 创建房间、进入邀请页。

#### 14.65.2 修改文件

| 文件 | 修改 | 数据结构边界 |
| --- | --- | --- |
| `miniprogram/pages/create-session/index.ts` | 删除未渲染模板链路：`TemplateItem`、`templates/templatesLoading`、`TEMPLATE_CACHE_KEY`、`mapFreeTemplates`、`loadTemplates`、`handleTemplateTap`、`query.template` 派生名称、`activeTemplate`。创建时不再传 `templateImageUrl/templateName`，runtime 也不再写模板字段。 | 不改 `sessionName/playerCount/startedAt/source/state/selectedPlayers` 等创建核心字段；后端若仍兼容模板字段，前端本轮选择不传，不破坏合同。 |
| `miniprogram/pages/create-session/index.less` | 删除未使用的 `.create-template-*`、`.create-lite-themes`、`.create-theme-*` 样式。 | 只删未渲染样式，不改当前创建页表单、时间、人数、高级设置和底部 CTA 样式结构。 |
| `miniprogram/mock/home.ts` | fallback 最近相册去掉 `free-template / 老友回忆主题 / 主题`，改成 `recent-memory / 待补充记录 / 记录` 并跳相册。 | 只改本地 fallback 展示，不改真实接口数据结构。 |

#### 14.65.3 静态扫描与未验证项

- 目标扫描：`rg -n "主题|轻量主题|TemplateItem|templatesLoading|TEMPLATE_CACHE_KEY|mapFreeTemplates|loadTemplates|handleTemplateTap|create-template|create-theme|create-lite-themes|free-template|老友回忆主题" miniprogram/pages/create-session/index.ts miniprogram/pages/create-session/index.less miniprogram/mock/home.ts`
- 结果：目标页面与 mock fallback 无命中。
- 未验证项：DevTools hard freeze 下未做创建页右侧预览和真实创建请求复测；测试需在恢复后串行验证创建并邀请链路仍可用。

### 14.66 `PR-FE-LINK-CLEANUP-008N-INVITE-COPY-COMPRESSION` 邀请预览说明压缩

#### 14.66.1 范围与边界

- 本轮只处理邀请 / 回流可见层说明压缩；不恢复“分享给好友 / 分享到群 / 保存海报 / 照片记录 / 聚会账本”等模块，不改数据结构、不改分享保存页、不改后端。

#### 14.66.2 修改文件

| 文件 | 修改 | 数据结构边界 |
| --- | --- | --- |
| `miniprogram/pages/share-preview/index.wxml` | 删除口令加入状态中的 `share-safe-tip` 文案“仅展示成员加入状态，不包含未授权照片。”，状态页只保留口令和好友加入状态。 | 不改 `joinStatusPlayers/inviteCode/inviteStatusText` 等 data。 |
| `miniprogram/pages/share-preview/index.less` | 删除 `.share-safe-tip` 两段历史样式。 | 只删未使用说明样式，不影响卡片、口令、成员状态列表和隐藏 canvas。 |

#### 14.66.3 静态扫描与未验证项

- 目标扫描：`rg -n "未授权照片|安全区|分享给好友|分享到群|保存海报|照片记录|聚会账本|share-safe-tip" miniprogram/pages/share-preview miniprogram/pages/invite-group`
- 结果：invite / share-preview 用户可见层无不合规命中。
- 未验证项：DevTools hard freeze 下未做邀请预览右侧截图；测试需恢复后串行复测口令加入状态是否只保留核心口令和成员状态。

### 14.67 `PR-FE-LINK-CLEANUP-008O-TOOLS-TABBAR-ALIGN-HOME` 工具箱底部导航对齐首页

#### 14.67.1 范围与边界

- 本轮只处理工具箱页底部导航与首页一致性，不改工具箱主体布局、不改工具目录数据、不改工具详情链路。
- DevTools hard freeze 继续生效；本节未运行 `status / relaunch / tap / clearStorage / storage 注入 / 截图 / 重启工具`。

#### 14.67.2 改动文件

| 文件 | 改动 | 对齐口径 |
| --- | --- | --- |
| `miniprogram/pages/tools/index.wxml` | 底部从 `tools-tabbar / tools-tab-item / tools-tab-icon / tools-tab-label` 改为与首页同构的 `bottom-nav / bottom-item / bottom-icon / bottom-label` 三入口；工具箱项加 `active`。 | 保留现有 tab 行为：`home -> /pages/index/index`，`tools` 当前页不跳，`me -> /pages/me/index`。 |
| `miniprogram/pages/tools/index.less` | 删除旧 `tools-tabbar / tools-tab-item / tools-tab-icon / tools-tab-label / tools-nav-*` 和四列布局；新增工具页本地 `bottom-* / nav-*` 样式，尺寸、高度、safe-area、字体、间距、active 态与首页一致。 | 底部三列、`height: calc(58px + env(safe-area-inset-bottom))`，全局可读性覆盖为 66px，与首页一致。 |

#### 14.67.3 静态扫描与未验证项

- 目标扫描：`rg -n "tools-tabbar|tools-tab-item|tools-tab-icon|tools-tab-label|tools-nav-home|tools-nav-tools|grid-template-columns: repeat\\(4" miniprogram/pages/tools/index.wxml miniprogram/pages/tools/index.less`
- 结果：目标文件无旧工具页 tab 类和四列布局残留。
- 未验证项：DevTools hard freeze 下未做右侧预览截图；测试需恢复后串行复测工具箱底部与首页底部视觉一致，以及三入口跳转行为。

### 14.68 `PR-FE-LINK-CLEANUP-008P-ME-ENTRY-DEDUP` 个人中心入口去重与底栏对齐

#### 14.68.1 范围与边界

- 本轮只处理个人中心入口去重和底栏对齐，不做个人中心整体视觉重构，不改后端、不改数据结构、不触发 DevTools。
- 保留“我创建的聚会点进去某个聚会简报”目标：待处理相册单项仍通过 `briefId/sessionId` 进入 `pages/session-brief/index`。

#### 14.68.2 入口保留 / 移除清单

| 区域 | 处理 |
| --- | --- |
| 顶部快捷区 | 保留 `创建聚会`、`工具箱`；移除重复 `我的相册`。 |
| 底部导航 | 从四项 `首页 / 相册 / 工具箱 / 我的` 改为与首页 / 工具箱一致的三项 `首页 / 工具箱 / 我的`，`我的` active。 |
| 更多设置 | 删除 `我的相册` tile；保留 `聚会账本 / 工具箱 / 好友管理 / 资料设置`。 |
| 统计区 | `相册数` 不再跳相册，提示从下方具体聚会进入；`分享图` 跳功能占位；`待处理` 不再跳相册。 |
| 最近回忆统计 | `我创建的` 跳聚会账本，`我参与的` / `我的聚友` 跳好友管理，`待分享` 跳功能占位；不再三项都进 album。 |
| 待处理相册 | 保留唯一明确 album 入口：`查看全部待处理相册` -> `/pages/album/index?mode=unshared`；单项点击仍进 `session-brief`。 |

#### 14.68.3 路由分流表

| 入口 | 路由 / 行为 |
| --- | --- |
| 底栏首页 | `/pages/index/index` |
| 底栏工具箱 | `/pages/tools/index` |
| 底栏我的 | 当前页不跳 |
| 聚会账本 | `/pages/ledger/index` |
| 工具箱 | `/pages/tools/index` |
| 好友管理 | `/pages/friend-hub/index` |
| 资料设置 | `/pages/settings/index` |
| 查看全部待处理相册 | `/pages/album/index?mode=unshared` |
| 待处理相册单项 | `/pages/session-brief/index?briefId=...` 或 `?sessionId=...` |

#### 14.68.4 静态扫描与未验证项

- 目标扫描：`rg -n 'me-tabbar|data-tab="album"|我的相册|/pages/album/index' miniprogram/pages/me/index.wxml miniprogram/pages/me/index.ts miniprogram/pages/me/index.less`
- 结果：只剩 `handlePendingAlbumAllTap()` 中 `/pages/album/index?mode=unshared`，这是本轮保留的唯一明确相册入口；`me-tabbar`、底部 `album` tab、`我的相册` 文案无命中。
- 未验证项：DevTools hard freeze 下未做右侧预览和点击复测；测试需恢复后串行验证个人中心底栏、顶部快捷区、更多设置和待处理相册单项进入简报。

### 14.69 `PR-FE-LINK-CLEANUP-008Q-TOOL-DETAIL-USABILITY-FIX` 工具详情底部断链修复

#### 14.69.1 范围与边界

- 本轮只处理工具详情页底部主按钮的不可用路由，不重构工具箱视觉、不重写全量工具 workbench、不新增页面。
- 不改后端、不改工具数据结构、不触发 DevTools、不改 PM / 测试 / UIUX 文档。

#### 14.69.2 改动文件

| 文件 | 改动 | 说明 |
| --- | --- | --- |
| `miniprogram/pages/tool-detail/index.wxml` | 底部主按钮文案从 `查看使用记录` 改为 `开始使用`。 | 避免用户点击后期待进入未实现记录页。 |
| `miniprogram/pages/tool-detail/index.ts` | `handlePrimaryTap()` 不再打开 `/pages/usage-history/index`，改为 toast：`请在上方工具区完成处理`。 | 保留工具详情内现有文字计数、JSON、房贷、汇率、单位、二维码、图片工具等 workbench；主按钮只做安全提示。 |

#### 14.69.3 为什么不新增 usage-history 页面

- `pages/usage-history/index` 当前未在 `miniprogram/app.json` 注册，也没有本轮设计 / 测试 / UIUX 验收要求。
- 为避免新增未设计页面和扩大范围，本轮只移除不可达路由入口；使用记录如后续需要，应另开独立页面设计与数据合同任务。

#### 14.69.4 静态扫描与未验证项

- 目标扫描：`rg -n "/pages/usage-history/index|查看使用记录|handlePrimaryTap" miniprogram/pages/tool-detail/index.wxml miniprogram/pages/tool-detail/index.ts miniprogram/pages/tool-detail/index.less`
- 结果：`/pages/usage-history/index`、`查看使用记录` 无命中；`handlePrimaryTap` 保留，但只显示当前工具区操作提示，不跳未注册页面。
- 未验证项：DevTools hard freeze 下未做工具详情点击复测；测试恢复后需串行验证底部 `开始使用` 不跳未注册页、`返回工具箱` 仍回 `/pages/tools/index`。

### 14.70 `PR-FE-LINK-CLEANUP-008R-MOMENT-AUTH-SEMANTIC-CLEANUP` 拍第一张授权语义收口

#### 14.70.1 范围与边界

- 本轮只处理 `moment-editor` 拍第一张页的一句话说明、可见范围 / 授权用途语义和测试可读 data 别名。
- 不改上传接口、保存接口、后端合同、图片展示链路、PM / 测试 / UIUX 文档；DevTools hard freeze 下未触发预览、截图、storage 或 relaunch。

#### 14.70.2 改动文件

| 文件 | 改动 | 说明 |
| --- | --- | --- |
| `miniprogram/pages/moment-editor/index.wxml` | 将隐私区拆成 `可见范围` 和 `授权用途` 两段；可见范围标明 `选择谁能看见`，授权用途标明 `默认 4 项全选`；授权列表改读 `authorizationOptions`。 | 明确 3 项 `visibilityOptions` 是单选范围，不再被误解为 4 项授权；4 项授权仍可点击取消 / 恢复。 |
| `miniprogram/pages/moment-editor/index.ts` | 新增 `authorizationOptions`、`selectedAuthorizations`，由既有 `consentItems` 派生；`handleConsentTap()` 同步更新三个字段。 | 保留原 `consentItems` 合同，同时给测试稳定读取“4 项授权默认全选”的别名字段。 |
| `miniprogram/pages/moment-editor/index.less` | `.moment-editor-textarea` 和 `.moment-redesign .moment-editor-textarea` 固定为两行高度；新增授权区标题间距。 | 一句话说明视觉上收缩为最多 2 行，保留 4 个默认文案 chip 点击填充。 |

#### 14.70.3 语义边界与静态证据

- `visibilityOptions`：只表示可见范围单选，当前为 `本聚会可见 / 允许分享 / 指定成员`；源码用户可见区域已无 `仅自己` 文案，历史计划中的该词仅作为退回背景 / 清理说明，不是当前页面展示。
- `authorizationOptions` / `consentItems`：表示授权用途，4 项默认 `checked=true`；`selectedAuthorizations` 用于测试读取当前选中的授权 key。
- 保存成功回流：`handleSaveTap()` 仍 `redirectTo` 到 `/pages/live-record/index?sessionId=...&role=judge`，失败兜底 `reLaunch` 到同一路径；本轮未改回首页。
- 未验证项：DevTools hard freeze 下未做右侧预览复测；测试恢复后需串行验证输入框高度、chip 填充、4 项授权默认全选、保存成功进入本局进行中页。

### 14.71 `PR-FE-LINK-CLEANUP-008T-INVITE-PREVIEW-MINIMAL-FIX` 邀请预览口令卡极简化

#### 14.71.1 范围与边界

- 本轮只处理 `share-preview` 的邀请预览 / 口令加入状态可见结构，不改 `share-poster` 保存图、不改后端接口、不改分享任务数据结构、不改 PM / 测试 / UIUX 文档。
- 分享页 / 分享截图保存仍保持照片 + 聚会账本 data 合同；本轮只是让邀请口令卡不再渲染照片墙、账本摘要、厚说明块和分享动作。

#### 14.71.2 改动文件

| 文件 | 改动 | 说明 |
| --- | --- | --- |
| `miniprogram/pages/share-preview/index.ts` | 新增 `shareReturnMode` display flag；`mode=return`、`view=return`，或存在 `briefId/shareId/taskId/shareTaskId/reportId` 任一回流标识时进入分享回流分支。 | 默认邀请预览保持极简；`sessionId + inviteCode + briefId` 这类常见回流 query 不会误进邀请口令卡，仍可消费 `photoHighlights/accountingHighlights/ledgerSummary/keyEvents/shareContentFilter` 等 data。 |
| `miniprogram/pages/share-preview/index.wxml` | `showJoinStatus=false && !shareReturnMode` 改为极简口令卡，只保留产品识别、口令主体、加入状态短文案；照片墙 / 照片空态 / 可见范围三栏 / 隐私厚块 / 举报反馈不在邀请口令卡渲染；回流风险提示文案改为“不会进入分享页”。 | `showJoinStatus=true` 仍只展示好友加入状态列表 / 空态，没有分享给好友、分享到群、保存海报按钮。 |
| `miniprogram/pages/share-preview/index.less` | 新增 `.share-invite-minimal-card` 样式，压缩口令卡高度和节奏。 | 不复用照片墙节奏，不扩大到回流页整体视觉重构。 |

#### 14.71.3 邀请预览与分享回流边界

- 邀请预览口令卡：默认分支 `!showJoinStatus && !shareReturnMode`，只展示 `聚会记录师 / 邀请好友加入 / 加入口令 / inviteStatusText`。
- 口令加入状态：`showJoinStatus=true`，只展示成员加入列表或好友加入空态；未恢复分享给好友、分享到群、保存海报按钮。
- 分享回流：`shareReturnMode=true` 时保留原照片高光、公开范围说明和举报反馈入口；触发条件为显式 `mode=return` / `view=return`，或 query 中存在 `briefId/shareId/taskId/shareTaskId/reportId` 任一回流标识。`briefId + inviteCode` 同时存在时也按分享回流处理。
- data 保留：`photoHighlights`、`photoHighlightsNotice`、`accountingHighlights`、`ledgerSummary`、`ledgerRankings`、`shareContentFilter`、`filteredNodeIds`、`visibleNodeIds` 仍在 page data 中，未删字段、未改接口合同。
- 未验证项：DevTools hard freeze 下未做右侧预览复测；测试恢复后需串行验证邀请预览 query、口令加入状态 tab、分享回流 query 三种显示分支。

### 14.72 `PR-FE-LINK-CLEANUP-008V-SHARE-RETURN-PHOTO-BROKEN` 分享回流照片破图单点修复

#### 14.72.1 范围与边界

- 本轮只处理 `share-preview` 分享回流照片 `imageBroken=true` 的前端误判，不恢复邀请口令卡照片 / 账本厚模块，不删除照片 / 账本 / 事件 data 合同。
- 不改后端接口、不改 PM / 测试 / UIUX 文档、不重复跑 008O / 008R / 纯邀请矩阵。

#### 14.72.2 改动文件与责任判断

| 文件 | 改动 | 说明 |
| --- | --- | --- |
| `miniprogram/pages/share-preview/index.ts` | 修正 `handlePhotoImageLoad()`：成功 load 但 `detail.width/detail.height` 缺失时不再误标破图；只有能读到尺寸且宽高都小于 8px 时才标记 `imageBroken=true`，否则清回 `false`。 | 008U 13.16.91 的两张照片 data 已存在，`imageBroken=true` 属前端成功回调尺寸判定过严的确定性风险；修后真实可加载图片不会因缺尺寸字段被隐藏成 fallback。 |

#### 14.72.3 保留字段与待复测

- 保留 page data：`shareReturnMode`、`photoHighlights`、`accountingHighlights`、`keyEvents`、`shareSummary`、`filteredNodeIds`、`visibleNodeIds`、`shareContentFilter`。
- 回流复测 query：`/pages/share-preview/index?sessionId=session-1781756527692-d277f0&inviteCode=E52MK5&briefId=brief-1781756527712-95eff999`。
- 预期：`shareReturnMode=true`，`photoHighlights=2`，可加载照片项不再因 load detail 缺尺寸变成 `imageBroken=true`；账本 4 项和关键事件 2 项仍保留。
- 若复测后仍 `imageBroken=true` 或预览仍白卡，则需接口联调 `PR-INT-LINK-CLEANUP-008V-SHARE-RETURN-PHOTO-SAMPLE` 核查样本 URL、图片文件尺寸 / 内容、下载域名和本地缓存路径，不得用前端 fallback 冒充真实照片通过。

### 14.73 `PR-FE-LINK-CLEANUP-008W-SHARE-RETURN-LAYOUT-FIX` 分享回流移动端裁切修复

#### 14.73.1 退回证据与范围

- PM 截图：`docs/runtime/pr-pm-link-cleanup-008v-share-return-photo-008g-auth-valid-20260618.png`。
- 已知 data 正常：`shareReturnMode=true`、`photoHighlights=2` 且 `imageBroken=false`、`accountingHighlights=4`、`keyEvents=2`、`errorText=""`、Console `[]`。
- 本轮只修 `miniprogram/pages/share-preview` 移动端布局 / 样式，不改接口字段、不改照片 / 聚会账本 / 事件 data 合同、不恢复纯邀请口令卡照片 / 账本厚模块。

#### 14.73.2 改动文件

| 文件 | 改动 | 说明 |
| --- | --- | --- |
| `miniprogram/pages/share-preview/index.less` | 在文件尾部新增 008W 覆盖层：`share-page/share-scroll` 禁止横向溢出；主卡、tabs、风险提示统一 `width/max-width:100%`；回流卡缩小圆角和内边距；标题降到移动端安全字号；照片行从横向滚动/旋转卡改为两列自适应网格。 | 解决右侧预览框内主分享卡横向裁切 / 遮挡；减少负边距、旋转和横向滚动对安全区的影响。 |

#### 14.73.3 待复测

- 推荐 query：`/pages/share-preview/index?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2&briefId=brief-1781787045693-bc8904b9`（008g 非白样本，以测试 / PM 当前 storage 为准，token 只记录尾号）。
- 复测重点：右侧预览框内主卡左右不裁切；照片区、聚会账本 / 事件相关区域仍可读；tabs 和底部安全区不遮挡；不重复 008O / 008R / 纯邀请矩阵。
- 未验证项：本轮未触发 DevTools，右侧预览截图和 data 需 PM / 测试用同一 008g query 串行复测。

#### 14.73.4 008W PM 复测退回后的补修

- PM 复测截图：`docs/runtime/pr-pm-link-cleanup-008w-share-return-layout-recheck-20260619.png`，仍见回流卡整体左溢，标题和第一张照片左侧被裁，主卡右侧贴边。
- 补修方式：继续只改 `miniprogram/pages/share-preview/index.less`；将回流相关 `tabs / share-poster-card / share020-return-card / share-risk-note` 从依赖父级 `100%` 改为 `calc(100vw - 28px)` 并居中；小屏改为 `calc(100vw - 22px)`；同时将回流卡、内容层、光效层 `left/right/transform` 归零，避免旧绝对定位、父级 padding 或背景层造成视觉偏移。
- 待复测：仍使用 008g query 单点复测右侧预览，不重复 008O / 008R / 纯邀请矩阵。

### 14.74 `PR-FE-LINK-CLEANUP-008X/008Y` 首图封面合同与审核文案静态收口

#### 14.74.1 范围与边界

- 本轮按 PM 合并派工只处理前端源码与本计划；不触发 DevTools、不改 PM / 测试 / UIUX / 接口 / UGC 文档、不做后端写入。
- `008X` 封面合同：最近相册与相册列表先从 brief timeline 选择最早 `createdAt/updatedAt` 的真实照片；时间相同优先 `opening` 节点，再以节点 id 稳定排序；只有没有可用 timeline 照片时才使用 summary `coverPhotoUrl`，再无照片则走页面默认封面。
- `008Y` 审核字段边界：`reviewStatus / secondaryReviewStatus / pendingMediaCount` 等字段可继续保留在类型、data 或接口兼容层，但普通用户 UI、相册、简报、分享入口组件不得展示“审核 / 待审 / 待补图 / 审核通过后展示”等阻断口径，也不得因为这些字段阻塞图片直显或分享链路。

#### 14.74.2 改动文件

| 文件 | 改动 | 证据口径 |
| --- | --- | --- |
| `miniprogram/pages/index/index.ts` | `findFirstBriefPhoto` 改为按 timeline 时间选择首张上传照片；`mapRecentAlbumsFromSummaries` 先取 brief 首图，再 fallback summary `coverPhotoUrl`；首页最近相册 badge 不再展示 `待补图`。 | 避免未来 summary `coverPhotoUrl` 为非首图时抢占首页封面；无照片仍由现有默认封面承接。 |
| `miniprogram/pages/album/index.ts` | 相册列表采用同样首图优先级；移除 `pendingMediaCount` 派生的“待补 X 张照片 / 待整理”文案；封面 load 成功回调缺宽高时不再误标破图，仅明确小于 8px 时标记失败。 | 相册列表不再因审核 / 待补字段形成用户阻断文案；封面优先级与首页一致。 |
| `miniprogram/pages/session-brief/index.ts` | 简报 stats 第三项改为账本数；去掉 `pendingMediaCount` 派生的“待补图后再推举 / 还有 X 条瞬间待补图”文案。 | 简报保留 `pendingMediaCount` data，但用户看到的是聚会记录与账本口径。 |
| `miniprogram/components/moment-card/*` | 去掉 `completionStatus=needs_media` 的 `待补图` 状态；无图无说明的轻文案改为“继续记录这段回忆”。 | 记录卡不再把内部补图状态直接展示给普通用户。 |
| `miniprogram/components/session-moment-summary/*` | 聚会摘要卡移除 `pendingMediaCount` 可见指标与“继续补图”按钮；只在 `canResumeMomentIds` 存在时显示“继续记录”。 | 组件仍保留 `pendingMediaCount` 字段给 data / 测试，但可见入口不再以审核或补图为主。 |

#### 14.74.3 静态验证与待测项

- 关键词扫描目标：`待审核 / 审核中 / 审核通过 / 审核通过后 / 待补图 / 待补充图片 / 继续补图` 在本轮目标前台源码中不应再作为用户可见文案出现。
- 允许残留：`pendingMediaCount / reviewStatus / secondaryReviewStatus` 作为类型、data 或服务兼容字段存在；`shareTask.status=pending` 等任务状态不属于图片审核阻断口径。
- 待测试复测：首页最近相册有图时封面为时间线最早照片；相册列表同口径；简报、聚会摘要、记录卡不再出现审核 / 待补图类用户文案；图片仍直接进入相册 / 简报 / 分享链路。

### 14.75 `PR-FE-LINK-CLEANUP-008Z-BRIEF-SHARE-COPY-CLEANUP` 简报分享入口文案清理

#### 14.75.1 范围与边界

- 本轮只处理 `miniprogram/pages/session-brief/index.wxml` 简报分享流程入口内的用户可见文案，不改照片 / 聚会账本 / 关键事件 data 结构，不删除 `.brief-share-flow-entry` 分享入口，不触发 DevTools。
- 测试退回文案：账本小卡内 `待整理 / 已记录 / 已完成并存`，问题是口径偏工程解释，影响分享入口观感。

#### 14.75.2 改动文件

| 文件 | 改动 | 说明 |
| --- | --- | --- |
| `miniprogram/pages/session-brief/index.wxml` | 将账本小卡说明从 `待整理 / 已记录 / 已完成并存` 改为 `欠酒加酒一页看清`。 | 保留“照片记录 / 聚会账本 / 关键事件一起进入分享预览”的入口结构，只清理不必要的状态并列表达。 |

#### 14.75.3 验证与待测

- 静态扫描：`miniprogram/pages/session-brief/index.wxml` 中分享入口不应再出现 `待整理 / 已记录 / 已完成并存 / 并存`。
- 待测试复测：简报分享入口文案是否更贴合“照片 + 聚会账本一起分享”的产品口径；本节不写页面通过、测试通过、UIUX 通过或上线通过。

### 14.76 `PR-FE-LINK-CLEANUP-008AC-BRIEF-PREVIEWIMAGE-URL-FIX` 简报大图预览 URL 修复

#### 14.76.1 退回证据与根因

- 用户反馈：点击“查看原图 / 查看大图”一直转圈。
- 测试 13.16.96 证据：`.brief-image-preview-probe` 点击后 page data 写入 `previewImageCount=2` 和 `previewImageUrl`，Console `[]`，但系统 `wx.previewImage` 黑色预览层停在 `1/2` 加载态。
- 前端根因：`miniprogram/pages/session-brief/index.ts` 的 `handlePreviewFirstImageTap()` 与 `handleTimelineSelect()` 直接把 `timelineNodes[].imageUrl` 传给 `wx.previewImage`；历史样本曾出现仅页面 `<image>` 可用但系统预览层不稳定的 URL / 缓存形态。

#### 14.76.2 改动文件

| 文件 | 改动 | 数据结构说明 |
| --- | --- | --- |
| `miniprogram/pages/session-brief/index.ts` | 引入 `normalizeManagedAssetPath` 与 `resolveCachedManagedImagePath`；新增 `resolvePreviewImageUrl()` / `resolvePreviewImageSet()`；`handlePreviewFirstImageTap()`、`handleTimelineSelect()` 改为预览前解析成本地缓存路径或规范 http(s) 直链，再调用 `wx.previewImage`。 | 不改 `timelineNodes[].imageUrl`、照片 / 账本 / 分享 data 结构；`previewImageUrl` 记录实际传入系统预览层的 URL，便于测试复核。 |

#### 14.76.3 待复测

- 交测试执行 `PR-QA-LINK-CLEANUP-008AC-BRIEF-PREVIEWIMAGE-RETEST` 单点复测：进入 008g 简报页，点击 `.brief-image-preview-probe` 和时间线照片卡，确认 `wx.previewImage` 不再卡在 `1/2` 加载态。
- 若仍卡住，需要接口 / 测试进一步核查图片文件本体、下载域名和微信预览层可访问性；前端本轮不改后端、不改图片数据合同。

### 14.77 `PR-FE-LINK-CLEANUP-008AD-LEDGER-FORBIDDEN-PERMISSION-FIX` 账本权限显示与 forbidden 文案修复

#### 14.77.1 退回证据与根因

- 用户截图反馈：记录 / 账本页显示“发起人可调整”，点击欠酒 / 加酒 `+/-` 后 toast `forbidden`。
- 前端根因：`ledger` 与 `live-record` 曾把 query `role=judge` 或 `runtime.isJudge` 作为可编辑依据；但后端 `PUT /api/v1/sessions/:sessionId` 只认当前 token 对应 profile 是 session host，否则返回 403。
- 修复边界：只改前端权限显示 / 点击保护 / 错误文案，不改后端、不改账本数据结构、不扩大账本重构。

#### 14.77.2 改动文件

| 文件 | 改动 | 说明 |
| --- | --- | --- |
| `miniprogram/pages/ledger/index.ts` | `hydrateLedger()` 读取 liveSession 后只用 `liveSession.hostProfileId === runtime.currentUser.id` 计算 `isJudge / ledgerEditable`；query `role=judge` 不再授予编辑权；无 liveSession fallback 时默认只读；非可编辑点击提示“当前账号只能查看账本，请发起人调整”；保存 403 转为中文“当前账号无权调整账本，请使用发起人账号”。 | UI 可编辑状态与后端 host 权限一致，避免先显示可编辑再 toast `forbidden`。 |
| `miniprogram/pages/ledger/index.wxml` | 加减按钮、编辑说明和顶部提示改用 `ledgerEditable`；非 host 显示“仅查看，请发起人调整”。 | 非 host 不展示 `+/-`。 |
| `miniprogram/pages/live-record/index.ts` | 默认 `isJudge=false`；`hydrateManagedSession()` 只按 liveSession hostProfileId 匹配当前 profile 设置可编辑；非 host 调整提示中文；保存 403 转中文。 | 记录页账本 tab 与独立账本页权限口径一致。 |

#### 14.77.3 待复测

- 测试需用同一 session 分别以 host token 和非 host token 复测：host 仍显示 `+/-` 并可保存；非 host 不显示 `+/-`，不会再出现英文 `forbidden`。
- 若 host token 仍 403，需将脱敏证据交接口 / 后端：sessionId、current profileId、liveSession.hostProfileId、token 后 8 位、接口错误原文；前端不伪造 host 权限。

### 14.78 `PR-FE-LINK-CLEANUP-008AE-CREATE-PLAYER-COUNT-EDIT` 创建页人数编辑控件

#### 14.78.1 目标与边界

- 用户要求：创建聚会页面可编辑今晚聚会人数。
- 本轮只改 `create-session` 前端展示 / 样式和本计划；不恢复轻量主题 / 模板，不改后端合同，不改创建后跳转链路。

#### 14.78.2 改动文件

| 文件 | 改动 | 说明 |
| --- | --- | --- |
| `miniprogram/pages/create-session/index.wxml` | 在创建页表单下方新增“今晚聚会人数”面板，复用 `handlePlayerCountTap`；增加稳定 selector/class：`.create-player-count-minus`、`.create-player-count-plus`、`.create-player-count-value`。 | 用户可直接看到并调整人数；原高级设置行文案改为“人数 X 人 · 可直接调整”。 |
| `miniprogram/pages/create-session/index.less` | 新增人数面板、说明文案、步进器和禁用态样式；继续复用 `.create-stepper` 基础结构。 | 2 人以下减号置灰，12 人以上加号置灰；点击仍由 TS clamp 保持 2-12。 |
| `miniprogram/pages/create-session/index.ts` | 未新增逻辑；现有 `handlePlayerCountTap()` 已做 `Math.max(2, Math.min(12, ...))`，`handleNextTap()` 已将 `playerCount` 写入 runtime 和 `createManagedSession`。 | 后端合同不变。 |

#### 14.78.3 待复测

- QA 单点复测：默认显示 `2 人`；点击 `.create-player-count-plus` 增加到 12 后不再增加；点击 `.create-player-count-minus` 减少到 2 后不再减少；创建后 runtime / 创建接口请求继续使用编辑后的 `playerCount`。
- 本节不写页面通过、测试通过、UIUX 通过或上线通过。

### 14.79 `PR-FE-LINK-CLEANUP-008AF-CREATE-NAME-PRESETS` 创建页聚会名预设填入

#### 14.79.1 目标与边界

- 用户要求：聚会名也要有预制可选填入，点击后自动填充。
- 本轮只改 `create-session` 前端展示 / 最小交互和本计划；不恢复轻量主题 / 模板，不改后端合同，不改创建后跳转。

#### 14.79.2 改动文件

| 文件 | 改动 | 说明 |
| --- | --- | --- |
| `miniprogram/pages/create-session/index.wxml` | 在聚会名输入框下方渲染 `sessionNamePresets` chips，点击调用现有 `handlePresetTap`；新增 `.create-name-preset-chip` 与 active 态类。 | 预设为 8 个聚会名：今晚的聚会、朋友小聚、复仇局、生'史'局、翻盘局、决战到天亮、家庭聚会、下班放松局；不是主题选择。 |
| `miniprogram/pages/create-session/index.ts` | `handleSessionNameInput()` 在用户手动输入时清空预设 active 态。 | 不影响手动输入；点击 chip 仍由现有 `handlePresetTap()` 写入 `sessionName` 并设置 active。 |
| `miniprogram/pages/create-session/index.less` | 新增预设 chip 行、基础态和选中态样式。 | 只服务聚会名快速填入，不改表单主结构。 |

#### 14.79.3 待复测

- QA 单点复测：点击 `.create-name-preset-chip` 后输入框自动填入对应名称并出现 active 态；随后手动输入时 active 态清除；创建请求继续使用当前输入框 `sessionName`。
- 本节不写页面通过、测试通过、UIUX 通过或上线通过。

### 14.80 `PR-FE-LINK-CLEANUP-008AG-INVITE-CARD-SHARE-AVATAR-SLOTS` 邀请卡片、分享和头像空位

#### 14.80.1 范围与边界

- 本轮只改 `invite-group` 前端源码和本计划；不改后端数据结构、不改 PM / 测试 / UIUX 文档，不恢复照片 / 账本模块、厚说明、安全区说明或保存海报按钮。
- 保留现有“拍第一张”主 CTA；邀请卡只展示口令、好友加入状态、头像空位和刷新 / 分享动作。

#### 14.80.2 改动文件与字段映射

| 文件 | 改动 | 说明 |
| --- | --- | --- |
| `miniprogram/pages/invite-group/index.ts` | 新增 `avatarSlots` data、`buildAvatarSlots()`、`hydrateLiveSession()`、`handleRefreshTap()`；`onLoad` 与刷新均调用 `getManagedLiveSession()` 更新 `joinedCount / joinStatusText / selectedPlayers / avatarSlots`。 | `avatarSlots` 优先由 `liveSession.joinedPlayers` 和 `liveSession.playerCount` 派生，缺少 joinedPlayers 时再用有头像 / 昵称 / profileId 的 `joinStatusPlayers`；不展示 raw id，昵称走清洗，空位显示 `+`。 |
| `miniprogram/pages/invite-group/index.wxml` | 邀请卡恢复头像 slot 列；inline actions 增加“刷新状态”和 `open-type="share"` 的“分享给好友”。 | 分享按钮使用小程序原生分享机制；不增加群分享 / 保存海报入口。 |
| `miniprogram/pages/invite-group/index.less` | 新增头像 slot、已加入态、昵称首字 fallback、三列 inline actions 和 button reset 样式。 | 保持邀请页简洁，不恢复旧分享网格厚卡。 |

#### 14.80.3 分享 path 与合同缺口

- `onShareAppMessage()` 现有分享 path 保持：`/pages/index/index?inviteCode=<inviteCode>&sessionId=<sessionId>`，已带 `sessionId` 与 `inviteCode`。
- 合同缺口：好友点击分享后是否能自动加入该局，需要接口 / 后端 / 测试验证首页回流 join 合同；前端本轮不伪造 joined 状态，也不在点击分享后本地写入已加入。
- 头像 slot 规则：按 `playerCount` 固定数量渲染；优先用 `joinedPlayers` 前序填充头像 / 昵称首字，缺少 joinedPlayers 时再用有效 `joinStatusPlayers`；未加入槽位为空态 `+`；手动刷新只重新拉取当前 live session，不清 storage、不重建 session。

#### 14.80.4 待复测

- QA 单点复测：邀请页显示口令、加入状态、固定头像空位；点击“刷新状态”后 page data 中 `joinedCount / joinStatusText / avatarSlots` 更新；点击“分享给好友”触发小程序分享，分享 path 带 `sessionId` 与 `inviteCode`；“拍第一张”仍进入 opening 拍照页。
- 本节不写页面通过、测试通过、UIUX 通过或上线通过。

### 14.81 `PR-FE-LINK-CLEANUP-008AI-INVITE-SHARE-BUTTON-LAYOUT-FIX` 邀请页分享按钮布局修复

#### 14.81.1 退回原因与边界

- 用户反馈：邀请页“分享给好友”按钮写破界面。
- 根因：`复制口令 / 刷新状态 / 分享给好友` 同在 `.invite-inline-actions` 三列 grid 内，原生 button 在小屏下容易挤压破界。
- 本轮只改 `miniprogram/pages/invite-group/index.wxml`、`index.less` 和本计划；不改业务 data、不改 join 合同、不改 `onShareAppMessage()` path。

#### 14.81.2 改动文件

| 文件 | 改动 | 说明 |
| --- | --- | --- |
| `miniprogram/pages/invite-group/index.wxml` | `复制口令 / 刷新状态` 保留在 `.invite-inline-actions`；`分享给好友` 拆出为下置独占一行 `button.invite-share-button`，内部加入 `.invite-icon-wechat` 图标节点，保留 `open-type="share"`。 | 不恢复照片 / 账本厚模块、海报按钮或说明堆叠。 |
| `miniprogram/pages/invite-group/index.less` | `.invite-inline-actions` 改为 2 列；`.invite-share-button` 设为 100% 宽、54px 高、微信绿 `#07c160`、白字、16px 字号、图标文字居中；图标复用 `.invite-icon-wechat` 并转白。 | 375 / 390 宽下不与其他按钮同列挤压，触控面积足够。 |

#### 14.81.3 待复测

- QA 单点复测：邀请页复制 / 刷新在上方一行；分享按钮下置独占一行，绿色、白字、带图标；不横向溢出，不遮挡底部“拍第一张”；点击仍触发小程序分享。
- 本节不写页面通过、测试通过、UIUX 通过或上线通过。

### 14.82 `PR-FE-LINK-CLEANUP-008AJ-INVITE-CODE-BOOKMARK-PAPER-INTEGRATE` 房间码书签纸页资产待接入

#### 14.82.1 当前状态与边界

- 用户要求：房间码背景框改成“书签纸页效果”，右下角有一点卷起。
- PM 已派 UI/UX 资产任务：`PR-UX-LINK-CLEANUP-008AJ-INVITE-CODE-BOOKMARK-PAPER-ASSET`。
- 当前状态：前端登记待资产，资产未回包前不自造半成品、不扩改邀请页结构、不改 `invite-group` 源码。

#### 14.82.2 计划接入范围

| 项 | 计划 |
| --- | --- |
| 资产路径 | 等 UI/UX 回包后记录实际路径，预计接入 `miniprogram/assets/party-recorder/` 或 UI/UX 指定目录。 |
| 改动文件 | 优先只改 `miniprogram/pages/invite-group/index.less`；如资产需要额外包裹，再小范围改 `miniprogram/pages/invite-group/index.wxml`。 |
| 选择器 | 优先接入 `.invite-code-card` 背景、`::before` / `::after` 或新增局部角标选择器，保留当前房间码、加入状态、头像槽、复制 / 刷新、微信绿分享按钮、拍第一张 CTA 结构。 |
| 回退样式 | 保留现有渐变 + `party-recorder-share-bg.webp` / 纯色纸面 fallback；资产缺失时文字仍可读，不白屏。 |
| 视觉约束 | 390 宽不横向溢出；右下角卷页不遮挡房间码、加入状态、头像槽、分享按钮或底部“拍第一张”。 |

#### 14.82.3 阻塞与验证

- 阻塞：等待 UI/UX `PR-UX-LINK-CLEANUP-008AJ-INVITE-CODE-BOOKMARK-PAPER-ASSET` 回包可入包资产路径、尺寸、安全区说明。
- 资产回收后验证命令：`npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check -- miniprogram/pages/invite-group/index.less miniprogram/pages/invite-group/index.wxml docs/gameplay-moments-frontend-development-plan.md`。
- 不改 join 合同、不改后端接口、不恢复照片 / 账本厚模块、不引入旧“酒桌判官”对外文案。

### 14.83 `PR-FE-LINK-CLEANUP-008AK-NATIVE-SHARE-CARD-THUMB` 原生分享卡缩略图待规格

#### 14.83.1 当前状态与边界

- 用户截图反馈：微信原生“发送给好友”弹窗里的分享卡片预览，也应显示书签纸页背景，并包含邀请码和头像槽 / 已加入头像。
- PM 定点核查：`miniprogram/pages/invite-group/index.ts` 的 `onShareAppMessage()` 当前返回 `imageUrl: ''`，原生分享面板只能显示默认小程序缩略图。
- 当前状态：等待 UI/UX `008AJ/008AK` 资产或 canvas 规格回包；未回包前只登记待资产 / 待规格，不实现临时图生成，不自造半成品。

#### 14.83.2 计划实现范围

| 项 | 计划 |
| --- | --- |
| 改动文件 | 预计 `miniprogram/pages/invite-group/index.ts` 增加 `shareCardImagePath`、canvas 生成 / fallback 逻辑；`index.wxml` 可能需要隐藏 canvas；`index.less` 只做隐藏 canvas 或安全样式；本计划同步记录。 |
| `imageUrl` 来源 | 优先在邀请页数据加载后生成本地临时分享缩略图：canvas 绘制 UI/UX 书签纸页底图 + `inviteCode` + 头像槽 / 已加入头像，然后 `onShareAppMessage()` 返回 `shareCardImagePath`。 |
| 生成失败 fallback | 如果 canvas 生成失败、头像跨域 / 临时路径不可绘制、资产缺失，则返回 UI/UX 指定静态 fallback 或空字符串；分享 path 仍可用，不阻塞分享。头像无法绘制时使用占位头像槽，不让分享失败。 |
| 分享 path | 继续使用 `/pages/index/index?inviteCode=<inviteCode>&sessionId=<sessionId>`，必须保留 `inviteCode` 和 `sessionId`，不破坏好友点击后的 join 回流合同。 |
| 禁止事项 | 不改后端接口、不恢复照片 / 账本厚模块、不泄露完整 token、不伪造已加入头像。 |

#### 14.83.3 待规格与验证

- 等待 UI/UX 回包：原生分享缩略图尺寸、书签纸页底图路径、安全区、字体 / 字号、头像槽数量与右下角卷页遮挡边界。
- 资产 / 规格回收后验证命令：`npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check -- miniprogram/pages/invite-group/index.ts miniprogram/pages/invite-group/index.wxml miniprogram/pages/invite-group/index.less docs/gameplay-moments-frontend-development-plan.md`。
- 待测试复测：DevTools / 微信原生分享面板能看到缩略图；缩略图含书签纸页背景、邀请码、头像槽；分享 path 仍带 `sessionId` 与 `inviteCode`。

### 14.84 `PR-FE-LINK-CLEANUP-008AJ-008AK-BOOKMARK-CARD-AND-NATIVE-SHARE-THUMB-INTEGRATE` 书签纸页卡片与原生分享缩略图接入

#### 14.84.1 资产入包

| 用途 | UI/UX 源路径 | 小程序入包路径 |
| --- | --- | --- |
| 页面房间码书签纸页背景 | `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008aj-invite-bookmark-card-750x420.png` | `miniprogram/assets/party-recorder/pr-cs008aj-invite-bookmark-card-750x420.png` |
| 原生分享卡缩略图底图 | `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008ak-native-share-thumb-1000x800.png` | `miniprogram/assets/party-recorder/pr-cs008ak-native-share-thumb-1000x800.png` |

#### 14.84.2 改动文件

| 文件 | 改动 | 说明 |
| --- | --- | --- |
| `miniprogram/pages/invite-group/index.less` | `.invite-code-card` 背景替换为 008AJ 书签纸页 PNG，并保留渐变纸面 fallback；新增 `.invite-share-card-canvas` 隐藏 canvas 样式。 | 390 宽仍按卡片 100% 布局，不横向溢出；右下角卷页由资产承载，不遮挡头像槽和按钮。 |
| `miniprogram/pages/invite-group/index.wxml` | 新增隐藏 canvas `canvas-id="inviteShareCardCanvas"`；不改变房间码、加入状态、头像槽、复制 / 刷新、微信绿分享按钮、拍第一张 CTA 结构。 | canvas 不参与可见布局。 |
| `miniprogram/pages/invite-group/index.ts` | 新增 `shareCardImagePath`、`generateShareCardImage()`；邀请页加载 / 刷新后用 canvas 绘制 5:4 分享缩略图，`onShareAppMessage()` 返回 `shareCardImagePath || 008AK fallback asset`。 | 分享 path 保持 `/pages/index/index?inviteCode=<inviteCode>&sessionId=<sessionId>`；不改 join 合同。 |

#### 14.84.3 Canvas 生成策略与 fallback

- Canvas 逻辑尺寸：`500x400`，导出 `destWidth=1000 / destHeight=800`，符合 UI/UX 5:4 缩略图规格。
- 绘制内容：008AK 底图、聚会标题、邀请说明、邀请码、加入状态、最多 8 个头像槽。
- 安全区：邀请码居中绘制在 `y≈212`，头像槽在 `y≈292`；右下角卷角区域不放邀请码和头像。
- 头像策略：优先使用已加入玩家昵称首字 / 占位槽绘制；不强行绘制跨域头像，避免 canvas 污染或生成失败。
- 失败 fallback：canvas 生成失败、资产缺失或头像不可绘制时，`shareCardImagePath` 置空，`onShareAppMessage()` 使用静态 008AK 底图；分享 path 仍可用。

#### 14.84.4 待复测

- 待 QA / PM 用 DevTools 或微信原生分享面板确认：页面内房间码卡片已显示书签纸页背景；原生“发送给好友”弹窗缩略图不再是默认小程序图，能看到 008AK 背景 / 邀请码 / 头像槽。
- 待接口 / 测试继续确认：好友点击分享 path 后是否自动加入该局；前端本轮不伪造 joined 状态。
- 本节不写页面通过、测试通过、UIUX 通过或上线通过。

### 14.85 `PR-FE-LINK-CLEANUP-008AL-INVITE-CODE-PAPER-CURL-STRENGTHEN-INTEGRATE` 房间码纸页卷角强化待资产

#### 14.85.1 当前状态与边界

- 测试 13.16.111 已收口：008AK 原生分享弹窗缩略图预览框阶段通过；008AJ 页面内房间码卡片可读性和按钮无遮挡通过。
- 退回点：390 宽预览中书签纸页 / 右下角卷起不够明确，需要 UI/UX 强化资产。
- 当前状态：等待 UI/UX `PR-UX-LINK-CLEANUP-008AL-INVITE-CODE-PAPER-CURL-STRENGTHEN-ASSET` 回包；资产未回包前不自造半成品、不改源码、不把登记写成已实现。

#### 14.85.2 待执行范围

| 项 | 计划 |
| --- | --- |
| 改动文件 | 预计只改 `miniprogram/pages/invite-group/index.less` 和本计划；如 UI/UX 资产要求新增文件，则仅替换页面内 `.invite-code-card` 背景资源和必要样式。 |
| 保持不变 | `onShareAppMessage()` path、`inviteCode/sessionId`、join 合同、头像槽 data 结构、分享 canvas 逻辑、复制 / 刷新 / 拍第一张 CTA。 |
| 禁止事项 | 不恢复照片 / 账本厚模块，不改首页 / 账本 / 相册 / 分享页矩阵，不改后端接口。 |
| 验证命令 | 资产回包后运行 `npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check -- miniprogram/pages/invite-group/index.less docs/gameplay-moments-frontend-development-plan.md`，如有新增资产需纳入目标检查和路径记录。 |

### 14.86 `PR-FE-LINK-CLEANUP-008AM-INVITE-PAPER-ASSET-EXACT-INTEGRATE` 邀请页纸页素材精确接入

#### 14.86.1 修复原因与边界

- 本节为 008AM 旧背景图方案记录；PM 退回后已由 14.87 的真实 `<image>` 图层方案覆盖，后续以前端 14.87 红线为准。
- PM 放行 008AM 最小修复：页面内房间码卡片必须真实呈现 UI 已入包纸页素材，不能用 CSS 渐变覆盖主视觉。
- 根因：`.invite-code-card` 旧写法把半透明 `linear-gradient(...)` 放在 PNG 背景前一层，正常渲染时会压淡纸页细节，造成“像样式假生成”的观感。
- 本轮只改 `miniprogram/pages/invite-group/index.less` 和本计划；不改 `onShareAppMessage()`、分享 path、join 合同、头像槽 data 结构、分享 canvas、复制 / 刷新 / 拍第一张 CTA。

#### 14.86.2 改动文件与素材路径

| 文件 | 改动 | 说明 |
| --- | --- | --- |
| `miniprogram/pages/invite-group/index.less` | `.invite-code-card` 背景改为 `#fff6e8 url("/assets/party-recorder/pr-cs008aj-invite-bookmark-card-750x420.png") center / 100% 100% no-repeat;`。 | UI PNG 成为正常路径主视觉；`#fff6e8` 只作为图片加载失败时的底色兜底，不覆盖 PNG。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 新增 14.86 记录。 | 只记录前端 008AM 修复证据，不写测试 / UIUX / 上线通过。 |

#### 14.86.3 验证与待复测

- 待运行验证：`npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check -- miniprogram/pages/invite-group/index.less docs/gameplay-moments-frontend-development-plan.md`。
- 待扫描确认：`.invite-code-card` 正常路径直接引用 `/assets/party-recorder/pr-cs008aj-invite-bookmark-card-750x420.png`，该 block 内不再有覆盖式 `linear-gradient` 写在 URL 前面。
- 待 QA 008AM 单点复测：邀请好友页房间码卡片能看到 UI 纸页 PNG 细节；文字仍可读；复制 / 刷新 / 微信绿分享 / 拍第一张 CTA 不受影响。

### 14.87 `PR-FE-LINK-CLEANUP-008AO-INVITE-PAPER-REAL-IMAGE-LAYER` 邀请页纸页真实图层修复

#### 14.87.1 退回原因与最终口径

- 本节记录 008AO 第一轮真实 image 图层修复；PM 后续正式放行 UI/UX 008AP 用户指定手机适配压缩版，见 14.88，后续以前端 14.88 固定资产路径为准。
- PM 退回 008AM：源码引用 WXSS 背景图不能作为完成证据，用户预览中仍像浅色块，纸页纹理和右下角卷页不可见。
- PM 修正最终口径：使用 UI 第一次生成并已锁定的 008AJ 原图 `miniprogram/assets/party-recorder/pr-cs008aj-invite-bookmark-card-750x420.png`，不要改用 008AL 强化版。
- 用户补充硬性红线：前端不要再做 UI 界面和交互的兜底策略；资源加载失败、路径不对、层级遮挡、数据字段缺失、交互不可达时，必须修正根因或标阻塞，不得用 CSS 近似、浅色底、默认块、伪元素、替代文案、替代交互或 fallback layout 冒充 UI 生图实现。
- 因此本轮 `.invite-code-card` 不再使用 WXSS 背景图、背景色、伪元素或 CSS 胶带作为纸页主视觉 / fallback；若 `<image>` 图层仍看不到 008AJ 纸页边缘、纸感和右下角卷页，需要继续修渲染方式、尺寸、层级、裁切或资源路径，不能交浅色块。

#### 14.87.2 改动文件

| 文件 | 改动 | 说明 |
| --- | --- | --- |
| `miniprogram/pages/invite-group/index.wxml` | 在 `.invite-code-card` 内新增真实 `<image class="invite-code-card-image" src="/assets/party-recorder/pr-cs008aj-invite-bookmark-card-750x420.png" mode="scaleToFill">`，并把房间码、加入状态、头像槽包进 `.invite-code-content`。 | UI 008AJ PNG 作为小程序稳定可渲染 image 图层，位于内容下方；保留 `inviteCode / joinStatusText / avatarSlots`。 |
| `miniprogram/pages/invite-group/index.less` | `.invite-code-card` 只负责定位、尺寸、裁切和内容容器；移除 WXSS `background:url(...)` 与背景色；新增 `.invite-code-card-image` 绝对铺满、`.invite-code-content` 上层内容样式；移除 CSS 胶带节点样式。 | 不再用 CSS 背景图 / 渐变 / 伪元素伪造纸页或卷角。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 新增 14.87 记录。 | 14.87 覆盖 14.86 的背景图完成口径。 |

#### 14.87.3 保持不变与待复测

- 保持不变：`onShareAppMessage()`、分享 path、join 合同、头像槽 data 结构、分享 canvas、复制 / 刷新 / 微信绿分享 / 拍第一张 CTA。
- 待验证命令：`npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check -- miniprogram/pages/invite-group/index.wxml miniprogram/pages/invite-group/index.less docs/gameplay-moments-frontend-development-plan.md`。
- 待截图 / automator 证据：邀请好友页右侧预览需要能直接看到 008AJ 原图纸页边缘、纸感和右下角卷页；如果本地 3221 拒绝连接导致邀请码仍显示“生成中”，只影响数据文案，不作为回避纸页图层复测的理由。

### 14.88 `PR-FE-LINK-CLEANUP-008AO-INVITE-PAPER-REAL-IMAGE-LAYER` 008AP 用户标准图接入

#### 14.88.1 固定资产与执行边界

- PM 运行态退回：`docs/runtime/pr-pm-008ao-invite-paper-current.png` 显示 008AP 图片外侧棋盘格可见，用户明确退回“不要棋盘格！裁切错误！”。因此 14.88 不得写为运行态通过，当前状态改为“运行态退回 / 等 UI/UX 008AQ 新固定资产”。
- UI/UX 008AP 已回包并经 PM 只读核验；前端固定源图为 `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008ap-user-approved-invite-paper-mobile-750w-compressed.png`，尺寸 `750x400`，大小 `371,374 bytes`。
- 入包路径：`miniprogram/assets/party-recorder/pr-cs008ap-user-approved-invite-paper-mobile-750w-compressed.png`。
- 本轮只引用 UI/UX 确认的手机适配压缩版固定资产；不自行压缩、重绘、换图、裁切、拉伸变形、调色、去透明区或改变胶带 / 卷角 / 纸张轮廓。
- 禁止用 WXSS background、浅色块、CSS 近似、伪元素或兜底样式作为主视觉；如资源加载、尺寸或包体仍不满足，退回 PM / UI/UX，不由前端替换图。

#### 14.88.2 改动文件

| 文件 | 改动 | 说明 |
| --- | --- | --- |
| `miniprogram/assets/party-recorder/pr-cs008ap-user-approved-invite-paper-mobile-750w-compressed.png` | 新增 UI/UX 008AP 固定资产入包。 | 用户指定图手机适配压缩版；前端不改图。 |
| `miniprogram/pages/invite-group/index.wxml` | `.invite-code-card-image` 的 `src` 改为 `/assets/party-recorder/pr-cs008ap-user-approved-invite-paper-mobile-750w-compressed.png`，`mode` 改为 `aspectFit`。 | 真实 `<image>` 图层位于文字和头像槽下方；`aspectFit` 保证完整显示，不裁切、不拉伸变形。 |
| `miniprogram/pages/invite-group/index.less` | 沿用 14.87 真实图层层级：`.invite-code-card` 只做容器，`.invite-code-card-image` 绝对铺满，`.invite-code-content` 位于上层。 | 不恢复 WXSS 背景图或 CSS 胶带。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 新增 14.88 记录。 | 14.88 覆盖 14.87 的 008AJ 过渡图路径。 |

#### 14.88.3 保持不变与待复测

- 保持不变：`inviteCode`、`joinStatusText`、`avatarSlots`、复制 / 刷新、微信绿分享、拍第一张 CTA、`onShareAppMessage()` path、join 合同、分享 canvas。
- 待验证命令：`npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check -- miniprogram/assets/party-recorder/pr-cs008ap-user-approved-invite-paper-mobile-750w-compressed.png miniprogram/pages/invite-group/index.wxml miniprogram/pages/invite-group/index.less docs/gameplay-moments-frontend-development-plan.md`。
- 运行态退回证据：PM 截图 `docs/runtime/pr-pm-008ao-invite-paper-current.png` 可见图片外侧棋盘格，说明当前 008AP 固定资产 / 适配结果不满足用户最终视觉要求；前端不得自行裁切、去棋盘格、重绘、换图、调色、压缩变样或用 CSS 背景兜底。

### 14.89 `PR-FE-LINK-CLEANUP-008AQ-INVITE-PAPER-NO-CHECKERBOARD-INTEGRATE` 等待无棋盘格固定资产

#### 14.89.1 当前状态与前端边界

- PM 已新派 UI/UX `PR-UX-LINK-CLEANUP-008AQ-INVITE-PAPER-NO-CHECKERBOARD-ASSET`，前端等待 UI/UX 回包固定资产后再执行。
- 前端不得继续在 008AO 内自修图片；不得自行裁切、去棋盘格、重绘、换图、调色、压缩变样或用 CSS 背景兜底。
- 008AQ 前端只允许入包并引用 UI/UX 确认的新固定图，调整容器、`mode`、层级以完整显示；如新图仍有尺寸 / 透明区 / 包体问题，退回 PM / UI/UX，不由前端替代处理。

#### 14.89.2 保持不变与待执行

- 保持不变：`inviteCode`、`joinStatusText`、`avatarSlots`、复制 / 刷新、微信绿分享、拍第一张 CTA、分享 path、join 合同、分享 canvas 和现有 data 结构。
- 待 UI/UX 008AQ 回包后执行：入包固定资产、替换 `.invite-code-card-image` 的 `src`，必要时只调整 `.invite-code-card` 容器、`.invite-code-card-image` 的 `mode` / 层级 / 尺寸。
- 待验证命令：`npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check` 覆盖新固定资产、`miniprogram/pages/invite-group/index.wxml`、`miniprogram/pages/invite-group/index.less` 和本计划。

### 14.90 `PR-FE-LINK-CLEANUP-008AQ-INVITE-PAPER-NO-CHECKERBOARD-INTEGRATE` 无棋盘格纸页固定图接入

#### 14.90.1 固定资产与边界

- UI/UX 12.7.50 已回包并经 PM 只读核验；前端固定源图为 `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008aq-invite-paper-mobile-750w-no-checkerboard.png`，尺寸 `750x400`，大小 `371,857 bytes`，透明 PNG。
- PM 像素核验：边角 alpha=0，纸页主体、顶部胶带、右下卷页像素存在；图片查看器显示透明棋盘格不等于 PNG 内有棋盘格像素。
- 入包路径：`miniprogram/assets/party-recorder/pr-cs008aq-invite-paper-mobile-750w-no-checkerboard.png`。
- 本轮只引用 UI/UX 确认的新固定图；不自行裁切、去棋盘格、重绘、换图、调色、压缩变样或用 CSS 背景兜底。

#### 14.90.2 改动文件

| 文件 | 改动 | 说明 |
| --- | --- | --- |
| `miniprogram/assets/party-recorder/pr-cs008aq-invite-paper-mobile-750w-no-checkerboard.png` | 新增 008AQ 固定资产入包。 | 前端不改图、不二次压缩。 |
| `miniprogram/pages/invite-group/index.wxml` | `.invite-code-card-image` 的 `src` 改为 `/assets/party-recorder/pr-cs008aq-invite-paper-mobile-750w-no-checkerboard.png`，`mode` 改为 `widthFix`。 | 用真实 `<image>` 图层等比显示 750:400 图片，不裁切、不拉伸。 |
| `miniprogram/pages/invite-group/index.less` | `.invite-code-card` 改为 `display:block`，由图片自然高度撑开；`.invite-code-card-image` 文档流内 `width:100%; height:auto;`；`.invite-code-content` 绝对覆盖在图层上。 | 不使用 WXSS background / 浅色块 / CSS 近似作为主视觉。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 新增 14.90 记录。 | 14.90 关闭 14.89 等待项，覆盖 14.88 008AP 退回图路径。 |

#### 14.90.3 保持不变与待复测

- 保持不变：`inviteCode`、`joinStatusText`、`avatarSlots`、复制 / 刷新、微信绿分享、拍第一张 CTA、`onShareAppMessage()` path、join 合同、分享 canvas 和现有 data 结构。
- 待验证命令：`npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check -- miniprogram/assets/party-recorder/pr-cs008aq-invite-paper-mobile-750w-no-checkerboard.png miniprogram/pages/invite-group/index.wxml miniprogram/pages/invite-group/index.less docs/gameplay-moments-frontend-development-plan.md`。
- 待截图证据：邀请好友页右侧预览需看到无真实棋盘格像素、顶部胶带、纸纹、圆角、右下角卷页完整，口令 / 头像槽 / 分享按钮 / 拍第一张 CTA 不遮挡。

### 14.91 `PR-FE-LINK-CLEANUP-008AN-RECORD-LEDGER-TIMELINE-IMPLEMENT` 记录 / 账本统一明线时间线

#### 14.91.1 前置证据与实现边界

- PM / 用户已退回本节视觉完成判定：14.91 只能保留为“数据结构和基础时间线实现已做”，不得写视觉通过或 1:1 复刻完成。
- 用户新验收图路径：`C:\Users\Administrator\AppData\Local\Temp\codex-clipboard-f12866c8-21f4-427c-aafb-6fa051890f60.png`。要求仍跟 UI 做图一致，必须使用 UI 给出的所有页面元素，包括整页背景、炫光、按钮、状态、实景 header、拍立得 / 纸质照片框、胶带 / 贴纸、霓虹欠酒 / 加酒状态牌和底部大号纸质按钮。
- 当前前端停止继续自修视觉，等待 UI/UX `PR-UX-LINK-CLEANUP-008AR-RECORD-LEDGER-FULL-ASSET-PACK` 输出完整资产包后，再执行 `PR-FE-LINK-CLEANUP-008AS-RECORD-LEDGER-PIXEL-REDO`。
- 后续 008AS 只允许按 UI/UX 固定资产包接入，不得自行重绘、换图、裁切、简化或用 fallback layout / CSS 近似冒充。
- UI/UX 12.7.47 已回包目标图和 008AN 切图；本轮已将切图入包到 `miniprogram/assets/party-recorder/`。
- 接口联调 3.52 合同：`sessionName` 来自 `GET /sessions/live`；拍照节点来自成员态 `GET /sessions/:sessionId/timeline` 的 `nodeKind=moment`；账本明细来自 `nodeKind=event` 的 `eventType/operatorProfileId/operatorName/targetProfileId/targetName/scoreDelta/createdAt`。
- 明确不使用 `accountingHighlights/eventHighlights` 做明细时间线，它们只作为摘要字段。
- 本轮只改前端源码和本计划；不改后端合同、不改 PM / 测试 / UIUX 结论，不破坏账本可读 / 可编辑权限结构、照片、相册、分享链路和现有 data。

#### 14.91.2 改动文件

| 文件 | 改动 | 说明 |
| --- | --- | --- |
| `miniprogram/assets/party-recorder/pr-cs008an-timeline-rail.svg` | 新增时间线轨道切图入包。 | 记录 tab 左侧明线使用真实 SVG 轨道，不使用 CSS `border-left`。 |
| `miniprogram/assets/party-recorder/pr-cs008an-photo-node-frame.svg` | 新增照片节点框切图入包。 | 照片节点用目标图框架承载真实照片。 |
| `miniprogram/assets/party-recorder/pr-cs008an-ledger-chip-debt.svg` | 新增欠酒霓虹条切图入包。 | 欠酒事件显示真实切图条。 |
| `miniprogram/assets/party-recorder/pr-cs008an-ledger-chip-drink.svg` | 新增加酒霓虹条切图入包。 | 加酒事件显示真实切图条。 |
| `miniprogram/assets/party-recorder/pr-cs008an-timeline-node-photo.svg` | 新增照片节点图标入包。 | 时间线 marker 使用 UI 节点图标。 |
| `miniprogram/assets/party-recorder/pr-cs008an-timeline-node-ledger-debt.svg` | 新增欠酒节点图标入包。 | 时间线 marker 使用 UI 节点图标。 |
| `miniprogram/assets/party-recorder/pr-cs008an-timeline-node-ledger-drink.svg` | 新增加酒节点图标入包。 | 时间线 marker 使用 UI 节点图标。 |
| `miniprogram/pages/live-record/index.ts` | 新增 `recordTimelineItems`；`buildTimelineViewState()` 同时聚合照片节点和账本事件节点；按 `createdAt` 升序混排；图片加载失败同步到统一时间线。 | 保留 `photoNodes/ledgerTimelineItems/timelineNodes`，便于相册和测试 data 继续读取。 |
| `miniprogram/pages/live-record/index.wxml` | 页头大标题改为真实 `sessionName`；记录 tab 改为 008AN 左侧明线统一时间线；相册 tab 保留照片墙；账本 tab 保留现有可编辑结构。 | 不再用“照片墙一块 + 账本动态一块”作为记录 tab 完成口径。 |
| `miniprogram/pages/live-record/index.less` | 新增 008AN 深色舞台、左侧轨道、照片节点、欠酒 / 加酒霓虹条和节点图标样式。 | 不使用旧厚列表、普通圆点、灰 badge 或 CSS `border-left`。 |

#### 14.91.3 数据字段映射

| UI 字段 | 来源 | 说明 |
| --- | --- | --- |
| 页面标题 | `liveSession.sessionName` / `sessionName` data | 玩家创建的真实聚会名；页头不再只显示“记录/账本”。 |
| 照片节点 | `timeline.nodes[]` 中 `nodeKind='moment'` 且有 `imageUrl` | 映射 `id/imageUrl/timelineTitle/caption/uploaderName/uploaderAvatarUrl/uploaderProfileId/createdAt`。 |
| 欠酒事件 | `timeline.nodes[]` 中 `nodeKind='event' && eventType='drink_debt'` | 映射 `operatorName/targetName/scoreDelta/createdAt`，显示“欠酒变动”和欠酒霓虹条。 |
| 加酒事件 | `timeline.nodes[]` 中 `nodeKind='event' && eventType='drink_add'` | 映射 `operatorName/targetName/scoreDelta/createdAt`，显示“加酒变动”和加酒霓虹条。 |
| 排序规则 | `createdAt`，缺失时按 0 | 前端升序混排照片和账本事件；当前接口缺稳定二级排序字段，若同毫秒顺序不稳定需接口补字段。 |
| 头像 | 优先节点 `uploaderAvatarUrl` 或成员记录 / runtime 合并头像 | 接口缺 `operatorAvatarUrl/targetAvatarUrl`，事件头像按 `targetProfileId` 从当前成员资料合并；缺失时只显示昵称首字，不伪造后端头像字段。 |

#### 14.91.4 待验证与风险

- 待验证命令：`npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check` 覆盖 008AN 新资产、`miniprogram/pages/live-record/index.ts`、`index.wxml`、`index.less` 和本计划。
- 待 DevTools 复测：`/pages/live-record/index?sessionId=session-1781756527692-d277f0&role=member`，检查 `summary.page`、`recordTimelineItems/photoNodes/ledgerTimelineItems/timelineNodes/sessionName`、Console 和右侧预览截图。
- 接口字段缺口：`operatorAvatarUrl/targetAvatarUrl` 和稳定二级排序字段仍未提供；本轮只做成员资料合并和首字展示，不写成接口已提供。
- DevTools 取证：`npm.cmd run wechat:auto -- relaunch --port 9420 --path /pages/live-record/index?sessionId=session-1781756527692-d277f0 --output docs/runtime/pr-fe-link-cleanup-008an-record-ledger-timeline.png --data sessionName,activeSegment,recordTimelineItems,photoNodes,ledgerTimelineItems,timelineNodes,hiddenTimelineNotice,timelineEmptyText,isJudge` 返回 page=`pages/live-record/index`、Console 只有 `[session-exit] enableAlertBeforeUnload enabled` info，无红错；截图路径 `docs/runtime/pr-fe-link-cleanup-008an-record-ledger-timeline.png`。
- 当前 data 摘要：`sessionName=""`、`activeSegment="record"`、`recordTimelineItems=[]`、`photoNodes=[]`、`ledgerTimelineItems=[]`、`timelineNodes=[]`、`timelineEmptyText="还没有精彩瞬间，先记录一条"`、`isJudge=false`。因此本轮运行态只能证明 008AN 空态结构渲染，不能证明真实照片 + 欠酒 / 加酒混排数据落地。
- 数据环境阻塞口径：当前 local 3221 / storage token / 成员态未给到 timeline 数据时，只能标数据态阻塞；前端不造假照片或账本事件。测试需在正确成员态和有 `nodeKind=moment/event` 的 timeline 数据下复测真实混排。
- 视觉退回口径：缺整页深色烧烤 / 聚会氛围背景和顶部实景 header；缺暖色炫光、灯光、纹理；时间线发光轨道和节点不足；照片框、胶带、贴纸、霓虹状态牌和底部纸质按钮未按新验收图 1:1 还原。因此本节不得进入 UI/UX 视觉接收。

### 14.92 `PR-FE-LINK-CLEANUP-008AS-RECORD-LEDGER-PIXEL-REDO` 等待 UI/UX 完整资产包

#### 14.92.1 当前状态

- PM 已要求等待 UI/UX `PR-UX-LINK-CLEANUP-008AR-RECORD-LEDGER-FULL-ASSET-PACK` 输出完整资产包后再执行前端重做。
- 前端当前不继续扩大 008AN 视觉实现；不自行补背景、炫光、按钮、贴纸、纸质照片框、霓虹牌或底部按钮。
- 2026-06-19 只读准备：已阅读 `docs/design-assets/party-recorder/clean-slate-001/RECORD_LEDGER_ASSET_PACK_008AR.md`，确认 `pr-cs008ar-*` 共 36 个切图覆盖背景、Hero、tab、发光时间线、拍立得、贴纸、霓虹欠酒 / 加酒牌、评论装饰、底部 CTA 和状态包。
- PM 同步阻塞：008AR 仍只有标题样本 `海边烧烤局`，而接口 3.53 可测样本真实 `sessionName=周末聚会记录`；用户要求页面名称必须是玩家给出的酒局名，前端不得用普通文字、CSS 阴影、系统字体、临时图片或样式近似补标题。因此 008AS 当前仍为 blocked，等待 UI/UX `PR-UX-LINK-CLEANUP-008AT-RECORD-LEDGER-DYNAMIC-TITLE-ASSET`。

#### 14.92.2 待执行边界

- 008AS 前端只按 UI/UX 固定资产包接入，不得自行重绘、换图、裁切、调色、压缩变样、简化页面元素或用 CSS 近似替代。
- 需保留 14.91 已完成的数据结构：`recordTimelineItems/photoNodes/ledgerTimelineItems/timelineNodes/sessionName`，以及照片、账本、相册、分享、账本编辑权限结构。
- UI/UX 回包后再补：资产入包路径、页面元素到资产映射、容器 / 层级 / mode、验证命令、预览截图和 data 摘要。

#### 14.92.3 008AR 待接入路径映射草案（只读准备）

| 页面元素 | 008AR 资产 | 接入说明 / 当前疑问 |
| --- | --- | --- |
| 整页深色氛围背景 | `pr-cs008ar-record-page-bg-750x1600.png` | 页面底图，750:1600 等比；禁止裁切中部主光区。 |
| 顶部实景 Hero | `pr-cs008ar-hero-bg-750x420.jpg` | Hero 区 750:420；禁止叠前端自定义滤镜。 |
| 进行中状态 | `pr-cs008ar-status-pill.png` | 可在同 pill 上替换短文本；需 UI/UX 确认动态文本安全区。 |
| 工具按钮 | `pr-cs008ar-circle-tool-btn.png` + `pr-cs008ar-icon-gear.png` / `pr-cs008ar-icon-more.png` | 圆形按钮底和 icon 组合。 |
| 人数 / 时间 meta | `pr-cs008ar-icon-people.png`、`pr-cs008ar-icon-clock.png` | 运行态填充真实人数、开始时间。 |
| 标题 | 当前仅 `pr-cs008ar-title-sample-haibianshaokaoju.png`、`pr-cs008ar-title-underline-scribble.png`、`pr-cs008ar-title-star-sticker.png` | 阻塞：真实 `sessionName=周末聚会记录` 缺动态标题资产或 UI/UX 批准的标题渲染方案；前端不得自行仿写。 |
| Tab 背板 / 选中态 | `pr-cs008ar-tabbar-bg-750x110.png`、`pr-cs008ar-tab-active-underline.png` | Tab bar 背板不可纯色替代；选中态不能用 border-bottom。 |
| 时间线轨道 / 节点 | `pr-cs008ar-timeline-rail.png`、`pr-cs008ar-node-camera.png`、`pr-cs008ar-node-debt.png`、`pr-cs008ar-node-drink.png`、`pr-cs008ar-node-comment.png` | 左列主轨和节点 icon；轨道只允许纵向裁切，禁止横向压扁。 |
| 照片节点 | `pr-cs008ar-polaroid-frame.png`、`pr-cs008ar-tape-purple.png`、`pr-cs008ar-sticker-smile-coin.png`、`pr-cs008ar-sticker-star-outline.png` | 照片内容放入拍立得中间窗；框和贴纸不可重画。 |
| 欠酒 / 加酒节点 | `pr-cs008ar-neon-debt-plus1.png`、`pr-cs008ar-neon-drink-plus2.png`、`pr-cs008ar-neon-plate-debt-base.png`、`pr-cs008ar-neon-plate-drink-base.png` | 样本固定牌可直接用；动态 delta 需 UI/UX 明确安全区和 9-slice 规则。 |
| 评论 / 句子节点 | `pr-cs008ar-shell-comment-deco.png`、`pr-cs008ar-handdrawn-marker.png` | 若 timeline 有评论节点再接；当前 3.52 合同未明确评论事件类型，需接口 / UI 复核。 |
| 底部 CTA | `pr-cs008ar-cta-paper-button.png`、`pr-cs008ar-cta-paper-button-pressed.png`、`pr-cs008ar-icon-camera-cta.png` | 继续拍照主按钮；只允许居中文字和相机 icon。 |
| 空态 / 加载 / 失败 | `pr-cs008ar-state-empty.png`、`pr-cs008ar-state-loading-spinner.png`、`pr-cs008ar-state-photo-failed.png`、`pr-cs008ar-state-ledger-empty.png` | 状态必须用资产包，不用普通文字块或系统 broken icon。 |

#### 14.92.4 待 UI/UX / 接口确认问题

- UI/UX 008AT：请提供真实 `sessionName` 动态标题方案，至少覆盖接口样本 `周末聚会记录`；若提供字体方案，需明确字体、字号、安全区、阴影 / 光效是否可由前端实现，以及哪些效果必须用资产。
- UI/UX：动态欠酒 / 加酒 delta 非 `+1/+2` 时，是否使用 base 牌 + 前端文字，还是需要 UI 逐值资产；若允许前端文字，需给安全区和字效规格。
- UI/UX：底部 CTA 文案如运行态变化，是否仍允许在 `cta-paper-button` 上叠文字；pressed 态切换是否只用于点击反馈。
- 接口：评论/句子节点对应的 `nodeKind/eventType` 是否存在；若没有，前端不造评论节点。
- 接口：`operatorAvatarUrl/targetAvatarUrl` 和稳定二级排序字段仍未提供；前端后续只可沿 14.91 的成员资料合并 / 首字展示边界。

### 14.93 `PR-FE-LINK-CLEANUP-008AS-RECORD-LEDGER-PIXEL-REDO` 固定资产接入实现

#### 14.93.1 准入与本轮边界

- PM 已放行 008AS：UI/UX 008AR 主体资产包和 008AT 标题资产均已回收；真实可测样本为 `sessionId=session-1781787045680-8e406c`，`sessionName=周末聚会记录`。
- 本轮只改前端源码和本计划；不改 PM / 测试 / UIUX / 后端文档，不改接口合同，不造照片或账本数据。
- 008AT 标题图只用于样本真实标题 `周末聚会记录` / 指定 008AS session；未命中标题资产时前端不使用普通文字、系统字体或 CSS 字效冒充 UI 生图标题。

#### 14.93.2 改动文件

| 文件 | 改动 | 数据结构说明 |
| --- | --- | --- |
| `miniprogram/assets/party-recorder/pr-cs008ar-*` 共 36 个文件 | 将 UI/UX 008AR 固定资产入包。 | 仅新增前端展示资产，不改数据字段。 |
| `miniprogram/assets/party-recorder/pr-cs008at-title-sample-zhoumojuhuijilu.png` | 将 UI/UX 008AT 样本标题图入包。 | 只作为 `titleImageSrc` 展示资源，不写入后端。 |
| `miniprogram/pages/live-record/index.ts` | 新增 `titleImageSrc/memberCountText/startTimeText`；008AS 样本标题映射；`recordTimelineItems` 节点图标和霓虹牌切到 008AR 资产；图片成功回调缺宽高时不再误判破图。 | 保留 `sessionName/photoNodes/ledgerTimelineItems/recordTimelineItems/timelineNodes/isJudge/records`；账本编辑仍按原权限和 `updateManagedSession`。 |
| `miniprogram/pages/live-record/index.wxml` | 记录页外壳改为真实图片图层：整页背景、Hero、标题图、状态 pill、工具按钮、tab 背板、选中下划线、时间线轨道、节点 icon、拍立得框、胶带贴纸、霓虹欠酒 / 加酒牌、状态图、底部纸质 CTA。 | 相册 / 分享 / 账本 tab 保留原数据入口，不删除测试可读字段。 |
| `miniprogram/pages/live-record/index.less` | 只做固定资产图层定位、尺寸、层级和等比约束；不使用 CSS 近似替代背景、标题、照片框、霓虹牌或 CTA 主视觉。 | 页面布局约束不改变接口字段。 |

#### 14.93.3 UI 资产引用路径

| 页面元素 | 前端入包路径 |
| --- | --- |
| 整页背景 | `/assets/party-recorder/pr-cs008ar-record-page-bg-750x1600.png` |
| Hero | `/assets/party-recorder/pr-cs008ar-hero-bg-750x420.jpg` |
| 真实样本标题 | `/assets/party-recorder/pr-cs008at-title-sample-zhoumojuhuijilu.png` |
| 状态 / 工具 | `/assets/party-recorder/pr-cs008ar-status-pill.png`、`pr-cs008ar-circle-tool-btn.png`、`pr-cs008ar-icon-gear.png`、`pr-cs008ar-icon-more.png` |
| meta | `/assets/party-recorder/pr-cs008ar-icon-people.png`、`pr-cs008ar-icon-clock.png` |
| 标题装饰 | `/assets/party-recorder/pr-cs008ar-title-underline-scribble.png`、`pr-cs008ar-title-star-sticker.png` |
| tab | `/assets/party-recorder/pr-cs008ar-tabbar-bg-750x110.png`、`pr-cs008ar-tab-active-underline.png` |
| 时间线 | `/assets/party-recorder/pr-cs008ar-timeline-rail.png`、`pr-cs008ar-node-camera.png`、`pr-cs008ar-node-debt.png`、`pr-cs008ar-node-drink.png`、`pr-cs008ar-node-comment.png` |
| 照片节点 | `/assets/party-recorder/pr-cs008ar-polaroid-frame.png`、`pr-cs008ar-tape-purple.png`、`pr-cs008ar-sticker-smile-coin.png`、`pr-cs008ar-sticker-star-outline.png` |
| 账本节点 | `/assets/party-recorder/pr-cs008ar-neon-debt-plus1.png`、`pr-cs008ar-neon-drink-plus2.png`、`pr-cs008ar-neon-plate-debt-base.png`、`pr-cs008ar-neon-plate-drink-base.png` |
| 评论装饰 | `/assets/party-recorder/pr-cs008ar-shell-comment-deco.png`、`pr-cs008ar-handdrawn-marker.png` |
| CTA / 状态 | `/assets/party-recorder/pr-cs008ar-cta-paper-button.png`、`pr-cs008ar-icon-camera-cta.png`、`pr-cs008ar-state-empty.png`、`pr-cs008ar-state-loading-spinner.png`、`pr-cs008ar-state-photo-failed.png`、`pr-cs008ar-state-ledger-empty.png` |

#### 14.93.4 数据字段映射

| UI / data | 来源 | 说明 |
| --- | --- | --- |
| `sessionName` | `GET /sessions/live` 的 `liveSession.sessionName` / runtime | 保留真实聚会名；008AS 样本用 008AT 标题图展示。 |
| `titleImageSrc` | `sessionName === 周末聚会记录` 或 008AS `sessionId` | 指向 008AT 固定标题资产；不使用系统字体替代。 |
| `photoNodes` / 照片时间线 | `GET /sessions/:sessionId/timeline` 中 `nodeKind=moment` 且有 `imageUrl` | 照片放入 008AR 拍立得框；图片失败用 008AR 失败态资产。 |
| 欠酒节点 | `nodeKind=event && eventType=drink_debt` | 使用 008AR 欠酒 node icon 和欠酒霓虹牌；`scoreDelta` 映射 `scoreText`，不伪造明细。 |
| 加酒节点 | `nodeKind=event && eventType=drink_add` | 使用 008AR 加酒 node icon 和加酒霓虹牌；`scoreDelta` 映射 `scoreText`。 |
| 权限态 | `liveSession.hostProfileId === runtime.currentUser.id` | 保留原 `isJudge` / 账本编辑权限；非发起人不展示加减入口。 |
| 排序 | `createdAt` 升序 | 接口仍缺稳定二级排序字段；同时间戳顺序需接口后续补证据。 |

#### 14.93.5 验证与未闭环

- 待跑静态验证：`npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check` 覆盖 008AR/008AT 新资产、`miniprogram/pages/live-record/index.ts`、`index.wxml`、`index.less` 和本计划。
- 待 DevTools 单点复测：`/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=member`，关注 `sessionName/titleImageSrc/memberCountText/startTimeText/recordTimelineItems/photoNodes/ledgerTimelineItems/timelineNodes/isJudge`、Console、截图是否还原 008AR/008AT 资产。
- 接口字段缺口仍保留：`operatorAvatarUrl/targetAvatarUrl` 和稳定二级排序字段未提供；前端只从成员资料合并头像或显示首字，不写成接口已提供。
- 若 local 3221 / token / storage 导致数据为空，只能标数据环境阻塞；前端不得用假照片或假账本事件填充。

### 14.94 `PR-FE-LINK-CLEANUP-008AV-RECORD-TIMELINE-COMPACT-REDO` 等待 UI/UX 密度规格

#### 14.94.1 当前状态

- PM 同步测试 13.16.114.9 已退回 008AS：data 链路可用、008AT 标题路径正确、Console 无阻塞红错，但视觉不能写通过。
- 用户新增口径：记录单个节点太大、下滑负担重；需要去掉外部框、缩小元素、调整布局。
- 当前 008AV 先标 blocked，等待 UI/UX `PR-UX-LINK-CLEANUP-008AU-RECORD-TIMELINE-COMPACT-DENSITY-SPEC` 回包后再动业务源码；前端不得自行缩放、补加酒牌文案或用 CSS 近似替代 UI 资产。

#### 14.94.2 只读盘点

| 问题 | 当前源码位置 | 后续 008AV 处理口径 |
| --- | --- | --- |
| 标题偏暗 | `live-record/index.wxml` 的 `.live-record008as-title-image`，`index.less` 的 `.live-record008as-title-wrap/title-image` | 等 008AU 给标题亮度 / 层级 / hero 背景压暗规格；不得前端自调滤镜或重绘标题。 |
| 状态 pill 左侧被裁 | `.live-record008as-status`、`.live-record008as-status-bg` | 等 008AU 给 pill 安全区和容器宽度；当前不自行改宽度当通过。 |
| Hero / 炫光层级不足 | `.live-record008as-hero`、`.live-record008as-hero-bg`、`.live-record008as-hero-shade` | 等 008AU 明确是否补新炫光资产或调整层级；不得用 CSS 渐变冒充。 |
| 时间线 / 节点还原不足 | `.live-record008as-page .live-record-timeline-list/item/rail/icon` | 等 008AU 给紧凑节点尺寸、轨道高度、节点间距和是否去外框。 |
| 单节点过大 / 下滑累 | `.live-record-photo-card` 当前 250x208；`.live-record-ledger-chip` 当前 246x126；`.live-record-timeline-list` gap 18px | 008AV 应按 008AU 密度规格压缩照片、霓虹牌、文案和间距；本轮不自行缩放。 |
| 加酒霓虹牌空绿框无“加酒 +1” | `buildTimelineViewState()` 中 `drink_add` 当前 `score===2` 才用 `pr-cs008ar-neon-drink-plus2.png`，否则用 base 牌；WXML 隐藏 `.live-record-ledger-chip-text` | 008AV 需要 UI/UX 给 `加酒 +1` 固定图或允许安全区文字叠加规格；不得用普通文字补牌。 |
| 账本 tab 三位成员 `0/0/0` 与 ledger event data 不一致 | `live-record/index.wxml` ledger tab 消费 `records[].debtCount/drinkCount`；`ledgerTimelineItems` 已从 timeline event 聚合但未反写成员计数 | 008AV 需明确账本 tab 计数来源：优先 timeline ledger event 聚合到成员展示，或接口直接提供成员账本计数；不得丢失 `records` 编辑权限结构。 |

#### 14.94.3 待执行边界

- 等 UI/UX 008AU 回包后再一次性修：去外框、缩小节点、调整密度、修加酒霓虹文案、修账本 tab 计数消费。
- 不改数据结构：继续保留 `recordTimelineItems/photoNodes/ledgerTimelineItems/timelineNodes/records/isJudge/titleImageSrc`。
- 不扩大到相册、分享、邀请页或其他 008O/008R/008AQ 任务。
- 本节仅为前端只读准备和阻塞登记，不代表 008AV 已实现。

### 14.95 `PR-FE-LINK-CLEANUP-008AV-RECORD-TIMELINE-COMPACT-REDO` 紧凑密度实现

#### 14.95.1 准入与边界

- PM 已放行 008AV，UI/UX 12.7.53 和资产包第 7 节已给出紧凑密度规格。
- 本轮只改前端源码和前端计划；不改 PM / 测试 / UIUX / 后端文档，不改接口合同，不造假照片或账本数据。
- 仍保留 008AR / 008AT 固定资产主视觉；本轮只做 008AU 指定的密度、层级、`加酒 +1` 资产和账本 tab 计数修复。

#### 14.95.2 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/assets/party-recorder/pr-cs008au-neon-drink-plus1.png` | 新增 008AU `加酒 +1` 霓虹牌入包，来源 `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008au-neon-drink-plus1.png`。 |
| `miniprogram/pages/live-record/index.ts` | `drink_add +1` 改用 008AU 固定图；新增 `buildRecordsWithLedgerEvents()`，从 timeline ledger event 聚合目标成员 `debtCount/drinkCount`，账本 tab 不再只显示 liveSession 默认 0 壳层。 |
| `miniprogram/pages/live-record/index.less` | 按 390 宽规格压缩 Hero、标题、pill、tab、时间线列、节点 icon、照片节点、霓虹牌和 CTA；去掉厚 padding / 外层大卡感，只保留 UI 资产本体。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 新增本节记录 008AV 修复、资产、尺寸、字段映射和待测项。 |

#### 14.95.3 资产与尺寸摘要

| 项 | 本轮实现 |
| --- | --- |
| 新增资产 | `/assets/party-recorder/pr-cs008au-neon-drink-plus1.png`，用于 `drink_add` 且 `scoreDelta=+1`。 |
| Hero | `236px`，处于 008AU `220-250px` 范围；弱化遮罩，保留 008AR Hero 图。 |
| 标题图 | `292px`，处于 `250-300px` 范围；继续使用 008AT 固定标题图，不用系统字替代。 |
| 状态 pill | 高 `40px`、左侧 padding `18px`，满足左边距 `>=16px`。 |
| Tab | 高 `76px`，继续使用 008AR tab 背板和 active underline。 |
| 时间线列 / icon | 列宽 `54px`、icon `56px`，处于 `44-56px` / `52-60px` 范围。 |
| 照片节点 | 拍立得整体 `212x177px`，保留 `pr-cs008ar-polaroid-frame.png`，不再额外套深色大卡。 |
| 霓虹牌 | `168x78px`，处于 `136-180px` 范围；`+1/+2` 分别用固定图。 |
| CTA | 左右 `25px`、高 `78px`，约 `340px` 宽，处于 `320-350px` / `72-84px` 范围。 |

#### 14.95.4 data 字段映射

| 字段 | 来源与处理 |
| --- | --- |
| 真实标题 | `sessionName` 仍来自 `GET /sessions/live` / runtime；008AS 样本继续映射 `titleImageSrc=/assets/party-recorder/pr-cs008at-title-sample-zhoumojuhuijilu.png`。 |
| 照片节点 | `timeline.nodes[]` 中 `nodeKind=moment && imageUrl`，继续映射 `recordTimelineItems` 和 `photoNodes`。 |
| 欠酒节点 | `eventType=drink_debt`，继续用 008AR 欠酒 icon / 霓虹牌；同时聚合到目标成员 `debtCount`。 |
| 加酒节点 | `eventType=drink_add`，`score=1` 用 008AU `加酒 +1` 图，`score=2` 用 008AR `加酒 +2` 图；同时聚合到目标成员 `drinkCount`。 |
| 账本 tab 计数 | `loadTimeline()` 获取 timeline 后调用 `buildRecordsWithLedgerEvents()`，用 ledger event 覆盖成员欠酒 / 加酒计数；若无 ledger event，保留接口成员计数，不造值。 |
| 权限态 | `isJudge` 仍以后端 `liveSession.hostProfileId === runtime.currentUser.id` 判断；不改变加减酒权限结构。 |

#### 14.95.5 验证与待复测

- 待跑验证：`npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check` 覆盖新资产、`live-record` 三文件和本计划。
- 待测试 008AV 单点复测：`/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=member`。
- 待测 data：`sessionName/titleImageSrc/recordTimelineItems/photoNodes/ledgerTimelineItems/timelineNodes/records/isJudge`，重点检查 `drink_add +1` 的 `chipAsset`、成员 `records[].debtCount/drinkCount` 是否与 ledger event 一致。
- 未执行预览框截图时，不写预览通过；交由测试复拍首屏、滚动一屏、账本 tab 和 Console。

### 14.96 `PR-FE-LINK-CLEANUP-008AW-RECORD-TIMELINE-DENSITY-FRAME-CTA-FIX` 首屏密度 / 外框 / CTA 单点修复

#### 14.96.1 复测退回与保留项

- 测试 13.16.114.11 已确认 008AV 局部修复：`recordTimelineItems` 数据正常、`加酒 +1` 固定图已显示、账本 tab 不再全员 `0/0/0`、Console 无阻塞红错。
- 本轮只修三类失败：首屏密度、外部框、底部 CTA 遮挡；不得回退 008AV 的 `pr-cs008au-neon-drink-plus1.png`、账本 event 聚合和权限结构。

#### 14.96.2 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/live-record/index.less` | scoped 覆盖旧 `.live-record-timeline-body` 的暗色背景、border、shadow 和 `12px` padding；压缩 Hero、Tab、照片节点、霓虹牌、文案行距；扩大 scroll 底部安全区并降低 CTA bottom，避免遮挡加酒节点。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 记录 008AW 修复范围、class 和待复测口径。 |

#### 14.96.3 关键 class / 尺寸变化

| 项 | 008AW 调整 |
| --- | --- |
| 外部框 | `.live-record008as-page .live-record-timeline-body` 改为 `padding:0; border:0; background:transparent; box-shadow:none;`，删除照片 / 账本事件外层暗色大卡感。 |
| Hero | `.live-record008as-hero` 从 `236px` 压到 `220px`，仍在 008AU `220-250px` 范围。 |
| 标题 | `.live-record008as-title-wrap` 从 `96px` 压到 `82px`，标题图从 `292px` 调整为 `270px`，仍在 `250-300px` 范围。 |
| Tab | `.live-segment-tabs` 从 `76px` 压到 `72px`，仍保留 008AR tab 背板 / active underline。 |
| 照片节点 | `.live-record-photo-card` 从 `212x177px` 压到 `196x164px`，仍在 `190-228px` 范围并保留拍立得资产本体。 |
| 霓虹牌 | `.live-record-ledger-chip` 从 `168x78px` 压到 `148x69px`，仍在 `136-180px` 范围并保留 008AR/008AU 霓虹图。 |
| 文案密度 | 时间 / 标题 / 详情字号和行距下调，节点 copy 间距从 `4px` 降为 `2px`。 |
| CTA 安全区 | `.live-redesign-scroll` 底部 padding 从 `104px` 增至 `140px`；`.live-record008as-cta` bottom 从 `16px` 降到 `8px`、高度 `76px`，减少对加酒节点有效内容遮挡。 |
| 评论外围 | `.live-record008as-comment-deco` 隐藏，不保留无数据评论外围装饰框。 |

#### 14.96.4 待测试复测

- 测试路径仍为：`/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=member`。
- 待测截图：390 宽首屏是否看到 Hero、Tab、1 个照片节点和 1 个账本节点起始；一次正常滚动后是否连续看到照片 + 欠酒 + 加酒；底部 `继续拍照` 是否遮挡加酒节点有效内容。
- 待测 data 保持：`recordTimelineItems/photoNodes/ledgerTimelineItems/timelineNodes/records/isJudge/titleImageSrc`；本轮未改数据结构和接口合同。

### 14.97 `PR-FE-LINK-CLEANUP-008AY-RECORD-FIRST-SCREEN-DENSITY-FINAL-FIX` 等待连续照片首屏方案

#### 14.97.1 当前状态

- 测试 13.16.114.13 已退回 008AW，结论为 `退回前端 / UIUX，局部修复确认`。
- 008AW 局部确认项需保持：一次滚动连续内容、外框压薄 / 删除、CTA 不遮挡、`加酒 +1` 固定图、账本 tab 计数、Console 无阻塞红错。
- 仍失败项：390 首屏仍只到第二张照片开头，未露出账本节点起始。
- 根因口径：008g 真实 timeline 前两条都是照片；这不是继续让前端自行缩 CSS 能稳定解决的问题，也不得改变 timeline 数据顺序或接口结构。

#### 14.97.2 待办与边界

- 前端待办登记为 `PR-FE-LINK-CLEANUP-008AY-RECORD-FIRST-SCREEN-DENSITY-FINAL-FIX`，当前 `blocked`。
- 等待 UI/UX `PR-UX-LINK-CLEANUP-008AX-RECORD-FIRST-SCREEN-CONSECUTIVE-PHOTOS-SPEC` 回包连续照片节点首屏方案后再改业务源码。
- 等待期间不继续修改 `miniprogram/pages/live-record` 样式，不改变 timeline 排序 / 数据结构 / 接口合同，不回退 008AW 已通过项。
- 后续 008AY 只允许基于 UI/UX 008AX 方案处理连续照片首屏密度；如需要照片折叠、首屏组合、同类节点压缩或账本预告位，必须由 UI/UX 明确规格和测试口径。

### 14.98 `PR-FE-LINK-CLEANUP-008AY-RECORD-FIRST-SCREEN-DENSITY-FINAL-FIX` 连续照片缩略组实现

#### 14.98.1 准入与目标

- UI/UX 12.7.54 / 008AX 已回包连续照片首屏规格，PM 放行 008AY 前端实现。
- 本轮只处理真实 008g 前两条均为照片导致首屏不露账本节点的问题；不改接口结构、不改变 timeline 原始顺序、不伪造账本提前。
- 必须保留 008AW 已确认项：外框压薄 / 删除、CTA 不遮挡、`加酒 +1` 固定图、账本 tab 计数、Console。

#### 14.98.2 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/live-record/index.ts` | 新增 `recordTimelineDisplayItems` 渲染列表；原始 `recordTimelineItems` 保持不变。检测前导连续 `photo`：第 1 条转正常 display node，第 2 条及之后连续照片合并为 `photoGroup`，下一条非照片节点按原顺序跟在缩略组后。 |
| `miniprogram/pages/live-record/index.wxml` | 记录 tab 循环改用 `recordTimelineDisplayItems`；`displayKind=photoGroup` 时渲染连续照片缩略组，不再把第二张照片作为完整大拍立得。 |
| `miniprogram/pages/live-record/index.less` | 主照片节点压到 `186x156px`；连续照片缩略组高度约 `56px`、缩略片 `84x52px`；Hero 压到 `208px`；节点间距压到 `12px`。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 记录 008AY 分组规则、data 保留和验证口径。 |

#### 14.98.3 分组规则与 data 保留

| 场景 | 渲染规则 | data 保留 |
| --- | --- | --- |
| 第 1 条后立即是账本节点 | `recordTimelineDisplayItems = recordTimelineItems.map(node)`，不启用缩略组。 | 原始 `recordTimelineItems` 不变。 |
| 前 2 条及以上均为照片 | 第 1 条照片保留为主照片节点；第 2 条起连续照片合并为一个 `photoGroup`；后续第一条非照片节点紧跟在缩略组后。 | `recordTimelineItems` 仍保存原始照片、欠酒、加酒顺序；`recordTimelineDisplayItems` 仅用于 UI 渲染。 |
| 连续照片只有 2 张 | 第 2 张作为单张缩略片，缩略组无 `+N`。 | 第 2 张仍可通过 `compactPhotos[0]` 追溯原始 id / imageUrl。 |
| 连续照片 >= 3 张 | 第 2 张作为缩略片，`compactPhotoCountText` 显示剩余 `+N`。 | 不展开成第二张完整拍立得，不改事件顺序。 |

#### 14.98.4 待验证

- 待跑验证：`npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check`。
- 待测试 008AY 单点复测：`/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=member`。
- 待测 data：`recordTimelineItems` 应保留照片 2、欠酒 1、加酒 1 原始顺序；`recordTimelineDisplayItems` 应显示主照片、`photoGroup`、欠酒、加酒；首屏应露出账本节点起始。

### 14.99 `PR-FE-LINK-CLEANUP-008AZ-RECORD-HERO-TEXT-TITLE-STATUS-FIX` Hero 标题 / 状态层修复

#### 14.99.1 退回点与边界

- 用户截图退回 `live-record` Hero：`进行中` 状态重叠且不应使用图片；`周末聚会记录` 不应使用标题 PNG，应展示玩家创建的真实聚会名。
- 本轮只改 Hero 标题 / 状态层级，不改 timeline 数据结构、排序、权限、账本 tab 计数、`recordTimelineDisplayItems/photoGroup/compactPhotos` 连续照片缩略组、`加酒 +1` 固定图和 CTA 安全区。

#### 14.99.2 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/live-record/index.wxml` | 移除 `.live-record008as-status-bg` 图片渲染；主标题从 `<image wx:if="{{titleImageSrc}}">` 改为 `<text>{{sessionName}}</text>`。 |
| `miniprogram/pages/live-record/index.less` | 状态改为非图片文本 pill；新增 `.live-record008as-title-text`，用真实 `sessionName` 文本展示标题，避开右上工具按钮和人数 / 时间元信息。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 记录 008AZ 修复范围、保留 data 和验证口径。 |

#### 14.99.3 data 与保留项

- `sessionName` 仍来自现有 `GET /sessions/live` / runtime，不改接口结构。
- `titleImageSrc` 作为兼容 data 保留，但不再作为主标题渲染；后续测试可继续读取该字段确认历史兼容，不应把它视为当前 UI 主标题来源。
- `recordTimelineDisplayItems/photoGroup/compactPhotos` 继续保留；本轮未回退 008AY。
- `recordTimelineItems` 原始顺序、账本 event 聚合、`isJudge` 权限和 `pr-cs008au-neon-drink-plus1.png` 均未改。

#### 14.99.4 待验证

- 待跑验证：`npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check`。
- 关键扫描：`rg titleImageSrc|status-bg|title-image|recordTimelineDisplayItems|photoGroup`，需确认源码中不再渲染 `status-bg` 和 `title-image`，`titleImageSrc` 仅作为兼容 data / 历史计划记录存在。
- 待测试 008AZ 复测：390 宽 Hero 中状态 pill 不重叠，标题显示真实 `sessionName` 文本，不显示 008AT 标题 PNG。

### 14.100 `PR-FE-SHARE-POSTER-TIMELINE-ACTIONS-008BA` 分享图时间节点与动作区收敛

#### 14.100.1 退回点与边界

- 用户截图退回 `share-poster`：主视觉红框区域不应继续堆照片墙、账本大卡和长摘要，需改为记录时间节点；底部状态与回流动作不能继续以大卡 / 多按钮堆叠。
- 本轮只改 `share-poster` 前端源码和本计划；不改接口合同、不改后端生成任务字段、不改 PM / 测试 / UIUX / UGC 文档，不造假 timeline / 账本数据。

#### 14.100.2 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/share-poster/index.ts` | 新增 `PosterTimelineNode` / `posterTimelineNodes` / `posterStatusLine`；从真实 `brief.timeline.nodes` 优先组装拍照、欠酒、加酒和关键事件节点，缺 timeline 时才用 `photoHighlights + keyEvents + accountingHighlights` 做展示级组合；`drawCanvasToFile()` 同步改为绘制记录时间线，不再绘制旧照片墙、账本高光大卡和底部隐私提示。 |
| `miniprogram/pages/share-poster/index.wxml` | 主视觉改为 `.poster-share021-timeline` 时间节点列表；移除本页 `<share-task-status>` 大卡、保存成功 / 保存失败 / 重试三张状态卡、底部“加入聚会 / 查看相册 / 反馈”按钮和隐私提示块。 |
| `miniprogram/pages/share-poster/index.json` | 核查当前 `HEAD` 已无 `share-task-status` 注册，本轮无需改 JSON；其他页面使用该组件不受影响。 |
| `miniprogram/pages/share-poster/index.less` | 新增时间线、节点卡、照片缩略、三按钮动作区和小字状态行样式；保留 `.poster-stage-primary` / `.poster-primary-action` 等 QA selector，不改其他页面组件。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 新增本节记录 008BA 修复、字段映射、按钮状态和待测项。 |

#### 14.100.3 时间节点数据映射

| 数据源 | 映射 |
| --- | --- |
| `brief.timeline.nodes[] nodeKind=moment` | 映射为 `posterTimelineNodes[].type=photo`，展示时间、照片、标题和上传 / 说明；继续使用真实 `imageUrl`，不伪造图片。 |
| `brief.timeline.nodes[] nodeKind=event eventType=drink_debt` | 映射为 `type=ledger / tone=debt`，标题“欠酒记录”，说明由 `operatorName / targetName / scoreDelta` 组合。 |
| `brief.timeline.nodes[] nodeKind=event eventType=drink_add` | 映射为 `type=ledger / tone=drink`，标题“加酒记录”，说明由 `operatorName / targetName / scoreDelta` 组合。 |
| `eventHighlights` | 无 timeline 节点时补充为关键事件展示节点，不改原始 data。 |
| `photoHighlights/accountingHighlights` | 仅作为 timeline 缺失时的展示级 fallback，保留原字段给 QA / UGC 读取，不写成后端字段已新增。 |

#### 14.100.4 按钮与状态口径

| 状态 | 主按钮 | 次按钮 | 额外按钮 | 状态行 |
| --- | --- | --- | --- | --- |
| 无任务 / 初始 | `保存聚会图` | `返回聚会`、`刷新状态` | 无 | `记录节点会进入分享图` |
| `pending / processing` | `生成中` | `返回聚会`、`刷新状态` | 无 | `分享图等待生成，可刷新状态` / `分享图生成中，可稍后刷新` |
| `ready` | `去分享` | `返回聚会`、`刷新状态` | 无 | `分享图已准备好` |
| `saveState=saved` | `去分享` | `返回聚会`、`刷新状态` | 无 | `分享图已生成，可点击去分享` |
| `failed / expired` | `保存聚会图` | `返回聚会`、`刷新状态` | `重新生成` | 中文失败说明小字，不展示 raw 接口错误。 |

#### 14.100.5 待验证与扫描口径

- 待跑验证：`npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check`。
- 关键词扫描：`share-poster` 页面 / canvas 不应再出现旧主视觉文案、底部三按钮或隐私提示；允许 `重新生成`、`去分享` 作为本轮指定动作文案；历史计划命中只作为过往记录解释。
- 待测试复测路径：`/pages/share-poster/index?sessionId=<sessionId>&briefId=<briefId>&taskId=<taskId>`，重点看 `.poster-share021-event-strip` / `.poster-primary-action` / `.poster-state-card-warn` / page data `posterTimelineNodes,photoHighlights,accountingHighlights,keyEvents,saveState,shareTask.status,posterImagePath`。
- 预览框和保存图原图需测试单点复测：页面主视觉为记录时间线，保存 canvas 也为记录时间线；本节不写预览通过、测试通过、UIUX 通过或上线通过。

### 14.101 `PR-FE-HOME-RECENT-ALBUM-BRIEFID-404-008BB` 首页最近相册 briefId 404 收口

#### 14.101.1 根因与边界

- 用户调试器错误为：首页加载时反复请求 `GET /api/v1/briefs/session-...` 和 fallback `GET /api/v1/session-briefs/session-...`，均 404。
- 根因在 `miniprogram/pages/index/index.ts` 的 `mapRecentAlbumsFromSummaries()`：summary 缺 `briefId` 时曾把 `sessionId` 当成 brief 标识传给 `getManagedSessionBrief()`。
- 本任务与 008BA 分享图时间节点互不替代；本轮只修首页最近相册读取条件，不改分享页、照片 / 账本 / 分享数据结构，不隐式创建或刷新 brief。

#### 14.101.2 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/index/index.ts` | `mapRecentAlbumsFromSummaries()` 改为仅当 `item.briefId` 存在时调用 `getManagedSessionBrief(item.briefId)`；只有 `sessionId` 时不读 brief，也不调用 `createOrRefreshManagedSessionBrief()`，继续用 summary 的 `coverPhotoUrl / createdAt / sessionName / title` 生成首页最近相册展示。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 新增本节记录 008BB 根因、修复边界、验证和待复测项。 |

#### 14.101.3 待验证与风险

- 待跑验证：`npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check`。
- 扫描要求：首页源码不应再命中“briefId 不存在时用 sessionId 兜底读取 brief”的旧调用。
- DevTools 如可用，测试需复测首页 Console：不应再出现 `/briefs/session-*` 或 `/session-briefs/session-*` 404 刷屏。
- 若 summary 同时缺 `briefId` 和 `coverPhotoUrl`，首页只能显示默认封面；这是接口只读字段缺口，不在首页隐式生成 brief，也不 mock 图片。

### 14.102 `PR-FE-HOME-AUTH401-SUMMARY-GATE-008BC` 首页用户摘要鉴权门控

#### 14.102.1 根因与边界

- 用户调试器错误为：首页加载时无登录态仍请求 `GET /api/v1/user/session-moment-summaries`，后端按合同返回 401。
- 根因在 `miniprogram/pages/index/index.ts` 的 `loadHomePage()`：此前 `getHomePageData()` 与 `getManagedSessionMomentSummaries()` 并行无条件执行。
- 本任务与 008BB 区别：008BB 修 `sessionId` 被当作 `briefId` 导致的 404；008BC 修未登录 / 失效 token 时无条件请求用户摘要导致的 401。
- 本轮只改首页鉴权门控，不改后端合同、不改摘要接口、不改最近相册路由和 `briefId/sessionId` 处理。

#### 14.102.2 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/index/index.ts` | 引入 `getUserSessionToken()`；`loadHomePage()` 改为先读取首页公开数据，再基于本地 token 和 `getUserAuthSession()` 判定登录态。无 token、失效 token 或未登录时不请求 `/user/session-moment-summaries`，摘要结果使用空数组；确认登录且 profile 有 `wechatOpenId` 时才请求用户摘要。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 新增本节记录 008BC 根因、修复边界、验证和待复测项。 |

#### 14.102.3 待验证与风险

- 待跑验证：`npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check`。
- 扫描要求：`loadHomePage()` 不应再无条件请求 `getManagedSessionMomentSummaries()`。
- DevTools 如可用，测试需用 `runtime-api-base=https://api.pomer.cn/api/v1` 且无 / 失效 `jzp-user-token` 打开首页，确认 Console 不再出现 `/user/session-moment-summaries 401`。
- 有效 token 场景仍需测试复测摘要加载；如果已登录摘要接口返回非鉴权业务错误，本轮不把它吞成“正常空列表”，应按真实业务错误继续暴露给测试定位。

### 14.103 `PR-FE-LINK-CLEANUP-008BD-RECORD-STATUS-PILL-SAFEAREA-FIX` 记录页状态 pill 安全区修复

#### 14.103.1 退回点与边界

- 测试 13.16.114.15 已确认 008AZ 局部修复：真实标题文本、`recordTimelineDisplayItems` / `photoGroup`、原始 `recordTimelineItems` 顺序、首屏账本节点起始、一次滚动连续内容、`加酒 +1` 固定图、账本 tab 计数、CTA 和 Console 均未回退。
- 唯一退回点：390 首屏左上状态 pill 未完整显示 `进行中`，只露出 `中`。
- 本轮只修 `live-record` Hero 状态 pill 的位置 / 宽度 / 左侧安全区；不改标题文本方案、不恢复状态图片、不改 timeline 分组、账本计数、CTA、接口或权限。

#### 14.103.2 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/live-record/index.less` | `.live-record008as-hero-top` 左 padding 从 `18px` 增至 `24px`；`.live-record008as-status` 最小宽度从 `72px` 增至 `88px`，左右 padding 从 `12px` 增至 `16px`，并设置 `flex:0 0 auto`，避免 390 宽下被左边缘或 flex 压缩裁切。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 新增本节记录 008BD 单点修复、保留项和待验证项。 |

#### 14.103.3 待验证

- 待跑验证：`npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check`。
- 关键扫描：确认未恢复 `status-bg` / `title-image` 主渲染，`titleImageSrc` 仍仅作为兼容 data；`recordTimelineDisplayItems` / `photoGroup` 仍保留。
- 待测试 008BD 复测：390 宽 Hero 左上 `进行中` 完整可见，且不与右上按钮、标题、人数 / 时间元信息重叠。

### 14.104 `PR-FE-LINK-CLEANUP-008BE-RECORD-STATUS-PILL-CONTAINER-POSITION-FIX` 记录页状态 pill 容器定位修复

#### 14.104.1 退回点与边界

- 测试 13.16.114.16 复测 008BD 仍退回：390 右侧预览首屏左上状态 pill 只露出 `行中`，未完整显示 `进行中`。
- 008BD 只增加 pill 宽度 / padding 不足以解决，说明裁切来自 Hero 顶层父容器 / 左侧安全区 / flex 容器定位组合，而不是单纯文本宽度。
- 本轮只修 `live-record` Hero 状态 pill 的容器定位和左侧安全区；不改标题文本、不恢复状态图片、不改 `recordTimelineDisplayItems/photoGroup`、原始 timeline、账本计数、CTA、接口或权限。

#### 14.104.2 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/live-record/index.less` | `.live-record008as-hero-top` 从普通流式 relative flex 改为 Hero 内绝对定位覆盖层：`top:16px; right:18px; left:0; padding-left:44px; box-sizing:border-box`，让状态 pill 固定在明确可见安全区；覆盖层本身 `pointer-events:none`，pill 和右侧工具按钮保留 `pointer-events:auto`。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 新增本节记录 008BD 失败原因、008BE 修复点和待验证项。 |

#### 14.104.3 待验证

- 待跑验证：`npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check`。
- 关键扫描：确认未恢复 `status-bg` / `title-image` 主渲染；`recordTimelineDisplayItems` / `photoGroup` 仍保留。
- 待测试 008BE 复测：390 宽 Hero 左上 `进行中` 完整可见，左侧有安全边距，且不与右上按钮、标题、人数 / 时间元信息重叠。

### 14.105 `PR-FE-LINK-CLEANUP-008BF-REAL-TIME-STATUS-LEDGER-END-FLOW` 真实时间 / 状态 / 账本确认 / 结束聚会链路

#### 14.105.1 根因与边界

- 假时间来源：`live-record` 曾用 `Date.now()` 给 `startedAt` 兜底，`share-poster` 时间线曾把 `照片 / 账本 / 事件 / --:--` 当作有效时间显示或写入保存图。本轮改为只格式化真实 `createdAt / updatedAt / finishedAt / startedAt` 等字段；缺字段显示“时间未记录 / 开始时间未记录”，不伪造当前时间。
- 假状态来源：`miniprogram/utils/session-return.ts` 曾硬编码 `进行中`。本轮改为消费 runtime / history 中已有真实状态；没有真实状态时不写死“进行中”。`share-poster` 状态刷新继续以真实 `shareTask.status` 为准。
- 账本头像来源：`ledger` 继续只用接口成员 `avatarUrl`、runtime selectedPlayers 头像或当前授权用户头像；缺头像才显示空态，不用默认头像冒充真实头像。
- 确定提交链路：`ledger` 的欠酒 / 加酒加减改为本地暂存，新增“确定修改”按钮；点确定后统一调用 `PUT /sessions/:sessionId`，成功后更新 runtime 的 `playerStats / selectedPlayers`，记录页返回后可读取修改后的账本数据。
- 结束聚会链路：`live-record` 底部同时提供“继续拍照”和“结束聚会”；本节原先记录过复用退出能力的历史口径，已在 14.111 改为专用结束状态收口，不再复用 `confirmAndExitSession()`。
- 分享任务刷新链路：`share-poster` 的“刷新状态”只在存在 `shareTask.id` 时调用真实 `GET /share-images/:taskId` / fallback `GET /share-image-tasks/:taskId`；缺 taskId 时明确提示“缺少分享任务 ID，无法刷新状态”，不在刷新动作中伪造或隐式创建任务。
- 保存图二维码：canvas 已移除假二维码白块 / “口令”假画法，仅保留 `qrCodeImageUrl` 字段和“待接入真实字段”提示；等待接口联调 008BG 给出真实 URL/path 后再接入。

#### 14.105.2 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/utils/session-return.ts` | 去掉返回条硬编码 `进行中`；runtime 返回条读取真实 `status/sessionStatus`，历史返回条只取非结束态真实状态。 |
| `miniprogram/pages/live-record/index.ts` | 去掉 `Date.now()` 开始时间兜底；缺真实时间显示明确空态；`handleFinishTap()` 的结束流已由 14.111 改为专用状态收口，不再复用退出 / 删除流程。 |
| `miniprogram/pages/live-record/index.wxml` | 底部从单一“继续拍照”改为“继续拍照 / 结束聚会”双动作。 |
| `miniprogram/pages/live-record/index.less` | 移除原 CTA 背景图层，避免上方不明横杠；调整双按钮布局和底部触控区域。按钮视觉仍待 UI 008BH 给最终规格。 |
| `miniprogram/pages/ledger/index.ts` | 新增 `ledgerDirty / ledgerSubmitting`；加减只暂存本地，`handleConfirmTap()` 统一提交，成功后再同步 runtime。 |
| `miniprogram/pages/ledger/index.wxml` | 新增“确定修改”按钮，提示先调整后确认。 |
| `miniprogram/pages/ledger/index.less` | 增加确认提交按钮样式和提交态样式。 |
| `miniprogram/pages/share-poster/index.ts` | 时间线 / canvas 时间仅消费真实时间字段；刷新状态必须有真实 taskId；移除保存图假二维码，预留 `qrCodeImageUrl` 真实字段。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 新增 14.105 记录本轮根因、修复、验证和待复测项。 |

#### 14.105.3 待测试路径 / selector / data

- `pages/live-record/index?sessionId=<sessionId>&role=member|judge`：检查 `startTimeText`、`recordTimelineItems[].createdAt/timeText`、`.live-record008as-cta-row`、`.live-record008as-photo-cta`、`.live-record008as-end-cta`；确认无真实时间字段时显示明确空态，不出现当前时间伪造。
- `pages/ledger/index?sessionId=<sessionId>`：检查 `players[].avatarUrl`、`ledgerDirty`、`ledgerSubmitting`、`.ledger-confirm-submit`；加减后只改变本地 data，点“确定修改”后才提交并同步 runtime。
- `pages/share-poster/index?briefId=<briefId>&taskId=<taskId>`：检查 `shareTask.status`、`taskPrimaryLabel`、`posterStatusLine`、`posterTimelineNodes[].time`、`qrCodeImageUrl`；点击“刷新状态”应读取真实 task，ready 后主按钮为“去分享”，failed / expired 时出现“重新生成”。
- `sessionReturn` 返回条：检查 `status` 不再全部硬编码为 `进行中`；若接口 / runtime 没有真实状态，前端不伪造状态。

#### 14.105.4 待验证与缺口

- 待跑验证：`npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check`。
- 待接口 / 后端：008BG 需给保存图真实小程序二维码 URL/path；结束聚会状态收口以 14.111 为准，若后端 008BV 未提供可用 finish/end/状态更新合同，则按接口阻塞处理，不再回退到退出 / 删除会话能力。
- 待 UI/UX：继续拍照 / 结束聚会按钮最终视觉按后续 UI 008BH 规格微调，本轮只去除不明横杠并补齐动作结构。
- 不写测试通过、UI 通过或上线通过；本节只作为前端源码修复与静态验证记录。

### 14.106 `PR-FE-SHARE-PROCESS-QR-CONSUME-008BK` 分享生成 process 合同与二维码字段接入准备

#### 14.106.1 根因与边界

- 接口联调 008BG 明确分享生成不是 `GET` 自动推进，真实链路应为 `create -> process -> GET status`。
- 008BF 已移除假二维码和本地状态伪造；本轮继续收紧：不能用页面本地 canvas 成功替代后端 `shareTask.status=ready`，也不能在刷新中伪造 ready。
- 后端 008BJ 尚需补 `miniProgramQrUrl / qrCodeUrl` 与 ready PNG 字段；前端本轮只接入字段和状态机，不假画二维码。
- 本轮不改账本确认、结束聚会、真实时间、真实状态、继续拍照横杠清理等 008BF 已完成项。

#### 14.106.2 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/services/operations.ts` | 新增 `processManagedShareImageTask(taskId)`，优先调用 `POST /share-images/:taskId/process`，fallback 到 `POST /share-image-tasks/:taskId/process`；`ManagedShareImageTask` 增加 `miniProgramQrUrl / qrCodeUrl` 字段并从远端 normalize。 |
| `miniprogram/pages/share-poster/index.ts` | 引入 `processManagedShareImageTask()`；创建 task 后显式 process，再 GET 最新状态；失败 / 过期重试后也 process 再 GET。`ready && imageUrl` 才让主按钮进入“去分享 / 保存”链路；pending / processing 显示生成中；failed / expired 显示重新生成。保存图优先下载后端 ready `imageUrl`，不再用本地 canvas 冒充后端 ready PNG。 |
| `miniprogram/pages/session-brief/index.ts` | 同步手工构造 `ManagedShareImageTask` 的二维码字段空值，避免服务类型扩展后破坏简报分享入口。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 新增本节记录 008BK 合同、字段、阻塞和待测试项。 |

#### 14.106.3 状态机与字段映射

- `createManagedShareImageTask(briefId)`：只创建任务，不视为生成成功。
- `processManagedShareImageTask(taskId)`：显式触发后端生成流程。
- `getManagedShareImageTask(taskId)`：刷新真实 `status / imageUrl / miniProgramQrUrl / qrCodeUrl`。
- `shareTask.status=pending|processing`：`savePosterLabel=生成中`，主保存入口不保存，提示刷新状态。
- `shareTask.status=ready && shareTask.imageUrl`：`readyShareImageUrl` 非空，`savePosterLabel=去分享`，保存入口下载后端 ready PNG。
- `shareTask.status=ready && !shareTask.imageUrl`：继续视为生成未完成，不用本地 canvas 替代。
- `shareTask.status=failed|expired`：显示失败态，允许“重新生成”并走 retry -> process -> GET。
- `qrCodeImageUrl`：从 `task.miniProgramQrUrl || task.qrCodeUrl` 映射；后端 008BJ 未回包前为空，保存图只写“待接入真实字段”，不假画二维码。

#### 14.106.4 待测试路径 / selector / data

- 路径：`/pages/share-poster/index?briefId=<briefId>&taskId=<taskId>` 或 `/pages/share-poster/index?sessionId=<sessionId>&briefId=<briefId>`。
- 必查 data：`shareTask.status`、`shareTask.imageUrl`、`readyShareImageUrl`、`taskPrimaryLabel`、`savePosterLabel`、`qrCodeImageUrl`、`posterImagePath`。
- 必查按钮：`.poster-primary-action`、`.poster-action-secondary[data-share-save-selector="share-flow-015-save"]`、`.poster-state-card-warn`。
- 预期：创建后必须能看到 process/GET 后的真实状态；只有 `ready && imageUrl` 才进入“去分享”；二维码字段为空时不得出现假二维码。

#### 14.106.5 待验证与缺口

- 待跑验证：`npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check`。
- 待后端/API 008BJ：补 `miniProgramQrUrl / qrCodeUrl` 和 ready PNG；字段回包后前端可自然消费。
- 待测试单点复测：真实接口下确认 create -> process -> GET status 的 Network / Console / page data；本节不写测试通过、UI 通过或上线通过。

### 14.107 `PR-FE-LIVE-END-LABEL-LEDGER-AVATAR-GATE-008BO` 结束聚会 label 与账本头像门禁核修

#### 14.107.1 根因与边界

- 测试 13.16.120 已确认 `live-record` 视觉上有“继续拍照 / 结束聚会”，但 page data 仍保留 `finishMatchLabel=生成相册`，会造成 selector / data 口径误导。
- ledger 在 memberA 下只读，成员名和账本数可读，但 `avatarUrl=""` 时测试不能证明真实头像。本轮不生成默认头像、不用假头像兜底，只保持“有真实头像 URL 才渲染 image，空值显示空态”。
- host 写入仍等待接口联调 008BN 样本；若后端没有返回真实头像字段，依赖 008BM，不由前端自行生成头像。
- 本轮不重做 UI、不改数据结构、不破坏 008BE 状态 pill、008BF 结束聚会 / 确认修改链路、008BK 分享任务 process 状态机。

#### 14.107.2 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/live-record/index.ts` | 初始 data 的 `finishMatchLabel` 从 `生成相册` 改为 `结束聚会`，与页面按钮和测试口径一致。 |
| `miniprogram/pages/ledger/index.ts` | `handleConfirmTap()` 在 host 提交成功后调用 `hydrateLedger()`，按接口回包刷新 ledger data；runtime 已在 `persistPlayers()` 成功后同步，记录页返回时通过 onShow / loadTimeline 继续消费。 |
| `miniprogram/pages/ledger/index.wxml` | 只读核验：头像仍为 `wx:if="{{item.avatarUrl}}"` 才渲染 `<image>`；空值走 `.ledger-avatar-empty`，不冒充真实头像。确认按钮仍只在 `ledgerEditable && players.length` 时出现。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 新增本节记录 008BO 核修、头像门禁、host 样本依赖和待复测项。 |

#### 14.107.3 待测试路径 / selector / data

- `pages/live-record/index?sessionId=<sessionId>&role=judge|member`：检查 `finishMatchLabel=结束聚会`，底部 `.live-record008as-end-cta` 文案仍为“结束聚会”。
- `pages/ledger/index?sessionId=<sessionId>` memberA：检查 `ledgerEditable=false` 时不出现 `.ledger-confirm-submit` 和 `+/-`；`players[].avatarUrl=""` 时只显示空态，不写成真实头像通过。
- `pages/ledger/index?sessionId=<sessionId>` host 样本：待接口联调 008BN 给样本后检查 `ledgerEditable=true`、`.ledger-confirm-submit` 可见；点确定提交成功后 `hydrateLedger()` 刷新 `players / stats / ledgerEventCount`。

#### 14.107.4 待验证与缺口

- 待跑验证：`npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check`。
- 待接口 / 后端：008BN host 写入样本；008BM 如需补成员真实头像字段，由后端/API 回包，前端不生成假头像。
- 本节不写测试通过、UI 通过或上线通过。

### 14.108 `PR-FE-LEDGER-CONFIRM-EVENT-SYNC-008BQ` 账本确认提交同步 timeline event

#### 14.108.1 根因与边界

- 接口联调 008BN 已确认：`PUT /sessions/:sessionId` 只更新成员账本计数，不会自动新增 timeline event；若前端只 PUT，记录页时间线不会出现新的欠酒 / 加酒节点。
- 服务层已存在 `createManagedSessionEvent()`，对应 `POST /sessions/:sessionId/events`，无需新增后端合同。
- 本轮只补 host “确定修改”后的真实事件写入，不重做 UI、不改数据结构、不伪造本地 timeline 节点。
- member 只读路径保持不提交；host 权限仍以 `ledgerEditable` 为准。

#### 14.108.2 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/ledger/index.ts` | 引入 `createManagedSessionEvent()`；新增 `baselinePlayers` 保存上次接口 / runtime 同步快照；`persistPlayers()` 在 `PUT /sessions` 成功后，按 `baselinePlayers` 与当前 `players` 差异写入 `drink_debt / drink_add` event；事件成功后才同步 runtime 并刷新 ledger。刷新汇总时按玩家维度取 liveSession 成员计数与 timeline 事件汇总的较大值，避免 `PUT` 后新增 event 被重复相加。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 新增本节记录 008BQ 根因、差异映射、验证和待复测项。 |

#### 14.108.3 差异事件映射

- 欠酒差异：`next.debtCount - previous.debtCount !== 0` 时写 `eventType=drink_debt`，`scoreDelta=差异值`，`targetName / targetProfileId` 来自真实玩家。
- 加酒差异：`next.drinkCount - previous.drinkCount !== 0` 时写 `eventType=drink_add`，`scoreDelta=差异值`，`targetName / targetProfileId` 来自真实玩家。
- 时间：前端不传 `createdAt`，由后端事件接口生成真实时间；记录页 / timeline 后续重新拉取 `GET /sessions/:sessionId/timeline` 消费后端返回节点。
- `clientEventId` 仅作为客户端幂等标识，不作为用户可见时间或 timeline 时间证据。

#### 14.108.4 待测试路径 / selector / data

- `pages/ledger/index?sessionId=session-1781787045680-8e406c` host 样本：token 后 8 位 `ddceb616`，检查 `ledgerEditable=true`、`.ledger-confirm-submit`、`baselinePlayers`、`players`、`ledgerDirty`、`ledgerSubmitting`。
- 操作：对 memberA 欠酒 +1 或 memberB 加酒 +1，点“确定修改”；Network 应出现 `PUT /sessions/:sessionId` 后跟 `POST /sessions/:sessionId/events`。
- 返回 / 切到 `pages/live-record/index?sessionId=session-1781787045680-8e406c&role=judge`：检查 `recordTimelineItems` / `recordTimelineDisplayItems` / `ledgerTimelineItems` 能从重新拉取的 timeline 看到新增账本节点。

#### 14.108.5 待验证与缺口

- 待跑验证：`npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check`。
- 待测试单点复测：host 样本确认计数更新 + event 写入 + live-record timeline 刷新；本节不写测试通过、UI 通过或上线通过。

### 14.109 `PR-FE-LEDGER-LIVE-AVATAR-MAP-008BS` 账本 / 记录页真实头像字段映射

#### 14.109.1 根因与边界

- PM 13.16.122 替代核验证明 raw API timeline 已返回头像：最近账本 event 含 `operatorAvatarUrl=/static/avatar-1.png`、`targetAvatarUrl=/static/avatar-1.png`，但小程序 page data 仍为空。
- 根因 1：`normalizeManagedAvatarPath()` 和 runtime `normalizeAvatarUrl()` 旧逻辑把 `/static/avatar-*.png` 当作旧默认头像过滤为空，导致 `joinedPlayers[].avatarUrl / joinStatusPlayers[].avatarUrl / uploaderAvatarUrl` 进入页面前被清掉。
- 根因 2：`RemoteSessionEventRecord / ManagedSessionEventRecord` 未声明和 normalize `operatorAvatarUrl / targetAvatarUrl`，账本 event 头像字段在服务层丢失。
- 本轮只修头像字段映射，不重做 UI、不改后端合同、不改数据结构；空头像仍保持空态，不用默认头像冒充真实头像。

#### 14.109.2 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/config/assets.ts` | `normalizeManagedAvatarPath()` 放行接口返回的 `/static/*`、`/uploads/*` 和同源 http(s) 头像，并转成当前 API origin 下可加载 URL；继续过滤 `__store__ / __tmp__` 等本地缓存污染路径。 |
| `miniprogram/utils/session.ts` | runtime 头像清洗不再把 `/static/avatar-*.png` 清空；仍过滤项目内旧 `/assets/avatars/` 和本地 store/tmp 污染路径。 |
| `miniprogram/services/operations.ts` | `RemoteSessionEventRecord / ManagedSessionEventRecord` 增加 `operatorAvatarUrl / targetAvatarUrl`，normalize 时使用 `normalizeManagedAvatarPath()`。 |
| `miniprogram/pages/live-record/index.ts` | 账本 timeline 节点 `actorAvatarUrl` 优先使用 `node.targetAvatarUrl`，再兜到 records/runtime 中已有真实头像。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 新增本节记录 008BS 根因、字段映射和待复测项。 |

#### 14.109.3 待测试路径 / data

- `pages/ledger/index?sessionId=session-1781787045680-8e406c&role=host`：检查 `players[].avatarUrl` 是否能看到接口返回的 `/static/avatar-*.png` 归一化 URL；若接口仍返回空，页面只能显示空态。
- `pages/live-record/index?sessionId=session-1781787045680-8e406c&role=judge`：检查 `players[].avatarUrl`、`records[].avatarUrl`、`timelineNodes[].uploaderAvatarUrl`、`timelineNodes[].operatorAvatarUrl`、`timelineNodes[].targetAvatarUrl`、`recordTimelineItems[].actorAvatarUrl`。
- 预期：raw API 有头像字段时 page data 不再为空；raw API 无头像字段时前端不生成假头像。

#### 14.109.4 待验证与缺口

- 待跑验证：`npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check`。
- 待测试单点复测：host storage/token 后 8 位 `ddceb616` 下复查 ledger/live-record page data；本节不处理截图工具 `fail to capture screenshot`，不写测试通过、真机通过或上线通过。

### 14.110 `PR-FE-LEDGER-PERMISSION-AVATAR-MAP-008BT` ledger 权限与成员头像映射单点修复

#### 14.110.1 根因与边界

- PM 13.16.124 已确认 `live-record` 头像映射恢复，但 ledger 在 host storage 下仍出现 `isJudge=false / ledgerEditable=false`，且 memberA `avatarUrl=""`。
- 权限根因：ledger 只在 `runtime.currentUser?.id` 已存在时才用 `getCurrentDisplayProfile()` 刷新 currentUser，若 runtime 里残留旧身份或为空，会用错误 profileId 与 `liveSession.hostProfileId` 比对，导致 host token 被误判只读。
- 头像根因：ledger 只从 `liveSession.joinStatusPlayers[].avatarUrl` 和 runtime selectedPlayers 合并头像；当某成员 joinStatus 头像为空，但 timeline event 已有 `operatorAvatarUrl/targetAvatarUrl` 时，ledger 未消费 timeline 头像补齐。
- 本轮只修 `ledger` 权限与头像 page data；不使用 query `role=host` 越权，不重做 UI，不改后端合同，不生成默认头像。

#### 14.110.2 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/utils/social.ts` | `normalizeSocialAvatarUrl()` 放行接口返回的 `/static/avatar-*.png`，避免当前登录 profile 头像被 social 层清空。仍过滤旧 `/assets/avatars/` 和本地 store/tmp 污染路径。 |
| `miniprogram/pages/ledger/index.ts` | `hydrateLedger()` 无论 runtime.currentUser 是否已存在，都用 `getCurrentDisplayProfile()` 的真实 `id/name/avatarUrl` 同步 runtime.currentUser，再用它与 `liveSession.hostProfileId` 判断 `isJudge/ledgerEditable`；新增 `buildTimelineAvatarMap()`，从 timeline 的 `uploaderAvatarUrl/operatorAvatarUrl/targetAvatarUrl` 按 profileId 补齐 `players[].avatarUrl`。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 新增本节记录 008BT 根因、修复和复测 data。 |

#### 14.110.3 待测试路径 / data

- host 路径：`/pages/ledger/index?sessionId=session-1781787045680-8e406c&role=host`，storage token 后 8 位 `ddceb616`。
- 必查 data：`sessionId`、`players[].avatarUrl`、`stats`、`isJudge`、`ledgerEditable`、`ledgerDirty`、`ledgerSubmitting`、`ledgerEventCount`、`hasSession`。
- 预期：host token 对应 `profileId=user-1781787045678-c892b9` 时，`liveSession.hostProfileId` 匹配后 `isJudge=true / ledgerEditable=true`；member 普通账号仍为只读。`players[].avatarUrl` 能消费 `/static/avatar-*.png`；source 为空时仍为空态。

#### 14.110.4 待验证与缺口

- 待跑验证：`npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check`。
- 待测试单点复测：不处理截图工具和 Network 抓取；只看 ledger page data 是否恢复权限和头像字段。本节不写测试通过、真机通过或上线通过。

### 14.111 `PR-FE-LIVE-RECORD-END-STATE-008BW` 结束聚会状态收口

#### 14.111.1 根因与边界

- 根因：`live-record.handleFinishTap()` 复用了 `confirmAndExitSession()`，该工具函数文案为“确认退出聚会”，并会调用 `deleteManagedSession()` 删除当前 session；这与“结束聚会是状态收口、保留数据”的产品口径冲突。
- 本轮只修前端结束按钮流程和首页进行中返回条过滤，不重做 UI、不改接口数据结构、不清理样本、不触碰 `pomer.cn` 官网。
- `confirmAndExitSession()` 仍保留给真正退出/清理路径；`handleFinishTap()` 不再调用它，也不再触发 `deleteManagedSession()`。
- 后端 008BV 独立结束合同尚需确认；前端封装 `finishManagedSession()` 优先尝试专用结束接口，若接口未就绪会暴露联调失败，不用本地假状态冒充后端成功。

#### 14.111.2 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/services/operations.ts` | 新增 `finishManagedSession()` 与 `ManagedSessionFinishResult`，结束流程优先尝试 `POST /sessions/:sessionId/end`，再尝试 `POST /sessions/:sessionId/finish`，最后按后端 008BV 状态合同 `PUT /sessions/:sessionId` 写入 `state=已结束 / status=已结束`；不调用 DELETE。 |
| `miniprogram/pages/live-record/index.ts` | `handleFinishTap()` 改为专用“确认结束聚会”弹窗，按钮为“结束聚会 / 继续记录”；确认后先保存 host 账本记录，再调用 `finishManagedSession()`，成功后禁用误触离开告警、写入 runtime `state/status/endedAt`，提示“聚会已结束”并跳转 `pages/me/index`。 |
| `miniprogram/utils/session.ts` | `SessionRuntime` 增加 `state/status/endedAt` 兼容字段，供结束后 runtime 记录后端状态。 |
| `miniprogram/utils/session-return.ts` | 首页进行中返回条在 runtime `state/status` 为已结束、ended、finished、closed、deleted 等状态时返回不可见，避免已结束聚会继续显示为进行中。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 新增本节记录 008BW 根因、修复、验证和后端依赖。 |

#### 14.111.3 待测试路径 / data

- 路径：`/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=judge` 或后端 008BV 提供的 host 样本。
- 必查交互：点击“结束聚会”只出现“确认结束聚会 / 结束聚会 / 继续记录”，不得出现“退出 / 删除 / 清空 / 朋友不可加入”等语义。
- 必查 Network：结束按钮不得调用 `DELETE /sessions/:sessionId`；若后端 008BV 提供专用接口，应命中专用 finish/end 接口并返回结束状态。
- 必查 data/storage：成功后 runtime 应有 `state/status/endedAt`；首页 `sessionReturn.visible` 不应再把该 session 显示为进行中；个人中心/历史应按后端返回的已结束状态展示。

#### 14.111.4 待验证与缺口

- 本轮已跑静态验证：`npm.cmd run typecheck` 通过；`npm.cmd run check:encoding` 通过；目标 `git diff --check` 通过，仅有 LF/CRLF warning。
- 后端依赖：008BV 仍需确认最终状态收口接口路径和返回字段；若 `/end`、`/finish`、`PUT state/status` 均不可用，测试应按接口阻塞回传后端/API，不得把前端标记为上线通过。

### 14.112 `PR-FE-LIVE-HERO-OVERLAP-008CA` 记录页 Hero 顶部文字叠压修复

#### 14.112.1 根因与边界

- 用户截图退回：`live-record` 顶部 Hero 中左上“进行中”状态胶囊与真实聚会名“周末聚会记录”叠压，右侧工具按钮也压近标题。
- 根因：`.live-record008as-hero-top` 为绝对定位顶部行，但 `.live-record008as-title-wrap` 只保留 9px 顶部间距，标题进入状态 / 工具行占用区域；窄屏下 meta 与标题也缺少换行保护。
- 本轮只修 `live-record008as` Hero 顶部布局，不改 sessionName 数据来源、不恢复标题图、不新增素材、不改结束聚会、账本、分享、相册链路。

#### 14.112.2 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/live-record/index.less` | Hero 高度由 208px 调整为 222px；顶部状态 / 工具行固定在左右 16px 安全区，增加行高和 gap；标题区下移到独立行并增加内边距；meta 行允许换行，避免 320px-375px 宽度下文字互压。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 新增本节记录 008CA 根因、改动文件和待复测点。 |

#### 14.112.3 待测试路径 / 验收点

- 路径：`/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=judge` 或测试 008CA 指定样本。
- 390 / 375 / 320 宽预览重点看：`进行中` 状态完整可见；右侧齿轮 / 更多按钮不压标题；`周末聚会记录` 完整可读；人数 / 时间 meta 不压标题或状态。
- 约束：标题仍使用真实 `sessionName` 文本，不使用 008AT 标题图片，不改变 `recordTimelineDisplayItems`、账本计数、CTA 和结束聚会逻辑。

#### 14.112.4 待验证

- 本轮已跑静态验证：`npm.cmd run typecheck` 通过；`npm.cmd run check:encoding` 通过；目标 `git diff --check -- miniprogram/pages/live-record/index.less docs/gameplay-moments-frontend-development-plan.md` 通过，仅有 LF/CRLF warning；前端计划 no-index diff check 通过，仅有 LF/CRLF warning。
- 待测试 008CA 用 9420 预览框复拍；本节不写预览通过、UI 通过或上线通过。

### 14.113 `PR-FE-ME-ENDED-SESSION-LABEL-008CC` 个人中心已结束状态标签接入

#### 14.113.1 后端合同与边界

- 后端 `PR-BE-ME-ENDED-SESSION-FIELDS-008CB` 已回包：`GET /api/v1/user/session-moment-summaries` 每条摘要返回 `state`、`stateText`、`status`、`endedAt`、`updatedAt`、`canResume`、`canShare`、`readyShareImageUrl`。
- 已结束样本：`session-1781787045680-8e406c` 读回 `state/status=已结束`、`endedAt/updatedAt` 存在、`canResume=false`、`canResumeMomentIds=[]`。
- 本轮只接个人中心列表展示链路，不改变首页进行中规则，不影响 `live-record`、账本、分享、相册数据结构，也不和 008CD Hero 样式混改。
- 结束态判断只消费明确字段 `state/status/stateText/endedAt`，不按 `canResume=false` 单独脑补“已结束”。

#### 14.113.2 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/services/operations.ts` | `RemoteSessionMomentSummary / ManagedSessionMomentSummary` 接入并 normalize `state/status/stateText/endedAt/updatedAt/canResume/canShare/readyShareImageUrl`。 |
| `miniprogram/pages/me/index.ts` | `PendingAlbumItem` 增加 `isEnded/stateLabel/actionLabel/endedAt/state/status`；新增 `isEndedSessionSummary()`，仅按明确结束字段生成“已结束”；已结束 session 的 action 固定为“查看”。 |
| `miniprogram/pages/me/index.wxml` | 待处理 / 历史列表项展示 `stateLabel` 小标签；结束态使用“已结束”标签，并用 `actionLabel` 替代 `canResume ? 继续 : 查看`。 |
| `miniprogram/pages/me/index.less` | 增加 `.me-pending-title-row`、`.me-pending-state`、`.me-pending-state-ended`、`.me-pending-action-muted`，只做简洁状态标签和弱化查看入口。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 更新 14.113，从待接登记改为字段接入实现记录。 |

#### 14.113.3 待测试路径 / data

- 复测路径：`/pages/me/index`。
- 必查 data：`momentSummaries[].state`、`momentSummaries[].status`、`momentSummaries[].stateText`、`momentSummaries[].endedAt`、`momentSummaries[].updatedAt`、`momentSummaries[].canResume`、`visiblePendingAlbums[].isEnded`、`visiblePendingAlbums[].stateLabel`、`visiblePendingAlbums[].actionLabel`。
- 预期：`state/status/stateText` 为已结束或 `endedAt` 存在时，个人中心列表显示“已结束”标签，入口为“查看”；普通未结束且可补图聚会仍显示“继续”。
- 本任务不改首页 `sessionReturn` 规则；已结束聚会是否从首页进行中消失仍以 14.111/后端状态为准。

#### 14.113.4 待验证

- 本轮已跑静态验证：`npm.cmd run typecheck` 通过；`npm.cmd run check:encoding` 通过；目标 `git diff --check -- miniprogram/services/operations.ts miniprogram/pages/me/index.ts miniprogram/pages/me/index.wxml miniprogram/pages/me/index.less docs/gameplay-moments-frontend-development-plan.md` 通过，仅有 LF/CRLF warning。
- 待测试派 `PR-QA-ME-ENDED-SESSION-LABEL-008CC-RETEST` 用后端 008CB 样本复拍个人中心；本节不写测试通过、UI 通过或上线通过。

### 14.114 `PR-FE-LIVE-HERO-STATUS-CLIP-008CD` 记录页 Hero 状态胶囊左裁切修复

#### 14.114.1 退回证据与根因

- 测试 13.16.129 退回截图：`docs/runtime/pr-qa-live-hero-overlap-008ca-current-410x1032-20260619.png`。
- 退回点：410 宽右侧预览中左上状态胶囊仍被左侧裁切，只露出末尾“中”；标题 `生'史'局` 为真实 `sessionName` 文本，`titleImageSrc=""`，右侧工具和 meta 未明显压住标题。
- 根因：008CA 将 `.live-record008as-hero-top` 左边界设为 16px，但页面使用透明自定义导航，左上区域仍处在导航返回触控 / 遮罩安全区内；状态胶囊不是文字宽度不足，而是容器定位进入左侧导航保护区后被运行态裁切。

#### 14.114.2 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/live-record/index.less` | `.live-record008as-hero-top` 左边界从 16px 改为 72px，避开导航返回安全区；保留右侧 16px 工具按钮安全区；360px 以下用 64px 左边界、缩小 gap / 胶囊 padding / 工具按钮，保证窄屏仍能完整显示“进行中”。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 新增本节记录 008CD 根因、改动文件和待复测点。 |

#### 14.114.3 待测试路径 / 验收点

- 路径：`/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=judge` 或测试 008CD 指定样本。
- 必查：410 / 390 / 375 / 320 宽预览中“进行中”完整可见，不只露“行中 / 中”；右侧齿轮 / 更多不压标题；真实 `sessionName` 文本不改为图片；meta row 仍可读。
- 本轮不改结束聚会、账本、分享、相册、个人中心和 008CC 待后端字段任务。

#### 14.114.4 待验证

- 本轮已跑静态验证：`npm.cmd run typecheck` 通过；`npm.cmd run check:encoding` 通过；目标 `git diff --check -- miniprogram/pages/live-record/index.less docs/gameplay-moments-frontend-development-plan.md` 通过，仅有 LF/CRLF warning。
- 待测试 008CD 用 9420 预览框复拍；本节不写预览通过、UI 通过或上线通过。

### 14.115 `PR-FE-ME-SESSION-CARD-ACTION-LAYOUT-008CF` 个人中心聚会列表状态 / 操作区收敛

#### 14.115.1 退回原因与边界

- 用户截图退回：个人中心聚会列表右侧 `进行中` 与 `查看` 两个胶囊像漂浮元素，留白过大、主次不清。
- 语义退回：进行中聚会不应只显示“查看”，应使用“继续 / 进入本局”语义；已结束才显示“查看”。
- 本轮只修个人中心聚会 / 历史列表项右侧状态与操作区，不改首页进行中规则，不改 `live-record`、账本、相册、分享和后端接口。
- 保留 008CC 原则：结束态只看 `state/status/stateText/endedAt` 明确字段，不用 `canResume=false` 单独推断。

#### 14.115.2 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/me/index.ts` | `actionLabel` 改为：已结束显示“查看”；非结束且可继续显示“进入本局”；普通只读显示“查看”。 |
| `miniprogram/pages/me/index.wxml` | 将状态标签从标题行移到右侧 `.me-pending-action-stack`，与操作按钮同列展示，标题区域只保留标题和 meta。 |
| `miniprogram/pages/me/index.less` | 列表项第三列改为 `minmax(74px, auto)`；新增 `.me-pending-action-stack`，让状态标签和操作按钮有明确行高、间距和右对齐；标题列继续 `minmax(0,1fr)`，窄屏长标题不挤爆操作区。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 新增本节记录 008CF 退回原因、改动文件和复测点。 |

#### 14.115.3 待测试路径 / data

- 路径：`/pages/me/index`。
- 必查 data：`visiblePendingAlbums[].isEnded`、`visiblePendingAlbums[].stateLabel`、`visiblePendingAlbums[].actionLabel`。
- 预期：已结束项显示“已结束 / 查看”；进行中或可继续项显示状态标签 + “进入本局”；长标题不压右侧按钮，状态和按钮不漂浮、不破界。

#### 14.115.4 待验证

- 本轮已跑静态验证：`npm.cmd run typecheck` 通过；`npm.cmd run check:encoding` 通过；目标 `git diff --check -- miniprogram/pages/me/index.ts miniprogram/pages/me/index.wxml miniprogram/pages/me/index.less docs/gameplay-moments-frontend-development-plan.md` 通过，仅有 LF/CRLF warning。
- 待测试派 `PR-QA-ME-SESSION-CARD-ACTION-LAYOUT-008CF-RETEST` 复拍个人中心；本节不写测试通过、UI 通过或上线通过。

### 14.116 `PR-FE-ME-PENDING-MEMORY-COPY-TIMELINE-008CH` 待分享回忆文案与时间线承接

#### 14.116.1 退回原因与边界

- 用户追问“待处理到底待处理啥”，PM 确认 `待处理相册` 是旧后台 / 管理视角词，普通用户不可理解。
- 本轮只修个人中心和过渡相册列表的用户文案与承接路由，不改后端字段、不清缓存、不重启 DevTools、不触碰分享图生成、账本写回、首页进行中规则。
- 主路径目标：待分享 / 待完善回忆卡片点击进入新版记录时间线，优先 `/pages/live-record/index?sessionId=...`；不得把个人中心待分享卡片主路径继续接到旧 `/pages/session-brief/index`。

#### 14.116.2 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/me/index.ts` | 默认统计标签从“待处理”改为“待分享”；内部样本标题 fallback 从“待处理相册 N”改为“待分享回忆 N”；无明确状态时 meta 改为“待分享回忆”；提示文案改为“从下方待分享回忆选择具体聚会查看”；待分享卡片点击优先进入 `/pages/live-record/index?sessionId=...`，缺 sessionId 时不再跳旧简报壳。 |
| `miniprogram/pages/me/index.wxml` | 区块标题改为“待分享回忆”，查看全部文案改为“查看全部待分享回忆”。 |
| `miniprogram/pages/album/index.ts` | `unshared` 过渡列表标题改为“待分享回忆”，空态改为“暂无待分享回忆。”；条目点击优先进入 `/pages/live-record/index?sessionId=...`，缺 sessionId 时提示缺少回忆信息，不再进入旧 `session-brief`。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 新增本节记录 008CH 文案、路由和待复测点。 |

#### 14.116.3 路由与扫描结果

- 个人中心待分享卡片主路径：`/pages/live-record/index?sessionId=<sessionId>`。
- 过渡列表 `/pages/album/index?mode=unshared` 条目主路径：`/pages/live-record/index?sessionId=<sessionId>`。
- 已自查源码：`miniprogram/pages/me` 与 `miniprogram/pages/album` 用户可见层不再命中“待处理相册 / 查看全部待处理 / 从下方待处理 / 待整理”；待分享卡片主路径不再是 `session-brief`。
- 保留说明：`handleMomentBriefTap()` / `handleMomentResumeTap()` 中仍可能保留旧简报入口给其他摘要组件事件使用，本轮没有把非待分享卡片的历史入口一并重构；待分享卡片 `handlePendingAlbumTap()` 已改到新版时间线。

#### 14.116.4 待验证

- 本轮已跑静态验证：`npm.cmd run typecheck` 通过；`npm.cmd run check:encoding` 通过；目标 `git diff --check -- miniprogram/pages/me/index.ts miniprogram/pages/me/index.wxml miniprogram/pages/album/index.ts docs/gameplay-moments-frontend-development-plan.md` 通过，仅有 LF/CRLF warning。
- 待测试派 `PR-QA-ME-PENDING-MEMORY-COPY-TIMELINE-008CH-RETEST` 复拍 `/pages/me/index` 和 `/pages/album/index?mode=unshared`；本节不写测试通过、UI 通过或上线通过。

### 14.117 `PR-FE-ME-ALBUM-SHARE-IA-008CI` 个人中心相册 / 分享图信息架构收口

#### 14.117.1 用户规则与边界

- 用户明确：个人中心“相册数 / 回忆数”代表所有聚会记录，包含进行中、已完成 / 已结束等全部状态；“待分享回忆”只放还没有生成分享图且未结束的聚会；“分享图”只放已经生成过的分享图合集。
- 本轮只修个人中心统计、待分享回忆列表和相册承接页前端筛选 / 路由，不改后端、不造假分享图、不恢复旧 `待处理相册`、旧品牌或旧 `session-brief` 主承接页。
- 分享图是否已生成只认真实 URL：`readyShareImageUrl || shareImageUrl`。`canShare`、默认封面或本地默认图不能冒充已生成分享图。
- 已结束判断继续使用明确字段：`endedAt` 或 `state/status/stateText` 中的“已结束 / 结束 / 已完成 / ended / finished / closed”，不单独用 `canResume=false` 推断业务状态。

#### 14.117.2 改动文件

| 文件 | 改动 |
| --- | --- |
| `miniprogram/pages/me/index.ts` | 顶部统计改为“回忆数 / 分享图”，移除重复“待分享”入口；“回忆数”统计全部 `momentSummaries`，点击进入 `/pages/album/index?mode=records`；“分享图”统计真实已生成分享图 URL 的条目，点击进入 `/pages/album/index?mode=shares`；“待分享回忆”列表过滤为 `!isEnded && !(readyShareImageUrl || shareImageUrl)`；“已结束”统计进入 `/pages/album/index?mode=ended`。 |
| `miniprogram/pages/album/index.ts` | 新增 `records / shares / ended / unshared` 模式：`records` 显示全部聚会记录，`shares` 只显示真实已生成分享图，`ended` 只显示已结束聚会，`unshared` 只显示未结束且未生成分享图的待分享回忆；列表项缺 `briefId` 时不再用 `sessionId` 调 `getManagedSessionBrief()`，避免首页 / 相册列表继续刷 `/briefs/session-*` 404。 |
| `miniprogram/pages/album/index.wxml` | 列表项透传 `data-share-image-url`，`shares` 模式点击只预览真实已生成分享图 URL；无 URL 时提示“分享图还未生成”，不使用默认图冒充。 |
| `docs/gameplay-moments-frontend-development-plan.md` | 新增本节记录 008CI 入口语义、筛选条件、路由流向和待复测点。 |

#### 14.117.3 路由与筛选条件

| 入口 | 路由 / 行为 | 筛选条件 |
| --- | --- | --- |
| 个人中心顶部“回忆数” | `/pages/album/index?mode=records` | 全部 `getManagedSessionMomentSummaries()` 条目。 |
| 个人中心顶部“分享图” | `/pages/album/index?mode=shares`，点击条目 `wx.previewImage()` 查看真实分享图 | `readyShareImageUrl || shareImageUrl`。 |
| 下方“待分享回忆 / 查看全部待分享回忆” | `/pages/album/index?mode=unshared`，条目进入 `/pages/live-record/index?sessionId=...` | 未结束且没有 `readyShareImageUrl/shareImageUrl`。 |
| “已结束”统计 | `/pages/album/index?mode=ended` | 明确已结束字段命中；不靠 `canResume=false` 单独推断。 |

#### 14.117.4 待验证

- 本轮已跑静态验证：`npm.cmd run typecheck` 通过；`npm.cmd run check:encoding` 通过；目标 `git diff --check -- miniprogram/pages/me/index.ts miniprogram/pages/album/index.ts miniprogram/pages/album/index.wxml docs/gameplay-moments-frontend-development-plan.md` 通过，仅有 LF/CRLF warning。
- 未跟踪目标文件已补 no-index 空白检查：`docs/gameplay-moments-frontend-development-plan.md`、`miniprogram/pages/album/index.ts`、`miniprogram/pages/album/index.wxml` 均通过，仅有 LF/CRLF warning。
- 已自查扫描：`miniprogram/pages/me` 与 `miniprogram/pages/album` 用户可见文案不再命中“待处理相册”；个人中心顶部统计不再有独立“待分享”入口；相册页不再命中 `getManagedSessionBrief(item.briefId || item.sessionId)`。
- 待测试派 `PR-QA-ME-ALBUM-SHARE-IA-008CI-RETEST` 复拍 `/pages/me/index`、`/pages/album/index?mode=records`、`/pages/album/index?mode=shares`、`/pages/album/index?mode=unshared`、`/pages/album/index?mode=ended`；本节不写测试通过、UI 通过或上线通过。

### 14.118 `PR-FE-GLOBAL-OLD-STYLE-SHELL-BAN-008CK` 全局旧壳 / 框套框实现纪律

#### 14.118.1 全局纪律

- 用户明确退回：当前前端仍有旧项目样式习惯，页面“全是框，一框圈一框”，不允许继续用旧壳补丁推进。
- 自本节起，所有新页面和正在改的页面禁止用旧项目框套框、卡套卡、浅色块兜底、默认圆角面板、重复胶囊、厚重列表作为完成口径。
- 视觉实现必须按 UI/UX 设计图、资产包、切图和明确组件层级 1:1 复刻；没有 UI 图或资产时只能标 `待 UI/UX` / `阻塞`，不得前端自行脑补旧壳、CSS 近似或 fallback layout。
- 当前个人中心已进入 UI/UX `PR-UX-ME-PROFILE-REDESIGN-SKILL-008CJ`，008CI 只保留 IA / 字段 / 路由逻辑；个人中心整页、聚会记录分类列表、分享图合集页视觉等待 008CJ 回包后再复刻。
- 不破坏既有数据结构、接口、路由和已通过的账本 / 结束 / 头像 / 分享状态逻辑；本任务不把任何视觉页面写成通过。

#### 14.118.2 旧样式残留扫描清单

静态扫描范围：`miniprogram/pages/me`、`miniprogram/pages/album`、`miniprogram/pages/live-record`、`miniprogram/pages/share-poster`、`miniprogram/pages/share-preview`、`miniprogram/pages/invite-group`。扫描关键词覆盖 `card / panel / empty / fallback / placeholder / pill / badge / border / shadow / 卡片 / 面板 / 圆角 / 浅色 / 框`。

| 优先级 | 页面 / 文件 | 命中风险 | 处理口径 |
| --- | --- | --- | --- |
| P0 | `miniprogram/pages/me/index.wxml`、`miniprogram/pages/me/index.less` | `me-member-card`、`me-pending-list`、授权面板等仍沿旧个人中心卡片 / 面板结构；008CI 只修逻辑，视觉不得继续自行补。 | 等 UI/UX 008CJ 设计图和资产清单回包后 1:1 重做；当前仅保留 IA / 字段 / 路由逻辑。 |
| P0 | `miniprogram/pages/album/index.wxml`、`miniprogram/pages/album/index.less` | 新增 records / shares / unshared / ended 承接页仍存在 `album-card`、`album-empty`、浅色边框和默认圆角列表风险。 | 作为 008CJ 的“聚会记录分类列表 / 分享图合集页”待复刻范围；当前不再增加自创视觉结构。 |
| P0 | `miniprogram/pages/share-poster/index.wxml`、`miniprogram/pages/share-poster/index.less` | `poster-stage-card`、`poster-timeline-card`、`poster-action-panel`、`poster-state-card` 等仍有多层卡片 / panel / 状态卡残留风险。 | 分享页 / 保存图后续视觉必须绑定 UI/UX 资产包；无图不再做前端旧壳压缩。 |
| P1 | `miniprogram/pages/share-preview/index.wxml`、`miniprogram/pages/share-preview/index.less` | 回流页仍有 `share-poster-card`、fallback、pill、空态块等结构。 | 邀请极简与分享回流逻辑保留；视觉重做需 UI/UX 明确图和资产。 |
| P1 | `miniprogram/pages/live-record/index.wxml`、`miniprogram/pages/live-record/index.less` | 已接 008AR/008AU 资产，但仍命中 `live-compat-panel`、`live-record-stat-card`、`live-photo-empty`、旧 card / panel 兼容类。 | 记录页后续只按 UI/UX 资产补齐，不回退旧厚列表；兼容类需在后续有图任务里逐步删减。 |
| P1 | `miniprogram/pages/invite-group/index.wxml`、`miniprogram/pages/invite-group/index.less` | 邀请页已有固定纸页图层，但仍命中 `invite-card`、`invite-copy-card`、头像空槽边框和按钮面板类。 | 保留已接 UI 纸页 / 分享按钮链路；后续视觉偏差只按 UI 图处理，不用 CSS 伪造纸页或兜底块。 |

#### 14.118.3 008CI / 008CJ 边界

- 008CI 已完成的是信息架构逻辑：`回忆数` = 全量聚会记录，`分享图` = 真实已生成分享图 URL 合集，`待分享回忆` = 未结束且未生成分享图，顶部不再重复“待分享”。
- 008CI 不继续设计个人中心视觉，不新增自创卡片、图标、背景、按钮状态或空态样式。
- 008CJ 回包后，前端再按 UI/UX 输出的整页设计、聚会记录分类列表、分享图合集页和资产路径执行复刻；缺字段或缺素材时记录阻塞，不拼假分享图、不用默认图冒充生成图。

#### 14.118.4 待验证

- 本轮已跑静态验证：`npm.cmd run typecheck` 通过；`npm.cmd run check:encoding` 通过；目标 `git diff --check -- docs/gameplay-moments-frontend-development-plan.md` 通过。
- 因当前前端计划文件在工作树中为未跟踪状态，已补 no-index 空白检查：`git diff --no-index --check -- <empty> docs/gameplay-moments-frontend-development-plan.md` 通过，仅有 LF/CRLF warning。
- 本节为全局实现纪律和残留清单，不写页面通过、UI 通过或上线通过；后续任一视觉实现必须在前端计划写明 UI 图 / 资产来源。

## 15. 当前前端结论

截至 2026-06-15，前端侧已有 M0 服务层、M1 页面/组件基础、当前酒局返回条、M2 `session-brief` 页面基础、收尾照入口、历史简报入口、待补图摘要入口、M3 分享任务状态组件、个人页/历史页分享任务摘要状态、`share-poster` 任务化流程、M5 `rankings` 页面首轮代码证据和 `session-brief` / `wine-history` 榜单入口；第二轮已修复 `DEV-M1-02` / `DEV-M1-03` / `DEV-M1-04` 相关 P0 风险，使普通成员也能从 `live-record` 进入“记精彩瞬间”。但前端负责人尚未提交真机验收记录，因此前端任务仍只能标记为“代码证据已出现 / 待真机联调 / 待复核”，不能标记为已完成。M1 三用户私密真机链路、M3 全状态真实样本联调、M5 固定榜单数据联调和真机推举流程仍未完成。
