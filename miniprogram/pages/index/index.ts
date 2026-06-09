import { homePageMock, type HomePageData } from '../../mock/home'
import { getHomePageData } from '../../services/home'
import { ensureUserAuthorized, getCurrentDisplayProfile, getUserAuthSession } from '../../utils/social'
import { avatarAsset } from '../../config/assets'

interface HomePageState {
  canCheckIn: boolean
  checkedIn: boolean
  home: HomePageData
  loading: boolean
  userAvatarUrl: string
  userName: string
}

interface HomePageMethods {
  announcePreview: (message: string) => void
  handleCheckIn: () => void
  handleProfileTap: () => void
  handlePrimaryTap: () => Promise<void>
  handleQuickToolTap: (event: WechatMiniprogram.BaseEvent) => void
  handleTabTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handleToolTap: (event: WechatMiniprogram.BaseEvent) => void
  loadHomePage: () => Promise<void>
  openPage: (url: string) => void
  syncAuthState: () => Promise<void>
}

const TAB_ROUTES: Record<string, string> = {
  home: '/pages/index/index',
  tools: '/pages/tools/index',
  judge: '/pages/judge/index',
  me: '/pages/me/index',
}

Page<HomePageState, HomePageMethods>({
  data: {
    canCheckIn: false,
    checkedIn: false,
    home: homePageMock,
    loading: true,
    userAvatarUrl: avatarAsset(1),
    userName: '未登录',
  },

  onLoad() {
    void this.syncAuthState()
    void this.loadHomePage()
  },

  onShow() {
    void this.syncAuthState()
    if (!this.data.loading) {
      void this.loadHomePage()
    }
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

  async syncAuthState() {
    const [session, currentProfile] = await Promise.all([
      getUserAuthSession().catch(() => ({ loggedIn: false, profile: null })),
      getCurrentDisplayProfile().catch(() => null),
    ])
    const displayProfile = session.profile || currentProfile
    this.setData({
      canCheckIn: Boolean(session.profile?.wechatOpenId || currentProfile?.wechatOpenId),
      userAvatarUrl: displayProfile?.avatarUrl || avatarAsset(1),
      userName: displayProfile?.wechatOpenId && displayProfile.name ? displayProfile.name : '未登录',
    })
  },

  handleProfileTap() {
    wx.navigateTo({
      url: `/pages/profile-edit/index?redirect=${encodeURIComponent('/pages/index/index')}`,
      fail: () => {
        wx.redirectTo({
          url: `/pages/profile-edit/index?redirect=${encodeURIComponent('/pages/index/index')}`,
        })
      },
    })
  },

  async handlePrimaryTap() {
    const profile = await ensureUserAuthorized('/pages/create-session/index')
    if (!profile) {
      return
    }
    wx.navigateTo({
      url: '/pages/create-session/index',
    })
  },

  handleCheckIn() {
    if (!this.data.canCheckIn) {
      return
    }

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

  async handleTabTap(event) {
    const { tab } = event.currentTarget.dataset as { tab: string }
    const target = TAB_ROUTES[tab]

    if (!target || tab === 'home') {
      return
    }

    if (tab === 'judge') {
      const profile = await ensureUserAuthorized(target)
      if (!profile) {
        return
      }
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
