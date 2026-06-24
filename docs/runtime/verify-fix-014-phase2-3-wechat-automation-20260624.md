# FIX-014 阶段2/3微信开发者工具自动化复测

- 日期：2026-06-24
- 工作树：`F:\codexlist\jiuzhuopanguan-fix-014-phase3`
- 分支：`codex/fix-014-phase3-p2-stability`
- 自动化端口：`9420`
- 边界：仅测试 `api.pomer.cn` / `jiuzhuopanguan`，未触碰 `pomer.cn` 公司官网。

## 自动化能力变更

- `scripts/wechat-devtools-automator.js` 新增 `set-storage` 命令。
- 支持 `--storageStdin` 从 stdin 写入微信 storage，便于测试账号切换。
- `jzp-user-token` 与 `social-user-session-token` 继续只输出 `length/tokenTail`，不落完整 token。

验证：

```powershell
node --check scripts/wechat-devtools-automator.js
```

结果：通过。

## 阶段2/3复测结果

### 成员分享页

- 测试账号：成员 `tokenTail=1dace82d`，`profileId=user-1782114038371-8b9a52`
- 路径：`/pages/share-poster/index?sessionId=session-1782137141037-b4e84c`
- 截图：
  - `docs/runtime/verify-014-phase2-3-member-share-poster-1dace82d-20260624.png`
  - `docs/runtime/verify-014-phase2-3-member-share-poster-after-close-1dace82d-20260624.png`

结果：

- `shareViewState=ready`
- `canViewPosterContent=true`
- `shareActionBlocked=false`
- `photoHighlights` 可展示 2 条照片。
- `accountingHighlights` 可展示。
- `readyShareImageUrl=""`

结论：成员可见回归成立；仍未覆盖真实 readyShareImageUrl 保存链路。

### 非成员分享页

- 测试账号：非成员 `tokenTail=b81a4c83`，`profileId=user-1782177960380-f19492`
- 路径：`/pages/share-poster/index?sessionId=session-1782137141037-b4e84c`
- 截图：
  - `docs/runtime/verify-014-phase2-3-nonmember-share-poster-b81a4c83-20260624.png`
  - `docs/runtime/verify-014-phase2-3-nonmember-share-poster-after-close-b81a4c83-20260624.png`

线上只读核对：

- `session-1782137141037-b4e84c` 成员仅包含 host `user-1782137080503-3f0c61` 和 member `user-1782114038371-8b9a52`。
- `b81a4c83` 对应 `user-1782177960380-f19492`，不是成员。
- 同 token 直接 POST `https://api.pomer.cn/api/v1/sessions/session-1782137141037-b4e84c/brief` 返回 HTTP 403，message 为 `not session member`。

预览框结果：

- `errorText="当前账号已不在这场聚会中，暂不能查看分享图"`
- 但 `shareViewState=ready`
- `canViewPosterContent=true`
- `shareActionBlocked=false`

结论：后端权限合同正确；微信开发者工具预览框加载的前端包未刷新到当前源码，错误文本未转阻断态，不能判定阶段2/3预览框权限阻断通过。

### 创建页预设

- 路径：`/pages/create-session/index`
- 截图：
  - `docs/runtime/verify-014-phase2-3-create-session-presets-1dace82d-20260624.png`
  - `docs/runtime/verify-014-phase2-3-create-session-presets-after-cache-attempt-1dace82d-20260624.png`

源码当前预设：

- 今晚的聚会
- 朋友小聚
- 生日聚会
- 老友见面
- 团建聚会
- 周末小聚
- 家庭聚会
- 露营相册

预览框 data 仍出现旧预设：

- 复仇局
- 生'史'局
- 翻盘局
- 决战到天亮
- 下班放松局

已尝试刷新：

- `scripts/start-wechat-devtools-automation.ps1 -Port 9420 -ProjectPath F:\codexlist\jiuzhuopanguan-fix-014-phase3 -QuitExisting`
- `cli.bat cache --clean compile --project F:\codexlist\jiuzhuopanguan-fix-014-phase3 --port 48833`
- `cli.bat close --project F:\codexlist\jiuzhuopanguan-fix-014-phase3 --port 48833`

