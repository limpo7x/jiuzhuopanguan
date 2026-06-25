# 聚会记录师 Clean-Room 前端统一设计规范

生成日期：2026-06-25

当前版本：v1.0

适用范围：`miniprogram/app.json` 已注册的 21 个页面、这些页面使用的公共组件、登录授权弹层、确认弹窗、loading/toast 状态、分享图预览与保存相关 UI。

实现基准：`miniprogram/styles/party-pop-clean.less`

## 1. 文档定位

本文档是本轮 `party-pop-clean` 前端重做的统一设计规范。旧规范、功能矩阵、工作计划和实现记录如与本文档冲突，以本文档和当前代码实现为准。

整合来源：

| 来源 | 用途 |
| --- | --- |
| `docs/runtime/party-pop-clean-design-spec-20260625.md` | 初版视觉规范 |
| `docs/runtime/party-pop-clean-function-matrix-20260625.md` | 21 个注册页功能合同 |
| `docs/runtime/ui-full-rebuild-implementation-20260625.md` | 全量重构实施记录 |
| `docs/runtime/ui-redesign-frontend-workplan-20260625.md` | 早期 UI 问题与阶段计划 |
| `miniprogram/styles/party-pop-clean.less` | 当前落地代码标准 |
| `miniprogram/app.json` | 页面注册范围 |

## 2. Design Read

Reading this as: 微信小程序产品 UI 全量重做，面向年轻线下聚会用户，采用卡通、高对比、年轻、活力、聚会感的品牌语言，落在独立 `pp-*` 小程序设计系统上。

设计参数：

| 参数 | 值 | 说明 |
| --- | --- | --- |
| DESIGN_VARIANCE | 9 | 高识别度、高对比、卡通化块面和实色阴影 |
| MOTION_INTENSITY | 5 | 轻量触感反馈，不做重滚动动画 |
| VISUAL_DENSITY | 5 | 日常工具型小程序密度，重点区域需要明显呼吸感 |

## 3. Clean-Room 隔离规则

必须遵守：

- 新视觉只使用 `party-pop-clean` 体系，不继承旧前端样式。
- 页面类名、组件类名、设计 token 必须使用 `pp-*` 命名。
- 用户可见新增文案统一使用“聚会记录师”。
- 历史“酒桌判官”只允许出现在旧代码名、旧数据、旧文档或技术迁移上下文，不得进入新 UI 可见文案。
- 不引用 `party-recorder-rebuild`、`party-recorder-v2`、旧 CDN 主视觉作为设计来源。
- 不使用旧品牌主心智、旧玩法文案、旧页面壳、旧图片裁切方式。
- 不伪造分享图成功态、假二维码、假照片、假接口结果。
- 功能入口必须对应真实事件、真实路由或明确不可用原因。

允许保留：

- 原页面路由、事件名、接口调用、storage key、canvas id、分享路径。
- 旧业务字段和历史数据兼容逻辑。
- 未注册历史页面文件可以存在，但注册页不得主动跳入旧页面。

## 4. 页面覆盖范围

全量注册页必须使用本规范。

