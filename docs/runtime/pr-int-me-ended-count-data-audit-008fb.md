# PR-INT-008FB 接口联调：已结束统计字段对账

时间：2026-06-22 04:12（Asia/Shanghai）

角色：接口联调负责人

## 范围与边界

- 已读启动材料：`AGENTS.md`、`docs/runtime/pm-active-worklog.md`、`PRD.md`。
- 对账对象：`/api/v1/user/session-moment-summaries`、`/api/v1/reports/history?mode=all`、`/api/v1/sessions/live`、后台 sessions 数据页。
- 执行边界：只读核查；未 cleanup、未重建样本、未线上写入业务数据、未触碰 `pomer.cn` 官网。
- 说明：线上用户 token 使用时只输出后 8 位；报告不记录完整 token。

## 线上用户接口复测

使用 `docs/runtime/int-data-001-manifest.json` 中 4 个测试身份请求 `https://api.pomer.cn/api/v1`。

| role | profileId | tokenTail | summary HTTP | summary total/ongoing/ended | reports HTTP | reports total/ongoing/ended |
| --- | --- | --- | --- | --- | --- | --- |
| host | `user-1781507686650-a33705` | `a9f69589` | 401 | 0 / 0 / 0 | 401 | 0 / 0 / 0 |
| memberA | `user-1781507686651-a46952` | `9b36b0b6` | 401 | 0 / 0 / 0 | 401 | 0 / 0 / 0 |
| memberB | `user-1781507686651-000860` | `d5d48f60` | 401 | 0 / 0 / 0 | 401 | 0 / 0 / 0 |
| outsider | `user-1781507686651-093df4` | `93281c81` | 401 | 0 / 0 / 0 | 401 | 0 / 0 / 0 |

同 manifest 的 liveSessions 请求：

| sessionId | inviteCode | `/sessions/live` HTTP | 结论 |
| --- | --- | --- | --- |
| `session-1781507687012-e4343d` | `C56EVT` | 404 | 该 INT-DATA-001 样本不在当前线上 `api.pomer.cn` 可读数据中 |

结论：现有 manifest 是本地 fixture，不能作为线上用户层验收样本。当前线上用户 token 全部 401，因此不能把用户侧 `summary=0` 写成真实业务结论，也不能冒充 `/session-moment-summaries` 成功。

## 本地当前 store 字段对账

只读读取当前仓库数据层：`backend/data/admin-store.json`、`backend/data/moments-store.json`，并调用本地函数 `getUserSessionMomentSummaries()`、`listManagedReports()`、`getPageData('sessions')`。

| 数据层 | total | ongoing | ended | 备注 |
| --- | ---: | ---: | ---: | --- |
| 后台 sessions 页面 | 13 | 7 | 6 | `getPageData('sessions').collection.items` |
| liveSessions store | 13 | 7 | 6 | `adminStore.liveSessions` |
| reports store 原始报告 | 3 | 3 | 0 | 原始 `adminStore.reports` 本身没有已结束报告；已结束无 report 的 session 需走 session 兜底 |
| 有已结束记录的 profile | 3 | - | - | summary / liveSessions / reports(history) 对齐同一批 profile |

### 同一批 profile 对账

| profileId | summary total/ongoing/ended | liveSessions total/ongoing/ended | reports/history total/ongoing/ended |
| --- | --- | --- | --- |
| `user-1781787045679-f3f2eb` | 6 / 1 / 5 | 6 / 1 / 5 | 6 / 1 / 5 |
| `user-1781787045678-c892b9` | 1 / 0 / 1 | 1 / 0 / 1 | 1 / 0 / 1 |
| `user-1781787045679-4cd6ea` | 1 / 0 / 1 | 1 / 0 / 1 | 1 / 0 / 1 |

### 关键字段样本

| source | sessionId | profileId | reportId | briefId | state | status | stateText | endedAt | canResume |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| summary | `session-1781863809747-96b0b0` | `user-1781787045679-f3f2eb` | `session:session-1781863809747-96b0b0` | `brief-1781863834166-971ef637` | `已结束` | `已结束` | `已结束` | `2026-06-19T17:31:48.686Z` | false |
| liveSessions | `session-1781863809747-96b0b0` | `user-1781787045679-f3f2eb` |  | `brief-1781863834166-971ef637` | `已结束` | `已结束` |  | `2026-06-19T17:31:48.686Z` |  |
| reports/history | `session-1781863809747-96b0b0` | `user-1781787045679-f3f2eb` |  |  |  | `已结束` |  |  |  |
| admin sessions | `session-1781863809747-96b0b0` | `user-1781787045679-f3f2eb` |  | `brief-1781863834166-971ef637` | `已结束` | `已结束` |  | `2026-06-19T17:31:48.686Z` |  |
| summary | `session-1781787045680-8e406c` | `user-1781787045678-c892b9` | `session:session-1781787045680-8e406c` | `brief-1781787045693-bc8904b9` | `已结束` | `已结束` | `已结束` | `2026-06-19T15:10:21.647Z` | false |
| liveSessions | `session-1781787045680-8e406c` | `user-1781787045678-c892b9` |  | `brief-1781787045693-bc8904b9` | `已结束` | `已结束` |  | `2026-06-19T15:10:21.647Z` |  |
| reports/history | `session-1781787045680-8e406c` | `user-1781787045678-c892b9` |  |  |  | `已结束` |  |  |  |
| admin sessions | `session-1781787045680-8e406c` | `user-1781787045678-c892b9` |  | `brief-1781787045693-bc8904b9` | `已结束` | `已结束` |  | `2026-06-19T15:10:21.647Z` |  |

