import {
  formatElapsed,
  getSessionRuntime,
  hasSessionFirstPhoto,
  markSessionFirstPhotoUploaded,
  markSessionEndedOverride,
  resolveSessionParticipants,
  setSessionRuntime,
  type SessionParticipant,
  type SessionPlayerStat,
} from '../../utils/session'
import {
  createManagedSessionEvent,
  cleanupManagedMomentUpload,
  createManagedMoment,
  finishManagedSession,
  getManagedLiveSession,
  getManagedSessionTimeline,
  updateManagedSession,
  uploadManagedMomentImage,
  type ManagedTimelineNode,
} from '../../services/operations'
import { getApiBase } from '../../config/api'
import { normalizeManagedAssetPath } from '../../config/assets'
import { confirmLeaveSessionPage, disableSessionLeaveAlert, enableSessionLeaveAlert } from '../../utils/session-exit'
import { ensureUserAuthorized, getCurrentDisplayProfile, getUserAuthHeaders } from '../../utils/social'
import { resolveCachedManagedImagePath } from '../../utils/imageCache'

interface LivePlayer {
  avatarUrl: string
  initial: string
  name: string
  profileId?: string
}

interface LiveRecordItem {
  avatarUrl: string
  clearedCount: number
  debtCount: number
  drinkCount: number
  id: string
  meta: string
  name: string
  profileId?: string
}

interface LiveEvent {
  text: string
}

interface LivePhotoNode {
  caption: string
  imageBroken?: boolean
  id: string
  imageUrl: string
  nodeKind: string
  timelineTitle: string
}

interface LiveLedgerTimelineItem {
  detail: string
  id: string
  scoreText: string
  title: string
  type: 'add' | 'debt' | 'other'
  typeText: string
}

interface LiveRecordTimelineItem {
  actorAvatarUrl: string
  actorInitial: string
  actorName: string
  caption: string
  chipAsset: string
  chipText: string
  chipTextVisible: boolean
  createdAt: string
  detail: string
  iconAsset: string
  id: string
  imageBroken?: boolean
  imageUrl: string
  nodeKind: 'event' | 'moment'
  scoreText: string
  timeText: string
  title: string
  actionLabel: string
  type: 'debt' | 'drink' | 'photo'
}

interface LiveTimelinePhotoDiagnostic {
  hasRenderableImage: boolean
  id: string
  imageBroken: boolean
  renderedTail: string
  renderedType: string
  sourceTail: string
  sourceType: string
}

interface LiveRecordTimelineDisplayItem extends LiveRecordTimelineItem {
  compactPhotoCountText: string
  compactPhotos: LiveRecordTimelineItem[]
  displayKind: 'node' | 'photoGroup'
}

interface LiveSessionEvent {
  createdAt?: string
  label?: string
  text?: string
  type?: string
}

interface LiveRecordState {
  activeSegment: 'album' | 'ledger' | 'record' | 'share'
  canvasHeight: number
  canvasWidth: number
  desktopModeLabel: string
  elapsedText: string
  events: LiveEvent[]
  finishMatchLabel: string
  finishSaving: boolean
  isJudge: boolean
  ledgerDirty: boolean
  ledgerSubmitting: boolean
  memberCountText: string
  playerCount: number
  players: LivePlayer[]
  sharePosterSaved: boolean
  quickPhotoSaving: boolean
  baselineRecords: LiveRecordItem[]
  records: LiveRecordItem[]
  sessionId: string
  sessionName: string
  sessionEnded: boolean
  sessionEndedAt: string
  startTimeText: string
  hiddenTimelineNotice: string
  ledgerTimelineItems: LiveLedgerTimelineItem[]
  photoNodes: LivePhotoNode[]
  recordTimelineDisplayItems: LiveRecordTimelineDisplayItem[]
  recordTimelineItems: LiveRecordTimelineItem[]
  titleImageSrc: string
  timelineEmptyText: string
  timelineLoading: boolean
  timelineNodes: ManagedTimelineNode[]
  timelinePhotoDiagnostics: LiveTimelinePhotoDiagnostic[]
}

interface LiveRecordMethods {
  applyWheelResult: () => void
  hydrateManagedSession: (sessionId: string, role?: string) => Promise<void>
  handleRefreshTap: () => Promise<void>
  handleAddPlayerTap: () => void
  handleAdjustTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handleBackTap: () => Promise<void>
  handleSaveEndedPosterTap: () => Promise<void>
  handleConfirmLedgerTap: () => Promise<void>
  handleFinishTap: () => Promise<void>
  handleHighlightMomentTap: () => Promise<void>
  handlePhotoImageError: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handlePhotoImageLoad: (event: WechatMiniprogram.BaseEvent) => void
  handleLedgerTap: () => Promise<void>
  handleNextRoundTap: () => void
  handleTimerTick: () => void
  handleTimelineSelect: (event: WechatMiniprogram.BaseEvent | WechatMiniprogram.CustomEvent<{ id: string; nodeKind: string }>) => void
  loadTimeline: () => Promise<void>
  openPage: (url: string) => void
  handleSaveTap: () => Promise<void>
  handleSegmentTap: (event: WechatMiniprogram.BaseEvent) => void
  handleWheelTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  createLedgerEventsForDiff: (previousRecords: LiveRecordItem[], nextRecords: LiveRecordItem[]) => Promise<boolean>
  createQuickPhotoMoment: (filePath: string) => Promise<void>
  buildLiveRecordPosterImage: () => Promise<string>
  downloadPosterImageToFile: (imageUrl: string) => Promise<string>
  persistRecordsToManagedSession: (records: LiveRecordItem[]) => Promise<boolean>
  saveEndedPosterToAlbum: () => Promise<void>
  saveImageFile: (filePath: string) => Promise<void>
  showPreviewToast: (message: string) => void
  syncRecordsToRuntime: (records: LiveRecordItem[]) => void
}

const JUDGE_WHEEL_RESULT_KEY = 'judge-wheel-result'
const LIVE_RECORD_POSTER_CANVAS_ID = 'liveRecordPosterCanvas'
const LIVE_RECORD_POSTER_WIDTH = 750
const LIVE_RECORD_POSTER_MIN_HEIGHT = 1120
const LIVE_RECORD_QR_FALLBACK = normalizeManagedAssetPath('/static/share-poster-miniapp-code.png')
const MAX_CLEAR_PER_PLAYER = 3
const SAMPLE_008AS_SESSION_ID = 'session-1781787045680-8e406c'
const SAMPLE_008AS_SESSION_NAME = '周末聚会记录'
const SAMPLE_008AS_TITLE_ASSET = ''
let liveTimer = 0

const internalDisplayPattern = /(PR\s+Seed|PR-BE-DB-LOGIN|IT-MOMENTS|DEBUG|openid|openId|unionId|signature)/i

const cleanDisplayName = (value?: string, fallback = '成员') => {
  const text = String(value || '').trim()
  if (!text || internalDisplayPattern.test(text)) {
    return fallback
  }
  return text
}

const cleanSessionName = (value?: string, fallback = '聚会记录') =>
  cleanDisplayName(value, fallback).replace(/露营相册/g, '聚会记录') || fallback

const getInitial = (name: string) => cleanDisplayName(name, '友').slice(0, 1) || '友'

const buildMomentFileName = (filePath: string) => {
  const ext = /\.jpe?g$/i.test(filePath) ? 'jpg' : /\.webp$/i.test(filePath) ? 'webp' : 'png'
  return `live-photo-${Date.now()}.${ext}`
}

const buildImageDataUrl = (filePath: string, data: string) => {
  const mime = /\.jpe?g$/i.test(filePath) ? 'image/jpeg' : /\.webp$/i.test(filePath) ? 'image/webp' : 'image/png'
  return `data:${mime};base64,${data}`
}

const readLocalImageAsDataUrl = (filePath: string): Promise<string> =>
  new Promise((resolve, reject) => {
    wx.getFileSystemManager().readFile({
      filePath,
      encoding: 'base64',
      success: (result) => {
        const data = String(result.data || '')
        if (!data) {
          reject(new Error('图片读取失败'))
          return
        }
        resolve(buildImageDataUrl(filePath, data))
      },
      fail: reject,
    })
  })

const formatTimelineTime = (value?: string) => {
  const time = value ? new Date(value) : null
  if (!time || Number.isNaN(time.getTime())) {
    return '时间未记录'
  }
  return `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`
}

const resolveTitleImageSrc = (sessionName?: string, sessionId?: string) => {
  const cleanName = cleanDisplayName(sessionName, '')
  if (cleanName === SAMPLE_008AS_SESSION_NAME || sessionId === SAMPLE_008AS_SESSION_ID) {
    return SAMPLE_008AS_TITLE_ASSET
  }
  return ''
}

const buildMemberCountText = (joinedCount: number, playerCount: number) => {
  const joined = Math.max(0, joinedCount || 0)
  const total = Math.max(playerCount || joined, joined)
  return total ? `${joined}/${total} 人` : '成员待加入'
}

