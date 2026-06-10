const fs = require('fs')
const path = require('path')
const { createStoreAccessor } = require('./store-accessor')

const storePath = path.join(__dirname, 'content-store.json')

const asset = (name) => `/static/${name}`

const TOOL_HISTORY_ID_BY_NAME = {
  二维码生成: 'qr-code',
  二维码: 'qr-code',
  九宫格切图: 'nine-grid',
  单位换算: 'unit',
  图片去水印: 'watermark',
  图片压缩: 'image-compress',
  房贷计算: 'loan-calc',
  'JSON 格式化': 'json',
  JSON格式化: 'json',
  汇率换算: 'currency',
  文字计数: 'text-count',
}

const normalizeToolHistoryId = (item = {}, fallback = {}, index = 0) => {
  const directId = String(item.id || '').trim()
  if (directId && !/^tool-\d+$/i.test(directId)) {
    return directId
  }

  const byName = TOOL_HISTORY_ID_BY_NAME[String(item.name || fallback.name || '').trim()]
  if (byName) {
    return byName
  }

  const fallbackId = String(fallback.id || '').trim()
  if (fallbackId && !/^tool-\d+$/i.test(fallbackId)) {
    return fallbackId
  }

  return `tool-${index + 1}`
}

const createDefaultCommerce = () => ({
  claimedTaskIds: [],
  taskStates: {
    'task-signin': {
      lastClaimAt: '',
    },
    'task-share-report': {
      claimHistory: [],
    },
    'task-reopen': {
      claimedSessionIds: [],
    },
  },
  membership: {
    active: false,
    activatedAt: '',
    expiresAt: '',
    planId: '',
  },
  membershipOrders: [],
  ownedRewardIds: [],
  pointsLedger: [],
  rewardRedemptions: [],
  templateUnlockProgress: {},
  templateUnlockRequiredViews: 3,
  unlockedTemplateIds: [],
})

const createDefaultUserCommerceState = () => ({
  points: 168,
  ...createDefaultCommerce(),
})

