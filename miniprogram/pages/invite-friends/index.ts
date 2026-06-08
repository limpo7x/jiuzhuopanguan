interface InviteReward {
  label: string
  value: string
}

interface InviteFriendsState {
  rewards: InviteReward[]
}

interface InviteFriendsMethods {
  handleInviteTap: () => void
  handlePosterTap: () => void
}

Page<InviteFriendsState, InviteFriendsMethods>({
  data: {
    rewards: [
      { label: '邀请 1 位新朋友', value: '+20 积分' },
      { label: '邀请 3 位新朋友', value: '解锁 1 套模板' },
      { label: '邀请 5 位新朋友', value: '商户券礼包' },
    ],
  },

  handleInviteTap() {
    wx.navigateTo({
      url: '/pages/invite-group/index',
    })
  },

  handlePosterTap() {
    wx.navigateTo({
      url: '/pages/share-poster/index',
    })
  },
})

export {}
