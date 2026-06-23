# SHARE-AUTH-011-FE 前端记录

日期：2026-06-22

## 结论

- 已按后端 `SHARE-AUTH-011` 合同接入前端错误态。
- 合同口径：`409 session not ended` 展示“聚会结束后可查看分享图”；`403 forbidden` 与 `403 not session member` 不再归并为普通生成失败。
- 后端异步生成仍待后端负责人闭环：前端不得写“新任务生成中 -> ready 已通过”。
- 本轮有前端代码改动；待线上后端部署完成并完成预览框复核后，需要重新上传小程序包。

## 当前前端接入点

- `miniprogram/pages/share-poster/index.ts` 已在 `applyPosterUnavailableState()`、`applyShareTaskError()`、`handleSaveTap()`、`handleTaskPrimaryTap()`、`refreshShareTask()` 中接入 `session not ended`、`forbidden`、`not session member` 等错误态。
- 命中合同错误后，生成/保存/刷新按钮置灰，并展示“聚会结束后可查看分享图”或无权限提示。
- `miniprogram/pages/share-poster/index.ts` 新增 `shareActionBlocked` 阻断态：命中 409/403 合同后，生成/保存/刷新入口直接返回提示，不再继续创建或 retry。
- `miniprogram/pages/share-poster/index.wxml` 随阻断态置灰主按钮和刷新按钮，并隐藏“重新生成”。
- `miniprogram/pages/share-poster/index.less` 补充刷新按钮灰态。

## 首页封面复核

- 代码链路：`miniprogram/services/operations.ts` 已把 `/user/session-moment-summaries` 的 `coverPhotoUrl || coverImageUrl` 归一化为 `coverPhotoUrl`。
- 首页链路：`miniprogram/pages/index/index.ts` 的 `mapRecentAlbumsFromSummaries()` 优先读取 `coverPhotoUrl || readyShareImageUrl || shareImageUrl`。
- 个人中心待分享：`miniprogram/pages/me/index.ts` 已读取 `coverPhotoUrl`。
- 相册页：`miniprogram/pages/album/index.ts` 在 brief 首图缺失时回退 `coverPhotoUrl`。

## 验证

- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:encoding`：通过。
- 9420 自动化端口：2026-06-23 重启后 `/v2/auto` 可返回 ticket，但 WebSocket candidate 不可用，自动化截图未完成；需待工具端口恢复后补预览框截图。
- 首页预览框截图：`docs/runtime/pr-fe-share-auth-011-home-cover-window.png`。
- 接口对账：`GET https://api.pomer.cn/api/v1/user/session-moment-summaries` 返回 HTTP 200，当前用户数据中有 `coverPhotoUrl` 的最近相册在首页显示同一 CDN 图片；首项 `session-1782138302706-55b5e4` 后端 `coverPhotoUrl` 为空，因此首页显示默认封面。

## 阻塞

- 阻塞项：线上后端部署与 9420 自动化截图复核。
- 下一步责任人：DBA/运维完成线上部署后，前端复测真实 409/403 合同并上传小程序包。
