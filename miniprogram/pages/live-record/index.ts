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
  createManagedShareImageTask,
  createManagedSessionEvent,
  createOrRefreshManagedSessionBrief,
  cleanupManagedMomentUpload,
  createManagedMoment,
  finishManagedSession,
  getManagedLiveSession,
  getManagedSessionTimeline,
  updateManagedSession,
  type ManagedLiveSession,
  uploadManagedMomentImage,
  uploadManagedMomentVideo,
  type ManagedTimelineNode,
} from '../../services/operations'
import { normalizeManagedAssetPath } from '../../config/assets'
import { hasFirstPhotoEvidence } from '../../utils/first-photo-state'
import { handleSessionRemoved, isSessionRemovedError } from '../../utils/session-access'
import { confirmLeaveSessionPage, disableSessionLeaveAlert, enableSessionLeaveAlert } from '../../utils/session-exit'
import { ensureUserAuthorized, getCurrentDisplayProfile } from '../../utils/social'
import { resolveCachedManagedImagePath } from '../../utils/imageCache'
import { recordDiagnostic } from '../../utils/diagnostics'

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
  coverImageUrl?: string
  duration?: number
  imageBroken?: boolean
  id: string
  imageUrl: string
  mediaType?: 'image' | 'video'
  nodeKind: string
  timelineTitle: string
  videoUrl?: string
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
  duration?: number
  iconAsset: string
  id: string
  imageBroken?: boolean
  imageUrl: string
  mediaType?: 'image' | 'video'
  nodeKind: 'event' | 'moment'
  scoreText: string
  timeText: string
  title: string
  actionLabel: string
  type: 'debt' | 'drink' | 'photo' | 'video'
  videoUrl?: string
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
  finishSaving: boolean
  isJudge: boolean
  ledgerDirty: boolean
  ledgerSubmitting: boolean
  memberCountText: string
  playerCount: number
  players: LivePlayer[]
  recordVideoMessage: string
  recordVideoVisible: boolean
  recordVideoCountdown: number
  recordVideoRecording: boolean
  photoPreviewActive: boolean
  photoPreviewCaption: string
  photoPreviewClass: string
  photoPreviewImageUrl: string
  photoPreviewInfoVisible: boolean
  photoPreviewStageClass: string
  photoPreviewTitle: string
  photoPreviewVisible: boolean
  quickVideoSaving: boolean
  sharePosterSaved: boolean
  videoPreviewTitle: string
  videoPreviewUrl: string
  videoPreviewVisible: boolean
  quickPhotoSaving: boolean
  baselineRecords: LiveRecordItem[]
  records: LiveRecordItem[]
  sessionId: string
  sessionName: string
  sessionSubtitle: string
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
  hydrateManagedSession: (sessionId: string, role?: string) => Promise<boolean>
  handleRefreshTap: () => Promise<void>
  handleAddPlayerTap: () => void
  handleAdjustTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handleBackTap: () => Promise<void>
  handleSaveEndedPosterTap: () => Promise<void>
  handleConfirmLedgerTap: () => Promise<void>
  handleFinishTap: () => Promise<void>
  handleHighlightMomentTap: () => Promise<void>
  handleRecordVideoTap: () => Promise<void>
  handleRecordVideoCameraInitDone: () => void
  handleRecordVideoCameraError: (event: WechatMiniprogram.BaseEvent) => void
  handleRecordVideoCancelTap: () => void
  startCameraVideoRecord: () => void
  stopCameraVideoRecord: () => void
  openNativeVideoRecorder: () => void
  createQuickVideoMoment: (filePath: string, coverFilePath: string, duration: number) => Promise<void>
  handleVideoPreviewCloseTap: () => void
  handleVideoPreviewStopTap: () => void
  handlePhotoPreviewCloseTap: () => void
  handlePhotoPreviewStopTap: () => void
  handlePhotoImageError: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handlePhotoImageLoad: (event: WechatMiniprogram.BaseEvent) => void
  handleLedgerTap: () => Promise<void>
  handleNextRoundTap: () => void
  handleOpenShareAlbumTap: () => void
  handleTimerTick: () => void
  handleTimelineSelect: (event: WechatMiniprogram.BaseEvent | WechatMiniprogram.CustomEvent<{ id: string; nodeKind: string }>) => void
  loadTimeline: () => Promise<void>
  openPage: (url: string) => void
  handleSaveTap: () => Promise<void>
  handleSegmentTap: (event: WechatMiniprogram.BaseEvent) => void
  handleWheelTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  createLedgerEventsForDiff: (previousRecords: LiveRecordItem[], nextRecords: LiveRecordItem[]) => Promise<boolean>
  createQuickPhotoMoment: (filePath: string) => Promise<void>
  persistRecordsToManagedSession: (records: LiveRecordItem[]) => Promise<boolean>
  queueEndedShareImageTask: () => Promise<string>
  showPreviewToast: (message: string) => void
  syncRecordsToRuntime: (records: LiveRecordItem[]) => void
  startAccessCheck: () => void
  stopAccessCheck: () => void
  verifySessionAccess: () => Promise<void>
}

