import { getSessionReport, getSessionRuntime } from '../../utils/session'

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
    sessionName: '周五热场局',
  },

  onLoad() {
    const report = getSessionReport()
    const runtime = getSessionRuntime()

    this.setData({
      inviteCode: runtime.inviteCode || '',
      sessionId: runtime.sessionId || '',
      sessionName: report?.sessionName || runtime.sessionName,
      ranks: report?.ranks || [],
    })
  },

  onShareAppMessage() {
    return {
      title: `${this.data.sessionName} 战报出炉了`,
      path: `/pages/join-claim/index?inviteCode=${encodeURIComponent(this.data.inviteCode)}&sessionId=${encodeURIComponent(this.data.sessionId)}`,
      imageUrl: 'https://api.pomer.cn/static/report-poster.png',
    }
  },

  async handleSaveTap() {
    try {
      const tempFilePath = await downloadFile('https://api.pomer.cn/static/report-poster.png')
      await saveImage(tempFilePath)
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
