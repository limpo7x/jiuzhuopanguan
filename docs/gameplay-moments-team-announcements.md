## 2026-06-24 PM 公告：FIX-014-10 后台聚会状态修复动作本地通过

面向用户统一名称仍为“聚会记录师”。本公告仅面向 `api.pomer.cn` / `jiuzhuopanguan`，不得触碰 `pomer.cn` 公司官网。

用户已逐项同意 `FIX-014-10`。本轮只处理后台聚会状态修复动作，不启动 `FIX-014-11` 或其他编号，不上传微信小程序包。

范围边界：

- 后台 `sessions` 页面改为只读，不再允许整批覆盖 `liveSessions`。
- 状态修复必须走 `POST /api/v1/admin/sessions/:id/repair-state`。
- 本项不改小程序页面，不改公司官网，不改 Nginx，不重启 `pomer` 官网服务。

本地结论：

- `repair-state` 支持 `end/resume` 两类明确动作。
- `end` 会同步 `endedAt/state/status`、已有 report 状态、brief/share task 关联，并写 operationLogs。
- `resume` 会恢复 session 进行中状态并写 operationLogs，不删除已有 report/share 证据。
- 本地 smoke 覆盖 sessions 页只读、直接保存 409、状态修复、关联同步和操作日志。

下一步责任：

- 接口联调负责人：部署后用固定测试样本覆盖直接保存 409、repair-state end/resume、operationLogs 和清理证据。
- 后台管理负责人：补后台页面人工复核，确认运营只能看状态并使用专用修复动作。
- QA：接口联调和后台复核证据齐全后再验收，不写正式发布准出。

### 2026-06-24 PM 公告：FIX-014-09 / FIX-014-10 已提交并部署

`FIX-014-09` 与 `FIX-014-10` 已提交、推送并部署到 `api.pomer.cn` 对应 `jiuzhuopanguan-backend`，线上代码 HEAD `6dc147c1`。部署证据见 `docs/runtime/deploy-fix-014-09-10-20260624.md`。

部署边界：

- 只操作 `/www/wwwroot/jiuzhuopanguan-git` 与 PM2 `jiuzhuopanguan-backend`。
- PM2 `pomer` 官网服务保持 online，restart 仍为 `0`，未重启。
- 未上传微信小程序包。

后续责任：

- 接口联调负责人：补线上无 token `/user/commerce` 401、有效 token 200、后台 session repair 固定样本和清理证据。
- 后台管理负责人：补 `sessions` 页面只读与专用修复动作的人工复核。
- QA：等待接口联调和后台复核证据后再验收，不写正式发布准出。

## 2026-06-24 PM 公告：FIX-014-09 用户资产接口鉴权一致性本地通过

面向用户统一名称仍为“聚会记录师”。本公告仅面向 `api.pomer.cn` / `jiuzhuopanguan`，不得触碰 `pomer.cn` 公司官网。

用户已逐项同意 `FIX-014-09`。本轮只处理用户资产接口鉴权一致性，不启动 `FIX-014-10` 或其他编号，不上传微信小程序包。

范围边界：

- `GET /api/v1/user/commerce` 未登录统一返回 401，不再返回 200 默认空资产。
- 前端仅调整直接消费用户资产的未登录处理，不改积分、会员、模板和商户运营配置。
- 本项不改公司官网、不改 Nginx、不重启 `pomer` 官网服务。

本地结论：

- 后端/API：`/user/commerce` 与其他用户态接口鉴权口径一致；登录态仍返回真实资产。
- 前端：内容服务可识别 401；权益页显示“登录后查看权益”，模板页未登录保持默认锁定状态，不把未登录写成空资产。
- 本地 smoke：未登录 `/user/commerce` 返回 401；带有效 token 返回 200 且包含资产字段。

下一步责任：

- 接口联调负责人：部署后用无 token 和有效 token 各跑一次 `/user/commerce`，记录 HTTP 状态和 tokenTail，不写完整 token。
- QA：接口联调证据齐全后，在预览框复核权益页、模板页、积分页未登录/登录显示差异，不写正式发布准出。
- 前端负责人：如 QA 退回，只在 `FIX-014-09` 范围处理未登录资产状态，不扩大到运营配置或模板库存。

## 2026-06-24 PM 公告：FIX-014-08 后台分享图重试权限合同本地通过

面向用户统一名称仍为“聚会记录师”。本公告仅面向 `api.pomer.cn` / `jiuzhuopanguan`，不得触碰 `pomer.cn` 公司官网。

用户已逐项同意 `FIX-014-08`。本轮只处理后台分享图任务 retry 权限合同，不启动 `FIX-014-09` 或其他编号，不上传微信小程序包。

范围边界：

- 项目用户侧名称仍为“聚会记录师”；技术目标只限 `api.pomer.cn` / `jiuzhuopanguan`。
- 禁止触碰 `pomer.cn` 公司官网目录、Nginx、PM2 服务或路由。
- 本项只改后台/后端合同和 smoke，不改小程序前端页面。

本地结论：

