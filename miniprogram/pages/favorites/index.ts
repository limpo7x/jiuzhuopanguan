interface FavoriteItem {
  imageUrl: string
  meta: string
  name: string
  route: string
}

interface FavoritesState {
  items: FavoriteItem[]
}

interface FavoritesMethods {
  handleItemTap: (event: WechatMiniprogram.BaseEvent) => void
}

Page<FavoritesState, FavoritesMethods>({
  data: {
    items: [
      { name: '整活大挑战模板', meta: '收藏于 昨天 20:10', imageUrl: '/assets/home/report-poster.png', route: '/pages/premium-templates/index' },
      { name: '二维码生成', meta: '收藏于 前天 18:42', imageUrl: '/assets/home/toolbox-hero.png', route: '/pages/tool-detail/index?id=qr-code&name=%E4%BA%8C%E7%BB%B4%E7%A0%81' },
      { name: '周五热场局战报', meta: '收藏于 05.20 23:16', imageUrl: '/assets/home/party-hero.png', route: '/pages/result-report/index' },
    ],
  },

  handleItemTap(event) {
    const { route } = event.currentTarget.dataset as { route: string }
    wx.navigateTo({ url: route })
  },
})

export {}
