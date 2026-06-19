# 酒桌判官精彩瞬间 DBA/运维计划

更新时间：2026-06-17

本文只记录 DBA/运维职责范围内的发布、数据库、PM2、Nginx、备份、回滚和线上写操作窗口检查。不得修改 PM 总台账，不得替后端、前端、后台、测试、接口联调、UGC、UI/UX 或数据指标角色标记完成。

## 1. 边界

- 目标项目：酒桌判官。
- 目标域名：`api.pomer.cn`。
- 目标服务：`jiuzhuopanguan-backend`。
- 目标数据库：`jiuzhuopanguan`。
- 禁止触碰：`pomer.cn` 公司官网、`pomer` PM2 服务、公司官网 Nginx 路由。
- 未获 PM 明确授权前，不执行服务器级变更、不重启 PM2/Nginx、不写线上数据库、不执行 DDL、不清理线上测试数据。

## 2. DEPLOY-READY-001 部署准入与线上真实联调前置检查

任务编号：`DEPLOY-READY-001`

当前状态：待准入，不具备部署/线上写操作完整准入。

### 2.1 已收到的只读证据

PM 已提供以下只读证据：

- `https://api.pomer.cn/api/v1/config/home` 返回 200 且 `code:0`。
- `https://api.pomer.cn/api/v1/config/points` 返回 200 且 `code:0`。
- `https://api.pomer.cn/api/v1/config/templates` 返回 200 且 `code:0`。
- `https://api.pomer.cn/admin` 返回 302 到登录页。
- `https://api.pomer.cn/admin/login` 返回 200。
- 本轮未访问或改动 `pomer.cn`，未写线上，未重启服务。
- 本地 `INT-DATA-001` manifest 和 3221 接口层可用，但真机、后台写操作、MySQL 实连仍未闭环。

DBA/运维判断：以上只读证据只能说明线上公共只读入口和后台登录页在线，不能替代部署准入、线上写入验收、MySQL 实体表验收或后台强审计动作验收。

### 2.2 部署前必须满足的准入项

| 准入项 | 当前状态 | 必须补齐的证据 | 责任角色 |
| --- | --- | --- | --- |
| MySQL 实连 | 未闭环 | 在可用 MySQL 环境执行 `npm run mysql:test`，确认目标库为 `jiuzhuopanguan`、store 表为 `app_store` | DBA/运维 |
| DDL 实体表复核 | 未闭环 | 8 张 moments 实体表 DDL 执行日志、`SHOW CREATE TABLE` 或导出、幂等复跑记录 | DBA/运维，后端/API 配合 |
| `moments_store -> 8 表` 同步 | 未闭环 | `db:sync-normalized` 执行日志、8 张表同步前后行数、样本字段对账、失败处理说明 | DBA/运维，后端/API，测试 |
| 执行前备份 | 未提供本轮备份 | 本轮执行前 `mysqldump --no-tablespaces` 路径、脚本快照、校验和 | DBA/运维 |
| 回滚方案 | 未获授权演练 | 回滚触发条件、恢复 SQL 路径、是否允许停服、回滚后 smoke 命令 | PM，DBA/运维 |
| PM2 归属 | 待线上窗口确认 | `pm2 describe jiuzhuopanguan-backend`、不得操作 `pomer` | DBA/运维 |
| Nginx 归属 | 待线上窗口确认 | `server_name api.pomer.cn`，反代 `127.0.0.1:3010`，不得包含 `pomer.cn` / `www.pomer.cn` | DBA/运维 |
| 后台写操作窗口 | 未授权 | 后台测试账号或 session、允许执行的动作、样本 ID、录屏和 operationLogs 采集要求 | PM，后台，测试，DBA/运维 |
| 测试数据清理授权 | 未授权 | `INT-DATA-001` manifest、清理范围、清理命令、清理前证据导出要求 | PM，接口联调，测试，DBA/运维 |
| 真机/体验版验收 | 未闭环 | 设备、微信版本、体验版或开发者工具 GUI、A/B/C 登录态、截图/录屏 | 测试，前端，接口联调 |

### 2.3 命令授权边界

只读命令，允许在 PM 只读核查或 DBA 准备阶段执行：

```bash
curl -f https://api.pomer.cn/api/v1/config/home
curl -f https://api.pomer.cn/api/v1/config/points
curl -f https://api.pomer.cn/api/v1/config/templates
curl -i https://api.pomer.cn/admin
curl -i https://api.pomer.cn/admin/login
pm2 describe jiuzhuopanguan-backend
pm2 status
grep -R "server_name api.pomer.cn" /etc/nginx/conf.d /etc/nginx/sites-enabled 2>/dev/null
grep -R "127.0.0.1:3010" /etc/nginx/conf.d /etc/nginx/sites-enabled 2>/dev/null
npm run mysql:test
```

写文件但不写库，需 PM 授权：

```bash
mysqldump --single-transaction --routines --triggers --no-tablespaces ...
tar -czf ...
sha256sum ...
```

写库，必须 PM 明确授权：

```bash
mysql "$MYSQL_DATABASE" < backend/sql/mysql-normalized-schema.sql
npm run db:sync-normalized
```

高风险停服/回滚，必须 PM 明确回滚授权：

```bash
pm2 stop jiuzhuopanguan-backend
DROP DATABASE ...
mysql "$MYSQL_DATABASE" < mysql-before-xxx.sql
pm2 restart jiuzhuopanguan-backend --update-env
```

本任务不需要且不得执行：

- `pm2 restart jiuzhuopanguan-backend --update-env`
- `nginx -s reload` 或 `systemctl reload nginx`
- 任何 `pomer` / `pomer.cn` 相关操作
- 未授权的线上写接口、后台 action、清理脚本

### 2.4 当前准入结论

`DEPLOY-READY-001` 当前不通过。

原因：

- 线上只读入口在线，但不能证明写入链路、后台写操作、真机链路、MySQL 实体表和同步链路可用于准出。
- `DEV-M0-01` 仍缺可用 MySQL 环境下的 DDL、`db:sync-normalized`、幂等和字段/行数对账证据。
- `INT-DATA-001` 当前是本地接口层数据，不代表线上 `api.pomer.cn` 写操作已授权或已验收。
- 后台写操作窗口、后台账号、operationLogs 线上证据、测试数据清理授权仍缺。
- 未提供本轮部署/DDL 前备份路径和回滚授权。

### 2.5 下一步责任分配建议

| 责任角色 | 下一步 | 证据 |
| --- | --- | --- |
| PM | 明确是否进入线上写操作/DDL 准备窗口，给出授权范围、目标环境、回滚触发条件 | 授权记录、窗口时间、目标服务和数据库 |
| DBA/运维 | 在 PM 授权后先做只读归属确认，再执行备份、DDL/sync、幂等和回滚证据采集 | 备份路径、DDL 日志、8 表结构、行数对账、回滚方案 |
| 后端/API | 对 `moments_store -> 8 表` 同步映射提供最终字段确认和已知风险说明 | 字段对照、唯一键/幂等说明、失败处理说明 |
| 测试/验收 | 给出部署准入验收表和线上写操作验收记录格式 | 测试表单、证据命名、通过/退回标准 |
| 接口联调 | 明确线上或本地 manifest 的样本 ID、token、清理策略 | manifest、样本说明、清理命令 |
| 后台负责人 | 提供线上后台写操作动作清单和 operationLogs 采集点 | 后台账号窗口、动作录屏、日志截图 |

## 3. 本轮未执行事项

- 未执行服务器级变更。
- 未重启 PM2。
- 未 reload Nginx。
- 未写线上数据库。
- 未执行 DDL。
- 未执行 `db:sync-normalized`。
- 未访问或操作 `pomer.cn` 公司官网。

## 4. DEPLOY-AUTH-001 部署/线上写操作授权清单

任务编号：`DEPLOY-AUTH-001`

当前状态：待授权。`DEPLOY-READY-001` 当前不通过，不能进入部署、线上写操作、DDL/sync 或线上数据清理。

用途：将从当前只读在线状态进入 `api.pomer.cn` 真实联调/部署所需的授权、备份、回滚、PM2/Nginx/MySQL 证据拆成可勾选清单。任何一项缺失时，DBA/运维只能继续只读核查或标记阻塞。

### 4.1 授权清单

| 勾选 | 授权/证据项 | 当前状态 | 必须补齐的内容 | 责任角色 |
| --- | --- | --- | --- | --- |
| [ ] | 目标域名确认 | 待授权 | 本轮目标只允许 `api.pomer.cn`，接口前缀为 `https://api.pomer.cn/api/v1`，后台为 `https://api.pomer.cn/admin` | PM，DBA/运维 |
| [ ] | 禁止触碰公司官网 | 待确认 | 明确禁止改动、重启、代理、部署、清理或访问写操作到 `pomer.cn` / `www.pomer.cn` / `pomer` PM2 服务 | PM，DBA/运维 |
| [ ] | 目标服务确认 | 待授权 | 只允许检查或操作 `jiuzhuopanguan-backend`；写操作前需 `pm2 describe jiuzhuopanguan-backend` 证据 | DBA/运维 |
| [ ] | 目标数据库确认 | 待授权 | `.env` 指向 `MYSQL_DATABASE=jiuzhuopanguan`、`MYSQL_STORE_TABLE=app_store`；不得误连其他库 | DBA/运维 |
| [ ] | 执行窗口授权 | 未授权 | PM 明确窗口时间、执行人、允许动作范围：只读 / 写库 / 后台写操作 / 回滚 | PM |
| [ ] | 执行前数据库备份 | 未完成 | `mysqldump --single-transaction --routines --triggers --no-tablespaces` 输出路径、文件大小、校验和 | DBA/运维 |
| [ ] | 执行前代码/DDL 快照 | 未完成 | `backend/sql/mysql-normalized-schema.sql`、`backend/data/normalized-db.js`、`backend/scripts/sync-normalized-db.js`、`backend/package.json` 快照与校验和 | DBA/运维 |
| [ ] | MySQL 实连 | 未闭环 | 在可用 MySQL 环境执行 `npm run mysql:test`，不能只用本机 `ECONNREFUSED` 或历史线上 `app_store` 记录替代 | DBA/运维 |
| [ ] | 8 张 moments 实体表 DDL | 未闭环 | 执行 DDL 后采集 `SHOW CREATE TABLE`：`moment_records`、`session_events`、`session_briefs`、`share_image_tasks`、`moment_reports`、`moment_nominations`、`ranking_reward_rules`、`ranking_reward_payouts` | DBA/运维，后端/API |
| [ ] | `moments_store -> 8 表` 同步 | 未闭环 | `npm run db:sync-normalized` 日志、8 表同步前后行数、样本字段对账、失败项说明 | DBA/运维，后端/API，测试 |
| [ ] | 幂等复跑授权 | 未授权 | PM 确认允许重复执行 DDL 和 `db:sync-normalized`；复跑前后行数、唯一键和样本无重复 | PM，DBA/运维 |
| [ ] | PM2 归属证据 | 未采集 | `pm2 status` 与 `pm2 describe jiuzhuopanguan-backend`；不得对 `pomer` 执行 stop/restart | DBA/运维 |
| [ ] | Nginx 归属证据 | 未采集 | `server_name api.pomer.cn`，反代到 `127.0.0.1:3010`；配置中不得写 `pomer.cn` / `www.pomer.cn` | DBA/运维 |
| [ ] | 后台写操作窗口 | 未授权 | 后台账号或 session、允许执行的 slug/action、样本 ID、录屏责任人、operationLogs 验收点 | PM，后台，测试，DBA/运维 |
| [ ] | M4 低风险动作授权 | 未授权 | 是否允许审核/举报/retry/奖励配置保存；每个动作需原因、日志、前台同步截图 | PM，后台，测试，UGC |
| [ ] | M5 发奖/重复发奖授权 | 未授权 | 是否允许执行发奖和重复发奖；需 points ledger、rankingRewardPayouts、幂等和回滚说明 | PM，后端/API，后台，测试，UGC |
| [ ] | 测试账号/token | 未完成 | A/B/C/outsider 小程序账号或 token、后台账号、账号和 profileId 对照 | PM，接口联调，测试 |
| [ ] | 测试数据清理授权 | 未授权 | 只按 `INT-DATA-001` manifest 和测试前缀清理；清理前导出 evidence；远程 cleanup 必须单独授权 | PM，接口联调，DBA/运维 |
| [ ] | 回滚责任人 | 未指定 | 明确谁决定回滚、谁执行回滚、谁复核回滚后 smoke、是否允许停服 | PM，DBA/运维，测试 |
| [ ] | 回滚命令确认 | 未授权 | SQL 恢复路径、`pm2 stop/restart jiuzhuopanguan-backend` 条件、回滚后 `mysql:test` 和公网只读 smoke | PM，DBA/运维 |
| [ ] | 真机/体验版证据 | 未闭环 | 体验版二维码或开发者工具 GUI、设备、微信版本、A/B/C 登录态、截图/录屏 | 测试，前端，接口联调 |
| [ ] | UI/UX/UGC 签字 | 未闭环 | UGC 反例签字、UI/UX 截图 QA；不得用接口层 smoke 替代真实样本验收 | UGC，UI/UX，测试 |

### 4.2 授权分级

只读授权：

- 可访问 `api.pomer.cn` 公共 GET 接口和后台登录页。
- 可执行 `pm2 status`、`pm2 describe jiuzhuopanguan-backend`、Nginx grep、`npm run mysql:test`。
- 不允许修改文件、重启服务、写库、后台 action、清理数据。

备份授权：

- 允许在服务器写备份目录、生成数据库备份、生成代码/DDL 快照和校验和。
- 不允许执行 DDL、同步脚本或业务写操作。

写库授权：

- 允许执行 `backend/sql/mysql-normalized-schema.sql` 和 `npm run db:sync-normalized`。
- 必须先有备份、目标库确认、回滚路径和 PM 明确窗口。

后台写操作授权：

- 允许在指定后台 slug 和指定样本上执行 action。
- 必须限定动作、原因、样本 ID、录屏、operationLogs 和前台同步截图。

清理授权：

- 只允许按 manifest 和测试前缀清理。
- 清理前必须导出证据。
- 远程 `api.pomer.cn` cleanup 必须单独授权，不能复用本地 cleanup 授权。

回滚授权：

- 只有 PM 明确触发时执行。
- 必须指定回滚责任人、备份 SQL、是否停服、恢复后验证命令。

### 4.3 当前结论

当前仍不具备部署准入，也不具备线上真实写操作准入。

原因：

- 线上只读证据只说明 `api.pomer.cn` 公共接口和后台登录入口在线，不能替代部署授权。
- `DEV-M0-01` 仍缺 MySQL 实连、DDL/sync、幂等和回滚证据。
- `INT-DATA-001` 当前主要证明本地接口层数据可用，不代表线上写操作授权。
- 后台写操作窗口、后台账号、operationLogs、pointsLedger、真实前台同步截图仍缺。
- 真机/体验版、UGC 反例签字、UI/UX 截图 QA 未闭环。

### 4.4 PM 授权后第一步

如果 PM 后续授权进入部署/线上写操作准备，DBA/运维第一步必须先做只读归属确认，不直接写库或重启：

```bash
ssh pomer.cn
cd /www/wwwroot/jiuzhuopanguan-git/backend
pwd
grep -E '^(PORT|MYSQL_HOST|MYSQL_PORT|MYSQL_USER|MYSQL_DATABASE|MYSQL_STORE_TABLE|STORE_FILE_MIRROR)=' .env
pm2 describe jiuzhuopanguan-backend
pm2 status
grep -R "server_name api.pomer.cn" /etc/nginx/conf.d /etc/nginx/sites-enabled 2>/dev/null
grep -R "127.0.0.1:3010" /etc/nginx/conf.d /etc/nginx/sites-enabled 2>/dev/null
npm run mysql:test
```

只有上述归属确认无误，并且 PM 明确允许备份后，才能进入执行前备份；只有备份、回滚路径和窗口均确认后，才能进入 DDL/sync 或后台写操作。

## 5. PR-OPS-001 聚会记录师改版部署/资源影响评估

任务编号：`PR-OPS-001`

当前状态：待评估完成，不具备上线部署准入。

背景：产品面向用户的新名称改为“聚会记录师”，但技术域名边界不变。小程序后端、API、后台部署和验证目标仍只能是 `api.pomer.cn` / `jiuzhuopanguan-backend`；不得触碰 `pomer.cn` 公司官网。

### 5.1 部署影响面

| 影响项 | 运维判断 | 风险 | 上线前必须补齐 |
| --- | --- | --- | --- |
| 品牌文案 | 新增 UI、测试报告和对外描述应使用“聚会记录师”；旧代码模块名可保留历史上下文 | 文案若只改前端不改后台配置/分享图，线上会出现新旧品牌混用 | 前端/UI/UX 提供页面文案清单；后端/后台确认运营配置、分享文案、模板标题是否需同步 |
| 插画/图片资源 | 改版允许卡通、潮流、多巴胺、贴纸感图形 | 新图过大可能导致小程序包体增加、加载慢或上传资源占满 `/uploads`；历史经验显示 1MB 级静态资源会带来发布风险 | UI/UX/前端提供所有新增图片路径、尺寸、格式、压缩前后体积、是否进小程序主包或远程资源 |
| 分享图 | 分享页从附属功能变主路径，可能涉及分享海报模板、二维码、照片墙素材 | 分享图渲染依赖后端 PNG/上传资源，若未验证 ready/failed/retry 和私密过滤，会引发线上分享失败或隐私风险 | 后端/API 提供分享图模板字段和过滤规则；测试提供 ready/failed/expired 证据；UGC 确认私密/未授权/隐藏内容不入图 |
| 后台配置 | 可能新增或调整首页装修、模板、分享文案、奖励/玩法降权开关 | 后台写操作属于线上 action；无窗口时不能直接保存配置 | 后台负责人提供变更项、slug、字段、默认值和回滚方式；PM 授权后台写操作窗口 |
| 静态资源体积 | 小程序图片、后台静态资源、上传素材都需体积核查 | 包体超限、首屏加载变慢、缓存旧资源造成新旧视觉混用 | 前端提交 `miniprogram` 资源清单和包体估算；后台提交 `backend/public/admin/static` 差异；运维只在授权后复核部署包体 |
| 缓存 | 新品牌资源可能被小程序、浏览器、Nginx 或客户端缓存 | 用户可能继续看到旧“酒桌判官”文案/图标/分享图 | 前端/后台提供版本号或资源文件名策略；后端/API 提供分享图缓存刷新策略；运维确认是否需要静态资源 cache busting |
| 回滚 | 改版同时影响 UI 文案、资源、后台配置和分享图 | 仅回滚代码可能无法回滚后台配置、上传资源和已生成分享图 | PM 指定回滚责任人；后端/后台提供配置备份；运维在授权后备份代码、数据库和关键上传目录 |
| 数据库 | 改版本身不必然需要 DDL，但三步创建、相册、分享可能触发字段或配置变化 | 若后端新增字段或同步映射未验收，会放大 `DEV-M0-01` 未闭环风险 | 后端/API 明确是否新增 DDL、store key 或配置字段；DBA/运维继续要求 MySQL 实连和 DDL/sync 证据 |
| PM2/Nginx | 产品名变化不改变服务名和域名 | 误把 `pomer.cn` 官网当成新品牌目标会造成跨项目事故 | 继续只允许 `api.pomer.cn` 与 `jiuzhuopanguan-backend`；任何 `pomer.cn` 操作必须退回 PM |

