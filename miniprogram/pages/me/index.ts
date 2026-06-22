import { getMembershipCatalog } from '../../services/content'
import {
  getManagedJudgeStats,
  getManagedShareImageSummaries,
  getManagedSessionMomentSummaries,
  retryManagedShareImageTask,
  type ManagedShareImageSummary,
  type ManagedSessionMomentSummary,
} from '../../services/operations'
import { showFirstLoginBonusModal } from '../../utils/firstLoginBonus'
import { getCurrentDisplayProfile, getUserAuthSession, loginWithWechatProfile, type SocialProfile } from '../../utils/social'

interface StatItem {
  label: string
  value: string
}

interface FeatureItem {
  iconClass: string
  id: string
  name: string
}

interface PendingAlbumItem {
  briefId: string
  actionLabel: string
  canResume: boolean
  coverUrl: string
  endedAt: string
  isEnded: boolean
  meta: string
  pendingMediaCount: number
  sessionId: string
  shareImageStatus: string
  shareImageTaskId: string
  state: string
  stateLabel: string
  status: string
  title: string
}

interface ShareGalleryItem {
  imageUrl: string
  meta: string
  sessionId: string
  taskId: string
  title: string
}

interface SessionMomentClassificationDebug {
  canResume: boolean
  endedAt: string
  isEnded: boolean
  sessionId: string
  state: string
  stateText: string
  status: string
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
  headerActionStyle: string
  membershipEnabled: boolean
  features: FeatureItem[]
  loggedIn: boolean
  momentSummaries: ManagedSessionMomentSummary[]
  sessionMomentClassificationDebug: SessionMomentClassificationDebug[]
  sessionMomentClassificationTotals: {
    ended: number
    ongoing: number
    total: number
  }
  pendingAlbumTotal: number
  shareGalleryTotal: number
  visibleShareImages: ShareGalleryItem[]
  visiblePendingAlbums: PendingAlbumItem[]
  wineStats: StatItem[]
}

interface MomentSummaryEventDetail {
  briefId?: string
  imageUrl?: string
  sessionId?: string
  shareImageTaskId?: string
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
  handleMomentBriefTap: (event: WechatMiniprogram.CustomEvent<MomentSummaryEventDetail>) => void
  handleMomentPreviewTap: (event: WechatMiniprogram.CustomEvent<MomentSummaryEventDetail>) => void
  handleMomentResumeTap: (event: WechatMiniprogram.CustomEvent<MomentSummaryEventDetail>) => void
  handleMomentRetryTap: (event: WechatMiniprogram.CustomEvent<MomentSummaryEventDetail>) => Promise<void>
  handlePendingAlbumAllTap: () => void
  handlePendingAlbumTap: (event: WechatMiniprogram.BaseEvent) => void
  handleShareGalleryAllTap: () => void
  handleShareGalleryTap: (event: WechatMiniprogram.BaseEvent) => void
  handleTabTap: (event: WechatMiniprogram.BaseEvent) => void
  handleWineStatTap: (event: WechatMiniprogram.BaseEvent) => void
  loadSocialData: () => Promise<void>
  noop: () => void
  openPage: (url: string) => void
  showPreviewToast: (message: string) => void
  updateHeaderActionStyle: () => void
}

const TAB_ROUTES: Record<string, string> = {
  home: '/pages/index/index',
  tools: '/pages/tools/index',
  rankings: '/pages/rankings/index',
  judge: '/pages/ledger/index',
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
  { value: '0', label: '总回忆数' },
  { value: '0', label: '进行中' },
  { value: '0', label: '已结束' },
]

const UNAVAILABLE_ASSET_STATS: StatItem[] = [
  { value: '--', label: '总回忆数' },
  { value: '--', label: '进行中' },
  { value: '--', label: '已结束' },
]

const DEFAULT_WINE_STATS: StatItem[] = [
  { value: '0', label: '我创建的' },
  { value: '0', label: '我参与的' },
  { value: '0', label: '已结束' },
]

