import { getManagedLiveSession } from '../../services/operations'
import { getSessionRuntime, setSessionRuntime, type SessionParticipant } from '../../utils/session'

interface SharePreviewItem {
  iconClass: string
  id: string
  name: string
}

interface SharePreviewState {
  avatars: string[]
  canvasHeight: number
  canvasWidth: number
  inviteCode: string
  joinedCount: number
  joinStatusPlayers: Array<{ avatarUrl: string; name: string; status: string }>
  playerCount: number
  posterImagePath: string
  sessionId: string
  sessionName: string
  shareItems: SharePreviewItem[]
  showJoinStatus: boolean
}

interface SharePreviewMethods {
  buildInvitePoster: () => Promise<string>
  drawCanvasToFile: (
    width: number,
    height: number,
    drawer: (ctx: WechatMiniprogram.CanvasContext) => void,
  ) => Promise<string>
  handleTabTap: (event: WechatMiniprogram.BaseEvent) => void
  handleSaveTap: () => Promise<void>
  handleShareTap: (event: WechatMiniprogram.BaseEvent) => void
  loadInviteSession: (query?: Record<string, string | undefined>) => Promise<void>
  openPage: (url: string) => void
  saveImageFile: (filePath: string) => Promise<void>
  showPreviewToast: (message: string) => void
}