const formatStartTimeText = (value?: number | string) => {
  const date = value ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) {
    return '开始时间未记录'
  }
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const isEndedState = (value?: string) => /已结束|结束|ended|finished|closed|complete|completed|done/i.test(String(value || ''))

const isForbiddenError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error || '')
  return /forbidden|403|无权限|权限/i.test(message)
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

const resolveSessionStartTime = (
  runtimeStartedAt: number,
  liveSession: { createdAt?: string; startedAt?: string; updatedAt?: string },
  hasFirstPhoto: boolean,
) => {
  if (!hasFirstPhoto) return 0
  if (runtimeStartedAt) return runtimeStartedAt
  const source = liveSession.startedAt || liveSession.createdAt || liveSession.updatedAt || ''
  const timestamp = source ? new Date(source).getTime() : 0
  return Number.isFinite(timestamp) ? timestamp : 0
}

const mergeRuntimeAvatar = (profileId?: string, avatarUrl = '', runtime = getSessionRuntime()) => {
  if (avatarUrl) return avatarUrl
  if (profileId && runtime.currentUser?.id === profileId && runtime.currentUser.avatarUrl) return runtime.currentUser.avatarUrl
  const matched = (runtime.selectedPlayers || []).find((item) => item.profileId === profileId)
  return matched?.avatarUrl || ''
}

const buildPlayers = (runtime = getSessionRuntime()): LivePlayer[] =>
  resolveSessionParticipants(runtime)
    .slice(0, runtime.playerCount)
    .map((item, index) => ({
      avatarUrl: mergeRuntimeAvatar(item.profileId, item.avatarUrl),
      initial: getInitial(cleanDisplayName(item.name, `成员 ${index + 1}`)),
      name: cleanDisplayName(item.name, `成员 ${index + 1}`),
      profileId: item.profileId,
    }))

const buildRecordId = (player: LivePlayer, index: number) => player.profileId || `player-${index + 1}`

const buildDefaultMeta = (player: SessionParticipant | LivePlayer) =>
  ('status' in player && player.status) || ''

const buildRecords = (players: LivePlayer[], runtime = getSessionRuntime()): LiveRecordItem[] => {
  const statMap = new Map(runtime.playerStats.map((item) => [item.profileId || item.name, item]))

  return players.map((player, index) => {
    const id = buildRecordId(player, index)
    const stat = statMap.get(player.profileId || player.name)

    return {
      avatarUrl: mergeRuntimeAvatar(player.profileId, player.avatarUrl),
      clearedCount: stat?.clearedCount || 0,
      debtCount: stat?.debtCount || 0,
      drinkCount: stat?.drinkCount || 0,
      id,
      meta: stat?.meta || buildDefaultMeta(player),
      name: cleanDisplayName(player.name, `成员 ${index + 1}`),
      profileId: player.profileId,
    }
  })
}

const buildSessionEvents = (
  sessionName: string,
  players: LivePlayer[],
  wheelPlayers: Array<{ name?: string; wheelHistory?: LiveSessionEvent[] }>,
): LiveEvent[] => {
  const wheelEvents = wheelPlayers
    .flatMap((player) => {
      const name = player.name || '未知成员'
      return (player.wheelHistory || [])
        .filter((item) => !!item?.text)
        .map((item) => ({
          createdAt: item.createdAt || '',
            text: `${name} ${item.label || '转盘'}：${item.text || ''}`,
        }))
    })
    .sort((left, right) => {
      const leftTs = left.createdAt ? new Date(left.createdAt).getTime() : 0
      const rightTs = right.createdAt ? new Date(right.createdAt).getTime() : 0
      return rightTs - leftTs
    })
    .slice(0, 4)

  if (wheelEvents.length) {
    return wheelEvents
  }

  return buildInitialEvents(sessionName, players)
}

const buildInitialEvents = (sessionName: string, players: LivePlayer[]): LiveEvent[] => {
  if (!players.length) {
    return [{ text: `${sessionName} 已创建，等待成员加入。` }]
  }

  return [{ text: `${sessionName} 当前已有 ${players.length} 位成员加入，等待发起人开始记录。` }]
}

const buildEventDetail = (node: ManagedTimelineNode) => {
  if (node.nodeKind !== 'event') {
    return ''
  }
  const operator = cleanDisplayName(node.operatorName, '成员')
  const target = cleanDisplayName(node.targetName, '成员')
  const delta = Number(node.scoreDelta) || 0
  const score = Math.abs(delta) || 1
  if (node.eventType === 'drink_debt') {
    return delta < 0 ? `${target} 消酒 ${score} 杯` : `${operator} 给 ${target} 记了 ${score} 杯欠酒`
  }
  if (node.eventType === 'drink_add') {
    return delta < 0 ? `${operator} 为 ${target} 减少加酒 ${score} 杯` : `${operator} 为 ${target} 加了 ${score} 杯酒`
  }
  return node.caption || `${operator} 记录了 ${target}`
}

const buildTimelineViewState = (nodes: ManagedTimelineNode[], records: LiveRecordItem[] = []) => {
  const photoNodes: LivePhotoNode[] = []
  const ledgerTimelineItems: LiveLedgerTimelineItem[] = []
  const recordTimelineItems: LiveRecordTimelineItem[] = []
  const recordMap = new Map(records.map((item) => [item.profileId || item.id || item.name, item]))
  let hiddenCount = 0

  nodes.forEach((node) => {
    if (node.nodeKind === 'event') {
      const isLedgerEvent = node.eventType === 'drink_debt' || node.eventType === 'drink_add'
      if (isLedgerEvent) {
        const target = recordMap.get(node.targetProfileId) || recordMap.get(node.targetName)
        const targetName = cleanDisplayName(node.targetName, target?.name || '成员')
        const operatorName = cleanDisplayName(node.operatorName, '成员')
        const delta = Number(node.scoreDelta) || 0
        const score = Math.abs(delta) || 1
        const signText = delta < 0 ? '-' : '+'
        const chipAsset = ''
        ledgerTimelineItems.push({
          detail: buildEventDetail(node),
          id: node.id,
          scoreText: `${score} 杯`,
          title: node.eventType === 'drink_debt' ? (delta < 0 ? '消酒记录' : '欠酒记录') : (delta < 0 ? '减少加酒' : '加酒记录'),
          type: node.eventType === 'drink_debt' ? 'debt' : 'add',
          typeText: node.eventType === 'drink_debt' ? '欠酒' : '加酒',
        })
        recordTimelineItems.push({
          actionLabel: node.eventType === 'drink_debt' ? '欠酒' : '加酒',
          actorAvatarUrl: mergeRuntimeAvatar(node.targetProfileId, node.targetAvatarUrl || target?.avatarUrl || ''),
          actorInitial: getInitial(targetName),
          actorName: targetName,
          caption: '',
          chipAsset,
          chipText: node.eventType === 'drink_debt' ? `欠酒 ${signText}${score}` : `加酒 ${signText}${score}`,
          chipTextVisible: chipAsset.includes('plate-'),
          createdAt: node.createdAt || node.updatedAt || '',
          detail:
            node.eventType === 'drink_debt'
              ? (delta < 0 ? `${targetName} 消酒 ${score} 杯` : `${operatorName} 给 ${targetName} 记了 ${score} 杯欠酒`)
              : (delta < 0 ? `${operatorName} 为 ${targetName} 减少加酒 ${score} 杯` : `${operatorName} 为 ${targetName} 加了 ${score} 杯酒`),
          iconAsset: '',
          id: node.id,
          imageUrl: '',
          nodeKind: 'event',
          scoreText: `${score} 杯`,
          timeText: formatTimelineTime(node.createdAt || node.updatedAt),
          title: node.eventType === 'drink_debt' ? (delta < 0 ? '消酒变动' : '欠酒变动') : (delta < 0 ? '减少加酒' : '加酒变动'),
          type: node.eventType === 'drink_debt' ? 'debt' : 'drink',
        })
      }
      return
    }

    if (node.imageUrl) {
      photoNodes.push({
        caption: node.caption || '',
        id: node.id,
        imageUrl: node.imageUrl,
        nodeKind: node.nodeKind,
        timelineTitle: node.timelineTitle || node.caption || '聚会照片',
      })
      recordTimelineItems.push({
        actionLabel: '拍照',
        actorAvatarUrl: mergeRuntimeAvatar(node.uploaderProfileId, node.uploaderAvatarUrl || ''),
        actorInitial: getInitial(cleanDisplayName(node.uploaderName, '成员')),
        actorName: cleanDisplayName(node.uploaderName, '成员'),
        caption: node.caption || '',
        chipAsset: '',
        chipText: '',
        chipTextVisible: false,
        createdAt: node.createdAt || node.updatedAt || '',
        detail: node.caption || '照片已进入相册和分享记录',
        iconAsset: '',
        id: node.id,
        imageUrl: node.imageUrl,
        nodeKind: 'moment',
        scoreText: '',
        timeText: formatTimelineTime(node.createdAt || node.updatedAt),
        title: node.timelineTitle || node.caption || '拍下聚会照片',
        type: 'photo',
      })
      return
    }

    if (node.isTimelinePlaceholder || node.nodeType === 'private' || node.visibility === 'private') {
      hiddenCount += 1
    }
  })

  recordTimelineItems.sort((left, right) => {
    const leftTs = left.createdAt ? new Date(left.createdAt).getTime() : 0
    const rightTs = right.createdAt ? new Date(right.createdAt).getTime() : 0
    return leftTs - rightTs
  })

  return {
    hiddenTimelineNotice: hiddenCount ? `${hiddenCount} 条私密记录已收起，仅在授权后展示` : '',
    ledgerTimelineItems,
    photoNodes,
    recordTimelineItems,
  }
}

