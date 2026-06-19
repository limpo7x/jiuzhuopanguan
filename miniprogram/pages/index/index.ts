import { homePageMock, type HomePageData } from '../../mock/home'
import { claimPointsTask, getUserCommerceState } from '../../services/content'
import { getHomePageData } from '../../services/home'
import {
  getManagedSessionBrief,
  getManagedSessionMomentSummaries,
  joinManagedSession,
  recordManagedToolUsage,
  type ManagedSessionBrief,
  type ManagedSessionMomentSummary,
  type ManagedTimelineNode,
} from '../../services/operations'
import { showFirstLoginBonusModal } from '../../utils/firstLoginBonus'
import { getSessionRuntime, setSessionRuntime, type SessionParticipant } from '../../utils/session'
import { buildSessionReturnFromRuntime, EMPTY_SESSION_RETURN, openSessionReturn, type SessionReturnBarData } from '../../utils/session-return'
import { ensureUserAuthorized, getCurrentDisplayProfile, getUserAuthSession, getUserSessionToken, loginWithWechatProfile } from '../../utils/social'

interface HomePageState {
  authAvatarUrl: string
  authPanelVisible: boolean
  authRedirectUrl: string
  authName: string
  authSubmitting: boolean
  canCheckIn: boolean
  checkedIn: boolean
  home: HomePageData
  lastLoadedAt: number
  loading: boolean
  loggedIn: boolean
  sessionReturn: SessionReturnBarData
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
  handleAlbumListTap: () => void
  handleAlbumTap: (event: WechatMiniprogram.BaseEvent) => void
  handleJoinByCodeTap: () => Promise<void>
  joinByInviteCode: (inviteCode: string) => Promise<void>
  handlePrimaryTap: () => Promise<void>
  handleContinueRecordTap: () => void
  handleQuickToolTap: (event: WechatMiniprogram.BaseEvent) => void
  handleSessionReturnOpen: () => void
  handleTabTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handleToolTap: (event: WechatMiniprogram.BaseEvent) => void
  loadHomePage: () => Promise<void>
  noop: () => void
  openPage: (url: string) => void
  refreshSessionReturn: () => void
  syncAuthState: () => Promise<void>
}

const TAB_ROUTES: Record<string, string> = {
  album: '/pages/album/index?mode=host',
  home: '/pages/index/index',
  ledger: '/pages/ledger/index',
  tools: '/pages/tools/index',
  judge: '/pages/ledger/index',
  me: '/pages/me/index',
}

const normalizeName = (value?: string) => {
  const text = String(value || '').trim()
  return !text || /^微信用户\d*$/.test(text) || /^酒友\d{3,}$/.test(text) || /^(PR|QA|DEV|TEST)\s+Seed\b/i.test(text) || text === '未登录' ? '' : text
}

const normalizeAvatar = (value?: string) => String(value || '').trim()
const normalizeInviteCode = (value?: string) => String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
const internalAlbumTitlePattern = /^(IT|PR|QA|DEV|TEST)[-_ ][A-Z0-9_-]+(?:\s+(opening|highlight|drinking|private|closing))?$/i
const internalVisibleTextPattern = /(IT-MOMENTS|PR-BE-DB-LOGIN|PR[_-]?BE|QA[_-]?SEED|DEV[_-]?SEED|TEST[_-]?SEED|DEBUG|[a-z]+-[0-9a-f]{8,}|session-[0-9a-z-]+|brief-[0-9a-z-]+|share-task-[0-9a-z-]+)/i
const internalProfilePattern = /^(PR|QA|DEV|TEST)\s+Seed\s+/i
const albumFallbacks: HomePageData['recentTools'] = [
  {
    id: 'album-host',
    name: '我的聚会相册',
    usedAt: '',
    imageUrl: '',
    badgeText: '相册',
    badgeClass: '',
    route: '/pages/album/index?mode=host',
  },
  {
    id: 'album-joined',
    name: '参与过的聚会',
    usedAt: '',
    imageUrl: '',
    badgeText: '参与',
    badgeClass: '',
    route: '/pages/album/index?mode=joined',
  },
  {
    id: 'album-share',
    name: '分享图记录',
    usedAt: '',
    imageUrl: '',
    badgeText: '分享',
    badgeClass: '',
    route: '/pages/album/index?mode=unshared',
  },
]
const toolLikePattern = /工具|二维码|口令|模板|文案|生成|压缩|去水印|计数/

const nodeTypeTitleMap: Record<string, string> = {
  closing: '收尾照片',
  drinking: '聚会账本',
  highlight: '聚会照片',
  opening: '开场照片',
  private: '私密记录',
}

