import { getSessionRuntime } from '../../utils/session'
import { getPublicHomeConfig } from '../../services/content'
import {
  ensureUserAuthorized,
  getCurrentProfile,
  getVisiblePokeThreads,
  ignorePokeThread,
  replyPokeThread,
} from '../../utils/social'

interface JudgeEntry {
  iconClass: string
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
  sessionMeta: string
  sessionName: string
  sessionTag: string
  templates: JudgeTemplate[]
}

interface JudgePageMethods {
  handleCreateTap: () => void
  handleEntryTap: (event: WechatMiniprogram.BaseEvent) => void
  handlePokeActionTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
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
    heroImageUrl: 'https://api.pomer.cn/static/party-hero.png',
    heroSubtitle: '远一点也能看清，开局、记分、出战报都更直接。',
    heroTitle: '酒桌判官',
    pokeCards: [],
    quickEntries: [
      { id: 'intro', name: '玩法介绍', iconClass: 'judge-icon-list', toneClass: '' },
      { id: 'history', name: '历史战报', iconClass: 'judge-icon-history', toneClass: 'judge-tile-blue' },
      { id: 'points', name: '积分活动', iconClass: 'judge-icon-trophy', toneClass: '' },
      { id: 'merchant', name: '合作商户', iconClass: 'judge-icon-store', toneClass: 'judge-tile-green' },
    ],
    sessionMeta: '今晚组局，不醉不归',
    sessionName: '进行中 #1',
    sessionTag: '4/6 人',
    templates: [
      { id: 'classic', name: '朋友局经典玩法', tag: '推荐', meta: '适合 4-8 人，开局快，酒桌气氛起得快' },
      { id: 'birthday', name: '生日局整活模板', tag: '热门', meta: '祝酒、点名、战报一套走完，桌上更热闹' },
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
    const [currentProfile, pokeThreads, homeConfig] = await Promise.all([
      getCurrentProfile(),
      getVisiblePokeThreads(),
      getPublicHomeConfig().catch(() => null),
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

    this.setData({
      heroImageUrl: homeConfig?.judge?.imageUrl || 'https://api.pomer.cn/static/party-hero.png',
      heroSubtitle: homeConfig?.judge?.subtitle || '远一点也能看清，开局、记分、出战报都更直接。',
      heroTitle: homeConfig?.judge?.title || '酒桌判官',
      pokeCards,
      sessionMeta: runtime.sessionName || '今晚组局，不醉不归',
      sessionName: runtime.startedAt ? '进行中 #1' : '待开局 #1',
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
    const routes: Record<string, string> = {
      玩法介绍: '/pages/compliance-guide/index',
      历史战报: '/pages/wine-history/index',
      积分活动: '/pages/wine-points/index',
      合作商户: '/pages/merchant-partners/index',
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
