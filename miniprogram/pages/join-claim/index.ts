import { getManagedLiveSession, joinManagedSession } from '../../services/operations'
import { getSessionRuntime, setSessionRuntime, type SessionParticipant } from '../../utils/session'
import { ensureUserAuthorized, getCurrentProfile } from '../../utils/social'

interface JoinClaimState {
  inviteCode: string
  joinedCount: number
  loading: boolean
  playerCount: number
  sessionId: string
  sessionName: string
}

interface JoinClaimMethods {
  handleJoinTap: () => Promise<void>
  loadSession: () => Promise<void>
}

Page<JoinClaimState, JoinClaimMethods>({
  data: {
    inviteCode: '',
    joinedCount: 0,
    loading: true,
    playerCount: 6,
    sessionId: '',
    sessionName: '今晚聚会不醉不归',
  },

  async onLoad(query) {
    const runtime = getSessionRuntime()
    const inviteCode = typeof query?.inviteCode === 'string' ? decodeURIComponent(query.inviteCode) : runtime.inviteCode || ''
    const sessionId = typeof query?.sessionId === 'string' ? decodeURIComponent(query.sessionId) : runtime.sessionId || ''
    const redirect = `/pages/join-claim/index?inviteCode=${encodeURIComponent(inviteCode)}${sessionId ? `&sessionId=${encodeURIComponent(sessionId)}` : ''}`
    const profile = await ensureUserAuthorized(redirect)
    if (!profile) {
      return
    }
    this.setData({
      inviteCode,
      sessionId,
    })
    await this.loadSession()
  },

  async loadSession() {
    const liveSession = await getManagedLiveSession(this.data.sessionId, this.data.inviteCode)
    this.setData({
      joinedCount: liveSession.joinedCount,
      loading: false,
      playerCount: liveSession.playerCount,
      sessionId: liveSession.id,
      sessionName: liveSession.sessionName,
    })
  },

  async handleJoinTap() {
    try {
      const [profile, liveSession] = await Promise.all([
        getCurrentProfile(),
        joinManagedSession(this.data.inviteCode),
      ])

      setSessionRuntime({
        currentUser: {
          id: profile.id,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
        },
        inviteCode: liveSession.inviteCode,
        isJudge: false,
        playerCount: liveSession.playerCount,
        playerStats: [],
        selectedPlayers: liveSession.joinStatusPlayers.map<SessionParticipant>((item) => ({
          avatarUrl: item.avatarUrl,
          name: item.name,
          profileId: item.profileId,
          status: item.status,
        })),
        sessionId: liveSession.id,
        sessionName: liveSession.sessionName,
        startedAt: 0,
        templateName: liveSession.templateName,
      })

      wx.redirectTo({
        url: `/pages/waiting-room/index?role=viewer&sessionId=${encodeURIComponent(liveSession.id)}`,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'join failed'
      const notPlayer = message.includes('not session player')
      await new Promise<void>((resolve) => {
        wx.showModal({
          title: notPlayer ? '您非本局玩家' : '加入失败',
          content: notPlayer ? '当前邀请链接不属于你的本局玩家名单，即将返回首页。' : '当前无法加入本局，即将返回首页。',
          showCancel: false,
          success: () => resolve(),
          fail: () => resolve(),
        })
      })
      wx.reLaunch({
        url: '/pages/index/index',
      })
    }
  },
})

export {}
