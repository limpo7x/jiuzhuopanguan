const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { createStoreAccessor, isMySQLEnabled } = require('./store-accessor')
const {
  createDefaultUserCommerceState,
  getCompliance,
  getHomeConfig,
  getPointsConfig,
  getProfile,
  getTemplateConfig,
  getToolHistory,
  readContentStore,
  updateCompliance,
  updateHomeConfig,
  updatePointsConfig,
  updateTemplateConfig,
  writeContentStore,
} = require('./content')
const {
  ensureProfile,
  listAllPokes,
  listFriendships,
  listProfiles,
  readSocialStore,
  writeSocialStore,
} = require('./social')

const storePath = path.join(__dirname, 'admin-store.json')
const SESSION_TTL = 1000 * 60 * 60 * 12
const ADMIN_LOGIN_MAX_FAILURES = 5
const ADMIN_LOGIN_LOCK_MS = 1000 * 60 * 15

const hashPassword = (password) => crypto.createHash('sha256').update(password).digest('hex')
const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
const now = () => Date.now()
const iso = (value = Date.now()) => new Date(value).toISOString()
const SESSION_STATE_LIVE = '进行中'
const SESSION_STATE_ENDED = '已结束'
const isEndedSessionState = (value = '') => String(value || '').trim().includes('结束')
const normalizeSessionState = (value = '', fallback = SESSION_STATE_LIVE) => {
  const text = String(value || '').trim()
  if (isEndedSessionState(text)) {
    return SESSION_STATE_ENDED
  }
  if (text.includes('进行中') || text.includes('等待') || text.includes('正常')) {
    return SESSION_STATE_LIVE
  }
  return fallback
}
const normalizeSessionStatusForState = (status = '', state = '') => {
  const normalizedState = normalizeSessionState(state, SESSION_STATE_LIVE)
  const text = String(status || '').trim()
  if (isEndedSessionState(normalizedState) || isEndedSessionState(text)) {
    return SESSION_STATE_ENDED
  }
  return normalizedState
}
const numberFromText = (value) => {
  const matched = String(value || '')
    .replace(/,/g, '')
    .match(/-?\d+(?:\.\d+)?/)
  return matched ? Number(matched[0]) : 0
}
const formatPercent = (value, digits = 1) =>
  `${Number(value || 0).toFixed(digits).replace(/\.0$/, '').replace(/(\.\d*[1-9])0+$/, '$1')}%`
const ratioPercent = (numerator, denominator, digits = 1) =>
  formatPercent(denominator ? (Number(numerator || 0) / Number(denominator || 0)) * 100 : 0, digits)
const normalizeTemplateImageUrl = (value = '') => {
  const text = String(value || '').trim()
  if (/^https?:\/\/(?:127\.0\.0\.1(?::\d+)?\/__store__|store\/)/i.test(text) || /\/__store__\//i.test(text) || /\/__tmp__\//i.test(text)) {
    return ''
  }
  return text.replace(/^\/static\/templates\/(.+)\.svg$/i, '/static/templates/$1.png')
}
const seedCountFromRate = (rateText, denominator, fallbackBase = 1000) => {
  const rateValue = Math.max(0, numberFromText(rateText))
  const base = Math.max(1, Number(denominator) || fallbackBase)
  return Math.max(0, Math.round((rateValue / 100) * base))
}

const DEFAULT_TOOLS_HERO = {
  title: '顺手工具',
  subtitle: '常用图片、分享、计算和文本工具都在这里。',
  imageUrl: 'https://cdn.pomer.cn/static/toolbox-banner-tools-1125x690.png',
}

const DEFAULT_TOOLS_CATALOG = [
  {
    id: 'tool-qr',
    name: '二维码生成',
    category: '分享生成',
    target: '邀局裂变',
    imageUrl: 'https://cdn.pomer.cn/static/report-poster.png',
    usageCount: 5622,
    favoriteCount: 944,
    favoriteRate: '16.8%',
    status: '启用',
    sortOrder: 10,
    isHot: '是',
    placement: 'both',
  },
  {
    id: 'tool-compress',
    name: '图片压缩',
    category: '图片处理',
    target: '工具留存',
    imageUrl: 'https://cdn.pomer.cn/static/image-process-hero.png',
    usageCount: 3410,
    favoriteCount: 450,
    favoriteRate: '13.2%',
    status: '启用',
    sortOrder: 20,
    isHot: '是',
    placement: 'both',
  },
  {
    id: 'tool-json',
    name: 'JSON 格式化',
    category: '开发工具',
    target: '日活补充',
    imageUrl: 'https://cdn.pomer.cn/static/toolbox-hero.png',
    usageCount: 2184,
    favoriteCount: 190,
    favoriteRate: '8.7%',
    status: '启用',
    sortOrder: 30,
    isHot: '是',
    placement: 'tools',
  },
  {
    id: 'tool-loan',
    name: '房贷计算',
    category: '计算工具',
    target: '实用转化',
    imageUrl: 'https://cdn.pomer.cn/static/report-poster.png',
    usageCount: 1921,
    favoriteCount: 181,
    favoriteRate: '9.4%',
    status: '启用',
    sortOrder: 40,
    isHot: '是',
    placement: 'both',
  },
  {
    id: 'tool-currency',
    name: '汇率换算',
    category: '计算工具',
    target: '日常工具',
    imageUrl: 'https://cdn.pomer.cn/static/report-poster.png',
    usageCount: 1688,
    favoriteCount: 120,
    favoriteRate: '7.1%',
    status: '启用',
    sortOrder: 50,
    isHot: '否',
    placement: 'tools',
  },
  {
    id: 'tool-unit',
    name: '单位换算',
    category: '计算工具',
    target: '日常工具',
    imageUrl: 'https://cdn.pomer.cn/static/report-poster.png',
    usageCount: 1450,
    favoriteCount: 91,
    favoriteRate: '6.3%',
    status: '启用',
    sortOrder: 60,
    isHot: '否',
    placement: 'tools',
  },
  {
    id: 'tool-9-grid',
    name: '九宫格切图',
    category: '图片处理',
    target: '分享物料',
    imageUrl: 'https://cdn.pomer.cn/static/image-process-hero.png',
    usageCount: 1280,
    favoriteCount: 131,
    favoriteRate: '10.2%',
    status: '启用',
    sortOrder: 70,
    isHot: '否',
    placement: 'tools',
  },
  {
    id: 'tool-watermark',
    name: '图片去水印',
    category: '图片处理',
    target: '内容编辑',
    imageUrl: 'https://cdn.pomer.cn/static/party-hero.png',
    usageCount: 1166,
    favoriteCount: 98,
    favoriteRate: '8.4%',
    status: '启用',
    sortOrder: 80,
    isHot: '否',
    placement: 'tools',
  },
]

const RANKING_REWARD_CATEGORIES = [
  { value: 'today_funny', label: '今日最有梗' },
  { value: 'today_debt', label: '今日最欠酒' },
  { value: 'today_highlight', label: '今日最精彩' },
  { value: 'today_visual', label: '今日最有画面' },
  { value: 'best_opening', label: '最佳开场' },
  { value: 'best_closing', label: '最佳收尾' },
]

const DEFAULT_RANKING_REWARD_RULES = [
  { id: 'reward-rule-today-funny-1', category: 'today_funny', enabled: 'true', rankStart: 1, rankEnd: 1, points: 100, effectiveAt: '', reason: '初始榜单奖励配置', updatedAt: '' },
  { id: 'reward-rule-today-funny-2', category: 'today_funny', enabled: 'true', rankStart: 2, rankEnd: 3, points: 50, effectiveAt: '', reason: '初始榜单奖励配置', updatedAt: '' },
  { id: 'reward-rule-today-debt-1', category: 'today_debt', enabled: 'true', rankStart: 1, rankEnd: 1, points: 80, effectiveAt: '', reason: '初始榜单奖励配置', updatedAt: '' },
  { id: 'reward-rule-today-highlight-1', category: 'today_highlight', enabled: 'true', rankStart: 1, rankEnd: 1, points: 120, effectiveAt: '', reason: '初始榜单奖励配置', updatedAt: '' },
  { id: 'reward-rule-today-visual-1', category: 'today_visual', enabled: 'true', rankStart: 1, rankEnd: 1, points: 100, effectiveAt: '', reason: '初始榜单奖励配置', updatedAt: '' },
  { id: 'reward-rule-best-opening-1', category: 'best_opening', enabled: 'true', rankStart: 1, rankEnd: 1, points: 60, effectiveAt: '', reason: '初始榜单奖励配置', updatedAt: '' },
  { id: 'reward-rule-best-closing-1', category: 'best_closing', enabled: 'true', rankStart: 1, rankEnd: 1, points: 60, effectiveAt: '', reason: '初始榜单奖励配置', updatedAt: '' },
]

const normalizeToolItem = (item = {}, index = 0) => ({
  id: String(item.id || '').trim(),
  name: String(item.name || '').trim(),
  category: String(item.category || '').trim(),
  target: String(item.target || '').trim(),
  imageUrl: String(item.imageUrl || '').trim(),
  usageCount: Number(item.usageCount) || 0,
  favoriteCount: Math.max(0, Number(item.favoriteCount) || 0),
  favoriteRate: String(item.favoriteRate || '').trim(),
  status: String(item.status || '').trim(),
  sortOrder: Number(item.sortOrder) || (index + 1) * 10,
  isHot: String(item.isHot || '').trim(),
  placement: String(item.placement || '').trim(),
})

const normalizeToolsCatalog = (tools = []) => {
  const inputItems = Array.isArray(tools) ? tools : []
  return inputItems
    .filter((item) => item && String(item.id || '').trim())
    .map((item, index) => normalizeToolItem(item, index))
    .sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder))
}

const getRankingCategoryLabel = (category) =>
  RANKING_REWARD_CATEGORIES.find((item) => item.value === String(category || '').trim())?.label || String(category || '').trim()

const normalizeRankingRewardRule = (item = {}, index = 0) => {
  const category = String(item.category || RANKING_REWARD_CATEGORIES[0].value).trim()
  const rankStart = Math.max(1, Number(item.rankStart) || 1)
  const rankEnd = Math.max(rankStart, Number(item.rankEnd) || rankStart)
  return {
    id: String(item.id || `reward-rule-${category}-${index + 1}`).trim(),
    category,
    categoryName: getRankingCategoryLabel(category),
    enabled: String(item.enabled ?? 'true') === 'false' ? 'false' : 'true',
    rankStart,
    rankEnd,
    points: Math.max(0, Number(item.points) || 0),
    effectiveAt: String(item.effectiveAt || '').trim(),
    reason: String(item.reason || '').trim(),
    updatedAt: String(item.updatedAt || '').trim(),
  }
}
const createDefaultStore = () => ({
  adminUsers: [
    {
      id: 'admin-root',
      username: 'admin',
      passwordHash: hashPassword('Admin@123456'),
      name: '系统管理员',
      roleId: 'role-super-admin',
      status: 'active',
      lastLoginAt: '',
      failedLoginCount: 0,
      lockedUntil: '',
      passwordUpdatedAt: '',
    },
    {
      id: 'admin-content',
      username: 'content.ops',
      passwordHash: hashPassword('Content@123'),
      name: '内容运营',
      roleId: 'role-content-ops',
      status: 'active',
      lastLoginAt: '',
      failedLoginCount: 0,
      lockedUntil: '',
      passwordUpdatedAt: '',
    },
  ],
  roles: [
    {
      id: 'role-super-admin',
      name: '超级管理员',
      scope: '全量模块',
      permissions: ['*'],
      status: 'active',
    },
    {
      id: 'role-content-ops',
      name: '内容运营',
      scope: '首页、模板、题库、素材',
      permissions: ['content', 'share', 'tools'],
      status: 'active',
    },
    {
      id: 'role-commerce-ops',
      name: '商业化运营',
      scope: '积分、会员、广告、商户',
      permissions: ['points', 'membership', 'ads', 'merchant'],
      status: 'active',
    },
  ],
  sessions: [],
  operationLogs: [],
  analyticsEvents: [],
  userOps: [],
  questionBank: [],
  shareAssets: [],
  toolsHero: DEFAULT_TOOLS_HERO,
  toolsCatalog: normalizeToolsCatalog(DEFAULT_TOOLS_CATALOG),
  liveSessions: [],
  reports: [],
  membershipPlans: [],
  membershipBenefits: [],
  membershipEnabled: false,
  adSlots: [],
  merchants: [],
  campaigns: [],
  baseConfigs: [],
  sensitiveWords: [],
  auditQueue: [],
  momentReviewItems: [],
  momentReportItems: [],
  shareImageTasks: [],
  rankingRewardRules: DEFAULT_RANKING_REWARD_RULES,
})

const getSessionContactsByProfile = (profileId) => {
  const store = readStore()
  const normalizedProfileId = String(profileId || '').trim()
  if (!normalizedProfileId) {
    return []
  }

  const now = Date.now()
  const contacts = new Map()

  store.liveSessions.forEach((session) => {
    const members = Array.isArray(session?.members) ? session.members : []
    const involved = members.some((member) => String(member?.profileId || '').trim() === normalizedProfileId)
    if (!involved) {
      return
    }

    members.forEach((member) => {
      const friendProfileId = String(member?.profileId || '').trim()
      if (!friendProfileId || friendProfileId === normalizedProfileId) {
        return
      }

      const nextUpdatedAt = Number(member?.updatedAt || member?.joinedAt || member?.createdAt || session?.updatedAt || now)
      const existed = contacts.get(friendProfileId)
      if (existed && nextUpdatedAt <= Number(existed.updatedAt || 0)) {
        return
      }

      contacts.set(friendProfileId, {
        id: friendProfileId,
        profileId: friendProfileId,
        name: String(member?.name || '').trim() || `用户${friendProfileId.slice(-4)}`,
        avatarUrl: String(member?.avatarUrl || '').trim(),
        identityTag: String(member?.identityTag || '').trim(),
        updatedAt: nextUpdatedAt,
      })
    })
  })

  return Array.from(contacts.values()).sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0))
}

const normalizeShareAsset = (item = {}) => {
  const exposureCount = Math.max(0, Number(item.exposureCount) || 0)
  const openCount = Math.max(0, Number(item.openCount) || 0)
  const returnCount = Math.max(0, Number(item.returnCount) || 0)
  return {
    ...item,
    id: String(item.id || '').trim(),
    name: String(item.name || '').trim(),
    assetType: String(item.assetType || '').trim(),
    scene: String(item.scene || '').trim(),
    imageUrl: String(item.imageUrl || '').trim(),
    exposureCount,
    openCount,
    returnCount,
    openRate: ratioPercent(openCount, exposureCount),
    returnRate: ratioPercent(returnCount, openCount),
    status: String(item.status || '').trim(),
  }
}

const normalizeReportItem = (item = {}) => {
  const viewCount = Math.max(0, Number(item.viewCount) || 0)
  const shareCount = Math.max(0, Number(item.shareCount) || 0)
  const replayCount = Math.max(0, Number(item.replayCount) || 0)
  return {
    ...item,
    id: String(item.id || '').trim(),
    name: String(item.name || '').trim(),
    template: String(item.template || '').trim(),
    title: String(item.title || '').trim(),
    scene: String(item.scene || '').trim(),
    highlight1: String(item.highlight1 || '').trim(),
    highlight2: String(item.highlight2 || '').trim(),
    highlight3: String(item.highlight3 || '').trim(),
    viewCount,
    shareCount,
    replayCount,
    shareRate: ratioPercent(shareCount, viewCount),
    replayRate: ratioPercent(replayCount, viewCount),
    status: String(item.status || '').trim(),
  }
}

const normalizeMembershipPlan = (item = {}) => {
  const exposureCount = Math.max(0, Number(item.exposureCount) || 0)
  const purchaseCount = Math.max(0, Number(item.purchaseCount) || 0)
  const renewalCount = Math.max(0, Number(item.renewalCount) || 0)
  return {
    ...item,
    id: String(item.id || '').trim(),
    name: String(item.name || '').trim(),
    price: String(item.price || '').trim(),
    duration: String(item.duration || '').trim(),
    exposureCount,
    purchaseCount,
    renewalCount,
    conversionRate: ratioPercent(purchaseCount, exposureCount),
    renewRate: ratioPercent(renewalCount, purchaseCount),
    status: String(item.status || '').trim(),
  }
}

const normalizeAdSlot = (item = {}) => {
  const impressions = Math.max(0, Number(item.impressions) || 0)
  const completions = Math.max(0, Number(item.completions) || 0)
  const revenueValue = Number(item.revenueValue) || numberFromText(item.revenue)
  return {
    ...item,
    id: String(item.id || '').trim(),
    name: String(item.name || '').trim(),
    page: String(item.page || '').trim(),
    adType: String(item.adType || '').trim(),
    impressions,
    completions,
    revenueValue,
    completionRate: ratioPercent(completions, impressions),
    revenue: revenueValue ? '?' + Math.round(revenueValue).toLocaleString('en-US') : '',
    status: String(item.status || '').trim(),
  }
}

const normalizeMerchant = (item = {}) => {
  const claimCount = Math.max(0, Number(item.claimCount) || numberFromText(item.claimCount))
  const verifiedCount = Math.max(0, Number(item.verifiedCount) || 0)
  return {
    ...item,
    id: String(item.id || '').trim(),
    name: String(item.name || '').trim(),
    category: String(item.category || '').trim(),
    imageUrl: String(item.imageUrl || '').trim(),
    inventory: String(item.inventory || '').trim(),
    claimCount: claimCount ? String(claimCount) : '',
    verifiedCount,
    verifyRate: ratioPercent(verifiedCount, claimCount),
    status: String(item.status || '').trim(),
  }
}

const normalizeCampaign = (item = {}) => {
  const participants = Math.max(0, Number(item.participants) || numberFromText(item.participants))
  const returnCount = Math.max(0, Number(item.returnCount) || 0)
  return {
    ...item,
    id: String(item.id || '').trim(),
    name: String(item.name || '').trim(),
    reward: String(item.reward || '').trim(),
    participants: participants ? String(participants) : '',
    returnCount,
    returnRate: ratioPercent(returnCount, participants),
    status: String(item.status || '').trim(),
  }
}

const normalizeStore = (store = {}) => {
  const next = {
    ...createDefaultStore(),
    ...store,
    sessions: Array.isArray(store.sessions) ? store.sessions.filter((item) => Number(item.expiresAt) > now()) : [],
  }
  next.liveSessions = Array.isArray(store.liveSessions)
    ? store.liveSessions.map((item, index) => normalizeLiveSession(item, index))
    : createDefaultStore().liveSessions.map((item, index) => normalizeLiveSession(item, index))
  next.toolsHero = {
    ...DEFAULT_TOOLS_HERO,
    ...(store.toolsHero && typeof store.toolsHero === 'object' ? store.toolsHero : {}),
  }
  next.toolsCatalog = normalizeToolsCatalog(
    Array.isArray(store.toolsCatalog) && store.toolsCatalog.length ? store.toolsCatalog : DEFAULT_TOOLS_CATALOG,
  )
  next.shareAssets = (Array.isArray(store.shareAssets) ? store.shareAssets : next.shareAssets).map((item, index) =>
    normalizeShareAsset(item, index),
  )
  next.reports = (Array.isArray(store.reports) ? store.reports : next.reports).map((item, index) => normalizeReportItem(item, index))
  next.membershipPlans = (Array.isArray(store.membershipPlans) ? store.membershipPlans : next.membershipPlans).map((item, index) =>
    normalizeMembershipPlan(item, index),
  )
  next.adSlots = (Array.isArray(store.adSlots) ? store.adSlots : next.adSlots).map((item, index) => normalizeAdSlot(item, index))
  next.merchants = (Array.isArray(store.merchants) ? store.merchants : next.merchants).map((item, index) => normalizeMerchant(item, index))
  next.campaigns = (Array.isArray(store.campaigns) ? store.campaigns : next.campaigns).map((item, index) => normalizeCampaign(item, index))
  next.operationLogs = Array.isArray(store.operationLogs) ? store.operationLogs : []
  next.adminUsers = (Array.isArray(store.adminUsers) ? store.adminUsers : next.adminUsers).map((user) => ({
    ...user,
    failedLoginCount: Math.max(0, Number(user.failedLoginCount) || 0),
    lockedUntil: String(user.lockedUntil || '').trim(),
    passwordUpdatedAt: String(user.passwordUpdatedAt || '').trim(),
  }))
  next.analyticsEvents = Array.isArray(store.analyticsEvents) ? store.analyticsEvents : []
  next.momentReviewItems = Array.isArray(store.momentReviewItems) ? store.momentReviewItems : []
  next.momentReportItems = Array.isArray(store.momentReportItems) ? store.momentReportItems : []
  next.shareImageTasks = Array.isArray(store.shareImageTasks) ? store.shareImageTasks : []
  next.rankingRewardRules = (Array.isArray(store.rankingRewardRules) ? store.rankingRewardRules : next.rankingRewardRules).map((item, index) =>
    normalizeRankingRewardRule(item, index),
  )
  return next
}

const storeAccessor = createStoreAccessor({
  key: 'admin_store',
  filePath: storePath,
  createDefaultStore,
  normalizeStore,
})

const readStore = () => storeAccessor.read()

const writeStore = (store) => storeAccessor.write(store)

const getAdminUserView = (user, roles) => ({
  id: user.id,
  username: user.username,
  name: user.name,
  roleId: user.roleId,
  roleName: roles.find((item) => item.id === user.roleId)?.name || '',
  status: user.status,
  lastLoginAt: user.lastLoginAt || '',
  failedLoginCount: Math.max(0, Number(user.failedLoginCount) || 0),
  lockedUntil: user.lockedUntil || '',
  passwordUpdatedAt: user.passwordUpdatedAt || '',
})

const createAdminAuthError = (message, statusCode = 401, code = 'ADMIN_AUTH_FAILED') =>
  Object.assign(new Error(message), {
    statusCode,
    code,
  })

const getLoginClientLabel = ({ ip = '', userAgent = '' } = {}) =>
  [
    String(ip || '').trim(),
    String(userAgent || '').trim().slice(0, 120),
  ].filter(Boolean).join(' / ')

