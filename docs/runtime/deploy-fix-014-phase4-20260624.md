# FIX-014 第四阶段部署记录

- 日期：2026-06-24
- 目标项目：聚会记录师
- 技术边界：仅 `api.pomer.cn` / `/www/wwwroot/jiuzhuopanguan-git` / PM2 `jiuzhuopanguan-backend`
- 禁止触碰边界：未修改、未重启、未部署 `pomer.cn` 公司官网、官网 Nginx server block、官网目录或 PM2 `pomer` 服务
- 本地工作树：`F:\codexlist\jiuzhuopanguan-fix-014-phase3`
- 分支：`codex/fix-014-phase3-p2-stability`
- 部署提交：`392575c3e4baa2587ef235deeba2d0f1ed213011`
- 服务器备份目录：`/www/backup/jiuzhuopanguan/fix-014-phase4-20260624145120`

## 部署内容

- `FIX-014-19`：模板配置为空时回填 4 个免费聚会主题模板，`cost=0`，不新增高级/付费心智。
- `FIX-014-20`：首页配置为空时回填“聚会记录师”最小口径和两个快捷工具。
- `FIX-014-21`：会员/权益保持关闭，用户侧显示“聚会权益暂未开放”，不自动跳首页。
- `FIX-014-22`：商户合作不导入假商户，无真实配置时展示待配置空态。
- `FIX-014-23`：分享素材以动态聚会图为主，后台运营素材待配置。
- `FIX-014-24`：积分只保留首次登录奖励；奖励兑换保持空态，不开放积分商城。
- `FIX-014-25`：未注册旧页面继续不恢复，只收敛已注册配置页面旧口径。
- 自动化脚本：`scripts/wechat-devtools-automator.js` 增加 `set-storage --storageStdin`，token 输出继续脱敏。

## 本地验证

已通过：

```powershell
node --check backend/data/content.js
node --check backend/data/front.js
node --check backend/data/commerce.js
node --check backend/data/admin.js
node --check scripts/wechat-devtools-automator.js
npm.cmd run check:encoding
npm.cmd run typecheck
git diff --check
```

## 服务器部署

服务器操作摘要：

```bash
cd /www/wwwroot/jiuzhuopanguan-git
git fetch origin main
git pull --ff-only origin main
node --check backend/data/admin.js
node --check backend/data/commerce.js
node --check backend/data/content.js
node --check backend/data/front.js
node --check backend/server.js
cd backend && npm install
. ./.env && npm run mysql:test
pm2 restart jiuzhuopanguan-backend --update-env
```

结果：

- 服务器 HEAD 从 `7bdb21e` 更新到 `392575c`。
- `backend npm install` 返回 `found 0 vulnerabilities`。
- MySQL test 返回 `ok=true`、表 `app_store`、`total=5`。
- PM2 `jiuzhuopanguan-backend` online，pid `839199`，restart `99`。
- PM2 `pomer` 公司官网服务保持 online，restart `0`，未触碰。

## 公网复核

- `GET https://api.pomer.cn/api/v1/config/home`：HTTP 200，`title="聚会记录师"`，`quickTools=2`。
- `GET https://api.pomer.cn/api/v1/config/templates`：HTTP 200，4 个免费模板，`cost=0`。
- `GET https://api.pomer.cn/api/v1/config/points`：HTTP 200，`tasks=["task-first-login"]`，`rewards=0`。
- `GET https://api.pomer.cn/api/v1/merchants/catalog`：HTTP 200，`shops=0`，notice 为“合作优惠待配置，当前不开放领取或核销。”。
- `GET https://api.pomer.cn/admin/login`：HTTP 200。
- `GET https://api.pomer.cn/api/v1/sessions/live` 无参：HTTP 400。
- `GET https://api.pomer.cn/api/v1/user/commerce` 未登录：HTTP 401。

## 服务器脏项

部署过程中 `backend/package-lock.json` 曾被服务器 `npm install` 改动，已用 Git 恢复。

部署后仅保留运行期数据和上传物：

- `backend/data/social-store.json`
- `backend/backups/`
- `backend/public/uploads/admin/`
- `backend/public/uploads/moments/session-*`
- `backend/public/uploads/moments/share-tasks/*.png`
- `backend/public/uploads/static/`

本轮未清理这些运行期文件。

## 验收边界

- 阶段2/3微信开发者工具预览框自动化仍未通过，原因是开发者工具预览包未刷新到最新源码；`cli.bat cache --clean compile` 被 `需要重新登录 (code 10)` 阻断。
- 非成员后端权限合同已验证为 HTTP 403 `not session member`，但预览框仍显示旧包状态，不能写预览框通过。
- 当前样本仍无真实 `readyShareImageUrl`，不能证明完整 ready 图 URL 保存链路。
- 未上传微信小程序包。
- 独立验收 `VERIFY-014-01`、`VERIFY-014-02`、`VERIFY-014-03` 均不得写正式发布准出。
