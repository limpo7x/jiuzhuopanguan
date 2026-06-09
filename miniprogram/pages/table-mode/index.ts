import {
  formatElapsed,
  getSessionRuntime,
  resolveSessionParticipants,
  setSessionReport,
  setSessionRuntime,
  type SessionPlayerReaction,
  type SessionPlayerStat,
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

const buildBaseStats = (runtime: SessionRuntime): SessionPlayerStat[] => {
  const statMap = new Map(runtime.playerStats.map((item) => [item.profileId || item.name, item]))

  return resolveSessionParticipants(runtime)
    .slice(0, runtime.playerCount)
    .map((item) => {
      const stat = statMap.get(item.profileId || item.name)
      return {
        avatarUrl: item.avatarUrl,
        clearedCount: stat?.clearedCount || 0,
        debtCount: stat?.debtCount || 0,
        drinkCount: stat?.drinkCount || 0,
        meta: stat?.meta || item.status || '',
        name: item.name,
        profileId: item.profileId,
      }
    })
}

const buildRows = (runtime: SessionRuntime): ScoreRow[] => {
  const baseStats = buildBaseStats(runtime)
  const voterName = runtime.currentUser?.name || ''

  return baseStats.map((item) => {
    const reaction = runtime.playerReactions.find((record) => record.playerName === item.name)

    return {
      avatarUrl: item.avatarUrl,
      canReact: !runtime.isJudge && !!voterName && voterName !== item.name,
      cleared: item.clearedCount,
      debt: item.debtCount,
      drink: item.drinkCount,
      likeCount: reaction?.likeVoters.length || 0,
      likedByMe: voterName ? reaction?.likeVoters.includes(voterName) || false : false,
      name: item.name,
      total: item.debtCount + item.drinkCount,
      weakCount: reaction?.weakVoters.length || 0,
      weakedByMe: voterName ? reaction?.weakVoters.includes(voterName) || false : false,
    }
  })
}

const updatePlayerReactions = (
  source: SessionPlayerReaction[],
  playerName: string,
  voterName: string,
  mode: 'like' | 'weak',
): SessionPlayerReaction[] => {
  const existing = source.find((item) => item.playerName === playerName)
  const list = source
    .filter((item) => item.playerName !== playerName)
    .concat(
      existing || {
        playerName,
        likeVoters: [],
        weakVoters: [],
      },
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

const buildReportEvents = (sessionName: string, rows: ScoreRow[]): Array<{ text: string }> => {
  const rowsByDebt = [...rows].sort((a, b) => b.debt - a.debt)
  const rowsByDrink = [...rows].sort((a, b) => b.drink - a.drink)
  const rowsByCleared = [...rows].sort((a, b) => b.cleared - a.cleared)
  const rowsByLikes = [...rows].sort((a, b) => b.likeCount - a.likeCount)
  const rowsByWeak = [...rows].sort((a, b) => b.weakCount - a.weakCount)

  return [
    { text: `${sessionName} 共 ${rows.length} 位玩家参与。` },
    { text: rowsByDebt[0] ? `${rowsByDebt[0].name} 欠酒 ${rowsByDebt[0].debt} 杯，为本局最高。` : '本局暂无欠酒记录。' },
    { text: rowsByDrink[0] ? `${rowsByDrink[0].name} 已喝 ${rowsByDrink[0].drink} 杯。` : '本局暂无饮酒记录。' },
    { text: rowsByCleared[0] ? `${rowsByCleared[0].name} 完成消杯 ${rowsByCleared[0].cleared} 次。` : '本局暂无消杯记录。' },
    {
      text:
        rowsByLikes[0]?.likeCount > 0
          ? `${rowsByLikes[0].name} 获得 ${rowsByLikes[0].likeCount} 次点赞。`
          : rowsByWeak[0]?.weakCount > 0
            ? `${rowsByWeak[0].name} 被点了 ${rowsByWeak[0].weakCount} 次小拇指。`
            : '本局还没有玩家互评记录。',
    },
  ]
}

Page<TableModeState, TableModeMethods>({
  data: {
    elapsedText: '00:00:00',
    isJudge: true,
    rows: [],
    sessionName: '酒桌判官酒局',
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
          avatarUrl: rowsByDebt[0]?.avatarUrl || '',
          value: `欠了 ${rowsByDebt[0]?.debt || 0} 杯`,
        },
        {
          title: '干杯王',
          name: rowsByDrink[0]?.name || '暂无',
          avatarUrl: rowsByDrink[0]?.avatarUrl || '',
          value: `已喝 ${rowsByDrink[0]?.drink || 0} 杯`,
        },
        {
          title: '消杯王',
          name: rowsByCleared[0]?.name || '暂无',
          avatarUrl: rowsByCleared[0]?.avatarUrl || '',
          value: `消了 ${rowsByCleared[0]?.cleared || 0} 杯`,
        },
        {
          title: '最受欢迎',
          name: topLikeRow?.name || '暂无',
          avatarUrl: topLikeRow?.avatarUrl || '',
          value: topLikeRow ? `收到了 ${topLikeRow.likeCount} 次点赞` : '本局暂无点赞记录',
        },
        {
          title: '全场记忆点',
          name: topWeakRow?.name || '暂无',
          avatarUrl: topWeakRow?.avatarUrl || '',
          value: topWeakRow ? `被点了 ${topWeakRow.weakCount} 次小拇指` : '本局暂无互评记录',
        },
      ],
      events: buildReportEvents(this.data.sessionName, this.data.rows),
    })

    setSessionRuntime({
      currentUser: null,
      playerReactions: [],
      playerStats: [],
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
