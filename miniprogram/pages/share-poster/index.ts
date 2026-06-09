import { getSessionReport, getSessionRuntime } from '../../utils/session'
import { trackAnalyticsEvent } from '../../services/analytics'

interface PosterRank {
  avatarUrl: string
  name: string
  title: string
  value: string
}

interface PosterShareItem {
  iconClass: string
  id: string
  name: string
}

interface SharePosterState {
  inviteCode: string
  ranks: PosterRank[]
  sessionId: string
  sessionName: string
  shareItems: PosterShareItem[]
}

interface SharePosterMethods {
  handleBackTap: () => void
  handleCreateTap: () => void
  handleSaveTap: () => Promise<void>
  showPreviewToast: (message: string) => void
}

const POSTER_IMAGE_URL = 'https://api.pomer.cn/static/report-poster.png'

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

Page<SharePosterState, SharePosterMethods>({
  data: {
    inviteCode: '',
    ranks: [],
    sessionId: '',
    shareItems: [
      { id: 'friend', name: '分享给好友', iconClass: 'poster-icon-wechat' },
      { id: 'group', name: '分享到群', iconClass: 'poster-icon-group' },
      { id: 'more', name: '更多', iconClass: 'poster-icon-more' },
    ],
    sessionName: '本局战报',
  },

  onLoad() {
    const report = getSessionReport()
    const runtime = getSessionRuntime()

    this.setData({
      inviteCode: runtime.inviteCode || '',
      sessionId: runtime.sessionId || '',
      sessionName: report?.sessionName || runtime.sessionName || '本局战报',
      ranks: report?.ranks || [],
    })
  },

  onShareAppMessage() {
    trackAnalyticsEvent({
      type: 'report_share',
      assetId: 'share-1',
      meta: {
        sessionId: this.data.sessionId,
        channel: 'share-poster',
      },
    })

    return {
      title: `${this.data.sessionName} 战报出炉`,
      path: `/pages/join-claim/index?inviteCode=${encodeURIComponent(this.data.inviteCode)}&sessionId=${encodeURIComponent(this.data.sessionId)}`,
      imageUrl: POSTER_IMAGE_URL,
    }
  },

  async handleSaveTap() {
    try {
      const tempFilePath = await downloadFile(POSTER_IMAGE_URL)
      await saveImage(tempFilePath)
      trackAnalyticsEvent({
        type: 'share_asset_open',
        assetId: 'share-1',
        meta: {
          sessionId: this.data.sessionId,
          action: 'save-poster',
        },
      })
      this.showPreviewToast('战报海报已保存')
    } catch {
      this.showPreviewToast('保存失败，请检查相册权限')
    }
  },

  handleBackTap() {
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },

  handleCreateTap() {
    wx.navigateTo({
      url: '/pages/create-session/index',
      fail: () => {
        wx.redirectTo({
          url: '/pages/create-session/index',
        })
      },
    })
  },

  showPreviewToast(message) {
    wx.showToast({
      title: message,
      icon: 'none',
    })
  },
})

export {}
