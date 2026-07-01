# VID-MOMENT-001 5 秒视频留念功能计划

生成时间：2026-06-30

面向产品：聚会记录师

目标域名边界：后端、API、后台和部署只面向 `api.pomer.cn` / `jiuzhuopanguan`，不得触碰 `pomer.cn` 公司官网。

## 1. 状态与结论

本功能只完成计划登记，尚未实现、尚未联调、尚未验收，不得写入完成进度。

用户目标：在聚会进行中新增“录 5 秒视频留念”。点击后直接录制 5 秒，保存为时间线节点；用户在时间线点击视频节点，可在当前页打开播放，再点击关闭。

推荐实现：前端使用原生相机录制 5 秒短视频，后端新增视频上传和视频类型时间线合同，视频文件进入对象存储/CDN，时间线、相册、简报、分享长图统一展示视频封面，不在前端用 base64 或本地假资源伪造。

## 2. 当前证据核查

已核对现有功能矩阵与源码，当前项目状态如下：

- `pages/live-record/index` 已有进行中记录、相册、账本、分享分段，也已有快速拍照入口。
- `pages/live-record/index.ts` 当前 `handleHighlightMomentTap` 只调用 `wx.chooseMedia` 的 `mediaType: ['image']`，并通过 `createQuickPhotoMoment(filePath)` 创建图片时间线。
- `pages/moment-editor/index.ts` 当前也只支持图片选择、图片上传和图片提交。
- `miniprogram/services/operations.ts` 里前端 moment 合同目前把 `mediaType` 限制为 `'image'`，时间线展示依赖 `imageUrl`。
- `backend/sql/mysql-normalized-schema.sql` 与 `backend/data/normalized-db.js` 已有 `video_url`、`cover_image_url`、`duration` 字段。
- `backend/data/moments.js` 已有 `videoUrl`、`coverImageUrl`、`duration` 归一化字段，但 `MEDIA_TYPES` 当前只允许 `image`，序列化和完成判定仍以图片为主。
- `backend/server.js` 当前只有 `/api/v1/moments/uploads/image`，没有视频上传接口。
- `backend/data/object-storage.js` 已有对象存储与 CDN 公网 URL 能力，适合扩展为视频与视频封面上传。

结论：数据库字段具备基础，但前端、后端 API、业务校验、序列化、CDN 上传、隐私授权、页面展示与测试均未完成。

## 3. 产品流程

### 3.1 入口

入口放在进行中页面 `pages/live-record/index` 的记录操作区：

- 首拍完成前：不展示“录 5 秒”，仍要求房主先拍第一张照片开局。
- 聚会进行中：展示“拍照”和“录 5 秒”两个明确动作。
- 聚会已结束：不允许继续录制，只展示已结束状态和查看相册/分享图相关动作。
- 被踢出、非成员、无权限用户：不展示录制入口，显示现有无权限说明。

### 3.2 录制

默认方案：

1. 用户点击“录 5 秒”。
2. 检查登录态、成员身份、聚会状态、首拍状态、隐私授权。
3. 打开页面内相机录制层，显示 5 秒倒计时和取消按钮。
4. 自动开始录制，5 秒到达后自动停止。
5. 展示本地预览，用户可选择“使用这段”或“重录”。
6. 点击使用后压缩视频，上传视频和封面。
7. 后端创建 `mediaType: 'video'` 的 moment 节点。
8. 时间线立即插入视频节点，展示封面、播放图标、`5s` 时长标签。

可接受降级方案：

- 如果部分机型无法页面内自动录制，可使用 `wx.chooseMedia({ mediaType: ['video'], sourceType: ['camera'], maxDuration: 5 })` 打开微信原生录制器。
- 该降级必须真实录制并上传真实视频，不允许用图片、toast 或占位节点伪装成功。

### 3.3 播放

点击时间线视频节点后：

- 不跳转照片详情页。
- 在当前页打开全屏或近全屏视频预览层。
- 背景压暗，视频居中展示，带播放/暂停。
- 点击遮罩或关闭按钮关闭。
- 图片节点继续沿用当前页大图预览，不跳详情页。