- 后台 `retryManagedShareImageTask()` 已要求聚会已结束、任务状态为 `failed/expired`、brief/session 归属一致、可见节点非空。
- 不保留超管绕过；不合格任务拒绝重试并写 `operationLogs`，合格失败任务可恢复为 `pending` 并记录原因、brief 和可见节点数。
- 本地验证通过：`smoke-moments-flow` 覆盖未结束拒绝、无可见节点拒绝、合格恢复；`smoke-admin-moments-flow` 覆盖 HTTP 409、成功恢复和操作日志页可见。

下一步责任：

- 后台管理/后端负责人：等待提交、推送和部署后，用线上后台 API 复核拒绝/成功两类 retry 合同。
- 接口联调负责人：部署后用真实或固定测试样本覆盖不合格 409、合格 pending、operationLogs 可追溯，并给出清理证据。
- QA：后台与接口联调证据齐全后再复核，不得把本地 smoke 写成正式发布准出。

### 2026-06-24 PM 公告：FIX-014-08 已提交并部署

`FIX-014-08` 已提交、推送并部署到 `api.pomer.cn` 对应 `jiuzhuopanguan-backend`，线上代码 HEAD `56e4b8f9`。部署证据见 `docs/runtime/deploy-fix-014-08-20260624.md`。

部署边界：

- 只操作 `/www/wwwroot/jiuzhuopanguan-git` 与 PM2 `jiuzhuopanguan-backend`。
- PM2 `pomer` 官网服务保持 online，restart 仍为 `0`，未重启。
- 未上传微信小程序包。

后续责任：

- 接口联调负责人：如需线上破坏性 retry 样本，必须使用可清理的固定测试任务，并记录 operationLogs 与清理证据。
- 后台管理负责人：补后台页面人工复核，确认失败/过期任务行操作和拒绝文案不误导运营。
- QA：等待后台与接口联调证据后再验收，不写正式发布准出。

## 2026-06-24 PM 公告：FIX-014-07 满员加入错误映射本地实现

面向用户统一名称仍为“聚会记录师”。本公告仅面向 `api.pomer.cn` / `jiuzhuopanguan`，不得触碰 `pomer.cn` 公司官网。

用户已逐项同意 `FIX-014-07`。本轮只处理满员加入错误映射，不启动 `FIX-014-08` 或其他编号，不上传微信小程序包。

交付与验证：

- 工作树：`F:\codexlist\jiuzhuopanguan-fix-014-07`。
- 分支：`codex/fix-014-07-join-full-error`。
- 证据：`docs/runtime/pr-fix-014-07-session-full-join-20260624.md`。
- 范围：`/sessions/join` 满员返回 409 `session full`；`/parties/join` 满员返回 409 `party full`；首页口令加入满员弹窗展示“聚会已满”。
- 本地验证：`node backend/scripts/smoke-session-full-join-error.js` 已覆盖 2 人局加满后 outsider 两个 join 入口均为 409；编码检查、typecheck 和 diff 检查通过。
- 已提交、推送并部署到 `api.pomer.cn` 对应 `jiuzhuopanguan-backend`，线上代码 HEAD `a5c38bf9`。部署证据见 `docs/runtime/deploy-fix-014-07-20260624.md`。
- PM2 `jiuzhuopanguan-backend` online；PM2 `pomer` 官网服务 online 且未重启。

下一步责任：

- 接口联调负责人：接 `FIX-014-07-INT`，部署后用真实 token 样本覆盖满员 409、普通加入 200、被踢重加合同和测试数据清理。
- 测试验收负责人：接 `FIX-014-07-QA`，在微信开发者工具预览框覆盖首页口令加入满员文案和普通加入回归。
- 后端/API 与前端负责人：如 QA 或接口联调退回，只在 `FIX-014-07` 工作树或后续干净工作树内返工，不扩大到后台分享图、模板配置或分享页返回。
- PM：未取得线上样本和预览框证据前，只能写“本地实现和静态门禁通过”，不得写正式真机发布准出。

## 2026-06-24 PM 公告：FIX-014-06 分享页来源返回本地实现

面向用户统一名称仍为“聚会记录师”。本公告仅面向 `api.pomer.cn` / `jiuzhuopanguan`，不得触碰 `pomer.cn` 公司官网。

用户已逐项同意 `FIX-014-06`。本轮只处理分享页来源感知返回，不混入微信小程序包上传。

前端交付：

- 工作树：`F:\codexlist\jiuzhuopanguan-fix-014-06`。
- 分支：`codex/fix-014-06-share-poster-return`。
- 证据：`docs/runtime/pr-fe-fix-014-06-20260624.md`。
- 范围：分享页顶部返回优先 `navigateBack`；无页面栈时按 `from/returnMode/returnFilter` 回相册、历史筛选、我的、结果报告、简报或首页；底部“返回首页”保留为独立命令；结束聚会、历史相册、结果报告入口补来源参数。

当前验证：