const normalizeAlbumTitle = (title?: string, sessionName?: string, index = 0) => {
  const rawTitle = String(title || '').trim()
  const rawSessionName = String(sessionName || '').trim()
  const match = rawTitle.match(internalAlbumTitlePattern)
  if (match || internalVisibleTextPattern.test(rawTitle)) {
    const nodeType = String(match?.[2] || '').toLowerCase()
    return nodeTypeTitleMap[nodeType] || `聚会相册 ${index + 1}`
  }
  if (rawTitle && !internalProfilePattern.test(rawTitle) && !internalVisibleTextPattern.test(rawTitle)) {
    return rawTitle
  }
  if (rawSessionName && !internalAlbumTitlePattern.test(rawSessionName) && !internalProfilePattern.test(rawSessionName) && !internalVisibleTextPattern.test(rawSessionName)) {
    return rawSessionName
  }
  return `聚会相册 ${index + 1}`
}

const normalizeAlbumBadge = (value?: string, fallback = '相册') => {
  const text = String(value || '').trim()
  if (!text || internalVisibleTextPattern.test(text) || /^[a-z_ -]+$/i.test(text)) {
    return fallback
  }
  return text
}

const normalizeAlbumMeta = (value?: string) => {
  const text = String(value || '').trim()
  if (!text || internalVisibleTextPattern.test(text) || /^(ready|failed|pending|processing|public|debug)$/i.test(text)) {
    return ''
  }
  return text
}

const formatAlbumUsedAt = (value?: string) => {
  if (!value) {
    return ''
  }
  const timestamp = Date.parse(value)
  if (!Number.isFinite(timestamp)) {
    return value
  }
  const diff = Date.now() - timestamp
  if (diff < 60 * 1000) return '刚刚更新'
  if (diff < 60 * 60 * 1000) return `${Math.max(1, Math.floor(diff / 60000))} 分钟前`
  if (diff < 24 * 60 * 60 * 1000) return `${Math.max(1, Math.floor(diff / 3600000))} 小时前`
  return `${Math.max(1, Math.floor(diff / 86400000))} 天前`
}

const buildAlbumRoute = (item: ManagedSessionMomentSummary) => {
  if (item.briefId) {
    return `/pages/session-brief/index?briefId=${encodeURIComponent(item.briefId)}`
  }
  if (item.sessionId) {
    return `/pages/session-brief/index?sessionId=${encodeURIComponent(item.sessionId)}`
  }
  return '/pages/album/index?mode=host'
}

const isMomentNodeWithImage = (node: ManagedTimelineNode): node is Extract<ManagedTimelineNode, { nodeKind: 'moment' }> =>
  node.nodeKind === 'moment' && !node.isTimelinePlaceholder && !!node.imageUrl

const getMomentNodeTime = (node: Extract<ManagedTimelineNode, { nodeKind: 'moment' }>) => {
  const timestamp = Date.parse(node.createdAt || node.updatedAt || '')
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : Number.MAX_SAFE_INTEGER
}

const findFirstBriefPhoto = (brief?: ManagedSessionBrief) => {
  const node = (brief?.timeline?.nodes || [])
    .filter(isMomentNodeWithImage)
    .sort((left, right) => {
      const timeDiff = getMomentNodeTime(left) - getMomentNodeTime(right)
      if (timeDiff !== 0) return timeDiff
      const leftOpening = left.nodeType === 'opening' ? 0 : 1
      const rightOpening = right.nodeType === 'opening' ? 0 : 1
      if (leftOpening !== rightOpening) return leftOpening - rightOpening
      return String(left.id || '').localeCompare(String(right.id || ''))
    })[0]
  return node?.imageUrl || ''
}

const mapRecentAlbumsFromSummaries = async (items: ManagedSessionMomentSummary[]): Promise<HomePageData['recentTools']> =>
  Promise.all(items.slice(0, 3).map(async (item, index) => {
    let firstPhotoUrl = ''
    let briefCreatedAt = item.createdAt || ''
    if (item.briefId) {
      try {
        const brief = await getManagedSessionBrief(item.briefId)
        firstPhotoUrl = findFirstBriefPhoto(brief) || firstPhotoUrl
        briefCreatedAt = briefCreatedAt || brief.createdAt || brief.updatedAt || ''
      } catch {
        firstPhotoUrl = ''
      }
    }
    firstPhotoUrl = firstPhotoUrl || item.coverPhotoUrl || ''
    return {
    id: item.briefId || item.sessionId || `album-summary-${index}`,
    name: normalizeAlbumTitle(item.title, item.sessionName, index),
    usedAt: formatAlbumUsedAt(briefCreatedAt),
    imageUrl: firstPhotoUrl || '',
    badgeText: item.shareImageStatus === 'ready' ? '分享图' : '相册',
    badgeClass: 'green',
    route: buildAlbumRoute(item),
    }
  }))

