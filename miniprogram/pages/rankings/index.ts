import {
  createManagedMomentNomination,
  getManagedMomentNominationEligibility,
  getManagedTodayRanking,
  type ManagedRankingCategory,
  type ManagedRankingItem,
} from '../../services/operations'
import { ensureUserAuthorized } from '../../utils/social'

interface RankingCategoryOption {
  label: string
  value: ManagedRankingCategory
}

interface RankingsState {
  activeCategory: ManagedRankingCategory
  categories: RankingCategoryOption[]
  dateText: string
  emptyText: string
  errorText: string
  items: ManagedRankingItem[]
  loading: boolean
  nominatingMomentId: string
  skeletonRows: number[]
  subtitle: string
}

interface RankingsMethods {
  handleBackTap: () => void
  handleCategoryTap: (event: WechatMiniprogram.CustomEvent<{ category?: ManagedRankingCategory }>) => Promise<void>
  handleFeatureZoneTap: (event: WechatMiniprogram.BaseEvent) => void
  handleImageTap: (event: WechatMiniprogram.CustomEvent<{ imageUrl?: string }>) => void
  handleNominateTap: (event: WechatMiniprogram.CustomEvent<{ momentId?: string }>) => Promise<void>
  handleRefreshTap: () => Promise<void>
  handleTabTap: (event: WechatMiniprogram.BaseEvent) => void
  loadRanking: () => Promise<void>
  showToast: (message: string) => void
}

const rankingCategories: RankingCategoryOption[] = [
  { label: '人气榜', value: 'today_highlight' },
  { label: '欢乐榜', value: 'today_funny' },
  { label: '回忆榜', value: 'today_visual' },
  { label: '开场照', value: 'best_opening' },
  { label: '收尾照', value: 'best_closing' },
  { label: '好友推荐', value: 'today_debt' },
]

const formatRankingDate = (date = '') => date || '今日'
const TAB_ROUTES: Record<string, string> = {
  home: '/pages/index/index',
  tools: '/pages/tools/index',
  rankings: '/pages/rankings/index',
  me: '/pages/me/index',
}

const normalizeRankingErrorMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : ''
  if (/not\s*found|404|no ranking/i.test(message)) {
    return '当前回忆榜还没有照片'
  }
  if (/unauthorized|401/i.test(message)) {
    return '登录后可查看今日回忆榜'
  }
  return message || '榜单加载失败，请稍后重试'
}

Page<RankingsState, RankingsMethods>({
  data: {
    activeCategory: 'today_highlight',
    categories: rankingCategories,
    dateText: '今日',
    emptyText: '当前榜单还没有推举',
    errorText: '',
    items: [],
    loading: true,
    nominatingMomentId: '',
    skeletonRows: [1, 2, 3],
    subtitle: '看看今天哪些回忆被大家记住',
  },

  async onLoad(query) {
    const category = typeof query?.category === 'string' ? query.category : ''
    const activeCategory = rankingCategories.some((item) => item.value === category)
      ? (category as ManagedRankingCategory)
      : 'today_highlight'
    const profile = await ensureUserAuthorized(`/pages/rankings/index?category=${encodeURIComponent(activeCategory)}`)

    if (!profile) {
      this.setData({
        emptyText: '登录后可查看今日回忆榜',
        errorText: '',
        items: [],
        loading: false,
      })
      return
    }

    this.setData({ activeCategory })
    await this.loadRanking()
  },

  async loadRanking() {
    this.setData({
      errorText: '',
      loading: true,
    })

    try {
      const ranking = await getManagedTodayRanking(this.data.activeCategory, 50)
      this.setData({
        dateText: formatRankingDate(ranking.date),
        emptyText: '今天还没有上榜回忆',
        errorText: '',
        items: ranking.items,
        loading: false,
      })
    } catch (error) {
      const message = normalizeRankingErrorMessage(error)
      this.setData({
        emptyText: message,
        errorText: message,
        items: [],
        loading: false,
      })
      this.showToast(message)
    }
  },

  async handleCategoryTap(event) {
    const category = event.currentTarget.dataset.category
    if (!category || category === this.data.activeCategory) {
      return
    }
    this.setData({
      activeCategory: category,
      items: [],
    })
    await this.loadRanking()
  },

  async handleRefreshTap() {
    await this.loadRanking()
  },

  async handleNominateTap(event) {
    const momentId = event.currentTarget.dataset.momentId || ''
    if (!momentId || this.data.nominatingMomentId) {
      return
    }

    this.setData({ nominatingMomentId: momentId })
    try {
      const eligibility = await getManagedMomentNominationEligibility(momentId, this.data.activeCategory)
      if (!eligibility.eligible) {
        this.showToast(eligibility.reason || '当前不能推举')
        return
      }

      const confirmResult = await new Promise<WechatMiniprogram.ShowModalSuccessCallbackResult>((resolve) => {
        wx.showModal({
          title: '确认推举',
          content: `本次将消耗 ${eligibility.pointsCost} 积分`,
          confirmText: '推举',
          cancelText: '取消',
          success: resolve,
          fail: () => resolve({ cancel: true, confirm: false, content: '', errMsg: 'showModal:fail' }),
        })
      })
      if (!confirmResult.confirm) {
        return
      }

      await createManagedMomentNomination(momentId, {
        category: this.data.activeCategory,
        clientNominationId: `ranking-${momentId}-${Date.now()}`,
      })
      this.showToast('推举成功')
      await this.loadRanking()
    } catch (error) {
      this.showToast(error instanceof Error ? error.message : '推举失败')
    } finally {
      this.setData({ nominatingMomentId: '' })
    }
  },

  handleImageTap(event) {
    const imageUrl = event.currentTarget.dataset.imageUrl || ''
    if (!imageUrl) {
      return
    }
    wx.previewImage({
      current: imageUrl,
      urls: [imageUrl],
    })
  },

  handleBackTap() {
    wx.navigateBack({
      fail: () => {
        wx.redirectTo({
          url: '/pages/index/index',
          fail: () => wx.reLaunch({ url: '/pages/index/index' }),
        })
      },
    })
  },

  handleFeatureZoneTap(event) {
    const zone = event.currentTarget.dataset.zone || 'points'
    wx.navigateTo({
      url: `/pages/feature-zones/index?zone=${encodeURIComponent(zone)}`,
    })
  },

  handleTabTap(event) {
    const { tab } = event.currentTarget.dataset as { tab: string }
    const target = TAB_ROUTES[tab]
    if (!target || tab === 'rankings') {
      return
    }
    wx.redirectTo({
      url: target,
      fail: () => wx.reLaunch({ url: target }),
    })
  },

  showToast(message) {
    wx.showToast({
      title: message,
      icon: 'none',
    })
  },
})