- `npm.cmd run check:encoding` 通过。
- `npm.cmd run typecheck` 通过。
- `git diff --check` 通过。
- 已与 `FIX-014-05` 一起提交、推送并部署到 `api.pomer.cn` 对应 `jiuzhuopanguan-backend`，线上 HEAD `3d525db8`。部署证据见 `docs/runtime/deploy-fix-014-05-06-20260624.md`。
- PM2 `jiuzhuopanguan-backend` online；PM2 `pomer` 官网服务 online 且未重启。

下一步责任：

- 测试验收负责人：接 `FIX-014-06-QA`，在微信开发者工具预览框覆盖结束后、历史相册筛选、结果报告、外部直达四类返回路径。
- 前端负责人：如 QA 退回，只在 `FIX-014-06` 工作树内返工，不扩大到推举原因、权限阻断或运营配置。
- PM：未取得 QA 预览框证据前，只能写“前端本地实现和静态门禁通过”，不得写正式真机发布准出。

## 2026-06-24 PM 公告：FIX-014-05 推举资格文案已部署

面向用户统一名称仍为“聚会记录师”。本公告仅面向 `api.pomer.cn` / `jiuzhuopanguan`，不得触碰 `pomer.cn` 公司官网。

用户已逐项同意 `FIX-014-05`。本轮只处理推举资格原因码与前台文案，不上传微信小程序包。

交付与验证：

- 工作树：`F:\codexlist\jiuzhuopanguan-fix-014-05`。
- 分支：`codex/fix-014-05-nomination-reason-copy`。
- 证据：`docs/runtime/pr-fix-014-05-nomination-reason-20260624.md`。
- 提交：`478b0e45 fix: clarify nomination eligibility reasons`。
- 已与 `FIX-014-06` 一起部署到 `api.pomer.cn` 对应 `jiuzhuopanguan-backend`，线上 HEAD `3d525db8`。部署证据见 `docs/runtime/deploy-fix-014-05-06-20260624.md`。

下一步责任：

- 测试验收负责人：接 `FIX-014-05-QA`，用真实线上样本覆盖公开授权、内容安全确认、私密可见性、后台通过后可推举等状态。
- 前端负责人：如 QA 退回，只在 `FIX-014-05` 工作树或后续干净工作树内返工，不扩大到分享页返回或运营配置。
- PM：未取得真实样本和预览框证据前，不得写正式发布准出。

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

## 2026-06-24 PM 公告：FIX-014-05 推举资格原因与前台文案本地通过

面向用户统一名称仍为“聚会记录师”。本公告仅面向 `api.pomer.cn` / `jiuzhuopanguan`，不得触碰 `pomer.cn` 公司官网。

用户已逐项同意 `FIX-014-05`。本轮只处理推举资格原因码和前台文案，不启动 `FIX-014-06` 或其他编号。

交付范围：

- 工作树：`F:\codexlist\jiuzhuopanguan-fix-014-05`。
- 分支：`codex/fix-014-05-nomination-reason-copy`。
- 证据：`docs/runtime/pr-fix-014-05-nomination-reason-20260624.md`。
- 后端/API：推举资格接口输出 `reasonCode/reasonText`。
- 前端：相册、聚会简报、今日回忆榜统一展示公开授权、内容安全确认、私密照片、榜单资格等具体原因，不再使用“照片审核通过后可推举”作为泛化提示。

验证：

- `node backend/scripts/smoke-nomination-eligibility-reasons.js` 通过，覆盖未授权、内容确认中、后台通过后可推举。
- `npm.cmd run check:encoding` 通过。
- `npm.cmd run typecheck` 通过。
- `git diff --check` 通过。

下一步责任：

- 接口联调负责人：提交/部署后用线上真实样本复核 `reasonCode/reasonText` 合同，token 只写后 8 位。
- 测试验收负责人：等待部署和接口证据后，在微信开发者工具预览框复核相册、聚会简报、今日回忆榜三处文案。
- PM：未取得线上样本和预览框证据前，只能写“本地合同与静态门禁通过”，不得写正式真机发布准出。

## 2026-06-24 PM 公告：FIX-014-04 前端本地实现通过静态门禁

面向用户统一名称仍为“聚会记录师”。本公告仅面向 `api.pomer.cn` / `jiuzhuopanguan`，不得触碰 `pomer.cn` 公司官网。

用户已逐项同意 `FIX-014-04`。本轮只处理首拍状态前端统一消费，不启动 `FIX-014-05`、`FIX-014-06` 或其他编号。

前端交付：

- 工作树：`F:\codexlist\jiuzhuopanguan-fix-014-04`。
- 分支：`codex/fix-014-04-frontend-first-photo-state`。
- 证据：`docs/runtime/pr-fe-fix-014-04-20260624.md`。
- 范围：相册进行中计数与列表统一；账本区分无聚会/待首拍/进行中/已结束；等待房间成员首拍前停留等待态；首页和我的统计优先消费后端 `firstPhotoUploadedAt/hasFirstPhoto/isActiveForResume`。

当前验证：

