const { getAdminStore, getManagedSessionById, getManagedSessionByInviteCode } = require('./admin')
const { getCompliance, getToolHistory } = require('./content')

const emptyImage = () => ''
const toText = (value, fallback = '') => String(value || fallback || '').trim()
const toNumber = (value, fallback = 0) => Number(value) || fallback

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

const TOOL_VISUALS = {
  currency: { iconClass: 'tools-icon-currency', toneClass: 'tools-tile-green' },
  'image-compress': { iconClass: 'tools-icon-compress', toneClass: '' },
  json: { iconClass: 'tools-icon-code', toneClass: 'tools-tile-blue' },
  'loan-calc': { iconClass: 'tools-icon-home', toneClass: '' },
  'nine-grid': { iconClass: 'tools-icon-grid', toneClass: 'tools-tile-blue' },
  'qr-code': { iconClass: 'tools-icon-qr', toneClass: '' },
  'text-count': { iconClass: 'tools-icon-text', toneClass: '' },
  unit: { iconClass: 'tools-icon-scale', toneClass: 'tools-tile-green' },
  watermark: { iconClass: 'tools-icon-eraser', toneClass: '' },
}

const MERCHANT_ICON_MAP = {
  代驾: 'merchant-icon-taxi',
  夜宵: 'merchant-icon-food',
  娱乐: 'merchant-icon-mic',
}

const MERCHANT_TONE_MAP = {
  代驾: 'merchant-tile-blue',
  夜宵: 'merchant-tile-green',
  娱乐: '',
}

const SHARE_ICON_MAP = {
  分享码: 'share-icon-download',
  战报海报: 'share-icon-wechat',
  邀局卡: 'share-icon-group',
}

const SESSION_PLAYER_NAMES = ['阿浩', '小熊', 'Mika', '可可', '阿乐', 'Nina', '老白', '七七']

const normalizeToolId = (item = {}) => TOOL_ID_MAP[item.id] || item.id || 'image-compress'
const normalizeToolCategoryId = (value) => TOOL_CATEGORY_ID_MAP[value] || 'share'
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

const deriveInviteCode = (id = 'session') => {
  const seed = String(id).replace(/[^a-z0-9]/gi, '').toUpperCase()
  return `${seed.slice(-2).padStart(2, 'A')}7K9Q`
}

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

const buildMembersFromSession = (session, playerCount) => {
  const members = Array.isArray(session?.members) ? session.members : []
  if (!members.length) {
    return buildSessionPlayers(playerCount).map((item, index) => ({
      ...item,
      clearedCount: 0,
      debtCount: 0,
      drinkCount: 0,
      meta: '',
      profileId: '',
      status: index < getJoinedCount(session, playerCount) ? '已加入' : '待加入',
      wheelHistory: [],
    }))
  }
  return members.map((item, index) => ({
    avatarUrl: '',
    clearedCount: Math.max(0, Number(item.clearedCount) || 0),
    debtCount: Math.max(0, Number(item.debtCount) || 0),
    drinkCount: Math.max(0, Number(item.drinkCount) || 0),
    meta: item.meta || '',
    name: item.name || SESSION_PLAYER_NAMES[index % SESSION_PLAYER_NAMES.length],
    profileId: item.profileId || '',
    status: item.status || (item.isHost ? '已加入' : '待加入'),
    wheelHistory: Array.isArray(item.wheelHistory)
      ? item.wheelHistory
          .map((historyItem) => ({
            createdAt: historyItem?.createdAt || '',
            label: historyItem?.label || '',
            text: historyItem?.text || '',
            type: historyItem?.type || '',
          }))
          .filter((historyItem) => historyItem.text)
      : [],
  }))
}

const pickLiveSession = (sessions = []) =>
  sessions.find((item) => String(item.state || '').includes('等待')) ||
  sessions.find((item) => String(item.state || '').includes('进行中')) ||
  sessions[0] ||
  null

