const {
  createDefaultUserCommerceState,
  getPointsConfig,
  getTemplateConfig,
  readContentStore,
  writeContentStore,
} = require('./content')
const { getAdminStore, writeAdminStore } = require('./admin')
const { readSocialStore } = require('./social')

const isoNow = () => new Date().toISOString()
const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
const createHttpError = (message, statusCode) => Object.assign(new Error(message), { statusCode })
const CLAIM_TASK_TIMEZONE = 'Asia/Shanghai'

const getDateYmd = (value = Date.now()) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: CLAIM_TASK_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))

const normalizeTaskState = (taskState = {}, taskId = '') => {
  if (!taskId) {
    return {}
  }

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

const ensureTaskStates = (state) => {
  if (!state.taskStates || typeof state.taskStates !== 'object' || Array.isArray(state.taskStates)) {
    state.taskStates = normalizeTaskStates()
    return
  }
  state.taskStates = normalizeTaskStates(state.taskStates)
}

const isDateEquals = (left, right) => {
  if (!left || !right) {
    return false
  }
  return getDateYmd(left) === getDateYmd(right)
}

const getProfileSessionMember = (session = {}, profileId = '') =>
  Array.isArray(session.members)
    ? session.members.find((item) => String(item.profileId || '').trim() === String(profileId))
    : null

const hasSessionReport = (adminStore, sessionId = '') => {
  const normalizedSessionId = String(sessionId || '').trim()
  if (!normalizedSessionId) {
    return false
  }
  return (adminStore.reports || []).some(
    (report) => String(report?.sessionId || '').trim() === normalizedSessionId,
  )
}

const isCompletedSession = (adminStore, session = {}) => {
  const stateText = String(session.state || '').trim()
  const sessionId = String(session.id || '').trim()
  const normalized = stateText.toLowerCase()
  return (
    stateText.includes('结束')
    || stateText.includes('已结束')
    || stateText.includes('完成')
    || hasSessionReport(adminStore, sessionId)
    || normalized.includes('completed')
    || normalized.includes('ended')
    || normalized.includes('settled')
    || normalized.includes('closed')
  )
}

const listCompletedSessionIdsForProfile = (adminStore, profileId = '') => {
  const normalizedProfileId = String(profileId || '').trim()
  if (!normalizedProfileId) {
    return []
  }

  return (adminStore.liveSessions || [])
    .filter((session) => getProfileSessionMember(session, normalizedProfileId) && isCompletedSession(adminStore, session))
    .map((session) => String(session.id || '').trim())
    .filter(Boolean)
}

const getTodayShareReportCount = (adminStore, profileId = '') => {
  const normalizedProfileId = String(profileId || '').trim()
  if (!normalizedProfileId) {
    return 0
  }
  const today = getDateYmd()
  return (adminStore.analyticsEvents || []).filter((event) => {
    if (!event || event.type !== 'report_share') {
      return false
    }
    if (String(event.profileId || '').trim() !== normalizedProfileId) {
      return false
    }
    return getDateYmd(event.createdAt) === today
  }).length
}

const getTaskClaimState = (profileId, taskId, taskState, adminStore, taskMeta = {}, userState = {}) => {
  const taskValue = Number(taskMeta.value) || 0
  const today = getDateYmd()

  if (taskId === 'task-signin') {
    const claimedDate = taskState.lastClaimAt ? getDateYmd(taskState.lastClaimAt) : ''
    const hasClaimedToday = claimedDate === today
    return hasClaimedToday
      ? {
          canClaim: false,
          buttonText: '今日已领',
          statusText: '次日0点可继续领取',
          canRetryAt: '次日0点',
          remaining: 0,
          max: 1,
          reward: taskValue,
        }
      : {
          canClaim: true,
          buttonText: `+ ${taskValue}`,
          statusText: '签到可领',
          remaining: 1,
          max: 1,
          reward: taskValue,
        }
  }

  if (taskId === 'task-share-report') {
    const shareCountToday = getTodayShareReportCount(adminStore, profileId)
    const claimHistory = Array.isArray(taskState.claimHistory) ? taskState.claimHistory : []
    const claimedToday = claimHistory.filter((item) => isDateEquals(item, today)).length
    const maxDaily = 2
    const remaining = Math.max(0, Math.min(maxDaily, shareCountToday) - claimedToday)

    if (!shareCountToday) {
      return {
        canClaim: false,
        buttonText: '先分享后领取',
        statusText: '先分享1次再领',
        remaining: 0,
        max: maxDaily,
        reward: taskValue,
      }
    }
    if (remaining <= 0) {
      return {
        canClaim: false,
        buttonText: '今日已达上限',
        statusText: `今日已领${claimedToday}/${maxDaily}`,
        remaining: 0,
        max: maxDaily,
        reward: taskValue,
      }
    }
    return {
      canClaim: true,
      buttonText: `+ ${taskValue}`,
      statusText: `剩余${remaining}/${maxDaily}`,
      remaining,
      max: maxDaily,
      reward: taskValue,
    }
  }

  if (taskId === 'task-reopen') {
    const completedSessionIds = listCompletedSessionIdsForProfile(adminStore, profileId)
    const claimedSessionIds = Array.isArray(taskState.claimedSessionIds) ? taskState.claimedSessionIds : []
    const claimedSet = new Set(claimedSessionIds)
    const availableSessionIds = completedSessionIds.filter((sessionId) => !claimedSet.has(sessionId))
    const remaining = availableSessionIds.length

    if (!remaining) {
      return {
        canClaim: false,
        buttonText: '需完成1场聚会',
        statusText: '完成一场聚会后可领取',
        remaining: 0,
        max: 9999,
        reward: taskValue,
      }
    }
    return {
      canClaim: true,
      buttonText: `+ ${taskValue}`,
      statusText: `可兑${Math.min(remaining, 5)}场${remaining > 5 ? '（建议先完成更多）' : ''}`,
      remaining,
      max: 9999,
      reward: taskValue,
      pickSessionIds: availableSessionIds,
    }
  }

  const claimed = Array.isArray(userState.claimedTaskIds) ? userState.claimedTaskIds.includes(taskId) : false
  return {
    canClaim: !claimed,
    buttonText: claimed ? '已完成' : `+ ${taskValue}`,
    statusText: claimed ? '任务已完成' : '可领取',
    remaining: claimed ? 0 : 1,
    max: 1,
    reward: taskValue,
  }
}

const buildTaskClaimStates = (profileId, state) => {
  const tasks = getPointsConfig().tasks || []
  const adminStore = getAdminStore()
  return Object.fromEntries(
    tasks.map((task) => {
      const taskId = String(task?.id || '').trim()
      const taskState = (state.taskStates && state.taskStates[taskId]) || {}
      const claimState = getTaskClaimState(profileId, taskId, taskState, adminStore, task, state)
      return [taskId, claimState]
    }),
  )
}

const numberFromText = (value) => {
  const matched = String(value || '')
    .replace(/,/g, '')
    .match(/-?\d+(?:\.\d+)?/)
  return matched ? Number(matched[0]) : 0
}

const formatPercent = (value, digits = 1) =>
  `${Number(value || 0).toFixed(digits).replace(/\.0$/, '').replace(/(\.\d*[1-9])0+$/, '$1')}%`
const formatCurrency = (value) => `¥${Math.round(Number(value || 0)).toLocaleString('en-US')}`

const ensureUserCommerceMap = (store) => {
  if (!store.userCommerce || typeof store.userCommerce !== 'object' || Array.isArray(store.userCommerce)) {
    store.userCommerce = {}
  }
  return store
}

const ensureUserCommerceState = (store, profileId) => {
  ensureUserCommerceMap(store)
  if (!profileId) {
    throw createHttpError('missing profileId', 400)
  }
  if (!store.userCommerce[profileId]) {
    const defaults = createDefaultUserCommerceState()
    store.userCommerce[profileId] = {
      ...defaults,
      points: Number(store.profile?.points) >= 0 ? Number(store.profile.points) : defaults.points,
    }
  }
  ensureTaskStates(store.userCommerce[profileId])
  return store.userCommerce[profileId]
}

const createLedgerEntry = ({ delta, kind, sourceId, title }) => ({
  id: createId('ledger'),
  title,
  createdAt: isoNow(),
  delta: Number(delta) || 0,
  kind,
  sourceId,
})

const serializeCommerceState = (profileId) => {
  if (!profileId) {
    const guest = createDefaultUserCommerceState()
    return {
      claimedTaskIds: guest.claimedTaskIds,
      taskClaimStates: {},
      taskStates: guest.taskStates,
      membership: {
        ...guest.membership,
        activePlanName: '',
      },
      ownedRewardIds: guest.ownedRewardIds,
      points: 0,
      pointsLedger: guest.pointsLedger,
      rewardRedemptions: guest.rewardRedemptions,
      templateUnlockProgress: guest.templateUnlockProgress,
      templateUnlockRequiredViews: guest.templateUnlockRequiredViews,
      unlockedTemplateIds: guest.unlockedTemplateIds,
    }
  }

  const contentStore = readContentStore()
  const adminStore = getAdminStore()
  const state = ensureUserCommerceState(contentStore, profileId)
  const activePlan = (adminStore.membershipPlans || []).find((item) => item.id === state.membership.planId) || null
  return {
    claimedTaskIds: state.claimedTaskIds,
    taskStates: state.taskStates,
    taskClaimStates: buildTaskClaimStates(profileId, state),
    membership: {
      ...state.membership,
      activePlanName: activePlan?.name || '',
    },
    ownedRewardIds: state.ownedRewardIds,
    points: Number(state.points) || 0,
    pointsLedger: state.pointsLedger.slice(0, 20),
    rewardRedemptions: state.rewardRedemptions.slice(0, 20),
    templateUnlockProgress: state.templateUnlockProgress,
    templateUnlockRequiredViews: Number(state.templateUnlockRequiredViews) || 3,
    unlockedTemplateIds: state.unlockedTemplateIds,
  }
}

const getTemplateUnlockState = (state, templateId) => {
  const required = Number(state.templateUnlockRequiredViews) || 3
  const current = Math.max(0, Number(state.templateUnlockProgress[templateId]) || 0)
  const unlocked = state.membership.active || state.unlockedTemplateIds.includes(templateId)
  return {
    current,
    required,
    unlocked,
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
      completionRate:
        item.adType && String(item.adType).toLowerCase().includes('banner')
          ? item.completionRate
          : formatPercent((completions / impressions) * 100),
      revenue: formatCurrency(revenueValue),
    }
  })
}

