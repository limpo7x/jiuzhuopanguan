## 2026-06-22 PM 公告：分享图权限与首页封面收口

面向用户统一名称仍为“聚会记录师”。本公告仅面向 `api.pomer.cn` / `jiuzhuopanguan`，不得触碰 `pomer.cn` 公司官网。

当前 PM 已更新 `docs/runtime/pm-active-worklog.md`：首页“待分享回忆/最近相册”封面后端已改为返回本局第一张上传图，线上部署版本为 `c9dc0b05`；该项待前端/测试刷新验证。

新增未闭环权限问题：分享图当前不是严格“结束后才可分享”。后端当前仍按成员权限创建/读取/刷新分享图任务，不能写通过或上线准出。

责任分工：

- 后端/API：接 `SHARE-AUTH-011`，在服务端强制“未结束不得创建/刷新/处理最终分享图任务”，并按产品口径收紧房主/成员权限，补 smoke 证据。
- 前端：接 `SHARE-AUTH-011-FE`，等待后端合同后处理分享页按钮、错误态和已发布小程序包重传风险。
- 接口联调：接 `SHARE-AUTH-011-INT`，用有效 token 验证进行中禁止、结束后允许、被踢禁止、重新通过分享链接加入后恢复归属。
- 测试验收：接 `SHARE-AUTH-011-QA`，复测进行中无分享入口、结束后分享页、成员结束前不可生成/保存、首页首图封面。
- UI/UX：接 `SHARE-AUTH-011-UX`，提供未结束/无权限状态文案和按钮状态建议，不改业务源码。

所有角色只更新自己的交付记录和证据；总进度、跨角色结论和准出判断仍由 PM 验证后更新。

## 2026-06-23 PM 公告：未入账证据补录与首拍进行中规则

面向用户统一名称仍为“聚会记录师”。本公告仅面向 `api.pomer.cn` / `jiuzhuopanguan`，不得触碰 `pomer.cn` 公司官网。

PM 已将以下负责人证据补入 `docs/runtime/pm-active-worklog.md`：

- 后端/API：`docs/runtime/pr-backend-share-auth-011.md`，分享图生成类动作已本地收紧为“已结束 + 房主 + 仍是成员”，但线上部署状态需另行验证。
- 前端：`docs/runtime/pr-fe-share-auth-011.md`，分享页 409/403 错误态和首页首图封面链路已有本地接入；仍需部署后预览框复测，涉及小程序包上传。
- 接口联调：`docs/runtime/pr-int-share-auth-011.md`，线上矩阵已准备，等待部署证据、有效 token、样本与清理方案。
- UI/UX：`docs/runtime/pr-uiux-share-auth-011.md`，已提交未结束/无权限/被踢出状态文案建议，不改业务源码。
- 测试验收：`docs/runtime/pr-qa-share-auth-011.md`，当前仍为 `waiting / blocked`，不能写通过或准出。
- 前端返回挂起复测：`docs/runtime/pr-fe-return-suspend-retest-011.md`，静态核查和命令验证通过，真实点击/侧滑仍因 9420 WebSocket candidate 不可用而未完成。

新增产品规则：

- 只有拍照上传并保存成功第一张照片后，聚会才算“进行中”。
- 创建页、邀请页、拍照页在首拍前返回，不得计入进行中，也不得污染首页继续记录、我的进行中统计或相册 ongoing 分类。
- 首拍前返回必须给玩家明确提示。

当前状态：

- PM 当前线程已完成本地前端实现与基础检查，但尚未提交、未推送、未上传小程序包、未完成预览框点击复测。
- 本地验证已通过：`npm.cmd run check:encoding`、`npm.cmd run typecheck`、本轮 11 个文件 `git diff --check`。
- 仓库没有 `build` script，`npm.cmd run build` 不可用。

责任分工：

- 前端负责人：接 `FIRST-PHOTO-ACTIVE-012-FE`，复测创建页返回、邀请页返回、拍照页未上传返回、首张照片保存后首页挂起条出现、我的/相册进行中计数变化；通过后写前端证据，不得只写“代码已改”。
- 测试验收负责人：接 `FIRST-PHOTO-ACTIVE-012-QA`，等待前端证据后做预览框点击复测；未覆盖真实交互前保持 waiting。
- 接口联调负责人：`SHARE-AUTH-011-INT` 继续等待线上部署证据后复跑矩阵，token 只写后 8 位。
- DBA/运维负责人：如收到部署请求，只能操作 `api.pomer.cn` / `jiuzhuopanguan-backend`，不得触碰 `pomer.cn` 官网；需提供 PM2/API 健康证据和回滚点。
- PM 新总控线程 `019ef398-1fe1-7423-9579-8afe0b54f353`：标题 `PM总控-聚会记录师-接管20260623`，接管后先读 `AGENTS.md`、`PRD.md`、`docs/runtime/pm-active-worklog.md` 和本公告；不要恢复旧长文档。

所有角色只更新自己的交付记录和证据；总进度、跨角色结论和准出判断仍由 PM 验证后更新。
