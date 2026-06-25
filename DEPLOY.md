# 酒桌判官部署说明

更新时间：2026-06-26

## 1. 部署目标

本仓库只部署酒桌判官项目，目标域名为：

- API：`https://api.pomer.cn/api/v1/*`
- 后台页面：`https://api.pomer.cn/admin`
- 后台静态资源：`https://api.pomer.cn/admin/static/heatwave-ops/*`
- 上传资源：`https://api.pomer.cn/uploads/*`

不要把本项目部署到 `pomer.cn`。`pomer.cn` 是公司官网，除非另有明确指令，不修改、不重启、不代理、不覆盖官网服务。

## 2. 服务器环境

建议环境：

- Ubuntu 22.04
- Node.js 20
- Nginx
- PM2
- MySQL 8 或兼容版本

安装基础环境：

```bash
apt update
apt install -y nginx curl mysql-client
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2
```

检查版本：

```bash
node -v
npm -v
pm2 -v
nginx -v
```

## 3. 生产项目目录

当前生产部署目录：

```bash
/www/wwwroot/jiuzhuopanguan-git
```

首次部署时按这个目录创建：

```bash
mkdir -p /www/wwwroot
cd /www/wwwroot
git clone https://github.com/limpo7x/jiuzhuopanguan.git jiuzhuopanguan-git
cd /www/wwwroot/jiuzhuopanguan-git
```

同机存在公司官网服务 `pomer`。本项目只允许操作 `/www/wwwroot/jiuzhuopanguan-git`、`api.pomer.cn` 和 PM2 服务 `jiuzhuopanguan-backend`；不要修改、重启或覆盖 `pomer.cn` 官网服务。

## 4. MySQL 初始化

当前项目使用 `app_store` 大 JSON 表作为主存储，JSON 文件作为镜像与兜底。

初始化数据库：

```bash
mysql -uroot -p < /www/wwwroot/jiuzhuopanguan-git/backend/sql/mysql-init.sql
```

创建后端环境变量：

```bash
cd /www/wwwroot/jiuzhuopanguan-git/backend
cp .env.mysql.example .env
```

至少配置：

```bash
PORT=3010
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=你的密码
MYSQL_DATABASE=jiuzhuopanguan
MYSQL_STORE_TABLE=app_store
WECHAT_APP_ID=你的小程序AppID
WECHAT_APP_SECRET=你的小程序AppSecret
STORE_FILE_MIRROR=1
```

说明：

- `STORE_FILE_MIRROR=1` 或不配置时，会同步写本地 JSON 镜像。
- `STORE_FILE_MIRROR=0` 时，只写 MySQL，不再更新本地 JSON 镜像。
- 如果 MySQL 中没有某个 `store_key`，服务启动后会用本地 JSON 初始化。

测试 MySQL：

```bash
cd /www/wwwroot/jiuzhuopanguan-git/backend
set -a
. ./.env
set +a
npm run mysql:test
```

## 5. 安装依赖与本机验证

```bash
cd /www/wwwroot/jiuzhuopanguan-git/backend
npm ci --omit=dev
set -a
. ./.env
set +a
node server.js
```

看到以下输出说明后端已启动：

```text
jiuzhuopanguan backend listening on port 3010
```

本机验证：

```bash
curl -i http://127.0.0.1:3010/api/v1/config/home
curl -i http://127.0.0.1:3010/api/v1/config/points
curl -i http://127.0.0.1:3010/api/v1/config/templates
curl -i http://127.0.0.1:3010/admin
curl -i http://127.0.0.1:3010/admin/login
```

## 6. PM2 常驻

项目已有 PM2 配置：

```text
backend/ecosystem.config.js
```

启动：