Page<SharePreviewState, SharePreviewMethods>({
  data: {
    avatars: [],
    canvasHeight: 960,
    canvasWidth: 720,
    inviteCode: '',
    joinedCount: 0,
    joinStatusPlayers: [],
    playerCount: 0,
    posterImagePath: '',
    sessionId: '',
    sessionName: '',
    shareItems: [
      { id: 'friend', name: '分享给好友', iconClass: 'share-icon-wechat' },
      { id: 'group', name: '分享到群', iconClass: 'share-icon-group' },
    ],
    showJoinStatus: false,
  },

  async onLoad(query) {
    await this.loadInviteSession(query as Record<string, string | undefined>)
  },

  async loadInviteSession(query) {
    const runtime = getSessionRuntime()
    const sessionId = typeof query?.sessionId === 'string' ? decodeURIComponent(query.sessionId) : runtime.sessionId || ''
    const inviteCode = typeof query?.inviteCode === 'string' ? decodeURIComponent(query.inviteCode) : runtime.inviteCode || ''

    try {
      const liveSession = await getManagedLiveSession(sessionId, inviteCode)
      const playerCount = Number(liveSession.playerCount) || 0
      const joinStatusPlayers = liveSession.joinStatusPlayers.slice(0, playerCount).map((item) => ({
        avatarUrl: item.avatarUrl,
        name: item.name,
        status: item.status,
      }))
      const avatars = liveSession.joinedPlayers.slice(0, Math.min(liveSession.joinedCount, 4)).map((item) => item.avatarUrl)

      setSessionRuntime({
        inviteCode: liveSession.inviteCode,
        playerCount,
        selectedPlayers: liveSession.joinStatusPlayers.map<SessionParticipant>((item) => ({
          avatarUrl: item.avatarUrl,
          name: item.name,
          profileId: item.profileId,
          status: item.status,
        })),
        sessionId: liveSession.id,
        sessionName: liveSession.sessionName,
        templateName: liveSession.templateName,
      })

      this.setData({
        avatars,
        inviteCode: liveSession.inviteCode,
        joinedCount: liveSession.joinedCount,
        joinStatusPlayers,
        playerCount,
        posterImagePath: '',
        sessionId: liveSession.id,
        sessionName: liveSession.sessionName || '',
      })    } catch {
      this.setData({
        avatars: [],
        inviteCode,
        joinedCount: 0,
        joinStatusPlayers: [],
        playerCount: 0,
        sessionId,
        sessionName: '',
      })
    }
  },

  onShareAppMessage() {
    const query = [
      this.data.inviteCode ? `inviteCode=${encodeURIComponent(this.data.inviteCode)}` : '',
      this.data.sessionId ? `sessionId=${encodeURIComponent(this.data.sessionId)}` : '',
    ].filter(Boolean).join('&')

    return {
      title: `${this.data.sessionName}，来加入这局`,
      path: `/pages/index/index${query ? `?${query}` : ''}`,
      imageUrl: this.data.posterImagePath || '',
    }
  },

  handleTabTap(event) {
    const { tab } = event.currentTarget.dataset as { tab: 'preview' | 'status' }
    this.setData({ showJoinStatus: tab === 'status' })
  },

  async handleSaveTap() {
    try {
      wx.showLoading({ title: '生成海报', mask: true })
      const filePath = this.data.posterImagePath || await this.buildInvitePoster()
      this.setData({ posterImagePath: filePath })
      await this.saveImageFile(filePath)
      this.showPreviewToast('邀请海报已保存')
    } catch {
      this.showPreviewToast('保存失败，请检查相册权限')
    } finally {
      wx.hideLoading()
    }
  },

  handleShareTap(event) {
    const { id } = event.currentTarget.dataset as { id: string }
    if (id === 'save') {
      void this.handleSaveTap()
    }
  },

  drawCanvasToFile(width, height, drawer) {
    return new Promise((resolve, reject) => {
      this.setData({ canvasWidth: width, canvasHeight: height }, () => {
        const ctx = wx.createCanvasContext('sharePreviewCanvas', this)
        drawer(ctx)
        ctx.draw(false, () => {
          wx.canvasToTempFilePath(
            {
              canvasId: 'sharePreviewCanvas',
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
      })
    })
  },

  buildInvitePoster() {
    const width = 720
    const height = 960
    const textInvite = '\u9152\u684c\u5224\u5b98\u9080\u8bf7\u51fd'
    const textHappyA = '\u8fd9\u5c40\u5feb\u4e50'
    const textHappyB = '\u5c31\u5b8c\u4e8b\u4e86\uff01'
    const textFallbackName = '\u597d\u53cb\u9152\u5c40'
    const textJoinCode = '\u52a0\u5165\u53e3\u4ee4'
    const textPending = '\u672a\u751f\u6210'
    const textJoined = '\u5df2\u52a0\u5165'
    const textJoinTip = '\u8f93\u5165\u53e3\u4ee4\u5373\u53ef\u5165\u5c40'
    const textShareTip = '\u4fdd\u5b58\u540e\u53d1\u7ed9\u597d\u53cb\uff0c\u7b49\u4eba\u9f50\u5c31\u5f00\u5c40'
    const textDrinkTip = '\u7406\u6027\u996e\u9152\uff0c\u91cf\u529b\u800c\u884c'

    return this.drawCanvasToFile(width, height, (ctx) => {
      const drawFitText = (value: string, x: number, y: number, maxWidth: number, fontSize: number, color: string) => {
        let content = String(value || '').trim()
        ctx.setFontSize(fontSize)
        ctx.setFillStyle(color)
        if (!content) {
          return
        }
        while (content.length > 1 && ctx.measureText(content).width > maxWidth) {
          content = content.slice(0, -2) + '...'
        }
        ctx.fillText(content, x, y)
      }

      const drawCenteredFitText = (value: string, centerX: number, y: number, maxWidth: number, fontSize: number, color: string) => {
        let content = String(value || '').trim()
        ctx.setFontSize(fontSize)
        ctx.setFillStyle(color)
        if (!content) {
          return
        }
        while (content.length > 1 && ctx.measureText(content).width > maxWidth) {
          content = content.slice(0, -2) + '...'
        }
        const metrics = ctx.measureText(content)
        ctx.fillText(content, centerX - metrics.width / 2, y)
      }

      ctx.setFillStyle('#fff4e6')
      ctx.fillRect(0, 0, width, height)

      const bg = ctx.createLinearGradient(0, 0, width, height)
      bg.addColorStop(0, '#ff6542')
      bg.addColorStop(0.52, '#ff9147')
      bg.addColorStop(1, '#22ad78')
      ctx.setFillStyle(bg)
      ctx.fillRect(36, 36, 648, 888)

      ctx.setFillStyle('rgba(255,255,255,0.18)')
      ctx.beginPath()
      ctx.arc(610, 116, 92, 0, Math.PI * 2)
      ctx.fill()
      ctx.setFillStyle('rgba(255,218,116,0.2)')
      ctx.beginPath()
      ctx.arc(96, 760, 72, 0, Math.PI * 2)
      ctx.fill()

      ctx.setFillStyle('rgba(255,255,255,0.18)')
      ctx.fillRect(78, 82, 214, 42)
      ctx.setFontSize(22)
      ctx.setFillStyle('#ffffff')
      ctx.fillText(textInvite, 98, 110)

      ctx.setFontSize(54)
      ctx.setFillStyle('#ffffff')
      ctx.fillText(textHappyA, 78, 206)
      ctx.fillText(textHappyB, 78, 270)
      drawFitText(this.data.sessionName || textFallbackName, 78, 326, 560, 30, 'rgba(255,255,255,0.92)')

      ctx.setFillStyle('rgba(255,253,248,0.96)')
      ctx.fillRect(78, 380, 564, 310)
      ctx.setFillStyle('#8f6248')
      ctx.setFontSize(26)
      ctx.fillText(textJoinCode, 116, 438)
      ctx.setFillStyle('#fff3e3')
      ctx.fillRect(116, 470, 488, 112)
      drawCenteredFitText(this.data.inviteCode || textPending, 360, 544, 430, 62, '#24160f')

      ctx.setFillStyle('#fff8ee')
      ctx.fillRect(116, 616, 226, 46)
      drawCenteredFitText(`${this.data.joinedCount}/${this.data.playerCount || 0} ${textJoined}`, 229, 647, 190, 24, '#24160f')
      ctx.setFillStyle('#fff8ee')
      ctx.fillRect(362, 616, 242, 46)
      drawCenteredFitText(textJoinTip, 483, 647, 210, 24, '#24160f')

      ctx.setFillStyle('rgba(36,22,15,0.2)')
      ctx.fillRect(78, 724, 564, 86)
      drawCenteredFitText(textShareTip, 360, 778, 500, 30, '#ffffff')

      ctx.setFillStyle('rgba(255,255,255,0.86)')
      ctx.fillRect(78, 840, 564, 44)
      drawCenteredFitText(textDrinkTip, 360, 870, 420, 22, '#5f4938')
    })
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

  showPreviewToast(message) {
    wx.showToast({ title: message, icon: 'none' })
  },

  openPage(url) {
    wx.navigateTo({
      url,
      fail: () => {
        wx.redirectTo({ url })
      },
    })
  },
})

export {}

