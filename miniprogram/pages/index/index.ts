import { homePageMock, type HomePageData } from '../../mock/home'
import { claimPointsTask, getUserCommerceState } from '../../services/content'
import { getHomePageData } from '../../services/home'
import {
  getManagedSessionMomentSummaries,
  joinManagedSession,
  recordManagedToolUsage,
  type ManagedSessionMomentSummary,
} from '../../services/operations'
import { hasFirstPhotoEvidence, isActiveForResumeByFirstPhoto } from '../../utils/first-photo-state'
import { showFirstLoginBonusModal } from '../../utils/firstLoginBonus'
import { requestMiniProgramPrivacyAuthorization } from '../../utils/privacy'
import { setSessionRuntime, type SessionParticipant } from '../../utils/session'
import { buildSessionReturnFromHistory, EMPTY_SESSION_RETURN, openSessionReturn, type SessionReturnBarData } from '../../utils/session-return'
import { ensureUserAuthorized, getCurrentDisplayProfile, getUserAuthSession, getUserSessionToken, loginWithWechatProfile } from '../../utils/social'

interface HomePageState {
  authAvatarUrl: string
  authPanelVisible: boolean
  authRedirectUrl: string
  authName: string
  authSubmitting: boolean
  canCheckIn: boolean
  checkedIn: boolean
  activeSessionCount: number
  continueRecordLabel: string
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
  openAuthPanel: (redirectUrl?: string) => Promise<void>
  openPage: (url: string) => void
  refreshSessionReturn: (items?: ManagedSessionMomentSummary[]) => void
  syncAuthState: () => Promise<void>
}

type HomeRecentAlbum = HomePageData['recentTools'][number]

const TAB_ROUTES: Record<string, string> = {
  album: '/pages/album/index?mode=host',
  home: '/pages/index/index',
  ledger: '/pages/ledger/index',
  rankings: '/pages/rankings/index',
  tools: '/pages/tools/index',
  judge: '/pages/ledger/index',
  me: '/pages/me/index',
}

const normalizeName = (value?: string) => {
  const text = String(value || '').trim()
  return !text || /^微信用户\d*$/.test(text) || /^\u9152\u53cb\d{3,}$/.test(text) || /^(PR|QA|DEV|TEST)\s+Seed\b/i.test(text) || text === '未登录' ? '' : text
}

