import { getManagedReportHistory } from '../../services/operations'

import { buildSessionReturnFromHistory, EMPTY_SESSION_RETURN, openSessionReturn, type SessionReturnBarData } from '../../utils/session-return'
import {
  getManagedSessionMomentSummaries,
  retryManagedShareImageTask,
  type ManagedSessionMomentSummary,
} from '../../services/operations'
import { clearUserSessionToken, getUserAuthSession } from '../../utils/social'

interface HistoryFilter {
  active?: boolean
  name: string
}

interface HistorySession {
  hostName: string
  hostProfileId: string
  id: string
  imageUrl: string
  meta: string
  name: string
  recordType: 'report' | 'session'
  reportId: string
  role: 'host' | 'member'
  sessionId: string
  status: string
  tag: string
  templateName: string
}

interface WineHistoryState {
  activeFilter: string
  emptyMeta: string
  emptyTitle: string
  filters: HistoryFilter[]
  authRequired: boolean
  loading: boolean
  mode: string
  momentSummaries: ManagedSessionMomentSummary[]
  pageTitle: string
  primaryText: string
  sessionReturn: SessionReturnBarData
  showCreateButton: boolean
  sessions: HistorySession[]
  visibleSessions: HistorySession[]
}

interface MomentSummaryEventDetail {
  briefId?: string
  imageUrl?: string
  sessionId?: string
  shareImageTaskId?: string
}

interface WineHistoryMethods {
  applyFilter: (filterName?: string) => void
  handleBackTap: () => void
  handleCreateTap: () => void
  handleBriefTap: (event: WechatMiniprogram.BaseEvent) => void
  handleFilterTap: (event: WechatMiniprogram.BaseEvent) => void
  handleImageError: (event: WechatMiniprogram.CustomEvent) => void
  handleMomentBriefTap: (event: WechatMiniprogram.CustomEvent<MomentSummaryEventDetail>) => void
  handleMomentPreviewTap: (event: WechatMiniprogram.CustomEvent<MomentSummaryEventDetail>) => void
  handleMomentResumeTap: (event: WechatMiniprogram.CustomEvent<MomentSummaryEventDetail>) => void
  handleMomentRetryTap: (event: WechatMiniprogram.CustomEvent<MomentSummaryEventDetail>) => Promise<void>
  handleRankingTap: () => void
  handleLoginTap: () => void
  handleModeTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handleSessionReturnOpen: () => void
  handleSessionTap: (event: WechatMiniprogram.BaseEvent) => void
  loadSessions: () => Promise<void>
  openPage: (url: string) => void
}

const HISTORY_FILTERS = ['全部', '进行中', '已结束', '已失效']
const PAGE_CONFIG: Record<string, { emptyMeta: string; emptyTitle: string; pageTitle: string; primaryText: string; showCreateButton: boolean }> = {
  host: {
    emptyMeta: '你创建的聚会记录会展示在这里。',
    emptyTitle: '暂无聚会记录',
    pageTitle: '我的相册',
    primaryText: '创建聚会',
    showCreateButton: true,
  },
  joined: {
    emptyMeta: '你加入的聚会记录会展示在这里。',
    emptyTitle: '暂无参与场次',
    pageTitle: '参与场次',
    primaryText: '返回我的',
    showCreateButton: false,
  },
  unshared: {
    emptyMeta: '已结束且你还没有分享过的聚会相册会展示在这里。',
    emptyTitle: '暂无待分享相册',
    pageTitle: '待分享相册',
    primaryText: '返回我的',
    showCreateButton: false,
  },
}

const normalizeMode = (mode?: string) => (mode && PAGE_CONFIG[mode] ? mode : 'host')
const LOGIN_EMPTY_TITLE = '登录后查看聚会相册'
const LOGIN_EMPTY_META = '历史记录和相册摘要需要登录后加载。'

const isUnauthorizedError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return false
  }
  const message = error.message.toLowerCase()
  return message.includes('401') || message.includes('unauthorized') || message.includes('未登录') || message.includes('登录已失效')
}

