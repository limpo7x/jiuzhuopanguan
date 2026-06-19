# 008AR 记录/账本完整资产包

更新时间：2026-06-19
对应任务：`PR-UX-LINK-CLEANUP-008AR-RECORD-LEDGER-FULL-ASSET-PACK`

## 1. 目标与边界

- 本包基于用户最新验收图：`C:\Users\Administrator\AppData\Local\Temp\codex-clipboard-f12866c8-21f4-427c-aafb-6fa051890f60.png`
- 目标是让前端按资产 1:1 复刻，不允许自行脑补背景、霓虹、拍立得、按钮、贴纸、状态和时间线。
- 允许前端做的只有：按规格摆放、按运行态填充真实数据、在明确允许的区域做等比缩放或有限横向拉伸。
- 不允许：用 CSS 重画背景、时间线、霓虹牌、纸质按钮、拍立得框、贴纸；不允许拿普通 badge、纯色块、旧壳、旧布局替代。

## 2. 资产总览

预览图：`cuts/pr-cs008ar-asset-overview.png`

## 3. 资产清单

### 3.1 整页与 Hero

| 资产 | 尺寸 | 大小 | 格式 | 透明 | 用途 | 使用方式 |
| --- | --- | ---: | --- | --- | --- | --- |
| `cuts/pr-cs008ar-record-page-bg-750x1600.png` | `750x1600` | `1,431,995` | PNG | 否 | 整页深色烧烤/聚会氛围背景，含暗角、暖光、紫色余光、纹理 | 页面底图；容器按 `750:1600` 等比显示；禁止裁切中部主光区 |
| `cuts/pr-cs008ar-hero-bg-750x420.jpg` | `750x420` | `63,947` | JPG | 否 | 顶部 hero 场景背景 | Hero 区专用；容器按 `750:420` 显示；禁止叠自定义滤镜 |
| `cuts/pr-cs008ar-status-pill.png` | `138x54` | `2,178` | PNG | 是 | “进行中”状态 pill | 可直接用；如文字改动，仅允许在同 pill 上替换短文本 |
| `cuts/pr-cs008ar-circle-tool-btn.png` | `78x78` | `505` | PNG | 是 | 设置/更多圆形按钮底 | 必须配合 `gear/more` icon 使用 |
| `cuts/pr-cs008ar-icon-gear.png` | `36x36` | `277` | PNG | 是 | 设置 icon | 居中放入圆形按钮 |
| `cuts/pr-cs008ar-icon-more.png` | `36x36` | `148` | PNG | 是 | 更多 icon | 居中放入圆形按钮 |
| `cuts/pr-cs008ar-icon-people.png` | `30x30` | `270` | PNG | 是 | 参与人数 icon | 与人数文本组合 |
| `cuts/pr-cs008ar-icon-clock.png` | `30x30` | `212` | PNG | 是 | 开始时间 icon | 与开始时间组合 |

### 3.2 标题字效

| 资产 | 尺寸 | 大小 | 格式 | 透明 | 用途 | 使用方式 |
| --- | --- | ---: | --- | --- | --- | --- |
| `cuts/pr-cs008ar-title-sample-haibianshaokaoju.png` | `560x150` | `28,884` | PNG | 是 | 验收基准图中的标题样本“海边烧烤局” | 仅用于当前 fixture 1:1 对照；前端不得自行描字近似 |
| `cuts/pr-cs008at-title-sample-zhoumojuhuijilu.png` | `508x150` | `56,179` | PNG | 是 | 当前真实可测样本 `sessionName=周末聚会记录` 的同风格书法标题样本 | 当前接口联调 3.53 / 前端复测必须引用这张标题图，不得改回普通文字 |
| `cuts/pr-cs008ar-title-underline-scribble.png` | `420x44` | `789` | PNG | 是 | 标题下方手绘下划光效 | 独立叠加在标题下方 |
| `cuts/pr-cs008ar-title-star-sticker.png` | `64x64` | `405` | PNG | 是 | 标题右侧星标贴纸 | 固定放标题右侧，不可放大到覆盖标题 |

