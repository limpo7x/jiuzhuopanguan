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

const DEFAULT_FILTERS: ProFilter[] = [
  { id: 'all', name: '全部', active: true },
  { id: 'friendship', name: '友情题材' },
  { id: 'classic', name: '经典模板' },
  { id: 'party', name: '酒局场景' },
]

const DEFAULT_TEMPLATES: TemplateItem[] = [
  { id: 'tpl-friendship', filterId: 'friendship', title: '友情题材', meta: '28 个局例 · 2 位主创', cost: 800, imageUrl: '' },
  { id: 'tpl-classic', filterId: 'classic', title: '经典局', meta: '26 个局例 · 适合新手入门', cost: 800, imageUrl: '' },
  { id: 'tpl-party', filterId: 'party', title: '欢快氛围', meta: '32 个局例 · 轻松开场', cost: 800, imageUrl: '' },
  { id: 'tpl-birthday', filterId: 'party', title: '生日聚局', meta: '18 个局例 · 热闹有礼', cost: 800, imageUrl: '' },
]

Page<PremiumTemplatesState, PremiumTemplatesMethods>({
  data: {
    activeFilterId: 'all',
    filters: DEFAULT_FILTERS,
    membershipActive: false,
    membershipEnabled: true,
    pendingTemplateId: '',
    templates: DEFAULT_TEMPLATES,
    templateUnlockProgress: {},
    templateUnlockRequiredViews: 3,
    unlockProgressText: '0/3',
    unlockTitle: '会员 PRO 模板',
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
      const filters = (config.filters?.length ? config.filters : DEFAULT_FILTERS).map((item, index) => ({
        ...item,
        active: index === 0,
      }))

      this.setData(
        {
          activeFilterId: filters[0]?.id || 'all',
          filters,
          templates: config.templates?.length ? config.templates : DEFAULT_TEMPLATES,
          unlockProgressText: config.unlockCard?.progressText || '0/3',
          unlockTitle: config.unlockCard?.title || '会员 PRO 模板',
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
          templateUnlockRequiredViews: state.templateUnlockRequiredViews || 3,
          unlockProgressText: `${maxProgress}/${state.templateUnlockRequiredViews || 3}`,
          unlockedTemplateIds: state.unlockedTemplateIds || [],
        },
        this.applyVisibleTemplates,
      )
    } catch {
      // keep default state
    }
  },

  async loadMembershipConfig() {
    try {
      const catalog = await getMembershipCatalog()
      this.setData({ membershipEnabled: catalog.membershipEnabled !== false }, this.applyVisibleTemplates)
    } catch {
      // 默认保持开启
      this.setData({ membershipEnabled: true }, this.applyVisibleTemplates)
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
        const unlocked = effectiveMembershipActive || this.data.unlockedTemplateIds.includes(item.id)
        const progress = this.data.templateUnlockProgress[item.id] || 0
        return {
          ...item,
          accessText: unlocked ? '可用' : `${progress}/${this.data.templateUnlockRequiredViews} 次开局`,
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
          templateUnlockRequiredViews: state.templateUnlockRequiredViews || 3,
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
        title: '闪享会员入口已关闭',
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
