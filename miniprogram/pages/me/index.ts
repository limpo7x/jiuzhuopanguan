import { avatarAsset } from '../../config/assets'
import { getUserCommerceState } from '../../services/content'
import { getManagedJudgeStats } from '../../services/operations'
import { getCurrentProfile, getUserAuthSession, getWineFriends, type SocialProfile } from '../../utils/social'

interface StatItem {
  label: string
  value: string
}

interface FeatureItem {
  iconClass: string
  id: string
  name: string
}

interface MePageState {
  assetStats: StatItem[]
  currentProfile: SocialProfile
  features: FeatureItem[]
  wineStats: StatItem[]
}

interface MePageMethods {
  handleAssetTap: (event: WechatMiniprogram.BaseEvent) => void
  handleEditTap: () => void
  handleFeatureTap: (event: WechatMiniprogram.BaseEvent) => void
  handleMemberTap: () => void
  handleTabTap: (event: WechatMiniprogram.BaseEvent) => void
  handleWineStatTap: (event: WechatMiniprogram.BaseEvent) => void
  loadSocialData: () => Promise<void>
  openPage: (url: string) => void
  showPreviewToast: (message: string) => void
}

const TAB_ROUTES: Record<string, string> = {
  home: '/pages/index/index',
  tools: '/pages/tools/index',
  judge: '/pages/judge/index',
  me: '/pages/me/index',
}

const DEFAULT_ASSET_STATS: StatItem[] = [
  { value: '0', label: '我的积分' },
  { value: '0', label: '我的权益' },
  { value: '0', label: '已解锁模板' },
]

const DEFAULT_WINE_STATS: StatItem[] = [
  { value: '0', label: '发起酒局' },
  { value: '0', label: '参与场次' },
  { value: '0', label: '战报分享' },
  { value: '0', label: '我的聚友' },
]

const DEFAULT_FEATURES: FeatureItem[] = [
  { id: 'favorites', name: '我的收藏', iconClass: 'me-icon-star' },
  { id: 'history', name: '使用记录', iconClass: 'me-icon-history' },
  { id: 'reports', name: '我的战报', iconClass: 'me-icon-report' },
  { id: 'coupons', name: '我的权益', iconClass: 'me-icon-ticket' },
  { id: 'points', name: '积分商城', iconClass: 'me-icon-shield' },
  { id: 'merchant', name: '商户优惠', iconClass: 'me-icon-store' },
  { id: 'invite', name: '邀请好友', iconClass: 'me-icon-user' },
  { id: 'settings', name: '设置', iconClass: 'me-icon-settings' },
]

Page<MePageState, MePageMethods>({
  data: {
    assetStats: DEFAULT_ASSET_STATS,
    currentProfile: {
      id: 'me-owner',
      name: '微信用户',
      avatarUrl: avatarAsset(1),
      city: '上海',
      identityTag: '酒局常驻玩家',
      signature: '今晚这局不见不散。',
      phone: '',
      phoneMasked: '',
      wechatOpenId: '',
    },
    features: DEFAULT_FEATURES,
    wineStats: DEFAULT_WINE_STATS,
  },

  async onLoad() {
    await this.loadSocialData()
  },

  async onShow() {
    await this.loadSocialData()
  },

  async loadSocialData() {
    const [authSession, currentProfile, commerceState, judgeStats, wineFriends] = await Promise.all([
      getUserAuthSession().catch(() => ({ loggedIn: false, profile: null })),
      getCurrentProfile(),
      getUserCommerceState().catch(() => null),
      getManagedJudgeStats().catch(() => null),
      getWineFriends().catch(() => []),
    ])
    const displayProfile = authSession.loggedIn && authSession.profile ? authSession.profile : currentProfile

    this.setData({
      assetStats: [
        { value: String(commerceState?.points ?? 0), label: '我的积分' },
        { value: String(commerceState?.rewardRedemptions?.length ?? 0), label: '我的权益' },
        { value: String(commerceState?.unlockedTemplateIds?.length ?? 0), label: '已解锁模板' },
      ],
      currentProfile: displayProfile,
      wineStats: [
        { value: String(judgeStats?.hostedCount ?? 0), label: '发起酒局' },
        { value: String(judgeStats?.joinedCount ?? 0), label: '参与场次' },
        { value: String(judgeStats?.reportShareCount ?? 0), label: '战报分享' },
        { value: String(wineFriends.length), label: '我的聚友' },
      ],
    })
  },

  handleEditTap() {
    this.openPage('/pages/profile-edit/index')
  },

  handleMemberTap() {
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
    if (target) {
      this.openPage(target)
    }
  },

  handleFeatureTap(event) {
    const { name } = event.currentTarget.dataset as { name: string }
    const routes: Record<string, string> = {
      我的收藏: '/pages/favorites/index',
      使用记录: '/pages/usage-history/index',
      我的战报: '/pages/wine-history/index',
      我的权益: '/pages/coupon-center/index',
      积分商城: '/pages/wine-points/index?tab=mall',
      商户优惠: '/pages/merchant-partners/index',
      邀请好友: '/pages/invite-friends/index',
      设置: '/pages/settings/index',
    }
    const target = routes[name]

    if (target) {
      this.openPage(target)
      return
    }

    this.showPreviewToast(`${name} 暂未接入`)
  },

  handleTabTap(event) {
    const { tab } = event.currentTarget.dataset as { tab: string }
    const target = TAB_ROUTES[tab]

    if (!target || tab === 'me') {
      return
    }

    wx.redirectTo({ url: target })
  },

  handleWineStatTap(event) {
    const { label } = event.currentTarget.dataset as { label: string }
    const routes: Record<string, string> = {
      发起酒局: '/pages/wine-history/index',
      参与场次: '/pages/wine-history/index',
      战报分享: '/pages/wine-history/index',
      我的聚友: '/pages/friend-hub/index',
    }
    const target = routes[label]
    if (target) {
      this.openPage(target)
    }
  },

  showPreviewToast(message) {
    wx.showToast({
      title: message,
      icon: 'none',
    })
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