const isUserLocked = (user = {}, timestamp = now()) => {
  const lockedUntilMs = Date.parse(user.lockedUntil || '')
  return Number.isFinite(lockedUntilMs) && lockedUntilMs > timestamp
}

const recordAdminLoginFailure = (store, { user, username, reason, ip, userAgent }) => {
  const current = now()
  const client = getLoginClientLabel({ ip, userAgent })
  if (user) {
    user.failedLoginCount = Math.max(0, Number(user.failedLoginCount) || 0) + 1
    user.lastFailedLoginAt = iso(current)
    if (user.failedLoginCount >= ADMIN_LOGIN_MAX_FAILURES) {
      user.lockedUntil = iso(current + ADMIN_LOGIN_LOCK_MS)
      store.sessions = (store.sessions || []).filter((item) => item.userId !== user.id)
    }
  }
  appendAdminOperationLog(store, {
    operator: 'admin-auth',
    action: user?.lockedUntil && isUserLocked(user, current) ? '后台登录失败并锁定账号' : '后台登录失败',
    targetId: user?.id || '',
    targetName: user?.username || String(username || '').trim(),
    detail: [
      reason || '账号或密码错误',
      user ? `失败次数 ${user.failedLoginCount}/${ADMIN_LOGIN_MAX_FAILURES}` : '账号不存在或不可用',
      user?.lockedUntil ? `锁定至 ${user.lockedUntil}` : '',
      client ? `来源 ${client}` : '',
    ].filter(Boolean).join('；'),
  })
}

const loginAdmin = ({ username, password, ip = '', userAgent = '' }) => {
  const store = readStore()
  const normalizedUsername = String(username || '').trim()
  const user = store.adminUsers.find((item) => item.username === normalizedUsername)
  if (!user || user.status !== 'active') {
    recordAdminLoginFailure(store, {
      username: normalizedUsername,
      reason: '账号不存在或已停用',
      ip,
      userAgent,
    })
    writeStore(store)
    throw createAdminAuthError('账号或密码错误')
  }

  if (isUserLocked(user)) {
    appendAdminOperationLog(store, {
      operator: 'admin-auth',
      action: '后台登录被锁定拦截',
      targetId: user.id,
      targetName: user.username,
      detail: `账号已锁定至 ${user.lockedUntil}${getLoginClientLabel({ ip, userAgent }) ? `；来源 ${getLoginClientLabel({ ip, userAgent })}` : ''}`,
    })
    writeStore(store)
    throw createAdminAuthError(`账号已锁定，请在 ${user.lockedUntil} 后重试`, 423, 'ADMIN_LOCKED')
  }

  if (user.passwordHash !== hashPassword(String(password || ''))) {
    recordAdminLoginFailure(store, {
      user,
      username: normalizedUsername,
      reason: '密码错误',
      ip,
      userAgent,
    })
    writeStore(store)
    if (isUserLocked(user)) {
      throw createAdminAuthError(`账号已锁定，请在 ${user.lockedUntil} 后重试`, 423, 'ADMIN_LOCKED')
    }
    throw createAdminAuthError(`账号或密码错误，还可尝试 ${Math.max(0, ADMIN_LOGIN_MAX_FAILURES - user.failedLoginCount)} 次`)
  }

  const token = crypto.randomBytes(24).toString('hex')
  const session = {
    token,
    userId: user.id,
    createdAt: now(),
    expiresAt: now() + SESSION_TTL,
  }
  user.lastLoginAt = iso()
  user.failedLoginCount = 0
  user.lockedUntil = ''
  user.lastFailedLoginAt = ''
  store.sessions = store.sessions.filter((item) => item.userId !== user.id)
  store.sessions.unshift(session)
  appendAdminOperationLog(store, {
    operator: user.username,
    action: '后台登录成功',
    targetId: user.id,
    targetName: user.username,
    detail: getLoginClientLabel({ ip, userAgent }) ? `来源 ${getLoginClientLabel({ ip, userAgent })}` : '管理员登录后台',
  })
  writeStore(store)
  return {
    token,
    user: getAdminUserView(user, store.roles),
  }
}

const resetAdminPassword = ({ userId, newPassword, operator = 'admin-console', preserveToken = '' } = {}) => {
  const normalizedUserId = String(userId || '').trim()
  const normalizedPassword = String(newPassword || '')
  if (!normalizedUserId) {
    throw createAdminAuthError('缺少管理员账号 ID', 400, 'ADMIN_USER_REQUIRED')
  }
  if (normalizedPassword.length < 8) {
    throw createAdminAuthError('新密码至少 8 位', 400, 'ADMIN_PASSWORD_WEAK')
  }

  const store = readStore()
  const user = store.adminUsers.find((item) => item.id === normalizedUserId)
  if (!user) {
    throw createAdminAuthError('管理员账号不存在', 404, 'ADMIN_USER_NOT_FOUND')
  }
  user.passwordHash = hashPassword(normalizedPassword)
  user.passwordUpdatedAt = iso()
  user.failedLoginCount = 0
  user.lockedUntil = ''
  user.lastFailedLoginAt = ''
  store.sessions = (store.sessions || []).filter((item) => item.userId !== user.id || (preserveToken && item.token === preserveToken))
  appendAdminOperationLog(store, {
    operator,
    action: '重置后台管理员密码',
    targetId: user.id,
    targetName: user.username,
    detail: preserveToken ? '已重置密码、清空失败次数并保留当前操作会话' : '已重置密码、清空失败次数并注销该账号现有后台会话',
  })
  writeStore(store)
  return {
    user: getAdminUserView(user, store.roles),
  }
}

const getSession = (token) => {
  if (!token) {
    return null
  }
  const store = readStore()
  const session = store.sessions.find((item) => item.token === token && Number(item.expiresAt) > now())
  if (!session) {
    return null
  }
  const user = store.adminUsers.find((item) => item.id === session.userId)
  if (!user || user.status !== 'active') {
    return null
  }
  return {
    token,
    user: getAdminUserView(user, store.roles),
  }
}

const logoutAdmin = (token) => {
  if (!token) {
    return
  }
  const store = readStore()
  store.sessions = store.sessions.filter((item) => item.token !== token)
  writeStore(store)
}

const average = (values = []) => (values.length ? values.reduce((sum, item) => sum + Number(item || 0), 0) / values.length : 0)
const sumBy = (list = [], selector) => list.reduce((sum, item, index) => sum + Number(selector(item, index) || 0), 0)
const avgBy = (list = [], selector) => average(list.map((item, index) => selector(item, index)))
const countBy = (list = [], predicate) => list.filter(predicate).length
const formatCurrency = (value) => `¥${Math.round(Number(value || 0)).toLocaleString('en-US')}`
const formatNumber = (value) => Math.round(Number(value || 0)).toLocaleString('en-US')
const byNumericDesc = (selector) => (left, right) => Number(selector(right) || 0) - Number(selector(left) || 0)

const getUserCommerceMap = (contentStore = readContentStore()) =>
  contentStore.userCommerce && typeof contentStore.userCommerce === 'object' ? contentStore.userCommerce : {}

const pushAnalyticsEvent = (store, event) => {
  store.analyticsEvents = Array.isArray(store.analyticsEvents) ? store.analyticsEvents : []
  store.analyticsEvents.unshift({
    id: createId('event'),
    createdAt: iso(),
    ...event,
  })
  store.analyticsEvents = store.analyticsEvents.slice(0, 5000)
}

const getMatchedThreadRowsByProfile = (socialStore = readSocialStore()) => {
  const profileMap = new Map((socialStore.profiles || []).map((item) => [item.id, item]))
  const result = {}
  ;(socialStore.pokes || [])
    .filter((item) => item.status === 'matched')
    .forEach((thread) => {
      const sender = profileMap.get(thread.senderId)
      const receiver = profileMap.get(thread.receiverId)
      const rows = [
        {
          profileId: thread.senderId,
          counterpartId: thread.receiverId,
          counterpartName: receiver?.name || thread.receiverId,
          counterpartPhone: receiver?.phone || '',
          updatedAt: new Date(Number(thread.updatedAt) || now()).toISOString(),
          threadId: thread.id,
        },
        {
          profileId: thread.receiverId,
          counterpartId: thread.senderId,
          counterpartName: sender?.name || thread.senderId,
          counterpartPhone: sender?.phone || '',
          updatedAt: new Date(Number(thread.updatedAt) || now()).toISOString(),
          threadId: thread.id,
        },
      ]
      rows.forEach((row) => {
        if (!result[row.profileId]) {
          result[row.profileId] = []
        }
        result[row.profileId].push(row)
      })
    })
  Object.values(result).forEach((rows) => rows.sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt))))
  return result
}

const isVisibleUserProfile = (profile = {}) =>
  Boolean(
    String(profile.name || '').trim() ||
      String(profile.phone || '').trim(),
  )

const buildUserProfileItems = (adminStore = readStore(), contentStore = readContentStore(), socialStore = readSocialStore()) =>
  socialStore.profiles.filter(isVisibleUserProfile).map((profile) => {
    const meta = adminStore.userOps.find((item) => item.id === profile.id) || { status: '', tags: [], note: '' }
    const commerce = getUserCommerceMap(contentStore)[profile.id] || {}
    const matchedThreads = getMatchedThreadRowsByProfile(socialStore)[profile.id] || []
    return {
      id: profile.id,
      name: profile.name,
      avatarUrl: profile.avatarUrl || '',
      identityTag: profile.identityTag,
      phone: profile.phone || '',
      wechatOpenId: profile.wechatOpenId || '',
      loginCount: Number(profile.loginCount) || 0,
      lastLoginAt: profile.lastLoginAt || '',
      status: meta.status,
      tagsText: Array.isArray(meta.tags) ? meta.tags.join(',') : '',
      note: meta.note || '',
      points: Number(commerce.points) || 0,
      matchedThreadCount: matchedThreads.length,
      matchedThreadsText: matchedThreads.length ? `${matchedThreads.length} matched` : '',
      matchedThreadsRows: matchedThreads,
    }
  })

const buildUserPointsItems = (contentStore = readContentStore(), socialStore = readSocialStore()) =>
  socialStore.profiles
    .filter(isVisibleUserProfile)
    .map((profile) => {
      const state = getUserCommerceMap(contentStore)[profile.id] || {}
      return {
        id: profile.id,
        name: profile.name,
        phone: profile.phone || '',
        wechatOpenId: profile.wechatOpenId || '',
        points: Number(state.points) || 0,
        claimedTaskCount: Array.isArray(state.claimedTaskIds) ? state.claimedTaskIds.length : 0,
        ledgerCount: Array.isArray(state.pointsLedger) ? state.pointsLedger.length : 0,
        adjustment: 0,
        adjustReason: '',
      }
    })
    .sort((left, right) => Number(right.points) - Number(left.points))

const buildPointsLedgerRows = (contentStore = readContentStore(), socialStore = readSocialStore()) => {
  const profileMap = new Map((socialStore.profiles || []).map((item) => [item.id, item]))
  return Object.entries(getUserCommerceMap(contentStore))
    .flatMap(([profileId, state]) =>
      (Array.isArray(state?.pointsLedger) ? state.pointsLedger : []).map((entry) => ({
        id: entry.id,
        profileId,
        userName: profileMap.get(profileId)?.name || profileId,
        phone: profileMap.get(profileId)?.phone || '',
        wechatOpenId: profileMap.get(profileId)?.wechatOpenId || '',
        title: entry.title || '',
        delta: Number(entry.delta) || 0,
        kind: entry.kind || '',
        createdAt: entry.createdAt || '',
      })),
    )
    .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))
}

const buildUserLoginLogRows = (socialStore = readSocialStore()) => {
  const profileMap = new Map((socialStore.profiles || []).map((item) => [item.id, item]))
  return (socialStore.loginLogs || [])
    .map((entry) => ({
      id: entry.id,
      userName: profileMap.get(entry.profileId)?.name || entry.profileId,
      phone: entry.phone || profileMap.get(entry.profileId)?.phone || '',
      wechatOpenId: entry.wechatOpenId || profileMap.get(entry.profileId)?.wechatOpenId || '',
      loginAt: entry.loginAt || '',
      source: entry.source || '',
    }))
    .sort((left, right) => String(right.loginAt).localeCompare(String(left.loginAt)))
}

const getOperationLogType = (entry = {}) => {
  const explicitType = String(entry.logType || entry.type || '').trim()
  if (explicitType) {
    return explicitType
  }
  const text = `${entry.action || ''} ${entry.targetId || ''} ${entry.targetName || ''} ${entry.detail || ''}`
  if (text.includes('精彩瞬间举报')) return '瞬间举报'
  if (text.includes('精彩瞬间')) return '瞬间审核'
  if (text.includes('分享图')) return '分享图任务'
  if (text.includes('榜单奖励')) return '榜单奖励'
  if (text.includes('积分')) return '积分调整'
  return '后台操作'
}

const buildAdminOperationLogRows = (adminStore = readStore()) =>
  (adminStore.operationLogs || [])
    .map((entry) => ({
      id: entry.id,
      logType: getOperationLogType(entry),
      operator: entry.operator || '',
      action: entry.action || '',
      targetId: entry.targetId || '',
      targetName: entry.targetName || '',
      targetPhone: entry.targetPhone || '',
      targetOpenId: entry.targetOpenId || '',
      detail: entry.detail || '',
      createdAt: entry.createdAt || '',
    }))
    .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))

const readMomentsAdminStore = () => {
  try {
    return require('./moments').readMomentsStore()
  } catch (error) {
    return null
  }
}

const writeMomentsAdminStore = (momentsStore) => {
  try {
    require('./moments').writeMomentsStore(momentsStore)
  } catch (error) {
    return false
  }
  return true
}

const getSessionNameById = (adminStore = readStore()) => {
  const sessionMap = new Map()
  ;(adminStore.liveSessions || []).forEach((session) => {
    sessionMap.set(String(session.id || '').trim(), String(session.name || session.id || '').trim())
  })
  return sessionMap
}

const buildMomentReviewRows = (adminStore = readStore()) => {
  const momentsStore = readMomentsAdminStore()
  const sourceItems = momentsStore?.momentRecords || adminStore.momentReviewItems || []
  const sessionNameById = getSessionNameById(adminStore)
  const reportCountByMomentId = new Map()
  ;(momentsStore?.momentReports || adminStore.momentReportItems || []).forEach((report) => {
    const momentId = String(report.momentId || '').trim()
    if (!momentId) return
    reportCountByMomentId.set(momentId, (reportCountByMomentId.get(momentId) || 0) + 1)
  })
  return sourceItems
    .map((entry) => ({
      id: entry.id || entry.momentId || '',
      thumbnailUrl: entry.thumbnailUrl || entry.imageUrl || entry.coverImageUrl || '',
      caption: entry.caption || '',
      tagsText: Array.isArray(entry.tags) ? entry.tags.join('、') : entry.tagsText || '',
      sessionName: entry.sessionName || sessionNameById.get(String(entry.sessionId || '').trim()) || entry.sessionId || '',
      uploaderName: entry.uploaderName || entry.uploaderProfileId || '',
      nodeType: entry.nodeType || '',
      visibility: entry.visibility || '',
      consentText: entry.consentText || Object.entries(entry.usageConsent || {}).filter(([, value]) => value).map(([key]) => key).join(', '),
      completionStatus: entry.completionStatus || '',
      reviewStatus: entry.reviewStatus || '',
      secondaryReviewStatus: entry.secondaryReviewStatus || '',
      rankingEligible: entry.rankingEligible ? '是' : '否',
      rewardEligible: entry.rewardEligible ? '是' : '否',
      reportCount: Number(entry.reportCount) || reportCountByMomentId.get(entry.id) || 0,
      createdAt: entry.createdAt || '',
    }))
    .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))
}

const buildMomentReportRows = (adminStore = readStore()) => {
  const momentsStore = readMomentsAdminStore()
  const sourceItems = momentsStore?.momentReports || adminStore.momentReportItems || []
  const momentMap = new Map((momentsStore?.momentRecords || []).map((moment) => [String(moment.id || '').trim(), moment]))
  const sessionNameById = getSessionNameById(adminStore)
  return sourceItems
    .map((entry) => ({
      id: entry.id || '',
      momentId: entry.momentId || '',
      sessionName: entry.sessionName || sessionNameById.get(String(entry.sessionId || momentMap.get(entry.momentId)?.sessionId || '').trim()) || entry.sessionId || '',
      reporterName: entry.reporterName || entry.reporterProfileId || '',
      uploaderName: entry.uploaderName || momentMap.get(entry.momentId)?.uploaderName || entry.uploaderProfileId || '',
      reason: entry.reason || '',
      note: entry.note || '',
      status: entry.status || '',
      statusText: entry.statusText || entry.status || '',
      handler: entry.handler || '',
      handledAt: entry.handledAt || '',
      createdAt: entry.createdAt || '',
    }))
    .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))
}

const buildShareImageTaskRows = (adminStore = readStore()) => {
  const momentsStore = readMomentsAdminStore()
  const sourceItems = momentsStore?.shareImageTasks || adminStore.shareImageTasks || []
  const sessionNameById = getSessionNameById(adminStore)
  return sourceItems
    .map((entry) => ({
      id: entry.id || '',
      sessionName: entry.sessionName || sessionNameById.get(String(entry.sessionId || '').trim()) || entry.sessionId || '',
      briefId: entry.briefId || '',
      status: entry.status || '',
      layoutMode: entry.layoutMode || '',
      selectedNodeCount: Number(entry.selectedNodeCount || (Array.isArray(entry.selectedNodeIds) ? entry.selectedNodeIds.length : 0)) || 0,
      durationMs: Number(entry.durationMs) || 0,
      retryCount: Number(entry.retryCount) || 0,
      failedReason: entry.failedReason || '',
      imageUrl: entry.imageUrl || '',
      createdAt: entry.createdAt || '',
      finishedAt: entry.finishedAt || '',
    }))
    .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))
}

const buildSessionRelationSummary = (adminStore = readStore()) => {
  const momentsStore = readMomentsAdminStore()
  const reportBySessionId = new Map()
  ;(adminStore.reports || []).forEach((report) => {
    const sessionId = String(report.sessionId || '').trim()
    if (!sessionId || reportBySessionId.has(sessionId)) return
    reportBySessionId.set(sessionId, report)
  })

  const briefBySessionId = new Map()
  ;(momentsStore?.sessionBriefs || []).forEach((brief) => {
    const sessionId = String(brief.sessionId || '').trim()
    if (!sessionId) return
    const current = briefBySessionId.get(sessionId)
    if (!current || String(brief.updatedAt || brief.createdAt || '').localeCompare(String(current.updatedAt || current.createdAt || '')) > 0) {
      briefBySessionId.set(sessionId, brief)
    }
  })

  const shareTasksBySessionId = new Map()
  ;(momentsStore?.shareImageTasks || adminStore.shareImageTasks || []).forEach((task) => {
    const sessionId = String(task.sessionId || '').trim()
    if (!sessionId) return
    if (!shareTasksBySessionId.has(sessionId)) {
      shareTasksBySessionId.set(sessionId, [])
    }
    shareTasksBySessionId.get(sessionId).push(task)
  })

  return (sessionId = '') => {
    const normalizedSessionId = String(sessionId || '').trim()
    const report = reportBySessionId.get(normalizedSessionId) || null
    const brief = briefBySessionId.get(normalizedSessionId) || null
    const shareTasks = (shareTasksBySessionId.get(normalizedSessionId) || []).sort((left, right) =>
      String(right.updatedAt || right.createdAt || '').localeCompare(String(left.updatedAt || left.createdAt || '')),
    )
    const latestShareTask = shareTasks[0] || null
    return {
      reportId: report?.id || '',
      reportStatus: report?.status || '',
      briefId: brief?.id || '',
      briefStatus: brief?.shareImageStatus || (brief ? '已生成简报' : ''),
      shareTaskId: latestShareTask?.id || '',
      shareTaskStatus: latestShareTask?.status || '',
      shareTaskCount: shareTasks.length,
      manageLinks: [
        report?.id ? `战报:${report.id}` : '',
        brief?.id ? `简报:${brief.id}` : '',
        latestShareTask?.id ? `分享图:${latestShareTask.id}` : '',
      ].filter(Boolean).join(' | '),
    }
  }
}

const appendAdminOperationLog = (adminStore, log = {}) => {
  adminStore.operationLogs = Array.isArray(adminStore.operationLogs) ? adminStore.operationLogs : []
  adminStore.operationLogs.unshift({
    id: createId('admin-op'),
    operator: log.operator || 'admin-console',
    action: log.action || '后台操作',
    targetId: log.targetId || '',
    targetName: log.targetName || '',
    targetPhone: log.targetPhone || '',
    targetOpenId: log.targetOpenId || '',
    detail: log.detail || '',
    createdAt: iso(),
  })
}

