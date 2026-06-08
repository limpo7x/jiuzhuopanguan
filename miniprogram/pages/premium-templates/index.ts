import {
  getTemplateConfig,
  getUserCommerceState,
  unlockTemplateByAd,
  type TemplateFilter,
  type TemplateItem,
} from '../../services/content'
import { staticAsset } from '../../config/assets'

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
}

const DEFAULT_FILTERS: ProFilter[] = [
  { id: 'all', name: '全部', active: true },
  { id: 'friendship', name: '友情互损' },
  { id: 'classic', name: '经典惩罚' },
  { id: 'party', name: '聚会整活' },
]

const DEFAULT_TEMPLATES: TemplateItem[] = [
  { id: 'tpl-friendship', filterId: 'friendship', title: '友情互损', meta: '28 个玩法 · 适合死党局', cost: 800, imageUrl: staticAsset('toolbox-hero.png') },
  { id: 'tpl-classic', filterId: 'classic', title: '经典惩罚', meta: '26 个玩法 · 轻松不水局', cost: 800, imageUrl: staticAsset('party-hero.png') },
  { id: 'tpl-party', filterId: 'party', title: '整活大挑战', meta: '32 个玩法 · 气氛拉满', cost: 800, imageUrl: staticAsset('report-poster.png') },
  { id: 'tpl-birthday', filterId: 'party', title: '生日专属', meta: '18 个玩法 · 定制惊喜', cost: 800, imageUrl: staticAsset('image-process-hero.png') },
]

Page<PremiumTemplatesState, PremiumTemplatesMethods>({
  data: {
    activeFilterId: 'all',
    filters: DEFAULT_FILTERS,
    membershipActive: false,
    pendingTemplateId: '',
    templates: DEFAULT_TEMPLATES,
    templateUnlockProgress: {},
    templateUnlockRequiredViews: 3,
    unlockProgressText: '0/3',
    unlockTitle: '看激励视频解锁 PRO 模板',
    unlockedTemplateIds: [],
    visibleTemplates: DEFAULT_TEMPLATES.map((item) => ({
      ...item,
      accessText: '0/3 激励解锁',
      locked: true,
    })),
  },

  async onLoad() {
    await Promise.all([this.loadRemoteConfig(), this.loadCommerceState()])
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
          unlockTitle: config.unlockCard?.title || '看激励视频解锁 PRO 模板',
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

  applyVisibleTemplates() {
    const activeFilterId = this.data.activeFilterId
    const visibleTemplates =
      activeFilterId === 'all'
        ? this.data.templates
        : this.data.templates.filter((item) => item.filterId === activeFilterId)

    this.setData({
      visibleTemplates: visibleTemplates.map((item) => {
        const unlocked = this.data.membershipActive || this.data.unlockedTemplateIds.includes(item.id)
        const progress = this.data.templateUnlockProgress[item.id] || 0
        return {
          ...item,
          accessText: unlocked ? '已解锁' : `${progress}/${this.data.templateUnlockRequiredViews} 激励解锁`,
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
      wx.showToast({ title: unlocked ? '模板已解锁' : '已完成一次激励', icon: 'success' })
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
    wx.navigateTo({
      url: '/pages/member-center/index',
    })
  },
})

export {}
