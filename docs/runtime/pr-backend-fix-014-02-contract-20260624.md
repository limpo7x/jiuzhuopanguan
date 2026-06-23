# FIX-014-02-BE-CONTRACT 后端只读合同确认

时间：2026-06-24

角色：后端/API 负责人

范围：仅只读确认 `/pages/share-poster/index` 相关后端接口在无权限、未结束、非成员、被移除、任务不可用状态下的错误合同；未修改业务源码，未提交，未推送，未部署，未触碰 `pomer.cn` 官网。

## 只读核查材料

- `docs/runtime/pm-audit-fix-approval-plan-20260623-213518.md`：`FIX-014-02` 要求分享页按 `notEnded/noPermission/removed/notMember/unavailable` 建独立安全状态。
- `docs/runtime/uiux-full-interaction-audit-20260623-2102.md`：`UIUX-013-P0-01` 指出分享页无权限/被踢出/未结束时不得展示照片、时间线、总结和二维码。
- `docs/runtime/pr-uiux-share-auth-011.md`：UI/UX 建议映射 `session_not_ended`、`share_forbidden`、`removed_from_session`。
- `backend/server.js`：分享图创建、读取、重试、处理路由；统一异常响应。
- `backend/data/moments.js`：分享图任务数据层、session 成员/房主/结束态校验。
- `miniprogram/pages/share-poster/index.ts`、`miniprogram/services/operations.ts`：前端消费侧错误映射与接口 fallback。

## 接口合同矩阵

| 场景 | 相关接口 | 当前后端响应 | 前端可映射状态 | 结论 |
| --- | --- | --- | --- | --- |
| 未登录访问分享任务/简报/创建/重试/处理 | `GET /api/v1/briefs/:id`、`POST /api/v1/briefs/:id/share-images`、`GET/POST /api/v1/share-images/:id...` 及旧 `/session-briefs`、`/share-image-tasks` | `401 unauthorized` | `share_forbidden` | 稳定，但只能归为无权限。 |
| 进行中聚会创建分享图 | `POST /api/v1/briefs/:id/share-images`、旧 `POST /api/v1/session-briefs/:id/share-image-tasks` | `409 session not ended` | `session_not_ended` | 稳定。 |
| 进行中聚会重试/处理分享图 | `POST /api/v1/share-images/:id/retry`、`/process`、旧 `/share-image-tasks/:id/retry`、`/process` | `409 session not ended` | `session_not_ended` | 稳定。 |
| 非房主但仍是成员创建/重试/处理 | 同创建/重试/处理接口 | `403 forbidden` | `share_forbidden` | 稳定；产品若要求仅房主生成，合同已能阻断，但不能表达“成员可看不可生成”的细分原因。 |
| 非成员/被移除用户读取任务 | `GET /api/v1/share-images/:id`、旧 `GET /api/v1/share-image-tasks/:id` | `403 not session member` | 当前前端 `not-member`，UI 文案为“已不在这场聚会中”；但非成员和被踢共用同一错误 | 可阻断内容；不能精确区分普通非成员与被踢。 |
| 非成员/被移除用户读取简报 | `GET /api/v1/briefs/:id`、旧 `GET /api/v1/session-briefs/:id` | `403 not session member` | 同上 | 可阻断内容；不能精确区分普通非成员与被踢。 |
| 任务不存在/不可用 | `GET /api/v1/share-images/:id`、旧 `GET /api/v1/share-image-tasks/:id` | `404 share task not found` | 前端按 missing/unavailable 文案处理 | 稳定。 |
| 简报不存在/不可用 | `GET /api/v1/briefs/:id`、旧 `GET /api/v1/session-briefs/:id` | `404 brief not found` | 前端可进入 unavailable/失效文案 | 稳定。 |
| 分享任务没有可展示节点 | `POST /api/v1/share-images/:id/process`、旧 `/process` | 处理函数内返回 failed task，`failedReason=share task has no visible nodes` | 前端 `toSafeShareErrorText` 可映射为“这张分享图还没有可展示内容” | 稳定。 |
| 分享任务状态不可处理 | `POST /api/v1/share-images/:id/process`、旧 `/process` | `409 share task is not processable` | 通用失败/不可用 | 稳定但非权限态。 |
| 非 failed/expired 任务重试 | `POST /api/v1/share-images/:id/retry`、旧 `/retry` | `409 only failed or expired share tasks can be retried` | 通用失败/不可用 | 稳定但非权限态。 |

