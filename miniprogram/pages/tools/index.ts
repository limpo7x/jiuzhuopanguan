interface Category {
  id: string
  name: string
  active?: boolean
}

interface ToolItem {
  id: string
  name: string
  iconClass: string
  toneClass: string
}

interface ToolCategory {
  id: string
  name: string
  meta: string
  imageUrl: string
}

interface ToolsPageState {
  categories: Category[]
  popularTools: ToolItem[]
  toolCategories: ToolCategory[]
}

interface ToolsPageMethods {
  handleTabTap: (event: WechatMiniprogram.BaseEvent) => void
  handleToolTap: (event: WechatMiniprogram.BaseEvent) => void
  openPage: (url: string) => void
  showPreviewToast: (message: string) => void
}

const TAB_ROUTES: Record<string, string> = {
  home: '/pages/index/index',
  tools: '/pages/tools/index',
  judge: '/pages/judge/index',
  me: '/pages/me/index',
}

Page<ToolsPageState, ToolsPageMethods>({
  data: {
    categories: [
      { id: 'all', name: '全部', active: true },
      { id: 'image', name: '图片处理' },
      { id: 'dev', name: '开发工具' },
      { id: 'calc', name: '计算工具' },
    ],
    popularTools: [
      { id: 'image-compress', name: '图片压缩', iconClass: 'tools-icon-compress', toneClass: '' },
      { id: 'nine-grid', name: '九宫格切图', iconClass: 'tools-icon-grid', toneClass: 'tools-tile-blue' },
      { id: 'watermark', name: '图片去水印', iconClass: 'tools-icon-eraser', toneClass: '' },
      { id: 'qr-code', name: '二维码生成', iconClass: 'tools-icon-qr', toneClass: '' },
      { id: 'json', name: 'JSON格式化', iconClass: 'tools-icon-code', toneClass: 'tools-tile-blue' },
      { id: 'loan', name: '房贷计算', iconClass: 'tools-icon-home', toneClass: '' },
      { id: 'currency', name: '汇率换算', iconClass: 'tools-icon-currency', toneClass: 'tools-tile-green' },
      { id: 'unit', name: '单位换算', iconClass: 'tools-icon-scale', toneClass: 'tools-tile-green' },
    ],
    toolCategories: [
      {
        id: 'image',
        name: '图片处理',
        meta: '压缩、裁剪、格式转换 · 12个工具',
        imageUrl: '/assets/home/image-process-hero.png',
      },
      {
        id: 'dev',
        name: '开发工具',
        meta: 'JSON、加解密、正则助手 · 16个工具',
        imageUrl: '/assets/home/toolbox-hero.png',
      },
    ],
  },

  handleTabTap(event) {
    const { tab } = event.currentTarget.dataset as { tab: string }
    const target = TAB_ROUTES[tab]

    if (!target || tab === 'tools') {
      return
    }

    wx.redirectTo({ url: target })
  },

  handleToolTap(event) {
    const { id, name } = event.currentTarget.dataset as { id: string; name: string }
    this.openPage(`/pages/tool-detail/index?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`)
  },

  showPreviewToast(message) {
    wx.showToast({
      title: message,
      icon: 'none',
    })
  },

  openPage(url) {
    wx.navigateTo({
      url,
      fail: () => {
        wx.redirectTo({ url })
      },
    })
  },
})

export {}