标题方案说明：
- 当前验收样本必须优先使用标题样本图 `pr-cs008ar-title-sample-haibianshaokaoju.png`。
- 当前真实可测样本 `sessionName=周末聚会记录` 必须优先使用 `pr-cs008at-title-sample-zhoumojuhuijilu.png`。
- 若运行态 `sessionName` 与样本不同，前端不得自行“仿写书法字”；只能走 UI/UX 新出标题图，或经 UI/UX 明确批准的替代字体方案。

### 3.3 Tab Bar

| 资产 | 尺寸 | 大小 | 格式 | 透明 | 用途 | 使用方式 |
| --- | --- | ---: | --- | --- | --- | --- |
| `cuts/pr-cs008ar-tabbar-bg-750x110.png` | `750x110` | `90,128` | PNG | 否 | 纹理 tab bar 背板 | 顶部四 tab 底板；不可用纯色替代 |
| `cuts/pr-cs008ar-tab-active-underline.png` | `108x24` | `283` | PNG | 是 | 选中态下划暖光 | 固定置于选中 tab 下方；禁止用 border-bottom 替代 |

### 3.4 左侧时间线

| 资产 | 尺寸 | 大小 | 格式 | 透明 | 用途 | 使用方式 |
| --- | --- | ---: | --- | --- | --- | --- |
| `cuts/pr-cs008ar-timeline-rail.png` | `72x1180` | `3,261` | PNG | 是 | 主轨 + 串珠发光 | 左列主轨；可纵向裁切，不可横向压扁 |
| `cuts/pr-cs008ar-node-camera.png` | `76x76` | `3,869` | PNG | 是 | 相机节点 | 拍照事件节点 |
| `cuts/pr-cs008ar-node-debt.png` | `76x76` | `5,009` | PNG | 是 | 欠酒节点 | 欠酒事件节点 |
| `cuts/pr-cs008ar-node-drink.png` | `76x76` | `4,521` | PNG | 是 | 加酒节点 | 加酒事件节点 |
| `cuts/pr-cs008ar-node-comment.png` | `76x76` | `3,748` | PNG | 是 | 评论节点 | 评论/句子节点 |

### 3.5 照片装饰

| 资产 | 尺寸 | 大小 | 格式 | 透明 | 用途 | 使用方式 |
| --- | --- | ---: | --- | --- | --- | --- |
| `cuts/pr-cs008ar-polaroid-frame.png` | `430x360` | `376,202` | PNG | 是 | 拍立得/纸质照片框 | 照片内容放入中间窗；禁止拉伸变形 |
| `cuts/pr-cs008ar-tape-purple.png` | `112x68` | `668` | PNG | 是 | 紫色胶带装饰 | 固定贴在照片右上角或边角 |
| `cuts/pr-cs008ar-sticker-smile-coin.png` | `92x92` | `684` | PNG | 是 | 笑脸硬币贴纸 | 放首张照片右上 |
| `cuts/pr-cs008ar-sticker-star-outline.png` | `74x74` | `453` | PNG | 是 | 星标贴纸 | 放第二张照片角落 |

### 3.6 账本霓虹牌

| 资产 | 尺寸 | 大小 | 格式 | 透明 | 用途 | 使用方式 |
| --- | --- | ---: | --- | --- | --- | --- |
| `cuts/pr-cs008ar-neon-debt-plus1.png` | `250x116` | `8,874` | PNG | 是 | 欠酒 `+1` 完整牌 | 当前样本固定牌 |
| `cuts/pr-cs008ar-neon-drink-plus2.png` | `250x116` | `8,564` | PNG | 是 | 加酒 `+2` 完整牌 | 当前样本固定牌 |
| `cuts/pr-cs008ar-neon-plate-debt-base.png` | `250x116` | `6,048` | PNG | 是 | 欠酒霓虹牌底 | 若后续 delta 改值，只允许在此底图安全区换短文本 |
| `cuts/pr-cs008ar-neon-plate-drink-base.png` | `250x116` | `5,906` | PNG | 是 | 加酒霓虹牌底 | 若后续 delta 改值，只允许在此底图安全区换短文本 |

### 3.7 评论/句子节点装饰

