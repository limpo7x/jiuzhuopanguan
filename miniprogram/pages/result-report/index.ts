import { getSessionReport, getSessionRuntime } from '../../utils/session'
import { avatarAsset } from '../../config/assets'

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
    metaText: '周五热场局 · 6人局 · 2024.05.20',
    ranks: [
      { title: '欠酒大王', avatarUrl: avatarAsset(1), name: '阿浩', value: '欠了 6 杯' },
      { title: '背锅侠', avatarUrl: avatarAsset(2), name: '小熊', value: '被点名 3 次' },
      { title: '整活王', avatarUrl: avatarAsset(3), name: 'Mika', value: '贡献 3 个题' },
    ],
    sessionName: '周五热场局',
    events: [
      { text: '可可 表演了“海草舞”' },
      { text: '小熊 现场唱跑调版《孤勇者》' },
      { text: 'Mika 爆出阿乐口头禅，全场爆笑' },
    ],
  },

  onLoad() {
    const report = getSessionReport()
    const runtime = getSessionRuntime()

    if (!report) {
      this.setData({
        sessionName: runtime.sessionName,
        metaText: `${runtime.sessionName} · ${runtime.playerCount}人局`,
      })
      return
    }

    this.setData({
      events: report.events,
      metaText: `${report.sessionName} · ${report.playerCount}人局`,
      ranks: report.ranks,
      sessionName: report.sessionName,
    })
  },

  handleRestartTap() {
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
