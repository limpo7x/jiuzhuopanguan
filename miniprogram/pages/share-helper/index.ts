interface ShareHelperStep {
  done?: boolean
  title: string
}

interface ShareHelperState {
  actionLabel: string
  actionTitle: string
  homeOnBack: boolean
  primaryText: string
  primaryUrl: string
  sceneTitle: string
  steps: ShareHelperStep[]
  summary: string
}

interface ShareHelperMethods {
  handleBackTap: () => void
  handlePrimaryTap: () => void
}

const decodeText = (value?: string): string => {
  if (!value) {
    return ''
  }

  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const getSceneConfig = (scene: string, actionLabel: string) => {
  const configs: Record<
    string,
    {
      primaryText: string
      primaryUrl: string
      sceneTitle: string
      summary: string
      steps: ShareHelperStep[]
    }
  > = {
    invite: {
      sceneTitle: '邀请分享',
      summary: '邀请海报和口令已经准备好，适合直接发给好友或群聊。',
      primaryText: '继续等待大家加入',
      primaryUrl: '/pages/waiting-room/index',
      steps: [
        { title: '已生成邀请图', done: true },
        { title: `当前动作：${actionLabel}`, done: true },
        { title: '返回等待页查看加入状态' },
      ],
    },
    preview: {
      sceneTitle: '分享预览',
      summary: '当前海报适合保存到相册或继续发到好友、群聊和朋友圈素材链路里。',
      primaryText: '回到分享预览',
      primaryUrl: '/pages/share-preview/index',
      steps: [
        { title: '预览卡片内容', done: true },
        { title: `执行动作：${actionLabel}`, done: true },
        { title: '确认后继续分享' },
      ],
    },
    report: {
      sceneTitle: '战报分享',
      summary: '战报海报已经生成，可继续分享给好友或保存做复盘素材。',
      primaryText: '返回战报页',
      primaryUrl: '/pages/share-poster/index',
      steps: [
        { title: '战报海报已生成', done: true },
        { title: `执行动作：${actionLabel}`, done: true },
        { title: '继续传播或再次开局' },
      ],
    },
    restart: {
      sceneTitle: '再开一局分享',
      summary: '复用上次的气氛和模板，把老朋友重新叫回来更顺手。',
      primaryText: '回到再开一局',
      primaryUrl: '/pages/restart-state/index',
      steps: [
        { title: '选择复开场景', done: true },
        { title: `执行动作：${actionLabel}`, done: true },
        { title: '确认后继续开局' },
      ],
    },
  }

  return configs[scene] || configs.preview
}

Page<ShareHelperState, ShareHelperMethods>({
  data: {
    sceneTitle: '分享助手',
    actionTitle: '分享动作已就绪',
    actionLabel: '',
    homeOnBack: false,
    summary: '',
    primaryText: '返回上一页',
    primaryUrl: '/pages/index/index',
    steps: [],
  },

  onLoad(query) {
    const scene = decodeText(query?.scene) || 'preview'
    const actionLabel = decodeText(query?.label) || '保存图片'
    const config = getSceneConfig(scene, actionLabel)

    this.setData({
      sceneTitle: config.sceneTitle,
      actionTitle: `${actionLabel} 已准备`,
      actionLabel,
      homeOnBack: scene === 'report' || scene === 'restart',
      summary: config.summary,
      primaryText: config.primaryText,
      primaryUrl: config.primaryUrl,
      steps: config.steps,
    })
  },

  handlePrimaryTap() {
    wx.redirectTo({
      url: this.data.primaryUrl || '/pages/index/index',
    })
  },

  handleBackTap() {
    if (this.data.homeOnBack) {
      wx.reLaunch({
        url: '/pages/index/index',
      })
      return
    }

    wx.navigateBack({
      fail: () => {
        wx.redirectTo({
          url: this.data.primaryUrl || '/pages/index/index',
        })
      },
    })
  },
})

export {}
