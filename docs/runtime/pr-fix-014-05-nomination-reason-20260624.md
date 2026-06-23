# FIX-014-05 证据：推举资格原因与前台文案

- 任务编号：`FIX-014-05`
- 角色：后端/API、前端
- 工作树：`F:\codexlist\jiuzhuopanguan-fix-014-05`
- 分支：`codex/fix-014-05-nomination-reason-copy`
- 基线：`origin/main` / `e6946388`
- 技术边界：仅 `api.pomer.cn` / `jiuzhuopanguan` 合同和小程序前端；未触碰 `pomer.cn` 官网。

## 范围

本轮只处理推举资格原因码和前台文案：

- 后端 `/api/v1/moments/:id/nomination-eligibility` 增加稳定 `reasonCode/reasonText`。
- 小程序前端不再展示“照片审核通过后可推举”“待审核”等含混旧文案。
- 相册、聚会简报、今日回忆榜统一使用原因码映射文案。
- 保留真实风控边界：内容安全确认、公开授权、私密可见性、榜单资格仍会阻止推举。

未处理：

- 未启动 `FIX-014-06` 分享页来源感知返回。
- 未改后台审核流程或新增后台页面。
- 未创建线上真实样本，未做预览框点击复测。

## 改动

- `backend/data/moments.js`
  - 新增推举资格原因归一化。
  - `getMomentNominationEligibility()` 返回 `reasonCode/reasonText`。
  - `createMomentNomination()` 使用中文 `reasonText` 抛出不可推举错误。
- `backend/scripts/smoke-nomination-eligibility-reasons.js`
  - 新增本地 smoke，覆盖未授权、内容确认中、后台通过后三种状态。
  - 脚本备份并恢复本地 admin/moments store。
- `miniprogram/services/operations.ts`
  - `ManagedMomentNominationEligibility` 增加 `reasonCode/reasonText`。
- `miniprogram/utils/nomination-reason.ts`
  - 新增统一文案映射。
- `miniprogram/pages/album/index.ts|wxml`
  - 相册推举按钮和 toast 使用具体原因，不再写“照片审核通过后可推举”。
- `miniprogram/pages/session-brief/index.ts`
  - 简报推举卡片、刷新资格、点击不可用提示使用统一原因文案。
  - 不再跳过不可推举节点的资格查询。
- `miniprogram/pages/rankings/index.ts`
  - 今日回忆榜推举失败提示使用统一原因文案。

## 原因码

- `ranking_consent_required`：需公开授权后可推举。
- `visibility_not_public`：私密照片不能参与回忆榜。
- `content_review_required`：内容安全确认后可参与回忆榜。
- `ranking_not_enabled`：暂未满足回忆榜资格。
- `media_incomplete`：照片还没有保存完成。
- `moment_removed`：这张照片已被移出榜单候选。
- `already_nominated_today`：今天已推举过这张照片。

## 验证

- `node --check backend/data/moments.js`
- `node --check backend/server.js`
- `node --check backend/scripts/smoke-nomination-eligibility-reasons.js`
- `node backend/scripts/smoke-nomination-eligibility-reasons.js`
  - `ranking_consent_required`
  - `content_review_required`
  - 后台 `approve` 后 `eligible=true`
- `npm.cmd run check:encoding`
- `npm.cmd run typecheck`
- `git diff --check`

新工作树依赖补齐：

- 根目录 `npm.cmd install`：通过；报告既有 `10 vulnerabilities`，未做无关升级。
- `backend\npm.cmd install`：通过；0 vulnerabilities。

## 未覆盖

- 未做线上真实样本推举。
- 未做微信开发者工具预览框截图。
- 未做小程序包上传。

## 结论

`FIX-014-05` 本地合同、前端文案和 smoke 验证通过，可进入提交/推送/部署前复核；当前不能写正式发布准出。
