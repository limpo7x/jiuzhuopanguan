# 测试验收 SHARE-AUTH-011：分享权限与首页封面复测

时间：2026-06-23
角色：测试验收负责人
状态：waiting / blocked

## 已读材料

- `docs/runtime/pm-active-worklog.md`
- `docs/gameplay-moments-team-announcements.md`
- `docs/runtime` 当前证据文件索引
- `docs/runtime/pr-backend-share-auth-011.md`
- `docs/runtime/pr-fe-share-auth-011.md`
- `docs/runtime/pr-int-share-auth-011.md`
- `docs/runtime/pr-uiux-share-auth-011.md`

## 当前判定

- 已收到 PM 派发：`SHARE-AUTH-011-QA` 负责分享权限与首页封面复测。
- 已确认 PM 记录：首页“待分享回忆 / 最近相册”封面后端已改为返回本局第一张上传图，线上版本为 `c9dc0b05`，该项待前端 / 测试刷新验证。
- 已收到后端/API 本地合同与 smoke 证据：`94960a43 backend: enforce ended share image auth`，本地结果覆盖进行中 `409 session not ended`、结束后成员创建 `403 forbidden`、成员可读 ready、被踢读取 `403 not session member` 且 summaries 不出现。
- 已收到前端新增本地验证同步：`dbbc4d0 fix(frontend): preserve active session on back navigation`，用于保护创建 / 邀请 / 等待 / 记录链路返回时的未结束 runtime；本地 `typecheck`、`encoding`、`diff check` 已通过，待 QA 后续预览框复测。
- 当前线上部署仍待 DBA/运维拉取重启；接口联调需部署后补线上矩阵；前端仍需补 `session not ended` / `forbidden` / `not session member` 错误态按钮禁用和页面证据。
- 当前不能写通过、上线准出或正式真机发布通过。

## 阻塞原因

- 后端本地合同已到，但线上 `api.pomer.cn` 部署证据尚未到；QA 不能用本地 smoke 直接替代线上复测。
- 未取得部署后的接口联调矩阵证据：进行中禁止、结束后允许、被踢禁止、重新通过分享链接加入后恢复归属。
- 未取得前端处理证据：分享页在 `session not ended` 或权限错误时禁用生成 / 保存，并展示合理状态。

## 待复测条件

- DBA/运维提供 `94960a43` 已部署到 `api.pomer.cn` 对应聚会记录师服务并重启生效的证据。
- 接口联调提供部署后线上矩阵：进行中 host/member 创建 `409 session not ended`；进行中 retry/process `409 session not ended`；结束后成员创建 `403 forbidden`；成员可读 ready；被踢读取 `403 not session member` 且 summaries 不出现；如覆盖重新加入恢复归属需同步给出结果。
- 前端提供预览框证据：进行中无分享入口，分享页错误态按钮不可继续点击，结束后自动跳转分享页。
- 接口联调和前端证据只记录有效 token 后 8 位，不泄露完整 token。

## QA 复测清单

- 创建聚会后进入记录页，进行中状态 tab 中无“分享”入口。
- 成员在聚会结束前不能生成、刷新、保存最终分享图。
- 若 Network 出现 `409 session not ended`，且页面展示“聚会结束后可查看分享图”一类合理状态，记为预期通过条件，不按阻塞错误处理。
- 房主点击“结束聚会”成功后自动跳转分享页，分享页展示生成中 / 成功 / 失败的合理状态。
- 被踢成员不能从“我的 / 历史 / 分享图合集 / 直接 sessionId”进入该局或分享图。
- 首页“待分享回忆 / 最近相册”封面使用该局第一张上传图。
- Console / Network 无新增阻塞型 `401 / 403 / 404 / 5xx`；`403` 仅在被踢 / 无权限路径符合预期时记录为通过条件。

## 新增 QA 复测清单：聚会链路返回挂起

- 创建聚会后进入邀请页，点击顶部返回应提示“挂起离开”，不删除聚会、不清 runtime；返回首页后应可继续回到当前聚会。
- 邀请页侧滑返回应被禁用或无法绕过挂起保护。
- 等待页点击顶部返回应挂起离开，不再执行房主退出 / 删除聚会，也不清成员 runtime。
- 记录页点击顶部返回应挂起离开，不再删除聚会；首页挂起条可回到记录页。
- 有未结束 runtime 时再次打开创建页，应自动回到当前记录页，不能进入新建表单造成链路混乱。
- 以上路径均需检查 Console / Network 无新增阻塞型 `401 / 403 / 404 / 5xx`。

## 下一步责任

- DBA/运维：拉取并重启部署 `94960a43`，提供 `api.pomer.cn` 生效证据。
- 接口联调：部署后补 `SHARE-AUTH-011-INT` 线上对账矩阵。
- 前端：补 `SHARE-AUTH-011-FE` 页面状态和按钮禁用证据；如 `dbbc4d0` 涉及预览框截图或自动化证据，需一并提交。
- 测试验收：收到三方证据后，在微信开发者工具预览框执行复测并更新本文件。
