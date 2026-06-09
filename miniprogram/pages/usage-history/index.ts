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
        title: '该记录暂不可跳转',
        icon: 'none',
      })
      return
    }
    wx.navigateTo({ url: route })
  },
})

export {}
