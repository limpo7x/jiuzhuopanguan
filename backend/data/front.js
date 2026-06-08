const { getAdminStore } = require('./admin')
const { getCompliance, getToolHistory } = require('./content')

const asset = (name) => `/static/${name}`

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

const TOOL_NAME_MAP = {
  二维码生成: 'qr-code',
  单位换算: 'unit',
  图片压缩: 'image-compress',
  图片去水印: 'watermark',
  九宫格切图: 'nine-grid',
  JSON格式化: 'json',
  'JSON 格式化': 'json',
  房贷计算: 'loan-calc',
  文字计数: 'text-count',
  汇率换算: 'currency',
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
  currency: {
    heroImage: asset('report-poster.png'),
    iconClass: 'tools-icon-currency',
    imageUrl: asset('report-poster.png'),
    toneClass: 'tools-tile-green',
  },
  'image-compress': {
    heroImage: asset('image-process-hero.png'),
    iconClass: 'tools-icon-compress',
    imageUrl: asset('image-process-hero.png'),
    toneClass: '',
  },
  json: {
    heroImage: asset('toolbox-hero.png'),
    iconClass: 'tools-icon-code',
    imageUrl: asset('toolbox-hero.png'),
    toneClass: 'tools-tile-blue',
  },
  'loan-calc': {
    heroImage: asset('report-poster.png'),
    iconClass: 'tools-icon-home',
    imageUrl: asset('report-poster.png'),
    toneClass: '',
  },
  'nine-grid': {
    heroImage: asset('image-process-hero.png'),
    iconClass: 'tools-icon-grid',
    imageUrl: asset('image-process-hero.png'),
    toneClass: 'tools-tile-blue',
  },
  'qr-code': {
    heroImage: asset('report-poster.png'),
    iconClass: 'tools-icon-qr',
    imageUrl: asset('report-poster.png'),
    toneClass: '',
  },
  'text-count': {
    heroImage: asset('toolbox-hero.png'),
    iconClass: 'tools-icon-text',
    imageUrl: asset('toolbox-hero.png'),
    toneClass: '',
  },
  unit: {
    heroImage: asset('report-poster.png'),
    iconClass: 'tools-icon-scale',
    imageUrl: asset('report-poster.png'),
    toneClass: 'tools-tile-green',
  },
  watermark: {
    heroImage: asset('party-hero.png'),
    iconClass: 'tools-icon-eraser',
    imageUrl: asset('party-hero.png'),
    toneClass: '',
  },
}

const SHARE_ASSET_IMAGE_MAP = {
  分享码: asset('report-poster.png'),
  战报海报: asset('report-poster.png'),
  邀局卡: asset('party-hero.png'),
}

const SHARE_ICON_MAP = {
  分享码: 'share-icon-download',
  战报海报: 'share-icon-wechat',
  邀局卡: 'share-icon-group',
}

const SESSION_AVATARS = [
  '/assets/avatars/avatar-1.png',
  '/assets/avatars/avatar-2.png',
  '/assets/avatars/avatar-3.png',
  '/assets/avatars/avatar-4.png',
]

const SESSION_PLAYER_NAMES = ['阿浩', '小熊', 'Mika', '可可', '阿乐', 'Nina', '老白', '七七']

const REPORT_RANK_LIBRARY = [
  { title: '欠酒大王', value: '欠了 6 杯' },
  { title: '背锅侠', value: '被点名 3 次' },
  { title: '整活王', value: '贡献 3 个题' },
  { title: '气氛组', value: '带起 4 次全场爆笑' },
]

const pickLiveSession = (sessions = []) =>
  sessions.find((item) => String(item.state || '').includes('等待')) ||
  sessions.find((item) => String(item.state || '').includes('进行中')) ||
  sessions[0] ||
  null

const pickFeaturedReport = (reports = []) => reports[0] || reports.find((item) => String(item.status || '').includes('爆发')) || null