const formatLiveSession = (session) => {
  const playerCount = Math.max(2, Number(session?.players) || Number(session?.playerCount) || 6)
  const memberPlayers = buildMembersFromSession(session, playerCount)
  const joinedPlayers = memberPlayers.filter((item) => item.status === '已加入')
  const joinedCount = Math.min(playerCount, joinedPlayers.length || getJoinedCount(session, playerCount))
  const stateText = session?.state || '等待开局'
  return {
    hostAvatarUrl: '',
    hostName: session?.hostName || '发起人',
    hostProfileId: session?.hostProfileId || memberPlayers.find((item) => item.profileId)?.profileId || '',
    id: session?.id || '',
    inviteCode: session?.inviteCode || deriveInviteCode(session?.id),
    joinedCount,
    joinedPlayers: joinedPlayers.slice(0, playerCount),
    joinStatusPlayers: memberPlayers.slice(0, playerCount),
    playerCount,
    sessionName: session?.name || session?.sessionName || '今晚酒局',
    source: session?.source || '好友邀请',
    stateText,
    status: session?.status || '正常',
    subtitle: String(stateText).includes('进行中') ? '本局正在进行中' : '人齐后即可进入本局',
    templateName: session?.template || session?.templateName || '经典玩法',
    title: String(stateText).includes('进行中') ? '本局进行中' : '组局中，等人齐',
  }
}

const getLiveSessionConfig = (sessionId, inviteCode) => {
  const store = getAdminStore()
  const session = sessionId
    ? getManagedSessionById(String(sessionId))
    : inviteCode
      ? getManagedSessionByInviteCode(String(inviteCode))
      : pickLiveSession(store.liveSessions)
  return formatLiveSession(session || {})
}

const buildReportEvents = (report, sessionName) => {
  const highlights = [report?.highlight1, report?.highlight2, report?.highlight3].filter(Boolean).map((text) => ({ text }))
  return highlights.length
    ? highlights
    : [
        { text: `${sessionName} 气氛拉满，全场互动持续升温` },
        { text: '本局记录已生成，可用于复盘和分享' },
      ]
}

const buildReportRanks = (playerCount) =>
  buildSessionPlayers(playerCount)
    .slice(0, 3)
    .map((player, index) => ({
      avatarUrl: '',
      name: player.name,
      title: ['欠酒大王', '整活担当', '气氛组'][index] || `榜单 ${index + 1}`,
      value: ['欠了 6 杯', '整活 3 次', '带动 4 次笑点'][index] || '表现稳定',
    }))

const getFeaturedReport = () => {
  const store = getAdminStore()
  const compliance = getCompliance()
  const report = (store.reports || [])[0] || null
  const session = pickLiveSession(store.liveSessions || [])
  const playerCount = Math.max(2, Number(session?.players) || 6)
  const sessionName = report?.name ? String(report.name).replace(/战报$/, '') : session?.name || '本局酒局'
  return {
    events: buildReportEvents(report, sessionName),
    metaText: `${sessionName} · ${playerCount}人局`,
    notice: compliance.copy || '理性饮酒，适量饮酒，未成年人禁止饮酒',
    reportId: report?.id || '',
    ranks: buildReportRanks(playerCount),
    replayRate: report?.replayRate || '0%',
    sessionName,
    shareRate: report?.shareRate || '0%',
    title: report?.title || '本局战报已生成',
  }
}

