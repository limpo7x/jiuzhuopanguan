import { staticAsset } from '../../config/assets'

interface HistoryFilter {
  active?: boolean
  name: string
}

interface HistorySession {
  done?: boolean
  id: string
  imageUrl: string
  meta: string
  name: string
  tag: string
}

interface WineHistoryState {
  filters: HistoryFilter[]
  sessions: HistorySession[]
}

interface WineHistoryMethods {
  handleCreateTap: () => void
  handleSessionTap: (event: WechatMiniprogram.BaseEvent) => void
}

Page<WineHistoryState, WineHistoryMethods>({
  data: {
    filters: [
      { name: '全部', active: true },
      { name: '进行中' },
      { name: '已结束' },
      { name: '失效' },
    ],
    sessions: [
      { id: 'report-1', name: '周五热场局', meta: '6人 · 多模板混合局 · 2024.05.20', tag: '已结束', done: true, imageUrl: staticAsset('report-poster.png') },
      { id: 'report-2', name: '同学会小聚', meta: '8人 · 经典复刻局 · 2024.05.18', tag: '已结束', done: true, imageUrl: staticAsset('party-hero.png') },
      { id: 'report-3', name: '生日快乐局', meta: '10人 · 整活大挑战 · 2024.05.12', tag: '已结束', done: true, imageUrl: staticAsset('beer-toast.png') },
      { id: 'invalid-1', name: '周六小酌局', meta: '5人 · 轻松聊天局 · 2024.05.11', tag: '已失效', imageUrl: staticAsset('toolbox-hero.png') },
    ],
  },

  handleSessionTap(event) {
    const { id } = event.currentTarget.dataset as { id: string }
    const url = id.indexOf('invalid') === 0 ? '/pages/invalid-state/index' : '/pages/result-report/index'

    wx.navigateTo({ url })
  },

  handleCreateTap() {
    wx.navigateTo({
      url: '/pages/create-session/index',
    })
  },
})

export {}
