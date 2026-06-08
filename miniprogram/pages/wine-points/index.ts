interface PointsTask {
  iconClass: string
  title: string
  value: number
}

interface PointsReward {
  cost: number
  iconClass: string
  subtitle: string
  title: string
}

interface PointsTab {
  id: 'tasks' | 'mall'
  name: string
}

interface WinePointsState {
  activeTab: 'tasks' | 'mall'
  rewards: PointsReward[]
  tabs: PointsTab[]
  tasks: PointsTask[]
}

interface WinePointsMethods {
  handleTabTap: (event: WechatMiniprogram.BaseEvent) => void
}

const TABS: PointsTab[] = [
  { id: 'tasks', name: '每日任务' },
  { id: 'mall', name: '积分商城' },
]

Page<WinePointsState, WinePointsMethods>({
  data: {
    activeTab: 'tasks',
    tabs: TABS,
    tasks: [
      { title: '每日签到', value: 10, iconClass: 'points-icon-coin' },
      { title: '分享战报', value: 20, iconClass: 'points-icon-share' },
      { title: '使用模板再开一局', value: 20, iconClass: 'points-icon-refresh' },
    ],
    rewards: [
      { title: '免广告特权（7天）', subtitle: '解锁工具页和战报页纯净模式', cost: 600, iconClass: 'points-icon-shield' },
      { title: '高级海报模板包', subtitle: '扩展分享海报和邀局模板样式', cost: 800, iconClass: 'points-icon-image' },
      { title: '商户优惠券', subtitle: '兑换合作商户的到店优惠券', cost: 500, iconClass: 'points-icon-coupon' },
      { title: '专属头像框（30天）', subtitle: '限时点亮酒局身份展示效果', cost: 300, iconClass: 'points-icon-crown' },
    ],
  },

  onLoad(query) {
    const tab = query?.tab === 'mall' ? 'mall' : 'tasks'
    this.setData({
      activeTab: tab,
    })
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
})

export {}
