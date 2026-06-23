import { trackAnalyticsEvent } from '../../services/analytics'
import { getManagedReport } from '../../services/operations'
import { getSessionRuntime, setSessionRuntime } from '../../utils/session'

interface ReportRank {
  avatarUrl: string
  name: string
  title: string
  value: string
}

interface ReportEvent {
  text: string
}

interface ResultReportState {
  events: ReportEvent[]
  featuredRank: ReportRank | null
  metaText: string
  reportId: string
  reportTitle: string
  secondaryRanks: ReportRank[]
  sessionId: string
  sessionName: string
}

interface ResultReportMethods {
  handleBackTap: () => void
  handleBriefTap: () => void
  handleRestartTap: () => void
  handleShareTap: () => void
  openPage: (url: string) => void
}

Page<ResultReportState, ResultReportMethods>({
  data: {
    events: [],
    featuredRank: null,
    metaText: '',
    reportId: '',
    reportTitle: '这局快乐就完事了！',
    secondaryRanks: [],
    sessionId: '',
    sessionName: '',
  },

  async onLoad(query) {
    const runtime = getSessionRuntime()
    const reportId = typeof query?.reportId === 'string' ? decodeURIComponent(query.reportId) : runtime.reportId || ''

    if (!reportId) {
      wx.showToast({
        title: '未找到战报',
        icon: 'none',
      })
      return
    }

    try {
      wx.showLoading({
        title: '加载战报中',
        mask: true,
      })

      const report = await getManagedReport(reportId)
      const ranks = Array.isArray(report.ranks) ? report.ranks : []
      const [featuredRank, ...secondaryRanks] = ranks

      setSessionRuntime({
        reportId: report.id,
        sessionId: report.sessionId || runtime.sessionId || '',
        sessionName: report.sessionName || runtime.sessionName,
        templateName: report.templateName || runtime.templateName || '',
      })

      this.setData({
        events: report.events,
        featuredRank: featuredRank || null,
        metaText: `${report.sessionName} · ${report.playerCount} 人局`,
        reportId: report.id,
        reportTitle: report.title || '这局快乐就完事了！',
        secondaryRanks,
        sessionId: report.sessionId || runtime.sessionId || '',
        sessionName: report.sessionName || '',
      })

      trackAnalyticsEvent({
        type: 'report_view',
        reportId: report.id,
        meta: {
          sessionId: report.sessionId || runtime.sessionId || '',
          source: 'result-report',
        },
      })
    } catch (error) {
      this.setData({
        events: [{ text: error instanceof Error ? error.message : '战报加载失败，请稍后重试。' }],
        featuredRank: null,
        metaText: '战报加载失败',
        reportId: '',
        reportTitle: '战报暂不可用',
        secondaryRanks: [],
        sessionId: '',
        sessionName: '',
      })
      wx.showToast({
        title: error instanceof Error ? error.message : '战报加载失败',
        icon: 'none',
      })
    } finally {
      wx.hideLoading()
    }
  },

  handleRestartTap() {
    trackAnalyticsEvent({
      type: 'report_replay',
      reportId: this.data.reportId,
      meta: {
        sessionId: getSessionRuntime().sessionId || '',
        source: 'result-report',
      },
    })
    this.openPage('/pages/restart-state/index')
  },

  handleBackTap() {
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },

  handleShareTap() {
    if (!this.data.reportId) {
      wx.showToast({
        title: '战报未加载完成',
        icon: 'none',
      })
      return
    }
    this.openPage(`/pages/share-poster/index?reportId=${encodeURIComponent(this.data.reportId)}&from=result-report`)
  },

  handleBriefTap() {
    if (!this.data.sessionId) {
      wx.showToast({
        title: '缺少酒局信息',
        icon: 'none',
      })
      return
    }

    this.openPage(`/pages/session-brief/index?sessionId=${encodeURIComponent(this.data.sessionId)}`)
  },

  openPage(url) {
    wx.navigateTo({
      url,
      fail: () => {
        wx.redirectTo({
          url,
        })
      },
    })
  },
})

export {}