| 注册页 | 页面定位 | 关键 UI |
| --- | --- | --- |
| `pages/index/index` | 首页 | Hero、创建/口令加入、进行中入口、最近相册、登录授权、底栏 |
| `pages/album/index` | 相册 | Hero、筛选、相册列表、空态、创建入口 |
| `pages/ledger/index` | 独立账本 | Hero、账本统计、成员加减、确认提交、无局空态 |
| `pages/tools/index` | 工具箱 | Hero、搜索、功能区卡片、分类 chips、工具列表 |
| `pages/rankings/index` | 今日回忆榜 | Hero、分类 tabs、榜单列表、推举确认、空态 |
| `pages/feature-zones/index` | 功能区 | Hero、真实配置列表、不可用原因 |
| `pages/tool-detail/index` | 工具详情 | Hero、工具表单、输出卡、图片处理区 |
| `pages/me/index` | 我的 | Hero、分段 tabs、统计、待分享、分享图、服务 |
| `pages/create-session/index` | 创建聚会 | Hero、三步流程条、名称输入、开局时间、人数步进、下一步 |
| `pages/invite-group/index` | 邀请好友 | Hero、三步流程条、口令、成员槽、复制/刷新/分享、首拍入口 |
| `pages/share-preview/index` | 分享预览 | Hero、隐私说明、公开内容、错误态、返回 |
| `pages/compliance-guide/index` | 新手引导 | Hero、合规说明、确认进入 |
| `pages/moment-editor/index` | 首拍/照片记录 | Hero、三步流程条、照片上传、说明输入、可见范围、授权、提交 |
| `pages/session-brief/index` | 聚会简报 | Hero、时间线、照片推举、账本摘要 |
| `pages/share-poster/index` | 分享图 | 海报舞台、任务态、权限态、时间线、二维码、保存 |
| `pages/invalid-state/index` | 结束/无效状态 | Hero、隐私提示、相册/再开一场/快捷入口 |
| `pages/privacy-state/index` | 隐私状态 | Hero、权限说明、主次动作 |
| `pages/settings/index` | 设置 | Hero、设置列表、空态 |
| `pages/friend-hub/index` | 我的聚友 | Hero、好友列表、拍一拍/删除、空态 |
| `pages/waiting-room/index` | 等待开局 | Hero、成员列表、邀请、首拍门禁 |
| `pages/live-record/index` | 进行中聚会 | Hero、记录/相册/账本/分享 tabs、时间线、固定操作 |

## 5. 视觉资产

设计资产统一放在：

`miniprogram/assets/party-pop-clean/`

当前核心资产：

| 资产 | 用途 |
| --- | --- |
| `stage-bg-390x844.webp` | 页面背景 |
| `home-hero-750x420.webp` | 首页、相册、工具等 hero 图 |
| `share-poster-top-750x520.webp` | 分享图顶部 |
| `share-poster-bottom-750x360.webp` | 分享图底部 |
| `empty-memory-sticker.png` | 空态插画 |
| `photo-upload-sticker.png` | 上传/拍照空态插画 |
| `icons/*.png` | 按钮、底栏、步进器、工具入口图标 |

参考图归档：

| 文件 | 用途 |
| --- | --- |
| `docs/runtime/party-pop-clean-20260625/functional-reference-01-main-flow.png` | 主链路页面参考 |
| `docs/runtime/party-pop-clean-20260625/functional-reference-02-content-share.png` | 内容和分享链路参考 |
| `docs/runtime/party-pop-clean-20260625/functional-reference-03-tools-state-dialog.png` | 工具、状态页、弹层参考 |

## 6. 色彩 Token

| Token | Hex | 用途 |
| --- | --- | --- |
| `pp-ink` | `#111317` | 文字、描边、实色阴影 |
| `pp-paper` | `#fffaf0` | 页面底色、Ghost 按钮底色 |
| `pp-white` | `#ffffff` | 面板、输入框、底栏 |
| `pp-coral` | `#ff504d` | 主 CTA、危险确认、关键动作 |
| `pp-cyan` | `#00cbff` | 二级动作、工具、信息态 |
| `pp-lime` | `#d3ff2d` | Logo、选中态、成功态 |
| `pp-yellow` | `#ffcd40` | 徽章、提示、强调 |
| `pp-mask` | `rgba(17, 19, 23, .55)` | 弹层遮罩 |

透明文字：

| Token | 值 | 用途 |
| --- | --- | --- |
| `pp-text-main` | `#111317` | 主文字 |
| `pp-text-body` | `rgba(17, 19, 23, .72)` | 正文 |
| `pp-text-caption` | `rgba(17, 19, 23, .58)` | 辅助文字 |
| `pp-text-muted` | `rgba(17, 19, 23, .42)` | placeholder |

## 7. 字体、字号、行高

字体栈：

`"PingFang SC", "Microsoft YaHei", sans-serif`

全局要求：

- `letter-spacing: 0`
- 不用负字距。
- 页面主标题不随视口宽度缩放。
- 小容器内不得使用 hero 级字号。