### 3.4 相册、简报与分享图

- 相册列表：视频作为相册媒体之一展示封面，角标显示“视频 5s”。
- 聚会简报：时间线必须显示真实事件标题，例如“李雷 录下 5 秒现场视频”，不能只写“现场事件”。
- 分享长图：视频节点只渲染封面图和视频角标，不尝试把视频内容嵌入长图。
- 分享图保存：如果后端生成长图，视频节点必须使用 CDN 封面；缺封面时该节点进入待处理，不用假图。

## 4. 前端改造范围

### 4.1 类型和服务合同

修改 `miniprogram/services/operations.ts`：

- `RemoteMomentRecord.mediaType` 从 `'image'` 扩展为 `'image' | 'video'`。
- `ManagedMomentPayload` 新增 `mediaType`、`videoUrl`、`coverImageUrl`、`duration`、`uploadVideoAssetId`、`uploadCoverAssetId`。
- `ManagedMomentRecord` 新增视频字段。
- 时间线归一化时保留视频 URL、封面 URL、时长和媒体类型。
- 图片缓存逻辑不得错误处理视频 URL；视频播放使用原始 CDN URL。

### 4.2 进行中页面

修改 `miniprogram/pages/live-record/index.*`：

- 新增“录 5 秒”按钮，与“继续拍照”同级。
- 新增相机录制层状态：`videoRecorderVisible`、`recording`、`recordCountdown`、`tempVideoPath`、`tempThumbPath`、`videoUploadState`。
- 新增事件：
  - `handleRecordVideoTap`
  - `handleVideoRecordCancel`
  - `handleVideoRecordUse`
  - `handleVideoRecordRetry`
  - `handleVideoPreviewTap`
  - `handleVideoPreviewClose`
- 录制流程必须防重入：上传中禁用按钮，离开页面时停止录制并释放计时器。
- 时间线节点渲染按 `mediaType` 分支：
  - 图片：展示图片。
  - 视频：展示封面 + 播放图标 + `5s` 标签。
- 点击视频节点打开当前页视频预览层，不跳转照片详情。

### 4.3 首拍和编辑器

首拍仍保持图片，不把视频作为开局凭证，理由：

- 现有进入进行中、相册封面、分享长图和“首拍证据”均围绕照片设计。
- 若允许视频首拍，会影响首拍门禁、封面生成、分享图、隐私遮挡和老数据兼容。

后续可另开 `VID-MOMENT-002` 支持“首段视频开局”，本计划不做。

`pages/moment-editor/index` 可在本轮只保持图片；若要让编辑器也支持视频，需要单独补视频上传、视频预览、编辑草稿和放弃编辑弹窗合同。

### 4.4 页面联动

以下页面必须兼容视频节点：

- `pages/album/index`：分享图/相册列表显示视频封面和视频角标。
- `pages/session-brief/index`：时间线显示视频事件、封面和播放/预览状态。
- `pages/share-preview/index`：公开回忆里视频只显示封面，不泄露无权限视频 URL。
- `pages/share-poster/index`：长图任务使用视频封面参与生成。
- `pages/me/index`：个人记录统计新增视频数量或统一计入“记录”。
- `pages/rankings/index`：若视频允许推举，必须使用封面参赛；默认本期不开放视频推举。

## 5. 后端和 API 改造范围

### 5.1 上传接口

新增接口：

`POST /api/v1/moments/uploads/video`

请求方式：`multipart/form-data`

字段建议：

- `file`：视频文件，必填。
- `cover`：封面文件，建议必填。前端可使用微信返回的 `tempThumbPath`。
- `sessionId`：聚会 ID，必填。
- `duration`：时长，单位秒，必填。
- `clientDraftId`：客户端草稿 ID，可选。

返回建议：

