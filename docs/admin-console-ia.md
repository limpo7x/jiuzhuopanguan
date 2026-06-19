# 酒桌判官后台管理系统 IA

更新时间：2026-06-15

## 1. 当前后台定位

后台管理系统已经从静态设计稿升级为可登录、可读写数据的动态控制台。当前入口：

```text
https://api.pomer.cn/admin
```

本地入口：

```text
http://127.0.0.1:3010/admin
```

技术边界：

- 静态前端资源：`backend/public/admin/static/heatwave-ops/`
- 页面结构与数据工厂：`backend/data/admin.js`
- 管理数据：`backend/data/admin-store.json` / MySQL `app_store:admin_store`
- 内容配置：`backend/data/content-store.json` / MySQL `app_store:content_store`
- 社交数据：`backend/data/social-store.json` / MySQL `app_store:social_store`

## 2. 当前已实现能力

### 2.1 登录与会话

- `/admin` 自动判断登录态。
- 未登录跳转 `/admin/login`。
- 登录接口：`POST /api/v1/admin/auth/login`
- 会话接口：`GET /api/v1/admin/auth/session`
- 退出接口：`POST /api/v1/admin/auth/logout`

当前后台账号和角色存储在 `admin_store.adminUsers`、`admin_store.roles`。

### 2.2 动态页面

后台页面统一走：

- 页面 HTML：`/admin/pages/:slug`
- 页面数据：`GET /api/v1/admin/pages/:slug`
- 页面保存：`PUT /api/v1/admin/pages/:slug`

后台前端渲染逻辑在：

```text
backend/public/admin/static/heatwave-ops/app.js
```

### 2.3 图片上传

当前上传接口：

- `POST /api/v1/admin/uploads/image`
- 旧兼容接口：`POST /api/v1/admin/upload/home-hero`

上传资源默认落本地 `/uploads/*`，正式生产建议迁移到 OSS/COS/CDN。

## 3. 当前一级导航

当前后台实际导航：

1. 概览台
2. 内容运营
3. 用户与酒局
4. 商业化
5. 增长与数据
6. 系统设置

## 4. 当前页面清单

| 一级导航 | 页面 slug | 页面名称 | 状态 | 主要数据 |
| --- | --- | --- | --- | --- |
| 概览台 | `overview-dashboard` | 经营驾驶舱 | 已实现 | 用户、酒局、战报、商业指标聚合 |
| 内容运营 | `content-home-ops` | 首页装修 | 可写 | 首页 Hero、酒桌判官页主图、活动 Banner、快捷工具 |
| 内容运营 | `content-templates` | 酒局模板 | 可写 | 模板分类、模板列表、解锁卡 |
| 内容运营 | `content-question-bank` | 题库与任务 | 可写 | 题目内容、类型、难度、模板、风险、状态 |
| 内容运营 | `content-share-assets` | 分享素材 | 可写 | 战报海报、邀局卡、分享码 |
| 内容运营 | `content-tools-ops` | 工具箱运营 | 可写 | 工具分类、图片、热度、投放位置、状态 |
| 内容运营 | `content-moments-review` | 精彩瞬间审核 | 动作已接，待 E2E | 缩略图、文案、标签、酒局、上传者、补全状态、审核状态、二审状态、审核动作 |
| 内容运营 | `content-moment-reports` | 瞬间举报处理 | 动作已接，待真实样本 | 举报人、被举报瞬间、原因、处理状态、处理记录 |
| 用户与酒局 | `user-profiles` | 用户中心 | 可写 | 用户资料、OpenID、手机号、头像、积分、运营标签 |
| 用户与酒局 | `user-login-logs` | 用户登录记录 | 只读 | 微信登录记录、OpenID、手机号 |
| 用户与酒局 | `sessions` | 酒局管理 | 可写 | 酒局名称、人数、模板、判官、参与人、口令、状态 |
| 用户与酒局 | `reports` | 战报中心 | 可写 | 战报名称、模板、标题、亮点、分享率、状态 |
| 商业化 | `commerce-points` | 积分体系 | 可写 | 每日任务、积分商品、用户积分调整 |
| 商业化 | `commerce-point-ledger` | 积分变动记录 | 只读 | 用户积分流水 |
| 商业化 | `commerce-membership` | 会员体系 | 可写 | 会员总开关、套餐、权益 |
| 商业化 | `commerce-merchants` | 商户合作 | 可写 | 商户券、品类、库存、领取、核销、状态 |
| 商业化 | `commerce-ranking-rewards` | 榜单奖励配置 | 可写 | 榜单分类、启用状态、奖励名次、奖励积分、生效时间、修改原因 |
| 增长与数据 | `data-users` | 用户分析 | 只读 | 用户增长与活跃分析 |
| 增长与数据 | `data-content` | 内容分析 | 只读 | 模板、工具、分享表现 |
| 增长与数据 | `data-business` | 商业分析 | 只读 | 积分、会员、商户券指标 |
| 增长与数据 | `growth-share-tasks` | 分享图任务 | 动作已接，待 failed/expired 样本 | 任务状态、简报、节点数、耗时、失败原因、图片 URL、重试次数、重试动作 |
| 系统设置 | `system-permissions` | 账号权限 | 可写 | 管理员账号、角色权限 |
| 系统设置 | `system-operation-logs` | 后台操作日志 | 只读 | 后台手工积分调整、精彩瞬间审核、举报处理、分享图重试和榜单奖励配置日志 |
| 系统设置 | `system-config` | 基础配置 | 只读 | 运行环境、MySQL、上传、静态资源配置 |

