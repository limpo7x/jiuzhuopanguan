import { getManagedLiveSession } from '../../services/operations'
import { getSessionRuntime } from '../../utils/session'
import { trackAnalyticsEvent } from '../../services/analytics'

interface SharePreviewItem {
  iconClass: string
  id: string
  name: string
}

interface SharePreviewState {
  avatars: string[]
  inviteCode: string
  joinedCount: number
  joinStatusPlayers: Array<{ avatarUrl: string; name: string; status: string }>
  playerCount: number
  sessionId: string
  sessionName: string
  shareItems: SharePreviewItem[]
  showJoinStatus: boolean
}

interface SharePreviewMethods {
  handleSaveTap: () => Promise<void>
  handleTabTap: (event: WechatMiniprogram.BaseEvent) => void
  loadSession: () => Promise<void>
  showPreviewToast: (message: string) => void
}

const downloadFile = (url: string) =>
  new Promise<string>((resolve, reject) => {
    wx.downloadFile({
      url,
      success: (result) => {
        if (result.statusCode >= 200 && result.statusCode < 300 && result.tempFilePath) {
          resolve(result.tempFilePath)
          return
        }
        reject(new Error('download failed'))
      },
      fail: reject,
    })
  })

const saveImage = (filePath: string) =>
  new Promise<void>((resolve, reject) => {
    wx.saveImageToPhotosAlbum({
      filePath,
      success: () => resolve(),
      fail: reject,
    })
  })

Page<SharePreviewState, SharePreviewMethods>({
  data: {
    avatars: [],
    inviteCode: 'AB7K9Q',
    joinedCount: 0,
    joinStatusPlayers: [],
    playerCount: 6,
    sessionId: '',
    sessionName: '今晚聚会不醉不归',
    shareItems: [
      { id: 'friend', name: '分享给好友', iconClass: 'share-icon-wechat' },
      { id: 'group', name: '分享到群', iconClass: 'share-icon-group' },
      { id: 'more', name: '更多', iconClass: 'share-icon-more' },
    ],
    showJoinStatus: false,
  },

  async onLoad(query) {
    const runtime = getSessionRuntime()
    const sessionId = typeof query?.sessionId === 'string' ? decodeURIComponent(query.sessionId) : runtime.sessionId || ''
    this.setData({
      inviteCode: runtime.inviteCode || 'AB7K9Q',
      sessionId,
    })
    trackAnalyticsEvent({
      type: 'share_asset_exposure',
      assetId: 'share-2',
      meta: {
        sessionId,
        scene: 'invite-preview',
      },
    })
    await this.loadSession()
  },

  async onShow() {
    if (!this.data.sessionId && !getSessionRuntime().sessionId) {
      return
    }
    await this.loadSession()
  },

  onShareAppMessage() {
    trackAnalyticsEvent({
      type: 'share_asset_open',
      assetId: 'share-2',
      meta: {
        sessionId: this.data.sessionId,
        channel: 'share-preview',
      },
    })
    return {
      title: `${this.data.sessionName} 邀你入局`,
      path: `/pages/join-claim/index?inviteCode=${encodeURIComponent(this.data.inviteCode)}&sessionId=${encodeURIComponent(this.data.sessionId)}`,
      imageUrl: 'https://api.pomer.cn/static/party-hero.png',
    }
  },

  async loadSession() {
    const runtime = getSessionRuntime()
    const liveSession = await getManagedLiveSession(this.data.sessionId || runtime.sessionId, this.data.inviteCode || runtime.inviteCode)
    this.setData({
      avatars: liveSession.joinedPlayers.map((item) => item.avatarUrl).slice(0, liveSession.playerCount),
      inviteCode: liveSession.inviteCode,
      joinedCount: liveSession.joinedCount,
      joinStatusPlayers: liveSession.joinStatusPlayers,
      playerCount: liveSession.playerCount,
      sessionId: liveSession.id,
      sessionName: liveSession.sessionName,
    })
  },

  handleTabTap(event) {
    const { tab } = event.currentTarget.dataset as { tab: 'preview' | 'status' }

    this.setData({
      showJoinStatus: tab === 'status',
    })
  },

  async handleSaveTap() {
    try {
      const tempFilePath = await downloadFile('https://api.pomer.cn/static/party-hero.png')
      await saveImage(tempFilePath)
      this.showPreviewToast('邀请卡已保存到相册')
    } catch {
      this.showPreviewToast('保存失败，请检查相册权限')
    }
  },

  showPreviewToast(message) {
    wx.showToast({
      title: message,
      icon: 'none',
    })
  },
})

export {}