### 5.2 上线前授权与备份/回滚证据

聚会记录师改版上线前，除 `DEPLOY-AUTH-001` 已列授权外，还必须补齐以下改版专项材料：

| 勾选 | 改版专项证据 | 当前状态 | 责任角色 |
| --- | --- | --- | --- |
| [ ] | 新旧品牌文案替换清单，说明哪些历史“酒桌判官”保留、哪些面向用户必须替换 | 未提供 | UI/UX，前端，后端/API，后台 |
| [ ] | 新增插画、图片、图标、分享图模板资源清单，含路径、尺寸、格式和压缩后体积 | 未提供 | UI/UX，前端 |
| [ ] | 小程序主包/分包体积估算和超限风险说明 | 未提供 | 前端，测试 |
| [ ] | 后台静态资源差异清单和缓存更新策略 | 未提供 | 后台，前端 |
| [ ] | 分享图生成链路回归证据，覆盖 ready、failed、expired、retry 和私密过滤 | 未闭环 | 后端/API，测试，UGC |
| [ ] | 后台配置变更清单，含字段、默认值、操作 slug、是否写 operationLogs | 未提供 | 后台，后端/API |
| [ ] | 改版前数据库备份、配置备份、上传资源快照路径 | 未授权 | DBA/运维 |
| [ ] | 改版回滚包：代码版本、数据库恢复方式、后台配置恢复方式、资源恢复方式 | 未提供 | PM，DBA/运维，后端/API，后台 |
| [ ] | 真机 375px/390px/414px 边界验收和截图/录屏 | 未闭环 | UI/UX，前端，测试 |
| [ ] | 线上写操作窗口和测试数据清理授权 | 未授权 | PM，DBA/运维，接口联调，测试 |

### 5.3 DBA/运维准入结论

当前不允许部署“聚会记录师”改版，不允许线上写配置，不允许 DDL/sync，不允许重启服务。

原因：

- 改版需求已明确，但 UI/UX 视觉方向、前端资源清单、后端 API/配置影响、后台配置变更和测试真机证据尚未交齐。
- 只读在线证据不能证明新资源、新分享图、新后台配置和缓存策略可上线。
- `DEPLOY-READY-001` 与 `DEPLOY-AUTH-001` 仍未通过，MySQL 实连、备份、回滚、PM2/Nginx 归属和后台写操作窗口仍缺。
- 改版包含图片/插画/分享图资源，必须先做包体和缓存评估，不能直接发布。

### 5.4 需要其他角色补齐的资源清单

| 角色 | 必须补齐 | DBA/运维用途 |
| --- | --- | --- |
| UI/UX | 3 套视觉方向或最终选型；首页、创建、邀请、拍照、记录/相册 5 屏；插画/贴纸/色彩/字体使用说明 | 判断是否涉及新增资源、包体、缓存和回滚 |
| 前端 | 页面/组件影响清单；新增资源路径；图片压缩后体积；主包/分包体积估算；API base 是否保持 `https://api.pomer.cn/api/v1` | 评估发布包体、缓存策略和是否触发部署风险 |
| 后端/API | 三步创建是否新增接口/字段；分享图模板和过滤规则；是否新增 DDL/store key/配置字段 | 判断是否需要 MySQL/DDL/sync 复核和回滚 |
| 后台 | 后台配置变更 slug、字段、默认值、写操作 action、operationLogs 记录方式 | 准备后台写操作窗口和配置回滚 |
| 测试/验收 | 真机边界截图/录屏；三步创建拍照链路；分享图回归；资源加载和缓存复测 | 判断是否满足上线前验收 |
| UGC 风控 | 新分享路径下私密、公开、照片墙、分享图的过滤签字 | 避免上线后隐私或公开分享风险 |
| 接口联调 | 新版三步流程 manifest、账号/token、清理策略 | 支撑线上或本地真实联调窗口 |

### 5.5 本节未执行事项

- 未执行服务器级变更。
- 未部署“聚会记录师”改版。
- 未重启 PM2/Nginx。
- 未写线上数据库或后台配置。
- 未执行备份、DDL、`db:sync-normalized` 或 cleanup。
- 未访问或操作 `pomer.cn` 公司官网。

## 6. PR-OPS-ONLINE-RETEST-GATE-001 上线复拍准入确认

任务编号：`PR-OPS-ONLINE-RETEST-GATE-001`

当前状态：待前端/用户复拍证据；DBA/运维无服务器动作。

背景：用户准备在新改动上线后提供 iPhone 12 / 微信 8.0.73 截图录屏。本轮主要目标是小程序前端预览版或体验版复拍准入确认，不代表服务器发布、数据库写入或后台 action 授权。

### 6.1 本轮复拍边界

| 项目 | DBA/运维判断 |
| --- | --- |
| 复拍对象 | 小程序前端预览版/体验版，重点等待 iPhone 12、微信 8.0.73 截图录屏 |
| 默认服务器动作 | 无需服务器操作，等待前端/用户提供构建号、预览/体验版二维码、截图录屏 |
| 允许核查 | 仅限记录准入条件、域名边界、是否需要服务器配合的授权清单 |
| 禁止动作 | 未获 PM 明确授权前，不写库、不 DDL、不执行 `db:sync-normalized`、不 cleanup、不重启 PM2、不 reload Nginx、不后台写 action、不备份 |

### 6.2 域名与服务边界

- 本项目后端/API/后台目标仍只允许 `api.pomer.cn`。
- 小程序接口基线仍应指向 `https://api.pomer.cn/api/v1`。
- 不得触碰 `pomer.cn` / `www.pomer.cn` 公司官网。
- 不得操作 `pomer` PM2 服务或公司官网 Nginx 路由。
- 如复拍只涉及微信开发者工具上传、预览或体验版分发，DBA/运维不需要进入服务器、不需要连接 MySQL、不需要重启 `jiuzhuopanguan-backend`。

### 6.3 服务器配合的最小授权清单

仅当 PM 明确说明“新改动上线需要服务器配合”时，DBA/运维才可按以下最小动作申请授权；无授权时全部标记为“待授权”。

| 可能动作 | 目标 | 是否写入/变更 | 前置授权与证据 |
| --- | --- | --- | --- |
| 只读归属确认 | `api.pomer.cn`、`jiuzhuopanguan-backend`、`jiuzhuopanguan` | 否 | PM 只读授权；确认不得触碰 `pomer.cn` |
| 公网只读 smoke | `https://api.pomer.cn/api/v1/config/home` 等公共 GET | 否 | PM 只读授权；记录 HTTP 状态和时间 |
| 代码拉取/部署 | `/www/wwwroot/jiuzhuopanguan-git` 或 PM 指定目录 | 是 | PM 部署授权、目标分支/commit、回滚 commit、部署窗口 |
| PM2 重启 | `jiuzhuopanguan-backend` | 是 | PM 重启授权、`pm2 describe` 归属证据、重启前后 smoke、不得操作 `pomer` |
| Nginx reload | `api.pomer.cn` 配置 | 是 | PM Nginx 授权、`nginx -t`、配置备份、确认不含 `pomer.cn` / `www.pomer.cn` |
| MySQL 备份 | `jiuzhuopanguan` | 写备份文件 | PM 备份授权、备份路径、文件大小、校验和 |
| MySQL DDL/sync | `jiuzhuopanguan`、8 张 moments 表 | 写库 | PM 写库授权、执行前备份、回滚 SQL、DDL/sync 命令和幂等复跑计划 |
| cleanup | `INT-DATA-001` 指定测试数据 | 写库/业务数据 | PM 清理授权、manifest、清理范围、清理前导出证据 |

### 6.4 当前准入结论

当前复拍准入仅支持“小程序前端预览/体验版复拍等待态”：

- 如果前端只是通过微信开发者工具上传、预览或提交体验版：DBA/运维无需服务器操作，等待前端/用户提供构建号、二维码、iPhone 12 / 微信 8.0.73 截图录屏。
- 如果前端需要服务器同步上线配合：当前未收到 PM 对部署、重启、Nginx、PM2、MySQL、备份、回滚或 cleanup 的明确授权，DBA/运维只能标记为待授权。
- 当前不判定部署准入通过，不替前端、测试、UI/UX 或 PM 标记验收完成。

### 6.5 需要 PM 派给谁的下一步

| 责任角色 | 下一步 | DBA/运维需要的证据 |
| --- | --- | --- |
| 前端 | 提供本次小程序构建号、commit/分支、微信开发者工具上传记录、预览/体验版二维码 | 构建号、二维码、是否改 API base、是否需要服务器配合 |
| 用户/测试 | 用 iPhone 12 / 微信 8.0.73 复拍主路径截图录屏 | 截图录屏、设备/微信版本、失败点说明 |
| UI/UX | 复核新版是否已脱离旧样式框、是否符合设计图主路径 | 退回码或通过记录、关键屏截图 |
| PM | 判断是否仅前端复拍，或是否进入服务器部署窗口 | 若需服务器配合，给出目标服务、授权范围、窗口、备份/回滚要求 |
| DBA/运维 | 在 PM 授权后只先做目标归属只读确认 | `api.pomer.cn`、`jiuzhuopanguan-backend`、`jiuzhuopanguan` 归属证据 |

## 7. PR-OPS-RANKINGS-ONLINE-ROUTE-GATE-001 Rankings 线上路由部署准入

任务编号：`PR-OPS-RANKINGS-ONLINE-ROUTE-GATE-001`

当前状态：待授权、待部署准入复核；DBA/运维本轮不执行服务器动作。

背景：接口联调已确认线上 `https://api.pomer.cn/api/v1/rankings/today?...` 当前返回 404 / `message=not found`，本地正确路由可返回 200。前端已做中文兜底，但线上 API 路由/部署未闭环。该现象倾向于“线上后端版本或路由部署未更新”，不能由前端兜底替代后端发布闭环。

### 7.1 本轮边界

- 本轮只做运维/部署准入评估，不部署、不重启、不改 Nginx、不改 PM2、不写库、不 cleanup。
- 本任务只允许面向 `api.pomer.cn` 对应的酒桌判官/聚会记录师后端服务。
- `pomer.cn` / `www.pomer.cn` 是公司官网，不得触碰、不得重启、不得改路由、不得覆盖配置。
- 未获 PM 明确授权前，不执行 `git pull`、`npm install`、`pm2 restart`、`nginx -t`、`systemctl reload nginx`、MySQL 备份/DDL/sync 或任何线上 cleanup。

### 7.2 部署准入清单

如 PM 后续确认需要部署后端 rankings 路由，DBA/运维必须先逐项确认以下内容；任何关键项缺失时只能标记待授权/阻塞。

| 准入项 | 必须确认 | 当前状态 | 责任角色 |
| --- | --- | --- | --- |
| 目标域名 | 只允许 `api.pomer.cn`，接口路径为 `/api/v1/rankings/today` | 待授权确认 | PM，DBA/运维 |
| 禁止触碰官网 | 不得操作 `pomer.cn` / `www.pomer.cn` / `pomer` PM2 服务 | 待 PM 重申 | PM，DBA/运维 |
| Nginx 归属 | `server_name api.pomer.cn`，`/api/v1/` 反代到 `127.0.0.1:3010`，配置不含官网域名 | 待只读采集 | DBA/运维 |
| PM2 服务名 | 只允许 `jiuzhuopanguan-backend`，不得操作 `pomer` | 待只读采集 | DBA/运维 |
| 后端目录 | PM 指定线上目录，预期为酒桌判官/聚会记录师后端目录，不得进入公司官网目录 | 待 PM/运维确认 | PM，DBA/运维 |
| 当前 commit/版本 | 采集线上当前 commit、分支、工作区状态和 `backend/package.json` 版本/脚本 | 待只读采集 | DBA/运维，后端/API |
| 待发布 commit | 后端提供包含 rankings 路由的 commit/分支、文件清单、语法/本地 smoke 证据 | 待后端提供 | 后端/API |
| 依赖变更 | 后端确认是否有新增 npm 依赖、环境变量、数据库字段或配置 | 待后端提供 | 后端/API |
| 数据库影响 | 若只是路由发布且不涉及 DDL/数据迁移，应明确“不写库”；若涉及库变更，回到 `DEPLOY-AUTH-001` | 待后端确认 | 后端/API，DBA/运维 |
| 回滚命令 | 明确回滚 commit 或 tag、是否需要 `npm install` 回退、PM2 回滚重启条件 | 待 PM/后端提供 | PM，后端/API，DBA/运维 |
| 健康检查 URL | 发布后至少验证公共配置、后台登录页、rankings 路由 | 待确认 | PM，DBA/运维，接口联调 |
| 执行窗口 | PM 给出窗口时间、执行人、允许动作范围和失败回滚触发条件 | 未授权 | PM |

### 7.3 需要 PM/用户授权的动作

| 动作 | 是否变更服务器 | 授权要求 | 备注 |
| --- | --- | --- | --- |
| 只读公网复核 `rankings/today` 状态 | 否 | PM 只读授权 | 可记录 404 现状和响应时间，不代表部署 |
| 只读归属确认 Nginx/PM2/目录/commit | 否 | PM 只读授权 | 只查 `api.pomer.cn` 与 `jiuzhuopanguan-backend` |
| 拉取代码或切换 commit | 是 | PM 部署授权 | 必须指定目标 commit/分支和回滚点 |
| 安装依赖 | 是 | PM 部署授权 | 仅当后端确认依赖变化且窗口允许 |
| 重启 PM2 | 是 | PM 重启授权 | 仅限 `jiuzhuopanguan-backend`，不得操作 `pomer` |
| Nginx 检查/reload | 是 | PM Nginx 授权 | 仅当路由确需 Nginx 改动；当前示例 `/api/v1/` 已覆盖，优先判断是否无需改 Nginx |
| MySQL 备份/DDL/sync | 是 | PM 数据库专项授权 | rankings 路由发布默认不应写库；如后端声明需要，必须回到 DDL/备份/回滚流程 |
| cleanup | 是 | PM 清理专项授权 | 本任务不需要 cleanup，除非 PM 单独派发测试数据清理 |

### 7.4 如获授权后的最小验证路径

授权后仍应按“先只读、再变更、再验证”的顺序执行。

只读归属确认：

```bash
cd /www/wwwroot/jiuzhuopanguan-git/backend
pwd
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
git status --short
pm2 describe jiuzhuopanguan-backend
pm2 status
grep -R "server_name api.pomer.cn" /etc/nginx/conf.d /etc/nginx/sites-enabled 2>/dev/null
grep -R "127.0.0.1:3010" /etc/nginx/conf.d /etc/nginx/sites-enabled 2>/dev/null
```

发布后健康检查：

```bash
curl -f https://api.pomer.cn/api/v1/config/home
curl -f https://api.pomer.cn/api/v1/config/points
curl -f https://api.pomer.cn/api/v1/config/templates
curl -i https://api.pomer.cn/api/v1/rankings/today
curl -I https://api.pomer.cn/admin
curl -I https://api.pomer.cn/admin/login
pm2 logs jiuzhuopanguan-backend --lines 80
```

回滚验证：

```bash
git rev-parse HEAD
git checkout <rollback-commit-or-tag>
npm install
pm2 restart jiuzhuopanguan-backend --update-env
curl -f https://api.pomer.cn/api/v1/config/home
curl -i https://api.pomer.cn/api/v1/rankings/today
```

以上命令均为执行包，不代表本轮已执行；涉及 `git checkout`、`npm install`、`pm2 restart` 的步骤必须有 PM 明确部署/回滚授权。

### 7.5 当前结论与阻塞

当前不能写“已部署”，也不能判定线上 rankings 路由闭环。

阻塞项：

- PM 尚未授权进入 `api.pomer.cn` 服务器只读归属确认或部署窗口。
- 后端/API 尚需提供包含 rankings 路由的目标 commit/分支、改动文件、是否新增依赖/环境变量/数据库影响、本地 200 smoke 证据。
- DBA/运维尚未采集线上 Nginx、PM2、后端目录、当前 commit、回滚点和发布后健康检查证据。
- 接口联调需在发布后复测 `https://api.pomer.cn/api/v1/rankings/today?...`，确认从 404 变为预期 200/业务响应。

PM 下一步应派给：

| 责任角色 | 下一步 | 需要补齐的证据 |
| --- | --- | --- |
| PM | 判断是否授权后端 rankings 路由上线窗口 | 授权范围、窗口时间、目标 commit、回滚触发条件 |
| 后端/API | 提供 rankings 路由发布包信息 | commit/分支、改动文件、本地 200 证据、依赖/环境/数据库影响说明 |
| DBA/运维 | 获授权后先做只读归属确认 | `api.pomer.cn`、`jiuzhuopanguan-backend`、后端目录、当前 commit、Nginx 反代证据 |
| 接口联调 | 发布后复测线上 rankings 路由 | 请求 URL、状态码、响应体、失败原文 |
| 测试/前端 | 继续保留中文兜底并在后端上线后复测页面 | 页面截图、接口请求记录、兜底是否消失 |

## 8. PR-OPS-RANKINGS-READONLY-ATTRIBUTION-001 Rankings 只读归属确认

任务编号：`PR-OPS-RANKINGS-READONLY-ATTRIBUTION-001`

当前状态：待服务器只读证据；本轮不是部署授权。

背景：后端/API 已确认本地 `GET /api/v1/rankings/today` 存在且本地 3221 返回 200；接口联调确认线上 `https://api.pomer.cn/api/v1/rankings/today?...` 仍返回 404，而 `https://api.pomer.cn/api/v1/config/home` 返回 200。当前优先排查线上 `api.pomer.cn` 后端服务版本、PM2 进程、部署目录或 Nginx upstream 指向。

