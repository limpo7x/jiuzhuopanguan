import {
  createOrRefreshManagedSessionBrief,
  getManagedLiveSession,
  getManagedSessionBrief,
  joinManagedSession,
  type ManagedSessionBrief,
  type ManagedTimelineNode,
} from '../../services/operations'
import { hasFirstPhotoEvidence, isActiveForResumeByFirstPhoto } from '../../utils/first-photo-state'
import { getSessionRuntime, setSessionRuntime, type SessionParticipant } from '../../utils/session'
import { resolveCachedManagedImagePath } from '../../utils/imageCache'
import { ensureUserAuthorized } from '../../utils/social'

interface SharePreviewMetric {
  id: string
  label: string
  unit: string
  value: string
}

interface SharePreviewPhoto {
  imageBroken?: boolean
  id: string
  imageUrl: string
  meta: string
  title: string
}

interface SharePreviewKeyEvent {
  id: string
  meta: string
  title: string
}

interface SharePreviewState {
  accountingHighlights: SharePreviewMetric[]
  avatars: string[]
  briefId: string
  canvasHeight: number
  canvasWidth: number
  errorText: string
  filteredNodeIds: string[]
  canJoinSession: boolean
  inviteCode: string
  inviteStatusText: string
  joinActionLabel: string
  joinedCount: number
  joinStatusPlayers: Array<{ avatarUrl: string; name: string; status: string }>
  keyEvents: SharePreviewKeyEvent[]
  ledgerRankings: Record<string, unknown>
  ledgerSummary: Record<string, unknown>
  ledgerCount: number
  photoHighlights: SharePreviewPhoto[]
  photoHighlightsNotice: string
  playerCount: number
  posterImagePath: string
  previewBody: string
  previewTitle: string
  settlementSummary: Record<string, unknown>
  sessionId: string
  shareId: string
  shareArchiveMode: boolean
  sessionName: string
  shareContentFilter: Record<string, unknown>
  shareSummary: string
  shareReturnMode: boolean
  showJoinStatus: boolean
  permissionState: string
  previewLoadFailed: boolean
  visibleNodeIds: string[]
}

interface SharePreviewMethods {
  applyPreviewUnavailableState: (message: string, patch?: Partial<SharePreviewState>) => void
  buildInvitePoster: () => Promise<string>
  drawCanvasToFile: (
    width: number,
    height: number,
    drawer: (ctx: WechatMiniprogram.CanvasContext) => void,
  ) => Promise<string>
  handleTabTap: (event: WechatMiniprogram.BaseEvent) => void
  handleBackTap: () => void
  handlePhotoImageError: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handlePhotoImageLoad: (event: WechatMiniprogram.BaseEvent) => void
  handleCopyInviteCodeTap: () => void
  handleJoinSessionTap: () => Promise<void>
  handleRetryTap: () => Promise<void>
  handleReturnAlbumTap: () => void
  handleReturnHomeTap: () => void
  loadInviteSession: (query?: Record<string, string | undefined>) => Promise<void>
  loadBriefContract: (briefId: string) => Promise<Partial<SharePreviewState> | null>
  loadSessionBriefContract: (sessionId: string) => Promise<Partial<SharePreviewState> | null>
  openPage: (url: string) => void
  saveImageFile: (filePath: string) => Promise<void>
  showPreviewToast: (message: string) => void
}

const readStringArray = (record: Record<string, unknown>, key: string): string[] => {
  const value = record?.[key]
  if (!Array.isArray(value)) {
    return []
  }
  return value.map((item) => String(item || '')).filter(Boolean)
}

const isPublicSharePreviewMoment = (node: ManagedTimelineNode, filteredNodeIds: string[]): node is Extract<ManagedTimelineNode, { nodeKind: 'moment' }> =>
  node.nodeKind === 'moment' &&
  !filteredNodeIds.includes(node.id) &&
  !node.isTimelinePlaceholder &&
  node.completionStatus === 'complete' &&
  node.usageConsent?.share !== false &&
  node.visibility !== 'private' &&
  node.visibility !== 'selected' &&
  !!node.imageUrl

const buildSharePreviewPhotoHighlights = (nodes: ManagedTimelineNode[], filteredNodeIds: string[]): SharePreviewPhoto[] =>
  nodes.filter((node) => isPublicSharePreviewMoment(node, filteredNodeIds)).slice(0, 5).map((node, index) => ({
    id: node.id,
    imageUrl: node.imageUrl || '',
    meta: node.uploaderName || `照片 ${index + 1}`,
    title: node.timelineTitle || node.caption || '聚会照片',
  }))