const createDefaultStore = () => ({
  profile: {
    nickname: '酒局发起人',
    avatarUrl: asset('avatar-host.png'),
    points: 168,
  },
  compliance: {
    copy: '理性饮酒，适量饮酒，未成年人禁止饮酒。',
  },
  toolHistory: [
    { id: 'watermark', name: '图片去水印', category: '图片工具', usedAt: '今天 18:30' },
    { id: 'json', name: 'JSON 格式化', category: '开发工具', usedAt: '今天 15:08' },
    { id: 'currency', name: '汇率换算', category: '计算工具', usedAt: '昨天 22:10' },
  ],
  homeConfig: {
    hero: {
      title: '酒桌判官',
      subtitle: '欠酒互怼 · 整活不断 · 气氛拉满',
      imageUrl: asset('party-hero.png'),
      imageUploadEndpoint: '/api/v1/admin/upload/home-hero',
      imageUpdateEndpoint: '/api/v1/admin/config/home/hero',
    },
    quickTools: [
      { id: 'image-compress', name: '图片压缩' },
      { id: 'text-count', name: '文字计数' },
      { id: 'qr-code', name: '二维码' },
      { id: 'loan-calc', name: '房贷计算' },
    ],
    banner: {
      title: '签到拿积分',
      imageUrl: asset('points-gift.png'),
    },
    judge: {
      title: '酒桌判官',
      subtitle: '远一点也能看清，开局、记分、出战报都更直接。',
      imageUrl: asset('party-hero.png'),
    },
  },
  pointsConfig: {
    balance: 3286,
    bannerImageUrl: asset('points-gift.png'),
    tasks: [
      { id: 'task-signin', title: '每日签到', value: 10, iconClass: 'points-icon-coin' },
      { id: 'task-share-report', title: '分享战报', value: 20, iconClass: 'points-icon-share' },
      { id: 'task-reopen', title: '完整结束一场聚会', value: 20, iconClass: 'points-icon-refresh' },
    ],
    rewards: [
      { id: 'reward-noads', title: '免广告特权（7天）', subtitle: '解锁工具页和战报页纯净模式', cost: 600, iconClass: 'points-icon-shield' },
      { id: 'reward-poster-pack', title: '高级海报模板包', subtitle: '扩展分享海报和邀局模板样式', cost: 800, iconClass: 'points-icon-image' },
      { id: 'reward-merchant-coupon', title: '商户优惠券', subtitle: '兑换合作商户的到店优惠券', cost: 500, iconClass: 'points-icon-coupon' },
      { id: 'reward-avatar-frame', title: '专属头像框（30天）', subtitle: '限时点亮酒局身份展示效果', cost: 300, iconClass: 'points-icon-crown' },
    ],
  },
  templateConfig: {
    filters: [
      { id: 'all', name: '全部' },
      { id: 'friendship', name: '友情互损' },
      { id: 'classic', name: '经典惩罚' },
      { id: 'party', name: '聚会整活' },
    ],
    templates: [
      { id: 'tpl-friendship', filterId: 'friendship', title: '友情互损', meta: '28 个玩法 · 适合死党局', cost: 800, imageUrl: asset('toolbox-hero.png') },
      { id: 'tpl-classic', filterId: 'classic', title: '经典惩罚', meta: '26 个玩法 · 轻松不水局', cost: 800, imageUrl: asset('party-hero.png') },
      { id: 'tpl-party', filterId: 'party', title: '整活大挑战', meta: '32 个玩法 · 气氛拉满', cost: 800, imageUrl: asset('report-poster.png') },
      { id: 'tpl-birthday', filterId: 'party', title: '生日专属', meta: '18 个玩法 · 定制惊喜', cost: 800, imageUrl: asset('image-process-hero.png') },
    ],
    unlockCard: {
      title: '看激励视频解锁 PRO 模板',
      progressText: '0/3',
    },
  },
  commerce: createDefaultCommerce(),
  userCommerce: {},
})

const isBrokenSample = (value) =>
  typeof value === 'string' && (!value.trim() || value.includes('?'))

const normalizeHomeConfig = (homeConfig = {}, defaults) => ({
  hero: {
    title: isBrokenSample(homeConfig?.hero?.title) ? defaults.hero.title : homeConfig?.hero?.title || defaults.hero.title,
    subtitle: isBrokenSample(homeConfig?.hero?.subtitle) ? defaults.hero.subtitle : homeConfig?.hero?.subtitle || defaults.hero.subtitle,
    imageUrl: homeConfig?.hero?.imageUrl || defaults.hero.imageUrl,
    imageUploadEndpoint: defaults.hero.imageUploadEndpoint,
    imageUpdateEndpoint: defaults.hero.imageUpdateEndpoint,
  },
  quickTools: Array.isArray(homeConfig?.quickTools) && homeConfig.quickTools.length
    ? homeConfig.quickTools.map((item, index) => ({
        id: String(item?.id || defaults.quickTools[index]?.id || `tool-${index + 1}`),
        name: isBrokenSample(item?.name) ? defaults.quickTools[index]?.name || `工具 ${index + 1}` : String(item?.name || defaults.quickTools[index]?.name || `工具 ${index + 1}`),
      }))
    : defaults.quickTools,
  banner: {
    title: isBrokenSample(homeConfig?.banner?.title) ? defaults.banner.title : homeConfig?.banner?.title || defaults.banner.title,
    imageUrl: homeConfig?.banner?.imageUrl || defaults.banner.imageUrl,
  },
  judge: {
    title: isBrokenSample(homeConfig?.judge?.title) ? defaults.judge.title : homeConfig?.judge?.title || defaults.judge.title,
    subtitle: isBrokenSample(homeConfig?.judge?.subtitle) ? defaults.judge.subtitle : homeConfig?.judge?.subtitle || defaults.judge.subtitle,
    imageUrl: homeConfig?.judge?.imageUrl || defaults.judge.imageUrl,
  },
})

