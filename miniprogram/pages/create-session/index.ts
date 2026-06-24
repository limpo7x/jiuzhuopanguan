import { createManagedSession } from '../../services/operations'
import { clearSessionRuntime, setSessionRuntime } from '../../utils/session'
import { disableSessionLeaveAlert, enableSessionLeaveAlert } from '../../utils/session-exit'
import { ensureUserAuthorized } from '../../utils/social'

interface NamePreset {
  active?: boolean
  name: string
}

interface CreateSessionState {
  currentTimeText: string
  playerCount: number
  sessionName: string
  sessionNamePresets: NamePreset[]
}

interface CreateSessionMethods {
  handleBackTap: () => void
  handleMoreTemplatesTap: () => void
  handleSessionNameInput: (event: WechatMiniprogram.Input) => void
  handleNextTap: () => Promise<void>
  handlePlayerCountTap: (event: WechatMiniprogram.BaseEvent) => void
  handlePresetTap: (event: WechatMiniprogram.BaseEvent) => void
}

const formatCreateTimeText = () => {
  const now = new Date()
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  return `今天 ${hour}:${minute}`
}

Page<CreateSessionState, CreateSessionMethods>({
  data: {
    currentTimeText: formatCreateTimeText(),
    playerCount: 2,
    sessionName: '',
    sessionNamePresets: [
      { name: '今晚的聚会' },
      { name: '朋友小聚' },
      { name: '生日聚会' },
      { name: '老友见面' },
      { name: '团建聚会' },
      { name: '周末小聚' },
      { name: '家庭聚会' },
      { name: '露营相册' },
    ],
  },

  async onLoad() {
    enableSessionLeaveAlert()

    const profile = await ensureUserAuthorized('/pages/create-session/index')
    if (!profile) {
      return
    }

    this.setData({ currentTimeText: formatCreateTimeText() })
  },

  onUnload() {
    disableSessionLeaveAlert()
  },

  handleBackTap() {
    wx.showModal({
      title: '离开创建？',
      content: '还没有保存第一张照片，这场聚会不会计入进行中，也不会出现在继续记录入口。',
      confirmText: '离开',
      cancelText: '继续创建',
      success: (result) => {
        if (!result.confirm) return
        disableSessionLeaveAlert()
        wx.navigateBack({
          fail: () => {
            wx.reLaunch({ url: '/pages/index/index' })
          },
        })
      },
    })
  },

  handleSessionNameInput(event) {
    this.setData({
      sessionName: String(event.detail.value || '').trim(),
      sessionNamePresets: this.data.sessionNamePresets.map((item) => ({ ...item, active: false })),
    })
  },

  handlePresetTap(event) {
    const { name } = event.currentTarget.dataset as { name: string }
    const sessionNamePresets = this.data.sessionNamePresets.map((item) => ({
      ...item,
      active: item.name === name,
    }))

    this.setData({
      sessionName: name,
      sessionNamePresets,
    })
  },

  handlePlayerCountTap(event) {
    const { action } = event.currentTarget.dataset as { action: 'minus' | 'plus' }
    const offset = action === 'minus' ? -1 : 1
    const next = Math.max(2, Math.min(12, this.data.playerCount + offset))

    this.setData({
      playerCount: next,
    })
  },

  async handleNextTap() {
    const profile = await ensureUserAuthorized('/pages/create-session/index')
    if (!profile) {
      return
    }

    try {
      wx.showLoading({
        title: '正在创建',
        mask: true,
      })

      clearSessionRuntime()
      const sessionName = this.data.sessionName || '今晚的聚会'
      setSessionRuntime({
        currentUser: {
          avatarUrl: profile.avatarUrl,
          id: profile.id,
          name: profile.name,
        },
        inviteCode: '',
        isJudge: true,
        playerCount: Math.max(2, this.data.playerCount || 2),
        playerReactions: [],
        playerStats: [],
        reportId: '',
        selectedPlayers: [],
        sessionId: '',
        sessionName,
        startedAt: 0,
        state: '待首拍',
        status: '待首拍',
      })

      const created = await createManagedSession({
        hostAvatarUrl: profile.avatarUrl,
        hostName: profile.name,
        hostProfileId: profile.id,
        playerCount: Math.max(2, this.data.playerCount || 2),
        selectedPlayers: [],
        sessionName,
        source: '快速创建',
        state: '邀请中',
      })

      setSessionRuntime({
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
      })

      wx.redirectTo({
        url: `/pages/invite-group/index?sessionId=${encodeURIComponent(created.id)}`,
        fail: () => {
          wx.reLaunch({ url: `/pages/invite-group/index?sessionId=${encodeURIComponent(created.id)}` })
        },
      })
    } catch (error) {
      wx.showToast({
        title: error instanceof Error ? error.message : '创建聚会失败',
        icon: 'none',
      })
    } finally {
      wx.hideLoading()
    }
  },

  handleMoreTemplatesTap() {
    wx.showToast({
      title: '高级设置暂未开放，当前可直接调整人数',
      icon: 'none',
    })
  },
})

export {}
