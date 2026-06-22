# 后台管理 009：后台密码重置与登录失败限制

时间：2026-06-22

角色：后台管理负责人

范围：仅审计和实现后台管理登录、安全状态、系统权限页和操作日志；未修改 PM 总台账，未触碰 `pomer.cn` 官网。

## 只读审计结论

- 后台登录真实入口：`POST /api/v1/admin/auth/login` -> `backend/data/admin.js` 的 `loginAdmin()`。
- 管理员账号真实来源：`backend/data/admin-store.json` 的 `adminUsers`，默认种子在 `createDefaultStore()`。
- 后台 session 真实实现：`admin-store.json.sessions` 服务端 token，cookie 名为 `jiuzhuopanguan_admin_session`，有效期 12 小时。
- 操作日志真实实现：`operationLogs` + `appendAdminOperationLog()`，此前已有业务操作日志，但登录失败、锁定、密码重置未接入。
- 原实现缺口：
  - 无管理员密码重置入口。
  - 无密码重置专用接口。
  - 无登录失败次数限制。
  - 无锁定时长。
  - 登录失败不写操作日志。
  - 系统权限页不展示失败次数、锁定状态或密码更新时间。

## 本轮实现

- `backend/data/admin.js`
  - 新增后台登录失败策略：连续失败 5 次后锁定 15 分钟。
  - 登录失败写 `operationLogs`，包含目标账号、失败原因、失败次数、锁定时间、来源 IP/User-Agent 摘要。
  - 锁定账号再次登录返回 423，提示锁定截止时间。
  - 登录成功清空失败次数、锁定状态，并写登录成功日志。
  - 新增 `resetAdminPassword()`：重置密码、清空失败次数、清空锁定状态、写操作日志。
  - 系统权限页管理员列表新增 `failedLoginCount`、`lockedUntil`、`passwordUpdatedAt` 展示列。
- `backend/server.js`
  - 登录接口向 `loginAdmin()` 传入来源 IP 与 User-Agent。
  - 新增受后台 session 保护的接口：
    - `POST /api/v1/admin/users/:id/reset-password`
    - body: `{ "newPassword": "至少 8 位" }`
  - 自重置时保留当前操作会话，注销该账号其他会话。
- `backend/public/admin/static/heatwave-ops/app.js`
  - 系统权限页管理员账号行增加“重置密码”按钮。
  - 新增密码重置弹窗，要求输入并确认新密码，前端先做 8 位与一致性校验。
  - 调用专用重置接口后刷新系统权限页。
- `backend/public/admin/static/heatwave-ops/login.html`
  - 保留现有登录表单，继续展示后端返回的失败/锁定错误提示。
  - 标题与品牌文案改为“聚会记录师后台”。
- `backend/public/admin/static/heatwave-ops/system-permissions.html`
  - 标题改为“账号权限 - 聚会记录师后台”。

## 验证命令

```powershell
node --check backend/data/admin.js
node --check backend/server.js
node --check backend/public/admin/static/heatwave-ops/app.js
npm.cmd run check:encoding
node -e "const admin = require('./backend/data/admin'); const page = admin.getPageData('system-permissions'); const users = page.collections.find((item) => item.key === 'adminUsers'); console.log(JSON.stringify({ title: page.title, adminUserColumns: users.columns.map((item) => item.key), customActions: users.customActions, resetExported: typeof admin.resetAdminPassword === 'function' }, null, 2));"
```

## 验证结果

- `node --check backend/data/admin.js`：通过
- `node --check backend/server.js`：通过
- `node --check backend/public/admin/static/heatwave-ops/app.js`：通过
- `npm.cmd run check:encoding`：`Encoding check passed`

静态合同检查：

```json
{
  "title": "账号权限",
  "adminUserColumns": [
    "username",
    "name",
    "roleId",
    "status",
    "failedLoginCount",
    "lockedUntil",
    "passwordUpdatedAt"
  ],
  "customActions": [
    {
      "key": "reset-password",
      "label": "重置密码",
      "type": "passwordReset"
    }
  ],
  "resetExported": true
}
```

## 未验证项

- 未执行真实错误密码登录 5 次，避免污染当前 `backend/data/admin-store.json` 的失败次数和操作日志。
- 未执行真实密码重置，避免改动当前管理员密码。
- 未做线上 `api.pomer.cn` 后台登录态 smoke；本次为本地代码与静态合同验证。

## 待联调口径

- 后端/API 合同已在本仓库落地：`POST /api/v1/admin/users/:id/reset-password`。
- 测试验收如需验证真实登录失败锁定，应先备份 `backend/data/admin-store.json` 或使用测试管理员账号，验证后恢复密码与锁定状态。