const deriveInviteCode = (id = 'session') => {
  const seed = String(id).replace(/[^a-z0-9]/gi, '').toUpperCase()
  return `${seed.slice(-2).padStart(2, 'A')}7K9Q`
}

const buildSessionPlayers = (playerCount = 6) =>
  Array.from({ length: Math.max(playerCount, 2) }, (_, index) => ({
    avatarUrl: SESSION_AVATARS[index % SESSION_AVATARS.length],
    name: SESSION_PLAYER_NAMES[index % SESSION_PLAYER_NAMES.length],
  }))

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

const getMatchedSession = (report, sessions = []) =>
  sessions.find((item) => item.template === report?.template) ||
  sessions.find((item) => String(report?.name || '').includes(String(item.name || '').replace(/战报$/, ''))) ||
  sessions[0] ||
  null

const buildReportEvents = (report, sessionName) => {
  const scene = report?.scene || '常规局'
  const managedHighlights = [report?.highlight1, report?.highlight2, report?.highlight3].filter(Boolean).map((text) => ({ text }))
  if (managedHighlights.length) {
    return managedHighlights
  }
  return [
    { text: `${sessionName} 里有人主动要求加赛，气氛直接拉满` },
    { text: `${scene} 场景下的 ${report?.template || '经典模板'} 贡献了本局最高笑点` },
    { text: `分享率 ${report?.shareRate || '--'}，再开一局率 ${report?.replayRate || '--'}` },
  ]
}

const buildReportRanks = (playerCount) =>
  buildSessionPlayers(playerCount)
    .slice(0, 3)
    .map((player, index) => ({
      avatarUrl: player.avatarUrl,
      name: player.name,
      title: REPORT_RANK_LIBRARY[index]?.title || `本局第 ${index + 1}`,
      value: REPORT_RANK_LIBRARY[index]?.value || '表现稳定',
    }))

const normalizeToolId = (item = {}) => TOOL_ID_MAP[item.id] || TOOL_NAME_MAP[item.name] || item.id || 'image-compress'
const normalizeToolCategoryId = (value) => TOOL_CATEGORY_ID_MAP[value] || 'share'

const getToolVisual = (toolId, imageUrl) => ({
  ...TOOL_VISUALS[toolId],
  heroImage: imageUrl || TOOL_VISUALS[toolId]?.heroImage || asset('toolbox-hero.png'),
  imageUrl: imageUrl || TOOL_VISUALS[toolId]?.imageUrl || asset('toolbox-hero.png'),
})

const parsePercent = (value) => {
  const matched = String(value || '').match(/(\d+(?:\.\d+)?)/)
  return matched ? Number(matched[1]) : 0
}

const isEnabledTool = (item) => !String(item?.status || '').includes('停用')
const isHotTool = (item) => String(item?.isHot || '').includes('是')
const supportsPlacement = (item, placement) => {
  const normalized = String(item?.placement || 'tools').trim().toLowerCase()
  return normalized === 'both' || normalized === placement
}
const sortTools = (items = []) =>
  [...items].sort((left, right) => {
    const orderDiff = (Number(left.sortOrder) || 0) - (Number(right.sortOrder) || 0)
    if (orderDiff !== 0) {
      return orderDiff
    }
    return (Number(right.usageCount) || 0) - (Number(left.usageCount) || 0)
  })