const normalizePointsTask = (item = {}, index = 0, fallback = {}) => ({
  id: String(item.id || fallback.id || `task-${index + 1}`),
  title:
    String(item.id || '').trim() === 'task-reopen'
      ? isBrokenSample(item.title) || String(item.title || '').includes('再开一局')
        ? fallback.title || `任务 ${index + 1}`
        : String(item.title || fallback.title || `任务 ${index + 1}`)
      : isBrokenSample(item.title)
        ? fallback.title || `任务 ${index + 1}`
        : String(item.title || fallback.title || `任务 ${index + 1}`),
  value: Number(item.value) > 0 ? Number(item.value) : Number(fallback.value) || 10,
  iconClass: typeof item.iconClass === 'string' && item.iconClass.trim() ? item.iconClass.trim() : fallback.iconClass || 'points-icon-coin',
})

const normalizePointsReward = (item = {}, index = 0, fallback = {}) => ({
  id: String(item.id || fallback.id || `reward-${index + 1}`),
  title: isBrokenSample(item.title) ? fallback.title || `积分商品 ${index + 1}` : String(item.title || fallback.title || `积分商品 ${index + 1}`),
  subtitle: isBrokenSample(item.subtitle) ? fallback.subtitle || '' : String(item.subtitle || fallback.subtitle || ''),
  cost: Number(item.cost) > 0 ? Number(item.cost) : Number(fallback.cost) || 100,
  iconClass: typeof item.iconClass === 'string' && item.iconClass.trim() ? item.iconClass.trim() : fallback.iconClass || 'points-icon-coupon',
})

const normalizeTemplateFilter = (item = {}, index = 0, fallback = {}) => ({
  id: String(item.id || fallback.id || `filter-${index + 1}`),
  name: isBrokenSample(item.name) ? fallback.name || `分类 ${index + 1}` : String(item.name || fallback.name || `分类 ${index + 1}`),
})

const normalizeTemplateItem = (item = {}, index = 0, fallback = {}) => ({
  id: String(item.id || fallback.id || `template-${Date.now()}-${index}`),
  filterId: String(item.filterId || fallback.filterId || 'all'),
  title: isBrokenSample(item.title) ? fallback.title || `模板 ${index + 1}` : String(item.title || fallback.title || `模板 ${index + 1}`),
  meta: isBrokenSample(item.meta) ? fallback.meta || '' : String(item.meta || fallback.meta || ''),
  cost: Number(item.cost) > 0 ? Number(item.cost) : Number(fallback.cost) || 100,
  imageUrl: typeof item.imageUrl === 'string' && item.imageUrl.trim() ? item.imageUrl.trim() : fallback.imageUrl || asset('toolbox-hero.png'),
})

const normalizeTaskState = (taskState = {}, taskId = '') => {
  if (taskId === 'task-signin') {
    return {
      lastClaimAt: typeof taskState.lastClaimAt === 'string' ? taskState.lastClaimAt : '',
    }
  }

  if (taskId === 'task-share-report') {
    return {
      claimHistory: Array.isArray(taskState.claimHistory)
        ? taskState.claimHistory.filter((item) => typeof item === 'string').slice(0, 14)
        : [],
    }
  }

  if (taskId === 'task-reopen') {
    return {
      claimedSessionIds: Array.isArray(taskState.claimedSessionIds)
        ? taskState.claimedSessionIds.map((item) => String(item)).filter(Boolean).slice(0, 80)
        : [],
    }
  }

  return {}
}

const normalizeTaskStates = (taskStates = {}) => {
  if (!taskStates || typeof taskStates !== 'object' || Array.isArray(taskStates)) {
    taskStates = {}
  }

  return {
    'task-signin': normalizeTaskState(taskStates['task-signin'], 'task-signin'),
    'task-share-report': normalizeTaskState(taskStates['task-share-report'], 'task-share-report'),
    'task-reopen': normalizeTaskState(taskStates['task-reopen'], 'task-reopen'),
  }
}

