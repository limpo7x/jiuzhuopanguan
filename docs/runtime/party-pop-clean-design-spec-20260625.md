# 聚会记录师 Clean-Room 前端设计规范

生成时间：2026-06-25

适用范围：miniprogram/app.json 注册的 21 个页面、这些页面直接使用的公共组件、登录授权弹层、确认弹窗、loading/toast 状态。

## Design Read

Reading this as: 微信小程序产品 UI 全量重做，面向年轻线下聚会用户，采用高对比卡通品牌语言，落在独立 pp-* 小程序设计系统上。

参数：DESIGN_VARIANCE 9，MOTION_INTENSITY 5，VISUAL_DENSITY 5。小程序端以稳定、清晰、可点击为先，使用触感反馈和轻量位移动效，不使用重滚动动画。

## 隔离规则

- 不引用 party-recorder-v2、party-recorder-rebuild、旧 CDN 主视觉、旧 WeUI/旧页面类名作为新规范依据。
- 用户可见新增文案统一“聚会记录师”。
- 历史“酒桌判官”只允许保留在旧代码名、旧数据、旧文档或技术迁移上下文。
- 分享图、相册、记录页不得使用假照片、假二维码、假成功状态。

## 参考图

- docs/runtime/party-pop-clean-20260625/functional-reference-01-main-flow.png
- docs/runtime/party-pop-clean-20260625/functional-reference-02-content-share.png
- docs/runtime/party-pop-clean-20260625/functional-reference-03-tools-state-dialog.png

## 色彩 Token

| Token | Hex | 用途 |
| --- | --- | --- |
| pp-ink | #111317 | 文字、描边、实色阴影 |
| pp-paper | #fffaf0 | 页面底色 |
| pp-white | #ffffff | 面板、输入框 |
| pp-coral | #ff504d | 主 CTA、危险确认、关键动作 |
| pp-cyan | #00cbff | 二级动作、工具和信息态 |
| pp-lime | #d3ff2d | Logo、选中态、成功态 |
| pp-yellow | #ffcd40 | 徽章、提示、强调 |

## 字号和行高

| 层级 | 字号 | 字重 | 行高 |
| --- | --- | --- | --- |
| 页面大标题 | 34px | 950 | 1.04 |
| 页面中标题 | 25px | 950 | 1.10 |
| 区块标题 | 19px | 950 | 1.22 |
| 列表主文 | 16px | 900 | 1.25 |
| 正文 | 14px | 500-750 | 1.50 |
| 辅助文案 | 12px | 700-850 | 1.42 |
| 底栏文字 | 11px | 850 | 1.00 |

## 间距

| 项 | 标准 |
| --- | --- |
| 页面左右边距 | 18px |
| 顶部内容起点 | 96px |
| 紧凑页顶部起点 | 84px |
| 底部安全留白 | 128px |
| Hero 内边距 | 18px |
| 面板内边距 | 18px |
| 列表行内边距 | 14px |
| 区块间距 | 16px |
| 卡片间距 | 14px |
| 按钮组间距 | 10px |

## 形态

| 元件 | 圆角 | 描边 | 阴影 |
| --- | --- | --- | --- |
| Logo | 18px | 4px ink | 6px ink |
| Hero | 30px | 4px ink | 8px ink |
| 面板 | 26px | 3px ink | 6px ink |
| 列表项 | 22px | 3px ink | 4px ink |
| 输入框 | 20px | 3px ink | 4px ink |
| 主按钮 | 999px | 3px ink | 5px ink |
| 底部导航 | 28px | 4px ink | 6px ink |
| 弹窗 | 28px | 4px ink | 8px ink |

## 按钮状态

| 状态 | 标准 |
| --- | --- |
| Primary | coral 背景、白字、3px 黑描边、5px 黑偏移 |
| Secondary | cyan 背景、黑字、3px 黑描边、5px 黑偏移 |
| Lime | lime 背景、黑字、用于确认和成功 |
| Ghost | paper/white 背景、黑字、黑描边 |
| Active | translateY(2px)，阴影收缩到 2px |
| Disabled | opacity 0.45，保留形体，不全灰 |
| Loading | 文案换为“提交中/刷新中/生成中”，禁止全页遮挡 |

## 页面模板

| 模板 | 页面 |
| --- | --- |
| Hero + CTA + 最近记录 | 首页 |
| 表单创建 | 创建聚会、工具详情 |
| 口令邀请 | 邀请好友、等待房间、分享预览 |
| 时间线记录 | live-record、session-brief、share-poster |
| Gallery 列表 | album、rankings、me 分享图 |
| 服务列表 | tools、feature-zones、me、settings、friend-hub |
| 状态空态 | invalid-state、privacy-state、compliance-guide |

## 弹层标准

- pp-dialog 固定居中，遮罩 rgba(17,19,23,0.55)，弹窗宽度 86vw，最大 340px。
- 标题 25px/950，正文 14px/1.5，按钮 48px 高。
- 危险确认使用 coral，取消使用 ghost。
- 登录授权使用 pp-auth-panel，头像按钮和昵称输入必须有清晰标签。
- Toast 使用 pp-toast 规范；原 wx.showToast 仍可保留为系统提示，但页面内不再出现旧视觉弹层。
