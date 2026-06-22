# PR-BE-008FA 个人中心已结束统计后端/API 对账记录

时间：2026-06-22 04:11（Asia/Shanghai）

## 范围

- 角色：后端/API 负责人
- 问题：个人中心“已结束”统计为 0
- 后端合同：`GET /api/v1/user/session-moment-summaries`
- 技术边界：仅核查本仓库 `jiuzhuopanguan` 后端/API；未触碰 `pomer.cn` 官网

## 结论

- 本地后端函数合同已满足：已结束 session 会保留在 `liveSessions`，不会因结束被删除；如果有 report，也继续保留在 `reports`。
- `GET /api/v1/user/session-moment-summaries` 每条摘要返回 `state/status/stateText/endedAt/updatedAt/canResume`；已结束统一返回 `state=status=stateText=已结束`，且 `canResume=false`。
- 结束态来源优先级：`liveSessions` 的 `endedAt/state/status`，其次兼容 `reports` 的 `endedAt/createdAt/state/status`。`status=正常` 不会单独被当成进行中覆盖结束态；只要 session 有 `endedAt` 或结束态文案，summary 会归一为已结束。
- `endManagedSession()` 结束但不生成 report 的路径已有 smoke 覆盖，避免个人中心摘要漏掉“无 report 的已结束 session”。
- 本次未更新 PM 总台账，未替前端、接口联调、后台或测试写通过结论。

## 证据

- 新增脚本：`backend/scripts/smoke-user-ended-session-summaries.js`
- 验证命令：

```powershell
node --check backend/server.js
node --check backend/data/admin.js
node --check backend/data/moments.js
node --check backend/scripts/smoke-user-ended-session-summaries.js
npm.cmd run check:encoding
node backend/scripts/smoke-user-ended-session-summaries.js
```

- smoke 输出关键字段：

```json
{
  "ok": true,
  "sessionId": "session-1782072675795-27159a",
  "profileId": "smoke-ended-summary-1782072675781-165587",
  "endedAt": "2026-06-21T20:11:15.797Z",
  "state": "已结束",
  "status": "已结束",
  "stateText": "已结束",
  "canResume": false,
  "reportId": "session:session-1782072675795-27159a"
}
```

- 残留说明：smoke 只创建临时 `sessionId=session-1782072675795-27159a`，`finally` 调用 `deleteManagedSession(sessionId)` 清理该临时记录；未清理历史记录。

## 待协作

- 接口联调 `008FB`：需要用真实 token 或联调环境请求 `GET /api/v1/user/session-moment-summaries`，确认 HTTP 返回与本地函数一致。
- 前端 `008FD`：需要确认个人中心统计使用 `endedAt/state/status/stateText` 判定，不被登录态或本地缓存覆盖为 0。
- 测试 `008FE`：需要在微信开发者工具右侧预览框复测个人中心“已结束”统计。

## 2026-06-22 线上有效 token 复查

来源：前端 009 已启动微信开发者工具自动化端口 `9420`，当前 storage token 后 8 位为 `a9160666`。本记录不写完整 token。

只读请求：

```text
GET https://api.pomer.cn/api/v1/user/session-moment-summaries
GET https://api.pomer.cn/api/v1/reports/history?mode=all
```

复查结果：

```json
{
  "tokenTail": "a9160666",
  "summaryHttp": 200,
  "historyHttp": 200,
  "summaryTotal": 22,
  "historyTotal": 22,
  "summaryEnded": 0,
  "historyEnded": 16
}
```

同一 session 样本：

```json
{
  "sessionId": "session-1781756002741-4efdab",
  "history": {
    "status": "已结束",
    "recordType": "session",
    "reportId": "session:session-1781756002741-4efdab"
  },
  "summary": {
    "state": "",
    "status": "",
    "stateText": "",
    "endedAt": "",
    "canResume": null,
    "reportId": "session:session-1781756002741-4efdab"
  }
}
```

线上 summary 样本实际 key：

```json
[
  "briefId",
  "canResumeMomentIds",
  "pendingMediaCount",
  "rankingEntryEnabled",
  "reportId",
  "sessionId",
  "sessionName",
  "shareImageStatus",
  "shareImageTaskId",
  "shareImageUrl",
  "title"
]
```

判断：

- 这不是前端误判：summary 响应本身没有 `state/status/stateText/endedAt/canResume` 字段，前端只能按进行中处理。
- 这不是 profile/session 过滤导致同 session 不存在：同一 `sessionId` 在 history 与 summary 都存在，`reportId` 也一致。
- 本地当前代码 `getUserSessionMomentSummaries()` 已固定输出 `state/status/stateText/endedAt/updatedAt/canResume`；`listManagedReports()` 给 history 的 `status=已结束` 在本地会被 `getSummaryStateFields()` 归一为已结束。
- 因此当前最可能原因是线上 `api.pomer.cn` 后端部署版本未包含 008FA 的 summary 字段修复，或线上进程未重启到最新后端代码。

后端/API 修复路径：

1. 部署包含 `backend/data/moments.js` 中 `getSummaryStateFields()` 与 `getUserSessionMomentSummaries()` 当前实现的后端代码。
2. 确认 `backend/server.js` 的 `/api/v1/user/session-moment-summaries` 调用的是当前 `getUserSessionMomentSummaries({ profile })`。
3. 重启 `api.pomer.cn` 对应的 `jiuzhuopanguan` 后端服务，不触碰 `pomer.cn` 官网服务。
4. 使用 token 后 8 位 `a9160666` 的当前登录态只读复跑 summary/history；报告只记录后 8 位。

部署后验收命令模板：

```powershell
curl.exe -sS `
  -H "X-JZP-User-Token: <current token, do not log>" `
  "https://api.pomer.cn/api/v1/user/session-moment-summaries"

curl.exe -sS `
  -H "X-JZP-User-Token: <current token, do not log>" `
  "https://api.pomer.cn/api/v1/reports/history?mode=all"
```

通过标准：

- `session-1781756002741-4efdab` 的 summary 返回 `state/status/stateText=已结束`。
- `endedAt` 有值或至少 `status/stateText` 明确为已结束。
- `canResume=false`。
- summary/history 的已结束计数不再出现 `summaryEnded=0`、`historyEnded>0` 的分叉。

当前状态：代码侧修复已在本地工作区；线上仍阻塞于部署版本/进程重启验证，不能标记 008FA 线上闭环。
