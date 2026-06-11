import { createManagedSession } from '../../services/operations'
import { setSessionRuntime } from '../../utils/session'
import { ensureUserAuthorized } from '../../utils/social'

interface NamePreset {
  active?: boolean
  name: string
}

interface TemplateItem {
  active?: boolean
  id: string
  imageUrl: string
  name: string
}

interface CreateSessionState {
  playerCount: number
  sessionName: string
  sessionNamePresets: NamePreset[]
  templates: TemplateItem[]
}

interface CreateSessionMethods {
  handleMoreTemplatesTap: () => void
  handleSessionNameInput: (event: WechatMiniprogram.Input) => void
  handleNextTap: () => Promise<void>
  handlePlayerCountTap: (event: WechatMiniprogram.BaseEvent) => void
  handlePresetTap: (event: WechatMiniprogram.BaseEvent) => void
  handleTemplateTap: (event: WechatMiniprogram.BaseEvent) => void
}

Page<CreateSessionState, CreateSessionMethods>({
  data: {
    playerCount: 2,
    sessionName: '',
    sessionNamePresets: [
      { name: '周五快乐局' },
      { name: '同生共史局' },
      { name: '周六快乐局' },
      { name: '老友厮沙局' },
      { name: '娱乐小美局' },
    ],
    templates: [],
  },

  async onLoad(query) {
    const profile = await ensureUserAuthorized('/pages/create-session/index')
    if (!profile) {
      return
    }

    const templateName = query?.template
    if (!templateName) {
      return
    }

    const decodedName = decodeURIComponent(templateName)
    const templates = this.data.templates.map((item) => ({
      ...item,
      active: item.name === decodedName,
    }))

    this.setData({
      sessionName: `${decodedName}开局`,
      templates,
    })
  },

  handleSessionNameInput(event) {
    this.setData({ sessionName: String(event.detail.value || '').trim() })
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

  handleTemplateTap(event) {
    const { id } = event.currentTarget.dataset as { id: string }
    const templates = this.data.templates.map((item) => ({
      ...item,
      active: item.id === id,
    }))

    this.setData({ templates })
  },

  async handleNextTap() {
    const profile = await ensureUserAuthorized('/pages/create-session/index')
    if (!profile) {
      return
    }

    const activeTemplate = this.data.templates.find((item) => item.active) || this.data.templates[0]

    try {
      wx.showLoading({
        title: '正在创建',
        mask: true,
      })

      const created = await createManagedSession({
        hostAvatarUrl: profile.avatarUrl,
        hostName: profile.name,
        hostProfileId: profile.id,
        playerCount: Math.max(2, this.data.playerCount || 2),
        sessionName: this.data.sessionName,
        source: '直接创建',
        state: '等待开局',
        templateName: activeTemplate?.name || '',
      })

      setSessionRuntime({
        currentUser: {
          avatarUrl: profile.avatarUrl,
          id: profile.id,
          name: profile.name,
        },
        inviteCode: created.inviteCode,
        isJudge: true,
        playerCount: Math.max(2, this.data.playerCount || 2),
        playerReactions: [],
        playerStats: [],
        reportId: '',
        selectedPlayers: created.joinStatusPlayers,
        sessionId: created.id,
        sessionName: created.sessionName,
        startedAt: 0,
        templateName: activeTemplate?.name || '',
      })

      wx.navigateTo({
        url: '/pages/session-rules/index',
      })
    } catch (error) {
      wx.showToast({
        title: error instanceof Error ? error.message : '创建酒局失败',
        icon: 'none',
      })
    } finally {
      wx.hideLoading()
    }
  },

  handleMoreTemplatesTap() {
    wx.navigateTo({
      url: '/pages/premium-templates/index',
    })
  },
})

export {}
