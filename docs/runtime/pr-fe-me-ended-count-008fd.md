# PR-FE-008FD 个人中心已结束统计消费核查

时间：2026-06-22

角色：前端负责人

范围：只核查并最小修复小程序前端个人中心与相册分类消费链路；未修改 PM 总台账，未替后端/API、接口联调、后台或测试写完成结论。

## 前置材料

- 已读 `AGENTS.md`：确认产品名、域名边界、角色节点修改边界和编码安全要求。
- 已读 `docs/runtime/pm-active-worklog.md`：当前 P0 为个人中心“已结束”统计为 0，前端任务为 `008FD`。
- 已读 `PRD.md`：个人中心统计必须为总回忆数 / 进行中 / 已结束，且不得用本地假状态硬凑。
- 已读协作证据：
  - `docs/runtime/pr-backend-me-ended-summary-008fa.md`：后端本地函数合同已覆盖 `endedAt/state/status/stateText/canResume=false`。
  - `docs/runtime/pr-int-me-ended-count-data-audit-008fb.md`：后台线上 sessions/reports 层不是 0，但缺当前复现用户有效 `X-JZP-User-Token`，用户接口层仍待复跑。
  - `docs/runtime/pr-admin-me-ended-session-008fc.md`：后台本地数据层已能查已结束聚会。

## 核查结论

1. 个人中心分类路径成立：
   - `miniprogram/pages/me/index.ts` 调用 `getManagedSessionMomentSummaries()`。
   - service 层 `miniprogram/services/operations.ts` 直接请求 `/user/session-moment-summaries`。
   - `me` 页用 `isEndedSessionSummary()` 按 `endedAt || state/status/stateText` 判断已结束。
   - `ongoingSummaries / endedSummaries` 直接写入 `assetStats` 的 `总回忆数 / 进行中 / 已结束`。

2. 相册 ended filter 和个人中心同源：
   - `miniprogram/pages/album/index.ts` 同样调用 `getManagedSessionMomentSummaries()`。
   - `records&filter=ended` 使用同名 `isEndedSessionSummary()` 判定。
   - 个人中心“已结束”入口跳转 `/pages/album/index?mode=records&filter=ended`，与相册筛选同源。

3. 前端发现并修复的风险：
   - 原逻辑在个人中心把 `getManagedSessionMomentSummaries().catch(() => [])` 直接降级为空数组。
   - 如果接口 401、token 失效或网络失败，UI 会显示 `0 / 0 / 0`，容易误判为后端无已结束数据。
   - 已改为：接口成功才按真实 `momentSummaries` 计算统计；接口失败时统计显示 `--`，并输出 `[me] failed to load session moment summaries`，不再把失败伪装成空数据。

## 修改文件

- `miniprogram/pages/me/index.ts`
  - 新增 `UNAVAILABLE_ASSET_STATS`。
  - 摘要接口失败时保留已有列表数据用于页面稳定，但统计数显示 `--`。
  - 成功路径仍严格使用 `/user/session-moment-summaries` 返回的 `momentSummaries -> ongoing/ended -> assetStats`。

## 验证

```powershell
npm.cmd run typecheck
npm.cmd run check:encoding
```

结果：

- `typecheck` 通过。
- `check:encoding` 通过，输出 `Encoding check passed`。

## 当前状态

- 前端消费链路已核查，失败伪装为 0 的前端风险已最小修复。
- 未写本地 override、未写 storage 假补数、未改相册分类规则、未改进行中入口规则。
- 仍阻塞于 `008FB` 的用户接口层最终在线判定：缺当前复现用户有效 `X-JZP-User-Token`，无法证明 `api.pomer.cn` 对该用户的 `/user/session-moment-summaries` 已返回非 0 已结束摘要。

## 下一步

- 接口联调 `008FB` 或测试 `008FE` 需要拿当前微信开发者工具 storage 中的 `jzp-user-token`，只读复跑 `/user/session-moment-summaries` 与 `/reports/history?mode=all`。
- 若用户接口返回已结束摘要而预览框仍错，再回到前端查页面运行时日志和渲染状态。
- 若用户接口返回 0，则转后端/API 查当前用户 profile 映射、`isSessionMember()` 过滤和线上部署版本。
