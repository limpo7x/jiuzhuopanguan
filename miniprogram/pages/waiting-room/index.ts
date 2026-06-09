import { getManagedLiveSession, updateManagedSession } from '../../services/operations'
import { getSessionRuntime, setSessionRuntime, type SessionParticipant } from '../../utils/session'
import { ensureUserAuthorized } from '../../utils/social'

interface JoinedPlayer {
  avatarUrl: string
  name: string
  profileId?: string
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
  handleCodeTap: () => void
  handleInviteTap: () => void
  handleOverviewTap: () => void
  handleRefreshTap: () => Promise<void>
  handleStartTap: () => Promise<void>
  openPage: (url: string) => void
  refreshSession: (showToast?: boolean) => Promise<void>
}

Page<WaitingRoomState, WaitingRoomMethods>({
  data: {
    emptySeats: [1, 2],
    inviteCode: '',
    isJudge: true,
    joinedCount: 0,
    joinedPlayers: [],
    loading: true,
    playerCount: 6,
    sessionId: '',
    sessionName: '今晚聚会不醉不归',
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
    await this.refreshSession()
  },

  async onShow() {
    if (!this.data.sessionId && !getSessionRuntime().sessionId) {
      return
    }
    await this.refreshSession()
  },

  async refreshSession(showToast = false) {
    const runtime = getSessionRuntime()
    const sessionId = this.data.sessionId || runtime.sessionId || ''
    const liveSession = await getManagedLiveSession(sessionId, runtime.inviteCode)
    const joinedPlayers = liveSession.joinedPlayers.slice(0, liveSession.playerCount)
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
      city: liveSession.city || runtime.city || '',
      inviteCode: liveSession.inviteCode,
      district: liveSession.district || runtime.district || '',
      playerCount: liveSession.playerCount,
      latitude: liveSession.latitude ?? runtime.latitude ?? null,
      locationLabel: liveSession.location || runtime.locationLabel || '',
      longitude: liveSession.longitude ?? runtime.longitude ?? null,
      province: liveSession.province || runtime.province || '',
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

  async handleRefreshTap() {
    await this.refreshSession(true)
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

    if (this.data.sessionId) {
      await updateManagedSession(this.data.sessionId, {
        state: '进行中',
        status: '正常',
      }).catch(() => null)
    }

    const runtime = setSessionRuntime({
      isJudge: this.data.isJudge,
      startedAt: getSessionRuntime().startedAt || Date.now(),
    })

    this.openPage(`/pages/live-record/index?role=${this.data.isJudge ? 'judge' : 'viewer'}&sessionName=${encodeURIComponent(runtime.sessionName)}`)
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
