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
- `content-moments-review`
- `content-moment-reports`
- `user-profiles`
- `user-login-logs`
- `sessions`
- `reports`
- `commerce-points`
- `commerce-point-ledger`
- `commerce-membership`
- `commerce-merchants`
- `commerce-ranking-rewards`
- `data-users`
- `data-content`
- `data-business`
- `growth-share-tasks`
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
- `commerce-ranking-rewards`
- `system-permissions`

只读页面保存会返回错误。

本轮精彩瞬间时间线迭代中，`content-moments-review`、`content-moment-reports`、`growth-share-tasks` 已接入后台强审计动作；页面按钮仍需用真实样本做端到端复测。

后台强审计动作统一写入 `system-operation-logs`，日志字段至少包含类型、操作人、动作、目标 ID、目标名称、详情和时间。

### `POST /api/v1/admin/moments/:momentId/review`

用途：后台审核精彩瞬间，支持通过、隐藏、拒绝、移出榜单候选等强审计动作。

需要后台登录。请求体：

```json
{
  "action": "approve",
  "reason": "二审通过，图片与本局相关"
}
```

`action` 当前支持：

- `approve`
- `approve_primary`
- `approve_secondary`
- `hide`
- `reject`
- `remove_ranking`

成功后会写入后台操作日志。

### `POST /api/v1/admin/moments/:momentId/require-resubmit`

用途：后台要求上传者重传精彩瞬间素材。

需要后台登录。请求体：

```json
{
  "reason": "图片与本局无关，需要重传"
}
```

成功后会将二审状态改为 `require_resubmit`，并写入后台操作日志。

### `POST /api/v1/admin/moment-reports/:reportId/handle`

用途：后台处理精彩瞬间举报。

需要后台登录。请求体：

```json
{
  "action": "valid_hide",
  "reason": "举报属实，内容不适合公开展示"
}
```

`action` 当前支持：

- `valid_hide`：举报有效，并隐藏被举报内容。
- `invalid_keep`：举报无效，保留被举报内容。
- `require_resubmit`：举报有效，要求上传者重传。
- `remove_ranking`：举报有效，将内容移出榜单候选。

成功后会更新举报处理状态，并写入后台操作日志；除 `invalid_keep` 外，相关 moment 的公开/上榜状态会同步受影响。

### `POST /api/v1/admin/share-image-tasks/:taskId/retry`

用途：后台重试失败或过期的分享图任务。

需要后台登录。请求体：

```json
{
  "reason": "运营手动重试失败任务"
}
```

仅允许 `failed` 或 `expired` 状态的任务重试，成功后任务回到 `pending`，并写入后台操作日志。

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

公开分享回流字段：

当通过有效 `sessionId` / `inviteCode` 读取到酒局时，响应会在原有 session 字段基础上追加公开安全摘要，供 `share-preview` 等公开回流页使用。该接口不要求用户登录，但只返回已过滤、脱敏、公开传播安全的内容。

返回字段：

- `photoHighlights`：公开照片高光，最多 6 条，仅包含已授权分享、审核通过、媒体完整、非私密的照片节点。
- `accountingHighlights`：聚会账本聚合高光，字段与 brief 合同一致。
- `ledgerSummary`：公开账本摘要，字段与 brief 合同一致，`visibilityScope=public_summary`。
- `eventHighlights` / `keyEvents`：中性关键事件摘要，不返回操作者、目标用户或个人明细。
- `shareContentFilter`：服务端分享过滤摘要，含 `allowedNodeIds`、`filteredNodeIds`、`filteredNodes`、`notice`。
- `filteredNodeIds`：`shareContentFilter.filteredNodeIds` 的便捷镜像字段。
- `visibleNodeIds`：公开回流页可展示的节点 ID。
- `visibleNodes`：公开回流页可展示节点的脱敏摘要。
- `permissionState`：当前公开入口权限状态，成功公开回流时为 `public`。
- `publicAccessState`：公开入口状态对象。