阻断原文：

- `cache --clean compile` 返回 `需要重新登录 (code 10)`。

结论：创建页预览框仍为旧编译包，阶段3 `FIX-014-16` 预览框验收退回。

### 现场记录分享 tab

- 路径：`/pages/live-record/index?sessionId=session-1782137141037-b4e84c`
- 截图：`docs/runtime/verify-014-phase2-3-live-record-share-tab-1dace82d-20260624.png`

源码当前 WXML 已包含：

- 禁用态 `分享` tab。
- 提示文案：结束聚会后会生成分享图，可在这里或“我的”里查看和保存。

预览框结果：

- 页面只显示 `记录 / 相册 / 账本` 三个 tab。
- 自动化点击 `.live-segment-tab-disabled` 失败：`Selector not found: .live-segment-tab-disabled`
- 自动化点击 `[data-tab='share']` 失败：`Selector not found: [data-tab='share']`

结论：现场记录页预览框仍为旧 WXML，阶段3 `FIX-014-17` 预览框验收退回。

## 独立验收负责人结论

独立验收负责人只读核对后给出结论：

- `VERIFY-014-01` 仍缺 host/member/kicked/rejoined 完整线上矩阵、清理结果和残留扫描。
- `VERIFY-014-02` 仍缺真实线上 moment 后台通过、推举资格、公开分享候选、榜单、发奖、积分流水和 operationLogs 全链路证据。
- `VERIFY-014-03` 可继续用微信开发者工具自动化推进，但当前预览框旧包问题必须先固定；不能写正式发布准出。

## 当前结论

- 阶段2/3后端接口权限证据局部成立。
- 阶段2/3微信开发者工具预览框自动化不通过，原因是开发者工具当前预览包未刷新到最新源码，且 CLI 编译缓存清理被登录态阻断。
- 不得写阶段2/3预览框通过或正式发布准出。

## 登录刷新后复测

用户已重新登录并刷新微信开发者工具。PM 按最新项目规则改用：

```powershell
& "D:\wechatkaifa\wechat_devtools_1.05.2204250_x64\cli.bat" auto --project F:\codexlist\jiuzhuopanguan-fix-014-phase3 --auto-port 9420 --trust-project
```

补充说明：

- `--auto-port 9420` 可恢复 `miniprogram-automator` SDK 控制，`npm.cmd run wechat:auto -- status --port 9420 --storage` 返回 `ok=true`。
- 若同时把 IDE HTTP server 固定为 `--port 9420`，`islogin --port 9420` 可返回 `{"login":true}`，但 SDK WebSocket 会被 HTTP server 占用，`wechat:auto status` 反而失败；因此本轮以 SDK 可执行 `currentPage/storage/screenshot/tap/request` 为控制准入。
- `scripts/start-wechat-devtools-automation.ps1` 默认 CLI 已改为 `D:\wechatkaifa\wechat_devtools_1.05.2204250_x64\cli.bat`。
- `scripts/wechat-devtools-automator.js` 新增只读 `request` 命令，用预览框内部 `wx.request` 验证 API；输出只记录 status、业务 code/message、字段名和 tokenTail。

### API base 修正

首轮重测时 storage 写入了 `runtime-api-base=https://api.pomer.cn`，导致预览框内部实际请求：

- `https://api.pomer.cn/share/config`
- `https://api.pomer.cn/sessions/live?...`
- `https://api.pomer.cn/sessions/.../brief`

均返回 HTTP 404。修正为 `runtime-api-base=https://api.pomer.cn/api/v1` 后，预览框内部 `wx.request` 结果：

- `/share/config`：HTTP 200，`code=0`。
- `/sessions/live?sessionId=session-1782137141037-b4e84c`，成员 tokenTail `1dace82d`：HTTP 200，`code=0`，`photoHighlightCount=2`。
- `/sessions/session-1782137141037-b4e84c/brief`，成员 tokenTail `1dace82d`：HTTP 201，`code=0`，`timelineNodeCount=2`。
- `/sessions/session-1782137141037-b4e84c/brief`，非成员 tokenTail `b81a4c83`：HTTP 403，message `not session member`。
- `/sessions/live?sessionId=session-1782137141037-b4e84c`，非成员 tokenTail `b81a4c83`：HTTP 403，message `not session member`。

