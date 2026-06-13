import { getMembershipCatalog, getUserCommerceState } from '../../services/content'
import { getManagedJudgeStats } from '../../services/operations'
import { showFirstLoginBonusModal } from '../../utils/firstLoginBonus'
import { getCurrentDisplayProfile, getUserAuthSession, getWineFriends, loginWithWechatProfile, type SocialProfile } from '../../utils/social'

interface StatItem {
  label: string
  value: string
}

interface FeatureItem {
  iconClass: string
  id: string
  name: string
}

interface NicknameInputDetail {
  value?: string
}

interface ChooseAvatarDetail {
  avatarUrl?: string
}

interface MePageState {
  assetStats: StatItem[]
  authAvatarUrl: string
  authAvatarChoosing: boolean
  authName: string
  authPanelVisible: boolean
  authSubmitting: boolean
  currentProfile: SocialProfile
  membershipEnabled: boolean
  features: FeatureItem[]
  loggedIn: boolean
  wineStats: StatItem[]
}

interface MePageMethods {
  closeAuthPanel: () => void
  handleAssetTap: (event: WechatMiniprogram.BaseEvent) => void
  handleAuthAvatar: (event: WechatMiniprogram.CustomEvent<ChooseAvatarDetail>) => Promise<void>
  handleAuthAvatarTap: () => void
  handleAuthNameInput: (event: WechatMiniprogram.CustomEvent<NicknameInputDetail>) => void
  handleFeatureTap: (event: WechatMiniprogram.BaseEvent) => void
  handleLoginSubmit: (event: WechatMiniprogram.CustomEvent<{ value?: Record<string, string> }>) => Promise<void>
  handleLoginTextTap: () => void
  handleMemberTap: () => void
  handleTabTap: (event: WechatMiniprogram.BaseEvent) => void
  handleWineStatTap: (event: WechatMiniprogram.BaseEvent) => void
  loadSocialData: () => Promise<void>
  noop: () => void
  openPage: (url: string) => void
  showPreviewToast: (message: string) => void
}

const TAB_ROUTES: Record<string, string> = {
  home: '/pages/index/index',
  tools: '/pages/tools/index',
  judge: '/pages/judge/index',
  me: '/pages/me/index',
}

const DEFAULT_PROFILE: SocialProfile = {
  id: '',
  name: '',
  avatarUrl: '',
  identityTag: '',
  signature: '',
  phone: '',
  phoneMasked: '',
  wechatOpenId: '',
}

const DEFAULT_ASSET_STATS: StatItem[] = [
  { value: '0', label: '我的积分' },
  { value: '0', label: '我的权益' },
  { value: '0', label: '已解锁模板' },
]

const DEFAULT_WINE_STATS: StatItem[] = [
  { value: '0', label: '我的酒局' },
  { value: '0', label: '参与场次' },
  { value: '0', label: '待分享战报' },
  { value: '0', label: '我的聚友' },
]

const DEFAULT_FEATURES: FeatureItem[] = [
  { id: 'history', name: '使用记录', iconClass: 'me-icon-history' },
  { id: 'coupons', name: '我的权益', iconClass: 'me-icon-ticket' },
  { id: 'points', name: '积分商城', iconClass: 'me-icon-shield' },
  { id: 'merchant', name: '商户优惠', iconClass: 'me-icon-store' },
  { id: 'invite', name: '邀请好友', iconClass: 'me-icon-user' },
]

const normalizeName = (value?: string) => {
  const text = String(value || '').trim()
  return !text || /^微信用户\d*$/.test(text) || /^酒友\d{3,}$/.test(text) || text === '未登录' ? '' : text
}

const normalizeAvatar = (value?: string) => String(value || '').trim()

const persistAvatar = (avatarUrl: string) =>
  new Promise<string>((resolve) => {
    const source = normalizeAvatar(avatarUrl)
    resolve(source)
  })

