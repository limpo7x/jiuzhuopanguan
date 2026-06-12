import { ensureUserAuthorized } from '../../utils/social'

interface SelectItem {
  name: string
  active?: boolean
}

interface SessionRulesState {
  penaltyEnabled: boolean
  taskCount: number
  roundRules: SelectItem[]
  penaltyRules: SelectItem[]
  penaltyLevels: SelectItem[]
}

interface SessionRulesMethods {
  handleChipTap: (event: WechatMiniprogram.BaseEvent) => void
  handleNextTap: () => void
  handlePenaltyToggle: () => void
  handleTaskCountTap: (event: WechatMiniprogram.BaseEvent) => void
}

Page<SessionRulesState, SessionRulesMethods>({
  data: {
    penaltyEnabled: true,
    taskCount: 3,
    roundRules: [
      { name: '记总欠酒', active: true },
      { name: '随机点名' },
      { name: '整活任务' },
    ],
    penaltyRules: [
      { name: '按杯数', active: true },
      { name: '按回合' },
      { name: '自由记录' },
    ],
    penaltyLevels: [
      { name: '温和' },
      { name: '适中', active: true },
      { name: '刺激' },
    ],
  },

  async onLoad() {
    const profile = await ensureUserAuthorized('/pages/session-rules/index')
    if (!profile) return
  },

  async onShow() {
    const profile = await ensureUserAuthorized('/pages/session-rules/index')
    if (!profile) return
  },

  handleChipTap(event) {
    const { group, name } = event.currentTarget.dataset as {
      group: 'roundRules' | 'penaltyRules' | 'penaltyLevels'
      name: string
    }
    const list = this.data[group].map((item) => ({
      ...item,
      active: item.name === name,
    }))

    this.setData({
      [group]: list,
    } as WechatMiniprogram.IAnyObject)
  },

  handleTaskCountTap(event) {
    const { action } = event.currentTarget.dataset as { action: 'minus' | 'plus' }
    const offset = action === 'minus' ? -1 : 1
    const next = Math.max(1, Math.min(8, this.data.taskCount + offset))

    this.setData({
      taskCount: next,
    })
  },

  handlePenaltyToggle() {
    this.setData({
      penaltyEnabled: !this.data.penaltyEnabled,
    })
  },

  handleNextTap() {
    wx.redirectTo({
      url: '/pages/add-players/index',
      fail: () => {
        wx.reLaunch({ url: '/pages/add-players/index' })
      },
    })
  },
})

export {}
