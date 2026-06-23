# SHARE-AUTH-011-UX 分享权限状态文案建议

时间：2026-06-22

角色：UI/UX 负责人

状态：已提交文案与按钮状态建议，待前端/后端合同接入；本记录不改业务源码、不改 PM 总台账。

## 范围与依据

- PM 指令：`SHARE-AUTH-011-UX`，补齐分享页未结束、无权限、被踢出三类状态文案和按钮状态建议。
- 产品口径：成员在聚会结束前不能生成或保存最终分享图；结束后可在“我的”查看分享图；被踢出不展示该局记录。
- 已读材料：`docs/runtime/pm-active-worklog.md`、`docs/gameplay-moments-team-announcements.md`、`miniprogram/pages/share-poster/index.wxml`、`miniprogram/pages/share-poster/index.ts`。
- 使用技能：`web-design-guidelines`。本次按最新规则中的“错误信息包含下一步”“按钮标签具体”“禁用态清晰”“异步状态有明确反馈”处理。

## 推荐状态模型

前端可在 `miniprogram/pages/share-poster/index.ts` 现有 `permissionState` 上收口，不建议另开同义状态。

| 状态名 | 触发条件 | 页面状态 |
| --- | --- | --- |
| `session_not_ended` | 后端返回 `409 session not ended`、`SESSION_NOT_ENDED` 或同义错误；或 session 明确为进行中 | 展示未结束提示；生成/保存禁用；可返回记录页或去“我的” |
| `share_forbidden` | 后端返回 `401/403/unauthorized/forbidden/not session member`，但不能确认是被踢 | 展示无权限提示；生成/保存禁用；提供重新进入/回首页 |
| `removed_from_session` | 后端返回 removed/kicked/removed member/踢出等明确状态；或成员关系查询确认已被移除 | 不展示该局记录内容；生成/保存/刷新全部禁用；只提供回首页 |

## 文案与按钮建议

### 1. 聚会未结束：`session_not_ended`

适用对象：成员与房主直接打开分享页、历史链接、旧入口或接口返回未结束错误。

- 状态胶囊：`暂未开放`
- 主标题：`聚会结束后才能保存分享图`
- 说明文案：`这场聚会还在记录中，最终分享图会在房主结束聚会后开放。结束后可在“我的”里查看和保存。`
- 状态行：`当前不能生成或保存最终分享图`
- 主按钮：`返回继续记录`
- 次按钮：`去我的查看`
- 禁用按钮文案：`聚会未结束`
- Toast：`聚会结束后再保存分享图`
- 视觉状态：信息提示，不用警告红；建议沿当前深色背景，用琥珀/奶油色提示卡。

按钮规则：

- `保存聚会图`、`生成聚会图`、`重新生成`、`刷新状态`均不可触发任务创建、刷新或保存。
- 房主可展示 `返回继续记录`；成员若无记录页权限，则展示 `去我的查看` 作为主按钮。

### 2. 无权限：`share_forbidden`

适用对象：非成员、登录态不匹配、分享链接失效、接口返回 401/403 但未明确被踢。

- 状态胶囊：`无访问权限`
- 主标题：`当前账号不能查看这张分享图`
- 说明文案：`请使用原邀请入口进入本场聚会，或切换到参与这场聚会的账号。`
- 状态行：`无法生成、刷新或保存该局分享图`
- 主按钮：`回到首页`
- 次按钮：`重新进入聚会`
- 禁用按钮文案：`暂无权限`
- Toast：`当前账号没有这场聚会的分享权限`
- 视觉状态：轻警告态，可用暖红/珊瑚强调，但不要压过主标题。

按钮规则：

- `重新进入聚会` 只有在页面持有 `inviteCode` 或可恢复邀请入口时展示。
- 如果没有 `inviteCode`，只保留 `回到首页`，避免给用户一个无法完成的动作。

### 3. 被踢出：`removed_from_session`