```json
{
  "assetId": "moment-video-xxx",
  "url": "https://cdn.pomer.cn/moments/videos/xxx.mp4",
  "coverAssetId": "moment-video-cover-xxx",
  "coverImageUrl": "https://cdn.pomer.cn/moments/video-covers/xxx.webp",
  "duration": 5,
  "size": 1234567,
  "mimeType": "video/mp4"
}
```

校验规则：

- 只允许登录用户上传。
- 必须验证用户是当前聚会成员。
- 聚会必须已首拍并处于进行中。
- 视频时长最大 5 秒，允许 1 秒误差，超过拒绝或要求前端压缩/裁切。
- 视频大小建议限制 10 MB 以内，最终值由运维按带宽和 OSS 成本确认。
- MIME 白名单：`video/mp4` 优先；如要支持 `mov`，需确认微信真机格式与 CDN 播放兼容。
- 文件名不使用用户输入，后端生成安全 object key。
- 禁止把视频写入 JSON base64。

### 5.2 创建时间线节点

扩展现有创建 moment 接口：

`POST /api/v1/sessions/:sessionId/moments`

新增 payload：

```json
{
  "mediaType": "video",
  "videoUrl": "https://cdn.pomer.cn/moments/videos/xxx.mp4",
  "coverImageUrl": "https://cdn.pomer.cn/moments/video-covers/xxx.webp",
  "duration": 5,
  "caption": "刚刚录下这一刻",
  "visibility": "participants",
  "usageConsent": {
    "album": true,
    "share": true,
    "ranking": false
  }
}
```

后端改造点：

- `backend/data/moments.js` 的 `MEDIA_TYPES` 扩展为 `image`、`video`。
- `computeMomentStatus` 对视频节点按 `videoUrl` 与 `coverImageUrl` 判定完成。
- `serializeMomentForViewer` 返回 `mediaType`、`videoUrl`、`coverImageUrl`、`duration`。
- `serializeMomentForPublicRanking` 默认过滤视频，除非后续明确支持视频推举。
- 删除上传资产时同时清理视频和封面。
- 时间线标题生成增加视频动作标签，例如“拍视频”或“视频留念”。
- 审核和二次审核字段沿用现有 moment 记录。

### 5.3 数据库与存储

当前 MySQL schema 已有字段：

- `media_type`
- `image_url`
- `video_url`
- `cover_image_url`
- `duration`

仍需确认线上库是否已经同步这些字段。上线前必须执行：

- 线上 schema 差异检查。
- 如果缺字段，补兼容 migration。
- 老图片数据保持 `media_type = image`，不回填视频字段。
- 视频数据必须写 `video_url`、`cover_image_url` 和 `duration`。

### 5.4 对象存储/CDN

建议路径：

- 视频：`moments/videos/{sessionId}/{momentId}.mp4`
- 封面：`moments/video-covers/{sessionId}/{momentId}.webp`

要求：

- 使用 `backend/data/object-storage.js` 的 `putObject` 统一上传。
- 设置正确 `Content-Type`。
- CDN 缓存视频和封面，但删除/替换时必须有版本化 key，避免旧缓存。
- 支持 Range 请求，保证微信端视频播放可以拖动/缓冲。
- Nginx 或对象存储网关需要确认 `client_max_body_size` 与上传超时。

## 6. 隐私、权限与合规

必须使用微信官方隐私授权链路，不做假弹窗替代：

- 摄像头：用于录制现场 5 秒视频。
- 麦克风：如果视频包含现场声音，必须声明并通过后台隐私审核。
- 相册写入：只有用户主动保存视频或分享图到手机时才需要。
- 头像昵称：沿用现有登录授权能力，不与视频功能混在一起。

如果后台隐私未通过：

- 前端不能展示可点击但必失败的“录 5 秒”入口。
- 应展示明确不可用原因，并在计划/验收中标注“待微信后台隐私配置通过”。

## 7. 运营后台与风控

后台需要新增或确认：

