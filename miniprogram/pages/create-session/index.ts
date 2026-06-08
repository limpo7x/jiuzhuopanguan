import { setSessionRuntime } from '../../utils/session'

interface NamePreset {
  name: string
  active?: boolean
}

interface TemplateItem {
  id: string
  name: string
  imageUrl: string
  active?: boolean
}

interface CreateSessionState {
  playerCount: number
  sessionName: string
  sessionNamePresets: NamePreset[]
  templates: TemplateItem[]
}

interface CreateSessionMethods {
  handleMoreTemplatesTap: () => void
  handleNextTap: () => void
  handlePlayerCountTap: (event: WechatMiniprogram.BaseEvent) => void
  handlePresetTap: (event: WechatMiniprogram.BaseEvent) => void
  handleTemplateTap: (event: WechatMiniprogram.BaseEvent) => void
}

Page<CreateSessionState, CreateSessionMethods>({
  data: {
    playerCount: 6,
    sessionName: '今晚聚会不醉不归',
    sessionNamePresets: [
      { name: '推荐', active: true },
      { name: '今晚什么局' },
      { name: '周五快乐局' },
      { name: '生日局' },
    ],
    templates: [
      { id: 'classic', name: '经典喝酒版', imageUrl: '/assets/home/party-hero.png', active: true },
      { id: 'report', name: '战报分享版', imageUrl: '/assets/home/report-poster.png' },
      { id: 'toolbox', name: '轻松整活版', imageUrl: '/assets/home/toolbox-hero.png' },
    ],
  },

  onLoad(query) {
    const templateName = query?.template

    if (!templateName) {
      return
    }

    const decodedName = decodeURIComponent(templateName)
    const templates = this.data.templates.map((item) => ({
      ...item,
      active: item.name === decodedName,
    }))

    this.setData({
      sessionName: `${decodedName}开局啦`,
      templates,
    })
  },

  handlePresetTap(event) {
    const { name } = event.currentTarget.dataset as { name: string }
    const sessionNamePresets = this.data.sessionNamePresets.map((item) => ({
      ...item,
      active: item.name === name,
    }))

    this.setData({
      sessionName: name === '推荐' ? '今晚聚会不醉不归' : name,
      sessionNamePresets,
    })
  },

  handlePlayerCountTap(event) {
    const { action } = event.currentTarget.dataset as { action: 'minus' | 'plus' }
    const offset = action === 'minus' ? -1 : 1
    const next = Math.max(2, Math.min(12, this.data.playerCount + offset))

    this.setData({
      playerCount: next,
    })
  },

  handleTemplateTap(event) {
    const { id } = event.currentTarget.dataset as { id: string }
    const templates = this.data.templates.map((item) => ({
      ...item,
      active: item.id === id,
    }))

    this.setData({ templates })
  },

  handleNextTap() {
    setSessionRuntime({
      isJudge: true,
      playerCount: this.data.playerCount,
      selectedPlayers: [],
      sessionName: this.data.sessionName,
      startedAt: 0,
    })

    wx.navigateTo({
      url: '/pages/session-rules/index',
    })
  },

  handleMoreTemplatesTap() {
    wx.navigateTo({
      url: '/pages/premium-templates/index',
    })
  },
})

export {}