### 成员分享页复测

- 账号：成员 tokenTail `1dace82d`，profileId `user-1782114038371-8b9a52`。
- 路径：`/pages/share-poster/index?sessionId=session-1782137141037-b4e84c`。
- 截图：`docs/runtime/verify-014-phase2-3-member-share-poster-final-1dace82d-20260624.png`。

结果：

- `shareViewState=ready`
- `canViewPosterContent=true`
- `shareActionBlocked=false`
- `permissionState=public`
- `photoCount=2`
- `photoHighlights.length=2`
- `posterTimelineNodes.length=2`
- `accountingHighlights.length=4`
- `sessionName=卐卍`
- `memberCount=2`
- `savePosterLabel=生成聚会图`
- `readyShareImageUrl=""`

结论：成员分享页预览框回归通过；仍未覆盖真实 readyShareImageUrl 保存链路。

### 非成员分享页复测

- 账号：非成员 tokenTail `b81a4c83`，profileId `user-1782177960380-f19492`。
- 路径：`/pages/share-poster/index?sessionId=session-1782137141037-b4e84c`。
- 截图：`docs/runtime/verify-014-phase2-3-nonmember-share-poster-final-b81a4c83-20260624.png`。

结果：

- `shareViewState=notMember`
- `canViewPosterContent=false`
- `shareActionBlocked=true`
- `permissionState=notMember`
- `errorText=当前账号已不在这场聚会中，暂不能查看分享图`
- `photoHighlights=[]`
- `posterTimelineNodes=[]`
- `accountingHighlights=[]`
- `keyEvents=[]`
- `readyShareImageUrl=""`
- `posterImageUrl=""`
- `savePosterLabel=暂不可用`

结论：非成员分享页权限阻断预览框通过；未泄露照片、时间线、账本、ready 图或正常保存入口。

### 创建页预设复测

- 路径：`/pages/create-session/index`。
- 截图：`docs/runtime/verify-014-phase2-3-create-session-presets-final-1dace82d-20260624.png`。

预览框 data `sessionNamePresets`：

- 今晚的聚会
- 朋友小聚
- 生日聚会
- 老友见面
- 团建聚会
- 周末小聚
- 家庭聚会
- 露营相册

结论：`FIX-014-16` 预览框阶段通过。

### 现场记录分享 tab 复测

- 路径：`/pages/live-record/index?sessionId=session-1782137141037-b4e84c`。
- 截图：
  - `docs/runtime/verify-014-phase2-3-live-record-share-tab-final-1dace82d-20260624.png`
  - `docs/runtime/verify-014-phase2-3-live-record-share-tab-tap-final-1dace82d-20260624.png`

结果：

- 页面 data：`sessionName=卐卍`、`memberCountText=2/2 人`、`photoNodes.length=2`、`recordTimelineDisplayItems.length=2`。
- 自动化点击 `.live-segment-tab-disabled` 成功。
- 点击后 `activeSegment` 保持 `record`。

结论：`FIX-014-17` 预览框阶段通过；禁用态分享 tab 已在预览框 DOM 中存在，且不会切换到未开放分享态。

## 登录刷新后当前结论

- `FIX-014-02` R01 非成员阻断：预览框阶段通过。
- `FIX-014-16` 创建聚会预设：预览框阶段通过。
- `FIX-014-17` 现场记录禁用分享 tab：预览框阶段通过。
- `FIX-014-02` R02 仍未覆盖：当前样本没有真实 `readyShareImageUrl`，不能证明完整 ready 图 URL 保存链路。
- 独立验收 `VERIFY-014-01` 与 `VERIFY-014-02` 仍缺完整线上矩阵和真实 moment 全链路证据，不得写正式发布准出。
