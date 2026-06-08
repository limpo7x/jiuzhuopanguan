interface QuestionItem {
  active?: boolean
  tag: string
  text: string
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
    questions: [
      { tag: '轻松', text: '说出通讯录里最久没联系的人是谁', active: true },
      { tag: '热场', text: '模仿群里最会发语音的那个人 10 秒' },
      { tag: '整活', text: '把最近一张自拍给大家打分并解释理由' },
      { tag: '搞笑', text: '用播音腔朗读最近一条外卖备注' },
    ],
  },

  handleSelectTap(event) {
    const { text } = event.currentTarget.dataset as { text: string }
    const questions = this.data.questions.map((item) => ({
      ...item,
      active: item.text === text,
    }))

    this.setData({ questions })
  },

  handleUseTap() {
    const current = this.data.questions.find((item) => item.active) || this.data.questions[0]
    const url = `/pages/judge-wheel/index?task=${encodeURIComponent(current.text)}`

    wx.redirectTo({ url })
  },
})

export {}