const toDisplayNode = (item: LiveRecordTimelineItem): LiveRecordTimelineDisplayItem => ({
  ...item,
  compactPhotoCountText: '',
  compactPhotos: [],
  displayKind: 'node',
})

const buildRecordTimelineDisplayItems = (items: LiveRecordTimelineItem[]): LiveRecordTimelineDisplayItem[] => {
  return items.map(toDisplayNode)
}

const findLiveRecordImageUrl = (
  id: string,
  photoNodes: LivePhotoNode[],
  recordTimelineItems: LiveRecordTimelineItem[],
) =>
  photoNodes.find((item) => item.id === id)?.imageUrl ||
  recordTimelineItems.find((item) => item.id === id)?.imageUrl ||
  ''

const updateLiveRecordImageState = (
  id: string,
  patch: Partial<Pick<LivePhotoNode, 'imageBroken' | 'imageUrl'>>,
  photoNodes: LivePhotoNode[],
  recordTimelineItems: LiveRecordTimelineItem[],
) => {
  const nextPhotoNodes = photoNodes.map((item) => (item.id === id ? { ...item, ...patch } : item))
  const nextRecordTimelineItems = recordTimelineItems.map((item) => (item.id === id ? { ...item, ...patch } : item))

  return {
    photoNodes: nextPhotoNodes,
    recordTimelineDisplayItems: buildRecordTimelineDisplayItems(nextRecordTimelineItems),
    recordTimelineItems: nextRecordTimelineItems,
  }
}

const resolveImageDebugType = (source?: string) => {
  const text = String(source || '').trim()
  if (!text) {
    return 'empty'
  }
  if (/^(wxfile|file):\/\//i.test(text) || /\/__tmp__\//i.test(text) || /\/tmp\//i.test(text)) {
    return 'local-temp'
  }
  if (/\/__store__\//i.test(text)) {
    return 'local-store'
  }
  if (/^https?:\/\//i.test(text)) {
    return /\/uploads\//i.test(text) ? 'remote-upload' : 'remote-other'
  }
  if (text.startsWith('/uploads/')) {
    return 'relative-upload'
  }
  if (text.startsWith('/assets/')) {
    return 'bundled-asset'
  }
  return 'other'
}

