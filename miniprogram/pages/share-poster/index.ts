import { trackAnalyticsEvent } from '../../services/analytics'
import { getManagedReport, getManagedShareConfig } from '../../services/operations'
import { getSessionRuntime, setSessionRuntime } from '../../utils/session'

interface PosterRank {
  avatarUrl: string
  name: string
  title: string
  value: string
}

interface PosterShareItem {
  iconClass: string
  id: string
  name: string
}

interface SharePosterState {
  inviteCode: string
  posterImageUrl: string
  posterTitle: string
  ranks: PosterRank[]
  reportId: string
  sessionId: string
  sessionName: string
  shareItems: PosterShareItem[]
}

interface SharePosterMethods {
  handleBackTap: () => void
  handleCreateTap: () => void
  handleSaveTap: () => Promise<void>
  showPreviewToast: (message: string) => void
}

const downloadFile = (url: string) =>
  new Promise<string>((resolve, reject) => {
    wx.downloadFile({
      url,
      success: (result) => {
        if (result.statusCode >= 200 && result.statusCode < 300 && result.tempFilePath) {
          resolve(result.tempFilePath)
          return
        }
        reject(new Error('download failed'))
      },
      fail: reject,
    })
  })

const saveImage = (filePath: string) =>
  new Promise<void>((resolve, reject) => {
    wx.saveImageToPhotosAlbum({
      filePath,
      success: () => resolve(),
      fail: reject,
    })
  })

Page<SharePosterState, SharePosterMethods>({
  data: {
    inviteCode: '',
    posterImageUrl: 'https://api.pomer.cn/static/report-poster.png',
    posterTitle: '这局快乐就完事了！',
    ranks: [],
    reportId: '',
    sessionId: '',
    shareItems: [],
    sessionName: '本局战报',
  },

  async onLoad(query) {
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

      setSessionRuntime({
        inviteCode: report.inviteCode || runtime.inviteCode || '',
        reportId: report.id,
        sessionId: report.sessionId || runtime.sessionId || '',
        sessionName: report.sessionName || runtime.sessionName,
        templateName: report.templateName || runtime.templateName || '',
      })

      this.setData({
        inviteCode: report.inviteCode || runtime.inviteCode || shareConfig.preview.inviteCode || '',
        posterImageUrl: shareConfig.poster.imageUrl,
        posterTitle: shareConfig.poster.title,
        ranks: report.ranks,
        reportId: report.id,
        sessionId: report.sessionId || runtime.sessionId || '',
        sessionName: report.sessionName || runtime.sessionName || '本局战报',
        shareItems: shareConfig.shareItems.filter((item) => item.id && item.id !== 'save').map((item) => ({
          id: item.id,
          name: item.name,
          iconClass: item.iconClass.replace(/^share-/, 'poster-'),
        })),
      })
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
      title: `${this.data.sessionName} 战报出炉`,
      path: `/pages/result-report/index?reportId=${encodeURIComponent(this.data.reportId)}`,
      imageUrl: this.data.posterImageUrl,
    }
  },

  async handleSaveTap() {
    try {
      const tempFilePath = await downloadFile(this.data.posterImageUrl)
      await saveImage(tempFilePath)
      trackAnalyticsEvent({
        type: 'share_asset_open',
        assetId: 'share-1',
        reportId: this.data.reportId,
        meta: {
          sessionId: this.data.sessionId,
          action: 'save-poster',
        },
      })
      this.showPreviewToast('战报海报已保存')
    } catch {
      this.showPreviewToast('保存失败，请检查相册权限')
    }
  },

  handleBackTap() {
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
