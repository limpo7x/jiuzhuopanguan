import {
  getCurrentDisplayProfile,
  getWineFriends,
  removeWineFriend,
  searchRegisteredUsers,
  sendPokeToFriend,
  type SearchUserResult,
  type SocialProfile,
  type WineFriend,
} from '../../utils/social'

interface FriendHubState {
  currentProfile: SocialProfile
  newFriendMatches: SearchUserResult[]
  newFriendName: string
  wineFriends: WineFriend[]
}

interface FriendHubMethods {
  handleDeleteFriendTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handleNewFriendInput: (event: WechatMiniprogram.Input) => Promise<void>
  handlePokeTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  loadSocialData: () => Promise<void>
  showToast: (message: string) => void
}

Page<FriendHubState, FriendHubMethods>({
  data: {
    currentProfile: {
      avatarUrl: '',
      id: '',
      identityTag: '',
      name: '',
      signature: '',
    },
    newFriendMatches: [],
    newFriendName: '',
    wineFriends: [],
  },

  async onLoad() {
    await this.loadSocialData()
  },

  async onShow() {
    await this.loadSocialData()
  },

  async loadSocialData() {
    const [currentProfile, wineFriends] = await Promise.all([getCurrentDisplayProfile(), getWineFriends()])
    this.setData({
      currentProfile,
      wineFriends,
    })
  },

  async handleNewFriendInput(event) {
    const value = event.detail.value || ''
    const newFriendMatches = value.trim() ? await searchRegisteredUsers(value) : []
    this.setData({
      newFriendMatches,
      newFriendName: value,
    })
  },

  async handlePokeTap(event) {
    const { id } = event.currentTarget.dataset as { id: string }
    const result = await sendPokeToFriend(id)
    if (!result) {
      this.showToast('暂时不能拍自己')
      return
    }
    this.showToast(result.status === 'matched' ? '你们已经拍到一起' : '已拍一拍对方')
    await this.loadSocialData()
  },

  async handleDeleteFriendTap(event) {
    const { id } = event.currentTarget.dataset as { id: string }
    await removeWineFriend(id)
    await this.loadSocialData()
  },

  showToast(message) {
    wx.showToast({
      title: message,
      icon: 'none',
    })
  },
})

export {}
