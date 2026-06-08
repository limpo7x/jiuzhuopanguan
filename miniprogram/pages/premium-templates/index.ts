interface ProFilter {
  active?: boolean
  name: string
}

interface ProTemplate {
  cost: number
  imageUrl: string
  meta: string
  title: string
}

interface PremiumTemplatesState {
  filters: ProFilter[]
  templates: ProTemplate[]
}

interface PremiumTemplatesMethods {
  handleTemplateTap: (event: WechatMiniprogram.BaseEvent) => void
  handleUnlockTap: () => void
}

Page<PremiumTemplatesState, PremiumTemplatesMethods>({
  data: {
    filters: [
      { name: '全部', active: true },
      { name: '友情互损' },
      { name: '经典惩罚' },
      { name: '聚会整活' },
    ],
    templates: [
      { title: '友情互损', meta: '28 个玩法 · 适合死党局', cost: 800, imageUrl: '/assets/home/toolbox-hero.png' },
      { title: '经典惩罚', meta: '26 个玩法 · 轻松不水局', cost: 800, imageUrl: '/assets/home/party-hero.png' },
      { title: '整活大挑战', meta: '32 个玩法 · 气氛拉满', cost: 800, imageUrl: '/assets/home/report-poster.png' },
      { title: '生日专属', meta: '18 个玩法 · 定制惊喜', cost: 800, imageUrl: '/assets/home/image-process-hero.png' },
    ],
  },

  handleTemplateTap(event) {
    const { title } = event.currentTarget.dataset as { title: string }

    wx.navigateTo({
      url: `/pages/create-session/index?template=${encodeURIComponent(title)}`,
    })
  },

  handleUnlockTap() {
    wx.navigateTo({
      url: '/pages/member-center/index',
    })
  },
})

export {}
