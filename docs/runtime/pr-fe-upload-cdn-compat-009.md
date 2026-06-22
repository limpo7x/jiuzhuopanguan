# PR-FE-009 9420 自动化端口与上传 CDN 兼容审计

时间：2026-06-22

角色：前端负责人

范围：只处理前端职责；未修改 PM 总台账，未改业务源码，未假接对象存储或 CDN 死 URL。

## 前置材料

- 已读 `AGENTS.md`：确认只能面向 `api.pomer.cn` / `jiuzhuopanguan`，不得触碰 `pomer.cn` 官网；前端只能写本角色记录。
- 已读 `PRD.md`：图片必须是真实可访问 URL，不接受 `/assets` 占位图进入真实照片链路；当前验收以微信开发者工具预览框为主。
- 已读 `docs/runtime/pm-active-worklog.md`：当前 008FE blocked 原因为 `127.0.0.1:9420` 未监听；009 前端任务为 9420 端口协助确认与对象存储/CDN URL 兼容点审计。
- 已读 `miniprogram/config/assets.ts`、`miniprogram/services/operations.ts`、`miniprogram/pages/live-record/index.ts`、`miniprogram/utils/imageCache.ts`。

## 9420 当前状态

初始复查命令：

```powershell
Test-NetConnection -ComputerName 127.0.0.1 -Port 9420
```

初始失败原文：

```text
WARNING: TCP connect to (127.0.0.1 : 9420) failed
TcpTestSucceeded : False
```

本机已有微信开发者工具进程，CLI 路径存在：

```text
D:\wechatkaifa\微信web开发者工具\cli.bat
```

启动命令：

```powershell
.\scripts\start-wechat-devtools-automation.ps1 -Port 9420 -ProjectPath (Resolve-Path .).Path -CliPath 'D:\wechatkaifa\微信web开发者工具\cli.bat'
```

启动结果：

```json
{
  "ok": true,
  "action": "started",
  "mode": "auto-port-fallback",
  "port": 9420,
  "cliPid": 12956,
  "owningProcess": 18516,
  "projectPath": "F:\\codexlist\\jiuzhuopanguan"
}
```

复查结果：

```text
TcpTestSucceeded : True
LocalPort        : 9420
State            : Listen
OwningProcess    : 18516
```

## 当前 storage 与接口只读证据

读取命令：

```powershell
npm.cmd run wechat:auto -- storage --port 9420
```

结果：

- 当前页面：`pages/index/index`
- `jzp-user-token` 已存在，只记录后 8 位：`a9160666`
- `social-current-profile-id`：`user-1781294689996-6d192e`
- `runtime-api-base`：空，按默认 API 配置走 `https://api.pomer.cn`

只读接口对账：

```text
GET https://api.pomer.cn/api/v1/user/session-moment-summaries
GET https://api.pomer.cn/api/v1/reports/history?mode=all
```

结果摘要：

```json
{
  "tokenTail": "a9160666",
  "summaryCode": 0,
  "summaryTotal": 22,
  "summaryEnded": 0,
  "summaryOngoing": 22,
  "historyCode": 0,
  "historyTotal": 22
}
```

字段差异样本：

- `/user/session-moment-summaries` 样本 `session-1781756002741-4efdab`：`state/status/stateText/endedAt/canResume` 均为空，前端按合同只能判为进行中。
- `/reports/history?mode=all` 同 session 样本：`status=已结束`。

结论：9420 和当前 storage token 已打通；当前已结束为 0 的直接前端证据不是端口不可用或 token 缺失，而是 `/user/session-moment-summaries` 对当前用户返回的结束态字段缺失。需接口联调/后端继续对账 summary 与 history 的同 session 字段映射。

## `/uploads/` URL 处理点审计

### 1. URL 归一化

文件：`miniprogram/config/assets.ts`

当前行为：

- `normalizeManagedAssetPath()`：
  - `/uploads/...` 相对路径会拼接当前 API origin。
  - `https://api.pomer.cn/uploads/...` 保持原 URL。
  - 非 API origin 的 `https://...` 会原样返回。
  - `/assets/...` 会被清空，避免本地占位图进入真实照片链路。
- `normalizeManagedAvatarPath()`：
  - `/static/...` 与 `/uploads/...` 会拼接 API origin。
  - 非 API origin 的 `https://...` 会原样返回。

CDN 兼容判断：

