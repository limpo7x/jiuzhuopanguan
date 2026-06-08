interface RestartTemplate {
  active?: boolean
  name: string
}

interface RestartShareItem {
  id: string
  iconClass: string
  name: string
}

interface RestartStateState {
  shareItems: RestartShareItem[]
  templates: RestartTemplate[]
}

interface RestartStateMethods {
  handleBackTap: () => void
  handleShareTap: (event: WechatMiniprogram.BaseEvent) => void
  handleQuickStartTap: () => void
  handleReuseTap: () => void
  openPage: (url: string) => void
}

Page<RestartStateState, RestartStateMethods>({
  data: {
    templates: [
      { name: '经典惩罚局' },
      { name: '整活大挑战', active: true },
      { name: '友情互损局' },
    ],
    shareItems: [
      { id: 'save', name: '保存图片', iconClass: 'restart-icon-download' },
      { id: 'friend', name: '分享给好友', iconClass: 'restart-icon-wechat' },
      { id: 'group', name: '分享到群', iconClass: 'restart-icon-group' },
      { id: 'more', name: '更多', iconClass: 'restart-icon-more' },
    ],
  },

  handleReuseTap() {
    this.openPage('/pages/create-session/index')
  },

  handleQuickStartTap() {
    this.openPage('/pages/create-session/index')
  },

  handleBackTap() {
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },

  handleShareTap(event) {
    const { id, name } = event.currentTarget.dataset as { id: string; name: string }
    this.openPage(`/pages/share-helper/index?scene=restart&channel=${encodeURIComponent(id)}&label=${encodeURIComponent(name)}`)
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
