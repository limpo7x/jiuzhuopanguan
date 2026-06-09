import { trackAnalyticsEvent } from '../../services/analytics'
import { getManagedLiveSession, getManagedShareConfig } from '../../services/operations'
import { getSessionRuntime, setSessionRuntime } from '../../utils/session'

interface SharePreviewItem {
  iconClass: string
  id: string
  name: string
}

interface JoinStatusPlayer {
  avatarUrl: string
  name: string
  status: string
}

interface SharePreviewState {
  avatars: string[]
  canvasHeight: number
  canvasWidth: number
  inviteCode: string
  joinedCount: number
  joinStatusPlayers: JoinStatusPlayer[]
  playerCount: number
  previewImageUrl: string
  previewTitle: string
  sessionId: string
  sessionName: string
  shareCardImagePath: string
  shareHeadline: string
  shareItems: SharePreviewItem[]
  showJoinStatus: boolean
}

interface SharePreviewMethods {
  buildShareImage: () => Promise<string>
  drawCanvasToFile: (
    width: number,
    height: number,
    drawer: (ctx: WechatMiniprogram.CanvasContext) => void,
  ) => Promise<string>
  ensureShareImage: () => Promise<string>
  handleSaveTap: () => Promise<void>
  handleTabTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  loadSession: () => Promise<void>
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

const strokeRoundRect = (
  ctx: WechatMiniprogram.CanvasContext,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string,
  lineWidth: number,
) => {
  const safeRadius = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + safeRadius, y)
  ctx.arcTo(x + width, y, x + width, y + height, safeRadius)
  ctx.arcTo(x + width, y + height, x, y + height, safeRadius)
  ctx.arcTo(x, y + height, x, y, safeRadius)
  ctx.arcTo(x, y, x + width, y, safeRadius)
  ctx.closePath()
  ctx.setStrokeStyle(color)
  ctx.setLineWidth(lineWidth)
  ctx.stroke()
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
  strokeRoundRect(ctx, x, y, panelWidth, panelHeight, 24, '#ffd0ad', 2)

  if (qrPath) {
    ctx.drawImage(qrPath, x + 14, y + 14, size, size)
  }

  ctx.setFillStyle('#7b3926')
  ctx.setFontSize(18)
  ctx.setTextAlign('center')
  ctx.fillText('扫一扫看看怎么个事', x + panelWidth / 2, y + size + 46)
  ctx.setTextAlign('left')
}

