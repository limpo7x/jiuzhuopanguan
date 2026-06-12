import { getManagedReportHistory } from '../../services/operations'

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
  loading: boolean
  mode: string
  pageTitle: string
  primaryText: string
  showCreateButton: boolean
  sessions: HistorySession[]
  visibleSessions: HistorySession[]
}

interface WineHistoryMethods {
  applyFilter: (filterName?: string) => void
  handleCreateTap: () => void
  handleFilterTap: (event: WechatMiniprogram.BaseEvent) => void
  handleSessionTap: (event: WechatMiniprogram.BaseEvent) => void
  openPage: (url: string) => void
}

const HISTORY_FILTERS = ['全部', '进行中', '已结束', '已失效']
const PAGE_CONFIG: Record<string, { emptyMeta: string; emptyTitle: string; pageTitle: string; primaryText: string; showCreateButton: boolean }> = {
  host: {
    emptyMeta: '你作为判官创建的酒局会展示在这里。',
    emptyTitle: '暂无判官酒局',
    pageTitle: '我的酒局',
    primaryText: '创建新酒局',
    showCreateButton: true,
  },
  joined: {
    emptyMeta: '你作为参与者加入的酒局会展示在这里。',
    emptyTitle: '暂无参与场次',
    pageTitle: '参与场次',
    primaryText: '返回我的',
    showCreateButton: false,
  },
  unshared: {
    emptyMeta: '已结束且你还没有分享过的酒局战报会展示在这里。',
    emptyTitle: '暂无待分享战报',
    pageTitle: '待分享战报',
    primaryText: '返回我的',
    showCreateButton: false,
  },
}

const normalizeMode = (mode?: string) => (mode && PAGE_CONFIG[mode] ? mode : 'host')

Page<WineHistoryState, WineHistoryMethods>({
  data: {
    activeFilter: '全部',
    emptyMeta: PAGE_CONFIG.host.emptyMeta,
    emptyTitle: PAGE_CONFIG.host.emptyTitle,
    filters: HISTORY_FILTERS.map((name, index) => ({
      name,
      active: index === 0,
    })),
    loading: true,
    mode: 'host',
    pageTitle: PAGE_CONFIG.host.pageTitle,
    primaryText: PAGE_CONFIG.host.primaryText,
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

    try {
      wx.showLoading({ title: '加载酒局中', mask: true })
      const rows = await getManagedReportHistory(mode)
      const sessions = rows.map<HistorySession>((item) => ({
        hostName: item.hostName,
        hostProfileId: item.hostProfileId,
        id: item.id,
        imageUrl: item.imageUrl,
        meta: item.meta,
        name: item.sessionName || item.title || '我的酒局',
        recordType: item.recordType,
        reportId: item.reportId,
        role: item.role,
        sessionId: item.sessionId,
        status: item.status || '进行中',
        tag: item.status || '进行中',
        templateName: item.templateName,
      }))

      this.setData({ loading: false, sessions })
      this.applyFilter('全部')
    } catch (error) {
      this.setData({ loading: false, sessions: [], visibleSessions: [] })
      wx.showToast({ title: error instanceof Error ? error.message : '历史酒局加载失败', icon: 'none' })
    } finally {
      wx.hideLoading()
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
        this.openPage(`/pages/result-report/index?reportId=${encodeURIComponent(reportId)}`)
        return
      }
      wx.showToast({ title: '该酒局缺少战报数据', icon: 'none' })
      return
    }

    if (status === '进行中' && sessionId) {
      this.openPage(`/pages/live-record/index?sessionId=${encodeURIComponent(sessionId)}&role=${encodeURIComponent(role === 'host' ? 'judge' : 'viewer')}`)
      return
    }

    wx.showToast({ title: '该酒局暂不可查看', icon: 'none' })
  },

  handleCreateTap() {
    if (!this.data.showCreateButton) {
      wx.navigateBack()
      return
    }
    this.openPage('/pages/create-session/index')
  },

  openPage(url) {
    wx.navigateTo({ url, fail: () => wx.redirectTo({ url }) })
  },
})

export {}
