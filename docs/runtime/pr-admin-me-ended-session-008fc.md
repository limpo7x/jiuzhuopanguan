# 后台管理 008FC：已结束聚会后台可查核查

时间：2026-06-22

角色：后台管理负责人

范围：仅核查和补齐后台聚会管理页字段、后台关联摘要、后台本地验证证据；未修改 PM 总台账，未写上线准出，未触碰 `pomer.cn` 官网。

## 结论

- 已验证并小幅修正异常线程遗留改动，方向与 P0 一致。
- `/api/v1/admin/pages/sessions` 对应后台“聚会管理”数据页可同时查进行中与已结束聚会。
- 后台 sessions 列表当前可查：
  - 进行中 / 已结束：`state`、`status`
  - 结束时间：`endedAt`
  - 成员：记录人、参与人、参与人唯一 ID、成员数、成员摘要
  - 关联数据：`reportId`、`reportStatus`、`briefId`、`briefStatus`、`shareTaskId`、`shareTaskStatus`、`shareTaskCount`、`manageLinks`
- 关联摘要来自现有真实 store：
  - session/report：`backend/data/admin-store.json`
  - brief/share task：`backend/data/moments-store.json`

## 本轮修正

- `backend/data/admin.js`
  - 保留 `buildSessionRelationSummary`。
  - sessions 列表补充 `memberSummary`、`reportStatus`、`briefStatus`、`shareTaskId`、`shareTaskCount` 列。
  - sessions 指标文案从“酒局总数/异常酒局”调整为“聚会总数/异常聚会”。
- `backend/public/admin/static/heatwave-ops/app.js`
  - 运行时标题和品牌从“酒桌判官后台”调整为“聚会记录师后台”，避免覆盖 `sessions.html` 标题。
  - 导航分组从“用户与酒局”调整为“用户与聚会”。
  - 邀请码字段提示从“当前酒局/入局”调整为“当前聚会/加入”。
- `backend/public/admin/static/heatwave-ops/sessions.html`
  - 保留“聚会管理 - 聚会记录师后台”标题。

## 验证命令

```powershell
pwsh -NoLogo -NoProfile -Command '$PSVersionTable.PSVersion.ToString()'
node --check backend/data/admin.js
node --check backend/public/admin/static/heatwave-ops/app.js
npm.cmd run check:encoding
node -e "const { getPageData } = require('./backend/data/admin'); const page = getPageData('sessions'); const rows = page.collection.items; const keys = page.collection.columns.map((item) => item.key); const ended = rows.filter((item) => item.state === '已结束' || item.status === '已结束' || item.endedAt); const live = rows.filter((item) => item.state === '进行中' || item.status === '进行中'); const sampleEnded = ended.find((item) => item.briefId || item.shareTaskId || item.reportId) || ended[0] || null; console.log(JSON.stringify({ title: page.title, metrics: page.metrics.map((item) => item.label + ':' + item.value + ':' + item.trend), columns: keys, total: rows.length, liveCount: live.length, endedCount: ended.length, hasEndedAtColumn: keys.includes('endedAt'), hasMemberColumns: keys.includes('memberCount') && keys.includes('memberSummary'), hasRelationColumns: ['reportId','reportStatus','briefId','briefStatus','shareTaskId','shareTaskStatus','shareTaskCount','manageLinks'].every((key) => keys.includes(key)), sampleEnded: sampleEnded && { id: sampleEnded.id, state: sampleEnded.state, status: sampleEnded.status, endedAt: sampleEnded.endedAt, memberCount: sampleEnded.memberCount, memberSummary: sampleEnded.memberSummary, reportId: sampleEnded.reportId, reportStatus: sampleEnded.reportStatus, briefId: sampleEnded.briefId, briefStatus: sampleEnded.briefStatus, shareTaskId: sampleEnded.shareTaskId, shareTaskStatus: sampleEnded.shareTaskStatus, shareTaskCount: sampleEnded.shareTaskCount, manageLinks: sampleEnded.manageLinks } }, null, 2));"
```

## 验证结果

- PowerShell：`7.6.3`
- `node --check backend/data/admin.js`：通过
- `node --check backend/public/admin/static/heatwave-ops/app.js`：通过
- `npm.cmd run check:encoding`：`Encoding check passed`

数据层抽样：

```json
{
  "title": "聚会管理",
  "metrics": [
    "聚会总数:13:等待 0 个",
    "进行中:7:已结束 6 个",
    "异常聚会:0:待观察 0 个",
    "战报覆盖率:23.1%:战报 3 份"
  ],
  "total": 13,
  "liveCount": 7,
  "endedCount": 6,
  "hasEndedAtColumn": true,
  "hasMemberColumns": true,
  "hasRelationColumns": true,
  "sampleEnded": {
    "id": "session-1781863809747-96b0b0",
    "state": "已结束",
    "status": "已结束",
    "endedAt": "2026-06-19T17:31:48.686Z",
    "memberCount": 1,
    "memberSummary": "房主:聚会记录师成员A",
    "briefId": "brief-1781863834166-971ef637",
    "briefStatus": "pending",
    "shareTaskId": "share-task-1781863835768-ce424f4e",
    "shareTaskStatus": "pending",
    "shareTaskCount": 1,
    "manageLinks": "简报:brief-1781863834166-971ef637 | 分享图:share-task-1781863835768-ce424f4e"
  }
}
```

## 证据缺口

- 本次证明后台数据页可查，不证明个人中心统计已修复，也不证明微信开发者工具预览框通过。
- 未做线上 `api.pomer.cn` 后台登录态访问验证；本次验证为本地 Node 数据层读取。
- 接口联调、前端、测试仍需各自提供同一用户 / 同一 session 对账证据后，P0 才能由 PM 汇总闭环。

## 下一步

- 接口联调负责人补齐 008FB：个人中心已结束统计接口与后台 sessions 数据的同一用户、同一 session 对账证据。
- 前端负责人补齐 008FD：个人中心已结束数量消费字段与页面展示证据。
- 测试负责人补齐 008FE：开发者工具预览框内个人中心已结束统计与后台聚会管理同 ID 对账截图或日志。
