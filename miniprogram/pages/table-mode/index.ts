import { avatarAsset } from '../../config/assets'
import {
  formatElapsed,
  getSessionRuntime,
  setSessionReport,
  setSessionRuntime,
  type SessionParticipant,
  type SessionPlayerReaction,
  type SessionRuntime,
} from '../../utils/session'

interface ScoreRow {
  avatarUrl: string
  cleared: number
  canReact: boolean
  debt: number
  drink: number
  likeCount: number
  likedByMe: boolean
  name: string
  total: number
  weakCount: number
  weakedByMe: boolean
}

interface TableModeState {
  elapsedText: string
  isJudge: boolean
  rows: ScoreRow[]
  sessionName: string
}

interface TableModeMethods {
  handleBackTap: () => void
  handleFinishTap: () => void
  handleReactionTap: (event: WechatMiniprogram.BaseEvent) => void
  handleTimerTick: () => void
  openPage: (url: string) => void
}

let tableTimer = 0
const DEFAULT_TABLE_PLAYERS: SessionParticipant[] = [
  { name: '阿浩', avatarUrl: avatarAsset(1) },
  { name: '小熊', avatarUrl: avatarAsset(2) },
  { name: 'Mika', avatarUrl: avatarAsset(3) },
  { name: '可可', avatarUrl: avatarAsset(4) },
  { name: '阿乐', avatarUrl: avatarAsset(1) },
  { name: 'Nina', avatarUrl: avatarAsset(2) },
]

const getRowBaseStats = (index: number) => {
  const debt = index === 0 ? 2 : index === 1 ? 1 : 0
  const drink = index <= 1 ? index + 1 : 0
  const cleared = index === 2 ? 1 : 0

  return {
    cleared,
    debt,
    drink,
    total: debt + drink,
  }
}

const buildRows = (runtime: SessionRuntime): ScoreRow[] => {
  const selectedPlayers = runtime.selectedPlayers?.length
    ? runtime.selectedPlayers
    : DEFAULT_TABLE_PLAYERS.slice(0, runtime.playerCount)
  const voterName = runtime.currentUser?.name || ''

  return selectedPlayers.slice(0, runtime.playerCount).map((item, index) => {
    const reaction = runtime.playerReactions.find((record) => record.playerName === item.name)
    const stats = getRowBaseStats(index)

    return {
      avatarUrl: item.avatarUrl,
      canReact: !runtime.isJudge && !!voterName && voterName !== item.name,
      likeCount: reaction?.likeVoters.length || 0,
      likedByMe: voterName ? reaction?.likeVoters.includes(voterName) || false : false,
      name: item.name,
      weakCount: reaction?.weakVoters.length || 0,
      weakedByMe: voterName ? reaction?.weakVoters.includes(voterName) || false : false,
      ...stats,
    }
  })
}

const updatePlayerReactions = (
  source: SessionPlayerReaction[],
  playerName: string,
  voterName: string,
  mode: 'like' | 'weak'
): SessionPlayerReaction[] => {
  const existing = source.find((item) => item.playerName === playerName)
  const list = source
    .filter((item) => item.playerName !== playerName)
    .concat(
      existing || {
        playerName,
        likeVoters: [],
        weakVoters: [],
      }
    )

  return list.map((item) => {
    if (item.playerName !== playerName) {
      return item
    }

    const hasLike = item.likeVoters.includes(voterName)
    const hasWeak = item.weakVoters.includes(voterName)
    let likeVoters = item.likeVoters.filter((name) => name !== voterName)
    let weakVoters = item.weakVoters.filter((name) => name !== voterName)

    if (mode === 'like' && !hasLike) {
      likeVoters = likeVoters.concat(voterName)
    }

    if (mode === 'weak' && !hasWeak) {
      weakVoters = weakVoters.concat(voterName)
    }

    return {
      playerName: item.playerName,
      likeVoters,
      weakVoters,
    }
  })
}

