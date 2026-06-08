import {
  claimPointsTask,
  getPointsConfig,
  getUserCommerceState,
  redeemPointsReward,
  type PointsReward,
  type PointsTask,
} from '../../services/content'
import { staticAsset } from '../../config/assets'

interface PointsTab {
  id: 'tasks' | 'mall'
  name: string
}

interface WinePointsState {
  activeTab: 'tasks' | 'mall'
  balance: number
  bannerImageUrl: string
  claimedTaskIds: string[]
  ownedRewardIds: string[]
  pendingActionId: string
  rewards: PointsReward[]
  tabs: PointsTab[]
  tasks: PointsTask[]
}

interface WinePointsMethods {
  handleRewardRedeem: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handleTaskClaim: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handleTabTap: (event: WechatMiniprogram.BaseEvent) => void
  loadCommerceState: () => Promise<void>
  loadRemoteConfig: () => Promise<void>
}

const TABS: PointsTab[] = [
  { id: 'tasks', name: '每日任务' },
  { id: 'mall', name: '积分商城' },
]

const DEFAULT_TASKS: PointsTask[] = [
  { id: 'task-signin', title: '每日签到', value: 10, iconClass: 'points-icon-coin' },
  { id: 'task-share-report', title: '分享战报', value: 20, iconClass: 'points-icon-share' },
  { id: 'task-reopen', title: '使用模板再开一局', value: 20, iconClass: 'points-icon-refresh' },
]

const DEFAULT_REWARDS: PointsReward[] = [
  { id: 'reward-noads', title: '免广告特权（7天）', subtitle: '解锁工具页和战报页纯净模式', cost: 600, iconClass: 'points-icon-shield' },
  { id: 'reward-poster-pack', title: '高级海报模板包', subtitle: '扩展分享海报和邀局模板样式', cost: 800, iconClass: 'points-icon-image' },
  { id: 'reward-merchant-coupon', title: '商户优惠券', subtitle: '兑换合作商户的到店优惠券', cost: 500, iconClass: 'points-icon-coupon' },
  { id: 'reward-avatar-frame', title: '专属头像框（30天）', subtitle: '限时点亮酒局身份展示效果', cost: 300, iconClass: 'points-icon-crown' },
]

Page<WinePointsState, WinePointsMethods>({
  data: {
    activeTab: 'tasks',
    balance: 168,
    bannerImageUrl: staticAsset('points-gift.png'),
    claimedTaskIds: [],
    ownedRewardIds: [],
    pendingActionId: '',
    tabs: TABS,
    tasks: DEFAULT_TASKS,
    rewards: DEFAULT_REWARDS,
  },

  async onLoad(query) {
    const tab = query?.tab === 'mall' ? 'mall' : 'tasks'
    this.setData({
      activeTab: tab,
    })

    await Promise.all([this.loadRemoteConfig(), this.loadCommerceState()])
  },

  async loadRemoteConfig() {
    try {
      const config = await getPointsConfig()
      this.setData({
        bannerImageUrl: config.bannerImageUrl || this.data.bannerImageUrl,
        rewards: config.rewards?.length ? config.rewards : DEFAULT_REWARDS,
        tasks: config.tasks?.length ? config.tasks : DEFAULT_TASKS,
      })
    } catch {
      // keep local defaults when backend is unavailable
    }
  },

  async loadCommerceState() {
    try {
      const state = await getUserCommerceState()
      this.setData({
        balance: typeof state.points === 'number' ? state.points : this.data.balance,
        claimedTaskIds: state.claimedTaskIds || [],
        ownedRewardIds: state.ownedRewardIds || [],
      })
    } catch {
      // keep current page state
    }
  },

  handleTabTap(event) {
    const { tab } = event.currentTarget.dataset as { tab: 'tasks' | 'mall' }
    if (!tab || tab === this.data.activeTab) {
      return
    }

    this.setData({
      activeTab: tab,
    })
  },

  async handleTaskClaim(event) {
    const { id } = event.currentTarget.dataset as { id?: string }
    if (!id || this.data.pendingActionId || this.data.claimedTaskIds.includes(id)) {
      return
    }

    this.setData({ pendingActionId: id })
    try {
      const state = await claimPointsTask(id)
      this.setData({
        balance: state.points,
        claimedTaskIds: state.claimedTaskIds,
        pendingActionId: '',
      })
      wx.showToast({ title: '领取成功', icon: 'success' })
    } catch (error) {
      this.setData({ pendingActionId: '' })
      wx.showToast({ title: error instanceof Error ? error.message : '领取失败', icon: 'none' })
    }
  },

  async handleRewardRedeem(event) {
    const { id } = event.currentTarget.dataset as { id?: string }
    if (!id || this.data.pendingActionId || this.data.ownedRewardIds.includes(id)) {
      return
    }

    this.setData({ pendingActionId: id })
    try {
      const state = await redeemPointsReward(id)
      this.setData({
        balance: state.points,
        ownedRewardIds: state.ownedRewardIds,
        pendingActionId: '',
      })
      wx.showToast({ title: '兑换成功', icon: 'success' })
    } catch (error) {
      this.setData({ pendingActionId: '' })
      wx.showToast({ title: error instanceof Error ? error.message : '兑换失败', icon: 'none' })
    }
  },
})

export {}
