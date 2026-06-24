# FIX-014-08 后台分享图重试权限合同

- 日期：2026-06-24
- 工作树：`F:\codexlist\jiuzhuopanguan-fix-014-08`
- 分支：`codex/fix-014-08-admin-share-retry-auth`
- 基线：`origin/main` / `bc6d58ef`
- 范围：后台分享图任务 retry 权限合同；不涉及微信小程序包上传，不触碰 `pomer.cn` 公司官网。

## 修复内容

- `backend/data/admin.js`
  - 为后台 `retryManagedShareImageTask()` 增加合同校验：
    - 任务必须存在且状态为 `failed` 或 `expired`。
    - 任务所属 session 必须存在且已结束。
    - 任务所属 brief 必须存在，且 `brief.sessionId` 与任务 `sessionId` 一致。
    - `selectedNodeIds` 必须存在，且至少一个节点能解析为当前 session 的可分享公开瞬间或事件节点。
  - 不保留超管绕过；不合格任务直接拒绝重试。
  - 拒绝重试和成功重试都写入 `operationLogs`：
    - 成功：`重试分享图任务`，记录状态变化、原因、brief 和可见节点数。
    - 拒绝：`拒绝重试分享图任务`，记录保持原状态、原因和阻断原因。

- `backend/scripts/smoke-moments-flow.js`
  - 新增后台 retry 数据层覆盖：
    - 未结束聚会的失败分享图任务返回 409。
    - 已结束但无可见节点的失败分享图任务返回 409。
    - 合同满足的失败任务可恢复为 `pending`，`retryCount` 增加。
    - 成功与拒绝均可在 operationLogs 中追溯。

- `backend/scripts/smoke-admin-moments-flow.js`
  - 新增后台 HTTP 覆盖：
    - 无可见节点任务调用 `/api/v1/admin/share-image-tasks/:id/retry` 返回 409。
    - 合格失败任务可恢复为 `pending`。
    - 操作日志页能展示成功与拒绝的分享图任务日志。

## 验证

- `node --check backend/data/admin.js`
- `node --check backend/scripts/smoke-moments-flow.js`
- `node --check backend/scripts/smoke-admin-moments-flow.js`
- `node backend/scripts/smoke-moments-flow.js`
- `node backend/scripts/smoke-admin-moments-flow.js`
- `npm.cmd run check:encoding`
- `npm.cmd run typecheck`
- `git diff --check -- backend/data/admin.js backend/scripts/smoke-moments-flow.js backend/scripts/smoke-admin-moments-flow.js`

## 边界

- 当前为本地合同通过；尚未提交、未推送、未部署到 `api.pomer.cn`。
- 未上传微信小程序包。
- 根目录 `npm.cmd install` 用于补齐新工作树 typecheck 依赖，报告既有 `10 vulnerabilities`，本轮未做无关升级。
