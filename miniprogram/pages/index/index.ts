import { homePageMock, type HomePageData } from '../../mock/home'
import { claimPointsTask, getUserCommerceState } from '../../services/content'
import { getHomePageData } from '../../services/home'
import { ensureUserAuthorized, getCurrentDisplayProfile, getUserAuthSession, loginWithWechatProfile } from '../../utils/social'

interface HomePageState {
  authAvatarUrl: string
  authPanelVisible: boolean
  authName: string
  authSubmitting: boolean
  canCheckIn: boolean
  checkedIn: boolean
  home: HomePageData
  lastLoadedAt: number
  loading: boolean
  loggedIn: boolean
  signingIn: boolean
  userAvatarUrl: string
  userName: string
}

interface NicknameInputDetail {
  value?: string
}

interface ChooseAvatarDetail {
  avatarUrl?: string
}

interface HomePageMethods {
  announcePreview: (message: string) => void
  closeAuthPanel: () => void
  handleAuthAvatar: (event: WechatMiniprogram.CustomEvent<ChooseAvatarDetail>) => Promise<void>
  handleAuthNameInput: (event: WechatMiniprogram.CustomEvent<NicknameInputDetail>) => void
  handleCheckIn: () => void
  handleLoginSubmit: (event: WechatMiniprogram.CustomEvent<{ value?: Record<string, string> }>) => Promise<void>
  handleLoginTextTap: () => void
  handleJoinByCodeTap: () => Promise<void>
  handlePrimaryTap: () => Promise<void>
  handleQuickToolTap: (event: WechatMiniprogram.BaseEvent) => void
  handleTabTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handleToolTap: (event: WechatMiniprogram.BaseEvent) => void
  loadHomePage: () => Promise<void>
  noop: () => void
  openPage: (url: string) => void
  syncAuthState: () => Promise<void>
}

const TAB_ROUTES: Record<string, string> = {
  home: '/pages/index/index',
  tools: '/pages/tools/index',
  judge: '/pages/judge/index',
  me: '/pages/me/index',
}

const normalizeName = (value?: string) => {
  const text = String(value || '').trim()
  return !text || /^微信用户\d*$/.test(text) || /^酒友\d{3,}$/.test(text) || text === '未登录' ? '' : text
}

const normalizeAvatar = (value?: string) => String(value || '').trim()

const persistAvatar = (avatarUrl: string) =>
  new Promise<string>((resolve) => {
    const source = normalizeAvatar(avatarUrl)
    if (!source || /^wxfile:\/\/usr\//i.test(source)) {
      resolve(source)
      return
    }
    wx.saveFile({
      tempFilePath: source,
      success: (result) => resolve(normalizeAvatar(result.savedFilePath)),
      fail: () => resolve(source),
    })
  })