const listFrontendTools = () => {
  const store = getAdminStore()
  const toolsHero = store.toolsHero || {}
  const enabledTools = sortTools((store.toolsCatalog || []).filter(isEnabledTool))
  const tools = enabledTools.filter((item) => supportsPlacement(item, 'tools')).map((item) => {
    const toolId = normalizeToolId(item)
    const categoryId = normalizeToolCategoryId(item.category)
    const visual = TOOL_VISUALS[toolId] || TOOL_VISUALS['image-compress']
    return {
      id: toolId,
      rawId: item.id,
      name: item.name || toolId,
      categoryId,
      categoryName: TOOL_CATEGORY_LABEL_MAP[categoryId] || item.category || '工具',
      target: item.target || '',
      usageCount: Number(item.usageCount) || 0,
      favoriteRate: item.favoriteRate || '0%',
      status: item.status || '启用',
      sortOrder: Number(item.sortOrder) || 0,
      isHot: isHotTool(item) ? '是' : '否',
      placement: item.placement || 'tools',
      iconClass: visual.iconClass,
      toneClass: visual.toneClass,
      imageUrl: item.imageUrl || emptyImage(),
      heroImage: item.heroImage || item.imageUrl || emptyImage(),
      meta: `${item.target || '运营工具'} · 收藏率 ${item.favoriteRate || '0%'}`,
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
      imageUrl: toolsHero.imageUrl || emptyImage(),
      subtitle: toolsHero.subtitle || '高频、实用、可复用',
      title: toolsHero.title || '工具箱',
    },
    categories,
    popularTools: sortTools(tools.filter((item) => item.isHot === '是')).slice(0, 4),
    tools,
  }
}

const listUsageRecords = () => {
  const history = getToolHistory()
  return history.slice(0, 6).map((item) => ({
    name: item.name || '工具记录',
    meta: `${item.usedAt || '今天'} · ${item.category || '工具'}`,
    tag: item.category || '工具',
    route: item.id ? `/pages/tool-detail/index?id=${encodeURIComponent(normalizeToolId(item))}` : '/pages/tools/index',
  }))
}

const getShareConfig = () => {
  const compliance = getCompliance()
  const liveSession = getLiveSessionConfig()
  const report = getFeaturedReport()
  return {
    notice: compliance.copy || '理性饮酒，适量饮酒，未成年人禁止饮酒',
    poster: {
      imageUrl: emptyImage(),
      title: report.title || '本局战报已生成',
    },
    preview: {
      inviteCode: liveSession.inviteCode || '',
      imageUrl: emptyImage(),
      title: `${liveSession.sessionName || '今晚酒局'}，快来加入`,
    },
    shareItems: [
      { id: 'save', name: '保存图片', iconClass: 'share-icon-download', scene: '预览保存' },
      { id: 'invite', name: '邀请好友', iconClass: 'share-icon-group', scene: '邀请' },
      { id: 'report', name: '战报分享', iconClass: 'share-icon-wechat', scene: '战报' },
      { id: 'more', name: '更多', iconClass: 'share-icon-more', scene: '更多分享' },
    ],
    helperScenes: {
      invite: { primaryText: '继续等待大家加入', primaryUrl: '/pages/waiting-room/index', sceneTitle: '邀请分享', summary: '邀请信息已准备好。' },
      preview: { primaryText: '回到分享预览', primaryUrl: '/pages/share-preview/index', sceneTitle: '分享预览', summary: '当前分享页可继续发送给好友。' },
      report: { primaryText: '返回战报页', primaryUrl: '/pages/share-poster/index', sceneTitle: '战报分享', summary: '战报海报已生成。' },
      restart: { primaryText: '回到再开一局', primaryUrl: '/pages/restart-state/index', sceneTitle: '再开一局分享', summary: '复用上次气氛继续开局。' },
    },
    performance: {
      bestOpenRate: '0%',
      bestReturnRate: '0%',
    },
  }
}

const getQuestionBankConfig = (type = '') => {
  const store = getAdminStore()
  const normalizedType = String(type || '').trim()
  const onlineQuestions = (store.questionBank || []).filter(
    (item) => String(item.status || '').includes('上线') && (!normalizedType || String(item.type || '').trim() === normalizedType),
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
  const merchants = (store.merchants || []).filter((item) => !String(item.status || '').includes('停用'))
  const categories = [...new Set(merchants.map((item) => item.category).filter(Boolean))]
  return {
    categories: categories.slice(0, 4).map((category) => ({
      name: category,
      iconClass: MERCHANT_ICON_MAP[category] || 'merchant-icon-briefcase',
      toneClass: MERCHANT_TONE_MAP[category] || '',
    })),
    shops: merchants.map((item) => ({
      id: item.id,
      imageUrl: emptyImage(),
      meta: `${item.category || '商户'} · 已领取 ${item.claimCount || '0'} · 核销率 ${item.verifyRate || '0%'} · ${item.status || '上线中'}`,
      name: item.name,
      status: item.status || '上线中',
    })),
    safeBack: merchants
      .filter((item) => String(item.category || '').includes('代驾') || String(item.name || '').includes('车'))
      .slice(0, 3)
      .map((item) => ({
        name: item.name,
        iconClass: MERCHANT_ICON_MAP[item.category] || 'merchant-icon-coupon',
        toneClass: MERCHANT_TONE_MAP[item.category] || '',
      })),
    notice: '商户数据来自后台商户合作页。',
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
