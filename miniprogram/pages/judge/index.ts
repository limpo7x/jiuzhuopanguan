import { getSessionRuntime } from '../../utils/session'
import {
  ensureUserAuthorized,
  getCurrentProfile,
  getVisiblePokeThreads,
  ignorePokeThread,
  replyPokeThread,
} from '../../utils/social'

interface JudgeEntry {
  id: string
  name: string
  iconClass: string
  toneClass: string
}

interface JudgeTemplate {
  id: string
  name: string
  tag: string
  meta: string
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
  pokeCards: JudgePokeCard[]
  quickEntries: JudgeEntry[]
  sessionMeta: string
  sessionName: string
  sessionTag: string
  templates: JudgeTemplate[]
}

interface JudgePageMethods {
  handleCreateTap: () => void
  handleEntryTap: (event: WechatMiniprogram.BaseEvent) => void
  handlePokeActionTap: (event: WechatMiniprogram.BaseEvent) => void
  handleTabTap: (event: WechatMiniprogram.BaseEvent) => void
  loadJudgeData: () => Promise<void>
  openPage: (url: string) => void
  showPreviewToast: (message: string) => void
}

const TAB_ROUTES: Record<string, string> = {
  home: '/pages/index/index',
  tools: '/pages/tools/index',
  judge: '/pages/judge/index',
  me: '/pages/me/index',
}

Page<JudgePageState, JudgePageMethods>({
  data: {
    pokeCards: [],
    quickEntries: [
      { id: 'intro', name: '玩法介绍', iconClass: 'judge-icon-list', toneClass: '' },
      { id: 'history', name: '历史战报', iconClass: 'judge-icon-history', toneClass: 'judge-tile-blue' },
      { id: 'points', name: '积分活动', iconClass: 'judge-icon-trophy', toneClass: '' },
      { id: 'merchant', name: '合作商户', iconClass: 'judge-icon-store', toneClass: 'judge-tile-green' },
    ],
    sessionMeta: '今晚局局不醉不归',
    sessionName: '进行中 #1',
    sessionTag: '4/6人',
    templates: [
      { id: 'classic', name: '朋友局经典玩法', tag: '推荐', meta: '适合 4-8 人 · 快速热场' },
      { id: 'birthday', name: '生日局整活模板', tag: '热门', meta: '祝酒、点名、战报一套走完' },
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
    const currentProfile = await getCurrentProfile()
    const pokeCards = (await getVisiblePokeThreads()).map((item) => {
      const isIncoming = item.receiverId === currentProfile.id
      const counterpart = isIncoming
        ? { name: item.senderName, avatarUrl: item.senderAvatarUrl }
        : { name: item.receiverName, avatarUrl: item.receiverAvatarUrl }

      if (item.status === 'matched') {
        return {
          id: item.id,
          avatarUrl: counterpart.avatarUrl,
          name: counterpart.name,
          message: `${counterpart.name} 和你已经合拍了，找时间再开一局。`,
          actionState: 'matched' as const,
          statusLabel: '已合拍',
        }
      }

      if (isIncoming) {
        return {
          id: item.id,
          avatarUrl: counterpart.avatarUrl,
          name: counterpart.name,
          message: '有人拍了拍你，他可能想和你增进感情了。',
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
        statusLabel: '已拍过',
      }
    })
    const joinedCount = Math.min(runtime.selectedPlayers.length || 0, runtime.playerCount || 0)

    this.setData({
      pokeCards,
      sessionMeta: runtime.sessionName,
      sessionName: runtime.startedAt ? '进行中 #1' : '待开局 #1',
      sessionTag: `${joinedCount}/${runtime.playerCount}人`,
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
    const routes: Record<string, string> = {
      '玩法介绍': '/pages/compliance-guide/index',
      '历史战报': '/pages/wine-history/index',
      '积分活动': '/pages/wine-points/index',
      '合作商户': '/pages/merchant-partners/index',
    }
    const target = routes[name]

    if (target) {
      this.openPage(target)
      return
    }

    this.showPreviewToast(`${name} 下一步接入`)
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
