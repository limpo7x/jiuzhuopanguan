interface GuideItem {
  iconClass: string
  meta: string
  title: string
}

interface ComplianceGuideState {
  items: GuideItem[]
}

interface ComplianceGuideMethods {
  handleConfirmTap: () => void
}

Page<ComplianceGuideState, ComplianceGuideMethods>({
  data: {
    items: [
      {
        iconClass: 'guide-icon-book',
        title: '本工具仅用于朋友聚会的互动娱乐',
        meta: '不鼓励、不强制任何人饮酒',
      },
      {
        iconClass: 'guide-icon-leaf',
        title: '请量力而行，理性饮酒',
        meta: '身体不适请停止饮酒',
      },
      {
        iconClass: 'guide-icon-home',
        title: '未成年人禁止饮酒',
        meta: '请勿向未成年人提供酒类',
      },
      {
        iconClass: 'guide-icon-group',
        title: '尊重他人，文明互动',
        meta: '友善玩梗，快乐就好',
      },
    ],
  },

  handleConfirmTap() {
    wx.navigateBack()
  },
})

export {}
