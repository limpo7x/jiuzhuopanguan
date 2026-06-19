# PR-UX-SHARE-FLOW-ASSET-SPEC-020 前端可执行资产规格

更新时间：2026-06-17

本规格基于 `share-flow-015` 五张目标图拆解，用于前端 `PR-FE-SHARE-FLOW-PIXEL-MATCH-020` 1:1 复刻分享页和保存图。目标图仍只作参考，不建议整图入包。前端必须用真实照片、真实聚会账本、关键事件和聚会总结渲染，不得用假数据伪造通过。

## 1. SKILL 与依据

| SKILL | 使用理由 | 使用边界 |
| --- | --- | --- |
| `imagegen-frontend-mobile` | 015 五张目标图由该移动端多屏方向锁定，020 继续沿用其“app-native、多屏一致、可读、非模板、强图像叙事、安全区明确”的口径拆规格 | 本次不再生成新整页图；只将既有目标图转成可执行 token、组件和切图要求 |

## 2. 字体与字重

不新增授权字体。小程序端使用系统字体栈：

```css
font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
```

| 用途 | 字号建议 | 字重 | 行高 | 说明 |
| --- | --- | --- | --- | --- |
| 海报主标题 | 52-64rpx | 800/900 | 1.12 | 只用于“今晚聚会高光”等主视觉标题，最多 2 行 |
| 页面标题 | 36-44rpx | 700/800 | 1.2 | 分享预览、保存海报、分享回流 |
| 大数字 | 64-96rpx | 800/900 | 1 | 欠酒/已喝/账本条数，必须明显强于说明文字 |
| 模块标题 | 28-34rpx | 700 | 1.25 | 照片墙、聚会账本、关键时刻 |
| 正文/说明 | 24-28rpx | 400/500 | 1.45 | 隐私提示、状态说明 |
| 按钮 | 30-36rpx | 700/800 | 1.2 | 主按钮不小于 30rpx |
| 辅助标签 | 20-24rpx | 500/600 | 1.25 | 仅用于时间、状态 chip，不能承载关键字段 |

## 3. 色板

| Token | 色值 | 用途 | 不允许 |
| --- | --- | --- | --- |
| `--share-bg-deep` | `#090705` | 分享预览、保存状态暗色舞台底 | 作为全站底色 |
| `--share-bg-warm` | `#1A100B` | 酒局桌面暗部、卡片底 | 压低文字对比 |
| `--share-paper` | `#FFF4DE` | 账本纸、二维码安全区、海报备注纸 | 与白卡旧壳混用成普通列表 |
| `--share-coral` | `#FF5A3D` | 主 CTA、手绘下划线、拍照高光 | 大面积铺满全部模块 |
| `--share-coral-soft` | `#FFB1A0` | 拍照数字、照片边框弱高光 | 低对比小字 |
| `--share-mint` | `#63DFAE` | 已喝、安全/授权、成功状态 | 与成功/权限状态语义混乱 |
| `--share-blue` | `#3C8DFF` | 聚会账本、账本条数、重试状态 | 变成泛蓝紫模板主色 |
| `--share-amber` | `#FFC75A` | 加酒、星星贴纸、榜单高光 | 过量造成廉价感 |
| `--share-text-main` | `#FFF8EC` | 暗底主文字 | 小于 4.5:1 对比 |
| `--share-text-dark` | `#2A1C13` | 纸面/亮底文字 | 用于暗底 |
| `--share-line-soft` | `rgba(255, 244, 222, 0.22)` | 暗底细描边 | 做厚边框旧卡 |

## 4. 背景与表面

| 层级 | 规格 | 前端实现 |
| --- | --- | --- |
| 全屏背景 | 暗色酒桌/聚会灯光氛围 + 轻噪点，边缘压暗，中部保留内容可读区域 | 优先 CSS 渐变 + 现有照片/服务端图模糊层；无图时用 `#090705` 到 `#1A100B` 径向渐变 |
| 海报保存区 | 竖版黑金海报，内部有照片墙、霓虹账本条、事件时间线、纸片总结、二维码纸块 | canvas / 原生节点按模块渲染；不贴整张 015 PNG |
| 账本纸 | 米白纸面、轻网格/点纹、左侧装订或虚线 | CSS repeating-linear-gradient；无额外 bitmap |
| 照片墙 | 4-6 张拍立得照片，轻微旋转但主体不裁切 | 每张固定比例，白边 8-12rpx，阴影轻，旋转角度不超过 6deg |
| 贴纸 | 星星、胶带、手绘下划线、盾牌安全标 | 使用本目录 `cuts/*.svg` 或 CSS 线条；不得遮挡二维码/房间码/CTA |

