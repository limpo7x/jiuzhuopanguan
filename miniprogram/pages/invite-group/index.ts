import { getManagedLiveSession } from '../../services/operations'
import { getSessionRuntime, setSessionRuntime } from '../../utils/session'
import { ensureUserAuthorized } from '../../utils/social'

interface ShareItem {
  iconClass: string
  id: string
  name: string
}

interface InviteGroupState {
  inviteCode: string
  sessionId: string
  sessionName: string
  shareItems: ShareItem[]
}

interface InviteGroupMethods {
  handleCopyTap: () => void
  handleNextTap: () => void
  handlePreviewTap: () => void
  openPage: (url: string) => void
}

Page<InviteGroupState, InviteGroupMethods>({
  data: {
    inviteCode: '',
    sessionId: '',
    sessionName: '',
    shareItems: [
      { id: 'friend', name: '分享给好友', iconClass: 'invite-icon-wechat' },
      { id: 'group', name: '分享到群', iconClass: 'invite-icon-group' },
      { id: 'timeline', name: '更多分享', iconClass: 'invite-icon-more' },
    ],
  },

  async onLoad(query) {
    const runtime = getSessionRuntime()
    const sessionId = typeof query?.sessionId === 'string' ? decodeURIComponent(query.sessionId) : runtime.sessionId || ''
    const profile = await ensureUserAuthorized(`/pages/invite-group/index${sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : ''}`)
    if (!profile) return

    try {
      const liveSession = await getManagedLiveSession(sessionId, runtime.inviteCode)
      setSessionRuntime({
        inviteCode: liveSession.inviteCode,
        playerCount: liveSession.playerCount,
        selectedPlayers: liveSession.joinStatusPlayers,
        sessionId: liveSession.id,
        sessionName: liveSession.sessionName,
        templateName: liveSession.templateName,
      })
      this.setData({
        inviteCode: liveSession.inviteCode,
        sessionId: liveSession.id,
        sessionName: liveSession.sessionName,
      })
    } catch {
      this.setData({ inviteCode: runtime.inviteCode || '', sessionId, sessionName: runtime.sessionName || '' })
    }
  },

  onShareAppMessage() {
    return {
      title: `${this.data.sessionName} 邀请你入局`,
      path: `/pages/index/index?inviteCode=${encodeURIComponent(this.data.inviteCode)}&sessionId=${encodeURIComponent(this.data.sessionId)}`,
      imageUrl: '',
    }
  },

  handleCopyTap() {
    if (!this.data.inviteCode) {
      wx.showToast({ title: '邀请码未生成', icon: 'none' })
      return
    }
    wx.setClipboardData({ data: this.data.inviteCode })
  },

  handlePreviewTap() {
    this.openPage(`/pages/share-preview/index?sessionId=${encodeURIComponent(this.data.sessionId)}&inviteCode=${encodeURIComponent(this.data.inviteCode)}`)
  },

  handleNextTap() {
    this.openPage(`/pages/waiting-room/index?sessionId=${encodeURIComponent(this.data.sessionId)}`)
  },

  openPage(url) {
    wx.navigateTo({ url, fail: () => wx.redirectTo({ url }) })
  },
})

export {}

