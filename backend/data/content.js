const path = require('path')
const { createStoreAccessor } = require('./store-accessor')

const storePath = path.join(__dirname, 'content-store.json')

const cleanText = (value = '') => String(value || '').trim()
const cleanArray = (value) => (Array.isArray(value) ? value : [])
const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value)
const BUILTIN_POINTS_TASKS = [
  {
    id: 'task-first-login',
    title: '首次登录赠送',
    value: 500,
    iconClass: 'points-icon-coin',
  },
]
const normalizeTemplateImageUrl = (value = '') => {
  const text = cleanText(value)
  if (/^https?:\/\/(?:127\.0\.0\.1(?::\d+)?\/__store__|store\/)/i.test(text) || /\/__store__\//i.test(text) || /\/__tmp__\//i.test(text)) {
    return ''
  }
  return text.replace(/^\/static\/templates\/(.+)\.svg$/i, '/static/templates/$1.png')
}

const createDefaultCommerce = () => ({
  claimedTaskIds: [],
  taskStates: {},
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
  templateUnlockRequiredViews: 0,
  unlockedTemplateIds: [],
})

const createDefaultUserCommerceState = () => ({
  points: 0,
  ...createDefaultCommerce(),
})

const createDefaultStore = () => ({
  profile: {
    nickname: '',
    avatarUrl: '',
    points: 0,
  },
  compliance: {
    copy: '',
  },
  toolHistory: [],
  homeConfig: {
    hero: {
      title: '',
      subtitle: '',
      imageUrl: '',
      imageUploadEndpoint: '/api/v1/admin/upload/home-hero',
      imageUpdateEndpoint: '/api/v1/admin/config/home/hero',
    },
    quickTools: [],
    banner: {
      title: '',
      imageUrl: '',
    },
    judge: {
      title: '',
      subtitle: '',
      imageUrl: '',
    },
  },
  pointsConfig: {
    bannerImageUrl: '',
    tasks: [],
    rewards: [],
  },
  templateConfig: {
    filters: [],
    templates: [],
    unlockCard: {
      title: '',
      progressText: '',
    },
  },
  commerce: createDefaultCommerce(),
  userCommerce: {},
})

const normalizeHomeConfig = (homeConfig = {}) => ({
  hero: {
    title: cleanText(homeConfig?.hero?.title),
    subtitle: cleanText(homeConfig?.hero?.subtitle),
    imageUrl: cleanText(homeConfig?.hero?.imageUrl),
    imageUploadEndpoint: '/api/v1/admin/upload/home-hero',
    imageUpdateEndpoint: '/api/v1/admin/config/home/hero',
  },
  quickTools: cleanArray(homeConfig?.quickTools).map((item) => ({
    id: cleanText(item?.id),
    name: cleanText(item?.name),
  })).filter((item) => item.id || item.name),
  banner: {
    title: cleanText(homeConfig?.banner?.title),
    imageUrl: cleanText(homeConfig?.banner?.imageUrl),
  },
  judge: {
    title: cleanText(homeConfig?.judge?.title),
    subtitle: cleanText(homeConfig?.judge?.subtitle),
    imageUrl: cleanText(homeConfig?.judge?.imageUrl),
  },
})

const normalizePointsTask = (item = {}) => ({
  id: cleanText(item.id),
  title: cleanText(item.title),
  value: Number(item.value) || 0,
  iconClass: cleanText(item.iconClass),
})

const withBuiltinPointsTasks = (tasks = []) => {
  const byId = new Map(cleanArray(tasks).map(normalizePointsTask).filter((item) => item.id || item.title).map((item) => [item.id, item]))
  BUILTIN_POINTS_TASKS.forEach((task) => {
    byId.set(task.id, {
      ...task,
      ...(byId.get(task.id) || {}),
      id: task.id,
      value: Number((byId.get(task.id) || {}).value) || task.value,
    })
  })
  return [
    ...BUILTIN_POINTS_TASKS.map((task) => byId.get(task.id)),
    ...Array.from(byId.values()).filter((task) => !BUILTIN_POINTS_TASKS.some((builtin) => builtin.id === task.id)),
  ]
}

