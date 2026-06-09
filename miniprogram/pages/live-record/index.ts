import {
  formatElapsed,
  getSessionRuntime,
  resolveSessionParticipants,
  setSessionRuntime,
  type SessionParticipant,
  type SessionPlayerStat,
} from '../../utils/session'
import { updateManagedSession } from '../../services/operations'
import { confirmAndExitSession } from '../../utils/session-exit'

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

interface LiveRecordState {
  elapsedText: string
  events: LiveEvent[]
  isJudge: boolean
  playerCount: number
  players: LivePlayer[]
  records: LiveRecordItem[]
  sessionName: string
}

interface LiveRecordMethods {
  applyWheelResult: () => void
  handleAddPlayerTap: () => void
  handleAdjustTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handleBackTap: () => Promise<void>
  handleNextRoundTap: () => void
  handleTimerTick: () => void
  openPage: (url: string) => void
  handleSaveTap: () => Promise<void>
  handleWheelTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  persistRecordsToManagedSession: (records: LiveRecordItem[]) => Promise<boolean>
  showPreviewToast: (message: string) => void
  syncRecordsToRuntime: (records: LiveRecordItem[]) => void
}

const JUDGE_WHEEL_RESULT_KEY = 'judge-wheel-result'
const MAX_CLEAR_PER_PLAYER = 3
let liveTimer = 0

const buildPlayers = (runtime = getSessionRuntime()): LivePlayer[] =>
  resolveSessionParticipants(runtime)
    .slice(0, runtime.playerCount)
    .map((item) => ({
      avatarUrl: item.avatarUrl,
      name: item.name,
      profileId: item.profileId,
    }))

const buildRecordId = (player: LivePlayer, index: number) => player.profileId || `player-${index + 1}`

const buildDefaultMeta = (player: SessionParticipant | LivePlayer) =>
  ('status' in player && player.status) || '等待本局记录'

const buildRecords = (players: LivePlayer[], runtime = getSessionRuntime()): LiveRecordItem[] => {
  const statMap = new Map(runtime.playerStats.map((item) => [item.profileId || item.name, item]))

  return players.map((player, index) => {
    const id = buildRecordId(player, index)
    const stat = statMap.get(player.profileId || player.name)

    return {
      avatarUrl: player.avatarUrl,
      clearedCount: stat?.clearedCount || 0,
      debtCount: stat?.debtCount || 0,
      drinkCount: stat?.drinkCount || 0,
      id,
      meta: stat?.meta || buildDefaultMeta(player),
      name: player.name,
      profileId: player.profileId,
    }
  })
}

const buildInitialEvents = (sessionName: string, players: LivePlayer[]): LiveEvent[] => {
  if (!players.length) {
    return [{ text: `${sessionName} 已创建，等待玩家加入。` }]
  }

  return [{ text: `${sessionName} 当前已有 ${players.length} 位玩家入局，等待判官开始记录。` }]
}

const toPlayerStats = (records: LiveRecordItem[]): SessionPlayerStat[] =>
  records.map((item) => ({
    avatarUrl: item.avatarUrl,
    clearedCount: item.clearedCount,
    debtCount: item.debtCount,
    drinkCount: item.drinkCount,
    meta: item.meta,
    name: item.name,
    profileId: item.profileId,
  }))

Page<LiveRecordState, LiveRecordMethods>({
  data: {
    elapsedText: '00:00:00',
    playerCount: 6,
    players: [],
    isJudge: true,
    records: [],
    sessionName: '酒桌判官酒局',
    events: [],
  },

  onLoad(query) {
    const runtime = getSessionRuntime()
    const isJudge = query?.role === 'viewer' ? false : runtime.isJudge
    const sessionName = query?.sessionName ? decodeURIComponent(query.sessionName) : runtime.sessionName
    const players = buildPlayers(runtime)
    const records = buildRecords(players, runtime)

    this.setData({
      isJudge,
      playerCount: runtime.playerCount,
      players,
      records,
      sessionName,
      events: buildInitialEvents(sessionName, players),
    })

    this.syncRecordsToRuntime(records)
    this.handleTimerTick()
  },

  onShow() {
    this.applyWheelResult()

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
  },

  handleTimerTick() {
    const runtime = getSessionRuntime()

    this.setData({
      elapsedText: formatElapsed(runtime.startedAt),
    })
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
        avatarUrl: item.avatarUrl,
        clearedCount: record?.clearedCount || 0,
        debtCount: record?.debtCount || 0,
        drinkCount: record?.drinkCount || 0,
        meta: record?.meta || item.status || '',
        name: item.name,
        profileId: item.profileId,
        status: item.status || '待加入',
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
      this.showPreviewToast(error instanceof Error ? error.message : '酒局记录保存失败')
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
      ? [{ text: `${changed.name} 完成了消杯任务：${result.question || '本轮挑战'}` }, ...this.data.events].slice(0, 4)
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

    const prevRecords = this.data.records
    this.syncRecordsToRuntime(records)
    this.setData({ records })
    const persisted = await this.persistRecordsToManagedSession(records)
    if (!persisted) {
      this.syncRecordsToRuntime(prevRecords)
      this.setData({ records: prevRecords })
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

  async handleSaveTap() {
    this.syncRecordsToRuntime(this.data.records)
    if (!(await this.persistRecordsToManagedSession(this.data.records))) {
      return
    }
    this.openPage('/pages/table-mode/index')
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
      this.showPreviewToast(`${target.name} 当前没有欠酒可消除`)
      return
    }

    if (target.clearedCount >= MAX_CLEAR_PER_PLAYER) {
      this.showPreviewToast(`${target.name} 本局已消满 3 杯`)
      return
    }

    if (!(await this.persistRecordsToManagedSession(this.data.records))) {
      return
    }

    this.openPage(
      `/pages/judge-wheel/index?playerId=${encodeURIComponent(target.id)}&playerName=${encodeURIComponent(target.name)}&avatarUrl=${encodeURIComponent(target.avatarUrl)}&debt=${target.debtCount}&cleared=${target.clearedCount}&sessionId=${encodeURIComponent(getSessionRuntime().sessionId || '')}`,
    )
  },

  handleNextRoundTap() {
    this.openPage('/pages/judge-wheel/index')
  },

  async handleBackTap() {
    await confirmAndExitSession()
  },

  showPreviewToast(message) {
    wx.showToast({
      title: message,
      icon: 'none',
    })
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
