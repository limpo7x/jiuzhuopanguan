# PR-UX-CLEAN-SLATE-ASSET-PACK-002 前端接入资产包规格

更新时间：2026-06-18

本资产包只服务 Clean Slate 新流程，基线为 Figma `聚会记录师 全流程原型 初始构思`。所有文件使用 `pr-cs002-*` 命名空间，与旧 `share-flow-015`、`share020-*`、旧 `assets/share` 隔离。

## 1. SKILL 与边界

| SKILL | 使用理由 | 使用边界 |
| --- | --- | --- |
| Product Design / `get-context` | 第一轮已锁定 Figma `聚会记录师 全流程原型 初始构思` 为唯一新流程基线 | 本轮不重新定义 IA，只拆前端可接入资产包 |
| `figma-use` | 第一轮已读取 Figma frame 与分享页节点，本轮沿用 node `11:97`、`11:103`、`11:121` | 不修改 Figma 文件 |
| `imagegen-frontend-mobile` | 用于约束移动端海报、回流页、失败态的可读层级、照片墙、状态完整和安全区 | 不生成新整页图 |
| `imagegen` | 本轮不使用；当前资产可用 SVG/CSS 确定性完成 | 若后续需要真实桌面纹理 WebP，再单独生成 |

## 2. 命名空间规则

| 项 | 规则 |
| --- | --- |
| 设计资产目录 | `docs/design-assets/party-recorder/clean-slate-001/` |
| 切图源目录 | `docs/design-assets/party-recorder/clean-slate-001/cuts/` |
| 文件前缀 | `pr-cs002-` |
| 建议入包路径 | `miniprogram/assets/party-recorder/clean-slate/` |
| 禁止混用 | 不得直接引用 `docs/design-assets/party-recorder/share-flow-015/cuts/pr-share020-*`、旧 `assets/share`、旧 generated share task 图片 |
| 可复用方式 | 旧 020 SVG 只能按语义重画或复制后改名为 `pr-cs002-*`，并重新登记用途 |

## 3. 文件清单

| 文件 | 尺寸 | 格式 | 压缩 | 建议入包路径 | 用途 |
| --- | --- | --- | --- | --- | --- |
| `figma-08-share-poster.png` | 390x844 | PNG | 仅文档参考，不入包 | 不入包 | Figma 分享海报对照图 |
| `figma-09-share-preview.png` | 390x844 | PNG | 仅文档参考，不入包 | 不入包 | Figma 分享回流对照图 |
| `figma-12-failed-privacy-state.png` | 390x844 | PNG | 仅文档参考，不入包 | 不入包 | Figma 失败/隐私态对照图 |
| `cuts/pr-cs002-stage-glow.svg` | 390x844 | SVG | gzip | `miniprogram/assets/party-recorder/clean-slate/pr-cs002-stage-glow.svg` | 分享页暗色背景光效 |
| `cuts/pr-cs002-poster-glow-1080.svg` | 1080x1920 | SVG | gzip；若转 WebP 目标 <= 240KB | `miniprogram/assets/party-recorder/clean-slate/pr-cs002-poster-glow-1080.svg` | 保存分享图海报底纹 |
| `cuts/pr-cs002-photo-polaroid-frame.svg` | 180x216 | SVG | gzip | `miniprogram/assets/party-recorder/clean-slate/pr-cs002-photo-polaroid-frame.svg` | 照片墙空态/相框遮罩参考 |
| `cuts/pr-cs002-ledger-badge.svg` | 128x128 | SVG | gzip | `miniprogram/assets/party-recorder/clean-slate/pr-cs002-ledger-badge.svg` | 聚会账本高光 icon |
| `cuts/pr-cs002-qr-safe-plate.svg` | 360x176 | SVG | gzip | `miniprogram/assets/party-recorder/clean-slate/pr-cs002-qr-safe-plate.svg` | 二维码/房间码浅底安全区 |
| `cuts/pr-cs002-button-shine.svg` | 320x112 | SVG | gzip | `miniprogram/assets/party-recorder/clean-slate/pr-cs002-button-shine.svg` | 主按钮高光底，可 CSS 复刻 |
| `cuts/pr-cs002-privacy-shield.svg` | 112x112 | SVG | gzip | `miniprogram/assets/party-recorder/clean-slate/pr-cs002-privacy-shield.svg` | 隐私/公开过滤提示 |
| `cuts/pr-cs002-retry-spark.svg` | 112x112 | SVG | gzip | `miniprogram/assets/party-recorder/clean-slate/pr-cs002-retry-spark.svg` | 保存失败/重新生成状态 |

## 4. 分享流程切图 / 规格表

