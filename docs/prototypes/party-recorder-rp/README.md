# 聚会记录师 RP 原型包

生成时间：2026-06-17T15:54:46.218Z

## 交付物

- `party-recorder-all-pages-rp.html`：可直接浏览器打开的可编辑带链路原型。
- `party-recorder-all-pages.rp.json`：页面、分组、模块和链路数据源。

## 重要说明

当前环境未安装 Axure RP，也没有 Axure 可写 `.rp` 的命令行工具；Axure 官方 Legacy RP API 只提供读取 RP 文件的数据能力，不提供生成原生 `.rp` 项目的写入能力。因此本包不是伪造的 Axure 原生 `.rp` 文件，而是可编辑 RP-style 原型包。

你可以打开 HTML 直接改页面标题、目标和模块，点击“导出修改 JSON”后把 JSON 发回，我会按你砍掉后的页面和链路重新约束项目。

## 页面覆盖

- 1. 首页：`pages/index/index`（核心入口）
- 2. 工具箱：`pages/tools/index`（工具与玩法）
- 3. 记录广场/旧首页：`pages/judge/index`（工具与玩法）
- 4. 我的：`pages/me/index`（个人中心）
- 5. 创建聚会：`pages/create-session/index`（核心入口）
- 6. 聚会规则：`pages/session-rules/index`（创建流程）
- 7. 添加成员：`pages/add-players/index`（创建流程）
- 8. 邀请聚友：`pages/invite-group/index`（核心入口）
- 9. 分享回流页：`pages/share-preview/index`（分享主线）
- 10. 合规说明：`pages/compliance-guide/index`（系统说明）
- 11. 流程说明：`pages/flow-overview/index`（系统说明）
- 12. 记录瞬间：`pages/moment-editor/index`（记录主线）
- 13. 现场记录：`pages/live-record/index`（记录主线）
- 14. 聚会账本：`pages/table-mode/index`（记录主线）
- 15. 转盘工具：`pages/judge-wheel/index`（工具与玩法）
- 16. 结果报告：`pages/result-report/index`（分享主线）
- 17. 聚会简报：`pages/session-brief/index`（分享主线）
- 18. 榜单：`pages/rankings/index`（增长与运营）
- 19. 分享海报：`pages/share-poster/index`（分享主线）
- 20. 聚会相册/历史：`pages/wine-history/index`（相册与历史）
- 21. 积分中心：`pages/wine-points/index`（增长与运营）
- 22. 主题模板：`pages/premium-templates/index`（增长与运营）
- 23. 商家合作：`pages/merchant-partners/index`（增长与运营）
- 24. 失效状态：`pages/invalid-state/index`（系统状态）
- 25. 重开状态：`pages/restart-state/index`（系统状态）
- 26. 工具详情：`pages/tool-detail/index`（工具与玩法）
- 27. 会员中心：`pages/member-center/index`（增长与运营）
- 28. 收藏：`pages/favorites/index`（个人中心）
- 29. 使用历史：`pages/usage-history/index`（个人中心）
- 30. 优惠券：`pages/coupon-center/index`（增长与运营）
- 31. 设置：`pages/settings/index`（个人中心）
- 32. 邀请好友：`pages/invite-friends/index`（社交）
- 33. 聚友：`pages/friend-hub/index`（社交）
- 34. 题库：`pages/question-bank/index`（工具与玩法）
- 35. 等待房间：`pages/waiting-room/index`（核心入口）
- 36. 日志页：`pages/logs/logs`（系统状态）