| 层级 | 类名 | 字号 | 字重 | 行高 | 用途 |
| --- | --- | --- | --- | --- | --- |
| 页面大标题 | `.pp-title` | 34px | 950 | 1.04 | Hero 标题 |
| 页面中标题 | `.pp-title-sm` | 25px | 950 | 1.10 | 弹窗标题、二级页面标题 |
| 区块标题 | `.pp-section-title` | 19px | 950 | 1.22 | 面板标题 |
| 列表主文 | `.pp-list-title` | 16px | 900 | 1.25 | 列表项标题 |
| 正文 | `.pp-body` | 14px | 600 | 1.50 | 描述、说明 |
| 辅助文案 | `.pp-caption` | 12px | 750 | 1.42 | 时间、状态、说明 |
| Kicker | `.pp-kicker` | 12px | 900 | 1.20 | 英文短标识 |
| 底栏文字 | `.pp-bottom-item` | 11px | 850 | 1.00 | 底部导航 |
| 数字 | `.pp-stat-value` | 25px | 950 | 1.00 | 数据统计 |
| 大码值 | `.pp-code` | 38px | 950 | 1.00 | 口令/分享码 |

## 8. 页面节奏和间距

当前代码基准：

```less
.pp-scroll {
  padding: 116px 18px 156px;
  --pp-section-gap: 42px;
  --pp-section-gap-tight: 28px;
  --pp-shadow-gap: 10px;
}
```

页面级标准：

| 项 | 标准 |
| --- | --- |
| 页面左右边距 | 18px |
| 顶部内容起点 | 116px |
| 紧凑页顶部起点 | 104px |
| 底部安全留白 | 156px |
| 页面级大模块间距 | 42px |
| 紧凑模块间距 | 28px |
| 阴影补偿间距 | 10px |
| 首个大模块顶部补偿 | 18px |
| 标题行上/下间距 | 30px / 20px |
| 标题行后列表补偿 | 4px |
| Hero 图片下间距 | 18px |
| 按钮组 gap | 10px |
| 列表项 gap | 12px |
| 列表纵向 gap | 14px |
| 网格 gap | 12px |
| 相册网格 gap | 10px |
| 时间线 gap | 14px |

规则：

- 页面级 `.pp-hero`、`.pp-panel`、`.pp-card`、`.pp-empty`、`.pp-list`、`.pp-tabs`、`.pp-stat-row`、`.pp-grid-2`、`.pp-photo-grid`、`.pp-timeline`、`.pp-poster-stage` 必须吃到 `--pp-section-gap`。
- `scroll-view` 在小程序中可能存在内部渲染层，所以必须保留 `.pp-scroll .pp-*` 兜底选择器。
- 嵌套在 `.pp-panel`、`.pp-card`、`.pp-grid-2`、`.pp-list`、`.pp-timeline`、`.pp-poster-stage` 内部的小卡片必须重置 `margin-bottom: 0`，避免账本、工具详情、分享图内部被错误撑大。
- 粗黑实体阴影在视觉上会外扩，模块间距必须包含阴影补偿，不得让下一个模块贴到阴影边缘。

## 9. 形态系统

| 元件 | 类名 | 圆角 | 描边 | 阴影 | 内边距/尺寸 |
| --- | --- | --- | --- | --- | --- |
| Logo | `.pp-logo` | 18px | 4px ink | 6px ink | 58px |
| 小 Logo | `.pp-logo-small` | 14px | 3px ink | 4px ink | 42px |
| Hero | `.pp-hero` | 30px | 4px ink | 8px ink | 22px 18px 24px |
| Hero 图 | `.pp-hero-image` | 26px | 4px ink | 无 | 高 190px |
| 面板 | `.pp-panel` | 26px | 3px ink | 6px ink | 22px 18px |
| 卡片 | `.pp-card` | 26px | 3px ink | 6px ink | 22px 18px |
| 列表项 | `.pp-list-item` | 22px | 3px ink | 6px ink | 14px |
| 输入框 | `.pp-input` | 20px | 3px ink | 6px ink | 高 50px |
| 文本域 | `.pp-textarea` | 20px | 3px ink | 6px ink | 高 104px |
| Chip | `.pp-chip` | 999px | 3px ink | 3px ink | 高 40px |
| 主按钮 | `.pp-button` | 999px | 3px ink | 5px ink | 高 48px |
| 底栏 | `.pp-bottom-nav` | 28px | 4px ink | 6px ink | 高 70px |
| 弹窗 | `.pp-dialog` | 28px | 4px ink | 8px ink | 18px |
| 授权面板 | `.pp-auth-panel` | 28px | 4px ink | 8px ink | 18px |