const trackAnalyticsEvent = ({ type, profileId = '', reportId = '', assetId = '', planId = '', toolId = '', slotId = '', merchantId = '', campaignId = '', meta = {} }) => {
  const store = readStore()
  const normalizedReportId =
    String(reportId || '').trim() ||
    (meta && typeof meta === 'object' && meta.sessionId
      ? String(
          (store.reports || []).find((item) => String(item.sessionId || '') === String(meta.sessionId))?.id || '',
        ).trim()
      : '')
  pushAnalyticsEvent(store, {
    type: String(type || '').trim(),
    profileId: String(profileId || '').trim(),
    reportId: normalizedReportId,
    assetId: String(assetId || '').trim(),
    planId: String(planId || '').trim(),
    toolId: String(toolId || '').trim(),
    slotId: String(slotId || '').trim(),
    merchantId: String(merchantId || '').trim(),
    campaignId: String(campaignId || '').trim(),
    meta: meta && typeof meta === 'object' ? meta : {},
  })

  if (normalizedReportId && type === 'report_view') {
    store.reports = (store.reports || []).map((item) =>
      item.id === normalizedReportId ? normalizeReportItem({ ...item, viewCount: Number(item.viewCount) + 1, shareCount: item.shareCount, replayCount: item.replayCount }) : item,
    )
  }
  if (normalizedReportId && type === 'report_share') {
    store.reports = (store.reports || []).map((item) =>
      item.id === normalizedReportId ? normalizeReportItem({ ...item, shareCount: Number(item.shareCount) + 1, viewCount: item.viewCount, replayCount: item.replayCount }) : item,
    )
  }
  if (normalizedReportId && type === 'report_replay') {
    store.reports = (store.reports || []).map((item) =>
      item.id === normalizedReportId ? normalizeReportItem({ ...item, replayCount: Number(item.replayCount) + 1, viewCount: item.viewCount, shareCount: item.shareCount }) : item,
    )
  }
  if (assetId && type === 'share_asset_exposure') {
    store.shareAssets = (store.shareAssets || []).map((item) =>
      item.id === assetId ? normalizeShareAsset({ ...item, exposureCount: Number(item.exposureCount) + 1, openCount: item.openCount, returnCount: item.returnCount }) : item,
    )
  }
  if (assetId && type === 'share_asset_open') {
    store.shareAssets = (store.shareAssets || []).map((item) =>
      item.id === assetId ? normalizeShareAsset({ ...item, openCount: Number(item.openCount) + 1, exposureCount: item.exposureCount, returnCount: item.returnCount }) : item,
    )
  }
  if (assetId && type === 'share_asset_return') {
    store.shareAssets = (store.shareAssets || []).map((item) =>
      item.id === assetId ? normalizeShareAsset({ ...item, returnCount: Number(item.returnCount) + 1, exposureCount: item.exposureCount, openCount: item.openCount }) : item,
    )
  }
  if (toolId && type === 'tool_favorite') {
    store.toolsCatalog = (store.toolsCatalog || []).map((item) =>
      item.id === toolId ? normalizeToolItem({ ...item, favoriteCount: Number(item.favoriteCount) + 1, usageCount: item.usageCount }, 0) : item,
    )
  }
  if (campaignId && type === 'campaign_return') {
    store.campaigns = (store.campaigns || []).map((item) =>
      item.id === campaignId ? normalizeCampaign({ ...item, returnCount: Number(item.returnCount) + 1, participants: item.participants }, 0) : item,
    )
  }
  if (merchantId && type === 'merchant_verify') {
    store.merchants = (store.merchants || []).map((item) =>
      item.id === merchantId ? normalizeMerchant({ ...item, verifiedCount: Number(item.verifiedCount) + 1, claimCount: item.claimCount }, 0) : item,
    )
  }
  if (slotId && type === 'ad_complete') {
    store.adSlots = (store.adSlots || []).map((item) =>
      item.id === slotId ? normalizeAdSlot({ ...item, impressions: Number(item.impressions) + 1, completions: Number(item.completions) + 1, revenueValue: item.revenueValue }, 0) : item,
    )
  }
  if (slotId && type === 'ad_impression') {
    store.adSlots = (store.adSlots || []).map((item) =>
      item.id === slotId ? normalizeAdSlot({ ...item, impressions: Number(item.impressions) + 1, completions: item.completions, revenueValue: item.revenueValue }, 0) : item,
    )
  }
  if (planId && type === 'membership_renewal') {
    store.membershipPlans = (store.membershipPlans || []).map((item) =>
      item.id === planId ? normalizeMembershipPlan({ ...item, renewalCount: Number(item.renewalCount) + 1, purchaseCount: item.purchaseCount, exposureCount: item.exposureCount }, 0) : item,
    )
  }

  writeStore(store)
  return true
}

const buildOverviewTable = (adminStore = readStore(), contentStore = readContentStore()) => {
  const templates = contentStore.templateConfig.templates || []
  const reports = adminStore.reports || []
  const tools = adminStore.toolsCatalog || []
  const shareAssets = adminStore.shareAssets || []
  const adSlots = adminStore.adSlots || []
  const topTool = [...tools].sort(byNumericDesc((item) => item.usageCount))[0]
  const topReport = [...reports].sort(byNumericDesc((item) => numberFromText(item.shareRate)))[0]
  const topTemplate = [...templates].sort(byNumericDesc((item) => item.cost))[0]
  const topAd = [...adSlots].sort(byNumericDesc((item) => numberFromText(item.revenue)))[0]

  return {
    title: '经营总览',
    columns: [
      { key: 'name', label: '对象' },
      { key: 'current', label: '当前规模' },
      { key: 'primary', label: '核心指标' },
      { key: 'secondary', label: '关联转化' },
      { key: 'status', label: '状态' },
    ],
    rows: [
      {
        id: 'overview-template',
        name: topTemplate?.title || '酒局模板',
        current: `${templates.length} 套 / ${contentStore.templateConfig.filters.length} 类`,
        primary: `均价 ${formatNumber(avgBy(templates, (item) => item.cost))} 积分`,
        secondary: `关联战报均分享 ${formatPercent(avgBy(reports, (item) => numberFromText(item.shareRate)))}`,
        status: topTemplate ? '已上架' : '待配置',
      },
      {
        id: 'overview-tool',
        name: topTool?.name || '工具箱',
        current: `${tools.length} 个工具`,
        primary: `累计使用 ${formatNumber(sumBy(tools, (item) => item.usageCount))}`,
        secondary: `平均收藏 ${formatPercent(avgBy(tools, (item) => numberFromText(item.favoriteRate)))}`,
        status: topTool?.status || '待配置',
      },
      {
        id: 'overview-share',
        name: topReport?.name || '战报分享',
        current: `${reports.length} 份战报 / ${shareAssets.length} 套素材`,
        primary: `战报均分享 ${formatPercent(avgBy(reports, (item) => numberFromText(item.shareRate)))}`,
        secondary: `素材均回流 ${formatPercent(avgBy(shareAssets, (item) => numberFromText(item.returnRate)))}`,
        status: topReport?.status || '待生成',
      },
      {
        id: 'overview-ad',
        name: topAd?.name || '广告位',
        current: `${adSlots.length} 个广告位`,
        primary: `累计收入 ${formatCurrency(sumBy(adSlots, (item) => numberFromText(item.revenue)))}`,
        secondary: `平均完成 ${formatPercent(avgBy(adSlots, (item) => numberFromText(item.completionRate)))}`,
        status: topAd?.status || '待配置',
      },
    ],
  }
}

const buildOverviewNotes = (adminStore = readStore()) => {
  const waitingSessions = countBy(adminStore.liveSessions, (item) => String(item.state || '').includes('等待'))
  const grayMerchants = countBy(adminStore.merchants, (item) => String(item.status || '').includes('灰'))
  return [
    '合规页当前只有“合规提示文案”真实联动前台，敏感词与审核队列仅作后台留档。',
    waitingSessions ? `等待开局酒局 ${waitingSessions} 个，建议关注是否存在拉人卡点。` : '当前没有长时间等待开局的酒局。',
    isMySQLEnabled() ? '核心用户资产、酒局、战报与埋点已走 MySQL 持久化。' : '当前未启用 MySQL，核心数据仅保存在本地文件。',
    grayMerchants ? `灰度商户 ${grayMerchants} 个，建议继续观察核销与回流表现。` : '商户合作当前没有灰度试运行项。',
  ]
}

const overviewMetrics = () => {
  const adminStore = readStore()
  const contentStore = readContentStore()
  const socialStore = readSocialStore()
  const activeSessions = countBy(adminStore.liveSessions, (item) => String(item.state || '').includes('进行中'))
  const complianceCopyLength = String(getCompliance().copy || '').length
  return [
    { label: '酒局总数', value: String(adminStore.liveSessions.length), trend: `进行中 ${activeSessions}`, tone: 'up' },
    { label: '战报分享率', value: formatPercent(avgBy(adminStore.reports, (item) => numberFromText(item.shareRate))), trend: `战报 ${adminStore.reports.length} 份`, tone: 'up' },
    { label: '积分资产池', value: formatNumber(sumBy(contentStore.pointsConfig.rewards, (item) => item.cost)), trend: `任务 ${contentStore.pointsConfig.tasks.length} 个`, tone: 'up' },
    { label: '广告完成率', value: formatPercent(avgBy(adminStore.adSlots, (item) => numberFromText(item.completionRate))), trend: `广告位 ${adminStore.adSlots.length} 个`, tone: 'up' },
    { label: '用户总数', value: String(socialStore.profiles.length), trend: `酒友关系 ${listFriendships().length} 条`, tone: 'up' },
    { label: '合规前台联动', value: '1 项', trend: `提示文案 ${complianceCopyLength} 字，审核队列暂未联动`, tone: 'up' },
  ]
}

const getTemplateMetrics = () => {
  const templateConfig = getTemplateConfig()
  const templates = templateConfig.templates || []
  const filters = templateConfig.filters || []
  const paidCount = countBy(templates, (item) => Number(item.cost) > 0)
  return [
    { label: '上架模板', value: String(templates.length), trend: `可见分类 ${filters.length}`, tone: 'up' },
    { label: '模板分类', value: String(filters.length), trend: `平均 ${formatNumber(templates.length / Math.max(filters.length, 1))} 套/类`, tone: 'up' },
    { label: '付费模板占比', value: ratioPercent(paidCount, templates.length), trend: `付费模板 ${paidCount} 套`, tone: 'up' },
    { label: '平均解锁成本', value: `${formatNumber(avgBy(templates, (item) => item.cost))} 积分`, trend: `最高 ${formatNumber(Math.max(...templates.map((item) => Number(item.cost) || 0), 0))} 积分`, tone: 'up' },
  ]
}

const getQuestionBankMetrics = () => {
  const store = readStore()
  const lowRiskCount = countBy(store.questionBank, (item) => String(item.riskLevel || '').includes('低'))
  const onlineCount = countBy(store.questionBank, (item) => String(item.status || '').includes('上线'))
  return [
    { label: '题目总数', value: String(store.questionBank.length), trend: `已上线 ${onlineCount} 条`, tone: 'up' },
    { label: '待审核', value: String(countBy(store.questionBank, (item) => String(item.status || '').includes('待审核'))), trend: `风控中 ${store.questionBank.length - onlineCount} 条`, tone: 'down' },
    { label: '低风险占比', value: ratioPercent(lowRiskCount, store.questionBank.length), trend: `低风险 ${lowRiskCount} 条`, tone: 'up' },
    { label: '模板覆盖数', value: String(new Set(store.questionBank.map((item) => item.template).filter(Boolean)).size), trend: `类型 ${new Set(store.questionBank.map((item) => item.type).filter(Boolean)).size} 种`, tone: 'up' },
  ]
}

const getShareAssetMetrics = () => {
  const store = readStore()
  const groupAssets = countBy(store.shareAssets, (item) => String(item.scene || '').includes('群'))
  return [
    { label: '上线素材', value: String(store.shareAssets.length), trend: `上线中 ${countBy(store.shareAssets, (item) => String(item.status || '').includes('上线'))} 套`, tone: 'up' },
    { label: '平均打开率', value: formatPercent(avgBy(store.shareAssets, (item) => numberFromText(item.openRate))), trend: `最高 ${formatPercent(Math.max(...store.shareAssets.map((item) => numberFromText(item.openRate)), 0))}`, tone: 'up' },
    { label: '平均回流率', value: formatPercent(avgBy(store.shareAssets, (item) => numberFromText(item.returnRate))), trend: `最高 ${formatPercent(Math.max(...store.shareAssets.map((item) => numberFromText(item.returnRate)), 0))}`, tone: 'up' },
    { label: '群邀请素材', value: String(groupAssets), trend: `占比 ${ratioPercent(groupAssets, store.shareAssets.length)}`, tone: 'up' },
  ]
}

const getToolOpsMetrics = () => {
  const store = readStore()
  const history = getToolHistory()
  return [
    { label: '启用工具', value: String(countBy(store.toolsCatalog, (item) => !String(item.status || '').includes('停用'))), trend: `总工具 ${store.toolsCatalog.length} 个`, tone: 'up' },
    { label: '最近使用记录', value: String(history.length), trend: `最近工具 ${history[0]?.name || '暂无'}`, tone: 'up' },
    { label: '累计使用量', value: formatNumber(sumBy(store.toolsCatalog, (item) => item.usageCount)), trend: `最高 ${formatNumber(Math.max(...store.toolsCatalog.map((item) => Number(item.usageCount) || 0), 0))}`, tone: 'up' },
    { label: '平均收藏率', value: formatPercent(avgBy(store.toolsCatalog, (item) => numberFromText(item.favoriteRate))), trend: `分类 ${new Set(store.toolsCatalog.map((item) => item.category).filter(Boolean)).size} 个`, tone: 'up' },
  ]
}

const getSocialMetrics = () => {
  const pokes = listAllPokes()
  const matchedCount = countBy(pokes, (item) => item.status === 'matched')
  const pendingCount = countBy(pokes, (item) => item.status === 'pending')
  return [
    { label: '酒友关系', value: String(listFriendships().length), trend: `涉及用户 ${new Set(listFriendships().map((item) => item.profileId)).size} 人`, tone: 'up' },
    { label: '拍一拍线程', value: String(pokes.length), trend: `待回应 ${pendingCount} 条`, tone: 'up' },
    { label: '已匹配线程', value: String(matchedCount), trend: `匹配率 ${ratioPercent(matchedCount, pokes.length)}`, tone: 'up' },
    { label: '待处理互动', value: String(pendingCount), trend: pendingCount ? '需及时跟进' : '当前无积压', tone: pendingCount ? 'down' : 'up' },
  ]
}

const getSessionMetrics = () => {
  const store = readStore()
  const activeCount = countBy(store.liveSessions, (item) => String(item.state || '').includes('进行中'))
  const waitingCount = countBy(store.liveSessions, (item) => String(item.state || '').includes('等待'))
  return [
    { label: '聚会总数', value: String(store.liveSessions.length), trend: `等待 ${waitingCount} 个`, tone: 'up' },
    { label: '进行中', value: String(activeCount), trend: `已结束 ${countBy(store.liveSessions, (item) => String(item.state || '').includes('结束'))} 个`, tone: 'up' },
    { label: '异常聚会', value: String(countBy(store.liveSessions, (item) => String(item.status || '').includes('异常'))), trend: `待观察 ${countBy(store.liveSessions, (item) => String(item.status || '').includes('观察'))} 个`, tone: 'down' },
    { label: '战报覆盖率', value: ratioPercent(store.reports.length, store.liveSessions.length), trend: `战报 ${store.reports.length} 份`, tone: 'up' },
  ]
}

const getReportMetrics = () => {
  const store = readStore()
  return [
    { label: '战报数', value: String(store.reports.length), trend: `爆发 ${countBy(store.reports, (item) => String(item.status || '').includes('爆'))} 份`, tone: 'up' },
    { label: '平均分享率', value: formatPercent(avgBy(store.reports, (item) => numberFromText(item.shareRate))), trend: `最高 ${formatPercent(Math.max(...store.reports.map((item) => numberFromText(item.shareRate)), 0))}`, tone: 'up' },
    { label: '平均再开率', value: formatPercent(avgBy(store.reports, (item) => numberFromText(item.replayRate))), trend: `最高 ${formatPercent(Math.max(...store.reports.map((item) => numberFromText(item.replayRate)), 0))}`, tone: 'up' },
    { label: '高传播战报', value: String(countBy(store.reports, (item) => numberFromText(item.shareRate) >= 40)), trend: `占比 ${ratioPercent(countBy(store.reports, (item) => numberFromText(item.shareRate) >= 40), store.reports.length)}`, tone: 'up' },
  ]
}

const getPointsMetrics = () => {
  const pointsConfig = getPointsConfig()
  const contentStore = readContentStore()
  const commerce = contentStore.commerce || {}
  return [
    { label: '当前用户积分', value: formatNumber(contentStore.profile.points), trend: `已领取任务 ${formatNumber((commerce.claimedTaskIds || []).length)} 个`, tone: 'up' },
    { label: '任务数', value: String(pointsConfig.tasks.length), trend: `合计发放 ${formatNumber(sumBy(pointsConfig.tasks, (item) => item.value))} 分`, tone: 'up' },
    { label: '已兑换商品', value: formatNumber((commerce.rewardRedemptions || []).length), trend: `商品池 ${formatNumber(pointsConfig.rewards.length)} 个`, tone: 'up' },
    { label: '积分净变动', value: formatNumber(sumBy(commerce.pointsLedger || [], (item) => item.delta)), trend: `流水 ${formatNumber((commerce.pointsLedger || []).length)} 条`, tone: 'up' },
  ]
}

const getManagedPointsMetrics = () => {
  const pointsConfig = getPointsConfig()
  const contentStore = readContentStore()
  const userPoints = buildUserPointsItems(contentStore, readSocialStore())
  const totalPoints = sumBy(userPoints, (item) => item.points)
  const totalLedger = sumBy(userPoints, (item) => item.ledgerCount)
  return [
    { label: '积分用户', value: formatNumber(userPoints.length), trend: `OpenID 用户 ${formatNumber(countBy(userPoints, (item) => Boolean(item.wechatOpenId)))} 个`, tone: 'up' },
    { label: '任务数', value: String(pointsConfig.tasks.length), trend: `合计发放 ${formatNumber(sumBy(pointsConfig.tasks, (item) => item.value))} 积分`, tone: 'up' },
    { label: '用户积分总额', value: formatNumber(totalPoints), trend: `商品池 ${formatNumber(pointsConfig.rewards.length)} 个`, tone: 'up' },
    { label: '积分流水总数', value: formatNumber(totalLedger), trend: `人均 ${formatNumber(userPoints.length ? totalLedger / userPoints.length : 0)} 条`, tone: 'up' },
  ]
}

const getMembershipMetrics = () => {
  const store = readStore()
  const contentStore = readContentStore()
  const commerce = contentStore.commerce || {}
  return [
    { label: '套餐数', value: String(store.membershipPlans.length), trend: `权益 ${store.membershipBenefits.length} 项`, tone: 'up' },
    { label: '当前开通状态', value: commerce.membership?.active ? '已开通' : '未开通', trend: commerce.membership?.planId || '当前用户会员态', tone: 'up' },
    { label: '累计开通', value: formatNumber((commerce.membershipOrders || []).length), trend: `最近方案 ${commerce.membership?.planId || '--'}`, tone: 'up' },
    { label: '平均续费率', value: formatPercent(avgBy(store.membershipPlans, (item) => numberFromText(item.renewRate))), trend: `最高 ${formatPercent(Math.max(...store.membershipPlans.map((item) => numberFromText(item.renewRate)), 0))}`, tone: 'up' },
  ]
}

const getAdsMetrics = () => {
  const store = readStore()
  return [
    { label: '广告位数', value: String(store.adSlots.length), trend: `启用 ${countBy(store.adSlots, (item) => String(item.status || '').includes('启用'))} 个`, tone: 'up' },
    { label: '平均完成率', value: formatPercent(avgBy(store.adSlots, (item) => numberFromText(item.completionRate))), trend: `最高 ${formatPercent(Math.max(...store.adSlots.map((item) => numberFromText(item.completionRate)), 0))}`, tone: 'up' },
    { label: '广告收入', value: formatCurrency(sumBy(store.adSlots, (item) => numberFromText(item.revenue))), trend: `单槽最高 ${formatCurrency(Math.max(...store.adSlots.map((item) => numberFromText(item.revenue)), 0))}`, tone: 'up' },
    { label: 'Banner 占比', value: ratioPercent(countBy(store.adSlots, (item) => String(item.adType || '').toLowerCase().includes('banner')), store.adSlots.length), trend: `激励视频 ${countBy(store.adSlots, (item) => String(item.adType || '').includes('视频'))} 个`, tone: 'up' },
  ]
}

const getMerchantMetrics = () => {
  const store = readStore()
  return [
    { label: '合作商户', value: String(store.merchants.length), trend: `上线中 ${countBy(store.merchants, (item) => String(item.status || '').includes('上线'))} 个`, tone: 'up' },
    { label: '累计领取', value: formatNumber(sumBy(store.merchants, (item) => numberFromText(item.claimCount))), trend: `最高 ${formatNumber(Math.max(...store.merchants.map((item) => numberFromText(item.claimCount)), 0))}`, tone: 'up' },
    { label: '平均核销率', value: formatPercent(avgBy(store.merchants, (item) => numberFromText(item.verifyRate))), trend: `最高 ${formatPercent(Math.max(...store.merchants.map((item) => numberFromText(item.verifyRate)), 0))}`, tone: 'up' },
    { label: '灰度商户', value: String(countBy(store.merchants, (item) => String(item.status || '').includes('灰'))), trend: `品类 ${new Set(store.merchants.map((item) => item.category).filter(Boolean)).size} 个`, tone: 'up' },
  ]
}

const getCampaignMetrics = () => {
  const store = readStore()
  return [
    { label: '活动数', value: String(store.campaigns.length), trend: `进行中 ${countBy(store.campaigns, (item) => String(item.status || '').includes('进行'))} 个`, tone: 'up' },
    { label: '累计参与', value: formatNumber(sumBy(store.campaigns, (item) => numberFromText(item.participants))), trend: `单活动最高 ${formatNumber(Math.max(...store.campaigns.map((item) => numberFromText(item.participants)), 0))}`, tone: 'up' },
    { label: '平均回流率', value: formatPercent(avgBy(store.campaigns, (item) => numberFromText(item.returnRate))), trend: `最高 ${formatPercent(Math.max(...store.campaigns.map((item) => numberFromText(item.returnRate)), 0))}`, tone: 'up' },
    { label: '灰度活动', value: String(countBy(store.campaigns, (item) => String(item.status || '').includes('灰'))), trend: `奖励方案 ${new Set(store.campaigns.map((item) => item.reward).filter(Boolean)).size} 种`, tone: 'up' },
  ]
}