- 如果后端返回完整 CDN URL，例如 `https://cdn.example.com/uploads/...` 或对象存储 HTTPS URL，前端当前可原样展示。
- 如果后端仍返回 `/uploads/...`，前端仍会指向 `api.pomer.cn/uploads/...`，无法自动切到 CDN。
- 如果后端返回无协议域名、协议相对 URL、bucket key、对象 key，例如 `cdn.example.com/a.jpg`、`//cdn.example.com/a.jpg`、`moments/a.jpg`，当前不会安全归一化，需要后端合同或前端配置。

### 2. 缓存下载

文件：`miniprogram/utils/imageCache.ts`

当前行为：

- `isCacheableRemoteImage()` 只缓存当前 API origin 下的 `/static/` 或 `/uploads/` 图片。
- 非 API origin 的 CDN URL 会跳过本地缓存，直接返回远程 URL。
- 下载请求携带 `getUserAuthHeaders()`，适用于受保护 API 图片。

CDN 兼容风险：

- CDN URL 可以展示，但不会进入当前本地缓存策略。
- 若 CDN 使用公开读，携带用户鉴权 header 通常无害；若对象存储/CDN 拒绝非白名单 header，需要缓存层对 CDN origin 区分 header 策略。
- 若 CDN 域名未加入微信小程序 `downloadFile` / 图片合法域名，预览框或真机会加载失败。

### 3. 上传返回 URL

文件：`miniprogram/services/operations.ts`、`miniprogram/pages/moment-editor/index.ts`

当前行为：

- 前端上传仍调用 `POST /moments/uploads/image`，payload 是 `dataUrl/fileName/sessionId`，不是直传对象存储。
- `moment-editor` 对返回 `result.url` 调用 `normalizeManagedAssetPath(result.url) || result.url`。
- 后续创建 moment 时由 `createManagedMoment()` 传入已归一化后的 `imageUrl`。

CDN 兼容判断：

- 后端若返回完整 CDN HTTPS URL，前端可继续传递和展示。
- 后端若返回 `/uploads/...`，前端仍落到 API origin。
- 若改为前端直传对象存储，需要新增上传合同、签名获取、进度、失败重试和域名配置；当前前端不应假接。

### 4. 记录页、相册、分享图与预览

文件：`miniprogram/pages/live-record/index.ts`、`miniprogram/services/operations.ts`

当前行为：

- 时间线图片来自 `normalizeMomentRecord()` 的 `resolveRemoteMomentImageUrl()`，字段覆盖 `imageUrl/thumbnailUrl/photoUrl/mediaUrl/assetUrl/coverImageUrl/url`。
- `live-record` 图片加载失败时会尝试 `resolveCachedManagedImagePath(source)`；但 CDN 非 API origin 会直接返回原 URL，不会额外缓存。
- `wx.previewImage` 使用页面当前 `imageUrl`。
- 个人中心、相册、session brief、share poster 等分享图 URL 也主要经过 `normalizeManagedAssetPath()`。

CDN 兼容风险：

- CDN HTTPS 原样可用，但需要微信合法域名配置。
- 当前 debug 类型只把含 `/uploads/` 的绝对 URL 标为 `remote-upload`，CDN 非 `/uploads/` 路径会显示 `remote-other`，不影响展示，但会影响排障归类。
- 分享图、二维码、封面、照片如果拆成不同 CDN 域名，需统一加入合法域名并提供清晰字段合同。

## 待联调 / 待合同

对象存储/CDN 未明确 provider、域名、路径形态、鉴权和回滚策略前，前端只能标待联调，不应写死 URL。

需要后端/API 或 DBA/运维补齐：

1. CDN 返回形态：完整 HTTPS URL、`/uploads/...` 兼容路径，还是对象 key。
2. 是否继续保留 `api.pomer.cn/uploads/...` 反向代理回滚。
3. CDN 图片是否公开读；若非公开读，前端如何获取临时签名 URL。
4. 微信小程序合法域名清单：`request`、`downloadFile`、图片加载、上传接口是否都覆盖。
5. `/moments/uploads/image` 是否继续由后端代理上传；若改直传，需要新增签名接口和上传流程合同。
6. 旧 `/uploads/` 数据迁移后是否保留旧 URL 可访问，避免历史回忆图片断链。

## 当前结论

- 9420 已成功启动并可连接。
- 当前有效 token 已从开发者工具 storage 读取，后 8 位为 `a9160666`。
- 用该 token 只读请求线上接口成功，但 summary 返回 22 条均无结束态字段；history 同 session 存在 `status=已结束`。该问题应继续由接口联调/后端核查 `/user/session-moment-summaries` 字段映射。
- 前端现有 CDN 兼容基础：完整 HTTPS CDN URL 可展示；相对 `/uploads/` 仍绑定 API origin；CDN 缓存、合法域名、签名 URL、直传流程需要合同后再改。
