import { homePageMock, type HomePageData } from '../../mock/home'
import { getHomePageData } from '../../services/home'

interface HomePageState {
  checkedIn: boolean
  home: HomePageData
  loading: boolean
}

interface HomePageMethods {
  announcePreview: (message: string) => void
  handleCheckIn: () => void
  handlePrimaryTap: () => void
  handleQuickToolTap: (event: WechatMiniprogram.BaseEvent) => void
  handleTabTap: (event: WechatMiniprogram.BaseEvent) => void
  handleToolTap: (event: WechatMiniprogram.BaseEvent) => void
  loadHomePage: () => Promise<void>
  openPage: (url: string) => void
}

const TAB_ROUTES: Record<string, string> = {
  home: '/pages/index/index',
  tools: '/pages/tools/index',
  judge: '/pages/judge/index',
  me: '/pages/me/index',
}

Page<HomePageState, HomePageMethods>({
  data: {
    checkedIn: false,
    home: homePageMock,
    loading: true,
  },

  onLoad() {
    void this.loadHomePage()
  },

  onPullDownRefresh() {
    void this.loadHomePage().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  onShareAppMessage() {
    return {
      title: this.data.home.hero.shareTitle,
      path: '/pages/index/index',
      imageUrl: this.data.home.hero.imageUrl,
    }
  },

  loadHomePage() {
    return getHomePageData()
      .then((home) => {
        this.setData({
          home,
          loading: false,
        })
      })
      .catch(() => {
        this.setData({
          home: homePageMock,
          loading: false,
        })
      })
  },

  announcePreview(message) {
    wx.showToast({
      title: message,
      icon: 'none',
    })
  },

  handlePrimaryTap() {
    wx.navigateTo({
      url: '/pages/create-session/index',
    })
  },

  handleCheckIn() {
    if (this.data.checkedIn) {
      this.announcePreview('今天已经签到过了')
      return
    }

    this.setData({
      checkedIn: true,
    })
    this.announcePreview('签到成功，积分 +10')
  },

  handleQuickToolTap(event) {
    const { id, name } = event.currentTarget.dataset as { id: string; name: string }
    this.openPage(`/pages/tool-detail/index?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`)
  },

  handleToolTap(event) {
    const { id, name, route } = event.currentTarget.dataset as { id: string; name: string; route?: string }
    if (route) {
      this.openPage(route)
      return
    }
    this.openPage(`/pages/tool-detail/index?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`)
  },

  handleTabTap(event) {
    const { tab } = event.currentTarget.dataset as { tab: string }
    const target = TAB_ROUTES[tab]

    if (!target || tab === 'home') {
      return
    }

    wx.redirectTo({ url: target })
  },

  openPage(url) {
    wx.navigateTo({
      url,
      fail: () => {
        wx.redirectTo({ url })
      },
    })
  },
})

export {}
