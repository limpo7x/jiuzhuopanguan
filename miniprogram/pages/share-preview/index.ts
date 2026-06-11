import { getSessionRuntime } from '../../utils/session'

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
  openPage: (url: string) => void
  saveImageFile: (filePath: string) => Promise<void>
  showPreviewToast: (message: string) => void
}

Page<SharePreviewState, SharePreviewMethods>({
  data: {
    avatars: [
      '',
      '',
      '',
      '',
    ],
    canvasHeight: 960,
    canvasWidth: 720,
    inviteCode: 'AB7K9Q',
    joinedCount: 4,
    joinStatusPlayers: [
      { name: '阿浩', avatarUrl: '', status: '已加入' },
      { name: '小熊', avatarUrl: '', status: '已加入' },
      { name: 'Mika', avatarUrl: '', status: '待确认' },
      { name: '可可', avatarUrl: '', status: '已加入' },
      { name: '阿乐', avatarUrl: '', status: '待加入' },
      { name: 'Nina', avatarUrl: '', status: '待加入' },
    ],
    playerCount: 6,
    posterImagePath: '',
    sessionName: '今晚聚会不醉不归',
    shareItems: [
      { id: 'friend', name: '分享给好友', iconClass: 'share-icon-wechat' },
      { id: 'group', name: '分享到群', iconClass: 'share-icon-group' },
    ],
    showJoinStatus: false,
  },

  onLoad() {
    const runtime = getSessionRuntime()
    const playerCount = Math.max(2, runtime.playerCount || 6)
    const selectedPlayers = runtime.selectedPlayers?.length
      ? runtime.selectedPlayers
      : this.data.joinStatusPlayers.map((item) => ({
          name: item.name,
          avatarUrl: item.avatarUrl,
        }))
    const joinedCount = Math.min(playerCount, Math.min(selectedPlayers.length, 4))
    const avatars = selectedPlayers.slice(0, joinedCount).map((item) => item.avatarUrl)
    const joinStatusPlayers = selectedPlayers.slice(0, playerCount).map((item, index) => ({
      ...item,
      status: index < joinedCount ? '已加入' : '待加入',
    }))

    this.setData({
      avatars,
      joinedCount,
      joinStatusPlayers,
      inviteCode: runtime.inviteCode || this.data.inviteCode,
      playerCount,
      sessionName: runtime.sessionName,
    })
  },

  onShareAppMessage() {
    const runtime = getSessionRuntime()
    const inviteCode = this.data.inviteCode || runtime.inviteCode || ''
    const sessionId = runtime.sessionId || ''
    const query = [
      inviteCode ? `inviteCode=${encodeURIComponent(inviteCode)}` : '',
      sessionId ? `sessionId=${encodeURIComponent(sessionId)}` : '',
    ].filter(Boolean).join('&')

    return {
      title: `${this.data.sessionName}，来加入这局`,
      path: `/pages/join-claim/index${query ? `?${query}` : ''}`,
      imageUrl: this.data.posterImagePath || '',
    }
  },

  handleTabTap(event) {
    const { tab } = event.currentTarget.dataset as { tab: 'preview' | 'status' }

    this.setData({
      showJoinStatus: tab === 'status',
    })
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
      })
    })
  },

  buildInvitePoster() {
    const width = 720
    const height = 960
    return this.drawCanvasToFile(width, height, (ctx) => {
      ctx.setFillStyle('#fff8ee')
      ctx.fillRect(0, 0, width, height)
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, '#ff6b4d')
      gradient.addColorStop(1, '#42b883')
      ctx.setFillStyle(gradient)
      ctx.fillRect(0, 0, width, 300)

      ctx.setFillStyle('#ffffff')
      ctx.setFontSize(48)
      ctx.fillText('酒桌判官邀局', 64, 110)
      ctx.setFontSize(30)
      ctx.fillText(this.data.sessionName || '今晚聚会不醉不归', 64, 168)

      ctx.setFillStyle('#ffffff')
      ctx.fillRect(54, 250, 612, 560)
      ctx.setFillStyle('#24160f')
      ctx.setFontSize(36)
      ctx.fillText('加入口令', 94, 340)
      ctx.setFontSize(70)
      ctx.fillText(this.data.inviteCode || 'AB7K9Q', 94, 455)
      ctx.setFontSize(28)
      ctx.fillText(`${this.data.joinedCount}/${this.data.playerCount} 已加入`, 94, 530)
      ctx.setFontSize(24)
      ctx.setFillStyle('#665447')
      ctx.fillText('打开小程序后输入口令加入本局', 94, 600)
      ctx.fillText('请理性饮酒，量力而行。', 94, 650)

      ctx.setFillStyle('#ff6b4d')
      ctx.fillRect(94, 704, 532, 72)
      ctx.setFillStyle('#ffffff')
      ctx.setFontSize(28)
      ctx.fillText('保存后即可分享给好友', 176, 750)
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
    wx.showToast({
      title: message,
      icon: 'none',
    })
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