## 10. 按钮系统

基础类：`.pp-button`

基础标准：

- `display: inline-flex`
- `min-height: 48px`
- `padding: 0 18px`
- `gap: 8px`
- `border: 3px solid #111317`
- `border-radius: 999px`
- `font-size: 15px`
- `font-weight: 950`
- `box-shadow: 5px 5px 0 #111317`

按钮变体：

| 变体 | 类名 | 背景 | 文字 | 用途 |
| --- | --- | --- | --- | --- |
| Primary | `.pp-button-primary` | `#ff504d` | `#ffffff` | 创建、结束、提交、关键动作 |
| Secondary | `.pp-button-secondary` | `#00cbff` | `#111317` | 口令加入、刷新、选择图片 |
| Lime | `.pp-button-lime` | `#d3ff2d` | `#111317` | 登录、确认、成功动作 |
| Yellow | `.pp-button-yellow` | `#ffcd40` | `#111317` | 提示类动作 |
| Ghost | `.pp-button-ghost` | `#fffaf0` | `#111317` | 取消、次级、安全返回 |
| Danger | `.pp-button-danger` | `#ff504d` | `#ffffff` | 删除、踢出、危险确认 |

状态标准：

| 状态 | 标准 |
| --- | --- |
| Normal | 使用对应变体背景，黑描边，实体阴影 |
| Active | `translateY(2px)`，阴影收缩到 `2px 2px 0 #111317` |
| Disabled | `opacity: .45`，保留形体和布局，不用纯灰扁平化 |
| Loading | 按钮保留位置，文案改为“提交中/刷新中/生成中/保存中”，避免全页遮挡 |
| Icon | 图标用 `.pp-icon`，24px，放在文字左侧 |

禁止：

- 按钮文字换行。
- 白底白字、透明无描边按钮。
- 用普通文本伪装可点击按钮。
- 用 emoji、符号字符代替功能图标。

## 11. Chip、Tabs、Segment

Chip：

| 项 | 标准 |
| --- | --- |
| 类名 | `.pp-chip` |
| 高度 | 40px |
| padding | `0 16px` |
| 字号/字重 | 14px / 900 |
| 描边 | 3px ink |
| 阴影 | 3px ink |
| 选中态 | `.pp-chip-active`，lime 背景 |

Tabs：

| 项 | 标准 |
| --- | --- |
| 容器 | `.pp-tabs` |
| gap | 8px |
| padding | 6px |
| 高度 | 内容自适应 |
| tab 高度 | 38px |
| tab 字号/字重 | 13px / 950 |
| 选中态 | `.pp-tab-active`，lime 背景 |
| 禁用态 | `.pp-tab-disabled`，opacity .48 |

排行榜、相册、我的页分段必须使用 tabs/chips，不得把选项挤到面板边框里。

## 12. 三步流程条

创建、邀请、首拍链路必须使用 `.pp-flow`，不得退回普通文本提示。

| 项 | 标准 |
| --- | --- |
| 容器 | `.pp-flow` |
| 圆角 | 22px |
| 描边 | 3px ink |
| 阴影 | 4px ink |
| 内边距 | 8px |
| 步骤编号 | `.pp-flow-index`，28px 圆形，3px 描边 |
| 步骤文字 | `.pp-flow-label`，12px / 950 |
| 连接线 | `.pp-flow-line`，6px 高，3px 描边 |
| 当前步骤 | `.pp-flow-step-active`，编号 coral 背景、白字 |
| 已完成步骤 | `.pp-flow-step-done`，编号 lime 背景 |
| 已完成连接线 | `.pp-flow-line-active`，lime 背景 |

