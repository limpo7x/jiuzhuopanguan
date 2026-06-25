import { createManagedSession, updateManagedSession } from '../../services/operations'
import { getSessionRuntime, setSessionRuntime, type SessionParticipant } from '../../utils/session'
import {
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
  inviteLimit: number
  playerLimit: number
  players: PlayerItem[]
  searchMatches: SearchUserResult[]
  searchKeyword: string
  selectedCount: number
}

interface AddPlayersMethods {
  filterPlayers: (players: PlayerItem[], keyword: string) => PlayerItem[]
  handleAddRegisteredTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handleNextTap: () => void
  handlePlayerToggle: (event: WechatMiniprogram.BaseEvent) => void
  handleSearchInput: (event: WechatMiniprogram.Input) => Promise<void>
  handleSelectAllTap: () => void
  resolveCreateCandidate: (keyword: string, searchMatches: SearchUserResult[]) => string
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
    inviteLimit: 1,
    playerLimit: 6,
    players: [],
    searchMatches: [],
    searchKeyword: '',
    selectedCount: 0,
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
    const inviteLimit = Math.max(1, playerLimit - 1)
    const friendList = await getWineFriends()
    if (!friendList.length) {
      this.setData({
        createCandidateName: this.resolveCreateCandidate(this.data.searchKeyword, this.data.searchMatches),
        favoritePlayers: [],
        filteredPlayers: [],
        inviteLimit,
        playerLimit,
        players: [],
        selectedCount: 0,
      })
      return
    }
    const previousSelectedNames = this.data.players.filter((item) => item.selected).map((item) => item.name)
    const runtimeSelectedNames = runtime.selectedPlayers.map((item) => item.name)
    const preferredSelectedNames = previousSelectedNames.length ? previousSelectedNames : runtimeSelectedNames
    const selectedNameSet = new Set(
      preferredSelectedNames.length ? preferredSelectedNames : friendList.slice(0, inviteLimit).map((item) => item.name),
    )
    const players = friendList.map((item) => toPlayerItem(item, selectedNameSet.has(item.name)))
    const normalizedPlayers = players.map((item, index, list) => {
      const selected = item.selected && countSelected(list.slice(0, index).concat({ ...item, selected: true })) <= inviteLimit
      return {
        ...item,
        selected,
      }
    })

    const selectedPlayers = normalizedPlayers
      .filter((item) => item.selected)
      .slice(0, inviteLimit)
      .map((item) => item.name)
    const strictSelectedSet = new Set(selectedPlayers)
    const strictPlayers = normalizedPlayers.map((item) => ({
      ...item,
      selected: strictSelectedSet.has(item.name),
    }))
    const filteredPlayers = this.filterPlayers(strictPlayers, this.data.searchKeyword)

