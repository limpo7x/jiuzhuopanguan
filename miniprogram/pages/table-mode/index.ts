import { createManagedReport, getManagedLiveSession } from '../../services/operations'
import {
  formatElapsed,
  getSessionRuntime,
  resolveSessionParticipants,
  setSessionRuntime,
  type SessionPlayerReaction,
  type SessionPlayerStat,
  type SessionRuntime,
} from '../../utils/session'

interface ScoreRow {
  avatarUrl: string
  canReact: boolean
  cleared: number
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
  exitGuardHandling: boolean
  exitGuardVisible: boolean
  isJudge: boolean
  rows: ScoreRow[]
  sessionName: string
}

interface TableModeMethods {
  handleBackTap: () => Promise<void>
  handleExitGuardLeave: () => Promise<void>
  handleFinishTap: () => Promise<void>
  handleRefreshTap: () => Promise<void>
  handleReactionTap: (event: WechatMiniprogram.BaseEvent) => void
  showPreviewToast: (message: string) => void
  handleTimerTick: () => void
  navigateBackToSession: () => void
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
    exitGuardHandling: false,
    exitGuardVisible: true,
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

  async handleBackTap() {
    this.navigateBackToSession()
  },

  async handleExitGuardLeave() {
    this.navigateBackToSession()
  },

  async handleRefreshTap() {
    if (this.data.isJudge) {
      return
    }

    const runtime = getSessionRuntime()
    if (!runtime.sessionId) {
      this.showPreviewToast('未找到当前局信息')
      return
    }

    wx.showLoading({
      title: '刷新中',
      mask: true,
    })

    try {
      const liveSession = await getManagedLiveSession(runtime.sessionId, runtime.inviteCode)
      const updatedRuntime = setSessionRuntime({
        isJudge: this.data.isJudge,
        playerCount: liveSession.playerCount,
        playerStats: liveSession.joinStatusPlayers
          .slice(0, liveSession.playerCount)
          .map((item) => ({
            avatarUrl: item.avatarUrl,
            clearedCount: item.clearedCount || 0,
            debtCount: item.debtCount || 0,
            drinkCount: item.drinkCount || 0,
            meta: item.meta || '',
            name: item.name,
            profileId: item.profileId,
          })),
        selectedPlayers: liveSession.joinStatusPlayers.map((item) => ({
          avatarUrl: item.avatarUrl,
          name: item.name,
          profileId: item.profileId || '',
          status: item.status || '已加入',
        })),
        sessionId: liveSession.id,
        sessionName: liveSession.sessionName,
      })

      this.setData({
        rows: buildRows(updatedRuntime),
        sessionName: liveSession.sessionName,
      })
      this.showPreviewToast('刷新成功')
    } catch (error) {
      this.showPreviewToast(error instanceof Error ? error.message : '刷新失败')
    } finally {
      wx.hideLoading()
    }
  },

  navigateBackToSession() {
    const runtime = getSessionRuntime()
    const fallbackUrl = `/pages/live-record/index?role=${runtime.isJudge ? 'judge' : 'viewer'}&sessionName=${encodeURIComponent(runtime.sessionName || '')}`
    wx.navigateBack({
      fail: () => {
        wx.redirectTo({
          url: fallbackUrl,
          fail: () => {
            wx.reLaunch({ url: fallbackUrl })
          },
        })
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

  async handleFinishTap() {
    const runtime = getSessionRuntime()
    const rowsByDebt = [...this.data.rows].sort((a, b) => b.debt - a.debt)
    const rowsByDrink = [...this.data.rows].sort((a, b) => b.drink - a.drink)
    const rowsByCleared = [...this.data.rows].sort((a, b) => b.cleared - a.cleared)
    const rowsByLikes = [...this.data.rows].sort((a, b) => b.likeCount - a.likeCount)
    const rowsByWeak = [...this.data.rows].sort((a, b) => b.weakCount - a.weakCount)
    const topLikeRow = rowsByLikes[0]?.likeCount ? rowsByLikes[0] : null
    const topWeakRow = rowsByWeak[0]?.weakCount ? rowsByWeak[0] : null
    const ranks = [
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
    ]
    const events = buildReportEvents(this.data.sessionName, this.data.rows)

    try {
      wx.showLoading({
        title: '生成战报中',
        mask: true,
      })

      const report = await createManagedReport({
        sessionId: runtime.sessionId || '',
        sessionName: this.data.sessionName,
        templateName: runtime.templateName || '',
        playerCount: this.data.rows.length,
        status: '',
        sessionState: '已结束',
        sessionStatus: '',
        ranks,
        events,
      })

      setSessionRuntime({
        playerReactions: [],
        reportId: report.id,
        sessionId: report.sessionId || runtime.sessionId || '',
        sessionName: report.sessionName || this.data.sessionName,
        startedAt: 0,
        templateName: report.templateName || runtime.templateName || '',
      })

      wx.redirectTo({
        url: `/pages/result-report/index?reportId=${encodeURIComponent(report.id)}`,
      })
    } catch (error) {
      wx.showToast({
        title: error instanceof Error ? error.message : '战报生成失败',
        icon: 'none',
      })
    } finally {
      wx.hideLoading()
    }
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
