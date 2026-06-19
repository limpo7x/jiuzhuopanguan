# PR-UX-SHARE-FLOW-SKILL-PAGES-015 分享流程设计包

生成时间：2026-06-17

本目录存放“聚会记录师”分享流程目标图。该设计包用于前端复刻、接口联调造数、测试预览框验收和 UGC 风控过滤复核，不代表源码已实现，也不代表测试或 UI/UX 通过。

## 1. 生成资产

| 序号 | 资产 | 尺寸 | 大小 | 覆盖页面 / 状态 | 入包建议 |
| --- | --- | --- | --- | --- | --- |
| 1 | `pr-ux-share-flow-015-01-share-entry-panel.png` | 853x1844 | 1683.1KB | 分享入口页 / 当前聚会分享面板：拍照记录 + 聚会账本并列高光 | 仅作目标图，不整图入包 |
| 2 | `pr-ux-share-flow-015-02-share-preview-fusion.png` | 853x1844 | 1814.3KB | 分享预览页：照片墙、欠酒/已喝、关键事件、榜单高光、聚会总结融合 | 仅作目标图，不整图入包 |
| 3 | `pr-ux-share-flow-015-03-save-poster-vertical.png` | 853x1844 | 1935.5KB | 竖版保存海报：照片墙 + 账本高光 + 事件 + 房间码/二维码安全区 | 仅作海报结构参考 |
| 4 | `pr-ux-share-flow-015-04-save-state-retry.png` | 853x1844 | 1556.3KB | 保存成功 / 保存失败 / 重新生成状态 | 仅作状态 UI 参考 |
| 5 | `pr-ux-share-flow-015-05-share-return-view.png` | 853x1844 | 1466.8KB | 分享回流查看页：公开范围、加入聚会、查看相册、打开账本摘要 | 仅作目标图，不整图入包 |

## 2. SKILL 使用记录

| SKILL | 使用方式 | 选择原因 | 使用边界 |
| --- | --- | --- | --- |
| `imagegen-frontend-mobile` | 生成 5 张移动端页面目标图 | 本任务需要 app-native、多屏一致、酷炫且可读的移动端分享流程 | 只生成目标图；不写代码；不把目标图当实现截图 |
| `imagegen` | 通过内置图像生成工具输出 raster 设计图 | 需要可视化资产交给前端和测试，而不是只写文字方案 | 生成后复制到项目目录；不直接入小程序包 |

## 3. Prompt 摘要

- 统一产品名：`聚会记录师`。
- 统一视觉方向：`Trendy Ledger Wall`。
- 项目基因：聚会、酒局、朋友、桌面、碰杯、账本高光、照片回忆。
- 核心内容：拍照记录 + 酒桌记账 / 聚会账本双主线，并共同导出分享页和保存海报。
- 关键模块：照片墙、欠酒 / 已喝 / 加酒、关键事件、榜单/高光、聚会总结、二维码/房间码安全区、隐私过滤提示。
- 避免方向：旧“判官 / 惩罚 / 裁判”压迫感、普通列表截图、空海报壳、不可读小字、泛蓝紫模板风。

## 4. 前端复刻边界

1. 这些 PNG 是视觉目标图，不建议整图进入小程序包。
2. 前端应复刻结构、色彩、层级、动效方向和状态，而不是直接贴整图。
3. 分享页和保存图必须用真实字段渲染：照片墙、账本高光、关键事件、聚会总结、二维码/房间码。
4. 账本字段缺失时不得用假数据伪造通过；应展示明确空态并退回接口联调补样本。
5. 二维码、房间码、保存按钮和隐私提示必须保持高对比、无遮挡。

## 5. 待证据缺口

- 缺真实 `photoHighlights` / 照片墙样本。
- 缺真实 `accountingHighlights` / 聚会账本样本。
- 缺 `keyEvents` / 关键事件样本。
- 缺 `shareSummary` / 聚会总结字段。
- 缺保存图 PNG 原图与预览框一致性证据。
- 缺 UGC 对照片和账本公开过滤的反例结论。

## 6. 020 前端可执行规格

`PR-UX-SHARE-FLOW-ASSET-SPEC-020` 已补充为独立资产规格：

- 规格文件：`docs/design-assets/party-recorder/share-flow-015/ASSET_SPEC_020.md`
- 贴纸 / 装饰源文件目录：`docs/design-assets/party-recorder/share-flow-015/cuts/`

020 规格覆盖字体/字重、色板、背景、贴纸、账本与照片融合组件、按钮状态、保存成功/失败/重试态、保存图安全区、切图清单、建议入包路径和 1:1 对照退回码。

新增 SVG 源文件：

| 资产 | 尺寸 | 用途 | 建议入包路径 |
| --- | --- | --- | --- |
| `cuts/pr-share020-sticker-starburst.svg` | 96x96 | 星星笑脸贴纸 | `miniprogram/assets/party-recorder/share-flow/pr-share020-sticker-starburst.svg` |
| `cuts/pr-share020-sticker-sparkle-coral.svg` | 96x96 | 珊瑚闪光贴纸 | `miniprogram/assets/party-recorder/share-flow/pr-share020-sticker-sparkle-coral.svg` |
| `cuts/pr-share020-sticker-tape-mint.svg` | 180x58 | 薄荷胶带贴纸 | `miniprogram/assets/party-recorder/share-flow/pr-share020-sticker-tape-mint.svg` |
| `cuts/pr-share020-ledger-badge.svg` | 112x112 | 账本徽章 | `miniprogram/assets/party-recorder/share-flow/pr-share020-ledger-badge.svg` |
| `cuts/pr-share020-underline-coral.svg` | 320x54 | 手绘下划线 | `miniprogram/assets/party-recorder/share-flow/pr-share020-underline-coral.svg` |
| `cuts/pr-share020-shield-mint.svg` | 96x96 | 隐私安全盾牌 | `miniprogram/assets/party-recorder/share-flow/pr-share020-shield-mint.svg` |