const updateMembershipPlanAfterActivation = (adminStore, planId) => {
  const socialStore = readSocialStore()
  const userCount = Math.max((socialStore.profiles || []).filter((item) => item.phone).length, 1)
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

const claimPointsTask = (profileId, taskId) => {
  const contentStore = readContentStore()
  const state = ensureUserCommerceState(contentStore, profileId)
  const task = (getPointsConfig().tasks || []).find((item) => item.id === taskId)
  if (!task) {
    throw createHttpError('task not found', 404)
  }

  const adminStore = getAdminStore()
  const taskState = normalizeTaskState(state.taskStates[taskId] || {}, taskId)
  const claimState = getTaskClaimState(profileId, taskId, taskState, adminStore, task)
  if (!claimState.canClaim) {
    throw createHttpError(claimState.statusText || '任务条件未满足', 400)
  }

  if (taskId === 'task-share-report') {
    taskState.claimHistory = [isoNow(), ...taskState.claimHistory].slice(0, 14)
  } else if (taskId === 'task-reopen') {
    const completedSessionIds = listCompletedSessionIdsForProfile(adminStore, profileId)
    const claimedSet = new Set(Array.isArray(taskState.claimedSessionIds) ? taskState.claimedSessionIds : [])
    const availableSessionId = completedSessionIds.find((sessionId) => !claimedSet.has(sessionId))
    if (!availableSessionId) {
      throw createHttpError('请先完成并结束一场聚会', 400)
    }
    taskState.claimedSessionIds = [availableSessionId, ...taskState.claimedSessionIds].slice(0, 80)
  } else if (taskId === 'task-signin') {
    taskState.lastClaimAt = isoNow()
  }

  if (!state.claimedTaskIds.includes(taskId)) {
    state.claimedTaskIds.unshift(taskId)
  }
  state.taskStates[taskId] = taskState

  state.points = Number(state.points || 0) + Number(task.value || 0)
  state.pointsLedger.unshift(
    createLedgerEntry({
      delta: Number(task.value || 0),
      kind: 'task',
      sourceId: taskId,
      title: task.title,
    }),
  )
  writeContentStore(contentStore)
  return serializeCommerceState(profileId)
}

const redeemPointsReward = (profileId, rewardId) => {
  const contentStore = readContentStore()
  const state = ensureUserCommerceState(contentStore, profileId)
  const adminStore = getAdminStore()
  const reward = (getPointsConfig().rewards || []).find((item) => item.id === rewardId)
  if (!reward) {
    throw createHttpError('reward not found', 404)
  }
  if (state.ownedRewardIds.includes(rewardId)) {
    return serializeCommerceState(profileId)
  }
  if (Number(state.points || 0) < Number(reward.cost || 0)) {
    throw createHttpError('积分不足', 400)
  }

  state.points = Number(state.points || 0) - Number(reward.cost || 0)
  state.ownedRewardIds.unshift(rewardId)
  state.rewardRedemptions.unshift({
    id: createId('reward-redemption'),
    rewardId,
    title: reward.title,
    cost: Number(reward.cost || 0),
    createdAt: isoNow(),
  })
  state.pointsLedger.unshift(
    createLedgerEntry({
      delta: -Number(reward.cost || 0),
      kind: 'reward',
      sourceId: rewardId,
      title: reward.title,
    }),
  )

  if (rewardId === 'reward-poster-pack') {
    const templateIds = (getTemplateConfig().templates || []).map((item) => item.id)
    state.unlockedTemplateIds = Array.from(new Set([...state.unlockedTemplateIds, ...templateIds]))
  }

  writeContentStore(contentStore)
  updateMerchantAfterRewardRedemption(adminStore, rewardId)
  writeAdminStore(adminStore)
  return serializeCommerceState(profileId)
}

const unlockTemplateByAd = (profileId, templateId) => {
  const contentStore = readContentStore()
  const state = ensureUserCommerceState(contentStore, profileId)
  const adminStore = getAdminStore()
  const template = (getTemplateConfig().templates || []).find((item) => item.id === templateId)
  if (!template) {
    throw createHttpError('template not found', 404)
  }

  const unlockState = getTemplateUnlockState(state, templateId)
  if (unlockState.unlocked) {
    return {
      ...serializeCommerceState(profileId),
      unlockedTemplateId: templateId,
    }
  }

  const nextCurrent = Math.min(unlockState.required, unlockState.current + 1)
  state.templateUnlockProgress[templateId] = nextCurrent
  if (nextCurrent >= unlockState.required) {
    state.unlockedTemplateIds = Array.from(new Set([...state.unlockedTemplateIds, templateId]))
  }
  writeContentStore(contentStore)

  updateAdSlotAfterCompletion(adminStore, 'ad-1')
  writeAdminStore(adminStore)

  return {
    ...serializeCommerceState(profileId),
    unlockedTemplateId: nextCurrent >= unlockState.required ? templateId : '',
  }
}

const getMembershipCatalog = (profileId) => {
  const adminStore = getAdminStore()
  const commerce = serializeCommerceState(profileId)
  return {
    membershipEnabled: adminStore.membershipEnabled !== false,
    benefits: adminStore.membershipBenefits || [],
    membership: commerce.membership,
    plans: (adminStore.membershipPlans || []).map((item) => ({
      ...item,
      active: commerce.membership.active && commerce.membership.planId === item.id,
    })),
  }
}

const activateMembershipPlan = (profileId, planId) => {
  const adminStore = getAdminStore()
  if (adminStore.membershipEnabled === false) {
    throw createHttpError('会员体系暂未对外开放', 403)
  }

  const contentStore = readContentStore()
  const state = ensureUserCommerceState(contentStore, profileId)
  const plan = (adminStore.membershipPlans || []).find((item) => item.id === planId)
  if (!plan) {
    throw createHttpError('plan not found', 404)
  }

  const now = new Date()
  const durationDays = Math.max(numberFromText(plan.duration), 30)
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString()
  state.membership = {
    active: true,
    activatedAt: now.toISOString(),
    expiresAt,
    planId,
  }
  state.membershipOrders.unshift({
    id: createId('membership-order'),
    planId,
    createdAt: now.toISOString(),
    expiresAt,
  })
  writeContentStore(contentStore)

  updateMembershipPlanAfterActivation(adminStore, planId)
  writeAdminStore(adminStore)
  return getMembershipCatalog(profileId)
}

const adjustUserPointsByAdmin = ({ profileId, delta, reason = '', operator = 'admin' }) => {
  const contentStore = readContentStore()
  const state = ensureUserCommerceState(contentStore, profileId)
  const currentPoints = Number(state.points || 0)
  const nextPoints = Math.max(0, currentPoints + Number(delta || 0))
  const actualDelta = nextPoints - currentPoints
  state.points = nextPoints
  if (actualDelta !== 0) {
    state.pointsLedger.unshift(
      createLedgerEntry({
        delta: actualDelta,
        kind: 'admin-adjust',
        sourceId: operator,
        title: reason || `后台${actualDelta > 0 ? '加' : '减'}积分`,
      }),
    )
  }
  writeContentStore(contentStore)
  return serializeCommerceState(profileId)
}

const getAllUserCommerceStates = () => {
  const contentStore = readContentStore()
  ensureUserCommerceMap(contentStore)
  return contentStore.userCommerce
}

module.exports = {
  activateMembershipPlan,
  adjustUserPointsByAdmin,
  claimPointsTask,
  getAllUserCommerceStates,
  getMembershipCatalog,
  getUserCommerceState: serializeCommerceState,
  redeemPointsReward,
  unlockTemplateByAd,
}