const getUserAnalyticsPage = () => {
  const adminStore = readStore()
  const contentStore = readContentStore()
  const socialStore = readSocialStore()
  const profiles = buildUserProfileItems(adminStore, contentStore, socialStore)
  const friendships = listFriendships()
  const highValueCount = countBy(profiles, (item) => String(item.status || '').includes('高价值'))
  const highActiveCount = countBy(profiles, (item) => String(item.status || '').includes('高活跃'))
  return {
    metrics: [
      { label: '用户总数', value: String(profiles.length), trend: `高价值 ${highValueCount} 人`, tone: 'up' },
      { label: '高活跃用户', value: String(highActiveCount), trend: `占比 ${ratioPercent(highActiveCount, profiles.length)}`, tone: 'up' },
      { label: '酒友关系数', value: String(friendships.length), trend: `人均 ${profiles.length ? (friendships.length / profiles.length).toFixed(1) : '0'} 条`, tone: 'up' },
      { label: '工具标签用户', value: String(countBy(profiles, (item) => String(item.tagsText || '').includes('工具'))), trend: '可导流酒局', tone: 'up' },
    ],
    table: {
      title: '用户运营明细',
      columns: [
        { key: 'name', label: '用户' },
        { key: 'status', label: '运营状态' },
        { key: 'tagsText', label: '标签' },
        { key: 'note', label: '备注' },
      ],
      rows: profiles.slice(0, 8),
    },
    notes: [
      `高价值用户 ${highValueCount} 人，高活跃用户 ${highActiveCount} 人。`,
      friendships.length ? `当前已形成 ${friendships.length} 条酒友关系，可继续追踪组局转化。` : '当前还没有形成酒友关系沉淀。',
    ],
  }
}

const getContentAnalyticsPage = () => {
  const adminStore = readStore()
  const contentStore = readContentStore()
  const templateRows = contentStore.templateConfig.templates.map((item) => ({
    id: `template-${item.id}`,
    name: item.title,
    type: '模板',
    primary: `${Number(item.cost) || 0} 积分`,
    secondary: adminStore.reports.find((report) => report.template === item.title)?.shareRate || '--',
    status: '已上架',
    sortValue: Number(item.cost) || 0,
  }))
  const toolRows = adminStore.toolsCatalog.map((item) => ({
    id: `tool-${item.id}`,
    name: item.name,
    type: '工具',
    primary: formatNumber(item.usageCount),
    secondary: item.favoriteRate || '',
    status: item.status || '',
    sortValue: Number(item.usageCount) || 0,
  }))
  const shareRows = adminStore.shareAssets.map((item) => ({
    id: `share-${item.id}`,
    name: item.name,
    type: '素材',
    primary: item.openRate || '',
    secondary: item.returnRate || '',
    status: item.status || '',
    sortValue: numberFromText(item.openRate),
  }))
  const rows = [...toolRows, ...shareRows, ...templateRows]
    .sort(byNumericDesc((item) => item.sortValue))
    .slice(0, 8)
    .map(({ sortValue, ...item }) => item)

  return {
    metrics: [
      { label: '模板数', value: String(contentStore.templateConfig.templates.length), trend: `分类 ${contentStore.templateConfig.filters.length} 个`, tone: 'up' },
      { label: '工具总使用', value: formatNumber(sumBy(adminStore.toolsCatalog, (item) => item.usageCount)), trend: `工具 ${adminStore.toolsCatalog.length} 个`, tone: 'up' },
      { label: '素材平均打开', value: formatPercent(avgBy(adminStore.shareAssets, (item) => numberFromText(item.openRate))), trend: `回流均值 ${formatPercent(avgBy(adminStore.shareAssets, (item) => numberFromText(item.returnRate)))}`, tone: 'up' },
      { label: '平均模板成本', value: `${formatNumber(avgBy(contentStore.templateConfig.templates, (item) => item.cost))} 积分`, trend: `最高 ${formatNumber(Math.max(...contentStore.templateConfig.templates.map((item) => Number(item.cost) || 0), 0))} 积分`, tone: 'up' },
    ],
    table: {
      title: '内容表现明细',
      columns: [
        { key: 'name', label: '内容对象' },
        { key: 'type', label: '类型' },
        { key: 'primary', label: '核心值' },
        { key: 'secondary', label: '传播/回流' },
        { key: 'status', label: '状态' },
      ],
      rows,
    },
    notes: [`当前内容池包含模板 ${contentStore.templateConfig.templates.length} 套、分享素材 ${adminStore.shareAssets.length} 套、工具 ${adminStore.toolsCatalog.length} 个。`],
  }
}

const getBusinessAnalyticsPage = () => {
  const adminStore = readStore()
  const rows = [
    ...adminStore.membershipPlans.map((item) => ({
      id: `member-${item.id}`,
      name: item.name,
      conversion: item.conversionRate || '',
      amount: item.price || '¥0',
      repurchase: item.renewRate || '',
      status: item.status || '',
      sortValue: numberFromText(item.conversionRate),
    })),
    ...adminStore.adSlots.map((item) => ({
      id: `ad-${item.id}`,
      name: item.name,
      conversion: item.completionRate || '',
      amount: item.revenue || '¥0',
      repurchase: '即时',
      status: item.status || '',
      sortValue: numberFromText(item.revenue),
    })),
    ...adminStore.merchants.map((item) => ({
      id: `merchant-${item.id}`,
      name: item.name,
      conversion: item.verifyRate || '',
      amount: item.claimCount || '0',
      repurchase: item.inventory || '--',
      status: item.status || '',
      sortValue: numberFromText(item.claimCount),
    })),
  ]
    .sort(byNumericDesc((item) => item.sortValue))
    .slice(0, 8)
    .map(({ sortValue, ...item }) => item)

  return {
    metrics: [
      { label: '广告收入', value: formatCurrency(sumBy(adminStore.adSlots, (item) => numberFromText(item.revenue))), trend: `广告位 ${adminStore.adSlots.length} 个`, tone: 'up' },
      { label: '会员平均转化', value: formatPercent(avgBy(adminStore.membershipPlans, (item) => numberFromText(item.conversionRate))), trend: `续费均值 ${formatPercent(avgBy(adminStore.membershipPlans, (item) => numberFromText(item.renewRate)))}`, tone: 'up' },
      { label: '商户平均核销', value: formatPercent(avgBy(adminStore.merchants, (item) => numberFromText(item.verifyRate))), trend: `商户 ${adminStore.merchants.length} 个`, tone: 'up' },
      { label: '活动平均回流', value: formatPercent(avgBy(adminStore.campaigns, (item) => numberFromText(item.returnRate))), trend: `活动 ${adminStore.campaigns.length} 个`, tone: 'up' },
    ],
    table: {
      title: '商业明细',
      columns: [
        { key: 'name', label: '对象' },
        { key: 'conversion', label: '转化/完成' },
        { key: 'amount', label: '收入/规模' },
        { key: 'repurchase', label: '续费/库存' },
        { key: 'status', label: '状态' },
      ],
      rows,
    },
    notes: ['广告、会员、商户、活动全部来自后台当前 store 聚合，不再走样例值。'],
  }
}

const getSystemPermissionMetrics = () => {
  const store = readStore()
  return [
    { label: '管理员账号', value: String(store.adminUsers.length), trend: `启用 ${countBy(store.adminUsers, (item) => item.status === 'active')} 个`, tone: 'up' },
    { label: '角色数', value: String(store.roles.length), trend: '全量角色已加载', tone: 'up' },
    { label: '活跃登录会话', value: String(store.sessions.length), trend: `最近登录 ${store.adminUsers.filter((item) => item.lastLoginAt).length} 人`, tone: 'up' },
    { label: '停用账号', value: String(countBy(store.adminUsers, (item) => item.status !== 'active')), trend: '需要定期复核', tone: 'down' },
  ]
}

const getSystemConfigMetrics = () => {
  const mysqlEnabled = isMySQLEnabled()
  const fileMirrorEnabled = process.env.STORE_FILE_MIRROR !== '0'
  const wechatConfigured = Number(Boolean(process.env.WECHAT_APP_ID)) + Number(Boolean(process.env.WECHAT_APP_SECRET))
  return [
    { label: 'MySQL 存储', value: mysqlEnabled ? '已启用' : '未启用', trend: mysqlEnabled ? '用户资产与酒局主链路写入数据库' : '当前仅文件存储', tone: mysqlEnabled ? 'up' : 'down' },
    { label: '文件镜像', value: fileMirrorEnabled ? '开启' : '关闭', trend: fileMirrorEnabled ? '同时写入本地镜像文件' : '仅保留数据库副本', tone: fileMirrorEnabled ? 'up' : 'down' },
    { label: '微信登录配置', value: `${wechatConfigured}/2`, trend: wechatConfigured === 2 ? 'AppID 与 AppSecret 已注入' : '仍缺少小程序密钥', tone: wechatConfigured === 2 ? 'up' : 'down' },
    { label: '真实运行项', value: '4', trend: '仅保留前后台已实际生效配置', tone: 'up' },
  ]
}

const getComplianceMetrics = () => {
  const complianceCopy = getCompliance().copy || ''
  return [
    { label: '合规文案字数', value: String(String(complianceCopy).length), trend: '前端展示文案来自后台', tone: 'up' },
    { label: '合规文案状态', value: complianceCopy ? '1' : '0', trend: complianceCopy ? '已配置合规提示' : '未配置合规提示', tone: complianceCopy ? 'up' : 'down' },
  ]
}

const makeHomeFormData = () => {
  const config = getHomeConfig()
  const store = readStore()
  const toolsHero = store.toolsHero || {}
  return {
    heroTitle: config.hero.title,
    heroSubtitle: config.hero.subtitle,
    heroImageUrl: config.hero.imageUrl,
    judgeHeroTitle: config.judge?.title || '',
    judgeHeroSubtitle: config.judge?.subtitle || '',
    judgeHeroImageUrl: config.judge?.imageUrl || '',
    toolsHeroTitle: toolsHero.title || '',
    toolsHeroSubtitle: toolsHero.subtitle || '',
    toolsHeroImageUrl: toolsHero.imageUrl || '',
    bannerTitle: config.banner.title,
    bannerImageUrl: config.banner.imageUrl,
    quickToolsText: config.quickTools.map((item) => `${item.id}|${item.name}`).join('\n'),
  }
}

const parseQuickToolsText = (text = '') =>
  String(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [id, name] = line.split('|').map((item) => item.trim())
      return {
        id: id || `tool-${index + 1}`,
        name: name || id || `工具 ${index + 1}`,
      }
    })

const parseStatus = (value, fallback = '') => {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

const parseBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') {
    return value
  }
  const normalized = String(value || '').trim().toLowerCase()
  if (['1', 'true', 'yes', 'on', '开启', '是', '启用'].includes(normalized)) {
    return true
  }
  if (['0', 'false', 'no', 'off', '关闭', '否', '停用'].includes(normalized)) {
    return false
  }
  return fallback
}

const makeInviteCode = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let index = 0; index < 6; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return code
}

const makeUniqueInviteCode = (store) => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = makeInviteCode()
    const existed = (store.liveSessions || []).some((item) => String(item.inviteCode || '').trim().toUpperCase() === code)
    if (!existed) {
      return code
    }
  }
  return crypto.randomBytes(4).toString('hex').slice(0, 6).toUpperCase()
}

const normalizeWheelHistoryItem = (item = {}) => ({
  createdAt: String(item.createdAt || '').trim(),
  label: String(item.label || '').trim(),
  text: String(item.text || '').trim(),
  type: String(item.type || '').trim(),
})

const normalizeSessionMember = (member = {}, index = 0) => ({
  avatarUrl: String(member.avatarUrl || '').trim(),
  clearedCount: Math.max(0, Number(member.clearedCount) || 0),
  debtCount: Math.max(0, Number(member.debtCount) || 0),
  drinkCount: Math.max(0, Number(member.drinkCount) || 0),
  isHost: Boolean(member.isHost),
  meta: String(member.meta || '').trim(),
  name: String(member.name || `玩家${index + 1}`).trim(),
  phone: String(member.phone || '').trim(),
  profileId: String(member.profileId || '').trim(),
  status: String(member.status || '').trim(),
  wheelHistory: Array.isArray(member.wheelHistory)
    ? member.wheelHistory.map((item) => normalizeWheelHistoryItem(item)).filter((item) => item.text)
    : [],
})

const buildSessionMembers = (payload = {}, existingMembers = []) => {
  const hostProfileId = String(payload.hostProfileId || '').trim()
  const hostName = String(payload.hostName || '').trim()
  const hostAvatarUrl = String(payload.hostAvatarUrl || existingMembers.find((item) => item.isHost)?.avatarUrl || '').trim()
  const hostPhone = String(payload.hostPhone || '').trim()
  const selectedPlayers = Array.isArray(payload.selectedPlayers) ? payload.selectedPlayers : []
  const hostPayloadMember =
    (hostProfileId ? selectedPlayers.find((item) => String(item?.profileId || '').trim() === hostProfileId) : null) ||
    selectedPlayers.find((item) => item?.isHost)
  const existingByProfileId = new Map(
    existingMembers
      .filter((item) => item?.profileId)
      .map((item, index) => [String(item.profileId), normalizeSessionMember(item, index)]),
  )
  const members = [
    normalizeSessionMember(
      {
        ...existingMembers.find((item) => item.isHost),
        ...hostPayloadMember,
        avatarUrl: hostAvatarUrl,
        isHost: true,
        name: hostName,
        phone: hostPhone,
        profileId: hostProfileId,
        status: '已加入',
      },
      0,
    ),
  ]

  selectedPlayers.forEach((item, index) => {
    const profileId = String(item.profileId || '').trim()
    if (hostProfileId && profileId === hostProfileId) {
      return
    }
    const existed = profileId ? existingByProfileId.get(profileId) : null
    members.push(
      normalizeSessionMember(
        {
          ...existed,
          ...item,
          avatarUrl: item.avatarUrl || existed?.avatarUrl,
          isHost: false,
          name: item.name || existed?.name,
          phone: item.phone || existed?.phone,
          profileId,
          status: item.status || existed?.status || '',
        },
        index + 1,
      ),
    )
  })

  return members
}

const normalizeLiveSession = (session = {}, index = 0) => {
  const members = Array.isArray(session.members) && session.members.length
    ? session.members.map((item, memberIndex) => normalizeSessionMember(item, memberIndex))
    : buildSessionMembers(
        {
          hostAvatarUrl: session.hostAvatarUrl,
          hostName: session.hostName,
          selectedPlayers: [],
        },
        [],
      )
  const updatedAt = String(session.updatedAt || session.createdAt || '').trim()
  const rawEndedAt = String(session.endedAt || '').trim()
  const hasEndedMarker =
    rawEndedAt ||
    isEndedSessionState(session.state || '') ||
    isEndedSessionState(session.status || '')
  const state = hasEndedMarker ? SESSION_STATE_ENDED : normalizeSessionState(session.state || session.status, SESSION_STATE_LIVE)
  const status = hasEndedMarker ? SESSION_STATE_ENDED : normalizeSessionStatusForState(session.status || session.state, state)
  const endedAt = hasEndedMarker ? String(rawEndedAt || updatedAt || '').trim() : ''

  return {
    ...session,
    endedAt,
    hostProfileId: String(session.hostProfileId || members.find((item) => item.isHost)?.profileId || '').trim(),
    hostAvatarUrl: String(session.hostAvatarUrl || members[0]?.avatarUrl || '').trim(),
    id: String(session.id || createId('session')).trim(),
    inviteCode: String(session.inviteCode || makeInviteCode()).trim() || makeInviteCode(),
    joinedCount: Number(session.joinedCount) || members.filter((item) => item.status === '已加入').length,
    kickedProfileIds: Array.isArray(session.kickedProfileIds)
      ? [...new Set(session.kickedProfileIds.map((item) => String(item || '').trim()).filter(Boolean))]
      : [],
    members,
    state,
    status,
    updatedAt,
  }
}

const getManagedSessionById = (sessionId) => {
  const store = readStore()
  return store.liveSessions.find((item) => item.id === sessionId) || null
}

const getManagedSessionByInviteCode = (inviteCode) => {
  const normalizedInviteCode = String(inviteCode || '').trim().toUpperCase()
  if (!normalizedInviteCode) {
    return null
  }
  const store = readStore()
  return store.liveSessions.find((item) => String(item.inviteCode || '').trim().toUpperCase() === normalizedInviteCode) || null
}

const joinManagedSession = ({ inviteCode, profile }) => {
  const normalizedInviteCode = String(inviteCode || '').trim().toUpperCase()
  const store = readStore()
  const target = store.liveSessions.find((item) => String(item.inviteCode || '').trim().toUpperCase() === normalizedInviteCode)
  if (!target) {
    const error = new Error('session not found')
    error.code = 'SESSION_NOT_FOUND'
    throw error
  }

  const profileId = String(profile?.id || '').trim()
  const members = Array.isArray(target.members) ? target.members : []
  const memberIndex = members.findIndex((item) => item.profileId && item.profileId === profileId)
  if (memberIndex === -1 && members.filter((item) => item.status === '已加入').length >= Math.max(2, Number(target.players) || 0)) {
    const error = new Error('session full')
    error.code = 'SESSION_FULL'
    throw error
  }
  if (memberIndex === -1 && !profileId) {
    const error = new Error('not session player')
    error.code = 'NOT_SESSION_PLAYER'
    throw error
  }

  if (memberIndex === -1) {
    target.members = [
      ...members,
      normalizeSessionMember(
        {
          avatarUrl: profile.avatarUrl || '',
          isHost: false,
          name: profile.name || '',
          phone: profile.phone || '',
          profileId,
          status: '已加入',
        },
        members.length,
      ),
    ]
  } else {
    target.members = members.map((item, index) =>
      index === memberIndex
        ? normalizeSessionMember(
            {
              ...item,
              avatarUrl: profile.avatarUrl || item.avatarUrl,
              name: profile.name || item.name,
              phone: profile.phone || item.phone,
              status: '已加入',
            },
            index,
          )
        : item,
    )
  }
  if (profileId) {
    target.kickedProfileIds = (Array.isArray(target.kickedProfileIds) ? target.kickedProfileIds : []).filter((item) => item !== profileId)
  }
  target.joinedCount = target.members.filter((item) => item.status === '已加入').length
  pushAnalyticsEvent(store, {
    type: 'session_joined',
    profileId,
    meta: {
      sessionId: target.id,
      inviteCode: normalizedInviteCode,
      joinedCount: target.joinedCount,
    },
  })
  writeStore(store)
  return target
}

const kickManagedSessionMember = ({ sessionId, profileId, operatorProfileId }) => {
  const normalizedSessionId = String(sessionId || '').trim()
  const normalizedProfileId = String(profileId || '').trim()
  const normalizedOperatorProfileId = String(operatorProfileId || '').trim()
  if (!normalizedSessionId || !normalizedProfileId) {
    return null
  }
  const store = readStore()
  const session = store.liveSessions.find((item) => String(item.id || '').trim() === normalizedSessionId)
  if (!session) {
    return null
  }
  const members = Array.isArray(session.members) ? session.members : []
  const hostProfileId = String(session.hostProfileId || members.find((item) => item?.isHost)?.profileId || '').trim()
  if (!hostProfileId || hostProfileId !== normalizedOperatorProfileId) {
    const error = new Error('forbidden')
    error.code = 'FORBIDDEN'
    throw error
  }
  if (normalizedProfileId === hostProfileId) {
    const error = new Error('host cannot be kicked')
    error.code = 'HOST_CANNOT_BE_KICKED'
    throw error
  }

  session.members = members.filter((item) => String(item?.profileId || '').trim() !== normalizedProfileId)
  session.kickedProfileIds = [...new Set([...(Array.isArray(session.kickedProfileIds) ? session.kickedProfileIds : []), normalizedProfileId])]
  session.joinedCount = session.members.filter((item) => item.status === '已加入').length
  session.updatedAt = iso()
  pushAnalyticsEvent(store, {
    type: 'session_member_kicked',
    profileId: normalizedOperatorProfileId,
    meta: {
      kickedProfileId: normalizedProfileId,
      sessionId: normalizedSessionId,
    },
  })
  store.liveSessions = store.liveSessions.map((item, index) =>
    item.id === normalizedSessionId ? normalizeLiveSession(session, index) : normalizeLiveSession(item, index),
  )
  writeStore(store)
  return store.liveSessions.find((item) => item.id === normalizedSessionId) || null
}

const createManagedSession = (payload = {}) => {
  const store = readStore()
  const id = createId('session')
  const createdAt = iso()
  const state = normalizeSessionState(payload.state || payload.status, SESSION_STATE_LIVE)
  const status = normalizeSessionStatusForState(payload.status || payload.state, state)
  const session = {
    id,
    createdAt,
    endedAt: isEndedSessionState(state) ? createdAt : '',
    name: String(payload.sessionName || '').trim(),
    players: Number(payload.playerCount) || 0,
    template: String(payload.templateName || '').trim(),
    templateImageUrl: normalizeTemplateImageUrl(payload.templateImageUrl),
    hostName: String(payload.hostName || '').trim(),
    hostProfileId: String(payload.hostProfileId || '').trim(),
    inviteCode: String(payload.inviteCode || makeUniqueInviteCode(store)).trim().toUpperCase() || makeUniqueInviteCode(store),
    hostAvatarUrl: String(payload.hostAvatarUrl || '').trim() || '',
    state,
    source: String(payload.source || '').trim(),
    status,
    updatedAt: createdAt,
    members: buildSessionMembers(payload, []),
  }
  store.liveSessions = [session, ...store.liveSessions.filter((item) => item.id !== id)]
  pushAnalyticsEvent(store, {
    type: 'session_created',
    profileId: String(payload.hostProfileId || '').trim(),
    meta: {
      sessionId: id,
      playerCount: session.players,
      template: session.template,
    },
  })
  writeStore(store)
  return session
}