步骤固定为：

| 步骤 | 页面 | 状态 |
| --- | --- | --- |
| 1 创建 | `pages/create-session/index` | active |
| 2 邀请 | `pages/invite-group/index` | active，创建为 done |
| 3 拍照 | `pages/moment-editor/index` 首拍模式 | active，创建和邀请为 done |

规则：

- 流程条放在 Hero 内标题前。
- 宽度必须为 100%，不得被裁切。
- 步骤文字不能换行。
- 详情模式的照片编辑页不展示创建流程条。

## 13. 输入和表单

输入框：

| 项 | 标准 |
| --- | --- |
| 类名 | `.pp-input` |
| 高度 | 50px |
| padding | `0 14px` |
| 字号/字重 | 16px / 800 |
| 圆角 | 20px |
| placeholder | `rgba(17, 19, 23, .42)` |

文本域：

| 项 | 标准 |
| --- | --- |
| 类名 | `.pp-textarea` |
| 高度 | 104px |
| padding | 14px |
| 行高 | 1.45 |

表单规则：

- 表单项之间最小 10px。
- 表单面板内部按钮与输入之间最小 12px。
- 错误或不可用原因必须用 `.pp-body` 或 `.pp-caption` 说明，不用 Toast 替代持久错误。
- 工具详情页不得伪造输出，必须由真实输入或真实状态驱动。

## 14. 导航栏

顶部导航：

| 项 | 标准 |
| --- | --- |
| 容器 | `.pp-nav` |
| 层级 | z-index 60 |
| 布局 | fixed top |
| 背景 | `#fffaf0` 到透明的纵向渐隐 |
| 标题字号/字重 | 16px / 950 |
| 标题最大宽度 | 160px |
| 返回按钮 | 34px 圆形，3px 描边，3px 阴影 |

规则：

- 所有页面必须能看到顶部导航标题或返回按钮。
- 顶部导航 fixed，不参与主内容流挤压。
- `.pp-scroll` 顶部 padding 必须为导航、安全区和首个大框留出空间。

底部导航：

| 项 | 标准 |
| --- | --- |
| 容器 | `.pp-bottom-nav` |
| 位置 | fixed bottom |
| 左右 | 12px |
| 底部 | `calc(12px + env(safe-area-inset-bottom))` |
| 高度 | 70px |
| 圆角 | 28px |
| 描边 | 4px ink |
| 阴影 | 6px ink |
| 图标 | 26px |
| 文字 | 11px / 850 |

底栏项目：

| Tab | 路由 |
| --- | --- |
| 首页 | `pages/index/index` |
| 工具箱 | `pages/tools/index` |
| 排行榜 | `pages/rankings/index` |
| 我的 | `pages/me/index` |

## 15. 页面组件规范

Hero：

- 使用 `.pp-hero`。
- 首屏 Hero 可放 `.pp-hero-image`，高度 190px。
- Hero 标题必须可读，不得被顶部导航遮挡。
- Hero 内最多放：kicker、标题、正文、核心统计/按钮。

Panel/Card：

- `.pp-panel` 用于完整区块。
- `.pp-card` 用于较小重复项或组件卡。
- 禁止卡套卡作为页面主结构；若业务上必须嵌套，内部卡必须重置外间距。

List：

- `.pp-list` 使用 flex column，gap 14px。
- `.pp-list-item` 高度随内容，不得压缩文字。
- 缩略图用 `.pp-thumb`，固定尺寸由页面内联或局部样式指定。

Stats：

- `.pp-stat-row` 使用 flex。
- `.pp-stat` 最小宽度 92px，flex 1。
- 数字用 `.pp-stat-value`，说明用 `.pp-stat-label`。

Timeline：

- `.pp-timeline` 左侧 4px 竖线。
- `.pp-timeline-item` 使用 3px 描边、4px 阴影。
- 时间线节点前圆点为 yellow。
- 时间线内容必须来自真实节点，不得塞假数据补视觉。

