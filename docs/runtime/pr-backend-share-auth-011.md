# SHARE-AUTH-011 后端/API 分享图权限收口

## 结论

- 已在后端 data 层强制分享图生成类动作必须满足：访问者仍是 session 成员、session 已结束、访问者是房主。
- 未结束时 `createShareImageTask()`、`retryShareImageTask()`、`processShareImageTask()` 返回 `409 session not ended`。
- 结束后普通成员不能创建、重试或处理分享图任务，返回 `403 forbidden`。
- 分享图任务详情和 ready 分享图合集读取继续按成员校验；结束后成员可读取 ready 图，被踢后因不再是成员会被拒绝。

## 改动文件

- `backend/data/moments.js`
  - 新增分享图结束态与房主权限校验。
  - `createShareImageTask()`、`retryShareImageTask()`、`processShareImageTask()` 改为使用该校验。
- `backend/scripts/smoke-share-image-async-flow.js`
  - 覆盖进行中 host/member 创建失败。
  - 覆盖进行中 retry/process 失败。
  - 覆盖结束后房主创建成功、成员只读 ready、被踢后不可读。

## 验证

- `node --check backend/data/moments.js`
- `node --check backend/scripts/smoke-share-image-async-flow.js`
- `npm.cmd run check:encoding`
- `node backend/scripts/smoke-share-image-async-flow.js`

## 部署说明

- 需要部署后端到 `api.pomer.cn` 对应的聚会记录师服务后生效。
- 不涉及 `pomer.cn` 官网。
