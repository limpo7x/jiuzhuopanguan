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
      { title: '创建聚会', meta: '填写基本信息，选择人数和主题', done: true },
      { title: '聚会设置', meta: '确认人数、主题和可见范围', done: true },
      { title: '邀请好友', meta: '分享给好友，等待大家加入', done: true },
      { title: '等待首拍', meta: '成员加入后拍下第一张照片', done: false },
      { title: '开始记录', meta: '照片和账本进入时间线', done: false },
    ],
  },

  handleEnterTap() {
    wx.redirectTo({
      url: '/pages/live-record/index',
      fail: () => {
        wx.reLaunch({ url: '/pages/live-record/index' })
      },
    })
  },
})

export {}
