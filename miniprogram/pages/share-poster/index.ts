import { trackAnalyticsEvent } from '../../services/analytics'
import { getManagedReport, getManagedShareConfig } from '../../services/operations'
import { getSessionRuntime, setSessionRuntime } from '../../utils/session'
import { getApiBase } from '../../config/api'
import { getUserAuthHeaders } from '../../utils/social'

interface PosterRank {
  avatarUrl: string
  name: string
  title: string
  value: string
}

interface PosterShareItem {
  iconClass: string
  id: 'friend' | 'group' | 'timeline'
  name: string
}

interface PosterEvent {
  text: string
}

interface SharePosterState {
  posterSaved: boolean
  savePosterLabel: string
  createSessionLabel: string
  finishShareLabel: string
  events: PosterEvent[]
  featuredRank: PosterRank | null
  inviteCode: string
  posterImagePath: string
  posterImageUrl: string
  posterTitle: string
  reportId: string
  secondaryRanks: PosterRank[]
  sessionId: string
  sessionName: string
  shareHeadline: string
  shareItems: PosterShareItem[]
}

interface SharePosterMethods {
  buildPosterImage: () => Promise<string>
  drawCanvasToFile: (width: number, height: number) => Promise<string>
  ensurePosterImage: () => Promise<string>
  handleBackTap: () => void
  handleCreateTap: () => void
  handleFinishShareTap: () => void
  handleSaveTap: () => Promise<void>
  handleTimelineTap: () => void
  saveImageFile: (filePath: string) => Promise<void>
  showPreviewToast: (message: string) => void
}

const SHARE_HEADLINE = '查看谁是今晚欠酒王？'
const REPORT_SHARE_ITEMS: PosterShareItem[] = [
  { id: 'friend', name: '\u5206\u4eab\u7ed9\u597d\u53cb', iconClass: 'poster-icon-wechat' },
  { id: 'group', name: '\u5206\u4eab\u5230\u7fa4', iconClass: 'poster-icon-group' },
  { id: 'timeline', name: '\u5206\u4eab\u5230\u670b\u53cb\u5708', iconClass: 'poster-icon-timeline' },
]

const CANVAS_WIDTH = 900

const enableShareMenus = () => {
  wx.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline'],
  })
}

