import { getSessionReport, getSessionRuntime } from '../../utils/session'
import { trackAnalyticsEvent } from '../../services/analytics'

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
    sessionName: '本局战报',
    events: [],
  },

  onLoad() {
    const report = getSessionReport()
    const runtime = getSessionRuntime()

    trackAnalyticsEvent({
      type: 'report_view',
      meta: {
        sessionId: runtime.sessionId || '',
        source: 'result-report',
      },
    })

    if (!report) {
      this.setData({
        sessionName: runtime.sessionName || '本局战报',
        metaText: `${runtime.sessionName || '本局战报'} · ${runtime.playerCount || 0} 人局`,
        events: runtime.playerStats.length
          ? runtime.playerStats.map((item) => ({
              text: `${item.name} 欠酒 ${item.debtCount} 杯，已喝 ${item.drinkCount} 杯，消杯 ${item.clearedCount} 次。`,
            }))
          : [{ text: '本局暂未生成完整战报。' }],
      })
      return
    }

    this.setData({
      events: report.events,
      metaText: `${report.sessionName} · ${report.playerCount} 人局`,
      ranks: report.ranks,
      sessionName: report.sessionName,
    })
  },

  handleRestartTap() {
    trackAnalyticsEvent({
      type: 'report_replay',
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
    this.openPage('/pages/share-poster/index')
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
