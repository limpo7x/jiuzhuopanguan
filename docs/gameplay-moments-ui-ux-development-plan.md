# 酒桌判官精彩瞬间 UI/UX 版本升级计划

角色：UI/UX 负责人（已新增，待登记姓名/账号）
日期：2026-06-15

## 1. 角色边界

UI/UX 负责人只负责界面交互合理性、视觉一致性、移动端可用性、状态表达、设计验收和问题退回，不直接承担前端代码实现、后端接口、后台数据、测试结论或 PM 总进度汇总。

UI/UX 负责人只能维护本文档中的设计节点、评审记录和证据说明。总进度仍由 PM 在读取本文、前端计划、测试记录、接口联调记录和真实截图后统一更新。

如果只有设计建议或视觉方向，没有真机截图、实现截图、交互录屏或设计 QA 证据，相关任务只能标记为“待设计复核 / 待联调 / 待整改”，不能标记为“通过”。

## 2. 已读取的 SKILL 与使用边界

| SKILL | 本迭代用途 | 明确边界 |
| --- | --- | --- |
| `product-design:design-qa` | 对“源视觉目标”和“已实现截图”做设计还原与交互 QA | 必须同时具备目标稿/截图和实现截图；缺任一项时只能输出 blocked，不能凭代码或口头描述判定通过 |
| `product-design:index` | 路由 Product Design 工作流，区分 audit、ideate、prototype、design-qa | 当前只做计划和审核，不进入 prototype 或 image-to-code；后续若要生成设计方案，先确认 brief 和视觉目标 |
| `design-taste-frontend` | 用于识别移动页面常见 AI 设计问题：卡片套卡片、按钮溢出、状态混乱、视觉割裂 | 该 skill 偏营销/展示页，不作为后台表格或小程序产品流的唯一规范；只吸收其排版、状态、对比度和反模板检查 |
| `web-design-guidelines` | 对已有小程序页面/组件做代码层界面可用性、状态文案、触控和内容溢出初审 | 只能作为截图前的代码审查基线；小程序不等同 Web DOM，不能替代真机截图、微信开发者工具验证或 `design-qa` |
| `imagegen` | 需要生成分享图视觉参考、空态插图、活动封面或真实视觉资产时使用 | 当前不生成图片；生成的位图必须落到项目资产目录并经 PM/前端确认后才能接入 |
| `imagegen-frontend-mobile` | 需要探索小程序移动端屏幕概念时生成屏幕参考图 | 只生成移动端设计图，不写代码；不得把生成图直接视为已实现页面 |

## 3. SKILL 自动选择规则

UI/UX 负责人每次接到界面、交互、视觉、截图、流程或设计验收任务时，必须先自动判断任务类型，再选择合适 SKILL 配合使用。不能只凭个人经验或单个页面截图做结论。

自动选择顺序：

1. 先查项目既有页面、组件、样式和本迭代文档，确认是否已有同类交互和设计语言。
2. 判断任务类型：评审、生成概念图、生成真实资产、移动端流程探索、发布前设计 QA。
3. 检查证据是否齐全：目标状态、实现截图、真机/浏览器截图、数据样本、角色权限。
4. 根据下表选择 SKILL；若证据不足，先标记 `blocked` 并写清缺口。
5. 输出问题清单时必须写明使用的 SKILL、适用范围、未使用其他 SKILL 的原因。

| 任务类型 | 自动选择 | 前置证据 | 输出 |
| --- | --- | --- | --- |
| 已有页面/组件的设计还原 QA | `product-design:design-qa` | 源视觉目标 + 同状态实现截图 | `passed/blocked` 设计 QA 报告、P0/P1/P2/P3 问题 |
| 小程序移动端新流程概念探索 | `imagegen-frontend-mobile` | 已确认 brief、目标页面、角色和关键状态 | 移动端屏幕概念图，仅作设计目标候选 |
| 分享图、空态插图、活动封面等真实位图资产 | `imagegen` | 资产用途、尺寸、文案、接入页面、避让规则 | 项目内图片资产路径、生成提示词和验收记录 |
| 小程序页面反模板/交互合理性检查 | `design-taste-frontend` 的可用检查项 | 现有截图或页面结构 | 卡片层级、按钮对比、文案溢出、状态混乱、移动端稳定性问题清单 |
| Product Design 工作流分流 | `product-design:index` | 任务意图和当前证据 | 路由到 audit、ideate、design-qa 等合适流程；本迭代不得直接跳到实现 |

禁止事项：

- 不得在没有截图或目标稿时声称 `design-qa` 通过。
- 不得把 `imagegen-frontend-mobile` 产出的概念图当作已实现页面。
- 不得用生成图片替代前端真机验收、接口联调、UGC 风控或测试结论。
- 不得为了好看重画信息架构、接口状态或权限规则；这些必须遵循总控、前端、后端和风控文档。
- 不得在后台表格/运营台场景套用营销页式视觉规范；后台优先信息密度、可扫描和操作安全。

## 4. 当前 UI/UX 结论

截至 2026-06-15，前端已有 `moment-editor`、`moment-timeline`、`moment-card`、`session-brief`、`share-task-status`、`session-return-bar` 等代码证据，但仍缺正式 UI/UX 评审记录、真机截图、关键状态录屏和设计 QA 报告。

当前不能判定 UI/UX 通过的原因：

- 缺 `moment-editor` 上传、私密成员选择、授权区、失败态和弱网重复提交的真机证据。
- 缺 `moment-timeline` 私密占位、待补图、审核中、隐藏/重传状态的统一视觉复核。
- 缺 `session-brief` 在 opening/highlight/private/event/closing 混合数据下的层级截图。
- 缺 `share-task-status` 的 pending、processing、ready、failed、expired 全状态截图。
- `rankings` 页面首轮代码已出现，但缺固定榜单数据、真机截图、推举确认/失败/积分不足/重复推举状态截图，因此 M5 榜单和推举交互仍无法判定通过。
- 缺后台 `content-moments-review`、`content-moment-reports`、`growth-share-tasks`、`commerce-ranking-rewards` 线上真实数据状态下的可用性截图。

## 5. UI/UX 版本升级路线

| 阶段 | 任务编号 | 主责 | 覆盖范围 | 进入条件 | 交付物 | 当前状态 |
| --- | --- | --- | --- | --- | --- | --- |
| UX-V0 | `UX-M0-01` | UI/UX | 设计基线与截图采集规范 | 前端/后台已有可打开页面 | 截图命名规范、视口规范、状态清单、问题分级规则 | 已执行首轮基线，待截图回收 |
| UX-V1 | `UX-M1-01` | UI/UX + 前端 | `waiting-room`、`live-record`、`moment-editor`、`moment-timeline`、`moment-card` | 固定三用户酒局、M1 页面可真机打开 | 设计评审记录、P0/P1/P2 问题清单、整改建议 | 待真机截图 |
| UX-V2 | `UX-M2-01` | UI/UX + 前端 + 测试 | `table-mode` 收尾照、`session-brief`、旧战报入口、历史简报入口 | 固定酒局已有 opening/highlight/private/event/closing | 简报层级、缺图、私密占位、返回路径评审 | 待真机截图 |
| UX-V3 | `UX-M3-01` | UI/UX + 前端 + 后端 | `share-task-status`、分享图预览/保存、PNG 视觉 | ready/failed/expired 样本可复现 | 全状态截图、分享图视觉 QA、隐私不泄露检查 | 待视觉验收 |
| UX-V4 | `UX-M4-01` | UI/UX + 后台 + 测试 | 四个后台 moments slug 和 operation logs | 线上后台写操作窗口、真实样本 | 后台表格密度、动作弹层、原因填写、日志追溯评审 | 待线上样本 |
| UX-V5 | `UX-M5-01` | UI/UX + 前端 + 风控 | `rankings`、推举入口、积分消耗、不可推举态 | 前端 rankings 页面出现，M5 接口与风控反例可测 | 榜单交互方案、推举确认/失败/退款状态评审 | 代码已出现，待真机截图、固定榜单数据和风控反例 |
| UX-V6 | `UX-QA-RELEASE` | UI/UX + PM | 发布前设计 QA | 每个关键页面都有目标稿或截图和实现截图 | `design-qa.md` 或等效设计 QA 报告，P0/P1/P2 清零 | 待前置截图 |

## 6. 评审清单

### 移动端小程序

- 信息层级：主行动清晰，次级工具不抢占主流程。
- 触达效率：用户从酒局中进入“记精彩瞬间”不超过 2 次关键点击。
- 状态表达：待上传、上传中、审核中、待补图、私密、隐藏、失败、可重试必须有不同且一致的状态表达。
- 隐私理解：非接收者看到的是明确占位，不出现误导性的空白或疑似加载失败。
- 触控尺寸：主要按钮、成员选择、重试、预览、推举入口满足真机可点，不挤压。
- 文案长度：按钮和状态文案不换行、不遮挡、不使用解释性长段落。
- 视觉一致性：同一类状态标签、卡片半径、间距、图标风格在 `moment-editor`、`timeline`、`brief`、`history` 中保持一致。

### 后台管理

- 表格密度：审核、举报、任务、奖励配置可快速扫描，不用大卡片堆叠。
- 动作安全：通过、隐藏、要求重传、移出榜单、重试、发奖必须有明确确认、原因填写和结果反馈。
- 审计可见：操作后能在 `system-operation-logs` 找到对应记录。
- 错误态：失败、无权限、重复发奖、无可发对象必须有可读反馈。
- 风控协作：审核/举报状态必须映射 UGC 风控口径，不允许后台自行发明状态。

## 7. 设计 QA 证据要求

`product-design:design-qa` 只能在以下证据齐全后使用：

1. 源视觉目标：设计稿、截图、移动端概念图或明确目标状态截图。
2. 实现证据：同视口、同数据、同状态下的真机截图或浏览器截图。
3. 状态说明：页面路径、账号角色、酒局 ID、数据样本、视口尺寸。
4. 对比结论：字体/字号、间距、颜色、图片质量、文案、图标、状态、可访问性。

缺任一项时，UI/UX 负责人必须标记为 `blocked`，不能写“设计已通过”。

## 8. 协作方式

| 依赖角色 | UI/UX 需要对方提供 | UI/UX 输出给对方 |
| --- | --- | --- |
| 前端负责人 | 真机截图、页面路径、状态样本、组件代码位置 | 页面级问题清单、交互调整建议、设计通过/退回结论 |
| 后台负责人 | 线上后台账号窗口、真实审核/举报/任务/奖励样本截图 | 表格/动作弹层/日志追溯体验问题清单 |
| 测试/验收负责人 | 固定三用户酒局、验收录屏、失败复测记录 | 可纳入测试结论的 UI/UX 通过或退回证据 |
| UGC 风控负责人 | 私密、举报、隐藏、重传、上榜资格口径与反例 | 状态文案、风险提示和不可推举态是否清晰 |
| 接口联调负责人 | 固定数据 ID、接口状态、失败样本 | 哪些 UI 状态缺数据支撑、哪些接口状态无法解释 |
| PM | 总进度台账、验收边界、跨角色冲突处理 | UI/UX 审核结论、P0/P1/P2 问题和是否允许进入下一阶段 |

## 9. 问题分级

| 级别 | 定义 | 处理规则 |
| --- | --- | --- |
| P0 | 阻断核心流程、隐私误导、错误状态导致误操作 | 不允许进入验收 |
| P1 | 主路径交互不清、状态不可理解、移动端明显难用 | 必须整改后复核 |
| P2 | 视觉不一致、间距/文案/图标影响专业度 | 可进入联调但不能发布前遗留 |
| P3 | 轻微视觉 polish | 可记录为后续优化，不阻塞本轮 |

## 10. 当前执行记录

| 日期 | 记录人 | 结论 | 证据 | 下一步 |
| --- | --- | --- | --- | --- |
| 2026-06-15 | Codex/PM | UI/UX 成员已新增，已建立专项版本升级计划和 SKILL 自动选择规则；当前只有计划和代码证据，尚无正式 UI/UX 通过结论 | 已读取前端计划、测试计划、接口联调计划、PM 台账和 UGC 风控计划；已按 `design-qa`、`design-taste-frontend`、`imagegen`、`imagegen-frontend-mobile`、`product-design:index` 的边界制定自动路由规则 | UI/UX 负责人先执行 `UX-M0-01`，向前端/后台/测试收集目标截图与实现截图 |
| 2026-06-15 | UI/UX 负责人 | `UX-M0-01` 首轮基线已建立；当前结论为 blocked，不允许写 UI/UX 通过 | 已读取 UI/UX、前端、测试、接口联调、UGC 风控、后台、PM 台账和总控文档；按 `web-design-guidelines` 拉取最新规则并抽查 `moment-editor`、`moment-card`、`moment-timeline`、`session-brief`、`share-task-status`、`live-record` 代码；发现可先退回的代码级体验风险，但仍缺目标截图、实现截图、真机录屏和固定数据样本 | 前端/测试/接口联调先提交固定三用户酒局和截图包；UI/UX 在证据齐全后执行 `UX-M1-01`、`UX-M2-01`、`UX-M3-01` 分阶段复核 |
| 2026-06-15 | UI/UX 负责人 | 本轮委派启动核查完成；继续维持 `blocked / 待截图回收`，不写设计通过 | 已读取 `AGENTS.md`、团队通知、PM 台账、UI/UX、前端、后台、测试、接口联调、UGC 风控计划；选择 `web-design-guidelines` 做代码级可用性初审，已拉取最新规则；未使用 `product-design:design-qa`，原因是缺目标截图与同状态实现截图；已确认 `rankings` 页面代码存在但缺真机/数据/反例截图 | PM 派前端、测试、接口联调、后台、UGC 风控分别补截图包和样本；UI/UX 收齐后再执行 M1-M5 分阶段设计 QA |
| 2026-06-15 | UI/UX 负责人 | PM 第二轮派工：截图包要求已固化为可执行清单；继续维持 blocked，不写通过 | 已读取 UI/UX、前端、测试、接口联调、UGC、后台计划；继续选择 `web-design-guidelines` 做截图前代码级可用性基线；未使用 `product-design:design-qa`，原因是仍缺目标截图与同状态实现截图 | PM 按 10.2.1 派前端、测试、接口联调、后台、UGC 风控提交截图包；UI/UX 收齐后按 10.7 顺序复核 |
| 2026-06-15 | UI/UX 负责人 | PM 第三轮派工：已补充截图包命名、最低设备/分辨率、缺字段退回规则和 P0/P1/P2 触发条件；继续维持 blocked，不写设计通过 | 已读取 UI/UX 计划 10.2.1、测试计划第 13 节和前端计划；继续选择 `web-design-guidelines`，依据其可访问性、触控、状态表达、长内容、破坏性操作确认规则制定截图验收门槛；未使用 `product-design:design-qa`，原因是仍缺目标截图与同状态实现截图 | PM 派前端、测试、后台、UGC 风控按 10.2.2 提交命名合规、字段完整、可追溯的截图/录屏包；UI/UX 只做 blocked/pass 初判，不改 PM 总台账 |
| 2026-06-15 | UI/UX 负责人 | PM 下一轮派工：已基于 latest manifest 和测试人工真机执行包要求补充 M1/UGC 截图 QA 接收包；继续维持 blocked，不写设计通过 | 已读取 `AGENTS.md`、团队通知、PM 台账、UI/UX、测试、前端、UGC 风控计划和 `docs/runtime/int-data-001-manifest.json`；继续选择 `web-design-guidelines`，用于接收包中的状态表达、触控、长内容、错误文案、隐私占位和分享图预览可用性规则；未使用 `product-design:design-qa`，原因是仍缺目标截图与同状态实现截图/录屏 | PM 派测试/前端/UGC 按 10.2.3 提交人工真机截图、录屏、PNG 原图和接口摘要；UI/UX 收到同状态证据后才做 QA 初判 |

### 10.1 `UX-M0-01` 截图采集规范

截图统一放入交付记录或缺陷记录，命名建议：

```text
UX-<任务编号>-<页面或组件>-<状态>-<角色>-<视口>-<日期>.png
```

示例：

```text
UX-M1-01-moment-editor-private-memberA-iPhone13-20260615.png
UX-M3-01-share-task-status-failed-host-iPhone13-20260615.png
UX-M4-01-content-moments-review-approved-admin-desktop-20260615.png
```

视口和设备要求：

| 类型 | 最小要求 | 说明 |
| --- | --- | --- |
| 小程序真机 | iPhone 13/14 宽度、常见 Android 宽度各 1 组 | 优先真机；微信开发者工具截图只能作为补充 |
| 小程序状态 | 每个页面至少覆盖空态、正常态、失败态、权限态 | 私密、待补图、审核中、失败重试必须单独截 |
| 后台页面 | 1366x768 和 1440x900 各 1 组 | 需要真实数据样本，不接受纯空壳截图判定通过 |
| 分享图 PNG | 原图文件 + 前端预览截图 | 必须确认私密、隐藏、待补图内容未进入公开图 |

### 10.2 `UX-M0-01` 必收状态清单

| 范围 | 必收状态 | 依赖角色 | 缺少证据时结论 |
| --- | --- | --- | --- |
| `moment-editor` | opening/highlight/private/closing、无图、有图、上传失败、保存中、私密未选成员、私密已选成员、授权取消 | 前端 + 测试 + 接口联调 | blocked：不能判定表单体验和隐私选择通过 |
| `moment-timeline` / `moment-card` | opening、highlight、event、private placeholder、needs_media、approved、hidden/require_resubmit | 前端 + UGC 风控 | blocked：不能判定状态标签和私密占位通过 |
| `live-record` | 判官视角、非判官视角、成员不足、酒中记录横向/窄屏、底部按钮遮挡 | 前端 + 测试 | blocked：不能判定主操作优先级和底部动作可用 |
| `session-brief` | loading、空 timeline、混合节点、待补图、可推举/不可推举、生成分享图入口 | 前端 + 接口联调 | blocked：不能判定简报层级通过 |
| `share-task-status` | pending、processing、ready、failed、expired、retryCount > 0、disabled | 前端 + 后端/API | blocked：不能判定异步状态表达通过 |
| `share-poster` | taskId/briefId/sessionId/reportId 入口、pending/processing、ready 预览/保存、failed/expired 重试、保存授权失败 | 前端 + 测试 + 后端/API | blocked：不能判定分享图任务页通过 |
| `rankings` | 空态、列表态、分类切换、推举确认、不可推举、积分不足、重复推举、移出榜单后退款提示 | 前端 + 测试 + UGC 风控 | blocked：不能判定榜单与推举体验通过 |
| 后台四个 moments slug | 列表空态、真实样本、操作弹层、失败提示、日志追溯 | 后台 + 测试 + UGC 风控 | blocked：不能判定后台运营可用性通过 |

### 10.2.1 `UX-M0-01` 可执行截图包清单

本清单只定义 UI/UX 需要的截图、录屏和样本，不代表对应功能通过。所有样本 ID 可使用接口联调计划中的语义 ID，最终以接口联调负责人提供的真实 sessionId、profileId、momentId、taskId、reportId 为准。

小程序截图统一要求：iPhone 13/14 宽度真机 1 组、常见 Android 宽度真机 1 组；微信开发者工具截图只能作为补充。后台截图统一要求：1366x768 与 1440x900 各 1 组。录屏需要包含入口路径、账号角色、样本 ID 和操作结果。

| 清单项 | 角色视角 | 样本 ID | 状态 | 视口/设备 | 提供角色 | UI/UX 复核标准 |
| --- | --- | --- | --- | --- | --- | --- |
| `UX-SHOT-M1-EDITOR-01` `moment-editor` 基础表单 | 普通成员 A | `it-moments-20260615-a`、`it-member-a-20260615` | highlight 无图、有图、上传中、保存中、上传失败 | iPhone 13/14 + Android 真机，录屏 1 条 | 前端 + 测试 | 主按钮不遮挡，图片区、说明、授权和错误提示清晰；失败后草稿不丢 |
| `UX-SHOT-M1-EDITOR-02` `moment-editor` 私密选择 | 普通成员 A 发给 B | `private-a-to-b-20260615`、`it-member-b-20260615` | 私密未选成员、已选成员、非本局成员不可选、授权取消 | iPhone 13/14 + Android 真机，录屏 1 条 | 前端 + 测试 + 接口联调 | 选择范围易理解，未选成员有明确阻止提示，不泄露非接收者信息 |
| `UX-SHOT-M1-TIMELINE-01` `moment-timeline` 混合时间线 | 判官、普通成员 B、非接收者 C | `opening-host-20260615`、`highlight-a-20260615`、`private-a-to-b-20260615`、`event-drink-debt-20260615` | opening、highlight、event、private placeholder 同屏 | iPhone 13/14 + Android 真机 | 前端 + 测试 + 接口联调 | 时间顺序、节点类型、私密占位和辅助事件层级清晰，不把占位误认为加载失败 |
| `UX-SHOT-M1-CARD-01` `moment-card` 状态标签 | 上传者、接收者、非接收者 | `moment-status-pack-20260615` | 私密占位、待补图、待审核、需重传、已隐藏、可推举 | iPhone 13/14 + Android 真机 | 前端 + UGC 风控 | 中文状态标签可读、对比度足够，状态不互相冲突，不暴露私密正文/图片 |
| `UX-SHOT-M2-BRIEF-01` `session-brief` 简报层级 | 判官、普通成员 B | `brief-it-moments-20260615-a` | loading、空 timeline、opening/highlight/private/event/closing 混合、待补图 | iPhone 13/14 + Android 真机 | 前端 + 测试 + 接口联调 | 摘要区、时间线区、分享任务区层级清楚；待补图不被表达为可公开/可推举 |
| `UX-SHOT-M2-BRIEF-02` `session-brief` 推举/分享入口 | 普通成员 B | `brief-it-moments-20260615-a`、`share-task-ready-20260615` | 可推举、不可推举、生成分享图入口、刷新 brief | iPhone 13/14 + Android 真机，录屏 1 条 | 前端 + 测试 + UGC 风控 | 榜单入口和分享入口不抢主流程；不可推举原因能被用户理解 |
| `UX-SHOT-M3-STATUS-01` `share-task-status` 全状态 | 上传者 | `share-task-pending-20260615`、`share-task-ready-20260615`、`share-task-failed-20260615` | pending、processing、ready、failed、expired、retryCount > 0、disabled | iPhone 13/14 + Android 真机 | 前端 + 后端/API + 测试 | 五种状态视觉差异明确；ready 可预览，failed/expired 才显示重试 |
| `UX-SHOT-M3-STATUS-02` `share-task-status` 长失败原因 | 上传者 | `share-task-failed-long-reason-20260615` | 长 failedReason、重试后 pending | iPhone 13/14 + Android 真机 | 前端 + 后端/API | 长文案不挤压按钮，不遮挡重试入口，错误文案包含下一步 |
| `UX-SHOT-M3-POSTER-01` `share-poster` 任务入口 | 上传者 | `brief-it-moments-20260615-a`、`share-task-ready-20260615` | taskId/briefId/sessionId/reportId 四种入口，pending/processing 刷新 | iPhone 13/14 + Android 真机，录屏 1 条 | 前端 + 测试 + 接口联调 | 入口参数不造成空白页；用户能理解生成中可离开和稍后查看 |
| `UX-SHOT-M3-POSTER-02` `share-poster` 成品图 | 上传者、非接收者 C | `share-task-ready-20260615`、原始 PNG 路径 | ready 预览、保存、保存授权失败、朋友圈分享入口 | iPhone 13/14 + Android 真机，原图文件 | 前端 + 测试 + UGC 风控 | 成品图清晰，保存失败有下一步；私密/隐藏/待补图内容不进入公开图 |
| `UX-SHOT-M5-RANKING-01` `rankings` 榜单列表 | 普通成员 A、非成员 C | `ranking-today-highlight-20260615` | 空态、列表态、分类切换、图片预览、加载失败 | iPhone 13/14 + Android 真机 | 前端 + 测试 + 接口联调 | 分类可扫读，空态不误导，非成员/失败态有明确反馈 |
| `UX-SHOT-M5-RANKING-02` `rankings` 推举反例 | 普通成员 A | `private-a-to-b-20260615`、`needs-media-20260615`、`hidden-moment-20260615` | 推举确认、不可推举、积分不足、重复推举、移出榜单后退款提示 | iPhone 13/14 + Android 真机，录屏 1 条 | 前端 + 测试 + UGC 风控 | 积分消耗清楚，失败/禁用原因明确；前端不放开风控禁止项 |
| `UX-SHOT-M4-ADMIN-01` `content-moments-review` | 后台运营 | `review-secondary-20260615` | 空态、待审列表、通过、隐藏、要求重传、移出榜单、失败提示 | 1366x768 + 1440x900，录屏 1 条 | 后台 + 测试 + UGC 风控 | 表格可扫描，行操作不拥挤；原因弹层和结果反馈明确 |
| `UX-SHOT-M4-ADMIN-02` `content-moment-reports` | 后台运营 | `report-private-20260615` | 待处理举报、有效并隐藏、无效保留、要求重传、移出榜单、已处理无可用操作 | 1366x768 + 1440x900，录屏 1 条 | 后台 + 测试 + UGC 风控 | 举报摘要足够判断，处理状态和前台同步结果可追溯 |
| `UX-SHOT-M4-ADMIN-03` `growth-share-tasks` | 后台运营 | `share-task-failed-20260615`、`share-task-expired-20260615` | pending/processing/ready/failed/expired、失败原因、后台 retry、查看图 | 1366x768 + 1440x900，录屏 1 条 | 后台 + 测试 + 接口联调 | 只对 failed/expired 暴露重试；失败原因、重试结果、图片入口清楚 |
| `UX-SHOT-M4-ADMIN-04` `commerce-ranking-rewards` | 后台运营 | `reward-rule-20260615` | 奖励规则编辑、保存原因、校验失败、发奖 action、重复发奖/跳过 | 1366x768 + 1440x900，录屏 1 条 | 后台 + 测试 + UGC 风控 | 阶梯配置不易误改，发奖/重复发奖反馈清晰，必须能追溯日志 |
| `UX-SHOT-M4-ADMIN-05` `system-operation-logs` 追溯 | 后台运营、测试 | 以上 M4 所有目标 ID | 审核、举报、retry、奖励保存、发奖日志 | 1366x768 + 1440x900 | 后台 + 测试 | 日志能按目标 ID 反查操作者、动作、原因、旧值/新值和时间 |

截图包提交格式：

```text
任务编号：
截图编号：
页面/组件：
角色视角：
样本 ID：
设备/视口：
入口路径：
状态：
截图/录屏文件：
接口响应摘要或日志 ID：
提交角色：
未覆盖状态：
```

缺任一必填字段时，UI/UX 只登记为 `blocked / 证据不完整`，不进入通过判定。

### 10.2.2 截图包命名、设备门槛和退回规则

本节只约束 UI/UX 截图验收证据，不替前端、测试、后台或 UGC 风控写通过结论。当前状态继续保持 `blocked / 待截图回收`。

#### 10.2.2.1 文件命名规则

统一命名格式：

```text
UX-<任务编号>-<截图编号>-<页面或组件>-<状态>-<角色>-<设备或视口>-<YYYYMMDD>.<png|mp4>
```

命名要求：

- `<任务编号>` 使用 `UX-M1-01`、`UX-M3-01`、`UX-M4-01` 等 UI/UX 复核任务编号；如截图同时服务 DEV/QA/UGC，关联编号写入提交模板，不堆入文件名。
- `<截图编号>` 必须对应 10.2.1 的 `UX-SHOT-*`，例如 `UX-SHOT-M1-EDITOR-02`。
- `<页面或组件>` 使用小写 slug：`moment-editor`、`moment-timeline`、`moment-card`、`session-brief`、`share-task-status`、`share-poster`、`rankings`、`content-moments-review`。
- `<状态>` 使用小写短状态：`private-selected`、`private-placeholder`、`needs-media`、`failed-long-reason`、`retry-pending`、`reward-duplicate`。
- `<角色>` 使用可追溯角色：`host`、`member-a`、`member-b`、`member-c`、`outsider`、`admin`、`ugc-reviewer`。
- `<设备或视口>` 使用 `iphone13`、`android-360w`、`desktop-1366x768`、`desktop-1440x900` 等，不使用空格、中文或模糊的 `mobile`。
- 文件名不得包含真实手机号、openid、access token 或真实用户昵称；样本 ID 写入提交模板。

示例：

```text
UX-UX-M1-01-UX-SHOT-M1-EDITOR-02-moment-editor-private-selected-member-a-iphone13-20260615.mp4
UX-UX-M3-01-UX-SHOT-M3-POSTER-02-share-poster-ready-preview-member-a-android-360w-20260615.png
UX-UX-M4-01-UX-SHOT-M4-ADMIN-01-content-moments-review-pending-admin-desktop-1366x768-20260615.png
```

#### 10.2.2.2 最低可接受分辨率和设备

| 类型 | 最低可接受要求 | 不接受情况 |
| --- | --- | --- |
| 小程序 iOS | 至少 1 台 iPhone 13/14 宽度真机或体验版二维码录屏；截图内容宽度不低于 390px，优先提交原始截图 | 只提交微信开发者工具截图；截图被聊天软件压缩到文字不可读 |
| 小程序 Android | 至少 1 台常见 Android 宽度真机；截图内容宽度不低于 360px，必须覆盖触控按钮和底部安全区 | 只给单一 iOS 视角；底部按钮被系统导航栏或安全区遮挡但未说明 |
| 小程序录屏 | 最低 720p 或原始手机录屏；必须包含入口路径、账号角色、关键操作、结果页面和 toast/错误态 | 只截最终态；录屏没有显示从哪里进入、点了什么、结果是什么 |
| 后台页面 | `1366x768` 和 `1440x900` 各 1 组 PNG；长表格需补首屏、横向滚动/末列、操作弹层和失败提示 | 只给局部裁剪图；无真实样本；无弹层/失败态 |
| 分享图 PNG | 必须提交生成的原始 PNG 文件或可访问路径、尺寸、前端预览截图和保存/授权失败截图 | 只给前端预览截图；未证明私密、隐藏、待补图内容未进入公开图 |
| 接口/日志旁证 | 每组关键截图必须配套样本 ID、接口响应摘要或 operationLog ID | 只有截图没有样本 ID，无法追溯权限、账务、审核或日志链路 |

微信开发者工具截图只能作为补充证据；如因设备限制需要用开发者工具替代真机，必须由 PM 明确批准并在提交模板中写明限制。

#### 10.2.2.3 缺字段退回规则

每个截图包必须包含 10.2.1 的提交模板字段：任务编号、截图编号、页面/组件、角色视角、样本 ID、设备/视口、入口路径、状态、截图/录屏文件、接口响应摘要或日志 ID、提交角色、未覆盖状态。缺字段时按下表退回，退回项继续保持 `blocked`。

| 退回码 | 触发条件 | 退回对象 | UI/UX 处理 |
| --- | --- | --- | --- |
| `UX-RETURN-FIELD-001` | 缺任务编号、截图编号、页面/组件、状态、设备/视口、提交角色任一字段 | 提交角色 | 不进入评审，补齐字段后重提 |
| `UX-RETURN-FIELD-002` | 角色视角或样本 ID 模糊，无法判断 host/member/admin/UGC 或 A/B/C 私密关系 | 前端 + 测试 + 接口联调 | 要求补账号角色、profileId/sessionId/momentId 关系 |
| `UX-RETURN-FIELD-003` | 文件名状态与截图实际状态不一致，或截图状态不在 10.2.1 清单内 | 提交角色 | 按真实状态重命名并补说明 |
| `UX-RETURN-FIELD-004` | 只提供微信开发者工具截图，未提供真机/体验版证据且无 PM 批准 | 前端 + 测试 | 标记证据不足，不能写通过 |
| `UX-RETURN-FIELD-005` | 截图模糊、裁剪过度、分辨率低于最低要求，或关键按钮/文案被遮挡 | 提交角色 | 要求提交原始截图或重新录屏 |
| `UX-RETURN-FIELD-006` | 录屏缺入口路径、关键点击、结果页或失败/成功反馈 | 测试 + 前端 | 要求重录完整链路 |
| `UX-RETURN-FIELD-007` | 隐私、审核、榜单、积分、奖励、后台操作缺接口响应摘要或 operationLog ID | 接口联调 + 后台 + UGC 风控 | 不判定权限、账务或风控通过 |
| `UX-RETURN-FIELD-008` | 文件名含空格、中文状态、真实敏感标识、token/openid，或不能对应 `UX-SHOT-*` | 提交角色 | 重命名并清除敏感信息后重提 |

#### 10.2.2.4 P0/P1/P2 判定触发条件

| 级别 | 触发条件 | 处理规则 |
| --- | --- | --- |
| P0 | 私密内容被非接收者、非成员、分享图、榜单、奖励或后台非授权视角看到；隐藏/需重传/待补图/未审核内容可被公开分享、推举、上榜或发奖；普通成员无法进入核心“记精彩瞬间”路径；重复提交生成重复 moment；扣分重复、退款缺失或重复发奖；后台强审计动作绕过原因或日志 | 不允许进入 UI/UX 验收；退回责任角色修复，PM 需协调复测 |
| P1 | 主操作入口不清晰或超过合理路径；状态文案无法指导下一步；长失败原因挤压重试/保存/推举按钮；破坏性操作、奖励发放、隐藏/重传缺确认；移动端触控区过小或底部安全区遮挡；后台 1366x768 下表格不可扫描或行操作不可用 | 必须整改并补截图复核；未关闭前不能写 UI/UX 通过 |
| P2 | 视觉样式、状态标签、图标、间距、加载文案、空态文案或长文本换行不一致，但不误导权限/账务/核心操作；分享图预览清晰度或构图有轻微问题；后台空态/错误态层级弱但可操作 | 可进入联调记录，但发布前需关闭或经 PM 明确接受 |

#### 10.2.2.5 分角色提交清单

| 角色 | 必交截图/录屏 | 旁证要求 | UI/UX 当前结论 |
| --- | --- | --- | --- |
| 前端 | `moment-editor`、`moment-timeline`、`moment-card`、`session-brief`、`share-task-status`、`share-poster`、`rankings` 的 iPhone 13/14 与 Android 真机截图；关键提交、重试、保存、推举录屏 | 页面路径、入口路径、设备、角色、对应 `UX-SHOT-*` 编号；不得只给开发者工具截图 | blocked：缺真机和固定样本证据 |
| 测试 | 第 13 节 M1-M5 主链路录屏；三用户私密、brief、分享任务、后台审核/举报/日志、榜单/积分/奖励的执行记录 | 固定 sessionId/profileId/momentId/taskId/reportId、接口响应摘要、通过/失败/阻塞记录 | blocked：缺可复核测试包执行证据 |
| 后台 | `content-moments-review`、`content-moment-reports`、`growth-share-tasks`、`commerce-ranking-rewards`、`system-operation-logs` 的 1366x768 与 1440x900 截图；原因弹层、失败提示、日志追溯录屏 | 后台账号角色、目标 ID、operationLog ID、动作前后状态、线上写操作窗口说明 | blocked：缺真实样本和日志追溯截图 |
| UGC 风控 | 私密非接收者占位、隐藏/需重传/待补图不进入分享图、榜单不可推举、移出榜单退款、重复发奖/跳过的反例截图 | `UGC-QA-001` 至 `UGC-QA-008` 样本 ID、接口响应、风控签字结论 | blocked：缺反例执行截图和签字结论 |

### 10.2.3 `DEV-M1-03/04` 与 `UGC-QA-001/002/003` 截图 QA 接收包

本节只定义 UI/UX 对 M1 私密链路和分享图风控反例的截图/录屏接收标准，不替测试、前端、后端/API 或 UGC 风控写通过结论。当前 latest manifest 为 `INT-DATA-001`，本地 `sessionId=session-1781507687012-e4343d`，host `user-1781507686650-a33705`，memberA `user-1781507686651-a46952`，memberB `user-1781507686651-000860`，outsider `user-1781507686651-093df4`，privateId `moment-1781507687036-c0cc62cc`，briefId `brief-1781507687042-d1990edd`，readyTaskId `share-task-1781507687046-d1098582`，readyImageUrl `/uploads/moments/share-tasks/share-task-1781507687046-d1098582.png`。该 manifest 只代表本地 `127.0.0.1:3221` 数据，不能替代微信开发者工具、体验版或真机截图。

当前 UI/UX 结论继续为 `blocked / 待截图回收`。只有收到同状态实现截图/录屏、角色视角、设备/视口、样本 ID、页面路径和接口摘要后，才能进入 QA 初判；缺任一项不得写设计通过。

#### 10.2.3.1 SKILL 选择依据与使用边界

| 项目 | 记录 |
| --- | --- |
| 本轮选择 | `web-design-guidelines` |
| 选择依据 | PM 要求完善截图 QA 接收包和退回规则；当前缺目标截图和实现截图，不满足 `product-design:design-qa` 的前置条件；`web-design-guidelines` 可先约束触控、状态表达、错误文案、长内容、图片 alt/尺寸思想、破坏性动作确认、内容溢出和空态可读性 |
| 使用边界 | 只用于制定接收标准和初步退回，不输出设计通过；小程序不是 Web DOM，键盘/ARIA 规则只作为等效可用性参考，最终仍以微信真机/体验版画面为准 |
| 不使用 `design-qa` 的原因 | 仍缺同一状态的目标截图、实现截图、真机录屏和分享图原图；无法做设计还原或通过判定 |
| 证据缺口 | 缺体验版二维码或可控 GUI、设备型号/微信版本、A/B/C 登录态、A 提交录屏、B 可见截图、C/outsider 占位或无权限截图、非法成员选择截图、分享图 PNG 原图与前端预览截图 |

#### 10.2.3.2 必交接收包

| 接收包编号 | 覆盖任务 | 必须提交的画面 | 样本 ID / 路径 | 提交角色 | UI/UX 接收标准 |
| --- | --- | --- | --- | --- | --- |
| `UX-M1-ACCEPT-01` | `DEV-M1-03` | memberA 从 `live-record` 进入 `moment-editor` 的录屏：无图初始态、有图/文案/授权区、保存中、上传失败保留草稿、重复点击不重复创建 | `/pages/live-record/index?sessionId=session-1781507687012-e4343d&role=member`；`/pages/moment-editor/index?sessionId=session-1781507687012-e4343d&nodeType=private&visibility=private`；memberA `user-1781507686651-a46952` | 前端 + 测试 | 主按钮不被安全区遮挡；失败文案给出下一步；保存中状态防重复误点；草稿内容可见且不丢失；录屏必须展示入口路径和结果 |
| `UX-M1-ACCEPT-02` | `DEV-M1-04`、`UGC-QA-001` | memberA 私密未选成员、已选择 memberB、提交成功录屏；memberB timeline 可见正文/图片截图；outsider 或 memberC 只见私密占位/无权限截图 | privateId `moment-1781507687036-c0cc62cc`；memberB `user-1781507686651-000860`；outsider `user-1781507686651-093df4` | 前端 + 测试 + UGC 风控 | 私密占位不能像加载失败；B/C 视角必须同一 session 和同一 privateId；C/outsider 画面不得出现正文、图片、完整接收名单；截图必须配 timeline 响应摘要 |
| `UX-M1-ACCEPT-03` | `UGC-QA-002` | memberA 成员选择器截图：只展示本局成员；非法 outsider `visibleProfileIds` 提交的错误提示或接口 400 旁证；未写入脏数据说明 | outsider `user-1781507686651-093df4`；非法请求体摘要；400 响应摘要 | 前端 + 测试 + 接口联调 + UGC 风控 | 非本局成员不可被前端误选；错误提示短且可理解；后端 400 不能只作为口头结论，必须有请求/响应摘要 |
| `UX-M3-ACCEPT-01` | `UGC-QA-003` | `share-poster` ready 预览截图、保存/授权失败截图、生成 PNG 原图；同一 brief 中 private/hidden/needs_media/未授权节点未进入 PNG 的节点清单或接口过滤摘要 | briefId `brief-1781507687042-d1990edd`；readyTaskId `share-task-1781507687046-d1098582`；readyImageUrl `/uploads/moments/share-tasks/share-task-1781507687046-d1098582.png`；failedCandidate `moment-1781507687039-ee0677bb` | 测试 + 前端 + UGC 风控 + 后端/API | 前端预览与 PNG 原图一致；PNG 不包含私密正文/图片、隐藏、待补图、未授权节点；保存失败有下一步；图片文字清晰且不裁切关键内容 |

#### 10.2.3.3 文件命名与元数据

本接收包沿用 10.2.2 命名规则，并允许同步保留测试侧 `QA-*` 或前端侧 `FE-*` 原始文件名；提交给 UI/UX 时必须补一份索引表，把原始文件名映射到 `UX-M1-ACCEPT-*` 或 `UX-M3-ACCEPT-*`。

| 场景 | UI/UX 建议文件名 |
| --- | --- |
| memberA 私密提交录屏 | `UX-UX-M1-01-UX-M1-ACCEPT-02-moment-editor-private-submit-member-a-iphone13-20260615.mp4` |
| memberB 可见截图 | `UX-UX-M1-01-UX-M1-ACCEPT-02-moment-timeline-private-visible-member-b-iphone13-20260615.png` |
| outsider 占位截图 | `UX-UX-M1-01-UX-M1-ACCEPT-02-moment-timeline-private-placeholder-outsider-android-360w-20260615.png` |
| 非本局成员非法提交 | `UX-UX-M1-01-UX-M1-ACCEPT-03-moment-editor-invalid-member-400-member-a-iphone13-20260615.png` |
| 分享图 ready 预览 | `UX-UX-M3-01-UX-M3-ACCEPT-01-share-poster-ready-preview-member-a-iphone13-20260615.png` |
| 分享图 PNG 原图 | `UX-UX-M3-01-UX-M3-ACCEPT-01-share-poster-ready-png-original-member-a-20260615.png` |

每个文件必须随索引表提交：任务编号、接收包编号、页面/组件、角色视角、profileId、sessionId、momentId/taskId/briefId、设备型号、微信版本、版本来源、入口路径、接口摘要文件或日志 ID、未覆盖项。

#### 10.2.3.4 退回码

| 退回码 | 触发条件 | 退回对象 | UI/UX 处理 |
| --- | --- | --- | --- |
| `UX-RETURN-M1-PKG-001` | 未使用 latest manifest ID，混用旧 `session-1781506784680-02d0a3` 或无法确认 session/profile | 前端 + 测试 | 退回重跑；旧 ID 证据不进入 QA 初判 |
| `UX-RETURN-M1-PKG-002` | A/B/C/outsider 角色视角缺一，或未证明三者属于同一酒局/同一 privateId | 测试 + 接口联调 | 标记私密链路证据不完整 |
| `UX-RETURN-M1-PKG-003` | A 提交录屏缺入口路径、点击过程、保存中/失败/结果态任一关键画面 | 测试 + 前端 | 要求补完整录屏，不能只给最终截图 |
| `UX-RETURN-M1-PKG-004` | B 可见或 C/outsider 占位截图缺 timeline 响应摘要，无法判断页面是否与接口一致 | 测试 + 接口联调 | 不进入隐私通过判定 |
| `UX-RETURN-M1-PKG-005` | 非本局成员选择器只给接口 400，缺前端选择器截图或错误提示截图 | 前端 + 测试 | 只记录接口层可继续，不判定页面体验 |
| `UX-RETURN-M3-PKG-001` | `UGC-QA-003` 只给前端预览，缺 PNG 原图或 readyImageUrl 可访问证据 | 前端 + 测试 | 分享图视觉 QA blocked |
| `UX-RETURN-M3-PKG-002` | 分享图 PNG 缺参与/被拒节点清单，无法证明 private/hidden/needs_media/未授权节点未进入公开图 | 后端/API + UGC 风控 + 测试 | 不判定公开分享图无泄露 |
| `UX-RETURN-M3-PKG-003` | PNG 或预览图被压缩、裁切、模糊，无法读取正文或判断是否泄露 | 提交角色 | 要求提交原图或重新截图 |
| `UX-RETURN-SKILL-001` | 提交方要求 UI/UX 直接写 `design-qa passed`，但缺目标截图和同状态实现截图/录屏 | PM + 提交角色 | 明确拒绝通过结论，只登记 blocked |

#### 10.2.3.5 P0/P1/P2 触发条件

| 级别 | M1/UGC 截图 QA 触发条件 | UI/UX 处理 |
| --- | --- | --- |
| P0 | C/outsider 看到私密正文、图片、完整接收名单；分享图 PNG 出现 private/hidden/needs_media/未授权内容；非本局成员可被前端选择并成功写入；重复提交生成重复 private/highlight；普通成员无法进入核心编辑路径 | 立即退回 PM，停止公开分享/榜单相关 QA；不得进入设计通过 |
| P1 | 私密占位像加载失败或空白错误；成员选择器难以区分已选/未选；失败提示没有下一步；保存中/重试状态误导用户；录屏显示底部按钮被遮挡或触控困难；分享图 ready/failed/授权失败状态不清楚 | 要求前端/测试补整改截图或录屏；关闭前不能写通过 |
| P2 | 状态标签、间距、图标、加载省略号、长文案换行、PNG 构图清晰度存在轻微不一致，但不导致隐私、权限或核心操作误判 | 可进入问题清单，发布前关闭或由 PM 明确接受 |

#### 10.2.3.6 收到证据后的 QA 初判顺序

1. 先核对 manifest、session/profile/moment/task/brief 是否与索引表一致；不一致直接退回。
2. 再看 `DEV-M1-03` 上传/失败/重复提交录屏，确认核心编辑路径是否可用。
3. 再看 `DEV-M1-04` 与 `UGC-QA-001` A/B/C/outsider 同状态截图，确认隐私占位不泄露且不误导。
4. 再看 `UGC-QA-002` 非本局成员选择器和 400 旁证，确认页面没有给用户错误入口。
5. 最后看 `UGC-QA-003` 分享图原图、预览和节点过滤摘要，确认公开图无敏感内容。
6. 以上任一步证据缺失，结论保持 `blocked / 证据不完整`；不启动 `product-design:design-qa` 通过判定。

### 10.3 `UX-M0-01` 首轮代码级问题

以下问题来自代码抽查和 `web-design-guidelines` 规则映射，先作为 UI/UX 待复核/待整改项；真机截图后再定最终级别。

| 级别 | 范围 | 问题 | 证据 | 下一步责任 |
| --- | --- | --- | --- | --- |
| P1 待复核 | `live-record` | 非判官视角没有“记精彩瞬间”入口，当前入口只在 `isJudge` 时展示，和 M1 全员上传目标冲突风险高 | `miniprogram/pages/live-record/index.wxml:36` | 前端负责人确认非判官入口策略并补截图；UI/UX 复核主行动优先级 |
| P1 待复核 | `live-record` | 酒中记录区域经历多段覆盖式样式和 `!important` 收口，窄屏下仍有压缩和误触风险，必须真机验证 | `miniprogram/pages/live-record/index.less:567`、`miniprogram/pages/live-record/index.less:675`、`miniprogram/pages/live-record/index.less:680` | 前端 + 测试提交窄屏真机截图和点击录屏 |
| P1 待整改 | `moment-editor`、`session-brief`、`share-task-status`、`live-record`、`rankings` | 大量可点击控件用 `view + bindtap` 表达按钮，缺少小程序按钮语义、禁用态和统一触控反馈；关键提交、推举、刷新、预览等动作也主要靠视觉禁用 | `miniprogram/pages/moment-editor/index.wxml:115`、`miniprogram/pages/session-brief/index.wxml:40`、`miniprogram/components/share-task-status/share-task-status.wxml:17`、`miniprogram/pages/live-record/index.wxml:114`、`miniprogram/pages/rankings/index.wxml:73` | 前端负责人统一按钮/禁用/反馈模式；UI/UX 复核触控尺寸和误触 |
| P2 待整改 | `moment-editor`、`moment-timeline`、`session-brief`、`rankings` | 加载文案仍使用 `...`，不符合本轮文本规范；应统一为中文省略号并保持状态文案一致 | `miniprogram/pages/moment-editor/index.wxml:39`、`miniprogram/pages/moment-editor/index.wxml:116`、`miniprogram/components/moment-timeline/moment-timeline.wxml:7`、`miniprogram/pages/session-brief/index.wxml:29`、`miniprogram/pages/rankings/index.wxml:34` | 前端负责人统一 loading 文案；测试复跑编码检查 |
| P2 待复核 | `moment-card` | 状态枚举已改为中文映射，代码级风险降低；仍缺私密占位、待补图、待审核、需重传、已隐藏、可推举同屏截图，无法判断标签对比度和一致性 | `miniprogram/components/moment-card/moment-card.ts:30`、`miniprogram/components/moment-card/moment-card.ts:42`、`miniprogram/components/moment-card/moment-card.ts:46`、`miniprogram/components/moment-card/moment-card.wxml:21` | 前端 + UGC 风控提交状态样本截图；UI/UX 复核标签样式 |
| P2 待复核 | `share-task-status` | 失败原因和状态描述直接竞争同一区域，长失败原因可能挤压操作按钮；需要 failed/expired 长文案截图 | `miniprogram/components/share-task-status/share-task-status.less:71`、`miniprogram/components/share-task-status/share-task-status.less:74`、`miniprogram/components/share-task-status/share-task-status.wxml:10` | 前端 + 后端/API 提供长失败原因样本截图 |
| P2 待复核 | `rankings` | 榜单页已落地，但空态、列表态、推举确认、不可推举、积分不足、重复推举、移出榜单后状态均无截图；无法判断榜单分类、图片预览和推举按钮是否清晰 | `miniprogram/pages/rankings/index.wxml:16`、`miniprogram/pages/rankings/index.wxml:34`、`miniprogram/pages/rankings/index.wxml:73`、`miniprogram/pages/rankings/index.ts:124` | 前端 + 测试 + UGC 风控提交固定榜单数据截图和反例执行记录 |

### 10.4 `UX-M0-01` blocked 初判

当前 UI/UX 状态为 `blocked / 待截图回收`，不是通过。

阻塞证据：

- 缺前端负责人提交的同一固定酒局真机截图和页面路径。
- 缺接口联调负责人提交的固定三用户数据、失败分享图任务、待审 moment 和举报样本。
- 缺测试/验收负责人提交的微信开发者工具或真机录屏。
- 缺后台负责人提交的线上后台真实样本截图、操作弹层截图和 operationLogs 追溯截图。
- 缺 UGC 风控负责人提交的私密、隐藏、待补图、未授权内容不会进入分享图/榜单/奖励的执行截图。

### 10.5 UI/UX 退回单

以下退回项只代表 UI/UX 对各角色的设计和证据要求，不替代前端、后台、测试、接口联调或 PM 的完成结论。

| 退回编号 | 覆盖任务 | 退回对象 | 退回原因 | 必须补齐的证据 | UI/UX 复核方式 |
| --- | --- | --- | --- | --- | --- |
| `UX-RETURN-M1-001` | `DEV-M1-02`、`DEV-M1-03` | 前端负责人 | M1 目标是全员上传精彩瞬间，但 `live-record` 当前只给判官展示主入口；非判官是否可达 moment-editor 证据不足 | 判官/非判官同一酒局截图，非判官从进行中页进入 `moment-editor?nodeType=highlight` 的录屏或页面路径 | 复核主行动是否 2 次关键点击内可达，且不和判官辅助事件混淆 |
| `UX-RETURN-M1-002` | `DEV-M1-03`、`DEV-M1-04` | 前端负责人 + 测试负责人 | `moment-editor` 仍缺私密未选成员、私密已选成员、上传失败、保存中、授权取消截图 | 至少 8 张截图：无图、有图、上传中、上传失败、保存中、私密未选成员、私密已选成员、授权取消 | 复核表单密度、底部按钮遮挡、错误提示是否可理解 |
| `UX-RETURN-M1-003` | `DEV-M1-04`、`UGC-QA-001` | 接口联调负责人 + UGC 风控负责人 | 私密爆料不能只看代码；必须证明非接收者看到明确占位且不误以为加载失败 | 固定三用户酒局：A 发私密给 B，B/C 分别看 timeline 的截图或录屏，接口响应摘要 | 复核占位文案、图标/标签、隐私不泄露表达 |
| `UX-RETURN-M2-001` | `DEV-M2-02`、`DEV-M2-05` | 前端负责人 + 测试负责人 | `session-brief` 有页面代码，但缺 opening/highlight/private/event/closing 混合数据下的层级截图 | 简报页 loading、空 timeline、混合节点、待补图、可推举/不可推举、分享图入口截图 | 复核摘要区、时间线区、分享任务区的层级和入口优先级 |
| `UX-RETURN-M3-001` | `DEV-M3-04`、`DEV-M3-05` | 前端负责人 + 后端/API 负责人 | `share-task-status` 缺 pending/processing/ready/failed/expired 全状态视觉证据，长失败原因可能压缩按钮 | 5 种状态截图，至少 1 条长失败原因样本，ready PNG 预览截图和原始 PNG 路径 | 复核状态差异、重试入口、失败原因折行和隐私过滤 |
| `UX-RETURN-M4-001` | `DEV-M4-01` 至 `DEV-M4-05` | 后台负责人 + 测试负责人 | 后台本地 E2E 已有代码证据，但线上真实样本下的表格密度、原因弹层和日志追溯截图缺失 | 四个 slug 的真实样本截图、原因弹层截图、失败提示截图、对应 operationLogs 截图 | 复核后台是否可扫描、动作是否安全、错误态是否能指导下一步 |
| `UX-RETURN-M5-001` | `DEV-M5-01`、`DEV-M5-02`、`DEV-M5-03` | 前端负责人 + 测试负责人 + UGC 风控负责人 | `rankings` 页面代码已出现，但缺固定榜单数据和关键状态截图，UI/UX 无法评审榜单分类、推举入口、积分消耗和不可推举态 | 空态、列表态、推举确认、不可推举、积分不足、重复推举、移出榜单后状态截图；对应接口响应摘要和 points ledger/退款样本 | 截图和风控反例齐全前维持 blocked，不进入 `UX-M5-01` 通过判定 |

### 10.6 后台 moments 页面初审

后台四个 moments HTML 入口已存在，但它们只是动态壳层入口；可用性要以 `backend/public/admin/static/heatwave-ops/app.js` 渲染后的真实样本为准。

已确认的正向证据：

- `content-moments-review`、`content-moment-reports`、`growth-share-tasks`、`commerce-ranking-rewards` 四个入口 HTML 已存在。
- 后台导航已包含四个 moments 相关 slug。
- 强审计操作已使用自定义原因弹层，不再依赖 `window.prompt`。
- 原因弹层使用 `role="dialog"`、`aria-modal="true"`、`textarea` 和明确确认/取消按钮。
- 表格有分页和空态，强审计行操作使用真实 `button`。

仍需后台/测试补证据的问题：

| 级别 | 范围 | 问题 | 证据 | 下一步责任 |
| --- | --- | --- | --- | --- |
| P1 待复核 | 后台四个 moments slug | 真实数据列数、行操作数量和表格横向滚动表现未截图，无法判断运营人员是否能快速扫描 | `backend/public/admin/static/heatwave-ops/app.js:695`、`backend/public/admin/static/heatwave-ops/app.js:730` | 后台负责人提交 1366x768、1440x900 真实样本截图 |
| P1 待复核 | 后台原因弹层 | 原因弹层有代码证据，但缺线上真实操作时的截图、焦点流和错误反馈证据 | `backend/public/admin/static/heatwave-ops/app.js:352`、`backend/public/admin/static/heatwave-ops/app.js:366`、`backend/public/admin/static/heatwave-ops/app.js:1033` | 测试负责人录制 approve/hide/require_resubmit/retry 的弹层和失败提示 |
| P1 待复核 | `system-operation-logs` | 操作完成后能否从对应日志反查操作者、目标、原因、旧值/新值，尚缺页面级证据 | `backend/public/admin/static/heatwave-ops/app.js:1038` 至 `backend/public/admin/static/heatwave-ops/app.js:1055` | 后台 + 测试提交动作后日志截图和目标 ID |
| P2 待复核 | 后台空态/失败态 | 空态存在，但错误态、无权限、无可用操作的视觉层级需要真实页面截图验证 | `backend/public/admin/static/heatwave-ops/app.js:746`、`backend/public/admin/static/heatwave-ops/app.js:1034` | 后台负责人补空态、无权限、接口失败截图 |

### 10.7 下一轮 UI/UX 执行顺序

1. 先收 `UX-RETURN-M1-001` 至 `UX-RETURN-M1-003`，只复核 M1 主路径和私密不泄露。
2. M1 没有 P0/P1 后，再收 `UX-RETURN-M2-001`，复核简报层级和旧入口兼容。
3. `share-task-status` 全状态和 ready PNG 出齐后，执行 `UX-M3-01`。
4. 后台线上写操作窗口确认后，执行 `UX-M4-01`。
5. `rankings` 页面出现前，`UX-M5-01` 保持 blocked。

## 11. 准出条件

UI/UX 准出必须同时满足：

1. `UX-V1` 至 `UX-V5` 覆盖范围均有截图或录屏证据。
2. `design-qa` 或等效 QA 记录中 P0/P1/P2 均已关闭，P3 已进入后续清单。
3. UI/UX 结论与测试、UGC 风控、接口联调结论一致。
4. PM 已把 UI/UX 结论汇总到 `docs/gameplay-moments-progress-tracker.md`。

## 12. 聚会记录师改版 UI/UX 审计与方案（PR-UX-001）

本节仅记录 UI/UX 侧审计、方案和退回标准，不代表前端、测试、接口、后台或 PM 总进度完成。当前结论为 `blocked / 前端已回收，待新版实现截图/录屏复核`，不得写设计通过。PM 追加的“元素超边界、单个列表太长、单列卡片过厚重”反馈并入本 `PR-UX-001` 章节，不另建重复章节。

### 12.1 已核查内容与证据边界

已读取：

- `AGENTS.md`：确认产品新名称为“聚会记录师”，新 UI、文案、报告、分享页和设计文档应使用新名称；历史“酒桌判官”仅保留在技术上下文或旧证据描述中。
- `docs/party-recorder-redesign-requirements.md`：确认新版目标从酒桌游戏/判官降权，转为聚会记录、拍照、相册、分享；核心目标是三步内创建聚会房间并拍第一张照片。
- `docs/gameplay-moments-ui-ux-development-plan.md`：本文件为 UI/UX 自有记录，可追加本节；不修改 PM 总台账。
- `docs/gameplay-moments-team-announcements.md`：确认角色边界，UI/UX 只写自己节点和证据缺口，不替其他角色标完成。

真机素材目录 `C:\Users\Administrator\Desktop\真机测试` 已核查到 14 张 JPG 和 1 个 MP4：

| 文件 | UI/UX 观察 | 结论 |
| --- | --- | --- |
| `微信图片_20260615204247_170_528.jpg` | 首页仍以“酒桌判官”“去开一局”和工具入口为主，拍照/相册/继续记录不是第一视口主任务 | 触发 `PR-UX-P1-003`、`PR-UX-P1-004` |
| `微信图片_20260615204248_171_528.jpg` | 工具箱占据独立主入口，和聚会记录师核心任务弱相关 | 触发 `PR-UX-P1-003` |
| `微信图片_20260615204248_172_528.jpg` | 模板/酒桌内容为单列厚卡片，首屏可见内容少，品牌仍是旧方向 | 触发 `PR-UX-P1-001`、`PR-UX-P1-004` |
| `微信图片_20260615204249_173_528.jpg` | “我的”页统计卡和酒局列表过重，记录/相册/分享任务被挤压 | 触发 `PR-UX-P1-002`、`PR-UX-P1-004` |
| `微信图片_20260615204250_174_528.jpg` | 创建第 1 步模板卡半截露出，底部按钮遮挡内容，创建前必须选择玩法模板 | 触发 `PR-UX-P0-002`、`PR-UX-P1-003` |
| `微信图片_20260615204251_175_528.jpg` | 创建第 2 步玩法设置过重，包含记欠酒、点名、整活、惩罚等游戏化配置 | 触发 `PR-UX-P1-003`、`PR-UX-P1-004` |
| `微信图片_20260615204251_176_528.jpg` | 创建第 3 步底部双按钮中右侧主按钮文案和圆角区域超出边界 | 触发 `PR-UX-P0-001` |
| `微信图片_20260615204252_177_528.jpg` | 邀请页结构可复用，但仍围绕“开局/酒局/等大家”，主 CTA 没有直接引导拍第一张 | 触发 `PR-UX-P1-004` |
| `微信图片_20260615204253_178_528.jpg` | 创建成功/邀请码页有二维码入口，但需要改为“邀请后立即拍第一张”的记录链路 | 待新版 5 屏重构 |
| `微信图片_20260615204254_179_528.jpg` | 有照片上传/签到雏形，但仍处在酒局/开局语义下，需提前到三步主链路 | 待新版 5 屏重构 |
| `微信图片_20260615204254_180_528.jpg` | 该图为开发环境/显示器照片，不是可用于 UI 细节验收的直出界面截图 | 不能作为设计通过证据 |
| `微信图片_20260615204255_181_528.jpg` | 聚会详情/记录类页面仍需验证记录、相册、分享的层级和空态 | 待新版实现截图 |
| `微信图片_20260615204256_182_528.jpg` | 列表/记录页面仍偏旧酒局结构，缺相册墙和快速补拍入口验证 | 待新版实现截图 |
| `微信图片_20260615204257_183_528.jpg` | 末屏状态仍需补角色、空态、照片量多时的密度截图 | 待新版实现截图 |
| `c74d35b89b8e2da0fb7a351403042d29.mp4` | 文件存在，但本轮未收到关键帧说明、时间戳、角色、设备和样本 ID | 只能记录为待补录屏证据，不能用于通过判定 |

证据缺口：已有 `PR-UX-ASSET-001-A` 首版目标图稿，但缺前端改版后的同状态实现截图、缺 375/390/414 宽度截图、缺创建者/参与者角色截图、缺 MP4 关键帧时间戳和样本 ID。

### 12.2 SKILL 选择记录

| SKILL | 本轮选择 | 选择依据 | 使用边界 | 证据缺口 |
| --- | --- | --- | --- | --- |
| `product-design` | 使用 `product-design:get-context` 做改版 brief gate，不进入 design QA 通过判定 | 本轮是产品方向重构，必须先确认“聚会记录师”的任务、受众、流程和视觉方向 | 仅做 brief playback 和设计范围确认；缺目标稿与实现稿时不使用 design-qa 写通过，不替前端实现 | 缺 PM 确认的目标视觉稿、5 屏设计稿和新版实现截图 |
| `design-taste-frontend` | 使用 | 当前问题集中在越界、底部按钮截断、厚卡片、列表过长、旧品牌视觉不一致，适合做反模板化 UI 审计 | 只用于 UI 质量和布局合理性审计；移动端产品流程仍以本节 5 屏任务链路为准 | 缺前端改版后截图，不能判断整改完成 |
| `web-design-guidelines` | 使用 | `PR-UX-IMPLEMENT-REVIEW-001` 需要先定义实现截图接收口径；最新规则覆盖安全区、内容溢出、状态反馈、图片尺寸、触控反馈和异步状态 | 只用于接收标准和退回矩阵；缺测试截图/录屏时不写通过 | 缺 `PR-QA-ASSET-RETEST-001` 真机截图、录屏、包体和 WebP 兼容证据 |
| `design-taste-frontend` + `web-design-guidelines` | 用于 `PR-UX-REDESIGN-FULL-ACCEPT-001` | 用户明确要求完全抛弃旧样式框；需要同时约束旧视觉框架零容忍、按钮/安全区/长内容/状态反馈 | 只制定严格接收规则，不改源码，不因前端回报写通过 | 缺前端新版实现截图/录屏，不能判定旧样式是否彻底清除 |
| `imagegen-frontend-mobile` | 已用于首版 5 屏目标图 | 新版需要移动端视觉方向，且需求要求至少 3 套移动端方向说明或图稿入口 | 生成图只作为目标参考，不替代实现截图；前端需按真实组件复刻 | 仍缺前端同状态实现截图和可标注单屏稿 |
| `imagegen` | 已用于 CTA/空态/背景素材板 | 新版需要聚会贴纸、相册空态、分享海报背景等位图资产 | 生成素材板需要切图、透明化、压缩和包体评估后才能入包 | 仍缺独立切图、透明 PNG/WebP 和前端接入验收 |

### 12.3 可验收设计问题与前端退回码

以下三类问题升级为本轮通用退回标准，适用于首页、创建聚会、邀请/二维码、拍照/上传、记录/相册和底部导航：

| 标准编号 | 前端退回码 | 覆盖问题 | 退回触发 | 可验收标准 |
| --- | --- | --- | --- | --- |
| `PR-UX-STD-BOUNDARY` | `PR-FE-UX-BOUNDARY` | 元素超边界 | 底部 CTA、长按钮文案、横滑卡半露、Tab、底部安全区任一处在 375/390/414 宽度下出现溢出、遮挡、裁切、误触区域不完整 | 375/390/414 三档截图均无横向溢出；底部固定区预留安全区；长按钮文案可折行或收短；横滑卡片必须有明确完整首卡和可见滑动暗示，不允许半张卡被 CTA 遮挡 |
| `PR-UX-STD-LIST` | `PR-FE-UX-LIST` | 单个列表太长 | 任一创建流程、模板区、工具区、统计区或记录区用超过 5 项的长列表推进主任务 | 超过 5 项必须拆成“精选 3 项 + 更多”、分组折叠、横滑、搜索或二级页；创建流程不得依赖长列表才能继续；默认态必须能直接创建聚会 |
| `PR-UX-STD-CARD` | `PR-FE-UX-CARD` | 单列过厚重 | 模板、工具、统计类单列大卡占据首屏主要空间，导致主行动或记录/相册内容被挤出首屏 | 必须提供双列、轻量行、横滑或二级页降权方案；首屏优先保留创建/加入/继续记录或拍照/相册主任务；厚卡片不得成为默认主路径 |

| 问题编号 | 前端退回码 | 级别 | 证据 | 问题描述 | 可验收整改标准 | 需要前端补交 |
| --- | --- | --- | --- | --- | --- | --- |
| `PR-UX-P0-001` | `PR-FE-UX-P0-001` | P0 | `微信图片_20260615204251_176_528.jpg` | 底部双按钮右侧主按钮文案和圆角容器超出屏幕边界，存在主操作不可完整识别风险 | 必须满足 `PR-UX-STD-BOUNDARY`；375/390/414 宽度下底部按钮使用稳定 grid/flex；按钮文字不截断、不超边界；安全区 padding 生效；最长文案可折行或改短 | 三个宽度截图，含 iPhone 安全区；点击态/禁用态各 1 张 |
| `PR-UX-P0-002` | `PR-FE-UX-P0-002` | P0 | `微信图片_20260615204250_174_528.jpg` | 模板卡半截露出且被底部按钮遮挡，用户无法判断当前卡片和下一步关系 | 必须满足 `PR-UX-STD-BOUNDARY` 和 `PR-UX-STD-LIST`；创建页模板区改为可控横滑、紧凑选择器或折叠高级项；底部 CTA 不遮挡内容；首屏能完成“创建聚会”主任务 | 创建页默认态、展开模板态、滚动到底部态截图 |
| `PR-UX-P1-001` | `PR-FE-UX-P1-001` | P1 | `微信图片_20260615204248_172_528.jpg` | 单列卡片过厚重，首屏只能看到约 1.5 张内容，不适合快速创建或选择 | 必须满足 `PR-UX-STD-CARD`；热门模板最多显示 3 个紧凑项；卡片高度受控；次要内容进入“更多/高级设置” | 首页/创建页卡片密度截图，含 5 个以上模板数据 |
| `PR-UX-P1-002` | `PR-FE-UX-P1-002` | P1 | `微信图片_20260615204249_173_528.jpg` | “我的”页统计卡过度堆叠，记录、相册、分享历史不突出 | “我的”页首屏优先显示最近记录、相册、分享历史；统计改为轻量横排或二级入口 | 我的页空态、普通用户、重度用户三类截图 |
| `PR-UX-P1-003` | `PR-FE-UX-P1-003` | P1 | `微信图片_20260615204247_170_528.jpg`、`微信图片_20260615204248_171_528.jpg`、`微信图片_20260615204251_175_528.jpg` | 首页/工具箱/创建流程仍以工具和玩法设置为核心，无法支撑三步内创建并拍第一张照片 | 必须满足 `PR-UX-STD-LIST`；第一视口只保留创建聚会、加入聚会、继续记录；玩法设置默认收起或移入高级；创建成功后主 CTA 为“拍第一张” | 首页、创建、邀请成功、拍照页连续录屏 |
| `PR-UX-P1-004` | `PR-FE-UX-P1-004` | P1 | 多张真机截图 | 用户可见品牌仍是旧方向，存在“酒桌判官/酒局/判官/惩罚/欠酒/裁判”等语义和旧插画 | 新版用户可见主品牌统一为“聚会记录师”；核心文案使用聚会、记录、相册、分享、回忆、好友；游戏化词汇降级到历史兼容或高级玩法 | 全链路截图和文案 diff，覆盖首页、创建、邀请、拍照、记录/相册、我的 |

### 12.4 新版 5 屏流程

目标路径：用户三步内创建聚会房间并拍第一张照片。

1. 首页：品牌为“聚会记录师”。第一视口只放 3 个主行动：`创建聚会`、`加入口令/扫码`、`继续记录`；下方可露出最近相册或回忆墙。工具箱、玩法、惩罚类入口下沉。
2. 创建聚会：默认生成聚会名称、时间和相册封面；用户只需确认或轻改名称。主按钮为 `创建并邀请`；主题、模板、玩法全部进入高级设置，默认不阻断创建。
3. 邀请/二维码：展示房间码、二维码、微信分享和复制口令。主 CTA 为 `拍第一张`，次 CTA 为 `继续邀请`；不再要求“等大家”后才能继续。
4. 拍照/上传：提供 `拍照`、`从相册选择`、`补一句描述` 三个轻量动作；权限拒绝、上传中、上传失败和重试状态必须有明确反馈；底部 CTA 不遮挡预览。
5. 记录/相册：默认落到照片墙或时间线，保留 `记录`、`相册`、`分享` 三个清晰分区；主行动为继续拍照/上传，分享海报作为完成后动作。

三步口径：

1. 首页点击 `创建聚会`。
2. 创建页点击 `创建并邀请`。
3. 邀请页点击 `拍第一张` 进入拍照/上传并完成首张照片。

#### 12.4.1 `PR-UX-FLOW-001` 5 屏落地基线规格

落地基线采用 `Clean Quick Recorder`：跨平台轻量相册工具感，白底或浅暖灰底，浅蓝/薄荷绿为辅助，珊瑚色或暖橙只用于主 CTA。允许吸收 `Cartoon Party Snap` 的贴纸、轻插画、拍立得边框，但不得牺牲三步创建、拍照效率和文字清晰度。`Trendy Memory Wall` 仅作为分享页/相册二期增强方向。

| 屏幕 | 首屏主动作 | 信息层级 | 列表/卡片密度 | 按钮边界与安全区 | 空态/加载/错误态 |
| --- | --- | --- | --- | --- | --- |
| 首页 | 主按钮 `创建聚会`，次动作 `加入口令/扫码`、`继续记录` | 顶部品牌“聚会记录师” + 最近一次聚会/相册提示 + 三个主动作；工具、玩法、历史模板全部下沉 | 首屏最多 1 个最近聚会卡 + 3 个动作入口；不得出现 5 项以上工具长列表；最近相册可用 3 张缩略图横排 | 底部导航和主 CTA 必须满足 `PR-UX-STD-BOUNDARY`；375/390/414 下品牌标题、CTA、Tab 不溢出 | 空态：无历史时显示“创建第一场聚会”；加载：骨架占位不挤压 CTA；错误：入口仍可点击创建，错误提示不覆盖底部导航 |
| 创建聚会 | 主按钮 `创建并邀请` | 聚会名称、时间、封面/主题为主；模板/玩法为折叠高级设置，不阻断创建 | 默认只展示 3 个轻量主题或不展示模板；超过 5 项必须走精选 3 + 更多/横滑/二级页 | 底部 CTA 固定但不遮挡表单；长名称输入、模板横滑、键盘弹起都不得遮住主按钮 | 空态：默认自动生成名称和封面；加载：创建中按钮禁用并保留文案；错误：失败原因可读，保留重试，不清空已填内容 |
| 邀请/二维码 | 主按钮 `拍第一张`，次动作 `继续邀请` | 房间名 + 房间码/二维码 + 分享入口；邀请完成不是继续拍照的前置条件 | 二维码区域单卡即可；分享入口最多 3 个主渠道，其他进更多 | 二维码卡不被底部 CTA 遮挡；按钮双列时必须 grid 等宽；安全区下沿留足 | 空态：二维码生成中有占位；加载：生成/刷新二维码状态明确；错误：二维码失败时可复制口令和重试 |
| 拍照/上传 | 主按钮 `拍照`，次动作 `从相册选择` | 预览区域优先，其次是描述输入和上传状态；参与者/标签为轻量辅助 | 预览卡固定比例；最近照片最多 3 张横排；不得用长列表选择拍照入口 | 相机/上传 CTA 不贴边；权限弹窗、键盘、底部安全区不遮挡预览确认 | 空态：未选图时显示拍照引导；加载：上传进度可见；错误：权限拒绝、上传失败、格式过大都有明确重试/设置入口 |
| 记录/相册 | 主按钮 `继续拍照/上传` | 默认展示照片墙/时间线，顶部分区 `记录 / 相册 / 分享`；分享海报为完成后动作 | 1 张照片用大预览 + 引导；20 张照片使用 2 列/3 列网格或日期分组，不用单列厚卡；超过 5 条记录分组折叠 | 浮动拍照按钮或底部 CTA 不遮挡照片；Tab 和安全区满足 375/390/414；长标题/昵称不挤压图片 | 空态：提示“拍第一张照片”；加载：图片骨架与失败占位区分；错误：单图加载失败不影响全页，分享失败可重试 |

### 12.5 三套移动端视觉方向与图稿入口

以下为 `imagegen-frontend-mobile` 移动端方向入口；本轮已按 `Clean Quick Recorder` 生成首版目标图，但仍不写设计通过。

| 方向编号 | 名称 | 视觉策略 | 5 屏图稿入口 | 适用判断 |
| --- | --- | --- | --- | --- |
| `PR-VIS-DIR-01` | Cartoon Party Snap | 明亮、轻松、偏社交聚会；使用小贴纸、拍立得边框、暖橙 + 青绿 + 米白，降低游戏惩罚感 | 生成：首页、创建聚会、邀请/二维码、拍照/上传、记录/相册；每屏都要显示“聚会记录师”和拍照/相册主任务 | 适合从旧酒桌娱乐平滑转向轻松聚会，亲和力强 |
| `PR-VIS-DIR-02` | Trendy Memory Wall | 更潮流的照片墙和拼贴感；使用纸张纹理、胶片标签、珊瑚红 + 荧光绿点缀 + 深墨文字 | 生成 5 屏连续流，重点表现相册墙、朋友照片、二维码邀请和分享海报预览 | 适合强化“回忆/分享/朋友圈传播”，但需控制视觉噪音 |
| `PR-VIS-DIR-03` | Clean Quick Recorder | 清爽工具型记录器；白底、浅蓝/薄荷绿、少量珊瑚色主按钮，组件更像相册应用 | 生成 5 屏连续流，重点表现三步创建、拍第一张、记录沉淀，弱化装饰 | 适合最快落地和降低改造成本，最利于前端先修 P0/P1 |

推荐优先级：先以 `PR-VIS-DIR-03 Clean Quick Recorder` 做前端落地基线，再选 `PR-VIS-DIR-01 Cartoon Party Snap` 作为品牌增强方向；`PR-VIS-DIR-02` 适合分享增长页面和海报扩展。

#### 12.5.1 `PR-UX-VIS-001` 图稿/生图需求与验收标准

本轮 PM 已授权 UI/UX 直接生图以供前端参考。图稿可作为视觉目标和切图来源，但不代表前端实现已通过；验收仍以真机实现截图/录屏为准。移动端目标稿优先使用 `imagegen-frontend-mobile`；空态贴纸、轻插画、分享海报底图等 raster 资产使用 `imagegen`。

| 图稿项 | 需要生成 | 推荐 SKILL | 生成要求 | 验收标准 |
| --- | --- | --- | --- | --- |
| `PR-UX-VIS-001-A` | 首页目标稿 | `imagegen-frontend-mobile` | `Clean Quick Recorder` 基线，允许少量贴纸/拍立得元素；展示品牌、最近相册、创建/加入/继续记录 | 文案清晰可读；无旧品牌词；首屏 3 个主动作明确；无工具长列表 |
| `PR-UX-VIS-001-B` | 创建聚会目标稿 | `imagegen-frontend-mobile` | 默认创建表单 + 3 个轻量主题/高级设置折叠 + `创建并邀请` CTA | 创建不依赖长列表；底部 CTA 安全；模板不半露遮挡 |
| `PR-UX-VIS-001-C` | 邀请/二维码目标稿 | `imagegen-frontend-mobile` | 房间码、二维码、分享入口、主 CTA `拍第一张` | 不要求等待参与者；二维码和按钮完整；双按钮不越界 |
| `PR-UX-VIS-001-D` | 拍照/上传目标稿 | `imagegen-frontend-mobile` | 拍照、相册上传、预览、上传状态、错误重试 | 预览和 CTA 不互相遮挡；权限/上传失败有状态表达 |
| `PR-UX-VIS-001-E` | 记录/相册目标稿 | `imagegen-frontend-mobile` | 照片墙/时间线 + 记录/相册/分享分区 + 继续拍照入口 | 20 张照片仍可扫描；不使用单列厚卡；分享入口不抢主路径 |
| `PR-UX-VIS-001-F` | 空态贴纸/分享海报底图 | `imagegen` | 仅在 5 屏方向确认后生成，风格吸收 `Cartoon Party Snap` 的轻贴纸，不做重插画 | 不影响文字清晰度；可复用到空相册、上传失败、分享页 |

图稿统一验收：5 张屏必须是同一设计系统、同一色板、同一设备框架；390 宽为主设计基准，同时能指导 375/414；所有中文必须可读；不出现“酒桌判官/酒局/判官/惩罚/欠酒/裁判”等旧语义；不得出现卡片套卡片、长列表推进创建、底部 CTA 越界。

#### 12.5.2 `PR-UX-ASSET-001` 首版视觉资产包

PM 已授权 UI/UX 负责人可直接生图。2026-06-15 本轮按 SKILL 规则执行：

- `imagegen-frontend-mobile`：用于 `PR-UX-ASSET-001-A` 5 屏目标设计图，目标是统一移动端产品方向、三步流程和安全区/密度基线。
- `imagegen`：用于 `PR-UX-ASSET-001-B`、`PR-UX-ASSET-001-C`、`PR-UX-ASSET-001-D` 的 CTA 状态、空态/加载/错误贴纸、分享页/相册背景素材板。

实体文件已放入 `docs/design-assets/party-recorder/`：

| 资产编号 | 文件名 | 尺寸 | 用途 | 是否可直接给前端使用 | 是否需压缩/切图 | UI/UX 目检结论 |
| --- | --- | --- | --- | --- | --- | --- |
| `PR-UX-ASSET-001-A` | `pr-ux-asset-001-a-five-screen-target.png` | 1693x929 | 首页、创建聚会、邀请/二维码、拍照/上传、记录/相册 5 屏目标设计图总览 | 可作为目标参考，不建议直接入包 | 需要前端按组件复刻；如要单屏评审需再切 5 张单屏稿 | 三步路径清晰，无旧品牌词；日期和照片为生成占位，不作为真实内容证据 |
| `PR-UX-ASSET-001-B` | `pr-ux-asset-001-b-cta-states.png` | 1024x1536 | 核心 CTA 视觉规范，含默认、按下、禁用、加载状态 | 可作为按钮尺寸、颜色、状态参考，不是代码组件 | 需要前端提取色值/圆角/高度并在 375/390/414 复刻；入包前不需要整图使用 | 状态完整，包含 375/390/414 不溢出说明；需前端落实到真实按钮 |
| `PR-UX-ASSET-001-C` | `pr-ux-asset-001-cd-empty-share-assets.png` | 1536x1024 | 空态、加载态、错误态贴纸素材板 | 不建议整图入包，可作为切图来源 | 需要切出 camera/photo/party/upload/error/retry 等独立 PNG/WebP，并压缩 | 风格统一，适合空相册、上传中、上传失败；需要透明化/裁切后使用 |
| `PR-UX-ASSET-001-D` | `pr-ux-asset-001-cd-empty-share-assets.png` | 1536x1024 | 分享页/相册背景、分享底图方向 | 不建议整图入包，可作为背景切图来源 | 需要裁出相册背景和分享底图，按小程序包体压缩；如需透明边缘需二次处理 | 方向可用，适合作为二期分享/相册增强；不得影响文案和二维码可读性 |

资产使用边界：

- 以上文件是 UI/UX 首版视觉资产，不代表前端实现已通过。
- `PR-UX-ASSET-001-A` 是设计目标图，测试仍必须以真机实现截图/录屏验收。
- `PR-UX-ASSET-001-B` 只定义视觉状态，前端仍需补真实点击态、禁用态、加载态截图。
- `PR-UX-ASSET-001-C/D` 需要切图、透明化、WebP/PNG 压缩和包体评估后才能进入小程序资产目录；当前不直接改 `miniprogram` 资源引用。
- 所有生成图不得作为线上真实用户内容、真实二维码或真实房间码证据。

#### 12.5.3 `PR-UX-ASSET-CUT-001` C/D 素材切图包

PM 已回收 `PR-UX-ASSET-001` 并确认：A/B 可作为前端复刻依据；C/D 不能整图入包，必须切成独立、透明化/压缩后的可用素材。本轮基于 `pr-ux-asset-001-cd-empty-share-assets.png` 产出首版切图，输出目录为 `docs/design-assets/party-recorder/cuts/`。当前只交付 UI/UX/视觉资产，不改 `miniprogram` 资源引用。

| 素材编号 | 文件名 | 尺寸 | 格式 | 大小 | 覆盖场景 | 透明背景要求 | 建议入包路径 | 当前状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `PR-UX-ASSET-CUT-001-A` | `party-recorder-empty-album-sticker.png` | 230x181 | PNG | 17KB | 空相册、空记录页 | 已做边缘背景透明化，需前端在浅色/彩色背景上复核边缘 | `miniprogram/assets/party-recorder/empty-album.png` | 可交前端试用，入包前需视觉复核 |
| `PR-UX-ASSET-CUT-001-B` | `party-recorder-uploading-sticker.png` | 339x230 | PNG | 13KB | 上传中、加载中 | 已做边缘背景透明化，云朵浅色边缘需复核 | `miniprogram/assets/party-recorder/uploading.png` | 可交前端试用，入包前需视觉复核 |
| `PR-UX-ASSET-CUT-001-C` | `party-recorder-upload-failed-retry-sticker.png` | 420x222 | PNG | 29KB | 上传失败、重试引导、错误态 | 已做边缘背景透明化，适合错误卡片上方使用 | `miniprogram/assets/party-recorder/upload-failed-retry.png` | 可交前端试用，入包前需视觉复核 |
| `PR-UX-ASSET-CUT-001-D` | `party-recorder-photo-guide-sticker.png` | 228x215 | PNG | 26KB | 拍照引导、首张照片引导 | 已做边缘背景透明化，保留相机阴影 | `miniprogram/assets/party-recorder/photo-guide.png` | 可交前端试用，入包前需视觉复核 |
| `PR-UX-ASSET-CUT-001-E` | `party-recorder-album-bg.webp` | 635x422 | WebP | 11KB | 相册背景方向、相册空态背景 | 不透明背景；作为背景图无需透明 | `miniprogram/assets/party-recorder/album-bg.webp` | 可交前端试用，需确认微信小程序 WebP 支持和显示质量 |
| `PR-UX-ASSET-CUT-001-F` | `party-recorder-share-bg.webp` | 690x360 | WebP | 12KB | 分享页底图方向、二维码安全区背景 | 不透明背景；二维码/房间码区域需前端覆盖真实内容 | `miniprogram/assets/party-recorder/share-bg.webp` | 可交前端试用，需确认二维码与文案对比度 |

压缩与接入要求：

- 单个素材目标优先小于 200KB；本轮 6 个切图均已低于 200KB。
- 背景类当前为 WebP，小程序入包前需由前端确认目标基础库兼容；如需 PNG 回退，必须重新压缩并记录包体增量。
- 透明贴纸来自生成图切图和边缘背景移除，已可用于试装，但仍需在真实页面浅底、彩底、卡片底上复核毛边。
- 前端不得直接使用 1MB+ 的 `pr-ux-asset-001-cd-empty-share-assets.png` 设计板作为小程序资源。
- 如后续发现透明边缘不干净或 WebP 不兼容，状态退回为 `blocked / 需要二次生图或图像处理`，临时策略是前端使用纯 CSS 空态图标、系统 loading 或现有轻量图标占位。

### 12.6 前端下一步可直接改的范围

PM 追加信息显示：前端已提交最小 P0 修复，包括 `add-players` 底部按钮 grid、`create-session` 模板首屏 3 张紧凑卡。UI/UX 当前仅记录为 `待复拍 / 待实现截图复核`，不写通过；必须收到真机 375/390/414 截图和连续录屏后，才能判断 `PR-FE-UX-P0-001`、`PR-FE-UX-P0-002` 是否关闭。

前端可先做以下 UI 层整改，但完成后仍需提交截图给 UI/UX 复核，不能由 UI/UX 直接标前端完成：

1. 全局用户可见品牌替换为“聚会记录师”，底部导航调整为 `首页 / 记录 / 相册 / 我的` 或等价记录导向结构。
2. 首页第一视口收敛为 `创建聚会`、`加入口令/扫码`、`继续记录`，工具箱和玩法入口下沉。
3. 创建流程默认压缩为创建页 + 邀请页 + 拍照/上传页，玩法设置默认折叠为高级设置。
4. 修复底部按钮安全区、双按钮布局、最长文案折行和 375px 边界。
5. 模板/列表改为紧凑选择器、横滑或“前 3 + 更多”，避免单列厚卡片占满首屏。
6. 邀请页创建成功后的主 CTA 改为 `拍第一张`，保证用户不用等待参与者即可开始记录。
7. 对所有超过 5 项的模板、工具、统计或记录列表执行拆分：精选 3 项 + 更多、分组折叠、横滑、搜索或二级页，不允许创建流程依赖长列表推进。
8. 对模板、工具、统计类单列大卡给出双列、轻量行、横滑或二级页降权方案，首屏空间优先给创建、加入、继续记录、拍照和相册。

#### 12.6.1 前端页面到退回码映射

| 页面/入口 | 改版目标 | 必须覆盖的退回码 | 前端可执行改动 | UI/UX 复核证据 |
| --- | --- | --- | --- | --- |
| `index` | 新首页，承载创建/加入/继续记录 | `PR-FE-UX-BOUNDARY`、`PR-FE-UX-LIST`、`PR-FE-UX-CARD`、`PR-FE-UX-P1-003`、`PR-FE-UX-P1-004` | 替换旧品牌；第一视口只保留 3 个主动作；工具/玩法入口下沉；最近相册最多 3 张缩略图 | 375/390/414 首页截图；无历史/有历史两态；主 CTA 点击录屏 |
| `tools` | 从主路径降权为二级工具集合 | `PR-FE-UX-LIST`、`PR-FE-UX-CARD`、`PR-FE-UX-P1-003` | 不作为底部主 Tab；工具超过 5 项必须搜索/分组/二级页；不得挤占创建聚会路径 | 工具入口位置截图；工具页 10 项数据截图 |
| `judge/record` | 旧记录/裁判路径降级为历史兼容或记录页 | `PR-FE-UX-BOUNDARY`、`PR-FE-UX-P1-004` | 用户可见标题、按钮、空态改为聚会记录/拍照/相册语义；旧玩法词汇进入高级或历史标记 | 旧数据进入路径截图；新文案 diff；记录页空态/有图态 |
| `me` | 我的页从统计堆叠转为最近记录/相册/分享历史 | `PR-FE-UX-CARD`、`PR-FE-UX-LIST`、`PR-FE-UX-P1-002`、`PR-FE-UX-P1-004` | 统计卡轻量横排或二级入口；最近记录和相册优先；超过 5 项折叠或二级页 | 空用户、普通用户、重度用户三态截图 |
| `create-session` | 创建聚会页，默认一步创建并邀请 | `PR-FE-UX-BOUNDARY`、`PR-FE-UX-LIST`、`PR-FE-UX-CARD`、`PR-FE-UX-P0-002`、`PR-FE-UX-P1-003` | 模板首屏 3 张紧凑卡或默认收起；玩法为高级设置；底部 CTA 不遮挡内容 | 默认态、横滑态、展开高级态、键盘态、创建失败态截图 |
| `add-players` | 邀请/二维码页，主 CTA 转入拍第一张 | `PR-FE-UX-BOUNDARY`、`PR-FE-UX-P0-001`、`PR-FE-UX-P1-004` | 底部按钮 grid 等宽；主按钮 `拍第一张`；次按钮 `继续邀请`；二维码和按钮不互挡 | 375/390/414 双按钮截图；长文案态；二维码加载/失败态；点击到拍照录屏 |

#### 12.6.2 `PR-UX-IMPLEMENT-REVIEW-001` 实现待接收矩阵

PM 通知：前端 `PR-FE-ASSET-INTEGRATE-001` 已最终回报并通过 PM 基础复核；前端已按 `PR-UX-ASSET-001-A/B` 复刻 5 屏结构和 CTA 状态，并试装 `PR-UX-ASSET-CUT-001` 切图到 `miniprogram/assets/party-recorder/`。UI/UX 当前只登记待接收项，等待测试 `PR-QA-ASSET-RETEST-001` 截图/录屏回收后，按 `12.4.1`、`12.5.2`、`12.5.3`、`12.6.1` 做接收/退回；当前不得写设计通过。

| 接收项 | 对照依据 | 必须提交的截图/录屏 | UI/UX 接收标准 | 失败退回给谁 |
| --- | --- | --- | --- | --- |
| 5 屏结构 | `12.4.1`、`PR-UX-ASSET-001-A` | 首页、创建聚会、邀请/二维码、拍照/上传、记录/相册，覆盖 375/390/414 | 5 屏信息层级与目标图一致；首页只突出创建/加入/继续记录；创建页不强制玩法；邀请页主 CTA 为拍第一张；记录/相册可继续拍照 | 前端负责人；若截图缺视口/角色则退测试负责人补拍 |
| CTA 状态 | `12.5.2`、`PR-UX-ASSET-001-B` | 默认、按下、禁用、加载，覆盖主按钮/次按钮/三按钮 | 按钮高度 52px、圆角 14px、左右安全内边距 24px；375/390/414 不溢出；加载中有明确 spinner 或文案；禁用态仍可读 | 前端负责人 |
| 三步路径 | `12.4`、`12.4.1` | 从首页创建到拍第一张的连续录屏 | 1 首页点创建聚会；2 创建页点创建并邀请；3 邀请页点拍第一张进入拍照/上传；不得被玩法、长列表、等待参与者阻断 | 前端负责人；若录屏缺步骤则退测试负责人 |
| 列表密度 | `PR-FE-UX-LIST`、`PR-FE-UX-CARD`、`12.6.1` | 首页、工具页、我的页、创建页模板区、记录/相册 20 张照片样本 | 超过 5 项必须精选 3 + 更多、分组折叠、横滑、搜索或二级页；模板/工具/统计单列大卡不得占据首屏主要空间 | 前端负责人 |
| 安全区与边界 | `PR-FE-UX-BOUNDARY`、`web-design-guidelines` 安全区规则 | 375/390/414 下底部导航、底部 CTA、横滑卡、Tab、键盘态 | 无横向滚动、无圆角出屏、无按钮被安全区/键盘遮挡；横滑首卡完整可读；Tab 不挤压 | 前端负责人 |
| 贴纸透明边缘 | `12.5.3`、`PR-UX-ASSET-CUT-001` | 空相册、上传中、上传失败/重试、拍照引导在浅底/彩底/卡片底的截图 | PNG 透明边缘无明显白边/脏边；图标不模糊；贴纸不遮挡文案、按钮和图片预览 | 前端负责人；若素材本身不合格退 UI/UX/视觉负责人二次处理 |
| WebP 背景可读性 | `12.5.3` | 相册背景、分享底图、二维码/房间码覆盖态 | WebP 正常显示；二维码/房间码/按钮文案对比度足够；背景不影响主行动和分享识别；包体增量可接受 | 前端负责人；WebP 不兼容退前端给 PNG 回退方案，视觉负责人补压缩版 |
| 旧品牌降权 | `AGENTS.md`、`12.3`、`12.6.1` | 5 屏全链路截图和旧入口兼容截图 | 新用户可见主路径不出现“酒桌判官/酒局/判官/惩罚/欠酒/裁判”；旧玩法仅在历史兼容或高级入口出现，不阻断创建/拍照 | 前端负责人；若产品口径不清退 PM 确认 |
| 状态表达 | `web-design-guidelines` 异步状态、错误文案和图片规则 | 空态、加载、上传失败、权限拒绝、分享失败、图片加载失败 | 状态文案给下一步；图片有稳定尺寸不造成跳动；失败可重试；加载不遮挡主 CTA；错误态不吞掉已输入内容 | 前端负责人 |

当前缺口：

- 缺 `PR-QA-ASSET-RETEST-001` 真机截图包和连续录屏。
- 缺每张截图的设备宽度、角色视角、样本 ID、页面路径、状态说明。
- 缺 WebP 兼容结果、包体增量、透明边缘在真实页面底色上的截图。
- 缺旧入口兼容截图，无法判断旧品牌降权是否完整。

#### 12.6.3 `PR-UX-REDESIGN-FULL-ACCEPT-001` 严格改版接收规则

用户明确要求前端完全抛弃旧样式框，按 UI 设计图复刻。PM 已回收前端 `PR-FE-REDESIGN-FULL-001` 且基础复核通过；UI/UX 当前只登记接收规则与退回码，缺新版真机截图/录屏，状态只能为 `blocked / 前端已回收，待新版实现截图/录屏复核`，不得写设计通过。

首轮测试条件更新：用户确认微信 8.0.73，扫码后可正常打开；首轮可先基于 iPhone 12 / iOS 26.5 / 390 宽做 P0 初判。该口径只用于优先发现旧壳、越界、厚重单列、长列表堆叠和三步路径阻断等 P0；375/414 仍保留为最终多宽度准出补测，不因首轮只测 iPhone 12 而取消。

SKILL 选择：

- `design-taste-frontend`：用于识别旧样式框、模板感、厚重卡片、旧品牌视觉残留和“局部修补但未重构”的问题。该 SKILL 主要面向 redesign 审计，本轮只取其 full redesign / anti-slop / pre-flight 检查思想，不用于写代码。
- `web-design-guidelines`：用于约束安全区、横向溢出、长内容处理、触控反馈、图片尺寸、异步状态、错误文案和无障碍状态。已读取最新规则；本轮只做接收标准，不做源码审查结论。

旧样式框零容忍：

| 退回码 | 级别 | 零容忍触发 | 前端必须改到 | 失败退回 |
| --- | --- | --- | --- | --- |
| `PR-FE-REDESIGN-P0-OLD-FRAME` | P0 | 主路径任一屏仍使用旧“工具箱/判官/欠酒/惩罚/酒局玩法”的视觉框架、标题结构、入口优先级或大卡模板 | 以 `PR-UX-ASSET-001-A` 的 5 屏结构为准重构；旧功能全部降为二级、历史兼容或高级设置 | 前端负责人 |
| `PR-FE-REDESIGN-P0-OLD-BRAND` | P0 | 首页、创建、邀请、拍照、记录/相册主标题仍出现旧品牌或旧游戏心智 | 主路径统一为“聚会记录师 / 聚会 / 记录 / 相册 / 分享 / 回忆 / 好友”语义 | 前端负责人；若口径争议退 PM |
| `PR-FE-REDESIGN-P0-FLOW-BLOCK` | P0 | 创建到拍第一张仍被玩法设置、长列表、等待参与者、非核心工具阻断 | 三步路径必须成立：首页创建、创建并邀请、拍第一张 | 前端负责人 |
| `PR-FE-REDESIGN-P0-CTA-SAFE` | P0 | CTA 高度/圆角/内边距明显偏离 `PR-UX-ASSET-001-B`，或 375/390/414 下溢出、遮挡、不可读 | CTA 52px 高、14px 圆角、24px 左右安全内边距；默认/按下/禁用/加载状态齐全 | 前端负责人 |
| `PR-FE-REDESIGN-P1-LIST-DENSITY` | P1 | 首页、工具、模板、我的、记录任一主路径仍用超过 5 项长列表堆叠 | 默认最多精选 3 项 + 更多；其余用折叠、横滑、搜索或二级页 | 前端负责人 |
| `PR-FE-REDESIGN-P1-HEAVY-CARD` | P1 | 模板/工具/统计类单列厚重卡仍占据首屏主要空间 | 改为轻量行、双列、横滑或二级页降权；主行动必须在首屏可见 | 前端负责人 |
| `PR-FE-REDESIGN-P1-ASSET-READABILITY` | P1 | 贴纸毛边明显、WebP 背景影响文字/二维码/按钮可读性，或背景抢主路径 | 贴纸透明边缘干净；背景只做轻装饰；二维码、房间码、CTA 对比度优先 | 前端负责人；素材问题退 UI/UX/视觉负责人 |
| `PR-FE-REDESIGN-P1-SECONDARY-OLD-FEATURES` | P1 | 工具箱、玩法、惩罚、榜单等旧功能仍在首屏或底部主路径占位 | 旧功能降为二级入口、历史兼容或高级设置，不参与默认创建拍照路径 | 前端负责人 |

`PR-UX-ASSET-001-A/B` 前端验收口径：

| 验收口径 | 必须满足 |
| --- | --- |
| 五屏结构 | 首页、创建聚会、邀请/二维码、拍照/上传、记录/相册必须对应 `PR-UX-ASSET-001-A` 的层级和主动作，不接受只换颜色或局部贴图 |
| 三步路径 | 3 步内完成创建房间并进入拍第一张；任何玩法/工具/长列表阻断均退回 |
| CTA 规范 | 对照 `PR-UX-ASSET-001-B`：52px 高、14px 圆角、24px 左右安全内边距；默认、按下、禁用、加载状态齐全 |
| 列表密度 | 首页/创建/工具/我的/记录默认最多 3 项 + 更多；超过 5 项必须折叠、横滑、搜索或二级页 |
| 底部安全区 | 375/390/414 下底部 CTA、双按钮、Tab、键盘态不溢出、不遮挡、不压缩文字 |
| 贴纸/WebP 可读性 | 贴纸透明边缘干净；WebP 背景不影响二维码、房间码、按钮、状态文案可读性 |
| 旧功能降级 | 工具箱/玩法/惩罚/榜单/旧记录语义不能成为首屏或主 Tab；只允许二级、历史兼容或高级设置 |

测试复拍要求：

- 首轮 P0 初判：iPhone 12 / iOS 26.5 / 微信 8.0.73 / 390 宽，5 屏全链路：`index`、`create-session`、`add-players` 或邀请页、拍照/上传入口、记录/相册页。
- 最终准出补测：375/390/414，每屏默认态 + 长文案态 + 底部安全区态；375/414 不因首轮只测 iPhone 12 而取消。
- 三步录屏：首页创建、创建并邀请、拍第一张。
- 旧样式扫描：主路径不得出现旧工具箱框架、判官/欠酒/惩罚/酒局玩法主标题、旧大卡样式。
- 资产复核：空相册、上传中、上传失败/重试、拍照引导、相册背景、分享底图。
- 状态复核：默认、按下、禁用、加载、错误、权限拒绝、上传失败。

#### 12.6.4 `PR-UX-IP12-FIRST-SCREEN-REVIEW-001` iPhone 12 首轮截图审计

本轮只审计用户补充的 iPhone 12 / iOS 26.5 / 微信 8.0.73 / 390 宽 23:15 批次截图，不改前端源码、不改 PM 总台账、不写设计通过。当前结论为 `blocked / 创建页主题卡裁切退回，其他页面仅首轮视觉初判`。

SKILL 选择：

- `design-taste-frontend`：用于判断新版是否仍有旧壳、厚重单列卡、局部换皮但未重构的问题。
- `web-design-guidelines`：用于判断 390 宽下内容溢出、安全区、状态表达、图片/贴纸裁切和 CTA 可读性。
- 不使用 `design-qa` 通过判定：本轮只有 4 张截图，缺邀请页、记录/相册、我的页、三步录屏、375/414、多角色、多状态，不能写通过。

已审计截图：

| 页面 | 截图 | 首轮结论 | 问题级别 | 说明 |
| --- | --- | --- | --- | --- |
| 首页 | `微信图片_20260615231517_188_528.jpg` | 可做首轮视觉初判，不通过 | P2 待复核 | 主品牌和三主动作已接近目标；仍出现“周五快乐局 / 待开局 / 组局”等旧局语义，需要确认是否降为历史/继续记录语境；缺邀请页、记录/相册和录屏，不能扩写为通过 |
| 创建聚会 | `微信图片_20260615231514_187_528.jpg` | 退回前端 | P1 必修，若主题选择是必选则升级 P0 | “轻量主题”3 张卡片内容被严重裁切，只露出局部字形，无法识别主题，不符合 `PR-FE-REDESIGN-P1-HEAVY-CARD`、`PR-FE-REDESIGN-P1-LIST-DENSITY` 和 `PR-FE-UX-BOUNDARY` |
| 拍第一张初始态 | `微信图片_20260615231514_186_528.jpg` | 可做首轮视觉初判，不通过 | P1 待复核 | 主 CTA 层级清楚，但拍照引导贴纸左侧被裁切；无图初始态仍显示强主 CTA `保存照片`，需录屏确认是否可误点保存 |
| 拍照后/更换图片态 | `微信图片_20260615231513_185_528.jpg` | 可做首轮视觉初判，不通过 | P1 待复核 | 预览区尺寸稳定，CTA 安全区基本可见；但截图中照片预览为空白/占位，无法确认真实图片加载、失败态和更换图片后的视觉反馈 |

新增退回码：

| 退回码 | 级别 | 触发证据 | 前端整改验收口径 | 责任人 |
| --- | --- | --- | --- | --- |
| `PR-FE-REDESIGN-P1-THEME-CARD-CROP` | P1 必修 | `微信图片_20260615231514_187_528.jpg` 创建页主题卡只露出局部字形 | 轻量主题卡必须完整显示主题名称/图形；卡片内容安全内边距不小于 12px；不得用负位移或裁切隐藏文字；横向滚动首卡完整可见；卡片可用 `aspect-ratio: 1 / 1` 或固定高度，文字区域必须完整可读；390 宽下 3 张卡可横滑但首卡不得半露或只露字形 | 前端负责人 |
| `PR-FE-REDESIGN-P1-PHOTO-STICKER-CROP` | P1 待复核 | `微信图片_20260615231514_186_528.jpg` 拍照引导贴纸左侧被裁切 | 贴纸容器不得裁掉主体；图片应使用完整透明 PNG，`object-fit: contain`；容器左右留白不小于 16px；390 宽下贴纸边缘不得贴屏或被父容器 `overflow:hidden` 裁切 | 前端负责人；若原素材裁切则退 UI/UX/视觉负责人 |
| `PR-FE-REDESIGN-P1-PHOTO-STATE` | P1 待复核 | 初始态保存按钮可见、拍照后预览为空白/占位 | 无图初始态主 CTA 应禁用、隐藏或改为明确引导；选图后预览必须显示真实图片、加载态或失败态，不得空白；`更换图片` 按钮不得遮挡图片主体 | 前端负责人 |

本轮不能写通过的缺口：

- 缺邀请页、记录/相册、我的页截图。
- 缺三步路径连续录屏。
- 缺 375/414 多宽度补测。
- 缺创建者/参与者/未加入访客多角色。
- 缺空态、加载、错误、权限拒绝、上传失败、分享失败等多状态。
- 本批截图存在微信调试浮层/侧边浮条遮挡，作为真机操作证据可保留，但最终视觉验收截图建议关闭调试浮层后补拍。

### 12.7 仍缺截图/图稿

UI/UX 下一轮复核前必须补齐：

- 目标图稿：`PR-UX-ASSET-001-A` 已提供 5 屏总览首版；若要逐屏标注或前端切分，应再补 5 张单屏目标稿或 Figma/可标注稿。
- 图稿缺口：`PR-UX-ASSET-CUT-001` 已提供首版独立切图和建议入包命名；仍缺前端试装截图、透明边缘复核、WebP 兼容确认和包体增量记录。若需要分享海报正式底图，还需按真实二维码/头像安全区再生成或二次设计。
- 实现截图：首轮先收 iPhone 12 / iOS 26.5 / 微信 8.0.73 / 390 宽的首页、创建聚会、邀请/二维码、拍照/上传、记录/相册，用于 P0 初判。
- 多宽度补测：最终准出仍必须覆盖 375/390/414 宽度；375/414 不因首轮只测 iPhone 12 而取消。
- P0 复拍：`add-players` 底部按钮 grid 在 375/390/414 下的默认态、长文案态、安全区态；`create-session` 模板首屏 3 张紧凑卡在默认态、横滑态、底部 CTA 显示态。
- 长列表复拍：模板、工具、统计、记录任一超过 5 项的数据样本，验证是否已拆成精选 3 项 + 更多、分组折叠、横滑、搜索或二级页。
- 厚卡复拍：模板/工具/统计类页面同时提供旧问题对照和新降权方案截图，验证单列大卡不再占据首屏主要空间。
- 角色截图：创建者、普通参与者、未加入访客三类视角。
- 状态截图：空相册、已有 1 张照片、已有 20 张照片、上传中、上传失败、权限拒绝、分享成功。
- 录屏证据：三步创建并拍第一张照片的连续录屏，标注设备、系统、微信版本、样本 ID 和时间戳。
- 旧入口兼容：历史酒局/玩法入口降级后的路径截图，避免旧数据用户断路。
- `PR-UX-IMPLEMENT-REVIEW-001`：等待 `PR-QA-ASSET-RETEST-001` 回收后，按 12.6.2 接收矩阵逐项判定；缺任一证据继续 blocked。
- `PR-UX-REDESIGN-FULL-ACCEPT-001`：前端 `PR-FE-REDESIGN-FULL-001` 已回收并通过 PM 基础复核；UI/UX 等待新版实现截图/录屏，按 12.6.3 零容忍规则判定；主路径仍有旧样式框时直接退回前端。
- `PR-UX-REDESIGN-FIRST-P0-001`：首轮仅基于 iPhone 12 / iOS 26.5 / 微信 8.0.73 / 390 宽做旧壳、越界、厚重单列、长列表堆叠、三步路径阻断 P0 初判；不得扩写为全尺寸设计通过。
- `PR-UX-IP12-FIRST-SCREEN-REVIEW-001`：23:15 批次已审计 4 张截图，创建页主题卡裁切已退回；仍缺邀请页、记录/相册、我的页、三步录屏、375/414、多角色、多状态。

#### 12.7.1 `PR-UX-REMAINING-PAGES-VISUAL-001` 剩余页面目标图与前端实践包

执行边界：本节由 UI/UX 负责人维护，只补剩余页面设计目标、资产说明、前端实践清单和接收矩阵；不修改小程序业务源码，不修改 PM 总进度节点，不修改派工队列和全员公告，不替前端、测试或 UGC 风控写通过。

背景：前次 UI/UX 原线程、fork、新线程均 systemError，多代理兜底曾因额度限制失败。本轮按用户要求重试，沿已生成 5 屏目标图和切图包继续补齐 P0 剩余页面。

SKILL 选择：

| SKILL | 选择依据 | 使用边界 |
| --- | --- | --- |
| `product-design:index`、`product-design:get-context`、`product-design:ideate` | 本任务是现有产品 UI 视觉补齐，用户已给出目标、基线图、目录和禁改边界；使用 Product Design 路由先播放 brief，再进入图像方向 | 只做设计 brief、路由和视觉生成，不进入 prototype、image-to-code 或源码实现 |
| `imagegen-frontend-mobile` | 需要生成小程序移动端多屏目标图，强调 app-native、文字可读、安全区和多屏一致性 | 生成 P0 剩余页面五屏目标板；不写代码，不把生成图当作实现截图 |
| `design-taste-frontend` | 用于吸收反模板、长列表、厚重卡片、按钮溢出、状态完整性检查 | 该 SKILL 偏营销/展示页，本轮只抽取可用于小程序页面的视觉质量约束 |

视觉资产：

| 资产编号 | 文件 | 尺寸 | 覆盖页面 | 状态 | 使用说明 |
| --- | --- | --- | --- | --- | --- |
| `PR-UX-REMAINING-PAGES-VISUAL-001-A` | `docs/design-assets/party-recorder/remaining/pr-ux-remaining-p0-pages-five-screen-board.png` | 1698x926 PNG | `me`、`wine-history`、`share-poster/share-preview`、`session-brief`、`rankings` | 已生成并落地 | 作为前端复刻目标图，不建议整图入小程序包；测试仍以真机实现截图/录屏验收 |
| `PR-UX-REMAINING-PAGES-VISUAL-001-B` | `docs/design-assets/party-recorder/remaining/README.md` | Markdown | P0/P1/P2 页面清单、前端实践包、测试矩阵、退回码 | 已落地 | 作为页面级规格和协作接收说明 |

P0 页面清单：

| 页面 | 每页设计目标 | 前端实践重点 | 必测状态 / 证据 |
| --- | --- | --- | --- |
| `me` | 个人中心从统计堆叠转为快速入口和最近回忆 | 三入口 `创建聚会 / 我的相册 / 继续记录` 前置；统计、会员、设置降为轻量行或二级入口 | 空用户、普通用户、重度用户、未登录引导，375/390/414 截图 |
| `wine-history` | 历史记录转为“历史相册”和分享任务列表 | 未登录不持续刷 401；每条聚会用 3 张缩略图 + 短状态；超过 5 项必须分页/折叠/搜索 | 未登录、登录空态、有历史、待补图、分享图生成中、控制台无 loading 配对警告 |
| `share-poster/share-preview` | 分享图变为可理解的预览和任务状态 | 二维码/口令安全区明确；显示“仅包含已授权照片”；失败可重试 | pending、processing、ready、failed、expired、保存授权失败、PNG 原图和过滤节点清单 |
| `session-brief` | 简报汇总聚会亮点并引导补图/分享 | 摘要、时间线、分享任务分层；待补图不可表达为可公开或可推举 | loading、空 timeline、混合节点、待补图、可分享、不可推举 |
| `rankings` | 榜单作为二级可选回忆功能，不阻塞记录路径 | 照片主导，积分提示短句，禁用原因显性；入口来自相册/简报/历史 | 空态、列表态、分类切换、推举确认、积分不足、重复推举、移出榜单后退款提示 |

P1/P2 后续设计队列：

| 优先级 | 页面 / 流程 | 设计目标 | 进入条件 |
| --- | --- | --- | --- |
| P1 | `join-claim` | 加入口令/扫码后的身份认领、头像昵称确认和加入成功态 | 邀请页截图和加入链路接口状态明确 |
| P1 | `waiting-room` | 等待室改为聚会准备页，弱化等待，突出拍第一张和邀请进度 | 三步路径不再依赖等待室后补视觉 |
| P1 | `invalid-state` | 统一无效口令、过期房间、无权限、网络失败 | 测试提供错误码和入口路径 |
| P1 | `settings` | 聚会与账号设置轻量化，避免长表单 | 前端提供现有设置项清单 |
| P1 | `profile-edit` | 编辑昵称、头像、隐私偏好 | 登录态、头像上传和保存失败边界明确 |
| P2 | `member-center` | 会员权益转向相册/分享增强，不抢主路径 | 商业化口径确认 |
| P2 | `premium-templates` | 高级模板二级页，避免创建页强制选择 | 模板数量、免费/付费规则确认 |
| P2 | `coupon-center` | 优惠券中心降权为我的页二级入口 | 运营活动规则确认 |
| P2 | `usage-history` | 使用记录、积分流水、分享历史整合 | 数据字段和权限确认 |
| P2 | `tools/tool-detail` | 工具箱保留为二级工具库，按搜索/分类进入详情 | 工具清单和排序确认 |
| P2 | `session-rules` | 玩法/规则作为高级设置，不阻断创建 | PM 确认旧玩法兼容边界 |
| P2 | `question-bank` | 题库作为历史/高级娱乐功能，弱化默认入口 | UGC 风控和运营口径确认 |

前端实践清单：

1. 底部 CTA 固定 52px 高、14px 圆角、24px 左右安全内边距；双按钮用等宽 grid，375/390/414 不换行、不出屏。
2. 页面默认不使用整页大卡片框架；列表和状态优先用分组、轻量行、缩略图条和短文案。
3. 超过 5 项的历史、工具、榜单、设置入口必须收敛为精选 3 项 + 更多、分组折叠、横滑、搜索或二级页。
4. 相册缩略图用稳定比例，列表中最多展示 3 张缩略图，更多数量用文本或入口表达。
5. 分享预览必须明确过滤规则；私密、待补图、隐藏、未授权、未审核内容不得进入公开图。
6. `rankings` 不能成为首页主路径或默认创建路径；榜单只作为二级回忆传播入口。
7. 贴纸只作为引导和空态，不遮挡二维码、房间码、按钮、照片主体和状态提示。
8. 旧功能兼容必须下沉到历史兼容或高级设置，不得重新占据首页、创建、邀请、拍照、相册主路径。

测试接收矩阵与退回码：

| 接收项 | 必须证据 | UI/UX 判定 | 退回码 |
| --- | --- | --- | --- |
| P0 五页结构 | 5 页 375/390/414 截图，含页面路径、角色、构建号 | 信息层级与 `PR-UX-REMAINING-PAGES-VISUAL-001-A` 一致 | `PR-FE-REMAINING-P0-STRUCTURE` |
| 边界与安全区 | 底部 CTA、Tab、二维码、横滑缩略图、长按钮截图 | 无出屏、遮挡、半露、不可读 | `PR-FE-REMAINING-P0-BOUNDARY` |
| 长列表处理 | 历史相册、我的页、榜单、工具/设置 6 项以上样本 | 已折叠、分组、横滑、搜索或二级页 | `PR-FE-REMAINING-P1-LIST` |
| 厚重卡片处理 | 我的页统计、历史相册、简报摘要、榜单卡首屏截图 | 单列厚卡不挤压主动作 | `PR-FE-REMAINING-P1-HEAVY-CARD` |
| 分享过滤 | 分享预览截图、PNG 原图、被过滤节点清单 | 不泄露私密/待补图/隐藏/未授权内容 | `PR-FE-REMAINING-P0-SHARE-FILTER` |
| 401/loading 回归 | `wine-history` 未登录、失效 token、登录后、控制台截图 | 不重复刷 401，无 loading 配对警告 | `PR-FE-REMAINING-P0-AUTH-STATE` |
| 榜单风控 | 榜单状态截图、推举响应、points ledger/退款样本 | 禁用原因清晰，不违规扣分 | `PR-FE-REMAINING-P1-RANKING-STATE` |

当前状态：`PR-UX-REMAINING-PAGES-VISUAL-001` 设计资产与实践包已落地，但仍为 `blocked / 待前端实现截图和测试证据回收`。缺少 5 页同状态真机截图、三步录屏、角色视角、接口摘要、PNG 原图和控制台证据前，不得写 UI/UX 通过。

#### 12.7.2 `PR-UX-REMAINING-PAGES-IMPLEMENT-REVIEW-001` 剩余页面实现接收准备

执行边界：本节只为前端 `PR-FE-REMAINING-PAGES-IMPLEMENT-001` 准备 UI/UX 接收规则；不新增设计资产，不修改业务源码，不修改 PM 总台账、派工队列或测试结论。当前状态只能记录为 `blocked / 待实现截图复核`，不得写 UI/UX 通过。

SKILL 选择：

| SKILL | 选择依据 | 使用边界 | 证据缺口 |
| --- | --- | --- | --- |
| `web-design-guidelines` | 本轮是实现接收准备，需要覆盖安全区、长文本、图片尺寸、异步 loading/error、焦点/触控与状态反馈等可验收规则；已按 SKILL 要求拉取最新规则源 `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md` | 只转化为截图/录屏接收标准和退回码，不直接审代码通过 | 尚无前端实现截图、PNG 原图、控制台截图、接口摘要 |
| `design-taste-frontend` | 用于反模板和改版一致性检查，重点约束旧样式框、厚重单列卡、长列表堆叠、CTA 层级和视觉密度 | 该 SKILL 非移动端生图工具，本轮不用于生成新图，只用于实现截图的审美/结构退回口径 | 尚无 375/390/414 真机对照，无法判断实际密度和安全区 |
| `imagegen-frontend-mobile` / `imagegen` | 本轮 PM 明确要求不要扩大设计资产范围，除非前端提出逐屏切图或尺寸标注 | 暂不使用；沿用 `PR-UX-REMAINING-PAGES-VISUAL-001-A/B` 和既有切图包 | 若前端后续无法复刻目标图，再登记逐屏标注或二次切图需求 |

5 页实现截图接收标准：

| 页面 | 必须提交截图/录屏 | UI/UX 接收标准 | 主要退回码 | 失败退回给谁 |
| --- | --- | --- | --- | --- |
| `me` 我的 | 375/390/414 截图；未登录、普通用户、重度用户；底部 Tab 与设置入口；接口摘要含 profile/member 状态 | 页面主心智为“我的记录/相册/继续记录”；首屏只突出创建、我的相册、继续记录等轻入口；统计、会员、优惠券、工具降为轻量行或二级入口；无旧品牌主标题、无厚重统计大卡压住主动作 | `PR-FE-REMAINING-P0-STRUCTURE`、`PR-FE-REMAINING-P0-BOUNDARY`、`PR-FE-REMAINING-P1-LIST`、`PR-FE-REMAINING-P1-HEAVY-CARD` | 前端负责人；缺角色/接口摘要时退测试负责人补证据 |
| `wine-history` 相册/历史 | 375/390/414 截图；未登录、登录空态、有 1/5/20 条历史；失效 token；控制台 401/loading 截图 | 页面标题和内容转为“历史相册/回忆”；未登录不重复刷 401；loading、empty、error 成对出现并有下一步；列表超过 5 项必须搜索、分页、折叠、横滑或二级页；每条最多 3 张稳定比例缩略图 | `PR-FE-REMAINING-P0-AUTH-STATE`、`PR-FE-REMAINING-P1-LIST`、`PR-FE-REMAINING-P1-HEAVY-CARD`、`PR-FE-REMAINING-P0-BOUNDARY` | 前端负责人；401/loading 原始日志缺失时退测试负责人 |
| `share-poster/share-preview` 分享海报/预览 | 375/390/414 截图；pending、processing、ready、failed、expired、保存授权失败；PNG 原图；过滤节点清单；二维码识别截图 | 海报以聚会回忆和分享为主，不暴露私密、待补图、隐藏、未授权、未审核内容；二维码/口令/CTA 在安全区内且可读；生成中和失败态不空白；PNG 原图与真机预览一致 | `PR-FE-REMAINING-P0-SHARE-FILTER`、`PR-FE-REMAINING-P0-BOUNDARY`、`PR-FE-REMAINING-P0-STRUCTURE`、`PR-FE-REMAINING-P1-ASSET-READABILITY` | 分享过滤失败退前端负责人和 UGC/风控负责人复核；截图缺 PNG 原图退测试负责人 |
| `session-brief` 聚会简报 | 375/390/414 截图；loading、空 timeline、混合节点、待补图、可分享、不可推举；三步录屏中的入口/返回路径 | 简报结构为摘要、时间线、照片/亮点、分享任务分层；待补图不能呈现为已公开或可推举；CTA 不遮挡内容；长时间线收敛为精选 3 项 + 更多或二级页 | `PR-FE-REMAINING-P0-STRUCTURE`、`PR-FE-REMAINING-P1-LIST`、`PR-FE-REMAINING-P0-BOUNDARY`、`PR-FE-REMAINING-P1-STATE-COPY` | 前端负责人；状态样本缺失退测试负责人和接口负责人补接口摘要 |
| `rankings` 榜单 | 375/390/414 截图；空态、列表态、分类切换、推举确认、积分不足、重复推举、移出榜单退款提示；points ledger/退款接口摘要 | 榜单为二级可选回忆功能，不进入首页/创建/拍照主路径；照片优先，积分说明短句化；禁用原因可见；推举/退款/重复态文案明确，不违规扣分 | `PR-FE-REMAINING-P1-RANKING-STATE`、`PR-FE-REMAINING-P0-STRUCTURE`、`PR-FE-REMAINING-P1-LIST`、`PR-FE-REMAINING-P1-HEAVY-CARD` | 前端负责人；积分/退款证据缺失退接口负责人和测试负责人 |

退回码定义：

| 退回码 | 触发条件 | P 级 | 最低修复口径 |
| --- | --- | --- | --- |
| `PR-FE-REMAINING-P0-STRUCTURE` | 5 页任一页未按 `PR-UX-REMAINING-PAGES-VISUAL-001-A` 的主信息层级复刻，或旧“酒桌判官/酒局/判官/惩罚/欠酒/裁判”主心智重新占据首屏 | P0 | 主标题、首屏 CTA、入口优先级改回“聚会记录师/相册/分享/回忆”；旧功能仅二级入口 |
| `PR-FE-REMAINING-P0-BOUNDARY` | 375/390/414 任一宽度下出现 CTA、Tab、二维码、横滑缩略图、长按钮、贴纸或卡片出屏、遮挡、半露、不可读 | P0 | 使用安全区 padding；底部 CTA 52px 高、14px 圆角、24px 左右内边距；横滑首卡完整可读；文本可截断但不能裁字 |
| `PR-FE-REMAINING-P1-LIST` | 历史、我的、榜单、设置/工具入口超过 5 项仍用单列长列表推进主路径 | P1 | 精选 3 项 + 更多、分组折叠、横滑、搜索或二级页，创建/记录主路径不得依赖长列表 |
| `PR-FE-REMAINING-P1-HEAVY-CARD` | 统计、历史、简报、榜单任一单列厚卡占据首屏主要空间，挤压主 CTA 或核心照片/回忆内容 | P1 | 改为轻量行、双列、缩略图条、横滑或二级页，首屏优先主动作和最近回忆 |
| `PR-FE-REMAINING-P0-SHARE-FILTER` | 分享海报/预览包含私密、待补图、隐藏、未授权、未审核内容，或 PNG 原图与真机预览过滤结果不一致 | P0 | 前端必须按授权/审核/可分享字段过滤；PNG 原图、预览图和节点清单一致 |
| `PR-FE-REMAINING-P0-AUTH-STATE` | `wine-history` 未登录或 token 失效时重复刷 401、loading 不配对、页面空白或无法回到登录/重试 | P0 | 401 只触发明确登录/重试态；loading 有进入和退出；控制台无连续 401 噪音和 loading 配对警告 |
| `PR-FE-REMAINING-P1-RANKING-STATE` | 榜单禁用、重复推举、积分不足、移出退款等状态原因不清晰，或接口摘要显示违规扣分/未退款 | P1 | 文案给出原因和下一步；推举/退款状态与 points ledger/接口摘要一致 |
| `PR-FE-REMAINING-P1-ASSET-READABILITY` | WebP 背景、贴纸、海报图影响二维码、房间码、按钮或正文可读性，或图片无稳定尺寸造成跳动 | P1 | 背景降噪或加遮罩；图片固定宽高/比例；二维码和 CTA 保持高对比 |
| `PR-FE-REMAINING-P1-STATE-COPY` | loading、empty、failed、expired、权限拒绝等状态只有问题没有下一步，或按钮文案泛化为不可执行的“继续” | P1 | 状态文案包含明确动作，如“重新生成分享图”“去补照片”“重新登录”“返回相册” |

接收证据准入：

- 测试必须提交 375/390/414 三档截图；首轮可先用 iPhone 12 / 390 做 P0 初判，但最终不得缺 375/414。
- 每张截图必须标注页面路径、角色视角、样本 ID、构建号/提交号、设备、系统、微信版本和时间戳。
- 必须提交三步录屏：从首页创建/继续记录进入，到剩余页面入口，再返回拍照/相册主路径，证明新增页不阻断核心路径。
- 必须提交角色视角：创建者、参与者、未登录/失效登录，分享页需补访客视角。
- 必须提交接口摘要：`wine-history` 的 401/loading、`share-poster/share-preview` 的过滤节点、`rankings` 的 points ledger/退款样本、`session-brief` 的 timeline/待补图状态。
- 分享页必须提交 PNG 原图和真机预览截图；PNG 原图不能替代真机截图，设计稿不能替代实现截图。
- 缺任一核心证据时，UI/UX 只登记 `blocked / 待实现截图复核`，不进入通过判定。

#### 12.7.3 `PR-UX-0616-IP12-RETEST-REVIEW-001` 0616 iPhone 12 首轮退回评审

执行边界：本节只基于 `C:\Users\Administrator\Desktop\真机测试\0616` 中 13 张真机截图做 UI/UX 首轮退回评审；不修改业务源码，不修改 PM 总台账，不替测试、UGC 或前端写通过。后续真机截图需求必须等最后大版本一次性列给用户，本节只登记草案。

本轮 Design Read：这是“聚会记录师”小程序从旧酒桌游戏心智迁移到 Clean Quick Recorder 的移动端实现退回评审，核心目标是三步创建、拍照、相册、分享清晰可用，旧玩法降权且不阻断主路径。

SKILL 选择：

| SKILL | 选择依据 | 使用边界 | 证据缺口 |
| --- | --- | --- | --- |
| `web-design-guidelines` | 本轮核查真机截图中的安全区、长文本、图片尺寸、空态、loading/error、触控 CTA 和状态文案；已按 SKILL 要求拉取最新规则源 `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md` | 只转化为截图退回标准，不做源码审查通过 | 缺 375/414、多角色、控制台、接口摘要、连续录屏 |
| `design-taste-frontend` | 用于反模板和旧样式框识别，重点判断旧品牌主视觉、厚重卡片、长列表、旧玩法心智是否仍占据主路径 | 该 SKILL 非移动端生图工具，本轮只用于审美/结构退回，不生成新图 | 缺完整同状态实现截图和最终大版本多宽度证据 |
| `design-qa` | 不使用 | 缺目标图逐屏标注、同状态实现截图、录屏和多角色证据，不能做通过判定 | 当前只能 `blocked / 退回修复后待最终大版本复拍` |

本批已核查截图：

| 文件 | 初判页面/状态 | UI/UX 观察 |
| --- | --- | --- |
| `微信图片_20260616002611_189_528.jpg` | 首页首屏 | 最近相册缩略图仍显示房贷计算、二维码生成、图片压缩等工具语义，和“聚会相册/回忆”不一致 |
| `微信图片_20260616002612_190_528.jpg` | 聚会简报 | 主标题仍为“酒局时间线简报”，旧酒局心智未清理 |
| `微信图片_20260616002612_191_528.jpg` | 旧桌面/玩法页 | 仍出现“玩家、欠酒、已喝、已消、总计、桌面模式、结束本局”等旧玩法结构 |
| `微信图片_20260616002613_192_528.jpg` | 记录/相册 | 大 CTA 和底部双按钮并存，层级重复；预览卡偏小且可读性不足 |
| `微信图片_20260616002614_193_528.jpg` | 榜单空态 | 空态英文 `not found`，Tab 右侧半露，状态文案不符合中文产品体验 |
| `微信图片_20260616002615_194_528.jpg` | 聚会简报/分享任务 | 仍为“酒局时间线简报”，分享任务卡底部疑似被截断，需要最终复拍确认 |
| `微信图片_20260616002616_195_528.jpg` | 我的/历史列表 | 列表密度偏高，仍需多状态和多宽度验证 |
| `微信图片_20260616002616_196_528.jpg` | 记录页 | 旧“酒桌判官”主视觉、酒桌插画、快速开一局、待记录、1/2 人等旧玩法心智仍是主视觉，命中零容忍 |
| `微信图片_20260616002617_197_528.jpg` | 我的 | 首屏主动作弱，左侧入口卡疑似空白/素材未加载；需最终复拍和接口摘要确认 |
| `微信图片_20260616002617_198_528.jpg` | 拍照有图/占位态 | 有图态仍以 `保存照片` 为强主 CTA，但预览区是浅色占位，真实图片加载状态不清；底部 CTA 接近安全区 |
| `微信图片_20260616002618_199_528.jpg` | 拍照空态 | 贴纸左侧仍被裁切；无图初始态底部仍显示 `保存照片`，容易误导为可保存 |
| `微信图片_20260616002619_200_528.jpg` | 创建聚会 | 轻量主题卡仍严重裁切，只露出局部字形；不能作为设计通过 |
| `微信图片_20260616002620_201_528.jpg` | 首页新版首屏 | 主品牌为“聚会记录师”基本正确，但最近相册缩略图语义/加载仍异常，且缺录屏和多宽度 |

P0/P1 退回结论：

| 问题 | P 级 | 命中截图 | 退回码 | 前端修复建议 |
| --- | --- | --- | --- | --- |
| 记录页仍出现旧“酒桌判官”主视觉和旧玩法心智 | P0 | `196` | `PR-FE-0616-P0-OLD-BRAND-FRAME` | 移除主路径旧酒桌判官 hero、酒桌插画、快速开一局、待记录、人数开局等旧框架；记录页改为聚会记录/相册/继续拍照结构，旧玩法只能二级历史兼容 |
| 旧玩法页仍以“玩家/欠酒/已喝/已消/桌面模式/结束本局”为核心 | P0 | `191` | `PR-FE-0616-P0-OLD-GAME-MINDSET` | 该入口不得在首页、记录页、创建路径形成主路径；若保留必须标为历史/高级玩法，入口降权并避免影响三步创建拍照 |
| 创建页主题卡仍严重裁切，只露出局部字形 | P0 | `200` | `PR-FE-0616-P0-THEME-CARD-CROP` | 主题/封面/贴纸类卡片必须完整显示标题/图形；卡片内容安全内边距不小于 12px；禁止负位移裁字；横滑首卡完整可读；390 下 3 张卡可横滑但不能只露字形 |
| 聚会简报仍写“酒局时间线简报” | P0 | `190`、`194` | `PR-FE-0616-P0-OLD-COPY-BRIEF` | 改为“聚会时间线简报”或“聚会简报”；全链路清理酒局、判官、欠酒、惩罚、裁判等主路径文案 |
| 首页最近相册缩略图语义错误，出现房贷计算/二维码生成/图片压缩 | P1 | `189`、`201` | `PR-FE-0616-P1-ALBUM-THUMB-SEMANTIC` | 最近相册只能展示聚会照片、相册封面、空态贴纸或骨架屏；不得复用工具箱图标/业务无关缩略图；图片加载失败要显示相册空态而不是工具图 |
| 榜单空态英文 `not found` | P1 | `193` | `PR-FE-0616-P1-RANKING-EMPTY-COPY` | 改为中文可行动空态，如“还没有上榜照片，推荐成功后会按热度排序”；错误态需说明下一步，不能直接暴露英文接口/默认文案 |
| 榜单 Tab 右侧半露且横向边界不清 | P1 | `193` | `PR-FE-0616-P1-RANKING-TAB-BOUNDARY` | Tab 横滑需要首尾安全 padding，最后一项不可半露成不可读字符；可改为可横滑芯片并保留渐隐提示或折叠菜单 |
| 拍照空态贴纸仍被裁切 | P1 | `199` | `PR-FE-0616-P1-PHOTO-STICKER-CROP` | 贴纸使用完整透明 PNG 和 `object-fit: contain`；父容器不得 `overflow:hidden` 裁主体；左右留白不小于 16px |
| 拍照无图/占位态仍显示强主 CTA `保存照片` | P1，若可点击保存空图则升 P0 | `198`、`199` | `PR-FE-0616-P1-PHOTO-SAVE-STATE` | 无图时隐藏、禁用或改为“先拍照/选择照片”；有图后才显示 `保存照片`；占位/加载/失败三态必须可区分 |
| 记录/相册页 CTA 层级重复，大 CTA 和底部双按钮抢主路径 | P1 | `192` | `PR-FE-0616-P1-CTA-HIERARCHY` | 当前页只保留一个主 CTA；底部双按钮用于明确分流时必须主次清晰，避免“继续拍照”重复出现 |
| 我的页入口/素材疑似空白，主动作不稳定 | P1 | `197` | `PR-FE-0616-P1-ME-ASSET-STATE` | 我的页首屏入口卡需有图标、标题和状态；图片/贴纸加载失败显示稳定占位，不留空白大卡 |

当前 UI/UX 状态：`blocked / 0616 首轮截图退回，待前端修复后最终大版本一次性复拍`。本批截图只能作为首轮退回依据，不能作为通过依据。

前端修复优先级：

1. 先处理 P0：旧品牌框架、旧玩法心智、创建页主题卡裁切、简报旧酒局文案。
2. 再处理 P1：最近相册缩略图语义、榜单空态和 Tab 边界、拍照页贴纸裁切和保存按钮状态、记录页 CTA 层级、我的页空白入口。
3. 修复后不要零散要求用户反复截图；由测试在最后大版本统一收口复拍。

最后大版本一次性截图需求草案：

| 类别 | 一次性提交内容 |
| --- | --- |
| 设备/宽度 | iPhone 12 / 390 首轮全链路；375、414 最终补测；标注 iOS、微信版本、构建号、时间戳 |
| 页面截图 | 首页、创建聚会、邀请/二维码、拍照空态、拍照有图、记录/相册、聚会简报、分享预览/海报、榜单、我的、历史相册、无效/过期态 |
| 录屏 | 三步路径：首页创建聚会 -> 创建并邀请 -> 拍第一张；补一条继续记录 -> 拍照 -> 相册/简报；补一条分享预览 -> 保存/失败重试 |
| 角色 | 创建者、参与者、未登录/失效登录、访客打开分享页 |
| 状态 | 空态、loading、失败、权限拒绝、上传失败、分享图生成中、分享图 ready、分享图 failed/expired、榜单空态/列表/重复推举/积分不足 |
| 控制台/接口 | `wine-history` 401/loading、`session-brief` timeline/待补图、`share-poster/share-preview` 过滤节点、`rankings` points ledger/退款摘要 |
| 原图 | 分享 PNG 原图、相册缩略图真实来源、拍照上传后预览原图或压缩图信息 |
| 视觉准出点 | 旧品牌主标题清零、旧玩法框架不在主路径、主题卡完整可读、最近相册语义正确、无英文默认空态、CTA 不越界、安全区不遮挡 |

#### 12.7.4 `PR-UX-FINAL-BIG-VERSION-ACCEPT-GATE-001` 最终大版本接收门禁

执行边界：本节只追加 UI/UX 最终接收门禁，用于测试整理最终一次性采集包后做 UI/UX 接收/退回；不扩大设计资产，不修改业务源码，不修改 PM 总台账，不替前端、测试、API 或 UGC 写通过。当前状态只能为 `blocked / 待最终证据接收`。

SKILL 选择：

| SKILL | 选择依据 | 使用边界 | 证据缺口 |
| --- | --- | --- | --- |
| `web-design-guidelines` | 最终门禁需要覆盖安全区、触控 CTA、图片尺寸、空态/loading/error、长文本、错误文案和可访问状态；本轮已拉取最新规则源 `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md` | 只转化为证据准入、截图接收项和退回码，不做源码通过判定 | 缺最终大版本真机截图、录屏、控制台和接口摘要 |
| `design-taste-frontend` | 用于维持旧壳零容忍和反模板标准，识别旧品牌主标题、旧玩法大卡、厚重单列、长列表过重、模板卡裁切等视觉回退 | 该 SKILL 非移动端生图工具，本轮不生成新设计资产，只用于结构和审美门禁 | 缺 375/390/414 同状态对照，不能判定最终视觉通过 |
| `design-qa` | 不使用 | 目前没有最终同状态截图/录屏和多角色证据，不满足设计 QA 通过前置条件 | 收齐证据后才可进入 UI/UX 接收初判 |

最终接收证据准入：

| 证据包 | 必须到位内容 | UI/UX 接收门禁 | 缺失处理 |
| --- | --- | --- | --- |
| iPhone 12 / 390 主路径截图 | 首页、创建聚会、邀请/二维码、拍照空态、拍照有图、记录/相册、聚会简报、分享预览/海报、榜单、我的、历史相册 | 可先做 P0 初判：旧壳清零、三步路径不阻断、CTA 不越界、英文错误不直显、创建主题卡完整可读 | 缺任一主路径页面则 `blocked / 待补截图` |
| 375/414 最终补测 | 与 390 同页面、同角色、同样本 ID 对照截图 | 375/390/414 均无横向溢出、Tab 半露、底部 CTA 遮挡、安全区压住按钮、长按钮换行裁字 | 缺 375 或 414 不得写最终 UI/UX 通过 |
| 三步连续录屏 | 首页创建聚会 -> 创建并邀请 -> 拍第一张；另补继续记录 -> 拍照 -> 相册/简报 | 三步内完成创建和拍第一张；不得被玩法、长列表、等待室、模板选择、榜单或会员入口阻断 | 缺录屏只可做静态截图初判，不得做流程通过 |
| 5 个剩余页截图 | `me`、`wine-history`、`share-poster/share-preview`、`session-brief`、`rankings`，覆盖空态/有数据/失败或禁用态 | 与 `PR-UX-REMAINING-PAGES-VISUAL-001-A` 信息层级一致；旧功能降权；列表密度、厚卡、分享过滤、榜单状态符合 12.7.2 | 缺任一页则对应页保持待接收 |
| 角色视角 | 创建者、参与者、未登录/失效登录、访客打开分享页 | 角色权限、CTA、空态、错误态清晰；未登录/失效 token 不重复刷 401；访客分享页不暴露私密内容 | 缺角色则退测试负责人补拍，必要时退 API 补权限摘要 |
| 分享 PNG 原图 | 分享 PNG 原图、真机预览截图、过滤节点清单、二维码识别截图 | PNG 原图和真机预览一致；私密、待补图、隐藏、未授权、未审核内容不进入公开图；二维码/口令可读 | 缺 PNG 原图或过滤清单时分享页不得接收 |
| `rankings` 修复后状态 | 空态中文、列表态、分类切换、推举确认、积分不足、重复推举、移出榜单退款提示，含 points ledger/退款摘要 | 不再出现英文 `not found`；Tab 不半露；禁用原因和下一步清晰；积分/退款与接口摘要一致 | 缺接口摘要或状态截图时榜单保持待接收 |
| 控制台/API 摘要 | `wine-history` 401/loading、`session-brief` timeline/待补图、`share-poster` 过滤、`rankings` 积分/退款 | 无连续 401 噪音、loading 成对、错误态可恢复；接口状态和视觉状态一致 | 缺摘要时相关页面只做视觉初判，不做接收 |

旧壳零容忍退回项：

| 退回码 | 触发条件 | P 级 | 责任人 |
| --- | --- | --- | --- |
| `PR-FE-FINAL-P0-OLD-BRAND-TITLE` | 主路径任一页主标题或首屏核心视觉仍出现“酒桌判官/酒局/判官/裁判/惩罚/欠酒”等旧品牌主心智 | P0 | 前端负责人；如产品口径不清退 PM |
| `PR-FE-FINAL-P0-OLD-GAME-CARD` | 首页、记录页、创建页、简报或相册主路径仍有旧玩法大卡、酒桌插画、快速开一局、欠酒/已喝/桌面模式等结构 | P0 | 前端负责人 |
| `PR-FE-FINAL-P0-FLOW-BLOCK` | 创建到拍第一张被玩法设置、长列表、会员、榜单、等待室、模板必选或旧功能阻断 | P0 | 前端负责人；接口阻断退 API |
| `PR-FE-FINAL-P0-BOUNDARY-SAFEAREA` | 375/390/414 任一宽度 CTA、Tab、二维码、贴纸、卡片、横滑首卡、底部导航越界、遮挡、半露或不可读 | P0 | 前端负责人 |
| `PR-FE-FINAL-P0-ENGLISH-ERROR` | 用户可见空态/错误态直显英文默认文案、接口文案或 `not found` | P0 | 前端负责人；接口原文需 API 提供可本地化错误码 |
| `PR-FE-FINAL-P1-HEAVY-SINGLE-CARD` | 模板、统计、榜单、历史、我的页仍用厚重单列大卡占据首屏主要空间，挤压主动作 | P1 | 前端负责人 |
| `PR-FE-FINAL-P1-LONG-LIST` | 超过 5 项仍用长列表堆叠推进主路径，未提供精选 3 项 + 更多、分组折叠、横滑、搜索或二级页 | P1 | 前端负责人 |
| `PR-FE-FINAL-P1-THEME-ASSET-CROP` | 主题、封面、贴纸、相册缩略图或分享图被裁切到只露局部字形/主体，或语义错误复用工具图 | P1；若阻断创建选择则 P0 | 前端负责人；素材本身问题退 UI/UX 视觉负责人 |
| `PR-FE-FINAL-P1-STATE-COPY` | loading、empty、failed、expired、权限拒绝、上传失败、分享失败只描述问题，不给下一步 | P1 | 前端负责人 |
| `PR-FE-FINAL-P1-SHARE-FILTER` | 分享预览、分享 PNG、过滤节点清单不一致，或公开图可见私密/待补图/隐藏/未授权内容 | P1；涉及隐私泄露则 P0 | 前端负责人和 UGC/风控负责人 |
| `PR-FE-FINAL-P1-RANKING-STATE` | 榜单空态、分类、推举、积分不足、重复推举、退款提示与接口摘要不一致或状态原因不清 | P1 | 前端负责人和 API 负责人 |

最终接收顺序：

1. 先看 iPhone 12 / 390 主路径截图和三步录屏，若命中旧壳、流程阻断、越界、安全区遮挡、英文错误直显任一 P0，直接退回前端，不进入细项通过判定。
2. P0 未命中后，再核 5 个剩余页截图和角色视角，逐页判断结构、列表密度、厚卡、状态表达、分享过滤和榜单状态。
3. 最后核 375/414 补测、PNG 原图、控制台/API 摘要和 UGC/风控清单；缺任一最终准出证据时保持 `blocked / 待最终证据补齐`。

当前结论：前端代码侧据称已修复，但 UI/UX 尚未收到最终大版本复拍证据。UI/UX 不写设计通过，只等待测试一次性采集包后按本节接收/退回。

#### 12.7.5 `PR-UX-FULL-PROJECT-PAGES-VISUAL-001` 全量页面设计规格扩展

执行边界：本节只扩展 UI/UX 全项目页面设计规格、优先级、降权策略、退回码、证据需求、前端实施顺序和测试接收矩阵骨架；不修改业务源码，不修改 PM 总台账，不修改测试、UGC、前端计划，不新增设计资产。当前状态为 `blocked / 全量页面设计规格扩展中 / 待前端实现与截图`，不得写设计通过。

全量 Design Read：这是“聚会记录师”从旧酒桌游戏工具集合迁移为聚会记录、拍照、相册、分享产品的全项目 UI/UX 规格扩展。第一版视觉继续沿用 `Clean Quick Recorder`，旧“酒桌判官/判官/酒局/欠酒/惩罚/裁判”只允许作为历史兼容或二级功能，不得出现在默认主路径。

SKILL 选择：

| SKILL | 选择依据 | 使用边界 | 本轮是否生图 |
| --- | --- | --- | --- |
| `web-design-guidelines` | 全量页面需要统一安全区、触控 CTA、图片尺寸、空态/loading/error、长文本、表单、焦点、可访问状态和英文错误收敛；本轮已拉取最新规则源 `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md` | 只转化为页面规格、证据需求和退回码，不做源码通过判定 | 不生图 |
| `design-taste-frontend` | 用于全项目反模板、旧样式框清理、厚重单列卡、长列表堆叠、CTA 层级和旧功能降权审计 | 该 SKILL 非移动端生图工具，本轮只用于结构/审美规则 | 不生图 |
| `imagegen-frontend-mobile` | 仅当后续某个 P1/P2/P3 页面缺少可描述目标规格、前端无法按文字复刻、或 PM 明确要求逐屏目标图时触发 | 生成单屏或小批量移动端目标图，不把设计图当实现截图 | 本轮不触发 |
| `imagegen` | 仅当需要独立空态、贴纸、背景、按钮状态、分享底图等切图资产时触发 | 只做独立可用素材，不整板入小程序包 | 本轮不触发 |

全量页面矩阵：

| 优先级 | 页面 | 设计目标 | 旧功能降权策略 | 证据需求 |
| --- | --- | --- | --- | --- |
| P0 | `index` | 首页只承载创建聚会、加入口令/扫码、继续记录、最近相册 | 不出现旧品牌 hero、旧玩法大卡、工具箱主入口；工具/玩法下沉 | 375/390/414 首页截图；空/有历史两态；三步录屏入口 |
| P0 | `create-session` | 三步创建第一步，默认生成房间和邀请方式 | 玩法、规则、模板不得成为必选；主题卡完整可读 | 主题卡 375/390/414；长文案；创建按钮安全区 |
| P0 | `invite-group` | 邀请/二维码页，主动作是拍第一张和继续邀请 | 旧组局玩法、等待玩家人数不得阻断拍照 | 二维码加载/失败；双按钮；访客扫码链路 |
| P0 | `moment-editor` | 拍照/上传、说明、权限状态和保存照片 | 无图不得强引导保存；贴纸不裁切；失败可重试 | 空态、有图、上传中、失败、权限拒绝截图 |
| P0 | `live-record` | 当前聚会记录/相册主视图，支持继续拍照和查看回忆 | 不展示旧“酒桌判官”主视觉和快速开一局 | 记录/相册/分享 Tab；继续拍照；返回主路径录屏 |
| P0 | `me` | 我的记录、我的相册、继续记录、轻量资料入口 | 会员、统计、工具降为二级或轻量行 | 未登录/普通/重度用户；素材加载失败态 |
| P0 | `wine-history` | 历史相册和聚会记录列表 | 旧酒局历史命名降级为历史兼容，不作主标题 | 未登录、空态、1/5/20 条、401/loading 控制台 |
| P0 | `share-poster` | 分享海报生成、预览、保存和状态 | 不泄露私密/待补图/未授权内容 | pending/ready/failed/expired；PNG 原图；过滤清单 |
| P0 | `share-preview` | 访客可理解的分享预览和进入相册路径 | 不出现内部管理/待审核细节 | 访客视角、二维码/口令、授权失败、保存失败 |
| P0 | `session-brief` | 聚会简报、时间线、补图和分享任务 | 清理“酒局时间线简报”等旧文案 | loading、空 timeline、待补图、可分享、不可推举 |
| P0 | `rankings` | 二级回忆榜单，展示推荐照片和状态 | 不阻断记录主路径，不恢复积分游戏主心智 | 空态中文、列表、推举、积分不足、退款摘要 |
| P1 | `add-players` | 邀请成员、二维码、复制/分享入口 | 参与人数不阻断拍第一张 | 双按钮安全区、长文案、二维码失败 |
| P1 | `waiting-room` | 聚会准备页，弱化等待，突出拍照/邀请进度 | 不让等待室成为创建后必经阻断 | 空/有人/满员/网络失败截图 |
| P1 | `invalid-state` | 过期、无效口令、无权限、网络失败统一兜底 | 不显示技术错误和英文直显 | 各错误码、返回首页、重新扫码 |
| P1 | `restart-state` | 重新开始/恢复记录状态说明 | 不用“再开一局”强化旧游戏心智 | 恢复、重开、失败、确认弹窗 |
| P1 | `settings` | 聚会和账号设置轻量化 | 高级玩法、商业化入口降为二级 | 设置项 6 项以上折叠/分组；保存失败 |
| P1 | `invite-friends` | 邀请好友、复制链接、分享卡片 | 不以拉人凑局作为拍照前置 | 分享成功/失败、未授权、访客视角 |
| P1 | `friend-hub` | 好友回忆和常用伙伴管理 | 社交关系不阻断记录主路径 | 空态、有好友、搜索、移除确认 |
| P1 | `favorites` | 收藏/喜欢的照片或回忆 | 不演变为积分排名主入口 | 空态、列表、取消收藏、分享 |
| P1 | `usage-history` | 使用记录、积分/分享/生成历史聚合 | 商业化和积分流水降为查询页 | 过滤、分页、空态、长列表 |
| P2 | `tools` | 二级工具库，按分类/搜索进入 | 工具不得回到首页首屏主路径 | 搜索、分类、空态、超过 5 项折叠 |
| P2 | `tool-detail` | 单个工具说明和执行页 | 工具页不复用聚会主路径 CTA | 输入、结果、错误、复制/分享 |
| P2 | `session-rules` | 高级聚会规则/历史玩法兼容 | 规则不阻断创建和拍照 | 高级入口、保存失败、默认关闭 |
| P2 | `question-bank` | 历史题库/娱乐内容二级页 | 不出现在默认主路径，需 UGC 风控口径 | 分类、空态、敏感内容拦截 |
| P2 | `judge` | 历史判官功能兼容页 | 标记为历史/娱乐功能，不作产品主心智 | 入口降权截图、退出回主路径 |
| P2 | `judge-wheel` | 历史转盘/随机玩法 | 不出现在首页/创建主路径 | 动画降级、结果、返回记录 |
| P2 | `table-mode` | 旧桌面模式兼容 | 不作为记录页默认首屏；酒局心智降级 | 入口来源、退出、上传收尾照 |
| P2 | `result-report` | 旧结果/报告页或聚会回顾报告 | 旧惩罚/裁判文案改为回忆/记录 | 报告生成、分享、失败 |
| P2 | `wine-points` | 积分/点数说明和流水 | 不以欠酒/惩罚命名；仅二级账户能力 | 流水、退款、积分不足、空态 |
| P2 | `member-center` | 会员权益，服务相册/分享增强 | 不阻断拍照/分享基础路径 | 权益、未开通、支付失败、恢复购买 |
| P2 | `premium-templates` | 高级模板二级页 | 不在创建页强制选择 | 免费/付费、锁定、预览、购买失败 |
| P2 | `coupon-center` | 优惠券中心 | 商业化入口只在我的二级 | 空态、过期、可用、使用失败 |
| P2 | `merchant-partners` | 商户合作/权益页 | 不干扰用户记录主路径 | 列表、详情、外链/咨询 |
| P2 | `compliance-guide` | 合规说明和内容规则 | 作为说明页，不抢主路径 | 规则阅读、链接、长文本 |
| P2 | `flow-overview` | 流程说明/功能导览 | 不代替真实第一屏体验 | 首次引导、跳过、返回 |
| P2 | `logs` | 日志/诊断/历史记录 | 面向调试或高级用户，不暴露给普通主路径 | 空态、长列表、复制日志 |
| P3 | `join-claim` | 加入口令后的身份认领 | 作为加入辅助，不抢 P0 资源 | 仅做 IA 和命名一致性；后续补登录/头像状态 |
| P3 | `profile-edit` | 头像、昵称、隐私偏好 | 我的页二级入口 | 仅做表单 IA、保存失败、头像上传口径 |
| P3 | `share-helper` | 分享辅助/说明 | 不进入主路径 | 仅做文案、权限和失败态审计 |
| P3 | `admin-console` | 后台控制台入口 | 后台与小程序用户路径分离 | 仅 IA/可用性/命名一致性审计 |
| P3 | `admin-home-config` | 后台首页配置 | 不影响用户主路径设计优先级 | 仅配置项清晰度、保存状态 |
| P3 | `admin-points-config` | 后台积分配置 | 不把积分心智推回小程序主路径 | 仅字段命名、危险操作确认 |
| P3 | `admin-template-config` | 后台模板配置 | 模板仍为辅助，不阻断创建 | 仅模板命名、预览、上下架状态 |
| P3 | 后端后台静态页 | 后台运营/配置页面 | 不抢小程序开发资源 | 仅 IA、命名、可用性、权限状态审计 |

统一降权策略：

1. P0 只服务三步创建、拍第一张、记录/相册、分享和回忆；任何旧玩法、积分、会员、工具都不能阻断。
2. P1 是关键状态和入口，必须保证错误、等待、邀请、设置、好友、收藏、历史查询不制造死路。
3. P2 是旧玩法、商业化和工具，默认二级入口；可保留历史兼容，但不得使用旧品牌主标题或大视觉。
4. P3 只做 IA、命名和可用性审计，除非 PM 单独派发，不占用小程序主路径实现资源。
5. 所有用户可见主文案统一“聚会记录师 / 聚会 / 记录 / 相册 / 分享 / 回忆”；旧“酒桌判官/判官/酒局/欠酒/惩罚/裁判”只能在历史说明或兼容入口中出现，并需显著降权。

全量退回码：

| 退回码 | 触发条件 | 适用层级 | 责任人 |
| --- | --- | --- | --- |
| `PR-FE-FULL-P0-OLD-BRAND` | P0/P1 主路径出现旧品牌主标题、旧酒局主视觉或旧玩法大卡 | P0/P1 | 前端负责人 |
| `PR-FE-FULL-P0-FLOW-BLOCK` | P0 三步创建拍照被模板、规则、等待、会员、积分、工具、榜单阻断 | P0 | 前端负责人；接口阻断退 API |
| `PR-FE-FULL-P0-SAFE-BOUNDARY` | 375/390/414 出现 CTA、Tab、二维码、卡片、贴纸、横滑项越界、遮挡、半露、裁字 | 全层级 | 前端负责人 |
| `PR-FE-FULL-P0-ENGLISH-ERROR` | 用户可见英文错误、`not found`、接口原文或无下一步错误态 | 全层级 | 前端负责人；错误码退 API |
| `PR-FE-FULL-P1-LIST-DENSITY` | 超过 5 项仍长列表堆叠，无精选、折叠、横滑、搜索或二级页 | 全层级 | 前端负责人 |
| `PR-FE-FULL-P1-HEAVY-CARD` | 单列厚卡占据首屏主要空间，挤压主动作、照片或分享内容 | 全层级 | 前端负责人 |
| `PR-FE-FULL-P1-ASSET-SEMANTIC` | 相册/主题/贴纸/海报素材裁切、模糊、语义错误或复用工具图 | 全层级 | 前端负责人；素材问题退 UI/UX |
| `PR-FE-FULL-P1-STATE-MISSING` | loading、empty、failed、expired、权限拒绝、上传失败等状态缺失或不可恢复 | 全层级 | 前端负责人 |
| `PR-FE-FULL-P1-SHARE-RISK` | 分享预览/PNG/过滤清单不一致或泄露私密、未授权、待审核内容 | P0/P1 | 前端负责人和 UGC/风控负责人 |
| `PR-FE-FULL-P2-DOWNGRADE-FAIL` | P2 旧玩法/商业化/工具重新占据首页、创建、拍照、记录、相册主路径 | P2 | 前端负责人；口径退 PM |
| `PR-ADMIN-FULL-P3-IA-NAME` | P3 后台/未注册页命名、导航、权限或危险操作提示不清 | P3 | 后台负责人 |

前端实施顺序建议：

1. P0 主路径先收口：`index`、`create-session`、`invite-group`、`moment-editor`、`live-record`、`me`、`wine-history`、`share-poster/share-preview`、`session-brief`、`rankings`。
2. P1 状态入口第二批：`add-players`、`waiting-room`、`invalid-state`、`restart-state`、`settings`、`invite-friends`、`friend-hub`、`favorites`、`usage-history`。
3. P2 统一降权第三批：旧玩法、工具、商业化页只做二级入口、状态和命名统一，不回主路径。
4. P3 最后只做 IA/命名/权限/危险操作可用性审计，不抢主路径开发资源。

测试接收矩阵骨架：

| 测试包 | 覆盖页面 | 必须证据 | UI/UX 判定 |
| --- | --- | --- | --- |
| P0 主路径包 | P0 10 组页面 | 375/390/414 截图、三步录屏、创建者/参与者/访客、PNG 原图、接口摘要 | P0 旧壳/越界/流程阻断任一命中直接退回 |
| P1 状态入口包 | P1 9 页 | 空态、loading、失败、权限拒绝、长列表、设置保存失败、邀请失败 | 状态完整、错误可恢复、列表不过重 |
| P2 降权包 | P2 16 页 | 入口来源、二级路径截图、旧功能命名、商业化失败态、工具长列表 | 旧玩法/商业化/工具不回主路径 |
| P3 IA 包 | P3 未注册/后台相关 | IA 截图、导航、权限、危险操作确认、保存失败 | 只做可用性和命名一致性，不影响小程序准出 |
| 全局多宽度包 | 全层级抽样 | 375/390/414、长文案、底部安全区、横滑首尾、Tab | 无越界、遮挡、半露、裁字 |
| 全局文案包 | 全层级抽样 | 页面标题、按钮、错误、空态、分享文案 | 统一“聚会记录师”心智，无英文直显 |

当前结论：`PR-UX-FULL-PROJECT-PAGES-VISUAL-001` 已完成全量页面规格扩展，但仍缺全量页面实现截图、录屏、角色视角、接口摘要和 UGC/风控证据。UI/UX 保持 `blocked / 全量页面设计规格扩展中 / 待前端实现与截图`，不写设计通过。

#### 12.7.6 PM 通知：线上榜单 404 后的 UI/UX 状态保持

PM 通知服务器权限阻塞已处理，但线上 `rankings/today` 仍 404，最终大版本尚未准出。UI/UX 本轮只记录状态，不修改源码、不修改 PM 总台账、不替前端、测试、API 或 UGC 写通过。

SKILL 选择：

| SKILL | 选择依据 | 使用边界 |
| --- | --- | --- |
| `web-design-guidelines` | 本轮涉及线上榜单错误态、英文错误直显、状态恢复、控制台证据和最终接收门禁；已重新拉取最新规则源 | 只用于维持 evidence gate 和错误态接收口径，不做设计通过 |
| `design-taste-frontend` | 沿用旧壳零容忍和全量页面视觉一致性规则 | 本轮不做新视觉方案、不生图 |

当前 UI/UX 状态保持：`blocked / 待最终证据接收`。缺以下证据前不得写设计通过：

- 发布后 `rankings` / `rankings/today` 修复截图与控制台证据。
- iPhone 12 / 390 主路径截图和三步连续录屏。
- 375/414 多宽度补测。
- 创建者、参与者、未登录/失效登录、访客等角色视角。
- `rankings` 空态/列表/推举/积分不足/重复推举/退款状态截图与 API 摘要。
- 分享 PNG 原图、过滤节点清单和 UGC/风控确认。

退回口径继续沿用 12.7.4、12.7.5：旧品牌主标题、旧玩法大卡、厚重单列、长列表过重、元素越界、安全区遮挡、英文错误直显、榜单 404 或状态不可恢复，任一命中均退回对应责任方。

#### 12.7.7 PM 发布通知：榜单接口阻塞解除但 UI/UX 仍待证据

PM 发布通知：线上 `rankings/today` 路由已发布，状态已从 404 变为 200。本变化只解除接口阻塞，不等于 UI/UX 接收通过；UI/UX 不改源码、不改 PM 总台账、不替前端、测试、API 或 UGC 写通过。

SKILL 选择：

| SKILL | 选择依据 | 使用边界 |
| --- | --- | --- |
| `web-design-guidelines` | 本轮仍是最终 evidence gate，需等待真机截图、录屏、控制台、错误态和状态恢复证据；已重新拉取最新规则源，继续沿用安全区、状态文案、异步状态、图片和交互可用性规则 | 只记录接收前置条件，不做通过判定 |
| `design-taste-frontend` | 继续保持旧壳零容忍、旧玩法降权、厚卡/长列表/模板感退回口径 | 本轮不新增视觉方案、不生图 |

当前 UI/UX 状态保持：`blocked / 待最终证据接收`。即使 `rankings/today` 已 200，仍必须等待以下证据后才可按 12.7.4、12.7.5 做接收/退回：

- 发布后 `rankings` 页面截图，覆盖空态、列表态、分类切换、推举确认、积分不足、重复推举、移出榜单退款提示。
- `rankings/today` 控制台和 API 摘要，证明无英文错误直显、无不可恢复状态、积分/退款状态一致。
- iPhone 12 / 390 主路径截图和三步连续录屏。
- 375/414 多宽度补测。
- 创建者、参与者、未登录/失效登录、访客等角色视角。
- 分享 PNG 原图、过滤节点清单和 UGC/风控确认。

#### 12.7.8 `PR-UX-FLOW-GUIDANCE-001` / `PR-UX-ALBUM-LENGTH-GUIDANCE-001` 流程引导与相册长度准出标准

执行边界：本节只补 UI/UX 准出标准和退回码，用于发布后流程体验阻塞的接收/退回；不修改业务源码，不修改 PM 总台账，不替前端、测试、API 或 UGC 写通过。当前状态继续保持 `blocked / 待最终证据接收`。

SKILL 选择：

| SKILL | 选择依据 | 使用边界 |
| --- | --- | --- |
| `web-design-guidelines` | 本轮重点是按钮状态、流程引导、空/错/加载态、安全区、长文本、列表长度、底部留白和 375/390/414 响应式准出；已拉取最新规则源，采用其安全区、异步状态、内容处理、触控和错误文案要求 | 只制定准出标准和退回码，不做源码通过 |
| `design-taste-frontend` | 用于判断流程是否模板化、按钮层级是否混乱、相册/历史页是否厚重单列或长列表过重 | 只做视觉密度和旧壳零容忍口径，不生图 |

按钮状态准出标准：

| 项 | 375 准出 | 390 准出 | 414 准出 | 退回码 |
| --- | --- | --- | --- | --- |
| 主 CTA | 高 52px，左右安全内边距不小于 16px，文案一行可读，不被底部安全区遮挡 | 高 52px，左右安全内边距不小于 24px，圆角 14px，主次按钮间距清晰 | 高 52px，左右安全内边距不小于 24px，宽度不盲目拉满导致视觉笨重 | `PR-FE-FLOW-P0-CTA-SAFE` |
| 双按钮 | 使用等宽 grid 或明确主次；长文案不得换行裁字 | 主按钮视觉权重高于次按钮，点击区不重叠 | 次按钮不抢主 CTA；左右边距一致 | `PR-FE-FLOW-P1-CTA-HIERARCHY` |
| 禁用态 | 无图/无权限/未满足条件时禁用或改为具体动作，不能假可点 | 禁用态对比度仍可读，原因就近说明 | 禁用态与 loading 区分清楚 | `PR-FE-FLOW-P0-CTA-STATE` |
| 加载态 | 点击后 300ms 内给 loading 或按钮内 spinner，防重复点击 | loading 文案用“生成中…”“保存中…”等具体动作 | loading 不遮挡返回、取消、重试 | `PR-FE-FLOW-P1-LOADING-FEEDBACK` |
| 失败态按钮 | 失败后保留“重试/返回相册/重新登录”等下一步 | 错误文案在按钮附近，不能只 toast 后消失 | 失败态不清空已选照片或输入内容 | `PR-FE-FLOW-P1-ERROR-ACTION` |

视觉流程引导准出标准：

| 流程 | 准出标准 | 退回码 |
| --- | --- | --- |
| 首页 -> 创建聚会 -> 邀请/二维码 -> 拍第一张 | 三步连续录屏中必须能完成创建并进入拍照；每步只出现一个主动作；不得被模板、玩法、等待、会员、榜单阻断 | `PR-FE-FLOW-P0-THREE-STEP-BLOCK` |
| 继续记录 -> 拍照 -> 相册/简报 | “继续记录”需明确回到当前聚会；拍照成功后能进入相册/简报，不出现重复 CTA 或死路 | `PR-FE-FLOW-P1-CONTINUE-DEADEND` |
| 分享预览 -> 保存/失败重试 | 分享状态 pending/processing/ready/failed/expired 均有下一步；PNG 原图与真机预览一致 | `PR-FE-FLOW-P1-SHARE-STATE` |
| 榜单入口 -> 推荐/禁用/退款 | 榜单是二级回忆入口，不阻断记录；禁用原因、积分不足、重复推举、退款提示必须清晰 | `PR-FE-FLOW-P1-RANKING-GUIDE` |
| 异常/过期/未登录 | 错误态给“重新扫码/返回首页/重新登录/重试”；不能直显英文或接口原文 | `PR-FE-FLOW-P0-ERROR-GUIDE` |

空/错/加载态准出标准：

| 状态 | 必须表现 | 退回码 |
| --- | --- | --- |
| 空相册/空历史 | 有轻量插画或稳定占位；说明如何拍第一张/继续记录；不得复用工具图标语义 | `PR-FE-STATE-P1-EMPTY-SEMANTIC` |
| 空榜单 | 中文可行动文案；不得显示 `not found`；说明推荐成功后排序 | `PR-FE-STATE-P0-ENGLISH-EMPTY` |
| loading | 骨架屏或局部 loading 与最终布局尺寸一致，避免跳动；loading 成对退出 | `PR-FE-STATE-P1-LOADING-PAIR` |
| 失败 | 明确原因和下一步；保留已选图片/输入/当前路径 | `PR-FE-STATE-P1-ERROR-RECOVERY` |
| 权限拒绝 | 给授权入口或替代路径，不阻断返回相册/首页 | `PR-FE-STATE-P1-PERMISSION` |
| 上传失败 | 能重试、换图、返回，不清空说明文案 | `PR-FE-STATE-P1-UPLOAD-RETRY` |

相册/历史页页面长度与底部留白准出标准：

| 场景 | 375 准出 | 390 准出 | 414 准出 | 退回码 |
| --- | --- | --- | --- | --- |
| 短列表 0-3 条 | 首屏显示页面标题、主动作、全部条目或明确空态；底部留白不超过一屏的 35% | 首屏不出现无意义大空白；CTA 可见且不遮挡内容 | 可适当增加呼吸感，但不得显得页面未加载 | `PR-FE-ALBUM-P1-SHORT-WHITESPACE` |
| 中列表 4-10 条 | 每条高度收敛，最多 3 张缩略图；首屏至少看到 2 条内容或 1 条内容 + 主 CTA | 有分页/更多/搜索入口；列表不被底部 CTA 遮挡 | 横向缩略图和文字区比例稳定 | `PR-FE-ALBUM-P1-LIST-DENSITY` |
| 长列表 10 条以上 | 必须分页、分组折叠、搜索、按日期分段或虚拟列表；不得无限单列厚卡 | 滚动性能稳定；底部加载态不遮挡底部导航 | 继续加载/到底提示中文可读 | `PR-FE-ALBUM-P1-LONG-LIST` |
| 历史相册卡 | 卡片高度不超过首屏 32%；图片区稳定比例，文本最多 2 行 | 不使用大封面 + 多行统计堆叠压住主动作 | 操作按钮不挤压标题和状态 | `PR-FE-ALBUM-P1-HEAVY-CARD` |
| 底部 CTA/Tab | 内容底部 padding 至少覆盖 CTA 高度 + 安全区；最后一条不被遮挡 | Tab、CTA、加载更多三者不重叠 | iPhone 安全区下仍能完整点击 | `PR-FE-ALBUM-P0-BOTTOM-SAFE` |
| 底部空白 | 到底后允许 24-48px 呼吸留白；不得出现大块空白误导为未加载 | 到底提示或“继续拍照”可选，但不重复主 CTA | 分享/相册底部不出现割裂白屏 | `PR-FE-ALBUM-P1-BOTTOM-WHITESPACE` |

短列表/长列表通用规则：

- 超过 5 项必须采用精选 3 项 + 更多、分组折叠、横滑、搜索、分页或二级页。
- 超过 50 项必须考虑分页、虚拟列表或按日期分组，不能一次性渲染厚卡长列表。
- 列表条目必须有稳定高度；图片显式宽高或固定比例；文本长内容使用截断、换行或 `break-words` 策略。
- 用户生成标题、昵称、说明文案必须覆盖短、中、超长样本；不得挤压按钮、Tab 或缩略图。
- 相册/历史页不得用工具图、二维码图、房贷图等非聚会语义素材作为最近相册缩略图。

测试证据要求：

| 证据 | 必须覆盖 |
| --- | --- |
| 375/390/414 截图 | 首页、创建、邀请、拍照空/有图、记录/相册、历史相册、简报、分享、榜单、我的 |
| 录屏 | 三步创建拍第一张；继续记录到相册；分享失败重试；榜单状态切换 |
| 列表样本 | 空列表、1 条、3 条、5 条、10 条、50 条以上或分页模拟 |
| 状态样本 | loading、empty、failed、expired、权限拒绝、上传失败、保存失败、网络失败 |
| 控制台/API | 401/loading、上传失败、分享生成、榜单 today、分页/搜索接口 |

当前结论：`PR-UX-FLOW-GUIDANCE-001`、`PR-UX-ALBUM-LENGTH-GUIDANCE-001` 已补流程引导、按钮状态、状态表达、相册/历史长度、底部留白和 375/390/414 准出标准。仍缺发布后最终截图、录屏、多宽度、角色视角、控制台和接口证据，UI/UX 不写设计通过。

#### 12.7.9 PM 通知：流程修复批次回收后的 UI/UX 待复核状态

PM 通知发布后流程修复批次已回收，前端已完成 `14.18`，接口/后端样本已到位。本节仅登记 UI/UX 待复核状态；不修改业务源码，不修改 PM 总台账，不替前端、测试、API 或 UGC 写通过。

SKILL 选择：

| SKILL | 选择依据 | 使用边界 |
| --- | --- | --- |
| `web-design-guidelines` | 本轮等待真机截图、录屏、控制台和接口摘要，后续需按按钮状态、空/错/加载态、安全区、长列表、底部留白、异步状态、图片尺寸和可恢复错误态复核；已拉取最新规则源 | 只作为 12.7.8 复核口径，不做通过判定 |
| `design-taste-frontend` | 继续用于流程是否模板化、主次 CTA 是否混乱、相册/历史是否厚重单列、旧壳是否回流的视觉退回判断 | 本轮不新增视觉方案，不生图 |

当前 UI/UX 状态保持：`blocked / 待测试证据接收`。虽然后端样本与前端修复已回收，但缺以下测试证据前不得写设计通过：

- `PR-QA-FLOW-RETEST-004`：真机三步录屏、按钮默认/按下/禁用/loading/失败态截图、流程引导截图、控制台摘要。
- `PR-QA-ALBUM-TAIL-RETEST-001`：相册/历史页 0/1/3/5/10/50 条样本，底部留白、底部 CTA/Tab、短列表/长列表、分页/加载更多截图。
- `PR-QA-RANKINGS-ONLINE-SMOKE-002`：发布后 `rankings` / `rankings/today` 真机截图、空态/列表/推举/积分不足/重复推举/退款状态、控制台和 API 摘要。
- 375/390/414 多宽度对照，至少覆盖首页、创建、邀请、拍照空/有图、记录/相册、历史相册、简报、分享、榜单、我的。
- 创建者、参与者、未登录/失效登录、访客等角色视角。

后续 UI/UX 收到证据后按 12.7.8 的 375/390/414、流程引导、按钮状态、空/错/加载态、相册长度、底部留白、短列表/长列表规则和退回码逐项复核；缺任一证据继续 `blocked / 待补证据`。

#### 12.7.10 `PR-UX-HOME-LOGIN-ENTRY-001` 首页登录入口与未登录态 P0 规格

执行边界：本节只补首页未登录态登录入口、主 CTA 后续动作、状态和退回码；不修改业务源码，不修改 PM 总台账，不修改测试、UGC、前端计划。缺实现截图前只能记录 `blocked / 待实现截图复核`，不得写设计通过。

背景：用户确认首页没有登录入口。PM 自动化取证显示未登录态点击首页 `创建聚会` 后仍停留首页，当前无可见登录入口，已构成三步创建路径 P0 阻断。

SKILL 选择：

| SKILL | 选择依据 | 使用边界 |
| --- | --- | --- |
| `web-design-guidelines` | 首页登录入口涉及主 CTA 后续动作、按钮可见性、登录中异步状态、失败态、错误下一步、可访问名称、触控与安全区；已拉取最新规则源 | 只制定入口规格、状态准出和截图接收标准，不做源码通过 |
| `design-taste-frontend` | 用于判断登录入口是否被藏成模板感小字、头像隐喻或低权重入口，以及未登录态是否破坏 Clean Quick Recorder 主路径 | 只做视觉层级和路径可用性退回口径，不生图 |

入口规格：

| 区域 | 规格 | 375/390/414 准出 |
| --- | --- | --- |
| 首页首屏主 CTA 下方 | 未登录时 `创建聚会` 点击后必须出现明确登录承接，不得静默停留首页；推荐主 CTA 文案保持 `创建聚会`，下方或弹层显示 `登录后创建聚会` / `微信授权登录` / `稍后再看` | 登录入口在首屏可见或点击主 CTA 后立即可见；无需滚动寻找；文案一行可读 |
| 首页右上/顶部辅助位 | 可放轻量 `登录` 文本按钮或头像占位 + `登录` 标签，但不能只显示不可识别头像/图标 | 图标按钮必须有可见文字或清晰 label；不能隐藏为弱灰小字 |
| 未登录提示卡 | 可在最近相册上方/主动作下方放轻提示：`登录后保存你的聚会记录`，主按钮 `登录并创建`，次按钮 `先浏览` | 不压住主 CTA，不形成厚重单列大卡；高度不超过首屏 18% |
| 点击创建后的承接 | 若未登录，必须打开登录弹层、底部 sheet 或内联登录卡，并给出下一步 | 不允许点击无反馈、不允许 toast 一闪后停留、不允许跳到空白页 |
| 与三步路径关系 | 未登录路径也必须有可执行下一步：1 首页点创建；2 登录/授权成功；3 自动继续创建聚会或回到创建页 | 登录成功后不得丢失原动作；失败后可重试或返回首页 |

状态规格：

| 状态 | UI/UX 要求 | 退回码 |
| --- | --- | --- |
| 登录前 | 首页首屏必须有可见登录入口，或点击 `创建聚会` 后有明确登录承接；入口不能是隐藏文字、不可见头像、需要滚动寻找 | `PR-FE-HOME-LOGIN-P0-NO-ENTRY` |
| 登录中 | 按钮进入 loading，文案如 `登录中…`；防重复点击；不遮挡返回/取消 | `PR-FE-HOME-LOGIN-P1-LOADING` |
| 登录失败 | 展示失败原因和下一步：`重新登录`、`返回首页`、`稍后再试`；不能只显示英文或接口原文 | `PR-FE-HOME-LOGIN-P0-ERROR-DEADEND` |
| 登录成功 | 自动继续原动作：进入创建聚会页或直接进入创建流程；不得只回到首页无提示 | `PR-FE-HOME-LOGIN-P0-SUCCESS-LOST-ACTION` |
| 授权拒绝 | 给替代路径或重试入口；说明登录后才能保存记录/创建聚会 | `PR-FE-HOME-LOGIN-P1-PERMISSION` |
| 已登录 | 首页可弱化登录入口为头像/我的，但主路径仍以创建/加入/继续记录为主 | `PR-FE-HOME-LOGIN-P1-LOGGED-IN-HIERARCHY` |

按钮层级：

- 未登录首页第一主按钮仍是 `创建聚会`，但点击后必须进入登录承接。
- 登录弹层/Sheet 内主按钮为 `微信授权登录` 或 `登录并创建`，次按钮为 `稍后再看` / `返回首页`。
- 不使用泛化文案 `继续` 作为登录主按钮；按钮文案必须说明动作。
- 登录入口不可放在 Tab 之外的不可点击角落，不可只用头像占位，不可低对比到难以识别。

截图接收标准：

| 证据 | 必须覆盖 |
| --- | --- |
| 375/390/414 首页未登录截图 | 首屏可见登录入口或点击创建后的登录承接；主 CTA、登录入口、底部 Tab 不越界 |
| 点击 `创建聚会` 录屏 | 未登录点击后出现登录弹层/Sheet/内联卡；不得静默停留首页 |
| 登录中截图 | loading 文案、禁重复点击、取消/返回可见 |
| 登录失败截图 | 中文错误、重试/返回下一步、控制台无英文直显 |
| 登录成功录屏 | 登录后自动继续原动作，进入创建聚会或创建流程 |
| 授权拒绝截图 | 有重试/返回/稍后再看，不阻断首页浏览 |
| 已登录首页截图 | 登录入口降级合理，不抢创建/加入/继续记录主路径 |

当前结论：`PR-UX-HOME-LOGIN-ENTRY-001` 为 P0 流程阻断。缺实现截图、点击录屏、登录状态截图、控制台和角色证据前，UI/UX 只能记录 `blocked / 待实现截图复核`，不得写设计通过。

##### 12.7.10.1 首页登录入口开发者工具初验回收

PM 回收通知：首页登录入口 P0 已完成开发者工具自动化初验。前端已修复，PM 自动化点击确认 `authPanelVisible=true`、`authRedirectUrl=/pages/create-session/index`，截图证据为 `docs/runtime/home-login-entry-after-primary-tap-9420.png`。本证据只说明开发者工具内主 CTA 点击后出现授权面板并记录回流目标，不等于 UI/UX 真机接收通过。

SKILL 选择：

| SKILL | 选择依据 | 使用边界 |
| --- | --- | --- |
| `web-design-guidelines` | 本轮仍需按按钮可见性、异步状态、错误下一步、可访问名称、触控和安全区规则等待真机证据；已拉取最新规则源 | 只记录证据门禁，不做通过判定 |
| `design-taste-frontend` | 继续约束登录入口不可隐藏、不可弱化为不可识别头像、不可破坏三步创建主路径 | 本轮不新增视觉方案、不生图 |

当前 UI/UX 状态保持：`blocked / 待实现截图复核`。仍缺以下最终接收证据：

- iPhone 12 真机点击 `创建聚会` 录屏，证明未登录态能看到登录承接且不是静默停留首页。
- 失效 token / 未登录 / 授权拒绝 / 登录失败截图与控制台摘要。
- 登录成功后回流到 `/pages/create-session/index` 或创建流程的连续录屏，证明原动作未丢失。
- 375/390/414 首页未登录、登录面板、登录中、失败、成功回流截图。
- 创建者、未登录用户、失效登录用户等角色视角。

#### 12.7.11 `PR-UX-FINAL-CAPTURE-ACCEPT-002` 最终大版本采集包接收清单

执行边界：本节只确认 UI/UX 最终采集包接收清单和证据依赖；不修改业务源码，不修改 PM 总台账，不修改测试、UGC 或前端计划。当前首页登录入口只有 DevTools 初证，最终大版本采集包未回收，UI/UX 不得写设计通过。

SKILL 选择：

| SKILL | 选择依据 | 使用边界 |
| --- | --- | --- |
| `web-design-guidelines` | 最终采集包需要覆盖安全区、按钮状态、异步状态、空/错/加载态、错误可恢复、长内容、列表长度、图片尺寸和触控可用性；本轮继续沿用最新规则源 | 只作为最终截图/录屏接收清单，不做通过判定 |
| `design-taste-frontend` | 用于最终检查旧壳零容忍、品牌一致性、CTA 层级、厚重单列、长列表过重、模板感和旧功能回流 | 只做视觉一致性与退回口径，不生图 |

最终采集包必须覆盖：

| 接收项 | 必须证据 | 退回触发 |
| --- | --- | --- |
| 旧壳零容忍 | 首页、创建、邀请、拍照、记录/相册、简报、分享、榜单、我的、历史相册截图 | 出现旧品牌主标题、旧玩法大卡、酒局/判官/欠酒/惩罚/裁判主心智 |
| “聚会记录师”品牌 | 全主路径标题、按钮、空态、分享文案、错误文案截图 | 主路径未统一为聚会/记录/相册/分享/回忆语义 |
| 三步创建拍照 | iPhone 12 真机连续录屏：首页创建 -> 登录/创建页 -> 邀请/二维码 -> 拍第一张 | 被登录、模板、规则、等待、会员、榜单、旧玩法阻断，或登录成功后丢失原动作 |
| 首页登录入口 | 未登录首页、点击创建后的登录面板、登录中、登录失败、授权拒绝、登录成功回流截图/录屏 | 登录入口不可见、隐藏为弱文字/头像、点击主 CTA 无下一步、失败无重试、成功不回流 |
| 元素边界 | 375/390/414 下 CTA、Tab、二维码、贴纸、横滑卡、主题卡、登录面板、底部安全区截图 | 越界、遮挡、半露、裁字、底部按钮不可点、安全区压住内容 |
| 列表厚度 | 相册/历史 0/1/3/5/10/50 条样本截图；榜单空态/列表；我的页待处理相册 | 超过 5 项无收敛；厚重单列卡占据首屏；底部大空白误导未加载 |
| CTA 层级 | 首页、创建、邀请、拍照、记录/相册、登录面板、分享、榜单按钮状态截图 | 多个主 CTA 抢层级、泛化“继续”、禁用/加载/失败态不可区分 |
| 375/390/414 | 同角色、同样本、同状态多宽度截图 | 只给 390 或截图状态不一致时不得最终接收 |
| 多角色/多状态 | 创建者、参与者、访客、未登录、失效 token；空/加载/失败/权限拒绝/上传失败/分享失败 | 任一关键角色或关键状态缺失继续 blocked |
| 控制台/API | 登录回流、401/loading、上传、分享生成、`rankings/today`、榜单积分/退款、分页/搜索接口摘要 | 英文错误直显、接口状态与 UI 不一致、控制台连续错误未解释 |

最终接收顺序：

1. 先核 P0：旧壳零容忍、三步创建拍照、首页登录入口、元素边界、安全区和英文错误直显。
2. P0 未命中后核 P1：按钮状态、CTA 层级、相册/历史长度、列表厚度、空/错/加载态。
3. 最后核证据完整性：375/390/414、多角色、多状态、控制台/API、分享 PNG 原图和 UGC/风控清单。
4. 缺最终采集包任一核心证据时，UI/UX 只记录 `blocked / 待最终采集包复核`，不进入通过判定。

当前结论：`PR-UX-FINAL-CAPTURE-ACCEPT-002` 接收清单已登记。等待测试最终采集包回来后，UI/UX 再按 12.7.4、12.7.8、12.7.10 和本节退回码接收/退回。

#### 12.7.12 `PR-PM-ONLINE-TEST-SERVER-AUTH-001` 线上测试服务器授权后的 UI/UX 证据边界

PM 全员通知：用户已授权线上服务器除公司官网项目外，可作为酒桌判官/聚会记录师测试服务器使用。UI/UX 后续可基于 `api.pomer.cn` 真实线上测试页面截图/录屏做接收；仍不得触碰 `pomer.cn` 公司官网项目或无关服务。该授权只解除线上取证环境边界，不等于 UI/UX 设计通过。

SKILL 选择：

| SKILL | 选择依据 | 使用边界 | 证据缺口 |
| --- | --- | --- | --- |
| `web-design-guidelines` | 已按最新规则源核对安全区、焦点/按钮状态、异步反馈、空/错/加载态、图片尺寸、长内容、触控和状态可恢复要求；线上截图/录屏需要继续按这些规则接收 | 只用于定义线上证据接收门槛和退回触发，不凭授权或前端自测判通过 | 缺最终真机/开发者工具截图、连续录屏、控制台/API 摘要和同状态多宽度对照 |
| `design-taste-frontend` | 用于继续执行旧壳零容忍、品牌一致性、厚重单列、长列表过重、CTA 层级、模板感和旧功能主路径回流审计 | 只做视觉一致性与退回口径，不新增生图，不扩大设计资产范围 | 缺线上真实页面截图证明旧壳已清零、主路径已统一为“聚会记录师” |

线上取证可接受范围：

| 范围 | UI/UX 接收口径 |
| --- | --- |
| 可用目标 | `api.pomer.cn` 对应的聚会记录师/酒桌判官后端、API、后台和测试页面证据，可作为最终采集包的一部分 |
| 禁止目标 | `pomer.cn` 公司官网项目、官网 PM2/Nginx/server block、官网目录和无关服务；UI/UX 不要求、不读取、不验收这些范围的设计证据 |
| 证据字段 | 每张截图/每段录屏必须标明页面路径、环境、时间或构建批次、设备/视口、微信或 DevTools 版本、登录角色、样本 ID、关键状态、控制台/API 摘要 |
| 通过门槛 | 必须同时具备真机或开发者工具截图、三步连续录屏、控制台/API 摘要、375/390/414 多宽度、角色/状态对照后，UI/UX 才能进入接收/退回判断 |
| 不可作为通过证据 | 服务器授权、前端自测文字回报、PM 基础复核、单张截图、缺角色/样本/视口的录屏、无控制台/API 摘要的线上访问成功 |

当前 UI/UX 状态：`blocked / 待线上最终采集包复核`。后续若测试基于 `api.pomer.cn` 回收真实线上截图/录屏，UI/UX 仍按 12.7.4、12.7.8、12.7.10、12.7.11 的退回码核查；旧品牌主标题、旧玩法大卡、厚重单列、长列表过重、元素越界、安全区遮挡、英文错误直显、登录入口不可见、三步路径阻断任一命中即退回前端或对应责任方。

#### 12.7.13 `PR-UX-ONLINE-EVIDENCE-ACCEPT-003` 线上最终采集接收/退回矩阵

执行边界：本节只准备 UI/UX 基于真实 `api.pomer.cn` 测试样本的线上最终截图/录屏复核口径。当前未收到最终实现截图、录屏、控制台和 API 摘要，不能写设计通过；不得修改业务源码、测试、UGC 或 PM 总台账。

SKILL 选择：

| SKILL | 选择依据 | 使用边界 | 证据缺口 |
| --- | --- | --- | --- |
| `web-design-guidelines` | 线上最终采集需要按最新规则核查可点击控件、按钮状态、异步反馈、空/错/加载态、图片尺寸、长文本、滚动、安全区和触控可用性 | 用于接收/退回矩阵，不直接判通过；截图/录屏缺字段时继续 blocked | 缺真实线上 PNG/JPG 原图、连续录屏、控制台/API 摘要、设备/视口和样本 ID |
| `design-taste-frontend` | 聚会记录师改版属于旧产品壳层重构，需要继续执行旧壳零容忍、品牌一致性、CTA 层级、长列表与厚卡退回标准 | 只做视觉一致性与体验退回，不新增设计资产，不扩大生图范围 | 缺线上实现证明新版 Clean Quick Recorder 基线已落地 |

接收前置条件：

| 前置证据 | 最低要求 | 缺失处理 |
| --- | --- | --- |
| 线上来源 | 证据必须来自 `api.pomer.cn` 对应测试样本，注明页面路径、批次时间、账号/角色、样本 ID | 标记 `blocked / 证据来源不完整` |
| 设备与视口 | 首轮至少 iPhone 12 / 390；最终必须补 375/390/414 同状态截图 | 只给单宽度时只能做 P0 初判，不能最终接收 |
| 录屏 | 首页登录/创建聚会/邀请或创建承接/拍第一张连续路径，能看到点击和页面流转 | 缺录屏时三步路径继续 blocked |
| 控制台/API | 登录、创建、上传、分享、相册、简报、榜单、401/loading/error 的控制台和 API 摘要 | UI 状态与接口不一致或无摘要时退回对应责任方 |
| 原图 | 分享 PNG 原图、截图原图、录屏文件，不接受压缩后看不清的小图总览 | 标记 `blocked / 原图不可读` |

线上接收/退回矩阵：

| 核查项 | 必须覆盖页面/状态 | 接收标准 | 退回码 |
| --- | --- | --- | --- |
| 旧壳零容忍 | `index`、`create-session`、`invite-group`、`moment-editor/live-record`、`wine-history`、`session-brief`、`share-poster/share-preview`、`rankings`、`me` | 默认主路径只呈现“聚会记录师”心智，旧玩法只能在二级/历史兼容入口弱化 | `PR-FE-ONLINE-P0-OLD-SHELL` |
| 三步创建拍照 | 未登录、登录中、登录成功、创建、拍第一张 | 从首页主 CTA 到拍第一张不超过三步；登录不丢失原动作；模板/规则/会员/旧玩法不阻断 | `PR-FE-ONLINE-P0-THREE-STEP-BLOCK` |
| 首页登录入口 | 未登录首页、点击创建、登录面板、失败、成功回流、失效 token | 登录入口可见且主 CTA 点击后有明确下一步；失败可重试，成功回流创建流程 | `PR-FE-ONLINE-P0-LOGIN-ENTRY` |
| 元素边界 | 375/390/414 下 Tab、底部 CTA、主题卡、横滑卡、二维码、贴纸、登录面板、分享图 | 不越界、不遮挡、不裁字、不半露关键内容；底部安全区保留可点击空间 | `PR-FE-ONLINE-P0-BOUNDARY-SAFE` |
| 列表厚度 | 相册/历史 0/1/3/5/10/50 条、榜单空态/列表、我的页列表 | 超过 5 项收敛为精选 3 项 + 更多/折叠/横滑/搜索/二级页；厚重单列不得占满首屏 | `PR-FE-ONLINE-P1-LIST-DENSITY` |
| CTA 层级 | 首页、创建、邀请、拍照/上传、记录/相册、分享、登录、榜单 | 只有一个明确主动作；默认/按下/禁用/加载/失败状态可区分；文案具体不泛化 | `PR-FE-ONLINE-P1-CTA-HIERARCHY` |
| 多角色/多状态 | 创建者、参与者、访客、未登录、失效 token；空/加载/失败/权限拒绝/上传失败/分享失败 | 角色权限和空/错/加载态有明确文案与恢复动作，不直显英文错误 | `PR-FE-ONLINE-P1-ROLE-STATE` |
| 榜单 | `rankings/today` 200 后空态、列表态、错误态、加载态 | 不再出现 `not found` 英文直显；空态说明与下一步一致；接口状态和 UI 一致 | `PR-FE-ONLINE-P0-RANKINGS-STATE` |
| 分享与相册 | 分享 PNG、分享预览、历史相册、相册尾部 | 分享图清晰可读；相册尾部无误导性大空白；背景/WebP 不影响文字对比 | `PR-FE-ONLINE-P1-SHARE-ALBUM` |

P0/P1/P2 判定：

- P0：旧壳主路径回流、三步路径阻断、登录入口不可见、CTA 越界/安全区遮挡、英文错误直显、榜单线上状态错误、关键页面白屏或无恢复路径。
- P1：厚重单列、列表过长、CTA 层级混乱、空/错/加载态信息不足、贴纸或图片轻微裁切、相册尾部留白误导。
- P2：二级旧功能命名仍偏旧、局部文案不够聚会记录化、非主路径装饰/贴纸风格不统一、低频状态缺精修。

当前结论：`PR-UX-ONLINE-EVIDENCE-ACCEPT-003` 只能进入 `blocked / 待线上最终采集截图录屏复核`。收到测试最终采集包后，UI/UX 先核 P0，再核 P1/P2；任一证据缺实现截图、录屏、控制台/API 摘要、角色、样本 ID 或设备/视口时，不写设计通过。

#### 12.7.14 `PR-UX-DEVTOOLS-PREVIEW-REVIEW-010` 开发者工具预览框阶段复核

执行边界：用户最新指令确认当前暂无真机，真机标识、测试调试等通过小程序开发工具右侧预览框实现；预览框通过即可作为当前阶段通过，跳过真机截图录屏，不影响开发进度。本节只处理 UI/UX 预览框阶段复核，不修改业务源码、不修改 PM 总台账、不替测试/前端/UGC 写通过。

状态调整：UI/UX 当前从“待真机截图/录屏”调整为 `待/进行预览框阶段复核`。缺真机材料不得继续阻塞当前开发；但缺开发者工具右侧预览框可读截图、路径录屏或控制台/API 摘要时，只能写 `待预览证据`，不能写预览框阶段通过。

SKILL 选择：

| SKILL | 选择依据 | 使用边界 | 本轮证据 |
| --- | --- | --- | --- |
| `web-design-guidelines` | 预览框阶段重点是移动端触控、按钮状态、空/错/加载态、边界、安全区、长内容、图片尺寸和可点击控件可达性；已按最新规则源核对 | 用于交互、可达性、状态表达和预览框证据接收，不要求真机证据 | `docs/runtime/pr-qa-devtools-preview-accept-010-window.png`、`docs/runtime/pr-qa-devtools-preview-accept-010-right.png` 为 160x28 / 61x28 黑色小图，无法判断 UI；`docs/runtime/wechat-devtools-preview-window.png` 可作首页旧批次参考 |
| `design-taste-frontend` | 用于聚会记录师旧壳零容忍、视觉层级、页面权重、单列厚卡、长列表和主 CTA 清晰度审计 | 只做预览框阶段 UI/UX 复核，不生图、不扩大资产范围 | 首页旧批次预览图可见“聚会记录师”主标题与主 CTA，但不能替代本批全页面证据 |

预览框阶段证据要求：

| 页面/路径 | 当前阶段必须提交 | 阶段接收标准 | 缺失状态 |
| --- | --- | --- | --- |
| 首页 `index` | 右侧预览框全屏截图，含底部 Tab、主 CTA、最近相册、登录入口/未登录承接状态 | 产品名为“聚会记录师”；主 CTA 明确；登录/创建下一步可见；最近相册语义不误导；底部 Tab 不遮挡 | 已有旧批次可读截图，仅可初判；本批 `accept-010` 不可读，仍需补本批截图 |
| 三步创建拍照路径 | 从首页点击创建到拍第一张的开发者工具预览框连续录屏或逐步截图 | 路径不超过三步；登录不丢原动作；创建、邀请/二维码、拍照动作清楚；不被旧玩法、模板、会员或榜单阻断 | 待预览证据 |
| 创建页 `create-session` | 主题/模板卡、名称输入、主 CTA、底部安全区截图 | 主题卡完整可读，不裁字；卡片不过厚；主 CTA 可达且不被安全区遮挡；长列表收敛 | 待预览证据 |
| 邀请/二维码 `invite-group` | 二维码、口令、分享按钮、返回/下一步截图 | 二维码完整；分享/继续拍照层级明确；按钮不越界；邀请状态清楚 | 待预览证据 |
| 拍照/上传 `moment-editor` / `live-record` | 空态、有图态、上传中、失败重试、保存/更换图片状态截图 | 空态引导拍第一张；保存/更换图片不误导；贴纸不裁切；底部 CTA 可达 | 待预览证据 |
| 相册/记录 `wine-history` / 记录页 | 0/1/3/5+ 条、相册尾部、横滑或更多入口截图 | 不回到旧“酒桌判官”主视觉；列表不过长；单列卡不过厚；尾部无误导性大空白 | 待预览证据 |
| 分享 `share-poster/share-preview` | 生成中、成功预览、失败重试、PNG 原图或预览框截图 | 分享图文字清楚；背景不压文字；失败可重试；旧玩法不成为主心智 | 待预览证据 |
| 简报 `session-brief` | 时间线、照片、关键节点、分享入口截图 | 不出现“酒局时间线简报”等旧主文案；层级围绕聚会回忆/记录 | 待预览证据 |
| 榜单 `rankings` | 空态、列表、loading、error 截图和接口摘要 | 不直显 `not found`；榜单为二级增强，不阻塞记录/拍照；状态与 API 一致 | 待预览证据 |
| 我的 `me` | 登录态、未登录态、资料入口、历史/设置入口截图 | 登录状态清楚；旧功能降权；入口不挤占主路径；按钮层级明确 | 待预览证据 |

预览框阶段退回码：

| 退回码 | 触发条件 | 责任建议 |
| --- | --- | --- |
| `PR-FE-PREVIEW-P0-BOUNDARY` | 任一页面元素越界、底部按钮被安全区遮挡、横滑卡关键内容半露、Tab 压住内容 | 前端修复页面布局、安全区和容器宽度 |
| `PR-FE-PREVIEW-P1-HEAVY-CARD` | 单列大卡占据首屏主要空间，模板/工具/统计卡过厚，页面权重失衡 | 前端改为双列、轻量行、横滑或二级页 |
| `PR-FE-PREVIEW-P1-LONG-LIST` | 单个列表超过 5 项仍直接堆叠，创建流程依赖长列表推进 | 前端改精选 3 项 + 更多、折叠、搜索或二级页 |
| `PR-FE-PREVIEW-P0-CTA-UNREACHABLE` | 主按钮不可达、被遮挡、禁用无原因、点击后无下一步 | 前端修复 CTA 位置、状态与点击反馈 |
| `PR-FE-PREVIEW-P1-CTA-HIERARCHY` | 多个主按钮抢层级、按钮文案泛化、继续/保存/分享关系不清 | 前端调整 CTA 层级和动作文案 |
| `PR-FE-PREVIEW-P0-OLD-BRAND` | 默认主路径出现旧“酒桌判官/判官/酒局/欠酒/惩罚/裁判”主标题或旧玩法大卡 | 前端替换主视觉/文案，旧功能降到二级 |
| `PR-FE-PREVIEW-P0-THREE-STEP` | 首页到拍第一张路径超过三步，或被登录、模板、规则、会员、榜单阻断 | 前端重排入口与流程承接 |
| `PR-FE-PREVIEW-P0-EVIDENCE-UNREADABLE` | 提交的预览框截图过小、全黑、只截工具栏或无法辨认页面 UI | 测试/前端重新提交右侧预览框可读截图或录屏 |

当前预览框阶段结论：

- `docs/runtime/pr-qa-devtools-preview-accept-010-window.png` 与 `docs/runtime/pr-qa-devtools-preview-accept-010-right.png` 仅显示极窄黑色区域，不能用于 UI/UX 接收，按 `PR-FE-PREVIEW-P0-EVIDENCE-UNREADABLE` 标记 `待预览证据`。
- `docs/runtime/wechat-devtools-preview-window.png` 可见首页旧批次预览：主标题已为“聚会记录师”，主 CTA“创建聚会”可见，底部 Tab 可见；但“最近相册”下仍出现“测算工具/分享生成/图片处理”等语义，需前端在本批截图中证明已改为聚会相册/照片记录语义，未证明前不写阶段通过。
- 其他页面：首页三步创建路径、创建页、邀请/二维码、拍照/上传、相册/记录、分享、brief、rankings、我的，当前均缺本批开发者工具右侧预览框可读截图或录屏，状态为 `待预览证据`。

前端可先改/自查页面与组件：

- `index`：登录入口、主 CTA、最近相册语义、底部 Tab、继续记录入口。
- `create-session`：主题卡完整可读、卡片密度、底部 CTA、安全区。
- `invite-group`：二维码完整、分享/继续拍照层级。
- `moment-editor` / `live-record`：空态、有图态、上传失败重试、保存/更换图片文案。
- `wine-history` / 记录页：列表长度、卡片厚度、旧品牌主视觉清零、尾部留白。
- `share-poster` / `share-preview`：生成中/失败/成功状态、背景可读性。
- `session-brief`：旧“酒局”文案清零，时间线和回忆层级。
- `rankings`：空态、错误态、loading、`not found` 清零。
- `me`：登录/未登录状态、资料/历史/设置入口层级。

##### 12.7.14.1 `PR-UX-DEVTOOLS-PREVIEW-REVIEW-010` PM 补证后 `create-session` 单页预览审计

补证文件：

| 文件 | 用途 | UI/UX 可用性 |
| --- | --- | --- |
| `docs/runtime/pr-pm-devtools-preview-window-restored-010.png` | DevTools 恢复窗口全屏截图 | 可证明窗口已恢复，但不能替代手机区域单页审计 |
| `docs/runtime/pr-pm-devtools-preview-right-restored-010.png` | DevTools 右侧预览截图 | 右侧预览区域自身存在横向裁切，不能用来判断页面是否越界 |
| `docs/runtime/pr-pm-devtools-preview-phone-create-session-010.png` | `/pages/create-session/index` 手机预览裁图 | 本轮主证据，可审创建页单页 UI/UX |

SKILL 选择复核：

| SKILL | 本轮选择依据 | 使用边界 |
| --- | --- | --- |
| `web-design-guidelines` | 用于审三步条、输入控件、主题卡可读性、CTA 可达性、安全区、滚动与触控区域 | 只对 `create-session` 单页预览框证据做阶段复核，不扩展为全量页面通过 |
| `design-taste-frontend` | 用于审聚会记录师方向、旧玩法降权、卡片密度、页面权重、潮流感/轻卡通感 | 只做视觉一致性与退回建议，不生图、不改源码 |

单页观察结论：

| 核查项 | 观察 | 结论 |
| --- | --- | --- |
| 三步条 | 顶部显示 `1 创建`、`2 邀请`、`3 拍照`，路径顺序清楚 | P0 未命中，可作为创建页阶段证据 |
| 页面主心智 | 标题为“创建聚会”，副文案为“默认生成房间和邀请方式，马上拍第一张照片。” | 符合“聚会记录师”创建/拍照方向 |
| 轻量主题卡 | 首屏展示 3 张主题卡，非长列表堆叠，选中态清楚 | 方向正确，但卡内缩略图和副文案偏小，存在 P1 可读性风险 |
| CTA | 底部主按钮“创建并邀请”清晰，按钮面积足够，未被底部安全区遮挡 | P0 未命中 |
| 安全区 | 手机裁图中底部 Home Indicator 与 CTA 有间距，页面未被底部遮挡 | P0 未命中 |
| 列表/卡片厚度 | 主题区为横向 3 卡轻量排布，高级设置折叠，未出现厚重单列大卡 | P0/P1 主风险已明显降低 |
| 旧玩法权重 | 本页未见“酒桌判官/判官/酒局/欠酒/惩罚/裁判”主标题或旧玩法大卡 | P0 未命中 |
| 潮流感/卡通感 | 珊瑚主 CTA、浅暖底、轻贴纸星形和柔和卡片接近 Clean Quick Recorder + 轻卡通方向 | 阶段方向可接收，但细节需继续压实可读性 |

退回码与问题分级：

| 退回码 | 分级 | 触发证据 | 责任角色 | 修复口径 |
| --- | --- | --- | --- | --- |
| `PR-FE-PREVIEW-P1-THEME-CARD-READABILITY` | P1 | `docs/runtime/pr-pm-devtools-preview-phone-create-session-010.png` 中主题卡缩略图、主题副文案在手机宽度下偏小，快速扫读成本偏高 | 前端 | 主题卡内封面/文字层级需放大或减字；卡片主标题必须一眼可读，副文案最多 1-2 行，字号和对比不低于当前正文弱信息 |
| `PR-FE-PREVIEW-P1-THEME-CARD-TAP-AREA` | P1 | 三张轻量主题卡宽度较窄，内容密度接近下限 | 前端 | 保持 3 张首屏策略，但每张卡点击区域不得小于可舒适点击范围；选中边框不能挤压内容 |
| `PR-QA-PREVIEW-P1-RIGHT-CROP-EVIDENCE` | P1 | `docs/runtime/pr-pm-devtools-preview-right-restored-010.png` 右侧预览图本身横向裁切，无法用于越界判断 | 测试/PM | 后续页面矩阵以手机预览裁图或完整右侧预览框为准，避免只截到被 DevTools 容器裁掉的区域 |

`create-session` 单页阶段结论：`预览框阶段单页可继续开发 / P1 待优化复核`。本页未命中 P0：三步条、主 CTA、安全区、旧玩法权重和卡片厚度当前可支持继续推进；但主题卡可读性仍需前端按 `PR-FE-PREVIEW-P1-THEME-CARD-READABILITY` 与 `PR-FE-PREVIEW-P1-THEME-CARD-TAP-AREA` 优化或在后续预览矩阵中证明已满足。该结论只覆盖 `/pages/create-session/index` 单页，不代表首页、邀请/二维码、拍照/上传、相册/记录、分享、brief、rankings、我的全量通过。

##### 12.7.14.2 预览框点击工具链恢复后的 UI/UX 接收证据口径

PM 通知：预览框点击工具链已恢复，使用说明见 `docs/runtime/wechat-devtools-automation-guide.md`。UI/UX 后续接收实现截图时，可要求测试提供 `npm.cmd run wechat:auto -- ...` 的命令原文、截图、page/data/storage/console 摘要。当前 `create-session` P1 仍等待前端修复后由测试重跑，再由 UI/UX 复核。

SKILL 选择补充：

| SKILL | 选择依据 | 使用边界 |
| --- | --- | --- |
| `web-design-guidelines` | 自动化预览框证据需覆盖点击可达、按钮状态、异步反馈、页面状态、长内容、边界与安全区；本轮已按最新规则源补充证据字段要求 | 只定义 UI/UX 接收证据，不替测试写通过 |
| `design-taste-frontend` | 自动化截图仍需复核聚会记录师方向、旧壳零容忍、页面权重、厚卡、长列表和 CTA 层级 | 只用于后续截图复核，不生图、不改源码 |

后续预览框证据包最低要求：

| 证据项 | UI/UX 接收要求 | 缺失处理 |
| --- | --- | --- |
| 命令原文 | 记录完整 `npm.cmd run wechat:auto -- <command>`，含 `--port`、`--path`、`--selector`、`--data`、`--storage`、`--output` 等关键参数 | 标记 `待预览证据 / 命令不可复跑` |
| 截图文件 | 提供可读手机预览截图或完整右侧预览框截图；只截到 DevTools 容器裁切区域不得用于越界判断 | 退回 `PR-QA-PREVIEW-P1-RIGHT-CROP-EVIDENCE` |
| page 摘要 | 记录当前 `path/query`，必须能对应被审页面，例如 `/pages/create-session/index` | 标记 `待预览证据 / 页面不明` |
| data 摘要 | 记录与页面判断相关字段，例如 `sessionName`、`templates`、`playerCount`、`authPanelVisible`、`authRedirectUrl`、`loggedIn` | 标记 `待预览证据 / 状态不明` |
| storage 摘要 | 记录登录态与 token 后 8 位，不得公开完整 token | 缺登录态时只做匿名/未登录态初判 |
| console 摘要 | 无输出写 `console=[]`；如有错误需记录错误摘要和是否影响 UI 状态 | console 错误影响 UI 时退回对应责任方 |

`create-session` 重跑要求：

- 前端先修复 `PR-FE-PREVIEW-P1-THEME-CARD-READABILITY` 与 `PR-FE-PREVIEW-P1-THEME-CARD-TAP-AREA`。
- 测试用自动化链路重跑 `/pages/create-session/index`，建议命令包含 `--data sessionName,templates,playerCount`、`--storage` 和 `--output docs/runtime/...create-session...png`。
- UI/UX 收到重跑证据后，只复核 `create-session` 单页 P1 是否关闭；不得据此写首页、三步路径、邀请/二维码、拍照/上传、相册/记录、分享、brief、rankings、我的全量通过。

##### 12.7.14.3 `PR-UX-DEVTOOLS-PREVIEW-MATRIX-REVIEW-011` 预览框矩阵 UI/UX 接收记录

记录时间：2026-06-17。依据前端计划 14.27、测试计划 13.16.37、自动化说明 `docs/runtime/wechat-devtools-automation-guide.md` 和本轮预览框截图文件，UI/UX 只做预览框阶段接收/退回判断，不改 PM 总台账，不替测试、前端、接口联调、UGC 或后台写通过。

SKILL 选择：

| SKILL | 选择依据 | 使用边界 | 本轮证据缺口 |
| --- | --- | --- | --- |
| `web-design-guidelines` | 本轮重点是移动端触控可达、加载/失败/空态、按钮反馈、长内容、安全区和截图证据可复跑性；已重新拉取最新规则源 | 用于预览框截图和 data/storage/console 摘要接收，不等同真机或正式发布准出 | `create-session` 主题卡仍是骨架态，三步链路未闭环，部分页面 query 未落 data |
| `design-taste-frontend` | 用于核对“聚会记录师”心智、旧玩法降权、厚卡/长列表和页面权重 | 只做视觉方向判断，不生图、不改源码 | 缺有数据态相册、榜单、brief、我的页登录态截图 |

本轮已核证据：

| 页面/链路 | 证据文件 | UI/UX 接收判断 | 结论 |
| --- | --- | --- | --- |
| 首页未登录入口 | `docs/runtime/pr-qa-011-home-login-9420.png` | 主标题“聚会记录师”、主 CTA“创建聚会”和登录弹层可读；登录后回流创建页的 data 摘要由测试记录支撑 | 预览框阶段可作为首页登录入口初证；仍需登录成功后连续路径证据 |
| 创建聚会静态 | `docs/runtime/pr-qa-011-create-session-wait-9420.png`、`docs/runtime/pr-qa-011-create-session-primary-tap-9420.png` | 三步条、主标题、输入、CTA 和安全区可读；但主题区仍显示骨架/加载条，无法判断前端 14.27 主题卡 P1 修复是否关闭；点击主 CTA 后仍停留创建页 | `create-session` 单页壳层可读，但 P1 不关闭；三步创建链路按 P0 退回 |
| 邀请/二维码 | `docs/runtime/pr-qa-011-invite-group-9420.png` | 页面标题、分享按钮和“拍第一张”CTA 可读；房间码显示“生成中”，测试 data 中 `sessionId/inviteCode/sessionName` 为空 | 退回前端 + 接口联调复核 query 到 data 和房间码生成闭环 |
| 拍照/上传 | `docs/runtime/pr-qa-011-moment-editor-private-9420.png` | 空态插画、拍照/相册按钮、保存照片 CTA、隐私提示可读；但 private query 未落为 private data，无法验收私密/UGC 权限 | UI 壳层可继续，权限态待前端 + UGC 复核 |
| 记录/相册 | `docs/runtime/pr-qa-011-live-record-album-tap-9420.png` | 相册 Tab 可点击，空态和继续拍照 CTA 可读；有隐私提示和举报入口 | 预览框阶段可作为空相册初证；仍缺有图态、长列表、返回路径和真实 session data |
| 分享预览/保存 | `docs/runtime/pr-qa-011-share-preview-9420.png`、`docs/runtime/pr-qa-011-share-preview-save-tap-9420.png` | 分享卡、口令、保存海报 CTA 和举报/反馈入口可读；测试记录 `posterImagePath=http://tmp/...png` | 预览框阶段分享预览可接收；真机保存权限和 PNG 原图不在本阶段覆盖 |
| 聚会简报 | `docs/runtime/pr-qa-011-session-brief-wait-9420.png` | 页面主文案可读且旧“酒局时间线”未成为主标题；但 6 秒后仍 loading，`briefId/sessionId` data 为空 | 退回前端 + 接口联调复核 brief query 和加载闭环 |
| 今日回忆榜 | `docs/runtime/pr-qa-011-rankings-best-opening-wait-9420.png` | 已不直显英文 `not found`，榜单定位为二级回忆入口；但 8 秒后仍 loading，`activeCategory` 未采纳 query | P1 退回前端 + 接口联调复核 category/query 和加载闭环 |
| 我的/历史 | `docs/runtime/pr-qa-011-me-9420.png`、`docs/runtime/pr-qa-011-wine-history-host-9420.png` | 未登录态可读，旧品牌不突出；登录引导和设置入口清楚 | 仅接收未登录静态初证；仍缺登录态、最近回忆、有数据态、长列表和后台同步证据 |

本轮退回码：

| 退回码 | 分级 | 触发证据 | 责任角色 | UI/UX 修复/复拍口径 |
| --- | --- | --- | --- | --- |
| `PR-FE-PREVIEW-P0-THREE-STEP-CREATE-STUCK` | P0 | `create-session` 点击 `.create-primary` 后仍停留创建页，`templatesLoading=true`，未形成创建到邀请跳转证据 | 前端 + 接口联调 | 修复模板加载/创建提交前置；测试重跑首页 -> 创建 -> 邀请 -> 拍第一张连续证据 |
| `PR-FE-PREVIEW-P0-INVITE-CODE-LOADING` | P0 | `invite-group` query 含 session/inviteCode，但页面 data 为空，房间码停在“生成中” | 前端 + 接口联调 | 确认 onLoad/query、接口返回和 loading 退出；复拍房间码、分享按钮、拍第一张 CTA |
| `PR-FE-PREVIEW-P1-THEME-CARD-RETEST-MISSING` | P1 | 前端 14.27 已修主题卡，但本轮截图仍是骨架态，无法看到主题卡真实内容 | 测试 + 前端 | 待模板加载完成后复拍 `create-session`；仅凭骨架态不能关闭 `READABILITY/TAP_AREA` |
| `PR-FE-PREVIEW-P1-BRIEF-LOADING` | P1 | `session-brief` 6 秒仍 loading，`briefId/sessionId` data 为空 | 前端 + 接口联调 | 修复 query/data 合同或加载退出；复拍简报有数据态、空态和失败态 |
| `PR-FE-PREVIEW-P1-RANKINGS-LOADING` | P1 | `rankings?category=best_opening` 8 秒仍 loading，`activeCategory=today_highlight` | 前端 + 接口联调 | 修复 category query 采纳和加载闭环；复拍空榜、列表、错误三态 |
| `PR-FE-PREVIEW-P1-PRIVATE-QUERY-STATE` | P1 | `moment-editor` private query 未落 data，`visibility=session` | 前端 + UGC 风控 | 复核 private/visibility 默认和权限提示；补 private、公开、成员可见三态截图 |
| `PR-FE-PREVIEW-P2-LIVE-EXIT-LOG-NOISE` | P2 | `live-record` console 多次 `[session-exit] enableAlertBeforeUnload enabled` | 前端 | 判断是否重复注册或预期日志；若影响返回/离开确认则升级 |

阶段结论：

- `PR-FE-PREVIEW-P1-THEME-CARD-READABILITY` 与 `PR-FE-PREVIEW-P1-THEME-CARD-TAP-AREA`：前端已记录修复方式，但本轮 `create-session` 证据仍为骨架态，UI/UX 状态为 `待复拍 / 未关闭`。
- `create-session` 静态壳层、首页登录入口、拍照页空态、相册空态、分享预览页在预览框阶段可继续开发；这些只代表局部页面可读，不代表全量通过。
- 三步创建到拍第一张未闭环，邀请页房间码生成卡住，按 P0 退回前端 + 接口联调；brief、rankings、private 权限态按 P1 退回。
- 测试下一步继续使用 `npm.cmd run wechat:auto -- ...` 复拍，并提交命令原文、截图、page/data/storage/console 摘要；UI/UX 收到复拍后只关闭对应退回码，不写正式真机发布通过。

#### 12.7.15 `PR-UX-DUAL-FLOW-SHARE-014` 双主线与酷炫分享页 UI/UX 纠偏

记录时间：2026-06-17。PM 新派 P0：用户明确纠偏“酒桌记账功能不能消失，流程应该与拍照流程并存，并且一同导出分享；分享页和分享截图保存是项目最重要页面，必须酷炫”。本节只更新 UI/UX 计划和设计口径，不修改业务源码、不修改 PM 总台账、不替前端、测试、后端/API、接口联调、UGC 或数据指标写通过。

已读取与证据来源：

| 来源 | 本轮结论 |
| --- | --- |
| `AGENTS.md`、`docs/party-recorder-redesign-requirements.md` | 产品仍名为“聚会记录师”；新增 4.1 已确认双主线：拍照记录 + 酒桌记账 / 聚会账本；分享页必须合并照片墙、账本高光、关键事件和聚会总结 |
| `docs/gameplay-moments-team-announcements.md` | 2026-06-17 PM 已通知所有角色：不得把记账、欠酒、已喝、关键事件、结算摘要等既有能力从核心体验删除；测试不得在记账入口或联合分享缺失时写预览框通过 |
| 当前代码只读核查 | `table-mode` 仍有“欠酒 / 已喝”表格能力；`share-poster/share-preview` 已有分享图、事件、保存和安全提示；但未见聚会账本高光、欠酒/已喝摘要、结算摘要共同导出到分享页的实现证据 |
| 当前预览框证据 | `docs/runtime/pr-qa-011-continue-012-share-preview-save-window.png` 能看到邀请分享和保存海报，但没有账本高光；`docs/runtime/pr-qa-011-continue-012-live-record-album-window.png` 有相册/记录/分享分段，但没有账本主入口 |

SKILL 选择：

| SKILL | 选择依据 | 使用边界 | 证据缺口 |
| --- | --- | --- | --- |
| `imagegen-frontend-mobile` | 本轮需要定义移动端分享页/保存图的高优先级视觉方向，强调 app-native、酷炫、可读、安全区和多模块合成 | 本轮只用其移动端图像方向规则锁定视觉语言和多屏一致性；不直接生成新位图，不写代码 | 缺真实账本样本、照片墙样本、关键事件样本和分享 PNG 原图；如 PM 继续要求图稿，下一轮需基于本节生成 3 张单屏目标图 |
| `web-design-guidelines` | 仍用于预览框截图接收：按钮可达、状态表达、长内容、安全区、保存失败可恢复 | 用于测试矩阵和退回码，不替测试写通过 | 缺拍照 + 记账共同导出分享的 data/storage/console 摘要 |

本轮不新增 bitmap 设计资产，原因：已有分享/剩余页目标板和 `party-recorder-share-bg.webp` 可作为旧视觉基础，但当前缺账本真实数据结构、字段合同和可公开样本。直接生图会把未知字段画成假数据，不利于前端、后端和测试联调。当前资产路径仍作为参考：

| 资产 / 参考 | 路径 | 本轮使用方式 |
| --- | --- | --- |
| P0 剩余页面目标板 | `docs/design-assets/party-recorder/remaining/pr-ux-remaining-p0-pages-five-screen-board.png` | 仅作旧版分享/历史/简报/榜单视觉基线，需按双主线升级 |
| 分享页底图切图 | `docs/design-assets/party-recorder/cuts/party-recorder-share-bg.webp` | 可继续作为分享背景底纹，但不得压住账本数字、二维码、房间码和保存按钮 |
| 当前分享预览证据 | `docs/runtime/pr-qa-011-continue-012-share-preview-save-window.png` | 只证明保存海报壳层存在；不能证明联合分享达标 |

##### 12.7.15.1 产品口径：双主线并存

新版 UI/UX 口径调整为：`拍照记录` 与 `酒桌记账 / 聚会账本` 是并行核心能力，二者共同沉淀到分享页和保存图。三步内拍第一张照片仍是默认效率目标，但记账入口不能隐藏、删除或只放到深层工具箱。

| 主线 | 默认入口 | 允许出现的文案 | 不允许 |
| --- | --- | --- | --- |
| 拍照记录 | 首页主 CTA、记录页主 CTA、当前聚会页主 CTA | 拍第一张、继续拍照、相册、照片墙、聚会记录 | 被模板、玩法、会员、榜单阻断 |
| 酒桌记账 / 聚会账本 | 首页副主 CTA、记录页分段、当前聚会页固定入口、桌面模式兼容入口 | 聚会账本、记一笔、加酒/已喝、关键事件、结算摘要、账本高光 | 被隐藏到工具箱深层；从分享页消失；被改成纯历史兼容 |
| 联合分享 | 分享页、分享截图保存页、简报页分享入口 | 照片墙、账本高光、关键事件、聚会总结、保存分享图 | 只有邀请口令或空海报；只展示照片不展示账本；只展示账本不展示照片 |

##### 12.7.15.2 双入口 IA

首页、记录页、当前聚会页必须明确“双入口并存”，但层级不能互相抢死。

| 页面 | IA 目标 | 前端可执行结构 | UI/UX 退回码 |
| --- | --- | --- | --- |
| 首页 `index` | 首屏同时看到 `创建聚会` 和 `聚会账本`，并保留 `加入 / 继续记录` | 主 CTA：创建聚会；副主 CTA：打开聚会账本或继续记账；最近聚会卡展示“照片 x 张 / 账本 x 条 / 分享图状态”摘要 | `PR-FE-DUAL-P0-HOME-ACCOUNTING-MISSING` |
| 记录页 `live-record` | 分段从 `记录 / 相册 / 分享` 升级为 `照片 / 账本 / 分享` 或保留记录分段但首屏固定展示账本入口 | 顶部分段或双按钮：拍照记录、聚会账本；空态同时给“继续拍照”和“记一笔”；当前聚会摘要显示照片数、账本条数、关键事件数 | `PR-FE-DUAL-P0-LIVE-ACCOUNTING-ENTRY` |
| 当前聚会 / 桌面模式 `table-mode` | 保留欠酒/已喝/加酒能力，并将文案轻量化为聚会账本能力 | 表格仍可记录欠酒、已喝、加酒、事件；从记录页可进，返回记录页不丢 session；不得只剩历史入口 | `PR-FE-DUAL-P0-TABLE-ACCOUNTING-REMOVED` |
| 历史/相册 `wine-history` | 历史列表显示照片和账本共同摘要 | 每条聚会卡：封面/照片墙 + 账本高光 chip + 分享图状态；可进入分享页或账本详情 | `PR-FE-DUAL-P1-HISTORY-LEDGER-SUMMARY` |
| 简报 `session-brief` | 聚会总结包含照片、账本、事件三类素材 | 简报头部展示“照片墙 / 账本高光 / 关键事件”；分享入口生成联合分享图 | `PR-FE-DUAL-P1-BRIEF-LEDGER-MISSING` |

##### 12.7.15.3 分享页与保存图 P0 酷炫规格

分享页和分享截图保存页升级为当前最高优先级体验。目标不是普通列表，而是“可保存、可转发、能一眼看出这场聚会很有记忆点”的视觉合成页。

| 模块 | 必须展示 | 视觉要求 | 失败判定 |
| --- | --- | --- | --- |
| 顶部高光 | 聚会名、日期/时段、参与人数、主视觉照片或照片墙 | 强视觉区，可用深色/暖橙/薄荷撞色、轻噪点、拍立得/贴纸感；文字必须清楚 | 只有口令或空背景，判 P0 |
| 照片墙 / 高光图 | 至少 1 张真实照片或空态说明；多图时 3-6 张拼贴 | 固定比例，不能裁掉主体；无图时说明“还没有公开照片，先拍第一张” | 图片加载失败无兜底，判 P1；分享图只有空壳判 P0 |
| 账本高光 | 欠酒/已喝/加酒/结算摘要/账本榜单，至少展示 2-3 个可读指标 | 采用“账本霓虹条 / 数字徽章 / 高光卡”组合；数字和单位大于普通说明文案 | 完全没有账本信息，判 P0 |
| 关键事件 | 开场、拍第一张、加酒、结算、最佳高光等 3 条以内 | 时间线短句，不做长列表；可用图标或小贴纸连接 | 事件超过 5 条堆叠或挤压保存按钮，判 P1 |
| 聚会总结 | 一句自动总结，说明这场聚会值得回看 | 适合截图传播，避免后台术语和英文错误 | 直显技术错误或旧“判官裁判”主文案，判 P0/P1 |
| 保存与分享 | 保存图片、分享给好友/群、举报/反馈、隐私过滤提示 | 主按钮必须醒目；二维码/房间码安全区不被贴纸和背景压住 | 保存按钮不可达、二维码不可读、过滤提示缺失，判 P0 |

建议视觉方向：`Trendy Ledger Wall`。在既有 `Clean Quick Recorder` 基线上加入更酷炫的分享页特化：深色局部舞台 + 珊瑚橙主 CTA + 薄荷绿安全提示 + 蓝色账本数字 + 轻 Y2K 星形/拍立得边框。只在分享页/保存图使用更强视觉，不把全站改成重装饰。

##### 12.7.15.4 前端退回码

| 退回码 | 分级 | 触发条件 | 责任角色 | 修复口径 |
| --- | --- | --- | --- | --- |
| `PR-FE-DUAL-P0-HOME-ACCOUNTING-MISSING` | P0 | 首页首屏只剩拍照/相册，找不到聚会账本或记账入口 | 前端 | 首页增加账本副主入口；最近聚会卡展示照片 + 账本摘要 |
| `PR-FE-DUAL-P0-LIVE-ACCOUNTING-ENTRY` | P0 | 当前聚会/记录页无法进入账本，或账本入口低于折叠/二级深处 | 前端 | 记录页首屏提供“拍照记录 / 聚会账本”双入口，保留继续拍照主 CTA |
| `PR-FE-DUAL-P0-TABLE-ACCOUNTING-REMOVED` | P0 | 欠酒/已喝/加酒/关键事件能力被删除、隐藏或无法从当前聚会进入 | 前端 | 保留 table-mode 或等效账本页；文案可轻量化但能力不可消失 |
| `PR-FE-DUAL-P0-SHARE-LEDGER-MISSING` | P0 | 分享页或保存图只有照片/口令，没有账本高光或结算摘要 | 前端 + 后端/API + 接口联调 | 分享页数据合同必须包含 `photoHighlights/accountingHighlights/keyEvents/summary` 或等效字段 |
| `PR-FE-DUAL-P0-SHARE-EMPTY-SHELL` | P0 | 保存图能生成但只是背景/按钮/口令，缺照片墙、账本高光、关键事件和聚会总结 | 前端 + 测试 | 保存图必须可视化四类内容；无数据时也要有明确空态和下一步 |
| `PR-FE-DUAL-P0-SHARE-SAVE-UNCOOL` | P0 | 分享页仍是普通白卡列表或旧邀请海报壳，无法承担“最重要页面” | 前端 + UI/UX | 按 `Trendy Ledger Wall` 重做分享主视觉；仍要保证二维码、文字、按钮可读 |
| `PR-FE-DUAL-P1-LEDGER-LABEL-OLD-MINDSET` | P1 | 账本入口只用“判官/惩罚/裁判”作为主文案，强化旧游戏心智 | 前端 + UI/UX | 主文案用“聚会账本 / 记一笔 / 结算摘要”；欠酒等作为账本内容标签保留 |
| `PR-FE-DUAL-P1-LEDGER-SHARE-FILTER` | P1 | 私密照片、待审照片或敏感账本备注进入公开分享图 | 前端 + UGC + 后端/API | 分享前过滤，测试提供过滤清单；敏感信息用摘要替代 |

##### 12.7.15.5 测试接收矩阵

测试不得只看“拍照主线”和“保存按钮存在”。预览框阶段必须证明记账入口可见可进、拍照与记账共同导出分享、保存图不是空壳。

| 接收项 | 必收证据 | 通过口径 | 退回码 |
| --- | --- | --- | --- |
| 首页双入口 | `npm.cmd run wechat:auto -- relaunch/tap` 截图；data 摘要含首页入口状态 | 首页首屏可见创建聚会和聚会账本/记账入口；点击账本入口可进入账本或当前聚会账本 | `PR-FE-DUAL-P0-HOME-ACCOUNTING-MISSING` |
| 记录页双入口 | `live-record` 预览框截图，覆盖空态、有 session、album/ledger/share 分段 | 拍照和账本都在首屏可达；账本不阻塞继续拍照 | `PR-FE-DUAL-P0-LIVE-ACCOUNTING-ENTRY` |
| 账本能力保留 | `table-mode` 或新账本页截图；data 摘要含欠酒/已喝/加酒/事件样本 | 能新增或查看记账/账本条目；返回记录页 session 不丢 | `PR-FE-DUAL-P0-TABLE-ACCOUNTING-REMOVED` |
| 联合分享页 | `share-poster/share-preview` 截图；data 摘要含照片墙、账本高光、关键事件、总结字段 | 分享页同时展示照片墙/高光图、账本高光、关键事件、聚会总结 | `PR-FE-DUAL-P0-SHARE-LEDGER-MISSING` |
| 保存图不是空壳 | 点击保存/生成后截图和 `posterImagePath`；如能取 PNG 原图需附路径或预览 | 保存图中可见四类内容，且二维码/口令/主标题可读 | `PR-FE-DUAL-P0-SHARE-EMPTY-SHELL` |
| 酷炫视觉 | 分享页 390 宽预览框 + 375/414 最终补测 | 分享页视觉明显强于普通列表；有主视觉、照片拼贴、账本数字高光、贴纸/光效，但不牺牲可读性 | `PR-FE-DUAL-P0-SHARE-SAVE-UNCOOL` |
| 分享过滤 | UGC 过滤清单、私密/待审/未授权照片和敏感账本备注反例 | 公开分享图不泄露私密、待审、隐藏、未授权内容；账本只展示摘要 | `PR-FE-DUAL-P1-LEDGER-SHARE-FILTER` |
| 控制台/接口摘要 | 每项记录 `page/query/data/storage/console`；API base 和 token 后 8 位脱敏 | 无阻塞 console 错误；接口状态和 UI 状态一致；不能用本地 API 拒绝连接写通过 | 对应页面退回前端/接口联调 |

##### 12.7.15.6 当前状态与下一步

当前 UI/UX 状态：`blocked / P0 双主线纠偏已定义 / 待前端与接口联调实现证据`。不得写全量通过。

下一步责任：

| 责任角色 | 任务点 | UI/UX 需要的证据 |
| --- | --- | --- |
| 前端 | `PR-FE-DUAL-FLOW-ACCOUNTING-014`：补首页、记录页、当前聚会页账本入口；保留 table-mode 或等效账本页；重做分享页/保存图联合展示 | 改动文件清单、页面路径、预览框截图、data 摘要、保存图截图 |
| 后端/API | `PR-BE-DUAL-FLOW-SHARE-CONTRACT-014`：给分享页提供照片墙、账本高光、关键事件、聚会总结字段或明确复用合同 | 字段清单、示例响应、过滤规则、无数据兜底 |
| 接口联调 | `PR-INT-DUAL-FLOW-FIXTURE-014`：提供带照片和账本的固定样本 | sessionId、inviteCode、photo/moment IDs、accounting event IDs、share task、脱敏摘要 |
| 测试 | `PR-QA-DUAL-FLOW-SHARE-014`：按 12.7.15.5 跑预览框矩阵 | 命令原文、截图、page/data/storage/console 摘要、保存图路径或 PNG 原图 |
| UGC 风控 | `PR-UGC-DUAL-FLOW-SHARE-014`：确认照片和账本摘要公开分享过滤 | 私密/待审/隐藏/敏感账本备注反例与过滤结论 |
| UI/UX | 收到实现截图后复核 P0/P1 退回码；如字段合同稳定，再生成 3 张分享页/保存图单屏目标图 | 当前不新增 bitmap；下一轮可按 `imagegen-frontend-mobile` 生成 `dual-flow-share` 目标图 |

#### 12.7.16 `PR-UX-SHARE-FLOW-SKILL-PAGES-015` SKILL 生成分享流程设计包

记录时间：2026-06-17。PM 加急补充 P0：用户要求 UI/UX 通过 SKILL 生成“酷炫分享流程相关页面”，并让前端、接口联调、测试、UGC 配合实现。本节在 `PR-UX-DUAL-FLOW-SHARE-014` 基础上执行，只修改 UI/UX 计划和设计资产；不修改业务源码、不修改 PM 总台账、不替测试写通过。

执行状态：`已生成设计包 / 待前端实现 / 待接口样本 / 待预览框证据`。本节不代表实现通过。

##### 12.7.16.1 SKILL 选择与使用记录

| SKILL | 使用方式 | 选择理由 | 输入 prompt 摘要 | 输出 / 边界 | 证据缺口 |
| --- | --- | --- | --- | --- | --- |
| `imagegen-frontend-mobile` | 作为移动端多屏视觉目标图生成口径 | 本任务需要 5 个移动端页面/状态，要求酷炫、app-native、层级清楚、适合前端复刻 | “聚会记录师”；`Trendy Ledger Wall`；聚会/酒局/朋友/桌面/碰杯/账本高光/照片回忆；拍照记录 + 酒桌记账双主线；分享页融合照片墙、账本、事件、总结；避免旧判官惩罚压迫感 | 已生成 5 张 853x1844 PNG 目标图；只作视觉目标和结构参考，不作为源码实现截图 | 缺真实照片墙、账本高光、关键事件、聚会总结和保存 PNG 原图证据 |
| `imagegen` | 调用图像生成工具产出 raster 设计资产，并复制到项目目录 | PM 明确要求不要只写文字方案，需要可交给前端和测试的图片资产 | 分别生成分享入口、分享预览、保存海报、保存状态、分享回流查看 5 个页面/状态 | 输出到 `docs/design-assets/party-recorder/share-flow-015/`；不建议整图入小程序包 | 仍需前端用原生组件复刻，测试用微信开发者工具右侧预览框证明 |
| Product Design / `design-taste-frontend` 口径 | 只吸收“非模板、流程优先、字段真实、可读性优先”的设计判断 | 当前已有产品上下文和本地计划，不需要另建 Figma 或写代码实现 | 双入口 IA、分享页不是普通列表、保存图必须可传播 | 作为规格约束写入本节，不调用业务源码 | 需等实现截图复核是否落地 |

##### 12.7.16.2 设计资产清单

资产目录：`docs/design-assets/party-recorder/share-flow-015/`。同目录 README 已记录生成时间、SKILL、prompt 摘要、使用边界和证据缺口。

| 序号 | 资产路径 | 尺寸 | 大小 | 覆盖页面 / 状态 | 使用方式 |
| --- | --- | --- | --- | --- | --- |
| 1 | `docs/design-assets/party-recorder/share-flow-015/pr-ux-share-flow-015-01-share-entry-panel.png` | 853x1844 | 1683.1KB | 分享入口页 / 当前聚会分享面板：拍照记录 + 聚会账本并列高光 | 前端复刻结构、层级和视觉氛围，不整图入包 |
| 2 | `docs/design-assets/party-recorder/share-flow-015/pr-ux-share-flow-015-02-share-preview-fusion.png` | 853x1844 | 1814.3KB | 分享预览页：照片墙、欠酒/已喝、关键事件、榜单高光、聚会总结融合 | 作为 `share-preview/share-poster` P0 目标图 |
| 3 | `docs/design-assets/party-recorder/share-flow-015/pr-ux-share-flow-015-03-save-poster-vertical.png` | 853x1844 | 1935.5KB | 保存截图/海报页：竖版可保存图片，照片墙 + 账本高光 + 事件 + 房间码/二维码 | 作为 canvas/海报保存区域结构参考 |
| 4 | `docs/design-assets/party-recorder/share-flow-015/pr-ux-share-flow-015-04-save-state-retry.png` | 853x1844 | 1556.3KB | 保存成功 / 保存失败 / 权限失败 / 重试状态 | 作为状态表达和错误恢复参考 |
| 5 | `docs/design-assets/party-recorder/share-flow-015/pr-ux-share-flow-015-05-share-return-view.png` | 853x1844 | 1466.8KB | 分享回流查看页：外部/成员打开后的可见范围和行动入口 | 作为回流页公开范围与 CTA 参考 |

##### 12.7.16.3 前端可执行页面规格

| 页面 / 状态 | 页面结构 | 必需字段 | 视觉与动效方向 | 退回码 |
| --- | --- | --- | --- | --- |
| 分享入口页 / 当前聚会分享面板 | 顶部当前聚会摘要；并列高光卡：`拍照记录`、`聚会账本`；底部 CTA：生成酷炫分享页；次级 CTA：继续拍照、记一笔 | `sessionName`、`photoCount`、`ledgerCount`、`lastPhotoAt`、`accountingHighlights`、`shareReadyStatus` | 轻深色舞台 + 暖桌面光；照片卡有拍立得边，账本卡用霓虹数字条；面板上滑进入 | `PR-FE-SHARE015-P0-ENTRY-DUAL-MISSING` |
| 分享预览页 | 主视觉照片墙；账本高光 strip；关键事件 3 条以内；榜单/高光；一句聚会总结；保存/分享按钮 | `photoHighlights[]`、`accountingHighlights.debtCups/drunkCups/addWineCount/ledgerCount`、`keyEvents[]`、`topHighlight`、`shareSummary` | `Trendy Ledger Wall`：珊瑚橙 CTA、薄荷绿安全提示、蓝色账本数字、少量星形/贴纸动效 | `PR-FE-SHARE015-P0-PREVIEW-FUSION-MISSING` |
| 保存截图/海报页 | 竖版 poster 区；海报内含标题、照片拼贴、账本高光、事件、二维码/房间码安全区；保存按钮在 poster 外 | `posterTitle`、`posterImagePath`、`inviteCode`、`qrCodeUrl`、`visibilityNotice`、全部分享聚合字段 | 建议最终保存图目标 `1080x1920` 或沿现有 canvas 比例；二维码/房间码保留干净浅底安全区 | `PR-FE-SHARE015-P0-POSTER-NOT-COOL` |
| 保存成功 / 保存失败 / 重试 | 海报缩略图；状态标题；权限失败、生成失败、网络失败分支；重试、打开设置、重新生成、继续分享 | `shareTask.status`、`errorReason`、`posterImagePath`、`permissionStatus` | 成功用高光完成态；失败不只 toast，页面内必须可恢复；按钮保持可点安全区 | `PR-FE-SHARE015-P0-SAVE-STATE-MISSING` |
| 分享回流查看页 | 公开范围提示；聚会摘要；照片墙预览；账本摘要；行动入口：加入聚会、查看相册、打开账本摘要、反馈/举报 | `viewerRole`、`visibilityScope`、`allowedActions[]`、`publicPhotoHighlights[]`、`publicAccountingSummary` | 外部访问更克制，强调可见范围；成员访问可展示更多入口；不能泄露私密照片和敏感备注 | `PR-FE-SHARE015-P0-RETURN-SCOPE-MISSING` |

通用切图/组件建议：

- 不建议整张 PNG 入包；前端用原生 WXML/WXSS/canvas 复刻。
- 可拆组件：照片墙 frame、账本数字条、事件 chip、榜单 badge、二维码安全块、保存状态 icon。
- 当前 PNG 为目标图尺寸 `853x1844`；小程序保存海报建议导出 `1080x1920` 或与现有分享 canvas 保持同等清晰度。
- 动效只做轻量：分享面板上滑、照片墙 stagger fade、账本数字 count-up、保存完成 shimmer；不得影响首屏拍照效率。

##### 12.7.16.4 字段映射与接口样本需求

前端不得用假数据写通过。接口联调至少提供 1 个固定样本：3 张以上可公开照片、2 条以上账本记录、3 条以内关键事件、可生成分享任务和保存图。

| UI 字段 | 来源建议 | 缺失兜底 |
| --- | --- | --- |
| `sessionName`、`startedAt`、`dateText`、`memberCount` | session / room | 显示“这场聚会”，但不能空标题 |
| `photoHighlights[]` | moments / album public photos | 展示“还没有公开照片，先拍第一张”，并保留拍照 CTA |
| `accountingHighlights` | table-mode / ledger / accounting summary | 展示“账本还没开始，先记一笔”，并保留账本 CTA；不得隐藏模块 |
| `keyEvents[]` | moment events / ledger events / system highlights | 缺失时展示 1 条“聚会已创建”，但测试不能据此判联合分享完成 |
| `topHighlight`、`rankingHighlights[]` | highlights / rankings | 可为空，但不能挤压照片墙和账本主模块 |
| `shareSummary` | brief / AI summary / rule summary | 缺失时用规则摘要；不得出现旧“判官裁判”主文案 |
| `inviteCode`、`qrCodeUrl` | share task / room invite | 缺失则保存图只能标记待接口联调，不得写通过 |
| `visibilityNotice`、`allowedActions[]` | UGC / privacy / viewer role | 必须明确公开范围；外部访问不得暴露私密内容 |

##### 12.7.16.5 前端退回码补充

| 退回码 | 分级 | 触发条件 | 责任角色 |
| --- | --- | --- | --- |
| `PR-FE-SHARE015-P0-ASSET-NOT-FOLLOWED` | P0 | 分享流程实现与 5 张目标图的核心结构明显不一致，仍像普通列表或旧邀请壳 | 前端 + UI/UX |
| `PR-FE-SHARE015-P0-ENTRY-DUAL-MISSING` | P0 | 分享入口页/当前聚会分享面板没有拍照记录 + 聚会账本并列高光 | 前端 |
| `PR-FE-SHARE015-P0-PREVIEW-FUSION-MISSING` | P0 | 分享预览页未融合照片墙、账本高光、关键事件、聚会总结 | 前端 + 后端/API |
| `PR-FE-SHARE015-P0-POSTER-NOT-COOL` | P0 | 保存图只是普通列表截图、空壳或旧口令海报 | 前端 |
| `PR-FE-SHARE015-P0-SAVE-STATE-MISSING` | P0 | 保存成功/失败/权限失败缺页面内状态与重试入口 | 前端 |
| `PR-FE-SHARE015-P0-RETURN-SCOPE-MISSING` | P0 | 分享回流查看页没有公开范围、角色可见性或行动入口 | 前端 + UGC |
| `PR-FE-SHARE015-P1-QR-SAFE-AREA` | P1 | 二维码、房间码、保存按钮被贴纸/背景/照片遮挡或对比不足 | 前端 |
| `PR-FE-SHARE015-P1-MOTION-STATE` | P1 | 动效导致主要按钮不可点、布局跳动、低端机卡顿或文字遮挡 | 前端 |

##### 12.7.16.6 测试接收矩阵

| 接收项 | 预览框证据 | data/storage/console 证据 | 通过口径 | 退回码 |
| --- | --- | --- | --- | --- |
| 分享入口页双高光 | 当前聚会分享面板截图，能看到拍照记录与聚会账本并列 | `photoCount`、`ledgerCount`、`shareReadyStatus` | 两条主线都可见可点，且不阻塞继续拍照 | `PR-FE-SHARE015-P0-ENTRY-DUAL-MISSING` |
| 分享预览融合 | `share-preview` 截图覆盖照片墙、账本高光、事件、总结、按钮 | `photoHighlights[]`、`accountingHighlights`、`keyEvents[]`、`shareSummary` | 四类内容同屏或连续视口可见，非空壳 | `PR-FE-SHARE015-P0-PREVIEW-FUSION-MISSING` |
| 保存海报酷炫度 | 保存页截图 + 生成后海报预览；能取 PNG 原图则附路径 | `posterImagePath`、`inviteCode`、`qrCodeUrl`、保存结果 | 海报不是普通列表截图，二维码/房间码清楚，照片和账本共同出现 | `PR-FE-SHARE015-P0-POSTER-NOT-COOL` |
| 保存状态恢复 | 成功、权限失败、生成失败/网络失败至少覆盖 2 类失败分支 | `shareTask.status`、`errorReason`、权限状态 | 页面内有明确原因和重试/打开设置/重新生成入口 | `PR-FE-SHARE015-P0-SAVE-STATE-MISSING` |
| 分享回流查看 | 外部 visitor 与成员 member 两类进入截图 | `viewerRole`、`visibilityScope`、`allowedActions[]` | 可见范围清楚；外部不泄露私密，成员能回到相册/账本/加入 | `PR-FE-SHARE015-P0-RETURN-SCOPE-MISSING` |
| 控制台与本地 API | 每条自动化保留 `npm.cmd run wechat:auto -- ...` 命令原文 | console 无阻塞错误；storage/query 与页面一致 | 本地 API 拒绝连接、字段缺失、保存失败不能写通过 | 对应 P0/P1 |

##### 12.7.16.7 下一步责任拆解

| 顺序 | 责任角色 | 任务点 | UI/UX 接收物 |
| --- | --- | --- | --- |
| 1 | 后端/API + 接口联调 | 提供固定样本与字段合同：照片墙、账本高光、关键事件、聚会总结、二维码/房间码、可见范围 | 示例响应、固定 `sessionId` / `inviteCode`、清理方式 |
| 2 | 前端 | 按设计包先实现分享入口页/当前聚会分享面板双高光 | 预览框截图、页面路径、data 摘要 |
| 3 | 前端 | 实现分享预览融合页，确保照片墙和聚会账本共同展示 | `share-preview` 截图、字段映射说明 |
| 4 | 前端 | 实现保存海报 canvas/图片保存页，目标 `1080x1920` 或等效清晰度 | 保存图预览、`posterImagePath`、二维码/房间码可读证据 |
| 5 | 前端 | 实现保存成功/失败/权限失败/重试状态 | 状态截图、错误分支触发方式 |
| 6 | 前端 + UGC | 实现分享回流查看页和公开范围过滤 | visitor/member 对比截图、过滤反例 |
| 7 | 测试 | 按 12.7.16.6 跑微信开发者工具右侧预览框矩阵 | 命令原文、截图、page/data/storage/console 摘要 |

当前 blocked 项：

- 缺带照片 + 账本的接口固定样本，UI/UX 只能交目标图与字段合同，不能写实现通过。
- 缺前端按 5 张目标图复刻后的右侧预览框截图。
- 缺保存图 PNG 原图与预览框一致性证据。
- 缺 UGC 对公开照片、私密照片、敏感账本备注的过滤反例。
- 生成图中的微小文字只作为视觉参考，最终上线文案必须由前端原生文本渲染并通过可读性复核。

#### 12.7.17 `PR-UX-SHARE-FLOW-IMPLEMENT-015-REVIEW` 前端实现截图复核登记

记录时间：2026-06-17。PM 新派 UI/UX 复核：前端 `PR-FE-SHARE-FLOW-IMPLEMENT-015` 已回报源码实现和测试路径/selector，UI/UX 需基于实现截图或测试预览框截图，对照 12.7.16 的 5 张目标图复核。本节只更新 UI/UX 计划，不修改业务源码、不修改前端/测试计划、不修改 PM 总台账、不替测试写通过。

##### 12.7.17.1 已读取证据

| 来源 | 读取结论 | UI/UX 判定 |
| --- | --- | --- |
| UI/UX 12.7.16 | 已定义 5 张目标图、`Trendy Ledger Wall` 视觉方向、字段映射、退回码和测试矩阵 | 作为本轮复核基线 |
| 前端计划 14.30 | 前端回报 `share-poster`、`share-preview`、`session-brief` 已实现；提供路径、selector 和 data 字段 | 只证明实现包与 selector 口径已出现，不等同视觉验收通过 |
| 测试计划 13.16.41 | 测试侧仍登记 `前端实现待回包 / 待复测 / 不写通过`，命令均为待执行模板 | 未看到 015 预览框复测结果 |
| `docs/runtime` 截图目录 | 未发现 `pr-qa-share-015-*`、`poster-ready`、`save-success`、`save-failed-retry`、`shared-view` 等 015 实现截图 | 当前只能写 `待截图复核` |
| 源码只读索引 | `share-poster/index.wxml` 已出现 `.poster-stage-primary`、`.poster-state-card-*`、`.poster-return-card`；`share-preview/index.wxml` 已出现 `.share-fusion-summary`；`share-poster/index.less` 已出现 `.poster-flow-015` 命名空间 | 可作为测试 selector 起点，但不能替代右侧预览框截图 |

##### 12.7.17.2 SKILL 使用记录

| SKILL | 选择理由 | 使用边界 | 证据缺口 |
| --- | --- | --- | --- |
| `web-design-guidelines` | 本轮是 UI/UX 复核，需要按可读性、焦点/触控、内容溢出、安全区、状态表达和图片尺寸等规则检查截图与页面实现 | 只作为评审和退回分级口径；不生成资产、不写代码、不替测试跑通过 | 缺右侧预览框截图，因此只能形成待复核项，不能给视觉通过结论 |

##### 12.7.17.3 当前复核结论

当前状态：`待截图复核 / 不写通过`。

原因：

- 前端 14.30 已给路径、selector 和 data 字段，但 UI/UX 尚未收到 015 实现截图、测试预览框截图、保存 PNG 原图或失败/重试状态截图。
- 测试 13.16.41 仍是命令模板和待执行状态，未给出 `summary.page`、关键 data、storage、Console/Network 摘要。
- 缺截图时无法判断酷炫程度、照片墙与聚会账本权重、二维码/房间码安全区、保存按钮遮挡、回流查看层级、文字越界或旧样式框残留。

##### 12.7.17.4 收到截图后的退回码判定表

| 复核项 | P0 退回 | P1 退回 | P2 退回 | 必需证据 |
| --- | --- | --- | --- | --- |
| 酷炫程度贴近 5 张目标图 | `PR-FE-SHARE015-P0-ASSET-NOT-FOLLOWED`：仍是普通白卡列表、旧邀请壳或旧战报框 | `PR-FE-SHARE015-P1-VISUAL-ENERGY-WEAK`：结构齐但缺照片/账本视觉高光，分享页传播感不足 | `PR-FE-SHARE015-P2-DETAIL-POLISH`：贴纸、间距、按钮文案细节不够精致 | `share-poster` ready 截图、目标图对照 |
| 照片墙与聚会账本权重 | `PR-FE-SHARE015-P0-PREVIEW-FUSION-MISSING`：只剩照片或只剩账本，未共同展示 | `PR-FE-SHARE015-P1-LEDGER-WEIGHT-LOW`：账本存在但字号/位置弱到不可感知 | `PR-FE-SHARE015-P2-METRIC-LABEL`：指标命名不统一或单位弱 | `photoHighlights`、`accountingHighlights` data + 截图 |
| 保存海报安全区 | `PR-FE-SHARE015-P0-POSTER-NOT-COOL` 或 `PR-FE-SHARE015-P0-POSTER-UNREADABLE`：海报空壳、二维码/房间码不可读、保存按钮被遮挡 | `PR-FE-SHARE015-P1-QR-SAFE-AREA`：二维码/房间码安全区偏紧或对比不足 | `PR-FE-SHARE015-P2-POSTER-SPACING`：边距/贴纸/阴影需微调 | 保存海报截图 + `posterImagePath` 或 PNG 原图 |
| 保存成功/失败/重试状态 | `PR-FE-SHARE015-P0-SAVE-STATE-MISSING`：失败只 toast、无重试/打开设置/重新生成入口 | `PR-FE-SHARE015-P1-STATE-RECOVERY-WEAK`：状态存在但原因或下一步不清楚 | `PR-FE-SHARE015-P2-STATE-COPY`：文案可优化 | success、failed、retrying 至少 2 类状态截图 + `saveState/errorText` |
| 分享回流查看页层级 | `PR-FE-SHARE015-P0-RETURN-SCOPE-MISSING`：无公开范围、角色视角或行动入口 | `PR-FE-SHARE015-P1-RETURN-HIERARCHY-WEAK`：入口有但相册/账本/加入权重混乱 | `PR-FE-SHARE015-P2-RETURN-MICROCOPY`：说明文案需更清楚 | visitor/member 截图 + `viewerRole/visibilityScope/allowedActions` |
| 元素不越界 | `PR-FE-SHARE015-P0-LAYOUT-OVERFLOW`：390 预览宽度出现主按钮、二维码、关键数字或标题被截断遮挡 | `PR-FE-SHARE015-P1-MOTION-STATE`：动效/滚动导致跳动、压住按钮或内容 | `PR-FE-SHARE015-P2-TEXT-WRAP`：局部长文案换行不优雅 | 390 必测，375/414 补测截图 |
| 旧样式框残留 | `PR-FE-SHARE015-P0-OLD-SHELL-REGRESSION`：仍显示旧“判官/惩罚/裁判”主心智或旧邀请海报壳 | `PR-FE-SHARE015-P1-OLD-CARD-RESIDUE`：局部旧白卡/厚边框破坏分享页一致性 | `PR-FE-SHARE015-P2-LEGACY-COPY`：非主位置旧词需替换 | 分享入口、预览、海报、回流查看截图 |

##### 12.7.17.5 下一步

测试侧请按前端 14.30.6 已给路径/selector 更新 13.16.41 命令中的占位符并执行右侧预览框矩阵，至少回收：

- `/pages/session-brief/index?sessionId=session-1781584503517-c033e9&briefId=brief-1781584503870-25d5edac`，selector `.brief-share-flow-entry`。
- `/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781685446105-ae6b6317`，selector `.poster-stage-primary`、`.poster-primary-action`、`.poster-return-card`。
- `/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781584504132-3251bd01`，selector `.poster-state-card-warn`、`.poster-state-action`。
- `/pages/share-preview/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T`，selector `.share-fusion-summary`。

UI/UX 收到截图后只做视觉/交互复核和退回码关闭，不写测试通过；缺 `share-poster` ready、failed/retry、`share-preview` 融合、回流查看截图时，本任务继续保持 `待截图复核`。

#### 12.7.18 `PR-UX-SHARE-FLOW-ASSET-SPEC-020` 分享流程前端可执行资产规格

记录时间：2026-06-17。PM 最新门禁要求：分享页和分享截图保存仍为当前最重要页面，酒桌记账 / 聚会账本必须与拍照流程并存并共同导出分享；前端不得沿用旧框架或旧样式框。本节基于 `docs/design-assets/party-recorder/share-flow-015/` 五张目标图补前端可执行规格，只修改 UI/UX 计划和资产清单，不修改业务源码、PM 总台账或测试结论。

已读取证据：

| 来源 | 结论 |
| --- | --- |
| `AGENTS.md` | UI/UX 只能改自身计划和资产，必须记录 SKILL、资产路径、尺寸、用途、压缩和前端接入方式 |
| PM 总进度 2026-06-17 最新记录 | 当前 DevTools 停在 `share-poster` ready 路径，Console `[]`，但仍未达到 015 目标图 1:1 复刻和成员态 ready 图闭环；新增 020 门禁 |
| 队列 `PR-UX-SHARE-FLOW-ASSET-SPEC-020` | 要求字体/字重、色板、背景、贴纸、组件、按钮、保存状态、安全区、切图和 1:1 退回码 |
| UI/UX 12.7.16 | 五张目标图、`Trendy Ledger Wall` 视觉方向、双主线字段和 015 退回码继续作为基线 |
| `share-flow-015` 五张目标图 | 目标视觉为暗色酒桌舞台、拍立得照片墙、账本霓虹数字条、纸质账本/海报、星星/胶带/手绘下划线、二维码浅底安全区 |

##### 12.7.18.1 SKILL 使用记录

| SKILL | 选择理由 | 使用边界 | 本轮输出 |
| --- | --- | --- | --- |
| `imagegen-frontend-mobile` | 020 是对 015 移动端多屏目标图做可执行拆解，需保持 app-native、多屏一致、强图像叙事、可读、安全区明确、非模板化 | 本轮不再生成新整页图；只把既有 015 目标图转成 token、组件、切图和退回码 | `ASSET_SPEC_020.md`、6 个 SVG 贴纸/装饰源文件、UI/UX 计划规格 |

##### 12.7.18.2 输出资产与资产清单

规格文件：`docs/design-assets/party-recorder/share-flow-015/ASSET_SPEC_020.md`。

新增可选入包 SVG 源文件目录：`docs/design-assets/party-recorder/share-flow-015/cuts/`。

| 资产 | 尺寸 | 格式 | 压缩 | 建议入包路径 | 用途 |
| --- | --- | --- | --- | --- | --- |
| `pr-share020-sticker-starburst.svg` | 96x96 | SVG | 原样，建议 gzip | `miniprogram/assets/party-recorder/share-flow/pr-share020-sticker-starburst.svg` | 星星笑脸贴纸 |
| `pr-share020-sticker-sparkle-coral.svg` | 96x96 | SVG | 原样，建议 gzip | `miniprogram/assets/party-recorder/share-flow/pr-share020-sticker-sparkle-coral.svg` | 珊瑚闪光 |
| `pr-share020-sticker-tape-mint.svg` | 180x58 | SVG | 原样，建议 gzip | `miniprogram/assets/party-recorder/share-flow/pr-share020-sticker-tape-mint.svg` | 薄荷胶带 |
| `pr-share020-ledger-badge.svg` | 112x112 | SVG | 原样，建议 gzip | `miniprogram/assets/party-recorder/share-flow/pr-share020-ledger-badge.svg` | 账本徽章 |
| `pr-share020-underline-coral.svg` | 320x54 | SVG | 原样，建议 gzip | `miniprogram/assets/party-recorder/share-flow/pr-share020-underline-coral.svg` | 手绘下划线 |
| `pr-share020-shield-mint.svg` | 96x96 | SVG | 原样，建议 gzip | `miniprogram/assets/party-recorder/share-flow/pr-share020-shield-mint.svg` | 隐私安全提示 |

无需新增字体文件：前端使用系统字体栈 `-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif`，避免授权和包体风险。

##### 12.7.18.3 前端执行规格摘要

完整规格见 `ASSET_SPEC_020.md`，核心约束如下：

| 类型 | 规格 |
| --- | --- |
| 字体/字重 | 海报主标题 52-64rpx / 800-900；大数字 64-96rpx / 800-900；按钮 30-36rpx / 700-800；辅助标签 20-24rpx，不承载关键字段 |
| 色板 | 暗底 `#090705/#1A100B`，纸面 `#FFF4DE`，主 CTA 珊瑚 `#FF5A3D`，安全/成功薄荷 `#63DFAE`，账本蓝 `#3C8DFF`，加酒/星星琥珀 `#FFC75A` |
| 背景 | 暗色酒桌/聚会灯光 + 轻噪点；无图时用 CSS 径向渐变；不把 015 整页 PNG 当背景 |
| 照片墙 | 4-6 张拍立得，单张 128-180rpx 宽，白边 8-12rpx，旋转不超过 6deg，主体不可裁断 |
| 账本组件 | 欠酒/已喝/加酒/账本或人均 3-4 项并列，条高 150-190rpx，数字 64rpx+，权重不低于照片墙 |
| 按钮 | 主按钮 coral 渐变，高 96-112rpx；按下缩放 0.98；加载不改变宽高；失败/重试必须保留页面内按钮 |
| 保存状态 | 成功 mint、权限失败 amber、生成失败 blue、保存失败 coral；不能只 toast |
| 保存图安全区 | 推荐 `1080x1920` PNG；二维码 >= 180x180px 且 24px 浅底留白；房间码字高 >= 64px；保存按钮不进入导出海报 |

##### 12.7.18.4 1:1 对照退回码

| 退回码 | 分级 | 触发条件 |
| --- | --- | --- |
| `PR-FE-SHARE020-P0-OLD-SHELL` | P0 | 分享页/保存图仍沿用旧白卡、旧邀请壳、旧战报框，未形成照片 + 账本融合视觉 |
| `PR-FE-SHARE020-P0-DUAL-HIGHLIGHT-MISSING` | P0 | 分享入口或预览未同时突出拍照记录与聚会账本 |
| `PR-FE-SHARE020-P0-PHOTO-WALL-MISSING` | P0 | 没有照片墙/照片高光，或照片区域只显示空壳且无明确拍照 CTA |
| `PR-FE-SHARE020-P0-LEDGER-STRIP-MISSING` | P0 | 欠酒/已喝/账本条数等账本高光缺失或被弱化到不可见 |
| `PR-FE-SHARE020-P0-POSTER-SAFE-AREA` | P0 | 保存海报二维码、房间码、标题、保存安全提示不可读或被遮挡 |
| `PR-FE-SHARE020-P0-STATE-RECOVERY-MISSING` | P0 | 保存成功/权限失败/生成失败/重试态缺页面内恢复入口 |
| `PR-FE-SHARE020-P1-TYPOGRAPHY-SCALE` | P1 | 字体层级未按规格，大数字、标题和正文权重混乱 |
| `PR-FE-SHARE020-P1-STICKER-OVERUSE` | P1 | 贴纸/光效过多，遮挡内容或造成廉价感 |
| `PR-FE-SHARE020-P1-EVENT-HIERARCHY` | P1 | 关键事件超过 3 条或时间线挤压照片墙/账本主模块 |
| `PR-FE-SHARE020-P2-MICRO-POLISH` | P2 | 间距、阴影、圆角、文案细节与目标图仍有轻微差距 |

##### 12.7.18.5 阻塞与下一步协作

当前 UI/UX 状态：`020 规格已补 / 待前端 1:1 实现 / 待成员态样本 / 不写通过`。

- 前端：恢复/替换线程后执行 `PR-FE-SHARE-FLOW-PIXEL-MATCH-020`，按 `ASSET_SPEC_020.md` 和 015 目标图复刻 `share-poster/share-preview/session-brief`，不得整图贴 PNG、不得造数据。
- 接口联调：恢复/替换 019 线程后补样本成员 storage，让 ready 成员态能验证真实照片、账本、ready 图和保存流程。
- 测试：执行 `PR-QA-DEBUGGER-CONSOLE-WATCH-020`，每轮截图必须带 page/data/storage/console/network 摘要；无成员态 ready 图不得写通过。
- UGC：继续补公开范围、私密照片、待审内容和敏感账本备注过滤反例。

#### 12.7.19 `PR-UX-SHARE-FLOW-PIXEL-MATCH-020-REVIEW` 前端 14.33 像素复核

记录时间：2026-06-17。PM 新派 UI/UX 复核：对前端 `PR-FE-SHARE-FLOW-PIXEL-MATCH-020` / 前端计划 14.33 做 1:1 视觉接收或退回。本节只更新 UI/UX 计划，不改业务源码、PM 总台账、前端计划或测试结论；缺 QA 预览截图不得写设计通过。

##### 12.7.19.1 读取范围与证据

| 来源 | 读取结论 | UI/UX 判定 |
| --- | --- | --- |
| UI/UX 12.7.18 | 已定义 020 字体/色板/背景/贴纸/组件/按钮/安全区/退回码 | 作为本轮 1:1 复核基线 |
| `ASSET_SPEC_020.md` | 明确目标图不能整图入包，必须用真实照片 + 真实聚会账本 + 关键事件 + 总结渲染；保存图建议 `1080x1920`，二维码/房间码有安全区 | 14.33 必须按该规格接收 |
| 前端计划 14.33 | 前端声称 `share-poster/share-preview/session-brief` 已按 020 重做，并接入 6 个 SVG；但验证项仍写 `待执行 typecheck / encoding / diff check` | 不能作为 UI/UX 接收证据 |
| PM 队列 020 行 | `PR-FE-SHARE-FLOW-PIXEL-MATCH-020` 已被 PM 标记 `rejected`：`share-poster` WXML 207 行、LESS 1539 行，入口/预览/保存/回流连续堆叠，页面又长又厚，背景光效、排版与设计图不匹配；不得进入 QA/UIUX 接收，转前端 021 重做 | UI/UX 不接收 14.33 |
| PM 队列本任务行 | `PR-UX-SHARE-FLOW-PIXEL-MATCH-020-REVIEW` 先前为线程级阻塞；恢复后可基于源码/结构写待截图退回清单，不得写设计通过 | 本节补登记 |
| PM 020 截图 | `docs/runtime/pm-devtools-status-share-020-20260617.png` 只看到保存状态与回流查看厚卡堆叠，未见照片墙、账本霓虹条、海报舞台首屏 | 不能证明 015/020 贴近 |

##### 12.7.19.2 SKILL 使用记录

| SKILL | 选择理由 | 使用边界 |
| --- | --- | --- |
| `web-design-guidelines` | 本轮是 UI/UX 接收/退回，需要按安全区、内容溢出、状态反馈、长文案、触控、动效与可读性做复核 | 只作为评审和退回分级口径；不生成资产、不写代码、不替 QA 写通过 |
| `imagegen-frontend-mobile` | 015/020 目标图来自该移动端视觉方向，继续作为 1:1 视觉基线 | 本轮不生成新图；只对照五张目标图与 020 规格 |

##### 12.7.19.3 当前结论

当前状态：`退回 14.33 / 不接收 020 / 待 021 预览截图复核`。

不能写设计通过，原因：

- PM 队列已将前端 020 明确标记 `rejected`，且指出“又长又厚、连续堆叠、背景光效和排版不匹配”，这与 `ASSET_SPEC_020.md` 的短屏海报舞台和 015 五张目标图相冲突。
- 14.33 自身验证仍是 `待执行`，没有 typecheck、encoding、diff check 的前端最终证据。
- 当前没有 QA 020 预览框截图、page/data/storage/console/network 摘要，也没有保存 PNG 原图。
- PM 020 截图只显示状态堆叠，未证明照片记录 + 聚会账本首屏并存，也未证明保存图安全区和照片墙/账本霓虹条达标。

##### 12.7.19.4 接收/退回码

| 退回码 | 分级 | 触发证据 | 需前端补的页面 / selector / 状态 |
| --- | --- | --- | --- |
| `PR-FE-SHARE020-P0-OLD-SHELL` | P0 | PM 已退回 020：入口/预览/保存/回流连续堆叠，形成旧框架式厚页面；PM 截图中状态卡与回流卡堆叠感明显 | `/pages/share-poster/index?briefId=...&taskId=...`；`.poster-stage-primary`、`.poster-primary-action`、`.poster-return-card`；需 021 短屏海报舞台截图 |
| `PR-FE-SHARE020-P0-DUAL-HIGHLIGHT-MISSING` | P0 待截图确认 | PM 020 截图未露出照片记录 + 聚会账本双高光；14.33 仅文字说明有并存，缺预览证据 | `share-poster` ready 首屏；`session-brief` `.brief-share-flow-entry`；需截图证明照片与账本同权 |
| `PR-FE-SHARE020-P0-PHOTO-WALL-MISSING` | P0 待截图确认 | PM 020 截图未见拍立得照片墙；历史 018/QA 证据仍有 `photoHighlights=[]` 阻塞 | `share-poster` ready、`share-preview` `.share-fusion-summary`；需成员态真实照片或明确空态 + 拍照 CTA |
| `PR-FE-SHARE020-P0-LEDGER-STRIP-MISSING` | P0 待截图确认 | PM 020 截图未见欠酒/已喝/账本霓虹数字条；需 data 证明 `ledgerIncluded/accountingHighlights` 映射 | `share-poster` ready；data：`accountingHighlights`、`ledgerIncluded`、`taskLayoutMode` |
| `PR-FE-SHARE020-P0-POSTER-SAFE-AREA` | P0 待截图确认 | 当前无保存 PNG 原图；PM 020 截图只见保存状态，未见二维码/房间码安全区 | 保存图预览和 PNG 原图；需二维码、房间码、标题、隐私提示无遮挡 |
| `PR-FE-SHARE020-P0-STATE-RECOVERY-MISSING` | P0/P1 待截图确认 | PM 020 截图能看到失败/重试/成功状态，但堆叠过厚；需验证按钮可点、错误原因明确、状态不挤压海报 | `.poster-state-card-success`、`.poster-state-card-warn`、`.poster-state-card-blue`；状态 `saved/failed/retrying` |
| `PR-FE-SHARE020-P1-TYPOGRAPHY-SCALE` | P1 | PM 截图中状态卡文字和按钮权重接近，缺 015 目标图的大标题/大数字层级 | `share-poster` ready 首屏和状态 dock；需对照 020 字号/字重 |
| `PR-FE-SHARE020-P1-STICKER-OVERUSE` | P1 待截图确认 | 6 个 SVG 已入包且源码有引用，但当前截图未展示贴纸与内容关系；需确认不遮挡二维码/CTA | `share-poster`、`share-preview`、`session-brief` 三页截图 |
| `PR-FE-SHARE020-P2-MICRO-POLISH` | P2 待 021 后评 | 14.33 已被 P0 退回，细节 polish 暂不作为主要问题 | 021 通过 P0 后再评 |

##### 12.7.19.5 SVG / 字体 / 新资产判断

| 项目 | 当前判断 |
| --- | --- |
| 6 个 SVG 切图 | 前端计划 14.33 声称已接入，当前源码索引也能看到 `pr-share020-*.svg` 被 `share-poster/share-preview/session-brief` 引用；不缺元素图 |
| 字体 | 不需要新增字体。继续使用系统字体栈，避免授权和包体风险 |
| 新贴纸/背景图 | 当前不新增。问题不是缺贴纸，而是 14.33 结构和视觉节奏未贴近 015/020 |
| 后续可能新增 | 若 021 仍缺暗色酒桌氛围，可再补一张可压缩 WebP 背景纹理；当前先不生成，避免前端继续用图遮结构问题 |

##### 12.7.19.6 下一步

- 前端：不要继续交 14.33；按 PM 已触发的 `PR-FE-SHARE-FLOW-COMPACT-REBASE-021` 重做短屏海报舞台，保留 `.poster-stage-primary`、`.poster-primary-action`、`.poster-return-card`、`.share-fusion-summary`、`.brief-share-flow-entry` 供 QA。
- 测试：不要基于 14.33 写通过；等 021 回包后补 `share-poster` ready、failed/retry、`share-preview`、`session-brief` 的 390 预览截图和 page/data/storage/console/network 摘要。
- UI/UX：收到 021 截图后再对照 015 五张目标图和 020 规格做接收/退回；缺截图仍只能写 `待截图复核`。
- UGC / 接口联调：继续补成员态 storage、照片公开范围、账本摘要公开范围和保存 PNG 证据。

#### 12.7.20 `PR-UX-SHARE-FLOW-FIRST-SCREEN-022-REVIEW` 分享页首屏复核

记录时间：2026-06-17。PM 正式分派 UI/UX 复核：前端 022 已静态修复贴纸尺寸和首屏节奏，但 PM 当前右侧预览仍显示旧大贴纸画面，疑似 DevTools 预览未刷新；测试 `PR-QA-SHARE-FLOW-FIRST-SCREEN-022-RETEST` 待执行。本节只更新 UI/UX 计划，不改业务源码、PM 总台账或测试计划；缺刷新后截图不得写设计通过。

##### 12.7.20.1 读取范围与证据

| 来源 | 读取结论 | UI/UX 判定 |
| --- | --- | --- |
| `AGENTS.md` | UI/UX 只能改自身计划/资产；当前阶段以微信开发者工具右侧预览框为准；缺截图只能写待证据 | 本节不写通过 |
| UI/UX 12.7.18 / `ASSET_SPEC_020.md` | 规定暗色酒桌舞台、拍立得照片墙、聚会账本霓虹条、主 CTA、保存状态、安全区和 1:1 退回码 | 作为 022 复核基线 |
| 前端计划 14.35 | 前端只改 `share-poster/index.less` 和计划，声明贴纸缩小、首屏四要素可见；验证 `typecheck`、`check:encoding`、目标 diff check 通过 | 只证明静态修复，不等于视觉接收 |
| PM 队列 022 行 | `PR-FE-SHARE-FLOW-FIRST-SCREEN-022` 为 `static-verified`；PM 明确右侧预览仍显示旧大贴纸画面，判断可能未刷新或需 QA 复核；`PR-QA-SHARE-FLOW-FIRST-SCREEN-022-RETEST` 阻塞 | UI/UX 不能接收通过 |
| 现有截图 | `docs/runtime/wechat-devtools-preview.png`、`docs/runtime/pm-devtools-status-share-022-20260617.png`、`docs/runtime/pr-qa-share-flow-pixel-020-*.png` | 可作为退回/待刷新证据；不是明确命名的 022 retest 截图 |

##### 12.7.20.2 SKILL 使用记录

| SKILL | 选择理由 | 使用边界 |
| --- | --- | --- |
| `web-design-guidelines` | 本轮是视觉接收/退回，需按可读性、触控可达、内容溢出、状态表达、安全区和视觉层级复核 | 只做评审口径；不生成资产、不写代码、不替 QA 写通过 |
| `imagegen-frontend-mobile` | 015 五张目标图和 020 规格均源自移动端高质感分享流方向，继续作为首屏视觉基线 | 本轮不生成新图；只判断是否贴近目标图 |

##### 12.7.20.3 当前结论

当前状态：`退回 / 待正式 022 刷新后截图复核 / 不写设计通过`。

截图依据：

- `docs/runtime/wechat-devtools-preview.png`：仍显示旧大贴纸/星芒占据首屏，标题、照片墙、账本、CTA 被挤压或部分移出有效视口。
- `docs/runtime/pm-devtools-status-share-022-20260617.png`：照片记录和聚会账本可见，但照片为 `0`、账本为 `0`，分享图仍像入口壳层，不能证明共同导出分享。
- `docs/runtime/pr-qa-share-flow-pixel-020-poster-wide-20260617.png`：照片墙出现空白占位，聚会账本数字可见但事件区文字严重拥挤，CTA 勉强可见，状态区被挤到底部。
- `docs/runtime/pr-qa-share-flow-pixel-020-share-preview-wide-20260617.png`：浅色回流页有账本摘要，但照片高光缺失，页面右侧存在裁切风险。

##### 12.7.20.4 接收/退回码

| 退回码 | 分级 | 触发原因 | 前端需补页面 / selector / 状态 |
| --- | --- | --- | --- |
| `PR-FE-SHARE022-P0-FIRST-SCREEN-HERO-MISSING` | P0 | 首屏没有稳定同时展示标题、照片高光、聚会账本高光、保存/分享主动作和状态入口；现有截图仍有旧大贴纸或内容被挤到底部 | `/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452`；`.poster-stage-primary`、`.poster-primary-action`、`.poster-state-card-warn` |
| `PR-FE-SHARE022-P0-STICKER-DOMINATES` | P0 | `wechat-devtools-preview.png` 中星芒/贴纸仍成为主视觉，不是边角点缀 | `.poster-share020-sticker-star`、`.poster-share020-sticker-spark`、`.poster-share021-tape`；刷新后截图需证明贴纸最大只占角落装饰 |
| `PR-FE-SHARE022-P0-PHOTO-LEDGER-NOT-HERO` | P0 | 照片墙为空白或 0 张，账本虽有数字但未形成主视觉融合；分享图仍不够像“照片 + 账本共同导出” | `.poster-share021-photo-wall`、`.poster-share021-ledger`；data 需带 `photoHighlights/accountingHighlights/ledgerIncluded/taskLayoutMode` |
| `PR-FE-SHARE022-P1-EVENT-STRIP-OVERFLOW` | P1 | 现有截图关键事件区域出现纵向挤压、时间戳过长、文字截断/竖排风险 | `.poster-share021-event-strip`；最多 3 条，时间显示需短格式，长 ID 不得直接露出 |
| `PR-FE-SHARE022-P1-CTA-LOW-VISIBILITY` | P1 | CTA 在部分截图中位于首屏底部边缘，容易被导航/安全区压住 | `.poster-stage-primary`、`.poster-primary-action`；按钮需在 812 高度内完整可见 |
| `PR-FE-SHARE022-P1-SAFE-AREA-UNPROVEN` | P1 | 缺保存 PNG 原图和二维码/房间码截图，保存图安全区未成立 | 保存图预览、`posterImagePath/readyShareImageUrl`、二维码/房间码区域 |
| `PR-FE-SHARE022-P2-LIGHT-SCENE-WEAK` | P2 | 背景光效仍偏 CSS 光斑，酒桌/聚会氛围弱于 015 目标图 | 022 可先不阻塞；若 023 仍弱，UI/UX 补 WebP 背景纹理 |

##### 12.7.20.5 是否需要 UI/UX 补资产

| 资产 / 规格 | 当前判断 | 处理 |
| --- | --- | --- |
| 字体 | 不需要新增授权字体 | 继续系统字体栈 |
| 贴纸 | 不缺。6 个 SVG 已有，问题是贴纸尺寸/层级/刷新证据 | 前端控制尺寸和 z-index，UI/UX 暂不新增 |
| 背景光效 | 当前偏弱，但不是本轮 P0 根因；首屏结构先收敛 | 若 022/023 刷新后仍缺氛围，UI/UX 再补 `share020-stage-bg-1080x1920.webp` 背景纹理，建议小于 240KB |
| 照片墙边框 | 当前照片为空白占位，优先等成员态真实照片；不先补新图 | 前端需先证明真实 `photoHighlights[]` 或明确空态 |
| 二维码/保存安全区 | 020 已有规格，但缺实现截图 | 测试需补保存图原图和安全区截图 |
| 首屏构图基准图 | 前端 14.35 已说需要 UI/UX 基准图；本轮先以 015 五图 + 020 规格退回 | 如 022 刷新后仍混乱，UI/UX 再生成一张 812 高首屏构图基准图 |

##### 12.7.20.6 下一步责任

- 前端：确认 DevTools 是否加载 022 最新 WXSS；刷新后必须提交 `share-poster` 首屏 390 宽截图，证明贴纸为边角点缀、照片墙/账本/CTA/状态入口同屏可见。若仍是旧大贴纸，继续按 `PR-FE-SHARE022-P0-STICKER-DOMINATES` 修。
- 测试：执行 `PR-QA-SHARE-FLOW-FIRST-SCREEN-022-RETEST`，截图文件需明确带 `022` 命名，并记录 page/data/storage/console/network 摘要；缺刷新后截图时不得写通过。
- UI/UX：收到正式 022 retest 截图后再接收/关闭退回码；当前不写设计通过。
- 接口联调 / UGC：继续补成员态 storage、照片公开样本、账本公开摘要和保存图安全区证据。

#### 12.7.21 `PR-UX-SHARE-FLOW-FIRST-SCREEN-022-REVIEW` QA 有效截图复核

记录时间：2026-06-17。PM 继续派发：测试 `PR-QA-SHARE-FLOW-FIRST-SCREEN-022-RETEST` 已回包有效前台截图 `docs/runtime/pr-qa-share-flow-first-screen-022-retest-window-foreground-20260617.png`。本节只更新 UI/UX 计划，不改业务源码、PM 总台账或测试计划；本结论只覆盖分享页首屏视觉预览阶段。

##### 12.7.21.1 截图依据

| 证据 | UI/UX 观察 |
| --- | --- |
| `docs/runtime/pr-qa-share-flow-first-screen-022-retest-window-foreground-20260617.png` | 右侧预览已刷新到 `ready · dual_flow`；星芒/贴纸已缩为边角装饰；首屏可见标题、照片高光区、聚会账本/酒桌记账高光、保存成品图/保存聚会分享图主按钮和已生成状态入口 |
| 测试计划 13.16.47 | 测试结论为 `首屏可见性预览框确认 / 调试器仍待清理 / 不代表全链路或上线通过`；可视调试器仍有 warning / 计数，含 `showLoading 与 hideLoading 必须配对使用 index.ts:793` |
| UI/UX 12.7.18 / `ASSET_SPEC_020.md` | 首屏已基本符合“贴纸仅点缀、照片 + 账本并存、主按钮可达、状态入口可见”的最低接收要求；保存图安全区和全链路仍未覆盖 |

##### 12.7.21.2 接收结论

当前结论：`首屏视觉预览阶段接收 / 不代表全量页面设计通过 / 不代表上线通过`。

接收范围：

- `share-poster` 首屏视觉节奏：旧大贴纸主视觉问题已解除，贴纸回到边角点缀。
- 聚会/酒局基因：暗色舞台、照片卡、账本数字条和聚会高光语义已能表达“聚会记录师”的分享页方向。
- 双主线表达：照片高光和聚会账本/酒桌记账高光首屏并存，不再是单拍照线。
- 主动作：`保存成品图` / `保存聚会分享图` 两个主按钮首屏可见，可继续进入测试点击矩阵。
- 状态入口：已生成状态入口可见，满足首屏状态可达的视觉要求。

不得关闭的范围：

- Console / 调试器仍不清洁，不能写全链路或预览框阶段总通过。
- 保存 PNG 原图、二维码/房间码安全区、真机相册保存不在本次截图接收范围内。
- 回流页照片字段缺口、UGC 可见范围字段缺口仍沿用测试 13.16.46 / 13.16.47 的待修结论。
- `share-preview/session-brief` 全页面视觉一致性仍需后续截图矩阵复核。

##### 12.7.21.3 退回码处理

| 退回码 | 本轮处理 | 依据 |
| --- | --- | --- |
| `PR-FE-SHARE022-P0-FIRST-SCREEN-HERO-MISSING` | 首屏视觉预览阶段关闭 | QA 022 前台截图确认标题、照片高光、账本高光、主按钮、状态入口同屏可见 |
| `PR-FE-SHARE022-P0-STICKER-DOMINATES` | 首屏视觉预览阶段关闭 | QA 022 前台截图确认贴纸/星芒缩为边角点缀 |
| `PR-FE-SHARE022-P0-PHOTO-LEDGER-NOT-HERO` | 首屏视觉预览阶段关闭 | QA 022 前台截图确认照片区和账本区并列成为主视觉 |
| `PR-FE-SHARE022-P1-EVENT-STRIP-OVERFLOW` | 降级为待后续矩阵复核 | 本次有效截图重点在首屏，事件区未作为最终全页面接收 |
| `PR-FE-SHARE022-P1-CTA-LOW-VISIBILITY` | 首屏视觉预览阶段关闭 | 两个保存/分享主按钮在截图中清晰可见 |
| `PR-FE-SHARE022-P1-SAFE-AREA-UNPROVEN` | 保持待证据 | 缺保存 PNG 原图、二维码/房间码安全区证据 |
| `PR-FE-SHARE022-P2-LIGHT-SCENE-WEAK` | 暂不阻塞 | 当前氛围足以接收首屏；若后续全页面仍显弱，再补背景资产 |

##### 12.7.21.4 资产缺口

| 资产 / 规格 | 当前判断 | 下一步 |
| --- | --- | --- |
| 字体 | 不需要新增字体 | 继续系统字体栈 |
| 贴纸 | 不需要新增贴纸 | 6 个 SVG 已够用，当前问题已由尺寸/布局修复解决 |
| 背景/光效 | 暂不新增 | 首屏接收；若后续全页面或保存图仍缺氛围，再补 `share020-stage-bg-1080x1920.webp` |
| 保存图安全区 | 仍缺证据，不是缺资产 | 测试需补保存 PNG 原图、二维码/房间码安全区截图 |
| 首屏构图基准图 | 暂不新增 | 022 截图已满足首屏视觉预览阶段；后续若 023/全页面回退再生成 |

##### 12.7.21.5 下一步责任

- 前端：继续处理 `PR-FE-SHARE-FLOW-CONSOLE-CLEANUP-023`，优先修 `showLoading 与 hideLoading 必须配对使用 index.ts:793`；不得破坏 022 首屏布局。
- 测试：下一轮继续按 `PR-QA-DEBUGGER-CONSOLE-WATCH-020` 先查 Console / Network / storage，再覆盖保存 PNG、安全区、回流页和全链路矩阵。
- UI/UX：后续只复核新增截图中的全页面视觉一致性、保存图安全区、回流页层级，不再重复退回 022 首屏四要素。
- 接口联调 / UGC：继续补回流页照片高光字段、UGC 可见范围字段和公开/私密过滤反例。

#### 12.7.22 `PR-UX-SHARE-FLOW-FULL-PAGE-024-REVIEW` 全分享流程视觉矩阵

记录时间：2026-06-17。PM 派发 `PR-UX-SHARE-FLOW-FULL-PAGE-024-REVIEW`，本节只更新 UI/UX 计划与资产判断，不改业务源码、PM 总台账、测试计划、前端计划、后端/接口/UGC 文档；不得写全量设计通过或上线通过。

##### 12.7.22.1 SKILL 使用记录与读取依据

| 项目 | 记录 |
| --- | --- |
| 使用 SKILL | `web-design-guidelines`、`imagegen-frontend-mobile` |
| 选择理由 | `web-design-guidelines` 用于本轮视觉 QA 的长内容溢出、可点击状态、错误/重试反馈、图片尺寸、暗色安全区和移动端 safe area 口径；`imagegen-frontend-mobile` 作为 015 五张目标图的移动端高级视觉生成基线，约束首屏节奏、照片墙、暗色舞台、贴纸克制和可读层级 |
| 本轮不使用 / 不新增 | 不使用 `design-taste-frontend` 做新实现，因为本轮不改前端源码；不调用新 `imagegen`，因为现有 015 五张目标图、020 六个 SVG 切图和 `ASSET_SPEC_020.md` 已足够判断差距，当前缺口主要是前端布局/字段/截图证据，不是缺新概念图 |
| 读取依据 | UI/UX 12.7.18、12.7.21；测试 13.16.47、13.16.48；接口联调 3.30；前端计划 14.37；`docs/design-assets/party-recorder/share-flow-015/ASSET_SPEC_020.md`；PM 队列 022/023/024 行 |
| 证据边界 | 022 只接收 `share-poster` 首屏视觉预览阶段；023 Console 仍非全清洁；024 前端正在修 `share-preview` 照片高光与过滤字段消费，因此本节不能写全页面设计通过 |

##### 12.7.22.2 总结论

当前结论：`局部接收 / 全页面待实现截图复核 / 不写全量设计通过或上线通过`。

局部接收范围：

- `share-poster` 首屏沿用 12.7.21 结论：照片高光、聚会账本/酒桌记账高光、保存/分享主按钮、状态入口在 022 有效截图中同屏可见。
- 现有 015/020 资产规格仍可用：暗色酒桌舞台、拍立得照片墙、纸面账本、霓虹数字条、边角贴纸、浅色回流页方向不需要重做。

不得接收范围：

- 保存 PNG 原图、二维码/房间码安全区、相册保存成功/失败/重试状态仍缺完整截图与数据证据。
- `share-preview` 回流页在 024 前仍存在照片高光、可见范围字段和公开/私密过滤证据缺口。
- 全页面长度、事件区可读性、右侧裁切、旧框架残留需要 024 后刷新截图复核；不能用 022 首屏截图替代。
- Console / 调试器仍未形成 PM 可用的全链路清洁证据，UI/UX 不写全链路通过。

##### 12.7.22.3 全分享流程视觉准出 / 退回矩阵

| 页面 / 状态 | 当前 UI/UX 判断 | 接收口径 | 退回码 / 待证据 |
| --- | --- | --- | --- |
| `session-brief` 分享入口 | 待 024 后截图复核 | 分享入口必须同时提示照片记录与聚会账本，按钮可点，不能把记账藏进二级弱入口；入口区不应成为厚列表或旧卡片壳 | `PR-FE-SHARE024-P1-BRIEF-ENTRY-DENSITY`：若入口只剩单拍照线、按钮不明显、账本弱化或列表过厚则退回 |
| `share-poster` 入口首屏 | 022 首屏视觉预览阶段接收 | 不重复退回 022 已关闭四要素：贴纸已降为边角点缀，照片 + 账本并列成为主视觉，保存/分享主按钮首屏可见 | 保持 `PR-FE-SHARE022-P1-SAFE-AREA-UNPROVEN` 待证据；不写全页面接收 |
| `share-poster` 融合预览全页面 | 局部接收 + P1 退回 | 暗色酒桌舞台、照片墙、账本数字条方向成立；但事件区/长内容需保持横向可读，不能出现竖排挤压、右侧裁切或“又臭又长”的连续列表 | `PR-FE-SHARE024-P1-EVENT-STRIP-OVERFLOW`：关键事件卡文本竖排、时间戳过长、右侧内容被裁切、页面节奏过长时退回 |
| 保存图 / PNG 原图 / 安全区 | P0 待证据，不接收 | 保存海报应按 020：建议 1080x1920，底部二维码/房间码保留清晰浅色 quiet zone，QR 不小于 180px，房间码不小于 64px，关键文案不压到系统安全区 | `PR-FE-SHARE024-P0-SAVE-PNG-SAFE-AREA-MISSING`：缺 PNG 原图、缺二维码/房间码截图、缺保存后图片路径或关键元素压安全区则退回 |
| 保存成功 / 失败 / 重试 | 局部可见，待 024 后失败态截图 | 成功态要给保存路径/下一步分享动作；失败态要写明权限或网络原因和可执行重试；重试按钮不能被贴纸、底部栏或长文案遮挡 | `PR-FE-SHARE024-P1-STATE-RETRY-EVIDENCE`：缺失败态截图、错误文案无下一步、重试按钮不可达或同页排版仍溢出则退回 |
| `share-preview` 回流查看页 | P0 待 024 复测，不接收 | 外部/成员回流页必须同时展示照片高光、账本摘要、关键事件、聚会总结和可见范围提示；浅色回流页可以更轻，但不能退回旧普通列表 | `PR-FE-SHARE024-P0-RETURN-PHOTO-VISIBILITY-MISSING`：`photoHighlights=[]`、缺 `filteredNodeIds/visibleNodeIds/permissionState` 或照片/账本未并存则退回 |
| 旧框架 / 页面长度 / 背景光效 | 待全页面截图复核 | 020 暗色舞台和浅色回流页方向可继续；全页不得出现旧白卡壳、旧战报框、厚重纵向堆卡和大面积空壳截图 | `PR-FE-SHARE024-P1-OLD-SHELL-OR-LONG-PAGE`：024 后若仍见旧框架、页面过长、背景光效弱到不接近 015/020，则退回 |

##### 12.7.22.4 资产缺口与接入规格

| 资产 / 元素 | 当前判断 | 前端接入方式 / 规格 |
| --- | --- | --- |
| 现有 6 个 SVG 切图 | 足够，不新增 | 继续按 `ASSET_SPEC_020.md` 建议入包到 `miniprogram/assets/party-recorder/share-flow/`；贴纸只能作为边角点缀，不得覆盖主视觉 |
| 背景图 / 光效 | 暂不新增 | 先要求前端按 020 用暗色 CSS 渐变、酒桌照片虚化层和光效层还原；若 024 全页截图仍显平、旧或弱，再由 UI/UX 追加 `share020-stage-bg-1080x1920.webp`，目标 <= 240KB |
| 字体 / 字重 | 不新增字体 | 使用系统字体栈；标题 600/700，关键数字 700/800 并启用等宽数字口径，长中文使用 2 行内截断或换短文案 |
| 照片 + 账本融合组件 | 不缺资产，缺实现对齐 | 照片墙固定 4-6 张拍立得比例，账本数字条与照片墙同级；不得把账本变成底部小字或折叠入口 |
| 二维码 / 房间码安全区 | 不缺资产，缺证据 | 海报底部浅色安全区，QR >= 180px，四周浅色 quiet zone >= 24px，房间码字号 >= 64px；必须提供保存 PNG 原图或等比截图 |
| 保存状态图标 / 错误态 | 现有 SVG 足够 | 成功、失败、重试状态优先用现有徽章/星芒/账本图标组合；不新增贴纸，避免状态页又变成装饰主导 |

##### 12.7.22.5 前端下一步具体改法

- `session-brief`：补 024 后入口截图；入口文案和数据必须体现“拍照记录 + 聚会账本共同导出分享”，selector 建议继续暴露 `.brief-share-flow-entry`。
- `share-poster` 全页面：保留 022 首屏，不改已接收四要素；压缩关键事件为最多 3 个横向 chip 或短卡，时间用短格式，长文案 `line-clamp`，避免竖排、右侧裁切和连续厚卡。
- 保存图：产出并暴露 `posterImagePath` / `readyShareImageUrl` 或等价字段；补 PNG 原图/预览截图，证明 1080x1920 比例、QR/房间码安全区和主视觉不被系统区域遮挡。
- 状态页：补成功、失败、重试三态；失败文案需要包含权限/网络/生成失败的下一步，重试按钮保持主按钮样式和可达位置。
- `share-preview`：按前端 14.37 完成 `briefId` 场景的照片高光派生，保留账本高光、关键事件、聚会总结；暴露 `filteredNodeIds`、`visibleNodeIds`、`permissionState` 或明确字段缺口，不得用空数组假装通过。
- 旧样式清理：024 后任一截图若出现旧白卡壳、旧战报框、厚列表或普通列表截图感，按 `PR-FE-SHARE024-P1-OLD-SHELL-OR-LONG-PAGE` 退回。

##### 12.7.22.6 测试下一步截图 / query / selector

| 覆盖点 | 建议路径 / query | 需记录 selector / data |
| --- | --- | --- |
| 分享入口 | `/pages/session-brief/index?sessionId=session-1781584503517-c033e9&briefId=brief-1781584503870-25d5edac` | `.brief-share-flow-entry`；`shareTask`、`photoHighlights`、`accountingHighlights`、`keyEvents`、`shareSummary` |
| 分享海报 ready | `/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452` | `.poster-stage-primary`、`.poster-primary-action`、`.poster-return-card`；`ledgerIncluded`、`taskLayoutMode`、`readyShareImageUrl`、`posterImagePath`、`saveState` |
| 分享海报 failed/retry | `/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781584504132-3251bd01` | `.poster-state-card-warn`；`saveState`、`errorText`、`shareTask`、重试按钮可见性 |
| 回流查看页 | `/pages/share-preview/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T&briefId=brief-1781584503870-25d5edac` | `.share-fusion-summary`；`photoHighlights`、`accountingHighlights`、`keyEvents`、`shareSummary`、`shareContentFilter`、`filteredNodeIds`、`visibleNodeIds`、`permissionState` |
| 保存 PNG / 安全区 | 保存动作后的 PNG 原图或等比预览 | 图片尺寸、文件大小、QR/房间码像素区、底部安全区、Console / Network / storage 摘要 |

##### 12.7.22.7 其他角色证据缺口

- 测试：024 复测必须覆盖全页面滚动、保存 PNG、成功/失败/重试、回流页和 Console；缺截图时 UI/UX 只能写待截图复核。
- 接口 / 后端：按接口联调 3.30 决定公开 invite/live 是否返回安全的 `photoHighlights/shareContentFilter/eventHighlights/permissionState`；若仍只支持成员 brief，测试 query 必须显式带 `briefId`。
- UGC：补公开/私密照片、账本条目和关键事件的过滤反例，证明分享页没有泄露私密内容，也没有把公开照片误过滤为空。
- UI/UX：024 新截图回包后只复核全页面、保存图、回流页、失败态、长度和安全区；不重复退回 022 首屏已关闭问题。

#### 12.7.23 `PR-UX-SHARE-GENERATED-IMAGE-UI-MISMATCH-028-REDLINE` 生成 PNG 保存图 P0 红线

记录时间：2026-06-17。PM 派发 P0 `PR-UX-SHARE-GENERATED-IMAGE-UI-MISMATCH-028-REDLINE`。用户新截图：`C:/Users/Administrator/AppData/Local/Temp/codex-clipboard-c8f3c956-7144-4296-9787-68459be27cb9.png`。本节只更新 UI/UX 计划和退回码，不改业务源码、PM 总台账或测试结论。

##### 12.7.23.1 SKILL 使用记录与证据边界

| 项目 | 记录 |
| --- | --- |
| 使用 SKILL | `web-design-guidelines`、`imagegen-frontend-mobile` |
| 选择理由 | `web-design-guidelines` 用于保存图的内容溢出、长文本截断、图片空态、中文文案、状态安全区和底部裁切红线；`imagegen-frontend-mobile` 沿用 015/020 的移动端海报视觉基线，要求强图像叙事、照片墙、账本高光、可读层级和非模板感 |
| 使用边界 | 本轮是红线评审，不生成新 UI 图，不写前端实现；只判断保存 PNG 是否贴近 015/020，记录退回码和证据需求 |
| 依据 | `ASSET_SPEC_020.md` 第 2-10 节、UI/UX 12.7.18、UI/UX 12.7.22、PM 队列 028 行、用户保存图截图 |
| 当前结论边界 | 当前截图为“生成 PNG / 保存图”问题，不能用 022 首屏预览阶段接收覆盖；本轮结论为 P0 退回，不写全量设计通过或上线通过 |

##### 12.7.23.2 截图观察与目标差距

| 维度 | 当前截图问题 | 015/020 目标 | 分级 |
| --- | --- | --- | --- |
| 旧壳残留 | 顶部为旧红色战报壳，圆角红底、状态 chip 和整体结构都不像 015 暗色酒桌舞台 / 黑金海报 | 保存图应是暗色酒桌舞台 + 照片墙 + 账本霓虹条 + 纸片总结 + 二维码/房间码安全区 | P0 |
| 照片墙 | 中上部只有两个空白照片洞，大面积空白，无真实照片、无拍立得白边、无 4-6 张照片墙 | `photoHighlights[]` 应渲染 4-6 张真实/授权照片；无照片也必须给明确拍照 CTA 和有设计的空态，不得留白洞 | P0 |
| 聚会账本 | 账本模块被挤到底部，像普通浅色统计卡；数字权重低，没有霓虹条和主视觉地位 | 账本霓虹条需与照片墙同级，欠酒/已喝/加酒/账本 3-4 项并列，大数字 64rpx+ | P0 |
| 时间线 | 底部时间线被截断，只露出一条 `PR Seed Host...` 和内部字段片段；不符合 3 条以内关键事件节奏 | 关键时刻最多 3 条，单条 96-128rpx，标题/时间/图标可读，长文本必须截断或改短 | P0 |
| 总结 / 安全区 | 底部“聚会记录师 · 仅展示已授权公开内容”贴近裁切边缘，缺二维码/房间码安全区证据 | 保存 PNG 推荐 1080x1920；底部提示距边 >= 48px；QR >= 180px 且 24px 浅底留白，房间码字高 >= 64px | P0 |
| 字体 / 中文文案 | 右上外露英文 `dual_flow`；时间线外露内部样本名 `PR Seed Host`、`IT-MOMENTS-...`；副标题仍有旧“酒局”表达 | 面向用户统一“聚会记录师”；状态、样本名、内部 ID 和实现枚举不得进入保存图；空间紧张时用中文短标签 | P0 |
| 版面节奏 | 顶部拥挤，中段空，底部挤压；生成图既不是酷炫海报，也不是可分享总结 | 保存图必须是可转发海报，照片、账本、事件、总结形成一屏完整叙事 | P0 |

##### 12.7.23.3 P0 红线与退回码

当前结论：`生成 PNG / 保存图 P0 退回`。

| 退回码 | 分级 | 触发事实 | 责任方向 |
| --- | --- | --- | --- |
| `PR-FE-SHARE028-P0-GENERATED-PNG-OLD-SHELL` | P0 | 保存图仍出现旧红色战报壳 / 旧样式框，不是 015/020 暗色舞台海报 | 前端 + 后端/API 定位 PNG 来源，确认是否旧后端渲染器、前端 canvas fallback 或旧缓存 |
| `PR-FE-SHARE028-P0-PHOTO-WALL-EMPTY-HOLES` | P0 | 照片区为空白洞，未渲染真实照片墙，也无合格空态 | 前端消费 `photoHighlights[]`；后端/接口确认 ready PNG 数据源含授权照片 |
| `PR-FE-SHARE028-P0-LEDGER-HIGHLIGHT-DOWNGRADED` | P0 | 聚会账本被挤到底部普通卡片，未成为主视觉 | 前端按账本霓虹条重排，账本数字与照片墙同级 |
| `PR-FE-SHARE028-P0-TIMELINE-SAFE-AREA-CUT` | P0 | 时间线和底部安全提示被截断，保存图安全区不成立 | 前端重算 canvas/poster 高度与底部 safe area；测试补 PNG 原图尺寸和裁切证据 |
| `PR-FE-SHARE028-P0-USER-FACING-COPY-LEAK` | P0 | `dual_flow`、`PR Seed Host`、内部 ID、旧“酒局”文案外露 | 前端替换用户文案；后端/API 不得把内部枚举和样本名作为海报文案输出 |
| `PR-FE-SHARE028-P0-POSTER-NOT-COOL-EMPTY` | P0 | 大面积留白、缺背景光效、缺照片 + 账本融合叙事，保存图不可转发 | 前端按 015/020 重构保存图渲染层；不是只修页面预览 |

以上退回码可并行映射既有 020 红线：`PR-FE-SHARE020-P0-OLD-SHELL`、`PR-FE-SHARE020-P0-PHOTO-WALL-MISSING`、`PR-FE-SHARE020-P0-LEDGER-STRIP-MISSING`、`PR-FE-SHARE020-P0-POSTER-SAFE-AREA`、`PR-FE-SHARE015-P0-POSTER-NOT-COOL` 继续保持未关闭。

##### 12.7.23.4 资产是否足够

当前判断：`现有 015/020 资产足够，不新增字体、贴纸或整图底图`。

| 资产项 | 判断 | 接入要求 |
| --- | --- | --- |
| 背景 / 光效 | 不缺新资产，缺正确渲染 | 用 020 规格的暗色径向渐变、酒桌照片虚化层、轻噪点和边缘压暗；保存图不得继续用红色旧战报顶壳 |
| 照片墙 | 不缺资产，缺真实照片消费与布局 | 使用 `photoHighlights[]` 真实照片；4-6 张拍立得比例，白边 8-12rpx，旋转 <= 6deg；无照片时用中文拍照 CTA 空态，不得渲染空洞 |
| 账本徽章 / 贴纸 | 现有 6 个 SVG 足够 | 继续使用 `docs/design-assets/party-recorder/share-flow-015/cuts/`；建议入包 `miniprogram/assets/party-recorder/share-flow/`；贴纸只做边角点缀 |
| 字体 | 不新增授权字体 | 系统字体栈；海报主标题 52-64rpx / 800-900，大数字 64-96rpx / 800-900；内部英文枚举不得进入用户侧 |
| 海报底部安全区 | 不缺资产，缺版式与证据 | 保存 PNG 目标 1080x1920；底部提示距边 >= 48px；QR 180x180px+、24px 浅底 quiet zone；房间码字高 >= 64px |

如 028 后仍无法用 CSS / SVG / 真实照片还原 015/020 氛围，UI/UX 再补一张可选背景底图：`docs/design-assets/party-recorder/share-flow-015/cuts/share028-poster-stage-bg-1080x1920.webp`，尺寸 1080x1920，压缩目标 <= 240KB，仅作海报背景纹理，不承载文案、照片、账本或二维码。

##### 12.7.23.5 需要各角色补的证据

- 前端：给出当前保存图来源选择链路截图/日志摘要，明确是后端 ready PNG、前端 canvas fallback 还是旧缓存；修复后提供 `posterImagePath` / `readyShareImageUrl`、canvas fallback 截图、保存 PNG 原图，且 PNG 中不得出现旧壳、空照片洞、英文枚举、内部 ID。
- 后端/API：配合接口联调 028 确认 `share-task-1781687817395-94cf4452.png` 的 URL、尺寸、hash/mtime、生成器版本和字段来源；若后端 ready PNG 仍是旧模板，后端/API 必须改生成器或停止让前端优先使用旧图。
- 测试：复测不能只截页面预览；必须保存或拉取 PNG 原图，记录图片尺寸、文件大小、hash/mtime、页面 data/storage/console/network、`posterImagePath` / `readyShareImageUrl`，并对照本节 6 个 P0 退回码逐项截图。
- UGC / 风控：继续确认保存图只展示已授权公开内容；公开照片为空时要区分“确实无公开照片”和“字段未消费”，不能用空白洞通过。
- UI/UX：收到 028 后新 PNG 原图后，只复核保存图是否清除 P0 红线；不因页面预览首屏好看而接收生成 PNG。

#### 12.7.24 `PR-UX-CLEAN-SLATE-001` Clean Slate 新流程 UI/UX 基线

记录时间：2026-06-18。PM 已发布 `docs/party-recorder-clean-slate-reset-plan.md`，用户要求重新建立“聚会记录师”并清空旧项目污染。本节只更新 UI/UX 计划、资产清单和设计基线，不改业务源码、不改 PM 总台账、不写清空完成。

##### 12.7.24.1 SKILL 使用记录与 Figma 证据

| 项目 | 记录 |
| --- | --- |
| Product Design / `get-context` | 已按 playback 模式确认 brief：以 Figma 文件 `b2OwhvsJ6pe3fa0yrDQNmA` 中 `聚会记录师 全流程原型 初始构思` 为唯一新流程基线，输出清单和规格，不做源码实现 |
| `figma-use` | 用于读取 Figma 页面结构；目标页已加载，包含 12 个核心手机 frame、2 个说明 frame 和连接线 |
| `design-taste-frontend` | 只吸收“旧壳零容忍、非模板、页面节奏、按钮对比、状态完整、避免厚卡长列表”的评审口径；本轮不写前端代码 |
| `imagegen-frontend-mobile` | 作为移动端分享/保存图的高级视觉口径：强图像叙事、照片墙、账本高光、可读层级、状态页完整；本轮不新生图 |
| `imagegen` | 已评估不调用：Figma 已给新基线，当前不应再引入第二套视觉方向；若后续缺背景纹理，再单独生成可切图资产 |
| 新资产路径 | `docs/design-assets/party-recorder/clean-slate-001/README.md`；`figma-08-share-poster.png`、`figma-09-share-preview.png`、`figma-12-failed-privacy-state.png` |

Figma 目标页读取结果：

| Figma frame | node | 页面路径 | UI/UX 处理 |
| --- | --- | --- | --- |
| `01 首页/登录入口` | `11:55` | `pages/index/index` | 保留并重画 |
| `02 三步创建` | `11:61` | `pages/create-session/index` | 保留并重画 |
| `03 邀请好友` | `11:67` | `pages/invite-group/index` | 保留并重画 |
| `04 拍第一张` | `11:73` | `pages/moment-editor/index` | 保留并重画 |
| `05 现场记录台` | `11:79` | `pages/live-record/index` | 保留并重画 |
| `06 聚会账本` | `11:85` | `pages/table-mode/index` | 能力保留，页面重画，不沿用旧 table-mode 外观 |
| `07 自动简报` | `11:91` | `pages/session-brief/index` | 保留并重画 |
| `08 分享海报` | `11:97` | `pages/share-poster/index` | P0 保留并重画，保存图基线 |
| `09 分享回流` | `11:103` | `pages/share-preview/index` | P0 保留并重画 |
| `10 聚会相册` | `11:109` | `pages/wine-history/index` | 能力保留，页面重画，用户侧需改名为聚会相册 |
| `11 我的聚会` | `11:115` | `pages/me/index` | 保留并重画 |
| `12 失败/隐私状态` | `11:121` | `pages/share-poster/index?state=failed` | P0 保留并重画 |

##### 12.7.24.2 页面保留 / 砍掉 / 重画清单

| 类别 | 页面 / 能力 | UI/UX 结论 | 前端处理口径 |
| --- | --- | --- | --- |
| 保留并重画 | 首页、三步创建、邀请好友、拍第一张、现场记录台、自动简报、分享海报、分享回流、我的聚会、失败/隐私状态 | 以 Figma `11:*` frame 为唯一结构基线 | 建 clean route manifest；不得继续套旧 36 页视觉和旧样式框 |
| 能力保留但重画 | 聚会账本 `pages/table-mode/index` | 记账能力保留，但必须改成“聚会账本”，不得保留旧酒桌工具壳 | 入口与拍照并列，数据进入简报和分享图 |
| 能力保留但重画 | 聚会相册 `pages/wine-history/index` | 相册/历史能力保留，用户侧改为“聚会相册” | 去掉旧 wine-history 心智和旧列表厚卡 |
| 待砍掉 / 隔离 | `judge`、`judge-wheel`、`question-bank`、旧 `result-report`、旧 `rankings`、旧 `wine-points`、旧工具箱玩法页 | 不进入 Clean Slate 首版主流程 | 前端先列删除/隔离清单、引用扫描和回滚方式；未备份不得直接删 |
| 待重定级 | 会员、优惠券、商家合作、好友社交、合规说明、日志页 | 不在 Figma 初始构思主链路内 | 首版隐藏或归档；如保留需 PM 单独给新 Figma 节点 |

##### 12.7.24.3 分享页 / 保存分享图 / 分享回流视觉规格

| 模块 | 规格 |
| --- | --- |
| 画布尺寸 | 页面 frame 390x844；保存分享图导出建议 1080x1920 或等比竖版，所有关键内容距边 >= 48px |
| 背景光效 | 深色聚会桌面底 `#090705 -> #1A100B`，中心暖光聚焦，边缘压暗，少量颗粒；不得再用旧红色战报顶壳或白卡邀请壳 |
| 照片墙 | 分享海报首屏必须 3-6 张照片卡，拍立得白边 8-12rpx，轻微旋转 <= 6deg；无照片时显示“拍第一张/继续补照片”空态，不允许空白洞 |
| 账本高光 | 与照片墙同级，文案为“聚会账本高光”；展示 `照片 3张`、`账本 11条`、`关键 2件`、`已清 1条` 等中文短指标；不得用 `欠酒` 作为主心智 |
| 时间线 | 最多 2-3 条，文案使用“开场打卡 / 账本更新 / 第一张照片”等短中文；禁止内部样本名、英文枚举、任务 ID 进入 UI |
| 总结与安全区 | 保存图底部必须有聚会总结、公开范围提示、二维码/房间码浅色安全区；QR >= 180px，quiet zone >= 24px，房间码字高 >= 64px |
| 字体 | 系统字体栈 `-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif`；标题 700/800，海报主标题 52-64rpx，数字 64-96rpx，按钮 30-36rpx |
| 按钮 | 主按钮为珊瑚/暖橙 `#FF5A3D`，高度 96-112rpx，圆角 32-44rpx；保存图片、转发分享并列但保存优先；按下缩放 0.98 |
| 空态 | 照片空态必须有拍照 CTA；账本空态必须有“记一笔” CTA；不能渲染空白洞、空统计块或旧样本占位 |
| 失败态 | 使用 Figma `12 失败/隐私状态`：生成中、保存失败、公开过滤三类状态同页可见；失败卡必须有“重新生成”和“回相册” |
| 分享回流 | 浅色回流页可用，但必须保留照片预览、照片记录 + 聚会账本融合卡、公开范围提示和加入聚会 CTA；不得退回普通列表 |

##### 12.7.24.4 旧资产退回与不得入包清单

| 退回码 | 分级 | 触发条件 |
| --- | --- | --- |
| `PR-UX-CS-P0-OLD-36-PAGE-STACK` | P0 | 继续以旧 `聚会记录师 全页面原型` 36 页堆叠作为实现基线，而不是 Figma `全流程原型 初始构思` 12 个 frame |
| `PR-UX-CS-P0-OLD-REPORT-SHELL-ASSET` | P0 | `report-poster.png`、旧 generated share task 图片、旧红色战报壳、旧邀请壳继续入包或被保存图优先使用 |
| `PR-UX-CS-P0-OLD-GAMEPLAY-ROUTE` | P0 | `judge`、`judge-wheel`、`question-bank`、旧 `result-report` 继续作为用户可见主入口 |
| `PR-UX-CS-P0-OLD-COPY-LEAK` | P0 | 用户侧出现“酒桌判官 / 判官 / 惩罚 / 战报 / 裁判 / dual_flow / PR Seed Host / IT-MOMENTS”等旧词或内部字段 |
| `PR-UX-CS-P0-SHARE-NOT-FIGMA` | P0 | 分享海报、保存图、回流页未按 Figma `11:97 / 11:103 / 11:121` 重画，仍沿用 015/020 旧修补稿或旧长列表 |
| `PR-UX-CS-P1-ASSET-NAMESPACE-MIXED` | P1 | Clean Slate 新资产与旧 `share-flow-015`、旧 `assets/share` 混放且没有清单说明 |

旧资产处理口径：

- `docs/design-assets/party-recorder/share-flow-015/` 降为历史参考，不再作为唯一新流程基线。
- `docs/design-assets/party-recorder/clean-slate-001/` 是本轮分享流程 UI/UX 基线目录。
- 旧 020 的 6 个 SVG 若复用，必须重新登记为 Clean Slate 辅助贴纸，并确认不含旧战报壳语义；未登记不得入包。
- 旧红色战报截图、空白照片洞、旧生成 PNG、旧后台静态图只允许作为退回证据，不允许作为新版资产。

##### 12.7.24.5 前端 1:1 还原清单

| 类型 | 规格 |
| --- | --- |
| 目标 frame | 以 `11:55` 至 `11:121` 12 个 Figma frame 建 clean app route manifest；每个页面 390x844 基准，适配 375/390/414 |
| 图层顺序 | 背景光效层、内容安全区、照片墙/账本主视觉、时间线/总结、底部 CTA、状态/隐私提示；贴纸永远在内容下或边角，不遮挡文字/二维码 |
| 色值 | 深底 `#090705/#1A100B`，纸面 `#FFF4DE`，主按钮 `#FF5A3D`，成功/安全 `#63DFAE`，账本蓝 `#3C8DFF`，高光 `#FFC75A` |
| 字体 | 系统字体栈；不要引入未授权字体；中文标题不超过 2 行，按钮一行显示 |
| 安全区 | 页面左右 >= 24rpx；保存图内容距边 >= 48px；顶部标题距边 >= 96px；底部公开提示距边 >= 48px |
| 动效/光效 | 页面进入可用 180-240ms fade-up；照片卡轻微 stagger；保存生成中使用骨架/进度，不用无反馈 loading；动效必须支持关闭或弱化 |
| 数据字段 | `photoHighlights[]`、`ledgerSummary/accountingHighlights`、`keyEvents[]`、`shareSummary`、`visibilityScope`、`posterImagePath/readyShareImageUrl`、`inviteCode/qrCodeUrl` |
| 验收截图 | 首页、三步创建、邀请、拍第一张、现场记录台、聚会账本、自动简报、分享海报、保存 PNG 原图、分享回流、相册、我的、失败/隐私状态 |

当前 UI/UX 状态：`PR-UX-CLEAN-SLATE-001 已建立新基线 / 待前端旧路由清单与重画实现 / 不写清空完成`。

#### 12.7.25 `PR-UX-CLEAN-SLATE-ASSET-PACK-002` Clean Slate 前端接入资产包

记录时间：2026-06-18。PM 已验收 12.7.24 第一轮基线，本节把 Clean Slate 分享流程转成前端可直接接入的资产包和规格表。只修改 UI/UX 计划与 `docs/design-assets/party-recorder/clean-slate-001/`，不改业务源码。

##### 12.7.25.1 SKILL 使用记录

| SKILL | 选择理由 | 本轮边界 |
| --- | --- | --- |
| Product Design / `get-context` | 复用 12.7.24 已锁定的 Figma clean slate brief，避免重新发散 | 不重新定义 IA |
| `figma-use` | 复用 12.7.24 已读取的 Figma node `11:97`、`11:103`、`11:121` | 本轮不再修改 Figma |
| `imagegen-frontend-mobile` | 用于资产拆分的移动端视觉判断：照片墙、账本高光、状态可读、安全区 | 不生成新整页图 |
| `imagegen` | 本轮不使用 | 当前可用 SVG/CSS 确定性完成；如后续缺真实桌面纹理，再单独生成 WebP |

##### 12.7.25.2 资产包路径与命名空间

| 项 | 记录 |
| --- | --- |
| 资产包规格 | `docs/design-assets/party-recorder/clean-slate-001/ASSET_PACK_002.md` |
| 资产包 README | `docs/design-assets/party-recorder/clean-slate-001/README.md` |
| 切图目录 | `docs/design-assets/party-recorder/clean-slate-001/cuts/` |
| 命名空间 | `pr-cs002-*` |
| 建议入包路径 | `miniprogram/assets/party-recorder/clean-slate/` |
| 隔离规则 | 不直接引用 `share-flow-015`、`share020-*`、旧 `assets/share`、旧 generated share task 图片 |

##### 12.7.25.3 文件清单

| 文件 | 尺寸 | 格式 | 用途 |
| --- | --- | --- | --- |
| `figma-08-share-poster.png` | 390x844 | PNG | 分享海报 Figma 对照，不入包 |
| `figma-09-share-preview.png` | 390x844 | PNG | 分享回流 Figma 对照，不入包 |
| `figma-12-failed-privacy-state.png` | 390x844 | PNG | 失败/隐私态 Figma 对照，不入包 |
| `cuts/pr-cs002-stage-glow.svg` | 390x844 | SVG | 分享页暗色背景光效 |
| `cuts/pr-cs002-poster-glow-1080.svg` | 1080x1920 | SVG | 保存分享图海报底纹 |
| `cuts/pr-cs002-photo-polaroid-frame.svg` | 180x216 | SVG | 照片墙相框 / 空态参考 |
| `cuts/pr-cs002-ledger-badge.svg` | 128x128 | SVG | 聚会账本高光 icon |
| `cuts/pr-cs002-qr-safe-plate.svg` | 360x176 | SVG | 二维码/房间码浅底安全区 |
| `cuts/pr-cs002-button-shine.svg` | 320x112 | SVG | 主按钮高光底参考 |
| `cuts/pr-cs002-privacy-shield.svg` | 112x112 | SVG | 隐私/公开过滤提示 |
| `cuts/pr-cs002-retry-spark.svg` | 112x112 | SVG | 保存失败/重新生成状态 |

##### 12.7.25.4 旧 020 SVG 复用 / 废弃规则

| 旧 020 资产 | 结论 | 说明 |
| --- | --- | --- |
| `pr-share020-sticker-starburst.svg` | 可按语义重画，不直接入包 | 星芒语义可用，但旧命名属于 020 修补线 |
| `pr-share020-sticker-sparkle-coral.svg` | 可按语义重画，不直接入包 | 只允许轻装饰，不能覆盖主视觉 |
| `pr-share020-sticker-tape-mint.svg` | 废弃首版入包 | Figma clean slate 分享页不依赖胶带贴纸，避免贴纸过度 |
| `pr-share020-ledger-badge.svg` | 由 `pr-cs002-ledger-badge.svg` 替代 | Clean Slate 需要独立命名空间 |
| `pr-share020-underline-coral.svg` | 废弃首版入包 | Figma 基线不使用手绘下划线 |
| `pr-share020-shield-mint.svg` | 由 `pr-cs002-privacy-shield.svg` 替代 | Clean Slate 需要独立命名空间 |

##### 12.7.25.5 前端页面到资源 1:1 对照

| 页面 | 资源 | 图层 | 状态 |
| --- | --- | --- | --- |
| `pages/session-brief/index` | `pr-cs002-stage-glow.svg`、真实照片墙、账本高光 | 背景光效 -> 简报卡 -> 照片墙 -> 账本高光 -> CTA | ready / no-photo / no-ledger |
| `pages/share-poster/index` | `pr-cs002-stage-glow.svg`、`pr-cs002-poster-glow-1080.svg`、照片框、账本徽章、QR plate、button shine | 页面背景 -> poster 预览 -> 照片墙 -> 账本条 -> 时间线 -> 二维码安全区 -> 页面 CTA | generating / ready / save-success / save-failed |
| `pages/share-preview/index` | 浅色页面底、`pr-cs002-privacy-shield.svg`、照片墙、账本高光 | 顶部身份 -> 照片预览 -> 融合摘要 -> 公开范围 -> 加入 CTA | outsider / member / filtered |
| `pages/share-poster/index?state=failed` | `pr-cs002-stage-glow.svg`、`pr-cs002-retry-spark.svg`、`pr-cs002-privacy-shield.svg`、button shine | 背景 -> 状态列表 -> 失败卡 -> 重试/回相册按钮 | generating / permission-failed / save-failed / retry |

##### 12.7.25.6 仍缺素材与证据

- 缺 3-6 张已授权公开照片样本，前端/测试需要用于照片墙截图。
- 缺真实二维码/房间码样本，保存图安全区需要实际 QR 或房间码验证。
- 缺前端入包后路径、压缩方式和小程序包体增量。
- 缺保存 PNG 原图，测试不得只截页面预览。

当前 UI/UX 状态：`PR-UX-CLEAN-SLATE-ASSET-PACK-002 已交付资产包和规格表 / 待前端接入与测试截图 / 不写实现通过`。

#### 12.7.26 `PR-UX-CLEAN-SLATE-PHASE1-REVIEW-003` 第一阶段预置接收矩阵

记录时间：2026-06-18。PM 已派发 `PR-UX-CLEAN-SLATE-PHASE1-REVIEW-003`，本节只预置 UI/UX 接收矩阵和退回码，等待前端 003 回包截图后执行接收/退回；本轮不改业务源码。

##### 12.7.26.1 读取依据

| 来源 | 结论 |
| --- | --- |
| PM 队列 003 行 | 前端第一阶段目标是先新建 `album/ledger/privacy-state` 壳页并迁主链路入口，下线 `judge/question-bank/judge-wheel/result-report` 等 P0 旧路由 |
| UI/UX 12.7.25 | `pr-cs002-*` 资产包、命名空间、页面到资源 1:1 对照已确定 |
| Figma Clean Slate 页面 | Phase1 重点 frame 仍是 `06 聚会账本`、`08 分享海报`、`09 分享回流`、`10 聚会相册`、`12 失败/隐私状态` |

##### 12.7.26.2 接收矩阵

| 页面 / 状态 | 预置接收口径 | 前端需交证据 | 当前 UI/UX 预置结论 |
| --- | --- | --- | --- |
| `pages/table-mode/index` 聚会账本新壳 | 必须是“聚会账本”新壳，不再是旧酒局工具页；账本高光、主 CTA、列表密度按 Clean Slate 口径收敛 | 预览框截图、页面路径、data 摘要、`ledgerSummary/accountingHighlights` 映射 | 待截图复核 |
| `pages/wine-history/index` 聚会相册新壳 | 用户侧必须是“聚会相册”，不能残留旧 wine-history/酒局历史视觉；相册卡片、空态、返回路径简洁 | 预览框截图、空态/有图态、selector 和 data 摘要 | 待截图复核 |
| `pages/share-poster/index` 分享海报 | 必须接入 `pr-cs002-stage-glow.svg`、`pr-cs002-poster-glow-1080.svg` 语义，不得混旧 015/020 或旧红壳 | ready 页面截图、PNG 原图/预览、`posterImagePath/readyShareImageUrl`、selector/data | 待截图复核 |
| `pages/share-preview/index` 分享回流 | 必须是浅色回流页新壳，照片预览 + 融合摘要 + 公开范围 + 加入 CTA；不能退回旧普通列表 | 回流页截图、`photoHighlights/accountingHighlights/visibilityScope` 摘要 | 待截图复核 |
| `pages/share-poster/index?state=failed` 失败/隐私态 | 必须接入 `pr-cs002-retry-spark.svg`、`pr-cs002-privacy-shield.svg` 语义；生成中/失败/过滤同页清晰可见 | failed / permission / retry 状态截图、selector/data 摘要 | 待截图复核 |

##### 12.7.26.3 预置退回码

| 退回码 | 分级 | 触发条件 |
| --- | --- | --- |
| `PR-UX-CS003-P0-SHARE-OLD-SHELL-MIXED` | P0 | `share-poster/share-preview` 混入旧 015/020 布局、旧红色战报壳、旧邀请壳或旧长列表结构 |
| `PR-UX-CS003-P0-FAILURE-STATE-OLD-VISUAL` | P0 | `privacy-state` 仍沿用旧酒局/旧战报/旧失败页视觉，不符合 Figma `12 失败/隐私状态` |
| `PR-UX-CS003-P0-ALBUM-OLD-HISTORY-SHELL` | P0 | `album` 新壳仍是旧酒局历史/旧 wine-history 壳，用户侧残留旧品牌或旧厚卡长列表 |
| `PR-UX-CS003-P0-LEDGER-OLD-TOOL-SHELL` | P0 | `ledger` 新壳仍像旧工具页/旧酒局结算壳，没有 Clean Slate 聚会账本视觉和主入口层级 |
| `PR-UX-CS003-P0-CS002-ASSET-MISSING` | P0 | 该接 `pr-cs002-*` 的模块仍未接，或直接引用旧 `share020-*`、旧 `assets/share` |
| `PR-UX-CS003-P1-PHOTO-WALL-EMPTY` | P1 | 分享海报/回流照片墙位置保留，但照片为空洞或空态不成立 |
| `PR-UX-CS003-P1-LEDGER-HIGHLIGHT-WEAK` | P1 | 账本高光存在但被弱化到底部小字或二级信息，未与照片并列成为主视觉 |
| `PR-UX-CS003-P1-PRIVACY-COPY-WEAK` | P1 | 公开范围、过滤说明、重试/回相册下一步不清楚 |
| `PR-UX-CS003-P1-SAFE-AREA-UNPROVEN` | P1 | 页面预览看似正确，但缺 PNG 原图/底部安全区/二维码房间码证据 |

##### 12.7.26.4 前端回包后 UI/UX 只看什么

- 先看旧壳是否清零：旧红壳、旧酒局视觉、旧战报结构、旧 015/020 修补稿一旦混入，直接按 P0 退回。
- 再看 `album/ledger/privacy-state` 是否真的换成新壳，而不是只改标题文案。
- 最后看 `share-poster/share-preview` 是否按 `pr-cs002-*` 和 Figma Clean Slate 做 1:1 接入；缺截图时只能写待复核，不写接收。

当前 UI/UX 状态：`PR-UX-CLEAN-SLATE-PHASE1-REVIEW-003 已预置接收矩阵 / 等前端截图 / 不写实现通过`。

#### 12.7.27 `PR-UX-CLEAN-SLATE-PHASE1-SCREEN-ACCEPT-004` 三页预览框阶段接收

记录时间：2026-06-18。PM 已回收测试 13.16.57 三张截图：`album/ledger/privacy-state` 可在 DevTools 9420 打开且 Console 为空。本节只更新 UI/UX 计划，不改业务源码、PM 总台账或测试结论；缺分享页新截图不得写分享页通过。

##### 12.7.27.1 截图索引

| 页面 | 截图 | UI/UX 观察 |
| --- | --- | --- |
| `album` | `docs/runtime/pr-qa-clean-slate-phase1-delta-003-rerun-album-20260618.png` | 已换成浅色 Clean Slate 壳，但列表文案仍外露工程字段 `IT-MOMENTS-...`、`PR-BE-DB-LOGIN-SEED-...` |
| `ledger` | `docs/runtime/pr-qa-clean-slate-phase1-delta-003-rerun-ledger-20260618.png` | 深色新壳成立，标题/指标/主次按钮层级清晰，未见旧红壳或旧工具页视觉 |
| `privacy-state` | `docs/runtime/pr-qa-clean-slate-phase1-delta-003-rerun-privacy-state-20260618.png` | 浅底状态页方向成立，主卡、双按钮和说明文案已脱离旧战报壳 |

##### 12.7.27.2 接收 / 退回结论

当前结论：`ledger / privacy-state 预览框阶段可继续开发；album 退回；分享页待截图复核`。

| 页面 | 结论 | 分级 | 依据 |
| --- | --- | --- | --- |
| `pages/table-mode/index` 聚会账本 | 预览框阶段可继续开发 | 局部接收 | 新壳已建立，深色背景、聚会账本标题、指标卡和 CTA 均未沿用旧酒局工具壳或旧战报视觉 |
| `pages/share-poster/index?state=failed` 失败/隐私态 | 预览框阶段可继续开发 | 局部接收 | 状态页已符合 Clean Slate 方向，未混入旧红壳；主卡、返回首页/查看相册两个动作清晰 |
| `pages/wine-history/index` 聚会相册 | 退回 | P0 | 列表项仍直接暴露工程字段和样本名，不符合用户侧产品壳；不能把工程命名当相册标题或副标题输出 |
| `pages/share-poster/index` / `pages/share-preview/index` | 待截图复核，不接收 | 待证据 | 本轮没有新的分享海报/回流截图，UI/UX 不能写通过 |

##### 12.7.27.3 退回码处理

| 退回码 | 本轮处理 | 说明 |
| --- | --- | --- |
| `PR-UX-CS003-P0-LEDGER-OLD-TOOL-SHELL` | 本轮不触发 | `ledger` 新壳已脱离旧工具页视觉，可继续开发 |
| `PR-UX-CS003-P0-FAILURE-STATE-OLD-VISUAL` | 本轮不触发 | `privacy-state` 已脱离旧战报/旧失败页外观，可继续开发 |
| `PR-UX-CS003-P0-ALBUM-OLD-HISTORY-SHELL` | 升级为命中 | 虽然壳层已换，但用户可见标题/副标题仍被工程字段污染，未达到聚会相册产品壳要求 |
| `PR-UX-CS-P0-OLD-COPY-LEAK` | 命中 | `album` 截图中存在工程样本名和内部字段片段，属于用户侧不应外露内容 |
| `PR-UX-CS003-P0-SHARE-OLD-SHELL-MIXED` | 保持待截图复核 | 缺 `share-poster/share-preview` 新截图，暂不关闭 |
| `PR-UX-CS003-P1-SAFE-AREA-UNPROVEN` | 保持待证据 | 本轮无分享 PNG 原图，安全区仍未证明 |

##### 12.7.27.4 给前端 004 的分享页短屏强视觉预置退回码

| 退回码 | 分级 | 触发条件 |
| --- | --- | --- |
| `PR-UX-CS004-P0-DUAL-HERO-MISSING` | P0 | 分享海报首屏没有同时突出“照片 + 聚会账本”，任一主线被压成二级信息 |
| `PR-UX-CS004-P0-SAVE-ACTION-WEAK` | P0 | 保存图片/转发分享动作不清晰、不可达、被下沉或被状态/长列表遮挡 |
| `PR-UX-CS004-P0-OLD-RED-SHELL-RETURN` | P0 | 旧红壳、旧邀请壳、旧 015/020 修补壳、旧长列表再次混入分享海报/回流页 |
| `PR-UX-CS004-P0-ENGINEERING-COPY-LEAK` | P0 | `dual_flow`、样本 ID、任务 ID、工程枚举、旧“酒局/判官/战报”词直接出现在用户界面 |
| `PR-UX-CS004-P0-BLANK-HERO` | P0 | 首屏出现大留白、空白照片洞、账本下沉，导致短屏强视觉失败 |
| `PR-UX-CS004-P1-TIMELINE-DENSITY` | P1 | 时间线过长、文本挤压或遮挡保存动作，不符合短屏节奏 |

##### 12.7.27.5 前端下一步证据要求

- `album`：补修复后截图，清除工程字段，用户侧标题/副标题只保留聚会名、状态、公开范围等产品文案。
- `share-poster`：补 ready 首屏、全页、PNG 原图/预览、`posterImagePath/readyShareImageUrl`、`photoHighlights/accountingHighlights` 摘要。
- `share-preview`：补回流页截图和 `visibilityScope/photoHighlights/accountingHighlights` 摘要。
- `privacy-state`：若继续细化，再补 `permission-failed/save-failed/retry` 三态拆图；当前可先继续开发，不必因本页阻塞。

当前 UI/UX 状态：`album P0 退回 / ledger 与 privacy-state 预览框阶段可继续开发 / 分享页等待新截图`。

#### 12.7.28 `PR-UX-CLEAN-SLATE-SHARE-004-REVIEW` 分享页空态/结构复核

记录时间：2026-06-18。前端 14.47 已提供 `share-poster`、`share-preview` 两张截图。本节只做空态/结构复核，不改业务源码；缺真实成员态照片、账本和 PNG 原图时，不得写分享页全通过。

##### 12.7.28.1 截图索引

| 页面 | 截图 | 当前可评范围 |
| --- | --- | --- |
| `pages/share-poster/index` | `docs/runtime/pr-fe-clean-slate-phase2-004-share-poster-task.png` | 空态结构、短屏节奏、按钮层级、失败态布局、旧壳清理 |
| `pages/share-preview/index` | `docs/runtime/pr-fe-clean-slate-phase2-004-share-preview.png` | 空态结构、回流文案、空照片区、账本融合卡、加入动作层级 |

##### 12.7.28.2 复核结论

当前结论：`旧红壳已脱离，但分享海报与回流页空态/结构退回；不得写分享页通过`。

| 页面 | 结论 | 分级 | 依据 |
| --- | --- | --- | --- |
| `share-poster` | 退回 | P1 | 已切到 Clean Slate 暗色舞台，也接近 `pr-cs002-*` 氛围；但空态、失败卡、状态条、底部动作同时堆在一屏，短屏节奏过满，不够“酷炫海报” |
| `share-preview` | 退回 | P1 | 浅色回流页方向成立，但 `0/0 已加入` 这类状态不适合用户；空态卡和账本融合卡仍偏占位结构，照片+账本同屏叙事还不够产品化 |

##### 12.7.28.3 退回码

| 退回码 | 分级 | 触发条件 |
| --- | --- | --- |
| `PR-UX-CS004-P0-OLD-RED-SHELL-RETURN` | 本轮不触发 | 两张截图均已脱离旧红壳 |
| `PR-UX-CS004-P0-ENGINEERING-COPY-LEAK` | 本轮不触发 | 本轮未见 raw ID / `dual_flow` / 旧词直接外露 |
| `PR-UX-CS004-P0-DUAL-HERO-MISSING` | 保持待成员态证据 | 当前为空态，未证明真实照片 + 聚会账本同屏主视觉 |
| `PR-UX-CS004-P0-SAVE-ACTION-WEAK` | 命中待修 | `share-poster` 保存动作虽然可见，但被失败卡、状态条和底部动作分散注意力，主任务不够聚焦 |
| `PR-UX-CS004-P0-BLANK-HERO` | 部分命中 | `share-poster`、`share-preview` 的照片区仍是占位空态，未形成海报级主视觉；当前按空态质量退回 |
| `PR-UX-CS004-P1-TIMELINE-DENSITY` | 命中 | `share-poster` 一屏内状态组件过多，节奏偏厚，不符合短屏强视觉 |
| `PR-UX-CS004-P1-EMPTY-STATE-NOT-PRODUCTIZED` | 新增 | 空态仍像调试/占位结构，照片区、账本区、失败区缺少更自然的产品空态表达 |
| `PR-UX-CS004-P1-RETURN-STATUS-RAW` | 新增 | 回流页出现 `0/0 已加入` 这类生硬状态，用户难以理解且破坏产品感 |
| `PR-UX-CS004-P1-SAFE-AREA-UNPROVEN` | 保持待证据 | 仍缺保存 PNG 原图、二维码/房间码安全区证据 |

##### 12.7.28.4 页面级问题

| 页面 | 问题 |
| --- | --- |
| `share-poster` | 暗色舞台方向对了，但“暂无可展示照片”“账本还没开始”“失败卡”“状态条”“底部三按钮”同时出现，像任务面板而不是短屏海报；建议只保留 1 个主空态、1 个主 CTA、1 个失败恢复入口 |
| `share-preview` | 邀请预览结构基本对，但 `0/0 已加入` 需要改成更自然的口令/成员提示；空照片区和融合卡的说明文案仍偏开发占位口径，视觉重心不足 |

##### 12.7.28.5 前端下一步证据要求

- `share-poster`：补一版更收敛的空态截图，只保留一个主空态和一个主动作；再补真实成员态截图，证明照片 + 聚会账本同屏。
- `share-preview`：去掉 `0/0 已加入` 这种原始状态；补产品化文案后的空态截图，再补真实成员态回流截图。
- `share-poster` / `share-preview`：补保存 PNG 原图或等比预览，证明二维码/房间码安全区。
- 两页都要补 page data 摘要：`photoHighlights`、`accountingHighlights`、`visibilityScope`、`posterImagePath/readyShareImageUrl`。

当前 UI/UX 状态：`分享页已脱离旧红壳，但空态/结构退回；待真实成员态和 PNG 原图后再复核`。

#### 12.7.29 `PR-UX-CLEAN-SLATE-FIXUP-004-REVIEW` 相册与回流页修补复核

记录时间：2026-06-18。前端 14.48 已补两张修复截图：`album` 去除工程字段外露，`share-preview` 去除 `0/0 已加入`。本节只基于预览图复核修补结果，不改业务源码；`share-poster` 仍缺有效页面停留、保存 PNG 原图和真实成员态，不得写分享页全通过。

##### 12.7.29.1 SKILL 使用记录

| SKILL | 选择理由 | 使用边界 | 本轮结论边界 |
| --- | --- | --- | --- |
| `web-design-guidelines` | 本轮属于实现截图复核，需要继续按安全区、长文案容器、空态完整性、主次操作层级和视觉密度检查 | 只用于截图审查与退回码复核，不做源码审查通过结论 | 只能写预览框阶段局部接收 / 退回 / 待截图复核 |

未使用 `imagegen` / `imagegen-frontend-mobile`：本轮不是新生图任务，现有 Clean Slate 资产足够，问题集中在前端落地与状态表达，不需要新增设计图。

##### 12.7.29.2 截图索引

| 页面 | 截图 | 本轮观察 |
| --- | --- | --- |
| `pages/wine-history/index` 聚会相册 | `docs/runtime/pr-fe-clean-slate-phase2-004-fixup-album.png` | `我的相册`、`聚会相册 1/2` 等用户文案已替代工程字段；浅色壳层和主次按钮结构成立 |
| `pages/share-preview/index` 邀请预览 / 回流页 | `docs/runtime/pr-fe-clean-slate-phase2-004-fixup-share-preview.png` | `0/0 已加入` 已改成 `邀请已经备好`，raw 状态问题解除；但仍是空态壳层，未证明真实照片 + 聚会账本同屏主视觉 |

##### 12.7.29.3 复核结论

当前结论：`album 的工程字段 P0 可解除并降为壳层可继续开发；share-preview 的 raw 状态已产品化，但只接收空态/结构，不代表分享页通过`。

| 页面 | 结论 | 分级 | 依据 |
| --- | --- | --- | --- |
| `pages/wine-history/index` 聚会相册 | 预览框阶段可继续开发 | 局部接收 | 上一轮 `IT-MOMENTS... / PR-BE-DB-LOGIN-SEED...` 工程字段已清除，标题、副标题和 CTA 已回到用户侧产品文案；但当前仍只是静态列表壳层截图，不代表相册详情、筛选、空态、加载态全量通过 |
| `pages/share-preview/index` 邀请预览 / 回流页 | 空态/结构预览阶段可继续开发 | 局部接收 | `邀请已经备好` 替代 raw 加入状态后，回流页已更接近产品化表达；浅色回流壳、口令卡、照片记录 + 聚会账本融合卡的层级基本成立，但照片区仍为空态，不能证明“酷炫短屏 + 双主线同屏”在真实成员态下成立 |
| `pages/share-poster/index` 分享海报 | 保持待截图复核，不接收 | 待证据 | 本轮无新的有效页面停留截图、保存 PNG 原图或真实成员态证据，仍不能判断主视觉、安全区和保存图最终表现 |

##### 12.7.29.4 退回码复核

| 退回码 | 本轮处理 | 说明 |
| --- | --- | --- |
| `PR-UX-CS-P0-OLD-COPY-LEAK` | 解除 | `album` 截图中已不见工程样本名和内部字段片段 |
| `PR-UX-CS003-P0-ALBUM-OLD-HISTORY-SHELL` | 降级关闭 | 相册页已不再呈现旧历史页污染或工程标题，本轮按新壳可继续开发处理；后续仅在混回旧壳或再次泄露工程字段时重开 |
| `PR-UX-CS004-P1-RETURN-STATUS-RAW` | 解除 | `share-preview` 已从原始计数文案改为用户可理解的邀请状态 |
| `PR-UX-CS004-P1-EMPTY-STATE-NOT-PRODUCTIZED` | 降级为待成员态复核 | 当前空态已比上一轮更像产品页，但仍缺真实照片、账本高光和成员加入信息，暂不写分享页通过 |
| `PR-UX-CS004-P0-DUAL-HERO-MISSING` | 保持待成员态证据 | 当前截图仍为空态，不能证明真实照片 + 聚会账本会同时成为主视觉 |
| `PR-UX-CS004-P0-BLANK-HERO` | 保持待成员态证据 | 空白照片位已转成可读空态，但仍缺真实照片墙和保存图主舞台证据 |
| `PR-UX-CS004-P1-SAFE-AREA-UNPROVEN` | 保持待证据 | 仍缺保存 PNG 原图、二维码/房间码安全区和底部裁切证据 |

##### 12.7.29.5 给前端与测试的下一步证据要求

- 前端 `PR-FE-CLEAN-SLATE-PHASE2-004-FIXUP`：
  - `album` 若继续提交，只需补相册空态/详情态其中一项，证明新壳不是单张静态列表截图。
  - `share-preview` 继续补真实成员态截图，至少包含真实 `photoHighlights`、`accountingHighlights`、成员加入信息或可见范围，不要只停在空态。
  - `share-poster` 必须补有效页面停留截图、保存 PNG 原图或等比预览、`posterImagePath/readyShareImageUrl` 摘要，证明主视觉与安全区成立。
- 测试 `PR-QA-CLEAN-SLATE-PHASE2-004-RUN`：
  - 优先补 `share-poster` 与 `share-preview` 的 DevTools 截图 + page data 摘要。
  - 重点核对 `photoHighlights/accountingHighlights/visibilityScope` 是否真实入页，而不是空态占位。
  - 在拿到保存 PNG 原图前，不得写分享流设计通过、全链路通过或上线通过。

当前 UI/UX 状态：`album 工程字段 P0 已解除并转为壳层局部接收 / share-preview raw 状态已解除但仅空态结构接收 / share-poster 仍待截图复核`。

#### 12.7.30 `PR-UX-HOME-INVITE-LEDGER-CLEANUP-007` 首页 / 邀请卡 / 局内账本清洁约束

记录时间：2026-06-18。本节依据 `AGENTS.md`、团队公告 `PR-PM-HOME-INVITE-LEDGER-007-NOTICE`、队列任务 `PR-UX-HOME-INVITE-LEDGER-CLEANUP-007` 与当前 UI/UX 最新章节，输出前端 007 的退回码和截图接收标准；只改 UI/UX 计划，不改业务源码、PM 总台账或测试结论。

##### 12.7.30.1 精准读取范围与关键词

| 文件 | 精读定位 | 本轮提取关键词 |
| --- | --- | --- |
| `AGENTS.md` | 产品命名、Clean Slate 边界、UI/UX 只能改计划/资产、预览框验收规则 | `聚会记录师`、`三步内创建并拍照`、`只改 UI/UX 计划`、`预览框证据` |
| `docs/gameplay-moments-team-announcements.md` | `PR-PM-HOME-INVITE-LEDGER-007-NOTICE` 行 | `聚会待开局非常驻`、`首页不得常驻口令/相册/分享/账本入口`、`邀请卡极简`、`账本与记录/相册/分享同级` |
| `docs/runtime/ai-thread-dispatch-queue.md` | `PR-UX-HOME-INVITE-LEDGER-CLEANUP-007` 行 | `首页清洁规则`、`邀请卡只留口令+好友状态`、`账本头像用户名`、`邀请发起者可加减酒` |
| `docs/gameplay-moments-ui-ux-development-plan.md` | `12.7.10`、`12.7.14`、`12.7.15`、`12.7.24`、`12.7.27-12.7.29` | `首页登录入口`、`预览框证据口径`、`双主线并存`、`Clean Slate`、`聚会账本新壳` |

##### 12.7.30.2 SKILL 选择记录

| SKILL | 选择理由 | 使用边界 | 本轮是否生图 |
| --- | --- | --- | --- |
| `web-design-guidelines` | 本轮核心是首页杂讯收敛、标签层级、触控分区、长文案删减、安全区和截图接收标准，需要可执行门禁 | 只用于规格约束和截图验收标准，不写实现通过 | 否 |
| `design-taste-frontend` | 本轮要防止首页回到常驻杂货架、邀请卡回到说明性厚卡、账本页回到旧工具壳或重复按钮堆叠 | 只用于视觉层级和反模板退回口径，不生图、不改源码 | 否 |

未使用 `imagegen` / `imagegen-frontend-mobile`：本轮目标是约束前端 007 清理 IA 和状态表达，不是新增视觉稿；现有 Clean Slate 资产和首页/账本基线足够支撑实现。

##### 12.7.30.3 口径覆盖说明

- 本节覆盖 12.7.15 中“首页首屏同时看到创建聚会和聚会账本”的旧口径，仅对首页 IA 生效。
- 账本能力没有删除，改为：`进入本局后` 与 `记录 / 相册 / 分享` 同级出现，继续保留“邀请发起者可加减酒”的操作权。
- 首页继续服务“三步内创建并拍第一张照片”，但不再承担口令杂货架、相册入口、分享入口和账本入口堆叠。

##### 12.7.30.4 页面级 UI/UX 标准

| 页面/模块 | 007 标准 | 不可接受形态 |
| --- | --- | --- |
| 首页 `index` - `聚会待开局` | 仅当存在进行中聚会时显示；作为单条状态卡或继续入口存在，文案围绕“继续本局 / 去记录 / 去邀请” | 无进行中聚会也常驻；与创建聚会并列成第二主英雄；展示工程字段、历史样本名或旧“酒局”词 |
| 首页 `index` - 干净首屏 | 首屏只保留聚会主路径：品牌标题、创建聚会主 CTA、必要登录/继续入口、进行中聚会状态卡（若存在） | 底部常驻输入口令；首页常驻相册/分享/聚会账本入口；工具堆叠成杂货架；说明文字过多 |
| 邀请卡 `invite-group` / 邀请区块 | 极简卡只保留口令主体和好友加入状态；主视线先看到口令，其次看到已有几位好友加入或加入头像组 | 大段说明性文字板块、玩法说明、规则说明、旧等待室长文、重复“继续邀请/复制/分享”按钮堆叠 |
| 局内 IA `live-record` / `session-brief` 等当前聚会容器 | `记录 / 相册 / 分享 / 聚会账本` 为同级标签卡或等价同层切换控件；四者均一眼可见 | 聚会账本被塞进更多菜单、二级工具或页面底部弱入口；只剩照片/相册/分享三项 |
| 聚会账本 `table-mode` 新壳 | 列表项必须有头像 + 用户名；邀请发起者可见加酒/减酒主操作；重复按钮去重，只保留一组主动作和必要次动作 | 旧酒局工具壳、无头像用户名、同一行出现两套“加/减/确认”重复按钮、主次动作不分、工程字段外露 |

##### 12.7.30.5 退回码

| 退回码 | 分级 | 触发条件 | 责任角色 | 修复口径 |
| --- | --- | --- | --- | --- |
| `PR-UX-HIL007-P0-HOME-OPENING-CARD-ALWAYS-ON` | P0 | 无进行中聚会时首页仍显示 `聚会待开局` / `继续本局` / 类似状态卡 | 前端 | 仅在 `hasActiveSession=true` 或等效 data 成立时渲染；无本局时整块消失，不留占位空白 |
| `PR-UX-HIL007-P0-HOME-SHELF-NOISE` | P0 | 首页首屏仍常驻口令输入、相册入口、分享入口、聚会账本入口或其他杂货架卡组 | 前端 | 首页只保留创建主路径与必要进行中状态；历史/相册/分享/账本改入本局或二级页 |
| `PR-UX-HIL007-P1-HOME-SECONDARY-OVEREXPLAIN` | P1 | 首页首屏存在大段解释文案、规则说明或与主 CTA 并列的说明板块，压缩首屏效率 | 前端 | 保持 1 行副文案级别，避免说明性段落占据首屏 |
| `PR-UX-HIL007-P0-INVITE-CARD-NOT-MINIMAL` | P0 | 邀请卡仍保留说明性文字板块、长段玩法说明、等待室说明或多组动作堆叠 | 前端 | 邀请卡只保留口令主体、好友加入状态和单个主动作；删掉说明性厚卡 |
| `PR-UX-HIL007-P1-INVITE-STATUS-WEAK` | P1 | 好友加入状态不清楚，只有口令没有加入反馈，或状态被弱化成角落小字 | 前端 | 用头像组、人数短句或加入状态胶囊表达，紧跟口令卡出现 |
| `PR-UX-HIL007-P0-INSESSION-TAB-MISSING-LEDGER` | P0 | 进入本局后没有与 `记录 / 相册 / 分享` 同级的 `聚会账本` 标签卡 | 前端 | 四个标签必须同层可见，不能把账本下沉到更多菜单或弱入口 |
| `PR-UX-HIL007-P1-INSESSION-TAB-HIERARCHY-UNEVEN` | P1 | 四个标签卡大小、视觉权重或可点态不一致，导致账本像次级功能 | 前端 | 统一标签尺寸、选中态和点击反馈，保持同级导航语义 |
| `PR-UX-HIL007-P0-LEDGER-IDENTITY-MISSING` | P0 | 账本页列表不展示头像和用户名，只剩抽象数值、匿名行或工程 ID | 前端 | 每条账本记录必须可识别到用户身份；至少展示头像占位与用户名 |
| `PR-UX-HIL007-P0-LEDGER-HOST-ACTION-MISSING` | P0 | 邀请发起者无法执行加酒/减酒，或该操作被藏入深层弹层无法直达 | 前端 | 保留邀请发起者对账本的关键操作权，主操作在可见区域出现 |
| `PR-UX-HIL007-P1-LEDGER-DUPLICATE-ACTIONS` | P1 | 同一账本项或同一页重复出现多组 `加酒/减酒/确认/撤销` 按钮，主次混乱 | 前端 | 只保留一组主动作；次动作收口为更多或二级态 |
| `PR-UX-HIL007-P1-LEDGER-PRIMARY-SECONDARY-BLUR` | P1 | 账本主动作与次动作样式完全相同，无法判断哪一个是当前推荐操作 | 前端 | 主动作保留实心/高对比，次动作用描边/文本按钮，避免多主按钮并列 |

##### 12.7.30.6 预览框截图接收标准

| 核查项 | 需要的截图 / 摘要 | UI/UX 接收标准 | 缺失处理 |
| --- | --- | --- | --- |
| 首页无进行中聚会 | `index` 空态截图 + data 摘要（如 `hasActiveSession=false`） | 首屏不出现 `聚会待开局`，不出现口令/相册/分享/账本常驻入口，创建聚会主 CTA 明确 | 记 `待预览证据`，不得写首页通过 |
| 首页有进行中聚会 | `index` 有本局截图 + data 摘要（如 `hasActiveSession=true`、`sessionId`） | 仅此时出现 `聚会待开局` 或继续本局卡；卡片不压过创建主路径，不形成第二英雄大卡 | 命中 `PR-UX-HIL007-P0-HOME-OPENING-CARD-ALWAYS-ON` 或 `待证据` |
| 邀请卡极简 | 邀请页截图 + `inviteCode`、加入状态相关 data 摘要 | 一眼先见口令，其次见好友加入状态；无说明性厚卡和长段玩法文案 | 命中 `PR-UX-HIL007-P0-INVITE-CARD-NOT-MINIMAL` |
| 局内四标签 | 当前聚会页截图 + 当前选中标签 data 摘要 | `记录 / 相册 / 分享 / 聚会账本` 同层可见、同样可点，不隐藏账本 | 命中 `PR-UX-HIL007-P0-INSESSION-TAB-MISSING-LEDGER` |
| 聚会账本身份与操作 | 账本页截图 + 角色身份摘要（至少区分发起者/普通成员） | 行项有头像用户名；发起者看得到加酒/减酒；按钮不重复，主次分明 | 命中 `PR-UX-HIL007-P0-LEDGER-IDENTITY-MISSING`、`...HOST-ACTION-MISSING`、`...DUPLICATE-ACTIONS` |

##### 12.7.30.7 资产缺口与接入建议

当前判断：`本轮无强制新增资产`。007 主要是 IA 清理和状态减法，现有 Clean Slate 首页/账本视觉基线足够。

若前端缺基础元素，可按以下最小补充，不作为本轮必须项：

| 资产 | 建议路径 | 规格 | 用途 |
| --- | --- | --- | --- |
| 默认头像占位环 | `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs002-avatar-placeholder.svg` | 96x96 SVG | 账本行项在无真实头像时保持用户身份可识别 |
| 局内四标签轻量图标 | `docs/design-assets/party-recorder/clean-slate-001/cuts/` 下新命名 `pr-cs007-tab-*.svg` | 24x24 SVG | 若当前标签卡缺少统一图标体系，再补一套轻量图标；否则直接复用现有 icon 组件 |

##### 12.7.30.8 仍缺证据

- 前端 007 代码与截图尚未回包，本节仅为约束和退回码，不是实现接收。
- 缺首页 `hasActiveSession=true/false` 两态截图与 data 摘要。
- 缺邀请卡极简态截图，无法判断是否已删掉说明性厚卡。
- 缺局内四标签和账本页角色差异截图，无法确认发起者是否保留加减酒操作。
- 缺测试 `PR-QA-HOME-INVITE-LEDGER-CLEANUP-007-RETEST` 的 DevTools 9420 命令原文、截图、page/data/storage/console 摘要。

当前 UI/UX 状态：`007 已补前端可执行退回码与接收标准 / 待前端 007 回包截图后复核 / 不得据此写实现通过`。

#### 12.7.31 `PR-UX-LINK-CLEANUP-008` 链路收缩与内容直显约束

记录时间：2026-06-18。本节依据 `AGENTS.md`、`docs/party-recorder-redesign-requirements.md` 第 4.2 节、团队公告 `PR-PM-LINK-CLEANUP-008-NOTICE`、队列任务 `PR-UX-LINK-CLEANUP-008` 和 UI/UX 计划最新章节，输出 008 的退回码、截图接收标准和资产缺口；只改 UI/UX 计划，不改业务源码或 PM 总台账。

##### 12.7.31.1 精准读取范围与关键词

| 文件 | 精读定位 | 本轮提取关键词 |
| --- | --- | --- |
| `AGENTS.md` | 产品主目标、只改 UI/UX 计划、预览框验收、资产授权边界 | `三步内创建并拍第一张`、`只改计划/资产`、`预览框证据` |
| `docs/party-recorder-redesign-requirements.md` | `4.2 2026-06-18 链路收缩与内容直显规则` | `最近相册第一张照片`、`工具箱入口`、`个人中心去重`、`简报大图`、`图片直显参与分享`、`创建时间`、`去主题选择`、`邀请预览删冗余`、`说明 2 行`、`去仅自己`、`4 项全选` |
| `docs/gameplay-moments-team-announcements.md` | `PR-PM-LINK-CLEANUP-008-NOTICE` 行 | `不得继续用图片审核态阻塞展示/分享`、`工具箱不能删`、`个人中心不能都跳相册`、`不得写通过` |
| `docs/runtime/ai-thread-dispatch-queue.md` | `PR-UX-LINK-CLEANUP-008` 行 | `最近相册封面`、`工具箱列表可用`、`简报图片点大图返回`、`账本可编辑且无保存关键事件按钮` |
| `docs/gameplay-moments-ui-ux-development-plan.md` | `12.7.30`、`12.7.24`、`12.7.29`、`12.7.14`、`12.7.15` | `首页清洁规则`、`Clean Slate 页面保留`、`邀请预览口令卡`、`预览框证据口径`、`账本能力保留` |

##### 12.7.31.2 SKILL 选择记录

Reading this as: 已有小程序主链路的收口型 UI 清理任务，面向要快速开局并持续回看照片/账本的聚会用户，使用轻量、直显、低杂讯的 Clean Slate 语言。

| SKILL | 选择理由 | 使用边界 | 本轮是否生图 |
| --- | --- | --- | --- |
| `web-design-guidelines` | 本轮涉及点击返回、图片预览、空态兜底、按钮删减、长文案裁切、默认选中和工具入口可用性，需要可执行截图门禁 | 只用于规格和接收标准，不写实现通过 | 否 |
| `design-taste-frontend` | 本轮需要继续压低首页和邀请页的“杂货架感”，防止工具箱、个人中心和账本页回到旧壳与重复按钮堆叠 | 只用于视觉/层级退回口径，不生图、不改源码 | 否 |

未使用 `imagegen` / `imagegen-frontend-mobile`：008 以结构收缩、默认态和交互回流为主，现有 Clean Slate 资产足够，当前不需要新整页图。

##### 12.7.31.3 口径覆盖说明

- 本节在 12.7.30 基础上继续细化，不推翻“首页干净首屏”和“账本能力保留”两条主线。
- 007 的“首页底部不再常驻聚会账本”继续有效；008 进一步明确：首页底部入口改为 `工具箱`，但工具箱属于二级入口，不得重新变成主路径杂货架。
- 12.7.15 中“首页账本副主 CTA”旧口径继续失效；账本能力仍保留在局内同级标签与账本页编辑中。
- 取消图片审核机制不等于风控通过；UI/UX 只要求图片上传后直显并进入相册/简报/分享，风控门禁由 UGC 单独复核。

##### 12.7.31.4 页面级 UI/UX 标准

| 页面/模块 | 008 标准 | 不可接受形态 |
| --- | --- | --- |
| 首页最近相册封面 | 优先展示该聚会第一张上传照片；无照片才使用默认封面 | 用工具箱图标、无关插图、工程缩略图充当封面；有真实照片却仍显示默认图 |
| 首页底部入口 | 底部入口命名为 `工具箱`；入口清晰但降级为二级能力，不压主 CTA | 继续叫聚会账本；入口失效；底部出现多组工具入口；工具箱重新占据首屏主空间 |
| 工具箱列表 | 保留旧工具箱列表可用性，每个工具可进入、可返回，不是死入口 | 列表打开白屏、工具多数不可点、都跳同一空页 |
| 个人中心 `me` | 入口去重，不得出现大批重复按钮；入口分流清楚，不得大多数都跳相册 | 同义入口重复堆叠；多个按钮实际都进相册；统计/会员/历史层级混乱 |
| 简报图片预览 | 简报内图片可点开大图，再点大图返回简报原位 | 点击无反应；点开后无法返回；返回丢失简报上下文 |
| 图片直显与分享 | 上传后的图片直接出现在相册/简报/分享，不再用审核态阻塞展示 | 仍显示“待审核后可见/可分享”；分享链路不消费新图片 |
| 聚会列表创建时间 | 列表项展示当前实时时间创建值，信息层级低于聚会名和封面 | 时间缺失；时间写成调试字段；时间抢主标题层级 |
| 创建页 `create-session` | 默认链路移除轻量主题选择，直接围绕聚会名、创建动作和即时创建展开 | 主题选择仍占一步；主题卡仍出现在默认创建首屏 |
| 邀请预览 / 口令加入状态 | 去掉“照片记录 + 聚会账本”整块、口令安全区模块和分享给好友/群/海报三按钮；只留必要口令和加入状态 | 邀请页继续堆整块说明、冗余模块、三分享按钮或安全区说明块 |
| 拍第一张后保存 | 第一张上传成功后，点保存照片进入聚会进行中页，而不是首页 | 保存后回首页；保存后丢 session；仍停留错误页面 |
| 拍照说明区 | 说明文案最多 2 行，下方提供默认可选文案，点击即可填充 | 长段说明占屏；无默认文案可选；默认文案点击无效 |
| 可见与授权 | 去掉“仅自己”；默认 4 个选项全选 | 仍保留“仅自己”；默认未全选；授权块层级混乱 |
| 聚会账本编辑 | 展示欠酒/加酒等真实账本数据，可编辑；不得出现“保存关键事件”替代按钮 | 只剩抽象事件流；无欠酒/加酒；出现“保存关键事件”主按钮替代编辑能力 |

##### 12.7.31.5 退回码

| 退回码 | 分级 | 触发条件 | 责任角色 | 修复口径 |
| --- | --- | --- | --- | --- |
| `PR-UX-LC008-P0-RECENT-ALBUM-FIRST-PHOTO-MISSING` | P0 | 最近相册已有真实照片，但首页封面未使用第一张上传照片 | 前端 | 用第一张照片作封面；仅在无照片时回退默认封面 |
| `PR-UX-LC008-P1-RECENT-ALBUM-DEFAULT-COVER-WRONG` | P1 | 无照片默认封面使用无关图标、拉伸图或旧工具缩略图 | 前端 + UI/UX | 使用统一默认封面或 clean 空态贴纸，不得复用工具图 |
| `PR-UX-LC008-P0-TOOLBOX-ENTRY-MISSING` | P0 | 首页底部没有 `工具箱` 入口，或仍显示为聚会账本入口 | 前端 | 底部入口命名和跳转改为工具箱；账本不回首页常驻 |
| `PR-UX-LC008-P0-TOOLBOX-LIST-DEAD` | P0 | 工具箱列表无法进入、白屏、主要工具失效或多数工具为死入口 | 前端 | 保证旧工具箱列表可用；至少能进入和返回，不是假入口 |
| `PR-UX-LC008-P1-TOOLBOX-PRIMARY-POLLUTION` | P1 | 工具箱入口或列表重新占据首页/个人中心主视觉，压主路径 | 前端 | 工具箱保持二级入口，不回到首页杂货架主位 |
| `PR-UX-LC008-P0-ME-DUPLICATE-ENTRY` | P0 | 个人中心出现明显重复入口或不同按钮跳向同一相册页 | 前端 | 去重并重排入口；不同按钮必须有不同任务语义 |
| `PR-UX-LC008-P1-ME-ROUTE-SEMANTIC-BLUR` | P1 | 个人中心入口标题不同但落点和用户预期不一致，产生误导 | 前端 | 入口命名与落点一一对应，避免“我的聚会/我的相册/继续记录”混跳 |
| `PR-UX-LC008-P0-BRIEF-LIGHTBOX-MISSING` | P0 | 简报图片不能点大图，或点开后无法返回简报 | 前端 | 建立点击放大与返回原页闭环，不丢当前简报上下文 |
| `PR-UX-LC008-P0-PHOTO-DIRECT-VISIBILITY-BLOCKED` | P0 | 上传后的图片仍被审核态、占位态或隐藏逻辑阻塞，未直显到相册/简报/分享 | 前端 + 后端/API | 取消审核阻塞展示；图片上传后直接进入可见链路 |
| `PR-UX-LC008-P1-PHOTO-SHARE-CONSUME-MISSING` | P1 | 图片已在相册出现，但简报或分享页未消费最新图片 | 前端 + 接口联调 | 补齐简报/分享字段消费，不让分享继续停留旧空态 |
| `PR-UX-LC008-P1-CREATED-AT-MISSING` | P1 | 聚会列表项不展示创建时间，或显示工程字段/非实时占位 | 前端 + 后端/API | 使用当前实时时间字段，降级为次级信息显示 |
| `PR-UX-LC008-P0-CREATE-THEME-STEP-RETURN` | P0 | 创建页默认首屏仍出现轻量主题选择，继续占用创建步骤 | 前端 | 默认创建链路删主题选择；聚焦名称、创建、邀请 |
| `PR-UX-LC008-P0-INVITE-PREVIEW-MODULE-REDUNDANT` | P0 | 邀请预览仍显示“照片记录 + 聚会账本”模块、口令安全区模块或三分享按钮 | 前端 | 只保留口令和加入状态，删除冗余展示模块与按钮 |
| `PR-UX-LC008-P0-FIRST-PHOTO-SAVE-RETURNS-HOME` | P0 | 第一张照片保存后返回首页或丢失进行中聚会上下文 | 前端 | 保存后进入聚会进行中页，保留当前 session |
| `PR-UX-LC008-P1-DESCRIPTION-OVER-TWO-LINES` | P1 | 拍照说明文案超过 2 行，或占据主要屏幕高度 | 前端 | 文案收口为 2 行内，默认可选文案移到下方短入口 |
| `PR-UX-LC008-P1-DEFAULT-COPY-MISSING` | P1 | 拍照/上传后没有默认可选文案，或点击填充无反馈 | 前端 | 提供 2-4 条默认文案，点击即填充 |
| `PR-UX-LC008-P0-AUTH-SELF-OPTION-EXISTS` | P0 | 可见与授权仍有“仅自己”选项 | 前端 | 移除“仅自己” |
| `PR-UX-LC008-P1-AUTH-DEFAULTS-WRONG` | P1 | 4 个授权选项未默认全选，或默认态不清楚 | 前端 | 默认全选并明确选中反馈 |
| `PR-UX-LC008-P0-LEDGER-DEBT-DATA-MISSING` | P0 | 账本页看不到欠酒/加酒等真实数据，只剩空壳或事件描述 | 前端 + 后端/API | 展示真实账本数据与行项编辑入口 |
| `PR-UX-LC008-P0-LEDGER-SAVE-EVENT-BUTTON-RETURN` | P0 | 账本页继续出现“保存关键事件”按钮替代账本编辑 | 前端 | 去掉该按钮，恢复账本编辑语义 |
| `PR-UX-LC008-P1-LEDGER-EDITABILITY-WEAK` | P1 | 账本数据存在但编辑入口弱、隐藏过深或主次不清 | 前端 | 编辑入口前置，保持发起者可操作和普通成员可读的差异 |

##### 12.7.31.6 预览框截图接收标准

| 核查项 | 需要的截图 / 摘要 | UI/UX 接收标准 | 缺失处理 |
| --- | --- | --- | --- |
| 最近相册封面 | 首页最近相册有照片态 + 无照片态截图；data 摘要含封面来源 | 有照片时封面为第一张上传照片；无照片时才出现默认封面 | 缺任一态只记 `待预览证据` |
| 工具箱入口与列表 | 首页底部工具箱入口截图 + 工具箱列表截图 + 至少 2 个工具点击记录 | 首页底部是 `工具箱`；工具列表可进入、可返回，不是死入口 | 命中 `...TOOLBOX-ENTRY-MISSING` / `...TOOLBOX-LIST-DEAD` |
| 个人中心去重 | `me` 页截图 + page/data 摘要 | 入口不重复；不同按钮落点不同，不得大多跳相册 | 命中 `...ME-DUPLICATE-ENTRY` |
| 简报大图返回 | 简报图缩略态截图 + 点开大图截图 + 返回后截图 | 点击可放大，返回后回到原简报，不跳首页/相册 | 命中 `...BRIEF-LIGHTBOX-MISSING` |
| 图片直显参与分享 | 相册、简报、分享三页截图 + `photoHighlights` / 相册 data 摘要 | 新上传图片无需审核即可出现在三条链路至少两条，并能进入分享消费 | 命中 `...PHOTO-DIRECT-VISIBILITY-BLOCKED` / `...PHOTO-SHARE-CONSUME-MISSING` |
| 创建时间 | 聚会列表页截图 + `createdAt` 摘要 | 每个聚会项展示创建时间，且为次级信息，不压标题 | 命中 `...CREATED-AT-MISSING` |
| 创建页去主题 | `create-session` 首屏截图 + data 摘要 | 默认创建首屏无轻量主题选择模块 | 命中 `...CREATE-THEME-STEP-RETURN` |
| 邀请预览减法 | 邀请预览截图 + 口令加入状态截图 | 不再出现照片/账本整块、安全区模块和三分享按钮，只保留必要口令与加入状态 | 命中 `...INVITE-PREVIEW-MODULE-REDUNDANT` |
| 第一张保存回流 | 拍照成功态、点击保存后页态截图或连续录屏 | 保存后进入进行中页，不回首页 | 命中 `...FIRST-PHOTO-SAVE-RETURNS-HOME` |
| 说明 2 行与默认文案 | 拍照说明区截图 + 默认文案点击后截图 | 说明不超过 2 行；默认文案可点击填充 | 命中 `...DESCRIPTION-OVER-TWO-LINES` / `...DEFAULT-COPY-MISSING` |
| 授权默认态 | 授权区截图 + data 摘要 | 无“仅自己”；4 项默认全选且可见 | 命中 `...AUTH-SELF-OPTION-EXISTS` / `...AUTH-DEFAULTS-WRONG` |
| 账本编辑 | 账本页截图 + 角色摘要 + 欠酒/加酒 data | 看得到欠酒/加酒数据，可编辑，无“保存关键事件”按钮 | 命中 `...LEDGER-DEBT-DATA-MISSING` / `...LEDGER-SAVE-EVENT-BUTTON-RETURN` |

##### 12.7.31.7 资产缺口与建议路径

当前判断：`008 不强制新增整页设计图，但建议补 3 类小资产或复用现有素材`。

| 资产 | 建议路径 | 规格 | 用途 | 当前判断 |
| --- | --- | --- | --- | --- |
| 最近相册默认封面 | `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008-recent-album-default-cover.svg` | 720x720 SVG 或 WebP；浅暖底 + 轻贴纸，文件 < 80KB | 无照片时的统一默认封面，避免用工具图/空白块 | 建议补 |
| 工具箱入口图标 | `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008-toolbox-entry.svg` | 64x64 SVG；单色或双色 | 首页底部 `工具箱` 入口统一图标 | 可选，若现有 icon 体系不足再补 |
| 简报大图预览遮罩/关闭态 | `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008-lightbox-mask.svg` | 390x844 参考 PNG/SVG；仅作遮罩参考 | 简报大图预览若缺统一遮罩和返回态样式，可补最小视觉参考 | 可选 |

现有可复用素材：

- `miniprogram/assets/party-recorder/party-recorder-empty-album-sticker.png`
- `miniprogram/assets/party-recorder/party-recorder-album-bg.webp`

字体结论：继续使用系统字体栈，不新增字体文件。

##### 12.7.31.8 仍缺证据

- 前端 `PR-FE-LINK-CLEANUP-008` 尚未回包代码证据和截图。
- 缺后端/API 008 的字段矩阵，当前无法确认 `createdAt`、第一张照片封面字段、账本欠酒/加酒可编辑字段的最终合同。
- 缺接口联调 008 的复测样本，当前无法证明简报大图、图片直显参与分享和工具箱列表的真实 data。
- 缺测试 `PR-QA-LINK-CLEANUP-008-RETEST` 的 DevTools 9420 命令原文、截图、page/data/storage/console 摘要。
- 缺 UGC 008 对“取消审核后直显”的后置门禁口径；因此本节不能把图片直显写成风控通过。

当前 UI/UX 状态：`008 已补退回码、截图接收标准和资产缺口 / 待前端与测试回包后复核 / 不得据此写实现通过`。

#### 12.7.32 `PR-UX-LINK-CLEANUP-008-IMPLEMENT-REVIEW` 待证据复核登记

记录时间：2026-06-18。PM 已追加 008 实现复核依赖说明：接口联调 3.40 已确认 `prcs-008` 样本仍存在，`photoHighlights/accountingHighlights/keyEvents/readyShareImageUrl` 等 clean 聚合字段应来自 `/api/v1/briefs/:briefId` 与 `/api/v1/share-images/:taskId`；前端还需执行 `PR-FE-LINK-CLEANUP-CLEAN-FACADE-008-FIX`，测试随后执行 `PR-QA-LINK-CLEANUP-008-RUN-LOCAL-FACADE`。本节只更新 UI/UX 待证据清单和退回码使用方式，不写设计通过。

##### 12.7.32.1 本轮读取补充

| 文件 | 精读定位 | 本轮新增关键词 |
| --- | --- | --- |
| `docs/gameplay-moments-team-announcements.md` | `PR-PM-LINK-CLEANUP-008-FRONTEND-PARTIAL`、`PR-PM-LINK-CLEANUP-008-FACADE-FIX` | `brief not found`、`task failed`、`clean facade`、`真实照片+账本同屏` |
| `docs/runtime/ai-thread-dispatch-queue.md` | `PR-FE-LINK-CLEANUP-CLEAN-FACADE-008-FIX`、`PR-QA-LINK-CLEANUP-008-RUN`、`PR-QA-LINK-CLEANUP-008-RUN-LOCAL-FACADE`、`PR-UX-LINK-CLEANUP-008-IMPLEMENT-REVIEW` | `local 3221`、`readyShareImageUrl`、`photoHighlights/accountingHighlights/keyEvents` |
| `docs/gameplay-moments-interface-integration-test-plan.md` | `3.40` | `raw 路径不保证 clean 聚合字段`、`/briefs/:briefId`、`/share-images/:taskId` |
| `docs/gameplay-moments-ui-ux-development-plan.md` | `12.7.31` | `退回码复用`、`只等测试新证据` |

##### 12.7.32.2 待证据门槛

- UI/UX 本轮接收只认测试 `PR-QA-LINK-CLEANUP-008-RUN` 或 `PR-QA-LINK-CLEANUP-008-RUN-LOCAL-FACADE` 的新截图 / page data / Console 摘要。
- 没有真实照片 + 聚会账本同屏、ready 保存图、简报图片点开返回、首页封面、工具箱列表、邀请预览减法、授权默认态、账本编辑证据时，一律保持 `待证据`。
- 若测试仍拿到 `brief not found`、`task failed`、空 `photoHighlights/accountingHighlights/keyEvents`、raw 字段或旧壳截图，不得写实现通过，直接按 12.7.31 退回码退回前端/接口联调/后端/API。

##### 12.7.32.3 UI/UX 待证据清单

| 复核项 | 当前状态 | UI/UX 可接受的新证据 | 缺证据时处理 |
| --- | --- | --- | --- |
| 最近相册第一张封面 | 待证据 | 首页最近相册有照片态 + 无照片态截图；page/data 明示 `coverPhotoUrl` 或等效来源 | 保持 `PR-UX-LC008-P0-RECENT-ALBUM-FIRST-PHOTO-MISSING` / `...DEFAULT-COVER-WRONG` 待触发 |
| 工具箱入口和工具列表 | 待证据 | 首页底部 `工具箱` 入口截图 + 工具箱列表截图 + 至少 2 个工具点击记录 | 保持 `PR-UX-LC008-P0-TOOLBOX-ENTRY-MISSING` / `...TOOLBOX-LIST-DEAD` 待触发 |
| 个人中心去重 | 待证据 | `me` 页截图 + 入口点击落点记录 | 保持 `PR-UX-LC008-P0-ME-DUPLICATE-ENTRY` / `...ME-ROUTE-SEMANTIC-BLUR` 待触发 |
| 简报图片点大图返回 | 依赖 clean facade | 简报缩略图、点开大图、返回后落回简报三连截图；`briefId` 可读且非 `brief not found` | 若样本仍不可读，退接口联调 3.40 / 前端 clean facade，不做 UI/UX 通过判断 |
| 图片直显参与分享 | 依赖 clean facade + ready task | 相册/简报/分享至少两页显示同一批真实照片；`photoHighlights` 非空；分享不是 failed 空态 | 若仍为空态或 failed task，退前端 `PR-FE-LINK-CLEANUP-CLEAN-FACADE-008-FIX` 和测试/接口补样本 |
| ready 保存图 | 依赖 ready task | `share-poster` ready 截图或 page data，含 `readyShareImageUrl` / `shareTask.status=ready`；不是 failed 空壳 | 无 ready 证据不得写分享相关通过 |
| 创建时间 / 无主题选择 | 待证据 | 聚会列表 `createdAt` 截图 + 创建页默认首屏截图 | 保持 `PR-UX-LC008-P1-CREATED-AT-MISSING` / `...CREATE-THEME-STEP-RETURN` 待触发 |
| 邀请预览删模块和按钮 | 待证据 | 邀请预览截图 + 口令加入状态截图，证明已删除照片/账本整块、安全区模块和三分享按钮 | 保持 `PR-UX-LC008-P0-INVITE-PREVIEW-MODULE-REDUNDANT` 待触发 |
| 拍第一张保存进入进行中 | 待证据 | 上传成功后点保存的连续截图或录屏，落点为进行中页而非首页 | 保持 `PR-UX-LC008-P0-FIRST-PHOTO-SAVE-RETURNS-HOME` 待触发 |
| 说明 2 行 + 默认文案 | 待证据 | 拍照说明区截图 + 默认文案点击填充后截图 | 保持 `PR-UX-LC008-P1-DESCRIPTION-OVER-TWO-LINES` / `...DEFAULT-COPY-MISSING` 待触发 |
| 授权默认态 | 待证据 | 授权区截图 + data 摘要，证明无“仅自己”且 4 项全选 | 保持 `PR-UX-LC008-P0-AUTH-SELF-OPTION-EXISTS` / `...AUTH-DEFAULTS-WRONG` 待触发 |
| 账本欠酒/加酒可编辑 | 待证据 | 账本页截图 + 角色摘要 + 欠酒/加酒 data；无“保存关键事件”按钮 | 保持 `PR-UX-LC008-P0-LEDGER-DEBT-DATA-MISSING` / `...SAVE-EVENT-BUTTON-RETURN` / `...EDITABILITY-WEAK` 待触发 |

##### 12.7.32.4 退回码使用方式

- 首页封面、工具箱、个人中心、创建页、邀请预览、说明区、授权默认态、账本编辑：
  继续直接复用 12.7.31 对应退回码，测试一旦给出有效截图即可判定。
- 简报大图、图片直显参与分享、ready 保存图：
  先看测试是否明确使用 clean facade `/api/v1/briefs/:briefId`、`/api/v1/share-images/:taskId`。
  - 若是 clean facade 且字段非空，再按 12.7.31 退回码做 UI/UX 复核。
  - 若仍是 raw 路径、`brief not found`、`task failed` 或字段为空，优先退前端 `PR-FE-LINK-CLEANUP-CLEAN-FACADE-008-FIX` 与接口联调 3.40，不进入 UI/UX 通过判断。

##### 12.7.32.5 下一步责任人

- 前端：完成 `PR-FE-LINK-CLEANUP-CLEAN-FACADE-008-FIX`，确保成员态读取 clean facade，补 `photoHighlights/accountingHighlights/keyEvents/readyShareImageUrl/shareTask.status=ready` 证据。
- 测试：执行 `PR-QA-LINK-CLEANUP-008-RUN-LOCAL-FACADE`，优先回收首页封面、工具箱、创建页去主题、邀请预览减法、授权默认态、账本编辑；简报大图和 ready 保存图必须基于 clean facade 可读样本。
- 接口联调：若测试仍报 `brief not found` / `task failed` / 空聚合字段，继续给 query、storage、token 后 8 位和 local 3221 可读性证据。
- 后端/API：仅当前端因兼容仍需 raw parity 时，再执行 `PR-BE-LINK-CLEANUP-RAW-PARITY-008-CHECK`；否则不扩大实现。

当前 UI/UX 状态：`008-IMPLEMENT-REVIEW 已登记待证据复核动作 / 无新截图时继续待证据 / 不得写设计通过`。

#### 12.7.33 `PR-UX-LINK-CLEANUP-008B-UX-DELTA-REVIEW` 用户口径增量约束

记录时间：2026-06-18。PM 追加 008B 用户最新要求。本节只补 UI/UX 计划和复核口径，不改业务源码或 PM 文档；无新截图时继续 `待证据`，不写实现通过。008B 视为对 12.7.31 / 12.7.32 的增量收紧，而不是另起一套标准。

##### 12.7.33.1 增量覆盖说明

- 首页 / 邀请卡 / 局内账本的结构性要求继续复用 12.7.30。
- 008 的链路收缩与内容直显要求继续复用 12.7.31。
- 008 实现复核的 clean facade 依赖和“只认测试新证据”门槛继续复用 12.7.32。
- 008B 新增重点是两类：
  - 把用户最新措辞转成更明确的截图 / page data 接收标准。
  - 补一组 `数据破界 / 无关文字` 的 P0 退回码，避免 `PR Seed`、`IT-MOMENTS`、接口错误、raw/debug、旧品牌词重新进入用户界面。

##### 12.7.33.2 008B 接收标准增量

| 复核项 | 008B 接收标准 | 备注 |
| --- | --- | --- |
| 首页“聚会待开局” | 仅当存在进行中或待继续聚会时出现；无本局时整块不渲染 | 继续复用 007 首页非常驻规则 |
| 首页底部入口 | 底部无口令/相册/分享/账本；只保留 `工具箱` 二级入口 | 不得回到首页杂货架 |
| 最近相册封面 | 第一张上传照片优先；无图默认封面 | 继续要求有照片态 + 无照片态双证据 |
| 邀请卡 / 邀请预览 | 只保留口令与好友加入状态；删掉照片记录+账本、安全区、分享/群/保存海报按钮和过多说明 | 极简，不许回到说明性厚卡 |
| 局内四 tab | `记录 / 相册 / 分享 / 聚会账本` 同级可见、同层可点 | 账本不能弱化为二级入口 |
| 账本编辑 | 展示头像/用户名、欠酒/加酒数据可编辑；主持/发起者可操作；加减按钮主次清楚；重复按钮清理；无“保存关键事件” | 继续复用 007 + 008 的账本门禁 |
| 个人中心 | 入口去重且功能分流，不得大多数都跳相册 | 强调“不同入口不同落点” |
| 简报图片 | 点击大图，再点返回，回到简报原位 | 仍依赖 clean facade 可读样本 |
| 图片直显与分享 | 图片直显并参与分享，不出现审核阻塞文案；同时保留隐私/授权/举报删除边界 | “取消审核前置”不等于风控通过 |
| 创建时间 / 创建页 / 拍第一张 | 创建时间实时进列表；创建页无轻量主题；拍第一张保存进入进行中 | 三条都要有对应截图或 page data |
| 说明 / 授权 | 说明最多 2 行 + 默认文案；授权无“仅自己”且 4 项全选 | 缺其一即待证据或退回 |
| 数据破界 / 无关文字 | 用户界面不得出现 `PR Seed`、`IT-MOMENTS`、接口错误、raw/debug、历史旧品牌用户文案 | 这是新增 P0 零容忍项 |

##### 12.7.33.3 008B 增量退回码

| 退回码 | 分级 | 触发条件 | 责任角色 | 修复口径 |
| --- | --- | --- | --- | --- |
| `PR-UX-LC008B-P0-HOME-OPENING-CARD-ALWAYS-ON` | P0 | 无进行中/待继续聚会时首页仍展示 `聚会待开局`、`继续本局` 等状态卡 | 前端 | 仅在有 active/continue session 时渲染 |
| `PR-UX-LC008B-P0-HOME-BOTTOM-NOISE-RETURN` | P0 | 首页底部仍出现口令、相册、分享、账本入口，或工具箱以外的常驻次入口 | 前端 | 首页底部只保留工具箱，不回旧杂货架 |
| `PR-UX-LC008B-P0-INVITE-MINIMAL-FAIL` | P0 | 邀请卡/邀请预览仍保留照片记录+账本模块、安全区模块、分享/群/海报按钮或过多说明 | 前端 | 回到极简口令 + 好友加入状态 |
| `PR-UX-LC008B-P0-INSESSION-LEDGER-WEAKENED` | P0 | 局内四 tab 中账本未同级，或账本虽存在但明显弱化为次入口 | 前端 | 保持四 tab 同级权重 |
| `PR-UX-LC008B-P0-LEDGER-SAVE-EVENT-RETURN` | P0 | 账本页出现“保存关键事件”按钮，替代欠酒/加酒编辑 | 前端 | 去掉该按钮，恢复账本编辑能力 |
| `PR-UX-LC008B-P0-DATA-LEAK-COPY` | P0 | 用户界面出现 `PR Seed`、`IT-MOMENTS`、接口错误原文、`raw/debug`、旧品牌主文案或其他工程字段 | 前端 + 后端/API + 接口联调 | 所有内部字段只允许停留在测试摘要/page data，不得进 UI |
| `PR-UX-LC008B-P1-ME-FLOW-DUPLICATE` | P1 | 个人中心入口虽已减少，但功能分流仍不清楚，多个入口语义重叠 | 前端 | 入口语义和落点一一对应 |
| `PR-UX-LC008B-P1-LEDGER-ACTION-HIERARCHY` | P1 | 账本加减按钮虽存在，但主次不清、重复或编辑入口过深 | 前端 | 保留单组主动作，弱化次动作 |
| `PR-UX-LC008B-P1-PHOTO-DIRECT-COPY-BLOCK` | P1 | 图片已直显，但页面仍保留“待审核后展示/分享”类文案 | 前端 + UGC | 去掉审核阻塞文案，改为隐私/举报/删除后置治理文案 |

##### 12.7.33.4 008B 截图 / page data 接收标准

| 核查项 | 最低证据 | UI/UX 接收要求 | 无证据处理 |
| --- | --- | --- | --- |
| 首页非常驻 + 工具箱 | 首页无本局态截图、首页有本局态截图、底部工具箱截图、对应 data 摘要 | 无本局不出现 `聚会待开局`；有本局才出现；底部无口令/相册/分享/账本，改工具箱 | 保持待证据；若与截图相反直接退前端 |
| 邀请极简态 | 邀请卡截图、邀请预览截图、口令加入状态 data | 只能看到口令和好友加入状态，不出现冗余模块/按钮/长说明 | 命中 `PR-UX-LC008B-P0-INVITE-MINIMAL-FAIL` |
| 局内四 tab + 账本编辑 | 当前聚会页四 tab 截图、账本页截图、角色摘要、欠酒/加酒 data | 四 tab 同级；账本有头像/用户名、欠酒/加酒可编辑、无保存关键事件 | 命中 `...INSESSION-LEDGER-WEAKENED` / `...LEDGER-SAVE-EVENT-RETURN` |
| 个人中心分流 | `me` 页截图 + 入口点击落点记录 | 去重且分流，不大多跳相册 | 命中 `PR-UX-LC008B-P1-ME-FLOW-DUPLICATE` |
| 简报大图返回 | 简报缩略态 / 大图态 / 返回后态三连截图；`briefId` 可读 | 点开大图后能回原简报；仍需 clean facade 非空样本 | 样本空或 `brief not found` 时继续退接口/前端，不做 UI 通过 |
| 图片直显参与分享 | 相册、简报、分享三页中至少两页截图 + `photoHighlights` 非空 | 图片已直显，且无审核阻塞文案；保留隐私/举报/删除边界表达 | 空态/failed/raw 仍待证据或退前端/接口 |
| 创建时间 / 无主题 / 第一张回流 / 说明 / 授权 | 聚会列表 `createdAt` 截图、创建页首屏截图、第一张保存回流截图、说明区截图、授权区截图 | 全部命中 12.7.31 原标准，且不得外露工程字段或接口错文案 | 任一缺失继续待证据 |
| 数据破界文字 | 全部关键页截图 + page data 摘要对照 | 用户界面零容忍工程字串；page data 可保留给测试，不得直接上屏 | 命中 `PR-UX-LC008B-P0-DATA-LEAK-COPY` |

##### 12.7.33.5 资产 / 字体 / 光效缺口

当前判断：`008B 无强制新增字体或光效资产`。仍沿用 12.7.31 的最小建议。

可选补充：

| 资产 | 建议路径 | 规格 | 说明 |
| --- | --- | --- | --- |
| 最近相册默认封面 | `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008-recent-album-default-cover.svg` | 720x720 SVG/WebP | 继续作为无图默认封面建议 |
| 工具箱入口图标 | `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008-toolbox-entry.svg` | 64x64 SVG | 若现有 icon 体系不足再补 |
| 简报大图遮罩 | `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008-lightbox-mask.svg` | 390x844 参考 SVG/PNG | 若前端缺统一大图返回态遮罩再补 |

字体结论：继续系统字体栈，不新增字体文件。
光效结论：008B 不是视觉扩稿任务，不新增背景光效。

##### 12.7.33.6 当前复核状态

- 前端 008B / 008 clean facade / 测试复测截图尚未回收。
- 当前所有 008B 项继续归类为 `待证据`。
- 一旦测试新证据仍是空态、failed task、raw 字段、接口错文案或旧壳，即直接按 12.7.31 + 12.7.33 退回码退回，不写实现通过。

当前 UI/UX 状态：`008B 已补增量接收标准与退回码 / 等前端 008B 与测试复测新证据 / 不写通过`。

#### 12.7.34 `PR-UX-LINK-CLEANUP-008E-PHOTO-LEDGER-VISUAL-REVIEW` 成员态视觉复核

记录时间：2026-06-18。PM 已明确 13.16.71 属于 Storage 污染误判，13.16.72 已在 `memberA` / token 尾号 `4ea6c85e` 下重跑。本节只基于正确成员态截图建立 008E 视觉接收/退回标准，不改源码或 PM 总台账；不得要求用户再补真机截图，不写设计通过或上线通过。

##### 12.7.34.1 截图索引

| 页面 | 截图 | 本轮观察重点 |
| --- | --- | --- |
| 聚会简报 | `docs/runtime/pr-qa-link-cleanup-008d-retry-brief-20260618.png` | 记录/相册卡已具备成员态数量，但两张图片区域仍是整块偏白占位，未形成真实照片视觉 |
| 分享海报 | `docs/runtime/pr-qa-link-cleanup-008d-retry-share-poster-20260618.png` | 照片卡有标题，但卡面仍偏白，缺真实像素细节；账本区独立成小卡，事件区较厚 |
| 邀请预览 / 回流 | `docs/runtime/pr-qa-link-cleanup-008d-retry-share-preview-20260618.png` | 口令与加入状态已产品化，但两张照片卡仍接近白卡，分享内容卡视觉过弱 |
| 记录/账本同页 | `docs/runtime/pr-qa-link-cleanup-008d-retry-live-record-20260618.png` | 四 tab 已出现，但记录卡缩略图偏白，像未载入成功的空照片壳 |
| 独立聚会账本 | `docs/runtime/pr-qa-link-cleanup-008d-retry-ledger-20260618.png` | 独立账本页仍为 `欠酒 0 / 加酒 0`，未证明真实账本数据与编辑能力 |
| 我的相册 | `docs/runtime/pr-qa-link-cleanup-008d-retry-album-20260618.png` | 列表项时间已出现，但封面区域仍偏白，未达到“首张照片优先”视觉要求 |

##### 12.7.34.2 SKILL 使用记录

| SKILL | 选择理由 | 使用边界 |
| --- | --- | --- |
| `web-design-guidelines` | 本轮是成员态实现截图复核，需要判断真实图片是否可见、层级是否清楚、按钮是否过多、状态是否误导 | 只用于截图/页面 data 接收，不写实现通过 |
| `design-taste-frontend` | 本轮要判断白卡感、空壳感、账本独立页层级和按钮密度是否仍像未完成壳层 | 只用于视觉/层级退回，不生图、不改源码 |

##### 12.7.34.3 复核结论

当前结论：`成员态样本已从“拿错 storage”转为可复核阶段，但照片可视性和独立账本页仍需 P0/P1 退回；不得写 008 设计通过`。

| 页面 | 结论 | 分级 | 依据 |
| --- | --- | --- | --- |
| `brief` 聚会简报 | 退回 | P0 | 照片区仍是偏白大块，用户无法一眼判断这是真实照片还是空占位；不满足“图片直显并参与分享” |
| `share-poster` 分享海报 | 退回 | P0 | 两张照片卡标题存在，但卡面仍近似白卡，未形成真实照片墙；账本高光权重也不足以支撑“照片+账本同屏主视觉” |
| `share-preview` 邀请预览 | 退回 | P0 | 口令和加入状态已成立，但主视觉照片仍接近空白卡片，分享内容没有真实照片说服力 |
| `live-record` 记录/账本 | 局部接收后继续退回 | P1 | 四 tab 同级结构方向正确，但记录卡缩略图偏白，尚未证明实时照片墙已真正可见 |
| `ledger` 独立聚会账本 | 退回 | P0 | 欠酒/加酒仍为 0，未显示真实账本数据，也未证明编辑入口；当前不能因为 live-record 动态值恢复就放行独立账本页 |
| `album` 我的相册 | 退回 | P1 | 标题、创建时间和状态已产品化，但封面仍偏白，未达到“第一张照片优先、无图才默认”的视觉标准 |

##### 12.7.34.4 退回码

| 退回码 | 分级 | 触发条件 | 责任角色 | 修复口径 |
| --- | --- | --- | --- | --- |
| `PR-UX-LC008E-P0-PHOTO-CARD-WHITEOUT` | P0 | 简报 / 分享 / 邀请预览 / 相册中的照片卡或缩略图仍是偏白卡面，无法辨认真实照片像素 | 前端 | 确保真实图片渲染进入卡面；无图时要明确默认封面或合格空态，不得用“像加载失败的白块”代替 |
| `PR-UX-LC008E-P0-SHARE-PHOTO-NOT-REAL` | P0 | `share-poster` / `share-preview` 虽有标题或计数，但主视觉照片仍无法证明来自真实成员态照片 | 前端 + 接口联调 | 让 clean facade 照片字段真正落到分享照片卡；继续保留成员态 query/data 证据 |
| `PR-UX-LC008E-P0-LEDGER-INDEPENDENT-ZEROED` | P0 | 独立 `ledger` 页仍显示 `欠酒 0 / 加酒 0`，未呈现真实账本数据 | 前端 + 后端/API + 接口联调 | 独立账本页必须消费真实欠酒/加酒数据，不能只修 live-record 内嵌账本 |
| `PR-UX-LC008E-P0-LEDGER-EDIT-PROOF-MISSING` | P0 | 成员态截图里看不到可操作的加减酒编辑入口，无法证明主持/发起者可操作 | 前端 + 测试 | 补主持/发起者角色截图或点击记录；没有编辑证据不得判定账本通过 |
| `PR-UX-LC008E-P1-LEDGER-HIERARCHY-WEAK` | P1 | 账本区存在，但数字、标签和按钮主次不清，像静态统计卡 | 前端 | 提升欠酒/加酒数字可读性，压缩重复按钮，主次动作拉开 |
| `PR-UX-LC008E-P1-BRIEF-EVENT-STACK-HEAVY` | P1 | 简报/海报事件区过厚，压缩了照片与账本的主视觉空间 | 前端 | 事件收敛到 2-3 条，避免厚列表挤压照片墙与账本高光 |
| `PR-UX-LC008E-P1-ALBUM-COVER-WEAK` | P1 | 相册页已非工程字段，但封面仍更像默认白块而不是首张照片或明确默认封面 | 前端 | 有图时用首张照片；无图时用统一默认封面资产 |

##### 12.7.34.5 截图 / page data 接收标准

| 核查项 | 最低证据 | UI/UX 接收要求 | 无证据处理 |
| --- | --- | --- | --- |
| 照片真实可见 | `brief/share-poster/share-preview/live-record/album` 任一页截图 + 对应 `photoHighlights` 或封面来源 page data | 照片卡必须能看出真实像素内容，而非纯白卡、白洞或近似加载失败占位 | 命中 `PR-UX-LC008E-P0-PHOTO-CARD-WHITEOUT` |
| 分享 / 简报双主视觉 | `share-poster`、`share-preview`、`brief` 截图 + `photoHighlights/accountingHighlights` 非空摘要 | 照片和账本都可读，且照片不是白卡，账本不是底部弱小卡 | 命中 `...SHARE-PHOTO-NOT-REAL` 或 `...LEDGER-HIERARCHY-WEAK` |
| 独立账本真实数据 | `ledger` 页截图 + 欠酒/加酒 page data + 角色摘要 | 欠酒/加酒不是 0 壳层，能看见真实数据；主持/发起者有操作证据 | 命中 `...LEDGER-INDEPENDENT-ZEROED` / `...EDIT-PROOF-MISSING` |
| 相册首张封面 | `album` 页有图态 / 无图态截图 + `coverPhotoUrl` 或等效来源 | 有图时首张照片优先，无图才默认封面；不能是白块 | 命中 `...ALBUM-COVER-WEAK` |
| 事件区密度 | `brief` / `share-poster` 截图 | 事件最多 2-3 条，不挤压照片和账本主视觉 | 命中 `...BRIEF-EVENT-STACK-HEAVY` |

##### 12.7.34.6 资产缺口

当前判断：`本轮不需要新增字体或光效`。若前端无法快速解决偏白封面问题，可继续复用 12.7.31 的默认封面建议，不需要再起新视觉方向。

| 资产 | 建议路径 | 用途 |
| --- | --- | --- |
| 最近相册默认封面 | `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008-recent-album-default-cover.svg` | 无照片时作为明确默认封面，避免白块感 |
| 简报 / 分享无图默认卡 | 继续复用现有 clean 空态贴纸或默认封面，不建议新增整图 | 若确实无图，至少要让用户看出这是“默认态”，不是“加载失败” |

##### 12.7.34.7 下一步责任人

- 前端：优先修 `brief/share-poster/share-preview/live-record/album` 的白卡问题，再补独立 `ledger` 页真实欠酒/加酒数据和编辑入口。
- 测试：继续使用当前成员态样本复测，不再向用户索要真机截图；补 `ledger` 角色差异截图和 `photoHighlights/coverPhotoUrl/accountingHighlights` page data。
- 接口联调 / 后端API：如果独立 `ledger` 仍拿不到真实欠酒/加酒数据，补独立页所需字段来源和样本说明。

当前 UI/UX 状态：`008E 已建立成员态视觉退回标准 / 当前为 P0/P1 退回，不写设计通过或上线通过`。

#### 12.7.35 `PR-UX-LINK-CLEANUP-008F-WHITE-CARD-REVIEW` 白卡与旧封面专项退回

记录时间：2026-06-18。PM 已只读核验 008E 新截图，确认 `ledger` 局部修复，但 `live-record / session-brief / share-poster / share-preview / album` 仍存在照片白卡；`album` 还残留旧“酒桌判官”封面。本节只做 UI/UX 退回口径补充，不改业务源码，不写 UI/UX 通过或上线通过。

##### 12.7.35.1 截图索引

| 页面 | 截图 | 本轮观察重点 |
| --- | --- | --- |
| 独立聚会账本 | `docs/runtime/pr-qa-link-cleanup-008e-ledger-20260618.png` | 欠酒/加酒数值和加减入口已进入可继续开发阶段，但仍需和分享视觉分开判断，不能替代其他页面放行 |
| 记录 / 账本同页 | `docs/runtime/pr-qa-link-cleanup-008e-live-record-20260618.png` | 四 tab 在位，账本动态已有值，但两张照片卡仍是整块白卡 |
| 聚会简报 | `docs/runtime/pr-qa-link-cleanup-008e-brief-20260618.png` | 照片计数已有，但主视觉图片区仍是白卡，未见真实照片像素 |
| 分享海报 | `docs/runtime/pr-qa-link-cleanup-008e-share-poster-20260618.png` | 暗色舞台和按钮已在，但两张拍立得卡片仍是白洞，账本高光被挤成弱卡 |
| 邀请预览 / 回流 | `docs/runtime/pr-qa-link-cleanup-008e-share-preview-20260618.png` | 口令和加入状态可读，但照片主视觉仍未成立，回流页说服力不足 |
| 我的相册 | `docs/runtime/pr-qa-link-cleanup-008e-album-20260618.png` | 第一项仍使用旧“酒桌判官”封面，第二项仍是白卡，未满足首张照片优先 / 无图才默认 |

##### 12.7.35.2 SKILL 使用记录

| SKILL | 选择理由 | 使用边界 |
| --- | --- | --- |
| `web-design-guidelines` | 本轮要针对真实截图判断白卡、旧品牌封面、首屏层级和默认封面是否合格 | 只做截图接收/退回，不写实现通过 |
| `design-taste-frontend` | 本轮需要把“照片+账本同屏主视觉”“酷炫光效只是陪衬”“旧壳与旧封面不得混入”写成前端可执行红线 | 只做视觉退回和层级规格，不生图、不改源码 |

##### 12.7.35.3 专项复核结论

当前结论：`ledger` 可从“全零壳层”降到“局部可继续开发”，但白卡问题仍是跨页面 P0；`album` 旧“酒桌判官”封面额外命中品牌退回。`data 有 URL` 只说明链路可能接通，不等于视觉通过；UI/UX 必须在截图里看到真实照片像素。

| 页面 | 结论 | 分级 | 依据 |
| --- | --- | --- | --- |
| `ledger` 独立聚会账本 | 局部接收后继续开发 | P1 | 数值、头像、加减入口已进入可读阶段，本轮不再按“全零壳层”退回；但这不代表分享/相册视觉通过 |
| `live-record` 记录/账本 | 退回 | P0 | 顶部两张照片卡仍是整块白卡，账本动态恢复不能替代照片主视觉 |
| `session-brief` 聚会简报 | 退回 | P0 | 已有照片数和事件，但图片区域仍无真实像素，仍像加载失败壳层 |
| `share-poster` 分享海报 | 退回 | P0 | 照片墙仍是白洞，账本高光被压到下方弱卡，首屏不满足“照片+账本同屏主视觉” |
| `share-preview` 分享回流 | 退回 | P0 | 加入状态可读，但照片卡仍空白，回流页没有聚会内容吸引力 |
| `album` 我的相册 | 退回 | P0 | 第一项直接暴露旧“酒桌判官”封面，第二项仍是白卡；既不符合新品牌，也不符合默认封面规则 |

##### 12.7.35.4 退回码

| 退回码 | 分级 | 触发条件 | 责任角色 | 修复口径 |
| --- | --- | --- | --- | --- |
| `PR-UX-LC008F-P0-PHOTO-WHITE-CARD-STILL` | P0 | `live-record / session-brief / share-poster / share-preview / album` 任一照片卡仍是白卡、白洞、近似加载失败占位，看不到真实照片像素 | 前端 + 接口联调 | 不是只校验 URL 存在，而是要让截图中看见真实像素；失败时用合格默认封面，不得留白块 |
| `PR-UX-LC008F-P0-ALBUM-OLD-BRAND-COVER` | P0 | 相册列表仍出现旧“酒桌判官”封面或其他旧品牌视觉 | 前端 | 清除旧封面映射和历史兜底图；有图优先首张照片，无图才走新默认封面 |
| `PR-UX-LC008F-P1-SHARE-PHOTO-LEDGER-HIERARCHY` | P1 | `share-poster / share-preview / session-brief` 首屏虽然进入新壳，但“照片墙 + 聚会账本高光”主次不清，账本被挤到底部弱卡或按钮被列表压下去 | 前端 | 首屏先给照片墙，再给账本高光条/账本摘要卡，保存动作紧跟其下；事件列表不得先于主视觉抢空间 |
| `PR-UX-LC008F-P1-PHOTO-CONTAINER-WEAK` | P1 | 照片容器尺寸、边框、安全区不稳定，导致看起来像空白卡片、裁切异常或首屏节奏松散 | 前端 | 固定照片窗比例、内边距和最小高度；无论有图无图都维持稳定拍立得容器，不要出现大片白洞 |
| `PR-UX-LC008F-P1-STAGE-GLOW-WEAK` | P1 | 分享首屏已有暗色背景但聚会/酒局氛围不足，光效和贴纸没有服务照片与账本主视觉 | 前端 + UI/UX | 光效只能做边缘陪衬，不能盖住卡片；优先增强桌面暖光、边角星芒和账本霓虹条的一致性 |

##### 12.7.35.5 前端可执行视觉要求

| 模块 | 执行要求 | 不满足时退回 |
| --- | --- | --- |
| 照片墙 / 拍立得卡 | 首屏至少 2 张照片同屏；每张卡保持稳定照片窗，推荐容器宽 `132-148px`、高 `156-176px`，内部真实照片区域占容器高不低于 `72%`；不可出现纯白内部占位；`data/imageUrl` 或 store URL 存在不等于通过 | `PR-UX-LC008F-P0-PHOTO-WHITE-CARD-STILL` / `PR-UX-LC008F-P1-PHOTO-CONTAINER-WEAK` |
| 聚会账本高光 | 照片墙下方同屏放一条账本高光摘要，至少可见 `欠酒/加酒/成员数/账本条数` 中 2-3 项；不得缩成底部长列表里的弱卡 | `PR-UX-LC008F-P1-SHARE-PHOTO-LEDGER-HIERARCHY` |
| 首屏按钮 | `保存成图 / 保存聚会分享图 / 预览` 中至少一个主按钮在首屏清晰可达，按钮不能被事件列表挤到二屏后 | `PR-UX-LC008F-P1-SHARE-PHOTO-LEDGER-HIERARCHY` |
| 聚会 / 酒局基因 | 允许保留暗色桌面舞台、暖橙光斑、轻量贴纸、纸面账本、拍立得边框，但不得回到旧红色战报壳、旧惩罚榜或压迫式判官视觉 | `PR-UX-LC008F-P0-ALBUM-OLD-BRAND-COVER` / `PR-UX-LC008F-P1-STAGE-GLOW-WEAK` |
| 默认封面 | 有照片时强制首张照片优先；无照片才允许走默认封面。默认封面必须是新“聚会记录师”体系，不能是白块、旧“酒桌判官”海报或工程占位 | `PR-UX-LC008F-P0-ALBUM-OLD-BRAND-COVER` / `PR-UX-LC008F-P0-PHOTO-PIXEL-NOT-VISIBLE` |
| 安全区 | `share-poster` 保存图底部需预留按钮裁切外的内容安全区，建议底部正文安全区不低于 `88px`；照片卡、账本条、房间码/说明不能贴底或被截断 | `PR-UX-LC008F-P1-PHOTO-CONTAINER-WEAK` |

##### 12.7.35.6 资产结论

当前判断：`不新增资产，复用现有默认封面/光效方向。`

| 资产项 | 结论 | 复用路径 | 用途 |
| --- | --- | --- | --- |
| 默认封面 | 复用现有 clean-slate 默认封面，不新增 008F 专属文件 | `docs/design-assets/party-recorder/clean-slate-001/` 既有默认封面与空态资产 | 无图态统一 fallback，替代白卡和旧“酒桌判官”封面 |
| 背景光效 | 复用现有 clean-slate 分享页背景和暖光方向，不新增整套生图 | `docs/design-assets/party-recorder/clean-slate-001/` 既有分享流背景/光效资产 | 维持聚会桌面氛围，但不得掩盖照片墙和账本高光 |
| 贴纸/账本高光 | 复用现有分享页贴纸与账本高光元素 | `docs/design-assets/party-recorder/clean-slate-001/` 既有切图 | 仅做边角点缀和账本强调，不扩张为旧卡片壳 |

##### 12.7.35.7 截图接收标准

| 核查项 | 最低证据 | UI/UX 接收要求 | 无证据处理 |
| --- | --- | --- | --- |
| 真实照片像素 | `live-record / brief / share-poster / share-preview / album` 新截图 | 截图里必须直接看见真实照片内容；`data 有 URL`、console 无错、page data 非空都不能替代视觉证据 | 按 `PR-UX-LC008F-P0-PHOTO-WHITE-CARD-STILL` 退回 |
| 旧封面清理 | `album` 新截图 | 不再出现旧“酒桌判官”封面、旧海报或历史项目兜底图 | 按 `PR-UX-LC008F-P0-ALBUM-OLD-BRAND-COVER` 退回 |
| 分享首屏双主视觉 | `share-poster / share-preview / session-brief` 新截图 | 照片墙 + 聚会账本高光同屏可见，保存动作清楚，事件列表不抢首屏 | 按 `PR-UX-LC008F-P1-SHARE-PHOTO-LEDGER-HIERARCHY` 退回 |
| 容器与安全区 | `share-poster` 页面截图 + 保存图原图 | 拍立得容器不塌陷，底部说明/房间码/账本信息不贴边不截断 | 按 `PR-UX-LC008F-P1-PHOTO-CONTAINER-WEAK` 退回 |

##### 12.7.35.8 下一步责任人

- 前端：优先清掉 `live-record / brief / share-poster / share-preview / album` 的白卡，把真实照片像素渲染出来；同时移除 `album` 旧“酒桌判官”封面兜底图，并按本节容器尺寸和双主视觉要求调整分享首屏。
- UI/UX：本轮不新增资产，继续以现有 clean-slate 默认封面、背景和光效为对照复核，不参与业务源码改动。
- 测试：继续基于 DevTools 预览框复测以上 5 页新截图，并补 `share-poster` 保存图原图；无需向用户索要真机图。

当前 UI/UX 状态：`008F 已补白卡与旧封面专项退回码 / 当前为 P0-P1 退回 / 等前端修复后复测截图`。

#### 12.7.36 `PR-UX-LINK-CLEANUP-008H-FULL-OBJECTIVE-ACCEPTANCE` 全目标接收矩阵

记录时间：2026-06-18。当前 `DevTools hard freeze` 未解除，本节只把用户最新 008 全目标转成 UI/UX 接收矩阵和退回码，不触发 DevTools，不要求用户截图，不写设计通过。008H 视为对 12.7.30 / 12.7.31 / 12.7.33 / 12.7.35 的总收口。

##### 12.7.36.1 口径覆盖说明

- 首页、邀请卡、局内账本结构继续复用 12.7.30。
- 链路收缩、工具箱、创建页、拍第一张、授权默认态继续复用 12.7.31。
- 用户界面数据破界零容忍继续复用 12.7.33。
- 分享页白卡、旧封面、照片+账本同屏要求继续复用 12.7.35。
- 本节新增的是 `全目标门禁矩阵`，方便前端、测试、PM 统一按一套标准收口；不是新设计稿。

##### 12.7.36.2 SKILL 选择记录

| SKILL | 选择理由 | 使用边界 |
| --- | --- | --- |
| `web-design-guidelines` | 本轮是全链路视觉/交互门禁整理，需要把页面、状态、截图证据和退回条件写成可执行矩阵 | 只做接收/退回标准，不写实现通过 |
| `design-taste-frontend` | 本轮需要维持 Clean Slate 的减法和主次关系，防止首页、邀请页、账本页、分享页回到旧壳、厚卡和堆按钮 | 只做层级和视觉约束，不生图、不改源码 |

##### 12.7.36.3 008H 全目标接收矩阵

| 模块 | 接收标准 | 退回重点 |
| --- | --- | --- |
| 首页最近相册 | 有照片时必须显示首张照片；无照片才允许新默认封面；不得出现旧品牌封面或工具图充封面 | 白卡、旧“酒桌判官”封面、已有照片却不显示首图 |
| 首页工具箱 | 首页底部只保留 `工具箱` 作为二级入口；列表可进入、可返回、不抢主路径 | 工具箱缺失、死入口、重新占据首页主视觉 |
| 个人中心 | 入口去重，功能分流清楚，不得多个按钮都跳相册 | 重复入口、标题和落点不一致 |
| 邀请预览 | 极简，只保留口令和好友加入状态；不许说明性厚卡、安全区说明块、三分享按钮 | 邀请卡厚重、模块过多、说明文案过长 |
| 创建页 | 默认首屏不允许轻量主题选择；只围绕创建聚会主路径 | 主题选择回流、额外步骤干扰三步开局 |
| 拍第一张 | 第一张照片保存后进入进行中聚会，不回首页、不丢 session | 保存后回首页、掉上下文 |
| 记录 / 聚会账本 | `记录 / 相册 / 分享 / 聚会账本` 四 tab 同级；账本页干净、主次清楚、可编辑；不许重复按钮和“保存关键事件” | 账本被弱化、按钮堆叠、无编辑、旧工具壳回流 |
| 简报大图 | 简报图片可点击放大并返回原位，不丢当前上下文 | 不能点大图、不能返回 |
| 图片直显 | 上传后图片直接进入相册/简报/分享，不再用审核阻塞展示文案 | “待审核后展示/分享”文案、图片只存在 data 不上屏 |
| 授权默认态 | 无“仅自己”；4 项默认全选；选中反馈清楚 | 仍有“仅自己”、默认未全选 |
| 分享页 / 保存图 | 必须是本项目最重要页面：照片 + 聚会账本/酒桌记账高光同屏；有聚会/酒局基因，但不能回旧红壳；保存动作清晰可达；保存图安全区成立 | 白卡、账本被挤到底部、旧红壳/旧词、按钮弱、底部截断 |
| 数据破界 | 用户界面零容忍工程字段、raw/debug、接口错误、旧品牌主文案 | `PR Seed`、`IT-MOMENTS`、`dual_flow`、raw/debug、旧“酒桌判官”主文案 |

##### 12.7.36.4 008H 退回码

| 退回码 | 分级 | 触发条件 | 责任角色 | 修复口径 |
| --- | --- | --- | --- | --- |
| `PR-UX-LC008H-P0-HOME-RECENT-COVER-BROKEN` | P0 | 首页最近相册未做到“有图首图、无图默认、新品牌封面”，仍出现白卡、旧封面或错图 | 前端 | 首图优先，默认封面只用于无图态，旧品牌兜底图清零 |
| `PR-UX-LC008H-P0-INVITE-PREVIEW-NOT-MINIMAL` | P0 | 邀请预览仍为说明性厚卡，保留安全区说明、多余模块或多组分享按钮 | 前端 | 邀请预览只保留口令和好友加入状态 |
| `PR-UX-LC008H-P0-CREATE-FIRST-PHOTO-FLOW-BROKEN` | P0 | 创建页仍有主题步骤，或第一张保存后未进入进行中聚会 | 前端 | 删除默认主题步骤，闭环到进行中页 |
| `PR-UX-LC008H-P0-LEDGER-EDIT-CLEANUP-MISSING` | P0 | 账本页无真实欠酒/加酒编辑，或仍有重复按钮/“保存关键事件” | 前端 + 后端/API | 保留真实账本编辑，页面只留一组主动作 |
| `PR-UX-LC008H-P0-PHOTO-DIRECT-VISIBILITY-BLOCKED` | P0 | 图片上传后仍被审核态/隐藏逻辑阻塞，不能直显到相册/简报/分享 | 前端 + 后端/API + UGC | 去掉阻塞展示文案，图片直显，治理边界后置 |
| `PR-UX-LC008H-P0-SHARE-POSTER-NOT-HERO` | P0 | 分享页/保存图未成为主视觉页，照片+账本未同屏，或仍出现旧红壳、旧品牌、白卡 | 前端 | 照片墙与账本高光同屏，主按钮前置，旧壳清零 |
| `PR-UX-LC008H-P0-DATA-LEAK-IN-UI` | P0 | 用户界面出现工程字段、接口错文案、raw/debug、旧品牌主文案 | 前端 + 后端/API + 接口联调 | 所有内部字段只允许留在测试摘要/page data，不得上屏 |
| `PR-UX-LC008H-P1-TOOLBOX-ME-HIERARCHY-BLUR` | P1 | 工具箱和个人中心虽存在，但入口层级混乱、语义重叠或压主路径 | 前端 | 工具箱保持二级入口，个人中心入口去重分流 |
| `PR-UX-LC008H-P1-BRIEF-LIGHTBOX-RETURN-WEAK` | P1 | 简报图片能点，但放大/返回反馈不清，或返回后丢失原位 | 前端 | 建立稳定的大图查看与返回闭环 |
| `PR-UX-LC008H-P1-AUTH-DEFAULT-UNCLEAR` | P1 | 授权默认全选不清楚，选中反馈弱，或布局混乱 | 前端 | 默认全选且状态清晰可辨 |
| `PR-UX-LC008H-P1-SHARE-SAFEAREA-AND-HIERARCHY-WEAK` | P1 | 分享页/保存图虽进入新壳，但照片容器、安全区、账本层级或按钮可达性仍弱 | 前端 | 固定照片窗与底部安全区，强化账本高光和主按钮层级 |

##### 12.7.36.5 截图 / page data 接收标准

| 核查项 | 最低证据 | UI/UX 接收要求 | 无证据处理 |
| --- | --- | --- | --- |
| 首页最近相册 | 首页有图态/无图态截图 + `coverPhotoUrl` 或等效字段摘要 | 有图必首图，无图才默认，旧品牌封面零容忍 | 命中 `PR-UX-LC008H-P0-HOME-RECENT-COVER-BROKEN` |
| 工具箱 / 个人中心 | 首页入口截图、工具箱列表截图、`me` 页截图 + 点击落点记录 | 工具箱可用且不抢主路径；个人中心去重分流 | 命中 `PR-UX-LC008H-P1-TOOLBOX-ME-HIERARCHY-BLUR` |
| 邀请预览极简 | 邀请预览截图 + 口令/加入状态摘要 | 只见口令和好友加入状态，无厚卡与多余按钮 | 命中 `PR-UX-LC008H-P0-INVITE-PREVIEW-NOT-MINIMAL` |
| 创建到第一张 | 创建页首屏截图 + 第一张保存后的落点截图 | 无主题选择，保存后进入进行中页 | 命中 `PR-UX-LC008H-P0-CREATE-FIRST-PHOTO-FLOW-BROKEN` |
| 记录 / 聚会账本 | 四 tab 截图 + 账本页截图 + 角色/数据摘要 | 四 tab 同级；账本干净、可编辑、无重复按钮和“保存关键事件” | 命中 `PR-UX-LC008H-P0-LEDGER-EDIT-CLEANUP-MISSING` |
| 简报大图 | 简报截图 + 大图态截图 + 返回后截图 | 可放大、可返回、不丢原位 | 命中 `PR-UX-LC008H-P1-BRIEF-LIGHTBOX-RETURN-WEAK` |
| 图片直显 | 相册/简报/分享截图 + `photoHighlights` 摘要 | 真实照片直接上屏，无审核阻塞文案 | 命中 `PR-UX-LC008H-P0-PHOTO-DIRECT-VISIBILITY-BLOCKED` |
| 授权默认态 | 授权区截图 + 默认勾选摘要 | 无“仅自己”，4 项默认全选且状态清楚 | 命中 `PR-UX-LC008H-P1-AUTH-DEFAULT-UNCLEAR` |
| 分享页 / 保存图 | `share-poster` 页面截图 + 保存图原图或等比预览 + `photoHighlights/accountingHighlights` 摘要 | 照片+账本同屏，主按钮清楚，旧红壳清零，安全区成立 | 命中 `PR-UX-LC008H-P0-SHARE-POSTER-NOT-HERO` / `...SAFEAREA-AND-HIERARCHY-WEAK` |
| 数据破界 | 关键页截图全集 + page data 对照 | UI 零容忍工程字段、接口错字串、raw/debug、旧品牌主文案 | 命中 `PR-UX-LC008H-P0-DATA-LEAK-IN-UI` |

##### 12.7.36.6 资产 / 字体 / 光效结论

当前判断：`008H 不强制新增资产、字体或光效，继续复用 clean-slate 既有默认封面、分享背景和轻贴纸体系。`

仅在以下场景才允许补资产清单，不直接改源码：

| 资产项 | 触发条件 | 建议用途 |
| --- | --- | --- |
| 默认封面 | 前端仍无法把无图态与白卡/旧封面区分开 | 统一首页最近相册、相册列表、简报、分享无图态 |
| 分享背景暖光 | 分享页虽清除旧壳，但账本与照片层级仍弱，需要轻量背景陪衬 | 仅加强桌面暖光，不新增红壳或大装饰 |
| 账本高光条 | 账本摘要在分享页/保存图中仍像弱灰块 | 强化账本摘要可读性，但不扩张为厚卡 |

##### 12.7.36.7 当前状态

- 当前只完成 008H 全目标门禁整理，未触发 DevTools，未新增截图证据。
- 在 `DevTools hard freeze` 解除并由测试补回新证据前，008H 只能作为接收/退回标准使用，不能写设计通过。
- 只要后续截图仍出现白卡、旧品牌封面、邀请厚卡、账本重复按钮、审核阻塞文案或工程字段上屏，直接按本节退回码退回。

#### 12.7.37 `PR-UX-LINK-CLEANUP-008L-SHARE-SAVE-COPY-REVIEW` 分享保存页文案语义收口

记录时间：2026-06-18。本节只补 `share-poster` 及其保存相关状态的文案接收标准，不改业务源码，不触发 DevTools，不新增资产，不写设计通过。目标是把“海报”旧说法收口为“聚会分享图 / 分享截图保存”语义，避免用户误解为旧式长海报流程。

##### 12.7.37.1 口径衔接

- 本节是 12.7.36 中“分享页 / 保存图”门禁的文案补充，不替代 12.7.36 的截图、page data、保存图原图证据要求。
- 文案统一只是 `准入条件`，不是通过条件。
- 即使标题、按钮、状态文案都已改为“分享图 / 分享截图”，只要没有截图或保存图原图证明“照片 + 聚会账本同屏”，仍不得写设计通过。

##### 12.7.37.2 文案接收口径

| 模块 | 接收标准 | 不可接受形态 |
| --- | --- | --- |
| 页面标题 | 统一使用 `聚会分享图`、`分享截图保存`、`保存聚会分享图` 一类表述，直接说明用户当前在处理分享图 | 仍以 `海报` 作为主标题，或 `海报 / 分享图 / 截图` 三套说法混用 |
| 主按钮 | 主 CTA 围绕 `保存分享图`、`保存截图`、`查看分享图`，语义直接、动作单一 | `保存海报`、`保存聚会海报`、`生成海报` 与 `分享图` 并列混用，用户难以判断主动作 |
| 保存成功态 | 成功反馈使用 `已保存分享图`、`分享截图已保存`、`可去发送/查看` 一类表达 | 成功态继续写成 `海报已生成`、`海报保存成功`，把当前流程说回旧海报语义 |
| 状态面板 | `生成中 / 已保存 / 保存失败 / 重新保存` 等状态都围绕 `分享图` 或 `分享截图` 命名 | 面板标题叫 `海报状态`、按钮叫 `重试生成海报`、说明又写 `分享图`，形成混语义 |
| 保存图说明 | 底部说明统一写“这张分享图会包含照片和聚会账本高光”等描述 | 说明里写 `海报`、`长图`、`战报`，或暗示旧式长海报流程 |

##### 12.7.37.3 退回码

| 退回码 | 分级 | 触发条件 | 责任角色 | 修复口径 |
| --- | --- | --- | --- | --- |
| `PR-UX-LC008L-P1-SHARE-SAVE-COPY-MIXED` | P1 | 同一页面或同一状态内混用 `海报 / 分享图 / 截图`，导致主动作和页面语义不清 | 前端 | 统一为“聚会分享图 / 分享截图保存”语义；同一页只保留一套主说法 |
| `PR-UX-LC008L-P1-SHARE-SAVE-PRIMARY-ACTION-BLUR` | P1 | 标题、按钮、成功态各说各话，用户无法判断当前是保存、查看还是重新保存分享图 | 前端 | 标题、主按钮、状态反馈三者用同一动作链路命名 |
| `PR-UX-LC008L-P1-SHARE-SAVE-LEGACY-POSTER-COPY` | P1 | 主文案仍把新版分享保存流程表述成旧式 `海报` 或类似长海报流程 | 前端 | 去掉“海报”主表述，保留“分享图 / 分享截图”语义 |

##### 12.7.37.4 与 12.7.36 的联合接收规则

| 核查项 | 最低证据 | UI/UX 接收要求 | 无证据处理 |
| --- | --- | --- | --- |
| 文案统一 | `share-poster` 页面截图、保存成功态截图、失败/重试态截图 | 标题、主按钮、状态面板、说明统一为“分享图 / 分享截图”语义 | 命中 `PR-UX-LC008L-P1-SHARE-SAVE-COPY-MIXED` |
| 文案 + 主视觉联合成立 | `share-poster` 页面截图 + 保存图原图或等比预览 + `photoHighlights/accountingHighlights` 摘要 | 文案统一只是前提；仍必须看到照片+账本同屏、保存动作清晰、安全区成立 | 若缺主视觉证据，继续按 12.7.36 的 `PR-UX-LC008H-P0-SHARE-POSTER-NOT-HERO` / `...P1-SHARE-SAFEAREA-AND-HIERARCHY-WEAK` 处理 |

##### 12.7.37.5 资产结论

当前判断：`现有资产足够，不新增资产。`

- 本轮是文案语义收口，不涉及背景、光效、贴纸或字体不足。
- 若后续发现按钮长度、状态面板容器或标题区因新文案导致排版溢出，再回到 12.7.36 的层级与安全区标准处理，不单独起新资产。

##### 12.7.37.6 当前状态

- 008L 只完成文案接收标准和退回码补充，未触发 DevTools，未新增截图证据。
- 后续如果截图里仍混用“海报 / 分享图 / 截图”，直接按本节退回。
- 即使文案统一，也仍要等 12.7.36 要求的截图 / page data / 保存图原图，才能继续复核分享页主视觉，不得写设计通过。

#### 12.7.38 `PR-UX-LINK-CLEANUP-008M-CREATE-TEMPLATE-RESIDUE-REVIEW` 创建页主题/模板残留收口

记录时间：2026-06-18。本节只为 `create-session` 去掉轻量主题/模板残留补 UI/UX 接收口径，不改业务源码，不触发 DevTools，不新增资产，不写设计通过。PM 已静态核查 WXML 不再展示主题卡，但 TS/LESS/mock fallback 仍残留主题/模板链路；本节要求把“用户可见残留”一并纳入退回。

##### 12.7.38.1 口径衔接

- 本节是 12.7.31、12.7.36 中“创建页无轻量主题选择”标准的进一步收紧。
- 12.7.31 关注“默认首屏不能出现主题步骤”；12.7.38 继续补充“即使 WXML 已删，TS/LESS/mock fallback 也不能以 badge、提示文案、旧入口、空态 fallback 的形式重新出现在用户界面”。
- 本轮不要求新资产；若前端清理后页面出现空洞或层级失衡，再另行补视觉约束，但不在本节直接展开。

##### 12.7.38.2 创建页接收口径

| 模块 | 接收标准 | 不可接受形态 |
| --- | --- | --- |
| 页面主结构 | 创建页只保留 `聚会名称`、`当前时间`、`人数/高级设置`、`创建并邀请` 这一组主结构 | 主题/模板重新占据首屏，或主题逻辑成为隐性前置步骤 |
| 轻量主题 | 默认创建首屏不出现轻量主题选择、主题卡、主题切换器、主题 badge、主题说明文案 | 旧主题入口、`推荐主题`、`轻量主题`、`当前主题`、`主题已为你选择` 等残留文案 |
| 模板卡 / 模板入口 | 默认首屏不出现模板卡、模板列表、模板推荐、历史模板入口 | `选择模板`、`换个模板`、`快速套用模板`、`模板加载失败` 等可见入口或提示 |
| fallback 文案 | mock fallback、空态 fallback、加载失败 fallback 不得把主题/模板语义带回用户界面 | `主题加载失败，已为你选择默认模板`、`模板暂不可用`、`未命中主题配置` 等 |
| 高级设置 | 若保留高级设置，只能承载人数、可见范围、聚会附加项等次级参数，不承载主题/模板主选择 | 高级设置里仍塞主题/模板主入口，形成“隐藏但仍存在”的旧链路 |

##### 12.7.38.3 退回码

| 退回码 | 分级 | 触发条件 | 责任角色 | 修复口径 |
| --- | --- | --- | --- | --- |
| `PR-UX-LC008M-P1-CREATE-THEME-RESIDUE` | P1 | 创建页仍出现轻量主题、主题 badge、主题提示或任何主题选择残留 | 前端 | 清除所有用户可见主题语义，创建页回到名称/时间/人数/创建主链路 |
| `PR-UX-LC008M-P1-CREATE-TEMPLATE-FALLBACK` | P1 | mock fallback、加载失败、空态或调试态仍把模板语义暴露到用户界面 | 前端 | 去掉模板 fallback 文案和入口；失败态只描述创建本身，不回退到主题/模板 |
| `PR-UX-LC008M-P1-CREATE-STEP-DISTRACTION` | P1 | 虽然没有大主题卡，但页面仍出现旧主题入口、模板快捷口或次要模块，分散“创建并邀请”主路径 | 前端 | 保持首屏只围绕创建主任务；次要结构不得形成额外步骤感 |

##### 12.7.38.4 截图 / page data 接收标准

| 核查项 | 最低证据 | UI/UX 接收要求 | 无证据处理 |
| --- | --- | --- | --- |
| 创建页干净首屏 | `create-session` 首屏截图 + page data 摘要 | 只见名称、时间、人数/高级设置、`创建并邀请`；无主题/模板残留 | 命中 `PR-UX-LC008M-P1-CREATE-THEME-RESIDUE` / `...STEP-DISTRACTION` |
| fallback 清理 | 创建页加载态/失败态/空态截图 + 相关 data 摘要 | 不出现“主题/模板”语义 fallback 文案、badge 或旧入口 | 命中 `PR-UX-LC008M-P1-CREATE-TEMPLATE-FALLBACK` |
| 三步主路径不被干扰 | 创建页首屏截图 + 点击主 CTA 前后的连续截图 | 主链路仍是直接创建并邀请，不被旧主题/模板逻辑分散 | 若缺连续证据，继续按 12.7.36 的 `PR-UX-LC008H-P0-CREATE-FIRST-PHOTO-FLOW-BROKEN` 待复核 |

##### 12.7.38.5 资产结论

当前判断：`本任务不要求生成新资产。`

- 当前问题是主题/模板残留清理，不是视觉素材不足。
- 若前端清理后出现首屏空洞、信息层级松散或 CTA 权重下降，再另行追加视觉补强要求。
- 在没有新截图前，不提前派生按钮、背景、装饰或空态资产任务。

##### 12.7.38.6 证据缺口与当前状态

- 当前仅完成 UI/UX 接收口径和退回码补充，未触发 DevTools，未收到前端 008M 回包截图。
- 仍缺 `create-session` 清理后的首屏截图、失败态/加载态截图、page data 摘要，无法判断 TS/LESS/mock fallback 是否已彻底清空。
- 本节只作为前端 008M 清理后的复核门禁使用；在没有后续截图/page data 证据前，不写 UI/UX 通过。

#### 12.7.39 `PR-UX-LINK-CLEANUP-008O-TOOLS-TABBAR-REVIEW` 工具箱底部导航一致性收口

记录时间：2026-06-18。本节只补工具箱页底部导航与首页底部导航一致性的 UI/UX 接收口径，不改业务源码，不触发 DevTools，不新增资产，不写设计通过。PM 静态证据显示：首页底部为 `bottom-nav` 三入口；工具箱页单独实现 `tools-tabbar`，LESS 仍按四列 grid，但 WXML 只有三入口，当前先按一致性门禁收口，等待前端 14.67 和后续截图/page data 复核。

##### 12.7.39.1 口径衔接

- 本节是 12.7.31、12.7.36 中“工具箱为二级入口”的视觉一致性补充。
- 本节不讨论工具箱内容是否可用，只讨论底部导航是否与首页属于同一视觉系统。
- 即使工具箱功能可点，只要底部导航仍保留四列残留、active 态不一致或 safe-area 高度不一致，仍按本节退回。

##### 12.7.39.2 接收口径

| 模块 | 接收标准 | 不可接受形态 |
| --- | --- | --- |
| 入口数量 | 工具箱底部导航必须与首页一致，固定为三入口 | 首页三入口、工具箱四列栅格残留，或出现伪占位第四列 |
| 栅格与宽度 | 三入口三列均分，视觉重心与首页一致 | LESS 仍按四列，导致三入口被拉伸、留白异常或点击区不均 |
| 高度与 safe-area | 底栏总高度、底部 safe-area 处理与首页一致，不出现更高/更扁/贴底不齐 | 工具箱底栏高度明显不同，或底部 padding 与首页不一致 |
| 图标与文字 | 图标尺寸、文字字号、图标到文字的垂直间距与首页一致 | 工具箱图标偏大/偏小，文字更密或更松，形成两套导航语言 |
| active 态 | active 色、选中图标/文字强调方式与首页一致 | 首页与工具箱使用不同高亮色、不同粗细或不同选中逻辑 |
| 点击热区 | 每个入口点击区域与首页一致，三项均可舒适点击 | 工具箱因四列残留导致热区变窄、偏移或不均匀 |

##### 12.7.39.3 退回码

| 退回码 | 分级 | 触发条件 | 责任角色 | 修复口径 |
| --- | --- | --- | --- | --- |
| `PR-UX-LC008O-P1-TOOLS-TABBAR-MISMATCH` | P1 | 工具箱底部导航与首页底部导航不是同一视觉系统，三入口但高度、字号、safe-area、热区或间距明显不一致 | 前端 | 直接对齐首页 `bottom-nav` 的结构、尺寸和状态表达 |
| `PR-UX-LC008O-P1-TOOLS-TABBAR-FOUR-COLUMN-RESIDUE` | P1 | WXML 已是三入口，但 LESS/布局仍残留四列 grid，导致排版留白、宽度分配或点击区异常 | 前端 | 清除四列残留，三入口按三列均分布局 |
| `PR-UX-LC008O-P1-TAB-ACTIVE-STATE-INCONSISTENT` | P1 | 工具箱页 active 色、选中强调、图标/文字状态与首页不一致 | 前端 | 统一 active 色、选中态、图文对比和交互反馈 |

##### 12.7.39.4 截图 / page data 接收标准

| 核查项 | 最低证据 | UI/UX 接收要求 | 无证据处理 |
| --- | --- | --- | --- |
| 首页 / 工具箱底栏对照 | 首页底栏截图 + 工具箱底栏截图 | 两页底栏均为三入口，三列均分，视觉系统一致 | 命中 `PR-UX-LC008O-P1-TOOLS-TABBAR-MISMATCH` / `...FOUR-COLUMN-RESIDUE` |
| active 态对照 | 首页当前选中态截图 + 工具箱当前选中态截图 | active 色、强调方式、图标文字关系一致 | 命中 `PR-UX-LC008O-P1-TAB-ACTIVE-STATE-INCONSISTENT` |
| safe-area / 热区 | 包含底部安全区的完整截图 + page data 或结构摘要 | 底栏高度、底部内边距和点击热区与首页一致 | 缺证据时继续待前端 14.67 和后续截图复核 |

##### 12.7.39.5 资产结论

当前判断：`本任务不要求新资产。`

- 当前问题是布局系统和状态对齐，不是图标、字体或背景缺失。
- 若前端对齐后仍出现图标模糊、字号层级失衡或底栏拥挤，再另行补视觉约束；本节不提前派生资产任务。

##### 12.7.39.6 证据缺口与当前状态

- 当前仅完成 UI/UX 接收口径和退回码补充，未触发 DevTools，未收到前端 14.67 回包截图。
- 仍缺：首页底栏与工具箱底栏对照截图、active 态截图、底部 safe-area 完整截图、相关 page data/结构摘要。
- 本节只作为前端 14.67 完成后的复核门禁使用；在没有后续截图/page data 证据前，不写 UI/UX 通过。

#### 12.7.40 `PR-UX-LINK-CLEANUP-008P-ME-ENTRY-DEDUP-REVIEW` 个人中心入口去重收口

记录时间：2026-06-18。本节只补 `me` 个人中心入口去重和底部导航一致性的 UI/UX 接收口径，不改业务源码，不触发 DevTools，不新增资产，不写设计通过。PM 静态复核确认当前个人中心仍存在多个相册入口和四项底栏；本节先把用户目标转成前端 14.68 的复核门禁。

##### 12.7.40.1 口径衔接

- 本节是 12.7.31 中“个人中心去重，不得大多数都跳相册”和 12.7.39 中“底部导航三入口一致”的联合收口。
- 本节不讨论个人中心具体功能是否可用，只约束入口数量、入口语义和底栏系统一致性。
- 即使每个按钮都能点击，只要仍有多个相册入口堆叠、四项底栏残留或路由分流过弱，仍按本节退回。

##### 12.7.40.2 接收口径

| 模块 | 接收标准 | 不可接受形态 |
| --- | --- | --- |
| 底部导航 | 与首页/工具箱一致，固定三入口：`首页 / 工具箱 / 我的` | 个人中心仍保留四项底栏，或单独一套底栏样式 |
| 相册入口数量 | 页面内最多保留一个明确的相册/待分享入口 | 多个卡片、按钮或功能块都进入相册，形成重复堆叠 |
| 入口主次 | 个人中心入口主次清楚，不得让相册入口压过创建聚会、工具箱、账本、好友/设置、最近聚会简报链路 | 相册成为页面主视觉或多个一级入口，其他链路被弱化 |
| 路由分流 | 入口标题与落点一一对应，不能“大多数按钮都进相册” | 标题不同但落点相同，或个人中心大部分入口都跳同一相册页 |
| 最近聚会简报 | 页面内仍应保留最近聚会简报或等价回看链路，不能完全被相册入口淹没 | 用户只能看到相册入口，看不到最近聚会简报或回看路径 |

##### 12.7.40.3 退回码

| 退回码 | 分级 | 触发条件 | 责任角色 | 修复口径 |
| --- | --- | --- | --- | --- |
| `PR-UX-LC008P-P1-ME-ALBUM-ENTRY-DUPLICATE` | P1 | 个人中心内存在多个相册/待分享入口，语义重复或堆叠 | 前端 | 相册相关入口最多保留一个主入口，其余并入明确分流模块 |
| `PR-UX-LC008P-P1-ME-TABBAR-MISMATCH` | P1 | 个人中心底部导航与首页/工具箱不一致，仍保留四项底栏或不同视觉系统 | 前端 | 统一为三入口 `首页 / 工具箱 / 我的`，并对齐底栏系统 |
| `PR-UX-LC008P-P1-ME-ROUTE-DIVERSITY-WEAK` | P1 | 多个入口标题不同但大多数都进入相册，路由分流无效 | 前端 | 保证入口标题、信息层级和实际落点一一对应 |
| `PR-UX-LC008P-P1-ME-BRIEF-LINK-HIDDEN` | P1 | 最近聚会简报或等价回看链路被隐藏、弱化或被相册入口完全压过 | 前端 | 保留明确的最近聚会回看链路，不让相册吞掉全部回看场景 |

##### 12.7.40.4 截图 / page data 接收标准

| 核查项 | 最低证据 | UI/UX 接收要求 | 无证据处理 |
| --- | --- | --- | --- |
| 个人中心底栏 | `me` 页完整截图 + 底栏结构摘要 | 底栏固定三入口，且与首页/工具箱一致 | 命中 `PR-UX-LC008P-P1-ME-TABBAR-MISMATCH` |
| 相册入口去重 | `me` 页完整截图 + 各入口点击落点记录 | 页面内最多一个明确相册/待分享入口 | 命中 `PR-UX-LC008P-P1-ME-ALBUM-ENTRY-DUPLICATE` |
| 路由分流 | `me` 页截图 + 至少 3 个入口点击后的落点记录 | 不同入口落点和语义清楚，不能大多数都跳相册 | 命中 `PR-UX-LC008P-P1-ME-ROUTE-DIVERSITY-WEAK` |
| 最近聚会简报链路 | `me` 页截图 + 对应简报/回看落点记录 | 页面内保留最近聚会简报或等价回看入口，不被相册淹没 | 命中 `PR-UX-LC008P-P1-ME-BRIEF-LINK-HIDDEN` |

##### 12.7.40.5 资产结论

当前判断：`本任务不要求新资产。`

- 当前问题是入口去重、路由分流和底栏统一，不是图标、背景或字体资产不足。
- 若前端去重后出现页面空洞、层级松散或按钮权重失衡，再另行补视觉约束；本节不提前派生资产任务。

##### 12.7.40.6 证据缺口与当前状态

- 当前仅完成 UI/UX 接收口径和退回码补充，未触发 DevTools，未收到前端 14.68 回包截图。
- 仍缺：`me` 页完整截图、底栏完整截图、相册/简报/工具箱/设置等入口点击落点记录、相关 page data/结构摘要。
- 本节只作为前端 14.68 完成后的复核门禁使用；在没有后续截图/page data 证据前，不写 UI/UX 通过。

#### 12.7.41 `PR-UX-LINK-CLEANUP-008Q-TOOL-DETAIL-USABILITY-REVIEW` 工具详情页可用性断点收口

记录时间：2026-06-18。本节只补工具详情页可用性断点的 UI/UX 接收口径，不改业务源码，不触发 DevTools，不新增资产，不写设计通过。PM 静态核查发现工具详情页底部“查看使用记录”跳未注册 `/pages/usage-history/index`，当前先按工具可用性门禁收口，等待前端 14.69 和后续截图/page data 复核。

##### 12.7.41.1 口径衔接

- 本节是 12.7.31 中“工具箱列表可用”标准的细化，范围下沉到工具详情页。
- 本节不讨论工具业务逻辑是否正确，只约束工具详情页底部 CTA、返回路径和可达性不能断。
- 即使工具详情内容可读，只要底部主按钮跳未注册页面、空页或死入口，仍按本节退回。

##### 12.7.41.2 接收口径

| 模块 | 接收标准 | 不可接受形态 |
| --- | --- | --- |
| 底部主操作 | 工具详情页底部主按钮必须服务当前工具使用，文案与当前页面可执行动作一致 | 主按钮叫“查看使用记录”但跳未注册页，或主按钮文案与实际动作不匹配 |
| 使用记录入口 | 若保留“查看使用记录”，必须确认该记录页已注册、可进入、可返回；否则不得作为当前底部主 CTA | 跳转白屏、404、未注册页、空壳页或无效记录页 |
| 返回工具箱 | 从工具详情返回工具箱的入口必须清楚、稳定，不让用户卡在工具详情页 | 返回入口过弱、隐藏过深，或返回后上下文丢失 |
| 当前工具闭环 | 页面底部操作应优先帮助用户“立即使用当前工具”或“返回工具箱继续选工具” | 用无关历史页、占位入口或未接功能替代当前工具动作 |

##### 12.7.41.3 退回码

| 退回码 | 分级 | 触发条件 | 责任角色 | 修复口径 |
| --- | --- | --- | --- | --- |
| `PR-UX-LC008Q-P1-TOOL-DETAIL-DEAD-CTA` | P1 | 工具详情页底部 CTA 跳未注册页面、空页、死入口或无效记录页 | 前端 | 删除死 CTA 或改为当前工具可执行动作；若保留记录入口，必须保证可用 |
| `PR-UX-LC008Q-P1-TOOL-USABILITY-BROKEN` | P1 | 工具详情页底部操作不能帮助用户完成当前工具使用，形成可用性断点 | 前端 | 底部主操作优先服务当前工具，避免无关占位动作 |
| `PR-UX-LC008Q-P1-TOOL-RETURN-WEAK` | P1 | 从工具详情返回工具箱的路径不清楚、反馈弱或上下文丢失 | 前端 | 强化返回入口和返回后的工具箱承接，不让用户迷路 |

##### 12.7.41.4 截图 / page data 接收标准

| 核查项 | 最低证据 | UI/UX 接收要求 | 无证据处理 |
| --- | --- | --- | --- |
| 底部 CTA 可用性 | 工具详情页截图 + CTA 点击后的落点截图 + page data/路径摘要 | 底部 CTA 必须落到可用页面或直接执行当前工具动作 | 命中 `PR-UX-LC008Q-P1-TOOL-DETAIL-DEAD-CTA` / `...TOOL-USABILITY-BROKEN` |
| 返回工具箱路径 | 工具详情页截图 + 返回后的工具箱截图 | 用户能稳定返回工具箱，且知道自己回到了工具选择层 | 命中 `PR-UX-LC008Q-P1-TOOL-RETURN-WEAK` |
| 当前工具动作匹配 | 工具详情页截图 + 主按钮文案 + 点击结果摘要 | 主按钮文案与当前页面实际可执行动作一致 | 缺证据时继续待前端 14.69 和后续截图复核 |

##### 12.7.41.5 资产结论

当前判断：`本任务不要求新资产。`

- 当前问题是工具详情页 CTA 和返回路径的可用性，不是图标、背景或字体资产不足。
- 若前端修复后出现按钮层级失衡或详情页空洞，再另行补视觉约束；本节不提前派生资产任务。

##### 12.7.41.6 证据缺口与当前状态

- 当前仅完成 UI/UX 接收口径和退回码补充，未触发 DevTools，未收到前端 14.69 回包截图。
- 仍缺：工具详情页完整截图、底部 CTA 点击后落点截图、返回工具箱截图、相关 page data/路径摘要。
- 本节只作为前端 14.69 完成后的复核门禁使用；在没有后续截图/page data 证据前，不写 UI/UX 通过。

#### 12.7.42 `PR-UX-LINK-CLEANUP-008R-MOMENT-AUTH-SEMANTIC-REVIEW` 拍第一张页授权语义收口

记录时间：2026-06-18。本节只补拍第一张页“一句话说明 2 行 + 默认文案，授权无仅自己且 4 项默认全选”的 UI/UX 接收口径，不改业务源码，不触发 DevTools，不新增资产，不写设计通过。PM 静态核查发现当前页面同时有 3 个可见范围单选和 4 个授权用途勾选，容易造成“4 项全选”口径被误读；本节先把两套控件的语义拆清。

##### 12.7.42.1 口径衔接

- 本节是 12.7.31、12.7.33、12.7.36 中“无仅自己”“4 项默认全选”“一句话说明 2 行 + 默认文案”的细化。
- 本节不要求减少到单一控件，而是要求用户能明确分辨：
  - `可见范围`：控制谁能看
  - `授权用途`：控制这张内容允许被用于哪些用途
- 即使功能逻辑正确，只要两套控件在文案、层级或默认态上混淆，仍按本节退回。

##### 12.7.42.2 接收口径

| 模块 | 接收标准 | 不可接受形态 |
| --- | --- | --- |
| 可见范围 | 明确作为独立分组呈现，可保留 3 项范围选择，但不得包含“仅自己” | 范围选项与授权用途混在一起，或仍出现“仅自己” |
| 授权用途 | 明确作为独立分组呈现，4 项默认全选，且选中反馈清楚 | 4 项未默认全选，或选中态弱到难以辨认 |
| 范围/授权语义 | 组标题、说明、间距、控件样式能让用户一眼分清“谁能看”和“允许怎么用” | 用户容易误以为“4 项全选”指的是可见范围，或两组控件没有边界 |
| 一句话说明 | 视觉上最多 2 行，不挤压主输入区和授权区 | 文案超过 2 行、占据过高屏幕空间 |
| 默认文案 chip | 默认文案 chip 可见、可点击、点击后能直接填充输入框，降低输入成本 | 默认文案隐藏过深、不可点、点击无反馈或不填充 |

##### 12.7.42.3 退回码

| 退回码 | 分级 | 触发条件 | 责任角色 | 修复口径 |
| --- | --- | --- | --- | --- |
| `PR-UX-LC008R-P1-AUTH-SCOPE-CONSENT-MIXED` | P1 | 可见范围与授权用途语义混淆，用户无法分清“谁能看”和“允许怎么用”，或仍出现“仅自己” | 前端 | 拆清分组标题、布局和默认态；保留 3 项范围选择，但移除“仅自己”；4 项授权默认全选 |
| `PR-UX-LC008R-P1-CAPTION-TWO-LINE-BROKEN` | P1 | 一句话说明视觉上超过 2 行，压缩输入区或授权区 | 前端 | 收口到 2 行内，维持输入主路径清爽 |
| `PR-UX-LC008R-P1-CAPTION-PRESET-WEAK` | P1 | 默认文案 chip 不可见、不可点、点击不填充或反馈弱 | 前端 | 提高默认文案可见度和点击反馈，确保一键填充 |

##### 12.7.42.4 截图 / page data 接收标准

| 核查项 | 最低证据 | UI/UX 接收要求 | 无证据处理 |
| --- | --- | --- | --- |
| 可见范围 / 授权用途分组 | 拍第一张页完整截图 + page data 摘要 | 用户能一眼分清两组控件；可见范围无“仅自己”；授权用途 4 项默认全选 | 命中 `PR-UX-LC008R-P1-AUTH-SCOPE-CONSENT-MIXED` |
| 一句话说明 | 拍第一张页截图 | 视觉上最多 2 行，不挤压下方输入/授权区域 | 命中 `PR-UX-LC008R-P1-CAPTION-TWO-LINE-BROKEN` |
| 默认文案 chip | 拍第一张页截图 + 点击 chip 后的输入框截图 | chip 可见、可点击、可直接填充，用户输入成本低 | 命中 `PR-UX-LC008R-P1-CAPTION-PRESET-WEAK` |

##### 12.7.42.5 资产结论

当前判断：`本任务不要求新资产。`

- 当前问题是语义分组、文案层级和交互反馈，不是图标、背景或字体资产不足。
- 若前端修复后出现分组容器拥挤、间距失衡或 chip 视觉过弱，再另行补视觉约束；本节不提前派生资产任务。

##### 12.7.42.6 证据缺口与当前状态

- 当前仅完成 UI/UX 接收口径和退回码补充，未触发 DevTools，未收到前端 14.70 回包截图。
- 仍缺：拍第一张页完整截图、默认文案点击前后截图、相关 page data/状态摘要。
- 本节只作为前端 14.70 完成后的复核门禁使用；在没有后续截图/page data 证据前，不写 UI/UX 通过。

#### 12.7.43 `PR-UX-LINK-CLEANUP-008T-INVITE-PREVIEW-MINIMAL-REVIEW` 邀请预览极简收口

记录时间：2026-06-18。本节只补 `share-preview` 中“邀请预览”tab 的极简接收口径，不改业务源码，不触发 DevTools，不写设计通过。PM 静态核查发现当前邀请预览仍展示照片高光/照片空态、可见范围/隐私保护/加入提示三栏和举报反馈，和用户要求“只需要看到口令、好友加入状态”冲突；本节先把邀请预览从分享保存图语义中剥离出来。

##### 12.7.43.1 口径边界

- 邀请预览是 `加入前` 的轻量入口页，只负责告诉用户“这是什么聚会、如何加入、已有谁加入”。
- 分享页 / 分享截图保存仍必须按 12.7.36、12.7.37 的要求保持酷炫，并承载“照片 + 聚会账本”双主视觉。
- 邀请预览 `不是` 分享保存图，不应承载照片墙、账本摘要、保存图动作或厚说明模块。

##### 12.7.43.2 接收口径

| 模块 | 接收标准 | 不可接受形态 |
| --- | --- | --- |
| 口令主体 | 邀请预览主视觉只需突出口令主体，用户一眼能看懂如何加入 | 口令被照片、说明卡或多栏信息稀释 |
| 好友加入状态 | 明确展示已有好友加入状态，可用头像组、人数短句或胶囊状态 | 没有加入反馈，或状态弱到难以识别 |
| 极短产品识别 | 可保留一句极短产品识别或轻背景氛围，帮助用户确认这是“聚会记录师”的加入页 | 出现长段说明性文字、隐私长文、规则说明或多段解释卡 |
| 禁止内容模块 | 不展示照片墙、照片空态、账本摘要、可见范围三栏、隐私厚说明、举报反馈、分享/群/保存海报动作 | 把邀请预览做成半个分享页或半个说明页，内容过多 |
| 动作密度 | 只保留加入主动作和必要的单个辅助动作，不形成多按钮矩阵 | 同屏出现分享给好友/群/保存海报/举报反馈等多组动作 |

##### 12.7.43.3 退回码

| 退回码 | 分级 | 触发条件 | 责任角色 | 修复口径 |
| --- | --- | --- | --- | --- |
| `PR-UX-LC008T-P0-INVITE-PREVIEW-NOT-MINIMAL` | P0 | 邀请预览仍展示照片墙、照片空态、账本摘要、可见范围三栏、隐私厚说明、举报反馈或分享/群/保存海报动作 | 前端 | 邀请预览回到口令主体 + 好友加入状态的极简结构，删除多余内容模块 |
| `PR-UX-LC008T-P1-INVITE-STATUS-WEAK` | P1 | 口令虽存在，但好友加入状态表达弱，用户难以判断是否已有成员加入 | 前端 | 用头像组、人数短句或状态胶囊强化加入反馈 |
| `PR-UX-LC008T-P1-INVITE-EXPLAIN-OVERLOAD` | P1 | 页面仍保留过多说明性文字板块，压缩口令和加入动作的注意力 | 前端 | 压缩为极短产品识别，不保留厚说明块 |

##### 12.7.43.4 截图 / page data 接收标准

| 核查项 | 最低证据 | UI/UX 接收要求 | 无证据处理 |
| --- | --- | --- | --- |
| 邀请预览极简态 | `share-preview` 邀请预览截图 + page data/结构摘要 | 只见口令主体、好友加入状态、极短识别信息，无照片/账本/厚说明/多动作模块 | 命中 `PR-UX-LC008T-P0-INVITE-PREVIEW-NOT-MINIMAL` |
| 加入状态可读 | 邀请预览截图 + 加入状态摘要 | 用户能一眼看懂已有谁加入或已有多少人加入 | 命中 `PR-UX-LC008T-P1-INVITE-STATUS-WEAK` |
| 邀请 / 分享边界 | 邀请预览截图 + `share-poster` 或保存图证据对照 | 邀请预览保持极简；分享页/保存图继续单独承载照片+账本双主视觉 | 若邀请预览继续承担分享内容，按 `...NOT-MINIMAL` 退回；分享页仍按 12.7.36 / 12.7.37 复核 |

##### 12.7.43.5 资产结论

当前判断：`本任务不要求新资产。`

- 当前问题是模块减法和信息边界，不是背景、图标或字体资产不足。
- 若前端删减后页面过空，再另行补极短识别与轻背景氛围的视觉约束；本节不提前派生资产任务。

##### 12.7.43.6 证据缺口与当前状态

- 当前仅完成 UI/UX 接收口径和退回码补充，未触发 DevTools，未收到前端 008T 回包截图。
- 仍缺：`share-preview` 邀请预览截图、加入状态摘要、与分享页/保存图的对照证据。
- 本节只作为前端 008T 完成后的复核门禁使用；在没有后续截图/page data 证据前，不写 UI/UX 通过或上线通过。

#### 12.7.44 `PR-UX-LINK-CLEANUP-008V-SHARE-RETURN-VISUAL-REVIEW` 分享回流视觉待复核口径

记录时间：2026-06-18。按 PM 008V 派工，本节只补分享回流视觉接收口径，不改业务源码，不触发 DevTools，不扩大设计资产范围，不写设计通过。依据 008U / 测试 13.16.91，当前仅能确认：纯邀请与加入状态已在预览框阶段通过；带 `briefId=brief-1781756527712-95eff999` 的分享回流 data 层未隐藏照片 / 聚会账本 / 事件，但 `photoHighlights=2` 且两项均 `imageBroken=true`，同时缺右侧预览截图，因此 008V 当前状态保持 `待复核`。

##### 12.7.44.1 口径衔接

- 邀请预览极简化继续以 12.7.43 为准，纯邀请和加入状态不再重复复核。
- 008V 只看 `share-preview` 的 `shareReturnMode=true` 分享回流态，不再回头扩大 008O / 008R / 纯邀请矩阵。
- 分享回流属于分享链路视觉页，应与 12.7.36 / 12.7.37 的“分享页 / 保存图”口径对齐，但本轮只做回流页单点接收，不补新资产。

##### 12.7.44.2 SKILL 选择记录

| SKILL | 选择理由 | 使用边界 |
| --- | --- | --- |
| `web-design-guidelines` | 本轮是等待截图后的视觉接收门禁整理，需要把短屏、破图、无关说明、旧壳残留等判断写成可执行标准 | 只做截图接收/退回标准，不写实现通过 |
| `design-taste-frontend` | 本轮要约束分享回流必须短屏、酷炫、照片+账本同屏，不能因修破图而回到长列表、厚说明或旧壳 | 只做视觉层级和旧壳零容忍口径，不生图、不改源码 |

##### 12.7.44.3 接收口径

| 模块 | 接收标准 | 不可接受形态 |
| --- | --- | --- |
| 短屏节奏 | 分享回流首屏应短而聚焦，核心内容在首屏内形成完整阅读节奏 | 页面又臭又长、事件/说明厚列表把主视觉推到二屏后 |
| 主视觉结构 | 照片与聚会账本高光需同屏出现，且主次清楚 | 只有账本无照片、只有照片无账本，或账本被挤成底部弱块 |
| 照片状态 | 照片必须真实可见，非白卡、非破图、非 `imageBroken=true` 占位视觉 | 破图、白块、空照片壳、图片 URL 有值但画面不可见 |
| 视觉气质 | 回流页应保持聚会/酒局基因与轻酷炫感，但不能回旧“酒桌判官”红壳或旧卡片壳 | 旧红壳、旧品牌词、厚卡壳、压迫式旧视觉 |
| 说明文字 | 不出现无关说明文字、raw/debug/internal 文案或过厚解释块 | 调试字段、接口错文案、无关说明、过多提示文字抢主视觉 |

##### 12.7.44.4 截图 / page data 接收标准

| 核查项 | 最低证据 | UI/UX 接收要求 | 无证据处理 |
| --- | --- | --- | --- |
| 分享回流主截图 | `share-preview` 回流态右侧预览截图 + share return query | 必须能看到真实回流页面，而不是只靠 data 层判断 | 缺截图时保持 `待复核`，不写 UI/UX 通过 |
| 照片恢复 | 回流态截图 + `photoHighlights` 摘要 | 照片非白非破，真实像素可见；`imageBroken=true` 必须清零 | 缺照片截图或仍破图，继续待前端 / 接口联调修复 |
| 照片 + 账本同屏 | 回流态截图 + `accountingHighlights/keyEvents` 摘要 | 照片与聚会账本同屏，账本/事件仍展示但不压主视觉 | 若账本或事件消失，或页面重新拉成长列表，退回前端 |
| 旧壳 / 无关说明 | 回流态截图 + Console/page data 摘要 | 无旧壳、无 raw/debug/internal 文案、无无关说明块 | 命中 12.7.36 的 `PR-UX-LC008H-P0-DATA-LEAK-IN-UI` 或本节待退回口径 |

##### 12.7.44.5 预置退回口径

| 退回码 | 分级 | 触发条件 | 责任角色 | 修复口径 |
| --- | --- | --- | --- | --- |
| `PR-UX-LC008V-P0-SHARE-RETURN-PHOTO-BROKEN` | P0 | 分享回流截图仍出现破图、白卡、空照片壳，或 data 仍为 `imageBroken=true` | 前端 + 接口联调 | 修复照片渲染 / URL / 容错；保留照片/账本/事件 data 合同，不得删模块规避 |
| `PR-UX-LC008V-P1-SHARE-RETURN-NOT-SHORT-SCREEN` | P1 | 页面过长、主视觉被厚列表或说明块压到二屏后 | 前端 | 收口为短屏结构，首屏先交代照片+账本，再给必要摘要 |
| `PR-UX-LC008V-P1-SHARE-RETURN-HIERARCHY-WEAK` | P1 | 照片与账本虽都在，但主次不清、账本弱化或事件挤占主视觉 | 前端 | 强化照片+账本双主视觉，事件保持摘要化 |
| `PR-UX-LC008V-P1-SHARE-RETURN-OLD-SHELL-OR-COPY` | P1 | 出现旧壳、旧品牌词、raw/debug/internal 文案或无关说明块 | 前端 | 清除旧壳与无关说明，保持聚会记录师新视觉口径 |

##### 12.7.44.6 证据缺口与当前状态

- 当前仅完成 UI/UX 接收口径补充，未触发 DevTools，未收到测试 `PR-QA-LINK-CLEANUP-008V-SHARE-RETURN-PHOTO-RETEST` 的右侧预览截图。
- 已知证据只到 data 层：`shareReturnMode=true`、`photoHighlights=2`、`accountingHighlights=4`、`keyEvents=2`，但两项照片均 `imageBroken=true`。
- 在没有右侧预览截图、page data、Console/storage 摘要前，008V 必须保持 `待复核`；不得写 UI/UX 通过、真机通过、上线通过或全链路通过。

#### 12.7.45 `PR-UX-LINK-CLEANUP-008AJ/008AK` 邀请房间码书签纸页与原生分享卡缩略图资产

记录时间：2026-06-19。本节处理 `PR-UX-LINK-CLEANUP-008AJ-INVITE-CODE-BOOKMARK-PAPER-ASSET` 和追加任务 `PR-UX-LINK-CLEANUP-008AK-NATIVE-SHARE-CARD-THUMB-ASSET`。本轮只产出设计资产、设计说明和 UI/UX 计划记录；不改小程序业务源码，不改 PM 台账，不写实现通过。

##### 12.7.45.1 SKILL 选择记录

| SKILL | 选择依据 | 使用边界 | 证据 |
| --- | --- | --- | --- |
| `imagegen` | 当前需要一个带纸质肌理、书签纸页、右下角轻卷角的位图资产；这类材质和氛围更适合先用位图生成思路确定风格 | 只用于确定纸质感、卷角、暖色氛围和安全区方向；不把首次整页 mock 直接入包 | 已读取 `C:\\Users\\Administrator\\.codex\\skills\\.system\\imagegen\\SKILL.md`，并调用内置 `image_gen` 首次生成风格参考 |
| `design-taste-frontend` | 邀请码卡片和微信原生分享缩略图都需要克制、非旧判官风格、中心安全区稳定、不要回厚卡或旧红壳 | 只用于约束层级、留白、安全区和移动端接入感受；不生业务 UI 代码 | 结合 `invite-code-card` 结构和现有 clean-slate 资产做收口 |

未使用 `imagegen-frontend-mobile`：本轮不是整页手机界面方案，而是单个邀请卡片背景与原生分享缩略图底图，更适合 `imagegen` 的单资产模式。

##### 12.7.45.2 读取与结构依据

| 读取项 | 结论 |
| --- | --- |
| `miniprogram/pages/invite-group/index.wxml` | 当前 `.invite-code-card` 内承载 `房间码 / 邀请码值 / 加入状态 / 头像槽`，需要中部大安全区和底部头像带 |
| `miniprogram/pages/invite-group/index.less` | `.invite-code-card` 当前是白底叠分享背景图，缺纸页感和卷角；现有内容为居中栅格，适合替换背景图而不改结构 |
| `docs/design-assets/party-recorder/clean-slate-001/cuts/` | 现有有 glow / badge / polaroid 等分享流切图，但没有适合邀请码卡的书签纸页底图，因此本轮新增邀请卡专属资产 |

##### 12.7.45.3 首次生成记录与边界

首次按 `imagegen` 生成的参考图位于：

- `C:\\Users\\Administrator\\.codex\\generated_images\\019ed491-da14-7492-872b-a1e8f7734950\\ig_0870b1f49e97d840016a325d2e3ebc8191bd34ef06409619f5.png`

用途说明：

- 该图用于确认“暖 ivory 纸页、轻卷角、轻聚会氛围、非旧判官视觉”的风格方向。
- 该图被生成为整页 mock，不适合直接入包给前端，因此未直接落位业务资产。
- 最终交付改为项目内可控的 PNG + SVG 组合，避免中间安全区被模型自动加 UI 元素污染。

##### 12.7.45.4 交付资产

| 任务 | 资产路径 | 尺寸 | 格式 | 用途 | 是否可直接入包 |
| --- | --- | --- | --- | --- | --- |
| 008AJ 邀请码卡片背景 | `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008aj-invite-bookmark-card-750x420.png` | `750x420` | PNG | `invite-group` 页面 `.invite-code-card` 背景底图 | 是 |
| 008AJ 源文件 | `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008aj-invite-bookmark-card-source.svg` | `750x420` | SVG | 可维护源稿，供前端或 UI/UX 后续微调卷角、胶带、留白 | 是 |
| 008AK 原生分享卡缩略图底图 | `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008ak-native-share-thumb-1000x800.png` | `1000x800` | PNG | 微信原生“发送给好友”分享卡底图，供 canvas/分享图生成时绘制邀请码与头像 | 是 |
| 008AK 源文件 | `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008ak-native-share-thumb-source.svg` | `1000x800` | SVG | 可维护源稿，供后续微调标题区、邀请码区、头像槽区 | 是 |

当前未输出 WebP：

- PNG 已足够直接接入和验证透明边界。
- 若前端入包后需要进一步压缩，建议再导出一份 `quality 82-88` 的 WebP 作为发布版；当前不在 UI/UX 线程内继续做构建级压缩。

##### 12.7.45.5 风格与安全区说明

| 资产 | 风格说明 | 安全区说明 |
| --- | --- | --- |
| `pr-cs008aj-invite-bookmark-card-750x420.png` | 暖 ivory 纸页、轻纸纤维、顶部书签胶带、右下角轻卷页、轻桃杏色边缘氛围；保留聚会/邀请/记录分享气质，不带旧“判官”或旧红壳 | 中央安全区建议保留 `x=150..600 / y=82..300`；房间码建议放在中上部，加入状态紧随其下，头像槽放底部中段；卷角区域 `x>610 && y>280` 不放关键文字 |
| `pr-cs008ak-native-share-thumb-1000x800.png` | 同一纸页语言，增加一层轻内衬纸板和底部头像带，适合微信原生分享卡缩略图快速识别 | 四周裁切安全边距建议 `56px`；文字不要贴边；右下卷角区域 `x>820 && y>560` 禁放邀请码和头像；顶部 `y<110` 保留给视觉呼吸，不放小字 |

##### 12.7.45.6 008AK 原生分享卡缩略图绘制规格

建议前端以 `1000x800` 画布输出，最终再按微信分享链路缩放。动态文字和头像建议坐标如下：

| 元素 | 建议区域 / 坐标 | 说明 |
| --- | --- | --- |
| 邀请标题 | `x=146, y=226, w=560, h=82` | 标题建议一行，最多两行；文案如“邀请你加入这场聚会”或“来一起记录今晚的聚会” |
| 邀请码标签 | `x=150, y=330` | 小标签，不建议超过 24px 等效字高 |
| 邀请码主体 | `x=150, y=382, w=360, h=108` | 适合 5-6 位大号邀请码；建议字间距略放大，避免压到卷角区 |
| 加入状态短句 | `x=150, y=510, w=420, h=34` | 如“3 位好友已加入”，保持一行短句 |
| 头像槽带 | `x=128, y=492, w=564, h=92` | 当前底图已留一条头像带；头像可沿左到右排 5 枚 |
| 头像圆槽 | `[(194,556),(268,556),(342,556),(416,556),(490,556)]`，直径 `46` | 头像建议裁成圆形；不足时可用成员首字母补位 |
| 品牌小识别 | `x=150, y=618` | 只保留极短识别，如“聚会记录师邀请”或房间名，不放长说明 |

前端 `imageUrl` 接入建议：

- 原生分享卡不要继续留空 `imageUrl: ''`。
- 建议在 `onShareAppMessage()` 内优先使用 canvas 生成后的分享卡路径写入 `imageUrl`。
- 若前端先走静态演示链路，可临时以 `pr-cs008ak-native-share-thumb-1000x800.png` 作为背景底图，再叠绘标题、邀请码和头像后导出。

##### 12.7.45.7 CSS / 结构接入建议

| 页面 / 选择器 | 建议接入方式 |
| --- | --- |
| `miniprogram/pages/invite-group/index.wxml` 的 `.invite-code-card` | 将当前白底叠 `party-recorder-share-bg.webp` 的背景替换为 `pr-cs008aj-invite-bookmark-card-750x420.png`；保留现有房间码、加入状态、头像槽结构，不额外加厚说明模块 |
| `.invite-code-card` | `background-size: 100% 100%` 或等比 cover + 中心对齐；避免卷角被裁掉；卡片内边距继续优先让房间码和加入状态居中落在安全区 |
| 微信原生分享卡 | 使用 `pr-cs008ak-native-share-thumb-1000x800.png` 作 canvas 背板，再绘制动态标题、邀请码、加入状态和头像；不要直接把完整页面截图塞进 `imageUrl` |

##### 12.7.45.8 未验证项

- 当前未改业务源码，因此未验证 `.invite-code-card` 实际替换后的缩放、safe-area 和头像槽是否与真实 DOM 完全贴合。
- 当前未验证 `onShareAppMessage()` 的 `imageUrl` 接入、canvas 导出路径和微信原生分享卡真实裁切效果。
- 当前未生成 WebP 压缩版；如前端确认 PNG 体积需继续压缩，再在前端接入阶段补导出。
- 当前不写实现通过；仍需前端回包截图、原生分享卡预览证据和后续测试截图。

#### 12.7.46 `PR-UX-LINK-CLEANUP-008AL-INVITE-CODE-PAPER-CURL-STRENGTHEN-ASSET` 页面内房间码卡卷角强化资产

记录时间：2026-06-19。测试 13.16.111 已确认：页面内邀请房间码卡片的口令、加入状态、头像 slot、微信绿分享按钮和底部“拍第一张”无遮挡且可读；但 390 宽微信开发者工具右侧预览下，书签纸页 / 右下角卷起效果不够明确。本节只强化页面内 `.invite-code-card` 背景资产；不扩大到 008AK 原生分享缩略图，不改业务源码、PM 总台账或测试结论。

##### 12.7.46.1 SKILL 选择记录

| SKILL | 选择依据 | 使用边界 |
| --- | --- | --- |
| `design-taste-frontend` | 本轮是对现有书签纸页资产做可读性强化，需要在 390 宽预览里提高卷角识别度，同时保持中部安全区和按钮可达性 | 只用于卷角强度、留白、安全区和视觉克制判断，不生业务源码 |
| `imagegen` | 上一轮 008AJ 已用于确定纸页材质、暖色气质和非旧判官方向；本轮沿同一风格语言继续加强资产辨识度 | 本轮不再直接把新模型整页图入包，最终交付仍是项目内可控 PNG + SVG 资产 |

##### 12.7.46.2 交付资产

| 资产路径 | 尺寸 | 格式 | 用途 | 是否可直接入包 |
| --- | --- | --- | --- | --- |
| `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008al-invite-bookmark-card-750x420.png` | `750x420` | PNG | 页面内 `.invite-code-card` 卷角强化版背景 | 是 |
| `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008al-invite-bookmark-card-source.svg` | `750x420` | SVG | 可维护源稿，便于继续微调卷角角度、描边和高光 | 是 |

##### 12.7.46.3 强化点与安全区

| 项目 | 说明 |
| --- | --- |
| 卷角强化方式 | 右下角卷起面积放大，增加内侧折面、弧线折痕和高光线，让 390 宽右侧预览也能一眼看出“纸页卷起” |
| 中央安全区 | 继续保留 `x=150..600 / y=82..300` 为主要口令与加入状态安全区，不增加中部装饰 |
| 卷角禁放区 | `x>592 && y>266` 区域不放邀请码、加入状态、头像槽和辅助文案，避免卷角压内容 |
| 头像槽安全区 | 头像槽仍建议在卡片下中部横向展开，不进入右下卷角禁放区 |
| 按钮边界 | 本轮只改卡片底图，不改变复制 / 刷新、微信绿分享按钮或底部 CTA 的位置和层级 |

##### 12.7.46.4 前端替换建议

| 选择器 / 文件 | 替换建议 |
| --- | --- |
| `.invite-code-card` | 将当前 008AJ 背景图替换为 `pr-cs008al-invite-bookmark-card-750x420.png` |
| `miniprogram/pages/invite-group/index.less` | 保持 `background-size: 100% 100%` 与现有内边距策略，避免卷角再次被裁掉 |
| 卡片内容层 | 不新增遮罩、不加厚说明模块，不调整文字和头像结构，只做背景替换后复拍 |

##### 12.7.46.5 未验证项

- 当前未改业务源码，因此尚未验证 `pr-cs008al-invite-bookmark-card-750x420.png` 在真实 `.invite-code-card` 中的最终缩放效果。
- 当前未验证 390 宽右侧预览复拍是否已达到 PM 对“卷起明确可见”的最终门槛。
- 当前不写实现通过；仍需前端替换后截图和测试复拍证据。

#### 12.7.47 `PR-UX-LINK-CLEANUP-008AN-RECORD-LEDGER-TIMELINE-DESIGN-ASSETS` 记录/账本页时间线设计资产

记录时间：2026-06-19。按 PM 008AN 催办，本节只围绕记录/账本页回包，不扩大到邀请卡、分享页或业务源码修改。依据 `docs/runtime/ai-thread-dispatch-queue.md` 008AN 行、当前 `miniprogram/pages/live-record/index.wxml` 结构和 Clean Slate 资产包，现状问题明确如下：

- 页面标题仍写死为“记录/账本”，未把玩家创建的酒局名 `sessionName` 提到页头主标题。
- 记录 tab 仍是“照片墙”和“账本动态”拆段堆叠，不是左侧明线时间线，也没有把拍照事件、欠酒/加酒变动放在同一条现场时间线上。
- 现有结构允许前端继续用纯样式临时拼接列表，因此需要 UI/UX 直接给出 1:1 目标图与切图，避免用 CSS 假做时间线或纸页气质蒙混过关。

##### 12.7.47.1 SKILL 选择记录

| SKILL | 选择依据 | 使用边界 | 证据缺口 |
| --- | --- | --- | --- |
| `imagegen-frontend-mobile` | 008AN 需要重新生成一张偏移动端实机感的目标页，要求短屏、可读、带聚会/酒局氛围、照片与账本节点同屏，适合用移动端生图技能先定整体构图与气质 | 只用于确定单屏构图、暖色舞台光效、时间线事件混排节奏；不产业务源码，不直接替代项目内可维护切图 | 当前线程无前端实现截图，因此生图只能作为目标参考，不能写实现通过 |
| `design-taste-frontend` | 008AN 核心不是“再做一页漂亮图”，而是防止前端回到厚列表、旧壳、假时间线、弱层级，因此需要它来约束层级、节奏、短屏和可复刻边界 | 只用于制定 1:1 复刻要求、限制卡片厚度、禁止纯 CSS 伪装时间线；不扩展到别的页面设计 | 仍缺 008AN 前端回包截图和 QA 对照图，当前只能给设计基线和退回门槛 |

##### 12.7.47.2 生成记录与设计图路径

| 项目 | 内容 |
| --- | --- |
| 生图 prompt 摘要 | 聚会记录师 iOS 风格记录/账本融合页；标题使用真实酒局名“海边烧烤局”；四个同级 tab；左侧明线时间线贯穿首屏；时间线混排拍照节点、欠酒 +1、加酒 +2；底部仅保留“继续拍照”主 CTA；暖色桌面氛围、纸面与拍立得细节、小贴纸只做点缀；禁止旧红壳、工程文案、白卡、长列表 |
| 项目内落盘目标图 | `docs/design-assets/party-recorder/clean-slate-001/figma-13-record-ledger-timeline-008an.svg` |
| 目标图尺寸 | `390x844` |
| 目标图用途 | `live-record` 页面记录 tab 的 1:1 视觉基线；前端必须对照此图复刻标题、四 tab、左侧明线时间线、照片节点、账本节点和底部 CTA |
| 接入说明 | 该 SVG 是项目内可维护设计源稿，不直接整图入包为页面截图背景；前端需拆分为结构 + 切图复刻 |

##### 12.7.47.3 切图资产清单

| 资产路径 | 尺寸 | 格式 | 用途 | 前端接入建议 |
| --- | --- | --- | --- | --- |
| `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008an-timeline-rail.svg` | `64x1040` | SVG | 左侧明线时间线底轨，禁止再用单色 `border-left` 假做主视觉 | 放入记录 tab 时间线容器左列，纵向重复或裁切，但颜色与发光不可重画成普通灰线 |
| `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008an-photo-node-frame.svg` | `248x188` | SVG | 拍照事件卡片相框基底，承载真实照片缩略图与一行说明 | 作为照片节点容器底图；真实照片铺入中部留白区，不得改成白卡空槽 |
| `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008an-ledger-chip-debt.svg` | `164x68` | SVG | 欠酒变动霓虹条基底 | 用于 `欠酒 +N` 节点高光条，不得退化为普通灰 badge |
| `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008an-ledger-chip-drink.svg` | `164x68` | SVG | 加酒变动暖色条基底 | 用于 `加酒 +N` 节点高光条，与欠酒条保持同层级不同色相 |
| `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008an-timeline-node-photo.svg` | `56x56` | SVG | 拍照事件时间线节点 icon | 用于时间线轨道节点，不得改回默认圆点 |
| `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008an-timeline-node-ledger-debt.svg` | `56x56` | SVG | 欠酒事件节点 icon | 用于账本欠酒事件节点 |
| `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008an-timeline-node-ledger-drink.svg` | `56x56` | SVG | 加酒事件节点 icon | 用于账本加酒事件节点 |

##### 12.7.47.4 页面结构与 1:1 复刻标注

| 区域 | 规格 | 红线 |
| --- | --- | --- |
| 页头标题 | 顶部主标题必须直接显示 `sessionName`；“记录/账本”退到次级说明或不再单独占主标题位 | 不得继续把“记录/账本”作为唯一大标题；不得把真实酒局名缩进副标题 |
| 四 tab 层级 | `记录 / 相册 / 分享 / 聚会账本` 四 tab 同级；记录 tab 激活态用暖纸色实体胶囊，其余为暗底文字态 | 不得把账本挪成二级按钮；不得出现旧工具壳或厚重 segmented 卡 |
| 时间线列宽 | 左列轨道区按目标图约 `44-64rpx` 宽保留独立视觉带，中间亮轨必须始终可见 | 不得用纯 `border-left` 或单像素灰线代替 `pr-cs008an-timeline-rail.svg` |
| 事件节奏 | 首屏至少同时出现 1 个拍照节点 + 2 个账本节点；照片与账本事件混排在同一条线，不再拆成“照片墙一块 + 账本动态一块” | 只出现照片墙或只出现账本列表都不达标 |
| 照片节点 | 照片节点卡片宽度建议 `242-258rpx`，内含真实照片缩略图、安全说明文字和时间；照片缩略图必须真实像素可见 | 白卡、空洞、破图、只剩文字 fallback 一律退回 |
| 账本节点 | 账本节点由事件文案 + 霓虹条组成；霓虹条优先显示 `欠酒 +N` 或 `加酒 +N` 和被记名对象 | 不得把账本节点降级为灰色说明文本或过厚表格行 |
| 底部动作 | 记录 tab 底部主动作只保留“继续拍照”，保持满宽主按钮；账本编辑仍在聚会账本 tab 内处理 | 不得在记录 tab 再堆多组次级编辑按钮，避免主路径分散 |

##### 12.7.47.5 状态要求

| 状态 | 视觉要求 | 说明 |
| --- | --- | --- |
| ready | 时间线首屏同屏展示真实照片节点与账本节点，标题为真实酒局名，底部 CTA 清楚 | 这是 008AN 主接收态 |
| empty | 允许出现空态，但仍保留左侧明线轨道与 1 个空节点占位，文案指向“先拍第一张”或“先记一笔” | 不得整页空白或退回旧列表空壳 |
| loading | 顶部标题和 tab 先稳定占位，时间线列显示弱光轨道 + 2-3 个骨架节点 | 不得因 loading 把页面回退成旧白卡列表 |

##### 12.7.47.6 前端 1:1 接入红线

- 禁止用纯 CSS 渐变、伪元素、`border-left`、普通圆点来冒充本轮时间线主视觉；至少要接入 `pr-cs008an-timeline-rail.svg` 和对应节点 SVG。
- 禁止把 `sessionName` 只塞进副标题或面包屑；用户创建的酒局名必须直接成为页头主识别。
- 禁止继续保留“照片墙一块、账本动态一块”的上下分段结构充当 008AN 完成；本轮验收的是 `同一条时间线`。
- 禁止把账本事件收缩成难读的小字标签；`欠酒/加酒` 高光条必须独立可扫读。
- 禁止把照片节点渲染为白卡、占位洞、纯 fallback 文案或工程字段。
- 禁止任何 UI 界面和交互兜底策略。前端必须按本节目标生图和切图一致实现，不接受“CSS 近似”“临时布局”“先用旧壳顶上”“交互先用旧结构兜底”。
- 下列元素必须真实可见且不可被替代：`sessionName` 主标题、四个同级 tab、左侧明线时间线、照片节点相框、欠酒/加酒霓虹条、底部“继续拍照”主按钮。
- 下列实现方式不计入通过：旧 `live-photo-wall + live-ledger-timeline` 双分段旧壳、普通列表卡片替代时间线、灰色 badge 替代霓虹条、纯文字替代照片节点、工程字段或 fallback 文案上屏。

##### 12.7.47.7 接收点与预置退回码

| 退回码 | 级别 | 触发条件 | 责任角色 | 修复方向 |
| --- | --- | --- | --- | --- |
| `PR-UX-LC008AN-P0-SESSIONNAME-NOT-HERO` | P0 | 页头仍未把 `sessionName` 作为主标题展示，或继续用“记录/账本”充当唯一大标题 | 前端 | 主标题切换为真实酒局名，记录/账本退到结构标签层 |
| `PR-UX-LC008AN-P0-TIMELINE-NOT-UNIFIED` | P0 | 记录页仍把照片和账本拆成两块，不是同一条左侧明线时间线 | 前端 | 还原为统一事件流，照片节点与账本节点混排 |
| `PR-UX-LC008AN-P0-TIMELINE-ASSET-BYPASSED` | P0 | 未使用本轮时间线轨道/节点/霓虹条切图，而是用普通 CSS 假做 | 前端 | 接入 `pr-cs008an-*` 资产并按层级复刻 |
| `PR-UX-LC008AN-P1-PHOTO-NODE-WEAK` | P1 | 照片节点真实像素弱、比例失衡、白卡或空洞，导致拍照事件不成立 | 前端 + 接口联调 | 修照片缩略图渲染与容器比例，保持真实图可见 |
| `PR-UX-LC008AN-P1-LEDGER-DELTA-WEAK` | P1 | 欠酒/加酒条被弱化成灰字、表格行或层级不清 | 前端 | 用霓虹条和事件文案强化账本变化 |
| `PR-UX-LC008AN-P1-SHORT-SCREEN-RHYTHM-BROKEN` | P1 | 页面重新拉成长列表，首屏看不到照片 + 账本同屏节奏 | 前端 | 收口首屏内容密度，保持短屏扫读体验 |

##### 12.7.47.8 依赖接口联调 008AN 的字段清单

| 字段 / 合同 | 用途 | 缺失后果 | 责任角色 |
| --- | --- | --- | --- |
| `sessionName` | 页头主标题与时间线首节点文案 | 无法满足“标题显示玩家创建的酒局名” | 接口联调 + 前端 |
| `timeline event type`（至少区分 `photo` / `drink_debt` / `drink_add`） | 决定节点 icon、卡片类型和霓虹条样式 | 前端无法正确混排事件节点 | 接口联调 |
| `createdAt` / `eventTime` / 可排序时间戳 | 时间线排序、节点时间文案 | 时间线会错序或只能伪造时间 | 接口联调 + 后端/API |
| `imageUrl` / `thumbnailUrl` / `imageBroken` | 照片节点真实像素 | 继续出现白卡、空洞或 fallback 文案 | 接口联调 + 前端 |
| `operatorName` / `targetName` / `operatorAvatarUrl` | 账本事件文案和头像识别 | 账本节点只能显示生硬数字，无角色感 | 接口联调 |
| `debtDelta` / `drinkDelta` | `欠酒 +N` / `加酒 +N` 高光条 | 无法生成账本节点核心信息 | 接口联调 + 后端/API |
| `caption` / `timelineTitle` | 照片节点副标题与短说明 | 照片节点只能回退成通用占位文案 | 接口联调 |

##### 12.7.47.9 当前状态与证据缺口

- 本轮已交付 1 张记录/账本融合页目标图和 7 个时间线专用切图，供前端 `PR-FE-LINK-CLEANUP-008AN-RECORD-LEDGER-TIMELINE-IMPLEMENT` 直接对照接入。
- 当前仍无前端 008AN 实现截图，因此结论仅为 `设计资产已回包，待前端实现与测试复核`，不得写设计通过。
- 下一步需要接口联调线程先回 `PR-INT-LINK-CLEANUP-008AN-RECORD-LEDGER-TIMELINE-DATA-CONTRACT`，确认上述字段是否都可从现有接口 / local store 提供；若字段不足，UI/UX 只接受“壳层待联调”，不接受伪时间线。
- 测试线程后续只需对照本节目标图和切图，检查标题、明线时间线、照片 + 账本同屏、Console 与事件排序，不需要扩展到别页。

#### 12.7.48 `PR-UX-LINK-CLEANUP-008AO-INVITE-PAPER-TARGET-CONFIRM` 邀请页纸页目标图确认

记录时间：2026-06-19。按 PM 最新修正口径，用户明确“用 UI 第一次生成的那张”。因此本节只做目标图确认，不新增纸页资产，不改业务源码，不扩大到记录/账本以外页面。

##### 12.7.48.1 当前指定目标

| 项目 | 结论 |
| --- | --- |
| 当前前端接入目标图 | `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008aj-invite-bookmark-card-750x420.png` |
| 源文件 | `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008aj-invite-bookmark-card-source.svg` |
| 目标尺寸 | `750x420` |
| 当前结论 | `008AJ` 是本次邀请页纸页唯一指定目标图；问题在前端渲染方式未让该原图真实可见，不是 UI 需要继续换图 |

##### 12.7.48.2 对 008AL 的处理

- `pr-cs008al-invite-bookmark-card-750x420.png` 及其 SVG 源稿保留在资产目录，仅作为 `待 PM 另行确认` 的强化探索稿。
- `008AL` 暂不作为当前前端接入目标，不得拿它替代 `008AJ` 原图，也不得把“已接入 008AL”写成当前 UI 指定方案。
- 若前端当前预览仍看不到纸页纹理和右下角卷页，先排查是否使用了 WXSS background、透明遮罩、缩放方式或裁切方式导致 `008AJ` 原图不可见；不接受“再换一张 UI 图”作为首选处理。

##### 12.7.48.3 前端执行红线

- 主视觉必须让 `008AJ` 原图真实可见，优先使用真实 `<image>` 图层或等效稳定渲染方式；不得继续用 WXSS background 当主视觉后再叠样式把纸页效果吃掉。
- 不得用 CSS 渐变、伪元素、box-shadow、浅色底块去“模拟已用 UI 图”；只要用户看起来仍像浅色块，就按未接入 UI 指定素材处理。
- 邀请码、加入状态、头像槽、复制/刷新、微信绿分享按钮仍需遵守 12.7.45 的中央安全区和卷角禁放区。
- 前端不得再做 UI 界面和交互兜底策略。`008AO` 只接受 `008AJ` 原图 1:1 可见实现，不接受“CSS 近似 / 兜底样式 / 临时交互 / 浅色块占位”。
- 当前目标生图与源稿路径固定为：
  - `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008aj-invite-bookmark-card-750x420.png`
  - `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008aj-invite-bookmark-card-source.svg`
- 当前目标尺寸与安全区固定为：
  - 资产尺寸 `750x420`
  - 中央安全区 `x=150..600 / y=82..300`
  - 卷角禁放区 `x>610 && y>280`
- 下列元素必须可见且不可被替代：暖 ivory 纸页底、顶部书签胶带、右下角轻卷页轮廓、房间码主体、加入状态、头像槽、复制/刷新、微信绿分享按钮。
- 下列实现方式一律不接受：只保留浅色背景块、把卷角做成伪元素阴影、把纸页纹理交给 WXSS background 近似、以任何兜底样式覆盖 `008AJ` 原图主视觉。

##### 12.7.48.4 当前状态

- UI/UX 当前不再生成新的邀请页纸页替换图。
- 邀请页纸页问题当前归因于前端渲染与接入方式，不归因于 `008AJ` 目标图本身。
- `008AN` 记录/账本页时间线设计继续按 12.7.47 推进，不受本节变更影响。

#### 12.7.49 `PR-UX-LINK-CLEANUP-008AP-USER-APPROVED-PAPER-ASSET-LOCK` 用户确认纸页标准图锁定

记录时间：2026-06-19。按 PM 008AP 紧急修正，用户已明确指定最终纸页标准图：`C:\Users\Administrator\AppData\Local\Temp\codex-clipboard-b8d36523-d972-4a9b-b39c-a805ab2e6170.png`，并明确“不允许再擅自改图”。本节只做 UI/UX 资产锁定、路径确认和接入标注；不改业务源码，不改 PM 总台账，不以 008AN 替换或扩散本图。

##### 12.7.49.1 SKILL 选择记录

| SKILL | 选择依据 | 使用边界 |
| --- | --- | --- |
| `design-taste-frontend` | 本轮不是生成新图，而是把用户明确确认的纸页图锁成唯一执行标准，并补前端不得替换、不得兜底、不得近似的接入红线 | 只用于资产锁定、可见性红线和等比显示标注；不重绘、不调色、不压缩、不再生图 |

##### 12.7.49.2 锁定结论

| 项目 | 结论 |
| --- | --- |
| 用户确认原图 | `C:\Users\Administrator\AppData\Local\Temp\codex-clipboard-b8d36523-d972-4a9b-b39c-a805ab2e6170.png` |
| UI 原始设计资产入库路径 | `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008ap-user-approved-invite-paper.png` |
| 手机适配尺寸图路径 | `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008ap-user-approved-invite-paper-mobile-750w.png` |
| 前端固定引用压缩版路径 | `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008ap-user-approved-invite-paper-mobile-750w-compressed.png` |
| 当前状态 | `008AP` 为邀请页纸页唯一执行标准图；其他角色不得改图、换图、调色、重绘、二次生成 |
| 对 008AJ / 008AL 的关系 | `008AJ/008AL` 保留为历史设计探索资产，不再作为当前邀请页验收目标；当前验收与前端接入一律以 `008AP` 为准 |

##### 12.7.49.3 文件一致性与入库信息

| 项目 | 数值 / 说明 |
| --- | --- |
| 原始图像尺寸 | `1717x916` |
| 原始图文件大小 | `2,156,395 bytes` |
| 原始图格式 | PNG |
| 原始图一致性校验 | 用户源图与原始入库图 `SHA256` 一致：`BD9C390BD4EECD8B43B5114D2AAFEFD9B5C737F56C792BB7C7C952A0DDAE308E` |
| 手机适配图尺寸 | `750x400` |
| 手机适配图文件大小 | `388,849 bytes` |
| 手机适配缩放依据 | 以原图宽度为基准等比缩放到 `750px`；高度按原始比例 `916 / 1717` 四舍五入为 `400px`；不裁切、不拉伸 |
| 压缩版图像尺寸 | `750x400` |
| 压缩版文件大小 | `371,374 bytes` |
| 压缩方式 | 先等比缩放到手机适配尺寸，再做 PNG 无损优化：保留 RGBA、透明区、纸纹、胶带、圆角和卷角，不改变手机适配图像素内容 |
| 压缩版一致性校验 | 手机适配图与压缩版做像素差异对比：`MEAN [0,0,0,0]`，`BBOX None`，即像素完全一致 |
| 是否允许尺寸调整/压缩 | 允许；但仅允许等比缩放和视觉无损或近似无损压缩，不得裁切、换图、重绘、去透明、改轮廓 |

##### 12.7.49.4 前端固定接入标注

| 项目 | 要求 |
| --- | --- |
| 原始归档路径 | 保留 `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008ap-user-approved-invite-paper.png` 作为用户确认标准图归档，不供前端直接改写 |
| 手机适配路径 | 保留 `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008ap-user-approved-invite-paper-mobile-750w.png` 作为缩放基线，不供其他角色再次改写 |
| 固定引用路径 | 前端只能引用 `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008ap-user-approved-invite-paper-mobile-750w-compressed.png` 对应的入包副本，不得自行导出新图 |
| 显示方式 | 容器必须按原图纵横比等比显示；当前手机适配基线为 `750x400`，优先 `contain` 逻辑或等效稳定显示，禁止 `cover` 裁切 |
| 主视觉实现 | 必须让 `008AP` 原图真实可见；不接受用 WXSS background、渐变、伪元素、box-shadow 或浅色块近似替代 |
| 其他角色边界 | 前端、测试、PM、接口联调均不得修改该图内容；测试按用户标准图对照压缩版是否一致，不接受“样式接近” |

##### 12.7.49.5 安全区与禁止裁切区

| 区域 | 标注 |
| --- | --- |
| 主内容安全区 | 原图建议 `x=150..1460 / y=120..760`；对应 `750x400` 手机适配图约为 `x=66..638 / y=52..332`，用于邀请码、加入状态、头像槽等核心内容 |
| 顶部胶带保护区 | 原图 `x=680..1040 / y=0..170`；对应 `750x400` 手机适配图约为 `x=297..454 / y=0..74`，不得裁切、遮挡或覆盖 |
| 右下卷角保护区 | 原图 `x>1400 && y>640`；对应 `750x400` 手机适配图约为 `x>611 && y>279`，不得裁切、遮挡、压暗或被按钮覆盖 |
| 圆角外沿 | 四周纸页外沿和阴影必须完整显示，不得因为容器裁切而丢角 |

##### 12.7.49.6 红线

- 严禁重绘、调色、换图、二次生成、压缩到失真、裁掉卷角或胶带。
- 严禁非等比缩放、拉伸变形或为适配容器而切掉透明区。
- 严禁把该图当成可二次设计素材处理；它已经是用户确认后的执行标准图。
- 严禁再使用“CSS 近似 / 兜底样式 / 临时交互 / 浅色块占位”解释邀请页纸页实现偏差。
- 若前端实现偏离该图，即使结构可用，也按 `未按 UI 指定图实现` 退回，不接受“视觉接近”。

##### 12.7.49.7 验证记录

| 验证项 | 命令 / 方法 | 结果 |
| --- | --- | --- |
| 原图查看 | 本地图片查看 | 已确认胶带、纸页纹理、右下卷角完整可见 |
| 文件信息 | `Get-Item <src/dst>` + `System.Drawing.Image` | 已确认入库文件存在，尺寸 `1717x916` |
| 一致性校验 | `Get-FileHash -Algorithm SHA256 <src/dst>` | 源图与入库图 hash 一致 |
| 手机适配检查 | `PIL resize(LANCZOS)` + 本地图片查看 | 已确认 `750x400` 等比缩放后胶带、纸纹、圆角、透明区和卷角保持 |
| 压缩版像素校验 | `PIL ImageChops.difference` | 原始入库图与压缩版 `MEAN [0,0,0,0]`、`BBOX None`，像素完全一致 |

##### 12.7.49.8 当前状态

- `008AP` 已完成 UI 侧确认、原始图归档和压缩版锁定，可直接作为前端和测试的执行标准。
- `008AN` 记录/账本页时间线设计继续按 12.7.47 推进，不使用本节素材替代，也不被本节打断。

#### 12.7.50 `PR-UX-LINK-CLEANUP-008AQ-INVITE-PAPER-NO-CHECKERBOARD-ASSET` 邀请页纸页去棋盘格固定资产

记录时间：2026-06-19。按 PM 008AQ 退回，前端 008AO 虽已引用 008AP 固定图，但运行态截图 [pr-pm-008ao-invite-paper-current.png](F:/codexlist/jiuzhuopanguan/docs/runtime/pr-pm-008ao-invite-paper-current.png) 明显看到图外侧棋盘格。经 UI 侧复核，棋盘格不是小程序容器自带，而是当前 008AP 手机适配图中保留了棋盘格背景像素。本节只输出“去棋盘格但不换纸”的固定资产，不改业务源码，不回退到 008AJ / 008AL，不重绘成另一张纸。

##### 12.7.50.1 SKILL 选择记录

| SKILL | 选择依据 | 使用边界 |
| --- | --- | --- |
| `imagegen` | 本轮属于光栅资产修复：要保留用户确认纸页主体，只移除无效棋盘格背景并输出小程序可用 PNG | 不改纸页主体构图，不重绘、不换图、不二次生成另一张纸 |

##### 12.7.50.2 资产关系

| 资产 | 路径 | 作用 |
| --- | --- | --- |
| 用户确认原始归档图 | `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008ap-user-approved-invite-paper.png` | 原始标准图归档，不直接用于运行态 |
| 手机适配压缩图（旧） | `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008ap-user-approved-invite-paper-mobile-750w-compressed.png` | 保留历史记录；因仍含棋盘格像素，停止作为前端固定引用 |
| 手机适配去棋盘格固定资产（新） | `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008aq-invite-paper-mobile-750w-no-checkerboard.png` | 前端与测试后续唯一固定引用路径 |

##### 12.7.50.3 处理方式

- 以用户确认图 `008AP` 的手机适配尺寸版本为基线，保持 `750x400` 等比比例不变。
- 仅移除与纸页主体无关、且连通于图像外边界的棋盘格背景像素，将其 alpha 置为 `0`。
- 不改顶部胶带、纸纹、圆角、右下卷页、纸页阴影和主体位置。
- 不做重绘、换图、裁切、二次生成、调色变样、去掉透明通道或改变纸张轮廓。
- 按用户新增口径，后续生图优先使用透明 PNG 模式；本次固定资产也保留透明通道，避免再次出现棋盘格底。

##### 12.7.50.4 固定资产规格

| 项目 | 数值 / 说明 |
| --- | --- |
| 固定引用路径 | `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008aq-invite-paper-mobile-750w-no-checkerboard.png` |
| 尺寸 | `750x400` |
| 文件大小 | `371,857 bytes` |
| 格式 | PNG |
| 透明通道 | 有；四角与纸页外边界区域 alpha 为 `0` |
| 与用户标准图关系 | 保留 008AP 用户确认纸页主体不变，只去除外部棋盘格像素并保持手机适配比例 |

##### 12.7.50.5 为什么不会再显示棋盘格

| 项目 | 说明 |
| --- | --- |
| 根因 | 旧 `008AP mobile compressed` 文件本身带有棋盘格背景像素，所以运行态直接可见 |
| 本轮修复 | 新 `008AQ` 资产把外边界棋盘格像素转为透明 alpha，不再把棋盘格作为真实像素输出 |
| 运行态预期 | 只要前端按 PNG 正常显示，卡片外侧将显示页面本身底色，而不是棋盘格图案 |

##### 12.7.50.6 前端接入标注

| 项目 | 要求 |
| --- | --- |
| 固定引用路径 | 前端只能引用 `pr-cs008aq-invite-paper-mobile-750w-no-checkerboard.png` 对应的入包副本 |
| image mode 建议 | `widthFix` 或等效等比模式；若用背景图方案则不通过 |
| 容器比例建议 | 维持 `750:400`，即约 `1.875:1`；容器只允许等比显示，不允许 `cover` 裁切 |
| 禁止方式 | 禁止 WXSS background 当主视觉；禁止 `cover` 裁切；禁止再叠浅色底块掩盖问题 |

##### 12.7.50.7 安全区与目检对照

| 区域 | 标注 |
| --- | --- |
| 主内容安全区 | `x=66..638 / y=52..332` |
| 顶部胶带保护区 | `x=297..454 / y=0..74`，不得裁切或遮挡 |
| 右下卷角保护区 | `x>611 && y>279`，不得裁切、压暗或被按钮覆盖 |
| 目检要求 | 顶部胶带、纸纹、圆角、右下卷页都必须完整；卡片外侧不得再出现棋盘格像素 |

##### 12.7.50.8 验证记录

| 验证项 | 方法 | 结果 |
| --- | --- | --- |
| 运行态问题确认 | 对照 [pr-pm-008ao-invite-paper-current.png](F:/codexlist/jiuzhuopanguan/docs/runtime/pr-pm-008ao-invite-paper-current.png) | 已确认棋盘格直接可见，属于资产像素问题 |
| 新资产透明通道检查 | 角点像素读取 | `(0,0)` 等边角像素 alpha 已为 `0` |
| 新资产文件检查 | `Get-Item` + 目检 | `750x400`，`371,857 bytes`，主体位置正确 |

##### 12.7.50.9 当前状态

- `008AQ` 固定资产已回包，可作为前端和测试的下一轮唯一引用目标。
- 前端 008AO 与测试复测均应停止使用带棋盘格的 `008AP mobile compressed` 旧版本。
- `008AN` 记录/账本设计继续按 12.7.47 推进，不受本节影响。

#### 12.7.51 `PR-UX-LINK-CLEANUP-008AR-RECORD-LEDGER-FULL-ASSET-PACK` 记录/账本完整资产包

记录时间：2026-06-19。按 PM 008AR 紧急派工，用户明确打回当前记录/账本页视觉，要求“仍跟上次做图一致，必须使用 UI 给出的所有页面元素，包括背景、炫光、按钮、状态等；禁止前端自行脑补样式”。本节基于用户新验收图 `C:\Users\Administrator\AppData\Local\Temp\codex-clipboard-f12866c8-21f4-427c-aafb-6fa051890f60.png` 输出完整可交付资产包；不改业务源码，不改 PM 总台账。

##### 12.7.51.1 SKILL 选择记录

| SKILL | 选择依据 | 使用边界 |
| --- | --- | --- |
| `imagegen-frontend-mobile` | 用户验收图是完整移动端页面，需要继续沿同一设计语言输出可复刻的移动端记录/账本页面世界观和层级；该技能用于锁定整屏氛围、Hero 场景、时间线节奏、贴纸和主按钮的移动端构图基线 | 只用于建立整屏目标图和页面元素优先级，不直接生成业务代码 |
| `imagegen` | Hero 场景背景属于位图素材，适合用图像生成补齐高质量烧烤/海边/酒局氛围底图，再落为项目内资产 | 只用于 Hero 位图背景；其余霓虹牌、时间线、拍立得、按钮、状态包都已在项目内固化为前端可引用资产 |

##### 12.7.51.2 设计图与资产包路径

| 项目 | 路径 |
| --- | --- |
| 用户验收图参考 | `C:\Users\Administrator\AppData\Local\Temp\codex-clipboard-f12866c8-21f4-427c-aafb-6fa051890f60.png` |
| 原 008AN 目标图 | `docs/design-assets/party-recorder/clean-slate-001/figma-13-record-ledger-timeline-008an.svg` |
| 008AR 资产总览 | `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008ar-asset-overview.png` |
| 008AR 资产包说明 | `docs/design-assets/party-recorder/clean-slate-001/RECORD_LEDGER_ASSET_PACK_008AR.md` |

##### 12.7.51.3 已覆盖元素

| 验收项 | 已覆盖资产 |
| --- | --- |
| 整页深色烧烤 / 聚会背景 | `pr-cs008ar-record-page-bg-750x1600.png` |
| 顶部 Hero 场景背景 | `pr-cs008ar-hero-bg-750x420.jpg` |
| 标题字效方案 | `pr-cs008ar-title-sample-haibianshaokaoju.png`、`pr-cs008ar-title-underline-scribble.png`、`pr-cs008ar-title-star-sticker.png` |
| 状态 / 设置 / 更多 / 人数 / 开始时间 | `pr-cs008ar-status-pill.png`、`pr-cs008ar-circle-tool-btn.png`、`pr-cs008ar-icon-gear.png`、`pr-cs008ar-icon-more.png`、`pr-cs008ar-icon-people.png`、`pr-cs008ar-icon-clock.png` |
| 纹理 tab bar / 选中下划光效 | `pr-cs008ar-tabbar-bg-750x110.png`、`pr-cs008ar-tab-active-underline.png` |
| 左侧发光时间线 / 节点串珠 / 相机 / 欠酒 / 加酒 / 评论节点 | `pr-cs008ar-timeline-rail.png`、`pr-cs008ar-node-camera.png`、`pr-cs008ar-node-debt.png`、`pr-cs008ar-node-drink.png`、`pr-cs008ar-node-comment.png` |
| 拍立得 / 胶带 / 笑脸贴纸 / 星标贴纸 | `pr-cs008ar-polaroid-frame.png`、`pr-cs008ar-tape-purple.png`、`pr-cs008ar-sticker-smile-coin.png`、`pr-cs008ar-sticker-star-outline.png` |
| 欠酒 +1 / 加酒 +2 霓虹牌 | `pr-cs008ar-neon-debt-plus1.png`、`pr-cs008ar-neon-drink-plus2.png`，以及两张 `base` 底图 |
| 句子 / 评论节点装饰 | `pr-cs008ar-shell-comment-deco.png`、`pr-cs008ar-handdrawn-marker.png` |
| 底部大号纸质按钮 / 按下态 / 图标 | `pr-cs008ar-cta-paper-button.png`、`pr-cs008ar-cta-paper-button-pressed.png`、`pr-cs008ar-icon-camera-cta.png` |
| 空态 / 加载态 / 图片失败态 / 账本无数据态 | `pr-cs008ar-state-empty.png`、`pr-cs008ar-state-loading-spinner.png`、`pr-cs008ar-state-photo-failed.png`、`pr-cs008ar-state-ledger-empty.png` |

##### 12.7.51.4 前端 1:1 复刻红线

- 前端禁止自行脑补样式；缺哪个元素，直接使用本节资产包或判定阻塞，不允许“先用 CSS 顶上”。
- 不接受只看整屏图实现；必须按 `RECORD_LEDGER_ASSET_PACK_008AR.md` 中的固定路径逐项引用。
- 不接受普通 badge 替代 `欠酒/加酒` 霓虹牌。
- 不接受纯 CSS `border-left`、圆点或 glow 代替 `timeline-rail` 与节点资产。
- 不接受纯色块或普通卡片代替拍立得相框、纸质 CTA、贝壳装饰和贴纸。
- 标题若不是当前 fixture“海边烧烤局”，前端也不得自行仿写书法字；必须回 UI/UX 追加标题图，或走 UI/UX 明确批准的替代方案。

##### 12.7.51.5 预置退回码

| 退回码 | 级别 | 触发条件 | 责任角色 | 修复方向 |
| --- | --- | --- | --- | --- |
| `PR-UX-LC008AR-P0-ASSET-MISSING` | P0 | 页面任一主视觉元素仍缺资产接入：背景、Hero、Tab、时间线、拍立得、霓虹牌、CTA、状态包不完整 | 前端 | 按资产包逐项接入，不得自行画近似物 |
| `PR-UX-LC008AR-P0-ASSET-BYPASSED` | P0 | 已有资产未接入，改用 CSS / 旧壳 / 普通列表 / 普通 badge / 默认按钮代替 | 前端 | 停止兜底实现，按固定资产路径重做 |
| `PR-UX-LC008AR-P0-TITLE-TREATMENT-BROKEN` | P0 | 标题仍回到普通字重、无字效，或前端自行仿写标题样式 | 前端 | 当前 fixture 使用标题样本图；其他标题走 UI/UX 审批路径 |
| `PR-UX-LC008AR-P1-STATE-SYSTEM-WEAK` | P1 | 空态、加载态、图片失败态、账本无数据态风格漂移或仍为默认系统态 | 前端 | 统一接入状态包，保持与主视觉一致 |
| `PR-UX-LC008AR-P1-LAYERING-DRIFT` | P1 | 资产已接入，但层级、比例、九宫格禁区或透明叠放错误，导致观感偏离目标图 | 前端 | 依说明文档修正层级、容器比例和禁区 |

##### 12.7.51.6 当前状态

- `008AR` 完整资产包已回包，当前不接受前端继续说“缺素材只能先用样式补”。
- 仍有一个明确缺口：标题若要支持非样本 `sessionName` 的 1:1 动态书法字效，需 UI/UX 继续按具体字符串补标题图，当前不允许前端自行仿写。
- 除此之外，背景、Hero、Tab、时间线、节点、拍立得、贴纸、霓虹牌、评论装饰、CTA 和状态包均已覆盖，可直接放行前端 `008AR` 重做。

#### 12.7.52 `PR-UX-LINK-CLEANUP-008AT-RECORD-LEDGER-DYNAMIC-TITLE-ASSET` 记录/账本动态标题资产

记录时间：2026-06-19。按 PM 008AT 追加派工，接口联调 3.53 的真实可测样本为 `sessionName=周末聚会记录`。用户要求记录/账本页面名称必须是玩家给出的酒局名，同时又要求按 UI 生图 1:1 复刻，禁止前端用普通文字、CSS 阴影、系统字体或临时图片兜底。因此本节只补当前真实样本的标题透明 PNG 资产，不改业务源码，不改 `008AR` 其他命名与路径。

##### 12.7.52.1 SKILL 选择记录

| SKILL | 选择依据 | 使用边界 |
| --- | --- | --- |
| `imagegen` | 本轮交付物是项目内可直接引用的光栅标题资产，且用户已经要求后续生图优先透明 PNG；标题图适合走位图资产路线，而不是让前端拼 CSS 字效 | 本轮不再让模型自行生成不稳定中文文字；采用项目内透明 PNG 资产落地，保证准确文本与透明通道 |

##### 12.7.52.2 新增资产

| 资产路径 | 尺寸 | 包体 | 格式 | 透明通道 | 用途 |
| --- | --- | ---: | --- | --- | --- |
| `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008at-title-sample-zhoumojuhuijilu.png` | `508x150` | `56,179 bytes` | PNG | 是 | 当前真实样本 `sessionName=周末聚会记录` 的同风格书法标题固定图 |

##### 12.7.52.3 与 008AR 标题组合方式

| 元素 | 路径 | 组合方式 |
| --- | --- | --- |
| 主标题图 | `pr-cs008at-title-sample-zhoumojuhuijilu.png` | 作为页头主标题主体，不得再用普通文字替代 |
| 下划线 | `pr-cs008ar-title-underline-scribble.png` | 叠加在标题图下方中段，保持与 008AR 样图一致的手绘强调 |
| 星标贴纸 | `pr-cs008ar-title-star-sticker.png` | 放标题右上偏外侧，不得压住字形主体 |

##### 12.7.52.4 前端接入要求

- 当前真实样本 `sessionName=周末聚会记录` 必须直接引用 `pr-cs008at-title-sample-zhoumojuhuijilu.png`。
- 标题图容器按资产原始比例 `508:150` 等比显示；建议宽度区间 `250-300px`，禁止竖向压缩。
- 不得把真实 `sessionName` 改回设计样例 `海边烧烤局`。
- 不得用普通文字标题、CSS 阴影标题、系统字体标题、临时图片标题或“先兜底后补”。
- 若后续出现新的 `sessionName`，前端不得自行仿写；必须再次由 UI/UX 追加对应标题 PNG，或由 UI/UX 单独批准字体渲染规范后再执行。

##### 12.7.52.5 测试验收点

| 检查项 | 验收标准 |
| --- | --- |
| 文案正确 | 页头主标题必须是“周末聚会记录”，不得出现“海边烧烤局”或“记录/账本”大标题 |
| 视觉一致 | 标题字效、下划线、星标贴纸与 008AR 目标图同一体系 |
| 透明通道 | 标题图外侧无黑底、白底或实色底块，能自然叠在 Hero 场景上 |
| 禁止兜底 | 不得回退为系统文字、CSS 阴影文字或临时仿写字效 |

##### 12.7.52.6 当前状态

- `008AT` 已补齐当前真实样本 `周末聚会记录` 的透明 PNG 标题资产。
- 当前不阻塞前端按真实样本重做；但若后续样本名再变，仍需 UI/UX 按具体字符串继续补标题图，前端不能自行发挥。

#### 12.7.53 `PR-UX-LINK-CLEANUP-008AU-RECORD-TIMELINE-COMPACT-DENSITY-SPEC` 记录/账本紧凑密度二次接收规格

记录时间：2026-06-19。按 PM 008AU 追加派工，测试 13.16.114.9 已确认 data 链路可用、`008AT` 标题路径正确、未出现 `海边烧烤局`，且 Console 无阻塞红错；但视觉仍不通过：标题偏暗、状态 pill 左侧被裁、Hero / 炫光层级不足、发光时间线和节点还原不足、加酒霓虹牌只显示空绿框无 `加酒 +1`、账本 tab 显示三位成员 `0/0/0` 与 ledger event data 不一致。用户新增明确反馈：记录节点太大，往下滑太累，要求去掉外部框、元素缩小、整体更紧凑。

##### 12.7.53.1 SKILL 选择记录

| SKILL | 选择依据 | 使用边界 |
| --- | --- | --- |
| `design-taste-frontend` | 本轮核心是密度、层级和可扫读性收口，不是再换一套视觉；需要把“删外框、缩节点、提信息密度、禁厚列表”写成前端可执行门禁 | 只做接收规格与布局红线，不重写整套视觉方向 |
| `imagegen` | 本轮仅新增缺失的 `加酒 +1` 霓虹牌位图，避免前端继续用空绿框兜底 | 不扩生成新的大背景或整屏图，优先复用 008AR/008AT 既有资产 |

##### 12.7.53.2 资产结论

- 可复用 `008AR / 008AT` 绝大多数资产，仅按本节规格缩放和重排。
- 本轮新增且必须接入的唯一补图：
  - [pr-cs008au-neon-drink-plus1.png](F:/codexlist/jiuzhuopanguan/docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008au-neon-drink-plus1.png) `250x116`，透明 PNG，用于 `加酒 +1`
- 不需要新增大背景、Hero、时间线、拍立得、CTA 或状态包；这些继续复用 `008AR`

##### 12.7.53.3 必删外部框

| 必删层 | 说明 |
| --- | --- |
| 照片节点外层大卡 | 删除整块深色包裹层，只保留拍立得相框本体 |
| 账本事件外框卡 | 删除霓虹牌外侧的无意义深色卡片或包裹框，只保留时间线 + 文案 + 霓虹牌 |
| 评论节点外围大框 | 删除评论整块外框，只保留节点 icon、评论文案、贝壳/手绘装饰 |
| 统一 section wrapper | 删除把节点拉成长列表的厚 padding 包裹层和空白占位层 |

##### 12.7.53.4 390 宽预览框尺寸建议

| 元素 | 接收范围 |
| --- | --- |
| Hero 区高度 | `220-250px` |
| 标题图宽度 | `250-300px` |
| 状态 pill | 高 `36-42px`，左边距 `>=16px` |
| Tab bar 高度 | `72-84px` |
| 时间线轨道列宽 | `44-56px` |
| 节点 icon | `52-60px` |
| 照片节点整体宽度 | `190-228px` |
| 霓虹牌宽度 | `136-180px` |
| 胶带/贴纸 | 照片节点宽度的 `14%-22%` |
| CTA 宽度 | `320-350px` |
| CTA 高度 | `72-84px` |

##### 12.7.53.5 纵向密度目标

- 首屏必须看到：Hero、Tab、1 个照片节点、1 个账本节点起始。
- 一次正常滚动后，必须连续看到 `照片 + 欠酒 + 加酒` 三类有效内容，不接受四个节点就拖成一整屏半。
- 节点主间距控制在 `16-24px`，时间文案与节点 icon 间距控制在 `8-12px`。
- 当前目标是紧凑可扫读，不再用大卡和大留白制造层级。

##### 12.7.53.6 标题 / Hero 修正标准

| 项目 | 接收标准 | 退回条件 |
| --- | --- | --- |
| 标题亮度 | 标题图在深色 Hero 上第一眼可读，明显高于当前退回态 | 标题偏灰、偏暗、边缘发糊 |
| 状态 pill | 左侧完整显示，最小可见边距 `>=16px` | pill 被裁切、贴边、被安全区吃掉 |
| Hero 层级 | 顶部背景亮点 > 状态/标题 > meta > tab | Hero 被压扁成平暗底，光效与标题失去主次 |

##### 12.7.53.7 加酒霓虹牌规则

| 规则 | 说明 |
| --- | --- |
| 禁止空绿框 | 不允许只显示绿色边框，无 `加酒 +1/+2` 文案 |
| `+1` 资产 | 使用 `pr-cs008au-neon-drink-plus1.png` |
| `+2` 资产 | 继续使用 `pr-cs008ar-neon-drink-plus2.png` |
| 真实 delta | 若后续为其他短值，只能在 `pr-cs008ar-neon-plate-drink-base.png` 安全区内按 UI/UX 批准方案替换短文本，不得直接空框上屏 |

##### 12.7.53.8 账本 tab 数据验收

- 不得显示全员 `0/0/0` 壳层。
- 账本 tab 数值必须与 `ledger event data` 及独立账本页一致。
- 若当前链路拿不到真实值，只能退回前端 + 接口联调 + 后端/API，不得以 0 值占位写视觉通过。

##### 12.7.53.9 前端接入禁区

- 禁止用 CSS 近似时间线、霓虹牌、拍立得、背景、CTA。
- 禁止自行裁切 Hero、标题图、拍立得框、霓虹牌、贴纸。
- 禁止加回照片节点外层大卡、账本事件外框、评论大包裹层。
- 禁止恢复旧厚列表、旧分段结构或 `0/0/0` 壳层账本。
- 禁止把 `008AR/008AT/008AU` 资产接入不全时，用系统默认态或普通文字顶替。

##### 12.7.53.10 测试验收清单

| 项目 | 证据 | 标准 |
| --- | --- | --- |
| 记录页首屏 | 390 宽右侧预览截图 | Hero、标题、pill、Tab、首个照片节点、首个账本节点同时可见 |
| 紧凑滚动 | 再下滑一屏截图 | 必须看到 `照片 + 欠酒 + 加酒` 三类有效内容 |
| 加酒牌 | 记录页截图 + event data | 出现 `加酒 +1` 或真实 delta，不得空绿框 |
| 账本 tab | 账本 tab 截图 + ledger event / 独立账本 data 摘要 | 不得是 `0/0/0` 壳层，数值一致 |
| Console | Console 摘要 | 无阻塞红错；视觉问题不能靠无错 Console 判通过 |

##### 12.7.53.11 预置退回码

| 退回码 | 级别 | 触发条件 | 责任角色 |
| --- | --- | --- | --- |
| `PR-UX-LC008AU-P0-OUTER-FRAME-NOT-REMOVED` | P0 | 照片节点、账本事件、评论节点仍保留外层大框/厚包裹层 | 前端 |
| `PR-UX-LC008AU-P0-GREEN-NEON-EMPTY` | P0 | 加酒牌仍是空绿框，无 `加酒 +1/+2` 或真实 delta | 前端 |
| `PR-UX-LC008AU-P0-LEDGER-TAB-ZERO-SHELL` | P0 | 账本 tab 仍显示全员 `0/0/0`，与 data 不一致 | 前端 + 接口联调 + 后端/API |
| `PR-UX-LC008AU-P1-DENSITY-STILL-TOO-LOOSE` | P1 | 节点仍过大、滚动过长、首屏信息密度不足 | 前端 |
| `PR-UX-LC008AU-P1-HERO-TITLE-HIERARCHY-WEAK` | P1 | 标题偏暗、pill 被裁、Hero 炫光层级不足 | 前端 |

##### 12.7.53.12 当前状态

- `008AU` 已给出紧凑版二次接收规格，可直接放行前端 `008AV` 重做。
- 本轮新增资产仅 `加酒 +1`，其余明确复用 `008AR/008AT`，不允许前端再以“缺资产”为由自行脑补布局或样式。

#### 12.7.54 `PR-UX-LINK-CLEANUP-008AX-RECORD-FIRST-SCREEN-CONSECUTIVE-PHOTOS-SPEC` 记录页首屏连续照片规格

记录时间：2026-06-19。按 PM 008AX 派工，测试 13.16.114.13 已确认 008AW 局部修复有效：一次滚动后可连续看到 `照片 + 欠酒 + 加酒`，外层暗色大卡和厚 wrapper 明显压薄，底部 CTA 不再遮挡加酒节点，`加酒 +1` 固定图清楚可见，账本 tab 和 Console 也无新阻塞。本轮仍失败的唯一核心是：真实 008g 样本 timeline 前两条均为照片，导致 390 首屏只看到 Hero、Tab、1 个照片节点和第二个照片节点起始，仍未露出账本节点起始。因此本节只定义“连续照片节点如何压缩成首屏仍露出账本起始”的明确前端规格，不改业务源码，不写通过。

##### 12.7.54.1 首屏硬性目标

- 保持不变：390 宽首屏必须同时看到 `Hero、Tab、1 个主照片节点、1 个账本节点起始`。
- 该目标不因真实数据前两条均为照片而放宽；前端不得以“时间线顺序如此”为由让账本节点完全掉到首屏以下。
- 不允许通过改动 timeline 数据顺序、伪造事件顺序或改接口结构达成该目标。

##### 12.7.54.2 连续照片节点展示规则

当时间线连续出现 2 条或以上 `photo` 节点，前端必须使用“首图 + 连续照片缩略组”规则，而不是把前两张都按完整大拍立得堆叠：

1. 第 1 条照片节点：保留主照片节点，但改为 `短拍立得` 形态。
2. 第 2 条及之后连续照片：合并为 `连续照片缩略组`，挂在第 1 条照片节点下方或右下，不再各自占用完整大节点高度。
3. 缩略组只承担“还有更多照片”的提示，不改变真实 timeline 顺序；下一条非照片事件仍按原顺序紧跟在缩略组之后。
4. 缩略组最多展示 1 张半露缩略片或 `1 张缩略 + 计数提示`，不得展开成第二张完整大拍立得。
5. 若连续照片只有 2 张：第 2 张用单张缩略片。
6. 若连续照片 >= 3 张：第 2 张用单张缩略片，右下可叠一个 `+N` 角标或极短计数，不新增大卡。

##### 12.7.54.3 390 宽首屏尺寸范围

| 区域 | 接收范围 |
| --- | --- |
| Hero 总高度 | `208-228px` |
| 标题区（含状态、标题、meta） | `96-112px` |
| Tab bar | `68-76px` |
| 主照片节点总高度 | `168-196px` |
| 主拍立得可视宽度 | `176-208px` |
| 连续照片缩略组高度 | `44-64px` |
| 连续照片缩略片宽度 | `72-96px` |
| 时间线轨道列宽 | `44-52px` |
| 账本节点起始露出量 | 首屏底部至少露出 `节点 icon + 时间 + 霓虹牌边缘/文案起始`，建议可见高度 `48-72px` |
| CTA 安全区 | CTA 顶边与账本节点起始底边至少留 `12-16px`，且不得再遮挡有效内容 |

##### 12.7.54.4 连续照片缩略组布局要求

| 元素 | 规则 |
| --- | --- |
| 主照片节点 | 继续复用 `pr-cs008ar-polaroid-frame.png`，但整体缩到本节范围，不得恢复大拍立得高度 |
| 第二张照片缩略片 | 复用同一拍立得资产的缩略版或裁定后的固定缩放，不新增新壳，不再加外层大卡 |
| 胶带/贴纸 | 主照片节点保留 1 处主装饰；缩略组装饰减半，避免挤占高度 |
| 文案 | 第 1 条照片保留时间与一句短文案；缩略组不重复长文案，只可保留极短计数/提示 |
| 时间线顺序 | 缩略组仍从属于第 1 条照片节点，后续账本节点按原顺序紧跟，不得穿插伪排序 |

##### 12.7.54.5 资产结论

- 当前可复用 `008AR / 008AT / 008AU` 资产，仅按本规格缩放和重排。
- 本轮 `不要求新增切图`；前端应使用现有：
  - `pr-cs008ar-polaroid-frame.png`
  - `pr-cs008ar-tape-purple.png`
  - `pr-cs008ar-sticker-smile-coin.png`
  - `pr-cs008ar-sticker-star-outline.png`
  - `pr-cs008ar-timeline-rail.png`
  - `pr-cs008ar-node-camera.png`
  - `pr-cs008ar-node-debt.png`
  - `pr-cs008ar-node-drink.png`
  - `pr-cs008ar-neon-debt-plus1.png`
  - `pr-cs008au-neon-drink-plus1.png`
- 若前端证明现有拍立得框缩略后在 390 宽下仍无法同时满足“主照片可读 + 账本起始露出”，再单独开 UI/UX 资产任务；当前不得自行生出新缩略样式。

##### 12.7.54.6 禁止项

- 禁止改变原始 timeline 数据顺序、合并接口事件、篡改 event type 或把账本节点提前。
- 禁止回退 008AW 已通过项：不得重新出现外层暗色大卡、厚 padding wrapper、CTA 遮挡、空绿框。
- 禁止把连续照片重新做成两张完整大拍立得纵向堆叠。
- 禁止前端自行发明新的照片组样式、横滑容器、卡片分页器或 CSS 装饰壳。
- 禁止恢复旧厚列表、旧分段结构、旧暗色大框。

##### 12.7.54.7 前端 008AY 可执行规格

1. 先按 12.7.53 的紧凑密度规格收口 Hero、Tab、时间线、CTA。
2. 检测时间线前导连续 `photo` 节点数。
3. 若前 2 条及以上均为 `photo`：
   - 第 1 条渲染为短拍立得主节点；
   - 第 2 条起并入连续照片缩略组；
   - 保证首屏底部露出下一条非 `photo` 节点起始。
4. 若第 1 条后立即是账本节点，继续沿 12.7.53 正常渲染，不启用缩略组。

##### 12.7.54.8 测试 008AY 验收口径

| 项目 | 证据 | 标准 |
| --- | --- | --- |
| 首屏截图 | 390 宽右侧预览截图 | 必须同时看到 Hero、Tab、主照片节点、账本节点起始 |
| 连续照片处理 | 同一截图或轻微下滑截图 + timeline data 摘要 | 前两条为照片时，第 2 条不再占完整大节点高度，而是缩略组 |
| 顺序不变 | timeline data 摘要 | 真实事件顺序未被改写；账本节点仍是照片之后的下一条非照片事件 |
| 已通过项不回退 | 记录页截图 + Console | 无暗色大卡回潮、无 CTA 遮挡、无空绿框、无阻塞红错 |

##### 12.7.54.9 预置退回码

| 退回码 | 级别 | 触发条件 | 责任角色 |
| --- | --- | --- | --- |
| `PR-UX-LC008AX-P0-FIRST-SCREEN-NO-LEDGER-START` | P0 | 390 首屏仍未露出账本节点起始 | 前端 |
| `PR-UX-LC008AX-P0-CONSECUTIVE-PHOTOS-NOT-COMPACTED` | P0 | 前两条照片仍以两张完整大拍立得纵向堆叠 | 前端 |
| `PR-UX-LC008AX-P1-PHOTO-GROUP-STILL-TOO-TALL` | P1 | 虽已做照片组，但高度仍过大，账本节点露出不足 | 前端 |
| `PR-UX-LC008AX-P1-PASSED-FIX-REGRESSED` | P1 | 008AW 已通过项回退：外框变厚、CTA 遮挡、空绿框回潮 | 前端 |

##### 12.7.54.10 当前状态

- `008AX` 已给出连续照片首屏紧凑规格，前端 `008AY` 可直接执行。
- 当前不新增资产；先以 `008AR / 008AT / 008AU` 复用和重排为准。
- 若 `008AY` 仍证明现有拍立得框缩略后无法满足首屏目标，再由 PM 另开新 UI/UX 资产任务。

#### 12.7.55 `PR-UX-LINK-CLEANUP-008AZ-RECORD-HERO-TEXT-TITLE-STATUS-REVIEW` 记录页 Hero 文本标题 / 状态口径修正

记录时间：2026-06-19。按 PM 008AZ 新口径，用户最新截图已明确：`进行中` 状态不要用图片，`周末聚会记录` 也不要用图片，要用玩家真实生成的聚会名文本。此口径覆盖此前 `008AT` 标题图主展示方案。后续 `live-record` Hero 主标题与状态均按“真实文本稳定实现”验收，不再按标题 PNG / 状态图片做主展示接收。

##### 12.7.55.1 口径修正

| 项目 | 新口径 |
| --- | --- |
| `008AT` 标题图 | 保留为历史资产证据与风格参考，不再作为 `live-record` 主标题验收标准 |
| Hero 主标题 | 必须直接显示真实 `sessionName` 文本，不得改回样例文案，不得再要求每个 sessionName 单独补标题图 |
| Hero 状态 | `进行中` 改为非图片文本 pill 验收；关注文本层级、安全区、不重叠，不再按状态图片验收 |

##### 12.7.55.2 前端 008AZ 接收边界

- 前端 `008AZ` 回包后，UI/UX 只基于测试 390 右侧预览截图和必要 `page data` 做 Hero 标题 / 状态接收或退回。
- 不再要求前端为每个 `sessionName` 补 PNG 标题图。
- 但必须同时复核 `008AY` 已定义的连续照片缩略组、账本节点首屏目标、`加酒 +1`、账本计数，不得因为改文本标题 / pill 而视觉回退。

##### 12.7.55.3 文本标题可执行规格

| 项目 | 规格 |
| --- | --- |
| 标题文本内容 | 使用真实 `sessionName`，禁止改为 `海边烧烤局`、`周末聚会记录` 以外的样例值，禁止写回“记录/账本” |
| 字体建议 | 首选 `KaiTi` / `simkai` 风格；若运行态无法稳定加载该字体，则退到 `Microsoft YaHei Bold`，但需保留暖色描边与阴影层级 |
| 字号范围 | 390 宽下 `40-48px` |
| 行高 | `1.02 - 1.12`，禁止过高导致 Hero 被拉长 |
| 字重 | `600-700` |
| 颜色 | 主色 `#F1DCB1` |
| 阴影 1 | `0 3px 0 rgba(40,18,8,0.35)` |
| 阴影 2 | `0 8px 18px rgba(20,8,4,0.22)` |
| 下划强调 | 继续复用 `pr-cs008ar-title-underline-scribble.png`，放在标题下方，不得改为 CSS 随手线 |
| 星标装饰 | 继续复用 `pr-cs008ar-title-star-sticker.png`，放标题右上偏外侧，不得压字 |
| 最大宽度 | 文本容器最大宽度建议 `250-300px`；长标题优先换行到两行，不得缩到不可读 |

##### 12.7.55.4 文本状态 pill 可执行规格

| 项目 | 规格 |
| --- | --- |
| 呈现方式 | 纯文本 pill，不用状态图片 |
| 文案 | `进行中` |
| 字号 | `15-17px` |
| 字重 | `600` |
| 内边距 | 左右 `12-14px`，上下 `6-8px` |
| 最小高度 | `30-34px` |
| 圆角 | `15-18px` |
| 背景 | `rgba(47,36,28,0.82)` |
| 描边 | `1px solid rgba(140,116,86,0.72)` |
| 状态圆点 | 左侧 `8-10px` 直径，颜色 `#B5D66F`，与文本间距 `8px` |
| 安全区 | 左侧距屏幕内容边 `>=16px`，上方距安全区内容边 `>=8px` |
| 禁止项 | 文字和圆点重叠、pill 被裁、pill 压标题、pill 用图片代替 |

##### 12.7.55.5 与 008AY 联合复核项

前端 `008AZ` 回包后，以下 4 项必须与 Hero 文本标题 / 状态一起复核，不得局部通过后放行整体视觉：

1. 连续照片缩略组仍按 `12.7.54` 执行，不能回到两张完整大拍立得。
2. 390 首屏仍要露出账本节点起始。
3. `加酒 +1` 固定图仍清楚可见，不能回退为空绿框。
4. 账本 tab 计数与 ledger 数据仍一致，不得回到 `0/0/0` 壳层。

##### 12.7.55.6 预置退回码

| 退回码 | 级别 | 触发条件 | 责任角色 |
| --- | --- | --- | --- |
| `PR-UX-LC008AZ-P0-HERO-TITLE-IMAGE-STILL-USED` | P0 | Hero 主标题仍用 PNG 标题图作主展示，而不是实时 `sessionName` 文本 | 前端 |
| `PR-UX-LC008AZ-P0-STATUS-PILL-OVERLAP` | P0 | `进行中` pill 文本/圆点重叠、被裁切、压标题，或仍以图片方式呈现 | 前端 |
| `PR-UX-LC008AZ-P1-HERO-TEXT-HIERARCHY-WEAK` | P1 | 标题文本亮度、字号、阴影、装饰关系弱，整体可读性低于 008AR 目标图方向 | 前端 |
| `PR-UX-LC008AZ-P1-008AY-REGRESSION` | P1 | 连续照片缩略组、账本节点首屏、加酒 +1、账本计数任一项视觉回退 | 前端 |

##### 12.7.55.7 当前状态

- `008AT` 标题图改为历史资产证据，不再作为 `live-record` 主标题主展示标准。
- `008AZ` 后续只做文本标题 / 文本状态 pill 接收，不再要求逐个 `sessionName` 生图。
- 当前不新增资产；继续复用 `008AR/008AU` 的下划线、星标与其他视觉资产。

#### 12.7.56 `PR-UX-SHARE-POSTER-TIMELINE-ACTIONS-008BA-REVIEW` 分享页时间节点与动作层级接收口径

记录时间：2026-06-19。按 PM 008BA 新派工，本节只补 `share-poster` 的 UI/UX 接收口径，不改业务源码，不写通过。用户最新截图明确退回当前 `share-poster`：主视觉区应改为真实聚会记录的时间节点展示，且整体要更紧凑；下方状态和动作必须极简收口，不再使用大卡片与多余底部入口。

##### 12.7.56.1 主视觉区口径

| 项目 | 接收标准 | 退回条件 |
| --- | --- | --- |
| 主视觉结构 | 红框主视觉区改为 `记录时间节点流`，节点应包含拍照、账本变动等真实聚会记录 | 仍是“照片墙 + 聚会账本大卡 + 长摘要”三段堆叠 |
| 节点密度 | 时间节点必须紧凑，首屏优先给 2-4 个高价值节点，不拉成长列表 | 节点太稀、太厚，主视觉像任务页或长摘要 |
| 节点类型 | 至少同时支持 `photo`、`drink_debt`、`drink_add`，必要时带 1 条短评论/总结句 | 只剩照片或只剩账本摘要，未形成“记录流” |
| 页面与保存图一致 | 页面预览与最终保存图都使用同一时间节点结构，不允许页面是时间流、保存图又回到照片墙大卡 | 页面与保存图结构不一致 |

##### 12.7.56.2 状态与提示口径

| 项目 | 接收标准 | 退回条件 |
| --- | --- | --- |
| 生成中 / 成功 / 失败提示 | 状态只在按钮下方保留一行小字，不再用大状态卡片 | 仍出现大卡片式“排队/成功/失败”状态面板 |
| 分享范围提示 | 去掉“仅展示可分享内容 / 私密记录不会进入分享图”提示 | 仍在主界面展示该提示 |
| 底部附加入口 | 去掉 `加入聚会 / 查看相册 / 反馈` | 底部仍出现三入口或同类杂项入口 |

##### 12.7.56.3 按钮层级与状态文案

| 状态 | 主按钮 | 次按钮 | 纠错按钮 | 按钮下方一行提示 |
| --- | --- | --- | --- | --- |
| 生成中 | `生成中` | `返回聚会`、`刷新状态` | 无 | `分享图生成中，请稍后刷新` |
| ready/可保存 | `保存聚会图` | `返回聚会`、`刷新状态` | 无 | `保存后可继续发送给朋友` |
| 刷新成功可继续 | `去分享` | `返回聚会`、`刷新状态` | 无 | `分享图已就绪，可直接去分享` |
| save-success | `保存聚会图` 已完成态或主按钮保持成功语义 | `返回聚会`、`刷新状态` | 无 | `已保存成功` |
| failed | `保存聚会图` 保持主路径语义 | `返回聚会`、`刷新状态` | `重新生成` | `生成失败，请刷新状态或重新生成` |

补充规则：
- `保存聚会图 / 去分享` 为唯一主按钮。
- `返回聚会 / 刷新状态` 为次按钮，不得抢主按钮视觉。
- `重新生成` 只在失败态出现，且为明确纠错动作，不得抢主按钮。
- 成功态只提示成功，不额外新增按钮。

##### 12.7.56.4 尺寸与样式建议

| 元素 | 数值建议 |
| --- | --- |
| 主按钮高度 | `48-54px` |
| 次按钮高度 | `40-44px` |
| 主按钮字号 | `16-18px`，字重 `600-700` |
| 次按钮字号 | `14-16px`，字重 `500-600` |
| 状态小字字号 | `12-13px` |
| 状态小字颜色 | 成功 `#B5D66F`，失败 `#FF8A7A`，生成中 `rgba(241,220,177,0.78)` |
| 主视觉时间节点区 | 首屏建议占页面主内容区 `52%-62%`，优先给节点而不是提示和卡片 |

##### 12.7.56.5 可复用资产结论

- 当前 `008BA` 不要求新增大图资产。
- 可继续复用现有 `008AR / clean-slate-001` 资产体系中的：
  - 时间线/节点类资产思路
  - `pr-cs002-stage-glow.svg`
  - `pr-cs002-poster-glow-1080.svg`
  - `pr-cs002-retry-spark.svg`
- 但这些资产只能服务“紧凑时间节点流”，不得再撑出大卡片式状态区或大摘要区。

##### 12.7.56.6 前端接入禁区

- 禁止回到“照片墙 + 聚会账本大卡 + 长摘要”结构。
- 禁止保留大状态卡：排队、成功、失败都不允许再做成独立大卡片。
- 禁止保留“仅展示可分享内容 / 私密记录不会进入分享图”提示。
- 禁止保留底部 `加入聚会 / 查看相册 / 反馈`。
- 禁止把 `重新生成` 常驻显示在成功态或生成中态。
- 禁止页面与保存图结构分裂：页面是时间流、保存图却是旧海报结构。

##### 12.7.56.7 测试验收清单

| 项目 | 证据 | 标准 |
| --- | --- | --- |
| 页面首屏 | `share-poster` 390 宽截图 | 主视觉为时间节点流；不再是照片墙大卡 + 账本大卡 + 长摘要 |
| 保存图原图/等比预览 | 保存图 PNG 或等比预览 | 与页面同一时间节点结构，不回退旧布局 |
| 按钮层级 | ready / generating / failed 至少 3 个状态截图 | 主按钮/次按钮/纠错按钮层级正确 |
| 状态文案 | 同上截图 + page data | 状态只在按钮下方一行小字，不再有大状态卡 |
| 清理项 | 页面截图 | 无分享范围提示、无 `加入聚会 / 查看相册 / 反馈` |

##### 12.7.56.8 预置退回码

| 退回码 | 级别 | 触发条件 | 责任角色 |
| --- | --- | --- | --- |
| `PR-UX-LC008BA-P0-POSTER-NOT-TIMELINE-HERO` | P0 | 主视觉区仍不是紧凑时间节点流，仍保留照片墙大卡/账本大卡/长摘要主结构 | 前端 |
| `PR-UX-LC008BA-P0-STATE-CARD-STILL-LARGE` | P0 | 排队、成功、失败仍用大卡片呈现 | 前端 |
| `PR-UX-LC008BA-P0-UNWANTED-ENTRY-STILL-EXPOSED` | P0 | 仍展示分享范围提示或底部 `加入聚会 / 查看相册 / 反馈` | 前端 |
| `PR-UX-LC008BA-P1-PRIMARY-ACTION-HIERARCHY-WEAK` | P1 | `保存聚会图 / 去分享` 不够突出，或 `重新生成` 抢主按钮 | 前端 |
| `PR-UX-LC008BA-P1-PAGE-SAVE-IMAGE-MISMATCH` | P1 | 页面与保存图结构不一致 | 前端 |

##### 12.7.56.9 当前状态

- 本节仅定义 `share-poster` 时间节点主视觉与动作层级门禁，不代表页面已通过。
- 后续前端回包与测试截图到位后，UI/UX 只按本节口径接收或退回。

#### 12.7.57 `PR-UX-LINK-CLEANUP-008BH-REAL-TIME-LEDGER-END-QR-SPEC` 实时时间/账本修改/结束聚会/分享二维码规格

记录时间：2026-06-19。按 PM 008BH 派工，本节只补 `live-record`、独立 `ledger`、`share-poster` 的 UI/UX 可执行规格，不改业务源码，不写设计通过。目标是把底部动作区、账本确认修改、真实头像、底部二维码和“真实时间 / 真实状态”门禁写死，前端不得再用 CSS 近似、默认当前时间、假二维码或静态壳层兜底。

##### 12.7.57.1 口径衔接与资产边界

- `live-record` 的时间线密度、连续照片压缩、Hero 文本标题/文本状态继续复用 12.7.53、12.7.54、12.7.55。
- `share-poster` 的时间节点主视觉和按钮层级继续复用 12.7.56，本节只追加底部二维码和真实时间 / 状态红线。
- 当前不要求整页重画，优先复用既有 clean-slate 资产：
  - `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008ar-cta-paper-button.png`
  - `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008ar-cta-paper-button-pressed.png`
  - `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008ar-icon-camera-cta.png`
  - `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs002-qr-safe-plate.svg`
- 本轮不新增大图资产；若后续实现证明现有资产无法承载真实二维码或双按钮层级，再单独开最小资产补齐任务。

##### 12.7.57.2 `live-record` 底部动作区规格

| 项目 | 接收标准 | 退回条件 |
| --- | --- | --- |
| 动作结构 | 底部动作区只服务当前记录流，主动作 `继续拍照`，次动作 `结束聚会`；不再出现无语义横杠或额外装饰条 | `继续拍照` 上方仍有不明横杠、分割线、装饰条，或动作区含无关入口 |
| 主次关系 | `继续拍照` 为唯一主按钮；`结束聚会` 为次按钮，视觉强度低于主按钮，但可明确看见 | 两个按钮同权重抢主路径，或 `结束聚会` 过强盖过继续拍照 |
| 角色边界 | `结束聚会` 仅 host / 发起者可见可点；非 host 不显示伪可点击结束按钮 | 非 host 仍展示可点结束按钮，或用假禁用样式误导 |
| 时间线保护 | 底部动作区不得遮挡时间线节点、霓虹牌、节点起始时间或评论尾部 | 底部按钮压住节点边缘、遮挡账本节点或造成最后一个有效节点不可读 |

390 宽预览框数值建议：

| 元素 | 建议值 |
| --- | --- |
| 动作区总宽 | `calc(100% - 32px)`，即左右各留 `16px` 安全边距 |
| 动作区底部 | `12-16px + safe-area-inset-bottom` |
| 动作区顶部与最后节点间距 | `20-28px` |
| `继续拍照` 主按钮高度 | `52-56px` |
| `继续拍照` 主按钮宽度 | `214-238px` |
| `结束聚会` 次按钮高度 | `44-48px` |
| `结束聚会` 次按钮宽度 | `98-120px` |
| 双按钮间距 | `10-12px` |

补充规则：

- `继续拍照` 继续复用 `pr-cs008ar-cta-paper-button.png` / `pressed` 与相机 icon，不允许换成普通色块按钮。
- `结束聚会` 不使用纸质主按钮资产，不得做成第二个同款大纸按钮；建议深底细描边或低饱和浅底次按钮，保持“可达但不抢主”。
- 禁止再加“按钮上方横杠”作为动作区分隔；如需收纳动作区，只允许使用透明容器或极轻背景，不得形成一根独立可见横线。

##### 12.7.57.3 独立 `ledger` 页规格

| 项目 | 接收标准 | 退回条件 |
| --- | --- | --- |
| 真实头像 | 每个成员行必须展示真实头像 + 用户名；头像不可用默认字母圆点长期代替真实数据态 | 头像缺失、全是默认占位、或头像与用户名脱节 |
| 编辑权限 | host / 发起者可编辑欠酒/加酒；非 host 只读，无伪可点加减按钮 | 非 host 仍能点加减，或 host 没有明确编辑入口 |
| 按钮收口 | 行内只保留必要加减控件；页内提交只保留一个 `确定修改` 收口按钮，不得每行重复“保存” | 重复按钮、每行一个保存、或“保存关键事件”回潮 |
| 触发逻辑 | 只有当本页存在未提交改动时，`确定修改` 才出现或从 disabled 变 enabled；无改动时不应抢视觉 | 无改动也常驻高亮，或改动后仍无明确提交口 |
| 状态反馈 | 提交中：按钮改 `提交中` 且禁点；成功：按钮下方一行成功提示；失败：按钮下方一行失败提示 + 可重试 | 用大卡片 toast、厚弹层或多处重复状态提示 |

390 宽预览框数值建议：

| 元素 | 建议值 |
| --- | --- |
| 成员头像 | `36-40px` 圆形 |
| 用户名字号 | `14-16px`，字重 `600` |
| 成员行垂直内边距 | `10-12px` |
| 加减控件尺寸 | `28-32px` 点击面不小于 `40px` |
| `确定修改` 按钮高度 | `44-48px` |
| `确定修改` 按钮宽度 | `128-168px`，居右或底部收口，不满宽铺屏 |
| 提交状态小字 | `12-13px` |

补充规则：

- 账本页必须干净，不允许再包一层厚卡或深色大框；成员行之间用轻分隔和留白区分即可。
- `确定修改` 只负责提交账本增减，不得混入分享、相册、关键事件等无关动作。
- 若真实头像字段缺失，只能显示 `头像待同步` 的中性占位并判待联调，不得把静态示意头像当通过。

##### 12.7.57.4 `share-poster` 底部二维码规格

| 项目 | 接收标准 | 退回条件 |
| --- | --- | --- |
| 资产真实性 | 底部二维码必须是真实小程序码 / 二维码位图资产，不允许前端用网格、假定位点、占位几何形状冒充 | 使用假画二维码、截图中二维码无法被识别为真实码 |
| 位置 | 二维码位于保存图底部安全区内，与主时间节点区分层，不压标题、不压节点、不贴底裁切 | 贴底、压住时间线、压按钮，或落在裁切危险区 |
| 安全区 | 二维码外层需放入 `pr-cs002-qr-safe-plate.svg` 或等效浅底安全块；二维码周围留纯净留白 | 二维码直接落在复杂背景、光效、照片或文字上 |
| 短提示 | 可保留一行极短提示，如 `微信扫码查看聚会记录`；提示不得超过 1 行，不得变成长说明卡 | 提示过长、变成说明模块、或把二维码挤出安全区 |

390 宽 / 保存图比例建议：

| 元素 | 建议值 |
| --- | --- |
| 页面内二维码预览尺寸 | `88-96px` |
| 保存图原图二维码尺寸 | `160-192px` |
| 二维码与底边距离 | 页面内 `24-32px`；保存图原图 `64-88px` |
| 二维码与相邻文案间距 | `8-12px` |
| 安全底板最小外边距 | 二维码四周各 `12-16px` |

补充规则：

- 若当前链路没有真实 `qrCodeUrl` / 小程序码位图，只能显示 `二维码待生成` 的中性占位并判阻塞，不得用假二维码顶替。
- 分享页 / 保存图中的二维码属于强验收点；`data 有 URL` 不等于通过，截图必须能看到真实二维码像素与完整安全区。

##### 12.7.57.5 真实时间 / 真实状态可视规则

| 场景 | 接收标准 | 退回条件 |
| --- | --- | --- |
| 记录页时间 | 节点时间、开始时间来自真实字段；若字段未返回，只能显示 `时间待同步` 或留空占位并判待联调 | 直接写默认当前时间、写死样例时间、或不同节点共用一组假时间 |
| 记录页状态 | `进行中`、`已结束` 等状态必须来自真实 session 状态字段；无字段时显示 `状态待同步` 中性 pill | 写死 `进行中`、默认给绿 pill、或根据页面猜状态 |
| 分享生成状态 | `生成中 / ready / failed / expired` 等只允许按真实任务状态显示 | 用本地默认态、前端写死 ready、或刷新前后状态不变但文案变化 |
| 账本修改状态 | `提交中 / 修改成功 / 修改失败` 只能由真实提交动作驱动 | 未提交也提示成功，或失败/成功只是假文案切换 |

补充规则：

- UI/UX 不接受假状态、假时间、默认当前时间、写死文案、内部样本名和工程态文案。
- 若真实字段缺失，本轮只能判 `待联调 / 待截图复核 / 退回`，不允许以“先给用户看一个差不多的状态”为由通过。

##### 12.7.57.6 前端接入禁区

- 禁止前端自行脑补 `结束聚会` 的位置、层级和角色边界。
- 禁止把 `确定修改` 做成常驻满屏主按钮，或拆成每行多个保存按钮。
- 禁止用 CSS 画假二维码、棋盘格二维码、占位二维码，或把二维码当普通图标摆放。
- 禁止在真实字段缺失时回退到默认当前时间、写死 `进行中`、写死 `ready`、写死成功文案。
- 禁止为底部动作区再加不明横杠、厚分割条、旧壳包裹层或遮挡时间线的悬浮大卡。

##### 12.7.57.7 测试验收清单

| 项目 | 证据 | 标准 |
| --- | --- | --- |
| `live-record` 双动作区 | 390 宽截图 + host / 非 host 至少各 1 张 | `继续拍照` 为主、`结束聚会` 收口清晰、无横杠、无节点遮挡 |
| `ledger` 真实头像与提交 | 有真实成员数据截图 + 一次加减前后截图 | 头像真实、host 可编、非 host 只读、改动后出现 `确定修改` |
| `ledger` 提交反馈 | 提交中 / 成功 / 失败 至少 3 态截图 | 状态只在按钮邻近一行提示，不用厚卡 |
| `share-poster` 二维码 | 页面截图 + 保存图原图或等比预览 | 可见真实二维码像素、底板安全区完整、不贴底裁切 |
| 真实时间 / 状态 | page data 摘要 + 页面截图 | 页面时间 / 状态与真实字段一致；无字段时明确待同步而非假值 |
| Console | 对应页面 Console 摘要 | 无阻塞红错；若字段缺失需在 data / 接口层可归因，不可由 UI 假补 |

##### 12.7.57.8 预置退回码

| 退回码 | 级别 | 触发条件 | 责任角色 |
| --- | --- | --- | --- |
| `PR-UX-LC008BH-P0-RECORD-END-CTA-BAR-RESIDUE` | P0 | `继续拍照` 上方仍有不明横杠 / 厚分隔条，或动作区遮挡时间线节点 | 前端 |
| `PR-UX-LC008BH-P0-LEDGER-CONFIRM-MISSING` | P0 | host 改动后仍没有明确 `确定修改` 收口，或仍保留重复保存按钮 | 前端 |
| `PR-UX-LC008BH-P0-QR-NOT-REAL-ASSET` | P0 | 分享页 / 保存图底部二维码不是可识别真实位图资产，或仅是假画 / 占位 | 前端 + 接口联调 |
| `PR-UX-LC008BH-P0-FAKE-TIME-OR-STATUS` | P0 | 页面出现默认当前时间、写死状态、假成功 / 假 ready / 假进行中 | 前端 + 接口联调 + 后端/API |
| `PR-UX-LC008BH-P1-END-CTA-HIERARCHY-WEAK` | P1 | `结束聚会` 过强或过弱，主次关系不清 | 前端 |
| `PR-UX-LC008BH-P1-LEDGER-AVATAR-READONLY-WEAK` | P1 | 头像、用户名、host / 非 host 边界表达弱，用户难以判断谁能改 | 前端 |
| `PR-UX-LC008BH-P1-QR-SAFEAREA-WEAK` | P1 | 二维码真实存在，但安全区、留白或短提示层级过弱 | 前端 |

##### 12.7.57.9 当前状态

- 本节只定义 008BH 的视觉 / 交互 / 字段门禁，不代表 `live-record`、`ledger`、`share-poster` 已通过。
- 当前不新增资产，先要求前端严格复用既有 CTA 与二维码安全底板资产，并按真实字段驱动页面状态。
- 下一步由前端按本节和 12.7.53-12.7.56 执行收口；测试按 `PR-QA-LINK-CLEANUP-008BI-REAL-TIME-STATUS-LEDGER-END-RETEST` 补 host / 非 host / 保存图 / page data 证据；后端/API 与接口联调需确保真实时间、真实状态、真实二维码链路可复核。

### 12.8 当前 UI/UX 结论

当前状态调整为 `待/进行预览框阶段复核`。当前阶段不再因缺真机截图/录屏阻塞开发；但缺开发者工具右侧预览框可读截图、路径录屏、控制台/API 摘要或关键页面证据时，只能记录 `待预览证据`，不能写预览框阶段通过。

阻塞原因：

- 现有 14 张截图证明旧版仍存在 P0/P1 级 UI 问题和品牌方向不一致。
- 前端最小 P0 修复仅有实现说明，尚无真机复拍和 UI/UX 方案确认，因此只能标记 `待复拍 / 待实现截图复核`。
- MP4 缺关键帧、时间戳、角色和样本 ID，不能作为设计验收通过证据。
- 前端 `PR-FE-ASSET-INTEGRATE-001` 已回报并通过 PM 基础复核，但 UI/UX 尚未收到 `PR-QA-ASSET-RETEST-001` 真机截图/录屏，不能判定实现通过。
- 前端 `PR-FE-REDESIGN-FULL-001` 已回收并通过 PM 基础复核，但 UI/UX 尚未收到新版真机截图/录屏，不能判断旧样式框是否清零。
- 首轮测试条件已收敛为 iPhone 12 / iOS 26.5 / 微信 8.0.73 / 390 宽，只能用于 P0 初判；最终 375/414 多宽度准出证据仍缺。
- 23:15 批次 4 张截图已回收并审计；创建页主题卡内容严重裁切，已按 `PR-FE-REDESIGN-P1-THEME-CARD-CROP` 退回前端，不能写通过。
- “聚会记录师”新版 5 屏目标图稿已有 `PR-UX-ASSET-001-A` 首版，前端据称已复刻，但尚未收到同状态实现截图。
- `PR-UX-REMAINING-PAGES-VISUAL-001` 已补 P0 剩余页面目标板和前端实践包，覆盖 `me`、`wine-history`、`share-poster/share-preview`、`session-brief`、`rankings`；但尚未收到这些页面的实现截图、录屏和角色/状态证据。
- `PR-UX-ASSET-CUT-001` 首版切图据称已试装，但仍缺透明边缘、WebP 兼容和包体增量验收截图。
- 缺首轮 iPhone 12 / 390 宽新版截图/录屏，且最终仍缺 375/414 多宽度和创建者/参与者角色对照，无法判断越界、按钮遮挡和流程步数是否已关闭。

下一步需要 PM 派发：

- 测试负责人按 `PR-QA-ASSET-RETEST-001` 提交 12.6.2 接收矩阵所需截图/录屏。
- 测试负责人首轮按 iPhone 12 / iOS 26.5 / 微信 8.0.73 / 390 宽提交 5 屏、三步路径、旧样式扫描和资产可读性截图/录屏，用于 P0 初判。
- 测试负责人后续补 375/414 多宽度截图/录屏，作为最终准出补测。
- 前端负责人保留 `PR-FE-ASSET-INTEGRATE-001` 实现说明、资产接入路径、WebP 兼容和包体增量，供 UI/UX 对照截图复核。
- 前端负责人按 `PR-UX-REMAINING-PAGES-VISUAL-001` 复刻 `me`、`wine-history`、`share-poster/share-preview`、`session-brief`、`rankings`，并按本节退回码自查边界、长列表、厚卡、分享过滤和榜单状态。
- 前端负责人若主路径仍出现 12.6.3 任一 P0 旧样式框问题，直接按对应退回码重做，不进入 UI/UX 通过判定。
- UI/UX 收到截图/录屏后按 12.6.2 出接收/退回结论；未收齐前不得写设计通过。
- PM 已暂定 `Clean Quick Recorder` 为第一版落地基线；`Cartoon Party Snap` 仅吸收轻贴纸元素，`Trendy Memory Wall` 保留为分享页/相册二期增强方向。
