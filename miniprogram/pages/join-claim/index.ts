import { getManagedLiveSession, joinManagedSession } from '../../services/operations'
import { getSessionRuntime, setSessionRuntime, type SessionParticipant } from '../../utils/session'
import { ensureUserAuthorized, getCurrentDisplayProfile } from '../../utils/social'

interface JoinClaimState {
  inviteCode: string
  joinedCount: number
  loading: boolean
  playerCount: number
  sessionId: string
  sessionName: string
}

interface InviteInputDetail {
  value?: string
}

interface JoinClaimMethods {
  handleInviteInput: (event: WechatMiniprogram.CustomEvent<InviteInputDetail>) => void
  handleJoinTap: () => Promise<void>
  handleLoadByCodeTap: () => Promise<void>
  loadSession: () => Promise<void>
}

const normalizeInviteCode = (value?: string) => String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)

Page<JoinClaimState, JoinClaimMethods>({
  data: {
    inviteCode: '',
    joinedCount: 0,
    loading: false,
    playerCount: 6,
    sessionId: '',
    sessionName: '输入口令加入酒局',
  },

  async onLoad(query) {
    const runtime = getSessionRuntime()
    const inviteCode = normalizeInviteCode(typeof query?.inviteCode === 'string' ? decodeURIComponent(query.inviteCode) : runtime.inviteCode || '')
    const sessionId = typeof query?.sessionId === 'string' ? decodeURIComponent(query.sessionId) : runtime.sessionId || ''
    const redirect = `/pages/join-claim/index?inviteCode=${encodeURIComponent(inviteCode)}${sessionId ? `&sessionId=${encodeURIComponent(sessionId)}` : ''}`
    const profile = await ensureUserAuthorized(redirect)
    if (!profile) return

    this.setData({ inviteCode, sessionId })
    if (inviteCode || sessionId) {
      await this.loadSession()
    }
  },

  handleInviteInput(event) {
    this.setData({ inviteCode: normalizeInviteCode(event.detail?.value) })
  },

  async handleLoadByCodeTap() {
    if (!this.data.inviteCode) {
      wx.showToast({ title: '请输入酒桌口令', icon: 'none' })
      return
    }
    await this.loadSession()
  },

  async loadSession() {
    if (!this.data.inviteCode && !this.data.sessionId) {
      this.setData({ loading: false })
      return
    }

    this.setData({ loading: true })
    try {
      const liveSession = await getManagedLiveSession(this.data.sessionId, this.data.inviteCode)
      this.setData({
        inviteCode: liveSession.inviteCode,
        joinedCount: liveSession.joinedCount,
        loading: false,
        playerCount: liveSession.playerCount,
        sessionId: liveSession.id,
        sessionName: liveSession.sessionName,
      })
    } catch (error) {
      this.setData({ loading: false })
      wx.showToast({ title: error instanceof Error ? error.message : '未找到该酒局', icon: 'none' })
    }
  },

  async handleJoinTap() {
    if (!this.data.inviteCode) {
      wx.showToast({ title: '请输入酒桌口令', icon: 'none' })
      return
    }

    try {
      this.setData({ loading: true })
      const [profile, liveSession] = await Promise.all([getCurrentDisplayProfile(), joinManagedSession(this.data.inviteCode)])
      setSessionRuntime({
        currentUser: { id: profile.id, name: profile.name, avatarUrl: profile.avatarUrl },
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
      wx.redirectTo({ url: `/pages/waiting-room/index?role=viewer&sessionId=${encodeURIComponent(liveSession.id)}` })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'join failed'
      const notPlayer = message.includes('not session player')
      await new Promise<void>((resolve) => {
        wx.showModal({
          title: notPlayer ? '您非本局玩家' : '加入失败',
          content: notPlayer ? '当前口令对应的酒局名单中没有你的账号，请联系判官确认是否已添加你。' : '当前无法加入本局，请检查口令是否正确。',
          showCancel: false,
          success: () => resolve(),
          fail: () => resolve(),
        })
      })
    } finally {
      this.setData({ loading: false })
    }
  },
})

export {}
