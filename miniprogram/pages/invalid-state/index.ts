interface InvalidStat {
  label: string
  value: string
}

interface InvalidQuickItem {
  iconUrl: string
  name: string
  route: string
  toneClass: string
}

interface InvalidStateState {
  quickItems: InvalidQuickItem[]
  stats: InvalidStat[]
}

interface InvalidStateMethods {
  handleQuickTap: (event: WechatMiniprogram.BaseEvent) => void
  handleReportTap: () => void
  handleRestartTap: () => void
}

Page<InvalidStateState, InvalidStateMethods>({
  data: {
    stats: [
      { value: '2024.05.20', label: '开始时间' },
      { value: '6人', label: '参与人数' },
      { value: '2小时18分', label: '游戏时长' },
    ],
    quickItems: [
      { name: '邀请好友', iconUrl: 'https://cdn.pomer.cn/static/party-pop-clean/icons/action-join.png', route: '/pages/invite-group/index', toneClass: 'invalid-tile-green' },
      { name: '查看相册', iconUrl: 'https://cdn.pomer.cn/static/party-pop-clean/icons/action-album.png', route: '/pages/album/index', toneClass: 'invalid-tile-blue' },
      { name: '聚会账本', iconUrl: 'https://cdn.pomer.cn/static/party-pop-clean/icons/service-points.png', route: '/pages/ledger/index', toneClass: '' },
    ],
  },

  handleReportTap() {
    wx.navigateTo({
      url: '/pages/album/index',
    })
  },

  handleRestartTap() {
    wx.navigateTo({
      url: '/pages/create-session/index',
    })
  },

  handleQuickTap(event) {
    const { route } = event.currentTarget.dataset as { route: string }
    wx.navigateTo({ url: route })
  },
})

export {}
