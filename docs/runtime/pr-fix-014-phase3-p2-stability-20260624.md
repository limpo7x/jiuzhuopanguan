# FIX-014 第三阶段 P2 稳定性与体验

- 日期：2026-06-24
- 工作树：`F:\codexlist\jiuzhuopanguan-fix-014-phase3`
- 分支：`codex/fix-014-phase3-p2-stability`
- 基线：`origin/main` / `958efbe1`
- 范围：`FIX-014-11` 到 `FIX-014-18`；不上传微信小程序包，不触碰 `pomer.cn` 公司官网。

## 修复内容

### FIX-014-11 / FIX-014-12

- `miniprogram/services/operations.ts`
  - 新增 `isRouteFallbackError()`，只允许 404/405 或明确 route-not-found/method-not-allowed 触发 legacy fallback。
  - 分享图创建、读取、处理、重试的 modern -> legacy fallback 不再吞掉 401/403/409。
  - 结束聚会的 `/sessions/:id/end` -> `/finish` -> `PUT /sessions/:id` fallback 不再吞掉 401/403/409。

### FIX-014-13

- `backend/data/moments.js`
  - 今日回忆榜继续按公开展示口径返回。
  - 新增公开榜单专用序列化，裁剪 `uploaderProfileId`、`visibleProfileIds`、`usageConsent`、审核状态等内部字段。
  - 保留展示级字段：照片、标题、文案、展示昵称、展示头像、时间、榜单资格。

### FIX-014-14

- `backend/data/object-storage.js`
  - 新增 `deleteObject()`，支持本地上传物删除；OSS 删除按对象不存在幂等处理。
- `backend/data/moments.js`
  - 上传资产规范化新增 `boundMomentId/boundAt/removedAt/cleanupReason`。
  - `createMoment()` 成功后按 `uploadAssetId` 标记资产已绑定。
  - 新增 `cleanupMomentUpload()`，只允许本人清理未绑定资产，已绑定资产返回 409。
  - 新增 `cleanupExpiredMomentUploads()`，为 TTL 清理提供数据层入口。
- `backend/server.js`
  - 新增 `DELETE /api/v1/moments/uploads/:assetId`，用于创建 moment 失败后的明确 cleanup。
- `miniprogram/pages/moment-editor/index.ts`
  - 保存最近一次上传的 `uploadedAssetId`。
  - 创建 moment payload 携带 `uploadAssetId`。
  - 创建失败后调用 cleanup；重复选图前清理上一张未绑定上传。

### FIX-014-15 / FIX-014-16 / FIX-014-17 / FIX-014-18

- `miniprogram/pages/create-session/index.ts`
  - 旧玩法预设替换为生日、老友、团建、家庭、周末、露营等聚会场景。
  - 高级设置未开放时留在当前页 toast，不再跳到隐私/功能占位页。
- `miniprogram/pages/create-session/index.wxml`
  - 高级设置行明确“暂未开放”，不再展示下拉箭头。
- `miniprogram/pages/live-record/index.wxml`
  - 增加禁用态“分享”tab。
  - 明确说明“结束聚会后会生成分享图，可在这里或我的里查看和保存”。
- `miniprogram/pages/live-record/index.less`
  - 分段 tab 调整为 4 栏，补禁用态和分享说明样式。
- `miniprogram/pages/share-preview/index.wxml`
  - “举报/反馈待后台开通”降级为非按钮说明：“如需反馈，请联系聚会发起人处理。”
- `miniprogram/pages/share-preview/index.less`
  - 移除胶囊按钮视觉，改为普通说明文本。

## 验证

- `node --check backend/data/object-storage.js`
- `node --check backend/data/moments.js`
- `node --check backend/server.js`
- `node --check backend/scripts/smoke-phase3-p2-contracts.js`
- `node backend/scripts/smoke-phase3-p2-contracts.js`
  - 公开榜单样本不返回 `uploaderProfileId` / `visibleProfileIds`。
  - 未绑定上传资产可 cleanup 并标记 `removedAt`。
  - 已绑定上传资产记录 `boundMomentId`，再次 cleanup 返回 409。
- `npm.cmd run check:encoding`
- `npm.cmd run typecheck`

## 边界

- 当前为本地实现和本地 smoke 通过；尚未提交、未推送、未部署到 `api.pomer.cn`。
- 未上传微信小程序包。
- 未做微信开发者工具预览框 QA；`FIX-014-11/12/15/17/18` 仍需在预览框检查交互和 Network 是否符合预期。
- 根目录 `npm.cmd install` 用于补齐新工作树 typecheck 依赖，报告既有 `10 vulnerabilities`；backend `npm.cmd install` 为 `0 vulnerabilities`，本轮未做无关升级。