- `npm.cmd run check:encoding` 通过。
- `npm.cmd run typecheck` 通过。
- `git diff --check` 通过。

下一步责任：

- 测试验收负责人：接 `FIX-014-04-QA`，在微信开发者工具预览框覆盖三条路径：相册数量与列表一致、账本待首拍不隐藏创建入口、成员等待房间首拍前不自动进入记录页。
- 前端负责人：如 QA 退回，只在 `FIX-014-04` 工作树内返工，不扩大到推举、分享返回或运营配置。
- PM：未取得 QA 预览框证据前，只能写“前端本地实现和静态门禁通过”，不得写正式真机发布准出。

## 2026-06-24 PM 公告：FIX-014-01 本地合同通过，进入提交部署门禁

面向用户统一名称仍为“聚会记录师”。本公告仅面向 `api.pomer.cn` / `jiuzhuopanguan`，不得触碰 `pomer.cn` 公司官网。

状态更新：

- `FIX-014-01` 后端/API 本地实现、PM 独立 smoke 和替代接口联调复核均已通过。
- 接口联调证据：`docs/runtime/pr-int-fix-014-01-20260623.md`，状态为“本地合同通过，线上待部署回归”。
- 本地合同矩阵：无参 400；匿名 `sessionId` 401；非成员 `sessionId` 403；成员 `sessionId` 200；匿名 `sessionId+inviteCode` 401；匿名 `inviteCode` 仅 13 个公开白名单字段；normalized/app_store 身份不一致默认 public。
- 线上状态：尚未提交、推送、部署，尚未对 `https://api.pomer.cn` 做只读回归，QA 未验收；不得写线上通过或正式准出。

下一步责任：

- PM：处理 Git 门禁，避免把非本任务提交 `ae98afd5 fix(frontend): recover expired user sessions` 未经确认混入本次部署；确认提交范围后推进推送与部署。
- DBA/运维：仅可部署 `api.pomer.cn` 对应的 `jiuzhuopanguan-backend`，不得触碰 `pomer.cn` 官网服务、官网 Nginx server block 或官网目录。
- 接口联调：部署后对线上 `/api/v1/sessions/live` 复跑只读矩阵；token 只写后 8 位或摘要。
- 测试验收：等待部署证据和线上接口矩阵后，复核邀请加入与成员读取无回归。

## 2026-06-24 PM 公告：FIX-014-03 后端/API 本地合同通过

面向用户统一名称仍为“聚会记录师”。本公告仅面向 `api.pomer.cn` / `jiuzhuopanguan`，不得触碰 `pomer.cn` 公司官网。

用户已用编号授权启动 `FIX-014-03`。本轮只处理“首拍进行中状态沉到后端”的后端/API 合同，不启动 `FIX-014-04` 或其他编号。

当前结果：

- 工作树：`F:\codexlist\jiuzhuopanguan-fix-014-03`，分支 `codex/fix-014-03-first-photo-state`。
- 后端证据：`docs/runtime/pr-backend-fix-014-03-20260624.md`。
- 合同字段：`firstPhotoUploadedAt`、`hasFirstPhoto`、`isActiveForResume`。
- 覆盖接口/页面：`/sessions/live`、`/user/session-moment-summaries`、后台 `sessions` 页面；normalized read 通过 `moment_records` 推导同一字段。
- 本地 smoke：`smoke-first-photo-active-state` 与 `smoke-live-session-privacy` 均通过。
- 状态：后端/API 本地合同通过；未提交、未推送、未部署、未上传小程序包。

下一步：

- 接口联调负责人：接 `FIX-014-03-INT`，复核本地合同与 normalized 推导口径，部署后再用有效 token 做线上矩阵；token 只写后 8 位。
- 前端负责人：暂不启动 `FIX-014-04` 前不得改小程序页面；收到 PM 审批后再统一消费后端字段。
- 后台管理负责人：复核后台 `sessions` 页面首拍状态/首拍时间字段展示，不得直接改总进度。
- 测试验收负责人：等待提交、部署和接口联调证据后，再做微信开发者工具预览框验收；当前不得写预览框通过或正式准出。

## 2026-06-24 PM 公告：FIX-014-01 已部署，线上只读回归通过

面向用户统一名称仍为“聚会记录师”。本公告仅面向 `api.pomer.cn` / `jiuzhuopanguan`，不得触碰 `pomer.cn` 公司官网。

部署结果：

- 远端 `main` 已推送 `759be62 fix(backend): protect live session reads`。
- 线上服务器 `/www/wwwroot/jiuzhuopanguan-git` 已快进到 `759be62ee34e9af2825363f59326f21693812ff2`。
- PM2 仅重启 `jiuzhuopanguan-backend`；`pomer` 官网服务未重启，`pomer.cn` 官网配置、目录和路由未触碰。
- 回滚点与备份：`/www/backup/jiuzhuopanguan/fix-014-01-20260624-004948`，部署前 HEAD 为 `33343a25aabb216c61df84a495f836e37b310bfa`。

线上只读回归：

