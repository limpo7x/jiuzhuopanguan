# PR-INT-SHARE-AUTH-011 分享权限接口联调准备记录

时间：2026-06-22 23:30（Asia/Shanghai）

更新：2026-06-23 11:01（Asia/Shanghai）

角色：接口联调负责人

## 范围与边界

- 已读 `AGENTS.md` 与 `docs/runtime/pm-active-worklog.md` 中 SHARE-AUTH-011 缺口。
- 本记录只写接口联调准备与待验收矩阵，不修改 PM 总台账，不触碰 `pomer.cn` 官网。
- 当前未执行线上写入、未创建样本、未踢人、未结束聚会、未生成分享图任务。
- 凭证要求：后续所有证据只写 `jzp-user-token` 后 8 位，不写完整 token。

## 当前状态

后端/API 合同已确认，等待 DBA/运维部署 `origin/main` commit `94960a43 backend: enforce ended share image auth` 到 `api.pomer.cn` 后线上复跑。

本地只读确认：

- `94960a43` 当前存在于 `main`、`origin/main`、`origin/HEAD`。
- 后端交付记录：`docs/runtime/pr-backend-share-auth-011.md`。
- 后端本地 smoke 已通过；线上仍需部署后复跑，不能把本地 smoke 冒充线上接口验收。

## 已确认后端合同

| 项 | 合同 |
| --- | --- |
| 未结束 session 创建分享图 | `createShareImageTask()` 返回 `409 session not ended` |
| 未结束 session retry/process | `retryShareImageTask()`、`processShareImageTask()` 返回 `409 session not ended` |
| 已结束 session 房主权限 | 房主可创建、重试、处理分享图任务 |
| 已结束 session 普通成员生成权限 | 普通成员创建、重试、处理返回 `403 forbidden` |
| 分享图详情读取 | 继续按成员校验；结束后成员可读 ready 图 |
| ready 分享图合集 | `/api/v1/user/share-image-summaries` 继续按成员校验；结束后成员可看到 ready 图 |
| 被踢用户 | 被踢后不再是成员，读取 task 返回 `403 not session member`，share summaries 不出现该局 |
| 部署边界 | 需部署到 `api.pomer.cn` 对应聚会记录师服务后生效，不涉及 `pomer.cn` 官网 |

## 待部署后复跑的合同点

| 项 | 需要明确的合同 |
| --- | --- |
| 部署证据 | DBA/运维需提供 `94960a43` 已部署、PM2 重启、健康检查和不触碰 `pomer.cn` 官网证据 |
| 有效 token | 复跑时只记录 token 后 8 位 |
| 样本数据 | 需要 host/member/kicked/rejoined 四类最小样本，或允许接口联调创建并清理 |
| 清理 | 写入型用例需提供 session/share task/object/membership cleanup 与残留扫描 |
| normalized/MySQL | 若 `NORMALIZED_DB_READ` 覆盖分享摘要或 session 摘要，需对 app_store 与实体表结果做同 profile/session/task 对账 |

## 接口联调矩阵

