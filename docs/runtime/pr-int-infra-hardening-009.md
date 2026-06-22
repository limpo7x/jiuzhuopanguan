# PR-INT-009 接口联调：P0 token 复跑阻塞与基建加固验收矩阵

时间：2026-06-22 04:24（Asia/Shanghai）

更新：2026-06-22 05:13（Asia/Shanghai）

更新：2026-06-22 05:24（Asia/Shanghai）

角色：接口联调负责人

## 范围与边界

- 已读材料：`AGENTS.md`、`PRD.md`、`docs/runtime/pm-active-worklog.md`、`docs/runtime/pr-int-me-ended-count-data-audit-008fb.md`。
- 本轮只处理接口联调职责：只读确认 9420 可用性、准备接口验收矩阵。
- 未 cleanup、未重建样本、未线上写入、未改 PM 总台账、未触碰 `pomer.cn` 官网。

## P0 008FB 复跑状态

05:24 更新：PM/前端已打通 9420，接口联调已在 `docs/runtime/pr-int-me-ended-count-data-audit-008fb.md` 追加有效 token 复跑证据。tokenTail `a9160666` 下 summary/history 均返回 `HTTP 200 / code 0`；history `ended=16`，summary `ended=0`，问题转为后端 summary 结束态字段缺失。

04:24 原结论：继续 blocked。微信开发者工具自动化端口 `127.0.0.1:9420` 当前未开放，无法读取当前 storage 的有效 `jzp-user-token`，因此未复跑线上用户态 summary/history。

### 只读端口探测

命令：

```powershell
Test-NetConnection -ComputerName 127.0.0.1 -Port 9420 | Select-Object ComputerName,RemoteAddress,RemotePort,TcpTestSucceeded
```

结果：

```text
WARNING: TCP connect to (127.0.0.1 : 9420) failed
ComputerName RemoteAddress RemotePort TcpTestSucceeded
------------ ------------- ---------- ----------------
127.0.0.1    127.0.0.1           9420            False
```

命令：

```powershell
try { Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:9420 -TimeoutSec 5 | Select-Object StatusCode,StatusDescription,Content } catch { $_.Exception.GetType().FullName; $_.Exception.Message }
```

结果：

```text
System.Net.Http.HttpRequestException
由于目标计算机积极拒绝，无法连接。 (127.0.0.1:9420)
```

命令：

```powershell
node scripts/wechat-devtools-automator.js storage --storage
```

结果：

```json
{
  "ok": false,
  "command": "storage",
  "error": "Failed connecting to ws://127.0.0.1:9420, check if target project window is opened with automation enabled. /v2/auto probe failed: connect ECONNREFUSED 127.0.0.1:9420",
  "protocol": {
    "mode": "v2-auto-probe-failed",
    "oldWebSocketError": "Failed connecting to ws://127.0.0.1:9420, check if target project window is opened with automation enabled",
    "v2Url": "http://127.0.0.1:9420/v2/auto?project=F%3A%5Ccodexlist%5Cjiuzhuopanguan",
    "probeError": "connect ECONNREFUSED 127.0.0.1:9420"
  }
}
```

### P0 当前缺口

- 已取得当前登录态 token 后 8 位：`a9160666`。
- 已复跑：
  - `GET https://api.pomer.cn/api/v1/user/session-moment-summaries`：`HTTP 200 / code 0 / total=22 / ongoing=22 / ended=0`
  - `GET https://api.pomer.cn/api/v1/reports/history?mode=all`：`HTTP 200 / code 0 / total=22 / ongoing=6 / ended=16`
- 当前缺口：summary 同 session 缺少 `state/status/stateText/endedAt/canResume=false`，不能把 summary 写成通过。

### P0 下一步

- 后端/API 继续查线上 summary 状态字段映射；修复后接口联调用 tokenTail `a9160666` 复跑 summary/history。
- 接口联调复跑仍只输出 HTTP 状态、code、`total/ongoing/ended` 和脱敏字段样本，不输出完整 token。

## 基建加固联调验收矩阵

