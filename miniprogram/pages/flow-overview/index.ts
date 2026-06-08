interface FlowStepItem {
  done: boolean
  meta: string
  title: string
}

interface FlowOverviewState {
  steps: FlowStepItem[]
}

interface FlowOverviewMethods {
  handleEnterTap: () => void
}

Page<FlowOverviewState, FlowOverviewMethods>({
  data: {
    steps: [
      { title: '创建酒局', meta: '填写基本信息，选择人数和模板', done: true },
      { title: '设置玩法', meta: '调整规则与强度，选择个性化选项', done: true },
      { title: '邀请好友', meta: '分享给好友，等待大家加入', done: true },
      { title: '等待开局', meta: '人齐自动开局，准备开始游戏', done: false },
      { title: '开始游戏', meta: '记录欠酒与整活，快乐进行中', done: false },
    ],
  },

  handleEnterTap() {
    wx.navigateTo({
      url: '/pages/live-record/index',
    })
  },
})

export {}