### 8.1 本轮执行结果

- 本轮只追加 DBA/运维计划记录。
- 当前本地 Codex 环境没有线上服务器 shell、PM2、Nginx 或部署目录权限，无法直接采集线上 `pm2 describe`、Nginx 配置、cwd、script、env、commit 或 restart 时间。
- 未执行线上服务器命令。
- 未部署、未重启、未改 Nginx、未改 PM2、未写库、未 DDL、未 cleanup。
- 未触碰 `pomer.cn` / `www.pomer.cn` 公司官网。

### 8.2 只读核查清单

| 核查项 | 目标/预期 | 当前状态 | 证据格式 |
| --- | --- | --- | --- |
| 域名归属 | 只允许 `api.pomer.cn`，不得触碰 `pomer.cn` / `www.pomer.cn` | 待服务器只读证据 | Nginx `server_name` 输出 |
| Nginx `/api/v1/` upstream | `/api/v1/` 应反代到酒桌判官/聚会记录师后端，预期 `127.0.0.1:3010` | 待服务器只读证据 | Nginx location/proxy_pass 输出 |
| PM2 服务名 | 只允许 `jiuzhuopanguan-backend`，不得操作 `pomer` | 待服务器只读证据 | `pm2 describe` / `pm2 status` 输出 |
| PM2 cwd | cwd 应指向酒桌判官/聚会记录师后端目录 | 待服务器只读证据 | `pm2 describe` cwd 字段 |
| PM2 script | script 应为本项目后端启动入口或 ecosystem 配置指定脚本 | 待服务器只读证据 | `pm2 describe` script path |
| PM2 env | `PORT=3010`，数据库指向 `jiuzhuopanguan`，不得误用官网项目配置 | 待服务器只读证据 | 脱敏 env 摘要 |
| 后端目录 | 目录应为 `jiuzhuopanguan` / `jiuzhuopanguan-git` 相关路径，不得是公司官网目录 | 待服务器只读证据 | `pwd`、目录名、`git remote -v` 摘要 |
| 当前 commit/版本 | 线上当前 commit 是否包含 rankings 路由 | 待服务器只读证据 | `git rev-parse HEAD`、分支、`git status --short` |
| 最近 restart 时间 | 判断线上进程是否未重启到新版本 | 待服务器只读证据 | `pm2 describe` uptime/restart time/restart count |
| 健康检查 URL | `config/home` 200；`rankings/today` 当前 404 待修复；后台登录页可达 | 待公网或服务器只读证据 | curl 状态码、响应摘要 |

### 8.3 可执行的只读命令包

以下命令仅在 PM 明确授权“只读归属确认”且确认目标为 `api.pomer.cn` / `jiuzhuopanguan-backend` 后执行；本轮未执行。

```bash
hostname
date -Is
cd /www/wwwroot/jiuzhuopanguan-git/backend
pwd
git remote -v
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
git status --short
node -p "require('./package.json').name + ' ' + (require('./package.json').version || '')"
pm2 status
pm2 describe jiuzhuopanguan-backend
pm2 jlist
grep -R "server_name api.pomer.cn" /etc/nginx/conf.d /etc/nginx/sites-enabled 2>/dev/null
grep -R "location /api/v1/" /etc/nginx/conf.d /etc/nginx/sites-enabled 2>/dev/null
grep -R "127.0.0.1:3010" /etc/nginx/conf.d /etc/nginx/sites-enabled 2>/dev/null
curl -i https://api.pomer.cn/api/v1/config/home
curl -i "https://api.pomer.cn/api/v1/rankings/today?period=daily"
curl -I https://api.pomer.cn/admin
```

如线上目录不是 `/www/wwwroot/jiuzhuopanguan-git/backend`，必须先由 PM 或服务器负责人给出正确目录；不得自行切换到 `pomer.cn` 官网目录猜测。

### 8.4 授权前禁止事项

- 不执行 `git pull`、`git checkout`、`npm install` 或任何部署动作。
- 不执行 `pm2 restart`、`pm2 stop`、`pm2 reload`、`pm2 delete`。
- 不修改 PM2 ecosystem、环境变量或服务名。
- 不执行 `nginx -t`、`nginx -s reload`、`systemctl reload nginx`，不改 Nginx 配置。
- 不写线上数据库、不执行 DDL、不执行 `db:sync-normalized`。
- 不备份、不 cleanup、不清理测试数据。
- 不触碰 `pomer.cn` / `www.pomer.cn` 公司官网、`pomer` PM2 服务或官网 Nginx 路由。

### 8.5 需要 PM/用户提供的只读证据

由于当前缺少服务器 shell/权限，DBA/运维需要 PM 或服务器负责人提供以下只读输出：

| 证据 | 用途 |
| --- | --- |
| Nginx `server_name api.pomer.cn` 与 `/api/v1/` `proxy_pass` 输出 | 判断 404 是否可能来自 upstream 指错 |
| `pm2 status` 与 `pm2 describe jiuzhuopanguan-backend` | 判断服务名、cwd、script、env、restart 时间 |
| 线上后端目录 `pwd`、`git rev-parse HEAD`、分支、`git status --short` | 判断线上是否部署了包含 rankings 路由的 commit |
| `backend/package.json` name/version/scripts 摘要 | 判断运行目录是否为本项目后端 |
| 脱敏 `.env` 关键项：`PORT`、`MYSQL_DATABASE`、`MYSQL_STORE_TABLE`、`STORE_FILE_MIRROR` | 判断是否误连或误配环境 |
| 公网 curl：`config/home`、`rankings/today`、`admin/login` | 判断基础服务可用且 rankings 路由仍未闭环 |

### 8.6 发布窗口前必须满足的条件

在进入任何发布授权前，必须补齐：

- PM 明确目标环境、执行窗口、执行人、允许动作范围。
- 后端/API 提供包含 `GET /api/v1/rankings/today` 的目标 commit/分支、改动文件清单、本地 3221 200 证据。
- DBA/运维完成只读归属确认：Nginx、PM2、后端目录、当前 commit、健康检查 URL。
- 明确本次发布是否不涉及 MySQL；如涉及数据库，必须回到 `DEPLOY-AUTH-001` 的备份/DDL/sync/回滚流程。
- 明确回滚 commit/tag、是否需要回退依赖、回滚后是否需要重启 `jiuzhuopanguan-backend`。
- 准备发布后 curl 验证包：

```bash
curl -f https://api.pomer.cn/api/v1/config/home
curl -f https://api.pomer.cn/api/v1/config/points
curl -f https://api.pomer.cn/api/v1/config/templates
curl -i "https://api.pomer.cn/api/v1/rankings/today?period=daily"
curl -I https://api.pomer.cn/admin
curl -I https://api.pomer.cn/admin/login
```

- 明确失败回滚触发条件：rankings 仍 404、公共配置接口异常、后台登录页异常、PM2 进程异常退出、日志出现启动错误或接口联调复测失败。

### 8.7 当前结论

当前只读归属确认未闭环，不足以进入发布授权。

下一步责任：

| 责任角色 | 下一步 | 需要补齐的证据 |
| --- | --- | --- |
| PM | 授权或代取服务器只读归属证据 | 授权范围、服务器只读输出、禁止触碰官网确认 |
| 服务器负责人/DBA 运维 | 提供 Nginx、PM2、目录、commit、restart 时间只读输出 | 8.5 表内证据 |
| 后端/API | 提供 rankings 路由目标 commit 和本地 3221 200 证据 | commit/分支、改动文件、依赖/环境/数据库影响 |
| 接口联调 | 保留线上 404 原始证据，发布后复测 | 请求 URL、状态码、响应体 |
| PM | 只在只读归属确认完成后再决定是否进入发布窗口 | 发布授权、回滚方案、健康检查包 |

## 9. PR-OPS-RANKINGS-DEPLOY-WINDOW-PREP-001 Rankings 发布窗口准备

任务编号：`PR-OPS-RANKINGS-DEPLOY-WINDOW-PREP-001`

当前状态：发布窗口待准备；未获部署授权，DBA/运维本轮不执行服务器动作。

背景：PM 已代采集线上只读归属证据。线上 `api.pomer.cn` 后端服务归属已能指向酒桌判官/聚会记录师后端，但服务器代码 HEAD `9dd5532` 未包含 rankings route，本机 3010 与公网 rankings 均为 404。当前需要等待后端/API 提供 `PR-BE-RANKINGS-DEPLOY-PACK-001` 发布包证据后，再由 PM 决定是否进入发布窗口。

### 9.1 已收到的只读归属证据

| 项目 | PM 提供证据 | 运维判断 |
| --- | --- | --- |
| SSH | SSH 可连服务器 | 权限阻塞已由 PM 代解，但本轮仍未授权 DBA/运维部署 |
| PM2 服务 | `jiuzhuopanguan-backend` online | 目标服务明确；不得操作 `pomer` PM2 服务 |
| PM2 script | `/www/wwwroot/jiuzhuopanguan-git/backend/server.js` | 指向酒桌判官/聚会记录师后端 |
| PM2 cwd | `/www/wwwroot/jiuzhuopanguan-git/backend` | 目标目录明确 |
| Node | 20.20.2 | 满足 Node 20 预期 |
| PM2 uptime | 22h | rankings route 未上线可能与进程代码版本有关 |
| Nginx active config | `/etc/nginx/conf.d/jiuzhuopanguan.conf` | 同文件含 API 与官网 block，后续必须只处理 API 归属，不碰官网 block |
| API server block | `server_name api.pomer.cn`，`location /` proxy 到 `127.0.0.1:3010` | 当前 Nginx 已能把 API 请求送到 3010；优先按后端版本未部署处理 |
| 官网 server block | 同文件还有 `pomer.cn` 官网 server block，代理到 `127.0.0.1:8787` | 禁止触碰、禁止 reload 前未确认配置风险 |
| 服务器目录 | `/www/wwwroot/jiuzhuopanguan-git` HEAD `9dd5532` | 服务器代码未包含 rankings route |
| 现状 smoke | 本机 3010 与公网 rankings 均 404 | 与后端路由未发布相符 |

### 9.2 发布窗口前置清单

| 前置项 | 当前状态 | 必须补齐 |
| --- | --- | --- |
| PM 发布授权 | 未授权 | 明确窗口时间、执行人、允许动作、回滚触发条件 |
| 后端发布包 | 待 `PR-BE-RANKINGS-DEPLOY-PACK-001` | 目标 commit/分支、文件清单、是否只改后端路由、是否新增依赖/环境变量/数据库影响 |
| 当前线上基线 | 已有 PM 只读证据 | 发布前仍需记录 HEAD `9dd5532`、PM2 cwd/script、Nginx API block 摘要 |
| Nginx 策略 | 默认不改 | 现有 `location /` 已 proxy 到 `127.0.0.1:3010`；除非后续证据证明需要，不改 Nginx |
| PM2 策略 | 仅限 `jiuzhuopanguan-backend` | 若发布授权包含重启，只重启该服务；不得操作 `pomer` |
| 数据库策略 | 默认不写库 | rankings route 发布若无 DDL/迁移，不执行备份/DDL/sync；如后端声明需要数据库变更，退回 `DEPLOY-AUTH-001` |
| 官网保护 | 必须确认 | 不触碰 `pomer.cn` server block，不操作 `pomer` 服务，不改 8787 upstream |
| 验证包 | 待确认 | 发布后 curl 公共 config、rankings、后台登录页；接口联调复测业务参数 |
| 回滚包 | 待确认 | 回滚 commit/tag、依赖回退方式、重启条件、回滚后 smoke |

### 9.3 最小部署策略候选

候选策略：等待后端 `PR-BE-RANKINGS-DEPLOY-PACK-001` 给出文件清单和目标 commit 后，仅针对 `jiuzhuopanguan-backend` 后端发布 rankings route。

执行原则：

- 不改 Nginx，除非后续证据证明 `api.pomer.cn` upstream 或 location 配置错误。
- 不触碰同一 Nginx 文件中的 `pomer.cn` 官网 server block。
- 不操作 `pomer` PM2 服务。
- 不写 MySQL、不执行 DDL、不执行 `db:sync-normalized`、不 cleanup。
- 如果后端发布包仅包含后端路由代码，优先采用代码更新 + `jiuzhuopanguan-backend` 单服务重启 + curl smoke 的最小路径。
- 如果后端发布包涉及依赖、环境变量或数据库，必须由 PM 追加对应授权和回滚方案。

### 9.4 待授权备份命令

以下仅作为发布窗口待授权步骤，本轮未执行。

```bash
date -Is
cd /www/wwwroot/jiuzhuopanguan-git
git rev-parse HEAD
git status --short
tar -czf /www/backup/jiuzhuopanguan-backend-before-rankings-$(date +%Y%m%d%H%M%S).tgz backend/server.js backend/package.json backend/package-lock.json backend/routes backend/data backend/scripts 2>/tmp/jiuzhuopanguan-backup-warn.log
sha256sum /www/backup/jiuzhuopanguan-backend-before-rankings-*.tgz
```

如后端确认本次涉及数据库，必须另走数据库备份授权；当前 rankings route 发布准备默认不写库。

### 9.5 待授权发布/重启命令框架

以下仅作为执行框架，必须等 PM 明确发布授权、后端发布包和回滚点后才能执行。

```bash
cd /www/wwwroot/jiuzhuopanguan-git
git fetch origin
git rev-parse HEAD
git checkout <target-commit-or-branch>
cd backend
npm install
pm2 restart jiuzhuopanguan-backend --update-env
pm2 describe jiuzhuopanguan-backend
```

如果后端发布包声明无依赖变化，可由 PM 决定是否跳过 `npm install`；不得自行省略或新增步骤。

### 9.6 待授权回滚命令

以下仅作为回滚包，必须由 PM 触发回滚授权后才能执行。

```bash
cd /www/wwwroot/jiuzhuopanguan-git
git checkout 9dd5532
cd backend
npm install
pm2 restart jiuzhuopanguan-backend --update-env
pm2 describe jiuzhuopanguan-backend
curl -f https://api.pomer.cn/api/v1/config/home
curl -i "https://api.pomer.cn/api/v1/rankings/today?period=daily"
curl -I https://api.pomer.cn/admin/login
```

回滚到 `9dd5532` 预计会恢复 rankings 404 现状，因此回滚验证重点是公共 config、后台登录页和服务进程恢复正常；rankings 恢复 404 只能说明回滚到旧版本成功，不代表功能可用。

### 9.7 发布后 smoke 验证包

以下仅作为发布后验证命令，本轮未执行。

```bash
curl -f https://api.pomer.cn/api/v1/config/home
curl -f https://api.pomer.cn/api/v1/config/points
curl -f https://api.pomer.cn/api/v1/config/templates
curl -i "https://api.pomer.cn/api/v1/rankings/today?period=daily"
curl -i "https://api.pomer.cn/api/v1/rankings/today?sessionId=<known-session-id>&period=daily"
curl -I https://api.pomer.cn/admin
curl -I https://api.pomer.cn/admin/login
pm2 logs jiuzhuopanguan-backend --lines 80
```

接口联调需补充带真实参数的 rankings 请求 URL、预期状态码和响应字段；DBA/运维只负责发布层 smoke，不替接口联调判定业务验收完成。

### 9.8 失败回滚触发条件

任一条件出现时应暂停发布并由 PM 判断是否回滚：

- `config/home`、`config/points`、`config/templates` 任一公共接口异常。
- `admin` 或 `admin/login` 不可达。
- `rankings/today` 发布后仍为 404，且后端确认目标 commit 应包含该路由。
- PM2 `jiuzhuopanguan-backend` 进程异常重启、退出或日志出现启动错误。
- 日志出现未配置环境变量、模块缺失、语法错误或端口占用。
- 接口联调复测 rankings 业务响应不符合后端发布包预期。
- 发现操作会影响 `pomer.cn` 官网 block、`pomer` PM2 服务或 8787 upstream。

### 9.9 当前结论与下一步

当前不写“已部署”或“已线上修复”。发布窗口尚未打开。

待授权动作：

- 记录发布前线上基线。
- 代码备份或目录快照。
- 拉取/切换后端目标 commit。
- 视后端发布包决定是否 `npm install`。
- 仅重启 `jiuzhuopanguan-backend`。
- 执行发布后 smoke。
- 如触发条件成立，由 PM 授权回滚。

必须等待后端补齐：

- `PR-BE-RANKINGS-DEPLOY-PACK-001` 发布包。
- 目标 commit/分支。
- 文件清单。
- 本地 3221 rankings 200 证据。
- 是否新增依赖、环境变量、数据库影响。
- 发布后预期响应格式和接口联调参数样本。

PM 下一步应派给：

| 责任角色 | 下一步 | 需要补齐的证据 |
| --- | --- | --- |
| 后端/API | 交付 `PR-BE-RANKINGS-DEPLOY-PACK-001` | 目标 commit、文件清单、本地 200、依赖/环境/数据库影响 |
| PM | 决定是否授权发布窗口 | 窗口时间、执行人、允许动作、回滚触发条件、是否允许 `npm install` |
| DBA/运维 | 获授权后按最小策略执行发布准备和发布层 smoke | 备份路径、发布前后 commit、PM2 证据、curl 输出 |
| 接口联调 | 准备发布后 rankings 业务复测 | 真实请求 URL、参数、预期响应、失败判定 |
| 测试/前端 | 发布后复测页面兜底是否消失 | 页面截图、请求记录、异常说明 |

### 9.10 发布授权等待项

当前状态：等待 PM/用户选择发布策略；未获授权前不执行任何服务器动作。

PM 最新只读证据：

- `api.pomer.cn` 已反代到 `127.0.0.1:3010`。
- PM2 `jiuzhuopanguan-backend` online。
- `pomer.cn` 官网服务也在线，但本任务禁止触碰。
- 线上 `rankings/today` 仍为 404。

待 PM/用户选择：

| 选项 | 含义 | DBA/运维等待的证据 |
| --- | --- | --- |
| A 当前包发布 | 发布后端/API 当前准备进入线上窗口的完整包 | 目标 commit/分支、文件清单、是否包含 rankings route、是否有额外改动、回滚点 |
| B 纯 rankings hotfix | 只发布修复 `GET /api/v1/rankings/today` 的最小后端 hotfix | hotfix commit/patch、涉及文件、本地 3221 200 证据、确认无依赖/环境/数据库变化 |

发布前禁止事项：

