import { trackAnalyticsEvent } from '../../services/analytics'
import { getManagedLiveSession, getManagedShareConfig } from '../../services/operations'
import { getSessionRuntime, setSessionRuntime } from '../../utils/session'

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
  previewImageUrl: string
  previewTitle: string
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
    inviteCode: '',
    joinedCount: 0,
    joinStatusPlayers: [],
    playerCount: 6,
    previewImageUrl: 'https://api.pomer.cn/static/party-hero.png',
    previewTitle: '快来加入这一局',
    sessionId: '',
    sessionName: '今晚聚会不醉不归',
    shareItems: [],
    showJoinStatus: false,
  },

  async onLoad(query) {
    const runtime = getSessionRuntime()
    const sessionId = typeof query?.sessionId === 'string' ? decodeURIComponent(query.sessionId) : runtime.sessionId || ''

    this.setData({
      inviteCode: runtime.inviteCode || '',
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

    try {
      await this.loadSession()
    } catch (error) {
      this.showPreviewToast(error instanceof Error ? error.message : '邀请页加载失败')
    }
  },

  async onShow() {
    if (!this.data.sessionId && !getSessionRuntime().sessionId) {
      return
    }

    try {
      await this.loadSession()
    } catch (error) {
      this.showPreviewToast(error instanceof Error ? error.message : '邀请页加载失败')
    }
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
      title: this.data.previewTitle,
      path: `/pages/join-claim/index?inviteCode=${encodeURIComponent(this.data.inviteCode)}&sessionId=${encodeURIComponent(this.data.sessionId)}`,
      imageUrl: this.data.previewImageUrl,
    }
  },

  async loadSession() {
    const runtime = getSessionRuntime()
    const [liveSession, shareConfig] = await Promise.all([
      getManagedLiveSession(this.data.sessionId || runtime.sessionId, this.data.inviteCode || runtime.inviteCode),
      getManagedShareConfig(),
    ])

    setSessionRuntime({
      inviteCode: liveSession.inviteCode,
      sessionId: liveSession.id,
      sessionName: liveSession.sessionName,
      templateName: liveSession.templateName,
    })

    this.setData({
      avatars: liveSession.joinedPlayers.map((item) => item.avatarUrl).slice(0, liveSession.playerCount),
      inviteCode: liveSession.inviteCode,
      joinedCount: liveSession.joinedCount,
      joinStatusPlayers: liveSession.joinStatusPlayers,
      playerCount: liveSession.playerCount,
      previewImageUrl: shareConfig.preview.imageUrl,
      previewTitle: shareConfig.preview.title,
      sessionId: liveSession.id,
      sessionName: liveSession.sessionName,
      shareItems: shareConfig.shareItems.filter((item) => item.id && item.id !== 'save').map((item) => ({
        id: item.id,
        name: item.name,
        iconClass: item.iconClass,
      })),
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
      const tempFilePath = await downloadFile(this.data.previewImageUrl)
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
