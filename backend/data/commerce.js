const { getPointsConfig, getTemplateConfig, readContentStore, writeContentStore } = require('./content')
const { getAdminStore, writeAdminStore } = require('./admin')
const { readSocialStore } = require('./social')

const isoNow = () => new Date().toISOString()
const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
const createHttpError = (message, statusCode) => Object.assign(new Error(message), { statusCode })

const numberFromText = (value) => {
  const matched = String(value || '')
    .replace(/,/g, '')
    .match(/-?\d+(?:\.\d+)?/)
  return matched ? Number(matched[0]) : 0
}

const formatPercent = (value, digits = 1) => `${Number(value || 0).toFixed(digits).replace(/\.0$/, '').replace(/(\.\d*[1-9])0+$/, '$1')}%`
const formatCurrency = (value) => `¥${Math.round(Number(value || 0)).toLocaleString('en-US')}`

const ensureCommerce = (store) => {
  if (!store.commerce) {
    store.commerce = {}
  }
  if (!Array.isArray(store.commerce.claimedTaskIds)) {
    store.commerce.claimedTaskIds = []
  }
  if (!Array.isArray(store.commerce.membershipOrders)) {
    store.commerce.membershipOrders = []
  }
  if (!Array.isArray(store.commerce.ownedRewardIds)) {
    store.commerce.ownedRewardIds = []
  }
  if (!Array.isArray(store.commerce.pointsLedger)) {
    store.commerce.pointsLedger = []
  }
  if (!Array.isArray(store.commerce.rewardRedemptions)) {
    store.commerce.rewardRedemptions = []
  }
  if (!store.commerce.templateUnlockProgress || typeof store.commerce.templateUnlockProgress !== 'object') {
    store.commerce.templateUnlockProgress = {}
  }
  if (!Array.isArray(store.commerce.unlockedTemplateIds)) {
    store.commerce.unlockedTemplateIds = []
  }
  if (!store.commerce.membership || typeof store.commerce.membership !== 'object') {
    store.commerce.membership = { active: false, activatedAt: '', expiresAt: '', planId: '' }
  }
  if (!Number(store.commerce.templateUnlockRequiredViews)) {
    store.commerce.templateUnlockRequiredViews = 3
  }
  return store
}

const createLedgerEntry = ({ delta, kind, sourceId, title }) => ({
  id: createId('ledger'),
  title,
  createdAt: isoNow(),
  delta: Number(delta) || 0,
  kind,
  sourceId,
})

const getTemplateUnlockState = (store, templateId) => {
  const required = Number(store.commerce.templateUnlockRequiredViews) || 3
  const current = Math.max(0, Number(store.commerce.templateUnlockProgress[templateId]) || 0)
  const unlocked = store.commerce.membership.active || store.commerce.unlockedTemplateIds.includes(templateId)
  return {
    current,
    required,
    unlocked,
  }
}

const serializeCommerceState = () => {
  const contentStore = ensureCommerce(readContentStore())
  const adminStore = getAdminStore()
  const activePlan = adminStore.membershipPlans.find((item) => item.id === contentStore.commerce.membership.planId) || null
  return {
    claimedTaskIds: contentStore.commerce.claimedTaskIds,
    membership: {
      ...contentStore.commerce.membership,
      activePlanName: activePlan?.name || '',
    },
    ownedRewardIds: contentStore.commerce.ownedRewardIds,
    points: Number(contentStore.profile.points) || 0,
    pointsLedger: contentStore.commerce.pointsLedger.slice(0, 20),
    rewardRedemptions: contentStore.commerce.rewardRedemptions.slice(0, 20),
    templateUnlockProgress: contentStore.commerce.templateUnlockProgress,
    templateUnlockRequiredViews: Number(contentStore.commerce.templateUnlockRequiredViews) || 3,
    unlockedTemplateIds: contentStore.commerce.unlockedTemplateIds,
  }
}

const updateAdSlotAfterCompletion = (adminStore, slotId, revenueDelta = 0.68) => {
  adminStore.adSlots = (adminStore.adSlots || []).map((item) => {
    if (item.id !== slotId) {
      return item
    }
    const impressions = Math.max(numberFromText(item.impressions), numberFromText(item.completionRate), 1) + 1
    const completions = Math.max(numberFromText(item.completions), numberFromText(item.completionRate), 1) + 1
    const revenueValue = numberFromText(item.revenueValue || item.revenue) + revenueDelta
    return {
      ...item,
      impressions,
      completions,
      revenueValue,
      completionRate: item.adType && String(item.adType).toLowerCase().includes('banner')
        ? item.completionRate
        : formatPercent((completions / impressions) * 100),
      revenue: formatCurrency(revenueValue),
    }
  })
}

const updateMembershipPlanAfterActivation = (adminStore, planId) => {
  const socialStore = readSocialStore()
  const userCount = Math.max((socialStore.profiles || []).length, 1)
  adminStore.membershipPlans = (adminStore.membershipPlans || []).map((item) => {
    if (item.id !== planId) {
      return item
    }
    const purchaseCount = Number(item.purchaseCount) || 0
    const nextPurchaseCount = purchaseCount + 1
    return {
      ...item,
      purchaseCount: nextPurchaseCount,
      conversionRate: formatPercent((nextPurchaseCount / userCount) * 100),
    }
  })
}

