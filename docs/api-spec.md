# 酒桌判官接口文档

## 1. 基准地址

- 本地：`http://127.0.0.1:3010/api/v1`
- 线上：`https://pomer.cn/api/v1`

统一响应结构：

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

## 2. 首页配置接口

### `GET /config/home`

用途：

- 获取首页 Banner、快捷工具等配置

返回示例：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "hero": {
      "title": "酒桌判官",
      "subtitle": "欠酒互怼 · 整活不断 · 气氛拉满",
      "imageUrl": "/static/party-hero.png",
      "imageUploadEndpoint": "/api/v1/admin/upload/home-hero",
      "imageUpdateEndpoint": "/api/v1/admin/config/home/hero"
    },
    "quickTools": [
      { "id": "image-compress", "name": "图片压缩" },
      { "id": "text-count", "name": "文字计数" }
    ]
  }
}
```

### `GET /config/compliance`

用途：

- 获取首页合规文案

### `GET /user/profile`

用途：

- 获取首页展示用用户信息

字段：

- `city`
- `points`

## 3. 首页后台管理接口

### `GET /admin/config/home`

用途：

- 后台读取当前首页配置

### `PUT /admin/config/home/hero`

用途：

- 更新首页 Banner 图和文案

请求体示例：

```json
{
  "imageUrl": "https://cdn.example.com/home-hero.jpg",
  "title": "酒桌判官",
  "subtitle": "欠酒互怼 · 整活不断 · 气氛拉满"
}
```

### `POST /admin/upload/home-hero`

用途：

- 预留 Banner 上传入口
- 当前未接对象存储，仅做占位

## 4. 工具接口

### `GET /tools/history`

用途：

- 获取工具历史记录

### `GET /tools/qr-code.png`

用途：

- 生成真实二维码 PNG

查询参数：

- `text`: 二维码内容

返回：

- `image/png`

适用页面：

- 工具详情页 -> 二维码生成

## 5. 社交接口

### `PUT /social/profile`

用途：

- 创建或更新当前用户资料

请求体字段：

- `id`
- `name`
- `avatarUrl`
- `city`
- `signature`
- `identityTag`

### `GET /social/bootstrap?profileId=xxx`

用途：

- 拉取当前用户社交首页数据

返回内容：

- `currentProfile`
- `wineFriends`
- `pokeThreads`

### `GET /social/users/search?profileId=xxx&keyword=yyy`

用途：

- 搜索真实已注册用户

返回字段：

- `id`
- `name`
- `avatarUrl`
- `city`
- `identityTag`
- `alreadyFriend`

### `POST /social/friends`

用途：

- 新增酒友

请求体：

- `ownerId`
- `friendProfileId` 或 `friendName`
- `meta`

### `POST /social/friends/touch`

用途：

- 把当前酒局涉及的玩家写入最近酒友或最近联系

### `PUT /social/friends/:friendshipId`

用途：

- 编辑酒友昵称/备注

### `DELETE /social/friends/:friendshipId?profileId=xxx`

用途：

- 删除酒友

### `POST /social/pokes`

用途：

- 发起拍一拍

请求体：

- `profileId`
- `friendshipId`

### `POST /social/pokes/:threadId/reply`

用途：

- 回拍

请求体：

- `profileId`

### `DELETE /social/pokes/:threadId?profileId=xxx`

用途：

- 忽略拍一拍消息

## 6. 前后端配置约束

### 前端接口地址配置

统一配置文件：

- `miniprogram/config/api.ts`

规则：

- 优先读取运行时存储的接口地址
- 其次读取 `REMOTE_API_BASE`
- 否则回落到本地 `LOCAL_API_BASE`

### 当前后端实现状态

当前后端为轻量 Node 服务：

- 首页配置：`backend/data/home.js`
- 社交逻辑：`backend/data/social.js`
- 社交持久化：`backend/data/social-store.json`

### 当前已知实现边界

- 图片去水印：当前为遮挡导出，不是智能修复算法
- 二维码生成：当前为工具详情页调用真实二维码 PNG 接口
- 社交体系：当前已支持真实用户间流转，但尚未接入正式账号体系
