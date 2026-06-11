import { trackAnalyticsEvent } from '../../services/analytics'
import { getManagedReport, getManagedShareConfig } from '../../services/operations'
import { getApiBase } from '../../config/api'
import { normalizeManagedAvatarPath } from '../../config/assets'
import { resolveCachedManagedImagePath } from '../../utils/imageCache'
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

interface PosterEvent {
  text: string
}

interface SharePosterState {
  canvasHeight: number
  canvasWidth: number
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
  } else {
    fillRoundRect(ctx, x + 14, y + 14, size, size, 18, '#fff1df')
    ctx.setStrokeStyle('#ffb88a')
    ctx.setLineWidth(2)
    ctx.strokeRect(x + 24, y + 24, size - 20, size - 20)
    ctx.setFillStyle('#a14f36')
    ctx.setFontSize(20)
    ctx.setTextAlign('center')
    ctx.fillText('小程序', x + 14 + size / 2, y + 14 + size / 2 + 8)
    ctx.setTextAlign('left')
  }

  ctx.setFillStyle('#7b3926')
  ctx.setFontSize(18)
  ctx.setTextAlign('center')
  ctx.fillText('扫一扫看看怎么个事', x + panelWidth / 2, y + size + 46)
  ctx.setTextAlign('left')
}

const resolveMiniappQrPath = async () => {
  const target = '/pages/index/index'
  const candidates: string[] = [
    `${getApiBase()}/tools/qr-code.png?text=${encodeURIComponent(target)}&ts=${Date.now()}`,
  ]
  for (const candidate of candidates) {
    try {
      const image = await getImageInfo(candidate)
      return image.path
    } catch {
      continue
    }
  }
  return ''
}

const downloadImageToTempFile = (src: string) =>
  new Promise<string>((resolve, reject) => {
    wx.downloadFile({
      url: src,
      success: (result) => {
        if (result.statusCode >= 200 && result.statusCode < 300 && result.tempFilePath) {
          resolve(result.tempFilePath)
          return
        }
        reject(new Error(`download failed: ${result.statusCode}`))
      },
      fail: reject,
    })
  })

const resolveDrawableAvatarPath = async (avatarUrl?: string) => {
  const source = normalizeManagedAvatarPath(avatarUrl)
  if (!source) {
    return ''
  }

  if (/^(wxfile|file):\/\//i.test(source) || /^https?:\/\/tmp\//i.test(source)) {
    try {
      const image = await getImageInfo(source)
      return image.path || source
    } catch {
      return ''
    }
  }

  const cachedSource = await resolveCachedManagedImagePath(source)
  try {
    const image = await getImageInfo(cachedSource)
    return image.path || cachedSource
  } catch {
    if (!/^https?:\/\//i.test(source)) {
      return ''
    }
  }

  try {
    const tempFilePath = await downloadImageToTempFile(source)
    const image = await getImageInfo(tempFilePath)
    return image.path || tempFilePath
  } catch {
    return ''
  }
}

const drawPartyBackdrop = (ctx: WechatMiniprogram.CanvasContext, width: number, height: number) => {
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#4f120d')
  gradient.addColorStop(0.45, '#8d2418')
  gradient.addColorStop(1, '#ff8b4d')
  ctx.setFillStyle(gradient)
  ctx.fillRect(0, 0, width, height)

  ctx.setFillStyle('rgba(255, 225, 158, 0.14)')
  ctx.beginPath()
  ctx.arc(120, 140, 150, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(width - 140, 180, 180, 0, Math.PI * 2)
  ctx.fill()

  ctx.setStrokeStyle('rgba(255, 215, 138, 0.18)')
  ctx.setLineWidth(4)
  for (let index = 0; index < 10; index += 1) {
    const startX = 180 + index * 58
    ctx.beginPath()
    ctx.moveTo(width / 2, 40)
    ctx.lineTo(startX, 250)
    ctx.stroke()
  }

  const confettiColors = ['#ffd76d', '#fff4d1', '#ffab63', '#ff6e56']
  for (let index = 0; index < 28; index += 1) {
    const color = confettiColors[index % confettiColors.length]
    const x = 36 + (index * 61) % (width - 72)
    const y = 54 + ((index * 97) % Math.min(height - 108, 420))
    const w = 10 + (index % 3) * 5
    const h = 6 + (index % 2) * 4
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(((index % 7) - 3) * 0.34)
    ctx.setFillStyle(color)
    ctx.fillRect(-w / 2, -h / 2, w, h)
    ctx.restore()
  }

  const drawGlass = (centerX: number, centerY: number, scale: number, rotateDeg: number) => {
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate((rotateDeg * Math.PI) / 180)
    ctx.setFillStyle('rgba(255, 249, 236, 0.22)')
    ctx.beginPath()
    ctx.moveTo(-22 * scale, -26 * scale)
    ctx.lineTo(22 * scale, -26 * scale)
    ctx.lineTo(12 * scale, 10 * scale)
    ctx.lineTo(-12 * scale, 10 * scale)
    ctx.closePath()
    ctx.fill()
    ctx.setStrokeStyle('rgba(255, 249, 236, 0.46)')
    ctx.setLineWidth(3)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, 10 * scale)
    ctx.lineTo(0, 44 * scale)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(-18 * scale, 44 * scale)
    ctx.lineTo(18 * scale, 44 * scale)
    ctx.stroke()
    ctx.restore()
  }

  drawGlass(width - 142, 104, 1, -16)
  drawGlass(width - 96, 124, 0.9, 18)
}

