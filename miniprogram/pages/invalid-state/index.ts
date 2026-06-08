interface InvalidStat {
  label: string
  value: string
}

interface InvalidQuickItem {
  iconClass: string
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
      { name: '邀请好友', iconClass: 'invalid-icon-user', route: '/pages/invite-group/index', toneClass: 'invalid-tile-green' },
      { name: '使用新模板', iconClass: 'invalid-icon-magic', route: '/pages/premium-templates/index', toneClass: 'invalid-tile-blue' },
      { name: '去积分中心', iconClass: 'invalid-icon-crown', route: '/pages/wine-points/index', toneClass: '' },
    ],
  },

  handleReportTap() {
    wx.navigateTo({
      url: '/pages/result-report/index',
    })
  },

  handleRestartTap() {
    wx.navigateTo({
      url: '/pages/restart-state/index',
    })
  },

  handleQuickTap(event) {
    const { route } = event.currentTarget.dataset as { route: string }
    wx.navigateTo({ url: route })
  },
})

export {}
