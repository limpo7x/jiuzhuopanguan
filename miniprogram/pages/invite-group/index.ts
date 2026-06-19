import { getManagedLiveSession, type ManagedLiveSession } from '../../services/operations'
import { getSessionRuntime, setSessionRuntime } from '../../utils/session'
import { confirmAndExitSession, disableSessionLeaveAlert, enableSessionLeaveAlert } from '../../utils/session-exit'
import { ensureUserAuthorized } from '../../utils/social'

interface InviteAvatarSlot {
  avatarUrl: string
  filled: boolean
  id: string
  initial: string
  name: string
}

interface InviteSlotPlayer {
  avatarUrl?: string
  name?: string
  profileId?: string
}

interface InviteGroupState {
  avatarSlots: InviteAvatarSlot[]
  inviteCode: string
  joinedCount: number
  playerCount: number
  shareCardImagePath: string
  sessionId: string
  sessionName: string
  joinStatusText: string
}

interface InviteGroupMethods {
  handleBackTap: () => Promise<void>
  handleCopyTap: () => void
  handleNextTap: () => void
  handlePreviewTap: () => void
  handleRefreshTap: () => Promise<void>
  hydrateLiveSession: (sessionId: string, inviteCode?: string) => Promise<void>
  generateShareCardImage: () => Promise<void>
  openPage: (url: string) => void
}

const SHARE_CARD_CANVAS_ID = 'inviteShareCardCanvas'
const SHARE_CARD_FALLBACK_ASSET = '/assets/party-recorder/pr-cs008ak-native-share-thumb-1000x800.png'
const internalDisplayPattern = /(PR\s+Seed|PR-BE-DB-LOGIN|IT-MOMENTS|DEBUG|openid|openId|unionId|signature)/i

const cleanDisplayName = (value?: string, fallback = '好友') => {
  const text = String(value || '').trim()
  if (!text || internalDisplayPattern.test(text)) {
    return fallback
  }
  return text
}

const getInitial = (name: string) => cleanDisplayName(name, '友').slice(0, 1) || '友'

const buildJoinStatusText = (joinedCount: number, playerCount: number) => {
  if (joinedCount > 0 && playerCount > 0) {
    return `${joinedCount}/${playerCount} 位好友已加入`
  }
  if (joinedCount > 0) {
    return `${joinedCount} 位好友已加入`
  }
  return '等待好友加入'
}

const buildAvatarSlots = (players: InviteSlotPlayer[] = [], playerCount = 0): InviteAvatarSlot[] => {
  const slotCount = Math.max(playerCount || players.length || 0, players.length)
  return Array.from({ length: slotCount }).map((_, index) => {
    const player = players[index]
    const name = cleanDisplayName(player?.name, player ? `好友 ${index + 1}` : '待加入')
    return {
      avatarUrl: player?.avatarUrl || '',
      filled: Boolean(player),
      id: player?.profileId || `invite-slot-${index + 1}`,
      initial: player ? getInitial(name) : '',
      name,
    }
  })
}