Page<TableModeState, TableModeMethods>({
  data: {
    elapsedText: '00:00:00',
    isJudge: true,
    rows: [
      {
        name: '阿浩',
        avatarUrl: avatarAsset(1),
        debt: 2,
        drink: 1,
        cleared: 1,
        total: 3,
        canReact: false,
        likeCount: 0,
        likedByMe: false,
        weakCount: 0,
        weakedByMe: false,
      },
    ],
    sessionName: '今晚聚会不醉不归',
  },

  onLoad() {
    const runtime = getSessionRuntime()

    this.setData({
      isJudge: runtime.isJudge,
      rows: buildRows(runtime),
      sessionName: runtime.sessionName,
    })

    this.handleTimerTick()
  },

  onShow() {
    if (tableTimer) {
      clearInterval(tableTimer)
    }

    tableTimer = setInterval(() => {
      this.handleTimerTick()
    }, 1000) as unknown as number
  },

  onHide() {
    if (tableTimer) {
      clearInterval(tableTimer)
      tableTimer = 0
    }
  },

  onUnload() {
    if (tableTimer) {
      clearInterval(tableTimer)
      tableTimer = 0
    }
  },

  handleTimerTick() {
    const runtime = getSessionRuntime()

    this.setData({
      elapsedText: formatElapsed(runtime.startedAt),
    })
  },

  handleBackTap() {
    wx.navigateBack({
      fail: () => {
        this.openPage('/pages/live-record/index')
      },
    })
  },

  handleReactionTap(event) {
    const { mode, playerName } = event.currentTarget.dataset as {
      mode: 'like' | 'weak'
      playerName: string
    }
    const runtime = getSessionRuntime()
    const voterName = runtime.currentUser?.name || ''

    if (runtime.isJudge || !voterName || voterName === playerName) {
      return
    }

    const playerReactions = updatePlayerReactions(runtime.playerReactions, playerName, voterName, mode)
    const nextRuntime = setSessionRuntime({
      playerReactions,
    })

    this.setData({
      rows: buildRows(nextRuntime),
    })
  },

  handleFinishTap() {
    const rowsByDebt = [...this.data.rows].sort((a, b) => b.debt - a.debt)
    const rowsByDrink = [...this.data.rows].sort((a, b) => b.drink - a.drink)
    const rowsByCleared = [...this.data.rows].sort((a, b) => b.cleared - a.cleared)
    const rowsByLikes = [...this.data.rows].sort((a, b) => b.likeCount - a.likeCount)
    const rowsByWeak = [...this.data.rows].sort((a, b) => b.weakCount - a.weakCount)
    const topLikeRow = rowsByLikes[0]?.likeCount ? rowsByLikes[0] : null
    const topWeakRow = rowsByWeak[0]?.weakCount ? rowsByWeak[0] : null

    setSessionReport({
      sessionName: this.data.sessionName,
      playerCount: this.data.rows.length,
      finishedAt: Date.now(),
      ranks: [
        {
          title: '欠酒大王',
          name: rowsByDebt[0]?.name || '暂无',
          avatarUrl: rowsByDebt[0]?.avatarUrl || avatarAsset(1),
          value: `欠了 ${rowsByDebt[0]?.debt || 0} 杯`,
        },
        {
          title: '干杯王',
          name: rowsByDrink[0]?.name || '暂无',
          avatarUrl: rowsByDrink[0]?.avatarUrl || avatarAsset(2),
          value: `已喝 ${rowsByDrink[0]?.drink || 0} 杯`,
        },
        {
          title: '消杯王',
          name: rowsByCleared[0]?.name || '暂无',
          avatarUrl: rowsByCleared[0]?.avatarUrl || avatarAsset(3),
          value: `消了 ${rowsByCleared[0]?.cleared || 0} 杯`,
        },
        {
          title: '最被敬畏的人',
          name: topLikeRow?.name || '暂无',
          avatarUrl: topLikeRow?.avatarUrl || avatarAsset(4),
          value: topLikeRow ? `收到了 ${topLikeRow.likeCount} 个点赞` : '本局还没人被点赞',
        },
        {
          title: '公认最弱',
          name: topWeakRow?.name || '暂无',
          avatarUrl: topWeakRow?.avatarUrl || avatarAsset(1),
          value: topWeakRow ? `收到了 ${topWeakRow.weakCount} 个小拇指` : '本局还没人被点小拇指',
        },
      ],
      events: [
        { text: '本局已由判官确认结束，已自动生成战报。' },
        { text: `${this.data.sessionName} 共 ${this.data.rows.length} 位玩家参与。` },
        { text: topLikeRow ? `${topLikeRow.name} 成为“最被敬畏的人”。` : '本局还没有产生“最被敬畏的人”。' },
        { text: topWeakRow ? `${topWeakRow.name} 被评为“公认最弱”。` : '本局还没有产生“公认最弱”。' },
        { text: '可继续分享战报或基于当前模板再开一局。' },
      ],
    })

    setSessionRuntime({
      currentUser: null,
      playerReactions: [],
      startedAt: 0,
    })

    wx.redirectTo({
      url: '/pages/result-report/index',
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
