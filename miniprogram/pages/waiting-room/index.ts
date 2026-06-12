import { getManagedLiveSession, updateManagedSession } from '../../services/operations'
import { getSessionRuntime, setSessionRuntime, type SessionParticipant } from '../../utils/session'
import { confirmAndExitSession } from '../../utils/session-exit'
import { ensureUserAuthorized } from '../../utils/social'

interface JoinedPlayer {
  avatarUrl: string
  name: string
  profileId?: string
  status?: string
}

interface WaitingRoomState {
  emptySeats: number[]
  inviteCode: string
  isJudge: boolean
  joinedCount: number
  joinedPlayers: JoinedPlayer[]
  loading: boolean
  playerCount: number
  sessionId: string
  sessionName: string
}

interface WaitingRoomMethods {
  handleBackTap: () => Promise<void>
  handleCodeTap: () => void
  handleInviteTap: () => void
  handleOverviewTap: () => void
  handleRefreshTap: () => Promise<void>
  handleStartTap: () => Promise<void>
  openPage: (url: string) => void
  refreshSession: (showToast?: boolean) => Promise<void>
}

const mergeRuntimeAvatars = (players: JoinedPlayer[], runtime = getSessionRuntime()) => {
  const avatarMap = new Map<string, string>()
  if (runtime.currentUser?.id && runtime.currentUser.avatarUrl) {
    avatarMap.set(runtime.currentUser.id, runtime.currentUser.avatarUrl)
  }
  ;(runtime.selectedPlayers || []).forEach((item) => {
    if (item.profileId && item.avatarUrl) avatarMap.set(item.profileId, item.avatarUrl)
  })
  return players.map((item) => ({ ...item, avatarUrl: item.avatarUrl || (item.profileId ? avatarMap.get(item.profileId) || '' : '') }))
}

Page<WaitingRoomState, WaitingRoomMethods>({
  data: {
    emptySeats: [1, 2],
    inviteCode: '',
    isJudge: true,
    joinedCount: 0,
    joinedPlayers: [],
    loading: true,
    playerCount: 0,
    sessionId: '',
    sessionName: '',
  },

  async onLoad(query) {
    const runtime = getSessionRuntime()
    const isJudge = query?.role === 'viewer' ? false : runtime.isJudge
    const sessionId = typeof query?.sessionId === 'string' ? decodeURIComponent(query.sessionId) : runtime.sessionId || ''
    const profile = await ensureUserAuthorized(
      `/pages/waiting-room/index?role=${encodeURIComponent(isJudge ? 'judge' : 'viewer')}${sessionId ? `&sessionId=${encodeURIComponent(sessionId)}` : ''}`,
    )
    if (!profile) {
      return
    }

    this.setData({
      isJudge,
      sessionId,
    })

    try {
      await this.refreshSession()
    } catch (error) {
      this.setData({ loading: false })
      wx.showToast({
        title: error instanceof Error ? error.message : '酒局加载失败',
        icon: 'none',
      })
    }
  },

  async onShow() {
    if (!this.data.sessionId && !getSessionRuntime().sessionId) {
      return
    }

    try {
      await this.refreshSession()
    } catch (error) {
      this.setData({ loading: false })
      wx.showToast({
        title: error instanceof Error ? error.message : '酒局加载失败',
        icon: 'none',
      })
    }
  },

  async refreshSession(showToast = false) {
    const runtime = getSessionRuntime()
    const sessionId = this.data.sessionId || runtime.sessionId || ''
    const liveSession = await getManagedLiveSession(sessionId, runtime.inviteCode)
    const joinedPlayers = mergeRuntimeAvatars(liveSession.joinedPlayers.slice(0, liveSession.playerCount), runtime)
    const emptySeats = Array.from({ length: Math.max(liveSession.playerCount - joinedPlayers.length, 0) }, (_, index) => index + 1)

    this.setData({
      emptySeats,
      inviteCode: liveSession.inviteCode,
      joinedCount: liveSession.joinedCount,
      joinedPlayers,
      loading: false,
      playerCount: liveSession.playerCount,
      sessionId: liveSession.id,
      sessionName: liveSession.sessionName,
    })

    setSessionRuntime({
      inviteCode: liveSession.inviteCode,
      playerCount: liveSession.playerCount,
      selectedPlayers: mergeRuntimeAvatars(liveSession.joinStatusPlayers, runtime).map<SessionParticipant>((item) => ({
        avatarUrl: item.avatarUrl,
        name: item.name,
        profileId: item.profileId,
        status: item.status,
      })),
      sessionId: liveSession.id,
      sessionName: liveSession.sessionName,
      templateImageUrl: liveSession.templateImageUrl || runtime.templateImageUrl || '',
      templateName: liveSession.templateName,
    })

    if (showToast) {
      wx.showToast({
        title: '已刷新最新成员',
        icon: 'success',
      })
    }
  },

  async handleInviteTap() {
    if (!this.data.isJudge || this.data.joinedCount >= this.data.playerCount) {
      return
    }
    this.openPage(`/pages/invite-group/index?sessionId=${encodeURIComponent(this.data.sessionId)}`)
  },

  handleCodeTap() {
    this.openPage(`/pages/share-preview/index?sessionId=${encodeURIComponent(this.data.sessionId)}`)
  },

  handleOverviewTap() {
    this.openPage('/pages/flow-overview/index')
  },

  async handleBackTap() {
    await confirmAndExitSession()
  },

  async handleRefreshTap() {
    try {
      await this.refreshSession(true)
    } catch (error) {
      wx.showToast({
        title: error instanceof Error ? error.message : '刷新失败',
        icon: 'none',
      })
    }
  },

  async handleStartTap() {
    if (this.data.joinedCount < this.data.playerCount) {
      const confirmed = await new Promise<boolean>((resolve) => {
        wx.showModal({
          title: '人数未满',
          content: `当前仅 ${this.data.joinedCount}/${this.data.playerCount} 人加入，是否直接进入本局？`,
          confirmText: '直接进入',
          cancelText: '继续等待',
          success: (result) => resolve(Boolean(result.confirm)),
          fail: () => resolve(false),
        })
      })

      if (!confirmed) {
        return
      }
    }

    try {
      wx.showLoading({
        title: '正在开局',
        mask: true,
      })

      if (this.data.sessionId) {
        await updateManagedSession(this.data.sessionId, {
          state: '进行中',
          status: '',
        })
      }

      const runtime = setSessionRuntime({
        isJudge: this.data.isJudge,
        startedAt: getSessionRuntime().startedAt || Date.now(),
      })

      this.openPage(`/pages/live-record/index?role=${this.data.isJudge ? 'judge' : 'viewer'}&sessionName=${encodeURIComponent(runtime.sessionName)}`)
    } catch (error) {
      wx.showToast({
        title: error instanceof Error ? error.message : '开局失败',
        icon: 'none',
      })
    } finally {
      wx.hideLoading()
    }
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