Page<InviteGroupState, InviteGroupMethods>({
  data: {
    avatarSlots: [],
    inviteCode: '',
    joinedCount: 0,
    playerCount: 0,
    shareCardImagePath: '',
    sessionId: '',
    sessionName: '',
    joinStatusText: '等待好友加入',
  },

  async onLoad(query) {
    const runtime = getSessionRuntime()
    const sessionId = typeof query?.sessionId === 'string' ? decodeURIComponent(query.sessionId) : runtime.sessionId || ''
    const profile = await ensureUserAuthorized(`/pages/invite-group/index${sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : ''}`)
    if (!profile) return

    try {
      await this.hydrateLiveSession(sessionId, runtime.inviteCode)
      enableSessionLeaveAlert()
    } catch {
      const playerCount = runtime.playerCount || 0
      const selectedPlayers = runtime.selectedPlayers || []
      this.setData({
        avatarSlots: buildAvatarSlots(selectedPlayers, playerCount),
        inviteCode: runtime.inviteCode || '',
        joinedCount: selectedPlayers.length,
        playerCount,
        sessionId,
        sessionName: runtime.sessionName || '',
        joinStatusText: buildJoinStatusText(selectedPlayers.length, playerCount),
      })
      void this.generateShareCardImage()
      if (sessionId || runtime.sessionId) {
        enableSessionLeaveAlert()
      }
    }
  },

  async hydrateLiveSession(sessionId, inviteCode = '') {
    const liveSession: ManagedLiveSession = await getManagedLiveSession(sessionId, inviteCode)
    const joinedPlayers = (liveSession.joinedPlayers.length ? liveSession.joinedPlayers : liveSession.joinStatusPlayers)
      .filter((item) => item.profileId || item.avatarUrl || item.name)
      .slice(0, liveSession.playerCount)
    setSessionRuntime({
      inviteCode: liveSession.inviteCode,
      playerCount: liveSession.playerCount,
      selectedPlayers: liveSession.joinStatusPlayers.length ? liveSession.joinStatusPlayers : joinedPlayers,
      sessionId: liveSession.id,
      sessionName: liveSession.sessionName,
      templateName: liveSession.templateName,
    })
    this.setData({
      avatarSlots: buildAvatarSlots(joinedPlayers, liveSession.playerCount),
      inviteCode: liveSession.inviteCode,
      joinedCount: liveSession.joinedCount,
      playerCount: liveSession.playerCount,
      sessionId: liveSession.id,
      sessionName: liveSession.sessionName,
      joinStatusText: buildJoinStatusText(liveSession.joinedCount, liveSession.playerCount),
    })
    void this.generateShareCardImage()
  },

  onUnload() {
    disableSessionLeaveAlert()
  },

  onShareAppMessage() {
    return {
      title: `${this.data.sessionName} 邀请你一起记录`,
      path: `/pages/index/index?inviteCode=${encodeURIComponent(this.data.inviteCode)}&sessionId=${encodeURIComponent(this.data.sessionId)}`,
      imageUrl: this.data.shareCardImagePath || SHARE_CARD_FALLBACK_ASSET,
    }
  },

  generateShareCardImage() {
    return new Promise<void>((resolve) => {
      const ctx = wx.createCanvasContext(SHARE_CARD_CANVAS_ID, this)
      const width = 500
      const height = 400
      const slots = this.data.avatarSlots.slice(0, Math.min(8, Math.max(1, this.data.playerCount || this.data.avatarSlots.length || 4)))
      const title = cleanDisplayName(this.data.sessionName, '聚会邀请')
      const statusText = this.data.joinStatusText || buildJoinStatusText(this.data.joinedCount, this.data.playerCount)

      try {
        ctx.drawImage(SHARE_CARD_FALLBACK_ASSET, 0, 0, width, height)
        ctx.setFillStyle('#2b1c16')
        ctx.setFontSize(28)
        ctx.setTextAlign('center')
        ctx.fillText(title, width / 2, 104)

        ctx.setFillStyle('#6d5748')
        ctx.setFontSize(18)
        ctx.fillText('邀请你加入这场聚会', width / 2, 136)

        ctx.setFillStyle('#1f2933')
        ctx.setFontSize(54)
        ctx.fillText(this.data.inviteCode || '生成中', width / 2, 212)

        ctx.setFillStyle('#6d5748')
        ctx.setFontSize(18)
        ctx.fillText(statusText, width / 2, 252)

        const slotSize = 34
        const gap = 10
        const totalWidth = slots.length * slotSize + Math.max(0, slots.length - 1) * gap
        let startX = Math.max(56, (width - totalWidth) / 2)
        if (startX + totalWidth > 410) {
          startX = 410 - totalWidth
        }
        const y = 292

        slots.forEach((slot, index) => {
          const x = startX + index * (slotSize + gap)
          ctx.beginPath()
          ctx.arc(x + slotSize / 2, y + slotSize / 2, slotSize / 2, 0, Math.PI * 2)
          ctx.setFillStyle(slot.filled ? '#e7f1ff' : '#f7f0e6')
          ctx.fill()
          ctx.setStrokeStyle(slot.filled ? '#5f9ee8' : '#d9c9b5')
          ctx.setLineWidth(1.5)
          ctx.stroke()

          ctx.setFillStyle(slot.filled ? '#2f80d8' : '#a58f78')
          ctx.setFontSize(slot.filled ? 17 : 20)
          ctx.setTextAlign('center')
          ctx.fillText(slot.filled ? slot.initial || '友' : '+', x + slotSize / 2, y + 23)
        })

        ctx.draw(false, () => {
          wx.canvasToTempFilePath({
            canvasId: SHARE_CARD_CANVAS_ID,
            destHeight: 800,
            destWidth: 1000,
            fail: () => {
              this.setData({ shareCardImagePath: '' })
              resolve()
            },
            height,
            success: (result) => {
              this.setData({ shareCardImagePath: result.tempFilePath || '' })
              resolve()
            },
            width,
          }, this)
        })
      } catch {
        this.setData({ shareCardImagePath: '' })
        resolve()
      }
    })
  },

  handleCopyTap() {
    if (!this.data.inviteCode) {
      wx.showToast({ title: '邀请码未生成', icon: 'none' })
      return
    }
    wx.setClipboardData({ data: this.data.inviteCode })
  },

  handlePreviewTap() {
    if (!this.data.sessionId) {
      wx.showToast({ title: '房间还未生成，请稍后再试', icon: 'none' })
      return
    }
    this.openPage(`/pages/share-preview/index?sessionId=${encodeURIComponent(this.data.sessionId)}&inviteCode=${encodeURIComponent(this.data.inviteCode)}`)
  },

  async handleRefreshTap() {
    const sessionId = this.data.sessionId || getSessionRuntime().sessionId || ''
    if (!sessionId) {
      wx.showToast({ title: '房间还未生成，请稍后再试', icon: 'none' })
      return
    }

    wx.showLoading({ title: '刷新中', mask: true })
    try {
      await this.hydrateLiveSession(sessionId, this.data.inviteCode || getSessionRuntime().inviteCode)
      wx.showToast({ title: '已刷新', icon: 'success' })
    } catch {
      wx.showToast({ title: '暂时无法刷新加入状态', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  async handleBackTap() {
    await confirmAndExitSession()
  },

  handleNextTap() {
    if (!this.data.sessionId) {
      wx.showToast({ title: '房间还未生成，请稍后再试', icon: 'none' })
      return
    }
    const url = `/pages/moment-editor/index?sessionId=${encodeURIComponent(this.data.sessionId)}&nodeType=opening`
    disableSessionLeaveAlert()
    wx.redirectTo({
      url,
      fail: () => {
        wx.reLaunch({ url })
      },
    })
  },

  openPage(url) {
    wx.navigateTo({ url, fail: () => wx.redirectTo({ url }) })
  },
})

export {}

