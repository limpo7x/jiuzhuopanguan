# 酒桌判官精彩瞬间时间线测试与验收计划

更新时间：2026-06-15

负责人：测试/验收负责人（已新增，待登记姓名/账号）

## 1. 文档定位

本文是“精彩瞬间时间线与分享增长”迭代的测试计划，只维护测试侧安排、用例、执行证据和阻塞项。

测试负责人不直接修改 PM 总进度、前端/后端/后台任务状态，也不把跨角色任务标记为完成。涉及其他角色的任务，只在本文标记为“待联调 / 阻塞 / 待复核”，并写明缺少的角色、任务编号和证据。

## 2. 已通读材料

本计划基于以下材料生成：

| 类型 | 文件 | 测试侧结论 |
| --- | --- | --- |
| 总控执行 | `docs/gameplay-moments-development-spec.md` | 以 `DEV-M0` 到 `DEV-M5` 作为验收主线 |
| 前端计划 | `docs/gameplay-moments-frontend-development-plan.md` | 重点验收页面状态、权限态、失败态、弱网态和 SKILL 参与记录 |
| UI/UX 计划 | `docs/gameplay-moments-ui-ux-development-plan.md` | 重点验收 UI/UX 是否自动选择合适 SKILL、是否有截图证据和设计 QA 结论 |
| 后端计划 | `docs/gameplay-moments-backend-development-plan.md` | 重点验收权限过滤、幂等、状态计算、share task 状态机和 smoke |
| 后台计划 | `docs/gameplay-moments-admin-development-plan.md` | 重点验收审核、举报、重试、奖励配置和操作日志 |
| PM 台账 | `docs/gameplay-moments-progress-tracker.md` | 当前 M0 已有首轮本地实现，仍待测试复核；M1-M3/M5 未进入完成态 |
| 运营归档 | `docs/archive/gameplay-auction-moments-operation-plan.md` | 测试指标和 UGC 风险口径来自最终运营方案 |
| PRD | `PRD.md` | 回归必须保护既有酒局、战报、积分、模板、会员、后台登录 |
| 业务流程 | `docs/business-flow.md` | 旧主流程和角色权限是回归基线 |
| API 文档 | `docs/api-spec.md` | 接口验收以 `/api/v1` 合同为准 |
| 后台 IA | `docs/admin-console-ia.md` | 后台 slug、导航、动态页协议和日志页是后台验收基线 |
| 数据库计划 | `docs/database-normalization-plan.md`、`docs/database-upgrade-api-separation-plan.md`、`docs/database-baseline.md` | MySQL 实体表、JSON store 兼容、镜像同步和回滚必须单独验收 |
| 部署说明 | `DEPLOY.md` | 线上验收目标仅限 `api.pomer.cn`，不得触碰 `pomer.cn` 官网 |

## 3. 当前证据与准入判断

### 3.1 当前已发现证据

| 任务 | 当前证据 | 测试判断 |
| --- | --- | --- |
| `DEV-M0-01` | `backend/sql/mysql-normalized-schema.sql` 已新增 moments 相关表 | 待 MySQL 环境验证 DDL 可重复执行 |
| `DEV-M0-02` | `backend/data/moments.js` 存在，包含 moments、timeline、brief、share task 数据层函数 | 可进入接口级测试 |
| `DEV-M0-03` | `docs/api-spec.md` 已新增精彩瞬间时间线接口 | 待前端、后台、测试共同复核字段 |
| `DEV-M0-04` | `miniprogram/services/operations.ts` 已新增 share task 等方法 | 可做服务层合同复核，页面联调未开始 |
| `DEV-M0-05` | `backend/scripts/smoke-moments-flow.js` 存在 | 必须由测试侧复跑并固化验收记录 |
| `DEV-M4-01` 到 `DEV-M4-04` | 后台四个 slug 静态页已存在，后台动态 pageMap 已出现 | 当前只能按“壳层/待联调”验收，不能算闭环完成 |
| 线上公共 API | `https://api.pomer.cn/api/v1/config/home`、`points`、`templates` 可作为只读冒烟目标 | 可纳入线上测试；写入型测试仍需测试账号、测试酒局和数据隔离 |

### 3.2 当前缺口与阻塞

| 缺口 | 影响任务 | 缺少角色/证据 | 测试处理 |
| --- | --- | --- | --- |
| `moment-editor` 页面已补但缺真机联调 | `DEV-M1-03`、`DEV-M1-04` | SKILL 设计评审记录、图片上传到创建 moment 的页面级联调证据、私密成员选择到 timeline 权限展示证据 | M1 只能算待联调，不能验收完成 |
| `session-brief` 页面已补但缺真机联调 | `DEV-M2-02`、`DEV-M2-05` | brief 页面级联调证据、旧战报入口跳转证据、分享任务状态页面渲染证据 | M2 只能算待联调，不能验收完成 |
| `rankings` 页面已补但缺真机和线上 M5 联调 | `DEV-M5-01` | 榜单页真机渲染、榜单数据加载、推举扣分、重复推举、积分不足、发奖和退款回归证据 | M5 只能算待联调/待复核，不能验收完成 |
| `moment-timeline`、`moment-card`、`share-task-status` 已补但缺完整页面联调 | `DEV-M1-05`、`DEV-M3-04` | 前端组件真机渲染、视觉评审记录、个人页/历史页分享任务状态接入证据 | M1/M3 只能算待联调，不能验收完成 |
| UI/UX 成员已新增但缺执行记录 | `UX-M0-01` 至 `UX-QA-RELEASE` | SKILL 自动选择记录、目标截图、实现截图、设计 QA 报告、P0/P1/P2 问题关闭记录 | UI/UX 只能算计划已提交，不能验收完成 |
| MySQL 本机连接曾失败 | `DEV-M0-01`、数据库升级阶段 1 | 可用 MySQL 环境、`mysql:test`、DDL 同步结果 | 数据库验收阻塞 |
| UGC 风控口径已确认，待执行验收 | `DEV-M1-04`、`DEV-M4-01`、`DEV-M4-02`、`DEV-M5-03` 至 `DEV-M5-05` | 私密爆料、举报、二审、隐藏、要求重传、上榜资格、退款和奖励发放规则已在 `docs/gameplay-moments-ugc-risk-control-plan.md` 固化 | 内容安全验收不再卡人员，仍卡真实样本、真机、线上写操作和反例执行证据 |
| 接口联调负责人已新增但固定数据未提交 | `DEV-M1` 到 `DEV-M4` | 同一测试酒局、同一组用户、统一字段口径和执行记录 | 跨端联调待复核 |
| 线上写入测试数据未隔离 | 上线验收、`DEV-M1` 到 `DEV-M5` | 测试账号、测试酒局、测试后台账号、清理/回滚方案 | 只读冒烟可做，写入型线上验收待准备 |
| 线上后台 HEAD/GET 差异 | `DEV-M4`、后台回归 | `GET /admin` 可 302 到 `/admin/login`，`GET /admin/login` 200；`HEAD /admin` 不能作为失败依据 | 后台线上只读入口可测，登录提交和动态页仍待测试账号 |

## 4. 测试总体策略

1. 先复核 M0，再允许 M1 页面主链路进入验收。
2. 每个里程碑必须同时覆盖接口、页面、权限、状态、数据持久化、旧功能回归。
3. 私密爆料和后台审核不能只靠前端隐藏，必须以 API 响应过滤和后台操作日志为准。
4. 分享图任务必须覆盖 `pending / processing / ready / failed / expired / retry`，不能只验 ready。
5. 积分、推举、奖励属于高风险账务链路，必须等 M4 审计和积分流水稳定后再进入 M5 验收。
6. 数据库迁移测试分开执行：JSON store 兼容、MySQL 实体表镜像、双写、查询切换分别给结论。
7. 线上验证只面向 `https://api.pomer.cn` 和 `jiuzhuopanguan-backend`，不得改动、重启、代理或覆盖 `pomer.cn` 官网服务。
8. 线上测试分级执行：公共配置类 GET 接口可直接做只读冒烟；创建酒局、moments、后台审核、积分、奖励等写入型测试必须先准备测试账号、测试酒局、测试后台账号和数据清理方案。

## 5. 固定测试数据

接口联调负责人需要提供并维护以下固定样本。未提供前，测试只能先跑本地 smoke 或壳层验收。

| 数据 | 要求 |
| --- | --- |
| 进行中酒局 | 1 个，状态为进行中 |
| 用户 | 至少 3 个成员，1 个判官，2 个普通成员 |
| opening | 每个成员最多 1 条，支持替换 |
| highlight | 至少 1 条普通精彩瞬间 |
| private | 1 条私密爆料，只指定其中 1 人可见 |
| event | 1 条 `drink_debt` 或 `drink_add` 辅助事件 |
| needs_media | 1 条待补图 moment |
| failed share task | 1 条失败或过期任务，可重试 |
| review sample | 1 条待二审 moment，1 条举报记录 |
| reward rule | 1 条榜单阶梯奖励配置 |

## 6. 里程碑测试安排

### 6.1 M0 合同与数据底座

目标：确认 API、数据结构、权限过滤和 smoke 能作为 M1-M4 的共同合同。

| 用例编号 | 覆盖任务 | 测试内容 | 通过标准 |
| --- | --- | --- | --- |
| QA-M0-001 | `DEV-M0-01` | 检查 moments 相关 DDL 表、字段、索引、可重复执行性 | DDL 包含 `moment_records`、`session_events`、`session_briefs`、`share_image_tasks`、`moment_reports`、`moment_nominations`、`ranking_reward_rules`，MySQL 可执行 |
| QA-M0-002 | `DEV-M0-02` | 创建 opening、highlight、private、event 并读取 timeline | 节点可写入，按 `createdAt` 返回，类型字段稳定 |
| QA-M0-003 | `DEV-M0-02`、`DEV-M1-04` | 私密爆料分别用上传者、接收者、非接收者读取 | 非接收者 API 响应无正文、图片、完整接收名单，只返回占位 |
| QA-M0-004 | `DEV-M0-03` | API 文档字段与 `operations.ts` 类型比对 | 字段命名、状态枚举、错误响应口径一致 |
| QA-M0-005 | `DEV-M0-04` | 前端服务层方法和错误抛出复核 | 新 API 不吞权限、上传、网络错误 |
| QA-M0-006 | `DEV-M0-05` | 复跑 `backend/scripts/smoke-moments-flow.js` | smoke 输出 `ok: true`，记录 sessionId 和节点 ID |
| QA-M0-007 | 旧链路回归 | 创建酒局、加入酒局、更新酒局、生成旧战报 | 旧接口响应结构不破坏 |

M0 准出：

- `npm.cmd run check:encoding` 通过。
- `node --check backend/server.js`、`node --check backend/data/moments.js`、`node --check backend/scripts/smoke-moments-flow.js` 通过。
- `node backend/scripts/smoke-moments-flow.js` 由测试复跑通过。
- MySQL DDL 在可用 MySQL 环境通过，或明确记录为“数据库实连阻塞，不能进入线上验收”。

### 6.2 M1 小程序 MVP 时间线

目标：真实酒局中全员可添加精彩瞬间，判官辅助事件降权但保留。

| 用例编号 | 覆盖任务 | 测试内容 | 通过标准 |
| --- | --- | --- | --- |
| QA-M1-001 | `DEV-M1-01` | 等待室每人上传 1 张开场照并替换 | 同一成员不产生重复 opening，替换后 timeline 更新 |
| QA-M1-002 | `DEV-M1-02` | 非判官进入进行中页 | 主入口为添加精彩瞬间，非判官不能提交辅助事件 |
| QA-M1-003 | `DEV-M1-03` | 瞬间编辑页上传图片、文案、标签、授权 | 提交成功生成 highlight，上传失败保留草稿 |
| QA-M1-004 | `DEV-M1-03` | 弱网或重复点击提交 | `clientDraftId` 幂等，不重复生成节点 |
| QA-M1-005 | `DEV-M1-04` | 私密爆料指定成员可见 | 前端和接口均不向非接收者泄露内容 |
| QA-M1-006 | `DEV-M1-05` | timeline 展示 opening、highlight、event、private placeholder | 节点顺序、状态标签、占位文案正确 |
| QA-M1-007 | `DEV-M1-06` | 首页/判官入口/历史页返回进行中酒局 | 能一键回到当前时间线 |

M1 准出：

- 前端页面和组件已存在并进入 `miniprogram/app.json`。
- SKILL 评审记录覆盖 `moment-editor`、`timeline`、`live-record` 改造。
- `npm.cmd run typecheck` 通过。
- 接口联调负责人提供同一酒局多用户样本。

### 6.3 M2 结束页与时间线简报

目标：结束酒局不因缺图阻塞，简报能表达完整性和待补图状态。

| 用例编号 | 覆盖任务 | 测试内容 | 通过标准 |
| --- | --- | --- | --- |
| QA-M2-001 | `DEV-M2-01` | 结束流程提示上传收尾照但不强制 | 无收尾照仍可结束 |
| QA-M2-002 | `DEV-M2-02` | 创建或刷新 `sessionBrief` | 简报包含 opening、highlight、event、closing 或占位 |
| QA-M2-003 | `DEV-M2-03` | 待补图节点参与分享、上榜、打赏校验 | `needs_media` 不可公开分享、不可上榜、不可奖励 |
| QA-M2-004 | `DEV-M2-04` | 个人页/历史页展示待补图数量和入口 | 数量准确，补图后状态变为 complete |
| QA-M2-005 | `DEV-M2-05` | 旧 `result-report` 与新 brief 并存 | 旧战报详情、历史、海报接口不破坏 |

M2 准出：

- `session-brief` 页面存在并有页面级联调证据。
- user summaries 接口能返回待补图和 share task 基础状态。
- 旧战报回归通过。

### 6.4 M3 异步分享图

目标：分享图从同步等待改为任务化，失败可追溯、可重试。

| 用例编号 | 覆盖任务 | 测试内容 | 通过标准 |
| --- | --- | --- | --- |
| QA-M3-001 | `DEV-M3-01` | share task 状态机 | 状态枚举完整，非法状态转换被拒绝 |
| QA-M3-002 | `DEV-M3-02` | 同一 `briefId + layoutMode` 重复创建任务 | 未终态任务返回原任务，不重复创建 |
| QA-M3-003 | `DEV-M3-03` | `pending -> processing -> ready` | ready 后有 imageUrl，可查看或保存 |
| QA-M3-004 | `DEV-M3-03` | failed/expired 任务重试 | retry 后回到 pending，重试次数和日志增加 |
| QA-M3-005 | `DEV-M3-04` | 个人页、历史页、分享海报页展示任务状态 | pending、processing、ready、failed、expired 都有明确 UI |
| QA-M3-006 | `DEV-M3-05` | 分享图内容筛选 | 私密、未授权、待补图、隐藏、未审核内容不进入公开图 |

M3 准出：

- `share-task-status` 组件或等效 UI 存在。
- 后端 smoke 或接口脚本覆盖 ready、failed、retry。
- 后台 `growth-share-tasks` 能读取失败原因和重试结果。

### 6.5 M4 后台审核与运营配置

目标：运营能处理 UGC 风险，动作可审计，并影响前台状态。

| 用例编号 | 覆盖任务 | 测试内容 | 通过标准 |
| --- | --- | --- | --- |
| QA-M4-001 | `DEV-M4-01` | `content-moments-review` 列表、筛选、详情 | 能看到待审 moment，不展示假数据 |
| QA-M4-002 | `DEV-M4-01` | 审核通过、隐藏、要求重传、移出榜单候选 | 强审计动作必须填原因，接口返回成功后刷新状态；本地已验证 pending 行显示可用审核动作、hidden 行显示无可用操作 |
| QA-M4-003 | `DEV-M4-02` | 举报有效、无效、要求重传、合并重复举报 | 处理记录可查，前台状态同步；本地已验证 pending 举报显示处理动作、handled 举报显示无可用操作 |
| QA-M4-004 | `DEV-M4-03` | 后台重试 failed/expired share task | 只允许可重试状态显示重试入口，写操作日志；本地已验证 failed 显示重试、pending 显示无可用操作 |
| QA-M4-005 | `DEV-M4-04` | 榜单奖励阶梯配置校验 | 名次不重叠，积分非负，保存必须填原因 |
| QA-M4-006 | `DEV-M4-05` | `system-operation-logs` 或实体日志追溯 | 日志含操作者、动作、目标、理由、时间、旧值新值 |
| QA-M4-007 | 前台同步 | 后台隐藏或要求重传后刷新 timeline、brief、个人页 | 前台不可继续分享、上榜或打赏 |

M4 准出：

- 后台页面登录后可打开四个新 slug。
- 审核、举报、重试、奖励配置均通过真实接口，不用本地伪造成功态。
- UGC 风控负责人确认隐藏、二审、要求重传和举报处理口径。

### 6.6 M5 第二阶段榜单与局外推举

目标：推举和榜单积分链路公平、可追溯、可退款。

| 用例编号 | 覆盖任务 | 测试内容 | 通过标准 |
| --- | --- | --- | --- |
| QA-M5-001 | `DEV-M5-01` | 今日榜单多分类查询和页面展示 | 分类正确，分页和空态可用 |
| QA-M5-002 | `DEV-M5-02` | 非本局成员推举 | 返回 403 或明确错误 |
| QA-M5-003 | `DEV-M5-03` | 推举资格计算 | 只有 `complete + consent + approved + rankingEligible` 可推举 |
| QA-M5-004 | `DEV-M5-04` | 推举扣积分、失败退款、下架退款 | `points_ledger` 可追溯，重复请求不重复扣款 |
| QA-M5-005 | `DEV-M5-05` | 后台阶梯奖励发放 | 奖励流水、失败原因、发放日志可查 |
| QA-M5-006 | 风控回归 | 私密、未授权、待补图、隐藏内容尝试推举 | 全部被拒绝，前端不显示入口，后端也拒绝 |

M5 准出：

- M4 操作日志和奖励配置已通过。
- 积分流水验收通过。
- 每日次数限制和重复提交幂等通过。

## 7. 回归测试范围

每个里程碑合并前至少覆盖以下旧链路：

| 旧链路 | 回归点 |
| --- | --- |
| 用户登录 | 微信登录配置、会话、用户资料、首次积分 |
| 创建酒局 | 创建、玩法设置、添加玩家、邀请入局、等待开局 |
| 进行中记录 | 判官更新酒局、转盘、桌面模式 |
| 旧战报 | `POST /reports`、`GET /reports/:id`、poster PNG、历史列表 |
| 积分中心 | 签到、分享战报任务、商城兑换、后台手工调整 |
| 模板 | 免费模板 `cost=0` 展示和使用，会员关闭不影响免费模板 |
| 会员 | 会员总开关关闭时前端隐藏或后端拒绝 |
| 后台登录 | `/admin` 未登录跳转、登录、会话、退出 |
| 后台动态页 | `GET/PUT /admin/pages/:slug` 不破坏既有页面 |
| 上传资源 | 后台上传和 moments 上传路径互不污染 |

## 8. 验证命令清单

### 8.1 每轮必跑

```powershell
pwsh -NoLogo -NoProfile -Command "$PSVersionTable.PSVersion.ToString()"
npm.cmd run check:encoding
npm.cmd run typecheck
node --check backend/server.js
node --check backend/data/moments.js
node --check backend/scripts/smoke-moments-flow.js
```

### 8.2 M0/M1/M2/M3 接口测试

```powershell
node backend/scripts/smoke-moments-flow.js
npm.cmd --prefix backend run smoke:moments-http
npm.cmd --prefix backend run smoke:admin-moments
```

后续如新增 curl 或接口脚本，应放入 `backend/scripts/`，并在本文执行记录中写明命令、输出摘要和失败响应。

### 8.3 数据库测试

```powershell
npm.cmd --prefix backend run mysql:test
npm.cmd --prefix backend run db:sync-normalized
```

若本机 MySQL 不可用，测试结论只能写“本机环境阻塞”，不能写“数据库验收通过”。

### 8.4 线上冒烟

目标只能是 `api.pomer.cn`。只读公共接口可直接执行：

```bash
curl -f https://api.pomer.cn/api/v1/config/home
curl -f https://api.pomer.cn/api/v1/config/points
curl -f https://api.pomer.cn/api/v1/config/templates
```

后台入口需要用 GET 单独复核；不要用 `HEAD /admin` 作为失败依据：

```bash
curl -i https://api.pomer.cn/admin
curl -i https://api.pomer.cn/admin/login
```

涉及 moments 新接口、创建酒局、后台审核、积分扣减、奖励发放等写入型线上 smoke，必须先准备：

- 测试小程序账号和测试后台账号。
- 固定测试酒局与测试用户。
- 测试数据标识，例如 session 名称统一带 `QA-` 前缀。
- 测试结束后的数据清理或回滚方案。
- MySQL、PM2、Nginx 和部署版本证据。

不允许污染真实用户数据，不允许触碰 `pomer.cn` 公司官网服务。

## 9. 缺陷分级

| 级别 | 定义 | 示例 |
| --- | --- | --- |
| P0 阻断 | 隐私泄露、积分错扣、线上服务不可用、旧主链路中断 | 非接收者看到私密图片；推举重复扣积分；创建酒局失败 |
| P1 高 | 核心 MVP 无法闭环或状态错误 | timeline 不显示节点；failed share task 无法重试 |
| P2 中 | 重要边界或后台运营效率问题 | 后台筛选不准；待补图数量不刷新 |
| P3 低 | 文案、样式、轻微体验问题 | 状态文案不统一；按钮间距问题 |

P0/P1 修复后必须复测相关回归链路，不能只复测单接口。

## 10. 验收交付格式

每次测试执行后，在本文追加记录，格式如下：

| 时间 | 测试人 | 范围 | 结论 | 证据 | 阻塞/未验证 |
| --- | --- | --- | --- | --- | --- |
| 2026-06-15 | Codex/PM | 线上只读公共 API 与后台 GET 入口冒烟 | 通过，只读可测 | `config/home`、`config/points`、`config/templates` 均返回 `code:0`；`GET /admin` 返回 302 到 `/admin/login`；`GET /admin/login` 返回 200 登录页 | 未做写入型 moments、后台登录提交、MySQL/PM2/Nginx 复核 |
| 2026-06-15 | 测试/验收负责人 | T0 本地 M0 复核 | 有条件通过，本地代码与 smoke 通过，数据库实连阻塞 | `pwsh` 7.6.2；`npm.cmd run check:encoding` 通过；`npm.cmd run typecheck` 通过；`node --check backend/server.js backend/data/moments.js backend/scripts/smoke-moments-flow.js` 通过；`node backend/scripts/smoke-moments-flow.js` 输出 `ok: true`，`sessionId=session-1781462048599-d5264c`，`memberBPrivatePlaceholder=true`；`node --check backend/data/normalized-db.js backend/scripts/sync-normalized-db.js backend/scripts/test-mysql.js` 通过 | `npm.cmd --prefix backend run mysql:test` 报 `ECONNREFUSED ::1:3306 / 127.0.0.1:3306`；未做 HTTP 级写入接口联调、未做线上写入测试 |
| 2026-06-15 | Codex/PM | 线上 moments 写入接口联调 | 通过，M0/M1/M3 接口层可测；当时未覆盖 ready/failed，后续已补 process ready 线上验收 | 已部署到 `api.pomer.cn` 对应 `jiuzhuopanguan-backend`；`npm run mysql:test` 在线上返回 `ok:true`；公网 HTTP 创建 `session-1781464115047-06968b`，上传图片，创建 `opening/highlight/private/event`，host timeline 4 节点且私密为占位，member 可见私密正文，生成 `brief-1781464115623-4f7c5b93` 和 `share-task-1781464115687-938b6ad5`；负向：非本局 `visibleProfileIds` 返回 400，pending task retry 返回 409 | 未做小程序真机页面联调、后台登录态动作按钮 E2E、UGC 风控验收 |
| 2026-06-15 | Codex/PM | M3 本地分享图状态机 smoke | 有条件通过，本地 ready/failed/retry 覆盖；页面待复测 | `node backend/scripts/smoke-moments-flow.js` 输出 `shareTaskStatus=ready`、`failedTaskStatus=failed`、`retriedTaskStatus=pending`；生成 `/uploads/moments/share-tasks/*.png` 后自动清理；`node --check backend/data/moments.js backend/scripts/smoke-moments-flow.js backend/server.js` 通过 | 已部署到 `api.pomer.cn`；仍未验证前端预览保存、线上后台写操作和图片视觉验收 |
| 2026-06-15 | Codex/PM | M3 HTTP 路由级 smoke | 有条件通过，本地 HTTP ready/failed/retry 覆盖；页面待复测 | `npm.cmd --prefix backend run smoke:moments-http` 输出 `shareTaskStatus=ready`、`failedTaskStatus=failed`、`retriedTaskStatus=pending`；脚本通过真实 HTTP 路由创建任务、调用 process、删除引用节点制造 failed、retry 回 pending，并清理测试数据 | 已部署到 `api.pomer.cn`；仍未验证前端预览保存、线上后台写操作和图片视觉验收 |
| 2026-06-15 | 测试/验收负责人 | 本地 HTTP moments smoke 脚本化 | 通过，新增可复用本地 HTTP 写入 smoke | 新增 `backend/scripts/smoke-moments-http-flow.js` 和 `backend/package.json` 命令 `smoke:moments-http`；`npm.cmd --prefix backend run smoke:moments-http` 输出 `ok:true`，覆盖创建/加入 QA 酒局、上传图片、`opening/highlight/private/event`、timeline 私密占位、brief、share task pending、非本局 `visibleProfileIds` 400、非本局 event target 400、pending retry 409；复跑 `npm.cmd run typecheck` 通过；清理检查未命中 `moments-http` 残留 | 执行时出现 Node `DEP0169 url.parse()` 弃用警告，属既有服务启动警告；未覆盖真实 share task ready/failed 队列和后台动作按钮 E2E |
| 2026-06-15 | 测试/验收负责人 | 本地 M4 后台 moments smoke 脚本化 | 通过，新增可复用后台强审计 smoke | 新增 `backend/scripts/smoke-admin-moments-flow.js` 和 `backend/package.json` 命令 `smoke:admin-moments`；`npm.cmd --prefix backend run smoke:admin-moments` 输出 `ok:true`，覆盖后台登录态、`content-moments-review` 读取、moment 审核通过、`content-moment-reports` 读取、举报处理隐藏、`growth-share-tasks` 读取、failed share task retry、`commerce-ranking-rewards` 保存、`system-operation-logs` 页面追溯四类 M4 操作日志；`node --check`、`npm.cmd run check:encoding`、`npm.cmd run typecheck` 通过 | 执行时出现 Node `DEP0169 url.parse()` 弃用警告，属既有服务启动警告；本地浏览器 E2E 后续已补，但仍不能替代线上后台写操作和真实运营样本；UGC 风控口径已确认，待真实样本复核 |
| 2026-06-15 | 测试/验收负责人 | 前端页面与组件静态复核 | 有条件通过，M1/M2/M3 关键页面和组件已落地，真机联调仍待补 | `miniprogram/app.json` 已包含 `pages/moment-editor/index`、`pages/session-brief/index`；已存在 `moment-editor`、`session-brief`、`moment-timeline`、`moment-card`、`share-task-status`、`session-return-bar`；`live-record` 引用 `moment-timeline`，`session-brief` 引用 `moment-timeline` 和 `share-task-status`，`waiting-room/table-mode/result-report/wine-history` 已出现新入口；`npm.cmd run typecheck` 通过 | 未做微信开发者工具/真机渲染、图片上传交互、私密成员选择、brief 页面状态、share task 按钮状态和 SKILL 评审记录 |
| 2026-06-15 | 测试/验收负责人 | 本地后台浏览器页面验收 | 有条件通过，后台登录、五个 M4/M5 相关页面渲染和审核弹窗可用 | 本地启动 `PORT=3240 node server.js`，浏览器打开 `http://127.0.0.1:3240/admin/login`，使用本地管理员账号登录后进入 `overview-dashboard`；直达 `content-moments-review`、`content-moment-reports`、`growth-share-tasks`、`commerce-ranking-rewards`、`system-operation-logs` 均未回登录页，页面标题/H1/`已连接后台`/表格列渲染正常，控制台 error 数为 0；`content-moments-review` 有 1 个 `approve` 行动作，点击后出现“填写操作原因”弹窗，按钮包含“取消”“确认执行” | 未点击“确认执行”，避免浏览器层写入状态变更；`growth-share-tasks` 当前本地样本为空态，仅验证表头和页面可用；不能替代线上后台登录提交、线上写操作窗口、真实运营样本和前台状态同步验证 |
| 2026-06-15 | 测试/验收负责人 | M5 `rankings` 页面静态复核 | 有条件通过，榜单页已落地并接入推举接口合同 | `miniprogram/app.json` 已包含 `pages/rankings/index`；`miniprogram/pages/rankings/` 含 `index.json`、`index.less`、`index.ts`、`index.wxml`；页面接入 `getManagedTodayRanking`、`getManagedMomentNominationEligibility`、`createManagedMomentNomination`，入口来自 `wine-history` 和 `session-brief`；`npm.cmd run check:encoding` 与 `npm.cmd run typecheck` 通过 | 未做微信开发者工具/真机渲染、榜单数据加载、推举扣分确认弹窗、重复推举、积分不足、线上发奖和退款回归 |
| 2026-06-15 | Codex/PM | 线上部署后真实联调 | 通过，后端/API/后台静态资源已部署，可供测试与联调继续使用 | 部署目标为 `api.pomer.cn` 的 `jiuzhuopanguan-backend`，未触碰 `pomer` 官网进程；`pm2 restart jiuzhuopanguan-backend --update-env` 后 online；服务器 `npm run mysql:test` 返回 `ok:true`；公网创建 `session-1781465622025-5f436e`、上传 `/uploads/moments/session-1781465622025-5f436e/1781465622163-online-1781465623681-dccbd6.webp`、生成 `opening=moment-1781465622195-8502e7ac`、`private=moment-1781465622240-7b8c0264`、`brief=brief-1781465622338-8c84f732`、`share-task=share-task-1781465622362-b11e8289`，process 返回 `ready` 和 `/uploads/moments/share-tasks/share-task-1781465622362-b11e8289.png`，GET 图片返回 200 `image/png`；负向：非本局 `visibleProfileIds` 返回 400，pending retry 返回 409；部署后快照 `/www/backup/jiuzhuopanguan/moments-20260615033152-postdeploy` | 服务器本机 `smoke:moments-http` 在独立 3220 进程因测试账号鉴权返回 401，需测试/接口负责人调整脚本账号策略；未做小程序真机、线上后台写操作、三用户非接收者占位、分享图视觉验收 |
| 2026-06-15 | Codex/PM | M5 后端榜单/推举/退款/发奖证据复核 | 有条件通过，本地数据层和 HTTP 层覆盖推举扣分、重复限制、榜单查询、后台发奖和移出榜单退款 | `node backend/scripts/smoke-moments-flow.js` 输出 `nominationId`、`rankingItems=1`、`rankingRewardGranted=1`、`refundedPoints=10`；`npm.cmd --prefix backend run smoke:moments-http` 通过后台登录态调用 `POST /admin/ranking-rewards/grant`，再通过 `remove_ranking` 触发 `pointsLedger(kind=moment-nomination-refund)`；`smoke:admin-moments` 断言 `commerce-ranking-rewards` 暴露发奖 pageActions；脚本执行后清理测试数据 | 未做前端 `rankings` 页面、线上 M5 写入验收、奖励失败/重复页面验收和完整风控反例；本地后台浏览器点击已有证据，但不能替代线上后台写操作窗口 |

缺陷记录格式：

```text
缺陷编号：
任务编号：
级别：
复现环境：
复现步骤：
实际结果：
期望结果：
证据：
责任角色：
阻塞原因：
复测结论：
```

## 11. 第一轮执行安排

### T0：立即执行，M0 复核

1. 运行编码、TS、后端 JS 语法检查。
2. 复跑 `backend/scripts/smoke-moments-flow.js`。
3. 复核 `docs/api-spec.md`、`miniprogram/services/operations.ts`、`backend/data/moments.js` 字段一致性。
4. 用固定三用户样本补充私密爆料权限测试。
5. 若 MySQL 不可用，记录 `DEV-M0-01` 数据库实连阻塞。

### T1：M1 联调准入

1. 复核 `moment-editor`、`moment-timeline`、`moment-card` 的真机页面联调和 SKILL 评审记录。
2. 用同一酒局测试 opening、highlight、private、event。
3. 验证非判官、非成员、上传失败、重复提交。

### T2：M2-M3 主流程

1. 验证 brief 生成、未补图和旧战报兼容。
2. 验证 share task 全状态和个人页提示。
3. 验证分享图筛选规则不泄露私密或未授权内容。

### T3：M4 后台闭环

1. 登录后台打开四个新 slug。
2. 验证审核、举报、重试、奖励配置。
3. 验证操作日志和前台状态同步。
4. UGC 风控口径已确认，但真实样本和线上写操作未复核前，M4 只能“待复核”。

### T4：M5 第二阶段

1. 只在 M4 审计和积分流水通过后执行。
2. 验证推举资格、扣积分、退款、奖励发放。
3. 验证同一用户每日次数限制和幂等。

## 12. 当前测试结论

截至 2026-06-15：

- M0 已完成测试侧 T0 本地复核、可复用本地 HTTP smoke 和线上 HTTP 写入复核：编码、类型、语法、moments smoke、线上 MySQL、线上 moments 写入链路通过。
- M1/M2/M3 已有关键前端页面/组件、类型检查和接口证据，但缺微信开发者工具或真机页面联调、UI/UX SKILL 自动选择记录、视觉评审和端到端操作记录；M5 已有 `rankings` 页面静态落地、后端榜单、推举、退款和发奖本地证据，但仍缺真机榜单操作、线上 M5 写入、失败/重复发放和风控反例，不能进入完成验收。
- M4 已有本地后台接口层强审计 smoke：审核、举报隐藏、分享任务 retry、奖励配置保存和 operationLogs 通过；本地浏览器层已覆盖后台登录、五个相关页面渲染和审核原因弹窗打开；UGC 风控口径已确认；仍缺线上后台写操作窗口、真实运营样本、前台状态同步验证和风控签字复核。
- 线上 `api.pomer.cn` 公共配置接口、后台 GET 入口、moments 写入接口已可测；后续写入测试继续使用 `IT-MOMENTS-20260615-*` 这类固定前缀。
- 本机 MySQL 仍不可用，但线上 MySQL `app_store` 已通过 `npm run mysql:test`；DDL 实体表仍需单独执行/复核，不能用 JSON store 或 `app_store` 通过代替。
- 接口联调负责人已新增但尚未提交固定测试数据和联调记录；UGC 风控负责人已加入但尚未提交 `UGC-QA-001` 至 `UGC-QA-008` 执行记录；线上写入数据隔离和运维发布证据仍缺。这些任务在测试侧只能标记为“待联调 / 阻塞 / 待复核”。

## 13. 第一轮测试执行包

测试包位置：本文第 13 节。本文只维护测试/验收职责范围内的执行顺序、证据模板、截图/录屏要求、失败记录和复测记录；不更新 PM 总台账，不替前端、后端、后台、接口联调、UGC 风控或 UI/UX 标记完成。

### 13.1 执行前置条件

接口联调负责人提交固定数据包后，本测试包即可执行。固定数据包至少包含：

| 数据 | 必填内容 | 用途 |
| --- | --- | --- |
| 测试酒局 | `sessionId`、酒局名称、当前状态、是否进行中/已结束 | M1/M2/M3/M5 共用 |
| 三用户 | 判官、成员 A、成员 B、非接收者/非成员 C 的账号、profileId、登录方式 | M1 私密、M5 推举权限 |
| moments 样本 | opening、highlight、private、needs_media、approved、hidden/require_resubmit 的 momentId | timeline、brief、分享图、风控反例 |
| share task 样本 | pending、processing、ready、failed、expired 的 taskId 或可复现步骤 | M3/M4 retry 和状态展示 |
| 后台样本 | 待审 moment、举报记录、failed/expired share task、奖励配置 | M4 审核/举报/日志 |
| M5 样本 | 可推举 moment、不可推举反例、已推举记录、待退款/已退款记录、奖励发放记录 | M5 推举/退款/奖励 |
| 清理策略 | 哪些数据保留、哪些数据可删除、清理负责人、清理时间 | 避免污染真实用户数据 |

未收到固定数据包前，测试只能执行本地 smoke、页面静态复核或空态验证；不得写“验收完成”。

### 13.2 第一轮可执行测试顺序

| 顺序 | 范围 | 任务编号 | 执行目标 | 前置依赖 | 输出 |
| --- | --- | --- | --- | --- | --- |
| 1 | 环境与账号核对 | 全部 | 确认体验版二维码、测试账号、后台账号、接口 token、数据清理策略 | PM、接口联调、前端、后台 | 测试环境记录 |
| 2 | 三用户私密真机 | `DEV-M1-03`、`DEV-M1-04`、`UGC-QA-001`、`UGC-QA-002` | A 发私密给 B，B 可见正文和图，C 只见占位，非成员 403 | 固定三用户酒局、moment-editor 可用 | 真机录屏、timeline 响应摘要、失败/通过记录 |
| 3 | brief 与待补图 | `DEV-M2-01` 至 `DEV-M2-05` | 验证收尾照、简报、待补图、旧战报入口、历史入口 | 固定酒局含 opening/highlight/private/event/closing/needs_media | 页面截图、brief 响应、入口路径 |
| 4 | 分享任务 | `DEV-M3-01` 至 `DEV-M3-05`、`UGC-QA-003` | 验证 pending/processing/ready/failed/expired/retry、ready PNG 预览保存、隐私过滤 | ready/failed/expired task 样本 | 状态截图、PNG 原图、接口响应 |
| 5 | 后台审核/举报/日志 | `DEV-M4-01` 至 `DEV-M4-05`、`UGC-QA-004`、`UGC-QA-005` | 线上后台真实样本操作，验证日志和前台状态同步 | 后台账号、写操作窗口、真实待审/举报样本 | 后台录屏、operationLogs、前台同步截图 |
| 6 | 推举/退款/奖励 | `DEV-M5-01` 至 `DEV-M5-05`、`UGC-QA-006` 至 `UGC-QA-008` | 验证榜单、推举、扣分、退款、重复推举、重复发奖、奖励流水 | M4 审计路径可追溯，M5 样本齐全 | 榜单截图、points ledger、rankingRewardPayouts、失败响应 |
| 7 | UI/UX 复核 | `UX-M1-01` 至 `UX-M5-01` | 对同一批截图执行 UI/UX blocked/pass 初判 | 前端/后台/测试截图包齐全 | UI/UX 问题清单 |
| 8 | 汇总准出建议 | 全部 | 汇总通过项、失败项、阻塞项、复测项 | 所有执行记录 | 测试准出建议，不改 PM 总台账 |

### 13.3 证据模板：`DEV-M1-03/04` 三用户私密

| 字段 | 填写要求 |
| --- | --- |
| 任务编号 | `DEV-M1-03`、`DEV-M1-04`、`UGC-QA-001`、`UGC-QA-002` |
| 页面路径 | `pages/live-record/index` 进入 `pages/moment-editor/index?nodeType=private`，再回 timeline 所在页面 |
| 账号角色 | 判官、成员 A 上传者、成员 B 指定接收者、成员 C 非接收者/非成员 |
| 样本 ID | `sessionId`、A/B/C `profileId`、private `momentId`、`clientDraftId` |
| 操作步骤 | A 选择私密/指定可见，选择 B，上传图片和文案并提交；B/C 分别刷新 timeline；非成员尝试读取 |
| 预期 | B 可见正文、图片、标签；C 只见占位，不返回正文、图片和完整接收名单；非成员 403；重复提交不重复生成 moment |
| 实际 | 记录页面表现和接口返回摘要 |
| 截图/录屏 | A 提交录屏、B timeline 截图、C 占位截图、非成员错误截图 |
| 接口响应 | `GET /sessions/:sessionId/timeline` 的 B/C/非成员响应摘要；必要时补 `POST /sessions/:sessionId/moments` 响应 |
| 是否通过 | 通过 / 失败 / 阻塞 / 待复测 |

### 13.4 证据模板：`DEV-M2` brief

| 字段 | 填写要求 |
| --- | --- |
| 任务编号 | `DEV-M2-01`、`DEV-M2-02`、`DEV-M2-03`、`DEV-M2-04`、`DEV-M2-05` |
| 页面路径 | `pages/table-mode/index` 收尾照入口、`pages/session-brief/index?sessionId=...`、旧 `pages/result-report/index`、`pages/wine-history/index` |
| 账号角色 | 判官、普通成员、历史页查看用户 |
| 样本 ID | `sessionId`、`briefId`、opening/highlight/private/event/closing/needs_media momentId |
| 操作步骤 | 验证无收尾照可结束；上传 closing；进入 brief；从旧战报/历史入口进入 brief；补图后刷新 summaries |
| 预期 | brief 展示 opening/highlight/event/private placeholder/closing；待补图数量准确；旧战报不破坏；无收尾照不阻塞结束 |
| 实际 | 记录页面层级、节点顺序、状态标签、入口可达性 |
| 截图/录屏 | brief 混合节点截图、待补图截图、旧战报入口截图、历史页入口截图、closing 上传录屏 |
| 接口响应 | `POST /sessions/:sessionId/brief`、`GET /session-briefs/:briefId`、`GET /user/session-moment-summaries` 响应摘要 |
| 是否通过 | 通过 / 失败 / 阻塞 / 待复测 |

### 13.5 证据模板：`DEV-M3` 分享任务

| 字段 | 填写要求 |
| --- | --- |
| 任务编号 | `DEV-M3-01`、`DEV-M3-02`、`DEV-M3-03`、`DEV-M3-04`、`DEV-M3-05`、`UGC-QA-003` |
| 页面路径 | `pages/share-poster/index?briefId=...`、`pages/share-poster/index?taskId=...`、`pages/me/index`、`pages/wine-history/index` |
| 账号角色 | 上传者、指定接收者、非接收者、普通成员 |
| 样本 ID | `briefId`、ready/failed/expired `taskId`、PNG `imageUrl`、参与分享图的 momentId |
| 操作步骤 | 创建任务；轮询 pending/processing；处理 ready；预览/保存 PNG；制造或使用 failed/expired 样本并 retry |
| 预期 | 未终态任务复用；ready 可预览保存；failed/expired 可 retry；pending/processing/ready 不允许用户侧 retry；PNG 不包含私密、隐藏、待补图、未授权节点 |
| 实际 | 记录页面状态和接口状态转换 |
| 截图/录屏 | 五种状态截图、retry 前后截图、ready 预览/保存录屏、PNG 原图 |
| 接口响应 | `POST /session-briefs/:briefId/share-image-tasks`、`GET /share-image-tasks/:taskId`、`POST /share-image-tasks/:taskId/retry`、如可用则记录 process 响应 |
| 是否通过 | 通过 / 失败 / 阻塞 / 待复测 |

### 13.6 证据模板：`DEV-M4` 后台审核/举报/日志

| 字段 | 填写要求 |
| --- | --- |
| 任务编号 | `DEV-M4-01`、`DEV-M4-02`、`DEV-M4-03`、`DEV-M4-04`、`DEV-M4-05`、`UGC-QA-004`、`UGC-QA-005` |
| 页面路径 | `/admin/login`、`/admin/pages/content-moments-review`、`/admin/pages/content-moment-reports`、`/admin/pages/growth-share-tasks`、`/admin/pages/commerce-ranking-rewards`、`/admin/pages/system-operation-logs` |
| 账号角色 | 后台测试管理员、前台上传者、前台普通查看者 |
| 样本 ID | 待审 `momentId`、举报 `reportId`、failed/expired `taskId`、奖励规则 ID、operationLog ID |
| 操作步骤 | 登录后台；审核 approve/hide/require_resubmit/remove_ranking；处理举报 valid_hide/invalid_keep/require_resubmit/remove_ranking；retry failed task；保存奖励配置；查询日志；前台刷新状态 |
| 预期 | 所有强审计动作必须填写原因；状态变化正确；operationLogs 含操作者、动作、目标、原因、时间、旧值/新值；前台 timeline/brief/ranking/share task 同步 |
| 实际 | 记录后台页面结果、前台同步结果和失败提示 |
| 截图/录屏 | 后台页面点击录屏、原因弹窗截图、operationLogs 截图、前台同步截图 |
| 接口响应 | 后台 action 响应摘要；必要时补动态页 GET 响应摘要 |
| 是否通过 | 通过 / 失败 / 阻塞 / 待复测 |

### 13.7 证据模板：`DEV-M5` 推举/退款/奖励

| 字段 | 填写要求 |
| --- | --- |
| 任务编号 | `DEV-M5-01`、`DEV-M5-02`、`DEV-M5-03`、`DEV-M5-04`、`DEV-M5-05`、`UGC-QA-006`、`UGC-QA-007`、`UGC-QA-008` |
| 页面路径 | `pages/rankings/index?category=...`、`pages/session-brief/index?sessionId=...`、`pages/wine-history/index`、后台 `commerce-ranking-rewards` |
| 账号角色 | 可推举局成员、重复推举用户、非成员、积分不足用户、后台测试管理员 |
| 样本 ID | 可推举 momentId、不可推举 momentId、nominationId、pointsLedgerId、rankingRewardPayoutId、reward rule ID |
| 操作步骤 | 查询榜单；检查推举资格；成功推举扣 10 积分；重复推举；非成员推举；私密/未授权/待补图/未二审/隐藏内容推举；后台 hide/remove_ranking 后验证退款；触发奖励发放和重复发奖 |
| 预期 | 只有合规公开内容可推举；重复/非成员/不合规内容被拒绝；扣分、退款、发奖都有流水；重复发奖跳过不重复加积分 |
| 实际 | 记录页面提示、接口错误码、积分流水变化 |
| 截图/录屏 | 榜单空态/列表态/推举确认/失败态截图，积分变化截图，后台发奖录屏 |
| 接口响应 | `GET /rankings/today`、`GET /moments/:momentId/nomination-eligibility`、`POST /moments/:momentId/nominations`、后台发奖 action、points ledger/rankingRewardPayouts 样本摘要 |
| 是否通过 | 通过 / 失败 / 阻塞 / 待复测 |

### 13.8 微信开发者工具 / 体验版二维码使用要求

| 项目 | 要求 |
| --- | --- |
| 版本来源 | 必须记录是微信开发者工具预览、体验版二维码，还是线上正式版；优先使用体验版二维码做真机录屏 |
| 成员权限 | 参与测试的微信号必须加入小程序体验成员或测试白名单；至少准备判官、成员 A、成员 B、非接收者/非成员 C 四个视角 |
| 登录状态 | 每个账号测试前记录登录状态、昵称/头像授权状态和对应 `profileId`；不得混用账号导致证据不可追溯 |
| 设备覆盖 | 至少 1 台 iPhone 13/14 宽度真机或等效设备、1 台常见 Android 宽度真机；微信开发者工具截图只能作为补充 |
| 录屏要求 | 录屏必须包含入口路径、操作动作、结果页面和关键时间点；隐私用例必须包含 B/C 两个视角 |
| 截图命名 | 建议使用 `QA-<任务编号>-<页面>-<状态>-<角色>-<设备>-<日期>.png`，例如 `QA-DEV-M1-04-timeline-private-placeholder-memberC-iPhone13-20260615.png` |
| 接口留证 | 页面截图必须配套接口响应摘要或样本 ID；只给截图不能单独判定权限和账务链路通过 |
| 数据边界 | 线上测试只允许面向 `api.pomer.cn` 的酒桌判官测试数据，不触碰 `pomer.cn` 官网服务，不污染真实用户数据 |

### 13.9 对 PM 的当前交付说明

| 项目 | 当前结论 |
| --- | --- |
| 测试包位置 | `docs/gameplay-moments-test-acceptance-plan.md` 第 13 节 |
| 当前状态 | 测试执行包已准备；等待接口联调固定数据包、前端真机入口、后台线上窗口、UGC 反例样本和 UI/UX 截图包 |
| 阻塞项 | 固定测试酒局和账号未交付；微信体验版二维码/测试成员未确认；线上后台写操作窗口未确认；UGC-QA 真实样本未提交；UI/UX 目标截图和实现截图未回收 |
| 接口联调需提供 | 固定三用户酒局、token/账号说明、opening/highlight/private/event、failed/expired task、待审 moment、举报样本、M5 榜单/推举/退款/奖励样本、清理策略 |
| 前端需提供 | 体验版二维码或开发者工具可测版本、页面路径、M1/M2/M3/M5 真机截图/录屏、失败态和权限态截图 |
| 后台需提供 | 线上后台测试账号、写操作窗口、真实审核/举报/share task/奖励配置样本、operationLogs 截图 |
| UGC 风控需提供 | `UGC-QA-001` 至 `UGC-QA-008` 反例执行记录、样本 ID、接口响应、签字结论 |
| UI/UX 需提供 | SKILL 选择记录、目标截图/实现截图清单、P0/P1/P2 问题清单、blocked/pass 初判 |

本测试包只表示“可执行准备完成”，不代表任何 DEV 任务已经验收完成。实际通过结论必须等截图、录屏、接口响应、样本 ID、日志和复测记录齐全后再写入执行记录。

### 13.10 固定数据到位后的执行记录规范

固定数据包到位后，测试负责人先建立本轮执行记录，不直接改 PM 总台账。记录建议写在本文第 10 节“验收交付格式”下方，或作为单独附件提交给 PM 后由 PM 汇总。

首批执行人建议：

| 范围 | 主执行人 | 配合角色 | 说明 |
| --- | --- | --- | --- |
| 环境与固定数据核对 | 测试/验收负责人 | 接口联调、前端、后台 | 先确认 `sessionId`、账号、token、体验版二维码、后台账号和样本 ID 都可用 |
| M1 三用户私密 | 测试/验收负责人 | 前端、接口联调、UGC 风控 | 测试主录屏，接口联调同步给 timeline 响应摘要，风控确认是否泄露 |
| M2 brief | 测试/验收负责人 | 前端、接口联调、UI/UX | 测试记录页面路径和 brief/user summaries 响应，UI/UX 复核层级 |
| M3 分享任务 | 测试/验收负责人 | 前端、后端/API、UI/UX、UGC 风控 | 测试记录五态、PNG、retry；UGC 风控确认 PNG 不含不合规节点 |
| M4 后台 | 测试/验收负责人 | 后台、接口联调、UGC 风控 | 后台执行或测试执行需按 PM 授权窗口操作；必须录屏和留 operationLogs |
| M5 推举/退款/奖励 | 测试/验收负责人 | 后端/API、后台、UGC 风控、接口联调 | 只在 M4 日志可追溯后执行；账务流水必须截图或响应留证 |

执行记录头模板：

```text
执行批次：
执行时间：
测试负责人：
测试环境：微信开发者工具 / 体验版二维码 / api.pomer.cn / 后台
版本来源：提交版本 / 体验版版本号 / 二维码生成时间
固定数据包编号：
测试酒局 sessionId：
账号角色与 profileId：
后台账号：
接口联调负责人：
UGC 风控复核人：
UI/UX 复核人：
数据清理策略：
本批不执行范围与原因：
```

### 13.11 证据目录与文件命名建议

如果 PM 指定共享目录，以 PM 指定目录为准；未指定时，测试侧建议先用以下命名提交给 PM 或放入测试附件包，不直接写入业务源码目录：

```text
QA-20260615-moments-round1/
  00-env/
  01-m1-private/
  02-m2-brief/
  03-m3-share-task/
  04-m4-admin/
  05-m5-ranking/
  06-ux/
  07-ugc/
  99-summary/
```

文件命名规则：

```text
QA-<任务编号>-<页面或接口>-<状态>-<角色>-<设备或环境>-<样本ID>-<日期>.<ext>
```

示例：

```text
QA-DEV-M1-04-timeline-private-visible-memberB-iPhone13-session-xxx-20260615.png
QA-DEV-M1-04-timeline-private-placeholder-memberC-Android-session-xxx-20260615.mp4
QA-DEV-M3-05-share-poster-ready-uploader-iPhone13-task-xxx-20260615.png
QA-DEV-M4-05-operation-logs-approve-admin-desktop-moment-xxx-20260615.png
QA-DEV-M5-04-points-ledger-refund-memberA-api-nomination-xxx-20260615.json
```

接口响应摘要建议保存为 `.json` 或 `.md`，内容至少包含：

```text
接口：
请求身份：
请求参数摘要：
响应 code/status：
关键字段：
样本 ID：
是否含敏感字段：
结论：
```

### 13.12 微信开发者工具与体验版成员记录模板

每个真机或开发者工具证据必须配套以下记录，避免只有截图无法追溯：

| 字段 | 记录要求 |
| --- | --- |
| 版本来源 | 微信开发者工具预览 / 体验版二维码 / 正式版；记录二维码生成时间或版本号 |
| 设备 | 设备型号、系统版本、微信版本；开发者工具需记录工具版本和模拟器尺寸 |
| 网络 | Wi-Fi / 4G / 5G / 弱网模拟；上传和重复提交用例必须记录网络状态 |
| 角色 | 判官、成员 A 上传者、成员 B 接收者、成员 C 非接收者/非成员、后台管理员 |
| 账号 | 测试微信号备注名、是否体验成员、对应 `profileId` |
| 页面路径 | 进入页面的完整路径和入口，例如 `live-record -> moment-editor?nodeType=private -> timeline` |
| 样本 ID | `sessionId`、`momentId`、`briefId`、`taskId`、`reportId`、`nominationId`、`ledgerId` |
| 操作摘要 | 关键点击、输入、上传、刷新、返回路径 |
| 接口摘要 | 与该截图对应的 API 响应摘要；私密和账务用例必须填写 |
| 证据文件 | 截图/录屏文件名；同一用例多视角需写清 A/B/C 对应文件 |
| 结论 | 通过 / 失败 / 阻塞 / 待复测；失败需关联缺陷编号 |

体验版成员最低要求：

- 至少 4 个微信号：判官、成员 A、成员 B、成员 C/非接收者。若要测非成员 403，C 需能作为非本局账号或另备非成员账号。
- 所有微信号必须提前加入体验成员或测试白名单，并能登录到同一后端环境。
- 不能用同一微信号反复切角色截图替代三用户隐私验收。
- 三用户私密用例必须同时保留 A 提交、B 可见、C 占位三段证据。

### 13.13 数据包到位后第一小时测试安排

固定数据包、体验版二维码、测试成员和后台窗口到位后的第一小时，只跑高风险和可阻断项，不先铺开全量回归。

| 时间段 | 用例 | 目标 | 产出 | 失败处理 |
| --- | --- | --- | --- | --- |
| 0-10 分钟 | 环境与数据核对 | 确认二维码可打开、A/B/C 登录成功、`sessionId` 可进入、后台账号可登录、关键样本 ID 可查 | 环境记录、账号/profileId 对照表 | 任一账号或样本不可用，整轮标记阻塞并退回接口联调/前端/后台 |
| 10-25 分钟 | `DEV-M1-03/04` 三用户私密 | A 发私密给 B；B/C 分别看 timeline；非成员或 C 权限复核 | A/B/C 录屏或截图、timeline 响应摘要、private momentId | 如 C 看到正文/图片/完整接收名单，立即 P0，停止后续公开分享/榜单测试 |
| 25-35 分钟 | `DEV-M2` brief 快速验证 | 用同一 `sessionId` 打开 brief，确认 private placeholder、needs_media、closing/无 closing 状态 | brief 截图、brief 响应摘要 | 如 brief 泄露私密或状态错乱，暂停 M3/M5，退回前端/后端 |
| 35-45 分钟 | `DEV-M3` ready/failed/retry 快速验证 | 打开 ready task 预览 PNG；failed/expired 执行 retry；确认 PNG 不含私密/隐藏/待补图 | ready PNG、预览截图、retry 响应、taskId | 如 PNG 泄露或 retry 状态错误，标记 P0/P1，暂停分享相关验收 |
| 45-55 分钟 | `DEV-M4` 后台只做 1 个低风险真实动作 | 在 PM 授权窗口内选 1 条待审样本执行 approve 或 require_resubmit，查 operationLogs 和前台同步 | 后台录屏、operationLogs、前台同步截图 | 如日志缺失或前台不同步，M4 保持待复核，不进入 M5 发奖 |
| 55-60 分钟 | 第一小时小结 | 汇总通过、失败、阻塞和下一小时计划 | 第一小时执行摘要 | 将缺陷分级后发给 PM，不更新 PM 总台账 |

第一小时不建议直接跑：

- 批量后台隐藏、举报处理和奖励配置改动。
- 线上发奖和重复发奖，除非 PM 明确开放 M5 写操作窗口。
- 大范围旧链路回归。旧链路回归放在隐私、分享图、后台日志这些 P0/P1 风险通过后执行。

### 13.14 第一小时执行表单

本表用于 `INT-DATA-001` manifest 到位后的第一小时现场执行。manifest 未到位前，所有依赖实际账号、token、`sessionId`、`momentId`、`taskId`、`reportId`、`nominationId`、`ledgerId`、`payoutId` 的字段必须保留为“待接口联调回填”，不得提前写“通过”。

接口 manifest 建议来源：`docs/runtime/int-data-001-manifest.json`。如果接口联调负责人给出其他 manifest 路径，以 PM 确认路径为准。

| 时间段 | 用例 | 测试人 | 角色账号 | 样本 ID | 截图/录屏文件名 | 接口摘要 | 结果 | 阻塞原因 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0-10 分钟 | 环境与数据核对 | 测试/验收负责人 | 判官：待接口联调回填；成员 A：待接口联调回填；成员 B：待接口联调回填；成员 C/非成员：待接口联调回填；后台管理员：待后台回填 | `manifestId=INT-DATA-001`；`sessionId=待接口联调回填`；体验版二维码=待前端回填 | `QA-ENV-manifest-check-all-<device>-INT-DATA-001-20260615.md` | 只记录 manifest 字段、二维码版本、账号/profileId 对照，不做通过判定 | 待执行 | 固定数据 manifest、体验版二维码、后台账号任一缺失则阻塞 |
| 10-25 分钟 | `DEV-M1-03/04` 三用户私密 | 测试/验收负责人 | 成员 A 上传者：待接口联调回填；成员 B 接收者：待接口联调回填；成员 C 非接收者/非成员：待接口联调回填 | `sessionId=待接口联调回填`；`privateMomentId=待接口联调回填`；A/B/C `profileId=待接口联调回填` | `QA-DEV-M1-04-private-submit-memberA-iPhone13-待接口联调回填-20260615.mp4`；`QA-DEV-M1-04-private-visible-memberB-iPhone13-待接口联调回填-20260615.png`；`QA-DEV-M1-04-private-placeholder-memberC-Android-待接口联调回填-20260615.png` | `POST /sessions/:sessionId/moments` 摘要；A/B/C/非成员 `GET /sessions/:sessionId/timeline` 摘要；敏感字段检查 | 待执行 | 缺 A/B/C token、private momentId、timeline 响应时只能写待接口联调回填 |
| 25-35 分钟 | `DEV-M2` brief 快速验证 | 测试/验收负责人 | 判官或成员 A：待接口联调回填 | `sessionId=待接口联调回填`；`briefId=待接口联调回填`；opening/highlight/private/event/closing/needs_media ID=待接口联调回填 | `QA-DEV-M2-brief-mixed-nodes-memberA-iPhone13-待接口联调回填-20260615.png`；`QA-DEV-M2-brief-entry-history-memberA-iPhone13-待接口联调回填-20260615.mp4` | `POST /sessions/:sessionId/brief` 或 `GET /session-briefs/:briefId` 摘要；`GET /user/session-moment-summaries` 摘要 | 待执行 | 缺 briefId、混合节点样本、待补图样本或入口路径截图时阻塞 |
| 35-45 分钟 | `DEV-M3` ready/failed/retry 快速验证 | 测试/验收负责人 | 上传者/普通成员：待接口联调回填 | `briefId=待接口联调回填`；`readyTaskId=待接口联调回填`；`failedOrExpiredTaskId=待接口联调回填`；PNG `imageUrl=待接口联调回填` | `QA-DEV-M3-share-ready-preview-memberA-iPhone13-待接口联调回填-20260615.png`；`QA-DEV-M3-share-failed-retry-memberA-iPhone13-待接口联调回填-20260615.mp4`；`QA-DEV-M3-share-ready-png-api-待接口联调回填-20260615.png` | `GET /share-image-tasks/:taskId` ready/failed/expired 摘要；`POST /share-image-tasks/:taskId/retry` 摘要；PNG 节点过滤摘要 | 待执行 | 缺 ready/failed/expired task、PNG 原图或 retry 响应时阻塞 |
| 45-55 分钟 | `DEV-M4` 后台低风险真实动作 | 测试/验收负责人 | 后台管理员：待后台回填；前台上传者：待接口联调回填 | `reviewMomentId=待接口联调回填`；`reportId=待接口联调回填`；`operationLogId=待后台回填` | `QA-DEV-M4-review-action-admin-desktop-待后台回填-20260615.mp4`；`QA-DEV-M4-operation-logs-admin-desktop-待后台回填-20260615.png`；`QA-DEV-M4-frontend-sync-memberA-iPhone13-待接口联调回填-20260615.png` | 后台 action 响应摘要；`system-operation-logs` 摘要；前台 timeline/brief 同步摘要 | 待执行 | 缺线上后台写操作窗口、后台账号、待审/举报样本或日志截图时阻塞 |
| 55-60 分钟 | 第一小时小结 | 测试/验收负责人 | 不适用 | 本小时已执行样本 ID 清单；未执行样本 ID 清单 | `QA-SUMMARY-first-hour-test-lead-md-INT-DATA-001-20260615.md` | 汇总接口摘要索引，不新增接口请求 | 待执行 | 若前 55 分钟任一 P0/P1 阻塞，后续 M5 和公开分享相关测试暂停 |

#### 13.14.1 固定数据未到位字段填写规则

| 字段类型 | 未到位时必须填写 | 禁止写法 |
| --- | --- | --- |
| `sessionId`、`briefId`、`momentId`、`taskId`、`reportId`、`nominationId`、`ledgerId`、`payoutId` | `待接口联调回填` 或 `待后台回填` | `暂无但通过`、`计划通过`、`本地 smoke 通过可代替` |
| 测试账号、token、profileId | `待接口联调回填` | 用口头角色名代替真实账号并判通过 |
| 体验版二维码、开发者工具版本 | `待前端回填` | 不记录版本来源直接判页面通过 |
| 后台账号、写操作窗口 | `待后台回填` / `待 PM 授权` | 使用本地后台 E2E 代替线上真实样本 |
| 截图/录屏文件名 | `待执行生成` | 空白后写通过 |
| 接口摘要 | `待接口联调回填` 或 `待执行抓取` | 只写截图通过，不记录接口 |
| 结果 | `待执行`、`阻塞`、`待复测` | 固定数据未到位时写 `通过` |

#### 13.14.2 给 PM 的执行口径

一旦 `INT-DATA-001` manifest 到位，测试第一小时直接照第 13.14 表执行。执行顺序不变：先核对 manifest 与账号，再跑 M1 私密不泄露，再跑 M2 brief，再跑 M3 分享任务，再在 PM 授权窗口内跑 1 个 M4 低风险后台动作，最后形成第一小时小结。

若第一小时内出现以下任一情况，测试负责人应立即暂停后续公开分享、榜单或发奖测试，并向 PM 回报阻塞：

- C/非接收者看到私密正文、图片、标签或完整接收名单。
- brief 或分享图泄露 private/hidden/needs_media/未授权节点。
- 后台强审计动作没有 operationLogs。
- 前台状态与后台审核/举报结果不同步。
- M5 账务接口发生重复扣分、重复发奖或退款缺失。

### 13.15 本地第一小时启动记录（INT-DATA-001 actual manifest）

记录时间：2026-06-15。记录范围仅限测试/验收侧首轮启动核查；不更新 PM 总台账，不改接口/后端/前端/后台/UGC/UI 文档，不执行 cleanup，不触碰 `api.pomer.cn` 或 `pomer.cn`。

#### 13.15.1 manifest 准入核验

manifest 路径：`docs/runtime/int-data-001-manifest.json`。本轮已执行 `JSON.parse` 核验，结果通过。

| 核验项 | 样本 ID / 字段 | 结果 |
| --- | --- | --- |
| `sessionId` | `session-1781506784680-02d0a3` | 齐全 |
| 4 个 profile/token | host `user-1781506784332-e605eb`；memberA `user-1781506784333-1e0ef8`；memberB `user-1781506784333-dcdcd4`；outsider `user-1781506784334-d22d78` | 齐全 |
| private moment | `moment-1781506784703-82eee0ec` | 齐全 |
| brief | `brief-1781506784708-27d5b341` | 齐全 |
| share task 四态 | pending `share-task-1781506784710-06d879ef`；ready `share-task-1781506784711-94847106`；failed `share-task-1781506784787-76bc5d8f`；expired `share-task-it-moments-20260615-expired` | 齐全 |
| report | `moment-report-it-moments-20260615` | 齐全 |
| nomination | `nomination-1781506784795-48dc91b2` | 齐全 |
| reward payout | `ranking-reward-payout-1781506784799-f238499a` | 齐全 |
| manifest 异常项 | `missing: []`；`warnings: []`；`skipped: []` | 无异常 |

补充记录：manifest 中 `reviewMomentId` 字段为空；后台审核样本需按接口联调记录使用 pending/highlight 样本复核，不能在测试侧直接推定 M4 已通过。

#### 13.15.2 本地服务与真机执行状态

| 项目 | 核查方式 | 结果 | 测试状态 |
| --- | --- | --- | --- |
| 本地 API `127.0.0.1:3221` | `curl.exe --max-time 5 http://127.0.0.1:3221/api/v1/config/home` 返回 `000`；`Get-NetTCPConnection -LocalPort 3221` 未发现监听 | 不可访问 | 阻塞，不自行启动服务，不 cleanup |
| 微信开发者工具/体验版真机 | 当前线程无微信开发者工具控制能力、无体验版二维码、无真机设备与登录成员条件 | 未执行 | 未执行真机，不能写通过 |

#### 13.15.3 当前证据缺口与 PM 下一步

| 缺少证据 | 当前记录 | 需要 PM 派给谁 |
| --- | --- | --- |
| `DEV-M1-03/04` 三用户私密真机截图/录屏 | 未采集；不能写通过 | 前端/测试提供微信开发者工具或体验版二维码、A/B/C 体验成员和设备 |
| 本地 API 实时接口响应 | `127.0.0.1:3221` 当前不可访问 | 接口联调/后端确认本地服务启动方式、端口和可复跑窗口 |
| 页面路径与角色登录记录 | 未采集；仅有 manifest 样本 ID | 前端提供可进入 `sessionId` 的页面路径和二维码版本 |
| M4 审核样本确认 | manifest `reviewMomentId` 为空，不能判定后台审核已可测 | 接口联调/后台确认 review 样本 ID、后台账号和只读/写操作授权窗口 |

当前测试状态：`INT-DATA-001` manifest 准入核验通过；本地服务不可访问且未执行微信开发者工具/体验版真机验证，第一小时执行停在 0-10 分钟数据核对阶段，`DEV-M1-03/04` 及后续用例均保持阻塞/待执行，不得写通过。

#### 13.15.4 本地服务恢复后的 10-25 分钟复测记录

记录时间：2026-06-15。记录范围仅限 `INT-DATA-001` 本地第一小时 10-25 分钟测试准备/只读复核；不执行 cleanup，不做线上写入，不修改 PM 总台账，不替前端/接口/后端标记完成。

已读取前端计划最新 `INT-DATA-001` 清单，前端给出的页面路径为：

- `live-record`：`/pages/live-record/index?sessionId=session-1781506784680-02d0a3`，可选 `role=host` 或 `role=member`。
- `moment-editor`：`/pages/moment-editor/index?sessionId=session-1781506784680-02d0a3&nodeType=private&visibility=private`。

本轮只读接口复核结果：

| 核验项 | 角色 / 样本 | 结果 | 备注 |
| --- | --- | --- | --- |
| 本地 API | `GET http://127.0.0.1:3221/api/v1/config/home` | HTTP 200，`code:0` | 本地服务已恢复，可进入本地接口只读复核 |
| host timeline | host `user-1781506784332-e605eb` | HTTP 200，`code:0`，`nodeCount=5` | private 节点为占位，无正文、无图片 |
| memberA timeline | memberA `user-1781506784333-1e0ef8` | HTTP 200，`code:0`，`nodeCount=5` | private 节点可见正文和图片；上传者视角可读 |
| memberB timeline | memberB `user-1781506784333-dcdcd4` | HTTP 200，`code:0`，`nodeCount=5` | private 节点可见正文和图片；接收者视角可读 |
| outsider timeline | outsider `user-1781506784334-d22d78` | HTTP 403，`code:403` | 非本局/非授权账号不能读取 timeline |
| brief | `brief-1781506784708-27d5b341` | HTTP 200，`code:0`，`nodeCount=5` | brief 中 private 节点为占位，无正文、无图片 |
| pending share task | `share-task-1781506784710-06d879ef` | HTTP 200，状态 `pending` | 只读可查 |
| ready share task | `share-task-1781506784711-94847106` | HTTP 200，状态 `ready` | 只读可查 |
| failed share task | `share-task-1781506784787-76bc5d8f` | HTTP 200，状态 `failed` | 只读可查 |
| expired share task | `share-task-it-moments-20260615-expired` | HTTP 404，`code:404` | 已按接口联调记录退回后端/API，不能作为通过证据 |

10-25 分钟三用户私密链路当前状态：

| 项目 | 记录 |
| --- | --- |
| 已能继续到哪一步 | 可继续到本地接口层权限复核：host/memberA/memberB/outsider token 均可用于只读判断，private moment `moment-1781506784703-82eee0ec` 的 memberB 可见、非成员 403、brief 私密占位已有接口摘要 |
| 未执行真机原因 | 当前线程仍无微信开发者工具控制能力、无体验版二维码、无真实设备信息、无 A/B/C 微信登录态注入记录；因此未执行微信开发者工具/体验版/真机链路，不能写通过 |
| 页面证据文件 | 未采集；等待前端/测试按前端清单提供 `FE-INT-DATA-001-DEV-M1-04-private-submit-memberA-<device>-20260615.mp4`、`FE-INT-DATA-001-DEV-M1-04-private-visible-memberB-<device>-20260615.png`、`FE-INT-DATA-001-DEV-M1-04-private-placeholder-outsider-<device>-20260615.png` |
| 当前结论 | 接口准备核验可继续；M1 三用户私密真机验收仍为阻塞/待执行，不得写通过 |

PM 下一步派工建议：

| 责任方 | 下一步 |
| --- | --- |
| 前端 | 提供微信开发者工具版本、体验版二维码或可操作预览、A/B/C 登录方式、设备信息，并按 `INT-DATA-001` 清单采集 M1 私密链路截图/录屏 |
| 接口联调 | 保持 `127.0.0.1:3221` 可访问，提供本轮只读接口响应摘要归档；确认真机如需访问本地数据时的 LAN IP/代理/不校验合法域名方案 |
| 后端/API | 修复或确认 expired share task `share-task-it-moments-20260615-expired` 返回 404 的处理口径；若第一小时必须覆盖 expired，需补真实可查样本 |
| PM | 明确是否开放微信开发者工具/体验版执行窗口、是否允许前端/测试使用本地 LAN/代理访问固定数据；未授权前测试侧不执行写入、不 cleanup、不线上验证 |

#### 13.15.5 expired 恢复后的接口层复核记录

记录时间：2026-06-15。记录范围仅限测试/验收侧接口层只读复核；不执行 cleanup，不做线上写入，不修改 PM 总台账，不替前端、接口联调或后端标记完成，不写真机通过。

本轮读取到当前 manifest 已更新为：

- `sessionId=session-1781507687012-e4343d`
- host `user-1781507686650-a33705`
- memberA `user-1781507686651-a46952`
- memberB `user-1781507686651-000860`
- outsider `user-1781507686651-093df4`
- private moment `moment-1781507687036-c0cc62cc`
- brief `brief-1781507687042-d1990edd`
- pending task `share-task-1781507687044-805585b3`
- ready task `share-task-1781507687046-d1098582`
- failed task `share-task-1781507687115-e4df874c`
- expired task `share-task-it-moments-20260615-expired`

注意：前端计划第 13 节的路径模板仍可用，但其中旧 `sessionId/profileId` 来自上一版 manifest；真机执行时必须使用本节当前 manifest ID，不得混用旧 ID。

本轮只读接口复核结果：

| 核验项 | 角色 / 样本 | 结果 | 测试侧结论 |
| --- | --- | --- | --- |
| 本地 API | `GET http://127.0.0.1:3221/api/v1/config/home` | HTTP 200，`code:0` | 接口层可继续 |
| host timeline | host `user-1781507686650-a33705` | HTTP 200，`code:0`，`nodeCount=5`；private 为占位，无正文、无图片 | 接口层权限符合预期 |
| memberA timeline | memberA `user-1781507686651-a46952` | HTTP 200，`code:0`，`nodeCount=5`；private 可见正文和图片 | 接口层权限符合预期 |
| memberB timeline | memberB `user-1781507686651-000860` | HTTP 200，`code:0`，`nodeCount=5`；private 可见正文和图片 | 接口层权限符合预期 |
| outsider timeline | outsider `user-1781507686651-093df4` | HTTP 403，`code:403` | 非成员/非授权读取被拒绝 |
| brief | `brief-1781507687042-d1990edd` | HTTP 200，`code:0`，`nodeCount=5`；private 为占位，无正文、无图片 | 接口层可继续 |
| pending share task | `share-task-1781507687044-805585b3` | HTTP 200，`status=pending` | 接口层可继续 |
| ready share task | `share-task-1781507687046-d1098582` | HTTP 200，`status=ready` | 接口层可继续 |
| failed share task | `share-task-1781507687115-e4df874c` | HTTP 200，`status=failed` | 接口层可继续 |
| expired share task | `share-task-it-moments-20260615-expired` | HTTP 200，`status=expired` | 旧 404 已复核恢复；接口层可继续 |

真机执行状态：

| 项目 | 记录 |
| --- | --- |
| 是否执行微信开发者工具/体验版/真机 | 未执行 |
| 未执行原因 | 当前线程仍无微信开发者工具控制能力、无体验版二维码、无真实设备信息、无 A/B/C 微信登录态注入记录，也未确认真机访问本地 `127.0.0.1:3221` 的 LAN/代理方案 |
| 是否可写通过 | 不能写通过；只能记录接口层可继续，`DEV-M1-03/04` 真机三用户链路仍待执行 |
| 缺少证据 | A 提交私密录屏、B 可见截图、C/outsider 占位或无权限截图、页面路径实际打开记录、设备/微信版本/开发者工具版本、对应接口摘要归档 |

PM 下一步派工建议：

| 责任方 | 下一步 |
| --- | --- |
| 前端 | 按当前 manifest ID 更新/确认进入路径，提供微信开发者工具版本、体验版二维码或可操作预览、A/B/C 登录方式和设备信息，采集 M1 私密链路截图/录屏 |
| PM | 明确真机执行窗口和本地数据访问方式；若允许真机访问本地数据，指定 LAN IP/代理/不校验合法域名策略和责任人 |
| 接口联调 | 将本轮服务恢复与 expired `status=expired` 的只读响应补入接口联调计划，保持 `127.0.0.1:3221` 可用，提供可复跑接口摘要 |

#### 13.15.6 真机执行前置条件复核

记录时间：2026-06-15。记录范围仅限测试/验收侧真机执行前置条件复核；不执行 cleanup，不做线上写入，不修改 PM 总台账，不替前端或接口联调标记完成，不写真机通过。

| 前置项 | 当前证据 | 测试侧判断 |
| --- | --- | --- |
| 微信开发者工具安装 | PM 只读核查路径：`D:\wechatkaifa\微信web开发者工具\微信开发者工具.exe`；本轮 `Test-Path` 返回 `True` | 工具文件存在 |
| 微信开发者工具 CLI | PM 只读核查路径：`D:\wechatkaifa\微信web开发者工具\cli.bat`；本轮 `Test-Path` 返回 `True` | CLI 文件存在 |
| CLI 自动化 | PM 只读核查：`cli.bat --help` 可用，但 `cli.bat islogin --project F:\codexlist\jiuzhuopanguan` 与 `cli.bat open --project F:\codexlist\jiuzhuopanguan` 均超时 | 不能作为自动验收通过证据 |
| 小程序项目 | PM 只读核查：项目根目录 `F:\codexlist\jiuzhuopanguan`；appid `wxe67ede146a5a91db` | 可作为人工 GUI/体验版准备信息 |
| 候选 LAN API | `http://192.168.0.101:3221/api/v1`；本轮只读访问 `GET /config/home` 返回 HTTP 200、`code:0` | LAN API 候选可用，但真机是否可访问仍需设备实测 |
| 真机/体验版条件 | 当前线程未取得体验版二维码、真机设备、设备微信版本、A/B/C 微信登录态或登录注入方式 | 条件不满足，不能启动完整真机验收 |

当前执行判断：

| 项目 | 结论 |
| --- | --- |
| 是否能进入真机验收 | 只能进入人工执行准备；不能由当前线程自动完成真机验收 |
| 是否执行 M1 私密链路真机 | 未执行 |
| 未执行原因 | 当前线程无法稳定控制微信开发者工具 GUI，CLI 登录/打开已由 PM 只读核查为超时；未取得体验版二维码、设备、A/B/C 登录态和录屏/截图采集条件 |
| 是否可写通过 | 不可写通过；`DEV-M1-03/04` 仍为真机阻塞/待执行 |

PM 下一步派工建议：

| 责任方 | 下一步 |
| --- | --- |
| PM | 指定人工 GUI/体验版执行窗口，确认是否允许使用候选 LAN API `http://192.168.0.101:3221/api/v1` 和“不校验合法域名”设置 |
| 前端/测试执行人 | 使用微信开发者工具 GUI 或体验版二维码打开当前 manifest 对应页面，提供工具版本、设备型号、微信版本、A/B/C 登录态、截图/录屏文件 |
| 接口联调 | 保持 `192.168.0.101:3221` 与 `127.0.0.1:3221` 同步可用，提供真机访问失败时的排障支持和接口摘要归档 |

#### 13.15.7 微信开发者工具 GUI / 体验版执行尝试记录

记录时间：2026-06-15。记录范围仅限测试/验收侧尝试进入 `DEV-M1-03/04` 真机或微信开发者工具执行；不执行 cleanup，不做线上写入，不修改 PM 总台账，不写真机通过。

PM 本轮给出的只读证据已纳入测试侧判断：

- 线上只读：`https://api.pomer.cn/api/v1/config/home`、`config/points`、`config/templates` 均 HTTP 200 / `code:0`；`/admin` 302，`/admin/login` 200；未写线上。
- 本地只读：`127.0.0.1:3221` TCP 可通；`127.0.0.1:3221/api/v1/config/home` 与 `http://192.168.0.101:3221/api/v1/config/home` 均 HTTP 200。
- 当前 manifest：`session-1781507687012-e4343d`；host `user-1781507686650-a33705`；memberA `user-1781507686651-a46952`；memberB `user-1781507686651-000860`；outsider `user-1781507686651-093df4`；expired task `share-task-it-moments-20260615-expired`；warnings 为 0。
- 本地接口层：host/memberA/memberB timeline 200，outsider timeline 403，brief 200，pending/ready/failed/expired 四态 share task 均 200 且状态正确。

本轮 GUI / 体验版尝试结果：

| 项目 | 结果 |
| --- | --- |
| Windows GUI 控制工具 | 当前线程尝试初始化 Windows Computer Use，初始化失败，错误原文：`Package subpath './dist/project/cua/sky_js/src/targets/windows/internal/computer_use_client_base.js' is not defined by "exports" in C:\Users\Administrator\AppData\Local\OpenAI\Codex\runtimes\cua_node\789504f803e82e2b\bin\node_modules\@oai\sky\package.json` |
| 微信开发者工具 CLI | PM 已核查 `cli.bat --help` 可用，但 `islogin/open` 超时；本轮不再用 CLI 超时结果冒充自动验收 |
| 体验版二维码 | 未取得 |
| 真机设备与微信版本 | 未取得 |
| A/B/C 登录态 | 未取得 host/memberA/memberB/outsider 对应微信登录态或登录注入方式 |
| 合法域名 / LAN / 代理 | 候选 LAN API `http://192.168.0.101:3221/api/v1` 可只读访问，但未取得真机侧不校验合法域名设置、代理或设备实测截图 |
| M1 私密链路 | 未执行；无 A 提交私密录屏、B 可见截图、C/outsider 占位或无权限截图 |

当前测试结论：

- 接口层和 LAN API 条件支持继续人工真机准备。
- 当前线程未能实际控制微信开发者工具 GUI，也未取得体验版、设备、登录态和截图/录屏条件。
- `DEV-M1-03/04` 仍保持真机阻塞/待执行；不得写通过。

PM 下一步派工建议：

| 责任方 | 下一步 |
| --- | --- |
| PM | 指定人工执行人或提供可控制的微信开发者工具 GUI 会话；确认是否允许真机使用 `http://192.168.0.101:3221/api/v1` 与不校验合法域名 |
| 前端/测试执行人 | 打开 `/pages/live-record/index?sessionId=session-1781507687012-e4343d` 与 `/pages/moment-editor/index?sessionId=session-1781507687012-e4343d&nodeType=private&visibility=private`，采集 A 提交、B 可见、C/outsider 占位或 403 的截图/录屏 |
| 接口联调 | 保持本地 3221 与 LAN 3221 可用，配合提供 A/B/C/outsider 接口摘要，供真机截图关联 |

#### 13.15.8 人工真机执行包 / 阻塞复核包

记录时间：2026-06-15。记录范围仅限测试/验收侧人工执行准备；不执行 cleanup，不做线上写入，不触碰 `pomer.cn`，不修改 PM 总台账，不替前端、接口联调、UGC 风控或 UI/UX 标记完成。没有真实截图/录屏、设备信息、入口路径和接口摘要时，不得写通过。

适用任务：

- `DEV-M1-03`：瞬间编辑页上传、失败态、重复提交与授权状态。
- `DEV-M1-04`：A 发私密给 B，B 可见正文/图片，C 或 outsider 只能看到占位/无权限。
- `UGC-QA-001`：私密可见范围不泄露。
- `UGC-QA-002`：非本局成员不可作为 `visibleProfileIds`。
- `UGC-QA-003`：分享图不得包含 private/hidden/needs_media/未授权节点。

##### 13.15.8.1 前置检查

| 检查项 | 当前应填写 / 使用 | 未满足时记录 |
| --- | --- | --- |
| 小程序项目 | `F:\codexlist\jiuzhuopanguan`，appid `wxe67ede146a5a91db` | 记录开发者工具无法打开项目的错误、截图或超时命令 |
| 执行方式 | 人工微信开发者工具 GUI / 体验版二维码 / 真机预览 | 缺 GUI、缺体验版二维码、缺预览二维码、缺设备时写阻塞 |
| API base | 本地同网/代理仅可使用 `http://192.168.0.101:3221/api/v1`；开发者工具本机调试可使用 `http://127.0.0.1:3221/api/v1` | 手机不在同网、代理不可用、未开启不校验合法域名时写阻塞 |
| 上线前 API base | 必须回到 `https://api.pomer.cn/api/v1` | 本地 LAN base 不得作为上线或线上验收通过依据 |
| 固定 session | `session-1781507687012-e4343d` | 如页面或接口仍使用旧 `session-1781506784680-02d0a3`，本轮作废 |
| 设备信息 | 设备型号、系统版本、微信版本、网络、开发者工具版本 | 任一缺失时不能写通过 |
| 登录态 | host、memberA、memberB、outsider/C 四个角色必须能区分记录 | 同一微信号反复切角色不能替代三用户私密验收 |
| 证据目录 | 建议 `docs/runtime/evidence/INT-DATA-001/20260615-m1-ugc/` | 若目录未建，记录实际存放路径；不得只写“见截图” |

##### 13.15.8.2 当前 manifest 角色与样本

token 仅限本地 `INT-DATA-001` 接口摘要和人工真机排障使用，不得提交到线上、不得用于 `api.pomer.cn` 写操作。

| 角色 | profileId | token | 主要用途 |
| --- | --- | --- | --- |
| host | `user-1781507686650-a33705` | `975eb90e27c89f9738be0988e084533ab07a597da9f69589` | 判官入口、host timeline、brief/任务只读摘要 |
| memberA | `user-1781507686651-a46952` | `b1dcef1962aca3173119369e37a4502ea01511a09b36b0b6` | 上传者，执行 `DEV-M1-03/04` |
| memberB | `user-1781507686651-000860` | `e3be94e1130c5cf16879635ff665f19c6f7b1d83d5d48f60` | 私密接收者，复核正文/图片可见 |
| outsider/C | `user-1781507686651-093df4` | `b984607ecb362e66510179b9cc27a66ed06ec6d993281c81` | 非成员/非接收者，复核占位或 403 |

| 样本 | ID |
| --- | --- |
| private moment | `moment-1781507687036-c0cc62cc` |
| brief | `brief-1781507687042-d1990edd` |
| hidden / failed candidate | `moment-1781507687039-ee0677bb` |
| ready share task | `share-task-1781507687046-d1098582` |
| failed share task | `share-task-1781507687115-e4df874c` |
| expired share task | `share-task-it-moments-20260615-expired` |

##### 13.15.8.3 页面路径

| 场景 | 页面路径 |
| --- | --- |
| host 当前酒局 | `/pages/live-record/index?sessionId=session-1781507687012-e4343d&role=host` |
| memberA 当前酒局 | `/pages/live-record/index?sessionId=session-1781507687012-e4343d&role=member` |
| memberB 当前酒局 | `/pages/live-record/index?sessionId=session-1781507687012-e4343d&role=member` |
| outsider/C 当前酒局 | `/pages/live-record/index?sessionId=session-1781507687012-e4343d&role=member` |
| memberA 私密编辑 | `/pages/moment-editor/index?sessionId=session-1781507687012-e4343d&nodeType=private&visibility=private` |
| 分享任务预览 | `/pages/share-poster/index?taskId=share-task-1781507687046-d1098582`，或用 `briefId=brief-1781507687042-d1990edd` 进入后选择 ready 任务 |

##### 13.15.8.4 截图/录屏命名

| 用例 | 角色 | 文件名 |
| --- | --- | --- |
| `DEV-M1-03` | memberA | `QA-DEV-M1-03-editor-initial-memberA-<device>-session-1781507687012-e4343d-20260615.png` |
| `DEV-M1-03` | memberA | `QA-DEV-M1-03-editor-save-private-memberA-<device>-session-1781507687012-e4343d-20260615.mp4` |
| `DEV-M1-03` | memberA | `QA-DEV-M1-03-duplicate-or-failed-memberA-<device>-session-1781507687012-e4343d-20260615.mp4` |
| `DEV-M1-04` / `UGC-QA-001` | memberA | `QA-DEV-M1-04-private-submit-memberA-<device>-session-1781507687012-e4343d-20260615.mp4` |
| `DEV-M1-04` / `UGC-QA-001` | memberB | `QA-DEV-M1-04-private-visible-memberB-<device>-moment-1781507687036-c0cc62cc-20260615.png` |
| `DEV-M1-04` / `UGC-QA-001` | outsider/C | `QA-DEV-M1-04-private-placeholder-outsider-<device>-moment-1781507687036-c0cc62cc-20260615.png` |
| `UGC-QA-002` | memberA | `QA-UGC-QA-002-member-picker-no-outsider-memberA-<device>-session-1781507687012-e4343d-20260615.png` |
| `UGC-QA-003` | memberA/host | `QA-UGC-QA-003-share-poster-ready-preview-<device>-share-task-1781507687046-d1098582-20260615.png` |
| 阻塞 | 测试执行人 | `QA-BLOCKER-M1-UGC-manual-device-or-login-missing-<owner>-20260615.md` |

##### 13.15.8.5 执行步骤与预期

| 顺序 | 用例 | 操作 | 预期结果 | 必须记录 |
| --- | --- | --- | --- | --- |
| 1 | 前置 | 打开微信开发者工具 GUI 或体验版，确认项目、appid、API base、设备和登录角色 | 项目可运行；API base 指向本地同网/代理或已说明；角色可区分 | 工具版本、二维码/预览来源、设备/微信版本、API base 截图 |
| 2 | `DEV-M1-03` | memberA 进入 `live-record`，点击“记精彩瞬间”或直接进入 private `moment-editor` | 普通成员可进入编辑页；非判官能力不出现 | 入口截图、页面路径、memberA profileId |
| 3 | `DEV-M1-03` | memberA 在私密编辑页不选成员直接保存 | 页面应阻止保存并提示选择可见成员 | 失败提示截图、无新增 moment 的接口摘要 |
| 4 | `DEV-M1-03` / `DEV-M1-04` | memberA 选择 memberB，上传图片和正文，保存私密瞬间 | 保存成功；返回 timeline 后 A 可见正文和图片；不重复创建 | 提交录屏、保存后 momentId、A timeline 摘要 |
| 5 | `DEV-M1-04` / `UGC-QA-001` | memberB 打开同一 `live-record` 并刷新 timeline | memberB 可见 A 发给 B 的私密正文和图片 | B 视角截图、B timeline 摘要、private momentId |
| 6 | `DEV-M1-04` / `UGC-QA-001` | outsider/C 打开同一 `live-record` 并刷新 timeline | C 只能看到私密占位，或非成员看到 403/无权限；不得出现正文、图片、完整接收名单 | C/outsider 截图、403 或 timeline 摘要、敏感字段检查 |
| 7 | `UGC-QA-002` | memberA 打开成员选择器，确认 outsider 不出现在可选成员中 | 前端不可选非本局成员 | 成员选择器截图、成员列表摘要 |
| 8 | `UGC-QA-002` | 接口联调或测试用 outsider profileId 强行提交 `visibleProfileIds` | 后端返回 400；不创建脏 moment | 非法请求体、400 响应、未写入证明 |
| 9 | `UGC-QA-003` | 打开 ready share task 或 share-poster 预览 | ready 图不包含 private/hidden/needs_media/未授权节点；仅展示服务端允许节点 | 预览截图、PNG 原图路径、selectedNodeIds 摘要 |
| 10 | 收口 | 汇总本轮通过、失败、阻塞，不改 PM 台账 | 只有证据齐全的步骤可写“已执行待复核”；缺证据写阻塞 | 执行摘要、证据文件清单、失败字段 |

##### 13.15.8.6 接口摘要模板

每个页面证据必须关联接口摘要；若人工执行人不能抓包，由接口联调负责人用同一 manifest token 补只读摘要。

```text
用例编号：
角色：
页面路径：
设备 / 微信版本 / 开发者工具版本：
sessionId：
profileId：
momentId / briefId / taskId：
API base：
请求：
HTTP status / code：
关键字段：
是否出现 caption：
是否出现 imageUrl：
是否出现 visibleProfileIds：
是否出现完整接收名单：
截图/录屏文件名：
结论：已执行待复核 / 失败 / 阻塞
阻塞原因：
下一步责任人：
```

##### 13.15.8.7 失败与阻塞记录字段

| 失败/阻塞类型 | 必填字段 | 退回对象 |
| --- | --- | --- |
| 缺 GUI | 开发者工具路径、打开方式、错误截图或错误原文、执行人 | PM / 前端 |
| 缺二维码 | 体验版或预览二维码生成时间、缺失原因、责任人 | PM / 前端 |
| 缺设备 | 设备型号、微信版本、网络、缺失原因 | PM / 测试执行人 |
| 缺登录态 | 缺哪个角色、微信号备注、profileId、无法登录原因 | PM / 前端 / 接口联调 |
| LAN/代理不可用 | 设备 IP、电脑 IP、API base、HTTP 错误、是否同网、是否开启不校验合法域名 | 接口联调 / PM |
| 页面打不开 | 页面路径、query、报错截图、控制台错误 | 前端 |
| 权限泄露 | 角色、截图/录屏、timeline 响应、泄露字段 | 后端/API / 前端 / UGC 风控 |
| 非本局成员可选或写入 | 选择器截图、非法请求体、响应、写入结果 | 前端 / 后端/API |
| 分享图泄露 | PNG 原图、预览截图、selectedNodeIds、泄露节点 ID | 后端/API / 前端 / UI/UX |

##### 13.15.8.8 当前阻塞复核结论

截至本节记录，接口层和 LAN API 已足够支撑人工执行准备，但当前测试线程仍未取得可实际验收的微信开发者工具 GUI、体验版二维码、设备、A/B/C 登录态和截图/录屏。因此本包可交给人工测试执行人开跑；在人工证据回收前，`DEV-M1-03`、`DEV-M1-04`、`UGC-QA-001`、`UGC-QA-002`、`UGC-QA-003` 均不能写通过。

### 13.16 聚会记录师改版真机问题与验收用例

记录时间：2026-06-15。依据 `docs/party-recorder-redesign-requirements.md` 与真机素材目录 `C:\Users\Administrator\Desktop\真机测试` 建立本节。范围仅限测试/验收职责：记录问题、建立用例、定义截图验收和失败判定；不改 PM 总台账，不替 UI/UX 或前端写通过，不移动、不删除原始素材。

#### 13.16.1 初始素材清单

素材只作为初始真机证据登记，后续如需裁剪、标注或转码，必须另存副本并保留原始文件。

| 文件名 | 类型 | 大小 bytes | 分辨率 | 记录时间 |
| --- | --- | ---: | --- | --- |
| `微信图片_20260615204247_170_528.jpg` | jpg | 184735 | 1179x2556 | 2026-06-15 20:44:11 |
| `微信图片_20260615204248_171_528.jpg` | jpg | 184172 | 1179x2556 | 2026-06-15 20:44:11 |
| `微信图片_20260615204248_172_528.jpg` | jpg | 217433 | 1179x2556 | 2026-06-15 20:44:11 |
| `微信图片_20260615204249_173_528.jpg` | jpg | 159150 | 1179x2556 | 2026-06-15 20:44:11 |
| `微信图片_20260615204250_174_528.jpg` | jpg | 192498 | 1179x2556 | 2026-06-15 20:44:11 |
| `微信图片_20260615204251_175_528.jpg` | jpg | 166805 | 1179x2556 | 2026-06-15 20:44:11 |
| `微信图片_20260615204251_176_528.jpg` | jpg | 140070 | 1179x2556 | 2026-06-15 20:44:11 |
| `微信图片_20260615204252_177_528.jpg` | jpg | 142697 | 1179x2556 | 2026-06-15 20:44:11 |
| `微信图片_20260615204253_178_528.jpg` | jpg | 145713 | 1179x2556 | 2026-06-15 20:44:11 |
| `微信图片_20260615204254_179_528.jpg` | jpg | 156803 | 1179x2556 | 2026-06-15 20:44:11 |
| `微信图片_20260615204254_180_528.jpg` | jpg | 101808 | 810x1440 | 2026-06-15 20:44:11 |
| `微信图片_20260615204255_181_528.jpg` | jpg | 162087 | 1179x2556 | 2026-06-15 20:44:11 |
| `微信图片_20260615204256_182_528.jpg` | jpg | 179840 | 1179x2556 | 2026-06-15 20:44:11 |
| `微信图片_20260615204257_183_528.jpg` | jpg | 166217 | 1179x2556 | 2026-06-15 20:44:11 |
| `c74d35b89b8e2da0fb7a351403042d29.mp4` | mp4 | 7029637 | 待人工播放确认 | 2026-06-15 20:43:44 |

#### 13.16.2 已知问题与失败级别

| 编号 | 级别 | 素材证据 | 问题 | 测试失败判定 |
| --- | --- | --- | --- | --- |
| `PR-QA-P0-001` | P0 | `微信图片_20260615204251_176_528.jpg` | 底部主按钮文字和圆角区域超出右边界 | 375/390/414 任一宽度出现按钮文字截断、圆角出屏、按钮互相挤压，即判失败 |
| `PR-QA-P0-002` | P0 | `微信图片_20260615204250_174_528.jpg` | 模板卡片横向露半张并被底部按钮遮挡 | 任一宽度下用户不能完整识别当前选项，或底部固定按钮遮挡卡片主要内容，即判失败 |
| `PR-QA-P0-003` | P0 | 需求第 4 节 | 不能三步内创建聚会并进入拍照/上传 | 从首页开始超过 3 次核心点击仍不能到达拍照/上传，或玩法配置为必填，即判失败 |
| `PR-QA-P0-004` | P0 | 多张截图与旧需求 | 旧品牌文案仍默认占据新流程核心位置 | 首页、创建、邀请、拍照、记录/相册核心路径出现“酒桌判官 / 判官 / 欠酒 / 惩罚 / 裁判”作为主文案，即判失败；历史入口或兼容页需标注为旧功能 |
| `PR-QA-P0-005` | P0 | 用户最新反馈 | 创建/拍照/分享核心路径中，底部 CTA、长按钮文案、横滑卡、Tab 或安全区出现溢出/遮挡 | 375/390/414 任一宽度下，关键 CTA 被截断、被安全区遮挡、Tab 挤出屏幕、横滑卡遮住主动作，导致无法继续创建/拍照/分享，即判 P0 |
| `PR-QA-P0-006` | P0 | 用户最新反馈 | 核心路径列表超过 5 项且无精选/更多/分组/搜索/二级页，阻断创建或拍照 | 用户必须滚动长列表才能完成创建、邀请、拍照或分享，且没有“精选/更多/分组/搜索/二级页”降噪机制，即判 P0 |
| `PR-QA-P0-007` | P0 | 用户最新反馈 | 核心路径单列大卡过厚重，遮蔽创建/拍照/分享主动作 | 首页、创建、拍照、分享核心路径首屏只能看到 1-2 项大卡，且主 CTA 不在首屏或被挤压/遮挡，即判 P0 |
| `PR-QA-P1-001` | P1 | `微信图片_20260615204248_172_528.jpg` | 热门模板单列卡过厚重，首屏只露一条半 | 375 宽首屏核心列表只露少于 2 条有效选项，或单卡高度超过首屏 35%，判失败 |
| `PR-QA-P1-002` | P1 | `微信图片_20260615204249_173_528.jpg` | 我的页统计卡堆叠，记录/分享任务下沉 | 首屏看不到“我的聚会 / 待处理聚会 / 继续记录”任一核心入口，判失败 |
| `PR-QA-P1-003` | P1 | `微信图片_20260615204247_170_528.jpg`、`微信图片_20260615204248_171_528.jpg` | 首页/工具箱被非核心工具占据 | 首页首屏未突出创建、加入、继续记录三类动作，工具箱占据主行动区，判失败 |
| `PR-QA-P1-004` | P1 | 多张截图 | 长列表未分组、未折叠、无法快速扫描 | 同一页面主列表超过 5 项仍连续单列堆叠，且无分组、折叠、横滑、搜索或二级页，判失败 |
| `PR-QA-P1-005` | P1 | 用户最新反馈 | 非核心路径列表超过 5 项且无精选/更多/分组/搜索/二级页 | 不直接阻断创建/拍照，但造成浏览效率明显下降，判 P1 并退回前端/UIUX |
| `PR-QA-P1-006` | P1 | 用户最新反馈 | 非核心路径单列大卡导致首屏只能看到 1-2 项 | 未遮蔽核心创建/拍照/分享动作，但信息密度过低、首屏扫描效率差，判 P1 |

#### 13.16.3 375 / 390 / 414 宽度截图验收规则

每个改版候选方案或前端修复包，至少提交以下宽度截图。截图可以来自微信开发者工具模拟器、真机或设计稿导出，但必须标注来源、宽度、高度、页面路径和版本。

| 宽度 | 用途 | 必测页面 |
| --- | --- | --- |
| 375px | 最小 iPhone 宽度兜底 | 首页、创建聚会第 1 步、邀请/二维码、拍照/上传、记录/相册、我的 |
| 390px | 主流 iPhone 宽度 | 首页、创建聚会第 1 步、邀请/二维码、拍照/上传、记录/相册 |
| 414px | 大屏手机宽度 | 首页、创建聚会第 1 步、邀请/二维码、拍照/上传、记录/相册 |

通用通过标准：

- 横向不得出现内容、按钮、圆角、阴影或图片主体超出安全区。
- 底部 CTA、长按钮文案、横滑卡、Tab、底部安全区在 375/390/414 下均不得溢出、截断、互相遮挡或遮住内容。
- 底部固定按钮必须预留安全区，不得遮挡正文、卡片、模板选择、Tab 或列表末项。
- 主要按钮最长文案在 375px 下完整显示；必要时换行，但不得压扁、重叠、截断或导致按钮超出父容器。
- 单个卡片不得吃掉首屏半屏以上；模板卡、统计卡、工具卡必须有最大高度或固定比例。
- 任一核心路径列表超过 5 项时，必须提供精选、更多、分组、搜索或二级页；如果阻断创建/拍照/分享，判 P0；不阻断但影响浏览效率，判 P1。
- 单列大卡导致首屏只能看到 1-2 项时必须判失败；遮蔽创建/拍照/分享主动作判 P0，非核心路径判 P1。
- 首页首屏只服务创建聚会、加入聚会、继续记录；工具箱、积分、合作商户、玩法介绍不得占主视觉。
- 新增或改版主流程文案统一使用“聚会记录师 / 聚会 / 记录 / 相册 / 分享 / 回忆 / 好友”，不得默认使用旧品牌和裁判、欠酒、惩罚类文案。

截图命名：

```text
PR-QA-<用例编号>-<页面>-<宽度>-<来源>-<版本或日期>.png
示例：PR-QA-P0-001-create-party-375-devtools-20260615.png
```

#### 13.16.4 改版验收用例

| 用例编号 | 覆盖问题 | 操作 | 预期 | 必须证据 |
| --- | --- | --- | --- | --- |
| `PR-QA-001` | 元素超边界 | 在 375/390/414 打开创建、模板选择、邀请、记录页，检查底部按钮和横向卡片 | 无按钮/卡片/文字/圆角超出；底部按钮不遮挡内容 | 三宽度截图，标注问题框或说明无问题 |
| `PR-QA-002` | 长列表 | 打开首页、创建流程、工具箱、模板列表、我的页，统计首屏和列表项 | 超过 5 项必须有精选/更多/分组/搜索/二级页；阻断创建/拍照/分享为 P0，非核心路径为 P1 | 三宽度截图，列表项数量记录，是否阻断主动作 |
| `PR-QA-003` | 厚重单列卡 | 打开首页、创建、热门模板、统计卡、工具卡页面 | 单卡高度受控；首屏不应只剩 1-2 项大卡；遮蔽创建/拍照/分享主动作判 P0，否则判 P1 | 三宽度截图，首屏可见项数量，主 CTA 是否可见 |
| `PR-QA-004` | 三步内创建并拍照 | 从首页开始执行：创建聚会 -> 默认主题/房间和邀请 -> 开始记录/拍第一张 | 3 次核心点击内到达拍照或上传；玩法配置不能必填 | 录屏、点击计数、页面路径、失败停留页 |
| `PR-QA-005` | 旧品牌文案 | 扫描首页、创建、邀请、拍照、记录/相册、我的 | 主流程不出现旧品牌主文案；旧功能入口必须降权或标注 | 三宽度截图，旧词命中清单 |
| `PR-QA-006` | 首页信息架构 | 打开首页首屏 | 创建聚会、加入聚会、继续记录三类动作优先；工具箱/积分/商户降权 | 三宽度首页截图，首屏行动项标注 |
| `PR-QA-007` | 邀请与分享 | 创建后进入邀请/二维码页，再进入拍照/上传 | 邀请方式明确，但不会阻断拍第一张；分享入口清晰 | 录屏、二维码/邀请页截图、拍照入口截图 |
| `PR-QA-008` | 记录/相册路径 | 拍照或上传后进入记录/相册 | 照片进入时间线/相册；分享页预览入口可见 | 录屏、记录页截图、相册/分享入口截图 |

#### 13.16.5 失败记录模板

```text
用例编号：
页面路径：
产品版本 / commit / 构建方式：
截图宽度：375 / 390 / 414
设备或模拟器：
证据文件：
问题分类：超边界 / 长列表 / 厚卡 / 三步失败 / 旧品牌 / 其他
实际表现：
预期表现：
是否 P0：
阻塞角色：前端 / UIUX / PM / 其他
下一步需要补的截图或录屏：
结论：失败 / 阻塞 / 待复测
```

#### 13.16.6 当前测试结论

当前素材已足够建立改版问题清单和验收用例，但不能证明 UI/UX 或前端已整改完成。`PR-QA-P0-001`、`PR-QA-P0-002`、`PR-QA-P0-003`、`PR-QA-P0-004` 均作为 P0 准出阻断项：任何一项在 375/390/414 截图或三步录屏中复现，第一阶段不得进入“改版方案可研发”结论。

#### 13.16.7 `add-players` / `create-session` P0 最小修复复拍要求

PM 已通知前端提交 `add-players` 和 `create-session` 两处 P0 最小修复。测试侧当前只登记复拍要求；未取得真机或微信开发者工具复拍截图前，不写通过，不替前端/UIUX 标记完成。

| 页面 / 流程 | 复拍文件名 | 宽度 | 必查点 | 失败判定 |
| --- | --- | --- | --- | --- |
| `create-session` 创建聚会入口 | `PR-QA-RETAKE-create-session-375-devtools-or-device-20260615.png` | 375 | 底部 CTA、长按钮文案、模板卡、Tab、安全区 | 任一元素溢出、截断、遮挡，或玩法配置仍阻断三步创建，判 P0 |
| `create-session` 创建聚会入口 | `PR-QA-RETAKE-create-session-390-devtools-or-device-20260615.png` | 390 | 同上 | 同上 |
| `create-session` 创建聚会入口 | `PR-QA-RETAKE-create-session-414-devtools-or-device-20260615.png` | 414 | 同上 | 同上 |
| `create-session` 三步创建录屏 | `PR-QA-RETAKE-create-session-three-step-<device>-20260615.mp4` | 真机或开发者工具 | 首页创建聚会 -> 默认主题/房间和邀请 -> 开始记录/拍第一张 | 超过 3 次核心点击、停在玩法配置、无法进入拍照/上传，判 P0 |
| `add-players` 添加成员页 | `PR-QA-RETAKE-add-players-375-devtools-or-device-20260615.png` | 375 | 底部 CTA、成员列表、长按钮、Tab、安全区 | CTA 被遮挡或列表阻断继续创建/邀请，判 P0；列表超过 5 项无精选/更多/搜索/分组，判 P1，若阻断继续创建则升 P0 |
| `add-players` 添加成员页 | `PR-QA-RETAKE-add-players-390-devtools-or-device-20260615.png` | 390 | 同上 | 同上 |
| `add-players` 添加成员页 | `PR-QA-RETAKE-add-players-414-devtools-or-device-20260615.png` | 414 | 同上 | 同上 |
| `add-players` 添加成员录屏 | `PR-QA-RETAKE-add-players-flow-<device>-20260615.mp4` | 真机或开发者工具 | 添加/跳过成员后能继续邀请或拍照 | 单列大卡或长列表遮蔽继续按钮、无法继续主流程，判 P0 |

复拍截图必须附带：页面路径、构建版本或 commit、设备/模拟器、宽度、高度、是否使用真机、是否开启安全区模拟。只有 375/390/414 三宽度和关键录屏均无 P0/P1 阻断，测试侧才能进入“待 PM/UIUX 复核”，仍不能直接写改版完成。

#### 13.16.8 `PR-QA-RETEST-001` 下一轮复拍执行表

记录时间：2026-06-15。前端 `PR-FE-UX-FIX-001` 已提交最终回报，并声明已通过 typecheck、编码检查和 diff check；测试侧进入复拍准备。本节只记录复拍状态，不写真机通过，不改 PM 总台账。

前端本轮改动范围必须纳入复拍：

- `index` 首页：quick tools / recent tools 默认收敛为 3 项，三列网格，最近列表防挤压。
- `tools` 工具箱：分类卡 3 项、热门 4 项、默认 5 项，搜索/分类最多 6 项，行高和缩略图降密。
- `judge/record`：互动卡 3 项，模板卡双列轻量化，两行截断。
- `me` 我的：统计 3 项、功能宫格三列、统计卡降高；同时检查 moment summaries / 分享图重试相关入口是否仍有越界、长列表、厚卡问题。
- `create-session`、`add-players`：沿用前一轮 P0 修复，继续复拍。

##### 13.16.8.1 复拍范围

| 页面 / 流程 | 页面标识 | 375 截图 | 390 截图 | 414 截图 | 录屏要求 | 当前状态 |
| --- | --- | --- | --- | --- | --- | --- |
| 首页 | `index` | `PR-QA-RETEST-001-index-375-<source>-<build>-20260615.png` | `PR-QA-RETEST-001-index-390-<source>-<build>-20260615.png` | `PR-QA-RETEST-001-index-414-<source>-<build>-20260615.png` | 不要求；如首页进入创建存在异常需补录屏 | 阻塞：缺 GUI/二维码/设备 |
| 工具箱 | `tools` | `PR-QA-RETEST-001-tools-375-<source>-<build>-20260615.png` | `PR-QA-RETEST-001-tools-390-<source>-<build>-20260615.png` | `PR-QA-RETEST-001-tools-414-<source>-<build>-20260615.png` | 不要求；如工具入口遮蔽主流程需补录屏 | 阻塞：缺 GUI/二维码/设备 |
| 记录入口 | `judge/record` | `PR-QA-RETEST-001-record-entry-375-<source>-<build>-20260615.png` | `PR-QA-RETEST-001-record-entry-390-<source>-<build>-20260615.png` | `PR-QA-RETEST-001-record-entry-414-<source>-<build>-20260615.png` | 如从首页跳转记录入口需补 `PR-QA-RETEST-001-record-entry-flow-<device>-<build>-20260615.mp4` | 阻塞：缺 GUI/二维码/设备 |
| 我的 | `me` | `PR-QA-RETEST-001-me-375-<source>-<build>-20260615.png` | `PR-QA-RETEST-001-me-390-<source>-<build>-20260615.png` | `PR-QA-RETEST-001-me-414-<source>-<build>-20260615.png` | 不要求；如核心记录/分享任务被挤压需补录屏 | 阻塞：缺 GUI/二维码/设备 |
| 创建聚会 | `create-session` | `PR-QA-RETEST-001-create-session-375-<source>-<build>-20260615.png` | `PR-QA-RETEST-001-create-session-390-<source>-<build>-20260615.png` | `PR-QA-RETEST-001-create-session-414-<source>-<build>-20260615.png` | 必须补 `PR-QA-RETEST-001-three-step-create-and-shoot-<device>-<build>-20260615.mp4` | 阻塞：缺 GUI/二维码/设备/登录态 |
| 添加成员 | `add-players` | `PR-QA-RETEST-001-add-players-375-<source>-<build>-20260615.png` | `PR-QA-RETEST-001-add-players-390-<source>-<build>-20260615.png` | `PR-QA-RETEST-001-add-players-414-<source>-<build>-20260615.png` | 必须补 `PR-QA-RETEST-001-add-players-continue-flow-<device>-<build>-20260615.mp4` | 阻塞：缺 GUI/二维码/设备/登录态 |

`<source>` 取值：`devtools`、`device`、`design`。`<build>` 必须填写前端提交的 commit、构建号或体验版时间；不能留空。

##### 13.16.8.2 核心路径录屏规则

| 录屏 | 起点 | 终点 | 失败判定 |
| --- | --- | --- | --- |
| 三步创建并拍第一张 | `index` 首页 | 拍照/上传页或真实拍照动作入口 | 超过 3 次核心点击、停在玩法配置、被长列表/厚卡/底部 CTA 阻断、无法进入拍照/上传，判 P0 |
| 添加成员后继续 | `add-players` | 邀请页、记录入口或拍照/上传页 | 成员列表过长、单列大卡过厚、CTA 被遮挡、无法继续主流程，判 P0 |

##### 13.16.8.3 复测状态表

状态只允许填写：`待前端提交`、`待截图`、`待录屏`、`阻塞`、`失败`、`通过`。当前前端 `PR-FE-UX-FIX-001` 已提交，但测试侧未取得微信开发者工具 GUI、体验版二维码、设备/微信版本、账号/登录态和截图/录屏，因此登记为 `阻塞`；不得写真机通过。

| 问题编号 | 复测页面 | 必须证据 | 当前状态 | 备注 |
| --- | --- | --- | --- | --- |
| `PR-QA-P0-001` | `create-session`、`add-players` | 375/390/414 截图；底部 CTA 近景或标注 | 阻塞 | 底部主按钮不得超边界；缺截图条件 |
| `PR-QA-P0-002` | `create-session` | 375/390/414 截图；模板卡区域标注 | 阻塞 | 横滑卡不得露半张或被遮挡；缺截图条件 |
| `PR-QA-P0-003` | `index` -> `create-session` -> 拍照/上传 | 三步创建并拍第一张录屏 | 阻塞 | 玩法配置不得必填；缺录屏和登录态 |
| `PR-QA-P0-004` | `index`、`tools`、`judge/record`、`me`、`create-session`、`add-players` | 三宽度截图；旧品牌词命中清单 | 阻塞 | 核心路径不得默认出现旧品牌主文案；缺截图条件 |
| `PR-QA-P0-005` | `index`、`judge/record`、`create-session`、`add-players` | 三宽度截图；CTA/Tab/安全区标注 | 阻塞 | 核心路径 CTA、长按钮、Tab、安全区不得溢出/遮挡；缺截图条件 |
| `PR-QA-P0-006` | `create-session`、`add-players` | 三宽度截图；列表项数量；是否有精选/更多/分组/搜索/二级页 | 阻塞 | 长列表阻断创建/拍照即 P0；缺截图和录屏条件 |
| `PR-QA-P0-007` | `index`、`create-session`、`add-players` | 三宽度截图；首屏可见项数量；主 CTA 可见性 | 阻塞 | 单列大卡遮蔽主动作即 P0；缺截图条件 |
| `PR-QA-P1-005` | `tools`、`me`、非核心列表页 | 三宽度截图；列表项数量；降噪机制 | 阻塞 | 非核心长列表无降噪为 P1；缺截图条件 |
| `PR-QA-P1-006` | `tools`、`me`、模板/统计类非核心区 | 三宽度截图；首屏可见项数量 | 阻塞 | 非核心单列大卡只露 1-2 项为 P1；缺截图条件 |

##### 13.16.8.4 前端提交前测试侧可准备事项

- 保持本节复拍文件名和失败判定规则。
- 准备截图核对表，不提前写结论。
- 前端已提供 `PR-FE-UX-FIX-001` 最终回报，测试侧下一步只等截图/录屏执行条件。
- 若 PM 或前端补齐 GUI、体验版二维码、真机设备、微信版本或登录态，可将对应状态从 `阻塞` 改为 `待截图` 或 `待录屏`。
- 当前缺执行条件，只能写阻塞，不得写通过。

##### 13.16.8.5 仍缺执行条件

| 缺口 | 责任方 | 影响 |
| --- | --- | --- |
| `PR-FE-UX-FIX-001` commit / 构建号 | 前端 | PM 已通知前端提交最终回报；测试复拍时仍需在证据中写明具体 commit / 构建号 |
| 微信开发者工具 GUI 或体验版二维码 | 前端 / PM | 无法采集真机或开发者工具截图 |
| 375/390/414 三宽度模拟或设备 | 测试执行人 / PM | 无法完成宽度矩阵 |
| 真机设备型号、系统版本、微信版本 | 测试执行人 | 录屏和截图不可追溯 |
| 创建并拍照所需账号/登录态 | 前端 / PM | 三步创建与拍第一张无法闭环 |

#### 13.16.9 `PR-QA-ASSET-001` 视觉资产验收规则

记录时间：2026-06-15。PM 已授权 UI/UX 负责人直接生成设计图、切图、按钮、空态、背景、贴纸等资产。本节只建立测试/验收规则；不改 PM 总台账，不写真机通过。`PR-UX-ASSET-001` 首版资产包已回收，实体目录为 `docs/design-assets/party-recorder/`；当前只登记资产到位和待测状态，不代表前端已集成。

##### 13.16.9.1 资产验收维度

| 维度 | 验收要求 | 失败判定 | 当前状态 |
| --- | --- | --- | --- |
| 资源是否加载 | 小程序页面、预览图、按钮、空态、背景、贴纸均能在开发者工具/真机加载，不出现 404、空白、闪烁或占位错误 | 任一核心页面资源丢失、路径错误、白屏或加载失败，判失败；阻断首页/创建/拍照判 P0 | 待资产回收 / 待截图 |
| 尺寸是否清晰 | 1x/2x/3x 或等价高清资源清晰，关键按钮和贴纸边缘不糊，不因拉伸变形 | 375/390/414 任一宽度下出现明显模糊、变形、锯齿，影响识别或点击，判失败 | 待资产回收 / 待截图 |
| 包体风险 | UI/UX 需提供资产大小清单；前端集成后需给分包/主包体积变化 | 未提供大小清单；单张非必要位图过大；主包或分包接近/超过小程序限制且无压缩方案，判阻塞或失败 | 待资产回收 |
| 按钮状态完整 | 主按钮、次按钮、图标按钮需覆盖默认、按下/点击、禁用、加载中、错误/失败态 | 核心 CTA 缺禁用/加载/失败态，或状态间视觉不可区分，判失败；阻断创建/拍照判 P0 | 待资产回收 / 待截图 |
| 暗/亮背景对比度 | 文字、图标、按钮在亮色、多巴胺、深色图片、渐变或贴纸背景上均可读 | 主要文案、按钮文字或图标低对比不可读；亮/暗背景切换后无法识别，判失败 | 待资产回收 / 待截图 |
| 375/390/414 越界 | 资产、背景、贴纸、按钮和插画在三宽度下不横向溢出，不遮挡 CTA、Tab、安全区 | 任一宽度出现贴纸/插画/按钮越界、遮挡底部 CTA 或 Tab，判失败；阻断主流程判 P0 | 待资产回收 / 待截图 |
| 命名一致性 | 文件名、图层名、页面文案和导出清单统一使用“聚会记录师 / party-recorder / party / record / album / share”等新命名 | 新增资产默认使用“酒桌判官 / judge / punish / debt / wine judge”等旧心智命名，判失败；历史兼容资源需标注 legacy | 待资产回收 |
| 风格一致性 | 设计图、切图、贴纸、按钮和空态需属于同一视觉方向，不能混用旧酒桌判官风格 | 核心路径出现风格断裂、旧插画和新贴纸混搭导致品牌不统一，判失败 | 待资产回收 / 待截图 |

##### 13.16.9.2 UI/UX 资产清单回收记录

已回收文件只作为设计参考或切图来源；前端集成截图、包体评估、按钮状态截图未到位前，不能写通过。

| 资产类型 | 文件名 | 尺寸 | 文件大小 | 使用页面 | 状态覆盖 | 命名检查 | 当前状态 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 5 屏目标设计图 `PR-UX-ASSET-001-A` | `pr-ux-asset-001-a-five-screen-target.png` | 1693x929 | 1443000 bytes | 首页 / 创建聚会 / 邀请二维码 / 拍照上传 / 记录相册 | 不适用 | 文件名符合 `party-recorder` 新方向；页面文案需前端复刻后再查 | 已回收；可作为复刻验收参考，不能直接写前端通过 |
| CTA 状态规范 `PR-UX-ASSET-001-B` | `pr-ux-asset-001-b-cta-states.png` | 1024x1536 | 1458477 bytes | 创建 / 拍照 / 分享主按钮 | 默认 / 按下 / 禁用 / 加载 | 文件名符合资产编号；状态需前端实现截图验证 | 已回收；可作为按钮复刻验收参考，不能直接入包判通过 |
| 空态/加载/错误贴纸板 `PR-UX-ASSET-001-C` | `pr-ux-asset-001-cd-empty-share-assets.png` | 1536x1024 | 1410118 bytes | 空相册 / 上传中 / 上传失败 / 权限拒绝 | 空态 / 加载 / 错误 / 重试 | 文件名为 C/D 共用板；切图后需独立命名 | 已回收；需 UI/UX 切图、透明化、压缩后才能验收入包 |
| 分享页/相册背景素材板 `PR-UX-ASSET-001-D` | `pr-ux-asset-001-cd-empty-share-assets.png` | 1536x1024 | 1410118 bytes | 分享底图 / 相册背景 / 二维码页增强 | 亮背景 / 暗背景 / 分享底图 | 文件名为 C/D 共用板；切图后需独立命名 | 已回收；需 UI/UX 切图、压缩并标注二维码安全区后才能验收入包 |

##### 13.16.9.3 前端集成截图要求

UI/UX 资产集成到前端后，测试至少需要以下截图/录屏。未回收截图前只能写 `待截图` 或 `阻塞`。

| 页面 / 场景 | 必须截图 | 必查点 |
| --- | --- | --- |
| 首页 | 375/390/414 三宽度截图 | 背景、贴纸、主 CTA、Tab 不越界；“聚会记录师”命名一致 |
| 创建聚会 | 375/390/414 三宽度截图 | 按钮状态、模板/贴纸清晰度、底部安全区 |
| 邀请/二维码 | 375/390/414 三宽度截图 | 背景对比度、二维码/分享按钮不被贴纸遮挡 |
| 拍照/上传 | 375/390/414 三宽度截图和 1 段操作录屏 | 拍照/上传 CTA 状态完整，暗/亮背景可读 |
| 记录/相册 | 375/390/414 三宽度截图 | 空态、图片墙、分享入口不越界，长列表不厚重 |
| 我的/设置 | 375/390/414 三宽度截图 | 新命名一致，旧品牌文案不作为主视觉 |
| 按钮状态 | 状态拼图或逐状态截图 | 默认、点击、禁用、加载、失败态可区分 |

##### 13.16.9.4 当前结论

当前已回收 A/B/C-D 三个首版 PNG 资产文件和尺寸/大小信息。A/B 可作为前端复刻验收参考；C/D 仍需 UI/UX 切图、透明化、压缩、独立命名和二维码安全区标注后才能验收入包。尚未回收前端集成截图、按钮状态截图、包体变化或真机录屏，`PR-QA-ASSET-001` 不能写通过。

#### 13.16.10 `PR-QA-ASSET-FOLLOW-001` 资产接入后待测矩阵

记录时间：2026-06-15。前端已被派发 `PR-FE-ASSET-INTEGRATE-001`，UI/UX 已被派发 `PR-UX-ASSET-CUT-001`。测试侧等待资产切图和前端接入后复拍；没有前端实现截图/录屏前，状态只能为 `待前端提交`、`待截图` 或 `待录屏`，不得写通过。2026-06-15 PM 通知前端 `PR-FE-ASSET-INTEGRATE-001` 已最终回报，基础验证 `npm.cmd run typecheck`、`npm.cmd run check:encoding`、`git diff --check` 通过，主路径旧词扫描无命中；前端已把 UI/UX 切图试装到 `miniprogram/assets/party-recorder/`，新增资产合计 107917 bytes。测试侧仍未获得微信开发者工具 GUI 可控截图、体验版二维码、真机设备/微信版本和 A/B/C 登录态，因此页面矩阵从 `待前端提交` 更新为 `阻塞：待截图/待录屏`，不得写通过。

##### 13.16.10.1 页面复拍矩阵

| 页面 / 场景 | 375 截图 | 390 截图 | 414 截图 | 录屏 | 当前状态 |
| --- | --- | --- | --- | --- | --- |
| 首页 `index` | `PR-QA-ASSET-RETEST-001-index-375-<build>-20260615.png` | `PR-QA-ASSET-RETEST-001-index-390-<build>-20260615.png` | `PR-QA-ASSET-RETEST-001-index-414-<build>-20260615.png` | 如资产加载闪烁或首屏动效异常需补录屏 | 阻塞：待截图/待录屏，缺 GUI/二维码/设备/登录态 |
| 创建聚会 `create-session` | `PR-QA-ASSET-RETEST-001-create-session-375-<build>-20260615.png` | `PR-QA-ASSET-RETEST-001-create-session-390-<build>-20260615.png` | `PR-QA-ASSET-RETEST-001-create-session-414-<build>-20260615.png` | 需并入三步创建录屏 | 阻塞：待截图/待录屏，缺 GUI/二维码/设备/登录态 |
| 邀请/二维码 `invite-group` | `PR-QA-ASSET-RETEST-001-invite-group-375-<build>-20260615.png` | `PR-QA-ASSET-RETEST-001-invite-group-390-<build>-20260615.png` | `PR-QA-ASSET-RETEST-001-invite-group-414-<build>-20260615.png` | 分享底图/二维码安全区异常需补录屏 | 阻塞：待截图/待录屏，缺 GUI/二维码/设备/登录态 |
| 拍照/上传 `moment-editor` | `PR-QA-ASSET-RETEST-001-moment-editor-375-<build>-20260615.png` | `PR-QA-ASSET-RETEST-001-moment-editor-390-<build>-20260615.png` | `PR-QA-ASSET-RETEST-001-moment-editor-414-<build>-20260615.png` | `PR-QA-ASSET-RETEST-001-create-invite-first-photo-<device>-<build>-20260615.mp4` | 阻塞：待截图/待录屏，缺 GUI/二维码/设备/登录态 |
| 记录/相册 `live-record` / 相册入口 | `PR-QA-ASSET-RETEST-001-live-record-375-<build>-20260615.png` | `PR-QA-ASSET-RETEST-001-live-record-390-<build>-20260615.png` | `PR-QA-ASSET-RETEST-001-live-record-414-<build>-20260615.png` | 如 20 张照片或分享入口滚动异常需补录屏 | 阻塞：待截图/待录屏，缺 GUI/二维码/设备/登录态 |
| 我的页 `me` | `PR-QA-ASSET-RETEST-001-me-375-<build>-20260615.png` | `PR-QA-ASSET-RETEST-001-me-390-<build>-20260615.png` | `PR-QA-ASSET-RETEST-001-me-414-<build>-20260615.png` | 不要求；如状态入口被遮挡需补录屏 | 阻塞：待截图/待录屏，缺 GUI/二维码/设备/登录态 |

##### 13.16.10.2 状态与异常覆盖

| 覆盖项 | 必须证据 | 失败判定 | 当前状态 |
| --- | --- | --- | --- |
| 按钮默认态 | 默认态截图，至少覆盖创建、拍照、分享主 CTA | 视觉与 A/B 参考不一致、文字低对比、375 溢出 | 阻塞：待截图 |
| 按钮按下态 | 点击或按下态截图/短录屏 | 无反馈、跳变错位、按下态遮挡文字 | 阻塞：待截图/待录屏 |
| 按钮禁用态 | 无权限/未满足条件截图 | 禁用态与可点态不可区分，或仍可误点 | 阻塞：待截图 |
| 按钮加载态 | 创建中、上传中、分享生成中截图/录屏 | loading 与文案重叠、按钮宽度抖动、无法取消或无反馈 | 阻塞：待截图/待录屏 |
| 空态 | 空相册/无记录/无分享截图 | 空态贴纸模糊、旧品牌、无下一步 CTA | 阻塞：待截图 |
| 加载态 | 页面加载、照片加载、分享图加载截图/录屏 | 骨架/贴纸遮挡内容，长时间无状态 | 阻塞：待截图/待录屏 |
| 错误态 | 网络失败、资源加载失败截图 | 无可读错误说明，无重试入口，贴纸/背景影响可读性 | 阻塞：待截图 |
| 上传失败 | 上传失败截图/录屏 | 失败态不保留用户已选图/文案，重试入口不可见 | 阻塞：待截图/待录屏 |
| 权限拒绝 | 相机/相册权限拒绝截图 | 无引导或按钮文案不可读；权限拒绝后无法返回主流程 | 阻塞：待截图 |
| 分享底图二维码安全区 | 邀请/分享页截图，标注二维码和按钮安全区 | 背景/贴纸遮挡二维码、按钮或关键文案；二维码边距不足 | 阻塞：待截图 |
| 包体与资源加载 | 前端包体变化、资源路径、加载日志 | 缺包体说明；C/D 未切图压缩即整图入包；资源 404 | 待复核：PM 已提供新增资产合计 107917 bytes，仍缺真机加载日志 |

##### 13.16.10.3 测试执行入口与阻塞条件

测试执行入口：

1. 等 UI/UX 回收 `PR-UX-ASSET-CUT-001` 切图、压缩、独立命名和二维码安全区标注。
2. 等前端回收 `PR-FE-ASSET-INTEGRATE-001` commit / 构建号、资源路径、包体变化和页面截图。
3. 按第 13.16.10.1 页面矩阵收集 375/390/414 截图。
4. 按第 13.16.10.2 覆盖按钮状态、空态、加载、错误、上传失败、权限拒绝和分享二维码安全区。
5. 只在截图/录屏、资源清单、包体说明齐全后进入 `待 PM/UIUX 复核`；不得直接写通过。

阻塞条件：

| 阻塞项 | 责任方 | 影响 |
| --- | --- | --- |
| C/D 未切图、未压缩、未独立命名 | UI/UX | 不能验收入包，不能做包体判断 |
| 前端未提交资产接入 commit / 构建号 | 前端 | 无法确认复拍版本 |
| 缺 375/390/414 页面截图 | 前端 / 测试执行人 | 无法判断越界、清晰度和对比度 |
| 缺按钮状态截图 | 前端 | 无法验收默认/按下/禁用/加载 |
| 缺空态/加载/错误/上传失败/权限拒绝截图 | 前端 / 测试执行人 | 无法验收异常态资产 |
| 缺分享底图二维码安全区截图 | 前端 / UI/UX | 无法判断分享资产是否遮挡二维码和主 CTA |
| 缺包体变化说明 | 前端 | 无法判断超包体风险 |

#### 13.16.11 `PR-QA-ASSET-RETEST-001` 前端资产接入后复测记录

记录时间：2026-06-15。PM 通知前端 `PR-FE-ASSET-INTEGRATE-001` 已最终回报并通过基础验证：`npm.cmd run typecheck`、`npm.cmd run check:encoding`、`git diff --check` 通过，主路径旧词扫描无命中；前端资产已试装到 `miniprogram/assets/party-recorder/`，新增资产合计 107917 bytes。测试侧本轮仅更新复测准备和证据状态；未获得真实截图/录屏、设备信息、入口路径和接口摘要前，不得写通过。

##### 13.16.11.1 当前资产核对

| 资产 | 前端试装路径 | PM/前端状态 | 测试验收状态 | 缺少证据 |
| --- | --- | --- | --- | --- |
| `photo-guide` | `miniprogram/assets/party-recorder/party-recorder-photo-guide-sticker.png` | 已试装 | 阻塞：待 `moment-editor` 375/390/414 截图 | 拍照引导空态截图、三步录屏、资源加载日志 |
| `uploading` | `miniprogram/assets/party-recorder/party-recorder-uploading-sticker.png` | 已试装 | 阻塞：待上传中截图/录屏 | 上传中截图、弱网或上传耗时录屏、按钮 loading 状态 |
| `empty-album` | `miniprogram/assets/party-recorder/party-recorder-empty-album-sticker.png` | 已试装 | 阻塞：待 `live-record` / 相册空态截图 | 空相册截图、浅色/彩色背景边缘清晰度、旧词扫描截图 |
| `album-bg.webp` | `miniprogram/assets/party-recorder/party-recorder-album-bg.webp` | 已试装 | 阻塞：待真机 WebP 显示复核 | `live-record` / 相册入口 375/390/414 截图、资源加载日志 |
| `share-bg.webp` | `miniprogram/assets/party-recorder/party-recorder-share-bg.webp` | 已入包；分享页正式接入待前端下一轮 | 待接入：不得验收通过 | 邀请/二维码页截图、二维码安全区标注、前端接入说明 |
| 上传失败贴纸 | `miniprogram/assets/party-recorder/party-recorder-upload-failed-retry-sticker.png` | 已入包；失败态接入截图待补 | 待接入/待截图：不得验收通过 | 上传失败截图/录屏、草稿保留证据、重试入口截图 |

##### 13.16.11.2 复拍页面与文件名

| 页面 | 375 宽度 | 390 宽度 | 414 宽度 | 当前状态 |
| --- | --- | --- | --- | --- |
| `index` 首页 | `PR-QA-ASSET-RETEST-001-index-375-<build>-20260615.png` | `PR-QA-ASSET-RETEST-001-index-390-<build>-20260615.png` | `PR-QA-ASSET-RETEST-001-index-414-<build>-20260615.png` | 部分阻塞解除：390 设备和二维码截图已到；待扫码确认、微信版本、登录态、截图目录和 375/414 来源 |
| `create-session` 创建聚会 | `PR-QA-ASSET-RETEST-001-create-session-375-<build>-20260615.png` | `PR-QA-ASSET-RETEST-001-create-session-390-<build>-20260615.png` | `PR-QA-ASSET-RETEST-001-create-session-414-<build>-20260615.png` | 部分阻塞解除：390 设备和二维码截图已到；待扫码确认、微信版本、登录态、截图目录和 375/414 来源 |
| `invite-group` 邀请/二维码 | `PR-QA-ASSET-RETEST-001-invite-group-375-<build>-20260615.png` | `PR-QA-ASSET-RETEST-001-invite-group-390-<build>-20260615.png` | `PR-QA-ASSET-RETEST-001-invite-group-414-<build>-20260615.png` | 部分阻塞解除：390 设备和二维码截图已到；待扫码确认、微信版本、登录态、截图目录和 375/414 来源 |
| `moment-editor` 拍第一张 | `PR-QA-ASSET-RETEST-001-moment-editor-375-<build>-20260615.png` | `PR-QA-ASSET-RETEST-001-moment-editor-390-<build>-20260615.png` | `PR-QA-ASSET-RETEST-001-moment-editor-414-<build>-20260615.png` | 部分阻塞解除：390 设备和二维码截图已到；待扫码确认、微信版本、登录态、截图目录、375/414 来源和三步录屏 |
| `live-record` / 相册入口 | `PR-QA-ASSET-RETEST-001-live-record-375-<build>-20260615.png` | `PR-QA-ASSET-RETEST-001-live-record-390-<build>-20260615.png` | `PR-QA-ASSET-RETEST-001-live-record-414-<build>-20260615.png` | 部分阻塞解除：390 设备和二维码截图已到；待扫码确认、微信版本、登录态、截图目录和 375/414 来源 |
| `me` 我的 | `PR-QA-ASSET-RETEST-001-me-375-<build>-20260615.png` | `PR-QA-ASSET-RETEST-001-me-390-<build>-20260615.png` | `PR-QA-ASSET-RETEST-001-me-414-<build>-20260615.png` | 部分阻塞解除：390 设备和二维码截图已到；待扫码确认、微信版本、登录态、截图目录和 375/414 来源 |

##### 13.16.11.3 三步连续录屏要求

录屏文件名：`PR-QA-ASSET-RETEST-001-create-invite-first-photo-<device>-<wechatVersion>-<build>-20260615.mp4`。

必须连续覆盖：

1. 从首页或入口进入 `create-session`，三步内完成创建聚会。
2. 进入 `invite-group`，展示邀请/二维码区域，确认按钮、二维码和 `share-bg.webp` 待接入区域不被遮挡；如 `share-bg.webp` 尚未接入，记录为 `待接入`。
3. 进入 `moment-editor`，触发拍第一张/上传第一张，覆盖 `photo-guide` 初始态、`uploading` 上传中态；如上传失败可控，补录 `upload-failed-retry` 贴纸、草稿保留和重试入口。

失败判定：超过三步仍不能到拍照/上传入口、底部 CTA/Tab/安全区遮挡、375/390/414 任一宽度横向溢出、资产 404/模糊/边缘脏、仍出现旧品牌主文案、上传失败后草稿丢失，均不得进入通过。

##### 13.16.11.4 本轮阻塞记录

| 阻塞项 | 当前缺口 | 责任方 | 影响 |
| --- | --- | --- | --- |
| 微信开发者工具 GUI 或体验版入口 | 部分解除：已收到二维码截图，用户确认扫码后可正常打开 | PM / 用户 / 测试执行人 | 不能写通过，仍需等待新版页面截图/录屏 |
| 体验版二维码 | 部分解除：二维码截图已保存到 `docs/runtime/wechat-retest-evidence/wechat-preview-qr-20260615-2204.png`，用户确认扫码后可正常打开 | 用户 / 测试执行人 | 首轮入口已具备；新改动上线后仍需确认构建号和页面路径 |
| 真机设备与微信版本 | 部分解除：已提供 iPhone 12 / iOS 26.5 / 微信 8.0.73 / 390 宽；375/414 作为最终多宽度准出补测项保留 | 测试执行人 / PM / 用户 | 首轮不阻塞 iPhone 12 复拍；不能代表最终多宽度准出 |
| 账号/登录态 | 未提供可复用 A/B/C 或测试账号登录态 | PM / 前端 / 测试执行人 | 不能覆盖创建、邀请、拍照、相册和我的页 |
| 分享页正式接入 | `share-bg.webp` 已入包但分享页正式接入待前端下一轮 | 前端 `PR-FE-ASSET-CUT-INTEGRATE-001` | 不能验收二维码安全区 |
| 上传失败贴纸状态 | 失败态接入截图/录屏未回收 | 前端 / 测试执行人 | 不能验收上传失败和重试体验 |

##### 13.16.11.5 `PR-QA-ASSET-RETEST-001-BLOCKER` 部分证据登记

记录时间：2026-06-15 22:04。PM 补充用户已提供 iPhone 12 / iOS 26.5 和一张微信开发者工具预览/体验二维码截图；测试计划仅登记为“部分阻塞解除/仍待确认”，不得写通过。

| 项 | 已到证据 | 当前测试状态 | 仍缺证据 / 待确认 | 下一步责任方 |
| --- | --- | --- | --- | --- |
| 二维码入口 | `docs/runtime/wechat-retest-evidence/wechat-preview-qr-20260615-2204.png`；用户确认扫码后可正常打开 | 部分阻塞解除 | 新版线上构建号、页面路径、是否可进入 `index` / `create-session` / `invite-group` / `moment-editor` / `live-record` / `me` 的截图证据 | 用户 / 测试执行人 |
| 交接表 | `docs/runtime/wechat-devtools-retest-access.local.md` 已登记入口、设备、待复拍路径 | 部分阻塞解除 | 小程序 AppID、是否勾选“不校验合法域名”、API base、保存目录是否确认 | PM / 前端 / 测试执行人 |
| 设备 | iPhone 12 / iOS 26.5 / 微信 8.0.73 / 390 宽 | 部分阻塞解除 | 375 与 414 宽度来源作为最终准出补测；是否另有设备或开发者工具模拟宽度证据 | 用户 / 测试执行人 / PM |
| 登录态 | 无 | 阻塞 | A/B/C/outsider 登录态、profileId 或可扫码授权方式 | PM / 前端 / 测试执行人 |
| 截图/录屏目录 | 交接表建议 `C:\Users\Administrator\Desktop\真机测试\聚会记录师-复拍-20260615\` | 待确认 | 实际保存目录、文件命名是否按 13.16.11.2 和 13.16.11.3 执行 | 测试执行人 / PM |
| 验收结论 | 无真实页面截图/录屏 | 阻塞 | 首轮 iPhone 12 / 390 / 微信 8.0.73 的 6 页截图、三步连续录屏、资产加载截图、异常态截图；最终准出仍需 375/414 补测 | 测试执行人 / 前端 |

本轮结论：二维码和 390 设备信息让 `PR-QA-ASSET-RETEST-001` 具备人工尝试入口，但尚未形成验收证据。若二维码已过期或扫码失败，需要 PM / 前端重新提供有效二维码；若扫码成功，也必须按 13.16.11.2 与 13.16.11.3 回收截图/录屏后才能从阻塞改为待复核。

#### 13.16.12 `PR-QA-REDESIGN-FULL-RETEST-001` 完整改版复测规则与矩阵

记录时间：2026-06-15。PM 派发 `PR-QA-REDESIGN-FULL-RETEST-001`：用户要求前端完全抛弃旧样式框、按 UI 设计图复刻。测试侧本轮仅更新验收规则和待复拍矩阵；不得写真机通过或 UI 通过。2026-06-15 PM 同步前端 `PR-FE-REDESIGN-FULL-001` 已回收，PM 已复跑 `typecheck`、`check:encoding`、目标文件 `git diff --check`，并对主路径 WXML 扫描 `酒桌判官|欠酒|惩罚|判官|酒局|玩法|裁判` 无命中。测试侧登记为“可启动复拍准备”。2026-06-15 用户补充：微信版本为 8.0.73，扫码后可正常打开，首轮只先测 iPhone 12 / iOS 26.5 / 390 宽；截图和录屏等新改动上线后再给出。当前仍缺 A/B/C/outsider 登录态、新版线上构建号、页面截图和连续录屏；不得用前端自测或 PM 基础检查替代测试证据。

##### 13.16.12.1 P0 失败规则

任一主路径页面命中以下规则，`PR-QA-REDESIGN-FULL-RETEST-001` 直接判 `P0 失败`，退回前端 `PR-FE-REDESIGN-FULL-001`；测试侧只能登记失败证据，不替前端标完成。

| 失败项 | 判定规则 | 必须记录证据 | 退回对象 |
| --- | --- | --- | --- |
| 旧样式框残留 | 首页、创建聚会、邀请/二维码、拍照/上传、记录/相册、我的页仍保留旧“卡片套卡片”、灰底厚框、旧玩法工具框或明显旧版页面骨架 | 375/390/414 截图，标注页面路径和残留区域 | 前端负责人 |
| 旧品牌主标题 | 主路径标题、按钮、Tab、空态、分享文案仍以“酒桌判官/酒局/判官/惩罚/欠酒/裁判”等旧语义作为主要表达 | 截图和可见文案摘录；如是历史兼容入口需标注入口层级 | 前端负责人；如口径不清退 PM |
| 厚重单列长列表 | 核心路径列表超过 5 项且无精选/更多/分组/横滑/搜索/二级页；或单列大卡导致首屏只能看到 1-2 项并挤压创建/邀请/拍照主动作 | 首屏截图、滚动截图或录屏，记录样本数量 | 前端负责人 |
| 底部 CTA 越界/遮挡 | 375/390/414 任一宽度下底部 CTA、Tab、长按钮文案、横滑卡或安全区被遮挡、出屏、重叠、不可点击 | 对应宽度截图，必要时补点击录屏 | 前端负责人 |
| 三步路径不清 | 从首页创建聚会到拍第一张不能在三步内完成，或被玩法设置、长列表、等待参与者、登录态切换、说明页阻断 | 连续录屏，标注每一步点击和停顿位置 | 前端负责人；若账号缺失退 PM/测试执行人 |

##### 13.16.12.2 前端回收后的待复拍矩阵

状态只允许填写：`待前端提交`、`阻塞`、`待截图`、`待录屏`、`失败`、`待 UI/UX 复核`。没有真实截图/录屏、设备信息、页面路径和账号角色前，不得写通过。

| 页面 / 流程 | 375 截图 | 390 截图 | 414 截图 | 录屏要求 | 当前状态 |
| --- | --- | --- | --- | --- | --- |
| 首页 `index` | `PR-QA-REDESIGN-FULL-RETEST-001-index-375-<build>-20260615.png` | `PR-QA-REDESIGN-FULL-RETEST-001-index-390-iPhone12-wx8.0.73-<build>-20260615.png` | `PR-QA-REDESIGN-FULL-RETEST-001-index-414-<build>-20260615.png` | 如首屏动效、旧样式残留或主 CTA 可点击性异常，补录屏 | 首轮待上线后截图：只测 iPhone 12 / 390 / 微信 8.0.73；375/414 延后到最终多宽度准出 |
| 创建聚会 `create-session` | `PR-QA-REDESIGN-FULL-RETEST-001-create-session-375-<build>-20260615.png` | `PR-QA-REDESIGN-FULL-RETEST-001-create-session-390-iPhone12-wx8.0.73-<build>-20260615.png` | `PR-QA-REDESIGN-FULL-RETEST-001-create-session-414-<build>-20260615.png` | 必须并入三步连续录屏 | 首轮待上线后截图/录屏：只测 iPhone 12 / 390 / 微信 8.0.73；仍需登录态或扫码授权证据 |
| 邀请/二维码 `invite-group` | `PR-QA-REDESIGN-FULL-RETEST-001-invite-group-375-<build>-20260615.png` | `PR-QA-REDESIGN-FULL-RETEST-001-invite-group-390-iPhone12-wx8.0.73-<build>-20260615.png` | `PR-QA-REDESIGN-FULL-RETEST-001-invite-group-414-<build>-20260615.png` | 必须展示二维码/口令、安全区和 `拍第一张` CTA | 首轮入口已具备：扫码可打开；待新版线上构建二维码/口令截图和 iPhone 12 页面截图 |
| 拍照/上传 `moment-editor` | `PR-QA-REDESIGN-FULL-RETEST-001-moment-editor-375-<build>-20260615.png` | `PR-QA-REDESIGN-FULL-RETEST-001-moment-editor-390-iPhone12-wx8.0.73-<build>-20260615.png` | `PR-QA-REDESIGN-FULL-RETEST-001-moment-editor-414-<build>-20260615.png` | 必须覆盖拍第一张入口、photo guide、上传中；失败态另补录屏 | 首轮待上线后截图/录屏：只测 iPhone 12 / 390 / 微信 8.0.73；上传和权限状态仍需证据 |
| 记录/相册 `live-record` / 相册入口 | `PR-QA-REDESIGN-FULL-RETEST-001-live-record-375-<build>-20260615.png` | `PR-QA-REDESIGN-FULL-RETEST-001-live-record-390-iPhone12-wx8.0.73-<build>-20260615.png` | `PR-QA-REDESIGN-FULL-RETEST-001-live-record-414-<build>-20260615.png` | 20 张照片或长列表样本需补滚动录屏 | 首轮待上线后截图：只测 iPhone 12 / 390 / 微信 8.0.73；相册样本和长列表仍需证据 |
| 我的页 `me` | `PR-QA-REDESIGN-FULL-RETEST-001-me-375-<build>-20260615.png` | `PR-QA-REDESIGN-FULL-RETEST-001-me-390-iPhone12-wx8.0.73-<build>-20260615.png` | `PR-QA-REDESIGN-FULL-RETEST-001-me-414-<build>-20260615.png` | 如统计/功能入口仍厚重单列或旧品牌残留，补录屏 | 首轮待上线后截图：只测 iPhone 12 / 390 / 微信 8.0.73；最终准出仍需多宽度补测 |

##### 13.16.12.3 三步路径连续录屏

录屏文件名：`PR-QA-REDESIGN-FULL-RETEST-001-three-step-create-first-photo-iPhone12-wx8.0.73-<build>-20260615.mp4`。375/414 或其他设备补测时沿用同一格式替换设备和微信版本字段。

必须连续覆盖：

1. `index` 首页点击 `创建聚会` 或等价主 CTA。
2. `create-session` 完成创建并进入 `invite-group`，不得被玩法设置、厚卡列表或旧说明页阻断。
3. `invite-group` 点击 `拍第一张` 进入 `moment-editor` 并看到拍照/上传首态。

失败判定：路径超过三步、任一步主 CTA 不明显、需要先处理旧玩法/惩罚/判官配置、底部按钮遮挡、登录态无法区分角色、或录屏未显示设备/页面路径，均不得进入待 UI/UX 复核。

##### 13.16.12.4 当前缺口与阻塞

| 缺口 | 当前状态 | 责任方 | 影响 |
| --- | --- | --- | --- |
| 前端完整复刻实现 | 部分解除：`PR-FE-REDESIGN-FULL-001` 已回收，PM 基础验证和主路径旧词扫描无命中 | 前端负责人 / PM | 可启动复拍准备，但不能写测试通过 |
| 微信版本 | 已提供：iPhone 12 / iOS 26.5 / 微信 8.0.73 / 390 宽 | 用户 / 测试执行人 / PM | 首轮设备信息已具备；最终多设备仍需另补 |
| 扫码后可打开结果 | 已确认扫码后可正常打开；新改动上线后仍需确认对应线上构建号和页面路径 | 用户 / 测试执行人 / 前端 | 首轮入口已具备；不能替代页面截图/录屏 |
| A/B/C/outsider 登录态 | 未提供 | PM / 前端 / 测试执行人 | 不能覆盖创建、邀请、相册权限和异常视角 |
| 375/414 宽度来源 | 用户明确首轮只先测 iPhone 12 / 390 宽；375/414 延后补测 | PM / 测试执行人 | 首轮不阻塞 iPhone 12 复拍；最终准出仍不能缺失 |
| 新版截图/录屏 | 用户说明等新改动上线后给出；需按 13.16.12.2 页面矩阵和 13.16.12.3 三步录屏命名采集 | 测试执行人 / 前端 | 未回收前不能判 UI、真机或资产通过 |

本轮结论：`PR-QA-REDESIGN-FULL-RETEST-001` 已具备测试规则和待复拍矩阵，且前端 `PR-FE-REDESIGN-FULL-001` 已回收；微信 8.0.73 和扫码可打开两项已解除。测试侧首轮聚焦 iPhone 12 / iOS 26.5 / 390 宽，等待新改动上线后回收截图和三步连续录屏；A/B/C/outsider 登录态、截图/录屏、构建号和最终 375/414 补测未到位前，不得写通过。

#### 13.16.13 `PR-QA-ONLINE-IP12-CAPTURE-001` 首轮 iPhone 12 上线复拍采集清单

记录时间：2026-06-15。PM 派发 `PR-QA-ONLINE-IP12-CAPTURE-001`：前端将准备新改动上线复拍包；用户确认首轮只测 iPhone 12 / iOS 26.5 / 微信 8.0.73，扫码可打开。测试侧本节只准备采集清单和失败退回规则，不写真机通过。

##### 13.16.13.1 截图前必须记录

| 记录项 | 必填内容 | 缺失处理 |
| --- | --- | --- |
| 新版线上构建号或上传备注 | 前端上线包版本、上传时间、体验版/预览备注或 commit 摘要 | 缺失时截图只能登记为 `待版本确认`，不能用于准出 |
| 扫码入口 | 二维码来源、生成时间、是否扫码可打开、打开后首页路径 | 缺失时退 PM/前端补入口 |
| 设备信息 | iPhone 12 / iOS 26.5 / 屏幕宽度 390 | 缺失时退测试执行人补记录 |
| 微信版本 | 8.0.73 | 缺失时退测试执行人补记录 |
| 登录态 | A/B/C/outsider 或实际单登录态说明 | 缺 A/B/C/outsider 时只能做单登录态视觉和路径 P0 初判 |
| 保存目录 | 实际截图/录屏所在目录 | 缺失时退测试执行人补归档 |

##### 13.16.13.2 首轮必须回收文件

首轮只覆盖 iPhone 12 / iOS 26.5 / 390 宽 / 微信 8.0.73；375/414 仍保留为最终多宽度准出补测项。

| 页面 / 流程 | 必须回收文件名 | 关键检查点 | 当前状态 |
| --- | --- | --- | --- |
| 首页 `index` | `PR-QA-ONLINE-IP12-CAPTURE-001-index-390-iPhone12-wx8.0.73-<build>-20260615.png` | 旧壳、旧品牌主标题、首屏主 CTA、底部 Tab、安全区 | 待截图 |
| 创建聚会 `create-session` | `PR-QA-ONLINE-IP12-CAPTURE-001-create-session-390-iPhone12-wx8.0.73-<build>-20260615.png` | 三步路径是否清晰、模板/设置是否厚重单列、底部 CTA 是否遮挡 | 待截图 |
| 邀请/二维码 `invite-group` | `PR-QA-ONLINE-IP12-CAPTURE-001-invite-group-390-iPhone12-wx8.0.73-<build>-20260615.png` | 二维码/口令安全区、`拍第一张` CTA、邀请说明是否挤压 | 待截图 |
| 拍照/上传 `moment-editor` | `PR-QA-ONLINE-IP12-CAPTURE-001-moment-editor-390-iPhone12-wx8.0.73-<build>-20260615.png` | 拍第一张入口、photo guide、上传中/失败态入口、底部 CTA | 待截图 |
| 记录/相册 `live-record` / 相册入口 | `PR-QA-ONLINE-IP12-CAPTURE-001-live-record-390-iPhone12-wx8.0.73-<build>-20260615.png` | 空相册/已有照片布局、厚重单列、继续拍照入口、举报/隐私提示 | 待截图 |
| 历史/相册 `wine-history` 未登录/失效 token 回归 | `PR-QA-AUTH401-REGRESSION-001-wine-history-unauth-390-iPhone12-wx8.0.73-<build>-20260615.png`；`PR-QA-AUTH401-REGRESSION-001-wine-history-login-guide-390-iPhone12-wx8.0.73-<build>-20260615.png`；`PR-QA-AUTH401-REGRESSION-001-wine-history-auth-success-or-empty-390-iPhone12-wx8.0.73-<build>-20260615.png`；`PR-QA-AUTH401-REGRESSION-001-wine-history-console-390-iPhone12-wx8.0.73-<build>-20260615.png` | 未登录/失效 token 进入历史/相册页不能持续刷 `GET /reports/history?mode=host 401` 或 `GET /user/session-moment-summaries 401`；必须展示登录/空态/引导；控制台不能出现 `showLoading` 与 `hideLoading` 配对警告；登录后才能请求历史摘要 | 待截图/待控制台证据 |
| 我的页 `me` | `PR-QA-ONLINE-IP12-CAPTURE-001-me-390-iPhone12-wx8.0.73-<build>-20260615.png` | 统计/功能入口是否降重、旧品牌残留、长列表是否折叠 | 待截图 |
| 三步连续录屏 | `PR-QA-ONLINE-IP12-CAPTURE-001-three-step-create-first-photo-iPhone12-wx8.0.73-<build>-20260615.mp4` | 首页创建聚会 -> 创建页进入邀请 -> 邀请页拍第一张进入拍照/上传 | 待录屏 |

##### 13.16.13.2.1 `PR-QA-AUTH401-REGRESSION-001` 401 与 loading 配对回归

线上复拍暴露错误：

- `GET /reports/history?mode=host 401`
- `GET /user/session-moment-summaries 401`
- `wine-history index.ts:178 showLoading 与 hideLoading 必须配对使用`

验证标准：

1. 未登录或失效 token 进入 `wine-history` / 历史 / 相册页时，不能持续重复请求并刷 401。
2. 未登录状态必须展示登录、空态或明确引导，不能停留无限 loading。
3. 控制台不能出现 `showLoading` 与 `hideLoading` 必须配对使用的警告。
4. 登录后才能请求历史摘要；登录成功但无数据时，必须展示可用空态。

必须回收证据：

| 证据 | 文件名建议 | 当前状态 |
| --- | --- | --- |
| 未登录进入 `wine-history` 截图 | `PR-QA-AUTH401-REGRESSION-001-wine-history-unauth-390-iPhone12-wx8.0.73-<build>-20260615.png` | 待截图 |
| 登录/空态/引导截图 | `PR-QA-AUTH401-REGRESSION-001-wine-history-login-guide-390-iPhone12-wx8.0.73-<build>-20260615.png` | 待截图 |
| 登录后请求成功或可用空态截图 | `PR-QA-AUTH401-REGRESSION-001-wine-history-auth-success-or-empty-390-iPhone12-wx8.0.73-<build>-20260615.png` | 待截图 |
| 控制台无重复 401、无 loading 配对警告截图 | `PR-QA-AUTH401-REGRESSION-001-wine-history-console-no-repeat-401-no-loading-warning-390-iPhone12-wx8.0.73-<build>-20260615.png` | 待截图 |

当前结论：本回归项已纳入首轮 iPhone 12 / 390 采集清单，但未收到新版构建、登录态、页面截图或控制台截图前，不能写通过。

##### 13.16.13.3 登录态覆盖边界

若 A/B/C/outsider 登录态未到位，本轮只能覆盖：

1. 单登录态下 6 页视觉 P0 初判：旧壳、越界、厚重单列、底部 CTA 遮挡、旧品牌主文案。
2. 单登录态下三步路径 P0 初判：是否能从首页进入创建、邀请、拍第一张入口。
3. 资产基础显示初判：贴纸/背景是否明显 404、模糊、遮挡主动作。

不能覆盖：

1. A/B/C/outsider 权限差异。
2. 私密/公开、举报、审核、过滤、UGC 风控完整链路。
3. 多角色相册可见性、邀请权限、上传授权差异。
4. 完整验收通过或最终准出。

##### 13.16.13.4 失败退回规则

| 失败类型 | 例子 | 退回对象 | 处理要求 |
| --- | --- | --- | --- |
| 旧壳 / 旧品牌 / 越界 / 厚重单列 | 旧样式框残留、底部 CTA 遮挡、列表超过 5 项无收敛、单列大卡挤压主动作 | 前端负责人 | 前端修复后重新出上线复拍包 |
| 401 降级 / loading 配对警告 | 未登录或失效 token 进入 `wine-history` 持续刷 `GET /reports/history?mode=host 401`、`GET /user/session-moment-summaries 401`；控制台出现 `showLoading` 与 `hideLoading` 配对警告 | 前端负责人 | 前端修复 401 降级、请求触发条件和 loading 配对后重新复拍 |
| 接口合同不一致 | 前端按约定登录后请求历史摘要仍返回非预期 401、字段或状态合同与前端预期不一致 | 后端/API 或接口联调负责人 | 提供接口合同、可复跑响应和状态说明；测试侧不判接口通过 |
| 登录态缺失 | 无法区分未登录、失效 token、已登录 A/B/C/outsider 或无法触发登录后摘要请求 | PM / 测试执行人 | 补账号、登录态或扫码授权方式；缺失时只能做视觉和路径初判 |
| 截图/录屏缺失 | 缺页面、缺设备/微信版本、缺构建号、文件名不符合规则、录屏未覆盖三步 | 测试执行人 | 补拍或补记录；不能用口头说明替代 |
| 隐私 / 举报 / 授权 / 过滤问题 | 举报入口不可见、公开分享过滤说明缺失、上传授权不清、私密提示不清 | UGC 风控负责人，同步前端 | UGC 复核规则和前端表现同时补证据 |
| 设计规格问题 | 与 UI 设计图差异过大、CTA 状态不一致、贴纸边缘/对比度不合格、背景影响可读性 | UI/UX 负责人，同步前端 | UI/UX 给接收/退回意见，前端按意见修复 |

本轮结论：`PR-QA-ONLINE-IP12-CAPTURE-001` 仅是首轮 iPhone 12 / 390 上线复拍采集清单。截图、录屏、构建号和登录态未回收前，不得写通过；375/414 多宽度补测仍是最终准出必需证据。

#### 13.16.14 `PR-QA-IP12-SCREENSHOT-REVIEW-001` iPhone 12 首轮截图评审记录

记录时间：2026-06-15 23:15。PM 派发 `PR-QA-IP12-SCREENSHOT-REVIEW-001`：用户已补真机截图，目录为 `C:\Users\Administrator\Desktop\真机测试`。测试侧只登记截图证据、初判覆盖、失败项和缺口；不写真机通过，不改 PM 总台账，不改业务源码。

##### 13.16.14.1 本批截图证据登记

设备口径：iPhone 12 / iOS 26.5 / 微信 8.0.73 / 390 宽。截图路径保持用户原始文件，不移动、不删除。

| 截图文件 | 页面 / 状态 | 已覆盖内容 | 初判状态 |
| --- | --- | --- | --- |
| `C:\Users\Administrator\Desktop\真机测试\微信图片_20260615231517_188_528.jpg` | 首页 `index` | 显示“聚会记录师”、`创建聚会`、`加入口令/扫码`、`继续记录`、最近相册和底部 Tab | 首轮截图已到；未发现旧品牌主标题；待录屏和构建号 |
| `C:\Users\Administrator\Desktop\真机测试\微信图片_20260615231514_187_528.jpg` | 创建聚会 `create-session` | 显示三步条 `1 创建 / 2 邀请 / 3 拍照`、标题“创建聚会”、`创建并邀请` CTA | 截图已到；发现轻量主题卡片文字/画面被裁切，按 UI 失败记录 |
| `C:\Users\Administrator\Desktop\真机测试\微信图片_20260615231514_186_528.jpg` | 拍第一张初始态 `moment-editor` | 显示“拍照/上传”、`拍照`、`从相册选择`、`默认仅本聚会成员可见`、`保存照片` | 首轮截图已到；可证明已进入拍第一张/上传页初始态；待录屏 |
| `C:\Users\Administrator\Desktop\真机测试\微信图片_20260615231513_185_528.jpg` | 拍照后/更换图片态 `moment-editor` | 显示图片预览区域、`更换图片`、描述输入区和 `保存照片` | 首轮截图已到；可证明拍照后/选图后保存入口存在；待上传/保存结果证据 |

##### 13.16.14.2 覆盖矩阵与缺口

| 验收点 | 本批证据 | 初判 | 缺口 |
| --- | --- | --- | --- |
| 首页新版主路径 | 首页截图已到 | 初判覆盖：品牌与三主动作可见 | 缺构建号、录屏、控制台截图 |
| 创建聚会页 | 创建页截图已到 | 初判覆盖：三步条与 `创建并邀请` 可见 | 轻量主题卡裁切失败；缺创建成功到邀请页截图 |
| 拍第一张/上传页 | 初始态和选图后态截图已到 | 初判覆盖：可到达拍照/上传页，默认可见范围提示可见 | 缺从邀请页进入的连续录屏、保存成功/失败态 |
| 三步主路径 | 首页、创建页、拍第一张页截图构成静态证据 | 初判：静态截图显示已能从首页方向推进到拍第一张/上传页 | 缺邀请/二维码页截图，缺三步连续录屏，不能判闭环通过 |
| 邀请/二维码页 | 无 | 未覆盖 | 需补 `invite-group` 截图，二维码/口令安全区和 `拍第一张` CTA |
| 记录/相册页 | 无 | 未覆盖 | 需补 `live-record` / 相册入口截图 |
| 我的页 | 无 | 未覆盖 | 需补 `me` 截图 |
| 401/loading 回归 | 本批无控制台截图 | 未关闭 | 继续按 13.16.13.2.1 回收未登录/失效 token/登录后/分享图重试四组控制台证据 |

##### 13.16.14.3 UI 失败项

| 失败编号 | 页面 | 失败描述 | 严重级别 | 退回对象 | 需要补证据 |
| --- | --- | --- | --- | --- | --- |
| `PR-QA-IP12-UI-FAIL-001` | `create-session` | 轻量主题卡片文字和画面被裁切，只露出局部字形；影响主题选择可读性和 UI 复刻质量 | P1；若阻断主题选择或创建路径则升级 P0 | UI/UX 负责人 + 前端负责人 | 前端修复后的 iPhone 12 / 390 截图；UI/UX 判断卡片裁切、比例和文字可读性是否符合设计 |

##### 13.16.14.4 `PR-QA-AUTH401-REGRESSION-001` 状态补充

本批 23:15 真机截图不包含控制台、未登录态、失效 token、登录后请求成功或分享图重试证据，因此不能关闭 `PR-QA-AUTH401-REGRESSION-001`。

仍需回收：

1. 未登录进入 `wine-history` 截图。
2. 登录/空态/引导截图。
3. 登录后请求成功或可用空态截图。
4. 控制台无重复 `GET /reports/history?mode=host 401`、无重复 `GET /user/session-moment-summaries 401`、无 `showLoading` / `hideLoading` 配对警告截图。
5. 分享图重试相关控制台截图，确认未引入重复 401 或 loading 配对警告。

##### 13.16.14.5 本轮结论

本批截图可作为 iPhone 12 / 390 / 微信 8.0.73 首轮静态截图证据，初判覆盖首页、创建聚会、拍第一张初始态、拍照后/更换图片态。当前不得写通过：仍缺邀请/二维码页、记录/相册页、我的页、三步连续录屏、控制台截图、新版构建号、A/B/C/outsider 登录态和 375/414 最终多宽度补测。

#### 13.16.15 `PR-QA-REMAINING-PAGES-ACCEPT-001` 剩余页面验收矩阵

记录时间：2026-06-16。PM 派发 `PR-QA-REMAINING-PAGES-ACCEPT-001`：UI/UX 已回收剩余页面目标图和实践包，前端将执行 `PR-FE-REMAINING-PAGES-IMPLEMENT-001`。测试侧只建立验收矩阵、证据命名、失败退回码和阻塞字段；当前无实现截图，所有页面均保持 `待截图 / 待录屏 / 阻塞`，不得写通过。

已核查 UI/UX 资产：

| 资产 | 路径 | 测试用途 | 当前状态 |
| --- | --- | --- | --- |
| P0 剩余页面五屏目标板 | `docs/design-assets/party-recorder/remaining/pr-ux-remaining-p0-pages-five-screen-board.png` | 作为 `me`、`wine-history`、`share-poster/share-preview`、`session-brief`、`rankings` 的复刻参考 | 已存在；不能作为实现截图或通过证据 |
| 前端实践包 | `docs/design-assets/party-recorder/remaining/README.md` | 作为验收维度、退回码和状态覆盖依据 | 已读取；等待前端实现与测试截图 |

##### 13.16.15.1 通用证据命名规则

| 证据类型 | 命名规则 | 说明 |
| --- | --- | --- |
| 首轮 iPhone 12 截图 | `PR-QA-REMAINING-PAGES-ACCEPT-001-<page>-390-iPhone12-wx8.0.73-<state>-<build>-20260616.png` | 首轮仅代表 iPhone 12 / iOS 26.5 / 微信 8.0.73 / 390 宽 |
| 最终多宽度截图 | `PR-QA-REMAINING-PAGES-ACCEPT-001-<page>-<375|390|414>-<device>-wx<version>-<state>-<build>-20260616.png` | 最终准出必须覆盖 375/390/414 |
| 三步录屏 | `PR-QA-REMAINING-PAGES-ACCEPT-001-three-step-create-invite-first-photo-<device>-wx<version>-<build>-20260616.mp4` | 必须覆盖：首页创建聚会 -> 邀请/二维码 -> 拍第一张 |
| 控制台截图 | `PR-QA-REMAINING-PAGES-ACCEPT-001-<page>-console-<state>-<device>-wx<version>-<build>-20260616.png` | 用于 401/loading、接口错误、分享任务重试和榜单错误 |
| PNG 原图 | `PR-QA-REMAINING-PAGES-ACCEPT-001-share-poster-png-original-<taskId>-<build>-20260616.png` | 分享预览必须保存原图，不能只看页面缩略图 |
| 接口/样本摘要 | `PR-QA-REMAINING-PAGES-ACCEPT-001-<page>-api-summary-<sampleId>-<build>-20260616.md` | 记录 taskId、briefId、momentId、nominationId、pointsLedgerId、过滤节点清单等 |

##### 13.16.15.2 页面验收矩阵

| 页面 | 首轮 iPhone 12 / 390 必收 | 最终 375/390/414 必收 | 状态覆盖 | 当前状态 |
| --- | --- | --- | --- | --- |
| `me` 我的 | 空用户、普通用户、重度用户、未登录引导截图 | 375/390/414 下头像/昵称、三入口、最近回忆、会员/设置/帮助/浏览记录轻量行截图 | 统计降权、长列表收敛、旧品牌无主路径露出、最近回忆至少露出 2-3 项 | 待截图；阻塞于前端实现和账号样本 |
| `wine-history` 历史相册 | 未登录、失效 token、登录空态、有历史、分享图生成中截图；控制台无重复 401/无 loading 配对警告截图 | 375/390/414 下分段、历史行、3 张缩略图、状态 chip、登录引导截图 | 未登录不刷 401；待补图、生成中、可分享状态可扫读；登录后才能请求历史摘要 | 待截图/待控制台；阻塞于前端实现、登录态和控制台证据 |
| `share-poster/share-preview` 分享预览 | pending、processing、ready、failed、expired、保存授权失败、局外预览截图；PNG 原图；二维码安全区截图；被过滤节点清单 | 375/390/414 下分享底图、任务状态条、保存图片/继续编辑、过滤提示和二维码/房间码安全区截图 | 仅包含已授权且审核通过照片；私密/待补图/隐藏/未授权内容不得进公开图；失败可重试 | 待截图/待 PNG 原图/待过滤清单；阻塞于任务样本和 UGC/接口证据 |
| `session-brief` 聚会简报 | loading、空 timeline、混合节点、待补图、可分享、不可推举截图 | 375/390/414 下简报摘要、时间线照片条、待补图提醒、分享管理、底部双 CTA 截图 | 摘要区不做数据仪表盘；待补图不可表达为可公开或可推举；分享入口不抢拍照入口 | 待截图；阻塞于 fixed brief 样本和前端实现 |
| `rankings` 今日回忆榜 | 空态、列表态、分类切换、推举确认、积分不足、重复推举、退款提示截图 | 375/390/414 下分类分段、照片榜单卡、推举按钮、积分提示、禁用原因截图 | 榜单为二级可选功能；推举资格、扣积分、重复推举和退款提示必须可追溯 | 待截图/待接口摘要；阻塞于榜单样本、points ledger 和 UGC 反例 |
| 三步主路径 | iPhone 12 / 390 三步录屏 | 375/390/414 至少各一轮截图，关键问题补录屏 | 首页创建聚会 -> 邀请/二维码 -> 拍第一张；剩余页面不得阻断默认创建和拍照路径 | 待录屏；阻塞于新版实现和登录态 |

##### 13.16.15.3 `wine-history` 401/loading 回归证据

| 场景 | 必收证据 | 验证标准 | 当前状态 |
| --- | --- | --- | --- |
| 未登录进入 | 未登录截图、控制台截图 | 展示登录/空态/引导；不请求或不持续重复请求 `/reports/history`、`/user/session-moment-summaries` 401 | 待截图/待控制台 |
| 失效 token | 失效 token 截图、控制台截图 | 清理失效态并展示重新登录提示；不循环刷 401 | 待截图/待控制台 |
| 登录后成功/空态 | 登录后请求成功或可用空态截图、接口摘要 | 登录后才请求历史摘要；无数据时展示可用空态 | 待截图/待接口摘要 |
| loading 配对 | 控制台截图 | 无 `showLoading` / `hideLoading` 配对警告；分享图重试不引入嵌套 loading 警告 | 待控制台 |

##### 13.16.15.4 分享预览与过滤证据

| 证据项 | 必收内容 | 失败判定 | 当前状态 |
| --- | --- | --- | --- |
| 分享预览 PNG 原图 | ready 任务原图文件、taskId、briefId 或 sessionId | 只提供页面缩略图、不能查看原图、图片模糊或旧品牌主文案 | 待 PNG 原图 |
| 二维码安全区 | `share-preview` / `share-poster` 截图，标注二维码/房间码和按钮安全区 | 贴纸、背景、文案遮挡二维码、房间码或保存按钮 | 待截图 |
| 被过滤节点清单 | selectedNodeIds、filteredNodeIds、过滤原因、接口摘要 | 私密、待补图、隐藏、未授权、未审核内容进入公开图 | 待接口/UGC 证据 |
| 任务状态 | pending、processing、ready、failed、expired、保存授权失败、局外预览 | 失败不可重试、expired 无说明、局外预览泄露私密内容 | 待状态样本 |

##### 13.16.15.5 榜单 / 推举 / 退款证据

| 场景 | 必收证据 | 验证标准 | 当前状态 |
| --- | --- | --- | --- |
| 空态 | 空榜截图、接口摘要 | 空态说明清晰，不引导违规推举 | 待截图 |
| 列表态 | 榜单列表截图、momentId、ranking item ID | 照片主导，积分短句可读，入口不抢主路径 | 待截图 |
| 分类切换 | 分类切换录屏或连续截图 | 分类分段不超过 3 项或采用横滑/二级页；状态不丢失 | 待截图/待录屏 |
| 推举确认 | 确认弹层截图、nomination 请求摘要 | 明确积分消耗和不可撤销/退款口径 | 待截图/待接口 |
| 积分不足 | 积分不足截图、points balance 摘要 | 不允许提交；提示补足或获取积分方式 | 待截图/待接口 |
| 重复推举 | 重复推举截图、错误响应 | 不重复扣积分；按钮禁用或错误说明清晰 | 待截图/待接口 |
| 退款提示 | 移出榜单/退款提示截图、pointsLedgerId | 退款可追溯，提示清楚，不重复退款 | 待截图/待 ledger |

##### 13.16.15.6 失败退回码

| 退回码 | 触发条件 | 退回对象 |
| --- | --- | --- |
| `PR-FE-REMAINING-P0-STRUCTURE` | 五页结构与目标板差异过大、旧游戏心智占主路径、主动作不可见 | 前端负责人；同步 UI/UX |
| `PR-FE-REMAINING-P0-BOUNDARY` | 底部 CTA、Tab、二维码、横滑缩略图、长按钮出屏、遮挡、半露、不可读 | 前端负责人 |
| `PR-FE-REMAINING-P1-LIST` | 超过 5 项未折叠/分组/横滑/搜索/二级页，导致长列表挤压主路径 | 前端负责人；同步 UI/UX |
| `PR-FE-REMAINING-P1-HEAVY-CARD` | 我的页统计、历史行、简报摘要、榜单卡单列厚重并挤压主动作 | 前端负责人；同步 UI/UX |
| `PR-FE-REMAINING-P0-SHARE-FILTER` | 私密、待补图、隐藏、未授权、未审核内容进入公开图或过滤清单缺失 | 前端负责人 + UGC 风控 + 后端/API |
| `PR-FE-REMAINING-P0-AUTH-STATE` | `wine-history` 未登录/失效 token 重复刷 401，或出现 loading 配对警告 | 前端负责人；接口合同不一致时退后端/API或接口联调 |
| `PR-FE-REMAINING-P1-RANKING-STATE` | 榜单推举资格、积分不足、重复推举、退款提示不清或账务证据缺失 | 前端负责人 + UGC 风控 + 后端/API |
| `PR-QA-EVIDENCE-MISSING` | 缺截图/录屏/构建号/设备/微信版本/角色/接口摘要/PNG 原图 | 测试执行人或 PM 补证据 |

##### 13.16.15.7 阻塞字段

| 阻塞项 | 责任方 | 影响 |
| --- | --- | --- |
| 前端 `PR-FE-REMAINING-PAGES-IMPLEMENT-001` 未回收 | 前端负责人 | 无实现截图，矩阵只能保持待截图/阻塞 |
| 缺首轮 iPhone 12 / 390 截图 | 测试执行人 / 前端 | 不能进行首轮视觉和路径初判 |
| 缺最终 375/390/414 截图 | 测试执行人 / PM | 不能准出多宽度适配 |
| 缺三步录屏 | 测试执行人 | 不能证明默认创建与拍照路径未被剩余页面阻断 |
| 缺 A/B/C/outsider 登录态 | PM / 测试执行人 | 不能覆盖权限、未登录、失效 token、局外预览和 UGC 反例 |
| 缺分享 PNG 原图 / 过滤清单 | 前端 / 后端/API / UGC 风控 | 不能验收公开分享安全 |
| 缺榜单样本 / points ledger / 退款样本 | 后端/API / 接口联调 / UGC 风控 | 不能验收推举、积分不足、重复推举和退款 |
| 缺控制台截图 | 测试执行人 | 不能关闭 401/loading 回归 |

本轮结论：`PR-QA-REMAINING-PAGES-ACCEPT-001` 已建立验收矩阵、命名规则、失败退回码和阻塞字段。当前无剩余页面实现截图、录屏、接口摘要或样本 ID，所有项保持 `待截图 / 待录屏 / 阻塞`，不得写通过。

#### 13.16.16 `PR-QA-0616-IP12-BATCH-REVIEW-001` 0616 iPhone 12 批次截图评审

记录时间：2026-06-16。PM 派发 `PR-QA-0616-IP12-BATCH-REVIEW-001`：用户已补真机测试目录 `C:\Users\Administrator\Desktop\真机测试\0616`，共 13 张 JPG。测试侧本节只登记截图、覆盖矩阵、失败索引和最后大版本一次性截图需求草案；不写真机通过，不改源码，不改 PM 总台账，不替前端/UI/UX/UGC 写通过。后续除无法定位的 P0 阻塞外，不再零散向用户要截图，统一等最后大版本一次性回收。

##### 13.16.16.1 13 张截图登记

设备口径：iPhone 12 / iOS 26.5 / 微信 8.0.73 / 390 宽。截图路径保持用户原始文件，不移动、不删除。

| 文件名 | 页面 / 状态 | 覆盖内容 | 初判 |
| --- | --- | --- | --- |
| `C:\Users\Administrator\Desktop\真机测试\0616\微信图片_20260616002611_189_528.jpg` | 首页下半屏 / 最近相册 | `继续记录`、最近相册、工具类缩略图、输入口令、相册与分享入口、底部 Tab | 问题定位：最近相册缩略图像工具素材而非聚会照片 |
| `C:\Users\Administrator\Desktop\真机测试\0616\微信图片_20260616002612_190_528.jpg` | 聚会简报 / 记录相册列表 | `聚会简报` 页、旧标题 `酒局时间线简报`、记录/相册列表、待审核节点 | 问题定位：简报旧“酒局时间线简报”残留 |
| `C:\Users\Administrator\Desktop\真机测试\0616\微信图片_20260616002612_191_528.jpg` | 桌面模式 / 记录页 | `周五快乐局`、桌面模式、玩家统计、收尾照、结束本局 | 问题定位：仍有酒桌/局语义，需前端确认是否历史兼容或主路径残留 |
| `C:\Users\Administrator\Desktop\真机测试\0616\微信图片_20260616002613_192_528.jpg` | 记录/相册页 | `记录/相册`、记录/相册/分享 Tab、继续拍照 CTA | 已覆盖记录/相册静态页；缺录屏和控制台 |
| `C:\Users\Administrator\Desktop\真机测试\0616\微信图片_20260616002614_193_528.jpg` | 榜单空态 | `今日回忆榜`、分类切换、空态英文 `not found` | 失败：榜单空态英文未本地化 |
| `C:\Users\Administrator\Desktop\真机测试\0616\微信图片_20260616002615_194_528.jpg` | 聚会简报 / 分享任务 | `聚会简报`、旧标题 `酒局时间线简报`、记录/相册、分享图任务 | 问题定位：简报旧“酒局时间线简报”残留；分享任务截图有覆盖但缺 PNG 原图/控制台 |
| `C:\Users\Administrator\Desktop\真机测试\0616\微信图片_20260616002616_195_528.jpg` | 我的相册 / wine-history | `我的相册`、历史相册列表、分享任务状态、`看简报` | 已覆盖历史/相册登录后列表态；缺未登录/失效 token/控制台 |
| `C:\Users\Administrator\Desktop\真机测试\0616\微信图片_20260616002616_196_528.jpg` | 记录页 / 旧主视觉 | 记录页首页、`酒桌判官` 大主视觉、记录说明/历史相册/主题模板/分享记录 | 失败：记录页旧“酒桌判官”主视觉 |
| `C:\Users\Administrator\Desktop\真机测试\0616\微信图片_20260616002617_197_528.jpg` | 我的页 `me` | 头像昵称、我的相册、继续记录、统计、最近回忆、待处理相册 | 已覆盖我的页静态态；缺多状态和多宽度 |
| `C:\Users\Administrator\Desktop\真机测试\0616\微信图片_20260616002617_198_528.jpg` | 拍照/上传选图后 | 图片预览、更换图片、说明输入、保存照片 | 已覆盖选图后态；缺保存成功/失败态 |
| `C:\Users\Administrator\Desktop\真机测试\0616\微信图片_20260616002618_199_528.jpg` | 拍照/上传初始态 | 拍照、从相册选择、默认仅本聚会成员可见、保存照片 | 已覆盖初始态；缺从邀请页进入录屏 |
| `C:\Users\Administrator\Desktop\真机测试\0616\微信图片_20260616002619_200_528.jpg` | 创建聚会页 | 三步条、创建聚会、轻量主题、创建并邀请 | 失败：轻量主题卡仍裁切，只露出局部字形 |
| `C:\Users\Administrator\Desktop\真机测试\0616\微信图片_20260616002620_201_528.jpg` | 首页首屏 | “聚会记录师”、创建聚会、加入口令/扫码、继续记录、最近相册入口 | 已覆盖首页首屏；缺录屏和最终多宽度 |

##### 13.16.16.2 覆盖矩阵

| 页面 / 能力 | 本批是否覆盖 | 已有证据 | 当前状态 | 缺口 |
| --- | --- | --- | --- | --- |
| 首页 | 已覆盖 | `189`、`201` | 问题定位 | 最近相册缩略图像工具素材；缺录屏、多宽度、构建号 |
| 创建聚会 | 已覆盖 | `200` | 待前端修复 | 轻量主题卡仍裁切；缺创建成功到邀请页录屏 |
| 拍照/上传 | 已覆盖 | `198`、`199` | 问题定位 | 缺保存成功/失败、上传失败、权限拒绝和录屏 |
| 记录/相册 | 已覆盖 | `192`、`195` | 问题定位 | 缺未登录/失效 token/控制台、多宽度 |
| 聚会简报 | 已覆盖 | `190`、`194` | 待前端修复 | 旧“酒局时间线简报”残留；缺 loading/空 timeline/混合节点/不可推举 |
| 桌面/记录页 | 已覆盖 | `191`、`196` | 待前端修复 | 记录页旧“酒桌判官”主视觉；桌面模式旧语义需降级或标历史兼容 |
| 我的页 | 已覆盖 | `197` | 问题定位 | 缺空用户/普通/重度多状态和多宽度 |
| 榜单 | 已覆盖 | `193` | 待前端修复 | 空态英文 `not found`；缺列表态、分类切换、推举确认、积分不足、重复推举、退款提示 |
| 分享预览 / 分享图 | 部分覆盖 | `194` 仅显示分享图任务入口 | 阻塞 | 缺 `share-poster/share-preview` 页面、PNG 原图、二维码安全区、被过滤节点清单 |
| 三步主路径录屏 | 未覆盖 | 无 | 阻塞 | 缺首页创建聚会 -> 邀请/二维码 -> 拍第一张连续录屏 |
| 控制台 / 401/loading | 未覆盖 | 无 | 阻塞 | 缺未登录、失效 token、登录后、分享图重试控制台截图 |
| 多宽度 | 未覆盖 | 本批仅 iPhone 12 / 390 | 阻塞 | 缺 375/390/414 最终大版本截图 |
| 角色视角 | 未覆盖 | 单一登录态截图 | 阻塞 | 缺 A/B/C/outsider 或对应角色视角 |

##### 13.16.16.3 失败索引

| 失败编号 | 页面 | 失败描述 | 严重级别 | 退回对象 | 当前状态 |
| --- | --- | --- | --- | --- | --- |
| `PR-QA-0616-FAIL-001` | `create-session` | 轻量主题卡仍裁切，文字/画面只露出局部字形 | P1；如影响选择或创建则升 P0 | 前端负责人 + UI/UX 负责人 | 待前端修复 / 待最后大版本复拍 |
| `PR-QA-0616-FAIL-002` | `rankings` | 榜单空态出现英文 `not found` | P1；如空态阻断榜单理解则升 P0 | 前端负责人 | 待前端修复 / 待最后大版本复拍 |
| `PR-QA-0616-FAIL-003` | 记录页 / `judge` 或记录入口 | 旧“酒桌判官”作为大主视觉，违背“聚会记录师”主路径口径 | P0 若仍为主路径；如仅历史兼容需 PM/前端标明入口层级 | 前端负责人 + UI/UX 负责人 + PM | 待前端修复或 PM 明确历史兼容边界 |
| `PR-QA-0616-FAIL-004` | `session-brief` | 简报仍显示旧“酒局时间线简报” | P1；如作为主标题对外展示则升 P0 | 前端负责人 + UI/UX 负责人 | 待前端修复 / 待最后大版本复拍 |
| `PR-QA-0616-FAIL-005` | 首页最近相册 | 最近相册缩略图像工具素材/功能图标而非聚会照片，影响相册语义 | P1 | 前端负责人 + UI/UX 负责人 | 待前端修复 / 待最后大版本复拍 |

##### 13.16.16.4 最后大版本一次性截图需求草案

后续除无法定位的 P0 阻塞外，不再零散向用户要截图。最后大版本统一回收以下证据：

| 类别 | 一次性必收内容 | 文件命名 |
| --- | --- | --- |
| 设备与版本 | iPhone 12 / iOS 26.5 / 微信 8.0.73；如补 375/414 需记录设备型号、系统、微信版本、屏幕宽度 | `PR-QA-FINAL-DEVICE-<device>-wx<version>-<build>-20260616.md` |
| 构建信息 | 新版线上构建号、上传备注、体验版/预览二维码生成时间、扫码入口 | `PR-QA-FINAL-BUILD-<build>-20260616.md` |
| 首页 | 首页首屏、首页最近相册、创建/加入/继续记录入口 | `PR-QA-FINAL-index-<width>-<device>-wx<version>-<build>-20260616.png` |
| 创建聚会 | 默认态、主题卡修复态、创建并邀请 CTA、键盘态或长文案态 | `PR-QA-FINAL-create-session-<state>-<width>-<device>-wx<version>-<build>-20260616.png` |
| 邀请/二维码 | 二维码/口令、安全区、拍第一张 CTA、局外或加入视角 | `PR-QA-FINAL-invite-group-<state>-<width>-<device>-wx<version>-<build>-20260616.png` |
| 拍照/上传 | 初始态、选图后、保存成功、上传失败、权限拒绝 | `PR-QA-FINAL-moment-editor-<state>-<width>-<device>-wx<version>-<build>-20260616.png` |
| 记录/相册 / `wine-history` | 登录空态、有历史、待补图、分享图生成中、未登录、失效 token | `PR-QA-FINAL-wine-history-<state>-<width>-<device>-wx<version>-<build>-20260616.png` |
| 聚会简报 | loading、空 timeline、混合节点、待补图、可分享、不可推举 | `PR-QA-FINAL-session-brief-<state>-<width>-<device>-wx<version>-<build>-20260616.png` |
| 分享预览 | `share-poster` / `share-preview` pending、processing、ready、failed、expired、保存授权失败、局外预览；PNG 原图、二维码安全区、被过滤节点清单 | `PR-QA-FINAL-share-<state>-<width>-<device>-wx<version>-<build>-20260616.png`；原图 `PR-QA-FINAL-share-png-original-<taskId>-<build>-20260616.png` |
| 我的页 | 空用户、普通用户、重度用户、未登录引导、最近回忆、待处理相册 | `PR-QA-FINAL-me-<state>-<width>-<device>-wx<version>-<build>-20260616.png` |
| 榜单 | 空态、列表态、分类切换、推举确认、积分不足、重复推举、退款提示 | `PR-QA-FINAL-rankings-<state>-<width>-<device>-wx<version>-<build>-20260616.png` |
| 三步录屏 | 首页创建聚会 -> 邀请/二维码 -> 拍第一张连续录屏 | `PR-QA-FINAL-three-step-create-invite-first-photo-<device>-wx<version>-<build>-20260616.mp4` |
| 控制台 | `wine-history` 未登录/失效 token/登录后/分享图重试；无重复 401、无 showLoading/hideLoading 配对警告 | `PR-QA-FINAL-console-<page>-<state>-<device>-wx<version>-<build>-20260616.png` |
| 登录态/角色 | A/B/C/outsider 或实际测试账号说明、角色视角、权限差异 | `PR-QA-FINAL-roles-<build>-20260616.md` |

##### 13.16.16.5 本批结论

本批 13 张 iPhone 12 / 390 截图只能写“问题定位 / 待前端修复 / 待最后大版本复拍”。已覆盖首页、创建聚会、拍照/上传、记录/相册、聚会简报、桌面/记录页、我的、榜单等静态页面；仍缺录屏、控制台、多宽度、PNG 原图、角色视角和接口/样本摘要。除无法定位的 P0 阻塞外，测试侧下一轮不再零散向用户要截图，等待最后大版本按 13.16.16.4 一次性回收。

#### 13.16.17 `PR-QA-FINAL-BIG-VERSION-PACK-001` 最终大版本一次性采集包

记录时间：2026-06-16。PM 派发 `PR-QA-FINAL-BIG-VERSION-PACK-001`：0616 批次已完成首轮退回，前端代码侧修复已出现；后续 PM 通知 `rankings/today` 线上 404 已发布闭环为 200，接口层可进入真机复拍准备。测试侧只整理最终一次性采集包，不向用户零散要图；当前状态统一为 `待最终构建截图录屏 / 待 iPhone 12 榜单真机证据 / 待控制台证据`。不得写真机通过、不得写 UI/UX 通过、不得写风控准出。

##### 13.16.17.1 总体前置

| 前置项 | 必收内容 | 责任方 | 当前状态 |
| --- | --- | --- | --- |
| 最终大版本构建 | 构建号、上传备注、体验版/预览二维码、上线时间、前端修复摘要 | 前端负责人 / PM | 待构建 |
| 设备与版本 | iPhone 12 / iOS 26.5 / 微信 8.0.73 / 390 宽；最终 375/414 补测设备与微信版本 | PM / 人工测试执行人 | 390 已有基线；375/414 待补测 |
| 登录态/角色 | A/B/C/outsider 账号、角色说明、登录方式、可复现入口 | PM / 人工测试执行人 | 待提供 |
| 线上 API | `rankings` 线上路由 200 或前端中文空态降级；history/share/brief/rankings 样本接口摘要 | 后端/API / 接口联调 | `rankings/today` 接口层已可测；待真机和控制台证据 |
| UGC/过滤样本 | 私密、待补图、隐藏、未授权、待审/已审节点和过滤结果 | UGC 风控 / 后端/API / 接口联调 | 待样本 |

##### 13.16.17.2 最终一次性截图 / 录屏清单

| 模块 | 必收证据 | 文件命名规则 | 责任方 | 当前状态 |
| --- | --- | --- | --- | --- |
| 6 个主路径页 | 首页、创建聚会、邀请/二维码、拍照/上传、记录/相册、我的页；iPhone 12 / 390 首轮截图；最终 375/390/414 截图 | `PR-QA-FINAL-BIG-VERSION-PACK-001-main-<page>-<width>-<device>-wx<version>-<build>-20260616.png` | 人工测试执行人；前端配合入口 | 待截图 |
| 5 个剩余页 | `me`、`wine-history`、`share-poster/share-preview`、`session-brief`、`rankings`；首轮 390 和最终 375/390/414 | `PR-QA-FINAL-BIG-VERSION-PACK-001-remaining-<page>-<state>-<width>-<device>-wx<version>-<build>-20260616.png` | 人工测试执行人；前端配合状态入口 | 待截图 |
| 三步连续录屏 | 首页创建聚会 -> 邀请/二维码 -> 拍第一张；必须显示设备、版本、构建号或入口备注 | `PR-QA-FINAL-BIG-VERSION-PACK-001-three-step-create-invite-first-photo-<device>-wx<version>-<build>-20260616.mp4` | 人工测试执行人 / 前端 | 待录屏 |
| 首页未登录/失效 token 创建入口 | 未登录态和失效 token 态点击首页 `创建聚会`，必须出现可执行登录动作或进入创建页；不得停留首页且无登录入口 | `PR-QA-HOME-LOGIN-ENTRY-001-<authState>-create-click-390-iPhone12-wx8.0.73-<build>-20260616.mp4`；控制台 `PR-QA-HOME-LOGIN-ENTRY-001-console-<authState>-no-repeat-401-no-loading-warning-<build>-20260616.png` | 前端负责人 / 人工测试执行人 / PM | P0 待修复复核 / 待截图录屏 / 待控制台 |
| 401/loading 控制台 | `wine-history` 未登录、失效 token、登录后、分享图重试；无重复 401，无 `showLoading`/`hideLoading` 配对警告 | `PR-QA-FINAL-BIG-VERSION-PACK-001-console-<page>-<state>-<device>-wx<version>-<build>-20260616.png` | 人工测试执行人；前端负责修复；接口联调辅助判定 | 待控制台截图 |
| `rankings` 线上路由 | 线上 `rankings` API 200 响应或前端中文空态截图；不得再出现英文 `not found` | `PR-QA-FINAL-BIG-VERSION-PACK-001-rankings-online-200-or-cn-empty-<device>-wx<version>-<build>-20260616.png`；接口摘要 `...-api-summary-...md` | 后端/API / 接口联调 / 前端 / 人工测试执行人 | 接口层 200；待 iPhone 12 截图/控制台 |
| A/B/C/outsider 角色视角 | 创建者、参与者、非接收者/旁观、局外访问；覆盖邀请、相册、分享预览、权限提示 | `PR-QA-FINAL-BIG-VERSION-PACK-001-role-<role>-<page>-<width>-<device>-wx<version>-<build>-20260616.png` | PM / 人工测试执行人；前端配合账号入口 | 待角色证据 |
| 分享 PNG 原图 | `share-poster/share-preview` ready 原图、二维码安全区、房间码/按钮安全区 | `PR-QA-FINAL-BIG-VERSION-PACK-001-share-png-original-<taskId>-<build>-20260616.png` | 前端 / 后端/API / 人工测试执行人 | 待 PNG 原图 |
| 过滤节点清单 | selectedNodeIds、filteredNodeIds、过滤原因、私密/待补图/隐藏/未授权/未审核节点样本 | `PR-QA-FINAL-BIG-VERSION-PACK-001-share-filtered-nodes-<taskId>-<build>-20260616.md` | UGC 风控 / 后端/API / 接口联调 | 待过滤清单 |
| 榜单推举/退款 | 空态、列表态、分类切换、推举确认、积分不足、重复推举、退款提示、pointsLedgerId | `PR-QA-FINAL-BIG-VERSION-PACK-001-rankings-<state>-<width>-<device>-wx<version>-<build>-20260616.png`；接口摘要 `...-points-ledger-...md` | 后端/API / 接口联调 / UGC 风控 / 人工测试执行人 | 待样本和截图 |

##### 13.16.17.3 页面状态明细

| 页面 | 必测状态 | 责任方 | 当前状态 |
| --- | --- | --- | --- |
| 首页 | 首屏、最近相册缩略图修复、创建/加入/继续记录入口、底部 Tab | 前端 / 人工测试执行人 / UI/UX | 待截图 |
| 创建聚会 | 默认态、轻量主题卡修复态、`创建并邀请`、长文案/键盘态 | 前端 / 人工测试执行人 / UI/UX | 待截图 |
| 邀请/二维码 | 二维码/口令、安全区、`拍第一张` CTA、A/B/C/outsider 可见差异 | 前端 / PM / 人工测试执行人 | 待截图 |
| 拍照/上传 | 初始态、选图后、保存成功、上传失败、权限拒绝、默认可见范围 | 前端 / 人工测试执行人 / UGC | 待截图 |
| 记录/相册 | 记录 Tab、相册 Tab、分享 Tab、继续拍照、登录态/未登录态、401 降级 | 前端 / 人工测试执行人 / 接口联调 | 待截图/控制台 |
| 我的页 | 空用户、普通用户、重度用户、最近回忆、待处理相册、分享记录 | 前端 / 人工测试执行人 / UI/UX | 待截图 |
| `wine-history` | 未登录、失效 token、登录空态、有历史、分享图生成中、控制台无 401/loading 警告 | 前端 / 人工测试执行人 / 接口联调 | 待截图/控制台 |
| `share-poster/share-preview` | pending、processing、ready、failed、expired、保存授权失败、局外预览、PNG 原图、过滤节点清单 | 前端 / 后端/API / UGC / 人工测试执行人 | 待截图/PNG/过滤清单 |
| `session-brief` | loading、空 timeline、混合节点、待补图、可分享、不可推举；旧“酒局时间线简报”修复 | 前端 / 接口联调 / 人工测试执行人 / UI/UX | 待截图 |
| `rankings` | 线上 200 或中文空态、空态、列表态、分类切换、推举确认、积分不足、重复推举、退款提示 | 后端/API / 接口联调 / 前端 / UGC / 人工测试执行人 | 接口层 200；待真机截图/控制台/样本 |

##### 13.16.17.4 阻塞项与责任方

| 阻塞项 | 责任方 | 需要补的证据 |
| --- | --- | --- |
| 最终大版本构建未给出 | 前端 / PM | 构建号、上传备注、二维码、修复摘要 |
| 线上 `rankings` 路由真机证据未闭环 | 后端/API / 接口联调 / 前端 / 人工测试执行人 | 已有接口层 200；仍缺 iPhone 12 榜单页截图、控制台无英文 `not found`、中文空态或列表态 |
| 缺最终截图/录屏 | 人工测试执行人 / 前端 | 6 主路径页、5 剩余页、三步录屏、375/390/414 补测 |
| 缺 401/loading 控制台 | 人工测试执行人 / 前端 / 接口联调 | 未登录、失效 token、登录后、分享图重试控制台截图 |
| 缺 A/B/C/outsider 角色视角 | PM / 人工测试执行人 | 角色账号、登录态、权限视角截图 |
| 缺分享安全证据 | 前端 / 后端/API / UGC / 接口联调 | PNG 原图、二维码安全区、过滤节点清单、接口摘要 |
| 缺榜单账务证据 | 后端/API / 接口联调 / UGC | nominationId、pointsLedgerId、退款样本、重复推举和积分不足响应 |
| 缺 UI/UX 接收证据 | UI/UX / 前端 / 人工测试执行人 | 修复后实现截图与目标图对照；UI/UX 接收或退回意见 |

本轮结论：`PR-QA-FINAL-BIG-VERSION-PACK-001` 已整理最终大版本一次性采集包。`rankings/today` 接口层已可继续，但当前仍保持 `待最终构建截图录屏 / 待 iPhone 12 榜单真机证据 / 待控制台证据`；不得向用户零散索要截图，不得写真机通过、UI/UX 通过或风控准出。

#### 13.16.18 `PR-QA-FULL-PAGES-MATRIX-001` 全量页面验收矩阵骨架

记录时间：2026-06-16。PM 派发 `PR-QA-FULL-PAGES-MATRIX-001`：用户要求 UI/UX 扩展到项目全量页面。测试侧基于 `miniprogram/app.json` 当前 36 个注册页面、`miniprogram/pages/*` 未注册目录和后台相关页面建立验收矩阵骨架。本节只准备最终大版本一次性采集范围，不向用户零散要图；所有页面当前均不得写真机通过、UI/UX 通过或风控准出。

##### 13.16.18.1 分层规则

| 层级 | 范围 | 准出要求 | 当前状态 |
| --- | --- | --- | --- |
| P0 主路径 | 三步创建并拍第一张、相册/记录、我的页、简报、分享、榜单核心入口 | 必须有 iPhone 12 / 390 首轮截图；最终 375/390/414；关键链路录屏；角色和接口/控制台证据齐全 | 待构建 / 待截图录屏 |
| P1 关键状态/入口 | 加人、规则、等待、异常态、合规、分享/历史状态、个人设置类关键入口 | 必须至少 390 截图；涉及权限、登录、接口错误、loading 的页面需控制台或接口摘要；最终按风险补 375/414 | 待截图 |
| P2 旧玩法/商业化/工具 | 工具箱、旧判官玩法、积分、会员、优惠券、商家、题库、使用历史等低默认路径 | 必须确认不阻塞默认创建拍照；旧品牌文案不得进入主路径；商业化/积分需接口摘要 | 待截图 / 待接口摘要 |
| P3 后台/未注册/低频页 | 后台动态页、未注册小程序目录、日志、低频配置页 | 必须说明入口层级和是否上线；后台需账号、授权窗口、operationLogs；未注册目录需前端说明保留/废弃 | 待入口说明 / 待后台证据 |

通用失败判定：任一页面出现旧主品牌大标题、主路径旧样式框、底部 CTA 越界/遮挡、长列表无收敛导致创建/拍照/分享主动作不可达、英文错误裸露、重复 401、`showLoading`/`hideLoading` 配对警告，按 P0/P1 退回；具体级别以是否阻断主路径和权限/风控为准。

##### 13.16.18.2 36 个注册页面验收矩阵

| 层级 | 注册页面 | 页面/用途 | 截图状态 | 录屏需求 | 角色视角 | 接口/控制台证据 | 宽度 | 多状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P0 | `pages/index/index` | 首页、创建/加入/继续记录入口、最近相册 | 待截图 | 纳入三步录屏起点 | 单登录态；A/B/C/outsider 最终补权限入口 | home 配置摘要；无旧词扫描 | 390 首轮；375/414 最终 | 空相册/有相册/入口异常 |
| P0 | `pages/create-session/index` | 创建聚会、主题卡、创建并邀请 | 待截图 | 纳入三步录屏 | 创建者 A | create session 请求摘要 | 390 首轮；375/414 最终 | 默认/长文案/键盘/创建失败 |
| P0 | `pages/invite-group/index` | 邀请/二维码/口令/拍第一张 CTA | 待截图 | 纳入三步录屏 | A 创建者、B 参与者、outsider | invite/join 接口摘要 | 390 首轮；375/414 最终 | 二维码/口令/过期/无权限 |
| P0 | `pages/moment-editor/index` | 拍照/上传、第一张照片、权限可见范围 | 待截图 | 纳入三步录屏终点 | A 上传者、B 可见、C/outsider 不可见 | upload/moment create 摘要；权限错误 | 390 首轮；375/414 最终 | 初始/选图/保存/上传失败/权限拒绝 |
| P0 | `pages/live-record/index` | 记录/相册/分享入口 | 待截图 | 需要路径录屏片段 | A/B/C/outsider | timeline 接口；私密过滤摘要 | 390 首轮；375/414 最终 | 空/有记录/私密占位/加载/错误 |
| P0 | `pages/wine-history/index` | 历史/相册、401/loading 回归 | 待截图 | 失败时需录屏 | 未登录、登录用户、失效 token | 控制台无重复 401；无 loading 配对警告 | 390 首轮；375/414 最终 | 未登录/失效 token/空态/有历史/接口错 |
| P0 | `pages/session-brief/index` | 聚会简报、节点汇总、分享入口 | 待截图 | 分享入口需录屏 | A/B/C/outsider | brief 接口摘要；过滤节点 | 390 首轮；375/414 最终 | loading/空/混合节点/待补图/不可推举 |
| P0 | `pages/share-poster/index` | 分享海报生成与保存 | 待截图 | ready/failed 需录屏 | A 分享者、outsider 预览 | share task 四态；PNG 原图 | 390 首轮；375/414 最终 | pending/processing/ready/failed/expired/保存拒绝 |
| P0 | `pages/share-preview/index` | 分享预览、二维码安全区 | 待截图 | 预览保存需录屏 | A/B/outsider | PNG 原图、过滤节点清单 | 390 首轮；375/414 最终 | ready/无权限/过滤后空/二维码安全区 |
| P0 | `pages/rankings/index` | 榜单、推举、退款、奖励 | 待线上 rankings 路由闭环 / 待截图 | 推举确认需录屏 | A/B/C/outsider、积分不足账号 | rankings 线上 200 或中文空态；nomination/ledger 摘要 | 390 首轮；375/414 最终 | 空态/列表/分类/推举/积分不足/重复/退款 |
| P0 | `pages/me/index` | 我的页、最近回忆、分享重试入口 | 待截图 | 分享重试异常需录屏 | 未登录、普通用户、重度用户 | summaries/history/share task 控制台 | 390 首轮；375/414 最终 | 未登录/空/有数据/重试失败 |
| P1 | `pages/add-players/index` | 添加成员 | 待截图 | 创建链路失败时需录屏 | A 创建者 | add/join 成员摘要 | 390；最终视风险补 375/414 | 空/多人/长昵称/失败 |
| P1 | `pages/session-rules/index` | 聚会规则/可见范围说明 | 待截图 | 无，除非阻断创建 | A/B | config/rules 摘要 | 390；最终视风险补 375/414 | 默认/长规则/加载失败 |
| P1 | `pages/waiting-room/index` | 等待房间/加入后等待 | 待截图 | 进入记录失败时需录屏 | A/B/outsider | session 状态摘要 | 390；最终视风险补 375/414 | 等待/成员变化/房间失效 |
| P1 | `pages/invalid-state/index` | 无效状态页 | 待截图 | 无 | outsider、失效链接用户 | 错误码摘要 | 390 | session 不存在/无权限/过期 |
| P1 | `pages/restart-state/index` | 重启/恢复状态 | 待截图 | 恢复失败时需录屏 | A/B | session 恢复接口摘要 | 390 | 可恢复/不可恢复/加载 |
| P1 | `pages/compliance-guide/index` | 合规指引 | 待截图 | 无 | 全部 | 无，必要时补静态版本 | 390 | 默认/长文案 |
| P1 | `pages/flow-overview/index` | 流程概览/引导 | 待截图 | 无，除非作为入口 | 新用户 | 无，必要时补埋点摘要 | 390 | 首次/非首次 |
| P1 | `pages/settings/index` | 设置、授权、隐私入口 | 待截图 | 权限切换异常需录屏 | 登录/未登录 | 授权、退出、缓存清理控制台 | 390；最终视风险补 375/414 | 未登录/已登录/权限拒绝 |
| P1 | `pages/favorites/index` | 收藏/保存内容 | 待截图 | 删除/跳转异常需录屏 | 登录用户 | favorites 接口摘要 | 390 | 空/列表/删除/接口错 |
| P1 | `pages/friend-hub/index` | 好友/邀请中心 | 待截图 | 邀请异常需录屏 | A/B/outsider | friend/invite 摘要 | 390 | 空/列表/邀请失败 |
| P1 | `pages/invite-friends/index` | 邀请好友 | 待截图 | 分享失败需录屏 | A/B | share/invite 摘要 | 390 | 默认/授权拒绝/分享失败 |
| P2 | `pages/tools/index` | 工具箱 | 待截图 | 无，除非阻断主路径 | 单登录态 | tools 配置摘要 | 390；最终抽查 375/414 | 分类/搜索/空态 |
| P2 | `pages/tool-detail/index` | 工具详情 | 待截图 | 无 | 单登录态 | tool detail 摘要 | 390 | 默认/收藏/加载失败 |
| P2 | `pages/judge/index` | 旧判官/记录入口 | 待截图 | 若仍为主路径需录屏 | 单登录态 | 无，必要时补旧词扫描 | 390 | 默认/旧品牌/入口跳转 |
| P2 | `pages/judge-wheel/index` | 旧玩法转盘 | 待截图 | 无 | 单登录态 | 无，必要时补控制台 | 390 | 默认/结果/异常 |
| P2 | `pages/table-mode/index` | 桌面/记录模式 | 待截图 | 若作为记录主入口需录屏 | A/B | session/timeline 摘要 | 390 | 默认/有记录/旧品牌 |
| P2 | `pages/result-report/index` | 结果报告 | 待截图 | 无 | A/B | report/summary 摘要 | 390 | 空/有结果/分享 |
| P2 | `pages/question-bank/index` | 题库 | 待截图 | 无 | 单登录态 | question bank 摘要 | 390 | 空/列表/搜索 |
| P2 | `pages/wine-points/index` | 积分中心 | 待截图 | 积分扣减异常需录屏 | 登录用户、积分不足用户 | points/ledger 摘要 | 390 | 空/流水/扣减/错误 |
| P2 | `pages/member-center/index` | 会员中心 | 待截图 | 支付/开通不在本轮写入 | 登录用户 | membership/config 摘要 | 390 | 未开通/已开通/加载失败 |
| P2 | `pages/premium-templates/index` | 高级模板 | 待截图 | 无 | 登录用户 | template/config 摘要 | 390 | 免费/付费/空态 |
| P2 | `pages/merchant-partners/index` | 商家合作 | 待截图 | 无 | 单登录态 | merchant config 摘要 | 390 | 空/列表 |
| P2 | `pages/coupon-center/index` | 优惠券中心 | 待截图 | 领取异常需录屏 | 登录用户 | coupon 摘要 | 390 | 空/可领/已领/过期 |
| P2 | `pages/usage-history/index` | 使用历史 | 待截图 | 401/空态异常需录屏 | 未登录、登录用户 | history 摘要；控制台 | 390 | 未登录/空/列表/接口错 |
| P3 | `pages/logs/logs` | 小程序日志页 | 待截图 | 无 | 单登录态 | 控制台无报错 | 390 | 默认/空 |

##### 13.16.18.3 未注册目录验收矩阵

当前 `miniprogram/pages/*` 中未出现在 `app.json` 的目录：`admin-console`、`admin-home-config`、`admin-points-config`、`admin-template-config`、`join-claim`、`profile-edit`、`share-helper`。这些目录不得直接按线上页面通过处理，需先由前端说明入口层级、保留/废弃状态和是否进入最终大版本复拍。

| 层级 | 未注册目录 | 预期处理 | 截图/录屏 | 责任方 | 当前状态 |
| --- | --- | --- | --- | --- | --- |
| P3 | `admin-console` | 说明是否仍作为小程序内后台入口；若废弃需确认无主路径引用 | 如保留则 390 截图；如废弃则引用扫描结果 | 前端 / 后台 / PM | 待入口说明 |
| P3 | `admin-home-config` | 说明是否仍上线；避免与 Web 后台配置页混淆 | 如保留则配置页截图和权限提示 | 前端 / 后台 | 待入口说明 |
| P3 | `admin-points-config` | 说明是否仍上线；涉及积分需接口摘要 | 如保留则截图、权限和接口摘要 | 前端 / 后台 / 后端/API | 待入口说明 |
| P3 | `admin-template-config` | 说明是否仍上线；涉及模板需接口摘要 | 如保留则截图、权限和接口摘要 | 前端 / 后台 / 后端/API | 待入口说明 |
| P3 | `join-claim` | 说明是否由口令/二维码跳转使用；若使用需纳入邀请链路 | 390 截图；异常口令截图 | 前端 / 人工测试执行人 | 待入口说明 |
| P3 | `profile-edit` | 说明是否由我的页进入；涉及昵称头像授权 | 390 截图；权限拒绝状态 | 前端 / 人工测试执行人 | 待入口说明 |
| P3 | `share-helper` | 说明是否由分享海报或邀请链路调用 | 390 截图；分享失败态 | 前端 / 人工测试执行人 | 待入口说明 |

##### 13.16.18.4 后台相关页面验收矩阵

后台验收只面向 `api.pomer.cn` 的“聚会记录师/酒桌判官”后端与后台，不触碰 `pomer.cn` 公司官网。后台页面需 PM 授权窗口、后台测试账号、真实样本、operationLogs 和前台同步截图；本节不替后台标记完成。

| 层级 | 后台页面 | 必收证据 | 录屏需求 | 角色视角 | 接口/日志证据 | 当前状态 |
| --- | --- | --- | --- | --- | --- | --- |
| P3 | `/admin/login`、`/admin` | 登录页、302/登录成功、退出 | 登录/退出录屏 | 后台测试管理员 | `GET /admin`、`GET /admin/login`、登录响应摘要 | 待后台账号 / 待截图 |
| P3 | `/admin/pages/overview-dashboard` | 概览页无旧项目误导、数据卡加载 | 无，除非报错 | 后台测试管理员 | page schema 摘要、控制台无错 | 待截图 |
| P3 | `/admin/pages/content-moments-review` | 待审/已审/隐藏/重传样本、原因弹窗 | 审核动作必须录屏 | 后台管理员 + 前台上传者 | action 响应、operationLogs、前台同步 | 待授权窗口 / 待样本 |
| P3 | `/admin/pages/content-moment-reports` | 举报列表、处理动作、敏感信息不泄露 | 举报处理必须录屏 | 后台管理员 + 举报用户/被举报用户 | report action、operationLogs、前台同步 | 待授权窗口 / 待样本 |
| P3 | `/admin/pages/growth-share-tasks` | failed/expired 任务、retry、ready 图查看 | retry 必须录屏 | 后台管理员 + 前台分享者 | task retry 响应、operationLogs、前台任务状态 | 待 failed/expired 样本 |
| P3 | `/admin/pages/commerce-ranking-rewards` | 奖励配置保存、发奖、幂等、退款关联 | 保存/发奖必须录屏 | 后台管理员 + 榜单候选用户 | grant 响应、pointsLedger、payout、operationLogs | 待线上 rankings 路由闭环 |
| P3 | `/admin/pages/system-operation-logs` | 审核、举报、retry、奖励配置日志可追溯 | 日志核对录屏或截图 | 后台管理员 | operationLogId、目标 ID、原因、旧值/新值 | 待日志样本 |

##### 13.16.18.5 证据命名和责任方

| 证据类型 | 命名规则 | 责任方 | 当前状态 |
| --- | --- | --- | --- |
| 注册页面截图 | `PR-QA-FULL-PAGES-MATRIX-001-registered-<priority>-<page>-<state>-<width>-<device>-wx<version>-<build>-20260616.png` | 人工测试执行人；前端提供入口 | 待最后大版本一次性采集 |
| 未注册目录说明 | `PR-QA-FULL-PAGES-MATRIX-001-unregistered-<dir>-entry-status-<build>-20260616.md` | 前端 / PM | 待入口说明 |
| 后台页面截图/录屏 | `PR-QA-FULL-PAGES-MATRIX-001-admin-<slug>-<state>-<build>-20260616.png/mp4` | 后台 / 人工测试执行人 / PM | 待后台账号和授权窗口 |
| 接口摘要 | `PR-QA-FULL-PAGES-MATRIX-001-api-<page>-<state>-<build>-20260616.md` | 后端/API / 接口联调 / 人工测试执行人 | 待接口样本 |
| 控制台证据 | `PR-QA-FULL-PAGES-MATRIX-001-console-<page>-<state>-<device>-wx<version>-<build>-20260616.png` | 人工测试执行人 / 前端 | 待控制台截图 |
| 角色视角 | `PR-QA-FULL-PAGES-MATRIX-001-role-<role>-<page>-<state>-<width>-<device>-wx<version>-<build>-20260616.png` | PM / 人工测试执行人 | 待 A/B/C/outsider 登录态 |

##### 13.16.18.6 阻塞项与下一步责任

| 阻塞项 | 影响范围 | 责任方 | 需要补的证据 |
| --- | --- | --- | --- |
| 最终大版本构建和二维码未回收 | 全量页面截图、录屏无法执行 | 前端 / PM | 构建号、上传备注、体验版/预览二维码、入口说明 |
| 线上 `rankings` 路由未闭环 | P0 `rankings`、M5 推举/退款/奖励 | 后端/API / 接口联调 | 线上 200 响应或合同说明、中文空态截图、账务样本 |
| 缺 A/B/C/outsider 登录态 | 权限、私密、分享、邀请、榜单角色验收 | PM / 人工测试执行人 | 账号、角色、登录方式、可复现入口 |
| 未注册目录入口状态不明 | P3 页面是否纳入最终复拍不明确 | 前端 / PM | 保留/废弃说明、引用扫描、如保留则入口路径 |
| 后台账号和授权窗口未确认 | 后台页面只能准备矩阵，不能线上写操作验收 | PM / 后台 / 运维 | 后台测试账号、授权窗口、真实样本、operationLogs |
| 控制台和接口摘要缺失 | 401/loading、权限、分享、积分问题无法闭环 | 前端 / 后端/API / 接口联调 / 人工测试执行人 | 控制台截图、接口响应摘要、错误码合同 |
| UI/UX 全量目标图未逐页对应 | 全量页面只能做功能证据，不能写 UI/UX 通过 | UI/UX / 前端 | 全量目标图或页面级设计说明、实现截图对照 |

本轮结论：`PR-QA-FULL-PAGES-MATRIX-001` 已建立全量页面验收矩阵骨架，覆盖 36 个注册页面、7 个未注册目录和后台相关页面。当前统一保持 `待构建 / 待截图录屏 / 待接口控制台证据 / 待入口说明`；不向用户零散要图，最终仍并入最后大版本一次性采集包。

#### 13.16.19 `PR-QA-RANKINGS-PUBLISH-WAIT-001` 最终大版本榜单 smoke 等待项

记录时间：2026-06-16。PM 通知：服务器权限阻塞已处理，但线上 `rankings/today` 仍返回 404，当前尚未发布。测试侧只更新最终大版本和榜单 smoke 等待项；发布前不得把榜单、UI/UX 或真机准出写通过，不得改 PM 总台账。

##### 13.16.19.1 当前状态

| 项目 | 当前状态 | 测试结论边界 |
| --- | --- | --- |
| 服务器权限阻塞 | PM 通知已处理 | 只能记录阻塞解除，不等于线上榜单可测 |
| 线上 `rankings/today` | 仍 404，尚未发布 | `rankings` 页面、M5 推举/退款/奖励继续保持待联调/待复核 |
| 最终大版本截图 | 待发布后统一采集 | 不向用户零散要图；并入 13.16.17 和 13.16.18 最后大版本一次性包 |
| UI/UX 准出 | 待新版截图和目标图对照 | 不得写 UI/UX 通过 |
| 真机准出 | 待 iPhone 12 榜单页截图、控制台和接口摘要 | 不得写真机通过 |

##### 13.16.19.2 发布后榜单 smoke 必收证据

| 证据 | 执行时机 | 文件命名 | 责任方 | 当前状态 |
| --- | --- | --- | --- | --- |
| 公网 curl 摘要 | 后端/API 确认已发布后执行，只读请求 `https://api.pomer.cn/api/v1/rankings/today` 或当前合同路径 | `PR-QA-RANKINGS-PUBLISH-WAIT-001-public-curl-rankings-today-<build>-20260616.md` | 后端/API / 接口联调 / 测试 | 待发布 |
| iPhone 12 榜单页截图 | 公网 curl 非 404 后执行，设备为 iPhone 12 / iOS 26.5 / 微信 8.0.73 / 390 | `PR-QA-RANKINGS-PUBLISH-WAIT-001-ip12-rankings-390-wx8.0.73-<build>-20260616.png` | 人工测试执行人 / 前端 | 待截图 |
| 控制台无英文 `not found` | iPhone 12 打开 `pages/rankings/index` 时同步采集 | `PR-QA-RANKINGS-PUBLISH-WAIT-001-console-rankings-no-not-found-<build>-20260616.png` | 人工测试执行人 / 前端 | 待控制台截图 |
| 中文空态或榜单列表态 | 若接口有数据则截图列表态；无数据必须展示中文空态，不得裸露英文 `not found` | `PR-QA-RANKINGS-PUBLISH-WAIT-001-rankings-cn-empty-or-list-390-<build>-20260616.png` | 前端 / 人工测试执行人 / UI/UX 复核 | 待截图 |
| 推举/积分接口摘要 | 榜单页可打开后，再按样本验证推举确认、积分不足、重复推举、退款提示 | `PR-QA-RANKINGS-PUBLISH-WAIT-001-nomination-ledger-summary-<build>-20260616.md` | 后端/API / 接口联调 / UGC / 测试 | 待样本 |

##### 13.16.19.3 阻塞和退回规则

| 条件 | 测试处理 | 退回责任方 |
| --- | --- | --- |
| 发布前 `rankings/today` 仍 404 | 保持 `待线上 rankings 路由闭环`，不执行真机通过判定 | 后端/API / 接口联调 |
| 发布后 curl 仍 404 或合同路径不一致 | 记录 curl 摘要，退回接口合同或路由发布 | 后端/API / 接口联调 |
| 真机页面仍出现英文 `not found` | 记为 P1；如阻断榜单理解或入口则升 P0 | 前端 |
| 只有前端自测截图，无公网 curl 或控制台证据 | 只能写待复核，不能写榜单准出 | 前端 / 测试执行人 |
| 缺 UI/UX 对照截图 | 不能写 UI/UX 通过 | UI/UX / 前端 |

本轮结论：`PR-QA-RANKINGS-PUBLISH-WAIT-001` 已补入最终大版本榜单 smoke 等待项。当前保持 `待发布 / 待公网 curl 摘要 / 待 iPhone 12 榜单截图 / 待控制台无英文 not found 证据`；不得把榜单、UI/UX 或真机准出写通过。

#### 13.16.20 `PR-QA-RANKINGS-ONLINE-SMOKE-002` 榜单线上 smoke 证据回收记录

记录时间：2026-06-16。PM 发布通知：用户已授权发布，`rankings/today` 线上 404 已闭环为 200；本次只发布 `backend/server.js` 和 `backend/data/moments.js`，只重启 `jiuzhuopanguan-backend`，备份路径为 `/www/backup/jiuzhuopanguan/rankings-20260616-023609`。测试侧只更新测试计划和最终大版本采集包，不改 PM 总台账；本轮不得把榜单 smoke 通过扩展成全量准出。

##### 13.16.20.1 公网只读接口摘要

| 检查项 | 结果 | 证据摘要 | 测试结论边界 |
| --- | --- | --- | --- |
| `GET https://api.pomer.cn/api/v1/rankings/today?category=best_opening` | HTTP 200 / `code:0` | `data.category=best_opening`，`date=2026-06-16`，`items=[]` | 接口层可继续真机复拍；不等于榜单页面通过 |
| `GET https://api.pomer.cn/api/v1/rankings/today?category=today_highlight` | HTTP 200 / `code:0` | `data.category=today_highlight`，`date=2026-06-16`，`items=[]` | 接口层可继续真机复拍；不等于榜单页面通过 |
| `GET https://api.pomer.cn/api/v1/config/home` | HTTP 200 / `code:0` | 公共配置仍可访问 | 只作为发布后基础只读冒烟，不等于 UI 文案准出 |

##### 13.16.20.2 iPhone 12 真机证据回收状态

当前本地素材目录 `C:\Users\Administrator\Desktop\真机测试` 仅检出 2026-06-15 和 2026-06-16 00:26 旧批次截图，未发现本次发布后的 iPhone 12 榜单页截图或控制台截图。因此本节只登记接口层可继续和证据缺口，不写真机通过。

| 必收证据 | 文件命名 | 当前状态 | 责任方 | 缺口 |
| --- | --- | --- | --- | --- |
| iPhone 12 / iOS 26.5 / 微信 8.0.73 / 390 榜单页截图 | `C:\Users\Administrator\Desktop\真机测试\0616\03b15f4971a1422dd5749a4c4af6ae93.jpg` | 已收到截图，待控制台和复测 | 人工测试执行人 / 前端 | 截图显示 `今日回忆榜`，空态为中文；不能替代控制台证据 |
| 控制台无英文 `not found` | `PR-QA-RANKINGS-ONLINE-SMOKE-002-console-rankings-no-not-found-<build>-20260616.png` | 待控制台截图 | 人工测试执行人 / 前端 | 缺控制台截图，不能关闭 0616 英文 `not found` 问题 |
| 中文空态或列表态截图 | `C:\Users\Administrator\Desktop\真机测试\0616\03b15f4971a1422dd5749a4c4af6ae93.jpg` | 已收到中文空态截图，待控制台和复测 | 前端 / 人工测试执行人 / UI/UX | 接口当前 `items=[]`，截图显示“当前榜单还没有推举”；若后续有数据仍需列表态 |
| 分类切换截图 | `PR-QA-RANKINGS-ONLINE-SMOKE-002-rankings-category-switch-390-<build>-20260616.png` | 待截图 | 人工测试执行人 / 前端 | 缺 `today_highlight` 与 `best_opening` 切换证据 |
| 推举/积分样本 | `PR-QA-RANKINGS-ONLINE-SMOKE-002-nomination-ledger-summary-<build>-20260616.md` | 待样本 | 后端/API / 接口联调 / UGC / 测试 | 缺 nominationId、pointsLedgerId、积分不足、重复推举、退款样本 |

##### 13.16.20.3 状态更新与不得扩展边界

| 范围 | 本轮状态 | 不得扩展为 |
| --- | --- | --- |
| 榜单接口 smoke | 公网 `best_opening`、`today_highlight` 已 200，接口层可继续 | 不得写榜单页面通过 |
| 榜单真机 | 待 iPhone 12 榜单截图和控制台证据 | 不得写真机准出 |
| UI/UX | 待发布后截图与目标图对照 | 不得写 UI/UX 通过 |
| M5 推举/退款/奖励 | 待角色、样本、接口摘要和页面截图 | 不得写 M5 完成或风控准出 |
| 最终大版本采集包 | 13.16.17 已更新为接口层 200、待真机/控制台 | 不得替代 36 页全量矩阵或最终 375/414 补测 |

##### 13.16.20.4 下一步责任

| 责任方 | 下一步需要补的证据 |
| --- | --- |
| 人工测试执行人 / 前端 | 发布后 iPhone 12 榜单页截图、分类切换截图、控制台无英文 `not found` 截图 |
| 后端/API / 接口联调 | 若后续需要非空列表态，提供可查询的榜单样本或接口摘要；补推举、积分不足、重复推举、退款样本 |
| UGC 风控 | 复核可推举/不可推举、隐藏/待审/私密节点不应上榜的样本口径 |
| UI/UX | 等发布后真机截图回收后，再按目标图对照复核中文空态、列表态、分类切换和按钮状态 |
| PM | 汇总最终大版本一次性截图窗口和构建号，避免继续零散向用户索要截图 |

本轮结论：`PR-QA-RANKINGS-ONLINE-SMOKE-002` 已记录公网接口层 200，`rankings/today` 线上 404 问题在接口层可继续；本地已回收到 1 张发布后 iPhone 12 榜单中文空态截图，但仍缺控制台无英文 `not found`、分类切换、列表态、推举/积分/退款样本。当前只能写 `接口层可继续 / 榜单中文空态截图已收到 / 待控制台和功能证据`，不得把榜单 smoke 通过扩展为全量准出。

#### 13.16.21 `PR-QA-0616-RANKINGS-FLOW-REVIEW-002` 0616 新增排行榜截图与全流程视频问题记录

记录时间：2026-06-16。用户补充：`C:\Users\Administrator\Desktop\真机测试\0616` 已补排行榜截图和全流程视频；当前仍有大量按钮未联通，分享保存图片报错。测试侧只登记证据与失败项，不改源码、不改 PM 总台账、不写真机或 UI/UX 准出。

##### 13.16.21.1 新增素材登记

| 文件 | 类型 | 时间 | 覆盖内容 | 初判 |
| --- | --- | --- | --- | --- |
| `C:\Users\Administrator\Desktop\真机测试\0616\03b15f4971a1422dd5749a4c4af6ae93.jpg` | JPG 截图 | 2026-06-16 02:53 | `pages/rankings/index` 榜单页；标题 `今日回忆榜`；分类含 `人气榜`、`欢乐榜`、`回忆榜`、`开场照`；空态中文“当前榜单还没有推举” | 可登记为 iPhone 12 / 390 榜单中文空态截图；不能替代控制台、列表态、推举/积分样本 |
| `C:\Users\Administrator\Desktop\真机测试\0616\616114085227aa8023c4e53454c81acf.mp4` | MP4 全流程视频 | 2026-06-16 02:53 | 用户反馈为全流程视频，暴露大量按钮未联通、分享保存图片报错 | 作为 P0/P1 问题定位视频；需前端逐按钮回放定位和补修复清单 |

##### 13.16.21.2 新增失败项

| 失败编号 | 页面/链路 | 失败描述 | 严重级别 | 退回对象 | 当前状态 |
| --- | --- | --- | --- | --- | --- |
| `PR-QA-0616-FAIL-006` | 全流程多页面按钮 | 用户反馈“仍有大量按钮未联通”；影响范围需以前端逐按钮清单确认 | 若阻断创建、邀请、拍照、上传、分享、榜单任一主路径则 P0；非主路径按钮 P1/P2 | 前端负责人；必要时 PM 明确废弃入口 | 待前端逐按钮定位 / 待修复 / 待复测 |
| `PR-QA-0616-FAIL-007` | `share-poster/share-preview` 保存图片 | 用户反馈“分享保存图片报错”；当前缺错误截图、控制台、taskId、imageUrl、授权状态 | 分享保存主动作失败按 P0；若仅个别授权态失败按 P1，但必须有降级引导 | 前端负责人；如 imageUrl、下载域名或 task 状态合同异常，同步后端/API、接口联调 | 待错误证据 / 待修复 / 待复测 |

##### 13.16.21.3 复测要求

| 复测项 | 必收证据 | 责任方 | 当前状态 |
| --- | --- | --- | --- |
| 按钮联通清单 | 页面、按钮文案、预期跳转/动作、实际结果、是否主路径、失败截图或视频时间点 | 前端 / 人工测试执行人 | 待前端逐按钮定位 |
| 分享保存图片错误 | 错误弹窗截图、控制台截图、taskId、imageUrl、保存授权状态、下载域名/临时文件路径摘要 | 前端 / 后端/API / 接口联调 / 人工测试执行人 | 待错误证据 |
| 榜单控制台 | 打开榜单页、分类切换后控制台无英文 `not found`，无 404 重刷 | 人工测试执行人 / 前端 | 待控制台截图 |
| 榜单列表态和推举 | 有数据列表态、推举确认、积分不足、重复推举、退款提示 | 后端/API / 接口联调 / UGC / 人工测试执行人 | 待样本 |
| 全流程视频复测 | 首页创建聚会 -> 邀请/二维码 -> 拍第一张 -> 相册/简报 -> 分享保存图片，失败时标注时间点 | 人工测试执行人 / 前端 | 待修复后复测 |

##### 13.16.21.4 本批结论

本批新增素材可以把 `rankings` 英文 `not found` 页面可见问题初步收敛为“中文空态已出现”，但控制台未提供，不能关闭 `PR-QA-RANKINGS-ONLINE-SMOKE-002`。全流程视频和用户反馈暴露“按钮未联通”和“分享保存图片报错”，其中分享保存失败阻断分享主动作，按 P0 退回前端优先处理；若涉及图片 URL、下载域名、task 状态或保存授权合同，再同步后端/API 与接口联调。当前状态保持 `问题定位 / 待前端修复 / 待错误证据 / 待复测`，不得写全量真机通过。

##### 13.16.21.5 建议 PM 派工拆分

说明：测试侧不直接修改 PM 总台账，本表只作为测试验收负责人给 PM 的派工建议。当前无法从本线程自动解析 MP4 的精确时间点；已登记视频文件和用户反馈，具体按钮时间点需前端或人工测试执行人回放补齐。

| 建议任务编号 | 建议派给 | 任务内容 | 必交证据 | 测试侧接收条件 | 当前状态 |
| --- | --- | --- | --- | --- | --- |
| `PR-FE-BUTTON-WIRING-001` | 前端负责人 | 按全流程视频逐页排查未联通按钮，至少覆盖首页、创建聚会、邀请/二维码、拍照/上传、记录/相册、简报、分享、榜单、我的页 | 按钮清单：页面路径、按钮文案、预期动作、实际结果、是否主路径、修复文件、修复前后截图或视频时间点 | 主路径按钮全部可点击并有明确反馈；废弃入口必须隐藏或由 PM 标注低频/历史兼容 | 待 PM 派发 / 待前端定位 |
| `PR-FE-SHARE-SAVE-FIX-001` | 前端负责人 | 修复 `share-poster/share-preview` 保存图片报错，覆盖保存权限、下载临时文件、相册授权、失败降级提示 | 错误复现截图、修复后保存成功录屏、控制台无报错截图、taskId/imageUrl/授权状态摘要 | iPhone 12 真机可保存图片；失败态有中文提示和重试/授权引导；不得白屏或静默失败 | 待 PM 派发 / P0 |
| `PR-API-SHARE-SAVE-CONTRACT-001` | 后端/API + 接口联调 | 复核分享图片 URL、content-type、下载域名、task ready 状态、过期/failed 返回合同 | ready task 响应、PNG 200、content-type、expired/failed 错误码、下载域名说明 | 若前端保存失败涉及 URL/域名/任务状态，接口合同必须可复跑并可被前端消费 | 条件触发；待前端错误摘要 |
| `PR-UX-BUTTON-STATE-REVIEW-001` | UI/UX 负责人 | 对修复后的按钮状态做视觉复核：默认、点击、禁用、加载、失败，确认不越界、不遮挡、不混旧风格 | 修复后截图对照、按钮状态对照、必要时标注目标图差异 | 只在前端修复并回收截图后复核；不得用设计图替代真机实现截图 | 待前端修复后进入 |
| `PR-QA-FLOW-RETEST-003` | 人工测试执行人 / 测试负责人 | 修复后复测全流程和分享保存，复拍 iPhone 12 / 390；补控制台截图 | 全流程复测 MP4、分享保存成功/失败态截图、控制台无报错、榜单无英文 `not found` | 只覆盖本轮 P0/P1 回归，不扩展为全量准出；375/414 仍进最终大版本补测 | 待修复后执行 |
| `PR-PM-FINAL-CAPTURE-WINDOW-001` | PM | 汇总最终大版本一次性采集窗口，避免继续零散向用户要截图；确认构建号、二维码、登录态和采集清单 | 构建号、二维码、测试账号、采集窗口、一次性截图/录屏清单 | 测试按 13.16.17/13.16.18 执行，不接受零散补图作为最终准出 | 待 PM 确认 |

##### 13.16.21.6 复测准入顺序

| 顺序 | 准入条件 | 未满足时处理 |
| --- | --- | --- |
| 1 | 前端提交 `PR-FE-BUTTON-WIRING-001` 按钮清单和修复回报 | 不执行全流程通过判定，只保留 P0/P1 阻塞 |
| 2 | 前端提交 `PR-FE-SHARE-SAVE-FIX-001`，并给出保存图片错误原因、修复点和自测证据 | 分享保存仍按 P0 阻塞，不进入分享准出 |
| 3 | 如保存失败涉及 URL、下载域名、task 状态或 content-type，后端/API 和接口联调补合同摘要 | 无接口摘要时只能退前端/接口联调共同复核，不能归因闭环 |
| 4 | 人工测试执行人回收 iPhone 12 全流程复测视频、分享保存截图、控制台无报错截图 | 无真实真机证据不得写通过 |
| 5 | UI/UX 根据修复后真机截图复核按钮状态和分享页体验 | 无实现截图不得写 UI/UX 通过 |

本节派工建议结论：当前 P0 优先级为 `PR-FE-SHARE-SAVE-FIX-001` 和主路径按钮联通；测试侧下一步只能等待前端修复回报、接口条件证据和人工复测素材。发布后榜单中文空态截图已登记，但全量准出仍被按钮未联通、分享保存报错、控制台缺失和最终多宽度证据阻塞。

#### 13.16.22 `PR-QA-WINE-HISTORY-BACK-BLOCKER-001` 我的相册返回阻塞记录

记录时间：2026-06-16。用户反馈：“我的相册无法返回其他页面”。测试侧只登记问题、只读核查页面入口和建议派工；不改业务源码、不改 PM 总台账、不写真机通过。

##### 13.16.22.1 已核查内容

| 核查项 | 结果 | 测试判断 |
| --- | --- | --- |
| 页面路径 | `pages/wine-history/index`，页面标题 `我的相册` | 属于 P0/P1 主路径相册/历史页 |
| 顶部导航 | `miniprogram/pages/wine-history/index.wxml` 使用 `<navigation-bar back="{{true}}">` | 顶部有返回入口，但用户真机反馈无法返回，需按入口场景复现 |
| 入口来源 | 首页最近相册、我的页统计/功能、记录页、简报页、分享任务等均可能进入 `wine-history` | 需覆盖多入口页面栈，不只测单一入口 |
| 页面内跳转 | `wine-history` 中存在 `openPage`、`wx.navigateBack()`、`wx.redirectTo()`、`wx.reLaunch()` 等路径 | 页面栈可能被 `redirectTo/reLaunch` 改写，返回兜底需前端复核 |

##### 13.16.22.2 新增失败项

| 失败编号 | 页面/链路 | 失败描述 | 严重级别 | 退回对象 | 当前状态 |
| --- | --- | --- | --- | --- | --- |
| `PR-QA-0616-FAIL-008` | `pages/wine-history/index` 我的相册返回 | 用户反馈“我的相册无法返回其他页面”；需确认顶部返回、页面内“返回我的/继续记录/去创建”、从首页/我的/简报/记录页进入后的返回兜底 | 若无法返回首页、我的页或上一主路径，阻断继续创建/拍照/分享，判 P0；若仅低频入口返回异常，判 P1 | 前端负责人；如入口层级不清，PM 明确默认返回目标 | 待前端复现 / 待修复 / 待复测 |

##### 13.16.22.3 建议 PM 派工

| 建议任务编号 | 建议派给 | 任务内容 | 必交证据 | 测试侧接收条件 | 当前状态 |
| --- | --- | --- | --- | --- | --- |
| `PR-FE-WINE-HISTORY-BACK-FIX-001` | 前端负责人 | 修复 `wine-history` 多入口返回兜底，覆盖顶部返回、页面内返回按钮、空态按钮、从首页/我的/简报/记录页/分享任务进入后的返回目标 | 入口矩阵、页面栈说明、修复文件、修复前后录屏或截图、异常兜底策略 | iPhone 12 真机从每个入口进入后均可返回可继续操作的页面；页面栈为空时必须有明确 fallback，如首页或我的页 | 待 PM 派发 / 待前端修复 |
| `PR-QA-WINE-HISTORY-BACK-RETEST-001` | 人工测试执行人 / 测试负责人 | 修复后复测我的相册返回链路 | iPhone 12 / 390 录屏，覆盖从首页、我的页、简报页、记录页进入后返回 | 只能关闭本返回问题；不能扩展为全量相册/历史页通过 | 待修复后执行 |

##### 13.16.22.4 复测矩阵

| 入口 | 操作 | 预期 | 必收证据 | 当前状态 |
| --- | --- | --- | --- | --- |
| 首页最近相册 | 首页 -> 我的相册 -> 顶部返回 | 返回首页或可继续创建/拍照的页面 | 录屏或连续截图 | 待复测 |
| 我的页功能入口 | 我的 -> 我的相册 -> 顶部返回 / 返回我的 | 返回我的页，不陷入空白或不可操作页 | 录屏或连续截图 | 待复测 |
| 聚会简报入口 | 简报 -> 我的相册/历史 -> 返回 | 返回简报或明确兜底到我的/首页 | 录屏或连续截图 | 待复测 |
| 记录/相册入口 | 记录页 -> 我的相册 -> 返回 | 返回记录页或明确兜底，不丢失当前聚会 | 录屏或连续截图 | 待复测 |
| 分享任务入口 | 分享任务/待分享 -> 我的相册 -> 返回 | 返回分享任务列表或我的页，不阻断分享保存复测 | 录屏或连续截图 | 待复测 |

本节结论：`PR-QA-0616-FAIL-008` 已登记。我的相册返回问题影响主路径回流和分享/相册复测，建议 PM 优先派给前端执行 `PR-FE-WINE-HISTORY-BACK-FIX-001`；修复前不得写 `wine-history`、记录/相册、分享相关真机准出。

#### 13.16.23 `PR-QA-FLOW-UX-DB-TASKFORCE-001` 流程顺畅专项派工包

记录时间：2026-06-16。用户要求“确保流程顺利无卡壳，UX 体验正常，视觉流程引导必须顺利，前后端数据库正常”。测试侧只整理专项派工包和验收准入，不改 PM 总台账、不改业务源码、不替前端/后端/UI/UX/风控写通过。

##### 13.16.23.1 当前必须先解决的卡壳点

| 卡壳点 | 已有证据/来源 | 影响 | 严重级别 | 当前状态 |
| --- | --- | --- | --- | --- |
| 大量按钮未联通 | 用户反馈 + `616114085227aa8023c4e53454c81acf.mp4` | 主路径可能无法继续创建、拍照、分享、返回 | P0/P1，按按钮所在路径判定 | 待前端逐按钮定位 |
| 分享保存图片报错 | 用户反馈 | 分享主动作失败，影响传播闭环 | P0 | 待错误截图/控制台/taskId |
| 我的相册无法返回 | 用户反馈 + `wine-history` 多入口只读核查 | 相册/历史页回流卡死，影响继续创建、拍照、分享 | P0/P1 | 待前端修复 |
| 榜单控制台证据缺失 | 已有中文空态截图，但无控制台 | 不能关闭英文 `not found` 和 404 重刷风险 | P1 | 待控制台 |
| 前后端/数据库完整链路未复核 | 当前仅有部分公网 200 和历史 smoke 证据 | 不能证明创建、上传、简报、分享、榜单、积分数据一致 | P0/P1 | 待后端/API、接口联调补样本 |

##### 13.16.23.2 建议 PM 立即派工表

| 优先级 | 建议任务编号 | 建议派给 | 任务目标 | 必交证据 | 测试接收条件 |
| --- | --- | --- | --- | --- | --- |
| P0 | `PR-FE-FLOW-NO-STUCK-001` | 前端负责人 | 打通主路径按钮和页面跳转：首页 -> 创建聚会 -> 邀请/二维码 -> 拍第一张 -> 记录/相册 -> 简报 -> 分享保存 -> 我的/返回 | 逐按钮清单、修复文件、修复前后录屏、控制台无红错截图 | 主路径每一步有明确可点击 CTA、loading、失败提示和返回兜底，不出现无响应按钮 |
| P0 | `PR-FE-SHARE-SAVE-FIX-001` | 前端负责人 | 修复分享保存图片报错，覆盖 ready 图保存、授权拒绝、下载失败、重试 | 错误复现、修复后保存成功真机录屏、taskId/imageUrl、控制台截图 | iPhone 12 真机保存成功；失败态中文提示和引导完整 |
| P0 | `PR-FE-WINE-HISTORY-BACK-FIX-001` | 前端负责人 | 修复我的相册多入口返回，确保页面栈为空时也有首页/我的兜底 | 入口矩阵、页面栈说明、修复后返回录屏 | 从首页/我的/简报/记录/分享任务进入均可返回可操作页 |
| P0 | `PR-API-DB-FLOW-SMOKE-001` | 后端/API 负责人 | 复核线上只读和必要测试样本的数据链路：session、moment、brief、share task、rankings、points ledger | 公网 curl 摘要、DB/数据样本 ID、错误码合同、必要的只读日志摘要 | 接口返回和前端页面状态一致；无 404/401 重刷；数据 ID 可追溯 |
| P0 | `PR-INT-FLOW-FIXTURE-001` | 接口联调负责人 | 固定一套可复跑样本，覆盖空态、列表态、失败态和权限态 | sessionId、momentId、briefId、taskId、ranking category、nominationId、ledgerId、token/角色说明 | 测试可按样本复跑，不临时污染真实用户数据 |
| P0 | `PR-UX-FLOW-GUIDANCE-001` | UI/UX 负责人 | 复核视觉流程引导：主 CTA 是否清楚、下一步是否明显、按钮状态是否统一、空/错/加载是否有行动指引 | 实现截图标注、问题退回码、按钮状态对照、流程引导建议 | 只能基于真机实现截图复核；不得用设计图代替通过证据 |
| P1 | `PR-QA-FLOW-RETEST-004` | 测试/人工测试执行人 | 前端/后端/接口修复后执行 iPhone 12 主流程复测 | 全流程 MP4、关键页截图、控制台、接口摘要索引、失败时间点 | 只验证本轮 P0/P1 卡壳项；不扩展为全量准出 |
| P1 | `PR-PM-FINAL-RELEASE-GATE-001` | PM | 建立最终大版本准出门禁，统一收口截图、录屏、构建号、角色、接口、DB 证据 | 准出清单、责任人、截止时间、证据目录 | 所有 P0 已修复且测试复核后，才允许进入最终多宽度补测 |

##### 13.16.23.3 前后端和数据库正常的测试准入

| 链路 | 后端/API 必收 | 数据库/数据样本必收 | 前端必收 | 测试判定 |
| --- | --- | --- | --- | --- |
| 创建聚会 | 创建/读取 session 响应摘要、错误码 | sessionId、host profileId、createdAt、状态 | 创建成功页、邀请入口、失败提示 | 无 sessionId 或页面无下一步均 P0 |
| 拍第一张 | upload + moment create 响应摘要 | momentId、imageUrl、visibility、uploader profileId | 上传中、成功、失败、权限拒绝截图/录屏 | 图片缺失、无失败引导或无法继续均 P0 |
| 记录/相册 | timeline/history 响应摘要 | session/moment 关联、私密过滤、相册列表 | 相册页、返回、继续拍照、空态/列表态 | 返回卡死或数据不一致 P0/P1 |
| 简报 | brief create/read 响应摘要 | briefId、nodeCount、filtered nodes | 简报页、分享入口、待补图提示 | 旧文案主标题或分享入口卡死 P1/P0 |
| 分享保存 | share task ready/failed/expired 合同、PNG 200、content-type | taskId、imageUrl、status、filteredNodeIds | 预览、保存成功、授权拒绝、失败重试 | 保存报错仍为 P0 |
| 榜单/积分 | rankings 200、nomination/eligibility、points ledger | nominationId、ledgerId、refund/payoutId | 中文空态/列表态、推举、积分不足、重复推举 | 无接口样本不能写 M5 准出 |

##### 13.16.23.4 UX 与视觉流程引导验收准入

| 页面/节点 | 必须正常 | 失败判定 | 责任方 |
| --- | --- | --- | --- |
| 首页 | 创建聚会、加入聚会、继续记录三个主动作首屏可见 | 主动作被工具/旧玩法/厚卡挤压，或按钮无响应，P0/P1 | 前端 + UI/UX |
| 创建聚会 | 三步进度、主题选择、创建并邀请 CTA 清楚 | 主题卡裁切、CTA 不明显、需要处理旧玩法才能创建，P0/P1 | 前端 + UI/UX |
| 邀请/二维码 | 二维码/口令、安全区、拍第一张 CTA 明确 | 用户不知道下一步或二维码/按钮被遮挡，P0 | 前端 + UI/UX |
| 拍照/上传 | 拍照/相册选择、上传中、保存成功、失败重试清楚 | 上传失败无引导、权限拒绝无回路、按钮不可点，P0 | 前端 + UI/UX |
| 记录/相册 | 返回、继续拍照、查看简报、分享入口清楚 | 我的相册无法返回、相册入口卡死，P0/P1 | 前端 + UI/UX |
| 分享/保存 | 预览、保存图片、授权拒绝、重试清楚 | 保存图片报错或静默失败，P0 | 前端 + UI/UX + API |

##### 13.16.23.5 测试执行顺序

| 顺序 | 前置 | 执行动作 | 停止条件 |
| --- | --- | --- | --- |
| 1 | 前端提交按钮联通和分享保存修复 | 复跑首页 -> 创建 -> 邀请 -> 拍第一张 -> 相册返回 | 任一主按钮无响应或返回卡死，停止并退前端 |
| 2 | 后端/API 和接口联调提交样本 | 对照页面动作核接口摘要和样本 ID | 页面状态与接口/DB 样本不一致，退前后端联调 |
| 3 | 分享保存修复完成 | 复测 share-poster/share-preview 保存成功、授权拒绝、失败重试 | 保存报错、无中文提示或控制台红错，退前端/API |
| 4 | UI/UX 收到修复后截图 | 复核视觉引导、按钮状态、空/错/加载 | CTA 不明显、旧视觉阻断主路径，退 UI/UX + 前端 |
| 5 | P0 全部清零 | 执行最终大版本一次性采集包 | 缺构建号、角色、控制台、接口样本时不得准出 |

本节结论：测试侧建议 PM 以 `PR-FE-FLOW-NO-STUCK-001`、`PR-FE-SHARE-SAVE-FIX-001`、`PR-FE-WINE-HISTORY-BACK-FIX-001`、`PR-API-DB-FLOW-SMOKE-001`、`PR-INT-FLOW-FIXTURE-001`、`PR-UX-FLOW-GUIDANCE-001` 为当前核心派工。目标是先清 P0 卡壳，再做 UI/UX 视觉引导复核，最后进入最终大版本一次性采集；未拿到真实截图、录屏、接口响应、数据库/样本 ID 和控制台证据前，不得写全量准出。

#### 13.16.24 `PR-QA-ALBUM-TAIL-LENGTH-001` 相册页面拖尾过长体验问题

记录时间：2026-06-16。用户反馈：“相册页面拖尾太长，影响页面长度，浪费用户时间。”测试侧登记为相册/历史页体验失败项；不改源码、不改 PM 总台账、不写真机通过。

##### 13.16.24.1 问题判定

| 失败编号 | 页面/链路 | 失败描述 | 严重级别 | 退回对象 | 当前状态 |
| --- | --- | --- | --- | --- | --- |
| `PR-QA-0616-FAIL-009` | `pages/wine-history/index`、`pages/live-record/index` 相册/记录页 | 相册页面底部拖尾过长，页面长度被无效空白或过长列表拉长，用户需要额外滚动才能确认没有内容或找到返回/继续拍照/分享动作 | 若拖尾遮蔽或下沉返回、继续拍照、分享保存等主动作，判 P0；仅浪费浏览时间但不阻断主动作，判 P1 | 前端负责人 + UI/UX 负责人 | 待前端定位 / 待 UI/UX 给长度规范 / 待复测 |

##### 13.16.24.2 建议 PM 派工

| 建议任务编号 | 建议派给 | 任务内容 | 必交证据 | 测试侧接收条件 | 当前状态 |
| --- | --- | --- | --- | --- | --- |
| `PR-FE-ALBUM-TAIL-COMPACT-001` | 前端负责人 | 收敛相册/历史页拖尾长度：检查空态容器、scroll-view 高度、底部 padding、安全区、列表末项 margin、占位图高度、加载/错误态高度 | 修复前后 iPhone 12 / 390 截图或录屏；说明调整的 class/文件；空态、1 项、3 项、长列表状态截图 | 空态和短列表首屏能判断内容结束；底部不出现大段无效空白；返回/继续拍照/分享入口不被拖尾下沉 |
| `PR-UX-ALBUM-LENGTH-GUIDANCE-001` | UI/UX 负责人 | 给出相册/历史页页面长度和空态规范：首屏内容密度、底部留白上限、列表收敛、更多/折叠/分页策略 | 页面长度规范、标注图、空态/短列表/长列表建议 | 规范必须基于 iPhone 12 / 390 真机截图，不得只给抽象设计口号 |
| `PR-QA-ALBUM-TAIL-RETEST-001` | 人工测试执行人 / 测试负责人 | 修复后复测相册拖尾，覆盖 `wine-history` 和 `live-record` | iPhone 12 / 390 空态、1 项、3 项、长列表录屏；必要时补 375/414 | 只关闭拖尾问题，不扩展为全量相册准出 |

##### 13.16.24.3 复测规则

| 状态 | 预期 | 失败判定 | 必收证据 |
| --- | --- | --- | --- |
| 空相册 | 首屏能看到空态说明和下一步动作，底部无大段无效拖尾 | 用户需要明显下滑才能确认页面结束，或空态后仍有大量空白，判 P1；若主 CTA 不可见，判 P0 | 390 截图；必要时滚动录屏 |
| 短列表 1-3 项 | 列表末尾紧凑，返回/继续拍照/分享入口不被挤压 | 末项后拖尾超过一个明显屏段或误导用户继续滚动，判 P1 | 390 截图/录屏 |
| 长列表 | 提供分组、折叠、分页、搜索或“更多”，避免单列无限拖长 | 长列表连续单列且无降噪，导致主动作不可达，判 P0；影响效率判 P1 | 滚动录屏、列表数量记录 |
| 底部安全区 | 只保留必要安全区，不用大空白补位 | 安全区/占位层造成拖尾或遮挡，判 P1/P0 | 底部近景截图 |

##### 13.16.24.4 关联阻塞

相册拖尾问题与 `PR-QA-0616-FAIL-008` 我的相册无法返回、`PR-QA-0616-FAIL-006` 按钮未联通共同影响相册页可用性。前端修复时应合并检查返回、底部 CTA、列表长度和空态高度；UI/UX 复核时应同时确认视觉流程引导是否让用户明确“这里结束了，下一步去哪”。修复前不得写 `wine-history` / `live-record` 相册体验通过。

#### 13.16.25 `PR-QA-FLOW-RETEST-004` / `PR-QA-ALBUM-TAIL-RETEST-001` / `PR-QA-RANKINGS-ONLINE-SMOKE-002` 回包后复测启动记录

记录时间：2026-06-16。PM 通知前端 `PR-FE-FLOW-NO-STUCK-001` / `PR-FE-SHARE-SAVE-FIX-001` / `PR-FE-WINE-HISTORY-BACK-FIX-001` / `PR-FE-ALBUM-TAIL-COMPACT-001` 已收口；接口联调 `PR-INT-FLOW-FIXTURE-001`、后端 `PR-API-DB-FLOW-SMOKE-001`、UI/UX `PR-UX-FLOW-GUIDANCE-001` / `PR-UX-ALBUM-LENGTH-GUIDANCE-001` 已回收。测试侧本轮只更新复测启动记录和只读接口摘要，不改源码、不改 PM 总台账、不写全量准出；缺截图/录屏/控制台/API 摘要的项继续保持待证据。

##### 13.16.25.1 已读取回包摘要

| 角色 / 任务 | 回包摘要 | 测试接收边界 |
| --- | --- | --- |
| 前端 `PR-FE-FLOW-NO-STUCK-001` | 前端计划 14.18 记录：`live-record` 分段按钮已补 `activeSegment` / `handleSegmentTap()`；`invite-group` 空 `sessionId` 增加保护提示 | 只代表代码侧已收口；仍需 iPhone 12 真机点击录屏和控制台 |
| 前端 `PR-FE-SHARE-SAVE-FIX-001` | `share-preview` / `share-poster` 增加相册权限兜底；`share-poster` 增加隐藏 canvas 与前端分享图兜底 | 仍需真机保存成功/失败态证据、控制台和 taskId/imageUrl |
| 前端 `PR-FE-WINE-HISTORY-BACK-FIX-001` | `wine-history` 增加自定义返回，优先 `navigateBack`，失败后 `redirectTo('/pages/me/index')`，再兜底 `reLaunch('/pages/index/index')` | 仍需多入口返回录屏 |
| 前端 `PR-FE-ALBUM-TAIL-COMPACT-001` | `wine-history` 底部 CTA 移出 scroll 并固定到底部安全区；`live-record` 压缩相册墙、空态贴纸和固定按钮安全区 | 仍需空态、短列表、长列表拖尾复拍 |
| 接口联调 `PR-INT-FLOW-FIXTURE-001` | 3.12 提供 `session-1781507687012-e4343d`、`inviteCode=C56EVT`、opening/private/brief/share task 四态、rankings/nomination/ledger 固定样本 | 本地/LAN fixture 可复拍；不代表线上写入或今日榜有数据 |
| 后端/API `PR-API-DB-FLOW-SMOKE-001` | 22 节记录本地 session/timeline/brief/share task/rankings/ledger 只读链路和公网 rankings/config 200 | 支撑只读复测；不支撑线上全链路通过、今日榜列表态或新增写入 |
| UI/UX `PR-UX-FLOW-GUIDANCE-001` / `PR-UX-ALBUM-LENGTH-GUIDANCE-001` | 12.7.8 提供按钮状态、流程引导、空/错/加载、相册长度和底部留白准出标准 | 只能作为复测判定规则；UI/UX 不写设计通过 |

##### 13.16.25.2 本轮只读 API 摘要

执行范围：只读 GET，不线上写入、不 cleanup、不暴露完整 token。

| 检查项 | 结果 | 备注 |
| --- | --- | --- |
| 本地 `/session-briefs/brief-1781507687042-d1990edd` | HTTP 200 / `code:0` | 可作为 brief 页面复拍可读路径 |
| 本地 `/sessions/session-1781507687012-e4343d/brief` | HTTP 404 / `code:404` | `PR-INT-BRIEF-PATH-CONTRACT-001` 已确认：无 `GET /sessions/{sessionId}/brief`，该 404 不作为读取接口失败；生成/刷新使用 `POST /sessions/{sessionId}/brief` |
| 本地 `/sessions/session-1781507687012-e4343d/timeline` | HTTP 200 / `nodeCount=5` | 可用于 `live-record` 复拍数据 |
| 本地 `/sessions/live?sessionId=session-1781507687012-e4343d` | HTTP 200 | 可用于 session 读取和邀请保护复测 |
| 本地 ready share task | HTTP 200 / `status=ready` / 有 `imageUrl` | 可用于保存图片复测；仍缺真机保存截图/录屏 |
| 本地 failed share task | HTTP 200 / `status=failed` | 可用于失败态复测 |
| 本地 expired share task | HTTP 200 / `status=expired` | 可用于过期态复测 |
| 本地 rankings `best_opening` | HTTP 200 / `items=[]` | 空榜，只能测中文空态 |
| 本地 memberB eligibility | HTTP 200 / `eligible=true` / `pointsCost=10` | 可用于推举资格只读判断；不执行写入 nomination |
| 本地 memberB commerce | HTTP 200 / `points=70` | 可用于 ledger 只读对照 |
| 公网 rankings `best_opening` | HTTP 200 / `items=[]` | 线上路由已 200；仍缺真机控制台无英文 `not found` |
| 公网 rankings `today_highlight` | HTTP 200 / `items=[]` | 线上空榜 |
| 公网 `config/home` | HTTP 200 / `code:0` | 基础服务只读可达 |

##### 13.16.25.3 复测矩阵状态

| 复测任务 | 页面 / 流程 | 必收证据 | 当前状态 | 不得写通过原因 |
| --- | --- | --- | --- | --- |
| `PR-QA-FLOW-RETEST-004` | `live-record` 分段按钮：记录 / 相册 / 分享 | iPhone 12 / iOS 26.5 / 微信 8.0.73 录屏；点击后反馈或跳转；控制台无红错 | 待截图/待录屏/待控制台 | 当前目录未见前端收口后的新真机录屏 |
| `PR-QA-FLOW-RETEST-004` | `share-preview` / `share-poster` 保存图片 | ready task 保存成功录屏；权限拒绝后引导截图；失败态中文提示；taskId/imageUrl 摘要 | 待截图/待录屏/待控制台 | 只有接口 ready task 200，缺真机保存证据 |
| `PR-QA-FLOW-RETEST-004` | `wine-history` 返回 | 从首页、我的页、简报页、记录页、分享任务进入后返回录屏 | 待录屏 | 只有前端修复说明，缺多入口真机返回证据 |
| `PR-QA-ALBUM-TAIL-RETEST-001` | `wine-history` / `live-record` 相册/记录拖尾 | 空态、1 项、3 项、长列表 iPhone 12 / 390 截图或滚动录屏 | 待截图/待录屏 | 只有前端修复说明和 UI/UX 标准，缺复拍 |
| `PR-QA-FLOW-RETEST-004` | `invite-group` 空 session 保护 | 空 `sessionId` 点击预览/拍第一张时中文保护提示截图或录屏 | 待截图/待录屏 | 缺真机空 session 场景证据 |
| `PR-QA-BRIEF-PATH-RETEST-001` | `session-brief` 读取路径 | 使用 `briefId=brief-1781507687042-d1990edd&sessionId=session-1781507687012-e4343d` 打开 brief；记录页面截图、控制台、`GET /session-briefs/{briefId}` API 摘要；不再把 `GET /sessions/{sessionId}/brief` 404 当作读取失败 | 待截图/待控制台/待 API 摘要 | 缺真机 brief 页面截图、控制台和复拍 API 摘要 |
| `PR-QA-RANKINGS-ONLINE-SMOKE-002` | rankings 线上 200 和无英文 `not found` | 公网 200 摘要、iPhone 12 榜单页截图、控制台无英文 `not found`、分类切换截图 | 接口 200；待控制台/分类切换 | 只有一张中文空态截图，缺控制台和分类切换 |

##### 13.16.25.4 本轮阻塞项

| 阻塞项 | 责任方 | 需要补的证据 |
| --- | --- | --- |
| 前端收口后未见新真机截图/录屏 | 人工测试执行人 / 前端 | iPhone 12 主流程、live-record 分段按钮、share 保存、wine-history 返回、album 拖尾、invite 空 session 保护录屏 |
| 控制台证据缺失 | 人工测试执行人 / 前端 | 榜单无英文 `not found`、分享保存无红错、wine-history 无 401/loading 配对警告截图 |
| brief 路径复拍证据缺失 | 前端 / 人工测试执行人 | 合同已确认：读取使用 `GET /session-briefs/{briefId}`，生成/刷新使用 `POST /sessions/{sessionId}/brief`，无 `GET /sessions/{sessionId}/brief`；仍需按 `briefId=brief-1781507687042-d1990edd&sessionId=session-1781507687012-e4343d` 回收真机截图、控制台和 API 摘要 |
| 今日榜只有空榜 | 后端/API / 接口联调 / PM | 如需列表态、推举、积分不足、重复推举、退款，需要 PM 授权写入样本或提供固定非空样本 |
| 375/414 最终多宽度未回收 | PM / 人工测试执行人 / UI/UX | 最终大版本多宽度截图；当前 iPhone 12 / 390 只能作首轮 P0 复测 |

##### 13.16.25.5 本轮结论

`PR-QA-FLOW-RETEST-004`、`PR-QA-ALBUM-TAIL-RETEST-001`、`PR-QA-RANKINGS-ONLINE-SMOKE-002` 已进入“回包后可复测准备”状态。接口层只读摘要显示 share task、timeline、rankings、eligibility、commerce 可读，公网 rankings 200；`PR-INT-BRIEF-PATH-CONTRACT-001` 已确认 brief 读取合同为 `GET /session-briefs/{briefId}`，`GET /sessions/{sessionId}/brief` 404 不作为读取失败。但本地素材目录未发现前端收口后的新 iPhone 12 截图/录屏/控制台文件。当前只能写 `待截图 / 待录屏 / 待控制台 / 待 brief 复拍证据`，不得写主流程、分享保存、相册返回、相册拖尾、brief、榜单或全量准出通过。

##### 13.16.25.6 PM 收口状态

PM 收口指令：停止扩大测试脚本范围，不再继续追接口细节。本节仅固化本轮已取得的只读结果和证据缺口，不改 PM 总台账，不写全量准出。

| 收口项 | 当前记录 |
| --- | --- |
| 已只读验证 API 摘要 | 本地 `/session-briefs/brief-1781507687042-d1990edd` 200；本地 `/sessions/session-1781507687012-e4343d/timeline` 200 / `nodeCount=5`；本地 `/sessions/live?sessionId=session-1781507687012-e4343d` 200；本地 ready/failed/expired share task 均 200；本地 rankings `best_opening` 200 / `items=[]`；本地 memberB eligibility 200 / `eligible=true` / `pointsCost=10`；本地 memberB commerce 200 / `points=70`；公网 rankings `best_opening`、`today_highlight` 均 200 / `items=[]`；公网 `config/home` 200。 |
| 真机截图/录屏/控制台缺口 | 缺前端收口后的 iPhone 12 / iOS 26.5 / 微信 8.0.73 主流程录屏；缺 `live-record` 分段按钮截图/录屏；缺 `share-preview/share-poster` 保存成功、权限拒绝、失败态截图/录屏；缺 `wine-history` 多入口返回录屏；缺相册/记录拖尾空态、1 项、3 项、长列表截图/录屏；缺 `invite-group` 空 session 保护截图/录屏；缺 rankings 控制台无英文 `not found`、分类切换截图；缺分享保存和 history/loading 控制台截图。 |
| 合同差异 | `PR-INT-BRIEF-PATH-CONTRACT-001` 已三方确认：brief 读取合同为 `GET /session-briefs/{briefId}`；`POST /sessions/{sessionId}/brief` 是生成/刷新；没有 `GET /sessions/{sessionId}/brief`。本地 `/session-briefs/{briefId}` 200、`/sessions/{sessionId}/brief` 404 不再作为读取失败。后续复拍使用 `briefId=brief-1781507687042-d1990edd&sessionId=session-1781507687012-e4343d`。 |
| `PR-QA-FLOW-RETEST-004` | 回包后可复测准备；当前状态 `待截图 / 待录屏 / 待控制台`。不能写主流程、分享保存、返回链路通过。 |
| `PR-QA-ALBUM-TAIL-RETEST-001` | 回包后可复测准备；当前状态 `待相册拖尾截图 / 待滚动录屏 / 待多状态样本`。不能写相册体验通过。 |
| `PR-QA-RANKINGS-ONLINE-SMOKE-002` | 接口层公网 200，已有旧批次中文空态截图；当前状态 `待控制台 / 待分类切换 / 待真机复核`。不能写榜单页面通过或 M5 准出。 |
| `PR-QA-BRIEF-PATH-RETEST-001` | 新增 brief 路径复拍关注项；当前状态 `待真机截图 / 待控制台 / 待 API 摘要`。有证据后才写结果。 |
| 下一步责任 | 前端 / 人工测试执行人补 iPhone 12 真机截图、录屏、控制台；brief 复拍按 `briefId=brief-1781507687042-d1990edd&sessionId=session-1781507687012-e4343d` 执行并补 `GET /session-briefs/{briefId}` 摘要；PM 组织最终一次性证据回收窗口；UI/UX 等真机证据回收后再按 12.7.8 标准复核。 |

收口结论：本轮仅完成复测准备、只读摘要登记和 brief 路径合同更新。缺真实截图、录屏、控制台、brief 页面复拍 API 摘要和必要样本前，所有相关任务继续保持待证据，不得写全量准出。

##### 13.16.25.7 `PR-QA-BRIEF-PATH-RETEST-001` brief 路径复拍关注项

| 项 | 内容 |
| --- | --- |
| 合同依据 | `PR-INT-BRIEF-PATH-CONTRACT-001` 已三方确认：读取 `GET /session-briefs/{briefId}`；生成/刷新 `POST /sessions/{sessionId}/brief`；无 `GET /sessions/{sessionId}/brief`。 |
| 复拍 query | `briefId=brief-1781507687042-d1990edd&sessionId=session-1781507687012-e4343d` |
| 必收证据 | iPhone 12 / iOS 26.5 / 微信 8.0.73 brief 页面截图或录屏、控制台无红错截图、`GET /session-briefs/brief-1781507687042-d1990edd` API 摘要。 |
| 当前状态 | 待真机截图 / 待控制台 / 待 API 摘要。 |
| 结果边界 | 只有真实截图、控制台和 API 摘要后才写结果；不得把路径合同确认直接写成页面通过。 |

#### 13.16.26 `PR-QA-DEVTOOLS-PREVIEW-CAPTURE-001` 微信开发者工具右侧预览自动取证

记录时间：2026-06-16。PM 已验证本机可从微信开发者工具窗口直接抓取右侧实时预览截图，减少每次页面布局复核都要求用户手动截图。该能力只用于开发者工具预览取证，不等同真机准出；权限、相册保存、分享、扫码、微信版本差异仍以真机证据为准。

| 项 | 内容 |
| --- | --- |
| 工具窗口 | `jiuzhuopanguan - 微信开发者工具 Stable v2.01.2510290` |
| CLI 路径 | `D:\wechatkaifa\微信web开发者工具\cli.bat` |
| 截图脚本 | `scripts/capture-wechat-devtools-preview.ps1` |
| 右侧预览命令 | `pwsh -NoLogo -NoProfile -File scripts/capture-wechat-devtools-preview.ps1 -Mode right -Output docs/runtime/wechat-devtools-preview-right.png` |
| 全窗口命令 | `pwsh -NoLogo -NoProfile -File scripts/capture-wechat-devtools-preview.ps1 -Mode window -Output docs/runtime/wechat-devtools-preview-window.png` |
| 已验证输出 | `docs/runtime/wechat-devtools-preview-right.png`，735x1046；`docs/runtime/wechat-devtools-preview-window.png`，1934x1046。右侧截图可见小程序首页实时预览。 |
| 使用边界 | 默认用于 UI/UX 布局、超边界、列表厚重、页面拖尾、按钮可见性和文案初查；不得替代 iPhone 12 真机权限、保存图片、扫码打开、微信版本兼容、触控行为、控制台和网络错误证据。 |
| 后续规则 | 测试/PM 每次前端收口后优先运行该脚本取右侧预览截图；只有开发者工具无法复现、涉及真机权限或最终大版本准出时，才向用户一次性要真机截图/录屏。 |

##### 13.16.26.1 右侧预览点击能力与自动化边界

用户确认微信开发者工具右侧实时预览可像真机一样点击按钮切换页面。PM 复核后的落地规则如下：

| 项 | 结论 |
| --- | --- |
| 可做 | 人工或自动化在右侧预览点击按钮、切换页面、配合截图脚本连续取证。 |
| 当前已验证 | 窗口截图可用；右侧预览截图可稳定获取。 |
| 当前未闭环 | Codex Computer Use 插件初始化失败，错误为 `@oai/sky` 导出子路径缺失；微信开发者工具 `cli.bat auto --port 9420` 超时；已监听端口返回 403/426 或连接错误，尚不能作为稳定点击自动化入口。 |
| 推荐路径 A | 修复或恢复 Computer Use 后，直接对微信开发者工具窗口右侧预览做坐标点击 + 截图验证。 |
| 推荐路径 B | 重新启动微信开发者工具并明确启用自动化端口，再使用小程序自动化能力做 `tap` / `waitFor` / 截图。 |
| 临时路径 | PM/测试可先用脚本抓右侧预览图；需要点击切页时由用户或人工测试执行人在右侧预览点击，PM 再抓图。 |
| 证据边界 | 开发者工具点击可覆盖布局、跳转、按钮响应和页面状态；权限授权、相册保存、扫码、微信版本差异、真实触控体验仍需真机最终证据。 |

#### 13.16.27 `PR-QA-HOME-LOGIN-ENTRY-001` 首页未登录创建入口 P0 回归

记录时间：2026-06-16。PM 自动化确认微信开发者工具 `auto-port=9420` 可连接，首页 `创建聚会` 按钮可找到；但未登录态点击或直接调用后仍停留首页，用户确认首页没有登录入口。该问题阻断“三步内创建聚会并拍第一张照片”，测试侧将未登录态和失效 token 态加入最终大版本一次性复拍矩阵。本节只登记测试用例和证据要求，不改 PM 总台账、不改前端/UI/UX/UGC 计划，不写真机通过。

##### 13.16.27.1 用例范围

| 用例编号 | 认证状态 | 入口 / 操作 | 预期结果 | 失败判定 | 当前状态 |
| --- | --- | --- | --- | --- | --- |
| `PR-QA-HOME-LOGIN-ENTRY-001-A` | 未登录态 | 打开首页，点击 `创建聚会` | 必须出现可执行登录动作、授权/登录引导，或直接进入 `create-session`；用户能继续创建 | 停留首页且无登录入口、按钮无响应、只提示但不可继续，判 P0 | 待前端修复复核 / 待截图录屏 |
| `PR-QA-HOME-LOGIN-ENTRY-001-B` | 失效 token 态 | 保留过期/无效登录态打开首页，点击 `创建聚会` | 必须清理失效态并出现重新登录动作，或进入创建页；不得静默失败 | 停留首页、重复 401、无重新登录入口、loading 不消失，判 P0 | 待前端修复复核 / 待控制台 |
| `PR-QA-HOME-LOGIN-ENTRY-001-C` | 自动化点击 / 直接调用 | 通过微信开发者工具自动化点击首页 `创建聚会`，或调用首页创建处理逻辑 | 与人工点击一致：登录动作可执行或进入创建页 | 自动化可找到按钮但调用后仍停首页且无入口，判 P0 | 待自动化证据 / 待录屏 |
| `PR-QA-HOME-LOGIN-ENTRY-001-D` | 登录后 | 完成登录后回到首页，再点 `创建聚会` | 进入 `create-session`，后续可继续邀请/二维码和拍第一张 | 登录后仍无法进入创建页，或创建页缺主 CTA，判 P0 | 待登录态 / 待三步录屏 |

##### 13.16.27.2 必收截图 / 录屏 / 控制台文件名

| 证据类型 | 文件名规则 | 必填字段 | 当前状态 |
| --- | --- | --- | --- |
| 未登录点击录屏 | `PR-QA-HOME-LOGIN-ENTRY-001-home-unauth-create-click-390-iPhone12-wx8.0.73-<build>-20260616.mp4` | 构建号或上传备注、扫码入口、设备、微信版本、首页按钮点击全过程 | 待录屏 |
| 未登录登录入口截图 | `PR-QA-HOME-LOGIN-ENTRY-001-home-unauth-login-entry-390-iPhone12-wx8.0.73-<build>-20260616.png` | 登录/授权按钮、引导文案、可继续动作 | 待截图 |
| 失效 token 点击录屏 | `PR-QA-HOME-LOGIN-ENTRY-001-home-expired-token-create-click-390-iPhone12-wx8.0.73-<build>-20260616.mp4` | 失效 token 准备方式、点击过程、重新登录或创建页结果 | 待录屏 |
| 未登录控制台 | `PR-QA-HOME-LOGIN-ENTRY-001-console-unauth-no-repeat-401-no-loading-warning-<build>-20260616.png` | 点击前、点击后、登录动作后；无重复 401、无 `showLoading`/`hideLoading` 配对警告 | 待控制台 |
| 失效 token 控制台 | `PR-QA-HOME-LOGIN-ENTRY-001-console-expired-token-no-repeat-401-no-loading-warning-<build>-20260616.png` | 失效 token 请求、降级处理、重新登录入口；无重复 401、无 loading 配对警告 | 待控制台 |
| 登录后进入创建页 | `PR-QA-HOME-LOGIN-ENTRY-001-post-login-create-session-390-iPhone12-wx8.0.73-<build>-20260616.mp4` | 登录后点击首页 `创建聚会`，进入创建页并看到创建 CTA | 待录屏 |

##### 13.16.27.3 控制台采集点

| 阶段 | 必查内容 | 失败退回 |
| --- | --- | --- |
| 首页加载后点击前 | 当前登录态、token 是否为空/失效、首页无红错 | 登录态准备不清退 PM / 人工测试执行人补账号状态 |
| 点击 `创建聚会` 后 | 是否出现重复 401；是否有 `showLoading` 与 `hideLoading` 必须配对警告；是否有 `navigateTo` / `redirectTo` / 登录 promise reject | 401 降级、loading 配对、页面跳转失败退前端；接口合同不一致退后端/API 或接口联调 |
| 登录/授权动作后 | 是否成功回到创建页或继续三步路径；控制台是否仍持续刷 401 | 登录态缺失退 PM / 人工测试执行人；登录后仍卡首页退前端 |

##### 13.16.27.4 阻塞字段

| 字段 | 当前要求 |
| --- | --- |
| 构建信息 | 必填最终大版本构建号、上传备注或体验版/预览二维码时间；无构建信息不得写结果 |
| 设备与版本 | 首轮为 iPhone 12 / iOS 26.5 / 微信 8.0.73 / 390；最终 375/414 仍进多宽度补测 |
| 认证状态 | 必须分别记录未登录态、失效 token 态、登录后状态；A/B/C/outsider 角色缺失时只能覆盖单登录态入口，不覆盖权限验收 |
| 页面路径 | 首页 `pages/index/index`，目标页 `pages/create-session/index`，后续三步链路按最终大版本采集包执行 |
| 证据目录 | 纳入最后大版本一次性采集，不向用户零散索图；除 P0 无法定位外，等待最终大版本统一回收 |
| 判定边界 | 只有真实截图、录屏、控制台截图和必要 API 摘要后才能写结果；当前不得写 `PR-QA-HOME-LOGIN-ENTRY-001` 通过 |

##### 13.16.27.5 下一步责任

| 责任方 | 需要补的内容 |
| --- | --- |
| 前端负责人 | 修复未登录/失效 token 点击首页 `创建聚会` 后无入口问题；补登录动作、失效态降级、跳转到创建页和 loading 配对修复说明 |
| PM / 人工测试执行人 | 在最终大版本一次性采集窗口提供构建号、二维码、未登录/失效 token/登录后账号状态和 iPhone 12 证据 |
| 接口联调 / 后端 API | 如点击后重复 401 或登录态合同不一致，补 auth/session 接口合同和错误码摘要 |
| 测试负责人 | 收到证据后按本节用例复核，只关闭首页登录入口 P0，不扩展为全量主路径准出 |

##### 13.16.27.6 DevTools 自动化初验证据

记录时间：2026-06-16。PM 回收 `PR-QA-HOME-LOGIN-ENTRY-001` 开发者工具初验证据：使用微信开发者工具 `auto-port=9420` 清 storage 后点击首页 `.home-action-primary`，读取页面 data 为 `authPanelVisible=true`、`authRedirectUrl=/pages/create-session/index`，并抓取截图 `docs/runtime/home-login-entry-after-primary-tap-9420.png`。

| 核查项 | 初验结果 | 测试判断 |
| --- | --- | --- |
| 自动化入口 | `auto-port=9420` 可连接；`.home-action-primary` 可被定位并点击 | 可作为最终大版本复拍前的 DevTools 初证 |
| 未登录点击后页面 data | `authPanelVisible=true` | 初步说明点击后出现认证面板状态，不再只记录为无入口 |
| 登录后目标 | `authRedirectUrl=/pages/create-session/index` | 初步说明登录成功后应回流创建页；仍需真机录屏验证 |
| 截图证据 | `docs/runtime/home-login-entry-after-primary-tap-9420.png` | 仅为开发者工具截图，不等同 iPhone 12 真机通过 |

| 仍缺证据 | 当前状态 |
| --- | --- |
| iPhone 12 / iOS 26.5 / 微信 8.0.73 未登录点击首页 `创建聚会` 录屏 | 待最终大版本一次性采集 |
| 失效 token 点击首页 `创建聚会` 录屏 | 待最终大版本一次性采集 |
| 登录成功后从认证面板回流 `create-session` 录屏 | 待最终大版本一次性采集 |
| 控制台无重复 401、无 `showLoading`/`hideLoading` 配对警告截图 | 待最终大版本一次性采集 |
| 最终构建号、二维码或上传备注 | 待 PM / 前端补齐 |

本节结论：`PR-QA-HOME-LOGIN-ENTRY-001` 已加入最终大版本复拍矩阵，并已登记 DevTools 自动化初证。当前状态调整为 `DevTools 初证已收到 / 待 iPhone 12 真机录屏 / 待失效 token 录屏 / 待登录回流 / 待控制台`；未取得真实真机和控制台证据前，不得写未登录创建入口、三步创建流程或全量真机通过。

#### 13.16.28 `PR-QA-FINAL-IP12-CAPTURE-WINDOW-002` 最后大版本 iPhone 12 一次性采集执行表

记录时间：2026-06-16。PM 派工新增 `PR-QA-FINAL-IP12-CAPTURE-WINDOW-002`：当前首页登录入口已有 DevTools 初证，但最终大版本真机证据仍缺。测试侧基于 13.16.17、13.16.25、13.16.27 和前端交接包 14.18 / 14.20，准备最后大版本一次性采集执行表。本节只改测试计划，不零散向用户要图；不得把 DevTools 初证、接口只读摘要或前端自测写成真机通过。

##### 13.16.28.1 采集前置字段

| 字段 | 必填内容 | 当前状态 | 阻塞责任 |
| --- | --- | --- | --- |
| 构建号 / 上传备注 | 最后大版本体验版或预览构建号、上传备注、上传时间 | 待 PM / 前端回填 | PM / 前端 |
| 二维码 / 扫码入口 | 最后大版本二维码截图或体验版入口，标明有效期 | 待 PM 回填 | PM |
| 设备信息 | iPhone 12 / iOS 26.5 / 微信 8.0.73 / 390 宽 | 已定义；执行时需在证据中复核 | 人工测试执行人 |
| 登录态 | 未登录态、失效 token 态、登录成功态；如涉及权限，补 A/B/C/outsider | 待 PM / 人工测试执行人准备 | PM / 人工测试执行人 |
| 控制台 | 每组录屏对应控制台截图；无重复 401、无 `showLoading`/`hideLoading` 配对警告 | 待采集 | 人工测试执行人 / 前端 |
| 接口摘要 | 仅对 brief、rankings、分享保存、相册/记录必要路径补只读摘要或 taskId / briefId / sessionId | 待采集；不得替代真机 | 接口联调 / 后端 API / 测试 |
| 线上可写测试环境 | `PR-PM-ONLINE-TEST-SERVER-AUTH-001` 已授权 `api.pomer.cn` 可作为酒桌判官/聚会记录师可写测试服务器；不得触碰 `pomer.cn` 官网项目或无关服务 | 授权已记录；具体写操作待 PM 明确采集窗口、测试账号和清理方案 | PM / 后端 API / 接口联调 / 测试 |

##### 13.16.28.2 一次性录屏 / 截图执行表

| 顺序 | 任务编号 | 页面 / 链路 | 操作步骤 | 必收证据文件名 | 预期 | 失败判定 | 当前状态 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `PR-QA-HOME-LOGIN-ENTRY-001` | 首页未登录点击 | 清 storage 或确认未登录 -> 首页 -> 点击 `创建聚会` | `PR-QA-FINAL-IP12-CAPTURE-WINDOW-002-home-unauth-create-click-iPhone12-iOS26.5-wx8.0.73-<build>-20260616.mp4`；`...-console-home-unauth-<build>-20260616.png` | 出现可执行登录动作或认证面板，目标回流为 `create-session` | 停留首页且无登录入口、按钮无响应、重复 401 或 loading 不消失，P0 | 待录屏 / 待控制台 |
| 2 | `PR-QA-HOME-LOGIN-ENTRY-001` | 首页失效 token 点击 | 准备过期/无效 token -> 首页 -> 点击 `创建聚会` | `PR-QA-FINAL-IP12-CAPTURE-WINDOW-002-home-expired-token-create-click-iPhone12-iOS26.5-wx8.0.73-<build>-20260616.mp4`；`...-console-home-expired-token-<build>-20260616.png` | 清理失效态并提示重新登录，或进入创建页 | 静默停留、无登录入口、持续刷 401、loading 配对警告，P0 | 待录屏 / 待控制台 |
| 3 | `PR-QA-HOME-LOGIN-ENTRY-001` | 登录成功回流 `create-session` | 从首页登录面板完成登录 -> 自动回流创建页 | `PR-QA-FINAL-IP12-CAPTURE-WINDOW-002-home-login-return-create-session-iPhone12-iOS26.5-wx8.0.73-<build>-20260616.mp4` | 登录成功后进入 `/pages/create-session/index`，能看到创建主 CTA | 登录后仍停首页、无法进入创建页或 CTA 不可点，P0 | 待登录态 / 待录屏 |
| 4 | `PR-QA-FLOW-RETEST-004` | 三步创建并拍第一张 | 首页创建聚会 -> 创建并邀请 -> 邀请/二维码 -> 拍第一张 -> 上传/保存 | `PR-QA-FINAL-IP12-CAPTURE-WINDOW-002-three-step-create-invite-first-photo-iPhone12-iOS26.5-wx8.0.73-<build>-20260616.mp4` | 三步内能创建并进入拍第一张；每步 CTA 清晰可点 | 任一步卡住、空 session、无下一步、上传无反馈，P0 | 待录屏 / 待接口样本 |
| 5 | `PR-QA-FLOW-RETEST-004` | 分享保存权限分支 | 打开 `share-preview` / `share-poster` -> 保存图片 -> 拒绝权限 -> 再授权/重试 -> 保存成功或明确失败态 | `PR-QA-FINAL-IP12-CAPTURE-WINDOW-002-share-save-permission-branch-iPhone12-iOS26.5-wx8.0.73-<build>-20260616.mp4`；`...-console-share-save-<build>-20260616.png` | 权限拒绝有中文引导，重试可执行；ready 图或前端 canvas 兜底可保存 | 保存报错、无授权引导、无重试、控制台红错，P0 | 待录屏 / 待控制台 / 待 taskId |
| 6 | `PR-QA-WINE-HISTORY-BACK-RETEST-001` | `wine-history` 返回 | 从首页/我的页/记录页进入我的相册 -> 顶部返回或底部返回 | `PR-QA-FINAL-IP12-CAPTURE-WINDOW-002-wine-history-back-multi-entry-iPhone12-iOS26.5-wx8.0.73-<build>-20260616.mp4` | 返回上一页或明确兜底到我的/首页，不丢失可继续动作 | 返回失败、空白页、卡死、无法继续创建/拍照，P0 | 待录屏 |
| 7 | `PR-QA-ALBUM-TAIL-RETEST-001` | 相册/记录拖尾多状态 | `wine-history` 与 `live-record` 分别采集空态、1 项、3 项、长列表或可用样本 | `PR-QA-FINAL-IP12-CAPTURE-WINDOW-002-album-tail-<page>-<state>-iPhone12-iOS26.5-wx8.0.73-<build>-20260616.png/mp4` | 空态和短列表无明显无效拖尾；主 CTA 不被下沉；长列表有降噪 | 拖尾过长、主动作被下沉、用户需明显多滚动才能确认结束，P1；阻断主动作 P0 | 待截图 / 待录屏 / 待样本 |
| 8 | `PR-QA-RANKINGS-ONLINE-SMOKE-002` | `rankings` 无英文 `not found` | 打开 `rankings?category=today_highlight` 和 `best_opening`，切换分类 | `PR-QA-FINAL-IP12-CAPTURE-WINDOW-002-rankings-no-english-not-found-iPhone12-iOS26.5-wx8.0.73-<build>-20260616.mp4`；`...-console-rankings-<build>-20260616.png` | 公网 200 或中文空态/列表态；控制台无英文 `not found` | 页面或控制台仍出现英文 `not found`、404 重刷、分类不可切，P1/P0 | 待录屏 / 待控制台 |
| 9 | `PR-QA-BRIEF-PATH-RETEST-001` | brief 读取路径 | 打开 `/pages/session-brief/index?briefId=brief-1781507687042-d1990edd&sessionId=session-1781507687012-e4343d` | `PR-QA-FINAL-IP12-CAPTURE-WINDOW-002-session-brief-briefId-read-iPhone12-iOS26.5-wx8.0.73-<build>-20260616.png`；`...-console-brief-<build>-20260616.png`；`...-api-brief-summary-<build>-20260616.md` | 使用 `GET /session-briefs/{briefId}` 读取，页面为聚会简报，无旧标题 | 把 `GET /sessions/{sessionId}/brief` 404 当读取失败、页面旧标题、控制台红错，退前端/接口 | 待截图 / 待控制台 / 待 API 摘要 |
| 10 | `PR-QA-AUTH401-REGRESSION-001` | 全局 401/loading 回归 | 汇总首页登录、wine-history、rankings、brief、share 保存期间控制台 | `PR-QA-FINAL-IP12-CAPTURE-WINDOW-002-console-auth401-loading-summary-iPhone12-iOS26.5-wx8.0.73-<build>-20260616.png` | 无重复 401；无 `showLoading`/`hideLoading` 配对警告；未登录页有引导 | 重复 401、loading 配对警告、未登录无引导，按页面退前端/接口 | 待控制台 |

##### 13.16.28.3 证据目录与命名规则

| 类型 | 规则 |
| --- | --- |
| 统一前缀 | `PR-QA-FINAL-IP12-CAPTURE-WINDOW-002-<case>-iPhone12-iOS26.5-wx8.0.73-<build>-20260616` |
| 截图 | `.png` 或 `.jpg`，文件名包含页面、状态、构建号；不得只写“截图1/截图2” |
| 录屏 | `.mp4`，必须覆盖完整点击路径和失败/成功结果；关键 P0 不接受只截最终页 |
| 控制台 | 文件名包含 `console`、页面和状态；必须能看到无重复 401、无 loading 配对警告或保留错误原文 |
| API 摘要 | `.md`，记录 endpoint、HTTP 状态、业务 code、关键 ID；如执行线上写操作，必须记录请求目标为 `api.pomer.cn`、测试账号/测试数据前缀、写入 ID、清理方式或保留原因，不得触碰 `pomer.cn` |

##### 13.16.28.4 失败退回码

| 失败类型 | 退回对象 | 退回码 / 说明 |
| --- | --- | --- |
| 首页未登录/失效 token 无入口、无回流 | 前端 | `PR-QA-HOME-LOGIN-ENTRY-001-P0` |
| 三步创建、按钮、空 session、页面卡壳 | 前端；必要时接口联调补样本 | `PR-QA-FLOW-RETEST-004-P0` |
| 分享保存报错、权限拒绝无引导、canvas/图片兜底失败 | 前端；涉及 task/imageUrl/content-type 时同步后端/API | `PR-QA-SHARE-SAVE-P0` |
| 我的相册无法返回 | 前端 | `PR-QA-WINE-HISTORY-BACK-P0` |
| 相册/记录拖尾过长 | 前端 + UI/UX | `PR-QA-ALBUM-TAIL-P1`；阻断主动作时升 P0 |
| rankings 英文 `not found`、404 重刷或分类不可用 | 前端 + 后端/API + 接口联调 | `PR-QA-RANKINGS-SMOKE-P1/P0` |
| brief 读取路径/标题/控制台异常 | 前端 + 接口联调 + 后端/API | `PR-QA-BRIEF-PATH-RETEST-001` |
| 重复 401 或 loading 配对警告 | 前端；接口合同不一致时同步后端/API | `PR-QA-AUTH401-REGRESSION-001` |
| 截图、录屏、控制台、构建号缺失 | PM / 人工测试执行人 | `PR-QA-EVIDENCE-MISSING` |

##### 13.16.28.5 当前结论

`PR-QA-FINAL-IP12-CAPTURE-WINDOW-002` 已形成最后大版本 iPhone 12 一次性采集执行表。当前仍缺构建号、二维码、未登录/失效 token/登录成功态、真机录屏、控制台截图、brief API 摘要、分享 taskId 和相册/记录多状态样本；因此所有条目只能保持 `待采集 / 待证据 / 阻塞字段待回填`，不得把 DevTools 初证、接口只读摘要或前端自测写成真机通过。

##### 13.16.28.6 `PR-PM-ONLINE-TEST-SERVER-AUTH-001` 线上可写测试环境边界

记录时间：2026-06-16。PM 全员通知：用户已授权线上服务器除公司官网项目外可作为酒桌判官/聚会记录师测试服务器使用。测试侧据此可把 `api.pomer.cn` 作为可写测试环境设计最终采集和联调用例；仍不得触碰 `pomer.cn` 官网项目或无关服务。

| 项 | 测试记录要求 | 当前状态 |
| --- | --- | --- |
| 目标环境 | 仅允许 `https://api.pomer.cn` / `jiuzhuopanguan-backend`；不得改动、重启、代理、写入或清理 `pomer.cn` 官网项目 | 授权边界已记录 |
| 构建 / 二维码 | 每次最终采集必须写明构建号、上传备注、二维码或体验版入口、有效期 | 待 PM / 前端回填 |
| 登录态 | 必须写明未登录、失效 token、登录成功、A/B/C/outsider 角色来源；缺角色时只能测单登录态视觉和路径 | 待 PM / 人工测试执行人回填 |
| 线上写操作 | 创建 session、上传 moment、生成 brief、创建 share task、推举/积分、后台审核/举报等写操作必须记录请求时间、测试账号、样本 ID、数据前缀和接口摘要 | 待采集；未执行不得写结果 |
| 数据清理方式 | 每个写入样本必须写明清理脚本、后台清理、接口清理、DB 清理或“PM 授权保留”的原因；无清理策略不得扩大写入范围 | 待 PM / 后端 API / 接口联调给方案 |
| 控制台 / API 摘要 | 真机录屏对应控制台截图；接口摘要至少含 HTTP 状态、业务 code、关键 ID、错误原文 | 待采集 |
| 准出边界 | 没有真实截图、录屏、控制台和必要 API 摘要时，不得写通过；DevTools 初证、接口只读摘要、前端自测均不能替代真机证据 | 持续生效 |

本授权仅解除 `api.pomer.cn` 作为测试服务器的写入环境限制，不解除证据门槛。后续执行 `PR-QA-FINAL-IP12-CAPTURE-WINDOW-002` 时，测试记录必须同时写清构建/二维码/登录态、线上写操作、数据清理方式、控制台/API 摘要；无截图录屏仍不得写通过。

#### 13.16.29 `PR-QA-ONLINE-FINAL-CAPTURE-003` 线上最终采集执行记录

记录时间：2026-06-16。PM 派工新增 `PR-QA-ONLINE-FINAL-CAPTURE-003`：线上服务器已授权为酒桌判官/聚会记录师测试服务器，接口联调将创建线上最终采集样本。测试侧不再因线上写入授权阻塞，但缺截图、录屏、控制台或 API 摘要时仍不得写通过。本节只维护测试计划和测试证据，不改 PM 总台账、不替接口联调/前端/后台/UI/UX/UGC 写通过。

##### 13.16.29.1 执行准入

| 准入项 | 必须到位的证据 | 当前状态 | 阻塞责任 |
| --- | --- | --- | --- |
| 线上样本 manifest | 后端/API + 接口联调基于现有登录和数据库生成线上最终采集样本：sessionId、inviteCode、host/memberA/memberB/outsider 测试身份、briefId、shareTaskId、ranking category、nomination/ledger、review/report/action 样本、数据前缀和清理方式 | 待 DB 生成线上测试身份与 manifest | 后端 API / 接口联调 |
| 构建 / 二维码 | 最终大版本构建号、上传备注、二维码或体验版入口、有效期 | 待 PM / 前端回填 | PM / 前端 |
| 设备与版本 | iPhone 12 / iOS 26.5 / 微信 8.0.73 / 390 宽 | 已定义；执行时需截图/录屏证明 | 人工测试执行人 |
| 登录态 | 不再等待用户提供 4 个账号；由后端/API + 接口联调交付 DB 生成的 host/memberA/memberB/outsider 测试身份，前端/测试只在最终扫码窗口复核可访问性 | 待 DB 生成身份 | 后端 API / 接口联调 |
| 线上写操作清理 | 每个线上写入样本的清理脚本、接口、后台操作或 PM 授权保留说明 | 待接口联调 / 后端 API 给方案 | 接口联调 / 后端 API / PM |
| 控制台采集 | 对应录屏的开发者工具控制台截图，覆盖 401/loading、分享保存、rankings、brief、后台同步 | 待采集 | 人工测试执行人 / 前端 |

##### 13.16.29.2 线上最终采集矩阵

| 顺序 | 覆盖项 | 页面 / 接口 | 样本 ID 字段 | 必收证据 | 通过前置 | 当前状态 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 首页登录 | `pages/index/index` -> `create-session` | 登录态、authRedirectUrl | 未登录点击录屏、失效 token 点击录屏、登录成功回流录屏、控制台无重复 401/loading 警告 | 真实 iPhone 12 录屏 + 控制台；DevTools 初证不能替代 | 待线上样本 / 待录屏 |
| 2 | 三步创建并拍第一张 | 首页 -> 创建聚会 -> 邀请/二维码 -> 拍第一张 | sessionId、inviteCode、momentId、imageUrl | 三步连续 MP4、关键页截图、创建/上传 API 摘要、数据清理方式 | 必须能产生或读取线上测试 session/moment；无清理策略不得扩大写入 | 待线上样本 / 待录屏 / 待 API 摘要 |
| 3 | 分享保存 | `share-preview` / `share-poster` | shareTaskId、briefId、imageUrl、filteredNodeIds | 保存成功/权限拒绝/重试录屏、控制台截图、share task API 摘要、PNG 原图或本地 canvas 兜底说明 | 保存报错或无权限引导不得通过 | 待线上样本 / 待 taskId |
| 4 | 相册返回 / 拖尾 | `wine-history`、`live-record` | sessionId、moment 数量、入口来源 | 多入口返回录屏；空态、1 项、3 项、长列表/可用样本截图或滚动录屏 | 返回卡死 P0；拖尾阻断主动作 P0，否则 P1 | 待线上样本 / 待多状态证据 |
| 5 | 榜单 | `rankings?category=today_highlight`、`best_opening` | category、nominationId、ledgerId、refund/payoutId 如适用 | 页面截图/录屏、分类切换、控制台无英文 `not found`、公网 API 摘要 | 接口摘要不能替代页面证据；英文 `not found` 不得通过 | 待线上样本 / 待控制台 |
| 6 | brief | `session-brief?briefId=brief-1781507687042-d1990edd&sessionId=session-1781507687012-e4343d` 或线上 manifest briefId | briefId、sessionId、filteredNodeIds | brief 页面截图、控制台、`GET /session-briefs/{briefId}` API 摘要 | 不再把 `GET /sessions/{sessionId}/brief` 404 当读取失败；页面旧标题不得通过 | 待线上样本 / 待截图 |
| 7 | 后台 action 前台同步 | 后台审核/举报/action -> 前台 timeline/brief/share 状态 | reviewMomentId、reportId、operationLogId、affected momentId/briefId | 后台 action 响应摘要、operation log 截图或摘要、前台同步截图/录屏、API 摘要 | 无后台账号、无 action 响应、无前台同步证据不得通过 | 待后台样本 / 待证据 |
| 8 | 401/loading 控制台 | 首页登录、wine-history、rankings、brief、share 保存 | 页面、状态、请求 URL、错误原文 | 控制台汇总截图或分页面截图；无重复 401、无 `showLoading`/`hideLoading` 配对警告 | 控制台缺失时所有相关项保持待证据 | 待控制台 |
| 9 | API 摘要与清理 | `api.pomer.cn` 线上测试接口 | 全部写入 ID、数据前缀、清理方式 | `.md` 摘要：请求目标、HTTP 状态、业务 code、关键 ID、清理/保留说明 | 摘要不能替代真机；无清理方式不得扩大写入 | 待接口联调交付 |

##### 13.16.29.3 证据命名

| 类型 | 文件名规则 |
| --- | --- |
| 录屏 | `PR-QA-ONLINE-FINAL-CAPTURE-003-<case>-iPhone12-iOS26.5-wx8.0.73-<build>-20260616.mp4` |
| 截图 | `PR-QA-ONLINE-FINAL-CAPTURE-003-<page>-<state>-iPhone12-iOS26.5-wx8.0.73-<build>-20260616.png` |
| 控制台 | `PR-QA-ONLINE-FINAL-CAPTURE-003-console-<page>-<state>-<build>-20260616.png` |
| API 摘要 | `PR-QA-ONLINE-FINAL-CAPTURE-003-api-summary-<case>-<build>-20260616.md` |
| 后台 action | `PR-QA-ONLINE-FINAL-CAPTURE-003-admin-action-sync-<action>-<build>-20260616.mp4/png/md` |

##### 13.16.29.4 阻塞字段

| 阻塞字段 | 处理 |
| --- | --- |
| 缺线上样本 manifest | `PR-QA-ONLINE-FINAL-CAPTURE-003` 保持待接口联调，不能执行最终结论 |
| 缺构建号 / 二维码 | 保持待 PM / 前端，不写页面结果 |
| 缺设备 / 微信版本 | 保持待人工测试执行人，不写真机结果 |
| 缺 DB 生成测试身份 / 角色 | 只能测单登录态视觉和路径，不能覆盖权限、UGC 或完整验收；不再要求用户提供 4 个账号 |
| 缺截图 / 录屏 | 保持待证据，不得写通过 |
| 缺控制台 | 401/loading、rankings、brief、分享保存相关项不得关闭 |
| 缺 API 摘要 / 清理方式 | 线上写入相关项不得关闭，不得扩大写入范围 |

本节结论：`PR-QA-ONLINE-FINAL-CAPTURE-003` 已建立线上最终采集执行记录和证据矩阵。当前状态为 `待后端/API + 接口联调交付 DB 生成线上测试身份和 manifest / 待构建二维码 / 待真机录屏 / 待控制台 / 待 API 摘要`；不得把接口摘要或 DevTools 初证写成真机通过。

#### 13.16.30 `PR-QA-ONLINE-TOKEN-CAPTURE-PREP-004` 线上四角色登录态采集准备

记录时间：2026-06-16。PM 派工确认：当前最终采集阻塞不再是线上写入授权，而是缺 4 个有效线上登录态/token 或 loginCode。接口联调确认旧本地 token 调 `POST /sessions` 返回 401，不能用于 `api.pomer.cn` 线上造数。本节只建立测试/验收侧采集表和证据要求，不改 PM 总台账，不记录完整 token。

##### 13.16.30.1 四角色线上登录态采集表

| 角色 | 用途 | 设备 / 微信版本 | 构建 / 二维码或开发者工具入口 | 登录步骤 | token 后 8 位或 loginCode 来源 | 证据文件名 | 当前状态 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| host | 创建线上测试 session、邀请、brief、分享、后台同步前台核验 | 待记录；首选 iPhone 12 / iOS 26.5 / 微信 8.0.73 | 待 PM / 前端回填最终构建号、二维码或 DevTools 入口 | 扫码打开 -> 首页登录 -> 确认登录成功 -> 进入创建链路；如由接口联调用 loginCode，记录来源和时间 | 只填 token 后 8 位或 loginCode 来源；不得写完整 token | `PR-QA-ONLINE-TOKEN-CAPTURE-PREP-004-host-login-iPhone12-iOS26.5-wx8.0.73-<build>-20260616.mp4/png`；控制台 `...-console-host-login-<build>-20260616.png` | 待采集 |
| memberA | 上传第一张、私密/普通 moment、分享保存、相册列表 | 待记录 | 待 PM / 前端回填 | 扫码打开 -> 登录为 memberA -> 加入/打开 host 测试 session -> 执行上传或查看入口 | 只填 token 后 8 位或 loginCode 来源；不得写完整 token | `PR-QA-ONLINE-TOKEN-CAPTURE-PREP-004-memberA-login-iPhone12-iOS26.5-wx8.0.73-<build>-20260616.mp4/png`；控制台 `...-console-memberA-login-<build>-20260616.png` | 待采集 |
| memberB | 私密可见、成员视角、榜单/积分或相册权限 | 待记录 | 待 PM / 前端回填 | 扫码打开 -> 登录为 memberB -> 加入/打开同一 session -> 刷新记录/相册/榜单 | 只填 token 后 8 位或 loginCode 来源；不得写完整 token | `PR-QA-ONLINE-TOKEN-CAPTURE-PREP-004-memberB-login-iPhone12-iOS26.5-wx8.0.73-<build>-20260616.mp4/png`；控制台 `...-console-memberB-login-<build>-20260616.png` | 待采集 |
| outsider | 非成员/非接收者权限、无权限占位、邀请/分享外部视角 | 待记录 | 待 PM / 前端回填 | 扫码打开 -> 登录为 outsider -> 尝试访问分享/邀请/记录页 -> 记录无权限或占位 | 只填 token 后 8 位或 loginCode 来源；不得写完整 token | `PR-QA-ONLINE-TOKEN-CAPTURE-PREP-004-outsider-login-iPhone12-iOS26.5-wx8.0.73-<build>-20260616.mp4/png`；控制台 `...-console-outsider-login-<build>-20260616.png` | 待采集 |

##### 13.16.30.2 不得记录完整 token 的规则

| 项 | 规则 |
| --- | --- |
| token 记录 | 只允许记录后 8 位，例如 `tokenLast8=********`；完整 token 不写入测试计划、截图说明、提交记录或公开文档 |
| loginCode 记录 | 如使用微信登录 code，只记录来源、生成时间、所属角色和是否已交接口联调；如 code 属一次性敏感凭据，文档中只写 `loginCodeSource=用户扫码/DevTools/接口联调回填` |
| 旧本地 token | `INT-DATA-001` 旧本地 token 不得用于 `api.pomer.cn`；接口联调已确认旧 token `POST /sessions` 返回 401 |
| 证据脱敏 | 控制台或网络截图如出现完整 token，提交前必须遮挡；未遮挡不得作为可公开验收证据 |

##### 13.16.30.3 如需用户操作的执行说明

| 用户需要做什么 | 录屏 / 截图要求 | 控制台 / 交接要求 | 文件名 |
| --- | --- | --- | --- |
| 使用最终二维码或体验版入口扫码打开小程序 | 从扫码进入到首页可见、登录动作、登录成功状态连续录屏；每个角色单独一段 | 记录设备、iOS、微信版本、构建号或二维码时间；如能打开开发者工具控制台，补登录成功后无重复 401 截图 | `PR-QA-ONLINE-TOKEN-CAPTURE-PREP-004-<role>-scan-login-iPhone12-iOS26.5-wx8.0.73-<build>-20260616.mp4` |
| 分别完成 host、memberA、memberB、outsider 登录或授权 | 截图需显示角色标签或 PM/测试可区分的账号备注；不得暴露完整 token | 将 token 后 8 位或 loginCode 来源交给接口联调；完整 token 只走安全私下交接，不写入计划 | `PR-QA-ONLINE-TOKEN-CAPTURE-PREP-004-<role>-login-state-<build>-20260616.png` |
| 如要由接口联调生成线上 manifest | 用户完成登录后，接口联调用对应 token/loginCode 创建或绑定线上样本 | 接口联调回填 manifest 路径、sessionId、profileId、tokenLast8、清理方式 | `PR-QA-ONLINE-TOKEN-CAPTURE-PREP-004-online-token-manifest-summary-<build>-20260616.md` |
| 如登录失败或卡住 | 保留失败录屏和控制台错误原文 | 失败退前端；若接口 401/合同异常，退后端/API 或接口联调 | `PR-QA-ONLINE-TOKEN-CAPTURE-PREP-004-<role>-login-failed-<build>-20260616.mp4/png` |

##### 13.16.30.4 与最终采集的阻塞关系

| 缺口 | 对最终采集的影响 |
| --- | --- |
| 4 个线上登录态/token 或 loginCode 未取得 | `PR-QA-ONLINE-FINAL-CAPTURE-003` 无法生成完整线上 manifest；host/memberA/memberB/outsider 权限、分享、相册、榜单、后台同步均继续阻塞 |
| 线上 manifest 未生成 | 不能执行最终 iPhone 12 采集结论；只能保留 DevTools 初证和接口只读摘要 |
| 构建 / 二维码未确认 | 不能证明证据对应最后大版本；截图/录屏不得写结果 |
| 设备 / 微信版本缺失 | 不写真机验收结果 |
| 录屏 / 控制台缺失 | 首页登录、401/loading、分享保存、brief、rankings 相关项不得关闭 |

本节结论：`PR-QA-ONLINE-TOKEN-CAPTURE-PREP-004` 已建立 host、memberA、memberB、outsider 四个线上登录态采集表。当前状态为 `待四角色登录态/tokenLast8 或 loginCode / 待线上 manifest / 待构建二维码 / 待录屏控制台`；在 token 未取得、线上 manifest 未生成、构建/二维码未确认前，最终 iPhone 12 采集继续标阻塞，不得写通过。

#### 13.16.31 `PR-QA-DB-GENERATED-CAPTURE-005` DB 生成线上测试身份后的最终采集准备

记录时间：2026-06-16。用户确认目前没有 4 个账号供测试，要求用现有登录和数据库直接生成。测试侧取消“等待用户提供 4 个账号/token”的阻塞，改为等待后端/API + 接口联调交付 DB 生成的线上测试身份和最终 manifest。本节只更新测试计划，不改 PM 总台账，不执行 DB 写入，不写真机通过。

##### 13.16.31.1 阻塞状态调整

| 原阻塞 | 新状态 | 责任方 | 测试接收条件 |
| --- | --- | --- | --- |
| 等待用户提供 host/memberA/memberB/outsider 4 个账号/token 或 loginCode | 取消，不再要求用户找 4 个账号 | 测试侧已调整 | 用户只参与最终扫码/截图/录屏窗口 |
| 缺线上可用四角色身份 | 改为等待后端/API + 接口联调通过现有登录和数据库生成 host/memberA/memberB/outsider 测试身份 | 后端 API / 接口联调 | manifest 中给出 role、profileId、tokenLast8 或安全引用、权限关系、清理方式 |
| 缺线上 manifest | 仍阻塞最终 iPhone 12 采集 | 后端 API / 接口联调 | manifest 包含 session、moment、brief、share、ranking、admin action、清理策略 |
| 缺构建 / 二维码 | 仍阻塞最终页面证据 | PM / 前端 | 构建号、上传备注、二维码或体验版入口 |
| 缺截图 / 录屏 / 控制台 | 仍不得写通过 | 人工测试执行人 / 前端 | iPhone 12 / iOS 26.5 / 微信 8.0.73 证据齐全 |

##### 13.16.31.2 DB 生成 manifest 必填字段

| 模块 | 必填字段 | 说明 |
| --- | --- | --- |
| 环境 | `baseUrl=https://api.pomer.cn`、构建号/二维码关联、生成时间 | 不得指向 `pomer.cn` 官网或无关服务 |
| 身份 | host/memberA/memberB/outsider 的 profileId、角色关系、tokenLast8 或安全引用 | 不记录完整 token；如无需 token 由后端模拟身份，写明机制 |
| session | sessionId、inviteCode、hostId、成员列表、outsider 访问预期 | 支撑三步创建、邀请、记录、相册权限 |
| moments | opening/private/highlight/event/至少一张照片的 momentId、imageUrl、visibility | 支撑拍第一张、相册/记录、私密/权限复核 |
| brief | briefId、nodeCount、filteredNodeIds、读取路径 | 读取合同仍为 `GET /session-briefs/{briefId}` |
| share | ready/failed/expired 或最少 ready shareTaskId、imageUrl、filteredNodeIds | 支撑分享保存、权限拒绝、重试或失败态 |
| rankings | category、空态/列表态、nominationId、ledgerId、积分不足/重复/退款样本如适用 | 支撑榜单页面和 API 摘要 |
| admin action | reviewMomentId、reportId、operationLogId、前台受影响 moment/brief/share ID | 支撑后台 action 前台同步 |
| 清理 | 清理脚本、清理接口、后台清理步骤或 PM 授权保留说明 | 无清理策略不得扩大写入范围 |

##### 13.16.31.3 manifest 到位后的 iPhone 12 执行顺序

| 顺序 | 执行项 | 必收证据 | 当前状态 |
| --- | --- | --- | --- |
| 1 | 环境确认 | 构建号、二维码、设备 iPhone 12 / iOS 26.5 / 微信 8.0.73、manifest 路径 | 待 manifest / 待二维码 |
| 2 | 首页登录与三步创建拍第一张 | 首页登录/创建/邀请/拍第一张连续录屏，创建和上传 API 摘要 | 待执行 |
| 3 | 相册/记录 | `live-record`、`wine-history` 返回、拖尾空态/短列表/长列表截图或录屏 | 待执行 |
| 4 | 分享保存 | `share-preview/share-poster` 保存成功、权限拒绝、失败/重试证据，控制台截图 | 待执行 |
| 5 | 榜单 | rankings 页面截图/分类切换、无英文 `not found` 控制台、API 摘要 | 待执行 |
| 6 | brief | brief 页面截图、控制台、`GET /session-briefs/{briefId}` API 摘要 | 待执行 |
| 7 | 后台 action 同步 | 后台 action 响应、operation log、前台 timeline/brief/share 同步截图或录屏 | 待执行 |
| 8 | 控制台汇总 | 无重复 401、无 `showLoading`/`hideLoading` 配对警告截图 | 待执行 |

##### 13.16.31.4 用户参与边界

用户不再需要寻找或提供 4 个账号/token。需要用户参与时，仅限最终大版本扫码、截图、录屏窗口：使用 PM/前端提供的最终二维码或体验版入口，在 iPhone 12 / iOS 26.5 / 微信 8.0.73 上按测试清单录屏和截图。文件名沿用 `PR-QA-ONLINE-FINAL-CAPTURE-003-*` 或 `PR-QA-DB-GENERATED-CAPTURE-005-*` 前缀；如出现失败，保留失败录屏和控制台原文。

本节结论：`PR-QA-DB-GENERATED-CAPTURE-005` 已把最终采集阻塞改为 `待后端/API + 接口联调交付 DB 生成线上测试身份和最终 manifest`。无 manifest、无二维码/构建号、无截图录屏或无控制台时，仍不得写通过。

#### 13.16.32 `PR-QA-FINAL-CAPTURE-MANIFEST-STANDBY-006` 最终采集 manifest 待命

记录时间：2026-06-16。PM 派工确认：后端/API 已在服务器侧生成线上样本并保存脱敏 manifest，但接口联调尚未输出公开测试摘要。测试侧当前只做待命与采集准备，不直接使用后端私密 manifest 或完整 token，不把后端代跑结果写成最终通过。

##### 13.16.32.1 当前状态与准入条件

| 项 | 要求 | 当前状态 |
| --- | --- | --- |
| 后端私密 manifest | 测试不得直接读取或使用；不得记录完整 token | 后端已生成，但测试侧不接收为验收证据 |
| 接口联调公开摘要 | 必须等待 `PR-INT-MANIFEST-SANITIZED-VERIFY-007` 输出页面 query、API 摘要、warnings/skipped、cleanup 口径 | 等待接口联调公开摘要 |
| 页面 query | 必须给出最终可打开路径，包括 sessionId、briefId、shareTaskId、rankings category、后台 action 关联 ID | 待接口联调回填 |
| API 摘要 | 至少包含 endpoint、HTTP 状态、业务 code、关键 ID、错误原文或空态说明 | 待接口联调回填 |
| warnings/skipped | 必须列明缺口、不可测链路、替代样本和不准出范围 | 待接口联调回填 |
| cleanup 口径 | 必须说明清理脚本/接口/后台清理步骤，或 PM 授权保留原因 | 待接口联调 / 后端 API 回填 |
| dedicated 缺口 | `reviewMomentId`、`reportId`、`expiredTaskId` 当前缺失 | 对应后台审核、举报、expired 分享任务链路不得写通过 |

##### 13.16.32.2 iPhone 12 最终采集矩阵

| 顺序 | 覆盖项 | 页面 / 路径 | 依赖接口联调回填 | 必收真机证据 | 不得通过条件 | 当前状态 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 首页登录入口 | `pages/index/index` -> `create-session` | 构建号、二维码、登录态/身份说明 | iPhone 12 / iOS 26.5 / 微信 8.0.73 未登录点击、失效态、登录回流录屏；控制台无重复 401/loading 警告 | 只有 DevTools 初证、无真机录屏或无控制台 | 待公开摘要 / 待录屏 |
| 2 | 三步创建并拍首张照片 | 首页 -> 创建聚会 -> 邀请/二维码 -> 拍第一张 | sessionId、inviteCode、momentId、上传/创建 API 摘要、cleanup | 三步连续 MP4、关键页截图、API 摘要 | 任一步卡住、空 session、无上传结果、无清理口径 | 待公开摘要 / 待录屏 |
| 3 | 相册/记录页拖尾 | `live-record`、`wine-history` | sessionId、moment 数量、空态/短列表/长列表样本 | 空态、1 项、3 项或长列表截图/滚动录屏；返回路径录屏 | 拖尾遮蔽主动作、返回卡死、无多状态样本 | 待公开摘要 / 待截图 |
| 4 | 分享保存 | `share-preview`、`share-poster` | ready shareTaskId、imageUrl、filteredNodeIds；如有 failed/expired 则列 taskId | 保存成功、权限拒绝、重试/失败态录屏；控制台；PNG 或 canvas 兜底说明 | 保存报错、无权限引导、无 ready task；`expiredTaskId` 缺失时不得写 expired 链路通过 | 待公开摘要 / 待 taskId |
| 5 | brief 读取 | `session-brief?briefId=<briefId>&sessionId=<sessionId>` | briefId、sessionId、`GET /session-briefs/{briefId}` 摘要、warnings/skipped | brief 页面截图、控制台、API 摘要 | 页面旧标题、控制台红错、把不存在的 `GET /sessions/{sessionId}/brief` 当读取失败 | 待公开摘要 / 待截图 |
| 6 | rankings | `rankings?category=today_highlight`、`best_opening` | category、空态/列表态、nomination/ledger 样本、cleanup | 页面截图/录屏、分类切换、控制台无英文 `not found`、API 摘要 | 英文 `not found`、404 重刷、无 category 摘要 | 待公开摘要 / 待控制台 |
| 7 | 后台发奖后前台同步 | 后台 action -> 前台 timeline/brief/rankings/points 同步 | payout/reward/action ID、operationLogId、affected profileId/sessionId | 后台 action 响应摘要、operation log、前台同步截图/录屏 | 无 action 响应、无前台同步证据、无 cleanup | 待公开摘要 / 待后台证据 |
| 8 | 私密/UGC 风控相关页面 | `moment-editor`、`live-record`、`share-poster`、举报/审核相关入口 | private momentId、visibleProfileIds、host/member/outsider 预期、filteredNodeIds、reportId/reviewMomentId 如有 | A/B/outsider 可见差异截图、私密占位/无权限、过滤节点清单、控制台 | `reviewMomentId` / `reportId` 缺失时不得写审核/举报通过；无角色差异截图不得写 UGC 通过 | 待公开摘要 / 待角色证据 |
| 9 | 控制台总回归 | 首页登录、相册/记录、分享、brief、rankings、后台同步 | 页面 query 和关键请求列表 | 控制台截图，确认无重复 401、无 `showLoading`/`hideLoading` 配对警告 | 无控制台截图时相关项不得关闭 | 待控制台 |

##### 13.16.32.3 dedicated 缺口处理

| 缺口 | 影响链路 | 当前判定 |
| --- | --- | --- |
| `reviewMomentId` 缺失 | 后台审核、UGC 审核前台同步、operation log 关联 | 不得写审核链路通过；等待接口联调补 dedicated 样本或在 warnings/skipped 中说明 |
| `reportId` 缺失 | 举报、后台举报处理、风控闭环 | 不得写举报链路通过；等待接口联调补 dedicated 样本或标 skipped |
| `expiredTaskId` 缺失 | 分享任务 expired 态、过期重试/提示 | 不得写 expired 分享任务链路通过；ready/failed 如有样本也不能替代 expired |

##### 13.16.32.4 接口联调交付后测试执行方式

1. 先核对 `PR-INT-MANIFEST-SANITIZED-VERIFY-007`：manifest 摘要是否脱敏、是否无完整 token、是否列出页面 query、API 摘要、warnings/skipped 和 cleanup 口径。
2. 将页面 query 写入本节执行记录，按 iPhone 12 / iOS 26.5 / 微信 8.0.73 打开最终二维码或体验版入口。
3. 按 13.16.32.2 顺序采集：先首页登录和三步创建，再相册/记录、分享、brief、rankings、后台同步、私密/UGC、控制台总回归。
4. 每个用例同时记录：页面路径、样本 ID、实际结果、截图/录屏文件名、控制台文件名、API 摘要文件名、是否通过。
5. 如 manifest 有 warnings/skipped，只能按可测范围写结果；缺 dedicated 样本的审核/举报/expired 链路保持未通过/待样本。

本节结论：`PR-QA-FINAL-CAPTURE-MANIFEST-STANDBY-006` 状态为 `等待接口联调公开摘要`。测试侧已准备最终采集矩阵，但在 `PR-INT-MANIFEST-SANITIZED-VERIFY-007` 输出页面 query、API 摘要、warnings/skipped、cleanup 口径前不得开跑；缺 `reviewMomentId`、`reportId`、`expiredTaskId` 的对应链路不得写通过。

#### 13.16.33 `PR-QA-FINAL-IP12-CAPTURE-EXEC-007` 最终 iPhone 12 采集执行记录

记录时间：2026-06-16。PM 派工确认接口联调 `PR-INT-MANIFEST-SANITIZED-VERIFY-007` 已完成公开摘要，测试可以进入最终 iPhone 12 采集执行准备。当前仍不能写最终通过，直到真机截图、录屏、控制台和 API 摘要全部回收。本节只记录测试计划和证据状态，不改 PM 总台账。

##### 13.16.33.1 已接收公开摘要

| 类型 | 公开摘要 |
| --- | --- |
| session | `session-1781584503517-c033e9` |
| inviteCode | `W58G7T` |
| brief | `brief-1781584503870-25d5edac` |
| readyTask | `share-task-1781584503902-a99a5211` |
| failedTask | `share-task-1781584504132-3251bd01` |
| nomination | `nomination-1781584504202-df008444` |
| rewardPayout | `ranking-reward-payout-1781584504234-5a8cb962` |
| pointsLedger | 2 条，待接口联调公开摘要文件名和关键 ledgerId |
| operationLogs | 3 条，待接口联调公开摘要文件名和关键 operationLogId |
| 仍缺 dedicated 样本 | `reviewMomentId`、`reportId`、`expiredTaskId` |

##### 13.16.33.2 页面 query

| 页面 | query / 路径参数 | 当前状态 |
| --- | --- | --- |
| `session-brief` | `briefId=brief-1781584503870-25d5edac&sessionId=session-1781584503517-c033e9` | 待真机截图 / 待控制台 / 待 API 摘要 |
| `share-preview` ready | `briefId=brief-1781584503870-25d5edac&taskId=share-task-1781584503902-a99a5211` | 待保存录屏 / 待控制台 |
| `rankings` | `category=best_opening` | 待页面截图 / 待分类与控制台 |
| `invite-group` | `sessionId=session-1781584503517-c033e9&inviteCode=W58G7T` | 待二维码/邀请页截图 / 待三步录屏 |

##### 13.16.33.3 当前执行前置核查

| 前置项 | 当前状态 | 阻塞责任 |
| --- | --- | --- |
| 最终构建号 / 上传备注 | 前端 `PR-FE-FINAL-BUILD-QR-HANDOFF-008` 已完成交接；但当前不能确认用户旧二维码是否是最后大版本。最终真机采集前必须由 PM/测试/有上传权限成员确认构建号、上传备注、上传时间，或重新生成最终二维码/入口 | PM / 测试 / 有上传权限成员 |
| 体验版二维码 / 扫码入口 | 前端交接已完成，但本测试记录尚未拿到可确认属于最后大版本的二维码/入口 | PM / 测试 / 有上传权限成员 / 用户 |
| 真机操作窗口 | 未确认用户或人工测试执行人当前可操作 iPhone 12 | PM / 人工测试执行人 |
| 控制台采集条件 | 优先使用微信开发者工具 Console/Network 或真机远程调试；若只能普通体验版扫码，需要在测试结论标注“未采控制台” | PM / 前端 / 人工测试执行人 |
| API 摘要文件 | 已具备，可引用 `docs/runtime/pr-int-final-qa-api-summary-008.md` 和接口联调计划 3.20；解除 API 摘要归档缺口 | 已解除 |
| 后端 action 合同 | 后端 `PR-BE-ADMIN-PAGE-ACTION-CONTRACT-008` 已完成，后端 action 合同无阻塞，不需要等后端改代码 | 已解除；仍需真机/后台同步证据 |
| dedicated 样本 | `reviewMomentId`、`reportId`、`expiredTaskId` 仍缺 | 接口联调 / 后端 API |

当前判定：可进入最终采集执行准备；API 摘要归档和后端 action 合同缺口已解除。真机执行仍阻塞于最终二维码/构建确认、iPhone 12 操作窗口和控制台采集可行性；`reviewMomentId`、`reportId`、`expiredTaskId` 三类 dedicated 样本仍缺。不得泛写“待测试”，也不得写任何链路通过。

##### 13.16.33.4 最终采集执行矩阵

| 顺序 | 用例 | 操作 / 页面 | 必收证据文件名 | 当前状态 | 结果边界 |
| --- | --- | --- | --- | --- | --- |
| 1 | 首页登录入口 | 首页未登录点击、失效态点击、登录回流创建页 | `PR-QA-FINAL-IP12-CAPTURE-EXEC-007-home-login-entry-iPhone12-iOS26.5-wx8.0.73-<build>-20260616.mp4`；`...-console-home-login-<build>-20260616.png` | 阻塞：缺二维码/真机窗口/控制台 | 无真机录屏和控制台不得通过 |
| 2 | 三步创建拍首张 | 首页 -> 创建聚会 -> 邀请/二维码 `sessionId=session-1781584503517-c033e9&inviteCode=W58G7T` -> 拍第一张 | `PR-QA-FINAL-IP12-CAPTURE-EXEC-007-three-step-first-photo-iPhone12-iOS26.5-wx8.0.73-<build>-20260616.mp4` | 阻塞：缺二维码/真机窗口 | 无三步连续录屏不得通过 |
| 3 | 相册/记录拖尾 | `live-record` / `wine-history`，覆盖空态、短列表、可用列表和返回 | `PR-QA-FINAL-IP12-CAPTURE-EXEC-007-album-tail-<state>-iPhone12-iOS26.5-wx8.0.73-<build>-20260616.png/mp4` | 阻塞：缺页面入口截图/录屏 | 只凭样本 ID 不得通过 |
| 4 | 分享保存 | `share-preview?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781584503902-a99a5211`，保存、权限拒绝、重试 | `PR-QA-FINAL-IP12-CAPTURE-EXEC-007-share-save-ready-iPhone12-iOS26.5-wx8.0.73-<build>-20260616.mp4`；`...-console-share-save-<build>-20260616.png` | 阻塞：缺真机保存录屏/控制台 | readyTask 可测；`expiredTaskId` 缺失，expired retry 未覆盖 |
| 5 | brief 读取 | `session-brief?briefId=brief-1781584503870-25d5edac&sessionId=session-1781584503517-c033e9` | `PR-QA-FINAL-IP12-CAPTURE-EXEC-007-session-brief-iPhone12-iOS26.5-wx8.0.73-<build>-20260616.png`；API 摘要引用 `docs/runtime/pr-int-final-qa-api-summary-008.md` | 阻塞：缺真机截图/控制台 | 只确认 query 和 API 摘要，不写页面通过 |
| 6 | rankings | `rankings?category=best_opening`，分类、空态/列表态、无英文 not found | `PR-QA-FINAL-IP12-CAPTURE-EXEC-007-rankings-best-opening-iPhone12-iOS26.5-wx8.0.73-<build>-20260616.mp4/png`；`...-console-rankings-<build>-20260616.png` | 阻塞：缺页面截图/控制台 | nomination/rewardPayout 摘要不能替代页面证据 |
| 7 | 后台发奖后前台同步 | rewardPayout、pointsLedger、operationLogs 对应前台同步 | `PR-QA-FINAL-IP12-CAPTURE-EXEC-007-admin-reward-sync-iPhone12-iOS26.5-wx8.0.73-<build>-20260616.mp4/png/md` | 阻塞：缺后台 action 截图、前台同步录屏；后端 action 合同已解除 | operationLogs 3 条和后端合同不能替代前台同步真机证据 |
| 8 | private / UGC 风控 | 私密可见差异、过滤节点、无权限/占位、举报/审核入口如有 | `PR-QA-FINAL-IP12-CAPTURE-EXEC-007-private-ugc-<state>-iPhone12-iOS26.5-wx8.0.73-<build>-20260616.png/mp4` | 阻塞：缺角色视角真机截图；`reviewMomentId`/`reportId` 缺失 | 审核/举报专项未覆盖，不得通过 |
| 9 | 控制台总回归 | 首页、相册、分享、brief、rankings、后台同步期间控制台 | `PR-QA-FINAL-IP12-CAPTURE-EXEC-007-console-summary-iPhone12-iOS26.5-wx8.0.73-<build>-20260616.png` | 阻塞：缺控制台采集条件 | 无控制台不得关闭 401/loading |

##### 13.16.33.5 未覆盖 / 不得通过项

| 缺口 | 不得通过范围 |
| --- | --- |
| `reviewMomentId` 缺失 | 后台审核专项、UGC 审核前台同步 |
| `reportId` 缺失 | 举报、举报后台处理、举报风控闭环 |
| `expiredTaskId` 缺失 | expired 分享任务、expired retry、过期提示链路 |
| 缺最终二维码/构建确认 | 所有真机页面结果均不得写通过；用户旧二维码不能默认视为最后大版本 |
| 缺真机截图/录屏 | 所有 UI/UX、流程、保存、返回、同步结果不得写通过 |
| 缺控制台 | 401/loading、rankings、brief、分享保存相关回归不得关闭 |
| API 摘要归档已具备但缺真机证据 | 可引用 `docs/runtime/pr-int-final-qa-api-summary-008.md` 和接口联调计划 3.20；仍不得替代真机截图/录屏/控制台 |

##### 13.16.33.6 下一步执行条件

| 责任方 | 需要提供 |
| --- | --- |
| PM / 测试 / 有上传权限成员 | 确认构建号、上传备注、上传时间；如不能确认用户旧二维码属于最后大版本，则重新生成最终二维码/入口 |
| PM / 用户 / 人工测试执行人 | iPhone 12 / iOS 26.5 / 微信 8.0.73 真机操作窗口，按 13.16.33.4 一次性录屏/截图 |
| 前端 / PM / 测试 | 控制台采集方式：优先微信开发者工具 Console/Network 或真机远程调试；若只能普通体验版扫码，测试结论必须标注“未采控制台” |
| 接口联调 | API 摘要归档已具备：`docs/runtime/pr-int-final-qa-api-summary-008.md`、接口联调计划 3.20；后续如有更新需同步 warnings/skipped、cleanup 口径和 pointsLedger/operationLogs 关键 ID |
| 后端/API / 接口联调 | 如要覆盖审核/举报/expired retry，补 `reviewMomentId`、`reportId`、`expiredTaskId` dedicated 样本 |

##### 13.16.33.7 `PR-INT-FINAL-QA-API-SUMMARY-008` API 摘要归档更新

PM 更新：接口联调 `PR-INT-FINAL-QA-API-SUMMARY-008` 已完成，可解除 `PR-QA-FINAL-IP12-CAPTURE-EXEC-007` 中的“API 摘要归档”缺口。测试可引用：

| 引用项 | 路径 / 章节 | 测试判断 |
| --- | --- | --- |
| API 摘要文件 | `docs/runtime/pr-int-final-qa-api-summary-008.md` | API 摘要归档已具备 |
| 接口联调计划 | 3.20 | 可作为接口联调公开摘要索引 |

剩余阻塞只保留：最终构建/二维码、真机操作窗口、控制台采集条件，以及 `reviewMomentId`、`reportId`、`expiredTaskId` 三类 dedicated 样本。API 摘要归档不能替代真机截图、录屏或控制台证据，不得据此写最终通过。

##### 13.16.33.8 前端最终构建交接与后端 action 合同更新

PM 更新：前端 `PR-FE-FINAL-BUILD-QR-HANDOFF-008` 已完成，后端 `PR-BE-ADMIN-PAGE-ACTION-CONTRACT-008` 已完成。测试侧更新阻塞口径如下：

| 项 | 当前判断 |
| --- | --- |
| 前端最终构建交接 | 已完成，但当前不能确认用户旧二维码是否是最后大版本；最终真机采集前必须由 PM/测试/有上传权限成员确认构建号、上传备注、上传时间，或重新生成最终二维码/入口 |
| 后端 action 合同 | 已完成，无需等待后端改代码；但后台 action 前台同步仍必须回收后台截图/响应、前台同步录屏和控制台/API 证据 |
| 控制台采集 | 优先微信开发者工具 Console/Network 或真机远程调试；若只能普通体验版扫码，测试结论必须标注“未采控制台”，且 401/loading 等控制台项不得关闭 |
| 剩余阻塞 | 最终二维码/构建确认、iPhone 12 操作窗口、控制台采集可行性、`reviewMomentId` / `reportId` / `expiredTaskId` 三类缺样本 |

不得因前端交接、后端 action 合同或 API 摘要归档完成而写最终通过；最终通过仍必须依赖 iPhone 12 真机截图、录屏、控制台和必要 API 摘要。

本节结论：`PR-QA-FINAL-IP12-CAPTURE-EXEC-007` 已进入“最终采集执行准备”。当前已接收公开样本 ID、页面 query、API 摘要归档、前端最终构建交接和后端 action 合同；但仍缺最终二维码/构建确认、iPhone 12 操作窗口、控制台采集可行性，且 `reviewMomentId`、`reportId`、`expiredTaskId` dedicated 样本仍缺。因此本轮未实际执行真机采集，未产出截图/录屏/控制台证据，所有用例保持阻塞或待证据，不得写最终通过。

#### 13.16.34 `PR-QA-DEVTOOLS-PREVIEW-ACCEPT-010` 开发者工具预览框阶段验收口径

记录时间：2026-06-16。PM 按用户最新指令调整验收策略：当前开发推进阶段，真机标识、测试调试和交互验证通过微信开发者工具右侧预览框实现；小程序开发工具预览框通过即可作为本阶段通过依据。暂无真机时跳过真机截图、录屏、设备窗口、体验版二维码等繁琐流程，不得因此影响开发进度。本节只调整当前阶段测试口径，不代表正式发布真机准出。

##### 13.16.34.1 新旧口径替换

| 原阻塞项 | 当前阶段新口径 | 说明 |
| --- | --- | --- |
| 缺 iPhone 12 真机截图/录屏 | 不再作为当前开发推进阻塞 | 后续正式发布前如需要，再由 PM 另开最终真机准出任务 |
| 缺体验版二维码/真机操作窗口 | 不再阻塞预览框阶段验收 | 使用微信开发者工具右侧预览框、预览框点击、Console/Network/storage 记录 |
| 缺控制台采集 | 改为开发者工具 Console / Network / storage 必收 | 无需真机远程调试；预览框开发者工具控制台即可 |
| UI/UX 未真机复拍 | 改为预览框截图/自动截图/页面点击证据 | 重点看交互体验，不再因设备材料缺失阻塞开发 |
| 正式真机发布通过 | 当前不写 | 当前只能写“预览框阶段通过/退回/待修” |
| `PR-QA-FINAL-IP12-CAPTURE-EXEC-007` 真机阻塞 | 降级为历史阻塞，不再卡当前开发推进 | 本阶段以 `PR-QA-DEVTOOLS-PREVIEW-ACCEPT-010` 右侧预览框结果为准 |

##### 13.16.34.2 预览框验收矩阵

| 顺序 | 覆盖项 | 预览框操作 | 必收证据 | 通过标准 |
| --- | --- | --- | --- | --- |
| 1 | 首页登录入口 | 清 storage 后点击首页主 CTA，确认登录/授权/创建承接 | 预览框截图或自动截图、Console 无重复 401/loading、storage 摘要 | 未登录不空转，登录后能回流目标页 |
| 2 | 三步创建并拍首张 | 首页 -> 创建聚会 -> 邀请/二维码 -> 拍照/上传入口 | 每步截图、页面路径、关键点击记录、Network 摘要 | 三步内能到拍照/上传；主 CTA 清晰可达 |
| 3 | UI/UX 边界 | 预览框宽度下查看首页、创建、邀请、拍照、相册、我的 | 溢出/遮挡截图、CSS/页面定位 | 元素不越界，按钮不贴边遮挡，安全区合理 |
| 4 | 列表与卡片密度 | 相册/记录/榜单/我的列表滚动 | 截图、滚动位置、列表状态 | 单列不过厚，长列表有收敛、分组或轻量化 |
| 5 | 分享保存 | 打开 ready share task，点击保存/重试相关入口 | 页面截图、Console/Network、权限/失败提示 | 无明显报错，失败和权限提示清楚 |
| 6 | brief / rankings | 打开 `session-brief`、`rankings?category=best_opening` | 页面截图、API 摘要引用、Console | 无英文 not found、404 反复、空白页 |
| 7 | 后台同步前台可见性 | 引用后台按钮复测证据，预览框检查前台相关入口 | operationLogs 摘要、前台页面截图 | 页面入口和提示合理；正向发奖数据不足时写待样本 |
| 8 | UGC/隐私 | 局内/局外、private、举报/审核入口如有 | 页面截图、权限状态、缺样本说明 | 无越权展示；缺 `reportId/reviewMomentId/expiredTaskId` 时写待样本 |

##### 13.16.34.3 当前仍需保留的阻塞

| 阻塞项 | 保留原因 | 下一步 |
| --- | --- | --- |
| `reviewMomentId` 缺失 | 审核专项样本未覆盖 | 接口联调 `PR-INT-REWARD-REPORT-EXPIRED-SAMPLES-009` 补样本 |
| `reportId` 缺失 | 举报链路未覆盖 | 接口联调补 report 样本 |
| `expiredTaskId` 缺失 | expired retry 未覆盖 | 接口联调补 expired share task 样本 |
| `grantedCount>0` 正向发奖缺失 | 奖励完整验收未覆盖 | 接口联调补候选，后端/API 给 ledger/payout 查询口径 |

##### 13.16.34.4 本轮预览框执行记录

执行时间：2026-06-16。测试侧尝试使用既有脚本采集微信开发者工具右侧预览框。

| 采集项 | 命令 / 证据 | 结果 | 测试判断 |
| --- | --- | --- | --- |
| 右侧预览截图 | `pwsh -NoLogo -NoProfile -File scripts/capture-wechat-devtools-preview.ps1 -Mode right -Output docs/runtime/pr-qa-devtools-preview-accept-010-right.png` | 命令返回 `ok:true`，输出 `docs/runtime/pr-qa-devtools-preview-accept-010-right.png`，但尺寸仅 61x28 | 截图无有效页面内容，不能作为 UI/UX 或交互验收证据 |
| 全窗口截图 | `pwsh -NoLogo -NoProfile -File scripts/capture-wechat-devtools-preview.ps1 -Mode window -Output docs/runtime/pr-qa-devtools-preview-accept-010-window.png` | 命令返回 `ok:true`，输出 `docs/runtime/pr-qa-devtools-preview-accept-010-window.png`，但尺寸仅 160x28 | 疑似微信开发者工具窗口最小化、未展开或系统截图接口只取到标题/边缘；不能写预览框阶段通过 |
| Console / Network / storage | 未采集 | 当前没有可用控制台摘要、Network 请求摘要或 storage 摘要 | 401/loading、接口状态、登录态和 storage 相关项不能关闭 |
| 点击路径 | 未采集 | 当前没有首页登录、三步创建、分享、brief、rankings 等点击记录 | 交互体验不能写通过 |

##### 13.16.34.5 当前退回 / 待补项

| 问题 | 退回对象 | 需要补什么 |
| --- | --- | --- |
| 预览框截图无有效内容 | PM / 测试执行人 / 有 GUI 操作权限成员 | 将微信开发者工具窗口恢复到可见、非最小化状态，展开右侧小程序预览框后重跑截图脚本 |
| 无点击路径 | 测试执行人 / 前端配合 | 在右侧预览框按矩阵点击：首页登录入口、三步创建到拍照/上传、创建/邀请/相册/分享/brief/rankings、后台同步入口、private/UGC 页面 |
| 无 Console/Network/storage 摘要 | 前端 / 测试执行人 | 采集开发者工具 Console、Network 请求、storage 登录态摘要；保留错误原文 |
| 无 UI/UX 定位截图 | UI/UX / 前端 / 测试执行人 | 对元素越界、按钮不可达、列表厚重、旧品牌/玩法权重、三步路径不清逐项截图和标注 |

本节结论：从 `PR-QA-DEVTOOLS-PREVIEW-ACCEPT-010` 起，测试可按微信开发者工具右侧预览框执行当前阶段验收；预览框阶段通过即可推动开发继续。不得再因缺真机截图、录屏、体验版二维码、设备窗口阻塞开发。当前本轮执行结果为 `预览框采集阻塞 / 待重跑截图 / 待点击路径 / 待 Console-Network-storage 摘要`，不能写“预览框阶段通过”。正式发布真机准出如需要，后续另开任务。

##### 13.16.34.6 窗口恢复后预览框复测记录

执行时间：2026-06-16。PM 已定位首次截图阻塞根因：微信开发者工具窗口最小化，原 `docs/runtime/pr-qa-devtools-preview-accept-010-right.png` 仅 61x28、`docs/runtime/pr-qa-devtools-preview-accept-010-window.png` 仅 160x28，不再作为继续阻塞依据。PM 已恢复窗口并补证据，测试侧完成可读截图复跑。

| 证据 | 路径 | 测试判断 |
| --- | --- | --- |
| PM 恢复后全窗口截图 | `docs/runtime/pr-pm-devtools-preview-window-restored-010.png` | 可作为窗口已恢复证据 |
| PM 恢复后右侧预览截图 | `docs/runtime/pr-pm-devtools-preview-right-restored-010.png` | 可作为右侧预览框可读证据 |
| PM 创建聚会页截图 | `docs/runtime/pr-pm-devtools-preview-phone-create-session-010.png` | 可作为创建聚会页预览框截图证据 |
| 测试复跑右侧预览截图 | `docs/runtime/pr-qa-devtools-preview-accept-010-right-rerun.png`，410x800 | 可读；当前页面为首页 |
| 测试复跑全窗口截图 | `docs/runtime/pr-qa-devtools-preview-accept-010-window-rerun.png`，1080x800 | 可读；微信开发者工具窗口已恢复 |

##### 13.16.34.7 预览框阶段已观察结果

| 页面 / 链路 | 证据 | 观察结果 | 当前判定 |
| --- | --- | --- | --- |
| 首页 | `docs/runtime/pr-qa-devtools-preview-accept-010-right-rerun.png` | 品牌为“聚会记录师”；首屏主动作有 `创建聚会`、`加入口令/扫码`、`继续记录`；底部 Tab 可见；未见明显越界 | 首页静态预览可读，待点击登录入口和 Console/Network/storage |
| 创建聚会 | `docs/runtime/pr-pm-devtools-preview-phone-create-session-010.png` | 可见三步条 `1 创建 / 2 邀请 / 3 拍照`，底部 `创建并邀请` CTA 可见；轻量主题卡未见明显裁切；页面视觉重心符合三步创建 | 创建页静态预览可读，待点击 `创建并邀请` 进入邀请/拍照 |
| 最近相册/首页信息密度 | `docs/runtime/pr-qa-devtools-preview-accept-010-right-rerun.png` | 最近相册区域显示多张浅色卡片，当前截图未见明显超边界；部分卡片内容偏工具/素材化，需继续确认是否为真实聚会相册内容 | 待 UI/UX / 前端继续复核真实数据态 |

##### 13.16.34.8 本轮未完成项与原因

| 未完成项 | 原因 | 退回对象 / 下一步 |
| --- | --- | --- |
| 右侧预览框连续点击路径 | 当前线程 Windows Computer Use 初始化失败，错误为 `Package subpath './dist/project/cua/sky_js/src/targets/windows/internal/computer_use_client_base.js' is not defined by "exports" in ... @oai/sky ... package.json`；微信开发者工具 `auto-port=9420` 探测超时 | PM / 测试执行人 / 有 GUI 操作权限成员在右侧预览框人工点击，或修复 Computer Use / auto-port 后由测试自动点击 |
| 首页登录入口点击 | 未完成点击，不能确认本轮 storage 清空后点击主 CTA 的页面状态 | 测试执行人补点击截图、Console、storage 摘要；可复用 PM 既有 `home-login-entry-after-primary-tap-9420.png` 作为历史初证，但本轮需新矩阵证据 |
| 三步创建到拍照/上传 | 仅有创建页截图，未完成 `创建并邀请 -> 邀请/二维码 -> 拍照/上传` 点击路径 | 测试执行人 / 前端补连续点击截图或录屏 |
| 相册、分享、brief、rankings、后台同步、private/UGC 页面 | 本轮未完成页面跳转和点击 | 前端 / 测试执行人按 13.16.34.2 矩阵补页面截图、点击路径、Console/Network/storage |
| Console / Network / storage 摘要 | 当前未采集到开发者工具控制台、网络请求或 storage 摘要 | 前端 / 测试执行人补 Console/Network/storage 截图；无摘要时 401/loading、接口状态、登录态不得关闭 |

##### 13.16.34.9 当前退回与待修清单

| 类型 | 问题 / 缺口 | 退回对象 | 需要补的证据 |
| --- | --- | --- | --- |
| 测试执行 | 点击路径未完成 | PM / 测试执行人 | 首页登录入口、三步创建到拍照/上传、相册、分享、brief、rankings、后台同步、private/UGC 页面逐项点击截图 |
| 测试工具 | 当前线程无法稳定自动点击微信开发者工具 | PM / 工具环境负责人 | 修复 Computer Use `@oai/sky` 导出错误，或提供可用 `auto-port=9420` 点击脚本 |
| 前端 / UIUX | 最近相册卡片是否仍偏工具素材化待确认 | 前端 / UI/UX | 使用线上样本或预览框数据态截图确认最近相册展示的是聚会照片/记录，不是工具素材 |
| 接口联调 | dedicated 样本仍缺 | 接口联调 / 后端 API | `reviewMomentId`、`reportId`、`expiredTaskId`；缺失时审核、举报、expired retry 继续待样本 |

本轮结论：窗口恢复后，`PR-QA-DEVTOOLS-PREVIEW-ACCEPT-010` 已取得可读预览框截图，首页和创建聚会静态预览未见明显越界或旧品牌主视觉问题；但连续点击路径、Console/Network/storage 摘要、相册/分享/brief/rankings/后台同步/private/UGC 页面证据未回收，当前只能写 `预览框阶段部分证据已回收 / 待继续点击 / 待控制台网络摘要 / 待 UIUX 复核`，不能写“预览框阶段通过”，也不能写“正式发布真机通过”。

#### 13.16.35 `PR-QA-DEVTOOLS-PREVIEW-MATRIX-CONTINUE-011` 预览框矩阵继续执行准备

记录时间：2026-06-16。PM 派工继续 `PR-QA-DEVTOOLS-PREVIEW-MATRIX-CONTINUE-011`。当前 `PR-QA-DEVTOOLS-PREVIEW-ACCEPT-010` 结论为部分证据回收，不能通过：`docs/runtime/pr-qa-devtools-preview-accept-010-right-rerun.png` 410x800 首页可读、`docs/runtime/pr-qa-devtools-preview-accept-010-window-rerun.png` 1080x800 可读，但自动端口超时、Computer Use 初始化失败，点击矩阵和 Console/Network/storage 未完成。本节只更新测试计划节点，不改 PM 总台账。

##### 13.16.35.1 create-session 复拍等待项

| 项 | 当前要求 | 当前状态 | 责任方 |
| --- | --- | --- | --- |
| 前端修复 | 等待前端完成 `PR-FE-PREVIEW-P1-THEME-CARD-FIX-011` 后再重跑 `create-session` 预览框截图 | 待前端回包 | 前端负责人 |
| 复拍页面 | `pages/create-session/index`，覆盖三步条、主题卡、人数/高级设置、底部 `创建并邀请` CTA | 待重跑截图 | 测试执行人 / 前端 |
| 复拍证据 | `PR-QA-DEVTOOLS-PREVIEW-MATRIX-CONTINUE-011-create-session-after-theme-card-fix-right-<build>-20260616.png`；必要时补全窗口截图 | 待截图 | 测试执行人 |
| 失败判定 | 主题卡文字/图形裁切、横向/纵向越界、底部 CTA 被遮挡、仍需旧玩法配置才能继续，均退前端/UIUX | 待复核 | 测试 / UIUX |

##### 13.16.35.2 人工或可用工具点击矩阵

| 顺序 | 覆盖项 | 预览框操作 | 必收证据 | 当前状态 |
| --- | --- | --- | --- | --- |
| 1 | 首页登录 | 清 storage 或模拟未登录 -> 点击 `创建聚会` -> 观察登录/授权/创建承接 | 首页点击前后截图、点击记录、Console 无重复 401/loading、storage 摘要 | 待可控点击 / 待控制台摘要 |
| 2 | 三步创建到拍照/上传 | 首页 -> 创建聚会 -> `创建并邀请` -> 邀请/二维码 -> 拍照/上传入口 | 每步截图、页面路径、Network 摘要、失败时错误原文 | 待前端主题卡修复后执行 |
| 3 | 相册 | 首页最近相册或底部 Tab -> 相册/记录页 -> 滚动空态/短列表/可用列表 | 相册截图、滚动位置、返回动作、列表密度截图 | 待可控点击 |
| 4 | 分享 | 打开 ready share task 或分享入口 -> 保存/权限/失败提示 | 页面截图、Console/Network、权限提示或失败提示 | 待可控点击 / 待 task 页面入口 |
| 5 | brief | 打开 `session-brief?briefId=brief-1781584503870-25d5edac&sessionId=session-1781584503517-c033e9` | brief 页面截图、Console、API 摘要引用 | 待可控点击或可直接打开 query |
| 6 | rankings | 打开 `rankings?category=best_opening`，切换或刷新 | 页面截图、Console、Network、无英文 `not found` | 待可控点击或可直接打开 query |
| 7 | 后台同步 | 引用 rewardPayout/operationLogs，预览框检查前台入口或积分/榜单可见性 | 前台同步页面截图、operationLogs 摘要引用 | 待前台入口 / 待可控点击 |
| 8 | private/UGC | 打开 `moment-editor`、`live-record`、分享过滤/权限相关页 | 权限状态截图、过滤节点说明、缺样本说明 | 待可控点击；`reviewMomentId/reportId/expiredTaskId` 缺失项继续待样本 |

##### 13.16.35.3 工具不可点击时的记录口径

| 条件 | 记录口径 | 不允许写 |
| --- | --- | --- |
| Computer Use 仍报 `@oai/sky` 导出错误 | `待可控点击 / 待人工右侧预览点击` | 不写预览框阶段通过 |
| `auto-port=9420` 仍超时或不可连接 | `待可用自动化端口 / 待人工点击` | 不写自动点击已完成 |
| 无 Console/Network/storage | `待控制台摘要` | 不关闭 401/loading、接口状态、登录态相关项 |
| 只有静态截图无点击路径 | `静态预览可读 / 交互待测` | 不写交互体验通过 |
| 前端主题卡修复未回包 | `待前端 PR-FE-PREVIEW-P1-THEME-CARD-FIX-011` | 不写 create-session P1 修复验收通过 |

##### 13.16.35.4 当前结论

`PR-QA-DEVTOOLS-PREVIEW-MATRIX-CONTINUE-011` 已准备人工/可用工具点击矩阵。当前需先等待前端 `PR-FE-PREVIEW-P1-THEME-CARD-FIX-011` 回包后重跑 `create-session` 截图；若工具仍不可点击，测试计划只写 `待可控点击 / 待控制台摘要 / 静态预览可读`，不得写“预览框阶段通过”，也不得写正式真机发布通过。

#### 13.16.36 `PR-QA-DEVTOOLS-AUTOMATION-RECOVER-012` 预览框点击工具链恢复

记录时间：2026-06-16。PM 已确认 `Codex Computer Use` 仍因 `@oai/sky` 导出子路径缺失不可用；测试不再等待该插件。当前改用微信开发者工具自动化端口 `9420` + `miniprogram-automator` 执行预览框点击、截图、page data 和 storage 取证。

##### 13.16.36.1 新工具入口

| 类型 | 路径 / 命令 | 用途 |
| --- | --- | --- |
| 启动自动化端口 | `pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420` | 确认或启动微信开发者工具自动化端口 |
| 强制重启自动化端口 | `pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420 -QuitExisting` | 端口假死或连接异常时使用 |
| 自动化控制器 | `npm.cmd run wechat:auto -- <command>` | 执行 status / relaunch / tap / storage / screenshot / flow |
| 使用说明 | `docs/runtime/wechat-devtools-automation-guide.md` | 测试成员操作手册 |

##### 13.16.36.2 已验证命令

| 用例 | 命令 | 结果 |
| --- | --- | --- |
| 端口状态 | `pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420` | 返回 `ok:true`、`action=already-listening`、`port=9420` |
| 当前页和 storage | `npm.cmd run wechat:auto -- status --port 9420 --storage --output docs/runtime/wechat-automator-status-9420.png` | 成功读取当前页、storage，并生成截图 |
| 首页登录入口点击 | `npm.cmd run wechat:auto -- flow home-login --port 9420 --clearStorage --output docs/runtime/wechat-automator-home-login-9420.png` | 点击 `.home-action-primary` 后 `authPanelVisible=true`、`authRedirectUrl=/pages/create-session/index`、`loggedIn=false` |
| 创建页打开 | `npm.cmd run wechat:auto -- relaunch --port 9420 --path /pages/create-session/index --data sessionName,templates,playerCount --output docs/runtime/wechat-automator-create-session-9420.png` | 成功进入 `pages/create-session/index`，生成截图 |

##### 13.16.36.3 后续测试记录要求

| 必填项 | 说明 |
| --- | --- |
| 命令原文 | 完整 `npm.cmd run wechat:auto -- ...` 命令 |
| 截图路径 | `docs/runtime/*.png` |
| 当前页 | 输出中的 `summary.page.path/query` |
| 关键 data | 与用例相关的 data 字段，例如 `authPanelVisible`、`authRedirectUrl`、`loggedIn` |
| storage 摘要 | 只记录 token 后 8 位，不得写完整 token |
| console 摘要 | 输出中的 `console`；如为空写 `console=[]` |
| 结论边界 | 只能写“预览框阶段通过/退回/待修”，不得写正式真机发布通过 |

##### 13.16.36.4 当前准入结论

`PR-QA-DEVTOOLS-AUTOMATION-RECOVER-012` 已解除“无法点击预览框”的工具链阻塞。测试可继续 `PR-QA-DEVTOOLS-PREVIEW-MATRIX-CONTINUE-011`。正式发布真机准出仍不在本节范围内。

#### 13.16.37 `PR-QA-DEVTOOLS-PREVIEW-MATRIX-CONTINUE-011` 预览框自动化矩阵执行记录

记录时间：2026-06-16。根据 PM 更新，`PR-PM-DEVTOOLS-AUTOMATION-RECOVER-012` 已恢复微信开发者工具自动化端口 `9420`，本轮不再等待 Computer Use 插件，改用 `scripts/wechat-devtools-automator.js` / `npm.cmd run wechat:auto -- ...` 执行预览框矩阵。本文只记录测试/验收节点，不改 PM 总台账；预览框阶段结果不等同于正式真机发布通过。

##### 13.16.37.1 执行环境与公共摘要

| 项目 | 记录 |
| --- | --- |
| 自动化端口 | `9420` |
| 启动核验 | `pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420` -> `already-listening` |
| 当前 storage 摘要 | `runtime-api-base=""`、`jzp-user-token=""`、`social-user-session-token=""`、`social-current-profile-id=user-1781587617321-78877`；未记录完整 token |
| Console 摘要 | 多数页面 `console=[]`；`live-record` 多次出现 info：`[session-exit] enableAlertBeforeUnload enabled`，未见 401/loading 配对警告原文 |
| Network 摘要 | 当前脚本未导出 DevTools Network 面板明细；页面接口状态仍引用接口联调公开摘要 `docs/runtime/pr-int-final-qa-api-summary-008.md`，本节记录页面 data/storage/console |
| 命令注意 | 含 `&` 的 query 经 `npm.cmd` 会被 Windows `cmd` 截断，本轮 query 页面改用 `node scripts\wechat-devtools-automator.js ... --path $p` 传参 |

##### 13.16.37.2 预览框矩阵执行结果

| 矩阵项 | 命令/入口 | 截图证据 | page/data/storage/console 摘要 | 当前测试判定 |
| --- | --- | --- | --- | --- |
| 工具链状态 | `npm.cmd run wechat:auto -- status --port 9420 --storage --output docs/runtime/pr-qa-011-status-9420.png` | `docs/runtime/pr-qa-011-status-9420.png` | 当前页 `pages/create-session/index`；storage token 为空；`console=[]` | 工具链可连接，预览框矩阵可继续 |
| 首页未登录创建入口 | `npm.cmd run wechat:auto -- flow home-login --port 9420 --clearStorage --output docs/runtime/pr-qa-011-home-login-9420.png` | `docs/runtime/pr-qa-011-home-login-9420.png` | `pages/index/index`；点击 `.home-action-primary` 后 `authPanelVisible=true`、`authRedirectUrl=/pages/create-session/index`、`loggedIn=false`；`console=[]` | 预览框阶段首页登录入口初证已回收；仍不等同真机发布通过 |
| 创建聚会页静态 | `npm.cmd run wechat:auto -- relaunch --port 9420 --path /pages/create-session/index --wait 2500 --storage --data sessionName,templates,playerCount,templatesLoading --output docs/runtime/pr-qa-011-create-session-wait-9420.png` | `docs/runtime/pr-qa-011-create-session-wait-9420.png` | `pages/create-session/index`；`templates=[]`、`templatesLoading=true`、`playerCount=2`；`console=[]` | `PR-FE-PREVIEW-P1-THEME-CARD-FIX-011` 仍待前端回包后复拍；当前主题卡仍是加载/骨架状态，不能写修复验收完成 |
| 创建页 CTA 点击 | `npm.cmd run wechat:auto -- tap --port 9420 --path /pages/create-session/index --selector .create-primary --wait 2000 --storage --data sessionName,templates,playerCount,templatesLoading --output docs/runtime/pr-qa-011-create-session-primary-tap-9420.png` | `docs/runtime/pr-qa-011-create-session-primary-tap-9420.png` | 点击 `.create-primary` 后仍停留 `pages/create-session/index`；`templatesLoading=true`；`console=[]` | 三步创建链路未形成连续跳转证据；待前端/接口联调复核模板加载与创建提交条件 |
| 邀请/二维码页 | `node scripts\wechat-devtools-automator.js relaunch --port 9420 --path $p --wait 2000 --storage --data sessionId,inviteCode,sessionName,loading,error --output docs/runtime/pr-qa-011-invite-group-9420.png`，`$p=/pages/invite-group/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T` | `docs/runtime/pr-qa-011-invite-group-9420.png` | page query 含 `sessionId`、`inviteCode`；但 data `sessionId=""`、`inviteCode=""`、`sessionName=""`；截图仍显示“房间码 生成中”；`console=[]` | 退回前端/接口联调复核：已给 query 但页面 data 未落地，三步邀请页存在卡壳风险 |
| 拍照/上传页 private/UGC | `node scripts\wechat-devtools-automator.js relaunch --port 9420 --path $p --wait 2000 --storage --data sessionId,visibility,submitLabel,uploading,uploadError,imageUrl --output docs/runtime/pr-qa-011-moment-editor-private-9420.png`，`$p=/pages/moment-editor/index?sessionId=session-1781584503517-c033e9&nodeType=private&visibility=private` | `docs/runtime/pr-qa-011-moment-editor-private-9420.png` | page query 含 private 参数；data `sessionId=""`、`visibility=session`、`submitLabel=保存照片`、`uploading=false`；`console=[]` | 拍照页 UI 可读、保存按钮可达；private query 未进入 data，权限/UGC 不能写通过，待前端/UGC 复核 |
| 记录/相册页 | `node scripts\wechat-devtools-automator.js tap --port 9420 --path '/pages/live-record/index?sessionId=session-1781584503517-c033e9' --selector '.live-segment-tab[data-tab="album"]' --wait 1200 --storage --data activeSegment,timelineNodes,timelineLoading,sessionId,sessionName --output docs/runtime/pr-qa-011-live-record-album-tap-9420.png` | `docs/runtime/pr-qa-011-live-record-album-tap-9420.png` | 点击后 `activeSegment=album`、`timelineNodes=[]`、`timelineLoading=false`；data `sessionId=""`、`sessionName=""`；console 多条 `[session-exit] enableAlertBeforeUnload enabled` | 相册 Tab 可点击，空态无明显拖尾；真实相册列表/返回/长内容仍未覆盖，data 未落 session 需复核 |
| 分享预览页 | `node scripts\wechat-devtools-automator.js relaunch --port 9420 --path $p --wait 2000 --storage --data sessionId,inviteCode,sessionName,showJoinStatus,shareItems,previewToast --output docs/runtime/pr-qa-011-share-preview-9420.png`，`$p=/pages/share-preview/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781584503902-a99a5211` | `docs/runtime/pr-qa-011-share-preview-9420.png` | data `sessionId=session-1781584503517-c033e9`、`inviteCode=W58G7T`、`sessionName=IT-MOMENTS-20260616-006B-session`；`console=[]` | 分享预览页数据落地，页面可读 |
| 分享保存 | `node scripts\wechat-devtools-automator.js tap --port 9420 --path $p --selector .share-primary --wait 2500 --storage --data sessionId,inviteCode,sessionName,posterImagePath,previewToast --output docs/runtime/pr-qa-011-share-preview-save-tap-9420.png` | `docs/runtime/pr-qa-011-share-preview-save-tap-9420.png` | 点击 `.share-primary` 后 `posterImagePath=http://tmp/...png`；`console=[]` | 预览框阶段可生成临时海报路径；系统相册权限/真机保存仍不在本阶段覆盖 |
| 分享举报/UGC 入口 | `node scripts\wechat-devtools-automator.js tap --port 9420 --path $p --selector .share-report-entry --wait 1200 --storage --data sessionId,inviteCode,sessionName,showJoinStatus --output docs/runtime/pr-qa-011-share-report-entry-tap-9420.png` | `docs/runtime/pr-qa-011-share-report-entry-tap-9420.png` | 分享页数据保持正常；`console=[]` | 仅覆盖入口点击；`reviewMomentId/reportId/expiredTaskId` 缺失，举报/审核/expired 专项继续待样本 |
| brief 读取 | `node scripts\wechat-devtools-automator.js relaunch --port 9420 --path $p --wait 6000 --storage --data briefId,sessionId,briefTitle,subtitle,loading,error,shareTask --output docs/runtime/pr-qa-011-session-brief-wait-9420.png`，`$p=/pages/session-brief/index?briefId=brief-1781584503870-25d5edac&sessionId=session-1781584503517-c033e9` | `docs/runtime/pr-qa-011-session-brief-wait-9420.png` | page query 正确；data `briefId=""`、`sessionId=""`、`briefTitle=聚会简报`、`loading=true`、`shareTask=null`；`console=[]` | 退回前端/接口联调复核：brief 读取合同已确认，但预览框 6 秒后仍 loading，不能写该页通过 |
| rankings | `node scripts\wechat-devtools-automator.js relaunch --port 9420 --path $p --wait 8000 --storage --data activeCategory,loading,errorText,items,dateText,categories --output docs/runtime/pr-qa-011-rankings-best-opening-wait-9420.png`，`$p=/pages/rankings/index?category=best_opening` | `docs/runtime/pr-qa-011-rankings-best-opening-wait-9420.png` | page query `category=best_opening`；data `activeCategory=today_highlight`、`loading=true`、`items=[]`、`errorText=""`；截图显示“加载榜单中...”且无英文 `not found` | 线上 200 不能替代页面验收；预览框仍 loading，退回前端/接口联调复核 query/category 与加载闭环 |
| wine-history 未登录/返回相关 | `node scripts\wechat-devtools-automator.js relaunch --port 9420 --path '/pages/wine-history/index?mode=host' --wait 4000 --storage --data mode,loading,authRequired,items,records,primaryText,errorText --output docs/runtime/pr-qa-011-wine-history-host-9420.png` | `docs/runtime/pr-qa-011-wine-history-host-9420.png` | `mode=host`、`loading=false`、`authRequired=true`、`primaryText=创建聚会`；`console=[]` | 未登录降级页可见，未见重复 401；相册无法返回其他页面问题仍需可点击返回路径专项复测 |
| 我的页/后台同步可见性 | `node scripts\wechat-devtools-automator.js relaunch --port 9420 --path /pages/me/index --wait 3000 --storage --data loggedIn,userName,stats,momentSummaries,shareRetryTasks,loading --output docs/runtime/pr-qa-011-me-9420.png` | `docs/runtime/pr-qa-011-me-9420.png` | `loggedIn=false`、`momentSummaries=[]`；`console=[]` | 未登录态可见；后台发奖后前台同步、积分/榜单联动仍缺登录态或可见数据证据 |

##### 13.16.37.3 本轮失败与待修索引

| 编号 | 问题 | 影响 | 退回对象 | 状态 |
| --- | --- | --- | --- | --- |
| `PR-QA-011-P0-001` | `create-session` 2.5 秒后 `templatesLoading=true`、主题卡区域仍是加载/骨架；点击 `.create-primary` 后未形成创建到邀请跳转证据 | 三步创建路径不能闭环 | 前端、接口联调 | 待修复/待复拍 |
| `PR-QA-011-P0-002` | `invite-group` query 已含 `sessionId/inviteCode`，但 data 为空，截图房间码显示“生成中” | 邀请/二维码步骤卡壳，影响创建后邀请 | 前端、接口联调 | 待修复/待复拍 |
| `PR-QA-011-P1-003` | `session-brief` 使用确认合同 query 后 6 秒仍 `loading=true`，data `briefId/sessionId` 为空 | brief 页面不能作为当前阶段验收完成 | 前端、接口联调 | 待修复/待复拍 |
| `PR-QA-011-P1-004` | `rankings?category=best_opening` 8 秒后仍 `loading=true`，data `activeCategory=today_highlight` 未采纳 query | 榜单页面不再是英文 `not found`，但加载闭环未完成 | 前端、接口联调 | 待修复/待复拍 |
| `PR-QA-011-P1-005` | `moment-editor` private query 未进入 data，`visibility=session` | private/UGC 权限无法验收 | 前端、UGC | 待样本/待复核 |
| `PR-QA-011-P2-006` | `live-record` console 多次输出 `[session-exit] enableAlertBeforeUnload enabled` | 未见 401/loading 警告，但日志重复需判断是否噪音 | 前端 | 待复核 |

##### 13.16.37.4 当前结论

`PR-QA-DEVTOOLS-PREVIEW-MATRIX-CONTINUE-011` 已能用微信开发者工具自动化端口执行预览框点击和截图。首页未登录入口、分享预览、分享保存临时海报、相册 Tab、wine-history 未登录降级已有预览框阶段证据；但三步创建仍在 `create-session` 模板加载/邀请页房间码生成中断点卡住，brief 与 rankings 也存在长时间 loading。当前结论为：`预览框阶段部分链路可用 / 主路径仍待修 / 不写预览框阶段通过 / 不写正式真机发布通过`。

#### 13.16.38 `PR-QA-DEVTOOLS-PREVIEW-MATRIX-CONTINUE-011` 2026-06-17 继续执行与调试器错误登记

记录时间：2026-06-17。PM 同步调试器错误截图 `docs/runtime/pm-devtools-debugger-window-20260617.png`，Console 可见本地 API 拒绝连接和 `session-brief` loading 配对问题。本节只更新测试/验收记录，不改 PM 总台账，不替前端、后端/API、接口联调、后台或 UGC 标完成。当前结论为 `待修 / 待复测`，不得写预览框阶段通过。

##### 13.16.38.1 执行环境与工具状态

| 项 | 记录 |
| --- | --- |
| PowerShell | `$PSVersionTable.PSVersion.ToString()` -> `7.6.2` |
| 自动化端口 | `pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420` -> `already-listening`；端口假死后执行 `pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420 -QuitExisting` -> `started`、`owningProcess=31020` |
| manifest | `docs/runtime/int-data-001-manifest.json` 存在，baseUrl=`http://127.0.0.1:3221/api/v1`，sessionId=`session-1781507687012-e4343d`，inviteCode=`C56EVT`，briefId=`brief-1781507687042-d1990edd`，readyTaskId=`share-task-1781507687046-d1098582` |
| storage 注入 | 使用 `miniprogram-automator` 注入 host 身份；`runtime-api-base=http://127.0.0.1:3221/api/v1`，`social-current-profile-id=user-1781507686650-a33705`，token 仅记录后 8 位 `a9f69589` |
| 截图工具限制 | `miniProgram.screenshot()` 15 秒超时；`capture-wechat-devtools-preview.ps1` 的 `PrintWindow` 截图为黑图；本轮可读截图改用前台窗口 `CopyFromScreen` 方式生成 |
| PM 调试器截图 | `docs/runtime/pm-devtools-debugger-window-20260617.png`，文件存在，已纳入本轮失败证据 |

##### 13.16.38.2 本轮调试器错误与接口状态

| 来源 | 错误 / 命令 | 结果 | 测试判定 |
| --- | --- | --- | --- |
| PM 调试器 Console | `GET 127.0.0.1:3221/api/v1/sessions/live ... ERR_CONNECTION_REFUSED` | 本地 API 连接被拒绝 | 退回后端/API、接口联调；首页登录态、当前酒局、后台同步相关用例待复测 |
| PM 调试器 Console | `POST 127.0.0.1:3221/api/v1/user/auth/login ... ERR_CONNECTION_REFUSED` | 登录接口连接被拒绝 | 首页登录 / 登录态不能写通过 |
| PM 调试器 Console | `pages/session-brief/index.ts:144 showLoading 与 hideLoading 必须配对使用` | loading 配对错误 | 退回前端；`session-brief` 待修复后复测 |
| 本轮只读 API 探测 | `Invoke-WebRequest http://127.0.0.1:3221/api/v1/config/home`、timeline、brief、share task、rankings | 全部返回 `由于目标计算机积极拒绝，无法连接。 (127.0.0.1:3221)` | 当前 3221 服务不可用，页面 loading/空 data 不能判定为接口合同通过 |

##### 13.16.38.3 预览框矩阵继续执行摘要

| 矩阵项 | 命令/入口 | 截图证据 | page/data/storage/console 摘要 | 当前测试判定 |
| --- | --- | --- | --- | --- |
| 首页 / storage 状态 | `node scripts\wechat-devtools-automator.js status --port 9420 --storage --data loggedIn,userName,home,sessionReturn` | 未用脚本截图；脚本截图超时 | `pages/index/index`；data `loggedIn=false`、`userName=未登录`；storage `runtime-api-base=http://127.0.0.1:3221/api/v1`、`jzp-user-token=""`、`social-user-session-token` 后缀 `a9f69589`、`social-current-profile-id=user-1781507686650-a33705`；`console=[]` | 已注入本地 profile 但页面仍未登录；结合 PM Console 的 login refused，登录态相关待接口联调/前端修复后复测 |
| 创建页复拍 | `node scripts\wechat-devtools-automator.js relaunch --port 9420 --path /pages/create-session/index --wait 4500 --storage --data sessionName,templates,selectedTemplateId,playerCount,templatesLoading,submitting,errorText` | `docs/runtime/pr-qa-011-continue-012-create-session-screen-window.png`；黑图不可用：`docs/runtime/pr-qa-011-continue-012-create-session-after-fix-right.png`、`docs/runtime/pr-qa-011-continue-012-create-session-after-fix-window.png` | `pages/create-session/index`；data `templates=[]`、`templatesLoading=true`、`playerCount=2`；storage `jzp-user-token=""`、`social-user-session-token` 后缀 `a9f69589`；`console=[]` | 主题卡区域仍为骨架/加载态；`PR-FE-PREVIEW-P1-THEME-CARD-FIX-011` 不能关闭，待 API 恢复和前端复核 |
| 创建页 CTA | `node scripts\wechat-devtools-automator.js tap --port 9420 --path /pages/create-session/index --selector .create-primary --wait 3500 --storage --data sessionName,templates,selectedTemplateId,playerCount,templatesLoading,submitting,errorText` | `docs/runtime/pr-qa-011-continue-012-create-session-primary-tap-window.png` | 点击后仍停留 `pages/create-session/index`；data `templates=[]`、`templatesLoading=true`；`console=[]` | 三步创建未形成到邀请页跳转证据；主路径 P0 待修/待复测 |
| 邀请/二维码 | `node scripts\wechat-devtools-automator.js relaunch --port 9420 --path '/pages/invite-group/index?sessionId=session-1781507687012-e4343d&inviteCode=C56EVT' --wait 3500 --storage --data sessionId,inviteCode,sessionName,loading,error` | `docs/runtime/pr-qa-011-continue-012-invite-group-window.png` | page query 有 `sessionId=session-1781507687012-e4343d`、`inviteCode=C56EVT`；data `sessionId=""`、`inviteCode=""`、`sessionName=""`；`console=[]` | query 未落 data，邀请页仍卡壳，退回前端/接口联调 |
| 拍第一张 / 上传 | `node scripts\wechat-devtools-automator.js relaunch --port 9420 --path '/pages/moment-editor/index?sessionId=session-1781507687012-e4343d&nodeType=opening' --wait 3500 --storage --data sessionId,nodeType,visibility,submitLabel,uploading,uploadError,imageUrl,sessionMembers` | `docs/runtime/pr-qa-011-continue-012-moment-editor-opening-window.png` | page query 有 `nodeType=opening`；data `sessionId=""`、`nodeType=highlight`、`visibility=session`、`submitLabel=保存照片`、`uploading=false`；`console=[]` | 拍第一张入口未按 query 进入 opening 状态；主路径待前端复核 |
| private / UGC | `node scripts\wechat-devtools-automator.js relaunch --port 9420 --path '/pages/moment-editor/index?sessionId=session-1781507687012-e4343d&nodeType=private&visibility=private' --wait 3500 --storage --data sessionId,nodeType,visibility,submitLabel,uploading,uploadError,imageUrl,memberOptions,selectedVisibleProfileIds` | 复用 moment-editor 窗口截图；本轮未单独保存 private 截图 | page query 有 private 参数；data `sessionId=""`、`nodeType=highlight`、`visibility=session`、`memberOptions=[]`、`selectedVisibleProfileIds=[]`；`console=[]` | private query 未进入 data，UGC/权限不能写通过 |
| 相册 Tab | `node scripts\wechat-devtools-automator.js tap --port 9420 --path '/pages/live-record/index?sessionId=session-1781507687012-e4343d' --selector '.live-segment-tab[data-tab="album"]' --wait 2000 --storage --data activeSegment,timelineNodes,timelineLoading,sessionId,sessionName,errorText` | `docs/runtime/pr-qa-011-continue-012-live-record-album-window.png` | page query 有 sessionId；data `activeSegment=album`、`timelineNodes=[]`、`timelineLoading=false`、`sessionId=""`、`sessionName=""`；console 多条 `[session-exit] enableAlertBeforeUnload enabled` | Tab 可点但未消费 session 数据，真实相册/返回/长列表仍待复测 |
| 分享预览 brief/task 入口 | `node scripts\wechat-devtools-automator.js relaunch --port 9420 --path '/pages/share-preview/index?briefId=brief-1781507687042-d1990edd&taskId=share-task-1781507687046-d1098582' --wait 3500 --storage --data sessionId,inviteCode,sessionName,showJoinStatus,shareItems,previewToast,posterImagePath` | 未单独保存；后续保存动作见下一行 | page query 为当前 manifest brief/task；data 却落到旧 `sessionId=session-1781584503517-c033e9`、`inviteCode=W58G7T`、`sessionName=""`；`console=[]` | brief/task 入口数据串到旧样本，上一轮分享页“数据落地”结论需降级为待复核 |
| 分享保存 session/invite 入口 | `node scripts\wechat-devtools-automator.js tap --port 9420 --path '/pages/share-preview/index?sessionId=session-1781507687012-e4343d&inviteCode=C56EVT' --selector .share-primary --wait 3000 --storage --data sessionId,inviteCode,sessionName,showJoinStatus,shareItems,previewToast,posterImagePath` | `docs/runtime/pr-qa-011-continue-012-share-preview-save-window.png` | data `sessionId=session-1781507687012-e4343d`、`inviteCode=C56EVT`、`sessionName=""`、`posterImagePath=http://tmp/...png`；`console=[]` | 可生成临时海报路径；但 sessionName 空、真机保存权限不在本轮覆盖，不能写分享准出 |
| brief | `node scripts\wechat-devtools-automator.js relaunch --port 9420 --path '/pages/session-brief/index?briefId=brief-1781507687042-d1990edd&sessionId=session-1781507687012-e4343d' --wait 8000 --storage --data briefId,sessionId,briefTitle,subtitle,loading,error,shareTask,timelineNodes` | PM 调试器错误截图：`docs/runtime/pm-devtools-debugger-window-20260617.png` | page query 正确；data `briefId=""`、`sessionId=""`、`briefTitle=聚会简报`、`loading=true`、`shareTask=null`、`timelineNodes=[]`；PM Console 有 `showLoading 与 hideLoading 必须配对使用` | 退回前端和接口联调；brief 待修复后复测 |
| rankings | `node scripts\wechat-devtools-automator.js relaunch --port 9420 --path '/pages/rankings/index?category=best_opening' --wait 9000 --storage --data activeCategory,loading,errorText,items,dateText,categories` | `docs/runtime/pr-qa-011-continue-012-rankings-best-opening-window.png` | page query `category=best_opening`；data `activeCategory=today_highlight`、`loading=true`、`items=[]`、`errorText=""`；`console=[]` | 未出现英文 `not found`，但 query/category 未采纳且加载未闭环；待修复/待复测 |
| 我的页 / 后台同步可见性 | `node scripts\wechat-devtools-automator.js relaunch --port 9420 --path /pages/me/index --wait 3500 --storage --data loggedIn,userName,stats,momentSummaries,shareRetryTasks,loading` | 本轮未单独保存窗口截图 | data `loggedIn=false`、`momentSummaries=[]`；storage profile 已注入但 `jzp-user-token=""`；`console=[]` | 后台同步、积分/相册摘要、登录态不能关闭，待 API/login refused 修复后复测 |

##### 13.16.38.4 本轮失败与待修索引

| 编号 | 问题 | 影响 | 退回对象 | 状态 |
| --- | --- | --- | --- | --- |
| `PR-QA-011-P0-007` | 本地 `127.0.0.1:3221` API 拒绝连接，PM Console 与测试只读探测均复现 | 首页登录、登录态、live session、brief、rankings、后台同步无法闭环 | 后端/API、接口联调 | 待修复/待复测 |
| `PR-QA-011-P0-008` | `session-brief` 出现 `showLoading 与 hideLoading 必须配对使用`，且 8 秒后 `loading=true`、`briefId/sessionId` 为空 | brief 页面阻塞，不能作为当前阶段通过证据 | 前端、接口联调 | 待修复/待复测 |
| `PR-QA-011-P0-009` | 创建页模板仍 `templates=[]`、`templatesLoading=true`，点击 `创建并邀请` 不跳转 | 三步创建到邀请/拍第一张不能闭环 | 前端、接口联调 | 待修复/待复测 |
| `PR-QA-011-P0-010` | `invite-group`、`moment-editor opening/private`、`live-record` 均出现 query 已有 sessionId 但 data `sessionId=""` | 邀请、拍照/上传、相册、private/UGC 权限均无法验收 | 前端、接口联调、UGC | 待修复/待复测 |
| `PR-QA-011-P1-011` | `share-preview` 使用 current manifest brief/task 入口时 data 串到旧 session/inviteCode；session/invite 入口可生成临时海报但 `sessionName=""` | 分享页面数据来源需复核，不能写分享链路通过 | 前端、接口联调 | 待修复/待复测 |
| `PR-QA-011-P1-012` | `rankings?category=best_opening` 9 秒后仍 `loading=true`，`activeCategory=today_highlight` | 榜单不再直显 `not found`，但加载闭环未完成 | 前端、接口联调 | 待修复/待复测 |
| `PR-QA-011-TOOL-013` | `miniProgram.screenshot()` 超时，`PrintWindow` 截图黑图；需前台窗口截图才可读 | 自动化截图链路不稳定，后续复测需先确认截图方式 | 测试工具链 / PM | 待复测前确认 |

##### 13.16.38.5 当前结论与下一步

本轮 `PR-QA-DEVTOOLS-PREVIEW-MATRIX-CONTINUE-011` 继续执行已回收 page/data/storage/console 摘要和部分可读窗口截图，但 PM 调试器和测试只读探测均确认 `127.0.0.1:3221` 当前拒绝连接，`session-brief` 还有 loading 配对错误。当前只能写：`预览框阶段待修 / 待后端或接口联调恢复 3221 / 待前端修复 session-brief loading 配对 / 待重跑首页登录、三步创建到拍第一张、相册、分享、brief、rankings、后台同步、private/UGC 矩阵`。

下一步责任：

- 后端/API、接口联调：恢复或明确替换 `127.0.0.1:3221` 本地 API 服务，给出 `config/home`、`sessions/live`、`user/auth/login`、timeline、brief、share task、rankings 可复跑摘要。
- 前端：修复 `pages/session-brief/index.ts:144` loading 配对，并复核 query 到 data 的落地问题，尤其是 `invite-group`、`moment-editor`、`live-record`、`rankings`。
- 测试/验收：收到对应线程回包后，重跑 session-brief、首页登录/登录态、三步创建到拍照/上传、相册、分享、rankings、后台同步、private/UGC 矩阵；每项继续记录命令原文、截图路径、summary.page、关键 data、storage token 后 8 位和 console 摘要。

#### 13.16.39 `PR-QA-DUAL-FLOW-SHARE-014` 双主线分享页与保存图 P0 验收矩阵

记录时间：2026-06-17。PM 新派 P0：用户明确纠偏“酒桌记账 / 聚会账本不能消失”，拍照记录与酒桌记账必须双主线并存，并共同进入分享页和分享截图保存。本文只新增测试/验收用例、证据命名和阻塞口径，不改源码、PM 总台账、团队公告、前端/UIUX/接口/后端/UGC 计划。

当前前置结论：

- `docs/party-recorder-redesign-requirements.md` 已明确双主线：拍照记录 + 酒桌记账 / 聚会账本并存；分享页和保存图必须同时展示照片墙或高光图、账本高光、关键事件和聚会总结。
- `docs/gameplay-moments-team-announcements.md` 已公告 `PR-QA-DUAL-FLOW-SHARE-014`，测试不得在记账入口或联合分享缺失时写预览框通过。
- `docs/gameplay-moments-progress-tracker.md` 已派 UI/UX、前端、后端/API、接口联调、测试、UGC、数据/运营相关 014 任务；当前仍缺 UI/UX 视觉规格、前端实现、接口样本和截图证据。
- 13.16.38 已登记当前阻塞：`127.0.0.1:3221` API refused、`session-brief` loading 配对错误、截图工具链不稳定。未修复前，本节所有用例只能写 `待修 / 待复测 / 阻塞`，不得写预览框阶段通过。

##### 13.16.39.1 双主线 P0 验收原则

| 原则 | 失败判定 | 责任对象 |
| --- | --- | --- |
| 拍照记录默认主路径必须可走通 | 首页 -> 创建聚会 -> 邀请/二维码 -> 拍第一张或上传任一环节卡住，判 P0 | 前端、接口联调、后端/API |
| 酒桌记账 / 聚会账本入口必须可见且可进入 | 首页、记录页、当前聚会页或桌面模式均无清晰入口，或入口藏到难找二级页，判 P0 | UI/UX、前端 |
| 记账能力不能消失 | 欠酒 / 已喝 / 加酒 / 关键事件 / 结算摘要 / 账本榜单等既有能力无入口、无状态或无降级说明，判 P0/P1 | 前端、后端/API、接口联调 |
| 分享页必须合并两类内容 | 分享页只展示照片或只展示旧海报，不包含账本高光、关键事件、聚会总结，判 P0 | UI/UX、前端、后端/API、接口联调 |
| 分享截图保存必须合并两类内容 | 保存图 / PNG / canvas 只含照片墙或只含账本，缺任一主线，判 P0 | UI/UX、前端、后端/API、接口联调 |
| 旧玩法不得阻塞拍照 | 玩法配置、判官规则、欠酒设置不得成为创建和拍第一张照片的必填阻塞；如阻塞，判 P0 | UI/UX、前端 |
| Console/Network/storage 证据必须完整 | 缺 console/network/storage 摘要或仍有 API refused / loading 配对红错，相关项不得关闭 | 测试、前端、接口联调、后端/API |

##### 13.16.39.2 预览框点击矩阵新增用例

| 用例编号 | 覆盖目标 | 预览框操作 | 命令模板 | 截图/录屏命名 | 必收摘要 | 当前状态 |
| --- | --- | --- | --- | --- | --- | --- |
| `PR-QA-DUAL-014-001` | 首页双主线入口 | 清 storage 或未登录态打开首页，确认 `创建聚会/拍照记录` 与 `酒桌记账/聚会账本` 两类入口可见；点击入口后有登录承接或进入对应页面 | `npm.cmd run wechat:auto -- status --port 9420 --storage --data loggedIn,home,sessionReturn --output docs/runtime/pr-qa-dual-014-home-entry-<build>-20260617.png`；若有明确 selector，再跑 `tap --selector <accounting-entry-selector>` | `PR-QA-DUAL-FLOW-SHARE-014-home-dual-entry-390-devtools-<build>-20260617.png`；失败控制台 `PR-QA-DUAL-FLOW-SHARE-014-console-home-entry-<build>-20260617.png` | page、home.quickTools / sessionReturn、storage token 后 8 位、Console/Network；入口缺失截图 | 阻塞：缺前端 014 入口实现/selector，且当前 API refused 未修 |
| `PR-QA-DUAL-014-002` | 拍照记录主线 | 首页 -> 创建聚会 -> 邀请/二维码 -> 拍第一张 / 上传；不被玩法、记账、模板长列表阻塞 | `npm.cmd run wechat:auto -- flow home-login --port 9420 --clearStorage --output docs/runtime/pr-qa-dual-014-photo-flow-home-<build>-20260617.png`；后续按前端回包 selector 逐步 tap | `PR-QA-DUAL-FLOW-SHARE-014-photo-create-invite-first-photo-390-devtools-<build>-20260617.mp4/png` | 每步 page/query/data、Network 创建/邀请/上传接口、Console 无红错、storage 摘要 | 阻塞：13.16.38 创建页模板 loading、邀请页 data 空、moment-editor query 未落地 |
| `PR-QA-DUAL-014-003` | 酒桌记账 / 聚会账本主线 | 从首页或记录页进入账本；执行或查看欠酒 / 已喝 / 加酒 / 关键事件 / 结算摘要 / 账本榜单任一可用状态 | `npm.cmd run wechat:auto -- relaunch --port 9420 --path /pages/judge/index --wait 3000 --storage --data sessionId,players,records,events,isJudge --output docs/runtime/pr-qa-dual-014-accounting-entry-<build>-20260617.png`；桌面模式候选：`relaunch --path /pages/table-mode/index?sessionId=<sessionId>` | `PR-QA-DUAL-FLOW-SHARE-014-accounting-entry-visible-390-devtools-<build>-20260617.png`；`PR-QA-DUAL-FLOW-SHARE-014-accounting-action-ledger-390-devtools-<build>-20260617.png` | page/data 是否有 records/events/ledger summary；Network 账本或 sessions 接口；Console/storage | 阻塞：缺 UI/UX 双主线 IA、前端入口与接口样本；不得只凭旧 `judge/table-mode` 页面存在写通过 |
| `PR-QA-DUAL-014-004` | 双主线同局共存 | 使用同一 session 同时产生或读取照片 moment 与账本事件 / 记录，再进入当前聚会页或记录页确认两类内容同屏或可切换 | `npm.cmd run wechat:auto -- relaunch --port 9420 --path '/pages/live-record/index?sessionId=<sessionId>' --wait 4000 --storage --data activeSegment,timelineNodes,records,events,sessionId,sessionName --output docs/runtime/pr-qa-dual-014-live-dual-content-<build>-20260617.png` | `PR-QA-DUAL-FLOW-SHARE-014-live-record-photo-accounting-combined-390-devtools-<build>-20260617.png` | timelineNodes 照片节点、records/events 账本节点、page/query、Console/Network/storage | 阻塞：当前 `live-record` query sessionId 未落 data，API refused 未修 |
| `PR-QA-DUAL-014-005` | 分享页合并展示 | 打开 `share-preview` 或 `share-poster` ready 入口，确认同一分享页同时显示照片墙/照片高光、账本高光、关键事件、聚会总结 | `npm.cmd run wechat:auto -- relaunch --port 9420 --path '/pages/share-preview/index?sessionId=<sessionId>&inviteCode=<inviteCode>' --wait 4000 --storage --data sessionId,inviteCode,sessionName,shareItems,posterImagePath,accountingHighlights,photoHighlights,eventHighlights,summary --output docs/runtime/pr-qa-dual-014-share-preview-combined-<build>-20260617.png`；`share-poster` 候选：`/pages/share-poster/index?taskId=<taskId>` | `PR-QA-DUAL-FLOW-SHARE-014-share-preview-photo-accounting-combined-390-devtools-<build>-20260617.png` | data 中照片/账本/事件/总结字段；Network share task / brief 响应；Console/storage；页面截图 | 阻塞：缺合并分享合同字段、UI/UX 视觉规格和前端实现；13.16.38 发现 share-preview 数据串旧样本 |
| `PR-QA-DUAL-014-006` | 分享截图保存合并内容 | 在分享页点击保存；检查 `posterImagePath` 或 ready PNG 原图，确认保存图同时包含照片和账本高光 | `npm.cmd run wechat:auto -- tap --port 9420 --path '/pages/share-preview/index?sessionId=<sessionId>&inviteCode=<inviteCode>' --selector .share-primary --wait 3500 --storage --data sessionId,inviteCode,sessionName,posterImagePath,accountingHighlights,photoHighlights --output docs/runtime/pr-qa-dual-014-share-save-combined-<build>-20260617.png` | 页面截图 `PR-QA-DUAL-FLOW-SHARE-014-share-save-combined-390-devtools-<build>-20260617.png`；PNG 原图 `PR-QA-DUAL-FLOW-SHARE-014-share-png-original-photo-accounting-<taskId>-<build>-20260617.png` | posterImagePath / imageUrl、保存结果、权限提示、Console/Network/storage；PNG 原图或 canvas 兜底说明 | 阻塞：缺合并保存图实现和 PNG 原图证据；真机相册权限仍不在预览框覆盖 |
| `PR-QA-DUAL-014-007` | UGC/隐私过滤与账本公开边界 | 分享页保存图不泄露私密照片、隐藏/待补图、未授权内容；账本高光不泄露不应公开的成员隐私 | `npm.cmd run wechat:auto -- relaunch --port 9420 --path '/pages/share-poster/index?taskId=<taskId>' --wait 4000 --storage --data shareTask,filteredNodeIds,visibleNodes,accountingHighlights,privacyNotes --output docs/runtime/pr-qa-dual-014-share-filter-<build>-20260617.png` | `PR-QA-DUAL-FLOW-SHARE-014-share-filter-private-accounting-390-devtools-<build>-20260617.png` | filteredNodeIds、visibleNodes、accountingHighlights、UGC 说明、Console/Network/storage | 阻塞：缺 UGC 014 口径、接口样本和前端可视化字段 |
| `PR-QA-DUAL-014-008` | 401/loading/API refused 回归 | 重跑首页登录、session-brief、share-preview/share-poster、live-record 期间 Console/Network 无 `ERR_CONNECTION_REFUSED`、无 `showLoading/hideLoading` 配对红错 | DevTools 调试器截图或自动化 console 摘要；API 只读命令：`Invoke-WebRequest <base>/config/home`、`/sessions/live`、`/user/auth/login` 相关请求摘要 | `PR-QA-DUAL-FLOW-SHARE-014-console-network-summary-<build>-20260617.png` | Console、Network、storage、API base、token 后 8 位 | 阻塞：13.16.38 已有红错，未修前所有 014 用例不得通过 |

##### 13.16.39.3 证据字段与记录模板

每个 `PR-QA-DUAL-FLOW-SHARE-014` 用例复测时，必须记录：

| 字段 | 要求 |
| --- | --- |
| 命令原文 | 完整 `npm.cmd run wechat:auto -- ...` 或 DevTools 人工路径；含 `--port`、`--path`、`--selector`、`--data`、`--storage`、`--output` |
| 截图/录屏路径 | `docs/runtime/pr-qa-dual-014-*.png/mp4`；若 `miniProgram.screenshot()` 仍超时，明确使用前台窗口截图；黑图不得作为通过证据 |
| summary.page | `path/query` 必须对应被测页面；query 不落 data 时按失败记录 |
| 关键 data | 拍照：`timelineNodes/imageUrl/nodeType/uploading/uploadError`；账本：`records/events/ledger/accountingHighlights`；分享：`photoHighlights/accountingHighlights/eventHighlights/summary/posterImagePath/shareTask/filteredNodeIds` |
| storage 摘要 | `runtime-api-base`、`social-current-profile-id`、token 后 8 位；不得记录完整 token |
| Console/Network | 无输出写 `console=[]`；如有 `ERR_CONNECTION_REFUSED`、401、loading 配对、canvas 保存报错，记录原文并保持待修 |
| 结论边界 | 只能写 `预览框阶段通过/退回/待修`；当前 API refused 和 014 实现缺证据未修前统一 `待修/阻塞/待复测` |

##### 13.16.39.4 当前阻塞项

| 阻塞项 | 缺少证据 | 下一步责任人 |
| --- | --- | --- |
| UI/UX 双主线规格未回包 | 缺双主线 IA、账本入口层级、分享页/保存图视觉规格、酷炫分享退回码 | UI/UX 负责人 `PR-UX-DUAL-FLOW-SHARE-014` |
| 前端 014 实现未回包 | 缺首页/记录页/当前聚会页的账本入口 selector；缺 share-preview/share-poster 合并展示字段；缺保存图合并渲染 | 前端负责人 `PR-FE-DUAL-FLOW-ACCOUNTING-014` |
| 合并分享合同未确认 | 缺照片节点 + 账本事件 + 关键事件 + 聚会总结的接口字段、share task / brief 输出样本、filteredNodeIds 规则 | 后端/API `PR-BE-DUAL-FLOW-SHARE-CONTRACT-014`、接口联调 `PR-INT-DUAL-FLOW-FIXTURE-014` |
| UGC/隐私边界未回包 | 缺私密照片、隐藏内容、未授权照片和账本成员隐私进入分享页/保存图的过滤口径 | UGC 风控 `PR-UGC-DUAL-FLOW-SHARE-014` |
| 当前调试器红错未修 | `GET /sessions/live`、`POST /user/auth/login` 均 `ERR_CONNECTION_REFUSED`；`session-brief` loading 配对错误 | 后端/API、接口联调、前端；测试待回包后重跑 |
| 截图工具链不稳定 | `miniProgram.screenshot()` 超时，`PrintWindow` 黑图；需确认后续统一截图方式 | 测试/PM 工具链；必要时继续使用前台窗口截图并标明方法 |

##### 13.16.39.5 当前结论

`PR-QA-DUAL-FLOW-SHARE-014` 已新增测试矩阵和证据命名。当前没有 UI/UX 视觉规格、前端实现、合并分享接口样本、UGC 过滤口径或可读截图证据，且 13.16.38 的 API refused / loading 红错未修复。因此测试侧当前只能回报：`双主线分享 P0 用例已建立 / 全部待实现回包与复测 / 不写预览框通过 / 不写正式真机发布通过`。

PM 下一步应等待：

- UI/UX 给双主线 IA 和分享页/保存图视觉规格。
- 前端给入口 selector、页面路径、data 字段和实现截图。
- 后端/API 与接口联调给合并分享 fixture、API base、脱敏 token、share task / brief 样本。
- UGC 给照片与账本共同分享的过滤和隐私边界。
- 测试收到以上回包并确认 API refused / loading 配对已修后，按 13.16.39.2 重跑矩阵。

#### 13.16.40 `PR-QA-SHARE-FLOW-PREVIEW-015` 酷炫分享流程 P0 预览框验收矩阵

记录时间：2026-06-17。PM 新派 `PR-QA-SHARE-FLOW-PREVIEW-015`：UI/UX 将通过 SKILL 生成酷炫分享流程页面，前端按设计包实现，测试需把分享流程作为 P0 预览框验收，不再只测普通分享按钮。本节只新增测试矩阵和取证规范，不改源码、PM 总台账、团队公告或他人计划。

当前前置结论：

- `docs/gameplay-moments-team-announcements.md` 已公告 015：分享流程页面是 P0，范围至少含分享入口、分享预览、保存截图/海报、保存成功/失败、分享回流查看。
- `docs/gameplay-moments-progress-tracker.md` 已派 UI/UX `PR-UX-SHARE-FLOW-SKILL-PAGES-015`、前端 `PR-FE-SHARE-FLOW-IMPLEMENT-015`、接口联调 `PR-INT-SHARE-FLOW-DATA-015`、测试 `PR-QA-SHARE-FLOW-PREVIEW-015`、UGC `PR-UGC-SHARE-FLOW-GATE-015`。
- 015 必须承接 014 的双主线要求：分享预览和保存图要展示照片 + 酒局账本高光，不能只测旧的普通分享按钮。
- 当前仍缺 UI/UX SKILL 设计包、前端实现、接口样本、UGC 门禁证据；13.16.38 的 `ERR_CONNECTION_REFUSED` 和 `showLoading/hideLoading` 红错未关闭前，不得写预览框通过。

##### 13.16.40.1 P0 验收范围

| 范围 | 必须验证 | 失败判定 | 责任对象 |
| --- | --- | --- | --- |
| 分享入口 | 首页、记录页、相册/历史、brief 或当前聚会页中至少一处核心分享入口可见、可点击、有明确反馈 | 入口不可见、入口藏太深、点击无反馈或只 toast，判 P0 | UI/UX、前端 |
| 分享预览 | 页面不是空壳，必须展示照片高光 + 酒局账本高光 / 欠酒已喝 / 关键事件 / 聚会总结 | 只展示空态、旧海报壳、只有照片或只有账本，判 P0 | UI/UX、前端、后端/API、接口联调 |
| 保存截图/海报 | 保存页或海报页可生成可读图，375/390/414 不卡边、不裁字、不遮挡二维码/房间码/主按钮 | `posterImagePath` 空、生成失败无提示、视觉溢出、二维码/按钮被遮挡，判 P0 | UI/UX、前端、接口联调 |
| 保存成功 | 预览框阶段至少能得到成功态或临时图路径；真机阶段再覆盖系统相册权限 | 点击保存无状态、成功态不可见、无路径/无图片证据，判 P0/P1 | 前端、测试 |
| 保存失败/重试 | failed/expired/权限拒绝/生成失败均有中文提示和重试入口 | 失败静默、英文错误裸露、无重试或重试无反馈，判 P0/P1 | 前端、后端/API、接口联调 |
| 分享回流查看 | 分享出去后的查看页可打开；局内/局外/未登录权限范围符合 UGC 要求 | 局外看到不该看的私密照片或账本隐私；应公开内容看不到且无说明，判 P0 | UGC、前端、后端/API |
| Console/Network/storage | 无阻塞红错、无 API refused、无重复 401、无 loading 配对警告；token 只记后 8 位 | 存在阻塞红错或缺摘要，相关项不得关闭 | 测试、前端、后端/API、接口联调 |

##### 13.16.40.2 预览框执行矩阵

| 用例编号 | 覆盖项 | 预览框操作 | 命令模板 | 截图/录屏命名 | 必收摘要 | 当前状态 |
| --- | --- | --- | --- | --- | --- | --- |
| `PR-QA-SHARE-015-001` | 分享入口可见并可点击 | 打开首页、记录页、相册/历史或 brief，根据前端回包 selector 点击分享入口 | `npm.cmd run wechat:auto -- relaunch --port 9420 --path '<entryPath>' --wait 3000 --storage --data shareEntryVisible,shareEntryText,sessionId,briefId,taskId --output docs/runtime/pr-qa-share-015-entry-<page>-<build>-20260617.png`；点击：`npm.cmd run wechat:auto -- tap --port 9420 --path '<entryPath>' --selector '<share-entry-selector>' --wait 3000 --storage --data shareEntryVisible,shareTask,posterState,previewState --output docs/runtime/pr-qa-share-015-entry-tap-<page>-<build>-20260617.png` | `PR-QA-SHARE-FLOW-PREVIEW-015-entry-visible-<page>-390-devtools-<build>-20260617.png`；`...-entry-tap-<page>-390-devtools-<build>-20260617.png` | summary.page、入口 data、selector、storage token 后 8 位、Console/Network | 阻塞：缺 UI/UX 设计包、前端 selector 和实现截图 |
| `PR-QA-SHARE-015-002` | 分享预览展示照片 + 酒局账本高光 | 打开分享预览页，检查照片墙/高光图、账本高光、欠酒/已喝、关键事件、聚会总结同时存在 | `npm.cmd run wechat:auto -- relaunch --port 9420 --path '/pages/share-preview/index?sessionId=<sessionId>&inviteCode=<inviteCode>' --wait 5000 --storage --data sessionId,inviteCode,sessionName,photoHighlights,accountingHighlights,eventHighlights,ledgerSummary,summary,previewState --output docs/runtime/pr-qa-share-015-preview-combined-<build>-20260617.png` | `PR-QA-SHARE-FLOW-PREVIEW-015-preview-photo-ledger-combined-390-devtools-<build>-20260617.png` | photoHighlights、accountingHighlights、eventHighlights、ledgerSummary、summary、Console/Network/storage | 阻塞：缺接口联调 015 联合样本；旧 data 字段不足不能写通过 |
| `PR-QA-SHARE-015-003` | 保存截图/海报页可生成且视觉不溢出 | 打开 `share-poster` 或保存海报页，等待生成完成，检查布局、二维码/房间码、主按钮安全区 | `npm.cmd run wechat:auto -- relaunch --port 9420 --path '/pages/share-poster/index?taskId=<taskId>' --wait 6000 --storage --data shareTask,posterImagePath,imageUrl,posterState,layoutWarnings,photoHighlights,accountingHighlights --output docs/runtime/pr-qa-share-015-poster-generated-<build>-20260617.png` | `PR-QA-SHARE-FLOW-PREVIEW-015-poster-generated-no-overflow-390-devtools-<build>-20260617.png`；最终补 375/414：`...-375-...`、`...-414-...` | posterImagePath/imageUrl、layoutWarnings、可读截图、Console/Network/storage | 阻塞：缺 UI/UX 视觉规格和前端海报实现；截图工具链需确认 |
| `PR-QA-SHARE-015-004` | 保存成功态 | 点击保存按钮，确认出现成功态、临时路径或可继续转发反馈 | `npm.cmd run wechat:auto -- tap --port 9420 --path '/pages/share-poster/index?taskId=<taskId>' --selector '<save-selector>' --wait 4000 --storage --data saveState,posterImagePath,imageUrl,toastText,errorText --output docs/runtime/pr-qa-share-015-save-success-<build>-20260617.png` | `PR-QA-SHARE-FLOW-PREVIEW-015-save-success-390-devtools-<build>-20260617.png` | saveState、posterImagePath/imageUrl、toastText、Console/Network/storage | 阻塞：缺保存 selector 和成功态实现；系统相册权限后续真机覆盖 |
| `PR-QA-SHARE-015-005` | 保存失败 / 重试状态 | 使用 failed/expired/权限拒绝或接口失败样本打开海报页，点击保存或重试，确认失败提示和重试反馈 | `npm.cmd run wechat:auto -- tap --port 9420 --path '/pages/share-poster/index?taskId=<failedOrExpiredTaskId>' --selector '<retry-selector>' --wait 4000 --storage --data saveState,shareTask,errorText,retryCount,toastText --output docs/runtime/pr-qa-share-015-save-failed-retry-<build>-20260617.png` | `PR-QA-SHARE-FLOW-PREVIEW-015-save-failed-retry-390-devtools-<build>-20260617.png` | errorText、retryCount、shareTask.status、Console/Network/storage | 阻塞：缺 failed/expired 015 样本和前端失败/重试状态实现 |
| `PR-QA-SHARE-015-006` | 分享回流查看页 | 打开分享回流页或外部分享链接落地页，覆盖局内、局外、未登录视角 | `npm.cmd run wechat:auto -- relaunch --port 9420 --path '<shared-view-path>?shareId=<shareId>&sessionId=<sessionId>' --wait 5000 --storage --data viewerRole,sessionId,visibleNodes,accountingHighlights,permissionState,joinStatus,reportEntryVisible --output docs/runtime/pr-qa-share-015-shared-view-<role>-<build>-20260617.png` | `PR-QA-SHARE-FLOW-PREVIEW-015-shared-view-<role>-390-devtools-<build>-20260617.png` | viewerRole、visibleNodes、permissionState、joinStatus、reportEntryVisible、Console/Network/storage | 阻塞：缺回流页路径、shareId 样本和 UGC 可见范围要求 |
| `PR-QA-SHARE-015-007` | UGC 权限 / 局外范围 | 对比 host/member/outsider/未登录进入分享回流页和海报预览，确认私密照片、隐藏内容、未授权照片和敏感账本信息不泄露 | 同 `PR-QA-SHARE-015-006`，按角色分别注入 storage 或清 storage 后重跑；必要时补 API 摘要 | `PR-QA-SHARE-FLOW-PREVIEW-015-ugc-scope-<role>-390-devtools-<build>-20260617.png` | token 后 8 位、viewerRole、filteredNodeIds、visibleNodes、permissionState、Console/Network/storage | 阻塞：缺 UGC `PR-UGC-SHARE-FLOW-GATE-015` 门禁口径和角色样本 |
| `PR-QA-SHARE-015-008` | Console/Network/storage 总回归 | 汇总分享入口、预览、海报、保存、失败重试、回流查看全链路 Console/Network/storage | `npm.cmd run wechat:auto -- status --port 9420 --storage --data saveState,posterState,shareTask,permissionState --output docs/runtime/pr-qa-share-015-status-summary-<build>-20260617.png`；Network 由 DevTools 调试器或接口联调摘要补充 | `PR-QA-SHARE-FLOW-PREVIEW-015-console-network-storage-summary-<build>-20260617.png` | 无 `ERR_CONNECTION_REFUSED`、无重复 401、无 loading 配对、无保存红错；API base 和 token 后 8 位 | 阻塞：13.16.38 红错未关闭，当前不得写通过 |

##### 13.16.40.3 证据接收字段

| 字段 | 要求 |
| --- | --- |
| UI/UX 设计包 | 记录 `PR-UX-SHARE-FLOW-SKILL-PAGES-015` 设计资产路径、页面范围、使用 SKILL、前端实现规格；缺设计包时只写待复测 |
| 前端实现包 | 记录页面路径、selector、data 字段、接入资产、验证命令、构建号；缺实现时不得执行通过判定 |
| 接口样本 | 记录 sessionId、briefId、taskId、shareId、failed/expired task、照片节点、账本事件、关键事件、脱敏 token 后 8 位；缺样本时只能测空态/阻塞 |
| 截图/录屏 | 优先 `npm.cmd run wechat:auto -- ... --output`；如脚本截图失败，使用前台窗口截图并注明方法；黑图、过小图、不可读图不得通过 |
| page/data | 必须包含 `summary.page.path/query` 和分享流程关键 data；query 不落 data 按失败 |
| Console/Network/storage | Console 无输出写 `console=[]`；Network 需记录 URL、状态码、响应摘要；storage 只写 token 后 8 位 |
| 结论 | 只能写 `预览框阶段通过/退回/待修`；当前缺设计包/实现/样本或红错未修时统一 `阻塞/待复测` |

##### 13.16.40.4 当前阻塞项与下一步责任

| 阻塞项 | 缺口 | 下一步责任人 |
| --- | --- | --- |
| UI/UX 015 设计包未回收 | 缺 SKILL 生成的分享入口、预览、保存海报、成功/失败、回流查看页面设计或资产 | UI/UX `PR-UX-SHARE-FLOW-SKILL-PAGES-015` |
| 前端 015 实现未回收 | 缺页面路径、selector、data 字段、保存成功/失败/重试状态、回流查看页实现 | 前端 `PR-FE-SHARE-FLOW-IMPLEMENT-015` |
| 接口样本未回收 | 缺照片 + 酒局账本联合样本、share task 四态、shareId/回流路径、脱敏 token、warnings/skipped | 接口联调 `PR-INT-SHARE-FLOW-DATA-015`、后端/API 配合 |
| UGC 门禁未回收 | 缺局内/局外/未登录可见范围、隐私字段、举报入口、保存图传播风险要求 | UGC `PR-UGC-SHARE-FLOW-GATE-015` |
| 既有红错未关闭 | `127.0.0.1:3221` API refused、`session-brief` loading 配对错误仍是 P0 阻塞 | 后端/API、接口联调、前端 |
| 截图链路需确认 | `miniProgram.screenshot()` 曾超时，`PrintWindow` 曾黑图 | 测试/PM；复测时优先验证截图方法 |

##### 13.16.40.5 当前结论

`PR-QA-SHARE-FLOW-PREVIEW-015` 已建立 P0 预览框验收矩阵。当前缺 UI/UX SKILL 设计包、前端实现、接口样本、UGC 门禁和可读截图证据，且 13.16.38 的 Console/API 红错未关闭。测试侧当前只能回报：`分享流程 P0 矩阵已建立 / 待设计包、实现包、接口样本和 UGC 口径回包 / 待红错修复后复测 / 不写预览框通过`。

#### 13.16.41 `PR-QA-SHARE-FLOW-PREVIEW-015` 2026-06-17 状态更新与待前端回包复测

记录时间：2026-06-17。PM 同步：UI/UX 设计包与接口联调样本已回收，前端 `PR-FE-SHARE-FLOW-IMPLEMENT-015` 已二次激活实现。测试侧本节只更新复测条件、命令命名和阻塞登记；前端未交付页面路径、selector、data 字段和实现截图前，不写预览框通过。

##### 13.16.41.1 已回收输入

| 类型 | 已回收内容 | QA 使用方式 | 当前结论 |
| --- | --- | --- | --- |
| UI/UX 设计包 | `docs/design-assets/party-recorder/share-flow-015/README.md` | 作为 13.16.40 视觉和状态验收参考；覆盖分享入口、分享预览、保存海报、成功/失败/重试、分享回流查看 5 张目标图 | 已回收，但 README 明确目标图不是源码实现截图，不能作为通过证据 |
| 设计资产清单 | `pr-ux-share-flow-015-01-share-entry-panel.png`、`02-share-preview-fusion.png`、`03-save-poster-vertical.png`、`04-save-state-retry.png`、`05-share-return-view.png` | 复测时逐项比对照片墙、聚会账本高光、关键事件、总结、二维码/房间码安全区和隐私提示 | 待前端复刻后截图比对 |
| 接口样本 | API base `https://api.pomer.cn/api/v1`；session `session-1781584503517-c033e9`；invite `W58G7T`；brief `brief-1781584503870-25d5edac`；ready task `share-task-1781685446105-ae6b6317`；failed task `share-task-1781584504132-3251bd01` | 作为 13.16.40 矩阵的固定复测样本；只记录 Network 响应摘要和 storage token 后 8 位 | 已回收样本 ID，待前端接入字段与 DevTools 预览证据 |
| 仍缺前端回包 | 页面路径、分享入口 selector、保存按钮 selector、重试 selector、回流查看路径、关键 data 字段名、实现截图 | 收到后立即按 13.16.41.2 运行右侧预览框矩阵 | 阻塞 / 待复测 |

##### 13.16.41.2 前端交付后的预览框复测命令模板

以下命令只作为待执行模板，必须在前端 `PR-FE-SHARE-FLOW-IMPLEMENT-015` 回包 selector、页面路径和 data 字段后运行；当前未执行，不得写通过。

| 用例 | 预期路径 / 样本 | 待执行命令原文模板 | 截图命名 | 证据摘要要求 | 当前状态 |
| --- | --- | --- | --- | --- | --- |
| `PR-QA-SHARE-015-001-R1` 分享入口可见并可点击 | 候选入口：`/pages/session-brief/index?briefId=brief-1781584503870-25d5edac&sessionId=session-1781584503517-c033e9`、`/pages/live-record/index?sessionId=session-1781584503517-c033e9` | `npm.cmd run wechat:auto -- relaunch --port 9420 --path '<frontend-entry-path>' --wait 3000 --storage --data shareEntryVisible,shareEntryText,sessionId,briefId,taskId --output docs/runtime/pr-qa-share-015-r1-entry-visible-<page>-<build>-20260617.png`；点击：`npm.cmd run wechat:auto -- tap --port 9420 --path '<frontend-entry-path>' --selector '<share-entry-selector>' --wait 3000 --storage --data shareEntryVisible,shareTask,posterState,previewState --output docs/runtime/pr-qa-share-015-r1-entry-tap-<page>-<build>-20260617.png` | `PR-QA-SHARE-FLOW-PREVIEW-015-r1-entry-visible-<page>-390-devtools-<build>-20260617.png`；`...-entry-tap-...png` | summary.page、入口 data、selector、storage token 后 8 位、Console/Network | 待前端 selector |
| `PR-QA-SHARE-015-002-R1` 分享预览展示照片 + 聚会账本高光 | `/pages/share-preview/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T` 或前端回包等效路径 | `npm.cmd run wechat:auto -- relaunch --port 9420 --path '/pages/share-preview/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T' --wait 5000 --storage --data sessionId,inviteCode,sessionName,photoHighlights,accountingHighlights,keyEvents,eventHighlights,ledgerSummary,shareSummary,summary,previewState --output docs/runtime/pr-qa-share-015-r1-preview-combined-<build>-20260617.png` | `PR-QA-SHARE-FLOW-PREVIEW-015-r1-preview-photo-ledger-combined-390-devtools-<build>-20260617.png` | 照片墙/照片高光、账本高光、关键事件、总结字段；Network share/brief 响应；Console/storage | 待前端实现 |
| `PR-QA-SHARE-015-003-R1` 保存海报生成且不溢出 | `/pages/share-poster/index?taskId=share-task-1781685446105-ae6b6317` 或前端回包等效路径 | `npm.cmd run wechat:auto -- relaunch --port 9420 --path '/pages/share-poster/index?taskId=share-task-1781685446105-ae6b6317' --wait 6000 --storage --data shareTask,posterImagePath,imageUrl,posterState,layoutWarnings,photoHighlights,accountingHighlights,keyEvents,shareSummary --output docs/runtime/pr-qa-share-015-r1-poster-ready-<build>-20260617.png` | `PR-QA-SHARE-FLOW-PREVIEW-015-r1-poster-generated-no-overflow-390-devtools-<build>-20260617.png` | posterImagePath/imageUrl、layoutWarnings、二维码/房间码安全区、按钮无遮挡、Console/Network/storage | 待前端实现 |
| `PR-QA-SHARE-015-004-R1` 保存成功态 | ready task 页面 + `<save-selector>` | `npm.cmd run wechat:auto -- tap --port 9420 --path '/pages/share-poster/index?taskId=share-task-1781685446105-ae6b6317' --selector '<save-selector>' --wait 4000 --storage --data saveState,posterImagePath,imageUrl,toastText,errorText --output docs/runtime/pr-qa-share-015-r1-save-success-<build>-20260617.png` | `PR-QA-SHARE-FLOW-PREVIEW-015-r1-save-success-390-devtools-<build>-20260617.png` | saveState、toastText、临时图路径、Console/Network/storage；系统相册权限留到发布前真机 | 待前端 selector |
| `PR-QA-SHARE-015-005-R1` 保存失败 / 重试状态 | `/pages/share-poster/index?taskId=share-task-1781584504132-3251bd01` 或前端回包等效失败路径 | `npm.cmd run wechat:auto -- tap --port 9420 --path '/pages/share-poster/index?taskId=share-task-1781584504132-3251bd01' --selector '<retry-selector>' --wait 4000 --storage --data saveState,shareTask,errorText,retryCount,toastText --output docs/runtime/pr-qa-share-015-r1-save-failed-retry-<build>-20260617.png` | `PR-QA-SHARE-FLOW-PREVIEW-015-r1-save-failed-retry-390-devtools-<build>-20260617.png` | errorText、retryCount、shareTask.status、重试反馈、Console/Network/storage | 待前端 selector |
| `PR-QA-SHARE-015-006-R1` 分享回流查看页 | 待前端提供 `<shared-view-path>`、`shareId` 或 invite 回流规则 | `npm.cmd run wechat:auto -- relaunch --port 9420 --path '<shared-view-path>?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T' --wait 5000 --storage --data viewerRole,sessionId,visibleNodes,photoHighlights,accountingHighlights,permissionState,joinStatus,reportEntryVisible --output docs/runtime/pr-qa-share-015-r1-shared-view-<role>-<build>-20260617.png` | `PR-QA-SHARE-FLOW-PREVIEW-015-r1-shared-view-<role>-390-devtools-<build>-20260617.png` | viewerRole、visibleNodes、permissionState、joinStatus、局外可见范围、Console/Network/storage | 待前端路径 / UGC 口径 |
| `PR-QA-SHARE-015-007-R1` Console/Network/storage 总回归 | 覆盖入口、预览、海报、保存成功、失败重试、回流查看 | `npm.cmd run wechat:auto -- status --port 9420 --storage --data saveState,posterState,shareTask,permissionState,photoHighlights,accountingHighlights --output docs/runtime/pr-qa-share-015-r1-status-summary-<build>-20260617.png` | `PR-QA-SHARE-FLOW-PREVIEW-015-r1-console-network-storage-summary-<build>-20260617.png` | 无 `ERR_CONNECTION_REFUSED`、无 loading 配对红错、无字段缺失阻塞、无 401 循环；storage token 只写后 8 位 | 待全链路复测 |

##### 13.16.41.3 失败退回判据

复测出现以下任一情况，测试侧登记 `退回 / 待修`，不得写预览框阶段通过：

- Console 或 Network 仍出现 `ERR_CONNECTION_REFUSED`、重复 401、保存/海报生成红错，或 `showLoading` 与 `hideLoading` 配对错误。
- 分享预览或保存图只展示空壳，未同时呈现照片内容和聚会账本 / 酒桌记账高光。
- data 或接口响应缺 `photoHighlights`、`accountingHighlights`、`keyEvents`、`shareSummary` 或前端约定的等效字段，且没有明确空态和 warnings/skipped。
- 保存成功、保存失败、重试状态不可见，或失败样本 `share-task-1781584504132-3251bd01` 无法触发错误态。
- 分享回流查看页缺页面路径、角色视角或 UGC 可见范围证据，或局外可见内容超出 UGC 要求。
- 390 / 375 / 414 预览宽度出现文字、二维码、房间码、保存按钮、隐私提示溢出或遮挡。

##### 13.16.41.4 当前回报给 PM

`PR-QA-SHARE-FLOW-PREVIEW-015` 当前状态：`设计包已回收 / 接口样本已回收 / 前端实现待回包 / UGC 与字段证据待复测 / 不写通过`。测试侧下一步是在前端提供 selector、页面路径和 data 字段后，按 13.16.41.2 立即重跑微信开发者工具右侧预览框矩阵，并补齐命令原文、截图路径、summary.page、关键 data、storage token 后 8 位、Console/Network 摘要。

#### 13.16.42 `PR-QA-SHARE-FLOW-PREVIEW-015-RETEST` 2026-06-17 前端回包后预览框复测

记录时间：2026-06-17。PM 同步前端 `PR-FE-SHARE-FLOW-IMPLEMENT-015` 已回包并通过前端自检；测试侧按微信开发者工具右侧预览框执行 13.16.40 / 13.16.41 矩阵。结论只覆盖开发者工具预览框阶段，不代表上线发布准出。

##### 13.16.42.1 工具链状态

| 项 | 证据 |
| --- | --- |
| PowerShell | `$PSVersionTable.PSVersion.ToString()` -> `7.6.2` |
| 自动化端口恢复 | `pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420 -QuitExisting` -> `{"ok":true,"action":"started","port":9420,...}` |
| 命令转义注意 | 直接用 `npm.cmd run wechat:auto -- ... --path '/pages/...&briefId=...'` 会被 `npm.cmd` / `cmd` 拆成两段，失败原文：`'briefId' is not recognized as an internal or external command`；本轮有效命令统一使用 `npm.cmd --% run wechat:auto -- ... --path "/pages/...&..."` |
| 自动化截图 | `miniProgram.screenshot()` 未使用；`scripts\capture-wechat-devtools-preview.ps1` 的 `PrintWindow` 右侧截图仍为黑图，黑图文件 `docs/runtime/pr-qa-share-015-retest-brief-entry-20260617.png` 不作为通过证据 |
| 可读截图方法 | 使用前台窗口 `SetForegroundWindow + CopyFromScreen` 截取右侧预览框；该方法产出的截图见 13.16.42.2 |
| Console | 本轮 `wechat:auto` 输出均为 `console=[]`，未捕获红色 Console；Network 面板未由脚本直接导出 |
| 本地 API refused 复核 | `Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:3221/api/v1/sessions/live' -TimeoutSec 5` -> `200 {"code":0,"message":"ok",...}`；本轮未复现 13.16.38 的本地 API refused |

##### 13.16.42.2 用例执行记录

| 用例 | 命令原文 | 截图 / 摘要 | page / data / storage / console | 结论 |
| --- | --- | --- | --- | --- |
| `PR-QA-SHARE-015-001-R1` 简报入口打开 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/session-brief/index?sessionId=session-1781584503517-c033e9&briefId=brief-1781584503870-25d5edac" --wait 5000 --storage --data photoHighlights,accountingHighlights,keyEvents,shareSummary,saveState,errorText,ledgerContractNotice,readyShareImageUrl,shareTask` | 可读截图：`docs/runtime/pr-qa-share-015-retest-brief-entry-foreground-20260617.png` | page `pages/session-brief/index`，query 含 `sessionId`、`briefId`；dataKeys 仅有 brief 基础字段，`shareTask=null`；storage token 空；`console=[]`；截图显示页面停留 `加载中...` | 退回：入口页未加载分享 flow 数据 |
| `PR-QA-SHARE-015-001-R1` 分享入口 selector 点击 | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/session-brief/index?sessionId=session-1781584503517-c033e9&briefId=brief-1781584503870-25d5edac" --selector .brief-share-flow-entry --wait 3000 --storage --data photoHighlights,accountingHighlights,keyEvents,shareSummary,saveState,errorText,ledgerContractNotice,readyShareImageUrl,shareTask` | 无截图；命令返回错误 | 失败原文：`Error: Selector not found: .brief-share-flow-entry` | 退回前端：入口 selector 不存在或入口未渲染 |
| `PR-QA-SHARE-015-003-R1` ready 海报打开 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781685446105-ae6b6317" --wait 6000 --storage --data photoHighlights,accountingHighlights,keyEvents,shareSummary,saveState,errorText,ledgerContractNotice,readyShareImageUrl,shareTask` | 后续截图：`docs/runtime/pr-qa-share-015-retest-poster-ready-failed-member-foreground-20260617.png` | page `pages/share-poster/index`，query ready task 正确；data `photoHighlights=[]`、`accountingHighlights=[]`、`keyEvents=[]`、`shareSummary=这场聚会的照片、账本和朋友回忆都会在这里汇总。`、`saveState=idle`、`errorText=""`、`readyShareImageUrl=""`、`shareTask=null`；storage token 后 8 位为空；`console=[]` | 退回前端/接口：ready task 未落 `shareTask`，照片/账本/关键事件为空，保存图不是 P0 可验收内容 |
| `PR-QA-SHARE-015-004-R1` 保存主按钮 | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781685446105-ae6b6317" --selector .poster-primary-action --wait 4000 --storage --data photoHighlights,accountingHighlights,keyEvents,shareSummary,saveState,errorText,ledgerContractNotice,readyShareImageUrl,shareTask` | 超时后截图：`docs/runtime/pr-qa-share-015-retest-poster-ready-after-save-timeout-foreground-20260617.png` | 命令 64 秒超时；停止残留后截图显示已跳到 `创建聚会` 页面，不是保存成功或失败/重试状态 | 退回前端：保存动作不可稳定返回，且未展示保存成功/失败/重试状态 |
| `PR-QA-SHARE-015-003-R1` ready 主视觉 selector | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781685446105-ae6b6317" --selector .poster-stage-primary --wait 3000 --storage --data photoHighlights,accountingHighlights,keyEvents,shareSummary,saveState,errorText,ledgerContractNotice,readyShareImageUrl,shareTask` | 截图：`docs/runtime/pr-qa-share-015-retest-poster-ready-failed-member-foreground-20260617.png` | selector 存在；page ready task 正确；data `saveState=failed`、`errorText=not session member`、`photoHighlights=[]`、`accountingHighlights=[]`、`keyEvents=[]`、`readyShareImageUrl=""`、`shareTask=null`；storage `jzp-user-token` 后 8 位 `c418e86ad`；`console=[]` | 退回权限/接口/前端：ready 样本在当前身份下变成 `not session member`，未形成可保存海报 |
| `PR-QA-SHARE-015-005-R1` failed task 打开 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781584504132-3251bd01" --wait 6000 --storage --data photoHighlights,accountingHighlights,keyEvents,shareSummary,saveState,errorText,ledgerContractNotice,readyShareImageUrl,shareTask` | 截图：`docs/runtime/pr-qa-share-015-retest-poster-failed-foreground-20260617.png` | page failed task 正确；data `photoHighlights=[]`、`accountingHighlights=[]`、`keyEvents=[]`、`saveState=idle`、`errorText=""`、`readyShareImageUrl=""`、`shareTask=null`；storage token 后 8 位 `c418e86ad`；`console=[]`；截图显示“生成分享图”，不是失败/重试态 | 退回接口/前端：failed task 未映射到失败/重试 data 与 UI |
| `PR-QA-SHARE-015-005-R1` failed 警告卡 selector | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781584504132-3251bd01" --selector .poster-state-card-warn --wait 3000 --storage --data photoHighlights,accountingHighlights,keyEvents,shareSummary,saveState,errorText,ledgerContractNotice,readyShareImageUrl,shareTask` | 使用 failed 截图同上 | selector 存在；data 仍为 `saveState=idle`、`errorText=""`、`shareTask=null`，未体现 failed task 状态 | 退回前端：警告卡不是失败/重试状态证据 |
| `PR-QA-SHARE-015-002-R1` 邀请预览打开 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-preview/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T" --wait 5000 --storage --data photoHighlights,accountingHighlights,keyEvents,shareSummary,saveState,errorText,ledgerContractNotice,readyShareImageUrl,shareTask` | 截图：`docs/runtime/pr-qa-share-015-retest-invite-preview-foreground-20260617.png` | page `pages/share-preview/index`，query `sessionId` + `inviteCode` 正确；dataKeys 含 `accountingHighlights`、`shareSummary`，但不含 `photoHighlights`、`keyEvents`；data `accountingHighlights=[欠酒3杯, 已喝4杯, 已清1杯, 账本2人有记录]`、`shareSummary=...照片和账本会合并到酷炫分享页。`；storage token 后 8 位 `c418e86ad`；`console=[]` | 部分通过但不准出：账本高光可见，照片高光 / keyEvents data 缺失；不能写 P0 通过 |
| `PR-QA-SHARE-015-002-R1` 邀请预览 summary selector | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/share-preview/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T" --selector .share-fusion-summary --wait 2000 --storage --data photoHighlights,accountingHighlights,keyEvents,shareSummary,saveState,errorText,ledgerContractNotice,readyShareImageUrl,shareTask` | 使用邀请预览截图同上 | selector 存在；data 同上，仅 `accountingHighlights/shareSummary` 有效 | 待修：页面结构存在，但双主线字段未齐 |
| `PR-QA-SHARE-015-006-R1` 海报回流卡 selector | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781685446105-ae6b6317" --selector .poster-return-card --wait 3000 --storage --data photoHighlights,accountingHighlights,keyEvents,shareSummary,saveState,errorText,ledgerContractNotice,readyShareImageUrl,shareTask` | 使用 ready 海报截图同上 | selector 存在；data 仍 `shareTask=null`、照片/账本/关键事件为空、`readyShareImageUrl=""` | 待修：结构存在，但回流/分享 task 数据未落地 |

##### 13.16.42.3 本轮退回项

| 退回项 | 失败原文 / 证据 | 责任人 |
| --- | --- | --- |
| 简报分享入口不可点击 | `.brief-share-flow-entry` -> `Error: Selector not found: .brief-share-flow-entry`；页面截图仍为 `加载中...` | 前端 `PR-FE-SHARE-FLOW-IMPLEMENT-015`，接口联调配合确认 brief 数据 |
| ready task 数据未落地 | ready 页面 `shareTask=null`、`readyShareImageUrl=""`、`photoHighlights=[]`、`accountingHighlights=[]`、`keyEvents=[]` | 前端 + 接口联调 / 后端；需确认 `share-task-1781685446105-ae6b6317` 查询合同与当前 storage 身份 |
| 保存动作不可用 | `.poster-primary-action` 命令超时；超时后右侧预览框跳到 `创建聚会`，未出现保存成功或失败/重试状态 | 前端；必要时后端确认保存图接口权限 |
| ready 样本权限错误 | 最终状态 `saveState=failed`、`errorText=not session member` | 接口联调 / 后端 / 前端权限处理 |
| failed task 未触发失败态 | failed task `saveState=idle`、`errorText=""`、`shareTask=null`；`.poster-state-card-warn` 只是可定位，不是失败/重试证据 | 前端 + 接口联调 |
| 分享预览字段不完整 | 邀请预览仅有 `accountingHighlights/shareSummary`；缺 `photoHighlights` 和 `keyEvents` data，不能证明照片 + 账本 + 关键事件融合 | 前端 + 接口联调 / UGC |
| 截图工具链仍需保守记录 | `PrintWindow` 截图黑图，最终采用前台 `CopyFromScreen`；黑图不得作为通过证据 | 测试记录，后续仍优先保留可读前台图 |

##### 13.16.42.4 当前结论

`PR-QA-SHARE-FLOW-PREVIEW-015-RETEST` 本轮结论：`预览框阶段退回 / 待修 / 待复测`。邀请预览页账本高光和 summary selector 已可见，但 P0 要求的分享入口、照片 + 账本 + 关键事件融合、ready 保存海报、保存成功、保存失败 / 重试、回流 task 数据均未闭环。不得写“预览框阶段通过”，更不得写“上线发布通过”。

#### 13.16.43 `PR-QA-SHARE-FLOW-P0-018-PARTIAL-VERIFY` 2026-06-17 局部复核

记录时间：2026-06-17。测试侧按 PM 要求复核前端 `PR-FE-SHARE-FLOW-P0-RETEST-FIX-018` 最终回包和接口联调 `PR-INT-SHARE-FLOW-BE016-VERIFY-017-RUN` 口径。本节只记录微信开发者工具右侧预览框局部证据，不修改源码、PM 总台账、团队公告或派发队列；不得写预览框阶段通过、真机通过或上线通过。

##### 13.16.43.1 前置与工具

| 项 | 证据 |
| --- | --- |
| 已读前置 | `AGENTS.md`、本测试计划 13.16.42、前端计划 14.31、接口联调计划 3.27 |
| API base | `node -e "...setStorageSync('runtime-api-base','https://api.pomer.cn/api/v1')..."` -> `{"ok":true,"runtime-api-base":"https://api.pomer.cn/api/v1"}` |
| 当前 storage 身份 | `jzp-user-token` 后 8 位 `c418e86ad`；接口联调 3.27 已确认该身份不是 015 host/member，`not session member` 只能按权限反例记录 |
| 截图方式 | `wechat:auto` 本轮未用 `--output`，截图使用前台右侧预览框 `CopyFromScreen`；截图均在 `docs/runtime/` |

##### 13.16.43.2 用例执行记录

| 用例 | 命令原文 | 截图 | page / data / storage / console 摘要 | 结论 |
| --- | --- | --- | --- | --- |
| brief 入口不再 loading | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/session-brief/index?sessionId=session-1781584503517-c033e9&briefId=brief-1781584503870-25d5edac" --wait 5000 --storage --data briefId,sessionId,loading,errorText,shareTask` | 入口点击后截图见下一行 | page `pages/session-brief/index`，query 完整；data `briefId=brief-1781584503870-25d5edac`、`sessionId=session-1781584503517-c033e9`、`loading=false`、`errorText=not session member`、`shareTask=null`；storage base 为线上，token 后 8 位 `c418e86ad`；`console=[]` | 局部修复确认：不再 loading；仍阻塞：非成员权限导致 brief/task 不完整 |
| brief 分享入口可点击 | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/session-brief/index?sessionId=session-1781584503517-c033e9&briefId=brief-1781584503870-25d5edac" --selector .brief-share-flow-entry --wait 3000 --storage --data briefId,sessionId,loading,errorText,shareTask,saveState` | `docs/runtime/pr-qa-share-flow-p0-018-brief-entry-tap-foreground-20260617.png` | selector `.brief-share-flow-entry` 可点击，进入 `pages/share-poster/index`；query `briefId` + `sessionId`；data `errorText=not session member`、`shareTask=null`、`saveState=idle`；Console warn：`[share-poster] brief unavailable` | 局部修复确认：入口可点击；仍阻塞：当前身份不能加载 brief/task |
| ready poster 账本/关键事件 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781685446105-ae6b6317" --wait 6000 --storage --data briefId,sessionId,photoHighlights,accountingHighlights,keyEvents,shareSummary,saveState,errorText,ledgerContractNotice,readyShareImageUrl,shareTask` | `docs/runtime/pr-qa-share-flow-p0-018-poster-ready-foreground-20260617.png` | page `pages/share-poster/index`；data `accountingHighlights=[欠酒3杯, 已喝4杯, 已清1杯, 账本2条]`、`keyEvents=2`、`shareSummary=这场聚会留下 0 张公开照片、2 条账本高光和 2 个关键时刻。`、`photoHighlights=[]`、`saveState=failed`、`errorText=not session member`、`readyShareImageUrl=""`、`shareTask.status=failed`、`shareTask.failedReason=not session member`；Console warn：`[share-poster] share task unavailable`、`[share-poster] brief unavailable` | 局部修复确认：账本/关键事件已落地；仍阻塞：ready PNG / task 权限未闭环，不能写接口通过 |
| failed task 失败态 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781584504132-3251bd01" --wait 6000 --storage --data briefId,sessionId,photoHighlights,accountingHighlights,keyEvents,shareSummary,saveState,errorText,ledgerContractNotice,readyShareImageUrl,shareTask` | `docs/runtime/pr-qa-share-flow-p0-018-poster-failed-foreground-20260617.png` | data `saveState=failed`、`errorText=not session member`、`shareTask.status=failed`、`shareTask.failedReason=not session member`、`accountingHighlights` 与 `keyEvents` 同 ready；Console warn 同上 | 局部修复确认：失败态可见；仍阻塞：未验证到后端 failed 样本真实原因 `share task has no visible nodes` |
| failed warning card | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781584504132-3251bd01" --selector .poster-state-card-warn --wait 3000 --storage --data saveState,errorText,shareTask` | 同 failed task 截图 | selector `.poster-state-card-warn` 可点击；data `saveState=failed`、`errorText=not session member`、`shareTask.status=failed` | 局部修复确认：失败卡存在；仍阻塞：重试真实链路未验证 |
| 邀请预览照片 / keyEvents | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-preview/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T" --wait 5000 --storage --data photoHighlights,photoHighlightsNotice,accountingHighlights,keyEvents,shareSummary,saveState,errorText,ledgerContractNotice,readyShareImageUrl,shareTask` | `docs/runtime/pr-qa-share-flow-p0-018-invite-preview-foreground-20260617.png` | page `pages/share-preview/index`；data `photoHighlights=[]`、`photoHighlightsNotice=当前邀请接口未返回公开照片高光；待 PR-INT-SHARE-FLOW-BE016-VERIFY-017-RUN 补 photoHighlights 字段。`、`accountingHighlights=[欠酒3杯, 已喝4杯, 已清1杯, 账本2人有记录]`、`keyEvents=2`、`shareSummary=...照片和账本会合并到酷炫分享页。`；storage token 后 8 位 `c418e86ad`；`console=[]` | 局部修复确认：keyEvents 和照片缺口提示已落地；仍阻塞：照片高光仍为空，标接口/权限缺口 |
| 保存按钮限定复核 | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781685446105-ae6b6317" --selector .poster-primary-action --wait 5000 --storage --data saveState,errorText,posterImagePath,readyShareImageUrl,shareTask` | `docs/runtime/pr-qa-share-flow-p0-018-save-once-foreground-20260617.png` | 本轮未超时；data `saveState=saved`、`errorText=""`、`posterImagePath=devtools-preview-share-poster.png`、`readyShareImageUrl=""`，但同一 data 中 `shareTask.status=failed`、`shareTask.failedReason=not session member`、`shareTask.imageUrl=""`；Console warn 仍有 `[share-poster] share task unavailable`、`[share-poster] brief unavailable` | 局部修复确认：DevTools 预览态按钮本次未超时；仍阻塞：保存图基于 failed task / 占位路径，不能写保存图准出或真机相册准出 |

##### 13.16.43.3 退回对象与下一步责任

| 问题 | 当前证据 | 下一步责任 |
| --- | --- | --- |
| 当前 QA storage 非样本成员 | token 后 8 位 `c418e86ad`；ready / failed 均 `not session member` | 接口联调 / 后端提供可复跑 host/member storage，或前端按公开分享合同避免成员态阻塞公开页 |
| ready 保存图未闭环 | `readyShareImageUrl=""`、`shareTask.status=failed`、`failedReason=not session member` | 前端 + 接口联调确认 task 查询、身份注入和 017 dual_flow 样本接入 |
| failed task 真实失败原因未展示 | 页面显示 `not session member`，未展示后端 3.27 的 `share task has no visible nodes` | 前端复核 `getManagedShareImageTask` / `applyShareTask`；接口联调提供成员态复跑 |
| photoHighlights 仍为空 | 邀请预览 `photoHighlights=[]`，仅有 `photoHighlightsNotice` | 接口联调 / 后端补公开照片高光字段或明确权限过滤样本；UGC 复核可见范围 |
| 保存按钮不能准出 | 本轮按钮未超时，但 `shareTask.status=failed`、`readyShareImageUrl=""`、`posterImagePath` 为 DevTools 预览占位 | 前端继续处理保存图真实 task / imageUrl；发布前另做真机相册权限准出 |

##### 13.16.43.4 当前结论

`PR-QA-SHARE-FLOW-P0-018-PARTIAL-VERIFY` 结论：`局部修复确认 / 仍阻塞`。已确认 brief 不再 loading、入口可点击、ready/failed 页面有账本高光与 2 条关键事件、邀请预览有 keyEvents 和照片缺口提示、保存按钮本轮在 DevTools 未超时。但当前身份仍触发 `not session member`，ready PNG / failed 真实原因 / photoHighlights / 真实保存图 imageUrl 均未闭环。测试侧不得写预览框阶段通过、真机通过或上线通过。

#### 13.16.44 `PR-QA-DEBUGGER-CONSOLE-WATCH-020` 2026-06-17 调试器优先门禁

记录时间：2026-06-17。PM 派发 `PR-QA-DEBUGGER-CONSOLE-WATCH-020`：后续每轮微信开发者工具右侧预览复核必须先查调试器 Console / Network / storage，再跑点击矩阵。本节只补测试/验收规则，不改 PM 总台账、团队公告、派发队列或业务源码；不得写预览框阶段通过、真机通过或上线通过。

##### 13.16.44.1 已读与 PM 当前证据

| 项 | 证据 |
| --- | --- |
| 已读规则 | `AGENTS.md`；测试计划 13.16.43；PM 总进度 2026-06-17 最新记录；派发队列 `PR-QA-DEBUGGER-CONSOLE-WATCH-020` 行 |
| PM 当前调试器状态 | 页面 `pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781685446105-ae6b6317`；API base `https://api.pomer.cn/api/v1`；storage token 后 8 位 `c418e86ad`；Console `[]` |
| PM 截图 | `docs/runtime/pm-devtools-status-share-020-20260617.png` |
| 总进度口径 | 当前仍缺 UI/UX 020 资产规格、前端 1:1 实现和成员态 storage；上线状态不变，不得写通过 |

##### 13.16.44.2 每轮预览复核固定顺序

后续所有分享流预览复核必须按以下顺序执行并记录证据：

1. 调试器预检查：先记录当前 `summary.page.path/query`、storage API base、storage token 后 8 位、Console 摘要、Network / API 摘要。若 Console/Network 有红错，先登记红错和退回对象，再决定是否继续点击矩阵。
2. 入口矩阵：验证 `session-brief` / 记录页 / 相册或前端指定入口中分享入口可见、可点击，记录 selector、点击前后 page/query/data。
3. 预览矩阵：验证分享预览页不是空壳，必须包含照片区域或明确照片缺口提示、聚会账本 / 酒桌记账高光、关键事件、分享总结。
4. 保存矩阵：验证保存成功、保存失败、重试状态，记录 `saveState`、`errorText`、`posterImagePath`、`readyShareImageUrl`、`shareTask.status`、`shareTask.failedReason`；DevTools 预览态保存不得等同真机相册准出。
5. 分享回流矩阵：验证分享回流页 / 回流卡 / 外部访问路径，记录 `viewerRole`、`permissionState`、`visibleNodes`、`filteredNodeIds`、`reportEntryVisible` 或前端等效字段。
6. 双主线展示矩阵：确认照片 + 聚会账本共同展示。若 `photoHighlights=[]`、`accountingHighlights=[]`、`keyEvents=[]` 或仅有前端空态，必须写字段缺口，不得写通过。

##### 13.16.44.3 必填证据模板

| 证据项 | 必填内容 |
| --- | --- |
| 命令原文 | 完整 `npm.cmd --% run wechat:auto -- ...` 或等效调试器 / API 命令；包含 path、selector、wait、storage、data 字段 |
| 截图 | 优先可读右侧预览框截图；黑图、过小图、不可读图不得作为通过证据；截图路径写入 `docs/runtime/` |
| page/query | `summary.page.path`、`summary.page.query`，query 缺失或被 shell 拆断需登记为命令问题 |
| page data | 至少记录 `photoHighlights`、`accountingHighlights`、`keyEvents`、`shareSummary`、`saveState`、`errorText`、`ledgerContractNotice`、`readyShareImageUrl`、`shareTask.status`；字段名变化时记录前端等效字段 |
| storage | API base、用户态摘要、token 只写后 8 位；不得输出完整 token |
| Console | `console=[]` 或 Console warn/error 摘要；红错需写原文、页面、触发命令 |
| Network / API | 记录 API base、请求 URL 摘要、HTTP 状态、关键响应字段；涉及 token 的请求只写 token 后 8 位 |
| 失败退回对象 | 明确退回前端、接口联调、后端/API、UI/UX、UGC 或测试工具链，不写泛化“待处理” |

##### 13.16.44.4 分享页 P0 准入门槛

没有以下证据前，测试不得写“预览框阶段通过”：

- UI/UX `PR-UX-SHARE-FLOW-ASSET-SPEC-020`：分享入口、预览、保存图、成功/失败/重试、回流页的字体、背景、贴纸、按钮、状态、切图、安全区规格。
- 前端 `PR-FE-SHARE-FLOW-PIXEL-MATCH-020`：按 UI/UX 015 五张目标图和 020 规格完成 1:1 实现截图，且不造假数据、不改数据结构绕过接口。
- 接口联调 / 后端：提供成员态 storage 或公开分享合同，能让 ready / failed / dual_flow 样本在 DevTools 中稳定得到真实 `shareTask`、`readyShareImageUrl`、失败原因、照片高光、账本高光和权限字段。
- UGC：给出局内 / 局外 / 未登录可见范围、照片过滤、账本敏感字段、举报入口和保存图传播风险口径。

##### 13.16.44.5 当前阻塞与下一步责任

| 阻塞项 | 当前证据 | 下一步责任 |
| --- | --- | --- |
| 缺 UI/UX 020 资产规格 | PM 总进度已新增 `PR-UX-SHARE-FLOW-ASSET-SPEC-020`；测试侧尚无 020 视觉规格包 | UI/UX 输出规格、切图、安全区和状态资产 |
| 缺前端 1:1 实现 | 当前只有 018 局部修复，分享页仍未达到 015 目标图 1:1 和 020 门槛 | 前端执行 `PR-FE-SHARE-FLOW-PIXEL-MATCH-020` 后回包 selector、页面路径、data 字段和截图 |
| 缺成员态 storage / 公开合同 | 当前 token 后 8 位 `c418e86ad` 非样本成员，ready / failed 仍可触发 `not session member` | 接口联调 / 后端提供 host/member storage 或公开分享读取合同 |
| 缺完整照片 + 账本共同展示证据 | 13.16.43 仍有 `photoHighlights=[]`、`readyShareImageUrl=""`、真实 failed 原因未验证 | 前端 + 接口联调 + UGC 补字段、权限和角色视角 |

##### 13.16.44.6 当前结论

`PR-QA-DEBUGGER-CONSOLE-WATCH-020` 已写入测试计划规则。后续每轮分享流预览复核必须先做 Console / Network / storage 预检查，再跑入口、预览、保存成功 / 失败 / 重试、回流和照片 + 账本共同展示矩阵。当前状态：`规则已建立 / 待 UI/UX 020 规格 / 待前端 1:1 实现 / 待成员态 storage 或公开合同 / 不写通过`。

#### 13.16.45 `PR-QA-DEBUGGER-CONSOLE-WATCH-020` 2026-06-17 回包后待前端 020 复测

记录时间：2026-06-17。PM 同步：UI/UX 020、前端 019、接口联调 019 已回包，前端 020 视觉 1:1 复刻已正式派发。测试侧当前暂不复测分享通过，等待前端 `PR-FE-SHARE-FLOW-PIXEL-MATCH-020` 最终回包后，再按 13.16.44 先查 Console / Network / storage，再跑分享矩阵。本节只更新测试计划状态，不改 PM 总台账、团队公告、派发队列或源码。

##### 13.16.45.1 当前等待条件

| 项 | 当前口径 | 测试动作 |
| --- | --- | --- |
| UI/UX 020 | PM 同步 UI/UX 020 已回包 | 等前端 020 映射实现后，与 UI/UX 规格一起做截图对照；本节不写 UI/UX 通过 |
| 前端 019 | PM 同步前端 019 已回包 | 作为字段映射前置；不单独写分享通过，等前端 020 最终包 |
| 接口联调 019 | PM 同步接口联调 019 已回包 | 作为成员态 storage / 接口前置；复测时需记录 storage token 后 8 位，不得输出完整 token |
| 前端 020 | 视觉 1:1 复刻已正式派发，尚未最终回包 | 测试暂不跑通过矩阵；收到最终回包后按 13.16.44 执行 |

##### 13.16.45.2 后续复测前置检查

前端 020 最终回包后，每轮执行顺序固定如下：

1. 先查调试器 Console / Network / storage，并记录当前 page/query、API base、token 后 8 位、Console 摘要、Network/API 摘要。
2. 若 `npm.cmd run wechat:auto -- status --storage` 或等效 `status` 命令超时，先登记工具链阻塞、命令原文、超时原文、是否存在 automator 残留；不得把 automator 超时直接判定为业务失败。
3. 工具链可用后，才跑入口、预览、保存成功 / 失败 / 重试、回流、照片 + 账本共同展示矩阵。
4. 若工具链不稳定但页面截图或调试器手工证据可读，应在证据里区分“调试器/工具链证据”和“业务页面证据”。
5. DevTools 预览态保存仍不得替代真机相册权限或正式发布准出。

##### 13.16.45.3 本轮 PM 工具链提示

| 项 | PM 同步 |
| --- | --- |
| `wechat:auto status --storage` | PM 本轮两次超时 |
| 残留处理 | PM 已清理 automator 残留 |
| 风险判断 | status 后续仍可能不稳定；测试复测时先记录工具链阻塞，不得直接把超时写成业务失败 |

##### 13.16.45.4 当前结论

当前状态：`UI/UX 020 / 前端 019 / 接口联调 019 已回包待吸收 / 前端 020 最终回包前暂不复测分享通过 / automator status 超时需先登记工具链阻塞 / 不写通过`。下一步由前端完成 `PR-FE-SHARE-FLOW-PIXEL-MATCH-020` 并给出页面路径、selector、data 字段、截图和验证命令后，测试按 13.16.44 / 13.16.45 执行预览框复测。

#### 13.16.46 `PR-QA-SHARE-FLOW-PIXEL-MATCH-020-RETEST` 2026-06-17 前端 020 回包后预览框复测

记录时间：2026-06-17。前端 `PR-FE-SHARE-FLOW-PIXEL-MATCH-020` 已回包，PM 已提示静态验证不等于预览框通过；测试侧按 13.16.44 先查 Console / Network / storage / page data，再跑右侧预览框点击矩阵。本节只更新测试计划和证据，不修改源码、PM 总台账、团队公告或派发队列；不得写真机通过或上线通过。

##### 13.16.46.1 已读与前置证据

| 项 | 证据 / 摘要 |
| --- | --- |
| 已读范围 | `AGENTS.md`；测试计划 13.16.44；前端计划 14.33；接口联调计划 3.28；UI/UX 12.7.18；`docs/design-assets/party-recorder/share-flow-015/ASSET_SPEC_020.md`；派发队列 `PR-QA-SHARE-FLOW-PIXEL-MATCH-020-RETEST` 行 |
| PM 旁证 | `npm.cmd run wechat:auto -- status --port 9420 --output docs/runtime/pm-devtools-status-share-022-20260617.png` 成功；页面 `pages/share-poster/index?reportId=report-1781696240779-bec20a`；Console `[]`。该证据不是本轮通过证据，因为不是指定 `briefId + taskId=share-task-1781687817395-94cf4452` dual_flow 成员态样本，也未执行接口 3.28 storage 方案 |
| 3.28 storage 方案 | 已按接口联调 3.28 从服务器 token 文件安全读取 host token，并写入 DevTools storage；日志只记录 token 后 8 位 `4afb1b00`，未输出完整 token |
| 截图方式 | `wechat:auto --output` 首次执行超时，后续用无 `--output` 的 automator 命令取 page/data/console，再用右侧预览框前台截图补证据 |

##### 13.16.46.2 调试器 / storage / Network 预检查

| 检查项 | 命令原文 / 证据 | 摘要 | 结论 |
| --- | --- | --- | --- |
| 注入前当前页状态 | `npm.cmd --% run wechat:auto -- status --port 9420 --data saveState,errorText,readyShareImageUrl,shareTask,photoHighlights,accountingHighlights,keyEvents,shareSummary,ledgerIncluded,taskIncludeLedger,taskLayoutMode` | page `pages/share-poster/index`，query `briefId=brief-1781584503870-25d5edac`、`taskId=share-task-1781687817395-94cf4452`；data `saveState=failed`、`errorText=not session member`、`shareTask.status=failed`、`shareTask.failedReason=not session member`、`photoHighlights=[]`、`accountingHighlights=[]`、`keyEvents=[]`、`ledgerIncluded=false`；Console `[]` | 确认注入前 storage 非成员态，不能作为业务失败结论 |
| storage 注入失败 1 | 接口 3.28 原始 PowerShell/SSH/Node 引号组合命令 | 失败原文：`ParserError: Missing argument in parameter list.` | 测试工具命令转义失败，不判业务 |
| storage 注入失败 2 | 简化 `printf` handoff 命令 | 失败原文：`bash: line 1: t%s: command not found`、`host token handoff failed` | 测试工具命令转义失败，不判业务 |
| storage 注入成功 | 使用远端 base64 JSON 方式读取 token 后写入 DevTools storage：`runtime-api-base`、`jzp-user-token`、`social-current-profile-id`、`social-current-profile`，并清理 `social-user-session-token` | 输出摘要：`{"ok":true,"identity":"host","apiBase":"https://api.pomer.cn/api/v1","profileId":"user-1781583974510-1a52e6","profileName":"PR Seed Host","tokenTail":"4afb1b00"}` | 成员态 storage 已注入 |
| safe storage 摘要 | `node -e "const automator=require('miniprogram-automator'); ... getStorageSync('jzp-user-token') ... console.log({apiBase,profileId,tokenTail,tokenPresent})"` | `{"ok":true,"apiBase":"https://api.pomer.cn/api/v1","profileId":"user-1781583974510-1a52e6","tokenTail":"4afb1b00","tokenPresent":true}` | 仅记录 token 后 8 位 |
| Network / API 摘要 | DevTools storage token 仅在本地脚本内读取，不打印完整 token；请求 `GET https://api.pomer.cn/api/v1/session-briefs/brief-1781584503870-25d5edac`、`GET https://api.pomer.cn/api/v1/share-image-tasks/share-task-1781687817395-94cf4452`、`GET https://api.pomer.cn/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png` | tokenTail `4afb1b00`；brief HTTP 200/code 0/message ok，`hasAccountingHighlights=true`、`hasPhotoHighlights=false`；dualTask HTTP 200/code 0/message ok，`dataStatus=ready`、`ledgerIncluded=true`、`layoutMode=dual_flow`；PNG HTTP 200、content-type `image/png` | 接口 ready task 可取；brief API 摘要仍未证明照片高光字段完整 |
| automator 截图工具链 | `npm.cmd --% run wechat:auto -- relaunch ... --output docs/runtime/pr-qa-share-flow-pixel-020-brief-entry-20260617.png` | 失败原文：`command timed out after 74044 milliseconds`；同时发现 PM 021 `--storage` 与本轮 brief 命令残留 automator 进程，已停止残留后继续无 `--output` 矩阵 | 登记为工具链截图阻塞，不判业务失败 |

##### 13.16.46.3 用例执行记录

| 用例 | 命令原文 | 截图 / page / data / Console 摘要 | 结论 |
| --- | --- | --- | --- |
| brief 入口打开 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/session-brief/index?sessionId=session-1781584503517-c033e9&briefId=brief-1781584503870-25d5edac" --wait 5000 --data briefId,sessionId,loading,errorText,shareTask,photoHighlights,accountingHighlights,keyEvents,shareSummary` | page `pages/session-brief/index`，query 完整；data `loading=false`、`errorText=""`、`shareTask.status=ready`、`shareTask.id=share-task-1781687817395-94cf4452`；brief 页 `shareTask.imageUrl=""`、`ledgerIncluded=false`、`layoutMode=""`；`accountingHighlights=[待处理记录 3条, 完成记录 4条, 加酒记录 2条, 已消记录 1条]`；Console `[]` | 局部通过：brief 不再 loading，入口数据存在 |
| brief 分享入口点击 | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/session-brief/index?sessionId=session-1781584503517-c033e9&briefId=brief-1781584503870-25d5edac" --selector .brief-share-flow-entry --wait 3000 --data saveState,errorText,readyShareImageUrl,shareTask,photoHighlights,accountingHighlights,keyEvents,shareSummary,ledgerIncluded,taskIncludeLedger,taskLayoutMode` | 截图 `docs/runtime/pr-qa-share-flow-pixel-020-brief-entry-tap-foreground-20260617.png`；点击后 page `pages/share-poster/index`，query 含 `briefId/sessionId/taskId=share-task-1781687817395-94cf4452`；data `saveState=idle`、`errorText=""`、`readyShareImageUrl=https://api.pomer.cn/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png`、`shareTask.status=ready`、`shareTask.ledgerIncluded=true`、`shareTask.layoutMode=dual_flow`、`photoHighlights=2`、`accountingHighlights=[欠酒3杯, 已喝4杯, 已清1杯, 账本5条]`、`keyEvents=3`、`shareSummary=这场聚会留下 2 张公开照片、5 条账本高光和 3 个关键时刻。`；Console `[]` | 局部通过：入口可点击并进入 dual_flow 海报 |
| ready poster 打开 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --wait 6000 --data saveState,errorText,readyShareImageUrl,shareTask,photoHighlights,accountingHighlights,keyEvents,shareSummary,ledgerIncluded,taskIncludeLedger,taskLayoutMode` | data `saveState=idle`、`errorText=""`、`readyShareImageUrl=https://api.pomer.cn/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png`、`shareTask.status=ready`、`shareTask.ledgerIncluded=true`、`shareTask.layoutMode=dual_flow`、`photoHighlights=2`、`accountingHighlights=4`、`keyEvents=3`、`ledgerIncluded=true`、`taskLayoutMode=dual_flow`；Console `[]` | 数据链路局部通过 |
| ready poster 主视觉 selector | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --selector .poster-stage-primary --wait 2000 --data saveState,errorText,readyShareImageUrl,shareTask,photoHighlights,accountingHighlights,keyEvents,shareSummary,ledgerIncluded,taskIncludeLedger,taskLayoutMode` | 截图 `docs/runtime/pr-qa-share-flow-pixel-020-poster-stage-foreground-20260617.png`、宽截图 `docs/runtime/pr-qa-share-flow-pixel-020-poster-wide-20260617.png`；selector 可定位；data 触发后为 `saveState=saved`、`errorText=""`，照片/账本/关键事件仍完整；Console `[]` | 结构可定位；但截图显示关键事件卡文字竖排挤压、右侧事件卡截断，不能写视觉通过 |
| 保存主按钮 | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --selector .poster-primary-action --wait 5000 --data saveState,errorText,posterImagePath,readyShareImageUrl,shareTask` | data `saveState=saved`、`errorText=""`、`posterImagePath=devtools-preview-share-poster.png`、`readyShareImageUrl=https://api.pomer.cn/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png`、`shareTask.status=ready`、`shareTask.ledgerIncluded=true`、`shareTask.layoutMode=dual_flow`；Console `[]` | DevTools 预览态保存成功；不代表真机相册或发布准出 |
| ready warning selector | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --selector .poster-state-card-warn --wait 3000 --data saveState,errorText,posterImagePath,readyShareImageUrl,shareTask` | selector 可定位；data `saveState=idle`、`errorText=""`、`posterImagePath=""`、`shareTask.status=ready`；Console `[]` | ready 样本上的警告卡不能作为失败/重试态通过证据 |
| 海报回流卡 | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --selector .poster-return-card --wait 3000 --data viewerRole,permissionState,visibleNodes,filteredNodeIds,reportEntryVisible,saveState,errorText,readyShareImageUrl,shareTask` | selector 可定位；data `viewerRole=member`、`permissionState=public`、`readyShareImageUrl` 有 PNG、`shareTask.status=ready`；未返回 `visibleNodes/filteredNodeIds/reportEntryVisible` | 回流卡结构存在；UGC 可见范围字段缺证据，待前端/UGC 补齐 |
| 邀请预览打开 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-preview/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T&briefId=brief-1781584503870-25d5edac" --wait 5000 --data photoHighlights,photoHighlightsNotice,accountingHighlights,keyEvents,shareSummary,viewerRole,permissionState,visibleNodes,filteredNodeIds,reportEntryVisible` | 截图 `docs/runtime/pr-qa-share-flow-pixel-020-share-preview-foreground-20260617.png`、宽截图 `docs/runtime/pr-qa-share-flow-pixel-020-share-preview-wide-20260617.png`；page `pages/share-preview/index`；data `photoHighlights=[]`、`photoHighlightsNotice=当前邀请接口未返回公开照片高光；待 PR-INT-SHARE-FLOW-BE016-VERIFY-017-RUN 补 photoHighlights 字段。`、`accountingHighlights=[欠酒3杯, 已喝4杯, 已清1杯, 账本2人有记录]`、`keyEvents=2`、`shareSummary=IT-MOMENTS-20260616-006B-session 已准备好邀请，照片和账本会合并到酷炫分享页。`；Console `[]` | 仍阻塞：邀请回流页照片高光为空，只能证明账本/关键事件与缺口提示 |
| 邀请预览 summary selector | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/share-preview/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T&briefId=brief-1781584503870-25d5edac" --selector .share-fusion-summary --wait 2000 --data photoHighlights,photoHighlightsNotice,accountingHighlights,keyEvents,shareSummary,viewerRole,permissionState,visibleNodes,filteredNodeIds,reportEntryVisible` | selector 可定位；data 同邀请预览打开；Console `[]` | 结构可定位，照片字段仍缺 |
| failed task 打开 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781584504132-3251bd01" --wait 5000 --data saveState,errorText,readyShareImageUrl,shareTask` | 截图 `docs/runtime/pr-qa-share-flow-pixel-020-failed-task-wide-20260617.png`；data `saveState=failed`、`errorText=share task has no visible nodes`、`readyShareImageUrl=""`、`shareTask.status=failed`、`shareTask.failedReason=share task has no visible nodes`、`shareTask.sessionId=session-1781584503517-c033e9`；Console `[]` | 失败/重试态局部通过；同页关键事件区域仍有文字挤压/截断 |

##### 13.16.46.4 视觉与旧壳检查

| 检查项 | 证据 | 结论 |
| --- | --- | --- |
| 旧白卡 / 旧战报壳 | `docs/runtime/pr-qa-share-flow-pixel-020-poster-wide-20260617.png` 与 `docs/runtime/pr-qa-share-flow-pixel-020-share-preview-wide-20260617.png` 均未见 015 前旧白卡壳；poster 为深色舞台，preview 为 020 回流样式 | 旧壳未复现 |
| 照片 + 聚会账本共同展示 | poster ready data 与截图可见 2 张照片、账本高光、关键事件；share-preview 回流 data `photoHighlights=[]` | poster 局部满足；回流页仍不满足 |
| 元素越界 / 可读性 | ready / failed poster 宽截图中底部关键事件卡出现竖排挤压、横向截断，右侧事件卡被边界裁切 | 退回前端/UIUX：不满足 020 “不溢出 / 事件层级可读” |
| 保存状态 | ready 主按钮 data `saveState=saved`；failed task data `saveState=failed` 且失败原因真实；ready 页 `.poster-state-card-warn` 不能证明失败态 | 保存成功与失败态局部可验；重试恢复链路仍需前端补更明确状态证据 |
| UGC / 权限字段 | poster 回流卡 data 有 `viewerRole=member`、`permissionState=public`，但缺 `visibleNodes/filteredNodeIds/reportEntryVisible`；share-preview 未返回 viewer/permission 字段 | 待 UGC / 前端补字段与局外可见范围证据 |

##### 13.16.46.5 退回对象与下一步责任

| 问题 | 失败原文 / 证据 | 退回对象 |
| --- | --- | --- |
| 回流页照片高光缺失 | `share-preview` data `photoHighlights=[]`，页面提示 `当前邀请接口未返回公开照片高光...` | 接口联调 / 后端确认 invite share-preview 是否应返回公开照片高光；前端补字段消费；UGC 确认公开照片可见范围 |
| poster 关键事件布局溢出 | `docs/runtime/pr-qa-share-flow-pixel-020-poster-wide-20260617.png`、`docs/runtime/pr-qa-share-flow-pixel-020-failed-task-wide-20260617.png`：关键事件文字竖排挤压、右侧卡片裁切 | 前端 `PR-FE-SHARE-FLOW-PIXEL-MATCH-020` + UI/UX 020 复核，建议按 `PR-FE-SHARE020-P1-EVENT-HIERARCHY` / overflow 处理；若影响主要阅读区则升 P0 |
| 回流 / UGC 字段缺证据 | `.poster-return-card` 未返回 `visibleNodes/filteredNodeIds/reportEntryVisible`；share-preview 未返回 viewer/permission 字段 | 前端 + UGC 补 data 字段或等效可见范围证据 |
| ready 警告卡不等于失败重试链路 | ready `.poster-state-card-warn` data `shareTask.status=ready`、`errorText=""` | 前端补明确失败/重试 selector 与状态，测试复跑 failed task |
| 工具链 `--output` 超时 | 失败原文：`command timed out after 74044 milliseconds`；已改用无 `--output` + 前台截图 | 测试工具链登记；后续复测遇超时仍先登记，不判业务 |

##### 13.16.46.6 当前结论

`PR-QA-SHARE-FLOW-PIXEL-MATCH-020-RETEST` 结论：`局部修复确认 / 仍阻塞 / 待复核`。成员态 storage 注入后，brief 入口、ready dual_flow poster、保存预览态、failed task 真实失败原因、Console `[]` 均有有效证据；poster 数据链路已能同时展示照片 + 聚会账本 + 关键事件。但回流页 `photoHighlights=[]`，UGC 可见范围字段缺失，poster 关键事件区域存在文字挤压和横向截断；因此本轮不得写“预览框阶段通过”，更不得写“真机通过”或“上线通过”。下一步由接口联调 / 后端补回流照片高光或权限说明，前端 + UI/UX 修复 poster 事件区溢出和重试状态证据，UGC 补局外可见范围字段后，测试按 13.16.44 复测。

#### 13.16.47 `PR-QA-SHARE-FLOW-FIRST-SCREEN-022-RETEST` 2026-06-17 首屏可见性复测

记录时间：2026-06-17。PM 正式派发 `PR-QA-SHARE-FLOW-FIRST-SCREEN-022-RETEST`，背景为前端 022 已静态回包，PM 复跑 `typecheck`、`check:encoding`、目标 diff check 均通过，但 PM 右侧预览截图 `docs/runtime/wechat-devtools-preview.png` 仍显示旧大贴纸画面。本节只记录测试/验收证据，不改源码、PM 总台账、团队公告、派发队列或前端/UIUX 文档；不得写真机通过或上线通过。

##### 13.16.47.1 已读与环境刷新

| 项 | 证据 / 摘要 |
| --- | --- |
| 已读范围 | `AGENTS.md`；测试计划 13.16.44 / 13.16.46；前端计划 14.35；接口联调计划 3.28；PM 队列 `PR-QA-SHARE-FLOW-FIRST-SCREEN-022-RETEST` 行 |
| PowerShell | `$PSVersionTable.PSVersion.ToString()` -> `7.6.2` |
| DevTools 自动化端口 | `pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420` -> `{"ok":true,"action":"already-listening","port":9420,"owningProcess":18032,"projectPath":"F:\\codexlist\\jiuzhuopanguan"}` |
| storage 安全摘要 | `node -e "const automator=require('miniprogram-automator'); ... token.slice(-8) ..."` -> `{"ok":true,"apiBase":"https://api.pomer.cn/api/v1","profileId":"user-1781583974510-1a52e6","tokenTail":"4afb1b00","tokenPresent":true}` |
| storage 注入 | 本轮无需重新注入；当前已是接口 3.28 host 样本成员。未输出完整 token |

##### 13.16.47.2 页面 / data / Network 复测

| 检查项 | 命令原文 | 摘要 | 结论 |
| --- | --- | --- | --- |
| 指定 dual_flow ready 页面 relaunch | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --wait 6000 --data saveState,errorText,readyShareImageUrl,shareTask,photoHighlights,accountingHighlights,keyEvents,shareSummary,ledgerIncluded,taskIncludeLedger,taskLayoutMode` | page `pages/share-poster/index`；query `briefId=brief-1781584503870-25d5edac`、`taskId=share-task-1781687817395-94cf4452`；data `saveState=idle`、`errorText=""`、`readyShareImageUrl=https://api.pomer.cn/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png`、`shareTask.status=ready`、`shareTask.ledgerIncluded=true`、`shareTask.layoutMode=dual_flow`、`photoHighlights=2`、`accountingHighlights=[欠酒3杯, 已喝4杯, 已清1杯, 账本5条]`、`keyEvents=3`、`shareSummary=这场聚会留下 2 张公开照片、5 条账本高光和 3 个关键时刻。`、`ledgerIncluded=true`、`taskLayoutMode=dual_flow`；automator `console=[]` | 页面与 data 可读；未复现 124 秒 relaunch 超时 |
| 当前 status 复查 | `npm.cmd --% run wechat:auto -- status --port 9420 --data saveState,errorText,readyShareImageUrl,shareTask,photoHighlights,accountingHighlights,keyEvents,shareSummary,ledgerIncluded,taskIncludeLedger,taskLayoutMode` | page/query 仍为指定 ready dual_flow；data 与 relaunch 一致；automator `console=[]` | page 状态稳定 |
| Network / API 摘要 | 本地脚本从 DevTools storage 读取 token 后仅记录尾号，请求 `GET https://api.pomer.cn/api/v1/session-briefs/brief-1781584503870-25d5edac`、`GET https://api.pomer.cn/api/v1/share-image-tasks/share-task-1781687817395-94cf4452`、`GET https://api.pomer.cn/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png` | tokenTail `4afb1b00`；brief HTTP 200/code 0/message ok，`accountingHighlightsLength=4`，但 `hasPhotoHighlights=false`、`keyEventsLength=null`；dualTask HTTP 200/code 0/message ok，`dataStatus=ready`、`ledgerIncluded=true`、`layoutMode=dual_flow`、`hasImageUrl=true`；PNG HTTP 200、content-type `image/png` | ready task 与 PNG 合同可取；brief API 摘要仍不证明照片高光字段完整 |
| 保存主按钮 | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --selector .poster-primary-action --wait 3000 --data saveState,errorText,posterImagePath,readyShareImageUrl,shareTask` | selector 可点击；data `saveState=saved`、`errorText=""`、`posterImagePath=devtools-preview-share-poster.png`、`readyShareImageUrl` 为 ready PNG、`shareTask.status=ready`、`shareTask.ledgerIncluded=true`、`shareTask.layoutMode=dual_flow`；automator `console=[]` | DevTools 预览态保存按钮可用，不代表真机相册准出 |
| 状态 / 失败提示入口 | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --selector .poster-state-card-warn --wait 2000 --data saveState,errorText,posterImagePath,readyShareImageUrl,shareTask` | selector 可定位；ready 样本下 data `saveState=idle`、`errorText=""`、`shareTask.status=ready` | 状态入口存在；ready 样本不能证明真实失败态 |

##### 13.16.47.3 截图与首屏四要素

| 截图 | 命令 / 方式 | 观察 |
| --- | --- | --- |
| `docs/runtime/pr-qa-share-flow-first-screen-022-retest-preview-20260617.png` | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-share-flow-first-screen-022-retest-preview-20260617.png` | `Mode=right` 固定 62% 裁剪导致左侧内容被截断，只作辅助证据 |
| `docs/runtime/pr-qa-share-flow-first-screen-022-retest-window-20260617.png` | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Mode window -Output docs/runtime/pr-qa-share-flow-first-screen-022-retest-window-20260617.png` | 全窗口可读，但基于 `PrintWindow`；可见调试器 Console 面板和右侧预览 |
| `docs/runtime/pr-qa-share-flow-first-screen-022-retest-window-foreground-20260617.png` | 前台 `SetForegroundWindow + CopyFromScreen` 截图 | 最可信截图。右侧预览已刷新到 `ready · dual_flow`；贴纸 / 星芒已缩为边角点缀；照片高光、聚会账本 / 酒桌记账高光、保存成品图 / 保存聚会分享图主按钮、已生成状态入口在首屏同屏可见 |

首屏验收点：

| 验收点 | 结果 |
| --- | --- |
| 贴纸是否缩小为边角点缀 | 通过：前台截图中星芒和胶带为小装饰，不再占据首屏主视觉 |
| 照片高光首屏可见 | 通过：两张拍立得照片墙在首屏左侧可见，data `photoHighlights=2` |
| 聚会账本 / 酒桌记账高光首屏可见 | 通过：账本卡和 4 个指标首屏可见，data `accountingHighlights=4` |
| 保存 / 分享主按钮首屏可见 | 通过：`保存成品图`、`保存聚会分享图` 两个主按钮首屏可见，`.poster-primary-action` 可点击 |
| 状态 / 失败提示入口首屏可见 | 通过但需限定：ready 样本下 `已生成` 状态入口首屏可见，`.poster-state-card-warn` 可定位；真实失败态仍沿 13.16.46 failed task 复测，不在本节写全链路通过 |

##### 13.16.47.4 Console / 调试器状态

| 来源 | 摘要 | 判定 |
| --- | --- | --- |
| automator 输出 | `relaunch`、`status`、`.poster-primary-action`、`.poster-state-card-warn` 均返回 `console=[]` | automator 未捕获新增阻塞 Console |
| 可视调试器 Console 面板 | `docs/runtime/pr-qa-share-flow-first-screen-022-retest-window-foreground-20260617.png` 显示调试器仍有计数 `5` / `102`，可见 warning 包括 `Component wxss, including tag name selectors, ID selectors, and attribute selectors... navigation-bar.wxss:6`、`showLoading 与 hideLoading 必须配对使用 index.ts:793`、`[pages/share-preview/index] Some selectors are not allowed in component wxss...`、`<canvas>: canvas 2d 接口支持同层渲染且性能更佳...` | 调试器不清洁，需前端继续清理或确认非阻塞来源；测试不写分享流全链路通过 |

##### 13.16.47.5 当前结论与退回对象

`PR-QA-SHARE-FLOW-FIRST-SCREEN-022-RETEST` 结论：`首屏可见性预览框确认 / 调试器仍待清理 / 不代表全链路或上线通过`。

- 通过范围：仅限 022 首屏可见性。刷新后前台截图确认旧大贴纸画面已消失，照片高光、聚会账本 / 酒桌记账高光、保存 / 分享主按钮、状态入口均在首屏同屏可见。
- 不通过范围：调试器 Console 面板仍有 warning / 计数，尤其 `showLoading 与 hideLoading 必须配对使用 index.ts:793` 仍可见；回流页照片字段缺口、UGC 可见范围字段缺口和 020 的分享全链路问题仍沿 13.16.46 待修。
- 退回对象：前端继续处理 Console / loading 配对和调试器 warning；接口联调 / 后端继续确认 brief API 照片高光字段；UGC / 前端继续补回流可见范围字段。测试下一轮仍按 13.16.44 先查 Console / Network / storage，再跑点击矩阵。

#### 13.16.48 `PR-QA-SHARE-FLOW-CONSOLE-CLEANUP-023-RETEST` 2026-06-17 Console 清理复测

记录时间：2026-06-17。PM 派发 `PR-QA-SHARE-FLOW-CONSOLE-CLEANUP-023-RETEST`；前端 023 已回包，称 `share-poster/index.ts` 修复 `showLoading/hideLoading` 配对顺序，ready 保存路径不再额外挂 loading，`navigation-bar.less` 修 selector warning，canvas 2d 旧接口提示归类为非阻塞性能 / 兼容提示。本节只更新测试计划和测试证据，不改业务源码、PM 总台账、前端 / UIUX / 接口文档；不得写上线通过。

##### 13.16.48.1 已读与环境

| 项 | 证据 / 摘要 |
| --- | --- |
| 已读范围 | `AGENTS.md`；测试计划 13.16.47；前端计划 14.36；派发队列 `PR-QA-SHARE-FLOW-CONSOLE-CLEANUP-023-RETEST` 行 |
| DevTools 自动化 | `pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420` -> `{"ok":true,"action":"already-listening","port":9420,"owningProcess":18032,"projectPath":"F:\\codexlist\\jiuzhuopanguan"}` |
| PowerShell | `$PSVersionTable.PSVersion.ToString()` -> `7.6.2` |
| storage 安全摘要 | `node -e "const automator=require('miniprogram-automator'); ... token.slice(-8) ..."` -> `{"ok":true,"apiBase":"https://api.pomer.cn/api/v1","profileId":"user-1781583974510-1a52e6","tokenTail":"4afb1b00","tokenPresent":true}`；未输出完整 token |

##### 13.16.48.2 页面 / data / Network 证据

| 检查项 | 命令原文 | 摘要 | 结论 |
| --- | --- | --- | --- |
| ready dual_flow 打开 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --wait 6000 --data saveState,errorText,readyShareImageUrl,shareTask,photoHighlights,accountingHighlights,keyEvents,shareSummary,ledgerIncluded,taskIncludeLedger,taskLayoutMode` | page `pages/share-poster/index`；query `briefId=brief-1781584503870-25d5edac`、`taskId=share-task-1781687817395-94cf4452`；data `saveState=idle`、`errorText=""`、`readyShareImageUrl=https://api.pomer.cn/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png`、`shareTask.status=ready`、`shareTask.layoutMode=dual_flow`、`shareTask.ledgerIncluded=true`、`photoHighlights=2`、`accountingHighlights=4`、`keyEvents=3`、`shareSummary=这场聚会留下 2 张公开照片、5 条账本高光和 3 个关键时刻。`、`ledgerIncluded=true`、`taskLayoutMode=dual_flow`；automator `console=[]` | 页面与 data 稳定；未复现 relaunch 超时 |
| 保存主按钮一次 | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --selector .poster-primary-action --wait 4000 --data saveState,errorText,posterImagePath,readyShareImageUrl,shareTask,photoHighlights,accountingHighlights,keyEvents,shareSummary,ledgerIncluded,taskLayoutMode` | selector 可点击；data `saveState=saved`、`errorText=""`、`posterImagePath=devtools-preview-share-poster.png`、`readyShareImageUrl` 仍为 ready PNG、`shareTask.status=ready`、`layoutMode=dual_flow`、照片 / 账本 / 关键事件数量不回退；automator `console=[]` | DevTools 预览态保存不回退；不代表真机相册准出 |
| Network / API 摘要 | 本地脚本从 DevTools storage 读取 token 后只记录尾号，请求 `GET https://api.pomer.cn/api/v1/share-image-tasks/share-task-1781687817395-94cf4452`、`GET https://api.pomer.cn/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png` | tokenTail `4afb1b00`；dualTask HTTP 200 / code 0 / message ok，`dataStatus=ready`、`ledgerIncluded=true`、`layoutMode=dual_flow`、`hasImageUrl=true`；PNG HTTP 200，content-type `image/png` | task 与 PNG 均可取 |

##### 13.16.48.3 Console 原文 / 计数 / 截图

| 阶段 | 截图 / 命令 | Console 摘要 |
| --- | --- | --- |
| 保存后首次前台截图 | `docs/runtime/pr-qa-share-flow-console-cleanup-023-window-foreground-20260617.png` | 可视调试器 Console 显示计数约 `5` 个 error / `114` 个 warning；可见原文包括 `Some selectors are not allowed in component wxss, including tag name selectors, ID selectors, and attribute selectors. (./components/navigation-bar/navigation-bar.wxss:6 7:30)`、`[pages/share-preview/index] [Component] <canvas>: canvas 2d 接口支持同层渲染且性能更佳，建议切换使用。详见文档 https://developers.weixin.qq.com/miniprogram/dev/component/canvas.html#Canvas-2D-...`、`[pages/share-preview/index] Some selectors are not allowed in component wxss... (./components/navigation-bar/navigation-bar.wxss:6 7:30)`。当前可见区域未见 `showLoading 与 hideLoading 必须配对使用 index.ts:793` |
| Console 清空点击 | Win32 鼠标点击 Console 清空区域，输出 `{"ok":true,"action":"clicked-console-clear","x":245,"y":579}` | 点击未使可视历史日志消失；不作为业务失败，仅说明手工清空不可靠 |
| Console 快捷键清空 | Win32 聚焦 Console 后 `Ctrl+L`，输出 `{"ok":true,"action":"console-clear-shortcut","shortcut":"Ctrl+L"}` | 快捷键后历史日志仍保留 |
| 清空尝试后复跑 relaunch + 保存 | `docs/runtime/pr-qa-share-flow-console-cleanup-023-after-clear-foreground-20260617.png`、`docs/runtime/pr-qa-share-flow-console-cleanup-023-after-shortcut-foreground-20260617.png` | 可视调试器仍显示约 `5` 个 error / `120` 个 warning；navigation-bar selector warning 和 canvas 2d 提示仍可见；automator 本轮 relaunch / tap 输出均为 `console=[]` |

Console 判定：

| 目标 | 本轮结果 |
| --- | --- |
| `showLoading 与 hideLoading 必须配对使用 index.ts:793` 是否仍可见 | 本轮三张 023 可视截图的当前可见区域未见该原文；automator relaunch / 保存均 `console=[]`。但因调试器历史日志无法清空，不能证明 Console 全量彻底清洁 |
| navigation-bar selector warning 是否消失 | 未消失。可视 Console 仍显示 `./components/navigation-bar/navigation-bar.wxss:6 7:30` selector warning |
| canvas 2d 性能提示 | 仍可见，原文为 `<canvas>: canvas 2d 接口支持同层渲染且性能更佳，建议切换使用...`；按前端 14.36 分类为非阻塞性能 / 兼容提示，当前未阻塞预览或保存 |
| 保存是否触发 loading 配对告警 | automator 保存后 `console=[]`，data `saveState=saved`，未见保存态回退；DevTools 预览态限制仍保留，不写真机相册通过 |

##### 13.16.48.4 当前结论与下一步责任

`PR-QA-SHARE-FLOW-CONSOLE-CLEANUP-023-RETEST` 结论：`仍退回前端 024 / 非阻塞 canvas warning 残留待后续`。

- 可确认的局部修复：指定 ready dual_flow 页面打开和保存点击均成功；automator 本轮 `console=[]`；本轮可视 Console 当前区域未见 `showLoading 与 hideLoading 必须配对使用 index.ts:793`；保存后 `saveState=saved`，未回退。
- 不能接收为 Console cleanup 通过：可视调试器仍显示 error/warning 计数，且 navigation-bar selector warning 原文仍可见；清空 Console 尝试后仍残留，测试侧无法证明 023 已完全清掉调试器 warning。
- 非阻塞项：canvas 2d 性能 / 兼容提示仍可见，但当前未阻塞页面预览、task PNG 读取或 DevTools 保存态，可按前端 14.36 归入非阻塞 warning，后续排期清理。
- 下一步责任：前端开 `PR-FE-SHARE-FLOW-CONSOLE-CLEANUP-024` 或等效补丁继续处理 navigation-bar selector warning / 调试器计数来源，并给出可清空后复现为 0 的 Console 截图；测试下一轮仍按 13.16.44 先查 Console / Network / storage，再跑保存点击矩阵。接口联调 / 后端当前只需保留 task/PNG 200 样本，不需新增写入。

#### 13.16.49 `PR-QA-SHARE-FLOW-CONSOLE-AND-FIELDS-024-RETEST` 2026-06-17 Console 与回流字段复测

记录时间：2026-06-17。PM 派发 `PR-QA-SHARE-FLOW-CONSOLE-AND-FIELDS-024-RETEST`；前端 `PR-FE-SHARE-FLOW-CONSOLE-AND-FIELDS-024` 已回包：删除 navigation-bar 组合 selector，`share-preview` 在 URL 带 `briefId` 且 brief 可读时从 brief timeline 推导 `photoHighlights`，并新增 `filteredNodeIds`、`visibleNodeIds`、`permissionState` page data。接口联调 3.30 已说明公开 `sessions/live` 仍不返回照片 / 过滤字段，后端/API 024 正在处理正式公开回流合同。本节只更新测试计划和测试证据，不改业务源码、PM 总台账、前端 / UIUX / 后端 / UGC / 接口文档；不得写全链路或上线通过。

##### 13.16.49.1 已读与环境

| 项 | 证据 / 摘要 |
| --- | --- |
| 已读范围 | `AGENTS.md`；测试计划 13.16.48；前端计划 14.37；接口联调计划 3.30；派发队列 `PR-QA-SHARE-FLOW-CONSOLE-AND-FIELDS-024-RETEST` 行 |
| DevTools 重启 | `pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420 -QuitExisting` -> `{"ok":true,"action":"started","port":9420,"cliPid":30852,"owningProcess":6604,"projectPath":"F:\\codexlist\\jiuzhuopanguan"}` |
| storage 安全摘要 | `node -e "const automator=require('miniprogram-automator'); ... token.slice(-8) ..."` -> `{"ok":true,"apiBase":"https://api.pomer.cn/api/v1","profileId":"user-1781583974510-1a52e6","tokenTail":"4afb1b00","tokenPresent":true}`；未输出完整 token |

##### 13.16.49.2 ready dual_flow poster 复测

| 检查项 | 命令原文 | 摘要 | 结论 |
| --- | --- | --- | --- |
| ready poster 打开 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --wait 6000 --data saveState,errorText,readyShareImageUrl,shareTask,photoHighlights,accountingHighlights,keyEvents,shareSummary,ledgerIncluded,taskIncludeLedger,taskLayoutMode` | page `pages/share-poster/index`；query `briefId=brief-1781584503870-25d5edac`、`taskId=share-task-1781687817395-94cf4452`；data `saveState=idle`、`errorText=""`、`readyShareImageUrl=https://api.pomer.cn/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png`、`shareTask.status=ready`、`shareTask.layoutMode=dual_flow`、`shareTask.ledgerIncluded=true`、`photoHighlights=2`、`accountingHighlights=4`、`keyEvents=3`、`ledgerIncluded=true`、`taskLayoutMode=dual_flow`；automator `console=[]` | 前端 024 未破坏 poster data |
| poster Console 截图 | `docs/runtime/pr-qa-share-flow-console-fields-024-poster-console-foreground-20260617.png` | DevTools 重启后可视调试器未展示 13.16.48 的 navigation-bar selector warning 原文；底部仍有 warning 计数 `6`，当前截图未展开 Console 原文；automator `console=[]` | navigation-bar 原文未复现；warning 计数作为非阻塞残留记录，不能等同 0 warning |

##### 13.16.49.3 share-preview 回流字段复测

| 检查项 | 命令原文 | 摘要 | 结论 |
| --- | --- | --- | --- |
| share-preview 打开 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-preview/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T&briefId=brief-1781584503870-25d5edac" --wait 6000 --data photoHighlights,photoHighlightsNotice,accountingHighlights,keyEvents,shareSummary,shareContentFilter,visibleNodes,visibleNodeIds,filteredNodeIds,permissionState` | page `pages/share-preview/index`；query `sessionId=session-1781584503517-c033e9`、`inviteCode=W58G7T`、`briefId=brief-1781584503870-25d5edac`；data `photoHighlights.length=2`、`photoHighlightsNotice=已从成员态 brief timeline 推导 2 条公开照片高光。`、`accountingHighlights.length=4`、`keyEvents.length=3`、`filteredNodeIds.length=4`、`visibleNodeIds.length=5`、`permissionState=""`、`shareContentFilter.allowedNodeIds.length=5`、`shareContentFilter.filteredNodeIds.length=4`；automator `console=[]` | 前端 024 回流字段消费通过；`visibleNodeIds` 为前端等效 ID 推导 |
| share-preview 截图 | `docs/runtime/pr-qa-share-flow-console-fields-024-preview-fields-foreground-20260617.png` | 右侧预览可见照片高光、邀请码、账本高光区；底部调试器 warning 计数 `9`，当前截图未展开 warning 原文 | 页面展示和 data 通过；仍不写全链路通过 |

##### 13.16.49.4 Network / API 摘要

| 请求 | 摘要 | 判定 |
| --- | --- | --- |
| `GET https://api.pomer.cn/api/v1/session-briefs/brief-1781584503870-25d5edac` | tokenTail `4afb1b00`；HTTP 200；code 0；message ok；`timelineNodeCount=9`、`accountingHighlightsLength=4`、`filteredNodeIdsLength=4` | brief 可读，前端可据此推导照片和过滤字段 |
| `GET https://api.pomer.cn/api/v1/sessions/live?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T` | HTTP 200；code 0；message ok；`joinedCount=3`；`hasPhotoHighlights=false`、`hasShareContentFilter=false`、`hasFilteredNodeIds=false` | 符合接口 3.30：公开 live 合同仍缺照片 / 过滤字段，后端/API 024 待补正式公开合同 |
| `GET https://api.pomer.cn/api/v1/share-image-tasks/share-task-1781687817395-94cf4452` | tokenTail `4afb1b00`；HTTP 200；code 0；message ok；`dataStatus=ready`、`ledgerIncluded=true`、`layoutMode=dual_flow`、`hasImageUrl=true` | ready task 可读 |
| `GET https://api.pomer.cn/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png` | HTTP 200；content-type `image/png` | PNG 可读 |

##### 13.16.49.5 当前结论与下一步责任

`PR-QA-SHARE-FLOW-CONSOLE-AND-FIELDS-024-RETEST` 结论：`前端 024 通过 / 后端合同待 024 / 非阻塞 warning 残留`。

- 前端 024 通过范围：DevTools 重启后 ready poster 和 share-preview 均可打开；automator Console 均为 `[]`；13.16.48 记录的 navigation-bar selector warning 原文未在本轮可视截图复现；share-preview 已得到 `photoHighlights=2`、`filteredNodeIds=4`、`visibleNodeIds=5`、`shareContentFilter` 和 `permissionState` page data。
- 后端合同待 024：Network 证明公开 `sessions/live` HTTP 200 但仍无 `photoHighlights/shareContentFilter/filteredNodeIds`，当前 share-preview 字段来自成员态 brief 兜底；正式公开回流合同仍等后端/API 024。
- 非阻塞 warning 残留：可视调试器底部仍有 warning 计数 `6` / `9`，当前未展开原文；未阻塞预览、字段消费、task/PNG 读取。canvas 2d 旧接口提示如仍存在，按 14.37 / 3.30 继续归为非阻塞性能 / 兼容提示。
- 下一步责任：后端/API 024 补公开回流字段合同；前端在后端合同回包后移除或降级 brief 兜底依赖并复测；测试下一轮按 13.16.44 继续先查 Console / Network / storage，再跑回流矩阵。不得写上线通过。

#### 13.16.50 `PR-QA-SHARE-FLOW-DATA-BOUNDARY-COPY-026-RETEST` 2026-06-17 数据边界与用户文案待测矩阵

记录时间：2026-06-17。PM 预派 `PR-QA-SHARE-FLOW-DATA-BOUNDARY-COPY-026-RETEST`；前端 `PR-FE-SHARE-FLOW-DATA-BOUNDARY-COPY-026` 当前仅在派发队列中，尚未回包。本节只登记待测矩阵与准入条件，不执行旧版本复测，不截图，不写通过；不改业务源码、PM 总台账或其他角色文档。

##### 13.16.50.1 准入条件

开始执行本矩阵前，必须同时满足：

| 条件 | 要求 | 未满足时测试动作 |
| --- | --- | --- |
| 前端 026 最终回包 | 前端给出 `PR-FE-SHARE-FLOW-DATA-BOUNDARY-COPY-026` 完成记录、改动文件、selector / data 保留说明、验证命令和目标 diff check | 只保持待测，不跑旧版本 |
| 用户可见文案净化 | 前端说明哪些页面 / 组件已清理 raw 工程文案，不删除测试需要的 page data | 未说明则标待补说明 |
| data 保留 | `permissionState/filteredNodeIds/visibleNodeIds/shareContentFilter/photoHighlights/accountingHighlights/keyEvents` 仍在 page data 或等效 data 中可取 | 若为净化 UI 删除 data，复测时退回前端 |
| DevTools 工具链 | 9420 自动化端口可用；如 `wechat:auto` 超时，先登记工具链阻塞，不判业务失败 | 待工具链恢复 |
| 证据边界 | 只允许记录 storage token 后 8 位，不输出完整 token；不得写真机通过或上线通过 | 证据不合规需重取 |

##### 13.16.50.2 待测页面与命令模板

以下命令仅为前端 026 回包后的待执行模板，本节未执行：

| 用例 | 页面 / selector | 待执行命令模板 | 必填证据 | 当前状态 |
| --- | --- | --- | --- | --- |
| `PR-QA-SHARE-026-001` ready poster 用户文案净化 | `/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452` | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --wait 6000 --data saveState,errorText,readyShareImageUrl,shareTask,photoHighlights,accountingHighlights,keyEvents,shareSummary,ledgerIncluded,taskLayoutMode,permissionState,filteredNodeIds,visibleNodeIds,shareContentFilter` | 截图 `docs/runtime/pr-qa-share-flow-data-boundary-copy-026-poster-ready-<build>-20260617.png`；page/query/data；Console/Network/storage token 后 8 位 | 待前端 026 回包 |
| `PR-QA-SHARE-026-002` share-preview 回流用户文案净化 | `/pages/share-preview/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T&briefId=brief-1781584503870-25d5edac` | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-preview/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T&briefId=brief-1781584503870-25d5edac" --wait 6000 --data photoHighlights,photoHighlightsNotice,accountingHighlights,keyEvents,shareSummary,shareContentFilter,visibleNodeIds,filteredNodeIds,permissionState` | 截图 `docs/runtime/pr-qa-share-flow-data-boundary-copy-026-preview-return-<build>-20260617.png`；page/query/data；Console/Network/storage token 后 8 位 | 待前端 026 回包 |
| `PR-QA-SHARE-026-003` failed / retry 用户文案净化 | 首选 `/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781584504132-3251bd01`；若前端 026 回包指定新 failed 样本，以前端回包样本为准 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781584504132-3251bd01" --wait 6000 --data saveState,errorText,shareTask,photoHighlights,accountingHighlights,keyEvents,permissionState,filteredNodeIds,visibleNodeIds,shareContentFilter`；重试按钮 selector 待前端回包确认 | 截图 `docs/runtime/pr-qa-share-flow-data-boundary-copy-026-failed-retry-<build>-20260617.png`；失败态 UI 文案；真实 data；Console/Network/storage token 后 8 位 | 待前端 026 回包 |

##### 13.16.50.3 用户界面禁止出现的内部文字

前端 026 回包后，截图中任何用户可见区域出现以下文字或等效工程表达，均不得写通过，按退回前端处理：

| 类别 | 禁止出现 |
| --- | --- |
| 内部字段名 | `permissionState`、`filteredNodeIds`、`visibleNodeIds`、`shareContentFilter`、`briefId`、`taskId`、`sessionId`、`errorText`、`failedReason` |
| raw ID / 参数 | `session-`、`task-`、`brief-`、`moment-`、`event-`、`report-`、`inviteCode=`、`permissionState=public` |
| 接口 / 调试话术 | `接口未返回`、`字段接入`、`debug`、`brief`、`live`、`API`、`contract`、`fallback`、`timeline nodes` |
| raw 错误 | `not session member`、`share task has no visible nodes`、`unauthorized`、`ERR_CONNECTION_REFUSED`、HTTP 状态裸露 |
| 仅测试说明外露 | `filtered`、`visible nodes`、`permission public` 等用户无法理解的测试/UGC 字段描述 |

允许的用户文案必须是产品化表达，例如“只展示已公开的照片”“部分内容仅参与者可见”“分享图生成失败，请稍后重试”，不得暴露接口、字段、ID 或调试来源。

##### 13.16.50.4 data 保留与失败判据

| 检查项 | 通过条件 | 退回条件 |
| --- | --- | --- |
| UI 文案净化 | 用户可见区域无 13.16.50.3 中的内部文字；失败态使用产品化提示 | 任一内部字段、raw ID、raw 错误、接口/debug 话术出现在用户可见 UI |
| page data 保留 | `permissionState/filteredNodeIds/visibleNodeIds/shareContentFilter/photoHighlights/accountingHighlights/keyEvents` 可由 automator data 读取，或前端提供等效 data 名称 | 为净化 UI 删除测试/UGC 所需 data |
| ready poster | 照片、账本、关键事件、保存主按钮仍可见；无工程文字破界 | poster 空壳、保存按钮不可用、或展示 task/brief/session raw ID |
| share-preview | 照片高光 + 聚会账本共同展示；权限/过滤说明为用户语言；data 中保留过滤字段 | 页面展示“接口未返回”“字段接入”“filteredNodeIds”等工程话术 |
| failed / retry | 失败原因转为用户语言，重试入口可见；data 仍可记录真实 `shareTask.status/failedReason/errorText` 摘要 | UI 裸露 `share task has no visible nodes`、`not session member` 或 HTTP / API 原文 |
| Console / Network / storage | Console 无阻塞红错；Network 摘要覆盖 brief/live/task/PNG 或前端回包要求；storage 只写 token 后 8 位 | Console 阻塞错误、Network 401/403 未产品化处理、完整 token 泄露 |

##### 13.16.50.5 当前回报给 PM

`PR-QA-SHARE-FLOW-DATA-BOUNDARY-COPY-026-RETEST` 当前状态：`待测矩阵已登记 / 等前端 026 回包 / 未执行旧版本复测 / 不代表通过`。前端 026 回包后，测试按本节矩阵先查 Console / Network / storage，再跑 ready poster、share-preview、failed / retry，并记录截图、page/query/data、Console 原文/计数、Network/API 摘要和退回对象。不得写真机通过或上线通过。

#### 13.16.51 `PR-QA-SHARE-PREVIEW-P0-UNREADABLE-027-RETEST` 2026-06-17 P0 不可读待测门禁

记录时间：2026-06-17。PM 追加测试门禁：暂停执行旧版本 `PR-QA-SHARE-FLOW-DATA-BOUNDARY-COPY-026-RETEST`，等待前端 `PR-FE-SHARE-PREVIEW-P0-UNREADABLE-027` 回包后，再把 026 文案净化矩阵与 027 版式 P0 修复合并复测。本节只登记待测与暂停说明，不执行旧版本复测，不截图，不写通过；不改业务源码、PM 总台账或其他角色文档。

##### 13.16.51.1 用户截图证据与暂停原因

| 项 | 记录 |
| --- | --- |
| 用户截图证据 | `C:/Users/Administrator/AppData/Local/Temp/codex-clipboard-2ef46f4c-601d-44dc-af60-950f04448529.png` |
| 当前 P0 问题 | 分享预览图不可读：空白照片块、大面积留白、账本下沉、时间线截断、底部安全区遮挡、英文 `dual_flow` 和旧“酒局”文案可见 |
| 测试门禁 | 026 文案净化复测必须等待 027 版式 P0 修复后一起执行；前端 027 回包前不得对旧图截图、不得复测旧版本、不得写通过 |
| 责任依赖 | 前端 `PR-FE-SHARE-PREVIEW-P0-UNREADABLE-027` 先修分享预览图首屏可读性；测试收到前端 027 回包后再执行 13.16.50 + 13.16.51 合并矩阵 |

##### 13.16.51.2 027 待测矩阵

以下命令仅为前端 027 最终回包后的待执行模板，本节未执行：

| 用例 | 页面 / 样本 | 待执行命令模板 | 必填证据 | 当前状态 |
| --- | --- | --- | --- | --- |
| `PR-QA-SHARE-027-001` ready dual_flow 预览图首屏可读 | `/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452` | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --wait 6000 --data photoHighlights,accountingHighlights,keyEvents,readyShareImageUrl,saveState,shareTask,taskLayoutMode,permissionState,filteredNodeIds,visibleNodeIds,shareContentFilter` | 390x844 右侧预览框截图 `docs/runtime/pr-qa-share-preview-p0-unreadable-027-ready-dual-flow-390x844-<build>-20260617.png`；page/query/data；storage token 后 8 位；Console/Network 摘要 | 待前端 027 回包 |
| `PR-QA-SHARE-027-002` 保存态与安全区 | 同 ready dual_flow 页面，点击 `.poster-primary-action` 一次 | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --selector .poster-primary-action --wait 4000 --data saveState,errorText,posterImagePath,readyShareImageUrl,shareTask,photoHighlights,accountingHighlights,keyEvents,taskLayoutMode` | 保存后 390x844 截图；保存/隐私提示不被底部安全区遮挡；DevTools 保存态限制说明 | 待前端 027 回包 |
| `PR-QA-SHARE-027-003` 026 文案净化合并检查 | 同 ready dual_flow 页面，结合 13.16.50 禁止项 | 沿用 `PR-QA-SHARE-026-001` data 模板 | 同一截图中同步检查 raw 字段/ID/状态是否外露；data 不得被删 | 待前端 027 回包 |

##### 13.16.51.3 390x844 首屏截图验收点

前端 027 回包后，截图必须覆盖微信开发者工具右侧预览框 390x844 首屏，并满足：

| 区域 | 通过条件 | 退回条件 |
| --- | --- | --- |
| 标题 | 聚会记录主题清晰、无旧“酒局时间线简报”等旧文案抢主视觉 | 旧“酒局”主标题 / 旧战报文案仍可见 |
| 照片 / 空态 | 有真实照片高光或产品化轻量空态；占位尺寸受控，不形成空白大坑 | 空白大照片块、照片区域大面积无信息留白 |
| 账本高光 | 聚会账本 / 酒桌记账高光在首屏可读，不能下沉到不可见区域 | 账本整体下沉或只露标题 / 边角 |
| 时间线 | 至少 1-2 条时间线 / 关键事件完整可见，文字方向和宽度正常 | 时间线只露半截、文字竖排挤压、卡片被截断 |
| 保存 / 隐私提示 | 保存主按钮、保存状态或隐私提示处于安全区内，不被底部遮挡 | 底部安全区遮挡按钮 / 提示，或保存入口不可达 |
| 信息密度 | 首屏不出现大面积无信息留白；照片、账本、时间线、保存提示形成清晰层级 | 首屏被装饰、空态、留白占据，核心内容不可读 |

##### 13.16.51.4 禁止项

前端 027 回包后，截图中任一用户可见区域出现以下内容，均按 P0/P1 退回，且不得写通过：

| 类别 | 禁止出现 |
| --- | --- |
| 旧 / 内部状态 | 英文 `dual_flow`、旧“酒局时间线简报”、raw `ready` / `failed` 状态、内部 task 状态徽标 |
| 版式不可读 | 空白大照片坑、大面积无信息留白、底部遮挡、时间线只露半截、关键事件文字竖排挤压 |
| 内部字段 / ID | `permissionState`、`filteredNodeIds`、`visibleNodeIds`、`shareContentFilter`、`briefId`、`taskId`、`sessionId`、`session-`、`task-`、`brief-`、`moment-`、`event-` |
| raw 错误 / 工程话术 | `not session member`、`share task has no visible nodes`、`接口未返回`、`字段接入`、`debug`、`brief`、`live`、`API`、HTTP 状态裸露 |

##### 13.16.51.5 data / Console / Network 证据要求

前端 027 回包后，复测仍需记录：

| 证据项 | 要求 |
| --- | --- |
| page data | 至少记录 `photoHighlights/accountingHighlights/keyEvents/readyShareImageUrl/saveState/shareTask/taskLayoutMode`；合并 026 时继续记录 `permissionState/filteredNodeIds/visibleNodeIds/shareContentFilter` |
| storage | API base、profile 摘要、token 只写后 8 位；不得输出完整 token |
| Console | 记录 Console 原文/计数；阻塞红错退回前端；非阻塞 canvas 2d 性能提示可单独登记 |
| Network/API | 记录 brief / live / task / PNG 摘要；区分前端消费问题、公开 live 合同缺口和接口不可读 |
| 截图 | 必须是 390x844 右侧预览框有效截图；黑图、裁切错位、只截工具栏、或不能判断首屏内容的截图不得作为通过证据 |

##### 13.16.51.6 当前回报给 PM

`PR-QA-SHARE-PREVIEW-P0-UNREADABLE-027-RETEST` 当前状态：`待测矩阵已登记 / 026 旧版本复测暂停 / 等前端 027 回包 / 未截图 / 不代表通过`。前端 027 回包后，测试先按 13.16.44 调试器优先门禁检查 Console / Network / storage，再合并执行 13.16.50 文案净化与 13.16.51 版式 P0 可读性矩阵；不得写真机通过或上线通过。

#### 13.16.52 `PR-QA-SHARE-GENERATED-IMAGE-UI-MISMATCH-028-RETEST` 2026-06-17 分享生图 UI 不一致 P0 待测门禁

记录时间：2026-06-17。PM 预派 `PR-QA-SHARE-GENERATED-IMAGE-UI-MISMATCH-028-RETEST`。用户新截图已确认分享生图仍未按 UI 015 / 020 输出；旧 026 / 027 图不得继续写通过。本节只更新测试计划和执行记录，不改业务源码、不改 PM 总台账；当前 UIUX 028 红线、前端 028、接口/后端 028 均未最终回包，测试不得提前复测旧版本、不得截图旧图、不得写通过。

##### 13.16.52.1 读取与依赖状态

| 项 | 当前记录 |
| --- | --- |
| 已读范围 | `AGENTS.md`；测试计划 13.16.50 / 13.16.51；PM 队列 028 行；UIUX / 前端 / 接口 / 后端 028 关键词检索 |
| 用户新截图 | PM 队列记录为 `C:/Users/Administrator/AppData/Local/Temp/codex-clipboard-c8f3c956-7144-4296-9787-68459be27cb9.png` |
| UIUX 028 | 队列 `PR-UX-SHARE-GENERATED-IMAGE-UI-MISMATCH-028-REDLINE` 为 `sent`，尚未见最终红线回包；测试等待红线后再跑 |
| 前端 028 | 队列 `PR-FE-SHARE-GENERATED-IMAGE-UI-MISMATCH-028` 为 `sent`，尚未见最终实现回包；测试等待前端提交实际 `posterImagePath` / 可保存文件证据和 390x844 预览截图 |
| 接口联调 028 | 队列 `PR-INT-SHARE-GENERATED-PNG-SOURCE-028` 为 `sent`，尚未见来源定位回包；测试等待 PNG 来源、HTTP 头、尺寸、hash / mtime、task 字段摘要 |
| 后端/API 028 | 队列 `PR-BE-SHARE-GENERATED-PNG-RENDERER-028` 为条件派工，需接口/前端确认责任后再处理；测试不预判责任 |
| 当前门禁 | 旧 026 / 027 不得继续写通过；必须等上述 028 证据齐后，按本节矩阵复测真实分享生图 |

##### 13.16.52.2 028 复测准入条件

开始执行前必须同时满足：

| 条件 | 必需证据 | 未满足时动作 |
| --- | --- | --- |
| UIUX 028 红线 | UIUX 明确 015 / 020 对照红线、退回码、是否需要新资产；若不需新资产需写明沿用哪些规格 | 保持待复核，不跑旧图 |
| 前端 028 回包 | 前端给出实际保存 / 生成图路径或文件、390x844 右侧预览截图、改动说明、selector / data 保留说明、`typecheck`、`check:encoding`、目标 diff check | 保持待复核，不跑旧图 |
| 接口 / 后端 028 回包 | 接口联调给出 ready PNG 来源定位；如后端渲染器负责，后端/API 给出修复或废弃旧 PNG 的结论 | 来源不明时不得写通过 |
| 真实 PNG 证据 | 必须能获取实际保存 / 生成 PNG 原图或可访问 URL；不能只看页面截图 | 缺 PNG 原图或 URL 时阻塞 |
| 调试器证据 | DevTools 右侧预览 390x844 截图、Console / Network / storage / page data 摘要齐全 | 缺任一关键证据则待复核 |

##### 13.16.52.3 待执行矩阵

以下命令仅为 028 全部回包后的待执行模板，本节未执行：

| 用例 | 目标 | 待执行命令模板 / 证据 | 判定 |
| --- | --- | --- | --- |
| `PR-QA-SHARE-028-001` ready 页面预览 | 打开 ready dual_flow 页面，取 DevTools 右侧预览 390x844 截图 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --wait 6000 --data photoHighlights,accountingHighlights,keyEvents,readyShareImageUrl,saveState,shareTask,taskLayoutMode,posterImagePath,permissionState,filteredNodeIds,visibleNodeIds,shareContentFilter`；截图 `docs/runtime/pr-qa-share-generated-image-ui-mismatch-028-preview-390x844-<build>-20260617.png` | 仅页面截图不足以通过；必须与生成 PNG 一致 |
| `PR-QA-SHARE-028-002` 实际保存 / 生成 PNG 原图 | 点击 `.poster-primary-action` 或前端 028 指定 selector，获取 `posterImagePath`、本地 PNG 文件或可访问 URL | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --selector .poster-primary-action --wait 5000 --data saveState,errorText,posterImagePath,readyShareImageUrl,shareTask,photoHighlights,accountingHighlights,keyEvents,taskLayoutMode`；保存原图命名 `docs/runtime/pr-qa-share-generated-image-ui-mismatch-028-generated-png-original-<taskId>-<build>-20260617.png` 或记录 URL | PNG 原图必须可打开、可读、可与页面预览比对 |
| `PR-QA-SHARE-028-003` PNG 来源一致性 | 比对页面预览、`posterImagePath`、`readyShareImageUrl`、接口 task PNG 来源 | Network/API 摘要需覆盖 `GET /share-image-tasks/share-task-1781687817395-94cf4452`、PNG URL、HTTP 200、content-type、尺寸 / hash / mtime 或接口联调 028 等效摘要 | 若 PNG 与页面预览来源不一致，直接退回并标明责任角色 |
| `PR-QA-SHARE-028-004` 015 / 020 红线扫描 | 按 UIUX 028 红线逐项扫描实际 PNG 原图 + 390x844 页面预览 | 记录逐项结果：照片墙、聚会账本、时间线、总结 / 安全区、标题、隐私 / 保存提示 | 任一 P0 禁止项命中，结论为退回 |
| `PR-QA-SHARE-028-005` Console / storage / data | 记录调试器与数据证据 | storage token 只写后 8 位；Console 原文 / 计数；page data 至少含 `photoHighlights/accountingHighlights/keyEvents/readyShareImageUrl/saveState/shareTask/taskLayoutMode/posterImagePath` | 缺证据不得写预览框阶段通过 |

##### 13.16.52.4 028 禁止项扫描清单

实际生成 PNG 原图和 DevTools 右侧预览均需逐项扫描：

| 类别 | 禁止出现 / 退回条件 |
| --- | --- |
| 旧框架 | 旧红色战报壳、旧战报卡片结构、旧“酒局”文案、旧“酒局时间线简报” |
| 版式不可读 | 空白照片洞、大面积无信息留白、账本下沉、时间线截断、安全区截断、底部遮挡、关键内容被系统区域压住 |
| 内部 / 英文状态 | 英文 `dual_flow`、raw `ready/failed`、内部样本名、`IT-MOMENTS`、`PR Seed Host`、`PR Seed Member A` 等样本身份外露 |
| 内部字段 / ID | `briefId`、`taskId`、`sessionId`、`permissionState`、`filteredNodeIds`、`visibleNodeIds`、`shareContentFilter`、`session-`、`task-`、`brief-`、`moment-`、`event-` |
| 接口 / debug 话术 | `接口未返回`、`字段接入`、`debug`、`brief/live` 工程话术、HTTP 状态裸露、`not session member`、`share task has no visible nodes` |
| 双主线缺失 | 只有照片无账本、只有账本无照片 / 合规空态、无 1-2 条关键事件或时间线 |

##### 13.16.52.5 PNG 与页面预览来源不一致退回规则

| 现象 | 退回对象 |
| --- | --- |
| 页面预览已修，但实际保存 PNG 仍是旧红色战报壳 / 旧文案 / 大留白 | 前端 028；若保存逻辑仍选择旧 backend ready PNG，同时抄送接口联调 028 定位 |
| `readyShareImageUrl` 后端 PNG 仍旧，但前端保存图已使用新 canvas 且用户实际保存为新图 | 接口联调 / 后端 028 继续处理 ready PNG 来源；前端可局部通过但不得写全链路通过 |
| 页面预览与生成 PNG 内容、尺寸、字段来源不一致，无法解释来源 | 退回前端 + 接口联调共同定位 |
| PNG URL 404 / 非 image/png / hash 与接口联调 028 不一致 | 退回接口联调 / 后端/API；前端不得用不可读 PNG 写通过 |

##### 13.16.52.6 当前回报给 PM

`PR-QA-SHARE-GENERATED-IMAGE-UI-MISMATCH-028-RETEST` 当前状态：`待测门禁已登记 / 等 UIUX 028 红线、前端 028、接口/后端 028 回包 / 旧 026/027 不再写通过 / 未执行旧图复测`。后续结论只能写“预览框阶段通过 / 退回 / 待复核”，不得写真机通过或上线通过。

#### 13.16.53 `PR-QA-SHARE-GENERATED-IMAGE-029-SPLIT-RETEST` 2026-06-17 分享生图拆分复测

记录时间：2026-06-17。PM 追加拆分复测 `PR-QA-SHARE-GENERATED-IMAGE-029-SPLIT-RETEST`。本节只更新测试计划和测试证据，不改业务源码、不改 PM 总台账、不改前端 / UIUX / 接口 / 后端文档；结论不得写真机通过、上线通过或提交审核通过。

##### 13.16.53.1 精读范围与准入结论

| 来源 | 读取结论 |
| --- | --- |
| 测试计划 13.16.52 | 028 门禁要求必须拿到实际保存 / 生成 PNG 原图或可访问 URL；只看页面截图不得通过。 |
| 前端 14.43 | 前端已改为 canvas 保存图，不再把旧 `readyShareImageUrl` 当最终保存图；但 DevTools 点击 `.poster-primary-action` 64 秒超时，未取得 `posterImagePath` 或 PNG 原图。 |
| 接口联调 3.31 | 线上 `share-task-1781687817395-94cf4452.png` 本体确认仍是后端旧模板旧图；`readyShareImageUrl` 预览来源是后端 PNG，真实保存按钮理论上走前端 canvas。 |
| UIUX 12.7.23 | 生成 PNG / 保存图 P0 退回；现有 015 / 020 资产足够，需按 6 个 028 P0 退回码逐项扫图。 |
| PM 队列 029 行 | A 线可先测前端 canvas 保存图；B 线等后端/API 029 与 DBA/运维发布后再拉取 ready PNG 原图复测。 |

##### 13.16.53.2 A 线：前端 canvas 保存图复核

| 步骤 | 命令 / 证据 | 结果 |
| --- | --- | --- |
| 自动化端口 | `pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420` | 返回 `{"ok":true,"action":"already-listening","port":9420,"owningProcess":6604,"projectPath":"F:\\codexlist\\jiuzhuopanguan"}`。 |
| 首次 relaunch | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --wait 6000 --storage --data posterImagePath,saveState,readyShareImageUrl,photoHighlights,accountingHighlights,keyEvents,displayTaskLayoutMode,displayTaskStatus,shareTask,taskLayoutMode,errorText --output docs/runtime/pr-qa-share-generated-image-029-split-a-before-save-20260617.png` | 当前真实登录态不是 015 样本成员，token 后 8 位为 `02692d3e`；页面退到权限失败态：`saveState=failed`、`shareTask.status=failed`、`errorText=当前账号暂不能查看这张分享页，请使用邀请入口加入聚会`。该次不作为 A 线有效复核；截图保留为权限反例。 |
| 成员态 storage 注入 | 按接口联调 3.28 host 方案读取服务器私密 token 并写入 DevTools storage；本地临时脚本仅输出安全摘要，执行后已删除 | 第一次临时脚本因 SSH stdin 传递方式卡住，失败原文：`command timed out after 124038 milliseconds`。修正后注入成功，安全摘要：`apiBase=https://api.pomer.cn/api/v1`、`profileId=user-1781583974510-1a52e6`、token 后 8 位 `4afb1b00`。 |
| 成员态 ready 页面 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --wait 6000 --data posterImagePath,saveState,readyShareImageUrl,photoHighlights,accountingHighlights,keyEvents,displayTaskLayoutMode,displayTaskStatus,shareTask,taskLayoutMode,errorText --output docs/runtime/pr-qa-share-generated-image-029-split-a-member-before-save-20260617.png` | `summary.page=pages/share-poster/index`，query 为指定 `briefId/taskId`；`photoHighlights.length=2`，`accountingHighlights.length=4`，`keyEvents.length=3`，`displayTaskLayoutMode=照片和账本`，`displayTaskStatus=可保存`，`saveState=idle`，`posterImagePath=""`，`readyShareImageUrl=https://api.pomer.cn/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png`，`shareTask.status=ready`，`shareTask.layoutMode=dual_flow`，`shareTask.ledgerIncluded=true`，`selectedNodeIds.length=5`，Console `[]`。截图：`docs/runtime/pr-qa-share-generated-image-029-split-a-member-before-save-20260617.png`。 |
| 保存点击 | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --selector .poster-primary-action --wait 8000 --data posterImagePath,saveState,readyShareImageUrl,photoHighlights,accountingHighlights,keyEvents,displayTaskLayoutMode,displayTaskStatus,shareTask,taskLayoutMode,errorText --output docs/runtime/pr-qa-share-generated-image-029-split-a-save-click-20260617.png` | 失败原文：`command timed out after 134028 milliseconds`；未生成 `docs/runtime/pr-qa-share-generated-image-029-split-a-save-click-20260617.png`，未取得 `posterImagePath` 或 PNG 原图。 |
| 保存后 status | `npm.cmd --% run wechat:auto -- status --port 9420 --data posterImagePath,saveState,readyShareImageUrl,photoHighlights,accountingHighlights,keyEvents,displayTaskLayoutMode,displayTaskStatus,shareTask,taskLayoutMode,errorText --output docs/runtime/pr-qa-share-generated-image-029-split-a-after-timeout-status-20260617.png` | 命令返回成功，但当前页已变为 `pages/index/index`，query `{}`，未返回分享页 data；Console `[]`。截图：`docs/runtime/pr-qa-share-generated-image-029-split-a-after-timeout-status-20260617.png`。 |
| 右侧预览框截图 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs\runtime\pr-qa-share-generated-image-029-split-a-after-timeout-preview-20260617.png` | 返回 `ok=true`，截图尺寸 `410x1032`，路径 `docs/runtime/pr-qa-share-generated-image-029-split-a-after-timeout-preview-20260617.png`；目检为首页，不是生成 PNG 原图。 |

##### 13.16.53.3 A 线判定与退回对象

| 项 | 判定 |
| --- | --- |
| 页面数据前置 | 成员态 ready 页面已可读取照片 + 聚会账本 + 关键事件，Console 为空；这只证明保存前页面 data 前置成立。 |
| 保存图产物 | 点击 `.poster-primary-action` 后仍超时，未取得 `posterImagePath`、未取得前端 canvas PNG 原图，且 status 回到首页；不能写前端 canvas 保存图局部通过。 |
| 禁止项扫描 | 因没有实际保存 PNG 原图，无法按 UIUX 12.7.23 的 6 个 P0 退回码完成保存图扫描；保存前页面截图里照片区仍可见空白占位，不能替代 PNG 原图通过。 |
| 结论 | A 线 `退回前端 029/后续修复`：需前端修复 DevTools / 预览态保存点击卡住或提供可复跑的 `posterImagePath` 取证路径，并交付真实 PNG 原图后再复测。 |

##### 13.16.53.4 B 线：后端 ready PNG 待测登记

| 项 | 当前记录 |
| --- | --- |
| 当前 URL | `https://api.pomer.cn/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png`。 |
| 本轮只读 API 摘要 | `curl.exe -sS -D - -o NUL https://api.pomer.cn/uploads/moments/share-tasks/share-task-1781687817395-94cf4452.png` 返回 HTTP `200`、`Content-Type: image/png`、`ETag: W/"121623-19ed4de95aa.991"`、`Last-Modified: Wed, 17 Jun 2026 09:16:57 GMT`。 |
| 接口联调 3.31 结论 | 该 ready PNG 本体已确认为后端旧模板旧图，不是缓存误读，也不是拿错 task。 |
| 待测条件 | 等后端/API `PR-BE-SHARE-GENERATED-PNG-RENDERER-029-CONFIRMED` 实修 renderer，并由 DBA/运维发布到 `api.pomer.cn` 后，再拉取 ready PNG URL，记录 HTTP 头、尺寸 / hash、PNG 原图，并按 UIUX 12.7.23 的 6 个 P0 退回码逐项检查。 |
| B 线结论 | `待后端/API 029 + DBA/运维发布后复测`；未发布前 ready PNG 必然不通过，不能因 A 线页面 data 前置成立写分享生图全链路通过。 |

##### 13.16.53.5 当前回报给 PM

`PR-QA-SHARE-GENERATED-IMAGE-029-SPLIT-RETEST` 当前状态：`A 线退回前端 / B 线待后端发布 / 不代表预览框阶段通过 / 不代表真机或上线通过`。下一步：前端需修复 `.poster-primary-action` 保存点击超时并提供可取证的 `posterImagePath` / PNG 原图；后端/API 029 需实修并发布 ready PNG renderer，DBA/运维发布后测试再按 13.16.53.4 拉取 PNG 原图复测。

#### 13.16.54 `PR-QA-CLEAN-SLATE-001` 2026-06-18 Clean Slate 准出矩阵

记录时间：2026-06-18。PM 已发布 `docs/party-recorder-clean-slate-reset-plan.md`，用户要求重新建立“聚会记录师”并清空旧项目污染。本节只更新测试计划和准出规则，不改业务源码、不改 PM 总台账、不替前端 / UIUX / 后端 / 后台 / 接口 / 运维标完成；旧壳截图、旧样本、旧分享图和旧测试残留从本节起不得继续作为新版通过证据。

##### 13.16.54.1 Clean Slate 测试准入

| 准入项 | 必须证据 | 不满足时结论 |
| --- | --- | --- |
| 前端清单 | 前端 `PR-FE-CLEAN-SLATE-001` 提交 clean app route manifest、旧页面 / 组件 / 资产引用扫描、重建页面清单 | `待清空 / 待复核`，不得跑旧壳准出 |
| UI/UX 基线 | UI/UX `PR-UX-CLEAN-SLATE-001` 以 Figma `聚会记录师 全流程原型 初始构思` 给出页面和分享图规格 | 分享页 / 保存图只能写待设计复核 |
| 接口与样本 | 后端/API、接口联调给出新 parties / photos / ledger / brief / share 合同和新 fixture manifest | 不得沿用旧 `judge/report/share` 样本写通过 |
| 后台与数据 | 后台、DBA/运维给出旧后台入口、旧数据、旧 generated 图片备份 / 清理 / 回滚证据 | 不得写旧后台污染已清 |
| 预览工具 | 微信开发者工具 9420 端口可用，automator 可取 page/data/Console；右侧预览截图脚本可用 | 记录工具链阻塞，不判业务失败 |

##### 13.16.54.2 P0 核心链路矩阵

| 用例 | 覆盖链路 | 页面 / 入口 | 预览框证据 | 关键 data / Network / storage | 失败规则 |
| --- | --- | --- | --- | --- | --- |
| `PR-QA-CS-001` 三步创建 | 首页创建 -> 填最小信息 -> 创建成功 -> 进入聚会 | `pages/index/index`、新创建页、聚会现场页 | 390x844 右侧预览框连续截图或 automator step 截图：`docs/runtime/pr-qa-clean-slate-001-create-step-<n>-20260618.png` | `sessionId/inviteCode/createState`；`POST /sessions` 或新 parties API；storage token 后 8 位 | 超过三步、跳旧路由、出现旧词或旧玩法入口即退回 |
| `PR-QA-CS-002` 邀请 | 创建后邀请好友 / 口令 / 分享入口 | 新邀请页或弹层 | 邀请口令 / 二维码 / 分享提示截图 | `inviteCode/sharePath/sessionId`；Network 200；Console 无阻塞红错 | 跳旧 `judge` / `result-report` / 旧分享壳，或文案含旧项目词即退回 |
| `PR-QA-CS-003` 拍照记录 | 聚会现场拍第一张 -> 记录进入照片墙 / 时间线 | 新现场记录页、照片墙 / 相册入口 | 拍照入口、上传态、照片落地、空态 / 有图态截图 | `photoHighlights/moments/photoCount/uploadState`；upload / moments API；storage token 后 8 位 | 照片入口不可达、旧惩罚 / 裁判入口抢主视觉、照片只进旧时间线不进相册即退回 |
| `PR-QA-CS-004` 聚会账本 | 账本入口可见 -> 新增 / 查看账本 -> 与照片并存 | 新聚会账本页或现场页账本模块 | 账本入口、记录态、与照片同屏或同简报截图 | `ledgerEntries/accountingHighlights/settlementSummary`；ledger API；Console 摘要 | 账本消失、只剩拍照、账本被旧欠酒玩法长列表替代即退回 |
| `PR-QA-CS-005` 自动简报 | 聚会记录 -> 自动简报聚合照片 + 账本 + 关键事件 | 新 brief 页面 | 简报首屏截图，必须同时有照片 / 账本 / 关键事件 | `briefId/photoHighlights/accountingHighlights/keyEvents/shareSummary`；brief API 200 | 简报为空壳、只显示旧战报 / 排行长列表、缺照片或缺账本即退回 |
| `PR-QA-CS-006` 保存分享图 | 简报 -> 分享页 -> 保存分享图 / 生成 PNG | 新分享页 / 保存图页 | 390x844 短屏强视觉截图 + 实际保存 / 生成 PNG 原图或 URL | `posterImagePath/saveState/readyShareImageUrl/shareTask.status`；PNG HTTP 头、尺寸 / hash；storage token 后 8 位 | 无 PNG 原图、旧红色战报壳、旧长列表、工程字段、保存按钮不可用即 P0 退回 |
| `PR-QA-CS-007` 分享回流 | 分享链接 / 邀请预览 -> 局外 / 成员可见范围 | 新 share preview 页面 | 回流页首屏截图；未加入 / 已加入 / 权限提示截图 | `permissionState/shareContentFilter/visibleNodeIds/photoHighlights/accountingHighlights/keyEvents`；live / brief API | raw 权限字段外露、局外可见范围不符、旧文案或旧路由即退回 |
| `PR-QA-CS-008` 相册沉淀 | 聚会结束 / 返回首页 -> 相册 / 历史记录可继续查看 | 新相册页 / 聚会详情页 | 首页最近相册、相册列表、相册详情截图 | `albumItems/sessionReturn/photoCount/briefId`；album / moments API | 旧 `wine-history` 外壳、相册为空但记录已上传、返回断链即退回 |

##### 13.16.54.3 分享页 / 保存分享图 P0 准出规则

| 项 | 必须满足 | 退回条件 |
| --- | --- | --- |
| 短屏强视觉 | 390x844 首屏内必须看见标题、照片高光、聚会账本高光、1-2 条关键事件或摘要、保存 / 分享主按钮、隐私 / 可见范围提示 | 旧战报长列表、内容下沉、时间线被安全区截断、大面积无信息留白 |
| 照片 + 账本并存 | 页面预览和实际保存 / 生成 PNG 都必须同时呈现照片记录与聚会账本；允许合规空态，但空态必须短、清楚、可解释 | 只有照片无账本、只有账本无照片 / 合规空态、照片区空白大坑 |
| 可保存 / 可分享 | `.poster-primary-action` 或新版 selector 可点击，`saveState` 明确，成功 / 失败 / 重试状态可见；必须能拿到 `posterImagePath`、PNG 原图或可访问 URL | 点击超时、只有 DevTools 占位路径、无 PNG 原图、保存失败无重试 |
| 无工程字段 | 用户可见区域不得出现 `briefId/taskId/sessionId`、`permissionState`、`filteredNodeIds`、`visibleNodeIds`、`shareContentFilter`、`dual_flow`、HTTP 状态、debug/API/接口话术 | 任一工程字段或内部样本名外露即退回 |
| 新视觉一致 | 分享页预览、保存图 PNG、分享回流页的主视觉来源一致，不能页面新、PNG 旧 | PNG 与页面预览来源不一致，退回前端 + 接口 / 后端定位 |

##### 13.16.54.4 旧词扫描失败规则

用户可见源码、WXML、LESS、页面 data seed、后台静态页面、可公开分享图文案、资产清单中命中以下旧词，默认 P0 退回：`酒桌判官`、`判官`、`欠酒`、`惩罚`、`战报`、`裁判`、旧“酒局”主品牌 / 主路径文案。历史文档、归档目录、技术迁移说明可豁免，但必须在扫描记录中标注路径和豁免原因。

待执行扫描模板：

```powershell
rg -n "酒桌判官|判官|欠酒|惩罚|战报|裁判|酒局" miniprogram backend/public backend/data docs/design-assets
```

| 命中位置 | 判定 |
| --- | --- |
| `miniprogram/pages`、`miniprogram/components`、`miniprogram/assets` 中用户可见文案 / 资源名 | 退回前端 / UIUX |
| `backend/public/admin` 用户可见菜单、页面标题、按钮、表格列 | 退回后台管理 |
| `backend/data` 默认 seed、模板、分享图 renderer、公开接口 payload 文案 | 退回后端/API |
| `docs/runtime` 旧截图 / 旧错误快照 | 只可归档索引；不得作为新版通过证据 |
| `docs/archive` 或历史计划中的旧词 | 可豁免；不得进入新版 UI / 分享图 / 后台入口 |

##### 13.16.54.5 旧路由 / 旧资产 / 旧后台入口失败规则

| 类型 | 扫描 / 复核点 | 退回条件 |
| --- | --- | --- |
| 旧路由 | `miniprogram/app.json`、页面跳转、tab / 首页入口、分享回流 path | `judge`、`judge-wheel`、`question-bank`、`table-mode`、`wine-history`、`wine-points`、旧 `result-report`、旧 `share-poster/share-preview` 作为用户主路径暴露 |
| 旧资产 | `miniprogram/assets`、`backend/public/uploads`、`backend/public/static`、分享图 renderer 引用 | `report-poster.png`、旧 share 战报底图、旧红色战报壳、旧 generated share task 图片继续用于新版准出 |
| 旧后台入口 | `backend/public/admin/static/heatwave-ops` 菜单、页面标题、action、仪表盘卡片 | 酒局管理、战报中心、今日最欠酒、惩罚 / 裁判配置等旧功能仍作为新版后台主入口 |
| 旧测试夹具 | `backend/scripts`、接口联调 manifest、runtime screenshot | 旧 judge/report/share fixture 继续作为 Clean Slate 核心链路样本 |

##### 13.16.54.6 Automator 命令模板

以下命令是前端 / 接口 / 后端 Clean Slate 回包后的待执行模板；当前未跑旧版本，不写通过。

```powershell
pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420
node -e "const automator=require('miniprogram-automator'); (async()=>{const mp=await automator.connect({wsEndpoint:'ws://127.0.0.1:9420'}); const token=String(await mp.callWxMethod('getStorageSync','jzp-user-token')||''); const apiBase=await mp.callWxMethod('getStorageSync','runtime-api-base'); const profileId=await mp.callWxMethod('getStorageSync','social-current-profile-id'); console.log(JSON.stringify({ok:true,apiBase,profileId,tokenTail:token.slice(-8),tokenPresent:Boolean(token)})); await mp.disconnect();})().catch((e)=>{console.error(JSON.stringify({ok:false,message:e.message}));process.exit(1);})"
npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/index/index" --wait 5000 --data loggedIn,home,sessionReturn,authRedirectUrl --output docs/runtime/pr-qa-clean-slate-001-home-20260618.png
npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/index/index" --selector <new-create-selector> --wait 5000 --data createState,sessionId,inviteCode,errorText --output docs/runtime/pr-qa-clean-slate-001-create-entry-20260618.png
npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "<new-live-or-session-path>?sessionId=<sessionId>" --wait 6000 --data photoHighlights,photoCount,ledgerEntries,accountingHighlights,keyEvents,sessionId --output docs/runtime/pr-qa-clean-slate-001-live-photo-ledger-20260618.png
npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "<new-brief-path>?sessionId=<sessionId>&briefId=<briefId>" --wait 6000 --data photoHighlights,accountingHighlights,keyEvents,shareSummary,saveState,errorText --output docs/runtime/pr-qa-clean-slate-001-brief-20260618.png
npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "<new-share-poster-path>?briefId=<briefId>&taskId=<taskId>" --wait 6000 --data posterImagePath,saveState,readyShareImageUrl,photoHighlights,accountingHighlights,keyEvents,shareTask,errorText --output docs/runtime/pr-qa-clean-slate-001-share-poster-20260618.png
npm.cmd --% run wechat:auto -- tap --port 9420 --path "<new-share-poster-path>?briefId=<briefId>&taskId=<taskId>" --selector <new-save-selector> --wait 8000 --data posterImagePath,saveState,readyShareImageUrl,shareTask,errorText --output docs/runtime/pr-qa-clean-slate-001-share-save-20260618.png
npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "<new-share-preview-path>?sessionId=<sessionId>&inviteCode=<inviteCode>&briefId=<briefId>" --wait 6000 --data permissionState,shareContentFilter,photoHighlights,accountingHighlights,keyEvents,errorText --output docs/runtime/pr-qa-clean-slate-001-share-return-20260618.png
pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs\runtime\pr-qa-clean-slate-001-right-preview-20260618.png
```

##### 13.16.54.7 截图点与证据命名

| 截图点 | 命名规则 | 说明 |
| --- | --- | --- |
| 首页 / 创建入口 | `docs/runtime/pr-qa-clean-slate-001-home-<build>-20260618.png` | 需证明无旧品牌 / 旧玩法入口污染 |
| 三步创建 | `docs/runtime/pr-qa-clean-slate-001-create-step-<1-3>-<build>-20260618.png` | 每步记录 page/query/data；超过三步退回 |
| 邀请 | `docs/runtime/pr-qa-clean-slate-001-invite-<build>-20260618.png` | 记录 inviteCode / sharePath，不能跳旧分享壳 |
| 拍照 + 账本 | `docs/runtime/pr-qa-clean-slate-001-photo-ledger-<build>-20260618.png` | 同屏或同链路证明二者并存 |
| 自动简报 | `docs/runtime/pr-qa-clean-slate-001-brief-<build>-20260618.png` | 必须含照片、账本、关键事件摘要 |
| 分享页首屏 | `docs/runtime/pr-qa-clean-slate-001-share-poster-390x844-<build>-20260618.png` | P0：短屏强视觉，不得旧战报长列表 |
| 保存 PNG 原图 | `docs/runtime/pr-qa-clean-slate-001-share-png-original-<taskId>-<build>-20260618.png` | 必须可打开、可与页面预览比对 |
| 分享回流 | `docs/runtime/pr-qa-clean-slate-001-share-return-<build>-20260618.png` | 成员 / 局外范围清晰，不外露 raw 字段 |
| 相册沉淀 | `docs/runtime/pr-qa-clean-slate-001-album-<build>-20260618.png` | 首页最近相册、列表、详情至少覆盖一处 |

##### 13.16.54.8 当前回报给 PM

`PR-QA-CLEAN-SLATE-001` 当前状态：`Clean Slate 准出矩阵已登记 / 旧壳截图和旧样本不得继续写通过 / 待前端、UIUX、后端/API、接口联调、后台、DBA/运维提交清单和新基线证据`。测试下一步等待各角色回包后，先跑旧词 / 旧路由 / 旧资产扫描，再按微信开发者工具右侧预览框和 automator 执行 P0 核心链路矩阵；任一用户可见旧词、旧路由、旧资产、旧后台入口或旧分享战报壳命中，直接退回对应责任角色。

#### 13.16.55 `PR-QA-CLEAN-SLATE-FAIL-NOW-002` 2026-06-18 当前代码树 fail-now 基线

记录时间：2026-06-18。PM 已验收 13.16.54，本节建立当前代码树的 fail-now 基线，只作为 Clean Slate 清空前后的对照，不代表任何实现通过；不需要真机，不跑旧版本预览截图，不改业务源码、PM 总台账或他人计划。

##### 13.16.55.1 读取范围与执行边界

| 项 | 记录 |
| --- | --- |
| 已读范围 | `docs/runtime/ai-thread-dispatch-queue.md` 中 `PR-QA-CLEAN-SLATE-FAIL-NOW-002` 行；`docs/party-recorder-clean-slate-reset-plan.md`；测试计划 13.16.54 |
| 当前目标 | 固化当前旧路由、旧词、旧资产、旧后台入口污染面；补 automator / 右侧预览框最小前置项；给后续回归对照模板 |
| 当前结论边界 | 只登记 fail-now；不把扫描命中写成“已清空”或“可用”；不把旧壳、旧样本、旧分享图继续写通过 |

##### 13.16.55.2 扫描命令基线

```powershell
Get-Content miniprogram\app.json
rg -n '"pages/(judge|judge-wheel|question-bank|table-mode|result-report|share-poster|share-preview|wine-history|wine-points)/index"' miniprogram/app.json
rg -n "酒桌判官|判官|欠酒|惩罚|战报|裁判|酒局" miniprogram/pages miniprogram/components miniprogram/utils
rg -n "酒桌判官后台|酒局管理|战报中心|今日最欠酒|题库与任务|战报海报|分享战报" backend/public/admin backend/data/admin.js
rg -n "judge|judge-wheel|question-bank|table-mode|wine-history|wine-points|result-report|share-poster|share-preview" miniprogram/app.json miniprogram/pages backend/public/admin
rg --files miniprogram/assets backend/public/static backend/public/uploads | rg "report-poster|share|battle|judge|wine|jiu|punish|war-report|poster"
```

##### 13.16.55.3 当前 `app.json` 旧路由暴露清单

当前 `miniprogram/app.json` 仍直接注册以下旧路由，按 Clean Slate 口径均属于 fail-now 命中：

| 行号 | 路由 | 当前判定 |
| --- | --- | --- |
| 5 | `pages/judge/index` | 旧“记录/判官”命名空间仍暴露，必退 |
| 11 | `pages/share-preview/index` | 旧分享回流页命名仍暴露，待前端新路由重建 |
| 16 | `pages/table-mode/index` | 旧账本/战报混合壳，必退 |
| 17 | `pages/judge-wheel/index` | 旧判官转盘玩法路由，必退 |
| 18 | `pages/result-report/index` | 旧战报页路由，必退 |
| 21 | `pages/share-poster/index` | 旧分享海报路由命名仍在，待前端新路由 / 新壳重建 |
| 22 | `pages/wine-history/index` | 旧相册 / 历史命名空间仍暴露，必退 |
| 23 | `pages/wine-points/index` | 旧积分路由仍暴露，必退 |
| 36 | `pages/question-bank/index` | 旧题库玩法路由仍暴露，必退 |

##### 13.16.55.4 当前代码树污染扫描基线

| 类别 | 当前命中面 | 典型证据 | 当前判定 |
| --- | --- | --- | --- |
| 小程序用户可见旧词 | 首页 / 创建 / 等待 / 现场 / 简报 / 分享 / 相册 / 工具详情等仍有 `酒局`、`判官`、`欠酒`、`惩罚`、`战报` | `miniprogram/pages/tools/index.wxml:142` `酒桌判官`；`miniprogram/pages/session-rules/index.wxml` `欠酒规则/惩罚卡`；`miniprogram/pages/result-report/index.wxml` `本局战报`；`miniprogram/pages/judge-wheel/index.wxml` `判官转盘` | 必退 |
| 小程序旧逻辑命名 | 仍大量使用 `judge`、`wine-history`、`result-report`、`table-mode`、`share-poster`、`share-preview` 页面路径和跳转 | `miniprogram/pages/index/index.ts`、`pages/judge/index.ts`、`pages/live-record/index.ts`、`pages/me/index.ts` 等仍跳旧路径 | 必退 |
| 后台旧入口污染 | 后台标题、品牌、菜单、指标和页面类型仍保留旧品牌和旧运营话术 | `backend/public/admin/index.html:7` `酒桌判官后台`；`backend/public/admin/static/heatwave-ops/app.js` `酒局管理/战报中心/题库与任务`；`backend/data/admin.js:63` `今日最欠酒` | 必退 |
| 后端 / seed 旧文案 | `backend/data/admin.js`、`backend/data/front.js`、`backend/data/moments.js` 仍含旧品牌替换逻辑和旧 seed 文案 | `backend/data/admin.js:2245` `酒局管理`；`backend/data/admin.js:2284` `战报中心`；`backend/data/moments.js:941-943` 旧词替换链 | 必退 |
| 旧分享资产 / 旧生成图 | 旧静态海报、旧 share task PNG、旧分享二维码资源仍存在 | `backend/public/static/report-poster.png`；`backend/public/uploads/moments/share-tasks/*.png`；`miniprogram/assets/share/share-poster-miniapp-code.png` | 必退；后续只能归档或替换，不能继续作新版通过证据 |
| 新资产但旧路径共存 | `miniprogram/assets/party-recorder/share-flow/*` 已存在新资产，但与旧 `share-poster/share-preview/report-poster` 体系并存 | `miniprogram/assets/party-recorder/party-recorder-share-bg.webp` 与旧 `report-poster.png` 共存 | 待实现：不能算通过，只说明已存在新资产起点 |

##### 13.16.55.5 Automator / 右侧预览框最小前置项

后续 Clean Slate 预览回归开始前，至少满足以下前置项；缺任一项时应先记“待实现 / 工具前置缺失”，不要直接判业务失败：

| 前置项 | 最小要求 | 当前口径 |
| --- | --- | --- |
| 端口 | `scripts/start-wechat-devtools-automation.ps1 -Port 9420` 可连通 | 必需 |
| 预览框截图 | `scripts/capture-wechat-devtools-preview.ps1` 可抓右侧预览框有效图片 | 必需 |
| storage 安全摘要 | 只记录 `apiBase/profileId/tokenTail/tokenPresent`，不得原样贴完整 token | 必需 |
| 新路径 / selector | 前端必须回包 Clean Slate 新页面 path、关键 selector、page data 字段 | 缺失时记待实现，不跑点击矩阵 |
| 新 fixture | 接口联调 / 后端提供 Clean Slate 新 session / brief / task / invite 样本，不再沿用旧 judge/report/share 样本 | 缺失时记待实现，不写通过 |
| Console / Network 口径 | 每轮先查 Console / Network / storage，再跑点击矩阵；红错和 4xx/5xx 要能定位责任角色 | 必需 |

##### 13.16.55.6 fail-now 结果模板

| 类型 | 定义 | 当前示例 | 后续结论模板 |
| --- | --- | --- | --- |
| 必退 | 已命中 Clean Slate 禁止项，说明当前代码树仍被旧项目污染 | 旧路由仍在 `app.json`；用户可见旧词命中；后台仍叫 `酒桌判官后台`；旧 `report-poster.png` / ready PNG 仍存在并可被引用 | `必退：命中旧路由/旧词/旧资产/旧后台入口，责任角色=<前端/后台/后端/UIUX>` |
| 待实现 | 不是旧污染直接命中，但缺 Clean Slate 新基线、缺新 selector、缺新 fixture、缺新分享图原图，当前无法写通过 | 新 `party-recorder/share-flow` 资产虽存在，但没有新路由 / 新页面 / 新 PNG 证据；新预览矩阵尚无前端回包 | `待实现：缺新基线证据，不计失败关闭，不计通过` |
| 工具前置缺失 | automator 端口、右侧预览截图、storage 安全摘要、Console/Network 采集任一不可用 | 9420 未监听、预览截图脚本失效、storage 只能输出完整 token | `工具前置缺失：先修采集链路，不判业务通过或失败` |

##### 13.16.55.7 截图命名与后续回归对照模板

本轮只建立命名基线，不截旧图。后续每轮对照都按同一命名：

| 类别 | 命名基线 | 用途 |
| --- | --- | --- |
| 路由 / 首页 | `docs/runtime/pr-qa-clean-slate-fail-now-002-home-<build>-<date>.png` | 对照首页是否还暴露旧入口 |
| 创建 / 现场 / 账本 | `docs/runtime/pr-qa-clean-slate-fail-now-002-flow-<create|live|ledger>-<build>-<date>.png` | 对照旧词和旧路由是否清空 |
| 简报 / 分享页 | `docs/runtime/pr-qa-clean-slate-fail-now-002-share-<brief|poster|return>-390x844-<build>-<date>.png` | 对照短屏视觉、工程字段、旧战报壳是否消失 |
| 保存 PNG 原图 | `docs/runtime/pr-qa-clean-slate-fail-now-002-png-original-<taskId>-<build>-<date>.png` | 对照页面预览与实际 PNG 是否一致 |
| 后台入口 | `docs/runtime/pr-qa-clean-slate-fail-now-002-admin-<page>-<build>-<date>.png` | 对照后台品牌、菜单和旧词是否移除 |

对照记录模板：

| 项 | fail-now 基线 | 回归后结果 | 判定 |
| --- | --- | --- | --- |
| 旧路由 | 列出当前 `app.json` 命中 | 新 manifest 是否移除 / 隔离 | 通过 / 必退 |
| 旧词 | 列出 `rg` 命中路径 | 命中是否清零或转入归档 | 通过 / 必退 |
| 旧资产 | 列出旧静态图、旧 share task PNG、旧后台资源 | 是否已替换、隔离或不再被引用 | 通过 / 必退 |
| 旧后台入口 | 列出旧标题 / 菜单 / 页面 | 是否改为聚会记录师后台新入口 | 通过 / 必退 |
| 分享页 / 分享图 | 当前无新基线，不截图 | 新页面预览 + PNG 原图是否满足 13.16.54.3 | 通过 / 必退 / 待实现 |

##### 13.16.55.8 当前回报给 PM

`PR-QA-CLEAN-SLATE-FAIL-NOW-002` 当前状态：`fail-now 基线已登记 / 当前代码树存在明确旧路由、旧词、旧资产、旧后台入口污染 / 这些命中均不得继续写通过`。下一步：前端先交 `PR-FE-CLEAN-SLATE-001` 的新 route manifest 和旧路径替换表；后台 / 后端分别清旧品牌入口与旧 seed 文案；接口联调补新 fixture；测试收到新基线后按 13.16.55 的扫描命令和命名模板做前后对照回归。

#### 13.16.56 `PR-QA-CLEAN-SLATE-PHASE1-DELTA-003` 2026-06-18 第一轮 delta 回归

记录时间：2026-06-18。执行边界：只看 `docs/runtime/ai-thread-dispatch-queue.md` 中 `PR-QA-CLEAN-SLATE-PHASE1-DELTA-003` 行和 13.16.55 fail-now 基线；本轮以扫描命令和当前代码树只读对照为主，不需真机，不跑旧壳预览通过，不改业务源码、PM 总台账或他人计划。

##### 13.16.56.1 队列状态与 delta 结论前提

| 项 | 当前记录 |
| --- | --- |
| QA 任务行 | `PR-QA-CLEAN-SLATE-PHASE1-DELTA-003` 已派发，要求等前端 003 回包后做第一轮 delta 回归 |
| 前端 003 状态 | 队列 `PR-FE-CLEAN-SLATE-PHASE1-IMPLEMENT-003` 当前仍为 `sent`，未见 `done` / 最终回包 |
| 本轮结论边界 | 由于前端 003 未回包，本轮只能登记“当前代码树相对 13.16.55 无显著 delta”，不能写 phase1 已落地，也不能写新壳通过 |

##### 13.16.56.2 Delta 对照表

| 对照项 | 13.16.55 fail-now 基线 | 本轮扫描结果 | delta 结论 |
| --- | --- | --- | --- |
| `app.json` P0 旧路由 | `judge/share-preview/table-mode/judge-wheel/result-report/share-poster/wine-history/wine-points/question-bank` 仍注册 | `miniprogram/app.json` 仍保留全部同名路由 | 无减少 |
| 新 `album/ledger/privacy-state` 壳页 | 基线要求前端 003 新建并迁主链路入口 | `rg --files miniprogram/pages | rg "album|ledger|privacy-state"` 无命中 | 新壳未落地 |
| 小程序用户可见旧词 | 多页仍命中 `酒桌判官/判官/欠酒/惩罚/战报/酒局` | 本轮扫描仍命中首页工具栏、创建、规则、等待、现场、简报、分享、战报、转盘等路径 | 无减少 |
| 后台旧品牌与旧入口 | `酒桌判官后台`、`酒局管理`、`战报中心`、`今日最欠酒` 等命中 | 本轮扫描仍命中 `backend/public/admin` 和 `backend/data/admin.js` | 无减少 |
| 旧分享资产 / 旧生成图 | `report-poster.png`、旧 share task PNG、旧 share 资源仍存在 | 本轮未见移除或隔离证据 | 无减少 |
| 主链路旧入口 | fail-now 记录首页 / 我的 / 工具 / 现场仍跳 `judge/wine-history/table-mode/judge-wheel/result-report/share-poster` | 本轮代码扫描仍存在这些跳转 | 仍可从主链路进入旧壳 |

##### 13.16.56.3 重点验证结果

| 验证点 | 结果 | 当前判定 |
| --- | --- | --- |
| 1. `app.json` 里旧 P0 路由是否下线 | 否。`pages/judge/index`、`pages/judge-wheel/index`、`pages/question-bank/index`、`pages/table-mode/index`、`pages/result-report/index`、`pages/share-poster/index`、`pages/share-preview/index`、`pages/wine-history/index`、`pages/wine-points/index` 仍在 | 必退 |
| 2. 新 `album/ledger/privacy-state` 壳页是否可进 | 当前代码树未发现对应页面目录，也未见 `app.json` 注册 | 待实现 |
| 3. 旧词和旧入口是否减少 | 本轮对照 13.16.55 未见减少；扫描仍大量命中旧词和旧跳转 | 必退 |
| 4. 是否还能从主链路进入旧壳 | 能。`index/me/judge/live-record/wine-history/result-report/share-poster` 相关旧跳转仍在代码中 | 必退 |

##### 13.16.56.4 当前仍残留的主链路旧壳入口

| 入口位置 | 当前旧跳转 / 旧页面 | 判定 |
| --- | --- | --- |
| 首页 `pages/index/index.ts` | `judge` tab；多处跳 `wine-history` | 仍可进入旧壳 |
| 记录页 `pages/judge/index.ts` | 跳 `table-mode`、`wine-history` | 仍可进入旧壳 |
| 现场页 `pages/live-record/index.ts` | 跳 `share-poster`、`table-mode`、`judge-wheel` | 仍可进入旧壳 |
| 我的页 `pages/me/index.ts` | 多处跳 `wine-history`，保留 `judge` tab | 仍可进入旧壳 |
| 历史页 `pages/wine-history/index.ts` | 跳 `share-poster`、`result-report`、`live-record?role=judge` | 仍可进入旧壳 |

##### 13.16.56.5 必要预览截图点

前端 003 回包后，第一轮预览框 delta 至少补以下截图；当前因无新壳实现，不截图旧版通过图：

| 截图点 | 命名基线 | 目的 |
| --- | --- | --- |
| 首页主入口 | `docs/runtime/pr-qa-clean-slate-phase1-delta-003-home-<build>-20260618.png` | 对照旧 `judge` / 相册 / 旧分享入口是否移除 |
| 新 `album` 壳页 | `docs/runtime/pr-qa-clean-slate-phase1-delta-003-album-<build>-20260618.png` | 证明新相册壳页已可进 |
| 新 `ledger` 壳页 | `docs/runtime/pr-qa-clean-slate-phase1-delta-003-ledger-<build>-20260618.png` | 证明新账本壳页已可进 |
| 新 `privacy-state` 壳页 | `docs/runtime/pr-qa-clean-slate-phase1-delta-003-privacy-state-<build>-20260618.png` | 证明新隐私态壳页已可进 |
| 分享页首屏 | `docs/runtime/pr-qa-clean-slate-phase1-delta-003-share-390x844-<build>-20260618.png` | 对照旧战报壳和旧分享长列表是否退出主链路 |

##### 13.16.56.6 扫描结果摘要

| 类别 | 当前摘要 |
| --- | --- |
| 旧路由扫描 | 与 13.16.55 一致，无减少 |
| 新壳页扫描 | `album/ledger/privacy-state` 页面目录未落地 |
| 旧词扫描 | 小程序用户可见层、后台静态页、后台 seed 文案仍大量命中 |
| 旧后台入口扫描 | `酒桌判官后台`、`酒局管理`、`战报中心`、`今日最欠酒` 仍在 |
| 旧资产扫描 | `backend/public/static/report-poster.png`、`backend/public/uploads/moments/share-tasks/*.png`、旧 share 资源仍在 |

##### 13.16.56.7 当前回报给 PM

`PR-QA-CLEAN-SLATE-PHASE1-DELTA-003` 当前状态：`无显著 delta / 旧 P0 路由未下线 / 新 album、ledger、privacy-state 壳页未落地 / 旧词和旧入口未减少 / 主链路仍可进入旧壳`。减少了什么：本轮未见可证明减少项。仍残留什么：`app.json` 旧 P0 路由、主链路旧跳转、用户可见旧词、旧后台入口、旧分享资产与旧生成图。下一步：等待前端 003 最终回包后，测试按本节截图点和 13.16.55 扫描命令做第二次 delta，对照是否真的完成“新壳可进、旧壳下线”。

#### 13.16.57 `PR-QA-CLEAN-SLATE-PHASE1-DELTA-003-RERUN` 2026-06-18 第一轮 delta 复跑

记录时间：2026-06-18。PM 复派 `PR-QA-CLEAN-SLATE-PHASE1-DELTA-003-RERUN`，旧 13.16.56 的“无显著 delta”发生在前端 003 未回包前，已过期。本节基于前端 14.46 后的最新代码树复跑 delta；只更新测试计划和证据，不改业务源码、PM 总台账或他人计划，不写真机或上线通过。

##### 13.16.57.1 读取与执行范围

| 项 | 记录 |
| --- | --- |
| 队列状态 | `PR-FE-CLEAN-SLATE-PHASE1-IMPLEMENT-003` 已 `done`，前端 14.46 回包；`PR-QA-CLEAN-SLATE-PHASE1-DELTA-003-RERUN` 为 `sent` |
| 前端 14.46 摘要 | 新增 `album/ledger/privacy-state`；`app.json` 下线 `judge/judge-wheel/question-bank/table-mode/result-report`；主链路入口迁移；前端自报 typecheck、encoding、diff check、route scan 通过 |
| 本轮 QA 范围 | 基于 13.16.55 fail-now 基线，复扫 `app.json`、新壳页文件、非旧目录直跳、旧词残留；DevTools 9420 可用时补新壳预览截图 |

##### 13.16.57.2 扫描命令

```powershell
Get-Content miniprogram\app.json
rg -n '"pages/(judge|judge-wheel|question-bank|table-mode|result-report|share-poster|share-preview|wine-history|wine-points|album|ledger|privacy-state)/index"' miniprogram/app.json
rg --files miniprogram\pages | rg "(album|ledger|privacy-state)\\index\.(ts|wxml|less|json)$"
rg -n '/pages/(judge|judge-wheel|question-bank|table-mode|result-report)/index|role=judge' miniprogram/pages miniprogram/components miniprogram/utils -g '!miniprogram/pages/judge/**' -g '!miniprogram/pages/judge-wheel/**' -g '!miniprogram/pages/question-bank/**' -g '!miniprogram/pages/table-mode/**' -g '!miniprogram/pages/result-report/**'
rg -n 'data-tab="judge"|tab === ''judge''|judge:' miniprogram/pages miniprogram/components miniprogram/utils -g '!miniprogram/pages/judge/**' -g '!miniprogram/pages/judge-wheel/**' -g '!miniprogram/pages/question-bank/**' -g '!miniprogram/pages/table-mode/**' -g '!miniprogram/pages/result-report/**'
rg -n 'wine-history|wine-points|share-poster|share-preview' miniprogram/pages miniprogram/components miniprogram/utils -g '!miniprogram/pages/wine-history/**' -g '!miniprogram/pages/wine-points/**' -g '!miniprogram/pages/share-poster/**' -g '!miniprogram/pages/share-preview/**'
rg -n "酒桌判官|判官|欠酒|惩罚|战报|裁判|酒局" miniprogram/pages miniprogram/components miniprogram/utils backend/public/admin backend/data/admin.js
```

##### 13.16.57.3 Delta 对照表

| 对照项 | 13.16.55 fail-now 基线 | 本轮结果 | Delta 判定 |
| --- | --- | --- | --- |
| P0 旧路由 | `judge/judge-wheel/question-bank/table-mode/result-report` 注册在 `app.json` | 未命中；`app.json` 当前只保留 `album/ledger/privacy-state` 新壳和 `share-preview/share-poster/wine-history/wine-points` 等旧二阶段残留路由 | P0 旧路由已下线 |
| 新壳页注册 | `album/ledger/privacy-state` 不存在 | `app.json` 注册 `pages/album/index`、`pages/ledger/index`、`pages/privacy-state/index` | 已减少 / 已落地 |
| 新壳页文件 | 无对应页面目录 | 三个页面均具备 `index.ts/wxml/less/json` | 已落地 |
| 非旧目录直跳 P0 旧路由 | 首页 / 现场 / 我的等主链路可进 P0 旧壳 | 排除旧目录后，仅 `ledger/index.ts` 仍有 `role=judge` query；未发现非旧目录直跳 `/pages/judge/index`、`/pages/judge-wheel/index`、`/pages/question-bank/index`、`/pages/table-mode/index`、`/pages/result-report/index` | 主链路 P0 旧壳直跳基本切断；`role=judge` 命名残留待前端清理 |
| 主入口 `judge` tab | 多处 `data-tab="judge"` 指向旧 `judge` | `index/me/tools` 仍保留 `judge` tab 名，但路由映射已改为 `/pages/ledger/index` | 功能入口已迁移，命名残留 |
| 分享 / 相册旧路由 | `share-poster/share-preview/wine-history/wine-points` 注册且多处跳转 | 仍注册；非旧目录仍跳 `share-poster/share-preview/wine-points`，`wine-history` 仅旧目录内部残留为主 | 仍残留，不能写 Clean Slate 全量通过 |
| 旧词 | 用户可见旧词大量命中 | 仍大量命中小程序、后台静态页、后台 seed；包含 `酒桌判官后台`、`欠酒`、`战报`、`惩罚`、`酒局` 等 | 仍残留，必退给对应角色 |

##### 13.16.57.4 DevTools 右侧预览证据

| 页面 | 命令 | 结果 |
| --- | --- | --- |
| 自动化端口 | `pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420` | 返回 `ok=true`、`action=started`、`port=9420` |
| `album` | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/album/index?mode=host" --wait 5000 --data mode,title,summary,emptyText,albumItems,errorText --output docs/runtime/pr-qa-clean-slate-phase1-delta-003-rerun-album-20260618.png` | page `pages/album/index`，query `mode=host`；data `mode=host`、`emptyText=还没有你创建的聚会，先从首页发起一次记录。`；Console `[]`；截图 `docs/runtime/pr-qa-clean-slate-phase1-delta-003-rerun-album-20260618.png` |
| `ledger` | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/ledger/index" --wait 5000 --data sessionId,summary,entries,errorText,emptyText --output docs/runtime/pr-qa-clean-slate-phase1-delta-003-rerun-ledger-20260618.png` | page `pages/ledger/index`；dataKeys 含 `hasSession/sessionId/sessionName/stats`，`sessionId=""`；Console `[]`；截图 `docs/runtime/pr-qa-clean-slate-phase1-delta-003-rerun-ledger-20260618.png` |
| `privacy-state` | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/privacy-state/index?type=feature" --wait 5000 --data type,title,description,primaryLabel,errorText --output docs/runtime/pr-qa-clean-slate-phase1-delta-003-rerun-privacy-state-20260618.png` | page `pages/privacy-state/index`，query `type=feature`；data `title=功能整理中`；Console `[]`；截图 `docs/runtime/pr-qa-clean-slate-phase1-delta-003-rerun-privacy-state-20260618.png` |

##### 13.16.57.5 减少了什么 / 仍残留什么 / 是否还能从主链路进入旧壳

| 问题 | 回答 |
| --- | --- |
| 减少了什么 | `app.json` 已下线 P0 旧路由 `judge/judge-wheel/question-bank/table-mode/result-report`；新增并注册 `album/ledger/privacy-state`；首页 / 我的 / 工具里的 `judge` tab 路由已迁到 `ledger`；现场页的账本 / 旧转盘入口已迁到 `ledger`；新壳页可通过 DevTools 预览打开且 Console 为空。 |
| 仍残留什么 | `share-preview/share-poster/wine-history/wine-points` 仍注册；旧目录 `judge/judge-wheel/question-bank/table-mode/result-report` 未删除且内部仍有旧词和旧跳转；小程序、后台、后台 seed 仍大量命中 `酒桌判官/判官/欠酒/惩罚/战报/酒局`；`role=judge` 和 `data-tab="judge"` 命名仍在非旧目录中。 |
| 是否还能从主链路进入 P0 旧壳 | 本轮未发现非旧目录直跳 `/pages/judge/index`、`/pages/judge-wheel/index`、`/pages/question-bank/index`、`/pages/table-mode/index`、`/pages/result-report/index`；但仍可从主链路进入旧分享 / 旧相册相关路由 `share-poster/share-preview/wine-points`，分享与相册仍不能写 Clean Slate 准出。 |

##### 13.16.57.6 当前回报给 PM

`PR-QA-CLEAN-SLATE-PHASE1-DELTA-003-RERUN` 当前状态：`第一阶段路由 delta 局部通过 / 新壳可预览 / P0 旧壳主链路直跳基本切断 / 旧词、旧分享、旧相册、旧后台污染仍残留`。下一步：前端继续清 `share-preview/share-poster/wine-history/wine-points` 迁移和 `judge` 命名残留；后台 / 后端清旧品牌与旧 seed；测试下一轮继续按 13.16.55 扫描命令和本节截图点做 delta，不写全量 Clean Slate 通过。

#### 13.16.58 `PR-QA-CLEAN-SLATE-PHASE2-004` 2026-06-18 第二阶段待测矩阵

记录时间：2026-06-18。PM 预派 `PR-QA-CLEAN-SLATE-PHASE2-004`。前端 `PR-FE-CLEAN-SLATE-PHASE2-004` 当前队列状态为 `sent`，尚未最终回包；本节只登记待测矩阵、命令、截图命名和退回规则，不复测旧版本，不截图旧壳，不写通过。

##### 13.16.58.1 准入条件

| 准入项 | 必须证据 | 缺失时结论 |
| --- | --- | --- |
| 前端 004 最终回包 | 前端计划新增 004 记录，说明 `share-preview/share-poster/wine-history/wine-points` 下线或 clean 重写策略、页面路径、selector、data 字段 | `待前端回包`，不得执行旧版本矩阵 |
| 基础验证 | 前端提供 `typecheck`、`check:encoding`、目标 diff check、route scan 结果 | `待验证`，不得写预览阶段通过 |
| 分享规格 | UI/UX 004 或前端回包给出短屏强视觉规格、保存图尺寸 / 来源、失败态 / 重试态说明 | 分享页 / 保存图只能写待设计复核 |
| 样本 / 数据 | 接口联调或前端提供可读 session / brief / task / invite 样本；storage token 只记录后 8 位 | 缺样本时只跑静态 route scan，不跑分享业务通过 |
| DevTools 工具链 | 9420 可连，automator 可读取 page/data/Console；如不可用，记录工具链阻塞原因 | 工具链阻塞不等于业务失败 |

##### 13.16.58.2 扫描命令模板

前端 004 回包后先跑扫描，再跑预览矩阵：

```powershell
Get-Content miniprogram\app.json
rg -n '"pages/(share-preview|share-poster|wine-history|wine-points|album|ledger|privacy-state)/index"' miniprogram/app.json
rg -n 'wine-history|wine-points|share-poster|share-preview|result-report|judge-wheel|question-bank|table-mode' miniprogram/pages miniprogram/components miniprogram/utils -g '!miniprogram/pages/wine-history/**' -g '!miniprogram/pages/wine-points/**' -g '!miniprogram/pages/share-poster/**' -g '!miniprogram/pages/share-preview/**'
rg -n "酒桌判官|判官|欠酒|惩罚|战报|裁判|酒局|dual_flow|debug|接口未返回|字段接入|not session member|share task has no visible nodes" miniprogram/pages miniprogram/components miniprogram/utils backend/public/admin backend/data/admin.js
rg --files miniprogram\assets backend\public\static backend\public\uploads | rg "report-poster|share-task|share-poster-miniapp-code|war|judge|wine"
```

##### 13.16.58.3 Delta 对照待测表

| 对照项 | 13.16.57 残留 | 前端 004 后待判定 | 退回对象 |
| --- | --- | --- | --- |
| 剩余旧壳路由 | `share-preview/share-poster/wine-history/wine-points` 仍注册 | 下线、隔离或 clean 版重写；若保留，必须证明用户路径和文案已 clean | 前端 |
| 非旧目录直跳 | `live-record/session-brief/invite-group/invite-friends/waiting-room` 等仍跳旧分享路由 | 应改到 clean 分享 / 相册路径；不得直跳旧壳 | 前端 |
| 聚会账本并存 | 13.16.57 只证明 `ledger` 壳页可打开，未证明账本进入简报 / 分享 / 保存图 | 拍照记录 + 聚会账本必须同链路并存，且进入 brief / share page / PNG | 前端 + 接口联调；缺字段时后端/API |
| 分享页短屏视觉 | 旧 `share-poster/share-preview` 仍残留 | 390x844 首屏内照片 + 账本同屏，保存 / 分享主按钮和隐私提示可见 | 前端 + UI/UX |
| 保存图 PNG | 旧 ready PNG / 旧红壳历史仍是风险 | 必须取得 `posterImagePath`、PNG 原图或 URL，页面预览与 PNG 一致 | 前端；后端 PNG 旧模板则后端/API |
| 用户可见旧词 | 小程序、后台、seed 仍大量命中旧词 | 新用户路径、分享页、保存图、回流页不得出现旧词 / 工程字段 | 前端 / 后台 / 后端/API |

##### 13.16.58.4 DevTools 预览矩阵模板

以下命令仅在前端 004 最终回包后执行；路径、selector 和 data 字段以后端 / 前端回包为准替换。

| 用例 | 命令模板 | 截图命名 | 关键断言 |
| --- | --- | --- | --- |
| `PR-QA-CS-P2-001` clean 相册 / 历史 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "<clean-album-path>" --wait 5000 --data mode,items,emptyText,photoCount,briefId,errorText --output docs/runtime/pr-qa-clean-slate-phase2-004-album-<build>-20260618.png` | `docs/runtime/pr-qa-clean-slate-phase2-004-album-<build>-20260618.png` | 不进入 `wine-history` 旧壳；无旧词；Console `[]` |
| `PR-QA-CS-P2-002` clean 账本 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "<clean-ledger-path>" --wait 5000 --data sessionId,stats,entries,accountingHighlights,errorText --output docs/runtime/pr-qa-clean-slate-phase2-004-ledger-<build>-20260618.png` | `docs/runtime/pr-qa-clean-slate-phase2-004-ledger-<build>-20260618.png` | 账本入口可见；不是删除账本；无旧“欠酒长列表”抢主视觉 |
| `PR-QA-CS-P2-003` brief 照片 + 账本 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "<clean-brief-path>" --wait 6000 --data photoHighlights,accountingHighlights,keyEvents,shareSummary,ledgerIncluded,errorText --output docs/runtime/pr-qa-clean-slate-phase2-004-brief-dual-flow-<build>-20260618.png` | `docs/runtime/pr-qa-clean-slate-phase2-004-brief-dual-flow-<build>-20260618.png` | `photoHighlights.length>0` 或合规空态；`accountingHighlights.length>0`；二者共同进入简报 |
| `PR-QA-CS-P2-004` 分享页首屏 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "<clean-share-poster-path>" --wait 6000 --data posterImagePath,saveState,readyShareImageUrl,photoHighlights,accountingHighlights,keyEvents,shareTask,errorText --output docs/runtime/pr-qa-clean-slate-phase2-004-share-poster-390x844-<build>-20260618.png` | `docs/runtime/pr-qa-clean-slate-phase2-004-share-poster-390x844-<build>-20260618.png` | 短屏强视觉；照片 + 账本同屏；无旧红壳、旧词、英文状态、内部样本、工程字段 |
| `PR-QA-CS-P2-005` 保存图 / PNG | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "<clean-share-poster-path>" --selector "<clean-save-selector>" --wait 8000 --data posterImagePath,saveState,readyShareImageUrl,shareTask,errorText --output docs/runtime/pr-qa-clean-slate-phase2-004-save-<build>-20260618.png` | PNG 原图：`docs/runtime/pr-qa-clean-slate-phase2-004-save-png-original-<taskId>-<build>-20260618.png` | 可保存；失败 / 重试状态可见；PNG 与页面预览一致 |
| `PR-QA-CS-P2-006` 分享回流 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "<clean-share-preview-path>" --wait 6000 --data permissionState,shareContentFilter,photoHighlights,accountingHighlights,keyEvents,errorText --output docs/runtime/pr-qa-clean-slate-phase2-004-share-return-<build>-20260618.png` | `docs/runtime/pr-qa-clean-slate-phase2-004-share-return-<build>-20260618.png` | 权限文案用户化；不得暴露 raw `permissionState`、ID、接口错误文字 |

##### 13.16.58.5 通过 / 退回规则

| 结果 | 判定 |
| --- | --- |
| 旧壳仍注册并被主链路直跳 | 退回前端 004 |
| 账本入口或 `accountingHighlights` 消失 | 退回前端；如接口字段缺失，抄送接口联调 / 后端/API |
| 分享页只有照片或只有账本 | 退回前端 / UIUX；不得写分享通过 |
| 保存图缺 PNG 原图、只有占位路径、点击超时 | 退回前端；若后端 ready PNG 旧模板，退回后端/API |
| 用户可见区域出现旧词、英文状态、内部样本、工程字段、raw 错误 | 命中即退回对应责任角色 |
| DevTools 9420 不可用 | 记录工具链阻塞和失败原文；先给扫描结果，不判业务通过 |

##### 13.16.58.6 当前回报给 PM

`PR-QA-CLEAN-SLATE-PHASE2-004` 当前状态：`待测矩阵已登记 / 等前端 004 最终回包 / 未执行旧版本复测 / 不代表通过`。前端 004 回包后，测试先按 13.16.58.2 扫描，再用 DevTools 9420 执行 13.16.58.4；回包格式固定为“减少了什么 / 仍残留什么 / 是否还能从主链路进入旧壳 / 分享页和保存图是否满足 P0”。

#### 13.16.59 `PR-QA-CLEAN-SLATE-PHASE2-004-RUN` 2026-06-18 第二阶段当前版本复测

记录时间：2026-06-18。前端 14.47 已回包，后端 42 已回包；PM 限制：前端截图当前是无成员态空态，不能据此写分享链路通过；`album` 已被 UI/UX 判 P0，前端正在修 `PR-FE-CLEAN-SLATE-PHASE2-004-FIXUP`。本节只改测试计划和测试证据，不改源码、不改 PM 总台账，不写真机 / 上线 / 全量 Clean Slate 通过。

##### 13.16.59.1 读取范围与当前限制

| 项 | 记录 |
| --- | --- |
| 队列 | `PR-FE-CLEAN-SLATE-PHASE2-004` 已 `done`；`PR-FE-CLEAN-SLATE-PHASE2-004-FIXUP` 为 `sent`；`PR-QA-CLEAN-SLATE-PHASE2-004-RUN` 为 `sent` |
| 前端 14.47 | `app.json` 继续下线旧路由，保留并重写 `share-preview/share-poster`；截图/data 是无成员态空态，未证明真实照片 + 账本同屏 |
| 后端 42 | clean facade 已做用户 payload 白名单与 debug 摘要分层；仍缺真正 clean 的 `party/photo/ledger/brief/shareImage` fixture |
| PM 限制 | `album` 与 `share-preview` 状态等前端 FIXUP 回包后再补；本轮只登记当前扫描和分享页空态 / 跳转证据 |

##### 13.16.59.2 执行命令与扫描结果

| 类型 | 命令 | 结果 |
| --- | --- | --- |
| `app.json` | `Get-Content miniprogram\app.json` | 当前只注册 `index/album/ledger/me/create-session/invite-group/share-preview/compliance-guide/moment-editor/live-record/session-brief/share-poster/invalid-state/privacy-state/settings/friend-hub/waiting-room`。 |
| 旧壳 route scan | `rg -n 'share-preview|share-poster|wine-history|wine-points|album|ledger|privacy-state' miniprogram/app.json miniprogram/pages miniprogram/components miniprogram/utils` | `wine-history/wine-points` 已从 `app.json` 下线；`share-preview/share-poster` 仍注册但前端声明已 clean 重写；非旧目录仍有 `share-preview/share-poster` 跳转。 |
| 旧词 / 工程字段 scan | `rg -n "酒桌判官|判官|欠酒|惩罚|战报|裁判|酒局|dual_flow|debug|接口未返回|字段接入|not session member|share task has no visible nodes" miniprogram/pages miniprogram/components miniprogram/utils backend/public/admin backend/data/admin.js` | 仍大量命中后台旧品牌 / seed、旧目录、部分小程序旧文案和组件错误映射；分享核心页仍有内部 `dual_flow` / safe error mapping 字符串，但不等于 UI 可见通过。 |
| storage 安全摘要 | `node -e "<miniprogram-automator getStorageSync safe summary>"` | `apiBase=https://api.pomer.cn/api/v1`，`profileId=user-1781583974510-1a52e6`，token 后 8 位 `4afb1b00`，`tokenPresent=true`。 |

##### 13.16.59.3 DevTools 9420 分享页复测

| 页面 | 命令 | page / data / Console | 截图 | 判定 |
| --- | --- | --- | --- | --- |
| `share-poster` 指定成员态样本 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --wait 6000 --data photoHighlights,accountingHighlights,keyEvents,displayTaskLayoutMode,displayTaskStatus,saveState,posterImagePath,readyShareImageUrl,shareTask,ledgerIncluded,ledgerCount,shareSummary,errorText --output docs/runtime/pr-qa-clean-slate-phase2-004-run-share-poster-20260618.png` | 返回 page `pages/index/index`，query `{}`，未取得分享页 data；Console `[]` | `docs/runtime/pr-qa-clean-slate-phase2-004-run-share-poster-20260618.png` | 未打开目标分享页，不能写分享海报通过；退回前端核查 route / onLoad / 样本态跳转 |
| `share-poster` 空路径 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index" --wait 5000 --data photoHighlights,accountingHighlights,keyEvents,displayTaskLayoutMode,displayTaskStatus,saveState,shareTask,errorText --output docs/runtime/pr-qa-clean-slate-phase2-004-run-share-poster-empty-20260618.png` | page `pages/album/index`，query `mode=album`，未返回分享页 data；Console `[]` | `docs/runtime/pr-qa-clean-slate-phase2-004-run-share-poster-empty-20260618.png` | 空路径回落相册可接受为兜底，但不能证明分享页 |
| `share-preview` 成员态样本 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-preview/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T&briefId=brief-1781584503870-25d5edac" --wait 6000 --data photoHighlights,accountingHighlights,keyEvents,shareSummary,filteredNodeIds,visibleNodeIds,permissionState,ledgerCount,errorText --output docs/runtime/pr-qa-clean-slate-phase2-004-run-share-preview-20260618.png` | page `pages/share-preview/index`；query 正确；data `photoHighlights=[]`、`accountingHighlights=[]`、`keyEvents=[]`、`shareSummary=这场聚会的可分享照片和账本高光会在这里汇总。`、`filteredNodeIds=[]`、`visibleNodeIds=[]`、`permissionState=""`、`ledgerCount=0`；Console `[]` | `docs/runtime/pr-qa-clean-slate-phase2-004-run-share-preview-20260618.png` | 空态可打开，但未证实真实照片 + 聚会账本同屏；PM 已要求等 FIXUP 后补状态复测 |
| `share-preview` 并行误跑 | 并行 relaunch 期间曾返回 `command timed out after 124047 milliseconds` | 与其他 relaunch 并发冲突，单独重跑已成功 | 无 | 不作为业务失败 |

##### 13.16.59.4 减少项与残留项

| 分类 | 当前结论 |
| --- | --- |
| 静态路由扫描 | 局部通过：`wine-history/wine-points` 已从 `app.json` 下线；`share-preview/share-poster` 仍注册但作为 clean 重写能力保留。 |
| 旧入口减少 | 主链路旧商业化 / 旧积分 / 旧相册路由进一步减少；`firstLoginBonus`、首页、我的页等多处已转向 `privacy-state/album/ledger`。 |
| 仍残留 | 后台旧品牌和旧 seed 大量残留；旧目录未删除；`invite-group/waiting-room/session-brief/live-record` 仍会进入 `share-preview/share-poster`；`coupon-center` 等已下线路由目录内部仍有旧跳转；分享核心页源码仍有内部 `dual_flow` / safe error mapping 字符串。 |
| 分享页 / 保存图 | `share-preview` 只能证明空态可打开；`share-poster` 指定样本未停在分享页；未取得 `posterImagePath` 或 PNG 原图；不能证明短屏强视觉、照片 + 账本同屏或保存图 clean。 |
| 聚会账本 | `live-record` 和 `share-poster/share-preview` 源码保留 `ledger/accountingHighlights/ledgerCount`；但本轮 page data 中 `accountingHighlights=[]`、`ledgerCount=0`，不能证明真实账本随照片进入简报 / 分享 / 保存图。 |

##### 13.16.59.5 当前判定与退回对象

| 结论项 | 判定 | 退回 / 下一步 |
| --- | --- | --- |
| 静态 route scan | `局部通过` | 前端继续保留 clean 路由说明；后续清旧目录归档 |
| 旧词 scan | `未通过` | 后台 / 后端清 `酒桌判官后台`、`酒局管理`、`战报中心`、seed 文案；前端清下线路由目录和剩余用户可见旧词 |
| `share-preview` | `空态可打开` | 等前端 FIXUP 回包后复测状态文案和真实成员态数据 |
| `share-poster` | `P0 退回 / 待修` | 指定成员态样本未停在目标页，退回前端核查 `share-poster` route / onLoad / clean fallback；未能验证保存图 |
| 真实照片 + 账本同屏 | `未证实` | 等前端 FIXUP + clean manifest / 成员态样本后复跑 |
| `album` | `待 FIXUP 后补测` | PM 已确认 UI/UX 判 P0，本轮不写通过 |

##### 13.16.59.6 当前回报给 PM

`PR-QA-CLEAN-SLATE-PHASE2-004-RUN` 当前状态：`静态路由扫描局部通过 / share-preview 空态可打开 / share-poster 指定样本未停在目标页 / 真实照片+聚会账本同屏未证实 / 保存图 PNG 未证实 / P0 退回前端 + 等 FIXUP`。下一步：前端 `PR-FE-CLEAN-SLATE-PHASE2-004-FIXUP` 回包后，测试补 `album` 与 `share-preview` 状态复测，并重新用成员态样本复跑 `share-poster` 保存图。

#### 13.16.60 `PR-QA-CLEAN-SLATE-FIXUP-004-RETEST` 2026-06-18 FIXUP 补测

记录时间：2026-06-18。前端 14.48 已回包 `PR-FE-CLEAN-SLATE-PHASE2-004-FIXUP`，声明已净化 `album` 工程字段和 `share-preview` 的 `0/0 已加入` 可见状态。本节基于 13.16.59 继续补测，只改测试计划和测试证据，不改源码、PM 总台账或其他角色文档；不写真机 / 上线 / 全量分享链路通过。

##### 13.16.60.1 执行前置与 storage 摘要

| 项 | 记录 |
| --- | --- |
| PowerShell | `pwsh -NoLogo -NoProfile -Command '$PSVersionTable.PSVersion.ToString()'` -> `7.6.2`；第一次版本检查被外层变量展开干扰并报 `ParserError`，未修改文件，已用单引号重跑通过。 |
| DevTools 9420 | `pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420` -> `{"ok":true,"action":"already-listening","port":9420,"owningProcess":20048,"projectPath":"F:\\codexlist\\jiuzhuopanguan"}` |
| storage 安全摘要 | `node -e "<miniprogram-automator getStorageSync safe summary>"` -> `apiBase=https://api.pomer.cn/api/v1`、`profileId=user-1781583974510-1a52e6`、token 后 8 位 `4afb1b00`、`tokenPresent=true`。未输出完整 token。 |

##### 13.16.60.2 DevTools 9420 补测结果

| 页面 | 命令 | page / data / Console | 截图 | 判定 |
| --- | --- | --- | --- | --- |
| `album` | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/album/index?mode=album" --wait 6000 --data items,pageTitle,emptyText,loading --output docs/runtime/pr-qa-clean-slate-fixup-004-retest-album-20260618.png` | page `pages/album/index`，query `mode=album`；data `items[0].title=聚会相册 1`、`items[0].meta=聚会记录`、`items[1].title=聚会相册 2`、`items[1].meta=聚会记录`、`pageTitle=我的相册`、`loading=false`；Console `[]` | `docs/runtime/pr-qa-clean-slate-fixup-004-retest-album-20260618.png` | FIXUP 局部确认：当前相册页未显示 `IT-MOMENTS` / `PR-BE-DB-LOGIN-SEED` / `PR Seed`。仍不代表旧数据源或首页最近相册全部净化。 |
| `share-preview` 指定回流样本 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-preview/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T&briefId=brief-1781584503870-25d5edac" --wait 6000 --data inviteStatusText,joinedCount,playerCount,photoHighlights,accountingHighlights,keyEvents,shareSummary,filteredNodeIds,visibleNodeIds,permissionState,errorText --output docs/runtime/pr-qa-clean-slate-fixup-004-retest-share-preview-20260618.png` | 实际 page `pages/index/index`，query `{}`；未取得 `share-preview` data；Console `[]`；截图中首页最近相册仍可见 `PR-BE-DB-LOGIN-...` 截断样本名 | `docs/runtime/pr-qa-clean-slate-fixup-004-retest-share-preview-20260618.png` | 未通过 / 待修：回流目标页未停住，无法验证 `inviteStatusText` 是否替代 `0/0 已加入`；落回首页还暴露工程样本名，退回前端继续查回流路由和首页最近相册净化。 |
| `share-preview` 指定回流样本重跑 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-preview/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T&briefId=brief-1781584503870-25d5edac" --wait 8000 --data inviteStatusText,joinedCount,playerCount,photoHighlights,accountingHighlights,keyEvents,shareSummary,filteredNodeIds,visibleNodeIds,permissionState,errorText --output docs/runtime/pr-qa-clean-slate-fixup-004-retest-share-preview-rerun-20260618.png` | 实际 page `pages/share-poster/index`，query `reset=1`；data `photoHighlights=[]`、`accountingHighlights=[]`、`keyEvents=[]`、`permissionState=public`、`shareSummary=这场聚会的照片、账本和朋友回忆都会在这里汇总。`、`errorText=分享图暂时无法展示，请稍后重试`；Console `[]` | `docs/runtime/pr-qa-clean-slate-fixup-004-retest-share-preview-rerun-20260618.png` | 未通过 / 待修：第二次仍未停在 `share-preview`，而是跳到 `share-poster?reset=1` 失败态；不能证明回流页文案、照片 + 账本同屏或 raw 字段净化。 |
| `share-poster` 指定成员态样本 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --wait 6000 --data photoHighlights,accountingHighlights,keyEvents,displayTaskLayoutMode,displayTaskStatus,saveState,posterImagePath,readyShareImageUrl,shareTask,ledgerIncluded,ledgerCount,shareSummary,errorText --output docs/runtime/pr-qa-clean-slate-fixup-004-retest-share-poster-20260618.png` | page `pages/share-poster/index`，query `briefId=brief-1781584503870-25d5edac`、`taskId=share-task-1781687817395-94cf4452`；data `photoHighlights=[]`、`accountingHighlights=[]`、`keyEvents=[]`、`displayTaskLayoutMode=照片和账本`、`displayTaskStatus=生成失败`、`saveState=failed`、`posterImagePath=""`、`readyShareImageUrl=""`、`shareTask.status=failed`、`shareTask.layoutMode=dual_flow`、`ledgerIncluded=true`、`ledgerCount=0`、`errorText=分享图暂时无法展示，请稍后重试`；Console `[]` | `docs/runtime/pr-qa-clean-slate-fixup-004-retest-share-poster-20260618.png` | 仍 P0 未闭环：本次已能停在目标页，但为失败态、无照片、无账本条目、无保存图路径；`dual_flow` 仍存在于 page data。不能写分享链路通过。 |

##### 13.16.60.3 当前判定与退回对象

| 项 | 判定 | 下一步责任 |
| --- | --- | --- |
| `album` 工程字段净化 | `FIXUP 局部确认` | 前端继续扩展到首页最近相册 / 全局相册入口，避免 `PR-BE-DB-LOGIN-*` 等样本名在用户 UI 泄露；UI/UX 复核相册空态视觉。 |
| `share-preview` 回流页 | `未通过 / 待修` | 退回前端：指定 `sessionId + inviteCode + briefId` 样本未停在 `share-preview`，一次回首页、一次跳 `share-poster?reset=1`；需补 route / guard / fallback 证据。 |
| `share-preview` 生硬状态 | `未证实` | 因目标页未停住，不能确认 `0/0 已加入` 已在 QA 预览态消失；前端回包后重测。 |
| `share-poster` | `仍 P0 未闭环` | 退回前端 / 后端接口协同：目标页虽可打开，但为 `failed` 空态，`photoHighlights/accountingHighlights/keyEvents` 均为空，`posterImagePath/readyShareImageUrl` 为空；需要真实照片 + 聚会账本同屏和可保存图证据。 |
| Console | `当前三类复跑均 []` | 非阻塞；后续仍需先查 Console / Network / storage。 |

##### 13.16.60.4 当前回报给 PM

`PR-QA-CLEAN-SLATE-FIXUP-004-RETEST` 当前状态：`album 工程字段净化局部确认 / share-preview 指定回流样本未停目标页 / share-poster 仍为失败空态 / 真实照片 + 聚会账本同屏未证实 / 保存图 PNG 未证实 / 分享链路 P0 继续退回前端与接口协同`。下一步：前端继续修 `share-preview` 路由停页、首页最近相册样本名净化和 `share-poster` 真实数据态；接口 / 后端补 clean 成员态样本与可生成分享图证据后，测试复跑同一组命令。

#### 13.16.61 `PR-QA-CLEAN-SLATE-006-RETEST` 2026-06-18 预派待测矩阵

记录时间：2026-06-18；本节在 `PR-QA-HOME-INVITE-LEDGER-CLEANUP-007-RETEST` 预派时同步更新依赖。前端 `PR-FE-CLEAN-SLATE-SHARE-RETURN-HOME-006-FIX` 已在前端 14.50 回包，后端/API `PR-BE-CLEAN-SLATE-ACTUAL-DATA-006` 已在后端/API 44 回包；但测试仍必须等待接口联调 `PR-INT-CLEAN-SLATE-ACTUAL-MANIFEST-006-RUN` 给出 sanitized manifest、页面 query、角色/token 后 8 位和 warnings/skipped 后再执行。不执行旧版本复测、不截图、不写通过；如只有前端/后端自测，没有接口联调公开摘要，测试结论只能写 `阻塞 / 待复测`。

##### 13.16.61.1 准入条件

| 准入项 | 需要证据 | 未满足时结论 |
| --- | --- | --- |
| 前端 006 回包 | 前端 14.50 已回包；测试复跑时仍需基于接口联调 006-RUN 的 actual query 验证 `share-preview` 不回首页、不跳 `share-poster?reset=1`，并复核首页最近相册 / 最近记录工程字段净化范围 | 只有前端自测时，不写预览框阶段通过 |
| 后端/API 006 回包 | 后端/API 44 已回包 actual clean helper；测试复跑仍需接口联调 006-RUN 给 sanitized manifest，至少含 session / invite / brief / share task / 可访问 PNG 或生成任务证据；公开文档只允许 token 后 8 位和脱敏 ID 摘要 | 无 sanitized manifest 和页面 query 时，不写真实照片 + 聚会账本同屏通过 |
| 接口联调 006-RUN | 输出 sanitized JSON/MD 或等价公开摘要，含 party/photo/ledger/brief/shareImage ID、页面 query、角色身份、warnings/skipped、cleanup/残留计划和可复跑命令 | 未回包前，006 保持阻塞 / 待复测 |
| DevTools 9420 | `scripts\start-wechat-devtools-automation.ps1 -Port 9420` 可连接；storage 安全摘要可取，token 只写后 8 位 | 记录工具链阻塞，不判业务失败 |
| 调试器优先门禁 | 先记录 Console / Network / storage / page data，再跑点击或保存矩阵 | 缺调试器摘要不得写预览框阶段通过 |

##### 13.16.61.2 复测命令模板

| 用例 | 命令模板 | 截图命名 | 必采摘要 |
| --- | --- | --- | --- |
| storage 脱敏摘要 | `node -e "<miniprogram-automator getStorageSync safe summary>"` | 无 | `apiBase/profileId/tokenTail/tokenPresent`，不得输出完整 token |
| 首页最近相册 / 最近记录 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/index/index" --wait 6000 --data home,sessionReturn,loggedIn,loading --output docs/runtime/pr-qa-clean-slate-006-retest-home-20260618.png` | `docs/runtime/pr-qa-clean-slate-006-retest-home-20260618.png` | page/query/data、Console、Network/API；截图扫描 `PR-BE-DB-LOGIN-*`、`IT-MOMENTS`、`PR Seed`、内部 ID、英文 debug 字段 |
| `share-preview` 指定回流样本 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-preview/index?sessionId=session-1781584503517-c033e9&inviteCode=W58G7T&briefId=brief-1781584503870-25d5edac" --wait 8000 --data inviteStatusText,joinedCount,playerCount,photoHighlights,accountingHighlights,keyEvents,shareSummary,filteredNodeIds,visibleNodeIds,permissionState,errorText --output docs/runtime/pr-qa-clean-slate-006-retest-share-preview-20260618.png` | `docs/runtime/pr-qa-clean-slate-006-retest-share-preview-20260618.png` | 必须稳定 page `pages/share-preview/index` 且 query 保持指定参数；不得回首页、不得跳 `pages/share-poster/index?reset=1`；UI 不得显示 `0/0 已加入`、英文状态、接口错误或 raw 字段 |
| `share-poster` 14.49 停页失败态保留复核 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781584503870-25d5edac&taskId=share-task-1781687817395-94cf4452" --wait 8000 --data photoHighlights,accountingHighlights,keyEvents,displayTaskLayoutMode,displayTaskStatus,saveState,posterImagePath,readyShareImageUrl,shareTask,ledgerIncluded,ledgerCount,shareSummary,errorText --output docs/runtime/pr-qa-clean-slate-006-retest-share-poster-20260618.png` | `docs/runtime/pr-qa-clean-slate-006-retest-share-poster-20260618.png` | 若仍为 14.49 停页失败态，记录为 `停页可复现 / 数据或生成链路未闭环`，不得写分享链路通过 |
| actual clean 分享图 / PNG 原图 | 以后端/API 006 回包的 actual clean `briefId/taskId/pngUrl` 为准复跑 `share-poster`，再下载或访问 PNG 原图记录 HTTP 头、尺寸、hash | `docs/runtime/pr-qa-clean-slate-006-retest-share-poster-actual-20260618.png`、`docs/runtime/pr-qa-clean-slate-006-retest-share-png-original-20260618.png` | 照片 + 聚会账本同屏、短屏强视觉、无旧红壳/旧词/工程字段/英文状态/内部样本；PNG 与页面预览来源一致 |

##### 13.16.61.3 通过 / 退回规则

| 检查项 | 预览框阶段通过条件 | 必退条件 |
| --- | --- | --- |
| `share-preview` 停页 | 连续复跑均停在 `pages/share-preview/index`，query 保持指定 `sessionId/inviteCode/briefId`，Console 无阻塞红错 | 回首页、跳 `share-poster?reset=1`、query 丢失、登录/权限 guard 误伤公开回流 |
| 首页最近相册 / 最近记录 | 用户 UI 不出现 `PR-BE-DB-LOGIN-*`、`IT-MOMENTS`、`PR Seed`、`session-*`、`task-*`、英文 debug/raw 字段 | 任一用户可见区域命中上述工程字段或旧样本名 |
| `share-poster` | 无 actual clean 数据时只能确认停页 / 失败态；有 actual clean 数据时必须照片 + 聚会账本同屏、保存图路径或 PNG 原图可验 | 空照片、空账本、`posterImagePath/readyShareImageUrl` 为空、`shareTask.status=failed` 仍作为成功展示、PNG 旧模板 |
| Console / Network / storage | Console 无阻塞红错；Network/API 摘要可解释；storage token 只记后 8 位 | `ERR_CONNECTION_REFUSED`、loading 配对告警、接口 4xx/5xx 未处理、完整 token 泄露 |

##### 13.16.61.4 当前回报给 PM

`PR-QA-CLEAN-SLATE-006-RETEST` 已登记待测矩阵，不代表通过。当前依赖更新为：前端 006 和后端/API 006 已回包，但测试必须等待接口联调 `PR-INT-CLEAN-SLATE-ACTUAL-MANIFEST-006-RUN` 给 sanitized manifest 与页面 query 后执行；不得直接用私密 manifest、旧 `INT-DATA-001` 或前端/后端自测截图写通过。测试侧下一轮按 13.16.61.2 记录命令、截图、Console、Network/storage/page data、角色身份/token 后 8 位和退回对象。

#### 13.16.62 `PR-QA-HOME-INVITE-LEDGER-CLEANUP-007-RETEST` 2026-06-18 预派待测矩阵

记录时间：2026-06-18。本节只登记待测矩阵，等待前端 `PR-FE-HOME-INVITE-LEDGER-CLEANUP-007` 回包后执行；不得测试旧版本或把前端自测截图写成测试通过。每轮复测必须先看调试器 Console / Network / storage，再执行点击矩阵；storage 只记录角色身份和 token 后 8 位。

##### 13.16.62.1 准入条件

| 准入项 | 需要证据 | 未满足时结论 |
| --- | --- | --- |
| 前端 007 回包 | 前端计划记录改动文件、首页空/有进行中两态、邀请卡、局内 tabs、账本操作截图或 data、Console、`typecheck`、`check:encoding`、目标 diff check；需给 selector 或页面路径 | 不跑旧版本，不写通过 |
| UI/UX 007 标准 | UI/UX 给首页非常驻待开局、邀请卡极简、局内四 tab、账本按钮主次的退回码或截图接收标准 | 视觉准出只写待 UI/UX 复核 |
| actual manifest / storage | 如涉及有进行中聚会和角色操作，优先使用接口联调 006-RUN 或前端 007 给出的 clean session / invite / role storage；公开记录只写 token 后 8 位 | 无成员态 storage 时，只测空态或标阻塞 |
| DevTools 9420 | `pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420` 可连接；先跑安全 storage 摘要 | 工具超时先记工具链阻塞，不判业务失败 |

##### 13.16.62.2 复测命令模板

| 用例 | 命令模板 | 截图命名 | 必采摘要 |
| --- | --- | --- | --- |
| 调试器 / storage 前置 | `pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420`；`node -e "<miniprogram-automator getStorageSync safe summary>"`；必要时 `npm.cmd run wechat:auto -- status --port 9420 --output docs/runtime/pr-qa-home-invite-ledger-007-status-20260618.png` | `docs/runtime/pr-qa-home-invite-ledger-007-status-20260618.png` | page/query、Console、Network/API 摘要、`apiBase/profileId/role/tokenTail/tokenPresent` |
| 首页无进行中聚会 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/index/index" --wait 6000 --data home,sessionReturn,loggedIn,loading --output docs/runtime/pr-qa-home-invite-ledger-007-home-empty-20260618.png` | `docs/runtime/pr-qa-home-invite-ledger-007-home-empty-20260618.png` | 无进行中聚会时不得展示 `聚会待开局`；首页不得出现底部输入口令、相册、分享、聚会账本入口；记录 Console/Network/storage |
| 首页有进行中聚会 | 使用前端 007 或 manifest 给出的 host/member storage 后执行：`npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/index/index" --wait 6000 --data home,sessionReturn,loggedIn,loading --output docs/runtime/pr-qa-home-invite-ledger-007-home-active-20260618.png` | `docs/runtime/pr-qa-home-invite-ledger-007-home-active-20260618.png` | 仅有进行中聚会时才展示 `聚会待开局` 或等价继续记录入口；不得常驻底部口令/相册/分享/账本入口 |
| 邀请卡 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/invite-group/index?sessionId=<actualSessionId>&inviteCode=<actualInviteCode>" --wait 6000 --data sessionId,inviteCode,joinedCount,playerCount,joinStatusPlayers,loading,errorText --output docs/runtime/pr-qa-home-invite-ledger-007-invite-card-20260618.png` | `docs/runtime/pr-qa-home-invite-ledger-007-invite-card-20260618.png` | 邀请卡只展示口令、好友加入状态；不得出现相册、分享、账本、工程字段或旧玩法入口 |
| 局内四 tab | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/live-record/index?sessionId=<actualSessionId>" --wait 6000 --data sessionId,tabs,activeTab,photoHighlights,ledgerCount,shareEntryVisible,errorText --output docs/runtime/pr-qa-home-invite-ledger-007-live-tabs-20260618.png` | `docs/runtime/pr-qa-home-invite-ledger-007-live-tabs-20260618.png` | 局内 tabs 必须有 `记录 / 相册 / 分享 / 聚会账本` 同级；不把账本藏到首页常驻入口 |
| 账本页成员展示 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/ledger/index?sessionId=<actualSessionId>" --wait 6000 --data sessionId,viewerRole,isHost,ledgerItems,players,canAdjustLedger,errorText --output docs/runtime/pr-qa-home-invite-ledger-007-ledger-member-20260618.png` | `docs/runtime/pr-qa-home-invite-ledger-007-ledger-member-20260618.png` | 账本页展示头像和用户名；按钮不重复；普通成员无越权加减酒入口 |
| 邀请发起者加减酒 | 等前端 007 提供 selector 后执行：`npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/ledger/index?sessionId=<actualSessionId>" --selector <ledger-plus-or-minus-selector> --wait 3000 --data sessionId,viewerRole,ledgerItems,canAdjustLedger,errorText --output docs/runtime/pr-qa-home-invite-ledger-007-ledger-host-adjust-20260618.png` | `docs/runtime/pr-qa-home-invite-ledger-007-ledger-host-adjust-20260618.png` | 邀请发起者可加减酒；操作后 data / UI 一致；按钮不重复；Console/Network 无阻塞红错 |

##### 13.16.62.3 通过 / 退回规则

| 检查项 | 预览框阶段通过条件 | 必退条件 |
| --- | --- | --- |
| 首页待开局 | 无进行中聚会不展示；有进行中聚会才展示继续记录类入口 | `聚会待开局` 常驻、空态仍展示进行中聚会 |
| 首页入口清理 | 首页无底部输入口令、相册、分享、聚会账本常驻入口 | 任一常驻入口仍在首页底部或主操作区抢权重 |
| 邀请卡 | 只展示口令和好友加入状态，文案用户化 | 出现相册/分享/账本入口、工程字段、旧词、接口错误原文 |
| 局内 tabs | `记录 / 相册 / 分享 / 聚会账本` 同级可见、可点、布局不溢出 | 缺任一 tab、账本不在同级、tab 文案截断或遮挡 |
| 账本角色操作 | 展示头像用户名；邀请发起者可加减酒；普通成员无越权；按钮不重复 | 无头像/用户名、发起者不可操作、普通成员越权、重复按钮或 data/UI 不一致 |
| 调试器门禁 | Console 无阻塞红错，Network/API 摘要可解释，storage token 只写后 8 位 | `ERR_CONNECTION_REFUSED`、loading 配对告警、接口 4xx/5xx 未处理、完整 token 泄露 |

##### 13.16.62.4 当前回报给 PM

`PR-QA-HOME-INVITE-LEDGER-CLEANUP-007-RETEST` 已登记待测矩阵，不代表通过。测试等待前端 `PR-FE-HOME-INVITE-LEDGER-CLEANUP-007` 回包和必要的 clean session / role storage 后执行；若接口联调 006-RUN 未给 manifest，只能测无成员态首页空态，其余用例写阻塞。回包时必须给 DevTools 9420 命令、截图路径、Console/Network/storage/page data、角色身份/token 后 8 位、通过/退回对象和下一步责任人。

#### 13.16.63 `PR-QA-LINK-CLEANUP-008-RETEST` 2026-06-18 预派待测矩阵

记录时间：2026-06-18。本节按 `docs/party-recorder-redesign-requirements.md` 4.2 和 PM 队列 `PR-QA-LINK-CLEANUP-008-RETEST` 登记待测，不执行旧版本 DevTools，不截图，不写通过。必须等待前端 `PR-FE-LINK-CLEANUP-008` 回包、接口联调 `PR-INT-LINK-CLEANUP-DATA-008` 给页面 query / 样本 ID / token 后 8 位，且后端/API `PR-BE-DIRECT-PHOTO-LEDGER-CONTRACT-008` 明确字段合同后再执行。若缺 selector、样本、角色 storage 或接口字段，只能写 `阻塞 / 待复测`。

##### 13.16.63.1 准入条件

| 准入项 | 需要证据 | 未满足时结论 |
| --- | --- | --- |
| 前端 008 回包 | 前端计划记录改动文件、各页面截图/data/Console、工具箱可点击证明、简报大图预览证明、图片直显与分享链路说明、`typecheck`、`check:encoding`、目标 diff check；提供必要 selector | 不跑旧版本，不写前端通过 |
| 接口联调 008 样本 | sanitized 摘要、页面 query、样本 ID、token 后 8 位、图片 URL / brief / share 字段、warnings/skipped、cleanup 口径；不得泄露完整 token | 无样本时，图片直显、分享图、创建时间、欠酒/加酒数据只写阻塞 |
| 后端/API 008 合同 | 最近相册第一张照片封面字段、创建时间字段、聚会账本欠酒/加酒可编辑数据、图片直显/取消审核机制对相册/简报/分享接口的影响 | 字段缺口不归前端通过，按合同缺口退回后端/API 或接口 |
| UGC 008 门禁 | 图片取消审核后的隐私范围、举报/删除、敏感内容后置治理和分享图字段白名单口径 | 风控未回包时，不写 UGC / 发布准出 |
| DevTools 9420 | `pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420` 可连接；每轮先采 Console / Network / storage / page data；PM 追加证据显示端口监听不等于 automator 会话可用 | `wechat:auto status --storage` 如报 `Error: Remote debug connection lost`，先退回 `自动化预览连接阻塞`，不判业务通过 |

PM 追加调试器阻塞证据：2026-06-18，PM 连续两次执行 `npm.cmd run wechat:auto -- status --port 9420 --storage --output docs/runtime/wechat-automator-status-9420-pm-008-followup*.png` 均失败，错误原文为 `Error: Remote debug connection lost`；随后执行 `pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420` 返回 `{"ok":true,"action":"already-listening","port":9420,"owningProcess":20048}`。结论：当前状态为 `9420 端口监听 / miniprogram-automator 远程调试连接断开 / 不能作为可点击矩阵通过证据`。

##### 13.16.63.2 DevTools 9420 复测命令模板

| 用例 | 命令模板 | 截图命名 | 必采摘要 |
| --- | --- | --- | --- |
| 调试器前置 | `pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420`；先重跑 `npm.cmd run wechat:auto -- status --port 9420 --storage --output docs/runtime/pr-qa-link-cleanup-008-status-20260618.png`；status 成功后再跑 `node -e "<miniprogram-automator getStorageSync safe summary>"` | `docs/runtime/pr-qa-link-cleanup-008-status-20260618.png` | page/query、Console、Network/API 摘要、`apiBase/profileId/role/tokenTail/tokenPresent`；若仍报 `Error: Remote debug connection lost`，本轮停止点击矩阵并记录工具链阻塞 |
| 1. 首页最近相册封面 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/index/index" --wait 6000 --data home,albums,recentAlbums,sessionReturn,loading --output docs/runtime/pr-qa-link-cleanup-008-home-album-cover-20260618.png` | `docs/runtime/pr-qa-link-cleanup-008-home-album-cover-20260618.png` | 有上传照片样本时封面为第一张上传照片；无照片样本时才显示默认态；不得显示工程字段或旧样本名 |
| 2. 首页工具箱入口 / 工具可用 | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/index/index" --selector <toolbox-entry-selector> --wait 3000 --data toolboxItems,activeTool,errorText --output docs/runtime/pr-qa-link-cleanup-008-toolbox-entry-20260618.png`；逐工具使用前端 008 提供 selector 复跑 tap | `docs/runtime/pr-qa-link-cleanup-008-toolbox-<tool>-20260618.png` | 首页底部入口为工具箱；进入工具箱列表；每个工具可打开 / 可计算 / 可返回，记录工具点击结果 |
| 3. 个人中心入口去重 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/me/index" --wait 6000 --data quickEntries,profileActions,stats,errorText --output docs/runtime/pr-qa-link-cleanup-008-me-dedupe-20260618.png` | `docs/runtime/pr-qa-link-cleanup-008-me-dedupe-20260618.png` | 入口不重复；不得大多数入口都跳相册；记录入口数量、目标路由分布和截图 |
| 4. 我创建的聚会简报大图 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "<actual-brief-path>" --wait 6000 --data photoHighlights,briefPhotos,previewVisible,errorText --output docs/runtime/pr-qa-link-cleanup-008-brief-image-20260618.png`；再 `tap --selector <brief-image-selector>` 和 `tap --selector <preview-back-selector>` | `docs/runtime/pr-qa-link-cleanup-008-brief-image-preview-20260618.png`、`docs/runtime/pr-qa-link-cleanup-008-brief-image-return-20260618.png` | 简报内图片可点大图；大图可返回简报；记录 page data 和点击后 page/preview 状态 |
| 5. 图片上传直显与分享链路 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "<actual-upload-or-editor-path>" --wait 6000 --data imageUrl,uploadState,reviewStatus,albumItems,photoHighlights,shareTask,errorText --output docs/runtime/pr-qa-link-cleanup-008-photo-direct-20260618.png` | `docs/runtime/pr-qa-link-cleanup-008-photo-direct-20260618.png`、分享页/保存图另存 `pr-qa-link-cleanup-008-share-*` | 图片上传后直接展示；参与相册、简报、分享页、保存分享图；UI 不出现审核阻塞态 |
| 6. 创建时间实时展示 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "<actual-party-list-path>" --wait 6000 --data partyItems,createdAt,displayCreatedAt,errorText --output docs/runtime/pr-qa-link-cleanup-008-created-time-20260618.png` | `docs/runtime/pr-qa-link-cleanup-008-created-time-20260618.png` | 创建时间取实时时间并在聚会列表项目展示；记录样本创建时间、展示文案和时区口径 |
| 7. 创建页无轻量主题选择 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/create-session/index" --wait 6000 --data sessionName,templates,themeOptions,playerCount,errorText --output docs/runtime/pr-qa-link-cleanup-008-create-no-theme-20260618.png` | `docs/runtime/pr-qa-link-cleanup-008-create-no-theme-20260618.png` | 创建页不展示轻量主题选择；主题不阻塞默认创建 |
| 8. 邀请预览模块删除 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "<actual-invite-preview-path>" --wait 6000 --data inviteCode,inviteStatusText,joinedCount,playerCount,photoHighlights,accountingHighlights,shareButtons,errorText --output docs/runtime/pr-qa-link-cleanup-008-invite-preview-20260618.png` | `docs/runtime/pr-qa-link-cleanup-008-invite-preview-20260618.png` | 删除照片记录 + 账本模块、口令安全区模块；口令加入状态无分享给好友 / 分享到群 / 保存海报按钮 |
| 9. 拍第一张保存后进进行中 | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "<actual-first-photo-path>" --selector <save-first-photo-selector> --wait 6000 --data sessionId,uploadState,nextRoute,activeTab,errorText --output docs/runtime/pr-qa-link-cleanup-008-first-photo-save-20260618.png` | `docs/runtime/pr-qa-link-cleanup-008-first-photo-save-20260618.png` | 保存第一张照片后进入聚会进行中页面；不得返回首页 |
| 10. 说明文案 2 行 / 默认文案填充 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "<actual-upload-or-editor-path>" --wait 6000 --data caption,defaultCaptions,captionLineClamp,errorText --output docs/runtime/pr-qa-link-cleanup-008-caption-20260618.png`；再 tap 默认文案 selector | `docs/runtime/pr-qa-link-cleanup-008-caption-default-20260618.png` | 说明文案最多 2 行；默认文案点击后可填充输入框 |
| 11. 可见与授权默认 4 项全选 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "<actual-upload-or-editor-path>" --wait 6000 --data visibilityOptions,authorizationOptions,selectedVisibility,selectedAuthorizations,errorText --output docs/runtime/pr-qa-link-cleanup-008-visibility-auth-20260618.png` | `docs/runtime/pr-qa-link-cleanup-008-visibility-auth-20260618.png` | 可见与授权无 `仅自己`；默认 4 项全选；不得因去审核破坏隐私/授权 data |
| 12. 记录 / 账本页欠酒加酒可编辑 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "<actual-ledger-path>" --wait 6000 --data ledgerItems,players,canAdjustLedger,ledgerActions,keyEventButtonVisible,errorText --output docs/runtime/pr-qa-link-cleanup-008-ledger-edit-20260618.png`；加减酒用前端 selector tap | `docs/runtime/pr-qa-link-cleanup-008-ledger-edit-20260618.png`、`docs/runtime/pr-qa-link-cleanup-008-ledger-adjust-20260618.png` | 账本展示欠酒 / 加酒数据并可编辑；无 `保存关键事件` 按钮替代账本能力；记录操作前后 data |

##### 13.16.63.3 通过 / 退回规则

| 检查项 | 预览框阶段通过条件 | 必退条件 |
| --- | --- | --- |
| 首页 / 个人中心入口 | 最近相册封面正确；工具箱入口存在且工具可用；个人中心入口去重、路由分布合理 | 封面不用第一张照片、工具不可用、个人中心重复入口或大多数跳相册 |
| 简报 / 图片直显 | 简报图可大图预览并返回；上传图直接展示并进入相册、简报、分享页、保存图 | 审核阻塞 UI、图片只在局部显示、不进分享 / 保存图、大图无法返回 |
| 创建 / 邀请 / 拍第一张 | 创建时间实时展示；创建页无主题选择；邀请预览删掉指定模块和按钮；第一张保存进入进行中页 | 轻量主题仍阻塞、邀请页仍有照片记录+账本/安全区/分享按钮、保存后回首页 |
| 文案 / 授权 | 说明文案最多 2 行，默认文案可填充；无 `仅自己`，默认 4 项全选 | 文案过长、默认文案不可用、仍有 `仅自己` 或默认未全选 |
| 账本能力 | 记录 / 账本页展示欠酒 / 加酒数据并可编辑，无保存关键事件按钮替代原能力 | 欠酒 / 加酒能力消失、不可编辑、仅剩关键事件按钮 |
| 调试器门禁 | 每轮先采 Console / Network / storage / page data；Console 无阻塞红错，storage token 只写后 8 位；`wechat:auto status --storage` 必须可成功返回当前页 | `Remote debug connection lost`、`ERR_CONNECTION_REFUSED`、loading 配对告警、接口 4xx/5xx 未处理、完整 token 泄露 |

##### 13.16.63.4 当前回报给 PM

`PR-QA-LINK-CLEANUP-008-RETEST` 已登记待测矩阵，不代表通过。测试等待前端 `PR-FE-LINK-CLEANUP-008`、接口联调 `PR-INT-LINK-CLEANUP-DATA-008` 和后端/API `PR-BE-DIRECT-PHOTO-LEDGER-CONTRACT-008` 回包后执行；如缺接口样本、页面 query、selector 或角色 storage，对应项写阻塞。PM 当前补充 `Remote debug connection lost`：后续复测前必须先恢复 DevTools 远程调试连接并重新跑 `status --storage`；若仍失败，结论写 `自动化预览连接阻塞`，不得对旧截图或前端自测截图写通过。回包时必须给 DevTools 9420 命令、截图路径、Console/Network/storage/page data、工具点击记录、图片大图记录、通过/退回对象和下一步责任人。

#### 13.16.64 `PR-QA-LINK-CLEANUP-008-RUN-LOCAL-FACADE` 2026-06-18 local facade 准入更新

记录时间：2026-06-18。PM 更新 `PR-QA-LINK-CLEANUP-008-RUN` 依赖：接口联调 3.40 已确认 `prcs-008` 样本仍存在，失败原因不是样本丢失，而是 API base / query / 合同路径不一致。当前只登记 local clean facade 准入和复测模板；在前端 `PR-FE-LINK-CLEANUP-CLEAN-FACADE-008-FIX` 或后端 raw parity 回包前，不判页面通过，不把 14.52 的 `brief not found` / failed 空态当真实大图或 ready 分享图通过。

##### 13.16.64.1 3.40 准入结论

| 项 | 记录 |
| --- | --- |
| 样本存在性 | 接口 3.40 确认 `prcs-008` 本地 JSON store 仍有 `liveSessions=1`、`momentRecords=3`、`sessionEvents=2`、`sessionBriefs=1`、`shareImageTasks=2`、`uploadedAssets=3`、`photoFilesExisting=3`、`shareImageFilesExisting=1`。 |
| 推荐 local API base | `http://127.0.0.1:3221/api/v1`；复测前需确认本地 3221 读取的是同一 store。若 DevTools storage 仍指向 `https://api.pomer.cn/api/v1`，线上不会有 `brief-1781756527712-95eff999`，返回 `brief not found` 不代表样本丢失。 |
| clean facade 路由 | clean 聚合字段应读 `GET /api/v1/briefs/:briefId` 和 `GET /api/v1/share-images/:taskId`；如果页面仍消费 raw `/session-briefs/:id` 或 `/share-image-tasks/:id` 且缺 parity，照片 / 账本 / 关键事件可能为空。 |
| 推荐 brief query | `/pages/session-brief/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999`。缺 `sessionId` 的旧 query 不再作为通过依据。 |
| 推荐 share poster query | `/pages/share-poster/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999&taskId=share-task-1781756527713-442cb75c`。 |
| token 规则 | 完整 token 只能从 private/env 注入测试窗口；公开测试计划只写 token 后 8 位。接口 3.39 公开摘要中 host `20cf10b7`、memberA `4ea6c85e`、memberB `15b29b2c`、outsider `65792002` 可作为角色尾号记录。 |

##### 13.16.64.2 复测前置命令模板

| 步骤 | 命令模板 | 判定 |
| --- | --- | --- |
| DevTools 连接恢复 | `pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420`；`npm.cmd run wechat:auto -- status --port 9420 --storage --output docs/runtime/pr-qa-link-cleanup-008-local-facade-status-20260618.png` | `status --storage` 必须成功返回 page/query/storage/Console；如仍 `Remote debug connection lost`，本轮结论为 `自动化预览连接阻塞`，停止点击矩阵。 |
| local API base 检查 | `curl.exe -sS -i --max-time 10 http://127.0.0.1:3221/api/v1/config/home` | 需 HTTP 200 或可解释响应；如连接拒绝，退回接口联调 / 后端恢复本地 3221，不跑页面通过。 |
| clean brief 只读 | `curl.exe -H "Authorization: Bearer <memberA-token-from-private-env>" http://127.0.0.1:3221/api/v1/briefs/brief-1781756527712-95eff999` | 需返回 clean 聚合字段：`photoHighlights=2`、`accountingHighlights=4`、`keyEvents=2` 或等价摘要；不得公开完整 token。 |
| clean share image 只读 | `curl.exe -H "Authorization: Bearer <memberA-token-from-private-env>" http://127.0.0.1:3221/api/v1/share-images/share-task-1781756527713-442cb75c` | 需 `status=ready`、`imageUrl=/uploads/moments/share-tasks/share-task-1781756527713-442cb75c.png` 或等价 ready 摘要。 |
| DevTools API base 注入 | 使用前端 / 接口给出的安全注入方式设置 `runtime-api-base=http://127.0.0.1:3221/api/v1`，并记录 storage 脱敏摘要 | 只记录 API base、profileId、角色、token 后 8 位；不得输出完整 token。 |

##### 13.16.64.3 页面复测矩阵更新

| 页面 | 命令模板 | 必须证明 |
| --- | --- | --- |
| brief / 简报大图 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/session-brief/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999" --wait 8000 --data briefId,sessionId,photoHighlights,accountingHighlights,keyEvents,timelineNodes,previewVisible,errorText --output docs/runtime/pr-qa-link-cleanup-008-local-facade-brief-20260618.png` | 真实照片 + 聚会账本同屏；简报图可点大图，再返回简报；`errorText` 不得为 `brief not found`。 |
| share poster ready | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999&taskId=share-task-1781756527713-442cb75c" --wait 8000 --data photoHighlights,accountingHighlights,keyEvents,readyShareImageUrl,shareTask,saveState,errorText --output docs/runtime/pr-qa-link-cleanup-008-local-facade-share-poster-20260618.png` | `shareTask.status=ready`、照片 / 账本 / 关键事件不为空、`readyShareImageUrl` 或保存图路径存在；failed 空态不得通过。 |
| PNG 原图 | 使用 clean share image 返回的 `imageUrl` 拉取 PNG：`curl.exe -I http://127.0.0.1:3221/uploads/moments/share-tasks/share-task-1781756527713-442cb75c.png`，必要时保存原图到 `docs/runtime/pr-qa-link-cleanup-008-local-facade-share-png-original-20260618.png` | HTTP 200、`image/png`、尺寸 / hash 与接口 3.39 摘要可对齐；PNG 与页面预览来源一致。 |
| share return | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-preview/index?shareId=share-return-session-1781756527692-d277f0&inviteCode=E52MK5&briefId=brief-1781756527712-95eff999" --wait 8000 --data shareSummary,photoHighlights,accountingHighlights,keyEvents,errorText --output docs/runtime/pr-qa-link-cleanup-008-local-facade-share-return-20260618.png` | 回流页不暴露 raw 字段；照片、账本、关键事件可见；Console/Network/storage 无阻塞红错。 |

##### 13.16.64.4 通过 / 退回规则

| 情况 | 结论 |
| --- | --- |
| 前端 clean facade fix / 后端 raw parity 未回包 | 只登记准入；不判页面通过。 |
| DevTools `status --storage` 仍断连 | `自动化预览连接阻塞`，退回工具链 / DevTools 连接恢复；不判业务失败。 |
| local `curl` clean facade 不通或 3221 连接拒绝 | 退回接口联调 / 后端恢复本地服务和同一 store；不跑页面矩阵。 |
| 页面 brief 仍 `brief not found` | 若 curl clean facade 可读，则退回前端 clean facade 读取或 query；若 curl 也不可读，退回接口 / 后端样本服务。 |
| share task 仍 `failed` 且照片 / 账本 / 事件为空 | 退回前端 / 后端 / 接口合同对齐；不得写 ready 分享图或保存图通过。 |
| brief、share poster、PNG、share return 均显示真实照片 + 聚会账本且无阻塞红错 | 仅可写 `预览框阶段局部通过 / 待发布准出`，不得写真机或上线通过。 |

##### 13.16.64.5 当前回报给 PM

`PR-QA-LINK-CLEANUP-008-RUN-LOCAL-FACADE` 当前状态：`3.40 local facade 准入已登记 / 等前端 clean facade fix 或后端 raw parity 回包 / 未执行旧路径页面通过 / 不代表通过`。下一步：前端 `PR-FE-LINK-CLEANUP-CLEAN-FACADE-008-FIX` 或后端 raw parity 明确后，测试先恢复 DevTools 9420 `status --storage`，再 curl local clean `/briefs` 和 `/share-images` 摘要，最后跑页面矩阵并记录命令、截图或 page data、Console/Network/storage、通过项、退回对象和下一步责任人。

#### 13.16.65 `PR-QA-LINK-CLEANUP-008B-UX-DELTA-RETEST` 2026-06-18 UX delta 待测矩阵

记录时间：2026-06-18。PM 追加 `PR-QA-LINK-CLEANUP-008B-UX-DELTA-RETEST`；本节只登记测试计划和复测矩阵，等待前端 `PR-FE-LINK-CLEANUP-008B-UX-DELTA` 回包后再跑。不得使用旧版本、前端自测截图、接口失败态截图或历史 page data 写通过；截图失败时可记录 page data，但结论不得写“截图通过”。

##### 13.16.65.1 准入条件

| 准入项 | 需要证据 | 未满足时结论 |
| --- | --- | --- |
| 前端 008B 回包 | 前端计划记录改动文件、页面路径 / selector、DevTools 9420 命令、关键 page data、Console 摘要、`typecheck`、`check:encoding`、目标 diff check | 不跑旧版本，不写通过 |
| 接口 / local facade | 涉及简报、分享、图片直显、保存图时，沿 13.16.64 local facade 准入：local `/briefs`、`/share-images` 可读，页面 query 带 `sessionId`，storage 指向正确 API base | `brief not found`、`task failed`、照片 / 账本 / 事件为空时写阻塞或退回，不写通过 |
| DevTools 9420 | 先执行 `npm.cmd run wechat:auto -- status --port 9420 --storage`，记录 page/query/storage token 后 8 位/Console；如截图失败，保留 page data | `Remote debug connection lost` 或 status 不可用时，结论为 `自动化预览连接阻塞` |
| 证据边界 | 每轮记录 Console / Network / storage / page data；完整 token 不得输出；只写 token 后 8 位 | 缺调试器证据不得写预览框阶段通过 |

##### 13.16.65.2 DevTools 9420 复测矩阵

| 用例 | 命令模板 | 必采摘要 / 验收点 |
| --- | --- | --- |
| 调试器前置 | `npm.cmd run wechat:auto -- status --port 9420 --storage --output docs/runtime/pr-qa-link-cleanup-008b-status-20260618.png` | page/query、Console、Network 摘要、storage API base、角色身份、token 后 8 位；status 失败则停止点击矩阵 |
| 1. 首页待开局显示规则 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/index/index" --wait 6000 --data home,sessionReturn,recentAlbums,loading --output docs/runtime/pr-qa-link-cleanup-008b-home-empty-20260618.png`；有进行中样本再跑 active 状态截图 | 无进行中聚会时不展示 `聚会待开局`；有进行中 / 待继续才展示；不得用旧样本空态写通过 |
| 2. 首页工具箱入口与 3 个工具 | `tap --path "/pages/index/index" --selector <toolbox-entry-selector>` 后按前端 008B selector 抽测至少 3 个旧工具 | 首页底部无口令 / 相册 / 分享 / 账本入口；工具箱可进入列表；至少 3 个旧工具可打开 / 使用 / 返回 |
| 3. 最近相册封面与创建时间 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/index/index" --wait 6000 --data recentAlbums,partyItems,createdAt,displayCreatedAt --output docs/runtime/pr-qa-link-cleanup-008b-home-album-time-20260618.png` | 最近相册封面首张照片优先，无图默认；列表项目展示创建时间 |
| 4. 创建页 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/create-session/index" --wait 6000 --data sessionName,themeOptions,createdAt,displayCreatedAt,playerCount --output docs/runtime/pr-qa-link-cleanup-008b-create-20260618.png` | 无轻量主题；创建时间取当前实时时间 |
| 5. 邀请预览减法 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "<actual-invite-preview-path>" --wait 6000 --data inviteCode,inviteStatusText,joinedCount,playerCount,photoHighlights,accountingHighlights,shareButtons,errorText --output docs/runtime/pr-qa-link-cleanup-008b-invite-preview-20260618.png` | 只保留口令和好友加入状态；无照片记录 + 账本、安全区、分享给好友 / 分享到群 / 保存海报按钮 |
| 6. 拍第一张与说明文案 | `tap --path "<actual-first-photo-path>" --selector <save-first-photo-selector> --data sessionId,uploadState,nextRoute,caption,defaultCaptions,captionLineClamp,errorText --output docs/runtime/pr-qa-link-cleanup-008b-first-photo-20260618.png` | 保存后进入进行中页；说明最多 2 行；默认文案 chip 可点击填充 |
| 7. 授权默认态 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "<actual-upload-or-editor-path>" --wait 6000 --data visibilityOptions,authorizationOptions,selectedVisibility,selectedAuthorizations,errorText --output docs/runtime/pr-qa-link-cleanup-008b-auth-20260618.png` | 授权无 `仅自己`；4 项默认全选 |
| 8. 局内四 tab 与账本编辑 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "<actual-live-or-ledger-path>" --wait 6000 --data tabs,activeTab,players,ledgerItems,canAdjustLedger,ledgerActions,keyEventButtonVisible,errorText --output docs/runtime/pr-qa-link-cleanup-008b-ledger-tabs-20260618.png`；加减酒 selector 另跑 tap | `记录 / 相册 / 分享 / 聚会账本` 四 tab 同级；账本展示头像 / 用户名、欠酒 / 加酒数据，可加减；无 `保存关键事件` 和重复按钮 |
| 9. 个人中心入口去重 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/me/index" --wait 6000 --data quickEntries,profileActions,stats,errorText --output docs/runtime/pr-qa-link-cleanup-008b-me-20260618.png` | 入口去重并跳对应功能；不得大多跳相册；记录入口数量和路由分布 |
| 10. 简报图片大图返回 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "<actual-brief-path>" --wait 8000 --data photoHighlights,timelineNodes,previewVisible,errorText --output docs/runtime/pr-qa-link-cleanup-008b-brief-image-20260618.png`；再 tap 图片和返回 selector | 我创建的聚会简报图片可点大图，再点返回；`brief not found` 时只写阻塞 |
| 11. 图片直显与分享 / 保存图 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "<actual-share-or-album-path>" --wait 8000 --data imageUrl,albumItems,photoHighlights,accountingHighlights,keyEvents,readyShareImageUrl,shareTask,saveState,errorText --output docs/runtime/pr-qa-link-cleanup-008b-photo-share-20260618.png` | 上传后直显，参与相册 / 简报 / 分享 / 保存图；无审核阻塞文案；failed 空态不得通过 |
| 12. 无关文字扫描 | 结合全部截图 / page data / Console | 调试器、Console、页面 UI 不得出现 `PR Seed`、`IT-MOMENTS`、`brief not found`、`task failed`、`raw`、`debug`、旧品牌等无关文字 |

##### 13.16.65.3 通过 / 退回规则

| 检查项 | 预览框阶段通过条件 | 必退条件 |
| --- | --- | --- |
| 首页 / 工具箱 / 个人中心 | 首页待开局按状态展示；底部无旧常驻入口；工具箱至少 3 个工具可用；个人中心入口去重并路由分流 | 待开局常驻、底部仍有口令 / 相册 / 分享 / 账本入口、工具不可用、个人中心大多跳相册 |
| 创建 / 邀请 / 拍第一张 | 创建无主题且时间实时；邀请预览只留口令和加入状态；保存第一张后进进行中；说明 2 行且默认 chip 可填充 | 主题仍在默认创建链路、邀请冗余模块/按钮仍在、保存后回首页、说明过长或 chip 不可用 |
| 授权 / 账本 | 无 `仅自己` 且 4 项默认全选；四 tab 同级；账本头像用户名、欠酒 / 加酒可编辑，无重复按钮 | 仅自己残留、默认未全选、账本能力被关键事件替代、普通 UI 重复按钮 |
| 简报 / 图片 / 分享 | 简报大图可打开返回；图片直显并进入相册 / 简报 / 分享 / 保存图；无审核阻塞 | `brief not found`、`task failed`、照片 / 账本 / 事件为空、审核阻塞文案、保存图路径缺失 |
| 调试器 / 文案 | `status --storage` 成功，Console / Network 无阻塞红错，页面无工程字段和旧品牌，token 只写后 8 位 | `Remote debug connection lost`、`ERR_CONNECTION_REFUSED`、完整 token 泄露、`PR Seed` / `IT-MOMENTS` / `raw/debug` / 旧品牌可见 |

##### 13.16.65.4 当前回报给 PM

`PR-QA-LINK-CLEANUP-008B-UX-DELTA-RETEST` 已登记待测矩阵，不代表通过。测试等待前端 `PR-FE-LINK-CLEANUP-008B-UX-DELTA` 回包后执行；复测前必须先跑 `npm.cmd run wechat:auto -- status --port 9420 --storage`，再按 13.16.65.2 记录命令原文、page data、Console/Network/storage、角色身份/token 后 8 位、通过项、退回对象和下一步责任人。截图失败可用 page data，但不得写截图通过。

#### 13.16.66 `PR-QA-LINK-CLEANUP-008B-UX-DELTA-RETEST` 2026-06-18 前端 14.54 回包后工具链复核

记录时间：2026-06-18。前端 `PR-FE-LINK-CLEANUP-008B-UX-DELTA` 已在计划 14.54 回包：改动文件为 `miniprogram/pages/index/index.wxml` 和 `miniprogram/pages/index/index.less`，首页底部导航收敛为 `首页 / 工具箱 / 我的`，删除底部相册常驻入口和未使用二级入口样式；前端自报 `typecheck`、`check:encoding`、目标 diff check 通过，PM 已复跑三项通过。本节只记录测试侧工具链复核，不改源码、不改 PM 总台账，不把静态验证或旧截图写成预览通过。

##### 13.16.66.1 DevTools 9420 恢复尝试

| 步骤 | 命令原文 | 结果 |
| --- | --- | --- |
| 启动 / 确认自动化端口 | `pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420` | 失败，原文：`WeChat DevTools CLI not found: D:\wechatkaifa\微信web开发者工具\cli.bat`；异常来自 `scripts\start-wechat-devtools-automation.ps1:11`。 |
| status / storage 前置 | `npm.cmd run wechat:auto -- status --port 9420 --storage --output docs/runtime/pr-qa-link-cleanup-008b-status-20260618.png` | 失败，原文：`Error: Failed connecting to ws://127.0.0.1:9420, check if target project window is opened with automation enabled. If DevTools automation is not running, retry with --launch.`；堆栈来自 `miniprogram-automator/out/Launcher.js` 和 `scripts/wechat-devtools-automator.js`。 |

##### 13.16.66.2 本轮证据状态

| 项 | 记录 |
| --- | --- |
| page / query | 未取得。`status --storage` 未连接到 9420，不能读取当前页。 |
| storage / token | 未取得。不得补写历史 token 或完整 token。 |
| Console / Network | 未取得。不能证明 Console `[]` 或 Network 正常。 |
| 截图 | `docs/runtime/pr-qa-link-cleanup-008b-status-20260618.png` 未生成有效截图；不得写截图通过。 |
| 可执行矩阵 | 13.16.65 的首页三项、工具箱三工具、最近相册首图、创建页、邀请、拍照回流、授权、局内四 tab、账本加减、个人中心、简报大图、分享图与数据破界均未执行。 |

##### 13.16.66.3 当前判定与退回对象

| 项 | 判定 | 下一步责任 |
| --- | --- | --- |
| 前端 14.54 静态回包 | `静态验证已回收 / 待预览复测` | 前端已交静态证据；不能替代测试预览框验收。 |
| DevTools 9420 | `自动化会话 / CLI 路径阻塞` | 工具链 / PM / 环境负责人先修复微信开发者工具 CLI 路径或重新启用自动化端口；建议确认真实 `cli.bat` 路径并更新启动脚本参数或本机安装路径。 |
| 008B 预览矩阵 | `未执行 / 阻塞` | 测试待 `status --storage` 成功后，按 13.16.65 完整复测；不得用旧截图或前端自测截图写通过。 |

##### 13.16.66.4 当前回报给 PM

`PR-QA-LINK-CLEANUP-008B-UX-DELTA-RETEST` 当前状态：`前端 14.54 静态回包已记录 / DevTools 9420 自动化会话阻塞 / 未取得 page data、Console、Network、storage 或截图证据 / 13.16.65 点击矩阵未执行 / 不代表预览框通过`。下一步：先修复 `D:\wechatkaifa\微信web开发者工具\cli.bat` 路径或恢复已启用自动化的 DevTools 会话；测试重跑 `npm.cmd run wechat:auto -- status --port 9420 --storage` 成功后，再执行首页底部三项、工具箱至少 3 个工具、最近相册首图、创建页、邀请、拍照回流、局内四 tab、账本加减、个人中心入口、简报大图、分享图与数据破界矩阵。

#### 13.16.67 `PR-QA-LINK-CLEANUP-008B-UX-DELTA-RETEST` 2026-06-18 工具链恢复后预览框实跑

记录时间：2026-06-18。PM 追加工具链恢复证据：微信开发者工具 `2.01.2510290` 已通过 winget 官方源重新安装，`D:\wechatkaifa\微信web开发者工具\cli.bat` 和资源文件已恢复；PM `status --storage` 曾成功读取 `pages/index/index`、Console `[]`、`runtime-api-base=http://127.0.0.1:3221/api/v1`、token 后 8 位 `4ea6c85e`。测试本轮重新跑 13.16.65 矩阵；只记录预览框证据和失败项，不写上线通过。

##### 13.16.67.1 调试器 / storage 前置

| 步骤 | 命令原文 | 结果 |
| --- | --- | --- |
| 启动 / 确认自动化端口 | `pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420` | 成功，原文：`{"ok":true,"action":"already-listening","port":9420,"owningProcess":23768,"projectPath":"F:\\codexlist\\jiuzhuopanguan"}`。 |
| status / storage | `npm.cmd run wechat:auto -- status --port 9420 --storage --output docs/runtime/pr-qa-link-cleanup-008b-status-20260618.png` | 成功，截图：`docs/runtime/pr-qa-link-cleanup-008b-status-20260618.png`；page=`pages/tools/index`，query=`{}`，Console=`[]`。 |

storage 摘要：`runtime-api-base=http://127.0.0.1:3221/api/v1`；`social-current-profile-id=user-1781756527691-ff0197`；profile name=`聚会记录师成员A`；`identityTag=PRCS`；`jzp-user-token=""`，`social-user-session-token=""`，本轮 QA 实测 token 未写入 storage，token 后 8 位记为 `空 / tokenPresent=false`。不得使用 PM 前置证据里的 token 尾号替代本轮 storage 证据。

##### 13.16.67.2 页面矩阵结果

| 用例 | 命令 / 截图 | page / query / data / Console 摘要 | 判定 |
| --- | --- | --- | --- |
| 首页待开局 / 底部三项 / 最近相册 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/index/index" --wait 6000 --data home,sessionReturn,recentAlbums,partyItems,createdAt,displayCreatedAt,loading,loggedIn --output docs/runtime/pr-qa-link-cleanup-008b-home-20260618.png` | page=`pages/index/index`，query=`{}`，Console=`[]`；`sessionReturn.visible=false`，`loggedIn=false`，`loading=false`；截图显示底部仅 `首页 / 工具箱 / 我的`，未见 `聚会待开局`；`home.recentTools` 三项 `imageUrl=""`、`usedAt=""`。截图：`docs/runtime/pr-qa-link-cleanup-008b-home-20260618.png`。 | `局部通过 / 待修`：无进行中空态不展示待开局、首页底部三项通过；最近相册首张真实照片封面和创建时间未证实，退回前端 / 接口样本。 |
| 工具箱列表 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/tools/index" --wait 5000 --data tools,allTools,filteredTools,categories,activeCategory,activeCategoryName --output docs/runtime/pr-qa-link-cleanup-008b-tools-20260618.png` | page=`pages/tools/index`，query=`{}`，Console=`[]`；`allTools=[]`，`filteredTools=[]`，`categories=[all]`；截图显示 `没有匹配工具 / 当前没有分类结果`，底部仍显示 `首页 / 工具箱 / 聚会账本 / 我的`。截图：`docs/runtime/pr-qa-link-cleanup-008b-tools-20260618.png`。 | `退回前端 008B`：工具箱列表为空，不能证明列表内至少 3 个工具可用；工具页底部仍残留 4 项含 `聚会账本`，与首页三项收敛不一致。 |
| 工具详情抽测 1 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/tool-detail/index?id=image-compress" --wait 4000 --data toolId,toolName,toolMode,summary,errorText --output docs/runtime/pr-qa-link-cleanup-008b-tool-image-compress-20260618.png` | page=`pages/tool-detail/index`，query=`{id:"image-compress"}`，Console=`[]`；`toolName=图片压缩`，`toolMode=image-compress`，summary 为微信原生压缩能力说明。 | `局部通过`：直达详情可打开；但不能抵消工具箱列表为空。 |
| 工具详情抽测 2 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/tool-detail/index?id=json" --wait 4000 --data toolId,toolName,toolMode,summary,errorText --output docs/runtime/pr-qa-link-cleanup-008b-tool-json-20260618.png` | page=`pages/tool-detail/index`，query=`{id:"json"}`，Console=`[]`；`toolName=JSON格式化`，`toolMode=json`。 | `局部通过`：直达详情可打开；但列表入口仍失败。 |
| 工具详情抽测 3 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/tool-detail/index?id=qr-code" --wait 3000 --data toolId,toolName,toolMode,summary,errorText --output docs/runtime/pr-qa-link-cleanup-008b-tool-qr-code-20260618.png` | page=`pages/tool-detail/index`，query=`{id:"qr-code"}`，Console=`[]`；`toolName=二维码生成`，summary 命中旧词：`适合酒局邀人和活动卡片场景`。 | `退回前端 008B 文案`：直达详情可打开，但用户可见 / page data 文案仍有旧 `酒局` 语义。 |
| 创建页 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/create-session/index" --wait 2000 --data sessionName,currentTimeText,themeOptions,playerCount,templates,templatesLoading --output docs/runtime/pr-qa-link-cleanup-008b-create-current-time-20260618.png` | page=`pages/create-session/index`，query=`{}`，Console=`[]`；`currentTimeText=今天 16:16`，`playerCount=2`，`templates=[]`，`templatesLoading=true`；截图未见轻量主题选择，仅见 `主题和高级设置可稍后调整` 提示。截图：`docs/runtime/pr-qa-link-cleanup-008b-create-current-time-20260618.png`。 | `局部通过 / 待观察`：无可见轻量主题选择、实时时间可见；`templatesLoading=true` 需前端确认是否仍有隐藏加载残留。 |
| 邀请预览 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/invite-group/index?sessionId=session-1781756527692-d277f0&inviteCode=E52MK5" --wait 6000 --data sessionId,inviteCode,inviteStatusText,joinedCount,playerCount,joinStatusPlayers,photoHighlights,accountingHighlights,shareButtons,loading,errorText --output docs/runtime/pr-qa-link-cleanup-008b-invite-preview-20260618.png` | page=`pages/invite-group/index`，query 含 `sessionId` / `inviteCode`，Console=`[]`；dataKeys 仅 `inviteCode,joinedCount,playerCount,sessionId,sessionName,joinStatusText`；返回 `sessionId=""`、`inviteCode=""`、`joinedCount=0`、`playerCount=0`。 | `退回前端 / 接口`：页面可停但目标样本 data 为空，不能证明只保留口令和好友加入状态，也不能证明已删除冗余模块。 |
| 拍照说明 / 默认文案 / 授权 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/moment-editor/index" --wait 4000 --data caption,captionPresets,consentItems,visibility,visibilityOptions,uploadError,submitLabel,errorText --output docs/runtime/pr-qa-link-cleanup-008b-moment-editor-auth-caption-20260618.png`；`npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/moment-editor/index" --selector ".moment-caption-preset" --wait 2000 --data caption,captionPresets,consentItems,visibilityOptions,uploadError --output docs/runtime/pr-qa-link-cleanup-008b-caption-chip-20260618.png` | page=`pages/moment-editor/index`，query=`{}`，Console=`[]`；`captionPresets` 4 条；tap 后 `caption=今晚第一张合影`；`consentItems` 4 项均 `checked=true`；`visibilityOptions` 无 `仅自己`，但仅 3 项且只有 `本聚会可见` active。截图：`docs/runtime/pr-qa-link-cleanup-008b-moment-editor-auth-caption-20260618.png`、`docs/runtime/pr-qa-link-cleanup-008b-caption-chip-20260618.png`。 | `局部通过 / 待修`：默认文案 chip 可填充、授权 4 项全选、无 `仅自己`；未上传图片，不能证明第一张保存后进入进行中；可见项不是 4 项全选，需前端确认需求映射。 |
| 第一张照片 session query | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/moment-editor/index?sessionId=session-1781756527692-d277f0&nodeType=opening" --wait 6000 --data sessionId,nodeType,caption,defaultCaptions,captionLineClamp,visibilityOptions,authorizationOptions,selectedVisibility,selectedAuthorizations,uploadState,nextRoute,errorText --output docs/runtime/pr-qa-link-cleanup-008b-moment-editor-20260618.png` | 实际停在 `pages/tool-detail/index?id=qr-code`，未进入目标 `moment-editor` 带 session 样本。 | `退回前端 / 路由守卫`：不能证明拍第一张保存后进入进行中页。 |
| 局内四 tab | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/live-record/index?sessionId=session-1781756527692-d277f0" --wait 6000 --data sessionId,tabs,activeTab,players,ledgerItems,ledgerCount,canAdjustLedger,ledgerActions,keyEventButtonVisible,errorText --output docs/runtime/pr-qa-link-cleanup-008b-live-record-20260618.png` | page=`pages/live-record/index`，query 含 `sessionId`；data `sessionId=""`、`players=[]`，未返回 `tabs/ledgerItems`；Console 有 30 条 info：`[session-exit] enableAlertBeforeUnload enabled`，非红错但噪音高。 | `退回前端 / 接口`：不能证明 `记录 / 相册 / 分享 / 聚会账本` 四 tab 同级，也不能证明账本数据。 |
| 账本页 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/ledger/index?partyId=session-1781756527692-d277f0&ledgerId=ledger-session-1781756527692-d277f0" --wait 6000 --data sessionId,partyId,ledgerId,players,ledgerItems,canAdjustLedger,ledgerActions,keyEventButtonVisible,errorText --output docs/runtime/pr-qa-link-cleanup-008b-ledger-20260618.png` | page=`pages/ledger/index`，query 含 `partyId/ledgerId`；data `sessionId=""`、`players=[]`，未返回 `ledgerItems`；Console 同 live-record 为重复 info。 | `退回前端 / 接口`：头像用户名、欠酒 / 加酒、可加减均未证实。 |
| 个人中心 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/me/index" --wait 3000 --data features,momentSummaries,wineStats,currentProfile,loggedIn,pendingAlbumTotal,visiblePendingAlbums --output docs/runtime/pr-qa-link-cleanup-008b-me-fields-20260618.png` | page=`pages/me/index`，query=`{}`，Console=`[]`；`features=[我的相册,聚会账本,工具箱,好友管理,资料设置]`，5 项分流；`loggedIn=false`；`currentProfile.signature=PRCS clean slate actual fixture`，`identityTag=PRCS`。 | `局部通过 / 待修`：入口数据去重并非大多跳相册；page data 仍含 `PRCS clean slate actual fixture/PRCS` 测试字段，需确认页面 UI 不外显。 |
| 简报大图 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/session-brief/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999" --wait 8000 --data briefId,sessionId,photoHighlights,accountingHighlights,keyEvents,timelineNodes,previewVisible,errorText,loading --output docs/runtime/pr-qa-link-cleanup-008b-brief-20260618.png` | page=`pages/session-brief/index`，query 含 `sessionId/briefId`，Console=`[]`；`briefId=brief-1781756527712-95eff999`，`sessionId=session-1781756527692-d277f0`，`accountingHighlights=[]`，`timelineNodes=[]`，`errorText=简报加载失败`，`loading=false`。 | `退回接口 / 前端 local facade`：不能证明简报图片可点大图返回，照片 / 账本 / 事件为空。 |
| share poster / 保存图 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999&taskId=share-task-1781756527713-442cb75c" --wait 8000 --data photoHighlights,accountingHighlights,keyEvents,readyShareImageUrl,shareTask,saveState,errorText --output docs/runtime/pr-qa-link-cleanup-008b-share-poster-20260618.png` | 实际停在 `pages/tools/index`，query=`{}`，data=`{}`，Console=`[]`。 | `退回前端 / 路由或数据守卫`：指定 share-poster 样本未停页，不能证明照片 + 账本同屏、保存图或 ready 状态。 |
| share-preview 回流 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-preview/index?shareId=share-return-session-1781756527692-d277f0&inviteCode=E52MK5&briefId=brief-1781756527712-95eff999" --wait 8000 --data shareSummary,photoHighlights,accountingHighlights,keyEvents,errorText,inviteStatusText,joinedCount,playerCount --output docs/runtime/pr-qa-link-cleanup-008b-share-preview-20260618.png` | page=`pages/share-preview/index`，query 含 `shareId/inviteCode/briefId`，Console=`[]`；`shareSummary=这场聚会的可分享照片和账本高光会在这里汇总。`，`photoHighlights=[]`，`accountingHighlights=[]`，`keyEvents=[]`，`errorText=这张分享页暂时无法展示，请稍后重试`，`joinedCount=0`，`playerCount=0`。 | `退回接口 / 前端`：回流可停页但真实照片 + 聚会账本同屏未证实，错误态不能写分享链路通过。 |

##### 13.16.67.3 Network / API 摘要

| 命令原文 | 结果 | 判定 |
| --- | --- | --- |
| `curl.exe -sS -i --max-time 10 http://127.0.0.1:3221/api/v1/config/home` | 失败，原文：`curl: (7) Failed to connect to 127.0.0.1 port 3221 after 2020 ms: Couldn't connect to server`。 | `退回接口联调 / 后端本地服务`：DevTools storage 指向 local API base，但 3221 当前拒连，brief/share/album/ledger 实际数据无法闭环。 |
| `curl.exe -I --max-time 10 http://127.0.0.1:3221/uploads/moments/share-tasks/share-task-1781756527713-442cb75c.png` | 失败，原文：`curl: (7) Failed to connect to 127.0.0.1 port 3221 after 2019 ms: Couldn't connect to server`。 | `保存图 / PNG 原图阻塞`：不能证明 ready 保存图路径或 PNG 原图存在。 |
| `Get-ChildItem docs/runtime -Filter "pr-int-link-cleanup-PRCS-20260618-008*"` | 找到接口联调摘要与 sanitized JSON：`pr-int-link-cleanup-PRCS-20260618-008-fix-sanitized.md`、`pr-int-link-cleanup-PRCS-20260618-008-sanitized.json`、`pr-int-link-cleanup-PRCS-20260618-008-sanitized.md`。 | 样本文件存在不等于当前 DevTools / local API 可读；本轮仍以 3221 拒连为阻塞。 |

##### 13.16.67.4 本轮结论与退回对象

| 项 | 结论 | 退回 / 下一步 |
| --- | --- | --- |
| DevTools 9420 工具链 | `已恢复可用` | status、relaunch、tap 本轮可执行；截图多数可生成。 |
| 首页底部三项 | `预览框局部确认` | 首页截图显示 `首页 / 工具箱 / 我的`，无 `聚会待开局` 空态误显；但仅首页通过，不代表全局底部导航通过。 |
| 工具箱 | `退回前端 008B` | 工具箱列表 data 为空且截图为空态；工具页底部仍有 `聚会账本` 第四项；QR 工具说明仍有旧 `酒局` 文案。 |
| 创建 / 拍照文案 / 授权 | `局部确认 / 待补` | 创建页无可见轻量主题、时间实时；默认文案 chip 可填充、4 个 consent 项全选；未完成图片上传和第一张保存回流，不能写拍照链路通过。 |
| 邀请 / 局内 / 账本 | `退回前端 / 接口` | 指定样本 data 为空或缺 tabs/ledgerItems，不能证明邀请减法、四 tab 同级、头像用户名和欠酒 / 加酒可编辑。 |
| 简报 / 分享 / 保存图 | `P0 阻塞` | local API `127.0.0.1:3221` 拒连；brief `简报加载失败`；share-poster 未停目标页；share-preview 照片 / 账本 / 事件为空；PNG 原图不可取。退回接口联调 / 后端恢复 local 3221，并退回前端核查 share-poster 路由守卫。 |
| 数据破界 / 旧词 | `仍有残留` | `qr-code` summary 命中 `酒局`；personal page data 含 `PRCS clean slate actual fixture/PRCS`；工具页空态和分享错误态不能作为 clean 通过。 |

本轮总判定：`工具链恢复 / 首页底部三项与部分创建、文案、授权项局部确认 / 008B 矩阵未通过 / 简报、分享、保存图、工具箱、局内账本仍阻塞或退回`。不得写预览框阶段通过、真机通过或上线通过。下一步责任：前端修复工具箱列表、工具页底部导航、旧词、share-poster 停页和带 session 的拍照 / 邀请 / 局内 data；接口联调 / 后端恢复 `http://127.0.0.1:3221/api/v1` local facade 并保证 `/briefs/:briefId`、`/share-images/:taskId`、PNG 原图可读；测试在两方回包后复跑 13.16.65 剩余失败项。

#### 13.16.68 `PR-QA-LINK-CLEANUP-008C-TOOLBOX-RETEST` 2026-06-18 工具箱兜底专项复测

记录时间：2026-06-18。前端 `PR-FE-LINK-CLEANUP-008C-TOOLBOX-LIST-FALLBACK` 已在计划 14.55 回包：工具箱远端目录为空时改用本地工具清单兜底，工具页底部导航应保持 `首页 / 工具箱 / 我的`，二维码工具文案应从旧 `酒局 / 邀局` 改为 `聚会邀人 / 邀人`。本节只复测工具箱专项，不改变 13.16.67 对 `share-poster / share-preview / session-brief / live-record / ledger / local 3221 refused` 的退回结论。

##### 13.16.68.1 status / storage 前置

| 步骤 | 命令原文 | 结果 |
| --- | --- | --- |
| status / storage | `npm.cmd run wechat:auto -- status --port 9420 --storage --output docs/runtime/pr-qa-link-cleanup-008c-status-20260618.png` | 成功，截图：`docs/runtime/pr-qa-link-cleanup-008c-status-20260618.png`；当前 page=`pages/tool-detail/index`，query=`{id:"text-count",name:"%E6%96%87%E5%AD%97%E8%AE%A1%E6%95%B0"}`；Console=`[]`。 |

storage 摘要：`runtime-api-base=http://127.0.0.1:3221/api/v1`；`social-current-profile-id=user-1781756527691-ff0197`；profile name=`聚会记录师成员A`；`identityTag=PRCS`；`jzp-user-token=""`，`social-user-session-token=""`，本轮 token 后 8 位记为 `空 / tokenPresent=false`。

##### 13.16.68.2 工具箱列表 / 底部 tab

| 命令原文 | page / query / data / Console 摘要 | 截图 | 判定 |
| --- | --- | --- | --- |
| `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/tools/index" --wait 6000 --data allTools,filteredTools,popularTools,categoryCards,categories,activeCategory,activeCategoryName,heroTitle,heroSubtitle --output docs/runtime/pr-qa-link-cleanup-008c-tools-index-20260618.png` | page=`pages/tools/index`，query=`{}`，Console=`[]`；`allTools=9`，`filteredTools=5`，`popularTools=4`，`categoryCards=3`，`categories=5`，`activeCategory=all`，`activeCategoryName=全部`，`heroTitle=顺手工具`，`heroSubtitle=常用图片、分享、计算和文本工具都在这里。` | `docs/runtime/pr-qa-link-cleanup-008c-tools-index-20260618.png` | `通过 / 工具箱专项`：列表不再为空；截图显示热门工具 4 个、分类入口可见，底部仅 `首页 / 工具箱 / 我的`，未见重复 `聚会账本` tab。 |

##### 13.16.68.3 从工具箱列表点击 3 个工具

脚本无 `selectorIndex` 参数，本轮使用工具箱页面上的热门工具卡片 `data-id` 精确点击；不是直达详情 URL。

| 工具 | 命令原文 | page / query / data / Console 摘要 | 截图 | 判定 |
| --- | --- | --- | --- | --- |
| 图片压缩 | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/tools/index" --selector ".tools-tile[data-id='image-compress']" --selectorTimeout 8000 --wait 3000 --data toolId,toolName,toolMode,toolError --output docs/runtime/pr-qa-link-cleanup-008c-tap-image-compress-20260618.png` | page=`pages/tool-detail/index`，query=`{id:"image-compress",name:"%E5%9B%BE%E7%89%87%E5%8E%8B%E7%BC%A9"}`，Console=`[]`；`toolId=image-compress`，`toolName=图片压缩`，`toolMode=image-compress`，`toolError=""`。 | `docs/runtime/pr-qa-link-cleanup-008c-tap-image-compress-20260618.png` | `通过 / 工具箱专项`。 |
| 文字计数 | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/tools/index" --selector ".tools-tile[data-id='text-count']" --selectorTimeout 8000 --wait 3000 --data toolId,toolName,toolMode,toolError --output docs/runtime/pr-qa-link-cleanup-008c-tap-text-count-20260618.png` | page=`pages/tool-detail/index`，query=`{id:"text-count",name:"%E6%96%87%E5%AD%97%E8%AE%A1%E6%95%B0"}`，Console=`[]`；`toolId=text-count`，`toolName=文字计数`，`toolMode=text-count`，`toolError=""`。 | `docs/runtime/pr-qa-link-cleanup-008c-tap-text-count-20260618.png` | `通过 / 工具箱专项`。 |
| 二维码生成 | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/tools/index" --selector ".tools-tile[data-id='qr-code']" --selectorTimeout 8000 --wait 3000 --data toolId,toolName,toolMode,toolError,summary,tips --output docs/runtime/pr-qa-link-cleanup-008c-tap-qr-code-20260618.png` | page=`pages/tool-detail/index`，query=`{id:"qr-code",name:"%E4%BA%8C%E7%BB%B4%E7%A0%81%E7%94%9F%E6%88%90"}`，Console=`[]`；`toolId=qr-code`，`toolName=二维码生成`，`toolMode=qr-code`，`toolError=""`；详情页 data 仍为 `summary=当前提供轻量码阵预览和分享口令生成，适合酒局邀人和活动卡片场景。`，tips 仍有 `拉群/邀局`。 | `docs/runtime/pr-qa-link-cleanup-008c-tap-qr-code-20260618.png` | `可进入详情 / 文案退回`：点击链路通过，但预览运行时详情页仍显示旧 `酒局 / 邀局` 文案，不能写旧词净化通过。 |

补充核查：当前工作树 `miniprogram/utils/toolkit.ts` 中二维码工具源码已是 `适合聚会邀人和活动卡片场景`、`拉群/邀人`；但 DevTools 右侧预览详情页 data 仍返回旧词。本轮以预览框实际 data 为验收依据，按 `前端 / DevTools 编译刷新不一致或详情页数据源残留` 退回复核。

##### 13.16.68.4 本轮结论与退回对象

| 项 | 结论 | 下一步责任 |
| --- | --- | --- |
| 工具箱列表兜底 | `工具箱专项预览确认` | 前端 008C：列表数量、热门工具、分类卡片、Console 均符合 14.55 目标。 |
| 工具页底部 tab | `预览确认` | 前端 008C：截图显示底部仅 `首页 / 工具箱 / 我的`，重复 `聚会账本` tab 已消失。 |
| 列表点击进入详情 | `局部通过` | 图片压缩、文字计数、二维码生成均可从工具箱卡片点击进入详情，`toolError=""`，Console=`[]`。 |
| 旧词净化 | `仍退回前端 / 预览刷新复核` | 二维码详情页实际 page data 仍含 `酒局邀人`、`邀局`；需前端确认详情页数据源或 DevTools 编译刷新，复测前不能写旧词净化通过。 |
| 008B 全链路 | `仍不通过 / 不受 008C 影响` | 13.16.67 中 `session-brief 简报加载失败`、`share-poster 未停目标页`、`share-preview 照片 / 账本 / 事件为空`、`live-record / ledger data 空`、`local 3221 refused` 继续分别退回前端 / 接口联调 / 后端。 |

本轮总判定：`PR-QA-LINK-CLEANUP-008C-TOOLBOX-RETEST 工具箱列表、底部三项、3 个工具点击链路局部通过；二维码详情旧词仍退回；008B 分享 / 简报 / 账本 / local facade 阻塞不变`。不得写上线通过。

#### 13.16.69 `PR-QA-DEVTOOLS-SAFE-SERIAL-008D` 2026-06-18 DevTools 安全串行门禁

记录时间：2026-06-18。PM 追加确认：用户未操作电脑，16:30 左右 DevTools / 自动化进程波动属于我们侧操作导致。自本节起，测试侧停止并行 tap、并行 relaunch、高频清缓存和自行重启微信开发者工具；后续 008C / 008B 复测必须先执行安全串行门禁。PM 当前已恢复首页截图：`docs/runtime/pm-devtools-recover-home-9420.png`，Console=`[]`，主进程 `Responding=True`；该证据只代表调试器恢复，不代表页面通过。

##### 13.16.69.1 串行执行规则

| 规则 | 执行要求 | 失败处理 |
| --- | --- | --- |
| 单线程 DevTools 操作 | 所有 9420 用例必须串行执行：先 `node scripts/wechat-devtools-automator.js status --port 9420 --storage`，确认 page/query/storage/Console 后，再执行一个单页 `relaunch` 或一次 `tap`。 | 不再使用 `multi_tool_use.parallel` 跑任何 DevTools `status/relaunch/tap/screenshot`；不同时跑多个 `npm.cmd run wechat:auto`。 |
| 单用例证据 | 每个用例记录：命令原文、开始时间、结束时间、page/query、关键 page data、Console 摘要、Network/API 摘要、storage 摘要、截图路径；token 只写后 8 位或 `tokenPresent=false`。 | 缺开始/结束时间、Console/storage 或截图/page data 时，不写通过。 |
| 异常即停 | 若出现 `Connection closed`、黑屏、白屏、窗口无响应、截图持续失败或 status 无法返回当前页，立即停止当前矩阵。 | 退回 PM / 工具链恢复；不得继续扩大点击矩阵，不得自行高频重启 DevTools 或清缓存。 |
| 当前恢复证据边界 | `docs/runtime/pm-devtools-recover-home-9420.png`、Console `[]`、主进程 `Responding=True` 仅作为 DevTools 恢复旁证。 | 不能把 PM 恢复截图写成首页、工具箱、分享页或任一业务页面通过。 |

##### 13.16.69.2 后续命令模板

| 步骤 | 命令模板 | 记录格式 |
| --- | --- | --- |
| 前置 status | `node scripts/wechat-devtools-automator.js status --port 9420 --storage --output docs/runtime/pr-qa-<task>-status-<yyyymmdd-hhmm>.png` | `start=<ISO/local time>`、`end=<ISO/local time>`、page/query、Console、storage API base/profile/tokenTail、截图路径。 |
| 单页 relaunch | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "<page-path>" --wait <ms> --data <keys> --output docs/runtime/pr-qa-<task>-<case>-<yyyymmdd-hhmm>.png` | 只在前置 status 成功后执行；记录 page/query/data/Console/Network/storage 摘要。 |
| 单次 tap | `node scripts/wechat-devtools-automator.js tap --port 9420 --path "<source-page>" --selector "<selector>" --selectorTimeout <ms> --wait <ms> --data <keys> --output docs/runtime/pr-qa-<task>-tap-<case>-<yyyymmdd-hhmm>.png` | 一次只点一个 selector；tap 前后不得并发 relaunch；失败原文照抄。 |
| API / Network 辅证 | 对 local facade 只读接口使用单条 `curl.exe --max-time 10 ...`，不得和 DevTools 命令并行 | 记录 HTTP 状态、错误原文、是否 200；不得泄露完整 token。 |

##### 13.16.69.3 当前暂停 / 等待项

| 项 | 当前状态 | 下一步 |
| --- | --- | --- |
| 008C 二维码详情文案 | 13.16.68 预览 data 仍含 `酒局邀人`、`邀局`；源码核查显示 `toolkit.ts` 已改为 `聚会邀人`、`邀人`，但预览运行态未同步。 | 等前端 `二维码详情运行态旧词` 修复 / 刷新回包后，再按 13.16.69.1 串行复测；未回包前不继续点击二维码详情，不写旧词净化通过。 |
| 008C 工具箱列表 | 13.16.68 已取得局部通过证据：`allTools=9`、`filteredTools=5`、`popularTools=4`、`categoryCards=3`，底部三项，3 个工具可进入详情。 | 不因二维码旧词或 008B 阻塞撤销工具箱列表兜底局部通过；后续只补二维码文案复测。 |
| 008B 分享 / 简报 / 账本 | 13.16.67 仍为阻塞：`session-brief 简报加载失败`、`share-poster 未停目标页`、`share-preview 照片 / 账本 / 事件为空`、`live-record / ledger data 空`、local `3221 refused`。 | 等前端 / 接口联调 / 后端回包后，用本节串行门禁逐项复测；不得因为 DevTools 恢复或 008C 工具箱通过写 008B 全链路通过。 |

##### 13.16.69.4 回报给 PM

`PR-QA-DEVTOOLS-SAFE-SERIAL-008D` 已登记为测试侧后续门禁：从现在起停止并行 DevTools tap / relaunch / status，不高频清缓存或自行重启开发者工具；每个 9420 用例必须按 `status --storage -> 单页 relaunch 或单次 tap -> 记录开始/结束时间和证据` 串行执行。若出现 `Connection closed`、黑屏、白屏或无响应，测试立即停止并退回 PM。当前等待前端二维码详情运行态旧词修复回包后，再串行复测二维码文案；008B 其他阻塞项继续等待对应前端 / 接口联调 / 后端修复。

#### 13.16.70 `PR-QA-LINK-CLEANUP-008D-QR-COPY-RETEST` 2026-06-18 二维码详情旧词串行复测

记录时间：2026-06-18。前端 14.56 / 14.57 已确认二维码详情旧词不是第二数据源，PM 已串行复核 DevTools 9420 运行态为 `聚会邀人 / 拉群/邀人`。测试按 13.16.69 串行规则只复测二维码详情文案，不扩大点击矩阵，不改 13.16.67 对 `session-brief / share-poster / share-preview / live-record / ledger / local 3221 refused` 的阻塞结论。

##### 13.16.70.1 串行命令与证据

| 步骤 | 命令原文 | 开始 / 结束时间 | page / query / data / storage / Console 摘要 | 判定 |
| --- | --- | --- | --- | --- |
| status / storage | `node scripts/wechat-devtools-automator.js status --port 9420 --storage` | start=`2026-06-18T16:35:33.8986084+08:00`；end=`2026-06-18T16:35:34.1237051+08:00` | page=`pages/tool-detail/index`，query=`{id:"qr-code"}`；Console=`[]`；storage `runtime-api-base=http://127.0.0.1:3221/api/v1`，`social-current-profile-id=user-1781756527691-ff0197`，profile name=`聚会记录师成员A`，`identityTag=PRCS`，`jzp-user-token=""`，`social-user-session-token=""`，token 后 8 位=`空 / tokenPresent=false`；screenshot=`null`，本命令未指定 `--output`。 | `通过 / 串行前置`：9420 可读，无 `Connection closed`、黑屏、白屏或无响应。 |
| 二维码详情 relaunch | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path /pages/tool-detail/index?id=qr-code --wait 2500 --data toolId,toolName,toolMode,summary,tips,toolError` | start=`2026-06-18T16:35:40.2962895+08:00`；end=`2026-06-18T16:35:47.1893562+08:00` | page=`pages/tool-detail/index`，query=`{id:"qr-code"}`；Console=`[]`；`toolId=qr-code`，`toolName=二维码生成`，`toolMode=qr-code`，`summary=当前提供轻量码阵预览和分享口令生成，适合聚会邀人和活动卡片场景。`，tips 含 `适合场景=拉群/邀人`，`toolError=""`；screenshot=`null`，本命令未指定 `--output`。 | `通过 / 工具箱专项`：13.16.68 的二维码详情旧词退回项已复测关闭。 |

##### 13.16.70.2 当前结论与边界

| 项 | 结论 | 下一步 |
| --- | --- | --- |
| 二维码详情旧词 | `已复测通过 / 工具箱专项` | 13.16.68 中 `酒局邀人 / 邀局` 退回项关闭；后续若工具详情再改动，仍按 13.16.69 串行门禁复测。 |
| 008C 工具箱专项 | `工具箱列表、底部三项、3 个工具点击链路 + 二维码详情文案局部通过` | 只代表工具箱专项预览框阶段局部通过，不代表全链路或上线通过。 |
| 008B 其他阻塞 | `保持阻塞 / 不受本轮影响` | 13.16.67 的 `session-brief 简报加载失败`、`share-poster 未停目标页`、`share-preview 照片 / 账本 / 事件为空`、`live-record / ledger data 空`、local `3221 refused` 继续等待接口联调 / 后端恢复 local backend 同一 store，并等待前端复修后串行复测。 |

本轮总判定：`PR-QA-LINK-CLEANUP-008D-QR-COPY-RETEST 二维码详情文案已按 008D 串行规则复测通过；008C 工具箱专项旧词退回项关闭；008B 分享 / 简报 / 账本 / local facade 阻塞不变`。不得写上线通过。

#### 13.16.71 `PR-QA-LINK-CLEANUP-008D-LOCAL-3221-RETEST` 2026-06-18 local 3221 页面串行复测

记录时间：2026-06-18。接口联调 3.41 已提供 local 3221 runtime 准入：`docs/runtime/pr-int-local-api-3221-008d-runtime.md`，PID=`30080`，API base=`http://127.0.0.1:3221/api/v1`；只读接口证据显示 `/config/home` 200、clean `/briefs/brief-1781756527712-95eff999` 200 且 `photoHighlights=2/accountingHighlights=4/keyEvents=2/ledgerSummary.entryCount=2`，`/share-images/share-task-1781756527713-442cb75c` 200 ready，PNG GET 200、HEAD 404 warning。本节按 13.16.69 串行规则执行页面复测；不并行、不重启、不清缓存，不因 API 200 直接写页面通过。

##### 13.16.71.1 status / storage 前置

| 步骤 | 命令原文 | 开始 / 结束时间 | 摘要 | 判定 |
| --- | --- | --- | --- | --- |
| status / storage | `node scripts/wechat-devtools-automator.js status --port 9420 --storage --output docs/runtime/pr-qa-link-cleanup-008d-local3221-status-20260618.png` | start=`2026-06-18T16:41:19.8368708+08:00`；end=`2026-06-18T16:41:20.2134429+08:00` | page=`pages/tool-detail/index`，query=`{id:"qr-code"}`；Console=`[]`；storage `runtime-api-base=http://127.0.0.1:3221/api/v1`，`social-current-profile-id=user-1781756527691-ff0197`，profile name=`聚会记录师成员A`，`identityTag=PRCS`，`jzp-user-token=""`，`social-user-session-token=""`，token 后 8 位=`空 / tokenPresent=false`；截图：`docs/runtime/pr-qa-link-cleanup-008d-local3221-status-20260618.png`。 | `前置可执行 / token 不匹配`：API base 和 memberA profile 正确，但完整 token 未在 DevTools storage 中出现，成员态页面可能无法读 protected 数据。 |

##### 13.16.71.2 页面串行 relaunch 结果

| 页面 | 命令原文 | 开始 / 结束时间 | page / query / data / Console 摘要 | 截图 | 判定 |
| --- | --- | --- | --- | --- | --- |
| session-brief | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/session-brief/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999" --wait 5000 --data briefId,sessionId,photoHighlights,accountingHighlights,keyEvents,timelineNodes,timeline,previewVisible,errorText,loading,shareImageStatus,shareImageTaskId,ledgerSummary --output docs/runtime/pr-qa-link-cleanup-008d-local3221-brief-20260618.png` | start=`2026-06-18T16:41:34.8141513+08:00`；end=`2026-06-18T16:42:02.9419570+08:00` | page=`pages/session-brief/index`，query 含目标 `sessionId/briefId`；Console=`[]`；`accountingHighlights=[]`，`timelineNodes=[]`，`ledgerSummary={}`，`loading=false`，`errorText=not session member`。 | `docs/runtime/pr-qa-link-cleanup-008d-local3221-brief-20260618.png` | `退回前端 / storage 联调`：页面停目标但 UI 可见 `not session member`，照片不可见，未执行大图点击返回；不能写 brief 通过。 |
| share-poster | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/share-poster/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999&taskId=share-task-1781756527713-442cb75c" --wait 5000 --data photoHighlights,accountingHighlights,keyEvents,readyShareImageUrl,shareTask,saveState,errorText,layoutMode,taskLayoutMode,ledgerIncluded,displayTaskLayoutMode --output docs/runtime/pr-qa-link-cleanup-008d-local3221-share-poster-20260618.png` | start=`2026-06-18T16:42:14.5117225+08:00`；end=`2026-06-18T16:42:25.7297930+08:00` | page=`pages/share-poster/index`，query 含目标 `sessionId/briefId/taskId`；Console=`[]`；`photoHighlights=[]`，`accountingHighlights=[]`，`keyEvents=[]`，`readyShareImageUrl=""`，`saveState=failed`，`errorText=当前账号暂不能查看这张分享页，请使用邀请入口加入聚会`；`shareTask.status=failed`，`shareTask.layoutMode=dual_flow`，`ledgerIncluded=true`，`displayTaskLayoutMode=照片和账本`。 | `docs/runtime/pr-qa-link-cleanup-008d-local3221-share-poster-20260618.png` | `退回前端 / storage 联调`：页面停目标但成员态失败，未显示 ready 保存图、真实照片 + 账本；不能因接口 ready 写页面通过。 |
| share-preview | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/share-preview/index?shareId=share-return-session-1781756527692-d277f0&inviteCode=E52MK5&briefId=brief-1781756527712-95eff999" --wait 5000 --data shareSummary,photoHighlights,accountingHighlights,keyEvents,errorText,inviteStatusText,joinedCount,playerCount,permissionState,shareContentFilter,photoHighlightsNotice --output docs/runtime/pr-qa-link-cleanup-008d-local3221-share-preview-20260618.png` | start=`2026-06-18T16:42:35.8341037+08:00`；end=`2026-06-18T16:42:45.7942957+08:00` | page=`pages/share-preview/index`，query 含目标 `shareId/inviteCode/briefId`；Console=`[]`；`errorText=""`，`inviteStatusText=3/3 位好友已加入`，`joinedCount=3`，`playerCount=3`；但 `photoHighlights=[]`，`accountingHighlights=[]`，`keyEvents=[]`，`shareContentFilter={}`，`photoHighlightsNotice=暂无可展示照片，先去记录一张聚会照片。` | `docs/runtime/pr-qa-link-cleanup-008d-local3221-share-preview-20260618.png` | `退回前端 / 接口合同消费`：公开回流停页且加入状态正确，但照片 / 账本 / 事件未进入页面；不能写分享回流通过。 |
| live-record | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/live-record/index?sessionId=session-1781756527692-d277f0&role=member" --wait 5000 --data sessionId,tabs,activeTab,players,ledgerItems,ledgerCount,canAdjustLedger,ledgerActions,keyEventButtonVisible,errorText,momentNodes,timelineNodes --output docs/runtime/pr-qa-link-cleanup-008d-local3221-live-record-20260618.png` | start=`2026-06-18T16:42:56.3597882+08:00`；end=`2026-06-18T16:43:06.3691154+08:00` | page=`pages/live-record/index`，query 含目标 `sessionId/role=member`；`sessionId=session-1781756527692-d277f0`；`players` 3 人：房主、成员A、成员B；`timelineNodes=[]`；未返回 `tabs/ledgerItems/canAdjustLedger`；Console 为 28 条 info：`[session-exit] enableAlertBeforeUnload enabled`，无红错。截图 UI 显示 `not session member`。 | `docs/runtime/pr-qa-link-cleanup-008d-local3221-live-record-20260618.png` | `退回前端 / storage 联调`：成员姓名可见，但记录区仍 `not session member`，无账本/事件数据，不能证明四 tab + 可编辑账本。 |
| ledger | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/ledger/index?partyId=session-1781756527692-d277f0&ledgerId=ledger-session-1781756527692-d277f0" --wait 5000 --data sessionId,partyId,ledgerId,players,ledgerItems,canAdjustLedger,ledgerActions,keyEventButtonVisible,errorText,entries,summary,canEdit --output docs/runtime/pr-qa-link-cleanup-008d-local3221-ledger-20260618.png` | start=`2026-06-18T16:43:16.8159792+08:00`；end=`2026-06-18T16:43:26.5689238+08:00` | page=`pages/ledger/index`，query 含目标 `partyId/ledgerId`；Console=`[]`；`sessionId=session-1781756527692-d277f0`；`players` 3 人，头像字段为空，姓名可见；每人 `debtCount=0/drinkCount=0`；未返回 `ledgerItems/canAdjustLedger/ledgerActions`。 | `docs/runtime/pr-qa-link-cleanup-008d-local3221-ledger-20260618.png` | `退回前端 / 接口消费`：页面显示 3 成员，但与接口 3.41 `ledgerSummary.entryCount=2/pendingCount=1/addedCount=1` 不一致，欠酒/加酒数据未落地，未证明可编辑入口。 |
| album | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/album/index?partyId=session-1781756527692-d277f0&albumId=album-session-1781756527692-d277f0" --wait 5000 --data partyId,albumId,albumItems,photos,coverImageUrl,recentAlbums,title,errorText,loading,moments,photoList --output docs/runtime/pr-qa-link-cleanup-008d-local3221-album-20260618.png` | start=`2026-06-18T16:43:35.7307775+08:00`；end=`2026-06-18T16:43:45.3725392+08:00` | page=`pages/album/index`，query 含目标 `partyId/albumId`；Console=`[]`；data 仅返回 `loading=false`，未返回 `albumItems/photos/coverImageUrl/recentAlbums/moments/photoList`；截图为空相册。 | `docs/runtime/pr-qa-link-cleanup-008d-local3221-album-20260618.png` | `退回前端 / 接口消费`：album 可停页但封面 / 首图不可见，不能写相册通过。 |

##### 13.16.71.3 Network / API 辅证

| 命令原文 | 开始 / 结束时间 | 结果 | 判定 |
| --- | --- | --- | --- |
| `curl.exe -sS -o NUL -w "HTTP=%{http_code} content_type=%{content_type} bytes=%{size_download} time=%{time_total}\n" --max-time 10 http://127.0.0.1:3221/api/v1/config/home` | start=`2026-06-18T16:44:11.1736474+08:00`；end=`2026-06-18T16:44:11.1981180+08:00` | `HTTP=200 content_type=application/json; charset=utf-8 bytes=673 time=0.001057` | local 3221 已可读，不再按 `ERR_CONNECTION_REFUSED` 退回。 |
| `curl.exe -sS -o NUL -w "HTTP=%{http_code} content_type=%{content_type} bytes=%{size_download} time=%{time_total}\n" --max-time 10 http://127.0.0.1:3221/uploads/moments/share-tasks/share-task-1781756527713-442cb75c.png` | start=`2026-06-18T16:44:18.3706232+08:00`；end=`2026-06-18T16:44:18.3941363+08:00` | `HTTP=200 content_type=image/png bytes=167268 time=0.001429` | PNG GET 可读；不因接口 3.41 记录的 HEAD 404 warning 单独判 PNG 缺失。 |

##### 13.16.71.4 本轮结论与退回对象

| 项 | 结论 | 下一步责任 |
| --- | --- | --- |
| local 3221 | `已恢复 / Network 辅证通过` | 接口联调 / 后端：`/config/home` 和 PNG GET 已可读；如后续需要 HEAD 200，再另派 static HEAD 支持，不阻塞本轮页面判断。 |
| DevTools storage | `token 不匹配 / 成员态阻塞` | PM / 接口联调 / 测试环境：DevTools storage 有 memberA profile，但 `jzp-user-token` 和 `social-user-session-token` 为空；需按 3.41 安全方案注入 memberA token 后 8 位 `4ea6c85e` 对应完整 token，不得公开完整 token。 |
| brief / share-poster / live-record | `退回前端 / storage 联调` | 页面能停目标但仍 `not session member` 或成员态失败，未展示照片 / 账本 / keyEvents / ready 保存图。先修 storage/token，再复测页面消费。 |
| share-preview | `退回前端 / 接口合同消费` | 公开回流加入状态正确，但照片 / 账本 / 事件仍为空；需确认页面是否读取 clean brief 或公开 live 合同字段。 |
| ledger | `退回前端 / 接口消费` | 页面有 3 成员但欠酒/加酒均 0，未反映接口 3.41 的账本摘要，未证明可编辑入口。 |
| album | `退回前端 / 接口消费` | 页面为空相册，未展示封面/首图。 |

本轮总判定：`local 3221 已恢复，PNG GET 可读；但 DevTools storage token 为空导致成员态页面未闭环，brief/share-poster/live-record 仍 not session member 或 failed；share-preview/ledger/album 数据消费仍不满足照片 + 账本 + 相册准出。008B 页面矩阵仍不通过，等待 token 注入和前端/接口消费修复后按 008D 串行规则复测`。不得写预览框阶段全链路通过、真机通过或上线通过。

#### 13.16.72 `PR-QA-LINK-CLEANUP-008D-LOCAL-3221-RETEST-RETRY` 2026-06-18 Storage 恢复后串行重跑

记录时间：2026-06-18。PM 中断修正：13.16.71 失败直接原因是 PM / 自动化侧 DevTools Storage 被旧测试用户污染，用户未操作电脑，不得把 `token 为空 / not session member` 作为最终业务失败收口。PM 已用 miniprogram-automator 最小恢复 Storage，不重启 DevTools、不清缓存、不改业务源码，恢复证据为 `docs/runtime/wechat-automator-status-9420-incident-recovered.png`、`docs/runtime/wechat-automator-status-9420-incident-recovered-check.png`。本节按 13.16.69 串行规则重跑页面矩阵。

##### 13.16.72.1 status / storage 前置

| 步骤 | 命令原文 | 开始 / 结束时间 | 摘要 | 判定 |
| --- | --- | --- | --- | --- |
| status / storage | `npm.cmd run wechat:auto -- status --port 9420 --storage --output docs/runtime/pr-qa-link-cleanup-008d-retry-status-20260618.png` | start=`2026-06-18T16:46:17.5576354+08:00`；end=`2026-06-18T16:46:18.3009992+08:00` | page=`pages/live-record/index`，query=`{sessionId:"session-1781756527692-d277f0",role:"member"}`；Console=`[]`；storage `runtime-api-base=http://127.0.0.1:3221/api/v1`，`social-current-profile-id=user-1781756527691-ff0197`，profile name=`聚会记录师成员A`，`jzp-user-token` 尾号=`4ea6c85e`，完整 token 已脱敏；截图：`docs/runtime/pr-qa-link-cleanup-008d-retry-status-20260618.png`。 | `前置通过`：memberA Storage 已恢复；13.16.71 的 `tokenPresent=false` 不再作为当前判断依据。 |

##### 13.16.72.2 页面串行 relaunch / tap 结果

说明：第一次 brief relaunch 使用未转义 `&briefId` 的 PowerShell 命令被截断，属于命令引用错误，不作为页面业务结论；随后改用 `node ... --path '<url>'` 单引号保护 query 串行重跑。未出现 `Connection closed`、黑屏、白屏或窗口无响应。

| 页面 / 断言 | 命令原文 | 开始 / 结束时间 | page / query / data / Console 摘要 | 截图 | 判定 |
| --- | --- | --- | --- | --- | --- |
| session-brief 数据 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/session-brief/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999' --wait 5000 --data briefId,sessionId,photoHighlights,accountingHighlights,keyEvents,timelineNodes,timeline,previewVisible,errorText,loading,shareImageStatus,shareImageTaskId,ledgerSummary,shareTask --output docs/runtime/pr-qa-link-cleanup-008d-retry-brief-20260618.png` | start=`2026-06-18T16:47:17.7932938+08:00`；end=`2026-06-18T16:47:27.2599938+08:00` | page=`pages/session-brief/index`，query 含目标 `sessionId/briefId`；Console=`[]`；`errorText=""`，`loading=false`；`timelineNodes=4`，含 2 个 imageUrl 照片节点和 2 个事件节点；`accountingHighlights=4`，`ledgerSummary.entryCount=2/pendingCount=1/addedCount=1/hasLedgerData=true`。 | `docs/runtime/pr-qa-link-cleanup-008d-retry-brief-20260618.png` | `数据局部通过 / 视觉待修`：brief 数据已恢复；截图中照片卡片仍呈白色占位，未能视觉确认真实图片像素渲染。 |
| session-brief 图片点击 | `node scripts/wechat-devtools-automator.js tap --port 9420 --path '/pages/session-brief/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999' --selector 'moment-card' --selectorTimeout 8000 --wait 2000 --data briefId,sessionId,timelineNodes,errorText,loading --output docs/runtime/pr-qa-link-cleanup-008d-retry-brief-tap-photo-component-20260618.png` | start=`2026-06-18T16:50:00.5693188+08:00`；end=`2026-06-18T16:50:09.0198788+08:00` | `moment-card` 组件可点；page 仍为 `pages/session-brief/index`；Console=`[]`；`timelineNodes` 仍含 2 个图片节点。前一次 `.moment-card` selector 未找到，属于组件封装 selector 限制。 | `docs/runtime/pr-qa-link-cleanup-008d-retry-brief-tap-photo-component-20260618.png` | `待复核`：点击事件可触发且无红错，但 automator 无法读取系统 `wx.previewImage` 大图层和返回状态；不能写“大图返回通过”。 |
| share-poster | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/share-poster/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999&taskId=share-task-1781756527713-442cb75c' --wait 5000 --data photoHighlights,accountingHighlights,keyEvents,readyShareImageUrl,shareTask,saveState,errorText,layoutMode,taskLayoutMode,ledgerIncluded,displayTaskLayoutMode,posterImagePath,posterImageUrl --output docs/runtime/pr-qa-link-cleanup-008d-retry-share-poster-20260618.png` | start=`2026-06-18T16:47:37.8213027+08:00`；end=`2026-06-18T16:47:47.2810019+08:00` | page=`pages/share-poster/index`，query 含目标 `sessionId/briefId/taskId`；Console=`[]`；`photoHighlights=2`，`accountingHighlights=1`，`keyEvents=2`，`readyShareImageUrl=http://127.0.0.1:3221/uploads/moments/share-tasks/share-task-1781756527713-442cb75c.png`，`shareTask.status=ready`，`shareTask.layoutMode=party_story`，`ledgerIncluded=true`，`saveState=idle`，`errorText=""`，`posterImageUrl=http://store/...png`。 | `docs/runtime/pr-qa-link-cleanup-008d-retry-share-poster-20260618.png` | `数据局部通过 / 视觉待修`：ready 保存图、照片 + 账本 + 事件数据已落地；截图中照片卡仍偏白，需前端 / UI 复核图片实际渲染与视觉准出。 |
| share-preview | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/share-preview/index?shareId=share-return-session-1781756527692-d277f0&inviteCode=E52MK5&briefId=brief-1781756527712-95eff999' --wait 5000 --data shareSummary,photoHighlights,accountingHighlights,keyEvents,errorText,inviteStatusText,joinedCount,playerCount,permissionState,shareContentFilter,photoHighlightsNotice,visibleNodeIds,filteredNodeIds --output docs/runtime/pr-qa-link-cleanup-008d-retry-share-preview-20260618.png` | start=`2026-06-18T16:47:57.6389221+08:00`；end=`2026-06-18T16:48:06.9625327+08:00` | page=`pages/share-preview/index`，query 含目标 `shareId/inviteCode/briefId`；Console=`[]`；`errorText=""`，`photoHighlights=2`，`accountingHighlights=4`，`keyEvents=2`，`inviteStatusText=3/3 位好友已加入`，`visibleNodeIds=4`，`filteredNodeIds=[]`，`photoHighlightsNotice=已同步 2 张可分享照片。` | `docs/runtime/pr-qa-link-cleanup-008d-retry-share-preview-20260618.png` | `数据局部通过 / 视觉待修`：回流页照片 + 账本 + 事件数据已落地；截图中照片卡仍偏白，视觉渲染需复核。 |
| live-record | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/live-record/index?sessionId=session-1781756527692-d277f0&role=member' --wait 5000 --data sessionId,sessionName,tabs,activeTab,players,ledgerItems,ledgerCount,canAdjustLedger,ledgerActions,keyEventButtonVisible,errorText,momentNodes,timelineNodes,events,records,activeSegment --output docs/runtime/pr-qa-link-cleanup-008d-retry-live-record-20260618.png` | start=`2026-06-18T16:48:16.3910250+08:00`；end=`2026-06-18T16:48:25.8391996+08:00` | page=`pages/live-record/index`，query 含目标 `sessionId/role=member`；`sessionName=周末聚会记录`；`players=3`；`timelineNodes=5`，含开场图、私密占位、聚会高光图、`drink_debt`、`drink_add`；`records=3` 但每人 `debtCount=0/drinkCount=0`；Console 为 30 条 info：`[session-exit] enableAlertBeforeUnload enabled`，无红错。 | `docs/runtime/pr-qa-link-cleanup-008d-retry-live-record-20260618.png` | `局部通过 / 待修`：`not session member` 已消失，记录数据已恢复；截图照片卡仍有白色区域，账本计数未反映 debt/add，需前端消费修复。 |
| ledger | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/ledger/index?partyId=session-1781756527692-d277f0&ledgerId=ledger-session-1781756527692-d277f0' --wait 5000 --data sessionId,partyId,ledgerId,players,ledgerItems,canAdjustLedger,ledgerActions,keyEventButtonVisible,errorText,entries,summary,canEdit,stats,isJudge --output docs/runtime/pr-qa-link-cleanup-008d-retry-ledger-20260618.png` | start=`2026-06-18T16:48:36.1544208+08:00`；end=`2026-06-18T16:48:45.4189052+08:00` | page=`pages/ledger/index`，query 含目标 `partyId/ledgerId`；Console=`[]`；`players=3`，姓名可见；`stats=[成员3,欠酒0,加酒0]`；每人 `debtCount=0/drinkCount=0`；`isJudge=false`；未返回 `ledgerItems/canAdjustLedger/ledgerActions`。 | `docs/runtime/pr-qa-link-cleanup-008d-retry-ledger-20260618.png` | `退回前端 / 接口消费`：成员显示恢复，但账本页未呈现接口账本摘要的待处理 / 加酒数据，也未证明加减可编辑入口。 |
| album | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/album/index?partyId=session-1781756527692-d277f0&albumId=album-session-1781756527692-d277f0' --wait 5000 --data partyId,albumId,albumItems,photos,coverImageUrl,recentAlbums,title,errorText,loading,moments,photoList,items,emptyText,pageTitle,mode --output docs/runtime/pr-qa-link-cleanup-008d-retry-album-20260618.png` | start=`2026-06-18T16:48:55.3503013+08:00`；end=`2026-06-18T16:49:06.3034503+08:00` | page=`pages/album/index`，query 含目标 `partyId/albumId`；Console=`[]`；`loading=false`，`items=1`，coverUrl 指向第一张照片，`statusText=分享图已生成`，`pageTitle=我的相册`。 | `docs/runtime/pr-qa-link-cleanup-008d-retry-album-20260618.png` | `数据局部通过 / 视觉待修`：相册首图/封面 data 已恢复；截图缩略图区域仍偏白，需前端/UI 复核图片渲染。 |

##### 13.16.72.3 当前结论与退回对象

| 项 | 结论 | 下一步责任 |
| --- | --- | --- |
| 事故归因 | `已修正` | 13.16.71 的 `token 为空 / not session member` 由 PM / 自动化侧 Storage 污染导致，用户未操作电脑；不得作为业务最终失败归因。 |
| local 3221 + Storage | `准入恢复` | local API base、memberA profile 和 token 尾号 `4ea6c85e` 已确认；继续保持不重启、不清缓存、不并行。 |
| brief / share-poster / share-preview / album | `数据局部通过 / 视觉待修` | 数据层已恢复照片、账本、事件、ready PNG、相册封面；截图中照片卡或缩略图仍偏白，需前端 / UI 复核图片实际渲染，不写视觉准出通过。 |
| live-record | `数据局部通过 / 待修` | timeline 已有照片和 `drink_debt/drink_add`；但 records 账本计数仍为 0，截图图片卡偏白，需前端修数据映射和视觉渲染。 |
| ledger | `退回前端 / 接口消费` | 独立账本页仍显示欠酒 0 / 加酒 0，且 member 视角未证明可编辑入口；需前端/接口对齐 ledger 页面数据源和角色权限。 |
| brief 大图返回 | `待复核` | `moment-card` 可点击且无红错，但 automator 无法读取系统大图预览层和返回状态；需要前端提供可测 selector/状态或后续人工预览框补证。 |

本轮总判定：`Storage 污染误判已修正；local 3221 页面数据大幅恢复，brief/share-poster/share-preview/live-record/album 达到数据层局部通过；ledger 账本页仍退回；多处照片视觉为白色占位或未能证明真实像素渲染，UI/前端待修；brief 大图返回待补可测证据。不得写 008B 全链路通过、真机通过或上线通过。`

#### 13.16.73 `PR-QA-LINK-CLEANUP-008E-LEDGER-PHOTO-RETEST` 2026-06-18 待测矩阵

记录时间：2026-06-18。PM 预派 `PR-QA-LINK-CLEANUP-008E-LEDGER-PHOTO-RETEST`；本节只登记待测矩阵，不执行旧版本 DevTools，不截图，不写通过。必须等待前端 `PR-FE-LINK-CLEANUP-008E-LEDGER-PHOTO-RENDER-FIX` 最终回包后再按 13.16.69 的 008D 安全串行规则复测。

背景修正与当前边界：

| 项 | 记录 |
| --- | --- |
| 13.16.71 误判 | 13.16.71 的 `token 为空 / not session member` 是 PM / 自动化侧 Storage 污染导致，用户未操作电脑；该原因已在 13.16.72 修正，不得继续作为页面业务失败结论。 |
| 当前不可写全链路通过 | 13.16.72 只达到数据层局部恢复：brief / share-poster / share-preview / live-record / album 数据有照片或账本；但 ledger 独立页欠酒 / 加酒仍为 0，member 视角未证明可编辑，照片卡 / 缩略图仍偏白，brief 大图返回未能由 automator 证明。 |
| 执行门禁 | 前端 008E 最终回包前不得复测旧版本；复测时不得并行、不重启 DevTools、不清 Storage、不高频 relaunch。 |

##### 13.16.73.1 008E 准入条件

| 准入项 | 需要证据 | 未满足时结论 |
| --- | --- | --- |
| 前端 008E 回包 | 前端计划记录 `PR-FE-LINK-CLEANUP-008E-LEDGER-PHOTO-RENDER-FIX` 改动文件、页面路径 / selector、DevTools 9420 自测命令、截图或 page data、Console 摘要、`typecheck`、`check:encoding`、目标 diff check | 不跑旧版本，不写通过 |
| Storage / local API | 复测前先跑 `status --storage`，确认 `runtime-api-base=http://127.0.0.1:3221/api/v1`、memberA profile `user-1781756527691-ff0197`、token 后 8 位 `4ea6c85e`；完整 token 不得公开 | token 缺失或 profile 不匹配时停止页面矩阵，退回 PM / 自动化恢复，不写业务失败 |
| 页面可测 selector | ledger 可编辑入口、照片缩略图、brief 图片点击 / 返回、保存图 / 回流图关键区域需有可测 selector 或可截图断言 | selector 缺失时记录待人工预览框补证，不写通过 |
| 调试器稳定 | 每个用例串行记录命令原文、开始 / 结束时间、page/query/data、Console、storage、截图路径 | `Connection closed`、黑屏、白屏、窗口无响应时立即停止并退回 PM |

##### 13.16.73.2 串行复测矩阵

| 用例 | 命令模板 | 必采摘要 / 验收点 |
| --- | --- | --- |
| 前置 status | `npm.cmd run wechat:auto -- status --port 9420 --storage --output docs/runtime/pr-qa-link-cleanup-008e-status-20260618.png` | page/query、Console、storage API base、profileId、token 后 8 位；确认不是旧测试用户污染。 |
| ledger 独立页 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/ledger/index?partyId=session-1781756527692-d277f0&ledgerId=ledger-session-1781756527692-d277f0' --wait 5000 --data sessionId,players,ledgerItems,stats,canAdjustLedger,ledgerActions,keyEventButtonVisible,isJudge,errorText --output docs/runtime/pr-qa-link-cleanup-008e-ledger-20260618.png` | 欠酒 / 加酒不再全为 0；能映射 3.41 的 `pendingCount=1/addedCount=1` 或等价明细；主持 / 发起者可编辑入口可见；无 `保存关键事件` 替代账本能力；记录 member / host 视角差异。 |
| brief 照片 / 大图 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/session-brief/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999' --wait 5000 --data timelineNodes,accountingHighlights,ledgerSummary,errorText,loading --output docs/runtime/pr-qa-link-cleanup-008e-brief-20260618.png`；再单次 tap 前端给出的图片 selector | 2 张照片缩略图真实可见，不是白卡；账本高光可见；图片点击可大图预览并返回。若 automator 仍无法证明大图返回，写 `待人工预览框补证`，不得写通过。 |
| share-poster 保存页 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/share-poster/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999&taskId=share-task-1781756527713-442cb75c' --wait 5000 --data photoHighlights,accountingHighlights,keyEvents,readyShareImageUrl,shareTask,saveState,errorText,posterImagePath,posterImageUrl --output docs/runtime/pr-qa-link-cleanup-008e-share-poster-20260618.png` | `shareTask.status=ready`、ready PNG / poster 路径存在；照片 + 账本 + 事件同屏；保存图 / 页面图不再白卡；视觉不溢出；Console 无红错。 |
| share-preview 回流页 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/share-preview/index?shareId=share-return-session-1781756527692-d277f0&inviteCode=E52MK5&briefId=brief-1781756527712-95eff999' --wait 5000 --data photoHighlights,accountingHighlights,keyEvents,inviteStatusText,photoHighlightsNotice,visibleNodeIds,filteredNodeIds,errorText --output docs/runtime/pr-qa-link-cleanup-008e-share-preview-20260618.png` | 照片 / 账本 / 事件数据可见且视觉不白卡；无 raw/debug/internal 字段；加入状态保留。 |
| live-record | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/live-record/index?sessionId=session-1781756527692-d277f0&role=member' --wait 5000 --data sessionId,sessionName,timelineNodes,records,players,activeSegment,errorText --output docs/runtime/pr-qa-link-cleanup-008e-live-record-20260618.png` | timeline 图片真实渲染；`drink_debt/drink_add` 可见；账本计数不再全 0 或能解释 member 视角；无 `not session member`。 |
| album | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/album/index?partyId=session-1781756527692-d277f0&albumId=album-session-1781756527692-d277f0' --wait 5000 --data items,loading,emptyText,pageTitle,mode,errorText --output docs/runtime/pr-qa-link-cleanup-008e-album-20260618.png` | 相册首图 / 封面真实可见，不是白色缩略图；状态文案无工程字段；Console 无红错。 |

##### 13.16.73.3 通过 / 退回规则

| 检查项 | 通过条件 | 必退 / 待补条件 |
| --- | --- | --- |
| ledger 能力 | 独立 ledger 页展示真实欠酒 / 加酒数据；主持 / 发起者可编辑入口可见；普通 member 视角权限可解释；无 `保存关键事件` 替代按钮 | 欠酒 / 加酒仍全 0、没有可编辑入口、权限无法解释、仍把关键事件按钮当账本 |
| 照片渲染 | brief、share-poster、share-preview、live-record、album 的照片缩略图 / 保存图真实显示，有可识别图片像素，不是白卡或空坑 | data 有 imageUrl 但截图白卡、缩略图空白、保存图与页面来源不一致，退回前端 / UI |
| brief 大图 | 图片点击进入大图，能返回原页；有 selector / page state / 人工预览框截图证据 | automator 无法读系统预览层时写待人工预览框补证，不写通过 |
| 调试器 / storage | 每轮 status 成功、Console 无阻塞红错、storage token 尾号正确且完整 token 不外泄 | `Connection closed`、白屏黑屏、storage 污染、完整 token 泄露，立即停止并退回 PM |

##### 13.16.73.4 当前回报给 PM

`PR-QA-LINK-CLEANUP-008E-LEDGER-PHOTO-RETEST` 已登记待测矩阵，不代表通过。测试等待前端 `PR-FE-LINK-CLEANUP-008E-LEDGER-PHOTO-RENDER-FIX` 最终回包后执行；复测时按 008D 串行门禁先查 `status --storage`，再逐页测 ledger、brief、share-poster、share-preview、live-record、album。当前不得复测旧版本，不得写全链路通过、真机通过或上线通过。

#### 13.16.74 `PR-PM-DEVTOOLS-INCIDENT-008E-FREEZE` 2026-06-18 事故后测试门禁更新

记录时间：2026-06-18。PM 事故后门禁更新：用户确认全程未操作电脑；DevTools 9420 / Storage / 自动化波动归因我们侧操作或负责人线程操作，不得归因用户。本节只更新测试门禁和证据边界，不执行 DevTools 复测，不改业务源码，不写通过。

##### 13.16.74.1 当前工具状态证据边界

| 证据 | 记录 | 边界 |
| --- | --- | --- |
| PM status 截图 | `docs/runtime/pm-devtools-incident-status-9420.png` 存在；PM 记录 status 成功、Console=`[]`。文件时间：2026-06-18 16:59:49。 | 只代表 DevTools / 自动化工具恢复，不代表首页、ledger、brief、share-poster、share-preview、live-record、album 或任何业务页通过。 |
| 用户操作归因 | 用户确认未操作电脑。 | 后续测试记录不得写“用户操作导致 Storage / DevTools 波动”；如再发生波动，先按我们侧工具链 / 负责人线程操作排查。 |

##### 13.16.74.2 008E 冻结与复测门禁

| 项 | 要求 | 失败处理 |
| --- | --- | --- |
| 旧版本冻结 | 前端 `PR-FE-LINK-CLEANUP-008E-LEDGER-PHOTO-RENDER-FIX` 最终回包前，不复测旧版本，不扩大点击矩阵，不用 PM status 截图写业务通过。 | 只能保持 13.16.73 待测；不得写全链路、预览框阶段、真机或上线通过。 |
| 前置 status | 前端回包后，第一条命令必须是单条 `status --storage`，确认 `runtime-api-base=http://127.0.0.1:3221/api/v1`、memberA `user-1781756527691-ff0197`、token 后 8 位 `4ea6c85e`、Console 摘要。 | token 缺失、profile 不匹配、API base 不对或 Console 红错时，立即停止页面矩阵并退回 PM / 工具链恢复；不得判业务失败。 |
| 串行执行 | 不并行、不清缓存、不重启 DevTools、不高频 relaunch；逐页只跑一个 `relaunch` 或一个 `tap`，记录开始 / 结束时间、命令原文、page/query/data、Console/storage、截图路径。 | 出现 `Connection closed`、黑屏、白屏、窗口无响应，立即停止并退 PM。 |
| token 安全 | 完整 token 不得入文档、截图说明或回包；只写 token 后 8 位或 `tokenPresent=false`。 | 如发现完整 token 外泄，立即停止记录扩散并退回 PM 处理。 |

##### 13.16.74.3 当前回报给 PM

`PR-PM-DEVTOOLS-INCIDENT-008E-FREEZE` 已登记为测试侧门禁更新：继续执行 13.16.69 / 13.16.73 安全串行门禁；前端 008E 最终回包前不复测旧版本。PM 当前 `docs/runtime/pm-devtools-incident-status-9420.png` 只作为工具恢复证据，不作为任何业务页通过证据。后续若 DevTools / Storage / 自动化再波动，不得归因用户，先退回我们侧工具链 / 负责人线程操作排查。

#### 13.16.75 `PR-QA-LINK-CLEANUP-008E-LEDGER-PHOTO-RETEST-RUN` 2026-06-18 前端 14.59 后串行复测

记录时间：2026-06-18。前端 `PR-FE-LINK-CLEANUP-008E-LEDGER-PHOTO-RENDER-FIX` 已在计划 14.59 最终回包并静态验证通过。本节按 13.16.73 / 13.16.74 串行门禁执行真正复测：不并行、不清 Storage、不重启 DevTools、不高频 relaunch；只更新测试计划和证据，不写 UIUX 通过、上线通过或提交审核通过。

##### 13.16.75.1 status / storage 前置

| 步骤 | 命令原文 | 开始 / 结束时间 | 摘要 | 判定 |
| --- | --- | --- | --- | --- |
| status / storage | `npm.cmd run wechat:auto -- status --port 9420 --storage --output docs/runtime/pr-qa-link-cleanup-008e-status-20260618.png` | start=`2026-06-18T17:03:57.9140955+08:00`；end=`2026-06-18T17:03:58.8504375+08:00` | page=`pages/share-poster/index`，query=`{sessionId:"session-1781773386962-1c89d2"}`；Console=`[]`；storage `runtime-api-base=http://127.0.0.1:3221/api/v1`，`social-current-profile-id=user-1781756527691-ff0197`，memberA profile name=`聚会记录师成员A`，`jzp-user-token` 尾号=`4ea6c85e`，完整 token 已脱敏；截图：`docs/runtime/pr-qa-link-cleanup-008e-status-20260618.png`。 | `通过 / 前置满足`：API base、memberA、token 尾号和 Console 均符合 008E 门禁。 |

##### 13.16.75.2 页面串行结果

| 页面 | 命令原文 | 开始 / 结束时间 | page / query / data / Console 摘要 | 截图 | 判定 |
| --- | --- | --- | --- | --- | --- |
| ledger | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/ledger/index?sessionId=session-1781756527692-d277f0&role=judge' --wait 5000 --data sessionId,sessionName,stats,players,isJudge,ledgerEditable,ledgerEventCount,hasSession,ledgerItems,canAdjustLedger,ledgerActions,keyEventButtonVisible,errorText --output docs/runtime/pr-qa-link-cleanup-008e-ledger-20260618.png` | start=`2026-06-18T17:04:12.8645677+08:00`；end=`2026-06-18T17:04:22.3706360+08:00` | page=`pages/ledger/index`，query=`{sessionId:"session-1781756527692-d277f0",role:"judge"}`；Console=`[]`；`stats=[成员 3, 欠酒 1, 加酒 1]`，成员A `debtCount=1`，成员B `drinkCount=1`，`ledgerEventCount=2`，`isJudge=true`，`ledgerEditable=true`，`hasSession=true`。 | `docs/runtime/pr-qa-link-cleanup-008e-ledger-20260618.png` | `预览框数据与视觉局部通过 / ledger 专项`：欠酒/加酒不再为 0，发起人可调整入口可见，未见 `保存关键事件` 替代。 |
| live-record | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/live-record/index?sessionId=session-1781756527692-d277f0&role=member' --wait 5000 --data activeSegment,sessionId,sessionName,timelineNodes,photoNodes,hiddenTimelineNotice,ledgerTimelineItems,timelineEmptyText,timelineLoading,records,isJudge,errorText --output docs/runtime/pr-qa-link-cleanup-008e-live-record-20260618.png` | start=`2026-06-18T17:04:33.7205736+08:00`；end=`2026-06-18T17:04:43.0780118+08:00` | page=`pages/live-record/index`，query=`{sessionId:"session-1781756527692-d277f0",role:"member"}`；`photoNodes=2`，两条均为 `http://store/...`；`timelineNodes=5`；`hiddenTimelineNotice=1 条私密记录已收起，仅在授权后展示`；`ledgerTimelineItems=2`，含 `欠酒记录 / 1 杯`、`加酒记录 / 1 杯`；Console 仅 14 条 `[session-exit] enableAlertBeforeUnload enabled` info，无 error。 | `docs/runtime/pr-qa-link-cleanup-008e-live-record-20260618.png` | `数据通过 / 视觉退回`：账本动态可读，但截图中 2 张照片仍为白卡，退回前端 / UI 修图片渲染。 |
| session-brief | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/session-brief/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999' --wait 5000 --data sessionId,briefId,timelineNodes,previewableImageCount,previewImageUrl,previewImageCount,accountingHighlights,ledgerSummary,errorText,loading --output docs/runtime/pr-qa-link-cleanup-008e-brief-20260618.png` | start=`2026-06-18T17:04:53.7053691+08:00`；end=`2026-06-18T17:05:02.9402996+08:00` | page=`pages/session-brief/index`，query 含目标 `sessionId/briefId`；Console=`[]`；`timelineNodes=4`，2 条照片为 `http://store/...`；`previewableImageCount=2`，初始 `previewImageUrl=""`、`previewImageCount=0`；`accountingHighlights=4`，`ledgerSummary.entryCount=2/pendingCount=1/addedCount=1`，`errorText=""`。 | `docs/runtime/pr-qa-link-cleanup-008e-brief-20260618.png` | `数据通过 / 视觉退回`：账本与照片 data 正常，但截图照片区域仍白卡，退回前端 / UI。 |
| session-brief probe | `node scripts/wechat-devtools-automator.js tap --port 9420 --path '/pages/session-brief/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999' --selector '.brief-image-preview-probe' --selectorTimeout 8000 --wait 3000 --data sessionId,briefId,previewableImageCount,previewImageUrl,previewImageCount,loading,errorText --output docs/runtime/pr-qa-link-cleanup-008e-brief-probe-20260618.png` | start=`2026-06-18T17:05:15.5967038+08:00`；end=`2026-06-18T17:05:25.8572153+08:00` | `.brief-image-preview-probe` tap 成功；page 仍为 session-brief；Console=`[]`；`previewableImageCount=2`，`previewImageUrl=http://store/xSZOh13ht1Xle021264227da120dc16e04487c47eafa.bin`，`previewImageCount=2`，`errorText=""`。 | `docs/runtime/pr-qa-link-cleanup-008e-brief-probe-20260618.png` | `probe 数据通过 / 大图返回待补证`：probe 证明图片预览触发参数写入，但 automator 仍不能读取系统大图层和返回状态；不写大图返回通过。 |
| share-poster | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/share-poster/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999&taskId=share-task-1781756527713-442cb75c' --wait 5000 --data photoHighlights,accountingHighlights,keyEvents,readyShareImageUrl,shareTask,saveState,errorText,layoutMode,taskLayoutMode,ledgerIncluded,displayTaskLayoutMode,posterImagePath,posterImageUrl --output docs/runtime/pr-qa-link-cleanup-008e-share-poster-20260618.png` | start=`2026-06-18T17:05:38.2824911+08:00`；end=`2026-06-18T17:05:47.7462641+08:00` | page=`pages/share-poster/index`，query 含目标 `sessionId/briefId/taskId`；Console=`[]`；`photoHighlights=2`，均 `http://store/...`；`accountingHighlights=1`，`keyEvents=2`，`readyShareImageUrl=http://127.0.0.1:3221/uploads/moments/share-tasks/share-task-1781756527713-442cb75c.png`，`shareTask.status=ready`，`saveState=idle`，`posterImageUrl=http://store/...png`。 | `docs/runtime/pr-qa-link-cleanup-008e-share-poster-20260618.png` | `数据通过 / 视觉退回`：ready 保存图与照片/账本/事件 data 正常，但截图照片卡仍白，退回前端 / UI。 |
| share-preview | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/share-preview/index?shareId=share-return-session-1781756527692-d277f0&inviteCode=E52MK5&briefId=brief-1781756527712-95eff999' --wait 5000 --data shareSummary,photoHighlights,accountingHighlights,keyEvents,errorText,inviteStatusText,joinedCount,playerCount,permissionState,shareContentFilter,photoHighlightsNotice,visibleNodeIds,filteredNodeIds --output docs/runtime/pr-qa-link-cleanup-008e-share-preview-20260618.png` | start=`2026-06-18T17:05:59.9191351+08:00`；end=`2026-06-18T17:06:09.2530546+08:00` | page=`pages/share-preview/index`，query 含目标 `shareId/inviteCode/briefId`；Console=`[]`；`photoHighlights=2`，均 `http://store/...`；`accountingHighlights=4`，`keyEvents=2`，`inviteStatusText=3/3 位好友已加入`，`visibleNodeIds=4`，`filteredNodeIds=[]`，`errorText=""`。 | `docs/runtime/pr-qa-link-cleanup-008e-share-preview-20260618.png` | `数据通过 / 视觉退回`：回流页数据正常，但截图照片卡仍白，退回前端 / UI。 |
| album | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/album/index?partyId=session-1781756527692-d277f0&albumId=album-session-1781756527692-d277f0' --wait 5000 --data partyId,albumId,albumItems,photos,coverImageUrl,recentAlbums,title,errorText,loading,moments,photoList,items,emptyText,pageTitle,mode --output docs/runtime/pr-qa-link-cleanup-008e-album-20260618.png` | start=`2026-06-18T17:06:29.7498033+08:00`；end=`2026-06-18T17:06:38.9178617+08:00` | page=`pages/album/index`，query 含目标 `partyId/albumId`；Console=`[]`；`items=2`，目标 `周末聚会记录` coverUrl 为 `http://store/...`、status=`分享图已生成`；另有 `周五快乐局` 条目。 | `docs/runtime/pr-qa-link-cleanup-008e-album-20260618.png` | `退回前端 / UI / 数据清洁`：目标相册缩略图仍白；同时列表首项 cover 图露出旧 `酒桌判官` 视觉资产，违反 clean slate 旧品牌准出。 |

##### 13.16.75.3 当前结论与退回对象

| 项 | 结论 | 下一步责任 |
| --- | --- | --- |
| DevTools / Storage | `通过门禁` | 继续保持 008D 串行规则；完整 token 未入文档。 |
| ledger | `预览框数据与视觉局部通过 / ledger 专项` | 前端 ledger 修复可接收：欠酒/加酒不为 0，judge 可编辑入口可见，未见 `保存关键事件` 替代。 |
| live-record | `数据通过 / 视觉退回` | 前端 / UI 修照片白卡；账本动态已可读，Console 无阻塞红错。 |
| session-brief | `数据与 probe 通过 / 视觉和大图返回待补` | 前端 / UI 修照片白卡；前端 / 测试补可证明系统大图返回的 selector / 状态或人工预览框证据。 |
| share-poster / share-preview | `数据通过 / 视觉退回` | 前端 / UI 修分享页照片白卡；保存图和回流图视觉不得空白。 |
| album | `退回前端 / UI / 数据清洁` | 目标相册缩略图仍白；列表出现旧 `酒桌判官` 视觉资产，需要清理旧品牌污染并修目标封面渲染。 |

本轮总判定：`PR-QA-LINK-CLEANUP-008E-LEDGER-PHOTO-RETEST-RUN 串行执行完成；ledger 专项预览框局部通过；live-record/brief/share-poster/share-preview 数据层通过但照片视觉仍白卡；album 仍白卡且出现旧酒桌判官视觉资产；brief 大图返回仍待可测证据。008E 未达到全矩阵通过，不写 UIUX 通过、全链路通过、真机通过、提交审核通过或上线通过。`

#### 13.16.76 `PR-QA-LINK-CLEANUP-008F-RETEST` 2026-06-18 待测矩阵

记录时间：2026-06-18。PM 新派 `PR-QA-LINK-CLEANUP-008F-RETEST`；本节只登记待测矩阵，不执行 DevTools，不扩大矩阵，不写通过。必须等待前端 008F 和 UI/UX 008F 最终回包后，再按 13.16.69 / 13.16.74 的 008D 安全串行门禁复测。

##### 13.16.76.1 当前基线

| 项 | 13.16.75 结论 | 008F 目标 |
| --- | --- | --- |
| ledger | `局部通过`：欠酒 1、加酒 1，judge 可编辑入口可见，未见 `保存关键事件` 替代。 | 做回归确认，不允许修图时破坏账本数据和可编辑入口。 |
| live-record | data 通过：`photoNodes=2`、账本动态 2；但截图照片仍白卡。 | 图片真实渲染，不再白卡；账本动态仍可读。 |
| session-brief | data 与 `.brief-image-preview-probe` 通过；但照片区域白卡，大图返回仍无法由 automator 证明。 | 照片真实渲染；probe 仍写入 `previewImageUrl/previewImageCount`；大图返回如仍无法自动证明，补人工预览框证据。 |
| share-poster / share-preview | data 通过，照片/账本/事件均落地；但截图照片卡仍白。 | 分享页和回流页照片真实可见，保存图/页面图不得白卡。 |
| album | 目标相册缩略图仍白；列表首项出现旧 `酒桌判官` 视觉资产。 | 修目标封面渲染；清理旧品牌/旧资产封面污染。 |

##### 13.16.76.2 准入条件

| 准入项 | 需要证据 | 未满足时结论 |
| --- | --- | --- |
| 前端 008F 回包 | 前端计划记录修复文件、页面路径 / selector、截图或 page data、Console 摘要、`typecheck`、`check:encoding`、目标 diff check；说明如何处理 store 图片白卡和 album 旧封面。 | 不复测旧版本，不写通过。 |
| UI/UX 008F 回包 | UI/UX 对 live-record、brief、share-poster、share-preview、album 的右侧预览图或视觉准出意见；明确白卡、旧封面、分享图视觉是否可接受。 | 缺 UI/UX 证据时，只能写 `待 UI/UX 复核`，不得写视觉通过。 |
| DevTools / Storage | 第一条必须 `status --storage`：API base 为 `http://127.0.0.1:3221/api/v1`，memberA 为 `user-1781756527691-ff0197`，token 后 8 位 `4ea6c85e`，Console 无阻塞红错。 | Storage 不匹配、token 缺失、Console 红错、连接异常时立即停止并退 PM。 |

##### 13.16.76.3 串行复测矩阵

| 顺序 | 页面 | 命令模板 | 必测断言 |
| --- | --- | --- | --- |
| 0 | status | `npm.cmd run wechat:auto -- status --port 9420 --storage --output docs/runtime/pr-qa-link-cleanup-008f-status-20260618.png` | 记录 page/query、storage API base、profileId、token 后 8 位、Console；完整 token 不入文档。 |
| 1 | live-record | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/live-record/index?sessionId=session-1781756527692-d277f0&role=member' --wait 5000 --data activeSegment,photoNodes,ledgerTimelineItems,timelineNodes,records,errorText --output docs/runtime/pr-qa-link-cleanup-008f-live-record-20260618.png` | `photoNodes=2` 且截图真实显示照片；账本动态 2 条可读；无白卡、无 `not session member`。 |
| 2 | session-brief | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/session-brief/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999' --wait 5000 --data timelineNodes,previewableImageCount,previewImageUrl,previewImageCount,accountingHighlights,ledgerSummary,errorText,loading --output docs/runtime/pr-qa-link-cleanup-008f-brief-20260618.png`；再 tap `.brief-image-preview-probe` | 照片真实显示；probe 写入 `previewImageUrl/previewImageCount`；大图返回需自动或人工补证。 |
| 3 | share-poster | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/share-poster/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999&taskId=share-task-1781756527713-442cb75c' --wait 5000 --data photoHighlights,accountingHighlights,keyEvents,readyShareImageUrl,shareTask,saveState,errorText,posterImageUrl --output docs/runtime/pr-qa-link-cleanup-008f-share-poster-20260618.png` | ready 状态保持；照片 + 账本 + 事件可见；分享页图片不白卡；保存图路径存在。 |
| 4 | share-preview | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/share-preview/index?shareId=share-return-session-1781756527692-d277f0&inviteCode=E52MK5&briefId=brief-1781756527712-95eff999' --wait 5000 --data photoHighlights,accountingHighlights,keyEvents,inviteStatusText,visibleNodeIds,filteredNodeIds,errorText --output docs/runtime/pr-qa-link-cleanup-008f-share-preview-20260618.png` | 回流图照片真实显示；账本/事件仍在；无 raw/debug/internal 字段。 |
| 5 | album | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/album/index?partyId=session-1781756527692-d277f0&albumId=album-session-1781756527692-d277f0' --wait 5000 --data items,loading,emptyText,pageTitle,mode,errorText --output docs/runtime/pr-qa-link-cleanup-008f-album-20260618.png` | 目标相册缩略图真实显示；不得出现旧 `酒桌判官` 封面/旧品牌资产；状态文案干净。 |
| 6 | ledger 回归 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path '/pages/ledger/index?sessionId=session-1781756527692-d277f0&role=judge' --wait 5000 --data stats,players,isJudge,ledgerEditable,ledgerEventCount,errorText --output docs/runtime/pr-qa-link-cleanup-008f-ledger-20260618.png` | 欠酒 1、加酒 1、judge 可编辑入口保持；无 `保存关键事件` 替代。 |

##### 13.16.76.4 当前回报给 PM

`PR-QA-LINK-CLEANUP-008F-RETEST` 已登记待测，不代表通过。当前 008E 已落档：ledger 局部通过，live-record / session-brief / share-poster / share-preview / album 因照片白卡退回，album 另因旧 `酒桌判官` 封面退回前端文案 / 资产净化。测试等待前端 008F 和 UI/UX 008F 回包后再按 008D 串行门禁复测；不得复测旧版本、不得写上线通过、不得泄露完整 token。

#### 13.16.77 `PR-QA-LINK-CLEANUP-008G-NONWHITE-RETEST-GATE` 2026-06-18 非白照片样本准入

记录时间：2026-06-18。PM 补充待测约束：继续保持 `PR-PM-DEVTOOLS-INCIDENT-008F-HARD-FREEZE`，测试侧不得触发 DevTools `status` / `relaunch` / `tap` / 截图 / Storage 操作，不重启、不清缓存、不注入 storage。本节只更新 008F / 008G 解冻后的复测口径，不代表页面通过，不写上线通过。

##### 13.16.77.1 新增准入条件

| 准入项 | 需要证据 | 未满足时结论 |
| --- | --- | --- |
| DevTools 解冻 | PM 明确解除 008F hard freeze，并允许恢复 13.16.69 / 13.16.74 的安全串行门禁。 | 保持待测，不执行任何 DevTools 命令或截图矩阵。 |
| 非白照片 fixture | 接口联调 `PR-INT-LINK-CLEANUP-008G-NONWHITE-PHOTO-FIXTURE` 已回包，PM 已核验接口计划 3.42 和证据 `docs/runtime/pr-int-link-cleanup-PRCS-20260618-008g-nonwhite-photo-sanitized.md`：sample=`prcs-008g`，sessionId=`session-1781787045680-8e406c`，inviteCode=`J2BEL2`，briefId=`brief-1781787045693-bc8904b9`，ready shareTaskId=`share-task-1781787045694-9725ffeb`，memberA token 后 8 位=`b8615971`；两张公开照片均为 `640x420` 非纯白 WebP，clean brief / share-image 200，照片 / 账本 / 事件非空。 | fixture 准入已具备，但 DevTools hard freeze 未解除；不得用当前 `1x1` 白图或白卡样本写“照片真实渲染通过”，也不得在未执行页面复测前写页面通过。 |
| 样本清理 / 留存 | 接口联调需说明样本创建命令、保留或清理策略、可复跑方式；完整 token 不得进入公开文档。 | 缺来源或清理说明时，只能登记待复核，不写准出。 |
| 前端 / UIUX 008F / 008G 回包 | 前端说明如何消费非白图片 URL、如何避免旧封面和白卡；UI/UX 明确分享页、回流页、相册、记录流的视觉准出要求。 | 缺前端实现或 UI/UX 视觉规格时，不写视觉通过。 |

##### 13.16.77.2 解冻后复测矩阵补充

| 页面 | 基于 13.16.76 的新增断言 | 失败 / 退回规则 |
| --- | --- | --- |
| live-record | `photoNodes` 必须绑定非白 fixture；右侧预览截图中照片应有可识别图像像素；账本动态 `drink_debt/drink_add` 仍可读。 | data 有 URL 但截图仍白卡、图片为 `1x1` 或纯白，退回前端 / UI；fixture 本体不合格退回接口联调。 |
| session-brief | `timelineNodes` / `.brief-image-preview-probe` 使用同一组非白照片；`previewImageUrl/previewImageCount` 写入正常；大图返回仍需自动或人工预览框补证。 | 非白图未显示、probe 丢失、无法证明大图返回时，不写 brief 图片通过。 |
| share-poster | 保存页必须展示非白照片 + 聚会账本 / 酒桌记账高光 + 事件；保存图路径和页面预览不得来源不一致。 | 页面预览非白但 PNG / 保存图仍白、旧红壳或旧资产，退回前端 / UI / 后端 renderer 对应责任。 |
| share-preview | 分享回流页必须展示非白照片、账本和事件；无 raw/debug/internal 字段、无旧品牌文案。 | 回流页白卡、字段破界或照片缺失，按前端消费 / 接口公开合同区分退回。 |
| album | 目标相册封面 / 首图必须来自非白 fixture；不得出现旧 `酒桌判官` 封面或旧品牌资产。 | 非白 fixture 未成为封面、仍白卡或旧封面污染，退回前端 / 数据清洁 / UI。 |
| ledger 回归 | 继续确认 `stats=[成员 3, 欠酒 1, 加酒 1]` 或等价数据、judge 可编辑入口、无 `保存关键事件` 替代；修图不得破坏账本能力。 | 账本数据回退为 0、可编辑入口消失或按钮替代错误，退回前端 / 接口消费。 |

##### 13.16.77.3 截图与命名基线

解冻后执行时沿用 008D 串行规则，命令原文、开始 / 结束时间、page/query/data、Console、Network/storage、token 后 8 位和截图路径必须逐页记录。建议截图命名：

| 用例 | 截图路径基线 |
| --- | --- |
| status | `docs/runtime/pr-qa-link-cleanup-008g-nonwhite-status-20260618.png` |
| live-record | `docs/runtime/pr-qa-link-cleanup-008g-nonwhite-live-record-20260618.png` |
| session-brief | `docs/runtime/pr-qa-link-cleanup-008g-nonwhite-brief-20260618.png` |
| share-poster | `docs/runtime/pr-qa-link-cleanup-008g-nonwhite-share-poster-20260618.png` |
| share-preview | `docs/runtime/pr-qa-link-cleanup-008g-nonwhite-share-preview-20260618.png` |
| album | `docs/runtime/pr-qa-link-cleanup-008g-nonwhite-album-20260618.png` |
| ledger | `docs/runtime/pr-qa-link-cleanup-008g-nonwhite-ledger-20260618.png` |

##### 13.16.77.4 当前回报给 PM

`PR-QA-LINK-CLEANUP-008G-NONWHITE-RETEST-GATE` 已登记为 008F / 008G 后续照片真实渲染准入：非白 fixture `prcs-008g` 已由接口联调回包并经 PM 核验，样本为两张 `640x420` 非纯白 WebP，页面 query 和 token 后 8 位已记录；但 PM 未解除 DevTools hard freeze 前，测试不跑命令、不截图、不改 storage，不得据接口样本或计划证据写页面通过。后续复测仍覆盖 live-record、session-brief、share-poster、share-preview、album 和 ledger 回归；结论只能写预览框阶段通过、退回或待复核，不得写真机通过或上线通过。

#### 13.16.78 `PR-QA-LINK-CLEANUP-008H-FULL-OBJECTIVE-RETEST-MATRIX` 2026-06-18 全目标复测矩阵

记录时间：2026-06-18。PM 新派 008H 全目标复测矩阵；当前继续保持 DevTools hard freeze，不触发 `status` / `relaunch` / `tap` / `clearStorage` / storage 注入 / 截图 / 重启。本节只把用户最新目标转成 PM 有限解冻后的可执行断言，不代表页面通过、UI/UX 通过或上线通过。

##### 13.16.78.1 统一准入与样本

| 项 | 准入 / 约束 |
| --- | --- |
| DevTools 执行门禁 | 必须等 PM 另发“有限解冻复测令”后，才可恢复 008D 安全串行规则；第一条只能是单次 `status --storage`，随后单页 relaunch 或单次 tap；出现 `Connection closed`、黑屏、白屏、窗口无响应、Storage 不匹配时立即停止并退 PM。 |
| 008G 非白样本 | sample=`prcs-008g`，sessionId=`session-1781787045680-8e406c`，inviteCode=`J2BEL2`，briefId=`brief-1781787045693-bc8904b9`，ready shareTaskId=`share-task-1781787045694-9725ffeb`，memberA token 后 8 位=`b8615971`；两张公开照片为 `640x420` 非纯白 WebP。 |
| 证据要求 | 每个用例记录命令原文、开始 / 结束时间、page/query、data keys、Console、Network/storage、token 后 8 位、截图路径；截图失败可记录 page data，但不得写截图通过。完整 token 不得入文档。 |
| 通用禁止项 | UI / Console / data 摘要不得出现用户可见的 `PR Seed`、`IT-MOMENTS`、raw/debug、接口错误、旧品牌主文案、内部 ID 外露、审核阻塞文案、`not session member`、`brief not found`、`task failed`。命中即按责任角色退回。 |

##### 13.16.78.2 解冻后命令与截图基线

| 用例组 | 页面路径 / 操作 | data keys | 截图路径基线 |
| --- | --- | --- | --- |
| 前置 status | `npm.cmd run wechat:auto -- status --port 9420 --storage --output docs/runtime/pr-qa-link-cleanup-008h-status-20260618.png` | `page,query,storage,console`；storage 至少记录 API base、profileId、token 后 8 位 | `docs/runtime/pr-qa-link-cleanup-008h-status-20260618.png` |
| 首页 / 最近相册 / 底部三项 | `/pages/index/index` | `recentAlbums,recentSessions,quickTools,bottomTabs,activeTab,homeCards,errorText` | `docs/runtime/pr-qa-link-cleanup-008h-home-20260618.png` |
| 工具箱列表 | `/pages/tools/index`；从列表串行 tap 至少 3 个工具，再回到列表 | `allTools,filteredTools,popularTools,categoryCards,activeCategory,activeCategoryName,toolId,toolName,toolMode,toolError` | `docs/runtime/pr-qa-link-cleanup-008h-tools-20260618.png`、`docs/runtime/pr-qa-link-cleanup-008h-tool-detail-*.png` |
| 个人中心 | `/pages/me/index`，串行 tap 入口 | `currentProfile,features,assetStats,wineStats,momentSummaries,errorText` | `docs/runtime/pr-qa-link-cleanup-008h-me-20260618.png` |
| 创建页 | `/pages/create-session/index` | `formData,createTime,visibilityOptions,permissionOptions,selectedPermissions,themeOptions,description,defaultChips,errorText` | `docs/runtime/pr-qa-link-cleanup-008h-create-20260618.png` |
| 邀请预览 | `/pages/share-preview/index?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2&briefId=brief-1781787045693-bc8904b9` | `inviteCode,inviteStatusText,joinedCount,playerCount,photoHighlights,accountingHighlights,keyEvents,shareSummary,errorText` | `docs/runtime/pr-qa-link-cleanup-008h-invite-preview-20260618.png` |
| 拍照 / 进行中 | `/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=member`；如有限解冻令允许，只做一次保存第一张照片路径复核 | `sessionId,activeSegment,photoNodes,timelineNodes,ledgerTimelineItems,records,description,defaultChips,errorText` | `docs/runtime/pr-qa-link-cleanup-008h-live-record-20260618.png` |
| 账本页 | `/pages/ledger/index?sessionId=session-1781787045680-8e406c&role=judge`；必要时补 host/member 视角 | `stats,players,isJudge,isHost,ledgerEditable,ledgerEventCount,ledgerItems,canAdjustLedger,ledgerActions,keyEventButtonVisible,errorText` | `docs/runtime/pr-qa-link-cleanup-008h-ledger-20260618.png` |
| 聚会简报 | `/pages/session-brief/index?sessionId=session-1781787045680-8e406c&briefId=brief-1781787045693-bc8904b9`；再单次 tap 图片 probe 或前端给定图片 selector | `timelineNodes,photoHighlights,accountingHighlights,keyEvents,previewableImageCount,previewImageUrl,previewImageCount,ledgerSummary,errorText,loading` | `docs/runtime/pr-qa-link-cleanup-008h-brief-20260618.png`、`docs/runtime/pr-qa-link-cleanup-008h-brief-preview-20260618.png` |
| 相册 | `/pages/album/index?partyId=session-1781787045680-8e406c&albumId=album-session-1781787045680-8e406c`；若接口联调给出不同 albumId，以回包为准 | `items,photos,coverImageUrl,recentAlbums,title,pageTitle,loading,emptyText,errorText` | `docs/runtime/pr-qa-link-cleanup-008h-album-20260618.png` |
| 分享页 / 保存图 | `/pages/share-poster/index?sessionId=session-1781787045680-8e406c&briefId=brief-1781787045693-bc8904b9&taskId=share-task-1781787045694-9725ffeb` | `photoHighlights,accountingHighlights,keyEvents,readyShareImageUrl,shareTask,saveState,errorText,posterImagePath,posterImageUrl,ledgerIncluded,displayTaskLayoutMode` | `docs/runtime/pr-qa-link-cleanup-008h-share-poster-20260618.png` |
| 分享回流 | `/pages/share-preview/index?shareId=share-return-session-1781787045680-8e406c&inviteCode=J2BEL2&briefId=brief-1781787045693-bc8904b9`；若接口联调给出 shareId，以回包为准 | `shareSummary,photoHighlights,accountingHighlights,keyEvents,inviteStatusText,visibleNodeIds,filteredNodeIds,permissionState,shareContentFilter,errorText` | `docs/runtime/pr-qa-link-cleanup-008h-share-preview-20260618.png` |

##### 13.16.78.3 全目标断言 / 退回规则

| 编号 | 用户目标 | 通过标准 | 退回 / 阻塞责任 |
| --- | --- | --- | --- |
| 1 | 首页最近相册封面 | 有照片时最近相册封面使用上传第一张照片或 008G 非白首图；无照片时展示默认封面；列表项目不露旧品牌或工程字段。 | 封面白卡、旧 `酒桌判官` 资产、无图状态不清，退回前端 / UI / 数据清洁；缺样本退接口联调。 |
| 2 | 记录 / 账本页 | live-record 与 ledger 均显示欠酒 / 加酒数据、头像 / 用户名；judge / host 可编辑入口可见；无 `保存关键事件` 替代账本能力。 | 数据为 0、头像用户名缺失、权限不可解释、按钮错误，退回前端 / 接口消费。 |
| 3 | 首页底部三项与工具箱 | 首页底部仅 `首页 / 工具箱 / 我的`；工具箱列表可见，每个工具可用，至少从列表串行点 3 个工具详情且 `toolError=""`。 | 出现相册 / 分享 / 聚会账本重复底 tab、工具不可用或大多跳错页，退回前端。 |
| 4 | 个人中心入口 | 入口去重，落点按功能分流，不得多数跳相册或旧壳。 | 入口重复、落点错误、旧路由可达，退回前端。 |
| 5 | 聚会简报大图 | 简报非白照片可点击大图，并能返回简报；automator 无法证明时必须补人工右侧预览框证据。 | 只能证明 data 或 probe、无法证明返回时写待补证，不写通过；selector 缺失退前端补可测性。 |
| 6 | 图片直显和参与链路 | 上传 / fixture 图片在相册、简报、分享页、保存分享图中直显并参与内容生成；无审核阻塞 UI 文案。 | 出现审核中 / 待审核阻塞、白卡、未进入分享图，退回前端 / 接口 / UI。 |
| 7 | 创建时间与创建页 | 创建时间取当前实时时间并进入聚会列表；创建页无轻量主题选择。 | 时间固定或缺失、列表不展示、仍有轻量主题选择，退回前端。 |
| 8 | 邀请预览极简 | 邀请预览只保留口令和好友加入状态；删除照片记录 + 账本模块、安全区模块、分享给好友 / 分享到群 / 保存海报按钮。 | 冗余模块或按钮残留，退回前端 / UI。 |
| 9 | 拍第一张后回流 | 拍第一张保存后进入聚会进行中页；说明文案最多 2 行；默认文案 chip 可点击填充。 | 保存后回首页、说明超 2 行、chip 不可用，退回前端；如 DevTools 保存能力不足，写预览态限制，不写真机通过。 |
| 10 | 可见与授权 | 无 `仅自己`；默认 4 项全选；授权说明无工程字段。 | `仅自己` 残留、默认未全选、字段破界，退回前端 / UGC。 |
| 11 | 数据破界 | UI / Console / page data 摘要无 `PR Seed`、`IT-MOMENTS`、raw/debug、接口错误、旧品牌主文案、内部样本名用户可见。 | 用户可见命中即退回前端 / 数据清洁 / 后端；Console/API 红错按原文退对应角色。 |
| 12 | 分享页 / 保存图 | 008G 非白样本下照片 + 聚会账本 / 酒桌记账高光同屏，并参与导出分享；ready PNG、页面预览和保存图来源一致。 | 页面非白但 PNG 旧图 / 白图 / 旧模板，退回前端 / 后端 renderer / UI；来源不一致直接退回。 |
| 13 | ready PNG 早于替换照片 warning | 单列记录 `readyShareImageUrl` / `shareTask.createdAt` / 图片更新时间或接口联调说明；确认 ready PNG 是否早于非白照片替换。 | 若 ready PNG 生成早于替换照片且仍显示旧白图 / 旧图，不判分享图通过，退回后端 renderer / 接口联调重建 ready PNG；若仅页面预览新而 PNG 旧，也退回。 |

##### 13.16.78.4 当前回报给 PM

`PR-QA-LINK-CLEANUP-008H-FULL-OBJECTIVE-RETEST-MATRIX` 已登记为解冻后全目标复测矩阵，不代表通过。当前 DevTools hard freeze 继续生效，测试不跑 `status`、不 relaunch、不 tap、不截图、不改 storage；008G 非白样本只作为后续准入数据。PM 发出有限解冻复测令后，测试按 13.16.78.2 串行执行并逐项记录命令、截图、data、Console、Network/storage、通过/退回对象；未执行前不得写页面通过、UI/UX 通过、真机通过或上线通过。

#### 13.16.79 `PR-QA-LINK-CLEANUP-008I-STATIC-CLEANUP-GATE` 2026-06-18 静态清洁待测门禁

记录时间：2026-06-18。PM 只读静态核验 008H 后发现两个前端静态清洁缺口，并已派发前端 `PR-FE-LINK-CLEANUP-008I-STATIC-COPY-DATA-CLEANUP`。当前 DevTools hard freeze 继续生效；测试不得运行 `status` / `relaunch` / `tap` / `clearStorage` / storage 注入 / 截图 / 重启工具，不要求用户补图。本节只登记 008I 静态清洁待测门禁，不复测旧版本，不写页面通过、UI/UX 通过、真机通过或上线通过。

##### 13.16.79.1 当前静态缺口

| 缺口 | PM 发现 | 影响 | 当前结论 |
| --- | --- | --- | --- |
| 创建页主题文案 | `miniprogram/pages/create-session/index.wxml` 仍有 `主题和高级设置可稍后调整`。 | 用户要求创建页轻量主题选择直接去掉，创建链路不应再让用户感知 `主题`。 | 前端 008I 回包前，不解冻复测创建页；不得把 13.16.78 的创建页目标写通过。 |
| 邀请预览旧分享动作 | `miniprogram/pages/share-preview/index.ts` data 仍有 `shareItems` 的 `分享给好友` / `分享到群`，并有 `handleSaveTap` / `handleShareTap` 与 `.share-action-*` 旧样式残留；当前 WXML 不渲染。 | 用户要求口令加入状态去掉分享给好友 / 分享到群 / 保存海报按钮；page data、处理函数和旧样式也纳入清洁门禁。 | 前端 008I 回包前，不解冻复测 share-preview；不得因 WXML 当前不渲染就写清洁通过。 |

##### 13.16.79.2 前端 008I 回包准入

| 准入项 | 需要证据 | 未满足时结论 |
| --- | --- | --- |
| 前端静态修复 | 前端计划记录改动文件、目标 diff check、`typecheck`、`check:encoding`；明确删除或替换创建页 `主题` 用户可见文案，清理 share-preview `shareItems` 旧按钮文案、旧 handler、旧样式残留。 | 只写 `待前端 008I 回包`，不解冻、不复测旧版本。 |
| 静态扫描证据 | 前端或测试解冻前只读扫描命令需覆盖 `miniprogram/pages/create-session/index.wxml`、`miniprogram/pages/share-preview/index.ts`、`miniprogram/pages/share-preview/index.wxml`、`miniprogram/pages/share-preview/index.less`；关键词至少含 `主题和高级设置`、`轻量主题`、`分享给好友`、`分享到群`、`保存海报`、`shareItems`、`handleSaveTap`、`handleShareTap`、`share-action-`。 | 任一用户可见文案或旧动作残留未解释，退回前端 008I。 |
| DevTools 解冻 | PM 明确发出有限解冻复测令后，才可把 13.16.79.3 并入 13.16.78 串行矩阵执行。 | 未解冻时保持静态待测，不跑页面命令。 |

##### 13.16.79.3 解冻后新增断言

| 页面 / 文件 | 页面路径 / data keys | 截图路径基线 | 通过标准 | 退回责任 |
| --- | --- | --- | --- | --- |
| 创建页 | `/pages/create-session/index`；data keys=`formData,createTime,visibilityOptions,permissionOptions,selectedPermissions,themeOptions,description,defaultChips,errorText` | `docs/runtime/pr-qa-link-cleanup-008i-create-static-cleanup-20260618.png` | UI 截图、WXML 静态扫描和 page data 均无 `主题`、`轻量主题`、`主题和高级设置可稍后调整` 等用户可见主题文案；创建时间和授权默认项仍按 13.16.78 验证。 | 主题文案残留、themeOptions 仍驱动用户可见入口或截图出现主题感知，退回前端 008I。 |
| share-preview 邀请状态 | `/pages/share-preview/index?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2&briefId=brief-1781787045693-bc8904b9`；data keys=`inviteCode,inviteStatusText,joinedCount,playerCount,shareItems,photoHighlights,accountingHighlights,keyEvents,errorText` | `docs/runtime/pr-qa-link-cleanup-008i-share-preview-static-cleanup-20260618.png` | WXML / 截图 / page data 均无口令加入状态动作 `分享给好友`、`分享到群`、`保存海报`；如保留 `shareItems`，不得含上述用户动作；无 `.share-action-*` 旧样式影响页面。 | data 仍含旧动作、handler 仍暴露旧动作语义、旧样式残留未解释、截图出现按钮，退回前端 008I；若接口字段导致旧按钮回填，抄送接口联调。 |

##### 13.16.79.4 当前回报给 PM

`PR-QA-LINK-CLEANUP-008I-STATIC-CLEANUP-GATE` 已登记为 008H 后续静态清洁门禁，不代表通过。前端 `PR-FE-LINK-CLEANUP-008I-STATIC-COPY-DATA-CLEANUP` 回包前，测试不解冻、不复测旧版本；回包后先做静态扫描，再等待 PM 有限解冻令将创建页和 share-preview 两个新增断言并入 13.16.78 串行矩阵。任何用户可见 `主题` 文案、`分享给好友` / `分享到群` / `保存海报` 旧动作、相关 handler / data / 样式残留未清洁时，均退回前端 008I；不得写页面通过、UI/UX 通过、真机通过或上线通过。

#### 13.16.80 `PR-QA-LINK-CLEANUP-008J-WAITING-ROOM-COPY-GATE` 2026-06-18 waiting-room 旧词清洁门禁

记录时间：2026-06-18。PM 继续静态扫描 `app.json` 当前可达页面，发现 `pages/waiting-room/index` 仍有旧 `酒局` 用户可见文案，并已派发前端 `PR-FE-LINK-CLEANUP-008J-WAITING-ROOM-COPY-CLEANUP`。当前 DevTools hard freeze 继续生效；测试不得运行 `status` / `relaunch` / `tap` / `clearStorage` / storage 注入 / 截图 / 重启工具，不要求用户补图。本节只登记 008J 待测门禁，不复测旧版本，不写页面通过、UI/UX 通过、真机通过或上线通过。

##### 13.16.80.1 当前静态缺口

| 文件 | PM 静态命中 | 判断 |
| --- | --- | --- |
| `miniprogram/pages/waiting-room/index.wxml` | `酒局信息` | app.json 当前可达页面用户可见旧口径，需前端改为 `聚会` 语义。 |
| `miniprogram/pages/waiting-room/index.ts` | `酒局加载失败`、`未找到当前酒局`、`离开后可从参与场次重新进入当前酒局。` | toast / errorText / modal 等可见文案风险，需统一清理为 `聚会`。 |
| `miniprogram/pages/session-brief/index.ts` | 旧词清洗正则命中 | 本轮不作为上屏文案失败；仍需保留在静态扫描说明中，避免误判。 |

##### 13.16.80.2 前端 008J 回包准入

| 准入项 | 需要证据 | 未满足时结论 |
| --- | --- | --- |
| 前端静态修复 | 前端计划记录 `PR-FE-LINK-CLEANUP-008J-WAITING-ROOM-COPY-CLEANUP` 改动文件、目标 diff check、`typecheck`、`check:encoding`；明确 waiting-room 用户可见 `酒局` 文案已替换为 `聚会`。 | 前端 008J 回包前，不解冻、不复测旧版本。 |
| 静态扫描证据 | 只读扫描覆盖 `miniprogram/app.json` 当前可达页面和 `miniprogram/pages/waiting-room/index.*`；关键词至少含 `酒局`、`酒桌判官`、`判官`、`惩罚`、`罚酒`。 | waiting-room 任一用户可见旧词残留，退回前端 008J；session-brief 旧词清洗正则需单独标注为非上屏。 |
| DevTools 解冻 | PM 明确发出有限解冻复测令后，才可执行 13.16.80.3；执行时仍按 13.16.69 / 13.16.74 安全串行门禁。 | 未解冻时保持待测，不跑页面命令。 |

##### 13.16.80.3 解冻后新增断言

| 页面 / 文件 | 页面路径 / data keys | 截图路径基线 | 通过标准 | 退回责任 |
| --- | --- | --- | --- | --- |
| waiting-room | `/pages/waiting-room/index?sessionId=session-1781787045680-8e406c`；如前端 / 接口给出其他 waiting-room query，以回包为准；data keys=`sessionId,sessionName,waitingState,players,errorText,toastText,modalContent,loading` | `docs/runtime/pr-qa-link-cleanup-008j-waiting-room-copy-20260618.png` | 截图、page data、toast / modal / errorText 可见文案均无 `酒局`、`酒桌判官`、`判官`、`惩罚`、`罚酒`；等待态、加载失败态、未找到态和离开确认态统一使用 `聚会`。 | 任一用户可见旧词残留退回前端 008J；若旧词来自接口返回，抄送接口联调 / 后端并记录字段来源。 |

##### 13.16.80.4 并入 13.16.78 数据破界

008J 解冻后结果并入 13.16.78.3 第 11 项 `数据破界`：`waiting-room` 作为 `app.json` 当前可达页面必须参与旧词扫描和截图检查；用户可见 `酒局 / 酒桌判官 / 判官 / 惩罚 / 罚酒` 任一命中即退回，不得写全目标通过。`session-brief/index.ts` 的旧词清洗正则命中不作为上屏失败，但必须在扫描记录中注明其用途和非上屏边界。

##### 13.16.80.5 当前回报给 PM

`PR-QA-LINK-CLEANUP-008J-WAITING-ROOM-COPY-GATE` 已登记为 008H / 008I 后续静态清洁门禁，不代表通过。前端 `PR-FE-LINK-CLEANUP-008J-WAITING-ROOM-COPY-CLEANUP` 回包前，测试不解冻、不复测旧版本；回包后先做 waiting-room 静态扫描，再等待 PM 有限解冻令执行 `/pages/waiting-room/index` 截图、page data、toast / modal / errorText 文案检查。旧 `酒局 / 酒桌判官 / 判官 / 惩罚 / 罚酒` 用户可见命中即退回前端 008J；不得写页面通过、UI/UX 通过、真机通过或上线通过。

#### 13.16.81 `PR-QA-LINK-CLEANUP-008K-MATRIX-PATH-CORRECTION` 2026-06-18 个人中心矩阵路径修正

记录时间：2026-06-18。PM 准备 008K 有限解冻 runbook 时发现测试矩阵路径错误：当前 `miniprogram/app.json` 注册个人中心页面为 `pages/me/index`，而 13.16.78.2 原“个人中心”路径写成 `/pages/profile/index`，会导致有限解冻后复测跑错页面。当前 DevTools hard freeze 继续生效；本节只修正测试计划，不运行 `status` / `relaunch` / `tap` / `clearStorage` / storage 注入 / 截图 / 重启工具，不写页面通过、UI/UX 通过、真机通过或上线通过。

| 修正项 | 修正前 | 修正后 | 依据 / 边界 |
| --- | --- | --- | --- |
| 13.16.78.2 个人中心路径 | `/pages/profile/index` | `/pages/me/index` | 依据 PM 静态核验：`miniprogram/app.json` 注册个人中心为 `pages/me/index`。 |
| 13.16.78.2 data keys | `profile,entryList,entryTarget,activeEntry,errorText` | `currentProfile,features,assetStats,wineStats,momentSummaries,errorText` | 贴合当前个人中心 page data；后续有限解冻时仍需记录入口去重、落点分流和数据破界。 |
| 截图命名 | `docs/runtime/pr-qa-link-cleanup-008h-profile-20260618.png` | `docs/runtime/pr-qa-link-cleanup-008h-me-20260618.png` | 仅修正命名基线，当前未生成截图。 |

当前回报给 PM：`PR-QA-LINK-CLEANUP-008K-MATRIX-PATH-CORRECTION` 已完成测试计划修正，未触发 DevTools，不代表个人中心页面通过。PM 有限解冻后，个人中心复测应打开 `/pages/me/index`，采集 `currentProfile/features/assetStats/wineStats/momentSummaries/errorText`，并继续按 13.16.78.3 第 4 项验证入口去重与落点分流。

#### 13.16.82 `PR-QA-LINK-CLEANUP-008L-SHARE-SAVE-COPY-GATE` 2026-06-18 分享保存页文案门禁

记录时间：2026-06-18。PM 新派 008L 分享保存页文案统一门禁：当前 `share-poster` 用户可见文案仍混用 `海报`，新版主目标应统一为 `分享图 / 分享截图保存`。当前 DevTools hard freeze 继续生效；测试不得运行 `status` / `relaunch` / `tap` / `clearStorage` / storage 注入 / 截图 / 重启工具。本节只登记文案待测门禁，不写页面通过、UI/UX 通过、真机通过或上线通过。

##### 13.16.82.1 前端 008L 回包准入

| 准入项 | 需要证据 | 未满足时结论 |
| --- | --- | --- |
| 前端文案修复 | 前端计划记录 `PR-FE-LINK-CLEANUP-008L-SHARE-SAVE-COPY-CLEANUP` 或等价任务编号、替换文件清单，至少覆盖 `miniprogram/pages/share-poster/*` 的 WXML / TS / LESS / 组件文案来源。 | 前端 008L 回包前，不解冻、不复测旧版本。 |
| 校验命令 | 前端回包需提供 `npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check` 结果。 | 缺任一静态校验时，只能写待前端补证。 |
| 关键词扫描 | 前端或测试解冻前只读扫描需覆盖 `miniprogram/pages/share-poster` 及其直接引用组件；关键词至少含 `海报`、`保存海报`、`分享海报`、`生成海报`、`poster` 用户可见映射。允许技术字段 `share-poster` / `posterImagePath` / `posterImageUrl` 作为代码路径或 data key 存在，但不得上屏为旧主口径。 | 用户可见 `海报` 主口径残留，退回前端 008L。 |

##### 13.16.82.2 解冻后新增断言

| 页面 / 文件 | 页面路径 / data keys | 截图路径基线 | 通过标准 | 退回责任 |
| --- | --- | --- | --- | --- |
| share-poster 保存页文案 | `/pages/share-poster/index?sessionId=session-1781787045680-8e406c&briefId=brief-1781787045693-bc8904b9&taskId=share-task-1781787045694-9725ffeb`；data keys=`photoHighlights,accountingHighlights,keyEvents,readyShareImageUrl,shareTask,saveState,errorText,posterImagePath,posterImageUrl,ledgerIncluded,displayTaskLayoutMode` | `docs/runtime/pr-qa-link-cleanup-008l-share-save-copy-20260618.png` | 标题、主按钮、保存成功态、失败/重试态、状态面板、保存图预览、权限/提示文案均不得出现旧 `海报` 主口径；用户可见文案统一为 `分享图`、`分享截图`、`保存分享图` 或等价新口径。 | 任一用户可见 `海报` 主口径残留，退回前端 008L；如果 data 中技术字段 `posterImagePath/posterImageUrl` 未上屏，可记录为技术字段不阻塞。 |

##### 13.16.82.3 与 13.16.78 分享图规则的关系

008L 只补 `share-poster` 文案门禁，不替代 13.16.78 的分享页 / 保存图视觉和 PNG 原图准出。若保存图实际 PNG 仍为旧红壳、旧长图、白图、旧品牌、或页面预览与 PNG 来源不一致，继续按 13.16.78.3 第 12 / 13 项退回前端 / UI / 后端 renderer / 接口联调；不得因为文案清洁通过就写分享保存链路通过。

##### 13.16.82.4 当前回报给 PM

`PR-QA-LINK-CLEANUP-008L-SHARE-SAVE-COPY-GATE` 已登记为分享保存页文案统一门禁，不代表通过。前端 008L 回包前，测试不解冻、不复测旧版本；回包后先做静态关键词扫描，再等待 PM 有限解冻令执行 `share-poster` 标题、主按钮、保存成功态、状态面板、保存图预览文案检查。用户可见 `海报` 主口径残留退回前端；PNG 旧红壳 / 长图 / 白图按既有分享图规则退回前端 / UI / 后端 renderer。不得写页面通过、UI/UX 通过、真机通过或上线通过。

#### 13.16.83 `PR-QA-LINK-CLEANUP-008M-CREATE-TEMPLATE-RESIDUE-GATE` 2026-06-18 创建页去主题 / 去模板残留门禁

记录时间：2026-06-18。PM 新派 008M 创建页去主题 / 去模板残留门禁：当前 WXML 未展示主题卡，但静态核查发现 `miniprogram/pages/create-session/index.ts` 仍有模板加载、缓存、点击和 `activeTemplate` 创建逻辑，`miniprogram/pages/create-session/index.less` 仍有模板 / 主题样式，`miniprogram/mock/home.ts` fallback 仍有 `老友回忆主题` / `主题` / `free-template`。当前只能登记待测门禁，不写页面通过、上线通过或正式发布通过；运行态证据等待 PM 明确复测窗口。

##### 13.16.83.1 前端 008M 回包准入

| 准入项 | 需要证据 | 未满足时结论 |
| --- | --- | --- |
| 修复范围 | 前端计划记录 `PR-FE-LINK-CLEANUP-008M-CREATE-TEMPLATE-RESIDUE-CLEANUP` 或等价任务编号，改动文件必须覆盖 `miniprogram/pages/create-session/index.ts`、`miniprogram/pages/create-session/index.less`、`miniprogram/mock/home.ts`；如还有组件 / service / mock 间接提供模板字段，也需列出。 | 前端 008M 回包前，不解冻、不复测旧版本，不写创建页通过。 |
| 静态校验 | 前端回包需提供 `npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check` 结果。 | 缺任一校验时，只能写待前端补证。 |
| 关键词扫描 | 前端或测试只读扫描需覆盖创建页 WXML / TS / LESS / mock fallback；关键词至少含 `轻量主题`、`主题`、`模板`、`template`、`templates`、`templatesLoading`、`activeTemplate`、`free-template`、`老友回忆主题`、`handleTemplate`、`selectTemplate`。 | 任一用户可触达主题 / 模板入口、缓存、点击、创建名或 fallback 未解释，退回前端 008M。 |

##### 13.16.83.2 静态门禁

| 文件 / 层级 | 不得残留 | 允许边界 |
| --- | --- | --- |
| `miniprogram/pages/create-session/index.wxml` | 用户可见轻量主题、主题选择、模板卡、模板横滑、模板入口、模板 loading。 | 历史注释也应清理或标注非上屏；不得依赖“当前未渲染”写通过。 |
| `miniprogram/pages/create-session/index.ts` | 模板加载、模板缓存、模板点击、`activeTemplate` 驱动创建名、`templatesLoading` 阻塞创建、旧模板字段回填。 | 若保留纯技术兼容字段，必须证明不被 page data、UI、创建 payload、默认文案触达。 |
| `miniprogram/pages/create-session/index.less` | 模板 / 主题卡片、横滑列表、模板选中态、主题样式残留。 | 通用布局样式可保留，但类名 / 注释不得继续表达用户可触达主题模板入口。 |
| `miniprogram/mock/home.ts` | `老友回忆主题`、用户可见 `主题` 文案、`free-template` fallback、默认模板入口。 | mock 可保留非用户可见测试结构，但不得在本地 / fallback UI 回填主题入口。 |

##### 13.16.83.3 后续受控复测断言

| 页面 / 操作 | 页面路径 / data keys | 截图路径基线 | 通过标准 | 退回责任 |
| --- | --- | --- | --- | --- |
| 创建页静态 + 运行态 | `/pages/create-session/index`；data keys=`formData,createTime,currentTimeText,playerCount,visibilityOptions,permissionOptions,selectedPermissions,description,defaultChips,errorText` | `docs/runtime/pr-qa-link-cleanup-008m-create-template-residue-20260618.png` | 页面只保留聚会名称、当前实时创建时间、人数 / 高级设置、创建并邀请；不出现主题选择、模板横滑卡、旧主题 fallback、模板 loading、模板默认标题；page data 不含用户可触达 `activeTemplate/templates/templatesLoading/free-template`。 | 主题 / 模板 UI、page data、默认标题、fallback 或样式残留，退回前端 008M；若 mock / 接口回填旧模板，抄送接口联调 / 后端。 |
| 创建后链路 | 从创建页点击 `创建并邀请`；仅在 PM 明确复测窗口内执行 | `sessionId,inviteCode,nextPage,errorText,loading` | `docs/runtime/pr-qa-link-cleanup-008m-create-invite-first-photo-20260618.png` | 创建后仍进入邀请 / 拍第一张链路，不被模板 loading、模板选择或主题配置阻断。 | 创建停留、跳旧模板、模板 loading 阻断、不能到邀请 / 拍照，退回前端 / 接口联调。 |

##### 13.16.83.4 与 13.16.78 / 13.16.79 的关系

008M 补强 13.16.78.3 第 7 项 `创建时间与创建页` 和 13.16.79 的创建页主题文案门禁：不仅 UI 不得出现 `主题`，创建页 WXML / TS / LESS / page data / mock fallback 也不得保留用户可触达的轻量主题、模板卡、模板缓存、模板点击、`activeTemplate` 创建名或旧主题 fallback。008M 通过前，创建页目标仍保持待测，不得写全目标通过。

##### 13.16.83.5 当前回报给 PM

`PR-QA-LINK-CLEANUP-008M-CREATE-TEMPLATE-RESIDUE-GATE` 已登记为创建页去主题 / 去模板残留门禁，不代表通过。前端 008M 回包前，测试不复测旧版本，不写创建页通过；回包后先做静态关键词扫描，再等待 PM 明确复测窗口执行创建页运行态与创建后邀请 / 拍第一张链路验证。当前未闭环项：前端需清理 `index.ts` 模板逻辑、`index.less` 模板 / 主题样式、`mock/home.ts` 主题 fallback，并提供 `typecheck`、`check:encoding`、目标 diff check 证据。

#### 13.16.84 `PR-QA-LINK-CLEANUP-008O-TOOLS-TABBAR-GATE` 2026-06-18 工具箱底部导航一致性门禁

记录时间：2026-06-18。PM 新派 008O 工具箱底部导航一致性门禁：用户反馈工具箱点进去后底部排版与首页底部导航不一样。PM 静态证据显示工具箱页 WXML 使用 `tools-tabbar` 独立结构，LESS `.tools-tabbar` 仍为 `grid-template-columns: repeat(4, 1fr)`，但实际只有 `首页 / 工具箱 / 我的` 三个入口，和首页 `bottom-nav` 三列结构不一致。当前只登记待测门禁，不触发 DevTools，不写页面通过或上线通过。

##### 13.16.84.1 前端 008O 回包准入

| 准入项 | 需要证据 | 未满足时结论 |
| --- | --- | --- |
| 修复范围 | 前端计划 14.67 记录 `PR-FE-LINK-CLEANUP-008O-TOOLS-TABBAR-FIX` 或等价任务编号，改动文件必须覆盖 `miniprogram/pages/tools/index.wxml`、`miniprogram/pages/tools/index.less`；若抽出公共底部导航组件，也需列出组件文件和首页接入关系。 | 前端 008O 回包前，不解冻、不复测旧版本，不写工具箱通过。 |
| 静态校验 | 前端回包需提供 `npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check` 结果。 | 缺任一校验时，只能写待前端补证。 |
| 关键词扫描 | 前端或测试只读扫描需覆盖 `miniprogram/pages/tools/index.wxml`、`miniprogram/pages/tools/index.less`、首页底部导航相关文件；关键词至少含 `tools-tabbar`、`bottom-nav`、`grid-template-columns`、`repeat(4, 1fr)`、`首页`、`工具箱`、`我的`。 | 四列 grid、旧 `tools-tabbar` 独立排版或与首页不一致的底部导航残留，退回前端 008O。 |

##### 13.16.84.2 静态门禁

| 检查项 | 通过标准 | 退回责任 |
| --- | --- | --- |
| 结构一致性 | 工具箱底部导航与首页 `bottom-nav` 同构或等价一致；如仍保留独立结构，必须证明三入口、三列、高度、safe-area、字体、间距、active 态与首页一致。 | 独立结构导致视觉 / 交互不一致，退回前端 008O。 |
| 三入口 / 三列 | 仅 `首页 / 工具箱 / 我的` 三个入口，CSS 不得继续用 `repeat(4, 1fr)` 或为第四入口预留空间。 | 四列 grid、空列、间距偏移、隐藏第四项残留，退回前端 008O。 |
| active 态 | 工具箱页进入后 `工具箱` active；首页、我的入口文案和点击目标与首页底部导航一致。 | active 错误、文案不一致、目标路由不一致，退回前端。 |
| 安全区 / 尺寸 | 底部高度、safe-area、字体大小、图标 / 文案间距、点击热区与首页一致。 | 底部压缩、悬浮高度不一致、安全区遮挡或点击热区异常，退回前端 / UI。 |

##### 13.16.84.3 后续受控复测断言

| 页面 / 操作 | 页面路径 / data keys | 截图路径基线 | 通过标准 | 退回责任 |
| --- | --- | --- | --- | --- |
| 首页进入工具箱 | `/pages/index/index` -> tap 工具箱入口 -> `/pages/tools/index`；data keys=`bottomTabs,activeTab,allTools,filteredTools,popularTools,categoryCards,errorText` | `docs/runtime/pr-qa-link-cleanup-008o-home-to-tools-tabbar-20260618.png` | 从首页进入工具箱后，底部导航位置、间距、尺寸与首页一致；`工具箱` active；工具箱不重复跳转。 | 位置 / 间距 / 尺寸不一致、active 错误、重复跳转，退回前端 008O。 |
| 工具箱底部跳转 | 在 `/pages/tools/index` 分别单次 tap `首页`、`我的`；必要时返回工具箱 | `page,query,bottomTabs,activeTab,currentProfile,errorText` | `docs/runtime/pr-qa-link-cleanup-008o-tools-tabbar-jump-20260618.png` | `首页` 跳 `/pages/index/index`，`我的` 跳 `/pages/me/index`；工具箱入口在当前页不重复触发异常跳转；Console 无阻塞红错。 | 路由错误、重复跳转、Console 红错，退回前端；若工具链未解冻则保持待测。 |

##### 13.16.84.4 与 13.16.78 的关系

008O 补强 13.16.78.3 第 3 项 `首页底部三项与工具箱`：不只验证工具箱列表可用，还必须验证工具箱页底部导航与首页三列底部导航同构或等价一致。008O 通过前，工具箱底部导航一致性保持待测，不得写 008H 全目标通过。

##### 13.16.84.5 当前回报给 PM

`PR-QA-LINK-CLEANUP-008O-TOOLS-TABBAR-GATE` 已登记为工具箱底部导航一致性门禁，不代表通过。前端 008O 回包前，测试不复测旧版本，不触发 DevTools；回包后先做静态关键词扫描，再等待 PM 明确复测窗口执行首页进入工具箱、工具箱底部跳首页 / 我的的受控复测。当前未闭环项：前端需修 `tools-tabbar` 独立结构或抽公共底部导航，清除四列 grid / 旧排版残留，并提供计划 14.67、`typecheck`、`check:encoding`、目标 diff check 证据。

#### 13.16.85 `PR-QA-LINK-CLEANUP-008P-ME-ENTRY-DEDUP-GATE` 2026-06-18 个人中心入口去重门禁

记录时间：2026-06-18。PM 新派 008P 个人中心入口去重门禁：用户目标是个人中心重复入口太多，大多数按钮都进入相册。PM 静态复核确认当前 `me` 页仍有顶部 `我的相册`、底部四项含 `相册`、更多设置 `我的相册`、统计项和最近回忆多项进入 album。当前只登记待测门禁，不触发 DevTools，不写页面通过或上线通过。

##### 13.16.85.1 前端 008P 回包准入

| 准入项 | 需要证据 | 未满足时结论 |
| --- | --- | --- |
| 修复范围 | 前端计划 14.68 记录 `PR-FE-LINK-CLEANUP-008P-ME-ENTRY-DEDUP` 或等价任务编号，改动文件必须覆盖 `miniprogram/pages/me/index.wxml`、`miniprogram/pages/me/index.ts`、`miniprogram/pages/me/index.less`；若抽出公共底部导航或入口配置，也需列出。 | 前端 008P 回包前，不解冻、不复测旧版本，不写个人中心通过。 |
| 静态校验 | 前端回包需提供 `npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check` 结果。 | 缺任一校验时，只能写待前端补证。 |
| 入口 / 路由扫描 | 前端或测试只读扫描需覆盖 me 页 WXML / TS / LESS 和入口配置；记录所有用户可见入口文案、selector / tap handler、目标路由。关键词至少含 `我的相册`、`相册`、`album`、`navigateTo`、`switchTab`、`reLaunch`、`features`、`momentSummaries`、`assetStats`。 | 多个入口重复指向 `/pages/album/index`、底部仍有 `相册` tab 或入口用途不清，退回前端 008P。 |

##### 13.16.85.2 静态门禁

| 检查项 | 通过标准 | 退回责任 |
| --- | --- | --- |
| 底栏一致性 | 个人中心底栏对齐首页 / 工具箱三入口 `首页 / 工具箱 / 我的`，且 `我的` active。 | 底部仍有 `相册` tab、四项底栏或与首页 / 工具箱不一致，退回前端 008P；底栏视觉不一致同步 008O。 |
| 入口去重 | 首屏、更多设置、统计卡、最近回忆、待处理区域不得重复出现多个 `我的相册` 入口。 | 多个相册入口重复、相册入口压过创建 / 工具 / 账本主链路，退回前端 / UI。 |
| 路由分流 | 入口目标需分流到创建聚会、工具箱、聚会账本、好友管理、资料设置、单个聚会简报或唯一相册入口；不得大多数进入 `/pages/album/index`。 | 大多数按钮进 album、单个聚会项不进简报、设置 / 工具 / 账本跳错，退回前端。 |
| 数据破界 | UI 和 page data 摘要不得外显 `PR Seed`、`IT-MOMENTS`、raw/debug、旧品牌主文案或内部样本名。 | 命中按 13.16.78 数据破界规则退回前端 / 数据清洁 / 后端。 |

##### 13.16.85.3 后续受控复测断言

| 页面 / 操作 | 页面路径 / data keys | 截图路径基线 | 通过标准 | 退回责任 |
| --- | --- | --- | --- | --- |
| 个人中心首屏 | `/pages/me/index`；data keys=`currentProfile,features,assetStats,wineStats,momentSummaries,errorText` | `docs/runtime/pr-qa-link-cleanup-008p-me-entry-dedup-20260618.png` | 首屏入口清爽；创建聚会、工具箱、账本、好友管理、设置、最近 / 待处理聚会简报分流清楚；保留的相册入口如有，必须唯一、明确且不压过主链路。 | 入口重复、相册入口过多、主链路弱化、UI 出现工程字段，退回前端 / UI。 |
| 入口点击分流 | 在 `/pages/me/index` 串行点击创建聚会、工具箱、账本、好友管理、设置、单个聚会项、唯一相册入口（如存在） | `entryText,entryTarget,page,query,errorText` | `docs/runtime/pr-qa-link-cleanup-008p-me-entry-routes-20260618.png` | 创建进 `/pages/create-session/index`，工具进 `/pages/tools/index`，账本进 ledger，好友管理 / 设置进对应功能，单个聚会项进 `session-brief`；相册入口如保留，仅唯一进入 `/pages/album/index`。 | 多数入口进入 album、单个聚会项进 album 而非简报、跳旧壳或跳错页，退回前端。 |

##### 13.16.85.4 与 13.16.78 / 13.16.81 的关系

008P 补强 13.16.78.3 第 4 项 `个人中心入口` 和 13.16.81 的 `/pages/me/index` 路径修正：后续有限解冻复测必须打开 `/pages/me/index`，不仅检查入口存在，还要统计入口数量、目标路由分布和 album 路由占比。008P 通过前，个人中心入口去重与落点分流保持待测，不得写 008H 全目标通过。

##### 13.16.85.5 当前回报给 PM

`PR-QA-LINK-CLEANUP-008P-ME-ENTRY-DEDUP-GATE` 已登记为个人中心入口去重门禁，不代表通过。前端 008P 回包前，测试不复测旧版本，不触发 DevTools；回包后先做入口 / 路由静态扫描，再等待 PM 明确复测窗口执行个人中心首屏和入口点击分流受控复测。当前未闭环项：前端需清理 me 页重复 `我的相册` 入口、底部 `相册` tab 和多数入口进 album 的路由配置，并提供计划 14.68、`typecheck`、`check:encoding`、目标 diff check、入口 / 路由扫描证据。

#### 13.16.86 `PR-QA-LINK-CLEANUP-008Q-TOOL-DETAIL-USABILITY-GATE` 2026-06-18 工具详情可用性门禁

记录时间：2026-06-18。PM 新派 008Q 工具详情可用性门禁：用户要求工具箱列表里的每个工具都可使用。PM 静态核查发现 `tool-detail` 底部 `查看使用记录` 跳 `/pages/usage-history/index`，但 `app.json` 未注册该页面，点击会破坏工具详情链路；前端已收到 008Q 修复任务。当前只登记待测门禁，不触发 DevTools，不写页面通过。

##### 13.16.86.1 前端 008Q 回包准入

| 准入项 | 需要证据 | 未满足时结论 |
| --- | --- | --- |
| 修复范围 | 前端计划 14.69 记录 `PR-FE-LINK-CLEANUP-008Q-TOOL-DETAIL-USABILITY-FIX` 或等价任务编号，改动文件必须覆盖 `miniprogram/pages/tool-detail/index.wxml`、`miniprogram/pages/tool-detail/index.ts`，必要时覆盖 `miniprogram/pages/tool-detail/index.less`；如新增或注册 usage history 页面，也必须列出 `app.json` 变更依据。 | 前端 008Q 回包前，不解冻、不复测旧版本，不写工具详情通过。 |
| 静态校验 | 前端回包需提供 `npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check` 结果。 | 缺任一校验时，只能写待前端补证。 |
| 关键词 / 路由扫描 | 前端或测试只读扫描需覆盖 `tool-detail` WXML / TS / LESS、工具箱列表入口和 `app.json`；关键词至少含 `/pages/usage-history/index`、`查看使用记录`、`handlePrimaryTap`、`navigateTo`、`toolId`、`toolError`。 | 主按钮仍跳未注册页面、`handlePrimaryTap` 目标不清或 app.json 未注册目标页，退回前端 008Q。 |

##### 13.16.86.2 静态门禁

| 检查项 | 通过标准 | 退回责任 |
| --- | --- | --- |
| 未注册页面跳转 | 工具详情页不得继续出现跳未注册 `/pages/usage-history/index` 的主按钮或底部按钮。 | 仍有未注册路径跳转，退回前端 008Q。 |
| `handlePrimaryTap` | 如保留 `handlePrimaryTap`，必须证明其不跳 `/pages/usage-history/index`，且按当前工具类型进入可用操作、内联运行态或已注册页面。 | handler 仍指向 usage-history、空跳转、错误页或不可解释路径，退回前端。 |
| 工具详情主动作 | `立即使用` 或等价主动作应与工具能力匹配，不能只是不可用占位；错误态需中文可读且不破坏返回工具箱。 | 主动作不可点、空实现、英文 / debug 错误、返回断链，退回前端 / UI。 |
| 返回工具箱 | 工具详情页应保留可返回工具箱路径或页面栈返回；不得因未注册页导致链路断裂。 | 返回失败、跳首页丢失上下文、空白页，退回前端。 |

##### 13.16.86.3 后续受控复测断言

| 页面 / 操作 | 页面路径 / data keys | 截图路径基线 | 通过标准 | 退回责任 |
| --- | --- | --- | --- | --- |
| 工具箱进入详情 | `/pages/tools/index`，从列表串行点击至少 3 类工具详情，例如图片压缩、文字计数、二维码生成；不得只直达详情 | `allTools,filteredTools,toolId,toolName,toolMode,toolError,page,errorText` | `docs/runtime/pr-qa-link-cleanup-008q-tools-to-detail-20260618.png` | 每个工具从列表进入对应详情，`toolError=""` 或中文可解释，页面不跳未注册页。 | 任一工具无法进入、跳错页、toolError 阻塞，退回前端。 |
| 工具详情主动作 | 在 3 类工具详情内分别验证 `立即使用` 区域或当前主操作，不扩大高频点击 | `toolId,toolName,toolMode,toolError,primaryActionState,errorText` | `docs/runtime/pr-qa-link-cleanup-008q-tool-detail-primary-20260618.png` | 主操作区域可用或展示明确可执行输入 / 预览；底部按钮不触发 `/pages/usage-history/index` 未注册页面错误。 | 点击后报未注册页面、空白、无响应、英文/debug 错误，退回前端。 |
| 返回工具箱 | 从每个详情返回 `/pages/tools/index` | `page,query,activeCategory,filteredTools,errorText` | `docs/runtime/pr-qa-link-cleanup-008q-tool-detail-back-20260618.png` | 返回后工具箱列表仍可用，activeCategory / 列表状态不丢失。 | 返回断链、列表空、状态丢失或 Console 红错，退回前端。 |

##### 13.16.86.4 与 13.16.78 / 13.16.84 的关系

008Q 补强 13.16.78.3 第 3 项 `首页底部三项与工具箱` 和 13.16.84 工具箱底部导航一致性：工具箱不仅要能打开列表和底栏一致，还必须保证列表里的工具详情可用、主动作不跳未注册页面、可返回工具箱。008Q 通过前，不得写工具箱全链路通过或 008H 全目标通过。

##### 13.16.86.5 当前回报给 PM

`PR-QA-LINK-CLEANUP-008Q-TOOL-DETAIL-USABILITY-GATE` 已登记为工具详情可用性门禁，不代表通过。前端 008Q 回包前，测试不复测旧版本，不触发 DevTools；回包后先做 `/pages/usage-history/index`、`查看使用记录`、`handlePrimaryTap` 静态扫描，再等待 PM 明确复测窗口执行至少 3 类工具从列表进入详情、主动作和返回工具箱的受控复测。当前未闭环项：前端需清除或修正未注册 usage-history 跳转，证明 `handlePrimaryTap` 不破坏工具详情链路，并提供计划 14.69、`typecheck`、`check:encoding`、目标 diff check、路由扫描证据。

#### 13.16.87 `PR-QA-LINK-CLEANUP-008R-MOMENT-AUTH-SEMANTIC-GATE` 2026-06-18 拍第一张授权语义门禁

记录时间：2026-06-18。PM 新派 008R 拍第一张页授权语义收口门禁：用户要求拍第一张页说明 2 行、默认文案 chip、无 `仅自己`、4 项默认全选。PM 静态核查发现 `moment-editor` 的 4 项 `consentItems` 默认 `checked=true`，但 `visibilityOptions` 是 3 项单选，旧测试记录容易把“可见范围 3 项”误判为“授权 4 项未全选”。当前只登记待测门禁，不触发 DevTools，不写页面通过。

##### 13.16.87.1 前端 008R 回包准入

| 准入项 | 需要证据 | 未满足时结论 |
| --- | --- | --- |
| 修复范围 | 前端计划 14.70 记录 `PR-FE-LINK-CLEANUP-008R-MOMENT-AUTH-SEMANTIC` 或等价任务编号，改动文件必须覆盖 `miniprogram/pages/moment-editor/index.wxml`、`miniprogram/pages/moment-editor/index.ts`、`miniprogram/pages/moment-editor/index.less`；如新增测试别名或组件，也需列出。 | 前端 008R 回包前，不解冻、不复测旧版本，不写拍第一张页通过。 |
| 静态校验 | 前端回包需提供 `npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check` 结果。 | 缺任一校验时，只能写待前端补证。 |
| 关键词 / 语义扫描 | 前端或测试只读扫描需覆盖 moment-editor WXML / TS / LESS；关键词至少含 `visibilityOptions`、`consentItems`、`authorizationOptions`、`selectedAuthorizations`、`仅自己`、`captionPresets`、`caption`、`textarea`、`save`、`live-record`。 | 可见范围与授权用途语义混用、`仅自己` 残留、授权默认态不可证明，退回前端 008R。 |

##### 13.16.87.2 静态门禁

| 检查项 | 通过标准 | 退回责任 |
| --- | --- | --- |
| 可见范围语义 | `visibilityOptions` 可保持 3 项单选，但必须明确是“可见范围”，不得被测试或 UI 文案当作 4 项授权用途。 | 文案 / data 命名导致 3 项可见范围被误解为授权项，退回前端补语义。 |
| 授权用途语义 | 4 项授权用途以 `consentItems` 或 `authorizationOptions/selectedAuthorizations` 呈现，默认全选；如新增测试别名，必须与 `consentItems` 一致。 | 授权项少于 4 项、默认未全选、别名与 consentItems 不一致，退回前端 / UGC。 |
| 禁止项 | WXML / TS / LESS / page data 不得出现用户可见 `仅自己`。 | `仅自己` 残留即退回前端 008R。 |
| 说明与输入 | 一句话说明视觉高度最多 2 行；默认文案 chip 可点击填充；不得把输入框变回长文本区。 | 说明超 2 行、chip 不可用、输入框变长文本区或遮挡主动作，退回前端 / UI。 |
| 保存回流 | 保存成功后目标仍应为 `/pages/live-record/index?sessionId=...`，不得回首页。 | 保存后回首页、丢 sessionId、跳错页，退回前端 / 接口联调。 |

##### 13.16.87.3 后续受控复测断言

| 页面 / 操作 | 页面路径 / data keys | 截图路径基线 | 通过标准 | 退回责任 |
| --- | --- | --- | --- | --- |
| 拍第一张初始态 | `/pages/moment-editor/index?sessionId=session-1781787045680-8e406c&nodeType=opening` | `caption,captionPresets,consentItems,authorizationOptions,selectedAuthorizations,visibilityOptions,visibility,errorText,submitLabel` | `docs/runtime/pr-qa-link-cleanup-008r-moment-auth-initial-20260618.png` | 无 `仅自己`；`visibilityOptions` 按可见范围记录，不按授权项判定；4 项授权用途默认全选；说明不超过 2 行；默认文案 chip 可见。 | 语义混淆、授权未全选、`仅自己` 残留、说明过长，退回前端 008R。 |
| 默认文案 chip | 在 moment-editor 单次 tap 默认文案 chip | `caption,captionPresets,errorText` | `docs/runtime/pr-qa-link-cleanup-008r-caption-chip-20260618.png` | tap 后 `caption` 填充默认文案，输入区仍为短说明形态，不变成长文本区。 | chip 不可点、caption 不变、长文本区回归，退回前端 / UI。 |
| 保存后回流 | 在 PM 明确复测窗口内，保存第一张照片后观察页面 | `sessionId,nodeType,saveState,nextRoute,errorText` | `docs/runtime/pr-qa-link-cleanup-008r-save-return-live-record-20260618.png` | 保存成功进入 `/pages/live-record/index?sessionId=...`，不回首页；如 DevTools 保存能力不足，记录预览态限制，不写真机通过。 | 回首页、跳错页、保存无状态、sessionId 丢失，退回前端 / 接口联调。 |

##### 13.16.87.4 与 13.16.78 的关系

008R 补强 13.16.78.3 第 9 / 10 项：`拍第一张后回流` 和 `可见与授权`。后续复测报告必须明确区分 `visibilityOptions=可见范围 3 项单选` 与 `consentItems/authorizationOptions=授权用途 4 项默认全选`，不得再用 3 项可见范围误判“授权 4 项未全选”。008R 通过前，不得写拍第一张页或 008H 全目标通过。

##### 13.16.87.5 当前回报给 PM

`PR-QA-LINK-CLEANUP-008R-MOMENT-AUTH-SEMANTIC-GATE` 已登记为拍第一张页授权语义门禁，不代表通过。前端 008R 回包前，测试不复测旧版本，不触发 DevTools；回包后先做 `visibilityOptions/consentItems/authorizationOptions/selectedAuthorizations/仅自己/captionPresets` 静态扫描，再等待 PM 明确复测窗口执行初始态、默认文案 chip 和保存回流受控复测。当前未闭环项：前端需完成可见范围与授权用途语义分离、4 项授权默认全选别名一致、2 行说明与 chip、保存回流 live-record，并提供计划 14.70、`typecheck`、`check:encoding`、目标 diff check 证据。

#### 13.16.88 `PR-QA-DATA-BOUNDARY-008S-RUNTIME-GATE` 2026-06-18 运行态数据破界门禁

记录时间：2026-06-18。PM 对关键链路源码做静态扫描，范围包含首页、记录 / 账本、简报、分享预览 / 分享图、个人中心和 `moment-card` / `session-summary` 组件。当前静态未发现 `PR Seed`、`IT-MOMENTS`、`PR-BE-DB-LOGIN`、`openId`、`signature`、`brief not found`、`task failed` 直接出现在 WXML 可见文案；命中主要在清洗正则、TS 类型空值或历史文档。静态不能替代运行态。本节只建立下一次受控预览窗口的数据破界门禁，不触发 DevTools，不跑截图，不要求用户补图，不写页面通过或上线通过。

##### 13.16.88.1 受控窗口覆盖页面

| 页面 | 路径 / query 基线 | data keys | 截图路径基线 |
| --- | --- | --- | --- |
| 首页 | `/pages/index/index` | `home,recentAlbums,recentSessions,quickTools,bottomTabs,errorText` | `docs/runtime/pr-qa-data-boundary-008s-index-20260618.png` |
| 记录页 | `/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=member` | `sessionId,sessionName,timelineNodes,photoNodes,ledgerTimelineItems,records,players,errorText` | `docs/runtime/pr-qa-data-boundary-008s-live-record-20260618.png` |
| 账本页 | `/pages/ledger/index?sessionId=session-1781787045680-8e406c&role=judge` | `sessionId,stats,players,ledgerItems,ledgerEditable,ledgerEventCount,errorText` | `docs/runtime/pr-qa-data-boundary-008s-ledger-20260618.png` |
| 简报页 | `/pages/session-brief/index?sessionId=session-1781787045680-8e406c&briefId=brief-1781787045693-bc8904b9` | `sessionId,briefId,timelineNodes,photoHighlights,accountingHighlights,keyEvents,ledgerSummary,errorText,loading` | `docs/runtime/pr-qa-data-boundary-008s-session-brief-20260618.png` |
| 分享回流 | `/pages/share-preview/index?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2&briefId=brief-1781787045693-bc8904b9` | `shareSummary,photoHighlights,accountingHighlights,keyEvents,inviteStatusText,visibleNodeIds,filteredNodeIds,errorText` | `docs/runtime/pr-qa-data-boundary-008s-share-preview-20260618.png` |
| 分享图页 | `/pages/share-poster/index?sessionId=session-1781787045680-8e406c&briefId=brief-1781787045693-bc8904b9&taskId=share-task-1781787045694-9725ffeb` | `photoHighlights,accountingHighlights,keyEvents,readyShareImageUrl,shareTask,saveState,errorText,posterImageUrl` | `docs/runtime/pr-qa-data-boundary-008s-share-poster-20260618.png` |
| 个人中心 | `/pages/me/index` | `currentProfile,features,assetStats,wineStats,momentSummaries,errorText` | `docs/runtime/pr-qa-data-boundary-008s-me-20260618.png` |

##### 13.16.88.2 门禁关键词

下一次 PM 明确受控窗口时，只记录实际页面截图、page data、Console 中是否外露以下关键词：

| 类型 | 关键词 |
| --- | --- |
| 工程样本 / 旧 seed | `PR Seed`、`PR-BE-DB-LOGIN`、`IT-MOMENTS` |
| 身份 / 内部字段 | `openId`、`unionId`、`signature` |
| 接口错误原文 | `brief not found`、`task failed` |
| 空值 / 渲染异常 | `undefined`、`null`、`NaN`、`???` |
| 旧品牌主文案 | `酒桌判官`、`判官`、`惩罚`、`罚酒`、用户可见旧 `酒局` 主口径 |

##### 13.16.88.3 判定规则

| 发现位置 | 判定 | 退回对象 |
| --- | --- | --- |
| UI 截图用户可见区域外露门禁关键词 | 失败，记录页面、字段、截图路径或 page data 证据，给前端退回码 `PR-FE-DATA-BOUNDARY-008S-VISIBLE-LEAK`。 | 前端；如来自组件 `moment-card/session-summary`，在退回中写明组件。 |
| Console 出现接口错误、`undefined/null/NaN` 渲染相关红错或阻塞警告 | 失败，按 Console 原文记录并区分前端渲染、接口合同或样本缺失。 | 前端 / 接口联调 / 后端按原文归因。 |
| 只在 storage、raw page data、接口原始字段出现，但 UI 已清洗且 Console 无阻塞 | 不判前端失败；记录字段路径、页面和截图 / data 摘要，交 UGC 判断隐私与数据风险。 | UGC / 风控；必要时抄送接口联调。 |
| 接口样本缺失导致产品空态，例如 brief/task/session 不存在或返回空 | 不退前端；记录接口状态、页面空态、Console / Network 摘要。 | 接口联调 / 后端补样本或合同。 |
| 历史文档、清洗正则、TS 类型空值命中 | 不作为运行态失败；需在扫描记录中标注“非上屏 / 非运行态”。 | 无；仅保留审计记录。 |

##### 13.16.88.4 证据记录模板

| 字段 | 记录要求 |
| --- | --- |
| 命令原文 | 受控窗口执行时记录 `status --storage` 和每个单页 relaunch / tap 命令原文；本节当前不执行。 |
| 截图 / data | 每页记录截图路径、page/query、关键 data 摘要；如截图失败，只能写 data 证据，不得写截图通过。 |
| Console | 记录 Console 原文或计数，区分 error / warn / info；阻塞红错必须原文退回。 |
| storage / token | 只记录 API base、profileId、token 后 8 位；完整 token 不得入文档。 |
| 退回码 | UI 外露统一使用 `PR-FE-DATA-BOUNDARY-008S-VISIBLE-LEAK`，并附页面、字段、截图 / data 证据。 |

##### 13.16.88.5 与 13.16.78 的关系

008S 是 13.16.78.3 第 11 项 `数据破界` 的运行态准入补强。静态扫描未发现 WXML 可见文案直出，只能说明当前代码层风险降低；最终仍必须在下一次 PM 明确受控预览窗口中，用真实页面截图、page data 和 Console 摘要确认用户 UI 不外露。008S 未执行前，不得写 008H 全目标通过。

##### 13.16.88.6 当前回报给 PM

`PR-QA-DATA-BOUNDARY-008S-RUNTIME-GATE` 已登记为下一次受控预览窗口的数据破界门禁，不代表通过。当前不触发 DevTools、不跑截图、不要求用户补图。下一次受控窗口需覆盖首页、记录页、账本页、简报页、分享回流、分享图页和个人中心；若 UI 外露门禁关键词，退回前端 `PR-FE-DATA-BOUNDARY-008S-VISIBLE-LEAK`；若仅 raw data / storage 原始字段存在但 UI 已清洗，则交 UGC 判断风险；若是接口样本缺失导致产品空态，退回接口联调 / 后端，不退前端。

#### 13.16.89 `PR-QA-LINK-CLEANUP-008T-INVITE-PREVIEW-MINIMAL-GATE` 2026-06-18 邀请预览极简门禁

记录时间：2026-06-18。PM 静态核查发现 `share-preview` 标题为 `邀请预览`，但 preview tab 仍展示照片高光 / 照片空态、可见范围三栏说明、隐私说明和举报反馈，和用户“邀请预览只需要口令、好友加入状态”的目标冲突。前端已收到 `PR-FE-LINK-CLEANUP-008T-INVITE-PREVIEW-MINIMAL-FIX`。本节只登记待测门禁，不触发 DevTools，不跑截图，不要求用户补图，不写页面通过或上线通过。

##### 13.16.89.1 前端 14.71 回包准入

| 准入项 | 需要证据 | 未满足时结论 |
| --- | --- | --- |
| 修复范围 | 前端计划 14.71 记录 `PR-FE-LINK-CLEANUP-008T-INVITE-PREVIEW-MINIMAL-FIX`，改动文件必须覆盖 `miniprogram/pages/share-preview/index.wxml`、`miniprogram/pages/share-preview/index.ts`、必要时覆盖 `index.less`；如拆分 invite preview / share return 状态，也需说明状态条件。 | 前端 008T 回包前，不解冻、不复测旧版本，不写邀请预览通过。 |
| 静态校验 | 前端回包需提供 `npm.cmd run typecheck`、`npm.cmd run check:encoding`、目标 `git diff --check` 结果。 | 缺任一校验时，只能写待前端补证。 |
| 关键词 / 模块扫描 | 前端或测试只读扫描需覆盖 share-preview WXML / TS / LESS；关键词至少含 `photoHighlights`、`accountingHighlights`、`shareSummary`、`visibleNodeIds`、`filteredNodeIds`、`privacy`、`report`、`shareItems`、`分享给好友`、`分享到群`、`保存海报`、`preview tab`、`status tab`。 | 邀请口令卡仍渲染照片 / 账本 / 隐私 / 举报 / 分享按钮模块，退回前端 008T。 |

##### 13.16.89.2 静态门禁

| 检查项 | 通过标准 | 退回责任 |
| --- | --- | --- |
| preview tab 极简 | `share-preview/index.wxml` 的邀请预览口令卡不得渲染照片墙、照片空态、聚会账本摘要、可见范围 / 隐私保护 / 加入提示三栏、举报反馈、分享给好友 / 分享到群 / 保存海报按钮。 | 任一冗余模块残留，退回前端 `PR-FE-LC008T-P0-INVITE-PREVIEW-NOT-MINIMAL`。 |
| status tab 边界 | status tab 只用于好友加入列表或空态，不承载照片、账本、分享、隐私说明或举报模块。 | status tab 混入分享回流模块，退回前端。 |
| 数据保留边界 | 前端为了分享回流保留照片 / 账本 data 不阻塞，但 invite preview UI 不得外露这些模块。 | data 保留但 UI 未外露不退前端；UI 外露才退回。 |
| 分享回流区分 | 不能把分享回流页“照片 + 账本”需求误判为邀请口令卡需求；应按状态 / tab / query 明确区分。 | 状态不清导致 invite preview 和 share return 混用，退回前端 / UI。 |

##### 13.16.89.3 后续受控复测断言

| 页面 / 操作 | 页面路径 / data keys | 截图路径基线 | 通过标准 | 退回责任 |
| --- | --- | --- | --- | --- |
| 邀请预览 preview tab | `/pages/share-preview/index?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2&briefId=brief-1781787045693-bc8904b9`；data keys=`inviteCode,inviteStatusText,joinedCount,playerCount,activeTab,photoHighlights,accountingHighlights,keyEvents,shareSummary,shareItems,errorText` | `docs/runtime/pr-qa-link-cleanup-008t-invite-preview-minimal-20260618.png` | preview tab 首屏只看口令主体和好友加入状态；不得出现照片高光 / 照片空态、账本摘要、三栏说明、隐私说明、举报反馈、分享给好友 / 分享到群 / 保存海报按钮。 | 冗余模块外露，退回 `PR-FE-LC008T-P0-INVITE-PREVIEW-NOT-MINIMAL`。 |
| 邀请预览 status tab | 同一路径，切换 status tab；data keys=`activeTab,joinStatusPlayers,joinedCount,playerCount,errorText` | `docs/runtime/pr-qa-link-cleanup-008t-invite-preview-status-20260618.png` | status tab 只显示加入列表或空态，不显示照片、账本、分享、隐私、举报模块。 | 模块混入或状态空文案异常，退回前端 / UI。 |
| 分享回流不误判 | 如 PM 受控窗口同时跑 share return，使用 share return query 和 13.16.78 / 13.16.88 规则单独判断照片 + 账本需求 | `shareSummary,photoHighlights,accountingHighlights,keyEvents,permissionState,errorText` | `docs/runtime/pr-qa-link-cleanup-008t-share-return-separate-20260618.png` | 分享回流可以保留照片 + 账本；不得用邀请预览极简标准误退分享回流页。 | 状态混淆时退回前端补状态分流说明。 |

##### 13.16.89.4 与 13.16.78 / 13.16.88 的关系

008T 补强 13.16.78.3 第 8 项 `邀请预览极简`，并与 13.16.88 数据破界共同约束 share-preview 运行态。邀请预览口令卡只验口令主体与好友加入状态；分享回流页照片 + 账本需求仍按 13.16.78 的分享回流 / 分享页规则验收。若前端为了分享回流保留 `photoHighlights/accountingHighlights/keyEvents/shareSummary` data，只要邀请预览 UI 不外露，不退回前端。

##### 13.16.89.5 当前回报给 PM

`PR-QA-LINK-CLEANUP-008T-INVITE-PREVIEW-MINIMAL-GATE` 已登记为邀请预览极简门禁，不代表通过。前端 008T 回包前，测试不复测旧版本，不触发 DevTools；回包后先做 share-preview 静态模块扫描，再等待 PM 明确受控窗口执行 preview tab、status tab 与分享回流分离复测。若邀请口令卡仍露出照片墙 / 照片空态、账本摘要、三栏说明、隐私说明、举报反馈、分享按钮，退回 `PR-FE-LC008T-P0-INVITE-PREVIEW-NOT-MINIMAL`；若只是分享回流保留照片 / 账本 data 且邀请 UI 不外露，不退回。

#### 13.16.90 `PR-QA-LINK-CLEANUP-008U-COMPACT-PREVIEW-BATCH` 2026-06-18 受控预览批测记录

记录时间：2026-06-18。PM 按用户“效率开发，不要重复读取重复测试，完成一个大节点再验证”的口径，要求合并执行一次受控预览批测。本轮只覆盖已静态收口的三个节点：008O 工具箱底部导航一致性、008R 拍第一张页说明 / 授权语义、008T 邀请预览极简化；不扩大到 008H 全矩阵、分享图 PNG 或其他页面。测试侧遵守串行门禁：不并行、不清 Storage、不重启开发者工具、不高频 relaunch；首条命令必须先取 `status --storage`。本轮首条 status 截图 / 状态取证失败，页面矩阵未执行，不代表页面通过或业务失败。

##### 13.16.90.1 本轮定向读取范围

| 文档 / 文件 | 读取章节 / 关键词 | 读取结论 |
| --- | --- | --- |
| 测试计划 | 13.16.84、13.16.87、13.16.89；关键词 `008O`、`008R`、`008T` | 只复核工具箱三项底栏、moment-editor 授权语义、share-preview 邀请极简，不扩大矩阵。 |
| 前端计划 | 14.67、14.70、14.71 | 14.67 已将工具箱旧 `tools-tabbar` 改为与首页一致的 `bottom-nav` 结构；14.70 已拆分 `visibilityOptions` 与 `authorizationOptions/selectedAuthorizations` 并保留 4 项 `consentItems`；14.71 已区分邀请预览与分享回流状态。 |
| UI/UX 计划 | 12.7.39、12.7.42、12.7.43 | 008O 关注三列底栏同构和 active 态；008R 关注可见范围 / 授权用途语义、2 行说明、chip；008T 关注邀请口令卡只保留口令与好友加入状态。 |
| 源码只读关键词 | `bottom-nav`、`bottom-item`、`authorizationOptions`、`selectedAuthorizations`、`consentItems`、`visibilityOptions`、`.moment-caption-preset`、`.moment-editor-submit`、`shareReturnMode`、`.share-chip`、`showJoinStatus` | 仅用于确定后续受控复测 selector / data keys；本轮未修改业务源码。 |

##### 13.16.90.2 首条串行 status 取证结果

| 项目 | 记录 |
| --- | --- |
| 命令原文 | `npm.cmd run wechat:auto -- status --port 9420 --storage --output docs/runtime/wechat-automator-status-9420.png` |
| 结果 | 失败，退出码 1。错误原文：`Error: fail to capture screenshot`。堆栈来自 `miniprogram-automator` 的 `Connection.onMessage`。 |
| 截图路径 | 目标路径为 `docs/runtime/wechat-automator-status-9420.png`，但命令未返回成功，不能作为有效截图证据。 |
| page / query | 未返回。 |
| storage / token | 未返回，未确认 `runtime-api-base`、profile 或 token 后 8 位。 |
| Console / Network | 未返回，不能写 Console `[]` 或 Network 正常。 |
| 判定 | 首条强制 status 未完成，DevTools 预览取证链路阻塞；按 008U 串行规则停止后续 relaunch / tap，不继续扩大点击矩阵。 |

##### 13.16.90.3 未执行页面矩阵与阻塞后准入

| 节点 | 解阻后页面 / 操作 | data keys / selector | 截图路径基线 | 本轮状态 | 通过 / 退回标准 |
| --- | --- | --- | --- | --- | --- |
| 008O 工具箱底部导航 | `/pages/tools/index`；对比首页底栏三入口 | `bottom-nav,bottom-item,activeTab,tools,filteredTools,categoryCards` | `docs/runtime/pr-qa-link-cleanup-008u-008o-tools-tabbar-20260618.png` | 未执行，等待 status 取证恢复。 | 底栏与首页同构或等价一致，仅 `首页 / 工具箱 / 我的` 三入口、三列、active 态一致；若仍四列或旧 `tools-tabbar` 排版残留，退回前端 / UIUX 008O。 |
| 008R 拍第一张说明 / 授权 | `/pages/moment-editor/index?sessionId=session-1781787045680-8e406c&nodeType=opening`；单次 tap 默认文案 chip；保存后观察跳转 | `.moment-caption-preset,.moment-editor-submit`；`caption,captionPresets,visibilityOptions,consentItems,authorizationOptions,selectedAuthorizations,errorText,submitLabel` | `docs/runtime/pr-qa-link-cleanup-008u-008r-moment-editor-20260618.png` | 未执行，等待 status 取证恢复。 | 无 `仅自己`；可见范围与授权用途分组清楚；4 项授权默认全选；说明输入视觉最多 2 行；chip 可填充；保存后进入 `/pages/live-record/index?sessionId=...`。失败退回前端 / UIUX 008R；若保存依赖接口失败，退回接口联调 / 后端。 |
| 008T 纯邀请 preview | `/pages/share-preview/index?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2` | `.share-chip`；`activeTab,inviteCode,inviteStatusText,joinedCount,playerCount,photoHighlights,accountingHighlights,shareSummary,errorText` | `docs/runtime/pr-qa-link-cleanup-008u-008t-invite-preview-20260618.png` | 未执行，等待 status 取证恢复。 | preview tab 只显示口令主体和好友加入状态，不露照片 / 账本 / 隐私三栏 / 举报 / 分享按钮。失败退回 `PR-FE-LC008T-P0-INVITE-PREVIEW-NOT-MINIMAL`。 |
| 008T 加入状态 tab | `/pages/share-preview/index?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2&showJoinStatus=true`；切 status tab | `activeTab,joinStatusPlayers,joinedCount,playerCount,errorText` | `docs/runtime/pr-qa-link-cleanup-008u-008t-join-status-20260618.png` | 未执行，等待 status 取证恢复。 | status tab 只显示好友加入列表 / 空态，不混入分享回流模块。 |
| 008T 分享回流分离 | `/pages/share-preview/index?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2&briefId=brief-1781787045693-bc8904b9` 或 `shareId/mode=return` | `shareReturnMode,shareSummary,photoHighlights,accountingHighlights,keyEvents,errorText` | `docs/runtime/pr-qa-link-cleanup-008u-008t-share-return-20260618.png` | 未执行，等待 status 取证恢复。 | 分享回流应保留照片 + 聚会账本高光，不得被邀请极简逻辑误隐藏；状态混淆退回前端 008T。 |

##### 13.16.90.4 当前结论与下一步责任

| 类别 | 结论 |
| --- | --- |
| 当前结论 | `PR-QA-LINK-CLEANUP-008U-COMPACT-PREVIEW-BATCH` 未完成页面复测；首条强制 status 截图 / 状态取证失败，停止后续矩阵。不得写 008O / 008R / 008T 预览框通过、真机通过、全链路通过或上线通过。 |
| 失败归因 | 目前只归因为 DevTools / automator 截图取证链路阻塞；未取得 page / storage / Console / Network，不能判定业务页通过或失败。 |
| 退回对象 | 先退 PM / 工具链负责人恢复 9420 status 取证能力，或提供可接受的无截图 status 证据路径；恢复后测试按本节 13.16.90.3 串行执行。 |
| 测试侧下一步 | 等 PM 明确恢复后，从同一首条 `status --storage` 重新开始；每次只跑一个页面或一个 tap，记录命令原文、开始 / 结束时间、截图路径、page/query/data、Console、Network、storage token 后 8 位。 |

#### 13.16.91 `PR-QA-LINK-CLEANUP-008U-COMPACT-PREVIEW-BATCH-RESUME` 2026-06-18 替代取证阶段复测记录

记录时间：2026-06-18。PM 恢复 008U 替代取证路径：`status --storage` 不带 `--output` 可读 page / storage / Console，automator 带 `--output` 仍会 `Error: fail to capture screenshot`，右侧预览截图改用 `scripts\capture-wechat-devtools-preview.ps1 -Mode right`。本轮按 PM 收口提醒停止扩大矩阵，只记录已取得证据；不重启开发者工具、不清 Storage、不并行、不写真机通过、上线通过或全链路通过。

##### 13.16.91.1 前置 status / storage

| 项目 | 记录 |
| --- | --- |
| 命令原文 | `npm.cmd run wechat:auto -- status --port 9420 --storage` |
| 结果 | 成功，`ok=true`，当前页 `pages/index/index`，query `{}`。 |
| Console | `[]`。 |
| storage 摘要 | `runtime-api-base=http://127.0.0.1:3221/api/v1`；profile=`user-1781756527691-ff0197` / `聚会记录师成员A`；token 后 8 位 `4ea6c85e`。 |
| 截图策略 | 本轮 automator 不再带 `--output`；截图均由独立右侧预览脚本输出。 |

##### 13.16.91.2 008O 工具箱底栏一致性

| 项目 | 记录 |
| --- | --- |
| 命令原文 | `npm.cmd run wechat:auto -- relaunch --port 9420 --path /pages/tools/index --wait 2500 --data activeTab,activeCategory,activeCategoryName,tools,allTools,filteredTools,popularTools,categoryCards,toolCategories` |
| 页面 / query | `pages/tools/index`，query `{}`。 |
| page data 摘要 | `activeCategory=all`，`activeCategoryName=全部`，`allTools=8`，`filteredTools=5`，`popularTools=4`，`categoryCards=3`；列表含 `二维码生成 / 图片压缩 / JSON 格式化 / 房贷计算 / 汇率换算` 等。 |
| Console / storage | Console `[]`；storage 沿用前置 memberA，API base `http://127.0.0.1:3221/api/v1`，token 后 8 位 `4ea6c85e`。 |
| 截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008u-008o-tools-tabbar-20260618.png -Mode right` |
| 截图路径 | `docs/runtime/pr-qa-link-cleanup-008u-008o-tools-tabbar-20260618.png`，脚本返回 `width=410,height=1032`。 |
| 判定 | 008O 工具箱专项预览框阶段通过：截图中底栏为 `首页 / 工具箱 / 我的` 三入口，`工具箱` active，未见四列旧 `tools-tabbar` 排版。右侧预览图左缘略裁切，后续 UIUX 如需像素级对齐可另补完整窗口图；本轮不写 UIUX 全量通过。 |
| 退回对象 | 暂无业务退回；若后续完整截图发现四列 / 旧 tabbar 残留，退回前端 / UIUX 008O。 |

##### 13.16.91.3 008R 拍第一张说明 / 授权语义

| 项目 | 记录 |
| --- | --- |
| 解析失败命令 | `npm.cmd run wechat:auto -- relaunch --port 9420 --path /pages/moment-editor/index?sessionId=session-1781756527692-d277f0\&nodeType=opening --wait 2500 --data caption,captionPresets,visibilityOptions,consentItems,authorizationOptions,selectedAuthorizations,errorText,submitLabel,sessionId,nodeType` 被 PowerShell / cmd 对 `&` 解析打断，出现 `nodeType=opening: The term 'nodeType=opening' is not recognized...`；该错误为命令包装错误，不判业务失败。 |
| npm 包装二次解析 | `npm.cmd run wechat:auto -- relaunch --port 9420 --path "/pages/moment-editor/index?sessionId=session-1781756527692-d277f0&nodeType=opening" --wait 2500 --data caption,captionPresets,visibilityOptions,consentItems,authorizationOptions,selectedAuthorizations,errorText,submitLabel,sessionId,nodeType` 实际只传入 `sessionId` 后被 cmd 拆分，automator 返回页面成功但进程退出码 1；后续改用 `node scripts/wechat-devtools-automator.js` 直调，避免 query 中 `&` 被二次解析。 |
| 有效 relaunch 命令 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/moment-editor/index?sessionId=session-1781756527692-d277f0&nodeType=opening" --wait 2500 --storage --data caption,captionPresets,visibilityOptions,consentItems,authorizationOptions,selectedAuthorizations,errorText,submitLabel,sessionId,nodeType` |
| 页面 / query | `pages/moment-editor/index`，query `sessionId=session-1781756527692-d277f0,nodeType=opening`。 |
| page data 摘要 | `nodeType=opening`，`submitLabel=保存照片`；`visibilityOptions=3`，分别为 `本聚会可见 / 允许分享 / 指定成员`；`consentItems=4` 且全部 `checked=true`；`authorizationOptions=4` 且全部 `checked=true`；`selectedAuthorizations=[session,brief,share,ranking]`；`captionPresets=4`；`errorText` 未返回有效错误。 |
| chip 命令 | `node scripts/wechat-devtools-automator.js tap --port 9420 --selector .moment-caption-preset --wait 1200 --data caption,captionPresets,visibilityOptions,consentItems,authorizationOptions,selectedAuthorizations,errorText,submitLabel,sessionId,nodeType` |
| chip 结果 | tap 后 `caption=今晚第一张合影`，4 项授权仍默认全选，Console `[]`。 |
| 截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008u-008r-moment-editor-opening-20260618.png -Mode right` |
| 截图路径 | `docs/runtime/pr-qa-link-cleanup-008u-008r-moment-editor-opening-20260618.png`；另有早先 sessionId-only 截图 `docs/runtime/pr-qa-link-cleanup-008u-008r-moment-editor-20260618.png`，仅作命令包装错误前的旁证。 |
| Console / storage | 有效 relaunch 与 chip 均 Console `[]`；API base `http://127.0.0.1:3221/api/v1`，profile memberA，token 后 8 位 `4ea6c85e`。 |
| 判定 | 008R 授权 / 说明 / chip 专项预览框阶段通过：未见 `仅自己`，可见范围与授权用途分组可由 data 区分，4 项授权默认全选，默认文案 chip 可填充。 |
| 未覆盖项 | 本轮未执行真实拍照 / 相册选择 / 保存照片后跳转，因为 PM 要求按现有证据收口且不扩大矩阵；`保存成功进入 live-record` 仍待后续有真实照片上传准入时复核。不得写 008R 全链路通过。 |

##### 13.16.91.4 008T 邀请预览极简 / 加入状态 / 分享回流分离

| 子项 | 命令 / 证据 | data / Console 摘要 | 截图 | 判定 |
| --- | --- | --- | --- | --- |
| 纯邀请 preview | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/share-preview/index?sessionId=session-1781756527692-d277f0&inviteCode=E52MK5" --wait 2500 --storage --data activeTab,inviteCode,inviteStatusText,joinedCount,playerCount,joinStatusPlayers,photoHighlights,accountingHighlights,keyEvents,shareSummary,shareReturnMode,errorText` | `shareReturnMode=false`，`inviteCode=E52MK5`，`inviteStatusText=3/3 位好友已加入`，`joinedCount=3`，`playerCount=3`，`joinStatusPlayers=3`，`photoHighlights=[]`，`accountingHighlights=[]`，`keyEvents=[]`，`errorText=""`，Console `[]`，token 后 8 位 `4ea6c85e`。 | `docs/runtime/pr-qa-link-cleanup-008u-008t-invite-preview-20260618.png`，由 `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008u-008t-invite-preview-20260618.png -Mode right` 生成。 | 纯邀请 preview 预览框阶段通过：截图只见口令主体和加入状态，未见照片 / 账本 / 隐私三栏 / 举报 / 分享按钮。 |
| 加入状态 tab | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/share-preview/index?sessionId=session-1781756527692-d277f0&inviteCode=E52MK5&showJoinStatus=true" --wait 2500 --storage --data showJoinStatus,inviteCode,inviteStatusText,joinedCount,playerCount,joinStatusPlayers,photoHighlights,accountingHighlights,keyEvents,shareSummary,shareReturnMode,errorText` 后，因 query 未直接切换 data，又执行 `node scripts/wechat-devtools-automator.js tap --port 9420 --selector ".share-chip:nth-child(2)" --wait 1200 --data showJoinStatus,inviteCode,inviteStatusText,joinedCount,playerCount,joinStatusPlayers,photoHighlights,accountingHighlights,keyEvents,shareSummary,shareReturnMode,errorText` | tap 后 `showJoinStatus=true`，`joinStatusPlayers=3`，`photoHighlights=[]`，`accountingHighlights=[]`，`keyEvents=[]`，`shareReturnMode=false`，Console `[]`。 | `docs/runtime/pr-qa-link-cleanup-008u-008t-join-status-20260618.png`，由 `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008u-008t-join-status-20260618.png -Mode right` 生成。 | 加入状态 tab 预览框阶段通过：截图只见好友加入列表 / 成员状态，未混入照片、账本或分享回流模块。 |
| 分享回流分离 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/share-preview/index?sessionId=session-1781756527692-d277f0&inviteCode=E52MK5&briefId=brief-1781756527712-95eff999" --wait 3000 --storage --data showJoinStatus,shareReturnMode,inviteCode,inviteStatusText,joinedCount,playerCount,photoHighlights,accountingHighlights,keyEvents,shareSummary,errorText,briefId,previewLoadFailed` | `shareReturnMode=true`，`briefId=brief-1781756527712-95eff999`，`photoHighlights=2`，但两项均 `imageBroken=true`；`accountingHighlights=4`，`keyEvents=2`，`previewLoadFailed=false`，`errorText=""`，Console `[]`。 | PM 收口提醒到达后停止继续跑新命令，未补分享回流右侧预览截图。 | 分享回流分离 data 层通过：带 `briefId` 时照片 / 账本 / 事件没有被邀请极简逻辑隐藏；但照片项为 `imageBroken=true`，且缺右侧预览截图，本项只能写 data 证据通过 / 视觉待补，不得写分享回流视觉通过。照片破图继续按既有照片渲染问题退回前端 / UIUX / 接口样本排查。 |

##### 13.16.91.5 当前收口结论

| 节点 | 结论 |
| --- | --- |
| 008O 工具箱底栏 | 工具箱专项预览框阶段通过；不代表 UIUX 全量像素通过。 |
| 008R 拍第一张说明 / 授权 | 授权语义、4 项默认全选、无 `仅自己`、chip 填充专项预览框阶段通过；真实保存照片后回流未测，仍待有上传准入后补证。 |
| 008T 邀请预览 | 纯邀请 preview 与加入状态 tab 预览框阶段通过；分享回流 data 层确认未被误隐藏，但照片 `imageBroken=true` 且未补右侧预览截图，视觉仍待补。 |
| 工具链 | automator `--output` 截图仍失败，后续同类受控预览应继续使用 `wechat:auto` 取 data + 独立右侧预览脚本截图；带 query 的页面建议使用 `node scripts/wechat-devtools-automator.js` 直调，避免 `npm.cmd` / cmd 对 `&` 二次解析。 |
| 不得写的结论 | 不写真机通过、上线通过、全链路通过；本节只是 008U 已覆盖子项的阶段复测记录。 |

#### 13.16.92 `PR-QA-LINK-CLEANUP-008V-SHARE-RETURN-PHOTO-RETEST` 2026-06-18 分享回流照片单点复测等待门禁

记录时间：2026-06-18。按 PM 派发，008V 当前状态为 `blocked`，等待前端 `PR-FE-LINK-CLEANUP-008V-SHARE-RETURN-PHOTO-BROKEN` 与接口联调 `PR-INT-LINK-CLEANUP-008V-SHARE-RETURN-PHOTO-SAMPLE` 回包。本节只登记等待项 / 门禁，不触发 DevTools，不跑 `status/relaunch/tap`，不截图，不重复 008O 工具箱、008R 拍第一张授权语义、008T 纯邀请 / 加入状态矩阵。

##### 13.16.92.1 读取范围与已知基线

| 来源 | 读取项 | 结论 |
| --- | --- | --- |
| `AGENTS.md` | 进度节点修改边界、预览框验收、协作前置核查 | 测试只改测试计划和证据；依赖前端 / 接口回包时只能写待复测 / 阻塞；不得把预览框结论写成真机或上线通过。 |
| 队列 008V 行 | `PR-QA-LINK-CLEANUP-008V-SHARE-RETURN-PHOTO-RETEST` | 测试等待前端 008V 和接口联调 008V 回包后，只复测分享回流照片视觉，不重复 008O / 008R / 纯邀请矩阵。 |
| 总进度 008U / 008V 行 | 008U 已收口，008V 已派发 | 008U 13.16.91 已确认：分享回流 data 层 `shareReturnMode=true`、`photoHighlights=2`、`accountingHighlights=4`、`keyEvents=2`、Console `[]`，但两项照片均 `imageBroken=true` 且缺右侧预览截图。 |
| 测试计划 13.16.91 | 008U 阶段复测记录 | 008V 仅补分享回流照片破图和视觉证据缺口；不再重复跑工具箱底栏、拍第一张授权、纯邀请或加入状态。 |

##### 13.16.92.2 回包准入

| 角色 | 必需回包证据 | 未满足时结论 |
| --- | --- | --- |
| 前端 008V | 前端计划记录、改动文件、责任判断；说明是否修复 `share-preview` 分享回流照片渲染 / URL 归一化 / 本地路径消费 / 占位容错；提供 `typecheck`、`check:encoding`、目标 diff check。 | 缺前端回包前，测试保持 blocked，不复测旧版本。 |
| 接口联调 008V | 只读核查 `brief-1781756527712-95eff999` 的 `photoHighlights` 图片 URL / 本地路径是否可读；必要时提供可展示样本、脱敏 API 摘要、可复跑 query、样本 ID、cleanup / 残留说明。 | 缺接口核查前，如仍有破图，无法区分前端消费问题或样本 URL 问题，只能写待联调。 |
| PM 复测窗口 | 明确允许测试使用 DevTools 9420 替代证据链；若仍使用 automator，则继续不带 `--output` 取 data，截图用 `scripts\capture-wechat-devtools-preview.ps1 -Mode right`。 | 未明确复测窗口前，不启动 DevTools，不补截图。 |

##### 13.16.92.3 解阻后单点复测矩阵

| 用例 | 命令基线 | data keys | 截图路径基线 | 通过标准 | 退回责任 |
| --- | --- | --- | --- | --- | --- |
| 前置状态 | `npm.cmd run wechat:auto -- status --port 9420 --storage` | `page,query,storage,console` | 不使用 automator `--output`；必要时 `docs/runtime/pr-qa-link-cleanup-008v-status-right-preview-20260618.png` | Console 无阻塞红错；`runtime-api-base`、profile、token 后 8 位可记录；完整 token 不入文档。 | status 失败、Connection closed、黑屏 / 白屏、Storage 不匹配，退 PM / 工具链；不判业务失败。 |
| 分享回流照片单点 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/share-preview/index?sessionId=session-1781756527692-d277f0&inviteCode=E52MK5&briefId=brief-1781756527712-95eff999" --wait 3000 --storage --data showJoinStatus,shareReturnMode,inviteCode,inviteStatusText,joinedCount,playerCount,photoHighlights,accountingHighlights,keyEvents,shareSummary,errorText,briefId,previewLoadFailed` | `shareReturnMode,briefId,photoHighlights,accountingHighlights,keyEvents,shareSummary,errorText,previewLoadFailed` | `docs/runtime/pr-qa-link-cleanup-008v-share-return-photo-20260618.png`，由 `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008v-share-return-photo-20260618.png -Mode right` 生成。 | `shareReturnMode=true`；照片至少 1 张在右侧预览中非白、非破图、非空白洞；`photoHighlights` 不再 `imageBroken=true`；账本高光和事件仍展示；UI 无 `raw/debug/internal`、接口错误、内部样本名、旧品牌主文案；Console 无阻塞红错。 | 图片 URL / 样本不可读、接口 404/500 或样本缺失，退接口联调 / 后端；data 正常但 UI 仍白图 / 破图 / 不渲染，退前端 008V；视觉短屏或排版问题，转 UIUX 008V。 |

##### 13.16.92.4 本轮不重复项与禁止结论

| 项目 | 规则 |
| --- | --- |
| 不重复项 | 不再复测 008O 工具箱底栏、008R 拍第一张授权语义 / chip、008T 纯邀请 preview、008T 加入状态 tab。以上以 13.16.91 为阶段基线。 |
| 不扩大范围 | 不测分享保存图 PNG、相册、账本、首页、工具箱详情、真实拍照上传或真机保存。 |
| 禁止结论 | 不写真机通过、上线通过、全链路通过；即使 008V 单点通过，也只能写“分享回流照片单点预览框阶段通过 / 待 UIUX 视觉接收”。 |
| 当前状态 | `blocked / 待前端 008V 与接口联调 008V 回包`。本节不包含新截图、新 DevTools 命令或页面通过证据。 |

#### 13.16.93 `PR-QA-LINK-CLEANUP-008V-SHARE-RETURN-PHOTO-RETEST` 2026-06-18 008g 非白图单点复测记录

记录时间：2026-06-18。PM 解阻 008V 后要求改用 008g 非白图样本复测，不再使用旧 008 纯白 WebP 样本证明视觉。本轮只执行分享回流单点，不重复 008O 工具箱底栏、008R 拍第一张授权语义、008T 纯邀请 / 加入状态矩阵；未清 Storage，未重启开发者工具，未触发 automator `--output` 截图。

##### 13.16.93.1 前置状态

| 项目 | 记录 |
| --- | --- |
| 命令原文 | `node scripts/wechat-devtools-automator.js status --port 9420 --storage` |
| 结果 | 成功，`ok=true`。执行前当前页仍为旧 008 分享回流：`pages/share-preview/index?sessionId=session-1781756527692-d277f0&inviteCode=E52MK5&briefId=brief-1781756527712-95eff999`。 |
| Console | `[]`。 |
| storage 摘要 | `runtime-api-base=http://127.0.0.1:3221/api/v1`；profile=`user-1781756527691-ff0197` / `聚会记录师成员A`；token 后 8 位 `4ea6c85e`。完整 token 未写入。 |
| 风险备注 | 本轮 PM 指定使用 008g 非白图样本，但当前 DevTools storage 仍为旧 008 memberA token / profile，token 后 8 位 `4ea6c85e`；接口联调 3.42 记录 008g memberA token 后 8 位应为 `b8615971`。测试未清 Storage、未注入 008g token，按 PM“不清 Storage、不重启”要求原样记录。 |

##### 13.16.93.2 008g 分享回流页面复测

| 项目 | 记录 |
| --- | --- |
| 命令原文 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/share-preview/index?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2&briefId=brief-1781787045693-bc8904b9" --wait 3000 --storage --data showJoinStatus,shareReturnMode,inviteCode,inviteStatusText,joinedCount,playerCount,photoHighlights,accountingHighlights,keyEvents,shareSummary,errorText,briefId,previewLoadFailed` |
| 页面 / query | `pages/share-preview/index`，query `sessionId=session-1781787045680-8e406c,inviteCode=J2BEL2,briefId=brief-1781787045693-bc8904b9`。 |
| page data 摘要 | `shareReturnMode=true`，`inviteCode=J2BEL2`，`inviteStatusText=3/3 位好友已加入`，`joinedCount=3`，`playerCount=3`，`briefId=brief-1781787045693-bc8904b9`，`previewLoadFailed=false`，`errorText=""`；但 `photoHighlights=[]`，`accountingHighlights=[]`，`keyEvents=[]`，`shareSummary=这场聚会的可分享照片和账本高光会在这里汇总。`。 |
| Console / storage | Console `[]`；storage 仍为 `runtime-api-base=http://127.0.0.1:3221/api/v1`，profile memberA `user-1781756527691-ff0197`，token 后 8 位 `4ea6c85e`。 |
| 截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008v-share-return-photo-008g-20260618.png -Mode right` |
| 截图路径 | `docs/runtime/pr-qa-link-cleanup-008v-share-return-photo-008g-20260618.png`，脚本返回 `width=410,height=1032`。 |
| 右侧预览摘要 | 预览仍为邀请预览 / 回流空态：出现“暂无可展示照片，先去记录一张聚会照片。”等空态内容；未看到非白照片、账本高光或事件卡片。未见 raw/debug/internal 文案或旧品牌主文案。 |

##### 13.16.93.3 判定与阻塞对象

| 检查项 | 结果 | 判定 |
| --- | --- | --- |
| 照片非白非破 | 未能验证。page data `photoHighlights=[]`，右侧预览无照片。 | 当前不能判前端照片破图，也不能判 008g 样本视觉失败；根因先按 storage 与 008g 样本不匹配处理。 |
| `photoHighlights` 不再 `imageBroken=true` | 未能验证。当前不是 `imageBroken=false`，而是照片数组为空。 | 不能写前端 008V 修复通过，也不能退前端破图。 |
| 账本高光 / 事件仍展示 | 未能验证。`accountingHighlights=[]`，`keyEvents=[]`，右侧预览无账本 / 事件高光。 | 不能写分享回流照片单点通过。 |
| UI 无 raw/debug/internal / 旧品牌主文案 | 当前截图未见。 | 该项未发现问题，但不抵消照片 / 账本 / 事件为空。 |
| Console | `[]`。 | 无阻塞红错。 |

当前结论：`PR-QA-LINK-CLEANUP-008V-SHARE-RETURN-PHOTO-RETEST` 阻塞，阻塞原因为当前 DevTools storage 与 008g 样本成员态不匹配。已执行环境 token 后 8 位为 `4ea6c85e`，目标 008g memberA token 后 8 位应为 `b8615971`；在未切换 / 注入 008g 安全登录态前，`photoHighlights=[] / accountingHighlights=[] / keyEvents=[]` 不能作为页面通过、前端破图失败或 008g 样本视觉失败的依据。右侧截图 `docs/runtime/pr-qa-link-cleanup-008v-share-return-photo-008g-20260618.png` 只作为阻塞旁证，不写视觉结论。

下一步责任：接口联调或前端需提供安全的 008g 登录态切换 / 私密 token 使用方式，或接口联调用当前 storage 用户 `user-1781756527691-ff0197` 补一个非白图样本；PM 明确后测试再按 13.16.92.3 单点复测。测试侧不得自行改 storage、不得清 Storage、不得继续尝试其他页面。

##### 13.16.93.4 禁止结论

本轮不写真机通过、上线通过、全链路通过、UIUX 通过，也不把旧 008 的纯白图 URL 可读当作真实照片视觉通过。008O / 008R / 008T 纯邀请 / 加入状态仍沿用 13.16.91，不重复复测。

#### 13.16.94 `PR-QA-LINK-CLEANUP-008X-008Y-SINGLE-RETEST` 2026-06-19 首图封面 / 审核文案单点复核

记录时间：2026-06-19。PM 派发 008X / 008Y 单点复核：不通读全文档，不扩大矩阵，不重复 008O / 008R / 008T / 008W。本轮只读取前端计划 14.74、派发队列 008X / 008Y 行、接口联调证据 `docs/runtime/pr-int-link-cleanup-PRCS-20260619-008x-first-photo-cover-contract.md`，并复核首页最近相册、相册列表、简报 / 摘要组件中的首图封面与审核 / 待补图类用户文案。

##### 13.16.94.1 读取范围与准入结论

| 来源 | 读取项 | 结论 |
| --- | --- | --- |
| 前端计划 14.74 | `PR-FE-LINK-CLEANUP-008X/008Y` | 前端自报已将首页最近相册 / 相册列表封面改为优先 brief timeline 中 `createdAt/updatedAt` 最早真实照片，同时间优先 `opening`，再 fallback `coverPhotoUrl`；普通用户 UI 不再展示审核 / 待审 / 待补图 / 审核通过后展示等阻断口径。 |
| 队列 008X / 008Y | `PR-FE-LINK-CLEANUP-008X-FIRST-PHOTO-COVER-FIX`、`PR-FE-LINK-CLEANUP-008Y-REMOVE-REVIEW-USER-FACING-FIX` | 008X 要证明首页最近相册和相册列表严格优先上传第一张照片；008Y 要证明旧审核字段不阻塞图片直显 / 相册 / 简报 / 分享链路。 |
| 接口合同 008X | `pr-int-link-cleanup-PRCS-20260619-008x-first-photo-cover-contract.md` | 008g 是有效非白视觉样本，但曾因 brief fallback 不能证明严格首图；前端 14.74 修复后需以页面 data / 截图复核。 |

##### 13.16.94.2 静态关键词扫描

| 项目 | 记录 |
| --- | --- |
| 命令原文 | `rg -n "审核|待审|待审核|待补图|待补充图片|继续补图|审核通过后展示|审核通过|待整理" miniprogram/pages/index miniprogram/pages/album miniprogram/pages/session-brief miniprogram/components/moment-card miniprogram/components/session-moment-summary` |
| 结果摘要 | 目标前台源码未命中用户可见 `审核 / 待审 / 待审核 / 待补图 / 待补充图片 / 继续补图 / 审核通过后展示 / 审核通过`。命中 1 处相邻口径：`miniprogram/pages/session-brief/index.wxml:74` 的 `待整理 / 已记录 / 已完成并存`。 |
| 判定 | 008Y 明确禁止词静态扫描通过；`待整理` 不等同于图片审核 / 待补图阻断，但属于相邻旧状态口径，建议 PM / 前端确认是否继续纳入下一轮文案净化。 |
| 兼容字段扫描 | `rg -n "pendingMediaCount|reviewStatus|secondaryReviewStatus|findFirstBriefPhoto|coverPhotoUrl|coverImageUrl|opening|createdAt|updatedAt" miniprogram/pages/index/index.ts miniprogram/pages/album/index.ts miniprogram/pages/session-brief/index.ts miniprogram/components/moment-card miniprogram/components/session-moment-summary` |
| 兼容字段结论 | `pendingMediaCount / reviewStatus / secondaryReviewStatus` 仍作为 TS 类型或 data 字段残留，符合 14.74 允许边界；首页与相册 `findFirstBriefPhoto` 均按 timeline 时间排序，同时间优先 `opening`，最后才 fallback `coverPhotoUrl`。 |

##### 13.16.94.3 DevTools storage / Console 前置

| 项目 | 记录 |
| --- | --- |
| 命令摘要 | 通过 `miniprogram-automator` 只读当前页与 storage 摘要；未清 Storage，未重启 DevTools，未输出完整 token。 |
| 结果 | DevTools 9420 可连接；执行前当前页 `pages/me/index`；storage `runtime-api-base=http://127.0.0.1:3221/api/v1`，profileId=`user-1781787045679-f3f2eb`，profileName=`聚会记录师成员A`，token 后 8 位 `b8615971`，tokenPresent=`true`。 |
| 判定 | 使用 008g memberA 非白图样本继续单点复核；若后续测试需要恢复旧 008 storage，须只记录旧 token 尾号，不得写完整 token。 |

##### 13.16.94.4 首页最近相册复核

| 项目 | 记录 |
| --- | --- |
| 命令原文 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path /pages/index/index --wait 3000 --data home,loading,lastLoadedAt` |
| page / query | `pages/index/index`，query `{}`。 |
| page data 摘要 | `loading=false`；`home.recentTools[0].id=brief-1781787045693-bc8904b9`，`name=周末聚会记录`，`badgeText=分享图`，`route=/pages/session-brief/index?briefId=brief-1781787045693-bc8904b9`，`imageUrl=http://127.0.0.1:3221/uploads/moments/session-1781787045680-8e406c/1781787045682-party-opening-c85a76.webp`。 |
| Console | `[]`。 |
| 截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008x-008y-home-recent-album-20260619.png -Mode right` |
| 截图路径 | `docs/runtime/pr-qa-link-cleanup-008x-008y-home-recent-album-20260619.png`，脚本返回 `width=410,height=1032`。 |
| 判定 | 008X 首页最近相册单点预览框阶段通过：data 与截图均显示最近相册封面为 008g `opening` 首图，未使用旧白图或空态默认；截图未见审核 / 待审 / 待补图 / 审核通过后展示口径。 |

##### 13.16.94.5 相册列表复核

| 项目 | 记录 |
| --- | --- |
| 命令原文 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/album/index?mode=host" --wait 3000 --data items,loading,mode,pageTitle,emptyText` |
| page / query | `pages/album/index`，query `mode=host`。 |
| page data 摘要 | `pageTitle=我创建的聚会`，`loading=false`；`items[0].briefId=brief-1781787045693-bc8904b9`，`sessionId=session-1781787045680-8e406c`，`coverUrl=http://127.0.0.1:3221/uploads/moments/session-1781787045680-8e406c/1781787045682-party-opening-c85a76.webp`，`meta=06-18 20:50 · 周末聚会记录 · 可分享`，`statusText=分享图已生成`。 |
| Console | `[]`。 |
| 截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008x-008y-album-list-20260619.png -Mode right` |
| 截图路径 | `docs/runtime/pr-qa-link-cleanup-008x-008y-album-list-20260619.png`，脚本返回 `width=410,height=1032`。 |
| 判定 | 008X 相册列表单点预览框阶段通过：data 与截图均显示封面为 008g `opening` 首图；未见审核 / 待审 / 待补图 / 审核通过后展示口径。 |

##### 13.16.94.6 简报 / 摘要组件文案复核

| 项目 | 记录 |
| --- | --- |
| 命令原文 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/session-brief/index?sessionId=session-1781787045680-8e406c&briefId=brief-1781787045693-bc8904b9" --wait 3000 --data sessionName,photoHighlights,accountingHighlights,keyEvents,pendingMediaCount,stats,cards,brief,errorText,loading` |
| page / query | `pages/session-brief/index`，query `sessionId=session-1781787045680-8e406c,briefId=brief-1781787045693-bc8904b9`。 |
| page data 摘要 | `loading=false`，`errorText=""`，`pendingMediaCount=0`，`stats=[开场 0, 照片 2, 账本 4]`；`accountingHighlights` 含 `待处理记录 1条 / 暂无完成记录 / 加酒记录 1条 / 暂无已消记录`。 |
| Console | `[]`。 |
| 截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008x-008y-session-brief-20260619.png -Mode right` |
| 截图路径 | `docs/runtime/pr-qa-link-cleanup-008x-008y-session-brief-20260619.png`，脚本返回 `width=410,height=1032`。 |
| 判定 | 008Y 简报 / 摘要组件单点预览框阶段通过：截图显示 008g 非白照片卡和账本统计，未见审核 / 待审 / 待补图 / 继续补图 / 审核通过后展示口径；`待处理记录` 属聚会账本状态，不按图片审核阻断口径判失败。静态发现的 `待整理` 相邻文案仍建议 PM / 前端确认是否纳入后续净化。 |

##### 13.16.94.7 当前收口结论

| 节点 | 结论 |
| --- | --- |
| 008X 首图封面 | 首页最近相册、相册列表使用 008g `opening` 首图 URL，单点预览框阶段通过；不代表所有样本 / 真机 / 上线通过。 |
| 008Y 审核 / 待补图文案 | 目标明确禁词静态扫描未命中；首页、相册、简报截图未见审核 / 待补图阻断口径，单点预览框阶段通过。`session-brief` 的 `待整理` 相邻文案待 PM / 前端确认是否继续清理。 |
| 未验证项 | 未测分享保存 PNG、真机保存、其他账号视角、无图默认封面、所有相册模式、所有摘要组件实例。 |
| 禁止结论 | 不写真机通过、上线通过、全链路通过；不把本节写成 008H 全目标通过。 |

#### 13.16.95 `PR-QA-LINK-CLEANUP-008Z-BRIEF-SHARE-COPY-RECHECK` 2026-06-19 简报分享入口文案极小复核

记录时间：2026-06-19。PM 追加 008Z 极小复核：前端 14.75 已将 `miniprogram/pages/session-brief/index.wxml` 分享入口账本小卡文案从 `待整理 / 已记录 / 已完成并存` 改为 `欠酒加酒一页看清`。本轮不重复 008X / 008Y 页面矩阵，只静态扫描目标 WXML，并在 DevTools 稳定时重开 008g 简报页取右侧预览旁证；不清 Storage、不重启 DevTools、不泄露完整 token。

##### 13.16.95.1 前端 14.75 读取与静态扫描

| 项目 | 记录 |
| --- | --- |
| 读取范围 | 只读前端计划 14.75。14.75 记录本轮只改 `miniprogram/pages/session-brief/index.wxml`，将账本小卡说明从 `待整理 / 已记录 / 已完成并存` 改为 `欠酒加酒一页看清`，不改照片 / 聚会账本 / 关键事件 data 结构，不删除 `.brief-share-flow-entry`。 |
| 静态扫描命令 | `rg -n "待整理|已记录|已完成|并存|工程化解释|欠酒加酒一页看清" miniprogram/pages/session-brief/index.wxml` |
| 静态扫描结果 | 仅命中 `miniprogram/pages/session-brief/index.wxml:74: <text>欠酒加酒一页看清</text>`。旧文案 `待整理 / 已记录 / 已完成 / 并存 / 工程化解释` 在该 WXML 未命中。 |
| 静态判定 | 008Z 目标 WXML 静态通过：旧工程化解释口径已移除，新文案存在。 |

##### 13.16.95.2 008g 简报页运行态旁证

| 项目 | 记录 |
| --- | --- |
| relaunch 命令 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/session-brief/index?sessionId=session-1781787045680-8e406c&briefId=brief-1781787045693-bc8904b9" --wait 3000 --storage --data briefTitle,stats,accountingHighlights,shareTask,errorText,loading` |
| page / query | `pages/session-brief/index`，query `sessionId=session-1781787045680-8e406c,briefId=brief-1781787045693-bc8904b9`。 |
| page data 摘要 | `briefTitle=聚会简报`，`loading=false`，`errorText=""`，`stats=[开场 0, 照片 2, 账本 4]`；`accountingHighlights` 含 `待处理记录 1条 / 暂无完成记录 / 加酒记录 1条 / 暂无已消记录`，这是聚会账本状态，不是 008Z 分享入口工程化解释。 |
| Console / storage | Console `[]`；storage `runtime-api-base=http://127.0.0.1:3221/api/v1`，profileId=`user-1781787045679-f3f2eb`，token 后 8 位 `b8615971`。完整 token 未写入测试计划。 |
| 首张截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008z-brief-share-copy-20260619.png -Mode right` |
| 首张截图路径 | `docs/runtime/pr-qa-link-cleanup-008z-brief-share-copy-20260619.png`，脚本返回 `width=410,height=1032`。截图显示 008g 简报页上半部分和非白照片卡，未露出分享入口账本小卡。 |
| 滚动命令 | `pageScrollTo(scrollTop=760)` 通过 automator 返回 `ok=true`，当前页仍为 008g 简报页。 |
| 滚动后截图 | `docs/runtime/pr-qa-link-cleanup-008z-brief-share-copy-scrolled-20260619.png`，脚本返回 `width=410,height=1032`；右侧预览仍停留在简报上半部分，未露出分享入口小卡。 |
| 运行态判定 | DevTools 页面可打开、Console 无阻塞红错，截图可作为简报页稳定旁证；但本轮右侧预览未成功露出分享入口小卡，不能写“运行态可见新文案已通过”。分享入口新文案只写静态通过，运行态可视补证待后续更可靠滚动 / 定位能力或人工预览。 |

##### 13.16.95.3 当前结论

| 项目 | 结论 |
| --- | --- |
| 008Z 静态复核 | 通过：`session-brief/index.wxml` 中旧 `待整理 / 已记录 / 已完成 / 并存 / 工程化解释` 未命中，新文案 `欠酒加酒一页看清` 存在。 |
| 008Z 运行态可见性 | 待补证：简报页可打开、Console `[]`、截图正常，但未截到分享入口小卡区域，不能写运行态新文案可见通过。 |
| 禁止结论 | 不写真机通过、上线通过、全链路通过、UIUX 通过；不扩大到 008X / 008Y / 分享图 PNG 或其他页面。 |

#### 13.16.96 `PR-QA-LINK-CLEANUP-008AA-LEDGER-BRIEF-FIRSTPHOTO-RETEST` 2026-06-19 账本 / 简报大图 / 首照回流弱证据单点复核

记录时间：2026-06-19。PM 派发 008AA 弱证据单点复核。本轮只读 `docs/runtime/pm-objective-coverage-20260619.md` Coverage Matrix 中账本欠酒 / 加酒、简报图片大图返回、拍第一张保存回流、说明 2 行 / 默认文案相关项，以及测试计划 13.16.91、13.16.94、13.16.95 作为已通过 / 待补边界。不重复 008X / 008Y / 008Z、008O / 008R / 008T / 008W；不清 Storage、不重启 DevTools、不泄露完整 token、不写真机 / 上线 / 全链路通过。

##### 13.16.96.1 读取边界与当前 storage

| 项目 | 记录 |
| --- | --- |
| PM 覆盖矩阵读取 | `Record / ledger page shows debt and add-drink data, editable by host` 标为 `Source aligned / runtime evidence weak`；`Remove "save key event" button` 标为 source aligned；`My created party brief images can be tapped for big preview and tap back` 标为 source aligned / click evidence missing。 |
| 既有测试边界 | 13.16.91：拍第一张授权语义 / chip 已通过但真实保存照片后回流未测；13.16.94：008g 首图和审核文案单点通过；13.16.95：简报分享入口新文案静态通过、运行态可见性待补。 |
| storage 摘要 | 本轮沿用 008g memberA，`runtime-api-base=http://127.0.0.1:3221/api/v1`，profileId=`user-1781787045679-f3f2eb`，token 后 8 位 `b8615971`。完整 token 未写入。 |

##### 13.16.96.2 记录 / 账本页复核

| 子项 | 命令 / 证据 | data / Console 摘要 | 截图 | 判定 |
| --- | --- | --- | --- | --- |
| 独立账本页 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/ledger/index?sessionId=session-1781787045680-8e406c&role=judge" --wait 3000 --data sessionId,sessionName,stats,players,ledgerEditable,ledgerEventCount,isJudge,errorText,loading,hasSession` | page=`pages/ledger/index`，query `sessionId=session-1781787045680-8e406c,role=judge`；`sessionName=周末聚会记录`；`stats=[成员 3, 欠酒 1, 加酒 1]`；`players=3`，成员 A `debtCount=1`，成员 B `drinkCount=1`；`ledgerEditable=true`，`ledgerEventCount=2`，`isJudge=true`，`hasSession=true`；Console `[]`。 | `docs/runtime/pr-qa-link-cleanup-008aa-ledger-20260619.png` | 独立账本页单点预览框阶段通过：成员昵称 / 头像占位、欠酒 / 加酒数据、judge 可编辑 `-/+` 控件可见；未点击加减，不写编辑动作通过。未见“保存关键事件”按钮。 |
| live-record 账本 tab | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=judge" --wait 3000 --data sessionId,sessionName,activeSegment,players,records,ledgerTimelineItems,isJudge,playerCount,photoNodes,timelineNodes,timelineLoading,errorText`，随后 `node scripts/wechat-devtools-automator.js tap --port 9420 --selector ".live-segment-tab:nth-child(4)" --wait 1200 --data activeSegment,players,records,ledgerTimelineItems,isJudge,playerCount,sessionId,sessionName` | relaunch 后 `ledgerTimelineItems=2`，含欠酒 / 加酒动态；tap 后 `activeSegment=ledger`，`players=3`，`isJudge=true`；但 `records` 三个成员的 `debtCount=0,drinkCount=0`，与独立 ledger 页不一致。relaunch Console 有多条 info `[session-exit] enableAlertBeforeUnload enabled`，tap Console `[]`，无 error / warn。 | `docs/runtime/pr-qa-link-cleanup-008aa-live-record-ledger-20260619.png` | live-record 账本 tab 仅记录控件可见旁证：截图显示 `-/+` 控件可见，未见“保存关键事件”；但 data 层 `records=0/0`，不能写 live-record 账本数据通过，需前端 / 数据映射继续对齐独立 ledger 页。 |

##### 13.16.96.3 简报大图点击复核

| 项目 | 记录 |
| --- | --- |
| relaunch 命令 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/session-brief/index?sessionId=session-1781787045680-8e406c&briefId=brief-1781787045693-bc8904b9" --wait 3000 --data previewableImageCount,previewImageCount,previewImageUrl,timelineNodes,photoHighlights,briefTitle,errorText,loading` |
| relaunch data | page=`pages/session-brief/index`，query `sessionId=session-1781787045680-8e406c,briefId=brief-1781787045693-bc8904b9`；`previewableImageCount=2`，`previewImageCount=0`，`previewImageUrl=""`；timeline 中 2 张 008g 非白图；`briefTitle=聚会简报`，`errorText=""`，`loading=false`；Console `[]`。 |
| 点击命令 | `node scripts/wechat-devtools-automator.js tap --port 9420 --selector .brief-image-preview-probe --wait 1500 --data previewableImageCount,previewImageCount,previewImageUrl,briefTitle,errorText,loading` |
| 点击结果 | tap 后 `previewableImageCount=2`，`previewImageCount=2`，`previewImageUrl=http://127.0.0.1:3221/uploads/moments/session-1781787045680-8e406c/1781787045687-party-highlight-a07ad1.webp`，`errorText=""`，Console `[]`。 |
| 截图 | `docs/runtime/pr-qa-link-cleanup-008aa-session-brief-preview-20260619.png`；截图显示系统 `wx.previewImage` 黑色预览层，左上 `1/2` 与加载指示。 |
| 判定 | 简报大图点击 data 层通过：点击探针后已写入 preview URL 与 count=2，说明入口触发；但 automator / 截图无法确认系统预览层图片加载完成或返回行为，只能写“大图入口触发 / 系统预览层待人工补证”，不得写大图完整通过。 |

##### 13.16.96.4 拍第一张说明 / chip / 授权复核

| 项目 | 记录 |
| --- | --- |
| 保存逻辑只读核查 | `rg -n "handleSubmitTap|draftImageFilePath|imageUrl|showToast|navigateTo|redirectTo|live-record|chooseMedia|upload" miniprogram/pages/moment-editor/index.ts` 显示 `handleSubmitTap` 在无图片但有 caption 时也可提交并跳转 live-record；这会写入非照片文本记录，不能证明“拍第一张保存照片后回流”。本轮不点击保存，避免不确定写入。 |
| relaunch 命令 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/moment-editor/index?sessionId=session-1781787045680-8e406c&nodeType=opening" --wait 3000 --data caption,captionPresets,visibilityOptions,consentItems,authorizationOptions,selectedAuthorizations,errorText,submitLabel,sessionId,nodeType,draftImageFilePath,imageUrl,uploading,saving` |
| 初始 data | page=`pages/moment-editor/index`，query `sessionId=session-1781787045680-8e406c,nodeType=opening`；`caption=""`，`captionPresets=4`；`visibilityOptions=[本聚会可见(active),允许分享,指定成员]`；`consentItems=4` 且全 `checked=true`；`authorizationOptions=4` 且全 `checked=true`；`selectedAuthorizations=[session,brief,share,ranking]`；`submitLabel=保存照片`；`draftImageFilePath=""`，`imageUrl=""`，`uploading=false`，`saving=false`；Console `[]`。 |
| chip 命令 | `node scripts/wechat-devtools-automator.js tap --port 9420 --selector .moment-caption-preset --wait 1200 --data caption,captionPresets,visibilityOptions,consentItems,authorizationOptions,selectedAuthorizations,errorText,submitLabel,sessionId,nodeType,draftImageFilePath,imageUrl,uploading,saving` |
| chip 结果 | tap 后 `caption=今晚第一张合影`，4 项授权仍默认全选，`draftImageFilePath=""`，`imageUrl=""`，Console `[]`。 |
| 截图 | `docs/runtime/pr-qa-link-cleanup-008aa-moment-editor-20260619.png`；由于上一步简报大图系统预览层仍覆盖右侧预览，截图显示黑色 `1/2` 预览层，不能作为 moment-editor 可视截图。 |
| 判定 | 说明 / chip / 授权 data 层沿 13.16.91 再确认：无 `仅自己`，默认文案 chip 可填充，4 项授权默认全选。因未上传真实图片且保存无图 caption 会写入非照片记录，本轮不点击保存；“拍第一张保存照片后进入 live-record”仍为运行态待补，不写通过。 |

##### 13.16.96.5 当前收口结论

| 节点 | 结论 |
| --- | --- |
| 账本欠酒 / 加酒 | 独立 ledger 页单点预览框阶段通过：欠酒 / 加酒数据和 `-/+` 控件可见；未点击写入，不写编辑动作通过。 |
| live-record 账本 tab | 控件可见但 data `records` 仍 0/0；只作旁证，不能写 live-record 账本数据通过，退前端 / 数据映射继续对齐。 |
| “保存关键事件” | 源码与本轮截图未见该按钮；本项单点通过。 |
| 简报大图 | 点击后 data 写入 `previewImageUrl` 和 `previewImageCount=2`；系统预览层显示 `1/2` 加载态，返回 / 图片加载完成待人工或更可靠工具补证。 |
| 拍第一张保存回流 | 说明 / chip / 4 项授权 data 层通过；真实上传照片并保存回流未测，仍待补证。 |
| 禁止结论 | 不写真机通过、上线通过、全链路通过、UIUX 通过；不把本节扩展为 008H 全目标通过。 |

#### 13.16.97 `PR-QA-LINK-CLEANUP-008AC-BRIEF-PREVIEWIMAGE-RETEST` 2026-06-19 简报大图预览 URL 待测门禁

记录时间：2026-06-19。PM 预派 008AC：用户反馈“点击查看原图一直转圈”，测试 13.16.96 已记录 008g 简报页点击 `.brief-image-preview-probe` 后，data 写入 `previewImageUrl` / `previewImageCount=2`，但右侧预览停在系统 `wx.previewImage` 黑色 `1/2` 加载态，不能证明大图加载完成或可返回。本节只登记待测门禁；前端 `PR-FE-LINK-CLEANUP-008AC-BRIEF-PREVIEWIMAGE-URL-FIX` 和接口联调 `PR-INT-LINK-CLEANUP-008AC-BRIEF-IMAGE-URL-REACHABILITY` 回包前，不执行 DevTools，不复测旧版本，不写页面通过。

##### 13.16.97.1 回包准入

| 依赖 | 准入要求 |
| --- | --- |
| 前端 008AC | 必须说明 `session-brief` 大图预览 URL 解析修复文件、图片 selector 或 `.brief-image-preview-probe` 是否沿用、`previewImageUrl` 来源是否为本地临时 / 缓存路径或规范可访问 `http(s)` 直链，并提供 `typecheck`、`check:encoding`、目标 diff check。 |
| 接口联调 008AC | 必须只读核查 008g 简报两张图片 URL 字段来源、HTTP GET 状态、Content-Type、尺寸、字节数，确认是否存在 `http://store`、`__store__` 或仅渲染可用但 `wx.previewImage` 不稳定的 URL；给出前端可用 URL 合同或确认后端无需改。 |
| 测试侧准入 | 只允许在两方回包后执行 008g 简报大图单点复测；不重复首页、邀请、账本、分享回流、008W 布局；完整 token 不得入文档。 |

##### 13.16.97.2 解阻后单点复测矩阵

| 用例 | 页面 / 操作 | data keys | 截图基线 | 通过标准 | 退回对象 |
| --- | --- | --- | --- | --- | --- |
| 008AC-brief-previewimage | 打开 `/pages/session-brief/index?sessionId=session-1781787045680-8e406c&briefId=brief-1781787045693-bc8904b9`，点击 `.brief-image-preview-probe` 或前端回包指定图片 selector。 | `previewImageUrl,previewImageCount,previewableImageCount,briefTitle,errorText,loading`；storage 只记 `runtime-api-base`、profileId、token 后 8 位。 | `docs/runtime/pr-qa-link-cleanup-008ac-brief-previewimage-008g-20260619.png`；必要时补返回后简报页截图 `docs/runtime/pr-qa-link-cleanup-008ac-brief-previewimage-return-008g-20260619.png`。 | 右侧预览能看到大图加载完成，不是黑色 `1/2` 转圈；能从系统预览层返回简报页；`previewImageUrl` 为本地缓存 / 临时路径或规范可访问直链；`previewImageCount=2`，Console 无阻塞红错。 | 若仍黑色转圈、URL 为不可预览路径或返回失败，退回前端 008AC；若图片 URL GET 非 200、尺寸 / Content-Type 异常或合同不清，退回接口联调 / 后端；若 DevTools 断连 / 黑屏 / 截图失败，登记工具链阻塞，不判业务失败。 |

##### 13.16.97.3 当前结论

| 项目 | 结论 |
| --- | --- |
| 当前状态 | 待测 / 阻塞于前端 008AC 与接口联调 008AC 回包。 |
| 已知失败基线 | 13.16.96 截图 `docs/runtime/pr-qa-link-cleanup-008aa-session-brief-preview-20260619.png` 显示系统预览层停在黑色 `1/2` 加载态；该截图不能作为大图通过证据。 |
| 禁止结论 | 不写真机通过、上线通过、全链路通过、UIUX 通过；不把 008AC 扩展到首页、邀请、账本、分享回流或 008W 布局。 |

#### 13.16.98 `PR-QA-LINK-CLEANUP-008AC-BRIEF-PREVIEWIMAGE-RETEST` 2026-06-19 放行后单点复测记录

记录时间：2026-06-19。PM 放行 008AC 单点复测。读取范围仅限前端 14.76、接口联调 3.47 和测试计划 13.16.97；不重复账本、首页、邀请、分享回流矩阵，不清 Storage、不重启 DevTools、不泄露完整 token。

##### 13.16.98.1 回包准入确认

| 依赖 | 读取结论 |
| --- | --- |
| 前端 14.76 | `miniprogram/pages/session-brief/index.ts` 已引入 `normalizeManagedAssetPath` / `resolveCachedManagedImagePath`，`handlePreviewFirstImageTap()` / `handleTimelineSelect()` 会在调用 `wx.previewImage` 前解析成本地缓存路径或规范 `http(s)` 直链；`previewImageUrl` 记录实际传给系统预览层的 URL。 |
| 接口联调 3.47 | 008g 两张图片字段来自 `/uploads/...`，无 `http://store` / `__store__` 源字段；HTTP GET 均 `200`，真实 `640x420` WebP；本地响应 `Content-Type=application/octet-stream`，若前端缓存 / 规范 URL 后仍转圈，再转后端 / API 检查 `.webp` MIME。 |

##### 13.16.98.2 DevTools / storage 前置

| 项目 | 记录 |
| --- | --- |
| 脱敏 status 命令 | `@' ... miniprogram-automator getStorageSync(runtime-api-base,jzp-user-token,social-current-profile-id,social-current-profile) ... '@ | node -` |
| status 结果 | page=`pages/index/index`，query `{}`；`runtime-api-base=http://127.0.0.1:3221/api/v1`，profileId=`user-1781787045679-f3f2eb`，profileName=`聚会记录师成员A`，tokenPresent=`true`，token 后 8 位 `b8615971`。完整 token 未输出、未写入。 |

##### 13.16.98.3 008g 简报大图单点复测

| 项目 | 记录 |
| --- | --- |
| relaunch 命令 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/session-brief/index?sessionId=session-1781787045680-8e406c&briefId=brief-1781787045693-bc8904b9" --wait 3000 --data previewableImageCount,previewImageCount,previewImageUrl,timelineNodes,photoHighlights,briefTitle,errorText,loading` |
| relaunch 摘要 | page=`pages/session-brief/index`，query `sessionId=session-1781787045680-8e406c,briefId=brief-1781787045693-bc8904b9`；`previewableImageCount=2`，`previewImageCount=0`，`previewImageUrl=""`，`briefTitle=聚会简报`，`loading=false`，`errorText=""`；`timelineNodes` 含 2 张 `http://127.0.0.1:3221/uploads/...webp` 非白图；Console `[]`。 |
| tap 命令 | `node scripts/wechat-devtools-automator.js tap --port 9420 --selector .brief-image-preview-probe --wait 5000 --data previewableImageCount,previewImageCount,previewImageUrl,briefTitle,errorText,loading` |
| tap data | page 仍为 `pages/session-brief/index`；`previewableImageCount=2`，`previewImageCount=2`，`previewImageUrl=http://store/HgnBRwKnuTOK023ef7306a817586e12c419a5295bb10.bin`，`briefTitle=聚会简报`，`loading=false`，`errorText=""`；Console `[]`。该 URL 为前端传给系统预览层的缓存路径，不再是原始 `/uploads/...` 直链。 |
| 截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008ac-brief-previewimage-008g-20260619.png -Mode right` |
| 截图路径 | `docs/runtime/pr-qa-link-cleanup-008ac-brief-previewimage-008g-20260619.png`，脚本返回 `width=410,height=1032`。 |
| 截图观察 | 系统预览层中已显示 008g 非白大图内容，可见紫 / 橙图形和 `PRCS 008G HIGHLIGHT / NON-WHITE PHOTO FIXTURE` 文案；不再是 13.16.96 的纯黑 `1/2` 转圈加载态。 |
| 时间线图片点击 | 未执行。探针点击后仍处于系统预览层，继续点时间线图片需要先关闭预览层；本轮不做高风险键盘 / 窗口操作，不伪造返回或第二张点击证据。 |

##### 13.16.98.4 当前判定

| 项目 | 结论 |
| --- | --- |
| 大图加载 | 008AC 大图加载修复已在 DevTools 右侧预览框单点确认：点击 `.brief-image-preview-probe` 后系统预览层显示非白大图，不再停在黑色 `1/2` 转圈。 |
| URL / MIME 责任 | 本轮 `previewImageUrl` 为 `http://store/...bin` 缓存路径，且预览层已加载图片；暂不按接口 3.47 的 `application/octet-stream` MIME warning 退后端 / API。 |
| 返回简报 | 待补证：本轮未执行窗口级返回 / 键盘操作；不能写“大图返回简报页完整通过”。后续如 PM 提供安全返回操作或人工预览补证，再补 `return` 截图。 |
| 退回对象 | 不退前端 008AC 的“仍转圈”问题；不退后端 / API MIME。返回行为仍为测试证据缺口，不作为业务失败。 |
| 禁止结论 | 不写真机通过、上线通过、全链路通过、UIUX 通过；不扩大到首页、邀请、账本、分享回流或 008W 布局。 |

#### 13.16.99 `PR-QA-LINK-CLEANUP-008AD-LEDGER-FORBIDDEN-RETEST` 2026-06-19 账本权限 forbidden 待测门禁

记录时间：2026-06-19。PM 预派 008AD：用户截图显示记录 / 账本页“聚会账本”tab 提示“发起人可调整”，但当前用户点击欠酒 / 加酒 `+/-` 后 toast 英文 `forbidden`。该问题按 P0 处理。本节只登记待测门禁；前端 `PR-FE-LINK-CLEANUP-008AD-LEDGER-FORBIDDEN-PERMISSION-FIX` 和接口联调 `PR-INT-LINK-CLEANUP-008AD-LEDGER-FORBIDDEN-HOST-AUTH-CHECK` 回包前，不执行 DevTools，不复测旧版本，不写页面通过。

##### 13.16.99.1 回包准入

| 依赖 | 准入要求 |
| --- | --- |
| 前端 008AD | 必须说明 `live-record` 聚会账本 tab 与独立 `ledger` 页的权限展示修复文件、非 host / member 与 host / judge 两类视角的 UI 规则、英文 `forbidden` toast 的用户可见文案清理方式，并提供 `typecheck`、`check:encoding`、目标 diff check。 |
| 接口联调 008AD | 必须给出 host 与非 host / member 的安全测试身份或 token 交接方式；确认后端对账本加减接口的权限合同、成功 / forbidden 响应、可回滚或恢复方式；公开文档只允许记录 token 后 8 位，不得泄露完整 token。 |
| 测试侧准入 | 只允许在前端和接口联调均回包后执行账本权限单点复测；不重复首页、邀请、分享、大图、相册矩阵；如缺 host 安全 token 或回滚方案，只验证 UI 可见性，不点击写入。 |

##### 13.16.99.2 解阻后单点复测矩阵

| 用例 | 身份 / 页面 | 操作 | data keys | 截图基线 | 通过标准 | 退回对象 |
| --- | --- | --- | --- | --- | --- | --- |
| 008AD-nonhost-live-record-ledger | 非 host / memberA 或接口联调指定非发起人 token；`/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=member`，切换聚会账本 tab。 | 只看 UI；如 `+/-` 不应出现则不点击。若仍出现，最多点一次并记录 toast 原文，不做循环写入。 | `activeSegment,players,records,ledgerTimelineItems,isJudge,ledgerEditable,errorText,toast/message`；storage 记录 API base、profileId、token 后 8 位。 | `docs/runtime/pr-qa-link-cleanup-008ad-nonhost-live-record-ledger-20260619.png` | 非 host 不显示可编辑 `+/-`；不显示“发起人可调整”误导文案；不得 toast 英文 `forbidden`；Console 无阻塞红错。 | UI 仍露出可编辑控件或“发起人可调整”退前端；接口返回 forbidden 但前端直出英文 toast 退前端；权限合同不清或身份错配退接口联调 / 后端。 |
| 008AD-nonhost-ledger | 非 host / memberA 或接口联调指定非发起人 token；`/pages/ledger/index?sessionId=session-1781787045680-8e406c&role=member`。 | 只看 UI；同上不扩大写入。 | `players,stats,ledgerEditable,ledgerEventCount,isJudge,errorText,loading`；storage 同上。 | `docs/runtime/pr-qa-link-cleanup-008ad-nonhost-ledger-20260619.png` | 独立账本页非 host 不显示 `+/-` 可编辑入口；无英文 `forbidden`；账本数据仍可读。 | 同上。 |
| 008AD-host-live-record-ledger | host token，需接口联调安全交接；`/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=host`，切换聚会账本 tab。 | 先验证 `+/-` 可见；只有接口联调提供可回滚 / 恢复方式时，做一次轻量加减并记录成功与恢复命令，否则不点击写入。 | `activeSegment,players,records,ledgerTimelineItems,isJudge,ledgerEditable,errorText,toast/message`；storage 记录 host token 后 8 位。 | `docs/runtime/pr-qa-link-cleanup-008ad-host-live-record-ledger-20260619.png` | host / judge 视角显示 `+/-`，文案为中文可理解状态；轻量写入如执行，应保存成功且可回滚 / 已恢复；Console 无阻塞红错。 | host 点击仍 forbidden 退接口联调 / 后端；UI 不显示可编辑控件退前端；无法回滚则只记可见性，不写编辑通过。 |
| 008AD-host-ledger | host token，`/pages/ledger/index?sessionId=session-1781787045680-8e406c&role=host`。 | 同上。 | `players,stats,ledgerEditable,ledgerEventCount,isJudge,errorText,loading`；storage 同上。 | `docs/runtime/pr-qa-link-cleanup-008ad-host-ledger-20260619.png` | 独立账本页 host 可见 `+/-`，权限与写入表现符合接口合同；无英文 `forbidden`。 | 同上。 |

##### 13.16.99.3 当前结论

| 项目 | 结论 |
| --- | --- |
| 当前状态 | 待测 / 阻塞于前端 008AD 与接口联调 008AD 回包。 |
| 已知失败基线 | 用户截图反馈：记录 / 账本页“聚会账本”tab 显示“发起人可调整”，点击欠酒 / 加酒 `+/-` 后 toast 英文 `forbidden`。该状态不能写通过。 |
| 写入限制 | host 轻量加减只有在接口联调提供安全 token 与可回滚 / 恢复方式后才执行；否则只验证控件可见和权限文案，不写编辑通过。 |
| 禁止结论 | 不写真机通过、上线通过、全链路通过、UIUX 通过；不扩大到首页、邀请、分享、大图、相册矩阵。 |

#### 13.16.100 `PR-QA-LINK-CLEANUP-008AD-LEDGER-FORBIDDEN-RETEST` 2026-06-19 非 host 单点复测记录

记录时间：2026-06-19。PM 正式放行 008AD 单点复测，随后提醒不要扩大范围。本轮只复测 008g memberA / 非 host 视角的 live-record 聚会账本 tab 与独立 ledger 页；不重复首页、邀请、分享、大图、相册矩阵；不清 Storage、不重启 DevTools、不执行账本写入；完整 token 未写入。

##### 13.16.100.1 回包准入确认

| 依赖 | 读取结论 |
| --- | --- |
| 前端 14.77 | `ledger` / `live-record` 可编辑态改为 `liveSession.hostProfileId === 当前 profileId`；非 host 不显示 `+/-`，403 / `forbidden` 转中文。 |
| 接口联调 3.48 | 008g `hostProfileId=user-1781787045678-c892b9`，host token 后 8 位 `ddceb616`；当前 memberA profileId=`user-1781787045679-f3f2eb`，token 后 8 位 `b8615971`，不是 host；memberA 触发 403 属后端预期鉴权。 |

##### 13.16.100.2 storage 前置

| 项目 | 记录 |
| --- | --- |
| 脱敏 status 命令 | `@' ... miniprogram-automator getStorageSync(runtime-api-base,jzp-user-token,social-current-profile-id,social-current-profile) ... '@ | node -` |
| status 结果 | page=`pages/me/index`，query `{}`；`runtime-api-base=http://127.0.0.1:3221/api/v1`，profileId=`user-1781787045679-f3f2eb`，profileName=`聚会记录师成员A`，tokenPresent=`true`，token 后 8 位 `b8615971`。 |

##### 13.16.100.3 live-record 聚会账本 tab 非 host 复测

| 项目 | 记录 |
| --- | --- |
| relaunch 命令 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=member" --wait 3000 --data sessionId,sessionName,activeSegment,players,records,ledgerTimelineItems,isJudge,ledgerEditable,playerCount,photoNodes,timelineNodes,timelineLoading,errorText` |
| relaunch 摘要 | page=`pages/live-record/index`，query `sessionId=session-1781787045680-8e406c,role=member`；`sessionName=周末聚会记录`，`activeSegment=record`，`players=3`，`ledgerTimelineItems=2`，`isJudge=false`；Console 仅 info `[session-exit] enableAlertBeforeUnload enabled`，无 error / warn。 |
| tab 命令 | `node scripts/wechat-devtools-automator.js tap --port 9420 --selector ".live-segment-tab:nth-child(4)" --wait 1500 --data activeSegment,players,records,ledgerTimelineItems,isJudge,ledgerEditable,playerCount,sessionId,sessionName,errorText` |
| tab data | `activeSegment=ledger`，`players=3`，`ledgerTimelineItems=2`，`isJudge=false`，`sessionName=周末聚会记录`；Console `[]`。 |
| 截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008ad-nonhost-live-record-ledger-20260619.png -Mode right` |
| 截图路径 / 观察 | `docs/runtime/pr-qa-link-cleanup-008ad-nonhost-live-record-ledger-20260619.png`，右侧预览显示聚会账本 tab，右上为“仅查看”，成员卡只显示欠酒 / 加酒数据，无 `+/-`；未见“发起人可调整”，未见英文 `forbidden`。 |

##### 13.16.100.4 独立 ledger 页非 host 复测

| 项目 | 记录 |
| --- | --- |
| relaunch 命令 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/ledger/index?sessionId=session-1781787045680-8e406c&role=member" --wait 3000 --data sessionId,sessionName,stats,players,ledgerEditable,ledgerEventCount,isJudge,errorText,loading,hasSession` |
| relaunch data | page=`pages/ledger/index`，query `sessionId=session-1781787045680-8e406c,role=member`；`sessionName=周末聚会记录`，`stats=[成员 3, 欠酒 1, 加酒 1]`，`players=3`，memberA `debtCount=1`，memberB `drinkCount=1`，`ledgerEditable=false`，`ledgerEventCount=2`，`isJudge=false`，`hasSession=true`；Console `[]`。 |
| 截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008ad-nonhost-ledger-20260619.png -Mode right` |
| 截图路径 / 观察 | `docs/runtime/pr-qa-link-cleanup-008ad-nonhost-ledger-20260619.png`，右侧预览显示独立聚会账本页，顶部为“仅查看，请发起人调整”，成员卡无 `+/-`；未见旧“发起人可调整”误导口径，未见英文 `forbidden`。 |

##### 13.16.100.5 当前判定

| 项目 | 结论 |
| --- | --- |
| 非 host live-record 账本 tab | 预览框阶段通过：memberA 非 host 下 `isJudge=false`，UI 只读，无 `+/-`，无“发起人可调整”，无英文 `forbidden`。 |
| 非 host 独立 ledger 页 | 预览框阶段通过：`ledgerEditable=false`，账本数据可读，无 `+/-`，无英文 `forbidden`。 |
| host 编辑路径 | 未测。虽然接口联调提供 host token 尾号 `ddceb616`，但本轮未获得可回滚 / 恢复写入证据，且 PM 收口提醒不要扩大范围；未切换 host storage，未执行加减写入，不写编辑通过。 |
| 退回对象 | 本轮非 host forbidden P0 不退前端 / 后端；host 可见性与保存成功仍待后续安全回滚窗口单独补证。 |
| 禁止结论 | 不写真机通过、上线通过、全链路通过、UIUX 通过；不扩大到首页、邀请、分享、大图、相册矩阵。 |

#### 13.16.101 `PR-QA-LINK-CLEANUP-008AE-CREATE-PLAYER-COUNT-RETEST` 2026-06-19 创建页今晚聚会人数编辑待测门禁

记录时间：2026-06-19。PM 预派 008AE：用户要求创建聚会页面可编辑今晚聚会人数。PM 队列记录前端 `PR-FE-LINK-CLEANUP-008AE-CREATE-PLAYER-COUNT-EDIT` 已派发，当前 `create-session` 已有 `playerCount` 与 `handlePlayerCountTap`，但 WXML 只展示“人数 X 人 · 更多设置可稍后调整”，没有明确可编辑控件。本节只登记待测门禁；前端 008AE 回包前，不执行 DevTools，不复测旧版本，不写页面通过。

##### 13.16.101.1 前端回包准入

| 依赖 | 准入要求 |
| --- | --- |
| 前端 008AE | 必须说明 `miniprogram/pages/create-session/index.wxml`、`index.ts`、`index.less` 的改动；创建页直接展示“今晚聚会人数”编辑控件，建议复用现有 `handlePlayerCountTap` 与 `create-stepper` 样式；范围 2-12，默认 2；创建时继续把编辑后的 `playerCount` 传给 `createManagedSession`。 |
| 静态验证 | 前端需提供 `typecheck`、`check:encoding`、目标 diff check；不得恢复轻量主题 / 模板入口，不跳无关高级设置，不改后端。 |
| 测试侧准入 | 仅在前端 008AE 回包后执行创建页人数编辑单点复测；不清 Storage、不重启 DevTools、不重复 008AD / 008AC / 首页 / 邀请 / 分享 / 账本 / 相册矩阵。 |

##### 13.16.101.2 解阻后单点复测矩阵

| 用例 | 页面 / 操作 | data keys | 截图基线 | 通过标准 | 退回对象 |
| --- | --- | --- | --- | --- | --- |
| 008AE-create-player-count-visible | 打开 `/pages/create-session/index`。 | `playerCount,partyName,sessionName,submitting,errorText`；如前端新增字段，补记人数控件状态字段。storage 仅记 API base、profileId、token 后 8 位。 | `docs/runtime/pr-qa-link-cleanup-008ae-create-player-count-visible-20260619.png` | 页面可见“今晚聚会人数”或等价用户可理解控件；默认人数可读；无轻量主题 / 模板入口回潮；Console 无阻塞红错。 | 控件不可见、默认值不可读、主题 / 模板入口回潮退前端。 |
| 008AE-create-player-count-stepper | 在创建页点击人数 `+/-`。 | `playerCount`，必要时补 `minPlayerCount,maxPlayerCount` 或前端实际边界字段。 | `docs/runtime/pr-qa-link-cleanup-008ae-create-player-count-stepper-20260619.png` | 点击 `+` / `-` 后 `playerCount` 随 UI 一致变化；下限 2、上限 12 生效；边界点击不出现负数、0、1 或超过 12；Console 无阻塞红错。 | data 与 UI 不一致、边界失效、按钮不可点退前端。 |
| 008AE-create-player-count-submit-param | 仅在不扩大链路且不会污染样本时执行创建；否则只看提交前 data。 | `playerCount,submitting,createdSessionId,createPayload` 或前端实际创建参数字段。 | 如执行创建，截图命名 `docs/runtime/pr-qa-link-cleanup-008ae-create-player-count-submit-20260619.png`。 | 创建 runtime / page data / 创建参数使用编辑后的 `playerCount`；不继续扩大到邀请、拍照、分享、账本矩阵。 | 创建 payload 未使用编辑值退前端；接口拒绝或合同缺失退接口联调 / 后端；若缺安全 cleanup 方式则记录“提交未测”，不写创建通过。 |

##### 13.16.101.3 当前结论

| 项目 | 结论 |
| --- | --- |
| 当前状态 | 待测 / 阻塞于前端 008AE 回包。 |
| 已知缺口 | 当前队列记录创建页只有“人数 X 人 · 更多设置可稍后调整”展示，没有明确“今晚聚会人数”编辑控件；不能写通过。 |
| 禁止结论 | 不写真机通过、上线通过、全链路通过；不把本节扩展到邀请、拍照、分享、账本、相册或首页矩阵。 |

#### 13.16.102 `PR-QA-LINK-CLEANUP-008AF-CREATE-NAME-PRESETS-RETEST` 2026-06-19 创建页聚会名预设待测门禁

记录时间：2026-06-19。PM 追加 008AF：用户要求聚会名也要有预制可选填入，点击后自动填充。PM 队列记录前端 `PR-FE-LINK-CLEANUP-008AF-CREATE-NAME-PRESETS` 已派发，当前 `create-session.ts` 已有 `sessionNamePresets` 和 `handlePresetTap()`，但 WXML 只显示输入框，没有渲染预设按钮。本节只登记待测门禁；前端 008AF 回包前，不执行 DevTools，不复测旧版本，不写页面通过。

##### 13.16.102.1 前端回包准入

| 依赖 | 准入要求 |
| --- | --- |
| 前端 008AF | 必须说明 `miniprogram/pages/create-session/index.wxml`、`index.ts`、`index.less` 的改动；在聚会名输入框下方渲染预设 chips，点击后调用现有 `handlePresetTap()` 自动填充 `sessionName`，并显示选中态。 |
| 静态验证 | 前端需提供 `typecheck`、`check:encoding`、目标 diff check；不得恢复轻量主题 / 模板入口，不改创建合同，不把预设做成不可编辑固定选择。 |
| 测试侧准入 | 仅在前端 008AF 回包后执行创建页聚会名预设单点复测；可与 008AE 创建页人数编辑在同一 DevTools 窗口串行执行，但不清 Storage、不重启 DevTools、不重复 008AD / 008AC / 首页 / 邀请 / 分享 / 账本 / 相册矩阵。 |

##### 13.16.102.2 解阻后单点复测矩阵

| 用例 | 页面 / 操作 | data keys | 截图基线 | 通过标准 | 退回对象 |
| --- | --- | --- | --- | --- | --- |
| 008AF-create-name-presets-visible | 打开 `/pages/create-session/index`。 | `sessionName,sessionNamePresets,activeSessionNamePreset,submitting,errorText`；如前端字段名不同，记录实际字段。storage 仅记 API base、profileId、token 后 8 位。 | `docs/runtime/pr-qa-link-cleanup-008af-create-name-presets-visible-20260619.png` | 聚会名输入框下方预设 chips 可见；至少包含前端回包指定预设，例如 `朋友小聚`；输入框仍可编辑；Console 无阻塞红错。 | chips 不可见、预设文案缺失、输入框不可编辑退前端。 |
| 008AF-create-name-preset-tap | 点击任一预设，例如 `朋友小聚`。 | `sessionName,activeSessionNamePreset,sessionNamePresets`；必要时补输入框 value 字段。 | `docs/runtime/pr-qa-link-cleanup-008af-create-name-preset-tap-20260619.png` | 点击后 `sessionName` data 和输入框值自动填入对应文案，并出现选中态；Console 无阻塞红错。 | data 未变化、UI 未填入、无选中态退前端。 |
| 008AF-create-name-custom-input | 在点击预设后手动输入自定义名称。 | `sessionName,activeSessionNamePreset`；必要时补输入事件字段。 | `docs/runtime/pr-qa-link-cleanup-008af-create-name-custom-input-20260619.png` | 输入框仍可编辑，`sessionName` 使用当前自定义名称；如 active 态未清除，按前端说明记录，不单独扩大退回。 | 输入框无法覆盖预设、`sessionName` 不跟随自定义输入退前端。 |
| 008AF-create-name-submit-param | 仅在不扩大链路且不会污染样本时执行创建；否则只看提交前 data。 | `sessionName,submitting,createdSessionId,createPayload` 或前端实际创建参数字段。 | 如执行创建，截图命名 `docs/runtime/pr-qa-link-cleanup-008af-create-name-submit-20260619.png`。 | 创建 runtime / page data / 创建参数使用当前输入的 `sessionName`；不继续扩大到邀请、拍照、分享、账本矩阵。 | 创建 payload 未使用当前名称退前端；接口拒绝或合同缺失退接口联调 / 后端；若缺安全 cleanup 方式则记录“提交未测”，不写创建通过。 |

##### 13.16.102.3 当前结论

| 项目 | 结论 |
| --- | --- |
| 当前状态 | 待测 / 阻塞于前端 008AF 回包。 |
| 已知缺口 | 当前队列记录创建页已有 `sessionNamePresets` 与 `handlePresetTap()`，但 WXML 未渲染预设按钮；不能写通过。 |
| 与 008AE 关系 | 008AF 可与 008AE 在同一创建页窗口串行单点复测，减少重复打开页面；但两者结论分开记录，不写创建链路全通过。 |
| 禁止结论 | 不写真机通过、上线通过、全链路通过；不把本节扩展到邀请、拍照、分享、账本、相册或首页矩阵。 |

#### 13.16.103 `PR-QA-LINK-CLEANUP-008AG-INVITE-CARD-SHARE-AVATAR-SLOTS-RETEST` 2026-06-19 邀请卡 / 分享 / 头像 slot 待测门禁

记录时间：2026-06-19。PM 预派 008AG：用户要求邀请好友页面仍需要邀请卡片，可分享给好友，好友点击后即可加入该局；同时保留已加入玩家小头像列，按创建时人数生成空态头像，已加入玩家可手动刷新后填充空态头像。本节只登记待测门禁；前端 `PR-FE-LINK-CLEANUP-008AG-INVITE-CARD-SHARE-AVATAR-SLOTS` 和接口 `PR-INT-LINK-CLEANUP-008AG-INVITE-JOIN-CONTRACT` 回包前，不执行 DevTools，不复测旧版本，不写页面通过。

##### 13.16.103.1 回包准入

| 依赖 | 准入要求 |
| --- | --- |
| 前端 008AG | 必须说明 `invite-group` 页面邀请卡片、分享按钮、刷新按钮、头像 slot 列、拍第一张主 CTA 的改动文件；说明 `onShareAppMessage` path 组成和 page data 字段；不得恢复照片 / 账本厚模块、说明堆叠、debug / 字段文字。 |
| 接口 008AG | 必须给出邀请加入合同：`sessionId`、`inviteCode`、`playerCount`、`joinedCount`、`joinStatusPlayers` 字段来源；说明好友点击分享链接后的加入接口 / 页面路由、身份要求、安全测试方式和 cleanup / 回滚口径。 |
| 测试侧准入 | 仅在前端和接口均回包后执行邀请页单点复测；不清 Storage、不重启 DevTools、不重复创建页 008AE / 008AF、账本、分享回流、相册矩阵；如无法安全模拟新用户点击分享链接，只记录分享 path 与接口合同，不伪造加入通过。 |

##### 13.16.103.2 解阻后单点复测矩阵

| 用例 | 页面 / 操作 | data keys | 截图基线 | 通过标准 | 退回对象 |
| --- | --- | --- | --- | --- | --- |
| 008AG-invite-card-visible | 打开 `/pages/invite-group/index?sessionId=<接口回包 sessionId>`。 | `sessionId,inviteCode,playerCount,joinedCount,joinStatusPlayers,avatarSlots,sharePath,errorText,loading`；如前端字段名不同，记录实际字段。storage 仅记 API base、profileId、token 后 8 位。 | `docs/runtime/pr-qa-link-cleanup-008ag-invite-card-visible-20260619.png` | 邀请卡片可见；页面只保留口令、好友加入状态、头像 slot、刷新、分享给好友和拍第一张主 CTA；不出现照片 / 账本厚模块、说明堆叠、debug / 字段文字；Console 无阻塞红错。 | 卡片缺失、厚模块回潮、debug / raw 字段外露退前端；接口字段缺失或样本不可读退接口。 |
| 008AG-share-path | 触发分享按钮或读取 `onShareAppMessage` / share data。 | `sharePath,sessionId,inviteCode`，必要时记录 `shareTitle,shareImageUrl`。 | 如可截图分享入口，`docs/runtime/pr-qa-link-cleanup-008ag-share-entry-20260619.png`。 | 分享按钮可触发 `onShareAppMessage`；path 含 `sessionId` 与 `inviteCode`；若自动化不能模拟微信好友点击，只记录 path 与接口合同，不写好友加入通过。 | path 缺 `sessionId` / `inviteCode` 或按钮不可触发退前端；加入合同缺失退接口。 |
| 008AG-avatar-slots | 读取头像 slot 区域。 | `playerCount,joinedCount,joinStatusPlayers,avatarSlots`。 | `docs/runtime/pr-qa-link-cleanup-008ag-avatar-slots-20260619.png` | avatar slot 数量等于 `playerCount`；已加入数量等于 `joinedCount` / `joinStatusPlayers`；未加入位置为空态头像；头像列不遮挡主 CTA。 | slot 数量不等于人数、已加入未填充、空态缺失或布局遮挡退前端；接口计数不一致退接口。 |
| 008AG-refresh-join-status | 点击刷新按钮。 | `joinedCount,joinStatusPlayers,avatarSlots,loading,errorText,lastRefreshedAt` 或实际字段。 | `docs/runtime/pr-qa-link-cleanup-008ag-refresh-join-status-20260619.png` | 刷新后重新拉取加入数据，slot 按最新 joined players 填充；无英文错误、无 debug 文案、Console 无阻塞红错。 | 刷新无请求 / data 不更新退前端；接口返回异常退接口 / 后端。 |
| 008AG-friend-click-join | 仅在接口提供安全新用户身份、分享链接和 cleanup / 回滚方式时执行。 | `joinedCount,joinStatusPlayers,avatarSlots,inviteStatus,joinResult`。 | `docs/runtime/pr-qa-link-cleanup-008ag-friend-click-join-20260619.png`。 | 新用户通过分享链接加入后 `joinedCount` 增加，头像 slot 填充，且可恢复 / cleanup；否则不执行，不写通过。 | 无安全联调方式则标“好友点击加入待联调”；前端路由跳转错退前端；加入接口失败退接口 / 后端。 |

##### 13.16.103.3 当前结论

| 项目 | 结论 |
| --- | --- |
| 当前状态 | 待测 / 阻塞于前端 008AG 与接口 008AG 回包。 |
| 已知目标 | 邀请页需要恢复轻量邀请卡、分享给好友、头像 slot 和刷新加入状态；但仍必须保持极简，不回到照片 / 账本厚模块或 debug 字段外露。 |
| 好友点击加入 | 自动化不能直接模拟微信好友点击时，只记录分享 path 与接口合同；不得伪造加入通过。 |
| 禁止结论 | 不写真机通过、上线通过、全链路通过；不把本节扩展到创建页 008AE / 008AF、账本、分享回流、相册矩阵。 |

#### 13.16.104 `PR-QA-LINK-CLEANUP-008AG-INVITE-CARD-SHARE-AVATAR-SLOTS-RETEST` 2026-06-19 邀请页单点复测记录

记录时间：2026-06-19。PM 正式放行 008AG 单点复测。本轮只复测 008g `invite-group` 邀请页；不重复创建页 008AE / 008AF、账本、分享回流、相册矩阵；不清 Storage、不重启 DevTools、不执行 `/sessions/join` 写入；完整 token 未写入。

##### 13.16.104.1 回包准入确认

| 依赖 | 读取结论 |
| --- | --- |
| 前端 14.80 | `invite-group` 恢复简洁邀请卡：口令、加入状态、头像空位、复制、刷新、分享给好友；新增 `avatarSlots`，按 `playerCount` 固定渲染，优先用 `joinedPlayers` 填充；`handleRefreshTap()` 只拉 `getManagedLiveSession()`；新增 `open-type="share"` 分享按钮；`onShareAppMessage()` path 保持 `/pages/index/index?inviteCode=...&sessionId=...`。 |
| 接口联调 3.49 | 当前合同支持“好友点击分享链接 -> `/pages/index/index?inviteCode=...&sessionId=...` -> 登录 / 授权 -> `POST /sessions/join` 加入该局”；不支持无登录静默加入。008g 样本 `session-1781787045680-8e406c / J2BEL2` 已满员，`playerCount=3`、`joinedCount=3`、`joinedPlayers=3`、`joinStatusPlayers=3`，不能证明空槽填充。 |

##### 13.16.104.2 storage 前置

| 项目 | 记录 |
| --- | --- |
| 脱敏 status 命令 | `@' ... miniprogram-automator getStorageSync(runtime-api-base,jzp-user-token,social-current-profile-id,social-current-profile) ... '@ | node -` |
| status 结果 | 当前 storage 为 008g memberA：`runtime-api-base=http://127.0.0.1:3221/api/v1`，profileId=`user-1781787045679-f3f2eb`，profileName=`聚会记录师成员A`，tokenPresent=`true`，token 后 8 位 `b8615971`。执行前当前页曾是 `pages/invite-group/index?sessionId=session-1781808709710-8f00b7`，随后 relaunch 到 008g 目标样本。 |

##### 13.16.104.3 邀请卡 / 头像 slot / 刷新 / 分享复测

| 项目 | 记录 |
| --- | --- |
| relaunch 命令 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/invite-group/index?sessionId=session-1781787045680-8e406c" --wait 3000 --data sessionId,inviteCode,playerCount,joinedCount,joinStatusText,joinStatusPlayers,joinedPlayers,avatarSlots,sharePath,sessionName,errorText,loading` |
| relaunch data | page=`pages/invite-group/index`，query `sessionId=session-1781787045680-8e406c`；`sessionId=session-1781787045680-8e406c`，`inviteCode=J2BEL2`，`sessionName=周末聚会记录`，`playerCount=3`，`joinedCount=3`，`joinStatusText=3/3 位好友已加入`；`avatarSlots.length=3`，三项均 `filled=true`，分别为房主、成员A、成员B；Console 仅 info `[session-exit] enableAlertBeforeUnload enabled`，无 error / warn。 |
| 邀请卡截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008ag-invite-card-visible-20260619.png -Mode right` |
| 邀请卡截图 / 观察 | `docs/runtime/pr-qa-link-cleanup-008ag-invite-card-visible-20260619.png`，右侧预览显示邀请卡、房间码 `J2BEL2`、`3/3 位好友已加入`、3 个头像 slot、复制口令、刷新状态、分享给好友、拍第一张主 CTA；未见照片 / 账本厚模块、说明堆叠、raw / debug / 接口字段或旧品牌大标题。 |
| 刷新命令 | `node scripts/wechat-devtools-automator.js tap --port 9420 --selector ".invite-inline-actions .invite-inline-action:nth-child(2)" --wait 2500 --data sessionId,inviteCode,playerCount,joinedCount,joinStatusText,joinStatusPlayers,joinedPlayers,avatarSlots,sessionName,errorText,loading` |
| 刷新 data | 刷新后仍为 `sessionId=session-1781787045680-8e406c`，`inviteCode=J2BEL2`，`playerCount=3`，`joinedCount=3`，`joinStatusText=3/3 位好友已加入`，`avatarSlots.length=3` 且三项仍 `filled=true`；Console `[]`，未清空 page data。 |
| 刷新截图 | `docs/runtime/pr-qa-link-cleanup-008ag-refresh-join-status-20260619.png`，右侧预览仍显示邀请卡和 3 个已加入头像 slot。 |
| 分享 path 只读核查 | `Get-Content -Path miniprogram/pages/invite-group/index.ts | Select-Object -Skip 136 -First 28`；`onShareAppMessage()` 返回 `path: /pages/index/index?inviteCode=${encodeURIComponent(this.data.inviteCode)}&sessionId=${encodeURIComponent(this.data.sessionId)}`。 |
| 分享按钮 tap 命令 | `node scripts/wechat-devtools-automator.js tap --port 9420 --selector ".invite-share-button" --wait 1500 --data sessionId,inviteCode,playerCount,joinedCount,joinStatusText,avatarSlots,sessionName,errorText,loading` |
| 分享按钮 tap 结果 | tap 成功，page 仍为 `pages/invite-group/index`，`inviteCode=J2BEL2`，`sessionId=session-1781787045680-8e406c`，`playerCount=3`，`joinedCount=3`，`avatarSlots.length=3`；Console `[]`。DevTools automator 未提供微信好友分享面板可验证状态，本轮只记录按钮可点与 path 合同，不写好友点击加入通过。 |
| 分享入口截图 | `docs/runtime/pr-qa-link-cleanup-008ag-share-entry-20260619.png`。 |

##### 13.16.104.4 当前判定

| 项目 | 结论 |
| --- | --- |
| 邀请卡片 | 预览框阶段通过：邀请卡、口令、加入状态、头像 slot、刷新、复制 / 分享给好友、拍第一张主 CTA 可见；未见照片 / 账本厚模块、说明堆叠、raw / debug / 接口字段或旧品牌大标题。 |
| 头像 slot | 008g 满员样本下预览框阶段通过：`avatarSlots.length=playerCount=3`，`joinedCount=3`，三项均填充已加入成员。 |
| 刷新状态 | 预览框阶段通过：点击“刷新状态”后重新拉取，data 未清空，slot 仍按 3/3 已加入填充，Console `[]`。 |
| 分享给好友 | 按当前工具能力记录为合同通过 / 微信好友面板待真机或更合适工具补证：按钮 tap 成功、Console `[]`，源码 path 含 `inviteCode=J2BEL2` 与 `sessionId=session-1781787045680-8e406c`；未伪造好友点击加入。 |
| 空槽 / 新用户加入 | 待补样本 / 待联调：008g 已满员，不能证明 `playerCount > joinedCount` 的空态 slot，也不能证明新用户点击分享链接后 `joinedCount` 增加。需接口 / 后端提供 open-slot seed 与 cleanup / 回滚方式后再测。 |
| 退回对象 | 本轮邀请卡、满员头像 slot、刷新、分享 path 不退前端；空槽填充和新用户加入样本缺口退接口 / 后端准备 `prcs-008ag-invite-open-slot` 或等价安全样本。 |
| 禁止结论 | 不写真机通过、上线通过、全链路通过、UIUX 通过；不扩大到创建页 008AE / 008AF、账本、分享回流、相册矩阵。 |

#### 13.16.105 `PR-QA-LINK-CLEANUP-008AH-INVITE-OPEN-SLOT-RETEST-STANDBY` 2026-06-19 邀请空槽 / 新用户加入刷新待命门禁

记录时间：2026-06-19。PM 追加 008AH 待命门禁。008AG 满员样本已在 13.16.104 收口：008g 下邀请卡、3 个已填充头像 slot、刷新、分享入口可用；剩余缺口只剩 `playerCount > joinedCount` 的空态头像槽，以及新用户加入后刷新填充。本节只登记待命；接口联调 `PR-INT-LINK-CLEANUP-008AH-INVITE-OPEN-SLOT-SAMPLE` 找到可复用 open-slot 样本，或后端 / API 交付可回滚补样前，不执行 DevTools，不复测 008g 满员样本，不写空槽通过。

##### 13.16.105.1 解阻准入

| 依赖 | 准入要求 |
| --- | --- |
| 接口联调 008AH | 必须提供 open-slot 样本：`sessionId`、`inviteCode`、`playerCount`、`joinedCount`，且满足 `playerCount > joinedCount`；给出当前已加入玩家摘要、未加入空槽数量、可安全读取的 token 尾号。 |
| 新用户加入验证 | 若要验证“好友点击后加入”，必须提供未入局新用户身份 / token、分享链接或 join 请求合同、cleanup / 回滚方式；否则只能验证空槽显示，不执行写入。 |
| 测试侧准入 | 只测邀请页空槽和新用户加入后刷新填充两点；不重复 008AG 已通过的满员卡片 / 分享 / 刷新矩阵，不清 Storage、不重启 DevTools、不扩大到创建页、账本、分享回流、相册。 |

##### 13.16.105.2 解阻后单点复测矩阵

| 用例 | 页面 / 操作 | data keys | 截图基线 | 通过标准 | 退回对象 |
| --- | --- | --- | --- | --- | --- |
| 008AH-open-slot-visible | 打开 `/pages/invite-group/index?sessionId=<open-slot sessionId>`。 | `sessionId,inviteCode,playerCount,joinedCount,joinStatusPlayers,joinedPlayers,avatarSlots,errorText,loading`；storage 只记 API base、profileId、token 后 8 位。 | `docs/runtime/pr-qa-link-cleanup-008ah-open-slot-visible-20260619.png` | `avatarSlots.length === playerCount`；已加入 slot 数量等于 `joinedCount` / joined players；未加入位置显示空态头像；页面无 raw/debug/接口字段，无照片 / 账本厚模块回潮，Console 无红错。 | slot 数量不等于人数、空槽不显示或已加入未填充退前端；接口计数不一致退接口 / 后端。 |
| 008AH-new-user-join-refresh | 仅在有安全新用户身份和 cleanup / 回滚方式时执行分享链接进入或 `POST /sessions/join` 等价合同；随后点击“刷新状态”。 | `joinedCount,joinStatusPlayers,joinedPlayers,avatarSlots,inviteStatus,joinResult,errorText`。 | `docs/runtime/pr-qa-link-cleanup-008ah-new-user-join-refresh-20260619.png` | 新用户加入后 `joinedCount` 增加，原空态 slot 被新头像 / 昵称首字填充；刷新后 data 不清空，Console 无红错；执行后按接口联调要求恢复或记录残留。 | 无安全身份 / cleanup 则标阻塞，不执行；加入失败退接口 / 后端；加入成功但 UI 不填槽或刷新不更新退前端。 |

##### 13.16.105.3 当前结论

| 项目 | 结论 |
| --- | --- |
| 当前状态 | 待命 / 阻塞于接口联调 008AH open-slot 样本或后端 / API 可回滚补样。 |
| 不能复用的证据 | 008g 满员样本 `playerCount=3/joinedCount=3` 只能证明满员头像列，不能证明空态头像槽，也不能证明新用户加入后刷新填充。 |
| 禁止结论 | 无 open-slot 样本、无新用户身份、无 cleanup / 回滚方式时，只写阻塞；不得用 008g 满员样本伪造空槽通过；不写真机、上线或全链路通过。 |

#### 13.16.106 `PR-QA-LINK-CLEANUP-008AI-INVITE-SHARE-BUTTON-LAYOUT-RETEST` 2026-06-19 邀请页分享按钮布局待测门禁

记录时间：2026-06-19。PM 预派 008AI：用户反馈邀请页分享按钮破界，要求分享按钮改为微信绿色、带分享图标、下置独占一行并适当放大。前端任务为 `PR-FE-LINK-CLEANUP-008AI-INVITE-SHARE-BUTTON-LAYOUT-FIX`。本节只登记待测门禁；前端 008AI 回包前，不执行 DevTools，不复测旧版本，不写页面通过。

##### 13.16.106.1 前端回包准入

| 依赖 | 准入要求 |
| --- | --- |
| 前端 008AI | 必须说明 `miniprogram/pages/invite-group/index.wxml`、`index.less`、必要时 `index.ts` 的改动；分享按钮下置独占一行，与“复制口令 / 刷新状态”分行；按钮为微信绿色、白字、带分享图标、明显放大；保留 `open-type="share"`。 |
| 静态验证 | 前端需提供 `typecheck`、`check:encoding`、目标 diff check；不得恢复照片 / 账本厚模块、保存海报、群分享网格或旧厚说明。 |
| 测试侧准入 | 仅在前端 008AI 回包后执行邀请页按钮布局单点复测；不清 Storage、不重启 DevTools、不重复 008AG 已通过的头像槽 / 刷新 / 分享合同矩阵，不扩大到 008AE / 008AF、账本、分享回流、相册。 |

##### 13.16.106.2 解阻后单点复测矩阵

| 用例 | 页面 / 操作 | data keys | 截图基线 | 通过标准 | 退回对象 |
| --- | --- | --- | --- | --- | --- |
| 008AI-share-button-layout | 打开 008g `/pages/invite-group/index?sessionId=session-1781787045680-8e406c`。 | `sessionId,inviteCode,playerCount,joinedCount,avatarSlots,sessionName,errorText,loading`；storage 仅记 API base、profileId、token 后 8 位。 | `docs/runtime/pr-qa-link-cleanup-008ai-share-button-layout-390-20260619.png`；如能切 375 宽，再补 `docs/runtime/pr-qa-link-cleanup-008ai-share-button-layout-375-20260619.png`。 | “复制口令 / 刷新状态”与“分享给好友”分行；分享按钮下置独占一行，为微信绿色、白字、带分享图标、明显放大；375 / 390 宽不横向溢出，不遮挡底部“拍第一张”；Console 无阻塞红错。 | 分享按钮仍破界、未分行、未独占、非微信绿色、无图标、遮挡底部 CTA 或布局溢出退前端 / UIUX。 |
| 008AI-share-button-open-type | 点击分享按钮一次。 | `sessionId,inviteCode,playerCount,joinedCount,avatarSlots,errorText`。 | 可复用布局截图，必要时补 `docs/runtime/pr-qa-link-cleanup-008ai-share-button-tap-20260619.png`。 | `open-type=share` 仍可触发 tap，Console 无红错；只验证按钮可点，不重复 008AG 分享 path 合同，不伪造微信好友面板或好友加入。 | tap 后 Console 红错、按钮不可点、`open-type=share` 丢失退前端。 |

##### 13.16.106.3 当前结论

| 项目 | 结论 |
| --- | --- |
| 当前状态 | 待测 / 阻塞于前端 008AI 回包。 |
| 已知问题 | 用户反馈邀请页“分享给好友”按钮破界；旧 008AG 通过的是功能与合同，不代表按钮布局通过。 |
| 禁止结论 | 前端 008AI 回包前不得复测旧版本；不写真机、上线、全链路通过；不重复 008AG 满员头像槽 / 刷新 / 分享合同矩阵。 |

#### 13.16.107 `PR-QA-LINK-CLEANUP-008AI-INVITE-SHARE-BUTTON-LAYOUT-RETEST-RUN` 2026-06-19 邀请页分享按钮布局单点复测记录

记录时间：2026-06-19。PM 正式放行 008AI 单点复测。本轮只复测 008g 邀请页分享按钮布局和 tap；不重复 008AG 头像槽 / 刷新 / 分享合同矩阵，不清 Storage、不重启 DevTools，不写真机 / 上线 / 全链路通过。

##### 13.16.107.1 回包准入确认

| 依赖 | 读取结论 |
| --- | --- |
| 前端 14.81 | `复制口令 / 刷新状态` 保留为上方 2 列；`分享给好友` 拆到下方独占一行，保留 `open-type="share"`；按钮微信绿 `#07c160`、白字、54px 高、16px 字号，复用 `.invite-icon-wechat` 作为左侧图标。 |

##### 13.16.107.2 storage / page 前置

| 项目 | 记录 |
| --- | --- |
| 脱敏 status 命令 | `@' ... miniprogram-automator getStorageSync(runtime-api-base,jzp-user-token,social-current-profile-id,social-current-profile) ... '@ | node -` |
| status 结果 | page=`pages/invite-group/index`，query `sessionId=session-1781787045680-8e406c`；`runtime-api-base=http://127.0.0.1:3221/api/v1`，profileId=`user-1781787045679-f3f2eb`，profileName=`聚会记录师成员A`，tokenPresent=`true`，token 后 8 位 `b8615971`。 |
| relaunch 命令 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/invite-group/index?sessionId=session-1781787045680-8e406c" --wait 3000 --data sessionId,inviteCode,playerCount,joinedCount,joinStatusText,avatarSlots,sessionName,errorText,loading` |
| relaunch data | page=`pages/invite-group/index`，query `sessionId=session-1781787045680-8e406c`；`inviteCode=J2BEL2`，`sessionName=周末聚会记录`，`playerCount=3`，`joinedCount=3`，`joinStatusText=3/3 位好友已加入`，`avatarSlots.length=3` 且三项均 `filled=true`。Console 仅 info `[session-exit] enableAlertBeforeUnload enabled`，无 error / warn。 |

##### 13.16.107.3 布局与 tap 复测

| 项目 | 记录 |
| --- | --- |
| 截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008ai-share-button-layout-390-20260619.png -Mode right` |
| 截图路径 | `docs/runtime/pr-qa-link-cleanup-008ai-share-button-layout-390-20260619.png`，脚本返回 `width=410,height=1032`。 |
| 截图观察 | 右侧预览中 `复制口令 / 刷新状态` 位于上方同一行两列；`分享给好友` 位于下方独占一行；按钮为微信绿色、白字、左侧带微信图标，尺寸明显大于上方两个次级按钮；未横向溢出，未遮挡底部橙色“拍第一张”CTA。 |
| tap 命令 | `node scripts/wechat-devtools-automator.js tap --port 9420 --selector ".invite-share-button" --wait 1500 --data sessionId,inviteCode,playerCount,joinedCount,joinStatusText,avatarSlots,sessionName,errorText,loading` |
| tap 结果 | tap 成功，page 仍为 `pages/invite-group/index`；`inviteCode=J2BEL2`，`sessionId=session-1781787045680-8e406c`，`playerCount=3`，`joinedCount=3`，`avatarSlots.length=3`；Console `[]`。DevTools automator 未提供微信好友面板可验证状态，本轮不伪造面板通过。 |

##### 13.16.107.4 当前判定

| 项目 | 结论 |
| --- | --- |
| 分享按钮布局 | 预览框阶段通过：分享按钮已与复制 / 刷新分行，下置独占一行，微信绿色、白字、带图标、尺寸放大；右侧预览未见横向溢出或遮挡底部“拍第一张”。 |
| open-type tap | 预览框阶段通过：`.invite-share-button` tap 成功，Console `[]`。微信好友面板无法由当前 automator 证明，不写好友面板通过。 |
| 退回对象 | 本轮不退前端 008AI；不涉及 008AH 空槽样本和新用户加入缺口。 |
| 禁止结论 | 不写真机通过、上线通过、全链路通过、UIUX 通过；不重复 008AG 头像槽 / 刷新 / 分享合同矩阵。 |

#### 13.16.108 `PR-QA-LINK-CLEANUP-008AJ-INVITE-CODE-BOOKMARK-PAPER-RETEST` 2026-06-19 邀请房间码卡片书签纸页视觉待测门禁

记录时间：2026-06-19。PM 预派 008AJ：邀请好友页 / 房间码卡片背景应为书签纸页 / 纸质邀请卡效果，右下角有轻微卷起；同时不能影响口令、加入状态、头像槽、复制 / 刷新、微信绿分享按钮和“拍第一张”CTA。本节只登记待测门禁；UI/UX 与前端 008AJ 回包前，不执行 DevTools，不复测旧版本，不写页面通过。

##### 13.16.108.1 回包准入

| 依赖 | 准入要求 |
| --- | --- |
| UI/UX 008AJ | 必须给出书签纸页 / 纸质邀请卡视觉标准：纸张背景层、右下角轻微卷起、阴影 / 纹理 / 留白边界、在 390 宽右侧预览框下的可读性要求；说明哪些视觉问题属于退回。 |
| 前端 008AJ | 必须说明 `miniprogram/pages/invite-group/index.wxml`、`index.less`、必要时资源文件的改动；房间码卡片实现纸张背景和右下角卷起；不得遮挡房间码、加入状态、头像 slot、复制 / 刷新、分享按钮或底部 CTA。需提供 `typecheck`、`check:encoding`、目标 diff check。 |
| 测试侧准入 | 仅在 UI/UX 与前端均回包后执行 008AJ 单点复测；不清 Storage、不重启 DevTools、不扩大到首页 / 账本 / 相册 / 分享页全矩阵。 |

##### 13.16.108.2 解阻后单点复测矩阵

| 用例 | 页面 / 操作 | data keys | 截图基线 | 通过标准 | 退回对象 |
| --- | --- | --- | --- | --- | --- |
| 008AJ-code-card-paper-visual | 打开 008g `/pages/invite-group/index?sessionId=session-1781787045680-8e406c`，390 宽微信开发者工具右侧预览框截图。 | `sessionId,inviteCode,playerCount,joinedCount,joinStatusText,avatarSlots,sessionName,errorText,loading`；storage 仅记 API base、profileId、token 后 8 位。 | `docs/runtime/pr-qa-link-cleanup-008aj-invite-code-bookmark-paper-390-20260619.png`。 | 房间码卡片有明确书签纸页 / 纸张背景，右下角轻微卷起可见；房间码、好友加入状态、头像 slot 仍可读；背景不压字、不遮挡、不破界；Console 无红错。 | 纸张效果不明显、卷角缺失、压字遮挡或卡片破界退前端 / UIUX；截图工具异常只记录错误原文，不直接退前端视觉。 |
| 008AJ-share-button-not-occluded | 同页检查 008AI 分享按钮区域。 | 同上。 | 可复用 008AJ 截图，必要时补 `docs/runtime/pr-qa-link-cleanup-008aj-share-button-not-occluded-20260619.png`。 | 分享按钮仍为微信绿色、白字、带图标、下置独占一行；不被纸张卷页、卡片阴影或背景层遮挡；不遮挡底部“拍第一张”。 | 分享按钮被遮挡、变形、破界或颜色 / 图标回退，退前端 / UIUX。 |

##### 13.16.108.3 当前结论

| 项目 | 结论 |
| --- | --- |
| 当前状态 | 待测 / 阻塞于 UI/UX 与前端 008AJ 回包。 |
| 与既有通过项关系 | 13.16.104 已通过邀请卡功能；13.16.107 已通过分享按钮布局。008AJ 只补房间码卡片纸张 / 卷角视觉，不重复头像槽 / 刷新 / 分享合同矩阵。 |
| 禁止结论 | 不写真机通过、上线通过、全链路通过；不扩大到首页、账本、相册、分享页全矩阵。 |

#### 13.16.109 `PR-QA-LINK-CLEANUP-008AK-NATIVE-SHARE-CARD-THUMB-RETEST` 2026-06-19 原生分享卡片缩略图待测门禁

记录时间：2026-06-19。PM 追加 008AK：用户截图指出微信原生“发送给好友”弹窗里的分享卡片预览，不能继续显示默认小程序缩略图，应显示书签纸页背景，并包含邀请码和头像 slot / 已加入头像。本节只登记待测门禁；UI/UX 与前端 008AK 回包前，不执行 DevTools，不复测旧版本，不写页面通过。

##### 13.16.109.1 回包准入

| 依赖 | 准入要求 |
| --- | --- |
| UI/UX 008AK | 必须给出原生分享卡片缩略图视觉标准：书签纸页 / 右下角卷起、邀请码区域、头像 slot / 已加入头像在缩略图中的可识别范围，以及与 008AJ 页面卡片视觉的一致性要求。 |
| 前端 008AK | 必须说明 `invite-group` 分享卡片缩略图的生成 / 绑定方式，例如 `onShareAppMessage().imageUrl`、本地临时图、canvas 或静态资源；分享标题和 path 不得回退，path 仍需带 `inviteCode` 与 `sessionId`；提供 `typecheck`、`check:encoding`、目标 diff check。 |
| 测试侧准入 | 仅在 UI/UX 与前端均回包后执行原生分享卡片缩略图单点复测；不清 Storage、不重启 DevTools、不扩大到首页 / 账本 / 相册 / 分享页全矩阵。 |

##### 13.16.109.2 解阻后单点复测矩阵

| 用例 | 页面 / 操作 | data / 证据 | 截图基线 | 通过标准 | 退回对象 |
| --- | --- | --- | --- | --- | --- |
| 008AK-native-share-thumb | 打开邀请好友页，点击微信绿色“分享给好友”，观察原生“发送给好友”弹窗里的分享卡片缩略图。 | 记录 `sessionId,inviteCode,sessionName,shareTitle,sharePath,shareImageUrl/imageUrl` 或前端实际字段；Console 摘要；storage 只记 API base、profileId、token 后 8 位。 | 若工具可截原生弹窗：`docs/runtime/pr-qa-link-cleanup-008ak-native-share-card-thumb-20260619.png`；若 automator 无法截图原生弹窗，记录工具限制，并优先给人工截图 / 右侧预览旁证路径。 | 缩略图能看出书签纸页 / 右下角卷起视觉，并包含邀请码区域和头像 slot / 已加入头像；不再是默认小程序白底小缩略图；Console 无红错。 | 缩略图仍为默认小程序图、缺书签纸页、缺邀请码或头像槽退前端 / UIUX；截图工具无法捕获只记工具限制，不伪造通过。 |
| 008AK-share-title-path | 同次分享触发后核对标题和 path。 | 源码 / page data / automator 证据证明 `path` 带 `inviteCode` 与 `sessionId`，标题仍为邀请语义。 | 可复用缩略图截图；必要时补 `docs/runtime/pr-qa-link-cleanup-008ak-share-title-path-20260619.png`。 | 分享标题不回退，path 仍含 `inviteCode` 与 `sessionId`；不影响 008AI `open-type=share` tap。 | path 缺参、标题退回默认或 `imageUrl` 未绑定缩略图退前端。 |

##### 13.16.109.3 当前结论

| 项目 | 结论 |
| --- | --- |
| 当前状态 | 待测 / 阻塞于 UI/UX 与前端 008AK 回包。 |
| 与既有通过项关系 | 13.16.107 仅确认邀请页绿色分享按钮布局和 tap；不代表微信原生发送弹窗里的分享卡片缩略图通过。 |
| 工具限制 | 如 automator 无法截图原生弹窗，必须记录限制原文，优先使用人工截图或右侧预览旁证；不得因此伪造通过。 |
| 禁止结论 | 不写真机通过、上线通过、全链路通过；不重复首页、账本、相册、分享页全矩阵。 |

#### 13.16.110 `PR-QA-LINK-CLEANUP-008AJ/008AK-STANDBY-AFTER-UX-ASSETS` 2026-06-19 UI/UX 资产回包后待前端合并实现

记录时间：2026-06-19。PM 补充：UI/UX 已回包 008AJ / 008AK 资产，前端已收到合并实现任务 `PR-FE-LINK-CLEANUP-008AJ-008AK-BOOKMARK-CARD-AND-NATIVE-SHARE-THUMB-INTEGRATE`，但前端尚未回包实现。本节仅同步待测状态；前端合并实现回包前，不执行 DevTools，不复测旧版本，不写页面通过。

##### 13.16.110.1 UI/UX 资产准入更新

| 资产 | 路径 / 规格 | 测试用途 |
| --- | --- | --- |
| 008AJ 邀请码卡片背景 | `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008aj-invite-bookmark-card-750x420.png`，`750x420`；源文件 `pr-cs008aj-invite-bookmark-card-source.svg`。 | 用于 `.invite-code-card` 页面内书签纸页背景、右下角轻微卷起、安全区可读性复测。 |
| 008AK 原生分享卡缩略图底图 | `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008ak-native-share-thumb-1000x800.png`，`1000x800`；源文件 `pr-cs008ak-native-share-thumb-source.svg`。 | 用于微信原生“发送给好友”分享卡缩略图底图 / canvas / `imageUrl` 生成复测。 |

##### 13.16.110.2 前端回包后串行复测范围

| 顺序 | 单点 | 页面 / 操作 | 通过标准 | 禁止扩大 |
| --- | --- | --- | --- | --- |
| 1 | 008AJ 页面内房间码卡片 | 打开 008g `/pages/invite-group/index?sessionId=session-1781787045680-8e406c`，390 宽右侧预览截图。 | `.invite-code-card` 有书签纸页背景，右下角轻微卷起；邀请码、加入状态、头像 slot 可读；微信绿分享按钮不被遮挡；Console 无红错。 | 不重复 008AG 满员头像槽 / 刷新 / 分享合同矩阵。 |
| 2 | 008AK 原生分享缩略图 | 同页点击微信绿“分享给好友”，观察微信原生“发送给好友”弹窗分享卡片缩略图。 | 缩略图不再默认白底小程序缩略图；可见书签纸页、邀请码区域、头像 slot / 已加入头像；分享标题和 path 不回退，path 含 `inviteCode` 与 `sessionId`；Console 无红错。 | 不扩大到首页、账本、相册、分享页全矩阵；如 automator 不能截原生弹窗，记录工具限制和人工截图需求，不伪造通过。 |

##### 13.16.110.3 当前结论

| 项目 | 结论 |
| --- | --- |
| 当前状态 | 008AJ / 008AK 继续待测；UI/UX 资产已回包，但前端合并实现未回包。 |
| 下一步责任 | 等前端 `PR-FE-LINK-CLEANUP-008AJ-008AK-BOOKMARK-CARD-AND-NATIVE-SHARE-THUMB-INTEGRATE` 提供实现文件、`typecheck`、`check:encoding`、目标 diff check 后，测试按 13.16.110.2 串行单点复测。 |
| 禁止结论 | 当前不得写 008AJ / 008AK 页面通过、真机通过、上线通过或全链路通过；不得提前跑旧版本。 |

#### 13.16.111 `PR-QA-LINK-CLEANUP-008AJ-008AK-BOOKMARK-CARD-AND-NATIVE-SHARE-THUMB-RETEST-RUN` 2026-06-19 页面书签卡 / 原生分享缩略图单点复测记录

记录时间：2026-06-19。PM 正式放行 008AJ / 008AK 单点复测。本轮只测页面内 `.invite-code-card` 和微信原生“发送给好友”弹窗分享卡片缩略图；不重复首页 / 账本 / 相册 / 分享页全矩阵，不写真机 / 上线 / 全链路通过。

##### 13.16.111.1 回包准入确认

| 依赖 | 读取结论 |
| --- | --- |
| 前端 14.84 | 页面内 `.invite-code-card` 已接入 `miniprogram/assets/party-recorder/pr-cs008aj-invite-bookmark-card-750x420.png`；新增隐藏 canvas `inviteShareCardCanvas`；`onShareAppMessage()` 返回 `shareCardImagePath || /assets/party-recorder/pr-cs008ak-native-share-thumb-1000x800.png`；分享 path 保持 `/pages/index/index?inviteCode=...&sessionId=...`。 |

##### 13.16.111.2 storage / page 前置

| 项目 | 记录 |
| --- | --- |
| 初始脱敏 status 命令 | `@' ... miniprogram-automator getStorageSync(runtime-api-base,jzp-user-token,social-current-profile-id,social-current-profile) ... '@ | node -` |
| 初始 status 结果 | 当前 DevTools storage 不是 008g：`runtime-api-base=""`，profileId=`user-1781294689996-6d192e`，profileName=`.Li`，token 后 8 位 `c6878c86`；当前页为 `pages/invite-group/index?sessionId=session-1781810796326-3d7d5a`。 |
| 最小 storage 切换命令摘要 | 从 private manifest `pr-int-link-cleanup-PRCS-20260618-008g-manifest.private.json` 读取 008g memberA token，只写入 `runtime-api-base`、`jzp-user-token`、`social-current-profile-id`、`social-current-profile` 四项；命令输出仅含 token 后 8 位，完整 token 未打印、未写入。 |
| 切换结果 | `runtime-api-base=http://127.0.0.1:3221/api/v1`，profileId=`user-1781787045679-f3f2eb`，profileName=`聚会记录师成员A`，token 后 8 位 `b8615971`。未清空 Storage、未重启 DevTools。 |
| relaunch 命令 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/invite-group/index?sessionId=session-1781787045680-8e406c" --wait 4000 --data sessionId,inviteCode,playerCount,joinedCount,joinStatusText,avatarSlots,sessionName,shareCardImagePath,errorText,loading` |
| relaunch data / 异常 | page=`pages/invite-group/index`，query `sessionId=session-1781787045680-8e406c`；但 page data 返回 `inviteCode=PNLGNK`、`sessionName=生'史'局`、`playerCount=5`、`joinedCount=1`、`joinStatusText=1/5 位好友已加入`、`avatarSlots.length=5`、`shareCardImagePath=http://tmp/xEGe-zZszKp0e87cc3b6e39a0c5aaf2ea8a3d0d9c566.png`。该数据与预期 008g `J2BEL2 / 3 of 3` 不一致，按样本数据漂移记录；本轮只把它作为 008AJ/008AK 视觉取证，不写 008g 业务样本通过。Console 仅 info `[session-exit] enableAlertBeforeUnload enabled`。 |

##### 13.16.111.3 008AJ 页面内房间码卡片复测

| 项目 | 记录 |
| --- | --- |
| 截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008aj-invite-code-bookmark-paper-390-20260619.png -Mode right` |
| 截图路径 | `docs/runtime/pr-qa-link-cleanup-008aj-invite-code-bookmark-paper-390-20260619.png`，脚本返回 `width=410,height=1032`。 |
| 截图观察 | 页面内房间码卡片呈浅纸质 / 书签卡背景，口令 `PNLGNK`、`1/5 位好友已加入` 和 5 个头像 slot 可读；微信绿“分享给好友”按钮仍下置独占一行，未被卡片遮挡，也未遮挡底部“拍第一张”。右下角卷起效果在 390 宽右侧预览中较轻、可见性偏弱，建议 UI/UX 最终接收时确认是否达到“轻微卷起”预期。 |
| 008AJ 判定 | 页面卡片文字 / 头像 / 分享按钮未被遮挡，可读性与按钮无遮挡通过；但书签纸页 / 右下角卷起效果在右侧预览里不够明确，退回前端 / UIUX 做视觉强化，不写 UIUX 通过。 |

##### 13.16.111.4 008AK 原生分享卡缩略图复测

| 项目 | 记录 |
| --- | --- |
| 分享源码 / path 核查命令 | `Get-Content -Path miniprogram/pages/invite-group/index.ts | Select-Object -Skip 136 -First 55` 与 `rg -n "shareCardImagePath|inviteShareCardCanvas|onShareAppMessage|imageUrl|inviteCode|sessionId" miniprogram/pages/invite-group/index.ts miniprogram/pages/invite-group/index.wxml` |
| 分享源码 / path 摘要 | `onShareAppMessage()` 返回标题 `${sessionName} 邀请你一起记录`，path 为 `/pages/index/index?inviteCode=${encodeURIComponent(this.data.inviteCode)}&sessionId=${encodeURIComponent(this.data.sessionId)}`，`imageUrl=this.data.shareCardImagePath || SHARE_CARD_FALLBACK_ASSET`；当前 page data 有 `shareCardImagePath=http://tmp/...png`。 |
| tap 命令 | `node scripts/wechat-devtools-automator.js tap --port 9420 --selector ".invite-share-button" --wait 2500 --data sessionId,inviteCode,playerCount,joinedCount,joinStatusText,avatarSlots,sessionName,shareCardImagePath,errorText,loading` |
| tap data | tap 成功，page 仍为 `pages/invite-group/index`；`sessionId=session-1781787045680-8e406c`，`inviteCode=PNLGNK`，`playerCount=5`，`joinedCount=1`，`avatarSlots.length=5`，`shareCardImagePath=http://tmp/xEGe-zZszKp0e87cc3b6e39a0c5aaf2ea8a3d0d9c566.png`；Console `[]`。 |
| 原生弹窗截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008ak-native-share-card-thumb-attempt-20260619.png -Mode right` |
| 原生弹窗截图 / 观察 | `docs/runtime/pr-qa-link-cleanup-008ak-native-share-card-thumb-attempt-20260619.png`。本次右侧预览成功截到微信原生“发送给好友”弹窗；分享卡片缩略图不再是默认小程序白底缩略图，缩略图中可见书签纸页背景、口令 `PNLGNK`、`1/5` 加入状态、头像 slot 和右下角卷页视觉。 |
| 008AK 判定 | 预览框阶段通过：原生分享弹窗缩略图已使用自定义书签纸页 / 头像 slot 卡片，`imageUrl` 有临时图路径，path 仍带 `inviteCode` 与 `sessionId`；未验证真实好友收到后的表现，不写真机 / 上线通过。 |

##### 13.16.111.5 当前判定

| 项目 | 结论 |
| --- | --- |
| 008AJ 页面内卡片 | 可读性和按钮无遮挡通过；书签纸页 / 右下角卷起效果不够明确，退回前端 / UIUX 做视觉强化。 |
| 008AK 原生分享缩略图 | 预览框阶段通过：原生“发送给好友”弹窗缩略图成功显示自定义书签纸页、邀请码区域、加入状态和头像 slot，不再是默认白底小程序缩略图；Console `[]`。该结论仅限当前 `PNLGNK / 1 of 5` 漂移样本，不写真机 / 上线 / 全链路通过。 |
| 样本数据漂移 | 本轮 path 指定 `session-1781787045680-8e406c`，但 page data 返回 `PNLGNK / 1 of 5 / 生'史'局`，与预期 008g `J2BEL2 / 3 of 3` 不一致；不影响本轮视觉接入判断，但不能写 008g 业务样本通过。建议接口 / PM 后续确认本地 store 是否被其他测试样本覆盖。 |
| 退回对象 | 008AK 不退前端；008AJ 视觉强化退回前端 / UIUX；样本漂移退接口联调 / PM 数据维护核查。 |
| 禁止结论 | 不写真机通过、上线通过、全链路通过、UIUX 通过；不扩大到首页、账本、相册、分享页全矩阵。 |

#### 13.16.112 `PR-QA-LINK-CLEANUP-008AL-INVITE-CODE-PAPER-CURL-RETEST` 2026-06-19 页面房间码纸页卷角强化待命门禁

记录时间：2026-06-19。PM 预派 008AL：测试 13.16.111 已确认 008AK 原生分享弹窗缩略图预览框阶段通过；008AJ 页面内房间码卡片可读性和按钮无遮挡通过，但书签纸页 / 右下角卷起效果不够明确，已退回 UI/UX / 前端强化。本节只登记待命门禁；UI/UX 与前端 008AL 回包前，不执行 DevTools，不复测旧版本，不写页面通过。

##### 13.16.112.1 回包准入

| 依赖 | 准入要求 |
| --- | --- |
| UI/UX 008AL | 必须基于 13.16.111 退回原因强化页面内房间码卡片书签纸页 / 右下角卷起视觉；在 390 宽右侧预览中卷角必须清楚可见，同时不得压住邀请码、加入状态、头像槽或分享按钮；需记录资产路径、尺寸、安全区和前端替换方式。 |
| 前端 008AL | 必须说明 `invite-group` 页面内 `.invite-code-card` 背景 / 必要样式替换文件；不得改分享 path、join 合同、头像槽数据结构、canvas 分享卡或恢复厚模块；提供 `typecheck`、`check:encoding`、目标 diff check。 |
| 测试侧准入 | 仅在 UI/UX 与前端均回包后执行 008AL 单点复测；不清 Storage、不重启 DevTools；禁止重复 008AK 原生分享弹窗、首页、账本、相册、分享页全矩阵。 |

##### 13.16.112.2 解阻后单点复测矩阵

| 用例 | 页面 / 操作 | data keys | 截图基线 | 通过标准 | 退回对象 |
| --- | --- | --- | --- | --- | --- |
| 008AL-paper-curl-visible | 打开 008g `/pages/invite-group/index?sessionId=session-1781787045680-8e406c`，390 宽右侧预览框截图。 | `sessionId,inviteCode,playerCount,joinedCount,joinStatusText,avatarSlots,sessionName,errorText,loading`；storage 仅记 API base、profileId、token 后 8 位。若仍出现样本漂移，记录实际 page data，不写 008g 业务样本通过。 | `docs/runtime/pr-qa-link-cleanup-008al-invite-code-paper-curl-390-20260619.png`。 | 页面内房间码卡片书签纸页和右下角卷起清楚可见；口令、加入状态、头像槽、复制 / 刷新、微信绿分享按钮、底部“拍第一张”仍可读、可点、不遮挡、不破界；Console 无红错。 | 卷角仍不明确、纸页感不足、压字、遮挡按钮或布局破界退前端 / UIUX；截图工具异常记录原文，不直接退视觉。 |

##### 13.16.112.3 当前结论

| 项目 | 结论 |
| --- | --- |
| 当前状态 | 待命 / 阻塞于 UI/UX 与前端 008AL 回包。 |
| 复测边界 | 008AL 只测页面内房间码卡片卷角强化；不重复 008AK 原生分享弹窗，不跑首页 / 账本 / 相册 / 分享页全矩阵。 |
| 禁止结论 | UI/UX 与前端未回包前不得提前跑旧版本；不写真机通过、上线通过或全链路通过。 |

#### 13.16.113 `PR-QA-LINK-CLEANUP-008AM-INVITE-PAPER-ASSET-EXACT-RETEST-RUN` 2026-06-19 邀请页纸页素材精确接入单点复测记录

记录时间：2026-06-19。PM 变更门禁：008AL 新卷角强化不再作为当前复测目标，改为 008AM 锁定 UI 指定纸页素材精确接入。本轮 PM 放行 008AM 运行态单点复测；只测邀请好友页页面内房间码卡片，不重复 008AK 原生分享弹窗，不跑首页 / 账本 / 相册 / 分享页全矩阵，不写真机 / 上线 / 全链路通过。

##### 13.16.113.1 回包准入与源码 / 资源核查

| 项目 | 记录 |
| --- | --- |
| 前端 14.86 读取 | `.invite-code-card` 背景改为 `#fff6e8 url("/assets/party-recorder/pr-cs008aj-invite-bookmark-card-750x420.png") center / 100% 100% no-repeat;`；`#fff6e8` 只作图片加载失败兜底，不覆盖 PNG；不改 `onShareAppMessage()`、分享 path、join 合同、头像槽 data 结构、分享 canvas、复制 / 刷新 / 拍第一张 CTA。 |
| 素材存在命令 | `Test-Path miniprogram/assets/party-recorder/pr-cs008aj-invite-bookmark-card-750x420.png; Get-Item miniprogram/assets/party-recorder/pr-cs008aj-invite-bookmark-card-750x420.png | Select-Object FullName,Length` |
| 素材结果 | 文件存在，路径 `miniprogram/assets/party-recorder/pr-cs008aj-invite-bookmark-card-750x420.png`，大小 `15274` bytes。 |
| CSS 扫描命令 | `rg -n "invite-code-card|pr-cs008aj|linear-gradient" miniprogram/pages/invite-group/index.less` |
| CSS 扫描结果 | `.invite-code-card` block 命中 `background: #fff6e8 url("/assets/party-recorder/pr-cs008aj-invite-bookmark-card-750x420.png") center / 100% 100% no-repeat;`；同文件其他位置仍有普通 `linear-gradient`，但本轮未见 `.invite-code-card` 使用覆盖式渐变主视觉。 |

##### 13.16.113.2 DevTools / storage / 页面运行记录

| 项目 | 记录 |
| --- | --- |
| 初始脱敏 status 命令 | `@' ... miniprogram-automator getStorageSync(runtime-api-base,jzp-user-token,social-current-profile-id,social-current-profile) ... '@ | node -` |
| 初始 status 结果 | 首次连接失败：`Failed connecting to ws://127.0.0.1:9420, check if target project window is opened with automation enabled`。 |
| 自动化恢复命令 | `pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420` |
| 自动化恢复结果 | `{"ok":true,"action":"started","port":9420,"cliPid":22288,"owningProcess":11304,"projectPath":"F:\\codexlist\\jiuzhuopanguan"}`。未清 Storage、未改业务源码。 |
| 恢复后脱敏 status | page=`pages/index/index`；storage `runtime-api-base=""`，profileId=`user-1781294689996-6d192e`，profileName=`.Li`，token 后 8 位 `9d105dc0`，不是 008g。 |
| 最小 008g storage 设置 | 从 private manifest 读取 008g memberA token，只写入 `runtime-api-base`、`jzp-user-token`、`social-current-profile-id`、`social-current-profile` 四项；公开只记录 token 后 8 位。 |
| 设置结果 | `runtime-api-base=http://127.0.0.1:3221/api/v1`，profileId=`user-1781787045679-f3f2eb`，profileName=`聚会记录师成员A`，token 后 8 位 `b8615971`。 |
| relaunch 命令 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/invite-group/index?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2" --wait 4000 --data sessionId,inviteCode,playerCount,joinedCount,joinStatusText,avatarSlots,sessionName,errorText,loading` |
| relaunch data | page=`pages/invite-group/index`，query `sessionId=session-1781787045680-8e406c,inviteCode=J2BEL2`；但 page data 为 `sessionId=""`、`inviteCode=""`、`playerCount=0`、`joinedCount=0`、`joinStatusText=等待好友加入`、`avatarSlots=[]`、`sessionName=""`；Console `[]`。 |
| local API 核查命令 | `Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:3221/api/v1/sessions/live?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2' -TimeoutSec 8` |
| local API 结果 | `ok=false`，错误原文：`由于目标计算机积极拒绝，无法连接。 (127.0.0.1:3221)`，类型 `System.Net.Http.HttpRequestException`。 |

##### 13.16.113.3 008AM 页面截图与判定

| 项目 | 记录 |
| --- | --- |
| 截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008am-invite-paper-asset-exact-empty-20260619.png -Mode right` |
| 截图路径 | `docs/runtime/pr-qa-link-cleanup-008am-invite-paper-asset-exact-empty-20260619.png`，脚本返回 `width=410,height=1032`。 |
| 截图观察 | 右侧预览显示邀请页“生成中 / 等待好友加入”空态；房间码卡片区域仍像浅色块，UI 纸页素材细节不够清晰，未达到用户验收；复制 / 刷新、微信绿“分享给好友”和底部“拍第一张”可读、未被遮挡、未破界。因本地 API 3221 refused，实际口令、加入状态和头像槽未加载，不能验证 `J2BEL2` / joined players 数据态可读。 |
| 008AM 判定 | 退回：源码资源路径真实、素材文件存在、`.invite-code-card` 未用覆盖式渐变替代主视觉，但运行态视觉仍未达到用户验收，页面进入后仍像浅色块，不像 UI 纸页素材；不能写 008AM 通过。 |
| 退回对象 | 视觉退回前端新任务 `PR-FE-LINK-CLEANUP-008AO-INVITE-PAPER-REAL-IMAGE-LAYER`；数据加载环境阻塞退接口联调 / 后端恢复 `127.0.0.1:3221` local API 后复测数据态。 |
| 禁止结论 | 不写真机通过、上线通过、全链路通过；不重复 008AK 原生分享弹窗和全矩阵。 |

#### 13.16.113A `PR-QA-LINK-CLEANUP-008AO-INVITE-PAPER-REAL-IMAGE-LAYER-RETEST` 2026-06-19 邀请页真实图片图层待测门禁

记录时间：2026-06-19。PM 更新 008AM 判定：用户实测截图已退回视觉，不得把 008AM 写成通过。页面进入后纸页素材未达到用户验收，视觉仍像浅色块，不像 UI 纸页素材；同时本地 `127.0.0.1:3221` refused 只作为数据加载环境阻塞，不能掩盖视觉退回。PM 随后更新 008AO / 008AP 口径：用户指定最终纸页标准图为 `C:\Users\Administrator\AppData\Local\Temp\codex-clipboard-b8d36523-d972-4a9b-b39c-a805ab2e6170.png`。用户允许 UI/UX 为加载速率、包体大小和手机适配做压缩 / 尺寸调整，但压缩版或手机适配尺寸版必须由 UI/UX 008AP 确认并与标准图肉眼一致；不得重绘、换图或裁切。PM 现同步 UI/UX 008AP 已完成：固定验收图为 `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008ap-user-approved-invite-paper-mobile-750w-compressed.png`，尺寸 `750x400`，大小 `371,374 bytes`。后续继续等待前端 `PR-FE-LINK-CLEANUP-008AO-INVITE-PAPER-REAL-IMAGE-LAYER` 回包引用该固定路径后，再执行本测试任务；不得再使用 008AJ、008AL 或其他替代图作为通过依据。

##### 13.16.113A.1 回包准入

| 依赖 | 准入要求 |
| --- | --- |
| UI/UX 008AP | 已回包完成。固定验收图为 `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008ap-user-approved-invite-paper-mobile-750w-compressed.png`，尺寸 `750x400`，大小 `371,374 bytes`；该图为 UI/UX 确认的手机适配尺寸 / 压缩版固定资产，需与用户原始标准图 `C:\Users\Administrator\AppData\Local\Temp\codex-clipboard-b8d36523-d972-4a9b-b39c-a805ab2e6170.png` 肉眼一致，不改变构图、比例、透明区、顶部胶带、纸纹、圆角、右下角卷页。 |
| 前端 008AO | 必须说明邀请页房间码卡片使用真实 `<image>` 图层或等效稳定渲染方案的实现文件；目标素材必须引用 UI/UX 008AP 确认的固定验收图 `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008ap-user-approved-invite-paper-mobile-750w-compressed.png`；不得继续只依赖 CSS 背景造成素材细节被淡化；不得裁掉顶部胶带、纸张纹理、圆角、右下角大卷页或透明 / 留白区域；不得拉伸变形；不得改分享 path、join 合同、头像槽结构、原生分享缩略图或恢复厚模块；提供 `typecheck`、`check:encoding`、目标 diff check。 |
| 测试侧准入 | UI/UX 008AP 和前端 008AO 均回包前不复测旧版本；复测只看用户标准图 / 确认压缩版 / 确认手机适配尺寸版是否在右侧预览框真实显示且视觉不变形。若 `127.0.0.1:3221` 仍不可达导致“生成中”，只单列环境阻塞，不写视觉通过。 |

##### 13.16.113A.2 解阻后单点复测矩阵

| 用例 | 页面 / 操作 | data keys | 截图基线 | 通过标准 | 退回对象 |
| --- | --- | --- | --- | --- | --- |
| 008AO-real-image-layer | 打开推荐路径 `/pages/invite-group/index?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2`，390 宽右侧预览框截图，并与 UI/UX 008AP 固定验收图对照。 | `sessionId,inviteCode,playerCount,joinedCount,joinStatusText,avatarSlots,sessionName,errorText,loading`；storage 只记 API base、profileId、token 后 8 位。若数据仍因 3221 不可达为空，单列环境阻塞。 | `docs/runtime/pr-qa-link-cleanup-008ao-invite-paper-real-image-layer-390-20260619.png`；对照固定验收图：`docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008ap-user-approved-invite-paper-mobile-750w-compressed.png`（`750x400 / 371,374 bytes`）；原始用户标准图：`C:\Users\Administrator\AppData\Local\Temp\codex-clipboard-b8d36523-d972-4a9b-b39c-a805ab2e6170.png`。 | 真实 `<image>` 图层或等效稳定渲染方案稳定显示 UI/UX 008AP 固定验收图；手机适配后不需要过大，但必须等比或视觉不变形；顶部胶带、纸张纹理、圆角、右下角大卷页、透明 / 留白区域完整；不能裁掉卷角、胶带、圆角或透明 / 留白区域；口令、加入状态、头像槽、复制 / 刷新、微信绿分享按钮、底部“拍第一张”仍可读、不遮挡、不破界；Console 无红错。 | 使用 008AJ / 008AL / 其他替代图、未由 UI/UX 确认的前端自行压缩图或尺寸版、浅色块、CSS 近似、默认背景、样式蒙混，或出现拉伸变形、裁切、换图、重绘、卷角 / 胶带缺失、透明区被去掉、明显调色变样，退前端 / UIUX；数据仍“生成中”且 local API refused，退接口联调 / 后端环境，不掩盖视觉结论。 |

##### 13.16.113A.3 当前结论

| 项目 | 结论 |
| --- | --- |
| 当前状态 | UI/UX 008AP 固定验收图已回包；008AO 运行态已被用户退回，不得写通过。PM 重启邀请页截图 `docs/runtime/pr-pm-008ao-invite-paper-current.png` 显示当前页面已有 008AP 图层且 Console 无红错，但图外侧棋盘格明显可见，用户明确“不要棋盘格！裁切错误！”。 |
| 下一步 | UI/UX `PR-UX-LINK-CLEANUP-008AQ-INVITE-PAPER-NO-CHECKERBOARD-ASSET` 已完成；继续等待前端 `PR-FE-LINK-CLEANUP-008AQ-INVITE-PAPER-NO-CHECKERBOARD-INTEGRATE` 回包后，再执行 008AQ 单点复测。 |
| 禁止结论 | 不写真机通过、上线通过、全链路通过；不重复 008AK 原生分享弹窗或全矩阵。 |

#### 13.16.113B `PR-QA-LINK-CLEANUP-008AQ-INVITE-PAPER-NO-CHECKERBOARD-RETEST` 2026-06-19 邀请页纸页卡片去棋盘格待测门禁

记录时间：2026-06-19。PM 更新测试状态：008AO 运行态被用户退回，不再复测通过。PM 证据截图 `docs/runtime/pr-pm-008ao-invite-paper-current.png` 显示邀请页当前页面已有 008AP 图层且 Console 无红错，但图外侧棋盘格明显可见；用户明确反馈“不要棋盘格！裁切错误！”。PM 随后同步 UI/UX 008AQ 已完成，固定验收图为 `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008aq-invite-paper-mobile-750w-no-checkerboard.png`，规格 `750x400 / 371,857 bytes`，透明 PNG；PM 已核验边角 `alpha=0`，纸页主体、胶带、右下卷页像素存在。图片查看器显示透明区域棋盘格不等于 PNG 内真实棋盘格像素，测试应以微信开发者工具右侧预览框运行态和必要 alpha / 像素判断为准。本节只登记 008AQ 待测门禁，不执行 DevTools，不跑全矩阵。

##### 13.16.113B.1 回包准入

| 依赖 | 准入要求 |
| --- | --- |
| UI/UX 008AQ | 已回包完成。固定验收图为 `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008aq-invite-paper-mobile-750w-no-checkerboard.png`，规格 `750x400 / 371,857 bytes`，透明 PNG；PM 已核验边角 `alpha=0`，纸页主体、胶带、右下卷页像素存在。测试不得把图片查看器透明区域棋盘格误判为 PNG 内真实棋盘格像素。 |
| 前端 008AQ | 必须回包 `PR-FE-LINK-CLEANUP-008AQ-INVITE-PAPER-NO-CHECKERBOARD-INTEGRATE`：说明邀请页房间码卡片引用的真实 `<image>` 图层或等效稳定渲染方案、实现文件、资源路径和验证命令；不得继续显示棋盘格、裁切错误、CSS 近似、浅色兜底块或替代图；提供 `typecheck`、`check:encoding`、目标 diff check。 |
| 测试侧准入 | 前端 008AQ 回包前不复测旧版本；复测只看邀请页纸页卡片，不重复 008AK 原生分享弹窗、首页、账本、相册、分享页全矩阵。若 `127.0.0.1:3221` 仍不可达导致“生成中”，只作为数据环境问题单列，不影响视觉图层退回 / 通过判断。 |

##### 13.16.113B.2 解阻后单点复测矩阵

| 用例 | 页面 / 操作 | data keys | 截图基线 | 通过标准 | 退回对象 |
| --- | --- | --- | --- | --- | --- |
| 008AQ-no-checkerboard-paper | 打开邀请页推荐路径 `/pages/invite-group/index?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2`，390 宽右侧预览框截图，并与 UI/UX 008AQ 固定资产对照。 | `sessionId,inviteCode,playerCount,joinedCount,joinStatusText,avatarSlots,sessionName,errorText,loading`；storage 只记 API base、profileId、token 后 8 位；Console 摘要必须记录。必要时补 alpha / 像素判断摘要，区分查看器透明棋盘格与 PNG 真实棋盘格像素。 | `docs/runtime/pr-qa-link-cleanup-008aq-invite-paper-no-checkerboard-390-20260619.png`；对照 PM 退回证据 `docs/runtime/pr-pm-008ao-invite-paper-current.png` 和 UI/UX 008AQ 固定资产 `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008aq-invite-paper-mobile-750w-no-checkerboard.png`（`750x400 / 371,857 bytes`）。 | 微信开发者工具右侧预览框运行态不得出现真实棋盘格像素；纸页主体、顶部胶带、纸纹、圆角、右下卷页完整且位置正确；口令、头像槽、微信绿分享按钮、底部“拍第一张”CTA 可读、不遮挡、不破界；Console 无阻塞红错。若 3221 不可达导致邀请码“生成中”，单列数据环境阻塞，但视觉仍按图层是否无真实棋盘格 / 无裁切错误判定。 | 仍出现真实棋盘格像素、裁切错误、卷页 / 胶带缺失、透明 / 留白区域异常、浅色兜底块、CSS 近似或替代图，退前端 / UIUX；若只是图片查看器透明区域棋盘格且运行态 / alpha 证据证明 PNG 无真实棋盘格像素，不按棋盘格失败；若接口 3221 refused 或数据为空，只退接口联调 / 后端环境，不掩盖视觉结论。 |

##### 13.16.113B.3 当前结论

| 项目 | 结论 |
| --- | --- |
| 当前状态 | UI/UX 008AQ 固定验收图已回包；008AQ 继续待测 / 阻塞于前端 `PR-FE-LINK-CLEANUP-008AQ-INVITE-PAPER-NO-CHECKERBOARD-INTEGRATE` 回包；008AO 不得写通过。 |
| 禁止结论 | 不写真机通过、上线通过、全链路通过；不扩大到首页、账本、相册、分享页或原生分享弹窗矩阵。 |

#### 13.16.113C `PR-QA-LINK-CLEANUP-008AQ-INVITE-PAPER-NO-CHECKERBOARD-RETEST` 2026-06-19 邀请页纸页卡片去棋盘格运行态单点复测记录

记录时间：2026-06-19。PM 正式放行 008AQ 单点复测。本轮只测邀请页纸页卡片，不跑全矩阵，不测原生分享弹窗，不写真机 / 上线通过。

##### 13.16.113C.1 命令与证据

| 项 | 记录 |
| --- | --- |
| status 命令 | `node scripts/wechat-devtools-automator.js status --port 9420` |
| status 摘要 | `ok=true`；当前 page 初始为 `pages/invite-group/index?sessionId=session-1781756527692-d277f0`；Console=`[]`。 |
| 入包图核查 | `Get-Item docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008aq-invite-paper-mobile-750w-no-checkerboard.png, miniprogram/assets/party-recorder/pr-cs008aq-invite-paper-mobile-750w-no-checkerboard.png | Select-Object FullName,Length`；两处文件存在，入包图为前端 14.90 指定路径。 |
| relaunch 命令 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/invite-group/index?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2" --wait 3000 --data sessionId,inviteCode,playerCount,joinedCount,joinStatusText,avatarSlots,sessionName,errorText,loading,shareCardImagePath` |
| summary.page | `pages/invite-group/index`；query=`{sessionId:"session-1781787045680-8e406c",inviteCode:"J2BEL2"}`。 |
| page data 摘要 | `sessionId=""`，`inviteCode=""`，`playerCount=0`，`joinedCount=0`，`joinStatusText="等待好友加入"`，`avatarSlots=[]`，`sessionName=""`，`shareCardImagePath=""`。数据未进入目标 008g 满员态，不能写邀请业务通过。 |
| Console 摘要 | relaunch 返回 Console=`[]`，无阻塞红错。 |
| 右侧预览截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008aq-invite-paper-no-checkerboard-390-20260619.png -Mode right` |
| 右侧预览截图 | `docs/runtime/pr-qa-link-cleanup-008aq-invite-paper-no-checkerboard-390-20260619.png`，脚本返回 `width=410,height=1032`。 |
| storage 脱敏命令摘要 | 使用 `miniprogram-automator` 只读 `runtime-api-base`、`jzp-user-token`、`social-current-profile-id`、`social-current-profile`，公开记录只写 token 状态 / 尾号。 |
| storage 摘要 | page=`pages/invite-group/index?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2`；`runtime-api-base=http://127.0.0.1:3221/api/v1`；`profileId=user-1781787045679-f3f2eb`；`profileName=聚会记录师成员A`；`tokenPresent=false`，`tokenTail=""`。 |
| local API 连通性 | `Invoke-WebRequest -Uri 'http://127.0.0.1:3221/api/v1/config/home' -UseBasicParsing -TimeoutSec 5` 失败，原文：`由于目标计算机积极拒绝，无法连接。 (127.0.0.1:3221)`。 |
| alpha / 像素核查 | `node` 读取 `miniprogram/assets/party-recorder/pr-cs008aq-invite-paper-mobile-750w-no-checkerboard.png`：`width=750,height=400,bytes=371857`；四角 alpha 均为 `0`，center alpha=`255`；`transparent=67784`，`opaque=232216`。该证据用于区分图片查看器透明棋盘格与 PNG 真实棋盘格像素。 |

##### 13.16.113C.2 视觉与数据判定

| 检查项 | 结果 |
| --- | --- |
| 真实棋盘格像素 | 右侧预览框运行态未见真实棋盘格像素；入包 PNG 四角 alpha=0，未把查看器透明棋盘格当作 PNG 像素失败。 |
| 纸页主体 / 胶带 / 纸纹 / 圆角 / 右下卷页 | 截图中纸页主体、顶部胶带、纸纹、圆角和右下卷页可见，位置未见明显错位；未见 008AO 退回图中的外侧棋盘格。 |
| 文案 / 头像槽 / 分享按钮 / CTA | 因 token 缺失与 3221 refused，页面停在“生成中 / 等待好友加入”空态，无法验证真实口令、头像槽和加入状态；微信绿“分享给好友”和底部“拍第一张”CTA 可读、未遮挡、未破界。 |
| Console | `[]`，无阻塞红错。 |
| 数据环境 | `tokenPresent=false` 且 local `127.0.0.1:3221` refused，数据态阻塞；该阻塞不影响本轮纸页视觉图层的无棋盘格判定，但阻止邀请业务态通过。 |

##### 13.16.113C.3 当前结论

| 项目 | 结论 |
| --- | --- |
| 008AQ 纸页视觉图层 | `预览框阶段单点通过`：邀请页纸页卡片运行态未见真实棋盘格像素，纸页主体 / 胶带 / 纸纹 / 圆角 / 右下卷页可见，Console 无红错。 |
| 数据 / 业务态 | `数据环境阻塞`：storage token 缺失、local 3221 refused，导致 page data 为空态，不能写口令 / 头像槽 / 满员加入状态业务通过。 |
| 退回 / 下一步 | 接口联调 / 后端需恢复 local 3221 或提供可用 token/storage 后，再补真实口令、头像槽和加入状态数据态；前端 / UIUX 本轮不因纸页棋盘格退回。 |
| 禁止结论 | 不写真机通过、上线通过、全链路通过；不代表原生分享弹窗、首页、账本、相册或分享页通过。 |

#### 13.16.114 `PR-QA-LINK-CLEANUP-008AN-RECORD-LEDGER-TIMELINE-RETEST` 2026-06-19 记录 / 账本明线时间线待命门禁

记录时间：2026-06-19。PM 更新 008AN 等待口径：UI/UX 12.7.47 已回包目标图和 `pr-cs008an-*` 切图，接口联调 3.52 已回包数据合同，前端 14.91 已回包结构实现并通过静态验证；接口联调 3.53 已恢复本地 3221 并给出可用成员态数据环境。本节登记准入和复测口径，测试可按 3.53 执行 008AN 单点复测，不测旧版本。

##### 13.16.114.1 回包准入

| 依赖 | 准入要求 |
| --- | --- |
| UI/UX 008AN | 已回包：UI/UX 12.7.47 提供 `figma-13-record-ledger-timeline-008an.svg` 和 `pr-cs008an-*` 时间线轨道、照片节点、欠酒 / 加酒节点等切图资产；测试后续需按这些目标图 / 切图对照，不接受样式相似。 |
| 接口联调 008AN | 已回包：接口联调 3.52 确认 `sessionName`、成员态 timeline 照片节点和账本 event 节点合同；同时明确 `accountingHighlights/eventHighlights` 只是摘要，不能做明细时间线。缺 `operatorAvatarUrl/targetAvatarUrl` 和稳定二级排序字段需单列缺口。 |
| 前端 008AN | 已回包：前端 14.91 说明 `live-record` 新增 `recordTimelineItems`、接入 7 个 008AN SVG、保留账本 / 相册 / 分享结构，并提供 `typecheck`、`check:encoding`、目标 diff / no-index 检查。 |
| 测试侧准入 | 已具备：接口联调 3.53 提供可用成员态 local 3221、样本 query 和 token 尾号；不得把空态结构或样式相似写成 1:1 还原，必须对照 UI 图、切图证据和接口字段映射。 |

##### 13.16.114.2 解阻后单点复测矩阵

| 用例 | 页面 / 操作 | data keys | 截图基线 | 通过标准 | 退回对象 |
| --- | --- | --- | --- | --- | --- |
| 008AN-record-ledger-timeline | 打开接口联调指定记录 / 账本页 query，优先右侧预览框 390 宽截图。 | `sessionId,sessionName,recordTimelineItems,timelineNodes,photoNodes,ledgerTimelineItems,players,records,isJudge,ledgerEditable,errorText,loading`；逐项摘要 `recordTimelineItems[].nodeKind/type`，必须包含 `moment`、`drink_debt`、`drink_add`；storage 只记 API base、profileId、token 后 8 位。 | `docs/runtime/pr-qa-link-cleanup-008an-record-ledger-timeline-390-20260619.png`。 | 页面标题为真实酒局名 `sessionName`；记录页左侧明线时间线同时包含真实照片节点和账本欠酒 / 加酒变动节点；账本数据可读，权限仍正确；Console 无红错；视觉对照 UI 图 / 切图，不只按样式相似判通过。 | 标题为空或不是真实 `sessionName`、时间线节点缺真实照片或缺 `drink_debt/drink_add`、账本权限回退、Console 红错退前端 / 接口；视觉与 UI 图不符退 UIUX / 前端。 |

##### 13.16.114.3 当前结论

| 项目 | 结论 |
| --- | --- |
| 当前状态 | 已按接口 3.53 口径完成运行态单点复测；008AS 第一版已复测并退回，数据链路可用但 1:1 视觉和账本 tab 数据仍不达标，详见 13.16.114.9。 |
| 禁止结论 | 不写真机通过、上线通过、全链路通过；不得把样式相似写成 1:1 还原。 |

##### 13.16.114.4 前端 14.91 回包后的测试等待口径

| 项 | 记录 |
| --- | --- |
| 前端回包 | 14.91 已完成结构实现：`recordTimelineItems` 混排照片和账本 event，页头使用 `sessionName || 当前聚会`，记录 tab 接入 008AN 左侧明线 SVG 资产。 |
| 前端截图 | `docs/runtime/pr-fe-link-cleanup-008an-record-ledger-timeline.png`。 |
| 前端 data 摘要 | `sessionName=""`、`activeSegment="record"`、`recordTimelineItems=[]`、`photoNodes=[]`、`ledgerTimelineItems=[]`、`timelineNodes=[]`、`isJudge=false`。 |
| 测试限制 | 当前截图只能证明 008AN 空态结构渲染，不能证明真实照片节点、欠酒 / 加酒节点和真实酒局名落地。 |
| 下一步 | 按接口联调 3.53 口径执行本节单点复测。空态截图或样式相似不得写通过。 |

##### 13.16.114.5 接口 3.53 数据环境口径

| 项 | 记录 |
| --- | --- |
| API base | `http://127.0.0.1:3221/api/v1` |
| 本地服务 | 接口联调恢复本地 3221，当前监听 PID `17684`；日志 `docs/runtime/pr-int-link-cleanup-008an-data-env-recheck-3221.out.log` / `.err.log`。 |
| 推荐页面 | `/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=member`；独立账本辅助核查可用 `/pages/ledger/index?sessionId=session-1781787045680-8e406c&role=member`。 |
| 样本与 storage | `sessionId=session-1781787045680-8e406c`，`inviteCode=J2BEL2`，`profileId=user-1781787045679-f3f2eb`，token 后 8 位 `b8615971`；测试如需读取完整 token，只能从本地 storage / 数据文件内部读取，不得写入报告。 |
| 接口摘要 | `/sessions/live` 返回 `sessionName=周末聚会记录`；timeline `nodeCount=5`，带图照片节点 2，账本事件 2，包含 `drink_debt` 与 `drink_add`。 |
| 复测状态 | 008AN 单点复测已具备数据环境，不得继续按 data 空态阻塞；若 DevTools 仍空态，需记录 storage/API base/token 设置失败并退测试环境配置。 |

##### 13.16.114.6 `PR-QA-LINK-CLEANUP-008AN-RECORD-LEDGER-TIMELINE-RETEST` 2026-06-19 运行态单点复测记录

PM 正式放行 008AN 单点复测。本轮只测记录 / 账本页，不跑全矩阵，不写真机 / 上线通过。

| 项 | 记录 |
| --- | --- |
| local API 前置 | `Invoke-WebRequest -Uri 'http://127.0.0.1:3221/api/v1/config/home' -UseBasicParsing -TimeoutSec 5` 返回 `ok=true,status=200,length=673`。 |
| DevTools status | `node scripts/wechat-devtools-automator.js status --port 9420` 返回 `ok=true`；初始 page=`pages/live-record/index?sessionId=session-1781756527692-d277f0`；Console=`[]`。 |
| storage 设置 | 使用本地 private manifest `pr-int-link-cleanup-PRCS-20260618-008g-manifest.private.json` 定位 `profiles.memberA.token`，写入 DevTools storage；公开只记录 `tokenTail=b8615971`，未输出完整 token。 |
| storage 摘要 | `runtime-api-base=http://127.0.0.1:3221/api/v1`；`profileId=user-1781787045679-f3f2eb`；`profileName=聚会记录师成员A`；`tokenPresent=true`；`tokenTail=b8615971`。 |
| live-record relaunch 命令 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=member" --wait 4000 --data sessionId,sessionName,activeSegment,recordTimelineItems,photoNodes,ledgerTimelineItems,timelineNodes,players,records,isJudge,ledgerEditable,errorText,loading,timelineLoading` |
| summary.page | `pages/live-record/index`；query=`{sessionId:"session-1781787045680-8e406c",role:"member"}`。 |
| live-record data 摘要 | `sessionId=session-1781787045680-8e406c`；`sessionName=周末聚会记录`；`activeSegment=record`；`recordTimelineItems=4`，含 `nodeKind=moment` 照片 2 条、`type=debt` 欠酒 1 条、`type=drink` 加酒 1 条；`photoNodes=2`；`ledgerTimelineItems=2`；`timelineNodes=5`，含 `eventType=drink_debt` 和 `eventType=drink_add`；`players=3`；`isJudge=false`；`timelineLoading=false`。 |
| live-record Console | 仅 `[session-exit] enableAlertBeforeUnload enabled` info 日志 5 条，无阻塞红错。 |
| live-record 首屏截图 | `docs/runtime/pr-qa-link-cleanup-008an-record-ledger-timeline-390-20260619.png`；显示标题 `周末聚会记录`，记录 tab 左侧明线结构和照片节点可见。 |
| live-record 滚动截图 | 使用 automator 对 `.live-scroll` 执行 `scrollTo(0,650)` 后截图：`docs/runtime/pr-qa-link-cleanup-008an-record-ledger-timeline-ledger-nodes-390-20260619.png`；可见照片节点下方 `欠酒变动`、`加酒变动` 两个 008AN 样式节点，左侧明线和 008AN chip / icon 资产可见；不是旧厚列表、普通圆点、CSS border-left 或灰 badge。 |
| live-record 账本 tab 命令 | `node scripts/wechat-devtools-automator.js tap --port 9420 --path "/pages/live-record/index" --selector ".live-segment-tab[data-tab='ledger']" --selectorTimeout 8000 --wait 2500 --data activeSegment,sessionName,records,players,isJudge,ledgerEditable,ledgerTimelineItems,errorText,loading` |
| live-record 账本 tab data | `activeSegment=ledger`；`sessionName=周末聚会记录`；`records=3`；`players=3`；`isJudge=false`；`ledgerTimelineItems=2`，含欠酒 / 加酒各 1 条。截图 `docs/runtime/pr-qa-link-cleanup-008an-live-record-ledger-tab-390-20260619.png` 捕获到空白瞬间，不作为视觉通过证据。 |
| 独立账本 relaunch 命令 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/ledger/index?sessionId=session-1781787045680-8e406c&role=member" --wait 3500 --data sessionId,sessionName,players,stats,ledgerEventCount,ledgerEditable,isJudge,errorText,loading,hasSession` |
| 独立账本 data | page=`pages/ledger/index?sessionId=session-1781787045680-8e406c&role=member`；`sessionName=周末聚会记录`；`players=3`；stats=`成员 3 / 欠酒 1 / 加酒 1`；`ledgerEventCount=2`；`ledgerEditable=false`；`isJudge=false`；`hasSession=true`。 |
| 独立账本截图 | `docs/runtime/pr-qa-link-cleanup-008an-ledger-page-390-20260619.png`；可见成员、欠酒 / 加酒统计和 member 视角只读态。 |

| 检查项 | 结论 |
| --- | --- |
| 真实酒局名 | 通过：live-record 与独立 ledger 均为 `周末聚会记录`，不是空标题或 fallback。 |
| 照片 + 账本混排 | 通过：`recordTimelineItems` 同时包含真实照片节点 2、欠酒节点 1、加酒节点 1；滚动截图显示欠酒 / 加酒节点。 |
| UI/UX 008AN 对照 | 用户视觉退回：虽然当前截图中左侧明线、照片节点、欠酒 / 加酒节点、008AN SVG / chip 资产可见，但用户要求仍跟最新验收图 1:1，一次性使用 UI 给出的背景、顶部场景、炫光、时间线光轨、照片纸框、霓虹欠酒 / 加酒状态、底部拍照按钮等完整页面元素；当前页面不满足，不得写视觉通过。 |
| 账本权限 | 通过：memberA 视角 `isJudge=false`、`ledgerEditable=false`，独立账本 stats 为 `成员 3 / 欠酒 1 / 加酒 1`；未回退为可编辑 host 态。 |
| Console | 通过：无阻塞红错；仅 session-exit info 日志。 |
| 当前结论 | `数据链路可用 / 用户视觉退回`：真实酒局名、照片节点、欠酒 / 加酒节点、账本权限和 Console 证据可保留；008AN 视觉不得写通过，不代表真机、上线或全链路通过。 |
| 下一步 | UI/UX 008AT 已补真实 `周末聚会记录` 标题资产；前端 008AS 第一版已落地且 PM 静态核验通过。测试立即执行 `PR-QA-LINK-CLEANUP-008AS-RECORD-LEDGER-PIXEL-REDO-RETEST`；接口 / 后端继续保持 3221 与 008g 成员态样本可复跑。 |

##### 13.16.114.7 `PR-QA-LINK-CLEANUP-008AR/008AS-RECORD-LEDGER-PIXEL-REBUILD-GATE` 2026-06-19 用户视觉退回与待测门禁

PM 紧急暂停 / 退回当前 008AN 测试结论。用户给出新验收图 `C:\Users\Administrator\AppData\Local\Temp\codex-clipboard-f12866c8-21f4-427c-aafb-6fa051890f60.png`，要求记录 / 账本页仍跟上次做图一致，必须使用 UI 给出的所有页面元素，包括背景、顶部场景、炫光、按钮、状态等；如没有这些素材，需要 UI 根据设计图重新生成带资产包的界面，前端 1:1 复刻。

| 项 | 记录 |
| --- | --- |
| 退回原因 | 当前页面没有 1:1 使用用户图中的背景、顶部场景、炫光、时间线光轨、照片纸框、霓虹欠酒 / 加酒状态、底部拍照按钮等完整 UI 元素。 |
| 保留证据 | 13.16.114.6 的 data 证据只证明数据链路可用：`sessionName=周末聚会记录`、照片节点 2、欠酒 1、加酒 1、账本权限 member 只读、Console 无阻塞红错。 |
| 禁止结论 | 不得写 008AN 视觉通过、UIUX 通过、上线通过、真机通过或全链路通过；不得把 data 可用等同于视觉验收通过。 |
| UI/UX 008AR 准入 | UI/UX 必须基于用户新验收图回包完整资产包和对照说明，覆盖背景、顶部场景、炫光、时间线光轨、照片纸框、霓虹欠酒 / 加酒状态、底部拍照按钮等全部页面元素；不得只给局部 SVG 或口头说明。PM 已核验 12.7.51 主体资产包存在，但主体资产不能单独作为前端 008AS 准入全部完成。 |
| UI/UX 008AT 准入 | 已完成。真实 `sessionName=周末聚会记录` 标题资产为 `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008at-title-sample-zhoumojuhuijilu.png`，规格 `508x150 / 56,179 bytes / PNG colorType=6 / 左上角 RGBA [0,0,0,0]`；前端不得用普通文字、CSS 阴影、临时字体、`海边烧烤局` 设计样例名或其他标题图替代真实标题。 |
| 前端 008AS 准入 | 前端必须按 UI/UX 008AR 资产包和 008AT 标题资产 1:1 重做记录 / 账本页，说明实现文件、资源路径、布局还原点、data 字段映射和验证命令；提供 `typecheck`、`check:encoding`、目标 diff / no-index 检查。 |
| 后续复测 | 等前端 008AS 重做任务回包后，只做记录 / 账本页单点复测：核验真实标题必须是 `周末聚会记录` 且使用 008AT 标题图，不得出现 `海边烧烤局` 或普通文字标题；核验真实 data：照片节点、欠酒 / 加酒节点、账本权限、Console；同时对照用户验收图、`docs/design-assets/party-recorder/clean-slate-001/RECORD_LEDGER_ASSET_PACK_008AR.md`、008AT 标题图逐项检查背景、Hero、tab、时间线、拍立得、贴纸、霓虹欠酒 / 加酒、评论装饰、底部 CTA、状态包。不得扩大到邀请页、首页、相册、分享页全矩阵。 |

##### 13.16.114.8 `PR-QA-LINK-CLEANUP-008AS-RECORD-LEDGER-PIXEL-REDO-RETEST-RUN` 2026-06-19 PM 静态准入与测试执行令

| 项 | 记录 |
| --- | --- |
| 前端准入 | 前端 008AS 第一版已落地，但线程在最后 diff check 卡 `waitingOnApproval`；PM 只读补充核验通过，允许测试基于当前工作区版本执行单点复测。 |
| PM 静态核验 | `pr-cs008ar-*` 入小程序包 36 个；`pr-cs008at-title-sample-zhoumojuhuijilu.png` 存在；`live-record` 引用 32 个 008AR/008AT 资源且 missing=0；`typecheck`、`check:encoding`、目标 diff check 通过。 |
| 测试范围 | 只测 `pages/live-record/index` 记录 / 账本页；不得扩大到邀请页、首页、相册、分享页全矩阵。 |
| 必测项 | 真实标题“周末聚会记录”使用 008AT 标题图；背景、Hero、tab、发光时间线、拍立得、贴纸、霓虹欠酒 / 加酒、评论装饰、底部 CTA 和状态包按 008AR 呈现；照片节点、欠酒 / 加酒节点、账本权限和 Console 正常。 |
| 禁止结论 | 不得把 PM 静态核验、data 可用、旧 008AN 截图或前端自测写成视觉通过；不符合用户验收图时必须退回前端 / UIUX。 |

##### 13.16.114.9 `PR-QA-LINK-CLEANUP-008AS-RECORD-LEDGER-PIXEL-REDO-RETEST` 2026-06-19 运行态单点复测结果

本轮只测 `pages/live-record/index` 记录 / 账本页，不扩大到邀请页、首页、相册、分享页全矩阵，不写真机 / 上线通过。

| 项 | 记录 |
| --- | --- |
| 对照资料 | 用户验收图 `C:\Users\Administrator\AppData\Local\Temp\codex-clipboard-f12866c8-21f4-427c-aafb-6fa051890f60.png`；008AR 资产包 `docs/design-assets/party-recorder/clean-slate-001/RECORD_LEDGER_ASSET_PACK_008AR.md`；008AT 标题图 `miniprogram/assets/party-recorder/pr-cs008at-title-sample-zhoumojuhuijilu.png`。 |
| 静态核查 | `miniprogram/assets/party-recorder/pr-cs008ar-*` 共 36 个文件；008AT 标题图存在；`live-record` 引用 008AR / 008AT 资源；本轮静态只作准入，不作为视觉通过。 |
| local API 前置 | `Invoke-WebRequest -Uri 'http://127.0.0.1:3221/api/v1/config/home' -UseBasicParsing -TimeoutSec 5` 返回 `ok=true,status=200,length=673`。 |
| storage 设置 | 使用本地 private manifest 定位 008g memberA token，写入 DevTools storage；公开只记录 `tokenTail=b8615971`，未输出完整 token。 |
| storage 摘要 | `runtime-api-base=http://127.0.0.1:3221/api/v1`；`profileId=user-1781787045679-f3f2eb`；`profileName=聚会记录师成员A`；`tokenPresent=true`；`tokenTail=b8615971`。 |
| relaunch 命令 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=member" --wait 4500 --data sessionId,sessionName,titleImageSrc,memberCountText,startTimeText,activeSegment,recordTimelineItems,photoNodes,ledgerTimelineItems,timelineNodes,players,records,isJudge,ledgerEditable,errorText,loading,timelineLoading` |
| summary.page | `pages/live-record/index`；query=`{sessionId:"session-1781787045680-8e406c",role:"member"}`。 |
| page data 摘要 | `sessionName=周末聚会记录`；`titleImageSrc=/assets/party-recorder/pr-cs008at-title-sample-zhoumojuhuijilu.png`；`memberCountText=3/3 人`；`recordTimelineItems=4`，含照片 2、欠酒 1、加酒 1；`photoNodes=2`；`ledgerTimelineItems=2`；`timelineNodes=5`，含 `drink_debt` 与 `drink_add`；`isJudge=false`；`timelineLoading=false`。 |
| Console 摘要 | relaunch 返回 1 条 `[session-exit] enableAlertBeforeUnload enabled` info；无阻塞红错。 |
| 首屏截图 | `docs/runtime/pr-qa-link-cleanup-008as-record-ledger-pixel-hero-390-20260619.png`。 |
| 滚动截图 | automator 对 `.live-scroll` 执行 `scrollTo(0,720)` 后截图：`docs/runtime/pr-qa-link-cleanup-008as-record-ledger-pixel-ledger-nodes-390-20260619.png`。 |
| 账本 tab 命令 | `node scripts/wechat-devtools-automator.js tap --port 9420 --path "/pages/live-record/index" --selector ".live-segment-tab[data-tab='ledger']" --selectorTimeout 8000 --wait 2500 --data activeSegment,sessionName,titleImageSrc,records,players,isJudge,ledgerEditable,ledgerTimelineItems,errorText,loading` |
| 账本 tab data | `activeSegment=ledger`；`sessionName=周末聚会记录`；`titleImageSrc=/assets/party-recorder/pr-cs008at-title-sample-zhoumojuhuijilu.png`；`records=3`，但三位成员 `debtCount=0/drinkCount=0`；`players=3`；`isJudge=false`；`ledgerTimelineItems=2`。 |
| 账本 tab 截图 | `docs/runtime/pr-qa-link-cleanup-008as-record-ledger-pixel-ledger-tab-390-20260619.png`。 |

| 检查项 | 结果 |
| --- | --- |
| 标题资产 | data 层使用 008AT 标题图且未出现 `海边烧烤局`；但右侧预览里标题图过暗、可读性弱，和用户验收图中高亮大标题观感不一致，不能写视觉通过。 |
| 背景 / Hero / tab | 已出现 008AR 背景和 Hero 资源；但状态 pill 左侧被裁切，Hero 标题区域与验收图的高亮层级、炫光和空间节奏仍不一致。 |
| 时间线 / 拍立得 / 贴纸 | 照片节点、拍立得框、胶带 / 贴纸可见；但整体布局比验收图更扁、更挤，左侧发光时间线和节点仪式感不足，仍不满足 1:1。 |
| 霓虹欠酒 / 加酒 | 欠酒霓虹牌可见 `欠酒 +1`；加酒节点只显示空绿色霓虹框，没有 `加酒 +1` 文案，违反霓虹欠酒 / 加酒状态验收。 |
| 底部 CTA | 纸质 `继续拍照` CTA 可见；但与验收图的底部按钮层级仍需 UI/UX 复核。 |
| 账本 tab 数据 | 账本 tab 仍显示三位成员欠酒 / 加酒为 `0/0/0`，与 `ledgerTimelineItems=2` 和独立账本应有 `欠酒 1 / 加酒 1` 不一致；权限 member 只读态 `isJudge=false` 正常。 |
| Console | 无阻塞红错。 |
| 当前结论 | `退回前端 / UIUX`：data 链路可用、008AT 标题资源已接入、部分 008AR 资产已渲染，但视觉未达到用户验收图 1:1，且加酒霓虹牌 / 账本 tab 数据存在明确问题。不得写 008AS 视觉通过、真机通过、上线通过或全链路通过。 |
| 用户新增退回 | 2026-06-19 用户追加：记录的单个节点太大，会让用户感觉下滑太累；要求去掉外部框、元素缩小、调整布局。 |
| 下一步 | UI/UX `PR-UX-LINK-CLEANUP-008AU-RECORD-TIMELINE-COMPACT-DENSITY-SPEC` 已完成紧凑规格和 `加酒 +1` 资产；前端 `PR-FE-LINK-CLEANUP-008AV-RECORD-TIMELINE-COMPACT-REDO` 已完成静态实现并通过 PM 只读核验；测试立即做同一单点复测，重点看标题亮度 / 层级、Hero 裁切、发光时间线与节点、加酒霓虹牌文案、账本 tab 计数消费和节点密度。 |

##### 13.16.114.10 `PR-QA-LINK-CLEANUP-008AV-RECORD-TIMELINE-COMPACT-RETEST` 2026-06-19 紧凑节点待测门禁

| 项 | 记录 |
| --- | --- |
| 用户新增标准 | 记录页单个节点不能过大，不能让用户为了看 4 个节点长距离下滑；去掉外部框，元素缩小，布局更紧凑。 |
| 当前状态 | `sent`：UI/UX `PR-UX-LINK-CLEANUP-008AU-RECORD-TIMELINE-COMPACT-DENSITY-SPEC` 已回包，前端 `PR-FE-LINK-CLEANUP-008AV-RECORD-TIMELINE-COMPACT-REDO` 已完成静态实现并通过 PM 只读核验；测试现在执行 008AV 单点复测，不得继续测旧 008AS。 |
| 前端准入 | 已满足：前端 008AV 已按 UI/UX 12.7.53 和 `RECORD_LEDGER_ASSET_PACK_008AR.md` 第 7 节回包；已接入 `miniprogram/assets/party-recorder/pr-cs008au-neon-drink-plus1.png`，已按 UI/UX 12.7.53 删除外部框并缩小节点，`typecheck`、`check:encoding`、目标 diff check 均通过。不得测试旧 008AS。 |
| 必测项 | 390 宽预览框记录页首屏必须看到 Hero、Tab、1 个照片节点、1 个账本节点起始；一次正常滚动后必须连续看到 `照片 + 欠酒 + 加酒` 三类有效内容，不能四个节点拖成一整屏半；外部厚框消失；节点、拍立得、霓虹牌、文案和 CTA 缩小后不破界、不遮挡、不丢 data。 |
| 数据必测 | `recordTimelineItems` 仍含照片 2、欠酒 1、加酒 1；加酒霓虹牌不得空绿框，必须有可读 `加酒 +1` 或真实 delta；账本 tab 不得继续显示全员 `0/0/0`，需与 ledger event / 独立账本页一致；若仍不一致，退回前端 + 接口联调 + 后端/API。 |
| 标题 / Hero / pill | 标题必须更亮可读；状态 pill 左侧不得裁切；Hero 层级不能平暗。 |
| 证据要求 | 必须记录 390 宽首屏截图、下滑一屏截图、加酒牌截图 + event data 摘要、账本 tab 截图 + ledger data 摘要、Console 摘要。 |
| 禁止结论 | 不得把“缩小了 CSS 尺寸”直接写通过，必须看运行态截图、data 和 Console；不得扩大到其他页面矩阵。 |

##### 13.16.114.11 `PR-QA-LINK-CLEANUP-008AV-RECORD-TIMELINE-COMPACT-RETEST` 2026-06-19 运行态单点复测结果

本轮只测 `pages/live-record/index`，未扩大到邀请页、首页、相册、分享页或旧 008AS 矩阵；不写真机 / 上线 / 全链路通过。

| 项 | 记录 |
| --- | --- |
| local API 前置 | `Invoke-WebRequest -Uri 'http://127.0.0.1:3221/api/v1/config/home' -UseBasicParsing -TimeoutSec 5` 返回 `ok=true,status=200,length=673`。 |
| status 命令 | `node scripts/wechat-devtools-automator.js status --port 9420 --storage`。 |
| storage 摘要 | `runtime-api-base=http://127.0.0.1:3221/api/v1`；`profileId=user-1781787045679-f3f2eb`；`profileName=聚会记录师成员A`；`tokenPresent=true`；公开只记录 `tokenTail=b8615971`。 |
| status Console | `[]`。 |
| relaunch 命令 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=member" --wait 4500 --data sessionId,sessionName,titleImageSrc,activeSegment,recordTimelineItems,photoNodes,ledgerTimelineItems,timelineNodes,records,players,isJudge,ledgerEditable,errorText,loading,timelineLoading` |
| summary.page | `pages/live-record/index`；query=`{sessionId:"session-1781787045680-8e406c",role:"member"}`。 |
| page data 摘要 | `sessionName=周末聚会记录`；`titleImageSrc=/assets/party-recorder/pr-cs008at-title-sample-zhoumojuhuijilu.png`；`activeSegment=record`；`recordTimelineItems=4`，含照片 2、欠酒 1、加酒 1；`photoNodes=2`；`ledgerTimelineItems=2`；`timelineNodes=5`，含 `drink_debt=true` / `drink_add=true`；`records=3`；`isJudge=false`；`timelineLoading=false`。 |
| relaunch Console | 3 条 `[session-exit] enableAlertBeforeUnload enabled` info；无阻塞红错。 |
| 首屏截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008av-live-record-compact-first-390-20260619.png -Mode right` |
| 首屏截图 | `docs/runtime/pr-qa-link-cleanup-008av-live-record-compact-first-390-20260619.png`。 |
| 首屏观察 | 390 右侧预览可见 Hero、Tab 和 1 个照片节点，第二个照片节点起始露出；未达到“首屏必须看到 1 个照片节点 + 1 个账本节点起始”的密度标准。标题比 008AS 更可读，状态 pill 未见明显左侧裁切，但 Hero 层级仍偏平，需要 UI/UX 再确认。 |
| 滚动命令 | 对 `.live-scroll` 执行 `scrollTo(0,520)`：`node -` 脚本连接 `ws://127.0.0.1:9420`，输出 `{ok:true,action:"scrollTo",selector:".live-scroll",top:520}`。 |
| 下滑一屏截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008av-live-record-compact-scroll-390-20260619.png -Mode right` |
| 下滑一屏截图 | `docs/runtime/pr-qa-link-cleanup-008av-live-record-compact-scroll-390-20260619.png`。 |
| 下滑一屏观察 | 一次正常滚动后可连续看到照片节点、欠酒节点和加酒节点起始；加酒牌不再是空绿框。但照片 / 账本事件仍有明显暗色外层大卡和厚包裹感，底部 `继续拍照` CTA 遮住加酒节点下沿，仍不满足“去外部框、元素缩小、不遮挡”的用户新增标准。 |
| 加酒牌截图命令 | 对 `.live-scroll` 执行 `scrollTo(0,760)` 后运行 `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008av-live-record-add-neon-390-20260619.png -Mode right`。 |
| 加酒牌截图 | `docs/runtime/pr-qa-link-cleanup-008av-live-record-add-neon-390-20260619.png`。 |
| 加酒牌 / event data | `recordTimelineItems[3].type=drink`；`chipAsset=/assets/party-recorder/pr-cs008au-neon-drink-plus1.png`；`scoreText=1 杯`；截图可见 `加酒 +1`，该子项局部修复确认。 |
| 账本 tab 命令 | `node scripts/wechat-devtools-automator.js tap --port 9420 --selector ".live-segment-tab[data-tab='ledger']" --selectorTimeout 8000 --wait 2500 --data activeSegment,sessionName,titleImageSrc,records,players,isJudge,ledgerEditable,ledgerTimelineItems,errorText,loading,timelineLoading` |
| 账本 tab data | `activeSegment=ledger`；`records=3`：房主 `debtCount=0/drinkCount=0`，成员 A `debtCount=1/drinkCount=0`，成员 B `debtCount=0/drinkCount=1`；`ledgerTimelineItems=2`，含欠酒 1 和加酒 1；`isJudge=false`；`timelineLoading=false`。 |
| 账本 tab Console | `[]`。 |
| 账本 tab 截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008av-live-record-ledger-tab-390-20260619.png -Mode right` |
| 账本 tab 截图 | `docs/runtime/pr-qa-link-cleanup-008av-live-record-ledger-tab-390-20260619.png`。 |
| 账本 tab 观察 | 账本计数不再全员 `0/0/0`，与 timeline ledger event 一致；该子项局部修复确认。右侧截图左侧内容仍被预览裁到一部分，计数结论以 page data 为主。 |
| 当前结论 | `退回前端 / UIUX，局部修复确认`：数据链路、`加酒 +1` 固定图、账本 tab 计数和 Console 均已改善；但 390 首屏未露出账本节点起始，节点仍有明显外层大卡 / 厚包裹，底部 CTA 遮挡加酒节点边缘，未满足用户“单节点别太大、去掉外部框、下滑别累”的 008AU / 008AV 核心标准。不得写 008AV 预览框阶段通过、真机通过、上线通过或全链路通过。 |
| 下一步责任 | 前端 `PR-FE-LINK-CLEANUP-008AW-RECORD-TIMELINE-DENSITY-FRAME-CTA-FIX` 继续压缩记录节点与账本事件外层结构、删除外层暗色大卡 / 厚包裹、处理底部 CTA 与内容安全区遮挡；UI/UX 复核 Hero 层级、节点密度与外框删除是否符合 12.7.53；测试待前端回包后仅复测 `PR-QA-LINK-CLEANUP-008AW-RECORD-TIMELINE-DENSITY-FRAME-CTA-RETEST` 的 `live-record` 首屏 / 一次滚动 / 加酒牌 / 账本 tab。 |

##### 13.16.114.12 `PR-QA-LINK-CLEANUP-008AW-RECORD-TIMELINE-DENSITY-FRAME-CTA-RETEST` 2026-06-19 待前端回包门禁

| 项 | 记录 |
| --- | --- |
| 当前状态 | `sent`：前端 `PR-FE-LINK-CLEANUP-008AW-RECORD-TIMELINE-DENSITY-FRAME-CTA-FIX` 已回包并通过 PM 静态核验；测试现在可以执行 008AW 单点复测，不得重复跑 008AV，也不得扩大到首页、邀请、相册或分享矩阵。 |
| 前端准入 | 已满足：前端 14.96 说明只改首屏密度、外框删除和 CTA 遮挡三类失败，未回退 `加酒 +1` 固定资产和账本 tab 事件聚合计数；PM 只读复核 `typecheck`、`check:encoding`、目标 diff check 均通过，仅 LF/CRLF warning。 |
| 必测项 | 390 宽首屏必须看到 Hero、Tab、1 个照片节点和 1 个账本节点起始；一次滚动必须连续看到照片 + 欠酒 + 加酒；照片 / 账本事件不得再有外层暗色大卡或厚 padding wrapper；底部 CTA 不得遮挡加酒节点有效内容。 |
| 回归项 | `recordTimelineItems` 仍含照片 2、欠酒 1、加酒 1；`加酒 +1` 固定图仍可读；账本 tab 仍与 ledger event 一致，不得回退为全员 `0/0/0`；Console 无阻塞红错。 |
| 证据要求 | 390 首屏截图、一次滚动截图、加酒牌截图 + event data 摘要、账本 tab 截图 + ledger data 摘要、Console 摘要。 |
| 执行边界 | 只允许执行 008AW 的 `live-record` 单点复测；后续即使 008AW 通过，也只能写 `live-record` 单点预览框阶段结论，不写真机 / 上线 / 全链路通过。 |

##### 13.16.114.13 `PR-QA-LINK-CLEANUP-008AW-RECORD-TIMELINE-DENSITY-FRAME-CTA-RETEST` 2026-06-19 运行态单点复测结果

本轮只测 `pages/live-record/index`，未扩大到邀请页、首页、相册、分享页或旧 008AV / 008AS 矩阵；不写真机 / 上线 / 全链路通过。

| 项 | 记录 |
| --- | --- |
| 读取范围 | `docs/gameplay-moments-frontend-development-plan.md` 14.96；本计划 13.16.114.12。 |
| status 命令 | `node scripts/wechat-devtools-automator.js status --port 9420`。 |
| status 摘要 | 当前 page=`pages/live-record/index`；query=`{sessionId:"session-1781787045680-8e406c",role:"member"}`；Console=`[]`。 |
| storage 摘要命令 | `node -` 连接 `ws://127.0.0.1:9420` 读取 storage，并只输出脱敏摘要。 |
| storage 摘要 | `runtime-api-base=http://127.0.0.1:3221/api/v1`；`profileId=user-1781787045679-f3f2eb`；`profileName=聚会记录师成员A`；`tokenPresent=true`；公开只记录 `tokenTail=b8615971`。 |
| relaunch 命令 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=member" --wait 4500 --data sessionId,sessionName,titleImageSrc,activeSegment,recordTimelineItems,photoNodes,ledgerTimelineItems,timelineNodes,records,players,isJudge,ledgerEditable,errorText,loading,timelineLoading` |
| summary.page | `pages/live-record/index`；query=`{sessionId:"session-1781787045680-8e406c",role:"member"}`。 |
| page data 摘要 | `sessionName=周末聚会记录`；`titleImageSrc=/assets/party-recorder/pr-cs008at-title-sample-zhoumojuhuijilu.png`；`activeSegment=record`；`recordTimelineItems=4`，含照片 2、欠酒 1、加酒 1；`photoNodes=2`；`ledgerTimelineItems=2`；`timelineNodes=5`，含 `drink_debt` 与 `drink_add`；`records=3`；`isJudge=false`；`timelineLoading=false`。 |
| relaunch Console | 6 条 `[session-exit] enableAlertBeforeUnload enabled` info；无阻塞红错。 |
| 首屏截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008aw-live-record-density-first-390-20260619.png -Mode right` |
| 首屏截图 | `docs/runtime/pr-qa-link-cleanup-008aw-live-record-density-first-390-20260619.png`。 |
| 首屏观察 | 390 右侧预览可见 Hero、Tab、1 个照片节点和第二个照片节点起始；仍未看到 1 个账本节点起始，未满足 008AW 第一条硬性验收。标题 / Hero / pill 未见新增裁切，信息密度较 008AV 有提升但仍未达首屏目标。 |
| 一次滚动命令 | 对 `.live-scroll` 执行 `scrollTo(0,520)`：`node -` 脚本连接 `ws://127.0.0.1:9420`，输出 `{ok:true,action:"scrollTo",selector:".live-scroll",top:520}`。 |
| 一次滚动截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008aw-live-record-density-scroll-390-20260619.png -Mode right` |
| 一次滚动截图 | `docs/runtime/pr-qa-link-cleanup-008aw-live-record-density-scroll-390-20260619.png`。 |
| 一次滚动观察 | 一次正常滚动后连续看到照片、欠酒和加酒三类内容；照片 / 账本事件外层暗色大卡和厚 padding wrapper 较 008AV 明显消失 / 压薄；底部 `继续拍照` 未遮挡加酒节点有效内容。该部分局部通过。 |
| 加酒牌截图命令 | 对 `.live-scroll` 执行 `scrollTo(0,600)` 后运行 `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008aw-live-record-add-neon-390-20260619.png -Mode right`。 |
| 加酒牌截图 | `docs/runtime/pr-qa-link-cleanup-008aw-live-record-add-neon-390-20260619.png`。 |
| 加酒牌 / event data | `recordTimelineItems[3].type=drink`；`chipAsset=/assets/party-recorder/pr-cs008au-neon-drink-plus1.png`；`scoreText=1 杯`；截图可见 `加酒 +1`，未回退为空绿框。 |
| 账本 tab 命令 | `node scripts/wechat-devtools-automator.js tap --port 9420 --selector ".live-segment-tab[data-tab='ledger']" --selectorTimeout 8000 --wait 2500 --data activeSegment,sessionName,titleImageSrc,records,players,isJudge,ledgerEditable,ledgerTimelineItems,errorText,loading,timelineLoading` |
| 账本 tab data | `activeSegment=ledger`；`records=3`：房主 `debtCount=0/drinkCount=0`，成员 A `debtCount=1/drinkCount=0`，成员 B `debtCount=0/drinkCount=1`；`ledgerTimelineItems=2`，含欠酒 1 和加酒 1；`isJudge=false`；`timelineLoading=false`。 |
| 账本 tab Console | `[]`。 |
| 账本 tab 截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008aw-live-record-ledger-tab-390-20260619.png -Mode right` |
| 账本 tab 截图 | `docs/runtime/pr-qa-link-cleanup-008aw-live-record-ledger-tab-390-20260619.png`。 |
| 账本 tab 观察 | 账本 tab 不再全员 `0/0/0`，与 ledger event 聚合一致；该回归项通过。右侧截图左侧仍有部分预览裁切，计数结论以 page data 为主。 |
| 当前结论 | `退回前端 / UIUX，局部修复确认`：008AW 已修复或保持一次滚动连续内容、外框压薄 / 删除、CTA 不遮挡、`加酒 +1` 固定图和账本 tab 聚合计数；但 390 首屏仍未露出账本节点起始，未满足“首屏必须看到 Hero、Tab、1 个照片节点、1 个账本节点起始”的硬性验收。不得写 008AW 预览框阶段通过、真机通过、上线通过或全链路通过。 |
| 下一步责任 | 前端继续处理首屏密度：压缩 Hero / tab / 首个照片节点垂直占用或调整第一屏布局，让 390 宽右侧预览首屏明确露出首个账本节点起始；UI/UX 复核该密度目标是否仍需保留当前视觉比例；测试待回包后仅复测 `live-record` 首屏密度与既有回归项。 |

##### 13.16.114.14 `PR-QA-LINK-CLEANUP-008AY-RECORD-FIRST-SCREEN-DENSITY-RETEST` 2026-06-19 待 UI/UX 与前端回包门禁

PM 已回收 13.16.114.13：008AW 结论为 `退回前端 / UIUX，局部修复确认`。当前只登记后续待测，不复跑 008AW，不扩大矩阵。

| 项 | 记录 |
| --- | --- |
| 当前状态 | `paused / merged`：UI/UX `PR-UX-LINK-CLEANUP-008AX-RECORD-FIRST-SCREEN-CONSECUTIVE-PHOTOS-SPEC` 已在 12.7.54 回包并通过 PM 只读核验；前端 `PR-FE-LINK-CLEANUP-008AY-RECORD-FIRST-SCREEN-DENSITY-FINAL-FIX` 已静态回包并通过 PM `typecheck` / `check:encoding` / 目标 diff check 只读复核，但因用户新退回 Hero 状态和标题渲染，暂停单独执行旧 008AY，合并等待 13.16.114.15 的 008AZ 复测。 |
| 阻塞原因 | 008AW 已确认一次滚动连续内容、外框压薄 / 删除、CTA 不遮挡、`加酒 +1`、账本 tab 计数和 Console 均有局部修复；唯一未闭环硬性项是 390 首屏仍未露出账本节点起始。 |
| UI/UX 准入 | 已满足：UI/UX 12.7.54 明确连续照片首屏规格，真实 008g 前两条均为照片时，第 2 条照片必须压缩为缩略组，不再占完整大节点高度；390 宽首屏仍必须露出 Hero / Tab / 主照片节点 / 账本节点起始。不得用口头“接近”替代可验收规格。 |
| 前端准入 | 008AY 静态准入已满足但不单独执行：前端已说明只修首屏密度最终项，且未回退 008AW 已通过项；PM 已只读复核 `typecheck`、`check:encoding`、目标 diff check。后续运行态只在 008AZ 合并复测中验证。 |
| 后续必测 | 只测 `pages/live-record/index?sessionId=session-1781787045680-8e406c&role=member`：390 宽首屏必须露出 Hero、Tab、主照片节点和 1 个账本节点起始；前两条为照片时，第 2 条必须变为缩略组，不再占完整大节点高度；一次正常滚动仍连续看到照片 + 欠酒 + 加酒；照片 / 账本事件不得回退外层暗色大卡或厚 padding wrapper；底部 `继续拍照` 不得遮挡有效内容。 |
| data 顺序断言 | `timelineNodes` / `recordTimelineItems` 原始业务顺序不得被改写；第 2 条照片只能在 UI 呈现上压缩为缩略组，账本节点仍必须是照片之后的下一条非照片事件，不能为了首屏截图伪造排序或隐藏账本事件。 |
| 回归项 | `recordTimelineItems` 仍含照片 2、欠酒 1、加酒 1；`加酒 +1` 固定图仍显示；账本 tab 仍不是全员 `0/0/0`；Console 无阻塞红错。 |
| 证据要求 | 首屏 390 右侧预览截图、一次滚动截图、加酒牌截图 + event data 摘要、账本 tab 截图 + ledger data 摘要、storage token 后 8 位、Console 摘要。 |
| 禁止结论 | 不得单独测试 008AY 旧 Hero 并写通过；后续只能执行 008AZ 合并复测，且即使通过也只能写 `live-record` 单点预览框阶段结论，不写真机 / 上线 / 全链路通过。 |

##### 13.16.114.15 `PR-QA-LINK-CLEANUP-008AZ-RECORD-HERO-TEXT-TITLE-STATUS-RETEST` 2026-06-19 待测试执行门禁

用户最新截图退回 `live-record` Hero：`进行中` 状态重叠且不要用图片；`周末聚会记录` 也不要用图片，要用玩家生成的真实聚会名。前端 008AY 静态已回包并通过 PM `typecheck` / `check:encoding` / 目标 diff check 只读复核；前端 008AZ 已将主标题改为真实 `sessionName` 文本，并移除状态图片与标题图主渲染。测试现在只执行 008AZ 合并复测，不再单独执行旧 008AY。

| 项 | 记录 |
| --- | --- |
| 当前状态 | `sent`：前端 008AZ 已静态落地并通过 PM 只读复核；测试现在可以执行 `PR-QA-LINK-CLEANUP-008AZ-RECORD-HERO-TEXT-TITLE-STATUS-RETEST`，不得重复跑旧 008AY 或扩大矩阵。 |
| 前端准入 | 已满足静态准入：PM 只读扫描确认 WXML 主标题为 `{{sessionName}}` 文本，不再渲染 `live-record008as-title-image`；状态不再渲染 `live-record008as-status-bg` 图片；`typecheck`、`check:encoding` 通过，目标 diff check 仅 LF/CRLF warning。 |
| 必测命令 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=member" --wait 4500 --data sessionId,sessionName,titleImageSrc,activeSegment,recordTimelineItems,recordTimelineDisplayItems,photoNodes,ledgerTimelineItems,timelineNodes,players,records,errorText,loading,timelineLoading`，截图仍用 `scripts\capture-wechat-devtools-preview.ps1 -Mode right`。 |
| Hero 验收 | 390 右侧预览中 `进行中` 文本 pill 不与右上设置/更多按钮、标题、人数/时间重叠；状态不得使用图片背景；页面标题必须显示真实 `sessionName=周末聚会记录` 文本，不得显示标题 PNG 或图片层遮挡。 |
| 008AY 回归 | `recordTimelineDisplayItems` 应存在并含主照片节点 + `photoGroup` + 后续账本节点；原始 `recordTimelineItems` 顺序不变；390 首屏继续露出账本节点起始；一次滚动仍连续看到照片 + 欠酒 + 加酒。 |
| 数据 / 视觉回归 | `加酒 +1` 固定图仍显示；账本 tab 计数仍来自 ledger event 聚合，不得回退全员 `0/0/0`；底部 CTA 不遮挡有效内容；Console 无阻塞红错。 |
| 禁止结论 | 不测试旧 Hero 写通过；不把 `titleImageSrc` data 存在本身判失败，只判它是否仍作为主标题展示；不写真机、上线或全链路通过。 |

运行态复测结果：

| 项 | 记录 |
| --- | --- |
| storage 摘要命令 | `node -` 连接 `ws://127.0.0.1:9420` 读取 storage，并只输出脱敏摘要。 |
| storage 摘要 | `runtime-api-base=http://127.0.0.1:3221/api/v1`；`profileId=user-1781787045679-f3f2eb`；`profileName=聚会记录师成员A`；`tokenPresent=true`；公开只记录 `tokenTail=b8615971`。 |
| relaunch 命令 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=member" --wait 4500 --data sessionId,sessionName,titleImageSrc,activeSegment,recordTimelineItems,recordTimelineDisplayItems,photoNodes,ledgerTimelineItems,timelineNodes,players,records,errorText,loading,timelineLoading` |
| summary.page | `pages/live-record/index`；query=`{sessionId:"session-1781787045680-8e406c",role:"member"}`。 |
| page data 摘要 | `sessionName=周末聚会记录`；`titleImageSrc=/assets/party-recorder/pr-cs008at-title-sample-zhoumojuhuijilu.png` 仍作为兼容 data 存在；`recordTimelineItems=4`，原始顺序为照片、照片、欠酒、加酒；`recordTimelineDisplayItems=4`，顺序为主照片 `displayKind=node`、第 2 张照片 `displayKind=photoGroup`、欠酒、加酒；`photoNodes=2`；`ledgerTimelineItems=2`；`records=3`。 |
| relaunch Console | 9 条 `[session-exit] enableAlertBeforeUnload enabled` info；无阻塞红错。 |
| 首屏截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008az-live-record-hero-title-status-first-390-20260619.png -Mode right` |
| 首屏截图 | `docs/runtime/pr-qa-link-cleanup-008az-live-record-hero-title-status-first-390-20260619.png`。 |
| Hero / 标题观察 | 标题区域显示真实文本 `周末聚会记录`，不是 008AT 标题 PNG 主渲染；`titleImageSrc` data 存在但未作为主标题展示。右上按钮、标题、人数 / 时间元信息未互相重叠。 |
| 状态 pill 观察 | 390 右侧预览左上角状态 pill 只露出 `中`，未完整显示 `进行中`；虽然未与右上按钮 / 标题 / 元信息重叠，但文本 pill 可读性仍不达标，退回前端继续处理位置 / 宽度 / 安全区。 |
| 008AY 首屏回归 | 首屏可见主照片节点、第 2 张照片缩略组和欠酒账本节点起始；满足“前两条照片时第 2 条转缩略组，首屏露出账本节点起始”的 008AY 运行态要求。 |
| 一次滚动命令 | 对 `.live-scroll` 执行 `scrollTo(0,520)`：`node -` 脚本连接 `ws://127.0.0.1:9420`，输出 `{ok:true,action:"scrollTo",selector:".live-scroll",top:520}`。 |
| 一次滚动截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008az-live-record-scroll-390-20260619.png -Mode right` |
| 一次滚动截图 | `docs/runtime/pr-qa-link-cleanup-008az-live-record-scroll-390-20260619.png`。 |
| 一次滚动观察 | 一次滚动后可连续看到主照片、photoGroup、欠酒、加酒；`加酒 +1` 固定图仍显示；底部 `继续拍照` 未遮挡有效内容；外框未回退为 008AS / 008AV 旧厚卡。 |
| 账本 tab 命令 | `node scripts/wechat-devtools-automator.js tap --port 9420 --selector ".live-segment-tab[data-tab='ledger']" --selectorTimeout 8000 --wait 2500 --data activeSegment,sessionName,titleImageSrc,recordTimelineItems,recordTimelineDisplayItems,records,players,isJudge,ledgerEditable,ledgerTimelineItems,errorText,loading,timelineLoading` |
| 账本 tab data | `activeSegment=ledger`；`records=3`：房主 `debtCount=0/drinkCount=0`，成员 A `debtCount=1/drinkCount=0`，成员 B `debtCount=0/drinkCount=1`；`ledgerTimelineItems=2`，含欠酒 1 和加酒 1；`isJudge=false`；`timelineLoading=false`。 |
| 账本 tab Console | `[]`。 |
| 账本 tab 截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008az-live-record-ledger-tab-390-20260619.png -Mode right` |
| 账本 tab 截图 | `docs/runtime/pr-qa-link-cleanup-008az-live-record-ledger-tab-390-20260619.png`。 |
| 当前结论 | `退回前端，局部修复确认`：008AZ 已确认标题改为真实 `sessionName` 文本、008AY photoGroup / 首屏账本起始生效、原始顺序未改写、`加酒 +1` / 账本 tab 计数 / CTA / Console 均未回退；但 `进行中` 状态 pill 在 390 首屏未完整显示，只露出 `中`，不满足“文本 pill 可读且不重叠”的验收标准。不得写 008AZ 预览框阶段通过、真机通过、上线通过或全链路通过。 |
| 下一步责任 | 前端继续修 `进行中` 文本 pill 的可视区域、位置和安全区，确保 390 右侧预览完整显示 `进行中` 且不与右上按钮、标题、人数 / 时间重叠；测试待前端回包后只复测 `live-record` Hero 状态 pill 和既有回归项。 |

##### 13.16.114.16 `PR-QA-LINK-CLEANUP-008BD-RECORD-STATUS-PILL-SAFEAREA-RETEST` 2026-06-19 运行态单点复测结果

本轮只测 `pages/live-record/index` 状态 pill 安全区，不扩大到分享、首页、邀请、相册矩阵；不写真机 / 上线 / 全链路通过。

| 项 | 记录 |
| --- | --- |
| 前端准入 | 前端 `PR-FE-LINK-CLEANUP-008BD-RECORD-STATUS-PILL-SAFEAREA-FIX` 已回包：只改 `miniprogram/pages/live-record/index.less` 和前端计划 14.103；`.live-record008as-hero-top` 左 padding 从 `18px` 增至 `24px`；`.live-record008as-status` 最小宽度从 `72px` 增至 `88px`，左右 padding 从 `12px` 增至 `16px`，并加 `flex:0 0 auto`；PM 只读复核 `typecheck`、`check:encoding`、目标 diff check 通过，WXML / LESS 未恢复 `status-bg` / `title-image`，`recordTimelineDisplayItems` / `photoGroup` 仍保留。 |
| status 前置 | `node scripts/wechat-devtools-automator.js status --port 9420 --storage`；当前 storage 为 `runtime-api-base=http://127.0.0.1:3221/api/v1`，`profileId=user-1781787045679-f3f2eb`，`tokenPresent=true`，公开只记录 `tokenTail=b8615971`；Console=`[]`。 |
| relaunch 命令 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=member" --wait 4500 --data sessionId,sessionName,titleImageSrc,activeSegment,recordTimelineItems,recordTimelineDisplayItems,photoNodes,ledgerTimelineItems,timelineNodes,players,records,isJudge,ledgerEditable,errorText,loading,timelineLoading`。 |
| summary.page | `pages/live-record/index`；query=`{sessionId:"session-1781787045680-8e406c",role:"member"}`。 |
| page data 摘要 | `sessionName=周末聚会记录`；`titleImageSrc=/assets/party-recorder/pr-cs008at-title-sample-zhoumojuhuijilu.png` 仍为兼容 data；`recordTimelineItems=4`，原始顺序为照片、照片、欠酒、加酒；`recordTimelineDisplayItems=4`，顺序为主照片 `displayKind=node`、第 2 张照片 `displayKind=photoGroup`、欠酒、加酒；`photoNodes=2`；`ledgerTimelineItems=2`；`records=3`；`isJudge=false`；`timelineLoading=false`。 |
| relaunch Console | 2 条 `[session-exit] enableAlertBeforeUnload enabled` info；无阻塞红错。 |
| 首屏截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008bd-live-record-status-pill-390-20260619.png -Mode right`。 |
| 首屏截图 | `docs/runtime/pr-qa-link-cleanup-008bd-live-record-status-pill-390-20260619.png`，尺寸 `410x1032`。 |
| 状态 pill 观察 | 390 右侧预览左上状态 pill 仍被左侧裁切，只露出 `行中`，不是完整 `进行中`；未见其与右上按钮、标题、人数 / 时间元信息重叠，但“完整可见”硬性验收未通过。 |
| 标题 / Hero 回归 | 标题仍显示真实 `sessionName=周末聚会记录` 文本，不是标题 PNG 主渲染；右上按钮、标题、人数 / 时间元信息未互相重叠。 |
| 008AY / 008AZ 回归 | 首屏仍可见主照片节点、第 2 张照片缩略组和欠酒账本节点起始；`recordTimelineDisplayItems/photoGroup` 未回退；原始 `recordTimelineItems` 顺序未改写。 |
| 账本 tab 命令 | `node scripts/wechat-devtools-automator.js tap --port 9420 --selector ".live-segment-tab[data-tab='ledger']" --selectorTimeout 8000 --wait 2500 --data activeSegment,sessionName,titleImageSrc,recordTimelineItems,recordTimelineDisplayItems,records,players,isJudge,ledgerEditable,ledgerTimelineItems,errorText,loading,timelineLoading`。 |
| 账本 tab data | `activeSegment=ledger`；`records=3`：房主 `debtCount=0/drinkCount=0`，成员 A `debtCount=1/drinkCount=0`，成员 B `debtCount=0/drinkCount=1`；`ledgerTimelineItems=2`，含欠酒 1 和加酒 1；`isJudge=false`；`timelineLoading=false`；Console=`[]`。 |
| 数据 / 视觉回归 | `加酒 +1` 固定图未回退；账本 tab 计数未回退全员 `0/0/0`；底部 `继续拍照` 未从本轮首屏截图观察到遮挡有效内容。 |
| 当前结论 | `退回前端，回归项局部确认`：标题文本、photoGroup、账本节点首屏起始、`加酒 +1`、账本 tab 计数、CTA 与 Console 均未回退；但 390 右侧预览状态 pill 仍未完整显示 `进行中`，只露出 `行中`，不满足 008BD 核心验收。不得写 008BD live-record 状态 pill 单点预览框阶段通过、真机通过、上线通过或全链路通过。 |
| 下一步责任 | 前端继续修 `.live-record008as-status` 的左侧安全区 / 定位 / 宽度，确保 390 右侧预览完整显示 `进行中`；测试待回包后只复测 `live-record` 状态 pill 与既有回归项。 |

##### 13.16.114.17 `PR-QA-LINK-CLEANUP-008BE-RECORD-STATUS-PILL-CONTAINER-POSITION-RETEST` 2026-06-19 运行态单点复测结果

本轮只测 `pages/live-record/index` 状态 pill 容器定位，不扩大到分享、首页、邀请、相册矩阵；不写真机 / 上线 / 全链路通过。

| 项 | 记录 |
| --- | --- |
| 前端准入 | 前端 `PR-FE-LINK-CLEANUP-008BE-RECORD-STATUS-PILL-CONTAINER-POSITION-FIX` 已回包：只改 `miniprogram/pages/live-record/index.less` 和前端计划 14.104；`.live-record008as-hero-top` 改为 Hero 内绝对定位覆盖层 `top:16px; right:18px; left:0; padding-left:44px; box-sizing:border-box`；状态 pill 仍是非图片文本 pill，保留 `min-width:88px / padding:0 16px / flex:0 0 auto`；覆盖层 `pointer-events:none`，状态 pill 和右侧工具按钮保留 `pointer-events:auto`；未改标题、timeline、账本、CTA、权限或接口。 |
| status 前置命令 | `node scripts/wechat-devtools-automator.js status --port 9420 --storage`。 |
| storage 摘要 | `runtime-api-base=http://127.0.0.1:3221/api/v1`；`profileId=user-1781787045679-f3f2eb`；`tokenPresent=true`；公开只记录 `tokenTail=b8615971`；Console=`[]`。 |
| relaunch 命令 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=member" --wait 4500 --data sessionId,sessionName,titleImageSrc,activeSegment,recordTimelineItems,recordTimelineDisplayItems,photoNodes,ledgerTimelineItems,timelineNodes,players,records,isJudge,ledgerEditable,errorText,loading,timelineLoading`。 |
| summary.page | `pages/live-record/index`；query=`{sessionId:"session-1781787045680-8e406c",role:"member"}`。 |
| page data 摘要 | `sessionName=周末聚会记录`；`titleImageSrc=/assets/party-recorder/pr-cs008at-title-sample-zhoumojuhuijilu.png` 仍为兼容 data；`activeSegment=record`；`recordTimelineItems=4`，原始顺序为照片、照片、欠酒、加酒；`recordTimelineDisplayItems=4`，顺序为主照片 `displayKind=node`、第 2 张照片 `displayKind=photoGroup`、欠酒、加酒；`photoNodes=2`；`ledgerTimelineItems=2`；`timelineNodes=5`，含 `drink_debt` 与 `drink_add`；`records=3`；`isJudge=false`；`timelineLoading=false`。 |
| relaunch Console | 5 条 `[session-exit] enableAlertBeforeUnload enabled` info；无阻塞红错。 |
| 首屏截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008be-live-record-status-pill-390-20260619.png -Mode right`。 |
| 首屏截图 | `docs/runtime/pr-qa-link-cleanup-008be-live-record-status-pill-390-20260619.png`，尺寸 `410x1032`。 |
| 状态 pill 观察 | 390 右侧预览左上状态 pill 已完整显示 `进行中`，不再只露 `行中` / `中`；未见其与右上设置 / 更多按钮、标题、人数 / 时间元信息重叠。 |
| 右上工具按钮观察 | 首屏截图中右上设置 / 更多按钮可见，覆盖层未遮挡其显示；本轮未额外点击工具按钮，交互点击仍以截图可见和覆盖层 `pointer-events` 前端准入为辅证。 |
| 标题 / Hero 回归 | 标题仍显示真实 `sessionName=周末聚会记录` 文本，不是标题 PNG 主渲染；`titleImageSrc` 仅作为兼容 data 存在。 |
| 008AY / 008AZ 回归 | 首屏仍可见主照片节点、第 2 张照片缩略组和欠酒账本节点起始；`recordTimelineDisplayItems/photoGroup` 未回退；原始 `recordTimelineItems` 顺序未改写。 |
| 账本 tab 命令 | `node scripts/wechat-devtools-automator.js tap --port 9420 --selector ".live-segment-tab[data-tab='ledger']" --selectorTimeout 8000 --wait 2500 --data activeSegment,sessionName,titleImageSrc,recordTimelineItems,recordTimelineDisplayItems,records,players,isJudge,ledgerEditable,ledgerTimelineItems,errorText,loading,timelineLoading`。 |
| 账本 tab data | `activeSegment=ledger`；`records=3`：房主 `debtCount=0/drinkCount=0`，成员 A `debtCount=1/drinkCount=0`，成员 B `debtCount=0/drinkCount=1`；`ledgerTimelineItems=2`，含欠酒 1 和加酒 1；`isJudge=false`；`timelineLoading=false`；Console=`[]`。 |
| 账本 tab 截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008be-live-record-ledger-tab-390-20260619.png -Mode right`。 |
| 账本 tab 截图 | `docs/runtime/pr-qa-link-cleanup-008be-live-record-ledger-tab-390-20260619.png`，尺寸 `410x1032`。 |
| 数据 / 视觉回归 | `加酒 +1` 固定图仍在 record data 中指向 `pr-cs008au-neon-drink-plus1.png`；账本 tab 计数未回退为全员 `0/0/0`；底部 `继续拍照` 在首屏截图中未遮挡有效内容；Console 无阻塞红错。 |
| 当前结论 | `008BE live-record 状态 pill 单点预览框阶段通过`：本轮确认 390 右侧预览完整显示 `进行中`，且标题文本、photoGroup、账本节点首屏起始、`加酒 +1`、账本 tab 计数、CTA 与 Console 均未回退。该结论仅限 DevTools 右侧预览框下的 `live-record` 状态 pill 单点，不代表真机、上线或全链路通过。 |
| 下一步责任 | 前端无需继续处理 008BE 状态 pill；若 PM / UIUX 后续要验右上工具按钮实际点击，可另开单点补证。测试继续等待其他已派单点任务回包，不扩大本轮矩阵。 |

#### 13.16.115 `PR-QA-LINK-CLEANUP-008AO/008AP/008AN-NO-FALLBACK-ACCEPTANCE-GATE` 2026-06-19 UI / 交互兜底不接受红线

记录时间：2026-06-19。PM 追加测试红线：用户明确“有错误就改，必须保证与 UI 生图一致”。后续测试不得接受“UI / 交互兜底策略”，不得把浅色块、CSS 近似、默认样式、替代文案或替代交互写成通过。

##### 13.16.115.1 通用红线

| 红线 | 判定 |
| --- | --- |
| UI 生图 / 切图替代 | 如果前端用浅色块、CSS 近似、默认样式、替代文案、替代交互代替 UI 生图或切图，直接退回，不写通过。 |
| 资源 / 环境 / 交互问题 | 资源加载失败、路径错误、层级遮挡、数据环境不可达、交互不可点，都按真实问题记录；不得因为页面有兜底显示就判通过。 |
| 证据要求 | 通过必须有真实截图、page data / storage / Console 摘要、源码资源路径或接口证据支撑；“看起来差不多”不能作为通过依据。 |

##### 13.16.115.2 008AO 红线

| 项目 | 判定 |
| --- | --- |
| 唯一目标素材 | 008AO 已退回；后续 008AQ 只认 UI/UX 008AQ 确认后的固定验收图 `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008aq-invite-paper-mobile-750w-no-checkerboard.png` 真实可见，规格 `750x400 / 371,857 bytes`，透明 PNG；不得用旧 008AP、008AJ、008AL、前端自行压缩图、前端自行尺寸版或其他替代图写通过。 |
| 视觉通过标准 | 必须与 008AQ 固定验收图对照：不改变构图、比例、透明区、顶部胶带、纸纹、圆角、右下角卷页；可适配手机尺寸且不需要过大，但必须等比或视觉不变形，不能裁掉卷角、胶带、圆角或透明 / 留白区域。微信开发者工具右侧预览框运行态不得出现真实棋盘格像素；图片查看器显示透明区域棋盘格不等于 PNG 内真实棋盘格像素。看起来像浅色兜底块、CSS 胶带、普通背景块、明显调色变样、运行态真实棋盘格外露或素材细节被淡化，直接退回前端 / UIUX。 |
| 禁止变更 | 一旦发现拉伸变形、裁切、换图、重绘、卷角 / 胶带缺失、透明区被去掉、棋盘格外露、前端自行压缩、前端自行改尺寸或替换未确认图片，直接退回，不写通过。 |
| 数据环境 | 如果本地 `127.0.0.1:3221` 仍不可达导致邀请码“生成中”，单独标数据环境阻塞；不得用该阻塞掩盖视觉退回，也不得写视觉通过。 |

##### 13.16.115.3 008AN 红线

| 项目 | 判定 |
| --- | --- |
| UI 对照 | 008AN 已被用户视觉退回；后续 008AS 记录 / 账本页必须同时对照用户新验收图 `C:\Users\Administrator\AppData\Local\Temp\codex-clipboard-f12866c8-21f4-427c-aafb-6fa051890f60.png`、`docs/design-assets/party-recorder/clean-slate-001/RECORD_LEDGER_ASSET_PACK_008AR.md` 和 008AT 标题资产 `docs/design-assets/party-recorder/clean-slate-001/cuts/pr-cs008at-title-sample-zhoumojuhuijilu.png` 验收，不接受旧壳、厚卡、样式近似、局部 SVG 拼凑或临时交互。 |
| 功能与视觉同时满足 | 页面标题必须是真实 `sessionName=周末聚会记录` 且使用 008AT 标题图，不得出现 `海边烧烤局` 或普通文字标题；左侧明线时间线、拍照节点、账本欠酒 / 加酒节点、账本可读与权限正确都要与 UI / 接口证据一致；任一关键项缺失不得写通过。 |
| 008AV 紧凑密度 | 后续 008AV 还必须满足用户新增“节点别太大、下滑不累、去外部框、元素缩小、布局紧凑”要求；不得只用 CSS 缩小或截图局部裁切冒充通过，必须用 390 宽运行态截图、一次滚动覆盖节点数、data 和 Console 共同证明。 |
| 禁止结论 | 不写真机通过、上线通过、全链路通过；不得把样式相似写成 1:1 还原。 |

#### 13.16.116 `PR-QA-SHARE-POSTER-TIMELINE-ACTIONS-008BA-RETEST` 2026-06-19 待前端回包门禁

用户最新截图退回 `share-poster` 分享图页面。当前测试不复跑旧分享矩阵，等待前端 `PR-FE-SHARE-POSTER-TIMELINE-ACTIONS-008BA` 回包后，只做分享图单点复测。

| 项 | 记录 |
| --- | --- |
| 当前状态 | `blocked`：等待前端 008BA 回包。 |
| 前端准入 | 前端必须说明页面和保存 canvas 均已同步修改：红框主视觉区域改为记录时间节点；删除聚会账本大卡、排队 / 保存成功 / 保存失败大卡、“仅展示可分享内容”提示和底部加入 / 相册 / 反馈按钮；按钮只保留 `返回聚会`、`保存聚会图`、`刷新状态`，失败时才额外出现 `重新生成`。需提供 `typecheck`、`check:encoding`、目标 diff check 和关键词扫描。 |
| 页面命令 | 优先用前端回包给出的 008g `share-poster` query；若未给，则先用 `briefId=brief-1781787045693-bc8904b9` 打开并读取 page data 中的 `shareTask.id/shareImageTaskId`，不得伪造 taskId。基础命令模板：`node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781787045693-bc8904b9" --wait 4500 --data sessionId,briefId,shareTask,displayTaskStatus,saveState,taskPrimaryLabel,photoHighlights,accountingHighlights,keyEvents,shareSummary,errorText,posterImagePath,readyShareImageUrl`。 |
| 截图要求 | 用 `scripts\capture-wechat-devtools-preview.ps1 -Mode right` 截 390 右侧预览；必要时滚动一次确认按钮区。 |
| 主视觉验收 | 红框主视觉区域必须是记录时间节点列表 / 时间线，能看到拍照、账本变动等真实节点；不得继续展示聚会账本大卡、单独照片墙 + 账本模块、长摘要块或旧分享预览厚卡。 |
| 按钮区验收 | 默认整体按钮只保留 `返回聚会`、`保存聚会图`、`刷新状态`；生成中时保存按钮显示 `生成中`；用户刷新状态后若成功，按钮变 `去分享`；生成失败时出现 `重新生成`；成功只显示一行小字提示，不出现额外成功按钮。 |
| 删除项验收 | 页面和截图中不得出现 `仅展示可分享内容`、`私密记录不会进入分享图`、底部 `加入聚会 / 查看相册 / 反馈`、排队 / 保存成功 / 保存失败大卡片、内部 raw/debug/brief/live 字段。 |
| 保存图验收 | 点击保存或使用前端提供的保存验证路径后，实际生成的聚会图也必须使用记录时间节点主视觉，并删除隐私提示和无关按钮 / 状态卡；不得只改页面不改 canvas。若 DevTools 保存能力受限，需记录工具限制和可替代的 `posterImagePath` / canvas data 证据，不得写保存图通过。 |
| 回归项 | 照片、账本、关键事件 data 不得被清空；失败 / pending / ready 三种状态的按钮文案和一行状态提示要可区分；Console 无阻塞红错。 |
| 禁止结论 | 前端未回包前不得测试旧版本；即使页面通过，也只能写 `share-poster` 单点预览框阶段结论，不写真机、上线或全链路通过。 |

运行态复测记录：

| 项 | 记录 |
| --- | --- |
| 前端准入 | 前端 `PR-FE-SHARE-POSTER-TIMELINE-ACTIONS-008BA` 已回包：页面和 `drawCanvasToFile()` 已改为记录时间线主视觉；移除本页 `<share-task-status>` 大卡、三张保存状态大卡、底部 `加入聚会 / 查看相册 / 反馈` 按钮和隐私提示块；按钮收敛为 `返回聚会 / 保存聚会图或去分享 / 刷新状态`，失败态额外 `重新生成`；PM 只读复核 `typecheck`、`check:encoding`、目标 diff check 和关键词扫描通过。 |
| status 前置 | `node scripts/wechat-devtools-automator.js status --port 9420 --storage`；当前 storage 为 `runtime-api-base=http://127.0.0.1:3221/api/v1`，`profileId=user-1781787045679-f3f2eb`，`tokenPresent=true`，公开只记录 `tokenTail=b8615971`；Console=`[]`。 |
| relaunch 命令 | 未伪造 taskId，按门禁使用 `briefId=brief-1781787045693-bc8904b9` 打开：`node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781787045693-bc8904b9" --wait 5000 --data sessionId,briefId,shareTask,displayTaskStatus,saveState,taskPrimaryLabel,photoHighlights,accountingHighlights,keyEvents,shareSummary,errorText,posterImagePath,readyShareImageUrl,posterTimelineNodes,posterStatusLine,shareImageTaskId`。 |
| summary.page | `pages/share-poster/index`；query=`{briefId:"brief-1781787045693-bc8904b9"}`。 |
| page data 摘要 | `sessionId=session-1781787045680-8e406c`；`briefId=brief-1781787045693-bc8904b9`；`shareTask=null`；`displayTaskStatus=预览中`；`saveState=idle`；`taskPrimaryLabel=刷新状态`；`posterImagePath=""`；`readyShareImageUrl=""`；`errorText=""`；`posterStatusLine=记录节点会进入分享图`。 |
| 内容 data 摘要 | `photoHighlights=2`，均为真实 `http://127.0.0.1:3221/uploads/...webp`；`accountingHighlights=1`，`label=账本,value=2,unit=条`；`keyEvents=2`，含 `加酒记录` 与 `待处理记录`；`shareSummary=这场聚会留下 2 张公开照片、2 条账本高光和 2 个关键时刻。`。 |
| posterTimelineNodes 摘要 | `posterTimelineNodes=4`：2 个 `type=photo/tone=photo`（精彩瞬间、聚会开场）+ 2 个 `type=event/tone=event`（聚会关键时刻，meta 分别为新增一条加酒记录 / 新增一条待处理记录）。 |
| relaunch Console | `[]`。 |
| 页面截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-share-poster-008ba-timeline-page-390-20260619.png -Mode right`。 |
| 页面截图 | `docs/runtime/pr-qa-share-poster-008ba-timeline-page-390-20260619.png`，尺寸 `410x1032`。 |
| 页面观察 | 390 右侧预览主视觉区已变为紧凑记录时间节点流，可见 2 条照片节点和 2 条聚会关键时刻节点；未见旧照片墙 + 聚会账本大卡 + 长摘要主结构；未见 `仅展示可分享内容`、`私密记录不会进入分享图`、底部 `加入聚会 / 查看相册 / 反馈`、排队 / 保存成功 / 保存失败大卡、raw/debug/internal 字段。按钮区可见 `返回聚会`（左侧因预览裁切仅部分可见）、`保存聚会图`、`刷新状态`，状态为一行小字。 |
| 保存按钮命令 | `node scripts/wechat-devtools-automator.js tap --port 9420 --selector ".poster-primary-action" --selectorTimeout 8000 --wait 6000 --data saveState,posterImagePath,posterImageUrl,readyShareImageUrl,posterTimelineNodes,photoHighlights,accountingHighlights,keyEvents,shareTask,displayTaskStatus,taskPrimaryLabel,errorText,posterStatusLine`。 |
| 保存按钮结果 | 命令超时：`command timed out after 64038 milliseconds`；随后 `node scripts/wechat-devtools-automator.js status --port 9420 --storage` 也超时：`command timed out after 34043 milliseconds`。按 DevTools 串行门禁停止继续操作，不重复点击保存、不扩大矩阵。 |
| 保存图结论 | `阻塞 / 待复测`：未取得 `posterImagePath`、保存图原图或 canvas 输出证据，不能写保存图使用时间节点主视觉通过。 |
| 当前结论 | `share-poster 008BA 页面预览局部通过 / 保存图验证阻塞`：页面主视觉、删除项、按钮收敛、data 和 Console 已局部满足；但保存按钮自动化超时且 status 随后超时，未取得保存图证据，不能写 008BA 单点预览框阶段通过、真机通过、上线通过或全链路通过。 |
| 下一步责任 | 前端无需因页面主视觉本轮证据退回；测试待 DevTools 自动化恢复或前端提供可复跑的保存图生成 / `posterImagePath` 取证方式后，只补测保存图与按钮状态，不扩大到其他页面。若保存图仍保留旧 canvas 文案、账本大卡或隐私提示，再退回前端 008BA。 |

#### 13.16.117 `PR-QA-HOME-RECENT-ALBUM-BRIEFID-404-008BB-RETEST` 2026-06-19 待前端回包门禁

首页最近相册出现 sessionId 被当作 briefId 读取导致的 brief 404 风险。当前只登记待测，不重复 008X / 008Y 首页全矩阵，也不混入分享图 008BA。

| 项 | 记录 |
| --- | --- |
| 当前状态 | `blocked`：等待前端 `PR-FE-HOME-RECENT-ALBUM-BRIEFID-404-008BB` 回包；前端未回包前不得测试旧版本或写通过。 |
| 测试范围 | 只测首页最近相册红错修复；不扩大到首页其他模块、工具箱、邀请、记录、相册详情或 `share-poster`。 |
| 前端准入 | 前端需说明最近相册不再用 `session-*` 调 `/api/v1/briefs/:briefId` 或 `/api/v1/session-briefs/:briefId`；若只有 `sessionId`，应跳过 brief 读取或走可用 route；提供 `typecheck`、`check:encoding`、目标 diff check 和关键词 / 路由扫描。 |
| 预览命令 | 复测时先 `node scripts/wechat-devtools-automator.js status --port 9420 --storage` 记录当前 page、storage token 后 8 位、Console；再打开 `/pages/index/index` 触发 `onLoad/onShow`，读取 `home,recentAlbums,recentSessions,lastLoadedAt,loading,errorText` 等 page data。截图使用 `scripts\capture-wechat-devtools-preview.ps1 -Mode right`。 |
| Console / Network 验收 | DevTools 9420 右侧预览打开首页并触发 `onLoad/onShow` 后，Console / Network 不得再出现 `/api/v1/briefs/session-*` 或 `/api/v1/session-briefs/session-*` 404。 |
| UI 验收 | 最近相册仍显示首图封面或默认图，不因跳过 sessionId brief 读取而空白、破界、显示 raw/error/debug 文案。 |
| 点击路径 | 最近相册点击路径不得回退；如果记录只有 `sessionId`，按现有 route 进入可用页面，不能跳到不存在的 `briefId=session-*`。 |
| 失败记录 | 若仍有 404，必须记录完整 URL、调用栈、`runtime-api-base`、当前 storage token 后 8 位、page data 中 recent album 的 `briefId/sessionId` 摘要，并退回前端；不得写成后端服务异常。 |
| 证据要求 | 命令原文、summary.page / query、page data 摘要、Console / Network 摘要、右侧预览截图或截图工具失败原文。 |
| 禁止结论 | 不写真机、上线或全链路通过；无前端 008BB 回包、无真实 Console / page data / 截图证据时不得写通过。 |

运行态复测记录：

| 项 | 记录 |
| --- | --- |
| 前端准入 | 前端 `PR-FE-HOME-RECENT-ALBUM-BRIEFID-404-008BB` 已回包：`mapRecentAlbumsFromSummaries()` 只在 `item.briefId` 存在时调用 `getManagedSessionBrief(item.briefId)`，只有 `sessionId` 时不读 brief、不隐式 `POST /sessions/:sessionId/brief`；PM 只读复核 `typecheck`、`check:encoding`、目标 diff check 通过，关键词扫描无 `getManagedSessionBrief(item.briefId || item.sessionId)` / `getManagedSessionBrief(item.sessionId)` / `createOrRefreshManagedSessionBrief(item.sessionId)`。 |
| status 命令 | `node scripts/wechat-devtools-automator.js status --port 9420 --storage`。 |
| status 摘要 | `summary.page=pages/index/index`；query=`{}`；`runtime-api-base=http://127.0.0.1:3221/api/v1`；`profileId=user-1781787045679-f3f2eb`；`tokenPresent=true`；公开只记录 `tokenTail=b8615971`；Console=`[]`。 |
| relaunch 命令 | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/index/index" --wait 4500 --data home,lastLoadedAt,loading,loggedIn,sessionReturn`。 |
| relaunch 结果 | 命令超时：`Error: timeout`，未取得 full `home` data；随后 `status --storage` 成功，页面仍为 `pages/index/index`，Console=`[]`。本次超时按 automator data 体积 / 工具链问题记录，不判业务失败。 |
| 精简 data 命令 | `node -` 连接 `ws://127.0.0.1:9420`，读取 `page.data()` 后只输出 `home.recentTools` 摘要和 storage 脱敏摘要。 |
| page data 摘要 | `loading=false`；`loggedIn=true`；`lastLoadedAt=1781862378509`；`recentTools=3`。第 1 项：`id=brief-1781862324688-6156df99`，`name=翻盘局`，`imageUrl=http://127.0.0.1:3221/uploads/moments/session-1781810995640-edd086/1781811010234-moment-1781811010222-906cfb.webp`，`route=/pages/session-brief/index?briefId=brief-1781862324688-6156df99`。第 2 项：`id=session-1781810681607-249f31`，`name=生'史'局`，`imageUrl=""`，`route=/pages/session-brief/index?sessionId=session-1781810681607-249f31`。第 3 项：`id=session-1781808709710-8f00b7`，`name=生'史'局`，`imageUrl=""`，`route=/pages/session-brief/index?sessionId=session-1781808709710-8f00b7`。 |
| 404 观察 | 本轮 status / 首页 data 读取期间 Console 均为 `[]`，未出现 `/api/v1/briefs/session-*` 或 `/api/v1/session-briefs/session-*` 404；recentTools 中 sessionId 项已保留 `sessionId` route，没有被拼成 `briefId=session-*`。 |
| 封面 / 默认图 | data 显示第 1 项有真实 `imageUrl`；第 2 / 3 项无图但仍有 route 和默认相册结构，未从 page data 观察到空白破界字段。右侧预览截图工具异常，视觉封面只作待补证。 |
| 截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-home-recent-album-008bb-home-390-20260619.png -Mode right`，以及 retry `docs/runtime/pr-qa-home-recent-album-008bb-home-retry-390-20260619.png`。 |
| 截图结果 | 两次截图命令均返回 `ok=true`，但实际尺寸均为 `61x28`，不是有效右侧预览截图；不作为页面通过截图证据。 |
| 点击命令 | `node -` 连接 `ws://127.0.0.1:9420`，尝试点击第二个 `.home-album-shot`（sessionId route）并等待 3000ms。 |
| 点击结果 | 命令超时：`command timed out after 34041 milliseconds`；随后 `status --storage` 成功，页面仍为 `pages/index/index`，Console=`[]`。本轮不写点击路径通过，记录为待补证 / 工具链超时。 |
| 当前结论 | `首页最近相册 008BB onLoad/onShow 红错修复局部确认 / 截图与点击待补证`：Console 未再出现 `/api/v1/briefs/session-*` 或 `/api/v1/session-briefs/session-*` 404，recentTools sessionId 项 route 未回退为 `briefId=session-*`；但右侧截图脚本产物无效、单点点击 sessionId 项超时，不能写完整“预览框阶段通过”。不得写真机、上线或全链路通过。 |
| 下一步责任 | 前端无需因本轮 404 再退回；测试待工具链截图 / tap 稳定后补首页右侧预览截图和最近相册点击路径证据。若后续复测仍出现 404，按本节失败记录要求贴完整 URL、调用栈、storage 与 recent album 摘要退回前端。 |

#### 13.16.118 `PR-QA-HOME-AUTH401-SUMMARY-GATE-008BC-RETEST` 2026-06-19 待前端回包门禁

用户线上首页截图显示 `GET https://api.pomer.cn/api/v1/user/session-moment-summaries 401`。PM 已判定：该接口是受保护用户接口，无 token / 失效 token 返回 401 属后端预期；本任务测试不得退后端，需等前端 `PR-FE-HOME-AUTH401-SUMMARY-GATE-008BC` 回包后验证首页在确认登录态前不无条件请求 summaries。

| 项 | 记录 |
| --- | --- |
| 当前状态 | `blocked`：等待前端 `PR-FE-HOME-AUTH401-SUMMARY-GATE-008BC` 回包；前端未回包前不得测试旧版本或写通过。 |
| 测试范围 | 只测首页 `/pages/index/index` 的 `session-moment-summaries` 401 门禁；不重复 008BB 点击 / 截图补证，不混入 008BA 分享图、记录页或首页全矩阵。 |
| 前端准入 | 前端需说明首页确认有效登录态前不请求 `/user/session-moment-summaries`；未登录 / token 失效时展示未登录入口或登录面板可达；有效 token 时 summaries 仍可加载；同时不回退 008BB 的 `/briefs/session-*` / `/session-briefs/session-*` 404 修复。需提供 `typecheck`、`check:encoding`、目标 diff check 和关键词 / 请求触发条件扫描。 |
| 未登录 / 失效 token 场景 | 将 `runtime-api-base` 设为 `https://api.pomer.cn/api/v1`，无 token 或失效 token 打开首页并触发 `onLoad/onShow`；Console / Network 不得出现 `/user/session-moment-summaries 401`；首页仍显示未登录入口 / 登录面板可达；最近相册为空 / 默认态且不破界。 |
| 有效 token 场景 | 使用有效 token 打开首页抽查 summaries 仍可加载，最近相册不因 008BC 回退；同时不得出现 008BB 已修复的 `/api/v1/briefs/session-*` 或 `/api/v1/session-briefs/session-*` 404。 |
| storage 记录规则 | 只记录 `runtime-api-base`、`tokenPresent`、token 后 8 位或 `tokenPresent=false`、`profileId`；不得输出完整 token。 |
| 证据要求 | 命令原文、summary.page / query、page data 摘要、Console / Network 摘要、storage 脱敏摘要、右侧预览截图或截图工具失败原文。 |
| 失败退回 | 若仍有 401，贴完整 URL、调用栈、storage 脱敏摘要、页面 data 中登录态 / recent album 摘要，退回前端 `PR-FE-HOME-AUTH401-SUMMARY-GATE-008BC`；不得归因后端服务异常。 |
| 禁止结论 | 无前端 008BC 回包不得执行旧版本；通过也只能写“首页 008BC auth401 预览框阶段通过”，不写真机、上线或全链路通过。 |

运行态复测记录：

| 项 | 记录 |
| --- | --- |
| 前端准入 | 前端 `PR-FE-HOME-AUTH401-SUMMARY-GATE-008BC` 已回包：`loadHomePage()` 不再无条件请求 `getManagedSessionMomentSummaries()`；先读公开首页数据，再检查 `jzp-user-token`，有 token 才调用 `getUserAuthSession()`，确认 `loggedIn && profile.wechatOpenId` 后才请求 `/user/session-moment-summaries`；PM 只读复核 `typecheck`、`check:encoding`、目标 diff check 通过，扫描确认 `index.ts` 只剩登录态分支内一处 summaries 调用。 |
| 严格无 token setup | `node -` 连接 `ws://127.0.0.1:9420`，设置 `runtime-api-base=https://api.pomer.cn/api/v1`，移除 `jzp-user-token`、`social-user-session-token`、`social-current-profile-id`、`social-current-profile`、`social-authorized-wechat-profile`、`authRedirectUrl`。storage 摘要：`tokenPresent=false`，`profileId=""`，`authorizedPresent=false`。 |
| 严格无 token relaunch | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/index/index" --wait 4500 --data loggedIn,loading,authPanelVisible,authRedirectUrl,userName,home`。 |
| 严格无 token data | `summary.page=pages/index/index`；`loggedIn=false`；`loading=false`；`authPanelVisible=false`；`userName=未登录`；`home.recentTools=3`，均为默认相册入口：`album-host` / `album-joined` / `album-share`，`imageUrl=""`，route 分别为 `/pages/album/index?mode=host|joined|unshared`。Console=`[]`，未出现 `/user/session-moment-summaries 401`。 |
| 登录入口可达命令 | `node -` 连接 `ws://127.0.0.1:9420`，点击 `.home-login-entry`。 |
| 登录入口结果 | 点击后 `authPanelVisible=true`，`loggedIn=false`，`userName=未登录`；未登录入口 / 登录面板可达。 |
| 严格失效 token setup | `node -` 连接 `ws://127.0.0.1:9420`，设置 `runtime-api-base=https://api.pomer.cn/api/v1`，写入失效 token（公开只记录 `tokenTail=or-008bc`），`profileId=invalid-profile-008bc`，并移除 `social-current-profile` 与 `social-authorized-wechat-profile`。 |
| 严格失效 token relaunch | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/index/index" --wait 4500 --data loggedIn,loading,authPanelVisible,authRedirectUrl,userName,home`。 |
| 严格失效 token data | `summary.page=pages/index/index`；`loggedIn=false`；`loading=false`；`authPanelVisible=false`；`userName=未登录`；`home.recentTools=3`，均为默认相册入口；Console=`[]`，未出现 `/user/session-moment-summaries 401`。 |
| 有效 token setup | 恢复 008g local 成员态作为有效 token 抽查：`runtime-api-base=http://127.0.0.1:3221/api/v1`；`profileId=user-1781787045679-f3f2eb`；`tokenPresent=true`；公开只记录 `tokenTail=b8615971`。完整 token 未写入文档。 |
| 有效 token relaunch | `node scripts/wechat-devtools-automator.js relaunch --port 9420 --path "/pages/index/index" --wait 4500 --data loggedIn,loading,lastLoadedAt,authPanelVisible,authRedirectUrl,userName,userAvatarUrl,sessionReturn`。 |
| 有效 token data | `summary.page=pages/index/index`；`loggedIn=true`；`loading=false`；`userName=聚会记录师成员A`；Console=`[]`。精简 data 读取 `recentTools=3`：第 1 项 `id=brief-1781862324688-6156df99`、`route=/pages/session-brief/index?briefId=brief-1781862324688-6156df99`、`imageUrlPresent=true`；第 2 / 3 项为 `session-*`，route 分别为 `/pages/session-brief/index?sessionId=session-1781810681607-249f31`、`/pages/session-brief/index?sessionId=session-1781808709710-8f00b7`，未回退为 `briefId=session-*`。 |
| 有效 token 截图 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-home-auth401-summary-008bc-home-valid-390-20260619.png -Mode right`；截图成功，尺寸 `410x1032`。 |
| 008BB 回归 | 有效 token 场景未出现 `/api/v1/briefs/session-*` 或 `/api/v1/session-briefs/session-*` 404；sessionId 最近相册项仍保留 sessionId route。 |
| 当前结论 | `首页 008BC auth401 预览框阶段通过 / 有效 token 为 local 008g 抽查`：严格无 token 与严格失效 token 在 `https://api.pomer.cn/api/v1` 下均未触发 `/user/session-moment-summaries 401`，且展示未登录 / 默认相册态；008g 有效 token 抽查 summaries / 最近相册未回退，Console 无阻塞红错。不得写真机、上线或全链路通过。 |
| 残留说明 | 本轮未使用线上私密有效 token 做登录态抽查；有效 token 抽查基于本地 3221 的 008g 成员态。若 PM 后续要求线上有效 token 验证，需要接口联调 / PM 提供安全 token 交接方式。 |

#### 13.16.119 `PR-QA-LINK-CLEANUP-008BI-REAL-TIME-STATUS-LEDGER-END-RETEST` 2026-06-19 待多角色回包门禁

用户最新验收聚焦真实时间、真实状态、分享图生成状态、二维码、账本提交、结束聚会和记录页残留视觉。当前只登记待测矩阵，不触发 DevTools，不复测旧版本，不写真机 / 上线 / 全链路通过。

| 项 | 记录 |
| --- | --- |
| 当前状态 | `blocked`：四方 008BF / 008BG / 008BH 已回包，但 PM 暂不放行执行；新增 P0 缺口仍需等待后端/API `PR-BE/PR-API-LINK-CLEANUP-008BJ-*`、前端 `PR-FE-LINK-CLEANUP-008BK-*`、接口联调 `PR-INT-LINK-CLEANUP-008BL-*` 回包后，再由 PM 明确放行。未放行前不得跑旧版本或用无二维码版本写分享图通过。 |
| 新增阻塞依赖 | 后端/API 008BG 已明确当前 ready PNG 底部没有小程序二维码，需后端 008BJ 修复；分享生成不是 `GET` 自动生成，需前端 008BK 按 `create -> process -> GET status` 流程接入；接口联调 008BL 需验证二维码字段与 PNG 底部二维码。 |
| 执行边界 | PM 放行前不得运行 `status`、`relaunch`、`tap`、截图、storage 注入、清缓存或重启工具；放行后仍按 DevTools 串行门禁执行：先 `status --storage`，再单页 relaunch 或单次 tap，不并行、不清缓存、不重启开发者工具。 |
| 前端 008BF 准入 | 前端需说明记录页、账本页、分享图页、个人中心 / 历史 / 最近相册相关实现已完成，覆盖真实时间展示、真实 session / share task 状态、分享图按钮状态、二维码渲染、账本“确定修改”提交、结束聚会、继续拍照上方横杠清理；提供 `typecheck`、`check:encoding`、目标 diff check 和关键词扫描。 |
| 后端/API 008BG 准入 | 后端/API 需提供真实时间字段、session 状态、share task 状态、二维码生成 / 获取合同、账本提交接口、结束聚会接口、历史 / 最近相册状态更新合同；需明确 ready / failed / generating 状态字段、错误码、幂等 / 回滚或 cleanup 方式。 |
| 接口联调 008BG 准入 | 接口联调需给可复跑样本：`sessionId`、`briefId`、`shareTaskId`、host / member token 尾号、二维码 URL 或阻塞说明、账本可编辑角色、结束聚会可执行角色、cleanup / 回滚方式；若缺任一写入安全方案，测试只能做只读 / 阻塞记录。 |
| UIUX 008BH 准入 | UIUX 需给记录页 / 分享图 / 账本确认提交 / 结束聚会状态的验收图或明确视觉口径，尤其说明继续拍照按钮上方横杠应移除、分享图二维码位置与尺寸、生成中 / 成功 / 失败状态展示。 |
| 用例 1 真实时间 | 记录页和分享图中的时间必须来自真实节点 / session / task 数据；不得使用假时间、当前系统时间兜底或固定文案。page data 需记录 `createdAt/updatedAt/startTimeText/timeText/shareTask.createdAt/shareTask.updatedAt` 等字段摘要；截图中时间与 data 对得上。 |
| 用例 2 真实状态 | 记录页状态、预览状态和分享图状态必须来自真实 `session.status` / `shareTask.status`；不得硬编码 `进行中`、`预览中`、`生成中` 等文案。若 data 与 UI 不一致，退回前端；若接口缺状态字段，退回后端/API + 接口联调。 |
| 用例 3 分享图生成状态 | 打开 `share-poster` 后记录 `shareTask.status/saveState/displayTaskStatus/taskPrimaryLabel/posterImagePath/readyShareImageUrl/errorText`；刷新状态后应立即回传 ready 或 failed。生成中按钮显示 `生成中`；ready 后玩家才可点分享；failed 才出现 `重新生成`；成功只显示一行小字提示，不得出现大状态卡或无关按钮。 |
| 用例 4 保存图原图 / 二维码 | 保存出来的聚会图原图必须同步使用当前主视觉并包含真实小程序二维码；需记录 `posterImagePath`、PNG / 临时文件路径、二维码 URL / scene / appCode 字段、原图截图或可访问文件摘要。若保存图原图仍无法获取，或二维码接口缺失，只能写阻塞，不得伪造保存图 / 二维码通过。 |
| 用例 5 账本头像与提交 | 账本页头像必须是真实头像或明确真实空头像策略；加减后不得立即误写，必须通过“确定修改”提交；提交成功后记录页 timeline 和账本 tab 应立即反映变动。若执行写入，必须有 host token、回滚 / cleanup 方式；无安全方案只验证控件和文案，不写提交通过。 |
| 用例 6 继续拍照 / 结束聚会 | 记录页必须同时有 `继续拍照` 和 `结束聚会`；点击结束聚会后需验证 session 状态、个人中心、历史、最近相册状态不乱。执行结束聚会前必须有可回滚样本；无 cleanup 只登记阻塞，不做破坏性写入。 |
| 用例 7 横杠清理 | 继续拍照按钮上方不明横杠必须消失；截图需覆盖底部 CTA 区域，若仍出现无解释横杠或遮挡有效内容，退回前端 / UIUX。 |
| 页面 / 命令基线 | PM 放行后先跑 `node scripts/wechat-devtools-automator.js status --port 9420 --storage`；后续单页覆盖 `live-record`、`ledger`、`share-poster`、必要的 `me/history/index` 或 PM 指定页面。每个页面只串行 relaunch / tap，命令需原文入档。 |
| data keys 基线 | `live-record`：`sessionId,sessionName,sessionStatus,statusText,startTimeText,recordTimelineItems,recordTimelineDisplayItems,timelineNodes,records,ledgerTimelineItems,activeSegment,errorText`；`ledger`：`records,players,pendingChanges,submitState,ledgerEditable,isJudge,errorText`；`share-poster`：`shareTask,shareTask.status,saveState,displayTaskStatus,taskPrimaryLabel,posterImagePath,readyShareImageUrl,posterTimelineNodes,photoHighlights,accountingHighlights,keyEvents,errorText`。 |
| 证据要求 | 每个用例记录命令原文、summary.page / query、关键 page data、右侧预览截图、Console / Network / storage 摘要、token 后 8 位、接口状态；保存图原图 / PNG / 临时文件如未取得，必须写阻塞原因和责任对象。 |
| 失败退回 | UI 与 data 不一致、状态硬编码、按钮状态错误、横杠残留、头像 / 二维码视觉问题退前端 / UIUX；接口 401 / 403 / 404 / 500、缺 task 状态、缺二维码合同、缺结束聚会 / 账本提交合同退后端/API + 接口联调；DevTools 断连 / 截图失败单列工具链阻塞，不判业务失败。 |
| 禁止结论 | 即使 008BF / 008BG / 008BH 已回包，008BJ / 008BK / 008BL 未闭环并获 PM 放行前仍不得复测旧版本；不得用无二维码 ready PNG、GET 自动生成误判或未验证二维码字段的版本写分享图通过；通过也最多写对应单点“预览框阶段通过 / 退回 / 阻塞”，不得写真机、上线或全链路通过。 |

#### 13.16.120 `PR-QA-LINK-CLEANUP-008BI-REAL-TIME-STATUS-LEDGER-END-RETEST` 2026-06-19 预览框复测执行记录

本轮按 PM 放行只执行 008BI 预览框复测，不继续等待原生“去分享”面板，不扩大到首页 / 邀请 / 相册全矩阵；不写真机、上线或全链路通过。

| 项 | 记录 |
| --- | --- |
| status / storage 命令 | `npm.cmd run wechat:auto -- status --port 9420 --storage`。 |
| status / storage 摘要 | `summary.page=pages/index/index`；`runtime-api-base=http://127.0.0.1:3221/api/v1`；`profileId=user-1781787045679-f3f2eb`；`profileName=聚会记录师成员A`；`tokenPresent=true`；公开只记录 `tokenTail=b8615971`；Console=`[]`。 |
| live-record 首次命令问题 | 首次命令未使用 stop-parsing，`&role=member` 被 shell 解析，页面打开但 query 丢 `role`，并返回失败原文：`'role' is not recognized as an internal or external command, operable program or batch file.`；该条不作为业务失败，仅记录为命令 quoting 问题。 |
| live-record 有效命令 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=member" --wait 4500 --storage --data sessionId,sessionName,sessionStatus,statusText,startTimeText,elapsedText,memberCountText,recordTimelineItems,recordTimelineDisplayItems,timelineNodes,records,ledgerTimelineItems,activeSegment,errorText,loading,timelineLoading,canFinishSession,finishMatchLabel`。 |
| live-record summary.page | `pages/live-record/index`；query=`{sessionId:"session-1781787045680-8e406c",role:"member"}`。 |
| live-record data 摘要 | `sessionId=session-1781787045680-8e406c`；`sessionName=周末聚会记录`；`startTimeText=18:10`；`elapsedText=00:39:02`；`memberCountText=3/3 人`；`recordTimelineItems=4`，原始顺序为照片、照片、欠酒、加酒；节点 `createdAt` 为 `2026-06-18T12:50:45.691Z` 至 `2026-06-18T12:50:45.693Z`，`timeText=20:50`；`timelineNodes=5`，含 2 张真实图片、1 个 `drink_debt`、1 个 `drink_add`；`ledgerTimelineItems=2`；`records=3`；`finishMatchLabel=生成相册`。 |
| live-record Console | 3 条 `[session-exit] enableAlertBeforeUnload enabled` info；无阻塞红错。 |
| live-record 截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008bi-live-record-390-20260619.png -Mode right`。 |
| live-record 截图 | `docs/runtime/pr-qa-link-cleanup-008bi-live-record-390-20260619.png`，尺寸 `410x1032`。 |
| live-record 结论 | `局部预览框阶段通过 / 风险待修`：截图显示真实标题 `周末聚会记录`、真实节点时间、`继续拍照` 和 `结束聚会` 同屏存在，继续拍照按钮上方未见不明横杠；但 data 仍有 `finishMatchLabel=生成相册`，与 UI “结束聚会”存在 UI / data 不一致风险，需退回前端核清字段语义或移除旧标签残留。 |
| ledger 命令 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/ledger/index?sessionId=session-1781787045680-8e406c&role=member" --wait 4500 --storage --data sessionId,sessionName,players,stats,ledgerEventCount,ledgerEditable,ledgerDirty,ledgerSubmitting,isJudge,errorText,loading,hasSession`。 |
| ledger summary.page | `pages/ledger/index`；query=`{sessionId:"session-1781787045680-8e406c",role:"member"}`。 |
| ledger data 摘要 | `sessionName=周末聚会记录`；`players=3`：房主、成员A、成员B；账本数为成员A `debtCount=1`、成员B `drinkCount=1`；`stats=成员3 / 欠酒1 / 加酒1`；`ledgerEventCount=2`；`ledgerEditable=false`；`ledgerDirty=false`；`ledgerSubmitting=false`；`isJudge=false`；`hasSession=true`；Console=`[]`。 |
| ledger 截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008bi-ledger-member-390-20260619.png -Mode right`。 |
| ledger 截图 | `docs/runtime/pr-qa-link-cleanup-008bi-ledger-member-390-20260619.png`，尺寸 `410x1032`。 |
| ledger 结论 | `阻塞 / 退回接口联调 + 前端核查`：memberA 下真实成员名和账本数据可读，且未见“保存关键事件”；但 `avatarUrl=""`，不能证明“真实头像”通过；当前 token 为非 host，`ledgerEditable=false`，无 `+/-` 与“确定修改”写入路径，缺 host token、可回滚样本或 cleanup 方案，不能验证“加减后确定修改提交”和提交后 live-record / 账本 tab 立即反映变动。 |
| share-poster 命令 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/share-poster/index?briefId=brief-1781787045693-bc8904b9&taskId=share-task-1781865942423-96fd9bd9" --wait 5000 --storage --data sessionId,briefId,shareTask,shareTask.status,saveState,displayTaskStatus,taskPrimaryLabel,photoHighlights,accountingHighlights,keyEvents,posterTimelineNodes,shareSummary,errorText,posterImagePath,imageUrl,posterImageUrl,readyShareImageUrl,qrCodeImageUrl,miniProgramQrUrl,qrCodeUrl,posterStatusLine`。 |
| share-poster summary.page | `pages/share-poster/index`；query=`{briefId:"brief-1781787045693-bc8904b9",taskId:"share-task-1781865942423-96fd9bd9"}`。 |
| share-poster ready data | `shareTask.id=share-task-1781865942423-96fd9bd9`；`shareTask.status=ready`；`createdAt=2026-06-19T10:45:42.423Z`；`finishedAt=2026-06-19T10:45:42.613Z`；`imageUrl=http://127.0.0.1:3221/uploads/moments/share-tasks/share-task-1781865942423-96fd9bd9.png`；`readyShareImageUrl` 同 ready PNG；`posterImageUrl=http://store/...png`；`qrCodeImageUrl=http://127.0.0.1:3221/static/share-miniapp-qr.png`；`shareTask.miniProgramQrUrl` 与 `qrCodeUrl` 均指向 `/static/share-miniapp-qr.png`；`displayTaskStatus=可保存`；`posterStatusLine=分享图已准备好`；`errorText=""`；Console=`[]`。 |
| share-poster 内容 data | `photoHighlights=2`，均为本地 3221 WebP 真实照片；`accountingHighlights=1`，`label=账本,value=2,unit=条`；`keyEvents=2`，但 `time=时间未记录`；`posterTimelineNodes=4`，包含 2 个照片节点和 2 个事件节点，事件节点 `time=18:45`；`shareSummary=这场聚会留下 2 张公开照片、2 条账本高光和 2 个关键时刻。`。 |
| share-poster 截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-link-cleanup-008bi-share-poster-ready-390-20260619.png -Mode right`。 |
| share-poster 截图 | `docs/runtime/pr-qa-link-cleanup-008bi-share-poster-ready-390-20260619.png`，尺寸 `410x1032`。 |
| share-poster 截图观察 | 页面显示主按钮 `去分享`、次按钮 `刷新状态`，状态小字为 `分享图已准备好`；主视觉仍为记录时间节点流，未见生成中 / 失败大卡回退。 |
| 刷新状态命令 | `npm.cmd --% run wechat:auto -- tap --port 9420 --selector ".poster-action-secondary[data-share-save-selector='share-flow-015-save']" --selectorTimeout 8000 --wait 4500 --storage --data shareTask,saveState,displayTaskStatus,taskPrimaryLabel,posterImagePath,posterImageUrl,readyShareImageUrl,qrCodeImageUrl,posterStatusLine,errorText`。 |
| 刷新状态结果 | 点击后仍为 `shareTask.status=ready`，`displayTaskStatus=可保存`，`readyShareImageUrl` 和 `qrCodeImageUrl` 保持有值，`posterStatusLine=分享图已准备好`，未回退成生成中或假状态；Console=`[]`。 |
| ready 主按钮命令 | `npm.cmd --% run wechat:auto -- tap --port 9420 --selector ".poster-primary-action" --selectorTimeout 8000 --wait 6000 --storage --data shareTask,saveState,displayTaskStatus,taskPrimaryLabel,posterImagePath,posterImageUrl,readyShareImageUrl,qrCodeImageUrl,posterStatusLine,errorText,posterSaved,savePosterLabel`。 |
| ready 主按钮结果 | 点击成功；`saveState=saved`；`posterSaved=true`；`savePosterLabel=去分享`；`posterImagePath=http://tmp/...png`；`posterStatusLine=分享图已生成，可点击去分享`；Console=`[]`。本轮按 PM 收口，不继续等待原生“去分享”面板。 |
| 保存后截图 | `docs/runtime/pr-qa-link-cleanup-008bi-share-poster-after-save-390-20260619.png`，尺寸 `410x1032`。 |
| ready PNG GET 命令 | `curl.exe -s -D docs/runtime/pr-qa-link-cleanup-008bi-share-poster-ready-original-headers-20260619.txt -o docs/runtime/pr-qa-link-cleanup-008bi-share-poster-ready-original-20260619.png http://127.0.0.1:3221/uploads/moments/share-tasks/share-task-1781865942423-96fd9bd9.png`。 |
| ready PNG GET 摘要 | HTTP `200 OK`；`Content-Type=image/png`；文件 `docs/runtime/pr-qa-link-cleanup-008bi-share-poster-ready-original-20260619.png`，大小 `287373` bytes。 |
| ready PNG 像素检查 | 使用 `pngjs` 读取原图：尺寸 `900x1400`；二维码裁剪区域 `{left:680,top:1196,width:108,height:108}`；`cropStddev=[52.25,69.36,86.34]`、`cropMin=[5,0,0]`、`cropMax=[255,255,255]`、`cropUniqueColors=2688`，说明底部右侧二维码区域非空白且高对比。裁剪图：`docs/runtime/pr-qa-link-cleanup-008bi-share-poster-ready-qr-crop-20260619.png`。 |
| 静态二维码 GET | `curl.exe -s -D docs/runtime/pr-qa-link-cleanup-008bi-static-share-miniapp-qr-headers-20260619.txt -o docs/runtime/pr-qa-link-cleanup-008bi-static-share-miniapp-qr-20260619.png http://127.0.0.1:3221/static/share-miniapp-qr.png`；HTTP `200 OK`，`Content-Type=image/png`，文件大小 `133743` bytes。 |
| share-poster 结论 | `share-poster 分享图生成 / 二维码单点预览框阶段通过`：指定 ready task 数据齐全，刷新状态不回退，ready 主按钮可点击并生成 `posterImagePath`，ready PNG 原图 GET 200 且底部二维码区域通过像素检查；不等待原生分享面板，不代表真机或上线通过。 |
| 退回 / 阻塞汇总 | 退回前端：live-record data 仍有 `finishMatchLabel=生成相册`，与 UI “结束聚会”不一致；share-poster `keyEvents.time=时间未记录`，若该字段进入 UI / 保存图需继续清理为真实时间。退回接口联调 / 后端/API / 前端协同：ledger 头像 `avatarUrl=""`，不能证明真实头像；缺 host token、可回滚样本或 cleanup 方案，账本“确定修改”提交和提交后 live-record / 账本 tab 立即反映变动未测。 |
| 最终结论 | `008BI 局部预览框阶段通过 / ledger 写入与头像阻塞 / 字段风险待修`：live-record 页面视觉入口与横杠清理局部通过，share-poster ready 生成链路与 PNG 二维码通过；ledger 真实头像和确认提交未闭环，结束聚会 data 字段残留需前端核修。不得写 008BI 真机通过、上线通过或全链路通过。 |

#### 13.16.121 `PR-QA-LEDGER-HOST-WRITEBACK-AVATAR-END-008BP` 2026-06-19 待测门禁

本节只登记待测，不触发 DevTools，不重跑已通过的 `share-poster` ready / 二维码链路；等待后端/API、接口联调、前端三方回包并由 PM 放行后再执行。

| 项 | 记录 |
| --- | --- |
| 当前状态 | `blocked / standby`：接口联调 008BN 已回包并提供 host 样本；后端/API 008BM 已回包头像字段合同，但当前样本头像值仍多为 `""`，字段存在不等于真实头像通过；继续等待前端 `PR-FE-LEDGER-HOST-WRITEBACK-TIMELINE-EVENT-008BQ` 与接口联调 `PR-INT-LEDGER-REAL-AVATAR-SAMPLE-008BR` 最终回包，再由 PM 明确放行。未放行前不得跑 DevTools、不得跑旧版本或写通过。 |
| 008BN 已知证据边界 | 008BN 已提供 host token 尾号 `ddceb616`、`sessionId=session-1781787045680-8e406c`，并证明 `PUT /sessions` 只更新账本计数，`POST /sessions/:id/events` 才会新增 timeline 账本事件。该证据只说明接口写入路径和样本可用，不代表前端“确定修改”页面动作已把计数更新和 timeline event 写入合成一个可测动作。 |
| 后端/API 008BM 准入 | 008BM 已回包头像字段合同；但当前样本头像值仍多为 `""`，只能证明字段合同存在，不能证明真实头像展示通过。后续仍必须由 008BR 提供带真实非空 `avatarUrl` 的 host / member 样本，或明确头像源缺失阻塞；空字符串、默认头像、占位头像不能作为真实头像通过依据。 |
| 接口联调 008BN 准入 | 已回包但仍需在 PM 放行时提供可执行写入前后摘要、cleanup / 回滚命令和当前 host token 使用方式；测试不得把 008BN 的接口写入证据写成前端页面通过。 |
| 接口联调 008BR 准入 | 必须提供带真实非空 `avatarUrl` 的 host / member 样本，或给出头像源缺失的明确阻塞结论；同时说明头像 URL 是否可访问、是否可在 ledger / live-record 页面渲染、是否有样本清理要求。无 008BR 真实头像样本前，不得执行真实头像通过判定。 |
| 前端 008BO / 008BQ 准入 | 008BO 已修 `finishMatchLabel=结束聚会` 和账本刷新，但尚未把“确定修改”与 timeline event 写入合成一个可测页面动作；需等待 008BQ 最终回包，明确 host 点击“确定修改”时同时完成账本计数更新和 `POST /sessions/:id/events` timeline 事件写入，并提供 `typecheck`、`check:encoding`、目标 diff check、关键词扫描和前端自测 data。 |
| 待测 1 host 真实头像 | 使用接口联调给出的 host storage 打开 `/pages/ledger/index?sessionId=<sessionId>&role=host` 和 `/pages/live-record/index?sessionId=<sessionId>&role=host`；记录 `players[].avatarUrl`、`records[].avatarUrl`、timeline actor avatar 字段、截图。只有真实可访问 URL 且页面真实渲染头像才写通过；空头像 / 默认头像 / 仅首字母头像写退回或阻塞。 |
| 待测 2 host 确定修改提交 | 在 host 视角执行一次受控加减：先点击 `+/-`，确认只进入暂存态 `ledgerDirty=true` 且未立即写入；再点击“确定修改”，必须记录 `PUT /sessions` 计数更新和 `POST /sessions/:id/events` timeline event 写入两类响应、`ledgerSubmitting`、提交后 `players/stats/ledgerEventCount` 和 Console / Network；按接口联调方案回滚或记录 cleanup。 |
| 待测 3 写回同步 | 提交后返回或打开 `live-record` 的记录 tab 与账本 tab，核验 timeline 新增或更新 `drink_debt/drink_add` 节点，账本 tab 计数与 ledger 页一致；若只更新账本计数但不新增 timeline event，退前端 008BQ；若前端已发 event 但接口不落事件，退后端/API + 接口联调。 |
| 待测 4 member 只读 | 使用 member token 打开同一 ledger / live-record 账本 tab，确认不暴露 `+/-`、不暴露“确定修改”、不出现英文 `forbidden`；member 只读仍显示成员名、头像和账本数据。 |
| 待测 5 结束聚会字段一致 | 打开 `live-record`，记录 `finishMatchLabel`、结束按钮文案、selector / page data；UI、selector、data 均应与“结束聚会”一致，不得再残留 `生成相册` 误导字段。 |
| 待测命令基线 | 复测前先 `npm.cmd run wechat:auto -- status --port 9420 --storage`；后续串行 relaunch / tap：`/pages/ledger/index?sessionId=<sessionId>&role=host`、`/pages/live-record/index?sessionId=<sessionId>&role=host`、member 只读路径；截图用 `scripts\capture-wechat-devtools-preview.ps1 -Mode right`。 |
| 证据要求 | 命令原文、summary.page / query、page data、Console / Network / storage 摘要、token 后 8 位、截图路径、写入前后摘要、失败原文、cleanup / 回滚结果；完整 token 不得入文档。 |
| 失败退回 | 头像字段为空或默认头像退后端/API 008BM + 前端；host 无法编辑、无暂存态、无“确定修改”、提交后不刷新退前端；页面动作只触发 `PUT /sessions` 但不触发 `POST /sessions/:id/events` 退前端 008BQ；接口 401 / 403 / 404 / 500 或写入不落事件退后端/API + 接口联调；member 暴露可写控件或英文 `forbidden` 退前端；`finishMatchLabel=生成相册` 残留退前端。 |
| 禁止结论 | 不重跑 share-poster ready / 二维码通过项；不写真机、上线或全链路通过；008BQ 与 008BR 未最终回包并获 PM 放行前不得执行；不得把 008BN 的接口写入证据写成前端页面通过；不得把 008BM 的字段存在或空头像样本写成真实头像通过；没有真实头像 URL、写入回滚方案、页面截图 / data / Network 证据时，不得写 ledger host 写回或真实头像通过。 |

#### 13.16.122 `PR-PM-LEDGER-HOST-WRITEBACK-AVATAR-END-008BP-SUPPLEMENT` 2026-06-19 PM 替代单点核验

本节为 PM 在测试线程连续 `systemError` 后执行的替代单点核验，只用于解除/定位 008BP 阻塞，不等同测试验收负责人正式准出；不写真机、上线或全链路通过。本轮只操作本地 DevTools 9420 与本地 3221 样本，不改业务源码、不 cleanup 样本、不触碰 `pomer.cn` 官网。

| 项 | 记录 |
| --- | --- |
| 触发原因 | 测试线程 `019ed491-b1a9-7612-81bf-f478e3dd941e` 在 host storage 切换阶段连续 `systemError`；PM 恢复指令后仍只有用户消息，无 13.16.122、截图、Network 或 page data。 |
| status/storage 命令 | `npm.cmd run wechat:auto -- status --port 9420 --storage --output docs/runtime/pr-pm-008bp-status-before.png`。 |
| status/storage 摘要 | 当前 DevTools 已是 host：`profileId=user-1781787045678-c892b9`，token 公开只记后 8 位 `ddceb616`，`runtime-api-base=http://127.0.0.1:3221/api/v1`，`social-current-profile.avatarUrl=/static/avatar-1.png`，Console=`[]`。 |
| ledger host 有效命令 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/ledger/index?sessionId=session-1781787045680-8e406c&role=host" --wait 4500 --data sessionId,sessionName,players,stats,records,pendingChanges,submitState,ledgerEditable,ledgerDirty,ledgerSubmitting,isJudge,errorText,loading,hasSession,ledgerEventCount --output docs/runtime/pr-pm-008bp-ledger-host-before.png`。 |
| ledger host 初始 data | `summary.page=pages/ledger/index`，query 含 `role=host`；`sessionName=周末聚会记录`；`ledgerEditable=true`，`isJudge=true`，`hasSession=true`，`ledgerDirty=false`，`ledgerSubmitting=false`，`ledgerEventCount=3`；成员名为房主、成员A、成员B；账本计数为房主 `0/0`、成员A `debtCount=2`、成员B `drinkCount=1`；Console=`[]`。 |
| ledger host 初始截图 | `docs/runtime/pr-pm-008bp-ledger-host-before.png`。 |
| avatar 页面问题 | ledger host 初始 data 中 `players[].avatarUrl` 全部为 `""`，与接口联调 008BR 的本地测试头像样本不一致；页面不能写头像通过。 |
| 暂存点击命令 | `npm.cmd --% run wechat:auto -- tap --port 9420 --selector ".ledger-stepper-btn-active" --selectorTimeout 8000 --wait 1000 --data sessionId,sessionName,players,stats,pendingChanges,submitState,ledgerEditable,ledgerDirty,ledgerSubmitting,isJudge,errorText,ledgerEventCount --output docs/runtime/pr-pm-008bp-ledger-host-after-adjust.png`。 |
| 暂存点击结果 | 点击后 `ledgerDirty=true`，`ledgerEditable=true`，Console=`[]`；但该通用 selector 命中后房主 `debtCount 0 -> 2`，stats 欠酒 `2 -> 4`，可能是自动化 selector/点击行为不够精确，本条不作为“单击 UI 必然 +2”的用户侧缺陷结论，只作为本轮测试写入增量来源。 |
| 暂存截图 | `docs/runtime/pr-pm-008bp-ledger-host-after-adjust.png`。 |
| 确定修改命令 | `npm.cmd --% run wechat:auto -- tap --port 9420 --selector ".ledger-confirm-submit" --selectorTimeout 8000 --wait 3500 --data ... --output docs/runtime/pr-pm-008bp-ledger-host-after-confirm.png`。 |
| 确定修改命令结果 | 命令在截图阶段失败：`Error: fail to capture screenshot`。后续无截图 relaunch 证明写入已落：`ledgerDirty=false`、`ledgerEventCount=5`、房主 `debtCount=2`、成员A `debtCount=2`、成员B `drinkCount=1`。 |
| ledger relaunch after confirm | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/ledger/index?sessionId=session-1781787045680-8e406c&role=host" --wait 3500 --data ...`；返回 `ledgerDirty=false`、`ledgerEventCount=5`、`stats=成员3 / 欠酒4 / 加酒1`、Console=`[]`；截图仍因 DevTools capture 失败未产生。 |
| live-record host data 命令 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=host" --wait 4500 --data sessionId,sessionName,sessionStatus,statusText,startTimeText,finishMatchLabel,finishActionLabel,activeSegment,recordTimelineItems,recordTimelineDisplayItems,ledgerTimelineItems,timelineNodes,players,records,isJudge,ledgerEditable,errorText,loading,timelineLoading`。 |
| live-record host data 摘要 | `sessionName=周末聚会记录`；`startTimeText=18:10`；`finishMatchLabel=结束聚会`；`recordTimelineItems=6`，包含 2 个照片节点、原始欠酒/加酒、008BN 欠酒事件和本轮 `event-1781868034882-55de3528`；新增节点 `createdAt=2026-06-19T11:20:34.882Z`，`scoreText=2 杯`，`detail=聚会记录师房主 给 聚会记录师房主 记了 2 杯欠酒`；`ledgerTimelineItems=4`；Console 仅多条 `[session-exit] enableAlertBeforeUnload enabled` info，无阻塞红错。 |
| live-record avatar 问题 | live-record page data 中 `recordTimelineItems[].actorAvatarUrl`、`timelineNodes[].uploaderAvatarUrl`、`players[].avatarUrl`、`records[].avatarUrl` 仍为空；而本地 API `/api/v1/sessions/session-1781787045680-8e406c/timeline` 返回 `avatarNonEmpty=7`，最近账本事件 `operatorAvatarUrl=/static/avatar-1.png`、`targetAvatarUrl=/static/avatar-1.png`。判断为前端 normalize / page 映射丢头像，退前端。 |
| 本地 API 摘要 | host token 尾号 `ddceb616` 调 `/api/v1/sessions/session-1781787045680-8e406c/timeline`：HTTP 200，`nodeCount=7`，`ledgerEventCount=4`，最近事件 `event-1781868034882-55de3528` 为 `drink_debt`，`scoreDelta=2`，头像字段非空。 |
| 截图工具风险 | `ledger` 确定修改后截图与 `live-record` 截图均报 `fail to capture screenshot`；因此本节以 page data/API 摘要为主证据，正式 QA 恢复后仍需补右侧预览截图与 Network 证据。 |
| PM 单点结论 | `ledger host 写回 / live-record timeline 同步：PM 补充单点通过，待 QA 恢复复核`；`头像页面渲染：退前端`；`截图/Network 证据：测试工具链待恢复`。不得写测试正式通过、真机通过、上线通过或全链路通过。 |

#### 13.16.123 `PR-QA-LEDGER-HOST-WRITEBACK-AVATAR-END-008BP` 2026-06-19 测试侧恢复复测记录

本节为测试线程在 PM 恢复指令后继续 008BP 单点复测的正式记录，只覆盖 ledger host 写回、live-record 同步、member 只读与头像链路；不重跑 `share-poster` ready / 二维码链路，不 cleanup 样本，不触碰 `pomer.cn` 官网，不写真机、上线或全链路通过。

| 项 | 记录 |
| --- | --- |
| 前置 status 命令 | `npm.cmd run wechat:auto -- status --port 9420 --storage`。 |
| 前置 status 摘要 | DevTools storage 已切到 host：`runtime-api-base=http://127.0.0.1:3221/api/v1`；`profileId=user-1781787045678-c892b9`；公开只记录 `tokenTail=ddceb616`；`profileName=聚会记录师房主`；`social-current-profile.avatarUrl=/static/avatar-1.png`；Console=`[]`。 |
| host storage 切换说明 | 初次最小 Node 脚本误读 `social.sessions` 失败，原文 `Cannot read properties of undefined (reading 'find')`；随后改为从 `backend/data/social-store.json` 的 `userSessions` 读取本地 host token，写入 `runtime-api-base`、`jzp-user-token`、`social-current-profile-id`、`social-current-profile`，公开只记录 `tokenTail=ddceb616`，未输出完整 token。 |
| host ledger 命令 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/ledger/index?sessionId=session-1781787045680-8e406c&role=host" --wait 4500 --storage --data sessionId,sessionName,players,stats,ledgerEventCount,ledgerEditable,ledgerDirty,ledgerSubmitting,isJudge,errorText,loading,hasSession`。 |
| host ledger 初始结果 | `summary.page=pages/ledger/index`；query=`{sessionId:"session-1781787045680-8e406c",role:"host"}`；`sessionName=周末聚会记录`；初始返回曾出现 `ledgerEditable=false/isJudge=false`，后续页面状态更新后进入 host 可编辑态；成员名为房主、成员A、成员B；但 `players[].avatarUrl=""`，不能写真实头像通过；Console=`[]`。 |
| host 初始截图 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-ledger-host-writeback-008bp-ledger-host-blocked-390-20260619.png -Mode right`；截图路径 `docs/runtime/pr-qa-ledger-host-writeback-008bp-ledger-host-blocked-390-20260619.png`，尺寸 `410x1032`。 |
| host 暂存点击命令 | `npm.cmd --% run wechat:auto -- tap --port 9420 --selector ".ledger-stepper-btn-active" --selectorTimeout 8000 --wait 1500 --storage --data sessionId,sessionName,players,stats,ledgerEventCount,ledgerEditable,ledgerDirty,ledgerSubmitting,isJudge,errorText,loading,hasSession`。 |
| host 暂存点击结果 | 页面处于 `ledgerEditable=true/isJudge=true`；点击后 `ledgerDirty=true`，房主欠酒从 `0` 进入暂存，stats 变为 `成员3 / 欠酒3 / 加酒1`；Console=`[]`。 |
| host 确定修改命令 | `npm.cmd --% run wechat:auto -- tap --port 9420 --selector ".ledger-confirm-submit" --selectorTimeout 8000 --wait 5000 --storage --data sessionId,sessionName,players,stats,ledgerEventCount,ledgerEditable,ledgerDirty,ledgerSubmitting,isJudge,errorText,loading,hasSession`。 |
| host 确定修改结果 | 提交后 `ledgerDirty=false`、`ledgerSubmitting=false`、`ledgerEventCount=5`；房主 `debtCount=2`，stats=`成员3 / 欠酒4 / 加酒1`；Console=`[]`。本轮最小一次 `+` 后落库为 `scoreDelta=2` / 房主欠酒 `0 -> 2`，与“最小 +1”预期不一致，需退回前端 008BQ / 接口联调核查差异计算和 selector 命中。 |
| host 提交后截图 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-ledger-host-writeback-008bp-ledger-after-submit-390-20260619.png -Mode right`；截图路径 `docs/runtime/pr-qa-ledger-host-writeback-008bp-ledger-after-submit-390-20260619.png`，尺寸 `410x1032`。 |
| 后端 store 摘要 | 只读 `backend/data/admin-store.json` 与 `backend/data/moments-store.json`：members 中 host/memberA/memberB 分别有 `/static/avatar-1.png`、`/static/avatar-2.png`、`/static/avatar-3.png`；新增 event `event-1781868034882-55de3528`，`eventType=drink_debt`，operator/target 均为 host，`scoreDelta=2`，`caption=账本确认修改：欠酒变动`，`createdAt=2026-06-19T11:20:34.882Z`。该证据说明后端样本和事件存在，但页面 data 仍未消费头像。 |
| live-record 直接 relaunch 命令 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=host" --wait 5000 --storage --data sessionId,sessionName,finishMatchLabel,activeSegment,recordTimelineItems,recordTimelineDisplayItems,timelineNodes,records,players,isJudge,ledgerEditable,ledgerTimelineItems,errorText,loading,timelineLoading`。 |
| live-record 直接 relaunch 结果 | 命令返回仍停在 `pages/ledger/index`，未直接进入 `live-record`；记录为导航 / guard 待核查，不作为业务通过证据。 |
| live-record 返回命令 | `npm.cmd --% run wechat:auto -- tap --port 9420 --selector ".ledger-primary" --selectorTimeout 8000 --wait 5000 --storage --data sessionId,sessionName,finishMatchLabel,activeSegment,recordTimelineItems,recordTimelineDisplayItems,timelineNodes,records,players,isJudge,ledgerEditable,ledgerTimelineItems,errorText,loading,timelineLoading`。 |
| live-record 返回结果 | `summary.page=pages/live-record/index`；query=`{sessionId:"session-1781787045680-8e406c",role:"judge"}`；`sessionName=周末聚会记录`；`finishMatchLabel=结束聚会`；`activeSegment=record`；`recordTimelineItems`、`timelineNodes`、`ledgerTimelineItems` 均包含新增后端事件 `event-1781868034882-55de3528`；`timelineNodes[].clientEventId=ledger-confirm-user-1781787045678-c892b9-drink_debt-lataw07n-0`；`scoreDelta=2`；Console 仅有 `[session-exit] enableAlertBeforeUnload enabled` info，无阻塞红错。 |
| live-record 同步截图 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-ledger-host-writeback-008bp-live-record-after-submit-390-20260619.png -Mode right`；截图路径 `docs/runtime/pr-qa-ledger-host-writeback-008bp-live-record-after-submit-390-20260619.png`，尺寸 `410x1032`。 |
| live-record 头像问题 | `players[].avatarUrl`、`records[].avatarUrl`、timeline 相关头像字段仍为空；与本地 store 中 `/static/avatar-*.png` 非空样本不一致。退回前端 / service normalization / 后端 facade 协同核查页面消费链路；不得把 `/static/avatar-*.png` 字段存在写成页面真实头像通过。 |
| member storage 恢复 | 通过最小 Node 脚本恢复 memberA storage：`profileId=user-1781787045679-f3f2eb`，公开只记录 `tokenTail=b8615971`，`profileName=聚会记录师成员A`，`avatarUrl=/static/avatar-2.png`；完整 token 未入文档。 |
| member ledger 命令 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/ledger/index?sessionId=session-1781787045680-8e406c&role=member" --wait 4000 --storage --data sessionId,sessionName,players,stats,ledgerEventCount,ledgerEditable,ledgerDirty,ledgerSubmitting,isJudge,errorText,loading,hasSession`。 |
| member ledger 结果 | `summary.page=pages/ledger/index`；query=`{sessionId:"session-1781787045680-8e406c",role:"member"}`；storage 为 memberA `tokenTail=b8615971`；但 page data 仍显示 `ledgerEditable=true`、`isJudge=true`，stats=`成员3 / 欠酒4 / 加酒1`，`ledgerEventCount=5`；Console=`[]`。这是 member 只读权限回归失败，退回前端权限 / storage 状态刷新逻辑。 |
| member 异常截图 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-ledger-host-writeback-008bp-ledger-member-editable-regression-390-20260619.png -Mode right`；截图路径 `docs/runtime/pr-qa-ledger-host-writeback-008bp-ledger-member-editable-regression-390-20260619.png`，尺寸 `410x1032`。 |
| Network / API 证据边界 | miniprogram-automator 本轮未导出完整 Network 面板；以 page data、DevTools Console、storage 摘要和本地 store / event 摘要作为写回旁证。若后续需要精确证明 `PUT /sessions/:sessionId` 与 `POST /sessions/:sessionId/events` 两条请求，需前端或接口联调提供可复跑 Network 抓取命令；本轮不伪造 Network 通过。 |
| 局部确认 | host storage 切换成功；host ledger 可进入暂存并点击“确定修改”；提交后 `ledgerDirty=false`、`ledgerEventCount` 增加；live-record 从后端拉到新增账本事件；`finishMatchLabel=结束聚会` 已修正；Console 无阻塞红错。 |
| 退回项 | 退回前端 008BQ / 接口联调：一次最小 `+` 后提交落为 `scoreDelta=2`，需核查差异计算和 selector / UI 操作命中。退回前端 / service normalization / 后端 facade：ledger 与 live-record page data 仍为空头像，未消费 008BR 的 `/static/avatar-*.png`。退回前端权限：恢复 memberA 后 `ledgerEditable=true/isJudge=true`，member 只读路径仍暴露可写状态。 |
| 阻塞项 | 缺完整 Network 面板抓取，不能写 `PUT + POST` 两条请求在 DevTools Network 层预览框通过；未 cleanup 当前 008BN / 008BR 样本，按 PM 禁止事项保留。 |
| 最终结论 | `008BP 局部修复确认 / 退回前端 + 接口联调 / 非全量通过`：host 写回和 live-record 后端事件同步有 page data / store 旁证，但真实头像页面渲染、member 只读权限、最小加减 delta、Network 请求证据均未闭环。不得写 008BP 真机通过、上线通过或全链路通过。 |

#### 13.16.126 `PR-QA-LEDGER-HOST-WRITEBACK-AVATAR-END-008BP-RESUME-AFTER-008BT` 2026-06-19 正式恢复复测记录

本节在 PM 确认 008BS / 008BT 已修复头像映射与 ledger 权限后恢复 008BP 单点复测；只测 ledger host 写回、live-record 同步、memberA 只读，不重复 `share-poster` ready / 二维码链路，不 cleanup 当前 008BN / 008BR / PM 样本，不触碰 `pomer.cn` 官网，不写真机、上线或全链路通过。

| 项 | 记录 |
| --- | --- |
| 前置现状 | 进入本轮前 DevTools 为 memberA：`runtime-api-base=http://127.0.0.1:3221/api/v1`，`profileId=user-1781787045679-f3f2eb`，公开只记录 `tokenTail=b8615971`，Console=`[]`。 |
| host storage 切换命令摘要 | 使用 miniprogram-automator 最小 Node 脚本，从 `backend/data/social-store.json` 本地读取 host session，写入 `runtime-api-base`、`jzp-user-token`、`social-current-profile-id`、`social-current-profile`；首次误用 `mini.setStorage` 失败，原文 `TypeError: mini.setStorage is not a function`，随后改用 `callWxMethod('setStorageSync', ...)` 成功。公开只记录 `profileId=user-1781787045678-c892b9`、`tokenTail=ddceb616`、`avatarUrl=/static/avatar-1.png`，未输出完整 token 到文档。 |
| host ledger relaunch 命令 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/ledger/index?sessionId=session-1781787045680-8e406c&role=host" --wait 4500 --storage --data sessionId,sessionName,players,stats,ledgerEventCount,ledgerEditable,ledgerDirty,ledgerSubmitting,isJudge,errorText,loading,hasSession`。 |
| host ledger data 摘要 | `summary.page=pages/ledger/index`；query=`{sessionId:"session-1781787045680-8e406c",role:"host"}`；`sessionName=周末聚会记录`；三人头像均为非空本地静态样本 URL：host `/static/avatar-1.png`、memberA `/static/avatar-2.png`、memberB `/static/avatar-3.png`；`stats=成员3 / 欠酒4 / 加酒1`；`ledgerEventCount=5`；`isJudge=true`；`ledgerEditable=true`；`ledgerDirty=false`；`ledgerSubmitting=false`；Console=`[]`。 |
| host ledger 初始截图 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-008bp-after-008bt-ledger-host-before-390-20260619.png -Mode right`；截图路径 `docs/runtime/pr-qa-008bp-after-008bt-ledger-host-before-390-20260619.png`，尺寸 `410x1032`。 |
| host 暂存命令 | `npm.cmd --% run wechat:auto -- tap --port 9420 --selector ".ledger-stepper-btn-active" --selectorTimeout 8000 --wait 1500 --storage --data sessionId,sessionName,players,stats,ledgerEventCount,ledgerEditable,ledgerDirty,ledgerSubmitting,isJudge,errorText,loading,hasSession`。 |
| host 暂存结果 | 点击后 host `debtCount=3`，stats 欠酒 `4 -> 5`；`ledgerDirty=true`，`ledgerSubmitting=false`，`ledgerEditable=true`，`isJudge=true`；`ledgerEventCount` 尚为 `5`；Console=`[]`。 |
| host 确定修改命令 | `npm.cmd --% run wechat:auto -- tap --port 9420 --selector ".ledger-confirm-submit" --selectorTimeout 8000 --wait 6000 --storage --data sessionId,sessionName,players,stats,ledgerEventCount,ledgerEditable,ledgerDirty,ledgerSubmitting,isJudge,errorText,loading,hasSession`。 |
| host 确定修改结果 | 提交后 host `debtCount=3`；stats=`成员3 / 欠酒5 / 加酒1`；`ledgerEventCount=6`；`ledgerDirty=false`；`ledgerSubmitting=false`；`isJudge=true`；`ledgerEditable=true`；Console=`[]`。本轮 +1 后新增事件为 `scoreDelta=1`，13.16.123 的 +2 风险未复现。 |
| host 提交后截图 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-008bp-after-008bt-ledger-host-after-submit-390-20260619.png -Mode right`；截图路径 `docs/runtime/pr-qa-008bp-after-008bt-ledger-host-after-submit-390-20260619.png`，尺寸 `410x1032`。 |
| Network / 等价证据 | DevTools automator 本轮未提供可导出的 Network 面板；不伪造 Network。替代可复跑证据：只读 `backend/data/admin-store.json` 与 `backend/data/moments-store.json`，确认 members 头像和计数已落库，`sessionEvents` 新增 `event-1781869127785-63af140e`，`eventType=drink_debt`，`scoreDelta=1`，operator/target 均为 host，createdAt=`2026-06-19T11:38:47.785Z`。这可证明页面提交后后端样本中已存在对应 event，但不能替代 DevTools Network 面板的 `PUT /sessions/:sessionId` + `POST /sessions/:sessionId/events` 双请求截图。 |
| store 摘要脚本失败记录 | 首次读取 `moments.timelineEvents` 失败，原文 `TypeError: Cannot read properties of undefined (reading 'filter')`；实际 store 字段为 `sessionEvents`，修正后取得上述 event 摘要。该失败为测试读取脚本字段错误，不判业务失败。 |
| live-record relaunch 命令 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=host" --wait 5000 --storage --data sessionId,sessionName,finishMatchLabel,activeSegment,recordTimelineItems,recordTimelineDisplayItems,timelineNodes,records,players,isJudge,ledgerEditable,ledgerTimelineItems,errorText,loading,timelineLoading`。 |
| live-record data 摘要 | `summary.page=pages/live-record/index`；query=`{sessionId:"session-1781787045680-8e406c",role:"host"}`；`sessionName=周末聚会记录`；`finishMatchLabel=结束聚会`；`recordTimelineItems=8`，含 3 个照片节点、原始欠酒 / 加酒、008BN 事件、13.16.123 的 `event-1781868034882-55de3528` 和本轮新增 `event-1781869127785-63af140e`；新增事件 detail=`聚会记录师房主 给 聚会记录师房主 记了 1 杯欠酒`，`scoreText=1 杯`，`timeText=19:38`；`timelineNodes` 同步含新增 event；`ledgerTimelineItems=5`；`players/records/recordTimelineItems/timelineNodes` 头像 URL 均非空；Console 仅 `[session-exit] enableAlertBeforeUnload enabled` info，无阻塞红错。 |
| live-record 截图 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-008bp-after-008bt-live-record-host-after-submit-390-20260619.png -Mode right`；截图路径 `docs/runtime/pr-qa-008bp-after-008bt-live-record-host-after-submit-390-20260619.png`，尺寸 `410x1032`。 |
| memberA storage 恢复 | 使用最小 Node 脚本恢复 memberA storage；公开只记录 `profileId=user-1781787045679-f3f2eb`、`tokenTail=b8615971`、`avatarUrl=/static/avatar-2.png`，完整 token 未入文档。 |
| memberA ledger 命令 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/ledger/index?sessionId=session-1781787045680-8e406c&role=member" --wait 4500 --storage --data sessionId,sessionName,players,stats,ledgerEventCount,ledgerEditable,ledgerDirty,ledgerSubmitting,isJudge,errorText,loading,hasSession`。 |
| memberA ledger data 摘要 | `summary.page=pages/ledger/index`；query=`{sessionId:"session-1781787045680-8e406c",role:"member"}`；storage 为 memberA `tokenTail=b8615971`；三人头像均非空；`stats=成员3 / 欠酒5 / 加酒1`；`ledgerEventCount=6`；`isJudge=false`；`ledgerEditable=false`；`ledgerDirty=false`；`ledgerSubmitting=false`；Console=`[]`。member 只读权限回归通过，本轮未点击提交。 |
| memberA 截图 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-008bp-after-008bt-ledger-member-readonly-390-20260619.png -Mode right`；截图路径 `docs/runtime/pr-qa-008bp-after-008bt-ledger-member-readonly-390-20260619.png`，尺寸 `410x1032`。 |
| 本轮通过项 | `008BP ledger/live-record 单点预览框阶段局部通过`：host ledger 三人头像、host 权限、加减暂存、确定修改后 `ledgerDirty=false/ledgerSubmitting=false/ledgerEventCount=6`、live-record 后端事件同步、live-record 头像映射、`finishMatchLabel=结束聚会`、memberA 头像与只读权限均通过本轮 page data + 右侧截图复核。 |
| 未闭环 / 风险 | DevTools Network 面板未导出，不能写 Network 层 `PUT + POST` 双请求截图通过；当前样本未 cleanup，账本计数已继续增加，应由 PM / 接口联调决定是否后续清理或保留；`/static/avatar-*.png` 只代表本地测试头像样本链路通过，不代表微信授权头像、线上头像或真机通过。 |
| 最终结论 | `008BP ledger/live-record 单点预览框阶段通过 / Network 面板证据待补 / 非上线准出`：前端 008BS + 008BT 修复后，头像映射、host 写回、live-record 同步和 member 只读已通过本轮预览框复测；仍不得写真机、上线或全链路通过。 |

#### 13.16.124 `PR-PM-LEDGER-LIVE-AVATAR-MAP-008BS-VERIFY` 2026-06-19 PM 复核与再退回

本节只复核前端 008BS 头像字段映射回包，不替代测试线程正式准出，不写真机、上线或全链路通过。PM 本轮未新增账本写入、不 cleanup、不触碰 `pomer.cn` 官网。

| 项 | 记录 |
| --- | --- |
| 前端回包 | 前端 14.109 已完成：`normalizeManagedAvatarPath()` 保留 `/static/*`、`/uploads/*` 并转 API origin；`RemoteSessionEventRecord / ManagedSessionEventRecord` 增加 `operatorAvatarUrl / targetAvatarUrl`；`live-record` 账本节点头像优先使用 `node.targetAvatarUrl`。验证回包含 `typecheck`、`check:encoding`、目标/no-index diff check。 |
| PM 复核注意 | 不再并行执行 DevTools relaunch。首次 ledger/live-record 并行复核互相抢当前页，已作废；后续改为串行命令。 |
| live-record 串行命令 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=host" --wait 6500 --data sessionId,sessionName,players,records,recordTimelineItems,recordTimelineDisplayItems,timelineNodes,ledgerTimelineItems,finishMatchLabel,errorText,loading,timelineLoading --json`。 |
| live-record 复核结果 | `summary.page=pages/live-record/index`；`sessionName=周末聚会记录`；`players[].avatarUrl`、`records[].avatarUrl`、`timelineNodes[].uploaderAvatarUrl/operatorAvatarUrl/targetAvatarUrl`、`recordTimelineItems[].actorAvatarUrl` 均可见 `http://127.0.0.1:3221/static/avatar-*.png`；新增事件 `event-1781868034882-55de3528` 仍在记录时间线；`finishMatchLabel=结束聚会`；Console 只有 `[session-exit] enableAlertBeforeUnload enabled` info，无阻塞红错。 |
| ledger host storage | PM 用本地 `backend/data/social-store.json` 的 `userSessions` 恢复 host storage，公开只记录 `profileId=user-1781787045678-c892b9`、`tokenTail=ddceb616`；完整 token 未入文档。 |
| ledger host 命令 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/ledger/index?sessionId=session-1781787045680-8e406c&role=host" --wait 6500 --data sessionId,sessionName,players,stats,isJudge,ledgerEditable,ledgerDirty,ledgerSubmitting,ledgerEventCount,errorText,loading,hasSession --json`。 |
| ledger host 复核结果 | `summary.page=pages/ledger/index`；storage 已是 host `tokenTail=ddceb616`，但 page data 仍为 `isJudge=false`、`ledgerEditable=false`；`players` 中 host 与 memberB 头像可见，memberA `avatarUrl=""`。这说明 ledger 页权限判定与玩家头像来源仍未闭环，不能写 ledger host 可编辑或 ledger 全头像通过。 |
| 局部通过 | 008BS 对 `live-record` 的头像字段映射已通过 PM 单点 page data 复核；raw API / 页面 data 的头像断层在记录页已闭环。 |
| 再退回 | 新派前端 008BT：只修 `ledger` 页 `isJudge/ledgerEditable` 权限判定和 `players[].avatarUrl` 来源。要求用真实 host token / hostProfileId 判断，不允许 query 越权；memberA 仍必须只读；不得重做 UI、不得改后端合同、不得默认头像冒充。 |
| 仍缺证据 | 008BP 正式 QA 截图和 Network `PUT + POST event` 仍缺；测试线程恢复后需补。 |

#### 13.16.125 `PR-PM-LEDGER-PERMISSION-AVATAR-MAP-008BT-VERIFY` 2026-06-19 PM 单点复核

本节只复核前端 008BT 对 `ledger` 页权限与头像 page data 的修复，不写正式 QA 准出，不写真机、上线或全链路通过。PM 本轮只切换本地 DevTools storage 与只读 relaunch，未新增账本写入、未 cleanup、未触碰 `pomer.cn` 官网。

| 项 | 记录 |
| --- | --- |
| 前端回包 | 前端 14.110 已完成：`normalizeSocialAvatarUrl()` 放行 `/static/avatar-*.png`；`ledger.hydrateLedger()` 用 `getCurrentDisplayProfile()` 的真实 `id/name/avatarUrl` 同步 runtime.currentUser 后再比对 `liveSession.hostProfileId`；新增 `buildTimelineAvatarMap()` 用 `uploaderAvatarUrl/operatorAvatarUrl/targetAvatarUrl` 补齐 `players[].avatarUrl`。验证回包含 `typecheck`、`check:encoding`、目标/no-index diff check。 |
| host storage | PM 恢复 host storage：`profileId=user-1781787045678-c892b9`，公开只记录 `tokenTail=ddceb616`；完整 token 未入文档。 |
| host ledger 命令 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/ledger/index?sessionId=session-1781787045680-8e406c&role=host" --wait 6500 --storage --data sessionId,sessionName,players,stats,isJudge,ledgerEditable,ledgerDirty,ledgerSubmitting,ledgerEventCount,errorText,loading,hasSession --json`。 |
| host ledger 结果 | `summary.page=pages/ledger/index`；`sessionName=周末聚会记录`；`players` 三人头像均为 `http://127.0.0.1:3221/static/avatar-1/2/3.png`；`stats=成员3 / 欠酒4 / 加酒1`；`isJudge=true`、`ledgerEditable=true`、`ledgerDirty=false`、`ledgerSubmitting=false`、`ledgerEventCount=5`；Console=`[]`。 |
| memberA storage | PM 切换 memberA storage：`profileId=user-1781787045679-f3f2eb`，公开只记录 `tokenTail=b8615971`；完整 token 未入文档。 |
| memberA ledger 命令 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/ledger/index?sessionId=session-1781787045680-8e406c&role=member" --wait 6500 --storage --data sessionId,sessionName,players,stats,isJudge,ledgerEditable,ledgerDirty,ledgerSubmitting,ledgerEventCount,errorText,loading,hasSession --json`。 |
| memberA ledger 结果 | 同一账本页三人头像均可见；`isJudge=false`、`ledgerEditable=false`、`ledgerDirty=false`、`ledgerSubmitting=false`、`ledgerEventCount=5`；Console=`[]`。member 普通账号只读权限恢复。 |
| PM 单点结论 | 008BT ledger 权限与头像 page data 通过 PM 单点复核；008BS + 008BT 合并后，ledger/live-record 头像映射和 host/member 权限判定已可进入测试恢复复核。 |
| 仍缺证据 | 008BP 正式 QA 仍需补右侧预览截图、Network `PUT /sessions + POST /sessions/:id/events`、以及“确定修改”交互后的页面证据；本节不替代正式测试准出。 |

#### 13.16.127 `PR-QA-LIVE-RECORD-END-STATE-008BY` 2026-06-19 待测门禁

本节只登记待测门禁，不触发 DevTools 9420，不截图旧版本，不 cleanup 当前 008BN / 008BR / PM 样本，不重复 008BP 账本写回和 008BL 二维码链路。当前状态为 `blocked / standby`：等待后端/API `PR-BE-SESSION-END-STATE-008BV` 与前端 `PR-FE-LIVE-RECORD-END-STATE-008BW` 最终回包，并由 PM 明确放行后再执行。

| 项 | 记录 |
| --- | --- |
| 依赖状态 | 队列 / 总进度当前均显示 008BV、008BW 仍 `blocked`，无后端结束状态合同和无前端结束弹窗 / 状态收口实现证据；因此 008BY 只能登记待测，不能跑旧版本或写通过。 |
| 验收目标 | “结束聚会”必须是收口，不是退出、离开、删除或清空。点击 `结束聚会` 应弹出“确认结束聚会”语义的确认框；不得出现“确认退出聚会 / 离开聚会 / 清空该场聚会 / 删除聚会”等语义。 |
| 状态写回验收 | 确认结束后 session 仍存在，members / moments / brief / share task 不应被删除；page data / storage / API 或本地 store 应能证明 `state/status=已结束` 或后端明确结束字段，且存在 `endedAt` / `updatedAt` 或等价结束时间字段。 |
| 首页验收 | 结束后的聚会不得继续作为首页“进行中聚会”常驻展示；如果首页仍展示相关入口，必须标记为历史 / 已结束 / 最近记录，不得误导为可继续进行中。 |
| 个人中心 / 历史验收 | 进入 `/pages/me/index` 或前端回包指定历史入口，确认该聚会按“已结束”归类；所有开始过的聚会用于个人中心和后台管理时必须区分“进行中 / 已结束”两种状态。后台证据由后台角色提供，测试可用 API / store / page data 作佐证。 |
| 前端准入 | 前端 008BW 回包必须说明 `live-record` 结束按钮不再调用 `confirmAndExitSession()` / `deleteManagedSession()`，弹窗标题、正文、按钮均为结束语义；确认后调用后端结束状态接口或明确状态写入合同；首页、个人中心 / 历史消费结束状态；提供 `typecheck`、`check:encoding`、目标 diff check 和关键词扫描。 |
| 后端准入 | 后端 008BV 回包必须明确结束状态合同：接口路径 / 方法、状态枚举、`endedAt/updatedAt`、live / history / admin 读取口径；结束动作不得删除 session、members、moments、brief 或 share task；需给可复跑 API 命令、响应摘要和残留 / 不删除证据。 |
| 命令模板 1 前置 | PM 放行后先串行执行：`npm.cmd run wechat:auto -- status --port 9420 --storage`；记录 `summary.page/query`、`runtime-api-base`、profileId、token 后 8 位、Console 摘要。 |
| 命令模板 2 进入记录页 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/live-record/index?sessionId=<sessionId>&role=<host-or-member>" --wait 4500 --storage --data sessionId,sessionName,sessionStatus,statusText,state,endedAt,updatedAt,finishMatchLabel,finishActionLabel,canFinishSession,confirmDialogTitle,confirmDialogText,errorText,loading`。实际 `sessionId/profile/token` 以 008BV / 008BW 回包样本为准，不沿用旧样本写通过。 |
| 命令模板 3 弹窗 | 点击结束入口：`npm.cmd --% run wechat:auto -- tap --port 9420 --selector "<front-end-provided-finish-selector>" --selectorTimeout 8000 --wait 1500 --storage --data sessionId,sessionStatus,state,finishMatchLabel,finishActionLabel,confirmDialogTitle,confirmDialogText,confirmDialogVisible,errorText`；记录弹窗截图。若 selector 未提供，测试先用前端回包 selector，不猜测旧 selector 写通过。 |
| 命令模板 4 确认结束 | 点击确认按钮后读取 `sessionStatus/state/endedAt/updatedAt`，并用后端 008BV 提供的 API / store 只读命令验证 session 仍存在且状态为已结束；截图记录确认后页面或结束态。 |
| 命令模板 5 首页 / 个人中心 | 打开 `/pages/index/index` 与 `/pages/me/index` 或前端指定历史页，读取 `currentSession/recentSessions/recentAlbums/momentSummaries/sessionReturn/historyItems` 等可用 data；确认已结束聚会不再作为进行中常驻展示，并在个人中心 / 历史按已结束归类。 |
| Console / Network | 每一步记录 Console / Network / storage / page data / 右侧预览截图。若 DevTools Network 面板不能导出，必须写明工具限制，并用后端 008BV 可复跑 API 响应、local store 摘要、page data 作为替代证据；不得写 Network 通过。 |
| 截图命名基线 | `docs/runtime/pr-qa-live-record-end-state-008by-status-20260619.png`、`docs/runtime/pr-qa-live-record-end-state-008by-dialog-20260619.png`、`docs/runtime/pr-qa-live-record-end-state-008by-ended-live-record-20260619.png`、`docs/runtime/pr-qa-live-record-end-state-008by-home-20260619.png`、`docs/runtime/pr-qa-live-record-end-state-008by-me-history-20260619.png`。 |
| 失败退回 | 弹窗仍为退出 / 离开 / 删除 / 清空语义退前端 008BW；确认后调用删除接口、session 消失或清空相关数据退前端 + 后端 008BV；状态未写回或 API 401 / 404 / 500 退后端/API + 接口联调；首页 / 个人中心仍按进行中展示退前端；后台没有进行中 / 已结束状态证据退后台角色补证。 |
| 禁止范围 | 不重复 008BP 账本 host 写回、member 只读、头像；不重复 008BL / 008BI 分享二维码和保存图；除非结束状态影响这些页面，否则不扩展矩阵。不得写真机、上线或全链路通过。 |

#### 13.16.128 `PR-QA-LIVE-RECORD-END-STATE-008BY` 2026-06-19 DevTools 9420 正式复测记录

本节按 PM 放行执行 008BY 正式预览框复测，只覆盖结束聚会状态链路；不重复 008BP 账本写回和 008BL 二维码链路，不 cleanup 当前样本，不触碰 `pomer.cn` 官网，不写真机、上线或全链路通过。

| 项 | 记录 |
| --- | --- |
| 准入确认 | 队列 / 总进度已显示 008BV、008BW、008BX 均为 `evidence_ready` / 已回包，008BY 为 `ready_for_qa`；后端提供 `POST /api/v1/sessions/:sessionId/end` 与 `state/status=已结束`、`endedAt/updatedAt` 合同；前端提供“确认结束聚会 / 结束聚会 / 继续记录”弹窗与 `finishManagedSession()`；后台进行中统计不计入 `state=已结束`。 |
| DevTools 启动命令 | `pwsh -NoLogo -NoProfile -File scripts\start-wechat-devtools-automation.ps1 -Port 9420`；返回 `{"ok":true,"action":"started","port":9420,...}`。 |
| status 命令 | `npm.cmd run wechat:auto -- status --port 9420 --storage --output docs/runtime/wechat-automator-end-state-status-9420.png`。 |
| status 摘要 | `summary.page=pages/index/index`；初始 storage 为 `runtime-api-base=http://127.0.0.1:3221/api/v1`、profileId `user-1781787045679-f3f2eb`，但 `jzp-user-token=""`；Console=`[]`；截图 `docs/runtime/wechat-automator-end-state-status-9420.png`。 |
| 3221 环境恢复 | 首次进入页面后发现 token 被清空，接口只读验证 `fetch http://127.0.0.1:3221/api/v1/user/auth/session` 失败：`TypeError: fetch failed`，本地 3221 未监听。按既有本地运行方式启动：`$env:PORT='3221'; Start-Process -FilePath 'C:\Program Files\nodejs\npm.cmd' -ArgumentList '--prefix','backend','start' -WorkingDirectory 'F:\codexlist\jiuzhuopanguan' -RedirectStandardOutput 'docs/runtime/pr-qa-008by-local-api-3221.out.log' -RedirectStandardError 'docs/runtime/pr-qa-008by-local-api-3221.err.log' -WindowStyle Hidden`；stdout 显示 `jiuzhuopanguan backend listening on port 3221`。这是复测环境恢复，不是 cleanup。 |
| host storage 切换 | 使用 miniprogram-automator 最小 Node 脚本从 `backend/data/social-store.json` 写入 host storage；公开只记录 `profileId=user-1781787045678-c892b9`、`tokenTail=ddceb616`、`avatarUrl=/static/avatar-1.png`，完整 token 未入文档。接口验证 `/user/auth/session` 返回 HTTP 200，profileId 为 host。 |
| 进入 live-record 命令 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=host" --wait 5000 --storage --data sessionId,sessionName,sessionStatus,statusText,state,endedAt,updatedAt,finishMatchLabel,finishActionLabel,canFinishSession,errorText,loading,activeSegment,isJudge`。 |
| 进入 live-record data | `summary.page=pages/live-record/index`；query=`{sessionId:"session-1781787045680-8e406c",role:"host"}`；`sessionId=session-1781787045680-8e406c`；`sessionName=周末聚会记录`；`finishMatchLabel=结束聚会`；`activeSegment=record`；`isJudge=true`；Console 仅 `[session-exit] enableAlertBeforeUnload enabled` info，无阻塞红错。 |
| 结束前截图 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-live-record-end-state-008by-before-live-record-20260619.png -Mode right`；截图路径 `docs/runtime/pr-qa-live-record-end-state-008by-before-live-record-20260619.png`，尺寸 `410x1032`。 |
| 弹窗取证方式 | 原生 `wx.showModal` 不易用 automator 截取 / 点击确认；本轮使用 `mini.mockWxMethod('showModal', function(options){...})` 只拦截弹窗参数并自动返回 `confirm=true`，不改业务源码。首次执行后页面跳转导致旧 page 对象读取报 `Error: page destroyed`，但结束动作已触发；后续以当前页 status、modal storage 和 store/API 摘要收口。 |
| 弹窗文案证据 | 从 `qa-008by-showModal-options` 读取：`title=确认结束聚会`；`content=结束后聚会会保留在我的记录中，可继续查看相册、账本和分享内容。`；`confirmText=结束聚会`；`cancelText=继续记录`。未出现退出、离开、删除、清空语义。 |
| 结束后当前页 | 结束动作后 status 显示当前页为 `pages/me/index`，host storage 保持 `tokenTail=ddceb616`，Console=`[]`；说明确认后页面收口到个人中心。 |
| store 状态证据 | 只读 `backend/data/admin-store.json`：`session-1781787045680-8e406c` 仍存在，`state=已结束`，`status=已结束`，`endedAt=2026-06-19T15:10:21.647Z`，`updatedAt=2026-06-19T15:10:21.647Z`，members=3；未删除 session。 |
| API 只读摘要 | host token 调 `/api/v1/sessions/live` 返回 HTTP 200 / `code=0`，返回的是另一个仍进行中的 `session-1781863809747-96b0b0`，不是已结束的 `session-1781787045680-8e406c`；本地 activeSessionIds 不含 `session-1781787045680-8e406c`，`endedSessionStillActive=false`。这证明已结束局未被 live 兜底为进行中。 |
| 首页命令 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/index/index" --wait 4500 --storage --data home,sessionReturn,loggedIn,loading,userName,lastLoadedAt`。 |
| 首页 data 摘要 | `loggedIn=true`；`userName=聚会记录师房主`；`sessionReturn.visible=false`、`sessionReturn.sessionId=""`、`sessionReturn.status=""`，未把已结束 session 常驻为进行中；`home.recentTools[0]` 为 `brief-1781787045693-bc8904b9`，`name=周末聚会记录`，`badgeText=分享图`，route 为 `/pages/session-brief/index?briefId=brief-1781787045693-bc8904b9`。 |
| 首页截图 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-live-record-end-state-008by-home-20260619.png -Mode right`；截图路径 `docs/runtime/pr-qa-live-record-end-state-008by-home-20260619.png`，尺寸 `410x1032`。 |
| 个人中心命令 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/me/index" --wait 4500 --storage --data currentProfile,features,assetStats,wineStats,momentSummaries,visiblePendingAlbums,pendingAlbumTotal,loggedIn,loading`。 |
| 个人中心 data 摘要 | `currentProfile.id=user-1781787045678-c892b9`；`momentSummaries[0].sessionId=session-1781787045680-8e406c`、`sessionName=周末聚会记录`、`shareImageStatus=ready`；`visiblePendingAlbums[0].sessionId=session-1781787045680-8e406c`、`canResume=false`、`meta=分享图已生成`；Console=`[]`。个人中心有历史 / 简报入口且不可继续，但 data 未显式暴露 `state/status=已结束` 字段或“已结束”标签。 |
| 个人中心截图 | `docs/runtime/pr-qa-live-record-end-state-008by-me-history-20260619.png`、`docs/runtime/pr-qa-live-record-end-state-008by-me-after-20260619.png`，尺寸均为 `410x1032`。 |
| 串行问题记录 | 本轮中途曾并行执行一次首页 relaunch 与已结束 live-record relaunch，造成当前页互相抢占；该条并行结果作废，后续首页与个人中心均已按串行方式补证。 |
| Network 限制 | DevTools automator 未提供 Network 面板导出；本轮不写 Network 通过。以 `wx.showModal` mock 参数、page data、Console、local store、API 只读摘要作为替代证据；未观察到 session 被删除，store/API 证明 session 仍存在。 |
| 通过项 | `结束聚会弹窗语义` 通过：标题 / 正文 / 确认 / 取消均为结束聚会 / 继续记录语义，无退出 / 离开 / 删除 / 清空。`状态写回` 通过：session 仍存在且 `state/status=已结束`，有 `endedAt/updatedAt`。`首页进行中展示` 通过：该局不再作为 `sessionReturn` 进行中常驻展示，`sessions/live` 不返回该已结束局。 |
| 待补 / 退回项 | `个人中心 / 历史显式归类` 待前端 / 后台补证：当前个人中心能看到该局历史 / 简报入口且 `canResume=false`，但 page data 与截图未出现显式 `已结束` 状态标签；后台已说明缺 `endedAt` 列不阻塞本轮前台链路，但后续后台字段增强仍需单独补。 |
| 最终结论 | `008BY 前台结束链路预览框阶段局部通过 / 个人中心已结束显式标签待补证 / 非上线准出`。不得写真机通过、上线通过或全链路通过。 |

#### 13.16.129 `PR-QA-LIVE-HERO-OVERLAP-008CA-RETEST` 2026-06-19 顶部 Hero 压字单点复拍

本节只执行 `live-record` 顶部 Hero 单点复拍，不重复 008BY 结束聚会、不重复 008BP 账本写回、不重复分享 / 二维码链路；不改 PM 总进度、公告、派发队列；不写真机、上线或全链路通过。

| 项 | 记录 |
| --- | --- |
| 样本选择 | 008BY 已将 `session-1781787045680-8e406c` 结束，不再适合作为“进行中”Hero 复拍样本。本轮改用仍进行中的 host 样本 `session-1781810681607-249f31`，聚会名 `生'史'局`，hostProfileId=`user-1781787045679-f3f2eb`，公开只记录 host token 后 8 位 `b8615971`。 |
| storage 切换 | 使用 miniprogram-automator 最小 Node 脚本写入 `runtime-api-base=http://127.0.0.1:3221/api/v1`、`jzp-user-token`、`social-current-profile-id=user-1781787045679-f3f2eb`、`social-current-profile`；未输出完整 token。 |
| status 命令 | `npm.cmd run wechat:auto -- status --port 9420 --storage`。 |
| status 摘要 | 当前页原为 `pages/me/index`；storage 为 memberA / host 样本，`tokenTail=b8615971`；Console=`[]`。 |
| relaunch 命令 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/live-record/index?sessionId=session-1781810681607-249f31&role=host" --wait 5000 --storage --data sessionId,sessionName,finishMatchLabel,activeSegment,isJudge,memberCountText,startTimeText,elapsedText,playerCount,statusText,sessionStatus,state,errorText,loading,titleImageSrc`。 |
| page data 摘要 | `summary.page=pages/live-record/index`；query=`{sessionId:"session-1781810681607-249f31",role:"host"}`；`sessionId=session-1781810681607-249f31`；`sessionName=生'史'局`；`titleImageSrc=""`，说明标题走真实文本而非图片标题；`memberCountText=1/2 人`；`startTimeText=18:10`；`elapsedText=05:06:33`；`finishMatchLabel=结束聚会`；`isJudge=true`；Console 仅 `[session-exit] enableAlertBeforeUnload enabled` info，无阻塞红错。 |
| 截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-live-hero-overlap-008ca-current-410x1032-20260619.png -Mode right`。 |
| 截图路径 | `docs/runtime/pr-qa-live-hero-overlap-008ca-current-410x1032-20260619.png`，截图脚本返回 `width=410,height=1032`。当前自动化未提供 320 / 375 / 390 宽切换能力，本轮只记录当前右侧预览宽度；未伪造多宽度截图。 |
| 视觉观察 | 右侧预览图中顶部状态胶囊仍被左侧裁切，仅露出末尾“中”；玩家聚会名 `生'史'局` 为文本且可读，右侧齿轮 / 更多按钮未压住标题；人数 / 时间 / 计时 meta 可读，但状态胶囊不完整，未满足“状态胶囊完整可见”的验收点。 |
| 当前结论 | `退回前端 008CA`：Hero 标题文本和右侧按钮未见明显互压，Console 无阻塞红错；但状态胶囊仍左侧裁切，不能写 008CA 预览框阶段通过。 |
| 下一步责任 | 前端继续修 `.live-record008as-hero-top` / `.live-record008as-status` 的左侧安全区、定位和宽度，确保 390 / 当前右侧预览下完整显示“进行中”；测试待前端回包后只复拍 `live-record` Hero，不扩大矩阵。 |

#### 13.16.130 `PR-QA-LIVE-HERO-STATUS-CLIP-008CD-RETEST` 2026-06-19 顶部状态胶囊裁切单点复拍

本节只执行 `live-record` 顶部 Hero 状态胶囊单点复拍，不重复 008BY 结束聚会、不重复账本 / 分享 / 二维码 / 个人中心链路；不改 PM 总进度、公告、派发队列；不写真机、上线或全链路通过。

| 项 | 记录 |
| --- | --- |
| 准入确认 | 前端 14.114 已回包 `PR-FE-LIVE-HERO-STATUS-CLIP-008CD`：`.live-record008as-hero-top` 左边界改为 `72px`，360px 以下紧凑规则为 `64px`，并缩小 gap、胶囊 padding、工具按钮尺寸；未改标题数据来源、结束聚会、账本、分享、相册或个人中心。前端自报 `typecheck`、`check:encoding`、目标 diff check 通过。 |
| 样本选择 | 沿用 13.16.129 的仍进行中样本 `session-1781810681607-249f31`，聚会名 `生'史'局`；当前 storage 为 `runtime-api-base=http://127.0.0.1:3221/api/v1`，`profileId=user-1781787045679-f3f2eb`，公开只记录 `tokenTail=b8615971`。 |
| 前置 status 命令 | `npm.cmd run wechat:auto -- status --port 9420 --storage`。 |
| 前置 status 摘要 | 当前页已在 `pages/live-record/index?sessionId=session-1781810681607-249f31&role=host`；storage 为上述 memberA / host 样本；Console=`[]`。 |
| role=host relaunch 命令 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/live-record/index?sessionId=session-1781810681607-249f31&role=host" --wait 5000 --storage --data sessionId,sessionName,finishMatchLabel,activeSegment,isJudge,memberCountText,startTimeText,elapsedText,playerCount,statusText,sessionStatus,state,errorText,loading,titleImageSrc`。 |
| role=host relaunch 结果 | 命令返回 `ok=true`，但 `summary.page=pages/index/index`，Console 出现多条 `[session-exit] enableAlertBeforeUnload enabled` info；判断该路径被离场守卫 / role 路由带回首页，本条不作为通过证据。 |
| 有效 relaunch 命令 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/live-record/index?sessionId=session-1781810681607-249f31&role=member" --wait 5000 --storage --data sessionId,sessionName,finishMatchLabel,activeSegment,isJudge,memberCountText,startTimeText,elapsedText,playerCount,statusText,sessionStatus,state,errorText,loading,titleImageSrc,recordTimelineDisplayItems`。 |
| 有效 page data 摘要 | `summary.page=pages/live-record/index`；query=`{sessionId:"session-1781810681607-249f31",role:"member"}`；`sessionId=session-1781810681607-249f31`；`sessionName=生'史'局`；`titleImageSrc=""`，说明标题为真实文本而非图片标题；`memberCountText=1/2 人`；`startTimeText=18:10`；`elapsedText=05:12:28`；`playerCount=2`；`finishMatchLabel=结束聚会`；`isJudge=true`；`recordTimelineDisplayItems=[]`；Console 仅 `[session-exit] enableAlertBeforeUnload enabled` info，无阻塞红错。 |
| 截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-live-hero-status-clip-008cd-current-410x1032-20260619.png -Mode right`。 |
| 截图路径 | `docs/runtime/pr-qa-live-hero-status-clip-008cd-current-410x1032-20260619.png`，截图脚本返回 `width=410,height=1032`。当前自动化未提供 320 / 375 / 390 宽切换能力，本轮只记录当前右侧预览宽度；未伪造多宽度截图。 |
| 视觉观察 | 右侧预览图中状态胶囊已完整显示“进行中”，不再只露出末尾“中”；右侧齿轮 / 更多按钮未压住标题；玩家聚会名 `生'史'局` 为真实文本且可读，不是图片字或固定标题；人数 / 开始时间 / 计时 meta 行可读；底部 CTA 与本轮验收无关，未扩大判断。 |
| 当前结论 | `008CD live-record Hero 状态胶囊单点预览框阶段通过 / 非上线准出`：本轮确认 410x1032 右侧预览下状态裁切问题已修复，Console 无新增阻塞红错。因自动化无法切 320 / 375 / 390 宽，多宽度仍待后续可控窗口补证；无需继续退回前端 008CD。 |
| 下一步责任 | 前端无需继续修本次 008CD 状态胶囊裁切；若 PM 后续要求小宽度复拍，测试只补 `live-record` Hero 多宽截图，不扩大到结束聚会、账本或分享矩阵。 |

#### 13.16.131 `PR-QA-ME-ENDED-SESSION-LABEL-008CC-RETEST` 2026-06-19 个人中心已结束标签单点复拍

本节只复拍个人中心结束态标签，不重复 008CD Hero、不重复 008BY 结束聚会按钮、不重复账本、分享、二维码链路；不改 PM 总进度、公告、派发队列；不写真机、上线或全链路通过。

| 项 | 记录 |
| --- | --- |
| 准入确认 | 后端 008CB 已声明补 `state/stateText/status/endedAt/updatedAt/canResume/canShare/readyShareImageUrl`；前端 14.113 已回包 `PR-FE-ME-ENDED-SESSION-LABEL-008CC`，个人中心只按明确字段 `state/status/stateText/endedAt` 判断结束态并展示轻量“已结束”标签，入口文案为“查看”。前端自报 `typecheck`、`check:encoding`、目标 diff / no-index check 通过。 |
| 前置 status 命令 | `npm.cmd run wechat:auto -- status --port 9420 --storage`。 |
| 前置 status 摘要 | 当前页原为 `pages/live-record/index?sessionId=session-1781810681607-249f31&role=member`；storage 为 `runtime-api-base=http://127.0.0.1:3221/api/v1`，`profileId=user-1781787045679-f3f2eb`，公开只记录 `tokenTail=b8615971`；Console=`[]`。 |
| 个人中心 relaunch 命令 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/me/index" --wait 5000 --storage --data currentProfile,features,assetStats,wineStats,momentSummaries,visiblePendingAlbums,pendingAlbumTotal,loggedIn,loading,errorText`。 |
| page data 摘要 | `summary.page=pages/me/index`；`loggedIn=true`；`currentProfile.id=user-1781787045679-f3f2eb`；`momentSummaries` 共 5 条。目标已结束样本 `session-1781787045680-8e406c` 仍返回 `state=""`、`stateText=""`、`status=""`、`endedAt=""`、`updatedAt=""`、`canResume=false`、`shareImageStatus=ready`。对应 `visiblePendingAlbums` 仍为 `isEnded=false`、`stateLabel=""`、`actionLabel=查看`、`meta=分享图已生成`。 |
| 视觉截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-me-ended-session-label-008cc-20260619.png -Mode right`。 |
| 截图路径 | `docs/runtime/pr-qa-me-ended-session-label-008cc-20260619.png`，截图脚本返回 `width=410,height=1032`。截图中个人中心可见历史 / 相册列表入口和“查看”按钮，但未看到目标样本的“已结束”标签；当前首屏未完整露出目标 `周末聚会记录` 条目，视觉结论以 page data + API 摘要为主。 |
| Console 摘要 | relaunch 与截图期间 Console=`[]`，无新增阻塞红错。 |
| 本地 API 只读命令 | `node -e "... fetch('http://127.0.0.1:3221/api/v1/user/session-moment-summaries',{headers:{Authorization:'Bearer '+token}}) ..."`；脚本从 `backend/data/social-store.json` 读取 memberA token，只输出 `tokenTail` 和目标 session 摘要，未打印完整 token。 |
| 本地 API 摘要 | HTTP 200，`tokenTail=b8615971`，summaries 共 5 条；目标 `session-1781787045680-8e406c` 只读到 `sessionId` 与 `shareImageStatus=ready`，未读到 `state/stateText/status/endedAt/updatedAt/canResume/canShare/readyShareImageUrl` 等 008CB 声称字段。 |
| 当前结论 | `008CC 阻塞 / 退回后端/API 008CB 运行态字段未生效，前端 008CC 待复测`：当前 DevTools page data 与本地 API 均缺目标已结束字段，前端无法依据明确字段展示“已结束”。不能把 `canResume=false` 或 `actionLabel=查看` 单独写成结束态通过，也不能写个人中心 008CC 预览框通过。 |
| 下一步责任 | 后端/API 或接口联调先确认本地 `3221` 当前运行态 `/user/session-moment-summaries` 是否已加载 008CB 新字段，并提供目标样本 `session-1781787045680-8e406c` 的可复跑响应摘要；字段齐全后测试只复拍 `/pages/me/index`，不扩大到 008BY / 账本 / 分享矩阵。 |

#### 13.16.132 `PR-QA-ME-ENDED-SESSION-LABEL-008CC-RETEST-2` 2026-06-19 个人中心已结束标签二次复拍

本节在后端 008CE 确认本地 3221 重启并加载 008CB 字段后，只复拍个人中心结束态标签；不重复 008CD Hero、不重复 008BY 结束按钮、不重复账本、分享、二维码链路；不改 PM 总进度、公告、派发队列；不写真机、上线或全链路通过。

| 项 | 记录 |
| --- | --- |
| 复测准入 | PM 放行 008CC 二次复拍：后端 008CE 已确认旧本地 3221 进程未加载 008CB 字段，已只重启 jiuzhuopanguan 本地 3221 测试服务，新 API 对目标 `session-1781787045680-8e406c` 返回 `state/status/stateText=已结束`、`endedAt/updatedAt`、`canResume=false`、`canShare=true`、`readyShareImageUrl`。 |
| 前置 status 命令 | `npm.cmd run wechat:auto -- status --port 9420 --storage`。 |
| 前置 status 摘要 | 当前页为 `pages/me/index`；storage 为 `runtime-api-base=http://127.0.0.1:3221/api/v1`，`profileId=user-1781787045679-f3f2eb`，公开只记录 `tokenTail=b8615971`；Console=`[]`。 |
| relaunch 命令 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/me/index" --wait 6000 --storage --data currentProfile,features,assetStats,wineStats,momentSummaries,visiblePendingAlbums,pendingAlbumTotal,loggedIn,loading,errorText`。 |
| page data 摘要 | `summary.page=pages/me/index`；`loggedIn=true`；`currentProfile.id=user-1781787045679-f3f2eb`；`momentSummaries` 共 5 条。目标 `session-1781787045680-8e406c` 返回 `state=已结束`、`stateText=已结束`、`status=已结束`、`endedAt=2026-06-19T15:10:21.647Z`、`updatedAt=2026-06-19T15:10:21.647Z`、`canResume=false`、`canShare=true`、`shareImageStatus=ready`、`readyShareImageUrl=http://127.0.0.1:3221/uploads/moments/share-tasks/share-task-1781865942423-96fd9bd9.png`。 |
| visiblePendingAlbums 映射 | 目标 `session-1781787045680-8e406c` 映射为 `isEnded=true`、`stateLabel=已结束`、`actionLabel=查看`、`meta=结束于 6月19日 23:10`、`canResume=false`、`state/status=已结束`。已结束样本不再表现为可继续进行。 |
| Console 摘要 | relaunch 返回 Console=`[]`，无新增阻塞红错。 |
| 截图命令 | `pwsh -NoLogo -NoProfile -File scripts\capture-wechat-devtools-preview.ps1 -Output docs/runtime/pr-qa-me-ended-session-label-008cc-retest2-20260619.png -Mode right`。 |
| 截图路径 | `docs/runtime/pr-qa-me-ended-session-label-008cc-retest2-20260619.png`，截图脚本返回 `width=410,height=1032`。首屏可见个人中心列表和“查看”按钮，但目标 `周末聚会记录` 位于列表第 5 条，首屏截图未完全露出目标“已结束”标签；本轮通过结论以 page data / 映射字段为主。 |
| 滚动补证 | 使用最小 Node 脚本调用 `mini.pageScrollTo(920)` 后读取当前 page data，目标条目仍为 `isEnded=true/stateLabel=已结束/actionLabel=查看`；`page.scrollTop()` 返回 0，判断为页面内部滚动容器 / DevTools 工具限制，未能稳定把目标条目滚到右侧预览首屏。补图 `docs/runtime/pr-qa-me-ended-session-label-008cc-retest2-after-scroll-20260619.png` 仅作工具限制旁证，不伪造视觉标签截图。 |
| 当前结论 | `008CC 个人中心结束态字段与映射单点预览框阶段通过 / 视觉目标条目截图待更稳定滚动补证 / 非上线准出`：后端字段已在当前 3221 运行态生效，前端 page data 已把目标已结束样本映射为“已结束 / 查看 / 不可继续”。因自动化滚动未把第 5 条稳定截出，本轮不写完整视觉截图通过，但不再退回前端或后端。 |
| 下一步责任 | 若 PM 要求“已结束”标签的可见像素截图，需前端提供目标条目 selector / scroll-view selector 或测试在可控窗口补人工滚动截图；当前 008CC 字段链路和前端映射不再阻塞。 |

#### 13.16.133 `PR-QA-ME-ENTRY-ROUTES-008CG` 2026-06-19 个人中心最近回忆入口点击核查

本节只核查 `/pages/me/index` 个人中心“最近回忆”区域 `我创建的`、`我参与的`、`待分享`、右侧 `好友管理` 入口点击路由，不重复 008CC、008CD、008BY、账本写回、分享或二维码矩阵；不改 PM 总进度、公告、派发队列；不写真机、上线或全链路通过。

| 项 | 记录 |
| --- | --- |
| 前置 status 命令 | `npm.cmd run wechat:auto -- status --port 9420 --storage`。 |
| 前置 status 摘要 | 当前 storage 为 `runtime-api-base=http://127.0.0.1:3221/api/v1`，`profileId=user-1781787045679-f3f2eb`，公开只记录 `tokenTail=b8615971`；Console=`[]`。 |
| 元素读取 | 只读 `me` 页 WXML / 元素属性确认最近回忆统计项为 `.me-stat-item[data-label='我创建的']`、`.me-stat-item[data-label='我参与的']`、`.me-stat-item[data-label='待分享']`；右侧好友管理为 `.me-section-link[data-label='我的聚友']`。首次通用 selector 点击 `我创建的` 曾误点到 `session-brief`，后改用元素 `data-label` 精确查找后 tap；该误点不作为业务结果。 |
| `我创建的` 点击命令 | `node -e "... const label='我创建的'; ... mini.reLaunch('/pages/me/index'); ... page.$$('.me-stat-item') 按 data-label 精确查找后 tap ..."`；该命令只输出 page/query/data/Console 脱敏摘要。 |
| `我创建的` 结果 | 点击后 `summary.page=pages/ledger/index`，query=`{}`；data 为账本页：`sessionId=session-1781787045680-8e406c`、`sessionName=周末聚会记录`、stats=`成员3 / 欠酒5 / 加酒1`；Console=`[]`。实际进入账本页，不是“我创建 / 我发起的聚会列表或对应筛选”。 |
| `我创建的` 截图 | `docs/runtime/pr-qa-me-entry-routes-008cg-created-20260619.png`，截图脚本返回 `width=410,height=1032`。 |
| `我参与的` 点击命令 | `node -e "... const label='我参与的'; ... mini.reLaunch('/pages/me/index'); ... page.$$('.me-stat-item') 按 data-label 精确查找后 tap ..."`。 |
| `我参与的` 结果 | 点击后 `summary.page=pages/friend-hub/index`，query=`{}`；data 只有好友中心相关 `currentProfile/newFriendMatches/wineFriends`；Console=`[]`。实际进入好友管理页，不是“我参与的聚会列表或对应筛选”，且与右侧 `好友管理` 同落点。 |
| `我参与的` 截图 | `docs/runtime/pr-qa-me-entry-routes-008cg-joined-20260619.png`，截图脚本返回 `width=410,height=1032`。 |
| `待分享` 点击命令 | `node -e "... const label='待分享'; ... mini.reLaunch('/pages/me/index'); ... page.$$('.me-stat-item') 按 data-label 精确查找后 tap ..."`。 |
| `待分享` 结果 | 点击后 `summary.page=pages/privacy-state/index`，query=`{type:"feature"}`；data=`title=功能整理中`；Console=`[]`。当前 `待分享=0` 时没有进入待分享空态 / 无待分享说明 / 分享任务列表，而是进入通用功能整理页；虽未跳相册，但不满足本轮目标。 |
| `待分享` 截图 | `docs/runtime/pr-qa-me-entry-routes-008cg-unshared-20260619.png`，截图脚本返回 `width=410,height=1032`。 |
| `好友管理` 点击命令 | `npm.cmd --% run wechat:auto -- tap --port 9420 --path "/pages/me/index" --selector ".me-section-link[data-label='我的聚友']" --selectorTimeout 8000 --wait 4000 --storage --data currentProfile,newFriendMatches,wineFriends,newFriendName,loading,errorText,title,pageTitle`。 |
| `好友管理` 结果 | 点击后 `summary.page=pages/friend-hub/index`，query=`{}`；`wineFriends` 返回 2 条：`聚会记录师成员B`、`聚会记录师房主`；Console=`[]`。未跳相册或随机简报，符合好友管理入口预期。 |
| `好友管理` 截图 | `docs/runtime/pr-qa-me-entry-routes-008cg-friends-20260619.png`，截图脚本返回 `width=410,height=1032`。 |
| 当前结论 | `008CG 个人中心入口点击矩阵：1 项通过 / 3 项退回前端`。`好友管理` 通过；`我创建的` 退回前端：当前跳账本页；`我参与的` 退回前端：当前跳好友管理且与好友管理同路由；`待分享` 退回前端：当前跳通用功能整理页，不是待分享空态或分享任务列表。 |
| 下一步责任 | 前端修正 `handleWineStatTap()` 的 `我创建的 / 我参与的 / 待分享` 路由和筛选语义，提供可区分的列表页 / 空态页 / query；测试回包后只复测这 3 个入口，不扩大到个人中心视觉重做或其他链路。 |

#### 13.16.134 `PR-QA-ME-PENDING-MEMORY-COPY-TIMELINE-008CH-RETEST` 2026-06-19 待测门禁

本节只登记待测门禁，不触发 DevTools 9420，不复测旧版本，不截图旧页面，不扩大到分享图、账本写回、Hero、结束聚会或首页进行中。当前状态为 `blocked / waiting`：等待前端 `PR-FE-ME-PENDING-MEMORY-COPY-TIMELINE-008CH` 最终回包并由 PM 放行后再执行。

| 项 | 待测口径 |
| --- | --- |
| 任务目标 | 个人中心“待处理相册”旧口径需要清理为“待分享回忆”或同等用户可理解文案；待分享 / 待整理回忆的单卡点击主承接页应改为新版记录时间线，优先 `/pages/live-record/index?...`，不得继续以旧 `/pages/session-brief/index` 作为主承接页。 |
| 前端准入 | 前端 008CH 回包需说明 `miniprogram/pages/me/index.wxml`、`index.ts`、`index.less` 的改动；提供 `typecheck`、`check:encoding`、目标 diff check；说明待分享 / 待整理列表卡片点击目标、`查看全部` 过渡页和列表项点击目标；不得只改文案不改主承接路由。 |
| 文案断言 | `/pages/me/index` 用户可见文案不得再出现 `待处理相册`；应显示 `待分享回忆`、`待整理回忆` 或同等用户能理解文案。页面和过渡列表不得出现旧品牌、旧“待处理”口径或工程字段。 |
| 单卡点击断言 | 在 `/pages/me/index` 点击待分享 / 待整理回忆单卡后，应进入新版记录时间线页，优先 `pages/live-record/index`，query 应带可定位的 `sessionId` / role / 来源参数；不得进入旧 `pages/session-brief/index` 作为主承接页，不得跳相册或随机默认页。 |
| 查看全部断言 | 如 `查看全部` 仍进入相册 / 列表过渡页，该列表页文案也不得出现旧“待处理相册”；列表项点击必须进入新版记录时间线，不能只停在旧相册或旧简报页。 |
| 复测命令模板 1 | `npm.cmd run wechat:auto -- status --port 9420 --storage`；记录 `summary.page/query`、`runtime-api-base`、profileId、token 后 8 位、Console 摘要。 |
| 复测命令模板 2 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/me/index" --wait 6000 --storage --data currentProfile,features,assetStats,wineStats,momentSummaries,visiblePendingAlbums,pendingAlbumTotal,loggedIn,loading,errorText`；截图建议 `docs/runtime/pr-qa-me-pending-memory-copy-timeline-008ch-me-20260619.png`。 |
| 复测命令模板 3 | 点击前端回包指定的待分享 / 待整理单卡 selector，读取 `summary.page/query/dataKeys/data`；截图建议 `docs/runtime/pr-qa-me-pending-memory-copy-timeline-008ch-card-route-20260619.png`。若 selector 未提供，先使用 `me-pending-item` 的 `data-session-id/data-brief-id` 定位目标卡，但不得猜测通过。 |
| 复测命令模板 4 | 如需测 `查看全部`，点击 `.me-pending-more` 或前端指定 selector，记录过渡页 route / data / Console；再点击列表项，确认最终进入新版时间线。截图建议 `docs/runtime/pr-qa-me-pending-memory-copy-timeline-008ch-all-list-20260619.png`、`docs/runtime/pr-qa-me-pending-memory-copy-timeline-008ch-all-item-route-20260619.png`。 |
| 证据要求 | 每一步记录命令原文、`summary.page`、query、关键 page data、Console 摘要、storage token 后 8 位、右侧预览截图路径。若 automator 无法点击指定元素，记录 selector / 坐标失败原文，不用旧截图写通过。 |
| 失败退回 | 个人中心仍显示 `待处理相册`、单卡仍进入 `session-brief`、`查看全部` 列表或列表项仍进旧相册 / 旧简报、页面出现旧品牌 / 工程字段 / 旧待处理文案，均退回前端 008CH。接口 401 / 404 / data 缺失导致无法定位目标卡时，退接口联调 / 后端补样，不归因前端视觉。 |
| 禁止范围 | 不复测 008CG 统计入口矩阵，不重复 008CC 已结束标签、008CD Hero、008BY 结束聚会、008BP 账本写回、分享图 / 二维码链路；不得写真机、上线或全链路通过。 |

#### 13.16.135 `PR-QA-ME-ALBUM-SHARE-IA-008CI-RETEST` 2026-06-19 待测门禁

本节只登记个人中心信息架构待测门禁，不触发 DevTools 9420，不复测旧版本，不截图旧页面，不扩大到账本写回、分享图生成流程、Hero、结束聚会主链路。当前状态为 `blocked / waiting`：等待前端 `PR-FE-ME-ALBUM-SHARE-IA-008CI` 回包；若后端/API `PR-BE-ME-ALBUM-SHARE-IA-FIELDS-008CI` 回包说明字段不足，则等待合同补齐后再由 PM 放行复测。

| 项 | 待测口径 |
| --- | --- |
| 任务目标 | 个人中心顶部统计 / 最近回忆的信息架构需要收敛：不重复出现“待分享”；相册 / 回忆数代表所有状态聚会记录；下方只保留真正待分享回忆；分享图入口只展示已生成分享图；旧“待处理相册”、旧品牌和旧简报主承接页不得外露。 |
| 前端准入 | 前端 008CI 回包需说明 `miniprogram/pages/me/index.wxml`、`index.ts`、`index.less` 及必要路由 / 列表页改动；提供 `typecheck`、`check:encoding`、目标 diff check；说明顶部统计、最近回忆、下方待分享回忆、分享图合集的 data 来源、点击目标和空态文案。 |
| 后端 / 合同准入 | 如前端需要后端新增或澄清字段，后端/API 008CI 需给出可复跑接口摘要，至少能区分所有状态聚会记录、进行中 / 已结束状态、未生成分享图且未结束、已生成分享图及 `readyShareImageUrl/shareImageStatus`。字段不足时测试保持 blocked，不用旧 data 写通过。 |
| 顶部统计断言 | `/pages/me/index` 顶部统计 / 最近回忆不得重复出现“待分享”；如果显示相册 / 回忆数，该数量应代表所有状态聚会记录，点击应进入对应列表，并能按进行中 / 已结束等状态分类或筛选；不得跳随机简报、账本、相册旧壳或同一个默认页。 |
| 下方待分享回忆断言 | 下方 `待分享回忆` 只展示未生成分享图且未结束的聚会；已结束聚会不得出现。若当前样本没有待分享项，应展示明确空态，不得显示 `待处理相册` 或旧后台口径。 |
| 分享图入口断言 | `分享图` 入口 / 合集只展示已生成分享图的聚会；点击具体项应能打开对应分享图查看或前端指定的分享图详情页；不得进入旧 `session-brief` 主承接页，不得混入未生成任务。 |
| 文案 / 旧壳断言 | 用户可见 UI 不得出现 `待处理相册`、旧品牌、raw/debug/internal 字段、旧“简报”作为主承接入口文案；如需要过渡列表，列表标题、空态、条目文案也必须使用新 IA。 |
| 复测命令模板 1 | `npm.cmd run wechat:auto -- status --port 9420 --storage`；记录 `summary.page/query`、`runtime-api-base`、profileId、token 后 8 位、Console 摘要。 |
| 复测命令模板 2 | `npm.cmd --% run wechat:auto -- relaunch --port 9420 --path "/pages/me/index" --wait 6000 --storage --data currentProfile,assetStats,wineStats,momentSummaries,visiblePendingAlbums,pendingAlbumTotal,loggedIn,loading,errorText`；截图建议 `docs/runtime/pr-qa-me-album-share-ia-008ci-me-20260619.png`。 |
| 复测命令模板 3 | 串行点击前端回包指定的相册 / 回忆数、分享图入口、待分享回忆单卡和必要的“查看全部”入口；每次记录 `summary.page/query`、关键 page data、Console、截图。截图基线：`docs/runtime/pr-qa-me-album-share-ia-008ci-album-list-20260619.png`、`docs/runtime/pr-qa-me-album-share-ia-008ci-share-list-20260619.png`、`docs/runtime/pr-qa-me-album-share-ia-008ci-pending-card-20260619.png`。 |
| 接口摘要 | 如页面 data 无法解释分类，补只读 API 摘要：`/api/v1/user/session-moment-summaries` 或后端 008CI 指定接口；公开只写 token 后 8 位，不输出完整 token；记录每类样本数量和目标 sessionId，不泄露敏感字段。 |
| 失败退回 | 顶部仍重复 `待分享`、相册 / 回忆数点击不能进入可分类列表、待分享回忆混入已结束聚会、分享图入口混入未生成任务、任一入口仍以旧 `session-brief` 为主承接页、页面出现 `待处理相册` / 旧品牌 / 工程字段，均退回前端 008CI。接口字段无法支持分类时退后端/API 008CI 或接口联调补合同。 |
| 禁止范围 | 不复测 008CH 文案与时间线承接以外的旧矩阵，不重复 008CG 统计入口、008CC 已结束标签、008BY 结束聚会、008BP 账本写回、分享图生成流程、Hero；不得写真机、上线或全链路通过。 |

#### 13.16.136 `PR-QA-ME-PROFILE-REDESIGN-008CJ-VISUAL-GATE` 2026-06-19 个人中心视觉验收门禁

本节只补充个人中心视觉验收边界，不触发 DevTools 9420，不复测旧版本，不用当前旧布局截图写视觉通过。当前状态为 `blocked / waiting`：等待 UI/UX `PR-UX-ME-PROFILE-REDESIGN-SKILL-008CJ` 设计图 / 资产清单回包，以及后续前端 008CJ 复刻实现回包后，再由 PM 放行视觉复测。

| 项 | 门禁 |
| --- | --- |
| 与 008CI 边界 | `PR-QA-ME-ALBUM-SHARE-IA-008CI-RETEST` 可以先验 IA / 路由 / 字段语义：顶部统计是否重复、相册 / 回忆数分类、待分享回忆过滤、分享图合集、旧文案 / 旧承接页清理。但 008CI 不得写个人中心视觉通过。 |
| UI/UX 准入 | UI/UX 008CJ 需回包个人中心整页、聚会记录分类列表、分享图合集页设计图和资产清单，并给出退回码 / 验收点；如使用 SKILL 生成，应在 UI/UX 计划中记录选择依据、使用边界和资产路径。 |
| 前端准入 | 前端后续复刻任务需明确对照 UI/UX 008CJ 设计图 / 资产清单实现个人中心、分类列表和分享图合集页；提供 `typecheck`、`check:encoding`、目标 diff check、关键截图或 page data；不得只沿旧布局微调后请求视觉通过。 |
| 视觉复测断言 | PM 放行后，测试需对照 UI/UX 008CJ 的设计图、资产清单和退回码逐项核验；当前旧布局截图、旧卡片结构、旧首屏密度、旧相册 / 分享入口布局均不能作为视觉接收依据。 |
| 证据要求 | 后续视觉复测需记录 9420 右侧预览截图、page route/query/data、Console 摘要、storage token 后 8 位，以及与 UI/UX 008CJ 设计图 / 资产清单的差异结论。 |
| 失败退回 | 未对照 008CJ 设计图、资产缺失、仍使用旧布局 / 旧卡片 / 旧 IA 视觉、旧品牌或工程字段外露、分类列表 / 分享图合集页视觉未按资产包复刻，均按 UI/UX 008CJ 退回码退前端 / UIUX。 |
| 禁止范围 | UI/UX 008CJ 和前端复刻回包前，不复测旧视觉，不把 008CI 的 IA / 路由 / 字段通过扩展成视觉通过；不得写真机、上线或全链路通过。 |

#### 13.16.137 `PR-QA-GLOBAL-OLD-STYLE-SHELL-BAN-008CK` 2026-06-20 旧壳 / 框套框全局视觉门禁

本节只记录后续视觉验收的全局退回规则，不触发 DevTools 9420，不复测旧版本，不扩大到已拆分的数据链路。用户已明确退回前端旧样式习惯：页面“全是框，一框圈一框”。后续任何视觉准出不得把旧壳 / 框套框写成通过。

| 项 | 门禁 |
| --- | --- |
| 全局适用范围 | 适用于后续所有新实现或重做页面的视觉验收，包括但不限于个人中心、聚会记录分类列表、分享图合集页、记录 / 账本页、分享页和二级列表页。数据链路、IA、字段、路由可单独记录预览框阶段通过，但视觉通过必须另按本门禁和对应 UI 图核验。 |
| 个人中心边界 | 当前个人中心视觉不再按旧布局验收通过；必须等待 UI/UX 008CJ 设计图 / 资产清单和前端复刻回包后，按 13.16.136 与本节共同验收。 |
| P0 / P1 退回项 | 任一新实现页出现明显框套框、卡套卡、旧浅色块兜底、重复胶囊、厚重长列表、过多边框 / 阴影包裹、页面区块继续套旧容器壳、视觉像旧小程序后台表单或旧相册卡片，测试必须标记 P0 / P1 视觉退回，不能写视觉通过。 |
| 不接受的兜底 | 不接受“样式近似”“临时浅色块”“CSS 胶囊堆叠”“旧卡片换文案”“只清旧词但布局仍旧壳”等替代方案作为视觉通过依据；如 UI/UX 已提供资产或设计图，必须按设计图 / 资产清单 / 退回码对照。 |
| 可单独通过范围 | IA / 字段 / 路由 / API / Console 无红错可以单独写“预览框阶段局部通过”，但必须明确“不代表视觉通过”；不得把数据可用、路由正确、Console 干净扩展成页面视觉接收。 |
| 证据要求 | 视觉复测必须提供右侧预览截图、对照 UI 图 / 资产清单的差异说明、Console 摘要和退回码；如果只做 IA / 字段 / 路由复测，应在结论中写明视觉待 UI/UX / 前端复刻后另测。 |
| 失败归属 | 旧壳 / 框套框来自前端实现或复刻不到位时退前端；UI 图本身仍保留旧框套框、厚列表或兜底块时退 UI/UX；字段或数据不足导致只能显示旧空态 / 兜底时退后端/API 或接口联调补合同。 |
| 禁止范围 | 本门禁不要求重复测试已拆分的数据链路；不得因旧壳视觉退回而重跑账本写回、结束聚会、分享生成或其他已拆分单点，除非 PM 明确说明该视觉问题依赖对应链路。不得写真机、上线或全链路通过。 |
