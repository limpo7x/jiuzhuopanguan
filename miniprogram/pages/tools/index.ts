import {
  getToolCategoryCards,
  resolveToolId,
  TOOL_CATEGORIES,
  TOOL_LIST,
  type ToolCategoryCard,
  type ToolDescriptor,
} from '../../utils/toolkit'
import { getManagedToolsCatalog, isToolVisibleInPlacement, recordManagedToolUsage } from '../../services/operations'

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
  judge: '/pages/ledger/index',
  me: '/pages/me/index',
}

const normalizeKeyword = (value: string) => value.trim().toLowerCase()

const buildPageFallbackCatalog = () => ({
  categories: TOOL_CATEGORIES,
  categoryCards: getToolCategoryCards(),
  popularTools: TOOL_LIST.filter((tool) => isToolVisibleInPlacement(tool, 'tools')).slice(0, 4),
  tools: TOOL_LIST,
})

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
    const fallbackCatalog = catalog.tools.length ? null : buildPageFallbackCatalog()
    const categories = fallbackCatalog?.categories || catalog.categories
    const categoryCards = fallbackCatalog?.categoryCards || catalog.categoryCards
    const popularTools = fallbackCatalog?.popularTools || catalog.popularTools
    const tools = fallbackCatalog?.tools || catalog.tools
    this.setData(
      {
        allCategoryCards: categoryCards,
        allPopularTools: popularTools,
        allTools: tools,
        categories: categories.map((item) => ({
          id: item.id,
          name: item.name,
          active: item.id === 'all',
        })),
        categoryCards,
        heroImageUrl: catalog.hero.imageUrl,
        heroSubtitle: catalog.hero.subtitle,
        heroTitle: catalog.hero.title,
        popularTools,
      },
      () => {
        this.applyFilters()
      },
    )
  },

  applyFilters() {
    const { activeCategory, allCategoryCards, allPopularTools, allTools, categories, searchKeyword } = this.data
    const keyword = normalizeKeyword(searchKeyword)
    const sourceTools = (allTools.length ? allTools : this.data.popularTools).filter((tool) => isToolVisibleInPlacement(tool, 'tools'))
    const sourcePopularTools = (allPopularTools.length ? allPopularTools : sourceTools).filter((tool) => isToolVisibleInPlacement(tool, 'tools'))
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

    const collapsedCards = keyword ? visibleCards : visibleCards.slice(0, 3)
    const collapsedPopularTools = keyword ? visiblePopularTools : visiblePopularTools.slice(0, 4)
    const collapsedFilteredTools = keyword || activeCategory !== 'all' ? filteredTools.slice(0, 6) : filteredTools.slice(0, 5)

    this.setData({
      activeCategoryName,
      categories: sourceCategories.map((item) => ({
        id: item.id,
        name: item.name,
        active: item.id === activeCategory,
      })),
      categoryCards: collapsedCards,
      filteredTools: collapsedFilteredTools,
      popularTools: collapsedPopularTools,
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
    void recordManagedToolUsage(toolId)
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

