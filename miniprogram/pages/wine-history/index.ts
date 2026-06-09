import { getManagedReportHistory, type ManagedReportSummary } from '../../services/operations'

interface HistoryFilter {
  active?: boolean
  name: string
}

interface HistorySession {
  id: string
  imageUrl: string
  meta: string
  name: string
  recordType: 'report' | 'session'
  reportId: string
  sessionId: string
  status: string
  tag: string
}

interface WineHistoryState {
  activeFilter: string
  filters: HistoryFilter[]
  loading: boolean
  sessions: HistorySession[]
  visibleSessions: HistorySession[]
}

interface WineHistoryMethods {
  applyFilter: (filterName?: string) => void
  handleCreateTap: () => void
  handleFilterTap: (event: WechatMiniprogram.BaseEvent) => void
  handleSessionTap: (event: WechatMiniprogram.BaseEvent) => void
}

const HISTORY_FILTERS = ['全部', '进行中', '已结束', '已失效']

Page<WineHistoryState, WineHistoryMethods>({
  data: {
    activeFilter: '全部',
    filters: HISTORY_FILTERS.map((name, index) => ({
      name,
      active: index === 0,
    })),
    loading: true,
    sessions: [],
    visibleSessions: [],
  },

  async onLoad() {
    try {
      wx.showLoading({
        title: '加载酒局中',
        mask: true,
      })

      const rows = await getManagedReportHistory()
      const sessions = rows.map<HistorySession>((item) => ({
        id: item.id,
        imageUrl: item.imageUrl,
        meta: item.meta,
        name: item.sessionName || item.title || '我的酒局',
        recordType: item.recordType,
        reportId: item.reportId,
        sessionId: item.sessionId,
        status: item.status || '进行中',
        tag: item.status || '进行中',
      }))

      this.setData({
        loading: false,
        sessions,
      })
      this.applyFilter('全部')
    } catch (error) {
      this.setData({
        loading: false,
        sessions: [],
        visibleSessions: [],
      })
      wx.showToast({
        title: error instanceof Error ? error.message : '历史酒局加载失败',
        icon: 'none',
      })
    } finally {
      wx.hideLoading()
    }
  },

  applyFilter(filterName = this.data.activeFilter) {
    const filters = this.data.filters.map((item) => ({
      ...item,
      active: item.name === filterName,
    }))
    const visibleSessions =
      filterName === '全部'
        ? this.data.sessions
        : this.data.sessions.filter((item) => item.status === filterName)

    this.setData({
      activeFilter: filterName,
      filters,
      visibleSessions,
    })
  },

  handleFilterTap(event) {
    const { name } = event.currentTarget.dataset as { name: string }
    this.applyFilter(name)
  },

  handleSessionTap(event) {
    const { recordType, reportId, sessionId, status } = event.currentTarget.dataset as {
      recordType: 'report' | 'session'
      reportId: string
      sessionId: string
      status: string
    }

    if (status === '已失效') {
      wx.navigateTo({
        url: '/pages/invalid-state/index',
      })
      return
    }

    if (recordType === 'report' && reportId) {
      wx.navigateTo({
        url: `/pages/result-report/index?reportId=${encodeURIComponent(reportId)}`,
      })
      return
    }

    if (sessionId) {
      wx.navigateTo({
        url: `/pages/waiting-room/index?sessionId=${encodeURIComponent(sessionId)}`,
      })
      return
    }

    wx.showToast({
      title: '该酒局暂不可查看',
      icon: 'none',
    })
  },

  handleCreateTap() {
    wx.navigateTo({
      url: '/pages/create-session/index',
    })
  },
})

export {}
