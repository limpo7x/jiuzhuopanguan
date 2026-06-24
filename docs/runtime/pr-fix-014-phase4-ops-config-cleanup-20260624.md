# FIX-014 第四阶段运营配置保守收敛

- 日期：2026-06-24
- 工作树：`F:\codexlist\jiuzhuopanguan-fix-014-phase3`
- 分支：`codex/fix-014-phase3-p2-stability`
- 范围：`FIX-014-19` 到 `FIX-014-25`
- 边界：只面向 `api.pomer.cn` / `jiuzhuopanguan`，未触碰 `pomer.cn` 公司官网。

## 职责分派

- 运营配置负责人：`FIX-014-19`、`FIX-014-20`、`FIX-014-24`，负责模板、首页、积分奖励的新口径配置。
- 产品/运营负责人：`FIX-014-21`、`FIX-014-22`，负责会员/权益与商户合作是否开放的产品口径。
- 后端/API 负责人：确保空配置与关闭状态不会返回可领取、可兑换或可开通的假成功动作。
- 前端负责人：处理用户侧空态和旧口径文案，不恢复旧页面。
- QA/独立验收负责人：只按证据验收，不把未闭环的会员、商户、奖励写为通过。
- PM：汇总证据与边界，不直接把正式发布准出写成已完成。

## 实现内容

### FIX-014-19 模板配置

- `backend/data/content.js` 在模板配置为空时提供最小免费主题模板：
  - 生日聚会
  - 老友见面
  - 团建聚会
  - 家庭聚会
- 所有默认模板 `cost=0`，不制造高级/付费模板心智。
- `miniprogram/pages/premium-templates` 改为“主题模板”，会员入口文案改为权益待开放。

### FIX-014-20 首页配置

- `backend/data/content.js` 在首页配置为空时提供最小首页口径：
  - 标题：聚会记录师
  - 副标题：三步创建聚会，先拍第一张照片。
  - 快捷工具：生成邀请码、照片压缩
- 旧 Hero 不再作为主口径；后台“酒桌判官页主图”改为“记录广场主图”。

### FIX-014-21 会员/权益

- 继续保持后台 `membershipEnabled=false` 关闭口径。
- `member-center` 改为“聚会权益”空态，不再自动跳回首页。
- 用户侧文案明确“当前不支持开通或领取”，不承诺会员套餐、付费或订阅。

### FIX-014-22 商户合作

- 不导入假商户。
- `merchant-partners` 无配置时显示“合作优惠待配置”，并明确没有真实商户和核销合同前不开放领取或核销。
- `backend/data/front.js` 商户 notice 改为待配置/领取核销未开放。

### FIX-014-23 分享素材

- 不新增后台运营素材。
- `backend/data/front.js` 分享素材 notice 改为“分享素材以动态聚会图为主；后台运营素材待配置。”
- 后台分享素材选项从旧“战报海报/战报分享”改为“聚会分享图/聚会分享”。

### FIX-014-24 积分奖励

- 只保留内置首次登录奖励。
- 不新增可随手领取的聚会任务，避免没有真实完成条件时被直接领取。
- 奖励商品保持空；积分页“积分商城”改为“积分奖励”，无商品时显示“奖励兑换暂未开放”。

### FIX-014-25 旧页面与旧题库

- `miniprogram/app.json` 当前未注册旧 `judge-wheel`、`question-bank`、`table-mode` 等页面，本轮不恢复旧页面。
- 仅收敛已注册页面里的配置相关旧口径文案。

## 本地验证

```powershell
node --check backend/data/content.js
node --check backend/data/front.js
node --check backend/data/commerce.js
node --check backend/data/admin.js
node --check scripts/wechat-devtools-automator.js
npm.cmd run check:encoding
npm.cmd run typecheck
```

结果：全部通过。

配置读取抽查：

```json
{
  "homeTitle": "聚会记录师",
  "quickTools": 2,
  "templates": [
    { "title": "生日聚会", "cost": 0 },
    { "title": "老友见面", "cost": 0 },
    { "title": "团建聚会", "cost": 0 },
    { "title": "家庭聚会", "cost": 0 }
  ],
  "pointsTasks": ["task-first-login"],
  "pointsRewards": 0,
  "merchantNotice": "合作优惠待配置，当前不开放领取或核销。",
  "shareNotice": "分享素材以动态聚会图为主；后台运营素材待配置。"
}
```

## 未覆盖

- 未导入真实商户、会员套餐、可兑换奖励或后台分享素材。
- 未做线上部署后公网接口复核。
- 未上传微信小程序包。
- 阶段2/3预览框仍存在旧编译包问题，不能写正式发布准出。
