type MomentCardNode = {
  completionStatus?: string
  isTimelinePlaceholder?: boolean
  nodeKind?: string
  nodeType?: string
  rankingEligible?: boolean
  reviewStatus?: string
  rewardEligible?: boolean
  secondaryReviewStatus?: string
}

const NODE_TYPE_TEXT: Record<string, string> = {
  closing: '收尾',
  drinking: '账本',
  highlight: '精彩',
  opening: '开场',
  private: '私密',
}

const getStatusText = (node: MomentCardNode) => {
  if (node.nodeKind === 'event') {
    return ''
  }
  if (node.isTimelinePlaceholder) {
    return '私密占位'
  }
  if (node.rankingEligible) {
    return '可推举'
  }
  if (node.rewardEligible) {
    return '可奖励'
  }
  return ''
}

Component({
  data: {
    imageBroken: false,
    displayStatusText: '',
    displayTypeText: '精彩',
  },
  observers: {
    node() {
      this.refreshDisplay()
    },
  },
  properties: {
    compact: {
      type: Boolean,
      value: false,
    },
    node: {
      type: Object,
      value: {},
    },
  },
  lifetimes: {
    attached() {
      this.refreshDisplay()
    },
  },
  methods: {
    refreshDisplay() {
      const node = (this.data.node || {}) as MomentCardNode
      this.setData({
        imageBroken: false,
        displayStatusText: getStatusText(node),
        displayTypeText: node.nodeKind === 'event' ? '事件' : NODE_TYPE_TEXT[node.nodeType || ''] || node.nodeType || '精彩',
      })
    },

    handleImageLoad(event: WechatMiniprogram.BaseEvent) {
      const detail = (event as unknown as { detail?: { height?: number; width?: number } }).detail || {}
      if (Number(detail.width) < 8 || Number(detail.height) < 8) {
        this.setData({ imageBroken: true })
      }
    },

    handleImageError() {
      this.setData({ imageBroken: true })
    },

    handleTap(event: WechatMiniprogram.BaseEvent) {
      const { id, nodeKind } = event.currentTarget.dataset as {
        id?: string
        nodeKind?: string
      }
      this.triggerEvent('select', {
        id: id || '',
        nodeKind: nodeKind || '',
      })
    },
  },
})

export {}
