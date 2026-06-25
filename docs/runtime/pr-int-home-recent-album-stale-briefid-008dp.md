# PR-INT FIX-014-01 `/sessions/live` 接口合同复核

时间：2026-06-23（Asia/Shanghai）

## 范围与结论

- 角色：接口联调替代执行载体。
- 任务：在 PM 门禁下只读/本地复核 `FIX-014-01` `/api/v1/sessions/live` 合同。
- 状态：**本地合同通过，线上只读回归通过，QA 预览框/邀请加入交互待验收**。
- 边界：未修改业务源码，未提交，未推送，未部署，未写线上数据，未修改 PM 总台账，未触碰 `pomer.cn` 公司官网。
- 写入范围：仅更新本证据文档 `docs/runtime/pr-int-fix-014-01-20260623.md`。
- 线上状态：PM 已将 `759be62 fix(backend): protect live session reads` 推送并部署到 `api.pomer.cn` 的 `jiuzhuopanguan-backend`；服务器 HEAD 为 `759be62ee34e9af2825363f59326f21693812ff2`，PM2 `jiuzhuopanguan-backend` online，`pomer` 官网服务未重启。

## 本轮输入核对

已读取并核对：

- `backend/server.js`
- `backend/data/live-session-access.js`
- `backend/scripts/smoke-live-session-privacy.js`
- `docs/runtime/pr-backend-fix-014-01-20260623.md`
- `docs/runtime/pr-int-fix-014-01-20260623.md`

当前路由判断要点：

- 无 `sessionId/inviteCode` 在进入 normalized/app_store 读取前返回 `400 sessionId or inviteCode required`。
- 只要存在 `sessionId`，先执行用户 token 与 app_store 成员校验；`sessionId + inviteCode` 不能由 inviteCode 绕过。
- 仅 `inviteCode` 场景通过 `getInviteLiveSessionAccess()` 判定是否 private。
- 只有 app_store session 存在、viewer 是该 app_store session 成员、实际返回 liveSession 的 `id/partyId` 与 app_store session 一致、请求/返回/app_store 的 inviteCode 全一致，才允许成员私有视图。
- app_store 缺失、viewer 非成员、normalized/app_store session 身份或 inviteCode 不一致时默认 public。

## 合同复核矩阵

| 场景 | 期望 | 本轮证据 | 判定 |
| --- | --- | --- | --- |
| 无 `sessionId/inviteCode` | `400 sessionId or inviteCode required` | smoke 返回 `anonymousDefaultStatus: 400`，脚本校验 message | 通过 |
| 匿名 `sessionId` | `401 unauthorized` | smoke 返回 `anonymousDirectStatus: 401` | 通过 |
| 非成员 `sessionId` | `403 not session member`，不泄露成员标识 | smoke 返回 `outsiderDirectStatus: 403`，脚本断言响应不含 host profileId | 通过 |
| 成员 `sessionId` | `200` 私有成员视图 | smoke 返回 `memberDirectStatus: 200`，脚本断言含 `hostProfileId` 与 `joinedPlayers` | 通过 |
| 匿名 `sessionId + inviteCode` | 不能绕过，仍按 `sessionId` 私有读取处理 | smoke 返回 `anonymousMixedStatus: 401` | 通过 |
| 匿名 `inviteCode` | `200` 严格公开白名单 | smoke 返回 `200`，只含 13 个字段，且脚本断言不含私有字段 | 通过 |
| 成员 `inviteCode` | 仅在 app_store session、viewer membership、实际返回 liveSession ID/partyId、inviteCode 全一致时 private | 策略模块与 HTTP smoke 均通过；`memberInviteStatus: 200`，成员视图保留私有字段 | 通过 |
| normalized/app_store 身份不一致 | 必须默认 public | `smoke-live-session-privacy.js` 直接执行 `getInviteLiveSessionAccess()` 覆盖 session ID 不一致、inviteCode 不一致、app_store 缺失均 public；输出 `normalizedAppStoreIdentityMismatchDefaultsToPublic: true` | 通过 |

