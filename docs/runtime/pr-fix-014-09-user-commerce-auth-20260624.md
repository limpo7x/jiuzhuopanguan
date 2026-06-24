# FIX-014-09 用户资产接口鉴权一致性

- 日期：2026-06-24
- 工作树：`F:\codexlist\jiuzhuopanguan-fix-014-09`
- 分支：`codex/fix-014-09-user-commerce-auth`
- 基线：`origin/main` / `8924ef4c`
- 范围：`GET /api/v1/user/commerce` 鉴权合同与前端未登录消费处理；不涉及微信小程序包上传，不触碰 `pomer.cn` 公司官网。

## 修复内容

- `backend/server.js`
  - `GET /api/v1/user/commerce` 从可匿名返回默认空资产，改为必须通过 `requireUserSession()`。
  - 未登录统一返回 HTTP 401 `unauthorized`，与 `/user/session-moment-summaries` 等用户态接口一致。
  - 登录用户仍返回自身真实资产状态。

- `miniprogram/services/content.ts`
  - 为内容服务请求增加 `ContentRequestError`，保留 HTTP `statusCode`。
  - 新增 `isContentUnauthorizedError()`，让前端可区分未登录和其他失败。

- `miniprogram/pages/coupon-center/index.ts`
  - 权益页将 `/user/commerce` 的 401 识别为未登录状态，不再把未登录当空资产。
  - 未登录时显示“登录后查看权益”空态。

- `miniprogram/pages/premium-templates/index.ts`
  - 模板页未登录或资产读取失败时保持默认锁定状态，不写入假资产。

- `backend/scripts/smoke-user-commerce-auth.js`
  - 新增 HTTP smoke：未登录 `/user/commerce` 返回 401；带有效用户 token 返回 200 且包含资产字段。

## 验证

- `node --check backend/server.js`
- `node --check backend/scripts/smoke-user-commerce-auth.js`
- `node backend/scripts/smoke-user-commerce-auth.js`
- `npm.cmd run check:encoding`
- `npm.cmd run typecheck`
- `git diff --check`

## 边界

- 当前为本地合同通过；尚未提交、未推送、未部署到 `api.pomer.cn`。
- 未上传微信小程序包。
- 根目录 `npm.cmd install` 用于补齐新工作树 typecheck 依赖，报告既有 `10 vulnerabilities`；backend `npm.cmd install` 为 `0 vulnerabilities`，本轮未做无关升级。
