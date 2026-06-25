import { getSessionRuntime } from '../../utils/session'
import { buildSessionReturnFromRuntime, EMPTY_SESSION_RETURN, openSessionReturn, type SessionReturnBarData } from '../../utils/session-return'
import {
  ensureUserAuthorized,
  getCurrentProfile,
  getVisiblePokeThreads,
  ignorePokeThread,
  replyPokeThread,
} from '../../utils/social'

interface JudgeEntry {
  iconClass: string
  iconUrl: string
  id: string
  name: string
  toneClass: string
}

interface JudgeTemplate {
  id: string
  meta: string
  name: string
  tag: string
}

interface JudgePokeCard {
  actionState: 'incoming' | 'matched' | 'outgoing'
  avatarUrl: string
  id: string
  message: string
  name: string
  statusLabel: string
}

interface JudgePageState {
  heroImageUrl: string
  heroSubtitle: string
  heroTitle: string
  pokeCards: JudgePokeCard[]
  quickEntries: JudgeEntry[]
  sessionReturn: SessionReturnBarData
  sessionMeta: string
  sessionName: string
  sessionTag: string
  templates: JudgeTemplate[]
}

interface JudgePageMethods {
  handleCreateTap: () => void
  handleEntryTap: (event: WechatMiniprogram.BaseEvent) => void
  handlePokeActionTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handleSessionReturnOpen: () => void
  handleTabTap: (event: WechatMiniprogram.BaseEvent) => void
  loadJudgeData: () => Promise<void>
  openPage: (url: string) => void
  showPreviewToast: (message: string) => void
}

const TAB_ROUTES: Record<string, string> = {
  album: '/pages/album/index',
  home: '/pages/index/index',
  tools: '/pages/tools/index',
  judge: '/pages/live-record/index',
  me: '/pages/me/index',
}