- 公共健康：`/api/v1/config/home`、`/api/v1/config/templates`、`/admin/login` 均 200。
- `/api/v1/sessions/live` 无参返回 400；匿名 `sessionId` 返回 401；匿名 `inviteCode` 返回 200 且仅 13 个公开白名单字段；匿名 `sessionId+inviteCode` 返回 401。
- 成员 tokenTail `1dace82d` 下成员 `sessionId/inviteCode` 读取 200 且包含私有字段；非成员 tokenTail `b81a4c83` 下 `sessionId` 和 mixed 均 403，不含私有字段。
- 接口联调证据：`docs/runtime/pr-int-fix-014-01-20260623.md`，结论为“本地合同通过，线上只读回归通过，QA 预览框/邀请加入交互待验收”。

下一步责任：

- QA：接 `FIX-014-01-QA`，用微信开发者工具预览框验收邀请加入、成员私有视图、匿名公开预览、无参/异常态；不得把线上只读接口通过写成正式真机准出。
- 接口联调：若 QA 发现接口异常，基于现有线上矩阵复跑并只记录 token 后 8 位。
- PM：在 QA 回包前不启动 `FIX-014-02` 实施，不写正式准出。

派发状态：

- PM 已向测试验收线程 `019eebc6-d497-7d80-9c6b-53254355fa69` 派发 `FIX-014-01-QA`。
- 目标证据文档：`docs/runtime/pr-qa-fix-014-01-20260624.md`。
- QA 结论只能是“预览框阶段通过 / blocked / 退回”；若微信开发者工具 9420 或自动化不可用，必须记录失败命令和错误原文。

## 2026-06-24 PM 公告：微信开发者工具自动化连接固定流程

适用范围：所有需要微信开发者工具预览框点击、页面态、storage、Console 或截图证据的 QA、前端、UI/UX、PM 复核任务。

固定连接方式：

1. 首选启动脚本：

   ```powershell
   pwsh -NoLogo -NoProfile -File scripts/start-wechat-devtools-automation.ps1 -Port 9420 -ProjectPath F:\codexlist\jiuzhuopanguan
   ```

2. 如果开发者工具已打开但 9420 未监听，或 CLI 提示 IDE 已在其他 HTTP server 端口运行，先关闭已有 IDE 后重启自动化端口：

   ```powershell
   pwsh -NoLogo -NoProfile -File scripts/start-wechat-devtools-automation.ps1 -Port 9420 -ProjectPath F:\codexlist\jiuzhuopanguan -QuitExisting
   ```

3. 手动兜底命令使用旧版自动化通道，不要只依赖 HTTP server 端口：

   ```powershell
   & "D:\wechatkaifa\微信web开发者工具\cli.bat" auto --project F:\codexlist\jiuzhuopanguan --auto-port 9420 --trust-project
   ```

4. 验证必须同时满足：

   ```powershell
   Test-NetConnection 127.0.0.1 -Port 9420
   npm.cmd run wechat:auto -- status --port 9420
   ```

   通过标准：`TcpTestSucceeded=True`，且 `wechat:auto status` 返回 `ok=true`、当前页面路径、页面 data keys 和 `console=[]` 或明确的 Console 记录。

注意事项：

- 当前项目的 `miniprogram-automator` 依赖旧版 WebSocket 自动化端口；开发者工具显示类似 `http://127.0.0.1:20394` 的 HTTP server，或 `/v2/auto` 能返回 ticket，不等于项目脚本可执行 `currentPage/storage/screenshot/tap`。
- `npm.cmd run wechat:auto -- status --port 9420` 只负责连接既有旧版 WebSocket 自动化端口，默认不得启动开发者工具，也不得触发 `/v2/auto` ticket 探测；只有排障时才允许显式加 `--probeV2`，只有确需脚本拉起工具时才允许显式加 `--launch`。
- 若 `npm.cmd run wechat:auto -- status --port 9420` 返回 `connect ECONNREFUSED 127.0.0.1:9420`，不得把该任务写通过；先按上面的 `--auto-port 9420` 流程恢复连接。
- 复测文档只允许记录 token 后 8 位、页面路径、query、状态码、字段名和 Console 摘要，不得写完整 token。

## 2026-06-24 PM 公告：FIX-014-01 QA 退回

测试验收负责人已完成 `FIX-014-01-QA`，证据文档为 `docs/runtime/pr-qa-fix-014-01-20260624.md`，结论为“退回”，不得写预览框阶段通过或正式准出。

QA 结论：

- 通过项：匿名首页不展示任意进行中聚会挂起条；匿名 `sessionId+inviteCode` 未绕过私有读取且不展示成员、照片、时间线、账本；合法成员邀请页和记录页读取正常。
- 退回项 `QA-FIX-014-01-R01`：匿名 `inviteCode` 进入邀请页或首页时先被登录态拦截，未展示后端 public live session 已允许的公开预览字段，如 `sessionName/playerCount/joinedCount`。
- 未覆盖项 `QA-FIX-014-01-R02`：QA 未取得非成员或被踢用户的当前预览框 storage，不能把非成员/被踢预览框路径写通过。

