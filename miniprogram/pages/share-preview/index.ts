import { getSessionRuntime } from '../../utils/session'

interface SharePreviewItem {
  iconClass: string
  id: string
  name: string
}

interface SharePreviewState {
  avatars: string[]
  joinedCount: number
  joinStatusPlayers: Array<{ avatarUrl: string; name: string; status: string }>
  playerCount: number
  sessionName: string
  shareItems: SharePreviewItem[]
  showJoinStatus: boolean
}

interface SharePreviewMethods {
  handleTabTap: (event: WechatMiniprogram.BaseEvent) => void
  handleSaveTap: () => void
  handleShareTap: (event: WechatMiniprogram.BaseEvent) => void
  openPage: (url: string) => void
  showPreviewToast: (message: string) => void
}

Page<SharePreviewState, SharePreviewMethods>({
  data: {
    avatars: [
      '/assets/avatars/avatar-1.png',
      '/assets/avatars/avatar-2.png',
      '/assets/avatars/avatar-3.png',
      '/assets/avatars/avatar-4.png',
    ],
    joinedCount: 4,
    joinStatusPlayers: [
      { name: '阿浩', avatarUrl: '/assets/avatars/avatar-1.png', status: '已加入' },
      { name: '小熊', avatarUrl: '/assets/avatars/avatar-2.png', status: '已加入' },
      { name: 'Mika', avatarUrl: '/assets/avatars/avatar-3.png', status: '待确认' },
      { name: '可可', avatarUrl: '/assets/avatars/avatar-4.png', status: '已加入' },
      { name: '阿乐', avatarUrl: '/assets/avatars/avatar-1.png', status: '待加入' },
      { name: 'Nina', avatarUrl: '/assets/avatars/avatar-2.png', status: '待加入' },
    ],
    playerCount: 6,
    sessionName: '今晚聚会不醉不归',
    shareItems: [
      { id: 'save', name: '保存图片', iconClass: 'share-icon-download' },
      { id: 'friend', name: '分享给好友', iconClass: 'share-icon-wechat' },
      { id: 'group', name: '分享到群', iconClass: 'share-icon-group' },
      { id: 'more', name: '更多', iconClass: 'share-icon-more' },
    ],
    showJoinStatus: false,
  },

  onLoad() {
    const runtime = getSessionRuntime()
    const playerCount = Math.max(2, runtime.playerCount || 6)
    const selectedPlayers = runtime.selectedPlayers?.length
      ? runtime.selectedPlayers
      : this.data.joinStatusPlayers.map((item) => ({
          name: item.name,
          avatarUrl: item.avatarUrl,
        }))
    const joinedCount = Math.min(playerCount, Math.min(selectedPlayers.length, 4))
    const avatars = selectedPlayers.slice(0, joinedCount).map((item) => item.avatarUrl)
    const joinStatusPlayers = selectedPlayers.slice(0, playerCount).map((item, index) => ({
      ...item,
      status: index < joinedCount ? '已加入' : '待加入',
    }))

    this.setData({
      avatars,
      joinedCount,
      joinStatusPlayers,
      playerCount,
      sessionName: runtime.sessionName,
    })
  },

  handleTabTap(event) {
    const { tab } = event.currentTarget.dataset as { tab: 'preview' | 'status' }

    this.setData({
      showJoinStatus: tab === 'status',
    })
  },

  handleSaveTap() {
    this.openPage('/pages/share-helper/index?scene=preview&channel=save&label=保存海报')
  },

  handleShareTap(event) {
    const { id, name } = event.currentTarget.dataset as { id: string; name: string }
    this.openPage(`/pages/share-helper/index?scene=preview&channel=${encodeURIComponent(id)}&label=${encodeURIComponent(name)}`)
  },

  showPreviewToast(message) {
    wx.showToast({
      title: message,
      icon: 'none',
    })
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
