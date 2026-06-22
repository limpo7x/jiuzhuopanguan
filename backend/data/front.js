const { getAdminStore, getManagedSessionById, getManagedSessionByInviteCode } = require('./admin')
const { getCompliance, getToolHistory } = require('./content')
const { getPublicSessionShareSummary } = require('./moments')
const { listProfiles } = require('./social')

const toText = (value, fallback = '') => String(value || fallback || '').trim()
const CDN_BASE_URL = 'https://cdn.pomer.cn'
const toPublicAssetUrl = (value = '') => {
  const text = toText(value)
  if (text.startsWith('/static/')) {
    return `${CDN_BASE_URL}${text}`
  }
  return text
}
const normalizeTemplateImageUrl = (value = '') => {
  const text = toText(value)
  if (/^https?:\/\/(?:127\.0\.0\.1(?::\d+)?\/__store__|store\/)/i.test(text) || /\/__store__\//i.test(text) || /\/__tmp__\//i.test(text)) {
    return ''
  }
  return text.replace(/^\/static\/templates\/(.+)\.svg$/i, '/static/templates/$1.png')
}

const TOOL_ID_MAP = {
  'tool-compress': 'image-compress',
  'tool-json': 'json',
  'tool-qr': 'qr-code',
  'tool-loan': 'loan-calc',
  'tool-currency': 'currency',
  'tool-unit': 'unit',
  'tool-9-grid': 'nine-grid',
  'tool-watermark': 'watermark',
}

const TOOL_CATEGORY_ID_MAP = {
  分享生成: 'share',
  图片工具: 'image',
  图片处理: 'image',
  开发工具: 'dev',
  计算工具: 'calc',
}

const TOOL_CATEGORY_LABEL_MAP = {
  all: '全部',
  calc: '计算工具',
  dev: '开发工具',
  image: '图片处理',
  share: '分享生成',
}

const normalizeToolId = (item = {}) => TOOL_ID_MAP[item.id] || item.id || ''
const normalizeToolCategoryId = (value) => TOOL_CATEGORY_ID_MAP[value] || ''
const isEnabledTool = (item) => !String(item?.status || '').includes('停用')
const isHotTool = (item) => String(item?.isHot || '').includes('是')
const supportsPlacement = (item, placement) => {
  const normalized = String(item?.placement || 'tools').trim().toLowerCase()
  return normalized === 'both' || normalized === placement
}
const sortTools = (items = []) =>
  [...items].sort((left, right) => {
    const orderDiff = (Number(left.sortOrder) || 0) - (Number(right.sortOrder) || 0)
    return orderDiff || (Number(right.usageCount) || 0) - (Number(left.usageCount) || 0)
  })

const buildProfileAvatarMap = () =>
  new Map((listProfiles() || []).map((item) => [toText(item.id), toText(item.avatarUrl)]).filter((item) => item[0]))

const getJoinedCount = (session, playerCount) => {
  const state = String(session?.state || '')
  if (state.includes('已结束') || state.includes('进行中')) {
    return playerCount
  }
  if (state.includes('等待')) {
    return Math.max(2, Math.min(playerCount - 1, 4))
  }
  return Math.max(2, Math.min(playerCount, 4))
}

const buildSessionPlayers = (playerCount = 6) =>
  Array.from({ length: Math.max(playerCount, 2) }, (_, index) => ({
    avatarUrl: '',
    name: SESSION_PLAYER_NAMES[index % SESSION_PLAYER_NAMES.length],
  }))

const buildMembersFromSession = (session) => {
  const members = Array.isArray(session?.members) ? session.members : []
  const profileAvatarMap = buildProfileAvatarMap()
  return members.map((item) => ({
    avatarUrl: toText(item.avatarUrl || profileAvatarMap.get(toText(item.profileId))),
    clearedCount: Math.max(0, Number(item.clearedCount) || 0),
    debtCount: Math.max(0, Number(item.debtCount) || 0),
    drinkCount: Math.max(0, Number(item.drinkCount) || 0),
    meta: toText(item.meta),
    name: toText(item.name),
    profileId: toText(item.profileId),
    status: toText(item.status),
    wheelHistory: Array.isArray(item.wheelHistory)
      ? item.wheelHistory
          .map((historyItem) => ({
            createdAt: toText(historyItem?.createdAt),
            label: toText(historyItem?.label),
            text: toText(historyItem?.text),
            type: toText(historyItem?.type),
          }))
          .filter((historyItem) => historyItem.text)
      : [],
  }))
}

const isEndedSession = (session = {}) => String(session?.state || session?.status || '').includes('结束')

