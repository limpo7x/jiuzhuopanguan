# PR-PM-LINK-CLEANUP-008K-LIMITED-THAW-READINESS

记录时间：2026-06-18

本文件是 PM 有限解冻复测 runbook。当前仍保持 DevTools hard freeze；本文件不是解冻令，不代表页面通过、UI/UX 通过、真机通过、提交审核通过或上线通过。

## 1. 复测前准入

必须同时满足以下条件，PM 才能另发“有限解冻复测令”：

| 准入项 | 要求 |
| --- | --- |
| 责任人 | 只允许测试验收负责人执行；前端、UIUX、PM 不并行操作 DevTools。 |
| 任务矩阵 | 测试计划 13.16.78、13.16.79、13.16.80、13.16.81 已就绪；13.16.81 已把 13.16.78 个人中心路径修正为 `/pages/me/index`。 |
| 样本 | 使用 008G 非白样本：sessionId=`session-1781787045680-8e406c`，inviteCode=`J2BEL2`，briefId=`brief-1781787045693-bc8904b9`，ready shareTaskId=`share-task-1781787045694-9725ffeb`，memberA token tail=`b8615971`。 |
| 工具纪律 | 不并行、不清 Storage、不重启 DevTools、不高频 relaunch、不执行未列入 runbook 的页面矩阵。 |
| 证据纪律 | 每一步记录命令原文、开始/结束时间、page/query、data 摘要、Console、storage token 后 8 位、截图路径。完整 token 不得入文档。 |

## 2. 立即停止条件

任一条件出现，测试必须立即停止，不继续下一步，并退回 PM：

- `Connection closed`
- 黑屏、白屏、窗口无响应
- `status --storage` 中 API base、profileId、token 后 8 位与样本不匹配
- Console 出现阻塞红错
- 截图失败且无法取得可解释 page data
- 页面出现 `not session member`、`brief not found`、`task failed`、审核阻塞文案、旧品牌主文案、工程字段或完整 token

## 3. 串行命令顺序

以下命令为有限解冻后的唯一建议顺序。PM 未发令前不得执行。

### 0. 前置状态

```powershell
npm.cmd run wechat:auto -- status --port 9420 --storage --output docs/runtime/pr-qa-link-cleanup-008k-00-status-20260618.png
```

记录：page/query、Console、storage API base、profileId、token 后 8 位。若 token tail 不是 `b8615971`，停止。

### 1. 首页最近相册 / 底部工具箱入口

```powershell
npm.cmd run wechat:auto -- relaunch --port 9420 --path /pages/index/index --wait 5000 --data home,sessionReturn,loggedIn,errorText --output docs/runtime/pr-qa-link-cleanup-008k-01-home-20260618.png
```

验收重点：最近相册有图用首张非白照片，无图才默认；底部仅 `首页 / 工具箱 / 我的`；不出现旧品牌或工程字段。

### 2. 工具箱列表

```powershell
npm.cmd run wechat:auto -- relaunch --port 9420 --path /pages/tools/index --wait 5000 --data allTools,filteredTools,popularTools,categoryCards,activeCategory,activeCategoryName,searchKeyword --output docs/runtime/pr-qa-link-cleanup-008k-02-tools-20260618.png
```

验收重点：沿用旧工具箱清单；列表可见；后续可用单次 tap 抽测 3 个工具详情，不得并行。

### 3. 个人中心

```powershell
npm.cmd run wechat:auto -- relaunch --port 9420 --path /pages/me/index --wait 5000 --data currentProfile,features,assetStats,wineStats,momentSummaries,errorText --output docs/runtime/pr-qa-link-cleanup-008k-03-me-20260618.png
```

验收重点：入口去重并按功能分流，不得多数入口跳相册。

### 4. 创建页

```powershell
npm.cmd run wechat:auto -- relaunch --port 9420 --path /pages/create-session/index --wait 5000 --data sessionName,currentTimeText,playerCount,templates,templatesLoading,errorText --output docs/runtime/pr-qa-link-cleanup-008k-04-create-20260618.png
```

验收重点：时间为当前实时文案；无轻量主题选择；无用户可见“主题”文案；高级设置不阻塞三步链路。

### 5. 邀请预览 / 口令加入状态

```powershell
npm.cmd run wechat:auto -- relaunch --port 9420 --path "/pages/share-preview/index?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2&briefId=brief-1781787045693-bc8904b9" --wait 5000 --data inviteCode,inviteStatusText,joinedCount,playerCount,photoHighlights,accountingHighlights,keyEvents,shareSummary,errorText --output docs/runtime/pr-qa-link-cleanup-008k-05-invite-preview-20260618.png
```

验收重点：邀请预览不展示“照片记录+聚会账本”说明模块，不展示安全区模块，不展示分享给好友、分享到群、保存海报按钮；page data 不含 `shareItems` 旧动作。

### 6. 进行中记录页