Page<SharePosterState, SharePosterMethods>({
  data: {
    canvasHeight: 1320,
    canvasWidth: CANVAS_WIDTH,
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
            events: report.events.length ? report.events.slice(0, 4) : [{ text: '本局暂未记录精彩事件' }],
            inviteCode: report.inviteCode || runtime.inviteCode || shareConfig.preview.inviteCode || '',
            posterImagePath: '',
            posterImageUrl: shareConfig.poster.imageUrl,
            posterTitle: shareConfig.poster.title,
            reportId: report.id,
            secondaryRanks,
            sessionId: report.sessionId || runtime.sessionId || '',
            sessionName: report.sessionName || runtime.sessionName || '',
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
          const ctx = wx.createCanvasContext('sharePosterCanvas', this)
          drawer(ctx)
          ctx.draw(false, () => {
            wx.canvasToTempFilePath(
              {
                canvasId: 'sharePosterCanvas',
                width,
                height,
                destWidth: width,
                destHeight: height,
                success: (result) => resolve(result.tempFilePath),
                fail: reject,
              },
              this,
            )
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
    const qrPath = await resolveMiniappQrPath()
    const avatarPaths = await Promise.all(rankPool.map((item) => resolveDrawableAvatarPath(item.avatarUrl)))

    const secondaryCount = Math.max(this.data.secondaryRanks.length, 0)
    const secondaryRows = Math.ceil(secondaryCount / 2)
    const eventRows = Math.max(this.data.events.length, 1)
    const canvasHeight = 610 + (this.data.featuredRank ? 250 : 0) + secondaryRows * 210 + eventRows * 44 + 220

    return this.drawCanvasToFile(CANVAS_WIDTH, canvasHeight, (ctx) => {
      drawPartyBackdrop(ctx, CANVAS_WIDTH, canvasHeight)

      fillRoundRect(ctx, 40, 40, CARD_WIDTH, canvasHeight - 80, 34, '#fff3e8')
      const headerGradient = ctx.createLinearGradient(40, 40, 40, 280)
      headerGradient.addColorStop(0, '#ff7e4d')
      headerGradient.addColorStop(0.58, '#d83e28')
      headerGradient.addColorStop(1, '#7d1f16')
      ctx.setFillStyle(headerGradient)
      fillRoundRect(ctx, 40, 40, CARD_WIDTH, 240, 34, '#ff7645')
      ctx.setFillStyle(headerGradient)
      ctx.fillRect(40, 140, CARD_WIDTH, 140)
      ctx.setFillStyle('rgba(255,255,255,0.12)')
      ctx.beginPath()
      ctx.arc(168, 98, 72, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(742, 118, 84, 0, Math.PI * 2)
      ctx.fill()

      ctx.setFillStyle('#ffffff')
      ctx.setFontSize(48)
      ctx.fillText(this.data.shareHeadline, 90, 122)
      ctx.setFontSize(24)
      ctx.fillText(this.data.sessionName || '', 90, 170)
      ctx.fillText(this.data.posterTitle || '这局快乐就完事了', 90, 208)

      fillRoundRect(ctx, 620, 116, 190, 72, 20, 'rgba(255,255,255,0.16)')
      drawCenteredText(ctx, this.data.inviteCode || '已结算', 620, 160, 190, 28, '#ffffff')

      ctx.setStrokeStyle('rgba(255, 236, 200, 0.18)')
      ctx.setLineWidth(4)
      for (let index = 0; index < 6; index += 1) {
        ctx.beginPath()
        ctx.moveTo(86 + index * 98, 248)
        ctx.lineTo(132 + index * 98, 286)
        ctx.stroke()
      }

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
        ctx.fillText(rank.name || '', 236, currentY + 136)
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
        ctx.fillText(rank.name || '', x + 106, y + 116)
        ctx.setFillStyle('#ff5b3d')
        ctx.setFontSize(22)
        ctx.fillText(rank.value || '-', x + 106, y + 150)
      })

      currentY += secondaryRows * 210 + 20
      fillRoundRect(ctx, 90, currentY, 720, 70 + eventRows * 42, 24, '#fff8f0')
      ctx.setFillStyle('#24160f')
      ctx.setFontSize(28)
      ctx.fillText('本局精彩事件', 122, currentY + 44)
      ctx.setFillStyle('#7b3926')
      ctx.setFontSize(22)
      this.data.events.slice(0, 4).forEach((event, index) => {
        ctx.fillText(`· ${event.text}`, 122, currentY + 88 + index * 42, 620)
      })

      drawQrPanel(ctx, qrPath, 652, canvasHeight - 212, 106)

      ctx.setFillStyle('#8f7f6d')
      ctx.setFontSize(22)
      ctx.fillText('分享图仅保留展示数据，不包含按钮与操作入口', 90, canvasHeight - 128, 500)
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
