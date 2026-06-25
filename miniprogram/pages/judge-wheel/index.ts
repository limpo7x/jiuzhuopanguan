import {
  getManagedLiveSession,
  getManagedQuestionBank,
  updateManagedSession,
  type ManagedQuestionItem,
  type ManagedSessionPlayer,
  type ManagedWheelHistoryItem,
} from '../../services/operations'
import { getSessionRuntime, resolveSessionParticipants } from '../../utils/session'
import { confirmLeaveSessionPage, disableSessionLeaveAlert, enableSessionLeaveAlert } from '../../utils/session-exit'

type QuestionType = '互动' | '惩罚' | '问答'

interface WheelTypeTab {
  active?: boolean
  disabled?: boolean
  label: QuestionType
}

interface WheelHistory {
  active?: boolean
  text: string
}

interface WheelQuestion {
  id: string
  labelStyle: string
  shortLabel: string
  tag: string
  text: string
  type: QuestionType
}

interface WheelPlayer extends ManagedSessionPlayer {
  memberKey: string
}

interface JudgeWheelState {
  currentDebtCount: number
  currentPlayerAvatar: string
  currentPlayerId: string
  currentPlayerName: string
  currentTask: string
  currentTaskLabel: string
  currentTaskType: string
  currentTaskTag: string
  currentClearedCount: number
  hasSpun: boolean
  history: WheelHistory[]
  isSpinning: boolean
  maxClearPerPlayer: number
  questionCountText: string
  rotationDeg: number
  rotationDuration: number
  sessionId: string
  typeTabs: WheelTypeTab[]
  wheelBackground: string
  wheelQuestions: WheelQuestion[]
}

interface JudgeWheelMethods {
  applyQuestionType: (type: QuestionType) => void
  handleAcceptTap: () => Promise<void>
  handleBackTap: () => Promise<void>
  handleSpinTap: () => void
  handleTypeTap: (event: WechatMiniprogram.BaseEvent) => void
  showPreviewToast: (message: string) => void
  syncWheelResult: (winnerIndex: number) => void
}

const JUDGE_WHEEL_RESULT_KEY = 'judge-wheel-result'
const MAX_CLEAR_PER_PLAYER = 3
const QUESTION_TYPES: QuestionType[] = ['互动', '惩罚', '问答']
const WHEEL_COLORS = ['#ffe39b', '#ffbf6f', '#ff8c64', '#ffd277', '#ffb47d', '#ffc952']

let spinTimer = 0
let cachedQuestionBank: ManagedQuestionItem[] = []
let cachedSessionPlayers: WheelPlayer[] = []

const toQuestionType = (value?: string): QuestionType | '' => {
  const normalized = String(value || '').trim()
  return QUESTION_TYPES.includes(normalized as QuestionType) ? (normalized as QuestionType) : ''
}

const toMemberKey = (profileId?: string, index = 0) => String(profileId || '').trim() || `player-${index + 1}`

const pickDefaultPlayer = () => {
  const runtime = getSessionRuntime()
  const player = resolveSessionParticipants(runtime)[0]

  return {
    avatarUrl: player?.avatarUrl || '',
    id: player?.profileId || 'player-1',
    name: player?.name || '当前成员',
  }
}

const buildWheelBackground = (count: number) => {
  if (!count) {
    return 'radial-gradient(circle at 50% 45%, #fff8e8 0%, #ffddb8 56%, #ff8a54 100%)'
  }

  const step = 100 / count
  const segments = Array.from({ length: count }, (_, index) => {
    const start = Number((index * step).toFixed(3))
    const end = Number(((index + 1) * step).toFixed(3))
    return `${WHEEL_COLORS[index % WHEEL_COLORS.length]} ${start}% ${end}%`
  }).join(', ')

  return `conic-gradient(from -90deg, ${segments})`
}

const buildTypeTabs = (questions: ManagedQuestionItem[], activeType: QuestionType): WheelTypeTab[] =>
  QUESTION_TYPES.map((label) => ({
    active: label === activeType,
    disabled: !questions.some((item) => item.type === label),
    label,
  }))

