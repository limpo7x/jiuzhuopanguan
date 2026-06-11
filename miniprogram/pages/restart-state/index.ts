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
      { id: 'friend', name: '分享给好友', iconClass: 'restart-icon-wechat' },
      { id: 'group', name: '分享到群', iconClass: 'restart-icon-group' },
    ],
  },

  onShareAppMessage() {
    return {
      title: '再开一局，继续酒桌判官',
      path: '/pages/create-session/index',
    }
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
    const { id } = event.currentTarget.dataset as { id: string }
    if (!id) {
      this.openPage('/pages/create-session/index')
    }
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
