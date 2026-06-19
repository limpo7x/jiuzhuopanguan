# 微信开发者工具预览框自动化使用说明

更新时间：2026-06-16

## 当前结论

`Codex Computer Use` 当前在本机仍失败，错误为 `@oai/sky` 导出子路径缺失。该问题不再作为测试推进的唯一阻塞。

项目已恢复一条可用的微信开发者工具自动化链路：

- 自动化端口：`9420`
- 启动脚本：`scripts/start-wechat-devtools-automation.ps1`
- 点击/截图/取 data 脚本：`scripts/wechat-devtools-automator.js`
- npm 入口：`npm.cmd run wechat:auto -- <command>`
- 本地开发依赖：`miniprogram-automator@0.12.1`

该链路操作的是微信开发者工具里的小程序预览运行时，不依赖 Windows 桌面坐标点击。

## 启动自动化端口

优先执行：

```powershell
pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420
```

如果端口已监听，会返回：

```json
{"ok":true,"action":"already-listening","port":9420}
```

如需强制重启微信开发者工具自动化端口：

```powershell
pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420 -QuitExisting
```

## 常用命令

## 事故后安全门禁

2026-06-18 16:30 左右，DevTools 9420 自动化出现过 `Connection closed`、Storage 被旧测试用户污染、成员态 `not session member` 误判等问题。用户未操作电脑，相关波动归因 PM / 自动化侧或负责人线程操作，不得归因用户。

从 008D / 008E 起，所有角色使用 9420 必须遵守：

- 不并行执行 `status`、`relaunch`、`tap`、截图或 storage 注入命令。
- 不高频 relaunch，不擅自清 Storage，不擅自重启微信开发者工具。
- 每轮先执行单条 `status --storage`，确认 page/query、Console、API base、profileId 和 token 后 8 位。
- 出现 `Connection closed`、黑屏、白屏、窗口无响应或 Storage 不匹配时，立即停止矩阵并退回 PM。
- PM / 测试恢复 DevTools 只代表工具链恢复，不代表任何业务页面通过。

当前 PM 恢复旁证：

```powershell
npm.cmd run wechat:auto -- status --port 9420 --storage --output docs/runtime/pm-devtools-incident-status-9420.png
```

结果摘要：当前页 `pages/session-brief/index`，Storage 为 `runtime-api-base=http://127.0.0.1:3221/api/v1`、memberA `user-1781756527691-ff0197`、token 后 8 位 `4ea6c85e`，Console `[]`。

查看当前页、storage、并截图：

```powershell
npm.cmd run wechat:auto -- status --port 9420 --storage --output docs/runtime/wechat-automator-status-9420.png
```

打开指定页面并截图：

```powershell
npm.cmd run wechat:auto -- relaunch --port 9420 --path /pages/create-session/index --output docs/runtime/wechat-automator-create-session-9420.png
```

点击指定选择器：

```powershell
npm.cmd run wechat:auto -- tap --port 9420 --path /pages/index/index --selector .home-action-primary --storage --data authPanelVisible,authRedirectUrl,loggedIn --output docs/runtime/wechat-automator-home-primary.png
```

首页未登录创建入口固定 flow：

```powershell
npm.cmd run wechat:auto -- flow home-login --port 9420 --clearStorage --output docs/runtime/wechat-automator-home-login-9420.png
```

只读 storage：

```powershell
npm.cmd run wechat:auto -- storage --port 9420
```

## 本轮验证结果

已验证命令：

```powershell
pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420
npm.cmd run wechat:auto -- status --port 9420 --storage --output docs/runtime/wechat-automator-status-9420.png
npm.cmd run wechat:auto -- flow home-login --port 9420 --clearStorage --output docs/runtime/wechat-automator-home-login-9420.png
npm.cmd run wechat:auto -- relaunch --port 9420 --path /pages/create-session/index --data sessionName,templates,playerCount --output docs/runtime/wechat-automator-create-session-9420.png
```

关键结果：

- `status` 成功连接端口 9420，可读取当前页和 storage。
- `flow home-login` 成功点击 `.home-action-primary`。
- 首页点击后 data 为 `authPanelVisible=true`、`authRedirectUrl=/pages/create-session/index`、`loggedIn=false`。
- `relaunch /pages/create-session/index` 成功进入创建页并截图。

证据文件：

- `docs/runtime/wechat-automator-status-9420.png`
- `docs/runtime/wechat-automator-home-login-9420.png`
- `docs/runtime/wechat-automator-create-session-9420.png`

## 测试记录要求

测试成员使用该脚本时，必须在测试计划中记录：

- 执行命令原文。
- 输出截图路径。
- 当前页 `path/query`。
- 关键 data 字段，例如 `authPanelVisible`、`authRedirectUrl`、`loggedIn`。
- storage 摘要，完整 token 不得写入公开文档，只记录后 8 位。
- Console 摘要；如无 console 输出，写 `console=[]`。

## 边界

- 该链路可作为当前开发阶段的预览框点击证据。
- 该链路不等同于正式真机发布通过。
- 保存图片权限、扫码、微信版本差异、相册权限、真机系统权限等只能真机判断的问题，后续发布准出再单独采证。
- `miniprogram-automator@0.12.1` 仅作为本地开发测试依赖，不进入小程序包和线上后端运行时；npm audit 中的依赖风险需按工具链风险单独评估，不得误判为线上业务漏洞。