const buildPhotoHighlightsNotice = (count: number) =>
  count > 0 ? `已同步 ${count} 张可分享照片。` : '暂无可展示照片，先去记录一张聚会照片。'

const updateSharePreviewPhotoState = (
  id: string,
  patch: Partial<Pick<SharePreviewPhoto, 'imageBroken' | 'imageUrl'>>,
  photoHighlights: SharePreviewPhoto[],
) => ({
  photoHighlights: photoHighlights.map((item) => (item.id === id ? { ...item, ...patch } : item)),
})

const buildBriefPreviewState = (brief: ManagedSessionBrief): Partial<SharePreviewState> => {
  const accountingHighlights = brief.accountingHighlights.slice(0, 4).map((item, index) => ({
    id: String(item.id || item.type || `contract-metric-${index}`),
    label: String(item.label || item.title || item.text || item.id || '账本'),
    unit: String(item.unit || ''),
    value: String(item.value ?? item.count ?? ''),
  })).filter((item) => item.label || item.value)
  const keyEvents = brief.eventHighlights.slice(0, 3).map((item, index) => ({
    id: String(item.id || item.nodeId || `contract-event-${index}`),
    meta: String(item.text || item.summary || item.caption || item.meta || ''),
    title: String(item.title || item.label || item.eventType || '聚会关键时刻'),
  })).filter((item) => item.title || item.meta)
  const filteredNodeIds = readStringArray(brief.shareContentFilter, 'filteredNodeIds')
  const visibleNodeIds = brief.timeline.nodes
    .map((node) => node.id)
    .filter((id) => id && !filteredNodeIds.includes(id))
  const photoHighlights = buildSharePreviewPhotoHighlights(brief.timeline.nodes, filteredNodeIds)
  const permissionState = String(
    brief.shareContentFilter.permissionState ||
    brief.shareContentFilter.permission ||
    brief.shareContentFilter.visibilityScope ||
    '',
  )

  return {
    accountingHighlights,
    briefId: brief.id,
    filteredNodeIds,
    keyEvents,
    ledgerRankings: brief.ledgerRankings,
    ledgerSummary: brief.ledgerSummary,
    permissionState,
    photoHighlights,
    photoHighlightsNotice: buildPhotoHighlightsNotice(photoHighlights.length),
    settlementSummary: brief.settlementSummary,
    shareContentFilter: brief.shareContentFilter,
    sessionId: brief.sessionId,
    sessionName: brief.title || '',
    visibleNodeIds,
  }
}

const buildInviteStatusText = (joinedCount: number, playerCount: number) => {
  if (playerCount <= 0) {
    return '等待好友加入'
  }
  if (joinedCount <= 0) {
    return '邀请已准备好'
  }
  return `${joinedCount}/${playerCount} 位好友已加入`
}

const isEndedShareSession = (item?: { endedAt?: string; stateText?: string; status?: string }) =>
  Boolean(item?.endedAt) || /已结束|结束|已完成|ended|finished|closed|complete|completed|done/i.test(`${item?.stateText || ''} ${item?.status || ''}`)

const buildPreviewHeader = (archiveMode: boolean, hasStarted = false) => {
  if (archiveMode) {
    return {
      previewBody: '聚会已经结束，这里只展示可分享的回忆内容。',
      previewTitle: '聚会分享预览',
    }
  }
  if (hasStarted) {
    return {
      previewBody: '加入后直接进入现场记录，照片和账本会同步。',
      previewTitle: '聚会正在进行',
    }
  }
  return {
    previewBody: '加入成员槽位，等待房主拍下第一张照片。',
    previewTitle: '邀请好友加入',
  }
}

const normalizeInviteCode = (value?: string) => String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)

const isSessionFullJoinError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error || '')
  const statusCode = Number((error as { statusCode?: number })?.statusCode) || 0
  return statusCode === 409 || /session[_\s-]*full|party[_\s-]*full|SESSION_FULL/i.test(message)
}

const isSessionEndedJoinError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error || '')
  return /session[_\s-]*ended|party[_\s-]*ended|SESSION_ENDED|已结束|结束/i.test(message)
}

