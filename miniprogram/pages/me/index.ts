import {
  addWineFriend,
  addWineFriendByProfile,
  getCurrentProfile,
  getWineFriends,
  removeWineFriend,
  searchRegisteredUsers,
  sendPokeToFriend,
  type SearchUserResult,
  updateWineFriend,
  type SocialProfile,
  type WineFriend,
} from '../../utils/social'
import { avatarAsset } from '../../config/assets'
import { getUserCommerceState } from '../../services/content'

interface StatItem {
  label: string
  value: string
}

interface FeatureItem {
  id: string
  name: string
  iconClass: string
}

interface MeWineFriend extends WineFriend {
  editing?: boolean
}

interface MePageState {
  assetStats: StatItem[]
  currentProfile: SocialProfile
  editingFriendId: string
  editingFriendName: string
  wineStats: StatItem[]
  features: FeatureItem[]
  newFriendName: string
  newFriendMatches: SearchUserResult[]
  wineFriends: MeWineFriend[]
}

interface MePageMethods {
  handleAssetTap: (event: WechatMiniprogram.BaseEvent) => void
  handleAddFriendTap: () => void
  handleAddRegisteredFriendTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handleCancelEditTap: () => void
  handleDeleteFriendTap: (event: WechatMiniprogram.BaseEvent) => void
  handleEditFriendInput: (event: WechatMiniprogram.Input) => void
  handleEditTap: () => void
  handleFeatureTap: (event: WechatMiniprogram.BaseEvent) => void
  handleMemberTap: () => void
  handleNewFriendInput: (event: WechatMiniprogram.Input) => void
  handlePokeTap: (event: WechatMiniprogram.BaseEvent) => void
  handleSaveFriendTap: (event: WechatMiniprogram.BaseEvent) => void
  handleStartEditTap: (event: WechatMiniprogram.BaseEvent) => void
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

Page<MePageState, MePageMethods>({
  data: {
    assetStats: [
      { value: '3286', label: '我的积分' },
      { value: '6', label: '优惠券' },
      { value: '2', label: '资产包' },
    ],
    currentProfile: {
      id: 'me-owner',
      name: '小太阳组会玩',
      avatarUrl: avatarAsset(1),
      city: '上海',
      identityTag: '酒局常驻玩家',
      signature: '今晚这局不见不散。',
      phone: '',
      phoneMasked: '',
      wechatOpenId: '',
    },
    editingFriendId: '',
    editingFriendName: '',
    wineStats: [
      { value: '16', label: '发起酒局' },
      { value: '48', label: '参与场次' },
      { value: '23', label: '战报分享' },
      { value: '0', label: '我的聚友' },
    ],
    features: [
      { id: 'favorites', name: '我的收藏', iconClass: 'me-icon-star' },
      { id: 'history', name: '使用记录', iconClass: 'me-icon-history' },
      { id: 'reports', name: '我的战报', iconClass: 'me-icon-report' },
      { id: 'coupons', name: '优惠券', iconClass: 'me-icon-ticket' },
      { id: 'points', name: '积分商城', iconClass: 'me-icon-shield' },
      { id: 'merchant', name: '商户优惠', iconClass: 'me-icon-store' },
      { id: 'invite', name: '邀请好友', iconClass: 'me-icon-user' },
      { id: 'settings', name: '设置', iconClass: 'me-icon-settings' },
    ],
    newFriendName: '',
    newFriendMatches: [],
    wineFriends: [],
  },

  async onLoad() {
    await this.loadSocialData()
  },

  async onShow() {
    await this.loadSocialData()
  },

  async loadSocialData() {
    const [currentProfile, commerceState] = await Promise.all([getCurrentProfile(), getUserCommerceState().catch(() => null)])
    const wineFriends = (await getWineFriends()).map((item) => ({
      ...item,
      editing: item.id === this.data.editingFriendId,
    }))

    this.setData({
      assetStats: [
        { value: String(commerceState?.points ?? 0), label: '我的积分' },
        { value: String(commerceState?.ownedRewardIds?.length ?? 0), label: '优惠券' },
        { value: String(commerceState?.unlockedTemplateIds?.length ?? 0), label: '资产包' },
      ],
      currentProfile,
      wineStats: [
        { value: '16', label: '发起酒局' },
        { value: '48', label: '参与场次' },
        { value: '23', label: '战报分享' },
        { value: String(wineFriends.length), label: '我的聚友' },
      ],
      wineFriends,
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
      '我的积分': '/pages/wine-points/index?tab=tasks',
      优惠券: '/pages/coupon-center/index',
      资产包: '/pages/premium-templates/index',
    }
    const target = routes[label]
    if (!target) {
      return
    }

    this.openPage(target)
  },

  handleFeatureTap(event) {
    const { name } = event.currentTarget.dataset as { name: string }
    const routes: Record<string, string> = {
      '我的收藏': '/pages/favorites/index',
      '使用记录': '/pages/usage-history/index',
      '我的战报': '/pages/wine-history/index',
      '优惠券': '/pages/coupon-center/index',
      '积分商城': '/pages/wine-points/index?tab=mall',
      '商户优惠': '/pages/merchant-partners/index',
      '邀请好友': '/pages/invite-friends/index',
      '设置': '/pages/settings/index',
    }
    const target = routes[name]

    if (target) {
      this.openPage(target)
      return
    }

    this.showPreviewToast(`${name} 下一步接入`)
  },

  async handleNewFriendInput(event) {
    const value = event.detail.value || ''
    const newFriendMatches = value.trim() ? await searchRegisteredUsers(value) : []
    this.setData({
      newFriendMatches,
      newFriendName: value,
    })
  },

  async handleAddFriendTap() {
    const value = this.data.newFriendName.trim()

    if (!value) {
      this.showPreviewToast('先输入酒友昵称')
      return
    }

    await addWineFriend(value, '最近添加')
    this.setData({
      newFriendName: '',
      newFriendMatches: [],
    })
    await this.loadSocialData()
  },

  async handleAddRegisteredFriendTap(event) {
    const { profileId, name } = event.currentTarget.dataset as { name: string; profileId: string }
    await addWineFriendByProfile(profileId, name, '已从注册用户添加')
    this.setData({
      newFriendMatches: this.data.newFriendMatches.map((item) =>
        item.id === profileId ? { ...item, alreadyFriend: true } : item,
      ),
      newFriendName: '',
    })
    await this.loadSocialData()
  },

  handleStartEditTap(event) {
    const { id } = event.currentTarget.dataset as { id: string }
    const target = this.data.wineFriends.find((item) => item.id === id)

    if (!target) {
      return
    }

    this.setData({
      editingFriendId: id,
      editingFriendName: target.name,
      wineFriends: this.data.wineFriends.map((item) => ({
        ...item,
        editing: item.id === id,
      })),
    })
  },

  handleEditFriendInput(event) {
    this.setData({
      editingFriendName: event.detail.value || '',
    })
  },

  async handleSaveFriendTap(event) {
    const { id } = event.currentTarget.dataset as { id: string }
    const value = this.data.editingFriendName.trim()

    if (!value) {
      this.showPreviewToast('昵称不能为空')
      return
    }

    await updateWineFriend(id, {
      name: value,
      meta: '刚编辑过昵称',
    })
    this.setData({
      editingFriendId: '',
      editingFriendName: '',
    })
    await this.loadSocialData()
  },

  handleCancelEditTap() {
    this.setData({
      editingFriendId: '',
      editingFriendName: '',
      wineFriends: this.data.wineFriends.map((item) => ({
        ...item,
        editing: false,
      })),
    })
  },

  async handleDeleteFriendTap(event) {
    const { id } = event.currentTarget.dataset as { id: string }
    await removeWineFriend(id)

    if (this.data.editingFriendId === id) {
      this.setData({
        editingFriendId: '',
        editingFriendName: '',
      })
    }

    await this.loadSocialData()
  },

  async handlePokeTap(event) {
    const { id } = event.currentTarget.dataset as { id: string }
    const result = await sendPokeToFriend(id)

    if (!result) {
      this.showPreviewToast('暂时不能拍自己')
      return
    }

    this.showPreviewToast(result.status === 'matched' ? '你们已经合拍了' : '已拍一拍对方')
    await this.loadSocialData()
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
      战报分享: '/pages/share-poster/index',
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
