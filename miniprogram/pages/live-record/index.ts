import {
  formatElapsed,
  getSessionRuntime,
  markSessionEndedOverride,
  resolveSessionParticipants,
  setSessionRuntime,
  type SessionParticipant,
  type SessionPlayerStat,
} from '../../utils/session'
import {
  createManagedSessionEvent,
  finishManagedSession,
  getManagedLiveSession,
  getManagedSessionTimeline,
  updateManagedSession,
  type ManagedTimelineNode,
} from '../../services/operations'
import { confirmAndExitSession, confirmLeaveSessionPage, disableSessionLeaveAlert, enableSessionLeaveAlert } from '../../utils/session-exit'
import { ensureUserAuthorized, getCurrentDisplayProfile } from '../../utils/social'
import { resolveCachedManagedImagePath } from '../../utils/imageCache'

interface LivePlayer {
  avatarUrl: string
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
  desktopModeLabel: string
  elapsedText: string
  events: LiveEvent[]
  finishMatchLabel: string
  isJudge: boolean
  ledgerDirty: boolean
  ledgerSubmitting: boolean
  memberCountText: string
  playerCount: number
  players: LivePlayer[]
  baselineRecords: LiveRecordItem[]
  records: LiveRecordItem[]
  sessionId: string
  sessionName: string
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
  handleConfirmLedgerTap: () => Promise<void>
  handleFinishTap: () => Promise<void>
  handleHighlightMomentTap: () => void
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
  persistRecordsToManagedSession: (records: LiveRecordItem[]) => Promise<boolean>
  showPreviewToast: (message: string) => void
  syncRecordsToRuntime: (records: LiveRecordItem[]) => void
}

const JUDGE_WHEEL_RESULT_KEY = 'judge-wheel-result'
const MAX_CLEAR_PER_PLAYER = 3
const SAMPLE_008AS_SESSION_ID = 'session-1781787045680-8e406c'
const SAMPLE_008AS_SESSION_NAME = '周末聚会记录'
const SAMPLE_008AS_TITLE_ASSET = '/pages/live-record/assets/pr-cs008at-title-sample-zhoumojuhuijilu.png'
let liveTimer = 0

const internalDisplayPattern = /(PR\s+Seed|PR-BE-DB-LOGIN|IT-MOMENTS|DEBUG|openid|openId|unionId|signature)/i

const cleanDisplayName = (value?: string, fallback = '成员') => {
  const text = String(value || '').trim()
  if (!text || internalDisplayPattern.test(text)) {
    return fallback
  }
  return text
}

const getInitial = (name: string) => cleanDisplayName(name, '友').slice(0, 1) || '友'

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

const isForbiddenError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error || '')
  return /forbidden|403|无权限|权限/i.test(message)
}

const resolveSessionStartTime = (
  runtimeStartedAt: number,
  liveSession: { createdAt?: string; startedAt?: string; updatedAt?: string },
) => {
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
      const name = player.name || '未知玩家'
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
    return [{ text: `${sessionName} 已创建，等待玩家加入。` }]
  }

  return [{ text: `${sessionName} 当前已有 ${players.length} 位成员加入，等待发起人开始记录。` }]
}

