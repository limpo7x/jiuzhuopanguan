# 后台增长数据页修复与线上部署记录

## 范围

- 角色：后台管理负责人
- 目标：修复后台“增长与数据”分组下 `用户分析`、`内容分析`、`商业分析` 点开后无页面数据的问题，并部署到 `api.pomer.cn`
- 边界：只操作聚会记录师后台服务 `jiuzhuopanguan-backend`，未触碰 `pomer.cn` 官网服务

## 问题原因

后台静态页和侧边栏入口已经存在：

- `/admin/pages/data-users`
- `/admin/pages/data-content`
- `/admin/pages/data-business`
- `/admin/pages/growth-share-tasks`

其中 `growth-share-tasks` 已在 `backend/data/admin.js` 的 `pageMap` 注册，但 `data-users`、`data-content`、`data-business` 未注册。页面壳可打开时，前端会继续请求 `/api/v1/admin/pages/:slug`，缺少 `pageMap` 会导致后台数据接口无法返回对应页面数据。

## 修复内容

文件：`backend/data/admin.js`

新增三个 `pageMap` 映射：

- `data-users` -> `getUserAnalyticsPage()`
- `data-content` -> `getContentAnalyticsPage()`
- `data-business` -> `getBusinessAnalyticsPage()`

保持现有页面工厂、导航 slug 和接口合同不变。

## 本地验证

- `node --check backend/data/admin.js`：通过
- `npm.cmd run check:encoding`：通过
- 本地 page data smoke：
  - `data-users -> 用户分析 / dashboard`
  - `data-content -> 内容分析 / dashboard`
  - `data-business -> 商业分析 / dashboard`
  - `growth-share-tasks -> 分享图任务 / readonly`

## 线上部署

目标环境：

- 域名：`api.pomer.cn`
- 服务：`jiuzhuopanguan-backend`
- PM2 cwd：`/www/wwwroot/jiuzhuopanguan-git/backend`
- 监听端口：`3010`

部署动作：

- 备份线上文件与 PM2 状态：
  - `/www/wwwroot/jiuzhuopanguan-git/backend/backups/codex-admin-data-pages-20260623155500/admin.js.before`
  - `/www/wwwroot/jiuzhuopanguan-git/backend/backups/codex-admin-data-pages-20260623155500/pm2-jlist-before.json`
- 上传覆盖：
  - `/www/wwwroot/jiuzhuopanguan-git/backend/data/admin.js`
- 重启：
  - `pm2 restart jiuzhuopanguan-backend --update-env`

## 线上验证

- 服务器 `node --check data/admin.js`：通过
- 服务器 page data smoke：
  - `data-users -> 用户分析 / dashboard`
  - `data-content -> 内容分析 / dashboard`
  - `data-business -> 商业分析 / dashboard`
  - `growth-share-tasks -> 分享图任务 / readonly`
- PM2：`jiuzhuopanguan-backend` online，新 PID `764295`
- 公网 GET：
  - `https://api.pomer.cn/admin/login` -> `200`
  - `https://api.pomer.cn/admin/pages/data-users` -> `200`
  - `https://api.pomer.cn/admin/static/heatwave-ops/app.js` -> `200`
- 公网未登录数据接口：
  - `https://api.pomer.cn/api/v1/admin/pages/data-users` -> `401 Unauthorized`
  - 该结果符合后台数据接口需要登录态的预期

## 备注

`curl -I` 对 `/admin/login`、`/admin/pages/data-users` 返回 `404` 是因为当前后台静态路由只处理 `GET`，不处理 `HEAD`；改用 GET 后页面返回 `200`。