```powershell
npm.cmd run wechat:auto -- relaunch --port 9420 --path "/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=member" --wait 5000 --data sessionId,activeSegment,photoNodes,timelineNodes,ledgerTimelineItems,records,description,defaultChips,errorText --output docs/runtime/pr-qa-link-cleanup-008k-06-live-record-20260618.png
```

验收重点：图片直显；账本动态可见；无审核阻塞文案；说明文案与默认 chip 仍可见。

### 7. 账本页

```powershell
npm.cmd run wechat:auto -- relaunch --port 9420 --path "/pages/ledger/index?sessionId=session-1781787045680-8e406c&role=judge" --wait 5000 --data stats,players,isJudge,isHost,ledgerEditable,ledgerEventCount,ledgerItems,canAdjustLedger,ledgerActions,keyEventButtonVisible,errorText --output docs/runtime/pr-qa-link-cleanup-008k-07-ledger-20260618.png
```

验收重点：欠酒/加酒数据可见；头像/用户名可见；judge/host 可编辑；无“保存关键事件”按钮替代账本。

### 8. 聚会简报和大图 probe

```powershell
npm.cmd run wechat:auto -- relaunch --port 9420 --path "/pages/session-brief/index?sessionId=session-1781787045680-8e406c&briefId=brief-1781787045693-bc8904b9" --wait 5000 --data timelineNodes,photoHighlights,accountingHighlights,keyEvents,previewableImageCount,previewImageUrl,previewImageCount,ledgerSummary,errorText,loading --output docs/runtime/pr-qa-link-cleanup-008k-08-brief-20260618.png
```

如页面有 `.brief-image-preview-probe`：

```powershell
npm.cmd run wechat:auto -- tap --port 9420 --path "/pages/session-brief/index?sessionId=session-1781787045680-8e406c&briefId=brief-1781787045693-bc8904b9" --selector .brief-image-preview-probe --selectorTimeout 8000 --wait 3000 --data previewableImageCount,previewImageUrl,previewImageCount,errorText,loading --output docs/runtime/pr-qa-link-cleanup-008k-08-brief-preview-20260618.png
```

验收重点：照片非白可见；大图可触发；若 automator 不能证明系统大图返回，只能写“probe 通过 / 大图返回待人工预览框补证”。

### 9. 相册

```powershell
npm.cmd run wechat:auto -- relaunch --port 9420 --path "/pages/album/index?partyId=session-1781787045680-8e406c&albumId=album-session-1781787045680-8e406c" --wait 5000 --data items,photos,coverImageUrl,recentAlbums,title,pageTitle,loading,emptyText,errorText --output docs/runtime/pr-qa-link-cleanup-008k-09-album-20260618.png
```

验收重点：有图封面为第一张上传照片；无图默认；不出现旧“酒桌判官”封面或白卡。

### 10. 分享页 / 保存图

```powershell
npm.cmd run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?sessionId=session-1781787045680-8e406c&briefId=brief-1781787045693-bc8904b9&taskId=share-task-1781787045694-9725ffeb" --wait 5000 --data photoHighlights,accountingHighlights,keyEvents,readyShareImageUrl,shareTask,saveState,errorText,posterImagePath,posterImageUrl,ledgerIncluded,displayTaskLayoutMode --output docs/runtime/pr-qa-link-cleanup-008k-10-share-poster-20260618.png
```

验收重点：照片 + 聚会账本/酒桌记账高光同屏；保存图来源一致；ready PNG 早于替换照片的 warning 必须单列记录。

### 11. 分享回流

```powershell
npm.cmd run wechat:auto -- relaunch --port 9420 --path "/pages/share-preview/index?shareId=share-return-session-1781787045680-8e406c&inviteCode=J2BEL2&briefId=brief-1781787045693-bc8904b9" --wait 5000 --data shareSummary,photoHighlights,accountingHighlights,keyEvents,inviteStatusText,visibleNodeIds,filteredNodeIds,permissionState,shareContentFilter,errorText --output docs/runtime/pr-qa-link-cleanup-008k-11-share-preview-20260618.png
```

验收重点：分享回流无旧按钮、无工程字段；照片/账本/关键事件仍存在。

### 12. 等待页旧词回归

```powershell
npm.cmd run wechat:auto -- relaunch --port 9420 --path "/pages/waiting-room/index?sessionId=session-1781787045680-8e406c" --wait 5000 --data sessionId,sessionName,joinedCount,playerCount,joinedPlayers,errorText,loading --output docs/runtime/pr-qa-link-cleanup-008k-12-waiting-room-20260618.png
```

验收重点：截图、page data、toast/modal/errorText 无 `酒局`、`酒桌判官`、`判官`、`惩罚`、`罚酒`。

## 4. 结论书写规则

测试回包只能使用以下结论：

- `预览框阶段通过 / 待 UIUX 复核`
- `退回前端`
- `退回接口联调 / 后端`
- `退回 UIUX`
- `工具链异常，停止并退 PM`
- `待人工预览框补证`

禁止写：

- `真机通过`
- `上线通过`
- `提交审核通过`
- `全链路完成`
- `用户操作导致`