- 不备份、不复制文件、不执行 `git pull`、不切换 commit。
- 不重启 `jiuzhuopanguan-backend`，不操作 `pomer` PM2 服务。
- 不修改 Nginx，不 reload Nginx，不触碰 `pomer.cn` server block 或 8787 upstream。
- 不修改 PM2 配置、环境变量或服务名。
- 不写库、不执行 DDL、不执行 `db:sync-normalized`。
- 不 cleanup、不清理测试数据。
- 不写“已部署”或“已线上修复”。

DBA/运维当前结论：发布授权未打开；只能等待 PM/用户选择 A 或 B，并等待后端/API 补齐对应发布包证据。

### 9.11 PR-PM-ONLINE-TEST-SERVER-AUTH-001 测试服务器授权更新

通知编号：`PR-PM-ONLINE-TEST-SERVER-AUTH-001`

当前状态：已收到 PM 全员授权通知；`api.pomer.cn` 对应服务可作为酒桌判官/聚会记录师测试服务器使用。

授权范围：

- DBA/运维可在职责范围内对 `api.pomer.cn` 对应服务执行测试部署、重启、备份、回滚、数据清理或服务调整。
- 不再逐项等待“是否允许备份 / 是否允许重启 / 是否允许测试部署 / 是否允许清理”的单独授权。
- 每次执行仍必须有明确任务目标、目标服务、目标目录、目标命令和回滚方式；不得把授权理解为可无任务随意变更。

仍然禁止：

- 不得触碰 `pomer.cn` / `www.pomer.cn` 公司官网项目。
- 不得操作 `pomer` 官网 PM2 服务。
- 不得修改、reload 或覆盖官网 Nginx server block。
- 不得进入、改动、备份、删除或部署官网目录。
- 不得影响无关项目、无关端口或无关 upstream。

每次动作必须记录：

| 记录项 | 必填内容 |
| --- | --- |
| 目标服务 | 例如 `jiuzhuopanguan-backend`，不得写 `pomer` |
| 目标域名 | 仅 `api.pomer.cn` |
| 目标目录 | 例如 `/www/wwwroot/jiuzhuopanguan-git` 或 PM 指定酒桌判官/聚会记录师目录 |
| 执行命令 | 完整命令、执行时间、执行人 |
| 备份路径 | 代码/目录/数据库/配置备份路径、文件大小、校验和；如本次无需备份需说明原因 |
| 回滚方式 | 回滚 commit/tag、恢复命令、是否需要重启、回滚后 smoke |
| 健康检查 | `config/home`、`config/points`、`config/templates`、目标接口、`admin/login`、PM2 状态/日志 |
| 残留/清理状态 | 测试数据、临时文件、备份文件、cleanup 执行或保留说明 |

对 rankings 发布的影响：

- `PR-OPS-RANKINGS-DEPLOY-WINDOW-PREP-001` 不再因“逐项授权”阻塞。
- 仍需等待 PM/用户明确选择 `A 当前包发布` 或 `B 纯 rankings hotfix`。
- 仍需等待后端/API 提供 `PR-BE-RANKINGS-DEPLOY-PACK-001`：目标 commit/patch、文件清单、本地 3221 200 证据、依赖/环境/数据库影响说明。
- 获得具体发布包后，DBA/运维可按测试服务器授权执行 `api.pomer.cn` / `jiuzhuopanguan-backend` 范围内的发布、重启、备份、回滚和清理，并按本节记录证据。

## 10. PR-OPS-ONLINE-TEST-GUARD-003 线上测试服务器保护清单

任务编号：`PR-OPS-ONLINE-TEST-GUARD-003`

当前状态：保护清单已建立；本节是线上实操准入模板，不代表已执行服务器动作。

背景：用户已授权线上服务器除官网项目外作为酒桌判官/聚会记录师测试服务器。该授权用于支撑接口联调造数、后台 action、测试最终采集和必要的测试部署/清理，但必须把目标、备份、回滚、健康检查和残留状态记录完整。

### 10.1 允许目标

| 维度 | 允许范围 | 禁止范围 |
| --- | --- | --- |
| 域名 | `api.pomer.cn` | `pomer.cn`、`www.pomer.cn` |
| PM2 服务 | `jiuzhuopanguan-backend` | `pomer` 官网 PM2 服务、其他无关服务 |
| 后端目录 | `/www/wwwroot/jiuzhuopanguan-git`、`/www/wwwroot/jiuzhuopanguan-git/backend` 或 PM 指定酒桌判官/聚会记录师目录 | 官网目录、无关项目目录 |
| Nginx | 只读或必要时只处理 `api.pomer.cn` 对应 server/location | 官网 server block、8787 upstream、无关 server block |
| 数据 | 酒桌判官/聚会记录师后台与测试数据，按任务 manifest、测试前缀或 PM 指定范围处理 | 官网数据、无关项目数据、未授权范围外数据 |

### 10.2 执行前保护清单

每次线上实操前必须填写：

| 勾选 | 检查项 | 记录内容 |
| --- | --- | --- |
| [ ] | 任务编号 | 例如 `PR-INT-*`、`PR-QA-*`、`PR-OPS-*` |
| [ ] | 目标服务 | 必须是 `jiuzhuopanguan-backend` |
| [ ] | 目标域名 | 必须是 `api.pomer.cn` |
| [ ] | 目标目录 | `pwd` 输出，必须属于酒桌判官/聚会记录师目录 |
| [ ] | 当前代码基线 | `git rev-parse HEAD`、分支、`git status --short` |
| [ ] | PM2 基线 | `pm2 describe jiuzhuopanguan-backend`、uptime、restart count |
| [ ] | Nginx 基线 | `api.pomer.cn` server/location 摘要；确认不改官网 block |
| [ ] | 数据影响 | 是否写库、后台 action、造数、cleanup；影响范围和样本 ID |
| [ ] | 备份要求 | 代码/目录/数据库/配置/上传文件是否需要备份及路径 |
| [ ] | 回滚方式 | 回滚 commit/tag、恢复备份、是否重启、回滚 smoke |
| [ ] | 健康检查 | 发布/操作前后 URL 和 PM2 日志检查 |
| [ ] | 清理计划 | 测试数据、临时文件、备份保留或 cleanup 策略 |

### 10.3 备份命令模板

以下为模板；执行时必须替换时间戳、任务编号和路径，并记录输出。

代码/目录备份：

```bash
date -Is
cd /www/wwwroot/jiuzhuopanguan-git
git rev-parse HEAD
git status --short
mkdir -p /www/backup/jiuzhuopanguan
tar -czf /www/backup/jiuzhuopanguan/<task-id>-code-$(date +%Y%m%d%H%M%S).tgz backend deploy DEPLOY.md docs/gameplay-moments-dba-ops-plan.md
sha256sum /www/backup/jiuzhuopanguan/<task-id>-code-*.tgz
```

数据库备份：

```bash
date -Is
cd /www/wwwroot/jiuzhuopanguan-git/backend
set -a
. ./.env
set +a
mkdir -p /www/backup/jiuzhuopanguan
mysqldump --single-transaction --routines --triggers --no-tablespaces -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" > /www/backup/jiuzhuopanguan/<task-id>-mysql-$(date +%Y%m%d%H%M%S).sql
sha256sum /www/backup/jiuzhuopanguan/<task-id>-mysql-*.sql
```

上传/静态资源备份：

```bash
date -Is
cd /www/wwwroot/jiuzhuopanguan-git/backend
mkdir -p /www/backup/jiuzhuopanguan
tar -czf /www/backup/jiuzhuopanguan/<task-id>-uploads-$(date +%Y%m%d%H%M%S).tgz public/uploads public/admin/static 2>/tmp/<task-id>-uploads-backup.warn
sha256sum /www/backup/jiuzhuopanguan/<task-id>-uploads-*.tgz
```

如某次 action 明确不涉及代码、数据库或上传资源，可记录“本次无需备份”的理由，但不得省略目标、健康检查和回滚说明。

### 10.4 PM2/Nginx 保护点

PM2：

- 只允许查看、重启或调整 `jiuzhuopanguan-backend`。
- 执行前后记录 `pm2 status`、`pm2 describe jiuzhuopanguan-backend`、`pm2 logs jiuzhuopanguan-backend --lines 80`。
- 禁止 `pm2 restart pomer`、`pm2 stop pomer`、`pm2 delete pomer` 或对无关进程做批量操作。

Nginx：

- 默认不改 Nginx；接口造数、后台 action、普通后端发布通常不需要改 Nginx。
- 如确需调整，只能处理 `api.pomer.cn` 对应 block/location。
- 修改前必须备份当前配置文件，修改后必须 `nginx -t` 通过才允许 reload。
- 禁止修改同文件中的 `pomer.cn` / `www.pomer.cn` 官网 server block、8787 upstream 或无关 server。

### 10.5 健康检查模板

操作前后至少执行并记录：

```bash
date -Is
curl -f https://api.pomer.cn/api/v1/config/home
curl -f https://api.pomer.cn/api/v1/config/points
curl -f https://api.pomer.cn/api/v1/config/templates
curl -I https://api.pomer.cn/admin
curl -I https://api.pomer.cn/admin/login
pm2 describe jiuzhuopanguan-backend
pm2 logs jiuzhuopanguan-backend --lines 80
```

按任务补充目标接口：

```bash
curl -i "https://api.pomer.cn/api/v1/rankings/today?period=daily"
curl -i "<task-specific-url>"
```

接口联调、后台、测试应提供业务级请求参数和预期响应；DBA/运维只记录发布层和服务层健康检查，不替其他角色标记业务验收完成。

### 10.6 回滚模板

代码回滚：

```bash
date -Is
cd /www/wwwroot/jiuzhuopanguan-git
git rev-parse HEAD
git checkout <rollback-commit-or-tag>
cd backend
npm install
pm2 restart jiuzhuopanguan-backend --update-env
curl -f https://api.pomer.cn/api/v1/config/home
curl -I https://api.pomer.cn/admin/login
pm2 describe jiuzhuopanguan-backend
```

数据库回滚：

```bash
date -Is
cd /www/wwwroot/jiuzhuopanguan-git/backend
set -a
. ./.env
set +a
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" < /www/backup/jiuzhuopanguan/<task-id>-mysql-<timestamp>.sql
npm run mysql:test
curl -f https://api.pomer.cn/api/v1/config/home
```

资源回滚：

```bash
date -Is
cd /www/wwwroot/jiuzhuopanguan-git/backend
tar -tzf /www/backup/jiuzhuopanguan/<task-id>-uploads-<timestamp>.tgz | head
tar -xzf /www/backup/jiuzhuopanguan/<task-id>-uploads-<timestamp>.tgz -C /www/wwwroot/jiuzhuopanguan-git/backend
curl -I https://api.pomer.cn/admin/login
```

回滚后必须记录是否残留测试数据、临时文件、备份文件和异常日志。

### 10.7 清理记录模板

| 字段 | 记录内容 |
| --- | --- |
| cleanup 任务编号 | 对应接口联调/测试/后台 action 编号 |
| 清理依据 | manifest、测试前缀、样本 ID、时间窗口 |
| 清理范围 | session/profile/moment/task/report/nomination/payout/upload/admin action 等 |
| 清理前导出 | SQL/JSON/截图/日志路径 |
| 执行命令 | 完整命令、执行时间、执行人 |
| 清理结果 | 删除/保留数量、失败项、跳过项 |
| 残留扫描 | 查询命令、结果、仍需保留的原因 |
| 回滚可能性 | 是否可从备份恢复、恢复路径 |

### 10.8 单次动作审计模板

```text
任务编号：
执行时间：
执行人：
目标域名：api.pomer.cn
目标服务：jiuzhuopanguan-backend
目标目录：
禁止项确认：未触碰 pomer.cn / pomer PM2 / 官网 Nginx block / 官网目录 / 无关项目
执行前基线：commit、PM2、Nginx 摘要、健康检查
备份路径：代码 / 数据库 / 资源 / 配置
执行命令：
执行结果：
健康检查：
回滚方式：
清理/残留状态：
需要其他角色复核：
```

### 10.9 当前结论

`PR-OPS-ONLINE-TEST-GUARD-003` 已建立线上测试服务器保护清单。后续接口联调造数、后台 action、测试最终采集或测试部署，可以在 `api.pomer.cn` / `jiuzhuopanguan-backend` / 对应后台与数据范围内执行，但每次动作必须按本节记录目标、命令、备份路径、回滚方式、健康检查和残留/清理状态。

仍然硬性禁止触碰 `pomer.cn` 官网项目、`pomer` 官网 PM2、官网 Nginx block、官网目录和无关项目。

## 11. PR-OPS-DB-TEST-IDENTITIES-005 四角色测试身份生成准备

任务编号：`PR-OPS-DB-TEST-IDENTITIES-005`

当前状态：已建立 DBA/运维侧备份、生成、回滚和残留扫描模板；不再把“等待用户提供 4 个真实账号/token”作为阻塞。

背景：用户确认当前没有 4 个真实账号供测试，要求“用现有登陆和数据库直接生成”。本任务只面向 `api.pomer.cn` 对应的酒桌判官/聚会记录师测试服务，用于生成 `host`、`memberA`、`memberB`、`outsider` 四个测试身份，支撑接口联调造数、后台 action 和测试最终采集。

### 11.1 存储位置判断

基于本地代码核查：

- 运行时用户身份主存储来自 `backend/data/social.js`。
- store key：`social_store`。
- JSON 结构：`profiles`、`friendships`、`loginLogs`、`pokes`、`userSessions`。
- 文件镜像：`backend/data/social-store.json`。
- MySQL 启用时，通过 `backend/data/store-accessor.js` 写入 `MYSQL_STORE_TABLE`，默认 `app_store`，记录为 `store_key='social_store'`。
- 规范化表定义存在于 `backend/sql/mysql-normalized-schema.sql`：`users`、`user_sessions`、`user_login_logs` 等；当前运行时登录态仍优先按 `social_store` 读写，规范化表需以后端/API 同步策略为准。
- 小程序用户 token 请求头：`x-jzp-user-token`。文档和公开记录不得泄露完整 token，只能记录 token 后 8 位或 SHA-256 hash。

线上实操前必须先在服务器确认：

```bash
cd /www/wwwroot/jiuzhuopanguan-git/backend
pwd
grep -E '^(MYSQL_HOST|MYSQL_PORT|MYSQL_USER|MYSQL_DATABASE|MYSQL_STORE_TABLE|STORE_FILE_MIRROR)=' .env
node -e "const { isMySQLEnabled } = require('./data/store-accessor'); const { readSocialStore } = require('./data/social'); const s = readSocialStore(); console.log(JSON.stringify({ mysqlEnabled: isMySQLEnabled(), storeKey: 'social_store', file: 'backend/data/social-store.json', profiles: (s.profiles || []).length, userSessions: (s.userSessions || []).length, loginLogs: (s.loginLogs || []).length }, null, 2))"
```

### 11.2 执行前备份模板

执行前必须备份 `social_store`。如 MySQL 开启，同时备份 `app_store` 中的 `social_store` 行和文件镜像。

```bash
date -Is
cd /www/wwwroot/jiuzhuopanguan-git/backend
set -a
. ./.env
set +a
mkdir -p /www/backup/jiuzhuopanguan/pr-ops-db-test-identities-005
cp -a data/social-store.json /www/backup/jiuzhuopanguan/pr-ops-db-test-identities-005/social-store-before-$(date +%Y%m%d%H%M%S).json
mysqldump --single-transaction --no-tablespaces -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" "$MYSQL_STORE_TABLE" --where="store_key='social_store'" > /www/backup/jiuzhuopanguan/pr-ops-db-test-identities-005/app-store-social-store-before-$(date +%Y%m%d%H%M%S).sql
sha256sum /www/backup/jiuzhuopanguan/pr-ops-db-test-identities-005/*
```

如线上 `MYSQL_STORE_TABLE` 为空，按默认 `app_store` 处理并记录实际值。

### 11.3 四角色生成命令模板

以下模板直接写入 `social_store`，创建或刷新四个测试 profile 与 user session。完整 token 只写入服务器受限文件，不输出到文档；对外只记录 profileId、name、role、tokenSuffix、tokenSha256。

```bash
date -Is
cd /www/wwwroot/jiuzhuopanguan-git/backend
mkdir -p /www/backup/jiuzhuopanguan/pr-ops-db-test-identities-005
node <<'NODE'
const fs = require('fs')
const crypto = require('crypto')
const { readSocialStore, writeSocialStore } = require('./data/social')

const now = Date.now()
const isoNow = new Date(now).toISOString()
const ttl = 1000 * 60 * 60 * 24 * 30
const marker = 'PR-OPS-DB-TEST-IDENTITIES-005'
const roles = [
  ['host', '测试主持人'],
  ['memberA', '测试成员A'],
  ['memberB', '测试成员B'],
  ['outsider', '测试旁观者'],
]

const store = readSocialStore()
store.profiles = Array.isArray(store.profiles) ? store.profiles : []
store.userSessions = Array.isArray(store.userSessions) ? store.userSessions : []
store.loginLogs = Array.isArray(store.loginLogs) ? store.loginLogs : []

const output = []
for (const [role, name] of roles) {
  const profileId = `test-${role.toLowerCase()}-pr-ops-005`
  const token = crypto.randomBytes(24).toString('hex')
  const existed = store.profiles.find((item) => item.id === profileId) || {}
  const profile = {
    ...existed,
    id: profileId,
    name,
    avatarUrl: '',
    signature: marker,
    identityTag: role,
    phone: '',
    wechatOpenId: `test-openid-${role.toLowerCase()}-pr-ops-005`,
    wechatUnionId: '',
    phoneBoundAt: '',
    lastLoginAt: isoNow,
    loginCount: Math.max(0, Number(existed.loginCount) || 0) + 1,
    createdAt: Number(existed.createdAt || now),
    updatedAt: now,
  }
  store.profiles = [profile, ...store.profiles.filter((item) => item.id !== profileId)]
  store.userSessions = [
    { token, profileId, createdAt: now, expiresAt: now + ttl },
    ...store.userSessions.filter((item) => item.profileId !== profileId),
  ]
  store.loginLogs.unshift({
    id: `login-log-${profileId}-${now}`,
    profileId,
    phone: '',
    wechatOpenId: profile.wechatOpenId,
    loginAt: isoNow,
    source: marker,
  })
  output.push({
    role,
    profileId,
    name,
    tokenSuffix: token.slice(-8),
    tokenSha256: crypto.createHash('sha256').update(token).digest('hex'),
  })
}

writeSocialStore(store)
const privatePath = `/www/backup/jiuzhuopanguan/pr-ops-db-test-identities-005/test-identities-private-${now}.json`
fs.writeFileSync(privatePath, JSON.stringify({ generatedAt: isoNow, marker, identities: output }, null, 2), 'utf8')
fs.chmodSync(privatePath, 0o600)
console.log(JSON.stringify({ generatedAt: isoNow, marker, identities: output, privatePath }, null, 2))
NODE
```

