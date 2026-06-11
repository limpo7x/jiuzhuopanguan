import {
  claimPointsTask,
  getPointsConfig,
  getUserCommerceState,
  redeemPointsReward,
  type TaskClaimState,
  type PointsReward,
  type PointsTask,
} from '../../services/content'

interface PointsTab {
  id: 'tasks' | 'mall'
  name: string
}

interface WinePointsState {
  activeTab: 'tasks' | 'mall'
  balance: number
  bannerImageUrl: string
  taskClaimStates: Record<string, TaskClaimState>
  claimedTaskIds: string[]
  ownedRewardIds: string[]
  pendingActionId: string
  rewards: PointsReward[]
  tabs: PointsTab[]
  tasks: Array<
    PointsTask & {
      buttonText: string
      canClaim: boolean
      statusText: string
    }
  >
}

interface WinePointsMethods {
  handleRewardRedeem: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handleTaskClaim: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handleTabTap: (event: WechatMiniprogram.BaseEvent) => void
  handleBannerImageError: () => void
  resolveTaskViews: (tasks: PointsTask[], taskClaimStates?: Record<string, TaskClaimState>, claimedTaskIds?: string[]) => Array<
    PointsTask & {
      buttonText: string
      canClaim: boolean
      statusText: string
    }
  >
  loadCommerceState: () => Promise<void>
  loadRemoteConfig: () => Promise<void>
}

const TABS: PointsTab[] = [
  { id: 'tasks', name: '每日任务' },
  { id: 'mall', name: '积分商城' },
]

const DEFAULT_TASKS: PointsTask[] = []

const DEFAULT_REWARDS: PointsReward[] = []

const DEFAULT_BANNER_IMAGE_URL = ''

Page<WinePointsState, WinePointsMethods>({
  data: {
    activeTab: 'tasks',
    balance: 0,
    bannerImageUrl: DEFAULT_BANNER_IMAGE_URL,
    taskClaimStates: {},
    claimedTaskIds: [],
    ownedRewardIds: [],
    pendingActionId: '',
    tabs: TABS,
    tasks: DEFAULT_TASKS.map((item) => ({
      ...item,
      buttonText: `+ ${item.value}`,
      canClaim: true,
      statusText: '完成任务可领取',
    })),
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
      const tasks = config.tasks || []
      const bannerImageUrl = config.bannerImageUrl || DEFAULT_BANNER_IMAGE_URL
      this.setData({
        bannerImageUrl,
        rewards: config.rewards || [],
        tasks: this.resolveTaskViews(tasks, this.data.taskClaimStates, this.data.claimedTaskIds),
      })
    } catch {
      // 保留本地默认展示
    }
  },

  resolveTaskViews(tasks, taskClaimStates, claimedTaskIds) {
    const resolvedTaskClaimStates = taskClaimStates || this.data.taskClaimStates
    const resolvedClaimedTaskIds = claimedTaskIds || this.data.claimedTaskIds
    return tasks.map((item) => {
      const claimState = resolvedTaskClaimStates[item.id]
      const isClaimed = resolvedClaimedTaskIds.includes(item.id)
      if (!claimState) {
        return {
          ...item,
          canClaim: !isClaimed,
          buttonText: isClaimed ? '已领取' : `+ ${item.value}`,
          statusText: isClaimed ? '任务已完成' : '完成任务可领取',
        }
      }

      return {
        ...item,
        canClaim: claimState.canClaim,
        buttonText: claimState.buttonText || `+ ${item.value}`,
        statusText: claimState.statusText || '完成任务可领取',
      }
    })
  },

  async loadCommerceState() {
    try {
      const state = await getUserCommerceState()
      const claimedTaskIds = state.claimedTaskIds || []
      const taskClaimStates = state.taskClaimStates || {}
      this.setData({
        balance: typeof state.points === 'number' ? state.points : this.data.balance,
        claimedTaskIds,
        taskClaimStates,
        ownedRewardIds: state.ownedRewardIds || [],
        tasks: this.resolveTaskViews(
          this.data.tasks.map((item) => ({
            id: item.id,
            iconClass: item.iconClass,
            title: item.title,
            value: item.value,
          })),
          taskClaimStates,
          claimedTaskIds,
        ),
      })
    } catch {
      // 保留当前状态，避免用假成功覆盖真实失败
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

  handleBannerImageError() {
    if (this.data.bannerImageUrl !== DEFAULT_BANNER_IMAGE_URL) {
      this.setData({
        bannerImageUrl: DEFAULT_BANNER_IMAGE_URL,
      })
    }
  },

  async handleTaskClaim(event) {
    const { id } = event.currentTarget.dataset as { id?: string }
    if (!id || this.data.pendingActionId) {
      return
    }

    const claimState = this.data.taskClaimStates[id]
    if (!claimState && this.data.claimedTaskIds.includes(id)) {
      return
    }
    if (claimState && !claimState.canClaim) {
      return
    }

    this.setData({ pendingActionId: id })
    try {
      const state = await claimPointsTask(id)
      const claimedTaskIds = state.claimedTaskIds || this.data.claimedTaskIds
      const taskClaimStates = state.taskClaimStates || this.data.taskClaimStates
      this.setData({
        balance: state.points,
        claimedTaskIds,
        taskClaimStates,
        tasks: this.resolveTaskViews(
          this.data.tasks.map((item) => ({
            id: item.id,
            iconClass: item.iconClass,
            title: item.title,
            value: item.value,
          })),
          taskClaimStates,
          claimedTaskIds,
        ),
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