匿名 `inviteCode` 公开白名单实测为 13 个字段：

```text
hostName,id,inviteCode,joinedCount,partyId,playerCount,sessionName,stateText,status,subtitle,templateImageUrl,templateName,title
```

明确不包含 `hostProfileId`、成员数组、头像、照片、时间线、`visibleNodes`、`ledgerSummary`、分享内容过滤等私有字段。

## 本地验证

环境：PowerShell `7.6.3`。

按要求串行执行，未并发运行共享 store smoke：

```powershell
node --check backend/data/live-session-access.js
node --check backend/server.js
node --check backend/scripts/smoke-live-session-privacy.js
node backend/scripts/smoke-live-session-privacy.js
```

结果：

| 命令 | 退出码 | 输出摘要 |
| --- | ---: | --- |
| `node --check backend/data/live-session-access.js` | 0 | 无输出，语法通过 |
| `node --check backend/server.js` | 0 | 无输出，语法通过 |
| `node --check backend/scripts/smoke-live-session-privacy.js` | 0 | 无输出，语法通过 |
| `node backend/scripts/smoke-live-session-privacy.js` | 0 | HTTP smoke 通过，动态端口 `5251` |

smoke 原文摘要：

```json
{
  "anonymousDefaultStatus": 400,
  "anonymousDirectStatus": 401,
  "anonymousInviteKeys": [
    "hostName",
    "id",
    "inviteCode",
    "joinedCount",
    "partyId",
    "playerCount",
    "sessionName",
    "stateText",
    "status",
    "subtitle",
    "templateImageUrl",
    "templateName",
    "title"
  ],
  "anonymousMixedStatus": 401,
  "memberDirectStatus": 200,
  "memberInviteStatus": 200,
  "normalizedAppStoreIdentityMismatchDefaultsToPublic": true,
  "ok": true,
  "outsiderDirectStatus": 403,
  "port": 5251
}
```

### DEP0169 告警边界

smoke 退出码为 0，但 Node 输出：

```text
[DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead.
```

该告警不影响本次断言与退出码；属于现有 `url.parse()` 弃用治理范围，不作为 `FIX-014-01` 合同阻塞项。

## 线上部署后只读回归

本节记录 PM 已跑过的线上只读矩阵；未输出完整 token，成员与非成员只记录 tokenTail。

目标环境：

- 域名：`https://api.pomer.cn`
- 服务：`jiuzhuopanguan-backend`
- 服务器 HEAD：`759be62ee34e9af2825363f59326f21693812ff2`
- PM2：`jiuzhuopanguan-backend` online
- 官网边界：`pomer` 官网服务未重启，未触碰 `pomer.cn`

线上只读矩阵：

| 场景 | 请求 | token 记录 | 结果 | 判定 |
| --- | --- | --- | --- | --- |
| 健康/配置探测 | `GET https://api.pomer.cn/api/v1/config/home` | 无 | `200` | 通过 |
| 无 `sessionId/inviteCode` | `GET https://api.pomer.cn/api/v1/sessions/live` | 无 | `400`，message `sessionId or inviteCode required` | 通过 |
| 匿名 `sessionId` | `GET https://api.pomer.cn/api/v1/sessions/live?sessionId=session-1782137141037-b4e84c` | 无 | `401` | 通过 |
| 匿名 `inviteCode` | `GET https://api.pomer.cn/api/v1/sessions/live?inviteCode=XBAABB` | 无 | `200`，data 仅 13 个公开白名单字段 | 通过 |
| 匿名 `sessionId + inviteCode` | `GET https://api.pomer.cn/api/v1/sessions/live?sessionId=session-1782137141037-b4e84c&inviteCode=XBAABB` | 无 | `401` | 通过 |
| 成员 `sessionId` | 服务器内只读脚本调用 `sessionId` | tokenTail `1dace82d` | `200`，keyCount `29`，`hasHostProfileId=true`，`hasJoinedPlayers=true` | 通过 |
| 成员 `inviteCode` | 服务器内只读脚本调用 `inviteCode` | tokenTail `1dace82d` | `200`，keyCount `29`，`hasHostProfileId=true`，`hasJoinedPlayers=true` | 通过 |
| 非成员 `sessionId` | 服务器内只读脚本调用 `sessionId` | tokenTail `b81a4c83` | `403`，不含私有字段 | 通过 |
| 非成员 `sessionId + inviteCode` | 服务器内只读脚本调用 mixed | tokenTail `b81a4c83` | `403`，不含私有字段 | 通过 |