const updateManagedSession = (sessionId, payload = {}) => {
  const store = readStore()
  const updatedAt = String(payload.updatedAt || payload.endedAt || '').trim() || iso()
  const nextItems = store.liveSessions.map((item) => {
    if (item.id !== sessionId) {
      return item
    }
    const requestedState = Object.prototype.hasOwnProperty.call(payload, 'state') ? payload.state : item.state
    const requestedStatus = Object.prototype.hasOwnProperty.call(payload, 'status') ? payload.status : item.status
    const state = normalizeSessionState(requestedState || requestedStatus, normalizeSessionState(item.state || item.status, SESSION_STATE_LIVE))
    const status = normalizeSessionStatusForState(requestedStatus || requestedState, state)
    const endedAt = isEndedSessionState(state)
      ? String(payload.endedAt || item.endedAt || updatedAt).trim()
      : String(payload.endedAt || item.endedAt || '').trim()
    return {
      ...item,
      name: payload.sessionName || item.name,
      players: Number(payload.playerCount) || item.players,
      template: payload.templateName || item.template,
      templateImageUrl: normalizeTemplateImageUrl(payload.templateImageUrl || item.templateImageUrl),
      hostName: payload.hostName || item.hostName,
      hostProfileId: payload.hostProfileId || item.hostProfileId,
      hostAvatarUrl: payload.hostAvatarUrl || item.hostAvatarUrl,
      inviteCode: payload.inviteCode || item.inviteCode,
      endedAt,
      state,
      source: payload.source || item.source,
      status,
      updatedAt,
      members: Array.isArray(payload.selectedPlayers) || payload.hostProfileId
        ? buildSessionMembers(
            {
              ...payload,
              hostAvatarUrl: payload.hostAvatarUrl || item.hostAvatarUrl,
              hostName: payload.hostName || item.hostName,
            },
            item.members || [],
          )
        : item.members || [],
    }
  })
  store.liveSessions = nextItems.map((item, index) =>
    normalizeLiveSession(
      {
        ...item,
        joinedCount: Array.isArray(item.members) ? item.members.filter((member) => member.status === '已加入').length : Number(item.joinedCount) || 0,
      },
      index,
    ),
  )
  writeStore(store)
  return store.liveSessions.find((item) => item.id === sessionId) || null
}

const endManagedSession = (sessionId, payload = {}) =>
  updateManagedSession(sessionId, {
    ...payload,
    endedAt: String(payload.endedAt || payload.finishedAt || '').trim() || iso(),
    state: SESSION_STATE_ENDED,
    status: SESSION_STATE_ENDED,
  })

const deleteManagedSession = (sessionId) => {
  const normalizedSessionId = String(sessionId || '').trim()
  if (!normalizedSessionId) {
    return false
  }

  const store = readStore()
  const exists = store.liveSessions.some((item) => item.id === normalizedSessionId)
  if (!exists) {
    return false
  }

  const relatedReportIds = new Set(
    store.reports
      .filter((item) => String(item.sessionId || '') === normalizedSessionId)
      .map((item) => String(item.id || '').trim())
      .filter(Boolean),
  )
  store.liveSessions = store.liveSessions.filter((item) => item.id !== normalizedSessionId)
  store.reports = store.reports.filter((item) => String(item.sessionId || '') !== normalizedSessionId)
  store.analyticsEvents = store.analyticsEvents.filter((item) => {
    const eventSessionId = String(item.meta?.sessionId || '')
    const eventReportSessionId = String(item.sessionId || '')
    const eventReportId = String(item.reportId || item.meta?.reportId || '')
    return eventSessionId !== normalizedSessionId && eventReportSessionId !== normalizedSessionId && !relatedReportIds.has(eventReportId)
  })
  writeStore(store)
  return true
}

const finishManagedSession = (payload = {}) => {
  const store = readStore()
  const sessionId = String(payload.sessionId || '').trim()
  const finishedAt = String(payload.endedAt || payload.finishedAt || '').trim() || iso()
  const relatedSession = store.liveSessions.find((item) => item.id === sessionId)
  const sessionName = String(payload.sessionName || relatedSession?.name || '').trim()
  const templateName = String(payload.templateName || relatedSession?.template || '').trim()
  const templateImageUrl = normalizeTemplateImageUrl(payload.templateImageUrl || relatedSession?.templateImageUrl || '')
  const playerCount = Math.max(2, Number(payload.playerCount) || Number(relatedSession?.players) || 6)
  const events = Array.isArray(payload.events) ? payload.events.filter((item) => item && item.text).slice(0, 5) : []
  const sessionMembers = Array.isArray(relatedSession?.members) ? relatedSession.members : []
  const ranks = Array.isArray(payload.ranks)
    ? payload.ranks.slice(0, 5).map((rank) => {
        const profileId = String(rank?.profileId || '').trim()
        const name = String(rank?.name || '').trim()
        const matchedMember = sessionMembers.find(
          (member) =>
            (profileId && String(member?.profileId || '').trim() === profileId) ||
            (name && String(member?.name || '').trim() === name),
        )
        return {
          ...rank,
          avatarUrl: String(rank?.avatarUrl || matchedMember?.avatarUrl || '').trim(),
          profileId,
        }
      })
    : []
  const report = {
    id: createId('report'),
    sessionId,
    name: `${sessionName}战报`,
    template: templateName,
    imageUrl: templateImageUrl,
    title: String(payload.title || '').trim(),
    scene: String(payload.scene || (templateName.includes('生日') ? '生日局' : templateName.includes('夜') ? '夜场' : '常规局')).trim(),
    highlight1: events[0]?.text || `${sessionName} 本局已结束，自动生成战报`,
    highlight2: events[1]?.text || `${playerCount} 位玩家参与了本局`,
    highlight3: events[2]?.text || '',
    viewCount: Math.max(Number(payload.viewCount) || 0, playerCount),
    shareCount: Math.max(0, Number(payload.shareCount) || 0),
    replayCount: Math.max(0, Number(payload.replayCount) || 0),
    createdAt: finishedAt,
    playerCount,
    ranks,
    events,
    status: normalizeSessionStatusForState(payload.status || SESSION_STATE_ENDED, SESSION_STATE_ENDED),
  }

  const normalizedReport = normalizeReportItem(report, 0)
  pushAnalyticsEvent(store, {
    type: 'report_generated',
    reportId: normalizedReport.id,
    meta: {
      sessionId,
      playerCount,
      templateName,
    },
  })
  store.reports = [normalizedReport, ...store.reports]
  if (sessionId) {
    store.liveSessions = store.liveSessions.map((item) =>
      item.id === sessionId
        ? normalizeLiveSession(
            {
              ...item,
              endedAt: String(payload.endedAt || item.endedAt || finishedAt).trim(),
              state: normalizeSessionState(payload.sessionState || SESSION_STATE_ENDED, SESSION_STATE_ENDED),
              status: normalizeSessionStatusForState(payload.sessionStatus || SESSION_STATE_ENDED, SESSION_STATE_ENDED),
              updatedAt: finishedAt,
            },
            0,
          )
        : item,
    )
  }
  writeStore(store)
  return normalizedReport
}

const buildManagedReportDetail = (report) => {
  if (!report) {
    return null
  }

  const store = readStore()
  const relatedSession = report.sessionId ? store.liveSessions.find((item) => item.id === report.sessionId) : null
  const sessionName = String(report.name || report.title || '').replace(/战报$/, '')
  const sessionMembers = Array.isArray(relatedSession?.members) ? relatedSession.members : []
  const ranks = Array.isArray(report.ranks)
    ? report.ranks.map((rank) => {
        if (rank?.avatarUrl) {
          return rank
        }
        const matchedMember = sessionMembers.find(
          (member) =>
            (rank?.profileId && String(member?.profileId || '') === String(rank.profileId)) ||
            (rank?.name && String(member?.name || '') === String(rank.name)),
        )
        return {
          ...rank,
          avatarUrl: String(matchedMember?.avatarUrl || '').trim(),
        }
      })
    : []

  return {
    id: report.id,
    imageUrl: normalizeTemplateImageUrl(report.imageUrl || relatedSession?.templateImageUrl || ''),
    sessionId: report.sessionId || '',
    sessionName,
    title: report.title || '',
    templateName: report.template || '',
    scene: report.scene || '',
    status: report.status || '',
    createdAt: report.createdAt || '',
    playerCount: Number(report.playerCount) || Number(relatedSession?.players) || 0,
    inviteCode: relatedSession?.inviteCode || '',
    shareRate: report.shareRate || '',
    replayRate: report.replayRate || '',
    ranks,
    events:
      Array.isArray(report.events) && report.events.length
        ? report.events
        : [report.highlight1, report.highlight2, report.highlight3]
            .filter(Boolean)
            .map((text) => ({ text })),
  }
}

const resolveHistoryStatus = (session, report) => {
  const sessionState = String(session?.state || '').trim()
  const sessionStatus = String(session?.status || report?.status || '').trim()

  if (sessionStatus.includes('失效') || sessionStatus.includes('停用') || sessionState.includes('失效')) {
    return '已失效'
  }

  if (sessionState.includes('进行中') || sessionState.includes('等待')) {
    return '进行中'
  }

  if (sessionState.includes('结束') || report) {
    return '已结束'
  }

  return '进行中'
}

const getSessionHost = (session = {}) => {
  const members = Array.isArray(session?.members) ? session.members : []
  return members.find((item) => item?.isHost) || {
    name: session?.hostName || '',
    profileId: session?.hostProfileId || '',
  }
}

const isSessionHost = (session = {}, profileId = '') => {
  const normalizedProfileId = String(profileId || '').trim()
  if (!normalizedProfileId) {
    return false
  }
  const host = getSessionHost(session)
  return String(host?.profileId || '').trim() === normalizedProfileId
}

const isSessionMember = (session = {}, profileId = '') => {
  const normalizedProfileId = String(profileId || '').trim()
  if (!normalizedProfileId) {
    return false
  }
  const members = Array.isArray(session?.members) ? session.members : []
  return members.some((item) => String(item?.profileId || '').trim() === normalizedProfileId)
}

const hasSharedReport = (store, profileId = '', report = {}) => {
  const normalizedProfileId = String(profileId || '').trim()
  const reportId = String(report?.id || '').trim()
  const sessionId = String(report?.sessionId || '').trim()
  return (store.analyticsEvents || []).some((item) => {
    if (item?.type !== 'report_share' || String(item.profileId || '').trim() !== normalizedProfileId) {
      return false
    }
    const eventReportId = String(item.reportId || item.meta?.reportId || '').trim()
    const eventSessionId = String(item.sessionId || item.meta?.sessionId || '').trim()
    return (reportId && eventReportId === reportId) || (sessionId && eventSessionId === sessionId)
  })
}

const getManagedReportById = (reportId) => {
  const normalizedReportId = String(reportId || '').trim()
  if (!normalizedReportId) {
    return null
  }
  const store = readStore()
  const report = (store.reports || []).find((item) => item.id === normalizedReportId)
  return buildManagedReportDetail(report)
}

const listManagedReports = (profileId = '', mode = 'all') => {
  const normalizedProfileId = String(profileId || '').trim()
  const normalizedMode = ['host', 'joined', 'unshared', 'all'].includes(String(mode || '').trim())
    ? String(mode || '').trim()
    : 'all'
  const store = readStore()
  const sessions = (store.liveSessions || []).filter((session) => {
    if (!normalizedProfileId) {
      return true
    }
    const isHost = isSessionHost(session, normalizedProfileId)
    const isMember = isSessionMember(session, normalizedProfileId)
    if (normalizedMode === 'host') {
      return isHost
    }
    if (normalizedMode === 'joined' || normalizedMode === 'unshared') {
      return isMember && !isHost
    }
    return isMember
  })

  const reportBySessionId = new Map(
    (store.reports || [])
      .filter((report) => report?.sessionId)
      .map((report) => [String(report.sessionId), report]),
  )
  const templateConfig = getTemplateConfig()
  const templateByName = new Map(
    (Array.isArray(templateConfig?.templates) ? templateConfig.templates : [])
      .flatMap((template) => [template?.title, template?.name, template?.id].map((key) => [String(key || '').trim(), template]))
      .filter(([key]) => key),
  )

  const rows = sessions.map((session) => {
    const report = reportBySessionId.get(String(session.id || ''))
    const status = resolveHistoryStatus(session, report)
    const host = getSessionHost(session)
    const createdAt = report?.createdAt || session?.createdAt || ''
    const templateName = String(report?.template || session?.template || session?.templateName || '').trim()
    const template = templateByName.get(templateName) || null
    return {
      id: report?.id || `session:${session.id}`,
      recordType: report ? 'report' : 'session',
      reportId: report?.id || '',
      role: isSessionHost(session, normalizedProfileId) ? 'host' : 'member',
      sessionId: String(session.id || ''),
      sessionName: report ? String(report.name || report.title || '').replace(/战报$/, '') : String(session.name || ''),
      title: report?.title || String(session.name || ''),
      templateName,
      hostName: String(host?.name || session.hostName || '').trim(),
      hostProfileId: String(host?.profileId || session.hostProfileId || '').trim(),
      imageUrl: normalizeTemplateImageUrl(report?.imageUrl || session?.templateImageUrl || session?.imageUrl || template?.imageUrl || ''),
      status,
      meta: `${Number(report?.playerCount) || Number(session?.players) || 0}人 · ${templateName} · ${createdAt}`.replace(/\s+/g, ' ').trim(),
      createdAt,
      shareRate: report?.shareRate || '',
    }
  })

  const filteredRows =
    normalizedMode === 'unshared'
      ? rows.filter((row) => row.role === 'member' && row.reportId && row.status === '已结束' && !hasSharedReport(store, normalizedProfileId, { id: row.reportId, sessionId: row.sessionId }))
      : rows

  return filteredRows.sort((left, right) => String(right.createdAt || '').localeCompare(String(left.createdAt || '')))
}

const getUserJudgeStats = (profileId = '') => {
  const normalizedProfileId = String(profileId || '').trim()
  if (!normalizedProfileId) {
    return {
      hostedCount: 0,
      joinedCount: 0,
      reportShareCount: 0,
    }
  }

  const store = readStore()
  const relatedSessions = (store.liveSessions || []).filter((session) => isSessionMember(session, normalizedProfileId))
  const hostedSessions = relatedSessions.filter((session) => isSessionHost(session, normalizedProfileId))
  const joinedSessions = relatedSessions.filter((session) => !isSessionHost(session, normalizedProfileId))
  const reportBySessionId = new Map(
    (store.reports || [])
      .filter((report) => report?.sessionId)
      .map((report) => [String(report.sessionId), report]),
  )

  return {
    hostedCount: hostedSessions.length,
    joinedCount: joinedSessions.length,
    reportShareCount: (store.analyticsEvents || []).filter(
      (item) => item?.type === 'report_share' && String(item.profileId || '').trim() === normalizedProfileId,
    ).length,
    unsharedReportCount: joinedSessions.filter((session) => {
      const report = reportBySessionId.get(String(session.id || ''))
      return report && resolveHistoryStatus(session, report) === '已结束' && !hasSharedReport(store, normalizedProfileId, report)
    }).length,
  }
}

const toOption = (value, label = value) => ({
  value: String(value || '').trim(),
  label: String(label || value || '').trim(),
})

const uniqueOptions = (values = []) =>
  [...new Set(values.map((item) => String(item || '').trim()).filter(Boolean))].map((item) => toOption(item))

const mergeOptions = (...groups) => uniqueOptions(groups.flat())

const YES_NO_OPTIONS = [toOption('是'), toOption('否')]
const TRUE_FALSE_OPTIONS = [toOption('true', '开启'), toOption('false', '关闭')]
const QUESTION_TYPE_OPTIONS = [toOption('互动'), toOption('惩罚'), toOption('问答')]
const QUESTION_DIFFICULTY_OPTIONS = [toOption('简单'), toOption('中等'), toOption('困难')]
const RISK_LEVEL_OPTIONS = [toOption('低'), toOption('中'), toOption('高')]
const MOMENT_NODE_TYPE_OPTIONS = [
  toOption('opening', '开场'),
  toOption('highlight', '精彩瞬间'),
  toOption('drinking', '欠酒/加酒'),
  toOption('private', '私密爆料'),
  toOption('closing', '收尾'),
]
const MOMENT_REVIEW_STATUS_OPTIONS = [toOption('pending', '待审核'), toOption('approved', '已通过'), toOption('rejected', '已拒绝'), toOption('hidden', '已隐藏')]
const MOMENT_SECONDARY_REVIEW_STATUS_OPTIONS = [
  toOption('pending', '待二审'),
  toOption('approved', '二审通过'),
  toOption('rejected', '二审拒绝'),
  toOption('require_resubmit', '要求重传'),
]
const MOMENT_COMPLETION_STATUS_OPTIONS = [toOption('draft', '草稿'), toOption('needs_media', '待补图'), toOption('complete', '已补全')]
const SHARE_TASK_STATUS_OPTIONS = [
  toOption('pending', '待处理'),
  toOption('processing', '生成中'),
  toOption('ready', '已生成'),
  toOption('failed', '失败'),
  toOption('expired', '已过期'),
]
const RANKING_REWARD_CATEGORY_OPTIONS = RANKING_REWARD_CATEGORIES.map((item) => toOption(item.value, item.label))
const TOOL_PLACEMENT_OPTIONS = [toOption('home'), toOption('tools'), toOption('both')]
const USER_STATUS_OPTIONS = [toOption('高活跃'), toOption('普通'), toOption('高价值'), toOption('沉默')]
const ADMIN_STATUS_OPTIONS = [toOption('active', '启用'), toOption('disabled', '停用')]
const POINT_ICON_OPTIONS = [
  toOption('points-icon-coin'),
  toOption('points-icon-share'),
  toOption('points-icon-refresh'),
  toOption('points-icon-shield'),
  toOption('points-icon-image'),
  toOption('points-icon-coupon'),
  toOption('points-icon-crown'),
  toOption('icon-signin'),
  toOption('icon-video'),
  toOption('icon-share'),
  toOption('icon-task'),
  toOption('icon-coin'),
  toOption('icon-ticket'),
  toOption('icon-star'),
]

const getTemplateTitleOptions = () => uniqueOptions((getTemplateConfig().templates || []).map((item) => item.title))
const getIdentityTagOptions = () => uniqueOptions((listProfiles() || []).map((item) => item.identityTag))
const getTemplateFilterOptions = () =>
  (getTemplateConfig().filters || []).map((item) => toOption(item.id, `${item.name} (${item.id})`))
const getProfileNameOptions = () => uniqueOptions((listProfiles() || []).map((item) => item.name))
const getQuestionTemplateOptions = () => mergeOptions(getTemplateTitleOptions().map((item) => item.value), ['生日专属', '整活大挑战', '友情互损'])
const getQuestionStatusOptions = () => mergeOptions(['待审核', '上线中', '停用'], (readStore().questionBank || []).map((item) => item.status))
const getShareAssetTypeOptions = () => mergeOptions(['战报海报', '邀局卡', '分享码'], (readStore().shareAssets || []).map((item) => item.assetType))
const getShareSceneOptions = () => mergeOptions(['战报分享', '邀请好友', '群邀请'], (readStore().shareAssets || []).map((item) => item.scene))
const getShareStatusOptions = () => mergeOptions(['上线中', '灰度', '停用'], (readStore().shareAssets || []).map((item) => item.status))
const getToolCategoryOptions = () => mergeOptions(['分享生成', '图片处理', '开发工具', '计算工具'], (readStore().toolsCatalog || []).map((item) => item.category))
const getToolTargetOptions = () => mergeOptions(['邀局裂变', '工具留存', '日活补充', '实用转化', '日常工具', '分享物料', '内容编辑'], (readStore().toolsCatalog || []).map((item) => item.target))
const getToolStatusOptions = () => mergeOptions(['启用', '停用', '灰度'], (readStore().toolsCatalog || []).map((item) => item.status))
const getSessionTemplateOptions = () => mergeOptions(getTemplateTitleOptions().map((item) => item.value), (readStore().liveSessions || []).map((item) => item.template))
const getSessionStateOptions = () => mergeOptions(['等待开局', '进行中', '已结束'], (readStore().liveSessions || []).map((item) => item.state))
const getSessionSourceOptions = () => mergeOptions(['直接创建', '群分享', '好友邀请', '二维码加入'], (readStore().liveSessions || []).map((item) => item.source))
const getSessionStatusOptions = () => mergeOptions(['正常', '待观察', '灰度', '停用'], (readStore().liveSessions || []).map((item) => item.status))
const getReportSceneOptions = () => mergeOptions(['常规局', '生日局', '夜场'], (readStore().reports || []).map((item) => item.scene))
const getReportStatusOptions = () => mergeOptions(['正常', '爆发', '灰度', '停用'], (readStore().reports || []).map((item) => item.status))
const getMembershipStatusOptions = () => mergeOptions(['上线中', '灰度', '停用'], (readStore().membershipPlans || []).map((item) => item.status))
const getMembershipScopeOptions = () => mergeOptions(['高级模板页', '分享战报页', '海报模板'], (readStore().membershipBenefits || []).map((item) => item.scope))
const getBenefitStatusOptions = () => mergeOptions(['启用', '停用'], (readStore().membershipBenefits || []).map((item) => item.status))
const getAdPageOptions = () => mergeOptions(['高级模板', '分享战报', '工具详情'], (readStore().adSlots || []).map((item) => item.page))
const getAdTypeOptions = () => mergeOptions(['激励视频', 'Banner'], (readStore().adSlots || []).map((item) => item.adType))
const getAdStatusOptions = () => mergeOptions(['启用', '停用', '灰度'], (readStore().adSlots || []).map((item) => item.status))
const getMerchantCategoryOptions = () => mergeOptions(['代驾', '夜宵', '娱乐'], (readStore().merchants || []).map((item) => item.category))
const getMerchantStatusOptions = () => mergeOptions(['上线中', '灰度', '停用'], (readStore().merchants || []).map((item) => item.status))
const getCampaignStatusOptions = () => mergeOptions(['进行中', '灰度', '已结束'], (readStore().campaigns || []).map((item) => item.status))
const getRoleIdOptions = () => (readStore().roles || []).map((item) => toOption(item.id, `${item.name} (${item.id})`))
const getRoleScopeOptions = () => mergeOptions(['全量模块', '首页、模板、题库、素材', '积分、会员、广告、商户'], (readStore().roles || []).map((item) => item.scope))
const getRoleStatusOptions = () => mergeOptions(['active', 'disabled'], (readStore().roles || []).map((item) => item.status))
const getAdminScopeOptions = () => mergeOptions(['生产 / 全局', '生产 / 分享', '灰度 / 首页'], (readStore().baseConfigs || []).map((item) => item.scope))
const getAdminConfigKeyOptions = () => (readStore().baseConfigs || []).map((item) => toOption(item.key, item.key))
const getBaseConfigStatusOptions = () => mergeOptions(['已生效', '待发布', '灰度'], (readStore().baseConfigs || []).map((item) => item.status))
const getSensitiveSceneOptions = () => mergeOptions(['活动文案', '模板文案', '题库'], (readStore().sensitiveWords || []).map((item) => item.scene))
const getSensitiveStatusOptions = () => mergeOptions(['启用', '停用'], (readStore().sensitiveWords || []).map((item) => item.status))
const getAuditSourceOptions = () => mergeOptions(['题库', '模板文案', '用户昵称'], (readStore().auditQueue || []).map((item) => item.source))
const getAuditStatusOptions = () => mergeOptions(['待审核', '已拦截', '已通过'], (readStore().auditQueue || []).map((item) => item.status))