const pickLiveSession = (sessions = []) =>
  sessions.find((item) => String(item.state || item.status || '').includes('进行中')) ||
  sessions.find((item) => String(item.state || item.status || '').includes('等待')) ||
  sessions.find((item) => !isEndedSession(item)) ||
  null

const formatLiveSession = (session = {}) => {
  const playerCount = Math.max(0, Number(session?.players) || Number(session?.playerCount) || 0)
  const memberPlayers = buildMembersFromSession(session)
  const joinedPlayers = memberPlayers.filter((item) => item.status === '已加入')
  return {
    createdAt: toText(session?.createdAt),
    coverPhotoUrl: '',
    endedAt: toText(session?.endedAt),
    hostAvatarUrl: toText(session?.hostAvatarUrl || joinedPlayers.find((item) => item.profileId === toText(session?.hostProfileId))?.avatarUrl),
    hostName: toText(session?.hostName),
    hostProfileId: toText(session?.hostProfileId),
    id: toText(session?.id),
    inviteCode: toText(session?.inviteCode),
    joinedCount: Number(session?.joinedCount) || joinedPlayers.length,
    joinedPlayers: joinedPlayers.slice(0, playerCount || joinedPlayers.length),
    joinStatusPlayers: memberPlayers.slice(0, playerCount || memberPlayers.length),
    playerCount,
    sessionName: toText(session?.name || session?.sessionName),
    source: toText(session?.source),
    stateText: toText(session?.state),
    status: toText(session?.status),
    subtitle: '',
    templateImageUrl: normalizeTemplateImageUrl(session?.templateImageUrl),
    templateName: toText(session?.template || session?.templateName),
    title: '',
    updatedAt: toText(session?.updatedAt),
  }
}

const getLiveSessionConfig = (sessionId, inviteCode) => {
  const store = getAdminStore()
  const session = sessionId
    ? getManagedSessionById(String(sessionId))
    : inviteCode
      ? getManagedSessionByInviteCode(String(inviteCode))
      : pickLiveSession(store.liveSessions)
  const liveSession = formatLiveSession(session || {})
  const shareSummary = session?.id ? getPublicSessionShareSummary({ sessionId: session.id, inviteCode: session.inviteCode }) : null
  return shareSummary
    ? {
        ...liveSession,
        ...shareSummary,
      }
    : liveSession
}

const buildReportEvents = (report) => [report?.highlight1, report?.highlight2, report?.highlight3].filter(Boolean).map((text) => ({ text }))

const buildReportRanks = () => []

const getFeaturedReport = () => {
  const store = getAdminStore()
  const compliance = getCompliance()
  const report = (store.reports || [])[0] || null
  const session = pickLiveSession(store.liveSessions || [])
  const sessionName = report?.name ? String(report.name).replace(/战报$/, '') : toText(session?.name)
  return {
    events: buildReportEvents(report),
    metaText: sessionName ? `${sessionName} · ${Number(report?.playerCount) || Number(session?.players) || 0}人局` : '',
    notice: toText(compliance.copy),
    reportId: toText(report?.id),
    ranks: buildReportRanks(),
    replayRate: toText(report?.replayRate),
    sessionName,
    shareRate: toText(report?.shareRate),
    title: toText(report?.title),
  }
}

const listFrontendTools = () => {
  const store = getAdminStore()
  const toolsHero = store.toolsHero || {}
  const enabledTools = sortTools((store.toolsCatalog || []).filter(isEnabledTool))
  const tools = enabledTools.map((item) => {
    const toolId = normalizeToolId(item)
    const categoryId = normalizeToolCategoryId(item.category)
    return {
      id: toolId,
      rawId: item.id,
      name: toText(item.name),
      categoryId,
      categoryName: TOOL_CATEGORY_LABEL_MAP[categoryId] || toText(item.category),
      target: toText(item.target),
      usageCount: Number(item.usageCount) || 0,
      favoriteRate: toText(item.favoriteRate),
      status: toText(item.status),
      sortOrder: Number(item.sortOrder) || 0,
      isHot: isHotTool(item) ? '是' : '否',
      placement: toText(item.placement),
      iconClass: '',
      toneClass: '',
      imageUrl: toPublicAssetUrl(item.imageUrl),
      heroImage: toPublicAssetUrl(item.heroImage),
      meta: [toText(item.target), toText(item.favoriteRate) ? `收藏率 ${toText(item.favoriteRate)}` : ''].filter(Boolean).join(' · '),
    }
  })
  const categories = [
    { id: 'all', name: TOOL_CATEGORY_LABEL_MAP.all },
    ...Array.from(new Set(tools.map((item) => item.categoryId))).map((categoryId) => ({
      id: categoryId,
      name: TOOL_CATEGORY_LABEL_MAP[categoryId] || categoryId,
    })),
  ]
  return {
    hero: {
      imageUrl: toPublicAssetUrl(toolsHero.imageUrl),
      subtitle: toText(toolsHero.subtitle),
      title: toText(toolsHero.title),
    },
    categories,
    popularTools: sortTools(tools.filter((item) => item.isHot === '是')).slice(0, 4),
    tools,
  }
}