const toSafeSharePreviewErrorText = (message: string) => {
  const raw = String(message || '').trim()
  const lower = raw.toLowerCase()
  if (
    lower.includes('not session member') ||
    lower.includes('unauthorized') ||
    lower.includes('forbidden') ||
    lower.includes('401') ||
    lower.includes('403')
  ) {
    return '当前账号暂不能查看这张分享页'
  }
  if (lower.includes('network') || lower.includes('timeout') || lower.includes('failed to fetch')) {
    return '网络开小差了，请稍后重试'
  }
  if (raw.includes('超时')) {
    return '网络开小差了，请稍后重试'
  }
  return '这张分享页暂时无法展示，请稍后重试'
}

const getJoinStatusText = (status?: string) => {
  switch (String(status || '').toLowerCase()) {
    case 'joined':
    case 'active':
    case 'ready':
      return '已加入'
    case 'invited':
    case 'pending':
      return '待加入'
    case 'left':
      return '已离开'
    default:
      return '本聚会成员'
  }
}

Page<SharePreviewState, SharePreviewMethods>({
  data: {
    accountingHighlights: [],
    avatars: [],
    briefId: '',
    canvasHeight: 960,
    canvasWidth: 720,
    errorText: '',
    filteredNodeIds: [],
    canJoinSession: false,
    inviteCode: '',
    inviteStatusText: '等待好友加入',
    joinActionLabel: '加入待命',
    joinedCount: 0,
    joinStatusPlayers: [],
    keyEvents: [],
    ledgerRankings: {},
    ledgerSummary: {},
    ledgerCount: 0,
    photoHighlights: [],
    photoHighlightsNotice: '暂无可展示照片，先去记录一张聚会照片。',
    playerCount: 0,
    posterImagePath: '',
    previewBody: '输入口令，一起进入这场聚会。',
    previewTitle: '邀请好友加入',
    settlementSummary: {},
    sessionId: '',
    shareId: '',
    shareArchiveMode: false,
    sessionName: '',
    shareContentFilter: {},
    shareSummary: '邀请好友加入后，可以一起查看这场聚会的回忆。',
    shareReturnMode: false,
    showJoinStatus: false,
    permissionState: '',
    previewLoadFailed: false,
    visibleNodeIds: [],
  },

  async onLoad(query) {
    await this.loadInviteSession(query as Record<string, string | undefined>)
  },

  async loadInviteSession(query) {
    const runtime = getSessionRuntime()
    const sessionId = typeof query?.sessionId === 'string' ? decodeURIComponent(query.sessionId) : runtime.sessionId || ''
    const inviteCode = typeof query?.inviteCode === 'string' ? decodeURIComponent(query.inviteCode) : runtime.inviteCode || ''
    const briefId = typeof query?.briefId === 'string' ? decodeURIComponent(query.briefId) : ''
    const manifestId = typeof query?.manifestId === 'string' ? decodeURIComponent(query.manifestId) : ''
    const shareId = typeof query?.shareId === 'string' ? decodeURIComponent(query.shareId) : ''
    const taskId = typeof query?.taskId === 'string' ? decodeURIComponent(query.taskId) : ''
    const shareTaskId = typeof query?.shareTaskId === 'string' ? decodeURIComponent(query.shareTaskId) : ''
    const reportId = typeof query?.reportId === 'string' ? decodeURIComponent(query.reportId) : ''
    const hasShareReturnMarker = !!briefId || !!shareId || !!taskId || !!shareTaskId || !!reportId
    const shareReturnMode = query?.mode === 'return' || query?.view === 'return' || hasShareReturnMarker
    const initialArchiveMode = shareReturnMode || Boolean(briefId)

    this.setData({
      briefId,
      inviteCode,
      ...buildPreviewHeader(initialArchiveMode),
      sessionId,
      shareId,
      shareArchiveMode: initialArchiveMode,
      shareReturnMode,
      previewLoadFailed: false,
      errorText: '',
    })

    if (!sessionId && !inviteCode && !briefId && !manifestId && !hasShareReturnMarker) {
      this.applyPreviewUnavailableState('这张分享页暂时无法展示，请稍后重试')
      return
    }

    try {
      const briefPreview = briefId
        ? await this.loadBriefContract(briefId)
        : sessionId
          ? await this.loadSessionBriefContract(sessionId)
          : null
      const effectiveSessionId = sessionId || String(briefPreview?.sessionId || '')
      let liveSession = null as Awaited<ReturnType<typeof getManagedLiveSession>> | null
      try {
        if (effectiveSessionId || inviteCode) {
          liveSession = await getManagedLiveSession(effectiveSessionId, inviteCode)
        }
      } catch (error) {
        if (inviteCode && effectiveSessionId) {
          liveSession = await getManagedLiveSession(undefined, inviteCode).catch(() => null)
        }
        if (!liveSession && !briefPreview) {
          throw error
        }
      }

      if (!liveSession && briefPreview) {
        const archiveMode = true
        this.setData({
          ...briefPreview,
          briefId,
          canJoinSession: false,
          inviteCode,
          inviteStatusText: '仅展示可分享内容',
          joinActionLabel: '查看回忆',
          joinedCount: 0,
          ledgerCount: Array.isArray(briefPreview.accountingHighlights) ? briefPreview.accountingHighlights.length : 0,
          photoHighlightsNotice: buildPhotoHighlightsNotice(Array.isArray(briefPreview.photoHighlights) ? briefPreview.photoHighlights.length : 0),
          playerCount: 0,
          ...buildPreviewHeader(archiveMode),
          previewLoadFailed: false,
          shareArchiveMode: archiveMode,
          sessionId: effectiveSessionId,
          shareSummary: Array.isArray(briefPreview.photoHighlights) && (briefPreview.photoHighlights.length || (briefPreview.accountingHighlights as SharePreviewMetric[] | undefined)?.length || (briefPreview.keyEvents as SharePreviewKeyEvent[] | undefined)?.length)
            ? '这场聚会的照片和账本高光已准备好分享。'
            : '这场聚会的可分享照片和账本高光会在这里汇总。',
        })
        return
      }

      if (!liveSession) {
        this.applyPreviewUnavailableState('这张分享页暂时无法展示，请稍后重试', {
          briefId,
          inviteCode,
          sessionId: effectiveSessionId,
        })
        return
      }

      const playerCount = Number(liveSession.playerCount) || 0
      const joinedAvatarMap = new Map<string, string>()
      liveSession.joinedPlayers.forEach((item) => {
        if (item.profileId && item.avatarUrl) joinedAvatarMap.set(item.profileId, item.avatarUrl)
        if (item.name && item.avatarUrl) joinedAvatarMap.set(item.name, item.avatarUrl)
      })
      const joinStatusPlayers = liveSession.joinStatusPlayers.slice(0, playerCount).map((item) => ({
        avatarUrl: item.avatarUrl || (item.profileId ? joinedAvatarMap.get(item.profileId) || '' : '') || (item.name ? joinedAvatarMap.get(item.name) || '' : ''),
        name: item.name,
        status: getJoinStatusText(item.status),
      }))
      const avatars = liveSession.joinedPlayers.slice(0, Math.min(liveSession.joinedCount, 4)).map((item) => item.avatarUrl).filter(Boolean)
      const totalDebt = liveSession.joinStatusPlayers.reduce((sum, item) => sum + (Number(item.debtCount) || 0), 0)
      const totalDrink = liveSession.joinStatusPlayers.reduce((sum, item) => sum + (Number(item.drinkCount) || 0), 0)
      const totalCleared = liveSession.joinStatusPlayers.reduce((sum, item) => sum + (Number(item.clearedCount) || 0), 0)
      const ledgerCount = liveSession.joinStatusPlayers.filter((item) => (Number(item.debtCount) || 0) + (Number(item.drinkCount) || 0) + (Number(item.clearedCount) || 0) > 0).length
      const accountingHighlights = [
        totalDebt > 0 ? { id: 'debt', label: '待整理', value: `${totalDebt}`, unit: '条' } : null,
        totalDrink > 0 ? { id: 'drink', label: '已记录', value: `${totalDrink}`, unit: '条' } : null,
        totalCleared > 0 ? { id: 'cleared', label: '已完成', value: `${totalCleared}`, unit: '条' } : null,
        ledgerCount > 0 ? { id: 'ledger', label: '账本', value: `${ledgerCount}`, unit: '人有记录' } : null,
      ].filter((item): item is SharePreviewMetric => !!item)
      const keyEvents = liveSession.joinStatusPlayers
        .filter((item) => (Number(item.debtCount) || 0) + (Number(item.drinkCount) || 0) + (Number(item.clearedCount) || 0) > 0)
        .slice(0, 3)
        .map<SharePreviewKeyEvent>((item) => ({
          id: item.profileId || item.name,
          meta: `待整理 ${Number(item.debtCount) || 0} 条 · 已记录 ${Number(item.drinkCount) || 0} 条 · 已完成 ${Number(item.clearedCount) || 0} 条`,
          title: `${item.name || '成员'} 的账本高光`,
        }))
      const nextAccountingHighlights = briefPreview?.accountingHighlights?.length ? briefPreview.accountingHighlights as SharePreviewMetric[] : accountingHighlights
      const nextKeyEvents = briefPreview?.keyEvents?.length ? briefPreview.keyEvents as SharePreviewKeyEvent[] : keyEvents
      const nextPhotoHighlights = Array.isArray(briefPreview?.photoHighlights) ? briefPreview.photoHighlights as SharePreviewPhoto[] : []
      const nextPhotoNotice = buildPhotoHighlightsNotice(nextPhotoHighlights.length)
      const liveStarted = hasFirstPhotoEvidence(liveSession)
      const archiveMode = shareReturnMode || isEndedShareSession(liveSession)

      setSessionRuntime({
        inviteCode: liveSession.inviteCode,
        playerCount,
        selectedPlayers: liveSession.joinStatusPlayers.map<SessionParticipant>((item) => ({
          avatarUrl: item.avatarUrl,
          name: item.name,
          profileId: item.profileId,
          status: item.status,
        })),
        sessionId: liveSession.id,
        sessionName: liveSession.sessionName,
        templateName: liveSession.templateName,
      })

      this.setData({
        accountingHighlights: nextAccountingHighlights,
        avatars,
        briefId,
        canJoinSession: !archiveMode && Boolean(liveSession.inviteCode || inviteCode),
        filteredNodeIds: Array.isArray(briefPreview?.filteredNodeIds) ? briefPreview.filteredNodeIds as string[] : [],
        inviteCode: liveSession.inviteCode,
        inviteStatusText: archiveMode ? '仅展示可分享内容' : liveStarted ? '聚会正在进行，可进入现场' : buildInviteStatusText(liveSession.joinedCount, playerCount),
        joinActionLabel: liveStarted ? '进入现场' : '加入待命',
        joinedCount: liveSession.joinedCount,
        joinStatusPlayers,
        keyEvents: nextKeyEvents,
        ledgerCount: nextAccountingHighlights.length ? nextAccountingHighlights.length : ledgerCount,
        ledgerRankings: briefPreview?.ledgerRankings as Record<string, unknown> || this.data.ledgerRankings,
        ledgerSummary: briefPreview?.ledgerSummary as Record<string, unknown> || this.data.ledgerSummary,
        permissionState: String(briefPreview?.permissionState || ''),
        photoHighlights: nextPhotoHighlights,
        photoHighlightsNotice: nextPhotoNotice,
        playerCount,
        posterImagePath: '',
        ...buildPreviewHeader(archiveMode, liveStarted),
        previewLoadFailed: false,
        settlementSummary: briefPreview?.settlementSummary as Record<string, unknown> || this.data.settlementSummary,
        shareContentFilter: briefPreview?.shareContentFilter as Record<string, unknown> || this.data.shareContentFilter,
        shareArchiveMode: archiveMode,
        sessionId: liveSession.id || effectiveSessionId,
        sessionName: liveSession.sessionName || '',
        shareSummary: nextPhotoHighlights.length || nextAccountingHighlights.length || nextKeyEvents.length
          ? `${liveSession.sessionName || '这场聚会'} 已准备好邀请，照片和账本会合并到酷炫分享页。`
          : '这场聚会的可分享照片和账本高光会在这里汇总。',
        visibleNodeIds: Array.isArray(briefPreview?.visibleNodeIds) ? briefPreview.visibleNodeIds as string[] : [],
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : '这张分享页暂时无法展示，请稍后重试'
      this.applyPreviewUnavailableState(message, { briefId, inviteCode, sessionId })
    }
  },

  applyPreviewUnavailableState(message, patch = {}) {
    const safeMessage = toSafeSharePreviewErrorText(message)
    const archiveMode = Boolean(patch.shareArchiveMode ?? this.data.shareArchiveMode ?? patch.briefId ?? this.data.briefId)
    this.setData({
      accountingHighlights: [],
      avatars: [],
      canJoinSession: false,
      errorText: safeMessage,
      filteredNodeIds: [],
      inviteStatusText: archiveMode ? '仅展示可分享内容' : patch.inviteCode || this.data.inviteCode ? '邀请已准备好' : '等待好友加入',
      joinActionLabel: '加入待命',
      joinedCount: 0,
      joinStatusPlayers: [],
      keyEvents: [],
      ledgerCount: 0,
      permissionState: '',
      photoHighlights: [],
      photoHighlightsNotice: '暂无可展示照片，先去记录一张聚会照片。',
      playerCount: 0,
      previewLoadFailed: true,
      ...buildPreviewHeader(archiveMode),
      sessionName: '',
      shareArchiveMode: archiveMode,
      shareSummary: '这场聚会的可分享照片和账本高光会在这里汇总。',
      visibleNodeIds: [],
      ...patch,
    })
  },

  async loadBriefContract(briefId) {
    try {
      const brief: ManagedSessionBrief = await getManagedSessionBrief(briefId)
      return buildBriefPreviewState(brief)
    } catch {
      return null
    }
  },

  async loadSessionBriefContract(sessionId) {
    try {
      const brief = await createOrRefreshManagedSessionBrief(sessionId)
      return buildBriefPreviewState(brief)
    } catch {
      return null
    }
  },

  onShareAppMessage() {
    const query = [
      this.data.inviteCode ? `inviteCode=${encodeURIComponent(this.data.inviteCode)}` : '',
      this.data.sessionId ? `sessionId=${encodeURIComponent(this.data.sessionId)}` : '',
      this.data.briefId ? `briefId=${encodeURIComponent(this.data.briefId)}` : '',
    ].filter(Boolean).join('&')

    return {
      title: `${this.data.sessionName}，来记录这场聚会`,
      path: `/pages/share-preview/index${query ? `?${query}` : ''}`,
      imageUrl: this.data.posterImagePath || '',
    }
  },

  handleTabTap(event) {
    const { tab } = event.currentTarget.dataset as { tab: 'preview' | 'status' }
    this.setData({ showJoinStatus: tab === 'status' })
  },

  handleBackTap() {
    wx.navigateBack({
      fail: () => {
        this.showPreviewToast('已停留在分享回流页')
      },
    })
  },

  handlePhotoImageLoad(event) {
    const { id } = event.currentTarget.dataset as { id?: string }
    const detail = (event as unknown as { detail?: { height?: number; width?: number } }).detail || {}
    if (!id) {
      return
    }
    const width = Number(detail.width)
    const height = Number(detail.height)
    const hasSize = Number.isFinite(width) && Number.isFinite(height)
    const imageBroken = hasSize && width < 8 && height < 8
    this.setData(updateSharePreviewPhotoState(id, { imageBroken }, this.data.photoHighlights))
  },

  handleCopyInviteCodeTap() {
    if (!this.data.inviteCode) {
      this.showPreviewToast('暂无可复制口令')
      return
    }
    wx.setClipboardData({
      data: this.data.inviteCode,
      success: () => {
        this.showPreviewToast('口令已复制')
      },
      fail: () => {
        this.showPreviewToast('口令复制失败')
      },
    })
  },

  async handleJoinSessionTap() {
    if (this.data.shareArchiveMode) {
      this.showPreviewToast('聚会已结束，可在相册查看回忆')
      return
    }

    const inviteCode = normalizeInviteCode(this.data.inviteCode)
    if (!inviteCode) {
      this.showPreviewToast('暂无可用口令')
      return
    }

    const redirect = `/pages/share-preview/index?inviteCode=${encodeURIComponent(inviteCode)}${this.data.sessionId ? `&sessionId=${encodeURIComponent(this.data.sessionId)}` : ''}`
    const profile = await ensureUserAuthorized(redirect)
    if (!profile) {
      return
    }

    wx.showLoading({
      title: '加入中',
      mask: true,
    })

    try {
      const liveSession = await joinManagedSession(inviteCode)
      const isJudge = Boolean(liveSession.hostProfileId && liveSession.hostProfileId === profile.id)
      const canEnterLive = isActiveForResumeByFirstPhoto(liveSession)
      setSessionRuntime({
        currentUser: {
          avatarUrl: profile.avatarUrl,
          id: profile.id,
          name: profile.name,
        },
        endedAt: liveSession.endedAt,
        firstPhotoUploadedAt: liveSession.firstPhotoUploadedAt || '',
        inviteCode: liveSession.inviteCode,
        isJudge,
        playerCount: liveSession.playerCount,
        playerStats: [],
        selectedPlayers: liveSession.joinStatusPlayers.map<SessionParticipant>((item) => ({
          avatarUrl: item.avatarUrl,
          name: item.name,
          profileId: item.profileId,
          status: item.status,
        })),
        sessionId: liveSession.id,
        sessionName: liveSession.sessionName,
        startedAt: 0,
        state: canEnterLive ? '进行中' : '待首拍',
        status: canEnterLive ? '进行中' : '待首拍',
        templateImageUrl: liveSession.templateImageUrl,
        templateName: liveSession.templateName,
      })

      const role = isJudge ? 'judge' : 'viewer'
      const targetUrl = canEnterLive
        ? `/pages/live-record/index?role=${role}&sessionId=${encodeURIComponent(liveSession.id)}&sessionName=${encodeURIComponent(liveSession.sessionName || '聚会记录')}`
        : `/pages/waiting-room/index?role=${role}&sessionId=${encodeURIComponent(liveSession.id)}&inviteCode=${encodeURIComponent(liveSession.inviteCode || inviteCode)}&sessionName=${encodeURIComponent(liveSession.sessionName || '聚会记录')}`
      wx.redirectTo({
        url: targetUrl,
        fail: () => {
          wx.reLaunch({ url: targetUrl })
        },
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'join failed'
      const sessionFull = isSessionFullJoinError(error)
      const sessionEnded = isSessionEndedJoinError(error)
      const notPlayer = message.includes('not session player')
      wx.showModal({
        title: sessionEnded ? '聚会已结束' : sessionFull ? '聚会已满' : notPlayer ? '暂不能加入' : '加入失败',
        content: sessionEnded
          ? '这场聚会已经结束，不能再加入。可在相册查看聚会回忆。'
          : sessionFull
          ? '这场聚会人数已满，暂时不能继续加入。请联系发起人调整人数或创建新的聚会。'
          : notPlayer
            ? '当前口令对应的聚会名单中没有你的账号，请联系发起人确认是否已添加你。'
            : '当前无法加入聚会，请检查分享链接或口令是否有效。',
        showCancel: false,
      })
    } finally {
      wx.hideLoading()
    }
  },

  async handlePhotoImageError(event) {
    const { id } = event.currentTarget.dataset as { id?: string }
    if (!id) {
      return
    }
    const source = this.data.photoHighlights.find((item) => item.id === id)?.imageUrl || ''
    const fallbackPath = await resolveCachedManagedImagePath(source).catch(() => source)
    if (fallbackPath && fallbackPath !== source) {
      this.setData(updateSharePreviewPhotoState(id, { imageBroken: false, imageUrl: fallbackPath }, this.data.photoHighlights))
      return
    }
    this.setData(updateSharePreviewPhotoState(id, { imageBroken: true }, this.data.photoHighlights))
  },

  async handleRetryTap() {
    await this.loadInviteSession({
      briefId: this.data.briefId,
      inviteCode: this.data.inviteCode,
      sessionId: this.data.sessionId,
    })
  },

  handleReturnAlbumTap() {
    wx.navigateTo({
      url: '/pages/album/index?mode=joined',
      fail: () => {
        this.showPreviewToast('相册暂时打不开，请稍后重试')
      },
    })
  },

  handleReturnHomeTap() {
    wx.reLaunch({
      url: '/pages/index/index',
      fail: () => {
        this.showPreviewToast('暂时无法返回首页')
      },
    })
  },

  drawCanvasToFile(width, height, drawer) {
    return new Promise((resolve, reject) => {
      this.setData({ canvasWidth: width, canvasHeight: height }, () => {
        const ctx = wx.createCanvasContext('sharePreviewCanvas', this)
        drawer(ctx)
        ctx.draw(false, () => {
          wx.canvasToTempFilePath(
            {
              canvasId: 'sharePreviewCanvas',
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

  buildInvitePoster() {
    const width = 720
    const height = 960
    const textInvite = '\u805a\u4f1a\u8bb0\u5f55\u5e08\u9080\u8bf7\u51fd'
    const textHappyA = '\u4e00\u8d77\u8bb0\u5f55'
    const textHappyB = '\u8fd9\u573a\u805a\u4f1a'
    const textFallbackName = '\u597d\u53cb\u805a\u4f1a'
    const textJoinCode = '\u52a0\u5165\u53e3\u4ee4'
    const textPending = '\u672a\u751f\u6210'
    const textJoined = '\u5df2\u52a0\u5165'
    const textJoinTip = '\u8f93\u5165\u53e3\u4ee4\u5373\u53ef\u52a0\u5165'
    const textShareTip = '\u4fdd\u5b58\u540e\u53d1\u7ed9\u597d\u53cb\uff0c\u4e00\u8d77\u62cd\u7b2c\u4e00\u5f20'
    const textDrinkTip = '\u9ed8\u8ba4\u4ec5\u672c\u805a\u4f1a\u53ef\u89c1'

    return this.drawCanvasToFile(width, height, (ctx) => {
      const drawFitText = (value: string, x: number, y: number, maxWidth: number, fontSize: number, color: string) => {
        let content = String(value || '').trim()
        ctx.setFontSize(fontSize)
        ctx.setFillStyle(color)
        if (!content) {
          return
        }
        while (content.length > 1 && ctx.measureText(content).width > maxWidth) {
          content = content.slice(0, -2) + '...'
        }
        ctx.fillText(content, x, y)
      }

      const drawCenteredFitText = (value: string, centerX: number, y: number, maxWidth: number, fontSize: number, color: string) => {
        let content = String(value || '').trim()
        ctx.setFontSize(fontSize)
        ctx.setFillStyle(color)
        if (!content) {
          return
        }
        while (content.length > 1 && ctx.measureText(content).width > maxWidth) {
          content = content.slice(0, -2) + '...'
        }
        const metrics = ctx.measureText(content)
        ctx.fillText(content, centerX - metrics.width / 2, y)
      }

      ctx.setFillStyle('#fff4e6')
      ctx.fillRect(0, 0, width, height)

      const bg = ctx.createLinearGradient(0, 0, width, height)
      bg.addColorStop(0, '#ff6542')
      bg.addColorStop(0.52, '#ff9147')
      bg.addColorStop(1, '#22ad78')
      ctx.setFillStyle(bg)
      ctx.fillRect(36, 36, 648, 888)

      ctx.setFillStyle('rgba(255,255,255,0.18)')
      ctx.beginPath()
      ctx.arc(610, 116, 92, 0, Math.PI * 2)
      ctx.fill()
      ctx.setFillStyle('rgba(255,218,116,0.2)')
      ctx.beginPath()
      ctx.arc(96, 760, 72, 0, Math.PI * 2)
      ctx.fill()

      ctx.setFillStyle('rgba(255,255,255,0.18)')
      ctx.fillRect(78, 82, 214, 42)
      ctx.setFontSize(22)
      ctx.setFillStyle('#ffffff')
      ctx.fillText(textInvite, 98, 110)

      ctx.setFontSize(54)
      ctx.setFillStyle('#ffffff')
      ctx.fillText(textHappyA, 78, 206)
      ctx.fillText(textHappyB, 78, 270)
      drawFitText(this.data.sessionName || textFallbackName, 78, 326, 560, 30, 'rgba(255,255,255,0.92)')

      ctx.setFillStyle('rgba(255,253,248,0.96)')
      ctx.fillRect(78, 380, 564, 310)
      ctx.setFillStyle('#8f6248')
      ctx.setFontSize(26)
      ctx.fillText(textJoinCode, 116, 438)
      ctx.setFillStyle('#fff3e3')
      ctx.fillRect(116, 470, 488, 112)
      drawCenteredFitText(this.data.inviteCode || textPending, 360, 544, 430, 62, '#24160f')

      ctx.setFillStyle('#fff8ee')
      ctx.fillRect(116, 616, 226, 46)
      drawCenteredFitText(`${this.data.joinedCount}/${this.data.playerCount || 0} ${textJoined}`, 229, 647, 190, 24, '#24160f')
      ctx.setFillStyle('#fff8ee')
      ctx.fillRect(362, 616, 242, 46)
      drawCenteredFitText(textJoinTip, 483, 647, 210, 24, '#24160f')

      ctx.setFillStyle('rgba(36,22,15,0.2)')
      ctx.fillRect(78, 724, 564, 86)
      drawCenteredFitText(textShareTip, 360, 778, 500, 30, '#ffffff')

      ctx.setFillStyle('rgba(255,255,255,0.86)')
      ctx.fillRect(78, 840, 564, 44)
      drawCenteredFitText(textDrinkTip, 360, 870, 420, 22, '#5f4938')
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

  showPreviewToast(message) {
    wx.showToast({ title: message, icon: 'none' })
  },

  openPage(url) {
    wx.navigateTo({
      url,
      fail: () => {
        wx.redirectTo({ url })
      },
    })
  },
})

export {}