const normalizeAvatar = (value?: string) => String(value || '').trim()
const normalizeInviteCode = (value?: string) => String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
const isSessionFullJoinError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error || '')
  const statusCode = Number((error as { statusCode?: number })?.statusCode) || 0
  return statusCode === 409 || /session[_\s-]*full|party[_\s-]*full|SESSION_FULL/i.test(message)
}
const isSessionEndedJoinError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error || '')
  return /session[_\s-]*ended|party[_\s-]*ended|SESSION_ENDED|已结束|结束/i.test(message)
}
const internalAlbumTitlePattern = /^(IT|PR|QA|DEV|TEST)[-_ ][A-Z0-9_-]+(?:\s+(opening|highlight|drinking|private|closing))?$/i
const internalVisibleTextPattern = /(IT-MOMENTS|PR-BE-DB-LOGIN|PR[_-]?BE|QA[_-]?SEED|DEV[_-]?SEED|TEST[_-]?SEED|DEBUG|[a-z]+-[0-9a-f]{8,}|session-[0-9a-z-]+|brief-[0-9a-z-]+|share-task-[0-9a-z-]+)/i
const internalProfilePattern = /^(PR|QA|DEV|TEST)\s+Seed\s+/i
const albumFallbacks: HomePageData['recentTools'] = [
  {
    id: 'album-host',
    name: '我的聚会相册',
    usedAt: '',
    imageUrl: 'https://cdn.pomer.cn/static/party-pop-clean/home-hero-750x420.png',
    badgeText: '相册',
    badgeClass: '',
    route: '/pages/album/index?mode=host',
  },
  {
    id: 'album-joined',
    name: '参与过的聚会',
    usedAt: '',
    imageUrl: 'https://cdn.pomer.cn/static/party-pop-clean/home-hero-750x420.png',
    badgeText: '参与',
    badgeClass: '',
    route: '/pages/album/index?mode=joined',
  },
  {
    id: 'album-share',
    name: '分享图记录',
    usedAt: '',
    imageUrl: 'https://cdn.pomer.cn/static/party-pop-clean/share-poster-top-750x520.png',
    badgeText: '分享',
    badgeClass: '',
    route: '/pages/album/index?mode=shares',
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
  if (item.sessionId) {
    return `/pages/live-record/index?sessionId=${encodeURIComponent(item.sessionId)}`
  }
  return '/pages/album/index?mode=host'
}

const isActiveSummary = (item: ManagedSessionMomentSummary) => {
  const state = `${item.state || ''} ${item.status || ''} ${item.stateText || ''}`.trim()
  if (!hasFirstPhotoEvidence(item)) return false
  if (item.isActiveForResume === true) return Boolean(item.sessionId)
  if (!state) return Boolean(item.canResume && item.sessionId)
  return Boolean(item.sessionId) && isActiveForResumeByFirstPhoto(item) && !/已结束|结束|已完成|closed|ended|finished|deleted/i.test(state)
}

const buildContinueRecordLabel = (count: number) => {
  if (count > 1) return '选择继续'
  if (count === 1) return '继续记录'
  return '暂无进行中'
}

const mapRecentAlbumsFromSummaries = (items: ManagedSessionMomentSummary[]): HomePageData['recentTools'] => {
  const mapped = items.slice(0, 3).map((item, index): HomeRecentAlbum | null => {
    if (!item.sessionId && item.briefId) {
      return null
    }
    const firstPhotoUrl = item.coverPhotoUrl || item.readyShareImageUrl || item.shareImageUrl || ''
    const updatedAt = item.updatedAt || item.createdAt || item.endedAt || ''
    return {
      id: item.sessionId || item.briefId || `album-summary-${index}`,
      name: normalizeAlbumTitle(item.title, item.sessionName, index),
      usedAt: formatAlbumUsedAt(updatedAt),
      imageUrl: firstPhotoUrl || '',
      badgeText: item.shareImageStatus === 'ready' ? '分享图' : '记录',
      badgeClass: 'green',
      route: buildAlbumRoute(item),
    }
  })
  return mapped.filter((item): item is HomeRecentAlbum => Boolean(item?.route))
}

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
    activeSessionCount: 0,
    continueRecordLabel: buildContinueRecordLabel(0),
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
    this.refreshSessionReturn([])
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
    this.refreshSessionReturn([])
    void this.syncAuthState()
    if (!this.data.loading && Date.now() - this.data.lastLoadedAt > 45000) {
      void this.loadHomePage()
    }
  },

  refreshSessionReturn(items = [] as ManagedSessionMomentSummary[]) {
    const activeSummaries = items.filter(isActiveSummary)
    const sessionReturn = activeSummaries.length === 1
      ? buildSessionReturnFromHistory(activeSummaries.map((item) => ({
        meta: item.stateText || item.status || '回到记录页继续拍照',
        name: normalizeAlbumTitle(item.title, item.sessionName, 0),
        role: 'member',
        sessionId: item.sessionId,
        status: item.status || item.state || item.stateText,
      })))
      : EMPTY_SESSION_RETURN
    this.setData({
      activeSessionCount: activeSummaries.length,
      continueRecordLabel: buildContinueRecordLabel(activeSummaries.length),
      sessionReturn,
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
        if (session.loggedIn && session.profile?.id) {
          albumSummaries = await getManagedSessionMomentSummaries()
        }
      }
      const home = await homePromise
      const recentAlbums = mapRecentAlbumsFromSummaries(albumSummaries)
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
      this.refreshSessionReturn(albumSummaries)
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
    const loggedIn = Boolean(session.loggedIn && session.profile?.id)
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

  async openAuthPanel(redirectUrl = '') {
    try {
      this.setData({ authRedirectUrl: redirectUrl })
      await requestMiniProgramPrivacyAuthorization()
      this.setData({
        authPanelVisible: true,
        authRedirectUrl: redirectUrl,
      })
    } catch (error) {
      wx.showToast({ title: error instanceof Error ? error.message : '请先同意隐私保护指引', icon: 'none' })
    }
  },

  handleLoginTextTap() {
    void this.openAuthPanel('')
  },

  closeAuthPanel() {
    this.setData({ authPanelVisible: false, authRedirectUrl: '' })
  },

  noop() {
    return
  },

  async handlePrimaryTap() {
    const session = await getUserAuthSession().catch(() => ({ loggedIn: false, profile: null }))
    if (!session.loggedIn || !session.profile?.id) {
      void this.openAuthPanel('/pages/create-session/index')
      return
    }
    wx.navigateTo({ url: '/pages/create-session/index' })
  },

  handleContinueRecordTap() {
    if (this.data.activeSessionCount > 1) {
      wx.navigateTo({ url: '/pages/album/index?mode=joined' })
      return
    }
    if (this.data.sessionReturn.visible) {
      openSessionReturn(this.data.sessionReturn)
      return
    }
    this.announcePreview('暂无进行中聚会')
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
      const canEnterLive = isActiveForResumeByFirstPhoto(liveSession)
      setSessionRuntime({
        currentUser: { id: profile.id, name: profile.name, avatarUrl: profile.avatarUrl },
        endedAt: liveSession.endedAt,
        firstPhotoUploadedAt: liveSession.firstPhotoUploadedAt || '',
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
        state: canEnterLive ? '进行中' : '待首拍',
        status: canEnterLive ? '进行中' : '待首拍',
        templateImageUrl: liveSession.templateImageUrl,
        templateName: liveSession.templateName,
      })
      const joined = liveSession.joinStatusPlayers.some((item) => item.profileId === profile.id && (!item.status || item.status === '已加入'))
      const waitingUrl = `/pages/waiting-room/index?role=viewer&sessionId=${encodeURIComponent(liveSession.id)}&inviteCode=${encodeURIComponent(liveSession.inviteCode || normalizedCode)}&sessionName=${encodeURIComponent(liveSession.sessionName || '聚会记录')}`
      const targetUrl = joined && canEnterLive
        ? `/pages/live-record/index?role=viewer&sessionId=${encodeURIComponent(liveSession.id)}&sessionName=${encodeURIComponent(liveSession.sessionName || '聚会记录')}`
        : waitingUrl
      wx.redirectTo({ url: targetUrl })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'join failed'
      const notPlayer = message.includes('not session player')
      const sessionFull = isSessionFullJoinError(error)
      const sessionEnded = isSessionEndedJoinError(error)
      wx.showModal({
        title: sessionEnded ? '聚会已结束' : sessionFull ? '聚会已满' : notPlayer ? '暂不能加入' : '加入失败',
        content: sessionEnded
          ? '这场聚会已经结束，不能再加入。可从相册查看已生成的聚会回忆。'
          : sessionFull
          ? '这场聚会人数已满，暂时不能继续加入。请联系发起人调整人数或创建新的聚会。'
          : notPlayer
            ? '当前口令对应的聚会名单中没有你的账号，请联系发起人确认是否已添加你。'
            : '当前无法加入聚会，请检查口令是否正确。',
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
    if (!this.data.sessionReturn.visible) {
      this.announcePreview('暂无进行中聚会')
      return
    }
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
    wx.redirectTo({
      url: target,
      fail: () => wx.reLaunch({ url: target }),
    })
  },

  openPage(url) {
    wx.navigateTo({ url, fail: () => wx.redirectTo({ url }) })
  },
})

export {}