说明：

- 上述命令生成的 session token 写入 `social_store.userSessions`，接口请求使用 `x-jzp-user-token`。
- 命令输出不包含完整 token。若接口联调必须使用完整 token，应由服务器受限文件或 PM 指定安全渠道提供，不写入计划文档、截图或公开台账。
- 若后端/API 提供专用造数脚本，应优先使用后端脚本，但仍按本节备份、输出摘要和残留扫描。

### 11.4 生成后健康检查与 ID 摘要

```bash
date -Is
cd /www/wwwroot/jiuzhuopanguan-git/backend
node -e "const crypto=require('crypto'); const { readSocialStore }=require('./data/social'); const s=readSocialStore(); const ids=['test-host-pr-ops-005','test-membera-pr-ops-005','test-memberb-pr-ops-005','test-outsider-pr-ops-005']; console.log(JSON.stringify(ids.map(id=>{ const p=(s.profiles||[]).find(x=>x.id===id)||{}; const sess=(s.userSessions||[]).find(x=>x.profileId===id)||{}; return { profileId:id, name:p.name, identityTag:p.identityTag, tokenSuffix:String(sess.token||'').slice(-8), tokenSha256:sess.token?crypto.createHash('sha256').update(sess.token).digest('hex'):'' } }), null, 2))"
curl -f https://api.pomer.cn/api/v1/config/home
curl -I https://api.pomer.cn/admin/login
pm2 describe jiuzhuopanguan-backend
```

接口联调请求模板：

```bash
curl -i https://api.pomer.cn/api/v1/user/auth/session -H "x-jzp-user-token: <full-token-from-secure-file>"
curl -i https://api.pomer.cn/api/v1/user/profile -H "x-jzp-user-token: <full-token-from-secure-file>"
```

记录到文档或 PM 汇报时，只允许写：

- `profileId`
- `role`
- `name`
- `tokenSuffix`
- `tokenSha256`
- `expiresAt`

不得写完整 token。

### 11.5 后端/API 与接口联调用法

生成四个身份后，职责分配如下：

| 角色 | 用法 | DBA/运维边界 |
| --- | --- | --- |
| 后端/API | 用 `host` token 创建测试聚会；用 `memberA`、`memberB` token 加入；用 `outsider` token 验证非成员权限 | DBA/运维只保证身份和 token 存在，不替后端判断业务逻辑通过 |
| 接口联调 | 基于四个 token 生成 manifest，记录 sessionId、inviteCode、momentId 等实际 ID | DBA/运维提供清理模板和残留扫描，不替接口联调标完成 |
| 测试/验收 | 使用 manifest 和截图/录屏做最终采集 | DBA/运维只记录数据残留、清理状态和健康检查 |

### 11.6 回滚模板

从 MySQL 备份回滚 `social_store`：

```bash
date -Is
cd /www/wwwroot/jiuzhuopanguan-git/backend
set -a
. ./.env
set +a
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" < /www/backup/jiuzhuopanguan/pr-ops-db-test-identities-005/app-store-social-store-before-<timestamp>.sql
pm2 restart jiuzhuopanguan-backend --update-env
curl -f https://api.pomer.cn/api/v1/config/home
```

从文件镜像回滚：

```bash
date -Is
cd /www/wwwroot/jiuzhuopanguan-git/backend
cp -a /www/backup/jiuzhuopanguan/pr-ops-db-test-identities-005/social-store-before-<timestamp>.json data/social-store.json
pm2 restart jiuzhuopanguan-backend --update-env
curl -f https://api.pomer.cn/api/v1/config/home
```

注意：如果线上 MySQL 已启用且 `STORE_FILE_MIRROR=1`，仅恢复文件可能被 MySQL 中的 `social_store` 覆盖；优先按 MySQL `app_store.store_key='social_store'` 回滚。

### 11.7 残留扫描与 cleanup 模板

扫描四个测试身份残留：

```bash
date -Is
cd /www/wwwroot/jiuzhuopanguan-git/backend
node -e "const { readSocialStore }=require('./data/social'); const s=readSocialStore(); const ids=['test-host-pr-ops-005','test-membera-pr-ops-005','test-memberb-pr-ops-005','test-outsider-pr-ops-005']; console.log(JSON.stringify({ profiles:(s.profiles||[]).filter(x=>ids.includes(x.id)).map(x=>({id:x.id,name:x.name,identityTag:x.identityTag})), sessions:(s.userSessions||[]).filter(x=>ids.includes(x.profileId)).map(x=>({profileId:x.profileId, tokenSuffix:String(x.token||'').slice(-8), expiresAt:x.expiresAt})), loginLogs:(s.loginLogs||[]).filter(x=>ids.includes(x.profileId)).length, friendships:(s.friendships||[]).filter(x=>ids.includes(x.ownerId)||ids.includes(x.friendId)).length, pokes:(s.pokes||[]).filter(x=>ids.includes(x.senderId)||ids.includes(x.receiverId)).length }, null, 2))"
```

清理四个测试身份：

```bash
date -Is
cd /www/wwwroot/jiuzhuopanguan-git/backend
node <<'NODE'
const { readSocialStore, writeSocialStore } = require('./data/social')
const ids = new Set(['test-host-pr-ops-005','test-membera-pr-ops-005','test-memberb-pr-ops-005','test-outsider-pr-ops-005'])
const store = readSocialStore()
const before = {
  profiles: (store.profiles || []).length,
  userSessions: (store.userSessions || []).length,
  loginLogs: (store.loginLogs || []).length,
  friendships: (store.friendships || []).length,
  pokes: (store.pokes || []).length,
}
store.profiles = (store.profiles || []).filter((item) => !ids.has(item.id))
store.userSessions = (store.userSessions || []).filter((item) => !ids.has(item.profileId))
store.loginLogs = (store.loginLogs || []).filter((item) => !ids.has(item.profileId))
store.friendships = (store.friendships || []).filter((item) => !ids.has(item.ownerId) && !ids.has(item.friendId))
store.pokes = (store.pokes || []).filter((item) => !ids.has(item.senderId) && !ids.has(item.receiverId))
writeSocialStore(store)
const after = {
  profiles: store.profiles.length,
  userSessions: store.userSessions.length,
  loginLogs: store.loginLogs.length,
  friendships: store.friendships.length,
  pokes: store.pokes.length,
}
console.log(JSON.stringify({ before, after, removed: Object.fromEntries(Object.keys(before).map((key) => [key, before[key] - after[key]])) }, null, 2))
NODE
```

cleanup 后必须再执行残留扫描和健康检查。

### 11.8 当前结论

`PR-OPS-DB-TEST-IDENTITIES-005` 不再阻塞于用户提供 4 个真实账号/token。DBA/运维已给出基于现有登录和数据库的四角色身份生成模板。

当前未真实写入线上数据。若 PM/后端/API 后续要求 DBA/运维执行生成，按 `PR-PM-ONLINE-TEST-SERVER-AUTH-001` 和 `PR-OPS-ONLINE-TEST-GUARD-003` 的测试服务器授权边界执行，并记录：

- 目标服务：`jiuzhuopanguan-backend`
- 目标域名：`api.pomer.cn`
- 备份路径
- 执行命令
- 生成的 `profileId` / `role` / `tokenSuffix` / `tokenSha256`
- cleanup 或回滚方式
- 残留扫描结果

仍然禁止触碰 `pomer.cn` 官网项目、`pomer` 官网 PM2、官网 Nginx block、官网目录或无关项目。

## 12. PR-OPS-ADMIN-STATIC-ACTION-DEPLOY-008 后台静态 page action 发布记录

任务编号：`PR-OPS-ADMIN-STATIC-ACTION-DEPLOY-008`

当前状态：已完成 `api.pomer.cn` 对应酒桌判官/聚会记录师后台 `heatwave-ops` 静态资源同步；未重启 PM2，未改 Nginx，未触碰官网项目。

背景：后台 `PR-ADMIN-REWARD-ACTION-ENTRY-007` 已确认，`commerce-ranking-rewards` 页面按钮不出现不是后端 action 合同或权限问题，而是线上 `heatwave-ops` 静态资源版本旧。线上旧 HTML 引用 `app.js?v=20260611-admin-pagination-2`，线上 JS 缺 `renderPageActions`、`runPageAction`、`data-action="page-action"`；本地 `backend/public/admin/static/heatwave-ops/app.js` 已包含 page action 渲染逻辑。

### 12.1 目标归属确认

| 项目 | 证据 |
| --- | --- |
| 目标域名 | `api.pomer.cn` |
| 目标服务 | `jiuzhuopanguan-backend` |
| 目标目录 | `/www/wwwroot/jiuzhuopanguan-git/backend/public/admin/static/heatwave-ops` |
| PM2 归属 | `jiuzhuopanguan-backend` online，script path `/www/wwwroot/jiuzhuopanguan-git/backend/server.js`，cwd `/www/wwwroot/jiuzhuopanguan-git/backend`，Node 20.20.2 |
| Nginx API block | `/etc/nginx/conf.d/jiuzhuopanguan.conf` 中 `server_name api.pomer.cn`，proxy 到 `127.0.0.1:3010` |
| 官网保护 | 同文件存在 `pomer.cn` 官网 server block，proxy 到 `127.0.0.1:8787`；本任务未修改、未 reload、未触碰该 block |

### 12.2 执行前验证

本地静态资源语法检查：

```bash
node --check backend/public/admin/static/heatwave-ops/app.js
```

结果：通过。

本地关键标记：

```text
renderPageActions
runPageAction
data-action="page-action"
```

线上旧资源证据：旧 HTML 中存在 `app.js?v=20260611-admin-pagination-2`；旧 `app.js` 缺 page action 关键渲染逻辑。

### 12.3 备份记录

备份命令：

```bash
ssh -o BatchMode=yes pomer.cn 'bash -lc "set -e; ts=$(date +%Y%m%d%H%M%S); backup_dir=/www/backup/jiuzhuopanguan/PR-OPS-ADMIN-STATIC-ACTION-DEPLOY-008; mkdir -p $backup_dir; cd /www/wwwroot/jiuzhuopanguan-git/backend/public/admin/static; tar -czf $backup_dir/heatwave-ops-before-$ts.tgz heatwave-ops; sha256sum $backup_dir/heatwave-ops-before-$ts.tgz; echo BACKUP_PATH=$backup_dir/heatwave-ops-before-$ts.tgz; ls -lh $backup_dir/heatwave-ops-before-$ts.tgz"'
```

备份路径：

```text
/www/backup/jiuzhuopanguan/PR-OPS-ADMIN-STATIC-ACTION-DEPLOY-008/heatwave-ops-before-20260616125302.tgz
```

校验和：

```text
d52f13c5c23268e0423ca13c364591add6ee2c8b7677ff6b1f090e2cf343683c
```

备份大小：`30K`。

### 12.4 发布命令

发布方式：从本地当前仓库仅同步 `backend/public/admin/static/heatwave-ops` 静态目录到服务器同名目录。

```bash
tar -C backend/public/admin/static -czf - heatwave-ops | ssh -o BatchMode=yes pomer.cn 'bash -lc "set -e; cd /www/wwwroot/jiuzhuopanguan-git/backend/public/admin/static; tar -xzf -; echo SYNC_DONE; ls -lh heatwave-ops/app.js heatwave-ops/commerce-ranking-rewards.html"'
```

结果：

```text
SYNC_DONE
heatwave-ops/app.js 69K
heatwave-ops/commerce-ranking-rewards.html 604
```

是否重启：否。原因：本次只同步 Node 服务直接读取的静态资源文件，未改后端代码、环境变量、PM2 配置或 Nginx 配置。

### 12.5 发布后验证

服务器文件标记：

```text
public/admin/static/heatwave-ops/app.js:
1162 const renderPageActions = () =>
1166 data-action="page-action"
1509 const runPageAction = async (actionKey) => {
1573 ${renderPageActions()}
1597 document.querySelectorAll('[data-action="page-action"]')
```

页面 HTML 版本号：

```text
commerce-ranking-rewards.html:
styles.css?v=20260615-admin-action-dialogs
app.js?v=20260615-admin-action-dialogs
```

公网 GET 验证：

```bash
curl.exe -fsS "https://api.pomer.cn/admin/static/heatwave-ops/app.js?v=20260611-admin-pagination-2" | Select-String -Pattern 'renderPageActions','runPageAction','data-action="page-action"'
curl.exe -sS -o NUL -w "app_js_status=%{http_code} size=%{size_download}\n" "https://api.pomer.cn/admin/static/heatwave-ops/app.js?v=20260615-admin-action-dialogs"
curl.exe -sS -o NUL -w "page_status=%{http_code} size=%{size_download}\n" "https://api.pomer.cn/admin/static/heatwave-ops/commerce-ranking-rewards.html"
```

结果摘要：

```text
app.js GET 包含 renderPageActions / runPageAction / data-action="page-action"
app_js_status=200 size=70471
page_status=200 size=604
```

补充说明：`HEAD` 请求 `app.js` 返回 404，GET 返回 200 且内容正确；判断为当前静态处理未覆盖 HEAD，不影响浏览器 GET 加载。

PM2 状态：

```text
jiuzhuopanguan-backend online
script path /www/wwwroot/jiuzhuopanguan-git/backend/server.js
exec cwd /www/wwwroot/jiuzhuopanguan-git/backend
unstable restarts 0
```

### 12.6 回滚方式

如后台页面出现静态资源异常，可恢复备份：

```bash
ssh -o BatchMode=yes pomer.cn 'bash -lc "set -e; cd /www/wwwroot/jiuzhuopanguan-git/backend/public/admin/static; rm -rf heatwave-ops; tar -xzf /www/backup/jiuzhuopanguan/PR-OPS-ADMIN-STATIC-ACTION-DEPLOY-008/heatwave-ops-before-20260616125302.tgz; curl -f https://api.pomer.cn/admin/static/heatwave-ops/commerce-ranking-rewards.html >/dev/null; curl -f https://api.pomer.cn/api/v1/config/home >/dev/null"'
```

回滚不应触碰 `pomer.cn` 官网 block、`pomer` PM2 服务、官网目录或 8787 upstream。

### 12.7 后台下一步复录

后台负责人/测试下一步：

- 打开 `https://api.pomer.cn/admin/login` 登录后台。
- 进入 `commerce-ranking-rewards` 页面。
- 强制刷新或清缓存后确认页面加载 `app.js?v=20260615-admin-action-dialogs`。
- 复录页面按钮是否出现；按钮 DOM 应包含 `data-action="page-action"`。
- 点击按钮后复录请求、响应和 operationLogs；DBA/运维不替后台/测试标记业务验收完成。

## 13. PR-OPS-STANDBY-012 DBA/运维线程启动核查与待命记录

任务编号：`PR-OPS-STANDBY-012`

记录时间：2026-06-17。

当前状态：已完成本线程启动核查；保持待命。未执行服务器级变更、未重启、未写库、未改 Nginx、未清理数据、未触碰 `pomer.cn` 官网项目。

### 13.1 已读取和对齐的材料

本轮按 DBA/运维负责人启动要求读取并对齐：

- `AGENTS.md`
- `docs/gameplay-moments-team-announcements.md`
- `docs/gameplay-moments-progress-tracker.md`
- `docs/runtime/ai-thread-dispatch-queue.md`
- `docs/gameplay-moments-dba-ops-plan.md`
- `DEPLOY.md`
- `deploy/nginx/jiuzhuopanguan-api.conf.example`
- `docs/gameplay-moments-test-acceptance-plan.md`

### 13.2 当前运维判断

| 项目 | 当前判断 | 运维动作 |
| --- | --- | --- |
| 项目边界 | 后端/API/后台/测试服务器目标仍只允许 `api.pomer.cn`、`jiuzhuopanguan-backend`、`jiuzhuopanguan` 数据库 | 继续保护 `pomer.cn` 官网、`pomer` 官网 PM2、官网 Nginx block、官网目录 |
| 最近接口联调 009 | 文档记录为只重启过 `jiuzhuopanguan-backend`，未触碰官网；补齐正向发奖、举报、expired task 样本 | 运维侧无需重复重启；如后台/测试复跑需要服务动作，先确认目标和备份/回滚 |
| 预览框自动化工具链 | PM 已新增微信开发者工具 `auto-port=9420` 自动化方案，测试计划已记录可继续预览框矩阵 | 不需要运维处理；不因预览框测试执行服务器动作 |
| 后台静态 page action | `PR-OPS-ADMIN-STATIC-ACTION-DEPLOY-008` 已完成静态同步和公网 GET 验证，未重启 PM2/Nginx | 等后台/测试复录，不主动再次发布 |
| MySQL/DDL/sync | `DEV-M0-01`、`DATA-DB-001` 仍要求可用 MySQL 环境下 DDL、`db:sync-normalized`、幂等、行数和字段对账 | 未收到新授权前不写库、不执行 DDL/sync |
| 当前测试阶段 | 当前开发推进阶段以微信开发者工具右侧预览框为准，不再让真机截图阻塞开发 | DBA/运维只在明确需要线上重启、清理、备份、部署窗口时介入 |

### 13.3 待命响应规则

后台、接口联调、测试或 PM 后续如提出线上重启、清理、备份、部署窗口或 DDL/sync 请求，DBA/运维第一步必须先确认：

1. 目标域名是 `api.pomer.cn`，不是 `pomer.cn` 或 `www.pomer.cn`。
2. 目标服务是 `jiuzhuopanguan-backend`，不是 `pomer` 官网 PM2 服务。
3. 目标目录属于 `jiuzhuopanguan` 后端或后台静态资源目录，不是官网目录。
4. 若涉及数据库，目标库是 `jiuzhuopanguan`，store 表是 `app_store` 或后端明确指定的 moments 实体表。
5. 执行前有备份路径、回滚方式、健康检查命令、残留/cleanup 口径。
6. 公开文档不得写完整 token、后台 cookie、数据库密码或服务器私密文件内容。

### 13.4 可直接复用的只读核查命令

