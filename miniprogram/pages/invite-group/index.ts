interface ShareItem {
  iconClass: string
  id: string
  name: string
}

interface InviteGroupState {
  inviteCode: string
  shareItems: ShareItem[]
}

interface InviteGroupMethods {
  handleCopyTap: () => void
  handleJoinTap: () => void
  handleNextTap: () => void
  openPage: (url: string) => void
  handlePreviewTap: () => void
  handleShareTap: (event: WechatMiniprogram.BaseEvent) => void
  showPreviewToast: (message: string) => void
}

Page<InviteGroupState, InviteGroupMethods>({
  data: {
    inviteCode: 'AB7K9Q',
    shareItems: [
      { id: 'save', name: '保存图片', iconClass: 'invite-icon-download' },
      { id: 'friend', name: '分享给好友', iconClass: 'invite-icon-wechat' },
      { id: 'group', name: '分享到群', iconClass: 'invite-icon-group' },
      { id: 'more', name: '更多', iconClass: 'invite-icon-more' },
    ],
  },

  handleCopyTap() {
    wx.setClipboardData({
      data: this.data.inviteCode,
    })
  },

  handlePreviewTap() {
    this.openPage('/pages/share-preview/index')
  },

  handleShareTap(event) {
    const { id, name } = event.currentTarget.dataset as { id: string; name: string }
    this.openPage(`/pages/share-helper/index?scene=invite&channel=${encodeURIComponent(id)}&label=${encodeURIComponent(name)}`)
  },

  handleJoinTap() {
    this.openPage('/pages/join-claim/index')
  },

  handleNextTap() {
    this.openPage('/pages/waiting-room/index')
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
