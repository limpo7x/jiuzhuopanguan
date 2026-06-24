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
const cleanText = (value = '') => String(value || '').trim()
const CLAIM_TASK_TIMEZONE = 'Asia/Shanghai'
const FIRST_LOGIN_TASK_ID = 'task-first-login'
const FIRST_LOGIN_BONUS_POINTS = 500
const isDisabledText = (value = '') => ['停用', '下线', 'disabled', 'offline'].some((word) => cleanText(value).toLowerCase().includes(word))
const normalizeToolId = (item = {}) => {
  const aliases = {
    'tool-compress': 'image-compress',
    'tool-json': 'json',
    'tool-qr': 'qr-code',
    'tool-loan': 'loan-calc',
    'tool-currency': 'currency',
    'tool-unit': 'unit',
    'tool-9-grid': 'nine-grid',
    'tool-watermark': 'watermark',
  }
  return aliases[item.id] || item.id || ''
}

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
    [FIRST_LOGIN_TASK_ID]: normalizeTaskState(taskStates[FIRST_LOGIN_TASK_ID], FIRST_LOGIN_TASK_ID),
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

  if (taskId === FIRST_LOGIN_TASK_ID) {
    const hasGranted = (userState.pointsLedger || []).some((entry) => entry.sourceId === FIRST_LOGIN_TASK_ID)
    return {
      canClaim: false,
      buttonText: hasGranted ? '已发放' : '自动发放',
      statusText: hasGranted ? '首次登录奖励已到账' : '首次登录后自动到账',
      remaining: hasGranted ? 0 : 1,
      max: 1,
      reward: taskValue || FIRST_LOGIN_BONUS_POINTS,
    }
  }

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
    store.userCommerce[profileId] = createDefaultUserCommerceState()
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

const grantFirstLoginBonus = (profileId) => {
  const normalizedProfileId = String(profileId || '').trim()
  if (!normalizedProfileId) {
    return null
  }

  const contentStore = readContentStore()
  const state = ensureUserCommerceState(contentStore, normalizedProfileId)
  const hasGranted = (state.pointsLedger || []).some((entry) => entry.sourceId === FIRST_LOGIN_TASK_ID)
  if (hasGranted) {
    return serializeCommerceState(normalizedProfileId)
  }

  state.points = Number(state.points || 0) + FIRST_LOGIN_BONUS_POINTS
  if (!state.claimedTaskIds.includes(FIRST_LOGIN_TASK_ID)) {
    state.claimedTaskIds.unshift(FIRST_LOGIN_TASK_ID)
  }
  state.pointsLedger.unshift(
    createLedgerEntry({
      delta: FIRST_LOGIN_BONUS_POINTS,
      kind: 'task',
      sourceId: FIRST_LOGIN_TASK_ID,
      title: '首次登录赠送',
    }),
  )
  writeContentStore(contentStore)
  return serializeCommerceState(normalizedProfileId)
}

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
      favoriteToolIds: guest.favoriteToolIds,
      usageRecords: guest.usageRecords,
      benefitUsages: guest.benefitUsages,
      inviteRewardClaims: guest.inviteRewardClaims,
      templateUsageRecords: guest.templateUsageRecords,
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
    favoriteToolIds: state.favoriteToolIds || [],
    usageRecords: (state.usageRecords || []).slice(0, 50),
    benefitUsages: (state.benefitUsages || []).slice(0, 50),
    inviteRewardClaims: (state.inviteRewardClaims || []).slice(0, 50),
    templateUsageRecords: (state.templateUsageRecords || []).slice(0, 50),
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

const appendOperationLog = (adminStore, log = {}) => {
  adminStore.operationLogs = Array.isArray(adminStore.operationLogs) ? adminStore.operationLogs : []
  adminStore.operationLogs.unshift({
    id: createId('admin-op'),
    operator: log.operator || 'user-api',
    action: log.action || '用户操作',
    targetId: cleanText(log.targetId),
    targetName: cleanText(log.targetName),
    targetPhone: '',
    targetOpenId: '',
    detail: cleanText(log.detail),
    createdAt: isoNow(),
  })
  adminStore.operationLogs = adminStore.operationLogs.slice(0, 1000)
}