const updateMerchantAfterRewardRedemption = (adminStore, rewardId) => {
  if (rewardId !== 'reward-merchant-coupon') {
    return
  }
  const targetId = adminStore.merchants?.[0]?.id
  if (!targetId) {
    return
  }
  adminStore.merchants = adminStore.merchants.map((item) => {
    if (item.id !== targetId) {
      return item
    }
    return {
      ...item,
      claimCount: String(numberFromText(item.claimCount) + 1),
    }
  })
}

const claimPointsTask = (taskId) => {
  const contentStore = ensureCommerce(readContentStore())
  const task = (getPointsConfig().tasks || []).find((item) => item.id === taskId)
  if (!task) {
    throw createHttpError('task not found', 404)
  }
  if (contentStore.commerce.claimedTaskIds.includes(taskId)) {
    return serializeCommerceState()
  }

  contentStore.profile.points = Number(contentStore.profile.points || 0) + Number(task.value || 0)
  contentStore.commerce.claimedTaskIds.unshift(taskId)
  contentStore.commerce.pointsLedger.unshift(
    createLedgerEntry({
      delta: Number(task.value || 0),
      kind: 'task',
      sourceId: taskId,
      title: task.title,
    }),
  )
  writeContentStore(contentStore)
  return serializeCommerceState()
}

const redeemPointsReward = (rewardId) => {
  const contentStore = ensureCommerce(readContentStore())
  const adminStore = getAdminStore()
  const reward = (getPointsConfig().rewards || []).find((item) => item.id === rewardId)
  if (!reward) {
    throw createHttpError('reward not found', 404)
  }
  if (contentStore.commerce.ownedRewardIds.includes(rewardId)) {
    return serializeCommerceState()
  }
  if (Number(contentStore.profile.points || 0) < Number(reward.cost || 0)) {
    throw createHttpError('积分不足', 400)
  }

  contentStore.profile.points = Number(contentStore.profile.points || 0) - Number(reward.cost || 0)
  contentStore.commerce.ownedRewardIds.unshift(rewardId)
  contentStore.commerce.rewardRedemptions.unshift({
    id: createId('reward-redemption'),
    rewardId,
    title: reward.title,
    cost: Number(reward.cost || 0),
    createdAt: isoNow(),
  })
  contentStore.commerce.pointsLedger.unshift(
    createLedgerEntry({
      delta: -Number(reward.cost || 0),
      kind: 'reward',
      sourceId: rewardId,
      title: reward.title,
    }),
  )

  if (rewardId === 'reward-poster-pack') {
    const templateIds = (getTemplateConfig().templates || []).map((item) => item.id)
    contentStore.commerce.unlockedTemplateIds = Array.from(new Set([...contentStore.commerce.unlockedTemplateIds, ...templateIds]))
  }

  writeContentStore(contentStore)
  updateMerchantAfterRewardRedemption(adminStore, rewardId)
  writeAdminStore(adminStore)
  return serializeCommerceState()
}

const unlockTemplateByAd = (templateId) => {
  const contentStore = ensureCommerce(readContentStore())
  const adminStore = getAdminStore()
  const template = (getTemplateConfig().templates || []).find((item) => item.id === templateId)
  if (!template) {
    throw createHttpError('template not found', 404)
  }

  const state = getTemplateUnlockState(contentStore, templateId)
  if (state.unlocked) {
    return {
      ...serializeCommerceState(),
      unlockedTemplateId: templateId,
    }
  }

  const nextCurrent = Math.min(state.required, state.current + 1)
  contentStore.commerce.templateUnlockProgress[templateId] = nextCurrent
  if (nextCurrent >= state.required) {
    contentStore.commerce.unlockedTemplateIds = Array.from(new Set([...contentStore.commerce.unlockedTemplateIds, templateId]))
  }
  writeContentStore(contentStore)

  updateAdSlotAfterCompletion(adminStore, 'ad-1')
  writeAdminStore(adminStore)

  return {
    ...serializeCommerceState(),
    unlockedTemplateId: nextCurrent >= state.required ? templateId : '',
  }
}

const getMembershipCatalog = () => {
  const adminStore = getAdminStore()
  const commerce = serializeCommerceState()
  return {
    benefits: adminStore.membershipBenefits || [],
    membership: commerce.membership,
    plans: (adminStore.membershipPlans || []).map((item) => ({
      ...item,
      active: commerce.membership.active && commerce.membership.planId === item.id,
    })),
  }
}

const activateMembershipPlan = (planId) => {
  const contentStore = ensureCommerce(readContentStore())
  const adminStore = getAdminStore()
  const plan = (adminStore.membershipPlans || []).find((item) => item.id === planId)
  if (!plan) {
    throw createHttpError('plan not found', 404)
  }

  const now = new Date()
  const durationDays = Math.max(numberFromText(plan.duration), 30)
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString()
  contentStore.commerce.membership = {
    active: true,
    activatedAt: now.toISOString(),
    expiresAt,
    planId,
  }
  contentStore.commerce.membershipOrders.unshift({
    id: createId('membership-order'),
    planId,
    createdAt: now.toISOString(),
    expiresAt,
  })
  writeContentStore(contentStore)

  updateMembershipPlanAfterActivation(adminStore, planId)
  writeAdminStore(adminStore)
  return getMembershipCatalog()
}

module.exports = {
  activateMembershipPlan,
  claimPointsTask,
  getMembershipCatalog,
  getUserCommerceState: serializeCommerceState,
  redeemPointsReward,
  unlockTemplateByAd,
}
