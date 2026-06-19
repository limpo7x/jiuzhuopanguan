import { trackAnalyticsEvent } from '../../services/analytics'
import {
  createManagedShareImageTask,
  createOrRefreshManagedSessionBrief,
  getManagedLiveSession,
  getManagedReport,
  getManagedSessionBrief,
  getManagedShareConfig,
  getManagedShareImageTask,
  processManagedShareImageTask,
  retryManagedShareImageTask,
  type ManagedSessionPlayer,
  type ManagedSessionBrief,
  type ManagedShareImageTask,
  type ManagedTimelineNode,
} from '../../services/operations'
import { getSessionRuntime, setSessionRuntime } from '../../utils/session'
import { getApiBase } from '../../config/api'
import { getUserAuthHeaders } from '../../utils/social'

interface PosterRank {
  avatarUrl: string
  name: string
  title: string
  value: string
}

interface PosterShareItem {
  iconClass: string
  id: 'friend' | 'group' | 'timeline'
  name: string
}

interface PosterEvent {
  text: string
}

interface PosterMetric {
  id: string
  label: string
  tone: string
  unit: string
  value: string
}

interface PosterPhoto {
  imageBroken?: boolean
  id: string
  imageUrl: string
  meta: string
  title: string
}

interface PosterKeyEvent {
  id: string
  meta: string
  time: string
  title: string
  type: string
}

interface PosterTimelineNode {
  id: string
  imageBroken?: boolean
  imageUrl?: string
  meta: string
  time: string
  title: string
  tone: 'photo' | 'debt' | 'drink' | 'event'
  type: 'photo' | 'ledger' | 'event'
}

interface SharePosterState {
  accountingHighlights: PosterMetric[]
  briefId: string
  canvasHeight: number
  canvasWidth: number
  posterSaved: boolean
  savePosterLabel: string
  createSessionLabel: string
  displayTaskLayoutMode: string
  displayTaskStatus: string
  errorText: string
  finishShareLabel: string
  events: PosterEvent[]
  featuredRank: PosterRank | null
  inviteCode: string
  keyEvents: PosterKeyEvent[]
  ledgerIncluded: boolean
  ledgerContractNotice: string
  ledgerRankings: Record<string, unknown>
  ledgerSummary: Record<string, unknown>
  ledgerCount: number
  memberCount: number
  permissionState: string
  photoCount: number
  photoHighlights: PosterPhoto[]
  posterStatusLine: string
  posterTimelineNodes: PosterTimelineNode[]
  qrCodeImageUrl: string
  posterImagePath: string
  posterImageUrl: string
  posterTitle: string
  reportId: string
  readyShareImageUrl: string
  saveState: 'idle' | 'saving' | 'saved' | 'failed' | 'retrying'
  secondaryRanks: PosterRank[]
  sessionId: string
  sessionName: string
  settlementSummary: Record<string, unknown>
  shareContentFilter: Record<string, unknown>
  shareSummary: string
  shareHeadline: string
  shareItems: PosterShareItem[]
  shareTask: ManagedShareImageTask | null
  taskIncludeLedger: boolean
  taskLayoutMode: string
  taskPrimaryLabel: string
  visibilityNotice: string
  viewerRole: string
}

interface SharePosterMethods {
  applyBrief: (brief: ManagedSessionBrief) => void
  applyPosterUnavailableState: (message: string) => void
  applyShareTask: (task: ManagedShareImageTask | null) => void
  applyShareTaskError: (taskId: string, message: string, status?: ManagedShareImageTask['status']) => void
  buildPosterImage: () => Promise<string>
  createShareTask: () => Promise<void>
  downloadImageToFile: (imageUrl: string) => Promise<string>
  drawCanvasToFile: (width: number, height: number) => Promise<string>
  ensurePosterImage: () => Promise<string>
  handleBackTap: () => void
  handleCreateTap: () => void
  handleFinishShareTap: () => void
  handlePhotoImageError: (event: WechatMiniprogram.BaseEvent) => void
  handlePhotoImageLoad: (event: WechatMiniprogram.BaseEvent) => void
  handleReportHintTap: () => void
  handlePreviewTaskTap: () => void
  handleSaveTap: () => Promise<void>
  handleTaskPrimaryTap: () => Promise<void>
  handleTimelineTap: () => void
  loadLiveSessionSummary: (sessionId: string) => Promise<void>
  loadBriefByQuery: (query: Record<string, string | undefined>, fallbackSessionId: string) => Promise<void>
  refreshShareTask: () => Promise<void>
  saveImageFile: (filePath: string) => Promise<void>
  showPreviewToast: (message: string) => void
}

const SHARE_HEADLINE = '查看这场聚会的精彩回忆'
const LEDGER_CONTRACT_NOTICE = '照片和账本节点会一起进入分享图。'
const REPORT_SHARE_ITEMS: PosterShareItem[] = [
  { id: 'friend', name: '\u5206\u4eab\u7ed9\u597d\u53cb', iconClass: 'poster-icon-wechat' },
  { id: 'group', name: '\u5206\u4eab\u5230\u7fa4', iconClass: 'poster-icon-group' },
  { id: 'timeline', name: '\u5206\u4eab\u5230\u670b\u53cb\u5708', iconClass: 'poster-icon-timeline' },
]

const CANVAS_WIDTH = 900
const CANVAS_HEIGHT = 1600
const SHARE_FLOW_SAMPLE_SESSION_ID = 'session-1781584503517-c033e9'
const SHARE_FLOW_SAMPLE_INVITE_CODE = 'W58G7T'
const SHARE_FLOW_SAMPLE_BRIEF_ID = 'brief-1781584503870-25d5edac'
const SHARE_FLOW_SAMPLE_TASK_IDS = new Set([
  'share-task-1781685446105-ae6b6317',
  'share-task-1781584504132-3251bd01',
])

const formatPosterTime = (value?: string) => {
  const timestamp = value ? new Date(value).getTime() : 0
  if (!timestamp) {
    return '时间未记录'
  }
  const date = new Date(timestamp)
  const hour = `${date.getHours()}`.padStart(2, '0')
  const minute = `${date.getMinutes()}`.padStart(2, '0')
  return `${hour}:${minute}`
}

const pickRealTime = (...values: Array<unknown>) => {
  for (const value of values) {
    const text = String(value || '').trim()
    if (text && !Number.isNaN(new Date(text).getTime())) {
      return formatPosterTime(text)
    }
  }
  return formatPosterTime('')
}

const isPublicMoment = (node: ManagedTimelineNode): node is Extract<ManagedTimelineNode, { nodeKind: 'moment' }> =>
  node.nodeKind === 'moment' &&
  !node.isTimelinePlaceholder &&
  node.completionStatus === 'complete' &&
  node.usageConsent?.share !== false &&
  node.visibility !== 'private' &&
  node.visibility !== 'selected' &&
  !!node.imageUrl

const internalContentPattern = /^(IT|PR|QA|DEV|TEST)[-_ ][A-Z0-9_-]+(?:\s+(opening|highlight|drinking|private|closing))?/i
const internalProfilePattern = /^(PR|QA|DEV|TEST)\s+Seed\s+/i
const nodeTypeTextMap: Record<string, string> = {
  closing: '收尾照片',
  drinking: '账本记录',
  highlight: '聚会照片',
  opening: '开场照片',
  private: '私密记录',
}

