# 酒桌判官业务流程

更新时间：2026-06-15

## 1. 产品定位

酒桌判官是线下聚会场景小程序，当前保留两条主线：

- 酒局闭环：创建酒局、设置玩法、添加玩家、邀请入局、等待开局、进行中记录、桌面模式、判官转盘、结束战报、分享海报。
- 实用工具：图片压缩、文字计数、二维码生成、JSON 格式化、房贷计算、汇率换算、单位换算、九宫格切图、图片去水印。

项目不按实时在线游戏推进，当前核心是线下聚会记录、气氛玩法、分享传播和运营后台可控。

## 2. 用户身份

当前后端支持小程序用户登录：

- `GET /api/v1/user/auth/config` 判断微信登录是否可用。
- `POST /api/v1/user/auth/login` 通过微信登录码换取 OpenID，并创建用户会话。
- `POST /api/v1/user/auth/bind-phone` 绑定手机号。
- `POST /api/v1/user/avatar/upload` 上传头像。

身份规则：

- 微信 OpenID 是当前用户的核心唯一身份。
- 手机号为可选绑定信息，不再假设所有用户都有手机号。
- 用户资料、积分、模板解锁、会员、酒局、战报、社交关系均按独立用户隔离。
- 首次登录由后端自动发放 500 积分，前端通过首次登录弹框提示积分用途。

## 3. 酒局主流程

当前页面以 `miniprogram/app.json` 为准：

1. 首页或酒桌判官入口进入。
2. 创建酒局：填写名称、人数、模板。
3. 玩法设置。
4. 添加玩家。
5. 邀请好友。
6. 分享预览。
7. 等待开局。
8. 进入进行中记录页。
9. 可切换桌面模式。
10. 符合条件时进入判官转盘消杯。
11. 结束本局并生成战报。
12. 进入分享海报或历史酒局。

后端对应能力：

- `POST /api/v1/sessions` 创建酒局，必须登录。
- `POST /api/v1/sessions/join` 通过口令加入，必须登录。
- `GET /api/v1/sessions/live` 读取当前酒局配置。
- `GET /api/v1/sessions/by-invite` 通过口令读取酒局。
- `PUT /api/v1/sessions/:sessionId` 更新酒局，仅判官可操作。
- `DELETE /api/v1/sessions/:sessionId` 删除酒局，仅判官可操作。
- `POST /api/v1/reports` 结束酒局并生成战报。

## 4. 角色与权限

### 判官

- 创建酒局并成为发起人。
- 选择模板、人数、玩家。
- 更新进行中记录。
- 发起转盘消杯。
- 结束本局并生成战报。
- 未坐满时可继续邀请。

### 参与玩家

- 通过邀请或口令加入。
- 查看等待开局、进行中记录、桌面模式。
- 非判官不能修改酒局核心数据。
- 桌面模式中可参与互动评价。

### 工具用户

- 从首页、工具箱、最近使用进入工具详情。
- 工具使用会写入历史，后台可运营工具分类、推荐位、热门状态和投放位置。

## 5. 关键业务规则

### 5.1 登录前置

以下能力需要用户会话：

- 创建酒局
- 加入酒局
- 更新/删除酒局
- 生成战报
- 查看战报历史
- 生成战报海报 PNG
- 积分任务领取和商品兑换
- 会员开通
- 模板解锁
- 社交 bootstrap、酒友、拍一拍

### 5.2 判官权限

后端通过当前登录用户 `profile.id` 与酒局 host 成员的 `profileId` 判断是否为判官。更新和删除酒局时，非判官返回 `403 forbidden`。

### 5.3 邀请入局

- 通过 `inviteCode` 找到酒局。
- 用户必须登录后才能 join。
- 后端会判断是否允许加入，不允许时返回 `403 not session player`。

### 5.4 转盘与消杯

- 转盘题库由后台 `content-question-bank` 管理。
- 前端通过 `GET /api/v1/questions/catalog` 读取题库。
- 转盘命中的是题目/任务，不是玩家名。

### 5.5 战报与分享

- 战报由 `POST /api/v1/reports` 生成。
- 战报详情通过 `GET /api/v1/reports/:reportId` 获取。
- 战报历史通过 `GET /api/v1/reports/history` 获取。
- 战报海报 PNG 通过 `GET /api/v1/reports/:reportId/poster.png` 生成。
- 分享行为可通过 `POST /api/v1/analytics/events` 写入，用于积分任务判断。

### 5.6 精彩瞬间时间线

精彩瞬间时间线是战报之外的新增记录链路，当前后端/API 已部署到 `api.pomer.cn`，前端页面仍待真机联调。

核心流程：

1. 等待室或进行中页进入 `moment-editor`。
2. 用户上传图片或填写一句话说明。
3. 选择节点类型：`opening`、`highlight`、`drinking`、`private`、`closing`。
4. 选择可见范围和用途授权。
5. 私密/指定可见节点必须选择本局成员，后端校验 `visibleProfileIds` 必须属于当前酒局。
6. 时间线通过 `GET /api/v1/sessions/:sessionId/timeline` 聚合 moment 和辅助事件。
7. 非接收者读取私密节点时只能看到占位，不能看到正文、图片或完整接收名单。

分享图流程：

1. 通过 `POST /api/v1/sessions/:sessionId/brief` 生成或刷新时间线简报。
2. 通过 `POST /api/v1/session-briefs/:briefId/share-image-tasks` 创建分享图任务。
3. 任务状态包含 `pending`、`processing`、`ready`、`failed`、`expired`。
4. 当前同步处理接口 `POST /api/v1/share-image-tasks/:taskId/process` 可生成 ready PNG。
5. `ready` 图片通过 `/uploads/moments/share-tasks/*.png` GET 访问；HEAD 不作为验收依据。
6. `retry` 仅允许 `failed`、`expired`，pending/ready 等状态应返回 409。