| 资产 | 尺寸 | 大小 | 格式 | 透明 | 用途 | 使用方式 |
| --- | --- | ---: | --- | --- | --- | --- |
| `cuts/pr-cs008ar-shell-comment-deco.png` | `110x82` | `622` | PNG | 是 | 贝壳装饰 | 评论节点右侧装饰 |
| `cuts/pr-cs008ar-handdrawn-marker.png` | `150x40` | `313` | PNG | 是 | 手绘标记线 | 用于评论或强调句装饰 |

### 3.8 底部 CTA

| 资产 | 尺寸 | 大小 | 格式 | 透明 | 用途 | 使用方式 |
| --- | --- | ---: | --- | --- | --- | --- |
| `cuts/pr-cs008ar-cta-paper-button.png` | `640x146` | `184,795` | PNG | 是 | “继续拍照”按钮默认态底 | 底部主按钮，只允许居中文字和相机图标 |
| `cuts/pr-cs008ar-cta-paper-button-pressed.png` | `640x146` | `181,341` | PNG | 是 | 按下态底 | pointer/press 态切换 |
| `cuts/pr-cs008ar-icon-camera-cta.png` | `68x68` | `386` | PNG | 是 | CTA 相机 icon | 放按钮左侧 |

### 3.9 空态/加载/失败

| 资产 | 尺寸 | 大小 | 格式 | 透明 | 用途 | 使用方式 |
| --- | --- | ---: | --- | --- | --- | --- |
| `cuts/pr-cs008ar-state-empty.png` | `420x260` | `14,491` | PNG | 是 | 整页空态 | 无图片/无事件时用 |
| `cuts/pr-cs008ar-state-loading-spinner.png` | `220x220` | `5,594` | PNG | 是 | 加载态 | 叠加在暗底中央 |
| `cuts/pr-cs008ar-state-photo-failed.png` | `360x300` | `5,827` | PNG | 是 | 图片失败态 | 替代纯 broken icon |
| `cuts/pr-cs008ar-state-ledger-empty.png` | `360x180` | `7,779` | PNG | 是 | 账本无数据态 | 账本区无数据时使用 |

## 4. 前端复刻标注

### 4.1 固定层级

1. `record-page-bg`
2. `hero-bg`
3. hero 信息层：状态 pill / 标题 / meta / 圆形按钮 / 标题贴纸
4. `tabbar-bg`
5. `tab-active-underline`
6. 时间线主轨 `timeline-rail`
7. 节点 icon
8. 照片框 / 贴纸 / 霓虹牌 / 评论装饰
9. CTA 与状态层

### 4.2 容器比例

| 区域 | 比例/尺寸建议 |
| --- | --- |
| 整页背景 | `750:1600` |
| Hero | `750:420` |
| Tab bar | `750:110` |
| 时间线轨道列 | 宽 `56-72px` |
| 拍立得 | 目标宽 `300-360px`，按 `430:360` 等比 |
| 霓虹牌 | 目标宽 `180-250px`，按 `250:116` 等比 |
| CTA | 目标宽 `560-640px`，按 `640:146` 等比 |

### 4.3 九宫格/拉伸禁区

| 资产 | 规则 |
| --- | --- |
| `record-page-bg` | 禁止九宫格；整图等比填充 |
| `hero-bg` | 禁止九宫格；整图等比填充 |
| `tabbar-bg` | 可水平轻拉伸；上下边缘纹理不得裁掉 |
| `timeline-rail` | 仅允许纵向裁切；禁止横向拉伸 |
| `polaroid-frame` | 禁止拉伸；仅允许整体等比缩放 |
| `neon-plate-*` | 允许横向 9-slice，保留四角发光边框；中段安全拉伸 |
| `cta-paper-button*` | 允许横向 9-slice；左右圆角与顶部高光为禁区 |
| `status-pill` | 允许轻微横向 9-slice；圆角和绿点不可被裁 |

## 5. 验收红线

