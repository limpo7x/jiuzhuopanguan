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

type FriendCategory = 'played' | 'unplayed'
type FriendHubTab = FriendCategory | 'pokes'

interface FriendHubCard extends WineFriend {
  coPlayCount: number
  coPlayCountText: string
  canPokeAgain: boolean
  pokeLockedReason: string
}

interface FriendHubState {
  activeFriendCategory: FriendHubTab
  currentProfile: SocialProfile
  hasPokeNotice: boolean
  newFriendMatches: SearchUserResult[]
  newFriendName: string
  playedFriends: FriendHubCard[]
  pokeCards: FriendPokeCard[]
  unplayedFriends: FriendHubCard[]
  visibleFriends: FriendHubCard[]
  wineFriends: FriendHubCard[]
}

interface FriendHubMethods {
  handleBackTap: () => void
  handleDeleteFriendTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handleFriendCategoryTap: (event: WechatMiniprogram.BaseEvent) => void
  handleNewFriendInput: (event: WechatMiniprogram.Input) => Promise<void>
  handlePokeActionTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handlePokeTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  loadSocialData: () => Promise<void>
  showToast: (message: string) => void
  switchFriendCategory: (category: FriendHubTab) => void
}

const readDatasetId = (event: WechatMiniprogram.BaseEvent) => String((event.currentTarget.dataset as { id?: string }).id || '').trim()
const readDatasetCategory = (event: WechatMiniprogram.BaseEvent): FriendHubTab => {
  const currentDataset = event.currentTarget?.dataset as { category?: FriendHubTab } | undefined
  const targetDataset = (event as unknown as { target?: { dataset?: { category?: FriendHubTab } } }).target?.dataset
  const category = currentDataset?.category || targetDataset?.category
  if (category === 'unplayed' || category === 'pokes') {
    return category
  }
  return 'played'
}

const normalizeHubFriend = (friend: WineFriend): FriendHubCard => {
  const coPlayCount = Math.max(0, Number(friend.coPlayCount) || 0)
  const canPokeAgain = friend.canPokeAgain !== false
  return {
    ...friend,
    canPokeAgain,
    coPlayCount,
    coPlayCountText: coPlayCount > 0 ? `合拍次数 ${coPlayCount}` : '',
    pokeLockedReason: canPokeAgain ? '' : friend.pokeLockedReason || '完成新一场共同聚会后再合拍',
  }
}

const filterFriends = (friends: FriendHubCard[], keyword: string) => {
  const trimmed = keyword.trim().toLowerCase()
  if (!trimmed) {
    return friends
  }
  return friends.filter((item) => [item.name, item.meta].join(' ').toLowerCase().includes(trimmed))
}

const buildFriendState = (friends: WineFriend[], activeFriendCategory: FriendHubTab, keyword: string) => {
  const wineFriends = friends.map(normalizeHubFriend)
  const playedFriends = wineFriends.filter((item) => item.coPlayCount > 0)
  const unplayedFriends = wineFriends.filter((item) => item.coPlayCount <= 0)
  const baseFriends = activeFriendCategory === 'played' ? playedFriends : activeFriendCategory === 'unplayed' ? unplayedFriends : []
  return {
    playedFriends,
    unplayedFriends,
    visibleFriends: filterFriends(baseFriends, keyword),
    wineFriends,
  }
}

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

const hasPokeNotice = (pokeCards: FriendPokeCard[]) => pokeCards.some((item) => item.actionState === 'incoming')

Page<FriendHubState, FriendHubMethods>({
  data: {
    activeFriendCategory: 'played',
    currentProfile: {
      avatarUrl: '',
      id: '',
      identityTag: '',
      name: '',
      signature: '',
    },
    hasPokeNotice: false,
    newFriendMatches: [],
    newFriendName: '',
    playedFriends: [],
    pokeCards: [],
    unplayedFriends: [],
    visibleFriends: [],
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
    const friendState = buildFriendState(social.wineFriends, this.data.activeFriendCategory, this.data.newFriendName)
    const pokeCards = buildPokeCards(currentProfile, social.pokeThreads)
    this.setData({
      currentProfile,
      ...friendState,
      hasPokeNotice: hasPokeNotice(pokeCards),
      pokeCards,
    })
  },

  async handleNewFriendInput(event) {
    const value = event.detail.value || ''
    const newFriendMatches = value.trim() ? await searchRegisteredUsers(value) : []
    const friendState = buildFriendState(this.data.wineFriends, this.data.activeFriendCategory, value)
    this.setData({
      ...friendState,
      newFriendMatches,
      newFriendName: value,
    })
  },

  handleFriendCategoryTap(event) {
    this.switchFriendCategory(readDatasetCategory(event))
  },

  switchFriendCategory(activeFriendCategory) {
    wx.hideKeyboard?.()
    const friendState = buildFriendState(this.data.wineFriends, activeFriendCategory, this.data.newFriendName)
    this.setData({
      activeFriendCategory,
      ...friendState,
    })
  },

  async handlePokeTap(event) {
    const id = readDatasetId(event)
    if (!id) {
      this.showToast('没有找到这位聚友')
      return
    }
    const targetFriend = this.data.wineFriends.find((item) => item.id === id)
    if (targetFriend && targetFriend.canPokeAgain === false) {
      this.showToast(targetFriend.pokeLockedReason || '完成新一场共同聚会后再合拍')
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
    } catch (error) {
      const message = String((error as Error)?.message || '')
      this.showToast(message.includes('共同聚会') || message.includes('新一场') ? message : '拍一拍失败，请稍后重试')
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
