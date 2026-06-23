import {
  createManagedSessionEvent,
  getManagedLiveSession,
  getManagedSessionTimeline,
  updateManagedSession,
  type ManagedTimelineNode,
} from '../../services/operations'
import { isActiveForResumeByFirstPhoto, isEndedFirstPhotoState } from '../../utils/first-photo-state'
import {
  getSessionRuntime,
  hasSessionFirstPhoto,
  resolveSessionParticipants,
  setSessionRuntime,
  type SessionParticipant,
  type SessionPlayerStat,
} from '../../utils/session'
import { getCurrentDisplayProfile } from '../../utils/social'

interface LedgerStat {
  label: string
  value: string
}

interface LedgerPlayer {
  avatarUrl: string
  debtCount: number
  drinkCount: number
  id: string
  name: string
  profileId?: string
}

interface LedgerPageState {
  baselinePlayers: LedgerPlayer[]
  hasSession: boolean
  isJudge: boolean
  ledgerDirty: boolean
  ledgerEventCount: number
  ledgerEditable: boolean
  ledgerKicker: string
  ledgerSubmitting: boolean
  players: LedgerPlayer[]
  primaryActionLabel: string
  sessionHint: string
  sessionId: string
  sessionName: string
  sessionViewState: LedgerSessionViewState
  showCreateAction: boolean
  stats: LedgerStat[]
}

interface LedgerPageMethods {
  createLedgerEventsForDiff: (previousPlayers: LedgerPlayer[], nextPlayers: LedgerPlayer[]) => Promise<boolean>
  handleAdjustTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handleConfirmTap: () => Promise<void>
  handleCreateTap: () => void
  handleRecordTap: () => void
  hydrateLedger: () => Promise<void>
  openPage: (url: string) => void
  persistPlayers: (players: LedgerPlayer[]) => Promise<boolean>
  showPreviewToast: (message: string) => void
}

type LedgerSessionViewState = 'noSession' | 'pendingFirstPhoto' | 'inProgress' | 'ended'

const internalDisplayPattern = /(PR\s+Seed|PR-BE-DB-LOGIN|IT-MOMENTS|DEBUG|openid|openId|unionId|signature)/i

const cleanDisplayName = (value?: string, fallback = '成员') => {
  const text = String(value || '').trim()
  if (!text || internalDisplayPattern.test(text)) {
    return fallback
  }
  return text
}

const isForbiddenError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error || '')
  return /forbidden|403|无权限|权限/i.test(message)
}

const mergeAvatar = (profileId?: string, avatarUrl = '') => {
  const runtime = getSessionRuntime()
  if (avatarUrl) return avatarUrl
  if (profileId && runtime.currentUser?.id === profileId) return runtime.currentUser.avatarUrl || ''
  const matched = (runtime.selectedPlayers || []).find((item) => item.profileId === profileId)
  return matched?.avatarUrl || ''
}

const buildTimelineAvatarMap = (nodes: ManagedTimelineNode[]) => {
  const map = new Map<string, string>()
  nodes.forEach((node) => {
    if (node.nodeKind === 'moment') {
      if (node.uploaderProfileId && node.uploaderAvatarUrl) {
        map.set(node.uploaderProfileId, node.uploaderAvatarUrl)
      }
      return
    }
    if (node.operatorProfileId && node.operatorAvatarUrl) {
      map.set(node.operatorProfileId, node.operatorAvatarUrl)
    }
    if (node.targetProfileId && node.targetAvatarUrl) {
      map.set(node.targetProfileId, node.targetAvatarUrl)
    }
  })
  return map
}

const buildPlayers = (): LedgerPlayer[] => {
  const runtime = getSessionRuntime()
  const statMap = new Map((runtime.playerStats || []).map((item) => [item.profileId || item.name, item]))
  const participants = resolveSessionParticipants(runtime)
  const fallbackParticipants = participants.length
    ? participants
    : runtime.currentUser
      ? [{ avatarUrl: runtime.currentUser.avatarUrl, name: runtime.currentUser.name, profileId: runtime.currentUser.id }]
      : []

  return fallbackParticipants.slice(0, runtime.playerCount || fallbackParticipants.length).map((item, index) => {
    const stat = statMap.get(item.profileId || item.name)
    return {
      avatarUrl: mergeAvatar(item.profileId, item.avatarUrl),
      debtCount: Number(stat?.debtCount) || 0,
      drinkCount: Number(stat?.drinkCount) || 0,
      id: item.profileId || `ledger-player-${index + 1}`,
      name: cleanDisplayName(item.name, `成员 ${index + 1}`),
      profileId: item.profileId,
    }
  })
}