const buildEventDetail = (node: ManagedTimelineNode) => {
  if (node.nodeKind !== 'event') {
    return ''
  }
  const operator = cleanDisplayName(node.operatorName, '成员')
  const target = cleanDisplayName(node.targetName, '成员')
  const score = Math.abs(Number(node.scoreDelta) || 0)
  if (node.eventType === 'drink_debt') {
    return `${operator} 给 ${target} 记了 ${score || 1} 杯欠酒`
  }
  if (node.eventType === 'drink_add') {
    return `${operator} 为 ${target} 加了 ${score || 1} 杯酒`
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
        const score = Math.abs(Number(node.scoreDelta) || 0) || 1
        ledgerTimelineItems.push({
          detail: buildEventDetail(node),
          id: node.id,
          scoreText: `${score} 杯`,
          title: node.eventType === 'drink_debt' ? '欠酒记录' : '加酒记录',
          type: node.eventType === 'drink_debt' ? 'debt' : 'add',
          typeText: node.eventType === 'drink_debt' ? '欠酒' : '加酒',
        })
        recordTimelineItems.push({
          actorAvatarUrl: mergeRuntimeAvatar(node.targetProfileId, node.targetAvatarUrl || target?.avatarUrl || ''),
          actorInitial: getInitial(targetName),
          actorName: targetName,
          caption: '',
          chipAsset:
            node.eventType === 'drink_debt'
              ? (score === 1 ? '/pages/live-record/assets/pr-cs008ar-neon-debt-plus1.png' : '/pages/live-record/assets/pr-cs008ar-neon-plate-debt-base.png')
              : (score === 1 ? '/pages/live-record/assets/pr-cs008au-neon-drink-plus1.png' : score === 2 ? '/pages/live-record/assets/pr-cs008ar-neon-drink-plus2.png' : '/pages/live-record/assets/pr-cs008ar-neon-plate-drink-base.png'),
          createdAt: node.createdAt || node.updatedAt || '',
          detail:
            node.eventType === 'drink_debt'
              ? `${operatorName} 给 ${targetName} 记了 ${score} 杯欠酒`
              : `${operatorName} 为 ${targetName} 加了 ${score} 杯酒`,
          iconAsset:
            node.eventType === 'drink_debt'
              ? '/pages/live-record/assets/pr-cs008ar-node-debt.png'
              : '/pages/live-record/assets/pr-cs008ar-node-drink.png',
          id: node.id,
          imageUrl: '',
          nodeKind: 'event',
          scoreText: `${score} 杯`,
          timeText: formatTimelineTime(node.createdAt || node.updatedAt),
          title: node.eventType === 'drink_debt' ? '欠酒变动' : '加酒变动',
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
        actorAvatarUrl: mergeRuntimeAvatar(node.uploaderProfileId, node.uploaderAvatarUrl || ''),
        actorInitial: getInitial(cleanDisplayName(node.uploaderName, '成员')),
        actorName: cleanDisplayName(node.uploaderName, '成员'),
        caption: node.caption || '',
        chipAsset: '',
        createdAt: node.createdAt || node.updatedAt || '',
        detail: node.caption || '照片已进入相册和分享记录',
        iconAsset: '/pages/live-record/assets/pr-cs008ar-node-camera.png',
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
  if (items[0]?.type !== 'photo' || items[1]?.type !== 'photo') {
    return items.map(toDisplayNode)
  }

  const compactPhotos: LiveRecordTimelineItem[] = []
  let nextIndex = 1
  while (items[nextIndex]?.type === 'photo') {
    compactPhotos.push(items[nextIndex])
    nextIndex += 1
  }

  const compactLead = compactPhotos[0]
  const photoGroup: LiveRecordTimelineDisplayItem = {
    ...compactLead,
    actorAvatarUrl: '',
    actorInitial: '',
    actorName: '',
    compactPhotoCountText: compactPhotos.length > 1 ? `+${compactPhotos.length - 1}` : '',
    compactPhotos: compactPhotos.slice(0, 1),
    detail: '',
    displayKind: 'photoGroup',
    iconAsset: '/pages/live-record/assets/pr-cs008ar-node-camera.png',
    id: `photo-group-${compactPhotos.map((item) => item.id).join('-')}`,
    scoreText: '',
    title: compactPhotos.length > 1 ? `还有 ${compactPhotos.length} 张照片` : '还有 1 张照片',
  }

  return [
    toDisplayNode(items[0]),
    photoGroup,
    ...items.slice(nextIndex).map(toDisplayNode),
  ]
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
    const score = Math.abs(Number(node.scoreDelta) || 0) || 1
    if (node.eventType === 'drink_debt') {
      target.debtCount += score
    }
    if (node.eventType === 'drink_add') {
      target.drinkCount += score
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
    desktopModeLabel: '打开账本',
    elapsedText: '00:00:00',
    playerCount: 0,
    players: [],
    finishMatchLabel: '结束聚会',
    isJudge: false,
    ledgerDirty: false,
    ledgerSubmitting: false,
    memberCountText: '成员待加入',
    records: [],
    baselineRecords: [],
    sessionId: '',
    sessionName: '',
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
    const sessionName = query?.sessionName ? decodeURIComponent(query.sessionName) : runtime.sessionName

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
    )

    setSessionRuntime({
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
      sessionName: liveSession.sessionName,
      startedAt: sessionStartTime,
      templateImageUrl: liveSession.templateImageUrl || runtime.templateImageUrl || '',
      templateName: liveSession.templateName,
    })

    this.setData({
      isJudge: inferredIsJudge,
      playerCount: liveSession.playerCount,
      players,
      baselineRecords: records.map((item) => ({ ...item })),
      ledgerDirty: false,
      ledgerSubmitting: false,
      records,
      sessionId: liveSession.id,
      sessionName: liveSession.sessionName,
      memberCountText: buildMemberCountText(players.length, liveSession.playerCount),
      startTimeText: formatStartTimeText(sessionStartTime),
      titleImageSrc: resolveTitleImageSrc(liveSession.sessionName, liveSession.id),
      events: buildSessionEvents(liveSession.sessionName, players, liveSession.joinStatusPlayers),
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
        sessionName: liveSession.sessionName,
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
        sessionName: liveSession.sessionName,
        memberCountText: buildMemberCountText(players.length, liveSession.playerCount),
        startTimeText: formatStartTimeText(getSessionRuntime().startedAt),
        titleImageSrc: resolveTitleImageSrc(liveSession.sessionName, liveSession.id),
        events: buildSessionEvents(liveSession.sessionName, players, liveSession.joinStatusPlayers),
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

    this.setData({
      elapsedText: formatElapsed(runtime.startedAt),
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

  handleHighlightMomentTap() {
    const sessionId = this.data.sessionId || getSessionRuntime().sessionId || ''
    if (!sessionId) {
      this.showPreviewToast('未找到当前聚会信息')
      return
    }

    this.openPage(`/pages/moment-editor/index?sessionId=${encodeURIComponent(sessionId)}&nodeType=highlight`)
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

    this.setData({ activeSegment: tab })

    if (tab === 'album') {
      this.showPreviewToast(this.data.photoNodes.length ? '相册已在当前页展示' : this.data.timelineEmptyText)
      return
    }

    if (tab === 'share') {
      const sessionId = this.data.sessionId || getSessionRuntime().sessionId || ''
      if (!sessionId) {
        this.showPreviewToast('缺少聚会信息，暂不能生成分享图')
        return
      }
      this.openPage(`/pages/share-poster/index?sessionId=${encodeURIComponent(sessionId)}`)
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

  async handleFinishTap() {
    const sessionId = this.data.sessionId || getSessionRuntime().sessionId || ''
    if (!sessionId) {
      this.showPreviewToast('未找到当前聚会')
      return
    }

    const confirmed = await new Promise<boolean>((resolve) => {
      wx.showModal({
        title: '确认结束聚会',
        content: '结束后聚会会保留在我的记录中，可继续查看相册、账本和分享内容。',
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

    wx.showLoading({
      title: '正在结束',
      mask: true,
    })

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
      wx.showToast({
        title: '聚会已结束',
        icon: 'success',
      })
      wx.redirectTo({
        url: '/pages/me/index',
        fail: () => {
          wx.reLaunch({ url: '/pages/me/index' })
        },
      })
    } catch (error) {
      wx.showToast({
        title: '聚会暂未结束，请稍后重试',
        icon: 'none',
      })
    } finally {
      wx.hideLoading()
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
    if (!this.data.isJudge) {
      await confirmLeaveSessionPage({
        clearRuntime: true,
        content: '离开后可从参与场次重新进入当前聚会。',
      })
      return
    }

    await confirmAndExitSession()
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