Page<SharePreviewState, SharePreviewMethods>({
  data: {
    avatars: [],
    canvasHeight: 1080,
    canvasWidth: CANVAS_WIDTH,
    inviteCode: '',
    joinedCount: 0,
    joinStatusPlayers: [],
    playerCount: 6,
    previewImageUrl: '',
    previewTitle: '快来加入这一局',
    sessionId: '',
    sessionName: '今晚聚会不醉不归',
    shareCardImagePath: '',
    shareHeadline: SHARE_HEADLINE,
    shareItems: [],
    showJoinStatus: false,
  },

  async onLoad(query) {
    const runtime = getSessionRuntime()
    const sessionId = typeof query?.sessionId === 'string' ? decodeURIComponent(query.sessionId) : runtime.sessionId || ''

    this.setData({
      inviteCode: runtime.inviteCode || '',
      sessionId,
    })

    trackAnalyticsEvent({
      type: 'share_asset_exposure',
      assetId: 'share-2',
      meta: {
        sessionId,
        scene: 'invite-preview',
      },
    })

    try {
      await this.loadSession()
    } catch (error) {
      this.showPreviewToast(error instanceof Error ? error.message : '邀请页加载失败')
    }
  },

  async onShow() {
    if (!this.data.sessionId && !getSessionRuntime().sessionId) {
      return
    }

    try {
      await this.loadSession()
    } catch (error) {
      this.showPreviewToast(error instanceof Error ? error.message : '邀请页加载失败')
    }
  },

  onShareAppMessage() {
    trackAnalyticsEvent({
      type: 'share_asset_open',
      assetId: 'share-2',
      meta: {
        sessionId: this.data.sessionId,
        channel: 'share-preview',
      },
    })

    return {
      title: SHARE_HEADLINE,
      path: `/pages/join-claim/index?inviteCode=${encodeURIComponent(this.data.inviteCode)}&sessionId=${encodeURIComponent(this.data.sessionId)}`,
      imageUrl: this.data.shareCardImagePath || this.data.previewImageUrl,
    }
  },

  async loadSession() {
    const runtime = getSessionRuntime()
    const [liveSession, shareConfig] = await Promise.all([
      getManagedLiveSession(this.data.sessionId || runtime.sessionId, this.data.inviteCode || runtime.inviteCode),
      getManagedShareConfig(),
    ])

    setSessionRuntime({
      inviteCode: liveSession.inviteCode,
      sessionId: liveSession.id,
      sessionName: liveSession.sessionName,
      templateName: liveSession.templateName,
    })

    await new Promise<void>((resolve) => {
      this.setData(
        {
          avatars: liveSession.joinedPlayers.map((item) => item.avatarUrl).slice(0, liveSession.playerCount),
          inviteCode: liveSession.inviteCode,
          joinedCount: liveSession.joinedCount,
          joinStatusPlayers: liveSession.joinStatusPlayers,
          playerCount: liveSession.playerCount,
          previewImageUrl: shareConfig.preview.imageUrl,
          previewTitle: shareConfig.preview.title,
          sessionId: liveSession.id,
          sessionName: liveSession.sessionName,
          shareCardImagePath: '',
          shareItems: shareConfig.shareItems
            .filter((item) => item.id && item.id !== 'save')
            .map((item) => ({
              id: item.id,
              name: item.name,
              iconClass: item.iconClass,
            })),
        },
        () => resolve(),
      )
    })

    await this.ensureShareImage()
  },

  async handleTabTap(event) {
    const { tab } = event.currentTarget.dataset as { tab: 'preview' | 'status' }

    await new Promise<void>((resolve) => {
      this.setData(
        {
          showJoinStatus: tab === 'status',
          shareCardImagePath: '',
        },
        () => resolve(),
      )
    })

    await this.ensureShareImage()
  },

  async handleSaveTap() {
    try {
      const tempFilePath = await this.ensureShareImage()
      await this.saveImageFile(tempFilePath)
      this.showPreviewToast('分享图已保存到相册')
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
          const ctx = wx.createCanvasContext('sharePreviewCanvas')
          drawer(ctx)
          ctx.draw(false, () => {
            wx.canvasToTempFilePath({
              canvasId: 'sharePreviewCanvas',
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

  async ensureShareImage() {
    if (this.data.shareCardImagePath) {
      return this.data.shareCardImagePath
    }

    const filePath = await this.buildShareImage()
    this.setData({ shareCardImagePath: filePath })
    return filePath
  },

  async buildShareImage() {
    let qrPath = ''
    try {
      const qrImage = await getImageInfo(MINIAPP_QR_ASSET)
      qrPath = qrImage.path
    } catch {
      qrPath = ''
    }

    if (this.data.showJoinStatus) {
      const itemHeight = 104
      const listHeight = Math.max(this.data.joinStatusPlayers.length, 1) * itemHeight
      const canvasHeight = 360 + listHeight + 260
      const avatarPaths = await Promise.all(
        this.data.joinStatusPlayers.map(async (item) => {
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

        fillRoundRect(ctx, 40, 40, CARD_WIDTH, canvasHeight - 80, 30, '#ff6847')
        ctx.setFillStyle('rgba(255,255,255,0.18)')
        ctx.fillRect(40, 40, CARD_WIDTH, 180)

        ctx.setFillStyle('#ffffff')
        ctx.setFontSize(46)
        ctx.fillText(this.data.shareHeadline, 90, 120)
        ctx.setFontSize(24)
        ctx.fillText(`邀请口令 ${this.data.inviteCode}`, 90, 168)
        ctx.fillText(`当前 ${this.data.joinedCount}/${this.data.playerCount} 人已加入`, 90, 206)

        let y = 270
        this.data.joinStatusPlayers.forEach((player, index) => {
          fillRoundRect(ctx, 90, y, 720, 84, 20, 'rgba(255,255,255,0.16)')
          drawAvatar(ctx, avatarPaths[index] || '', 116, y + 16, 52)
          ctx.setFillStyle('#ffffff')
          ctx.setFontSize(28)
          ctx.fillText(player.name || '未命名玩家', 186, y + 48)

          fillRoundRect(ctx, 620, y + 21, 150, 40, 20, 'rgba(255,255,255,0.22)')
          drawCenteredText(ctx, player.status || '待加入', 620, y + 49, 150, 22, '#ffffff')
          y += itemHeight
        })

        drawQrPanel(ctx, qrPath, 652, canvasHeight - 226, 120)
      })
    }

    const previewAvatarPaths = await Promise.all(
      this.data.avatars.slice(0, 6).map(async (avatarUrl) => {
        try {
          const image = await getImageInfo(avatarUrl)
          return image.path
        } catch {
          return ''
        }
      }),
    )

    return this.drawCanvasToFile(CANVAS_WIDTH, 1180, (ctx) => {
      ctx.setFillStyle('#fff8ee')
      ctx.fillRect(0, 0, CANVAS_WIDTH, 1180)

      fillRoundRect(ctx, 40, 40, CARD_WIDTH, 1100, 30, '#ff6847')
      ctx.setFillStyle('rgba(255,255,255,0.14)')
      ctx.fillRect(40, 40, CARD_WIDTH, 320)

      ctx.setFillStyle('#ffffff')
      ctx.setFontSize(50)
      ctx.fillText(this.data.shareHeadline, 90, 132)
      ctx.setFontSize(28)
      ctx.fillText(this.data.previewTitle || '快来加入这一局', 90, 188)
      ctx.setFontSize(24)
      ctx.fillText(this.data.sessionName || '今晚聚会不醉不归', 90, 228)

      ctx.setFontSize(24)
      ctx.fillText(`${this.data.joinedCount}/${this.data.playerCount} 人已加入`, 650, 316)

      const avatarSize = 72
      const overlap = 18
      const startX = 90
      const avatarY = 286
      previewAvatarPaths.forEach((avatarPath, index) => {
        drawAvatar(ctx, avatarPath, startX + index * (avatarSize - overlap), avatarY, avatarSize)
      })

      fillRoundRect(ctx, 90, 430, 720, 230, 26, '#fff7f0')
      strokeRoundRect(ctx, 90, 430, 720, 230, 26, '#ffc08d', 3)
      ctx.setFillStyle('#7b3926')
      ctx.setFontSize(24)
      ctx.fillText('加入口令', 120, 490)
      ctx.setFillStyle('#2b1b12')
      ctx.setFontSize(76)
      ctx.fillText(this.data.inviteCode || '----', 120, 590)
      ctx.setFillStyle('#8f7f6d')
      ctx.setFontSize(22)
      ctx.fillText('进入小程序后输入口令即可加入本局', 120, 632)

      fillRoundRect(ctx, 90, 716, 720, 180, 26, '#fff2e6')
      ctx.setFillStyle('#7b3926')
      ctx.setFontSize(30)
      ctx.fillText('现在点开，一眼看出今晚谁最该罚酒', 120, 788)
      ctx.setFillStyle('#8f7f6d')
      ctx.setFontSize(22)
      ctx.fillText('该分享图仅保留展示数据，不包含页面按钮', 120, 836)

      drawQrPanel(ctx, qrPath, 648, 946, 128)
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