Photo Grid：

- `.pp-photo-grid` gap 10px。
- `.pp-photo-tile` 两列，宽度 `calc((100% - 10px) / 2)`。
- 图片不可用时显示明确 fallback，不显示假照片。

Share Poster：

- 使用 `.pp-poster-stage`。
- 权限不足、未结束、被移出、非成员、任务不可用时，必须隐藏照片、时间线、总结、二维码和分享图 URL。
- 只展示安全解释和可返回动作。

Ledger：

- 账本加减使用 `.pp-stepper`。
- 步进按钮 `.pp-stepper-btn`，40px，3px 描边，3px 阴影。
- 提交前必须保留确认动作，不得直接写入。
- 非发起人只读状态必须明显。

## 16. 弹层系统

确认弹窗：

| 项 | 标准 |
| --- | --- |
| 组件 | `pp-dialog` |
| 遮罩 | `.pp-dialog-mask` |
| 遮罩色 | `rgba(17, 19, 23, .55)` |
| 弹窗宽度 | 86vw |
| 最大宽度 | 340px |
| padding | 18px |
| 圆角 | 28px |
| 描边 | 4px ink |
| 阴影 | 8px ink |
| 标题 | 25px / 950 / 1.10 |
| 正文 | 14px / 1.50 |
| 按钮 | 48px 高 |

登录授权：

| 项 | 标准 |
| --- | --- |
| 容器 | `.pp-auth-mask` |
| 面板 | `.pp-auth-panel` |
| 头像按钮 | `.pp-avatar`，54px |
| 昵称输入 | `.pp-input` |
| 提交按钮 | `.pp-button-primary`，宽度 100% |

Toast：

- 使用 `pp-toast` 视觉层。
- 短暂成功/失败提示可用 toast。
- 持久错误必须落在页面内容中，不只依赖 toast。

Loading：

| 场景 | 标准 |
| --- | --- |
| 页面内加载 | `.pp-loading`，带 `.pp-loading-dot` 和文案 |
| 全局阻塞加载 | `.pp-loading-mask`，仅用于不可交互等待 |
| 按钮加载 | 保留按钮位置，改 loading 文案 |

弹层必须覆盖：

| 场景 | 新视觉 |
| --- | --- |
| 登录授权 | `pp-auth-panel` |
| 结束聚会确认 | `pp-dialog` |
| 踢出成员确认 | `pp-dialog` |
| 放弃编辑/返回确认 | `pp-dialog` |
| 推举确认 | `pp-dialog` |
| 首拍前提示 | `pp-dialog` |
| 口令加入异常 | `pp-dialog` 或页面内错误 |
| 保存/加载中 | `pp-loading` 或按钮 loading |

## 17. 状态和空态

空态：

- 使用 `.pp-empty`。
- 最小高度 180px。
- 插画用 `.pp-empty-sticker`，116px。
- 文案必须说明当前状态和下一步。

错误态：

- 错误必须包含原因。
- 可恢复错误必须提供重试或返回。
- 权限错误不得泄露隐藏内容。

不可用入口：

- 如后台未配置，展示“后台未配置/等待配置/暂不可用原因”。
- 不允许做成能点击但无反馈的死入口。
- 不允许用成功态包装未完成能力。

## 18. 页面功能合同

公共接口不得改：

- 不改 `app.json` 注册页。
- 不改 API path。
- 不改页面事件名。
- 不改 storage key。
- 不改 canvas id。
- 不改分享路径。
- 不改现有业务字段。

关键行为必须保留：

| 链路 | 必保留 |
| --- | --- |
| 创建 | 聚会名、开局时间、人数、下一步 |
| 邀请 | 口令、复制、刷新、分享、成员槽 |
| 首拍 | 选择照片、说明、可见范围、授权、提交 |
| 记录 | 时间线、相册、账本、结束聚会 |
| 相册 | 筛选、继续记录、分享图入口 |
| 分享图 | 任务态、权限态、保存、二维码 |
| 账本 | 加减、只读、确认写入 |
| 排行榜 | 分类、照片预览、推举确认 |
| 工具 | 搜索、分类、工具表单、输出 |
| 登录 | 头像、昵称、提交、关闭 |

