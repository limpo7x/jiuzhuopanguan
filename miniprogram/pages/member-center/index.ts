import { getMembershipCatalog } from '../../services/content'

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
  membershipEnabled: boolean
  ctaText: string
  packages: MemberPackage[]
}

interface MemberCenterMethods {
  handleOpenTap: () => void
}

Page<MemberCenterState, MemberCenterMethods>({
  data: {
    benefits: [],
    membershipEnabled: false,
    ctaText: '查看我的权益',
    packages: [],
  },

  async onLoad() {
    try {
      const catalog = await getMembershipCatalog()
      if (catalog.membershipEnabled === false) {
        this.setData({ membershipEnabled: false })
        return
      }

      this.setData({
        membershipEnabled: true,
        benefits: catalog.benefits.map((item) => ({
          label: item.scope,
          value: `${item.name} · ${item.note}`,
        })),
        ctaText: catalog.membership.active ? '查看我的权益' : '权益暂按后台配置开放',
        packages: catalog.plans.map((item) => ({
          active: Boolean(item.active),
          name: item.name,
          price: `${item.price} · ${item.duration}`,
        })),
      })
    } catch (error) {
      wx.showToast({
        title: error instanceof Error ? error.message : '权益数据加载失败',
        icon: 'none',
      })
    }
  },

  handleOpenTap() {
    wx.navigateTo({ url: '/pages/coupon-center/index' })
  },
})

export {}