const buildStats = (players = buildPlayers()): LedgerStat[] => {
  const runtime = getSessionRuntime()
  const pending = players.reduce((sum, item) => sum + (Number(item.debtCount) || 0), 0)
  const recorded = players.reduce((sum, item) => sum + (Number(item.drinkCount) || 0), 0)
  return [
    { label: '成员', value: String(runtime.playerCount || players.length || 0) },
    { label: '欠酒', value: String(pending) },
    { label: '加酒', value: String(recorded) },
  ]
}

const applyLedgerEventsToPlayers = (players: LedgerPlayer[], nodes: ManagedTimelineNode[]) => {
  const eventPlayers = players.map((item) => ({ ...item, debtCount: 0, drinkCount: 0 }))
  let entryCount = 0

  nodes.forEach((node) => {
    if (node.nodeKind !== 'event') {
      return
    }
    if (node.eventType !== 'drink_debt' && node.eventType !== 'drink_add') {
      return
    }

    const rawDelta = Number(node.scoreDelta) || 0
    const score = Math.max(1, Math.abs(rawDelta || 1))
    const signedScore = rawDelta < 0 ? -score : score
    const targetId = node.targetProfileId || ''
    const targetName = cleanDisplayName(node.targetName, '')
    const matched = eventPlayers.find((item) => (targetId && item.profileId === targetId) || (!!targetName && item.name === targetName))
    entryCount += 1

    if (node.eventType === 'drink_debt') {
      if (matched) {
        matched.debtCount = Math.max(0, matched.debtCount + signedScore)
      }
      return
    }

    if (matched) {
      matched.drinkCount = Math.max(0, matched.drinkCount + signedScore)
    }
  })

  const nextPlayers = players.map((item) => {
    const eventPlayer = eventPlayers.find((eventItem) => eventItem.id === item.id)
    return {
      ...item,
      debtCount: Math.max(Number(item.debtCount) || 0, Number(eventPlayer?.debtCount) || 0),
      drinkCount: Math.max(Number(item.drinkCount) || 0, Number(eventPlayer?.drinkCount) || 0),
    }
  })
  const pendingCount = nextPlayers.reduce((sum, item) => sum + (Number(item.debtCount) || 0), 0)
  const addedCount = nextPlayers.reduce((sum, item) => sum + (Number(item.drinkCount) || 0), 0)

  return {
    addedCount,
    entryCount,
    pendingCount,
    players: nextPlayers,
  }
}

const buildStatsFromCounts = (players: LedgerPlayer[], counts?: { addedCount: number; pendingCount: number }): LedgerStat[] => {
  const pending = typeof counts?.pendingCount === 'number'
    ? counts.pendingCount
    : players.reduce((sum, item) => sum + (Number(item.debtCount) || 0), 0)
  const recorded = typeof counts?.addedCount === 'number'
    ? counts.addedCount
    : players.reduce((sum, item) => sum + (Number(item.drinkCount) || 0), 0)
  return [
    { label: '成员', value: String(players.length || 0) },
    { label: '欠酒', value: String(pending) },
    { label: '加酒', value: String(recorded) },
  ]
}

const toPlayerStats = (players: LedgerPlayer[]): SessionPlayerStat[] =>
  players.map((item) => ({
    avatarUrl: item.avatarUrl,
    clearedCount: 0,
    debtCount: item.debtCount,
    drinkCount: item.drinkCount,
    meta: '',
    name: item.name,
    profileId: item.profileId,
  }))

const isRuntimeEnded = () => {
  const runtime = getSessionRuntime()
  return isEndedFirstPhotoState({
    endedAt: runtime.endedAt,
    state: runtime.state,
    status: runtime.status,
  })
}

const resolveRuntimeLedgerState = (): LedgerSessionViewState => {
  const runtime = getSessionRuntime()
  if (!runtime.sessionId) return 'noSession'
  if (isRuntimeEnded()) return 'ended'
  return hasSessionFirstPhoto(runtime) ? 'inProgress' : 'pendingFirstPhoto'
}

