import { updateManagedSession } from '../../services/operations'
import { getSessionRuntime, setSessionRuntime } from '../../utils/session'
import {
  addWineFriend,
  addWineFriendByProfile,
  ensureUserAuthorized,
  getWineFriends,
  searchRegisteredUsers,
  touchWineFriends,
  type SearchUserResult,
  type WineFriend,
} from '../../utils/social'

interface PlayerItem {
  avatarUrl: string
  id: string
  meta: string
  name: string
  profileId: string
  selected?: boolean
}

interface FavoritePlayer {
  avatarUrl: string
  id: string
  name: string
}

interface AddPlayersState {
  createCandidateName: string
  favoritePlayers: FavoritePlayer[]
  filteredPlayers: PlayerItem[]
  playerLimit: number
  players: PlayerItem[]
  searchMatches: SearchUserResult[]
  searchKeyword: string
  selectedCount: number
}

interface AddPlayersMethods {
  filterPlayers: (players: PlayerItem[], keyword: string) => PlayerItem[]
  handleAddCandidateTap: () => void
  handleAddRegisteredTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handleNextTap: () => void
  handlePlayerToggle: (event: WechatMiniprogram.BaseEvent) => void
  handleSearchInput: (event: WechatMiniprogram.Input) => Promise<void>
  handleSelectAllTap: () => void
  resolveCreateCandidate: (keyword: string, players: PlayerItem[], searchMatches: SearchUserResult[]) => string
  showToast: (message: string) => void
  syncPlayers: () => void
}

const countSelected = (players: PlayerItem[]) => players.filter((item) => item.selected).length
const toPlayerItem = (item: WineFriend, selected = false): PlayerItem => ({
  id: item.id,
  name: item.name,
  avatarUrl: item.avatarUrl,
  meta: item.meta,
  profileId: item.profileId,
  selected,
})