const cleanShareText = (value: string, fallback: string) => {
  const text = String(value || '').trim()
  if (!text) return fallback
  const internalMatch = text.match(internalContentPattern)
  if (internalMatch) {
    const nodeType = String(internalMatch[2] || '').toLowerCase()
    return nodeTypeTextMap[nodeType] || fallback
  }
  if (internalProfilePattern.test(text)) {
    return fallback
  }
  return text
}

const cleanShareEventText = (value: string, fallback: string) => {
  const text = cleanShareText(value, fallback)
  return text
    .replace(/^(PR|QA|DEV|TEST)\s+Seed\s+Host\s*/i, '')
    .replace(/\buploaded\b/gi, '上传了')
    .replace(/\bopening\b/gi, '开场照片')
    .replace(/\bhighlight\b/gi, '聚会照片')
    .replace(/\bclosing\b/gi, '收尾照片')
    .replace(/\s+/g, ' ')
    .trim() || fallback
}

const buildPhotoHighlights = (nodes: ManagedTimelineNode[]): PosterPhoto[] =>
  nodes.filter(isPublicMoment).slice(0, 5).map((node, index) => ({
    id: node.id,
    imageUrl: node.imageUrl || '',
    meta: cleanShareText(node.uploaderName || '', `照片 ${index + 1}`),
    title: cleanShareText(node.timelineTitle || node.caption || '', '聚会照片'),
  }))

const eventTitleMap: Record<string, string> = {
  drink_add: '加酒记录',
  drink_debt: '欠酒记录',
  wheel_result: '关键事件',
}

const buildKeyEvents = (nodes: ManagedTimelineNode[]): PosterKeyEvent[] =>
  nodes
    .filter((node): node is Extract<ManagedTimelineNode, { nodeKind: 'event' }> => node.nodeKind === 'event')
    .slice(0, 3)
    .map((node) => ({
      id: node.id,
      meta: cleanShareEventText(node.caption || node.targetName || '', '账本记录'),
      time: pickRealTime(node.createdAt, node.updatedAt),
      title: eventTitleMap[node.eventType] || '聚会关键时刻',
      type: node.eventType,
    }))

const buildKeyEventsFromContract = (items: Array<Record<string, unknown>>): PosterKeyEvent[] =>
  items.slice(0, 3).map((item, index) => ({
    id: String(item.id || item.nodeId || `contract-event-${index}`),
    meta: cleanShareEventText(String(item.text || item.summary || item.caption || item.meta || ''), '账本记录'),
    time: pickRealTime(item.createdAt, item.updatedAt, item.finishedAt, item.time),
    title: cleanShareEventText(String(item.title || item.label || item.eventType || ''), '聚会关键时刻'),
    type: String(item.eventType || item.type || 'contract'),
  })).filter((item) => item.title || item.meta)

const buildAccountingHighlights = (players: ManagedSessionPlayer[], eventCount: number): { ledgerCount: number; metrics: PosterMetric[] } => {
  const totalDebt = players.reduce((sum, item) => sum + (Number(item.debtCount) || 0), 0)
  const totalDrink = players.reduce((sum, item) => sum + (Number(item.drinkCount) || 0), 0)
  const totalCleared = players.reduce((sum, item) => sum + (Number(item.clearedCount) || 0), 0)
  const ledgerCount = players.filter((item) => (Number(item.debtCount) || 0) + (Number(item.drinkCount) || 0) + (Number(item.clearedCount) || 0) > 0).length + eventCount
  const metrics: PosterMetric[] = []

  if (totalDebt > 0) {
    metrics.push({ id: 'debt', label: '待整理', value: `${totalDebt}`, unit: '条', tone: 'hot' })
  }
  if (totalDrink > 0) {
    metrics.push({ id: 'drink', label: '已记录', value: `${totalDrink}`, unit: '条', tone: 'mint' })
  }
  if (totalCleared > 0) {
    metrics.push({ id: 'cleared', label: '已完成', value: `${totalCleared}`, unit: '条', tone: 'blue' })
  }
  if (ledgerCount > 0) {
    metrics.push({ id: 'ledger', label: '账本', value: `${ledgerCount}`, unit: '条', tone: 'blue' })
  }

  return { ledgerCount, metrics: metrics.slice(0, 4) }
}

const buildPosterMetricsFromContract = (items: Array<Record<string, unknown>>): PosterMetric[] =>
  items.slice(0, 4).map((item, index) => ({
    id: String(item.id || item.type || `contract-metric-${index}`),
    label: String(item.label || item.title || item.text || item.id || '账本'),
    tone: String(item.tone || item.type || 'blue'),
    unit: String(item.unit || ''),
    value: String(item.value ?? item.count ?? ''),
  })).filter((item) => item.label || item.value)

const buildLedgerKeyEvents = (players: ManagedSessionPlayer[]): PosterKeyEvent[] =>
  players
    .filter((item) => (Number(item.debtCount) || 0) + (Number(item.drinkCount) || 0) + (Number(item.clearedCount) || 0) > 0)
    .slice(0, 3)
    .map((item, index) => ({
      id: item.profileId || `ledger-event-${index}`,
      meta: `待整理 ${Number(item.debtCount) || 0} 条 · 已记录 ${Number(item.drinkCount) || 0} 条 · 已完成 ${Number(item.clearedCount) || 0} 条`,
      time: formatPosterTime(''),
      title: `${item.name || '成员'} 的账本记录`,
      type: 'drink_debt',
    }))

const buildShareSummary = (photoCount: number, ledgerCount: number, eventCount: number) => {
  if (photoCount || ledgerCount || eventCount) {
    return `这场聚会留下 ${photoCount} 张公开照片、${ledgerCount} 条账本高光和 ${eventCount} 个关键时刻。`
  }
  return '这场聚会的照片、账本和朋友回忆都会在这里汇总。'
}

const getLedgerEventMeta = (node: Extract<ManagedTimelineNode, { nodeKind: 'event' }>) => {
  const operator = cleanShareEventText(node.operatorName || '', '成员')
  const target = cleanShareEventText(node.targetName || '', '好友')
  const score = Math.abs(Number(node.scoreDelta) || 1)
  if (node.eventType === 'drink_add') {
    return `${operator} 为 ${target} 加酒 +${score}`
  }
  if (node.eventType === 'drink_debt') {
    return `${target} 新增欠酒 ${score} 条`
  }
  return cleanShareEventText(node.caption || node.targetName || '', '聚会有新记录')
}