const pageMap = {
  'overview-dashboard': () => {
    return {
      slug: 'overview-dashboard',
      title: '经营驾驶舱',
      view: 'dashboard',
      metrics: overviewMetrics(),
      table: buildOverviewTable(),
      notes: buildOverviewNotes(),
    }
  },
  'content-home-ops': () => ({
    slug: 'content-home-ops',
    title: '首页装修',
    view: 'form',
    metrics: overviewMetrics().slice(0, 4),
    formSections: [
      {
        title: '主 Hero',
        fields: [
          { key: 'heroTitle', label: '主标题', type: 'text' },
          { key: 'heroSubtitle', label: '副标题', type: 'textarea' },
          { key: 'heroImageUrl', label: '主图地址', type: 'image' },
        ],
      },
      {
        title: '酒桌判官页主图',
        fields: [
          { key: 'judgeHeroTitle', label: '页面标题', type: 'text' },
          { key: 'judgeHeroSubtitle', label: '页面副标题', type: 'textarea' },
          { key: 'judgeHeroImageUrl', label: '页面主图', type: 'image' },
        ],
      },
      {
        title: '工具箱主视觉',
        fields: [
          { key: 'toolsHeroTitle', label: '页面标题', type: 'text' },
          { key: 'toolsHeroSubtitle', label: '页面副标题', type: 'textarea' },
          { key: 'toolsHeroImageUrl', label: '页面主图', type: 'image' },
        ],
      },
      {
        title: '活动 Banner',
        fields: [
          { key: 'bannerTitle', label: '活动标题', type: 'text' },
          { key: 'bannerImageUrl', label: '活动图片', type: 'image' },
        ],
      },
      {
        title: '快捷工具',
        fields: [
          { key: 'quickToolsText', label: '快捷工具（每行 `id|名称`）', type: 'textarea' },
        ],
      },
    ],
    data: makeHomeFormData(),
  }),
  'content-templates': () => ({
    slug: 'content-templates',
    title: '酒局模板',
    view: 'multi-collection',
    metrics: getTemplateMetrics(),
    metaFields: [
      { key: 'unlockTitle', label: '解锁卡标题', type: 'text' },
      { key: 'unlockProgressText', label: '解锁进度文案', type: 'text' },
    ],
    meta: {
      unlockTitle: getTemplateConfig().unlockCard.title,
      unlockProgressText: getTemplateConfig().unlockCard.progressText,
    },
    collections: [
      {
        key: 'filters',
        title: '模板分类',
        itemLabel: '分类',
        fields: [
          { key: 'id', label: '分类 ID', type: 'text' },
          { key: 'name', label: '分类名称', type: 'text' },
        ],
        columns: [
          { key: 'id', label: 'ID' },
          { key: 'name', label: '分类名称' },
        ],
        items: getTemplateConfig().filters,
      },
      {
        key: 'templates',
        title: '模板列表',
        itemLabel: '模板',
        fields: [
          { key: 'id', label: '模板 ID', type: 'text' },
          { key: 'filterId', label: '分类 ID', type: 'select', options: getTemplateFilterOptions() },
          { key: 'title', label: '模板名称', type: 'text' },
          { key: 'meta', label: '描述文案', type: 'textarea' },
          { key: 'cost', label: '积分价格', type: 'number' },
          { key: 'imageUrl', label: '封面图地址', type: 'image' },
        ],
        columns: [
          { key: 'title', label: '模板名称' },
          { key: 'filterId', label: '分类' },
          { key: 'cost', label: '积分' },
          { key: 'meta', label: '描述' },
        ],
        items: getTemplateConfig().templates,
      },
    ],
  }),
  'content-question-bank': () => {
    const store = readStore()
    return {
      slug: 'content-question-bank',
      title: '题库与任务',
      view: 'collection',
      metrics: getQuestionBankMetrics(),
      collection: {
        key: 'questionBank',
        itemLabel: '题目',
        fields: [
          { key: 'content', label: '题目内容', type: 'textarea' },
          { key: 'type', label: '类型', type: 'select', options: QUESTION_TYPE_OPTIONS },
          { key: 'difficulty', label: '难度', type: 'select', options: QUESTION_DIFFICULTY_OPTIONS },
          { key: 'template', label: '适用模板', type: 'select', options: getQuestionTemplateOptions() },
          { key: 'riskLevel', label: '风险等级', type: 'select', options: RISK_LEVEL_OPTIONS },
          { key: 'status', label: '状态', type: 'select', options: getQuestionStatusOptions() },
        ],
        columns: [
          { key: 'content', label: '题目' },
          { key: 'type', label: '类型' },
          { key: 'template', label: '适用模板' },
          { key: 'riskLevel', label: '风险' },
          { key: 'status', label: '状态' },
        ],
        items: store.questionBank,
      },
    }
  },
  'content-share-assets': () => {
    const store = readStore()
    return {
      slug: 'content-share-assets',
      title: '分享素材',
      view: 'collection',
      metrics: getShareAssetMetrics(),
      collection: {
        key: 'shareAssets',
        itemLabel: '素材',
        fields: [
          { key: 'id', label: '素材 ID', type: 'text' },
          { key: 'name', label: '素材名称', type: 'text' },
          { key: 'assetType', label: '素材类型', type: 'select', options: getShareAssetTypeOptions() },
          { key: 'scene', label: '场景', type: 'select', options: getShareSceneOptions() },
          { key: 'imageUrl', label: '素材图片', type: 'image' },
          { key: 'openRate', label: '打开率', type: 'text' },
          { key: 'returnRate', label: '回流率', type: 'text' },
          { key: 'status', label: '状态', type: 'select', options: getShareStatusOptions() },
        ],
        columns: [
          { key: 'id', label: 'ID' },
          { key: 'name', label: '素材名称' },
          { key: 'assetType', label: '类型' },
          { key: 'scene', label: '场景' },
          { key: 'imageUrl', label: '图片' },
          { key: 'openRate', label: '打开率' },
          { key: 'status', label: '状态' },
        ],
        items: store.shareAssets,
      },
    }
  },
  'content-tools-ops': () => {
    const store = readStore()
    return {
      slug: 'content-tools-ops',
      title: '工具箱运营',
      view: 'collection',
      metrics: getToolOpsMetrics(),
      collection: {
        key: 'toolsCatalog',
        itemLabel: '工具',
        fields: [
          { key: 'id', label: '工具 ID', type: 'text' },
          { key: 'name', label: '工具名称', type: 'text' },
          { key: 'category', label: '分类', type: 'select', options: getToolCategoryOptions() },
          { key: 'target', label: '导流目标', type: 'select', options: getToolTargetOptions() },
          { key: 'imageUrl', label: '工具图片', type: 'image' },
          { key: 'usageCount', label: '使用量', type: 'number' },
          { key: 'favoriteRate', label: '收藏率', type: 'text' },
          { key: 'sortOrder', label: '排序值', type: 'number' },
          { key: 'isHot', label: '热门推荐（是/否）', type: 'select', options: YES_NO_OPTIONS },
          { key: 'placement', label: '投放位置（home/tools/both）', type: 'select', options: TOOL_PLACEMENT_OPTIONS },
          { key: 'status', label: '状态', type: 'select', options: getToolStatusOptions() },
        ],
        columns: [
          { key: 'id', label: 'ID' },
          { key: 'name', label: '工具名称' },
          { key: 'category', label: '分类' },
          { key: 'sortOrder', label: '排序' },
          { key: 'isHot', label: '热门' },
          { key: 'placement', label: '投放位置' },
          { key: 'target', label: '导流目标' },
          { key: 'usageCount', label: '使用量' },
          { key: 'status', label: '状态' },
        ],
        items: store.toolsCatalog,
      },
    }
  },
  'user-profiles': () => {
    const adminStore = readStore()
    const contentStore = readContentStore()
    const socialStore = readSocialStore()
    const profiles = buildUserProfileItems(adminStore, contentStore, socialStore)
    return {
      slug: 'user-profiles',
      title: '用户中心',
      view: 'collection',
      metrics: [
        { label: '总用户数', value: String(profiles.length), trend: `高价值 ${countBy(profiles, (item) => String(item.status || '').includes('高价值'))} 人`, tone: 'up' },
        { label: '高价值用户', value: String(countBy(profiles, (item) => String(item.status || '').includes('高价值'))), trend: `占比 ${ratioPercent(countBy(profiles, (item) => String(item.status || '').includes('高价值')), profiles.length)}`, tone: 'up' },
        { label: '高活跃用户', value: String(countBy(profiles, (item) => String(item.status || '').includes('高活跃'))), trend: `占比 ${ratioPercent(countBy(profiles, (item) => String(item.status || '').includes('高活跃')), profiles.length)}`, tone: 'up' },
        { label: '工具型用户', value: String(countBy(profiles, (item) => String(item.tagsText || '').includes('工具'))), trend: `酒友关系 ${listFriendships().length} 条`, tone: 'up' },
      ],
      collection: {
        key: 'userProfiles',
        itemLabel: '用户',
      pageSize: 15,
        fields: [
          { key: 'name', label: '昵称', type: 'text' },
          { key: 'identityTag', label: '身份标签', type: 'select', options: getIdentityTagOptions() },
          { key: 'status', label: '运营状态', type: 'select', options: USER_STATUS_OPTIONS },
          { key: 'tagsText', label: '运营标签（顿号分隔）', type: 'text' },
          { key: 'note', label: '运营备注', type: 'textarea' },
        ],
        columns: [
          { key: 'name', label: '用户' },
          { key: 'identityTag', label: '身份标签' },
          { key: 'status', label: '状态' },
          { key: 'tagsText', label: '标签' },
        ],
        items: profiles,
      },
    }
  },
  'sessions': () => {
    const store = readStore()
    const getRelationSummary = buildSessionRelationSummary(store)
    const sessions = (store.liveSessions || []).map((item) => {
      const members = Array.isArray(item.members) ? item.members : []
      const host = getSessionHost(item)
      const participants = members.filter((member) => !member.isHost)
      const relationSummary = getRelationSummary(item.id)
      return {
        ...item,
        hostName: item.hostName || host?.name || '',
        hostProfileId: item.hostProfileId || host?.profileId || '',
        participantsText: participants.map((member) => member.name || member.profileId).filter(Boolean).join('、'),
        participantProfileIds: participants.map((member) => member.profileId).filter(Boolean).join('、'),
        memberCount: members.length,
        memberSummary: members.map((member) => `${member.isHost ? '房主' : '成员'}:${member.name || member.profileId || '-'}`).join('、'),
        ...relationSummary,
      }
    })
    return {
      slug: 'sessions',
      title: '聚会管理',
      view: 'collection',
      metrics: getSessionMetrics(),
      collection: {
        key: 'liveSessions',
        itemLabel: '聚会',
        fields: [
          { key: 'name', label: '聚会名称', type: 'text' },
          { key: 'players', label: '人数', type: 'number' },
          { key: 'template', label: '模板', type: 'select', options: getSessionTemplateOptions() },
          { key: 'hostName', label: '记录人', type: 'select', options: getProfileNameOptions() },
          { key: 'hostProfileId', label: '记录人唯一ID', type: 'text' },
          { key: 'inviteCode', label: '口令', type: 'text' },
          { key: 'participantsText', label: '参与人', type: 'textarea' },
          { key: 'participantProfileIds', label: '参与人唯一ID', type: 'textarea' },
          { key: 'state', label: '流程状态', type: 'select', options: getSessionStateOptions() },
          { key: 'source', label: '分享来源', type: 'select', options: getSessionSourceOptions() },
          { key: 'status', label: '运营状态', type: 'select', options: getSessionStatusOptions() },
          { key: 'endedAt', label: '结束时间', type: 'text' },
        ],
        columns: [
          { key: 'name', label: '聚会名称' },
          { key: 'players', label: '人数' },
          { key: 'template', label: '模板' },
          { key: 'hostName', label: '记录人' },
          { key: 'hostProfileId', label: '记录人唯一ID' },
          { key: 'participantsText', label: '参与人' },
          { key: 'participantProfileIds', label: '参与人唯一ID' },
          { key: 'inviteCode', label: '口令' },
          { key: 'state', label: '流程状态' },
          { key: 'status', label: '状态' },
          { key: 'endedAt', label: '结束时间' },
          { key: 'memberCount', label: '成员数' },
          { key: 'memberSummary', label: '成员摘要' },
          { key: 'reportId', label: '战报' },
          { key: 'reportStatus', label: '战报状态' },
          { key: 'briefId', label: '简报' },
          { key: 'briefStatus', label: '简报状态' },
          { key: 'shareTaskId', label: '分享图任务' },
          { key: 'shareTaskStatus', label: '分享图状态' },
          { key: 'shareTaskCount', label: '分享图任务数' },
          { key: 'manageLinks', label: '管理入口' },
        ],
        items: sessions,
      },
    }
  },
  'reports': () => {
    const store = readStore()
    return {
      slug: 'reports',
      title: '战报中心',
      view: 'collection',
      metrics: getReportMetrics(),
      collection: {
        key: 'reports',
        itemLabel: '战报',
        fields: [
          { key: 'name', label: '战报名称', type: 'text' },
          { key: 'template', label: '模板', type: 'select', options: getSessionTemplateOptions() },
          { key: 'title', label: '战报标题', type: 'text' },
          { key: 'scene', label: '场景', type: 'select', options: getReportSceneOptions() },
          { key: 'highlight1', label: '亮点 1', type: 'text' },
          { key: 'highlight2', label: '亮点 2', type: 'text' },
          { key: 'highlight3', label: '亮点 3', type: 'text' },
          { key: 'shareRate', label: '分享率', type: 'text' },
          { key: 'replayRate', label: '再开一局率', type: 'text' },
          { key: 'status', label: '状态', type: 'select', options: getReportStatusOptions() },
        ],
        columns: [
          { key: 'name', label: '战报名称' },
          { key: 'template', label: '模板' },
          { key: 'title', label: '战报标题' },
          { key: 'scene', label: '场景' },
          { key: 'shareRate', label: '分享率' },
          { key: 'status', label: '状态' },
        ],
        items: store.reports,
      },
    }
  },
  'commerce-points': () => {
    const pointsConfig = getPointsConfig()
    return {
      slug: 'commerce-points',
      title: '积分体系',
      view: 'multi-collection',
      metrics: getPointsMetrics(),
      metaFields: [
        { key: 'bannerImageUrl', label: '横幅图片地址', type: 'image' },
      ],
      meta: {
        bannerImageUrl: pointsConfig.bannerImageUrl,
      },
      collections: [
        {
          key: 'tasks',
          title: '每日任务',
          itemLabel: '任务',
          fields: [
            { key: 'id', label: '任务 ID', type: 'text' },
            { key: 'title', label: '任务标题', type: 'text' },
            { key: 'value', label: '奖励积分', type: 'number' },
            { key: 'iconClass', label: '图标类名', type: 'select', options: POINT_ICON_OPTIONS },
          ],
          columns: [
            { key: 'title', label: '任务标题' },
            { key: 'value', label: '积分' },
            { key: 'iconClass', label: '图标' },
          ],
          items: pointsConfig.tasks,
        },
        {
          key: 'rewards',
          title: '积分商品',
          itemLabel: '商品',
          fields: [
            { key: 'id', label: '商品 ID', type: 'text' },
            { key: 'title', label: '商品标题', type: 'text' },
            { key: 'subtitle', label: '商品副标题', type: 'textarea' },
            { key: 'cost', label: '积分价格', type: 'number' },
            { key: 'iconClass', label: '图标类名', type: 'select', options: POINT_ICON_OPTIONS },
          ],
          columns: [
            { key: 'title', label: '商品标题' },
            { key: 'subtitle', label: '副标题' },
            { key: 'cost', label: '积分' },
            { key: 'iconClass', label: '图标' },
          ],
          items: pointsConfig.rewards,
        },
      ],
    }
  },
  'commerce-membership': () => {
    const store = readStore()
    const membershipEnabled = String(store.membershipEnabled) === 'false' ? 'false' : 'true'
    return {
      slug: 'commerce-membership',
      title: '会员体系',
      view: 'multi-collection',
      metrics: getMembershipMetrics(),
      meta: {
        membershipEnabled,
      },
      metaFields: [
        {
          key: 'membershipEnabled',
          label: '会员功能总开关',
          type: 'select',
          options: [
            { value: 'true', label: '开启' },
            { value: 'false', label: '关闭' },
          ],
        },
      ],
      collections: [
        {
          key: 'membershipPlans',
          title: '会员套餐',
          itemLabel: '套餐',
          fields: [
            { key: 'name', label: '套餐名称', type: 'text' },
            { key: 'price', label: '价格', type: 'text' },
            { key: 'duration', label: '时长', type: 'text' },
            { key: 'conversionRate', label: '转化率', type: 'text' },
            { key: 'renewRate', label: '续费率', type: 'text' },
            { key: 'status', label: '状态', type: 'select', options: getMembershipStatusOptions() },
          ],
          columns: [
            { key: 'name', label: '套餐' },
            { key: 'price', label: '价格' },
            { key: 'duration', label: '时长' },
            { key: 'conversionRate', label: '转化率' },
            { key: 'status', label: '状态' },
          ],
          items: store.membershipPlans,
        },
        {
          key: 'membershipBenefits',
          title: '会员权益',
          itemLabel: '权益',
          fields: [
            { key: 'name', label: '权益名称', type: 'text' },
            { key: 'scope', label: '作用范围', type: 'select', options: getMembershipScopeOptions() },
            { key: 'status', label: '状态', type: 'select', options: getBenefitStatusOptions() },
            { key: 'note', label: '说明', type: 'textarea' },
          ],
          columns: [
            { key: 'name', label: '权益名称' },
            { key: 'scope', label: '范围' },
            { key: 'status', label: '状态' },
            { key: 'note', label: '说明' },
          ],
          items: store.membershipBenefits,
        },
      ],
    }
  },
  'commerce-merchants': () => {
    const store = readStore()
    return {
      slug: 'commerce-merchants',
      title: '商户合作',
      view: 'collection',
      metrics: getMerchantMetrics(),
      collection: {
        key: 'merchants',
        itemLabel: '商户券',
        fields: [
          { key: 'name', label: '券 / 商户名称', type: 'text' },
          { key: 'category', label: '品类', type: 'select', options: getMerchantCategoryOptions() },
          { key: 'imageUrl', label: 'imageUrl', type: 'image' },
          { key: 'inventory', label: '库存 / 有效期', type: 'text' },
          { key: 'claimCount', label: '领取量', type: 'text' },
          { key: 'verifyRate', label: '核销率', type: 'text' },
          { key: 'status', label: '状态', type: 'select', options: getMerchantStatusOptions() },
        ],
        columns: [
          { key: 'name', label: '券 / 商户' },
          { key: 'category', label: '品类' },
          { key: 'inventory', label: '库存 / 有效期' },
          { key: 'claimCount', label: '领取量' },
          { key: 'status', label: '状态' },
        ],
        items: store.merchants,
      },
    }
  },
  'system-permissions': () => {
    const store = readStore()
    return {
      slug: 'system-permissions',
      title: '账号权限',
      view: 'multi-collection',
      metrics: getSystemPermissionMetrics(),
      collections: [
        {
          key: 'adminUsers',
          title: '管理员账号',
          itemLabel: '管理员',
          fields: [
            { key: 'username', label: '登录账号', type: 'text' },
            { key: 'name', label: '姓名', type: 'text' },
            { key: 'roleId', label: '角色 ID', type: 'select', options: getRoleIdOptions() },
            { key: 'status', label: '状态', type: 'select', options: getRoleStatusOptions() },
          ],
          columns: [
            { key: 'username', label: '账号' },
            { key: 'name', label: '姓名' },
            { key: 'roleId', label: '角色 ID' },
            { key: 'status', label: '状态' },
            { key: 'failedLoginCount', label: '失败次数' },
            { key: 'lockedUntil', label: '锁定至' },
            { key: 'passwordUpdatedAt', label: '密码更新时间' },
          ],
          customActions: [
            { key: 'reset-password', label: '重置密码', type: 'passwordReset' },
          ],
          items: store.adminUsers.map((item) => ({
            id: item.id,
            username: item.username,
            name: item.name,
            roleId: item.roleId,
            status: item.status,
            failedLoginCount: Math.max(0, Number(item.failedLoginCount) || 0),
            lockedUntil: item.lockedUntil || '',
            passwordUpdatedAt: item.passwordUpdatedAt || '',
          })),
        },
        {
          key: 'roles',
          title: '角色权限',
          itemLabel: '角色',
          fields: [
            { key: 'id', label: '角色 ID', type: 'text' },
            { key: 'name', label: '角色名称', type: 'text' },
            { key: 'scope', label: '权限范围', type: 'select', options: getRoleScopeOptions() },
            { key: 'permissionsText', label: '权限（逗号分隔）', type: 'textarea' },
            { key: 'status', label: '状态', type: 'select', options: getRoleStatusOptions() },
          ],
          columns: [
            { key: 'name', label: '角色名称' },
            { key: 'scope', label: '范围' },
            { key: 'permissionsText', label: '权限' },
            { key: 'status', label: '状态' },
          ],
          items: store.roles.map((item) => ({
            id: item.id,
            name: item.name,
            scope: item.scope,
            permissionsText: Array.isArray(item.permissions) ? item.permissions.join(', ') : '',
            status: item.status,
          })),
        },
      ],
    }
  },
  'system-config': () => {
    const mysqlEnabled = isMySQLEnabled()
    const fileMirrorEnabled = process.env.STORE_FILE_MIRROR !== '0'
    const runtimeRows = [
      {
        id: 'runtime-storage',
        item: '数据主存储',
        value: mysqlEnabled ? `MySQL / ${process.env.MYSQL_STORE_TABLE || 'app_store'}` : '本地文件',
        effect: mysqlEnabled ? '用户资产、酒局、战报、埋点主链路实时写入数据库' : '当前未启用 MySQL，仅文件存储生效',
      },
      {
        id: 'runtime-mirror',
        item: '文件镜像',
        value: fileMirrorEnabled ? '开启' : '关闭',
        effect: fileMirrorEnabled ? '数据库写入同时落本地镜像，便于排查与备份' : '仅数据库保留数据副本',
      },
      {
        id: 'runtime-wechat',
        item: '微信登录',
        value: process.env.WECHAT_APP_ID && process.env.WECHAT_APP_SECRET ? '已配置' : '未完整配置',
        effect: process.env.WECHAT_APP_ID && process.env.WECHAT_APP_SECRET ? '小程序登录、OpenID 获取与手机号绑定可用' : '登录能力会直接失败，不再假成功',
      },
      {
        id: 'runtime-upload',
        item: '后台图片上传',
        value: '/api/v1/admin/uploads/image',
        effect: '分享素材、首页图、模板图等后台上传后立即走前台真实地址',
      },
    ]
    return {
      slug: 'system-config',
      title: '基础配置',
      view: 'readonly',
      metrics: getSystemConfigMetrics(),
      tables: [
        {
          title: '当前真实生效的系统运行项',
          columns: [
            { key: 'item', label: '运行项' },
            { key: 'value', label: '当前值' },
            { key: 'effect', label: '生效范围' },
          ],
          rows: runtimeRows,
        },
      ],
    }
  },
}

