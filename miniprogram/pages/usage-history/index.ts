import { getManagedUsageRecords } from '../../services/operations'

interface UsageRecord {
  meta: string
  name: string
  route: string
  tag: string
}

interface UsageHistoryState {
  records: UsageRecord[]
}

interface UsageHistoryMethods {
  handleRecordTap: (event: WechatMiniprogram.BaseEvent) => void
  openPage: (url: string) => void
}

Page<UsageHistoryState, UsageHistoryMethods>({
  data: {
    records: [],
  },

  async onLoad() {
    try {
      const records = await getManagedUsageRecords()
      this.setData({ records })
    } catch (error) {
      wx.showToast({
        title: error instanceof Error ? error.message : '使用记录加载失败',
        icon: 'none',
      })
    }
  },

  handleRecordTap(event) {
    const { route } = event.currentTarget.dataset as { route: string }
    if (!route) {
      wx.showToast({
        title: '记录参数不合法',
        icon: 'none',
      })
      return
    }

    const routeWithViewerRole =
      route.includes('/pages/live-record/index') && !/[?&]role=/.test(route)
        ? `${route}${route.includes('?') ? '&' : '?'}role=viewer`
        : route

    this.openPage(routeWithViewerRole)
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
