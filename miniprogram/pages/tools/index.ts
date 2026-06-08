import {
  TOOL_CATEGORIES,
  TOOL_LIST,
  getToolCategoryCards,
  resolveToolId,
  type ToolCategoryCard,
  type ToolDescriptor,
} from '../../utils/toolkit'

interface CategoryViewItem {
  id: string
  name: string
  active: boolean
}

interface ToolsPageState {
  activeCategory: string
  categories: CategoryViewItem[]
  categoryCards: ToolCategoryCard[]
  popularTools: ToolDescriptor[]
  searchKeyword: string
}

interface ToolsPageMethods {
  applyFilters: () => void
  handleCategoryTap: (event: WechatMiniprogram.BaseEvent) => void
  handleSearchInput: (event: WechatMiniprogram.Input) => void
  handleSearchClear: () => void
  handleTabTap: (event: WechatMiniprogram.BaseEvent) => void
  handleToolTap: (event: WechatMiniprogram.BaseEvent) => void
  openPage: (url: string) => void
}

const TAB_ROUTES: Record<string, string> = {
  home: '/pages/index/index',
  tools: '/pages/tools/index',
  judge: '/pages/judge/index',
  me: '/pages/me/index',
}

const normalizeKeyword = (value: string) => value.trim().toLowerCase()

Page<ToolsPageState, ToolsPageMethods>({
  data: {
    activeCategory: 'all',
    categories: TOOL_CATEGORIES.map((item) => ({
      id: item.id,
      name: item.name,
      active: item.id === 'all',
    })),
    categoryCards: getToolCategoryCards(),
    popularTools: TOOL_LIST,
    searchKeyword: '',
  },

  onLoad() {
    this.applyFilters()
  },

  applyFilters() {
    const { activeCategory, searchKeyword } = this.data
    const keyword = normalizeKeyword(searchKeyword)

    const visibleTools = TOOL_LIST.filter((tool) => {
      const matchCategory = activeCategory === 'all' || tool.categoryId === activeCategory
      if (!matchCategory) {
        return false
      }

      if (!keyword) {
        return true
      }

      return `${tool.name} ${tool.meta}`.toLowerCase().includes(keyword)
    })

    const visibleCards = getToolCategoryCards().filter((card) => {
      if (activeCategory !== 'all' && card.id !== activeCategory) {
        return false
      }

      if (!keyword) {
        return true
      }

      return `${card.name} ${card.meta}`.toLowerCase().includes(keyword)
    })

    this.setData({
      categories: TOOL_CATEGORIES.map((item) => ({
        id: item.id,
        name: item.name,
        active: item.id === activeCategory,
      })),
      categoryCards: visibleCards,
      popularTools: visibleTools,
    })
  },

  handleCategoryTap(event) {
    const { id } = event.currentTarget.dataset as { id: string }
    if (!id || id === this.data.activeCategory) {
      return
    }

    this.setData(
      {
        activeCategory: id,
      },
      () => {
        this.applyFilters()
      },
    )
  },

  handleSearchInput(event) {
    this.setData(
      {
        searchKeyword: event.detail.value,
      },
      () => {
        this.applyFilters()
      },
    )
  },

  handleSearchClear() {
    this.setData(
      {
        searchKeyword: '',
      },
      () => {
        this.applyFilters()
      },
    )
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
    const toolId = resolveToolId(id)
    this.openPage(`/pages/tool-detail/index?id=${encodeURIComponent(toolId)}&name=${encodeURIComponent(name)}`)
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
