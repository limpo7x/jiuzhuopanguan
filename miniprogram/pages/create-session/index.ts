import { getTemplateConfigFast } from '../../services/content'
import { clearSessionRuntime, setSessionRuntime } from '../../utils/session'
import { ensureUserAuthorized } from '../../utils/social'

interface NamePreset {
  active?: boolean
  name: string
}

interface TemplateItem {
  active?: boolean
  id: string
  imageUrl: string
  meta: string
  name: string
}

interface CreateSessionState {
  playerCount: number
  sessionName: string
  sessionNamePresets: NamePreset[]
  templates: TemplateItem[]
  templatesLoading: boolean
}

interface CreateSessionMethods {
  handleMoreTemplatesTap: () => void
  loadTemplates: (selectedName?: string) => Promise<void>
  handleSessionNameInput: (event: WechatMiniprogram.Input) => void
  handleNextTap: () => Promise<void>
  handlePlayerCountTap: (event: WechatMiniprogram.BaseEvent) => void
  handlePresetTap: (event: WechatMiniprogram.BaseEvent) => void
  handleTemplateTap: (event: WechatMiniprogram.BaseEvent) => void
}

const TEMPLATE_CACHE_KEY = 'create-session-template-cache-v1'

const mapFreeTemplates = (templates: Array<{ cost: number; id: string; imageUrl: string; meta: string; title: string }>, selectedName = '') =>
  (templates || [])
    .filter((item) => Number(item.cost) === 0)
    .slice(0, 8)
    .map<TemplateItem>((item, index) => ({
      id: item.id || `template-${index + 1}`,
      imageUrl: item.imageUrl || '',
      meta: item.meta || '轻松开局，适合朋友小聚',
      name: item.title || item.id || `模板 ${index + 1}`,
      active: selectedName ? item.title === selectedName : index === 0,
    }))

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
    templatesLoading: true,
  },

  async onLoad(query) {
    const profile = await ensureUserAuthorized('/pages/create-session/index')
    if (!profile) {
      return
    }

    const templateName = query?.template
    const decodedName = templateName ? decodeURIComponent(templateName) : ''
    await this.loadTemplates(decodedName)
    if (decodedName) {
      this.setData({
        sessionName: `${decodedName}开局`,
      })
    }
  },

  async loadTemplates(selectedName = '') {
    const cachedTemplates = wx.getStorageSync(TEMPLATE_CACHE_KEY) as TemplateItem[] | undefined
    if (Array.isArray(cachedTemplates) && cachedTemplates.length) {
      const activeId = selectedName ? cachedTemplates.find((item) => item.name === selectedName)?.id : cachedTemplates[0].id
      this.setData({
        templates: cachedTemplates.map((item, index) => ({
          ...item,
          active: activeId ? item.id === activeId : index === 0,
        })),
        templatesLoading: false,
      })
    } else {
      this.setData({ templatesLoading: true })
    }

    try {
      const config = await getTemplateConfigFast()
      const templates = mapFreeTemplates(config.templates || [], selectedName)
      wx.setStorageSync(
        TEMPLATE_CACHE_KEY,
        templates.map((item) => ({ ...item, active: false })),
      )
      this.setData({ templates, templatesLoading: false })
    } catch {
      this.setData({ templatesLoading: false })
    }
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
        sessionName: this.data.sessionName || activeTemplate?.name || '我的酒局',
        startedAt: 0,
        templateImageUrl: activeTemplate?.imageUrl || '',
        templateName: activeTemplate?.name || '',
      })

      wx.redirectTo({
        url: '/pages/session-rules/index',
        fail: () => {
          wx.reLaunch({ url: '/pages/session-rules/index' })
        },
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
