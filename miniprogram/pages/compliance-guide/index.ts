interface GuideItem {
  iconUrl: string
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
        iconUrl: 'https://cdn.pomer.cn/static/party-pop-clean/icons/service-template.png',
        title: '本工具仅用于朋友聚会的互动娱乐',
        meta: '不鼓励、不强制任何人饮酒',
      },
      {
        iconUrl: 'https://cdn.pomer.cn/static/party-pop-clean/icons/service-benefit.png',
        title: '请量力而行，理性饮酒',
        meta: '身体不适请停止饮酒',
      },
      {
        iconUrl: 'https://cdn.pomer.cn/static/party-pop-clean/icons/service-history.png',
        title: '未成年人禁止饮酒',
        meta: '请勿向未成年人提供酒类',
      },
      {
        iconUrl: 'https://cdn.pomer.cn/static/party-pop-clean/icons/service-friends.png',
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