```bash
cd /www/wwwroot/jiuzhuopanguan-git/backend
pwd
git rev-parse --short HEAD
grep -E '^(PORT|MYSQL_HOST|MYSQL_PORT|MYSQL_USER|MYSQL_DATABASE|MYSQL_STORE_TABLE|STORE_FILE_MIRROR)=' .env
pm2 describe jiuzhuopanguan-backend
pm2 status
grep -R "server_name api.pomer.cn" /etc/nginx/conf.d /etc/nginx/sites-enabled 2>/dev/null
grep -R "127.0.0.1:3010" /etc/nginx/conf.d /etc/nginx/sites-enabled 2>/dev/null
npm run mysql:test
curl -f https://api.pomer.cn/api/v1/config/home
curl -i https://api.pomer.cn/admin/login
```

只读核查可以作为授权窗口前置证据；它不能替代备份、DDL/sync、后台写操作、operationLogs 或测试验收。

### 13.5 当前结论与交给 PM 的回报

DBA/运维当前无需主动执行服务器操作。若后续需要线上动作，按以下口径回报 PM：

- 需要谁：提出动作的角色必须给任务编号、目标样本、允许动作和验收方式。
- 缺什么：缺备份路径、回滚触发条件、后台账号/session、完整清理范围或 MySQL DDL/sync 授权时，只能标记待授权/待联调。
- 能先做什么：可先做只读归属确认和健康检查；写库、重启、清理、后台 action、Nginx reload 必须有明确窗口和记录。
- 禁止什么：不得触碰 `pomer.cn` 官网项目、`pomer` PM2、官网 Nginx block、官网目录或无关服务。

## 14. PR-OPS-SHARE-FLOW-BE016-DEPLOY-017 后端 016 分享流程账本字段发布记录

任务编号：`PR-OPS-SHARE-FLOW-BE016-DEPLOY-017`

记录时间：2026-06-17。

当前状态：已按 PM 派发完成 `api.pomer.cn` 测试服务器发布窗口。仅发布 `jiuzhuopanguan-backend` 所需后端文件；未改 Nginx，未写库，未执行 DDL/sync，未 cleanup，未触碰 `pomer.cn` 公司官网服务、官网 PM2、官网 Nginx server block 或官网目录。

### 14.1 前置核查

已读取并对齐：

- `AGENTS.md`
- `DEPLOY.md`
- `docs/gameplay-moments-dba-ops-plan.md`
- `docs/gameplay-moments-backend-development-plan.md` 第 34 节 `PR-BE-SHARE-FLOW-LEDGER-CONTRACT-016`
- `docs/gameplay-moments-progress-tracker.md`
- `docs/gameplay-moments-team-announcements.md`

后端 016 发布内容：

| 文件 | 发布判断 |
| --- | --- |
| `backend/data/moments.js` | 必须发布；新增 `ledgerSummary`、`accountingHighlights`、`settlementSummary`、`eventHighlights`、`shareContentFilter`，并支持 `layoutMode=dual_flow` / `includeLedger=true` 分享图任务 |
| `backend/server.js` | 必须发布；线上 API 需要路由加载当前 `moments.js` 合同 |
| `docs/api-spec.md` | 文档变更，不上服务器 |

本地发布前验证：

```powershell
node --check backend/data/moments.js
node --check backend/server.js
npm.cmd run check:encoding
```

结果：通过；`check:encoding` 输出 `Encoding check passed`。

### 14.2 目标归属确认

| 项 | 证据 |
| --- | --- |
| 目标域名 | `api.pomer.cn` |
| 目标服务 | `jiuzhuopanguan-backend` |
| 目标目录 | `/www/wwwroot/jiuzhuopanguan-git/backend` |
| PM2 归属 | `jiuzhuopanguan-backend` online；script path `/www/wwwroot/jiuzhuopanguan-git/backend/server.js`；exec cwd `/www/wwwroot/jiuzhuopanguan-git/backend`；Node `20.20.2` |
| Nginx 归属 | `/etc/nginx/conf.d/jiuzhuopanguan.conf` 中 `server_name api.pomer.cn`，反代 `127.0.0.1:3010` |
| 官网保护 | 同机 `pomer` PM2 服务在线但未操作；本次未修改、重启、代理、部署或清理 `pomer.cn` 官网项目 |
| 当前服务器仓库 HEAD | `9dd5532` |

线上依赖确认：服务器 `backend/data/admin.js` 已包含 `handleManagedMomentReport`、`reviewManagedMoment`、`retryManagedShareImageTask`、`grantRankingRewardsByAdmin` 等 `server.js` 已引用函数；覆盖 `server.js` 后不会因这些历史 M4/M5 依赖缺失导致启动失败。

### 14.3 备份记录

备份命令：

```bash
cd /www/wwwroot/jiuzhuopanguan-git/backend
ts=$(date +%Y%m%d%H%M%S)
backup_dir=/www/backup/jiuzhuopanguan/PR-OPS-SHARE-FLOW-BE016-DEPLOY-017
mkdir -p "$backup_dir"
tar -czf "$backup_dir/backend-be016-before-$ts.tgz" server.js data/moments.js
sha256sum "$backup_dir/backend-be016-before-$ts.tgz"
```

备份路径：

```text
/www/backup/jiuzhuopanguan/PR-OPS-SHARE-FLOW-BE016-DEPLOY-017/backend-be016-before-20260617171431.tgz
```

校验和：

```text
b7774e78418ebd3ac0548c99ac52beaf35446224463051600a6043d88698443a
```

备份大小：`23K`。

### 14.4 发布命令与结果

上传到服务器临时文件：

```powershell
scp -o BatchMode=yes backend/server.js pomer.cn:/tmp/jzp-be016-server.js
scp -o BatchMode=yes backend/data/moments.js pomer.cn:/tmp/jzp-be016-moments.js
```

说明：首次组合 `scp` 中 `server.js` 上传遇到一次 SSH timeout，未覆盖线上文件；随后单独重传 `server.js` 成功。最终临时文件：

```text
/tmp/jzp-be016-server.js 58K
/tmp/jzp-be016-moments.js 63K
```

服务器侧语法检查、覆盖和重启：

```bash
cd /www/wwwroot/jiuzhuopanguan-git/backend
node --check /tmp/jzp-be016-server.js
node --check /tmp/jzp-be016-moments.js
sha256sum /tmp/jzp-be016-server.js /tmp/jzp-be016-moments.js
cp -a /tmp/jzp-be016-server.js server.js
cp -a /tmp/jzp-be016-moments.js data/moments.js
node --check server.js
node --check data/moments.js
pm2 restart jiuzhuopanguan-backend --update-env
```

发布文件校验和：

```text
85033af45e4be11c1e0aeaf14e794b1c9c628f2b5bd327435b53311fa1d11695  /tmp/jzp-be016-server.js
5e98020d8b67cce8704161fd9ccb3b4d545ac2645a4129ccdfafb87d66a5c206  /tmp/jzp-be016-moments.js
```

重启结果：

```text
jiuzhuopanguan-backend online
pid 331606
restart count 26
```

本次没有执行：

- `nginx -t`
- `systemctl reload nginx`
- MySQL 备份、DDL、`db:sync-normalized`
- 测试数据 cleanup
- `pomer` PM2 或任何 `pomer.cn` 官网操作

### 14.5 发布后 smoke

公共健康检查：

```bash
curl -fsS https://api.pomer.cn/api/v1/config/home
```

结果摘要：

```json
{
  "code": 0,
  "ok": true,
  "hasData": true
}
```

015 brief 样本字段验证：

- 样本：`brief-1781584503870-25d5edac`
- token 来源：服务器私密 manifest，仅在服务器侧读取；公开记录不输出完整 token。

结果摘要：

```json
{
  "statusCode": 200,
  "code": 0,
  "briefId": "brief-1781584503870-25d5edac",
  "ledgerSummary": {
    "ledgerCount": 11,
    "debtCups": 3,
    "drunkCups": 4,
    "hasLedgerData": true,
    "visibilityScope": "public_summary"
  },
  "accountingHighlights": [
    { "type": "debt", "value": 3 },
    { "type": "drunk", "value": 4 },
    { "type": "add_wine", "value": 2 },
    { "type": "cleared", "value": 1 }
  ],
  "settlementStatus": "open",
  "eventHighlightsCount": 3,
  "shareContentFilter": {
    "allowed": 5,
    "filtered": 4
  }
}
```

`dual_flow` / `includeLedger` 分享图任务验证：

请求摘要：

```json
{
  "layoutMode": "dual_flow",
  "includeLedger": true
}
```

结果摘要：

```json
{
  "taskId": "share-task-1781687817395-94cf4452",
  "layoutMode": "dual_flow",
  "ledgerIncluded": true,
  "status": "ready",
  "imageUrl": "/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png",
  "imageStatusCode": 200,
  "imageContentType": "image/png"
}
```

残留说明：本次为验证 `includeLedger` 实际生成 PNG，新增并保留 `share-task-1781687817395-94cf4452` 及其 PNG，供接口联调/测试复核。未执行 cleanup；如 PM 后续派清理，应基于该 task ID 和上传路径精确清理，不得清理整套 015/006B 样本。

### 14.6 日志与风险

PM2 日志摘要：

- out log 最近记录包含 `jiuzhuopanguan backend listening on port 3010`。
- error log 最近有一条非阻塞资源告警：

```text
[share-poster] rank avatar not readable {
  reportId: 'report-1781685446506-044e40',
  names: [ 'PR Seed Member B', 'PR Seed Member A' ]
}
```

该告警与本次 016 brief 字段和 dual flow PNG smoke 不冲突；如 UI/UX 或测试后续发现头像缺失影响海报视觉，应退给后端/API 或资源提供方补头像/降级策略。

### 14.7 回滚命令

如发布后出现 P0 阻塞、服务异常或 PM 明确触发回滚，执行：

```bash
cd /www/wwwroot/jiuzhuopanguan-git/backend
tar -xzf /www/backup/jiuzhuopanguan/PR-OPS-SHARE-FLOW-BE016-DEPLOY-017/backend-be016-before-20260617171431.tgz
node --check server.js
node --check data/moments.js
pm2 restart jiuzhuopanguan-backend --update-env
curl -fsS https://api.pomer.cn/api/v1/config/home
```

回滚仍只允许操作 `jiuzhuopanguan-backend` 目标目录和 PM2 服务；不得触碰 `pomer.cn` 官网项目、`pomer` PM2、官网 Nginx block 或官网目录。

### 14.8 交给 PM 的回报

`PR-OPS-SHARE-FLOW-BE016-DEPLOY-017` 已完成发布和 smoke：

- 目标确认：`api.pomer.cn` / `jiuzhuopanguan-backend`。
- 发布文件：`backend/server.js`、`backend/data/moments.js`。
- 备份路径：`/www/backup/jiuzhuopanguan/PR-OPS-SHARE-FLOW-BE016-DEPLOY-017/backend-be016-before-20260617171431.tgz`。
- 回滚命令已记录。
- 发布后 `config/home` 通过。
- 015 brief 样本已返回新增账本聚合字段。
- `dual_flow/includeLedger` share task 已生成 ready PNG，图片 GET 200 `image/png`。
- 未改 PM 总台账；未触碰官网。

## 15. PR-OPS-SHARE-FLOW-STANDBY-020 分享流程最高优先级与阅读范围通知记录

记录时间：2026-06-17。

当前状态：已收到 PM 全员通知；DBA/运维保持待命。本节只记录边界通知，不执行服务器动作、不备份、不部署、不重启、不清理、不改 PM 总台账。

### 15.1 收到的产品与协作边界

- 分享页和分享截图保存是当前最高优先级页面。
- 酒桌记账 / 聚会账本必须与拍照流程并存，并共同进入分享页与分享截图保存。
- DBA/运维当前不主动执行服务器动作。
- 只有 PM 明确派发 `api.pomer.cn` / `jiuzhuopanguan-backend` 相关备份、部署、重启、清理或回滚时，DBA/运维才执行。
- 继续保护 `pomer.cn` 公司官网、`pomer` 官网 PM2、官网 Nginx server block、官网目录和无关项目。
- 上一轮 `PR-OPS-SHARE-FLOW-BE016-DEPLOY-017` 已完成发布与 smoke；后续如接口联调、测试或后端发现部署级问题，只处理明确的 PM 派工，不扩大重启/清理范围。

### 15.2 阅读范围同步

后续 DBA/运维接收任务时按 PM 最新阅读规则执行：

1. 先读 `AGENTS.md`。
2. 再读 PM 指定任务段、相关证据段和最新派工行。
3. 优先用 `rg`、章节号、任务编号和关键词精读，例如 `PR-OPS-*`、`PR-BE-*`、`PR-INT-*`、`api.pomer.cn`、`jiuzhuopanguan-backend`、`pomer.cn`、`分享页`、`分享截图`、`聚会账本`、`includeLedger`。
4. 只有出现证据冲突、边界不清、跨角色依赖不明或 PM 明确要求时，才扩展阅读全文。
5. 不得只凭口头状态或单个文件把任务标记完成；仍需查代码、接口、文档、测试或部署验证证据。

### 15.3 当前待命口径

| 场景 | DBA/运维动作 |
| --- | --- |
| 前端/UI/UX/测试继续做分享页预览框复测 | 不执行服务器动作 |
| 接口联调复跑 016/017 线上字段或 PNG | 只在发现部署级问题并由 PM 派工后介入 |
| PM 派发新备份/部署/重启 | 先确认目标是 `api.pomer.cn` / `jiuzhuopanguan-backend`，再记录目标、命令、备份、回滚和验证 |
| PM 派发清理 | 只按明确 task ID、manifest、前缀或上传路径精确清理；清理前记录备份/证据 |
| 任何涉及 `pomer.cn` 官网、`pomer` PM2、官网 Nginx 或官网目录的请求 | 立即停止并回报边界阻塞 |

### 15.4 交给 PM 的回报

DBA/运维已收到本次边界通知并记录。当前不主动执行服务器动作；等待 PM 后续明确派发 `api.pomer.cn` / `jiuzhuopanguan-backend` 范围内的备份、部署、重启、清理或回滚任务。

## 16. PR-OPS-SHARE-FLOW-PUBLIC-RETURN-024-DEPLOY 公开回流后端发布窗口

记录时间：2026-06-17。

任务来源：PM 派发 `PR-OPS-SHARE-FLOW-PUBLIC-RETURN-024-DEPLOY`，仅发布后端/API 024 最小实现到 `api.pomer.cn` / `jiuzhuopanguan` 测试服务，严禁触碰 `pomer.cn` 公司官网、官网 PM2、官网 Nginx、官网目录或无关项目。

### 16.1 发布前阅读与本地校验

已按 PM 指定范围精读：

- `AGENTS.md`：确认 `api.pomer.cn` 是聚会记录师/酒桌判官后端测试服务，`pomer.cn` 是公司官网，线上操作必须保护官网服务。
- `docs/runtime/ai-thread-dispatch-queue.md`：第 259 行后端/API 024 已本地完成但未部署；第 261 行派发 DBA/运维 024 发布窗口。
- `docs/gameplay-moments-progress-tracker.md`：第 386、388 行确认后端 024 待发布，DBA/运维只负责发布、备份、回滚和 smoke 证据。
- `docs/gameplay-moments-backend-development-plan.md`：第 36 节确认 024 最小实现范围为 `backend/data/moments.js`、`backend/data/front.js`，公开 `/sessions/live` 追加安全分享摘要字段。
- `docs/api-spec.md`：`GET /sessions/live` 公开分享回流字段段落确认字段合同。

本地发布前校验：

```powershell
node --check backend/data/moments.js
node --check backend/data/front.js
npm.cmd run check:encoding
```

结果：以上命令均通过；`check:encoding` 输出 `Encoding check passed`。

### 16.2 目标归属只读确认

只读确认命令摘要：

```bash
pm2 status --no-color
pm2 describe jiuzhuopanguan-backend --no-color
nginx -T | awk '/server_name[[:space:]]+api\.pomer\.cn/{flag=1; print "---MATCH---"} flag{print} flag && /}/{flag=0}'
ls -ld /www/wwwroot/jiuzhuopanguan-git /www/wwwroot/jiuzhuopanguan-git/backend
ls -l /www/wwwroot/jiuzhuopanguan-git/backend/data/front.js /www/wwwroot/jiuzhuopanguan-git/backend/data/moments.js
```

归属证据摘要：

- PM2 `jiuzhuopanguan-backend` online，script path 为 `/www/wwwroot/jiuzhuopanguan-git/backend/server.js`。
- PM2 `jiuzhuopanguan-backend` exec cwd 为 `/www/wwwroot/jiuzhuopanguan-git/backend`。
- PM2 同机存在 `pomer` 服务，但本次未重启、未改动。
- Nginx `server_name api.pomer.cn` 的 HTTPS server block 代理到 `http://127.0.0.1:3010`。
- 目标目录为 `/www/wwwroot/jiuzhuopanguan-git/backend`。

结论：目标归属清晰，属于 `api.pomer.cn` / `jiuzhuopanguan-backend` 测试服务；不涉及 `pomer.cn` 官网 server block、PM2 服务或目录。

### 16.3 备份、发布和重启

发布文件：

- `backend/data/front.js`
- `backend/data/moments.js`

未发布文件：

- `docs/api-spec.md`
- `docs/gameplay-moments-backend-development-plan.md`
- PM 总台账、测试、前端、UI/UX、UGC、接口联调文档均未修改。

上传命令：

```powershell
scp -o BatchMode=yes backend/data/front.js backend/data/moments.js pomer.cn:/tmp/
```

线上备份、校验、覆盖和重启命令摘要：

```bash
TASK=PR-OPS-SHARE-FLOW-PUBLIC-RETURN-024-DEPLOY
TS=$(date +%Y%m%d%H%M%S)
APP_DIR=/www/wwwroot/jiuzhuopanguan-git/backend
BACKUP_DIR=/www/backup/jiuzhuopanguan/${TASK}
BACKUP_FILE=${BACKUP_DIR}/backend-public-return-024-before-${TS}.tgz
mkdir -p "$BACKUP_DIR"
cd "$APP_DIR"
tar -czf "$BACKUP_FILE" data/front.js data/moments.js
sha256sum "$BACKUP_FILE"
node --check /tmp/front.js
node --check /tmp/moments.js
cp -a /tmp/front.js data/front.js
cp -a /tmp/moments.js data/moments.js
node --check data/front.js
node --check data/moments.js
pm2 restart jiuzhuopanguan-backend --update-env
pm2 describe jiuzhuopanguan-backend --no-color
```