```bash
cd /www/wwwroot/jiuzhuopanguan-git/backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

查看状态：

```bash
pm2 status
pm2 logs jiuzhuopanguan-backend
```

重启：

```bash
pm2 restart jiuzhuopanguan-backend --update-env
```

## 7. Nginx 配置

项目示例文件：

```bash
deploy/nginx/jiuzhuopanguan-api.conf.example
```

部署到：

```bash
/etc/nginx/conf.d/jiuzhuopanguan-api.conf
```

关键要求：

- `server_name` 必须是 `api.pomer.cn`
- `/api/v1/`、`/admin`、`/admin/static/`、`/uploads/` 反代到 `127.0.0.1:3010`
- 不要在本项目配置中写 `pomer.cn` 或 `www.pomer.cn`

检查并重载：

```bash
nginx -t
systemctl reload nginx
```

公网验证：

```bash
curl -fsS https://api.pomer.cn/api/v1/config/home
curl -fsS https://api.pomer.cn/api/v1/config/points
curl -fsS https://api.pomer.cn/api/v1/config/templates
curl -fsS https://api.pomer.cn/api/v1/share/config
curl -s -o /dev/null -w "%{http_code}\n" https://api.pomer.cn/admin
```

接口 JSON 返回 `{"code":0,"message":"ok",...}` 表示通过；未登录访问 `/admin` 返回 `302` 跳转到登录页属于正常结果。

## 8. 小程序配置

当前小程序默认请求：

```ts
const REMOTE_API_BASE = 'https://api.pomer.cn/api/v1'
```

上线前在微信公众平台配置合法域名：

```text
https://api.pomer.cn
```

开发者工具本地调试时可以临时关闭域名校验，或使用运行时覆盖接口地址；上线前必须回到 `https://api.pomer.cn/api/v1`。

## 9. 后台登录与入口

后台入口：

```text
https://api.pomer.cn/admin
```

未登录会跳转：

```text
https://api.pomer.cn/admin/login
```

后台会话接口：

- `POST /api/v1/admin/auth/login`
- `GET /api/v1/admin/auth/session`
- `POST /api/v1/admin/auth/logout`

默认内置账号来自 `backend/data/admin.js` / `backend/data/admin-store.json`。生产环境上线后应尽快重置默认密码，并限制后台访问来源。

## 10. 发布更新流程

生产更新命令：

```bash
cd /www/wwwroot/jiuzhuopanguan-git
git status -sb
mkdir -p backend/backups/deploy
cp backend/data/social-store.json backend/backups/deploy/social-store.json.$(date +%Y%m%d-%H%M%S).bak
git fetch origin main
git pull --ff-only origin main
cd backend
npm ci --omit=dev
set -a
. ./.env
set +a
npm run mysql:test
pm2 restart jiuzhuopanguan-backend --update-env
pm2 logs jiuzhuopanguan-backend --lines 80
```

发布约束：

- `backend/data/social-store.json` 是运行时业务数据，部署前必须备份。
- `backend/public/uploads/` 是运行时上传资源，不能用清理命令删除。
- 如依赖安装导致 `backend/package-lock.json` 在服务器上出现本地差异，不要提交；确认无业务影响后用 `git checkout -- backend/package-lock.json` 还原部署副作用。
- 只重启 `jiuzhuopanguan-backend`，不要重启 PM2 中的 `pomer`。

更新后验证：

```bash
curl -fsS https://api.pomer.cn/api/v1/config/home
curl -fsS https://api.pomer.cn/api/v1/config/points
curl -fsS https://api.pomer.cn/api/v1/config/templates
curl -fsS https://api.pomer.cn/api/v1/share/config
curl -s -o /dev/null -w "%{http_code}\n" https://api.pomer.cn/admin
pm2 status jiuzhuopanguan-backend
```

接口 JSON 返回 `code=0` 表示通过；`/admin` 未登录返回 `302` 表示后台登录跳转正常。

## 11. 当前待升级项

- 把 `app_store` 中的高频业务对象拆成实体表。
- 接入正式对象存储或 CDN，替代本地 `/uploads/`。
- 增加后台密码重置、登录失败限制、IP 白名单或二次校验。
- 给 Nginx、MySQL、PM2 增加备份和监控。