## 5. 当前交互规范

后台已经统一为：

- 列表页展示数据和操作按钮。
- 新增/编辑通过独立编辑层完成。
- 编辑层必须显式点击关闭按钮退出。
- 点击空白区域不关闭编辑层。
- 图片字段使用上传入口或图片地址。
- 枚举字段优先使用下拉选择，不鼓励手输状态、分类、模板、角色、来源等值。

## 6. 当前重点规则

### 6.1 免费模板

`content-templates` 中模板 `cost=0` 即免费模板。

已固化规则：

- 免费模板是正式路径，不是会员关闭后的临时兜底。
- 前端创建酒局和高级模板页都应展示可用免费模板。
- 后台可继续新增、编辑、排序、下架免费模板。

### 6.2 会员总开关

`commerce-membership` 提供 `membershipEnabled`：

- `true`：会员入口和会员开通可用。
- `false`：前端隐藏或拒绝会员相关流程，后端开通接口返回 403。

会员开关不影响免费模板。

### 6.3 积分体系

`commerce-points` 当前管理：

- 每日任务
- 积分商品
- 用户积分列表
- 手工增减积分

后台手工积分调整会写入：

- 用户积分流水
- 后台操作日志

`commerce-point-ledger` 和 `system-operation-logs` 用于追溯。

### 6.4 用户身份

用户中心以微信 OpenID 为核心身份，手机号是可选绑定字段。后台展示：

- 昵称
- 微信头像
- 手机号
- OpenID
- 当前积分
- 运营状态
- 运营标签

不要再把手机号写成唯一必填身份。

## 7. 当前静态资产包

后台资产包路径：

```text
backend/public/admin/static/heatwave-ops/
```

`manifest.json` 当前登记页面：

- `index.html`
- `ui-kit.html`
- `overview-dashboard.html`
- `content-home-ops.html`
- `content-templates.html`
- `content-question-bank.html`
- `content-share-assets.html`
- `content-tools-ops.html`
- `content-moments-review.html`
- `content-moment-reports.html`
- `user-profiles.html`
- `sessions.html`
- `reports.html`
- `commerce-points.html`
- `commerce-membership.html`
- `commerce-merchants.html`
- `commerce-ranking-rewards.html`
- `data-users.html`
- `data-content.html`
- `data-business.html`
- `growth-share-tasks.html`
- `system-permissions.html`
- `system-config.html`

注意：动态导航中新增了 `user-login-logs`、`commerce-point-ledger`、`system-operation-logs`，这些页面由统一动态壳渲染，不依赖同名静态 HTML 文件。

## 8. 与小程序前台映射

| 小程序能力 | 后台模块 |
| --- | --- |
| 首页 Hero、快捷工具、活动 Banner | `content-home-ops` |
| 酒桌判官页主图 | `content-home-ops` |
| 创建酒局模板 | `content-templates` |
| 高级模板/免费模板 | `content-templates`、`commerce-membership` |
| 判官转盘题目 | `content-question-bank` |
| 分享预览、战报海报、分享码 | `content-share-assets` |
| 工具箱、热门工具、首页工具推荐 | `content-tools-ops` |
| 用户资料、头像、OpenID、手机号 | `user-profiles` |
| 微信登录记录 | `user-login-logs` |
| 酒局列表、判官、参与人、口令 | `sessions` |
| 战报列表与战报亮点 | `reports` |
| 积分任务、积分商品、用户积分 | `commerce-points` |
| 积分流水 | `commerce-point-ledger` |
| 会员套餐、权益、总开关 | `commerce-membership` |
| 商户券/优惠券 | `commerce-merchants` |

## 9. 当前仍待补齐

P0 待补：

- 生产后台默认密码重置流程。
- 登录失败频控、IP 白名单、二次验证。
- 更细粒度的菜单/按钮/字段权限。
- 后台操作日志覆盖所有页面保存，不只覆盖积分调整。
- 上传接正式对象存储或 CDN。

P1 待补：

- 活动专题页完整配置。
- A/B 实验与灰度发布。
- 内容审核流程的真实处理闭环。
- 商户券核销记录与对账。

P2 待补：

- 财务结算与分账。
- 商户 CRM。
- 自动化营销任务。
- BI 自定义报表。

## 10. 后续实施顺序

1. 先加固后台登录和权限。
2. 扩展操作日志覆盖范围。
3. 接入对象存储/CDN。
4. 把高频业务数据从 `app_store` 拆到实体表。
5. 再推进活动、核销、BI 和自动化营销。
