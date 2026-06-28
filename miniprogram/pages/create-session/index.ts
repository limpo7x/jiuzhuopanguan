import { createManagedSession } from '../../services/operations'
import { clearSessionRuntime, setSessionRuntime } from '../../utils/session'
import { disableSessionLeaveAlert, enableSessionLeaveAlert } from '../../utils/session-exit'
import { ensureUserAuthorized } from '../../utils/social'

interface NamePreset {
  active?: boolean
  name: string
  subtitle: string
}

interface CreateSessionState {
  currentTimeText: string
  playerCount: number
  sessionName: string
  sessionNamePresets: NamePreset[]
  sessionSubtitle: string
}

interface CreateSessionMethods {
  handleBackTap: () => void
  handleSessionNameInput: (event: WechatMiniprogram.Input) => void
  handleSessionSubtitleInput: (event: WechatMiniprogram.Input) => void
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

const normalizeSessionCopy = (value: unknown, maxLength: number) =>
  (typeof value === 'string' ? value : '').replace(/\s+/g, ' ').trim().slice(0, maxLength)

Page<CreateSessionState, CreateSessionMethods>({
  data: {
    currentTimeText: formatCreateTimeText(),
    playerCount: 2,
    sessionName: '今晚的聚会',
    sessionNamePresets: [
      { active: true, name: '今晚的聚会', subtitle: '把今晚的开心和精彩瞬间都记录下来' },
      { name: '朋友小聚', subtitle: '朋友见面，把快乐留在同一场回忆里' },
      { name: '生日聚会', subtitle: '一起庆祝这个值得记住的特别时刻' },
      { name: '老友见面', subtitle: '好久不见，今天继续留下新的故事' },
      { name: '团建聚会', subtitle: '一起放松，也一起记住团队高光' },
      { name: '周末小聚', subtitle: '周末见面，把轻松时刻装进相册' },
      { name: '家庭聚会', subtitle: '一家人相聚，记录温暖的团圆时光' },
      { name: '聚会记录', subtitle: '照片、时间线和回忆都在这里同步' },
    ],
    sessionSubtitle: '把今晚的开心和精彩瞬间都记录下来',
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
      sessionName: normalizeSessionCopy(event.detail.value, 16),
      sessionNamePresets: this.data.sessionNamePresets.map((item) => ({ ...item, active: false })),
    })
  },

  handleSessionSubtitleInput(event) {
    this.setData({
      sessionSubtitle: normalizeSessionCopy(event.detail.value, 32),
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
      sessionSubtitle: sessionNamePresets.find((item) => item.name === name)?.subtitle || '',
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

    const sessionName = normalizeSessionCopy(this.data.sessionName, 16)
    const sessionSubtitle = normalizeSessionCopy(this.data.sessionSubtitle, 32)
    if (!sessionName || !sessionSubtitle) {
      wx.showToast({
        title: !sessionName ? '请填写聚会标题' : '请填写聚会副标题',
        icon: 'none',
      })
      return
    }

    try {
      wx.showLoading({
        title: '正在创建',
        mask: true,
      })

      clearSessionRuntime()
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
        sessionSubtitle,
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
        subtitle: sessionSubtitle,
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
        sessionSubtitle: created.subtitle || sessionSubtitle,
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
})

export {}