pageMap['user-profiles'] = () => {
  const adminStore = readStore()
  const contentStore = readContentStore()
  const socialStore = readSocialStore()
  const profiles = buildUserProfileItems(adminStore, contentStore, socialStore)
  return {
    slug: 'user-profiles',
    title: '用户中心',
    view: 'collection',
    metrics: [
      { label: '用户总数', value: String(profiles.length), trend: `已获 OpenID ${countBy(profiles, (item) => Boolean(item.wechatOpenId))} 人`, tone: 'up' },
      { label: '高价值用户', value: String(countBy(profiles, (item) => String(item.status || '').includes('高价值'))), trend: `占比 ${ratioPercent(countBy(profiles, (item) => String(item.status || '').includes('高价值')), profiles.length)}`, tone: 'up' },
      { label: '高活跃用户', value: String(countBy(profiles, (item) => String(item.status || '').includes('高活跃'))), trend: `占比 ${ratioPercent(countBy(profiles, (item) => String(item.status || '').includes('高活跃')), profiles.length)}`, tone: 'up' },
      { label: '积分用户', value: String(countBy(profiles, (item) => Number(item.points) > 0)), trend: `酒友关系 ${listFriendships().length} 条`, tone: 'up' },
    ],
    collection: {
      key: 'userProfiles',
      itemLabel: '用户',
      fields: [
        { key: 'name', label: '昵称', type: 'text' },
        { key: 'avatarUrl', label: '微信授权头像', type: 'image' },
        { key: 'phone', label: '手机号（可选绑定）', type: 'text' },
        { key: 'wechatOpenId', label: '微信 OpenID（唯一标识）', type: 'text' },
        { key: 'identityTag', label: '身份标签', type: 'select', options: getIdentityTagOptions() },
        { key: 'points', label: '当前积分', type: 'number' },
        { key: 'status', label: '运营状态', type: 'select', options: USER_STATUS_OPTIONS },
        { key: 'tagsText', label: '运营标签（顿号分隔）', type: 'text' },
        { key: 'note', label: '运营备注', type: 'textarea' },
      ],
        columns: [
          { key: 'avatarUrl', label: '头像', type: 'image' },
          { key: 'name', label: '用户' },
          { key: 'wechatOpenId', label: 'OpenID' },
          { key: 'phone', label: '手机号' },
          { key: 'points', label: '积分' },
          { key: 'status', label: '状态' },
        ],
      customActions: [
        {
          key: 'viewMatchedThreads',
          label: '查看配对',
          labelKey: 'matchedThreadsText',
          mode: 'table',
          title: '配对成功列表',
          rowsKey: 'matchedThreadsRows',
          emptyText: '当前用户暂无配对成功的线程',
          columns: [
            { key: 'counterpartName', label: '配对对象' },
            { key: 'counterpartPhone', label: '绑定手机号' },
            { key: 'updatedAt', label: '配对时间' },
            { key: 'threadId', label: '线程ID' },
          ],
        },
      ],
      items: profiles,
    },
  }
}

pageMap['commerce-points'] = () => {
  const pointsConfig = getPointsConfig()
  return {
    slug: 'commerce-points',
    title: '积分体系',
    view: 'multi-collection',
    metrics: getManagedPointsMetrics(),
    metaFields: [
      { key: 'bannerImageUrl', label: '横幅图片地址', type: 'image' },
    ],
    meta: {
      bannerImageUrl: pointsConfig.bannerImageUrl,
    },
    collections: [
      {
        key: 'tasks',
        title: '每日任务',
        itemLabel: '任务',
        fields: [
          { key: 'id', label: '任务 ID', type: 'text' },
          { key: 'title', label: '任务标题', type: 'text' },
          { key: 'value', label: '奖励积分', type: 'number' },
          { key: 'iconClass', label: '图标类名', type: 'select', options: POINT_ICON_OPTIONS },
        ],
        columns: [
          { key: 'title', label: '任务标题' },
          { key: 'value', label: '积分' },
          { key: 'iconClass', label: '图标' },
        ],
        items: pointsConfig.tasks,
      },
      {
        key: 'rewards',
        title: '积分商品',
        itemLabel: '商品',
        fields: [
          { key: 'id', label: '商品 ID', type: 'text' },
          { key: 'title', label: '商品标题', type: 'text' },
          { key: 'subtitle', label: '商品副标题', type: 'textarea' },
          { key: 'cost', label: '积分价格', type: 'number' },
          { key: 'iconClass', label: '图标类名', type: 'select', options: POINT_ICON_OPTIONS },
        ],
        columns: [
          { key: 'title', label: '商品标题' },
          { key: 'subtitle', label: '副标题' },
          { key: 'cost', label: '积分' },
          { key: 'iconClass', label: '图标' },
        ],
        items: pointsConfig.rewards,
      },
      {
        key: 'userPoints',
        title: '用户积分列表',
        itemLabel: '用户积分',
        fields: [
          { key: 'name', label: '昵称', type: 'text' },
          { key: 'phone', label: '手机号（可选绑定）', type: 'text' },
          { key: 'wechatOpenId', label: '微信 OpenID（唯一标识）', type: 'text' },
          { key: 'points', label: '当前积分', type: 'number' },
          { key: 'claimedTaskCount', label: '已领任务数', type: 'number' },
          { key: 'ledgerCount', label: '流水条数', type: 'number' },
          { key: 'adjustment', label: '本次增减积分', type: 'number' },
          { key: 'adjustReason', label: '调整原因', type: 'textarea' },
        ],
        columns: [
          { key: 'name', label: '用户' },
          { key: 'wechatOpenId', label: 'OpenID' },
          { key: 'phone', label: '手机号' },
          { key: 'points', label: '当前积分' },
          { key: 'claimedTaskCount', label: '任务数' },
          { key: 'ledgerCount', label: '流水数' },
        ],
        items: buildUserPointsItems(),
      },
    ],
  }
}

pageMap['commerce-point-ledger'] = () => {
  const rows = buildPointsLedgerRows()
  return {
    slug: 'commerce-point-ledger',
    title: '积分变动记录',
    view: 'readonly',
    metrics: [
      { label: '积分流水总数', value: formatNumber(rows.length), trend: `用户 ${formatNumber(new Set(rows.map((item) => item.profileId)).size)} 人`, tone: 'up' },
      { label: '加分流水', value: formatNumber(countBy(rows, (item) => Number(item.delta) > 0)), trend: `减分 ${formatNumber(countBy(rows, (item) => Number(item.delta) < 0))} 条`, tone: 'up' },
      { label: '任务发放', value: formatNumber(countBy(rows, (item) => item.kind === 'task')), trend: `后台调整 ${formatNumber(countBy(rows, (item) => item.kind === 'admin-adjust'))} 条`, tone: 'up' },
      { label: '兑换扣减', value: formatNumber(countBy(rows, (item) => item.kind === 'reward')), trend: `最近 ${rows[0]?.createdAt || '--'}`, tone: 'up' },
    ],
    tables: [
      {
        title: '用户积分流水',
        columns: [
          { key: 'userName', label: '用户' },
          { key: 'wechatOpenId', label: 'OpenID' },
          { key: 'phone', label: '手机号' },
          { key: 'title', label: '变动原因' },
          { key: 'delta', label: '积分变化' },
          { key: 'kind', label: '类型' },
          { key: 'createdAt', label: '时间' },
        ],
        rows,
      },
    ],
  }
}

pageMap['user-login-logs'] = () => {
  const rows = buildUserLoginLogRows()
  return {
    slug: 'user-login-logs',
    title: '用户登录记录',
    view: 'readonly',
    metrics: [
      { label: '登录记录数', value: formatNumber(rows.length), trend: `独立 OpenID ${formatNumber(new Set(rows.map((item) => item.wechatOpenId).filter(Boolean)).size)} 个`, tone: 'up' },
      { label: '微信登录', value: formatNumber(countBy(rows, (item) => item.source === 'wechat-miniapp')), trend: `最近 ${rows[0]?.loginAt || '--'}`, tone: 'up' },
      { label: '含手机号记录', value: formatNumber(countBy(rows, (item) => Boolean(item.phone))), trend: `缺手机号 ${formatNumber(countBy(rows, (item) => !item.phone))} 条`, tone: 'up' },
      { label: '独立 OpenID', value: formatNumber(new Set(rows.map((item) => item.wechatOpenId).filter(Boolean)).size), trend: '作为用户唯一身份标识', tone: 'up' },
    ],
    tables: [
      {
        title: '小程序登录日志',
        columns: [
          { key: 'userName', label: '用户' },
          { key: 'phone', label: '手机号' },
          { key: 'wechatOpenId', label: '微信 OpenID' },
          { key: 'source', label: '来源' },
          { key: 'loginAt', label: '登录时间' },
        ],
        rows,
      },
    ],
  }
}

pageMap['system-operation-logs'] = () => {
  const rows = buildAdminOperationLogRows()
  const momentLogCount = countBy(rows, (item) => ['瞬间审核', '瞬间举报', '分享图任务', '榜单奖励'].includes(item.logType))
  return {
    slug: 'system-operation-logs',
    title: '后台操作日志',
    view: 'readonly',
    metrics: [
      { label: '操作日志数', value: formatNumber(rows.length), trend: `最近 ${rows[0]?.createdAt || '--'}`, tone: 'up' },
      { label: 'M4 动作日志', value: formatNumber(momentLogCount), trend: '审核、举报、分享图、奖励配置', tone: 'up' },
      { label: '目标对象数', value: formatNumber(new Set(rows.map((item) => item.targetId || item.targetOpenId || item.targetName).filter(Boolean)).size), trend: '内容与积分均可追溯', tone: 'up' },
      { label: '操作人', value: formatNumber(new Set(rows.map((item) => item.operator).filter(Boolean)).size), trend: '当前默认 admin-console', tone: 'up' },
    ],
    tables: [
      {
        title: '后台操作日志',
        columns: [
          { key: 'logType', label: '类型' },
          { key: 'operator', label: '操作人' },
          { key: 'action', label: '动作' },
          { key: 'targetId', label: '目标 ID' },
          { key: 'targetName', label: '目标名称' },
          { key: 'targetOpenId', label: 'OpenID' },
          { key: 'targetPhone', label: '手机号' },
          { key: 'detail', label: '详情' },
          { key: 'createdAt', label: '时间' },
        ],
        rows,
      },
    ],
  }
}

pageMap['content-moments-review'] = () => {
  const rows = buildMomentReviewRows()
  return {
    slug: 'content-moments-review',
    title: '精彩瞬间审核',
    view: 'readonly',
    metrics: [
      { label: '待审核', value: formatNumber(countBy(rows, (item) => item.reviewStatus === 'pending' || item.reviewStatus === '待审核')), trend: '等待后端 moments 数据接入', tone: 'up' },
      { label: '待二审', value: formatNumber(countBy(rows, (item) => item.secondaryReviewStatus === 'pending' || item.secondaryReviewStatus === '待二审')), trend: '公开传播前复核', tone: 'up' },
      { label: '有举报', value: formatNumber(countBy(rows, (item) => Number(item.reportCount) > 0)), trend: `队列 ${formatNumber(rows.length)} 条`, tone: 'up' },
      { label: '可上榜', value: formatNumber(countBy(rows, (item) => item.rankingEligible === '是')), trend: '以后端资格为准', tone: 'up' },
    ],
    tables: [
      {
        title: '瞬间审核队列',
        columns: [
          { key: 'thumbnailUrl', label: '缩略图', type: 'image' },
          { key: 'caption', label: '文案' },
          { key: 'tagsText', label: '标签' },
          { key: 'sessionName', label: '酒局' },
          { key: 'uploaderName', label: '上传者' },
          { key: 'nodeType', label: '节点类型' },
          { key: 'visibility', label: '可见范围' },
          { key: 'completionStatus', label: '补全状态' },
          { key: 'reviewStatus', label: '审核状态' },
          { key: 'secondaryReviewStatus', label: '二审状态' },
          { key: 'reportCount', label: '举报数' },
          { key: 'rankingEligible', label: '可上榜' },
          { key: 'createdAt', label: '创建时间' },
        ],
        rowActions: [
          {
            key: 'approve',
            label: '通过',
            endpoint: '/api/v1/admin/moments/:id/review',
            payloadAction: 'approve',
            reasonPrompt: '请输入通过审核的原因',
            visibleWhen: { field: 'reviewStatus', values: ['pending', 'rejected', '待审核', '已拒绝'] },
          },
          {
            key: 'hide',
            label: '隐藏',
            endpoint: '/api/v1/admin/moments/:id/review',
            payloadAction: 'hide',
            reasonPrompt: '请输入隐藏原因',
            visibleWhen: { field: 'reviewStatus', notValues: ['hidden', '已隐藏'] },
          },
          {
            key: 'require-resubmit',
            label: '要求重传',
            endpoint: '/api/v1/admin/moments/:id/require-resubmit',
            reasonPrompt: '请输入要求重传原因',
            visibleWhen: {
              all: [
                { field: 'reviewStatus', notValues: ['hidden', '已隐藏'] },
                { field: 'secondaryReviewStatus', notValues: ['require_resubmit', '待重传'] },
              ],
            },
          },
          {
            key: 'remove-ranking',
            label: '移出榜单',
            endpoint: '/api/v1/admin/moments/:id/review',
            payloadAction: 'remove_ranking',
            reasonPrompt: '请输入移出榜单候选原因',
            visibleWhen: {
              all: [
                { field: 'rankingEligible', equals: '是' },
                { field: 'reviewStatus', notValues: ['hidden', '已隐藏'] },
              ],
            },
          },
        ],
        rows,
      },
    ],
  }
}

pageMap['content-moment-reports'] = () => {
  const rows = buildMomentReportRows()
  return {
    slug: 'content-moment-reports',
    title: '瞬间举报处理',
    view: 'readonly',
    metrics: [
      { label: '举报总数', value: formatNumber(rows.length), trend: '等待举报接口接入', tone: 'up' },
      { label: '待处理', value: formatNumber(countBy(rows, (item) => String(item.status || '').includes('待'))), trend: '需运营处理', tone: 'up' },
      { label: '已处理', value: formatNumber(countBy(rows, (item) => String(item.status || '').includes('已'))), trend: '日志可追溯', tone: 'up' },
      { label: '涉及酒局', value: formatNumber(new Set(rows.map((item) => item.sessionName).filter(Boolean)).size), trend: '按 session 聚合', tone: 'up' },
    ],
    tables: [
      {
        title: '举报处理记录',
        columns: [
          { key: 'id', label: '举报 ID' },
          { key: 'momentId', label: '瞬间 ID' },
          { key: 'sessionName', label: '酒局' },
          { key: 'reporterName', label: '举报人' },
          { key: 'uploaderName', label: '上传者' },
          { key: 'reason', label: '举报原因' },
          { key: 'statusText', label: '处理状态' },
          { key: 'handler', label: '处理人' },
          { key: 'handledAt', label: '处理时间' },
          { key: 'createdAt', label: '举报时间' },
        ],
        rowActions: [
          {
            key: 'valid-hide',
            label: '有效并隐藏',
            endpoint: '/api/v1/admin/moment-reports/:id/handle',
            payloadAction: 'valid_hide',
            reasonPrompt: '请输入判定有效并隐藏内容的原因',
            visibleWhen: { field: 'status', values: ['pending', '待处理', ''] },
          },
          {
            key: 'invalid-keep',
            label: '无效保留',
            endpoint: '/api/v1/admin/moment-reports/:id/handle',
            payloadAction: 'invalid_keep',
            reasonPrompt: '请输入判定举报无效的原因',
            visibleWhen: { field: 'status', values: ['pending', '待处理', ''] },
          },
          {
            key: 'require-resubmit',
            label: '要求重传',
            endpoint: '/api/v1/admin/moment-reports/:id/handle',
            payloadAction: 'require_resubmit',
            reasonPrompt: '请输入要求上传者重传的原因',
            visibleWhen: { field: 'status', values: ['pending', '待处理', ''] },
          },
          {
            key: 'remove-ranking',
            label: '移出榜单',
            endpoint: '/api/v1/admin/moment-reports/:id/handle',
            payloadAction: 'remove_ranking',
            reasonPrompt: '请输入移出榜单候选的原因',
            visibleWhen: { field: 'status', values: ['pending', '待处理', ''] },
          },
        ],
        rows,
      },
    ],
  }
}

pageMap['growth-share-tasks'] = () => {
  const rows = buildShareImageTaskRows()
  return {
    slug: 'growth-share-tasks',
    title: '分享图任务',
    view: 'readonly',
    metrics: [
      { label: '任务总数', value: formatNumber(rows.length), trend: '等待 share task 接入', tone: 'up' },
      { label: '生成中', value: formatNumber(countBy(rows, (item) => item.status === 'pending' || item.status === 'processing')), trend: '后台静默处理', tone: 'up' },
      { label: '已生成', value: formatNumber(countBy(rows, (item) => item.status === 'ready')), trend: '可查看保存', tone: 'up' },
      { label: '失败', value: formatNumber(countBy(rows, (item) => item.status === 'failed')), trend: '后续接重试动作', tone: 'up' },
    ],
    tables: [
      {
        title: '分享图生成任务',
        columns: [
          { key: 'id', label: '任务 ID' },
          { key: 'sessionName', label: '酒局' },
          { key: 'briefId', label: '简报 ID' },
          { key: 'status', label: '状态' },
          { key: 'layoutMode', label: '布局' },
          { key: 'selectedNodeCount', label: '节点数' },
          { key: 'durationMs', label: '耗时 ms' },
          { key: 'retryCount', label: '重试' },
          { key: 'failedReason', label: '失败原因' },
          { key: 'imageUrl', label: '图片 URL' },
          { key: 'createdAt', label: '创建时间' },
          { key: 'finishedAt', label: '完成时间' },
        ],
        rowActions: [
          {
            key: 'retry',
            label: '重试',
            endpoint: '/api/v1/admin/share-image-tasks/:id/retry',
            reasonPrompt: '请输入重试原因',
            visibleWhen: { field: 'status', values: ['failed', 'expired'] },
          },
        ],
        rows,
      },
    ],
  }
}

pageMap['commerce-ranking-rewards'] = () => {
  const store = readStore()
  const momentsStore = readMomentsAdminStore()
  const sourceRules = momentsStore?.rankingRewardRules?.length ? momentsStore.rankingRewardRules : store.rankingRewardRules
  const rules = (sourceRules || []).map((item, index) => normalizeRankingRewardRule(item, index))
  return {
    slug: 'commerce-ranking-rewards',
    title: '榜单奖励配置',
    view: 'collection',
    metrics: [
      { label: '奖励规则', value: formatNumber(rules.length), trend: `启用 ${formatNumber(countBy(rules, (item) => item.enabled === 'true'))} 条`, tone: 'up' },
      { label: '覆盖榜单', value: formatNumber(new Set(rules.map((item) => item.category)).size), trend: 'M5 发奖前置配置', tone: 'up' },
      { label: '最高奖励', value: formatNumber(Math.max(0, ...rules.map((item) => Number(item.points) || 0))), trend: '积分', tone: 'up' },
      { label: '最近更新', value: rules.find((item) => item.updatedAt)?.updatedAt || '--', trend: '保存需写原因', tone: 'up' },
    ],
    pageActions: RANKING_REWARD_CATEGORIES.map((item) => ({
      key: `grant-${item.value}`,
      label: `发放${item.label}`,
      endpoint: '/api/v1/admin/ranking-rewards/grant',
      method: 'POST',
      body: {
        category: item.value,
      },
      confirm: `确认按当前 ${item.label} 榜单发放奖励？重复发放会被后端幂等跳过。`,
    })),
    collection: {
      key: 'rankingRewardRules',
      itemLabel: '奖励规则',
      fields: [
        { key: 'id', label: '规则 ID', type: 'text' },
        { key: 'category', label: '榜单分类', type: 'select', options: RANKING_REWARD_CATEGORY_OPTIONS },
        { key: 'enabled', label: '启用状态', type: 'select', options: TRUE_FALSE_OPTIONS },
        { key: 'rankStart', label: '起始名次', type: 'number' },
        { key: 'rankEnd', label: '结束名次', type: 'number' },
        { key: 'points', label: '奖励积分', type: 'number' },
        { key: 'effectiveAt', label: '生效时间', type: 'text' },
        { key: 'reason', label: '修改原因', type: 'textarea' },
      ],
      columns: [
        { key: 'categoryName', label: '榜单' },
        { key: 'enabled', label: '启用' },
        { key: 'rankStart', label: '起始' },
        { key: 'rankEnd', label: '结束' },
        { key: 'points', label: '积分' },
        { key: 'effectiveAt', label: '生效时间' },
        { key: 'reason', label: '修改原因' },
        { key: 'updatedAt', label: '更新时间' },
      ],
      items: rules,
    },
  }
}