## 后端合同判断

1. 未结束态合同已存在：创建、重试、处理都会走 `assertEndedSessionHostForShareImage()`，未结束抛 `409 session not ended`。
2. 无权限合同已存在：未登录由路由层 `requireUserSession()` 返回 `401 unauthorized`；成员校验失败返回 `403 not session member`；非房主生成/重试/处理返回 `403 forbidden`。
3. 不可用合同已存在：简报不存在返回 `404 brief not found`，任务不存在返回 `404 share task not found`，无可展示节点会落入 failed task 的 `failedReason`。
4. 被移除/踢出没有独立后端错误类型：当前 `assertSessionMember()` 只判断当前 profile 是否还在 `session.members`，不存在时统一抛 `403 not session member`，没有 `removed/kicked/removed_from_session` 字段或错误码。
5. 因此当前合同只能明确阻断并让前端落 `share_forbidden` 或类似无权限态；无法精确区分 `removed_from_session`。若前端需要展示“你已被移出聚会”的专用状态，需要后端后续补充成员移除历史或 kicked/removed 错误字段。

## 前端消费侧确认

- `operations.ts` 的 `requestJson()` 会把 HTTP 状态写入 `error.statusCode`，并透传后端 `message`。
- `share-poster/index.ts` 当前能识别：
  - `409 + session not ended` -> `session-not-ended`
  - `403 + not session member` -> `not-member`
  - `403` 或 `forbidden` -> `forbidden`
  - `404/not found` -> 失效或不可用
- 当前前端没有可用后端信号把 `not-member` 进一步区分为“普通非成员”还是“被房主移除”。

## 缺口与建议

- 缺口 1：`removed_from_session` 缺少稳定后端合同。当前只能返回 `403 not session member`，前端只能安全地展示 `share_forbidden` 或泛化“已不在这场聚会中”，不能证明用户是被踢。
- 缺口 2：错误响应只有 `message`，没有结构化 `errorCode`。建议后续若审批修补，增加类似 `SESSION_NOT_ENDED`、`NOT_SESSION_MEMBER`、`SESSION_MEMBER_REMOVED`、`SHARE_TASK_NOT_FOUND` 的稳定错误码，保留现有 message 兼容。
- 缺口 3：若要精确识别被移除，需要后端保留成员移除历史，或在移除成员时写入可查询的 tombstone；否则被移除用户与从未加入用户在读取分享页时不可区分。

## 验证方式

本轮按 PM 要求只读确认，未运行写入型 smoke，未调用线上接口，未修改业务源码。

只读命令摘要：

```powershell
rg -n "FIX-014-02|share-poster|分享页|权限|未结束|removed|kicked|forbidden" docs/runtime/pm-audit-fix-approval-plan-20260623-213518.md
rg -n "UIUX-013-P0-01|share-poster|分享页|权限|未结束|removed|kicked|forbidden" docs/runtime/uiux-full-interaction-audit-20260623-2102.md
Get-Content -LiteralPath docs/runtime/pr-uiux-share-auth-011.md
rg -n "share-image|shareImage|share-images|share-image-tasks|retry|processShareImageTask|createShareImageTask|assertSession|session not ended|not session member|forbidden|removed|kicked" backend/server.js backend/data/moments.js
rg -n "shareImage|share-image|share-poster|retryManagedShareImageTask|forbidden|unavailable|session not ended|not session member|removed|kicked|409|403|401|404" miniprogram/pages/share-poster/index.ts miniprogram/services/operations.ts
```

## 残留状态

- 业务源码：未修改。
- 提交/推送/部署：未执行。
- 运行态数据：未创建、未清理。
- 官网边界：未触碰 `pomer.cn` 公司官网。

## 是否需要后端后续修补

需要，若 PM/产品要求前端必须精确展示 `removed_from_session`。

建议后续单独审批一个最小后端修补项：

1. 在成员移除时保留 `removedMembers` 或审计记录，包含 `sessionId/profileId/removedAt/removedByProfileId`。
2. `assertSessionMember()` 或分享页专用校验在命中移除记录时返回 `403 session member removed`，并附 `errorCode=SESSION_MEMBER_REMOVED`。
3. 分享页创建、读取、重试、处理接口统一透传该错误。
4. 补 smoke：进行中、结束后成员、非成员、被踢、任务不存在五态矩阵。