- 不接受旧 `live-photo-wall + live-ledger-timeline` 双分段旧壳。
- 不接受普通 badge 替代霓虹牌。
- 不接受纯文字替代拍立得/评论装饰/时间线节点。
- 不接受 CSS 渐变或阴影自行仿造背景、按钮、贴纸和霓虹。
- 不接受把 `sessionName` 用普通字重直接顶上去，却不使用标题样本图或 UI/UX 明确批准的替代方案。

## 6. 前端只允许的自由度

- 运行态填充真实数据：`sessionName`、人数、开始时间、节点时间、评论文字、照片内容。
- 在明确允许的资产上做等比缩放或有限横向 9-slice。
- 无权新增视觉元素、修改贴纸摆位逻辑、重画状态或自行补光效。

## 7. 008AU 紧凑密度追加规格

对应任务：`PR-UX-LINK-CLEANUP-008AU-RECORD-TIMELINE-COMPACT-DENSITY-SPEC`

### 7.1 必删外部框

- 删除照片节点外层大卡/整块包裹层；保留 `pr-cs008ar-polaroid-frame.png` 自身相框，不再额外套一层深色卡片。
- 删除账本事件外框卡；保留时间线轨道、节点 icon、霓虹牌本体和必要事件文案。
- 删除评论节点外围无意义包裹层；只保留评论文案、评论节点 icon、贝壳/手绘装饰。
- 删除导致节点纵向被拉长的空白占位层、统一 section wrapper、厚 padding 容器。

### 7.2 390 宽预览框缩放范围

| 元素 | 008AU 建议尺寸 |
| --- | --- |
| Hero 区高度 | `220-250px` |
| 标题图宽度 | `250-300px` |
| 状态 pill | 高 `36-42px`，左边距至少 `16px`，不得裁切 |
| Tab bar 高度 | `72-84px` |
| 时间线轨道列宽 | `44-56px` |
| 节点 icon | `52-60px` |
| 照片节点整体宽度 | `190-228px` |
| 拍立得相框 | 宽 `190-228px`，按 `430:360` 等比 |
| 欠酒/加酒霓虹牌 | 宽 `136-180px`，按 `250:116` 等比 |
| 胶带/贴纸 | 宽度为对应照片节点宽度的 `14%-22%`，不得放大成主视觉 |
| CTA 宽度 | `320-350px`，按 `640:146` 等比 |
| CTA 高度 | `72-84px` |

### 7.3 纵向密度目标

- 首屏必须同时看到：Hero、Tab、1 个照片节点、1 个账本节点起始。
- 单次正常滚动后，必须能连续看到 `照片 + 欠酒 + 加酒` 三类有效内容，不允许四个节点就拉满一整屏半。
- 节点间主间距控制在 `16-24px`；时间点文案与节点 icon 的纵向间距控制在 `8-12px`。
- 不允许通过加大外框和留白制造“高级感”；当前目标是紧凑、可扫读、下滑不累。

### 7.4 Hero / 标题修正

- 标题图亮度必须明显高于当前退回态；在深色 Hero 上应达到“第一眼可读”，不允许偏灰、偏糊、偏暗。
- 状态 pill 左侧必须完整显示，最小可见边距 `>=16px`，不得被安全区或父容器裁切。
- Hero 层级应更接近验收图：顶部背景亮点 > 状态与标题 > meta > tab，不允许 Hero 被压成一层平暗底。

### 7.5 加酒牌规则

- 不允许只显示空绿框；必须显示 `加酒 +1`、`加酒 +2` 或真实 delta。
- 已补可直接引用资产：`cuts/pr-cs008au-neon-drink-plus1.png`
- 当前可复用：
  - `cuts/pr-cs008ar-neon-drink-plus2.png`
  - `cuts/pr-cs008au-neon-drink-plus1.png`
  - `cuts/pr-cs008ar-neon-plate-drink-base.png` 仅供后续短文本安全替换，不得退化为空框

### 7.6 账本 tab 数据验收

- 账本 tab 不得显示全员 `0/0/0` 壳层；数值必须与 `ledger event data` 和独立账本页一致。
- 若当前链路拿不到真实值，只能判定待联调/退回，不得用 0 值假通过。
- 账本 tab 行项仍需保留头像/用户名/可编辑角色边界，不能因为紧凑布局删除真实账本信息。