适用对象：后端明确返回被移除、成员关系不存在且业务确认是房主踢出。

- 状态胶囊：`已移出聚会`
- 主标题：`你已不能查看这场聚会记录`
- 说明文案：`你已被移出本场聚会，该局照片、账本和分享图不会再展示给当前账号。`
- 状态行：`该局记录已隐藏`
- 主按钮：`回到首页`
- 次按钮：不展示
- 禁用按钮文案：`不可查看`
- Toast：`你已被移出本场聚会`
- 视觉状态：明确阻断态；页面不应露出时间线、照片、账本摘要、二维码或分享图缩略图。

按钮规则：

- 不展示 `刷新状态`、`重新生成`、`保存聚会图`、`去我的查看`。
- 不展示该局记录内容，避免用户误以为只是保存失败。

## 前端接入位置建议

文件：`miniprogram/pages/share-poster/index.wxml`

- 顶部状态：现有 `.poster-status-pill` 从 `{{displayTaskStatus}} · {{displayTaskLayoutMode}}` 扩展为权限状态时优先展示 `permissionStatusLabel`。
- 主视觉区：在 `.poster-share021-timeline` 前增加权限空态容器，例如 `wx:if="{{permissionState === 'session_not_ended' || permissionState === 'share_forbidden' || permissionState === 'removed_from_session'}}"`。
- 时间线区：权限空态时隐藏 `posterTimelineNodes`，尤其 `removed_from_session` 不得展示任何节点。
- 操作区：`.poster-share021-action-row` 权限空态时切换为 `permissionPrimaryLabel` / `permissionSecondaryLabel`，不要继续绑定 `handleSaveTap` 创建任务。
- 状态行：复用 `.poster-status-line` 展示 `permissionStatusLine`。

文件：`miniprogram/pages/share-poster/index.ts`

建议新增或复用字段：

```ts
permissionState: '' | 'session_not_ended' | 'share_forbidden' | 'removed_from_session'
permissionStatusLabel: string
permissionTitle: string
permissionDescription: string
permissionPrimaryLabel: string
permissionSecondaryLabel: string
permissionStatusLine: string
```

错误映射建议：

- `409` + `session not ended` / `not ended` / `SESSION_NOT_ENDED` -> `session_not_ended`
- `401` / `403` / `unauthorized` / `forbidden` / `not session member` -> `share_forbidden`
- `removed` / `kicked` / `removed member` / `已移出` / `被踢出` -> `removed_from_session`

交互保护建议：

- `handleSaveTap()`：命中任一权限状态时直接 toast 对应文案，不进入 `createShareTask()`。
- `handleTaskPrimaryTap()`：命中任一权限状态时不调用 `refreshShareTask()` 或 `retryManagedShareImageTask()`。
- `applyShareTaskError()` / `applyPosterUnavailableState()`：先做权限错误映射，再写入展示文案，避免统一落成“生成失败，请重新生成”。

## 验收建议

- 进行中聚会直接打开分享页：显示 `聚会结束后才能保存分享图`，主按钮不可生成任务。
- 结束后成员从“我的”进入：可正常查看并保存 ready 分享图。
- 无权限账号打开分享页：不显示照片/账本明细，提示使用邀请入口或回首页。
- 被踢账号从“我的/历史/分享图合集/直接 sessionId”进入：不展示该局记录，只显示 `你已不能查看这场聚会记录`。

## 证据缺口

- 后端/API 仍需给出稳定错误码或错误字段，当前 UI/UX 只能提供文案与状态映射建议。
- 前端需在 `SHARE-AUTH-011-FE` 接入按钮禁用和权限空态后，补开发者工具预览框截图。
- 测试验收需在 `SHARE-AUTH-011-QA` 用有效账号覆盖进行中、结束后、无权限、被踢出四类样本。

## 边界声明

本轮未修改业务源码，未修改 `docs/runtime/pm-active-worklog.md`，未修改 PM 总台账，未触碰 `pomer.cn` 官网。