下一步责任：

- PM：等待用户明确同意后，才能派前端修补 `QA-FIX-014-01-R01`；未获同意前不改业务源码。
- 前端：待审批后处理匿名公开预览链路，要求未授权时可拉取并展示加入所需公开信息，但不得展示成员列表、照片、时间线、账本。
- 接口联调/测试：补可用非成员或被踢用户预览框样本，只记录 token 后 8 位。

## 2026-06-24 PM 公告：FIX-014-01 QA 测试账号补充

用户提醒使用旧测试账号，避免预览框复测被匿名登录面板阻挡。PM 已复核当前线上 store，并向测试验收负责人补发复测指令。

当前可用样本：

- 样本聚会：`session-1782137141037-b4e84c / XBAABB`。
- 成员测试账号：tokenTail `1dace82d`，用于成员私有视图回归。
- 非成员测试账号：tokenTail `b81a4c83`，用于验证邀请码公开预览和直接私有入口阻断。
- 备用非成员 tokenTail：`824395c3`、`923d75e4`、`0863fc6d`、`6d7d2743`。

复测要求：

- QA 优先用非成员但已登录的 tokenTail `b81a4c83` 注入微信开发者工具 storage，打开 `/pages/invite-group/index?inviteCode=XBAABB`，验证展示加入所需公开信息且不泄露成员列表、照片、时间线、账本。
- 再用同一非成员账号打开带 `sessionId` 的私有入口或记录页，验证不能读取成员私有视图。
- 完整 token 只能在临时脚本内从服务器当前 store 读取并写入 DevTools storage；文档、截图名和最终回复只允许写 token 后 8 位。

## 2026-06-24 PM 公告：FIX-014-01 QA 测试账号复测通过

测试验收负责人已按用户提醒改用旧测试账号完成复测，证据文档仍为 `docs/runtime/pr-qa-fix-014-01-20260624.md`，结论调整为“预览框阶段通过”。

复测结果：

- 使用非成员测试账号 tokenTail `b81a4c83`，完整 token 未写入文档、截图名或回复。
- `/pages/invite-group/index?inviteCode=XBAABB` 展示加入所需公开信息，不展示成员真实列表、成员头像、照片、时间线、账本。
- `/pages/invite-group/index?sessionId=session-1782137141037-b4e84c&inviteCode=XBAABB` 未展示目标 session 私有成员视图。
- `/pages/live-record/index?sessionId=session-1782137141037-b4e84c` 未展示目标 session 成员、照片、时间线或账本。

责任收口：

- QA：首轮 `QA-FIX-014-01-R01/R02` 当前关闭；本项只写“预览框阶段通过”，不写正式真机发布准出。
- PM：将 QA 文档和新增截图纳入提交；不再派发 `QA-FIX-014-01-R01` 前端修补。
- 后续：如正式发布前需要真机准出，另开最终真机采集任务，不反向阻塞当前开发推进。

## 2026-06-24 PM 公告：FIX-014-02 获批并派发

用户已明确同意 `FIX-014-02`。本轮只处理分享页无权限仍可能展示聚会内容的 P0 安全问题；其他 `FIX-014-*` 仍未获批，不得启动。

任务边界：

- 来源：`UIUX-013-P0-01`，页面为 `/pages/share-poster/index`。
- 目标：分享页在 `notEnded/noPermission/removed/notMember/unavailable` 等状态下必须进入独立安全状态，隐藏照片、时间线、总结、二维码和分享图内容，只保留解释文案与安全返回动作。
- 技术边界：仅 `api.pomer.cn` / `jiuzhuopanguan`，不得触碰 `pomer.cn` 官网。
- Git 边界：本项使用干净工作树 `F:\codexlist\jiuzhuopanguan-fix-014-02`、分支 `codex/fix-014-02-share-permission`；不得把主工作区未确认脏改动或无关提交混入。

责任分工：

- 前端负责人：接 `FIX-014-02-FE`，在 `miniprogram/pages/share-poster/index.ts/.wxml/.wxss` 建立 `shareViewState/canViewPosterContent` 或等价安全状态；权限阻断时不得渲染 `posterTimelineNodes`、照片、时间线、总结、二维码和分享图缩略图。证据写入 `docs/runtime/pr-fe-fix-014-02-20260624.md`。
- 后端/API 负责人：接 `FIX-014-02-BE-CONTRACT`，只读确认分享页相关接口对 `session not ended/not session member/forbidden/removed/unavailable` 的状态码和错误文案；如合同不稳定，只记录缺口和建议，不改业务源码。
- 测试验收负责人：接 `FIX-014-02-QA-WAITING`，等待前端和后端/API 证据后再做微信开发者工具预览框验收；未取得证据前保持 waiting。
- PM：只做监督、证据核查、提交/推送门禁和台账收口；不直接改业务源码。

验收标准：