Page<SharePosterState, SharePosterMethods>({
  data: {
    posterSaved: false,
    savePosterLabel: '\u4fdd\u5b58\u6218\u62a5\u5206\u4eab\u56fe',
    createSessionLabel: '\u6211\u4e5f\u5f00\u4e00\u5c40',
    finishShareLabel: '\u7ed3\u675f\u5206\u4eab',
    events: [],
    featuredRank: null,
    inviteCode: '',
    posterImagePath: '',
    posterImageUrl: '',
    posterTitle: '这局快乐就完事了',
    reportId: '',
    secondaryRanks: [],
    sessionId: '',
    sessionName: '',
    shareHeadline: SHARE_HEADLINE,
    shareItems: REPORT_SHARE_ITEMS,
  },

  onShow() {
    enableShareMenus()
  },

  async onLoad(query) {
    enableShareMenus()
    const runtime = getSessionRuntime()
    const reportId = typeof query?.reportId === 'string' ? decodeURIComponent(query.reportId) : runtime.reportId || ''

    if (!reportId) {
      this.showPreviewToast('未找到可分享的战报')
      return
    }

    try {
      wx.showLoading({
        title: '加载分享页',
        mask: true,
      })

      const [report, shareConfig] = await Promise.all([getManagedReport(reportId), getManagedShareConfig()])
      const ranks = Array.isArray(report.ranks) ? report.ranks : []
      const [featuredRank, ...secondaryRanks] = ranks

      setSessionRuntime({
        inviteCode: report.inviteCode || runtime.inviteCode || '',
        reportId: report.id,
        sessionId: report.sessionId || runtime.sessionId || '',
        sessionName: report.sessionName || runtime.sessionName,
        templateName: report.templateName || runtime.templateName || '',
      })

      await new Promise<void>((resolve) => {
        this.setData(
          {
            featuredRank: featuredRank || null,
            events: report.events.length ? report.events.slice(0, 4) : [{ text: '本局暂未记录精彩事件' }],
            inviteCode: report.inviteCode || runtime.inviteCode || shareConfig.preview.inviteCode || '',
            posterImagePath: '',
            posterImageUrl: shareConfig.poster.imageUrl,
            posterTitle: shareConfig.poster.title,
            reportId: report.id,
            secondaryRanks,
            sessionId: report.sessionId || runtime.sessionId || '',
            sessionName: report.sessionName || runtime.sessionName || '',
            shareItems: REPORT_SHARE_ITEMS,
          },
          () => resolve(),
        )
      })

      // Poster generation is intentionally deferred until save/share image is needed.
      // Generating a large canvas during onLoad blocks the first render on low-end devices.
    } catch (error) {
      this.showPreviewToast(error instanceof Error ? error.message : '分享页加载失败')
    } finally {
      wx.hideLoading()
    }
  },

  onShareAppMessage() {
    trackAnalyticsEvent({
      type: 'report_share',
      assetId: 'share-1',
      reportId: this.data.reportId,
      meta: {
        sessionId: this.data.sessionId,
        channel: 'share-poster',
      },
    })

    return {
      title: SHARE_HEADLINE,
      path: `/pages/result-report/index?reportId=${encodeURIComponent(this.data.reportId)}`,
      imageUrl: this.data.posterImagePath || this.data.posterImageUrl,
    }
  },

  onShareTimeline() {
    trackAnalyticsEvent({
      type: 'report_share',
      assetId: 'share-1',
      reportId: this.data.reportId,
      meta: {
        sessionId: this.data.sessionId,
        channel: 'share-timeline',
      },
    })

    return {
      title: SHARE_HEADLINE,
      query: `reportId=${encodeURIComponent(this.data.reportId)}`,
      imageUrl: this.data.posterImagePath || this.data.posterImageUrl,
    }
  },

  handleTimelineTap() {
    enableShareMenus()
    this.showPreviewToast('\u8bf7\u70b9\u51fb\u53f3\u4e0a\u89d2\u83dc\u5355\u5206\u4eab\u5230\u670b\u53cb\u5708')
  },

  async handleSaveTap() {
    if (this.data.posterSaved) {
      return
    }

    try {
      const tempFilePath = await this.ensurePosterImage()
      await this.saveImageFile(tempFilePath)
      trackAnalyticsEvent({
        type: 'share_asset_open',
        assetId: 'share-1',
        reportId: this.data.reportId,
        meta: {
          sessionId: this.data.sessionId,
          action: 'save-poster',
        },
      })
      this.showPreviewToast('战报分享图已保存')
    } catch (error) {
      console.warn('[share-poster] save poster failed', error)
      this.showPreviewToast('保存失败，请检查相册权限')
    }
  },

  saveImageFile(filePath) {
    return new Promise<void>((resolve, reject) => {
      wx.saveImageToPhotosAlbum({
        filePath,
        success: () => resolve(),
        fail: reject,
      })
    })
  },

  drawCanvasToFile(width, height) {
    void width
    void height
    return new Promise((resolve, reject) => {
      if (!this.data.reportId) {
        reject(new Error('missing report id'))
        return
      }
      wx.downloadFile({
        url: `${getApiBase()}/reports/${encodeURIComponent(this.data.reportId)}/poster.png`,
        header: getUserAuthHeaders(),
        success: (result) => {
          if (result.statusCode >= 200 && result.statusCode < 300 && result.tempFilePath) {
            resolve(result.tempFilePath)
            return
          }
          reject(new Error(`download poster failed: ${result.statusCode}`))
        },
        fail: reject,
      })
    })
  },

  async ensurePosterImage() {
    if (this.data.posterImagePath) {
      return this.data.posterImagePath
    }

    const filePath = await this.buildPosterImage()
    this.setData({ posterImagePath: filePath })
    return filePath
  },

  async buildPosterImage() {
    return this.drawCanvasToFile(CANVAS_WIDTH, 0)
  },

  handleBackTap() {
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },

  handleFinishShareTap() {
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },

  handleCreateTap() {
    wx.navigateTo({
      url: '/pages/create-session/index',
      fail: () => {
        wx.redirectTo({
          url: '/pages/create-session/index',
        })
      },
    })
  },

  showPreviewToast(message) {
    wx.showToast({
      title: message,
      icon: 'none',
    })
  },
})

export {}