const getLiveSessionConfig = () => {
  const store = getAdminStore()
  const session = pickLiveSession(store.liveSessions)
  if (!session) {
    const players = buildSessionPlayers(6)
    return {
      hostName: '小太阳组会玩',
      inviteCode: 'AB7K9Q',
      joinedCount: 4,
      joinedPlayers: players.slice(0, 4),
      joinStatusPlayers: players.slice(0, 6).map((item, index) => ({
        ...item,
        status: index < 4 ? '已加入' : '待加入',
      })),
      playerCount: 6,
      sessionName: '今晚聚会不醉不归',
      source: '好友邀请',
      stateText: '等待开局',
      status: '正常',
      subtitle: '人齐自动开局，无需群主操作',
      templateName: '经典欠酒版',
      title: '组局中，等人齐',
    }
  }

  const playerCount = Math.max(2, Number(session.players) || 6)
  const joinedCount = getJoinedCount(session, playerCount)
  const players = buildSessionPlayers(playerCount)
  return {
    hostName: session.hostName || '小太阳组会玩',
    id: session.id,
    inviteCode: session.inviteCode || deriveInviteCode(session.id),
    joinedCount,
    joinedPlayers: players.slice(0, joinedCount),
    joinStatusPlayers: players.map((item, index) => ({
      ...item,
      status: index < joinedCount ? '已加入' : '待加入',
    })),
    playerCount,
    sessionName: session.name || '今晚聚会不醉不归',
    source: session.source || '好友邀请',
    stateText: session.state || '等待开局',
    status: session.status || '正常',
    subtitle: String(session.state || '').includes('进行中') ? '房间仍可继续查看当前加入状态' : '人齐自动开局，无需群主操作',
    templateName: session.template || '经典欠酒版',
    title: String(session.state || '').includes('进行中') ? '本局进行中' : '组局中，等人齐',
  }
}

const getFeaturedReport = () => {
  const store = getAdminStore()
  const compliance = getCompliance()
  const report = pickFeaturedReport(store.reports)
  const session = getMatchedSession(report, store.liveSessions)
  const playerCount = Math.max(2, Number(session?.players) || 6)
  const sessionName = report?.name ? String(report.name).replace(/战报$/, '') : session?.name || '周五热场局'

  return {
    events: buildReportEvents(report, sessionName),
    metaText: `${sessionName} · ${playerCount}人局 · ${report?.scene || '常规局'}`,
    notice: compliance.copy || '理性饮酒，适量饮酒，未成年人禁止饮酒',
    ranks: buildReportRanks(playerCount),
    replayRate: report?.replayRate || '0%',
    sessionName,
    shareRate: report?.shareRate || '0%',
    title: report?.title || (String(report?.status || '').includes('爆发') ? '这局快乐就完事了！' : '这一局笑点很密集'),
  }
}