- 无权限、被踢、非成员、未结束、任务不可用五类状态均不展示照片、时间线、总结、二维码或分享图内容。
- 合法成员在已结束可访问状态下仍能正常查看 ready 分享图。
- 操作按钮在权限阻断时不能调用创建、刷新、重新生成或保存任务。
- 预览框证据只能写“预览框阶段通过 / blocked / 退回”，不得写正式真机发布准出。

### 2026-06-24 PM 公告：FIX-014-02 进入 QA 复测

`FIX-014-02` 前端实现证据和后端/API 合同确认已补齐，PM 独立门禁通过，现进入测试验收复测阶段。

证据位置：

- 前端：`docs/runtime/pr-fe-fix-014-02-20260624.md`，含阻断态、清空态、ready 非阻断态预览框截图。
- 后端/API 合同：`docs/runtime/pr-backend-fix-014-02-contract-20260624.md`。
- QA 目标：`docs/runtime/pr-qa-fix-014-02-20260624.md`。

责任与边界：

- 测试验收负责人：在 `F:\codexlist\jiuzhuopanguan-fix-014-02` 使用微信开发者工具预览框复测，不改业务源码、不提交、不推送、不部署。
- 前端负责人：等待 QA 结果；如 QA 退回，只修本项分享页权限阻断问题，不扩大到其他 `FIX-014-*`。
- 后端/API 负责人：当前合同只能区分 `not session member`，不能证明精准“被移出”错误码；如后续要精确 `removed_from_session`，需另开后端修补项。
- PM：继续控制提交、推送和准出门禁；QA 未通过前不得写 `FIX-014-02` 完成。

QA 验收口径：

- 未结束、无权限、非成员/被移出泛化态、不可用状态下，不得展示照片、时间线、总结、二维码或分享图内容。
- 权限阻断态按钮不得调用创建、刷新、重试或保存分享任务。
- 合法 ready 非阻断路径不得回归；如缺少真实 ready 分享图 URL 样本，只能记录未覆盖项，不能伪造通过。

### 2026-06-24 PM 公告：FIX-014-02 QA 退回并返工

测试验收负责人已完成 `FIX-014-02-QA` 预览框复测，结论为退回。证据文档为 `docs/runtime/pr-qa-fix-014-02-20260624.md`，PM 已补入本项干净工作树。

退回范围：

- `QA-FIX-014-02-R01`：真实非成员 tokenTail `b81a4c83` 直达 `/pages/share-poster/index?sessionId=session-1782137141037-b4e84c` 时，页面仍为 `shareViewState=ready`、`canViewPosterContent=true`、`shareActionBlocked=false`，并显示生成/刷新入口。必须进入 `noPermission/notMember` 或等价安全阻断态。
- `QA-FIX-014-02-R02`：当前缺少真实 `readyShareImageUrl` 样本，不能证明完整 ready 图保存路径；该项作为未覆盖证据保留，不得伪造通过。

返工要求：

- 前端负责人接 `FIX-014-02-FE-R01`，只修真实接口错误路径进入页面加载阶段时的阻断状态识别，不扩大到其他 `FIX-014-*`。
- PM 初步判断重点在 `loadBriefByQuery()` 等 catch 分支：不得把 `403 not session member` / `forbidden` / `session not ended` 先转成无法识别的安全文案再继续走 ready fallback；应保留原始错误或状态码进入 `shareViewState` 映射，并停止后续可能恢复 ready 的摘要 fallback。
- QA 等前端返工证据后复测；QA 未通过前不得提交、推送、部署或上传小程序包。

### 2026-06-24 PM 公告：FIX-014-02 返工后待工具恢复复测

前端负责人已完成 `FIX-014-02-FE-R01` 代码返工，并追加证据到 `docs/runtime/pr-fe-fix-014-02-20260624.md`。PM 独立命令门禁通过，但微信开发者工具自动化当前不能形成预览框通过证据。

当前状态：

- 代码静态门禁：`typecheck`、`check:encoding`、`git diff --check` 均通过。
- 失败截图：`pr-fe-fix-014-02-r01-nonmember-b81a4c83*.png` 均不能作为通过证据。
- 自动化阻塞：9420 端口监听可恢复，但 `npm.cmd run wechat:auto -- status --port 9420` 返回 `/v2/auto returned a ticket, but no candidate WebSocket exposed currentPage/storage/screenshot/tap automation`。

责任边界：

- QA：等待微信开发者工具自动化恢复后复测 `QA-FIX-014-02-R01`，不得在无预览框证据时写通过。
- 前端：当前不继续扩大修改范围；若 QA 复测仍失败，再按退回项继续修。
- PM：不提交、不推送、不部署、不上传小程序包，保持本项 blocked / 待复测。

### 2026-06-24 PM 公告：自动化误启动修复与 FIX-014-02 R01 复测通过

PM 已修复微信开发者工具自动化脚本误写启动参数的问题，并完成 `FIX-014-02` R01 预览框复测。

自动化规则更新：