- moment 列表支持 `mediaType = video`。
- 视频节点展示封面、时长、上传人、聚会 ID、审核状态。
- 审核操作能处理视频节点，不只处理图片。
- 举报/删除视频时同时删除封面与视频资产。
- 分享图任务使用封面，不直接拉取视频帧。
- 统计看板区分图片数、视频数或统一归入媒体数，口径需产品确认。

风控要求：

- 单场聚会视频数量限制，建议默认每人每局最多 5 条。
- 单条最大 5 秒。
- 单条最大文件体积待运维确认，建议 10 MB 起步。
- 同一用户短时间重复上传要限频。

## 8. UI/UX 设计要求

视觉必须沿用当前 `pp-*` 独立设计系统：

- 按钮：高对比、黑描边、圆角胶囊、active 下移。
- 视频节点：封面卡片内放播放图标，不额外套卡。
- 录制层：大倒计时、进度环、取消按钮，避免遮挡微信胶囊。
- 上传状态：按钮 loading 文案和进度，不使用旧视觉。
- 播放预览：当前页弹层，点击遮罩关闭。

文案建议：

- 入口：`录 5 秒`
- 录制中：`正在记录现场`
- 上传中：`正在保存视频`
- 成功：`已加入时间线`
- 失败：`视频保存失败，请重试`
- 无权限：`需要摄像头和麦克风权限才能录制现场视频`

## 9. 测试与验收

### 9.1 静态检查

- `npm.cmd run check:encoding`
- `npm.cmd run typecheck`
- `git diff --check`
- 扫描 `mediaType: 'image'` 是否仍有遗漏限制。

### 9.2 前端真机验证

至少两台真机：

- 房主首拍前不显示或不可用“录 5 秒”。
- 房主首拍后可录制 5 秒视频。
- 参与者进入进行中后可录制 5 秒视频，前提是成员身份有效。
- 被踢出用户不能录制，并被踢回首页或无效状态页。
- 录制 5 秒后自动停止。
- 取消录制不产生时间线节点。
- 上传失败不插入假节点。
- 上传成功后时间线立即显示视频封面。
- 点击视频封面在当前页播放，再点击关闭。
- 切到相册、简报、分享长图后仍能看到视频封面和真实事件标题。

### 9.3 后端接口验证

- 未登录上传视频返回 401。
- 非成员上传视频返回 403。
- 已结束聚会上传视频返回 409。
- 未首拍聚会上传视频返回 409。
- 超时长视频被拒绝。
- 超大小视频被拒绝。
- 正常视频上传返回 CDN URL 和封面 URL。
- 创建视频 moment 后，时间线接口返回 `mediaType: video`。
- 删除视频 moment 后，视频和封面对象能被清理或标记待清理。

### 9.4 分享图和相册验证

- 视频节点在分享长图中显示封面和视频角标。
- 不把视频文件嵌入长图。
- 视频无封面时分享图任务应失败并给出可解释状态，不生成假图。
- 相册 `mode=shares` 不受视频节点影响，仍能下载已生成分享图。

## 10. 分工计划

| 编号 | 角色 | 任务 | 状态 | 验收证据 |
| --- | --- | --- | --- | --- |
| VID-MOMENT-001-PM | PM | 确认是否带声音、数量限制、视频是否参与推举 | 待确认 | 产品确认记录 |
| VID-MOMENT-001-UI | UI/UX | 补录制层、视频节点、播放弹层、上传态设计 | 已补基础录制层，待设计复核 | 设计图与设计规范变更 |
| VID-MOMENT-001-FE | 前端 | live-record 录制、上传、时间线、播放预览、页面联动 | 已补页面内录制层，待真机联调 | 真机录制和页面截图 |
| VID-MOMENT-001-BE | 后端 | 视频上传接口、moment 视频合同、序列化、校验、删除清理 | 本地 smoke 通过，待线上联调 | API smoke 与单元测试 |
| VID-MOMENT-001-OPS | 运维 | OSS/CDN、Nginx 上传大小、Range、缓存、PM2 部署 | 已派发，待配置验证 | CDN HEAD/Range 与部署记录 |
| VID-MOMENT-001-ADMIN | 后台 | 视频节点审核、删除、统计展示 | 待实现 | 后台人工复核截图 |
| VID-MOMENT-001-QA | 测试 | 两台真机、成员/房主/被踢/已结束/权限场景 | 已派发，待验证 | 测试报告与问题清单 |