## 5. 账本与照片融合组件

| 组件 | 结构 | 关键尺寸 | 字段映射 | 1:1 退回码 |
| --- | --- | --- | --- | --- |
| 双高光入口卡 | 左侧照片记录，右侧聚会账本；同等宽度；数字大于标题 | 卡高 360-420rpx，双列 gap 24rpx | `photoCount`、`ledgerCount`、`lastPhotoAt`、`accountingHighlights` | `PR-FE-SHARE020-P0-DUAL-HIGHLIGHT-MISSING` |
| 照片墙 | 4-6 张照片横向叠放，最多两层 | 单张 128-180rpx 宽；白边 8-12rpx | `photoHighlights[]` | `PR-FE-SHARE020-P0-PHOTO-WALL-MISSING` |
| 账本霓虹条 | 欠酒、已喝、加酒、账本/人均 3-4 项并列 | 条高 150-190rpx；数字 64rpx+ | `accountingHighlights`、`ledgerSummary`、`settlementSummary` | `PR-FE-SHARE020-P0-LEDGER-STRIP-MISSING` |
| 关键时刻 | 3 条以内时间线，图标 + 时间 + 标题 + 缩略图可选 | 单条 96-128rpx；图标 56-72rpx | `keyEvents[]`、`eventHighlights[]` | `PR-FE-SHARE020-P1-EVENT-HIERARCHY` |
| 聚会总结纸条 | 手写感纸条区域，1 句总结 | 高 90-140rpx；正文 32-42rpx | `shareSummary` | `PR-FE-SHARE020-P1-SUMMARY-WEAK` |
| 回流安全提示 | 公开范围 + 可见内容说明 + 行动入口 | 高 120-160rpx | `visibilityScope`、`allowedActions[]` | `PR-FE-SHARE020-P0-SCOPE-MISSING` |

## 6. 按钮状态

| 按钮 | 默认 | 按下 | 禁用/加载 | 失败/重试 |
| --- | --- | --- | --- | --- |
| 主 CTA `生成酷炫分享页` / `保存到相册` | coral 渐变 `#FF5A3D -> #FF7A3D`，圆角 36-44rpx，高 96-112rpx，白字 32rpx+ | 整体缩放 0.98，亮度降低 6% | 透明度 0.55，显示 loading 文案，不隐藏按钮 | 保持 coral，文案改“重新保存/重新生成” |
| 分享按钮 | coral -> pink 或 mint 绿色，图标 + 文案 | 同主 CTA | loading 时保留按钮宽高 | 失败时降为次级，不抢重试 |
| 次级按钮 | 透明暗底 + 1px 高对比描边 | 背景加深 | 禁用透明度 0.45 | 不能只用灰字 |
| 状态动作 | 成功 mint、权限失败 amber、生成失败 blue | 按状态色轻缩放 | 禁用保留说明 | 必须有“去开启/重新生成/重新保存” |

## 7. 保存状态

| 状态 | 必须展示 | 视觉 |
| --- | --- | --- |
| 保存成功 | 海报缩略图、保存成功、可分享给好友、已保存路径/状态 | mint 图标、绿色描边状态卡 |
| 权限失败 | 权限未开启、原因说明、去开启 | amber 锁图标，不能只 toast |
| 生成失败 | 生成过程出现问题、检查网络或稍后重试、重新生成 | blue 重试图标，按钮明显 |
| 保存失败 | 保存失败、重新保存、权限说明入口 | coral 主重试按钮 + 次级权限说明 |

## 8. 保存图安全区

保存图建议导出 `1080x1920` PNG。若沿现有 canvas 比例，也必须保持以下安全区：

| 区域 | 安全区 |
| --- | --- |
| 顶部标题 | 距海报顶边 >= 96px，不贴状态栏；标题最多 2 行 |
| 左右边距 | 视觉内容距海报左右 >= 48px；二维码纸块距右边 >= 56px |
| 二维码 | 最小 180x180px，周围 24px 浅底留白；不得被贴纸、阴影、按钮遮挡 |
| 房间码 | 字高 >= 64px，字母数字对比强；不可放在繁忙照片上 |
| 底部安全提示 | 距海报底边 >= 48px；不能与微信 home indicator 或保存按钮重叠 |
| 保存按钮 | 在 poster 外部固定，不进入导出的海报安全区 |

## 9. 切图清单与建议入包路径

