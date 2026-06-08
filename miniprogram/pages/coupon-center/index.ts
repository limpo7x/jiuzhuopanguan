interface CouponItem {
  desc: string
  name: string
  route: string
  tag: string
}

interface CouponCenterState {
  coupons: CouponItem[]
}

interface CouponCenterMethods {
  handleUseTap: (event: WechatMiniprogram.BaseEvent) => void
}

Page<CouponCenterState, CouponCenterMethods>({
  data: {
    coupons: [
      { name: '酒吧合作券', desc: '全单 88 折 · 今日可用', tag: '推荐', route: '/pages/merchant-partners/index' },
      { name: '会员开通券', desc: '开通会员立减 8 元', tag: '会员', route: '/pages/member-center/index' },
      { name: '模板解锁券', desc: '可抵扣 200 积分', tag: '模板', route: '/pages/premium-templates/index' },
    ],
  },

  handleUseTap(event) {
    const { route } = event.currentTarget.dataset as { route: string }
    wx.navigateTo({ url: route })
  },
})

export {}
