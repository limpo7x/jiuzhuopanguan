import { type HomePageData } from '../mock/home'
import { getApiBase } from '../config/api'
import { normalizeManagedAssetPath } from '../config/assets'
import { resolveCachedManagedImagePathQuick } from '../utils/imageCache'
import { getUserAuthHeaders } from '../utils/social'
import { getManagedToolsCatalog, isToolVisibleInPlacement, type ManagedToolCatalog } from './operations'
import type { RecentTool } from '../mock/home'

interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

interface HomeConfigResponse {
  hero?: {
    title?: string
    subtitle?: string
    imageUrl?: string
    imageUploadEndpoint?: string
    imageUpdateEndpoint?: string
  }
  quickTools?: Array<{
    id?: string
    name?: string
  }>
}

interface ComplianceResponse {
  copy?: string
}

interface UserProfileResponse {
  points?: number
}

interface ToolHistoryResponseItem {
  category?: string
  id?: string
  name?: string
  route?: string
  usedAt?: string
}

const HOME_CACHE_TTL = 45000
let homePageCache: { expiresAt: number; value: HomePageData } | null = null

const request = <T>(path: string): Promise<T> =>
  new Promise((resolve, reject) => {
    wx.request({
      url: `${getApiBase()}${path}`,
      header: getUserAuthHeaders(),
      timeout: 5000,
      success: (response) => {
        const payload = response.data as ApiResponse<T>
        if (response.statusCode >= 200 && response.statusCode < 300 && payload.code === 0) {
          resolve(payload.data)
          return
        }
        reject(new Error(payload.message || 'request failed'))
      },
      fail: reject,
    })
  })

const buildToolRoute = (id: string, name: string) => `/pages/tool-detail/index?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`

const mapCatalogToolToQuickTool = (tool: ManagedToolCatalog['tools'][number]) => ({
  id: tool.id,
  imageUrl: tool.imageUrl,
  name: tool.name,
  iconClass: tool.iconClass,
  route: buildToolRoute(tool.id, tool.name),
  toneClass: tool.toneClass,
})

const mapQuickTools = (quickTools: HomeConfigResponse['quickTools'] | undefined, catalog: ManagedToolCatalog) => {
  const tools = catalog.tools.filter((tool) => isToolVisibleInPlacement(tool, 'home'))
  const byId = new Map(tools.map((tool) => [tool.id, tool]))
  const configuredIds = (quickTools || []).map((tool) => String(tool.id || '').trim()).filter(Boolean)
  const selectedTools = configuredIds.length
    ? configuredIds.map((id) => byId.get(id)).filter((tool): tool is ManagedToolCatalog['tools'][number] => Boolean(tool))
    : tools
  return selectedTools.slice(0, 4).map(mapCatalogToolToQuickTool)
}

const formatUsedAt = (value?: string) => {
  if (!value) {
    return ''
  }
  const timestamp = Date.parse(value)
  if (!Number.isFinite(timestamp)) {
    return value
  }
  const diff = Date.now() - timestamp
  if (diff < 60 * 1000) return 'just now'
  if (diff < 60 * 60 * 1000) return `${Math.max(1, Math.floor(diff / 60000))} min ago`
  if (diff < 24 * 60 * 60 * 1000) return `${Math.max(1, Math.floor(diff / 3600000))} h ago`
  return `${Math.max(1, Math.floor(diff / 86400000))} d ago`
}

const mapRecentTools = (items: ToolHistoryResponseItem[] | undefined, catalog: ManagedToolCatalog) => {
  const tools = catalog.tools
  const byId = new Map(tools.map((tool) => [tool.id, tool]))
  const result: RecentTool[] = []
  ;(items || []).forEach((item) => {
    if (result.length >= 3) {
      return
    }
    const id = String(item.id || '').trim()
    const tool = byId.get(id)
    if (!tool) {
      return
    }
    result.push({
      id: tool.id,
      name: tool.name,
      usedAt: formatUsedAt(item.usedAt),
      imageUrl: tool.imageUrl,
      badgeText: catalog.categories.find((category) => category.id === tool.categoryId)?.name || '',
      badgeClass: '',
      route: buildToolRoute(tool.id, tool.name),
    })
  })
  return result
}

export const getHomePageData = async (): Promise<HomePageData> => {
  if (homePageCache && homePageCache.expiresAt > Date.now()) {
    return homePageCache.value
  }

  const [homeConfig, compliance, profile, toolHistory, toolsCatalog] = await Promise.all([
    request<HomeConfigResponse>('/config/home'),
    request<ComplianceResponse>('/config/compliance'),
    request<UserProfileResponse>('/user/profile'),
    request<ToolHistoryResponseItem[]>('/tools/history'),
    getManagedToolsCatalog(),
  ])

  const next: HomePageData = {
    points: typeof profile.points === 'number' ? profile.points : 0,
    searchPlaceholder: '',
    hero: {
      title: homeConfig.hero?.title || '',
      subtitle: homeConfig.hero?.subtitle || '',
      imageUrl: (await resolveCachedManagedImagePathQuick(normalizeManagedAssetPath(homeConfig.hero?.imageUrl), 800)) || '',
      shareTitle: homeConfig.hero?.title || '',
    },
    quickTools: mapQuickTools(homeConfig.quickTools, toolsCatalog),
    recentTools: mapRecentTools(toolHistory, toolsCatalog),
    complianceCopy: compliance.copy || '',
  }

  homePageCache = {
    expiresAt: Date.now() + HOME_CACHE_TTL,
    value: next,
  }

  return next
}