const listFrontendTools = () => {
  const store = getAdminStore()
  const enabledTools = sortTools(store.toolsCatalog.filter(isEnabledTool))
  const tools = enabledTools.filter((item) => supportsPlacement(item, 'tools')).map((item) => {
    const toolId = normalizeToolId(item)
    const categoryId = normalizeToolCategoryId(item.category)
    const visual = getToolVisual(toolId, item.imageUrl)
    return {
      id: toolId,
      rawId: item.id,
      name: item.name,
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
      imageUrl: visual.imageUrl,
      heroImage: visual.heroImage,
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
  const popularTools = sortTools(tools.filter((item) => String(item.isHot).includes('是')))

  return {
    hero: {
      imageUrl: asset('toolbox-hero.png'),
      subtitle: '高频、实用、可复用',
      title: '后台工具直连前台目录',
    },
    categories,
    popularTools,
    tools,
  }
}

const listUsageRecords = () => {
  const history = getToolHistory()
  const report = getFeaturedReport()
  const toolRecords = history.map((item) => {
    const toolId = normalizeToolId(item)
    return {
      name: item.name,
      meta: `${item.usedAt || '今天'} · ${item.category || '工具'}`,
      tag: item.category || '工具',
      route: `/pages/tool-detail/index?id=${encodeURIComponent(toolId)}&name=${encodeURIComponent(item.name || '')}`,
    }
  })

  if (report) {
    toolRecords.splice(2, 0, {
      name: report.sessionName,
      meta: `战报中心 · 分享率 ${report.shareRate || '--'}`,
      tag: '酒局',
      route: '/pages/result-report/index',
    })
  }

  return toolRecords.slice(0, 6)
}

const listShareActions = () => {
  const store = getAdminStore()
  const activeItems = store.shareAssets.filter((item) => !String(item.status || '').includes('停用'))
  return activeItems.map((item, index) => ({
    id: item.id || `share-${index + 1}`,
    name: item.assetType || item.name || '分享项',
    label: item.name || item.assetType || '分享项',
    iconClass: SHARE_ICON_MAP[item.assetType] || 'share-icon-more',
    imageUrl: item.imageUrl || SHARE_ASSET_IMAGE_MAP[item.assetType] || asset('report-poster.png'),
    openRate: item.openRate || '0%',
    returnRate: item.returnRate || '0%',
    scene: item.scene || '分享',
  }))
}

const getShareConfig = () => {
  const compliance = getCompliance()
  const actions = listShareActions()
  const liveSession = getLiveSessionConfig()
  const report = getFeaturedReport()
  const reportAction = actions.find((item) => item.scene.includes('战报')) || actions[0]
  const inviteAction = actions.find((item) => item.scene.includes('邀请')) || actions[1] || actions[0]
  const groupAction = actions.find((item) => item.scene.includes('群')) || actions[2] || actions[0]

  return {
    notice: compliance.copy || '理性饮酒，适量饮酒，未成年人禁止饮酒',
    poster: {
      imageUrl: reportAction?.imageUrl || asset('report-poster.png'),
      title: report.title || '这局快乐就完事了！',
    },
    preview: {
      inviteCode: liveSession.inviteCode || 'AB7K9Q',
      title: `${liveSession.sessionName || '这局快乐就完事了！'}，快来加入`,
    },
    shareItems: [
      {
        id: 'save',
        name: '保存图片',
        iconClass: 'share-icon-download',
        scene: '预览保存',
      },
      inviteAction
        ? {
            id: inviteAction.id,
            name: inviteAction.name,
            iconClass: inviteAction.iconClass,
            scene: inviteAction.scene,
          }
        : null,
      groupAction
        ? {
            id: groupAction.id,
            name: groupAction.name,
            iconClass: groupAction.iconClass,
            scene: groupAction.scene,
          }
        : null,
      {
        id: 'more',
        name: '更多',
        iconClass: 'share-icon-more',
        scene: '更多分享',
      },
    ].filter(Boolean),
    helperScenes: {
      invite: {
        primaryText: '继续等待大家加入',
        primaryUrl: '/pages/waiting-room/index',
        sceneTitle: '邀请分享',
        summary: inviteAction
          ? `${inviteAction.label} 当前打开率 ${inviteAction.openRate}，适合直接发给好友或群聊。`
          : '邀请海报和口令已经准备好，适合直接发给好友或群聊。',
      },
      preview: {
        primaryText: '回到分享预览',
        primaryUrl: '/pages/share-preview/index',
        sceneTitle: '分享预览',
        summary: groupAction
          ? `${groupAction.label} 当前回流率 ${groupAction.returnRate}，适合继续扩散。`
          : '当前海报适合保存到相册或继续发给好友、群聊。',
      },
      report: {
        primaryText: '返回战报页',
        primaryUrl: '/pages/share-poster/index',
        sceneTitle: '战报分享',
        summary: reportAction
          ? `${reportAction.label} 当前打开率 ${reportAction.openRate}，可继续分享给好友或保存复盘。`
          : '战报海报已经生成，可继续分享给好友或保存做复盘素材。',
      },
      restart: {
        primaryText: '回到再开一局',
        primaryUrl: '/pages/restart-state/index',
        sceneTitle: '再开一局分享',
        summary: inviteAction
          ? `${inviteAction.label} 已准备好，复用上次的气氛和模板更顺手。`
          : '复用上次的气氛和模板，把老朋友重新叫回来更顺手。',
      },
    },
    performance: {
      bestOpenRate: `${Math.max(...actions.map((item) => parsePercent(item.openRate)), 0)}%`,
      bestReturnRate: `${Math.max(...actions.map((item) => parsePercent(item.returnRate)), 0)}%`,
    },
  }
}

module.exports = {
  getFeaturedReport,
  getLiveSessionConfig,
  getShareConfig,
  listFrontendTools,
  listUsageRecords,
}
