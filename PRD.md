# 酒桌判官 PRD 总览

更新时间：2026-06-13

## 1. 项目边界

酒桌判官当前仓库是小程序 + 自建 Node 后端 + 后台管理系统一体项目：

- 小程序前端：`miniprogram/`
- 后端服务：`backend/server.js`
- 后台管理系统：`backend/public/admin/static/heatwave-ops/`
- 部署目标域名：`https://api.pomer.cn`

域名边界必须保持清晰：

- `api.pomer.cn` 是酒桌判官 API、后台页面、静态后台资源、上传资源的部署目标。
- `pomer.cn` 是公司官网，不属于本仓库部署目标。
- 后续涉及 Nginx、PM2、API、公网验证、后台登录、上传、路由时，默认只操作 `api.pomer.cn` 对应服务。

## 2. 文档结构

- [业务流程](./docs/business-flow.md)：小程序页面、用户身份、酒局、社交、积分、模板、会员与工具链路。
- [接口文档](./docs/api-spec.md)：当前 `backend/server.js` 已实现的公开接口与后台接口。
- [后台 IA](./docs/admin-console-ia.md)：后台管理系统页面架构、已实现模块与待补能力。
- [数据库整改计划](./docs/database-normalization-plan.md)：当前 `app_store` 方案与后续实体表迁移计划。
- [部署说明](./DEPLOY.md)：`api.pomer.cn` 部署、PM2、Nginx、MySQL 与验证命令。

## 3. 当前实现状态

### 3.1 小程序

已实现页面以 `miniprogram/app.json` 为准，当前包含：

- 首页、工具箱、酒桌判官首页、我的
- 创建酒局、玩法设置、添加玩家、邀请好友、分享预览、等待开局
- 进行中记录、桌面模式、判官转盘、战报、分享海报、历史酒局
- 积分中心、高级模板、会员中心、优惠券、设置、我的聚友、题库、工具详情等

当前线上接口默认配置在 `miniprogram/config/api.ts`：

```ts
const REMOTE_API_BASE = 'https://api.pomer.cn/api/v1'
```

### 3.2 后端

后端是轻量 Node HTTP 服务，入口为 `backend/server.js`，默认端口 `3010`。当前已经实现：

- 小程序用户微信登录、会话、头像上传、手机号绑定
- 首页、合规、积分、模板、工具、题库、商户、分享配置
- 酒局创建、加入、更新、删除、结束与战报生成
- 二维码 PNG、战报海报 PNG
- 用户社交、酒友、拍一拍
- 积分任务领取、积分商品兑换、模板广告解锁、会员开通
- 后台登录、后台页面数据读写、后台图片上传、后台静态页面托管

### 3.3 后台管理系统

后台当前不是占位页，已经具备可操作的动态管理端：

- 登录与会话鉴权：`/admin/login`、`/api/v1/admin/auth/*`
- 页面入口：`/admin/pages/overview-dashboard`
- 页面数据接口：`/api/v1/admin/pages/:slug`
- 图片上传：`/api/v1/admin/uploads/image`
- 静态资产包：`/admin/static/heatwave-ops/*`

当前后台覆盖：

- 概览台
- 内容运营：首页装修、酒局模板、题库与任务、分享素材、工具箱运营
- 用户与酒局：用户中心、用户登录记录、酒局管理、战报中心
- 商业化：积分体系、积分变动记录、会员体系、商户合作
- 增长与数据：用户分析、内容分析、商业分析
- 系统设置：账号权限、后台积分操作日志、基础配置

### 3.4 数据存储

当前存储策略：

- MySQL 启用条件：配置 `MYSQL_HOST`、`MYSQL_USER`、`MYSQL_DATABASE`
- MySQL 表：`app_store(store_key, data_json, updated_at)`
- JSON 镜像：默认仍写入 `backend/data/*-store.json`，可通过 `STORE_FILE_MIRROR=0` 关闭
- 首次 MySQL 无数据时，会从本地 JSON 导入对应 store

当前 store key：

- `content_store`
- `social_store`
- `admin_store`
- `asset_manifest`

## 4. 当前产品重点

- 酒桌判官以线下聚会闭环为主，不做实时在线游戏。
- 用户身份以微信 OpenID 为核心，手机号为可选绑定；积分、酒局、战报、社交按独立用户隔离。
- 首次登录自动赠送 500 积分，前端有首次登录弹框。
- 每日签到、分享战报、完成聚会再开一局等任务由服务端判断领取条件。
- 后台可生成与管理 `cost=0` 免费模板，前端创建酒局和高级模板页会读取并展示。
- 会员体系带后台总开关，关闭时前端会员相关流程应隐藏或拒绝开通。
- 图片去水印仍是遮挡式导出，不是 AI 修复。
- 数据库当前仍是大 JSON store，正式生产前建议继续实体表拆分。