Page<HomePageState, HomePageMethods>({
  data: {
    authAvatarUrl: '',
    authPanelVisible: false,
    authName: '',
    authSubmitting: false,
    canCheckIn: false,
    checkedIn: false,
    home: homePageMock,
    lastLoadedAt: 0,
    loading: false,
    loggedIn: false,
    signingIn: false,
    userAvatarUrl: '',
    userName: '未登录',
  },

  onLoad() {
    void this.syncAuthState()
    void this.loadHomePage()
  },

  onShow() {
    void this.syncAuthState()
    if (!this.data.loading && Date.now() - this.data.lastLoadedAt > 45000) {
      void this.loadHomePage()
    }
  },

  onPullDownRefresh() {
    void this.loadHomePage().finally(() => wx.stopPullDownRefresh())
  },

  onShareAppMessage() {
    return {
      title: this.data.home.hero.shareTitle,
      path: '/pages/index/index',
      imageUrl: this.data.home.hero.imageUrl,
    }
  },

  loadHomePage() {
    if (!this.data.lastLoadedAt) {
      this.setData({ home: homePageMock, loading: false })
    }
    return getHomePageData()
      .then((home) => this.setData({ home, lastLoadedAt: Date.now(), loading: false }))
      .catch(() => this.setData({ home: homePageMock, lastLoadedAt: Date.now(), loading: false }))
  },

  async syncAuthState() {
    const [session, currentProfile] = await Promise.all([
      getUserAuthSession().catch(() => ({ loggedIn: false, profile: null })),
      getCurrentDisplayProfile().catch(() => null),
    ])
    const profile = session.profile || currentProfile
    const name = normalizeName(profile?.name)
    const avatarUrl = normalizeAvatar(profile?.avatarUrl)
    const loggedIn = Boolean(session.loggedIn && session.profile?.wechatOpenId)
    const commerceState = loggedIn ? await getUserCommerceState().catch(() => null) : null
    const signInState = commerceState?.taskClaimStates?.['task-signin']
    this.setData({
      authAvatarUrl: loggedIn ? '' : this.data.authAvatarUrl || avatarUrl,
      authName: loggedIn ? '' : this.data.authName || name,
      canCheckIn: loggedIn,
      checkedIn: loggedIn && signInState ? !signInState.canClaim : false,
      loggedIn,
      userAvatarUrl: avatarUrl,
      userName: loggedIn && name ? name : '未登录',
    })
  },

  async handleAuthAvatar(event) {
    const avatarUrl = await persistAvatar(event.detail?.avatarUrl || '')
    this.setData({ authAvatarUrl: avatarUrl })
  },

  handleAuthNameInput(event) {
    this.setData({ authName: normalizeName(event.detail?.value || '') })
  },

  async handleLoginSubmit(event) {
    if (this.data.authSubmitting) return
    const name = normalizeName(event.detail?.value?.nickname || this.data.authName)
    const avatarUrl = normalizeAvatar(this.data.authAvatarUrl)
    if (!name) {
      wx.showToast({ title: '请填写微信昵称', icon: 'none' })
      return
    }
    this.setData({ authSubmitting: true })
    try {
      const profile = await loginWithWechatProfile({ avatarUrl, name, identityTag: '', signature: '' })
      this.setData({
        authAvatarUrl: '',
        authPanelVisible: false,
        authName: '',
        canCheckIn: true,
        loggedIn: true,
        userAvatarUrl: normalizeAvatar(profile.avatarUrl) || avatarUrl,
        userName: normalizeName(profile.name) || name,
      })
      wx.showToast({ title: '登录成功', icon: 'success' })
    } catch (error) {
      wx.showToast({ title: error instanceof Error ? error.message : '微信登录失败', icon: 'none' })
    } finally {
      this.setData({ authSubmitting: false })
    }
  },

  announcePreview(message) {
    wx.showToast({ title: message, icon: 'none' })
  },

  handleLoginTextTap() {
    this.setData({ authPanelVisible: true })
  },

  closeAuthPanel() {
    this.setData({ authPanelVisible: false })
  },

  noop() {
    return
  },

  async handlePrimaryTap() {
    const profile = await ensureUserAuthorized('/pages/create-session/index')
    if (!profile) return
    wx.navigateTo({ url: '/pages/create-session/index' })
  },

  async handleJoinByCodeTap() {
    const profile = await ensureUserAuthorized('/pages/join-claim/index')
    if (!profile) return
    wx.navigateTo({ url: '/pages/join-claim/index' })
  },

  async handleCheckIn() {
    if (this.data.signingIn) return
    if (!this.data.canCheckIn) {
      this.handleLoginTextTap()
      return
    }
    const profile = await ensureUserAuthorized('/pages/index/index')
    if (!profile) {
      this.setData({ canCheckIn: false, checkedIn: false })
      this.handleLoginTextTap()
      return
    }
    if (this.data.checkedIn) {
      this.announcePreview('今天已经签到过了')
      return
    }
    this.setData({ signingIn: true })
    try {
      const state = await claimPointsTask('task-signin')
      const signInState = state.taskClaimStates?.['task-signin']
      const reward = signInState?.reward || 10
      this.setData({ checkedIn: true })
      wx.showToast({ title: `签到成功，积分 +${reward}`, icon: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : '签到失败'
      wx.showToast({ title: message.includes('已') ? '今天已经签到过了' : message, icon: 'none' })
      await this.syncAuthState().catch(() => null)
    } finally {
      this.setData({ signingIn: false })
    }
  },

  handleQuickToolTap(event) {
    const { id, name } = event.currentTarget.dataset as { id: string; name: string }
    this.openPage(`/pages/tool-detail/index?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`)
  },

  handleToolTap(event) {
    const { id, name, route } = event.currentTarget.dataset as { id: string; name: string; route?: string }
    this.openPage(route || `/pages/tool-detail/index?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`)
  },

  async handleTabTap(event) {
    const { tab } = event.currentTarget.dataset as { tab: string }
    const target = TAB_ROUTES[tab]
    if (!target || tab === 'home') return
    if (tab === 'judge') {
      const profile = await ensureUserAuthorized(target)
      if (!profile) return
    }
    wx.redirectTo({ url: target })
  },

  openPage(url) {
    wx.navigateTo({ url, fail: () => wx.redirectTo({ url }) })
  },
})

export {}


