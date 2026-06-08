interface MemberBenefit {
  label: string
  value: string
}

interface MemberPackage {
  active?: boolean
  name: string
  price: string
}

interface MemberCenterState {
  benefits: MemberBenefit[]
  packages: MemberPackage[]
}

interface MemberCenterMethods {
  handleOpenTap: () => void
}

Page<MemberCenterState, MemberCenterMethods>({
  data: {
    benefits: [
      { label: '模板权益', value: 'PRO 模板无限看' },
      { label: '广告权益', value: '战报导出免广告' },
      { label: '资产权益', value: '专属头像框和徽章' },
    ],
    packages: [
      { name: '连续包月', price: '¥18/月', active: true },
      { name: '季度卡', price: '¥48/季' },
      { name: '年度卡', price: '¥168/年' },
    ],
  },

  handleOpenTap() {
    wx.navigateTo({
      url: '/pages/coupon-center/index',
    })
  },
})

export {}
