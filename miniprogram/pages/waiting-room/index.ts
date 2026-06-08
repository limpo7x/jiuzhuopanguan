import { getSessionRuntime, setSessionRuntime, type SessionParticipant } from '../../utils/session'

interface JoinedPlayer {
  name: string
  avatarUrl: string
}

interface WaitingRoomState {
  emptySeats: number[]
  isJudge: boolean
  joinedCount: number
  joinedPlayers: JoinedPlayer[]
  playerCount: number
  sessionName: string
}

interface WaitingRoomMethods {
  handleCodeTap: () => void
  handleInviteTap: () => void
  handleOverviewTap: () => void
  handleStartTap: () => void
  openPage: (url: string) => void
}

Page<WaitingRoomState, WaitingRoomMethods>({
  data: {
    joinedCount: 4,
    isJudge: true,
    joinedPlayers: [
      { name: '阿浩', avatarUrl: '/assets/avatars/avatar-1.png' },
      { name: '小熊', avatarUrl: '/assets/avatars/avatar-2.png' },
      { name: 'Mika', avatarUrl: '/assets/avatars/avatar-3.png' },
      { name: '可可', avatarUrl: '/assets/avatars/avatar-4.png' },
    ],
    emptySeats: [1, 2],
    playerCount: 6,
    sessionName: '今晚聚会不醉不归',
  },

  onLoad(query) {
    const runtime = getSessionRuntime()
    const isJudge = query?.role === 'viewer' ? false : runtime.isJudge
    const playerCount = Math.max(2, runtime.playerCount || 6)
    const selectedPlayers = runtime.selectedPlayers?.length
      ? runtime.selectedPlayers
      : (this.data.joinedPlayers as SessionParticipant[])
    const joinedCount = Math.min(playerCount, Math.min(selectedPlayers.length, 4))
    const joinedPlayers = selectedPlayers.slice(0, joinedCount)
    const emptySeats = Array.from({ length: Math.max(playerCount - joinedCount, 0) }, (_, index) => index + 1)

    this.setData({
      emptySeats,
      isJudge,
      joinedCount,
      joinedPlayers,
      playerCount,
      sessionName: runtime.sessionName,
    })
  },

  handleInviteTap() {
    this.openPage('/pages/invite-group/index')
  },

  handleCodeTap() {
    this.openPage('/pages/share-preview/index')
  },

  handleOverviewTap() {
    this.openPage('/pages/flow-overview/index')
  },

  handleStartTap() {
    const runtime = setSessionRuntime({
      isJudge: this.data.isJudge,
      startedAt: getSessionRuntime().startedAt || Date.now(),
    })

    this.openPage(`/pages/live-record/index?role=${this.data.isJudge ? 'judge' : 'viewer'}&sessionName=${encodeURIComponent(runtime.sessionName)}`)
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
