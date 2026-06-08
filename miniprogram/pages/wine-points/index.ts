interface PointsTask {
  iconClass: string
  title: string
  value: number
}

interface PointsReward {
  cost: number
  iconClass: string
  title: string
}

interface WinePointsState {
  rewards: PointsReward[]
  tasks: PointsTask[]
}

interface WinePointsMethods {}

Page<WinePointsState, WinePointsMethods>({
  data: {
    tasks: [
      { title: '每日签到', value: 10, iconClass: 'points-icon-coin' },
      { title: '分享战报', value: 20, iconClass: 'points-icon-share' },
      { title: '使用模板再开一局', value: 20, iconClass: 'points-icon-refresh' },
    ],
    rewards: [
      { title: '免广告特权（7天）', cost: 600, iconClass: 'points-icon-shield' },
      { title: '高级海报模板包', cost: 800, iconClass: 'points-icon-image' },
      { title: '商户优惠券', cost: 500, iconClass: 'points-icon-coupon' },
      { title: '专属头像框（30天）', cost: 300, iconClass: 'points-icon-crown' },
    ],
  },
})

export {}
