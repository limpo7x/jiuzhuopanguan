import { getManagedQuestionBank } from '../../services/operations'

interface QuestionItem {
  active?: boolean
  id: string
  tag: string
  template: string
  text: string
  type?: string
}

interface QuestionBankState {
  questions: QuestionItem[]
}

interface QuestionBankMethods {
  handleSelectTap: (event: WechatMiniprogram.BaseEvent) => void
  handleUseTap: () => void
}

Page<QuestionBankState, QuestionBankMethods>({
  data: {
    questions: [],
  },

  async onLoad() {
    try {
      const questions = await getManagedQuestionBank()
      this.setData({
        questions: questions.map((item, index) => ({
          ...item,
          active: index === 0,
        })),
      })
    } catch (error) {
      wx.showToast({
        title: error instanceof Error ? error.message : '题库加载失败',
        icon: 'none',
      })
    }
  },

  handleSelectTap(event) {
    const { id } = event.currentTarget.dataset as { id: string }
    const questions = this.data.questions.map((item) => ({
      ...item,
      active: item.id === id,
    }))

    this.setData({ questions })
  },

  handleUseTap() {
    const current = this.data.questions.find((item) => item.active) || this.data.questions[0]
    if (!current?.text) {
      wx.showToast({
        title: '当前没有可用题目',
        icon: 'none',
      })
      return
    }

    const type = current.type ? `&type=${encodeURIComponent(current.type)}` : ''
    const url = `/pages/judge-wheel/index?task=${encodeURIComponent(current.text)}${type}`

    wx.redirectTo({ url })
  },
})

export {}