Page<MePageState, MePageMethods>({
  data: {
    assetStats: DEFAULT_ASSET_STATS,
    authAvatarUrl: '',
    authAvatarChoosing: false,
    authName: '',
    authPanelVisible: false,
    authSubmitting: false,
    currentProfile: DEFAULT_PROFILE,
    membershipEnabled: true,
    features: DEFAULT_FEATURES,
    loggedIn: false,
    wineStats: DEFAULT_WINE_STATS,
  },

  async onLoad() {
    await this.loadSocialData()
  },

  async onShow() {
    await this.loadSocialData()
  },

  async loadSocialData() {
    const [authSession, currentProfile, commerceState, judgeStats, wineFriends, membershipCatalog] = await Promise.all([
      getUserAuthSession().catch(() => ({ loggedIn: false, profile: null })),
      getCurrentDisplayProfile().catch(() => DEFAULT_PROFILE),
      getUserCommerceState().catch(() => null),
      getManagedJudgeStats().catch(() => null),
      getWineFriends().catch(() => []),
      getMembershipCatalog().catch(() => null),
    ])
    const displayProfile = authSession.profile || currentProfile || DEFAULT_PROFILE
    const loggedIn = Boolean(authSession.loggedIn && authSession.profile?.wechatOpenId)
    this.setData({
      assetStats: [
        { value: String(commerceState?.points ?? 0), label: '我的积分' },
        { value: String(commerceState?.rewardRedemptions?.length ?? 0), label: '我的权益' },
        { value: String(commerceState?.unlockedTemplateIds?.length ?? 0), label: '已解锁模板' },
      ],
      authAvatarUrl: loggedIn ? '' : this.data.authAvatarUrl || normalizeAvatar(displayProfile.avatarUrl),
      authName: loggedIn ? '' : this.data.authName || normalizeName(displayProfile.name),
      authPanelVisible: loggedIn ? false : this.data.authPanelVisible,
      currentProfile: { ...displayProfile, name: normalizeName(displayProfile.name), avatarUrl: normalizeAvatar(displayProfile.avatarUrl) },
      loggedIn,
      membershipEnabled: Boolean(membershipCatalog ? membershipCatalog.membershipEnabled : true),
      wineStats: [
        { value: String(judgeStats?.hostedCount ?? 0), label: '我的酒局' },
        { value: String(judgeStats?.joinedCount ?? 0), label: '参与场次' },
        { value: String(judgeStats?.unsharedReportCount ?? 0), label: '待分享战报' },
        { value: String(wineFriends.length), label: '我的聚友' },
      ],
    })
  },

  async handleAuthAvatar(event) {
    this.setData({
      authAvatarChoosing: false,
      authAvatarUrl: await persistAvatar(event.detail?.avatarUrl || ''),
    })
  },

  handleAuthAvatarTap() {
    if (this.data.authAvatarChoosing || this.data.authSubmitting) {
      return
    }

    this.setData({ authAvatarChoosing: true })
    setTimeout(() => {
      if (this.data.authAvatarChoosing) {
        this.setData({ authAvatarChoosing: false })
      }
    }, 1800)
  },

  handleAuthNameInput(event) {
    this.setData({ authName: normalizeName(event.detail?.value || '') })
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
        authName: '',
        authPanelVisible: false,
        currentProfile: { ...profile, avatarUrl: normalizeAvatar(profile.avatarUrl) || avatarUrl, name: normalizeName(profile.name) || name },
        loggedIn: true,
      })
      await this.loadSocialData()
      const bonusShown = await showFirstLoginBonusModal(profile)
      if (!bonusShown) {
        wx.showToast({ title: '登录成功', icon: 'success' })
      }
    } catch (error) {
      wx.showToast({ title: error instanceof Error ? error.message : '微信登录失败', icon: 'none' })
    } finally {
      this.setData({ authSubmitting: false })
    }
  },

  handleMemberTap() {
    if (!this.data.membershipEnabled) {
      wx.showToast({ title: '会员功能暂未开放', icon: 'none' })
      return
    }
    this.openPage('/pages/member-center/index')
  },

  handleAssetTap(event) {
    const { label } = event.currentTarget.dataset as { label: string }
    const routes: Record<string, string> = {
      我的积分: '/pages/wine-points/index?tab=tasks',
      我的权益: '/pages/coupon-center/index',
      已解锁模板: '/pages/premium-templates/index',
    }
    const target = routes[label]
    if (target) this.openPage(target)
  },

  handleFeatureTap(event) {
    const { name } = event.currentTarget.dataset as { name: string }
    const routes: Record<string, string> = {
      使用记录: '/pages/usage-history/index',
      我的权益: '/pages/coupon-center/index',
      积分商城: '/pages/wine-points/index?tab=mall',
      商户优惠: '/pages/merchant-partners/index',
      邀请好友: '/pages/invite-friends/index',
    }
    const target = routes[name]
    if (target) {
      this.openPage(target)
      return
    }
    this.showPreviewToast(`${name} 当前不可用`)
  },

  handleTabTap(event) {
    const { tab } = event.currentTarget.dataset as { tab: string }
    const target = TAB_ROUTES[tab]
    if (!target || tab === 'me') return
    wx.redirectTo({ url: target })
  },

  handleWineStatTap(event) {
    const { label } = event.currentTarget.dataset as { label: string }
    const routes: Record<string, string> = {
      我的酒局: '/pages/wine-history/index?mode=host',
      参与场次: '/pages/wine-history/index?mode=joined',
      待分享战报: '/pages/wine-history/index?mode=unshared',
      我的聚友: '/pages/friend-hub/index',
    }
    const target = routes[label]
    if (target) this.openPage(target)
  },

  showPreviewToast(message) {
    wx.showToast({ title: message, icon: 'none' })
  },

  openPage(url) {
    wx.navigateTo({ url, fail: () => wx.redirectTo({ url }) })
  },
})

export {}