- 固定启动命令继续使用 `cli.bat auto --auto-port 9420 --trust-project`；不得改回 `--port 9420` 作为默认启动参数。
- `npm.cmd run wechat:auto -- status --port 9420` 默认只连接既有旧版 WebSocket 自动化端口，不启动开发者工具，不调用 `/v2/auto`。
- 只有排查 ticket 行为时才显式加 `--probeV2`；只有确需脚本拉起开发者工具时才显式加 `--launch`。
- storage 里的 `jzp-user-token`、`social-user-session-token` 只允许输出 `tokenTail`，不得写完整 token 到文档、截图名或最终回复。

FIX-014-02 当前结论：

- `QA-FIX-014-02-R01` 已关闭：真实非成员 tokenTail `b81a4c83` 直达分享页进入 `notMember` 阻断态，`canViewPosterContent=false`、`shareActionBlocked=true`，照片、时间线、总结、二维码、ready 图和正常生成/刷新/保存/重试入口均不展示。
- 合法成员 tokenTail `1dace82d` 同路径回归为 ready 非阻断态，照片和时间线可展示，正常生成入口可见。
- `QA-FIX-014-02-R02` 仍未覆盖：当前样本没有真实 `readyShareImageUrl`，不得写完整 ready 图 URL 保存链路通过。
- 本项只能写“预览框阶段 R01 通过”，未做正式真机发布准出；当前仍未提交、未推送、未部署、未上传小程序包。

## 2026-06-23 PM 公告：全量交互、接口、后台联通审核派发

面向用户统一名称仍为“聚会记录师”。本公告仅面向 `api.pomer.cn` / `jiuzhuopanguan`，不得触碰 `pomer.cn` 公司官网。

用户要求对当前小程序体验、前后端接口合同、后台管理参数与前端联通情况做一次全量审核。PM 已按职责派发，不要求角色直接修补源码；先归纳问题、补齐证据，再由 PM 逐项分析并分派负责人修补。

本轮审核记录文档：

- UI/UX：`docs/runtime/uiux-full-interaction-audit-20260623-2102.md`。
- 接口联调：`docs/runtime/int-api-contract-audit-20260623-2102.md`。
- 后台管理：`docs/runtime/admin-frontend-parameter-linkage-audit-20260623-2102.md`。

责任分工：

- UI/UX 负责人：接 `FULL-UIUX-AUDIT-013`，全量审核小程序所有页面的用户交互、界面设计、返回逻辑、进入新页面逻辑；重点覆盖首拍前不计入进行中、旧参与房间不得拦截新建聚会、精彩瞬间/推举/分享授权/双审通过链路的可理解性。必须使用合适的 UI/UX/设计审核 skill 或项目已有审查规范；未做预览框点击时只能写“静态审核/待预览框复核”。
- 接口联调负责人：接 `FULL-INT-AUDIT-013`，全量审核小程序 API 调用与后端路由、方法、鉴权、请求字段、响应字段、错误态是否对齐；可做静态核查和安全只读 HTTP 检查 `api.pomer.cn`，涉及 token/openid/session 时只写后 8 位或摘要。
- 后台管理负责人：接 `FULL-ADMIN-LINKAGE-AUDIT-013`，审核后台管理系统里的配置、参数、审核动作、精彩瞬间、分享授权、公开候选、榜单/奖励资格、首页配置、模板配置、运营参数是否能联通到小程序前端；不得做破坏性后台操作。

PM 收口方式：

- 三个负责人只写自己的记录文档，不改业务源码，不改 PM 总台账，不直接下跨角色完成结论。
- PM 等三份记录文档产出后，逐项读取问题，按 P0/P1/P2/P3、影响链路、证据完整度和疑似责任角色分派给前端、后端/API、接口联调、后台管理、测试验收或 UI/UX 修补。
- 缺预览框点击、线上接口、后台写入或清理证据的问题，PM 只能标记待复核/待联调，不写通过或上线准出。

## 2026-06-23 PM 公告：FIX-014-01 获批并派发

用户已逐项同意 `FIX-014-01`。本轮只处理 `GET /api/v1/sessions/live` 匿名无 token、无 `sessionId/inviteCode` 时返回任意进行中聚会摘要的 P0 隐私问题；其他 `FIX-014-*` 和 `VERIFY-014-*` 均未获批，不得启动。

- 后端/API 负责人线程 `019eebc6-f69d-73b2-a5d3-7f8e581283ac`：负责收紧无参匿名读取、`sessionId` 成员校验和 `inviteCode` 匿名公开字段裁剪，并补聚焦 smoke 与角色证据文档 `docs/runtime/pr-backend-fix-014-01-20260623.md`。
- 接口联调负责人：当前不写线上数据；待 PM 复核后端代码与本地证据后，再接部署前合同检查和部署后线上只读回归。
- 测试验收负责人：当前 waiting；待接口联调证据和部署版本明确后，复核邀请加入与成员读取无回归。
- PM：只核验证据、控制提交/部署和更新总台账，不直接修改业务源码。

边界：只允许操作 `api.pomer.cn` / `jiuzhuopanguan`，禁止触碰 `pomer.cn` 公司官网；后端负责人本阶段不得提交、推送或部署。

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
