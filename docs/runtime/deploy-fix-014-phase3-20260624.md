# FIX-014 第三阶段提交推送与部署记录

日期：2026-06-24

目标边界：仅 `api.pomer.cn` / `/www/wwwroot/jiuzhuopanguan-git` / PM2 `jiuzhuopanguan-backend`。未改动、未重启、未代理 `pomer.cn` 公司官网服务。

## Git

- 提交：`28885c8 fix: complete phase3 p2 stability pass`
- 已推送到 `origin/main`。
- 部署时代码 HEAD：`28885c8b6acfd59cf73f0f1215dc54245807ba2f`

## 部署

- 服务器目录：`/www/wwwroot/jiuzhuopanguan-git`
- 部署前 HEAD：`958efbe118021678c59c5fa32e3e84da94009b12`
- 部署后 HEAD：`28885c8b6acfd59cf73f0f1215dc54245807ba2f`
- 服务器备份目录：`/www/backup/jiuzhuopanguan/fix-014-phase3-20260624134138`
- 备份内容：部署前 git 状态、HEAD、runtime diff、PM2 jlist、`server.js`、`moments.js`、`object-storage.js`、`backend/package-lock.json`、`social-store.json`。
- 部署方式：`git fetch origin main` + `git pull --ff-only origin main`。

## 服务器验证

- `node --check backend/server.js`：通过。
- `node --check backend/data/moments.js`：通过。
- `node --check backend/data/object-storage.js`：通过。
- `node --check backend/scripts/smoke-phase3-p2-contracts.js`：通过。
- `cd backend && npm install`：通过，`found 0 vulnerabilities`。
- `. ./.env && npm run mysql:test`：通过，`ok=true`、表 `app_store`、`total=5`。
- `node backend/scripts/smoke-phase3-p2-contracts.js`：通过，覆盖公开榜单字段裁剪、未绑定上传 cleanup、已绑定上传 cleanup 409。
- `pm2 restart jiuzhuopanguan-backend --update-env`：通过。
- PM2 `jiuzhuopanguan-backend`：online，pid `834905`，restart `98`。
- PM2 `pomer` 官网服务：online，pid `2699`，restart `0`，未重启。

## 公网健康检查

- `https://api.pomer.cn/api/v1/config/home`：HTTP 200。
- `https://api.pomer.cn/api/v1/config/templates`：HTTP 200。
- `https://api.pomer.cn/admin/login`：HTTP 200。
- `https://api.pomer.cn/api/v1/sessions/live` 无参：HTTP 400，符合当前隐私合同。
- `https://api.pomer.cn/api/v1/user/commerce` 未登录：HTTP 401。

## 服务器工作树

- `backend/package-lock.json` 曾被服务器 `npm install` 改动，已恢复到 Git 状态。
- 部署后仅保留运行期数据和上传物脏项：`backend/data/social-store.json`、`backend/backups/`、`backend/public/uploads/**`。

## 未覆盖

- 未上传微信小程序包。
- 未做微信开发者工具预览框 QA。
- 未做真实小程序 Network 点击复核；服务器 smoke 已覆盖后端合同，前端交互仍需开发者工具预览框验证。