示例：

```json
{
  "id": "session-xxx",
  "inviteCode": "A17K9Q",
  "photoHighlights": [
    {
      "id": "moment-xxx",
      "imageUrl": "/uploads/moments/session-xxx/a.webp",
      "nodeType": "opening",
      "title": "聚会开场",
      "createdAt": "2026-06-17T00:00:00.000Z"
    }
  ],
  "accountingHighlights": [
    { "type": "debt", "label": "待处理记录", "value": 2, "unit": "条", "text": "待处理记录 2条" }
  ],
  "ledgerSummary": {
    "sessionId": "session-xxx",
    "ledgerCount": 8,
    "debtCups": 2,
    "drunkCups": 3,
    "visibilityScope": "public_summary"
  },
  "eventHighlights": [
    { "id": "event-xxx", "type": "drink_add", "text": "新增一条加酒记录", "createdAt": "2026-06-17T00:00:00.000Z" }
  ],
  "shareContentFilter": {
    "allowedNodeIds": ["moment-xxx", "event-xxx"],
    "filteredNodeIds": ["moment-private"],
    "filteredNodes": [{ "nodeId": "moment-private", "nodeKind": "moment", "reason": "private_or_not_visible" }],
    "notice": "仅展示已授权且审核通过的公开内容；私密、待审、待补图和未授权内容不会进入分享图。"
  },
  "filteredNodeIds": ["moment-private"],
  "visibleNodeIds": ["moment-xxx", "event-xxx"],
  "visibleNodes": [
    { "id": "moment-xxx", "nodeKind": "moment", "nodeType": "opening", "imageUrl": "/uploads/moments/session-xxx/a.webp", "title": "聚会开场" },
    { "id": "event-xxx", "nodeKind": "event", "eventType": "drink_add", "title": "加酒记录" }
  ],
  "permissionState": "public",
  "publicAccessState": {
    "state": "public_invite",
    "canViewPublicShare": true,
    "canViewMemberBrief": false,
    "reason": "invite_code_valid"
  }
}
```

公开过滤口径：

- 不返回私密、指定可见、待审、待二审、hidden / removed、needs_media、未授权分享节点。
- 不返回完整成员列表以外的敏感字段，不返回 token、手机号、openId、unionId、points ledger、完整 profileId 或个人账本明细。
- `visibleNodes` 对 event 只返回中性标题，不返回 `operatorName`、`targetName`、`targetProfileId` 或原始 caption。
- 成员态完整 brief / task 仍走 `GET /session-briefs/:briefId` 和 `GET /share-image-tasks/:taskId`，继续要求成员身份。

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

## 11. 精彩瞬间时间线接口

本组接口属于 `DEV-M0` 到 `DEV-M3` 的后端合同。除特别说明外都需要小程序用户登录，后端会校验当前用户是否为对应酒局成员。

### `POST /moments/uploads/image`

用途：上传精彩瞬间图片，返回可写入 moment 的图片资源对象。

请求体：

```json
{
  "sessionId": "session-xxx",
  "fileName": "opening.png",
  "dataUrl": "data:image/png;base64,..."
}
```

返回：

```json
{
  "id": "moment-asset-xxx",
  "sessionId": "session-xxx",
  "uploaderProfileId": "profile-xxx",
  "fileName": "opening.png",
  "mimeType": "image/webp",
  "size": 12345,
  "url": "/uploads/moments/session-xxx/xxx.webp",
  "createdAt": "2026-06-15T12:00:00.000Z"
}
```

规则：

- 仅允许 `image/jpeg`、`image/png`、`image/webp`。
- 单张图片上限 5 MB。
- 当前返回 `/uploads/moments/*` 本地资源路径，后续迁移对象存储时保持返回结构兼容。

### `POST /sessions/:sessionId/moments`

用途：创建开场、精彩、私密、收尾等时间线 moment。

请求体：

