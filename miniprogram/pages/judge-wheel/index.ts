import { avatarAsset } from '../../config/assets'
import { getSessionRuntime, resolveSessionParticipants } from '../../utils/session'

interface WheelHistory {
  active?: boolean
  text: string
}

interface WheelQuestion {
  labelStyle: string
  shortLabel: string
  text: string
}

interface JudgeWheelState {
  currentPlayerAvatar: string
  currentPlayerId: string
  currentPlayerName: string
  currentTask: string
  currentDebtCount: number
  currentClearedCount: number
  history: WheelHistory[]
  hasSpun: boolean
  isSpinning: boolean
  maxClearPerPlayer: number
  rotationDeg: number
  rotationDuration: number
  wheelQuestions: WheelQuestion[]
}

interface JudgeWheelMethods {
  handleAcceptTap: () => void
  handleSpinTap: () => void
  syncWheelResult: (winnerIndex: number) => void
  showPreviewToast: (message: string) => void
}

const JUDGE_WHEEL_RESULT_KEY = 'judge-wheel-result'
const MAX_CLEAR_PER_PLAYER = 3

const QUESTION_SOURCE = [
  { shortLabel: '真心话', text: '说出最近一次想赖酒但没赖成的原因。' },
  { shortLabel: '模仿局', text: '模仿酒桌上最会劝酒的人 10 秒。' },
  { shortLabel: '回忆杀', text: '讲一件学生时代最尴尬的社交场面。' },
  { shortLabel: '快问答', text: '10 秒内说出 3 个不能带上酒桌的秘密。' },
  { shortLabel: '才艺卡', text: '站起来表演一个最拿手但最离谱的才艺。' },
  { shortLabel: '指令牌', text: '给左手边的人设计一句专属敬酒台词。' },
] as const

const buildWheelQuestions = (): WheelQuestion[] =>
  QUESTION_SOURCE.map((question, index) => {
    const angle = index * 60

    return {
      ...question,
      labelStyle: `transform: translate(-50%, -50%) rotate(${angle}deg) translateY(-96px) rotate(${-angle}deg);`,
    }
  })

const getDefaultPlayer = () => {
  const runtime = getSessionRuntime()
  const player = resolveSessionParticipants(runtime)[0]

  return {
    avatarUrl: player?.avatarUrl || avatarAsset(1),
    id: player?.profileId || 'player-1',
    name: player?.name || '当前玩家',
  }
}

let spinTimer = 0

Page<JudgeWheelState, JudgeWheelMethods>({
  data: {
    currentPlayerAvatar: getDefaultPlayer().avatarUrl,
    currentPlayerId: getDefaultPlayer().id,
    currentPlayerName: getDefaultPlayer().name,
    currentTask: QUESTION_SOURCE[0].text,
    currentDebtCount: 0,
    currentClearedCount: 0,
    hasSpun: false,
    isSpinning: false,
    maxClearPerPlayer: MAX_CLEAR_PER_PLAYER,
    rotationDeg: 0,
    rotationDuration: 0,
    wheelQuestions: buildWheelQuestions(),
    history: [
      { text: '已使用 · 真心话' },
      { text: '已使用 · 快问答' },
      { text: '本轮待抽题', active: true },
    ],
  },

  onLoad(query) {
    const defaults = getDefaultPlayer()
    const playerId = query?.playerId ? decodeURIComponent(query.playerId) : defaults.id
    const playerName = query?.playerName ? decodeURIComponent(query.playerName) : defaults.name
    const avatarUrl = query?.avatarUrl ? decodeURIComponent(query.avatarUrl) : defaults.avatarUrl
    const debt = Number(query?.debt || this.data.currentDebtCount)
    const cleared = Number(query?.cleared || this.data.currentClearedCount)

    this.setData({
      currentPlayerAvatar: avatarUrl,
      currentPlayerId: playerId,
      currentPlayerName: playerName,
      currentDebtCount: Number.isFinite(debt) ? debt : this.data.currentDebtCount,
      currentClearedCount: Number.isFinite(cleared) ? cleared : this.data.currentClearedCount,
    })
  },

  onUnload() {
    if (spinTimer) {
      clearTimeout(spinTimer)
      spinTimer = 0
    }
  },

  handleSpinTap() {
    if (this.data.isSpinning) {
      return
    }

    if (this.data.currentDebtCount <= 0) {
      this.showPreviewToast(`${this.data.currentPlayerName} 当前没有欠酒可消除`)
      return
    }

    if (this.data.currentClearedCount >= this.data.maxClearPerPlayer) {
      this.showPreviewToast(`${this.data.currentPlayerName} 本局已消满 3 杯`)
      return
    }

    const winnerIndex = Math.floor(Math.random() * this.data.wheelQuestions.length)
    const winnerAngle = winnerIndex * 60
    const nextRotation = this.data.rotationDeg + 360 * 5 - winnerAngle

    this.setData({
      hasSpun: false,
      isSpinning: true,
      rotationDuration: 3600,
      rotationDeg: nextRotation,
    })

    if (typeof wx.vibrateShort === 'function') {
      wx.vibrateShort({
        type: 'light',
      })
    }

    if (spinTimer) {
      clearTimeout(spinTimer)
    }

    spinTimer = setTimeout(() => {
      this.syncWheelResult(winnerIndex)
      spinTimer = 0
    }, 3650) as unknown as number
  },

  syncWheelResult(winnerIndex) {
    const winner = this.data.wheelQuestions[winnerIndex]
    const history = this.data.history.map((item, index) =>
      index === this.data.history.length - 1
        ? {
            ...item,
            text: `本轮命中 · ${winner.shortLabel}`,
            active: true,
          }
        : {
            ...item,
            active: false,
          },
    )

    this.setData({
      currentTask: winner.text,
      hasSpun: true,
      history,
      isSpinning: false,
      rotationDuration: 0,
      rotationDeg: this.data.rotationDeg % 360,
    })
  },

  handleAcceptTap() {
    if (this.data.isSpinning) {
      return
    }

    if (!this.data.hasSpun) {
      this.showPreviewToast('先转动转盘，再执行消杯')
      return
    }

    if (this.data.currentDebtCount <= 0) {
      this.showPreviewToast('当前没有欠酒可消除')
      return
    }

    if (this.data.currentClearedCount >= this.data.maxClearPerPlayer) {
      this.showPreviewToast('本局消杯次数已达上限')
      return
    }

    wx.setStorageSync(JUDGE_WHEEL_RESULT_KEY, {
      playerId: this.data.currentPlayerId,
      question: this.data.currentTask,
    })

    wx.navigateBack({
      fail: () => {
        wx.redirectTo({
          url: '/pages/live-record/index',
        })
      },
    })
  },

  showPreviewToast(message) {
    wx.showToast({
      title: message,
      icon: 'none',
    })
  },
})

export {}