const resolveImageDebugTail = (source?: string) => {
  const text = String(source || '').trim().replace(/[?#].*$/, '')
  if (!text) {
    return ''
  }
  return text.split('/').filter(Boolean).slice(-2).join('/')
}

const buildTimelinePhotoDiagnostics = (
  timelineNodes: ManagedTimelineNode[],
  photoNodes: LivePhotoNode[],
  recordTimelineItems: LiveRecordTimelineItem[],
): LiveTimelinePhotoDiagnostic[] => {
  const renderedById = new Map<string, LivePhotoNode | LiveRecordTimelineItem>()
  photoNodes.forEach((item) => renderedById.set(item.id, item))
  recordTimelineItems.forEach((item) => {
    if (item.type === 'photo') {
      renderedById.set(item.id, item)
    }
  })

  return timelineNodes
    .filter((node) => node.nodeKind === 'moment')
    .map((node) => {
      const rendered = renderedById.get(node.id)
      const source = 'imageUrl' in node ? node.imageUrl || '' : ''
      const renderedImageUrl = rendered?.imageUrl || ''
      const imageBroken = Boolean(rendered?.imageBroken)
      return {
        hasRenderableImage: Boolean(renderedImageUrl && !imageBroken),
        id: node.id,
        imageBroken,
        renderedTail: resolveImageDebugTail(renderedImageUrl),
        renderedType: resolveImageDebugType(renderedImageUrl),
        sourceTail: resolveImageDebugTail(source),
        sourceType: resolveImageDebugType(source),
      }
    })
}

const resolveLiveRecordTimelineImages = async (viewState: ReturnType<typeof buildTimelineViewState>) => {
  return {
    ...viewState,
    photoNodes: viewState.photoNodes.map((item) => ({ ...item, imageUrl: item.imageUrl.trim(), imageBroken: false })),
    recordTimelineItems: viewState.recordTimelineItems.map((item) => ({
      ...item,
      imageBroken: item.imageUrl ? false : item.imageBroken,
      imageUrl: item.imageUrl ? item.imageUrl.trim() : item.imageUrl,
    })),
  }
}

const buildRecordsWithLedgerEvents = (records: LiveRecordItem[], nodes: ManagedTimelineNode[]) => {
  const ledgerNodes = nodes.filter((node) => node.nodeKind === 'event' && (node.eventType === 'drink_debt' || node.eventType === 'drink_add'))
  if (!ledgerNodes.length) {
    return records
  }

  const nextRecords = records.map((item) => ({
    ...item,
    debtCount: 0,
    drinkCount: 0,
  }))
  const recordMap = new Map<string, LiveRecordItem>()
  nextRecords.forEach((item) => {
    if (item.profileId) recordMap.set(item.profileId, item)
    recordMap.set(item.name, item)
    recordMap.set(item.id, item)
  })

  ledgerNodes.forEach((node) => {
    if (node.nodeKind !== 'event') {
      return
    }
    const targetName = cleanDisplayName(node.targetName, '')
    const target = (node.targetProfileId && recordMap.get(node.targetProfileId)) || (targetName && recordMap.get(targetName))
    if (!target) {
      return
    }
    const delta = Number(node.scoreDelta) || 0
    const score = Math.abs(delta) || 1
    if (node.eventType === 'drink_debt') {
      target.debtCount = Math.max(0, target.debtCount + (delta < 0 ? -score : score))
    }
    if (node.eventType === 'drink_add') {
      target.drinkCount = Math.max(0, target.drinkCount + (delta < 0 ? -score : score))
    }
  })

  return nextRecords
}

const toPlayerStats = (records: LiveRecordItem[]): SessionPlayerStat[] =>
  records.map((item) => ({
    avatarUrl: mergeRuntimeAvatar(item.profileId, item.avatarUrl),
    clearedCount: item.clearedCount,
    debtCount: item.debtCount,
    drinkCount: item.drinkCount,
    meta: item.meta,
    name: item.name,
    profileId: item.profileId,
  }))

Page<LiveRecordState, LiveRecordMethods>({
  data: {
    activeSegment: 'record',
    canvasHeight: LIVE_RECORD_POSTER_MIN_HEIGHT,
    canvasWidth: LIVE_RECORD_POSTER_WIDTH,
    desktopModeLabel: '打开账本',
    elapsedText: '00:00:00',
    playerCount: 0,
    players: [],
    finishMatchLabel: '结束聚会',
    finishSaving: false,
    isJudge: false,
    ledgerDirty: false,
    ledgerSubmitting: false,
    memberCountText: '成员待加入',
    records: [],
    sharePosterSaved: false,
    quickPhotoSaving: false,
    baselineRecords: [],
    sessionId: '',
    sessionName: '',
    sessionEnded: false,
    sessionEndedAt: '',
    startTimeText: '开始时间未记录',
    events: [],
    hiddenTimelineNotice: '',
    ledgerTimelineItems: [],
    photoNodes: [],
    recordTimelineDisplayItems: [],
    recordTimelineItems: [],
    titleImageSrc: '',
    timelineEmptyText: '还没有精彩瞬间，先记录一条',
    timelineLoading: false,
    timelineNodes: [],
    timelinePhotoDiagnostics: [],
  },

  async onLoad(query) {
    enableSessionLeaveAlert()
    const sessionIdFromQuery = typeof query?.sessionId === 'string' ? decodeURIComponent(query.sessionId) : ''
    const roleFromQuery = typeof query?.role === 'string' ? decodeURIComponent(query.role) : ''
    const redirect = `/pages/live-record/index${sessionIdFromQuery ? `?sessionId=${encodeURIComponent(sessionIdFromQuery)}${roleFromQuery ? `&role=${encodeURIComponent(roleFromQuery)}` : ''}` : ''}`
    const profile = await ensureUserAuthorized(redirect)
    if (!profile) return
    const displayProfile = await getCurrentDisplayProfile().catch(() => profile)
    setSessionRuntime({
      currentUser: {
        avatarUrl: displayProfile.avatarUrl || profile.avatarUrl,
        id: profile.id,
        name: cleanDisplayName(displayProfile.name || profile.name, '发起人'),
      },
    })

    const runtime = getSessionRuntime()
    const sessionId = query?.sessionId ? decodeURIComponent(query.sessionId) : runtime.sessionId || ''
    const role = query?.role ? decodeURIComponent(query.role) : ''
    const sessionName = cleanSessionName(query?.sessionName ? decodeURIComponent(query.sessionName) : runtime.sessionName)

    if (sessionId) {
      try {
        await this.hydrateManagedSession(sessionId, role)
        this.handleTimerTick()
        return
      } catch (error) {
        wx.showToast({
          title: error instanceof Error ? error.message : '聚会加载失败',
          icon: 'none',
        })
      }
    }

    const isJudge = false
    const players = buildPlayers(runtime)
    const records = buildRecords(players, runtime)

    this.setData({
      isJudge,
      playerCount: runtime.playerCount,
      players,
      baselineRecords: records.map((item) => ({ ...item })),
      records,
      sessionId,
      sessionName,
      memberCountText: buildMemberCountText(players.length, runtime.playerCount),
      startTimeText: formatStartTimeText(runtime.startedAt),
      titleImageSrc: resolveTitleImageSrc(sessionName, sessionId),
      events: buildInitialEvents(sessionName, players),
    })

    this.syncRecordsToRuntime(records)
    this.handleTimerTick()
  },

  async hydrateManagedSession(sessionId, role = '') {
    const runtime = getSessionRuntime()
    const liveSession = await getManagedLiveSession(sessionId, runtime.inviteCode)
    void role
    const inferredIsJudge = Boolean(liveSession.hostProfileId && runtime.currentUser?.id && liveSession.hostProfileId === runtime.currentUser.id)
    const players = liveSession.joinStatusPlayers
      .slice(0, liveSession.playerCount)
      .map((item, index) => ({
        avatarUrl: mergeRuntimeAvatar(item.profileId, item.avatarUrl),
        initial: getInitial(cleanDisplayName(item.name, `成员 ${index + 1}`)),
        name: cleanDisplayName(item.name, `成员 ${index + 1}`),
        profileId: item.profileId,
      }))
    const records = liveSession.joinStatusPlayers.slice(0, liveSession.playerCount).map((item, index) => ({
      avatarUrl: mergeRuntimeAvatar(item.profileId, item.avatarUrl),
      clearedCount: item.clearedCount || 0,
      debtCount: item.debtCount || 0,
      drinkCount: item.drinkCount || 0,
      id: item.profileId || `player-${index + 1}`,
      meta: item.meta || buildDefaultMeta(item),
      name: cleanDisplayName(item.name, `成员 ${index + 1}`),
      profileId: item.profileId,
    }))
    const sessionStartTime = resolveSessionStartTime(
      runtime.startedAt,
      liveSession as typeof liveSession & { createdAt?: string; startedAt?: string; updatedAt?: string },
      hasSessionFirstPhoto(runtime),
    )

    const sessionName = cleanSessionName(liveSession.sessionName)
    const sessionEnded = Boolean(liveSession.endedAt) || isEndedState(liveSession.stateText || liveSession.status)

    setSessionRuntime({
      endedAt: liveSession.endedAt || (sessionEnded ? new Date().toISOString() : ''),
      inviteCode: liveSession.inviteCode,
      isJudge: inferredIsJudge,
      playerCount: liveSession.playerCount,
      playerStats: toPlayerStats(records),
      selectedPlayers: liveSession.joinStatusPlayers.map<SessionParticipant>((item) => ({
        avatarUrl: mergeRuntimeAvatar(item.profileId, item.avatarUrl),
        name: cleanDisplayName(item.name, '成员'),
        profileId: item.profileId,
        status: item.status,
      })),
      sessionId: liveSession.id,
      sessionName,
      startedAt: sessionStartTime,
      templateImageUrl: liveSession.templateImageUrl || runtime.templateImageUrl || '',
      templateName: liveSession.templateName,
      state: sessionEnded ? 'ended' : liveSession.stateText || runtime.state,
      status: sessionEnded ? '已结束' : liveSession.status || runtime.status,
    })

    this.setData({
      desktopModeLabel: sessionEnded ? '已结束' : '打开账本',
      finishMatchLabel: sessionEnded ? '保存分享图' : '结束聚会',
      isJudge: inferredIsJudge,
      playerCount: liveSession.playerCount,
      players,
      baselineRecords: records.map((item) => ({ ...item })),
      ledgerDirty: false,
      ledgerSubmitting: false,
      records,
      sharePosterSaved: false,
      sessionId: liveSession.id,
      sessionName,
      sessionEnded,
      sessionEndedAt: liveSession.endedAt || '',
      memberCountText: buildMemberCountText(players.length, liveSession.playerCount),
      startTimeText: formatStartTimeText(sessionStartTime),
      titleImageSrc: resolveTitleImageSrc(sessionName, liveSession.id),
      events: buildSessionEvents(sessionName, players, liveSession.joinStatusPlayers),
    })

    await this.loadTimeline()
  },

  async handleRefreshTap() {
    if (this.data.isJudge) {
      return
    }

    const runtime = getSessionRuntime()
    if (!runtime.sessionId) {
      this.showPreviewToast('未找到当前聚会信息')
      return
    }

    wx.showLoading({
      title: '刷新中',
      mask: true,
    })

    try {
      const liveSession = await getManagedLiveSession(runtime.sessionId, runtime.inviteCode)
      const players = liveSession.joinStatusPlayers
        .slice(0, liveSession.playerCount)
        .map((item, index) => ({
          avatarUrl: mergeRuntimeAvatar(item.profileId, item.avatarUrl),
          initial: getInitial(cleanDisplayName(item.name, `成员 ${index + 1}`)),
          name: cleanDisplayName(item.name, `成员 ${index + 1}`),
          profileId: item.profileId,
        }))

      const records = liveSession.joinStatusPlayers.slice(0, liveSession.playerCount).map((item, index) => ({
        avatarUrl: mergeRuntimeAvatar(item.profileId, item.avatarUrl),
        clearedCount: item.clearedCount || 0,
        debtCount: item.debtCount || 0,
        drinkCount: item.drinkCount || 0,
        id: item.profileId || `player-${index + 1}`,
        meta: item.meta || buildDefaultMeta(item),
        name: cleanDisplayName(item.name, `成员 ${index + 1}`),
        profileId: item.profileId,
      }))

      const sessionName = cleanSessionName(liveSession.sessionName)

      setSessionRuntime({
        isJudge: this.data.isJudge,
        playerCount: liveSession.playerCount,
        playerStats: toPlayerStats(records),
        selectedPlayers: liveSession.joinStatusPlayers.map<SessionParticipant>((item) => ({
          avatarUrl: mergeRuntimeAvatar(item.profileId, item.avatarUrl),
          name: cleanDisplayName(item.name, '成员'),
          profileId: item.profileId,
          status: item.status,
        })),
        sessionId: liveSession.id,
        sessionName,
      })

      this.syncRecordsToRuntime(records)
      this.setData({
        playerCount: liveSession.playerCount,
        players,
        baselineRecords: records.map((item) => ({ ...item })),
        ledgerDirty: false,
        ledgerSubmitting: false,
        records,
        sessionId: liveSession.id,
        sessionName,
        memberCountText: buildMemberCountText(players.length, liveSession.playerCount),
        startTimeText: formatStartTimeText(getSessionRuntime().startedAt),
        titleImageSrc: resolveTitleImageSrc(sessionName, liveSession.id),
        events: buildSessionEvents(sessionName, players, liveSession.joinStatusPlayers),
      })

      await this.loadTimeline()

      this.showPreviewToast('\u5237\u65b0\u6210\u529f')
    } catch (error) {
      this.showPreviewToast(error instanceof Error ? error.message : '聚会记录保存失败')
    } finally {
      wx.hideLoading()
    }
  },

  onShow() {
    if (this.data.isJudge) {
      enableSessionLeaveAlert()
    } else {
      disableSessionLeaveAlert()
    }

    this.applyWheelResult()
    if (this.data.sessionId) {
      void this.loadTimeline()
    }

    if (liveTimer) {
      clearInterval(liveTimer)
    }

    liveTimer = setInterval(() => {
      this.handleTimerTick()
    }, 1000) as unknown as number
  },

  onHide() {
    if (liveTimer) {
      clearInterval(liveTimer)
      liveTimer = 0
    }
  },

  onUnload() {
    if (liveTimer) {
      clearInterval(liveTimer)
      liveTimer = 0
    }
    disableSessionLeaveAlert()
  },

  handleTimerTick() {
    const runtime = getSessionRuntime()
    const endedAt = this.data.sessionEndedAt || runtime.endedAt || ''
    const endedTimestamp = endedAt ? new Date(endedAt).getTime() : 0

    this.setData({
      elapsedText: formatElapsed(runtime.startedAt, Number.isFinite(endedTimestamp) && endedTimestamp > 0 ? endedTimestamp : Date.now()),
    })
  },

  async loadTimeline() {
    const sessionId = this.data.sessionId || getSessionRuntime().sessionId || ''
    if (!sessionId) {
      return
    }

    this.setData({
      timelineLoading: true,
    })

    try {
      const timeline = await getManagedSessionTimeline(sessionId)
      const firstPhotoNode = timeline.nodes.find((node) => node.nodeKind === 'moment' && Boolean(node.imageUrl))
      if (firstPhotoNode) {
        markSessionFirstPhotoUploaded(firstPhotoNode.createdAt || firstPhotoNode.updatedAt || new Date().toISOString())
      }
      const records = buildRecordsWithLedgerEvents(this.data.records, timeline.nodes)
      const timelineViewState = await resolveLiveRecordTimelineImages(buildTimelineViewState(timeline.nodes, records))
      const recordTimelineDisplayItems = buildRecordTimelineDisplayItems(timelineViewState.recordTimelineItems)
      const timelinePhotoDiagnostics = buildTimelinePhotoDiagnostics(
        timeline.nodes,
        timelineViewState.photoNodes,
        timelineViewState.recordTimelineItems,
      )
      if (timelinePhotoDiagnostics.length) {
        console.info('[live-record] timeline photo diagnostics', timelinePhotoDiagnostics)
      }
      this.syncRecordsToRuntime(records)
      this.setData({
        baselineRecords: records.map((item) => ({ ...item })),
        timelineEmptyText: timeline.pendingMediaCount > 0 ? `还有 ${timeline.pendingMediaCount} 条记录待补充` : '还没有聚会照片，先记录一张',
        timelineLoading: false,
        timelineNodes: timeline.nodes,
        timelinePhotoDiagnostics,
        records,
        recordTimelineDisplayItems,
        startTimeText: formatStartTimeText(getSessionRuntime().startedAt),
        ...timelineViewState,
      })
    } catch (error) {
      this.setData({
        timelineEmptyText: error instanceof Error ? error.message : '精彩瞬间暂未同步',
        timelineLoading: false,
        timelineNodes: [],
        hiddenTimelineNotice: '',
        ledgerTimelineItems: [],
        photoNodes: [],
        recordTimelineDisplayItems: [],
        recordTimelineItems: [],
      })
    }
  },

  syncRecordsToRuntime(records) {
    setSessionRuntime({
      playerStats: toPlayerStats(records),
    })
  },

  async persistRecordsToManagedSession(records) {
    const runtime = getSessionRuntime()
    if (!runtime.sessionId) {
      return false
    }

    const selectedPlayers = resolveSessionParticipants(runtime).map((item) => {
      const record = records.find((current) => (current.profileId || current.name) === (item.profileId || item.name))
      return {
        avatarUrl: mergeRuntimeAvatar(item.profileId, item.avatarUrl),
        clearedCount: record?.clearedCount || 0,
        debtCount: record?.debtCount || 0,
        drinkCount: record?.drinkCount || 0,
        meta: record?.meta || item.status || '',
        name: item.name,
        profileId: item.profileId,
        status: item.status || '',
      }
    })

    try {
      await updateManagedSession(runtime.sessionId, {
        hostAvatarUrl: runtime.currentUser?.avatarUrl,
        hostName: runtime.currentUser?.name,
        hostProfileId: runtime.currentUser?.id,
        playerCount: runtime.playerCount,
        selectedPlayers,
        sessionName: runtime.sessionName,
        templateName: runtime.templateName,
      })
      return true
    } catch (error) {
      this.showPreviewToast(isForbiddenError(error) ? '当前账号无权调整账本，请使用发起人账号' : '聚会记录保存失败')
      return false
    }
  },

  applyWheelResult() {
    const result = wx.getStorageSync(JUDGE_WHEEL_RESULT_KEY) as
      | {
          playerId?: string
          question?: string
        }
      | undefined

    if (!result?.playerId) {
      return
    }

    const records = this.data.records.map((item) => {
      if (item.id !== result.playerId) {
        return item
      }

      return {
        ...item,
        debtCount: Math.max(0, item.debtCount - 1),
        clearedCount: Math.min(MAX_CLEAR_PER_PLAYER, item.clearedCount + 1),
        meta: result.question || item.meta,
      }
    })

    const changed = records.find((item) => item.id === result.playerId)
    const events = changed
      ? [{ text: `${changed.name} 完成消杯：${result.question || ''}` }, ...this.data.events].slice(0, 4)
      : this.data.events

    wx.removeStorageSync(JUDGE_WHEEL_RESULT_KEY)
    this.syncRecordsToRuntime(records)

    this.setData({
      records,
      events,
    })
  },

  async handleAdjustTap(event) {
    if (!this.data.isJudge) {
      this.showPreviewToast('当前账号只能查看账本，请发起人调整')
      return
    }
    if (this.data.ledgerSubmitting) {
      return
    }

    const { delta, field, id } = event.currentTarget.dataset as {
      delta: string
      field: 'debtCount' | 'drinkCount'
      id: string
    }
    const offset = Number(delta) || 0

    const records = this.data.records.map((item) => {
      if (item.id !== id) {
        return item
      }

      return {
        ...item,
        [field]: Math.max(0, item[field] + offset),
      }
    })

    this.syncRecordsToRuntime(records)
    this.setData({ ledgerDirty: true, records })
  },

  async handleConfirmLedgerTap() {
    if (!this.data.isJudge) {
      this.showPreviewToast('当前账号只能查看账本，请发起人调整')
      return
    }
    if (!this.data.records.length || this.data.ledgerSubmitting) {
      return
    }
    if (!this.data.ledgerDirty) {
      this.showPreviewToast('账本没有新的修改')
      return
    }

    this.setData({ ledgerSubmitting: true })
    const records = this.data.records.map((item) => ({ ...item }))
    try {
      const persisted = await this.persistRecordsToManagedSession(records)
      if (!persisted) {
        return
      }
      const eventsSynced = await this.createLedgerEventsForDiff(this.data.baselineRecords, records)
      if (!eventsSynced) {
        return
      }
      await this.loadTimeline()
      this.setData({ ledgerDirty: false })
      this.showPreviewToast('账本修改已进入记录')
    } finally {
      this.setData({ ledgerSubmitting: false })
    }
  },

  async createLedgerEventsForDiff(previousRecords, nextRecords) {
    const sessionId = this.data.sessionId || getSessionRuntime().sessionId || ''
    if (!sessionId) {
      return true
    }

    const previousMap = new Map(previousRecords.map((item) => [item.id, item]))
    const changes = nextRecords.flatMap((record) => {
      const previous = previousMap.get(record.id)
      const debtDelta = (Number(record.debtCount) || 0) - (Number(previous?.debtCount) || 0)
      const drinkDelta = (Number(record.drinkCount) || 0) - (Number(previous?.drinkCount) || 0)
      return [
        { delta: debtDelta, eventType: 'drink_debt' as const, record },
        { delta: drinkDelta, eventType: 'drink_add' as const, record },
      ].filter((item) => item.delta !== 0)
    })

    if (!changes.length) {
      return true
    }

    try {
      await Promise.all(changes.map((change, index) =>
        createManagedSessionEvent(sessionId, {
          caption: change.eventType === 'drink_debt' ? '账本确认修改：欠酒变动' : '账本确认修改：加酒变动',
          clientEventId: `live-ledger-confirm-${change.record.id}-${change.eventType}-${Date.now()}-${index}`,
          eventType: change.eventType,
          scoreDelta: change.delta,
          targetName: change.record.name,
          targetProfileId: change.record.profileId,
        }),
      ))
      return true
    } catch (error) {
      this.showPreviewToast(isForbiddenError(error) ? '当前账号无权写入账本动态，请使用发起人账号' : '账本动态暂未同步，请稍后重试')
      return false
    }
  },

  handleAddPlayerTap() {
    if (!this.data.isJudge || this.data.players.length >= this.data.playerCount) {
      return
    }

    const runtime = getSessionRuntime()
    const sessionId = runtime.sessionId ? `?sessionId=${encodeURIComponent(runtime.sessionId)}` : ''
    this.openPage(`/pages/invite-group/index${sessionId}`)
  },

  async handleHighlightMomentTap() {
    const sessionId = this.data.sessionId || getSessionRuntime().sessionId || ''
    if (!sessionId) {
      this.showPreviewToast('未找到当前聚会信息')
      return
    }
    if (this.data.sessionEnded) {
      this.showPreviewToast('聚会已结束，不能继续拍照')
      return
    }
    if (this.data.quickPhotoSaving) {
      return
    }

    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (result) => {
        const filePath = result.tempFiles[0]?.tempFilePath || ''
        if (filePath) {
          void this.createQuickPhotoMoment(filePath)
        }
      },
      fail: () => undefined,
    })
  },

  async createQuickPhotoMoment(filePath) {
    const sessionId = this.data.sessionId || getSessionRuntime().sessionId || ''
    if (!sessionId) {
      this.showPreviewToast('未找到当前聚会信息')
      return
    }
    if (this.data.quickPhotoSaving) {
      return
    }

    let uploadedAssetId = ''
    this.setData({ quickPhotoSaving: true })
    wx.showLoading({
      title: '保存照片',
      mask: true,
    })

    try {
      const dataUrl = await readLocalImageAsDataUrl(filePath)
      const upload = await uploadManagedMomentImage({
        dataUrl,
        fileName: buildMomentFileName(filePath),
        sessionId,
      })
      uploadedAssetId = upload.id || ''
      const created = await createManagedMoment(sessionId, {
        caption: '',
        clientDraftId: `live-photo-${sessionId}-${Date.now()}`,
        imageUrl: normalizeManagedAssetPath(upload.url) || upload.url,
        nodeType: hasSessionFirstPhoto(getSessionRuntime()) ? 'highlight' : 'opening',
        uploadAssetId: uploadedAssetId,
        usageConsent: {
          brief: true,
          ranking: true,
          session: true,
          share: true,
        },
        visibility: 'session',
        visibleProfileIds: [],
      })
      uploadedAssetId = ''
      if (created.imageUrl) {
        markSessionFirstPhotoUploaded(created.createdAt || created.updatedAt || new Date().toISOString())
      }
      this.setData({ activeSegment: 'record' })
      await this.loadTimeline()
      this.showPreviewToast('照片已插入当前记录')
    } catch (error) {
      if (uploadedAssetId) {
        await cleanupManagedMomentUpload(uploadedAssetId).catch(() => undefined)
      }
      this.showPreviewToast(error instanceof Error ? error.message : '照片保存失败')
    } finally {
      wx.hideLoading()
      this.setData({ quickPhotoSaving: false })
    }
  },

  handlePhotoImageLoad(event) {
    const { id } = event.currentTarget.dataset as { id?: string }
    const detail = (event as unknown as { detail?: { height?: number; width?: number } }).detail || {}
    const width = Number(detail.width)
    const height = Number(detail.height)
    if (!id || !Number.isFinite(width) || !Number.isFinite(height)) {
      return
    }
    const nextImageState = updateLiveRecordImageState(
      id,
      { imageBroken: width < 8 && height < 8 },
      this.data.photoNodes,
      this.data.recordTimelineItems,
    )
    this.setData({
      ...nextImageState,
      timelinePhotoDiagnostics: buildTimelinePhotoDiagnostics(
        this.data.timelineNodes,
        nextImageState.photoNodes,
        nextImageState.recordTimelineItems,
      ),
    })
  },

  async handlePhotoImageError(event) {
    const { id } = event.currentTarget.dataset as { id?: string }
    if (!id) {
      return
    }
    const source = findLiveRecordImageUrl(id, this.data.photoNodes, this.data.recordTimelineItems)
    const fallbackPath = await resolveCachedManagedImagePath(source).catch(() => source)
    if (fallbackPath && fallbackPath !== source) {
      const nextImageState = updateLiveRecordImageState(
        id,
        { imageBroken: false, imageUrl: fallbackPath },
        this.data.photoNodes,
        this.data.recordTimelineItems,
      )
      this.setData({
        ...nextImageState,
        timelinePhotoDiagnostics: buildTimelinePhotoDiagnostics(
          this.data.timelineNodes,
          nextImageState.photoNodes,
          nextImageState.recordTimelineItems,
        ),
      })
      return
    }
    const nextImageState = updateLiveRecordImageState(
      id,
      { imageBroken: true },
      this.data.photoNodes,
      this.data.recordTimelineItems,
    )
    this.setData({
      ...nextImageState,
      timelinePhotoDiagnostics: buildTimelinePhotoDiagnostics(
        this.data.timelineNodes,
        nextImageState.photoNodes,
        nextImageState.recordTimelineItems,
      ),
    })
  },

  async handleLedgerTap() {
    this.setData({ activeSegment: 'ledger' })
  },

  handleTimelineSelect(event) {
    const detail = 'detail' in event ? event.detail as { id?: string; nodeKind?: string } : {}
    const dataset = event.currentTarget?.dataset as { id?: string; nodeKind?: string } | undefined
    const id = detail.id || dataset?.id || ''
    const nodeKind = detail.nodeKind || dataset?.nodeKind || ''
    if (!id || nodeKind === 'event') {
      return
    }

    const displayItem = this.data.recordTimelineDisplayItems.find((item) => item.id === id)
    const compactPhoto = displayItem?.displayKind === 'photoGroup' ? displayItem.compactPhotos[0] : undefined
    const item =
      compactPhoto ||
      this.data.recordTimelineItems.find((current) => current.id === id) ||
      this.data.photoNodes.find((current) => current.id === id)
    if (!item?.imageUrl) {
      this.showPreviewToast('这条记录还没有可查看照片')
      return
    }
    const sessionId = this.data.sessionId || getSessionRuntime().sessionId || ''
    wx.setStorageSync('live-record-selected-moment-detail', {
      caption: 'caption' in item ? item.caption || '' : '',
      imageUrl: item.imageUrl,
      momentId: item.id,
      sessionId,
      title: 'timelineTitle' in item ? item.timelineTitle : item.title,
    })
    this.openPage(`/pages/moment-editor/index?mode=detail&sessionId=${encodeURIComponent(sessionId)}&momentId=${encodeURIComponent(item.id)}&nodeType=highlight`)
  },

  handleSegmentTap(event) {
    const { tab } = event.currentTarget.dataset as { tab?: 'album' | 'ledger' | 'record' | 'share' }
    if (!tab) {
      return
    }

    if (tab === 'share') {
      this.showPreviewToast(this.data.sessionEnded ? '分享图已保存在相册' : '结束聚会后会自动保存分享图')
      return
    }

    this.setData({ activeSegment: tab })

    if (tab === 'album') {
      this.showPreviewToast(this.data.photoNodes.length ? '相册已在当前页展示' : this.data.timelineEmptyText)
      return
    }

  },

  async handleSaveTap() {
    if (!this.data.isJudge) {
      this.openPage('/pages/ledger/index')
      return
    }

    this.syncRecordsToRuntime(this.data.records)
    if (!(await this.persistRecordsToManagedSession(this.data.records))) {
      return
    }

    this.showPreviewToast('账本已保存')
  },

  async saveEndedPosterToAlbum() {
    const filePath = await withTimeout(this.buildLiveRecordPosterImage(), 30000, '分享图生成超时，请稍后重试')
    await withTimeout(this.saveImageFile(filePath), 12000, '保存超时，请检查相册权限后重试')
  },

  async buildLiveRecordPosterImage() {
    const timelineItems = this.data.recordTimelineDisplayItems.length
      ? this.data.recordTimelineDisplayItems
      : buildRecordTimelineDisplayItems(this.data.recordTimelineItems)
    const posterItems = await Promise.all(
      timelineItems.map(async (item) => ({
        ...item,
        localImagePath:
          item.type === 'photo' && item.imageUrl && !item.imageBroken
            ? await this.downloadPosterImageToFile(item.imageUrl).catch(() => '')
            : '',
      })),
    )
    const posterPlayers = await Promise.all(
      this.data.players.map(async (player) => ({
        ...player,
        localAvatarPath: player.avatarUrl ? await this.downloadPosterImageToFile(player.avatarUrl).catch(() => '') : '',
      })),
    )
    const qrLocalPath = await this.downloadPosterImageToFile(LIVE_RECORD_QR_FALLBACK).catch(() => '')
    const width = LIVE_RECORD_POSTER_WIDTH
    const margin = 28
    const contentWidth = width - margin * 2
    const playerColumns = 5
    const playerRows = posterPlayers.length ? Math.ceil(posterPlayers.length / playerColumns) : 0
    const heroHeight = 318 + Math.max(1, playerRows) * 92
    const rowHeights = posterItems.map((item) => (item.type === 'photo' ? 388 : 168))
    const timelineHeight = 134 + Math.max(132, rowHeights.reduce((sum, value) => sum + value, 0)) + 34
    const summaryHeight = 186
    const qrBoxSize = 206
    const heroY = 34
    const timelineY = heroY + heroHeight + 34
    const summaryY = timelineY + timelineHeight + 34
    const qrY = summaryY + summaryHeight + 42
    const height = Math.max(LIVE_RECORD_POSTER_MIN_HEIGHT, qrY + qrBoxSize + 78)
    const photoCount = posterItems.filter((item) => item.type === 'photo').length
    const ledgerCount = posterItems.length - photoCount
    const debtTotal = this.data.records.reduce((sum, item) => sum + (Number(item.debtCount) || 0), 0)
    const drinkTotal = this.data.records.reduce((sum, item) => sum + (Number(item.drinkCount) || 0), 0)
    const title = cleanSessionName(this.data.sessionName || getSessionRuntime().sessionName, '今晚聚会高光')
    const inviteCode = getSessionRuntime().inviteCode || ''

    return new Promise<string>((resolve, reject) => {
      this.setData({ canvasWidth: width, canvasHeight: height }, () => {
        const ctx = wx.createCanvasContext(LIVE_RECORD_POSTER_CANVAS_ID, this)
        const measure = (text: string, fontSize: number) => {
          const measurer = ctx as unknown as { measureText?: (value: string) => { width: number } }
          try {
            return measurer.measureText ? measurer.measureText(text).width : text.length * fontSize
          } catch {
            return text.length * fontSize
          }
        }
        const drawRoundRect = (
          x: number,
          y: number,
          w: number,
          h: number,
          radius: number,
          fill: string,
          stroke = '',
          lineWidth = 0,
        ) => {
          const r = Math.min(radius, w / 2, h / 2)
          ctx.beginPath()
          ctx.moveTo(x + r, y)
          ctx.lineTo(x + w - r, y)
          ctx.arc(x + w - r, y + r, r, -Math.PI / 2, 0)
          ctx.lineTo(x + w, y + h - r)
          ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2)
          ctx.lineTo(x + r, y + h)
          ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI)
          ctx.lineTo(x, y + r)
          ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)
          ctx.closePath()
          ctx.setFillStyle(fill)
          ctx.fill()
          if (stroke && lineWidth) {
            ctx.setStrokeStyle(stroke)
            ctx.setLineWidth(lineWidth)
            ctx.stroke()
          }
        }
        const drawText = (value: string, x: number, y: number, maxWidth: number, fontSize: number, color: string) => {
          let content = String(value || '').trim()
          ctx.setFillStyle(color)
          ctx.setFontSize(fontSize)
          while (content.length > 1 && measure(content, fontSize) > maxWidth) {
            content = `${content.slice(0, -2)}...`
          }
          if (content) {
            ctx.fillText(content, x, y)
          }
        }
        const drawLines = (
          value: string,
          x: number,
          y: number,
          maxWidth: number,
          fontSize: number,
          lineHeight: number,
          color: string,
          maxLines = 2,
        ) => {
          const chars = Array.from(String(value || '').trim())
          const lines: string[] = []
          let current = ''
          ctx.setFontSize(fontSize)
          chars.forEach((char) => {
            const next = current + char
            if (measure(next, fontSize) > maxWidth && current) {
              lines.push(current)
              current = char
              return
            }
            current = next
          })
          if (current) {
            lines.push(current)
          }
          lines.slice(0, maxLines).forEach((line, index) => {
            const content = index === maxLines - 1 && lines.length > maxLines ? `${line.slice(0, Math.max(1, line.length - 2))}...` : line
            drawText(content, x, y + index * lineHeight, maxWidth, fontSize, color)
          })
        }
        const drawPill = (value: string, x: number, y: number, w: number, h: number, fill: string, color: string) => {
          drawRoundRect(x, y, w, h, Math.floor(h / 2), fill, '#111317', 3)
          drawText(value, x + 18, y + Math.floor(h * 0.68), w - 36, 22, color)
        }
        const drawImageSafe = (filePath: string, x: number, y: number, w: number, h: number) => {
          if (!filePath) return false
          try {
            ctx.drawImage(filePath, x, y, w, h)
            return true
          } catch {
            return false
          }
        }

        ctx.setFillStyle('#fffaf0')
        ctx.fillRect(0, 0, width, height)
        ctx.setFillStyle('rgba(211,255,45,0.35)')
        ctx.beginPath()
        ctx.arc(width - 92, 86, 112, 0, Math.PI * 2)
        ctx.fill()
        ctx.setFillStyle('rgba(0,203,255,0.18)')
        ctx.beginPath()
        ctx.arc(70, 260, 130, 0, Math.PI * 2)
        ctx.fill()

        drawRoundRect(margin, heroY + 8, contentWidth, heroHeight, 32, '#111317')
        drawRoundRect(margin, heroY, contentWidth, heroHeight, 32, '#d3ff2d', '#111317', 5)
        drawText('PARTY RECORDER', 66, heroY + 68, 320, 22, '#ff504d')
        drawLines(title, 66, heroY + 126, contentWidth - 132, 56, 62, '#111317', 2)
        drawText('记录时间线', 66, heroY + 258, 220, 28, '#111317')
        drawPill(`${photoCount} 张照片`, width - 300, heroY + 58, 220, 54, '#fffaf0', '#111317')
        drawPill(`${ledgerCount} 条账本`, width - 300, heroY + 128, 220, 54, '#00cbff', '#111317')
        drawText(`成员 ${this.data.players.length || this.data.playerCount || 0} 人 · 时长 ${this.data.elapsedText}`, 66, heroY + 306, contentWidth - 132, 26, '#111317')

        const avatarSize = 58
        const cellWidth = 122
        const playersStartY = heroY + 336
        if (posterPlayers.length) {
          posterPlayers.forEach((player, index) => {
            const col = index % playerColumns
            const row = Math.floor(index / playerColumns)
            const x = 66 + col * cellWidth
            const y = playersStartY + row * 92
            drawRoundRect(x, y, avatarSize, avatarSize, 18, '#fffaf0', '#111317', 4)
            if (player.localAvatarPath) {
              ctx.save()
              ctx.beginPath()
              ctx.arc(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2 - 5, 0, Math.PI * 2)
              ctx.clip()
              drawImageSafe(player.localAvatarPath, x + 5, y + 5, avatarSize - 10, avatarSize - 10)
              ctx.restore()
            } else {
              drawText(player.initial || getInitial(player.name), x + 19, y + 38, 26, 24, '#111317')
            }
            drawText(player.name, x - 12, y + 82, cellWidth - 14, 19, '#111317')
          })
        } else {
          drawText('成员头像会显示在这里', 66, playersStartY + 44, contentWidth - 132, 24, '#111317')
        }

        drawRoundRect(margin, timelineY + 8, contentWidth, timelineHeight, 32, '#111317')
        drawRoundRect(margin, timelineY, contentWidth, timelineHeight, 32, '#ffffff', '#111317', 5)
        drawText('现场时间线', 66, timelineY + 70, 260, 34, '#111317')
        const lineX = 82
        const firstItemY = timelineY + 132
        const lineBottom = firstItemY + Math.max(96, rowHeights.reduce((sum, value) => sum + value, 0)) - 16
        ctx.setStrokeStyle('#111317')
        ctx.setLineWidth(5)
        ctx.beginPath()
        ctx.moveTo(lineX, firstItemY - 30)
        ctx.lineTo(lineX, lineBottom)
        ctx.stroke()

        if (!posterItems.length) {
          drawRoundRect(112, firstItemY - 28, width - 158, 106, 22, '#fffaf0', '#111317', 4)
          drawText('还没有可保存记录', 136, firstItemY + 18, 360, 28, '#111317')
          drawText(this.data.timelineEmptyText, 136, firstItemY + 56, 430, 23, 'rgba(17,19,23,0.62)')
        }

        let cursorY = firstItemY
        posterItems.forEach((item, index) => {
          const rowHeight = rowHeights[index]
          const color = item.type === 'photo' ? '#00cbff' : item.type === 'debt' ? '#ffcd40' : '#d3ff2d'
          ctx.setFillStyle(color)
          ctx.beginPath()
          ctx.arc(lineX, cursorY, 17, 0, Math.PI * 2)
          ctx.fill()
          ctx.setStrokeStyle('#111317')
          ctx.setLineWidth(4)
          ctx.stroke()
          drawRoundRect(112, cursorY - 38, width - 158, rowHeight - 22, 24, '#fffaf0', '#111317', 4)
          drawPill(item.actionLabel || (item.type === 'photo' ? '拍照' : '记录'), 136, cursorY - 15, 118, 42, color, '#111317')
          drawText(item.timeText || '时间未记录', width - 170, cursorY + 12, 92, 22, 'rgba(17,19,23,0.62)')
          drawText(item.title || '聚会记录', 136, cursorY + 64, width - 240, 30, '#111317')
          if (item.type === 'photo') {
            const imageX = 136
            const imageY = cursorY + 88
            const imageW = width - 206
            const imageH = 210
            drawRoundRect(imageX, imageY, imageW, imageH, 22, '#111317')
            if (!drawImageSafe(item.localImagePath, imageX + 4, imageY + 4, imageW - 8, imageH - 8)) {
              drawRoundRect(imageX + 4, imageY + 4, imageW - 8, imageH - 8, 18, '#00cbff')
              drawText('照片已记录', imageX + 34, imageY + 112, imageW - 68, 30, '#111317')
            }
            drawLines(item.detail || item.caption || '等会儿一起回看这一刻', 136, cursorY + 332, width - 206, 22, 28, 'rgba(17,19,23,0.68)', 1)
          } else {
            drawLines(item.detail || '账本发生了变化', 136, cursorY + 104, width - 206, 24, 32, 'rgba(17,19,23,0.68)', 2)
          }
          cursorY += rowHeight
        })

        drawRoundRect(margin, summaryY + 8, contentWidth, summaryHeight, 32, '#111317')
        drawRoundRect(margin, summaryY, contentWidth, summaryHeight, 32, '#fffaf0', '#111317', 5)
        drawText('聚会总结', 66, summaryY + 66, 220, 34, '#111317')
        drawLines(
          `本场已记录 ${photoCount} 张照片、${ledgerCount} 条账本动态，当前欠酒 ${debtTotal} 杯，加酒 ${drinkTotal} 杯。`,
          66,
          summaryY + 112,
          contentWidth - 132,
          28,
          38,
          '#111317',
          2,
        )

        const qrX = Math.round((width - qrBoxSize) / 2)
        drawRoundRect(qrX - 16, qrY - 16, qrBoxSize + 32, qrBoxSize + 72, 28, '#111317')
        drawRoundRect(qrX, qrY, qrBoxSize, qrBoxSize + 56, 26, '#ffffff', '#111317', 4)
        if (qrLocalPath) {
          drawImageSafe(qrLocalPath, qrX + 28, qrY + 20, qrBoxSize - 56, qrBoxSize - 56)
        } else {
          drawText('小程序码', qrX + 54, qrY + 96, 112, 24, '#111317')
        }
        drawText(inviteCode ? `扫码回到小程序 · ${inviteCode}` : '扫码回到小程序', qrX + 22, qrY + qrBoxSize + 28, qrBoxSize - 44, 21, '#111317')

        ctx.draw(false, () => {
          wx.canvasToTempFilePath(
            {
              canvasId: LIVE_RECORD_POSTER_CANVAS_ID,
              width,
              height,
              destWidth: width,
              destHeight: height,
              fileType: 'png',
              success: (result) => resolve(result.tempFilePath),
              fail: reject,
            },
            this,
          )
        })
      })
    })
  },

  async downloadPosterImageToFile(imageUrl) {
    const source = normalizeManagedAssetPath(imageUrl) || String(imageUrl || '').trim()
    if (!source) {
      return ''
    }
    if (/^(wxfile|file):\/\//i.test(source)) {
      return source
    }

    const cached = await resolveCachedManagedImagePath(source).catch(() => source)
    if (!cached || !/^https?:\/\//i.test(cached)) {
      return cached || ''
    }

    const url = cached.startsWith('http')
      ? cached
      : `${getApiBase()}${cached.startsWith('/') ? cached : `/${cached}`}`
    return new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('download live poster image timeout')), 6000)
      wx.downloadFile({
        url,
        header: getUserAuthHeaders(),
        success: (result) => {
          clearTimeout(timer)
          if (result.statusCode >= 200 && result.statusCode < 300 && result.tempFilePath) {
            resolve(result.tempFilePath)
            return
          }
          reject(new Error(`download live poster image failed: ${result.statusCode}`))
        },
        fail: (error) => {
          clearTimeout(timer)
          reject(error)
        },
      })
    })
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

  async handleSaveEndedPosterTap() {
    if (!this.data.sessionEnded) {
      await this.handleFinishTap()
      return
    }
    if (this.data.finishSaving) {
      return
    }

    this.setData({ finishSaving: true, finishMatchLabel: '保存中' })
    wx.showLoading({
      title: '正在保存',
      mask: true,
    })
    let toastMessage = ''
    let saved = false
    try {
      await this.saveEndedPosterToAlbum()
      this.setData({
        finishMatchLabel: '已保存',
        sharePosterSaved: true,
      })
      toastMessage = '分享图已保存在相册'
      saved = true
    } catch (error) {
      this.setData({
        finishMatchLabel: '保存分享图',
        sharePosterSaved: false,
      })
      toastMessage = error instanceof Error ? error.message : '分享图未保存，请检查相册权限'
    } finally {
      wx.hideLoading()
      this.setData({ finishSaving: false })
      if (toastMessage) {
        if (saved) {
          wx.showToast({ title: toastMessage, icon: 'success' })
        } else {
          this.showPreviewToast(toastMessage)
        }
      }
    }
  },

  async handleFinishTap() {
    const sessionId = this.data.sessionId || getSessionRuntime().sessionId || ''
    if (!sessionId) {
      this.showPreviewToast('未找到当前聚会')
      return
    }
    if (this.data.finishSaving) {
      return
    }
    if (this.data.sessionEnded) {
      await this.handleSaveEndedPosterTap()
      return
    }

    const confirmed = await new Promise<boolean>((resolve) => {
      wx.showModal({
        title: '确认结束聚会',
        content: '结束后会自动保存当前记录长图到相册，长图不包含顶部导航和底部按钮。',
        confirmText: '结束聚会',
        cancelText: '继续记录',
        success: (result) => resolve(Boolean(result.confirm)),
        fail: () => resolve(false),
      })
    })

    if (!confirmed) {
      return
    }

    if (this.data.isJudge) {
      this.syncRecordsToRuntime(this.data.records)
      if (!(await this.persistRecordsToManagedSession(this.data.records))) {
        return
      }
    }

    this.setData({ finishSaving: true, finishMatchLabel: '保存中' })
    wx.showLoading({
      title: '正在保存',
      mask: true,
    })
    let toastTitle = ''
    let toastIcon: WechatMiniprogram.ShowToastOption['icon'] = 'none'

    try {
      const result = await finishManagedSession(sessionId)
      markSessionEndedOverride({
        endedAt: result.endedAt || result.updatedAt,
        sessionId,
        state: result.state || '已结束',
        status: result.status || '已结束',
        updatedAt: result.updatedAt || result.endedAt,
      })
      disableSessionLeaveAlert()
      setSessionRuntime({
        endedAt: result.endedAt || result.updatedAt,
        sessionId,
        sessionName: this.data.sessionName || getSessionRuntime().sessionName || '',
        state: result.state || 'ended',
        status: result.status || '已结束',
      })
      if (liveTimer) {
        clearInterval(liveTimer)
        liveTimer = 0
      }
      this.setData({
        desktopModeLabel: '已结束',
        finishMatchLabel: '保存中',
        sessionEnded: true,
        sessionEndedAt: result.endedAt || result.updatedAt || new Date().toISOString(),
      })
      this.handleTimerTick()
      await this.loadTimeline().catch(() => undefined)
      await this.saveEndedPosterToAlbum()
      this.setData({
        finishMatchLabel: '已保存',
        sharePosterSaved: true,
      })
      toastTitle = '分享图已保存在相册'
      toastIcon = 'success'
    } catch (error) {
      const sessionAlreadyEnded = this.data.sessionEnded
      this.setData({
        finishMatchLabel: sessionAlreadyEnded ? '保存分享图' : '结束聚会',
        sharePosterSaved: false,
      })
      toastTitle = sessionAlreadyEnded ? '分享图未保存，请重试' : '聚会暂未结束，请稍后重试'
      toastIcon = 'none'
    } finally {
      wx.hideLoading()
      this.setData({ finishSaving: false })
      if (toastTitle) {
        wx.showToast({
          title: toastTitle,
          icon: toastIcon,
        })
      }
    }
  },

  async handleWheelTap(event) {
    if (!this.data.isJudge) {
      return
    }

    const { id } = event.currentTarget.dataset as { id: string }
    const target = this.data.records.find((item) => item.id === id)

    if (!target) {
      return
    }

    if (target.debtCount <= 0) {
      this.showPreviewToast(`${target.name} 当前没有待处理记录`)
      return
    }

    if (target.clearedCount >= MAX_CLEAR_PER_PLAYER) {
      this.showPreviewToast(`${target.name} 本局已消满 3 杯`)
      return
    }

    if (!(await this.persistRecordsToManagedSession(this.data.records))) {
      return
    }

    this.showPreviewToast('账本记录已保存')
  },

  handleNextRoundTap() {
    this.openPage('/pages/ledger/index')
  },

  async handleBackTap() {
    const hasFirstPhoto = hasSessionFirstPhoto(getSessionRuntime())
    await confirmLeaveSessionPage({
      clearRuntime: false,
      content: hasFirstPhoto
        ? '离开后当前聚会会保持挂起，可从首页继续回到记录页。'
        : '还没有保存第一张照片，这场聚会不会计入进行中，也不会出现在继续记录入口。',
      confirmText: hasFirstPhoto ? '挂起离开' : '离开',
      cancelText: hasFirstPhoto ? '继续记录' : '继续拍照',
    })
  },

  showPreviewToast(message) {
    wx.showToast({
      title: message,
      icon: 'none',
    })
  },

  openPage(url) {
    disableSessionLeaveAlert()
    if (url.startsWith('/pages/ledger/index')) {
      wx.redirectTo({
        url,
        fail: () => {
          wx.reLaunch({ url })
        },
      })
      return
    }
    wx.navigateTo({
      url,
      fail: () => {
        wx.redirectTo({ url })
      },
    })
  },
})

export {}