const DEFAULT_FEATURES: FeatureItem[] = [
  { id: 'ledger', name: '聚会账本', iconClass: 'me-icon-history' },
  { id: 'tools', name: '工具箱', iconClass: 'me-icon-store' },
  { id: 'friends', name: '好友管理', iconClass: 'me-icon-user' },
  { id: 'settings', name: '资料设置', iconClass: 'me-icon-shield' },
]

const normalizeName = (value?: string) => {
  const text = String(value || '').trim()
  return !text || /^微信用户\d*$/.test(text) || /^酒友\d{3,}$/.test(text) || /^(PR|QA|DEV|TEST)\s+Seed\b/i.test(text) || text === '未登录' ? '' : text
}

const normalizeAvatar = (value?: string) => String(value || '').trim()
const internalAlbumTitlePattern = /^(IT|PR|QA|DEV|TEST)[-_ ][A-Z0-9_-]+(?:\s+(opening|highlight|drinking|private|closing))?$/i
const nodeTypeTitleMap: Record<string, string> = {
  closing: '收尾照片',
  drinking: '聚会账本',
  highlight: '聚会照片',
  opening: '开场照片',
  private: '私密记录',
}

const formatSummaryDate = (value?: string) => {
  const date = value ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) return ''
  return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const normalizePendingAlbumTitle = (title?: string, sessionName?: string, index = 0) => {
  const rawTitle = String(title || '').trim()
  const rawSessionName = String(sessionName || '').trim()
  const match = rawTitle.match(internalAlbumTitlePattern)
  if (match) {
    const nodeType = String(match[2] || '').toLowerCase()
    return nodeTypeTitleMap[nodeType] || `待分享回忆 ${index + 1}`
  }
  if (rawTitle) return rawTitle
  if (rawSessionName && !internalAlbumTitlePattern.test(rawSessionName)) return rawSessionName
  return `待分享回忆 ${index + 1}`
}

const isEndedSessionSummary = (item: ManagedSessionMomentSummary) => {
  const stateText = `${item.state || ''} ${item.status || ''} ${item.stateText || ''}`.trim()
  return Boolean(item.endedAt) || /已结束|结束|已完成|ended|finished|closed|complete|completed|done/i.test(stateText)
}

const hasGeneratedShareImage = (item: ManagedSessionMomentSummary) => Boolean(item.readyShareImageUrl || item.shareImageUrl)

const isPendingShareMemory = (item: ManagedSessionMomentSummary) => !isEndedSessionSummary(item) && !hasGeneratedShareImage(item)

const buildSessionMomentClassificationDebug = (items: ManagedSessionMomentSummary[]): SessionMomentClassificationDebug[] =>
  items.map((item) => ({
    canResume: item.canResume === true,
    endedAt: item.endedAt || '',
    isEnded: isEndedSessionSummary(item),
    sessionId: item.sessionId || '',
    state: item.state || '',
    stateText: item.stateText || '',
    status: item.status || '',
  }))

const buildSummaryStateLabel = (item: ManagedSessionMomentSummary, isEnded: boolean) => {
  if (isEnded) return '已结束'
  return String(item.stateText || item.status || item.state || '').trim()
}

const buildPendingAlbumItems = (items: ManagedSessionMomentSummary[]): PendingAlbumItem[] =>
  items.filter(isPendingShareMemory).slice(0, 5).map((item, index) => {
    const pendingMediaCount = Number(item.pendingMediaCount) || 0
    const canResumeMomentIds = Array.isArray(item.canResumeMomentIds) ? item.canResumeMomentIds.filter(Boolean) : []
    const shareImageStatus = String(item.shareImageStatus || '')
    const isEnded = isEndedSessionSummary(item)
    const stateLabel = buildSummaryStateLabel(item, isEnded)
    const canResume = !isEnded && (item.canResume || pendingMediaCount > 0 || canResumeMomentIds.length > 0)
    const actionLabel = isEnded ? '查看' : canResume ? '进入本局' : '查看'
    const statusText =
      isEnded
        ? item.endedAt
          ? `结束于 ${formatSummaryDate(item.endedAt)}`
          : '聚会已结束'
        : pendingMediaCount > 0
        ? `待补 ${pendingMediaCount} 张照片`
        : canResumeMomentIds.length
          ? '可继续补图'
          : '还没生成分享图'
    return {
      actionLabel,
      briefId: item.briefId || '',
      canResume,
      coverUrl: item.coverPhotoUrl || '',
      endedAt: item.endedAt || '',
      isEnded,
      meta: statusText,
      pendingMediaCount,
      sessionId: item.sessionId || '',
      shareImageStatus,
      shareImageTaskId: item.shareImageTaskId || '',
      state: item.state || '',
      stateLabel,
      status: item.status || '',
      title: normalizePendingAlbumTitle(item.title, item.sessionName, index),
    }
  })

