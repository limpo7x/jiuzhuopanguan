# 测试验收：结束后再分享链路

时间：2026-06-22

角色：测试验收负责人

状态：通过（预览框阶段）

## 范围

PM 派发路径：

1. 创建聚会。
2. 进入记录页进行中状态，确认 tab 中没有“分享”。
3. 拍/上传一张记录照片。
4. 点击底部“结束聚会”。
5. 结束成功后自动跳转分享页。
6. 分享页能展示生成中/成功/失败的合理状态，不出现进行中直接生成分享图的入口。

本轮复测使用当前开发者工具中的既有测试聚会 `session-1782115376791-57078d`，未重新创建新聚会；该聚会已有 5 张记录照片，满足“结束前已有照片”的业务前提。

## 复测证据

### 记录页进行中

- 页面路径：`pages/live-record/index?sessionId=session-1782115376791-57078d`
- 页面状态：`activeSegment=record`
- 聚会名：`决战到天亮`
- 照片数量：`photoNodes.length=5`
- Tab 展示：只有 `记录 / 相册 / 账本`，没有 `分享`。
- 截图：`docs/runtime/pr-qa-end-share-flow-before-end-20260622.png`
- Console：自动化采集未发现新增阻塞错误。
- Network：本次自动化未直接抓取 Network 面板；页面数据和图片均成功加载，未发现阻塞 401/404/5xx 造成的页面错误。

### 结束后跳转分享页

- 操作：mock `wx.showModal` 确认后点击 `.live-record008as-end-cta`。
- 结束前：`isJudge=true`、`activeSegment=record`。
- 结束后页面路径：`pages/share-poster/index?sessionId=session-1782115376791-57078d`
- 分享页状态：
  - `briefId=brief-1782115935868-7921ead6`
  - `shareTaskId=share-task-1782116164508-dfbfa9d4`
  - `shareTaskStatus=ready`
  - `displayTaskStatus=可保存`
  - `savePosterLabel=保存聚会图`
  - `posterStatusLine=分享图已准备好`
  - `errorText=` 空
- 截图：`docs/runtime/pr-qa-end-share-flow-after-end-20260622.png`
- Console：自动化采集未发现新增阻塞错误。
- Network：本次自动化未直接抓取 Network 面板；分享页数据成功加载，未发现阻塞 401/404/5xx 造成的页面错误。

## 代码核查

- `miniprogram/pages/live-record/index.wxml`：记录页 tab 当前为 `记录 / 相册 / 账本`，已去掉进行中态 `分享` tab。
- `miniprogram/pages/live-record/index.ts`：`handleFinishTap()` 调用 `finishManagedSession()` 成功后跳转 `/pages/share-poster/index?sessionId=...`。

## 结论

通过（预览框阶段）。

不得写正式真机发布通过；本轮未提供真机截图、录屏或体验版准出证据。

## 未覆盖

- 未重新走“创建聚会 -> 首次上传照片”的完整新样本流程；本轮复用当前已有测试聚会完成结束后跳分享核心链路复测。
