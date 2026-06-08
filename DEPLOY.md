# 酒桌判官部署说明

当前项目前端是微信小程序，服务器侧只需要部署 `backend/` 这个 Node 服务，然后通过 Nginx 把 `https://pomer.cn/api/v1/*` 反代到本机 `3010` 端口。

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

把整个项目上传到服务器，例如：

```bash
mkdir -p /data/www
cd /data/www
```

项目目录建议最终放在：

```bash
/data/www/jiuzhuopanguan
```

## 3. 启动后端

进入后端目录：

```bash
cd /data/www/jiuzhuopanguan/backend
```

当前后端没有第三方依赖，直接启动即可：

```bash
node server.js
```

看到类似输出说明服务启动成功：

```bash
jiuzhuopanguan backend listening on port 3010
```

本机验证：

```bash
curl http://127.0.0.1:3010/api/v1/config/home
curl http://127.0.0.1:3010/api/v1/social/bootstrap?profileId=test-user
```

## 4. 使用 PM2 常驻

在 `backend/` 下执行：

```bash
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

## 5. 配置 Nginx

项目里已经给了示例文件：

```bash
deploy/nginx/jiuzhuopanguan-api.conf.example
```

部署时复制到：

```bash
/etc/nginx/conf.d/jiuzhuopanguan.conf
```

如果你的证书文件路径不同，修改下面两项：

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
curl https://pomer.cn/api/v1/config/home
```

## 6. 小程序前端切换到线上接口

把这里：

```ts
miniprogram/config/api.ts
```

里的：

```ts
const REMOTE_API_BASE = ''
```

改成：

```ts
const REMOTE_API_BASE = 'https://pomer.cn/api/v1'
```

然后重新编译小程序。

## 7. 微信后台配置

因为小程序请求正式接口必须走 HTTPS，所以还要在微信公众平台配置：

- 服务器域名
- request 合法域名

填入：

```text
https://pomer.cn
```

注意：

- 域名必须备案
- 证书必须有效
- 不能使用 IP 直连

## 8. 当前项目的真实状态

这个后端目前是轻量 Node 服务，数据主要写在本地文件里：

- `backend/data/home.js`
- `backend/data/social.js`
- `backend/data/social-store.json`

这意味着：

- 现在可以直接上线联调
- 重启不会丢数据，因为 `social-store.json` 会落盘
- 但它还不是 MySQL/正式业务后台架构

如果后面要做正式生产版，建议下一步升级：

1. 把 `social-store.json` 改成 MySQL
2. 给管理接口加鉴权
3. 给上传接口接 OSS/COS
4. 把 `admin/config/home/hero` 接到真实后台管理页
