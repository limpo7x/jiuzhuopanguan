import { getMembershipCatalog, getUserCommerceState } from '../../services/content'

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
    coupons: [],
  },

  async onLoad() {
    try {
      const [commerce, membership] = await Promise.all([getUserCommerceState(), getMembershipCatalog()])
      const coupons: CouponItem[] = []

      if (commerce.rewardRedemptions.length) {
        commerce.rewardRedemptions.forEach((item) => {
          coupons.push({
            name: item.title,
            desc: `已兑换 · ${item.createdAt}`,
            tag: '已兑换',
            route: '/pages/merchant-partners/index',
          })
        })
      }

      if (membership.membership.active) {
        coupons.push({
          name: membership.membership.activePlanName || '会员权益已开通',
          desc: `有效期至 ${membership.membership.expiresAt || '长期有效'}`,
          tag: '会员',
          route: '/pages/member-center/index',
        })
      }

      if (!coupons.length) {
        coupons.push({
          name: '暂无已领取权益',
          desc: '当前没有已兑换商户券或已开通会员权益，可前往积分或商户页领取。',
          tag: '未领取',
          route: '/pages/wine-points/index',
        })
      }

      this.setData({ coupons })
    } catch (error) {
      wx.showToast({
        title: error instanceof Error ? error.message : '权益页加载失败',
        icon: 'none',
      })
    }
  },

  handleUseTap(event) {
    const { route } = event.currentTarget.dataset as { route: string }
    wx.navigateTo({ url: route })
  },
})

export {}