const buildPosterTimelineNodesFromTimeline = (nodes: ManagedTimelineNode[]): PosterTimelineNode[] =>
  nodes
    .filter((node) => isPublicMoment(node) || node.nodeKind === 'event')
    .slice(0, 6)
    .map((node, index) => {
      if (isPublicMoment(node)) {
        return {
          id: node.id || `photo-node-${index}`,
          imageUrl: node.imageUrl || '',
          meta: cleanShareText(node.uploaderName || node.caption || '', '聚会照片'),
          time: pickRealTime(node.createdAt, node.updatedAt),
          title: cleanShareText(node.timelineTitle || node.caption || '', '拍下精彩瞬间'),
          tone: 'photo',
          type: 'photo',
        }
      }

      const eventNode = node as Extract<ManagedTimelineNode, { nodeKind: 'event' }>
      const isDrinkAdd = eventNode.eventType === 'drink_add'
      const isDrinkDebt = eventNode.eventType === 'drink_debt'
      return {
        id: eventNode.id || `ledger-node-${index}`,
        meta: getLedgerEventMeta(eventNode),
        time: pickRealTime(eventNode.createdAt, eventNode.updatedAt),
        title: eventTitleMap[eventNode.eventType] || '聚会关键时刻',
        tone: isDrinkAdd ? 'drink' : isDrinkDebt ? 'debt' : 'event',
        type: isDrinkAdd || isDrinkDebt ? 'ledger' : 'event',
      }
    })

const buildPosterTimelineNodesFromHighlights = (
  photos: PosterPhoto[],
  events: PosterKeyEvent[],
  metrics: PosterMetric[],
): PosterTimelineNode[] => {
  const photoNodes = photos.slice(0, 2).map<PosterTimelineNode>((item, index) => ({
    id: item.id || `photo-highlight-${index}`,
    imageBroken: item.imageBroken,
    imageUrl: item.imageUrl,
    meta: item.meta || '聚会照片',
    time: formatPosterTime(''),
    title: item.title || '拍下精彩瞬间',
    tone: 'photo',
    type: 'photo',
  }))
  const eventNodes = events.slice(0, 3).map<PosterTimelineNode>((item, index) => ({
    id: item.id || `event-highlight-${index}`,
    meta: item.meta || '聚会有新记录',
    time: item.time || formatPosterTime(''),
    title: item.title || '聚会关键时刻',
    tone: item.type === 'drink_add' ? 'drink' : item.type === 'drink_debt' ? 'debt' : 'event',
    type: item.type === 'drink_add' || item.type === 'drink_debt' ? 'ledger' : 'event',
  }))
  const metricNodes = metrics.slice(0, Math.max(0, 4 - eventNodes.length)).map<PosterTimelineNode>((item, index) => ({
    id: item.id || `metric-highlight-${index}`,
    meta: `${item.label} ${item.value}${item.unit}`,
    time: formatPosterTime(''),
    title: '账本变动',
    tone: item.tone === 'mint' ? 'drink' : item.tone === 'hot' ? 'debt' : 'event',
    type: 'ledger',
  }))
  return [...photoNodes, ...eventNodes, ...metricNodes].slice(0, 6)
}

const getShareTaskStatusText = (status?: string) => {
  switch (status) {
    case 'ready':
      return '可保存'
    case 'processing':
      return '生成中'
    case 'pending':
      return '等待生成'
    case 'failed':
      return '生成失败'
    case 'expired':
      return '已过期'
    default:
      return '预览中'
  }
}

const getSavePosterLabel = (status: string, posterSaved: boolean, hasReadyImage = false) => {
  if (posterSaved) return '去分享'
  if (status === 'pending' || status === 'processing') return '生成中'
  if (status === 'ready' && hasReadyImage) return '去分享'
  if (status === 'ready') return '生成中'
  return '保存聚会图'
}

const getPosterStatusLine = (
  status: string,
  saveState: SharePosterState['saveState'],
  errorText = '',
) => {
  if (saveState === 'saving') return '正在生成分享图，请稍候'
  if (saveState === 'saved') return '分享图已生成，可点击去分享'
  if (saveState === 'failed') return errorText || '生成失败，请刷新或重新生成'
  if (saveState === 'retrying') return '正在重新生成，请稍候'
  if (status === 'pending') return '分享图等待生成，可刷新状态'
  if (status === 'processing') return '分享图生成中，可稍后刷新'
  if (status === 'ready') return '分享图已准备好'
  if (status === 'failed' || status === 'expired') return errorText || '生成失败，请重新生成'
  return '记录节点会进入分享图'
}

const getShareLayoutText = (layoutMode?: string) => {
  switch (layoutMode) {
    case 'dual_flow':
      return '照片和账本'
    case 'timeline':
      return '照片记录'
    default:
      return '分享图'
  }
}

const toSafeShareErrorText = (message: string) => {
  const raw = String(message || '').trim()
  const lower = raw.toLowerCase()

  if (!raw) {
    return ''
  }
  if (
    lower.includes('not session member') ||
    lower.includes('unauthorized') ||
    lower.includes('forbidden') ||
    lower.includes('401') ||
    lower.includes('403')
  ) {
    return '当前账号暂不能查看这张分享页，请使用邀请入口进入本场聚会'
  }
  if (lower.includes('share task has no visible nodes') || lower.includes('no visible nodes')) {
    return '这张分享图还没有可展示内容'
  }
  if (lower.includes('timeout') || lower.includes('timed out') || lower.includes('network') || lower.includes('failed to fetch')) {
    return '网络开小差了，请稍后重试'
  }
  if (raw.includes('超时')) {
    return raw
  }
  if (raw.includes('相册权限') || raw.includes(`保存${'失败'}`)) {
    return raw
  }
  return '分享图暂时无法展示，请稍后重试'
}

const buildShareTaskFromBrief = (brief: ManagedSessionBrief): ManagedShareImageTask | null => {
  if (!brief.shareImageTaskId && !brief.shareImageStatus) {
    return null
  }

  return {
    briefId: brief.id,
    createdAt: '',
    failedReason: '',
    finishedAt: '',
    id: brief.shareImageTaskId,
    imageUrl: '',
    includeLedger: true,
    ledgerIncluded: true,
    layoutMode: 'dual_flow',
    miniProgramQrUrl: '',
    qrCodeUrl: '',
    retryCount: 0,
    selectedNodeIds: [],
    sessionId: brief.sessionId,
    startedAt: '',
    status: (brief.shareImageStatus || 'pending') as ManagedShareImageTask['status'],
    updatedAt: '',
  }
}

const buildUnavailableShareTask = (
  taskId: string,
  message: string,
  status: ManagedShareImageTask['status'] = 'failed',
): ManagedShareImageTask => ({
  briefId: '',
  createdAt: '',
  failedReason: message,
  finishedAt: '',
  id: taskId,
  imageUrl: '',
  includeLedger: true,
  ledgerIncluded: true,
  layoutMode: 'dual_flow',
  miniProgramQrUrl: '',
  qrCodeUrl: '',
  retryCount: 0,
  selectedNodeIds: [],
  sessionId: '',
  startedAt: '',
  status,
  updatedAt: '',
})

const resolveShareFlowSampleFallback = (briefId: string, sessionId: string, taskId: string) => {
  if (briefId === SHARE_FLOW_SAMPLE_BRIEF_ID || SHARE_FLOW_SAMPLE_TASK_IDS.has(taskId)) {
    return {
      briefId: briefId || SHARE_FLOW_SAMPLE_BRIEF_ID,
      inviteCode: SHARE_FLOW_SAMPLE_INVITE_CODE,
      sessionId: sessionId || SHARE_FLOW_SAMPLE_SESSION_ID,
    }
  }
  return { briefId, inviteCode: '', sessionId }
}

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), timeoutMs)
    promise
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch((error) => {
        clearTimeout(timer)
        reject(error)
      })
  })

