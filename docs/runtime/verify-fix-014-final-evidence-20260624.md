# FIX-014 最终独立验收证据（2026-06-24）

## 范围

- 产品边界：聚会记录师。
- 技术边界：仅验证 `api.pomer.cn/api/v1` 与 `jiuzhuopanguan` 后端；未触碰 `pomer.cn` 公司官网。
- 验收对象：
  - `FIX-014-02 R02`：真实 `readyShareImageUrl` 保存链路。
  - `VERIFY-014-01`：host/member/outsider/kicked/rejoin 权限矩阵。
  - `VERIFY-014-02`：真实 moment -> 审核 -> 推举 -> 榜单 -> 发奖 -> 积分流水 / operationLogs 链路。

## 样本

- manifest：`/tmp/fix-014-final-evidence-20260624-run7.private.json`（服务器私有，含完整 token；不得外传）。
- 脱敏证据：`docs/runtime/verify-fix-014-final-evidence-20260624.json`。
- sessionId：`session-1782287684779-15a736`
- briefId：`brief-1782287700412-4874f09e`
- shareTaskId：`share-task-1782287701617-388276de`
- tokenTail：
  - host：`dd932a79`
  - memberA：`52ff42bf`
  - memberB：`9d374a78`
  - outsider：`c8f30fc1`

## 结果

### FIX-014-02 R02

- `readyShareImageUrl`：`https://cdn.pomer.cn/moments/share-tasks/share-task-1782287701617-388276de.png`
- HTTP 探测：`200 image/png`，`byteLength=154497`
- 微信开发者工具预览框：
  - 截图：`docs/runtime/verify-fix-014-r02-wechat-ready-url-run7-20260624.png`
  - memberB tokenTail=`9d374a78`
  - 页面：`/pages/share-poster/index?sessionId=session-1782287684779-15a736`
  - `shareViewState=ready`
  - `canViewPosterContent=true`
  - `shareActionBlocked=false`
  - `readyShareImageUrl` 与 CDN URL 一致
  - `savePosterLabel=保存聚会图`

结论：R02 通过。该样本证明 ready 分享图 URL 已真实生成、持久化、公开可访问，并被小程序分享页读取。

### VERIFY-014-01

公开 API 在服务重启后复核：

- host 可读取 live：通过。
- member 可读取 live / brief / ready share task：通过。
- outsider 读取 live：`403 not session member`。
- memberB 被踢后读取 live / brief / share task：均 `403 not session member`。
- memberB 通过 inviteCode 重新加入后读取 live / brief / share task：通过。

结论：VERIFY-014-01 通过。

### VERIFY-014-02

- opening moment：`moment-1782287689447-d4f18373`
- nomination：`nomination-1782287707344-24f302ee`
- category：`best_opening`
- rankingRank：`1`
- payout：`ranking-reward-payout-1782287709720-c8797d87`
- rewardPoints：`60`
- nominationLedgerId：`ledger-1782287707348-c61c62e6`
- rewardLedgerId：`ledger-1782287709720-808a5379`
- operationLogs：
  - `admin-op-1782287709723-a89e11`
  - `admin-op-1782287689501-97fe79`
  - `admin-op-1782287689491-f08285`
- 服务重启后公开 API 复核：
  - ranking 包含目标 moment。
  - 公开榜单未返回 `uploaderProfileId`。
  - host 可见奖励积分流水，points=`60`。
  - memberA 可见推举积分流水，points=`70`。

结论：VERIFY-014-02 通过。

## 修复发现

验收中发现 `grantRankingRewards()` 依赖公开榜单序列化后的 `uploaderProfileId`，但阶段 3 P2 已按隐私边界从公开榜单裁剪该字段，导致发奖跳过。已修复为发奖内部按 momentId 从私有 moments store 读取上传者 profileId，不向公开榜单重新泄露内部身份字段。

相关提交：

- `c9acb27 fix: grant ranking rewards from private moment store`
- `8257336 test: persist verifier share evidence directly`
- `a5c3522 test: persist verifier ended state directly`
- `702e7a1 test: add public API evidence check`

## 清理

- cleanup 命令：`node backend/scripts/verify-fix-014-final-evidence.js --mode cleanup --manifest /tmp/fix-014-final-evidence-20260624-run7.private.json`
- residual scan：全 0。
  - socialProfiles / socialSessions / socialLoginLogs / contentCommerce：`0`
  - admin liveSessions / operationLogs / analyticsEvents：`0`
  - moments momentRecords / sessionEvents / sessionBriefs / shareImageTasks / momentNominations / rankingRewardPayouts / uploadedAssets：`0`
  - openingFileExists / shareImageFileExists：`false`

## 边界

- 微信预览框中两张源 moment 图片标记 `imageBroken=true`，但不影响本次 R02：ready 分享图 URL 本身已生成、可访问并在页面态读取。
- 未上传微信小程序包，不能写“正式发布准出”。