const normalizePointsReward = (item = {}) => ({
  id: cleanText(item.id),
  title: cleanText(item.title),
  subtitle: cleanText(item.subtitle),
  cost: Number(item.cost) || 0,
  iconClass: cleanText(item.iconClass),
})

const normalizeTemplateFilter = (item = {}) => ({
  id: cleanText(item.id),
  name: cleanText(item.name),
})

const normalizeTemplateItem = (item = {}) => ({
  id: cleanText(item.id),
  filterId: cleanText(item.filterId),
  title: cleanText(item.title),
  meta: cleanText(item.meta),
  cost: Number(item.cost) || 0,
  imageUrl: normalizeTemplateImageUrl(item.imageUrl),
})

const normalizeTaskState = (taskState = {}) => {
  if (!isObject(taskState)) return {}
  return {
    ...taskState,
    claimHistory: cleanArray(taskState.claimHistory).filter((item) => typeof item === 'string').slice(0, 14),
    claimedSessionIds: cleanArray(taskState.claimedSessionIds).map((item) => String(item)).filter(Boolean).slice(0, 80),
    lastClaimAt: typeof taskState.lastClaimAt === 'string' ? taskState.lastClaimAt : '',
  }
}

const normalizeTaskStates = (taskStates = {}) => {
  if (!isObject(taskStates)) return {}
  return Object.entries(taskStates).reduce((accumulator, [taskId, value]) => {
    accumulator[cleanText(taskId)] = normalizeTaskState(value)
    return accumulator
  }, {})
}

const normalizeCommerce = (commerce = {}) => ({
  claimedTaskIds: cleanArray(commerce?.claimedTaskIds).map((item) => String(item)),
  membership: {
    active: Boolean(commerce?.membership?.active),
    activatedAt: cleanText(commerce?.membership?.activatedAt),
    expiresAt: cleanText(commerce?.membership?.expiresAt),
    planId: cleanText(commerce?.membership?.planId),
  },
  membershipOrders: cleanArray(commerce?.membershipOrders).map((item) => ({
    id: cleanText(item?.id),
    planId: cleanText(item?.planId),
    createdAt: cleanText(item?.createdAt),
    expiresAt: cleanText(item?.expiresAt),
  })).filter((item) => item.id || item.planId),
  ownedRewardIds: cleanArray(commerce?.ownedRewardIds).map((item) => String(item)),
  taskStates: normalizeTaskStates(commerce?.taskStates),
  pointsLedger: cleanArray(commerce?.pointsLedger).map((item) => ({
    id: cleanText(item?.id),
    title: cleanText(item?.title),
    createdAt: cleanText(item?.createdAt),
    delta: Number(item?.delta) || 0,
    kind: cleanText(item?.kind),
    sourceId: cleanText(item?.sourceId),
  })).filter((item) => item.id || item.title || item.delta),
  rewardRedemptions: cleanArray(commerce?.rewardRedemptions).map((item) => ({
    id: cleanText(item?.id),
    rewardId: cleanText(item?.rewardId),
    title: cleanText(item?.title),
    cost: Number(item?.cost) || 0,
    createdAt: cleanText(item?.createdAt),
  })).filter((item) => item.id || item.rewardId),
  templateUnlockProgress: isObject(commerce?.templateUnlockProgress)
    ? Object.entries(commerce.templateUnlockProgress).reduce((accumulator, [key, value]) => {
        accumulator[cleanText(key)] = Math.max(0, Number(value) || 0)
        return accumulator
      }, {})
    : {},
  templateUnlockRequiredViews: Number(commerce?.templateUnlockRequiredViews) || 0,
  unlockedTemplateIds: cleanArray(commerce?.unlockedTemplateIds).map((item) => String(item)),
})

const normalizeUserCommerceState = (state = {}) => ({
  ...normalizeCommerce(state),
  points: Number(state?.points) || 0,
})

const normalizeUserCommerceMap = (userCommerce = {}) => {
  if (!isObject(userCommerce)) return {}
  return Object.entries(userCommerce).reduce((accumulator, [profileId, state]) => {
    accumulator[cleanText(profileId)] = normalizeUserCommerceState(state)
    return accumulator
  }, {})
}

