# 酒桌判官接口文档

更新时间：2026-06-13

## 1. 基准地址

- 本地：`http://127.0.0.1:3010/api/v1`
- 线上：`https://api.pomer.cn/api/v1`

除“后台页面与静态资源”一节外，本文接口路径默认省略 `/api/v1` 前缀。例如 `POST /admin/auth/login` 的线上完整路径是 `https://api.pomer.cn/api/v1/admin/auth/login`。

统一 JSON 响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

错误响应同样使用 `code != 0`，HTTP 状态码按场景返回 `400`、`401`、`403`、`404`、`500`。

## 2. 后台页面与静态资源

这些路径不带 `/api/v1` 前缀：

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/admin` | 后台入口；已登录跳转概览页，未登录跳转登录页 |
| GET | `/admin/login` | 后台登录页 |
| GET | `/admin/pages/:slug` | 后台动态页面 |
| GET | `/admin/ui-kit` | 跳转到后台 UI Kit |
| GET | `/admin/static/heatwave-ops/*` | 后台静态资源 |
| GET | `/static/*` | 小程序/后台共享静态资源 |
| GET | `/uploads/*` | 后台或用户上传资源 |

线上后台入口：

```text
https://api.pomer.cn/admin
```

## 3. 后台鉴权接口

后台接口使用 HttpOnly Cookie 会话。

### `POST /admin/auth/login`

用途：后台登录。

请求体：

```json
{
  "username": "admin",
  "password": "Admin@123456"
}
```

返回：当前后台用户，并设置后台会话 Cookie。

### `GET /admin/auth/session`

用途：读取当前后台登录态。

未登录返回 `401 unauthorized`。

### `POST /admin/auth/logout`

用途：退出后台并清除 Cookie。

## 4. 后台页面数据接口

### `GET /admin/pages/:slug`

用途：读取后台页面数据。

需要后台登录。

当前可用 `slug`：

- `overview-dashboard`
- `content-home-ops`
- `content-templates`
- `content-question-bank`
- `content-share-assets`
- `content-tools-ops`
- `user-profiles`
- `user-login-logs`
- `sessions`
- `reports`
- `commerce-points`
- `commerce-point-ledger`
- `commerce-membership`
- `commerce-merchants`
- `data-users`
- `data-content`
- `data-business`
- `system-permissions`
- `system-operation-logs`
- `system-config`

### `PUT /admin/pages/:slug`

用途：保存后台页面数据。

需要后台登录。当前可写页面包括：

- `content-home-ops`
- `content-templates`
- `content-question-bank`
- `content-share-assets`
- `content-tools-ops`
- `user-profiles`
- `sessions`
- `reports`
- `commerce-points`
- `commerce-membership`
- `commerce-merchants`
- `system-permissions`

只读页面保存会返回错误。

### `GET /admin/assets`

用途：读取后台上传资源清单。

### `POST /admin/uploads/image`

用途：后台通用图片上传。

请求体：

```json
{
  "category": "templates",
  "fileName": "cover.png",
  "dataUrl": "data:image/png;base64,..."
}
```

返回：

```json
{
  "uploaded": true,
  "asset": {
    "url": "/uploads/templates/cover.png"
  }
}
```

## 5. 首页与公共配置

### `GET /config/home`

用途：读取首页 Hero、快捷工具、运营横幅、酒桌判官页主图等配置。

### `GET /config/compliance`

用途：读取合规文案。

### `GET /config/points`

用途：读取积分中心任务和商品配置。

### `GET /config/templates`

用途：读取模板分类、模板列表和解锁卡配置。

规则：

- `cost=0` 表示免费模板。
- 图片路径会把旧 SVG 模板路径规范化为 PNG。

## 6. 小程序用户接口

### `GET /user/auth/config`

用途：判断微信登录配置是否可用。

返回字段：

- `wechatLoginEnabled`

### `POST /user/auth/login`

用途：微信登录并创建用户会话。

请求体：

```json
{
  "loginCode": "wx.login code",
  "phoneCode": "optional phone code",
  "profile": {
    "name": "昵称",
    "avatarUrl": "头像地址",
    "signature": "",
    "identityTag": ""
  }
}
```

说明：

- 首次登录时后端会自动发放 500 积分。
- 返回用户会话和用户资料。

### `GET /user/auth/session`

用途：读取小程序用户登录态。

### `POST /user/auth/bind-phone`

用途：登录后绑定手机号。

### `POST /user/avatar/upload`

用途：上传用户头像。

### `GET /user/profile`

用途：读取当前用户展示资料。已登录时返回真实用户资料和积分，未登录时返回默认资料。

### `GET /user/commerce`

用途：读取当前用户积分、任务状态、会员状态、模板解锁状态。

### `GET /user/judge-stats`

用途：读取当前用户酒局统计。

## 7. 工具接口

### `GET /tools/catalog`

用途：读取后台运营后的工具分类和工具列表。

### `GET /tools/history`

用途：读取工具使用历史。

### `POST /tools/history`

用途：记录工具使用。

请求体：

```json
{
  "id": "qr-code"
}
```

### `GET /tools/usage-records`

用途：读取工具使用记录列表。

### `GET /tools/qr-code.png?text=...`

用途：生成二维码 PNG。

返回：`image/png`

## 8. 内容与运营接口

### `GET /questions/catalog?type=...`

用途：读取题库与任务。可按类型筛选。

### `GET /merchants/catalog`

用途：读取商户和优惠券配置。

### `GET /share/config`

用途：读取分享素材、邀局卡、战报海报、分享码等配置。

## 9. 积分、模板和会员接口

### `POST /points/tasks/:taskId/claim`

用途：领取积分任务。

需要用户登录。

当前关键任务：

- `task-first-login`：首次登录自动发放，不手动领取。
- `task-signin`：每日签到，每天 1 次。
- `task-share-report`：分享战报后可领，每天最多 2 次。
- `task-reopen`：完成聚会后可领。

### `POST /points/rewards/:rewardId/redeem`

用途：兑换积分商品。

需要用户登录。

### `POST /templates/:templateId/unlock`

用途：通过广告观看进度解锁模板。

需要用户登录。

### `GET /membership/catalog`

用途：读取会员套餐、权益和当前用户会员状态。

### `POST /membership/activate`

用途：开通会员套餐。

需要用户登录。会员总开关关闭时返回 `403`。

请求体：

```json
{
  "planId": "member-1"
}
```

## 10. 酒局与战报接口

### `POST /sessions`

用途：创建酒局。

需要用户登录。后端会把当前用户写为判官/host。

### `POST /sessions/join`

用途：通过口令加入酒局。

请求体：

```json
{
  "inviteCode": "A17K9Q"
}
```

错误：

- `403 not session player`
- `404 session not found`

### `GET /sessions/live`

用途：读取当前或指定酒局。

查询参数：

- `sessionId`
- `inviteCode`

### `GET /sessions/by-invite?inviteCode=...`

用途：通过邀请口令读取酒局。

### `PUT /sessions/:sessionId`

用途：更新酒局。

需要用户登录，且只有判官可操作。

### `DELETE /sessions/:sessionId`

用途：删除酒局。

需要用户登录，且只有判官可操作。

### `POST /reports`

用途：结束酒局并生成战报。

需要用户登录。

### `GET /reports/featured`

用途：读取精选战报。

### `GET /reports/history?mode=all`

用途：读取当前用户战报历史。

需要用户登录。

### `GET /reports/:reportId`

用途：读取战报详情。

### `GET /reports/:reportId/poster.png`

用途：生成战报海报 PNG。

需要用户登录。

## 11. 埋点接口

### `POST /analytics/events`

用途：记录用户行为事件。

需要用户登录，后端会注入当前 `profileId`。

示例：

```json
{
  "type": "report_share",
  "reportId": "report-1",
  "meta": {
    "scene": "share-poster"
  }
}
```

`task-share-report` 的领取条件依赖当天 `report_share` 事件。

## 12. 社交接口

所有社交接口默认需要用户登录，后端以当前用户会话为准。

### `GET /social/bootstrap`

用途：拉取当前用户社交首页数据。

返回：

- `currentProfile`
- `wineFriends`
- `pokeThreads`

### `GET /social/users/search?keyword=...`

用途：搜索已注册用户。

### `PUT /social/profile`

用途：创建或更新当前用户资料。

### `POST /social/friends`

用途：新增酒友。

### `POST /social/friends/touch`

用途：把酒局参与者同步为最近联系人。

### `PUT /social/friends/:friendshipId`

用途：编辑酒友备注。

### `DELETE /social/friends/:friendshipId`

用途：删除酒友。

### `POST /social/pokes`

用途：发起拍一拍。

### `POST /social/pokes/:threadId/reply`

用途：回拍。

### `DELETE /social/pokes/:threadId`

用途：忽略拍一拍。

## 13. 旧接口兼容

以下接口仍存在，但主要由后台动态页替代：

- `GET /admin/config/home`
- `PUT /admin/config/home/hero`
- `POST /admin/upload/home-hero`
- `GET /admin/config/points`
- `PUT /admin/config/points`
- `GET /admin/config/templates`
- `PUT /admin/config/templates`

新后台开发优先使用 `/admin/pages/:slug` 和 `/admin/uploads/image`。
