import { getTemplateConfig, getUserCommerceState, getMembershipCatalog, unlockTemplateByAd, type TemplateFilter, type TemplateItem } from '../../services/content'

interface ProFilter extends TemplateFilter {
  active?: boolean
}

interface ProTemplate extends TemplateItem {
  accessText: string
  locked: boolean
}

interface PremiumTemplatesState {
  activeFilterId: string
  filters: ProFilter[]
  membershipActive: boolean
  membershipEnabled: boolean
  pendingTemplateId: string
  templates: TemplateItem[]
  templateUnlockProgress: Record<string, number>
  templateUnlockRequiredViews: number
  unlockProgressText: string
  unlockTitle: string
  unlockedTemplateIds: string[]
  visibleTemplates: ProTemplate[]
}

interface PremiumTemplatesMethods {
  applyVisibleTemplates: () => void
  handleFilterTap: (event: WechatMiniprogram.BaseEvent) => void
  handleTemplateTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handleUnlockTap: () => void
  loadCommerceState: () => Promise<void>
  loadRemoteConfig: () => Promise<void>
  loadMembershipConfig: () => Promise<void>
}

const DEFAULT_FILTERS: ProFilter[] = []

const DEFAULT_TEMPLATES: TemplateItem[] = []

Page<PremiumTemplatesState, PremiumTemplatesMethods>({
  data: {
    activeFilterId: 'all',
    filters: DEFAULT_FILTERS,
    membershipActive: false,
    membershipEnabled: false,
    pendingTemplateId: '',
    templates: DEFAULT_TEMPLATES,
    templateUnlockProgress: {},
    templateUnlockRequiredViews: 0,
    unlockProgressText: '',
    unlockTitle: '',
    unlockedTemplateIds: [],
    visibleTemplates: DEFAULT_TEMPLATES.map((item) => ({
      ...item,
      accessText: '0/3 次开局',
      locked: true,
    })),
  },

  async onLoad() {
    await Promise.all([this.loadRemoteConfig(), this.loadCommerceState(), this.loadMembershipConfig()])
  },

  async loadRemoteConfig() {
    try {
      const config = await getTemplateConfig()
      const filters = (config.filters || []).map((item, index) => ({
        ...item,
        active: index === 0,
      }))

      this.setData(
        {
          activeFilterId: filters[0]?.id || 'all',
          filters,
          templates: config.templates || [],
          unlockProgressText: config.unlockCard?.progressText || '',
          unlockTitle: config.unlockCard?.title || '',
        },
        this.applyVisibleTemplates,
      )
      return
    } catch {
      // keep local defaults
    }

    this.applyVisibleTemplates()
  },

  async loadCommerceState() {
    try {
      const state = await getUserCommerceState()
      const progressValues = Object.values(state.templateUnlockProgress || {})
      const maxProgress = progressValues.length ? Math.max(...progressValues) : 0
      this.setData(
        {
          membershipActive: Boolean(state.membership?.active),
          templateUnlockProgress: state.templateUnlockProgress || {},
          templateUnlockRequiredViews: state.templateUnlockRequiredViews || 0,
          unlockProgressText: `${maxProgress}/${state.templateUnlockRequiredViews || 3}`,
          unlockedTemplateIds: state.unlockedTemplateIds || [],
        },
        this.applyVisibleTemplates,
      )
    } catch (error) {
      void error
      this.setData(
        {
          membershipActive: false,
          templateUnlockProgress: {},
          templateUnlockRequiredViews: 0,
          unlockedTemplateIds: [],
        },
        this.applyVisibleTemplates,
      )
    }
  },

  async loadMembershipConfig() {
    try {
      const catalog = await getMembershipCatalog()
      this.setData({ membershipEnabled: catalog.membershipEnabled !== false }, this.applyVisibleTemplates)
    } catch {
      // 默认保持开启
      this.setData({ membershipEnabled: false }, this.applyVisibleTemplates)
    }
  },

  applyVisibleTemplates() {
    const activeFilterId = this.data.activeFilterId
    const visibleTemplates =
      activeFilterId === 'all'
        ? this.data.templates
        : this.data.templates.filter((item) => item.filterId === activeFilterId)
    const effectiveMembershipActive = this.data.membershipEnabled && this.data.membershipActive

    this.setData({
      visibleTemplates: visibleTemplates.map((item) => {
        const isFree = Number(item.cost) === 0
        const unlocked = isFree || effectiveMembershipActive || this.data.unlockedTemplateIds.includes(item.id)
        const progress = this.data.templateUnlockProgress[item.id] || 0
        return {
          ...item,
          accessText: isFree ? '免费可用' : unlocked ? '可用' : `${progress}/${this.data.templateUnlockRequiredViews} 次开局`,
          locked: !unlocked,
        }
      }),
    })
  },

  handleFilterTap(event) {
    const { id } = event.currentTarget.dataset as { id: string }
    if (!id || id === this.data.activeFilterId) {
      return
    }

    this.setData(
      {
        activeFilterId: id,
        filters: this.data.filters.map((item) => ({
          ...item,
          active: item.id === id,
        })),
      },
      this.applyVisibleTemplates,
    )
  },

  async handleTemplateTap(event) {
    const { id, title } = event.currentTarget.dataset as { id?: string; title: string }
    const target = this.data.visibleTemplates.find((item) => item.id === id)
    if (!target) {
      return
    }

    if (!target.locked) {
      wx.navigateTo({
        url: `/pages/create-session/index?template=${encodeURIComponent(title)}`,
      })
      return
    }

    if (this.data.pendingTemplateId) {
      return
    }

    this.setData({ pendingTemplateId: target.id })
    try {
      const state = await unlockTemplateByAd(target.id)
      const unlocked = (state.unlockedTemplateIds || []).includes(target.id)
      const progressValues = Object.values(state.templateUnlockProgress || {})
      const maxProgress = progressValues.length ? Math.max(...progressValues) : 0
      this.setData(
        {
          membershipActive: Boolean(state.membership?.active),
          pendingTemplateId: '',
          templateUnlockProgress: state.templateUnlockProgress || {},
          templateUnlockRequiredViews: state.templateUnlockRequiredViews || 0,
          unlockProgressText: `${maxProgress}/${state.templateUnlockRequiredViews || 3}`,
          unlockedTemplateIds: state.unlockedTemplateIds || [],
        },
        this.applyVisibleTemplates,
      )
      wx.showToast({ title: unlocked ? '模板已解锁' : '进度已更新', icon: 'success' })
      if (unlocked) {
        wx.navigateTo({
          url: `/pages/create-session/index?template=${encodeURIComponent(title)}`,
        })
      }
    } catch (error) {
      this.setData({ pendingTemplateId: '' })
      wx.showToast({ title: error instanceof Error ? error.message : '解锁失败', icon: 'none' })
    }
  },

  handleUnlockTap() {
    if (!this.data.membershipEnabled) {
      wx.showToast({
        title: '权益入口暂未开放',
        icon: 'none',
      })
      return
    }
    wx.navigateTo({
      url: '/pages/member-center/index',
    })
  },
})

export {}
