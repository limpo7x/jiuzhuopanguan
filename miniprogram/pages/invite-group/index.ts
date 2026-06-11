import { getSessionRuntime } from '../../utils/session'
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
    inviteCode: 'AB7K9Q',
    sessionId: '',
    sessionName: '今晚聚会不醉不归',
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
    this.setData({ inviteCode: runtime.inviteCode || 'AB7K9Q', sessionId, sessionName: runtime.sessionName || '今晚聚会不醉不归' })
  },

  onShareAppMessage() {
    return {
      title: `${this.data.sessionName} 邀请你入局`,
      path: `/pages/join-claim/index?inviteCode=${encodeURIComponent(this.data.inviteCode)}&sessionId=${encodeURIComponent(this.data.sessionId)}`,
      imageUrl: '',
    }
  },

  handleCopyTap() {
    wx.setClipboardData({ data: this.data.inviteCode })
  },

  handlePreviewTap() {
    this.openPage(`/pages/share-preview/index?sessionId=${encodeURIComponent(this.data.sessionId)}`)
  },

  handleNextTap() {
    this.openPage(`/pages/waiting-room/index?sessionId=${encodeURIComponent(this.data.sessionId)}`)
  },

  openPage(url) {
    wx.navigateTo({ url, fail: () => wx.redirectTo({ url }) })
  },
})

export {}