const normalizeRecentAlbums = (items: HomePageData['recentTools']) =>
  (items.length ? items : albumFallbacks).slice(0, 3).map((item, index) => {
    const fallback = albumFallbacks[index] || albumFallbacks[0]
    const name = toolLikePattern.test(item.name) ? fallback.name : normalizeAlbumTitle(item.name, '', index)
    const fallbackName = fallback.name || `聚会相册 ${index + 1}`
    return {
      ...item,
      id: item.id || fallback.id,
      name: name || fallbackName,
      route: item.route || fallback.route,
      imageUrl: item.imageUrl || fallback.imageUrl || '',
      badgeText: normalizeAlbumBadge(item.badgeText, fallback.badgeText || '相册'),
      badgeClass: item.badgeClass || '',
      usedAt: normalizeAlbumMeta(item.usedAt),
    }
  })

const persistAvatar = (avatarUrl: string) =>
  new Promise<string>((resolve) => {
    const source = normalizeAvatar(avatarUrl)
    resolve(source)
  })

Page<HomePageState, HomePageMethods>({
  data: {
    authAvatarUrl: '',
    authPanelVisible: false,
    authRedirectUrl: '',
    authName: '',
    authSubmitting: false,
    canCheckIn: false,
    checkedIn: false,
    home: {
      ...homePageMock,
      recentTools: normalizeRecentAlbums([]),
    },
    lastLoadedAt: 0,
    loading: false,
    loggedIn: false,
    sessionReturn: EMPTY_SESSION_RETURN,
    signingIn: false,
    userAvatarUrl: '',
    userName: '未登录',
  },

  onLoad(query) {
    this.refreshSessionReturn()
    void this.syncAuthState()
    void this.loadHomePage()
    const inviteCode = normalizeInviteCode(typeof query?.inviteCode === 'string' ? decodeURIComponent(query.inviteCode) : '')
    if (inviteCode) {
      setTimeout(() => {
        void this.joinByInviteCode(inviteCode)
      }, 350)
    }
  },

  onShow() {
    this.refreshSessionReturn()
    void this.syncAuthState()
    if (!this.data.loading && Date.now() - this.data.lastLoadedAt > 45000) {
      void this.loadHomePage()
    }
  },

  refreshSessionReturn() {
    this.setData({
      sessionReturn: buildSessionReturnFromRuntime(getSessionRuntime()),
    })
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

  async loadHomePage() {
    try {
      const homePromise = getHomePageData()
      let albumSummaries: ManagedSessionMomentSummary[] = []
      const token = getUserSessionToken()
      if (token) {
        const session = await getUserAuthSession().catch(() => ({ loggedIn: false, profile: null }))
        if (session.loggedIn && session.profile?.wechatOpenId) {
          albumSummaries = await getManagedSessionMomentSummaries()
        }
      }
      const home = await homePromise
      const recentAlbums = await mapRecentAlbumsFromSummaries(albumSummaries)
      this.setData({
        home: {
          ...home,
          complianceCopy: homePageMock.complianceCopy,
          hero: homePageMock.hero,
          quickTools: homePageMock.quickTools.slice(0, 3),
          recentTools: normalizeRecentAlbums(recentAlbums),
        },
        lastLoadedAt: Date.now(),
        loading: false,
      })
    } catch {
      this.setData({
        home: {
          ...this.data.home,
          recentTools: normalizeRecentAlbums([]),
        },
        lastLoadedAt: Date.now(),
        loading: false,
      })
    }
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
      const redirectUrl = this.data.authRedirectUrl
      this.setData({
        authAvatarUrl: '',
        authPanelVisible: false,
        authRedirectUrl: '',
        authName: '',
        canCheckIn: true,
        loggedIn: true,
        userAvatarUrl: normalizeAvatar(profile.avatarUrl) || avatarUrl,
        userName: normalizeName(profile.name) || name,
      })
      await this.syncAuthState()
      const bonusShown = await showFirstLoginBonusModal(profile)
      if (!bonusShown) {
        wx.showToast({ title: '登录成功', icon: 'success' })
      }
      if (redirectUrl) {
        wx.navigateTo({ url: redirectUrl })
      }
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
    this.setData({ authPanelVisible: true, authRedirectUrl: '' })
  },

  closeAuthPanel() {
    this.setData({ authPanelVisible: false, authRedirectUrl: '' })
  },

  noop() {
    return
  },

  async handlePrimaryTap() {
    const session = await getUserAuthSession().catch(() => ({ loggedIn: false, profile: null }))
    if (!session.loggedIn || !session.profile?.wechatOpenId) {
      this.setData({ authPanelVisible: true, authRedirectUrl: '/pages/create-session/index' })
      return
    }
    wx.navigateTo({ url: '/pages/create-session/index' })
  },

  handleContinueRecordTap() {
    if (this.data.sessionReturn.visible) {
      openSessionReturn(this.data.sessionReturn)
      return
    }
    wx.navigateTo({ url: '/pages/album/index?mode=joined' })
  },

  handleAlbumListTap() {
    wx.navigateTo({ url: '/pages/album/index?mode=host' })
  },

  handleAlbumTap(event) {
    const { route } = event.currentTarget.dataset as { route?: string }
    this.openPage(route || '/pages/album/index?mode=host')
  },

  async handleJoinByCodeTap() {
    const profile = await ensureUserAuthorized('/pages/index/index')
    if (!profile) {
      this.handleLoginTextTap()
      return
    }
    const inviteCode = await new Promise<string>((resolve) => {
      wx.showModal({
        title: '输入口令加入',
        placeholderText: '请输入聚会口令',
        editable: true,
        confirmText: '加入',
        cancelText: '取消',
        success: (result) => resolve(result.confirm ? normalizeInviteCode(result.content) : ''),
        fail: () => resolve(''),
      } as WechatMiniprogram.ShowModalOption)
    })
    if (!inviteCode) {
      wx.showToast({ title: '请输入聚会口令', icon: 'none' })
      return
    }
    await this.joinByInviteCode(inviteCode)
  },

  async joinByInviteCode(inviteCode) {
    const normalizedCode = normalizeInviteCode(inviteCode)
    if (!normalizedCode) {
      wx.showToast({ title: '请输入聚会口令', icon: 'none' })
      return
    }

    const profile = await ensureUserAuthorized('/pages/index/index?inviteCode=' + encodeURIComponent(normalizedCode))
    if (!profile) {
      this.handleLoginTextTap()
      return
    }

    try {
      wx.showLoading({ title: '加入中', mask: true })
      const liveSession = await joinManagedSession(normalizedCode)
      setSessionRuntime({
        currentUser: { id: profile.id, name: profile.name, avatarUrl: profile.avatarUrl },
        inviteCode: liveSession.inviteCode,
        isJudge: false,
        playerCount: liveSession.playerCount,
        playerStats: [],
        selectedPlayers: liveSession.joinStatusPlayers.map<SessionParticipant>((item) => ({
          avatarUrl: item.avatarUrl,
          name: item.name,
          profileId: item.profileId,
          status: item.status,
        })),
        sessionId: liveSession.id,
        sessionName: liveSession.sessionName,
        startedAt: 0,
        templateName: liveSession.templateName,
      })
      wx.redirectTo({ url: '/pages/waiting-room/index?role=viewer&sessionId=' + encodeURIComponent(liveSession.id) })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'join failed'
      const notPlayer = message.includes('not session player')
      wx.showModal({
        title: notPlayer ? '暂不能加入' : '加入失败',
        content: notPlayer ? '当前口令对应的聚会名单中没有你的账号，请联系发起人确认是否已添加你。' : '当前无法加入聚会，请检查口令是否正确。',
        showCancel: false,
      })
    } finally {
      wx.hideLoading()
    }
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
      const latestState = await getUserCommerceState()
      const latestSignInState = latestState.taskClaimStates?.['task-signin']
      if (latestSignInState && !latestSignInState.canClaim) {
        this.setData({ checkedIn: true })
        this.announcePreview('今天已经签到过了')
        return
      }
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
    const { id, route } = event.currentTarget.dataset as { id: string; route?: string }
    void recordManagedToolUsage(id)
    this.openPage(route || '/pages/privacy-state/index?type=feature')
  },

  handleToolTap(event) {
    const { id, route } = event.currentTarget.dataset as { id: string; route?: string }
    void recordManagedToolUsage(id)
    this.openPage(route || '/pages/privacy-state/index?type=feature')
  },

  handleSessionReturnOpen() {
    openSessionReturn(this.data.sessionReturn)
  },

  async handleTabTap(event) {
    const { tab } = event.currentTarget.dataset as { tab: string }
    const target = TAB_ROUTES[tab]
    if (!target || tab === 'home') return
    if (tab === 'judge') {
      const profile = await ensureUserAuthorized(target)
      if (!profile) return
    }
    wx.navigateTo({
      url: target,
      fail: () => wx.redirectTo({ url: target }),
    })
  },

  openPage(url) {
    wx.navigateTo({ url, fail: () => wx.redirectTo({ url }) })
  },
})

export {}