备份结果：

```text
/www/backup/jiuzhuopanguan/PR-OPS-SHARE-FLOW-PUBLIC-RETURN-024-DEPLOY/backend-public-return-024-before-20260617220001.tgz
sha256: 8f43224e1951e0ffe64f9f2bc418001de161b0c2d1a63db7cb1d3c2520e828e8
```

重启结果：

- `pm2 restart jiuzhuopanguan-backend --update-env` 成功。
- `jiuzhuopanguan-backend` restart count 从 26 到 27，状态 `online`，新 pid `345870`。
- `pomer` PM2 服务保持 online，restart count 仍为 0；本次未触碰。

### 16.4 回滚方式

如发布后出现 P0 阻塞、服务异常或 PM 明确触发回滚，只回滚 `jiuzhuopanguan-backend` 目标目录：

```bash
cd /www/wwwroot/jiuzhuopanguan-git/backend
tar -xzf /www/backup/jiuzhuopanguan/PR-OPS-SHARE-FLOW-PUBLIC-RETURN-024-DEPLOY/backend-public-return-024-before-20260617220001.tgz
node --check data/front.js
node --check data/moments.js
pm2 restart jiuzhuopanguan-backend --update-env
curl -fsS https://api.pomer.cn/api/v1/config/home
curl -fsS "https://api.pomer.cn/api/v1/sessions/live?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T"
```

回滚仍不得触碰 `pomer.cn` 官网项目、`pomer` PM2、官网 Nginx server block 或官网目录。

### 16.5 发布后 smoke

健康检查：

```text
GET https://api.pomer.cn/api/v1/config/home
HTTP 200
code=0
hasData=true
```

公开回流接口：

```text
GET https://api.pomer.cn/api/v1/sessions/live?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T
HTTP 200
code=0
inviteCode=W58G7T
photoHighlights.length=2
accountingHighlights.length=4
ledgerSummary.hasValue=true
ledgerSummary.visibilityScope=public_summary
eventHighlights.length=3
keyEvents.length=3
shareContentFilter.filteredNodeIds.length=4
visibleNodeIds.length=5
visibleNodes.length=5
permissionState=public
publicAccessState.state=public_invite
```

说明：本次 smoke 只记录字段存在性、数量和状态摘要，未输出完整 token 或敏感内容。

### 16.6 边界与残留

- 未清理 009/015/024 样本。
- 未执行 MySQL DDL。
- 未修改 PM 总台账。
- 未修改测试、前端、UI/UX、UGC 或接口联调计划。
- 未替测试写通过结论；线上 smoke 通过后仍需接口联调/测试按各自计划复测公开分享页与分享截图保存链路。
- 未触碰 `pomer.cn` 公司官网、官网 PM2、官网 Nginx、官网目录或无关项目。

### 16.7 交给 PM 的回报

`PR-OPS-SHARE-FLOW-PUBLIC-RETURN-024-DEPLOY` 已完成：

- 目标服务：`api.pomer.cn` / `jiuzhuopanguan-backend`。
- 目标目录：`/www/wwwroot/jiuzhuopanguan-git/backend`。
- 发布文件：`backend/data/front.js`、`backend/data/moments.js`。
- 备份路径：`/www/backup/jiuzhuopanguan/PR-OPS-SHARE-FLOW-PUBLIC-RETURN-024-DEPLOY/backend-public-return-024-before-20260617220001.tgz`。
- 回滚命令已记录在 16.4。
- 部署后 `GET /api/v1/config/home` HTTP 200。
- 部署后公开 `GET /api/v1/sessions/live?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T` HTTP 200，新增公开分享字段已返回。
- 建议下一步：接口联调/测试复测公开分享页和分享截图保存链路，重点验证前端消费 `photoHighlights`、`accountingHighlights`、`ledgerSummary`、`eventHighlights/keyEvents`、`shareContentFilter`、`visibleNodeIds/visibleNodes`、`permissionState`、`publicAccessState` 的真实展示与导出效果。

## 17. PR-OPS-CLEAN-SLATE-001 Clean Slate 线上清理只读准备

记录时间：2026-06-18。

任务来源：PM 发布 `docs/party-recorder-clean-slate-reset-plan.md`，派发 `PR-OPS-CLEAN-SLATE-001`。本节只做只读准备和清理预案，不执行线上清理、重启、部署、删除、备份写入或数据库写操作。

### 17.1 任务边界

本轮允许：

- 只读确认 `api.pomer.cn` / `jiuzhuopanguan` 测试服务的 PM2、Nginx、目录、上传资产、后台静态资源、数据文件和数据库归属。
- 给出备份路径、清理命令预案、回滚命令和残留扫描方式。
- 更新 DBA/运维计划并回报 PM。

本轮禁止：

- 不执行 `rm`、`mv`、`cp`、`tar`、`mysqldump`、`mysql DELETE/UPDATE/TRUNCATE`、`pm2 restart`、`nginx reload`、`git pull`、`scp` 等任何会写入、清理、重启或部署的动作。
- 不触碰 `pomer.cn` 公司官网、`pomer` PM2、官网 Nginx server block、官网目录或无关项目。
- 不修改 PM 总台账，不替后端/API、后台、测试、接口联调或 UI/UX 标记完成。

### 17.2 已读依据

已按 PM 指定范围精读：

- `AGENTS.md`：确认 `api.pomer.cn` 是聚会记录师/酒桌判官后端、API、后台和测试服务器目标；`pomer.cn` 是公司官网，禁止触碰。
- `docs/party-recorder-clean-slate-reset-plan.md`：确认 `PR-OPS-CLEAN-SLATE-001` 的交付物为目标服务确认、备份路径、清理命令预案、回滚方式、不得触碰 `pomer.cn` 证据。
- `DEPLOY.md`：确认本项目部署目标为 `https://api.pomer.cn/api/v1/*`、`https://api.pomer.cn/admin`、`https://api.pomer.cn/admin/static/heatwave-ops/*`、`https://api.pomer.cn/uploads/*`；不得部署到 `pomer.cn`。
- `deploy/nginx/jiuzhuopanguan-api.conf.example`：确认示例配置只应使用 `server_name api.pomer.cn`，反代到后端端口。
- 本运维计划既有 014、016 节：确认此前发布窗口均只操作 `jiuzhuopanguan-backend`，同机 `pomer` 服务保持保护状态。

### 17.3 线上只读归属确认

只读命令摘要：

```bash
pm2 status --no-color
pm2 describe jiuzhuopanguan-backend --no-color
nginx -T | awk '/server_name[[:space:]]+api\.pomer\.cn/{flag=1; print "--- api.pomer.cn block ---"} flag{print} flag && /}/{flag=0}'
nginx -T | awk '/server_name[[:space:]]+(www\.)?pomer\.cn/{flag=1; print "--- pomer.cn block exists; protected ---"} flag{print} flag && /}/{flag=0}'
ls -ld /www/wwwroot/jiuzhuopanguan-git /www/wwwroot/jiuzhuopanguan-git/backend
find /www/wwwroot/jiuzhuopanguan-git/backend/data -maxdepth 1 -type f
find /www/wwwroot/jiuzhuopanguan-git/backend/public/admin -maxdepth 3 -type f
find /www/wwwroot/jiuzhuopanguan-git/backend/public/uploads -maxdepth 3 -type f
```

归属证据：

| 项 | 只读结果 |
| --- | --- |
| 目标域名 | `api.pomer.cn` |
| 目标 PM2 | `jiuzhuopanguan-backend` online，PM2 id `0`，script path `/www/wwwroot/jiuzhuopanguan-git/backend/server.js`，exec cwd `/www/wwwroot/jiuzhuopanguan-git/backend`，Node `20.20.2` |
| 同机官网 PM2 | `pomer` online，PM2 id `1`，本轮只读看见但未操作；后续清理命令必须排除 |
| API Nginx | `server_name api.pomer.cn`，HTTPS block 代理到 `http://127.0.0.1:3010` |
| 官网 Nginx | `server_name pomer.cn` 单独存在，代理到 `http://127.0.0.1:8787`；该 block 是保护对象，不得修改、reload 或覆盖 |
| 后端目录 | `/www/wwwroot/jiuzhuopanguan-git/backend` |
| 后台入口目录 | `/www/wwwroot/jiuzhuopanguan-git/backend/public/admin` |
| 后台静态目录 | `/www/wwwroot/jiuzhuopanguan-git/backend/public/admin/static/heatwave-ops` |
| 上传目录 | `/www/wwwroot/jiuzhuopanguan-git/backend/public/uploads`；`/www/wwwroot/jiuzhuopanguan-git/backend/uploads` 不存在 |
| 上传现状 | `public/uploads` 约 `5.3M`，只读扫描到 `84` 个文件，包含 `admin/general`、`admin/home`、`admin/user-avatars`、`moments/session-*`、`moments/share-tasks` |
| 数据文件 | `data/admin-store.json`、`data/content-store.json`、`data/moments-store.json`、`data/social-store.json`、`data/asset-manifest.json` 等 JSON 镜像存在；`STORE_FILE_MIRROR=1` |
| MySQL 目标 | `.env` 指向 `MYSQL_HOST=127.0.0.1`、`MYSQL_PORT=3306`、`MYSQL_USER=jiuzhuopanguan`、`MYSQL_DATABASE=jiuzhuopanguan`、`MYSQL_STORE_TABLE=app_store`；密码已脱敏 |
| MySQL 表 | `app_store`、`assets`、`share_assets`、`templates`、`question_bank`、`wine_reports`、`wine_sessions`、`wine_session_members`、`analytics_events`、`users`、`points_*`、`admin_*` 等 |
| `app_store` key | `admin_store`、`asset_manifest`、`content_store`、`moments_store`、`social_store` |

结论：Clean Slate 线上清理预案目标归属清晰，限定在 `api.pomer.cn` / `jiuzhuopanguan-backend` / `/www/wwwroot/jiuzhuopanguan-git/backend` / `jiuzhuopanguan` 数据库。`pomer.cn` 官网 PM2、Nginx block、端口 8787 和官网目录必须继续保护。

### 17.4 旧污染清理对象预案

以下为 DBA/运维视角的清理对象，不等于已授权执行：

| 类别 | 线上路径或表 | 初判处理 | 执行前依赖 |
| --- | --- | --- | --- |
| 旧测试数据 JSON 镜像 | `data/admin-store.json`、`data/content-store.json`、`data/moments-store.json`、`data/social-store.json`、`data/asset-manifest.json` | 先全量备份，再由后端/API 提供新基线或精确删除脚本；DBA/运维不自行改业务结构 | PM 最终确认；后端/API `PR-BE-CLEAN-SLATE-001` 给出保留/废弃 key 和新基线 |
| MySQL app_store | `jiuzhuopanguan.app_store` 中 `admin_store`、`asset_manifest`、`content_store`、`moments_store`、`social_store` | 先 `mysqldump`，再按后端/API 提供的新基线覆盖或删除；不得直接清空后上线空数据 | PM 最终确认；后端/API SQL 或 JSON seed |
| MySQL normalized 旧表 | `wine_reports`、`wine_sessions`、`wine_session_members`、`question_bank`、`analytics_events`、`assets`、`share_assets` 等 | 只在后端/API 明确表废弃或可重建后执行 `DELETE`；避免破坏后台登录、权限、模板等仍需保留表 | PM 最终确认；后端/API 表级清单；测试确认不依赖旧样本 |
| 旧上传资产 | `public/uploads/admin/*`、`public/uploads/moments/session-*`、`public/uploads/moments/share-tasks/*` | 先整包备份，再按白名单保留新项目必要素材；旧会话照片和旧分享任务图可清空或隔离 | PM 最终确认；UI/UX/后台给出保留资产白名单 |
| 旧后台静态资源 | `public/admin/index.html`、`public/admin/static/heatwave-ops/*` | 先整包备份；旧 heatwave-ops 后台可隔离或替换为新版后台静态包；不能只删除后留下 404 后台 | PM 最终确认；后台管理 `PR-ADMIN-CLEAN-SLATE-001` 提供新版后台最小包或停用方案 |

### 17.5 计划备份路径

以下命令均为预案，只有 PM 最终确认执行窗口后才能运行：

```bash
TASK=PR-OPS-CLEAN-SLATE-001
TS=$(date +%Y%m%d%H%M%S)
APP=/www/wwwroot/jiuzhuopanguan-git/backend
BACKUP_ROOT=/www/backup/jiuzhuopanguan/${TASK}/${TS}
mkdir -p "$BACKUP_ROOT"
```

计划备份产物：

| 备份对象 | 计划路径 |
| --- | --- |
| 数据 JSON 和数据模块快照 | `/www/backup/jiuzhuopanguan/PR-OPS-CLEAN-SLATE-001/<TS>/data-before-<TS>.tgz` |
| 上传资产整包 | `/www/backup/jiuzhuopanguan/PR-OPS-CLEAN-SLATE-001/<TS>/public-uploads-before-<TS>.tgz` |
| 后台静态资源整包 | `/www/backup/jiuzhuopanguan/PR-OPS-CLEAN-SLATE-001/<TS>/admin-static-before-<TS>.tgz` |
| MySQL 全库备份 | `/www/backup/jiuzhuopanguan/PR-OPS-CLEAN-SLATE-001/<TS>/mysql-jiuzhuopanguan-before-<TS>.sql.gz` |
| 只读清单 | `/www/backup/jiuzhuopanguan/PR-OPS-CLEAN-SLATE-001/<TS>/inventory-before-<TS>.txt` |

计划备份命令：

```bash
cd "$APP"
tar -czf "$BACKUP_ROOT/data-before-${TS}.tgz" data/*.json data/*.js
tar -czf "$BACKUP_ROOT/public-uploads-before-${TS}.tgz" public/uploads
tar -czf "$BACKUP_ROOT/admin-static-before-${TS}.tgz" public/admin
MYSQL_PWD="<from .env, do not print>" mysqldump \
  -h 127.0.0.1 -P 3306 -u jiuzhuopanguan \
  --single-transaction --routines --triggers --no-tablespaces \
  jiuzhuopanguan | gzip > "$BACKUP_ROOT/mysql-jiuzhuopanguan-before-${TS}.sql.gz"
{
  pm2 describe jiuzhuopanguan-backend --no-color
  find "$APP/data" -maxdepth 1 -type f -printf '%p\t%k KB\t%TY-%Tm-%Td %TH:%TM\n'
  find "$APP/public/uploads" -type f -printf '%p\t%k KB\t%TY-%Tm-%Td %TH:%TM\n'
  find "$APP/public/admin" -maxdepth 3 -type f -printf '%p\t%k KB\t%TY-%Tm-%Td %TH:%TM\n'
} > "$BACKUP_ROOT/inventory-before-${TS}.txt"
sha256sum "$BACKUP_ROOT"/* > "$BACKUP_ROOT/SHA256SUMS.txt"
```

### 17.6 计划清理命令

以下清理命令均未执行；必须同时满足 PM 最终确认、备份成功、后端/API 或后台给出保留/重建清单后才能执行。

#### 17.6.1 旧上传资产清理预案

清理旧会话照片、旧分享任务图、旧后台上传图前，先由 PM/UI/UX/后台确认 `keep-uploads.txt` 白名单。无白名单时不得执行。

```bash
cd /www/wwwroot/jiuzhuopanguan-git/backend

# 方案 A：按目录隔离，保留目录结构，便于回滚。
mkdir -p public/uploads.clean-slate-quarantine-${TS}
mv public/uploads/admin public/uploads.clean-slate-quarantine-${TS}/admin
mv public/uploads/moments public/uploads.clean-slate-quarantine-${TS}/moments
mkdir -p public/uploads/admin public/uploads/moments

# 方案 B：如 PM 明确要求清空且已备份，可删除旧上传内容。
find public/uploads/admin -mindepth 1 -maxdepth 1 -exec rm -rf {} +
find public/uploads/moments -mindepth 1 -maxdepth 1 -exec rm -rf {} +
```

推荐优先方案 A：隔离比直接删除更可回滚。方案 B 只有在 PM 明确要求“删除而非隔离”时执行。

#### 17.6.2 旧后台静态资源隔离预案

后台静态资源不能裸删后留下空后台；必须等后台管理负责人提供新版后台静态包或 PM 明确允许后台临时不可用。

```bash
cd /www/wwwroot/jiuzhuopanguan-git/backend/public/admin/static
mv heatwave-ops heatwave-ops.clean-slate-quarantine-${TS}
mkdir -p heatwave-ops

# 如后台负责人已提供新版静态包：
# tar -xzf /tmp/new-party-recorder-admin-static.tgz -C heatwave-ops
```

如 PM 要直接清空旧 heatwave-ops 而不部署新版包：

```bash
cd /www/wwwroot/jiuzhuopanguan-git/backend/public/admin/static/heatwave-ops
find . -mindepth 1 -maxdepth 1 -exec rm -rf {} +
```

该动作会影响 `https://api.pomer.cn/admin/static/heatwave-ops/*`，必须 PM 明确确认。

#### 17.6.3 JSON 镜像和 app_store 清理预案

优先由后端/API 提供新基线 JSON 或 SQL，DBA/运维只执行已评审脚本。无新基线时不得把线上置空。

按后端/API 新基线覆盖：

```bash
cd /www/wwwroot/jiuzhuopanguan-git/backend
cp /tmp/clean-slate-baseline/admin-store.json data/admin-store.json
cp /tmp/clean-slate-baseline/content-store.json data/content-store.json
cp /tmp/clean-slate-baseline/moments-store.json data/moments-store.json
cp /tmp/clean-slate-baseline/social-store.json data/social-store.json
cp /tmp/clean-slate-baseline/asset-manifest.json data/asset-manifest.json
node --check data/admin.js
node --check data/content.js
node --check data/moments.js
```

同步 MySQL `app_store` 的预案 SQL 必须由后端/API 生成。命令形态如下：

```bash
MYSQL_PWD="<from .env, do not print>" mysql -h127.0.0.1 -P3306 -u jiuzhuopanguan jiuzhuopanguan < /tmp/clean-slate-app-store-reset.sql
```

若后端/API 明确旧 `app_store` key 允许删除并由文件镜像重新初始化，才可使用：

```sql
DELETE FROM app_store
WHERE store_key IN ('admin_store','asset_manifest','content_store','moments_store','social_store');
```

该 SQL 会影响线上配置和业务数据，必须 PM 最终确认且必须先有 MySQL 备份。

#### 17.6.4 normalized 旧表清理预案