## 10.1 执行派发记录

派发时间：2026-06-30

本轮已启动实现，不再停留在纯计划阶段，但仍不能标记完成。

已派发负责人：

- 前端负责人：接收 `VID-MOMENT-001-FE`，基于 `pages/live-record/index.*` 与 `miniprogram/services/operations.ts` 完成录制、上传、时间线、相册和播放预览联调。当前代码已接入页面内 `<camera>` 自动 5 秒录制层、`wx.uploadFile` 视频上传、视频时间线和当前页播放弹层；仍需真机验证。
- 后端负责人：接收 `VID-MOMENT-001-BE`，基于 `backend/server.js` 与 `backend/data/moments.js` 完成视频上传、视频 moment 合同、封面序列化、清理和分享图封面兼容。当前代码已接入 `/api/v1/moments/uploads/video`，并新增 `npm.cmd --prefix backend run smoke:video-moments` 验证；仍需线上联调。
- 运维负责人：接收 `VID-MOMENT-001-OPS`，确认 `api.pomer.cn` 上传大小、OSS/CDN 视频对象、Range 播放、缓存策略和 PM2/Nginx 配置。当前无线上验证证据。
- UI/UX 负责人：接收 `VID-MOMENT-001-UI`，复核页面内自动倒计时录制层视觉。当前实现已经使用 `<camera>` 自动录制 5 秒；真机不支持时才降级为微信原生录制器。
- QA 负责人：接收 `VID-MOMENT-001-QA`，用两台真机覆盖房主、参与者、首拍前、已结束、被踢、隐私权限、上传失败和播放关闭场景。当前无真机验收证据。

当前本地实现边界：

- 已实现真实视频文件上传，视频不走 base64；封面使用微信返回的缩略图 dataUrl。
- 已实现视频 moment 的 `mediaType/videoUrl/coverImageUrl/duration` 合同。
- 已实现进行中页面“录 5 秒”入口、页面内 `<camera>` 自动 5 秒录制层、时间线视频封面、相册视频角标和当前页视频播放弹层。
- 已实现分享长图读取视频封面，不把视频内容嵌入长图。
- 已新增 `backend/scripts/smoke-video-moment-flow.js`，覆盖创建聚会、首拍、multipart 上传视频、创建视频 moment、时间线读取视频字段。
- 未完成后台视频审核页、线上 OSS/CDN Range 验证和两台真机验收。

## 11. 阻塞项

当前不能直接标记可开发完成，缺少以下证据：

- 微信后台摄像头/麦克风隐私配置通过证据。
- 线上库 `moment_records` 视频字段与本地 schema 一致性证据。
- OSS/CDN 对视频上传大小、Range 播放和缓存策略的验证。
- UI 录制层和视频节点设计稿。
- 产品确认：视频是否带声音、每人每局视频数量限制、视频是否参与推举。

## 12. 实施顺序建议

1. PM 确认产品边界：默认 5 秒、是否带声音、数量限制、是否参与推举。
2. 运维确认 OSS/CDN、上传大小、Range 和 Nginx 限制。
3. 后端先补上传接口和 moment 视频合同。
4. 前端接入录制层、上传和时间线展示。
5. 相册、简报、分享图按封面兼容视频。
6. 后台补视频审核与删除。
7. 两台真机做房主/参与者/被踢/已结束/权限完整回归。

## 13. 不做事项

本计划不做以下内容：

- 不允许用图片节点伪装视频。
- 不允许上传失败后显示成功。
- 不允许用本地临时文件当长期视频地址。
- 不允许未声明隐私时强行触发摄像头或麦克风。
- 不把视频作为首拍开局凭证。
- 不改公司官网 `pomer.cn`。
- 不在没有联调证据时写入完成进度。