匿名 `inviteCode` 线上公开白名单字段为 13 个：

```text
hostName,id,inviteCode,joinedCount,partyId,playerCount,sessionName,stateText,status,subtitle,templateImageUrl,templateName,title
```

线上回归未记录响应值中的用户昵称；本证据仅保留字段名、HTTP 状态、tokenTail 与私有字段布尔检查。

## 残留状态

执行残留扫描：

```powershell
rg -n "privacy-smoke|live-privacy-" backend/data --glob "*.json"
Test-Path -LiteralPath backend/data/.smoke-live-session-privacy.lock
Get-NetTCPConnection -LocalPort 5251 -ErrorAction SilentlyContinue
git status --short -- backend/data docs/runtime/pr-int-fix-014-01-20260623.md
```

结果：

- `backend/data/**/*.json` 未检出 `privacy-smoke` 或 `live-privacy-` marker。
- `backend/data/.smoke-live-session-privacy.lock` 不存在。
- 动态端口 `5251` smoke 结束后无监听。
- `backend/data` 没有因 smoke 产生 JSON store 修改。
- `git status` 显示 `backend/data/live-session-access.js` 与本证据文档为未跟踪文件；`live-session-access.js` 属于已有后端/PM 工作区改动，本轮未修改。
- 未生成上传文件、线上数据或敏感 token。

## 首轮退回历史保留

首轮接口联调曾判定为“退回后端/待复核”，原因是当时 app_store 本地合同矩阵通过，但 normalized 与 app_store 不一致时尚未完整 fail-closed；旧 smoke 关闭 normalized，只做源码字符串断言，不能作为该分支行为证据。

退回项：

- 编号：`INT-FIX-014-01-R01`
- 问题：跨存储不一致存在 fail-open 风险。
- 风险条件：app_store 根据邀请码命中聚会 A 且认定 token 用户为 A 成员，但 normalized 因数据漂移/异常命中聚会 B 或返回与 A 不一致的聚会时，可能返回 B 的完整成员视图。
- 修补要求：仅当 app_store 明确认定成员，且实际返回 liveSession 的 `id/inviteCode` 与 app_store 鉴权对象一致时，才允许私有视图；任一条件缺失或不一致均公开裁剪。
- 本轮复核：`backend/data/live-session-access.js` 已提供 fail-closed 策略，`backend/server.js` 的 normalized/app_store 返回路径均调用同一 `shouldUsePublicInviteView(liveSession)`；smoke 直接执行策略模块并输出 `normalizedAppStoreIdentityMismatchDefaultsToPublic: true`，该退回项本地合同复核通过。

## 未验证项

- 未做微信开发者工具预览框测试；QA 仍需验收邀请加入交互、授权链路和页面态。
- 未做真机测试；当前只记录本地合同与线上只读接口回归。
- 本地 smoke 强制关闭 MySQL/normalized 读写，normalized/app_store 不一致由策略模块级可执行断言覆盖；线上已完成只读接口矩阵，但未覆盖前端预览框里的完整用户交互。

## PM 回报

本地合同复核结论：**本地合同通过，线上只读回归通过，QA 预览框/邀请加入交互待验收**。

下一步责任：

- QA 使用微信开发者工具预览框验收邀请加入交互、成员私有视图、匿名公开预览与无参/异常态。
- 如进入发布准出，再由 PM 另开真机采集任务；本轮不把真机截图作为接口联调阻塞。