const resolveLedgerStateCopy = (state: LedgerSessionViewState, isJudge = false) => {
  if (state === 'inProgress') {
    return {
      kicker: isJudge ? '发起人可调整' : '仅查看，请发起人调整',
      primaryActionLabel: '回到本局',
      sessionHint: '',
      showCreateAction: false,
    }
  }
  if (state === 'pendingFirstPhoto') {
    return {
      kicker: '待首拍',
      primaryActionLabel: isJudge ? '去拍第一张照片' : '等待首张照片',
      sessionHint: isJudge ? '首张照片保存后，这场聚会才会进入进行中和账本记录。' : '发起人拍下第一张照片后，账本会进入本局记录。',
      showCreateAction: true,
    }
  }
  if (state === 'ended') {
    return {
      kicker: '已结束',
      primaryActionLabel: '查看相册',
      sessionHint: '这场聚会已结束，账本只保留查看入口。',
      showCreateAction: true,
    }
  }
  return {
    kicker: '暂无进行中',
    primaryActionLabel: '暂无进行中聚会',
    sessionHint: '先创建聚会并保存第一张照片，账本会自动关联本局。',
    showCreateAction: true,
  }
}

const buildLedgerStatePatch = (state: LedgerSessionViewState, isJudge = false) => {
  const copy = resolveLedgerStateCopy(state, isJudge)
  return {
    hasSession: state === 'inProgress',
    ledgerKicker: copy.kicker,
    primaryActionLabel: copy.primaryActionLabel,
    sessionHint: copy.sessionHint,
    sessionViewState: state,
    showCreateAction: copy.showCreateAction,
  }
}