const normalizeCommerce = (commerce = {}) => {
  const defaults = createDefaultCommerce()
  return {
    claimedTaskIds: Array.isArray(commerce?.claimedTaskIds) ? commerce.claimedTaskIds.map((item) => String(item)) : defaults.claimedTaskIds,
    membership: {
      active: Boolean(commerce?.membership?.active),
      activatedAt: typeof commerce?.membership?.activatedAt === 'string' ? commerce.membership.activatedAt : '',
      expiresAt: typeof commerce?.membership?.expiresAt === 'string' ? commerce.membership.expiresAt : '',
      planId: typeof commerce?.membership?.planId === 'string' ? commerce.membership.planId : '',
    },
    membershipOrders: Array.isArray(commerce?.membershipOrders)
      ? commerce.membershipOrders.map((item, index) => ({
          id: String(item?.id || `membership-order-${index + 1}`),
          planId: String(item?.planId || ''),
          createdAt: typeof item?.createdAt === 'string' ? item.createdAt : '',
          expiresAt: typeof item?.expiresAt === 'string' ? item.expiresAt : '',
        }))
      : defaults.membershipOrders,
    ownedRewardIds: Array.isArray(commerce?.ownedRewardIds) ? commerce.ownedRewardIds.map((item) => String(item)) : defaults.ownedRewardIds,
    taskStates: {
      ...defaults.taskStates,
      ...normalizeTaskStates(commerce?.taskStates || {}),
    },
    pointsLedger: Array.isArray(commerce?.pointsLedger)
      ? commerce.pointsLedger.map((item, index) => ({
          id: String(item?.id || `points-ledger-${index + 1}`),
          title: typeof item?.title === 'string' ? item.title : '',
          createdAt: typeof item?.createdAt === 'string' ? item.createdAt : '',
          delta: Number(item?.delta) || 0,
          kind: typeof item?.kind === 'string' ? item.kind : 'adjustment',
          sourceId: typeof item?.sourceId === 'string' ? item.sourceId : '',
        }))
      : defaults.pointsLedger,
    rewardRedemptions: Array.isArray(commerce?.rewardRedemptions)
      ? commerce.rewardRedemptions.map((item, index) => ({
          id: String(item?.id || `reward-redemption-${index + 1}`),
          rewardId: String(item?.rewardId || ''),
          title: typeof item?.title === 'string' ? item.title : '',
          cost: Number(item?.cost) || 0,
          createdAt: typeof item?.createdAt === 'string' ? item.createdAt : '',
        }))
      : defaults.rewardRedemptions,
    templateUnlockProgress:
      commerce?.templateUnlockProgress && typeof commerce.templateUnlockProgress === 'object'
        ? Object.entries(commerce.templateUnlockProgress).reduce((accumulator, [key, value]) => {
            accumulator[String(key)] = Math.max(0, Number(value) || 0)
            return accumulator
          }, {})
        : defaults.templateUnlockProgress,
    templateUnlockRequiredViews:
      Number(commerce?.templateUnlockRequiredViews) > 0 ? Number(commerce.templateUnlockRequiredViews) : defaults.templateUnlockRequiredViews,
    unlockedTemplateIds: Array.isArray(commerce?.unlockedTemplateIds)
      ? commerce.unlockedTemplateIds.map((item) => String(item))
      : defaults.unlockedTemplateIds,
  }
}

const normalizeUserCommerceState = (state = {}) => {
  const defaults = createDefaultUserCommerceState()
  const normalizedCommerce = normalizeCommerce(state)
  return {
    ...normalizedCommerce,
    points: Number(state?.points) >= 0 ? Number(state.points) : defaults.points,
  }
}

