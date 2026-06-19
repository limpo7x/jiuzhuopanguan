# PR-UX-CLEAN-SLATE-001 Figma 基线资产清单

更新时间：2026-06-18

来源：Figma 文件 `https://www.figma.com/design/b2OwhvsJ6pe3fa0yrDQNmA`，页面 `聚会记录师 全流程原型 初始构思`。

本目录只保存 UI/UX 复核用基线截图和资产清单，不代表前端实现通过。

| 文件 | Figma node | 尺寸 | 用途 | 前端接入说明 |
| --- | --- | --- | --- | --- |
| `figma-08-share-poster.png` | `11:97` / `08 分享海报 \| pages/share-poster/index` | 390x844 PNG | 分享海报页面与保存图构图基线 | 作为 1:1 视觉对照，不整图入包；前端需用真实照片、账本、事件、总结重建 |
| `figma-09-share-preview.png` | `11:103` / `09 分享回流 \| pages/share-preview/index` | 390x844 PNG | 分享回流页层级基线 | 作为浅色回流页结构对照，不整图入包 |
| `figma-12-failed-privacy-state.png` | `11:121` / `12 失败/隐私状态 \| pages/share-poster/index?state=failed` | 390x844 PNG | 保存失败、重试、隐私状态基线 | 作为状态页结构对照，不整图入包 |
| `ASSET_PACK_002.md` | - | Markdown | 前端可接入资产包规格 | 记录命名空间、切图、旧 020 处理和页面资源对照 |

## PR-UX-CLEAN-SLATE-ASSET-PACK-002

前端可直接接入的切图源文件位于 `cuts/`，统一使用 `pr-cs002-*` 命名空间。

| 文件 | 尺寸 | 格式 | 用途 | 建议入包路径 |
| --- | --- | --- | --- | --- |
| `cuts/pr-cs002-stage-glow.svg` | 390x844 | SVG | 分享页暗色背景光效 | `miniprogram/assets/party-recorder/clean-slate/pr-cs002-stage-glow.svg` |
| `cuts/pr-cs002-poster-glow-1080.svg` | 1080x1920 | SVG | 保存分享图海报底纹 | `miniprogram/assets/party-recorder/clean-slate/pr-cs002-poster-glow-1080.svg` |
| `cuts/pr-cs002-photo-polaroid-frame.svg` | 180x216 | SVG | 照片墙相框 / 空态参考 | `miniprogram/assets/party-recorder/clean-slate/pr-cs002-photo-polaroid-frame.svg` |
| `cuts/pr-cs002-ledger-badge.svg` | 128x128 | SVG | 聚会账本高光 icon | `miniprogram/assets/party-recorder/clean-slate/pr-cs002-ledger-badge.svg` |
| `cuts/pr-cs002-qr-safe-plate.svg` | 360x176 | SVG | 二维码/房间码浅底安全区 | `miniprogram/assets/party-recorder/clean-slate/pr-cs002-qr-safe-plate.svg` |
| `cuts/pr-cs002-button-shine.svg` | 320x112 | SVG | 主按钮高光底参考 | `miniprogram/assets/party-recorder/clean-slate/pr-cs002-button-shine.svg` |
| `cuts/pr-cs002-privacy-shield.svg` | 112x112 | SVG | 隐私/公开过滤提示 | `miniprogram/assets/party-recorder/clean-slate/pr-cs002-privacy-shield.svg` |
| `cuts/pr-cs002-retry-spark.svg` | 112x112 | SVG | 保存失败/重新生成状态 | `miniprogram/assets/party-recorder/clean-slate/pr-cs002-retry-spark.svg` |

## Clean Slate 资产规则

- 旧 `report-poster.png`、旧 `assets/share`、旧 generated share task 图片、旧红色战报壳、旧邀请壳不得再入包。
- 旧 `share-flow-015` 资产只能作为历史参考；Clean Slate 第一优先级改为 Figma `聚会记录师 全流程原型 初始构思`。
- 若需要继续使用 020 的 6 个 SVG，必须改名/复核后作为 Clean Slate 辅助贴纸，不得带旧退回任务语义或旧战报框。
- 新分享图不贴整张 Figma PNG；必须以真实数据动态渲染照片墙、聚会账本、时间线、总结、公开范围和二维码/房间码安全区。
