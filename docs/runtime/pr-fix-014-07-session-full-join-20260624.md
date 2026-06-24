# FIX-014-07 证据：满员加入错误映射

日期：2026-06-24

工作树：`F:\codexlist\jiuzhuopanguan-fix-014-07`

分支：`codex/fix-014-07-join-full-error`

基线：`origin/main` / `782fe5fbb83722ffbc9fa3c42a35bd9db6e07a43`

## 范围

- 只处理 `FIX-014-07` 满员加入错误映射。
- 不处理后台分享图重试、模板配置、微信开发者工具上传或正式发布准出。

## 已实现

- `backend/server.js`
  - `/api/v1/sessions/join` 捕获 `SESSION_FULL`，返回 HTTP 409，message 为 `session full`。
  - `/api/v1/parties/join` 捕获 `SESSION_FULL`，返回 HTTP 409，message 为 `party full`。
  - 保留既有 `NOT_SESSION_PLAYER` 403 和 `SESSION_NOT_FOUND` 404 行为。
- `miniprogram/pages/index/index.ts`
  - 首页口令加入失败时识别 `statusCode=409`、`session full`、`party full`、`SESSION_FULL`。
  - 满员时展示标题“聚会已满”，正文提示联系发起人调整人数或创建新聚会。
  - 保留非名单成员“暂不能加入”和普通口令错误提示。
- `backend/scripts/smoke-session-full-join-error.js`
  - 启动本地 HTTP server。
  - 创建 2 人聚会，host + member 加满后，outsider 分别调用 `/sessions/join` 和 `/parties/join`。
  - 验证两个入口均返回 HTTP 409，且不会落入 500。
  - 结束后恢复 `admin-store.json` 与 `social-store.json`。

## 验证

- `node --check backend/server.js`：通过。
- `node --check backend/scripts/smoke-session-full-join-error.js`：通过。
- `node backend/scripts/smoke-session-full-join-error.js`：通过。
  - `/sessions/join`：HTTP 409，`message=session full`。
  - `/parties/join`：HTTP 409，`message=party full`。
- `npm.cmd run check:encoding`：通过。
- `npm.cmd run typecheck`：通过。
- `git diff --check`：通过，仅有 Git 换行提示，无 whitespace error。

## 未覆盖

- 未做线上 `api.pomer.cn` 真实 token 样本复测。
- 未做微信开发者工具预览框 QA。
- 未提交、未推送、未部署、未上传微信小程序包。
