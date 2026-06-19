interface PrivacyStatePageState {
  actionText: string
  detail: string
  title: string
}

interface PrivacyStatePageMethods {
  handlePrimaryTap: () => void
  handleSecondaryTap: () => void
}

const copyMap: Record<string, Omit<PrivacyStatePageState, 'actionText'> & { actionText?: string }> = {
  feature: {
    detail: '主题、相册权益和分享能力会在新项目壳层中逐步整理；当前先保留可进入入口。',
    title: '功能整理中',
  },
  filtered: {
    detail: '私密记录不会进入公开分享，页面只展示可分享内容。',
    title: '仅展示可分享内容',
  },
  permission: {
    detail: '当前账号暂不能查看这张分享页，请使用邀请入口加入聚会。',
    title: '需要加入聚会',
  },
}

Page<PrivacyStatePageState, PrivacyStatePageMethods>({
  data: {
    actionText: '回到首页',
    detail: '当前内容暂不可查看，请回到首页重新进入聚会记录。',
    title: '暂不可查看',
  },

  onLoad(query) {
    const type = typeof query?.type === 'string' ? query.type : ''
    const copy = copyMap[type]
    if (copy) {
      this.setData({
        actionText: copy.actionText || '回到首页',
        detail: copy.detail,
        title: copy.title,
      })
    }
  },

  handlePrimaryTap() {
    wx.reLaunch({ url: '/pages/index/index' })
  },

  handleSecondaryTap() {
    wx.navigateTo({
      url: '/pages/album/index',
      fail: () => wx.redirectTo({ url: '/pages/album/index' }),
    })
  },
})

export {}
