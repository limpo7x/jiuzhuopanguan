import {
  addWineFriend,
  addWineFriendByProfile,
  getCurrentProfile,
  getWineFriends,
  removeWineFriend,
  searchRegisteredUsers,
  sendPokeToFriend,
  type SearchUserResult,
  updateWineFriend,
  type SocialProfile,
  type WineFriend,
} from '../../utils/social'

interface FriendHubFriend extends WineFriend {
  editing?: boolean
}

interface FriendHubState {
  currentProfile: SocialProfile
  editingFriendId: string
  editingFriendName: string
  newFriendMatches: SearchUserResult[]
  newFriendName: string
  wineFriends: FriendHubFriend[]
}

interface FriendHubMethods {
  handleAddFriendTap: () => Promise<void>
  handleAddRegisteredFriendTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handleCancelEditTap: () => void
  handleDeleteFriendTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handleEditFriendInput: (event: WechatMiniprogram.Input) => void
  handleNewFriendInput: (event: WechatMiniprogram.Input) => Promise<void>
  handlePokeTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handleSaveFriendTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handleStartEditTap: (event: WechatMiniprogram.BaseEvent) => void
  loadSocialData: () => Promise<void>
  showToast: (message: string) => void
}

Page<FriendHubState, FriendHubMethods>({
  data: {
    currentProfile: {
      avatarUrl: '',
      city: '',
      id: '',
      identityTag: '',
      name: '',
      signature: '',
    },
    editingFriendId: '',
    editingFriendName: '',
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
    const [currentProfile, wineFriends] = await Promise.all([getCurrentProfile(), getWineFriends()])
    this.setData({
      currentProfile,
      wineFriends: wineFriends.map((item) => ({
        ...item,
        editing: item.id === this.data.editingFriendId,
      })),
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

  async handleAddFriendTap() {
    const value = this.data.newFriendName.trim()
    if (!value) {
      this.showToast('先输入酒友昵称')
      return
    }
    await addWineFriend(value, '最近添加')
    this.setData({
      newFriendMatches: [],
      newFriendName: '',
    })
    await this.loadSocialData()
  },

  async handleAddRegisteredFriendTap(event) {
    const { profileId, name } = event.currentTarget.dataset as { profileId: string; name: string }
    await addWineFriendByProfile(profileId, name, '已从注册用户添加')
    this.setData({
      newFriendMatches: this.data.newFriendMatches.map((item) =>
        item.id === profileId ? { ...item, alreadyFriend: true } : item,
      ),
      newFriendName: '',
    })
    await this.loadSocialData()
  },

  handleStartEditTap(event) {
    const { id } = event.currentTarget.dataset as { id: string }
    const target = this.data.wineFriends.find((item) => item.id === id)
    if (!target) {
      return
    }
    this.setData({
      editingFriendId: id,
      editingFriendName: target.name,
      wineFriends: this.data.wineFriends.map((item) => ({
        ...item,
        editing: item.id === id,
      })),
    })
  },

  handleEditFriendInput(event) {
    this.setData({
      editingFriendName: event.detail.value || '',
    })
  },

  async handleSaveFriendTap(event) {
    const { id } = event.currentTarget.dataset as { id: string }
    const value = this.data.editingFriendName.trim()
    if (!value) {
      this.showToast('昵称不能为空')
      return
    }
    await updateWineFriend(id, {
      name: value,
      meta: '刚编辑过昵称',
    })
    this.setData({
      editingFriendId: '',
      editingFriendName: '',
    })
    await this.loadSocialData()
  },

  handleCancelEditTap() {
    this.setData({
      editingFriendId: '',
      editingFriendName: '',
      wineFriends: this.data.wineFriends.map((item) => ({
        ...item,
        editing: false,
      })),
    })
  },

  async handleDeleteFriendTap(event) {
    const { id } = event.currentTarget.dataset as { id: string }
    await removeWineFriend(id)
    await this.loadSocialData()
  },

  async handlePokeTap(event) {
    const { id } = event.currentTarget.dataset as { id: string }
    const result = await sendPokeToFriend(id)
    if (!result) {
      this.showToast('暂时不能拍自己')
      return
    }
    this.showToast(result.status === 'matched' ? '你们已经合拍了' : '已拍一拍对方')
  },

  showToast(message) {
    wx.showToast({
      title: message,
      icon: 'none',
    })
  },
})

export {}