const normalizeStore = (store = {}) => ({
  profile: {
    nickname: cleanText(store?.profile?.nickname),
    avatarUrl: cleanText(store?.profile?.avatarUrl),
    points: Number(store?.profile?.points) || 0,
  },
  compliance: {
    copy: cleanText(store?.compliance?.copy),
  },
  toolHistory: cleanArray(store?.toolHistory).map((item) => ({
    id: cleanText(item?.id),
    name: cleanText(item?.name),
    category: cleanText(item?.category),
    usedAt: cleanText(item?.usedAt),
  })).filter((item) => item.id || item.name),
  homeConfig: normalizeHomeConfig(store?.homeConfig),
  pointsConfig: {
    bannerImageUrl: cleanText(store?.pointsConfig?.bannerImageUrl),
    tasks: withBuiltinPointsTasks(store?.pointsConfig?.tasks),
    rewards: cleanArray(store?.pointsConfig?.rewards).map(normalizePointsReward).filter((item) => item.id || item.title),
  },
  templateConfig: {
    filters: cleanArray(store?.templateConfig?.filters).map(normalizeTemplateFilter).filter((item) => item.id || item.name),
    templates: cleanArray(store?.templateConfig?.templates).map(normalizeTemplateItem).filter((item) => item.id || item.title),
    unlockCard: {
      title: cleanText(store?.templateConfig?.unlockCard?.title),
      progressText: cleanText(store?.templateConfig?.unlockCard?.progressText),
    },
  },
  commerce: normalizeCommerce(store?.commerce),
  userCommerce: normalizeUserCommerceMap(store?.userCommerce),
})

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

const recordToolUsage = (payload = {}) => {
  const toolId = cleanText(payload.id || payload.toolId)
  if (!toolId) {
    return getToolHistory()
  }
  const store = readStore()
  const nextItem = {
    id: toolId,
    usedAt: new Date().toISOString(),
  }
  store.toolHistory = [
    nextItem,
    ...cleanArray(store.toolHistory).filter((item) => cleanText(item?.id) !== toolId),
  ].slice(0, 30)
  writeStore(store)
  return store.toolHistory
}

const updateHomeConfig = (payload = {}) => {
  const store = readStore()
  store.homeConfig = normalizeHomeConfig({
    hero: { ...store.homeConfig.hero, ...(payload.hero || {}) },
    quickTools: Array.isArray(payload.quickTools) ? payload.quickTools : store.homeConfig.quickTools,
    banner: { ...store.homeConfig.banner, ...(payload.banner || {}) },
    judge: { ...store.homeConfig.judge, ...(payload.judge || {}) },
  })
  return writeStore(store).homeConfig
}

const updateHomeHero = (payload = {}) => updateHomeConfig({ hero: payload }).hero

const updatePointsConfig = (payload = {}) => {
  const store = readStore()
  store.pointsConfig = {
    bannerImageUrl: cleanText(payload.bannerImageUrl),
    tasks: withBuiltinPointsTasks(payload.tasks),
    rewards: cleanArray(payload.rewards).map(normalizePointsReward).filter((item) => item.id || item.title),
  }
  return writeStore(store).pointsConfig
}

const updateTemplateConfig = (payload = {}) => {
  const store = readStore()
  store.templateConfig = {
    filters: cleanArray(payload.filters).map(normalizeTemplateFilter).filter((item) => item.id || item.name),
    templates: cleanArray(payload.templates).map(normalizeTemplateItem).filter((item) => item.id || item.title),
    unlockCard: {
      title: cleanText(payload?.unlockCard?.title),
      progressText: cleanText(payload?.unlockCard?.progressText),
    },
  }
  return writeStore(store).templateConfig
}

const updateCompliance = (payload = {}) => {
  const store = readStore()
  store.compliance = { copy: cleanText(payload.copy) }
  return writeStore(store).compliance
}

module.exports = {
  getCompliance,
  getHomeConfig,
  getPointsConfig,
  getProfile,
  getTemplateConfig,
  getToolHistory,
  flushContentStore: storeAccessor.flush,
  initContentStore: storeAccessor.init,
  readContentStore: readStore,
  recordToolUsage,
  updateCompliance,
  updateHomeConfig,
  updateHomeHero,
  updatePointsConfig,
  updateTemplateConfig,
  writeContentStore: writeStore,
  createDefaultUserCommerceState,
}
