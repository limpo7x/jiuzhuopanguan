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
  canvasHeight: number
  canvasWidth: number
  inviteCode: string
  posterImagePath: string
  posterImageUrl: string
  posterTitle: string
  ranks: PosterRank[]
  reportId: string
  sessionId: string
  sessionName: string
  shareHeadline: string
  shareItems: PosterShareItem[]
}

interface SharePosterMethods {
  buildPosterImage: () => Promise<string>
  drawCanvasToFile: (
    width: number,
    height: number,
    drawer: (ctx: WechatMiniprogram.CanvasContext) => void,
  ) => Promise<string>
  ensurePosterImage: () => Promise<string>
  handleBackTap: () => void
  handleCreateTap: () => void
  handleSaveTap: () => Promise<void>
  saveImageFile: (filePath: string) => Promise<void>
  showPreviewToast: (message: string) => void
}

const SHARE_HEADLINE = '查看谁是今晚欠酒王？'
const CANVAS_WIDTH = 900
const CARD_WIDTH = 820

const getImageInfo = (src: string) =>
  new Promise<WechatMiniprogram.GetImageInfoSuccessCallbackResult>((resolve, reject) => {
    if (!src) {
      reject(new Error('missing image src'))
      return
    }
    wx.getImageInfo({
      src,
      success: resolve,
      fail: reject,
    })
  })

const fillRoundRect = (
  ctx: WechatMiniprogram.CanvasContext,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string,
) => {
  const safeRadius = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + safeRadius, y)
  ctx.arcTo(x + width, y, x + width, y + height, safeRadius)
  ctx.arcTo(x + width, y + height, x, y + height, safeRadius)
  ctx.arcTo(x, y + height, x, y, safeRadius)
  ctx.arcTo(x, y, x + width, y, safeRadius)
  ctx.closePath()
  ctx.setFillStyle(color)
  ctx.fill()
}

const drawCenteredText = (
  ctx: WechatMiniprogram.CanvasContext,
  text: string,
  x: number,
  y: number,
  width: number,
  fontSize: number,
  color: string,
) => {
  ctx.setFillStyle(color)
  ctx.setFontSize(fontSize)
  ctx.setTextAlign('center')
  ctx.fillText(text, x + width / 2, y)
  ctx.setTextAlign('left')
}

const drawAvatar = (
  ctx: WechatMiniprogram.CanvasContext,
  avatarPath: string,
  x: number,
  y: number,
  size: number,
) => {
  if (avatarPath) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(avatarPath, x, y, size, size)
    ctx.restore()
    return
  }

  ctx.setFillStyle('#ffd7c4')
  ctx.beginPath()
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.setFillStyle('#ff6b4d')
  ctx.setFontSize(Math.round(size * 0.34))
  ctx.setTextAlign('center')
  ctx.fillText('友', x + size / 2, y + size * 0.62)
  ctx.setTextAlign('left')
}

Page<SharePosterState, SharePosterMethods>({
  data: {
    canvasHeight: 1200,
    canvasWidth: CANVAS_WIDTH,
    inviteCode: '',
    posterImagePath: '',
    posterImageUrl: '',
    posterTitle: '这局快乐就完事了',
    ranks: [],
    reportId: '',
    sessionId: '',
    sessionName: '本局战报',
    shareHeadline: SHARE_HEADLINE,
    shareItems: [],
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

      await new Promise<void>((resolve) => {
        this.setData(
          {
            inviteCode: report.inviteCode || runtime.inviteCode || shareConfig.preview.inviteCode || '',
            posterImagePath: '',
            posterImageUrl: shareConfig.poster.imageUrl,
            posterTitle: shareConfig.poster.title,
            ranks: report.ranks,
            reportId: report.id,
            sessionId: report.sessionId || runtime.sessionId || '',
            sessionName: report.sessionName || runtime.sessionName || '本局战报',
            shareItems: shareConfig.shareItems
              .filter((item) => item.id && item.id !== 'save')
              .map((item) => ({
                id: item.id,
                name: item.name,
                iconClass: item.iconClass.replace(/^share-/, 'poster-'),
              })),
          },
          () => resolve(),
        )
      })

      await this.ensurePosterImage()
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

  async handleSaveTap() {
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
    } catch {
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

  drawCanvasToFile(width, height, drawer) {
    return new Promise((resolve, reject) => {
      this.setData(
        {
          canvasWidth: width,
          canvasHeight: height,
        },
        () => {
          const ctx = wx.createCanvasContext('sharePosterCanvas')
          drawer(ctx)
          ctx.draw(false, () => {
            wx.canvasToTempFilePath({
              canvasId: 'sharePosterCanvas',
              width,
              height,
              destWidth: width,
              destHeight: height,
              success: (result) => resolve(result.tempFilePath),
              fail: reject,
            })
          })
        },
      )
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
    const rankCount = Math.max(this.data.ranks.length, 1)
    const rows = Math.ceil(rankCount / 2)
    const canvasHeight = 420 + rows * 220 + 180
    const avatarPaths = await Promise.all(
      this.data.ranks.map(async (item) => {
        try {
          const image = await getImageInfo(item.avatarUrl)
          return image.path
        } catch {
          return ''
        }
      }),
    )

    return this.drawCanvasToFile(CANVAS_WIDTH, canvasHeight, (ctx) => {
      ctx.setFillStyle('#fff8ee')
      ctx.fillRect(0, 0, CANVAS_WIDTH, canvasHeight)

      fillRoundRect(ctx, 40, 40, CARD_WIDTH, canvasHeight - 80, 32, '#fff1e2')
      ctx.setFillStyle('#ff6b4d')
      ctx.fillRect(40, 40, CARD_WIDTH, 230)

      ctx.setFillStyle('#ffffff')
      ctx.setFontSize(46)
      ctx.fillText(this.data.shareHeadline, 90, 120)
      ctx.setFontSize(24)
      ctx.fillText(this.data.sessionName || '本局战报', 90, 168)
      ctx.fillText(this.data.posterTitle || '这局快乐就完事了', 90, 206)

      fillRoundRect(ctx, 610, 112, 200, 78, 22, 'rgba(255,255,255,0.18)')
      drawCenteredText(ctx, this.data.inviteCode || '已结算', 610, 162, 200, 30, '#ffffff')

      const cardWidth = 344
      const cardHeight = 176
      let startY = 314
      this.data.ranks.forEach((rank, index) => {
        const col = index % 2
        const row = Math.floor(index / 2)
        const x = 90 + col * (cardWidth + 32)
        const y = startY + row * (cardHeight + 24)

        fillRoundRect(ctx, x, y, cardWidth, cardHeight, 24, '#fffaf4')
        fillRoundRect(ctx, x + 18, y + 18, 116, 36, 18, '#fff1df')
        drawCenteredText(ctx, rank.title || '战报榜单', x + 18, y + 42, 116, 20, '#ff5b3d')

        drawAvatar(ctx, avatarPaths[index] || '', x + 30, y + 72, 66)
        ctx.setFillStyle('#24160f')
        ctx.setFontSize(26)
        ctx.fillText(rank.name || '未命名玩家', x + 118, y + 112)
        ctx.setFillStyle('#ff5b3d')
        ctx.setFontSize(28)
        ctx.fillText(rank.value || '-', x + 118, y + 148)
      })

      ctx.setFillStyle('#8f7f6d')
      ctx.setFontSize(22)
      ctx.fillText('分享图仅保留战报展示数据，不包含操作按钮', 90, canvasHeight - 104)
    })
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
