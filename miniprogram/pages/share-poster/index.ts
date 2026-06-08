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
  ranks: PosterRank[]
  sessionName: string
  shareItems: PosterShareItem[]
}

interface SharePosterMethods {
  handleBackTap: () => void
  handleCreateTap: () => void
  openPage: (url: string) => void
  handleShareTap: (event: WechatMiniprogram.BaseEvent) => void
  showPreviewToast: (message: string) => void
}

Page<SharePosterState, SharePosterMethods>({
  data: {
    ranks: [
      { title: '欠酒王', avatarUrl: '/assets/avatars/avatar-1.png', name: '阿浩', value: '欠了6杯' },
      { title: '背锅侠', avatarUrl: '/assets/avatars/avatar-2.png', name: '小熊', value: '点名3次' },
      { title: '整活王', avatarUrl: '/assets/avatars/avatar-3.png', name: 'Mika', value: '3个题' },
    ],
    shareItems: [
      { id: 'save', name: '保存图片', iconClass: 'poster-icon-download' },
      { id: 'friend', name: '分享给好友', iconClass: 'poster-icon-wechat' },
      { id: 'group', name: '分享到群', iconClass: 'poster-icon-group' },
      { id: 'more', name: '更多', iconClass: 'poster-icon-more' },
    ],
    sessionName: '周五热场局',
  },

  onLoad() {
    const report = getSessionReport()
    const runtime = getSessionRuntime()

    if (!report) {
      this.setData({
        sessionName: runtime.sessionName,
      })
      return
    }

    this.setData({
      ranks: report.ranks,
      sessionName: report.sessionName,
    })
  },

  handleShareTap(event) {
    const { id, name } = event.currentTarget.dataset as { id: string; name: string }
    this.openPage(`/pages/share-helper/index?scene=report&channel=${encodeURIComponent(id)}&label=${encodeURIComponent(name)}`)
  },

  handleBackTap() {
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },

  handleCreateTap() {
    this.openPage('/pages/create-session/index')
  },

  openPage(url) {
    wx.navigateTo({
      url,
      fail: () => {
        wx.redirectTo({
          url,
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