const JUDGE_WHEEL_RESULT_KEY = 'judge-wheel-result'
const MAX_CLEAR_PER_PLAYER = 3
const SERVER_SHARE_IMAGE_QUEUED_MESSAGE = '今晚太嗨了回忆录超长，请稍后在相册记录中找回'
const SAMPLE_008AS_SESSION_ID = 'session-1781787045680-8e406c'
const SAMPLE_008AS_SESSION_NAME = '周末聚会记录'
const SAMPLE_008AS_TITLE_ASSET = ''
let liveTimer = 0
let liveAccessCheckTimer = 0
let liveVideoCountdownTimer = 0
let liveVideoPrepareTimer = 0
let liveVideoStopTimer = 0
let liveVideoCancelRequested = false

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

const buildMomentVideoFileName = (filePath: string) => {
  const ext = /\.mov$/i.test(filePath) ? 'mov' : 'mp4'
  return `live-video-${Date.now()}.${ext}`
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

const compressVideoFile = (filePath: string): Promise<string> =>
  new Promise((resolve) => {
    if (!filePath || !wx.compressVideo) {
      resolve(filePath)
      return
    }
    wx.compressVideo({
      bitrate: 900,
      fps: 24,
      quality: 'medium',
      resolution: 0.75,
      src: filePath,
      success: (result) => resolve(result.tempFilePath || filePath),
      fail: () => resolve(filePath),
    })
  })

const normalizeVideoDuration = (value?: number) => {
  const duration = Math.ceil(Number(value) || 5)
  return Math.max(1, Math.min(5, duration))
}

const getErrorStatusCode = (error: unknown) => Number((error as Error & { statusCode?: number })?.statusCode || 0)

const getErrorMessage = (error: unknown) => String((error as Error)?.message || '')

const getVideoSaveErrorMessage = (stage: string, error: unknown) => {
  const statusCode = getErrorStatusCode(error)
  const message = getErrorMessage(error)
  const lower = message.toLowerCase()
  if (lower.includes('opening photo required')) {
    return '先拍第一张照片后再录视频'
  }
  if (lower.includes('session already ended')) {
    return '聚会已结束，不能继续录视频'
  }
  if (lower.includes('video size')) {
    return '视频太大，请重录 5 秒以内的视频'
  }
  if (lower.includes('only mp4') || lower.includes('only mov')) {
    return '视频格式不支持，请使用系统录制器重录'
  }
  if (statusCode === 404 || lower === 'not found') {
    if (stage === 'upload') {
      return '视频上传接口未找到，请同步部署后端后重试'
    }
    if (stage === 'create') {
      return lower.includes('session') ? '当前聚会已失效，请返回首页重新进入' : '视频上传已完成，但服务器未找到上传资源，请重录一次'
    }
    return '当前聚会信息未找到，请刷新后重试'
  }
  return message || '视频保存失败'
}

const clearLiveVideoRecordTimers = () => {
  if (liveVideoPrepareTimer) {
    clearTimeout(liveVideoPrepareTimer)
    liveVideoPrepareTimer = 0
  }
  if (liveVideoCountdownTimer) {
    clearInterval(liveVideoCountdownTimer)
    liveVideoCountdownTimer = 0
  }
  if (liveVideoStopTimer) {
    clearTimeout(liveVideoStopTimer)
    liveVideoStopTimer = 0
  }
}

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

const redirectViewerToWaitingRoom = (liveSession: ManagedLiveSession, sessionName: string, inviteCode = '') => {
  disableSessionLeaveAlert()
  wx.showToast({
    title: '等房主拍下第一张照片后再进入本局',
    icon: 'none',
  })
  const url = `/pages/waiting-room/index?role=viewer&sessionId=${encodeURIComponent(liveSession.id)}&inviteCode=${encodeURIComponent(liveSession.inviteCode || inviteCode)}&sessionName=${encodeURIComponent(sessionName)}`
  wx.redirectTo({
    url,
    fail: () => {
      wx.reLaunch({ url })
    },
  })
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

    if (node.mediaType === 'video' && node.videoUrl) {
      const coverImageUrl = node.coverImageUrl || node.imageUrl || ''
      photoNodes.push({
        caption: node.caption || '',
        coverImageUrl,
        duration: node.duration || 5,
        id: node.id,
        imageUrl: coverImageUrl,
        mediaType: 'video',
        nodeKind: node.nodeKind,
        timelineTitle: node.timelineTitle || node.caption || '聚会视频',
        videoUrl: node.videoUrl,
      })
      recordTimelineItems.push({
        actionLabel: '视频',
        actorAvatarUrl: mergeRuntimeAvatar(node.uploaderProfileId, node.uploaderAvatarUrl || ''),
        actorInitial: getInitial(cleanDisplayName(node.uploaderName, '成员')),
        actorName: cleanDisplayName(node.uploaderName, '成员'),
        caption: node.caption || '',
        chipAsset: '',
        chipText: '',
        chipTextVisible: false,
        createdAt: node.createdAt || node.updatedAt || '',
        detail: node.caption || '5 秒视频已进入时间线',
        duration: node.duration || 5,
        iconAsset: '',
        id: node.id,
        imageUrl: coverImageUrl,
        mediaType: 'video',
        nodeKind: 'moment',
        scoreText: '',
        timeText: formatTimelineTime(node.createdAt || node.updatedAt),
        title: node.timelineTitle || node.caption || '录下 5 秒现场视频',
        type: 'video',
        videoUrl: node.videoUrl,
      })
      return
    }

    if (node.imageUrl) {
      photoNodes.push({
        caption: node.caption || '',
        id: node.id,
        imageUrl: node.imageUrl,
        mediaType: 'image',
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
        mediaType: 'image',
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
    desktopModeLabel: '打开账本',
    elapsedText: '00:00:00',
    playerCount: 0,
    players: [],
    photoPreviewActive: false,
    photoPreviewCaption: '',
    photoPreviewClass: 'live-photo-preview',
    photoPreviewImageUrl: '',
    photoPreviewInfoVisible: false,
    photoPreviewStageClass: 'live-photo-preview-stage',
    photoPreviewTitle: '',
    photoPreviewVisible: false,
    quickVideoSaving: false,
    finishMatchLabel: '结束聚会',
    finishSaving: false,
    isJudge: false,
    ledgerDirty: false,
    ledgerSubmitting: false,
    memberCountText: '成员待加入',
    records: [],
    recordVideoCountdown: 5,
    recordVideoMessage: '',
    recordVideoRecording: false,
    recordVideoVisible: false,
    sharePosterSaved: false,
    videoPreviewTitle: '',
    videoPreviewUrl: '',
    videoPreviewVisible: false,
    quickPhotoSaving: false,
    baselineRecords: [],
    sessionId: '',
    sessionName: '',
    sessionSubtitle: '',
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
        const hydrated = await this.hydrateManagedSession(sessionId, role)
        if (!hydrated) {
          return
        }
        this.handleTimerTick()
        this.startAccessCheck()
        return
      } catch (error) {
        if (isSessionRemovedError(error)) {
          await handleSessionRemoved()
          return
        }
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
      sessionSubtitle: runtime.sessionSubtitle || '',
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
    const hasFirstPhoto = hasFirstPhotoEvidence(liveSession)
    const sessionName = cleanSessionName(liveSession.sessionName)
    const sessionEnded = Boolean(liveSession.endedAt) || isEndedState(liveSession.stateText || liveSession.status)

    if (!inferredIsJudge && !sessionEnded && !hasFirstPhoto) {
      setSessionRuntime({
        endedAt: '',
        firstPhotoUploadedAt: '',
        inviteCode: liveSession.inviteCode || runtime.inviteCode || '',
        isJudge: false,
        playerCount: liveSession.playerCount,
        playerStats: [],
        selectedPlayers: liveSession.joinStatusPlayers.map<SessionParticipant>((item) => ({
          avatarUrl: mergeRuntimeAvatar(item.profileId, item.avatarUrl),
          name: cleanDisplayName(item.name, '成员'),
          profileId: item.profileId,
          status: item.status,
        })),
        sessionId: liveSession.id,
        sessionName,
        sessionSubtitle: liveSession.subtitle,
        startedAt: 0,
        state: '待首拍',
        status: '待首拍',
        templateImageUrl: liveSession.templateImageUrl || runtime.templateImageUrl || '',
        templateName: liveSession.templateName,
      })
      redirectViewerToWaitingRoom(liveSession, sessionName, runtime.inviteCode)
      return false
    }

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
      hasFirstPhoto,
    )

    setSessionRuntime({
      endedAt: liveSession.endedAt || (sessionEnded ? new Date().toISOString() : ''),
      firstPhotoUploadedAt: liveSession.firstPhotoUploadedAt || (hasFirstPhoto ? runtime.firstPhotoUploadedAt || '' : ''),
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
      sessionSubtitle: liveSession.subtitle,
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
      sessionSubtitle: liveSession.subtitle,
      sessionEnded,
      sessionEndedAt: liveSession.endedAt || '',
      memberCountText: buildMemberCountText(players.length, liveSession.playerCount),
      startTimeText: formatStartTimeText(sessionStartTime),
      titleImageSrc: resolveTitleImageSrc(sessionName, liveSession.id),
      events: buildSessionEvents(sessionName, players, liveSession.joinStatusPlayers),
    })

    await this.loadTimeline()
    return true
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
      if (isSessionRemovedError(error)) {
        this.stopAccessCheck()
        await handleSessionRemoved()
        return
      }
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
    this.startAccessCheck()

    if (liveTimer) {
      clearInterval(liveTimer)
    }

    liveTimer = setInterval(() => {
      this.handleTimerTick()
    }, 1000) as unknown as number
  },

  onHide() {
    if (this.data.recordVideoVisible) {
      liveVideoCancelRequested = true
      this.stopCameraVideoRecord()
    }
    if (liveTimer) {
      clearInterval(liveTimer)
      liveTimer = 0
    }
    this.stopAccessCheck()
  },

  onUnload() {
    if (this.data.recordVideoVisible) {
      liveVideoCancelRequested = true
      this.stopCameraVideoRecord()
    }
    if (liveTimer) {
      clearInterval(liveTimer)
      liveTimer = 0
    }
    this.stopAccessCheck()
    disableSessionLeaveAlert()
  },

  startAccessCheck() {
    this.stopAccessCheck()
    if (this.data.isJudge || !this.data.sessionId) {
      return
    }

    liveAccessCheckTimer = setInterval(() => {
      void this.verifySessionAccess().catch(() => undefined)
    }, 5000) as unknown as number
  },

  stopAccessCheck() {
    if (liveAccessCheckTimer) {
      clearInterval(liveAccessCheckTimer)
      liveAccessCheckTimer = 0
    }
  },

  async verifySessionAccess() {
    const runtime = getSessionRuntime()
    const sessionId = this.data.sessionId || runtime.sessionId || ''
    if (this.data.isJudge || !sessionId) {
      return
    }

    try {
      const liveSession = await getManagedLiveSession(sessionId, runtime.inviteCode)
      const sessionEnded = Boolean(liveSession.endedAt) || isEndedState(liveSession.stateText || liveSession.status)
      if (!sessionEnded && !hasFirstPhotoEvidence(liveSession)) {
        this.stopAccessCheck()
        setSessionRuntime({
          endedAt: '',
          firstPhotoUploadedAt: '',
          inviteCode: liveSession.inviteCode || runtime.inviteCode || '',
          isJudge: false,
          playerCount: liveSession.playerCount,
          selectedPlayers: liveSession.joinStatusPlayers.map<SessionParticipant>((item) => ({
            avatarUrl: mergeRuntimeAvatar(item.profileId, item.avatarUrl),
            name: cleanDisplayName(item.name, '成员'),
            profileId: item.profileId,
            status: item.status,
          })),
          sessionId: liveSession.id,
          sessionName: cleanSessionName(liveSession.sessionName),
          sessionSubtitle: liveSession.subtitle,
          startedAt: 0,
          state: '待首拍',
          status: '待首拍',
          templateImageUrl: liveSession.templateImageUrl || runtime.templateImageUrl || '',
          templateName: liveSession.templateName,
        })
        redirectViewerToWaitingRoom(liveSession, cleanSessionName(liveSession.sessionName), runtime.inviteCode)
      }
    } catch (error) {
      if (isSessionRemovedError(error)) {
        this.stopAccessCheck()
        await handleSessionRemoved()
      }
    }
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
      if (isSessionRemovedError(error)) {
        this.stopAccessCheck()
        await handleSessionRemoved()
        return
      }
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

  async handleRecordVideoTap() {
    const sessionId = this.data.sessionId || getSessionRuntime().sessionId || ''
    if (!sessionId) {
      this.showPreviewToast('未找到当前聚会信息')
      return
    }
    if (this.data.sessionEnded) {
      this.showPreviewToast('聚会已结束，不能继续录视频')
      return
    }
    if (!hasSessionFirstPhoto(getSessionRuntime())) {
      this.showPreviewToast('先拍第一张照片后再录视频')
      return
    }
    if (this.data.quickVideoSaving || this.data.finishSaving) {
      return
    }

    if (!wx.createCameraContext || !wx.canIUse?.('camera')) {
      this.openNativeVideoRecorder()
      return
    }

    this.setData({
      recordVideoCountdown: 5,
      recordVideoMessage: '相机准备中',
      recordVideoRecording: false,
      recordVideoVisible: true,
    })
    liveVideoPrepareTimer = setTimeout(() => {
      liveVideoPrepareTimer = 0
      if (!this.data.recordVideoVisible || this.data.recordVideoRecording) {
        return
      }
      this.setData({
        recordVideoCountdown: 5,
        recordVideoMessage: '',
        recordVideoVisible: false,
      })
      this.showPreviewToast('相机准备超时，改用系统录制')
      this.openNativeVideoRecorder()
    }, 2500) as unknown as number
  },

  handleRecordVideoCameraInitDone() {
    if (!this.data.recordVideoVisible || this.data.recordVideoRecording) {
      return
    }
    if (liveVideoPrepareTimer) {
      clearTimeout(liveVideoPrepareTimer)
      liveVideoPrepareTimer = 0
    }
    this.startCameraVideoRecord()
  },

  handleRecordVideoCameraError(event) {
    const detail = (event as unknown as { detail?: { errMsg?: string } }).detail || {}
    clearLiveVideoRecordTimers()
    this.setData({
      recordVideoVisible: false,
      recordVideoRecording: false,
      recordVideoMessage: '',
    })
    this.showPreviewToast(detail.errMsg || '相机不可用，改用系统录制')
    this.openNativeVideoRecorder()
  },

  handleRecordVideoCancelTap() {
    if (!this.data.recordVideoVisible) {
      return
    }
    if (this.data.recordVideoRecording) {
      liveVideoCancelRequested = true
      this.stopCameraVideoRecord()
      return
    }
    clearLiveVideoRecordTimers()
    this.setData({
      recordVideoCountdown: 5,
      recordVideoMessage: '',
      recordVideoRecording: false,
      recordVideoVisible: false,
    })
  },

  startCameraVideoRecord() {
    clearLiveVideoRecordTimers()
    liveVideoCancelRequested = false
    const cameraContext = wx.createCameraContext()
    this.setData({
      recordVideoCountdown: 5,
      recordVideoMessage: '正在记录现场',
      recordVideoRecording: true,
    })
    cameraContext.startRecord({
      success: () => {
        let nextCountdown = 5
        liveVideoCountdownTimer = setInterval(() => {
          nextCountdown -= 1
          this.setData({ recordVideoCountdown: Math.max(0, nextCountdown) })
        }, 1000) as unknown as number
        liveVideoStopTimer = setTimeout(() => {
          this.stopCameraVideoRecord()
        }, 5000) as unknown as number
      },
      fail: (error) => {
        clearLiveVideoRecordTimers()
        this.setData({
          recordVideoCountdown: 5,
          recordVideoMessage: '',
          recordVideoRecording: false,
          recordVideoVisible: false,
        })
        this.showPreviewToast(error?.errMsg || '相机录制失败，改用系统录制')
        this.openNativeVideoRecorder()
      },
      timeoutCallback: () => {
        this.stopCameraVideoRecord()
      },
    })
  },

  stopCameraVideoRecord() {
    clearLiveVideoRecordTimers()
    if (!this.data.recordVideoVisible) {
      return
    }
    const cameraContext = wx.createCameraContext()
    this.setData({
      recordVideoCountdown: 0,
      recordVideoMessage: '正在整理视频',
      recordVideoRecording: false,
    })
    cameraContext.stopRecord({
      compressed: true,
      success: (result) => {
        const filePath = result.tempVideoPath || ''
        const coverFilePath = result.tempThumbPath || ''
        const shouldDiscard = liveVideoCancelRequested
        liveVideoCancelRequested = false
        this.setData({
          recordVideoCountdown: 5,
          recordVideoMessage: '',
          recordVideoVisible: false,
        })
        if (shouldDiscard) {
          this.showPreviewToast('已取消录制')
          return
        }
        if (!filePath || !coverFilePath) {
          this.showPreviewToast('视频文件不完整，请重录')
          return
        }
        void this.createQuickVideoMoment(filePath, coverFilePath, 5)
      },
      fail: (error) => {
        this.setData({
          recordVideoCountdown: 5,
          recordVideoMessage: '',
          recordVideoVisible: false,
        })
        this.showPreviewToast(error?.errMsg || '视频保存失败，请重录')
      },
    })
  },

  openNativeVideoRecorder() {
    wx.chooseMedia({
      camera: 'back',
      count: 1,
      maxDuration: 5,
      mediaType: ['video'],
      sourceType: ['camera'],
      success: (result) => {
        const file = (result.tempFiles[0] || {}) as {
          duration?: number
          tempFilePath?: string
          thumbTempFilePath?: string
        }
        const filePath = file.tempFilePath || ''
        const coverFilePath = file.thumbTempFilePath || ''
        if (!filePath) {
          this.showPreviewToast('没有获取到视频文件')
          return
        }
        if (!coverFilePath) {
          this.showPreviewToast('没有获取到视频封面，请重录')
          return
        }
        void this.createQuickVideoMoment(filePath, coverFilePath, normalizeVideoDuration(file.duration))
      },
      fail: () => undefined,
    })
  },

  async createQuickVideoMoment(filePath, coverFilePath, duration) {
    const sessionId = this.data.sessionId || getSessionRuntime().sessionId || ''
    if (!sessionId) {
      this.showPreviewToast('未找到当前聚会信息')
      return
    }
    if (this.data.quickVideoSaving) {
      return
    }

    let stage = 'prepare'
    let uploadedAssetId = ''
    this.setData({ quickVideoSaving: true })
    wx.showLoading({
      title: '保存视频',
      mask: true,
    })

    try {
      recordDiagnostic('live.video.save.start', {
        duration: normalizeVideoDuration(duration),
        sessionId,
      })
      const [coverDataUrl, compressedVideoPath] = await Promise.all([
        readLocalImageAsDataUrl(coverFilePath),
        compressVideoFile(filePath),
      ])
      stage = 'upload'
      recordDiagnostic('live.video.upload.start', {
        duration: normalizeVideoDuration(duration),
        sessionId,
      })
      const upload = await uploadManagedMomentVideo({
        coverDataUrl,
        duration: normalizeVideoDuration(duration),
        fileName: buildMomentVideoFileName(compressedVideoPath || filePath),
        filePath: compressedVideoPath || filePath,
        sessionId,
      })
      uploadedAssetId = upload.id || ''
      const videoUrl = normalizeManagedAssetPath(upload.url) || upload.url
      const coverImageUrl = normalizeManagedAssetPath(upload.coverImageUrl || upload.publicUrl || '') || upload.coverImageUrl || ''
      recordDiagnostic('live.video.upload.success', {
        assetId: uploadedAssetId,
        hasCover: Boolean(coverImageUrl),
        hasVideo: Boolean(videoUrl),
        sessionId,
        storageProvider: upload.storageProvider || '',
      })
      stage = 'create'
      const created = await createManagedMoment(sessionId, {
        caption: '',
        clientDraftId: `live-video-${sessionId}-${Date.now()}`,
        coverImageUrl,
        duration: normalizeVideoDuration(upload.duration || duration),
        mediaType: 'video',
        nodeType: 'highlight',
        uploadAssetId: uploadedAssetId,
        uploadVideoAssetId: uploadedAssetId,
        usageConsent: {
          brief: true,
          ranking: false,
          session: true,
          share: true,
        },
        videoUrl,
        visibility: 'session',
        visibleProfileIds: [],
      })
      uploadedAssetId = ''
      if (!created.videoUrl) {
        throw new Error('视频记录创建失败')
      }
      recordDiagnostic('live.video.create.success', {
        momentId: created.id,
        sessionId,
      })
      this.setData({ activeSegment: 'record' })
      stage = 'timeline'
      try {
        await this.loadTimeline()
        this.showPreviewToast('视频已插入当前记录')
      } catch (timelineError) {
        recordDiagnostic('live.video.timeline.refresh.fail', {
          message: getErrorMessage(timelineError),
          sessionId,
          statusCode: getErrorStatusCode(timelineError),
        })
        this.showPreviewToast('视频已保存，刷新失败请手动刷新')
      }
    } catch (error) {
      recordDiagnostic('live.video.save.fail', {
        message: getErrorMessage(error),
        sessionId,
        stage,
        statusCode: getErrorStatusCode(error),
      })
      if (uploadedAssetId) {
        await cleanupManagedMomentUpload(uploadedAssetId).catch(() => undefined)
      }
      this.showPreviewToast(getVideoSaveErrorMessage(stage, error))
    } finally {
      wx.hideLoading()
      this.setData({ quickVideoSaving: false })
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
    if (item?.mediaType === 'video') {
      if (!item.videoUrl) {
        this.showPreviewToast('这条视频还没有可播放地址')
        return
      }
      this.setData({
        videoPreviewTitle: ('timelineTitle' in item ? item.timelineTitle : item.title) || '5 秒视频留念',
        videoPreviewUrl: item.videoUrl,
        videoPreviewVisible: true,
      })
      return
    }
    if (!item?.imageUrl) {
      this.showPreviewToast('这条记录还没有可查看照片')
      return
    }
    const previewSource = item as {
      caption?: string
      detail?: string
      timelineTitle?: string
      title?: string
    }
    this.setData(
      {
        photoPreviewActive: false,
        photoPreviewCaption: previewSource.caption || previewSource.detail || '',
        photoPreviewClass: 'live-photo-preview',
        photoPreviewImageUrl: item.imageUrl,
        photoPreviewInfoVisible: Boolean(previewSource.timelineTitle || previewSource.title || previewSource.caption || previewSource.detail),
        photoPreviewStageClass: 'live-photo-preview-stage',
        photoPreviewTitle: previewSource.timelineTitle || previewSource.title || '聚会照片',
        photoPreviewVisible: true,
      },
      () => {
        setTimeout(() => {
          if (this.data.photoPreviewVisible) {
            this.setData({
              photoPreviewActive: true,
              photoPreviewClass: 'live-photo-preview live-photo-preview-active',
              photoPreviewStageClass: 'live-photo-preview-stage live-photo-preview-stage-active',
            })
          }
        }, 20)
      },
    )
  },

  handleVideoPreviewCloseTap() {
    this.setData({
      videoPreviewTitle: '',
      videoPreviewUrl: '',
      videoPreviewVisible: false,
    })
  },

  handleVideoPreviewStopTap() {
    return
  },

  handlePhotoPreviewCloseTap() {
    if (!this.data.photoPreviewVisible) {
      return
    }
    this.setData({
      photoPreviewActive: false,
      photoPreviewClass: 'live-photo-preview',
      photoPreviewStageClass: 'live-photo-preview-stage',
    })
    setTimeout(() => {
      if (!this.data.photoPreviewActive) {
        this.setData({
          photoPreviewCaption: '',
          photoPreviewClass: 'live-photo-preview',
          photoPreviewImageUrl: '',
          photoPreviewInfoVisible: false,
          photoPreviewStageClass: 'live-photo-preview-stage',
          photoPreviewTitle: '',
          photoPreviewVisible: false,
        })
      }
    }, 180)
  },

  handlePhotoPreviewStopTap() {
    this.handlePhotoPreviewCloseTap()
  },

  handleSegmentTap(event) {
    const { tab } = event.currentTarget.dataset as { tab?: 'album' | 'ledger' | 'record' | 'share' }
    if (!tab) {
      return
    }

    if (tab === 'share') {
      this.showPreviewToast(this.data.sessionEnded ? SERVER_SHARE_IMAGE_QUEUED_MESSAGE : '结束聚会后会交给服务器生成超长回忆录')
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

  async queueEndedShareImageTask() {
    const sessionId = this.data.sessionId || getSessionRuntime().sessionId || ''
    if (!sessionId) {
      throw new Error('未找到当前聚会')
    }
    const brief = await withTimeout(
      createOrRefreshManagedSessionBrief(sessionId),
      8000,
      '回忆录整理超时，请稍后在相册刷新',
    )
    if (!brief.id) {
      throw new Error('回忆录缺少简报信息')
    }
    const task = await withTimeout(
      createManagedShareImageTask(brief.id, {
        includeLedger: true,
        layoutMode: 'full-timeline',
        rendererVersion: 'live-page-v2',
      }),
      8000,
      '回忆录排队超时，请稍后在相册刷新',
    )
    return task.id || ''
  },

  async handleSaveEndedPosterTap() {
    if (!this.data.sessionEnded) {
      await this.handleFinishTap()
      return
    }
    if (this.data.finishSaving) {
      return
    }

    this.setData({ finishSaving: true, finishMatchLabel: '整理中' })
    wx.showLoading({
      title: '正在整理',
      mask: false,
    })
    let toastMessage = ''
    let queued = false
    try {
      await this.queueEndedShareImageTask()
      this.setData({
        finishMatchLabel: '重新整理',
        sharePosterSaved: true,
      })
      toastMessage = SERVER_SHARE_IMAGE_QUEUED_MESSAGE
      queued = true
    } catch (error) {
      this.setData({
        finishMatchLabel: '整理回忆录',
        sharePosterSaved: false,
      })
      toastMessage = error instanceof Error ? error.message : '回忆录暂未排队，请稍后重试'
    } finally {
      wx.hideLoading()
      this.setData({ finishSaving: false })
      if (toastMessage) {
        if (queued) {
          wx.showToast({ title: toastMessage, icon: 'none', duration: 2600 })
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
        content: '结束后会把超长回忆录交给服务器生成，可稍后在相册记录里保存到手机。',
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

    this.setData({ finishSaving: true, finishMatchLabel: '整理中' })
    wx.showLoading({
      title: '正在整理',
      mask: false,
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
        sessionSubtitle: this.data.sessionSubtitle || getSessionRuntime().sessionSubtitle || '',
        state: result.state || 'ended',
        status: result.status || '已结束',
      })
      if (liveTimer) {
        clearInterval(liveTimer)
        liveTimer = 0
      }
      this.setData({
        desktopModeLabel: '已结束',
        finishMatchLabel: '整理中',
        sessionEnded: true,
        sessionEndedAt: result.endedAt || result.updatedAt || new Date().toISOString(),
      })
      this.handleTimerTick()
      await this.loadTimeline().catch(() => undefined)
      await this.queueEndedShareImageTask()
      this.setData({
        finishMatchLabel: '重新整理',
        sharePosterSaved: true,
      })
      toastTitle = SERVER_SHARE_IMAGE_QUEUED_MESSAGE
      toastIcon = 'none'
    } catch (error) {
      const sessionAlreadyEnded = this.data.sessionEnded
      const errorMessage = error instanceof Error ? error.message : ''
      this.setData({
        finishMatchLabel: sessionAlreadyEnded ? '整理回忆录' : '结束聚会',
        sharePosterSaved: false,
      })
      toastTitle = sessionAlreadyEnded ? (errorMessage || '分享图未保存，请重试') : (errorMessage || '聚会暂未结束，请稍后重试')
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

  handleOpenShareAlbumTap() {
    this.openPage('/pages/album/index?mode=shares')
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