```json
{
  "clientDraftId": "local-draft-1",
  "nodeType": "highlight",
  "imageUrl": "/uploads/moments/session-xxx/a.png",
  "caption": "这一下值得留证",
  "tags": ["精彩"],
  "visibility": "session",
  "visibleProfileIds": [],
  "usageConsent": {
    "session": true,
    "brief": true,
    "share": true,
    "ranking": true
  }
}
```

规则：

- `nodeType` 支持 `opening`、`highlight`、`drinking`、`private`、`closing`。
- `private` 必须传 `visibleProfileIds`，且这些用户必须是本局成员。
- 同一用户同一酒局的 `clientDraftId` 重复提交会返回或更新原记录。
- `opening` 当前按“每人每局 1 张”处理，重复提交会更新原开场 moment。

### `PUT /moments/:momentId`

用途：上传者本人编辑 moment、补图或更新授权。

需要当前用户是上传者本人。管理员审核状态变更不走这个接口。

### `DELETE /moments/:momentId`

用途：上传者本人删除未公开 moment。当前实现为软删除，不物理移除数据。

规则：

- 仅上传者本人可删除。
- 已审核通过、已进入榜单资格或奖励资格的 moment 不允许用户侧直接删除，返回 `409 moment cannot be deleted after publish`，后续应走后台隐藏/撤回流程。

### `GET /sessions/:sessionId/timeline`

用途：读取本局时间线。

返回内容按当前登录用户过滤：

- 上传者和指定接收者可以看到私密爆料正文、图片和标签。
- 其他本局成员只看到私密占位节点，不返回正文、图片和完整接收名单。
- 非本局成员返回 `403`。

返回节点分两类：

- `kind=moment`：开场、精彩、私密、收尾等 UGC 节点。
- `kind=event`：欠酒、加酒、转盘等辅助事件。

### `POST /sessions/:sessionId/events`

用途：写入欠酒、加酒、转盘辅助事件。

请求体：

```json
{
  "clientEventId": "local-event-1",
  "eventType": "drink_debt",
  "targetProfileId": "user-xxx",
  "scoreDelta": 1,
  "caption": "判官记录了一次欠酒"
}
```

规则：

- MVP 只允许判官/host 提交。
- `clientEventId` 必填，同一酒局重复提交会返回原事件。
- `eventType` 支持 `drink_debt`、`drink_add`、`wheel_result`。
- 如传 `targetProfileId`，目标用户必须是本局成员。

### `POST /sessions/:sessionId/brief`

用途：生成或刷新时间线版酒局简报。

返回：

- `openingMomentIds`
- `closingMomentIds`
- `timelineNodeIds`
- `incompleteMomentCount`
- `shareImageTaskId`
- `shareImageStatus`
- `ledgerSummary`
- `accountingHighlights`
- `settlementSummary`
- `ledgerRankings`
- `eventHighlights`
- `shareContentFilter`

账本聚合字段用于分享页 / 保存海报展示“照片 + 聚会账本”双主线，不要求前端再从 `sessions/live`、timeline events 和 report 自行推导。

示例：

