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
  metaText: string
  ranks: ReportRank[]
  reportId: string
  sessionName: string
}

interface ResultReportMethods {
  handleBackTap: () => void
  handleRestartTap: () => void
  handleShareTap: () => void
  openPage: (url: string) => void
}

Page<ResultReportState, ResultReportMethods>({
  data: {
    metaText: '',
    ranks: [],
    reportId: '',
    sessionName: '本局战报',
    events: [],
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

      setSessionRuntime({
        reportId: report.id,
        sessionId: report.sessionId || runtime.sessionId || '',
        sessionName: report.sessionName || runtime.sessionName,
        templateName: report.templateName || runtime.templateName || '',
      })

      this.setData({
        events: report.events.length ? report.events : [{ text: '本局暂无可展示的战报事件。' }],
        metaText: `${report.sessionName} · ${report.playerCount} 人局`,
        ranks: report.ranks,
        reportId: report.id,
        sessionName: report.sessionName || '本局战报',
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
        metaText: '战报加载失败',
        ranks: [],
        reportId: '',
        sessionName: '本局战报',
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
    this.openPage(`/pages/share-poster/index?reportId=${encodeURIComponent(this.data.reportId)}`)
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