## 判断

- 本地当前 store 中，后台 sessions 与 liveSessions 的已结束数量一致：`ended=6`。
- 对有已结束记录的 3 个 profile，本地 `summary`、`liveSessions`、`reports/history` 三侧计数一致；summary 已返回前端需要的关键结束态字段：`state/status/stateText=已结束`、`endedAt`、`canResume=false`。
- 原始 `adminStore.reports` 只有 3 条且 ended=0，说明当前本地已结束统计主要依赖 session 兜底，而不是原始 report 记录；这与后端 008FA 的“结束但无 report 的 session 也应进入摘要”一致。
- 线上用户层仍阻塞：manifest token 全部 401，不能证明当前复现用户的 `/api/v1/user/session-moment-summaries` 已在线上返回非 0。

## 阻塞与下一步

当前 008FB 状态：本地数据层对账通过；线上用户接口层待有效 token 复跑，不能标记全链路完成。

需要前端 008FD 或测试 008FE 补充：

- 从微信开发者工具当前复现环境 storage 提供有效 `jzp-user-token`，只需交给接口联调复跑；对外报告只写 token 后 8 位。
- 同时提供当前复现用户对应的 `profileId` 或可由 token 解析出的 profile 证据。

接口联调拿到有效 token 后复跑：

```powershell
curl.exe -sS `
  -H "X-JZP-User-Token: <current-jzp-user-token>" `
  "https://api.pomer.cn/api/v1/user/session-moment-summaries"

curl.exe -sS `
  -H "X-JZP-User-Token: <current-jzp-user-token>" `
  "https://api.pomer.cn/api/v1/reports/history?mode=all"
```

若有效 token 下 summary 返回 ended 非 0，但个人中心仍显示 0，转前端 008FD 查缓存、登录态降级、字段归类或渲染；若 summary 仍为 0，转后端/API 008FA 查线上部署版本、profileId 成员映射和 `listManagedReports()` 过滤。

## 2026-06-22 05:24 线上有效 token 复跑

PM/前端已打通微信开发者工具自动化端口 `127.0.0.1:9420`，接口联调读取当前 storage 后只保留 token 后 8 位。

### 请求结果

| tokenTail | profileId | 接口 | HTTP | code | total | ongoing | ended |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| `a9160666` | `user-1781294689996-6d192e` | `/api/v1/user/session-moment-summaries` | 200 | 0 | 22 | 22 | 0 |
| `a9160666` | `user-1781294689996-6d192e` | `/api/v1/reports/history?mode=all` | 200 | 0 | 22 | 6 | 16 |

结论：用户 token 有效，线上用户接口可访问；当前问题不是 token 失效。history 能返回已结束样本，但 summary 同批 session 缺少结束态字段，导致前端按 ongoing 归类。

### 脱敏字段样本

| source | sessionId | profileId | reportId | briefId | state | status | stateText | endedAt | canResume |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| history | `session-1781756002741-4efdab` | `user-1781294689996-6d192e` |  |  |  | `已结束` |  |  |  |
| summary | `session-1781756002741-4efdab` |  | `session:session-1781756002741-4efdab` | `brief-1781756241108-68785d6e` |  |  |  |  |  |
| history | `session-1781710648031-54bbe7` | `user-1781294689996-6d192e` | `report-1781710682682-4a8926` |  |  | `已结束` |  |  |  |
| summary | `session-1781710648031-54bbe7` |  | `report-1781710682682-4a8926` |  |  |  |  |  |  |

### 判定

- `008FB` 用户接口层已复跑，不再因 token/9420 阻塞。
- 当前线上缺陷可定位为 summary 合同不完整：`/user/session-moment-summaries` 对 history 已结束的同 session 没有回填 `state/status/stateText/endedAt/canResume=false`。
- 这会直接导致前端按既有合同判定为 ongoing；不能要求前端用 history 反推 summary 状态，也不能把当前 summary 结果写成通过。
- 下一步责任：后端/API `008FA` 继续查线上 `getUserSessionMomentSummaries()`、`listManagedReports()`、session/report 状态映射与部署版本，修复后接口联调再用 tokenTail `a9160666` 复跑。

### CDN/OSS 备注

- CDN/OSS 基础链路已在 `docs/runtime/pr-int-infra-hardening-009.md` 记录为通过。
- 上传链路仍待后端提供 OSS provider 环境变量和真实上传接口后联调：上传接口需返回 `https://cdn.pomer.cn/...`，返回 URL 可 200 访问且 `Content-Type` 正确；旧 `/uploads/` 兼容、失败错误码、测试对象清理方式需一并验收。