表级清理必须等待后端/API `PR-BE-CLEAN-SLATE-001` 给出废弃表清单。候选旧污染表包括：

```sql
DELETE FROM wine_session_members;
DELETE FROM wine_reports;
DELETE FROM wine_sessions;
DELETE FROM question_bank;
DELETE FROM analytics_events;
```

以下表可能仍承载后台、用户、模板、积分或资产能力，未获后端/API 清单前不得清空：

```text
admin_users, admin_roles, users, user_sessions, templates, template_filters,
assets, share_assets, points_ledger, points_rewards, points_tasks,
membership_plans, membership_benefits
```

### 17.7 回滚命令预案

以下回滚命令均要求备份已存在，且由 PM 或回滚责任人确认触发。

恢复数据文件：

```bash
cd /www/wwwroot/jiuzhuopanguan-git/backend
tar -xzf /www/backup/jiuzhuopanguan/PR-OPS-CLEAN-SLATE-001/<TS>/data-before-<TS>.tgz
```

恢复上传资产：

```bash
cd /www/wwwroot/jiuzhuopanguan-git/backend
rm -rf public/uploads
tar -xzf /www/backup/jiuzhuopanguan/PR-OPS-CLEAN-SLATE-001/<TS>/public-uploads-before-<TS>.tgz
```

恢复后台静态资源：

```bash
cd /www/wwwroot/jiuzhuopanguan-git/backend
rm -rf public/admin
tar -xzf /www/backup/jiuzhuopanguan/PR-OPS-CLEAN-SLATE-001/<TS>/admin-static-before-<TS>.tgz
```

恢复 MySQL：

```bash
gunzip -c /www/backup/jiuzhuopanguan/PR-OPS-CLEAN-SLATE-001/<TS>/mysql-jiuzhuopanguan-before-<TS>.sql.gz \
  | MYSQL_PWD="<from .env, do not print>" mysql -h127.0.0.1 -P3306 -u jiuzhuopanguan jiuzhuopanguan
```

回滚后验证：

```bash
cd /www/wwwroot/jiuzhuopanguan-git/backend
node --check server.js
node --check data/admin.js
node --check data/moments.js
curl -fsS https://api.pomer.cn/api/v1/config/home
curl -i https://api.pomer.cn/admin/login
```

如清理涉及运行时代码或需要刷新内存缓存，只有 PM 明确允许时才执行：

```bash
pm2 restart jiuzhuopanguan-backend --update-env
```

### 17.8 残留扫描方式

清理前后均应执行同一套只读扫描，便于对比：

```bash
cd /www/wwwroot/jiuzhuopanguan-git/backend

# 文件残留
find public/uploads -type f | wc -l
find public/uploads -maxdepth 3 -type f -printf '%p\t%k KB\n' | sort | sed -n '1,120p'
find public/admin/static/heatwave-ops -maxdepth 2 -type f | sort | sed -n '1,120p'

# 旧词残留，仅做命中扫描，不自动删除
rg -n "酒桌判官|判官|欠酒|惩罚|战报|裁判|wine|judge|punishment" data public/admin public/uploads || true

# MySQL 残留摘要
MYSQL_PWD="<from .env, do not print>" mysql -h127.0.0.1 -P3306 -u jiuzhuopanguan jiuzhuopanguan -e "
SELECT store_key, CHAR_LENGTH(data_json) AS bytes FROM app_store ORDER BY store_key;
SELECT 'wine_reports', COUNT(*) FROM wine_reports;
SELECT 'wine_sessions', COUNT(*) FROM wine_sessions;
SELECT 'wine_session_members', COUNT(*) FROM wine_session_members;
SELECT 'question_bank', COUNT(*) FROM question_bank;
SELECT 'analytics_events', COUNT(*) FROM analytics_events;
"

# 公网只读健康检查
curl -fsS https://api.pomer.cn/api/v1/config/home
curl -i https://api.pomer.cn/admin/login
```

小程序端旧词、旧路由和分享图视觉残留由前端、UI/UX、测试各自负责；DBA/运维只提供后端数据、后台静态和上传资产侧证据。

### 17.9 需要 PM 最终确认后才能执行的动作

| 动作 | 是否需要 PM 最终确认 | 还需谁给证据 |
| --- | --- | --- |
| 创建 `/www/backup/jiuzhuopanguan/PR-OPS-CLEAN-SLATE-001/<TS>` 并写入备份 | 需要 | PM 确认备份窗口 |
| `mysqldump` 线上库 | 需要 | PM 确认窗口；DBA/运维执行 |
| 移动或删除 `public/uploads/admin`、`public/uploads/moments` | 需要 | UI/UX/后台/测试给保留白名单 |
| 隔离或删除 `public/admin/static/heatwave-ops` | 需要 | 后台管理给新版后台包或停用说明 |
| 覆盖 `data/*-store.json` 或 `asset-manifest.json` | 需要 | 后端/API 给新基线 |
| `DELETE FROM app_store` 或导入 reset SQL | 需要 | 后端/API 给 SQL，测试确认样本可废弃 |
| 清理 normalized 表 | 需要 | 后端/API 给表级废弃清单 |
| `pm2 restart jiuzhuopanguan-backend --update-env` | 需要 | PM 确认是否需要刷新运行态 |
| Nginx reload | 需要，且本预案默认不需要 | 只有改 Nginx 时才允许；本任务不计划改 Nginx |
| 任何 `pomer.cn` / `pomer` / 8787 / 官网目录动作 | 不允许 | 如出现此类需求，立即阻塞并退回 PM |

### 17.10 官网保护证据口径

本轮只读证据显示：

- `api.pomer.cn` 与 `pomer.cn` 是不同 Nginx server block。
- `api.pomer.cn` 代理到 `127.0.0.1:3010`，对应 `jiuzhuopanguan-backend`。
- `pomer.cn` 代理到 `127.0.0.1:8787`，对应公司官网保护范围。
- PM2 中 `jiuzhuopanguan-backend` 与 `pomer` 是两个独立服务；本任务只允许未来在 PM 确认后操作 `jiuzhuopanguan-backend`，不得 stop/restart/delete `pomer`。
- 清理命令路径全部限定在 `/www/wwwroot/jiuzhuopanguan-git/backend`、`/www/backup/jiuzhuopanguan/PR-OPS-CLEAN-SLATE-001` 和 `jiuzhuopanguan` 数据库。
- 任一命令若出现 `pomer.cn`、`www.pomer.cn`、`pm2 restart pomer`、`/www/wwwroot/pomer`、端口 `8787` 或官网 Nginx block 修改，应立即停止并回报 PM 阻塞。

### 17.11 交给 PM 的回报

`PR-OPS-CLEAN-SLATE-001` 只读准备已完成：

- 目标服务确认：`api.pomer.cn` / `jiuzhuopanguan-backend` / `/www/wwwroot/jiuzhuopanguan-git/backend` / MySQL `jiuzhuopanguan`。
- 备份路径预案：`/www/backup/jiuzhuopanguan/PR-OPS-CLEAN-SLATE-001/<TS>/`，覆盖 data、uploads、admin static、MySQL 和 inventory。
- 清理命令预案：已列出上传资产、后台静态资源、JSON 镜像、`app_store`、normalized 旧表的可执行命令形态，但均未执行。
- 回滚方式：已列出 data、uploads、admin static、MySQL 的恢复命令和回滚后 smoke。
- 残留扫描：已列出文件数量、旧词 `rg`、MySQL 行数摘要和公网健康检查。
- 官网保护证据：同机 `pomer` PM2 和 `pomer.cn -> 127.0.0.1:8787` Nginx block 已识别为保护对象；本预案所有目标命令均排除官网。
- 当前阻塞：必须等待 PM 最终确认清理窗口，并等待后端/API、后台、UI/UX、测试给出保留白名单或新基线后，DBA/运维才能执行任何备份、清理、回滚或重启动作。

## 18. PR-OPS-CLEAN-SLATE-EXEC-WINDOW-002 执行窗口检查表

记录时间：2026-06-18。

任务来源：PM 二派 `PR-OPS-CLEAN-SLATE-EXEC-WINDOW-002`。PM 已验收第 17 节只读预案；本节继续保持只读，只补执行窗口检查表、执行后 smoke 模板和放行条件表，不执行任何写动作。

### 18.1 只读依据

本节只读取并引用以下范围：

- `docs/runtime/ai-thread-dispatch-queue.md`：第 291 行 `PR-OPS-CLEAN-SLATE-EXEC-WINDOW-002`，要求保持只读，补备份前置、隔离优先、后台静态不可裸删、`pomer.cn` 保护复核和执行后 smoke 模板。
- `docs/party-recorder-clean-slate-reset-plan.md`：确认 Clean Slate 删除、线上清理、静态资源替换必须有备份、回滚和证据；域名边界仅允许 `api.pomer.cn` / `jiuzhuopanguan` 测试服务，不得触碰 `pomer.cn` 官网。
- 本计划第 17 节：确认线上归属、备份路径、清理命令预案、回滚方式、残留扫描和官网保护证据已完成。

### 18.2 执行前检查表

以下检查表必须在任何备份、隔离、删除、导入 SQL、重启或回滚前逐项确认。任一 P0 项不满足，执行窗口不得开始。

| 序号 | 检查项 | 必须满足 | 证据/命令模板 | 失败处理 |
| --- | --- | --- | --- | --- |
| 1 | PM 执行窗口放行 | PM 明确给出 `PR-OPS-CLEAN-SLATE-EXEC-WINDOW-002` 执行窗口、时间、允许动作范围和回滚责任人 | PM 消息或文档放行；记录到本计划 | 未放行则只读待命 |
| 2 | 目标服务确认 | 目标只能是 `api.pomer.cn` / `jiuzhuopanguan-backend` / `/www/wwwroot/jiuzhuopanguan-git/backend` / MySQL `jiuzhuopanguan` | `pm2 describe jiuzhuopanguan-backend --no-color`；`pwd`；`.env` 脱敏摘要 | 目标不一致立即停止 |
| 3 | `pomer.cn` 保护确认 | 不得操作 `pomer` PM2、`pomer.cn` Nginx block、端口 `8787`、官网目录或无关项目 | `pm2 status --no-color` 仅确认不操作 `pomer`；`nginx -T` 只读确认 `pomer.cn -> 127.0.0.1:8787` | 任何命令包含官网目标则阻塞 |
| 4 | 备份前置 | 执行清理前必须已生成 data、uploads、admin static、MySQL、inventory 备份并有 SHA256 | `/www/backup/jiuzhuopanguan/PR-OPS-CLEAN-SLATE-001/<TS>/SHA256SUMS.txt` | 无备份不得清理 |
| 5 | 回滚可用 | 每类操作均有对应回滚命令，且备份路径可读 | `tar -tzf <backup>.tgz`；`gzip -t <mysql>.sql.gz` | 回滚不可用不得执行 |
| 6 | 后端/API 新基线 | JSON store、`app_store` reset SQL、normalized 表清理范围必须由后端/API 提供 | `PR-BE-CLEAN-SLATE-BASELINE-002` 输出路径或 SQL 摘要 | 无基线不得改数据 |
| 7 | 后台静态不可裸删 | `heatwave-ops` 不得直接清空后留下 404；必须有新版后台包、停用方案或 PM 明确允许临时不可用 | 后台 `PR-ADMIN-CLEAN-SLATE-MIN-IA-002` 静态包/停用说明 | 无方案只允许备份，不允许隔离/删除 |
| 8 | uploads 优先隔离 | 上传资产优先 `mv` 到 quarantine 目录；直接 `rm` 只有 PM 明确要求“删除而非隔离”时可执行 | `public/uploads.clean-slate-quarantine-<TS>` 方案 | 默认不得执行删除方案 |
| 9 | 保留白名单 | UI/UX、后台、测试确认需保留的素材、头像、模板或样本 | `keep-uploads.txt` 或文档白名单 | 无白名单只能整包备份，不清理 |
| 10 | MySQL 写入边界 | SQL 只能作用于 `jiuzhuopanguan` 库；不得连其他库；不得输出密码 | `.env` 脱敏摘要；SQL dry-run 摘要 | 库名不一致立即停止 |
| 11 | 运行态影响确认 | 是否需要 `pm2 restart jiuzhuopanguan-backend --update-env` 必须由 PM 放行 | PM 放行记录 | 未放行不得重启 |
| 12 | Nginx 不变更 | 本窗口默认不改 Nginx、不 reload | 不出现 `nginx -s reload`、`systemctl reload nginx` | 需改 Nginx 时另开任务 |

### 18.3 执行后 smoke 模板

以下模板用于真正执行窗口结束后填写。本轮未执行，因此当前全部为待填。

| 类别 | URL/命令 | 期望 | 记录字段 |
| --- | --- | --- | --- |
| API 健康 | `curl -fsS https://api.pomer.cn/api/v1/config/home` | HTTP 200，`code=0` 或可解析配置 | 状态码、`code`、关键配置是否存在 |
| 模板配置 | `curl -fsS https://api.pomer.cn/api/v1/config/templates` | HTTP 200，返回新版可用模板或明确空态 | 状态码、模板数量/空态 |
| 积分/旧功能降级 | `curl -fsS https://api.pomer.cn/api/v1/config/points` | HTTP 200 或后端/API 明确废弃口径 | 状态码、是否仍被前端依赖 |
| 公开 live | `curl -fsS "https://api.pomer.cn/api/v1/sessions/live?sessionId=<cleanSessionId>&inviteCode=<inviteCode>"` | 新 clean fixture 可读；无旧污染字段进入公开 UI payload | 状态码、`permissionState`、`publicAccessState.state`、公开字段摘要 |
| 简报接口 | `curl -fsS "https://api.pomer.cn/api/v1/session-briefs/<briefId>"` | 新简报字段可读；照片、账本、分享摘要并存 | 状态码、照片/账本/分享字段数量摘要 |
| 上传资源 | `curl -I https://api.pomer.cn/uploads/<known-kept-asset>` | 保留白名单资产可访问；旧隔离资产不可作为新版入口依赖 | 状态码、content-type |
| 后台登录页 | `curl -i https://api.pomer.cn/admin/login` | HTTP 200；如后台临时停用，必须返回 PM 批准的停用页/说明 | 状态码、页面归属 |
| 后台静态 | `curl -fsS https://api.pomer.cn/admin/static/heatwave-ops/index.html` 或新版后台入口 | 新版后台静态包可访问，或 PM 批准的停用状态 | 状态码、资源版本 |
| PM2 状态 | `pm2 describe jiuzhuopanguan-backend --no-color` | online；script path/cwd 仍指向 jiuzhuopanguan 后端目录 | status、pid、restart count |
| 官网保护 | `pm2 status --no-color` 只读；`nginx -T` 只读抽查 | `pomer` 未被重启；`pomer.cn` block 未变更 | `pomer` restart count、官网 block 摘要 |
| 数据残留扫描 | 第 17.8 节 MySQL 行数摘要和旧词 `rg` | 与 PM/后端/API/测试约定的残留目标一致 | 旧表行数、旧词命中摘要 |

执行后 smoke 记录不得输出完整 token、cookie、数据库密码、后台 session 或用户隐私内容。

### 18.4 放行条件表

| 动作 | 类型 | 是否可在窗口内直接执行 | 放行条件 |
| --- | --- | --- | --- |
| 只读归属复核 | 标准预案 | 可执行 | 仅运行 `pm2 status/describe`、`nginx -T`、`find`、`curl`、MySQL SELECT；不写文件、不重启 |
| 创建备份目录并写入备份 | PM 最终放行 | 不可直接执行 | PM 明确备份窗口；目标路径限定 `/www/backup/jiuzhuopanguan/PR-OPS-CLEAN-SLATE-001/<TS>` |
| 生成 data/uploads/admin static 备份 | PM 最终放行 | 不可直接执行 | PM 放行；备份命令与第 17.5 节一致；完成 SHA256 |
| `mysqldump` 全库备份 | PM 最终放行 | 不可直接执行 | PM 放行；只连 `jiuzhuopanguan`；密码不落日志 |
| uploads 隔离到 quarantine | PM 最终放行 | 不可直接执行 | 备份完成；PM 放行；保留白名单确认；优先 `mv` 隔离 |
| uploads 直接删除 | 特殊 PM 明确口头或文档放行 | 不可作为标准动作 | PM 明确写明“删除而非隔离”；备份和白名单完成 |
| 后台静态隔离 | PM 最终放行 | 不可直接执行 | 备份完成；后台给新版包或停用方案；PM 确认可影响后台入口 |
| 后台静态裸删 | 特殊 PM 明确口头或文档放行 | 默认禁止 | 仅当 PM 明确允许后台临时不可用；否则不得执行 |
| 覆盖 JSON store 新基线 | PM 最终放行 | 不可直接执行 | 后端/API 提供新基线；备份完成；PM 放行 |
| 导入 `app_store` reset SQL | PM 最终放行 | 不可直接执行 | 后端/API 提供 SQL；备份完成；PM 放行；测试确认旧样本可废弃 |
| normalized 表 DELETE | PM 最终放行 | 不可直接执行 | 后端/API 给表级清单；备份完成；PM 放行 |
| `pm2 restart jiuzhuopanguan-backend` | PM 最终放行 | 不可直接执行 | 仅当数据/静态/代码变更后需刷新运行态，PM 明确允许 |
| Nginx reload | 另开任务 | 默认不可执行 | 本 Clean Slate 清理窗口默认不改 Nginx；若需变更，PM 单独派发 |
| `pomer` PM2、`pomer.cn` Nginx、官网目录动作 | 禁止动作 | 永不直接执行 | 发现命令涉及官网即停止并回报 PM 阻塞 |

### 18.5 交给 PM 的回报

`PR-OPS-CLEAN-SLATE-EXEC-WINDOW-002` 只读补充已完成：

- 执行前检查表已补齐：覆盖备份前置、目标服务确认、`pomer.cn` 保护确认、后台静态不可裸删、uploads 优先隔离不是删除、MySQL 写入边界和 Nginx 不变更。
- 执行后 smoke 模板已补齐：覆盖 `config/home`、`config/templates`、`config/points`、公开 live、brief、uploads、后台登录页、后台静态、PM2、官网保护和数据残留扫描。
- 放行条件表已补齐：区分标准只读预案、需要 PM 最终放行的备份/清理/重启动作、需要特殊明确放行的直接删除/后台裸删，以及永不允许触碰的官网动作。
- 本轮未执行任何线上写动作、清理、重启、部署、备份写入、MySQL 写入或 Nginx reload。