const buildWheelQuestions = (questions: ManagedQuestionItem[], activeType: QuestionType): WheelQuestion[] => {
  const filtered = questions.filter((item) => item.type === activeType).slice(0, 8)
  const total = filtered.length

  return filtered.map((question, index) => {
    const angleDeg = (360 / total) * index - 90
    const radians = ((angleDeg + 360 / total / 2) * Math.PI) / 180
    const left = 50 + Math.cos(radians) * 34
    const top = 50 + Math.sin(radians) * 34
    const shortLabel = (question.template || question.text || activeType).replace(/\s+/g, '').slice(0, 6) || activeType

    return {
      id: question.id,
      labelStyle: `left:${left.toFixed(3)}%; top:${top.toFixed(3)}%; transform: translate(-50%, -50%);`,
      shortLabel,
      tag: question.tag || activeType,
      text: question.text,
      type: activeType,
    }
  })
}

const buildHistory = (
  playerName: string,
  debtCount: number,
  clearedCount: number,
  wheelHistory: ManagedWheelHistoryItem[] = [],
): WheelHistory[] => {
  const notes: WheelHistory[] = [
    { text: `${playerName} 当前还欠 ${debtCount} 杯，本轮最多可再消 ${Math.max(0, MAX_CLEAR_PER_PLAYER - clearedCount)} 杯。`, active: true },
    { text: `本局已完成 ${clearedCount} / ${MAX_CLEAR_PER_PLAYER} 次消杯。` },
  ]

  wheelHistory.slice(0, 2).forEach((item, index) => {
    notes.push({
      text: `${index === 0 ? '上次命中' : '更早命中'} · ${item.type || '转盘'} / ${item.label || '任务'} / ${item.text}`,
    })
  })

  return notes.filter((item) => item.text)
}

const buildFallbackPlayers = () => {
  const runtime = getSessionRuntime()
  const participants = resolveSessionParticipants(runtime)
  const statMap = new Map(runtime.playerStats.map((item) => [item.profileId || item.name, item]))

  return participants.map<WheelPlayer>((item, index) => {
    const stat = statMap.get(item.profileId || item.name)
    return {
      avatarUrl: item.avatarUrl || '',
      clearedCount: stat?.clearedCount || 0,
      debtCount: stat?.debtCount || 0,
      drinkCount: stat?.drinkCount || 0,
      memberKey: toMemberKey(item.profileId, index),
      meta: stat?.meta || item.status || '',
      name: item.name,
      profileId: item.profileId,
      status: item.status || '',
      wheelHistory: [],
    }
  })
}