Page<WineHistoryState, WineHistoryMethods>({
  data: {
    activeFilter: '全部',
    emptyMeta: PAGE_CONFIG.host.emptyMeta,
    emptyTitle: PAGE_CONFIG.host.emptyTitle,
    filters: HISTORY_FILTERS.map((name, index) => ({
      name,
      active: index === 0,
    })),
    authRequired: false,
    loading: true,
    mode: 'host',
    momentSummaries: [],
    pageTitle: PAGE_CONFIG.host.pageTitle,
    primaryText: PAGE_CONFIG.host.primaryText,
    sessionReturn: EMPTY_SESSION_RETURN,
    showCreateButton: PAGE_CONFIG.host.showCreateButton,
    sessions: [],
    visibleSessions: [],
  },

  async onLoad(query) {
    const mode = normalizeMode(typeof query?.mode === 'string' ? decodeURIComponent(query.mode) : 'host')
    const config = PAGE_CONFIG[mode]
    this.setData({
      emptyMeta: config.emptyMeta,
      emptyTitle: config.emptyTitle,
      mode,
      pageTitle: config.pageTitle,
      primaryText: config.primaryText,
      showCreateButton: config.showCreateButton,
    })

    await this.loadSessions()
  },

  async onShow() {
    if (this.data.loading) {
      return
    }

    await this.loadSessions()
  },

  async loadSessions() {
    let loadingShown = false
    try {
      const mode = this.data.mode
      const authSession = await getUserAuthSession()
      if (!authSession.loggedIn || !authSession.profile?.wechatOpenId) {
        this.setData({
          authRequired: true,
          emptyMeta: LOGIN_EMPTY_META,
          emptyTitle: LOGIN_EMPTY_TITLE,
          loading: false,
          momentSummaries: [],
          sessionReturn: EMPTY_SESSION_RETURN,
          sessions: [],
          visibleSessions: [],
        })
        return
      }

      wx.showLoading({ title: '加载聚会中', mask: true })
      loadingShown = true
      const [rows, summaryRows] = await Promise.all([
        getManagedReportHistory(mode),
        getManagedSessionMomentSummaries().catch((error) => {
          if (isUnauthorizedError(error)) {
            throw error
          }
          return []
        }),
      ])
      const sessions = rows.map<HistorySession>((item) => ({
        hostName: item.hostName,
        hostProfileId: item.hostProfileId,
        id: item.id,
        imageUrl: item.imageUrl,
        meta: item.meta,
        name: item.sessionName || item.title || '我的聚会',
        recordType: item.recordType,
        reportId: item.reportId,
        role: item.role,
        sessionId: item.sessionId,
        status: item.status || '进行中',
        tag: item.status || '进行中',
        templateName: item.templateName,
      }))
      const sessionIds = new Set(sessions.map((item) => item.sessionId).filter(Boolean))
      const momentSummaries = summaryRows.filter((item) => !sessionIds.size || sessionIds.has(item.sessionId))

      this.setData({
        authRequired: false,
        emptyMeta: PAGE_CONFIG[mode].emptyMeta,
        emptyTitle: PAGE_CONFIG[mode].emptyTitle,
        loading: false,
        momentSummaries,
        sessionReturn: buildSessionReturnFromHistory(sessions),
        sessions,
      })
      this.applyFilter(this.data.activeFilter || '全部')
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearUserSessionToken()
        this.setData({
          authRequired: true,
          emptyMeta: LOGIN_EMPTY_META,
          emptyTitle: LOGIN_EMPTY_TITLE,
          loading: false,
          momentSummaries: [],
          sessionReturn: EMPTY_SESSION_RETURN,
          sessions: [],
          visibleSessions: [],
        })
        wx.showToast({ title: '登录已失效，请重新登录', icon: 'none' })
        return
      }
      this.setData({ loading: false, momentSummaries: [], sessionReturn: EMPTY_SESSION_RETURN, sessions: [], visibleSessions: [] })
      wx.showToast({ title: error instanceof Error ? error.message : '历史记录加载失败', icon: 'none' })
    } finally {
      if (loadingShown) {
        wx.hideLoading()
      }
    }
  },

  applyFilter(filterName) {
    const nextFilterName = filterName || this.data.activeFilter
    const filters = this.data.filters.map((item) => ({ ...item, active: item.name === nextFilterName }))
    const visibleSessions = nextFilterName === '全部' ? this.data.sessions : this.data.sessions.filter((item) => item.status === nextFilterName)
    this.setData({ activeFilter: nextFilterName, filters, visibleSessions })
  },

  handleFilterTap(event) {
    const { name } = event.currentTarget.dataset as { name: string }
    this.applyFilter(name)
  },

  handleRankingTap() {
    this.openPage('/pages/album/index?mode=host')
  },

  async handleModeTap(event) {
    const { mode } = event.currentTarget.dataset as { mode?: string }
    const nextMode = normalizeMode(mode)
    if (nextMode === this.data.mode) {
      return
    }
    const config = PAGE_CONFIG[nextMode]
    this.setData({
      activeFilter: '全部',
      emptyMeta: config.emptyMeta,
      emptyTitle: config.emptyTitle,
      filters: HISTORY_FILTERS.map((name, index) => ({ name, active: index === 0 })),
      mode: nextMode,
      pageTitle: config.pageTitle,
      primaryText: config.primaryText,
      showCreateButton: config.showCreateButton,
    })
    await this.loadSessions()
  },

  handleImageError(event) {
    const { id, imageUrl, name, reportId, sessionId, status, templateName } = event.currentTarget.dataset as {
      id?: string
      imageUrl?: string
      name?: string
      reportId?: string
      sessionId?: string
      status?: string
      templateName?: string
    }
    console.warn('[wine-history] session image failed to load', {
      error: event.detail,
      id,
      imageUrl,
      name,
      reportId,
      sessionId,
      status,
      templateName,
    })
  },

  handleSessionReturnOpen() {
    openSessionReturn(this.data.sessionReturn)
  },

  handleBriefTap(event) {
    const { sessionId } = event.currentTarget.dataset as { sessionId?: string }
    if (!sessionId) {
      wx.showToast({ title: '缺少聚会信息', icon: 'none' })
      return
    }

    this.openPage(`/pages/session-brief/index?sessionId=${encodeURIComponent(sessionId)}`)
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
    wx.showToast({ title: '缺少简报信息', icon: 'none' })
  },

  handleMomentPreviewTap(event) {
    const imageUrl = event.detail.imageUrl || ''
    if (!imageUrl) {
      wx.showToast({ title: '分享图还未生成', icon: 'none' })
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
    wx.showToast({ title: '缺少可补图聚会', icon: 'none' })
  },

  async handleMomentRetryTap(event) {
    const taskId = event.detail.shareImageTaskId || ''
    if (!taskId) {
      wx.showToast({ title: '未找到分享图任务', icon: 'none' })
      return
    }

    let loadingShown = false
    try {
      wx.showLoading({ title: '重试中', mask: true })
      loadingShown = true
      await retryManagedShareImageTask(taskId)
      wx.hideLoading()
      loadingShown = false
      await this.loadSessions()
      wx.showToast({ title: '已重新排队', icon: 'none' })
    } catch (error) {
      wx.showToast({ title: error instanceof Error ? error.message : '重试失败', icon: 'none' })
    } finally {
      if (loadingShown) {
        wx.hideLoading()
      }
    }
  },

  handleSessionTap(event) {
    const { reportId, role, sessionId, status } = event.currentTarget.dataset as {
      reportId: string
      role: 'host' | 'member'
      sessionId: string
      status: string
    }

    if (status === '已失效') {
      this.openPage('/pages/invalid-state/index')
      return
    }

    if (status === '已结束') {
      if (this.data.mode === 'unshared' && reportId) {
        this.openPage(`/pages/share-poster/index?reportId=${encodeURIComponent(reportId)}`)
        return
      }
      if (reportId) {
        this.openPage(`/pages/share-poster/index?reportId=${encodeURIComponent(reportId)}`)
        return
      }
      wx.showToast({ title: '该聚会缺少相册数据', icon: 'none' })
      return
    }

    if (status === '进行中' && sessionId) {
      const url = `/pages/live-record/index?sessionId=${encodeURIComponent(sessionId)}&role=${encodeURIComponent(role === 'host' ? 'judge' : 'viewer')}`
      wx.redirectTo({
        url,
        fail: () => {
          wx.reLaunch({ url })
        },
      })
      return
    }

    wx.showToast({ title: '该聚会暂不可查看', icon: 'none' })
  },

  handleCreateTap() {
    if (!this.data.showCreateButton) {
      this.handleBackTap()
      return
    }
    this.openPage('/pages/create-session/index')
  },

  handleBackTap() {
    wx.navigateBack({
      fail: () => {
        wx.redirectTo({
          url: '/pages/me/index',
          fail: () => wx.reLaunch({ url: '/pages/index/index' }),
        })
      },
    })
  },

  handleLoginTap() {
    this.openPage('/pages/me/index')
  },

  openPage(url) {
    wx.navigateTo({ url, fail: () => wx.redirectTo({ url }) })
  },
})

export {}