const buildShareGalleryItems = (
  items: ManagedSessionMomentSummary[],
  shareImages: ManagedShareImageSummary[] = [],
): ShareGalleryItem[] => {
  const seen = new Set<string>()
  const result: ShareGalleryItem[] = []
  const pushItem = (item: ShareGalleryItem) => {
    const key = item.taskId || item.imageUrl
    if (!key || seen.has(key)) return
    seen.add(key)
    result.push(item)
  }

  shareImages.forEach((item, index) => {
    pushItem({
      imageUrl: item.readyShareImageUrl || item.imageUrl || '',
      meta: formatSummaryDate(item.finishedAt || item.updatedAt || item.createdAt) || '分享图已生成',
      sessionId: item.sessionId || '',
      taskId: item.id || '',
      title: normalizePendingAlbumTitle(item.sessionName, item.sessionName, index),
    })
  })

  items.filter(hasGeneratedShareImage).forEach((item, index) => {
    pushItem({
      imageUrl: item.readyShareImageUrl || item.shareImageUrl || '',
      meta: formatSummaryDate(item.updatedAt || item.endedAt || item.createdAt) || '分享图已生成',
      sessionId: item.sessionId || '',
      taskId: item.shareImageTaskId || '',
      title: normalizePendingAlbumTitle(item.title, item.sessionName, index),
    })
  })

  return result.slice(0, 6)
}

const persistAvatar = (avatarUrl: string) =>
  new Promise<string>((resolve) => {
    const source = normalizeAvatar(avatarUrl)
    resolve(source)
  })

const buildHeaderActionStyle = () => {
  try {
    const rect = wx.getMenuButtonBoundingClientRect()
    const system = wx.getSystemInfoSync()
    const windowWidth = Number(system.windowWidth || 375)
    const menuTop = Number(rect.top || Number(system.statusBarHeight || 0) + 4)
    const menuHeight = Number(rect.height || 32)
    const menuLeft = Number(rect.left || windowWidth - 96)
    const capsuleReserveWidth = Math.max(88, windowWidth - menuLeft)
    const size = Math.max(32, Math.min(40, menuHeight))
    const top = menuTop + Math.max(0, (menuHeight - size) / 2)
    const right = capsuleReserveWidth + 12
    return `position: fixed; top: ${top}px; right: ${right}px; width: ${size}px; height: ${size}px;`
  } catch {
    return ''
  }
}

