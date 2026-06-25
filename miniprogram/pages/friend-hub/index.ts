import {
  bootstrapSocial,
  ignorePokeThread,
  removeWineFriend,
  replyPokeThread,
  resolveDisplayProfile,
  searchRegisteredUsers,
  sendPokeToFriend,
  type PokeThread,
  type SearchUserResult,
  type SocialProfile,
  type WineFriend,
} from '../../utils/social'

interface FriendPokeCard {
  actionState: 'incoming' | 'matched' | 'outgoing'
  avatarUrl: string
  id: string
  message: string
  name: string
  statusLabel: string
}

interface FriendHubState {
  currentProfile: SocialProfile
  newFriendMatches: SearchUserResult[]
  newFriendName: string
  pokeCards: FriendPokeCard[]
  wineFriends: WineFriend[]
}

interface FriendHubMethods {
  handleBackTap: () => void
  handleDeleteFriendTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handleNewFriendInput: (event: WechatMiniprogram.Input) => Promise<void>
  handlePokeActionTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handlePokeTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  loadSocialData: () => Promise<void>
  showToast: (message: string) => void
}

const readDatasetId = (event: WechatMiniprogram.BaseEvent) => String((event.currentTarget.dataset as { id?: string }).id || '').trim()

const buildPokeCards = (currentProfile: SocialProfile, pokeThreads: PokeThread[]): FriendPokeCard[] =>
  pokeThreads.map((item) => {
    const isIncoming = item.receiverId === currentProfile.id
    const counterpartName = item.counterpartName || (isIncoming ? item.senderName : item.receiverName) || '聚友'
    const counterpartAvatarUrl = item.counterpartAvatarUrl || (isIncoming ? item.senderAvatarUrl : item.receiverAvatarUrl)

    if (item.status === 'matched') {
      return {
        id: item.id,
        avatarUrl: counterpartAvatarUrl,
        name: counterpartName,
        message: `${counterpartName} 已和你拍一拍成功，可以直接开局。`,
        actionState: 'matched',
        statusLabel: '已拍到',
      }
    }

    if (isIncoming) {
      return {
        id: item.id,
        avatarUrl: counterpartAvatarUrl,
        name: counterpartName,
        message: `${counterpartName} 拍了拍你，正在等你回拍。`,
        actionState: 'incoming',
        statusLabel: '',
      }
    }

    return {
      id: item.id,
      avatarUrl: counterpartAvatarUrl,
      name: counterpartName,
      message: `你拍了拍 ${counterpartName}，等待对方回拍。`,
      actionState: 'outgoing',
      statusLabel: '等待中',
    }
  })

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
    pokeCards: [],
    wineFriends: [],
  },

  async onLoad() {
    await this.loadSocialData()
  },

  async onShow() {
    await this.loadSocialData()
  },

  async loadSocialData() {
    const social = await bootstrapSocial()
    const currentProfile = resolveDisplayProfile(social.currentProfile)
    this.setData({
      currentProfile,
      pokeCards: buildPokeCards(currentProfile, social.pokeThreads),
      wineFriends: social.wineFriends,
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
    const id = readDatasetId(event)
    if (!id) {
      this.showToast('没有找到这位聚友')
      return
    }
    try {
      const result = await sendPokeToFriend(id)
      if (!result) {
        this.showToast('暂时不能拍自己')
        return
      }
      this.showToast(result.status === 'matched' ? '你们已经拍到一起' : '已拍一拍对方')
      await this.loadSocialData()
    } catch {
      this.showToast('拍一拍失败，请稍后重试')
    }
  },

  async handleDeleteFriendTap(event) {
    const id = readDatasetId(event)
    if (!id) {
      this.showToast('没有找到这位聚友')
      return
    }
    try {
      await removeWineFriend(id)
      await this.loadSocialData()
    } catch {
      this.showToast('删除失败，请稍后重试')
    }
  },

  async handlePokeActionTap(event) {
    const { action } = event.currentTarget.dataset as { action?: 'ignore' | 'reply' }
    const id = readDatasetId(event)
    if (!id) {
      this.showToast('没有找到这条提醒')
      return
    }

    try {
      if (action === 'ignore') {
        await ignorePokeThread(id)
        this.showToast('已忽略')
      } else {
        await replyPokeThread(id)
        this.showToast('已回拍')
      }
      await this.loadSocialData()
    } catch {
      this.showToast(action === 'ignore' ? '忽略失败，请稍后重试' : '回拍失败，请稍后重试')
    }
  },

  handleBackTap() {
    wx.navigateBack({
      fail: () => {
        wx.reLaunch({ url: '/pages/me/index' })
      },
    })
  },

  showToast(message) {
    wx.showToast({
      title: message,
      icon: 'none',
    })
  },
})

export {}