| 模块 | 资源 | 尺寸 / 安全区 | 图层 | 状态 |
| --- | --- | --- | --- | --- |
| 分享海报背景 | `pr-cs002-stage-glow.svg` | 页面 390x844，cover 填充 | `background` 层，低于全部内容 | ready / loading / failed 共用 |
| 保存图背景 | `pr-cs002-poster-glow-1080.svg` | 保存图 1080x1920；内容距边 >= 48px | poster 最底层 | ready PNG / canvas fallback |
| 照片墙 | 真实照片 + `pr-cs002-photo-polaroid-frame.svg` 空态参考 | 3-6 张；单张 128-180rpx；旋转 <= 6deg | 背景之上，账本同级 | ready 有真实图；empty 显示拍照 CTA，不能空洞 |
| 账本高光 | `pr-cs002-ledger-badge.svg` + CSS 霓虹数字条 | 条高 150-190rpx；数字 64-96rpx | 与照片墙同级 | ready / no-ledger 空态显示“记一笔” |
| 二维码安全区 | `pr-cs002-qr-safe-plate.svg` 或 CSS 浅色纸块 | QR >= 180px；quiet zone >= 24px；房间码字高 >= 64px | poster 底部安全区 | save-ready / return-view |
| 主按钮 | CSS 渐变优先；`pr-cs002-button-shine.svg` 可作底图参考 | 高 96-112rpx；圆角 32-44rpx；文字一行 | poster 外固定 CTA | default / pressed 0.98 / loading 保宽 / disabled 0.55 |
| 隐私提示 | `pr-cs002-privacy-shield.svg` | icon 48-64rpx；文案最多 2 行 | 安全提示卡左侧 | public / filtered / permission-needed |
| 失败重试 | `pr-cs002-retry-spark.svg` | icon 64-96rpx；按钮不低于 96rpx | 失败卡主视觉 | generating / save-failed / retry |

## 5. 旧 020 SVG 处理

| 旧文件 | 处理 | 原因 |
| --- | --- | --- |
| `pr-share020-sticker-starburst.svg` | 可按语义重画为 `pr-cs002-*` 后复用，不直接入包 | 星芒语义可用，但旧命名属于 020 修补线 |
| `pr-share020-sticker-sparkle-coral.svg` | 可重画，不直接入包 | 可作为轻装饰，不能再携带 020 命名 |
| `pr-share020-sticker-tape-mint.svg` | 暂不入包 | Figma clean slate 分享页不依赖胶带贴纸，避免贴纸过度 |
| `pr-share020-ledger-badge.svg` | 已由 `pr-cs002-ledger-badge.svg` 替代 | 账本徽章需要 Clean Slate 命名空间 |
| `pr-share020-underline-coral.svg` | 暂不入包 | 当前 Figma 不需要手绘下划线 |
| `pr-share020-shield-mint.svg` | 已由 `pr-cs002-privacy-shield.svg` 替代 | 隐私盾牌需要 Clean Slate 命名空间 |

## 6. 页面到资源 1:1 对照

| 页面 | 资源 | 图层 | 必备状态 |
| --- | --- | --- | --- |
| `pages/session-brief/index` | `pr-cs002-stage-glow.svg`、照片墙、账本高光 | 背景光效 -> 简报卡 -> 照片墙 -> 账本高光 -> CTA | ready / no-photo / no-ledger |
| `pages/share-poster/index` | `pr-cs002-stage-glow.svg`、`pr-cs002-poster-glow-1080.svg`、照片框、账本徽章、QR plate、button shine | 页面背景 -> poster 预览 -> 照片墙 -> 账本条 -> 时间线 -> 二维码安全区 -> 页面 CTA | generating / ready / save-success / save-failed |
| `pages/share-preview/index` | 浅色页面底 + `pr-cs002-privacy-shield.svg` + 照片墙/账本高光 | 顶部身份 -> 照片预览 -> 融合摘要 -> 公开范围 -> 加入 CTA | outsider / member / filtered |
| `pages/share-poster/index?state=failed` | `pr-cs002-stage-glow.svg`、`pr-cs002-retry-spark.svg`、`pr-cs002-privacy-shield.svg`、button shine | 背景 -> 状态列表 -> 失败卡 -> 重试/回相册按钮 | generating / permission-failed / save-failed / retry |

## 7. 仍缺素材 / 证据

- 缺真实聚会照片样本：前端/测试需要提供 3-6 张已授权公开照片用于照片墙截图。
- 缺真实二维码/房间码样本：保存图安全区需要实际 QR 或房间码截图验证。
- 缺前端入包后尺寸与包体增量：需前端回报实际路径、压缩方式和小程序包体变化。
- 缺保存 PNG 原图：测试必须拉取或保存原图，不得只截页面预览。