const normalizeUserCommerceMap = (userCommerce = {}) => {
  if (!userCommerce || typeof userCommerce !== 'object' || Array.isArray(userCommerce)) {
    return {}
  }

  return Object.entries(userCommerce).reduce((accumulator, [profileId, state]) => {
    accumulator[String(profileId)] = normalizeUserCommerceState(state)
    return accumulator
  }, {})
}

const normalizeStore = (store = {}) => {
  const defaults = createDefaultStore()

  return {
    profile: {
      nickname: isBrokenSample(store?.profile?.nickname) ? defaults.profile.nickname : store?.profile?.nickname || defaults.profile.nickname,
      avatarUrl: store?.profile?.avatarUrl || defaults.profile.avatarUrl,
      points: Number(store?.profile?.points) >= 0 ? Number(store.profile.points) : defaults.profile.points,
    },
    compliance: {
      copy: isBrokenSample(store?.compliance?.copy) ? defaults.compliance.copy : store?.compliance?.copy || defaults.compliance.copy,
    },
    toolHistory: Array.isArray(store?.toolHistory) && store.toolHistory.length
      ? store.toolHistory.map((item, index) => ({
          id: normalizeToolHistoryId(item, defaults.toolHistory[index] || {}, index),
          name: isBrokenSample(item?.name) ? defaults.toolHistory[index]?.name || `工具 ${index + 1}` : String(item?.name || defaults.toolHistory[index]?.name || `工具 ${index + 1}`),
          category: isBrokenSample(item?.category) ? defaults.toolHistory[index]?.category || '工具' : String(item?.category || defaults.toolHistory[index]?.category || '工具'),
          usedAt: isBrokenSample(item?.usedAt) ? defaults.toolHistory[index]?.usedAt || '今天' : String(item?.usedAt || defaults.toolHistory[index]?.usedAt || '今天'),
        }))
      : defaults.toolHistory,
    homeConfig: normalizeHomeConfig(store?.homeConfig, defaults.homeConfig),
    pointsConfig: {
      balance: Number(store?.pointsConfig?.balance) >= 0 ? Number(store.pointsConfig.balance) : defaults.pointsConfig.balance,
      bannerImageUrl: store?.pointsConfig?.bannerImageUrl || defaults.pointsConfig.bannerImageUrl,
      tasks: Array.isArray(store?.pointsConfig?.tasks) && store.pointsConfig.tasks.length
        ? store.pointsConfig.tasks.map((item, index) => normalizePointsTask(item, index, defaults.pointsConfig.tasks[index] || {}))
        : defaults.pointsConfig.tasks,
      rewards: Array.isArray(store?.pointsConfig?.rewards) && store.pointsConfig.rewards.length
        ? store.pointsConfig.rewards.map((item, index) => normalizePointsReward(item, index, defaults.pointsConfig.rewards[index] || {}))
        : defaults.pointsConfig.rewards,
    },
    templateConfig: {
      filters: Array.isArray(store?.templateConfig?.filters) && store.templateConfig.filters.length
        ? store.templateConfig.filters.map((item, index) => normalizeTemplateFilter(item, index, defaults.templateConfig.filters[index] || {}))
        : defaults.templateConfig.filters,
      templates: Array.isArray(store?.templateConfig?.templates) && store.templateConfig.templates.length
        ? store.templateConfig.templates.map((item, index) => normalizeTemplateItem(item, index, defaults.templateConfig.templates[index] || {}))
        : defaults.templateConfig.templates,
      unlockCard: {
        title: isBrokenSample(store?.templateConfig?.unlockCard?.title) ? defaults.templateConfig.unlockCard.title : store?.templateConfig?.unlockCard?.title || defaults.templateConfig.unlockCard.title,
        progressText: isBrokenSample(store?.templateConfig?.unlockCard?.progressText) ? defaults.templateConfig.unlockCard.progressText : store?.templateConfig?.unlockCard?.progressText || defaults.templateConfig.unlockCard.progressText,
      },
    },
    commerce: normalizeCommerce(store?.commerce),
    userCommerce: normalizeUserCommerceMap(store?.userCommerce),
  }
}