```json
{
  "ledgerSummary": {
    "sessionId": "session-xxx",
    "participantCount": 3,
    "ledgerCount": 8,
    "debtCups": 2,
    "drunkCups": 3,
    "addWineCount": 1,
    "debtEventCount": 1,
    "clearedCups": 2,
    "keyEventCount": 1,
    "hasLedgerData": true,
    "visibilityScope": "public_summary",
    "generatedFrom": ["session-members", "timeline-events"],
    "emptyText": "聚会账本还没开始，先记一笔。"
  },
  "accountingHighlights": [
    { "type": "debt", "label": "待处理记录", "value": 2, "unit": "条", "text": "待处理记录 2条" },
    { "type": "drunk", "label": "完成记录", "value": 3, "unit": "条", "text": "完成记录 3条" }
  ],
  "settlementSummary": {
    "status": "open",
    "text": "本场已记录 8 条账本高光，还有 2 条待处理记录。",
    "generatedFrom": "session-members+timeline-events",
    "safeForPublic": true
  },
  "ledgerRankings": {
    "debt": [{ "rank": 1, "displayName": "成员1", "value": 2 }],
    "drink": [{ "rank": 1, "displayName": "成员2", "value": 3 }],
    "cleared": []
  },
  "eventHighlights": [
    { "id": "event-xxx", "type": "drink_add", "text": "新增一条加酒记录", "createdAt": "2026-06-17T00:00:00.000Z" }
  ],
  "shareContentFilter": {
    "allowedNodeIds": ["moment-xxx", "event-xxx"],
    "filteredNodeIds": ["moment-private"],
    "filteredNodes": [{ "nodeId": "moment-private", "nodeKind": "moment", "reason": "private_or_not_visible" }],
    "notice": "仅展示已授权且审核通过的公开内容；私密、待审、待补图和未授权内容不会进入分享图。"
  }
}
```

空态规则：

- 没有账本计数和事件时，`ledgerSummary.hasLedgerData=false`、`ledgerCount=0`，`settlementSummary.status=empty`。
- `accountingHighlights` 仍返回四类固定项，数值为 `0` 并带空态 `text`，前端不得隐藏账本模块，可展示“先记一笔”CTA。
- `ledgerRankings.*` 无数据时返回空数组。

隐私 / 角色过滤口径：

- 账本聚合字段默认按 `visibilityScope=public_summary` 输出，只返回聚合数值、中性文案和脱敏 `displayName`，不返回完整 `profileId`、token、手机号、points ledger 或个人明细。
- 照片节点仍沿 timeline / share task 现有服务端过滤：私密占位、待审、待补图、未授权分享、hidden / removed 内容不得进入 `allowedNodeIds` 或分享 PNG。
- 成员内如需查看完整成员账本，可继续读取 `sessions/live.joinedPlayers` / 成员列表；公开分享页和保存图应优先使用本聚合字段。

### `GET /session-briefs/:briefId`

用途：读取时间线简报详情，并按当前用户权限返回 timeline。

返回字段与 `POST /sessions/:sessionId/brief` 一致，包含 `ledgerSummary`、`accountingHighlights`、`settlementSummary`、`ledgerRankings`、`eventHighlights` 和 `shareContentFilter`。

### `POST /session-briefs/:briefId/share-image-tasks`

用途：创建分享图任务。

请求体：

```json
{
  "layoutMode": "dual_flow",
  "includeLedger": true,
  "selectedNodeIds": ["moment-xxx"]
}
```

当前实现会创建 `pending` 任务；本地同步处理接口可将任务推进到 `processing`、`ready` 或 `failed`。

规则：

- 不传 `selectedNodeIds` 时，服务端默认选取当前用户可见 timeline 中前 6 个非占位节点。
- 如传 `selectedNodeIds`，每个节点都必须属于当前 brief 的可见 timeline，且不能是私密占位节点。
- `layoutMode=dual_flow` 或 `includeLedger=true` 时，任务返回 `ledgerIncluded=true`，同步生成 PNG 会渲染账本摘要区块。
- `layoutMode=timeline` 且未传 `includeLedger` 时，保持旧时间线分享图。

### `GET /share-image-tasks/:taskId`

用途：查询分享图任务状态。

状态枚举：

- `pending`
- `processing`
- `ready`
- `failed`
- `expired`

### `POST /share-image-tasks/:taskId/retry`

用途：重试失败或过期的分享图任务。

仅 `failed`、`expired` 可重试。

### `POST /share-image-tasks/:taskId/process`

用途：处理一个待生成、失败或过期的分享图任务。本地实现为同步处理，后续可替换为进程内队列或独立 worker。

规则：