## 19. 禁止项

视觉禁止：

- 旧资产路径作为设计来源。
- 旧页面类名继续定义新 UI。
- 卡套卡堆叠页面主结构。
- 大框体上下贴边。
- 创建/邀请/拍照流程用普通文本代替流程条。
- 顶部导航不可见。
- 文字挤压、重叠、被胶囊或边框遮挡。
- 选项卡文字不可见或被挤到边框里。
- 用装饰符号、emoji、随机 SVG 替代图标。
- 主操作按钮没有图标或触感状态。

功能禁止：

- 不存在的入口。
- “高级设置”这类未开放伪入口。
- 假照片。
- 假二维码。
- 假分享成功。
- 无说明死入口。
- 权限错误仍展示隐藏内容。
- 首拍前直接进入记录。
- 任意 sessionId 都能当作本局账本。

文案禁止：

- 新 UI 可见“酒桌判官”“酒友”“玩家”“战报”“惩罚”等旧玩法主文案。
- 伪装上线的权益文案。
- 无下一步的错误文案。

## 20. 验收检查

静态检查：

```bash
npm.cmd run check:encoding
npm.cmd run typecheck
node tmp/check-party-pop-clean.cjs
git diff --check
```

视觉扫描：

- 注册页和公共组件不得命中旧资产路径、旧样式类名、旧品牌/旧玩法文案。
- `pp-scroll` 页面必须覆盖大模块节奏。
- 内部网格、列表、时间线不得被页面级间距错误撑开。
- 顶部导航必须可见。
- 底部导航不得遮挡主要操作。
- 排行榜、相册、我的、记录页 tabs/chips 必须可读。
- 创建、邀请、首拍三页必须展示正确 `.pp-flow` 状态。
- 创建页不得出现 `[object Object]` 或“高级设置”入口。

页面覆盖：

- 21 个注册页逐页 relaunch。
- 确认无阻塞红错。
- 确认可返回。
- 确认关键按钮能触发原事件。

主链路验证：

1. 创建聚会。
2. 邀请成员。
3. 首拍。
4. 进入记录/相册/账本。
5. 结束聚会。
6. 查看分享图。
7. 回到我的回忆。

风险验证：

- 分享图无权限隐藏内容。
- 首拍前不能进入记录。
- 账本不能把任意 `sessionId` 当本局。
- 工具不可用必须显示原因。
- 登录授权弹层可关闭、可提交、不会遮挡底栏以外的主内容状态。

## 21. 维护规则

- 新页面必须先接入 `party-pop-clean.less`，再按页面功能选择 Hero、Panel、List、Tabs、Empty 等模块。
- 新组件必须用 `pp-*` 命名。
- 任何页面级间距调整必须同时检查 `scroll-view` 内层渲染和实体阴影外扩。
- 修改按钮尺寸、字体、颜色、圆角时必须同步本文档。
- 如果业务接口未完成，只能做空态、不可用态或合同壳层，不得伪造数据。
- 每次大改后至少跑静态检查和小程序 preview。

## 22. 当前实现差异说明

早期文档曾写：

- 顶部内容起点 96px。
- 紧凑页顶部起点 84px。
- 底部安全留白 128px。
- 区块间距 16px。

这些值已被当前实现替换为：

- 顶部内容起点 116px。
- 紧凑页顶部起点 104px。
- 底部安全留白 156px。
- 页面级大模块间距 42px。
- 标题行上/下间距 30px / 20px。

原因：

- 顶部导航 fixed 后需要额外安全距离。
- 粗黑实体阴影绘制在盒子外部，视觉上必须额外留白。
- `scroll-view` 内部渲染层导致直接子选择器不稳定，需要模块自带外间距兜底。
- 首页、排行榜等页面存在标题行加列表组合，需要标题行独立节奏。
