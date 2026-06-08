import { formatElapsed, getSessionRuntime, type SessionParticipant } from '../../utils/session'

interface LivePlayer {
  avatarUrl: string
  name: string
}

interface LiveRecordItem {
  avatarUrl: string
  clearedCount: number
  debtCount: number
  drinkCount: number
  id: string
  meta: string
  name: string
}

interface LiveEvent {
  text: string
}

interface LiveRecordState {
  elapsedText: string
  events: LiveEvent[]
  isJudge: boolean
  players: LivePlayer[]
  records: LiveRecordItem[]
  sessionName: string
}

interface LiveRecordMethods {
  applyWheelResult: () => void
  handleAdjustTap: (event: WechatMiniprogram.BaseEvent) => void
  handleNextRoundTap: () => void
  handleTimerTick: () => void
  openPage: (url: string) => void
  handleSaveTap: () => void
  handleWheelTap: (event: WechatMiniprogram.BaseEvent) => void
  showPreviewToast: (message: string) => void
}

const JUDGE_WHEEL_RESULT_KEY = 'judge-wheel-result'
const MAX_CLEAR_PER_PLAYER = 3
let liveTimer = 0
const DEFAULT_PLAYERS: SessionParticipant[] = [
  { name: '阿浩', avatarUrl: '/assets/avatars/avatar-1.png' },
  { name: '小熊', avatarUrl: '/assets/avatars/avatar-2.png' },
  { name: 'Mika', avatarUrl: '/assets/avatars/avatar-3.png' },
  { name: '可可', avatarUrl: '/assets/avatars/avatar-4.png' },
  { name: '阿乐', avatarUrl: '/assets/avatars/avatar-1.png' },
  { name: 'Nina', avatarUrl: '/assets/avatars/avatar-2.png' },
]

Page<LiveRecordState, LiveRecordMethods>({
  data: {
    elapsedText: '00:00:00',
    players: [
      { name: '阿浩', avatarUrl: '/assets/avatars/avatar-1.png' },
      { name: '小熊', avatarUrl: '/assets/avatars/avatar-2.png' },
      { name: 'Mika', avatarUrl: '/assets/avatars/avatar-3.png' },
      { name: '可可', avatarUrl: '/assets/avatars/avatar-4.png' },
      { name: '阿乐', avatarUrl: '/assets/avatars/avatar-1.png' },
    ],
    isJudge: true,
    records: [
      { id: 'ahao', name: '阿浩', avatarUrl: '/assets/avatars/avatar-1.png', meta: '真心话大胆抢了', debtCount: 2, drinkCount: 1, clearedCount: 1 },
      { id: 'xiaoxiong', name: '小熊', avatarUrl: '/assets/avatars/avatar-2.png', meta: '对朋友了几口，认真~', debtCount: 1, drinkCount: 2, clearedCount: 0 },
      { id: 'mika', name: 'Mika', avatarUrl: '/assets/avatars/avatar-3.png', meta: '话题继续加码', debtCount: 1, drinkCount: 1, clearedCount: 2 },
    ],
    sessionName: '今晚聚会不醉不归',
    events: [
      { text: '可可 表演了“海草舞”' },
      { text: '阿乐 唱《孤勇者》跑调' },
    ],
  },

  onLoad(query) {
    const runtime = getSessionRuntime()
    const isJudge = query?.role === 'viewer' ? false : runtime.isJudge
    const sessionName = query?.sessionName ? decodeURIComponent(query.sessionName) : runtime.sessionName
    const selectedPlayers = runtime.selectedPlayers?.length ? runtime.selectedPlayers : DEFAULT_PLAYERS.slice(0, runtime.playerCount)
    const players = selectedPlayers.slice(0, runtime.playerCount)
    const records = players.map((item, index) => ({
      id: `player-${index + 1}`,
      name: item.name,
      avatarUrl: item.avatarUrl,
      meta: index % 2 === 0 ? '真心话大胆抢了' : '对朋友了几口，认真~',
      debtCount: index === 0 ? 2 : index === 1 ? 1 : 0,
      drinkCount: index <= 1 ? index + 1 : 0,
      clearedCount: index === 2 ? 1 : 0,
    }))

    this.setData({
      isJudge,
      players,
      records,
      sessionName,
    })

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
      }
    })

    const changed = records.find((item) => item.id === result.playerId)
    const events = changed
      ? [
          {
            text: `${changed.name} 完成消杯题：“${result.question || '本轮挑战'}”`,
          },
          ...this.data.events,
        ].slice(0, 4)
      : this.data.events

    wx.removeStorageSync(JUDGE_WHEEL_RESULT_KEY)

    this.setData({
      records,
      events,
    })
  },

  handleAdjustTap(event) {
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

    this.setData({ records })
  },

  handleSaveTap() {
    this.openPage('/pages/table-mode/index')
  },

  handleWheelTap(event) {
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
      this.showPreviewToast(`${target.name} 本局已消除满 3 杯`)
      return
    }

    this.openPage(
      `/pages/judge-wheel/index?playerId=${encodeURIComponent(target.id)}&playerName=${encodeURIComponent(target.name)}&avatarUrl=${encodeURIComponent(target.avatarUrl)}&debt=${target.debtCount}&cleared=${target.clearedCount}`,
    )
  },

  handleNextRoundTap() {
    this.openPage('/pages/judge-wheel/index')
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