const findEnabledTool = (adminStore, toolId = '') => {
  const normalizedToolId = cleanText(toolId)
  return (adminStore.toolsCatalog || []).find((item) => {
    const rawId = cleanText(item.id)
    const mappedId = cleanText(normalizeToolId(item))
    return !isDisabledText(item.status) && (rawId === normalizedToolId || mappedId === normalizedToolId)
  }) || null
}

const isMembershipActive = (membership = {}) => {
  if (!membership.active) {
    return false
  }
  const expiresAt = cleanText(membership.expiresAt)
  return !expiresAt || Number.isNaN(Date.parse(expiresAt)) || Date.parse(expiresAt) > Date.now()
}

const updateToolStats = (adminStore, toolId = '', updater) => {
  adminStore.toolsCatalog = (adminStore.toolsCatalog || []).map((item) => {
    if (![cleanText(item.id), cleanText(normalizeToolId(item))].includes(cleanText(toolId))) {
      return item
    }
    const next = updater({ ...item })
    const usageCount = Math.max(0, Number(next.usageCount) || 0)
    const favoriteCount = Math.max(0, Number(next.favoriteCount) || numberFromText(next.favoriteCount))
    return {
      ...next,
      usageCount,
      favoriteCount,
      favoriteRate: formatPercent(usageCount ? (favoriteCount / usageCount) * 100 : 0),
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
    if (taskId === 'task-signin') {
      return serializeCommerceState(profileId)
    }
    throw createHttpError(claimState.statusText || 'task conditions not met', 400)
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
    throw createHttpError('聚会权益暂未对外开放', 403)
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

const getEnabledMerchants = (adminStore) => (adminStore.merchants || [])
  .filter((item) => !isDisabledText(item.status))
  .map((item) => ({
    id: cleanText(item.id),
    name: cleanText(item.name),
    category: cleanText(item.category),
    imageUrl: cleanText(item.imageUrl),
    inventory: cleanText(item.inventory),
    claimCount: cleanText(item.claimCount),
    verifiedCount: Number(item.verifiedCount) || 0,
    verifyRate: cleanText(item.verifyRate),
    status: cleanText(item.status),
    claimAction: {
      disabled: true,
      reason: '商户优惠领取合同未闭环，当前仅展示合作状态',
    },
    redeemAction: {
      disabled: true,
      reason: '商户核销、券包和对账流水未闭环',
    },
  }))
  .filter((item) => item.id || item.name)

const getFavoriteTools = (adminStore, favoriteToolIds = []) => {
  const favoriteSet = new Set((favoriteToolIds || []).map(cleanText).filter(Boolean))
  return (adminStore.toolsCatalog || [])
    .map((item) => ({
      id: cleanText(normalizeToolId(item)),
      rawId: cleanText(item.id),
      name: cleanText(item.name),
      category: cleanText(item.category),
      status: cleanText(item.status),
      imageUrl: cleanText(item.imageUrl),
    }))
    .filter((item) => !isDisabledText(item.status) && (favoriteSet.has(item.id) || favoriteSet.has(item.rawId)))
}

const getInviteRewardSummary = (adminStore, state) => {
  const activeCampaigns = (adminStore.campaigns || []).filter((item) => {
    const text = `${item.name || ''} ${item.reward || ''}`.toLowerCase()
    return !isDisabledText(item.status) && !cleanText(item.status).includes('已结束') && (text.includes('邀请') || text.includes('invite'))
  })
  const claimableCampaign = pickInviteRewardCampaign(adminStore)
  const disabledReason = claimableCampaign
    ? '需房主、有效邀请成员和未重复领取后才可发放'
    : '邀请奖励缺少结构化数值奖励配置，本轮禁用领取'
  const items = activeCampaigns.map((item) => ({
    id: cleanText(item.id),
    name: cleanText(item.name),
    title: cleanText(item.name),
    reward: cleanText(item.reward),
    status: cleanText(item.status),
    tag: '邀请奖励',
    type: 'inviteReward',
    disabled: true,
    reason: cleanText(item.id) === cleanText(claimableCampaign?.id) ? '需通过有效 inviteCode 领取' : disabledReason,
    actionLabel: cleanText(item.id) === cleanText(claimableCampaign?.id) ? '按邀请码领取' : '暂未开放',
  }))
  return {
    disabled: !claimableCampaign,
    reason: disabledReason,
    items,
    campaigns: items,
    claims: (state.inviteRewardClaims || []).slice(0, 20),
  }
}

const getPointsActionState = (profileId, commerce) => {
  const config = getPointsConfig()
  const tasks = (config.tasks || []).map((task) => {
    const claimState = commerce.taskClaimStates?.[task.id] || {}
    const canClaim = Boolean(claimState.canClaim)
    return {
      ...task,
      canClaim,
      disabled: !canClaim,
      reason: canClaim ? '' : cleanText(claimState.statusText || claimState.buttonText || '任务条件未满足或已领取'),
      action: {
        method: 'POST',
        endpoint: `/api/v1/points/tasks/${encodeURIComponent(task.id)}/claim`,
        disabled: !canClaim,
        reason: canClaim ? '' : cleanText(claimState.statusText || claimState.buttonText || '任务条件未满足或已领取'),
      },
    }
  })
  const rewards = (config.rewards || []).map((reward) => {
    const owned = (commerce.ownedRewardIds || []).includes(reward.id)
    const insufficient = Number(commerce.points || 0) < Number(reward.cost || 0)
    const disabled = owned || insufficient
    return {
      ...reward,
      canRedeem: !disabled,
      disabled,
      reason: owned ? '已兑换，不能重复领取' : insufficient ? '积分不足' : '',
      action: {
        method: 'POST',
        endpoint: `/api/v1/points/rewards/${encodeURIComponent(reward.id)}/redeem`,
        disabled,
        reason: owned ? '已兑换，不能重复领取' : insufficient ? '积分不足' : '',
      },
    }
  })
  return {
    ...config,
    profileId,
    tasks,
    rewards,
  }
}

const getMembershipActionState = (profileId, catalog) => {
  const membershipDisabled = catalog.membershipEnabled === false
  const active = isMembershipActive(catalog.membership || {})
  return {
    ...catalog,
    profileId,
    disabled: membershipDisabled,
    reason: membershipDisabled ? '会员功能后台总开关关闭' : '',
    plans: (catalog.plans || []).map((plan) => {
      const disabled = membershipDisabled || isDisabledText(plan.status)
      return {
        ...plan,
        disabled,
        reason: membershipDisabled ? '会员功能后台总开关关闭' : disabled ? '套餐未启用' : '',
        action: {
          method: 'POST',
          endpoint: '/api/v1/membership/activate',
          disabled,
          reason: membershipDisabled ? '会员功能后台总开关关闭' : disabled ? '套餐未启用' : '',
        },
      }
    }),
    benefits: (catalog.benefits || []).map((benefit) => {
      const disabled = membershipDisabled || !active || isDisabledText(benefit.status)
      return {
        ...benefit,
        disabled,
        reason: membershipDisabled ? '会员功能后台总开关关闭' : !active ? '需开通会员后使用' : isDisabledText(benefit.status) ? '权益未启用' : '',
        action: {
          method: 'POST',
          endpoint: `/api/v1/membership/benefits/${encodeURIComponent(benefit.id)}/use`,
          disabled,
          reason: membershipDisabled ? '会员功能后台总开关关闭' : !active ? '需开通会员后使用' : isDisabledText(benefit.status) ? '权益未启用' : '',
        },
      }
    }),
  }
}

const getTemplateActionState = (commerce) => {
  const config = getTemplateConfig()
  const templates = (config.templates || []).map((template) => {
    const unlockState = getTemplateUnlockState({
      membership: commerce.membership || {},
      templateUnlockProgress: commerce.templateUnlockProgress || {},
      templateUnlockRequiredViews: commerce.templateUnlockRequiredViews,
      unlockedTemplateIds: commerce.unlockedTemplateIds || [],
    }, template.id)
    const paid = Number(template.cost || 0) > 0
    const canUse = !paid || unlockState.unlocked
    return {
      ...template,
      unlockState,
      canUse,
      disabled: !canUse,
      reason: canUse ? '' : '主题模板需权益配置或完成解锁后使用',
      useAction: {
        method: 'POST',
        endpoint: `/api/v1/templates/${encodeURIComponent(template.id)}/use`,
        disabled: !canUse,
        reason: canUse ? '' : '主题模板需权益配置或完成解锁后使用',
      },
      unlockAction: {
        method: 'POST',
        endpoint: `/api/v1/templates/${encodeURIComponent(template.id)}/unlock`,
        disabled: !paid || unlockState.unlocked,
        reason: !paid ? '免费模板无需解锁' : unlockState.unlocked ? '模板已解锁' : '',
      },
    }
  })
  return {
    ...config,
    templates,
  }
}

const getUserFeatureZones = (profileId) => {
  const normalizedProfileId = cleanText(profileId)
  if (!normalizedProfileId) {
    throw createHttpError('login required', 401)
  }
  const contentStore = readContentStore()
  const state = ensureUserCommerceState(contentStore, normalizedProfileId)
  const adminStore = getAdminStore()
  const commerce = serializeCommerceState(normalizedProfileId)
  const membership = getMembershipActionState(normalizedProfileId, getMembershipCatalog(normalizedProfileId))
  const templates = getTemplateActionState(commerce)
  return {
    profileId: normalizedProfileId,
    points: {
      config: getPointsActionState(normalizedProfileId, commerce),
      state: commerce,
    },
    membership,
    merchants: getEnabledMerchants(adminStore),
    favorites: getFavoriteTools(adminStore, state.favoriteToolIds),
    usageRecords: (state.usageRecords || []).slice(0, 50),
    inviteRewards: getInviteRewardSummary(adminStore, state),
    templates: {
      config: templates,
      unlockedTemplateIds: commerce.unlockedTemplateIds,
      templateUnlockProgress: commerce.templateUnlockProgress,
      templateUsageRecords: commerce.templateUsageRecords,
    },
  }
}

const toggleToolFavorite = (profileId, toolId, favorite = true) => {
  const contentStore = readContentStore()
  const state = ensureUserCommerceState(contentStore, profileId)
  const adminStore = getAdminStore()
  const tool = findEnabledTool(adminStore, toolId)
  if (!tool) {
    throw createHttpError('tool not found', 404)
  }
  const normalizedToolId = cleanText(normalizeToolId(tool))
  const currentSet = new Set((state.favoriteToolIds || []).map(cleanText).filter(Boolean))
  const changed = favorite ? !currentSet.has(normalizedToolId) : currentSet.has(normalizedToolId)
  if (favorite) {
    currentSet.add(normalizedToolId)
  } else {
    currentSet.delete(normalizedToolId)
  }
  state.favoriteToolIds = Array.from(currentSet)

  if (changed) {
    updateToolStats(adminStore, normalizedToolId, (item) => ({
      ...item,
      favoriteCount: Math.max(0, (Number(item.favoriteCount) || numberFromText(item.favoriteCount)) + (favorite ? 1 : -1)),
    }))
    appendOperationLog(adminStore, {
      action: favorite ? '收藏工具' : '取消收藏工具',
      targetId: normalizedToolId,
      targetName: tool.name,
      detail: `profileId=${profileId}`,
    })
  }
  writeContentStore(contentStore)
  writeAdminStore(adminStore)
  return {
    ...serializeCommerceState(profileId),
    favorites: getFavoriteTools(adminStore, state.favoriteToolIds),
  }
}

const recordUserToolUsage = (profileId, toolId) => {
  const contentStore = readContentStore()
  const state = ensureUserCommerceState(contentStore, profileId)
  const adminStore = getAdminStore()
  const tool = findEnabledTool(adminStore, toolId)
  if (!tool) {
    throw createHttpError('tool not found', 404)
  }
  const normalizedToolId = cleanText(normalizeToolId(tool))
  const record = {
    id: createId('usage'),
    toolId: normalizedToolId,
    name: cleanText(tool.name),
    category: cleanText(tool.category),
    usedAt: isoNow(),
  }
  state.usageRecords = [record, ...(state.usageRecords || [])].slice(0, 80)
  updateToolStats(adminStore, normalizedToolId, (item) => ({
    ...item,
    usageCount: Math.max(0, Number(item.usageCount) || 0) + 1,
  }))
  appendOperationLog(adminStore, {
    action: '使用工具',
    targetId: normalizedToolId,
    targetName: tool.name,
    detail: `profileId=${profileId}`,
  })
  writeContentStore(contentStore)
  writeAdminStore(adminStore)
  return {
    ...serializeCommerceState(profileId),
    usageRecord: record,
  }
}

const useMembershipBenefit = (profileId, benefitId) => {
  const adminStore = getAdminStore()
  if (adminStore.membershipEnabled === false) {
    throw createHttpError('聚会权益暂未对外开放', 403)
  }
  const contentStore = readContentStore()
  const state = ensureUserCommerceState(contentStore, profileId)
  if (!isMembershipActive(state.membership)) {
    throw createHttpError('会员权益需开通会员后使用', 403)
  }
  const benefit = (adminStore.membershipBenefits || []).find((item) => cleanText(item.id) === cleanText(benefitId) && !isDisabledText(item.status))
  if (!benefit) {
    throw createHttpError('benefit not found', 404)
  }
  const record = {
    id: createId('benefit-usage'),
    benefitId: cleanText(benefit.id),
    name: cleanText(benefit.name),
    usedAt: isoNow(),
  }
  state.benefitUsages = [record, ...(state.benefitUsages || [])].slice(0, 80)
  appendOperationLog(adminStore, {
    action: '使用会员权益',
    targetId: benefit.id,
    targetName: benefit.name,
    detail: `profileId=${profileId}`,
  })
  writeContentStore(contentStore)
  writeAdminStore(adminStore)
  return {
    ...getMembershipCatalog(profileId),
    benefitUsage: record,
  }
}

const useTemplate = (profileId, templateId) => {
  const contentStore = readContentStore()
  const state = ensureUserCommerceState(contentStore, profileId)
  const adminStore = getAdminStore()
  const template = (getTemplateConfig().templates || []).find((item) => cleanText(item.id) === cleanText(templateId))
  if (!template) {
    throw createHttpError('template not found', 404)
  }
  const unlockState = getTemplateUnlockState(state, templateId)
  if (Number(template.cost || 0) > 0 && !unlockState.unlocked) {
    throw createHttpError('template not unlocked', 403)
  }
  const record = {
    id: createId('template-usage'),
    templateId: cleanText(template.id),
    title: cleanText(template.title),
    usedAt: isoNow(),
  }
  state.templateUsageRecords = [record, ...(state.templateUsageRecords || [])].slice(0, 80)
  appendOperationLog(adminStore, {
    action: '使用主题模板',
    targetId: template.id,
    targetName: template.title,
    detail: `profileId=${profileId}`,
  })
  writeContentStore(contentStore)
  writeAdminStore(adminStore)
  return {
    ...serializeCommerceState(profileId),
    templateUsage: record,
  }
}

const pickInviteRewardCampaign = (adminStore) =>
  (adminStore.campaigns || []).find((item) => {
    const text = `${item.name || ''} ${item.reward || ''}`.toLowerCase()
    const rewardText = cleanText(item.reward).toLowerCase()
    return !isDisabledText(item.status)
      && !cleanText(item.status).includes('已结束')
      && (text.includes('邀请') || text.includes('invite'))
      && (rewardText.includes('积分') || rewardText.includes('point'))
      && numberFromText(item.reward) > 0
  }) || null

const claimInviteReward = (profileId, inviteCode) => {
  const normalizedInviteCode = cleanText(inviteCode)
  if (!normalizedInviteCode) {
    throw createHttpError('invite code required', 400)
  }
  const adminStore = getAdminStore()
  const session = (adminStore.liveSessions || []).find((item) => cleanText(item.inviteCode) === normalizedInviteCode || cleanText(item.id) === normalizedInviteCode)
  if (!session) {
    throw createHttpError('session not found', 404)
  }
  const normalizedProfileId = cleanText(profileId)
  const hostProfileId = cleanText(session.hostProfileId)
  const memberRows = Array.isArray(session.members) ? session.members : []
  const isHost = hostProfileId === normalizedProfileId || memberRows.some((item) => cleanText(item.profileId) === normalizedProfileId && (item.isHost || cleanText(item.role).includes('host')))
  if (!isHost) {
    throw createHttpError('only session host can claim invite reward', 403)
  }
  const joinedGuestCount = memberRows.filter((item) => cleanText(item.profileId) !== normalizedProfileId && cleanText(item.status).includes('已加入')).length
  if (joinedGuestCount <= 0) {
    throw createHttpError('invite reward requires joined members', 400)
  }
  const campaign = pickInviteRewardCampaign(adminStore)
  if (!campaign) {
    throw createHttpError('invite reward not configured', 403)
  }

  const contentStore = readContentStore()
  const state = ensureUserCommerceState(contentStore, normalizedProfileId)
  const sessionId = cleanText(session.id)
  const duplicated = (state.inviteRewardClaims || []).some((item) => cleanText(item.sessionId) === sessionId || cleanText(item.inviteCode) === normalizedInviteCode)
  if (duplicated) {
    throw createHttpError('invite reward already claimed', 409)
  }

  const points = Math.max(0, numberFromText(campaign.reward))
  state.points = Number(state.points || 0) + points
  state.pointsLedger.unshift(
    createLedgerEntry({
      delta: points,
      kind: 'invite-reward',
      sourceId: sessionId || normalizedInviteCode,
      title: cleanText(campaign.name) || '邀请奖励',
    }),
  )
  const claim = {
    id: createId('invite-reward'),
    inviteCode: normalizedInviteCode,
    sessionId,
    points,
    claimedAt: isoNow(),
  }
  state.inviteRewardClaims = [claim, ...(state.inviteRewardClaims || [])].slice(0, 80)
  adminStore.campaigns = (adminStore.campaigns || []).map((item) =>
    cleanText(item.id) === cleanText(campaign.id)
      ? {
          ...item,
          participants: String(numberFromText(item.participants) + 1),
          returnCount: Math.max(0, Number(item.returnCount) || 0) + 1,
        }
      : item,
  )
  appendOperationLog(adminStore, {
    action: '领取邀请奖励',
    targetId: sessionId || normalizedInviteCode,
    targetName: cleanText(session.name || session.sessionName),
    detail: `profileId=${profileId}; points=${points}`,
  })
  writeContentStore(contentStore)
  writeAdminStore(adminStore)
  return {
    ...serializeCommerceState(normalizedProfileId),
    inviteRewardClaim: claim,
  }
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
  claimInviteReward,
  claimPointsTask,
  grantFirstLoginBonus,
  getAllUserCommerceStates,
  getMembershipCatalog,
  getUserFeatureZones,
  getUserCommerceState: serializeCommerceState,
  recordUserToolUsage,
  redeemPointsReward,
  toggleToolFavorite,
  unlockTemplateByAd,
  useMembershipBenefit,
  useTemplate,
}
