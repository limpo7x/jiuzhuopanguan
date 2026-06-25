# Party Pop Clean CDN Upload - 2026-06-25

目标边界：仅 `api.pomer.cn` / `/www/wwwroot/jiuzhuopanguan-git/backend` / `cdn.pomer.cn`。未改动、未重启、未代理 `pomer.cn` 公司官网服务。

## 上传结果

- 上传环境：服务器 `/www/wwwroot/jiuzhuopanguan-git/backend`，`UPLOAD_PROVIDER=oss`。
- 上传前缀：`static/party-pop-clean/`。
- 上传数量：44 个图片对象。
- 上传字节：589606。
- 临时目录：`/tmp/party-pop-cdn-upload-20260625165501`，上传后已清理。
- 本地新增 PNG：`home-hero-750x420.png`、`stage-bg-390x844.png`、`share-poster-top-750x520.png`、`share-poster-bottom-750x360.png`。

## CDN 抽查

- `https://cdn.pomer.cn/static/party-pop-clean/home-hero-750x420.png`：HTTP 200，`Content-Type=image/png`，`Content-Length=79946`，`x-oss-cdn-auth=success`。
- `https://cdn.pomer.cn/static/party-pop-clean/stage-bg-390x844.png`：HTTP 200，`Content-Type=image/png`，`Content-Length=87710`，`x-oss-cdn-auth=success`。
- `https://cdn.pomer.cn/static/party-pop-clean/icons/action-create.png`：HTTP 200，`Content-Type=image/png`，`Content-Length=6032`，`x-oss-cdn-auth=success`。
- `https://cdn.pomer.cn/static/party-pop-clean/share-poster-top-750x520.png`：HTTP 200，`Content-Type=image/png`，`Content-Length=70430`，`x-oss-cdn-auth=success`。

## 代码接入

- 21 个 `app.json` 注册页及公共组件内的 `party-pop-clean` 静态图片引用已切换到 `https://cdn.pomer.cn/static/party-pop-clean/...`。
- 注册页与公共组件扫描未命中本地 `/assets/party-pop-clean`。
- 注册页与公共组件扫描未命中旧 `party-recorder` CDN 或旧 `party-recorder-rebuild` 资产。
- `invite-group` 邀请卡 canvas 改为先下载 CDN 背景到临时文件再 `drawImage`。
- `share-poster` 分享长图 canvas 改为先下载 CDN 顶部/底部背景到临时文件再 `drawImage`。
- `imageCache` 允许 `cdn.pomer.cn/static`、`cdn.pomer.cn/uploads`、`cdn.pomer.cn/moments` 进入缓存策略。

## 验证命令

- `npm.cmd run check:encoding`：通过。
- `npm.cmd run typecheck`：通过。
- `npm.cmd run check:party-pop-clean`：通过，扫描 114 个文件。
- `git diff --check`：通过，仅输出既有 LF/CRLF 提示。