| 场景 | 接口 | 方法 | 凭证 | 前置状态 | 期望 | 数据残留 / 清理 |
| --- | --- | --- | --- | --- | --- | --- |
| 进行中禁止创建分享图 | `/api/v1/session-briefs/:briefId/share-image-tasks` | POST | 房主 token / 成员 token | session 未结束，brief 存在 | 返回明确禁止错误；不能创建 pending/ready task | 写入型；需验证无 share task 残留 |
| 进行中禁止创建分享图旧别名 | `/api/v1/briefs/:briefId/share-images` | POST | 房主 token / 成员 token | session 未结束，brief 存在 | 与 canonical 接口一致禁止 | 写入型；需验证无 share task 残留 |
| 进行中禁止 retry | `/api/v1/share-image-tasks/:taskId/retry` | POST | 房主 token / 成员 token | session 未结束，已有 failed/expired task | 返回明确禁止错误；不能改 task 状态 | 可能写状态；需后端提供可回滚样本 |
| 进行中禁止 process | `/api/v1/share-image-tasks/:taskId/process` | POST | 房主 token / 成员 token | session 未结束，已有 pending task | 返回明确禁止错误；不能生成最终图 | 可能生成对象；必须有 task/object cleanup |
| 结束后允许 | `/api/v1/session-briefs/:briefId/share-image-tasks` | POST | 按合同：房主或成员 token | session 已结束 | 返回 201/200；task `sessionId/briefId/status` 合同正确 | 会创建 task；需 cleanup |
| 结束后允许读取详情 | `/api/v1/share-image-tasks/:taskId` | GET | 按合同允许的用户 token | session 已结束且用户仍归属该局 | 返回 task；包含 `sessionId/briefId/status/readyShareImageUrl` 等字段 | 只读，无残留 |
| 被踢后禁止读 task | `/api/v1/share-image-tasks/:taskId` | GET | 被踢用户 token | 用户已从 session 成员中移除 | 403 或 404，按后端合同；不得返回 ready 图片 URL | 只读，无残留 |
| 被踢后 share summaries 移除 | `/api/v1/user/share-image-summaries` | GET | 被踢用户 token | 用户已从 session 成员中移除 | 目标 `sessionId/taskId` 不出现 | 只读，无残留 |
| 被踢后 session summaries 移除 | `/api/v1/user/session-moment-summaries` | GET | 被踢用户 token | 用户已从 session 成员中移除 | 目标 `sessionId` 不出现，或按合同返回无归属状态 | 只读，无残留 |
| 被踢后 history 移除 | `/api/v1/reports/history?mode=all` | GET | 被踢用户 token | 用户已从 session 成员中移除 | 目标 `sessionId/reportId` 不出现 | 只读，无残留 |
| 重新加入恢复归属 | `/api/v1/sessions/join` | POST | 被踢用户 token | 用户拿到有效 `inviteCode` | 返回 session；成员关系恢复 | 写入 membership；需能再次踢出/清理 |
| 重新加入后 share summaries 恢复 | `/api/v1/user/share-image-summaries` | GET | 重新加入用户 token | 重新加入成功，session 已结束且存在 ready task | 目标 `sessionId/taskId` 按合同出现 | 只读，无残留 |
| 重新加入后 session summaries 恢复 | `/api/v1/user/session-moment-summaries` | GET | 重新加入用户 token | 重新加入成功 | 目标 `sessionId` 出现，状态字段与 history 一致 | 只读，无残留 |
| normalized 与 app_store 对账 | share/session summaries、history、live session | GET / 脚本 | 同一组 token | `NORMALIZED_DB_READ` 对应开关打开 | normalized/MySQL 与 app_store 对同 profile/session/task 结果一致 | 只读；若不一致标待后端/DBA 联查 |

## 脱敏证据格式

后续实际联调只记录如下字段：

```json
{
  "tokenTail": "<last-8>",
  "profileId": "<profileId>",
  "scenario": "ongoing-create-forbidden | ended-create-allowed | kicked-forbidden | rejoin-restored",
  "request": {
    "method": "GET|POST",
    "path": "/api/v1/...",
    "sessionId": "<sessionId-or-redacted>",
    "briefId": "<briefId-or-redacted>",
    "taskId": "<taskId-or-redacted>"
  },
  "response": {
    "httpStatus": 200,
    "code": 0,
    "message": "",
    "fieldSample": {
      "sessionId": "",
      "reportId": "",
      "briefId": "",
      "taskId": "",
      "state": "",
      "status": "",
      "stateText": "",
      "endedAt": "",
      "canResume": ""
    }
  },
  "counts": {
    "shareImageSummaries": 0,
    "sessionMomentSummaries": 0,
    "history": 0
  }
}
```

## 当前阻塞 / 待复跑

- 缺 DBA/运维线上部署证据：`api.pomer.cn` 对应服务需确认已运行 `94960a43`。
- 缺可用于写入型联调的最小样本、清理命令和残留扫描证据；如接口联调自行创建样本，必须先记录 cleanup 方案。
- 缺 normalized/MySQL 与 app_store 的 SHARE-AUTH-011 专项对账命令。

当前状态：合同已确认，待线上部署证据。接口联调收到部署证据后，用有效 `jzp-user-token` 复跑并补充脱敏结果；如 normalized/MySQL 与 app_store 不一致，直接标记待后端/DBA 联查，不写通过。
