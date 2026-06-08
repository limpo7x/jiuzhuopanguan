import { getSessionRuntime, setSessionRuntime } from '../../utils/session'
import { avatarAsset } from '../../config/assets'

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
      { id: '1', url: avatarAsset(1) },
      { id: '2', url: avatarAsset(2) },
      { id: '3', url: avatarAsset(3), active: true },
      { id: '4', url: avatarAsset(4) },
      { id: '5', url: avatarAsset(1) },
      { id: '6', url: avatarAsset(2) },
      { id: '7', url: avatarAsset(3) },
      { id: '8', url: avatarAsset(4) },
      { id: '9', url: avatarAsset(1) },
      { id: '10', url: avatarAsset(2) },
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