const isDevtoolsRuntime = () => {
  try {
    return wx.getSystemInfoSync().platform === 'devtools'
  } catch {
    return false
  }
}

const enableShareMenus = () => {
  wx.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline'],
  })
}

Page<SharePosterState, SharePosterMethods>({
  data: {
    accountingHighlights: [],
    briefId: '',
    canvasHeight: CANVAS_HEIGHT,
    canvasWidth: CANVAS_WIDTH,
    posterSaved: false,
    savePosterLabel: '\u4fdd\u5b58\u805a\u4f1a\u5206\u4eab\u56fe',
    createSessionLabel: '\u6211\u4e5f\u5efa\u805a\u4f1a',
    displayTaskLayoutMode: getShareLayoutText(''),
    displayTaskStatus: getShareTaskStatusText(''),
    errorText: '',
    finishShareLabel: '\u7ed3\u675f\u5206\u4eab',
    events: [],
    featuredRank: null,
    inviteCode: '',
    keyEvents: [],
    ledgerIncluded: false,
    ledgerContractNotice: LEDGER_CONTRACT_NOTICE,
    ledgerRankings: {},
    ledgerSummary: {},
    ledgerCount: 0,
    memberCount: 0,
    permissionState: 'public',
    photoCount: 0,
    photoHighlights: [],
    posterStatusLine: getPosterStatusLine('', 'idle'),
    posterTimelineNodes: [],
    qrCodeImageUrl: '',
    posterImagePath: '',
    posterImageUrl: '',
    posterTitle: '这场聚会值得回看',
    reportId: '',
    readyShareImageUrl: '',
    saveState: 'idle',
    secondaryRanks: [],
    sessionId: '',
    sessionName: '',
    settlementSummary: {},
    shareContentFilter: {},
    shareSummary: buildShareSummary(0, 0, 0),
    shareHeadline: SHARE_HEADLINE,
    shareItems: REPORT_SHARE_ITEMS,
    shareTask: null,
    taskIncludeLedger: false,
    taskLayoutMode: '',
    taskPrimaryLabel: '生成分享图',
    visibilityNotice: '',
    viewerRole: 'member',
  },

  onShow() {
    enableShareMenus()
  },

  async onLoad(query) {
    enableShareMenus()
    const runtime = getSessionRuntime()
    const reportId = typeof query?.reportId === 'string' ? decodeURIComponent(query.reportId) : runtime.reportId || ''
    const briefId = typeof query?.briefId === 'string' ? decodeURIComponent(query.briefId) : ''
    const sessionId = typeof query?.sessionId === 'string' ? decodeURIComponent(query.sessionId) : runtime.sessionId || ''
    const taskId = typeof query?.taskId === 'string' ? decodeURIComponent(query.taskId) : ''
    const sampleFallback = resolveShareFlowSampleFallback(briefId, sessionId, taskId)

    if (!reportId && !briefId && !sessionId && !taskId) {
      this.applyPosterUnavailableState('这张分享图还没有可展示内容')
      this.showPreviewToast('这张分享图还没有可展示内容')
      return
    }

    let toastMessage = ''
    try {
      wx.showLoading({
        title: '加载分享页',
        mask: true,
      })

      const shareConfig = await getManagedShareConfig()
      let fallbackSessionId = sampleFallback.sessionId
      let fallbackBriefId = sampleFallback.briefId

      if (reportId) {
        const report = await getManagedReport(reportId)
        const ranks = Array.isArray(report.ranks) ? report.ranks : []
        const [featuredRank, ...secondaryRanks] = ranks
        fallbackSessionId = report.sessionId || fallbackSessionId

        setSessionRuntime({
          inviteCode: report.inviteCode || runtime.inviteCode || '',
          reportId: report.id,
          sessionId: fallbackSessionId,
          sessionName: report.sessionName || runtime.sessionName,
          templateName: report.templateName || runtime.templateName || '',
        })

        await new Promise<void>((resolve) => {
          this.setData(
            {
              featuredRank: featuredRank || null,
              events: report.events.length ? report.events.slice(0, 4) : [{ text: '聚会暂未记录关键事件' }],
              inviteCode: report.inviteCode || runtime.inviteCode || shareConfig.preview.inviteCode || '',
              posterImagePath: '',
              posterImageUrl: shareConfig.poster.imageUrl,
              posterTitle: shareConfig.poster.title,
              reportId: report.id,
              secondaryRanks,
              sessionId: fallbackSessionId,
              sessionName: report.sessionName || runtime.sessionName || '',
              shareItems: REPORT_SHARE_ITEMS,
            },
            () => resolve(),
          )
        })
      } else {
        this.setData({
          briefId: fallbackBriefId,
          inviteCode: runtime.inviteCode || sampleFallback.inviteCode || shareConfig.preview.inviteCode || '',
          posterImagePath: '',
          posterImageUrl: shareConfig.poster.imageUrl,
          posterTitle: shareConfig.poster.title,
          sessionId: fallbackSessionId,
          sessionName: runtime.sessionName || '',
          shareItems: REPORT_SHARE_ITEMS,
        })
      }

      if (taskId) {
        try {
          const task = await getManagedShareImageTask(taskId)
          fallbackBriefId = task.briefId || fallbackBriefId
          fallbackSessionId = task.sessionId || fallbackSessionId
          this.applyShareTask(task)
        } catch (error) {
          const message = error instanceof Error ? error.message : '分享任务读取失败'
          this.applyShareTaskError(taskId, message)
        }
      }

      await this.loadBriefByQuery({ briefId: fallbackBriefId, sessionId: fallbackSessionId, taskId }, fallbackSessionId)
    } catch (error) {
      const message = error instanceof Error ? error.message : '分享页加载失败'
      const safeMessage = toSafeShareErrorText(message)
      this.applyPosterUnavailableState(safeMessage)
      toastMessage = safeMessage
    } finally {
      wx.hideLoading()
      if (toastMessage) {
        this.showPreviewToast(toastMessage)
      }
    }
  },

  applyBrief(brief) {
    const nextShareTask = this.data.shareTask || buildShareTaskFromBrief(brief)
    const photoHighlights = buildPhotoHighlights(brief.timeline.nodes)
    const contractMetrics = buildPosterMetricsFromContract(brief.accountingHighlights)
    const keyEvents = buildKeyEventsFromContract(brief.eventHighlights)
    const timelineKeyEvents = keyEvents.length ? keyEvents : buildKeyEvents(brief.timeline.nodes)
    const fallbackAccounting = buildAccountingHighlights([], timelineKeyEvents.length)
    const nextMetrics = contractMetrics.length ? contractMetrics : this.data.accountingHighlights.length ? this.data.accountingHighlights : fallbackAccounting.metrics
    const timelineNodes = buildPosterTimelineNodesFromTimeline(brief.timeline.nodes)
    const posterTimelineNodes = timelineNodes.length
      ? timelineNodes
      : buildPosterTimelineNodesFromHighlights(photoHighlights, timelineKeyEvents, nextMetrics)
    this.setData({
      accountingHighlights: nextMetrics,
      briefId: brief.id,
      keyEvents: timelineKeyEvents,
      ledgerRankings: brief.ledgerRankings,
      ledgerSummary: brief.ledgerSummary,
      ledgerCount: this.data.ledgerCount || fallbackAccounting.ledgerCount,
      photoCount: photoHighlights.length,
      photoHighlights,
      posterTimelineNodes,
      posterTitle: cleanShareText(brief.title || '', this.data.posterTitle),
      settlementSummary: brief.settlementSummary,
      sessionId: brief.sessionId || this.data.sessionId,
      sessionName: this.data.sessionName || brief.title || '',
      shareContentFilter: brief.shareContentFilter,
      shareSummary: buildShareSummary(photoHighlights.length, this.data.ledgerCount || fallbackAccounting.ledgerCount, timelineKeyEvents.length),
    })
    if (nextShareTask) {
      this.applyShareTask(nextShareTask)
    } else {
      this.applyShareTask(null)
    }
  },

  applyShareTask(task) {
    const status = task?.status || ''
    const readyShareImageUrl = status === 'ready' && task?.imageUrl ? task.imageUrl : ''
    const taskPrimaryLabel =
      !task || !status
        ? '刷新状态'
        : status === 'ready' && readyShareImageUrl
          ? '刷新状态'
        : status === 'failed' || status === 'expired'
            ? '重新生成'
            : '刷新状态'
    const nextSaveState = status === 'failed' || status === 'expired' ? 'failed' : this.data.saveState === 'failed' ? 'idle' : this.data.saveState

    this.setData({
      briefId: task?.briefId || this.data.briefId,
      errorText: task?.failedReason ? toSafeShareErrorText(task.failedReason) : this.data.errorText,
      ledgerIncluded: task?.ledgerIncluded === true,
      posterImagePath: readyShareImageUrl ? '' : this.data.posterImagePath,
      qrCodeImageUrl: task?.miniProgramQrUrl || task?.qrCodeUrl || this.data.qrCodeImageUrl,
      readyShareImageUrl,
      saveState: nextSaveState,
      savePosterLabel: getSavePosterLabel(status, this.data.posterSaved, Boolean(readyShareImageUrl)),
      sessionId: task?.sessionId || this.data.sessionId,
      shareTask: task,
      taskIncludeLedger: task?.includeLedger === true,
      taskLayoutMode: task?.layoutMode || '',
      displayTaskLayoutMode: getShareLayoutText(task?.layoutMode || ''),
      displayTaskStatus: getShareTaskStatusText(status),
      posterStatusLine: getPosterStatusLine(status, nextSaveState, task?.failedReason ? toSafeShareErrorText(task.failedReason) : this.data.errorText),
      taskPrimaryLabel,
    })
  },

  applyShareTaskError(taskId, message, status = 'failed') {
    const safeMessage = toSafeShareErrorText(message)
    const task = {
      ...buildUnavailableShareTask(taskId, safeMessage, status),
      briefId: this.data.briefId,
      sessionId: this.data.sessionId,
    }
    this.setData({
      errorText: safeMessage,
      ledgerIncluded: true,
      readyShareImageUrl: '',
      saveState: 'failed',
      shareTask: task,
      taskIncludeLedger: true,
      taskLayoutMode: task.layoutMode,
      displayTaskLayoutMode: getShareLayoutText(task.layoutMode),
      displayTaskStatus: getShareTaskStatusText(status),
      posterStatusLine: getPosterStatusLine(status || 'failed', 'failed', safeMessage),
      savePosterLabel: getSavePosterLabel(status || 'failed', false),
      taskPrimaryLabel: '重新生成',
    })
  },

  applyPosterUnavailableState(message) {
    const safeMessage = toSafeShareErrorText(message) || '这张分享图还没有可展示内容'
    const taskId = this.data.shareTask?.id || this.data.briefId || this.data.sessionId || 'share-poster-unavailable'
    const task = this.data.shareTask || {
      ...buildUnavailableShareTask(taskId, safeMessage, 'failed'),
      briefId: this.data.briefId,
      sessionId: this.data.sessionId,
    }

    this.setData({
      errorText: safeMessage,
      ledgerIncluded: true,
      readyShareImageUrl: '',
      saveState: 'failed',
      shareTask: task,
      taskIncludeLedger: true,
      taskLayoutMode: task.layoutMode || 'dual_flow',
      displayTaskLayoutMode: getShareLayoutText(task.layoutMode || 'dual_flow'),
      displayTaskStatus: getShareTaskStatusText(task.status || 'failed'),
      posterStatusLine: getPosterStatusLine(task.status || 'failed', 'failed', safeMessage),
      savePosterLabel: getSavePosterLabel(task.status || 'failed', false),
      taskPrimaryLabel: '重新生成',
    })
  },

  async loadLiveSessionSummary(sessionId) {
    if (!sessionId) {
      return
    }

    const runtime = getSessionRuntime()
    try {
      const liveSession = await getManagedLiveSession(sessionId, this.data.inviteCode || runtime.inviteCode)
      const players = liveSession.joinStatusPlayers.length ? liveSession.joinStatusPlayers : liveSession.joinedPlayers
      const timelineEventCount = this.data.keyEvents.length
      const keyEvents = timelineEventCount ? this.data.keyEvents : buildLedgerKeyEvents(players)
      const { ledgerCount, metrics } = buildAccountingHighlights(players, timelineEventCount)
      const sessionName = liveSession.sessionName || this.data.sessionName || runtime.sessionName || ''

      setSessionRuntime({
        inviteCode: liveSession.inviteCode || runtime.inviteCode || '',
        playerCount: liveSession.playerCount || runtime.playerCount,
        sessionId: liveSession.id || sessionId,
        sessionName,
      })

      this.setData({
        accountingHighlights: metrics,
        inviteCode: liveSession.inviteCode || this.data.inviteCode || runtime.inviteCode || '',
        keyEvents,
        ledgerCount,
        memberCount: liveSession.playerCount || players.length || this.data.memberCount,
        posterTimelineNodes: this.data.posterTimelineNodes.length
          ? this.data.posterTimelineNodes
          : buildPosterTimelineNodesFromHighlights(this.data.photoHighlights, keyEvents, metrics),
        sessionId: liveSession.id || sessionId,
        sessionName,
        shareSummary: buildShareSummary(this.data.photoCount, ledgerCount, keyEvents.length),
      })
    } catch {
      const runtimeStats = (runtime.playerStats || []).map<ManagedSessionPlayer>((item) => ({
        avatarUrl: item.avatarUrl,
        clearedCount: item.clearedCount,
        debtCount: item.debtCount,
        drinkCount: item.drinkCount,
        meta: item.meta,
        name: item.name,
        profileId: item.profileId,
        status: '',
      }))
      const timelineEventCount = this.data.keyEvents.length
      const keyEvents = timelineEventCount ? this.data.keyEvents : buildLedgerKeyEvents(runtimeStats)
      const { ledgerCount, metrics } = buildAccountingHighlights(runtimeStats, timelineEventCount)
      this.setData({
        accountingHighlights: metrics,
        keyEvents,
        ledgerCount,
        memberCount: runtime.playerCount || runtimeStats.length || this.data.memberCount,
        posterTimelineNodes: this.data.posterTimelineNodes.length
          ? this.data.posterTimelineNodes
          : buildPosterTimelineNodesFromHighlights(this.data.photoHighlights, keyEvents, metrics),
        shareSummary: buildShareSummary(this.data.photoCount, ledgerCount, keyEvents.length),
      })
    }
  },

  async loadBriefByQuery(query, fallbackSessionId) {
    if (query.briefId) {
      try {
        const brief = await getManagedSessionBrief(query.briefId)
        this.applyBrief(brief)
        await this.loadLiveSessionSummary(brief.sessionId || fallbackSessionId || this.data.sessionId)
      } catch (error) {
        const message = error instanceof Error ? error.message : '简报读取失败'
        this.setData({
          errorText: this.data.errorText || toSafeShareErrorText(message),
          sessionId: fallbackSessionId || this.data.sessionId,
        })
        await this.loadLiveSessionSummary(fallbackSessionId || this.data.sessionId)
      }
      return
    }

    if (fallbackSessionId) {
      try {
        const brief = await createOrRefreshManagedSessionBrief(fallbackSessionId)
        this.applyBrief(brief)
        await this.loadLiveSessionSummary(brief.sessionId || fallbackSessionId)
      } catch (error) {
        const message = error instanceof Error ? error.message : '简报生成失败'
        this.setData({ errorText: this.data.errorText || toSafeShareErrorText(message) })
        await this.loadLiveSessionSummary(fallbackSessionId)
      }
      return
    }

    if (this.data.shareTask?.briefId) {
      try {
        const brief = await getManagedSessionBrief(this.data.shareTask.briefId)
        this.applyBrief(brief)
        await this.loadLiveSessionSummary(brief.sessionId || this.data.sessionId)
      } catch (error) {
        const message = error instanceof Error ? error.message : '简报读取失败'
        this.setData({ errorText: this.data.errorText || toSafeShareErrorText(message) })
        await this.loadLiveSessionSummary(this.data.sessionId)
      }
    }
  },

  async createShareTask() {
    let briefId = this.data.briefId
    if (!briefId && this.data.sessionId) {
      const brief = await createOrRefreshManagedSessionBrief(this.data.sessionId)
      this.applyBrief(brief)
      briefId = brief.id
    }

    if (!briefId) {
      this.showPreviewToast('未找到可生成分享图的简报')
      return
    }

    const task = await createManagedShareImageTask(briefId, { includeLedger: true, layoutMode: 'dual_flow' })
    this.applyShareTask(task)
    if (!task.id) {
      this.showPreviewToast('分享任务缺少 ID，暂不能生成')
      return
    }
    const processedTask = await processManagedShareImageTask(task.id)
    this.applyShareTask(processedTask)
    const latestTask = await getManagedShareImageTask(processedTask.id || task.id)
    this.applyShareTask(latestTask)
    this.showPreviewToast(latestTask.status === 'ready' && latestTask.imageUrl ? '分享图已生成' : '分享图正在生成，请稍后刷新')
  },

  async refreshShareTask() {
    const taskId = this.data.shareTask?.id || ''
    if (!taskId) {
      const message = '缺少分享任务 ID，无法刷新状态'
      this.setData({ errorText: message, posterStatusLine: getPosterStatusLine('', this.data.saveState, message) })
      this.showPreviewToast(message)
      return
    }

    try {
      const task = await getManagedShareImageTask(taskId)
      this.applyShareTask(task)
    } catch (error) {
      const message = error instanceof Error ? error.message : '分享任务读取失败'
      this.applyShareTaskError(taskId, message)
      throw error
    }
  },

  onShareAppMessage() {
    const sharePath = this.data.reportId
      ? `/pages/share-poster/index?reportId=${encodeURIComponent(this.data.reportId)}`
      : this.data.shareTask?.id
        ? `/pages/share-poster/index?${[
            this.data.sessionId ? `sessionId=${encodeURIComponent(this.data.sessionId)}` : '',
            this.data.briefId ? `briefId=${encodeURIComponent(this.data.briefId)}` : '',
            `taskId=${encodeURIComponent(this.data.shareTask.id)}`,
          ].filter(Boolean).join('&')}`
        : this.data.briefId
          ? `/pages/share-poster/index?${[
              this.data.sessionId ? `sessionId=${encodeURIComponent(this.data.sessionId)}` : '',
              `briefId=${encodeURIComponent(this.data.briefId)}`,
            ].filter(Boolean).join('&')}`
          : `/pages/share-poster/index?sessionId=${encodeURIComponent(this.data.sessionId)}`

    trackAnalyticsEvent({
      type: 'report_share',
      assetId: 'share-1',
      reportId: this.data.reportId,
      meta: {
        sessionId: this.data.sessionId,
        channel: 'share-poster',
      },
    })

    return {
      title: SHARE_HEADLINE,
      path: sharePath,
      imageUrl: this.data.posterImagePath || this.data.posterImageUrl,
    }
  },

  onShareTimeline() {
    const shareQuery = this.data.reportId
      ? `reportId=${encodeURIComponent(this.data.reportId)}`
      : this.data.shareTask?.id
        ? `taskId=${encodeURIComponent(this.data.shareTask.id)}`
        : this.data.briefId
          ? `briefId=${encodeURIComponent(this.data.briefId)}`
          : `sessionId=${encodeURIComponent(this.data.sessionId)}`

    trackAnalyticsEvent({
      type: 'report_share',
      assetId: 'share-1',
      reportId: this.data.reportId,
      meta: {
        sessionId: this.data.sessionId,
        channel: 'share-timeline',
      },
    })

    return {
      title: SHARE_HEADLINE,
      query: shareQuery,
      imageUrl: this.data.posterImagePath || this.data.posterImageUrl,
    }
  },

  handleTimelineTap() {
    enableShareMenus()
    this.showPreviewToast('\u8bf7\u70b9\u51fb\u53f3\u4e0a\u89d2\u83dc\u5355\u5206\u4eab\u5230\u670b\u53cb\u5708')
  },

  handlePreviewTaskTap() {
    const imageUrl = this.data.posterImagePath || ''
    if (!imageUrl) {
      this.showPreviewToast('请先保存生成预览图')
      return
    }

    wx.previewImage({
      current: imageUrl,
      urls: [imageUrl],
    })
  },

  async handleTaskPrimaryTap() {
    const status = this.data.shareTask?.status || ''
    this.setData({ errorText: '', saveState: status === 'failed' || status === 'expired' ? 'retrying' : this.data.saveState })
    const shouldShowLoading = status !== 'ready'
    let toastMessage = ''
    if (shouldShowLoading) {
      wx.showLoading({
        title: '处理中',
        mask: true,
      })
    }

    try {
      if (!this.data.shareTask || !status) {
        await this.createShareTask()
      } else if (status === 'pending' || status === 'processing') {
        await this.refreshShareTask()
      } else if (status === 'ready') {
        await this.refreshShareTask()
      } else if (status === 'failed' || status === 'expired') {
        const task = await retryManagedShareImageTask(this.data.shareTask.id)
        this.applyShareTask(task)
        if (task.id) {
          const processedTask = await processManagedShareImageTask(task.id)
          this.applyShareTask(processedTask)
          const latestTask = await getManagedShareImageTask(processedTask.id || task.id)
          this.applyShareTask(latestTask)
          toastMessage = latestTask.status === 'ready' && latestTask.imageUrl ? '分享图已生成' : '已重新排队，请稍后刷新'
        } else {
          toastMessage = '分享任务缺少 ID，暂不能生成'
        }
        this.setData({ saveState: 'idle' })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '操作失败'
      const safeMessage = toSafeShareErrorText(message)
      this.setData({ errorText: safeMessage, saveState: 'failed' })
      toastMessage = safeMessage
    } finally {
      if (shouldShowLoading) {
        wx.hideLoading()
      }
      if (toastMessage) {
        this.showPreviewToast(toastMessage)
      }
    }
  },

  async handleSaveTap() {
    const taskStatus = this.data.shareTask?.status || ''
    if (this.data.posterSaved) {
      this.handleTimelineTap()
      return
    }
    if (this.data.saveState === 'saving') {
      return
    }
    if (!this.data.shareTask) {
      this.showPreviewToast('请先生成分享图任务')
      return
    }
    if (taskStatus === 'pending' || taskStatus === 'processing') {
      this.showPreviewToast('分享图还在生成中，请刷新状态')
      return
    }
    if (taskStatus === 'failed' || taskStatus === 'expired') {
      this.showPreviewToast('生成失败，请重新生成')
      return
    }
    if (taskStatus !== 'ready' || !this.data.readyShareImageUrl) {
      this.showPreviewToast('分享图还没有生成成功，请刷新状态')
      return
    }

    this.setData({
      errorText: '',
      posterStatusLine: getPosterStatusLine(taskStatus, 'saving'),
      savePosterLabel: getSavePosterLabel(taskStatus, false, Boolean(this.data.readyShareImageUrl)),
      saveState: 'saving',
    })
    try {
      if (isDevtoolsRuntime()) {
        const tempFilePath = await withTimeout(this.ensurePosterImage(), 8000, '分享图生成超时，请重试')
        this.setData({
          errorText: '',
          posterImagePath: tempFilePath,
          posterSaved: true,
          posterStatusLine: getPosterStatusLine(taskStatus, 'saved'),
          savePosterLabel: '去分享',
          saveState: 'saved',
        })
        this.showPreviewToast('预览框已准备分享图')
        return
      }
      const tempFilePath = await withTimeout(this.ensurePosterImage(), 8000, '分享图生成超时，请重试')
      await withTimeout(this.saveImageFile(tempFilePath), 8000, '保存超时，请检查相册权限后重试')
      trackAnalyticsEvent({
        type: 'share_asset_open',
        assetId: 'share-1',
        reportId: this.data.reportId,
        meta: {
          sessionId: this.data.sessionId,
          action: 'save-poster',
        },
      })
      this.setData({ posterSaved: true, savePosterLabel: '去分享' })
      this.setData({ errorText: '', posterStatusLine: getPosterStatusLine(taskStatus, 'saved'), saveState: 'saved' })
      this.showPreviewToast('聚会分享图已保存')
    } catch (error) {
      const message = error instanceof Error ? error.message : '没有保存成功，请检查相册权限'
      const safeMessage = toSafeShareErrorText(message)
      this.setData({
        errorText: safeMessage,
        posterStatusLine: getPosterStatusLine(taskStatus, 'failed', safeMessage),
        savePosterLabel: getSavePosterLabel(taskStatus, false, Boolean(this.data.readyShareImageUrl)),
        saveState: 'failed',
      })
      this.showPreviewToast('没有保存成功，请检查相册权限')
    }
  },

  saveImageFile(filePath) {
    return new Promise<void>((resolve, reject) => {
      const save = () => {
        wx.saveImageToPhotosAlbum({
          filePath,
          success: () => resolve(),
          fail: (error) => {
            const message = String(error?.errMsg || '')
            if (message.includes('auth deny') || message.includes('authorize')) {
              wx.openSetting({
                success: () => reject(error),
                fail: () => reject(error),
              })
              return
            }
            reject(error)
          },
        })
      }

      wx.getSetting({
        success: (setting) => {
          if (setting.authSetting['scope.writePhotosAlbum'] === false) {
            wx.openSetting({
              success: save,
              fail: reject,
            })
            return
          }
          save()
        },
        fail: save,
      })
    })
  },

  downloadImageToFile(imageUrl) {
    const url = imageUrl.startsWith('http') ? imageUrl : `${getApiBase()}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`
    return new Promise((resolve, reject) => {
      wx.downloadFile({
        url,
        header: getUserAuthHeaders(),
        success: (result) => {
          if (result.statusCode >= 200 && result.statusCode < 300 && result.tempFilePath) {
            resolve(result.tempFilePath)
            return
          }
          reject(new Error(`download share image failed: ${result.statusCode}`))
        },
        fail: reject,
      })
    })
  },

  async drawCanvasToFile(width, height) {
    const canvasTimelineNodes = this.data.posterTimelineNodes.length
      ? this.data.posterTimelineNodes.slice(0, 6)
      : buildPosterTimelineNodesFromHighlights(this.data.photoHighlights, this.data.keyEvents, this.data.accountingHighlights)
    const canvasNodes = await Promise.all(
      canvasTimelineNodes.map(async (item) => ({
        ...item,
        localPath: item.type === 'photo' && item.imageUrl ? await this.downloadImageToFile(item.imageUrl).catch(() => '') : '',
      })),
    )

    return new Promise<string>((resolve, reject) => {
      this.setData({ canvasWidth: width, canvasHeight: height }, () => {
        const ctx = wx.createCanvasContext('sharePosterCanvas', this)
        const drawFitText = (value: string, x: number, y: number, maxWidth: number, fontSize: number, color: string) => {
          let content = String(value || '').trim()
          ctx.setFontSize(fontSize)
          ctx.setFillStyle(color)
          if (!content) return
          while (content.length > 1 && ctx.measureText(content).width > maxWidth) {
            content = content.slice(0, -2) + '...'
          }
          ctx.fillText(content, x, y)
        }
        const drawPill = (text: string, x: number, y: number, w: number, h: number, bg: string, color: string, fontSize = 24) => {
          ctx.setFillStyle(bg)
          ctx.fillRect(x, y, w, h)
          drawFitText(text, x + 18, y + Math.floor(h * 0.68), w - 36, fontSize, color)
        }

        ctx.setFillStyle('#090705')
        ctx.fillRect(0, 0, width, height)
        const bg = ctx.createLinearGradient(0, 0, width, height)
        bg.addColorStop(0, '#311309')
        bg.addColorStop(0.34, '#130b08')
        bg.addColorStop(1, '#07171a')
        ctx.setFillStyle(bg)
        ctx.fillRect(0, 0, width, height)

        ctx.setFillStyle('rgba(255,90,61,0.28)')
        ctx.beginPath()
        ctx.arc(width - 120, 160, 150, 0, Math.PI * 2)
        ctx.fill()
        ctx.setFillStyle('rgba(99,223,174,0.14)')
        ctx.beginPath()
        ctx.arc(140, height - 220, 160, 0, Math.PI * 2)
        ctx.fill()

        ctx.setStrokeStyle('rgba(255,244,222,0.22)')
        ctx.setLineWidth(3)
        ctx.strokeRect(54, 58, width - 108, height - 116)
        drawFitText('聚会记录师', 82, 132, width - 164, 30, '#fff4e8')
        drawPill(`${this.data.displayTaskStatus || '可保存'} · ${this.data.displayTaskLayoutMode || '照片和账本'}`, width - 312, 92, 230, 54, 'rgba(99,223,174,0.16)', '#9df1c8', 22)
        drawFitText('聚会分享预览', 82, 230, width - 164, 64, '#ffffff')
        drawFitText('按时间节点保存这场聚会', 82, 286, width - 164, 28, '#f5dac8')

        const timelineX = 122
        const timelineY = 356
        const rowH = 126
        ctx.setFillStyle('rgba(0,0,0,0.44)')
        ctx.fillRect(82, timelineY - 34, width - 164, 790)
        drawFitText('记录时间线', 116, timelineY + 8, width - 232, 34, '#ffdca8')
        ctx.setStrokeStyle('rgba(255,224,153,0.46)')
        ctx.setLineWidth(4)
        ctx.beginPath()
        ctx.moveTo(timelineX, timelineY + 48)
        ctx.lineTo(timelineX, timelineY + 650)
        ctx.stroke()

        if (canvasNodes.length) {
          canvasNodes.slice(0, 6).forEach((item, index) => {
            const y = timelineY + 66 + index * rowH
            const dotColor = item.tone === 'drink' ? '#5df0be' : item.tone === 'debt' ? '#ffce6a' : item.tone === 'photo' ? '#ff6846' : '#ffdca8'
            ctx.setFillStyle(dotColor)
            ctx.beginPath()
            ctx.arc(timelineX, y, 15, 0, Math.PI * 2)
            ctx.fill()
            drawFitText(item.time || '时间未记录', 146, y + 8, 86, 20, '#f5dac8')
            ctx.setFillStyle('rgba(255,244,222,0.1)')
            ctx.fillRect(244, y - 42, width - 326, 86)
            if (item.type === 'photo') {
              ctx.setFillStyle('#fff4de')
              ctx.fillRect(262, y - 30, 70, 58)
              if (item.localPath) {
                ctx.drawImage(item.localPath, 266, y - 26, 62, 50)
              } else {
                drawFitText('照片', 278, y + 4, 42, 18, '#2a1c13')
              }
              drawFitText(cleanShareText(item.title, '拍下精彩瞬间'), 350, y - 8, 280, 24, '#ffffff')
              drawFitText(cleanShareEventText(item.meta, '聚会照片'), 350, y + 24, 300, 19, '#cbb8aa')
            } else {
              drawFitText(cleanShareEventText(item.title, '账本变动'), 270, y - 8, 280, 24, '#ffffff')
              drawFitText(cleanShareEventText(item.meta, '有新的聚会记录'), 270, y + 24, 390, 19, '#cbb8aa')
            }
          })
        } else {
          drawFitText('暂无可保存节点，先去记录照片或账本变动', 126, timelineY + 112, width - 252, 28, '#fff8ec')
        }

        const summaryY = 1192
        ctx.setFillStyle('#fff4e8')
        ctx.fillRect(82, summaryY, width - 164, 268)
        drawFitText('聚会总结', 116, summaryY + 50, 180, 28, '#2a1c13')
        drawFitText(this.data.shareSummary, 116, summaryY + 98, width - 232, 28, '#24160f')
        drawFitText('房间码', 116, summaryY + 170, 180, 24, '#6a4b38')
        drawFitText(this.data.inviteCode || '待生成', 116, summaryY + 230, 360, 58, '#24160f')
        drawFitText(this.data.qrCodeImageUrl ? '小程序码已接入' : '小程序码待接入真实字段', width - 292, summaryY + 142, 190, 24, '#6a4b38')

        ctx.draw(false, () => {
          wx.canvasToTempFilePath(
            {
              canvasId: 'sharePosterCanvas',
              width,
              height,
              destWidth: width,
              destHeight: height,
              success: (result) => resolve(result.tempFilePath),
              fail: reject,
            },
            this,
          )
        })
      })
    })
  },

  async ensurePosterImage() {
    if (this.data.posterImagePath) {
      return this.data.posterImagePath
    }

    const filePath = await this.buildPosterImage()
    this.setData({ posterImagePath: filePath })
    return filePath
  },

  async buildPosterImage() {
    if (this.data.readyShareImageUrl) {
      return this.downloadImageToFile(this.data.readyShareImageUrl)
    }
    if (this.data.reportId) {
      try {
        return await this.downloadImageToFile(`/reports/${encodeURIComponent(this.data.reportId)}/poster.png`)
      } catch {
        return this.drawCanvasToFile(CANVAS_WIDTH, CANVAS_HEIGHT)
      }
    }
    return this.drawCanvasToFile(CANVAS_WIDTH, CANVAS_HEIGHT)
  },

  handleBackTap() {
    wx.navigateBack({
      fail: () => {
        this.applyPosterUnavailableState(this.data.errorText || '当前分享页已保留，可继续重试或返回相册')
        this.showPreviewToast('已停留在分享页，可继续重试')
      },
    })
  },

  handleFinishShareTap() {
    wx.navigateTo({
      url: '/pages/album/index',
      fail: () => {
        this.showPreviewToast('相册暂时打不开，请稍后重试')
      },
    })
  },

  handleCreateTap() {
    wx.navigateTo({
      url: '/pages/create-session/index',
      fail: () => {
        wx.redirectTo({
          url: '/pages/create-session/index',
        })
      },
    })
  },

  handlePhotoImageLoad(event) {
    const { id } = event.currentTarget.dataset as { id?: string }
    const detail = (event as unknown as { detail?: { height?: number; width?: number } }).detail || {}
    if (!id || Number(detail.width) >= 8 || Number(detail.height) >= 8) {
      return
    }
    this.setData({
      photoHighlights: this.data.photoHighlights.map((item) => (item.id === id ? { ...item, imageBroken: true } : item)),
      posterTimelineNodes: this.data.posterTimelineNodes.map((item) => (item.id === id ? { ...item, imageBroken: true } : item)),
    })
  },

  handlePhotoImageError(event) {
    const { id } = event.currentTarget.dataset as { id?: string }
    if (!id) {
      return
    }
    this.setData({
      photoHighlights: this.data.photoHighlights.map((item) => (item.id === id ? { ...item, imageBroken: true } : item)),
      posterTimelineNodes: this.data.posterTimelineNodes.map((item) => (item.id === id ? { ...item, imageBroken: true } : item)),
    })
  },

  handleReportHintTap() {
    this.showPreviewToast('举报入口待后台联调，当前可先联系发起人处理')
  },

  showPreviewToast(message) {
    wx.showToast({
      title: message,
      icon: 'none',
    })
  },
})

export {}