Page<JudgeWheelState, JudgeWheelMethods>({
  data: {
    currentDebtCount: 0,
    currentPlayerAvatar: pickDefaultPlayer().avatarUrl,
    currentPlayerId: pickDefaultPlayer().id,
    currentPlayerName: pickDefaultPlayer().name,
    currentTask: '',
    currentTaskLabel: '',
    currentTaskTag: '',
    currentTaskType: '惩罚',
    currentClearedCount: 0,
    hasSpun: false,
    history: [],
    isSpinning: false,
    maxClearPerPlayer: MAX_CLEAR_PER_PLAYER,
    questionCountText: '后台题库加载中',
    rotationDeg: 0,
    rotationDuration: 0,
    sessionId: '',
    typeTabs: buildTypeTabs([], '惩罚'),
    wheelBackground: buildWheelBackground(0),
    wheelQuestions: [],
  },

  async onLoad(query) {
    enableSessionLeaveAlert()
    const defaults = pickDefaultPlayer()
    const runtime = getSessionRuntime()
    const sessionId = query?.sessionId ? decodeURIComponent(query.sessionId) : runtime.sessionId || ''
    const seededTask = query?.task ? decodeURIComponent(query.task) : ''
    const playerId = query?.playerId ? decodeURIComponent(query.playerId) : defaults.id
    const playerName = query?.playerName ? decodeURIComponent(query.playerName) : defaults.name
    const avatarUrl = query?.avatarUrl ? decodeURIComponent(query.avatarUrl) : defaults.avatarUrl
    const debt = Number(query?.debt || this.data.currentDebtCount)
    const cleared = Number(query?.cleared || this.data.currentClearedCount)

    cachedQuestionBank = []
    cachedSessionPlayers = []

    try {
      const [questions, liveSession] = await Promise.all([
        getManagedQuestionBank(),
        sessionId ? getManagedLiveSession(sessionId, runtime.inviteCode).catch(() => null) : Promise.resolve(null),
      ])

      cachedQuestionBank = questions
      cachedSessionPlayers = liveSession
        ? liveSession.joinStatusPlayers.map((item, index) => ({
            ...item,
            memberKey: toMemberKey(item.profileId, index),
          }))
        : buildFallbackPlayers()

      const player =
        cachedSessionPlayers.find((item) => item.memberKey === playerId || item.profileId === playerId) ||
        cachedSessionPlayers.find((item) => item.name === playerName) ||
        null
      const activeType = toQuestionType(query?.type) || toQuestionType(questions[0]?.type) || '惩罚'
      const nextDebtCount = player ? Number(player.debtCount) || 0 : Number.isFinite(debt) ? debt : 0
      const nextClearedCount = player ? Number(player.clearedCount) || 0 : Number.isFinite(cleared) ? cleared : 0

      this.setData({
        currentDebtCount: nextDebtCount,
        currentPlayerAvatar: player?.avatarUrl || avatarUrl,
        currentPlayerId: player?.memberKey || playerId,
        currentPlayerName: player?.name || playerName,
        currentClearedCount: nextClearedCount,
        history: buildHistory(player?.name || playerName, nextDebtCount, nextClearedCount, player?.wheelHistory || []),
        sessionId,
      })

      this.applyQuestionType(activeType)
      if (seededTask) {
        const matchedQuestion = cachedQuestionBank.find((item) => item.text === seededTask)
        if (matchedQuestion) {
          this.setData({
            currentTask: matchedQuestion.text,
            currentTaskLabel: (matchedQuestion.template || matchedQuestion.text || activeType).replace(/\s+/g, '').slice(0, 6) || activeType,
            currentTaskTag: matchedQuestion.tag || '',
            currentTaskType: matchedQuestion.type || activeType,
          })
        }
      }
    } catch (error) {
      cachedQuestionBank = []
      cachedSessionPlayers = buildFallbackPlayers()
      this.setData({
        currentDebtCount: Number.isFinite(debt) ? debt : 0,
        currentPlayerAvatar: avatarUrl,
        currentPlayerId: playerId,
        currentPlayerName: playerName,
        currentClearedCount: Number.isFinite(cleared) ? cleared : 0,
        history: [],
        questionCountText: error instanceof Error ? error.message : '后台题库加载失败',
        sessionId,
        typeTabs: buildTypeTabs([], '惩罚'),
        wheelBackground: buildWheelBackground(0),
        wheelQuestions: [],
      })
      wx.showToast({
        title: error instanceof Error ? error.message : '转盘加载失败',
        icon: 'none',
      })
    }
  },

  onShow() {
    enableSessionLeaveAlert()
  },

  onUnload() {
    if (spinTimer) {
      clearTimeout(spinTimer)
      spinTimer = 0
    }
    disableSessionLeaveAlert()
  },

  applyQuestionType(type) {
    const wheelQuestions = buildWheelQuestions(cachedQuestionBank, type)
    const firstQuestion = wheelQuestions[0]

    this.setData({
      currentTask: firstQuestion?.text || '后台当前没有这个类型的上线题目，请先去题库页上架。',
      currentTaskLabel: firstQuestion?.shortLabel || '',
      currentTaskTag: firstQuestion?.tag || '',
      currentTaskType: type,
      hasSpun: false,
      questionCountText: wheelQuestions.length ? `已接后台 ${wheelQuestions.length} 条 ${type} 题目` : `后台暂无上线中的${type}题目`,
      typeTabs: buildTypeTabs(cachedQuestionBank, type),
      wheelBackground: buildWheelBackground(wheelQuestions.length),
      wheelQuestions,
    })
  },

  handleTypeTap(event) {
    const { type } = event.currentTarget.dataset as { type: QuestionType }
    const targetType = toQuestionType(type)

    if (!targetType) {
      return
    }

    const disabled = this.data.typeTabs.find((item) => item.label === targetType)?.disabled
    if (disabled || this.data.isSpinning) {
      return
    }

    this.applyQuestionType(targetType)
  },

  handleSpinTap() {
    if (this.data.isSpinning) {
      return
    }

    if (!this.data.wheelQuestions.length) {
      this.showPreviewToast(`后台还没有可用的${this.data.currentTaskType}题目`)
      return
    }

    if (this.data.currentDebtCount <= 0) {
      this.showPreviewToast(`${this.data.currentPlayerName} 当前没有欠酒可消除`)
      return
    }

    if (this.data.currentClearedCount >= this.data.maxClearPerPlayer) {
      this.showPreviewToast(`${this.data.currentPlayerName} 本局已消满 ${this.data.maxClearPerPlayer} 杯`)
      return
    }

    const winnerIndex = Math.floor(Math.random() * this.data.wheelQuestions.length)
    const segmentAngle = 360 / this.data.wheelQuestions.length
    const winnerAngle = winnerIndex * segmentAngle + segmentAngle / 2
    const nextRotation = this.data.rotationDeg + 360 * 6 - winnerAngle

    this.setData({
      hasSpun: false,
      isSpinning: true,
      rotationDuration: 4200,
      rotationDeg: nextRotation,
    })

    if (typeof wx.vibrateShort === 'function') {
      wx.vibrateShort({
        type: 'heavy',
      })
    }

    if (spinTimer) {
      clearTimeout(spinTimer)
    }

    spinTimer = setTimeout(() => {
      this.syncWheelResult(winnerIndex)
      spinTimer = 0
    }, 4250) as unknown as number
  },

  syncWheelResult(winnerIndex) {
    const winner = this.data.wheelQuestions[winnerIndex]
    if (!winner) {
      return
    }

    this.setData({
      currentTask: winner.text,
      currentTaskLabel: winner.shortLabel,
      currentTaskTag: winner.tag,
      currentTaskType: winner.type,
      hasSpun: true,
      isSpinning: false,
      rotationDuration: 0,
      rotationDeg: this.data.rotationDeg % 360,
    })
  },

  async handleAcceptTap() {
    if (this.data.isSpinning) {
      return
    }

    if (!this.data.hasSpun) {
      this.showPreviewToast('先转动转盘，再执行消杯')
      return
    }

    if (!this.data.wheelQuestions.length) {
      this.showPreviewToast('后台没有可用题目，无法消杯')
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

    const runtime = getSessionRuntime()
    const sessionId = this.data.sessionId || runtime.sessionId || ''
    if (!sessionId) {
      this.showPreviewToast('当前聚会缺少同步信息，无法保存结果')
      return
    }

    const historyItem: ManagedWheelHistoryItem = {
      createdAt: new Date().toISOString(),
      label: this.data.currentTaskLabel || this.data.currentTaskType,
      text: this.data.currentTask,
      type: this.data.currentTaskType,
    }
    const playersSource = cachedSessionPlayers.length ? cachedSessionPlayers : buildFallbackPlayers()
    const nextPlayers = playersSource.map((item) =>
      item.memberKey === this.data.currentPlayerId
        ? {
            ...item,
            clearedCount: Math.min(this.data.maxClearPerPlayer, (Number(item.clearedCount) || this.data.currentClearedCount) + 1),
            debtCount: Math.max(0, (Number(item.debtCount) || this.data.currentDebtCount) - 1),
            meta: this.data.currentTask,
            wheelHistory: [historyItem, ...(item.wheelHistory || [])].slice(0, 6),
          }
        : item,
    )

    try {
      wx.showLoading({
        title: '正在保存',
        mask: true,
      })

      await updateManagedSession(sessionId, {
        hostAvatarUrl: runtime.currentUser?.avatarUrl,
        hostName: runtime.currentUser?.name,
        hostProfileId: runtime.currentUser?.id,
        playerCount: runtime.playerCount,
        selectedPlayers: nextPlayers.map(({ memberKey, ...item }) => item),
        sessionName: runtime.sessionName,
        templateName: runtime.templateName,
      })

      cachedSessionPlayers = nextPlayers
      wx.setStorageSync(JUDGE_WHEEL_RESULT_KEY, {
        playerId: this.data.currentPlayerId,
        question: this.data.currentTask,
      })

      const returnUrl = `/pages/live-record/index?role=${runtime.isJudge ? 'judge' : 'viewer'}&sessionId=${encodeURIComponent(sessionId)}`
      disableSessionLeaveAlert()
      wx.navigateBack({
        fail: () => {
          wx.redirectTo({
            url: returnUrl,
          })
        },
      })
    } catch (error) {
      this.showPreviewToast(error instanceof Error ? error.message : '消杯结果保存失败')
    } finally {
      wx.hideLoading()
    }
  },

  async handleBackTap() {
    const runtime = getSessionRuntime()
    await confirmLeaveSessionPage({
      cancelText: '继续转盘',
      confirmText: '返回记录',
      content: '返回记录页继续当前聚会，当前转盘结果不会自动保存。',
      redirectUrl: `/pages/live-record/index?role=${runtime.isJudge ? 'judge' : 'viewer'}&sessionId=${encodeURIComponent(runtime.sessionId || this.data.sessionId || '')}`,
      title: '返回记录页',
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
