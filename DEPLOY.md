# 酒桌判官部署说明

当前项目的部署目标有两部分：

- 小程序正式接口：`https://api.pomer.cn/api/v1/*`
- PC 端后台页面：`https://pomer.cn/admin`

两者都由 `backend/server.js` 这一套 Node 服务提供，Nginx 负责 HTTPS 和反代。

## 1. 服务器准备

建议环境：

- Ubuntu 22.04
- Node.js 20
- Nginx
- PM2

安装命令：

```bash
apt update
apt install -y nginx curl
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

## 2. 上传项目

建议目录：

```bash
mkdir -p /data/www
cd /data/www
```

项目最终目录：

```bash
/data/www/jiuzhuopanguan
```

## 3. 初始化 MySQL

先建库建表：

```bash
mysql -uroot -p < /data/www/jiuzhuopanguan/backend/sql/mysql-init.sql
```

然后在后端目录放环境变量：

```bash
cd /data/www/jiuzhuopanguan/backend
cp .env.mysql.example .env
```

至少要配置：

```bash
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=你的密码
MYSQL_DATABASE=jiuzhuopanguan
MYSQL_STORE_TABLE=app_store
WECHAT_APP_ID=你的小程序AppID
WECHAT_APP_SECRET=你的小程序AppSecret
```

可先做连通性检查：

```bash
cd /data/www/jiuzhuopanguan/backend
set -a
. ./.env
set +a
npm run mysql:test
```

## 4. 安装依赖并启动后端

```bash
cd /data/www/jiuzhuopanguan/backend
npm install
set -a
. ./.env
set +a
node server.js
```

看到下面输出说明服务起来了：

```bash
jiuzhuopanguan backend listening on port 3010
```

本机验证：

```bash
curl http://127.0.0.1:3010/api/v1/config/home
curl http://127.0.0.1:3010/api/v1/config/points
curl http://127.0.0.1:3010/api/v1/config/templates
curl http://127.0.0.1:3010/admin
```

## 5. 用 PM2 常驻

```bash
cd /data/www/jiuzhuopanguan/backend
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
pm2 restart jiuzhuopanguan-backend
```

## 6. 配置 Nginx

项目里已有示例文件：

```bash
deploy/nginx/jiuzhuopanguan-api.conf.example
```

部署到：

```bash
/etc/nginx/conf.d/jiuzhuopanguan.conf
```

如果你的证书路径不同，修改：

```nginx
ssl_certificate /etc/nginx/ssl/pomer.cn/fullchain.pem;
ssl_certificate_key /etc/nginx/ssl/pomer.cn/privkey.pem;
```

检查并重载：

```bash
nginx -t
systemctl reload nginx
```

公网验证：

```bash
curl https://api.pomer.cn/api/v1/config/home
curl https://pomer.cn/admin
```

## 7. 小程序前端切换线上接口

项目当前已经默认切到：

```ts
miniprogram/config/api.ts
const REMOTE_API_BASE = 'https://api.pomer.cn/api/v1'
```

所以线上部署完成后，重新编译小程序即可直接联调。

## 8. 微信开发者工具和小程序后台规则

微信小程序要注意这几条：

- 正式联调、真机、体验版、正式版都必须走 HTTPS 域名
- 不能用 IP 直连正式接口
- 小程序后台必须配置 `request 合法域名`

需要在微信公众平台配置：

```text
https://pomer.cn
```

开发者工具本地调试时：

- 如果线上接口还没准备好，可以勾选“不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书”
- 当前项目已经默认请求 `https://api.pomer.cn/api/v1`，所以如果线上没部署好，就会直接请求失败
- 临时本地联调时，可用运行时覆盖接口地址，但上线前必须切回 `https://api.pomer.cn/api/v1`

## 9. 当前后台能力

PC 端后台地址：

```text
https://pomer.cn/admin
```

当前后台可配置：

- 首页 Banner
- 积分商城
- 模板包

这些配置会反映到小程序前台页面：

- 首页 Banner
- 积分中心
- 高级模板

## 10. 当前数据存储

当前后端主存储已经切到 MySQL，运行时会优先读写表：

- `app_store`

其中包含这些 store key：

- `content_store`
- `social_store`
- `admin_store`
- `asset_manifest`

本地 JSON 文件现在只作为镜像和兜底导入源：

- `backend/data/content-store.json`
- `backend/data/social-store.json`
- `backend/data/admin-store.json`
- `backend/data/asset-manifest.json`

首次切到 MySQL 时，如果表里还没有对应 `store_key`，服务会自动把本地 JSON 导入 MySQL。

如果后面继续升级正式生产版，建议下一步：

1. 把 `app_store` 的大 JSON store 继续拆成业务表，例如 `sessions`、`reports`、`membership_orders`、`points_ledger`
2. 给图片上传接 OSS/COS
3. 给后台补操作日志和更细粒度权限
4. 给 MySQL 增加备份、监控和只读从库