Page<AddPlayersState, AddPlayersMethods>({
  data: {
    createCandidateName: '',
    favoritePlayers: [],
    filteredPlayers: [],
    playerLimit: 6,
    players: [],
    searchMatches: [],
    searchKeyword: '',
    selectedCount: 4,
  },

  async onLoad() {
    const profile = await ensureUserAuthorized('/pages/add-players/index')
    if (!profile) return
    await this.syncPlayers()
  },

  async onShow() {
    const profile = await ensureUserAuthorized('/pages/add-players/index')
    if (!profile) return
    await this.syncPlayers()
  },

  async syncPlayers() {
    const runtime = getSessionRuntime()
    const playerLimit = Math.max(2, runtime.playerCount || 6)
    const friendList = await getWineFriends()
    if (!friendList.length) {
      this.showToast('暂无常用玩家和最近联系人，先去邀请好友')
      wx.redirectTo({
        url: '/pages/invite-group/index',
      })
      return
    }
    const previousSelectedNames = this.data.players.filter((item) => item.selected).map((item) => item.name)
    const runtimeSelectedNames = runtime.selectedPlayers.map((item) => item.name)
    const preferredSelectedNames = previousSelectedNames.length ? previousSelectedNames : runtimeSelectedNames
    const selectedNameSet = new Set(
      preferredSelectedNames.length ? preferredSelectedNames : friendList.slice(0, playerLimit).map((item) => item.name),
    )
    const players = friendList.map((item) => toPlayerItem(item, selectedNameSet.has(item.name)))
    const normalizedPlayers = players.map((item, index, list) => {
      const selected = item.selected && countSelected(list.slice(0, index).concat({ ...item, selected: true })) <= playerLimit
      return {
        ...item,
        selected,
      }
    })

    const selectedPlayers = normalizedPlayers
      .filter((item) => item.selected)
      .slice(0, playerLimit)
      .map((item) => item.name)
    const strictSelectedSet = new Set(selectedPlayers)
    const strictPlayers = normalizedPlayers.map((item) => ({
      ...item,
      selected: strictSelectedSet.has(item.name),
    }))
    const filteredPlayers = this.filterPlayers(strictPlayers, this.data.searchKeyword)

    this.setData({
      createCandidateName: this.resolveCreateCandidate(this.data.searchKeyword, strictPlayers, this.data.searchMatches),
      favoritePlayers: strictPlayers.slice(0, 5).map((item) => ({
        id: item.id,
        name: item.name,
        avatarUrl: item.avatarUrl,
      })),
      filteredPlayers,
      playerLimit,
      players: strictPlayers,
      selectedCount: countSelected(strictPlayers),
    })
  },

  handlePlayerToggle(event) {
    const { name } = event.currentTarget.dataset as { name: string }
    const current = this.data.players.find((item) => item.name === name)

    if (!current) {
      return
    }

    if (!current.selected && this.data.selectedCount >= this.data.playerLimit) {
      this.showToast(`最多选择 ${this.data.playerLimit} 位玩家`)
      return
    }

    const players = this.data.players.map((item) =>
      item.name === name ? { ...item, selected: !item.selected } : item,
    )

    this.setData({
      createCandidateName: this.resolveCreateCandidate(this.data.searchKeyword, players, this.data.searchMatches),
      filteredPlayers: this.filterPlayers(players, this.data.searchKeyword),
      players,
      selectedCount: countSelected(players),
    })
  },

  async handleSearchInput(event) {
    const searchKeyword = event.detail.value || ''
    const searchMatches = searchKeyword.trim() ? await searchRegisteredUsers(searchKeyword) : []

    this.setData({
      createCandidateName: this.resolveCreateCandidate(searchKeyword, this.data.players, searchMatches),
      filteredPlayers: this.filterPlayers(this.data.players, searchKeyword),
      searchMatches,
      searchKeyword,
    })
  },

  async handleAddRegisteredTap(event) {
    const { profileId, name } = event.currentTarget.dataset as { name: string; profileId: string }
    const created = await addWineFriendByProfile(profileId, name, '已从注册用户添加')
    const canSelect = this.data.selectedCount < this.data.playerLimit
    const players = [
      {
        id: created.id,
        name: created.name,
        avatarUrl: created.avatarUrl,
        meta: created.meta,
        profileId: created.profileId,
        selected: canSelect,
      },
      ...this.data.players.filter((item) => item.name !== created.name),
    ]
    const searchMatches = this.data.searchMatches.map((item) =>
      item.id === profileId ? { ...item, alreadyFriend: true } : item,
    )

    this.setData({
      createCandidateName: '',
      favoritePlayers: players.slice(0, 5).map((item) => ({
        id: item.id,
        name: item.name,
        avatarUrl: item.avatarUrl,
      })),
      filteredPlayers: this.filterPlayers(players, this.data.searchKeyword),
      players,
      searchMatches,
      selectedCount: countSelected(players),
    })
  },

  async handleAddCandidateTap() {
    const candidate = this.data.createCandidateName.trim()

    if (!candidate) {
      return
    }

    const created = await addWineFriend(candidate)
    const canSelect = this.data.selectedCount < this.data.playerLimit
    const players = [
      {
        id: created.id,
        name: created.name,
        avatarUrl: created.avatarUrl,
        meta: '最近添加',
        profileId: created.profileId,
        selected: canSelect,
      },
      ...this.data.players.filter((item) => item.name !== created.name),
    ]

    this.setData({
      createCandidateName: '',
      favoritePlayers: players.slice(0, 5).map((item) => ({
        id: item.id,
        name: item.name,
        avatarUrl: item.avatarUrl,
      })),
      filteredPlayers: this.filterPlayers(players, ''),
      players,
      searchKeyword: '',
      selectedCount: countSelected(players),
    })

    this.showToast(`${created.name} 已加入最近联系人`)
  },

  handleSelectAllTap() {
    const players = this.data.players.map((item, index) => ({
      ...item,
      selected: index < this.data.playerLimit,
    }))

    this.setData({
      createCandidateName: this.resolveCreateCandidate(this.data.searchKeyword, players, this.data.searchMatches),
      filteredPlayers: this.filterPlayers(players, this.data.searchKeyword),
      players,
      selectedCount: countSelected(players),
    })
  },

  async handleNextTap() {
    if (this.data.selectedCount !== this.data.playerLimit) {
      this.showToast(`需要选择 ${this.data.playerLimit} 位玩家`)
      return
    }

    const selectedPlayers = this.data.players
      .filter((item) => item.selected)
      .map((item) => ({
        name: item.name,
        avatarUrl: item.avatarUrl,
        profileId: item.profileId,
        status: '',
      }))

    await touchWineFriends(selectedPlayers)

    const runtime = getSessionRuntime()
    if (runtime.sessionId) {
      await updateManagedSession(runtime.sessionId, {
        hostAvatarUrl: runtime.currentUser?.avatarUrl,
        hostName: runtime.currentUser?.name,
        hostProfileId: runtime.currentUser?.id,
        playerCount: this.data.playerLimit,
        selectedPlayers,
        sessionName: runtime.sessionName,
        templateName: runtime.templateName,
      }).catch(() => null)
    }

    setSessionRuntime({
      playerCount: this.data.playerLimit,
      selectedPlayers,
    })

    wx.navigateTo({
      url: '/pages/invite-group/index',
    })
  },

  showToast(message: string) {
    wx.showToast({
      title: message,
      icon: 'none',
    })
  },

  filterPlayers(players: PlayerItem[], keyword: string) {
    const trimmed = keyword.trim().toLowerCase()

    if (!trimmed) {
      return players
    }

    return players.filter((item) => item.name.toLowerCase().includes(trimmed))
  },

  resolveCreateCandidate(keyword: string, players: PlayerItem[], searchMatches: SearchUserResult[]) {
    const trimmed = keyword.trim()

    if (!trimmed) {
      return ''
    }

    const existed = players.some((item) => item.name.toLowerCase() === trimmed.toLowerCase())
    return existed || searchMatches.length ? '' : trimmed
  },
})

export {}