    this.setData({
      createCandidateName: this.resolveCreateCandidate(this.data.searchKeyword, this.data.searchMatches),
      favoritePlayers: strictPlayers.slice(0, 5).map((item) => ({
        id: item.id,
        name: item.name,
        avatarUrl: item.avatarUrl,
      })),
      filteredPlayers,
      inviteLimit,
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

    if (!current.selected && this.data.selectedCount >= this.data.inviteLimit) {
      this.showToast(`还需邀请 ${this.data.inviteLimit} 位成员`)
      return
    }

    const players = this.data.players.map((item) =>
      item.name === name ? { ...item, selected: !item.selected } : item,
    )

    this.setData({
      createCandidateName: this.resolveCreateCandidate(this.data.searchKeyword, this.data.searchMatches),
      filteredPlayers: this.filterPlayers(players, this.data.searchKeyword),
      players,
      selectedCount: countSelected(players),
    })
  },

  async handleSearchInput(event) {
    const searchKeyword = event.detail.value || ''
    const searchMatches = searchKeyword.trim() ? await searchRegisteredUsers(searchKeyword) : []

    this.setData({
      createCandidateName: this.resolveCreateCandidate(searchKeyword, searchMatches),
      filteredPlayers: this.filterPlayers(this.data.players, searchKeyword),
      searchMatches,
      searchKeyword,
    })
  },

  async handleAddRegisteredTap(event) {
    const { profileId, name } = event.currentTarget.dataset as { name: string; profileId: string }
    const created = await addWineFriendByProfile(profileId, name, '已从注册用户添加')
    const canSelect = this.data.selectedCount < this.data.inviteLimit
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
      createCandidateName: this.resolveCreateCandidate(this.data.searchKeyword, searchMatches),
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

  handleSelectAllTap() {
    const players = this.data.players.map((item, index) => ({
      ...item,
      selected: index < this.data.inviteLimit,
    }))

    this.setData({
      createCandidateName: this.resolveCreateCandidate(this.data.searchKeyword, this.data.searchMatches),
      filteredPlayers: this.filterPlayers(players, this.data.searchKeyword),
      players,
      selectedCount: countSelected(players),
    })
  },

  async handleNextTap() {
    if (this.data.selectedCount > this.data.inviteLimit) {
      this.showToast(`最多预选 ${this.data.inviteLimit} 位成员`)
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

    try {
      wx.showLoading({
        title: '正在创建聚会',
        mask: true,
      })

      await touchWineFriends(selectedPlayers)

      const runtime = getSessionRuntime()
      let nextRuntimePatch: {
        inviteCode: string
        playerCount: number
        selectedPlayers: SessionParticipant[]
        sessionId: string
        sessionName: string
        templateImageUrl: string
        templateName: string
      } = {
        inviteCode: runtime.inviteCode || '',
        playerCount: this.data.playerLimit,
        selectedPlayers,
        sessionId: runtime.sessionId || '',
        sessionName: runtime.sessionName,
        templateImageUrl: runtime.templateImageUrl || '',
        templateName: runtime.templateName || '',
      }

      if (runtime.sessionId) {
        await updateManagedSession(runtime.sessionId, {
          hostAvatarUrl: runtime.currentUser?.avatarUrl,
          hostName: runtime.currentUser?.name,
          hostProfileId: runtime.currentUser?.id,
          playerCount: this.data.playerLimit,
          selectedPlayers,
          sessionName: runtime.sessionName,
          templateImageUrl: runtime.templateImageUrl,
          templateName: runtime.templateName,
        })
      } else {
        const created = await createManagedSession({
          hostAvatarUrl: runtime.currentUser?.avatarUrl,
          hostName: runtime.currentUser?.name,
          hostProfileId: runtime.currentUser?.id,
          playerCount: this.data.playerLimit,
          selectedPlayers,
          sessionName: runtime.sessionName,
          source: '直接创建',
          state: '等待开局',
          templateImageUrl: runtime.templateImageUrl,
          templateName: runtime.templateName,
        })
        nextRuntimePatch = {
          inviteCode: created.inviteCode,
          playerCount: created.playerCount,
          selectedPlayers: created.joinStatusPlayers.map((item) => ({
            avatarUrl: item.avatarUrl,
            name: item.name,
            profileId: item.profileId || '',
            status: item.status || '',
          })),
          sessionId: created.id,
          sessionName: created.sessionName,
          templateImageUrl: created.templateImageUrl || runtime.templateImageUrl || '',
          templateName: created.templateName || runtime.templateName || '',
        }
      }

      setSessionRuntime(nextRuntimePatch)

      wx.redirectTo({
        url: '/pages/invite-group/index',
        fail: () => {
          wx.reLaunch({ url: '/pages/invite-group/index' })
        },
      })
    } catch (error) {
      wx.showToast({
        title: error instanceof Error ? error.message : '聚会创建失败',
        icon: 'none',
      })
    } finally {
      wx.hideLoading()
    }
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

  resolveCreateCandidate(keyword: string, searchMatches: SearchUserResult[]) {
    const trimmed = keyword.trim()

    if (!trimmed) {
      return ''
    }

    return searchMatches.length ? '' : trimmed
  },
})

export {}