- 仅 `pending`、`failed`、`expired` 可进入处理。
- 处理开始时任务变为 `processing`。
- 生成成功后任务变为 `ready`，返回 `/uploads/moments/share-tasks/*.png`。
- 生成后的图片以 `GET /uploads/moments/share-tasks/*.png` 验证可访问；当前静态资源路由不以 `HEAD` 作为验收依据。
- 生成失败后任务变为 `failed`，写入 `failedReason`。
- 生成内容只使用任务中服务端校验过的可见 timeline 节点，不包含私密占位。

### `GET /user/session-moment-summaries`

用途：个人页/历史页读取当前用户参与过的 moments 摘要，包括待补图数量、brief 和分享图任务状态。

### `GET /rankings/today?category=...`

用途：读取今日榜单。

查询参数：

- `category`：支持 `today_funny`、`today_debt`、`today_highlight`、`today_visual`、`best_opening`、`best_closing`。
- `limit`：默认 20，最大 100。

返回每个榜单项包含：

- `rank`
- `score`
- `pointsTotal`
- `nominationCount`
- `moment`
- `latestNominationAt`

规则：

- 只统计 `complete + ranking consent + approved + secondary approved + rankingEligible` 的公开 moment。
- 私密、指定可见、已删除、隐藏、未审核或未授权的 moment 不进入榜单。

### `GET /moments/:momentId/nomination-eligibility?category=...`

用途：读取当前用户对某个 moment 的推举资格。

需要当前用户是该酒局成员。返回：

```json
{
  "momentId": "moment-xxx",
  "category": "today_highlight",
  "eligible": true,
  "alreadyNominatedToday": false,
  "pointsCost": 10,
  "reason": ""
}
```

### `POST /moments/:momentId/nominations`

用途：消耗积分推举某个精彩瞬间进入榜单。

需要当前用户是该酒局成员。请求体：

```json
{
  "category": "today_highlight",
  "clientNominationId": "local-nomination-1"
}
```

规则：

- MVP 单次推举固定消耗 10 积分。
- 同一用户每天对同一 moment、同一 category 只能推举 1 次，重复返回 `409`。
- `clientNominationId` 可用于同一客户端提交幂等。
- 积分扣减写入用户 `pointsLedger`，`kind=moment-nomination`。
- 积分不足返回 `400 points not enough`。
- 不符合榜单资格的 moment 返回 `400 moment is not eligible for ranking`。
- 后台将内容 `hide`、`reject`、`require_resubmit` 或 `remove_ranking` 后，active 推举会标记为 `refunded`，并写入用户 `pointsLedger(kind=moment-nomination-refund)`。

### `POST /admin/ranking-rewards/grant`

用途：后台按当前榜单和 `commerce-ranking-rewards` 配置发放榜单积分奖励。

需要后台登录态。请求体：

```json
{
  "category": "today_highlight",
  "limit": 100
}
```

返回：

```json
{
  "category": "today_highlight",
  "date": "2026-06-15",
  "grantedCount": 1,
  "skippedCount": 0,
  "totalPoints": 120,
  "items": []
}
```

规则：

- 优先读取 `moments-store.rankingRewardRules`，为空时回落到后台 `admin-store.rankingRewardRules`。
- 只给当前榜单中匹配启用规则和名次区间的 moment 上传者发奖。
- 发奖写入用户 `pointsLedger`，`kind=ranking-reward`。
- 使用 `date + category + momentId + ruleId` 生成 `sourceId`，重复触发会跳过已发奖励。
- 发奖记录写入 `rankingRewardPayouts`，便于后续后台追溯。

## 12. 埋点接口

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

## 13. 社交接口

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

## 14. 旧接口兼容

以下接口仍存在，但主要由后台动态页替代：

- `GET /admin/config/home`
- `PUT /admin/config/home/hero`
- `POST /admin/upload/home-hero`
- `GET /admin/config/points`
- `PUT /admin/config/points`
- `GET /admin/config/templates`
- `PUT /admin/config/templates`

新后台开发优先使用 `/admin/pages/:slug` 和 `/admin/uploads/image`。