Page<MePageState, MePageMethods>({
  data: {
    assetStats: DEFAULT_ASSET_STATS,
    authAvatarUrl: '',
    authAvatarChoosing: false,
    authName: '',
    authPanelVisible: false,
    authSubmitting: false,
    currentProfile: DEFAULT_PROFILE,
    headerActionStyle: '',
    membershipEnabled: true,
    features: DEFAULT_FEATURES,
    loggedIn: false,
    momentSummaries: [],
    sessionMomentClassificationDebug: [],
    sessionMomentClassificationTotals: {
      ended: 0,
      ongoing: 0,
      total: 0,
    },
    pendingAlbumTotal: 0,
    shareGalleryTotal: 0,
    visibleShareImages: [],
    visiblePendingAlbums: [],
    wineStats: DEFAULT_WINE_STATS,
  },

  async onLoad() {
    this.updateHeaderActionStyle()
    await this.loadSocialData()
  },

  async onShow() {
    this.updateHeaderActionStyle()
    await this.loadSocialData()
  },

  async loadSocialData() {
    const [authSession, currentProfile, judgeStats, membershipCatalog, momentSummariesResult, shareImageSummariesResult] = await Promise.all([
      getUserAuthSession().catch(() => ({ loggedIn: false, profile: null })),
      getCurrentDisplayProfile().catch(() => DEFAULT_PROFILE),
      getManagedJudgeStats().catch(() => null),
      getMembershipCatalog().catch(() => null),
      getManagedSessionMomentSummaries()
        .then((items) => ({ ok: true as const, items }))
        .catch((error) => {
          console.warn('[me] failed to load session moment summaries', error)
          return { ok: false as const, items: this.data.momentSummaries }
        }),
      getManagedShareImageSummaries()
        .then((items) => ({ ok: true as const, items }))
        .catch((error) => {
          console.warn('[me] failed to load share image summaries', error)
          return { ok: false as const, items: [] as ManagedShareImageSummary[] }
        }),
    ])
    const displayProfile = authSession.profile || currentProfile || DEFAULT_PROFILE
    const loggedIn = Boolean(authSession.loggedIn && authSession.profile?.wechatOpenId)
    const resolvedMomentSummaries = momentSummariesResult.items
    const pendingShareSummaries = resolvedMomentSummaries.filter(isPendingShareMemory)
    const resolvedShareImageSummaries = shareImageSummariesResult.items
    const generatedShareSummaries = resolvedMomentSummaries.filter(hasGeneratedShareImage)
    const endedSummaries = resolvedMomentSummaries.filter(isEndedSessionSummary)
    const ongoingSummaries = resolvedMomentSummaries.filter((item) => !isEndedSessionSummary(item))
    const assetStats = momentSummariesResult.ok
      ? [
          { value: String(resolvedMomentSummaries.length), label: '总回忆数' },
          { value: String(ongoingSummaries.length), label: '进行中' },
          { value: String(endedSummaries.length), label: '已结束' },
        ]
      : UNAVAILABLE_ASSET_STATS
    const sessionMomentClassificationDebug = buildSessionMomentClassificationDebug(resolvedMomentSummaries)
    const sessionMomentClassificationTotals = {
      ended: endedSummaries.length,
      ongoing: ongoingSummaries.length,
      total: resolvedMomentSummaries.length,
    }
    console.info('[me] session moment classification', {
      items: sessionMomentClassificationDebug,
      totals: sessionMomentClassificationTotals,
    })
    this.setData({
      assetStats,
      authAvatarUrl: loggedIn ? '' : this.data.authAvatarUrl || normalizeAvatar(displayProfile.avatarUrl),
      authName: loggedIn ? '' : this.data.authName || normalizeName(displayProfile.name),
      authPanelVisible: loggedIn ? false : this.data.authPanelVisible,
      currentProfile: { ...displayProfile, name: normalizeName(displayProfile.name), avatarUrl: normalizeAvatar(displayProfile.avatarUrl) },
      loggedIn,
      membershipEnabled: Boolean(membershipCatalog ? membershipCatalog.membershipEnabled : true),
      momentSummaries: resolvedMomentSummaries,
      sessionMomentClassificationDebug,
      sessionMomentClassificationTotals,
      pendingAlbumTotal: pendingShareSummaries.length,
      shareGalleryTotal: shareImageSummariesResult.ok ? resolvedShareImageSummaries.length : generatedShareSummaries.length,
      visibleShareImages: buildShareGalleryItems(resolvedMomentSummaries, resolvedShareImageSummaries),
      visiblePendingAlbums: buildPendingAlbumItems(resolvedMomentSummaries),
      wineStats: [
        { value: String(judgeStats?.hostedCount ?? 0), label: '我创建的' },
        { value: String(judgeStats?.joinedCount ?? 0), label: '我参与的' },
        { value: String(endedSummaries.length), label: '已结束' },
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

  handleAssetTap(event) {
    const { label } = event.currentTarget.dataset as { label: string }
    const routes: Record<string, string> = {
      总回忆数: '/pages/album/index?mode=records',
      回忆数: '/pages/album/index?mode=records',
      相册数: '/pages/album/index?mode=records',
      进行中: '/pages/album/index?mode=records&filter=ongoing',
      已结束: '/pages/album/index?mode=records&filter=ended',
    }
    const target = routes[label]
    if (target) {
      this.openPage(target)
      return
    }
    this.showPreviewToast('从下方待分享回忆选择具体聚会查看')
  },

  handleMomentBriefTap(event) {
    const { briefId, sessionId } = event.detail
    if (briefId) {
      this.openPage(`/pages/session-brief/index?briefId=${encodeURIComponent(briefId)}`)
      return
    }
    if (sessionId) {
      this.openPage(`/pages/session-brief/index?sessionId=${encodeURIComponent(sessionId)}`)
      return
    }
    this.showPreviewToast('缺少简报信息')
  },

  handleMomentPreviewTap(event) {
    const imageUrl = event.detail.imageUrl || ''
    if (!imageUrl) {
      this.showPreviewToast('分享图还未生成')
      return
    }
    wx.previewImage({
      current: imageUrl,
      urls: [imageUrl],
    })
  },

  handleMomentResumeTap(event) {
    const { briefId, sessionId } = event.detail
    if (briefId) {
      this.openPage(`/pages/session-brief/index?briefId=${encodeURIComponent(briefId)}`)
      return
    }
    if (sessionId) {
      this.openPage(`/pages/session-brief/index?sessionId=${encodeURIComponent(sessionId)}`)
      return
    }
    this.showPreviewToast('缺少可补图聚会')
  },

  async handleMomentRetryTap(event) {
    const taskId = event.detail.shareImageTaskId || ''
    if (!taskId) {
      this.showPreviewToast('未找到分享图任务')
      return
    }

    wx.showLoading({ title: '重试中', mask: true })
    try {
      await retryManagedShareImageTask(taskId)
      await this.loadSocialData()
      this.showPreviewToast('已重新排队')
    } catch (error) {
      this.showPreviewToast(error instanceof Error ? error.message : '重试失败')
    } finally {
      wx.hideLoading()
    }
  },

  handlePendingAlbumAllTap() {
    this.openPage('/pages/album/index?mode=unshared')
  },

  handlePendingAlbumTap(event) {
    const { sessionId } = event.currentTarget.dataset as { sessionId?: string }
    if (sessionId) {
      this.openPage(`/pages/live-record/index?sessionId=${encodeURIComponent(sessionId)}`)
      return
    }
    this.showPreviewToast('缺少回忆信息')
  },

  handleShareGalleryAllTap() {
    this.openPage('/pages/album/index?mode=shares')
  },

  handleShareGalleryTap(event) {
    const { imageUrl } = event.currentTarget.dataset as { imageUrl?: string }
    if (imageUrl) {
      wx.previewImage({ current: imageUrl, urls: [imageUrl] })
      return
    }
    this.showPreviewToast('分享图还未生成')
  },

  handleFeatureTap(event) {
    const { name } = event.currentTarget.dataset as { name: string }
    const routes: Record<string, string> = {
      聚会账本: '/pages/ledger/index',
      工具箱: '/pages/tools/index',
      好友管理: '/pages/friend-hub/index',
      我的权益: '/pages/feature-zones/index?zone=benefits',
      会员权益: '/pages/feature-zones/index?zone=membership',
      积分与奖励: '/pages/feature-zones/index?zone=points',
      合作优惠: '/pages/feature-zones/index?zone=merchants',
      我的收藏: '/pages/feature-zones/index?zone=favorites',
      使用记录: '/pages/feature-zones/index?zone=usage',
      邀请奖励: '/pages/feature-zones/index?zone=invite',
      模板中心: '/pages/feature-zones/index?zone=templates',
      资料设置: '/pages/settings/index',
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
      我创建的: '/pages/ledger/index',
      我参与的: '/pages/friend-hub/index',
      已结束: '/pages/album/index?mode=ended',
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

  updateHeaderActionStyle() {
    this.setData({ headerActionStyle: buildHeaderActionStyle() })
  },
})

export {}
