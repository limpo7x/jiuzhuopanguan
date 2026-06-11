import {
  resolveToolId,
  type ToolCategoryCard,
  type ToolDescriptor,
} from '../../utils/toolkit'
import { getManagedToolsCatalog } from '../../services/operations'

interface CategoryViewItem {
  id: string
  name: string
  active: boolean
}

interface ToolsPageState {
  activeCategory: string
  allCategoryCards: ToolCategoryCard[]
  allPopularTools: ToolDescriptor[]
  allTools: ToolDescriptor[]
  categories: CategoryViewItem[]
  categoryCards: ToolCategoryCard[]
  filteredTools: ToolDescriptor[]
  heroImageUrl: string
  heroSubtitle: string
  heroTitle: string
  popularTools: ToolDescriptor[]
  activeCategoryName: string
  searchKeyword: string
}

interface ToolsPageMethods {
  applyFilters: () => void
  handleCategoryTap: (event: WechatMiniprogram.BaseEvent) => void
  handleSearchInput: (event: WechatMiniprogram.Input) => void
  handleSearchClear: () => void
  handleTabTap: (event: WechatMiniprogram.BaseEvent) => void
  handleToolTap: (event: WechatMiniprogram.BaseEvent) => void
  loadCatalog: () => Promise<void>
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
    allCategoryCards: [],
    allPopularTools: [],
    allTools: [],
    categories: [],
    categoryCards: [],
    filteredTools: [],
    heroImageUrl: '',
    heroSubtitle: '',
    heroTitle: '',
    popularTools: [],
    activeCategoryName: '',
    searchKeyword: '',
  },

  onLoad() {
    void this.loadCatalog()
  },

  onShow() {
    void this.loadCatalog()
  },

  async loadCatalog() {
    const catalog = await getManagedToolsCatalog()
    this.setData(
      {
        allCategoryCards: catalog.categoryCards,
        allPopularTools: catalog.popularTools,
        allTools: catalog.tools,
        categories: catalog.categories.map((item) => ({
          id: item.id,
          name: item.name,
          active: item.id === 'all',
        })),
        categoryCards: catalog.categoryCards,
        heroImageUrl: catalog.hero.imageUrl,
        heroSubtitle: catalog.hero.subtitle,
        heroTitle: catalog.hero.title,
        popularTools: catalog.popularTools,
      },
      () => {
        this.applyFilters()
      },
    )
  },

  applyFilters() {
    const { activeCategory, allCategoryCards, allPopularTools, allTools, categories, searchKeyword } = this.data
    const keyword = normalizeKeyword(searchKeyword)
    const sourceTools = allTools.length ? allTools : this.data.popularTools
    const sourcePopularTools = allPopularTools.length ? allPopularTools : sourceTools
    const sourceCards = allCategoryCards.length ? allCategoryCards : this.data.categoryCards
    const sourceCategories = categories.length ? categories : [{ id: 'all', name: '全部', active: true }]
    const activeCategoryName = sourceCategories.find((item) => item.id === activeCategory)?.name || '全部'
    const matchesKeyword = (text: string) => !keyword || text.toLowerCase().includes(keyword)

    const visibleCards = sourceCards.filter((card) => matchesKeyword(`${card.name} ${card.meta}`))

    const visiblePopularTools = sourcePopularTools.filter((tool) => matchesKeyword(`${tool.name} ${tool.meta}`))
    const filteredTools = sourceTools.filter((tool) => {
      const matchCategory = activeCategory === 'all' || tool.categoryId === activeCategory
      return matchCategory && matchesKeyword(`${tool.name} ${tool.meta}`)
    })

    this.setData({
      activeCategoryName,
      categories: sourceCategories.map((item) => ({
        id: item.id,
        name: item.name,
        active: item.id === activeCategory,
      })),
      categoryCards: visibleCards,
      filteredTools,
      popularTools: visiblePopularTools,
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