const saveUserPointsCollection = (items = []) => {
  const contentStore = readContentStore()
  const adminStore = readStore()
  const socialStore = readSocialStore()
  const profileMap = new Map((socialStore.profiles || []).map((item) => [item.id, item]))
  const nextUserCommerce = {
    ...(contentStore.userCommerce || {}),
  }

  items.forEach((item) => {
    const profileId = String(item.id || '').trim()
    if (!profileId) {
      return
    }
    const currentState = nextUserCommerce[profileId] || createDefaultUserCommerceState()
    const currentPoints = Number(currentState.points || 0)
    const directPoints = Number(item.points)
    const requestedDelta =
      Number(item.adjustment || 0) || (Number.isFinite(directPoints) ? directPoints - currentPoints : 0)
    const nextPoints = Math.max(0, currentPoints + requestedDelta)
    const actualDelta = nextPoints - currentPoints
    const nextState = {
      ...currentState,
      points: nextPoints,
    }
    if (actualDelta !== 0) {
      nextState.pointsLedger = [
        {
          id: createId('admin-ledger'),
          title: item.adjustReason || `后台${actualDelta > 0 ? '加' : '减'}积分`,
          createdAt: iso(),
          delta: actualDelta,
          kind: 'admin-adjust',
          sourceId: 'admin-console',
        },
        ...(Array.isArray(currentState.pointsLedger) ? currentState.pointsLedger : []),
      ]
      const profile = profileMap.get(profileId)
      adminStore.operationLogs = Array.isArray(adminStore.operationLogs) ? adminStore.operationLogs : []
      adminStore.operationLogs.unshift({
        id: createId('admin-op'),
        operator: 'admin-console',
        action: actualDelta > 0 ? '增加用户积分' : '减少用户积分',
        targetId: profileId,
        targetName: profile?.name || profileId,
        targetPhone: profile?.phone || '',
        targetOpenId: profile?.wechatOpenId || '',
        detail: `${actualDelta > 0 ? '+' : ''}${actualDelta} 分${item.adjustReason ? `，原因：${item.adjustReason}` : ''}`,
        createdAt: iso(),
      })
    }
    nextUserCommerce[profileId] = nextState
  })

  contentStore.userCommerce = nextUserCommerce
  writeContentStore(contentStore)
  writeStore(adminStore)
}

const getPageData = (slug) => {
  const factory = pageMap[slug]
  if (!factory) {
    throw new Error('page not found')
  }
  return factory()
}

const saveCollectionArray = (items = [], fields = [], existingItems = []) => {
  const existingMap = new Map((existingItems || []).filter((item) => item && item.id).map((item) => [String(item.id), item]))
  return items.map((item, index) => {
    const baseId = item.id || createId(`item${index + 1}`)
    const next = { ...(existingMap.get(String(baseId)) || {}), id: baseId }
    fields.forEach((field) => {
      const value = item[field.key]
      next[field.key] = field.type === 'number' ? Number(value) || 0 : typeof value === 'string' ? value.trim() : value || ''
    })
    return next
  })
}

const assertRankingRewardRules = (rules = []) => {
  const byCategory = new Map()
  rules.forEach((rule) => {
    if (!String(rule.reason || '').trim()) {
      throw new Error('榜单奖励配置必须填写修改原因')
    }
    if (Number(rule.rankStart) > Number(rule.rankEnd)) {
      throw new Error('榜单奖励名次区间不合法')
    }
    const categoryRules = byCategory.get(rule.category) || []
    categoryRules.forEach((existed) => {
      const overlaps = Number(rule.rankStart) <= Number(existed.rankEnd) && Number(rule.rankEnd) >= Number(existed.rankStart)
      if (overlaps) {
        throw new Error(`${getRankingCategoryLabel(rule.category)} 的奖励名次区间不能重叠`)
      }
    })
    categoryRules.push(rule)
    byCategory.set(rule.category, categoryRules)
  })
}

const saveRankingRewardRules = (adminStore, items = []) => {
  const fields = pageMap['commerce-ranking-rewards']().collection.fields
  const nextRules = saveCollectionArray(items, fields, adminStore.rankingRewardRules).map((item, index) => ({
    ...normalizeRankingRewardRule(item, index),
    updatedAt: iso(),
  }))
  assertRankingRewardRules(nextRules)
  const before = JSON.stringify(adminStore.rankingRewardRules || [])
  const after = JSON.stringify(nextRules)
  adminStore.rankingRewardRules = nextRules
  const momentsStore = readMomentsAdminStore()
  if (momentsStore) {
    momentsStore.rankingRewardRules = nextRules
    writeMomentsAdminStore(momentsStore)
  }
  if (before !== after) {
    const changedCategories = [...new Set(nextRules.map((item) => getRankingCategoryLabel(item.category)))].join('、')
    appendAdminOperationLog(adminStore, {
      action: '保存榜单奖励配置',
      targetId: 'commerce-ranking-rewards',
      targetName: '榜单奖励配置',
      detail: `更新 ${nextRules.length} 条规则；覆盖：${changedCategories}`,
    })
  }
}

const refundMomentNominationsAfterRankingRemoval = ({ momentId, action, reason, operator }) => {
  if (!['hide', 'reject', 'require_resubmit', 'remove_ranking', 'valid_hide'].includes(String(action || '').trim())) {
    return {
      refundedCount: 0,
      refundedPoints: 0,
      nominations: [],
    }
  }
  const { refundMomentNominationsForMoment } = require('./moments')
  return refundMomentNominationsForMoment({
    momentId,
    reason: reason || `admin ${action}`,
    operator,
  })
}

const applyAdminMomentReviewState = (moment = {}, action = '') => {
  const next = {
    ...moment,
    updatedAt: iso(),
  }
  if (action === 'approve' || action === 'approve_secondary') {
    next.reviewStatus = 'approved'
    next.secondaryReviewStatus = 'approved'
  } else if (action === 'approve_primary') {
    next.reviewStatus = 'approved'
  } else if (action === 'hide') {
    next.reviewStatus = 'hidden'
    next.rankingEligible = false
    next.rewardEligible = false
  } else if (action === 'reject') {
    next.reviewStatus = 'rejected'
    next.secondaryReviewStatus = 'rejected'
    next.rankingEligible = false
    next.rewardEligible = false
  } else if (action === 'require_resubmit') {
    next.secondaryReviewStatus = 'require_resubmit'
    next.completionStatus = 'needs_media'
    next.rankingEligible = false
    next.rewardEligible = false
  } else if (action === 'remove_ranking') {
    next.secondaryReviewStatus = 'rejected'
    next.rankingEligible = false
    next.rewardEligible = false
  } else {
    throw new Error('unsupported moment review action')
  }
  return next
}

const getReportStatusText = (action = '') => {
  if (action === 'valid_hide') return '有效，已隐藏内容'
  if (action === 'invalid_keep') return '无效，保留内容'
  if (action === 'require_resubmit') return '有效，要求重传'
  if (action === 'remove_ranking') return '有效，移出榜单候选'
  return '已处理'
}

const applyMomentReportActionToMoment = (moment = {}, action = '') => {
  if (action === 'valid_hide') {
    return applyAdminMomentReviewState(moment, 'hide')
  }
  if (action === 'require_resubmit') {
    return applyAdminMomentReviewState(moment, 'require_resubmit')
  }
  if (action === 'remove_ranking') {
    return applyAdminMomentReviewState(moment, 'remove_ranking')
  }
  return {
    ...moment,
    updatedAt: iso(),
  }
}

const handleManagedMomentReport = ({ reportId, action, reason, operator = 'admin-console' } = {}) => {
  const normalizedReportId = String(reportId || '').trim()
  const normalizedAction = String(action || '').trim()
  const normalizedReason = String(reason || '').trim()
  if (!normalizedReportId) {
    throw new Error('reportId required')
  }
  if (!normalizedReason) {
    throw new Error('report reason required')
  }
  if (!['valid_hide', 'invalid_keep', 'require_resubmit', 'remove_ranking'].includes(normalizedAction)) {
    throw new Error('unsupported moment report action')
  }
  const momentsStore = readMomentsAdminStore()
  if (!momentsStore) {
    throw new Error('moments store not available')
  }
  const reportIndex = (momentsStore.momentReports || []).findIndex((item) => String(item.id || '').trim() === normalizedReportId)
  if (reportIndex === -1) {
    throw new Error('moment report not found')
  }
  const beforeReport = momentsStore.momentReports[reportIndex]
  const momentId = String(beforeReport.momentId || '').trim()
  const momentIndex = (momentsStore.momentRecords || []).findIndex((item) => String(item.id || '').trim() === momentId)
  const beforeMoment = momentIndex >= 0 ? momentsStore.momentRecords[momentIndex] : null
  const handledAt = iso()
  const nextReport = {
    ...beforeReport,
    status: 'handled',
    statusText: getReportStatusText(normalizedAction),
    action: normalizedAction,
    note: normalizedReason,
    handler: operator,
    handledAt,
    updatedAt: handledAt,
  }
  momentsStore.momentReports[reportIndex] = nextReport
  let nextMoment = beforeMoment
  if (beforeMoment && normalizedAction !== 'invalid_keep') {
    nextMoment = applyMomentReportActionToMoment(beforeMoment, normalizedAction)
    momentsStore.momentRecords[momentIndex] = nextMoment
  }
  writeMomentsAdminStore(momentsStore)
  const refund = nextMoment
    ? refundMomentNominationsAfterRankingRemoval({
        momentId,
        action: normalizedAction,
        reason: normalizedReason,
        operator,
      })
    : {
        refundedCount: 0,
        refundedPoints: 0,
        nominations: [],
      }

  const adminStore = readStore()
  appendAdminOperationLog(adminStore, {
    operator,
    action: `处理精彩瞬间举报：${normalizedAction}`,
    targetId: normalizedReportId,
    targetName: momentId || normalizedReportId,
    detail: `举报 ${normalizedReportId} -> ${nextReport.statusText}；原因：${normalizedReason}`,
  })
  writeStore(adminStore)
  return {
    refund,
    report: nextReport,
    moment: nextMoment,
  }
}

const reviewManagedMoment = ({ momentId, action, reason, operator = 'admin-console' } = {}) => {
  const normalizedMomentId = String(momentId || '').trim()
  const normalizedAction = String(action || '').trim()
  const normalizedReason = String(reason || '').trim()
  if (!normalizedMomentId) {
    throw new Error('momentId required')
  }
  if (!normalizedReason) {
    throw new Error('review reason required')
  }
  const momentsStore = readMomentsAdminStore()
  if (!momentsStore) {
    throw new Error('moments store not available')
  }
  const index = (momentsStore.momentRecords || []).findIndex((item) => String(item.id || '').trim() === normalizedMomentId)
  if (index === -1) {
    throw new Error('moment not found')
  }
  const before = momentsStore.momentRecords[index]
  const next = applyAdminMomentReviewState(before, normalizedAction)
  momentsStore.momentRecords[index] = next
  writeMomentsAdminStore(momentsStore)
  const refund = refundMomentNominationsAfterRankingRemoval({
    momentId: normalizedMomentId,
    action: normalizedAction,
    reason: normalizedReason,
    operator,
  })

  const adminStore = readStore()
  appendAdminOperationLog(adminStore, {
    operator,
    action: `审核精彩瞬间：${normalizedAction}`,
    targetId: normalizedMomentId,
    targetName: before.caption || before.timelineTitle || normalizedMomentId,
    detail: `状态 ${before.reviewStatus || ''}/${before.secondaryReviewStatus || ''} -> ${next.reviewStatus || ''}/${next.secondaryReviewStatus || ''}；原因：${normalizedReason}`,
  })
  writeStore(adminStore)
  return {
    refund,
    moment: next,
  }
}

const retryManagedShareImageTask = ({ taskId, reason, operator = 'admin-console' } = {}) => {
  const normalizedTaskId = String(taskId || '').trim()
  const normalizedReason = String(reason || '').trim()
  if (!normalizedTaskId) {
    throw new Error('taskId required')
  }
  if (!normalizedReason) {
    throw new Error('retry reason required')
  }
  const momentsStore = readMomentsAdminStore()
  if (!momentsStore) {
    throw new Error('moments store not available')
  }
  const index = (momentsStore.shareImageTasks || []).findIndex((item) => String(item.id || '').trim() === normalizedTaskId)
  if (index === -1) {
    throw new Error('share task not found')
  }
  const before = momentsStore.shareImageTasks[index]
  if (!['failed', 'expired'].includes(String(before.status || '').trim())) {
    throw new Error('only failed or expired share tasks can be retried')
  }
  const next = {
    ...before,
    status: 'pending',
    failedReason: '',
    retryCount: Number(before.retryCount || 0) + 1,
    updatedAt: iso(),
  }
  momentsStore.shareImageTasks[index] = next
  writeMomentsAdminStore(momentsStore)

  const adminStore = readStore()
  appendAdminOperationLog(adminStore, {
    operator,
    action: '重试分享图任务',
    targetId: normalizedTaskId,
    targetName: normalizedTaskId,
    detail: `状态 ${before.status || ''} -> pending；原因：${normalizedReason}`,
  })
  writeStore(adminStore)
  return {
    task: next,
  }
}

const grantRankingRewardsByAdmin = ({ category, limit, operator = 'admin-console' } = {}) => {
  const { grantRankingRewards } = require('./moments')
  const result = grantRankingRewards({ category, limit, operator })
  const adminStore = readStore()
  appendAdminOperationLog(adminStore, {
    operator,
    action: '发放榜单奖励',
    targetId: `ranking-rewards:${result.category}:${result.date}`,
    targetName: getRankingCategoryLabel(result.category),
    detail: `发放 ${result.grantedCount} 条，跳过 ${result.skippedCount} 条，合计 ${result.totalPoints} 积分`,
  })
  writeStore(adminStore)
  return result
}

const savePageData = (slug, payload = {}) => {
  const adminStore = readStore()

  if (slug === 'content-home-ops') {
    updateHomeConfig({
      hero: {
        title: payload.data.heroTitle,
        subtitle: payload.data.heroSubtitle,
        imageUrl: payload.data.heroImageUrl,
      },
      judge: {
        title: payload.data.judgeHeroTitle,
        subtitle: payload.data.judgeHeroSubtitle,
        imageUrl: payload.data.judgeHeroImageUrl,
      },
      banner: {
        title: payload.data.bannerTitle,
        imageUrl: payload.data.bannerImageUrl,
      },
      quickTools: parseQuickToolsText(payload.data.quickToolsText),
    })
    adminStore.toolsHero = {
      title: String(payload.data.toolsHeroTitle || '').trim(),
      subtitle: String(payload.data.toolsHeroSubtitle || '').trim(),
      imageUrl: String(payload.data.toolsHeroImageUrl || '').trim(),
    }
    writeStore(adminStore)
    return getPageData(slug)
  }

  if (slug === 'content-templates') {
    updateTemplateConfig({
      filters: payload.collections.filters,
      templates: payload.collections.templates,
      unlockCard: {
        title: payload.meta.unlockTitle,
        progressText: payload.meta.unlockProgressText,
      },
    })
    return getPageData(slug)
  }

  if (slug === 'content-question-bank') {
    adminStore.questionBank = saveCollectionArray(payload.items, pageMap[slug]().collection.fields, adminStore.questionBank)
    writeStore(adminStore)
    return getPageData(slug)
  }

  if (slug === 'content-share-assets') {
    adminStore.shareAssets = saveCollectionArray(payload.items, pageMap[slug]().collection.fields, adminStore.shareAssets)
    writeStore(adminStore)
    return getPageData(slug)
  }

  if (slug === 'content-tools-ops') {
    adminStore.toolsCatalog = saveCollectionArray(payload.items, pageMap[slug]().collection.fields, adminStore.toolsCatalog)
    writeStore(adminStore)
    return getPageData(slug)
  }

  if (slug === 'user-profiles') {
    const socialStore = readSocialStore()
    const nextProfiles = []
    const nextUserOps = []
    ;(payload.items || []).forEach((item) => {
      const hasVisibleIdentity =
        String(item.name || '').trim() ||
        String(item.phone || '').trim()
      if (!hasVisibleIdentity) {
        return
      }
      const existed = socialStore.profiles.find((profile) => profile.id === item.id) || { id: item.id }
      nextProfiles.push(
        ensureProfile({
          ...existed,
          id: item.id,
          name: item.name,
          phone: existed.phone || '',
          wechatOpenId: existed.wechatOpenId || '',
          wechatUnionId: existed.wechatUnionId || '',
          identityTag: item.identityTag,
          signature: existed.signature || '',
          avatarUrl: item.avatarUrl || existed.avatarUrl || '',
          phoneBoundAt: existed.phoneBoundAt || '',
          lastLoginAt: existed.lastLoginAt || '',
          loginCount: existed.loginCount || 0,
        }),
      )
      nextUserOps.push({
        id: item.id,
        status: item.status || '普通',
        tags: String(item.tagsText || '')
          .split(/[、,，]/)
          .map((tag) => tag.trim())
          .filter(Boolean),
        note: item.note || '',
      })
    })
    adminStore.userOps = nextUserOps
    writeStore(adminStore)
    writeSocialStore({
      ...socialStore,
      profiles: nextProfiles,
    })
    return getPageData(slug)
  }

  if (slug === 'sessions') {
    adminStore.liveSessions = saveCollectionArray(payload.items, pageMap[slug]().collection.fields, adminStore.liveSessions)
    writeStore(adminStore)
    return getPageData(slug)
  }

  if (slug === 'reports') {
    adminStore.reports = saveCollectionArray(payload.items, pageMap[slug]().collection.fields, adminStore.reports)
    writeStore(adminStore)
    return getPageData(slug)
  }

  if (slug === 'commerce-points') {
    updatePointsConfig({
      bannerImageUrl: payload.meta.bannerImageUrl || '',
      tasks: payload.collections.tasks,
      rewards: payload.collections.rewards,
    })
    saveUserPointsCollection(payload.collections.userPoints || [])
    return getPageData(slug)
  }

  if (slug === 'commerce-membership') {
    if (payload?.meta && Object.prototype.hasOwnProperty.call(payload.meta, 'membershipEnabled')) {
      adminStore.membershipEnabled = parseBoolean(payload.meta.membershipEnabled, adminStore.membershipEnabled ?? true)
    }
    adminStore.membershipPlans = saveCollectionArray(payload.collections.membershipPlans, pageMap[slug]().collections[0].fields, adminStore.membershipPlans)
    adminStore.membershipBenefits = saveCollectionArray(payload.collections.membershipBenefits, pageMap[slug]().collections[1].fields, adminStore.membershipBenefits)
    writeStore(adminStore)
    return getPageData(slug)
  }

  if (slug === 'commerce-merchants') {
    adminStore.merchants = saveCollectionArray(payload.items, pageMap[slug]().collection.fields, adminStore.merchants)
    writeStore(adminStore)
    return getPageData(slug)
  }

  if (slug === 'commerce-ranking-rewards') {
    saveRankingRewardRules(adminStore, payload.items || [])
    writeStore(adminStore)
    return getPageData(slug)
  }

  if (slug === 'system-permissions') {
    adminStore.adminUsers = (payload.collections.adminUsers || []).map((item) => {
      const existed = adminStore.adminUsers.find((user) => user.id === item.id)
      return {
        ...(existed || {}),
        id: item.id || createId('admin'),
        username: item.username,
        name: item.name,
        roleId: item.roleId,
        status: parseStatus(item.status, 'active'),
        passwordHash: existed?.passwordHash || hashPassword('Admin@123456'),
        lastLoginAt: existed?.lastLoginAt || '',
        failedLoginCount: Math.max(0, Number(existed?.failedLoginCount) || 0),
        lockedUntil: existed?.lockedUntil || '',
        lastFailedLoginAt: existed?.lastFailedLoginAt || '',
        passwordUpdatedAt: existed?.passwordUpdatedAt || '',
      }
    })
    adminStore.roles = (payload.collections.roles || []).map((item) => ({
      id: item.id || createId('role'),
      name: item.name,
      scope: item.scope,
      permissions: String(item.permissionsText || '')
        .split(',')
        .map((permission) => permission.trim())
        .filter(Boolean),
      status: parseStatus(item.status, 'active'),
    }))
    writeStore(adminStore)
    return getPageData(slug)
  }

  throw new Error('page is read only')
}

module.exports = {
  createManagedSession,
  deleteManagedSession,
  endManagedSession,
  finishManagedSession,
  getAdminStore: readStore,
  getManagedReportById,
  listManagedReports,
  getUserJudgeStats,
  getManagedSessionById,
  getManagedSessionByInviteCode,
  flushAdminStore: storeAccessor.flush,
  initAdminStore: storeAccessor.init,
  grantRankingRewardsByAdmin,
  joinManagedSession,
  kickManagedSessionMember,
  getPageData,
  getSession,
  handleManagedMomentReport,
  loginAdmin,
  logoutAdmin,
  retryManagedShareImageTask,
  resetAdminPassword,
  reviewManagedMoment,
  getSessionContactsByProfile,
  savePageData,
  trackAnalyticsEvent,
  updateManagedSession,
  writeAdminStore: writeStore,
}
