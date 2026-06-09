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
const MINIAPP_QR_ASSET = '/assets/home/share-miniapp-qr.png'

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

const drawQrPanel = (
  ctx: WechatMiniprogram.CanvasContext,
  qrPath: string,
  x: number,
  y: number,
  size: number,
) => {
  const panelWidth = size + 28
  const panelHeight = size + 64
  fillRoundRect(ctx, x, y, panelWidth, panelHeight, 24, '#fffaf4')

  if (qrPath) {
    ctx.drawImage(qrPath, x + 14, y + 14, size, size)
  }

  ctx.setFillStyle('#7b3926')
  ctx.setFontSize(18)
  ctx.setTextAlign('center')
  ctx.fillText('扫一扫看看怎么个事', x + panelWidth / 2, y + size + 46)
  ctx.setTextAlign('left')
}

Page<SharePosterState, SharePosterMethods>({
  data: {
    canvasHeight: 1320,
    canvasWidth: CANVAS_WIDTH,
    featuredRank: null,
    inviteCode: '',
    posterImagePath: '',
    posterImageUrl: '',
    posterTitle: '这局快乐就完事了',
    reportId: '',
    secondaryRanks: [],
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
            inviteCode: report.inviteCode || runtime.inviteCode || shareConfig.preview.inviteCode || '',
            posterImagePath: '',
            posterImageUrl: shareConfig.poster.imageUrl,
            posterTitle: shareConfig.poster.title,
            reportId: report.id,
            secondaryRanks,
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
    const rankPool = this.data.featuredRank
      ? [this.data.featuredRank, ...this.data.secondaryRanks]
      : this.data.secondaryRanks
    let qrPath = ''
    try {
      const qrImage = await getImageInfo(MINIAPP_QR_ASSET)
      qrPath = qrImage.path
    } catch {
      qrPath = ''
    }
    const avatarPaths = await Promise.all(
      rankPool.map(async (item) => {
        try {
          const image = await getImageInfo(item.avatarUrl)
          return image.path
        } catch {
          return ''
        }
      }),
    )

    const secondaryCount = Math.max(this.data.secondaryRanks.length, 0)
    const secondaryRows = Math.ceil(secondaryCount / 2)
    const canvasHeight = 510 + (this.data.featuredRank ? 250 : 0) + secondaryRows * 210 + 220

    return this.drawCanvasToFile(CANVAS_WIDTH, canvasHeight, (ctx) => {
      ctx.setFillStyle('#fff8ee')
      ctx.fillRect(0, 0, CANVAS_WIDTH, canvasHeight)

      fillRoundRect(ctx, 40, 40, CARD_WIDTH, canvasHeight - 80, 34, '#fff3e8')
      ctx.setFillStyle('#ff7645')
      ctx.fillRect(40, 40, CARD_WIDTH, 240)

      ctx.setFillStyle('#ffffff')
      ctx.setFontSize(48)
      ctx.fillText(this.data.shareHeadline, 90, 122)
      ctx.setFontSize(24)
      ctx.fillText(this.data.sessionName || '本局战报', 90, 170)
      ctx.fillText(this.data.posterTitle || '这局快乐就完事了', 90, 208)

      fillRoundRect(ctx, 620, 116, 190, 72, 20, 'rgba(255,255,255,0.16)')
      drawCenteredText(ctx, this.data.inviteCode || '已结算', 620, 160, 190, 28, '#ffffff')

      let avatarOffset = 0
      let currentY = 318

      if (this.data.featuredRank) {
        const rank = this.data.featuredRank
        fillRoundRect(ctx, 90, currentY, 720, 206, 28, '#7b1f17')
        fillRoundRect(ctx, 118, currentY + 24, 180, 44, 22, 'rgba(255, 239, 205, 0.16)')
        drawCenteredText(ctx, rank.title || '欠酒大王', 118, currentY + 54, 180, 24, '#ffe5b3')
        fillRoundRect(ctx, 640, currentY + 24, 140, 44, 22, 'rgba(255,255,255,0.14)')
        drawCenteredText(ctx, '全场焦点', 640, currentY + 54, 140, 22, '#ffffff')
        drawAvatar(ctx, avatarPaths[avatarOffset] || '', 126, currentY + 94, 84)
        ctx.setFillStyle('#ffffff')
        ctx.setFontSize(34)
        ctx.fillText(rank.name || '未命名玩家', 236, currentY + 136)
        ctx.setFillStyle('#ffe0d5')
        ctx.setFontSize(24)
        ctx.fillText(rank.value || '-', 236, currentY + 176)
        currentY += 236
        avatarOffset += 1
      }

      this.data.secondaryRanks.forEach((rank, index) => {
        const col = index % 2
        const row = Math.floor(index / 2)
        const x = 90 + col * 364
        const y = currentY + row * 210
        const bg = index % 2 === 0 ? '#fff8f0' : '#f8fbff'
        const tagBg = index % 2 === 0 ? '#fff0dc' : '#edf4ff'
        const tagColor = index % 2 === 0 ? '#ff6b42' : '#3b6cff'

        fillRoundRect(ctx, x, y, 336, 184, 24, bg)
        fillRoundRect(ctx, x + 18, y + 18, 118, 38, 19, tagBg)
        drawCenteredText(ctx, rank.title || `榜单 ${index + 2}`, x + 18, y + 45, 118, 20, tagColor)
        drawAvatar(ctx, avatarPaths[avatarOffset + index] || '', x + 26, y + 82, 62)
        ctx.setFillStyle('#24160f')
        ctx.setFontSize(24)
        ctx.fillText(rank.name || '未命名玩家', x + 106, y + 116)
        ctx.setFillStyle('#ff5b3d')
        ctx.setFontSize(22)
        ctx.fillText(rank.value || '-', x + 106, y + 150)
      })

      ctx.setFillStyle('#8f7f6d')
      ctx.setFontSize(22)
      ctx.fillText('分享图仅保留展示数据，不包含按钮与操作入口', 90, canvasHeight - 104)

      drawQrPanel(ctx, qrPath, 652, canvasHeight - 212, 106)
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