Page<LedgerPageState, LedgerPageMethods>({
  data: {
    hasSession: false,
    baselinePlayers: [],
    isJudge: false,
    ledgerDirty: false,
    ledgerEditable: false,
    ledgerEventCount: 0,
    ledgerKicker: '暂无进行中',
    ledgerSubmitting: false,
    players: [],
    primaryActionLabel: '暂无进行中聚会',
    sessionHint: '先创建聚会并保存第一张照片，账本会自动关联本局。',
    sessionId: '',
    sessionName: '聚会账本',
    sessionViewState: 'noSession',
    showCreateAction: true,
    stats: buildStats([]),
  },

  onLoad(query) {
    const role = typeof query?.role === 'string' ? decodeURIComponent(query.role) : ''
    const sessionId = typeof query?.sessionId === 'string' ? decodeURIComponent(query.sessionId) : ''
    const sessionName = typeof query?.sessionName === 'string' ? decodeURIComponent(query.sessionName) : ''
    if (role === 'judge') {
      setSessionRuntime({ isJudge: false })
    }
    if (sessionId || sessionName) {
      const state = resolveRuntimeLedgerState()
      this.setData({
        ...buildLedgerStatePatch(state, false),
        sessionId,
        sessionName: sessionName || this.data.sessionName,
      })
      setSessionRuntime({
        sessionId: sessionId || getSessionRuntime().sessionId,
        sessionName: sessionName || getSessionRuntime().sessionName,
      })
    }
  },

  onShow() {
    void this.hydrateLedger()
  },

  async hydrateLedger() {
    const runtime = getSessionRuntime()
    const displayProfile = await getCurrentDisplayProfile().catch(() => null)
    if (displayProfile?.id) {
      setSessionRuntime({
        currentUser: {
          avatarUrl: displayProfile.avatarUrl || runtime.currentUser?.avatarUrl || '',
          id: displayProfile.id,
          name: cleanDisplayName(displayProfile.name || runtime.currentUser?.name, '发起人'),
        },
      })
    }
    const refreshedRuntime = getSessionRuntime()
    const sessionId = this.data.sessionId || refreshedRuntime.sessionId || ''

    if (sessionId) {
      try {
        const liveSession = await getManagedLiveSession(sessionId, refreshedRuntime.inviteCode)
        const timeline = await getManagedSessionTimeline(sessionId).catch(() => ({ nodes: [], pendingMediaCount: 0, sessionId }))
        const timelineAvatarMap = buildTimelineAvatarMap(timeline.nodes)
        const remotePlayers = liveSession.joinStatusPlayers.slice(0, liveSession.playerCount).map((item, index) => ({
          avatarUrl: mergeAvatar(item.profileId, item.avatarUrl || timelineAvatarMap.get(item.profileId || '') || ''),
          debtCount: Number(item.debtCount) || 0,
          drinkCount: Number(item.drinkCount) || 0,
          id: item.profileId || `ledger-player-${index + 1}`,
          name: cleanDisplayName(item.name, `成员 ${index + 1}`),
          profileId: item.profileId,
        }))
        const ledgerCounts = applyLedgerEventsToPlayers(remotePlayers, timeline.nodes)
        const isHost = Boolean(liveSession.hostProfileId && refreshedRuntime.currentUser?.id === liveSession.hostProfileId)
        const sessionViewState: LedgerSessionViewState = isEndedFirstPhotoState(liveSession)
          ? 'ended'
          : isActiveForResumeByFirstPhoto(liveSession)
            ? 'inProgress'
            : 'pendingFirstPhoto'

        setSessionRuntime({
          endedAt: liveSession.endedAt,
          firstPhotoUploadedAt: liveSession.firstPhotoUploadedAt || refreshedRuntime.firstPhotoUploadedAt || '',
          inviteCode: liveSession.inviteCode,
          isJudge: isHost,
          playerCount: liveSession.playerCount,
          playerStats: toPlayerStats(ledgerCounts.players),
          selectedPlayers: ledgerCounts.players.map<SessionParticipant>((item) => ({
            avatarUrl: item.avatarUrl,
            name: item.name,
            profileId: item.profileId,
            status: '已加入',
          })),
          sessionId: liveSession.id,
          sessionName: liveSession.sessionName,
        })

        this.setData({
          ...buildLedgerStatePatch(sessionViewState, isHost),
          isJudge: isHost,
          ledgerDirty: false,
          ledgerEditable: isHost && sessionViewState === 'inProgress',
          ledgerEventCount: ledgerCounts.entryCount,
          ledgerSubmitting: false,
          players: ledgerCounts.players,
          baselinePlayers: ledgerCounts.players.map((item) => ({ ...item })),
          sessionId: liveSession.id,
          sessionName: liveSession.sessionName || '聚会账本',
          stats: buildStatsFromCounts(ledgerCounts.players, ledgerCounts),
        })
        return
      } catch {
        // Fall through to runtime data so the page remains usable offline.
      }
    }

    const players = buildPlayers()
    const runtimeState = resolveRuntimeLedgerState()
    const runtimeIsJudge = Boolean(refreshedRuntime.isJudge)
    this.setData({
      ...buildLedgerStatePatch(runtimeState, runtimeIsJudge),
      isJudge: runtimeIsJudge,
      ledgerDirty: false,
      ledgerEditable: false,
      ledgerEventCount: 0,
      ledgerSubmitting: false,
      players,
      baselinePlayers: players.map((item) => ({ ...item })),
      sessionId: refreshedRuntime.sessionId || '',
      sessionName: refreshedRuntime.sessionName || '聚会账本',
      stats: buildStats(players),
    })
  },

  async handleAdjustTap(event) {
    if (!this.data.ledgerEditable) {
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
    const nextPlayers = this.data.players.map((item) => {
      if (item.id !== id) return item
      return {
        ...item,
        [field]: Math.max(0, item[field] + offset),
      }
    })

    this.setData({ ledgerDirty: true, players: nextPlayers, stats: buildStats(nextPlayers) })
  },

  async handleConfirmTap() {
    if (!this.data.ledgerEditable) {
      this.showPreviewToast('当前账号只能查看账本，请发起人调整')
      return
    }
    if (!this.data.ledgerDirty) {
      this.showPreviewToast('账本没有新的修改')
      return
    }
    this.setData({ ledgerSubmitting: true })
    const persisted = await this.persistPlayers(this.data.players)
    this.setData({ ledgerSubmitting: false })
    if (persisted) {
      this.setData({ ledgerDirty: false })
      await this.hydrateLedger()
      this.showPreviewToast('账本修改已确认')
    }
  },

  async persistPlayers(players) {
    const runtime = getSessionRuntime()
    const runtimePatch = {
      playerStats: toPlayerStats(players),
      selectedPlayers: players.map<SessionParticipant>((item) => ({
        avatarUrl: item.avatarUrl,
        name: item.name,
        profileId: item.profileId,
        status: '',
      })),
    }

    if (!runtime.sessionId) {
      setSessionRuntime(runtimePatch)
      return true
    }

    try {
      await updateManagedSession(runtime.sessionId, {
        hostAvatarUrl: runtime.currentUser?.avatarUrl,
        hostName: runtime.currentUser?.name,
        hostProfileId: runtime.currentUser?.id,
        playerCount: runtime.playerCount || players.length,
        selectedPlayers: players.map((item) => ({
          avatarUrl: item.avatarUrl,
          debtCount: item.debtCount,
          drinkCount: item.drinkCount,
          name: item.name,
          profileId: item.profileId,
          status: '',
        })),
        sessionName: runtime.sessionName,
        templateName: runtime.templateName,
      })
      const eventsSynced = await this.createLedgerEventsForDiff(this.data.baselinePlayers, players)
      if (!eventsSynced) {
        return false
      }
      setSessionRuntime(runtimePatch)
      return true
    } catch (error) {
      this.showPreviewToast(isForbiddenError(error) ? '当前账号无权调整账本，请使用发起人账号' : '账本暂未同步，请稍后重试')
      return false
    }
  },

  async createLedgerEventsForDiff(previousPlayers, nextPlayers) {
    const runtime = getSessionRuntime()
    const sessionId = runtime.sessionId || this.data.sessionId || ''
    if (!sessionId) {
      return true
    }

    const previousMap = new Map(previousPlayers.map((item) => [item.id, item]))
    const changes = nextPlayers.flatMap((player) => {
      const previous = previousMap.get(player.id)
      const debtDelta = (Number(player.debtCount) || 0) - (Number(previous?.debtCount) || 0)
      const drinkDelta = (Number(player.drinkCount) || 0) - (Number(previous?.drinkCount) || 0)
      return [
        { delta: debtDelta, eventType: 'drink_debt' as const, player },
        { delta: drinkDelta, eventType: 'drink_add' as const, player },
      ].filter((item) => item.delta !== 0)
    })

    if (!changes.length) {
      return true
    }

    try {
      await Promise.all(changes.map((change, index) =>
        createManagedSessionEvent(sessionId, {
          caption: change.eventType === 'drink_debt' ? '账本确认修改：欠酒变动' : '账本确认修改：加酒变动',
          clientEventId: `ledger-confirm-${change.player.id}-${change.eventType}-${Math.random().toString(36).slice(2, 10)}-${index}`,
          eventType: change.eventType,
          scoreDelta: change.delta,
          targetName: change.player.name,
          targetProfileId: change.player.profileId,
        }),
      ))
      return true
    } catch (error) {
      this.showPreviewToast(isForbiddenError(error) ? '当前账号无权写入账本动态，请使用发起人账号' : '账本动态暂未同步，请稍后重试')
      return false
    }
  },

  handleRecordTap() {
    if (this.data.sessionViewState === 'pendingFirstPhoto') {
      if (this.data.isJudge && this.data.sessionId) {
        this.openPage(`/pages/moment-editor/index?sessionId=${encodeURIComponent(this.data.sessionId)}&nodeType=opening`)
        return
      }
      wx.showToast({ title: '等发起人拍下第一张照片后再进入本局', icon: 'none' })
      return
    }
    if (this.data.sessionViewState === 'ended') {
      this.openPage('/pages/album/index?mode=ended')
      return
    }
    if (this.data.sessionViewState !== 'inProgress' || !this.data.sessionId) {
      wx.showToast({ title: '先创建或加入聚会', icon: 'none' })
      return
    }
    this.openPage(`/pages/live-record/index?sessionId=${encodeURIComponent(this.data.sessionId)}&role=${this.data.isJudge ? 'judge' : 'viewer'}`)
  },

  handleCreateTap() {
    this.openPage('/pages/create-session/index')
  },

  showPreviewToast(message) {
    wx.showToast({ title: message, icon: 'none' })
  },

  openPage(url) {
    wx.navigateTo({ url, fail: () => wx.redirectTo({ url }) })
  },
})

export {}
