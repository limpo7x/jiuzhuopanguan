import {
  getManagedTodayRanking,
  toggleManagedMomentLike,
  type ManagedRankingItem,
  type ManagedRankingPeriod,
} from '../../services/operations'
import { ensureUserAuthorized } from '../../utils/social'

interface RankingPeriodOption {
  label: string
  subtitle: string
  value: ManagedRankingPeriod
}

interface RankingsState {
  activePeriod: ManagedRankingPeriod
  dateText: string
  emptyText: string
  errorText: string
  items: ManagedRankingItem[]
  likingMomentId: string
  loading: boolean
  periods: RankingPeriodOption[]
  skeletonRows: number[]
  subtitle: string
}

interface RankingsMethods {
  handleBackTap: () => void
  handleFeatureZoneTap: (event: WechatMiniprogram.BaseEvent) => void
  handleImageTap: (event: WechatMiniprogram.CustomEvent<{ imageUrl?: string }>) => void
  handleLikeTap: (event: WechatMiniprogram.CustomEvent<{ momentId?: string }>) => Promise<void>
  handlePeriodTap: (event: WechatMiniprogram.CustomEvent<{ period?: ManagedRankingPeriod }>) => Promise<void>
  handleRefreshTap: () => Promise<void>
  handleTabTap: (event: WechatMiniprogram.BaseEvent) => void
  loadRanking: () => Promise<void>
  showToast: (message: string) => void
}

const rankingPeriods: RankingPeriodOption[] = [
  { label: '当日回忆榜', subtitle: '今日点赞 Top10', value: 'day' },
  { label: '本周最佳回忆', subtitle: '本周点赞 Top10', value: 'week' },
  { label: '本月回忆王', subtitle: '本月点赞 Top10', value: 'month' },
]

const formatRankingDate = (startDate = '', endDate = '', period: ManagedRankingPeriod = 'day') => {
  if (period === 'day') {
    return endDate || startDate || '今日'
  }
  if (startDate && endDate && startDate !== endDate) {
    return `${startDate} 至 ${endDate}`
  }
  return endDate || startDate || '当前周期'
}

const getPeriodSubtitle = (period: ManagedRankingPeriod) =>
  rankingPeriods.find((item) => item.value === period)?.subtitle || '点赞 Top10'

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
    activePeriod: 'day',
    dateText: '今日',
    emptyText: '当前榜单还没有点赞',
    errorText: '',
    items: [],
    likingMomentId: '',
    loading: true,
    periods: rankingPeriods,
    skeletonRows: [1, 2, 3],
    subtitle: '按点赞数排序，只展示前 10 名',
  },

  async onLoad(query) {
    const period = typeof query?.period === 'string' ? query.period : ''
    const activePeriod = rankingPeriods.some((item) => item.value === period)
      ? (period as ManagedRankingPeriod)
      : 'day'
    const profile = await ensureUserAuthorized(`/pages/rankings/index?period=${encodeURIComponent(activePeriod)}`)

    if (!profile) {
      this.setData({
        emptyText: '登录后可查看今日回忆榜',
        errorText: '',
        items: [],
        loading: false,
      })
      return
    }

    this.setData({
      activePeriod,
      subtitle: getPeriodSubtitle(activePeriod),
    })
    await this.loadRanking()
  },

  async loadRanking() {
    this.setData({
      errorText: '',
      loading: true,
    })

    try {
      const ranking = await getManagedTodayRanking(this.data.activePeriod, 10)
      this.setData({
        dateText: formatRankingDate(ranking.startDate, ranking.endDate || ranking.date, ranking.period),
        emptyText: '当前周期还没有点赞回忆',
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

  async handlePeriodTap(event) {
    const period = event.currentTarget.dataset.period as ManagedRankingPeriod | undefined
    if (!period || period === this.data.activePeriod) {
      return
    }
    this.setData({
      activePeriod: period,
      items: [],
      subtitle: getPeriodSubtitle(period),
    })
    await this.loadRanking()
  },

  async handleRefreshTap() {
    await this.loadRanking()
  },

  async handleLikeTap(event) {
    const momentId = event.currentTarget.dataset.momentId || ''
    if (!momentId || this.data.likingMomentId) {
      return
    }

    this.setData({ likingMomentId: momentId })
    try {
      const result = await toggleManagedMomentLike(momentId)
      this.showToast(result.likedByMe ? '已点赞' : '已取消点赞')
      await this.loadRanking()
    } catch (error) {
      this.showToast(error instanceof Error ? error.message : '点赞失败')
    } finally {
      this.setData({ likingMomentId: '' })
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