Page<JudgePageState, JudgePageMethods>({
  data: {
    heroImageUrl: '',
    heroSubtitle: '拍照记录和聚会账本并行，最后一起生成分享。',
    heroTitle: '记录这一刻',
    pokeCards: [],
    quickEntries: [
      { id: 'photo', name: '拍照记录', iconClass: 'judge-icon-list', iconUrl: '/assets/party-recorder-rebuild/icons-v3-imagegen/action-camera.png', toneClass: '' },
      { id: 'ledger', name: '聚会账本', iconClass: 'judge-icon-ledger', iconUrl: '/assets/party-recorder-rebuild/icons-v3-imagegen/service-points.png', toneClass: 'judge-tile-ledger' },
      { id: 'history', name: '历史相册', iconClass: 'judge-icon-history', iconUrl: '/assets/party-recorder-rebuild/icons-v3-imagegen/action-album.png', toneClass: 'judge-tile-blue' },
      { id: 'merchant', name: '分享记录', iconClass: 'judge-icon-store', iconUrl: '/assets/party-recorder-rebuild/icons-v3-imagegen/service-template.png', toneClass: 'judge-tile-green' },
    ],
    sessionReturn: EMPTY_SESSION_RETURN,
    sessionMeta: '还没有进行中的聚会时，可先创建并邀请好友。',
    sessionName: '最近聚会',
    sessionTag: '4/6 人',
    templates: [
      { id: 'classic', name: '朋友聚会记录', tag: '推荐', meta: '适合 4-8 人，创建后先拍第一张' },
      { id: 'birthday', name: '生日相册主题', tag: '热门', meta: '照片、祝福和分享图一套沉淀' },
    ],
  },

  async onLoad() {
    const profile = await ensureUserAuthorized('/pages/judge/index')
    if (!profile) {
      return
    }
    await this.loadJudgeData()
  },

  async onShow() {
    const profile = await ensureUserAuthorized('/pages/judge/index')
    if (!profile) {
      return
    }
    await this.loadJudgeData()
  },

  async loadJudgeData() {
    const runtime = getSessionRuntime()
    const [currentProfile, pokeThreads] = await Promise.all([
      getCurrentProfile(),
      getVisiblePokeThreads(),
    ])
    const pokeCards = pokeThreads.map((item) => {
      const isIncoming = item.receiverId === currentProfile.id
      const counterpart = isIncoming
        ? { name: item.senderName, avatarUrl: item.senderAvatarUrl }
        : { name: item.receiverName, avatarUrl: item.receiverAvatarUrl }

      if (item.status === 'matched') {
        return {
          id: item.id,
          avatarUrl: counterpart.avatarUrl,
          name: counterpart.name,
          message: `${counterpart.name} 已和你拍一拍成功，找时间再开一局。`,
          actionState: 'matched' as const,
          statusLabel: '已匹配',
        }
      }

      if (isIncoming) {
        return {
          id: item.id,
          avatarUrl: counterpart.avatarUrl,
          name: counterpart.name,
          message: '有人拍了拍你，可能正在等你一起组局。',
          actionState: 'incoming' as const,
          statusLabel: '',
        }
      }

      return {
        id: item.id,
        avatarUrl: counterpart.avatarUrl,
        name: counterpart.name,
        message: `你拍了拍 ${counterpart.name}，等 TA 回拍。`,
        actionState: 'outgoing' as const,
        statusLabel: '已发起',
      }
    })
    const joinedCount = Math.min(runtime.selectedPlayers.length || 0, runtime.playerCount || 0)
    const sessionName = runtime.sessionName || '最近聚会'

    this.setData({
      heroImageUrl: '',
      heroSubtitle: '拍照记录和聚会账本并行，最后一起生成分享。',
      heroTitle: '记录这一刻',
      pokeCards: pokeCards.slice(0, 3),
      sessionReturn: buildSessionReturnFromRuntime(runtime),
      sessionMeta: runtime.startedAt ? `${sessionName} 的照片和成员动态` : '还没有进行中的聚会时，可先创建并邀请好友。',
      sessionName: runtime.startedAt ? '记录中' : sessionName,
      sessionTag: `${joinedCount}/${runtime.playerCount} 人`,
    })
  },

  async handleCreateTap() {
    const profile = await ensureUserAuthorized('/pages/create-session/index')
    if (!profile) {
      return
    }
    wx.navigateTo({
      url: '/pages/create-session/index',
    })
  },

  handleEntryTap(event) {
    const { name } = event.currentTarget.dataset as { name: string }
    const runtime = getSessionRuntime()

    if (name === '拍照记录') {
      const sessionId = runtime.sessionId || ''
      this.openPage(sessionId ? `/pages/live-record/index?sessionId=${encodeURIComponent(sessionId)}` : '/pages/create-session/index')
      return
    }

    if (name === '聚会账本') {
      if (!runtime.sessionId) {
        this.showPreviewToast('先创建聚会，再打开聚会账本')
        this.openPage('/pages/create-session/index')
        return
      }
      this.openPage('/pages/ledger/index')
      return
    }

    const routes: Record<string, string> = {
      记录说明: '/pages/compliance-guide/index',
      历史相册: '/pages/album/index?mode=host',
      主题模板: '/pages/feature-zones/index?zone=templates',
      分享记录: '/pages/album/index?mode=shares',
    }
    const target = routes[name]

    if (target) {
      this.openPage(target)
      return
    }

    this.showPreviewToast(`${name} 下一步接入`)
  },

  handleSessionReturnOpen() {
    openSessionReturn(this.data.sessionReturn)
  },

  async handlePokeActionTap(event) {
    const { action, id } = event.currentTarget.dataset as { action: 'ignore' | 'reply'; id: string }

    if (action === 'ignore') {
      await ignorePokeThread(id)
      await this.loadJudgeData()
      return
    }

    if (action === 'reply') {
      await replyPokeThread(id)
      await this.loadJudgeData()
    }
  },

  handleTabTap(event) {
    const { tab } = event.currentTarget.dataset as { tab: string }
    const target = TAB_ROUTES[tab]

    if (!target || tab === 'judge') {
      return
    }

    wx.redirectTo({ url: target })
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