const listUsageRecords = () => {
  const history = getToolHistory()
  return history.slice(0, 6).map((item) => ({
    name: toText(item.name),
    meta: `${item.usedAt || '\u4eca\u5929'} \u00b7 ${item.category || '\u5de5\u5177'}`,
    tag: toText(item.category),
    route: item.id ? `/pages/tool-detail/index?id=${encodeURIComponent(normalizeToolId(item))}` : '/pages/tools/index',
  }))
}

const isEnabledRecord = (item) => !['\u4e0b\u7ebf', '\u505c\u7528', 'disabled', 'offline'].some((word) => String(item?.status || '').includes(word))

const getShareConfig = () => {
  const store = getAdminStore()
  const compliance = getCompliance()
  const liveSession = getLiveSessionConfig()
  const assets = (store.shareAssets || []).filter(isEnabledRecord)
  const poster = assets.find((item) => ['\u6218\u62a5', '\u5206\u4eab'].some((word) => String(item.assetType || item.scene || '').includes(word))) || null
  const invite = assets.find((item) => ['\u9080\u8bf7', '\u6d77\u62a5'].some((word) => String(item.assetType || item.scene || '').includes(word))) || null
  return {
    notice: toText(compliance.copy),
    poster: {
      imageUrl: toText(poster?.imageUrl),
      title: toText(poster?.name),
    },
    preview: {
      inviteCode: toText(liveSession.inviteCode),
      imageUrl: toText(invite?.imageUrl),
      title: toText(invite?.name),
    },
    shareItems: assets.map((item) => ({
      id: toText(item.id),
      name: toText(item.name),
      scene: toText(item.scene),
      assetType: toText(item.assetType),
      imageUrl: toText(item.imageUrl),
      status: toText(item.status),
    })).filter((item) => item.id && item.name),
    helperScenes: {},
    performance: {
      bestOpenRate: '',
      bestReturnRate: '',
    },
  }
}

const getQuestionBankConfig = (type = '') => {
  const store = getAdminStore()
  const normalizedType = String(type || '').trim()
  const onlineQuestions = (store.questionBank || []).filter(
    (item) => String(item.status || '').includes('\u4e0a\u7ebf') && (!normalizedType || String(item.type || '').trim() === normalizedType),
  )
  return {
    questions: onlineQuestions.map((item, index) => ({
      difficulty: item.difficulty || '',
      id: item.id || `question-${index + 1}`,
      riskLevel: item.riskLevel || '',
      text: item.content || '',
      tag: [item.type, item.difficulty, item.riskLevel].filter(Boolean).join(' · '),
      template: item.template || '',
      type: item.type || '',
    })),
  }
}

const getMerchantPartnersConfig = () => {
  const store = getAdminStore()
  const merchants = (store.merchants || []).filter(isEnabledRecord)
  const categories = [...new Set(merchants.map((item) => item.category).filter(Boolean))]
  return {
    categories: categories.slice(0, 4).map((category) => ({
      name: category,
      iconClass: '',
      toneClass: '',
    })),
    shops: merchants.map((item) => ({
      id: toText(item.id),
      imageUrl: toText(item.imageUrl),
      meta: [toText(item.category), item.claimCount ? '\u9886\u53d6 ' + item.claimCount : '', item.verifyRate ? '\u6838\u9500 ' + item.verifyRate : '', toText(item.status)].filter(Boolean).join(' \u00b7 '),
      name: toText(item.name),
      status: toText(item.status),
    })).filter((item) => item.id && item.name),
    safeBack: merchants
      .filter((item) => ['\u5b89\u5168', '\u8fd4\u573a', '\u4ee3\u9a7e', '\u9910\u996e'].some((word) => String(item.category || '').includes(word) || String(item.name || '').includes(word)))
      .slice(0, 3)
      .map((item) => ({
        name: toText(item.name),
        iconClass: '',
        toneClass: '',
      })),
    notice: 'merchant data from admin config',
  }
}

module.exports = {
  getFeaturedReport,
  getLiveSessionConfig,
  getMerchantPartnersConfig,
  getQuestionBankConfig,
  getShareConfig,
  listFrontendTools,
  listUsageRecords,
}
