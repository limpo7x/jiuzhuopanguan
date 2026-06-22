# 测试验收 008FE：已结束统计与后台可查一致性复测

时间：2026-06-22

角色：测试验收负责人

状态：blocked

## 本轮已读证据

- `docs/runtime/pr-backend-me-ended-summary-008fa.md`
- `docs/runtime/pr-int-me-ended-count-data-audit-008fb.md`
- `docs/runtime/pr-admin-me-ended-session-008fc.md`
- `docs/runtime/pr-fe-me-ended-count-008fd.md`
- `PRD.md`
- `docs/runtime/pm-active-worklog.md`

旧版 008FE 中“未检索到 008FD 回包”的结论已过期；本轮已收到前端 `008FD` 最新证据。

## 四方证据摘要

- `008FA` 后端/API：本地合同与 smoke 证明 summary 支持已结束态，已结束摘要包含 `state/status/stateText=已结束`、`endedAt`、`canResume=false`。
- `008FB` 接口联调：本地数据层对账通过，后台 sessions/liveSessions 为 `total=13 / ongoing=7 / ended=6`，同一批 profile 的 summary/history 对齐；但线上 manifest token 全部 401，线上用户接口层未闭环。
- `008FC` 后台管理：本地后台数据层可查已结束记录，样本为 `total=13 / ongoing=7 / ended=6`，并包含状态、结束时间、成员和关联字段。
- `008FD` 前端：已修复接口失败时显示 `0 / 0 / 0` 的误导问题；失败时统计应显示 `--`，不再把 401、token 失效或网络失败伪装为空数据。

## 当前阻塞原因

- PM 复核补充：前端已打通 `127.0.0.1:9420`，并取得当前 storage token 后 8 位 `a9160666`。
- 因此旧的“9420 未开放 / 未取得 token”不再作为当前阻塞。
- 新阻塞：当前线上 `/api/v1/user/session-moment-summaries` 字段缺失；`/api/v1/reports/history?mode=all` 有已结束样本，但 summary 同 session 的 `state/status/stateText/endedAt/canResume` 为空。
- 前端结束态依赖 `endedAt || state/status/stateText` 判定。summary 字段为空时，前端只能判为 ongoing，个人中心与相册已结束分类不能写通过。

## 验收结论

本轮 `008FE` 结论为：blocked，待接口联调 / 后端修复 summary 字段映射后复测。

不得写通过、上线或真机准出。

## 下一步

- 接口联调 `008FB`：使用同 token 脱敏复跑线上 summary/history，回报 HTTP 状态、`total/ongoing/ended`、同一 `profileId/sessionId` 的 summary/history 字段对账和 token 后 8 位。
- 后端/API `008FA`：修复或确认线上部署，使 summary 对已结束 session 返回 `state/status/stateText=已结束`、`endedAt`、`canResume=false`，并给出可复跑证据。
- 测试验收 `008FE`：接口联调与后端补证后，再复测个人中心统计、相册已结束分类、已结束记录不进入继续记录入口、后台同 ID 可查，以及 Console/Network 是否有新增阻塞 401/404/5xx。
