import { getSessionRuntime, setSessionRuntime } from '../../utils/session'

interface JoinAvatar {
  active?: boolean
  id: string
  url: string
}

interface JoinClaimState {
  avatars: JoinAvatar[]
}

interface JoinClaimMethods {
  handleAvatarTap: (event: WechatMiniprogram.BaseEvent) => void
  handleJoinTap: () => void
}

Page<JoinClaimState, JoinClaimMethods>({
  data: {
    avatars: [
      { id: '1', url: '/assets/avatars/avatar-1.png' },
      { id: '2', url: '/assets/avatars/avatar-2.png' },
      { id: '3', url: '/assets/avatars/avatar-3.png', active: true },
      { id: '4', url: '/assets/avatars/avatar-4.png' },
      { id: '5', url: '/assets/avatars/avatar-1.png' },
      { id: '6', url: '/assets/avatars/avatar-2.png' },
      { id: '7', url: '/assets/avatars/avatar-3.png' },
      { id: '8', url: '/assets/avatars/avatar-4.png' },
      { id: '9', url: '/assets/avatars/avatar-1.png' },
      { id: '10', url: '/assets/avatars/avatar-2.png' },
    ],
  },

  handleAvatarTap(event) {
    const { id } = event.currentTarget.dataset as { id: string }
    const avatars = this.data.avatars.map((item) => ({
      ...item,
      active: item.id === id,
    }))

    this.setData({ avatars })
  },

  handleJoinTap() {
    const activeAvatar = this.data.avatars.find((item) => item.active) || this.data.avatars[0]
    const runtime = getSessionRuntime()
    const matchedPlayer =
      runtime.selectedPlayers.find((item) => item.avatarUrl === activeAvatar.url) ||
      runtime.selectedPlayers[0] || {
        name: `酒友${activeAvatar.id}`,
        avatarUrl: activeAvatar.url,
      }

    setSessionRuntime({
      currentUser: {
        id: `viewer-${activeAvatar.id}`,
        name: matchedPlayer.name,
        avatarUrl: matchedPlayer.avatarUrl,
      },
      isJudge: false,
    })

    wx.navigateTo({
      url: '/pages/waiting-room/index?role=viewer',
    })
  },
})

export {}
