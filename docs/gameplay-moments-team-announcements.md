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
- 若 `npm.cmd run wechat:auto -- status --port 9420` 返回 `connect ECONNREFUSED 127.0.0.1:9420`，不得把该任务写通过；先按上面的 `--auto-port 9420` 流程恢复连接。
- 复测文档只允许记录 token 后 8 位、页面路径、query、状态码、字段名和 Console 摘要，不得写完整 token。

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