const storeAccessor = createStoreAccessor({
  key: 'content_store',
  filePath: storePath,
  createDefaultStore,
  normalizeStore,
})

const readStore = () => storeAccessor.read()

const writeStore = (store) => storeAccessor.write(store)

const getHomeConfig = () => readStore().homeConfig
const getPointsConfig = () => readStore().pointsConfig
const getTemplateConfig = () => readStore().templateConfig
const getProfile = () => readStore().profile
const getCompliance = () => readStore().compliance
const getToolHistory = () => readStore().toolHistory

const updateHomeConfig = (payload = {}) => {
  const store = readStore()
  store.homeConfig = normalizeHomeConfig(
    {
      hero: {
        ...store.homeConfig.hero,
        ...(payload.hero || {}),
      },
      quickTools: Array.isArray(payload.quickTools) ? payload.quickTools : store.homeConfig.quickTools,
      banner: {
        ...store.homeConfig.banner,
        ...(payload.banner || {}),
      },
      judge: {
        ...store.homeConfig.judge,
        ...(payload.judge || {}),
      },
    },
    createDefaultStore().homeConfig,
  )
  return writeStore(store).homeConfig
}

const updateHomeHero = (payload = {}) => {
  return updateHomeConfig({ hero: payload }).hero
}

const updatePointsConfig = (payload = {}) => {
  const store = readStore()
  store.pointsConfig = {
    balance: Number(payload.balance) >= 0 ? Number(payload.balance) : store.pointsConfig.balance,
    bannerImageUrl: typeof payload.bannerImageUrl === 'string' && payload.bannerImageUrl.trim()
      ? payload.bannerImageUrl.trim()
      : store.pointsConfig.bannerImageUrl,
    tasks: Array.isArray(payload.tasks)
      ? payload.tasks.map((item, index) => normalizePointsTask(item, index))
      : store.pointsConfig.tasks,
    rewards: Array.isArray(payload.rewards)
      ? payload.rewards.map((item, index) => normalizePointsReward(item, index))
      : store.pointsConfig.rewards,
  }
  return writeStore(store).pointsConfig
}

const updateTemplateConfig = (payload = {}) => {
  const store = readStore()
  store.templateConfig = {
    filters: Array.isArray(payload.filters)
      ? payload.filters.map((item, index) => normalizeTemplateFilter(item, index))
      : store.templateConfig.filters,
    templates: Array.isArray(payload.templates)
      ? payload.templates.map((item, index) => normalizeTemplateItem(item, index))
      : store.templateConfig.templates,
    unlockCard: {
      title:
        typeof payload?.unlockCard?.title === 'string' && payload.unlockCard.title.trim()
          ? payload.unlockCard.title.trim()
          : store.templateConfig.unlockCard.title,
      progressText:
        typeof payload?.unlockCard?.progressText === 'string' && payload.unlockCard.progressText.trim()
          ? payload.unlockCard.progressText.trim()
          : store.templateConfig.unlockCard.progressText,
    },
  }
  return writeStore(store).templateConfig
}

const updateCompliance = (payload = {}) => {
  const store = readStore()
  store.compliance = {
    copy: typeof payload.copy === 'string' && payload.copy.trim() ? payload.copy.trim() : store.compliance.copy,
  }
  return writeStore(store).compliance
}

module.exports = {
  asset,
  getCompliance,
  getHomeConfig,
  getPointsConfig,
  getProfile,
  getTemplateConfig,
  getToolHistory,
  initContentStore: storeAccessor.init,
  readContentStore: readStore,
  updateCompliance,
  updateHomeConfig,
  updateHomeHero,
  updatePointsConfig,
  updateTemplateConfig,
  writeContentStore: writeStore,
  createDefaultUserCommerceState,
}