| 资产 | 源文件路径 | 尺寸 | 格式 | 压缩 | 建议入包路径 | 用途 |
| --- | --- | --- | --- | --- | --- | --- |
| 星星笑脸贴纸 | `docs/design-assets/party-recorder/share-flow-015/cuts/pr-share020-sticker-starburst.svg` | 96x96 | SVG | 原样，建议 gzip | `miniprogram/assets/party-recorder/share-flow/pr-share020-sticker-starburst.svg` | 照片墙/入口页点缀 |
| 珊瑚闪光 | `docs/design-assets/party-recorder/share-flow-015/cuts/pr-share020-sticker-sparkle-coral.svg` | 96x96 | SVG | 原样，建议 gzip | `miniprogram/assets/party-recorder/share-flow/pr-share020-sticker-sparkle-coral.svg` | 标题侧、状态卡点缀 |
| 薄荷胶带 | `docs/design-assets/party-recorder/share-flow-015/cuts/pr-share020-sticker-tape-mint.svg` | 180x58 | SVG | 原样，建议 gzip | `miniprogram/assets/party-recorder/share-flow/pr-share020-sticker-tape-mint.svg` | 拍立得照片角贴 |
| 账本徽章 | `docs/design-assets/party-recorder/share-flow-015/cuts/pr-share020-ledger-badge.svg` | 112x112 | SVG | 原样，建议 gzip | `miniprogram/assets/party-recorder/share-flow/pr-share020-ledger-badge.svg` | 账本模块 icon |
| 手绘下划线 | `docs/design-assets/party-recorder/share-flow-015/cuts/pr-share020-underline-coral.svg` | 320x54 | SVG | 原样，建议 gzip | `miniprogram/assets/party-recorder/share-flow/pr-share020-underline-coral.svg` | 主标题/总结强调 |
| 安全盾牌 | `docs/design-assets/party-recorder/share-flow-015/cuts/pr-share020-shield-mint.svg` | 96x96 | SVG | 原样，建议 gzip | `miniprogram/assets/party-recorder/share-flow/pr-share020-shield-mint.svg` | 隐私/授权提示 |
| 背景氛围 | 无新增 bitmap | - | CSS | - | 不入包 | 用 CSS 渐变 + 真实照片模糊层实现 |
| 字体 | 系统字体栈 | - | 系统字体 | - | 不入包 | 避免授权风险 |

## 10. 1:1 对照退回码

| 退回码 | 分级 | 触发条件 |
| --- | --- | --- |
| `PR-FE-SHARE020-P0-OLD-SHELL` | P0 | 分享页/保存图仍沿用旧白卡、旧邀请壳、旧战报框，未形成 015 目标图的照片 + 账本融合视觉 |
| `PR-FE-SHARE020-P0-DUAL-HIGHLIGHT-MISSING` | P0 | 分享入口或预览未同时突出拍照记录与聚会账本 |
| `PR-FE-SHARE020-P0-PHOTO-WALL-MISSING` | P0 | 没有照片墙/照片高光，或照片区域只显示空壳且无明确拍照 CTA |
| `PR-FE-SHARE020-P0-LEDGER-STRIP-MISSING` | P0 | 欠酒/已喝/账本条数等账本高光缺失或被弱化到不可见 |
| `PR-FE-SHARE020-P0-POSTER-SAFE-AREA` | P0 | 保存海报二维码、房间码、标题、保存安全提示不可读或被遮挡 |
| `PR-FE-SHARE020-P0-STATE-RECOVERY-MISSING` | P0 | 保存成功/权限失败/生成失败/重试态缺页面内恢复入口 |
| `PR-FE-SHARE020-P1-TYPOGRAPHY-SCALE` | P1 | 字体层级未按规格，大数字、标题和正文权重混乱 |
| `PR-FE-SHARE020-P1-STICKER-OVERUSE` | P1 | 贴纸/光效过多，遮挡内容或造成廉价感 |
| `PR-FE-SHARE020-P1-EVENT-HIERARCHY` | P1 | 关键事件超过 3 条或时间线挤压照片墙/账本主模块 |
| `PR-FE-SHARE020-P2-MICRO-POLISH` | P2 | 间距、阴影、圆角、文案细节与目标图仍有轻微差距 |

## 11. 仍需协作

- 前端：按本规格执行 `PR-FE-SHARE-FLOW-PIXEL-MATCH-020`，不得整图贴 PNG，不得造假数据。
- 接口联调：恢复/替换 019 线程后提供样本成员 storage，使 ready 成员态能看到真实照片和账本。
- 测试：执行 `PR-QA-DEBUGGER-CONSOLE-WATCH-020`，截图必须带 page/data/storage/console/network 摘要。
- UGC：继续给公开范围、私密照片和敏感账本备注过滤口径。