说明：以下为接口联调验收矩阵，不代表对应能力已实现。没有明确接口、环境或凭证的项目均标记为待联调，不伪造线上结果。

### CDN/OSS 基础链路补充

PM 补充：CDN/OSS 基础链路已配置并验收通过。接口联调只读复核：

```powershell
curl.exe -I -sS https://cdn.pomer.cn/cdn-check.png
curl.exe -I -sS http://cdn.pomer.cn/cdn-check.png
```

结果：

- `https://cdn.pomer.cn/cdn-check.png` 返回 `HTTP/1.1 200 OK`，`Content-Type: image/png`，`Content-Length: 45947`，`x-oss-cdn-auth: success`。
- `http://cdn.pomer.cn/cdn-check.png` 返回 `HTTP/1.1 301 Moved Permanently`，`Location: https://cdn.pomer.cn/cdn-check.png`。

当前 CDN 任务状态：基础链路通过，等待后端 OSS 上传接口接入后联调。

| 任务 | 接口 / 检查点 | HTTP 方法 | 环境 | 凭证 | 期望 | 数据残留 / 清理要求 | 当前状态 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 实体表拆分 | `/api/v1/user/session-moment-summaries` | GET | `api.pomer.cn` | 用户 `X-JZP-User-Token` | 返回当前用户所有聚会摘要；已结束记录保留 `state/status/stateText/endedAt/canResume=false` | 只读，无残留 | 待有效 token 联调 |
| 实体表拆分 | `/api/v1/reports/history?mode=all` | GET | `api.pomer.cn` | 用户 `X-JZP-User-Token` | 与 summary 同 profile 的 session/report 归属一致；不能因拆表漏无 report 的已结束 session | 只读，无残留 | 待有效 token 联调 |
| 实体表拆分 | `/api/v1/sessions/live?sessionId=<id>` | GET | `api.pomer.cn` | 无或按接口要求 | 指定 session 可读；状态字段与 summary/history/admin sessions 对齐 | 只读，无残留 | 待样本 session 联调 |
| 实体表拆分 | `/api/v1/admin/pages/sessions` | GET | `api.pomer.cn` | 后台登录 cookie | 后台 sessions 可查状态、成员、`endedAt`、`reportId`、`briefId`、share task 关联 | 只读，无残留 | 待线上后台登录态联调 |
| 实体表拆分 | `/api/v1/admin/pages/reports` | GET | `api.pomer.cn` | 后台登录 cookie | reports 与 sessions 可按 `sessionId/reportId` 对账，不出现孤儿记录或漏关联 | 只读，无残留 | 待线上后台登录态联调 |
| 对象存储/CDN 替代 `/uploads/` | CDN 基础链路 `https://cdn.pomer.cn/cdn-check.png` | HEAD | `cdn.pomer.cn` | 无 | HTTPS 返回 200；`Content-Type=image/png`；`Content-Length=45947`；`x-oss-cdn-auth=success`；HTTP 自动 301 到 HTTPS | 只读，无残留 | 基础链路通过，等待上传接口接入 |
| 对象存储/CDN 替代 `/uploads/` | `/api/v1/sessions/<sessionId>/moments` | POST | 测试环境优先，线上需 PM 明确样本 | 用户 `X-JZP-User-Token`，multipart 图片 | 上传接口返回 CDN URL；URL 不应是本机临时地址；失败时返回可识别错误码和错误体 | 会产生 moment、图片对象；必须明确测试对象 key、session/moment 清理脚本和残留扫描 | 待后端 OSS 上传接口接入后联调 |
| 对象存储/CDN 替代 `/uploads/` | 上传返回的 CDN URL | HEAD/GET | `cdn.pomer.cn` | 无或按签名策略 | URL 可 200 访问；`Content-Type` 与文件类型一致；`Content-Length` 合理；非 1x1、非默认图、非空对象 | 只读；如对象为测试对象，联调结束后按 object key 清理 | 待后端 OSS 上传接口接入后联调 |
| 对象存储/CDN 替代 `/uploads/` | `/api/v1/sessions/<sessionId>/timeline` | GET | 测试环境优先 | 用户 `X-JZP-User-Token` | 时间线图片 URL 与上传返回 CDN URL 一致；旧 `/uploads/` 存量图片仍可兼容展示或有明确迁移兜底 | 只读，无残留 | 待上传样本后联调 |
| 对象存储/CDN 替代 `/uploads/` | `/api/v1/session-briefs/<briefId>` / `/api/v1/share-image-tasks/<taskId>` | GET | 测试环境优先 | 用户 `X-JZP-User-Token` | brief/share task 使用真实 CDN 图；分享图生成链路不引用本地临时地址；旧 `/uploads/` 输入不导致生成失败 | 只读；生成任务如需创建必须有 cleanup | 待后端 OSS 上传接口接入后联调 |
| 对象存储/CDN 替代 `/uploads/` | 上传失败用例：超限、非图片、鉴权缺失、OSS/CDN 异常 | POST | staging 优先 | 测试用户 token | 返回可识别错误码；错误不吞成 500 空响应；前端可展示明确失败原因 | 会产生失败日志；不得残留半写入 moment 或孤儿对象，若有必须可扫描清理 | 待后端 OSS 上传接口接入后联调 |
| 后台密码重置 | 后台密码重置接口 | 待后端/后台定义 | `api.pomer.cn` 或 staging | 超管后台 cookie / 二次确认凭证 | 只能超管重置；返回不泄露明文密码；写操作日志；旧会话按策略失效 | 会修改账号状态；必须使用测试管理员或可回滚账号，不得影响生产管理员 | 待接口定义，待联调 |
| 登录失败限制 | `/api/v1/admin/auth/login` | POST | staging 优先，线上需测试账号 | 测试管理员账号 | 连续失败达到阈值后限流/锁定；错误信息不泄露账号存在性；成功登录清理或保留失败计数符合合同 | 会产生失败日志/锁定状态；必须有解锁/重置方式和操作日志 | 待后端/后台给阈值和测试账号 |
| 登录失败限制 | 后台登录失败状态查询/解锁接口 | 待后端/后台定义 | staging 优先 | 超管后台 cookie | 可审计失败次数、锁定到期、解锁人和时间 | 仅测试账号；联调后恢复未锁定 | 待接口定义，待联调 |
| Nginx 备份监控 | Nginx 配置备份清单/健康检查接口或运维命令证据 | 待 DBA/运维定义 | 服务器，只限 `api.pomer.cn` 服务 | 运维权限 | 能证明新增配置前有备份、配置语法检查通过、reload 不影响 `pomer.cn` 官网 | 不改路由；如需 reload 必须记录备份路径和回滚命令 | 待运维证据，接口联调只验收证据 |
| MySQL 备份监控 | MySQL 备份任务状态接口或运维命令证据 | 待 DBA/运维定义 | 服务器/DB，只限本项目库 | 运维/DBA 权限 | 能证明备份最近成功、可定位备份文件、具备恢复演练或校验摘要 | 不直接改数据；恢复演练必须用测试库 | 待运维/DBA 证据 |
| PM2 备份监控 | PM2 进程状态/日志健康检查接口或运维命令证据 | 待 DBA/运维定义 | 服务器，只限 `api.pomer.cn` 后端服务 | 运维权限 | 能证明服务名、端口、env、最近重启、错误日志阈值；不得触碰官网 PM2 服务 | 只读检查无残留；重启需另有明确授权和回滚说明 | 待运维证据 |

## 联调准入

- 所有线上写入型验收必须先给出测试账号、测试 session、清理脚本、残留扫描方式和回滚说明。
- 对象存储/CDN 联调必须明确 bucket、CDN 域名、签名/公开访问策略、对象 key 命名和删除方式。
- 后台安全联调必须使用测试管理员账号，不得对生产管理员账号做锁定、重置或暴力失败测试。
- 运维类验收必须明确只面向 `api.pomer.cn` / jiuzhuopanguan 服务，不得改动或重启 `pomer.cn` 官网相关服务。
