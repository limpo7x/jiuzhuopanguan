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
    records: [
      { name: '图片压缩', meta: '刚刚使用 · 输出 6 张', tag: '工具', route: '/pages/tool-detail/index?id=image-compress&name=%E5%9B%BE%E7%89%87%E5%8E%8B%E7%BC%A9' },
      { name: 'JSON格式化', meta: '12 分钟前 · 接口联调', tag: '开发', route: '/pages/tool-detail/index?id=json&name=JSON%E6%A0%BC%E5%BC%8F%E5%8C%96' },
      { name: '周五热场局', meta: '昨天 23:10 · 查看战报', tag: '酒局', route: '/pages/result-report/index' },
      { name: '二维码生成', meta: '昨天 19:02 · 分享口令', tag: '分享', route: '/pages/tool-detail/index?id=qr-code&name=%E4%BA%8C%E7%BB%B4%E7%A0%81' },
    ],
  },

  handleRecordTap(event) {
    const { route } = event.currentTarget.dataset as { route: string }
    wx.navigateTo({ url: route })
  },
})

export {}