未完成闭环：

- 小程序真机三用户私密权限联调。
- `session-brief` 页面和 M2 待补图闭环。
- 个人页/历史页/分享海报页对分享任务状态的完整接入。
- 后台审核、举报、重试动作 E2E 和 UGC 风控口径。

## 6. 工具箱流程

当前内置工具：

- 图片压缩
- 文字计数
- 二维码生成
- JSON 格式化
- 房贷计算
- 汇率换算
- 单位换算
- 九宫格切图
- 图片去水印

工具运营逻辑：

- 本地兜底清单在 `miniprogram/utils/toolkit.ts`。
- 后台工具配置在 `backend/data/admin-store.json` 的 `toolsCatalog`。
- 前端通过 `GET /api/v1/tools/catalog` 获取后台运营后的工具列表。
- 工具使用通过 `POST /api/v1/tools/history` 记录。
- 二维码生成调用 `GET /api/v1/tools/qr-code.png?text=...` 返回真实 PNG。
- 图片去水印当前是遮挡式导出，不是智能修复。

## 7. 积分流程

积分中心分为：

- 每日任务
- 积分商城

当前内置和后台可配任务：

- 首次登录赠送：后端自动发放 500 积分，不需要用户手动领取。
- 每日签到：按 `Asia/Shanghai` 自然日每天 1 次。
- 分享战报：需要当天产生 `report_share` 事件，每天最多领取 2 次。
- 使用模板再开一局：需要用户完成过酒局或有对应战报。

积分接口：

- `GET /api/v1/config/points` 获取任务和商品配置。
- `GET /api/v1/user/commerce` 获取当前用户积分、任务状态、权益状态。
- `POST /api/v1/points/tasks/:taskId/claim` 领取任务。
- `POST /api/v1/points/rewards/:rewardId/redeem` 兑换商品。

后台能力：

- `commerce-points` 管理任务、商品和用户积分。
- `commerce-point-ledger` 查看积分流水。
- 后台给用户手工增减积分时，会写入用户积分流水和后台操作日志。

## 8. 模板与会员

### 8.1 免费模板

后台 `content-templates` 支持模板分类、模板列表和解锁卡配置。当前免费模板规则：

- `cost=0` 表示免费模板。
- 前端创建酒局和高级模板页会读取 `GET /api/v1/config/templates`。
- 免费模板可直接使用，不应被会员关闭逻辑隐藏。

### 8.2 会员体系

后台 `commerce-membership` 支持：

- 会员功能总开关 `membershipEnabled`
- 会员套餐
- 会员权益

前端接口：

- `GET /api/v1/membership/catalog`
- `POST /api/v1/membership/activate`

规则：

- 会员开关关闭时，前端会员入口和会员开通流程应隐藏或拒绝。
- 后端 `activateMembershipPlan` 在会员关闭时应返回 403。
- 会员关闭不影响免费模板。

## 9. 社交流程

当前社交能力：

- 用户资料创建/更新
- 酒友搜索
- 新增、编辑、删除酒友
- 创建酒局时同步最近联系人
- 拍一拍、回拍、忽略
- 匹配成功线程在后台用户中心可查看

接口：

- `GET /api/v1/social/bootstrap`
- `GET /api/v1/social/users/search`
- `PUT /api/v1/social/profile`
- `POST /api/v1/social/friends`
- `POST /api/v1/social/friends/touch`
- `PUT /api/v1/social/friends/:friendshipId`
- `DELETE /api/v1/social/friends/:friendshipId`
- `POST /api/v1/social/pokes`
- `POST /api/v1/social/pokes/:threadId/reply`
- `DELETE /api/v1/social/pokes/:threadId`

## 10. 当前路由清单

当前小程序页面：

- `/pages/index/index`
- `/pages/tools/index`
- `/pages/judge/index`
- `/pages/me/index`
- `/pages/create-session/index`
- `/pages/session-rules/index`
- `/pages/add-players/index`
- `/pages/invite-group/index`
- `/pages/share-preview/index`
- `/pages/compliance-guide/index`
- `/pages/flow-overview/index`
- `/pages/live-record/index`
- `/pages/table-mode/index`
- `/pages/judge-wheel/index`
- `/pages/result-report/index`
- `/pages/share-poster/index`
- `/pages/wine-history/index`
- `/pages/wine-points/index`
- `/pages/premium-templates/index`
- `/pages/merchant-partners/index`
- `/pages/invalid-state/index`
- `/pages/restart-state/index`
- `/pages/tool-detail/index`
- `/pages/member-center/index`
- `/pages/favorites/index`
- `/pages/usage-history/index`
- `/pages/coupon-center/index`
- `/pages/settings/index`
- `/pages/invite-friends/index`
- `/pages/friend-hub/index`
- `/pages/question-bank/index`
- `/pages/waiting-room/index`
- `/pages/logs/logs`

注意：当前 `app.json` 未包含早期文档里提到的 `/pages/profile-edit/index`、`/pages/join-claim/index`。

## 11. 当前实现边界

- 后台和 API 已经有会话鉴权，但正式生产仍需加强密码策略、失败限制、IP 白名单或二次校验。
- MySQL 当前仍是 `app_store` 大 JSON 表，不适合高并发和复杂统计。
- 上传资源当前落本地 `/uploads/`，正式生产建议接 OSS/COS/CDN。
- 图片去水印不是 AI 修复。
- 财务、核销、BI、自定义报表仍是后续能力。
